// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// expo-file-system's folders, as lib/backup-place.ts uses them, for checks under Node: folders by
// their uri, each with its files' bytes, in memory. A file made with a name taken gets another, as
// Android's folders give it; `writes.failAt` makes that write from now fail, as a full memory card,
// with `writes.said` as what Android says.
export const folders = new Map<string, Map<string, Uint8Array>>();
export const writes = { failAt: 0, said: 'No room left.' };
// How often a folder was listed or written in through these, as a build before the folder functions
// of modules/erevos-device does (checks/device-memory.ts).
export const looks = { count: 0 };
// Folders of another app that, as DAVx5's, give a file written there back empty until that app has
// sent it on to its server: `sendOn` has it do so with what was written there until then.
export const sending = new Set<string>();
const unsent = new Map<string, Map<string, Uint8Array>>();

/** Keeps `bytes` as `name` in the folder `uri`: empty for now in one of `sending`. */
export function keep(uri: string, name: string, bytes: Uint8Array): void {
  const folder = inFolder(uri);
  if (!sending.has(uri)) {
    folder.set(name, bytes.slice());
    return;
  }
  folder.set(name, new Uint8Array(0));
  const waiting = unsent.get(uri) ?? new Map<string, Uint8Array>();
  waiting.set(name, bytes.slice());
  unsent.set(uri, waiting);
}

/** What was written in the folder `uri` reached its app's server: it reads back whole from now on. */
export function sendOn(uri: string): void {
  const waiting = unsent.get(uri);
  unsent.delete(uri);
  const folder = folders.get(uri);
  if (waiting && folder) for (const [name, bytes] of waiting) if (folder.has(name)) folder.set(name, bytes);
}

function inFolder(uri: string): Map<string, Uint8Array> {
  const folder = folders.get(uri);
  if (!folder) throw new Error('That folder is not there any more.');
  return folder;
}

export class File {
  readonly folder: string;
  readonly name: string;

  // As Android's documents are named, alone, by the uri a folder's listing gives (device-memory.ts).
  constructor(folder: string, name?: string) {
    if (name === undefined) {
      const at = folder.lastIndexOf('#');
      this.folder = folder.slice(0, at);
      this.name = decodeURIComponent(folder.slice(at + 1));
    } else {
      this.folder = folder;
      this.name = name;
    }
  }

  get exists(): boolean {
    return folders.get(this.folder)?.has(this.name) ?? false;
  }

  get size(): number {
    return folders.get(this.folder)?.get(this.name)?.length ?? 0;
  }

  // As SDK 58: write() is async, writeSync() writes before it returns.
  async write(bytes: Uint8Array): Promise<void> {
    this.writeSync(bytes);
  }

  writeSync(bytes: Uint8Array): void {
    if (writes.failAt > 0 && --writes.failAt === 0) throw new Error(writes.said);
    keep(this.folder, this.name, bytes);
  }

  async bytes(): Promise<Uint8Array> {
    const bytes = inFolder(this.folder).get(this.name);
    if (!bytes) throw new Error('That file is not there any more.');
    return bytes.slice();
  }

  delete(): void {
    inFolder(this.folder).delete(this.name);
  }
}

export class Directory {
  readonly uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  static async pickDirectoryAsync(): Promise<Directory> {
    throw new Error('No folder was picked.');
  }

  list(): File[] {
    looks.count++;
    return [...inFolder(this.uri).keys()].map((name) => new File(this.uri, name));
  }

  createFile(name: string, _type: string): File {
    looks.count++;
    const folder = inFolder(this.uri);
    let free = name;
    for (let n = 1; folder.has(free); n++) free = `${name} (${n})`;
    folder.set(free, new Uint8Array(0));
    return new File(this.uri, free);
  }
}
