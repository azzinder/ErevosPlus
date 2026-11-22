// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { randomBytes, toHex } from '../lib/crypto';
import { secureDelete, secureGet, secureSet } from '../lib/secure';

// Which restore of a backup this phone last had. A backup holds each chat's conversations as
// they were when it was made, and a conversation put back that way would seal its next messages
// with the very message keys it used after the backup, key and nonce alike: whoever kept the
// packets of both could read what the two say together. So restoring a backup marks the phone
// with a new random id, kept outside the backup, and each chat that opens with conversations
// from before that mark first moves them past the keys they may have used (lib/e2e.ts).
//
// The mark says only that a backup was restored here, not which spaces or chats it held. With it
// is kept when that was (AT): an SMS for later whose time came before then does not go by itself
// (lib/sms-later.ts), as the phone the backup came from may have sent it already. The mark is made
// before the restore writes anything, so nothing it puts back goes by itself in the meantime.
//
// Each phone also has an id of its own (PHONE), random, which no backup restores: a backup holds
// the id of the phone it was made on, so a restore knows whether it came from another phone. The
// SIMs chosen for numbers are known by ids that phone gave them, which on another phone name
// another SIM or none (lock/sms-data.ts, lock/phone-data.ts), so they count only on the phone they
// were chosen on. Once a backup from another phone was restored here (ELSEWHERE), SIMs kept from
// before the phone said which phone they were chosen on count no more.
//
// The phone a backup came from may be lost or stolen and still on, reading on the relay queues it
// knew. Once the owner says so (app/backup.tsx), this phone is marked with a new random id (LOST),
// kept outside the backup with the restore it came after, and each space and hidden place a backup
// put back here moves every queue it knows to a new one, once, as it next looks (lib/queue-move.ts
// lostNow): each keeps the mark it last moved for. A restore since makes the mark count no more,
// so nothing moves by itself for a backup put back later. Whether the last restore was of a
// backup from another phone is kept too (OTHER, that restore's id): Backups then points at it.

const KEY = 'erevos.restored';
const AT = 'erevos.restored-at';
const PHONE = 'erevos.phone-id';
const ELSEWHERE = 'erevos.restored-elsewhere';
const OTHER = 'erevos.restored-other';
const LOST = 'erevos.lost-phone';
const MOVED = 'erevos.restored-move';

const isId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{32}$/.test(id);

/** The id of the last restore of a backup on this phone, or '' when none was restored. */
export async function lastRestore(): Promise<string> {
  const id = await secureGet(KEY);
  return isId(id) ? id : '';
}

/** When a backup was last restored on this phone, milliseconds, 0 when none was. */
export async function restoredAt(): Promise<number> {
  const at = Number(await secureGet(AT));
  return Number.isSafeInteger(at) && at > 0 ? at : 0;
}

/**
 * Marks a restore of a backup, at `now`; `elsewhere`, of one made on another phone. Gives back how
 * to take the mark back, for a restore that then changed nothing.
 */
export async function markRestore(now = Date.now(), elsewhere = false): Promise<() => Promise<void>> {
  const was = await Promise.all([KEY, AT, ELSEWHERE, OTHER].map(async (name) => [name, await secureGet(name)] as const));
  const id = toHex(randomBytes(16));
  await secureSet(KEY, id);
  await secureSet(AT, String(now));
  if (elsewhere) {
    await secureSet(ELSEWHERE, '1');
    await secureSet(OTHER, id);
  }
  return async () => {
    for (const [name, value] of was) {
      if (value === null) await secureDelete(name);
      else await secureSet(name, value);
    }
  };
}

// A restore that was a move from another edition on this phone (lib/edition-move.ts takeMove): the
// app moved from receives and sends nothing from then on (lib/move-state.ts), so what it kept of an
// account goes on here as the same device, never as two (lib/matrix-store.ts).

/** Marks the last restore as a move's, made by takeMove once it restored. */
export async function markMove(): Promise<void> {
  const id = await lastRestore();
  if (id) await secureSet(MOVED, id);
}

/** Whether the restore `id` was a move's (markMove). */
export async function restoreWasMove(id: string): Promise<boolean> {
  return isId(id) && (await secureGet(MOVED)) === id;
}

/** Whether the last restore here was of a backup made on another phone. */
export async function restoredFromOther(): Promise<boolean> {
  const restore = await lastRestore();
  return !!restore && (await secureGet(OTHER)) === restore;
}

/** Says the phone a backup came from was lost (app/backup.tsx), at `now`: a new mark. */
export async function markLost(now = Date.now()): Promise<void> {
  await secureSet(LOST, JSON.stringify({ id: toHex(randomBytes(16)), after: await lastRestore(), at: now }));
}

// The mark as kept, while no restore came after it.
async function lostNow(): Promise<{ id: string; at: number } | null> {
  let kept: { id?: unknown; after?: unknown; at?: unknown };
  try {
    kept = JSON.parse((await secureGet(LOST)) ?? 'null') ?? {};
  } catch {
    return null;
  }
  const at = typeof kept.at === 'number' && Number.isSafeInteger(kept.at) && kept.at > 0 ? kept.at : 0;
  return isId(kept.id) && kept.after === (await lastRestore()) ? { id: kept.id, at } : null;
}

/** The mark of the phone lost (markLost), or '' when none was made since the last restore. */
export async function lostMark(): Promise<string> {
  return (await lostNow())?.id ?? '';
}

/** When the phone lost was said so (markLost), milliseconds, 0 when it was not since the last restore. */
export async function lostAt(): Promise<number> {
  return (await lostNow())?.at ?? 0;
}

// The id being made, so two that ask at once get the same one.
let making: Promise<string> | null = null;

/** This phone's own id: random, made the first time it is asked for, and in no backup. */
export async function phoneId(): Promise<string> {
  const kept = await thisPhone();
  if (kept) return kept;
  making ??= (async () => {
    const id = toHex(randomBytes(16));
    await secureSet(PHONE, id);
    return id;
  })().finally(() => {
    making = null;
  });
  return making;
}

/** This phone's own id, or '' when none was made yet: then nothing came from it. */
export async function thisPhone(): Promise<string> {
  const kept = await secureGet(PHONE);
  return kept && kept.length <= 64 ? kept : '';
}

/** Whether SIMs chosen on the phone `on` names (a phoneId; '' for SIMs kept before phones were
 *  named) are this phone's. */
export async function simsHere(on: string): Promise<boolean> {
  if (on) return on === (await thisPhone());
  return (await secureGet(ELSEWHERE)) === null;
}
