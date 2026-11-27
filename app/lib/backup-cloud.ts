// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { BARE_PART, earlierParts, type PartMade, type PartReader, type PartSink } from '../lock/backup';

import { canTorHttp } from './core';
import { fromHex, randomBytes, sha256Bytes, toBase64, toHex, utf8Decode, utf8Encode } from './crypto';
import { t } from './i18n';
import { cloudRequest } from './backup-http';
import { HTTP_MOST, HttpTooLargeError, NoTorError, type HttpMethod } from './net-http';
import { throughTor, torFor, waitForTor } from './relay';
import { secureDelete, secureGet, secureSet } from './secure';

// Automatic backups (lib/backup-folder.ts) sent to a server too, when the owner wants it: a folder
// on a server that speaks WebDAV, as Nextcloud, ownCloud and many storage services do, the owner's
// own or one they choose. Erevos sends no backup anywhere by itself: this is off until the owner
// gives a folder's address, a user name and a password for it.
//
// What the server gets is a bare backup (lock/backup.ts): random bytes to look at, of one of
// Padmé's sizes, sealed with the backup's password, which never leaves the phone, and its parts,
// the photos, files and voice messages, each an upload of its own, all of one size, sent before
// it. Their names are random too, all of one length, the backup's as its parts', so neither the
// files nor their names say they are Erevos's, and the server keeps the KEEP newest backups with
// their parts, as the folder does. A part's name comes from a random seed of its backup's and its
// number (partName), so the phone keeps only the seed and how many went. The server still sees the
// account, when a backup comes and roughly how big it is, and the phone's address unless it goes
// through Tor; and it can count the parts, and tell them from the backup by their size, a whole
// number of full parts (BARE_PART, lock/backup.ts), which is how a restore tells them apart too.
// What a backup that never ended left there, as when the phone stopped while sending its parts, or
// the server had no room left, is deleted before the next one goes, so it makes room for it.
//
// An automatic backup names again the parts of the backups there that it can (lock/backup.ts),
// those lib/backup-ledger.ts says they named and the folder still lists whole, and sends only new
// ones, under its own seed: it is then `shared` in `parts`. A backup there that goes takes its own
// parts with it only once no backup kept there names them: until then their seed and the numbers
// of those left are `held`, and each goes as soon as none names it. While a shared backup kept
// there is not known to this phone, as after a restore elsewhere, or once their password changed,
// no held part goes, until that backup is no longer among the newest.
//
// On Android backups go as the open space's Tor way says (Settings → Server and networks → Tor),
// through lib/net-http.ts, as Matrix's and the other networks' files do: with Everything only
// through Tor, and none when Tor cannot reach the server; with Messages through Tor while it is
// ready, straight when it is not or fails; with Nothing straight. Just after a space opens Tor is
// still starting, so a backup first waits for it a while (torWaitMs).
//
// Backups to a server have a Tor switch of their own besides (Backups → To a server too), off
// unless turned on, kept with the server (`tor`), so a backup holds it too: with it on, all that
// goes to the server, backups, restores, checks and the sign-in with Nextcloud, goes only through
// Tor, which is started for it whatever the space's way, and nothing straight should Tor fail. A
// server typed to restore from takes the switch as the screen shows it (CloudServer.tor). The
// Collection's copies on a server (lib/collection-webdav.ts) have a switch of their own.
//
// On a computer the desktop app sends each request from its shell, as a page may not reach such a
// server (CORS); the web app reaches only a server that lets it (lib/backup-http.web.ts). Neither
// has Tor for it: with a space sending Everything through Tor, or with the server's own Tor switch
// on, nothing goes there.
//
// A backup there can be put back from the server itself (listCloud, fetchFromCloud): the folder is
// listed, only the names Erevos gives backups are shown, newest first, and the one chosen is
// downloaded and opened with its password as a file is, on the phone, then its parts one at a
// time (cloudParts). Nothing is written on the server for it.
//
// Google Drive takes automatic backups the same way (lib/google-drive.ts): sendBare sends to either
// place, which only says how a file goes there, is deleted there, and which parts are there.
//
// The settings are kept in the keystore entry CLOUD, outside every space, as automatic backups'
// own are, with the names of the backups sent, oldest first. Backups hold it (lock/backup.ts):
// restored where the phone sends to the same folder, the phone's own list of what went there stays.

/** A folder on a server, with the user name and password for it; `tor`: reached only through Tor (lib/net-http.ts httpFor). */
export type CloudServer = { url: string; user: string; password: string; tor?: boolean };

/** A backup on the server: its name, its size in bytes and when it came, milliseconds, 0 if the server does not say. */
export type CloudFile = { name: string; size: number; when: number };

// The names Erevos gives backups on a server, and their parts: of one length. A backup sent by an
// Erevos from before parts has a shorter one.
const NAME = /^[0-9a-f]{24}$/;
const OLD_NAME = /^[0-9a-f]{16}$/;
const PART_NAME = NAME;
/** Whether `name` is one Erevos gives a backup on a server, or in Google Drive. */
export const isBackupName = (name: string) => NAME.test(name) || OLD_NAME.test(name);
/** Whether `name` is one Erevos gives a backup's part there. */
export const isPartName = (name: string) => PART_NAME.test(name);
// A backup's parts' seed.
const SEED_BYTES = 16;
const SEED = /^[0-9a-f]{32}$/;
// The most parts a backup has (lock/backup.ts).
const MOST_PARTS = 1_000_000;

/** A backup's parts on the server: the seed their names come from, and how many there are (or,
 *  for one that never ended, may be). `shared` when the backup also names parts of others. */
export type CloudParts = { seed: string; count: number; shared?: true };

/** The parts of a backup no longer there that backups kept there may still name: their seed, and
 *  the numbers of those still there, as 0-4,7,9-12. */
export type CloudHeld = { seed: string; left: string };

/** Where backups go on a server. `names` are the backups sent, oldest first, `parts` the parts of
 *  each, `held` those of backups gone that others name, `unfinished` those of backups that never
 *  ended, to delete. `last` milliseconds, 0 if none went yet. `tor`: the server is reached only
 *  through Tor; left out while the switch is off, as at first. */
export type CloudBackup = {
  url: string;
  user: string;
  password: string;
  tor?: boolean;
  names: string[];
  parts: Record<string, CloudParts>;
  held: CloudHeld[];
  unfinished: CloudParts[];
  last: number;
  error: string;
};

/** The name of part `n` (from 0) of the backup whose parts' seed is `seed`. */
export function partName(seed: string, n: number): string {
  const joined = new Uint8Array(SEED_BYTES + 4);
  joined.set(fromHex(seed));
  new DataView(joined.buffer).setUint32(SEED_BYTES, n);
  return toHex(sha256Bytes(joined)).slice(0, 24);
}

function partsOf(value: unknown): CloudParts | null {
  const v = value as Partial<CloudParts> | null;
  if (!v || typeof v.seed !== 'string' || !SEED.test(v.seed) || typeof v.count !== 'number') return null;
  if (!Number.isInteger(v.count) || v.count < 0 || v.count > MOST_PARTS) return null;
  return v.shared === true ? { seed: v.seed, count: v.count, shared: true } : { seed: v.seed, count: v.count };
}

/** Numbers, as a text of their runs: 0-4,7,9-12. */
export function runsText(numbers: Iterable<number>): string {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  const runs: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    runs.push(i === j ? `${sorted[i]}` : `${sorted[i]}-${sorted[j]}`);
    i = j + 1;
  }
  return runs.join(',');
}

/** The numbers a text of runs names, each below `most`; null when it is not such a text. */
export function runsOf(text: string, most = MOST_PARTS): number[] | null {
  if (text === '') return [];
  const numbers: number[] = [];
  for (const run of text.split(',')) {
    const found = /^(\d{1,7})(?:-(\d{1,7}))?$/.exec(run);
    if (!found) return null;
    const from = Number(found[1]);
    const to = found[2] === undefined ? from : Number(found[2]);
    if (to < from || to >= most || numbers.length + to - from >= most) return null;
    for (let n = from; n <= to; n++) numbers.push(n);
  }
  return numbers;
}

function heldOf(value: unknown): CloudHeld | null {
  const v = value as Partial<CloudHeld> | null;
  if (!v || typeof v.seed !== 'string' || !SEED.test(v.seed) || typeof v.left !== 'string') return null;
  const left = runsOf(v.left);
  return left && left.length ? { seed: v.seed, left: runsText(left) } : null;
}

const CLOUD = 'erevos.backup-cloud';

/** A server's answer: its status and what it said; `location`, the address it named, where the way
 *  it went gives its headers (straight, not through Tor). */
export type CloudAnswer = { status: number; bytes: Uint8Array; location?: string };

/** How a request goes to the server; with `tor`, only through Tor. The checks put a server of their own here. */
export type CloudHttp = (method: HttpMethod, url: string, headers: Record<string, string>, body?: Uint8Array, most?: number, tor?: boolean) => Promise<CloudAnswer>;

/** The largest backup that comes back from a server: what any download takes (lib/net-http.ts),
 *  100 MB. A larger one is downloaded from the server by hand and opened as a file. */
export const CLOUD_RESTORE_MOST = HTTP_MOST;

/** Why a backup did not come from the server: it is larger than `most`. */
export function tooLargeText(most: number): string {
  return t('A backup larger than {size} MB does not come from a server. Download it from the server and tap Restore a backup.', { size: String(Math.floor(most / (1024 * 1024))) });
}

const viaNet: CloudHttp = cloudRequest;

let http = viaNet;

/** For the checks: a server of their own, or the usual way again with null. */
export function setCloudHttp(next: CloudHttp | null): void {
  http = next ?? viaNet;
}

// How long a backup waits for Tor to start, milliseconds, before it goes as the Tor way says
// without it: one made as a space opens comes before Tor is ready.
let torWaitMs = 120_000;

/** For the checks: how long to wait for Tor. */
export function setCloudTorWait(ms: number): void {
  torWaitMs = ms;
}

/** Whether backups to a server go through Tor now, as the open space's Tor way and Tor's state say. */
export function cloudThroughTor(): boolean {
  return canTorHttp() && torFor(false);
}

export class CloudError extends Error {}

/** The server could not be reached for this request: it may be, a moment later. */
export class Unreached extends CloudError {}

/** The folder's address as Erevos uses it: https, ending in /. Throws CloudError with why not. */
export function cloudFolder(address: string): string {
  // Without what follows ? or #, which a folder's address has no use for.
  const text = address.trim().replace(/[?#].*$/, '');
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new CloudError(t('That is not a folder address. It starts with https://'));
  }
  if (url.protocol !== 'https:') throw new CloudError(t('The address has to start with https://, so the password and backups go encrypted.'));
  if (url.username || url.password) throw new CloudError(t('Put the user name and password in their own fields, not in the address.'));
  return text.endsWith('/') ? text : `${text}/`;
}

function authorization(cloud: Pick<CloudServer, 'user' | 'password'>): Record<string, string> {
  return {
    Authorization: `Basic ${toBase64(utf8Encode(`${cloud.user}:${cloud.password}`))}`,
  };
}

/** What the server's status says, in words; null when all went well. */
export function cloudStatusText(status: number): string | null {
  if (status >= 200 && status < 300) return null;
  if (status === 401 || status === 403) return t('The server did not take that user name and password.');
  if (status === 404 || status === 409) return t('That folder is not on the server. Make it there first.');
  if (status === 507) return t('The server has no room left for it.');
  return t('The server answered {status}.', { status });
}

// With `tor` (the Tor switch of what asks) only through Tor, which is started for it and waited
// for as the request goes; else as the space's Tor way says.
async function ask(method: HttpMethod, url: string, headers: Record<string, string>, body?: Uint8Array, most?: number, tor = false): Promise<CloudAnswer> {
  // Erevos sends nothing straight while the open space sends everything through Tor, nor while
  // the switch says only through Tor: a build without Tor for it sends nothing then.
  if (tor && !canTorHttp()) throw new CloudError(new NoTorError().message);
  if (!tor && throughTor() && !canTorHttp()) throw new CloudError(t('This space sends Everything through Tor, and Tor here cannot reach a server, so nothing went to it.'));
  if (!tor && canTorHttp()) await waitForTor(torWaitMs);
  try {
    return await http(method, url, headers, body, most, tor);
  } catch (error) {
    if (error instanceof HttpTooLargeError) throw new CloudError(tooLargeText(error.most));
    if (error instanceof NoTorError) throw new CloudError(error.message);
    throw new Unreached(
      t('Could not reach the server. {error}', {
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}

/**
 * One request to `name` in the server's folder ('' for the folder itself), with its user name and
 * password: the server's answer, whatever its status (cloudStatusText says it in words). Goes
 * through Tor as the space's Tor way says, or, with the server's `tor`, only through Tor. Throws
 * CloudError when the server cannot be reached. The Collection's copies on a server
 * (lib/collection-webdav.ts) ask theirs so too.
 */
export function askServer(server: CloudServer, method: HttpMethod, name: string, { headers = {}, body, most }: { headers?: Record<string, string>; body?: Uint8Array; most?: number } = {}): Promise<CloudAnswer> {
  return ask(method, server.url + name, { ...authorization(server), ...headers }, body, most, server.tor === true);
}

/** One request to `url` with no user name, as the sign-in with Nextcloud asks (lib/nextcloud-login.ts)
 *  and Google Drive's (lib/google-drive.ts); as askServer otherwise, with `tor` only through Tor, and
 *  an answer of `most` bytes at most. */
export function askAddress(method: HttpMethod, url: string, headers: Record<string, string> = {}, body?: Uint8Array, tor = false, most?: number): Promise<CloudAnswer> {
  return ask(method, url, headers, body, most, tor);
}

export async function loadCloudBackup(): Promise<CloudBackup | null> {
  try {
    const value = JSON.parse((await secureGet(CLOUD)) ?? 'null') as Partial<CloudBackup> | null;
    if (!value || typeof value.url !== 'string' || typeof value.user !== 'string' || typeof value.password !== 'string') return null;
    return {
      url: value.url,
      user: value.user,
      password: value.password,
      ...(value.tor === true ? { tor: true } : {}),
      ...sentOf(value),
    };
  } catch {
    return null;
  }
}

/** What settings kept say went to a place (BareSent), as Erevos writes it: anything else is left out. */
export function sentOf(value: Partial<Record<keyof BareSent, unknown>>): BareSent {
  const names = Array.isArray(value.names) ? value.names.filter((name): name is string => typeof name === 'string' && isBackupName(name)) : [];
  const parts: Record<string, CloudParts> = {};
  const listed = typeof value.parts === 'object' && value.parts ? (value.parts as Record<string, unknown>) : {};
  for (const name of names) {
    // Names of hex digits only, never one of an object's own.
    const of = partsOf(listed[name]);
    if (of) parts[name] = of;
  }
  return {
    names,
    parts,
    held: Array.isArray(value.held) ? value.held.map(heldOf).filter((of): of is CloudHeld => of !== null) : [],
    unfinished: Array.isArray(value.unfinished) ? value.unfinished.map(partsOf).filter((of): of is CloudParts => of !== null) : [],
    last: typeof value.last === 'number' ? value.last : 0,
    error: typeof value.error === 'string' ? value.error : '',
  };
}

/**
 * Sends automatic backups to the folder at `address` from now on, after asking the server whether
 * the folder is there and takes the user name and password; with `tor`, only through Tor, then and
 * from now on. Throws CloudError with why not.
 */
export async function startCloudBackup(address: string, user: string, password: string, tor = false): Promise<CloudBackup> {
  const url = cloudFolder(address);
  const said = cloudStatusText(
    (
      await ask(
        'PROPFIND',
        url,
        {
          ...authorization({ user, password }),
          Depth: '0',
        },
        undefined,
        undefined,
        tor,
      )
    ).status,
  );
  if (said) throw new CloudError(said);
  const before = await loadCloudBackup();
  // The same folder keeps the names of what went there, so the oldest still go.
  const same = before?.url === url;
  const cloud: CloudBackup = {
    url,
    user,
    password,
    ...(tor ? { tor: true } : {}),
    names: same ? before.names : [],
    parts: same ? before.parts : {},
    held: same ? before.held : [],
    unfinished: same ? before.unfinished : [],
    last: 0,
    error: '',
  };
  await secureSet(CLOUD, JSON.stringify(cloud));
  return cloud;
}

/** Keeps the server's settings as they are now: as when a check after a backup sent there finds
 *  it not whole, which then counts as failed (lib/backup-folder.ts). */
export async function saveCloudBackup(cloud: CloudBackup): Promise<void> {
  await secureSet(CLOUD, JSON.stringify(cloud));
}

/** Turns the server's own Tor switch on or off: the settings as they are after it, or null when no server is set. */
export async function setCloudTor(on: boolean): Promise<CloudBackup | null> {
  const cloud = await loadCloudBackup();
  if (!cloud) return null;
  const { tor: _was, ...rest } = cloud;
  const next: CloudBackup = on ? { ...rest, tor: true } : rest;
  await secureSet(CLOUD, JSON.stringify(next));
  return next;
}

/** Sends no more backups to the server; those there stay. */
export async function stopCloudBackup(): Promise<void> {
  await secureDelete(CLOUD);
}

// How long a PUT that failed for a while waits before it is tried again, each time, milliseconds.
// A backup sends thousands of parts, and one the server misses for a moment, as while it is under
// maintenance for a few minutes at night (503), or slow to take one (408), must not end it: the
// backup would then delete all that went and send it all again the next time, and fail again.
let retryMs = [2_000, 10_000, 30_000, 60_000, 120_000, 300_000];

/** For the checks: how long a failed PUT waits before each new try. */
export function setCloudRetry(ms: number[]): void {
  retryMs = ms;
}

/** Whether a status says the server may take it if asked again: busy, locked or slow, not a clear no. */
export const passing = (status: number) => status === 408 || status === 423 || status === 425 || status === 429 || (status >= 500 && status !== 507);

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Sends something with `send`, again after each of the waits retryMs says while what it says went
 * wrong (`said`, null when all went well) may go if asked again (`again`). Throws CloudError with
 * the last why not.
 */
export async function tryAgain(send: () => Promise<{ said: string | null; again: boolean }>): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    const { said, again } = await send();
    if (!said) return;
    if (!again || attempt >= retryMs.length) throw new CloudError(said);
    await pause(retryMs[attempt]);
  }
}

// Sends `bytes` to the server as `name`, again after a while when the server is busy or cannot be
// reached for a moment. Throws CloudError with why not.
function put(cloud: CloudBackup, name: string, bytes: Uint8Array): Promise<void> {
  return tryAgain(async () => {
    try {
      const { status } = await ask('PUT', cloud.url + name, { ...authorization(cloud), 'Content-Type': 'application/octet-stream' }, bytes, undefined, cloud.tor === true);
      return { said: cloudStatusText(status), again: passing(status) };
    } catch (error) {
      if (!(error instanceof Unreached)) throw error;
      return { said: error.message, again: true };
    }
  });
}

// Deletes `name` on the server: whether it is gone now, as one already gone is.
async function gone(cloud: CloudBackup, name: string): Promise<boolean> {
  const status = await ask('DELETE', cloud.url + name, authorization(cloud), undefined, undefined, cloud.tor === true).then(
    (answer) => answer.status,
    () => 0,
  );
  return status === 404 || !cloudStatusText(status);
}

/** What a place that takes bare backups keeps of what went there: CloudBackup's, and Google
 *  Drive's (lib/google-drive.ts), as CloudBackup says them. */
export type BareSent = {
  names: string[];
  parts: Record<string, CloudParts>;
  held: CloudHeld[];
  unfinished: CloudParts[];
  last: number;
  error: string;
};

/** A place bare backups go to, as sendBare sends them: a server's folder over WebDAV, or the folder
 *  Erevos made in Google Drive (lib/google-drive.ts). */
export type BarePlace = {
  /** Sends `bytes` there as `name`, again after a while when the place is busy or cannot be
   *  reached for a moment (tryAgain). Throws CloudError with why not. */
  put(name: string, bytes: Uint8Array): Promise<void>;
  /** Deletes `name` there: whether it is gone now, as one already gone is. */
  gone(name: string): Promise<boolean>;
  /** The parts there, each with its size, 0 where the place does not say it. Throws CloudError with why not. */
  parts(): Promise<Map<string, number>>;
};

// The server's folder, as sendBare sends to it.
function davPlace(cloud: CloudBackup): BarePlace {
  return {
    put: (name, bytes) => put(cloud, name, bytes),
    gone: (name) => gone(cloud, name),
    parts: async () => new Map(listed(await listing(cloud), (file) => PART_NAME.test(file)).map((file) => [file.name, file.size])),
  };
}

// Deletes a backup's parts there: whether all of them are gone now.
async function partsGone(place: BarePlace, { seed, count }: CloudParts): Promise<boolean> {
  for (let n = 0; n < count; n++) if (!(await place.gone(partName(seed, n)))) return false;
  return true;
}

// How many parts' names are kept ahead of those sent, so the keystore is written once for so many.
const AHEAD = 16;

// Deletes there the backups sent but the `keep` newest, with the parts of theirs no backup kept
// there names, and the parts of those that never ended: the settings as they are after it. One the
// place would not delete stays, to be tried again next time. `book` (lib/backup-ledger.ts) says
// which parts each automatic backup there names, and loses those that go.
async function tidy<S extends BareSent>(place: BarePlace, next: S, keep: number, book?: Map<string, PartMade[]>): Promise<S> {
  const old = next.names.slice(0, Math.max(0, next.names.length - keep));
  const left: string[] = [];
  const parts = { ...next.parts };
  const held = [...next.held];
  for (const older of old) {
    // Its parts go once it did.
    if (!(await place.gone(older))) {
      left.push(older);
      continue;
    }
    if (parts[older]?.count) held.push({ seed: parts[older].seed, left: `0-${parts[older].count - 1}` });
    delete parts[older];
    book?.delete(older);
  }
  const names = [...left, ...next.names.slice(old.length)];
  // The parts of others the backups kept there name: one that names only its own needs none of
  // them. Of a shared one this phone does not know, any of them, so none goes for now.
  const needed = new Set<string>();
  let known = true;
  for (const kept of names) {
    if (!parts[kept]?.shared) continue;
    const named = book?.get(kept);
    if (named) for (const part of named) needed.add(part.name);
    else known = false;
  }
  const still: CloudHeld[] = [];
  for (const of of held) {
    const numbers = runsOf(of.left) ?? [];
    const stay = known ? [] : numbers;
    if (known) for (const n of numbers) if (needed.has(partName(of.seed, n)) || !(await place.gone(partName(of.seed, n)))) stay.push(n);
    if (stay.length) still.push({ seed: of.seed, left: runsText(stay) });
  }
  const unfinished: CloudParts[] = [];
  for (const of of next.unfinished) if (!(await partsGone(place, of))) unfinished.push(of);
  return { ...next, names, parts, held: still, unfinished };
}

/** What an automatic backup sent to a server is given to name again earlier parts there, and told
 *  what it named (MakeOptions.earlier and made, lock/backup.ts). */
export type CloudReuse = { earlier: PartMade[]; made: (parts: PartMade[]) => void };

/**
 * Sends a bare backup (lock/backup.ts) to the server: first deletes there what a backup that never
 * ended left, and those beyond the `keep` newest, so a server short of room has it again; then
 * `make` makes it, giving each part as it is made, which goes at once under its own name, then the
 * backup itself, which goes last under a random name. Then deletes there the older ones it sent but
 * the `keep` newest, with the parts no backup kept there names. Returns the settings as they are
 * after it; one that failed says why in `error`. With `book` (lib/backup-ledger.ts), as automatic
 * backups give it, `make` is given the parts of the backups kept there that the folder lists whole,
 * to name again, and the book is told what it named.
 */
export function sendToCloud(
  cloud: CloudBackup,
  make: (part: PartSink, reuse?: CloudReuse) => Promise<Uint8Array>,
  keep: number,
  now = Date.now(),
  book?: Map<string, PartMade[]>,
): Promise<CloudBackup> {
  return sendBare(cloud, davPlace(cloud), (value) => secureSet(CLOUD, JSON.stringify(value)), make, keep, now, book);
}

/**
 * Sends a bare backup to `place` as sendToCloud does to a server, from what went there before
 * (`start`), which `write` keeps as it changes: before each AHEAD parts, once the backup is there,
 * and at the end. Returns it as it is after it; one that failed says why in `error`.
 */
export async function sendBare<S extends BareSent>(
  start: S,
  place: BarePlace,
  write: (value: S) => Promise<void>,
  make: (part: PartSink, reuse?: CloudReuse) => Promise<Uint8Array>,
  keep: number,
  now = Date.now(),
  book?: Map<string, PartMade[]>,
): Promise<S> {
  let next = start;
  const save = async (value: S) => {
    next = value;
    await write(value);
  };
  const seed = toHex(randomBytes(SEED_BYTES));
  const without = (list: CloudParts[]) => list.filter((of) => of.seed !== seed);
  try {
    if (next.unfinished.length || next.names.length > keep || next.held.length) await save(await tidy(place, next, keep, book));
    let reuse: CloudReuse | undefined;
    let made: PartMade[] = [];
    if (book) {
      // The book loses the backups no longer there, as those a backup sent by hand made go.
      for (const sent of [...book.keys()]) if (!next.names.includes(sent)) book.delete(sent);
      // Those of the newest first.
      const backups = [...next.names].reverse().map((sent) => book.get(sent) ?? []);
      let earlier: PartMade[] = [];
      if (backups.some((parts) => parts.length > 0)) {
        // Only those the place lists, of their size: one deleted there, or cut short, goes again.
        const there = await place.parts();
        earlier = earlierParts(backups, (part) => there.has(part.name) && (!there.get(part.name) || there.get(part.name) === part.size));
      }
      reuse = { earlier, made: (parts) => (made = parts) };
    }
    let count = 0;
    const name = toHex(randomBytes(12));
    try {
      const bytes = await make(async (part) => {
        // Kept before they go, so those of a backup cut short are deleted next time. The backup
        // read this entry before its first part (lock/backup.ts), so it holds no such seed of its own.
        if (count % AHEAD === 0) await save({ ...next, unfinished: [...without(next.unfinished), { seed, count: count + AHEAD }] });
        const at = partName(seed, count);
        count++;
        await place.put(at, part);
        return at;
      }, reuse);
      await place.put(name, bytes);
    } catch (error) {
      // What went of it goes again: now, if the place lets it, else next time.
      if (count && (await partsGone(place, { seed, count })) && (await place.gone(name))) next = { ...next, unfinished: without(next.unfinished) };
      throw error;
    }
    // Kept at once, so its parts are never taken for those of one that never ended. One that names
    // parts of others says so, even with none of its own.
    const shared = made.length > count;
    book?.set(name, made);
    await save({
      ...next,
      names: [...next.names, name],
      parts: count || shared ? { ...next.parts, [name]: shared ? { seed, count, shared: true as const } : { seed, count } } : next.parts,
      unfinished: without(next.unfinished),
      last: now,
      error: '',
    });
    next = await tidy(place, next, keep, book);
  } catch (error) {
    next = {
      ...next,
      error: error instanceof Error ? error.message : String(error),
    };
  }
  await write(next);
  return next;
}

/** The server's name, as the screen shows it: cloud.example.org. */
export function cloudLabel(cloud: Pick<CloudBackup, 'url'>): string {
  try {
    return new URL(cloud.url).host;
  } catch {
    return cloud.url;
  }
}

/** A folder on a server as the owner typed it, to restore from; with `tor`, reached only through Tor. Throws CloudError when the address is not one. */
export function cloudServer(address: string, user: string, password: string, tor = false): CloudServer {
  return { url: cloudFolder(address), user: user.trim(), password, ...(tor ? { tor: true } : {}) };
}

// What WebDAV is asked of each file in the folder.
const LISTING =
  '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:getlastmodified/><d:getcontentlength/></d:prop></d:propfind>';

/** The backups in the server's folder, newest first, without their parts. Throws CloudError with why not. */
export async function listCloud(server: CloudServer): Promise<CloudFile[]> {
  return backupsListed(await listing(server));
}

/** The files in the server's folder whose names are of `kind`, newest first, with their sizes. Throws CloudError with why not. */
export async function listFolder(server: CloudServer, kind: (name: string) => boolean): Promise<CloudFile[]> {
  return listed(await listing(server), kind);
}

// The folder's WebDAV listing. Throws CloudError with why not.
async function listing(server: CloudServer): Promise<string> {
  const answer = await ask(
    'PROPFIND',
    server.url,
    { ...authorization(server), Depth: '1', 'Content-Type': 'application/xml; charset=utf-8' },
    utf8Encode(LISTING),
    undefined,
    server.tor === true,
  );
  const said = cloudStatusText(answer.status);
  if (said) throw new CloudError(said);
  return utf8Decode(answer.bytes);
}

/**
 * The parts of the backups in the server's folder, to restore one (lock/backup.ts): which of a
 * backup's parts' names are not there, and each one's bytes, downloaded one at a time as asked,
 * at most CLOUD_RESTORE_MOST bytes. Throws CloudError with why not.
 */
export async function cloudParts(server: CloudServer): Promise<{ missing(names: string[]): string[]; read: PartReader }> {
  const there = new Set(listed(await listing(server), (name) => PART_NAME.test(name)).map((file) => file.name));
  return {
    missing: (names) => names.filter((name) => !there.has(name)),
    read: async (name) => {
      if (!PART_NAME.test(name) || !there.has(name)) return null;
      const answer = await ask('GET', server.url + name, authorization(server), undefined, CLOUD_RESTORE_MOST, server.tor === true);
      if (answer.status === 404) return null;
      const said = cloudStatusText(answer.status);
      if (said) throw new CloudError(said);
      return answer.bytes;
    },
  };
}

/**
 * The backups and parts in the server's folder, with their sizes (-1 where the server does not say
 * them), and each one's bytes, downloaded as asked, at most CLOUD_RESTORE_MOST: to check that a
 * backup there is whole (lib/backup-check.ts). Throws CloudError with why not.
 */
export async function cloudFiles(server: CloudServer): Promise<{ sizes: Map<string, number>; read: PartReader }> {
  const sizes = new Map(listed(await listing(server), isBackupName).map((file) => [file.name, file.size || -1]));
  return {
    sizes,
    read: async (name) => {
      if (!sizes.has(name)) return null;
      const answer = await ask('GET', server.url + name, authorization(server), undefined, CLOUD_RESTORE_MOST, server.tor === true);
      if (answer.status === 404) return null;
      const said = cloudStatusText(answer.status);
      if (said) throw new CloudError(said);
      return answer.bytes;
    },
  };
}

// One element's text in a piece of WebDAV's XML, whatever prefix its namespace has.
function element(xml: string, name: string): string | null {
  const found = new RegExp(`<(?:[\\w.-]+:)?${name}\\b[^>]*>([\\s\\S]*?)</(?:[\\w.-]+:)?${name}\\s*>`, 'i').exec(xml);
  return found ? found[1].trim() : null;
}

/** The backups a WebDAV listing (a PROPFIND's multistatus) names, newest first: only names Erevos
 *  gives, and not their parts, whose size is a whole number of full parts. */
export function backupsListed(xml: string): CloudFile[] {
  return backupsAmong(listed(xml, isBackupName));
}

/** The backups among `files` of the names Erevos gives, as backupsListed: not their parts. */
export function backupsAmong(files: CloudFile[]): CloudFile[] {
  return files.filter((file) => OLD_NAME.test(file.name) || file.size === 0 || file.size % BARE_PART !== 0);
}

// The files a WebDAV listing names whose names are of `kind`, newest first.
function listed(xml: string, kind: (name: string) => boolean): CloudFile[] {
  const files: CloudFile[] = [];
  for (const [response] of xml.matchAll(/<(?:[\w.-]+:)?response\b[\s\S]*?<\/(?:[\w.-]+:)?response\s*>/gi)) {
    const href = element(response, 'href');
    if (!href) continue;
    let name: string;
    try {
      name = decodeURIComponent(href.replace(/\/+$/, '').split('/').pop() ?? '');
    } catch {
      continue;
    }
    if (!kind(name)) continue;
    files.push({
      name,
      size: Number(element(response, 'getcontentlength')) || 0,
      when: Date.parse(element(response, 'getlastmodified') ?? '') || 0,
    });
  }
  return files.sort((a, b) => b.when - a.when);
}

/** Downloads the backup `name` from the server, at most `most` bytes (CLOUD_RESTORE_MOST at most):
 *  a larger answer is stopped as it comes. Throws CloudError with why not. */
export async function fetchFromCloud(server: CloudServer, name: string, most: number = CLOUD_RESTORE_MOST): Promise<Uint8Array> {
  if (!isBackupName(name)) throw new CloudError(t('That file is not an Erevos backup.'));
  const cap = Math.min(most, CLOUD_RESTORE_MOST);
  const answer = await ask('GET', server.url + name, authorization(server), undefined, cap, server.tor === true);
  const said = cloudStatusText(answer.status);
  if (said) throw new CloudError(said);
  if (answer.bytes.length > cap) throw new CloudError(tooLargeText(cap));
  return answer.bytes;
}
