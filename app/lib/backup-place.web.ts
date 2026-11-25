// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { backupFileName, backupFileOf, backupStem, freeStem, partFileName, uniqueStem, type PartReader, type PartSink } from '../lock/backup';

import { handOverAll } from './hand-over.web';
import { SHELL, shellFetch } from './shell';
import { t } from './i18n';

// Where backups go on a computer (lib/backup-folder.ts): a folder the owner picks in the desktop
// app (lib/shell.ts), which then writes there and nowhere else. A folder is known by its path.
// In a plain browser (the web app) there is no folder: each backup is handed over as files
// (lib/hand-over.web.ts), to the share sheet on a phone or the downloads on a computer. A browser
// gives a file out only after a tap, so it makes no backups by itself.
//
// A backup's parts (photos, files and voice messages, lock/backup.ts) are files beside it with the
// same start, written as they are made, then the backup itself, last (desktop/backups.js). In a
// browser they are handed over with it, kept until then in the browser's own files (Blobs), not
// in the page's memory: all at once to the share sheet, or to the downloads one after the other,
// each at a tap (lib/hand-over.web.ts). To restore one with parts, the desktop app reads them from
// the folder the owner picks; a browser, and Sailfish OS, from the files the owner picks. Where
// the folder's files cannot be listed, in a browser and on Sailfish OS, a backup's start has its
// seconds and milliseconds too (uniqueStem), so a second one in the same minute takes no first's
// name: a browser would save it under another, and Sailfish OS write it over the first's.

/** Whether backups can be made here. */
export const CAN_BACK_UP = true;

/** Whether backups can be made by themselves, every day or week: in the desktop app. */
export const CAN_AUTO_BACKUP = SHELL !== null;

/** Whether backups can go to a server too (lib/backup-cloud.ts): the desktop app's go through its
 *  shell; the web app's straight from the browser, which works only with a server that lets the
 *  web app in (CORS, lib/backup-http.web.ts), and only one at a time, as it makes none by itself.
 *  Not on Sailfish OS, whose shell does not send them. */
export const CAN_CLOUD_BACKUP = SHELL !== 'sailfish';

/** Whether a backup can be restored from such a server: where they can be sent. */
export const CAN_CLOUD_RESTORE = CAN_CLOUD_BACKUP;

/** Whether the server has to let this app in (CORS): in a plain browser. */
export const CLOUD_NEEDS_CORS = SHELL === null;

/** Whether a backup's parts are picked as files, not as the folder they are in: in a browser and on Sailfish OS. */
export const PICKS_PART_FILES = SHELL !== 'electron';

// The one "folder" of a plain browser.
const HANDED = 'browser';

/** A folder picked by the owner, or null if they went back. */
export async function pickFolder(): Promise<string | null> {
  if (!SHELL) return HANDED;
  const response = await shellFetch('/__folder');
  if (response.status === 404) return null;
  return ((await response.json()) as { path: string }).path;
}

/** The folder's path, from the home folder on. */
export function folderLabel(path: string): string {
  if (path === HANDED) return t('the place you chose');
  return path.replace(/^\/(home|Users)\/[^/]+/, '~');
}

/** A backup written: its file's name, its size, how many parts went beside it and their size together, and where, when the folder does not say. */
export type Written = { name: string; size: number; parts: number; partsSize: number; where?: string };

const query = (folder: string, name?: string, keep?: number) =>
  `/__backup?folder=${encodeURIComponent(folder)}${name === undefined ? '' : `&name=${encodeURIComponent(name)}`}${keep === undefined ? '' : `&keep=${keep}`}`;

// The names of the backups' files in a folder of the desktop app's; none where the shell does not say.
async function namesIn(folder: string): Promise<string[]> {
  if (SHELL !== 'electron') return [];
  const response = await shellFetch(query(folder));
  if (response.status === 404) throw new Error(t('That folder is not there any more. Choose it again.'));
  return response.ok ? ((await response.json()) as string[]) : [];
}

async function put(folder: string, name: string, bytes: Uint8Array, keep: number): Promise<void> {
  const response = await shellFetch(query(folder, name, keep), { method: 'PUT', body: bytes as BodyInit });
  if (response.status === 404) throw new Error(t('That folder is not there any more. Choose it again.'));
  if (!response.ok) throw new Error(t('The desktop app answered {status}.', { status: response.status }));
}

/**
 * Makes a backup into the folder: `make` makes it, giving each part as it is made, then the backup
 * itself. With `keep`, deletes the older backups there but the `keep` newest, with their parts.
 */
export async function writeBackup(folder: string, make: (part: PartSink) => Promise<Uint8Array>, now = Date.now(), keep = 0): Promise<Written> {
  if (!SHELL) {
    const parts: globalThis.File[] = [];
    const stem = uniqueStem(now);
    const bytes = await make(async (part) => {
      const name = partFileName(stem, parts.length + 1);
      parts.push(new File([part as BlobPart], name, { type: 'application/octet-stream' }));
      return name;
    });
    const name = backupFileName(stem);
    const how = await handOverAll([new File([bytes as BlobPart], name, { type: 'application/octet-stream' }), ...parts]);
    if (!how) throw new Error(t('Not saved: the share sheet was closed.'));
    return { name, size: bytes.length, parts: parts.length, partsSize: parts.reduce((sum, part) => sum + part.size, 0), where: how === 'shared' ? t('the place you chose') : t('the downloads folder') };
  }
  const stem = SHELL === 'electron' ? freeStem(backupStem(now), await namesIn(folder)) : uniqueStem(now);
  const written: string[] = [];
  let partsSize = 0;
  let bytes: Uint8Array;
  try {
    bytes = await make(async (part) => {
      const name = partFileName(stem, written.length + 1);
      await put(folder, name, part, 0);
      written.push(name);
      partsSize += part.length;
      return name;
    });
    await put(folder, backupFileName(stem), bytes, keep);
  } catch (error) {
    // Sailfish OS's shell deletes none: the next automatic backup does.
    if (SHELL === 'electron') for (const name of written) await shellFetch(query(folder, name), { method: 'DELETE' }).catch(() => undefined);
    throw error;
  }
  return { name: backupFileName(stem), size: bytes.length, parts: written.length, partsSize };
}

/** The backups' files in a folder, their own and their parts', each with its size (-1 where the
 *  folder does not say it): for automatic backups, which name again parts there (lock/backup.ts),
 *  then delete there those no backup kept names. Null where they cannot be listed, on Sailfish OS
 *  and in a browser: there each backup is whole, and the shell keeps the newest by their names. */
export async function listBackupFiles(folder: string): Promise<Map<string, number> | null> {
  if (SHELL !== 'electron') return null;
  return new Map((await namesIn(folder)).map((name) => [name, -1]));
}

/** The backups' files in a folder, their sizes not said (-1), and each one's bytes, read as asked:
 *  to check that a backup there is whole (lib/backup-check.ts). Only in the desktop app. */
export async function backupFilesIn(folder: string): Promise<{ sizes: Map<string, number>; read: PartReader } | null> {
  if (SHELL !== 'electron') return null;
  const names = (await namesIn(folder)).filter((name) => backupFileOf(name) !== null);
  const { read } = await folderParts(folder);
  return { sizes: new Map(names.map((name) => [name, -1])), read };
}

/** Deletes those of a folder's backup files, in the desktop app; one that does not go is left for the next time. */
export async function deleteBackupFiles(folder: string, names: string[]): Promise<void> {
  if (SHELL !== 'electron') return;
  for (const name of names) await shellFetch(query(folder, name), { method: 'DELETE' }).catch(() => undefined);
}

/** Where a backup's parts are, to restore it: which of their names are not there, and each one's bytes. */
export type PartSource = { missing(names: string[]): string[]; read: PartReader };

// The parts in a folder of the desktop app's.
async function folderParts(folder: string): Promise<PartSource> {
  const there = new Set(await namesIn(folder));
  return {
    missing: (names) => names.filter((name) => !there.has(name)),
    read: async (name) => {
      if (!there.has(name)) return null;
      const response = await shellFetch(query(folder, name));
      return response.status === 200 ? new Uint8Array(await response.arrayBuffer()) : null;
    },
  };
}

/** The parts in a folder of automatic backups': in the desktop app the folder's; elsewhere, where
 *  the shell lists none, or a browser has no folder, none are there. */
export async function partsIn(folder: string): Promise<PartSource> {
  if (SHELL === 'electron') return folderParts(folder);
  return { missing: (names) => names, read: async () => null };
}

// The files the owner picked, by their names.
function pickedParts(files: globalThis.File[]): PartSource {
  const picked = new Map(files.map((file) => [file.name, file]));
  return {
    missing: (names) => names.filter((name) => !picked.has(name)),
    read: async (name) => {
      const file = picked.get(name);
      return file ? new Uint8Array(await file.arrayBuffer()) : null;
    },
  };
}

function pickFiles(): Promise<globalThis.File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = () => resolve([...(input.files ?? [])]);
    input.oncancel = () => resolve([]);
    input.click();
  });
}

/** Asks where a backup's parts are, or null if the owner went back: in the desktop app the folder
 *  they are in, elsewhere the files themselves (`names`, the parts'). */
export async function pickParts(_names: string[]): Promise<PartSource | null> {
  if (SHELL === 'electron') {
    const folder = await pickFolder();
    return folder ? folderParts(folder) : null;
  }
  const files = await pickFiles();
  return files.length ? pickedParts(files) : null;
}
