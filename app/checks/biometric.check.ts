// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Unlocking with a fingerprint or face (lock/biometric.ts), with a stand-in for Android's
// Keystore and prompt. The phone's own side (modules/erevos-biometric) is tried on the phone.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { decryptText, encryptText, fromBase64, randomBytes, setHardCost, setPbkdf2, toBase64, toHex, webCryptoPbkdf2 } from '../lib/crypto';
import {
  BiometricError,
  biometricOffered,
  biometricOfferedBefore,
  biometricOn,
  turnOffBiometric,
  turnOnBiometric,
  unlockWithBiometric,
  UNUSABLE_MOST,
  type BiometricSealer,
  type KeyState,
} from '../lock/biometric';
import { loadLockConfig, removePasswordLock, setLockPassword, unlock } from '../lock/config';
import { EMPTY_SPACE, prepareSpaces, saveSpaceData } from '../lock/space-data';
import { store } from './secure-memory';
import { useWasmCore } from './wasm-core';

useWasmCore();
// Argon2id at a small cost, so the many unlocks here run quick; its full cost has its own check.
setHardCost({ m: 64, t: 1 });

setPbkdf2(webCryptoPbkdf2()!);
// Each check well after the one before, so the wait after wrong passwords never gets in the way.
let clock = Date.now();
Date.now = () => (clock += 2 * 3600_000);

const PROMPT = { title: 'Erevos', cancel: 'Cancel' };
const ENTRY = 'erevos.biometric';

// Android's side, in memory: a Keystore key made anew by each seal, which a "fingerprint change"
// drops, and a prompt the owner may close.
class FakePhone implements BiometricSealer {
  key: Uint8Array | null = null;
  dropped = false;
  closePrompt = false;
  // The phone itself locked, as when an Erevos call shows over its lock screen: the key cannot be
  // used then, and Android says so in its own words, not as a dropped key.
  phoneLocked = false;
  // The key broken otherwise than dropped, or the Keystore not answering: its state cannot be
  // told, and each use on an unlocked phone says only that the key could not be used.
  broken = false;
  // Everything ever given to seal, to see what was sealed.
  sealed: string[] = [];
  // No strong fingerprint or face set up on the phone.
  bare = false;
  // How many times the Keystore was asked whether the key still works: each one is a use of the key started.
  asked = 0;
  available = () => !this.bare;
  // Off the app's own thread on the phone, so it answers later.
  keyState = async (): Promise<KeyState> => {
    this.asked++;
    return this.key ? (this.dropped ? 'invalidated' : this.phoneLocked || this.broken ? 'unknown' : 'valid') : 'none';
  };
  async seal(data: string) {
    this.key = randomBytes(32);
    this.dropped = false;
    if (this.closePrompt) throw new BiometricError('cancelled');
    this.sealed.push(data);
    return { iv: toBase64(randomBytes(12)), data: encryptText(this.key, data) };
  }
  async open({ data }: { iv: string; data: string }) {
    if (!this.key || this.dropped) throw new BiometricError('invalidated');
    if (this.phoneLocked) throw new BiometricError('failed', 'Unlock the phone');
    if (this.broken) throw new BiometricError('unusable', 'Failed to obtain information about key');
    if (this.closePrompt) throw new BiometricError('cancelled');
    try {
      return decryptText(this.key, data);
    } catch {
      throw new BiometricError('invalidated');
    }
  }
  forget = () => {
    this.key = null;
  };
}

const real = randomBytes(32);
const decoy = randomBytes(32);

// The lock on, with a second password, and both spaces with their entries.
async function locked() {
  store.clear();
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  await saveSpaceData(0, real, EMPTY_SPACE);
  await saveSpaceData(1, decoy, EMPTY_SPACE);
  await prepareSpaces(2);
}

const fails = () => (JSON.parse(store.get('erevos.lock-tries') ?? '{"fails":0}') as { fails: number }).fails;
const opened = (r: { space: number; key: Uint8Array } | null) => r && { space: r.space, key: toHex(r.key) };

test("off unless turned on, and turned on only with the space's own password", async () => {
  await locked();
  const phone = new FakePhone();
  assert.equal(await biometricOn(phone), false);
  assert.equal(await unlockWithBiometric(phone, PROMPT), null);
  // A wrong password, or another space's, turns nothing on, and a wrong one counts as a wrong try.
  const before = fails();
  assert.equal(await turnOnBiometric(phone, 0, 'nope', PROMPT), false);
  assert.equal(fails(), before + 1);
  assert.equal(await turnOnBiometric(phone, 0, 'decoy-2222', PROMPT), false);
  assert.equal(await biometricOn(phone), false);
  assert.equal(phone.key, null);

  assert.equal(await turnOnBiometric(phone, 0, 'real-1111', PROMPT), true);
  assert.equal(await biometricOn(phone), true);
  assert.deepEqual(opened(await unlockWithBiometric(phone, PROMPT)), { space: 0, key: toHex(real) });
  // The key is kept only sealed by the Keystore key.
  assert.ok(![...store.values()].some((v) => v.includes(toHex(real)) || v.includes(toBase64(real))));
  // The password always works too.
  assert.deepEqual(opened(await unlock(await loadLockConfig(), 'real-1111')), { space: 0, key: toHex(real) });
});

test("turned on in a second password's space, it stores the same and opens nothing", async () => {
  await locked();
  const first = new FakePhone();
  await turnOnBiometric(first, 0, 'real-1111', PROMPT);
  const shape = (store.get(ENTRY) ?? '').replace(/[A-Za-z0-9+/=]{8,}/g, (m) => `${m.length}`);

  await locked();
  const phone = new FakePhone();
  assert.equal(await turnOnBiometric(phone, 1, 'real-1111', PROMPT), false);
  assert.equal(await turnOnBiometric(phone, 1, 'decoy-2222', PROMPT), true);
  assert.equal((store.get(ENTRY) ?? '').replace(/[A-Za-z0-9+/=]{8,}/g, (m) => `${m.length}`), shape);
  // It shows on, as in the first space, but never seals that space's key.
  assert.equal(await biometricOn(phone), true);
  assert.ok(!phone.sealed.some((data) => toHex(fromBase64(data)) === toHex(decoy)));
  // A fingerprint opens neither space: it turns itself off, and the passwords still work.
  assert.equal(await unlockWithBiometric(phone, PROMPT), null);
  assert.equal(await biometricOn(phone), false);
  assert.equal(store.get(ENTRY), undefined);
  assert.equal(phone.key, null);
  assert.deepEqual(opened(await unlock(await loadLockConfig(), 'decoy-2222')), { space: 1, key: toHex(decoy) });
  assert.deepEqual(opened(await unlock(await loadLockConfig(), 'real-1111')), { space: 0, key: toHex(real) });
});

test('turned on in a second space after the first, it replaces what the first sealed', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  await turnOnBiometric(phone, 1, 'decoy-2222', PROMPT);
  assert.equal(await unlockWithBiometric(phone, PROMPT), null);
  assert.equal(await biometricOn(phone), false);
});

test('when Android drops its key, as fingerprints change, it is off, the same as when it opens nothing', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.dropped = true;
  assert.equal(await unlockWithBiometric(phone, PROMPT), null);
  assert.equal(store.get(ENTRY), undefined);

  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.dropped = true;
  assert.equal(await biometricOn(phone), false);
  assert.equal(store.get(ENTRY), undefined);
});

test('while the phone itself is locked, it stays on, and works again once the phone is unlocked', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.phoneLocked = true;
  assert.equal(await biometricOn(phone), true);
  await assert.rejects(unlockWithBiometric(phone, PROMPT), (e) => e instanceof BiometricError && e.reason === 'failed');
  assert.notEqual(store.get(ENTRY), undefined);
  assert.notEqual(phone.key, null);
  phone.phoneLocked = false;
  assert.equal(await biometricOn(phone), true);
  assert.deepEqual(opened(await unlockWithBiometric(phone, PROMPT)), { space: 0, key: toHex(real) });
});

const UNUSABLE = 'erevos.biometric-unusable';
const unusable = (e: unknown) => e instanceof BiometricError && e.reason === 'unusable';
// As many tries in a row as do not yet turn it off, each saying so in Android's words.
async function almostOff(phone: FakePhone) {
  for (let n = 1; n < UNUSABLE_MOST; n++) await assert.rejects(unlockWithBiometric(phone, PROMPT), unusable);
}

test('a key broken otherwise than dropped turns it off after a few tries in a row, so its button does not fail for ever', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.broken = true;
  // Its state cannot be told, so it stays on, and the first tries change nothing.
  assert.equal(await biometricOn(phone), true);
  await almostOff(phone);
  assert.notEqual(store.get(ENTRY), undefined);
  assert.notEqual(phone.key, null);
  assert.equal(await biometricOn(phone), true);
  // The next one in a row: off, as for a dropped key, and the password opens Erevos.
  assert.equal(await unlockWithBiometric(phone, PROMPT), null);
  assert.equal(store.get(ENTRY), undefined);
  assert.equal(store.has(UNUSABLE), false);
  assert.equal(phone.key, null);
  assert.equal(await biometricOn(phone), false);
  assert.ok(await unlock(await loadLockConfig(), 'real-1111'));
});

test('a Keystore that only misses an answer now and then does not turn it off: the count starts again each time the key is ready', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  // Misses, then a fingerprint that opens: as often as it likes.
  for (let round = 0; round < 3; round++) {
    phone.broken = true;
    await almostOff(phone);
    phone.broken = false;
    assert.deepEqual(opened(await unlockWithBiometric(phone, PROMPT)), { space: 0, key: toHex(real) });
    assert.equal(store.has(UNUSABLE), false);
  }
  // A prompt that showed and was closed says the key was ready as well.
  phone.broken = true;
  await almostOff(phone);
  phone.broken = false;
  phone.closePrompt = true;
  await assert.rejects(unlockWithBiometric(phone, PROMPT), (e) => e instanceof BiometricError && e.reason === 'cancelled');
  phone.closePrompt = false;
  phone.broken = true;
  await almostOff(phone);
  assert.notEqual(store.get(ENTRY), undefined);
  // The phone itself locked says nothing of the key: never counted, and what was counted stays.
  phone.phoneLocked = true;
  for (let n = 0; n < UNUSABLE_MOST * 2; n++) {
    await assert.rejects(unlockWithBiometric(phone, PROMPT), (e) => e instanceof BiometricError && e.reason === 'failed');
  }
  assert.equal(store.get(UNUSABLE), String(UNUSABLE_MOST - 1));
  assert.notEqual(store.get(ENTRY), undefined);
  phone.phoneLocked = false;
  // Turned on anew, it starts from nothing: a new key.
  phone.broken = false;
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  assert.equal(store.has(UNUSABLE), false);
  phone.broken = true;
  await almostOff(phone);
  assert.equal(await biometricOn(phone), true);
  // And turning it off by hand leaves no count behind.
  await turnOffBiometric(phone);
  assert.equal(store.has(UNUSABLE), false);
});

test('closing the prompt changes nothing when unlocking, and leaves it off when turning on', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.closePrompt = true;
  await assert.rejects(unlockWithBiometric(phone, PROMPT), (e) => e instanceof BiometricError && e.reason === 'cancelled');
  phone.closePrompt = false;
  assert.equal(await biometricOn(phone), true);

  phone.closePrompt = true;
  await assert.rejects(turnOnBiometric(phone, 0, 'real-1111', PROMPT), BiometricError);
  phone.closePrompt = false;
  assert.equal(await biometricOn(phone), false);
});

test('a fingerprint leaves the count of wrong passwords as it was', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  await unlock(await loadLockConfig(), 'wrong-1');
  const tries = fails();
  assert.ok(tries > 0);
  assert.equal((await unlockWithBiometric(phone, PROMPT))?.space, 0);
  assert.equal(fails(), tries);
});

test('turning the lock off turns it off too, and it is not offered where the phone cannot', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  await removePasswordLock(0, real);
  assert.equal(await biometricOn(phone), false);
  assert.equal(store.get(ENTRY), undefined);

  await locked();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.available = () => false;
  assert.equal(await biometricOn(phone), false);
  await turnOffBiometric(phone);
  assert.equal(store.get(ENTRY), undefined);
  assert.equal(phone.key, null);
});

test("the password screen's button asks nothing of the Keystore, and is there with the screen", async () => {
  await locked();
  const phone = new FakePhone();
  const config = await loadLockConfig();
  // Off: no button, at first and after it was asked.
  await turnOffBiometric(phone);
  assert.equal(biometricOfferedBefore(), false);
  assert.equal(await biometricOffered(phone, config), false);
  assert.equal(biometricOfferedBefore(), false);

  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  // Turned on: the next password screen has it from its first picture.
  assert.equal(biometricOfferedBefore(), true);
  phone.asked = 0;
  assert.equal(await biometricOffered(phone, config), true);
  assert.equal(await biometricOffered(phone), true);
  assert.equal(phone.asked, 0);

  // A key Android dropped still shows the button: pressing it finds out, turns it off, and the next screen has none.
  phone.dropped = true;
  assert.equal(await biometricOffered(phone, config), true);
  assert.equal(phone.asked, 0);
  assert.notEqual(store.get(ENTRY), undefined);
  assert.equal(await unlockWithBiometric(phone, PROMPT), null);
  assert.equal(biometricOfferedBefore(), false);
  assert.equal(await biometricOffered(phone, config), false);

  // A phone with no fingerprint or face set up any more: no button, and nothing is turned off by looking.
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.bare = true;
  assert.equal(await biometricOffered(phone, config), false);
  assert.equal(biometricOfferedBefore(), false);
  assert.notEqual(store.get(ENTRY), undefined);
  phone.bare = false;
  assert.equal(await biometricOffered(phone, config), true);

  // The lock turned off: no button, whatever is still kept; the setting's own look turns it off.
  await removePasswordLock(0, real);
  assert.equal(await biometricOffered(phone), false);
  assert.equal(await biometricOffered(phone, await loadLockConfig()), false);
  assert.equal(phone.asked, 0);
  assert.equal(await biometricOn(phone), false);
  assert.equal(phone.asked, 1);
  assert.equal(store.get(ENTRY), undefined);
});

test('where the setting shows, the Keystore is asked whether its key still works, and may answer later', async () => {
  await locked();
  const phone = new FakePhone();
  await turnOnBiometric(phone, 0, 'real-1111', PROMPT);
  phone.asked = 0;
  assert.equal(await biometricOn(phone), true);
  assert.equal(phone.asked, 1);
  assert.equal(biometricOfferedBefore(), true);
  phone.dropped = true;
  assert.equal(await biometricOn(phone), false);
  assert.equal(biometricOfferedBefore(), false);
});
