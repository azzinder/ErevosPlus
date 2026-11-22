// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { addToCollection, MAX_COLLECTION_FILE, type CollectionItem, type CollectionPlace } from '../lock/collection-data';
import { cleanFileName, cleanMime, mimeOf, type FileRef } from '../lock/attachment-files';
import { bytesSource, readFile, refSource, type Source } from './attachments';
import { bitmapOf } from './bitmap.web';
import { photoSize } from './photo';
import { pickPieces } from './pick-file.web';
import type { SharedFile } from './share-in';

// Bringing files into the Collection (collection-import.ts), on a computer. In the desktop app
// (SHELL 'electron'), a file picked in the computer's own file dialog, read a piece at a time
// through the shell as it is encrypted (lib/pick-file.web.ts pickPieces), so even a file of some
// GB is never held whole; and a photo or file of a chat, as on the phone. A photo's small picture
// is drawn by the page on a canvas, a new JPEG, so nothing the photo said besides its picture is in
// it. There is no camera, no gallery to delete from and nothing shared in from other apps.
//
// In a browser (an iPhone's home-screen app too) and on Sailfish OS the same, from the browser's own
// file picker: the file picked is read a slice at a time (File.slice), so it is never held whole
// either. Its chunks go where every file of the app goes (lib/files.ts): the browser's storage,
// one chunk a write, or the Sailfish shell's folder, one file a chunk. A browser that has no room
// left for one keeps none of them (lock/collection-data.ts CollectionStorageFullError).

/** Whether this device can bring files into the Collection: in the web build, everywhere it runs. */
export const CAN_COLLECT = true;
/** Whether a photo can be taken with a camera straight into the Collection: not on a computer. */
export const CAN_TAKE_PHOTO = false;
/** Whether many photos and videos can be picked from a phone's gallery at once: the files' picker does it here. */
export const CAN_PICK_GALLERY = false;
export const CAN_DELETE_ORIGINALS = false;
export const THUMB_SIDE = 256;
// Photos larger than this are kept without a small picture: drawing one would hold too much in memory.
const MOST_THUMBED = 40 * 1000 * 1000;

// AVIF too, which every browser draws; HEIC only Safari does, so it stays a file here.
const PHOTOS = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']);

export type Progress = (done: number, count: number) => void;

export const isPhotoType = (mime: string) => PHOTOS.has(mime);
export const isGalleryType = (mime: string) => mime.startsWith('image/') || mime.startsWith('video/');

const unavailable = () => Promise.reject(new Error('Not in the web build.'));

// The photo drawn anew with its shorter side THUMB_SIDE pixels (never larger than it is), turned
// upright, as a JPEG; and how large the photo is as it shows. Undefined where it cannot be drawn.
async function drawn(bytes: Uint8Array): Promise<{ thumb: Uint8Array; w: number; h: number } | undefined> {
  if (bytes.length > MOST_THUMBED || typeof document === 'undefined') return undefined;
  try {
    const image = await bitmapOf(new Blob([bytes as BlobPart]));
    try {
      const scale = Math.min(1, THUMB_SIDE / Math.max(1, Math.min(image.width, image.height)));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) return undefined;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));
      if (!blob) return undefined;
      return { thumb: new Uint8Array(await blob.arrayBuffer()), w: image.width, h: image.height };
    } finally {
      image.close();
    }
  } catch {
    // Kept without one; the grid shows a plain tile for it.
    return undefined;
  }
}

/** The small picture of a photo held in memory, or undefined when it cannot be drawn. */
export async function thumbOf(bytes: Uint8Array): Promise<Uint8Array | undefined> {
  return (await drawn(bytes))?.thumb;
}

export const importFromCamera = (_place: CollectionPlace, _folder: string, _progress?: Progress): Promise<CollectionItem | null> => unavailable();

/** Picks a file from the computer, or the phone's files, into the Collection, in `folder`, or returns null if the owner cancelled. */
export async function importFromFiles(place: CollectionPlace, folder: string, progress?: Progress, _options: { deleteOriginal?: boolean; told?: (text: string) => void; gallery?: boolean } = {}): Promise<CollectionItem | null> {
  const picked = await pickPieces(MAX_COLLECTION_FILE);
  if (!picked) return null;
  try {
    const name = cleanFileName(picked.name);
    const said = cleanMime(picked.mime);
    const mime = said === 'application/octet-stream' ? mimeOf(name) : said;
    return await keepSource(place, folder, { name, mime, source: picked.source }, progress);
  } finally {
    picked.close();
  }
}

// A file read from `source`: a photo gets its small picture, read whole for the purpose when it is small enough.
async function keepSource(place: CollectionPlace, folder: string, file: { name: string; mime: string; source: Source }, progress?: Progress): Promise<CollectionItem> {
  const photo = isPhotoType(file.mime);
  let thumb: Uint8Array | undefined;
  let size: { w: number; h: number } | null = null;
  if (photo && file.source.size <= MOST_THUMBED) {
    const whole = await file.source.read(0, file.source.size);
    const made = await drawn(whole);
    thumb = made?.thumb;
    size = photoSize(whole) ?? (made ? { w: made.w, h: made.h } : null);
  }
  return addToCollection(place, file.source, { name: file.name, mime: file.mime, kind: photo ? 'photo' : 'file', w: size?.w, h: size?.h }, { folder, thumb, progress });
}

/** Telegram's files are not on the web. */
export const importFromPath = (_place: CollectionPlace, _path: string, _name: string, _mime: string, _folder = '', _progress?: Progress): Promise<CollectionItem> => unavailable();

export const importShared = (_place: CollectionPlace, _shared: SharedFile, _folder: string, _progress?: Progress): Promise<CollectionItem> => unavailable();

/** Copies a photo, video, sound or file of a chat on another network, or of an MMS, into the Collection, from its bytes, as on the phone. */
export function importFromBytes(place: CollectionPlace, file: { name: string; mime: string; bytes: Uint8Array }, folder = '', progress?: Progress): Promise<CollectionItem> {
  const name = cleanFileName(file.name);
  const said = cleanMime(file.mime);
  return keepSource(place, folder, { name, mime: said === 'application/octet-stream' ? mimeOf(name) : said, source: bytesSource(file.bytes) }, progress);
}

/** Copies a photo or file of a chat into the Collection, as the same bytes, encrypted anew with a key of its own. */
export async function importFromChat(place: CollectionPlace, ref: FileRef, folder = '', progress?: Progress): Promise<CollectionItem> {
  const photo = ref.kind === 'photo';
  const thumb = photo && ref.size <= MOST_THUMBED ? await readFile(ref).then((bytes) => (bytes ? thumbOf(bytes) : undefined)) : undefined;
  return addToCollection(place, refSource(ref), { name: ref.name, mime: ref.mime, kind: ref.kind, w: ref.w, h: ref.h }, { folder, thumb, progress });
}
