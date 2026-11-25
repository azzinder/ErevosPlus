// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { cleanFileName, cleanMime, deleteChunks, type FileKind, type FileRef } from '../lock/attachment-files';
import { discardDrop, discardOthersDrops, forgetDrop, keepDrop, openDrop, waitingDrops, type Dropped } from '../lock/camera-drop';
import {
  addTakenToCollection,
  CollectionFileDamagedError,
  CollectionFileTooLargeError,
  CollectionStorageFullError,
  isStorageFull,
  MAX_COLLECTION_FILE,
  missingOf,
  type CollectionPlace,
} from '../lock/collection-data';
import { bytesSource, keepFile, type Source } from './attachments';
import { holdChunks, releaseChunks } from './pending-chunks';

// What Erevos's camera took while Erevos was locked, on its way into the Collection
// (lock/camera-drop.ts): kept encrypted as it is taken, with nothing here that opens it again
// (keepDropped), and brought into the Collection of the space it was taken for once that space is
// open (takeDrops). Self-contained on purpose, so it runs under plain Node for checks.

/** What the camera took: its name, type and kind, and for a photo its size as it shows. */
export type DroppedItem = { name: string; mime: string; kind: FileKind; w?: number; h?: number };

/**
 * Encrypts what the camera took into chunks, as a file of the Collection is, and seals its key for
 * the space whose public key is `to`, with its small picture (`thumb`, a JPEG) when there is one.
 * The chunks are noted as being written until their note is kept (lib/pending-chunks.ts), so an
 * Erevos that stops in between leaves none of them. If any of it cannot be kept, nothing is.
 */
export async function keepDropped(to: Uint8Array, source: Source, item: DroppedItem, thumb?: Uint8Array, at = Date.now()): Promise<void> {
  if (source.size > MAX_COLLECTION_FILE) throw new CollectionFileTooLargeError();
  const meta = { name: cleanFileName(item.name), mime: cleanMime(item.mime), kind: item.kind, ...(item.w && item.h ? { w: item.w, h: item.h } : {}) };
  let file: FileRef | null = null;
  let small: FileRef | null = null;
  try {
    file = await keepFile(source, meta, undefined, MAX_COLLECTION_FILE, holdChunks);
    if (thumb) small = await keepFile(bytesSource(thumb), { name: 'thumb.jpg', mime: 'image/jpeg', kind: 'photo' }, undefined, undefined, holdChunks);
    await keepDrop(to, file, small, at);
  } catch (error) {
    if (file) await deleteChunks(file.id, file.count).catch(() => undefined);
    if (small) await deleteChunks(small.id, small.count).catch(() => undefined);
    await releaseChunks([...(file ? [file.id] : []), ...(small ? [small.id] : [])]).catch(() => undefined);
    throw isStorageFull(error) ? new CollectionStorageFullError() : error;
  }
  // Named by their note from now on: no start deletes them.
  await releaseChunks([file.id, ...(small ? [small.id] : [])]).catch(() => undefined);
}

let taking: Promise<number> = Promise.resolve(0);

/**
 * What the camera took while Erevos was locked comes into the Collection of the space open now
 * (`place`, the space's own, whose key opens its notes): the oldest first, each at the top of the
 * Collection, under no folder, and its note goes. How many came in.
 *
 * A note another space's key does not open is left for its space. One of this space's that is
 * not as the camera writes it, or whose chunks are gone (a backup restored since), goes with what
 * chunks it names. Should the catalogue not be saved, the note stays, and is tried again the next
 * time; one whose file the Collection has already is not added twice. One run at a time.
 */
export function takeDrops(place: CollectionPlace): Promise<number> {
  const run = taking
    .catch(() => 0)
    .then(async () => {
      const found: { name: string; held: Dropped }[] = [];
      for (const name of await waitingDrops()) {
        const { mine, held } = await openDrop(name, place.key);
        if (!mine) continue;
        if (!held || (await missingOf(held.file)) > 0) await discardDrop(name);
        else found.push({ name, held });
      }
      found.sort((a, b) => a.held.at - b.held.at);
      let came = 0;
      for (const { name, held } of found) {
        // A small picture that is gone only leaves the file without one.
        const thumb = held.thumb && (await missingOf(held.thumb)) === 0 ? held.thumb : null;
        try {
          await addTakenToCollection(place, { file: held.file, thumb, at: held.at });
        } catch (error) {
          if (error instanceof CollectionFileDamagedError) await discardDrop(name);
          continue;
        }
        if (held.thumb && !thumb) await deleteChunks(held.thumb.id, held.thumb.count).catch(() => undefined);
        await forgetDrop(name);
        came++;
      }
      return came;
    });
  taking = run;
  return run;
}

/**
 * The spaces past `space` stopped opening: the space open now (its key is `spaceKey`) removed its
 * second password, or turned its lock off (lock/config.ts removeSecondPassword, removePasswordLock).
 * What the locked camera took for them would wait for ever, as files that show a space was there.
 * In the first space every note its key does not open is theirs, so those go, with their chunks.
 * In any other space such a note may as well be for a space before it, which still opens, and
 * nothing tells the two apart: they stay. So do they when a second password is set again, which
 * replaces one space and leaves those past it to their own passwords. How many went.
 */
export async function dropsOfClosedSpaces(space: number, spaceKey: Uint8Array): Promise<number> {
  return space === 0 ? discardOthersDrops(spaceKey) : 0;
}
