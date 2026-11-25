// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import {
  decryptText,
  deriveKey,
  encryptText,
  fromBase64,
  fromHex,
  hardCost,
  hardKey,
  isHardCost,
  randomBytes,
  sameBytes,
  sha256Bytes,
  toBase64,
  toHex,
  type HardCost,
} from '../lib/crypto';
import { lockedSpeedIs, setLockedSpeedDials } from '../lib/phone-open';
import { secureGet, secureSet } from '../lib/secure';

import { shutDoorsPast } from './doors';
import { deleteOpenKey, saveOpenKey } from './keys';
import { loadPhoneData } from './phone-data';
import { SLOTS } from './slots';
import { countedCheck, KEY_TRIES } from './tries';

// Password lock, built the way LPHL FASOULI builds its own. Kept in the OS keystore, outside
// every space, because it decides which space opens and holds its key.
//
// Slot 0 holds the password of the real space. Any space can set a "second password". It goes in
// the next slot and opens its own separate space (slot 1 opens space 1, and so on). There are
// always at least SLOTS slots, the unused ones holding random values shaped like used ones, and
// unlocking checks every slot. So neither what is stored nor how long unlocking takes shows
// whether a second password is in use, and nothing in the app says so.
//
// A slot tells its password by `check` and holds its space's key sealed, so the space can only be
// opened with the password. PBKDF2 derives a key K from the password, then Argon2id (`hard`) a
// key A from SHA-256 of K: `check` is SHA-256 of A, and the space key is sealed with K, then with
// A. So each guess at a password costs memory as well as time. A slot from before Argon2id had
// SHA-256 of K as its check and the space key sealed with K only; hardenSlot gives it A from that
// check, without the password, and every slot gets it at once (hardenLock), used or not, so none
// shows that it was used since.
//
// Wrong passwords are counted on the phone and make the next check wait (tries.ts), wherever a
// password is compared with the slots.

export interface Slot {
  salt: string;
  iter: number;
  check: string;
  key: string;
  // Missing in a slot from before Argon2id.
  hard?: Hard;
}

/** Argon2id's salt and cost for a slot. */
export type Hard = HardCost & { salt: string };

export interface LockConfig {
  slots: Slot[];
  // A space that opens without asking. Turning the lock off in any space but the first sets
  // this: that space then opens directly (its key is in the keystore), while the ones before it
  // stay behind their passwords (see lockWithPassword).
  direct: number | null;
  // PBKDF2 iterations of every slot, so unlocking takes the same time whichever slot the
  // password opens.
  iter: number;
}

/** An unlocked space and its key. */
export interface Unlocked {
  space: number;
  key: Uint8Array;
}

export { SLOTS };
// Native PBKDF2 (OpenSSL) on phones: well under a second for every slot.
export const ITER = 200_000;
const KEY = 'erevos.lock';
const EMPTY: LockConfig = { slots: [], direct: null, iter: ITER };

const newHard = (): Hard => ({ salt: toBase64(randomBytes(16)), ...hardCost() });

// A from what Argon2id starts from: SHA-256 of K, or a slot's check from before Argon2id.
const hardened = (from: Uint8Array, hard: Hard) => hardKey(from, fromBase64(hard.salt), hard);

/** Seals a space key with a password. */
export async function sealSlot(password: string, spaceKey: Uint8Array, iter: number): Promise<Slot> {
  const salt = randomBytes(16);
  const k = await deriveKey(password, salt, iter);
  const hard = newHard();
  const a = await hardened(sha256Bytes(k), hard);
  return { salt: toBase64(salt), iter, check: toBase64(sha256Bytes(a)), key: encryptText(a, encryptText(k, toHex(spaceKey))), hard };
}

/** A slot no password opens, shaped like a used one. */
export function unusedSlot(iter: number): Slot {
  return {
    salt: toBase64(randomBytes(16)),
    iter,
    check: toBase64(randomBytes(32)),
    key: encryptText(randomBytes(32), encryptText(randomBytes(32), toHex(randomBytes(32)))),
    hard: newHard(),
  };
}

/** A slot from before Argon2id, given it without its password: it opens with the same one. Any
 *  other slot as it is. */
export async function hardenSlot(slot: Slot): Promise<Slot> {
  if (slot.hard) return slot;
  const hard = newHard();
  const a = await hardened(fromBase64(slot.check), hard);
  return { ...slot, check: toBase64(sha256Bytes(a)), key: encryptText(a, slot.key), hard };
}

/** What a password gives for a slot it opens: K, and A unless the slot is from before Argon2id. */
type SlotKeys = { k: Uint8Array; a: Uint8Array | null };

async function checked(slot: Slot, k: Uint8Array): Promise<SlotKeys | null> {
  const a = slot.hard ? await hardened(sha256Bytes(k), slot.hard) : null;
  return sameBytes(sha256Bytes(a ?? k), fromBase64(slot.check)) ? { k, a } : null;
}

/** The space key a slot holds, with the keys its password gave. */
function opened(slot: Slot, { k, a }: SlotKeys): Uint8Array {
  return fromHex(decryptText(k, a ? decryptText(a, slot.key) : slot.key));
}

/** At least `min` slots (and SLOTS), the added ones unused. */
function padded(slots: Slot[], iter: number, min = SLOTS): Slot[] {
  const out = [...slots];
  while (out.length < Math.max(min, SLOTS)) out.push(unusedSlot(iter));
  return out;
}

const isHard = (v: unknown): v is Hard => !!v && typeof (v as Partial<Hard>).salt === 'string' && isHardCost(v as Partial<Hard>);

export const isSlot = (v: unknown): v is Slot => {
  const s = v as Partial<Slot> | null;
  return (
    !!s &&
    typeof s.salt === 'string' &&
    typeof s.iter === 'number' &&
    typeof s.check === 'string' &&
    typeof s.key === 'string' &&
    (s.hard === undefined || isHard(s.hard))
  );
};

export async function loadLockConfig(): Promise<LockConfig> {
  const raw = await secureGet(KEY);
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw) as Partial<LockConfig>;
    if (!Array.isArray(data.slots) || !data.slots.every(isSlot)) return EMPTY;
    return {
      slots: data.slots,
      direct: typeof data.direct === 'number' ? data.direct : null,
      iter: typeof data.iter === 'number' ? data.iter : ITER,
    };
  } catch {
    return EMPTY;
  }
}

async function save(config: LockConfig): Promise<void> {
  await secureSet(KEY, JSON.stringify(config));
}

// The panic password (Settings → Privacy and security → Panic button): typed on the lock screen,
// it wipes Erevos as the panic button does (lib/panic.ts, lock/gate.tsx). It is kept apart from
// the slots, as one more entry shaped like a slot, whose key opens nothing: there from the first
// start (preparePanicPassword), random until one is set and again once it is turned off, and
// checked with the slots each time a password is compared with them, the same way. So neither what
// is stored nor how long a check takes shows whether a panic password is set. It must open no
// space, and no space's password may be it (SamePasswordError). Backups hold it with the lock
// (lock/backup.ts), so a restore keeps the panic password as it was.
export const PANIC_KEY = 'erevos.lock-panic';

async function loadPanicSlot(iter: number): Promise<Slot> {
  try {
    const raw = await secureGet(PANIC_KEY);
    const slot = raw ? (JSON.parse(raw) as unknown) : null;
    if (isSlot(slot) && slot.hard) return slot;
  } catch {
    // Made anew below.
  }
  const slot = unusedSlot(iter);
  await secureSet(PANIC_KEY, JSON.stringify(slot));
  return slot;
}

/** The panic password's entry exists from the first start, random until one is set. */
export async function preparePanicPassword(): Promise<void> {
  // The slots' own count of rounds, so a check of it takes as long as one of theirs.
  await loadPanicSlot((await loadLockConfig()).iter);
}

/** Typed on the lock screen, the panic password: wipe Erevos now (lib/panic.ts wipeNow). */
export class PanicPasswordError extends Error {
  constructor() {
    super('panicPassword');
  }
}

/** Whether the app asks for a password when it opens. */
export function isPasswordLocked(config: LockConfig): boolean {
  return config.slots.length > 0 && config.direct === null;
}

let hardening: Promise<void> | null = null;

/**
 * Gives every slot from before Argon2id the slot it becomes (hardenSlot), all in one write. Run
 * when Erevos starts, and before the lock changes, so a change never meets the slots half done.
 */
export function hardenLock(): Promise<void> {
  hardening ??= (async () => {
    const config = await loadLockConfig();
    if (config.slots.every((slot) => slot.hard)) return;
    const slots: Slot[] = [];
    for (const slot of config.slots) slots.push(await hardenSlot(slot));
    await save({ ...config, slots });
  })().finally(() => {
    hardening = null;
  });
  return hardening;
}

/** The lock as it is, every slot with Argon2id: for what changes it. */
async function current(): Promise<LockConfig> {
  await hardenLock();
  return loadLockConfig();
}

/**
 * The slot a password opens (and its keys), or -1. Every slot is checked, whichever matches:
 * PBKDF2 for all at once, then Argon2id one slot after another, so only one takes its memory.
 */
async function match(config: LockConfig, password: string): Promise<{ index: number; keys: SlotKeys | null }> {
  const ks = await Promise.all(config.slots.map((slot) => deriveKey(password, fromBase64(slot.salt), slot.iter)));
  let found: { index: number; keys: SlotKeys | null } = { index: -1, keys: null };
  for (const [index, slot] of config.slots.entries()) {
    const keys = await checked(slot, ks[index]);
    if (keys && found.index < 0) found = { index, keys };
  }
  return found;
}

/** The key a slot holds for a password, or null when it is not that slot's password. */
export async function trySlot(slot: Slot, password: string): Promise<Uint8Array | null> {
  const keys = await checked(slot, await deriveKey(password, fromBase64(slot.salt), slot.iter));
  return keys ? opened(slot, keys) : null;
}

/** The space key a slot holds for its password's keys. */
function openSlot(config: LockConfig, index: number, keys: SlotKeys): Uint8Array {
  return opened(config.slots[index], keys);
}

// match, counting: throws LockedOutError while wrong passwords have made it wait, counts a miss
// as one more and a hit as the end of the count. Every comparison with the slots goes through
// here, since each one would tell whether a password opens some space.
// The panic password is checked with the slots, as one more (`panic`: it was the one typed).
async function countedMatch(config: LockConfig, password: string, now: number): Promise<{ index: number; keys: SlotKeys | null; panic: boolean }> {
  // One at a time, counted before the slow keys are made (tries.ts countedCheck).
  const result = await countedCheck(
    KEY_TRIES,
    now,
    async () => match({ ...config, slots: [...config.slots, await loadPanicSlot(config.iter)] }, password),
    (found) => found.index >= 0,
  );
  const panic = result.index === config.slots.length;
  return panic ? { index: -1, keys: null, panic } : { ...result, panic };
}

/**
 * Which space a password opens, with its key, or null if it opens none. Throws LockedOutError while
 * it must wait, and PanicPasswordError for the panic password.
 */
export async function unlock(config: LockConfig, password: string, now = Date.now()): Promise<Unlocked | null> {
  const { index, keys, panic } = await countedMatch(config, password, now);
  if (panic) throw new PanicPasswordError();
  if (index < 0 || !keys) return null;
  return { space: index, key: openSlot(config, index, keys) };
}

/**
 * The space `password` opens, with its key, or null: every slot tried, as unlock does, but not
 * counted, and the panic password opens nothing here. For the search of the chats, which counts
 * its own tries (lock/hidden.ts searchOpens).
 */
export async function spaceOf(password: string): Promise<Unlocked | null> {
  const config = await current();
  const { index, keys } = await match(config, password);
  return index >= 0 && keys ? { space: index, key: openSlot(config, index, keys) } : null;
}

// The key of `space` when `password` is that space's own, else null: to make sure it is the owner
// who turns on unlocking with a fingerprint (biometric.ts). Every slot is checked, and counted.
export async function ownSpaceKey(space: number, password: string, now = Date.now()): Promise<Uint8Array | null> {
  const config = await current();
  const { index, keys } = await countedMatch(config, password, now);
  return index === space && keys ? openSlot(config, index, keys) : null;
}

export class SamePasswordError extends Error {
  constructor() {
    super('samePassword');
  }
}

// Sets (or changes) the password of a space, sealing `spaceKey` with it: its own password, or the
// second password of the space before it (then with a new key for the new space). It must differ
// from the other passwords.
export async function setLockPassword(space: number, password: string, spaceKey: Uint8Array, now = Date.now()): Promise<void> {
  const config = await current();
  // There is always a slot after this one, for its own second password.
  const slots = padded(config.slots, config.iter, space + 2);
  const { index, panic } = await countedMatch({ ...config, slots }, password, now);
  if ((index >= 0 && index !== space) || panic) throw new SamePasswordError();
  slots[space] = await sealSlot(password, spaceKey, config.iter);
  await save({ slots, direct: config.direct, iter: config.iter });
}

// Turns the password lock on from a space that opens without one (its key is `spaceKey`). A
// password that already opens another space opens that space instead: after the lock was turned
// off in a second space, this is how to get back to the space behind the first password. Any
// other password becomes this space's. Returns the space to open, or null to stay.
export async function lockWithPassword(space: number, password: string, spaceKey: Uint8Array, now = Date.now()): Promise<Unlocked | null> {
  const config = await current();
  if (config.slots.length > 0) {
    const { index, keys, panic } = await countedMatch(config, password, now);
    if (panic) throw new SamePasswordError();
    if (index >= 0 && index !== space && keys) {
      const key = openSlot(config, index, keys);
      await save({ ...config, direct: null });
      await deleteOpenKey(space);
      return { space: index, key };
    }
  }
  const slots = padded(config.slots, config.iter, space + 2);
  slots[space] = await sealSlot(password, spaceKey, config.iter);
  await save({ slots, direct: null, iter: config.iter });
  // From now on the key is only in the slot.
  await deleteOpenKey(space);
  return null;
}

// A space no password opens any more may be the one that keeps speed dial working with Erevos
// locked (lib/phone-open.ts): its copy of the numbers would go on being called, and nothing could
// take it away. So the copy goes with the password, unless the space open now (`space`, with its
// key) is the one that keeps it. The copy does not say whose it is, so one kept by a space before
// this one goes too, and is turned on there again. Before the password goes: should the copy not
// go, the password stays as it was.
export async function dropOthersLockedSpeed(space: number, spaceKey: Uint8Array): Promise<void> {
  const own = await loadPhoneData('space', space, spaceKey).then(
    (data) => lockedSpeedIs(data.lockedFeed),
    () => false,
  );
  if (!own) await setLockedSpeedDials(null);
}

/** Makes the second password set in this space (and any set beyond it) stop working. `spaceKey` is this space's key. */
export async function removeSecondPassword(space: number, spaceKey: Uint8Array): Promise<void> {
  await dropOthersLockedSpeed(space, spaceKey);
  const config = await current();
  await save({ ...config, slots: config.slots.map((slot, j) => (j > space ? unusedSlot(config.iter) : slot)) });
  // The spaces it opened say nothing more while closed (lock/doors.ts).
  await shutDoorsPast(space).catch(() => undefined);
}

// Turns the password lock off. `spaceKey` is the open space's key, kept in the keystore from now
// on. In the first space that removes every password. In any other, that space opens directly
// from now on, its second password stops working, and the spaces before it stay locked. With no
// lock screen the Phone never opens locked, so the copy of speed dial numbers it calls then
// (lib/phone-open.ts) goes, whichever space kept it.
export async function removePasswordLock(space: number, spaceKey: Uint8Array): Promise<void> {
  await setLockedSpeedDials(null);
  await saveOpenKey(space, spaceKey);
  await shutDoorsPast(space).catch(() => undefined);
  // With no lock screen, no panic password: should the lock come back, none waits in it.
  await removePanicPassword();
  if (space === 0) {
    await save(EMPTY);
    return;
  }
  const config = await current();
  await save({ slots: config.slots.map((slot, j) => (j > space ? unusedSlot(config.iter) : slot)), direct: space, iter: config.iter });
}

/**
 * Sets the panic password: typed on the lock screen, it wipes Erevos. It must open no space; it is
 * compared with every slot, and counted, as any password is.
 */
export async function setPanicPassword(password: string, now = Date.now()): Promise<void> {
  const config = await current();
  const { index } = await countedMatch(config, password, now);
  if (index >= 0) throw new SamePasswordError();
  await secureSet(PANIC_KEY, JSON.stringify(await sealSlot(password, randomBytes(32), config.iter)));
}

/** No panic password any more: its entry random again, as before one was set. */
export async function removePanicPassword(): Promise<void> {
  await secureSet(PANIC_KEY, JSON.stringify(unusedSlot((await loadLockConfig()).iter)));
}
