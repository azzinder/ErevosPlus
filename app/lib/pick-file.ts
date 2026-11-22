// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { File, FileMode, Paths } from 'expo-file-system';

import { type Source } from './attachments';
import { randomBytes, toHex } from './crypto';
import { fileName } from './imports';
import { CLEAN_MOST, cleanImage, isPhotoHead } from './photo';
import { whilePicking } from './picking';

// A file the owner picks to open (a backup, a chat export), read whole into memory, or to send,
// read a piece at a time. On the phone, with the system's file picker; on a computer, in the
// desktop app (pick-file.web.ts).
//
// Android hands a picked file over by a descriptor that it may close while the file is still being
// read, so a file to send is first copied into the app's own cache, read a piece at a time from
// there, and the copy deleted once sent.

const SENDING = 'erevos-send-';
// The copies being read now; any other is left over from a send that never ended.
const reading = new Set<string>();

function clearLeftovers(): void {
  try {
    for (const entry of Paths.cache.list()) {
      if (entry instanceof File && entry.name.startsWith(SENDING) && !reading.has(entry.uri)) entry.delete();
    }
  } catch {
    // Tried again with the next file.
  }
}

export class TooLargeError extends Error {}

/**
 * A file picked to send: its name, its type if the phone knows it, and where to read it from.
 * Close it when done. `uri` is the link Android gave for it, where the phone says one (the
 * Collection asks the gallery to delete a photo picked from it, lib/collection-import.ts).
 */
export type PickedSource = { name: string; mime: string; source: Source; close(): void; uri?: string; keepsPlace?: true };

/**
 * A file picked, not read nor copied: its name, its type if the phone knows it, its size as the
 * phone says it, and its link, for what reads it straight from there (the Collection's import on
 * Android, modules/erevos-collection). Null if the owner went back; TooLargeError above `most`.
 */
export async function pickLink(most: number): Promise<{ name: string; mime: string; size: number; uri: string } | null> {
  const picked = await whilePicking(() => File.pickFileAsync({ mimeTypes: ['*/*'] }));
  if (picked.canceled) return null;
  const file = picked.result;
  if (file.size > most) throw new TooLargeError();
  return { name: fileName(file.uri), mime: file.type, size: file.size, uri: file.uri };
}

/**
 * Many files picked at once, not read nor copied, as pickLink: the owner may choose one or more.
 * `types` narrows what the picker shows (the gallery's photos and videos: image/*, video/*). Null
 * if the owner went back. Files above `most` are left out and counted (`tooLarge`).
 */
export async function pickLinks(most: number, types: string[] = ['*/*']): Promise<{ files: { name: string; mime: string; size: number; uri: string }[]; tooLarge: number } | null> {
  const picked = await whilePicking(() => File.pickFileAsync({ mimeTypes: types, multipleFiles: true }));
  if (picked.canceled) return null;
  const files: { name: string; mime: string; size: number; uri: string }[] = [];
  let tooLarge = 0;
  for (const file of picked.result) {
    if (file.size > most) tooLarge += 1;
    else files.push({ name: fileName(file.uri), mime: file.type, size: file.size, uri: file.uri });
  }
  return { files, tooLarge };
}

/**
 * A file to send, or null if the owner went back. Throws TooLargeError above `most` bytes. With
 * `clean`, a photo sent as a file (JPEG, PNG, GIF, WebP, up to CLEAN_MOST) goes without what it says
 * besides its picture, as a photo does (lib/photo.ts cleanImage); one that cannot be cleaned (HEIC,
 * AVIF, or larger) says so (`keepsPlace`), as it may still say where and when it was taken.
 */
export async function pickSource(most: number, clean = false): Promise<PickedSource | null> {
  const picked = await whilePicking(() => File.pickFileAsync({ mimeTypes: ['*/*'] }));
  if (picked.canceled) return null;
  const file = picked.result;
  if (file.size > most) throw new TooLargeError();
  clearLeftovers();
  const copy = new File(Paths.cache, `${SENDING}${toHex(randomBytes(8))}`);
  reading.add(copy.uri);
  const done = () => {
    reading.delete(copy.uri);
    if (copy.exists) copy.delete();
  };
  let handle: ReturnType<File['open']>;
  let keepsPlace = false;
  try {
    await file.copy(copy);
    if (copy.size > most) throw new TooLargeError();
    if (clean && copy.size <= CLEAN_MOST) {
      const cleaned = cleanImage(await copy.bytes());
      if (cleaned) {
        await copy.write(cleaned);
        clean = false;
      }
    }
    handle = copy.open(FileMode.ReadOnly);
    keepsPlace = clean && isPhotoHead(handle.readBytesSync(32));
    handle.offset = 0;
  } catch (error) {
    done();
    throw error;
  }
  const read = async (at: number, length: number) => {
    if (handle.offset !== at) handle.offset = at;
    return handle.readBytesSync(length);
  };
  const close = () => {
    handle.close();
    done();
  };
  return { name: fileName(file.uri), mime: file.type, source: { size: copy.size, read }, close, uri: file.uri, ...(keepsPlace ? { keepsPlace: true as const } : {}) };
}

/** The file's name and bytes, or null if the owner went back. Throws TooLargeError above `most` bytes. */
export async function pickFile(most: number): Promise<{ name: string; bytes: Uint8Array } | null> {
  const picked = await whilePicking(() => File.pickFileAsync({ mimeTypes: ['*/*'] }));
  if (picked.canceled) return null;
  const file = picked.result;
  if (file.size > most) throw new TooLargeError();
  // On Android the address, a content URI, holds the name the owner sees.
  return { name: fileName(file.uri), bytes: await file.bytes() };
}
