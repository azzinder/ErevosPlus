// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { itemSource, openItem, type CollectionItem } from '../lock/collection-data';
import { bytesSource } from './attachments';
import { t } from './i18n';
import { photoToSend } from './pick-photo.web';
import { loadPhotoQuality } from './photo-quality';
import type { SharedFile } from './share-in';

// Taking a file out of the Collection (collection-out.ts), in the web build: the desktop app, a
// browser, Sailfish OS. Sent to a chat, a
// file goes as one the chat picked (lib/share-in.web.ts), read from its encrypted chunks as it is
// sent; a photo is made ready in memory as every photo sent from a computer is (lib/pick-photo.web.ts,
// at the photo quality chosen), never written out. Saving a plain copy is lib/save-file.web.ts,
// after the screen's warning: in the desktop app through its own save dialog, on Sailfish OS into
// Downloads, a piece at a time, in a browser to its downloads or the share sheet, there up to 256 MB
// (lib/collection-memory.ts mostSavedOut). Opening with another app is not offered here: it would
// need a plain copy on the disk for the other app to read.

/** Whether a file of the Collection can be opened with another app from here: not in the web build. */
export const CAN_OPEN_WITH = false;

const PHOTOS = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

/** The file to hand to a chat (lib/share-in.web.ts), held in memory, never on the disk. */
export async function copyToSend(item: CollectionItem): Promise<SharedFile> {
  if (item.file.kind !== 'photo' || !PHOTOS.has(item.file.mime)) return { file: '', name: item.file.name, mime: item.file.mime, held: itemSource(item) };
  const bytes = await openItem(item);
  if (!bytes) throw new Error(t('This file is not on this device. It comes from your other devices while one of them has it; a backup restored without it leaves only its name.'));
  const quality = await loadPhotoQuality().catch(() => 'original' as const);
  const photo = await photoToSend(new Blob([bytes as BlobPart], { type: item.file.mime }), quality);
  return { file: '', name: photo.name, mime: photo.mime, held: bytesSource(photo.bytes), w: photo.w ?? item.file.w, h: photo.h ?? item.file.h };
}

/** The Collection's screen closed: nothing was handed to other apps here. */
export const dropOpened = (): void => undefined;

export const openWithOtherApp = (_item: CollectionItem): Promise<void> => Promise.reject(new Error(t('This build of Erevos cannot do this. Update Erevos for it.')));
export const openBytesWithOtherApp = (_item: CollectionItem, _bytes: Uint8Array): Promise<void> => Promise.reject(new Error(t('This build of Erevos cannot do this. Update Erevos for it.')));
