// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The phone's own module (modules/erevos-device) for checks under Node: it keeps the reminders of
// Chat with myself asked of it, by their ids, until they are forgotten, and those said to be seen.
import { folders, keep, writes } from './folder-memory';
import { sha256Bytes, toHex } from '../lib/crypto';

export const reminders = new Map<string, number>();
export const seen = new Set<string>();

export const device = {
  remind: (id: string, at: number): boolean => {
    reminders.set(id, at);
    return true;
  },
  forgetReminder: (id: string): void => {
    reminders.delete(id);
  },
  seenReminders: (ids: string[]): void => {
    ids.forEach((id) => seen.add(id));
  },
};

// Its folder functions (Folders.kt), over the folders in memory that stand for expo-file-system's
// (checks/folder-memory.ts): a file made with a name taken gets another, and one whose write fails
// is not left there. With `nativeFolders.on` false, as in a build before them, backups go through
// expo-file-system's folders instead.
export const nativeFolders = { on: true };

const uriOf = (folder: string, name: string) => `${folder}#${encodeURIComponent(name)}`;

const folderFiles = async (folder: string): Promise<{ name: string; size: number; uri: string }[] | null> => {
  const there = folders.get(folder);
  return there ? [...there].map(([name, bytes]) => ({ name, size: bytes.length, uri: uriOf(folder, name) })) : null;
};

const folderWrite = async (folder: string, name: string, bytes: Uint8Array): Promise<{ name: string; uri: string }> => {
  const there = folders.get(folder);
  if (!there) throw new Error('That folder is not there any more.');
  let free = name;
  for (let n = 1; there.has(free); n++) free = `${name} (${n})`;
  if (writes.failAt > 0 && --writes.failAt === 0) throw new Error(writes.said);
  keep(folder, free, bytes);
  return { name: free, uri: uriOf(folder, free) };
};

const folderDelete = async (uris: string[]): Promise<number> => {
  let gone = 0;
  for (const uri of uris) {
    const at = uri.lastIndexOf('#');
    if (folders.get(uri.slice(0, at))?.delete(decodeURIComponent(uri.slice(at + 1)))) gone++;
  }
  return gone;
};

// Each file's size and SHA-256 by its uri, as Folders.kt reads them through.
const folderSha256 = async (uris: string[]): Promise<{ size: number; sha: string }[]> =>
  uris.map((uri) => {
    const at = uri.lastIndexOf('#');
    const bytes = folders.get(uri.slice(0, at))?.get(decodeURIComponent(uri.slice(at + 1)));
    return bytes ? { size: bytes.length, sha: toHex(sha256Bytes(bytes)) } : { size: -1, sha: '' };
  });

Object.defineProperties(device, {
  folderSha256: { get: () => (nativeFolders.on ? folderSha256 : undefined) },
  folderFiles: { get: () => (nativeFolders.on ? folderFiles : undefined) },
  folderWrite: { get: () => (nativeFolders.on ? folderWrite : undefined) },
  folderDelete: { get: () => (nativeFolders.on ? folderDelete : undefined) },
});
