// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { itemSource, type CollectionItem } from '../lock/collection-data';
import { playKind } from './collection-view';
import { CLEAN_MOST, cleanImage } from './photo';
import { photoPlace, videoPlace, type Place } from './media-place';

// What a file of the Collection says besides itself, for when it leaves Erevos (app/collection.tsx):
// saved to the phone or the computer, or opened with another app. Inside the Collection a photo
// keeps all it came with, encrypted; on the way out a photo goes without where and when it was
// taken and the phone (lib/photo.ts cleanImage), unless the owner chose otherwise for the place
// (lock/collection-data.ts exportWhole). A video, or a photo that cannot be cleaned here (HEIC,
// AVIF, or larger than CLEAN_MOST), goes as it is: the owner is told first when it names a place.

// How much of a large photo is read to look for its place: EXIF is at the start of a JPEG.
const HEAD = 1024 * 1024;

/** Whether the file says where it was taken (a photo or video), read from its encrypted chunks; "unknown" for other files, or one not here. */
export async function itemPlace(item: CollectionItem): Promise<Place> {
  try {
    if (playKind(item) === 'video') return await videoPlace(itemSource(item));
    if (item.file.kind !== 'photo' && !item.file.mime.startsWith('image/')) return 'unknown';
    const whole = item.file.size <= CLEAN_MOST;
    const bytes = await itemSource(item).read(0, whole ? item.file.size : HEAD);
    return photoPlace(bytes, whole);
  } catch {
    return 'unknown';
  }
}

/** The photo's bytes without what it says besides its picture, to take out of the Collection; null when it goes as it is (not a photo cleaned here, or too large). */
export async function cleanedPhoto(item: CollectionItem): Promise<Uint8Array | null> {
  if (item.file.size > CLEAN_MOST || !/^image\/(jpeg|png|gif|webp)$/.test(item.file.mime)) return null;
  try {
    return cleanImage(await itemSource(item).read(0, item.file.size));
  } catch {
    return null;
  }
}
