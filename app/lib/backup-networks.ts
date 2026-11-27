// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { currentSpace } from '../lock/keys';
import { loadNetworksBackup, saveNetworksBackup } from '../lock/networks-backup-data';
import { lastRestore } from '../lock/restored';

import { checkedMessengerSignIn, checkedSignalHistory } from './backup-networks-data';
import { msgCall, msgEnginesHere } from './messenger-store';
import { secureGet, secureSet } from './secure';
import { keepTelegramForBackup, telegramRestored } from './telegram-store';

// Erevos+'s other networks in backups (#67): Session's account, as its engine keeps it (seed,
// names, chats with their messages, groups with their keys: Session.kt backupState), kept sealed
// with the first space's key among the sealed files every backup holds (lock/networks-backup-data.ts),
// never in the clear and never in another space's reach. Before each backup, while the first space
// is open, it is kept anew; from another space the backup holds it as the first space last kept it, and says
// nothing of it there.
// Reading it never stops a backup: what went wrong is said with the backup instead. After a restore
// from Backups, it goes back to the engine once the first space opens (lib/messenger-store.ts
// restoredSession), only where there is no Session account or the same one. Its media files stay
// out: Session gives them again while it keeps them. Signal's history goes in beside it (#68): its
// chats and messages as the engine reads them (messenger/signal/src/history.rs), without its keys,
// its identity, its sessions with others or its files; restored, it is added to what the engine
// keeps and shows in its chats, to read only, once Signal is registered or linked again. Messenger's
// sign-in goes in too (#68), the cookies of its facebook.com sign-in as its engine keeps them, never
// a password: restored, the engine is signed in with them before it starts, where this phone is not
// signed in to another account. And each space's Telegram sign-in, TDLib's own, sealed with that
// space's key (lock/telegram-sign-in.ts, lib/telegram-store.ts). An account so restored is the same
// sign-in as the old phone's: one phone only uses it. Signal's account stays out: its keys are
// each phone's own.

export { checkedNetworks, type Networks } from './backup-networks-data';

/** How Session's account went into a backup about to be made, and why Signal's history
 *  (`signalFailed`), Messenger's sign-in (`messengerFailed`) or Telegram's (`telegramFailed`) did not,
 *  where it could not be read. */
export type NetworksKept = ({ kind: 'none' } | { kind: 'in' } | { kind: 'failed'; error: string }) & {
  signalFailed?: string;
  messengerFailed?: string;
  telegramFailed?: string;
};

// The engine's answer when there is no Session in this build: nothing to keep, not an error.
const NOT_HERE = /not available|not here/;

const errorOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

// Signal's history as its engine gives it (historyExport), without its files: '' where there is none.
async function signalHistory(): Promise<string> {
  try {
    // Opened first: the history is kept encrypted with a key made from the store's.
    await msgCall('signal', 'open');
    const kept = await msgCall<{ history?: unknown } | null>('signal', 'historyExport');
    return checkedSignalHistory(kept?.history) ?? '';
  } catch (error) {
    if (NOT_HERE.test(errorOf(error))) return '';
    throw error;
  }
}

// Messenger's sign-in as its engine keeps it: '' where it is not signed in.
async function messengerSignIn(): Promise<string> {
  try {
    if ((await msgCall<boolean>('messenger', 'loggedIn')) !== true) return '';
    const cookies = await msgCall<Record<string, string>>('messenger', 'webCookies');
    const checked = checkedMessengerSignIn(JSON.stringify(cookies ?? {}));
    if (!checked) throw new Error('not as Messenger signs in');
    return checked;
  } catch (error) {
    if (NOT_HERE.test(errorOf(error))) return '';
    throw error;
  }
}

/** Keeps the other networks for the backup about to be made: Telegram's sign-in where the open
 *  space has one, then the first space's own (keepFirstSpace). Each on its own: one that cannot be
 *  read leaves the others in. */
export async function keepNetworksForBackup(now = Date.now()): Promise<NetworksKept> {
  const telegram = await keepTelegramForBackup(now);
  const kept = await keepFirstSpace(now);
  return telegram.kind === 'failed' ? { ...kept, telegramFailed: telegram.error } : kept;
}

/** Session's account, Signal's history and Messenger's sign-in, as they are now, where the first space is open. */
async function keepFirstSpace(now: number): Promise<NetworksKept> {
  if (!msgEnginesHere()) return { kind: 'none' };
  let open: { space: number; key: Uint8Array } | null = null;
  try {
    open = currentSpace();
  } catch {
    open = null;
  }
  // From another space nothing is said of Session or Signal at all: that space does not know of them.
  if (!open || open.space !== 0) return { kind: 'none' };
  // A restore whose account and history wait for the first space (restoredSession): what is kept
  // stays as the backup brought it until it went back, or a backup made meanwhile would lose it.
  if (await secureGet(RESTORE_PENDING)) return { kind: 'none' };
  let session: string | null = null;
  let kept: NetworksKept = { kind: 'none' };
  try {
    const state = await msgCall<string | null>('session', 'backupState');
    session = typeof state === 'string' ? state : '';
    kept = session ? { kind: 'in' } : { kind: 'none' };
  } catch (error) {
    const said = errorOf(error);
    if (NOT_HERE.test(said)) session = '';
    else kept = { kind: 'failed', error: said };
  }
  // Signal's history; one that cannot be read now goes in as it was last kept, and that is said.
  let signal: string | null = null;
  let signalFailed: string | undefined;
  try {
    signal = await signalHistory();
  } catch (error) {
    signalFailed = errorOf(error);
  }
  let messenger: string | null = null;
  let messengerFailed: string | undefined;
  try {
    messenger = await messengerSignIn();
  } catch (error) {
    messengerFailed = errorOf(error);
  }
  try {
    // What could not be read now stays as it was last kept.
    const before = session === null || signal === null || messenger === null ? await loadNetworksBackup(open.key) : null;
    const held = session ?? before?.session ?? '';
    const history = signal ?? before?.signal ?? '';
    const signIn = messenger ?? before?.messenger ?? '';
    // None here: none kept either, so an account signed out does not stay in backups.
    await saveNetworksBackup(open.key, { session: held, signal: history, messenger: signIn, at: held || history || signIn ? now : 0 });
  } catch (error) {
    const said = errorOf(error);
    return {
      kind: 'failed',
      error: said,
      ...(signal || signalFailed ? { signalFailed: signalFailed ?? said } : {}),
      ...(messenger || messengerFailed ? { messengerFailed: messengerFailed ?? said } : {}),
    };
  }
  return { ...kept, ...(signalFailed ? { signalFailed } : {}), ...(messengerFailed ? { messengerFailed } : {}) };
}

/** Marks the restore just made from Backups: its Session account, Signal's history and Messenger's
 *  sign-in go back as the first space next opens, and each space's Telegram sign-in as it opens. */
export async function networksRestored(): Promise<void> {
  const id = await lastRestore();
  if (!id) return;
  await secureSet(RESTORE_PENDING, id);
  await telegramRestored(id);
}

/** Where the restore whose Session account waits for the first space is kept (its id, lock/restored.ts). */
export const RESTORE_PENDING = 'erevos.networks-restore';
