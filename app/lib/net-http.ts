// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { canTorHttp, torHttp } from './core';
import { t } from './i18n';
import { streamingFetch } from './net-fetch';
import { throughTor, torFor, torForChat } from './relay';
import { accountNeverStraight, accountThroughTor, type AccountTor } from './account-tor';
import { ensureTor } from './tor';

// HTTPS for the other networks' files (lib/nostr-files.ts, lib/xmpp-files.ts), the relay's Matrix
// push gateway (lib/matrix-push.ts) and backups to a server (lib/backup-cloud.ts): through Tor as
// the space's Tor way says, as their chats go. What has a Tor switch of its own (httpFor) goes
// only through Tor while it is on, whatever the way.
// With Messages, straight while Tor is not ready or when it fails; with Everything, only through
// Tor. In the web app and on a computer, straight.
//
// No answer is taken whole into memory unweighed: a contact picks a file's address, and a server
// that answered without end would fill the phone's memory. Each request takes at most `most`
// bytes, HTTP_MOST unless the caller asks for less. Straight, a length the server says that is too
// large stops it before anything is read, and the answer is read as a stream that stops as soon as
// it passes `most` (also with no length, in chunks). GETs on the phone go through Expo's fetch
// (lib/net-fetch.native.ts), which streams; React Native's own, which the phone's other requests
// (PUT, POST, PROPFIND) go through, has no stream, so for them only the length the server says is
// weighed before the whole answer is. Through Tor the core takes 64 MB at most
// (crates/erevos-tor), and the answer is weighed against `most` after.

/** The most bytes any answer may have, unless its caller asks for less: 100 MB. */
export const HTTP_MOST = 100 * 1024 * 1024;

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PROPFIND' | 'MKCOL';
export type HttpAnswer = { status: number; bytes: Uint8Array; reason?: string };
export type Http = (method: HttpMethod, url: string, headers: Record<string, string>, body?: Uint8Array, most?: number) => Promise<HttpAnswer>;

const megabytes = (bytes: number) => String(Math.floor(bytes / (1024 * 1024)));

/** An answer larger than its request takes. */
export class HttpTooLargeError extends Error {
  readonly most: number;
  constructor(most: number) {
    super(t('The answer was larger than {size} MB, the most Erevos takes, so it was stopped.', { size: megabytes(most) }));
    this.most = most;
    this.name = 'HttpTooLargeError';
  }
}

/**
 * The body of `response`, `most` bytes at most: throws HttpTooLargeError as soon as the length the
 * server says, or the bytes read so far, pass it, and calls `stop` (which aborts the request) so
 * no more comes. With no stream to read, the length said is weighed, then the whole body.
 */
export async function readCapped(response: Response, most: number, stop?: () => void): Promise<Uint8Array> {
  const reader = response.body && typeof response.body.getReader === 'function' ? response.body.getReader() : null;
  const tooLarge = () => {
    if (reader) void reader.cancel().catch(() => undefined);
    stop?.();
    return new HttpTooLargeError(most);
  };
  const said = Number(response.headers.get('content-length') ?? '');
  if (Number.isFinite(said) && said > most) throw tooLarge();
  if (!reader) {
    const whole = new Uint8Array(await response.arrayBuffer());
    if (whole.length > most) throw tooLarge();
    return whole;
  }
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value?.length) continue;
    got += value.length;
    if (got > most) throw tooLarge();
    chunks.push(value);
  }
  if (chunks.length === 1) return chunks[0];
  const bytes = new Uint8Array(got);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return bytes;
}

/** A request straight, its answer read with readCapped. GETs go through the fetch that streams. */
export async function fetchCapped(url: string, init: RequestInit, most: number = HTTP_MOST): Promise<{ response: Response; bytes: Uint8Array }> {
  const stop = new AbortController();
  const outer = init.signal;
  if (outer) {
    if (outer.aborted) stop.abort();
    else outer.addEventListener('abort', () => stop.abort(), { once: true });
  }
  const method = (init.method ?? 'GET').toUpperCase();
  const response = await (method === 'GET' ? streamingFetch : fetch)(url, { ...init, signal: stop.signal });
  return { response, bytes: await readCapped(response, most, () => stop.abort()) };
}

async function straight(method: HttpMethod, url: string, headers: Record<string, string>, body: Uint8Array | undefined, most: number): Promise<HttpAnswer> {
  const { response, bytes } = await fetchCapped(url, { method, headers, body: body as unknown as BodyInit | undefined }, most);
  return { status: response.status, bytes, reason: response.headers.get('x-reason') ?? undefined };
}

async function viaTor(method: HttpMethod, url: string, headers: Record<string, string>, body: Uint8Array | undefined, most: number): Promise<HttpAnswer> {
  const answer = await torHttp(JSON.stringify({ method, url, headers }), body ?? new Uint8Array(0));
  if (answer.length - 2 > most) throw new HttpTooLargeError(most);
  return { status: (answer[0] << 8) | answer[1], bytes: answer.slice(2) };
}

export const netHttp: Http = async (method, url, headers, body, most = HTTP_MOST) => {
  const cap = Math.min(most, HTTP_MOST);
  if (!(canTorHttp() && torFor(false))) {
    if (throughTor()) throw new Error(t('Tor is not ready.'));
    return straight(method, url, headers, body, cap);
  }
  try {
    return await viaTor(method, url, headers, body, cap);
  } catch (error) {
    // Too large through Tor is too large straight too.
    if (throughTor() || error instanceof HttpTooLargeError) throw error;
    return straight(method, url, headers, body, cap);
  }
};

/** Whether a request through netHttp goes through Tor now. */
export const netThroughTor = (): boolean => canTorHttp() && torFor(false);

/**
 * As netHttp, through Tor only: an error when it does not go through Tor now, and none straight
 * when Tor fails (the public feed's photos with "Only through Tor", lib/public-fetch.ts).
 */
export const torOnlyHttp: Http = async (method, url, headers, body, most = HTTP_MOST) => {
  if (!netThroughTor()) throw new Error(t('Tor is not ready.'));
  return viaTor(method, url, headers, body, Math.min(most, HTTP_MOST));
};

/**
 * A chat's own way (one sent through Tor by itself, Nostr's chat.tor, lib/nostr-dm-store.ts):
 * through Tor only, whatever the space's Tor way, on circuits of that chat's own, so no exit
 * carries its requests and another's. Tor is started for it when the way did not; never straight.
 */
export function chatTorHttp(chat: string): Http {
  return async (method, url, headers, body, most = HTTP_MOST) => {
    if (!canTorHttp()) throw new Error(t('Tor is not ready.'));
    await ensureTor();
    const cap = Math.min(most, HTTP_MOST);
    const answer = await torHttp(JSON.stringify({ method, url, headers, chat }), body ?? new Uint8Array(0));
    if (answer.length - 2 > cap) throw new HttpTooLargeError(cap);
    return { status: (answer[0] << 8) | answer[1], bytes: answer.slice(2) };
  };
}

/**
 * An account's own way (lib/account-tor.ts), for a network whose requests go one by one (Nostr's
 * file servers): straight with 'never'; with 'space', as the space's Tor way says for words, so
 * files go with the messages (`files` for files that go as the space's way says for files); with
 * 'always', only through Tor, started for it, never straight.
 */
export function accountHttp(choice: AccountTor, files = false): Http {
  return async (method, url, headers, body, most = HTTP_MOST) => {
    const cap = Math.min(most, HTTP_MOST);
    const never = accountNeverStraight(choice);
    if (!accountThroughTor(choice, files) && !never) return straight(method, url, headers, body, cap);
    try {
      if (!canTorHttp()) throw new Error(t('Tor is not ready.'));
      if (choice === 'always') await ensureTor();
      return await viaTor(method, url, headers, body, cap);
    } catch (error) {
      if (never || error instanceof HttpTooLargeError) throw error;
      return straight(method, url, headers, body, cap);
    }
  };
}

/**
 * As netHttp for a chat that goes only through Tor (lib/relay.ts setTorChats), whatever the
 * space's Tor way: Tor is started for it, and nothing goes straight, should Tor fail or not be.
 */
export const torChatHttp: Http = async (method, url, headers, body, most = HTTP_MOST) => {
  if (!canTorHttp()) throw new Error(t('This chat goes only through Tor, which this build of Erevos does not have.'));
  await torForChat();
  return viaTor(method, url, headers, body, Math.min(most, HTTP_MOST));
};

/** Why a request whose own Tor switch is on did not go: this build of Erevos has no Tor for it. */
export class NoTorError extends Error {
  constructor() {
    super(t('This goes only through Tor, which this build of Erevos does not have.'));
    this.name = 'NoTorError';
  }
}

/**
 * As torChatHttp, for what has a Tor switch of its own besides the space's Tor way, turned on: a
 * backup to a server, the Collection's server, its radio and TV lists, link previews, updates.
 * Tor is started for it, whatever the space's way, and it waits while Tor starts; nothing goes
 * straight, should Tor fail or not be in this build (NoTorError).
 */
export const ownTorHttp: Http = async (method, url, headers, body, most = HTTP_MOST) => {
  if (!canTorHttp()) throw new NoTorError();
  await torForChat();
  return viaTor(method, url, headers, body, Math.min(most, HTTP_MOST));
};

/**
 * How something with a Tor switch of its own reaches its server: with the switch on only through
 * Tor (ownTorHttp), with it off as the space's Tor way says (netHttp), as it always did. So the
 * switch only ever adds Tor.
 */
export const httpFor = (tor: boolean): Http => (tor ? ownTorHttp : netHttp);

/** Whether a request through httpFor(tor) goes through Tor now, or, with the switch on, only through it. */
export const throughTorNow = (tor: boolean): boolean => tor || netThroughTor();
