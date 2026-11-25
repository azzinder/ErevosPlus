// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { type Networks } from './backup-networks-data';
import { msgCall, msgEnginesHere, sessionRestore } from './messenger-store';

export { checkedNetworks, type Networks } from './backup-networks-data';

// Erevos+'s other networks in backups (#67), as the phone module's settings go (lib/backup-native.ts),
// inside the backup sealed with its own password (lock/backup.ts). Only Session's account goes in:
// its seed, names, chats with their messages and its groups with their keys, as the engine keeps
// them (messenger/android .../session/Session.kt, backupState), so a restore brings the account
// and its chats back, sealed again with a key of the new phone's Keystore. Its media files stay
// out: Session gives them again while it keeps them. Telegram, Signal and Messenger stay out:
// their sign-ins are each phone's own, and Telegram's and Messenger's chats come back from them.


// The engine's answer when there is no Session in this build: nothing to keep, not an error.
const NOT_HERE = /not available|not here/;

/** What goes into a backup of the other networks; null where there is nothing to keep. A Session
 *  account here that cannot be read fails the backup, which would otherwise say it holds it. */
export async function networksForBackup(): Promise<Networks | null> {
  if (!msgEnginesHere()) return null;
  let session: string | null;
  try {
    session = await msgCall<string | null>('session', 'backupState');
  } catch (error) {
    if (error instanceof Error && NOT_HERE.test(error.message)) return null;
    throw error;
  }
  return typeof session === 'string' && session ? { session } : null;
}

// Why the last restore could not put Session's account back, until it is read (sessionRestoreError).
let failed: string | null = null;

/** Why the last restore did not put Session's account back, once; null when it did, or held none. */
export function sessionRestoreError(): string | null {
  const said = failed;
  failed = null;
  return said;
}

/** Puts back the accounts a backup holds, in place of this phone's; nothing where it holds none or
 *  there are no engines here. What fails is kept for the restore to say (sessionRestoreError). */
export async function putNetworks(networks: Networks | null): Promise<void> {
  failed = null;
  if (!networks?.session || !msgEnginesHere()) return;
  try {
    await sessionRestore(networks.session);
  } catch (error) {
    failed = error instanceof Error ? error.message : String(error);
  }
}
