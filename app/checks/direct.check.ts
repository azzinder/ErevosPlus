// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Direct connections (lib/direct.ts): the space's switch, on unless turned off, off with no space
// open and wherever anything of the space goes through Tor; the warnings it covers, and those it
// never does; the helper servers of a call straight between two phones, the one beside the relay
// first and the public ones only as a reserve; and such a call itself (lib/call.ts, lib/calls.ts):
// which helpers it asks, what it says of itself, what rings, and how it says that it could not connect;
// with a call relay too, every way at once, so that it goes straight where it can and through the
// relay where it cannot, while with the switch off a call relay is the only way.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import './secure-memory';
import { answeringHelpers, askHelpers, Call, connectionConfig, currentCall, describedSdp, fittingSdp, GATHER_MS, offersBeyond, OPEN_GRACE_MS, OPEN_WAIT_MS, type Rtc } from '../lib/call';
import { MAX_SDP, type CallSignal } from '../lib/call-signal';
import { shownLine } from '../lib/call-lines';
import { callSignal, closeCall, endedLine, shownCall, startCall, type CallPlace } from '../lib/calls';
import { connectReach } from '../lib/connect-reach';
import { randomBytes } from '../lib/crypto';
import { callHelpers, directNow, directOf, directSaysNothing, HELPER_PORT, helperOf, helpersTyped, helperTyped, HELPERS_MOST, onDirect, setDirect } from '../lib/direct';
import { setLang } from '../lib/i18n';
import type { IpAct } from '../lib/ip-warning';
import { setNostr } from '../lib/nostr';
import { setThroughTor } from '../lib/relay';
import { LPHL_HELPER, LPHL_RELAY, PUBLIC_HELPERS, START_RELAY } from '../lib/servers';
import { directHere, searchSettings, type SettingsPlace } from '../lib/settings';
import { refreshSpamList, setSpamWeekly, SPAM_EVERY } from '../lib/spam-list';
import { setCurrentSpace } from '../lock/keys';
import { EMPTY_SPACE, loadSpaceData, saveSpaceData, STUN_MOST, updateSpaceData, type SpaceData } from '../lock/space-data';
import { FakeConnection, fakeRtc } from './fake-rtc';

const APP = join(import.meta.dirname, '..');

afterEach(() => {
  setDirect(false);
  setThroughTor('off');
  setNostr(null, false);
  currentCall()?.hangUp();
  const shown = shownCall();
  if (shown) closeCall(shown.call);
});

const settle = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

test('the switch is on in a new space, kept as turned, and off wherever anything of the space goes through Tor', async () => {
  assert.equal(EMPTY_SPACE.direct, true, 'on unless turned off');
  assert.equal(directOf({ direct: true, tor: 'off', nostr: {} }), true);
  assert.equal(directOf({ direct: false, tor: 'off', nostr: {} }), false);
  // Tor comes first: the space's Tor way, or Nostr's own Tor switch.
  assert.equal(directOf({ direct: true, tor: 'messages', nostr: {} }), false);
  assert.equal(directOf({ direct: true, tor: 'all', nostr: {} }), false);
  assert.equal(directOf({ direct: true, tor: 'off', nostr: { tor: true } }), false);
  assert.equal(directOf({ direct: true, tor: 'off', nostr: { tor: false } }), true);

  // A space kept before the switch was there has it on; turned off, it stays off; the helper
  // servers typed are kept as typed, and not when they are not words or too many.
  const key = randomBytes(32);
  setCurrentSpace(31, key);
  const { direct: _direct, ...before } = EMPTY_SPACE;
  await saveSpaceData(31, key, before as SpaceData);
  assert.equal((await loadSpaceData(31, key)).direct, true);
  assert.equal((await loadSpaceData(31, key)).stun, undefined);
  await updateSpaceData(31, key, { direct: false, stun: 'stun.example.org' });
  assert.equal((await loadSpaceData(31, key)).direct, false);
  assert.equal((await loadSpaceData(31, key)).stun, 'stun.example.org');
  await updateSpaceData(31, key, { stun: '' });
  assert.equal((await loadSpaceData(31, key)).stun, '', 'none asked is kept apart from the usual ones');
  await updateSpaceData(31, key, { stun: undefined });
  assert.equal((await loadSpaceData(31, key)).stun, undefined, 'left out: the usual ones again');
  await updateSpaceData(31, key, { stun: 'x'.repeat(STUN_MOST + 1) });
  assert.equal((await loadSpaceData(31, key)).stun, undefined);
  await updateSpaceData(31, key, { stun: 7 as unknown as string });
  assert.equal((await loadSpaceData(31, key)).stun, undefined);
});

test('with no space open nothing is direct; open, it is as the space says, and never while Tor is on', () => {
  assert.equal(directNow(), false, 'no space open');
  let told = 0;
  const stop = onDirect(() => void told++);
  setDirect(true);
  assert.equal(directNow(), true);
  assert.equal(told, 1);
  setDirect(true);
  assert.equal(told, 1, 'told only when it changes');

  // The space's Tor way, either of them, and back.
  setThroughTor('messages');
  assert.equal(directNow(), false);
  assert.equal(told, 2, 'whoever listens hears of the Tor way too');
  setThroughTor('all');
  assert.equal(directNow(), false);
  setThroughTor('off');
  assert.equal(directNow(), true);

  // Nostr's own Tor switch.
  setNostr(null, true);
  assert.equal(directNow(), false);
  setNostr(null, false);
  assert.equal(directNow(), true);

  setDirect(false);
  assert.equal(directNow(), false);
  const heard = told;
  stop();
  setDirect(true);
  assert.equal(told, heard, 'not after it stopped listening');
});

test('on, it says nothing of what it covers; a web link, a bridge, hidden chats and Tor chats are still asked; off, everything is', () => {
  const covered: [string, IpAct][] = [['Erevos', 'send'], ['Erevos', 'call'], ['Erevos', 'file'], ['Erevos', 'relay'], ['Erevos', 'station'], ['Erevos', 'channel'], ['Nostr', 'pair'], [' erevos ', 'send']];
  const always: [string, IpAct][] = [['Erevos', 'link'], ['Erevos', 'preview'], ['Erevos', 'join'], ['wss://other.example', 'bridge'], ['Matrix', 'send'], ['XMPP', 'call'], ['Nostr', 'send'], ['Signal', 'send']];
  // Off: all of them are said.
  for (const [network, act] of [...covered, ...always]) assert.equal(directSaysNothing({ network, act }), false, `${network} ${act}, off`);
  setDirect(true);
  for (const [network, act] of covered) assert.equal(directSaysNothing({ network, act }), true, `${network} ${act}`);
  for (const [network, act] of always) assert.equal(directSaysNothing({ network, act }), false, `${network} ${act}`);
  // Hidden chats keep their warnings, wherever they are kept; so does a chat set to go only through Tor.
  assert.equal(directSaysNothing({ network: 'Erevos', act: 'send', keep: 'memory' }), false);
  assert.equal(directSaysNothing({ network: 'Erevos', act: 'call', keep: { space: 0, pocket: 1, key: new Uint8Array(32) } }), false);
  assert.equal(directSaysNothing({ network: 'Erevos', act: 'call', tor: true }), false);
  // While Tor is on in the space, it covers nothing.
  setThroughTor('messages');
  for (const [network, act] of covered) assert.equal(directSaysNothing({ network, act }), false, `${network} ${act}, Tor on`);

  // What asks (components/ip-warning.tsx) goes on at once with it, before anything is read or kept
  // as said, so that turned off each warning is said as before.
  const gate = readFileSync(join(APP, 'components', 'ip-warning.tsx'), 'utf8');
  const body = gate.slice(gate.indexOf('export function ipGate('));
  assert.match(body.slice(0, body.indexOf('const key')), /if \(directSaysNothing\(warning\)\) return Promise\.resolve\(true\);/);
});

test('a helper server is read from a relay address and from what is typed', () => {
  assert.equal(HELPER_PORT, 3478);
  assert.equal(helperOf('wss://relay.example.org'), 'stun:relay.example.org:3478');
  assert.equal(helperOf(' WSS://Relay.Example.org:8443/path?x=1 '), 'stun:relay.example.org:3478');
  assert.equal(helperOf('ws://192.168.1.2:7879'), 'stun:192.168.1.2:3478');
  for (const none of ['', 'wss://', 'wss://localhost', 'not an address', 'wss://-bad-.example.org']) assert.equal(helperOf(none), null, none);
  // LPHL's call relay listens on 3480: 3478 there is another service's.
  assert.equal(helperOf('wss://erevos.lphl.nekten.eu'), 'stun:erevos.lphl.nekten.eu:3480');
  assert.equal(helperOf(LPHL_RELAY), LPHL_HELPER);
  assert.equal(helperTyped(LPHL_HELPER), LPHL_HELPER, 'written as a helper server');

  assert.equal(helperTyped('stun.example.org'), 'stun:stun.example.org:3478');
  assert.equal(helperTyped(' STUN:Stun.Example.org:443 '), 'stun:stun.example.org:443');
  assert.equal(helperTyped('stun.example.org:5349'), 'stun:stun.example.org:5349');
  for (const bad of ['', 'turn:turn.example.org', 'https://stun.example.org', 'stun.example.org:0', 'stun.example.org:70000', 'stun.example.org/path', 'localhost', 'stun:']) {
    assert.equal(helperTyped(bad), null, bad);
  }

  assert.deepEqual(helpersTyped(''), []);
  assert.deepEqual(helpersTyped('a.example.org, b.example.org:5000  a.example.org'), ['stun:a.example.org:3478', 'stun:b.example.org:5000']);
  assert.equal(helpersTyped('a.example.org, turn:b.example.org'), null, 'one that is no helper server: none of them');
  assert.equal(HELPERS_MOST, 3);
  assert.equal(helpersTyped('a.example.org b.example.org c.example.org d.example.org')?.length, HELPERS_MOST);
});

test("the helper beside one's own relay and the one beside the build's first relay are asked first; the public ones only as a reserve; typed ones alone", () => {
  const reserve = ['stun:p1.example.net:3478', 'stun:p2.example.net:443'];
  assert.deepEqual(callHelpers({ url: 'wss://mine.example.org' }, 'wss://first.example.org', reserve), [['stun:mine.example.org:3478', 'stun:first.example.org:3478'], reserve]);
  // The same relay named twice is asked once; with no relay of one's own, the build's first alone.
  assert.deepEqual(callHelpers({ url: 'wss://first.example.org/' }, 'wss://first.example.org', reserve), [['stun:first.example.org:3478'], reserve]);
  assert.deepEqual(callHelpers({ url: '' }, 'wss://first.example.org', reserve), [['stun:first.example.org:3478'], reserve]);
  // A reserve that is among the first already is not asked again.
  assert.deepEqual(callHelpers({ url: '' }, 'wss://first.example.org', ['stun:first.example.org:3478', 'stun:p2.example.net:443']), [['stun:first.example.org:3478'], ['stun:p2.example.net:443']]);
  // With neither, only the reserve is left.
  assert.deepEqual(callHelpers({ url: '' }, '', reserve), [reserve]);

  // Typed: only those, in one group, and no reserve; typed empty, none at all.
  assert.deepEqual(callHelpers({ url: 'wss://mine.example.org', stun: 'stun.own.example.org, other.example.org:5000' }, 'wss://first.example.org', reserve), [
    ['stun:stun.own.example.org:3478', 'stun:other.example.org:5000'],
  ]);
  assert.deepEqual(callHelpers({ url: 'wss://mine.example.org', stun: '' }, 'wss://first.example.org', reserve), []);
  assert.deepEqual(callHelpers({ url: 'wss://mine.example.org', stun: 'turn:nonsense' }, 'wss://first.example.org', reserve), []);

  // This build, with nothing typed and no relay: the call relay beside the relay it offers first
  // (LPHL's, unless the build names another), then the public ones, which are not LPHL's.
  const [first, last, ...more] = callHelpers({ url: '' });
  assert.deepEqual(first, [helperOf(START_RELAY)]);
  assert.deepEqual(last, [...PUBLIC_HELPERS]);
  assert.equal(more.length, 0);
  assert.ok(PUBLIC_HELPERS.length > 0 && PUBLIC_HELPERS.every((helper) => helperTyped(helper) === helper), 'each public one is a helper server as written');
});

// A stand-in for WebRTC whose helper servers answer, or do not: a connection asked with one of
// `answering` among its servers is told an address of its own on the internet a moment later.
function helperRtc(answering: string[]) {
  const made = fakeRtc();
  const asked: string[][] = [];
  const rtc: Rtc = {
    ...made.rtc,
    connect(config) {
      const connection = made.rtc.connect(config) as FakeConnection;
      const urls = config.iceServers.flatMap((server) => server.urls);
      asked.push(urls);
      if (urls.some((url) => answering.includes(url))) {
        setTimeout(() => connection.emit('icecandidate', { candidate: { candidate: 'candidate:9 1 udp 1686052607 203.0.113.7 50000 typ srflx raddr 0.0.0.0 rport 0' } }), 5);
      }
      return connection;
    },
  };
  return { ...made, rtc, asked };
}

const A = 'stun:a.example.org:3478';
const B = 'stun:b.example.org:3478';
const P = 'stun:public.example.net:3478';

test('a helper server is asked on a connection of its own, closed at once: how long it took, or that it did not answer', async () => {
  const answers = helperRtc([A]);
  const took = await askHelpers(answers.rtc, [A], 200);
  assert.equal(typeof took, 'number');
  assert.deepEqual(answers.connections[0].config, { iceServers: [{ urls: [A] }], iceTransportPolicy: 'all' });
  assert.ok(answers.connections[0].closed, 'closed once it answered');
  assert.equal(answers.connections[0].added.length, 0, 'it carries nothing: no microphone, no camera');
  assert.equal(answers.streams.length, 0);

  const silent = helperRtc([]);
  assert.equal(await askHelpers(silent.rtc, [A], 40), null);
  assert.ok(silent.connections[0].closed, 'closed when it gave up');
  // An address of the phone's own network is no answer of a helper.
  const local = fakeRtc();
  const waiting = askHelpers(local.rtc, [A], 40);
  local.connections[0].emit('icecandidate', { candidate: { candidate: 'candidate:1 1 udp 2122260223 192.168.1.20 50000 typ host' } });
  assert.equal(await waiting, null);

  // None to ask: nothing is asked. Where a connection cannot be made only to ask: said so.
  const none = helperRtc([A]);
  assert.equal(await askHelpers(none.rtc, [], 40), null);
  assert.equal(none.connections.length, 0);
  const old: Rtc = { ...fakeRtc().rtc, connect: () => ({ addEventListener: () => undefined, close: () => undefined }) as unknown as FakeConnection };
  assert.equal(await askHelpers(old, [A], 40), 'cannot');
  const broken: Rtc = { ...fakeRtc().rtc, connect: () => assert.fail('no connection here') };
  assert.equal(await askHelpers(broken, [A], 40), 'cannot');
});

test('the reserve is asked only when none of the first answers', async () => {
  // The first answers: the reserve never sees the address.
  const first = helperRtc([A]);
  assert.deepEqual(await answeringHelpers(first.rtc, [[A, B], [P]], 60), [A, B]);
  assert.deepEqual(first.asked, [[A, B]]);

  // The first are silent: the reserve is asked, and used.
  const second = helperRtc([P]);
  assert.deepEqual(await answeringHelpers(second.rtc, [[A, B], [P]], 40), [P]);
  assert.deepEqual(second.asked, [[A, B], [P]]);

  // None answers, as on a Wi-Fi with no internet: none is used, and the call says the addresses the phone has by itself.
  const nobody = helperRtc([]);
  assert.deepEqual(await answeringHelpers(nobody.rtc, [[A], [P]], 30), []);
  assert.deepEqual(await answeringHelpers(nobody.rtc, [], 30), []);

  // Where a connection cannot be made only to ask: the first are asked in the call itself, never the reserve.
  const old: Rtc = { ...fakeRtc().rtc, connect: () => ({ addEventListener: () => undefined, close: () => undefined }) as unknown as FakeConnection };
  assert.deepEqual(await answeringHelpers(old, [[A], [P]], 30), [A]);
});

test('straight over the internet a call says every address and asks only helpers; with a call relay too, every way, the relay beside them', () => {
  assert.deepEqual(connectionConfig(null, [A, P]), { iceServers: [{ urls: [A, P] }], iceTransportPolicy: 'all' });
  assert.deepEqual(connectionConfig(null, []), { iceServers: [], iceTransportPolicy: 'all' });
  assert.deepEqual(connectionConfig(null), { iceServers: [], iceTransportPolicy: 'all' });
  const turn = { urls: ['turn:relay.example.org:3478'], username: '1', credential: 'c' };
  // Straight first, the server if that fails (his word): WebRTC tries every way at once and keeps the
  // call relay's only when no other works. With no helper answering, still every way.
  assert.deepEqual(connectionConfig(turn, [A]), { iceServers: [{ urls: [A] }, turn], iceTransportPolicy: 'all' });
  assert.deepEqual(connectionConfig(turn, []), { iceServers: [turn], iceTransportPolicy: 'all' });
  // Not straight (Direct connections off, hidden chats, a chat through Tor): only through the call relay.
  assert.deepEqual(connectionConfig(turn), { iceServers: [turn], iceTransportPolicy: 'relay' });
  assert.deepEqual(connectionConfig(turn, null), { iceServers: [turn], iceTransportPolicy: 'relay' });

  const line = (address: string, typ: string, transport = 'udp') => `a=candidate:1 1 ${transport} 2122260223 ${address} 50000 typ ${typ}`;
  // An offer reaches beyond its own network when it says a call relay's address, or one of its own on the internet.
  assert.equal(offersBeyond(['v=0', line('192.168.1.4', 'host')].join('\r\n')), false);
  assert.equal(offersBeyond(['v=0', line('192.168.1.4', 'host'), line('203.0.113.7', 'srflx')].join('\r\n')), true);
  assert.equal(offersBeyond(['v=0', line('198.51.100.2', 'relay')].join('\r\n')), true);

  // A description too long for a call signal loses its addresses over TCP, and nothing else.
  const short = ['v=0', line('192.168.1.4', 'host'), line('192.168.1.4', 'host', 'tcp')].join('\r\n');
  assert.equal(fittingSdp(short), short, 'one that fits goes as it is');
  const many = ['v=0', 'm=audio 9 UDP/TLS/RTP/SAVPF 111', line('203.0.113.7', 'srflx'), ...Array.from({ length: 200 }, (_, i) => line(`2001:db8::${i.toString(16)}`, 'host', 'tcp'))].join('\r\n');
  assert.ok(many.length > MAX_SDP);
  const fitted = fittingSdp(many);
  assert.ok(fitted.length <= MAX_SDP);
  assert.doesNotMatch(fitted, / tcp /);
  assert.match(fitted, /typ srflx/);
  assert.match(fitted, /^v=0\r\nm=audio /);
});

test('straight over the internet, the description goes soon after the first address a helper told, and is not waited for long', async () => {
  const listeners = new Map<string, ((event?: unknown) => void)[]>();
  const connection = {
    iceGatheringState: 'gathering',
    connectionState: 'new',
    localDescription: { sdp: 'v=0\r\na=candidate:1 1 udp 1 192.168.1.20 50001 typ host\r\na=candidate:2 1 udp 1 203.0.113.9 50001 typ srflx\r\n' },
    addEventListener(type: string, listener: (event?: unknown) => void) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
  } as unknown as Parameters<typeof describedSdp>[0];
  const fire = (candidate: string) => listeners.get('icecandidate')!.forEach((l) => l({ candidate: { candidate } }));
  const began = Date.now();
  const sdp = describedSdp(connection, false, true);
  // An address of its own network does not end the wait; one a helper told does, a moment later.
  fire('candidate:1 1 udp 1 192.168.1.20 50001 typ host');
  fire('candidate:2 1 udp 1 203.0.113.9 50001 typ srflx');
  const given = await sdp;
  // Every address goes, the one on the internet too: nothing is held back as on the same network.
  assert.match(given, /typ host/);
  assert.match(given, /typ srflx/);
  assert.ok(Date.now() - began >= OPEN_GRACE_MS - 50 && Date.now() - began < OPEN_WAIT_MS);

  // No helper answers: what the phone found by then goes after OPEN_WAIT_MS, not the longer wait of a call relay.
  const quiet = new Map<string, ((event?: unknown) => void)[]>();
  const from = Date.now();
  const alone = await describedSdp({ ...connection, addEventListener: (type: string, l: (event?: unknown) => void) => quiet.set(type, [l]) } as typeof connection, false, true);
  assert.match(alone, /typ host/);
  assert.ok(Date.now() - from >= OPEN_WAIT_MS - 100 && Date.now() - from < OPEN_WAIT_MS + 1500);
});

test('with a call relay too, the description waits for an address the relay gives, and goes soon after with every address', async () => {
  const listeners = new Map<string, ((event?: unknown) => void)[]>();
  const connection = {
    iceGatheringState: 'gathering',
    connectionState: 'new',
    localDescription: { sdp: 'v=0\r\na=candidate:1 1 udp 1 192.168.1.20 50001 typ host\r\na=candidate:2 1 udp 1 203.0.113.9 50001 typ srflx\r\na=candidate:3 1 udp 1 198.51.100.5 50002 typ relay\r\n' },
    addEventListener(type: string, listener: (event?: unknown) => void) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
  } as unknown as Parameters<typeof describedSdp>[0];
  const fire = (candidate: string) => listeners.get('icecandidate')!.forEach((l) => l({ candidate: { candidate } }));
  const began = Date.now();
  let sent = '';
  const sdp = describedSdp(connection, false, true, true).then((given) => (sent = given));
  // An address a helper told is not enough here: without the call relay's, the call could not go
  // through it where it cannot go straight.
  fire('candidate:2 1 udp 1 203.0.113.9 50001 typ srflx');
  await settle(OPEN_GRACE_MS + 200);
  assert.equal(sent, '', 'the call relay is waited for');
  fire('candidate:3 1 udp 1 198.51.100.5 50002 typ relay');
  await sdp;
  for (const typ of ['host', 'srflx', 'relay']) assert.match(sent, new RegExp(`typ ${typ}`), typ);
  const took = Date.now() - began;
  assert.ok(took >= 2 * OPEN_GRACE_MS + 150 && took < GATHER_MS, `${took} ms`);
});

function ours() {
  const sent: CallSignal[] = [];
  return { sent, events: { onChange: () => undefined, send: async (signal: CallSignal) => void sent.push(signal) } };
}

test('a call with no call relay and Direct connections on asks the first helpers, says that it is direct, and says so when it cannot connect', async () => {
  const { rtc, connections, asked } = helperRtc([A]);
  const mine = ours();
  const call = Call.start({ peer: 'contact:a', video: false, relay: null, open: [[A], [P]], rtc, events: mine.events });
  assert.equal(call.direct, true);
  assert.equal(call.throughRelay, false);
  await settle(80);
  // The helper was asked on a connection of its own; the call's own asks the same, never the reserve.
  assert.deepEqual(asked, [[A], [A]]);
  const connection = connections[1];
  assert.deepEqual(connection.config, { iceServers: [{ urls: [A] }], iceTransportPolicy: 'all' });
  assert.equal(mine.sent[0]?.kind, 'offer');

  // Their answer is taken whole, their internet address too: nothing is held to the same network.
  const answer = 'v=0\r\na=candidate:1 1 udp 1 198.51.100.4 40000 typ srflx';
  call.receive({ id: call.id, kind: 'answer', sdp: answer });
  await settle();
  assert.deepEqual(connection.remote, { type: 'answer', sdp: answer });

  assert.equal(call.failedDirect, false);
  connection.connectionState = 'failed';
  connection.emit('connectionstatechange');
  assert.deepEqual(call.ended, { reason: 'failed', byUs: true });
  assert.equal(call.failedDirect, true);
  assert.equal(endedLine(call), 'Voice call, could not connect directly');
  await setLang('en');
  assert.equal(shownLine('📞 Voice call, could not connect directly'), '📞 Voice call, could not connect directly');
  await setLang('el');
  try {
    assert.equal(shownLine('📞 Video call, could not connect directly'), '📞 Βιντεοκλήση, δεν συνδέθηκε απευθείας', 'said in the language of the app');
  } finally {
    await setLang('en');
  }
});

test('a call that connected, one with a call relay, and one on the same network only do not say they failed directly', async () => {
  const turn = { urls: ['turn:relay.example.org:3478'], username: '1', credential: 'c' };
  // Through a call relay only, with Direct connections off: no helper is asked, and the call is not direct.
  const relayed = helperRtc([A]);
  const call = Call.start({ peer: 'contact:a', video: false, relay: turn, rtc: relayed.rtc, events: ours().events });
  assert.equal(call.direct, false);
  await settle();
  assert.deepEqual(relayed.asked, [turn.urls]);
  assert.equal(relayed.connections[0].config.iceTransportPolicy, 'relay');
  relayed.connections[0].connectionState = 'failed';
  relayed.connections[0].emit('connectionstatechange');
  assert.equal(call.failedDirect, false);
  assert.equal(endedLine(call), 'Voice call, could not connect');

  // With a call relay and Direct connections on: the first helpers are asked, the call goes every
  // way, the relay beside them; it is not straight only, so one that could not connect says no more.
  const both = helperRtc([A]);
  const either = Call.start({ peer: 'contact:a', video: false, relay: turn, open: [[A], [P]], rtc: both.rtc, events: ours().events });
  assert.equal(either.direct, false);
  assert.equal(either.throughRelay, true);
  await settle(80);
  assert.deepEqual(both.asked, [[A], [A, ...turn.urls]], 'never the reserve');
  assert.deepEqual(both.connections[1].config, { iceServers: [{ urls: [A] }, turn], iceTransportPolicy: 'all' });
  both.connections[1].connectionState = 'failed';
  both.connections[1].emit('connectionstatechange');
  assert.equal(either.failedDirect, false);
  assert.equal(endedLine(either), 'Voice call, could not connect');

  // On the same network only, as with the switch off: no helper is asked.
  const near = helperRtc([A]);
  const nearCall = Call.start({ peer: 'contact:a', video: false, relay: null, rtc: near.rtc, events: ours().events });
  assert.equal(nearCall.direct, false);
  await settle();
  assert.deepEqual(near.asked, [[]]);
  nearCall.hangUp();

  // One that connected and was lost later did connect: its line says how long it lasted.
  const done = helperRtc([A]);
  const lasted = Call.start({ peer: 'contact:a', video: false, relay: null, open: [[A]], rtc: done.rtc, events: ours().events });
  await settle(60);
  lasted.receive({ id: lasted.id, kind: 'answer', sdp: 'v=0\r\nanswer' });
  await settle();
  done.connections[1].connect(done.streams[0]);
  done.connections[1].connectionState = 'failed';
  done.connections[1].emit('connectionstatechange');
  assert.equal(lasted.failedDirect, false);
  assert.match(endedLine(lasted), /^Voice call, \d+:\d\d$/);
});

// Where calls belong, with what Direct connections add to it.
function place(more: Partial<CallPlace> = {}) {
  const sent: { identity: string; signal: CallSignal }[] = [];
  const lines: { peer: string; mine: boolean; text: string }[] = [];
  const calls: CallPlace = {
    send: async (identity, signal) => void sent.push({ identity, signal }),
    callRelay: async () => null,
    line: (peer, mine, text) => void lines.push({ peer, mine, text }),
    name: () => 'Anna',
    ...more,
  };
  return { calls, sent, lines };
}

const offer = (sdp: string, id = '0123456789abcdef'): Extract<CallSignal, { kind: 'offer' }> => ({ id, kind: 'offer', video: false, sdp, at: Date.now() });
const BEYOND = 'v=0\r\na=candidate:1 1 udp 2122260223 192.168.1.20 50000 typ host\r\na=candidate:2 1 udp 1686052607 203.0.113.7 50000 typ srflx';
const LOCAL = 'v=0\r\na=candidate:1 1 udp 2122260223 192.168.1.20 50000 typ host';

test('a call that rings here with no call relay is answered straight over the internet only with Direct connections on, and only when their offer reaches beyond its network', async () => {
  // On: the place gives its helpers, and the call is direct.
  const on = helperRtc([A]);
  const here = place({ direct: async () => [[A], [P]] });
  assert.equal(await callSignal(here.calls, 'contact:a', offer(BEYOND), false, on.rtc), null);
  const ringing = shownCall()!.call;
  assert.equal(ringing.direct, true);
  await ringing.answer();
  assert.deepEqual(on.asked, [[A], [A]]);
  assert.deepEqual(on.connections[1].remote, { type: 'offer', sdp: BEYOND }, 'their internet address is taken too');
  ringing.hangUp();
  closeCall(ringing);

  // Their offer says only its own network, as on a Wi-Fi with no internet: answered there, as before, with no helper asked.
  const near = helperRtc([A]);
  await callSignal(here.calls, 'contact:a', offer(LOCAL, '1111111111111111'), false, near.rtc);
  const nearCall = shownCall()!.call;
  assert.equal(nearCall.direct, false);
  await nearCall.answer();
  assert.deepEqual(near.asked, [[]]);
  nearCall.hangUp();
  closeCall(nearCall);

  // Off (the place says null), or a place with no direct calls at all (hidden chats): on the same network only, as before.
  for (const off of [place({ direct: async () => null }), place()]) {
    const rtc = helperRtc([A]);
    await callSignal(off.calls, 'contact:a', offer(BEYOND, '2222222222222222'), false, rtc.rtc);
    const call = shownCall()!.call;
    assert.equal(call.direct, false);
    await call.answer();
    assert.deepEqual(rtc.asked, [[]]);
    assert.deepEqual(rtc.connections[0].remote, { type: 'offer', sdp: 'v=0\r\na=candidate:1 1 udp 2122260223 192.168.1.20 50000 typ host' }, 'their internet address is left out');
    call.hangUp();
    closeCall(call);
  }

  // With a call relay here and Direct connections on: every way, the relay beside the helpers, so
  // the call goes straight where it can and through the relay where it cannot.
  const turn = { urls: ['turn:relay.example.org:3478'], username: '1', credential: 'c' };
  const both = helperRtc([A]);
  const withRelay = place({ callRelay: async () => turn, direct: async () => [[A]] });
  await callSignal(withRelay.calls, 'contact:a', offer(BEYOND, '3333333333333333'), false, both.rtc);
  const either = shownCall()!.call;
  assert.equal(either.direct, false, 'not straight only: the relay is there too');
  assert.equal(either.throughRelay, true);
  await either.answer();
  assert.deepEqual(both.asked, [[A], [A, ...turn.urls]]);
  assert.deepEqual(both.connections[1].config, { iceServers: [{ urls: [A] }, turn], iceTransportPolicy: 'all' });
  assert.deepEqual(both.connections[1].remote, { type: 'offer', sdp: BEYOND }, 'their internet address is taken too');
  either.hangUp();
  closeCall(either);

  // With the switch off, or a place with no direct calls (hidden chats): only through the call relay,
  // so their phone does not see this one's address.
  for (const [i, off] of [place({ callRelay: async () => turn, direct: async () => null }), place({ callRelay: async () => turn })].entries()) {
    const relayed = helperRtc([A]);
    await callSignal(off.calls, 'contact:a', offer(BEYOND, `${5 + i}`.repeat(16)), false, relayed.rtc);
    const through = shownCall()!.call;
    assert.equal(through.throughRelay, true);
    await through.answer();
    assert.deepEqual(relayed.asked, [turn.urls]);
    assert.equal(relayed.connections[0].config.iceTransportPolicy, 'relay');
    through.hangUp();
    closeCall(through);
  }
});

test('a call that could not be answered back does not ring: it is a missed call, and the chat is told why', async () => {
  await setLang('en');
  const { rtc, connections } = fakeRtc();
  const here = place({ reaches: async () => false });
  const said = await callSignal(here.calls, 'contact:a', offer(BEYOND), false, rtc);
  assert.match(said ?? '', /^Anna tried to call, with no server between you two\. To take such calls, choose SPEED at the top of Settings\.$/);
  assert.equal(shownCall(), null, 'nothing rings');
  assert.equal(connections.length, 0);
  assert.deepEqual(here.lines, [{ peer: 'contact:a', mine: false, text: 'Missed voice call' }]);
  assert.deepEqual(here.sent, [], 'and nothing is said back, as it could not go');

  // One that can be answered rings as ever; a place that cannot say is taken to reach them.
  for (const reaching of [place({ reaches: async () => true }), place({ reaches: async () => Promise.reject(new Error('closed')) }), place()]) {
    assert.equal(await callSignal(reaching.calls, 'contact:a', offer(LOCAL, '4444444444444444'), false, rtc), null);
    const call = shownCall()!.call;
    assert.equal(call.state, 'incoming');
    call.decline();
    closeCall(call);
  }
});

test('startCall takes the helpers with a call relay too: straight where it can, through the relay where it cannot', async () => {
  const turn = { urls: ['turn:relay.example.org:3478'], username: '1', credential: 'c' };
  const open = helperRtc([A]);
  const direct = startCall(place().calls, 'contact:a', false, null, open.rtc, [[A]]);
  assert.equal(direct.direct, true);
  direct.hangUp();
  closeCall(direct);
  const both = helperRtc([A]);
  const either = startCall(place().calls, 'contact:a', false, turn, both.rtc, [[A]]);
  assert.equal(either.direct, false);
  await settle(80);
  assert.deepEqual(both.connections.at(-1)!.config, { iceServers: [{ urls: [A] }, turn], iceTransportPolicy: 'all' });
  either.hangUp();
  closeCall(either);
  const near = startCall(place().calls, 'contact:a', false, null, open.rtc);
  assert.equal(near.direct, false);
});

test('New chat says that calls work with no relay while Direct connections are on, in plain words', async () => {
  await setLang('en');
  const none = { linked: false, relayUrl: '', queue: false, hidden: false, nostr: true, nearby: true, lent: false, via: false };
  const on = connectReach({ ...none, direct: true });
  assert.deepEqual([on.reach, on.title], ['part', 'Messages and calls, for now']);
  assert.match(on.line, /texts, photos, files, voice messages and calls\. For groups/);
  assert.doesNotMatch(on.line, /relay|queue|Nostr/);
  // Off, and in hidden chats whatever it says, as before.
  assert.equal(connectReach(none).title, 'Messages only, for now');
  assert.equal(connectReach({ ...none, direct: false }).title, 'Messages only, for now');
  // What is true of it: photos, files and voice messages go through Nostr as texts do; calls and groups do not.
  assert.match(connectReach(none).line, /texts, photos, files and voice messages\. For calls and groups/);
  assert.doesNotMatch(connectReach(none).line, /relay|queue|Nostr/);
  assert.equal(connectReach({ ...none, hidden: true, direct: true }).title, 'Through Nostr, with no server');
  // With a relay it changes nothing, and with neither a relay nor Nostr there is nothing to call through.
  assert.equal(connectReach({ ...none, relayUrl: 'wss://r.example', queue: true, direct: true }).title, 'Through your server');
  assert.equal(connectReach({ ...none, nostr: false, direct: true }).title, 'Only nearby, for now');
});

test('the three modes stand in Settings, at its top and in the search, wherever a module they are of is on', async () => {
  await setLang('en');
  const phone: SettingsPlace = { web: false, webApp: false, push: false, background: true, checks: true, launcher: true, widget: true, sims: true };
  assert.equal(directHere(phone), true);
  assert.equal(directHere({ ...phone, web: true, webApp: true }), true, 'in the web app too');
  assert.equal(directHere({ ...phone, modules: new Set(['erevos']) }), true);
  assert.equal(directHere({ ...phone, modules: new Set(['collection', 'sms']) }), true);
  assert.equal(directHere({ ...phone, modules: new Set(['sms']) }), false, 'not where nothing it is of is on');
  const hits = searchSettings('invisible', phone, (english) => english);
  assert.deepEqual(hits.map((hit) => hit.leaf.href), ['/direct']);
  // They are the first thing under the search, before the language and the groups (checks/modes.check.ts).
  const screen = readFileSync(join(APP, 'app', 'settings', 'index.tsx'), 'utf8');
  assert.ok(screen.indexOf('<ModePicker') > 0 && screen.indexOf('<ModePicker') < screen.indexOf('key="language"'));
});

test('turning Tor on, or opening a space where it is on, turns the switch off and keeps it off; closing the space leaves nothing direct', () => {
  const layout = readFileSync(join(APP, 'app', '_layout.tsx'), 'utf8');
  // As a space opens: what its data says with Tor counted, kept so, before Tor or Nostr starts.
  const open = layout.slice(layout.indexOf('const openSpace = useCallback('), layout.indexOf('setPhase({ kind: \'open\''));
  assert.match(open, /const direct = directOf\(data\);\s+setDirect\(direct\);\s+if \(direct !== data\.direct\) updateSpaceData\(space, spaceKey, \{ direct \}\)/);
  assert.ok(open.indexOf('setDirect(direct)') < open.indexOf('applyTor(') && open.indexOf('setDirect(direct)') < open.indexOf('setNostr('));
  // As it closes.
  const close = layout.slice(layout.indexOf('function closeSpace(): void {'));
  assert.match(close.slice(0, close.indexOf('\n}')), /setDirect\(false\);/);
  // The space's Tor way, and Nostr's own Tor switch: each writes the switch off with it.
  const tor = readFileSync(join(APP, 'app', 'tor.tsx'), 'utf8');
  assert.match(tor, /const data = await loadCurrentSpaceData\(\);\s+const direct = next !== 'off' && data\.direct;\s+await updateCurrentSpaceData\(direct \? \{ tor: next, direct: false \} : \{ tor: next \}\);\s+if \(direct\) setDirect\(false\);/);
  const nostr = readFileSync(join(APP, 'app', 'nostr.tsx'), 'utf8');
  assert.match(nostr, /const direct = next\.tor === true && setting\?\.tor !== true && \(await loadCurrentSpaceData\(\)\)\.direct;\s+await updateCurrentSpaceData\(direct \? \{ nostr: next, direct: false \} : \{ nostr: next \}\);\s+if \(direct\) setDirect\(false\);/);
  // Nothing else writes the space's Tor way, or its Nostr setting.
  const writes: string[] = [];
  const look = (folder: string) => {
    for (const entry of readdirSync(join(APP, folder), { withFileTypes: true })) {
      const path = `${folder}/${entry.name}`;
      if (entry.isDirectory()) look(path);
      else if (/\.tsx?$/.test(entry.name) && /update(?:Current)?SpaceData\([^)]*\b(?:tor:|nostr\b)/.test(readFileSync(join(APP, path), 'utf8'))) writes.push(path);
    }
  };
  for (const folder of ['app', 'components', 'lib']) look(folder);
  assert.deepEqual(writes.sort(), ['app/nostr.tsx', 'app/tor.tsx']);
  // And choosing a mode, which writes all three as the mode says (lib/modes.ts modeChange, checks/modes.check.ts).
  const picker = readFileSync(join(APP, 'components', 'mode-picker.tsx'), 'utf8');
  assert.equal(picker.match(/update(?:Current)?SpaceData\(/g)?.length, 1);
  assert.match(picker, /const next = modeChange\(data, mode\);\s+await updateCurrentSpaceData\(next\);/);
});

test('the spam list comes without Tor unasked only while Direct connections are on, and nothing is kept as said', async () => {
  const { spamNow } = await import('./phone-memory');
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now() + 400 * day;
  const list = async () => ({ status: 200, bytes: new TextEncoder().encode('+30 211 000 4455\n') });
  const noTor = () => false;
  // Switched on with nothing said (as with Direct connections on, or with Tor): no word kept that it may come without Tor.
  await setSpamWeekly(true, false);
  Object.assign(spamNow, { source: 'https://lists.example.org/spam.txt', at: now - SPAM_EVERY - day, auto: true });
  assert.equal(await refreshSpamList(now, list, noTor, () => false), false, 'off: it waits, as before');
  assert.equal(await refreshSpamList(now, list, noTor, () => true), true, 'on: it comes');
  // Turned off again, it waits again: nothing was kept as said meanwhile.
  Object.assign(spamNow, { at: now });
  assert.equal(await refreshSpamList(now + 3 * SPAM_EVERY, list, noTor, () => false), false);
  assert.equal(await refreshSpamList(now + 3 * SPAM_EVERY, list, noTor, () => true), true);
  // Through Tor it comes as ever, whatever the switch says.
  Object.assign(spamNow, { at: now });
  assert.equal(await refreshSpamList(now + 6 * SPAM_EVERY, list, () => true, () => false), true);
  await setSpamWeekly(false, false);
  Object.assign(spamNow, { auto: false, source: '', at: 0 });
  // The screen asks neither for the weekly download nor for one now while it is on, and keeps no word of it.
  const screen = readFileSync(join(APP, 'app', 'phone-settings.tsx'), 'utf8');
  assert.match(screen, /const withoutTor = on && !netThroughTor\(\) && !directNow\(\);/);
  assert.match(screen, /if \(!netThroughTor\(\) && !directNow\(\)\) \{/);
});
