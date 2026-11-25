// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { currentSpace } from '../lock/keys';
import { saveNetworksBackup } from '../lock/networks-backup-data';
import { lastRestore } from '../lock/restored';

import { msgCall, msgEnginesHere } from './messenger-store';
import { secureGet, secureSet } from './secure';

// Erevos+'s other networks in backups (#67): Session's account, as its engine keeps it (seed,
// names, chats with their messages, groups with their keys: Session.kt backupState), kept sealed
// with the first space's key among the sealed files every backup holds (lock/networks-backup-data.ts),
// never in the clear and never in another space's reach. Before each backup, while the first space
// is open, it is kept anew; from another space the backup holds it as the first space last kept it, and says
// nothing of it there.
// Reading it never stops a backup: what went wrong is said with the backup instead. After a restore
// from Backups, it goes back to the engine once the first space opens (lib/messenger-store.ts
// restoredSession), only where there is no Session account or the same one. Its media files stay
// out: Session gives them again while it keeps them. Telegram, Signal's account and Messenger stay
// out: their sign-ins are each phone's own.

export { checkedNetworks, type Networks } from './backup-networks-data';

/** How Session's account went into a backup about to be made. */
export type NetworksKept = { kind: 'none' } | { kind: 'in' } | { kind: 'failed'; error: string };

// The engine's answer when there is no Session in this build: nothing to keep, not an error.
const NOT_HERE = /not available|not here/;

/** Keeps Session's account for the backup about to be made, as it is now, where the first space is open. */
export async function keepNetworksForBackup(now = Date.now()): Promise<NetworksKept> {
  if (!msgEnginesHere()) return { kind: 'none' };
  let open: { space: number; key: Uint8Array } | null = null;
  try {
    open = currentSpace();
  } catch {
    open = null;
  }
  // From another space nothing is said of Session at all: that space does not know of it.
  if (!open || open.space !== 0) return { kind: 'none' };
  // A restore whose account waits for the first space (restoredSession): what is kept stays as the
  // backup brought it until it went back, or a backup made meanwhile would lose it.
  if (await secureGet(RESTORE_PENDING)) return { kind: 'none' };
  try {
    const state = await msgCall<string | null>('session', 'backupState');
    const session = typeof state === 'string' ? state : '';
    // None here: none kept either, so an account signed out does not stay in backups.
    await saveNetworksBackup(open.key, { session, at: session ? now : 0 });
    return session ? { kind: 'in' } : { kind: 'none' };
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error);
    if (NOT_HERE.test(said)) return { kind: 'none' };
    return { kind: 'failed', error: said };
  }
}

/** Marks the restore just made from Backups: its Session account goes back as the first space next opens. */
export async function networksRestored(): Promise<void> {
  const id = await lastRestore();
  if (id) await secureSet(RESTORE_PENDING, id);
}

/** Where the restore whose Session account waits for the first space is kept (its id, lock/restored.ts). */
export const RESTORE_PENDING = 'erevos.networks-restore';
