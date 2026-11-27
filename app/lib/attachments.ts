// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Photos and files sent to a contact, in the style of SimpleX's XFTP. The phone encrypts the file
// with a key of its own, in chunks of one of three sizes, every chunk of a file the same size, and
// puts them on its relay's file store. Only where they are and the key go to the contact, inside
// an end-to-end message (FileOffer, in lib/e2e.ts). The contact's phone takes the chunks through
// its own relay, checks each, keeps them as they came (lock/attachment-files.ts) and deletes them
// from the relay. Chunks nobody takes expire on the relay after 14 days.
//
// Each chunk holds its place in the file and how much of it is the file, then zeros to its size,
// all sealed with AES-256-GCM: a chunk cannot be changed, swapped with another or left out unseen.
// The relay sees how many chunks there are and their size, so roughly how big the file is, and
// which addresses put and took them. Self-contained on purpose, so it can run under plain Node for
// checks.

import { decryptBytes, encryptBytes, fromHex, randomBytes, sha256Bytes, toHex } from './crypto';
import { gcm } from '@noble/ciphers/aes.js';
import { deleteChunk, getChunk, isLentToken, isRelayAddress as relayAddress, putChunk, RelaySession, relayPath, sameRelay, torFor, type Relay } from './relay';
import {
  CHUNK_SIZES,
  cleanFileName,
  cleanMime,
  deleteChunks,
  fitsSticker,
  isFileMeta,
  isIdList,
  newFileId,
  readChunk,
  saveChunk,
  NOSTR_PIECE,
  readSharedMark,
  type FileFrom as FromRef,
  type FileMeta,
  type FileRef,
} from '../lock/attachment-files';
import { dropPieces, piecesCame, readPieces, type PiecePlace } from './nostr-pieces';
import { downloadBlob, NOSTR_FILE_MOST } from './nostr-files';
import { nostrOwnTor } from './nostr';
import { netThroughTor } from './net-http';
import { t } from './i18n';

/** The largest file that can be sent. */
export const MAX_FILE = 100 * 1000 * 1000;

/** Photos and files that came, up to this size, are taken from the relay as soon as they come
 *  (as takesItself says). */
export const AUTO_TAKE = 16 * 1000 * 1000;

/** Where a file that came waits on the relay until taken: the relay, and its chunks' ids (hex, one after another). */
export type FileFrom = FromRef;

/**
 * What the account's other devices (lib/devices.ts) need of the files taken here: whether a file
 * stays on the relay for now, as another of them still takes it, and to hear once it was taken,
 * and whether it was left there. The one that takes it last has it deleted there.
 */
export type TakenFiles = { leave(from: FileFrom): boolean; taken(from: FileFrom, left: boolean): void };

let takenFiles: TakenFiles | null = null;

/** Who hears of the files the open space's chats take from now on, or no one. */
export function watchTakenFiles(watch: TakenFiles | null): void {
  takenFiles = watch;
}

// The nonce and tag AES-GCM adds, and the chunk's place and length.
const SEALING = 12 + 16;
const HEAD = 8;
const ID_HEX = 48;
// What a blob's offer says of its chunk, which it has none: the largest size, as a file kept here would be.
export const BLOB_CHUNK = CHUNK_SIZES[CHUNK_SIZES.length - 1];

/** How much of a file fits in a chunk of `chunk` bytes. */
export const room = (chunk: number) => chunk - SEALING - HEAD;

/** The chunk size for a file of `size` bytes, and how many chunks it takes. */
export function chunkPlan(size: number): { chunk: number; count: number } {
  for (const chunk of CHUNK_SIZES.slice(0, -1)) if (size <= room(chunk)) return { chunk, count: 1 };
  const chunk = CHUNK_SIZES[CHUNK_SIZES.length - 1];
  return { chunk, count: Math.max(1, Math.ceil(size / room(chunk))) };
}

/** What a message carries for a file: where its chunks are, their ids (hex, one after another) and the key. */
export type FileOffer = FileMeta & { relay: string; ids: string; key: string; chunk: number; via?: 'nostr' | 'blossom'; url?: string; x?: string };

/** The largest photo that goes in pieces through Nostr; larger ones, and files, go to a file server. */
export const NOSTR_PHOTO_MOST = 3 * 1000 * 1000;

export class FileTooLargeError extends Error {
  constructor() {
    super(t('Files can be 100 MB at most.'));
  }
}

/** A chunk that does not open with the file's key, or is not the one expected. */
export class FileDamagedError extends Error {
  constructor() {
    super(t('The file was changed on the way, so it was not kept.'));
  }
}

/** The file is not on the relay any more: taken already, or expired after 14 days. */
export class FileGoneError extends Error {
  constructor() {
    super(t('The file is not on the server any more. Files wait there 14 days.'));
  }
}

/** Seals the `index`th piece of a file into a chunk of `chunk` bytes. */
export function sealChunk(key: Uint8Array, index: number, data: Uint8Array, chunk: number): Uint8Array {
  if (data.length > room(chunk)) throw new Error('too much for one chunk');
  const plain = new Uint8Array(chunk - SEALING);
  const view = new DataView(plain.buffer);
  view.setUint32(0, index);
  view.setUint32(4, data.length);
  plain.set(data, HEAD);
  return encryptBytes(key, plain);
}

/** The piece of the file in a chunk. Throws FileDamagedError unless it is the `index`th, whole. */
export function openChunk(key: Uint8Array, index: number, sealed: Uint8Array, chunk: number): Uint8Array {
  if (sealed.length !== chunk) throw new FileDamagedError();
  let plain: Uint8Array;
  try {
    plain = decryptBytes(key, sealed);
  } catch {
    throw new FileDamagedError();
  }
  const view = new DataView(plain.buffer, plain.byteOffset, plain.byteLength);
  const length = view.getUint32(4);
  if (view.getUint32(0) !== index || length > plain.length - HEAD) throw new FileDamagedError();
  return plain.slice(HEAD, HEAD + length);
}

// An address a contact gives for a file is opened only as the relay connection opens one (lib/relay.ts).
const isRelayAddress = (value: unknown): value is string => typeof value === 'string' && value.length <= 512 && relayAddress(value);

/**
 * A FileOffer from a message, or null if it is not a well-formed one. `most`: the largest file it
 * may be, larger for one of the files of chats a contact shared (lib/chat-share.ts).
 */
export function readOffer(value: unknown, most = MAX_FILE): FileOffer | null {
  const v = value as Partial<FileOffer> | null;
  if (!v || typeof v !== 'object') return null;
  const meta = {
    name: cleanFileName(typeof v.name === 'string' ? v.name : ''),
    mime: cleanMime(v.mime),
    kind: v.kind,
    size: v.size,
    ...(v.w !== undefined ? { w: v.w } : {}),
    ...(v.h !== undefined ? { h: v.h } : {}),
  };
  if (!isFileMeta(meta) || meta.size > most) return null;
  if (typeof v.key !== 'string' || !/^[0-9a-f]{64}$/.test(v.key) || typeof v.ids !== 'string' || !isIdList(v.ids)) return null;
  // A sticker made from a photo, when it is small enough to be one; otherwise a photo, maybe hidden till tapped.
  // Or, a file, the imported chats a contact shared: to an Erevos from before, a file like any other.
  const history = meta.kind === 'file' ? readSharedMark(v.history) : null;
  const sticker = v.sticker === true && fitsSticker(meta) ? { sticker: true as const } : v.hidden === true && meta.kind === 'photo' ? { hidden: true as const, ...(v.once === true ? { once: true as const } : {}) } : history ? { history } : {};
  if (v.via === 'nostr') {
    // Pieces in wraps: as many as the photo takes, each 32 KB, the last less.
    if (v.relay !== 'nostr' || meta.size > NOSTR_PHOTO_MOST || v.chunk !== NOSTR_PIECE || v.ids.length !== Math.max(1, Math.ceil(meta.size / room(NOSTR_PIECE))) * ID_HEX) return null;
    return { ...meta, ...sticker, relay: 'nostr', ids: v.ids, key: v.key, chunk: NOSTR_PIECE, via: 'nostr' };
  }
  if (v.via === 'blossom') {
    // One blob on a file server: its address and hash.
    if (v.relay !== 'blossom' || meta.size > NOSTR_FILE_MOST || typeof v.url !== 'string' || !/^https:\/\/\S+$/.test(v.url) || v.url.length > 2048) return null;
    if (typeof v.x !== 'string' || !/^[0-9a-f]{64}$/.test(v.x) || v.ids !== v.x.slice(0, ID_HEX) || v.chunk !== BLOB_CHUNK) return null;
    return { ...meta, ...sticker, relay: 'blossom', ids: v.ids, key: v.key, chunk: BLOB_CHUNK, via: 'blossom', url: v.url, x: v.x };
  }
  if (v.via !== undefined || !isRelayAddress(v.relay)) return null;
  const plan = chunkPlan(meta.size);
  if (v.chunk !== plan.chunk || v.ids.length !== plan.count * ID_HEX) return null;
  return { ...meta, ...sticker, relay: v.relay, ids: v.ids, key: v.key, chunk: v.chunk };
}

// What a file to send says of itself, cleaned: a sticker only while it is small enough to be one,
// hidden only when a photo and not a sticker, to see once only when hidden, shared chats only when a file.
function shaped({ sticker, hidden, once, history, ...meta }: Omit<FileMeta, 'size'>, size: number): FileMeta {
  const clean: FileMeta = { ...meta, name: cleanFileName(meta.name), mime: cleanMime(meta.mime), size };
  if (sticker && fitsSticker(clean)) return { ...clean, sticker };
  if (history && clean.kind === 'file') return { ...clean, history };
  return hidden && clean.kind === 'photo' ? { ...clean, hidden, ...(once ? { once } : {}) } : clean;
}

/** Where a file that came is, until it is taken: its chunks are still on the relay. */
export function offerRef({ relay, ids, key, chunk, via, url, x, ...meta }: FileOffer): FileRef {
  return { ...meta, id: newFileId(), key, chunk, count: ids.length / ID_HEX, from: { relay, ids, ...(via ? { via } : {}), ...(url ? { url } : {}), ...(x ? { x } : {}) } };
}

/** Whether a file that came waits on a relay's file store (and needs our relay to be taken), not in Nostr wraps or on a file server. */
export const onRelay = (from: FileFrom): boolean => from.via === undefined;

/** Where to read a file to send from: how big it is, and its bytes from `at`, `length` of them. */
export type Source = { size: number; read(at: number, length: number): Promise<Uint8Array> };

export function bytesSource(bytes: Uint8Array): Source {
  return { size: bytes.length, read: async (at, length) => bytes.subarray(at, at + length) };
}

type Progress = (done: number, count: number) => void;

// When keeping a file last let the screen draw, milliseconds.
let drawn = 0;

/**
 * Lets the screen draw and take taps, a few times a second at most: reading, sealing and writing
 * a file's chunks never wait for anything else, so a large one would hold it still till done.
 */
async function letDraw(): Promise<void> {
  if (Date.now() - drawn < 50) return;
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  drawn = Date.now();
}

/**
 * Encrypts a file, keeps its chunks here and puts them on our relay (`own`, straight, not through
 * a second relay). Returns where it is kept, and the offer for the contact. If the relay cannot
 * take all of it, nothing is kept, here or there.
 */
export async function sendFile(
  own: Relay,
  source: Source,
  meta: Omit<FileMeta, 'size'>,
  progress?: Progress,
): Promise<{ ref: FileRef; offer: FileOffer }> {
  const size = source.size;
  if (size > MAX_FILE) throw new FileTooLargeError();
  const { chunk, count } = chunkPlan(size);
  const key = randomBytes(32);
  const id = newFileId();
  const ids: string[] = [];
  const session = await RelaySession.open({ url: own.url, token: own.token, ...(own.torChat ? { torChat: own.torChat } : {}) }, true);
  try {
    for (let n = 0; n < count; n++) {
      const at = n * room(chunk);
      const sealed = sealChunk(key, n, await source.read(at, Math.min(room(chunk), size - at)), chunk);
      await saveChunk(id, n, sealed);
      ids.push(toHex(await putChunk(session, sealed)));
      progress?.(n + 1, count);
    }
  } catch (error) {
    await deleteChunks(id, count).catch(() => undefined);
    for (const put of ids) await deleteChunk(session, fromHex(put)).catch(() => undefined);
    throw error;
  } finally {
    session.close();
  }
  const ref: FileRef = { ...shaped(meta, size), id, key: toHex(key), chunk, count };
  const { id: _id, count: _count, ...shared } = ref;
  return { ref, offer: { ...shared, relay: own.url, ids: ids.join('') } };
}

/**
 * Encrypts a file and keeps its chunks here only, to put on the relay later (uploadFile): a photo
 * or file that waits (lib/waiting.ts), or one brought in with an imported chat, which may be
 * larger (`most`). If any of it cannot be kept, nothing is.
 */
export async function keepFile(source: Source, meta: Omit<FileMeta, 'size'>, progress?: Progress, most = MAX_FILE, hold?: (id: string, count: number) => Promise<void>): Promise<FileRef> {
  const size = source.size;
  if (size > most) throw new FileTooLargeError();
  const { chunk, count } = chunkPlan(size);
  const key = randomBytes(32);
  const id = newFileId();
  // Noted before its first chunk, when the caller wants it (lib/pending-chunks.ts).
  await hold?.(id, count);
  try {
    for (let n = 0; n < count; n++) {
      const at = n * room(chunk);
      await saveChunk(id, n, sealChunk(key, n, await source.read(at, Math.min(room(chunk), size - at)), chunk));
      progress?.(n + 1, count);
      await letDraw();
    }
  } catch (error) {
    await deleteChunks(id, count).catch(() => undefined);
    throw error;
  }
  return { ...shaped(meta, size), id, key: toHex(key), chunk, count };
}

/**
 * Puts a file kept here (keepFile) on our relay (`own`). Returns the offer for the contact. If the
 * relay cannot take all of it, what it took is deleted there; the chunks here stay. With `from`
 * (milliseconds), for a message sent for later, the chunks' time on the relay starts then.
 */
export async function uploadFile(own: Relay, ref: FileRef, progress?: Progress, from = 0): Promise<FileOffer> {
  if (ref.from) throw new FileMissingError();
  const ids: string[] = [];
  const session = await RelaySession.open({ url: own.url, token: own.token, ...(own.torChat ? { torChat: own.torChat } : {}) }, true);
  try {
    for (let n = 0; n < ref.count; n++) {
      const sealed = await readChunk(ref.id, n);
      if (!sealed) throw new FileMissingError();
      ids.push(toHex(await putChunk(session, sealed, from)));
      progress?.(n + 1, ref.count);
    }
  } catch (error) {
    for (const put of ids) await deleteChunk(session, fromHex(put)).catch(() => undefined);
    throw error;
  } finally {
    session.close();
  }
  const { id: _id, count: _count, ...shared } = ref;
  return { ...shared, relay: own.url, ids: ids.join('') };
}

/**
 * Where a file on the relay at `relay` is taken from: our relay (`own`), and through it the relay
 * the file is on; or, from a place lent on ours, which connects nowhere for us, straight from that
 * relay's /files path (only as takesItself says, when taken by itself).
 */
export function fileWay(own: Relay, relay: string): { at: Relay; via?: string } {
  // A chat that goes only through Tor takes its files on its own circuits (lib/tor-chats.ts).
  const tor = own.torChat ? { torChat: own.torChat } : {};
  if (sameRelay(relay, own.url)) return { at: { url: own.url, token: own.token, ...tor } };
  if (lentAway(own, relay)) return { at: { ...relayPath(relay, '/files'), ...tor } };
  return { at: { url: own.url, token: own.token, ...tor }, via: relay };
}

// Whether a file at `relay` is taken, from a place lent on ours, straight from that relay.
const lentAway = (own: Relay, relay: string): boolean => !sameRelay(relay, own.url) && isLentToken(own.token);

/**
 * Whether a file that came is taken by itself (up to AUTO_TAKE), as it shows, through our relay
 * (`own`). The sender chose where it is: a file server's address, or a relay that, from a place
 * lent on ours, the phone connects to itself. Taken from there straight, that place would learn
 * the phone's address, as a contact's relay never does. So such a file is taken by itself only
 * while that fetch goes through Tor, as the space's Tor way says now (a file from a lent place only
 * with Everything, as files go); otherwise it waits for a tap, as larger ones do, and the owner
 * chooses. One on our relay, one ours fetches from the relay it is on, and a photo whose pieces
 * came through Nostr are taken by themselves.
 */
export function takesItself(own: Relay | null, from: FileFrom): boolean {
  if (from.via === 'nostr') return true;
  if (from.via === 'blossom') return netThroughTor();
  if (!own) return false;
  return !lentAway(own, from.relay) || torFor(true);
}

/**
 * Takes a file that came, through our relay (`own`), checks every chunk and keeps them here, then
 * deletes them from the relay, unless they are left there (`leave`): a group's file the other
 * members take too stays on the relay and expires there. Left out, for a chat's file, the
 * account's other devices say (see watchTakenFiles): while one still takes it, it stays there
 * until it did; a hidden place's chat names its own devices instead (lib/devices.ts, its links).
 * Returns where it is now kept. If any chunk is missing or was changed, nothing is kept. A photo
 * that came in pieces through Nostr is taken from those `place` keeps, the chat's own.
 */
export async function takeFile(own: Relay | null, ref: FileRef, progress?: Progress, leave?: boolean | TakenFiles, place: PiecePlace | null = null, itself = false, torChat = !!own?.torChat): Promise<FileRef> {
  const { from, ...taken } = ref;
  if (!from) return ref;
  // Taken by itself (`itself`), never from where its sender chose straight: see takesItself.
  if (itself && !takesItself(own, from)) throw new FileMissingError();
  // From a file server, through Tor alone for a chat that goes only through it (`torChat`).
  if (!onRelay(from)) return takeSent(ref, from, progress, place, itself, torChat);
  if (!own) throw new FileMissingError();
  const watch = leave === undefined ? takenFiles : typeof leave === 'object' ? leave : null;
  const left = (typeof leave === 'boolean' ? leave : watch?.leave(from)) ?? false;
  const { at, via } = fileWay(own, from.relay);
  const key = fromHex(ref.key);
  const ids = Array.from({ length: ref.count }, (_, n) => fromHex(from.ids.slice(n * ID_HEX, (n + 1) * ID_HEX)));
  // Every chunk already here and whole, from a take the app did not get to record before it
  // ended: nothing to fetch, and nothing to throw away when the relay no longer has them.
  const kept = await keptWhole(ref, key);
  const session = await RelaySession.open(at, true);
  try {
    let size = 0;
    for (let n = 0; n < ref.count && !kept; n++) {
      const sealed = await getChunk(session, ids[n], via);
      if (!sealed) throw new FileGoneError();
      size += openChunk(key, n, sealed, ref.chunk).length;
      await saveChunk(ref.id, n, sealed);
      progress?.(n + 1, ref.count);
    }
    if (!kept && size !== ref.size) throw new FileDamagedError();
    // Taken: the relay need not keep it. One it cannot delete expires there.
    if (!left) for (const id of ids) await deleteChunk(session, id, via).catch(() => false);
  } catch (error) {
    if (!kept) await deleteChunks(ref.id, ref.count).catch(() => undefined);
    throw error;
  } finally {
    session.close();
  }
  watch?.taken(from, left);
  return taken;
}

// Whether every chunk of `ref` is kept here, each one opening to its size: a file taken before.
async function keptWhole(ref: FileRef, key: Uint8Array): Promise<boolean> {
  let size = 0;
  for (let n = 0; n < ref.count; n++) {
    const sealed = await readChunk(ref.id, n).catch(() => null);
    if (!sealed) return false;
    try {
      size += openChunk(key, n, sealed, ref.chunk).length;
    } catch {
      return false;
    }
  }
  return size === ref.size;
}

/** The photo's pieces have not all come through Nostr yet: `have` of `count`. They are taken when they have. */
export class PiecesMissingError extends Error {
  readonly have: number;
  readonly count: number;

  constructor(have: number, count: number) {
    super(t('{have} of {count} pieces of the photo have come.', { have, count }));
    this.have = have;
    this.count = count;
  }
}

// The nonce a file on a file server is sealed with: its key is made for it alone, so one nonce is enough.
const BLOB_NONCE = new Uint8Array(12);

/** A file's bytes sealed to put on a file server: the blob, and its hash (hex). */
export function sealBlob(key: Uint8Array, bytes: Uint8Array): { blob: Uint8Array; x: string } {
  const blob = gcm(key, BLOB_NONCE).encrypt(bytes);
  return { blob, x: toHex(sha256Bytes(blob)) };
}

// Takes a file that came in Nostr wraps (pieces kept by lib/nostr-pieces.ts, in `place`, the chat's
// own storage) or from a file server, and keeps it here as a file that went through the relay would be.
async function takeSent(ref: FileRef, from: FileFrom, progress: Progress | undefined, place: PiecePlace | null, itself: boolean, torChat: boolean): Promise<FileRef> {
  const key = fromHex(ref.key);
  const { name, mime, kind, w, h, sticker, hidden, once } = ref;
  const meta = { name, mime, kind, ...(w !== undefined ? { w } : {}), ...(h !== undefined ? { h } : {}), ...(sticker ? { sticker } : {}), ...(hidden ? { hidden, ...(once ? { once } : {}) } : {}) };
  if (from.via === 'nostr') {
    const came = await piecesCame(place, from.ids);
    const have = came.filter(Boolean).length;
    if (have < ref.count) throw new PiecesMissingError(have, ref.count);
    // Opened whole first (a photo here is NOSTR_PHOTO_MOST at most), then kept in chunks as any
    // file that came: pieces of NOSTR_PIECE kept as they are would make a file whose offer, sent
    // on to a linked device or forwarded through a relay, no phone takes (readOffer's chunk plan).
    const pieces = await readPieces(place, from.ids);
    const parts: Uint8Array[] = [];
    let size = 0;
    for (let n = 0; n < ref.count; n++) {
      const sealed = pieces[n];
      if (!sealed) throw new PiecesMissingError(n, ref.count);
      const part = openChunk(key, n, sealed, ref.chunk);
      size += part.length;
      if (size > ref.size) throw new FileDamagedError();
      parts.push(part);
    }
    if (size !== ref.size) throw new FileDamagedError();
    const bytes = new Uint8Array(size);
    let at = 0;
    for (const part of parts) {
      bytes.set(part, at);
      at += part.length;
    }
    const taken = await keepFile(bytesSource(bytes), meta, progress);
    await dropPieces(place, from.ids).catch(() => undefined);
    return taken;
  }
  if (!from.url || !from.x) throw new FileMissingError();
  // Taken by itself, through Tor alone: never straight should Tor fail on the way. Through Tor
  // whatever the space's way by Nostr's own switch, and for a chat that goes only through Tor.
  const blob = await downloadBlob(from.url, itself, torChat || nostrOwnTor());
  if (toHex(sha256Bytes(blob)) !== from.x) throw new FileDamagedError();
  let bytes: Uint8Array;
  try {
    bytes = gcm(key, BLOB_NONCE).decrypt(blob);
  } catch {
    throw new FileDamagedError();
  }
  if (bytes.length !== ref.size) throw new FileDamagedError();
  // Kept here in chunks, under a key of its own, as any file that came.
  return keepFile(bytesSource(bytes), meta, progress);
}

/** Deletes from the relay, through ours (`own`), a file left there once taken. One it cannot delete expires there. */
export async function dropFile(own: Relay, from: FileFrom): Promise<void> {
  if (!onRelay(from)) return;
  const { at, via } = fileWay(own, from.relay);
  const session = await RelaySession.open(at, true);
  try {
    for (let at = 0; at < from.ids.length; at += ID_HEX) await deleteChunk(session, fromHex(from.ids.slice(at, at + ID_HEX)), via).catch(() => false);
  } finally {
    session.close();
  }
}

/**
 * Ends taking a file that was taken leaving it on the relay (takeFile with `leave` true) until
 * what names it was kept, as the files of chats a contact shared (lib/chat-share.ts): now deleted
 * there, or left for the account's other devices, as takeFile would have with `leave`.
 */
export async function doneTaking(own: Relay, from: FileFrom, leave?: boolean | TakenFiles): Promise<void> {
  const watch = leave === undefined ? takenFiles : typeof leave === 'object' ? leave : null;
  const left = (typeof leave === 'boolean' ? leave : watch?.leave(from)) ?? false;
  if (!left) await dropFile(own, from).catch(() => undefined);
  watch?.taken(from, left);
}

/** The file is not on this phone: not taken from the relay yet, or its chunks are gone. */
export class FileMissingError extends Error {
  constructor() {
    super(t('This file is not on this phone.'));
  }
}

/** Hands the file over a piece at a time, in order, each checked. */
export async function eachPiece(ref: FileRef, take: (piece: Uint8Array) => void | Promise<void>): Promise<void> {
  if (ref.from) throw new FileMissingError();
  const key = fromHex(ref.key);
  let size = 0;
  for (let n = 0; n < ref.count; n++) {
    const sealed = await readChunk(ref.id, n);
    if (!sealed) throw new FileMissingError();
    const piece = openChunk(key, n, sealed, ref.chunk);
    size += piece.length;
    if (size > ref.size) throw new FileDamagedError();
    await take(piece);
  }
  if (size !== ref.size) throw new FileDamagedError();
}

/**
 * A file kept here, to send again (forwarded): its pieces opened as they are read, one chunk at a
 * time. Reading throws FileMissingError when its chunks are not here.
 */
export function refSource(ref: FileRef): Source {
  const key = fromHex(ref.key);
  const piece = room(ref.chunk);
  return {
    size: ref.size,
    read: async (at, length) => {
      if (ref.from) throw new FileMissingError();
      const out = new Uint8Array(Math.max(0, Math.min(length, ref.size - at)));
      let done = 0;
      while (done < out.length) {
        const n = Math.floor((at + done) / piece);
        const sealed = await readChunk(ref.id, n);
        if (!sealed) throw new FileMissingError();
        const data = openChunk(key, n, sealed, ref.chunk);
        const from = at + done - n * piece;
        const part = data.subarray(from, Math.min(data.length, from + out.length - done));
        if (part.length === 0) throw new FileDamagedError();
        out.set(part, done);
        done += part.length;
      }
      return out;
    },
  };
}

/**
 * Takes chunks off our relay before they expire, by their ids (hex, one after another): those of a
 * group's file deleted for everyone. One it cannot take off expires there.
 */
export async function takeOffRelay(own: Relay, ids: string): Promise<void> {
  const session = await RelaySession.open({ url: own.url, token: own.token, ...(own.torChat ? { torChat: own.torChat } : {}) }, true);
  try {
    for (let at = 0; at + ID_HEX <= ids.length; at += ID_HEX) await deleteChunk(session, fromHex(ids.slice(at, at + ID_HEX))).catch(() => false);
  } finally {
    session.close();
  }
}

/** The file's bytes, or null when it is not here (not taken yet, or its chunks are gone). */
export async function readFile(ref: FileRef): Promise<Uint8Array | null> {
  const out = new Uint8Array(ref.size);
  let at = 0;
  try {
    await eachPiece(ref, (piece) => {
      out.set(piece, at);
      at += piece.length;
    });
  } catch (error) {
    if (error instanceof FileMissingError) return null;
    throw error;
  }
  return out;
}

/** How big a file is, for people: 820 KB, 3.4 MB. */
export function fileSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1000 * 1000) return `${Math.round(bytes / 1000)} KB`;
  const mb = bytes / (1000 * 1000);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}
