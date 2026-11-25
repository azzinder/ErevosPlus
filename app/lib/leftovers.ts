// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { device } from "../modules/erevos-device";
import { waitingDrops } from "../lock/camera-drop";
import { PAGE_PREFIX, sealedFile, type Holder } from "../lock/sealed-file";
import { decryptBytes, utf8Decode } from "./crypto";
import { readBytes, readFile } from "./files";
import { t } from "./i18n";

// Leftovers (app/backup.tsx, «Leftovers»): the photos and files on the phone that no place the
// owner opened names any more, as those an import wrote before Erevos stopped in its middle
// (lib/pending-chunks.ts keeps that from happening again). Each file's chunks are sealed with a
// key of their own and named by a random id, and the phone cannot tell whose they are: only a
// place's own sealed values (lock/sealed-file.ts), opened with its key, name its files. So the
// owner opens here every place there is, the space and each place of hidden chats (and any other
// space), and only the files none of them names are leftovers.
//
// What is read, for each place, is every sealed value it has in every file of sealed values,
// whatever the file, and the pages they name: every run of 32 hex digits in them is taken as a
// file's id, and so are the first and the last 32 of a longer run. That names more than the files
// really kept, never fewer, so nothing a place keeps is taken for a leftover, whatever kind of value
// keeps it; and a file of sealed values that cannot be read stops the search. A file written in the last day is never
// one, as one an import, a download or a share is writing now. What is found is shown first, and
// deleted only when the owner says so. Nothing leaves the phone.
//
// One kind of file no place names yet, and it is never a leftover: what Erevos's camera took while
// Erevos was locked (lock/camera-drop.ts). Until its own space opens and takes it into its
// Collection, only its note names its chunks, and a note opens with that space's key alone. Its
// chunks' ids are in it in the clear, so they are read whichever places were opened here
// (idsOfDrops): the owner may be looking from another space, a day and more after taking it.

/** A place whose sealed values are read: the space's or its hidden chats', with its key. */
export type Place = { holder: Holder; space: number; key: Uint8Array };

/** Files no opened place names: their ids, and the bytes and chunks of all of them. */
export type Leftovers = { ids: string[]; bytes: number; files: number };

/** A file younger than this is never a leftover: it may be being written. */
export const LEFTOVER_AGE_MS = 24 * 3600 * 1000;

const HEX = /[0-9a-f]{32,}/g;
const PAGE_ID = /^[0-9a-f]{24}$/;

/** Whether leftovers can be looked for here: on Android, in a build with AppSpace's functions. */
export const canFindLeftovers = (): boolean =>
  !!(device?.chunkFiles && device.storeNames && device.deleteChunkFiles);

/**
 * Every id a text may name: each run of exactly 32 hex digits; of a longer run, its first 32 and
 * its last 32, as an id written right after or right before other hex digits, and each 32 of one
 * cut in 32s.
 */
export function idsIn(text: string, into = new Set<string>()): Set<string> {
  for (const [run] of text.matchAll(HEX)) {
    into.add(run.slice(0, 32));
    if (run.length === 32) continue;
    into.add(run.slice(-32));
    if (run.length % 32 === 0)
      for (let at = 32; at < run.length - 32; at += 32)
        into.add(run.slice(at, at + 32));
  }
  return into;
}

// Whether a file's text is one of sealed values: an object with the space's slots.
function isStore(text: string | null): boolean {
  if (!text || text[0] !== "{") return false;
  try {
    const v = JSON.parse(text) as { space?: unknown };
    return Array.isArray(v.space);
  } catch {
    return false;
  }
}

/** Every id `place` may name, in the files of sealed values `stores`. */
export async function idsOfPlace(
  place: Place,
  stores: string[],
  into = new Set<string>(),
): Promise<Set<string>> {
  for (const name of stores) {
    let value: unknown;
    try {
      value = await sealedFile<unknown>({
        name,
        empty: null,
        checked: (v) => v,
        block: 1,
      }).load(place.holder, place.space, place.key);
    } catch {
      // A value whose pages cannot be read may name any file: none is taken for a leftover.
      throw new Error(
        t(
          "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.",
        ),
      );
    }
    if (value === null) continue;
    const text = JSON.stringify(value);
    idsIn(text, into);
    // The history's pages (lock/history.ts), each sealed with the place's key.
    const pages = (value as { pages?: unknown }).pages;
    if (Array.isArray(pages)) {
      for (const id of pages) {
        if (typeof id !== "string" || !PAGE_ID.test(id)) continue;
        const page = await readBytes(PAGE_PREFIX + id);
        if (!page) continue;
        let bytes: Uint8Array;
        try {
          bytes = decryptBytes(place.key, page);
        } catch {
          continue;
        }
        idsIn(utf8Decode(bytes), into);
      }
    }
  }
  return into;
}

/** The files of sealed values on the phone. */
export async function storeFiles(): Promise<string[]> {
  const names = (await device?.storeNames?.()) ?? [];
  const stores: string[] = [];
  for (const name of names) {
    let text: string | null;
    try {
      text = await readFile(name);
    } catch {
      // A file that cannot be read may be one of sealed values, which may name any file.
      throw new Error(
        t(
          "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.",
        ),
      );
    }
    if (isStore(text)) stores.push(name);
  }
  return stores;
}

/**
 * Every id a note of the locked camera names (lock/camera-drop.ts): each note as it lies, read as
 * a place's values are, so more is named than it holds, never fewer. One that cannot be read may
 * name any file, and stops the search.
 */
export async function idsOfDrops(
  into = new Set<string>(),
): Promise<Set<string>> {
  try {
    for (const name of await waitingDrops()) {
      const text = await readFile(name);
      if (text) idsIn(text, into);
    }
  } catch {
    throw new Error(
      t(
        "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.",
      ),
    );
  }
  return into;
}

/**
 * Every id something on the phone names: the notes of the locked camera, then each of `places` in
 * the files of sealed values `stores`. The notes first: one whose space takes it into its
 * Collection meanwhile is named by the one or by the other.
 */
export async function namedBy(
  places: Place[],
  stores: string[],
): Promise<Set<string>> {
  const named = await idsOfDrops();
  for (const place of places) await idsOfPlace(place, stores, named);
  return named;
}

/** The files neither `places` nor a note of the locked camera names, written more than a day before `now`. */
export async function findLeftovers(
  places: Place[],
  now = Date.now(),
): Promise<Leftovers> {
  if (!canFindLeftovers() || places.length === 0)
    return { ids: [], bytes: 0, files: 0 };
  const named = await namedBy(places, await storeFiles());
  return leftoversOf((await device!.chunkFiles!()) ?? [], named, now);
}

/** Of the files on the phone, those not `named` and older than a day. */
export function leftoversOf(
  files: { id: string; bytes: number; files: number; at: number }[],
  named: ReadonlySet<string>,
  now: number,
): Leftovers {
  const left = files.filter(
    (file) => !named.has(file.id) && now - file.at > LEFTOVER_AGE_MS,
  );
  return {
    ids: left.map((file) => file.id),
    bytes: left.reduce((n, f) => n + f.bytes, 0),
    files: left.reduce((n, f) => n + f.files, 0),
  };
}

/** Deletes the leftovers found: the bytes that went. */
export async function deleteLeftovers(found: Leftovers): Promise<number> {
  if (!device?.deleteChunkFiles || found.ids.length === 0) return 0;
  return device.deleteChunkFiles(found.ids);
}
