// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { addToCollection, itemSource, type CollectionItem, type CollectionPlace } from '../lock/collection-data';
import { bytesSource } from './attachments';
import { toBase64 } from './crypto';
import { thumbOf } from './collection-import';
import { photoSize } from './photo';
import { editedName, wholeCut, type Cut, type Turn } from './photo-cut';

// A photo of the Collection turned and cut (components/collection-edit.tsx), on the phone: drawn
// anew from its bytes held in memory, never from a plain copy, and kept as a new photo next to
// it, encrypted as any other; the photo it came from stays as it was. The new one is a JPEG (a
// PNG stays a PNG) with nothing in it but its picture. Android's own drawing reads HEIC and AVIF
// too. In the desktop app, collection-edit.web.ts.

/** Whether a photo can be turned and cut here. */
export const CAN_EDIT = true;

export { editedName, wholeCut, type Cut, type Turn } from './photo-cut';

/** The photo turned by `turn` quarters and cut to `cut`, kept as a new photo in its folder; the new item. */
export async function editPhoto(place: CollectionPlace, item: CollectionItem, turn: Turn, cut: Cut): Promise<CollectionItem> {
  const bytes = await itemSource(item).read(0, item.file.size);
  const png = item.file.mime === 'image/png';
  const turned = await ImageManipulator.manipulate(`data:${item.file.mime};base64,${toBase64(bytes)}`)
    .rotate(turn * 90)
    .renderAsync();
  let image = turned;
  if (!wholeCut(cut)) {
    const x = Math.max(0, Math.floor(cut.x * turned.width));
    const y = Math.max(0, Math.floor(cut.y * turned.height));
    const width = Math.max(1, Math.min(turned.width - x, Math.round(cut.w * turned.width)));
    const height = Math.max(1, Math.min(turned.height - y, Math.round(cut.h * turned.height)));
    image = await ImageManipulator.manipulate(turned).crop({ originX: x, originY: y, width, height }).renderAsync();
  }
  const saved = await image.saveAsync({ compress: 0.95, format: png ? SaveFormat.PNG : SaveFormat.JPEG });
  const file = new File(saved.uri);
  let made: Uint8Array;
  try {
    made = await file.bytes();
  } finally {
    // The drawn file in the cache goes as soon as it is read.
    if (file.exists) file.delete();
  }
  const size = photoSize(made);
  const thumb = await thumbOf(made);
  const mime = png ? 'image/png' : 'image/jpeg';
  return addToCollection(place, bytesSource(made), { name: editedName(item.file.name, png ? '.png' : '.jpg'), mime, kind: 'photo', w: size?.w ?? image.width, h: size?.h ?? image.height }, { folder: item.folder, thumb });
}
