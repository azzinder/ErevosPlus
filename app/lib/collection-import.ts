// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { File, FileMode, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { addSealedToCollection, addToCollection, CollectionFileTooLargeError, MAX_COLLECTION_FILE, type CollectionItem, type CollectionPlace } from '../lock/collection-data';
import { cleanFileName, cleanMime, mimeOf, type FileRef } from '../lock/attachment-files';
import { bytesSource, readFile, refSource, type Source } from './attachments';
import { fromBase64, randomBytes, toHex } from './crypto';
import { plural, t } from './i18n';
import { NoCameraError, preparePhoto } from './pick-photo';
import { photoSize } from './photo';
import { pickLinks, pickSource } from './pick-file';
import { whilePicking } from './picking';
import { isSharedPhoto, readShared, type SharedFile } from './share-in';
import { cameraView, collectionNative } from '../modules/erevos-collection';

// Bringing photos and files into the Collection (lock/collection-data.ts), on the phone: a photo
// taken with the camera, a file picked from the phone's files, a photo or file another app shared,
// and a photo or file of a chat, Erevos's, one on another network or an MMS. Each goes straight into the Collection, encrypted a piece at a
// time, with a small picture of a photo. A file picked from the phone's files is read from
// Android's link by modules/erevos-collection and encrypted as it is read, with no copy anywhere,
// up to the Collection's 4 GB. A photo or file another app shared comes already encrypted the same
// way (modules/erevos-collection, ShareActivity.kt), with no copy either. In a build without that,
// and for the camera, the copies that Android or the picker leave in the app's cache are deleted
// as soon as they are read. When the owner chose it (lock/collection-data.ts
// deleteOriginals), a photo or video picked from the phone's gallery is then deleted there:
// Android asks the owner to confirm, in a dialog of its own, and does it (Android 11 and later,
// modules/erevos-collection). A photo taken with the camera never goes to the gallery at all, and a
// file that is not the gallery's is never touched. In the desktop app, collection-import.web.ts.

/** Whether this device can bring files into the Collection. */
export const CAN_COLLECT = true;
/** Whether a photo can be taken with Erevos's own camera straight into the Collection (not in builds before it). */
export const CAN_TAKE_PHOTO = cameraView() !== null;
/** Whether many photos and videos can be picked from the gallery at once. */
export const CAN_PICK_GALLERY = true;

/** The side of a photo's small picture, its shorter side, in points. */
export const THUMB_SIDE = 256;
// Photos larger than this are kept without a small picture: drawing one would hold too much in memory.
const MOST_THUMBED = 40 * 1000 * 1000;

// What shows as a photo; anything else is a file. HEIC (HEIF) and AVIF are drawn by Android itself
// (9 and 12 and later): where it cannot, the viewer offers to open the photo with another app.
const PHOTOS = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/avif']);

export type Progress = (done: number, count: number) => void;

/** Whether a file of this type is kept as a photo. */
export const isPhotoType = (mime: string) => PHOTOS.has(mime);

// The small JPEG of the photo at `uri`: its shorter side THUMB_SIDE points, drawn anew, so nothing
// the photo said besides its picture is in it.
async function thumbAt(uri: string, size: { w: number; h: number } | null): Promise<Uint8Array | undefined> {
  try {
    const resize = size && size.h > size.w ? { width: THUMB_SIDE } : size ? { height: THUMB_SIDE } : { width: THUMB_SIDE };
    const image = await ImageManipulator.manipulate(uri).resize(resize).renderAsync();
    const saved = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
    const file = new File(saved.uri);
    try {
      return await file.bytes();
    } finally {
      if (file.exists) file.delete();
    }
  } catch {
    // The photo is kept without one; the grid shows a plain tile for it.
    return undefined;
  }
}

/** The small picture of a photo held in memory, or undefined when it cannot be drawn. */
export async function thumbOf(bytes: Uint8Array): Promise<Uint8Array | undefined> {
  if (bytes.length > MOST_THUMBED) return undefined;
  const copy = new File(Paths.cache, `erevos-thumb-${toHex(randomBytes(8))}`);
  try {
    copy.create();
    copy.writeSync(bytes);
    return await thumbAt(copy.uri, photoSize(bytes));
  } finally {
    if (copy.exists) copy.delete();
  }
}

/** Takes a photo with the camera into the Collection, in `folder`, or returns null if the owner went back. */
export async function importFromCamera(place: CollectionPlace, folder: string, progress?: Progress): Promise<CollectionItem | null> {
  const allowed = await ImagePicker.requestCameraPermissionsAsync();
  if (!allowed.granted) throw new NoCameraError();
  const taken = await whilePicking(() => ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, exif: false, allowsEditing: false }));
  const asset = taken.canceled ? null : taken.assets[0];
  if (!asset) return null;
  try {
    const photo = await preparePhoto(asset, 'original');
    const thumb = await thumbAt(asset.uri, photoSize(photo.bytes));
    return await addToCollection(place, bytesSource(photo.bytes), { name: stamped(photo.name), mime: photo.mime, kind: 'photo', w: photo.w, h: photo.h }, { folder, thumb, progress });
  } finally {
    // The copy the camera left in the cache goes as soon as it is encrypted, or fails to be.
    const copy = new File(asset.uri);
    if (asset.uri.startsWith(Paths.cache.uri) && copy.exists) copy.delete();
  }
}

/**
 * Encrypts a video a camera wrote into the app's cache (`uri`) into the Collection, a piece at a
 * time, and deletes that copy at once, whether it went in or not.
 */
export async function keepVideoFile(place: CollectionPlace, folder: string, uri: string, name: string, mime: string, progress?: Progress): Promise<CollectionItem> {
  return withRecording(uri, (source) => addToCollection(place, source, { name, mime, kind: 'file' }, { folder, progress }));
}

/**
 * A video the camera recorded into the app's cache (`uri`), read a piece at a time by `keep` as it
 * is encrypted, and that copy deleted whatever comes of it.
 */
export async function withRecording<T>(uri: string, keep: (source: Source) => Promise<T>): Promise<T> {
  const copy = new File(uri);
  try {
    if (copy.size > MAX_COLLECTION_FILE) throw new CollectionFileTooLargeError();
    const handle = copy.open(FileMode.ReadOnly);
    try {
      const read = async (at: number, length: number) => {
        if (handle.offset !== at) handle.offset = at;
        return handle.readBytesSync(length);
      };
      return await keep({ size: copy.size, read });
    } finally {
      handle.close();
    }
  } finally {
    if (copy.exists) copy.delete();
  }
}

// A name for what the camera made: the day and time, as phones name their photos and videos.
export function stamped(name: string, now = new Date(), start = 'IMG', fallback = '.jpg'): string {
  const two = (n: number) => String(n).padStart(2, '0');
  const ending = name.includes('.') ? name.slice(name.lastIndexOf('.')) : fallback;
  return `${start}_${now.getFullYear()}${two(now.getMonth() + 1)}${two(now.getDate())}_${two(now.getHours())}${two(now.getMinutes())}${two(now.getSeconds())}${ending}`;
}

/** Whether this phone can delete a photo or video from the gallery once it is in the Collection: Android 11 and later. */
export const CAN_DELETE_ORIGINALS = !!collectionNative?.canDeleteFromGallery();

/** Whether a file of this type may be deleted from the gallery once in the Collection: a photo or a video. */
export const isGalleryType = (mime: string) => mime.startsWith('image/') || mime.startsWith('video/');

/**
 * Picks files from the phone's files into the Collection, in `folder`, one or many at once, or
 * returns null if the owner went back; else the last one added. With `gallery`, the picker shows
 * the gallery's photos and videos only. With `deleteOriginal`, the photos and videos the gallery
 * has are then deleted there, all in one, once they are safely in the Collection and the owner
 * confirms in Android's dialog; nothing else is. `told` hears how it went when there is more to say
 * than the file shown: how many came in, which were too large, why an original stays.
 */
export async function importFromFiles(
  place: CollectionPlace,
  folder: string,
  progress?: Progress,
  { deleteOriginal = false, told, gallery = false }: { deleteOriginal?: boolean; told?: (text: string) => void; gallery?: boolean } = {},
): Promise<CollectionItem | null> {
  if (!canSealLinks()) {
    // A build without the Android part reads one file, through a copy in the cache.
    const picked = await pickSource(MAX_COLLECTION_FILE);
    if (!picked) return null;
    let added: CollectionItem;
    try {
      added = await keepSource(place, folder, { ...typed(picked), source: picked.source }, progress);
    } finally {
      picked.close();
    }
    if (deleteOriginal && picked.uri) await deleteOriginals([added], [picked.uri], told);
    return added;
  }
  // Read straight from Android's links and encrypted as each is read: no copy in the cache.
  const picked = await pickLinks(MAX_COLLECTION_FILE, gallery ? ['image/*', 'video/*'] : ['*/*']);
  if (!picked) return null;
  if (picked.files.length === 0) {
    if (picked.tooLarge > 0) throw new CollectionFileTooLargeError();
    return null;
  }
  const added: CollectionItem[] = [];
  const uris: string[] = [];
  const count = picked.files.length;
  try {
    for (const [index, file] of picked.files.entries()) {
      // One file's progress is shown as its share of all of them.
      const each: Progress | undefined = progress ? (done, of) => progress(index * 1000 + Math.round((done / Math.max(1, of)) * 1000), count * 1000) : undefined;
      added.push(await keepLink(place, folder, { ...file, ...typed(file) }, each));
      uris.push(file.uri);
    }
  } catch (error) {
    // What came in before stays; the owner hears how many, then why the rest did not.
    if (added.length === 0) throw error;
    told?.(t('{done} of {count} files are in the Collection. {error}', { done: String(added.length), count: String(count), error: error instanceof Error ? error.message : String(error) }));
    return added[added.length - 1];
  }
  if (deleteOriginal) await deleteOriginals(added, uris, told);
  if (picked.tooLarge > 0) told?.(plural(picked.tooLarge, '{n} file was left out: larger than the Collection holds.', '{n} files were left out: larger than the Collection holds.'));
  else if (count > 1 && !deleteOriginal) told?.(plural(count, '{n} file is in the Collection.', '{n} files are in the Collection.'));
  return added[added.length - 1];
}

// Asks Android to delete from the gallery the originals of the photos and videos just added; it
// says whether it did. When none was the gallery's, or Android would not, the owner is told why
// the originals stay.
async function deleteOriginals(added: CollectionItem[], uris: string[], told?: (text: string) => void): Promise<void> {
  if (!CAN_DELETE_ORIGINALS) return;
  const theirs = uris.filter((_, i) => isGalleryType(added[i].file.mime));
  if (theirs.length === 0) return;
  const outcome = await collectionNative?.deleteFromGallery(theirs).catch(() => 'failed' as const);
  if (outcome === 'none') told?.(t('In the Collection. The original stays: Android did not say which photo of the gallery it is. Pick it from Images or the phone’s storage, not from Recent.'));
  else if (outcome === 'failed') told?.(t('In the Collection. Android could not delete the original.'));
  else if (outcome === 'deleted' && theirs.length > 1) told?.(plural(theirs.length, '{n} file is in the Collection, and its original is deleted from the gallery.', '{n} files are in the Collection, and their originals are deleted from the gallery.'));
}

// A picked file's clean name, and its type: the one the phone said, else the one its name says.
function typed(picked: { name: string; mime: string }): { name: string; mime: string } {
  const name = cleanFileName(picked.name);
  const said = cleanMime(picked.mime);
  return { name, mime: said === 'application/octet-stream' ? mimeOf(name) : said };
}

// Whether this build's Android part encrypts a picked file from its link (builds before it do not).
const canSealLinks = () => typeof collectionNative?.sealFromUri === 'function' && typeof collectionNative.readHead === 'function';

// Enough of a photo's start to hold its header, where its size is (lib/photo.ts photoSize).
const PHOTO_HEAD = 256 * 1024;

// A file read from Android's link by modules/erevos-collection, encrypted into chunks as it goes
// (Sealer.kt). A photo's size comes from the first bytes of it alone, and its small picture is
// drawn from the link; neither leaves a copy of the photo. Cancelled with the panic button.
async function keepLink(place: CollectionPlace, folder: string, file: { name: string; mime: string; size: number; uri: string }, progress?: Progress): Promise<CollectionItem> {
  const native = collectionNative!;
  const photo = isPhotoType(file.mime);
  let thumb: Uint8Array | undefined;
  let size: { w: number; h: number } | null = null;
  if (photo && file.size <= MOST_THUMBED) {
    size = await native.readHead!(file.uri, PHOTO_HEAD)
      .then((head) => photoSize(fromBase64(head)))
      .catch(() => null);
    thumb = await thumbAt(file.uri, size);
  }
  const job = toHex(randomBytes(8));
  const subscription = progress ? native.addListener('onSeal', (e) => e.job === job && progress(e.done, e.count)) : null;
  let sealed;
  try {
    sealed = await native.sealFromUri!(file.uri, file.size, job);
  } catch (error) {
    throw (error as { code?: string }).code === 'ERR_TOO_LARGE' ? new CollectionFileTooLargeError() : error;
  } finally {
    subscription?.remove();
  }
  return addSealedToCollection(place, sealed, { name: file.name, mime: file.mime, kind: photo ? 'photo' : 'file', w: size?.w, h: size?.h }, { folder, thumb });
}

// A file read from `source`: a photo gets its small picture, read whole for the purpose.
async function keepSource(place: CollectionPlace, folder: string, file: { name: string; mime: string; source: { size: number; read(at: number, length: number): Promise<Uint8Array> }; w?: number; h?: number }, progress?: Progress): Promise<CollectionItem> {
  const photo = isPhotoType(file.mime);
  let thumb: Uint8Array | undefined;
  let size = file.w && file.h ? { w: file.w, h: file.h } : null;
  if (photo && file.source.size <= MOST_THUMBED) {
    const whole = await file.source.read(0, file.source.size);
    thumb = await thumbOf(whole);
    size = size ?? photoSize(whole);
  }
  return addToCollection(place, file.source, { name: file.name, mime: file.mime, kind: photo ? 'photo' : 'file', w: size?.w, h: size?.h }, { folder, thumb, progress });
}

/**
 * Brings a photo or file another app shared into the Collection (lib/share-in.ts): one encrypted
 * as it came is taken as it is, its chunks and its small picture, with no plain copy anywhere;
 * a copy in the cache is deleted once read.
 */
export async function importShared(place: CollectionPlace, shared: SharedFile, folder: string, progress?: Progress): Promise<CollectionItem> {
  if (shared.sealed) {
    const sealed = shared.sealed;
    // Android lets go of its key first: should the catalogue not take it, addSealedToCollection deletes the chunks.
    try {
      collectionNative?.sharedKeep?.(sealed.id);
    } catch {
      // Its key is let go of with the next share.
    }
    const photo = isPhotoType(shared.mime);
    const thumb = photo ? shared.thumb : undefined;
    progress?.(sealed.count, sealed.count);
    return addSealedToCollection(place, sealed, { name: shared.name, mime: shared.mime, kind: photo ? 'photo' : 'file', w: photo ? shared.w : undefined, h: photo ? shared.h : undefined }, { folder, thumb });
  }
  const read = await readShared(shared);
  try {
    // A shared photo comes ready as bytes (cleaned of what it said besides its picture).
    const photo = isSharedPhoto(shared);
    return await keepSource(place, folder, { name: read.name, mime: read.mime, source: read.source, w: photo ? read.w : undefined, h: photo ? read.h : undefined }, progress);
  } finally {
    read.close();
  }
}

/** Brings a file another network keeps on this phone (a Telegram file TDLib downloaded, `path`) into the Collection, encrypted with a key of its own. */
export async function importFromPath(place: CollectionPlace, path: string, name: string, mime: string, folder = '', progress?: Progress): Promise<CollectionItem> {
  const file = new File(path.startsWith('file://') ? path : `file://${path}`);
  if (file.size > MAX_COLLECTION_FILE) throw new CollectionFileTooLargeError();
  const handle = file.open(FileMode.ReadOnly);
  try {
    const read = async (at: number, length: number) => {
      if (handle.offset !== at) handle.offset = at;
      return handle.readBytes(length);
    };
    return await keepSource(place, folder, { name: cleanFileName(name), mime: cleanMime(mime), source: { size: file.size, read } }, progress);
  } finally {
    handle.close();
  }
}

/**
 * Copies a photo, video, sound or file of a chat on another network (Matrix, XMPP, Nostr) or of
 * an MMS into the Collection, from its bytes as they were fetched and opened: encrypted with a key
 * of its own, a photo with its small picture.
 */
export function importFromBytes(place: CollectionPlace, file: { name: string; mime: string; bytes: Uint8Array }, folder = '', progress?: Progress): Promise<CollectionItem> {
  return keepSource(place, folder, { ...typed(file), source: bytesSource(file.bytes) }, progress);
}

/** Copies a photo or file of a chat into the Collection, as the same bytes, encrypted anew with a key of its own. */
export async function importFromChat(place: CollectionPlace, ref: FileRef, folder = '', progress?: Progress): Promise<CollectionItem> {
  const photo = ref.kind === 'photo';
  const thumb = photo && ref.size <= MOST_THUMBED ? await readFile(ref).then((bytes) => (bytes ? thumbOf(bytes) : undefined)) : undefined;
  return addToCollection(place, refSource(ref), { name: ref.name, mime: ref.mime, kind: ref.kind, w: ref.w, h: ref.h }, { folder, thumb, progress });
}
