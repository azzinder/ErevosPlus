// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Directory, File, Paths } from 'expo-file-system';
import { AppState } from 'react-native';

import { backupKey, backupNative, makeBackup, openBackup, restoreBackup } from '../lock/backup';
import { openCollectionSkips } from '../lock/collection-data';
import { device } from '../modules/erevos-device';
import { phoneStatus, requestDefaultPhone } from '../modules/erevos-phone';
import { requestDefaultSms, smsStatus } from '../modules/erevos-sms';
import { phoneSettingsForBackup } from './backup-native';
import { afterRestore, beforeRestore } from './backup-settings';
import { randomBytes, toHex } from './crypto';
import { MOVE_WAITS, moveFor, moveRoom, readMoveNote, type MoveNote } from './move-note';
import { announceMovedOut, CAN_MOVE, cancelMove, clearMove, clearStaleMove, MOVE_FILE, movedOut, onMovedOut, outDir, writeMovedOut } from './move-state';
import { formatSize } from './updates';
import { t } from './i18n';
import { INSTALLED_EDITION, PACKAGES, type UpdateEdition } from './update-channel';

export { announceMovedOut, CAN_MOVE, cancelMove, clearMove, clearStaleMove, movedOut, MOVE_WAITS, onMovedOut, readMoveNote, type MoveNote };

// Moving to another edition on the same phone (docs/editions.md): Erevos, Erevos+ and Erevos Lite
// are apps of their own, each with its own data, signed with the same key. The one moved from makes
// a backup for the move (lock/backup.ts, as Backups does, with a password of its own, random, kept
// beside it in move.json) into its own folder for moves; the one moved to finds it through Android
// (modules/erevos-device Move.kt, which answers only an app signed with the same key), copies it
// and restores it, and tells the other its move was taken, which then deletes it. Nothing leaves
// the phone. What the backup holds is sealed as the phone keeps it: the spaces open with their
// passwords, as after any restore. A move waits a day; after that it is deleted unused.
//
// The phone's SMS and calls are not in it: they stay in Android's own stores, where the edition moved
// to finds them once it is the SMS or phone app. Without Move.kt (an Erevos from before moves, or
// one signed with another key, F-Droid's), Backups does the same by hand.

const BACKUP_FILE = 'move.erevos';
const partName = (n: number) => `move-part-${n}.erevos`;

// The move another edition made for this one that the owner said Not now to, by when it was made.
const declinedFile = () => new File(Paths.document, 'move-declined.json');

/** The newest move waiting for this app, set up already, unless the owner said Not now to it. */
export async function waitingMove(now = Date.now()): Promise<FoundMove | null> {
  const found = (await findMoves(now).catch(() => []))[0] ?? null;
  if (!found) return null;
  try {
    const file = declinedFile();
    if (file.exists && Number(file.textSync()) === found.made) return null;
  } catch {
    // Asked, then.
  }
  return found;
}

/** Not now to `move`: it is not asked about again at the start. */
export function declineMove(move: FoundMove): void {
  try {
    declinedFile().writeSync(String(move.made));
  } catch {
    // Asked again next time.
  }
}

const DONE_DUE = 'move-done-due.json';

function keepFile(name: string, text: string): void {
  try {
    new File(Paths.document, name).writeSync(text);
  } catch {
    // Not kept: the other edition's move goes stale after a day, and it asks again then.
  }
}

/**
 * Tells the edition a move was taken from, when that could not be told as it was (takeMove): at
 * each start, until it hears it, or has no move any more.
 */
export async function tellMoveTaken(): Promise<void> {
  if (!CAN_MOVE) return;
  try {
    const file = new File(Paths.document, DONE_DUE);
    if (!file.exists) return;
    const pkg = file.textSync().trim();
    const told = (Object.values(PACKAGES) as string[]).includes(pkg) && (await device!.moveDone!(pkg).catch(() => false));
    const waits = (await device!.moveSources!().catch(() => [])).some((source) => source.pkg === pkg);
    if (told || !waits) file.delete();
  } catch {
    // Tried again at the next start.
  }
}

// Whether this app is the phone's SMS app and its phone app, for the move (MoveNote roles).
function rolesHere(): { sms: boolean; phone: boolean } {
  let sms = false;
  let phone = false;
  try {
    sms = smsStatus()?.isDefault === true;
  } catch {
    // Not an SMS app here.
  }
  try {
    phone = phoneStatus()?.isDefault === true;
  } catch {
    // Not a phone app here.
  }
  return { sms, phone };
}

/**
 * After a move was taken: Android's questions whether this app should be the SMS app and the phone
 * app, as the one moved from was; the second once the first is answered and Erevos shows again.
 */
function askRoles(move: FoundMove): void {
  const roles = move.roles;
  if (!roles) return;
  const phone = () => {
    try {
      if (roles.phone && phoneStatus()?.isDefault === false) requestDefaultPhone();
    } catch {
      // This edition has no Phone: its calls stay with the phone's own app.
    }
  };
  try {
    if (!(roles.sms && smsStatus()?.isDefault === false)) return phone();
    requestDefaultSms();
  } catch {
    return phone();
  }
  if (!roles.phone) return;
  const subscription = AppState.addEventListener('change', (state) => {
    if (state !== 'active') return;
    subscription.remove();
    phone();
  });
}

/** Opens the app of `edition`, when installed: whether it opened. */
export function openEdition(edition: UpdateEdition): boolean {
  return device?.openApp?.(PACKAGES[edition]) ?? false;
}

// The phone's free room, or null when it is not told.
function freeRoom(): number | null {
  try {
    const free = Paths.availableDiskSpace;
    return typeof free === 'number' && Number.isFinite(free) && free >= 0 ? free : null;
  } catch {
    return null;
  }
}

/** An error for a move that would not fit, in words: null when it fits, or the phone does not say. */
export function roomError(size: number): Error | null {
  const free = freeRoom();
  const need = moveRoom(size);
  if (free === null || free >= need) return null;
  return new Error(t('There is not enough free room on the phone for the move: it needs about {size}, and {free} is free. Delete something large, or move with Backups to a computer.', { size: formatSize(need), free: formatSize(free) }));
}

/**
 * Makes the move to `to`: a backup of everything into this app's folder for moves, its parts first,
 * then move.json last, so the edition moved to finds only a whole one. `progress` is told as the
 * photos, files and voice messages go in.
 */
export async function prepareMove(to: UpdateEdition, progress?: (done: number, all: number) => void): Promise<void> {
  if (!CAN_MOVE) throw new Error('This Erevos cannot hand over a move');
  cancelMove();
  // Everything this app keeps goes into the move, encrypted, beside it for a while.
  let size = 0;
  try {
    size = new Directory(Paths.document).size ?? 0;
  } catch {
    // Not told: the move finds out as it writes.
  }
  const full = roomError(size);
  if (full) throw full;
  const dir = outDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const password = toHex(randomBytes(32));
  const key = await backupKey(password);
  const parts: string[] = [];
  let written = 0;
  try {
    const native = await phoneSettingsForBackup();
    const skip = await openCollectionSkips();
    const bytes = await makeBackup(key, {
      parts: async (part) => {
        const name = partName(parts.length + 1);
        new File(dir, name).writeSync(part);
        parts.push(name);
        written += part.length;
        return name;
      },
      native,
      progress,
      skip,
    });
    new File(dir, BACKUP_FILE).writeSync(bytes);
    const made = Date.now();
    const note: MoveNote = { v: 1, from: INSTALLED_EDITION, to, made, backup: BACKUP_FILE, parts, password, size: written + bytes.length, roles: rolesHere() };
    new File(dir, MOVE_FILE).writeSync(JSON.stringify(note));
    writeMovedOut(to, made);
  } catch (error) {
    cancelMove();
    throw error;
  }
}

/** A move another edition on this phone made for this one. */
export type FoundMove = MoveNote & { pkg: string };

/** The moves waiting for this edition from the others on the phone, signed as this one is; the newest first. */
export async function findMoves(now = Date.now()): Promise<FoundMove[]> {
  if (!CAN_MOVE) return [];
  const sources = await device!.moveSources!().catch(() => []);
  const found: FoundMove[] = [];
  for (const { pkg, move } of sources) {
    const note = readMoveNote(move, now);
    // Only a move for this edition, from the app it says it is from (Erevos+'s bridge: app.erevos).
    if (note && moveFor(note, pkg, INSTALLED_EDITION, ownPackage() || PACKAGES[INSTALLED_EDITION])) found.push({ ...note, pkg });
  }
  return found.sort((a, b) => b.made - a.made);
}

/**
 * Takes `move`: copies its files here, opens the backup and puts it in place of everything this
 * app keeps, with the settings it holds, then tells the other edition, which deletes its copy.
 * The caller holds the receiver while it runs and opens Erevos again after (as Backups' restore).
 */
export async function takeMove(move: FoundMove, progress?: (done: number, all: number) => void): Promise<void> {
  // Its files are copied here, then restored: twice its size, for a while.
  const full = roomError(2 * (move.size ?? 0));
  if (full) throw full;
  const dir = new Directory(Paths.cache, 'move-in');
  if (dir.exists) dir.delete();
  dir.create({ intermediates: true, idempotent: true });
  try {
    const copy = async (name: string): Promise<File> => {
      const file = new File(dir, name);
      await device!.moveCopy!(move.pkg, name, file.uri);
      return file;
    };
    const backupFile = await copy(move.backup);
    const backup = await openBackup(await backupFile.bytes(), move.password);
    const names = backup.parts?.names ?? [];
    // Every part the backup names is the move's own: none from elsewhere.
    if (!names.every((name) => move.parts.includes(name))) throw new Error('The move names parts it does not have');
    for (const name of names) await copy(name);
    const before = await beforeRestore();
    await restoreBackup(
      backup,
      async (name) => {
        const file = new File(dir, name);
        return file.exists ? file.bytes() : null;
      },
      progress,
    );
    await afterRestore(backupNative(backup), before);
    // Told now, or at the next start: until then the other edition waits as moved out (lib/move-state.ts).
    if (!(await device!.moveDone!(move.pkg).catch(() => false))) keepFile(DONE_DUE, move.pkg);
    askRoles(move);
  } finally {
    if (dir.exists) dir.delete();
  }
}

/** Whether the app of `edition` is on the phone already (however signed): then a move needs no download. */
export function editionInstalled(edition: UpdateEdition): boolean {
  return device?.appInstalled?.(PACKAGES[edition]) ?? false;
}

/** This app's own Android package; '' where it cannot say (not Android, or a build before moves). */
export function ownPackage(): string {
  return device?.packageName?.() ?? '';
}
