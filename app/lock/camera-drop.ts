// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { canRelaySeal, canSealOpen, relaySeal, sealOpen, sealPublic } from '../lib/core';
import { fromBase64, fromHex, randomBytes, sameBytes, toBase64, toHex, utf8Decode, utf8Encode } from '../lib/crypto';
import { deleteFile, listFiles, readFile, writeFile } from '../lib/files';
import { secureDelete, secureGet, secureSet } from '../lib/secure';

import { deleteChunks, isFileRef, type FileRef } from './attachment-files';

// What Erevos's camera takes while Erevos is locked (components/erevos-camera.tsx, the password
// screen in app/_layout.tsx). With the password lock, the camera's icon opens the camera without
// the password, and what it took shows only once the password is given (the owner's word,
// 2026-11-25). The locked camera holds no key that opens anything: not a space's, and not the one
// that opens what it took itself.
//
// A photo or video taken then is encrypted into chunks as a file of the Collection is
// (lib/attachments.ts keepFile), with a key of its own made at random; a photo never lies plain on
// the phone, and a video only in the camera's cache while it is recorded, as with Erevos open
// (lib/camera-cache.ts). That key, with the file's name, type and size, is then sealed for a public
// key, by the core's relaySeal (X25519, HKDF-SHA-256, ChaCha20-Poly1305: crates/erevos-core
// relay_seal.rs), into a note kept beside the chunks, `erevos-drop-<id>`. Whoever holds the phone
// can add notes, and read none.
//
// The public key is that of the space opened last (`erevos.camera-drop`, in the keystore, outside
// every space, as it is read with Erevos locked). Its secret is made from the space's key
// (dropSecret), so it is nowhere on the phone, and only that space's password gives it. As the
// space opens, its notes are opened, what they name goes into its Collection, and the notes go
// (lib/camera-drops.ts takeDrops). A note another space's key does not open stays as it is,
// for its own space: what was taken for one space never shows in another, whichever password is
// given next.
//
// What stays shows, though not in Erevos: while something waits for a space, its note and its
// chunks lie in Erevos's folder, and another space that opens leaves them there. Whoever is shown
// that other space and can read the folder (a forensic tool) can tell from them that there is a
// space they were not shown. The guide says so, with the switch below as the way out. Nothing in
// Erevos's own screens shows them: the search for leftovers counts every note's chunks as named
// (lib/leftovers.ts idsOfDrops), so it neither shows nor deletes them. When the first space removes
// its second password or turns its lock off, no other space opens any more, and the notes its key
// does not open go with their chunks (discardOthersDrops).
//
// A note says in the clear only the ids of its chunks and how many each file has, which the
// chunks' own names say anyway: so its chunks can go with a note that nothing will open any more.
// Notes are in no backup: restoring one deletes them with their chunks, and the public key, as the
// spaces are the backup's from then on (lock/backup.ts); the camera opens locked again once one of
// them was opened.
//
// The switch (`erevos.camera-open`) is the phone's own, the same in every space: on unless the
// owner turned it off in the Collection's settings. Off, no public key is kept, so the camera's
// icon waits for the password as every other link does; what was taken before still comes in.

const OPEN = 'erevos.camera-open';
const KEY = 'erevos.camera-drop';
/** The notes' files, in the app's folder. */
export const DROP_PREFIX = 'erevos-drop-';
/** The keystore entries of the locked camera: the switch travels in backups, the public key never does. */
export const CAMERA_OPEN_KEY = OPEN;
export const CAMERA_DROP_KEY = KEY;

const HEX_KEY = /^[0-9a-f]{64}$/;
const ID = /^[0-9a-f]{32}$/;
const NOTE = /^erevos-drop-[0-9a-f]{32}$/;
// What relaySeal carries beside the message, 24 bytes: here it says what the message is, and a
// note is taken only with it, so nothing else sealed for the same key is ever read as one.
const MARK = (() => {
  const mark = new Uint8Array(24);
  mark.set(utf8Encode('erevos camera drop v1'));
  return mark;
})();
// As many chunks as a file of the Collection may have (lock/collection-data.ts COLLECTION_CHUNKS);
// a small picture is one chunk.
const MOST_CHUNKS = 4096;
const MOST_NOTE = 16 * 1024;

/** What a note holds: the file as it lies in its chunks, its small picture if it has one, and when it was taken. */
export type Dropped = { file: FileRef; thumb: FileRef | null; at: number };

/** The secret half of a space's key for the locked camera: made from the space's key, kept nowhere. */
export function dropSecret(spaceKey: Uint8Array): Uint8Array {
  return hkdf(sha256, spaceKey, undefined, utf8Encode('erevos camera drop v1'), 32);
}

/** Whether this build can seal for a public key and open it again (a core from before it cannot). */
export function canDrop(): boolean {
  return canRelaySeal() && canSealOpen();
}

/** Whether the camera opens with Erevos locked: on unless the owner turned it off. */
export async function cameraOpensLocked(): Promise<boolean> {
  try {
    return (await secureGet(OPEN)) !== 'no';
  } catch {
    return false;
  }
}

/**
 * Lets the camera open with Erevos locked, or keeps it behind the password: then the public key
 * goes at once. Turned on, the space open now gives its key (`spaceKey`).
 */
export async function setCameraOpensLocked(on: boolean, spaceKey?: Uint8Array): Promise<void> {
  if (!on) await secureDelete(KEY);
  await secureSet(OPEN, on ? 'yes' : 'no');
  if (on && spaceKey) await publishDropKey(spaceKey);
}

/**
 * A space behind a password opens: from now on the locked camera takes for it. With the switch
 * off, or in a build that cannot seal, no key is kept.
 */
export async function publishDropKey(spaceKey: Uint8Array): Promise<void> {
  if (!canDrop() || !(await cameraOpensLocked())) {
    await secureDelete(KEY);
    return;
  }
  const secret = dropSecret(spaceKey);
  try {
    const made = toHex(await sealPublic(secret));
    if ((await secureGet(KEY)) !== made) await secureSet(KEY, made);
  } finally {
    secret.fill(0);
  }
}

/** No space behind a password is open any more (the lock was turned off): the camera takes for none. */
export async function forgetDropKey(): Promise<void> {
  await secureDelete(KEY);
}

/** The public key the locked camera seals for, or null: turned off, no space opened yet, or a build that cannot. */
export async function dropKey(): Promise<Uint8Array | null> {
  try {
    if (!canDrop() || !(await cameraOpensLocked())) return null;
    const hex = await secureGet(KEY);
    return hex && HEX_KEY.test(hex) ? fromHex(hex) : null;
  } catch {
    return null;
  }
}

const named = (file: FileRef) => ({ id: file.id, count: file.count });

/**
 * Seals what the camera took, already in its chunks (`file`, and its small picture `thumb`), for
 * the space whose public key is `to`, in a note of its own. If the note cannot be kept, it throws,
 * and the chunks are the caller's to delete.
 */
export async function keepDrop(to: Uint8Array, file: FileRef, thumb: FileRef | null, at: number): Promise<string> {
  const held: Dropped = { file, thumb, at };
  const plain = utf8Encode(JSON.stringify(held));
  try {
    const sealed = await relaySeal(to, MARK, plain);
    const name = DROP_PREFIX + toHex(randomBytes(16));
    await writeFile(name, JSON.stringify({ v: 1, files: [named(file), ...(thumb ? [named(thumb)] : [])], sealed: toBase64(sealed) }));
    return name;
  } finally {
    plain.fill(0);
  }
}

/** The notes waiting, by their files' names. */
export async function waitingDrops(): Promise<string[]> {
  return (await listFiles(DROP_PREFIX)).filter((name) => NOTE.test(name)).sort();
}

type Read = { files: { id: string; count: number }[]; sealed: Uint8Array };

// A note as it lies: the chunks it names, and what is sealed; null when it does not read.
async function read(name: string): Promise<Read | null> {
  if (!NOTE.test(name)) return null;
  try {
    const text = await readFile(name);
    if (!text || text.length > MOST_NOTE) return null;
    const v = JSON.parse(text) as { v?: unknown; files?: unknown; sealed?: unknown };
    if (v.v !== 1 || !Array.isArray(v.files) || v.files.length < 1 || v.files.length > 2 || typeof v.sealed !== 'string') return null;
    const files: Read['files'] = [];
    for (const one of v.files as { id?: unknown; count?: unknown }[]) {
      if (!one || typeof one.id !== 'string' || !ID.test(one.id) || !Number.isInteger(one.count) || (one.count as number) < 1 || (one.count as number) > MOST_CHUNKS) return null;
      files.push({ id: one.id, count: one.count as number });
    }
    return { files, sealed: fromBase64(v.sealed) };
  } catch {
    return null;
  }
}

// A file as a note may name it: one of the Collection's, on this phone only.
const fileOf = (value: unknown): FileRef | null => (isFileRef(value, MOST_CHUNKS) && !value.from ? value : null);

/**
 * What a note holds, opened with the key of the space open now: `mine` false when it is another
 * space's, which no one else can tell from one that does not read, so it is left as it is; `mine`
 * true and nothing held when it opened and is not as the camera writes one, so it can go.
 */
export async function openDrop(name: string, spaceKey: Uint8Array): Promise<{ mine: boolean; held: Dropped | null }> {
  const note = await read(name);
  if (!note || !canDrop()) return { mine: false, held: null };
  const secret = dropSecret(spaceKey);
  let opened: { senderId: Uint8Array; message: Uint8Array };
  try {
    opened = await sealOpen(secret, note.sealed);
  } catch {
    return { mine: false, held: null };
  } finally {
    secret.fill(0);
  }
  try {
    if (!sameBytes(opened.senderId, MARK)) return { mine: true, held: null };
    const v = JSON.parse(utf8Decode(opened.message)) as { file?: unknown; thumb?: unknown; at?: unknown };
    const file = fileOf(v.file);
    const thumb = v.thumb === null || v.thumb === undefined ? null : fileOf(v.thumb);
    if (!file || (v.thumb !== null && v.thumb !== undefined && !thumb)) return { mine: true, held: null };
    // The chunks it says in the clear are the very ones it holds sealed: nothing else is ever deleted by it.
    const said = [named(file), ...(thumb ? [named(thumb)] : [])];
    if (said.length !== note.files.length || said.some((one, i) => one.id !== note.files[i].id || one.count !== note.files[i].count)) return { mine: true, held: null };
    const at = typeof v.at === 'number' && Number.isSafeInteger(v.at) && v.at >= 0 ? v.at : 0;
    return { mine: true, held: { file, thumb, at } };
  } catch {
    return { mine: true, held: null };
  } finally {
    opened.message.fill(0);
  }
}

/** The note goes; its chunks stay (they are the Collection's now). */
export async function forgetDrop(name: string): Promise<void> {
  if (NOTE.test(name)) await deleteFile(name);
}

/** The note goes with the chunks it names: nothing will open it any more, or it is not as the camera writes one. */
export async function discardDrop(name: string): Promise<void> {
  const note = await read(name);
  for (const file of note?.files ?? []) await deleteChunks(file.id, file.count).catch(() => undefined);
  if (NOTE.test(name)) await deleteFile(name);
}

/**
 * Every note the key of the space open now does not open goes, with the chunks it names: for when
 * no other space opens any more, so nothing would ever open them (lib/camera-drops.ts
 * dropsOfClosedSpaces). A note that does not read as one stays as it is. How many went.
 */
export async function discardOthersDrops(spaceKey: Uint8Array): Promise<number> {
  if (!canDrop()) return 0;
  let gone = 0;
  for (const name of await waitingDrops()) {
    const note = await read(name);
    if (!note) continue;
    const secret = dropSecret(spaceKey);
    let mine = true;
    try {
      (await sealOpen(secret, note.sealed)).message.fill(0);
    } catch {
      mine = false;
    } finally {
      secret.fill(0);
    }
    if (mine) continue;
    await discardDrop(name);
    gone++;
  }
  return gone;
}

/**
 * Every note goes, with its chunks, and the public key: a backup was restored, and the spaces are
 * the backup's from then on. The camera opens locked again once one of them was opened.
 */
export async function discardDrops(): Promise<void> {
  await secureDelete(KEY).catch(() => undefined);
  for (const name of await waitingDrops().catch(() => [] as string[])) await discardDrop(name).catch(() => undefined);
}
