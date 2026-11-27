// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A space's relay queue moving (lib/queue-move.ts), through a real relay and the real core: Alice
// deletes Carol, so her own queue moves and Bob is told the new one quietly, while the queue her
// contact link names stays, and what Bob sent there before still shows; junk that fills her queue
// moves it once, Bob gets through again, and junk left on the old one moves nothing; an old queue
// is emptied and deleted once every kept contact was heard on a later one, and is gone for whoever
// writes to it after. What a contact holds for later on the relay follows her queue as it moves
// (lib/waiting.ts, holdAgain), held anew once however many look at once, tried again later when the
// relay refuses it, and what is held for one deleted goes no more (heldFor, dropHeld), though a look
// held it anew meanwhile or the relay could not take it back. A backup from before moves put back
// says a later queue than any contact holds, and each is told it.
// A link made at any step of a move names the queue before, never the new one; junk on the link's
// or the groups' queue moves it, as do first packets past those read at once, but real requests
// among them still come; a relay that lost the link's or the groups' gives new ones, and
// moves the own queue for neither, nor does a wait in the background; a wait in the background ends
// with what comes to the other queues, and a look reads none a wait found nothing come to; one a group still names stays;
// old queues let go of early are deleted after a new start, unless a group names them still, and a move cut short finishes as it
// started; a hidden place's ring queue moves though the relay was away at first, and its kept
// contacts are told.
// Skipped, with a note, when the core or the relay is not built.
// Run with: npm run check
/// <reference types="node" />
import { lookNow } from '../lib/look-now';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { setCore, type Core } from '../lib/core';
import { randomBytes } from '../lib/crypto';
import { E2E, toBase64Url, type Received } from '../lib/e2e';
import { FIRST_QA, GRACE } from '../lib/moves';
import { linkOf, QueueMove, tookOf, type MoveAt, type MoveGroups, type Take } from '../lib/queue-move';
import { networkChanged } from '../lib/network-change';
import { awayQueues, keepReceived, setAppShown, waitWhileAway } from '../lib/receiver';
import { createQueue, deleteQueue, fromHex, isQueueFull, isQueueNotFound, receiveMessage, sendMessage, toHex, type Mark, type Relay } from '../lib/relay';
import type { SpareStore } from '../lib/spare';
import { dropHeld, heldAfter, heldFor, holdAgain, holdLater, sendWaiting, takeBack, type SendPlace } from '../lib/waiting';
import { VoiceAssembler } from '../lib/voice';
import { History, WAITING } from '../lock/history';
import { hiddenHolder } from '../lock/sealed-file';
import { EMPTY_QUEUES, MAX_OLD_OWN, placeQueues, spaceQueues, type QueuesStore } from '../lock/queues-data';
import { markRestore } from '../lock/restored';
import { loadSpaceData, updateSpaceData, type Queue } from '../lock/space-data';
import { files } from './files-memory';
import { store as secureStore } from './secure-memory';
import { ready as relayReady, relayNote, startRelay, stopRelay } from './real-relay';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built);
if (coreReady) {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core);
} else {
  console.log('Skipping the queue move checks: build the core first with node checks/build-core.mjs');
}
relayNote('the queue move checks');

test('a deletion and junk move the queue, kept contacts follow, and the one deleted reaches nothing', { skip: !coreReady || !relayReady, timeout: 120_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const where = { relay: url, relayKey: '' };
  const queue = async (): Promise<Queue> => {
    const ids = await createQueue(relay);
    return { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  };

  // Alice, with her space's settings and queues, and the moves made with them.
  const aliceKey = randomBytes(32);
  const alice = await E2E.open('space', 0, aliceKey);
  const first = await queue();
  await updateSpaceData(0, aliceKey, { url, ownQueue: first });
  const store: SpareStore = { of: {}, load: () => loadSpaceData(0, aliceKey), update: (patch) => updateSpaceData(0, aliceKey, patch) };
  const queues = spaceQueues(0, aliceKey);
  const groupsAsked: string[] = [];
  const pushed: { keep: string[]; drop: string[] } = { keep: [], drop: [] };
  const mover = new QueueMove({
    e2e: alice,
    queues,
    data: store,
    groups: { renewAgain: async (kind) => void groupsAsked.push(kind), named: async () => new Set() },
    push: { keep: async (_own, q) => void pushed.keep.push(q.senderHex), drop: async (_own, q) => void pushed.drop.push(q.senderHex) },
  });
  const own = async () => (await store.load()).ownQueue!;
  const marks: Mark[] = [];

  // One look, as the receiver makes it: up to 50 from the own queue, then the move's.
  const look = async () => {
    const shown: string[] = [];
    const take: Take = async (bytes, kind) => {
      let received: Received;
      try {
        received = await alice.receive(bytes, kind === 'own' ? { onOwn: ownNow.senderHex } : { old: true });
      } catch {
        return { junk: true };
      }
      if (received.kind === 'message') shown.push(received.text);
      return tookOf(received);
    };
    let taken = 0;
    let junk = 0;
    const ownNow = await own();
    for (; taken < 50; taken++) {
      const bytes = await receiveMessage(relay, fromHex(ownNow.recipientHex));
      if (!bytes) break;
      if ((await take(bytes, 'own')).junk) junk++;
    }
    const news = await mover.look({
      own: relay,
      found: { taken, junk },
      take,
      tell: async (identity) => {
        const sealed = await alice.seal(identity, '', (await own()).senderHex, { at: where });
        marks.push('quiet');
        await sendMessage(relay, fromHex(sealed.sender), sealed.packet, 'quiet');
      },
      shows: false,
    });
    return { shown, news };
  };

  // Bob, Carol and later Dave each have a queue and Alice's contact link.
  const person = async (space: number) => {
    const e2e = await E2E.open('space', space, randomBytes(32));
    const q = await queue();
    const { identity } = await e2e.addContact({ senderHex: first.senderHex, key: toBase64Url(alice.bundle), relayUrl: url }, q.senderHex, where);
    const [hello] = e2e.pending();
    await sendMessage(relay, fromHex(hello.sender), hello.first);
    await e2e.firstSent(identity);
    const write = async (text: string) => {
      const sealed = await e2e.seal(identity, text, q.senderHex, { at: where });
      await sendMessage(relay, fromHex(sealed.sender), sealed.packet);
      return sealed.sender;
    };
    const read = async () => {
      for (let bytes = await receiveMessage(relay, fromHex(q.recipientHex)); bytes; bytes = await receiveMessage(relay, fromHex(q.recipientHex))) await e2e.receive(bytes);
    };
    return { e2e, q, identity, write, read, alice: () => e2e.record(identity)!.sender };
  };
  const bob = await person(1);
  const carol = await person(2);

  // Alice's first look finds both asking, and takes them; the queue she has now is none to tell of.
  const opened = await look();
  assert.equal(opened.news.queue, null);
  assert.equal(alice.contacts().length, 2);
  for (const c of alice.contacts()) await alice.acceptRequest(c.identity);
  const [bobId, carolId] = [bob, carol].map((p) => alice.contacts().find((c) => c.sender === p.q.senderHex)!.identity);
  let q = await queues.load();
  assert.equal(q.now?.queue.recipientHex, first.recipientHex);
  assert.equal(q.since, q.moved);
  // Its `qa` says nothing of when this version first looked.
  assert.equal(q.moved, FIRST_QA);
  // The groups' and the public groups' queues are made with it, each its own, and the groups told.
  assert.ok(q.group && q.public && q.group.queue.senderHex !== q.public.queue.senderHex && q.group.queue.senderHex !== first.senderHex);
  assert.deepEqual(groupsAsked, ['group', 'public']);

  // Alice deletes Carol: her own queue moves at once, in the same turn as the deletion is kept.
  await alice.deleteContact(carolId);
  const second = (await mover.moveNow(relay))!.queue;
  assert.notEqual(second.senderHex, first.senderHex);
  assert.equal((await own()).senderHex, second.senderHex);
  assert.equal(alice.moveDue(), 0);
  q = await queues.load();
  // The queue her link names stays: links and QR codes given before keep working.
  assert.equal(linkOf(q, second).senderHex, first.senderHex);
  assert.ok(q.moved > q.since);
  assert.ok(pushed.keep.includes(second.senderHex) && pushed.drop.includes(first.senderHex));

  // Bob wrote before he was told, Carol writes after: Bob's shows, Carol's does not.
  assert.equal(await bob.write('before'), first.senderHex);
  await carol.write('still here?');
  marks.length = 0;
  const told = await look();
  assert.deepEqual(told.shown, ['before']);
  assert.ok(marks.length >= 1 && marks.every((m) => m === 'quiet'));
  await bob.read();
  assert.equal(bob.alice(), second.senderHex);
  assert.equal(bob.e2e.record(bob.identity)!.qa, q.moved);
  // What he sends now goes to the new queue.
  assert.equal(await bob.write('after'), second.senderHex);
  assert.deepEqual((await look()).shown, ['after']);
  assert.equal(alice.record(bobId)!.onNew, q.moved);
  // Carol never learned it.
  assert.equal(carol.alice(), first.senderHex);

  // Someone new with the link Alice gave before: a request, through the queue it names.
  const dave = await person(3);
  await look();
  assert.ok(alice.contacts().some((c) => c.sender === dave.q.senderHex && c.request));

  // Junk fills her queue: Bob's message no longer goes.
  for (let i = 0; i < 1000; i++) await sendMessage(relay, fromHex(second.senderHex), randomBytes(120));
  await assert.rejects(bob.write('full?'), (error) => isQueueFull(error));
  // Three looks of a whole batch of junk move it, and Bob is told the new one.
  const notes: string[] = [];
  for (let i = 0; i < 3; i++) notes.push(...(await look()).news.notes);
  const third = await own();
  assert.notEqual(third.senderHex, second.senderHex);
  assert.equal(notes.length, 1);
  q = await queues.load();
  assert.equal(q.junk.own !== undefined, true);
  assert.ok(q.was.some((w) => w.queue.senderHex === second.senderHex && w.kind === 'own' && w.by === q.moved));
  await look();
  await bob.read();
  assert.equal(bob.alice(), third.senderHex);
  // The junk left on the old queue, read a little with each look, moves nothing.
  for (let i = 0; i < 4; i++) await look();
  assert.equal((await own()).senderHex, third.senderHex);

  // Bob is heard on the new queue: no kept contact needs the old one, so it is emptied and deleted.
  assert.equal(await bob.write('through'), third.senderHex);
  assert.deepEqual((await look()).shown, ['through']);
  q = await queues.load();
  assert.ok(!q.was.some((w) => w.queue.senderHex === second.senderHex));
  await assert.rejects(sendMessage(relay, fromHex(second.senderHex), randomBytes(40)), (error) => isQueueNotFound(error));
  // The queue the link names is never one of those: it stays until a new link, or junk on it.
  assert.equal(linkOf(q, third).senderHex, first.senderHex);
  await sendMessage(relay, fromHex(first.senderHex), randomBytes(40));
});

test('a new contact link moves the queue the link names, and the one before works for its grace', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const ids = await createQueue(relay);
  const key = randomBytes(32);
  const e2e = await E2E.open('space', 0, key);
  const first = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  await updateSpaceData(0, key, { url, ownQueue: first });
  const store: SpareStore = { of: {}, load: () => loadSpaceData(0, key), update: (patch) => updateSpaceData(0, key, patch) };
  const queues = spaceQueues(0, key);
  // The space's groups from before this version say the own queue, until each renews there.
  let named = new Set([first.senderHex]);
  const groups: MoveGroups = { renewAgain: async () => undefined, named: async () => named };
  const mover = new QueueMove({ e2e, queues, data: store, groups });
  const look = (m = mover) => m.look({ own: relay, found: { taken: 0, junk: 0 }, take: async () => ({ junk: false }), tell: async () => undefined, shows: false });
  await look();
  // While the own queue is the link's, the own queue moves, and the one before stays a while.
  const before = Date.now();
  const made = await mover.newLink(relay);
  assert.ok(made.queue && made.queue.senderHex !== first.senderHex);
  assert.ok(made.until >= before + GRACE);
  let q = await queues.load();
  assert.equal(q.link, null);
  assert.ok(q.was.some((w) => w.kind === 'link' && w.queue.senderHex === first.senderHex));
  assert.ok(q.linkUntil >= before + GRACE);
  // Its grace over, it is still read while a group says it.
  await queues.update((d) => ({ ...d, was: d.was.map((w) => ({ ...w, until: 0 })) }));
  await look();
  assert.ok((await queues.load()).was.some((w) => w.queue.senderHex === first.senderHex));
  await sendMessage(relay, fromHex(first.senderHex), randomBytes(40));
  // Once none does, it goes.
  named = new Set();
  await look(new QueueMove({ e2e, queues, data: store, groups }));
  assert.ok(!(await queues.load()).was.some((w) => w.queue.senderHex === first.senderHex));
  await assert.rejects(sendMessage(relay, fromHex(first.senderHex), randomBytes(40)), (error) => isQueueNotFound(error));
  // A move for a deletion makes the queue before the link's; a new link then moves only that one.
  await e2e.moveSoon();
  const own = (await mover.moveNow(relay))!.queue;
  assert.equal(linkOf(await queues.load(), own).senderHex, made.queue.senderHex);
  const again = await mover.newLink(relay);
  assert.equal(again.queue, null);
  q = await queues.load();
  assert.ok(q.link && q.link.queue.senderHex !== own.senderHex);
  assert.equal((await loadSpaceData(0, key)).ownQueue!.senderHex, own.senderHex);
});

test('what a contact holds for later reaches her though she moved twice and the queue it was held for is gone, and none of it once she is deleted', { skip: !coreReady || !relayReady, timeout: 120_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const where = { relay: url, relayKey: '' };
  const queue = async (): Promise<Queue> => {
    const ids = await createQueue(relay);
    return { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  };

  // Alice and the moves of her space.
  const aliceKey = randomBytes(32);
  const alice = await E2E.open('space', 0, aliceKey);
  const first = await queue();
  await updateSpaceData(0, aliceKey, { url, ownQueue: first });
  const store: SpareStore = { of: {}, load: () => loadSpaceData(0, aliceKey), update: (patch) => updateSpaceData(0, aliceKey, patch) };
  const queues = spaceQueues(0, aliceKey);
  const mover = new QueueMove({ e2e: alice, queues, data: store });
  const own = async () => (await store.load()).ownQueue!;
  // One look, as the receiver makes it, saying what showed.
  const look = async () => {
    const shown: string[] = [];
    const take: Take = async (bytes, kind) => {
      let received: Received;
      try {
        received = await alice.receive(bytes, kind === 'own' ? { onOwn: ownNow.senderHex } : { old: true });
      } catch {
        return { junk: true };
      }
      if (received.kind === 'message' && received.text) shown.push(received.text);
      return tookOf(received);
    };
    const ownNow = await own();
    let taken = 0;
    for (; taken < 50; taken++) {
      const bytes = await receiveMessage(relay, fromHex(ownNow.recipientHex));
      if (!bytes) break;
      await take(bytes, 'own');
    }
    await mover.look({
      own: relay,
      found: { taken, junk: 0 },
      take,
      tell: async (identity) => {
        const sealed = await alice.seal(identity, '', (await own()).senderHex, { at: where });
        await sendMessage(relay, fromHex(sealed.sender), sealed.packet, 'quiet');
      },
      shows: false,
    });
    return shown;
  };

  // Bob, with his chats and what they keep, has Alice's contact link and asks to talk.
  const bobKey = randomBytes(32);
  const bob = { e2e: await E2E.open('space', 1, bobKey), history: await History.open('space', 1, bobKey) };
  const mine = await queue();
  const { identity: aliceId } = await bob.e2e.addContact({ senderHex: first.senderHex, key: toBase64Url(alice.bundle), relayUrl: url }, mine.senderHex, where);
  const [hello] = bob.e2e.pending();
  await sendMessage(relay, fromHex(hello.sender), hello.first);
  await bob.e2e.firstSent(aliceId);
  const read = async () => {
    for (let bytes = await receiveMessage(relay, fromHex(mine.recipientHex)); bytes; bytes = await receiveMessage(relay, fromHex(mine.recipientHex))) await bob.e2e.receive(bytes);
  };
  const place: SendPlace = { sends: relay, own: relay, senderHex: mine.senderHex, here: where, ownKey: '', relayUp: true };
  const peer = `contact:${aliceId}`;
  await look();
  await alice.acceptRequest(alice.contacts()[0].identity);

  // Alice moves once: Bob is told, and holds a message for her for later, for where she reads now.
  await alice.moveSoon();
  const second = (await mover.moveNow(relay))!.queue;
  await look();
  await read();
  assert.equal(bob.e2e.queueOf(aliceId)!.sender, second.senderHex);
  const at = Date.now() + 12_000;
  await bob.history.add({ peer, text: 'later', mine: true, at, tag: 'aaaaaaaaaaaa', mark: WAITING });
  const [held] = await sendWaiting(bob, place);
  assert.equal(held.heldFor, second.senderHex);
  assert.equal(bob.history.messages()[0].heldFor, second.senderHex);

  // She moves again. Bob, told, holds it anew for her new queue, and the one held before is taken back.
  await alice.moveSoon();
  const third = (await mover.moveNow(relay))!.queue;
  await look();
  await read();
  assert.equal(bob.e2e.queueOf(aliceId)!.sender, third.senderHex);
  const [again] = await sendWaiting(bob, place);
  assert.equal(again.tag, 'aaaaaaaaaaaa');
  assert.equal(again.heldFor, third.senderHex);
  assert.notEqual(again.held!.id, held.held!.id);
  assert.equal(await takeBack(relay, held.held!), false);
  assert.deepEqual(bob.history.waiting(), []);
  assert.deepEqual(
    bob.history.messages().map((m) => [m.held?.id, m.heldFor]),
    [[again.held!.id, third.senderHex]],
  );
  // Held where she reads now, it is let be with each look after.
  assert.deepEqual(await sendWaiting(bob, place), []);

  // Bob is heard on her new queue, so the one the message was held for first is emptied and deleted.
  const sealed = await bob.e2e.seal(aliceId, 'through', mine.senderHex, { at: where });
  await sendMessage(relay, fromHex(sealed.sender), sealed.packet);
  assert.deepEqual(await look(), ['through']);
  assert.ok(!(await queues.load()).was.some((w) => w.queue.senderHex === second.senderHex));
  await assert.rejects(sendMessage(relay, fromHex(second.senderHex), randomBytes(40)), (error) => isQueueNotFound(error));
  assert.ok(Date.now() < at);

  // Its time comes, Bob's phone gone: it reaches her, once.
  await new Promise((r) => setTimeout(r, at - Date.now() + 2000));
  assert.deepEqual(await look(), ['later']);
  assert.deepEqual(await look(), []);

  // Bob holds another, then deletes her: what is held for her is kept with the removal, as the
  // chats keep it, whatever a screen shows, and dropped; it never comes.
  const soon = Date.now() + 4000;
  await bob.history.add({ peer, text: 'secret', mine: true, at: soon, tag: 'bbbbbbbbbbbb', mark: WAITING });
  assert.equal((await sendWaiting(bob, place)).length, 1);
  const toDrop = heldFor(bob.history, aliceId);
  assert.equal(toDrop.length, 1);
  await bob.e2e.deleteContact(aliceId, { held: toDrop });
  const reopened = await E2E.open('space', 1, bobKey);
  assert.deepEqual(reopened.undropped(), toDrop);
  await dropHeld(reopened, relay);
  assert.deepEqual(reopened.undropped(), []);
  assert.equal(await takeBack(relay, toDrop[0]), false);
  // One whose relay cannot be reached is asked again later; one no relay set here holds, or whose time is past, is forgotten.
  const away = { id: 'c'.repeat(32), relay: 'ws://127.0.0.1:9', at: Date.now() + 60_000 };
  await reopened.removeContact('d'.repeat(64), { held: [away] });
  await dropHeld(reopened, { url: away.relay });
  assert.deepEqual(reopened.undropped(), [away]);
  await dropHeld(reopened, relay);
  assert.deepEqual(reopened.undropped(), []);
  await reopened.removeContact('d'.repeat(64), { held: [away] });
  await dropHeld(reopened, { url: away.relay }, away.at);
  assert.deepEqual(reopened.undropped(), []);
  await new Promise((r) => setTimeout(r, soon - Date.now() + 2000));
  assert.deepEqual(await look(), []);
});

// A space on a real relay with its queues and the moves made with them, `wrap` seeing each store.
async function spaceOn(relay: Relay, url: string, { groups, ring, wrap }: { groups?: MoveGroups; ring?: MoveAt['ring']; wrap?: (store: QueuesStore, data: SpareStore) => { queues: QueuesStore; data: SpareStore } } = {}) {
  const key = randomBytes(32);
  const e2e = await E2E.open('space', 0, key);
  const ids = await createQueue(relay);
  const first: Queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  await updateSpaceData(0, key, { url, ownQueue: first });
  const plain = { queues: spaceQueues(0, key), data: { of: {}, load: () => loadSpaceData(0, key), update: (patch) => updateSpaceData(0, key, patch) } as SpareStore };
  const { queues, data } = wrap ? wrap(plain.queues, plain.data) : plain;
  const mover = () => new QueueMove({ e2e, queues, data, groups, ring });
  const made = mover();
  const told: string[] = [];
  const look = (m = made) => m.look({ own: relay, found: { taken: 0, junk: 0 }, take: async () => ({ junk: true }), tell: async (identity) => void told.push(identity), shows: false });
  return { key, e2e, first, queues: plain.queues, mover: made, again: mover, look, told, own: async () => (await loadSpaceData(0, key)).ownQueue! };
}

test('a link made at any step of a move never names the new own queue; junk on the link’s or the groups’ queue moves it; a relay that lost the link’s gives a new link, never the own queue', { skip: !coreReady || !relayReady, timeout: 120_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  // The queue a link would name, as each write of a move leaves the space, read as a screen does.
  const links: string[] = [];
  let at: { queues: QueuesStore; data: SpareStore } | null = null;
  const snap = async () => {
    if (at) links.push(linkOf(await at.queues.load(), (await at.data.load()).ownQueue!).senderHex);
  };
  const asked: string[] = [];
  const space = await spaceOn(relay, url, {
    groups: { renewAgain: async (kind) => void asked.push(kind), named: async () => new Set() },
    wrap: (queues, data) => {
      at = { queues, data };
      return {
        queues: {
          load: queues.load,
          update: async (change) => {
            const d = await queues.update(change);
            await snap();
            return d;
          },
        },
        data: { ...data, update: async (patch) => (await data.update(patch), await snap()) },
      };
    },
  });
  await space.look();
  let q = await space.queues.load();
  assert.ok(q.group && q.public);
  for (let n = 0; n < 2; n++) {
    await space.e2e.moveSoon();
    links.length = 0;
    const moved = (await space.mover.moveNow(relay))!;
    assert.notEqual(moved.queue.senderHex, space.first.senderHex);
    assert.equal(moved.link.senderHex, space.first.senderHex);
    assert.ok(links.length >= 3);
    assert.ok(!links.includes(moved.queue.senderHex), 'never the new own queue');
  }

  // Junk fills the link's queue and the groups': three looks of whole batches move each.
  const group = q.group!.queue.senderHex;
  for (const sender of [space.first.senderHex, group]) for (let i = 0; i < 160; i++) await sendMessage(relay, fromHex(sender), randomBytes(120));
  const notes: string[] = [];
  for (let i = 0; i < 3; i++) notes.push(...(await space.look()).notes);
  q = await space.queues.load();
  assert.ok(q.link && q.link.queue.senderHex !== space.first.senderHex);
  assert.ok(q.was.some((w) => w.kind === 'link' && w.queue.senderHex === space.first.senderHex));
  assert.ok(q.group && q.group.queue.senderHex !== group);
  assert.deepEqual(asked, ['group', 'public', 'group']);
  assert.ok(notes.some((note) => note.startsWith('Junk filled the queue your contact link names, so you have a new link.')));

  // The relay lost the link's queue: a new one, never the own queue, and the links before no longer work.
  const lost = q.link.queue;
  await deleteQueue(relay, fromHex(lost.recipientHex));
  const said = (await space.look()).notes;
  q = await space.queues.load();
  assert.ok(q.link && q.link.queue.senderHex !== lost.senderHex && q.link.queue.senderHex !== (await space.own()).senderHex);
  assert.ok(said.some((note) => note.startsWith('The server had lost the queue your contact link names')));
  await sendMessage(relay, fromHex(q.link.queue.senderHex), randomBytes(40));
});

test('a relay that forgot only the groups’ queue has it made anew; the own queue stays, and a wait in the background ends at once without moving it', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const asked: string[] = [];
  const space = await spaceOn(relay, url, { groups: { renewAgain: async (kind) => void asked.push(kind), named: async () => new Set() } });
  await space.look();
  const group = (await space.queues.load()).group!.queue;
  await deleteQueue(relay, fromHex(group.recipientHex));
  setAppShown(false);
  try {
    const started = Date.now();
    await waitWhileAway(relay, fromHex(space.first.recipientHex), [fromHex(group.recipientHex)]);
    assert.ok(Date.now() - started < 10_000);
  } finally {
    setAppShown(true);
  }
  await space.look();
  const q = await space.queues.load();
  assert.ok(q.group && q.group.queue.senderHex !== group.senderHex);
  assert.deepEqual(asked, ['group', 'public', 'group']);
  assert.equal((await space.own()).senderHex, space.first.senderHex);
  assert.equal(q.now?.queue.senderHex, space.first.senderHex);
});

test('in the background a wait ends with what comes to the public groups’ queue, and a look reads no queue a wait found nothing come to', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const space = await spaceOn(relay, url, { groups: { renewAgain: async () => undefined, named: async () => new Set() } });
  await space.look();
  const q = await space.queues.load();
  const others = awayQueues(q, url);
  assert.ok(others.includes(q.group!.queue.recipientHex) && others.includes(q.public!.queue.recipientHex));
  assert.deepEqual(awayQueues(q, 'ws://127.0.0.1:1'), []);
  await sendMessage(relay, fromHex(q.public!.queue.senderHex), randomBytes(60));
  setAppShown(false);
  try {
    // A look was asked for meanwhile (lib/look-now.ts): the wait that follows is left out once.
    lookNow();
    assert.equal(await waitWhileAway(relay, fromHex(space.first.recipientHex), others.map(fromHex)), false);
    const started = Date.now();
    assert.equal(await waitWhileAway(relay, fromHex(space.first.recipientHex), others.map(fromHex)), 'came');
    assert.ok(Date.now() - started < 10_000);
  } finally {
    setAppShown(true);
  }
  let took = 0;
  const look = (empty: string[]) =>
    space.mover.look({ own: relay, found: { taken: 0, junk: 0 }, take: async () => (took++, { junk: false }), tell: async () => undefined, shows: false, empty });
  await look(others);
  assert.equal(took, 0, 'not read after a wait that found nothing');
  await look([]);
  assert.equal(took, 1);
});

test('in the background a wait at the relay ends a moment after the phone’s network changed, as one ended from outside', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const space = await spaceOn(relay, url);
  await space.look();
  setAppShown(false);
  try {
    lookNow();
    assert.equal(await waitWhileAway(relay, fromHex(space.first.recipientHex)), false);
    const started = Date.now();
    const waited = waitWhileAway(relay, fromHex(space.first.recipientHex));
    await new Promise((done) => setTimeout(done, 300));
    networkChanged();
    networkChanged();
    networkChanged();
    assert.equal(await waited, false);
    assert.ok(Date.now() - started < 10_000);
  } finally {
    setAppShown(true);
  }
});

test('old queues let go of early are deleted though the app stopped first; a move cut short finishes as the one it was', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const space = await spaceOn(relay, url);
  await space.look();
  // The first move makes the queue before the link's; each after leaves an old own one, the oldest let go of early.
  for (let i = 0; i < MAX_OLD_OWN + 2; i++) {
    await space.e2e.moveSoon();
    await space.mover.moveNow(relay);
  }
  let q = await space.queues.load();
  assert.equal(q.was.filter((w) => w.kind === 'own').length, MAX_OLD_OWN);
  assert.equal(q.early.length, 1);
  const early = q.early[0].queue;
  await sendMessage(relay, fromHex(early.senderHex), randomBytes(40));
  // Started again: it is still emptied and deleted.
  await space.look(space.again());
  q = await space.queues.load();
  assert.deepEqual(q.early, []);
  await assert.rejects(sendMessage(relay, fromHex(early.senderHex), randomBytes(40)), (error) => isQueueNotFound(error));

  // A move for an own queue the relay lost, cut short once its `next` was kept: it finishes as
  // such, and the queue before is read nowhere, though a kept contact was heard on none since.
  const bob = await E2E.open('space', 1, randomBytes(32));
  await space.e2e.addContact({ senderHex: toHex(randomBytes(24)), key: toBase64Url(bob.bundle), relayUrl: url }, (await space.own()).senderHex, { relay: url, relayKey: '' });
  const before = await space.own();
  const ids = await createQueue(relay);
  const next: Queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  await space.queues.update((d) => ({ ...d, next, nextWhy: 'lost' }));
  await space.look(space.again());
  q = await space.queues.load();
  assert.equal((await space.own()).senderHex, next.senderHex);
  assert.equal(q.next, null);
  assert.ok(!q.was.some((w) => w.queue.senderHex === before.senderHex));
  // One for a deletion, the same way, keeps the queue before read for its grace.
  await space.e2e.moveSoon();
  const ids2 = await createQueue(relay);
  await space.queues.update((d) => ({ ...d, next: { recipientHex: toHex(ids2.recipientId), senderHex: toHex(ids2.senderId) }, nextWhy: 'due' }));
  await space.look(space.again());
  assert.ok((await space.queues.load()).was.some((w) => w.kind === 'own' && w.queue.senderHex === next.senderHex));
});

test('a hidden place’s ring queue moves for rings that brought no call, with a later look when the relay is away at first, and each kept contact is told the new one', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const key = randomBytes(32);
  const e2e = await E2E.open(hiddenHolder(1), 0, key);
  const ids = await createQueue(relay);
  const first: Queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  await updateSpaceData(0, key, { url, ownQueue: first });
  const store: SpareStore = { of: {}, load: () => loadSpaceData(0, key), update: (patch) => updateSpaceData(0, key, patch) };
  const queues = placeQueues(0, 1, key);
  let away = true;
  let rings = 0;
  const ring = async () => {
    rings++;
    if (away) throw new Error('The relay cannot be reached.');
    return true;
  };
  const mover = new QueueMove({ e2e, queues, data: store, ring });
  const told: string[] = [];
  const look = (m = mover) => m.look({ own: relay, found: { taken: 0, junk: 0 }, take: async () => ({ junk: false }), tell: async (identity) => void told.push(identity), shows: false });
  // Bob is a kept contact of the place.
  const bob = await E2E.open('space', 1, randomBytes(32));
  const { identity: bobId } = await e2e.addContact({ senderHex: toHex(randomBytes(24)), key: toBase64Url(bob.bundle), relayUrl: url }, first.senderHex, { relay: url, relayKey: '' });
  await look();
  assert.deepEqual(told, []);
  // Away: due, and tried again with each look, from what is kept, after a new start too.
  assert.equal(await mover.ringMove(), false);
  assert.equal((await queues.load()).ringDue, true);
  await look(new QueueMove({ e2e, queues, data: store, ring }));
  assert.deepEqual([rings, told], [2, []]);
  away = false;
  await look();
  assert.equal(rings, 3);
  assert.equal((await queues.load()).ringDue, false);
  assert.deepEqual(told, [bobId]);
  assert.equal(e2e.record(bobId)!.ringTell, undefined);
  assert.equal(e2e.record(bobId)!.told, undefined, 'the own queue was told no one');
  await look();
  assert.deepEqual(told, [bobId]);
  // Reached at once: moved, and told with the next look.
  assert.equal(await mover.ringMove(), true);
  await look();
  assert.deepEqual(told, [bobId, bobId]);
});

test('a backup from before this version put back after moves says a later `qa` than any move made since, and every kept contact is told it, so they write where it reads', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const where = { relay: url, relayKey: '' };
  const space = await spaceOn(relay, url);
  await space.look();
  // Bob talks with the space, on this version.
  const bob = await E2E.open('space', 1, randomBytes(32));
  const { identity: bobId } = await space.e2e.addContact({ senderHex: toHex(randomBytes(24)), key: toBase64Url(bob.bundle), relayUrl: url }, space.first.senderHex, where);
  const hello = space.e2e.pending()[0];
  const spaceId = (await bob.receive(hello.first)) as Received & { identity: string };
  await space.e2e.firstSent(bobId);
  await bob.acceptRequest(spaceId.identity);
  const toBob = async (e2e: E2E, from: string) => bob.receive((await e2e.seal(bobId, '', from, { at: where })).packet);
  const bobWrites = () => bob.record(spaceId.identity)!.sender;
  // The space moves twice, and Bob follows.
  for (let i = 0; i < 2; i++) {
    await space.e2e.moveSoon();
    await space.mover.moveNow(relay);
    await toBob(space.e2e, (await space.own()).senderHex);
  }
  const moved = await space.own();
  assert.equal(bobWrites(), moved.senderHex);
  const held = bob.record(spaceId.identity)!.qa!;
  assert.ok(held > FIRST_QA);

  // A backup made before this version is put back: the space reads on its first queue again, with no queues entry.
  const restoredMark = 'erevos.restored';
  try {
    await updateSpaceData(0, space.key, { ownQueue: space.first });
    await space.queues.update(() => ({ ...EMPTY_QUEUES }));
    await markRestore();
    const e2e = await E2E.open('space', 0, space.key);
    const data: SpareStore = { of: {}, load: () => loadSpaceData(0, space.key), update: (patch) => updateSpaceData(0, space.key, patch) };
    space.told.length = 0;
    await space.look(new QueueMove({ e2e, queues: space.queues, data }));
    const q = await space.queues.load();
    assert.equal(q.now?.queue.senderHex, space.first.senderHex);
    assert.ok(q.moved > held, 'later than any move made after the backup');
    // Bob is told where it reads, and follows it.
    assert.deepEqual(space.told, [bobId]);
    await toBob(e2e, space.first.senderHex);
    assert.equal(bobWrites(), space.first.senderHex);
  } finally {
    secureStore.delete(restoredMark);
  }
});

// Alice's space on a real relay, and Bob, with his chats and what they keep, who talks with her and
// holds a message for her for later (`at`), for where she reads now. `follow`: Alice moves, and
// tells him so in a message he takes.
async function holding(relay: Relay, url: string, at: number) {
  const where = { relay: url, relayKey: '' };
  const alice = await spaceOn(relay, url);
  await alice.look();
  const bobKey = randomBytes(32);
  const bob = { e2e: await E2E.open('space', 1, bobKey), history: await History.open('space', 1, bobKey) };
  const ids = await createQueue(relay);
  const mine: Queue = { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) };
  const { identity: aliceId } = await bob.e2e.addContact({ senderHex: alice.first.senderHex, key: toBase64Url(alice.e2e.bundle), relayUrl: url }, mine.senderHex, where);
  const asked = (await alice.e2e.receive(bob.e2e.pending()[0].first)) as Received & { identity: string };
  await bob.e2e.firstSent(aliceId);
  await alice.e2e.acceptRequest(asked.identity);
  const follow = async () => {
    await alice.e2e.moveSoon();
    const now = (await alice.mover.moveNow(relay))!.queue;
    await bob.e2e.receive((await alice.e2e.seal(asked.identity, '', now.senderHex, { at: where })).packet);
    assert.equal(bob.e2e.queueOf(aliceId)!.sender, now.senderHex);
    return now;
  };
  const place = (sends: Relay = relay): SendPlace => ({ sends, own: relay, senderHex: mine.senderHex, here: where, ownKey: '', relayUp: true });
  const peer = `contact:${aliceId}`;
  const tag = toHex(randomBytes(6));
  await follow();
  await bob.history.add({ peer, text: 'later', mine: true, at, tag, mark: WAITING });
  const [held] = await sendWaiting(bob, place());
  assert.ok(held.held);
  return { alice, bob, aliceId, follow, place, peer, tag, held: () => bob.history.messages().find((m) => m.tag === tag)!.held! };
}

test('what is held anew for a contact who moved is held once though two looks run at once, what cannot be taken back is dropped later, a deletion under way leaves nothing held, and a message held twice shows once', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const at = Date.now() + 15_000;
  const { alice, bob, aliceId, follow, place, peer, tag, held } = await holding(relay, url, at);

  // She moves: two looks hold it anew at once, and both are the one hold; the one before is taken back.
  let before = held();
  const third = await follow();
  const [a, b] = await Promise.all([holdAgain(bob, place()), holdAgain(bob, place())]);
  assert.equal(a.length, 1);
  assert.deepEqual(b, a);
  assert.equal(a[0].heldFor, third.senderHex);
  assert.equal(await takeBack(relay, before), false);

  // Held on a backup relay that cannot be reached now: the one before is kept to drop later.
  assert.equal(await takeBack(relay, a[0].held!), true);
  const away = 'ws://127.0.0.1:9';
  const unreached = { id: toHex(randomBytes(16)), relay: away };
  await bob.history.heldAgain(peer, tag, unreached, 'f'.repeat(48));
  const [anew] = await holdAgain(bob, place({ url, backup: { url: away } }));
  assert.equal(anew.heldFor, third.senderHex);
  assert.deepEqual(bob.e2e.undropped().map((u) => u.id), [unreached.id]);
  await bob.e2e.dropped([unreached.id]);

  // Two holds of the same message reach her, as when one held before went all the same: she keeps
  // it once, by its tag.
  before = held();
  const soon = { ...bob.history.messages().find((m) => m.tag === tag)!, at: Date.now() + 3000 };
  const twice = [await holdLater(bob.e2e, place(), aliceId, soon), await holdLater(bob.e2e, place(), aliceId, soon)];
  const chats = { e2e: alice.e2e, history: await History.open('space', 0, alice.key), voiceParts: new VoiceAssembler() };
  await new Promise((r) => setTimeout(r, 5000));
  let came = 0;
  for (let bytes = await receiveMessage(relay, fromHex(third.recipientHex)); bytes; bytes = await receiveMessage(relay, fromHex(third.recipientHex))) {
    const received = await alice.e2e.receive(bytes);
    if (received.kind === 'message' && received.text === 'later') came++;
    await keepReceived(chats, received);
  }
  assert.equal(came, 2);
  assert.equal(chats.history.messages().filter((m) => m.tag === tag).length, 1);
  for (const h of twice) assert.equal(await takeBack(relay, h.held), false);

  // She moves again, and Bob deletes her while a look holds it anew: nothing stays held for her.
  const fourth = await follow();
  let sealed!: () => void;
  const wasSealed = new Promise<void>((r) => (sealed = r));
  const seal = bob.e2e.seal.bind(bob.e2e);
  bob.e2e.seal = async (...args: Parameters<E2E['seal']>) => {
    const out = await seal(...args);
    sealed();
    return out;
  };
  const running = holdAgain(bob, place());
  await wasSealed;
  const kept = heldFor(bob.history, aliceId);
  await bob.e2e.deleteContact(aliceId, { held: kept });
  // The look's new hold lands before her chat is cleared.
  assert.deepEqual(await running, []);
  const more = await heldAfter(bob, aliceId, kept);
  assert.equal(more.length, 1);
  await bob.history.clear(peer);
  await dropHeld(bob.e2e, relay);
  assert.deepEqual(bob.e2e.undropped(), []);
  for (const h of [before, ...kept, ...more]) assert.equal(await takeBack(relay, h), false);
  await new Promise((r) => setTimeout(r, at - Date.now() + 2000));
  for (const q of [third, fourth]) assert.equal(await receiveMessage(relay, fromHex(q.recipientHex)), null);
});

test('one held for later that the relay refuses after it was sealed is tried again ever less often, so a thousand looks seal it far fewer times than a conversation can skip', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const start = Date.now();
  const { bob, follow, place } = await holding(relay, url, start + 2 * 24 * 60 * 60_000);
  await follow();
  // The relay goes away after it answered the look: each try seals it, then fails.
  let seals = 0;
  const seal = bob.e2e.seal.bind(bob.e2e);
  bob.e2e.seal = async (...args: Parameters<E2E['seal']>) => {
    seals++;
    return seal(...args);
  };
  await stopRelay(url);
  for (let i = 0; i < 1100; i++) assert.deepEqual(await sendWaiting(bob, place(), start + i * 60_000), []);
  // Each half hour at most, once the waits grew: far below the core's MAX_SKIP (1000).
  assert.ok(seals > 2 && seals < 60, `sealed ${seals} times`);
});

test('an old queue a group still names is never deleted for being one too many: kept, read, and deleted once no group names it', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  let named = new Set<string>();
  const space = await spaceOn(relay, url, { groups: { renewAgain: async () => undefined, named: async () => named } });
  await space.look();
  // The first move makes the queue before the link's; the own queue the second made, a group names.
  const owns: Queue[] = [];
  for (let i = 0; i < MAX_OLD_OWN + 2; i++) {
    owns.push(await space.own());
    await space.e2e.moveSoon();
    await space.mover.moveNow(relay);
  }
  const groupsQueue = owns[1];
  named = new Set([groupsQueue.senderHex]);
  let q = await space.queues.load();
  assert.ok(q.early.some((w) => w.queue.senderHex === groupsQueue.senderHex));
  // Looks after, started again too: it stays, and the relay keeps it.
  await space.look(space.again());
  await space.look(space.again());
  q = await space.queues.load();
  assert.deepEqual(q.early.map((w) => w.queue.senderHex), [groupsQueue.senderHex]);
  await sendMessage(relay, fromHex(groupsQueue.senderHex), randomBytes(40));
  // No group names it any more: it goes.
  named = new Set();
  await space.look(space.again());
  q = await space.queues.load();
  assert.deepEqual(q.early, []);
  await assert.rejects(sendMessage(relay, fromHex(groupsQueue.senderHex), randomBytes(40)), (error) => isQueueNotFound(error));
});

test('a batch of requests on the queue the link names is taken whole, though only a few first packets are opened at once; a flood of made-up ones counts as junk unopened', { skip: !coreReady || !relayReady, timeout: 120_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const where = { relay: url, relayKey: '' };
  const space = await spaceOn(relay, url);
  const opened: Uint8Array[] = [];
  const look = () =>
    space.mover.look({
      own: relay,
      found: { taken: 0, junk: 0 },
      take: async (bytes) => {
        opened.push(bytes);
        try {
          return tookOf(await space.e2e.receive(bytes, { old: true }));
        } catch {
          return { junk: true };
        }
      },
      tell: async () => undefined,
      shows: false,
    });
  await look();
  // The first move: the link names a queue of its own from then on.
  await space.e2e.moveSoon();
  await space.mover.moveNow(relay);
  const link = (await space.queues.load()).link!.queue;
  assert.equal(link.senderHex, space.first.senderHex);
  // Twelve people ask through the link before the next look: each is a request after it.
  const asking = async (n: number) => {
    const e2e = await E2E.open('space', 10 + n, randomBytes(32));
    await e2e.addContact({ senderHex: link.senderHex, key: toBase64Url(space.e2e.bundle), relayUrl: url }, toHex(randomBytes(24)), where);
    return e2e.pending()[0].first;
  };
  for (let n = 0; n < 12; n++) await sendMessage(relay, fromHex(link.senderHex), await asking(n));
  await look();
  assert.equal(space.e2e.contacts().filter((c) => c.request).length, 12);
  // Made-up first packets, a whole batch each look: a few opened, the rest counted as junk, and
  // three such looks give the link a queue of its own anew.
  const made = await asking(12);
  const fake = () => Uint8Array.from([...made.subarray(0, made.length - 16), ...randomBytes(16)]);
  const notes: string[] = [];
  for (let i = 0; i < 3; i++) {
    for (let n = 0; n < 50; n++) await sendMessage(relay, fromHex(link.senderHex), fake());
    opened.length = 0;
    notes.push(...(await look()).notes);
    assert.ok(opened.length < 10, `opened ${opened.length}`);
  }
  assert.equal(notes.length, 1);
  assert.notEqual((await space.queues.load()).link!.queue.senderHex, link.senderHex);
  assert.equal(space.e2e.contacts().filter((c) => c.request).length, 12);
});

test('a queue a phone nearby read for this one moves once the relay answers here, and the note says so', { skip: !coreReady || !relayReady, timeout: 60_000 }, async () => {
  files.clear();
  const url = await startRelay();
  const relay = { url };
  const space = await spaceOn(relay, url);
  await space.look();
  const before = await space.own();
  await space.mover.bridged();
  assert.ok((await space.queues.load()).bridged);
  const news = await space.look();
  const after = await space.own();
  assert.notEqual(after.senderHex, before.senderHex);
  assert.equal((await space.queues.load()).bridged, undefined);
  assert.ok(news.notes.some((note) => note.includes('phone nearby')));
  // Once moved, the next look moves nothing.
  await space.look();
  assert.equal((await space.own()).senderHex, after.senderHex);
});
