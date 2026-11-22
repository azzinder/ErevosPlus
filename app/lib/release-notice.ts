// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { fromBase64, utf8Decode, utf8Encode } from './crypto';
import { canVerify, verifySignature } from './core';
import { httpFor } from './net-http';
import { hostOf } from './relay-host';
import { secureGet, secureSet } from './secure';
import { channelOf, channelsOf, loadChannel, wireOf, type Channel, type ChannelName } from './update-channel';
import { RELEASE_KEY, readChannelStatement } from './update-signature';
import { VERSION_NAME } from './version-name';
import { START_RELAY } from './welcome';

// A new Erevos told as a message from Erevos itself: at the top of the chats, and in a notice, so
// no one has to look for it. Once a day the phone asks the server the release computer publishes
// to (beside the web app, pwa/release.mjs) what its latest release is: android-update.json, which
// says its build, and release.json with release.sig, which say its name. Both are signed with the
// release key, kept offline on the release computer (lib/update-signature.ts), so the server alone
// can tell of no release, and one is told only once the release computer signed it, when Updates
// can install it. GitHub is never asked by itself: that would tell it, every day, which devices have
// Erevos. This server is LPHL's, which runs the relay too: it is asked only by a space whose relay is
// LPHL's, and whose requests to it do not all go through Tor, so it learns nothing it did not know
// already. Any other space asks nothing, and the owner can turn the notice off (Updates).
//
// Updates has a Tor switch of its own, off unless turned on, kept here (`tor`), for the notice and
// for Check for updates (app/updates.tsx): with it on the server is asked only through Tor, which
// is started for it whatever the space's Tor way, and never straight should Tor fail; so a space
// that sends everything through Tor may ask too, as the server then sees neither the phone's
// address nor more than that someone asked.

/** Where the release computer publishes, as STATEMENT_URL. */
export const NOTICE_SERVER = 'https://erevos-web.lphl.nekten.eu/';
/** How often the server is asked, at most. */
export const NOTICE_EVERY = 24 * 3600_000;

const KEY = 'erevos.release-notice';
const STATEMENT = /^erevos android update v1\nbuild ([1-9]\d*)\nsha256 [0-9a-f]{64}\n$/;

/** What is kept: whether the notice is on, when the server was last asked (ms), and the newest release it told of, and whether that was opened; `tor`, whether updates go only through Tor, left out while they do not. */
export type Kept = { on: boolean; at: number; build: number; name: string; seen: boolean; tor?: boolean };
const NONE: Kept = { on: true, at: 0, build: 0, name: '', seen: true };

/** A release, as the server says it, signed. */
export type Told = { build: number; name: string };

function checked(text: string | null): Kept {
  try {
    const v = JSON.parse(text ?? '') as Partial<Record<keyof Kept, unknown>>;
    return {
      on: v.on !== false,
      at: typeof v.at === 'number' && Number.isFinite(v.at) && v.at >= 0 ? v.at : 0,
      build: typeof v.build === 'number' && Number.isInteger(v.build) && v.build > 0 ? v.build : 0,
      name: typeof v.name === 'string' && VERSION_NAME.test(v.name) ? v.name : '',
      seen: v.seen !== false,
      ...(v.tor === true ? { tor: true } : {}),
    };
  } catch {
    return NONE;
  }
}

export async function loadNotice(): Promise<Kept> {
  return checked(await secureGet(KEY).catch(() => null));
}

const listeners = new Set<() => void>();

async function save(next: Kept): Promise<void> {
  await secureSet(KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

/** Has `listener` called each time what is kept changes. Returns how to stop. */
export function onNotice(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Turns the notice on or off. */
export async function setNoticeOn(on: boolean): Promise<void> {
  await save({ ...(await loadNotice()), on });
}

/** Sends what Updates asks only through Tor from now on, or as before. */
export async function setUpdatesTor(on: boolean): Promise<void> {
  const { tor: _was, ...kept } = await loadNotice();
  await save(on ? { ...kept, tor: true } : kept);
}

/** Another channel was chosen (lib/update-channel.ts): the server is asked again soon, and what it told of before is forgotten. */
export async function noticeAnew(): Promise<void> {
  await save({ ...(await loadNotice()), at: 0, build: 0, name: '', seen: true });
}

/** The release told of was opened: it no longer counts as unread. */
export async function noticeSeen(): Promise<void> {
  const kept = await loadNotice();
  if (!kept.seen) await save({ ...kept, seen: true });
}

/** Whether a space with this relay and Tor way may ask the server: its relay is LPHL's, and not everything goes through Tor, unless Updates' own Tor switch is on (`ownTor`), when it is asked through Tor too. */
export function mayAsk({ url, tor }: { url: string; tor: string }, ownTor = false): boolean {
  const host = hostOf(url.trim());
  return !!host && host === hostOf(START_RELAY) && (tor !== 'all' || ownTor);
}

/**
 * The release the server's files say, when both are signed with `key` and say a build and a name:
 * android-update.json (`statement`), release.json (`body`, its bytes) and release.sig (`sig`).
 * Null for anything else.
 */
export async function toldBy(statement: string, body: Uint8Array, sig: string, key = RELEASE_KEY): Promise<Told | null> {
  if (!canVerify()) return null;
  let s: { statement?: unknown; signature?: unknown };
  let release: { label?: unknown };
  try {
    s = JSON.parse(statement) as typeof s;
    release = JSON.parse(utf8Decode(body)) as typeof release;
  } catch {
    return null;
  }
  if (typeof s?.statement !== 'string' || typeof s.signature !== 'string' || typeof release?.label !== 'string') return null;
  const build = STATEMENT.exec(s.statement)?.[1];
  if (!build || !VERSION_NAME.test(release.label)) return null;
  const public_ = fromBase64(key);
  const signed = (bytes: Uint8Array, signature: string) => {
    let raw: Uint8Array;
    try {
      raw = fromBase64(signature.trim());
    } catch {
      return Promise.resolve(false);
    }
    return raw.length === 64 ? verifySignature(public_, bytes, raw) : Promise.resolve(false);
  };
  if (!(await signed(utf8Encode(s.statement), s.signature)) || !(await signed(body, sig))) return null;
  return { build: Number(build), name: release.label };
}

/** How a file of the server is fetched: its status and its bytes. */
export type NoticeGet = (url: string) => Promise<{ status: number; bytes: Uint8Array }>;

// The server's files are small: a few hundred bytes each.
const MOST_FILE = 64 * 1024;

/** Straight, through `fetchImpl`, as the server was always asked. */
export const straightGet =
  (fetchImpl: typeof fetch = fetch): NoticeGet =>
  async (url) => {
    const res = await fetchImpl(url, { headers: { 'Cache-Control': 'no-cache' } });
    return { status: res.status, bytes: res.ok ? new Uint8Array(await res.arrayBuffer()) : new Uint8Array(0) };
  };

/** Only through Tor (lib/net-http.ts httpFor), as Updates' own Tor switch asks. */
export const torGet: NoticeGet = (url) => httpFor(true)('GET', url, { 'Cache-Control': 'no-cache' }, undefined, MOST_FILE);

async function fetched(get: NoticeGet, name: string): Promise<Uint8Array> {
  const { status, bytes } = await get(`${NOTICE_SERVER}${name}`);
  if (status < 200 || status >= 300) throw new Error(`${name}: ${status}`);
  return bytes;
}

/**
 * The latest release the server says, fetched with `get`, when its files are signed with `key`
 * (toldBy); null when they are not. Throws when the server cannot be asked. Check for updates asks
 * it so through Tor (app/updates.tsx), as GitHub's answers through Tor send it on elsewhere.
 */
export async function latestTold(get: NoticeGet, key = RELEASE_KEY): Promise<Told | null> {
  const [statement, body, sig] = await Promise.all([fetched(get, 'android-update.json'), fetched(get, 'release.json'), fetched(get, 'release.sig')]);
  return toldBy(utf8Decode(statement), body, utf8Decode(sig), key);
}

/**
 * The newest release of `channel` (lib/update-channel.ts) the server says, fetched with `get`: from
 * each of its channels' statements (android-update-<channel>.json), signed with `key` and naming
 * that channel. For Erevos's own channel, while the server has no statement of it yet, as before
 * (latestTold). Null when none is signed. Throws when the server cannot be asked.
 */
export async function latestToldIn(get: NoticeGet, channel: Channel, key = RELEASE_KEY): Promise<Told | null> {
  let newest: Told | null = null;
  for (const name of channelsOf(channel)) {
    const told = await toldIn(get, name, key);
    if (told && (!newest || told.build > newest.build)) newest = told;
  }
  return newest;
}

async function toldIn(get: NoticeGet, name: ChannelName, key: string): Promise<Told | null> {
  const wire = wireOf(name);
  const { status, bytes } = await get(`${NOTICE_SERVER}android-update-${wire}.json`);
  if (status === 404) return name === 'erevos' ? latestTold(get, key) : null;
  if (status < 200 || status >= 300) throw new Error(`android-update-${wire}.json: ${status}`);
  const read = await readChannelStatement(utf8Decode(bytes), key);
  return read && read.channel === wire && VERSION_NAME.test(read.name) ? { build: read.build, name: read.name } : null;
}

/** The channel Updates offers now, as chosen there, else as this app is (`version`). */
export async function channelNow(version: string): Promise<Channel> {
  return channelOf(await loadChannel(), version);
}

/**
 * Asks the server once a day, while the notice is on and the space may ask (mayAsk), and keeps the
 * release it tells of when it is newer than this app (`current`, its build) and than the one told
 * before. Straight through `fetchImpl`, or only through Tor with Updates' own Tor switch on. Says
 * that release, to be told now, or null. Throws when the server cannot be asked.
 */
export async function lookForRelease(
  space: { url: string; tor: string },
  current: number,
  now = Date.now(),
  fetchImpl: typeof fetch = fetch,
  key = RELEASE_KEY,
  channel: Channel = { edition: 'erevos', beta: false },
): Promise<Told | null> {
  const kept = await loadNotice();
  const tor = kept.tor === true;
  if (!kept.on || !mayAsk(space, tor) || now - kept.at < NOTICE_EVERY) return null;
  await save({ ...kept, at: now });
  const told = await latestToldIn(tor ? torGet : straightGet(fetchImpl), channel, key);
  if (!told || told.build <= current || told.build <= kept.build) return null;
  await save({ ...(await loadNotice()), build: told.build, name: told.name, seen: false });
  return told;
}

/** The release to show at the top of the chats: told of, and newer than this app. */
export function shownRelease(kept: Kept, current: number): Told | null {
  return kept.on && kept.build > current && kept.name ? { build: kept.build, name: kept.name } : null;
}
