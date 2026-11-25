// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { addToCollection, type CollectionItem, type CollectionPlace } from '../lock/collection-data';
import { bytesSource } from './attachments';
import { keepDropped } from './camera-drops';
import { keepVideoFile, stamped, withRecording } from './collection-import';
import { fromBase64 } from './crypto';

// What Erevos's own camera (components/erevos-camera.tsx, CameraPreview.kt) takes, into the
// Collection. A photo comes as JPEG bytes held in memory, never written anywhere: drawn anew by
// the camera with nothing but its picture (no place, no time, no phone), it is encrypted with a
// key of its own, and its bytes here zeroed. A video is recorded by the camera into the app's
// cache and encrypted from there a piece at a time, that copy deleted at once.
//
// With Erevos locked the camera takes the same way, for the Collection of the space opened last
// (dropPicture, dropRecording): encrypted as above, and the file's key sealed for that space's
// public key, so nothing on the phone opens it until the space's password is given
// (lock/camera-drop.ts, lib/camera-drops.ts).

/** A photo as the camera hands it over: its JPEG bytes (or base64 of them), its size as it shows, and its small picture. */
export type TakenPhoto = { data: Uint8Array | string; width: number; height: number; thumb?: Uint8Array | string };

const asBytes = (data: Uint8Array | string) => (typeof data === 'string' ? fromBase64(data) : data);

/** Keeps a photo the camera took into memory in the Collection, in `folder`: the new item. */
export async function keepPicture(place: CollectionPlace, folder: string, photo: TakenPhoto): Promise<CollectionItem> {
  const bytes = asBytes(photo.data);
  try {
    // The camera draws the small picture itself, so the photo never goes to a file, even for a moment.
    const thumb = photo.thumb ? asBytes(photo.thumb) : undefined;
    return await addToCollection(place, bytesSource(bytes), { name: stamped('photo.jpg'), mime: 'image/jpeg', kind: 'photo', w: photo.width, h: photo.height }, { folder, thumb });
  } finally {
    bytes.fill(0);
  }
}

/** Keeps a video the camera recorded into the app's cache (`uri`) in the Collection, in `folder`, and deletes that copy: the new item. */
export function keepRecording(place: CollectionPlace, folder: string, uri: string): Promise<CollectionItem> {
  return keepVideoFile(place, folder, uri, stamped('video.mp4', new Date(), 'VID', '.mp4'), 'video/mp4');
}

/** Keeps a photo the camera took into memory with Erevos locked, sealed for the space whose public key is `to`. */
export async function dropPicture(to: Uint8Array, photo: TakenPhoto, now = new Date()): Promise<void> {
  const bytes = asBytes(photo.data);
  try {
    const thumb = photo.thumb ? asBytes(photo.thumb) : undefined;
    await keepDropped(to, bytesSource(bytes), { name: stamped('photo.jpg', now), mime: 'image/jpeg', kind: 'photo', w: photo.width, h: photo.height }, thumb, now.getTime());
  } finally {
    bytes.fill(0);
  }
}

/** Keeps a video the camera recorded into the app's cache (`uri`) with Erevos locked, sealed for the space whose public key is `to`, and deletes that copy. */
export function dropRecording(to: Uint8Array, uri: string, now = new Date()): Promise<void> {
  return withRecording(uri, (source) => keepDropped(to, source, { name: stamped('video.mp4', now, 'VID', '.mp4'), mime: 'video/mp4', kind: 'file' }, undefined, now.getTime()));
}
