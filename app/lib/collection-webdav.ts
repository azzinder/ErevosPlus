// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { PREFIX, chunksHere, readChunk, saveChunk, type FileRef } from '../lock/attachment-files';
import {
  chunkFiles,
  collectionGeneration,
  FillStoppedError,
  itemsWhole,
  loadCollection,
  noteServerWhole,
  openPlaces,
  placeIsOpen,
  serverWhole,
  setCollectionServer,
  setMissingFiller,
  watchCollections,
  wholeMark,
  type CollectionItem,
  type CollectionPlace,
  type CollectionServer,
  type FillOptions,
} from '../lock/collection-data';

import { openChunk } from './attachments';
import { CAN_CLOUD_BACKUP } from './backup-place';
import { askServer, cloudFolder, CloudError, cloudStatusText, listFolder, type CloudAnswer, type CloudServer } from './backup-cloud';
import { fromHex, randomBytes, toHex } from './crypto';
import { plural } from './i18n';

// The Collection on a WebDAV server: each space's and hidden place's own choice, off until its
// owner gives a server (lock/collection-data.ts CollectionServer), which may be any that speaks
// WebDAV, Nextcloud, ownCloud and the rest, and each place's own. Its chunks go there as they lie
// on the phone, already encrypted, under the same random names (lock/attachment-files.ts), into a
// subfolder of the folder given whose name is random too: the server can open none of them, and
// sees only how many there are and their sizes, of the three a chunk has. The catalogue, which
// says whose they are, never goes there: it stays sealed in the place, and in its backups.
//
// A copy runs while the place is open, a while after its Collection changed, and soon after it
// opens; it stops when the place closes or locks, and with the panic button. It lists the
// subfolder (PROPFIND), sends each chunk not there, or there with another size, one at a time
// (PUT), each tried again a few times after a while when the network fails, lists it again to see
// that every chunk sent is there, of its size, before the copy counts as whole, and deletes there
// the chunks the catalogue no longer names (DELETE). Nothing else in the subfolder is touched: only
// names of chunks. So a copy cut short goes on where it stopped the next time, and one with
// nothing new changes nothing.
//
// The owner can check the copies there (checkCollectionServer): every chunk the catalogue names is
// listed, of its size, and a few, picked at random, are fetched and opened with their file's key.
// And bring back at once every file not whole on this phone (bringBackAll), as after a backup
// restored without them, rather than one at a time as each is opened.
//
// A file whose chunks are not on this phone, as after a backup restored without them on a new
// phone, is fetched from there as it is opened (fillItem): each chunk only if its size is a
// chunk's and it opens with the file's key as the chunk it should be, so the server can neither
// change nor swap one unseen. The device sync (lib/sync/) can fetch them the same way.
//
// Requests go as backups to a server go (lib/backup-cloud.ts): through Tor as the space's Tor way
// says, and in the desktop app through its shell. The place's own Tor switch for its server
// (Collection.serverTor, off unless turned on) sends them only through Tor instead, whatever the
// way, starting Tor for them, and never straight: the test, the copies and the files fetched back.

/** How a place's copying to its server goes: bytes of chunks there out of all, whether it runs now,
 *  when the last copy of this run of Erevos began (0 if none), when it was last whole, and why it last failed. */
export type ServerStatus = { running: boolean; done: number; total: number; began: number; last: number; error: string };

const CHUNK_FILE = /^erevos-file-[0-9a-f]{32}-\d+$/;

// How long after a change a copy starts, and after the place opens, milliseconds.
const AFTER_CHANGE_MS = 10_000;
const AFTER_OPEN_MS = 5_000;
// How long a request that failed waits before it is tried again, each time.
let retryMs = [2_000, 10_000, 30_000];

/** For the checks: how long a failed request waits before each new try. */
export function setServerRetry(ms: number[]): void {
  retryMs = ms;
}

const nameOf = ({ holder, space }: CollectionPlace) => `${holder}/${space}`;

/** The subfolder the place's chunks go in, with the user name and password; with `tor` (the place's Collection.serverTor), reached only through Tor. */
export function serverFolder(server: Pick<CollectionServer, 'url' | 'folder' | 'user' | 'password'>, tor = false): CloudServer {
  return { url: `${server.url}${server.folder}/`, user: server.user, password: server.password, ...(tor ? { tor: true } : {}) };
}

// The server said no, clearly: not tried again now.
class Refused extends CloudError {}

function check(answer: CloudAnswer, fine: number[] = []): void {
  if (fine.includes(answer.status)) return;
  const said = cloudStatusText(answer.status);
  if (!said) return;
  if (answer.status >= 500 && answer.status !== 507) throw new CloudError(said);
  throw new Refused(said);
}

class Stopped extends Error {}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Stopped());
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', stop);
      resolve();
    }, ms);
    const stop = () => {
      clearTimeout(timer);
      reject(new Stopped());
    };
    signal?.addEventListener('abort', stop, { once: true });
  });
}

// `run`, tried again after each of retryMs when it fails but by a clear no of the server.
async function retried<T>(run: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    if (signal?.aborted) throw new Stopped();
    try {
      return await run();
    } catch (error) {
      if (error instanceof Refused || attempt >= retryMs.length) throw error;
      await wait(retryMs[attempt], signal);
    }
  }
}

/** Asks the server whether the folder at `address` is there and takes the user name and password; with `tor`, only through Tor. Returns its address as kept. Throws CloudError with why not. */
export async function testCollectionServer(address: string, user: string, password: string, tor = false): Promise<string> {
  const url = cloudFolder(address);
  check(await askServer({ url, user: user.trim(), password, ...(tor ? { tor: true } : {}) }, 'PROPFIND', '', { headers: { Depth: '0' } }));
  return url;
}

// Makes the place's subfolder on the server, unless it is there; with `tor`, only through Tor.
async function ensureFolder(server: CollectionServer, tor: boolean, signal?: AbortSignal): Promise<void> {
  const base: CloudServer = { url: server.url, user: server.user, password: server.password, ...(tor ? { tor: true } : {}) };
  const there = await retried(() => askServer(base, 'PROPFIND', `${server.folder}/`, { headers: { Depth: '0' } }), signal);
  if (there.status !== 404) return check(there);
  // 405: made meanwhile.
  check(await retried(() => askServer(base, 'MKCOL', `${server.folder}/`), signal), [405]);
}

/**
 * Copies the place's Collection to the folder at `address` from now on, with `user` and
 * `password`: after asking the server, which makes the place's subfolder there, through Tor alone
 * when the place's switch says so. The same folder as before keeps its subfolder, so what went
 * there stays. Throws CloudError with why not.
 */
export async function connectCollectionServer(place: CollectionPlace, address: string, user: string, password: string): Promise<CollectionServer> {
  const tor = (await loadCollection(place)).serverTor === true;
  const url = await testCollectionServer(address, user, password, tor);
  const before = (await loadCollection(place)).server;
  const same = before?.url === url;
  const server: CollectionServer = { on: true, url, user: user.trim(), password, folder: same ? before.folder : toHex(randomBytes(12)), last: same ? before.last : 0 };
  await ensureFolder(server, tor);
  await setCollectionServer(place, server);
  return server;
}

/** Turns the place's copies on its server on or off; what is there stays. */
export async function turnCollectionServer(place: CollectionPlace, on: boolean): Promise<void> {
  const server = (await loadCollection(place)).server;
  if (!server || server.on === on) return;
  if (!on) stopServer(place);
  await setCollectionServer(place, { ...server, on });
}

/** Forgets the place's server; what is there stays. */
export async function forgetCollectionServer(place: CollectionPlace): Promise<void> {
  stopServer(place);
  await setCollectionServer(place, null);
}

// Each place's status, and who watches it.
// A chunk on the server that the catalogue here does not name is deleted only once it has not been
// named for this long, over copies one after another: with the Collection on linked devices that
// copy to the same folder, one whose catalogue has not yet heard of another's new file would else
// delete that file's chunks. When each was first seen unnamed, by place, folder and name.
const UNNAMED_MS = 60 * 60_000;
const unnamedSince = new Map<string, number>();

const statuses = new Map<string, ServerStatus>();
const statusWatchers = new Map<string, Set<(status: ServerStatus) => void>>();

/** How the place's copying goes, as far as this run of Erevos knows. */
export function serverStatus(place: CollectionPlace): ServerStatus | null {
  return statuses.get(nameOf(place)) ?? null;
}

/** Tells `watch` how the place's copying goes, each time it changes. Returns how to stop. */
export function watchServerStatus(place: CollectionPlace, watch: (status: ServerStatus) => void): () => void {
  const name = nameOf(place);
  const set = statusWatchers.get(name) ?? new Set();
  set.add(watch);
  statusWatchers.set(name, set);
  return () => set.delete(watch);
}

function setStatus(place: CollectionPlace, status: ServerStatus): void {
  const name = nameOf(place);
  statuses.set(name, status);
  for (const watch of statusWatchers.get(name) ?? []) watch(status);
}

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Copies the place's Collection to its server once, now: sends the chunks not there whole, then
 * deletes there those the catalogue no longer names. Returns how it went; one that failed says why
 * in `error`, and the next one goes on from there. Stops with `signal`.
 */
export async function copyToServer(place: CollectionPlace, signal?: AbortSignal, now: () => number = Date.now): Promise<ServerStatus> {
  const generation = collectionGeneration(place);
  const collection = await loadCollection(place);
  const server = collection.server;
  const tor = collection.serverTor === true;
  if (!server?.on) {
    const idle = { running: false, done: 0, total: 0, began: 0, last: server?.last ?? 0, error: '' };
    setStatus(place, idle);
    return idle;
  }
  const wanted = chunkFiles(collection);
  let total = 0;
  for (const size of wanted.values()) total += size;
  let status: ServerStatus = { running: true, done: 0, total, began: now(), last: server.last, error: '' };
  setStatus(place, status);
  try {
    await ensureFolder(server, tor, signal);
    const folder = serverFolder(server, tor);
    const there = new Map((await retried(() => listFolder(folder, (name) => CHUNK_FILE.test(name)), signal)).map((file) => [file.name, file.size]));
    let done = 0;
    const missing: [string, number][] = [];
    for (const [name, size] of wanted) {
      if (there.get(name) === size) done += size;
      else missing.push([name, size]);
    }
    status = { ...status, done };
    setStatus(place, status);
    // Those not on this phone either: nothing to send, nor to look for after.
    const lost = new Set<string>();
    for (const [name, size] of missing) {
      if (signal?.aborted) throw new Stopped();
      const [id, n] = [name.slice(PREFIX.length, PREFIX.length + 32), Number(name.slice(PREFIX.length + 33))];
      const bytes = await readChunk(id, n);
      if (!bytes || bytes.length !== size) {
        lost.add(name);
        status = { ...status, total: status.total - size };
        continue;
      }
      await retried(async () => check(await askServer(folder, 'PUT', name, { headers: { 'Content-Type': 'application/octet-stream' }, body: bytes })), signal);
      status = { ...status, done: status.done + size };
      setStatus(place, status);
    }
    // Read back as the server lists them: each chunk sent there, of its size (where it says sizes),
    // before the copy counts as whole. One that is not goes again next time.
    if (missing.length > lost.size) {
      const after = new Map((await retried(() => listFolder(folder, (name) => CHUNK_FILE.test(name)), signal)).map((file) => [file.name, file.size]));
      let short = 0;
      for (const [name, size] of missing) {
        if (lost.has(name)) continue;
        const listed = after.get(name);
        if (listed === undefined || (listed > 0 && listed !== size)) short++;
      }
      if (short > 0) throw new CloudError(plural(short, 'After the copy, {n} of its pieces is not on the server whole: the next copy sends it again.', 'After the copy, {n} of its pieces are not on the server whole: the next copy sends them again.'));
    }
    // Only names of chunks, and only those the catalogue has not named for a while.
    const prefix = `${nameOf(place)}|${server.folder}|`;
    for (const key of [...unnamedSince.keys()]) {
      if (key.startsWith(prefix) && (wanted.has(key.slice(prefix.length)) || !there.has(key.slice(prefix.length)))) unnamedSince.delete(key);
    }
    for (const name of there.keys()) {
      if (wanted.has(name)) continue;
      if (signal?.aborted) throw new Stopped();
      const since = unnamedSince.get(prefix + name);
      if (since === undefined) {
        unnamedSince.set(prefix + name, now());
        continue;
      }
      if (now() - since < UNNAMED_MS) continue;
      await retried(async () => check(await askServer(folder, 'DELETE', name), [404]), signal);
      unnamedSince.delete(prefix + name);
    }
    const last = now();
    serverWhole(place, generation);
    // Kept with the server, for after Erevos starts again: the chunks of the catalogue copied.
    await noteServerWhole(place, server.folder, last, wholeMark(collection)).catch(() => undefined);
    status = { ...status, running: false, last };
  } catch (error) {
    status = { ...status, running: false, error: error instanceof Stopped ? '' : errorText(error) };
  }
  setStatus(place, status);
  return status;
}

/** What a check of a place's copies on its server found (checkCollectionServer): when; how many
 *  files and pieces (chunks) the catalogue names; how many pieces are not there, and how many are
 *  not as made (of another size, or fetched and not opening with their file's key); how many were
 *  fetched and opened; and why it could not be checked, '' when it could. */
export type ServerCheck = { at: number; files: number; pieces: number; missing: number; damaged: number; read: number; error: string };

/** How many pieces a check fetches from the server and opens. */
export const SERVER_SAMPLE = 4;

// Up to `count` of `items`, picked at random.
function pick<T>(items: T[], count: number, random: () => number): T[] {
  const left = [...items];
  const picked: T[] = [];
  while (picked.length < count && left.length) picked.push(left.splice(Math.floor(random() * left.length), 1)[0]);
  return picked;
}

/**
 * Checks the place's copies on its server: every piece the catalogue names is listed there, of its
 * size, and `sample` of them, picked at random, are fetched and opened with their file's key, so
 * one the server changed or swapped shows. Nothing is changed, here or there.
 */
export async function checkCollectionServer(place: CollectionPlace, { sample = SERVER_SAMPLE, random = Math.random, now = Date.now }: { sample?: number; random?: () => number; now?: () => number } = {}): Promise<ServerCheck> {
  const collection = await loadCollection(place);
  const checked: ServerCheck = { at: now(), files: collection.items.length, pieces: 0, missing: 0, damaged: 0, read: 0, error: '' };
  const server = collection.server;
  if (!server) return checked;
  const folder = serverFolder(server, collection.serverTor === true);
  // Each piece the catalogue names, with the file it is of and its number there.
  const pieces = new Map<string, { ref: FileRef; n: number }>();
  for (const item of collection.items) for (const ref of item.thumb ? [item.file, item.thumb] : [item.file]) for (let n = 0; n < ref.count; n++) pieces.set(`${PREFIX}${ref.id}-${n}`, { ref, n });
  checked.pieces = pieces.size;
  try {
    const there = new Map((await listFolder(folder, (name) => CHUNK_FILE.test(name))).map((file) => [file.name, file.size]));
    const listed: string[] = [];
    for (const [name, { ref }] of pieces) {
      const size = there.get(name);
      if (size === undefined) checked.missing++;
      else if (size > 0 && size !== ref.chunk) checked.damaged++;
      else listed.push(name);
    }
    for (const name of pick(listed, sample, random)) {
      const { ref, n } = pieces.get(name)!;
      if (await fetchChunk(folder, ref, n)) checked.read++;
      else checked.damaged++;
    }
  } catch (error) {
    return { ...checked, error: errorText(error) };
  }
  return checked;
}

/** What bringing back a place's files from its server did: how many were not whole on this phone,
 *  how many are whole here now, and how many the server does not have whole either. */
export type BroughtBack = { wanted: number; came: number; failed: number };

/**
 * Fetches from the place's server every file of its Collection not whole on this phone, with its
 * small picture, one after another, keeping each chunk that opens with its file's key: what came.
 * How many of them are done goes to `progress`; `signal` stops it (FillStoppedError) between
 * chunks, keeping what came. Throws CloudError when the server cannot be reached.
 */
export async function bringBackAll(place: CollectionPlace, { signal, progress }: { signal?: AbortSignal; progress?: (done: number, all: number) => void } = {}): Promise<BroughtBack> {
  const collection = await loadCollection(place);
  const server = collection.server;
  if (!server) return { wanted: 0, came: 0, failed: 0 };
  const folder = serverFolder(server, collection.serverTor === true);
  const whole = new Set((await itemsWhole(collection.items)).map((item) => item.id));
  const thumbs = collection.items.filter((item) => item.thumb);
  const thumbsWhole = new Set((await itemsWhole(thumbs.map((item) => ({ ...item, file: item.thumb! })))).map((item) => item.id));
  const wanted = collection.items.filter((item) => !whole.has(item.id));
  let came = 0;
  let failed = 0;
  progress?.(0, wanted.length);
  for (const item of wanted) {
    if (signal?.aborted) throw new FillStoppedError();
    if ((await fetchMissingChunks(folder, item.file, { signal })) === 0) came++;
    else failed++;
    progress?.(came + failed, wanted.length);
  }
  // The small pictures missing here, of every file, whole or not.
  for (const item of thumbs) {
    if (thumbsWhole.has(item.id)) continue;
    if (signal?.aborted) throw new FillStoppedError();
    await fetchMissingChunks(folder, item.thumb!, { signal });
  }
  return { wanted: wanted.length, came, failed };
}

/** The chunk `n` of the file `ref` from the server's folder `folder`, if it is there whole and opens with the file's key as that chunk; else null. Throws CloudError when the server cannot be reached. */
export async function fetchChunk(folder: CloudServer, ref: FileRef, n: number): Promise<Uint8Array | null> {
  const answer = await askServer(folder, 'GET', `${PREFIX}${ref.id}-${n}`, { most: ref.chunk });
  if (answer.status === 404) return null;
  check(answer);
  if (answer.bytes.length !== ref.chunk) return null;
  try {
    openChunk(fromHex(ref.key), n, answer.bytes, ref.chunk);
  } catch {
    return null;
  }
  return answer.bytes;
}

/**
 * Fetches from the server's folder `folder` the chunks of `ref` not on this phone, keeping each
 * that opens: how many are still missing. How far it is goes to `progress`, the chunks here
 * already counted as done; `signal` stops it (FillStoppedError) between chunks, and what came
 * stays, so the next fetch goes on from there.
 */
export async function fetchMissingChunks(folder: CloudServer, ref: FileRef, { signal, progress }: FillOptions = {}): Promise<number> {
  const here = await chunksHere(ref.id);
  let done = 0;
  for (let n = 0; n < ref.count; n++) if (here.has(n)) done++;
  const tell = () => progress?.({ done, total: ref.count, bytes: Math.min(ref.size, Math.round((ref.size * done) / ref.count)), size: ref.size });
  tell();
  let missing = 0;
  try {
    for (let n = 0; n < ref.count; n++) {
      if (signal?.aborted) throw new FillStoppedError();
      if (here.has(n)) continue;
      const bytes = await retried(() => fetchChunk(folder, ref, n), signal);
      if (signal?.aborted) throw new FillStoppedError();
      if (!bytes) {
        missing++;
        continue;
      }
      await saveChunk(ref.id, n, bytes);
      done++;
      tell();
    }
  } catch (error) {
    throw error instanceof Stopped ? new FillStoppedError() : error;
  }
  return missing;
}

/**
 * Fetches from the place's server the chunks of `item` (and of its small picture) not on this
 * phone: whether the file is whole here now. False when the place has no server on. How far the
 * file is goes to `progress`; `signal` stops it, keeping what came.
 */
export async function fillItem(place: CollectionPlace, item: CollectionItem, options: FillOptions = {}): Promise<boolean> {
  const collection = await loadCollection(place);
  const server = collection.server;
  const kept = collection.items.find((i) => i.id === item.id && i.file.id === item.file.id);
  if (!server?.on || !kept) return false;
  const folder = serverFolder(server, collection.serverTor === true);
  const missing = await fetchMissingChunks(folder, kept.file, options);
  if (kept.thumb) await fetchMissingChunks(folder, kept.thumb, { signal: options.signal }).catch(() => 0);
  return missing === 0;
}

// When a file opened is not here (lock/collection-data.ts openItem, fillItemHere): fetched from
// the server of the open place whose file it is; one stopped stops there.
setMissingFiller(async (item, options) => {
  for (const place of openPlaces()) {
    try {
      if (await fillItem(place, item, options)) return true;
    } catch (error) {
      if (error instanceof FillStoppedError) throw error;
    }
  }
  return false;
});

// The copy waiting to start, or running, of each place.
type Slot = { place: CollectionPlace; timer: ReturnType<typeof setTimeout> | null; stop: AbortController | null; again: boolean };
const slots = new Map<string, Slot>();

/** Copies the place's Collection to its server `after` milliseconds from now, while it is open; one running now goes again once it ends. Never where backups cannot go to a server (Sailfish OS, lib/backup-place.web.ts). */
export function scheduleServerCopy(place: CollectionPlace, after = AFTER_CHANGE_MS): void {
  if (!CAN_CLOUD_BACKUP || !placeIsOpen(place)) return;
  const name = nameOf(place);
  const slot: Slot = slots.get(name) ?? { place, timer: null, stop: null, again: false };
  slots.set(name, slot);
  slot.place = place;
  if (slot.stop) {
    slot.again = true;
    return;
  }
  if (slot.timer) clearTimeout(slot.timer);
  slot.timer = setTimeout(() => void start(name, slot), after);
  (slot.timer as { unref?: () => void }).unref?.();
}

async function start(name: string, slot: Slot): Promise<void> {
  slot.timer = null;
  if (slots.get(name) !== slot || !placeIsOpen(slot.place)) return;
  const stop = new AbortController();
  slot.stop = stop;
  try {
    await copyToServer(slot.place, stop.signal);
  } catch {
    // Its status says why.
  }
  slot.stop = null;
  if (slot.again && !stop.signal.aborted) {
    slot.again = false;
    scheduleServerCopy(slot.place);
  }
}

function stopServer(place: CollectionPlace): void {
  const name = nameOf(place);
  const slot = slots.get(name);
  if (!slot) return;
  if (slot.timer) clearTimeout(slot.timer);
  slot.stop?.abort();
  slots.delete(name);
}

/** The space opened: its Collection is copied to its server soon, if it has one. */
export function collectionServerOpened(): void {
  for (const place of openPlaces()) scheduleServerCopy(place, AFTER_OPEN_MS);
}

/** The space locked or closed, or the panic button: every copy stops, and none starts until a place opens again. */
export function stopCollectionServers(): void {
  for (const slot of [...slots.values()]) stopServer(slot.place);
}

watchCollections((place, event) => {
  if (event === 'closed') stopServer(place);
  else scheduleServerCopy(place, event === 'opened' ? AFTER_OPEN_MS : AFTER_CHANGE_MS);
});
