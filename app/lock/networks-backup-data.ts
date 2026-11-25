// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { checkedNetworks } from '../lib/backup-networks-data';

import { sealedFile } from './sealed-file';

// What Erevos+'s other networks keep for backups (lib/backup-networks.ts): Session's account as its
// engine keeps it (seed, names, chats with their messages, groups with their keys). Their accounts
// are the phone's and show in its first space, so this is sealed with the first space's key, as
// msg-own-data.ts is, and written only while that space is open: a backup made from another
// space, or by itself, holds it only as the first space last kept it, never in the clear. It goes
// into backups among the sealed files (lock/backup.ts), with the pages a large one takes, and a
// restore gives it back to the engine once the first space opens (lib/messenger-store.ts).

export const FILE = 'erevos-networks-backup';
const BLOCK = 16 * 1024;

/** `session`: the engine's state, '' for none; `at`: when it was kept, ms. */
export type NetworksBackup = { session: string; at: number };

export function checkedNetworksBackup(value: unknown): NetworksBackup {
  const v = (value ?? {}) as { at?: unknown };
  const at = typeof v.at === 'number' && Number.isSafeInteger(v.at) && v.at > 0 ? v.at : 0;
  return { session: checkedNetworks(value)?.session ?? '', at };
}

const store = sealedFile({ name: FILE, empty: { session: '', at: 0 } as NetworksBackup, checked: checkedNetworksBackup, block: BLOCK });

/** What the first space keeps of the other networks for backups, as its key opens it. */
export async function loadNetworksBackup(key: Uint8Array): Promise<NetworksBackup> {
  return store.load('space', 0, key);
}

export async function saveNetworksBackup(key: Uint8Array, data: NetworksBackup): Promise<void> {
  await store.save('space', 0, key, data);
}
