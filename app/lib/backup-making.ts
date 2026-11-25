// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useSyncExternalStore } from 'react';

// A backup into a folder being made (Settings → Backups → Make a backup): how far it is, and what
// came of it, kept outside the screen. So leaving the screen, or Erevos, while it is made and
// coming back shows it still going, and then how it ended, as if the screen had stayed open.
//
// Only in the space it was begun in. What came of it names the backup's file and folder, and counts
// the phone's SMS and calls: a space opened after that one closed is shown none of it, nor that a
// backup is being made. So when the space closes (app/_layout.tsx closeSpace) all of it goes, and a
// backup still being made then ends unseen: what it says is kept only in the turn it began in, and
// the phone's notice that names the backup (lib/backup-notice.ts) is not shown for it either.

export interface Making {
  step: string;
  percent: number | null;
}

export interface MadeNote {
  text: string;
  bad: boolean;
}

export interface BackupMaking {
  making: Making | null;
  note: MadeNote | null;
}

/** What one backup says as it is made: kept while the space it began in stays open, dropped after. */
export interface BackupTold {
  making: (making: Making | null) => void;
  note: (note: MadeNote | null) => void;
  /** Whether that space is still the one open: the phone's own notice that it is done is for it too. */
  kept: () => boolean;
}

const NOTHING: BackupMaking = { making: null, note: null };
let state: BackupMaking = NOTHING;
// Goes up each time a space closes.
let turn = 0;
const listeners = new Set<() => void>();

function set(next: BackupMaking): void {
  state = next;
  for (const listener of listeners) listener();
}

export function backupMaking(): BackupMaking {
  return state;
}

/** A backup begins: how far it is (null once done) and what came of it go through what this gives. */
export function beginBackupMaking(): BackupTold {
  const mine = turn;
  return {
    making: (making) => {
      if (mine === turn) set({ ...state, making });
    },
    note: (note) => {
      if (mine === turn) set({ ...state, note });
    },
    kept: () => mine === turn,
  };
}

/** What came of the last backup shows no more: the screen says something else now. */
export function clearBackupMadeNote(): void {
  if (state.note) set({ ...state, note: null });
}

/** The space closed: nothing of a backup made in it stays, and one still being made says no more. */
export function forgetBackupMaking(): void {
  turn++;
  if (state !== NOTHING) set(NOTHING);
}

export function onBackupMaking(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useBackupMaking(): BackupMaking {
  return useSyncExternalStore(onBackupMaking, backupMaking, backupMaking);
}
