// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { sealedFile, type Holder } from './sealed-file';

// A space's Telegram sign-in for backups (lib/telegram-store.ts keepTelegramForBackup): TDLib's
// td.binlog, the account's keys and settings, as TDLib keeps it, already encrypted with the key it
// has from the space (lib/telegram.ts telegramKeys), here sealed again with the space's key, one
// for each space and hidden place as lock/telegram-data.ts is, so nothing tells whether a space has
// one. It is kept only as a backup is made, while its space is open, and goes into backups among
// the sealed files (lock/backup.ts), in pages (sealed-file.ts); its chats and files stay out, as
// TDLib fetches them again. After a restore it is put back before the space's Telegram first
// opens here (RESTORE_PENDING).

export const FILE = 'erevos-telegram-sign-in';
const BLOCK = 4 * 1024;

/** `signIn`: td.binlog in base64, '' for none; `at`: when it was kept, ms. */
export type TelegramSignIn = { signIn: string; at: number };

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

export function checkedTelegramSignIn(value: unknown): TelegramSignIn {
  const v = (value ?? {}) as { signIn?: unknown; at?: unknown };
  const signIn = typeof v.signIn === 'string' && v.signIn.length % 4 === 0 && BASE64.test(v.signIn) ? v.signIn : '';
  const at = signIn && typeof v.at === 'number' && Number.isSafeInteger(v.at) && v.at > 0 ? v.at : 0;
  return { signIn, at };
}

const store = sealedFile<TelegramSignIn>({ name: FILE, empty: { signIn: '', at: 0 }, checked: checkedTelegramSignIn, block: BLOCK });

/** The sign-in kept for backups of the space's Telegram, or a hidden place's (`holder`). */
export function loadTelegramSignIn(space: number, key: Uint8Array, holder: Holder = 'space'): Promise<TelegramSignIn> {
  return store.load(holder, space, key);
}

export function saveTelegramSignIn(space: number, key: Uint8Array, data: TelegramSignIn, holder: Holder = 'space'): Promise<void> {
  return store.save(holder, space, key, data);
}

/**
 * Where the restore whose Telegram sign-ins wait for their spaces is kept: its id (lock/restored.ts)
 * and the slots (lib/telegram.ts) already put back, as JSON.
 */
export const RESTORE_PENDING = 'erevos.telegram-restore';

export type TelegramRestore = { id: string; done: string[] };

export function checkedTelegramRestore(text: string | null): TelegramRestore | null {
  if (!text) return null;
  try {
    const v = JSON.parse(text) as { id?: unknown; done?: unknown };
    if (typeof v.id !== 'string' || !v.id || !Array.isArray(v.done)) return null;
    return { id: v.id, done: v.done.filter((slot): slot is string => typeof slot === 'string' && /^[0-9a-f]{16,64}$/.test(slot)) };
  } catch {
    return null;
  }
}
