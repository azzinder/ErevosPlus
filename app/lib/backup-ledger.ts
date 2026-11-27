// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { PartMade } from '../lock/backup';

import { decryptBytes, encryptBytes, sha256Bytes, utf8Decode, utf8Encode } from './crypto';
import { readBytes, writeBytes } from './files';

// What automatic backups (lib/backup-folder.ts) made in each place they go to, their folder, their
// server and Google Drive: each backup's name there, with the parts it names (lock/backup.ts
// PartMade). The next one there names again those it can, without reading anything back, and the
// place keeps every part one of the backups it keeps names. The stamps of the parts' files are here
// only, as no backup holds them.
//
// Kept on this phone alone, in one file sealed with a key automatic backups' own key gives: in no
// backup, so a restore leaves it as it is, and their places still hold what it says. With another
// key, as once their password changed, it opens as empty: the backups made with the one before are
// then not known here, and their places keep every part until those backups are no longer among
// the newest (unneededFiles, lib/backup-cloud.ts). Only the places automatic backups go to now are
// kept in it.

/** The parts each backup in a place names, by the backup's name there. */
export type Book = Map<string, PartMade[]>;

/** Every place's book, by the place (folderPlace, serverPlace, drivePlace). */
export type Ledger = Map<string, Book>;

const FILE = 'erevos-backup-ledger';
const LABEL = utf8Encode('erevos backup ledger 1\n');

/** The place a folder is, by its uri or path. */
export const folderPlace = (folder: string): string => `folder ${folder}`;

/** The place a server's folder is, by its address. */
export const serverPlace = (url: string): string => `server ${url}`;

/** The place the folder Erevos made in Google Drive is, by its ID there. */
export const drivePlace = (folder: string): string => `drive ${folder}`;

// The ledger's key: another than automatic backups' own, so nothing sealed with one opens with the other.
function ledgerKey(key: Uint8Array): Uint8Array {
  const joined = new Uint8Array(LABEL.length + key.length);
  joined.set(LABEL);
  joined.set(key, LABEL.length);
  return sha256Bytes(joined);
}

// As JSON, each place holds each of its parts once, by its name, and each backup the names of its parts.
type PartJson = Omit<PartMade, 'name' | 'out'>;
type PlaceJson = { parts: Record<string, PartJson>; backups: Record<string, string[]> };

const isText = (value: unknown): value is string => typeof value === 'string';
const isWhole = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

function partOf(name: string, value: unknown): PartMade | null {
  const v = (value ?? {}) as Partial<Record<keyof PartJson, unknown>>;
  if (!isText(v.sha) || !isText(v.id) || !isWhole(v.n) || !isWhole(v.size)) return null;
  if (!Array.isArray(v.files) || !v.files.every(isText) || !Array.isArray(v.stamps) || !v.stamps.every(isText) || v.stamps.length !== v.files.length) return null;
  return { name, sha: v.sha, id: v.id, n: v.n, size: v.size, files: v.files, stamps: v.stamps, out: [] };
}

/** The ledger, as automatic backups with `key` keep it; empty when there is none, or it is another key's. */
export async function loadLedger(key: Uint8Array): Promise<Ledger> {
  const ledger: Ledger = new Map();
  const sealed = await readBytes(FILE);
  if (!sealed) return ledger;
  let places: Record<string, PlaceJson>;
  try {
    places = (JSON.parse(utf8Decode(decryptBytes(ledgerKey(key), sealed))) as { places: Record<string, PlaceJson> }).places;
  } catch {
    return ledger;
  }
  for (const [place, value] of Object.entries(places ?? {})) {
    const parts = new Map<string, PartMade>();
    for (const [name, part] of Object.entries(value?.parts ?? {})) {
      const made = partOf(name, part);
      if (made) parts.set(name, made);
    }
    const book: Book = new Map();
    for (const [backup, names] of Object.entries(value?.backups ?? {})) {
      // A backup whose parts are not all known here is not known at all.
      const named = Array.isArray(names) ? names.map((name) => (isText(name) ? parts.get(name) : undefined)) : [];
      if (Array.isArray(names) && named.every((part): part is PartMade => !!part)) book.set(backup, named);
    }
    ledger.set(place, book);
  }
  return ledger;
}

/** Keeps the ledger, sealed with a key `key` gives. */
export async function saveLedger(key: Uint8Array, ledger: Ledger): Promise<void> {
  const places: Record<string, PlaceJson> = {};
  for (const [place, book] of ledger) {
    const parts: Record<string, PartJson> = {};
    const backups: Record<string, string[]> = {};
    for (const [backup, named] of book) {
      backups[backup] = named.map((part) => part.name);
      for (const { name, sha, id, n, size, files, stamps } of named) parts[name] ??= { sha, id, n, size, files, stamps };
    }
    places[place] = { parts, backups };
  }
  await writeBytes(FILE, encryptBytes(ledgerKey(key), utf8Encode(JSON.stringify({ places }))));
}
