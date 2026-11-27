// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The lock and the spaces, checked the way LPHL FASOULI's config.test.ts checks its own.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { deriveKey, encryptText, fromHex, HARD, hardCost, randomBytes, setHardCost, setPbkdf2, sha256Bytes, toBase64, toHex, webCryptoPbkdf2 } from '../lib/crypto';
import { setCore } from '../lib/core';
import {
  hardenLock,
  isPasswordLocked,
  loadLockConfig,
  lockWithPassword,
  PanicPasswordError,
  preparePanicPassword,
  removePanicPassword,
  removePasswordLock,
  removeSecondPassword,
  SamePasswordError,
  setLockPassword,
  setPanicPassword,
  SLOTS,
  unlock,
} from '../lock/config';
import { lockedSpeedDials, setPhoneOpensLocked } from '../lib/phone-open';
import { PhoneSims } from '../lib/phone-sims';
import { MIN_PIN, openHidden, prepareHidden, removeHiddenPassword, searchHidden, searchOpens, setHiddenPassword } from '../lock/hidden';
import { loadOpenKey, saveOpenKey } from '../lock/keys';
import { changedRelaySettings, EMPTY_SPACE, firstSpaceKey, loadHiddenData, loadSpaceData, NOSTR_DEFAULT, prepareSpaces, relaySettingsOf, saveHiddenData, saveSpaceData, updateSpaceData, watchSpaceData, type SpaceData } from '../lock/space-data';
import { POCKETS } from '../lock/sealed-file';
import { assertNotLockedOut, countedCheck, FREE_TRIES, KEY_TRIES, LockedOutError, recordRightPassword, recordWrongPassword, SEARCH_TRIES, searchFailsLeft, setUptimeForChecks, type Uptime } from '../lock/tries';
import { store } from './secure-memory';
import { useWasmCore } from './wasm-core';

const core = useWasmCore();
// Argon2id at a small cost, so the many unlocks here run quick; its full cost has its own check.
setHardCost({ m: 64, t: 1 });

setPbkdf2(webCryptoPbkdf2()!);
// Every check a couple of hours after the one before, so the wait after wrong passwords never
// gets in the way here; it has its own check below.
let clock = Date.now();
const realNow = Date.now;
Date.now = () => (clock += 2 * 3600_000);

const shape = () => (store.get('erevos.lock') ?? '').replace(/"[^"]{16,}"/g, '"…"');
const opened = async (password: string) => {
  const r = await unlock(await loadLockConfig(), password);
  return r && { space: r.space, key: toHex(r.key) };
};
const real = randomBytes(32);
const decoy = randomBytes(32);

const t = (name: string, fn: () => Promise<void>) => test(name, async () => { store.clear(); await fn(); });

// A slot as Erevos sealed it before Argon2id: SHA-256 of PBKDF2's key as its check, and the key
// sealed with that alone. Without a password, an unused one.
const oldSlot = async (password: string | null, key = randomBytes(32)) => {
  const salt = randomBytes(16);
  const k = password === null ? randomBytes(32) : await deriveKey(password, salt, 200_000);
  return { salt: toBase64(salt), iter: 200_000, check: toBase64(password === null ? randomBytes(32) : sha256Bytes(k)), key: encryptText(k, toHex(key)) };
};

// How many times Argon2id runs in `fn`, or -1 without the core: `fn` runs either way, as what else
// it does is counted too.
const hardCalls = async (fn: () => Promise<unknown>) => {
  if (!core) {
    await fn();
    return -1;
  }
  let calls = 0;
  setCore({ ...core, hardKey: (...args) => { calls++; return core.hardKey!(...args); } });
  try {
    await fn();
  } finally {
    setCore(core);
  }
  return calls;
};

t('opens the real space or the second one, each with its key', async () => {
  assert.equal(await opened('x'), null);
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  assert.deepEqual(await opened('real-1111'), { space: 0, key: toHex(real) });
  assert.deepEqual(await opened('decoy-2222'), { space: 1, key: toHex(decoy) });
  assert.equal(await opened('nope'), null);
  const stored = [...store.values()].join();
  assert.doesNotMatch(stored, /1111|2222/);
  assert.ok(!stored.includes(toHex(real)));
});

t('stores the same, and takes the same work, with or without a second password', async () => {
  await setLockPassword(0, 'real-1111', real);
  const without = shape();
  await setLockPassword(1, 'decoy-2222', decoy);
  assert.equal(shape(), without);
  assert.equal((await loadLockConfig()).slots.length, SLOTS);
  const subtle = globalThis.crypto.subtle as { deriveBits: SubtleCrypto['deriveBits'] };
  const { deriveBits } = subtle;
  let derivations = 0;
  subtle.deriveBits = (...args) => { derivations++; return deriveBits.apply(globalThis.crypto.subtle, args); };
  try {
    const c = await loadLockConfig();
    for (const password of ['real-1111', 'decoy-2222', 'wrong']) {
      derivations = 0;
      const hard = await hardCalls(() => unlock(c, password));
      // Every slot, and the panic password's entry, set or not.
      assert.equal(derivations, SLOTS + 1, password);
      if (core) assert.equal(hard, SLOTS + 1, password);
    }
  } finally {
    subtle.deriveBits = deriveBits;
  }
});

t('a lock from before Argon2id gets it in every slot at once, and opens with the same passwords', async () => {
  const slots = [await oldSlot('real-1111', real), await oldSlot('decoy-2222', decoy), await oldSlot(null), await oldSlot(null)];
  store.set('erevos.lock', JSON.stringify({ slots, direct: null, iter: 200_000 }));
  // As it is, it opens as before.
  assert.deepEqual(await opened('real-1111'), { space: 0, key: toHex(real) });
  await hardenLock();
  const c = await loadLockConfig();
  assert.ok(c.slots.every((slot, i) => slot.hard?.m === hardCost().m && slot.hard.t === hardCost().t && slot.check !== slots[i].check), 'every slot, used or not');
  assert.deepEqual(await opened('real-1111'), { space: 0, key: toHex(real) });
  assert.deepEqual(await opened('decoy-2222'), { space: 1, key: toHex(decoy) });
  assert.equal(await opened('wrong'), null);
  // Done once: nothing changes the second time.
  const after = store.get('erevos.lock');
  if (core) assert.equal(await hardCalls(() => hardenLock()), 0);
  assert.equal(store.get('erevos.lock'), after);
  // It looks as a lock sealed today does, with or without the second password.
  const hardened = shape();
  store.clear();
  await setLockPassword(0, 'real-1111', real);
  assert.equal(shape(), hardened);
});

t('passwords are sealed with Argon2id at its full cost', async () => {
  setHardCost(null);
  try {
    await setLockPassword(0, 'real-1111', real);
    assert.ok((await loadLockConfig()).slots.every((slot) => slot.hard?.m === 32 * 1024 && slot.hard.t === 3 && HARD.m === 32 * 1024));
    assert.deepEqual(await opened('real-1111'), { space: 0, key: toHex(real) });
    assert.equal(await opened('wrong'), null);
  } finally {
    setHardCost({ m: 64, t: 1 });
  }
});

t('what changes the lock waits for every slot to get Argon2id, and leaves none without it', async () => {
  store.set('erevos.lock', JSON.stringify({ slots: [await oldSlot('real-1111', real), await oldSlot(null), await oldSlot(null), await oldSlot(null)], direct: null, iter: 200_000 }));
  await setLockPassword(1, 'decoy-2222', decoy);
  assert.ok((await loadLockConfig()).slots.every((slot) => slot.hard));
  assert.deepEqual(await opened('real-1111'), { space: 0, key: toHex(real) });
  assert.deepEqual(await opened('decoy-2222'), { space: 1, key: toHex(decoy) });
});

t('hidden chats from before Argon2id get it in every place of every space, and open with the same PIN', async () => {
  await setLockPassword(0, 'real-1111', real);
  const key = randomBytes(32);
  const before = await Promise.all(Array.from({ length: SLOTS }, (_, space) => oldSlot(space === 0 ? 'pin-1111' : null, key)));
  store.set('erevos.hidden-lock.1', JSON.stringify(before));
  for (const name of ['erevos.hidden-lock', 'erevos.hidden-lock.2', 'erevos.hidden-lock.3']) {
    store.set(name, JSON.stringify(await Promise.all(Array.from({ length: SLOTS }, () => oldSlot(null)))));
  }
  assert.deepEqual(await searchHidden(0, 'pin-1111'), { key, pocket: 1 });
  assert.equal(await searchHidden(1, 'pin-1111'), null);
  for (const name of ['erevos.hidden-lock', 'erevos.hidden-lock.1', 'erevos.hidden-lock.2', 'erevos.hidden-lock.3']) {
    const values = JSON.parse(store.get(name)!) as { hard?: { m: number } }[];
    assert.ok(values.length >= SLOTS && values.every((value) => value.hard?.m === hardCost().m), name);
  }
  assert.deepEqual(await openHidden(0, 'pin-1111'), { key, pocket: 1 });
});

t('refuses a password another space already uses', async () => {
  await setLockPassword(0, 'same', real);
  await assert.rejects(setLockPassword(1, 'same', decoy), SamePasswordError);
  await setLockPassword(1, 'other', decoy);
  await assert.rejects(setLockPassword(0, 'other', real), SamePasswordError);
  await setLockPassword(0, 'same', real);
});

t('lets the second space set a second password of its own', async () => {
  const third = randomBytes(32);
  await setLockPassword(0, 'a1', real);
  await setLockPassword(1, 'b2', decoy);
  await setLockPassword(2, 'c3', third);
  assert.deepEqual(await opened('c3'), { space: 2, key: toHex(third) });
});

t('removes the second password (and any set beyond it) or the whole lock', async () => {
  await setLockPassword(0, 'a1', real);
  await setLockPassword(1, 'b2', decoy);
  await setLockPassword(2, 'c3', randomBytes(32));
  await removeSecondPassword(0, real);
  assert.equal(await opened('b2'), null);
  assert.equal(await opened('c3'), null);
  assert.equal((await opened('a1'))?.space, 0);
  assert.equal((await loadLockConfig()).slots.length, SLOTS);
  await removePasswordLock(0, real);
  const c = await loadLockConfig();
  assert.equal(isPasswordLocked(c), false);
  assert.deepEqual(c.slots, []);
  assert.deepEqual(await loadOpenKey(0), real);
});

t('a password that stops opening its space takes that space\'s speed dial with Erevos locked away, and leaves the open space\'s', async () => {
  const third = randomBytes(32);
  const feeds = async (space: number, key: Uint8Array, number: string) => {
    const sims = await PhoneSims.open(space, key);
    await sims.setSpeed('2', number, '');
    await sims.setFeedsLocked(true);
  };
  const called = async () => (await lockedSpeedDials())?.keys.map((k) => k.number) ?? null;
  await setLockPassword(0, 'a1', real);
  await setLockPassword(1, 'b2', decoy);
  await setLockPassword(2, 'c3', third);
  await setPhoneOpensLocked(true);

  // Kept by a space the password opened: gone with it, from the space before, whichever of them it was.
  await feeds(2, third, '6933333333');
  assert.deepEqual(await called(), ['6933333333']);
  await removeSecondPassword(0, real);
  assert.equal(await called(), null);
  assert.equal(store.has('erevos.phone-speed'), false);

  // Kept by the open space: it stays, as this space can still take it away.
  await setLockPassword(1, 'b2', decoy);
  await feeds(0, real, '6911111111');
  await removeSecondPassword(0, real);
  assert.deepEqual(await called(), ['6911111111']);

  // Kept by a space before the open one: nothing says whose it is, so it goes too, to be turned on there again.
  await setLockPassword(1, 'b2', decoy);
  await removeSecondPassword(1, decoy);
  assert.equal(await called(), null);
  assert.equal(await (await PhoneSims.open(0, real)).feedsLocked(), false);

  // With the lock off nothing opens locked: the copy goes, the open space's own too.
  await feeds(0, real, '6911111111');
  assert.deepEqual(await called(), ['6911111111']);
  await removePasswordLock(0, real);
  assert.equal(store.has('erevos.phone-speed'), false);
});

t('turned off in the second space, opens that space and keeps the real one locked', async () => {
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  await removePasswordLock(1, decoy);
  let c = await loadLockConfig();
  assert.equal(c.direct, 1);
  assert.equal(isPasswordLocked(c), false);
  assert.deepEqual(await loadOpenKey(1), decoy);
  assert.notDeepEqual(await loadOpenKey(0), real);

  assert.equal(await lockWithPassword(1, 'new-3333', decoy), null);
  c = await loadLockConfig();
  assert.equal(isPasswordLocked(c), true);
  assert.notDeepEqual(await loadOpenKey(1), decoy);
  assert.deepEqual(await opened('new-3333'), { space: 1, key: toHex(decoy) });
  assert.equal(await opened('decoy-2222'), null);

  await removePasswordLock(1, decoy);
  const back = await lockWithPassword(1, 'real-1111', decoy);
  assert.deepEqual(back && { space: back.space, key: toHex(back.key) }, { space: 0, key: toHex(real) });
  c = await loadLockConfig();
  assert.equal(isPasswordLocked(c), true);
  assert.deepEqual(await opened('new-3333'), { space: 1, key: toHex(decoy) });
});

t('first turns the lock on from the real space, moving its key out of the keystore', async () => {
  await saveOpenKey(0, real);
  assert.equal(await lockWithPassword(0, 'real-1111', real), null);
  assert.equal((await loadLockConfig()).slots.length, SLOTS);
  assert.deepEqual(await opened('real-1111'), { space: 0, key: toHex(real) });
  assert.notDeepEqual(await loadOpenKey(0), real);
});

t('seals every slot with the same iteration count', async () => {
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  const c = await loadLockConfig();
  assert.equal(c.iter, 200_000);
  assert.deepEqual(c.slots.map((s) => s.iter), Array(SLOTS).fill(200_000));
});

t('makes wrong passwords wait, longer each time, and a right one ends the wait', async () => {
  await setLockPassword(0, 'real-1111', real);
  // Setting a password that opens no space counted as a miss too (it is compared with every slot).
  store.delete('erevos.lock-tries');
  const c = await loadLockConfig();
  const now = realNow();
  for (let i = 0; i < FREE_TRIES - 1; i++) assert.equal(await unlock(c, 'wrong', now), null);
  assert.equal(await unlock(c, 'wrong', now), null);
  await assert.rejects(unlock(c, 'real-1111', now + 1000), LockedOutError);
  assert.equal(await unlock(c, 'wrong', now + 31_000), null);
  await assert.rejects(unlock(c, 'real-1111', now + 31_000 + 59_000), LockedOutError);
  assert.equal((await unlock(c, 'real-1111', now + 31_000 + 61_000))?.space, 0);
  assert.equal(await unlock(c, 'wrong', now + 31_000 + 62_000), null);
  // The count started over, so this one is free again.
  assert.equal((await unlock(c, 'real-1111', now + 31_000 + 63_000))?.space, 0);
});

t('the panic password wipes from the lock screen, opens nothing, and its entry looks the same set or not', async () => {
  await preparePanicPassword();
  const shapeOf = () => (store.get('erevos.lock-panic') ?? '').replace(/"[^"]{16,}"/g, '"…"');
  const unset = shapeOf();
  assert.ok(unset.length > 0, 'there from the first start');
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  // It must open no space.
  await assert.rejects(setPanicPassword('real-1111'), SamePasswordError);
  await assert.rejects(setPanicPassword('decoy-2222'), SamePasswordError);
  await setPanicPassword('panic-9999');
  assert.equal(shapeOf(), unset, 'set, it is shaped as when it was not');
  const c = await loadLockConfig();
  await assert.rejects(unlock(c, 'panic-9999'), PanicPasswordError);
  assert.equal((await unlock(c, 'real-1111'))?.space, 0);
  assert.equal((await unlock(c, 'decoy-2222'))?.space, 1);
  assert.equal(await unlock(c, 'wrong-0000'), null);
  // No space's password may become it.
  await assert.rejects(setLockPassword(0, 'panic-9999', real), SamePasswordError);
  await assert.rejects(setLockPassword(1, 'panic-9999', decoy), SamePasswordError);
  // Turned off, it is only a wrong password.
  await removePanicPassword();
  assert.equal(shapeOf(), unset);
  assert.equal(await unlock(c, 'panic-9999'), null);
  // Turning the lock off takes it along, so a lock set again later has none waiting.
  await setPanicPassword('panic-9999');
  await removePasswordLock(0, real);
  await setLockPassword(0, 'real-1111', real);
  assert.equal(await unlock(await loadLockConfig(), 'panic-9999'), null);
});

t('wrong passwords tried all at once each count: one check at a time, counted before it runs', async () => {
  await recordRightPassword();
  const now = realNow();
  let running = 0;
  let most = 0;
  const slowWrong = async () => {
    running++;
    most = Math.max(most, running);
    await new Promise((done) => setTimeout(done, 5));
    running--;
    return false;
  };
  const results = await Promise.allSettled(Array.from({ length: 50 }, () => countedCheck(KEY_TRIES, now, slowWrong, (right) => right)));
  // Never two at once, and once the free tries are spent every further one waits instead.
  assert.equal(most, 1);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, FREE_TRIES);
  assert.ok(results.slice(FREE_TRIES).every((r) => r.status === 'rejected' && r.reason instanceof LockedOutError));
  // A check cut short still counted: the count was taken before it ran.
  await recordRightPassword();
  await assert.rejects(countedCheck(KEY_TRIES, now, async () => { throw new Error('closed'); }, () => true), /closed/);
  for (let i = 1; i < FREE_TRIES; i++) await countedCheck(KEY_TRIES, now, async () => false, (right) => right);
  await assert.rejects(assertNotLockedOut(now), LockedOutError);
  // A right one ends the count.
  await recordRightPassword();
  assert.equal(await countedCheck(KEY_TRIES, now, async () => true, (right) => right), true);
  await assertNotLockedOut(now);
});

t('the wait for wrong passwords goes by the clock the owner cannot set, and a new start of the phone starts it again', async () => {
  let clock: Uptime = { up: 1_000_000, boot: 'count:7' };
  setUptimeForChecks(() => clock);
  try {
    const now = realNow();
    for (let i = 0; i < FREE_TRIES; i++) await recordWrongPassword(now);
    await assert.rejects(assertNotLockedOut(now), LockedOutError);
    // The date and time moved a day forward: the wait goes on, as the phone's own clock has not moved.
    await assert.rejects(assertNotLockedOut(now + 24 * 3600_000), LockedOutError);
    // And moved back: no longer either.
    clock = { up: 1_000_000 + 29_000, boot: 'count:7' };
    await assert.rejects(assertNotLockedOut(now - 3600_000), (e: LockedOutError) => e.until === now - 3600_000 + 1000);
    // Once 30 s really passed, the check runs, whatever the date says.
    clock = { up: 1_000_000 + 30_000, boot: 'count:7' };
    await assertNotLockedOut(now - 3600_000);
    // Over, and kept so: starting the phone again does not start it again.
    clock = { up: 5_000, boot: 'count:8' };
    await assertNotLockedOut(now);
    // The next wrong one waits a minute; the phone starts again 10 s in, with the clock moved two hours forward.
    await recordWrongPassword(now);
    clock = { up: 15_000, boot: 'count:8' };
    await assert.rejects(assertNotLockedOut(now + 10_000), LockedOutError);
    clock = { up: 2_000, boot: 'count:9' };
    // How much passed cannot be known: the whole minute again, from here.
    await assert.rejects(assertNotLockedOut(now + 2 * 3600_000), (e: LockedOutError) => e.until === now + 2 * 3600_000 + 60_000);
    clock = { up: 2_000 + 59_000, boot: 'count:9' };
    await assert.rejects(assertNotLockedOut(now + 2 * 3600_000), LockedOutError);
    clock = { up: 2_000 + 60_000, boot: 'count:9' };
    await assertNotLockedOut(now);
    // A clock that went back on the same start is a new start too.
    await recordWrongPassword(now);
    clock = { up: 1_000, boot: 'count:9' };
    await assert.rejects(assertNotLockedOut(now), (e: LockedOutError) => e.until === now + 120_000);
    // A right password ends the count.
    await recordRightPassword();
    await assertNotLockedOut(now);
    assert.deepEqual(JSON.parse(store.get('erevos.lock-tries') ?? ''), { fails: 0, until: 0, wait: 0, up: 0, boot: '' });
  } finally {
    setUptimeForChecks(null);
  }
});

t('a wait kept by a build before the clock is measured again from its beginning on it', async () => {
  const now = realNow();
  store.set('erevos.lock-tries', JSON.stringify({ fails: FREE_TRIES + 1, until: now + 5_000 }));
  setUptimeForChecks(() => ({ up: 100, boot: 'count:1' }));
  try {
    await assert.rejects(assertNotLockedOut(now + 10_000), (e: LockedOutError) => e.until === now + 10_000 + 60_000);
  } finally {
    setUptimeForChecks(null);
  }
  // With no clock of the phone's own, the date and time, as before.
  store.set('erevos.lock-tries', JSON.stringify({ fails: FREE_TRIES + 1, until: now + 5_000 }));
  await assert.rejects(assertNotLockedOut(now), LockedOutError);
  await assertNotLockedOut(now + 5_000);
});

t('a first start moves the chat settings kept before spaces into the first space, sealed', async () => {
  const older = { url: 'ws://172.22.140.150:7879', token: 't0ken', ownQueue: { recipientHex: 'a'.repeat(48), senderHex: 'b'.repeat(48) }, routes: { 'relay:x': 'c'.repeat(48) } };
  store.set('erevos.relay', JSON.stringify(older));
  const key = await firstSpaceKey();
  assert.equal(store.has('erevos.relay'), false);
  assert.deepEqual(await loadSpaceData(0, key), { ...older, via: '', viaToken: '', look: null, tor: 'off', bridges: { use: 'none', own: '', watched: false, learned: {} }, spare: { url: '', token: '', queue: null }, pairHome: false, push: false, pushLeft: false, pushScope: '', previews: false, lend: { relay: '', ticket: '' }, offered: { relay: '', code: '', until: 0, from: '' }, ringQueue: null, ownToken: { relay: '', hash: '' }, nostr: NOSTR_DEFAULT, relayKeys: {}, stopped: 0, sign: false, lastSeen: true, tellOpen: true, publicImages: 'always', publicCards: true, direct: true });
  assert.ok(!store.get('erevos.space.0')!.includes('t0ken'));
  // The next start finds the same key.
  assert.deepEqual(await firstSpaceKey(), key);
});

t('a space keeps which token it got as its own from which relay, and nothing of another shape', async () => {
  const key = await firstSpaceKey();
  const own = { relay: 'wss://relay.example.org', hash: 'ab'.repeat(32) };
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url: own.relay, token: 'mine', ownToken: own });
  assert.deepEqual((await loadSpaceData(0, key)).ownToken, own);
  await saveSpaceData(0, key, { ...EMPTY_SPACE, ownToken: { relay: own.relay, hash: 'mine' } });
  assert.deepEqual((await loadSpaceData(0, key)).ownToken, { relay: '', hash: '' });
  // One that is a free place its relay gave by itself (lib/open-place.ts) says so, and only with `true`.
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url: own.relay, token: 'mine', ownToken: { ...own, open: true } });
  assert.deepEqual((await loadSpaceData(0, key)).ownToken, { ...own, open: true });
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url: own.relay, token: 'mine', ownToken: { ...own, open: 'yes' } as never });
  assert.deepEqual((await loadSpaceData(0, key)).ownToken, own);
  // The keys its relays proved (lib/relay.ts, pinRelay): whole ones only, and only for the relays it uses.
  const proven = 'ab'.repeat(32);
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url: 'wss://Relay.example.org/', relayKeys: { 'wss://relay.example.org': proven, 'wss://other.example.org': proven } });
  assert.deepEqual((await loadSpaceData(0, key)).relayKeys, { 'wss://relay.example.org': proven });
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url: 'wss://relay.example.org', relayKeys: { 'wss://relay.example.org': 'ab' } });
  assert.deepEqual((await loadSpaceData(0, key)).relayKeys, {});
  await saveSpaceData(0, key, EMPTY_SPACE);
});

t('a chat follows what another screen writes to its relay settings, and writes back only what it changed', async () => {
  const key = await firstSpaceKey();
  const queue = { recipientHex: 'a'.repeat(48), senderHex: 'b'.repeat(48) };
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url: 'wss://relay.example.org', token: 'before', ownQueue: queue });
  // A chat opened before the sign-in: what it read then.
  const older = relaySettingsOf(await loadSpaceData(0, key));
  const heard: SpaceData[] = [];
  const stop = watchSpaceData(0, key, (data) => heard.push(data));
  const elsewhere = watchSpaceData(0, randomBytes(32), () => assert.fail('told what was written with another key'));
  // A sign-in on another screen of it: the token, kept at once.
  await updateSpaceData(0, key, { token: 'signed-in', ownToken: { relay: 'wss://relay.example.org', hash: 'ab'.repeat(32) } });
  assert.equal(heard.length, 1);
  assert.equal(heard[0].token, 'signed-in');
  assert.deepEqual(changedRelaySettings(older, relaySettingsOf(heard[0])), { token: 'signed-in' });
  // The chat from before changes only its queue: the token it never changed is not written back.
  const moved = { recipientHex: 'c'.repeat(48), senderHex: 'd'.repeat(48) };
  const patch = changedRelaySettings(older, { ...older, ownQueue: moved });
  assert.deepEqual(patch, { ownQueue: moved });
  await updateSpaceData(0, key, patch);
  const now = await loadSpaceData(0, key);
  assert.equal(now.token, 'signed-in');
  assert.deepEqual(now.ownQueue, moved);
  assert.equal(heard.length, 2);
  // A queue alike is no change; nothing told once stopped.
  assert.deepEqual(changedRelaySettings(relaySettingsOf(now), { ...relaySettingsOf(now), ownQueue: { ...moved } }), {});
  stop();
  elsewhere();
  await updateSpaceData(0, key, { token: 'later' });
  assert.equal(heard.length, 2);
});

t('each space sees only its own data, and every entry looks alike', async () => {
  const key0 = await firstSpaceKey();
  await saveSpaceData(0, key0, { ...EMPTY_SPACE, url: 'wss://relay.example.org', token: 'secret' });
  await lockWithPassword(0, 'real-1111', key0);
  await prepareSpaces(1);
  const sizes = () => [0, 1, 2, 3].map((i) => store.get(`erevos.space.${i}`)?.length);
  const before = sizes();
  assert.ok(before.every((n) => n === before[0]), `entries differ: ${before}`);
  // A second password: a new, empty space with its own key.
  const key1 = randomBytes(32);
  await setLockPassword(1, 'decoy-2222', key1);
  await saveSpaceData(1, key1, EMPTY_SPACE);
  await prepareSpaces(2);
  assert.deepEqual(sizes(), before);
  const one = await opened('decoy-2222');
  assert.deepEqual(await loadSpaceData(1, randomBytes(32)), EMPTY_SPACE);
  assert.deepEqual(await loadSpaceData(1, fromHex(one!.key)), EMPTY_SPACE);
  const zero = await opened('real-1111');
  assert.equal((await loadSpaceData(0, fromHex(zero!.key))).token, 'secret');
  // The second space's key does not open the first one.
  assert.equal((await loadSpaceData(0, key1)).token, '');
  // The keystore entries are the same set as before the second password.
  assert.deepEqual([...store.keys()].sort(), ['erevos.lock', 'erevos.lock-panic', 'erevos.lock-tries', 'erevos.space-keys', 'erevos.space.0', 'erevos.space.1', 'erevos.space.2', 'erevos.space.3']);
});

const opens = async (space: number, password: string) => (await openHidden(space, password))?.key ?? null;

t('hidden chats open only with their own password, in each space', async () => {
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  await prepareHidden();
  assert.equal(await openHidden(0, 'secret-0'), null);
  const hidden0 = await setHiddenPassword(0, 0, 'secret-0', null);
  const hidden1 = await setHiddenPassword(1, 0, 'secret-1', null);
  assert.deepEqual(await opens(0, 'secret-0'), hidden0);
  assert.deepEqual(await opens(1, 'secret-1'), hidden1);
  // Each space's hidden chats open only there.
  assert.equal(await openHidden(1, 'secret-0'), null);
  assert.equal(await openHidden(0, 'secret-1'), null);
  await saveHiddenData(0, 0, hidden0, { ...EMPTY_SPACE, url: 'wss://hidden.example.org' });
  assert.equal((await loadHiddenData(0, 0, hidden0)).url, 'wss://hidden.example.org');
  assert.equal((await loadSpaceData(0, real)).url, '');
});

t('every place of hidden chats has its own PIN and its own data', async () => {
  await setLockPassword(0, 'real-1111', real);
  await prepareHidden();
  const keys = [];
  for (let pocket = 0; pocket < POCKETS; pocket++) {
    const key = await setHiddenPassword(0, pocket, `pin-${pocket}`, null);
    await saveHiddenData(0, pocket, key, { ...EMPTY_SPACE, token: `place ${pocket}` });
    keys.push(key);
  }
  for (let pocket = 0; pocket < POCKETS; pocket++) {
    const place = await openHidden(0, `pin-${pocket}`);
    assert.equal(place?.pocket, pocket);
    assert.deepEqual(place?.key, keys[pocket]);
    assert.equal((await loadHiddenData(0, pocket, keys[pocket])).token, `place ${pocket}`);
    // Another place's key opens nothing of this one.
    assert.equal((await loadHiddenData(0, pocket, keys[(pocket + 1) % POCKETS])).token, '');
  }
  // A PIN that opens one place is refused for another, and for the space itself.
  await assert.rejects(setHiddenPassword(0, 1, 'pin-0', null), SamePasswordError);
  await assert.rejects(setHiddenPassword(0, 1, 'real-1111', null), SamePasswordError);
  // Removing one place leaves the others.
  await removeHiddenPassword(0, 2);
  assert.equal(await openHidden(0, 'pin-2'), null);
  assert.equal((await openHidden(0, 'pin-3'))?.pocket, 3);
});

t('hidden chats look the same, set or not, and take the same work to try', async () => {
  await setLockPassword(0, 'real-1111', real);
  await prepareHidden();
  const before = new Map(store);
  await setHiddenPassword(0, 2, 'secret-0', null);
  assert.deepEqual([...store.keys()].sort(), [...before.keys()].sort());
  for (const name of ['erevos.hidden-lock', 'erevos.hidden-lock.2', 'erevos.hidden.0', 'erevos.hidden2.0']) {
    assert.equal(store.get(name)!.length, before.get(name)!.length, name);
  }
  const subtle = globalThis.crypto.subtle as { deriveBits: SubtleCrypto['deriveBits'] };
  const { deriveBits } = subtle;
  let derivations = 0;
  subtle.deriveBits = (...args) => {
    derivations++;
    return deriveBits.apply(globalThis.crypto.subtle, args);
  };
  try {
    // Every place is tried, whichever opens.
    for (const [space, password] of [[0, 'secret-0'], [0, 'wrong'], [2, 'wrong']] as const) {
      derivations = 0;
      const hard = await hardCalls(() => openHidden(space, password));
      assert.equal(derivations, POCKETS, `${space} ${password}`);
      if (core) assert.equal(hard, POCKETS, `${space} ${password}`);
    }
  } finally {
    subtle.deriveBits = deriveBits;
  }
});

t('a new hidden password starts empty, changing it keeps them, removing it closes them', async () => {
  await prepareHidden();
  const first = await setHiddenPassword(0, 1, 'secret-0', null);
  await saveHiddenData(0, 1, first, { ...EMPTY_SPACE, token: 'kept' });
  // Changed from inside: same key, same chats.
  assert.deepEqual(await setHiddenPassword(0, 1, 'secret-new', first), first);
  assert.equal(await openHidden(0, 'secret-0'), null);
  assert.equal((await loadHiddenData(0, 1, (await opens(0, 'secret-new'))!)).token, 'kept');
  // Set anew from the settings: a new, empty set of hidden chats.
  const second = await setHiddenPassword(0, 1, 'secret-0', null);
  assert.notDeepEqual(second, first);
  assert.equal((await loadHiddenData(0, 1, second)).token, '');
  assert.equal(await openHidden(0, 'secret-new'), null);
  await removeHiddenPassword(0, 1);
  assert.equal(await openHidden(0, 'secret-0'), null);
});

t('refuses the space\'s own password for its hidden chats', async () => {
  await setLockPassword(0, 'real-1111', real);
  await assert.rejects(setHiddenPassword(0, 0, 'real-1111', null), SamePasswordError);
  await setHiddenPassword(0, 0, 'other', null);
});

t('hidden chats open from a search with their PIN, and a wrong one is only a search', async () => {
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  await prepareHidden();
  const key = await setHiddenPassword(0, 3, 'pin-0', null);
  assert.deepEqual(await searchHidden(0, 'pin-0'), { key, pocket: 3 });
  assert.equal(await searchHidden(1, 'pin-0'), null);
  // Short searches are never tried.
  assert.equal(await searchHidden(0, 'pin-0'.slice(0, MIN_PIN - 1)), null);
  // Wrong searches count apart from the lock screen's tries: it never waits for them.
  const now = Date.now();
  for (let i = 0; i < FREE_TRIES + 1; i++) assert.equal(await searchHidden(0, `search ${i}`, now), null);
  await assertNotLockedOut(now);
  await assert.rejects(assertNotLockedOut(now, SEARCH_TRIES), LockedOutError);
  // While searches wait, even the right PIN opens nothing, and says nothing.
  assert.equal(await searchHidden(0, 'pin-0', now + 1), null);
  assert.deepEqual((await searchHidden(0, 'pin-0', now + 7 * 24 * 3600_000))?.key, key);
});

t('wrong searches are let go of a quarter of an hour at a time, and never make a search wait more than five minutes', async () => {
  await setLockPassword(0, 'real-1111', real);
  await prepareHidden();
  const key = await setHiddenPassword(0, 3, 'pin-0', null);
  const now = Date.now();
  // Four that found nothing, then a quarter of an hour: the count is under the free ones again, one
  // more each further quarter.
  for (let i = 0; i < FREE_TRIES - 1; i++) assert.equal(await searchHidden(0, `search ${i}`, now + i), null);
  const later = now + 31 * 60_000;
  // Two quarters: two under the free ones, so one more search is free, and the PIN after it opens.
  assert.equal(await searchHidden(0, 'again', later), null);
  await assertNotLockedOut(later + FREE_TRIES, SEARCH_TRIES);
  assert.deepEqual((await searchHidden(0, 'pin-0', later + FREE_TRIES + 1))?.key, key);
  // Many in a row: the wait grows, to five minutes at most, then a quarter of an hour lets a search try again.
  const at = later + 60_000;
  for (let i = 0; i < 20; i++) assert.equal(await searchHidden(0, `more ${i}`, at + i), null);
  await assert.rejects(assertNotLockedOut(at + 20, SEARCH_TRIES), (e: LockedOutError) => e.until <= at + 19 + 5 * 60_000);
  assert.deepEqual((await searchHidden(0, 'pin-0', at + 20 + 16 * 60_000))?.key, key);
});

t('guessing by searching stays at about one try a quarter of an hour, and moving the date lets nothing go', async () => {
  await setLockPassword(0, 'real-1111', real);
  await prepareHidden();
  let up = 0;
  setUptimeForChecks(() => ({ up, boot: 'boot-1' }));
  try {
    const now = Date.now();
    for (let i = 0; i < FREE_TRIES - 1; i++) await recordWrongPassword(now, SEARCH_TRIES);
    // The date sixteen minutes on, the phone's own clock not: the next is the fifth, and waits.
    assert.ok((await recordWrongPassword(now + 16 * 60_000, SEARCH_TRIES)) > 0);
    // A quarter of an hour on the phone's own clock: the wait is over, and the count is down only
    // to under the free ones, so one more try is made and brings a wait again.
    up += 16 * 60_000;
    await assertNotLockedOut(now, SEARCH_TRIES);
    assert.ok((await recordWrongPassword(now, SEARCH_TRIES)) > 0);
    // A new start of the phone: how long passed is not known, so nothing is let go of.
    setUptimeForChecks(() => ({ up: 20 * 60_000, boot: 'boot-2' }));
    assert.ok((await recordWrongPassword(now, SEARCH_TRIES)) > 0);
  } finally {
    setUptimeForChecks(null);
  }
});

test('a search\'s wrong tries let go of: under the free ones after a quarter of an hour, one more each further one', () => {
  assert.equal(searchFailsLeft(9, 14 * 60_000), 9);
  assert.equal(searchFailsLeft(9, 15 * 60_000), FREE_TRIES - 1);
  assert.equal(searchFailsLeft(2, 15 * 60_000), 2);
  assert.equal(searchFailsLeft(9, 30 * 60_000), FREE_TRIES - 2);
  assert.equal(searchFailsLeft(9, 24 * 3600_000), 0);
});

t('another space opens from a search with its password; the open one\'s own, or the panic password, is only a search', async () => {
  await setLockPassword(0, 'real-1111', real);
  await setLockPassword(1, 'decoy-2222', decoy);
  await prepareHidden();
  const key = await setHiddenPassword(0, 2, 'pin-0', null);
  await setPanicPassword('panic-9999');
  const hex = (found: Awaited<ReturnType<typeof searchOpens>>) => (found && 'space' in found ? { space: found.space.space, key: toHex(found.space.key) } : found);
  assert.deepEqual(hex(await searchOpens(0, 'decoy-2222')), { space: 1, key: toHex(decoy) });
  assert.deepEqual(hex(await searchOpens(1, 'real-1111')), { space: 0, key: toHex(real) });
  assert.deepEqual(await searchOpens(0, 'pin-0'), { place: { key, pocket: 2 } });
  // With Erevos's own chats off, hidden chats open nowhere, but the spaces still do.
  assert.equal(await searchOpens(0, 'pin-0', false), null);
  assert.deepEqual(hex(await searchOpens(0, 'decoy-2222', false)), { space: 1, key: toHex(decoy) });
  // The open space's own password and the panic password open nothing here, and erase nothing.
  assert.equal(await searchOpens(0, 'real-1111'), null);
  assert.equal(await searchOpens(0, 'panic-9999'), null);
  assert.ok((await loadLockConfig()).slots.length >= 2);
  assert.deepEqual(hex(await searchOpens(0, 'decoy-2222')), { space: 1, key: toHex(decoy) });
  // The open space's own password counts as wrong: typing it cannot end the count of wrong ones.
  const now = Date.now();
  for (let i = 0; i < FREE_TRIES + 1; i++) assert.equal(await searchOpens(0, i % 2 ? 'real-1111' : `search ${i}`, true, now), null);
  await assert.rejects(assertNotLockedOut(now, SEARCH_TRIES), LockedOutError);
  assert.equal(await searchOpens(0, 'decoy-2222', true, now + 1), null);
  await assertNotLockedOut(now);
});

test('last seen is off in a space made now (one from before keeps it, as above)', () => {
  assert.equal(EMPTY_SPACE.lastSeen, false);
  assert.equal(EMPTY_SPACE.tellOpen, true);
});
