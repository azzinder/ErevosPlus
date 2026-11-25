// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { device, type AppSpaceRow } from "../modules/erevos-device";
import { locale, t } from "./i18n";

// What takes room on the phone (app/backup.tsx): Erevos's own files by their kind, as
// modules/erevos-device's AppSpace.kt measures them, in words. Only on Android; elsewhere the
// system shows it, and this is null.

/** A kind of files, in words, with its bytes and how many files. */
export type SpaceRow = { label: string; bytes: number; files: number };

const KINDS: Record<string, () => string> = {
  "erevos-file-": () => t("The Collection, and photos and files in chats"),
  "erevos-voice-": () => t("Voice messages"),
  "erevos-avatar-": () => t("Contact pictures"),
  "erevos-page-": () => t("Chat history"),
  "erevos-backup-": () => t("Backups kept inside Erevos"),
  "files/tor/": () => "Tor",
  "*.new": () => t("Left over from writes that did not end"),
  "*.part": () => t("Left over from writes that did not end"),
  "cache/": () => t("Cache"),
  "code_cache/": () => t("Cache"),
};

/** How much room Erevos takes, the largest first; null where it cannot be measured. */
export async function measureAppSpace(): Promise<SpaceRow[] | null> {
  if (!device?.appSpace) return null;
  const rows = await device.appSpace();
  return rows ? spaceRows(rows) : null;
}

/** The measured kinds in words, those of the same words together, the largest first. */
export function spaceRows(rows: AppSpaceRow[]): SpaceRow[] {
  const joined = new Map<string, SpaceRow>();
  for (const { kind, bytes, files } of rows) {
    const label = KINDS[kind]?.() ?? t("Other: {name}", { name: kind });
    const row = joined.get(label) ?? { label, bytes: 0, files: 0 };
    row.bytes += bytes;
    row.files += files;
    joined.set(label, row);
  }
  return [...joined.values()]
    .filter((row) => row.bytes > 0)
    .sort((a, b) => b.bytes - a.bytes);
}

// The kinds a backup's parts are made of: photos and files, and voice messages (lock/backup.ts).
const IN_PARTS = new Set(["erevos-file-", "erevos-voice-"]);

/** Of the measured kinds, the bytes of those a backup holds in its parts. */
export function partsBytes(rows: AppSpaceRow[]): number {
  return rows
    .filter(({ kind }) => IN_PARTS.has(kind))
    .reduce((sum, row) => sum + row.bytes, 0);
}

/**
 * About how much a backup made whole now holds, at most: the photos, files and voice messages on
 * the phone, which are nearly all of one. More than it holds when a Collection is kept out of
 * backups. Null where it cannot be measured, or there is none of them.
 */
export async function wholeBackupAtMost(): Promise<number | null> {
  if (!device?.appSpace) return null;
  const rows = await device.appSpace();
  return (rows && partsBytes(rows)) || null;
}

/** "15.3 GB", "240 MB", "12 KB". */
export function spaceText(bytes: number): string {
  if (bytes >= 1e9) {
    const gb = Math.round(bytes / 1e8) / 10;
    try {
      return `${gb.toLocaleString(locale(), { maximumFractionDigits: 1 })} GB`;
    } catch {
      return `${gb} GB`;
    }
  }
  if (bytes >= 1e6) return `${Math.round(bytes / 1e6)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}
