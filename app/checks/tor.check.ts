// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Tor ways (lib/relay.ts setThroughTor, lib/tor.ts). 'all': every relay request goes to the
// core's Tor and never to a WebSocket of the phone's own, and a build without Tor fails the request
// rather than going around it. 'messages', the first way of a space made before Tor was off
// unless changed: those of messages go to Tor while it is ready, and straight while it is not or
// just failed; those of files always straight. 'off', a new space's: nothing. With bridges
// (lib/bridges.ts), Tor is given them, or stopped when none is usable. Tor itself
// (crates/erevos-tor) is not run here.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { autoRoutes, BUILT_IN, bridgeLines, bridgeProblem, checkedBridges, LEARNED_DAYS, NO_BRIDGES, readBridgeLines } from '../lib/bridges';
import { coreReason, setCore, type Core } from '../lib/core';
import { createQueue, forgetRelayKeys, pinRelay, RelayError, relayCheck, RelaySession, setThroughTor, setTorReady, throughTor, TOR_REST_MS, torFor } from '../lib/relay';
import { applyTor, AUTO_WAIT, autoState, ensureTor, leaveTor, NoBridgesError, setTorMemory, torStatus } from '../lib/tor';
import { EMPTY_SPACE, torWayOf } from '../lock/space-data';

type Seen = { what: string; url?: string; token?: string; bytes?: Uint8Array };

function fakeCore(seen: Seen[], tor: boolean): Core {
  const reply = new Uint8Array(49);
  const core: Partial<Core> = {};
  if (tor) {
    Object.assign(core, {
      torStart: async (bridges: string) => void seen.push({ what: 'start', url: bridges }),
      torStatus: async () => JSON.stringify({ text: 'done', ready: true }),
      torStop: async () => void seen.push({ what: 'stop' }),
      torRequest: async (url: string, token: string, bytes: Uint8Array) => {
        seen.push({ what: 'request', url, token, bytes });
        return reply;
      },
      torOpen: async (url: string, token: string) => {
        seen.push({ what: 'open', url, token });
        return Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 7);
      },
      torCall: async (_id: Uint8Array, bytes: Uint8Array) => {
        seen.push({ what: 'call', bytes });
        if (bytes[0] === 99) throw new Error('the relay closed the connection');
        return Uint8Array.of(0, bytes[0]);
      },
      torClose: async () => {
        seen.push({ what: 'close' });
        return new Uint8Array(0);
      },
    });
  }
  return core as Core;
}

// Any WebSocket of the phone's own where Tor should be is a leak; where straight is right, the
// tests count it, and it fails with 'straight'.
let straight = 0;
let mayGoStraight = false;
(globalThis as { WebSocket?: unknown }).WebSocket = class {
  constructor() {
    if (!mayGoStraight) throw new Error('a WebSocket was opened while Tor is on');
    straight++;
    throw new Error('straight');
  }
};

afterEach(() => {
  leaveTor();
  setCore(null);
  straight = 0;
  mayGoStraight = false;
});

test('through Tor, a request goes to the core with the relay and its token', async () => {
  const seen: Seen[] = [];
  setCore(fakeCore(seen, true));
  setThroughTor('all');
  await createQueue({ url: 'wss://relay.example.org', token: 't' });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].what, 'request');
  assert.equal(seen[0].url, 'wss://relay.example.org');
  assert.equal(seen[0].token, 't');
  assert.deepEqual(seen[0].bytes, Uint8Array.of(1));
  assert.deepEqual(await torStatus(), { text: 'done', ready: true });
});

test('through Tor, a session takes its requests in order on one connection, and fails once lost', async () => {
  const seen: Seen[] = [];
  setCore(fakeCore(seen, true));
  setThroughTor('all');
  const session = await RelaySession.open({ url: 'ws://relay:7879' });
  const replies = await Promise.all([session.call(Uint8Array.of(1)), session.call(Uint8Array.of(2))]);
  assert.deepEqual(replies, [Uint8Array.of(0, 1), Uint8Array.of(0, 2)]);
  await assert.rejects(session.call(Uint8Array.of(99)), /Through Tor: the relay closed/);
  await assert.rejects(session.call(Uint8Array.of(3)), RelayError);
  session.close();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(
    seen.map((s) => s.what),
    ['open', 'call', 'call', 'call', 'close'],
  );
  assert.equal(seen[0].token, '');
});

test("through Tor, a failure says the core's own words, not what Expo puts around them", async () => {
  const said = 'cannot reach the relay at wss://relay.example.org, or the token is wrong: HTTP error: 401 Unauthorized';
  const expo = new Error(`Call to function 'ErevosCore.torRequest' has been rejected.\n→ Caused by: java.lang.IllegalArgumentException: ${said}`);
  assert.equal(coreReason(expo), said);
  assert.equal(coreReason(new Error('the relay closed the connection')), 'the relay closed the connection');
  assert.equal(coreReason('plain'), 'plain');
  setCore({ ...fakeCore([], true), torRequest: async () => Promise.reject(expo) } as Core);
  setThroughTor('all');
  await assert.rejects(createQueue({ url: 'wss://relay.example.org' }), (error: unknown) => {
    assert.ok(error instanceof RelayError);
    assert.equal(error.message, `Through Tor: ${said}`);
    return true;
  });
});

test('with Tor on, a build without Tor fails the request and does not go around it', async () => {
  setCore(fakeCore([], false));
  setThroughTor('all');
  await assert.rejects(createQueue({ url: 'ws://relay:7879' }), (error: unknown) => {
    assert.ok(error instanceof RelayError);
    assert.match(error.message, /no Tor/);
    return true;
  });
  await assert.rejects(RelaySession.open({ url: 'ws://relay:7879' }), /no Tor/);
  assert.equal(await torStatus(), null);
});

const FINGERPRINT = '0123456789ABCDEF0123456789ABCDEF01234567';
const OBFS4 = `obfs4 192.0.2.10:443 ${FINGERPRINT} cert=YXJlIGZyZXF1ZW50bHkgZnVsbCBvZiBsaXR0bGUgbWVzc2FnZXMgeW91IGNhbiBmaW5kLg iat-mode=0`;
const WEBTUNNEL = `webtunnel [2001:db8::1]:443 ${FINGERPRINT} url=https://example.org/secret-path ver=0.0.3`;
const PLAIN = `192.0.2.20:9001 ${FINGERPRINT}`;

test("Tor Browser's bridges, and one's own, are taken only as lines the app can use", () => {
  for (const line of [...BUILT_IN.obfs4, ...BUILT_IN.snowflake, OBFS4, WEBTUNNEL, PLAIN]) assert.equal(bridgeProblem(line), null, line);
  assert.equal(BUILT_IN.obfs4.length, 7);
  assert.ok(BUILT_IN.obfs4.every((line) => line.startsWith('obfs4 ')) && BUILT_IN.snowflake.every((line) => line.startsWith('snowflake ')));
  assert.equal(bridgeProblem(`conjure 192.0.2.30:443 ${FINGERPRINT}`), 'transport');
  assert.equal(bridgeProblem(`obfs4 bridge.example.org:443 ${FINGERPRINT} cert=x`), 'address');
  assert.equal(bridgeProblem(`obfs4 192.0.2.10:70000 ${FINGERPRINT}`), 'address');
  assert.equal(bridgeProblem('obfs4 192.0.2.10:443 cert=x iat-mode=0'), 'fingerprint');
  assert.equal(bridgeProblem(`obfs4 192.0.2.10:443 ${FINGERPRINT} cert`), 'setting');
  assert.equal(bridgeProblem(`snowflake 192.0.2.3:80 ${FINGERPRINT} ice=${'x'.repeat(600)}`), 'long');

  const pasted = `Bridge ${OBFS4}\r\n\n  ${WEBTUNNEL}  \n${OBFS4}\nnot a bridge\n${PLAIN}`;
  assert.deepEqual(readBridgeLines(pasted), { lines: [OBFS4, WEBTUNNEL, PLAIN], wrong: ['not a bridge'] });

  assert.deepEqual(bridgeLines(NO_BRIDGES), []);
  assert.deepEqual(bridgeLines({ ...NO_BRIDGES, use: 'snowflake', own: OBFS4 }), BUILT_IN.snowflake);
  assert.deepEqual(bridgeLines({ ...NO_BRIDGES, use: 'own', own: `${OBFS4}\n${PLAIN}` }), [OBFS4, PLAIN]);
  assert.deepEqual(bridgeLines({ ...NO_BRIDGES, use: 'own', own: 'not a bridge' }), []);
  assert.deepEqual(checkedBridges({ use: 'obfs4', own: 3 }), { ...NO_BRIDGES, use: 'obfs4', own: '' });
  assert.deepEqual(checkedBridges({ use: 'meek', own: PLAIN }), { ...NO_BRIDGES, use: 'none', own: PLAIN });
  assert.deepEqual(checkedBridges({ use: 'auto', watched: true, learned: { wifi: { route: 'snowflake', at: 5 }, moon: { route: 'obfs4', at: 1 }, cellular: { route: 'meek', at: 1 } } }), {
    ...NO_BRIDGES,
    use: 'auto',
    watched: true,
    learned: { wifi: { route: 'snowflake', at: 5 } },
  });
  assert.deepEqual(checkedBridges(undefined), NO_BRIDGES);
});

test('Tor is started through the chosen bridges, and stopped rather than started without them', async () => {
  const seen: Seen[] = [];
  setCore(fakeCore(seen, true));
  await applyTor('all', NO_BRIDGES);
  await applyTor('all', { ...NO_BRIDGES, use: 'obfs4', own: '' });
  await applyTor('all', { ...NO_BRIDGES, use: 'own', own: `Bridge ${PLAIN}` });
  assert.deepEqual(
    seen.map((s) => [s.what, s.url]),
    [
      ['start', ''],
      ['start', BUILT_IN.obfs4.join('\n')],
      ['start', PLAIN],
    ],
  );
  seen.length = 0;
  await assert.rejects(applyTor('all', { ...NO_BRIDGES, use: 'own', own: 'not a bridge' }), NoBridgesError);
  assert.deepEqual(seen.map((s) => s.what), ['stop']);
  // The space's requests still go to Tor, which is stopped, never around it.
  await createQueue({ url: 'wss://relay.example.org' });
  assert.deepEqual(seen.map((s) => s.what), ['stop', 'request']);
  // Off, Tor is left alone.
  seen.length = 0;
  await applyTor('off', { ...NO_BRIDGES, use: 'own', own: 'not a bridge' });
  assert.deepEqual(seen, []);
});

test('Automatic tries straight, obfs4, Snowflake and one’s own in turn, the way learned first, and never straight on a watched network', () => {
  const day = 24 * 3600_000;
  const now = 100 * day;
  const auto = { ...NO_BRIDGES, use: 'auto' as const };
  assert.deepEqual(autoRoutes(auto, 'wifi', now), ['none', 'obfs4', 'snowflake']);
  assert.deepEqual(autoRoutes({ ...auto, own: PLAIN }, 'wifi', now), ['none', 'obfs4', 'snowflake', 'own']);
  assert.deepEqual(autoRoutes({ ...auto, watched: true }, 'wifi', now), ['obfs4', 'snowflake']);
  const learned = { ...auto, learned: { wifi: { route: 'snowflake' as const, at: now - day } } };
  assert.deepEqual(autoRoutes(learned, 'wifi', now), ['snowflake', 'none', 'obfs4']);
  assert.deepEqual(autoRoutes(learned, 'cellular', now), ['none', 'obfs4', 'snowflake'], 'learned on another network');
  assert.deepEqual(autoRoutes(learned, 'wifi', now + (LEARNED_DAYS + 1) * day), ['none', 'obfs4', 'snowflake'], 'too old');
  const straight = { ...auto, watched: true, learned: { wifi: { route: 'none' as const, at: now } } };
  assert.deepEqual(autoRoutes(straight, 'wifi', now), ['obfs4', 'snowflake'], 'learned straight, but now watched');
});

test('Automatic keeps the first way that connects and learns it for the network; none connecting stops Tor', async () => {
  const seen: Seen[] = [];
  const core = fakeCore(seen, true);
  let lines = '';
  core.torStart = async (bridges: string) => {
    lines = bridges;
    seen.push({ what: 'start', url: bridges });
  };
  // Only the obfs4 bridges connect here.
  core.torStatus = async () => JSON.stringify({ text: '', ready: lines === BUILT_IN.obfs4.join('\n') });
  setCore(core);
  const kept: unknown[] = [];
  setTorMemory(() => 'wifi', async (bridges) => void kept.push(bridges.learned));
  const waits = { ...AUTO_WAIT };
  for (const route of Object.keys(AUTO_WAIT) as (keyof typeof AUTO_WAIT)[]) AUTO_WAIT[route] = 0;
  try {
    await applyTor('all', { ...NO_BRIDGES, use: 'auto' });
    await ensureTor();
    assert.deepEqual(seen.map((s) => s.url), ['', BUILT_IN.obfs4.join('\n')]);
    assert.equal(autoState().using, 'obfs4');
    assert.equal((kept[0] as { wifi: { route: string } }).wifi.route, 'obfs4');
    // Watched, and nothing connects: never straight; each tried, then Tor stopped.
    seen.length = 0;
    core.torStatus = async () => JSON.stringify({ text: '', ready: false });
    await applyTor('all', { ...NO_BRIDGES, use: 'auto', watched: true, own: 'not a bridge' });
    await assert.rejects(ensureTor(), NoBridgesError);
    assert.deepEqual(seen.map((s) => s.what === 'stop' ? 'stop' : s.url), [BUILT_IN.obfs4.join('\n'), BUILT_IN.snowflake.join('\n'), 'stop']);
    assert.equal(autoState().failed, true);
  } finally {
    Object.assign(AUTO_WAIT, waits);
    setTorMemory(() => 'other', async () => undefined);
  }
});

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("the way 'messages' sends those of messages through Tor once it is ready, and those of files straight", async () => {
  const seen: Seen[] = [];
  setCore(fakeCore(seen, true));
  mayGoStraight = true;
  await applyTor('messages', NO_BRIDGES);
  await settle();
  assert.equal(torFor(false), true, 'ready, as the core says');
  assert.equal(throughTor(), false, 'not everything goes through Tor');
  await createQueue({ url: 'wss://relay.example.org', token: 't' });
  assert.deepEqual(seen.map((s) => s.what), ['start', 'request']);
  // Files go straight: to the phone's own WebSocket.
  await assert.rejects(RelaySession.open({ url: 'wss://relay.example.org' }, true), /straight/);
  assert.equal(straight, 1);
  // A session of messages goes through Tor.
  const session = await RelaySession.open({ url: 'wss://relay.example.org' });
  session.close();
  assert.equal(seen.filter((s) => s.what === 'open').length, 1);
});

test("the way 'messages' goes straight while Tor is not ready, and for a while after it failed", async () => {
  const seen: Seen[] = [];
  setCore(fakeCore(seen, true));
  setThroughTor('messages');
  mayGoStraight = true;
  setTorReady(false);
  await assert.rejects(createQueue({ url: 'wss://relay.example.org' }), /straight/);
  assert.equal(straight, 1);
  assert.deepEqual(seen, []);
  setTorReady(true);
  const session = await RelaySession.open({ url: 'ws://relay:7879' });
  await assert.rejects(session.call(Uint8Array.of(99)), /Through Tor/);
  session.close();
  const now = Date.now();
  assert.equal(torFor(false, now), false, 'rests from Tor');
  assert.equal(torFor(false, now + TOR_REST_MS + 1), true, 'and tries it again');
  // A build without Tor sends those of messages straight, and never asks for it.
  setCore(fakeCore([], false));
  await applyTor('messages', NO_BRIDGES);
  await settle();
  assert.equal(torFor(false), false);
});

test("the way 'messages' sends straight at once what Tor could not take to the relay, so it never waits for Tor", async () => {
  const seen: Seen[] = [];
  const exit = 'cannot reach relay.example.org through Tor: tor: operation timed out at exit: Timed out while waiting for answer from exit';
  setCore({ ...fakeCore(seen, true), torRequest: async () => Promise.reject(new Error(exit)) } as Core);
  setThroughTor('messages');
  setTorReady(true);
  mayGoStraight = true;
  await assert.rejects(createQueue({ url: 'wss://relay.example.org' }), /straight/);
  assert.equal(straight, 1, 'tried straight once Tor failed');
  assert.equal(torFor(false), false, 'and those after it go straight for a while');
  // Everything through Tor: never straight, and Tor's timeout said as a direct one is.
  straight = 0;
  mayGoStraight = false;
  setThroughTor('all');
  await assert.rejects(createQueue({ url: 'wss://relay.example.org' }), (error: Error) => error.message === 'Through Tor: the server did not answer in time');
  assert.equal(straight, 0);
});

test("through Tor, a relay whose key is known but that has no channel, as one from before them, is asked again through Tor, never straight", async () => {
  const seen: Seen[] = [];
  setCore({
    ...fakeCore(seen, true),
    sealPublic: async () => new Uint8Array(32).fill(9),
    relayChannelKeys: async () => new Uint8Array(64),
    torOpenChannel: async (url: string) => {
      seen.push({ what: 'channel', url });
      return Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 8);
    },
    // A relay from before channels ends the connection at the hello.
    torCall: async (_id: Uint8Array, bytes: Uint8Array) => {
      seen.push({ what: 'call', bytes });
      throw new Error('the relay closed the connection');
    },
  } as Core);
  setThroughTor('messages');
  setTorReady(true);
  const url = 'wss://relay.example.org';
  pinRelay(url, new Uint8Array(32).fill(3));
  try {
    await createQueue({ url, token: 't' });
    assert.deepEqual(seen.map((s) => s.what), ['channel', 'call', 'close', 'request']);
    assert.equal(seen[1].bytes?.[0], 0xec);
    assert.equal(seen[3].token, 't');
    assert.equal(straight, 0);
    assert.equal(torFor(false), true, 'Tor does not rest for a relay with no channel');
    assert.equal(relayCheck(url), 'none');
  } finally {
    forgetRelayKeys();
  }
});

test("bridges none usable: the way 'messages' stops Tor and sends straight", async () => {
  const seen: Seen[] = [];
  setCore(fakeCore(seen, true));
  mayGoStraight = true;
  await assert.rejects(applyTor('messages', { ...NO_BRIDGES, use: 'own', own: 'not a bridge' }), NoBridgesError);
  assert.deepEqual(seen.map((s) => s.what), ['stop']);
  // The fake core says ready, but a real stopped Tor would not: as it says, so goes the request.
  setTorReady(false);
  await assert.rejects(createQueue({ url: 'wss://relay.example.org' }), /straight/);
  assert.equal(straight, 1);
});

test("a space's Tor way: none unless turned on, the way one kept stays; from before the ways, all stays all", () => {
  assert.equal(EMPTY_SPACE.tor, 'off', 'Tor makes messages slower: a new space sends nothing through it');
  assert.equal(torWayOf(true), 'all');
  assert.equal(torWayOf(false), 'messages');
  assert.equal(torWayOf(undefined), 'off');
  assert.equal(torWayOf('all'), 'all');
  assert.equal(torWayOf('off'), 'off');
  assert.equal(torWayOf('messages'), 'messages');
  assert.equal(torWayOf('anything'), 'off');
});
