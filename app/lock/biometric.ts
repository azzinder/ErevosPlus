// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { fromBase64, randomBytes, toBase64 } from '../lib/crypto';
import { secureDelete, secureGet, secureSet } from '../lib/secure';

import { isPasswordLocked, loadLockConfig, ownSpaceKey, type Unlocked } from './config';
import { opensSpace } from './space-data';

// Unlocking with a fingerprint or face, on Android 11 and later (modules/erevos-biometric). Off
// unless turned on in Lock, and turning it on asks for the password of the space it is turned on
// in. The first space's key is then sealed by a key in the Android Keystore that only a strong
// fingerprint or face check opens, for each single use, and that Android drops when fingerprints
// or faces change. What it seals is kept here, in one keystore entry. The password always works
// too, and its wrong tries are counted as before (tries.ts): a fingerprint changes nothing there.
//
// Only the space of the first password ever opens this way. Turned on in any other space (one a
// second password opens), it seals a random key that opens nothing, in the same entry and the
// same shape, so what is stored does not show which space it was turned on in. It never touches
// hidden chats, whose PINs are kept apart (hidden.ts). The setting shows the same in every space:
// on while there is a sealed key and Android still has its own. When what a fingerprint opens is
// not the first space's key, or Android has dropped its key, it turns itself off, the same way in
// both cases, and the password opens Erevos.

// 'unknown': it cannot be told now (the phone itself is locked, as when an Erevos call shows over
// its lock screen, or the Keystore did not answer). That never turns it off by itself.
//
// A key broken in a way Android does not call invalidated stays 'unknown', and never gets better:
// each use only says that the key could not be used on an unlocked phone ('unusable'), as it also
// does when the Keystore merely did not answer. Those are counted when unlocking: UNUSABLE_MOST in
// a row, with no use of the key in between, turn it off as a dropped key does, so the button does
// not stay to fail for ever. Not counted: the phone itself locked, where the key cannot work, and
// Android's prompt saying no or being closed, where the key was ready.
export type KeyState = 'none' | 'valid' | 'invalidated' | 'unknown';

/** How many times in a row the key may be unusable on an unlocked phone before unlocking turns itself off. */
export const UNUSABLE_MOST = 3;

/** What the Keystore key sealed: its IV and the sealed data, base64. */
export interface Sealed {
  iv: string;
  data: string;
}

/** Android's prompt: its title and the button that closes it. */
export interface BiometricPrompt {
  title: string;
  cancel: string;
}

/** The phone's side (modules/erevos-biometric), or a stand-in for checks. */
export interface BiometricSealer {
  /** Android 11 or later, with a strong fingerprint or face set up. */
  available(): boolean;
  /** Whether the Keystore key is there, and still works, or 'unknown' when that cannot be told now. */
  keyState(): KeyState;
  /** Makes a new Keystore key, asks for a fingerprint or face and seals `data` (base64). */
  seal(data: string, prompt: BiometricPrompt): Promise<Sealed>;
  /** Asks for a fingerprint or face and opens what `seal` gave, as base64. */
  open(sealed: Sealed, prompt: BiometricPrompt): Promise<string>;
  /** Removes the Keystore key. */
  forget(): void;
}

// Why a fingerprint did not open anything: the prompt was closed, the key is gone or opens
// nothing, the key could not be used though the phone is unlocked, or Android said no (too many
// tries, say, or the phone itself locked), in its own words.
export type BiometricReason = 'cancelled' | 'invalidated' | 'unusable' | 'failed';

export class BiometricError extends Error {
  reason: BiometricReason;

  constructor(reason: BiometricReason, message?: string) {
    super(message ?? reason);
    this.reason = reason;
  }
}

const ENTRY = 'erevos.biometric';
// How many times in a row the key was unusable: a number only, the same whichever space is open.
const UNUSABLE = 'erevos.biometric-unusable';

async function unusableSoFar(): Promise<number> {
  const n = Number(await secureGet(UNUSABLE).catch(() => null));
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/** The key did its work, or was ready to: nothing counted stays. */
async function usable(): Promise<void> {
  if ((await secureGet(UNUSABLE).catch(() => null)) !== null) await secureDelete(UNUSABLE);
}

function parse(raw: string | null): Sealed | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Sealed> | null;
    return v && typeof v.iv === 'string' && typeof v.data === 'string' ? { iv: v.iv, data: v.data } : null;
  } catch {
    return null;
  }
}

/** Whether a fingerprint or face can open Erevos: shown the same in every space. */
export async function biometricOn(sealer: BiometricSealer): Promise<boolean> {
  if (!sealer.available() || !parse(await secureGet(ENTRY))) return false;
  const state = sealer.keyState();
  if ((state === 'valid' || state === 'unknown') && isPasswordLocked(await loadLockConfig())) return true;
  // Android dropped the key, or the lock is off: it is off too.
  await turnOffBiometric(sealer);
  return false;
}

// Turns it on in `space`, once `password` is shown to be that space's own: the first space's key
// is sealed, any other space's a random key that opens nothing. Anything turned on before is
// replaced, and stays off if the prompt is closed. False when the password is not this space's.
export async function turnOnBiometric(
  sealer: BiometricSealer,
  space: number,
  password: string,
  prompt: BiometricPrompt,
  now = Date.now(),
): Promise<boolean> {
  const key = await ownSpaceKey(space, password, now);
  if (!key) return false;
  await secureDelete(ENTRY);
  await secureDelete(UNUSABLE);
  const sealed = await sealer.seal(toBase64(space === 0 ? key : randomBytes(32)), prompt);
  await secureSet(ENTRY, JSON.stringify(sealed));
  return true;
}

// The first space and its key, opened with a fingerprint or face. Null when that no longer works:
// it is then off. Throws BiometricError when the prompt was closed, Android said no, or the key
// could not be used this time (UNUSABLE_MOST times in a row is "no longer works").
export async function unlockWithBiometric(sealer: BiometricSealer, prompt: BiometricPrompt): Promise<Unlocked | null> {
  const sealed = parse(await secureGet(ENTRY));
  if (!sealed) return null;
  let key: Uint8Array | null = null;
  try {
    key = fromBase64(await sealer.open(sealed, prompt));
    await usable();
  } catch (e) {
    if (!(e instanceof BiometricError)) throw e;
    if (e.reason === 'unusable') {
      const times = (await unusableSoFar()) + 1;
      if (times < UNUSABLE_MOST) {
        await secureSet(UNUSABLE, String(times));
        throw e;
      }
    } else {
      // The prompt showed, so the key was ready; the phone locked, or the prompt saying no, says nothing of it.
      if (e.reason === 'cancelled') await usable();
      if (e.reason !== 'invalidated') throw e;
    }
  }
  if (key && key.length === 32 && (await opensSpace(0, key))) return { space: 0, key };
  await turnOffBiometric(sealer);
  return null;
}

/** Turns it off: the sealed key and the Keystore key are removed. */
export async function turnOffBiometric(sealer: BiometricSealer): Promise<void> {
  await secureDelete(ENTRY);
  await secureDelete(UNUSABLE);
  sealer.forget();
}

// Whether a fingerprint or face gives `key`, the key of the space open now: to ask again before
// something of that space opens (the Collection). Never turns anything off, so a space whose
// sealed key is the random one (any but the first) only ever says no, and the password is asked.
// Throws BiometricError when the prompt was closed or Android said no.
export async function confirmWithBiometric(sealer: BiometricSealer, prompt: BiometricPrompt, key: Uint8Array): Promise<boolean> {
  const sealed = parse(await secureGet(ENTRY));
  if (!sealed) return false;
  let opened: Uint8Array;
  try {
    opened = fromBase64(await sealer.open(sealed, prompt));
  } catch (e) {
    if (e instanceof BiometricError && e.reason === 'invalidated') return false;
    throw e;
  }
  if (opened.length !== key.length) return false;
  let differ = 0;
  for (let i = 0; i < key.length; i++) differ |= opened[i] ^ key[i];
  return differ === 0;
}
