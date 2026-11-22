// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Directory, File, Paths } from 'expo-file-system';

import { device } from '../modules/erevos-device';
import { readMoveNote, readMovedOut } from './move-note';
import type { UpdateEdition } from './update-channel';

// Whether this app has a move for another edition, and moved out (lib/edition-move.ts): apart from
// it, with nothing of the backups, so that what runs in the background (lib/background.ts) can ask.

export const MOVE_FILE = 'move.json';

/** Whether this Erevos can hand over or take a move: on Android, from the build that has Move.kt. */
export const CAN_MOVE = !!device?.moveOutDir && !!device?.moveSources;

export function outDir(): Directory {
  const path = device?.moveOutDir?.();
  if (!path) throw new Error('No folder for the move');
  return new Directory(`file://${path}`);
}

/** Deletes this app's move for another edition, if any. */
export function clearMove(): void {
  device?.moveClear?.();
}

/** Deletes this app's move once it waited longer than MOVE_WAITS, or is not readable; and then the word that it moved out. */
export function clearStaleMove(now = Date.now()): void {
  if (!CAN_MOVE) return;
  try {
    const dir = outDir();
    const note = new File(dir, MOVE_FILE);
    if (!note.exists) {
      if (dir.list().length) clearMove();
      return;
    }
    if (!readMoveNote(note.textSync(), now)) {
      clearMove();
      movedFile().delete();
    }
  } catch {
    // Looked at again next time.
  }
}

// The word, beside this app's data and out of the folder the other edition reads, that this app
// moved out (lib/move-note.ts readMovedOut): kept until the move is called off or goes stale,
// or the data is deleted.
const movedFile = () => new File(Paths.document, 'moved-out.json');

/**
 * Whether this app moved out, and its move was taken (its folder for moves emptied by the edition
 * moved to) or still waits; null when it did not, or the move went stale (see clearStaleMove).
 * While it did, Erevos opens no space: it shows only that (components/moved-out.tsx), so that
 * nothing comes in here that the other edition does not have, and nothing goes out twice.
 */
export function movedOut(now = Date.now()): { to: UpdateEdition; taken: boolean } | null {
  if (!CAN_MOVE) return null;
  try {
    clearStaleMove(now);
    const file = movedFile();
    if (!file.exists) return null;
    const note = readMovedOut(file.textSync());
    if (!note) {
      file.delete();
      return null;
    }
    return { to: note.to, taken: !new File(outDir(), MOVE_FILE).exists };
  } catch {
    return null;
  }
}

/** Writes that this app moved out to `to`, its move made at `made`. */
export function writeMovedOut(to: UpdateEdition, made: number): void {
  movedFile().writeSync(JSON.stringify({ to, made }));
}

/** Calls the move off: its files and the word that this app moved out go, and Erevos opens as before. */
export function cancelMove(): void {
  clearMove();
  try {
    const file = movedFile();
    if (file.exists) file.delete();
  } catch {
    // Gone with the move's files all the same, at the next start (movedOut).
  }
}

const movedListeners = new Set<() => void>();

/** Tells app/_layout.tsx that this app has just moved out, so it closes the space and shows only that. */
export function announceMovedOut(): void {
  movedListeners.forEach((listener) => listener());
}

export function onMovedOut(listener: () => void): () => void {
  movedListeners.add(listener);
  return () => void movedListeners.delete(listener);
}
