// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A hidden place's own accounts on XMPP, Matrix and Nostr (lib/place-networks.ts), with the real
// core built to WebAssembly: as its hidden chats open, the place's own account loads beside the
// space's and runs, apart from it. Its screens act on it (lib/network-place.ts) and the space's
// screens on the space's; each is kept sealed with its own key in its own value; what comes to the
// place tells nothing outside its hidden chats (no notice that names it, no count on the icon or the
// home list); and as the hidden chats close, it stops and is let go of, unless they receive while
// closed: then it stays connected, and what comes tells only of its place.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';

import { ALWAYS } from '../lock/chat-notify';
import { setCurrentSpace } from '../lock/keys';
import { loadMatrix } from '../lock/matrix-data';
import { loadNostrDm } from '../lock/nostr-dm-data';
import { loadXmpp } from '../lock/xmpp-data';
import { setCore, type Core } from '../lib/core';
import { randomBytes } from '../lib/crypto';
import { setOpenHiddenPlace, type OpenHiddenPlace } from '../lib/hidden-contacts';
import { defaultMatrixHttp, sendText, setMatrixHttp, signIn, startChat, sync } from '../lib/matrix';
import { followMatrixPlaces, matrixJoin, matrixNow, matrixSignIn, matrixUnread, runMatrix, stopMatrix } from '../lib/matrix-store';
import { networkUnreadAt, onNetworkMessage, onPlaceNetworkMessage } from '../lib/network-notices';
import { actingWhere, showWhere } from '../lib/network-place';
import { DEFAULT_INBOX, LOOKUP_RELAYS, npubOf } from '../lib/nostr-dm';
import { nostrWay, setNostrOpen } from '../lib/nostr-dm-net';
import { setThroughTor } from '../lib/relay';
import { nostrDmMake, nostrDmNow, nostrDmSend, nostrDmSetInbox, nostrDmSetAccountTor, nostrDmSetNotify, nostrDmSetTor, nostrDmTor, nostrDmStart, nostrDmUnread, runNostrDm, stopNostrDm } from '../lib/nostr-dm-store';
import { watchPlaceNetworks } from '../lib/place-networks';
import { sendXmppText } from '../lib/xmpp';
import { followXmppPlaces, runXmpp, setXmppConnect, stopXmpp, xmppNow, xmppSend, xmppSignIn, xmppUnread } from '../lib/xmpp-store';
import { Homeserver, HS, PASSWORD as MATRIX_PASSWORD } from './matrix-server';
import { FakeRelay } from './nostr-relay';
import { DOMAIN, PASSWORD, person, Server, settle } from './xmpp-server';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const wasm = existsSync(built) ? (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>) : {};
const coreReady = ['xmpp', 'matrix', 'nostrChat'].every((name) => typeof wasm[name] === 'function');
if (!coreReady) console.log('Skipping the hidden places’ network checks: build the core first with node checks/build-core.mjs');

before(() => {
  if (!coreReady) return;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => (fn as (...a: never[]) => unknown)(...args)])) as unknown as Core);
});
after(() => setCore(null));

async function until(done: () => boolean, what: string, ms = 5000): Promise<void> {
  const end = Date.now() + ms;
  while (!done()) {
    if (Date.now() > end) throw new Error(`Waited in vain for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

/** The hidden chats of `pocket` in `space`, open, as the chat screen lends them. */
function hiddenPlace(space: number, pocket: number, key: Uint8Array): OpenHiddenPlace {
  return { space, pocket, key, erevos: () => [], messages: () => [], open: () => undefined, takeName: async () => '' };
}

/** Does `act` as a screen of the hidden chats does: on the place's account. */
async function inPlace<T>(act: () => Promise<T>): Promise<T> {
  const gone = showWhere('place');
  try {
    assert.equal(actingWhere(), 'place');
    return await act();
  } finally {
    gone();
  }
}

test('the screen on top says whose account is acted on, the space’s once none is', () => {
  assert.equal(actingWhere(), 'space');
  const place = showWhere('place');
  const space = showWhere('space');
  assert.equal(actingWhere(), 'space');
  space();
  assert.equal(actingWhere(), 'place');
  // Gone twice is gone once.
  space();
  assert.equal(actingWhere(), 'place');
  place();
  assert.equal(actingWhere(), 'space');
});

test('XMPP: a hidden place has its own account, apart from the space’s, telling nothing outside', { skip: !coreReady }, async () => {
  const server = new Server();
  const ann = await person(server, 'ann');
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  const came: [string, number][] = [];
  const stopCame = onNetworkMessage((where, times) => came.push([where, times]));
  setXmppConnect(server.connect);
  setCurrentSpace(7, spaceKey);
  const stopWatching = watchPlaceNetworks();
  try {
    runXmpp();
    await until(() => xmppNow().loaded, 'the space’s account to load');
    await xmppSignIn(`ben@${DOMAIN}`, PASSWORD);
    await until(() => xmppNow().online && !!xmppNow().state?.omemo.published, 'the space’s account online, its keys out');
    // Nothing of a place before its hidden chats open.
    assert.equal(xmppNow('place').loaded, false);

    setOpenHiddenPlace(hiddenPlace(7, 2, placeKey));
    await until(() => xmppNow('place').loaded, 'the place’s account to load');
    assert.equal(xmppNow('place').state, null);
    await inPlace(() => xmppSignIn(`cat@${DOMAIN}`, PASSWORD));
    await until(() => xmppNow('place').online && !!xmppNow('place').state?.omemo.published, 'the place’s account online, its keys out');
    assert.equal(xmppNow().state?.jid, `ben@${DOMAIN}`);
    assert.equal(xmppNow('place').state?.jid, `cat@${DOMAIN}`);

    // Each sealed with its own key in its own value.
    assert.equal((await loadXmpp(7, spaceKey))?.jid, `ben@${DOMAIN}`);
    assert.equal((await loadXmpp(7, placeKey, 'hidden2'))?.jid, `cat@${DOMAIN}`);
    assert.equal(await loadXmpp(7, placeKey), null);
    assert.equal(await loadXmpp(7, spaceKey, 'hidden2'), null);

    // A message to the place: in its chats, and nowhere else.
    await sendXmppText(ann.state, ann.connection, `cat@${DOMAIN}`, 'στο κρυφό');
    await until(() => xmppNow('place').state?.chats[`ann@${DOMAIN}`]?.messages.length === 1, 'the place’s message');
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.deepEqual(came, []);
    assert.equal(xmppUnread(), 0);
    assert.equal(networkUnreadAt().size, 0);
    assert.equal(xmppNow().state?.chats[`ann@${DOMAIN}`], undefined);

    // One to the space tells, as before.
    await sendXmppText(ann.state, ann.connection, `ben@${DOMAIN}`, 'στον χώρο');
    await until(() => xmppUnread() === 1 && came.length === 1, 'the space’s message and its notice');
    assert.deepEqual(came, [[`xmpp:ann@${DOMAIN}`, 1]]);

    // What a screen of the hidden chats writes goes from the place's account, what another writes from the space's.
    await inPlace(() => xmppSend(`ann@${DOMAIN}`, 'από το κρυφό'));
    await xmppSend(`ann@${DOMAIN}`, 'από τον χώρο');
    await settle([ann]);
    assert.deepEqual(ann.state.chats[`cat@${DOMAIN}`].messages.map((m) => [m.text, m.mine]), [['στο κρυφό', true], ['από το κρυφό', false]]);
    assert.deepEqual(ann.state.chats[`ben@${DOMAIN}`].messages.map((m) => [m.text, m.mine]), [['στον χώρο', true], ['από τον χώρο', false]]);

    // The hidden chats close: the place's account goes, the space's stays.
    setOpenHiddenPlace(null);
    assert.equal(xmppNow('place').state, null);
    assert.equal(xmppNow('place').loaded, false);
    assert.equal(xmppNow().state?.jid, `ben@${DOMAIN}`);
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.ok(![...server.bound.keys()].some((full) => full.startsWith(`cat@${DOMAIN}/`)), 'the place’s account disconnected');
    assert.ok([...server.bound.keys()].some((full) => full.startsWith(`ben@${DOMAIN}/`)));
  } finally {
    setOpenHiddenPlace(null);
    stopWatching();
    stopCame();
    stopXmpp();
    setXmppConnect(undefined);
    setCurrentSpace(null);
    ann.connection.close();
  }
});

test('Matrix: a hidden place has its own account, apart from the space’s, telling nothing outside', { skip: !coreReady }, async () => {
  const server = new Homeserver();
  // The homeserver here answers at once: a sync that would wait a while waits a little.
  setMatrixHttp(async (request) => {
    if (request.url.includes('/sync?timeout=30000')) await new Promise((resolve) => setTimeout(resolve, 20));
    return server.answer(request);
  });
  const cleo = await signIn(HS, 'cleo', MATRIX_PASSWORD);
  await sync(cleo, 0);
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  const came: [string, number][] = [];
  const stopCame = onNetworkMessage((where, times) => came.push([where, times]));
  setCurrentSpace(8, spaceKey);
  const stopWatching = watchPlaceNetworks();
  try {
    runMatrix();
    await until(() => matrixNow().loaded, 'the space’s account to load');
    await matrixSignIn('dan', MATRIX_PASSWORD, HS);
    setOpenHiddenPlace(hiddenPlace(8, 0, placeKey));
    await until(() => matrixNow('place').loaded, 'the place’s account to load');
    await inPlace(() => matrixSignIn('eve', MATRIX_PASSWORD, HS));
    assert.equal(matrixNow().state?.userId, '@dan:example.org');
    assert.equal(matrixNow('place').state?.userId, '@eve:example.org');
    assert.equal((await loadMatrix(8, spaceKey))?.userId, '@dan:example.org');
    assert.equal((await loadMatrix(8, placeKey, 'hidden'))?.userId, '@eve:example.org');
    assert.equal(await loadMatrix(8, placeKey), null);

    // Cleo invites the place's account: the invitation is the place's alone.
    const room = await startChat(cleo, '@eve:example.org');
    await until(() => !!matrixNow('place').state?.rooms[room.id], 'the place’s invitation');
    await sendText(cleo, room.id, 'στο κρυφό');
    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.deepEqual(came, []);
    assert.equal(matrixUnread(), 0);
    assert.equal(networkUnreadAt().size, 0);
    assert.equal(matrixNow().state?.rooms[room.id], undefined);

    setOpenHiddenPlace(null);
    assert.equal(matrixNow('place').state, null);
    assert.equal(matrixNow().state?.userId, '@dan:example.org');
  } finally {
    setOpenHiddenPlace(null);
    stopWatching();
    stopCame();
    stopMatrix();
    setCurrentSpace(null);
    setMatrixHttp(defaultMatrixHttp);
  }
});

test('Nostr: a hidden place has its own key, apart from the space’s, telling nothing outside', { skip: !coreReady }, async () => {
  const relays = new Map<string, FakeRelay>();
  for (const url of new Set([...LOOKUP_RELAYS, ...DEFAULT_INBOX, 'wss://inbox.space.example', 'wss://inbox.place.example'])) relays.set(url, new FakeRelay(url));
  // Which connections went on a chat's own way (lib/nostr-dm-net.ts openNostrLink).
  const opened: [string, string | undefined][] = [];
  const choices: string[] = [];
  setNostrOpen(async (url, chat, choice) => {
    opened.push([url, chat]);
    choices.push(choice ?? '');
    const found = relays.get(url);
    if (!found) throw new Error(`No relay at ${url}`);
    return found.link();
  });
  const index = relays.get(LOOKUP_RELAYS[0])!;
  const listed = (key: string) => index.events.some((e) => e.kind === 10050 && e.pubkey === key);
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  const came: [string, number][] = [];
  const stopCame = onNetworkMessage((where, times) => came.push([where, times]));
  const placeCame: string[] = [];
  const stopPlaceCame = onPlaceNetworkMessage((_space, _pocket, where) => placeCame.push(where));
  setCurrentSpace(1, spaceKey);
  const stopWatching = watchPlaceNetworks();
  try {
    runNostrDm();
    await until(() => nostrDmNow().loaded, 'the space’s account to load');
    await nostrDmMake();
    await nostrDmSetInbox(['wss://inbox.space.example']);
    const space = nostrDmNow().state!.public;
    // A new key goes through no Tor until its owner chooses (lib/account-tor.ts).
    assert.equal(nostrDmNow().state!.tor, 'never');
    assert.equal(nostrDmTor(), 'never');
    assert.ok(choices.length > 0 && !choices.some((choice) => choice !== 'never'));
    // Chosen, its connections open again that way.
    const was = choices.length;
    await nostrDmSetAccountTor('space');
    await until(() => choices.length > was, 'the inbox read again');
    assert.ok(choices.slice(was).every((choice) => choice === 'space'));
    await nostrDmSetAccountTor('never');

    setOpenHiddenPlace(hiddenPlace(1, 3, placeKey));
    await until(() => nostrDmNow('place').loaded, 'the place’s account to load');
    assert.equal(nostrDmNow('place').state, null);
    await inPlace(async () => {
      await nostrDmMake();
      await nostrDmSetInbox(['wss://inbox.place.example']);
    });
    const place = nostrDmNow('place').state!.public;
    assert.notEqual(place, space);
    assert.equal(nostrDmNow().state!.public, space);
    assert.equal((await loadNostrDm(1, spaceKey))?.public, space);
    assert.equal((await loadNostrDm(1, placeKey, 'hidden3'))?.public, place);
    assert.equal(await loadNostrDm(1, placeKey), null);
    await until(() => listed(space) && listed(place), 'where each reads');

    // The place writes to the space: the space is told, as of any message.
    await inPlace(async () => {
      await nostrDmStart(npubOf(space));
      await nostrDmSend(space, 'από το κρυφό');
    });
    await until(() => nostrDmNow().state?.chats[place]?.messages.length === 1, 'the space’s message');
    await until(() => came.length === 1, 'its notice');
    assert.deepEqual(came, [[`nostr:${place}`, 1]]);
    assert.equal(nostrDmUnread(), 1);
    assert.deepEqual([...networkUnreadAt().keys()], [`nostr:${place}`]);
    // The space writes back: only the place has it, and nothing tells; answering read what came.
    await nostrDmSend(place, 'στο κρυφό');
    await until(() => nostrDmNow('place').state?.chats[space]?.messages.some((m) => m.text === 'στο κρυφό' && !m.mine) === true, 'the place’s message');
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(came.length, 1);
    assert.equal(nostrDmUnread(), 0);
    assert.deepEqual([...networkUnreadAt().keys()], []);
    await until(() => placeCame.length === 1, 'the place’s own notice');
    assert.deepEqual(placeCame, [`nostr:${space}`]);

    // Muted in the place, its chat tells of nothing more; its messages still come.
    await inPlace(() => nostrDmSetNotify(space, { until: ALWAYS }));
    await nostrDmSend(place, 'σιωπηλά');
    await until(() => nostrDmNow('place').state?.chats[space]?.messages.some((m) => m.text === 'σιωπηλά') === true, 'the muted message');
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.deepEqual(placeCame, [`nostr:${space}`]);

    // Sent through Tor by itself: what goes to them, on the chat's own connections; nothing else of the space's is.
    assert.ok(opened.every(([, chat]) => chat === undefined));
    await nostrDmSetTor(place, true);
    assert.equal(nostrDmNow().state?.chats[place]?.tor, true);
    const before = opened.length;
    await nostrDmSend(place, 'μέσω Tor');
    await until(() => nostrDmNow('place').state?.chats[space]?.messages.some((m) => m.text === 'μέσω Tor') === true, 'the message through Tor');
    const now = opened.slice(before);
    assert.ok(now.some(([url, chat]) => url === 'wss://inbox.place.example' && chat === place), 'their inbox, on the chat’s own way');
    assert.ok(now.some(([url, chat]) => url === 'wss://inbox.space.example' && chat === place), 'our own copy, on the chat’s own way');
    assert.ok(now.every(([, chat]) => chat === place));
    await nostrDmSetTor(place, false);
    assert.equal(nostrDmNow().state?.chats[place]?.tor, undefined);

    setOpenHiddenPlace(null);
    assert.equal(nostrDmNow('place').state, null);
    assert.equal(nostrDmNow().state?.public, space);
  } finally {
    setOpenHiddenPlace(null);
    stopWatching();
    stopCame();
    stopPlaceCame();
    stopNostrDm();
    setNostrOpen(null);
    setCurrentSpace(null);
  }
});

test('XMPP: a place that receives while closed keeps its account connected, and what comes tells only of its place', { skip: !coreReady }, async () => {
  const server = new Server();
  const ann = await person(server, 'ann');
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  const came: [string, number][] = [];
  const placeCame: [number, number, string, number][] = [];
  const stopCame = onNetworkMessage((where, times) => came.push([where, times]));
  const stopPlaceCame = onPlaceNetworkMessage((space, pocket, where, times) => placeCame.push([space, pocket, where, times]));
  setXmppConnect(server.connect);
  setCurrentSpace(9, spaceKey);
  const cat = () => [...server.bound.keys()].some((full) => full.startsWith(`cat@${DOMAIN}/`));
  try {
    runXmpp();
    // Its hidden chats open (lib/place-networks.ts says so), and it signs in.
    followXmppPlaces(9, [{ pocket: 1, key: placeKey }], 1);
    await until(() => xmppNow('place').loaded, 'the place’s account to load');
    await inPlace(() => xmppSignIn(`cat@${DOMAIN}`, PASSWORD));
    await until(() => xmppNow('place').online && !!xmppNow('place').state?.omemo.published, 'the place’s account online');
    const state = xmppNow('place').state;

    // They close, and receive: nothing of it shows, but it stays connected.
    followXmppPlaces(9, [{ pocket: 1, key: placeKey }], null);
    assert.equal(xmppNow('place').state, null);
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.ok(cat(), 'the place’s account still connected');
    await sendXmppText(ann.state, ann.connection, `cat@${DOMAIN}`, 'όσο είναι κλειστό');
    await until(() => placeCame.length === 1, 'the place’s notice');
    assert.deepEqual(placeCame, [[9, 1, `xmpp:ann@${DOMAIN}`, 1]]);
    assert.deepEqual(came, []);
    assert.equal(xmppUnread(), 0);
    assert.equal(networkUnreadAt().size, 0);

    // Open again: the same account, with what came.
    followXmppPlaces(9, [{ pocket: 1, key: placeKey }], 1);
    assert.equal(xmppNow('place').state, state);
    assert.deepEqual(xmppNow('place').state?.chats[`ann@${DOMAIN}`]?.messages.map((m) => m.text), ['όσο είναι κλειστό']);

    // No longer receiving, and closed: it goes.
    followXmppPlaces(9, [], null);
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.ok(!cat(), 'the place’s account disconnected');
  } finally {
    followXmppPlaces(9, [], null);
    stopCame();
    stopPlaceCame();
    stopXmpp();
    setXmppConnect(undefined);
    setCurrentSpace(null);
    ann.connection.close();
  }
});

test('Matrix: a place that receives while closed keeps syncing, and what comes tells only of its place', { skip: !coreReady }, async () => {
  const server = new Homeserver();
  setMatrixHttp(async (request) => {
    if (request.url.includes('/sync?timeout=30000')) await new Promise((resolve) => setTimeout(resolve, 20));
    return server.answer(request);
  });
  const cleo = await signIn(HS, 'cleo', MATRIX_PASSWORD);
  await sync(cleo, 0);
  const placeKey = randomBytes(32);
  const came: [string, number][] = [];
  const placeCame: [number, number, string, number][] = [];
  const stopCame = onNetworkMessage((where, times) => came.push([where, times]));
  const stopPlaceCame = onPlaceNetworkMessage((space, pocket, where, times) => placeCame.push([space, pocket, where, times]));
  setCurrentSpace(6, randomBytes(32));
  try {
    runMatrix();
    followMatrixPlaces(6, [{ pocket: 2, key: placeKey }], 2);
    await until(() => matrixNow('place').loaded, 'the place’s account to load');
    await inPlace(() => matrixSignIn('eve', MATRIX_PASSWORD, HS));
    const room = await startChat(cleo, '@eve:example.org');
    await until(() => !!matrixNow('place').state?.rooms[room.id], 'the place’s invitation');
    await inPlace(() => matrixJoin(room.id));
    await until(() => !matrixNow('place').state?.rooms[room.id]?.invitedBy, 'the place in the room');
    const state = matrixNow('place').state;
    await new Promise((resolve) => setTimeout(resolve, 80));
    placeCame.length = 0;

    followMatrixPlaces(6, [{ pocket: 2, key: placeKey }], null);
    assert.equal(matrixNow('place').state, null);
    await sendText(cleo, room.id, 'όσο είναι κλειστό');
    await until(() => placeCame.length > 0, 'the place’s notice');
    assert.deepEqual(placeCame, [[6, 2, `matrix:${room.id}`, 1]]);
    assert.deepEqual(came, []);
    assert.equal(matrixUnread(), 0);

    followMatrixPlaces(6, [{ pocket: 2, key: placeKey }], 2);
    assert.equal(matrixNow('place').state, state);
  } finally {
    followMatrixPlaces(6, [], null);
    stopCame();
    stopPlaceCame();
    stopMatrix();
    setCurrentSpace(null);
    setMatrixHttp(defaultMatrixHttp);
  }
});

test('Nostr: how an account reaches its servers, as its own Tor choice says, and only through Tor in INVISIBLE', () => {
  try {
    setThroughTor('off');
    assert.equal(nostrWay('never'), 'straight');
    assert.equal(nostrWay('space'), 'straight');
    assert.equal(nostrWay('always'), 'tor only');
    setThroughTor('all');
    // INVISIBLE (Everything): every account goes only through Tor, even one set to Off.
    assert.equal(nostrWay('never'), 'tor only');
    assert.equal(nostrWay('space'), 'tor only');
    assert.equal(nostrWay('always'), 'tor only');
  } finally {
    setThroughTor('off');
  }
});
