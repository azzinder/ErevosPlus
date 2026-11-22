// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { startActivityAsync } from 'expo-intent-launcher';
import { Directory, File, FileMode, Paths } from 'expo-file-system';

import { itemSource, type CollectionItem } from '../lock/collection-data';
import { collectionNative } from '../modules/erevos-collection';
import { eachPiece } from './attachments';
import { sealedRef } from './collection-play';
import { randomBytes, toBase64, toHex } from './crypto';
import { t } from './i18n';
import { isSharedPhoto, type SharedFile } from './share-in';

// Taking a file out of the Collection, on the phone: to send it to a chat, as a file another app
// shared is sent (lib/share-in.ts; only a photo has a plain copy, deleted once read), and to open
// it with another app, which reads it through a link of Erevos's own (modules/erevos-collection,
// CollectionProvider.kt) that streams it as it is decrypted, with no copy anywhere. The link works
// until the Collection's screen closes, or the space locks or closes. Saving to the phone's own
// folders is lib/save-file.ts. In the desktop app, collection-out.web.ts.

/** Whether a file of the Collection can be opened with another app from here. */
export const CAN_OPEN_WITH = true;

// Where an Erevos before this kept the plain copies it opened files from: deleted once, if any are left.
const OPENING = 'erevos-open-';
const FLAG_GRANT_READ_URI_PERMISSION = 1;

let oldCopiesGone = false;

function dropOldCopies(): void {
  if (oldCopiesGone) return;
  oldCopiesGone = true;
  try {
    for (const entry of Paths.cache.list()) {
      if (entry instanceof Directory && entry.name.startsWith(OPENING)) entry.delete();
    }
  } catch {
    // Tried again with the next start.
  }
}

async function writePieces(item: CollectionItem, file: File): Promise<void> {
  file.create();
  const handle = file.open(FileMode.Truncate);
  try {
    await eachPiece(item.file, (piece) => handle.writeBytesSync(piece));
  } finally {
    handle.close();
  }
}

/**
 * The file to hand to a chat (lib/share-in.ts). A file other than a photo is read from its
 * encrypted chunks as the chat sends it, and never lies plain on the disk. A photo is made ready
 * as every photo sent is (lib/photo-quality.ts), which reads it from a file: a plain copy in the
 * cache, named as Send to names the copies of what is shared, deleted as soon as it was read.
 */
export async function copyToSend(item: CollectionItem): Promise<SharedFile> {
  if (!isSharedPhoto({ file: '', name: item.file.name, mime: item.file.mime })) return { file: '', name: item.file.name, mime: item.file.mime, held: itemSource(item) };
  const name = `erevos-shared-${toHex(randomBytes(8))}`;
  const copy = new File(Paths.cache, name);
  try {
    await writePieces(item, copy);
  } catch (error) {
    if (copy.exists) copy.delete();
    throw error;
  }
  return { file: name, name: item.file.name, mime: item.file.mime };
}

/** Forgets the links handed to other apps from the Collection's screen, and closes its PDFs: the screen closed. */
export function dropOpened(): void {
  dropOldCopies();
  collectionNative?.forgetAll();
}

/** Opens the file with the app Android offers for its type, by a link that streams it decrypted until `dropOpened`. */
export async function openWithOtherApp(item: CollectionItem): Promise<void> {
  dropOldCopies();
  if (!collectionNative) throw new Error(t('This build of Erevos cannot do this. Update Erevos for it.'));
  const { token, uri } = collectionNative.openWith(sealedRef(item.file), item.file.name, item.file.mime);
  try {
    await startActivityAsync('android.intent.action.VIEW', { data: uri, type: item.file.mime, flags: FLAG_GRANT_READ_URI_PERMISSION });
  } catch (error) {
    collectionNative.forget(token);
    throw error;
  }
}

/**
 * Opens a photo of the Collection with another app from bytes made ready for it (its place and
 * time taken out, lib/collection-export.ts), served from memory by a link of Erevos's own until
 * `dropOpened`, with no copy on the disk.
 */
export async function openBytesWithOtherApp(item: CollectionItem, bytes: Uint8Array): Promise<void> {
  if (!collectionNative?.openBytesWith) throw new Error(t('This build of Erevos cannot do this. Update Erevos for it.'));
  const { token, uri } = collectionNative.openBytesWith(toBase64(bytes), item.file.name, item.file.mime);
  try {
    await startActivityAsync('android.intent.action.VIEW', { data: uri, type: item.file.mime, flags: FLAG_GRANT_READ_URI_PERMISSION });
  } catch (error) {
    collectionNative.forget(token);
    throw error;
  }
}
