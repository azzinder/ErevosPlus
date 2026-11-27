// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Hidden chats that receive while they are closed (lock/hidden-keep.ts, lib/place-receiver.ts):
// every space keeps four keys, sealed with its own, the real one only where a place's switch is on,
// so its entry looks the same whatever hidden chats it has; a new place starts with the switch on.
// While the space is open, through a real relay and the real core, what comes to such a place is
// kept in its history and its sender told it came, nothing is taken while its chat screen holds
// it, a call rings with no name and waits for the PIN, and one ended or too old is kept as missed,
// as is one that rings as INVISIBLE is chosen, saying why.
// Switched off, nothing reads it any more. A place's groups are its own (lib/place-groups.ts): made
// with its contacts, they go through its relay to a queue of its own, are read while it is closed,
// and are kept apart from the space's. Linked on their own to a phone's (lib/devices.ts), they sync
// while they receive closed, as their links open with their chats, and not at all while closed
// without it: what the phone passes on waits on the relay. The relay part is skipped, with a note,
// when the core or the relay is not built.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { OFFER_FRESH_MS } from '../lib/call';
import type { CallSignal } from '../lib/call-signal';
import { CALL_LINE } from '../lib/calls';
import { setCore, type Core } from '../lib/core';
import { randomBytes } from '../lib/crypto';
import { Links, placeLinksNow } from '../lib/devices';
import { E2E, toBase64Url, type Received } from '../lib/e2e';
import { isGroupPacket } from '../lib/groups';
import { forgetPlaceChats, placeChats, placeChatsNow } from '../lib/place-chats';
import { onPlaceGroupMessage, placeGroupsAt } from '../lib/place-groups';
import { startHiddenNotices } from '../lib/hidden-notices';
import { hiddenRinging, setHiddenRinging } from '../lib/hidden-ring';
import { holdPlace, onPlaceMessage, onPlaceRing, placesRead, receivesPocket, startPlaceReceiver, takePlaceCalls } from '../lib/place-receiver';
import { keepReceived, setAppShown } from '../lib/receiver';
import { hiddenSign } from '../lib/unread-signs';
import { createQueue, fromHex, receiveMessage, sendMessage, setThroughTor, toHex } from '../lib/relay';
import type { SpaceChats } from '../lib/space-chats';
import { spaceGroups } from '../lib/space-groups';
import { VoiceAssembler } from '../lib/voice';
import { loadGroupData } from '../lock/group-data';
import { prepareHidden, removeHiddenPassword, setHiddenPassword } from '../lock/hidden';
import { keepPlace, keepsPlace, keptPlaces, onKeptChange, prepareKeepEntries } from '../lock/hidden-keep';
import { History } from '../lock/history';
import { watchPocket } from '../lock/hidden-watch';
import { setCurrentSpace } from '../lock/keys';
import { placeQueues } from '../lock/queues-data';
import { hiddenHolder } from '../lock/sealed-file';
import { writeNote } from '../lib/myself';
import { EMPTY_SPACE, saveHiddenData, updateCurrentSpaceData, updateHiddenData, type Queue } from '../lock/space-data';
import { blobs, files } from './files-memory';
import { ready as relayReady, relayNote, startRelay } from './real-relay';
import { reminders } from './device-memory';
import { slow, store } from './secure-memory';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built);
if (coreReady) {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(
    Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core,
  );
} else {
  console.log('Skipping the hidden chats receiving checks: build the core first with node checks/build-core.mjs');
}
relayNote('the hidden chats receiving checks');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function until(what: () => boolean | Promise<boolean>, ms = 5000): Promise<void> {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(20)) if (await what()) return;
  throw new Error('waited too long');
}

test('every space keeps four keys of one size, the real one only where a place receives, and a new place receives', async () => {
  store.clear();
  await prepareKeepEntries();
  const names = [...store.keys()].filter((name) => name.startsWith('erevos.keep.'));
  assert.deepEqual(names.sort(), ['erevos.keep.0', 'erevos.keep.1', 'erevos.keep.2', 'erevos.keep.3']);
  const size = store.get('erevos.keep.0')!.length;
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  await saveHiddenData(0, 2, placeKey, EMPTY_SPACE);

  // Before any switch, the entry sealed with a random key: the space's own seals it as it is read,
  // of the same size, and finds nothing.
  const before = store.get('erevos.keep.0')!;
  assert.deepEqual(await keptPlaces(0, spaceKey), []);
  assert.notEqual(store.get('erevos.keep.0'), before);
  assert.equal(store.get('erevos.keep.0')!.length, size);

  let changed = 0;
  const stop = onKeptChange(() => changed++);
  try {
    await keepPlace(0, spaceKey, 2, placeKey);
    assert.equal(changed, 1);
    assert.equal(store.get('erevos.keep.0')!.length, size);
    assert.ok(await keepsPlace(0, spaceKey, 2, placeKey));
    assert.ok(!(await keepsPlace(0, spaceKey, 1, placeKey)));
    // Only the place's own entry tells its key from the random ones of the other pockets.
    const found = await keptPlaces(0, spaceKey);
    assert.deepEqual(
      found.map((place) => [place.pocket, toHex(place.key)]),
      [[2, toHex(placeKey)]],
    );
    // Another key opens nothing; the other spaces keep nothing of it.
    assert.deepEqual(await keptPlaces(0, randomBytes(32)), []);
    assert.ok(!(await keepsPlace(1, spaceKey, 2, placeKey)));
    // Off, its key is gone from the entry.
    await keepPlace(0, spaceKey, 2, null);
    assert.equal(changed, 2);
    assert.ok(!(await keepsPlace(0, spaceKey, 2, placeKey)));
    assert.deepEqual(await keptPlaces(0, spaceKey), []);
  } finally {
    stop();
  }

  // A new place, set while its space is open, receives; one whose PIN goes no longer does.
  store.clear();
  await prepareHidden();
  setCurrentSpace(0, spaceKey);
  try {
    const key = await setHiddenPassword(0, 1, 'hidden-pin-1', null);
    assert.ok(await keepsPlace(0, spaceKey, 1, key));
    // A new PIN for the same hidden chats leaves their switch as it was.
    await keepPlace(0, spaceKey, 1, null);
    await setHiddenPassword(0, 1, 'hidden-pin-2', key);
    assert.ok(!(await keepsPlace(0, spaceKey, 1, key)));
    await keepPlace(0, spaceKey, 1, key);
    // Its reminders, told by the phone while it receives closed, go with its PIN; the space's stay.
    const later = Date.now() + 3_600_000;
    const hiddenNote = await writeNote({ text: 'hidden', due: later }, { place: { holder: hiddenHolder(1), space: 0, key }, arm: true });
    const spaceNote = await writeNote({ text: 'space', due: later });
    assert.ok(reminders.has(hiddenNote.id) && reminders.has(spaceNote.id));
    await removeHiddenPassword(0, 1);
    assert.ok(!(await keepsPlace(0, spaceKey, 1, key)));
    assert.ok(!reminders.has(hiddenNote.id));
    assert.ok(reminders.has(spaceNote.id));
    // So do those of hidden chats a new PIN puts others in place of.
    const first = await setHiddenPassword(0, 3, 'hidden-pin-5', null);
    const replaced = await writeNote({ text: 'replaced', due: later }, { place: { holder: hiddenHolder(3), space: 0, key: first }, arm: true });
    assert.ok(reminders.has(replaced.id));
    await setHiddenPassword(0, 3, 'hidden-pin-6', null);
    assert.ok(!reminders.has(replaced.id));
    assert.ok(reminders.has(spaceNote.id));
  } finally {
    setCurrentSpace(null);
  }
});

test('as a space opens, its hidden chats tell of nothing until it is read which places receive while closed', { skip: !relayReady }, async () => {
  store.clear();
  const url = await startRelay();
  const spaceKey = randomBytes(32);
  setCurrentSpace(0, spaceKey);
  await prepareKeepEntries();
  await updateCurrentSpaceData({ url });
  const ids = await createQueue({ url });
  await watchPocket(0, spaceKey, 2, { url, token: '', recipientHex: toHex(ids.recipientId) });
  await sendMessage({ url }, ids.senderId, Uint8Array.of(1), 'message');
  // Which places receive is read slowly, as from a busy keystore.
  slow.get = (key) => (key === 'erevos.keep.0' ? 600 : 0);
  setAppShown(false);
  let told = 0;
  const stopReceiver = startPlaceReceiver(30);
  const stopNotices = startHiddenNotices((count) => (told += count));
  try {
    assert.ok(!placesRead(0));
    assert.ok(placesRead(1));
    await sleep(400);
    assert.equal(told, 0);
    // Read, and pocket 2 does not receive: it tells of what came, once.
    await until(() => placesRead(0));
    await until(() => told === 1);
    await sleep(200);
    assert.equal(told, 1);
  } finally {
    slow.get = undefined;
    stopNotices();
    stopReceiver();
    setAppShown(true);
    setCurrentSpace(null);
  }
  assert.ok(placesRead(0));
});

test('a closed place that receives keeps what comes, tells its sender, rings calls with no name, and stops when switched off', { skip: !coreReady || !relayReady }, async () => {
  store.clear();
  files.clear();
  blobs.clear();
  const url = await startRelay();
  const relay = { url };
  const queue = async () => {
    const ids = await createQueue(relay);
    return { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  };

  // Bob's space is open, its hidden chats in pocket 1 closed, their switch on.
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  setCurrentSpace(0, spaceKey);
  await prepareKeepEntries();
  const bobQueue = await queue();
  await saveHiddenData(0, 1, placeKey, { ...EMPTY_SPACE, url, ownQueue: bobQueue });
  const bob = await placeChats(0, 1, placeKey);
  await keepPlace(0, spaceKey, 1, placeKey);

  // Alice, on another phone, adds the hidden chats' link and writes.
  const alice = await E2E.open('space', 1, randomBytes(32));
  const aliceQueue = await queue();
  const where = { relay: url, relayKey: '' };
  const { identity: bobId } = await alice.addContact({ senderHex: bobQueue.senderHex, key: toBase64Url(bob.e2e.bundle), relayUrl: url }, aliceQueue.senderHex, where);
  const [first] = alice.pending();
  await sendMessage(relay, fromHex(first.sender), first.first);
  await alice.firstSent(bobId);
  const write = async (text: string, call?: CallSignal) => {
    const sealed = await alice.seal(bobId, text, aliceQueue.senderHex, { at: where, ...(call ? { call } : {}) });
    await sendMessage(relay, fromHex(sealed.sender), sealed.packet);
    return sealed.tag;
  };
  const toAlice = async () => {
    for (;;) {
      const bytes = await receiveMessage(relay, fromHex(aliceQueue.recipientHex));
      if (!bytes) return null;
      const said = (await alice.receive(bytes)) as Extract<Received, { kind: 'message' }>;
      if (said.kind !== 'message' || said.text || said.got.length > 0 || said.read.length > 0 || said.ask) return said;
    }
  };
  const texts = () => bob.history.messages().map((message) => message.text);

  const heard: string[] = [];
  const rang: number[] = [];
  const stopHeard = onPlaceMessage((space, pocket, received) => {
    assert.deepEqual([space, pocket], [0, 1]);
    heard.push(received.text);
  });
  const stopRang = onPlaceRing((_space, pocket) => rang.push(pocket));
  setAppShown(true);
  const stop = startPlaceReceiver(30);
  try {
    await until(() => receivesPocket(0, 1));
    assert.ok(!receivesPocket(0, 2));
    assert.ok(!receivesPocket(1, 1));

    await write('hi hidden Bob');
    await until(() => texts().includes('hi hidden Bob'));
    await until(() => heard.includes('hi hidden Bob'));
    // The dot on the search of the space's chats (lib/unread-signs.ts): only once the place asks for it.
    assert.equal(await hiddenSign(), false);
    await updateHiddenData(0, 1, placeKey, { sign: true });
    assert.equal(await hiddenSign(), true);
    // Someone new, a message request: told nothing back until accepted.
    assert.equal(bob.e2e.contacts()[0].request, true);
    await bob.e2e.acceptRequest(bob.e2e.contacts()[0].identity);
    const againTag = await write('still there?');
    await until(() => texts().includes('still there?'));
    let receipt: Awaited<ReturnType<typeof toAlice>> = null;
    await until(async () => (receipt = await toAlice()) !== null && receipt.got.length > 0);
    assert.deepEqual(receipt!.got, [againTag]);

    // While its chat screen holds it, nothing is taken; once let go, it is.
    const release = await holdPlace(0, 1);
    await write('held');
    await sleep(200);
    assert.ok(!texts().includes('held'));
    release();
    await until(() => texts().includes('held'));

    // A call rings with no name and waits for the PIN, for its chat screen to take.
    const callId = () => toHex(randomBytes(8));
    const ringing = callId();
    await write('', { id: ringing, kind: 'offer', video: false, sdp: 'v=0 ring', at: Date.now() });
    await until(() => rang.length === 1);
    assert.deepEqual(rang, [1]);
    const taken = takePlaceCalls(0, 1);
    assert.deepEqual(
      taken.map((received) => received.call?.id),
      [ringing],
    );
    assert.deepEqual(takePlaceCalls(0, 1), []);
    // Not for another space.
    assert.deepEqual(takePlaceCalls(1, 1), []);

    // One its caller ended before the PIN opened the place is kept as missed, as is one too old to answer.
    const ended = callId();
    await write('', { id: ended, kind: 'offer', video: true, sdp: 'v=0 video', at: Date.now() });
    await until(() => rang.length === 2);
    await write('', { id: ended, kind: 'end', reason: 'hangup' });
    await until(() => texts().includes(`${CALL_LINE}Missed video call`));
    assert.deepEqual(takePlaceCalls(0, 1), []);
    await write('', { id: callId(), kind: 'offer', video: false, sdp: 'v=0 old', at: Date.now() - OFFER_FRESH_MS - 1000 });
    await until(() => texts().includes(`${CALL_LINE}Missed voice call`));
    assert.equal(rang.length, 2);
    // One that rings with no name as INVISIBLE is chosen (lib/modes.ts) rings no more, kept at once
    // as missed, its line saying why. (Out of it at once: in INVISIBLE the relay is read only
    // through Tor.)
    await write('', { id: callId(), kind: 'offer', video: false, sdp: 'v=0 invisible', at: Date.now() });
    await until(() => rang.length === 3);
    setHiddenRinging({ space: 0, pocket: 1, at: Date.now() });
    setThroughTor('all');
    setThroughTor('off');
    assert.equal(hiddenRinging(), null);
    assert.deepEqual(takePlaceCalls(0, 1), []);
    await until(() => texts().includes(`${CALL_LINE}Missed voice call, in INVISIBLE`));

    // Read, the dot goes.
    for (const contact of bob.e2e.contacts()) await bob.history.mark(`contact:${contact.identity}`, false, 2, Date.now());
    assert.equal(await hiddenSign(), false);
    await write('one more');
    await until(() => texts().includes('one more'));
    assert.equal(await hiddenSign(), true);

    // Switched off, nothing reads it any more: what comes waits on the relay.
    await keepPlace(0, spaceKey, 1, null);
    await until(() => !receivesPocket(0, 1));
    const count = texts().length;
    await write('after');
    await sleep(300);
    assert.equal(texts().length, count);
    assert.ok(await receiveMessage(relay, fromHex(bobQueue.recipientHex)));
    // Nor is its dot asked of then.
    assert.equal(await hiddenSign(), false);
  } finally {
    setThroughTor('off');
    setHiddenRinging(null);
    stop();
    stopHeard();
    stopRang();
    // A look under way ends first: what it tells could reach the next check.
    (await holdPlace(0, 1))();
    forgetPlaceChats();
    setCurrentSpace(null);
  }
});

test('a hidden place’s groups are its own: made with its contacts, through its relay, read while it is closed, apart from the space’s', { skip: !coreReady || !relayReady }, async () => {
  store.clear();
  files.clear();
  blobs.clear();
  const url = await startRelay();
  const relay = { url };
  const queue = async () => {
    const ids = await createQueue(relay);
    return { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  };

  // Bob's space is open, its hidden chats in pocket 1 closed and receiving.
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  setCurrentSpace(0, spaceKey);
  await prepareKeepEntries();
  const bobQueue = await queue();
  await saveHiddenData(0, 1, placeKey, { ...EMPTY_SPACE, url, ownQueue: bobQueue });
  const bob = await placeChats(0, 1, placeKey);
  await keepPlace(0, spaceKey, 1, placeKey);

  // Alice, on another phone, in hidden chats of her own, read here by hand.
  const aliceKey = randomBytes(32);
  const aliceQueue = await queue();
  await saveHiddenData(1, 2, aliceKey, { ...EMPTY_SPACE, url, ownQueue: aliceQueue });
  const alice = await placeChats(1, 2, aliceKey);
  const aliceAt = placeGroupsAt(1, 2, aliceKey);
  const toAlice = async () => {
    for (let bytes = await receiveMessage(relay, fromHex(aliceQueue.recipientHex)); bytes; bytes = await receiveMessage(relay, fromHex(aliceQueue.recipientHex))) {
      if (isGroupPacket(bytes)) {
        await aliceAt.take(bytes);
        continue;
      }
      const said = await alice.e2e.receive(bytes);
      if (said.kind === 'message' && said.group) await aliceAt.signal(said.identity, said.group, said.request);
    }
  };

  const where = { relay: url, relayKey: '' };
  const { identity: bobId } = await alice.e2e.addContact({ senderHex: bobQueue.senderHex, key: toBase64Url(bob.e2e.bundle), relayUrl: url }, aliceQueue.senderHex, where);
  const [first] = alice.e2e.pending();
  await sendMessage(relay, fromHex(first.sender), first.first);
  await alice.e2e.firstSent(bobId);
  const hello = await alice.e2e.seal(bobId, 'hello', aliceQueue.senderHex, { at: where });
  await sendMessage(relay, fromHex(hello.sender), hello.packet);

  const heard: [number, number, string][] = [];
  const stopHeard = onPlaceGroupMessage((space, pocket, group) => heard.push([space, pocket, group]));
  setAppShown(true);
  const stop = startPlaceReceiver(30);
  try {
    await until(() => bob.history.messages().some((message) => message.text === 'hello'));
    await bob.e2e.acceptRequest(bob.e2e.contacts()[0].identity);
    // The place's moves made it a queue for its groups, and none for public ones.
    await until(async () => !!(await placeQueues(0, 1, placeKey).load()).group);
    const kept = await placeQueues(0, 1, placeKey).load();
    assert.equal(kept.public, null);

    // Alice makes a group with hidden Bob: asked, he joins while his hidden chats are closed.
    const aliceGroups = await aliceAt.groups();
    const id = await aliceGroups.create('Κρυφή ομάδα', [bobId], aliceAt.transport);
    const bobAt = placeGroupsAt(0, 1, placeKey);
    const bobGroups = await bobAt.groups();
    await until(async () => {
      await toAlice();
      return bobGroups.list().some((group) => group.id === id && group.status === 'in');
    }, 15000);
    // Where the group reaches him: the place's own queue for groups.
    const member = (await aliceGroups.members(id)).find((m) => m.about?.id === bobId);
    assert.equal(member?.about?.sender, kept.group!.queue.senderHex);

    await aliceGroups.send(id, 'γεια στην κρυφή ομάδα', aliceAt.transport);
    await until(() => bobGroups.messages(id).some((m) => m.text === 'γεια στην κρυφή ομάδα'), 10000);
    await until(() => heard.some(([space, pocket, group]) => space === 0 && pocket === 1 && group === id));

    // His answer goes through the place's relay.
    await bobGroups.send(id, 'από τις κρυφές', bobAt.transport);
    await until(async () => {
      await toAlice();
      return aliceGroups.messages(id).some((m) => m.text === 'από τις κρυφές');
    });

    // Kept with the place, encrypted with its key; the space's groups have none of it.
    assert.equal((await loadGroupData(0, placeKey, hiddenHolder(1))).groups.length, 1);
    assert.equal((await loadGroupData(0, spaceKey)).groups.length, 0);
    assert.deepEqual((await spaceGroups()).list(), []);
  } finally {
    stop();
    stopHeard();
    (await holdPlace(0, 1))();
    forgetPlaceChats();
    setCurrentSpace(null);
  }
});

test('hidden chats linked on their own sync while they receive closed, and not while closed without it: what the phone passes on waits on the relay', { skip: !coreReady || !relayReady }, async () => {
  store.clear();
  files.clear();
  blobs.clear();
  const url = await startRelay();
  const relay = { url };
  const where = { relay: url, relayKey: '' };
  const queue = async (): Promise<Queue> => {
    const ids = await createQueue(relay);
    return { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  };
  // What comes to a queue, opened and kept as the chat keeps it, read here by hand.
  const takeOn = async (own: Queue, chats: SpaceChats, links: Links | null) => {
    for (let bytes = await receiveMessage(relay, fromHex(own.recipientHex)); bytes; bytes = await receiveMessage(relay, fromHex(own.recipientHex))) {
      const received = await chats.e2e.receive(bytes);
      if (received.kind === 'message') await keepReceived(chats, received);
    }
    await links?.settled();
  };

  // The computer's space is open, and its hidden chats in pocket 1, held as their screen holds them.
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  setCurrentSpace(0, spaceKey);
  await prepareKeepEntries();
  const dellQueue = await queue();
  await saveHiddenData(0, 1, placeKey, { ...EMPTY_SPACE, url, ownQueue: dellQueue });
  const release = await holdPlace(0, 1);
  const dell = await placeChats(0, 1, placeKey);
  const dellLinks = placeLinksNow(0, 1)!;
  assert.ok(dellLinks);
  // The phone's hidden chats, and Carol, their contact, on other phones.
  const pixelKey = randomBytes(32);
  const pixelQueue = await queue();
  await saveHiddenData(5, 2, pixelKey, { ...EMPTY_SPACE, url, ownQueue: pixelQueue });
  const pixel = { e2e: await E2E.open(hiddenHolder(2), 5, pixelKey), history: await History.open(hiddenHolder(2), 5, pixelKey), voiceParts: new VoiceAssembler() };
  const pixelLinks = await Links.open(5, pixelKey, pixel, 60 * 60_000, 2);
  const carol = await E2E.open('space', 6, randomBytes(32));
  const carolQueue = await queue();
  const carolId = carol.identityHex();
  const { identity: account } = await carol.addContact({ senderHex: pixelQueue.senderHex, key: toBase64Url(pixel.e2e.bundle), relayUrl: url }, carolQueue.senderHex, where);
  const [first] = carol.pending();
  await sendMessage(relay, fromHex(first.sender), first.first);
  await carol.firstSent(account);
  const write = async (text: string) => {
    const sealed = await carol.seal(account, text, carolQueue.senderHex, { at: where });
    await sendMessage(relay, fromHex(sealed.sender), sealed.packet);
    return sealed.tag;
  };
  await write('hello');
  await takeOn(pixelQueue, pixel, pixelLinks);
  await pixel.e2e.acceptRequest(carolId);
  const texts = (chats: SpaceChats | null) => chats?.history.messages().map((m) => m.text) ?? [];

  const stop = startPlaceReceiver(30);
  try {
    // Linked from inside them, with the codes compared, while they are open.
    const asked = await pixelLinks.prepare(await dellLinks.makeOffer('DELL'));
    await pixelLinks.link({ since: 0, files: false }, 'Pixel');
    await takeOn(dellQueue, dell, dellLinks);
    await dellLinks.confirm(asked.code);
    await takeOn(pixelQueue, pixel, pixelLinks);
    await until(async () => {
      await takeOn(dellQueue, dell, dellLinks);
      return texts(dell).includes('hello');
    });
    assert.equal(dellLinks.role(), 'linked');

    // Closed, not receiving: their chats and links are let go of, and nothing reads them. What
    // Carol writes, the phone passes on, and it waits on the relay.
    assert.ok(!receivesPocket(0, 1));
    release();
    forgetPlaceChats(0, 1);
    assert.equal(placeLinksNow(0, 1), null);
    const closed = await write('while closed');
    await takeOn(pixelQueue, pixel, pixelLinks);
    await sleep(300);
    assert.deepEqual([placeChatsNow(0, 1), placeLinksNow(0, 1)], [null, null]);
    assert.ok(!(await History.open(hiddenHolder(1), 0, placeKey)).messages().some((m) => m.tag === closed));

    // Receive while closed on: the receiver opens them, their links with them, and it comes.
    await keepPlace(0, spaceKey, 1, placeKey);
    await until(() => receivesPocket(0, 1));
    await until(() => texts(placeChatsNow(0, 1)).includes('while closed'));
    assert.equal(placeLinksNow(0, 1)?.role(), 'linked');
    const later = await write('still closed');
    await takeOn(pixelQueue, pixel, pixelLinks);
    await until(() => texts(placeChatsNow(0, 1)).includes('still closed'));
    assert.equal(placeChatsNow(0, 1)!.history.messages().filter((m) => m.tag === later).length, 1);
  } finally {
    stop();
    (await holdPlace(0, 1))();
    forgetPlaceChats();
    pixelLinks.close();
    setCurrentSpace(null);
  }
});
