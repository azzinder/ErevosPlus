// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { fromBase64, hardCost, hardKey, isHardCost, randomBytes, sameBytes, toBase64, utf8Encode } from '../lib/crypto';

import { CHAT_TRIES, countedCheck } from './tries';

// A chat locked with a PIN of its own (Chat details → Lock with a PIN): it opens only once the PIN
// is typed, and locks again once it is left, or Erevos was away more than RELOCK_MS. Meanwhile the
// list shows its name with a lock and nothing of its messages, and the home screen's search finds
// none of them. Kept with the contact, or the group, in the space's encrypted data: never the PIN,
// only Argon2id of it with a salt of its own (lib/crypto.ts hardKey), so each guess costs time and
// memory. Wrong ones are counted on the phone, for every chat at once and apart from the lock
// screen's (tries.ts): after a few, the next waits. A chat moved into hidden chats takes its PIN
// with it, which asks nothing there, as the hidden chats' own PIN guards them; moved back, the same
// PIN asks again.

/** A chat's PIN, as kept: Argon2id of it (`hash`) with `salt`, both base64, at cost `m`, `t`. */
export type ChatPin = { salt: string; hash: string; m: number; t: number };

/** How long Erevos may be away, ms, before a chat opened with its PIN locks again: as the password lock. */
export const RELOCK_MS = 30_000;

const SALT = 16;

async function hashOf(pin: string, salt: Uint8Array, cost: { m: number; t: number }): Promise<Uint8Array> {
  return hardKey(utf8Encode(pin.normalize('NFC')), salt, cost);
}

/** What is kept of a new PIN. */
export async function makeChatPin(pin: string): Promise<ChatPin> {
  const salt = randomBytes(SALT);
  const cost = hardCost();
  return { salt: toBase64(salt), hash: toBase64(await hashOf(pin, salt, cost)), ...cost };
}

/**
 * Whether `pin` is the one kept. Throws LockedOutError while too many wrong ones make it wait; a
 * wrong one counts, and a right one ends the count.
 */
export async function opensChat(pin: string, kept: ChatPin, now = Date.now()): Promise<boolean> {
  return countedCheck(CHAT_TRIES, now, async () => sameBytes(await hashOf(pin, fromBase64(kept.salt), kept), fromBase64(kept.hash)), (right) => right);
}

const isBase64Of = (v: unknown, length: number): v is string => {
  if (typeof v !== 'string' || v.length > 64) return false;
  try {
    return fromBase64(v).length === length;
  } catch {
    return false;
  }
};

/** A PIN as kept, or null if of the wrong shape. */
export function checkedChatPin(value: unknown): ChatPin | null {
  const v = (value ?? {}) as Partial<Record<keyof ChatPin, unknown>>;
  const cost = { m: v.m, t: v.t } as { m: number; t: number };
  return isBase64Of(v.salt, SALT) && isBase64Of(v.hash, 32) && isHardCost(cost) ? { salt: v.salt, hash: v.hash, m: cost.m, t: cost.t } : null;
}
