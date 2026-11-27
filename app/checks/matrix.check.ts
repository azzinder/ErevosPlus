// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Matrix accounts (lib/matrix.ts) against a small homeserver played here, with the real core built
// to WebAssembly for the keys (crates/erevos-matrix): signing in publishes the device's keys and,
// for an account without them, cross-signing keys, asking the password again as servers do; a chat
// started with someone is encrypted, they see the invite, join, and read what is sent; the server
// keeps only ciphertext; each side reads the other and its own; the state survives being kept as
// JSON between every step, as the app keeps it; a message the server gives again under another ID
// does not show twice; a device that signs in later gets the room's key for what comes after, and
// what came before stays locked to it; reactions, answers, changes and messages taken back go both
// ways, answers and changes encrypted, their relations and reactions readable to the server as
// Matrix and Element have them; older messages come when asked, from where a cut sync left them,
// to the room's first, with what was done to them later.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';

import { setCurrentSpace } from '../lock/keys';
import { loadMatrix } from '../lock/matrix-data';
import { markRestore } from '../lock/restored';
import { setCore, type Core } from '../lib/core';
import { randomBytes } from '../lib/crypto';
import { setThroughTor } from '../lib/relay';
import {
  core,
  syncApply,
  createGroup,
  defaultMatrixHttp,
  inviteToRoom,
  deleteMessage,
  findHomeserver,
  isMatrixId,
  loadEarlier,
  matrixThroughTor,
  matrixWayOf,
  matrixTyping,
  markRead as matrixMarkRead,
  newSinceRead,
  readByAll,
  readersOf,
  joinRoom,
  roomList,
  sendChange,
  sendContent,
  sendEvent,
  sendReaction,
  sendReply,
  takeBackReaction,
  sendStateEvent,
  fetchOwnAvatar,
  loginWays,
  signInWithToken,
  ssoLink,
  roomAvatar,
  sendText,
  sendTyping,
  setOwnAvatar,
  sendToDeviceSealed,
  setCallHandler,
  setLegacyCallHandler,
  setMatrixHttp,
  signIn,
  startChat,
  sync,
  type CallEvent,
  type MatrixRequest,
  type MatrixState,
} from '../lib/matrix';
import { ChangedFileError, decryptFile, encryptFile, fetchFile, fetchPicture, MATRIX_MOST, MatrixFileTooLargeError, mimeOfName, sendFile, uploadPicture } from '../lib/matrix-media';
import { inboxParts, matrixInboxRows, showsIn } from '../lib/inbox';
import { backUpKeys, keyOfRecovery, recoveryKeyOf, setUpRecovery, takeGiven, unlockRecovery, WrongRecoveryError } from '../lib/matrix-backup';
import { loginToken } from '../lib/matrix-account';
import { qrBytes, readMatrixQr } from '../lib/matrix-qr';
import { acceptVerification, confirmScanned, confirmVerification, isVerified, requestVerification, scanCode, verifications, verifyByEmoji } from '../lib/matrix-verify';
import { matrixNow, matrixRead, matrixSignIn, matrixUnread, runMatrix, stopMatrix } from '../lib/matrix-store';
import { onNetworkMessage, onNetworkRead } from '../lib/network-notices';
import { waveformBars, waveformOf } from '../lib/voice';
import { Homeserver, HS, PASSWORD, type Json } from './matrix-server';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
// A core built before Matrix has no `matrix` call: built again, it has.
const coreReady = existsSync(built) && typeof (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>).matrix === 'function';
if (!coreReady) console.log('Skipping the Matrix checks: build the core first with node checks/build-core.mjs');

const server = new Homeserver();

// Each step keeps the state as the app does: as JSON, then read back.
const kept = (state: MatrixState): MatrixState => JSON.parse(JSON.stringify(state)) as MatrixState;

let wasmCore: Core | null = null;

before(() => {
  if (!coreReady) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  wasmCore = Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => fn(...args)])) as unknown as Core;
  setCore(wasmCore);
  setMatrixHttp(async (request) => server.answer(request));
});

after(() => setCore(null));

test('Matrix IDs and homeservers', { skip: !coreReady }, async () => {
  assert.ok(isMatrixId('@nekten:matrix.org'));
  assert.ok(!isMatrixId('nekten'));
  assert.equal(await findHomeserver('@nekten:matrix.example.org'), HS);
  assert.equal(await findHomeserver('https://matrix.example.org/'), HS);
});

test('a wrong password signs nobody in', { skip: !coreReady }, async () => {
  await assert.rejects(signIn(HS, 'alice', 'wrong'), /Invalid password/);
});

test('two people chat encrypted, and a device that comes later reads only from then on', { skip: !coreReady }, async () => {
  let alice = kept(await signIn(HS, '@alice:example.org', PASSWORD));
  let bob = kept(await signIn(HS, 'bob', PASSWORD));
  assert.equal(alice.userId, '@alice:example.org');

  // Cross-signing was set up with the password asked again, and signs Alice's device.
  assert.ok(alice.crossSigning);
  const aliceKeys = server.deviceKeys.get(alice.userId)!.get(alice.deviceId)!;
  assert.equal(Object.keys(aliceKeys.signatures[alice.userId]).length, 2);
  assert.ok(server.master.has(alice.userId));

  const room = await startChat(alice, '@bob:example.org');
  alice = kept(alice);
  assert.ok(room.encrypted);
  assert.deepEqual(server.direct.get(alice.userId), { '@bob:example.org': [room.id] });

  await sync(bob, 0);
  bob = kept(bob);
  assert.equal(bob.rooms[room.id].invitedBy, alice.userId);
  assert.equal(roomList(bob)[0].id, room.id);
  await joinRoom(bob, room.id);
  await sync(bob, 0);
  bob = kept(bob);

  await sync(alice, 0);
  const first = await sendText(alice, room.id, 'γεια σου, Bob');
  alice = kept(alice);
  assert.equal(first.state, undefined);
  // The server holds ciphertext only.
  assert.ok(!JSON.stringify(server.log).includes('γεια'));
  const onServer = server.log.find((l) => l.event.event_id === first.id)!.event;
  assert.equal(onServer.type, 'm.room.encrypted');

  assert.ok(await sync(bob, 0));
  bob = kept(bob);
  assert.deepEqual(
    bob.rooms[room.id].messages.map((m) => [m.sender, m.text]),
    [[alice.userId, 'γεια σου, Bob']],
  );

  await sendText(bob, room.id, 'καλώς σε βρήκα');
  bob = kept(bob);
  await sync(alice, 0);
  await sync(bob, 0);
  alice = kept(alice);
  bob = kept(bob);
  const texts = (s: MatrixState) => s.rooms[room.id].messages.map((m) => m.text);
  assert.deepEqual(texts(alice), ['γεια σου, Bob', 'καλώς σε βρήκα']);
  assert.deepEqual(texts(bob), ['γεια σου, Bob', 'καλώς σε βρήκα']);

  // The same ciphertext again under another ID is not read twice.
  server.replay(first.id);
  await sync(bob, 0);
  bob = kept(bob);
  assert.deepEqual(texts(bob).filter((t) => t === 'γεια σου, Bob').length, 1);

  // Bob signs in on a second device: Alice's next message reaches it, the earlier ones stay locked.
  let bob2 = kept(await signIn(HS, 'bob', PASSWORD));
  assert.equal(bob2.crossSigning, undefined);
  await sync(alice, 0);
  await sendText(alice, room.id, 'και στη νέα σου συσκευή');
  alice = kept(alice);
  await sync(bob2, 0);
  bob2 = kept(bob2);
  const seen = bob2.rooms[room.id].messages;
  assert.equal(seen.at(-1)!.text, 'και στη νέα σου συσκευή');
  assert.ok(seen.filter((m) => m.locked).length >= 2);
  // Bob's first device reads it too, with the key it already had.
  await sync(bob, 0);
  assert.equal(bob.rooms[room.id].messages.at(-1)!.text, 'και στη νέα σου συσκευή');
});

test('reactions, answers, changes and messages taken back go both ways; older messages come when asked', { skip: !coreReady }, async () => {
  let ann = kept(await signIn(HS, 'ann', PASSWORD));
  let ben = kept(await signIn(HS, 'ben', PASSWORD));
  const room = (await startChat(ann, ben.userId)).id;
  ann = kept(ann);
  await sync(ben, 0);
  await joinRoom(ben, room);
  await sync(ben, 0);
  await sync(ann, 0);
  ann = kept(ann);
  ben = kept(ben);
  const both = async () => {
    await sync(ann, 0);
    await sync(ben, 0);
    ann = kept(ann);
    ben = kept(ben);
  };
  const shown = (state: MatrixState) => state.rooms[room].messages;
  const first = await sendText(ann, room, 'first');
  await both();

  // A reaction, encrypted, its relation readable to the server; once only, and taken back.
  await sendReaction(ben, room, first.id, '👍');
  await sendReaction(ben, room, first.id, '👍');
  await both();
  assert.deepEqual(shown(ann)[0].reactions, { '👍': [ben.userId] });
  assert.deepEqual(shown(ben)[0].reactions, { '👍': [ben.userId] });
  const reaction = server.log.filter((l) => l.room === room && l.event.content['m.relates_to']?.rel_type === 'm.annotation');
  assert.deepEqual(
    reaction.map((l) => [l.event.type, l.event.content['m.relates_to'].event_id]),
    [['m.reaction', first.id]],
  );
  // A reaction goes plain, as Element sends it: its relation is all there is to it.
  assert.deepEqual(reaction[0].event.content, { 'm.relates_to': { rel_type: 'm.annotation', event_id: first.id, key: '👍' } });
  await takeBackReaction(ben, room, first.id, '👍');
  await both();
  assert.equal(shown(ann)[0].reactions, undefined);

  // An answer, and one from an older app that quotes what it answers.
  await sendReply(ben, room, 'an answer', first.id);
  await sendContent(ben, room, { msgtype: 'm.text', body: `> <${ann.userId}> first\n\nquoted answer`, 'm.relates_to': { 'm.in_reply_to': { event_id: first.id } } });
  await both();
  assert.deepEqual(
    shown(ann)
      .slice(1)
      .map((m) => [m.text, m.replyTo]),
    [
      ['an answer', first.id],
      ['quoted answer', first.id],
    ],
  );

  // Ann changes her message; Ben cannot change it for her.
  await sendChange(ann, room, first.id, 'first, changed');
  await sendEvent(ben, room, 'm.room.message', { msgtype: 'm.text', body: '* forged', 'm.new_content': { msgtype: 'm.text', body: 'forged' }, 'm.relates_to': { rel_type: 'm.replace', event_id: first.id } });
  await both();
  assert.deepEqual([shown(ben)[0].text, Boolean(shown(ben)[0].edited)], ['first, changed', true]);
  assert.equal(shown(ann)[0].text, 'first, changed');
  assert.equal(shown(ann).length, 3);
  await assert.rejects(sendChange(ben, room, first.id, 'mine now'), /Only a message of yours/);

  // Ann takes a message back: gone for both, and Ben may not take back hers.
  const second = await sendText(ann, room, 'a mistake');
  await both();
  await assert.rejects(deleteMessage(ben, room, second.id));
  await deleteMessage(ann, room, second.id);
  await both();
  assert.deepEqual([shown(ben).at(-1)!.text, shown(ben).at(-1)!.deleted], ['', true]);
  assert.deepEqual([shown(ann).at(-1)!.text, shown(ann).at(-1)!.deleted], ['', true]);

  // A sync cut to the latest leaves the older ones to fetch, from where it says, to the first;
  // a reaction fetched on a page before its message's waits for it.
  await sendReaction(ann, room, first.id, '❤');
  for (let i = 1; i <= 6; i++) await sendText(ann, room, `more ${i}`);
  server.timelineLimit = 3;
  try {
    ben.rooms[room].messages = [];
    delete ben.rooms[room].before;
    delete ben.rooms[room].reactionsBy;
    const since = ben.since;
    ben.since = undefined;
    await sync(ben, 0);
    ben = kept(ben);
    assert.ok(ben.since !== since || since === undefined);
    assert.deepEqual(
      shown(ben).map((m) => m.text),
      ['more 4', 'more 5', 'more 6'],
    );
    assert.ok(ben.rooms[room].before);
    let added = 0;
    while (!ben.rooms[room].start) added += await loadEarlier(ben, room, 4);
    ben = kept(ben);
    assert.equal(added, 7);
    assert.deepEqual(
      shown(ben).map((m) => (m.deleted ? '(taken back)' : m.text)),
      ['first, changed', 'an answer', 'quoted answer', '(taken back)', 'more 1', 'more 2', 'more 3', 'more 4', 'more 5', 'more 6'],
    );
    assert.equal(shown(ben)[1].replyTo, first.id);
    assert.deepEqual(shown(ben)[0].reactions, { '❤': [ann.userId] });
    assert.equal(ben.rooms[room].waiting, undefined);
    assert.equal(await loadEarlier(ben, room), 0);
  } finally {
    server.timelineLimit = Infinity;
  }
});

test('a group is made encrypted with its name, read by all who join, and someone is invited later', { skip: !coreReady }, async () => {
  let gina = kept(await signIn(HS, 'gina', PASSWORD));
  let hal = kept(await signIn(HS, 'hal', PASSWORD));
  let ivy = kept(await signIn(HS, 'ivy', PASSWORD));
  await assert.rejects(createGroup(gina, '  ', [hal.userId]));
  await assert.rejects(createGroup(gina, 'Club', ['hal']));
  const group = await createGroup(gina, 'Βιβλιοφάγοι', [hal.userId, hal.userId]);
  gina = kept(gina);
  assert.deepEqual([group.name, group.encrypted, group.direct], ['Βιβλιοφάγοι', true, false]);
  assert.equal(server.direct.get(gina.userId), undefined);
  await sync(hal, 0);
  hal = kept(hal);
  assert.equal(hal.rooms[group.id].invitedBy, gina.userId);
  await joinRoom(hal, group.id);
  await sync(hal, 0);
  hal = kept(hal);
  assert.equal(hal.rooms[group.id].name, 'Βιβλιοφάγοι');
  await sync(gina, 0);
  await sendText(gina, group.id, 'πρώτο βιβλίο;');
  gina = kept(gina);
  await sync(hal, 0);
  hal = kept(hal);
  assert.equal(hal.rooms[group.id].messages.at(-1)?.text, 'πρώτο βιβλίο;');
  assert.ok(!JSON.stringify(server.log).includes('βιβλίο;'));
  // Ivy comes later: invited, she joins and reads what comes after.
  await inviteToRoom(hal, group.id, ivy.userId);
  await sync(ivy, 0);
  ivy = kept(ivy);
  assert.equal(ivy.rooms[group.id].invitedBy, hal.userId);
  await joinRoom(ivy, group.id);
  await sync(ivy, 0);
  ivy = kept(ivy);
  await sync(gina, 0);
  await sendText(gina, group.id, 'καλώς ήρθες, Ivy');
  await sync(ivy, 0);
  assert.equal(ivy.rooms[group.id].messages.at(-1)?.text, 'καλώς ήρθες, Ivy');
});

test('who writes in a room shows as the homeserver says, never ourselves', { skip: !coreReady }, async () => {
  const alice = kept(await signIn(HS, 'alice', PASSWORD));
  const bob = kept(await signIn(HS, 'bob', PASSWORD));
  const room = await startChat(alice, bob.userId);
  await sync(bob, 0);
  await joinRoom(bob, room.id);
  server.typing.set(room.id, [bob.userId, alice.userId]);
  await sync(alice, 0);
  assert.deepEqual(matrixTyping(alice, room.id), [bob.userId]);
  assert.deepEqual(matrixTyping(alice, room.id, Date.now() + 120_000), []);
  server.typing.set(room.id, []);
  await sync(alice, 0);
  assert.deepEqual(matrixTyping(alice, room.id), []);
  server.typing.delete(room.id);
});

test('ours are read by all once every other member’s app says it read them or one after', { skip: !coreReady }, async () => {
  let gina = kept(await signIn(HS, 'gina', PASSWORD));
  let hal = kept(await signIn(HS, 'hal', PASSWORD));
  let ivy = kept(await signIn(HS, 'ivy', PASSWORD));
  const group = await createGroup(gina, 'Readers', [hal.userId, ivy.userId]);
  for (const who of [hal, ivy]) {
    await sync(who, 0);
    await joinRoom(who, group.id);
  }
  await sync(gina, 0);
  await sendText(gina, group.id, 'one');
  await sendText(gina, group.id, 'two');
  gina = kept(gina);
  const room = () => gina.rooms[group.id];
  const [one, two] = room().messages.slice(-2);
  assert.equal(readByAll(room(), one, gina.userId), false);
  // Hal reads up to the first, Ivy to the second: the first is read by all, the second by Ivy.
  await sync(hal, 0);
  await matrixMarkRead(hal, group.id);
  await sync(ivy, 0);
  await matrixMarkRead(ivy, group.id);
  hal = kept(hal);
  ivy = kept(ivy);
  const halRead = server.log.find((l) => l.event.event_id === one.id)!;
  server.readUpTo.set(`${hal.userId} ${group.id}`, halRead.seq);
  await sync(gina, 0);
  gina = kept(gina);
  assert.deepEqual(Object.keys(readersOf(room(), one, gina.userId)).sort(), [hal.userId, ivy.userId].sort());
  assert.equal(readByAll(room(), one, gina.userId), true);
  assert.deepEqual(Object.keys(readersOf(room(), two, gina.userId)), [ivy.userId]);
  assert.equal(readByAll(room(), two, gina.userId), false);
  assert.equal(room().readBy?.[gina.userId], undefined, 'never ourselves');
  // One read up to a message not kept here read ours once they said so after it went.
  const far = { ...room(), readBy: { [hal.userId]: { event: '$gone', ts: two.ts + 1 } } };
  assert.deepEqual(Object.keys(readersOf(far, two, gina.userId)), [hal.userId]);
  assert.deepEqual(readersOf({ ...far, readBy: { [hal.userId]: { event: '$gone', ts: two.ts - 1 } } }, two, gina.userId), {});
  server.readUpTo.clear();
});

test('we are said to write only when the account says so', { skip: !coreReady }, async () => {
  const alice = kept(await signIn(HS, 'alice', PASSWORD));
  const bob = kept(await signIn(HS, 'bob', PASSWORD));
  const room = await startChat(alice, bob.userId);
  await sync(bob, 0);
  await joinRoom(bob, room.id);
  await sync(alice, 0);
  assert.equal(await sendTyping(alice, room.id, true), false);
  assert.equal(server.typing.get(room.id), undefined);
  alice.sayTyping = true;
  assert.equal(await sendTyping(alice, room.id, true), true);
  await sync(bob, 0);
  assert.deepEqual(matrixTyping(bob, room.id), [alice.userId]);
  assert.equal(await sendTyping(alice, room.id, false), true);
  await sync(bob, 0);
  assert.deepEqual(matrixTyping(bob, room.id), []);
  assert.equal(await sendTyping(alice, '!nowhere:example.org', true), false);
  server.typing.delete(room.id);
});

test('profile pictures: ours is set and fetched, a room has one, a chat with one person shows theirs', { skip: !coreReady }, async () => {
  const alice = kept(await signIn(HS, 'alice', PASSWORD));
  const bob = kept(await signIn(HS, 'bob', PASSWORD));
  const picture = Uint8Array.from([0xff, 0xd8, 0xff, 1, 2, 3]);
  const mxc = await uploadPicture(alice, picture, 'image/jpeg');
  await setOwnAvatar(alice, mxc);
  assert.equal(alice.avatar, mxc);
  alice.avatar = undefined;
  await fetchOwnAvatar(alice);
  assert.equal(alice.avatar, mxc);
  assert.deepEqual([...(await fetchPicture(bob, mxc))], [...picture]);
  await setOwnAvatar(alice, '');
  await fetchOwnAvatar(alice);
  assert.equal(alice.avatar, undefined);
  const group = await createGroup(alice, 'Pictures', []);
  assert.equal(roomAvatar(alice, alice.rooms[group.id]), undefined);
  await sendStateEvent(alice, group.id, 'm.room.avatar', '', { url: mxc });
  await sync(alice, 0);
  assert.equal(roomAvatar(alice, alice.rooms[group.id]), mxc);
  // A chat with one person shows theirs; an address that is not an mxc one is none.
  const room = await startChat(alice, bob.userId);
  alice.rooms[room.id].members[bob.userId] = { membership: 'join', avatar: mxc };
  assert.equal(roomAvatar(alice, alice.rooms[room.id]), mxc);
  await sendStateEvent(alice, group.id, 'm.room.avatar', '', { url: 'https://example.org/a.png' });
  await sync(alice, 0);
  assert.equal(roomAvatar(alice, alice.rooms[group.id]), undefined);
});

test("a call's events reach the calls, opened: in the room, in its state, and to one device", { skip: !coreReady }, async () => {
  let hana = kept(await signIn(HS, 'hana', PASSWORD));
  let ivan = kept(await signIn(HS, 'ivan', PASSWORD));
  const room = await startChat(hana, '@ivan:example.org');
  await sync(ivan, 0);
  await joinRoom(ivan, room.id);
  await sync(ivan, 0);
  await sync(hana, 0);
  hana = kept(hana);
  ivan = kept(ivan);
  const got: CallEvent[] = [];
  const take = async (_state: MatrixState, event: CallEvent) => {
    got.push(event);
    return true;
  };
  // Element Call's go to the calls, the older one-to-one calls' to lib/matrix-voip.ts: both here.
  setCallHandler(take);
  setLegacyCallHandler(take);
  try {
    await sendEvent(hana, room.id, 'm.call.invite', { call_id: 'c1', version: '1', lifetime: 60000, offer: { type: 'offer', sdp: 'v=0 secret-offer' } });
    const member = `_${hana.userId}_${hana.deviceId}_m.call`;
    await sendStateEvent(hana, room.id, 'org.matrix.msc3401.call.member', member, { application: 'm.call', call_id: '', device_id: hana.deviceId, scope: 'm.room' });
    await sendToDeviceSealed(hana, 'io.element.call.encryption_keys', { [ivan.userId]: { '*': { keys: [{ index: 0, key: 'media-key-1' }], room_id: room.id } } });
    hana = kept(hana);
    // The ring and the media's key are encrypted on the way; the room's call members are its state, as Matrix has them.
    assert.ok(!JSON.stringify(server.log).includes('secret-offer'));
    assert.ok(!JSON.stringify([...server.toDevice.values()]).includes('media-key-1'));
    assert.ok(await sync(ivan, 0));
    ivan = kept(ivan);
    assert.deepEqual(
      got.map((e) => [e.type, e.sender, e.roomId, e.stateKey, e.senderDevice]),
      [
        ['io.element.call.encryption_keys', hana.userId, undefined, undefined, hana.deviceId],
        ['m.call.invite', hana.userId, room.id, undefined, undefined],
        ['org.matrix.msc3401.call.member', hana.userId, room.id, member, undefined],
      ],
    );
    assert.equal(got[0].content.keys && (got[0].content.keys as { key: string }[])[0].key, 'media-key-1');
    assert.equal((got[1].content.offer as { sdp: string }).sdp, 'v=0 secret-offer');
    assert.ok(got[1].eventId?.startsWith('$'));
    // A call's events are no message of their own.
    assert.deepEqual(ivan.rooms[room.id].messages, []);
  } finally {
    setCallHandler(null);
    setLegacyCallHandler(null);
  }
});

test('a photo goes encrypted, comes back whole, and a changed one is refused', { skip: !coreReady }, async () => {
  let alice = kept(await signIn(HS, '@alice:example.org', PASSWORD));
  let bob = kept(await signIn(HS, 'bob', PASSWORD));
  const room = await startChat(alice, '@bob:example.org');
  alice = kept(alice);
  await sync(bob, 0);
  await joinRoom(bob, room.id);
  await sync(bob, 0);
  bob = kept(bob);
  await sync(alice, 0);

  const photo = new TextEncoder().encode('JPEG of the sea at Kalamata '.repeat(40));
  await sendFile(alice, room.id, { name: 'sea.jpg', mime: 'image/jpeg', bytes: photo, w: 400, h: 300 });
  alice = kept(alice);
  // The homeserver keeps only ciphertext, and its name tells nothing.
  const stored = [...server.media.values()].at(-1)!;
  assert.equal(stored.length, photo.length);
  assert.ok(!new TextDecoder().decode(stored).includes('Kalamata'));
  assert.ok(!JSON.stringify(server.log).includes('sea.jpg'));

  await sync(bob, 0);
  bob = kept(bob);
  const message = bob.rooms[room.id].messages.at(-1)!;
  assert.equal(message.file?.kind, 'image');
  assert.equal(message.file?.name, 'sea.jpg');
  assert.deepEqual([message.file?.w, message.file?.h], [400, 300]);
  assert.deepEqual(await fetchFile(bob, message.file!), photo);

  // One byte changed on the server: the hash no longer matches.
  stored[0] ^= 1;
  await assert.rejects(fetchFile(bob, message.file!), ChangedFileError);
});

test('a voice message goes with how long it is and its waveform, read as Element sends them', { skip: !coreReady }, async () => {
  let alice = kept(await signIn(HS, '@alice:example.org', PASSWORD));
  let bob = kept(await signIn(HS, 'bob', PASSWORD));
  const room = await startChat(alice, '@bob:example.org');
  alice = kept(alice);
  await sync(bob, 0);
  await joinRoom(bob, room.id);
  await sync(bob, 0);
  bob = kept(bob);
  await sync(alice, 0);

  // Quiet, then loud, then quiet again, sampled ten times a second for three seconds.
  const levels = Array.from({ length: 30 }, (_, i) => (i >= 10 && i < 20 ? -6 : -70));
  const waveform = waveformOf(levels);
  assert.equal(waveform.length, 30);
  assert.equal(waveform[0], 0);
  assert.equal(waveform[15], 922);
  await sendFile(alice, room.id, { name: 'voice.m4a', mime: 'audio/mp4', bytes: new Uint8Array(400).fill(7), voice: { durationMs: 3000, waveform } });
  alice = kept(alice);
  assert.deepEqual(alice.rooms[room.id].messages.at(-1)!.file?.waveform, waveform);

  await sync(bob, 0);
  bob = kept(bob);
  const file = bob.rooms[room.id].messages.at(-1)!.file!;
  assert.equal(file.voice, true);
  assert.equal(file.duration, 3000);
  assert.deepEqual(file.waveform, waveform);
  // Drawn in fewer bars, each the loudest of its stretch.
  const bars = waveformBars(file.waveform, 10)!;
  assert.equal(bars.length, 10);
  assert.deepEqual(bars.slice(0, 3), [0, 0, 0]);
  assert.ok(bars[4] > 0.85 && bars[4] < 0.95);

  // One from another app with no waveform, or a broken one, is drawn as none.
  assert.equal(waveformBars(undefined, 10), null);
  assert.equal(waveformBars([512], 10), null);
  assert.deepEqual(waveformBars([2048, -5, 'x', 512], 4), [1, 0, 0, 0.5]);
  assert.deepEqual(waveformOf([NaN, Number.NEGATIVE_INFINITY]), []);
  assert.equal(waveformOf(Array.from({ length: 600 }, () => 0)).length, 100);
});

test('Matrix files: encrypted as other apps read them, too large ones refused', { skip: !coreReady }, async () => {
  const bytes = new Uint8Array(1000).map((_, i) => i % 251);
  const { data, file } = encryptFile(bytes);
  assert.equal(file.v, 'v2');
  assert.match(file.key.k, /^[A-Za-z0-9_-]{43}$/);
  assert.match(file.iv, /^[A-Za-z0-9+/]{22}$/);
  // The counter's lower half starts at zero.
  assert.ok(Buffer.from(file.iv + '==', 'base64').subarray(8).every((b) => b === 0));
  assert.deepEqual(decryptFile(data, file), bytes);
  const alice = kept(await signIn(HS, '@alice:example.org', PASSWORD));
  await assert.rejects(sendFile(alice, '!none:example.org', { name: 'big', mime: 'application/zip', bytes: new Uint8Array(MATRIX_MOST + 1) }), MatrixFileTooLargeError);
  assert.equal(mimeOfName('Report.PDF'), 'application/pdf');
});

test('Matrix rooms are rows of the home list, with a part of their own', () => {
  const state = {
    userId: '@me:example.org',
    rooms: {
      '!a:example.org': { id: '!a:example.org', name: 'Anna', members: {}, encrypted: true, direct: true, unread: 2, messages: [{ id: '$1', sender: '@anna:example.org', ts: 5000, text: 'hi\nthere' }] },
      '!b:example.org': { id: '!b:example.org', name: 'Club', members: { '@bo:example.org': { membership: 'join', name: 'Bo' } }, encrypted: true, direct: false, unread: 0, messages: [], invitedBy: '@bo:example.org' },
    },
  } as unknown as MatrixState;
  const rows = matrixInboxRows(state, 9000);
  const anna = rows.find((r) => r.identity === 'matrix:!a:example.org')!;
  assert.deepEqual([anna.last, anna.unread, anna.at, anna.mine, anna.network], ['hi\nthere', 2, 5000, false, 'matrix']);
  const club = rows.find((r) => r.invited)!;
  assert.deepEqual([club.last, club.unread, club.at], ['Invited by Bo', 1, 9000]);
  assert.deepEqual([showsIn(anna, 'matrix'), showsIn(anna, 'erevos'), showsIn(anna, 'sms'), showsIn(anna, 'all')], [true, false, false, true]);
  assert.deepEqual(inboxParts([], { matrix: true }), ['matrix']);
  assert.deepEqual(inboxParts(rows), ['matrix']);
});

test('two people check each other by emoji in their chat, and see the same seven', { skip: !coreReady }, async () => {
  const alice = await signIn(HS, '@dave:example.org', PASSWORD);
  const bob = await signIn(HS, 'erin', PASSWORD);
  const room = await startChat(alice, bob.userId);
  await sync(bob, 0);
  await joinRoom(bob, room.id);
  await sync(bob, 0);
  await sync(alice, 0);

  const asked = await requestVerification(alice, bob.userId, room.id);
  await sync(bob, 0);
  const theirs = verifications(bob).find((v) => v.id === asked.id)!;
  assert.equal(theirs.phase, 'asked');
  assert.equal(bob.rooms[room.id].messages.at(-1)!.text, 'Asked to check devices by emoji.');
  await acceptVerification(bob, asked.id);
  // Both can show and photograph codes: the person chooses; here, the emoji.
  await sync(alice, 0);
  assert.deepEqual([asked.phase, theirs.phase], ['choose', 'choose']);
  assert.ok(asked.qr && theirs.qr);
  await verifyByEmoji(alice, asked.id);
  // start → accept → key → key: each side syncs in turn.
  for (let i = 0; i < 3; i++) {
    await sync(alice, 0);
    await sync(bob, 0);
  }
  assert.equal(asked.phase, 'compare');
  assert.equal(theirs.phase, 'compare');
  assert.equal(asked.emoji!.length, 7);
  assert.deepEqual(asked.emoji, theirs.emoji);
  // Nothing of it is readable on the server.
  assert.ok(!JSON.stringify(server.log).includes('m.key.verification.key'));

  await confirmVerification(alice, asked.id, true);
  await sync(bob, 0);
  await confirmVerification(bob, asked.id, true);
  await sync(alice, 0);
  assert.equal(theirs.phase, 'done');
  assert.equal(asked.phase, 'done');
  assert.ok(isVerified(alice, bob.userId, bob.deviceId));
  assert.ok(isVerified(bob, alice.userId, alice.deviceId));
  assert.ok(alice.verified![bob.userId].master);
  // Alice's user-signing key signed Bob's master key (Dave and Erin, new here, made theirs).
  assert.equal(Object.keys(server.master.get(bob.userId)!.signatures[alice.userId] ?? {}).length, 1);

  // Pictures that do not match stop the check on both sides.
  const again = await requestVerification(bob, alice.userId, room.id);
  await sync(alice, 0);
  await acceptVerification(alice, again.id);
  await sync(bob, 0);
  await verifyByEmoji(bob, again.id);
  for (let i = 0; i < 3; i++) {
    await sync(bob, 0);
    await sync(alice, 0);
  }
  assert.equal(again.phase, 'compare');
  await confirmVerification(bob, again.id, false);
  await sync(alice, 0);
  assert.equal(again.phase, 'cancelled');
  assert.equal(verifications(alice).find((v) => v.id === again.id)!.phase, 'cancelled');
});

test('a new device of ours is checked by emoji from one that holds our cross-signing keys', { skip: !coreReady }, async () => {
  const carol = await signIn(HS, '@carol:example.org', PASSWORD);
  const carol2 = await signIn(HS, 'carol', PASSWORD);
  assert.ok(carol.crossSigning);
  assert.equal(carol2.crossSigning, undefined);
  const asked = await requestVerification(carol2, carol.userId);
  await sync(carol, 0);
  await sync(carol2, 0);
  const theirs = verifications(carol).find((v) => v.id === asked.id)!;
  assert.equal(theirs.deviceId, carol2.deviceId);
  await acceptVerification(carol, asked.id);
  await sync(carol2, 0);
  await verifyByEmoji(carol2, asked.id);
  for (let i = 0; i < 3; i++) {
    await sync(carol2, 0);
    await sync(carol, 0);
  }
  assert.deepEqual(asked.emoji, theirs.emoji);
  await confirmVerification(carol, asked.id, true);
  await sync(carol2, 0);
  await confirmVerification(carol2, asked.id, true);
  await sync(carol, 0);
  assert.deepEqual([asked.phase, theirs.phase], ['done', 'done']);
  assert.ok(isVerified(carol, carol.userId, carol2.deviceId));
  // The first device's self-signing key now signs the new one, so other apps see it checked.
  const signatures = server.deviceKeys.get(carol.userId)!.get(carol2.deviceId)!.signatures[carol.userId];
  assert.equal(Object.keys(signatures).length, 2);
});

test('two people check each other by QR code: one photographs the other\'s, the other confirms', { skip: !coreReady }, async () => {
  const alice = await signIn(HS, '@gail:example.org', PASSWORD);
  const bob = await signIn(HS, 'hugo', PASSWORD);
  const room = await startChat(alice, bob.userId);
  await sync(bob, 0);
  await joinRoom(bob, room.id);
  await sync(bob, 0);
  await sync(alice, 0);
  const asked = await requestVerification(alice, bob.userId, room.id);
  await sync(bob, 0);
  const theirs = verifications(bob).find((v) => v.id === asked.id)!;
  await acceptVerification(bob, asked.id);
  await sync(alice, 0);
  assert.deepEqual([asked.phase, theirs.phase], ['choose', 'choose']);
  // Mode 0: Gail's master key, then Hugo's as she knows it.
  const shown = asked.qr!;
  assert.equal(shown.mode, 0);
  assert.equal(shown.id, asked.id);
  const bytes = qrBytes(shown);
  assert.deepEqual(readMatrixQr(bytes), shown);
  assert.deepEqual([...bytes.subarray(0, 8)], [...new TextEncoder().encode('MATRIX'), 2, 0]);
  // A code of another check, or one with a key changed, is refused.
  await assert.rejects(scanCode(bob, asked.id, qrBytes({ ...shown, id: '$other' })));
  assert.equal(theirs.phase, 'choose');
  // Hugo photographs Gail's code and sends its secret back.
  await scanCode(bob, asked.id, bytes);
  assert.equal(theirs.phase, 'confirmed');
  await sync(alice, 0);
  assert.equal(asked.phase, 'scanned');
  // Nothing is trusted yet on either side.
  assert.ok(!isVerified(bob, alice.userId) && !isVerified(alice, bob.userId));
  await confirmScanned(alice, asked.id, true);
  assert.equal(asked.phase, 'done');
  assert.equal(alice.verified![bob.userId].master, shown.second);
  await sync(bob, 0);
  assert.equal(theirs.phase, 'done');
  assert.equal(bob.verified![alice.userId].master, shown.first);
  // Each user-signing key signed the other's master key.
  assert.equal(Object.keys(server.master.get(bob.userId)!.signatures[alice.userId] ?? {}).length, 1);
  assert.equal(Object.keys(server.master.get(alice.userId)!.signatures[bob.userId] ?? {}).length, 1);

  // A wrong secret stops the check; so does a code whose keys are not what the scanner knows.
  const again = await requestVerification(alice, bob.userId, room.id);
  await sync(bob, 0);
  await acceptVerification(bob, again.id);
  await sync(alice, 0);
  const forged = { ...again.qr!, second: shown.first };
  await scanCode(bob, again.id, qrBytes(forged));
  assert.equal(verifications(bob).find((v) => v.id === again.id)!.phase, 'cancelled');
});

test('two devices of ours check each other by QR code, either way', { skip: !coreReady }, async () => {
  const ida = await signIn(HS, '@ida:example.org', PASSWORD);
  const ida2 = await signIn(HS, 'ida', PASSWORD);
  assert.ok(ida.crossSigning && !ida2.crossSigning);
  // The new device shows mode 2 (its own key, then the master key), and the first photographs it.
  const asked = await requestVerification(ida2, ida.userId);
  await sync(ida, 0);
  const theirs = verifications(ida).find((v) => v.id === asked.id)!;
  await acceptVerification(ida, asked.id);
  await sync(ida2, 0);
  assert.equal(asked.qr!.mode, 2);
  assert.equal(theirs.qr!.mode, 1);
  await scanCode(ida, asked.id, qrBytes(asked.qr!));
  await sync(ida2, 0);
  assert.equal(asked.phase, 'scanned');
  await confirmScanned(ida2, asked.id, true);
  await sync(ida, 0);
  assert.deepEqual([asked.phase, theirs.phase], ['done', 'done']);
  assert.ok(isVerified(ida, ida.userId, ida2.deviceId));
  assert.ok(ida2.verified![ida.userId].master);
  // The first device signed the new one with its self-signing key.
  assert.equal(Object.keys(server.deviceKeys.get(ida.userId)!.get(ida2.deviceId)!.signatures[ida.userId]).length, 2);

  // The other way: the first shows mode 1 (master key, then the new device's), the new one photographs it.
  const ida3 = await signIn(HS, 'ida', PASSWORD);
  const second = await requestVerification(ida, ida.userId);
  await sync(ida3, 0);
  await sync(ida2, 0);
  const third = verifications(ida3).find((v) => v.id === second.id)!;
  await acceptVerification(ida3, second.id);
  await sync(ida, 0);
  const firstCode = second.qr!;
  assert.equal(firstCode.mode, 1);
  assert.equal(firstCode.second, (await core<{ ed25519: string }>('account_keys', { account: ida3.account })).ed25519);
  await scanCode(ida3, second.id, qrBytes(firstCode));
  await sync(ida, 0);
  await confirmScanned(ida, second.id, true);
  await sync(ida3, 0);
  assert.equal(third.phase, 'done');
  assert.equal(ida3.verified![ida.userId].master, firstCode.first);
  assert.ok(isVerified(ida, ida.userId, ida3.deviceId));
});

test('single sign-on: the ways are read, the browser\'s page named, and a one-use token signs a new device in', { skip: !coreReady }, async () => {
  const ways = await loginWays(HS);
  assert.deepEqual(ways, { password: true, sso: [{ id: 'oidc-lphl', name: 'LPHL' }] });
  assert.equal(
    ssoLink(HS, 'erevos://matrix-sso?sso=ab', 'oidc-lphl'),
    `${HS}/_matrix/client/v3/login/sso/redirect/oidc-lphl?redirectUrl=erevos%3A%2F%2Fmatrix-sso%3Fsso%3Dab`,
  );
  // Without a password to give, cross-signing keys are made only where the server takes them freely.
  server.loginTokens.set('lt1', '@jules:example.org');
  const jules = await signInWithToken(HS, 'lt1');
  assert.equal(jules.userId, '@jules:example.org');
  assert.equal(jules.crossSigning, undefined);
  await assert.rejects(signInWithToken(HS, 'lt1'));
  server.firstKeysFree = true;
  server.loginTokens.set('lt2', '@kim:example.org');
  const kim = await signInWithToken(HS, 'lt2');
  server.firstKeysFree = false;
  assert.ok(kim.crossSigning);
  assert.ok(server.master.has('@kim:example.org'));
});

test('Security Keys are written and read as Element does', () => {
  const key = new Uint8Array(32).map((_, i) => i * 7);
  const words = recoveryKeyOf(key);
  assert.match(words, /^Es[1-9A-HJ-NP-Za-km-z]{2}( [1-9A-HJ-NP-Za-km-z]{4}){11}$/);
  assert.deepEqual(keyOfRecovery(words), key);
  assert.deepEqual(keyOfRecovery(words.replace(/ /g, '')), key);
  // One letter changed fails the parity byte (or the prefix).
  const typo = words.slice(0, 10) + (words[10] === 'a' ? 'b' : 'a') + words.slice(11);
  assert.equal(keyOfRecovery(typo), null);
});

test('a Security Key set up on one device opens the cross-signing keys and earlier messages on a new one', { skip: !coreReady }, async () => {
  const frank = await signIn(HS, '@frank:example.org', PASSWORD);
  const gina = await signIn(HS, '@gina:example.org', PASSWORD);
  const words = await setUpRecovery(frank);
  assert.ok(keyOfRecovery(words));
  assert.ok(frank.backup);
  // The server keeps the secrets only encrypted.
  const stored = JSON.stringify([...server.accountData.values()]);
  assert.ok(!stored.includes(frank.crossSigning!.master) && !stored.includes(frank.backup.secret));

  const room = await startChat(frank, gina.userId);
  await sync(gina, 0);
  await joinRoom(gina, room.id);
  await sync(gina, 0);
  await sync(frank, 0);
  await sendText(frank, room.id, 'before the new phone');
  assert.equal(await backUpKeys(frank), 1);
  assert.equal(await backUpKeys(frank), 0);

  const frank2 = await signIn(HS, 'frank', PASSWORD);
  await sync(frank2, 0);
  assert.ok(frank2.rooms[room.id].messages.some((m) => m.locked));
  await assert.rejects(unlockRecovery(frank2, recoveryKeyOf(new Uint8Array(32))), WrongRecoveryError);
  const unlocked = await unlockRecovery(frank2, words);
  assert.deepEqual(unlocked, { crossSigning: true, backup: true, opened: 1 });
  assert.equal(frank2.rooms[room.id].messages.find((m) => m.text === 'before the new phone')?.sender, frank.userId);
  // Nothing in the backup proves who gave a key: what opens with one is marked not verified.
  assert.equal(frank2.rooms[room.id].messages.find((m) => m.text === 'before the new phone')?.unverified, true);
  assert.ok(Object.values(frank2.inbound).some((inbound) => inbound.backup));
  assert.equal(frank2.crossSigning!.master, frank.crossSigning!.master);
  // The new device signed itself with the account's self-signing key, so Element trusts it.
  assert.equal(Object.keys(server.deviceKeys.get(frank.userId)!.get(frank2.deviceId)!.signatures[frank.userId]).length, 2);
  await assert.rejects(setUpRecovery(frank2), /already has a Security Key/);
});

test('a computer linked to the phone signs in with a login token when the homeserver gives one, and takes the keys the phone gave', { skip: !coreReady }, async () => {
  const otto = await signIn(HS, '@otto:example.org', PASSWORD);
  const pia = await signIn(HS, '@pia:example.org', PASSWORD);
  await setUpRecovery(otto);
  const room = await startChat(otto, pia.userId);
  await sync(pia, 0);
  await joinRoom(pia, room.id);
  await sync(pia, 0);
  await sync(otto, 0);
  await sendText(otto, room.id, 'before the computer');
  assert.equal(await backUpKeys(otto), 1);

  // As most homeservers do, this one asks for the password again before it gives a token: none then.
  assert.equal(await loginToken(otto), null);
  server.givesLoginTokens = true;
  const token = await loginToken(otto);
  server.givesLoginTokens = false;
  assert.ok(token);
  const computer = await signInWithToken(HS, token!);
  assert.equal(computer.userId, otto.userId);
  assert.notEqual(computer.deviceId, otto.deviceId);
  // Good once.
  await assert.rejects(signInWithToken(HS, token!));
  await sync(computer, 0);
  assert.ok(computer.rooms[room.id].messages.some((m) => m.locked));

  // Keys that are not the account's are not taken.
  assert.deepEqual(await takeGiven(computer, pia.crossSigning, undefined), { crossSigning: false, backup: false, opened: 0 });
  assert.equal(computer.crossSigning, undefined);
  // The account's: the computer signs itself, as with a Security Key, and opens what came before.
  assert.deepEqual(await takeGiven(computer, otto.crossSigning, otto.backup!.secret), { crossSigning: true, backup: true, opened: 1 });
  assert.equal(computer.rooms[room.id].messages.find((m) => m.text === 'before the computer')?.sender, otto.userId);
  assert.equal(Object.keys(server.deviceKeys.get(otto.userId)!.get(computer.deviceId)!.signatures[otto.userId]).length, 2);
  // Taken already: nothing more is asked.
  assert.deepEqual(await takeGiven(computer, otto.crossSigning, otto.backup!.secret), { crossSigning: true, backup: true, opened: 0 });
});

async function until(done: () => boolean, what: string, ms = 5000): Promise<void> {
  const end = Date.now() + ms;
  while (!done()) {
    if (Date.now() > end) throw new Error(`Waited in vain for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

test('signed in, the first sync tells of nothing from before; a message after it does, and its reading', { skip: !coreReady }, async () => {
  let cleo = await signIn(HS, 'cleo', PASSWORD);
  const dan = await signIn(HS, 'dan', PASSWORD);
  const room = await startChat(cleo, '@dan:example.org');
  await sync(dan, 0);
  await joinRoom(dan, room.id);
  await sync(dan, 0);
  await sync(cleo, 0);
  await sendText(cleo, room.id, 'πριν');
  cleo = kept(cleo);

  const came: [string, number][] = [];
  const read: string[][] = [];
  const stopCame = onNetworkMessage((where, times) => came.push([where, times]));
  const stopRead = onNetworkRead((where) => read.push(where));
  // The homeserver here answers at once: a sync that would wait a while waits a little, as the
  // store syncs on and on.
  setMatrixHttp(async (request) => {
    if (request.url.includes('/sync?timeout=30000')) await new Promise((resolve) => setTimeout(resolve, 20));
    return server.answer(request);
  });
  setCurrentSpace(8, randomBytes(32));
  const where = `matrix:${room.id}`;
  try {
    runMatrix();
    await until(() => matrixNow().loaded, 'the account to load');
    await matrixSignIn('dan', PASSWORD, HS);
    await until(() => matrixUnread() === 1, 'the first sync');
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.deepEqual(came, []);

    await sync(cleo, 0);
    await sendText(cleo, room.id, 'τώρα');
    await until(() => matrixUnread() === 2, 'the new message');
    assert.deepEqual(came, [[where, 1]]);
    await matrixRead(room.id);
    assert.deepEqual(read, [[where]]);
    // The homeserver has it read too: the next sync says none.
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(matrixUnread(), 0);
    assert.deepEqual(came, [[where, 1]]);
  } finally {
    stopCame();
    stopRead();
    stopMatrix();
    setCurrentSpace(null);
    setMatrixHttp(async (request) => server.answer(request));
  }
});

test('restored from a backup, the account is let go of, never signed out, and signs in again', { skip: !coreReady }, async () => {
  const spaceKey = randomBytes(32);
  setMatrixHttp(async (request) => {
    if (request.url.includes('/sync?timeout=30000')) await new Promise((resolve) => setTimeout(resolve, 20));
    return server.answer(request);
  });
  setCurrentSpace(9, spaceKey);
  try {
    runMatrix();
    await until(() => matrixNow().loaded, 'the account to load');
    await matrixSignIn('fay', PASSWORD, HS);
    stopMatrix();
    await new Promise((resolve) => setTimeout(resolve, 700));
    // Loaded again with no restore, it is as it was.
    runMatrix();
    await until(() => matrixNow().loaded, 'the account again');
    assert.equal(matrixNow().state?.userId, '@fay:example.org');
    stopMatrix();
    await new Promise((resolve) => setTimeout(resolve, 700));

    // A backup of it restored here: its device is the backup's, so it goes, and the space signs in again.
    const asked = server.asked.length;
    await markRestore();
    runMatrix();
    await until(() => matrixNow().loaded, 'the account after the restore');
    assert.equal(matrixNow().state, null);
    assert.match(matrixNow().problem, /sign in to Matrix again/);
    assert.equal(await loadMatrix(9, spaceKey), null);
    assert.ok(!server.asked.slice(asked).some((line) => line.includes('/logout')), 'the other phone’s device is not signed out');
    await matrixSignIn('fay', PASSWORD, HS);
    assert.equal(matrixNow().state?.userId, '@fay:example.org');
  } finally {
    stopMatrix();
    setCurrentSpace(null);
    setMatrixHttp(async (request) => server.answer(request));
  }
});

test("a Matrix account goes through Tor as its own choice says, and always in INVISIBLE: Off unless chosen, a room «Through Tor» makes it Always", async () => {
  const sent: { head: Json; body: string }[] = [];
  const fake = {
    torRequest: async () => new Uint8Array(0),
    torStart: async () => undefined,
    torStatus: async () => '{}',
    torStop: async () => undefined,
    torOpen: async () => new Uint8Array(0),
    torCall: async () => new Uint8Array(0),
    torClose: async () => undefined,
    torHttp: async (head: string, body: Uint8Array) => {
      sent.push({ head: JSON.parse(head) as Json, body: new TextDecoder().decode(body) });
      return new Uint8Array([0x01, 0x91, ...new TextEncoder().encode('{"errcode":"M_FORBIDDEN"}')]);
    },
  } as unknown as Core;
  setCore(fake);
  setThroughTor('all');
  try {
    // As the space, with Everything: through Tor.
    const answer = await defaultMatrixHttp({ method: 'POST', url: `${HS}/_matrix/client/v3/login`, body: { a: 1 }, token: 'tok', tor: 'space' });
    assert.deepEqual(answer, { status: 401, json: { errcode: 'M_FORBIDDEN' } });
    assert.equal(sent.length, 1);
    assert.deepEqual(sent[0].head, { method: 'POST', url: `${HS}/_matrix/client/v3/login`, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' } });
    assert.equal(sent[0].body, '{"a":1}');
    assert.ok(matrixThroughTor('space'));
    // Off, the default, still through Tor while the space is INVISIBLE (Everything).
    assert.equal(matrixThroughTor(), true);
    assert.equal(matrixWayOf({ homeserver: HS }), 'never');
    // With the way 'messages' and Tor not ready yet, As the space goes straight; Always still through Tor.
    setThroughTor('messages');
    assert.equal(matrixThroughTor('space'), false);
    assert.ok(matrixThroughTor('always'));
    await defaultMatrixHttp({ method: 'GET', url: `${HS}/y`, tor: 'always' });
    assert.equal(sent.length, 2);
    // A room «Through Tor» makes the whole account Always, whatever it chose.
    assert.equal(matrixWayOf({ homeserver: HS, tor: 'never', rooms: { '!a': {}, '!b': { tor: true } } }), 'always');
    assert.equal(matrixWayOf({ homeserver: HS, tor: 'space', rooms: { '!a': {} } }), 'space');
    // With no Tor in the build, Always and the space's Everything send nothing, never straight.
    setCore({} as Core);
    await assert.rejects(defaultMatrixHttp({ method: 'GET', url: `${HS}/x`, tor: 'always' }), /Tor is not ready/);
    setThroughTor('all');
    await assert.rejects(defaultMatrixHttp({ method: 'GET', url: `${HS}/x`, tor: 'space' }), /Tor is not ready/);
    // INVISIBLE: even an account set to Off never goes straight.
    await assert.rejects(defaultMatrixHttp({ method: 'GET', url: `${HS}/x`, tor: 'never' }), /Tor is not ready/);
  } finally {
    setThroughTor('off');
    setCore(wasmCore);
  }
});


test("a room read here stays read until someone else writes after it, whatever the homeserver's count said before it heard", () => {
  const me = '@me:example.org';
  const state = { userId: me } as Parameters<typeof newSinceRead>[0];
  const room = { id: '!r:example.org', messages: [{ id: '$1', sender: '@ann:example.org', ts: 1000, text: 'hi' }] } as unknown as Parameters<typeof newSinceRead>[1];
  assert.equal(newSinceRead(state, room), true, 'never read here: the count stands');
  room.readTs = 1000;
  assert.equal(newSinceRead(state, room), false, 'nothing after the read');
  room.messages.push({ id: '$2', sender: me, ts: 2000, text: 'mine' } as (typeof room.messages)[number]);
  assert.equal(newSinceRead(state, room), false, 'only ours after it');
  room.messages.push({ id: '$3', sender: '@ann:example.org', ts: 3000, text: 'again' } as (typeof room.messages)[number]);
  assert.equal(newSinceRead(state, room), true, 'theirs after it');
});

test('in an encrypted room, what others write after the last read counts even when the homeserver says nothing of it', async () => {
  const me = '@me:example.org';
  const id = '!e:example.org';
  const state = {
    userId: me,
    since: 's1',
    rooms: { [id]: { id, name: 'Ann', members: {}, encrypted: true, direct: true, unread: 0, readTs: 1000, messages: [{ id: '$1', sender: '@ann:example.org', ts: 1000, text: 'old' }] } },
    outbound: {},
    devices: {},
    outdated: [],
    seen: {},
  } as unknown as MatrixState;
  const news = (events: Json[], count: number) => ({
    next_batch: 's2',
    device_one_time_keys_count: { signed_curve25519: 50 },
    device_unused_fallback_key_types: ['signed_curve25519'],
    rooms: { join: { [id]: { timeline: { events }, unread_notifications: { notification_count: count } } } },
  });
  const text = (eventId: string, sender: string, ts: number) => ({ type: 'm.room.message', event_id: eventId, sender, origin_server_ts: ts, content: { msgtype: 'm.text', body: 'hi' } });
  await syncApply(state, news([text('$2', '@ann:example.org', 2000), text('$3', '@ann:example.org', 3000)], 0) as unknown as Parameters<typeof syncApply>[1]);
  assert.equal(state.rooms[id].unread, 2, 'two came, the homeserver counted none');
  await syncApply(state, news([text('$4', me, 4000)], 0) as unknown as Parameters<typeof syncApply>[1]);
  assert.equal(state.rooms[id].unread, 0, 'ours from another device reads the room up to it');
  await syncApply(state, news([text('$5', '@ann:example.org', 5000)], 3) as unknown as Parameters<typeof syncApply>[1]);
  assert.equal(state.rooms[id].unread, 3, 'the homeserver counting them too counts each once');
  state.rooms[id].unread = 0;
  state.rooms[id].readTs = 5000;
  await syncApply(state, news([text('$5', '@ann:example.org', 5000)], 0) as unknown as Parameters<typeof syncApply>[1]);
  assert.equal(state.rooms[id].unread, 0, 'one already here and read does not count again');
  state.since = undefined as never;
  await syncApply(state, news([text('$6', '@ann:example.org', 6000)], 0) as unknown as Parameters<typeof syncApply>[1]);
  assert.equal(state.rooms[id].unread, 0, 'a first sync tells of nothing it brings');
});

test('an encrypted room read on another of our devices, or answered from it, is read here too', async () => {
  const me = '@me:example.org';
  const ann = '@ann:example.org';
  const id = '!e:example.org';
  const state = {
    userId: me,
    since: 's1',
    rooms: { [id]: { id, name: 'Ann', members: { [ann]: { membership: 'join' } }, encrypted: true, direct: true, unread: 0, readTs: 1000, messages: [{ id: '$1', sender: ann, ts: 1000, text: 'old' }] } },
    outbound: {},
    devices: {},
    outdated: [],
    seen: {},
  } as unknown as MatrixState;
  const news = (events: Json[], count: number, ephemeral: Json[] = []) => ({
    next_batch: 's2',
    device_one_time_keys_count: { signed_curve25519: 50 },
    device_unused_fallback_key_types: ['signed_curve25519'],
    rooms: { join: { [id]: { timeline: { events }, ephemeral: { events: ephemeral }, unread_notifications: { notification_count: count } } } },
  });
  type Sync = Parameters<typeof syncApply>[1];
  const text = (eventId: string, sender: string, ts: number) => ({ type: 'm.room.message', event_id: eventId, sender, origin_server_ts: ts, content: { msgtype: 'm.text', body: 'hi' } });
  const receipt = (eventId: string, kind: string, user: string, ts: number) => ({ type: 'm.receipt', content: { [eventId]: { [kind]: { [user]: { ts } } } } });
  await syncApply(state, news([text('$2', ann, 2000), text('$3', ann, 3000)], 0) as unknown as Sync);
  assert.equal(state.rooms[id].unread, 2, 'two came');
  await syncApply(state, news([], 0, [receipt('$3', 'm.read', me, 3500)]) as unknown as Sync);
  assert.equal(state.rooms[id].unread, 0, 'read in Element: our receipt clears it');
  await syncApply(state, news([text('$4', ann, 4000)], 0) as unknown as Sync);
  assert.equal(state.rooms[id].unread, 1, 'one more after that read counts');
  await syncApply(state, news([], 0, [receipt('$4', 'm.read.private', me, 4500)]) as unknown as Sync);
  assert.equal(state.rooms[id].unread, 0, 'a private receipt of ours clears it too');
  await syncApply(state, news([text('$5', ann, 5000), text('$6', ann, 6000)], 0) as unknown as Sync);
  assert.equal(state.rooms[id].unread, 2);
  await syncApply(state, news([text('$7', me, 7000)], 0) as unknown as Sync);
  assert.equal(state.rooms[id].unread, 0, 'an answer of ours from another device reads it');
  await syncApply(state, news([], 0, [receipt('$7', 'm.read', ann, 7500)]) as unknown as Sync);
  assert.equal(state.rooms[id].unread, 0, "someone else's receipt changes nothing of ours");
  assert.equal(state.rooms[id].readBy?.[ann]?.event, '$7');
});
