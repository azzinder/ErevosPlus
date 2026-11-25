// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Directory, File } from 'expo-file-system';

import { backupFileName, backupFileOf, backupStem, freeStem, partFileName, staleBackups, type PartReader, type PartSink } from '../lock/backup';
import { device } from '../modules/erevos-device';
import type { BackupFiles } from './backup-check';
import { t } from './i18n';
import { whilePicking } from './picking';

// Where backups go on the phone (lib/backup-folder.ts): a folder the owner picks with Android's
// folder picker, on the phone, a memory card, or a cloud app that offers its folders there.
// Android lets Erevos write in that folder from then on. A folder is known by its uri. Hidden chats
// stay open while one is picked (lib/picking.ts), as a .vcf file of theirs is saved in one.
//
// A backup is a file, and its parts (photos, files and voice messages, lock/backup.ts) files beside
// it with the same start: each part is written as it is made, then the backup itself, last. One
// that fails leaves none of its files there. An automatic backup may also name parts earlier ones
// wrote there, under their names (lock/backup.ts). To restore one with parts, Erevos reads them by
// their names, whatever their start, from the folder it is in, which the owner picks, as Android
// lets an app read only the file picked, and what is in a folder picked.

/** Whether backups can be made here: always on the phone. */
export const CAN_BACK_UP = true;

/** Whether backups can be made by themselves, every day or week: on the phone, yes. */
export const CAN_AUTO_BACKUP = true;

/** Whether automatic backups can go to a server too (lib/backup-cloud.ts): on the phone, yes. */
export const CAN_CLOUD_BACKUP = true;

/** Whether a backup can be restored from such a server: on the phone, yes. */
export const CAN_CLOUD_RESTORE = true;

/** Whether the server has to let this app in (CORS): only a browser asks that. */
export const CLOUD_NEEDS_CORS = false;

/** Whether a backup's parts are picked as files, not as the folder they are in: on the phone, the folder. */
export const PICKS_PART_FILES = false;

/** A folder picked by the owner, or null if they went back. */
export async function pickFolder(): Promise<string | null> {
  try {
    return (await whilePicking(() => Directory.pickDirectoryAsync())).uri;
  } catch {
    return null;
  }
}

/** A folder's name as the owner knows it, like Download/Erevos. */
export function folderLabel(uri: string): string {
  const tree = uri.split('/tree/')[1];
  if (!tree) return uri;
  const path = decodeURIComponent(tree).replace(/\/+$/, '');
  return path.replace(/^primary:/, '') || path;
}

/** A backup written: its file's name, its size, how many parts went beside it and their size together, and where, when the folder does not say. */
export type Written = { name: string; size: number; parts: number; partsSize: number; where?: string };

const filesIn = (folder: Directory): File[] => folder.list().filter((entry): entry is File => entry instanceof File);

// A file of the folder: its name, its size (-1 where the folder does not say it), and what deletes it.
type Entry = { name: string; size: number; uri?: string; file?: File };

// The folder's files, in one look, off the thread the screen answers on, where this Erevos can
// (modules/erevos-device, Folders.kt). Otherwise through expo-file-system, which asks Android
// again for each file's name and size, one look each, on that thread: a backup into a folder of a
// few hundred files held the screen for minutes (7.0.0-rc.3). Their sizes only when `sizes`.
async function entriesOf(folder: string, sizes = false): Promise<Entry[]> {
  if (device?.folderFiles) {
    const listed = await device.folderFiles(folder);
    if (!listed) throw new Error(t('That folder is not there any more. Choose it again.'));
    return listed.map(({ name, size, uri }) => ({ name, size, uri }));
  }
  return filesIn(new Directory(folder)).map((file) => ({ name: file.name, size: sizes ? (file.size ?? -1) : -1, file }));
}

// Writes `bytes` as a new file of the folder, named `name`, or as the folder names it where that
// is taken. One that could not be written whole is not left there.
async function writeEntry(folder: string, name: string, bytes: Uint8Array): Promise<Entry> {
  if (device?.folderWrite) {
    const made = await device.folderWrite(folder, name, bytes);
    return { name: made.name || name, size: bytes.length, uri: made.uri };
  }
  const file = new Directory(folder).createFile(name, 'application/octet-stream');
  try {
    file.writeSync(bytes);
  } catch (error) {
    deleteQuietly(file);
    throw error;
  }
  return { name: file.name || name, size: bytes.length, file };
}

function deleteQuietly(file: File): void {
  try {
    file.delete();
  } catch {
    // Left for the owner to delete, or for the next automatic backup.
  }
}

// Deletes these files of the folder; one that does not go is left for the owner, or the next time.
async function deleteEntries(entries: readonly Entry[]): Promise<void> {
  const uris = entries.flatMap((entry) => (entry.uri ? [entry.uri] : []));
  if (uris.length && device?.folderDelete) await device.folderDelete(uris).catch(() => 0);
  for (const entry of entries) if (entry.file) deleteQuietly(entry.file);
}

/**
 * Makes a backup into the folder: `make` makes it, giving each part as it is made, which is
 * written at once, and the backup itself at the end, written last. With `keep`, deletes the older
 * backups there but the `keep` newest, with their parts.
 */
export async function writeBackup(folder: string, make: (part: PartSink) => Promise<Uint8Array>, now = Date.now(), keep = 0): Promise<Written> {
  const stem = freeStem(backupStem(now), (await entriesOf(folder)).map((entry) => entry.name));
  const written: Entry[] = [];
  let bytes: Uint8Array;
  let file: Entry;
  try {
    bytes = await make(async (part) => {
      const made = await writeEntry(folder, partFileName(stem, written.length + 1), part);
      written.push(made);
      return made.name;
    });
    // Last, so one cut short leaves none of its files there.
    file = await writeEntry(folder, backupFileName(stem), bytes);
  } catch (error) {
    await deleteEntries(written);
    throw error;
  }
  if (keep) await prune(folder, keep);
  return { name: file.name, size: bytes.length, parts: written.length, partsSize: written.reduce((sum, part) => sum + part.size, 0) };
}

/** The backups' files in a folder, their own and their parts', each with its size (-1 where the
 *  folder does not say it): for automatic backups, which name again parts there (lock/backup.ts),
 *  then delete there those no backup kept names. Null where they cannot be listed; on the phone they
 *  always can. */
export async function listBackupFiles(folder: string): Promise<Map<string, number> | null> {
  const entries = (await entriesOf(folder, true)).filter((entry) => backupFileOf(entry.name) !== null);
  return new Map(entries.map((entry) => [entry.name, entry.size]));
}

/** The backups' files in a folder, with their sizes (-1 where the folder does not say them), and
 *  each one's bytes, read as asked: to check that a backup there is whole (lib/backup-check.ts). */
export async function backupFilesIn(folder: string): Promise<BackupFiles | null> {
  const entries = (await entriesOf(folder, true)).filter((entry) => backupFileOf(entry.name) !== null);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  const folderSha256 = device?.folderSha256;
  return {
    sizes: new Map(entries.map((entry) => [entry.name, entry.size])),
    read: async (name) => {
      const entry = byName.get(name);
      const file = entry?.file ?? (entry?.uri ? new File(entry.uri) : null);
      return file?.exists ? file.bytes() : null;
    },
    // Read through on Android's side (Folders.kt), off the screen's thread, a part at a time in
    // pieces: the many GB of a backup never come here.
    sha:
      folderSha256 && entries.every((entry) => entry.uri)
        ? async (names) => {
            const uris = names.map((name) => byName.get(name)?.uri ?? '');
            const sums = await folderSha256(uris.filter(Boolean));
            let at = 0;
            return uris.map((uri) => {
              if (!uri) return null;
              const sum = sums[at++];
              return sum && sum.size >= 0 ? sum : null;
            });
          }
        : undefined,
  };
}

/** Deletes those of a folder's backup files; one that does not go is left for the next time. */
export async function deleteBackupFiles(folder: string, names: string[]): Promise<void> {
  if (names.length === 0) return;
  const gone = new Set(names);
  await deleteEntries((await entriesOf(folder)).filter((entry) => gone.has(entry.name)));
}

async function prune(folder: string, keep: number) {
  const entries = await entriesOf(folder);
  const stale = new Set(staleBackups(entries.map((entry) => entry.name), keep));
  await deleteEntries(entries.filter((entry) => stale.has(entry.name)));
}

/** Where a backup's parts are, to restore it: which of their names are not there, and each one's bytes. */
export type PartSource = { missing(names: string[]): string[]; read: PartReader };

/** The parts in a folder Erevos may read (one the owner picked, or automatic backups' own), by their names. */
export async function partsIn(folder: string): Promise<PartSource> {
  const files = new Map(filesIn(new Directory(folder)).map((file) => [file.name, file]));
  return {
    missing: (names) => names.filter((name) => !files.has(name)),
    read: async (name) => {
      const file = files.get(name);
      return file?.exists ? file.bytes() : null;
    },
  };
}

/** Asks for the folder a backup's parts are in, or null if the owner went back. `names` are theirs, for where only the files themselves can be picked. */
export async function pickParts(_names: string[]): Promise<PartSource | null> {
  const folder = await pickFolder();
  return folder ? partsIn(folder) : null;
}
