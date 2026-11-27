// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Matrix calls (lib/matrix-calls.ts) with Element Call as Erevos hosts it (lib/matrix-widget.ts),
// against the small homeserver of checks/matrix-server.ts and the real core built to WebAssembly:
// the call app gets only what a call needs, in its own room, as its own member; its member state
// goes now or delayed (both ways a homeserver may take a delay); what it sends to the room goes
// encrypted as the room is, and its media keys reach the other side's devices through Olm; it gets
// who the account is (OpenID) and where the media server is. A ring rings, is answered (with the
// camera on or off), declined, missed, answered on another device, and each leaves its line in the
// chat once.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';

import { setCore, type Core } from '../lib/core';
import { hiddenRinging, setHiddenRinging } from '../lib/hidden-ring';
import { joinRoom, sendEvent, sendStateEvent, setCallHandler, setMatrixHttp, setRoomTap, signIn, startChat, sync, type CallEvent, type MatrixState } from '../lib/matrix';
import {
  answerMatrixCall,
  callWindowClosed,
  callWindowMessage,
  declineMatrixCall,
  elementCallUrl,
  hangUpMatrixCall,
  matrixCallLine,
  ringOf,
  shownMatrixCall,
  startMatrixCall,
  watchMatrixCalls,
  type CallWindow,
} from '../lib/matrix-calls';
import { allowedCapability, CALL_MEMBER, HOST_VERSIONS, hostWidget, type WidgetAccount, type WidgetHost, type WidgetMessage, type WidgetNews } from '../lib/matrix-widget';
import { onPlaceNetworkRing } from '../lib/network-notices';
import { setThroughTor } from '../lib/relay';
import { Homeserver, HS, PASSWORD, type Json } from './matrix-server';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built) && typeof (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>).matrix === 'function';
if (!coreReady) console.log('Skipping the Matrix call checks: build the core first with node checks/build-core.mjs');

const server = new Homeserver();

before(() => {
  if (!coreReady) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => fn(...args)])) as unknown as Core);
  setMatrixHttp(async (request) => server.answer(request));
});

after(() => setCore(null));

// Waits until `done` holds, as the host's answers come a few steps later.
async function until(done: () => boolean, what: string, ms = 5000): Promise<void> {
  const end = Date.now() + ms;
  while (!done()) {
    if (Date.now() > end) throw new Error(`Waited in vain for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

// The account as lib/matrix-store.ts gives it: changes one after another, reads at once.
function accountOf(get: () => MatrixState): Pick<WidgetAccount, 'change' | 'read'> {
  let chain: Promise<unknown> = Promise.resolve();
  return {
    change<T>(use: (state: MatrixState) => Promise<T>): Promise<T> {
      const run = chain.then(() => use(get()));
      chain = run.catch(() => undefined);
      return run;
    },
    read: <T>(use: (state: MatrixState) => Promise<T>) => use(get()),
  };
}

// What Element Call asks for (its src/widget.ts), and a few things it must not get.
const asks = (userId: string, deviceId: string, roomId: string) => [
  'm.always_on_screen',
  'org.matrix.msc4039.download_file',
  `org.matrix.msc2762.timeline:${roomId}`,
  'org.matrix.msc2762.send.event:org.matrix.msc4075.call.notify',
  'org.matrix.msc2762.send.event:org.matrix.msc4075.rtc.notification',
  'org.matrix.msc2762.send.event:io.element.call.encryption_keys',
  'org.matrix.msc2762.receive.event:io.element.call.encryption_keys',
  'org.matrix.msc2762.send.event:org.matrix.msc4310.rtc.decline',
  'org.matrix.msc2762.receive.event:org.matrix.msc4310.rtc.decline',
  'org.matrix.msc2762.send.event:org.matrix.rageshake_request',
  `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#${userId}`,
  `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#_${userId}_${deviceId}_m.call`,
  `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#${userId}_${deviceId}_m.call`,
  'org.matrix.msc2762.receive.state_event:m.room.create',
  'org.matrix.msc2762.receive.state_event:m.room.member',
  'org.matrix.msc2762.receive.state_event:m.room.encryption',
  `org.matrix.msc2762.receive.state_event:${CALL_MEMBER}`,
  'org.matrix.msc3819.send.to_device:io.element.call.encryption_keys',
  'org.matrix.msc3819.receive.to_device:io.element.call.encryption_keys',
  'org.matrix.msc3819.send.to_device:m.call.invite',
  'org.matrix.msc4157.send.delayed_event',
  'org.matrix.msc4157.update_delayed_event',
  'org.matrix.msc4515.rtc_transports',
  'org.matrix.msc4407.send.sticky_event',
  // Not for it: another room, a chat message, another's membership, the room's power.
  'org.matrix.msc2762.timeline:!elsewhere:example.org',
  'org.matrix.msc2762.send.event:m.room.message',
  `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#_@bob:example.org_BOBDEV_m.call`,
  'org.matrix.msc2762.send.state_event:m.room.power_levels',
  'org.matrix.msc2762.receive.state_event:m.room.power_levels',
  'org.matrix.msc3819.send.to_device:m.room_key',
];

// Element Call's side of the Widget API, as far as the checks need it: it answers what it is
// asked as Element Call does, and asks the host what it wants.
function callApp(deliver: (message: WidgetMessage) => void, requested: () => string[]) {
  let widgetId = '';
  let n = 0;
  const posted: WidgetMessage[] = [];
  const waiting = new Map<string, (response: Json) => void>();
  return {
    posted,
    set id(id: string) {
      widgetId = id;
    },
    /** What the host posts to it. */
    take(message: WidgetMessage) {
      posted.push(message);
      if (message.api === 'toWidget' && !message.response) {
        const response = message.action === 'capabilities' ? { capabilities: requested() } : {};
        setTimeout(() => deliver({ ...message, response }), 0);
      } else if (message.api === 'fromWidget' && message.response) {
        waiting.get(message.requestId)?.(message.response);
        waiting.delete(message.requestId);
      }
    },
    send(action: string, data: Json = {}): Promise<Json> {
      const requestId = `ec-${++n}`;
      return new Promise((resolve) => {
        waiting.set(requestId, resolve);
        deliver({ api: 'fromWidget', widgetId, requestId, action, data });
      });
    },
    told(action: string): WidgetMessage[] {
      return posted.filter((m) => m.api === 'toWidget' && !m.response && m.action === action);
    },
  };
}

test('Element Call gets only what a call needs, in its own room, as its own member', () => {
  const me = '@alice:example.org';
  const room = '!call:example.org';
  const allowed = asks(me, 'DEV1', room).filter((c) => allowedCapability(c, room, me, 'DEV1'));
  assert.deepEqual(
    asks(me, 'DEV1', room).filter((c) => !allowed.includes(c)),
    [
      'org.matrix.msc4039.download_file',
      'org.matrix.msc2762.send.event:org.matrix.rageshake_request',
      'org.matrix.msc4407.send.sticky_event',
      'org.matrix.msc2762.timeline:!elsewhere:example.org',
      'org.matrix.msc2762.send.event:m.room.message',
      `org.matrix.msc2762.send.state_event:${CALL_MEMBER}#_@bob:example.org_BOBDEV_m.call`,
      'org.matrix.msc2762.send.state_event:m.room.power_levels',
      'org.matrix.msc2762.receive.state_event:m.room.power_levels',
      'org.matrix.msc3819.send.to_device:m.room_key',
    ],
  );
  // A member state key for this account on another device, or one that only starts like ours, is not ours.
  assert.ok(!allowedCapability(`org.matrix.msc2762.send.state_event:${CALL_MEMBER}#_${me}_DEV2_m.call`, room, me, 'DEV1'));
  assert.ok(!allowedCapability(`org.matrix.msc2762.send.state_event:${CALL_MEMBER}#${me}x`, room, me, 'DEV1'));
  assert.ok(!allowedCapability(`org.matrix.msc2762.send.state_event:${CALL_MEMBER}`, room, me, 'DEV1'));
});

test('Element Call opens with its settings in the fragment, and nothing of Element sent anywhere', () => {
  const url = elementCallUrl({
    page: 'https://appassets.androidplatform.net/element-call/index.html',
    parentUrl: 'https://appassets.androidplatform.net/element-call/index.html',
    widgetId: 'w1',
    roomId: '!r:example.org',
    userId: '@alice:example.org',
    deviceId: 'DEV1',
    baseUrl: HS,
    intent: 'join_existing_dm',
  });
  const [page, fragment] = url.split('#?');
  assert.equal(page, 'https://appassets.androidplatform.net/element-call/index.html');
  const params = new URLSearchParams(fragment);
  assert.equal(params.get('roomId'), '!r:example.org');
  assert.equal(params.get('intent'), 'join_existing_dm');
  assert.equal(params.get('perParticipantE2EE'), 'true');
  assert.equal(params.get('allowIceFallback'), 'false');
  assert.equal(params.get('confineToRoom'), 'true');
  for (const key of params.keys()) assert.ok(!/posthog|sentry|rageshake|analytics/i.test(key), key);
  // On a phone Erevos chooses earpiece or loudspeaker; in a browser Element Call lists the computer's own.
  assert.equal(params.get('controlledAudioDevices'), 'true');
  const framed = new URLSearchParams(
    elementCallUrl({ page: 'https://call.example.org/element-call/index.html', parentUrl: 'https://erevos.example.org/', widgetId: 'w1', roomId: '!r:example.org', userId: '@alice:example.org', deviceId: 'DEV1', baseUrl: HS, intent: 'start_call', hostAudio: false }).split('#?')[1],
  );
  assert.equal(framed.get('controlledAudioDevices'), null);
  assert.equal(framed.get('parentUrl'), 'https://erevos.example.org/');
});

test('a ring rings for us only, for as long as it says and two minutes at most', () => {
  const now = 1_000_000;
  const ring = (content: Json, sender = '@alice:example.org', type = 'org.matrix.msc4075.rtc.notification'): CallEvent => ({ type, content, sender, ts: now, roomId: '!r', eventId: '$r' });
  const base = { notification_type: 'ring', 'm.mentions': { user_ids: ['@bob:example.org'] }, sender_ts: now, lifetime: 30_000 };
  assert.deepEqual(ringOf(ring(base), '@bob:example.org', now), { video: true, until: now + 30_000 });
  assert.deepEqual(ringOf(ring({ ...base, 'm.call.intent': 'audio' }), '@bob:example.org', now), { video: false, until: now + 30_000 });
  assert.equal(ringOf(ring(base), '@carol:example.org', now), null);
  assert.equal(ringOf(ring(base, '@bob:example.org'), '@bob:example.org', now), null);
  assert.equal(ringOf(ring({ ...base, notification_type: 'notification' }), '@bob:example.org', now), null);
  assert.equal(ringOf(ring({ ...base, lifetime: 3_600_000 }), '@bob:example.org', now)!.until, now + 120_000);
  // A sender's clock far ahead counts from the homeserver's.
  assert.equal(ringOf(ring({ ...base, sender_ts: now + 600_000 }), '@bob:example.org', now)!.until, now + 30_000);
  // The older ring, sent beside it.
  assert.ok(ringOf(ring({ notify_type: 'ring', 'm.mentions': { room: true }, application: 'm.call' }, '@alice:example.org', 'org.matrix.msc4075.call.notify'), '@bob:example.org', now));
  assert.equal(matrixCallLine({ id: 'x', roomId: '!r', video: false, outgoing: false, state: 'ended' }), 'Missed voice call');
  assert.equal(matrixCallLine({ id: 'x', roomId: '!r', video: true, outgoing: true, state: 'ended' }), 'Video call, not answered');
  assert.equal(matrixCallLine({ id: 'x', roomId: '!r', video: true, outgoing: false, state: 'ended', metAt: 1000 }, 84_000), 'Video call, 1:23');
});

let alice: MatrixState;
let bob: MatrixState;
let roomId = '';

async function twoPeople(): Promise<void> {
  if (roomId) return;
  alice = await signIn(HS, 'alice', PASSWORD);
  bob = await signIn(HS, 'bob', PASSWORD);
  roomId = (await startChat(alice, bob.userId)).id;
  await sync(bob, 0);
  await joinRoom(bob, roomId);
  await sync(bob, 0);
  await sync(alice, 0);
}

test('the host does what Element Call asks in the call room, and nothing else', { skip: !coreReady }, async () => {
  await twoPeople();
  const news: WidgetNews[] = [];
  let host: WidgetHost;
  const app = callApp((m) => host.receive(m), () => asks(alice.userId, alice.deviceId, roomId));
  app.id = 'w1';
  host = hostWidget({ widgetId: 'w1', roomId, account: { userId: alice.userId, deviceId: alice.deviceId, ...accountOf(() => alice) }, post: (m) => app.take(m), told: (n) => news.push(n) });

  assert.deepEqual((await app.send('supported_api_versions')).supported_versions, HOST_VERSIONS);
  await app.send('content_loaded');
  await until(() => app.told('update_state').length === 1, 'the room state');

  // What it was allowed, said back to it.
  const notified = app.told('notify_capabilities')[0].data as { requested: string[]; approved: string[] };
  assert.ok(notified.approved.includes(`org.matrix.msc2762.timeline:${roomId}`));
  assert.ok(!notified.approved.includes('org.matrix.msc2762.send.event:m.room.message'));
  assert.ok(!notified.approved.includes('org.matrix.msc4407.send.sticky_event'));
  // The room's state as far as it may read it: no power levels, only what it asked.
  const state = (app.told('update_state')[0].data.state as Json[]).map((e) => `${e.type} ${e.state_key}`).sort();
  assert.deepEqual(state, ['m.room.create ', `m.room.encryption `, `m.room.member ${alice.userId}`, `m.room.member ${bob.userId}`].sort());
  for (const e of app.told('update_state')[0].data.state as Json[]) assert.equal(e.room_id, roomId);

  // Its membership: now, then "left" kept back by the homeserver, restarted, and sent when it is time.
  const key = `_${alice.userId}_${alice.deviceId}_m.call`;
  const joined = await app.send('send_event', { type: CALL_MEMBER, state_key: key, content: { application: 'm.call', call_id: '', device_id: alice.deviceId, focus_active: { type: 'livekit' } } });
  assert.ok(String(joined.event_id).startsWith('$'));
  assert.equal(server.stateOf(roomId, CALL_MEMBER, key)!.content.device_id, alice.deviceId);
  const delayed = await app.send('send_event', { type: CALL_MEMBER, state_key: key, content: {}, delay: 8000 });
  assert.ok(delayed.delay_id);
  assert.equal(server.delayed.get(delayed.delay_id)!.delayMs, 8000);
  assert.deepEqual(await app.send('org.matrix.msc4157.update_delayed_event', { delay_id: delayed.delay_id, action: 'restart' }), {});
  assert.ok(server.delayed.has(delayed.delay_id));
  await app.send('org.matrix.msc4157.update_delayed_event', { delay_id: delayed.delay_id, action: 'send' });
  assert.deepEqual(server.stateOf(roomId, CALL_MEMBER, key)!.content, {});
  // A homeserver that takes delays only as MSC4140 first said gets them so.
  server.delaysAsFirst = true;
  const first = await app.send('send_event', { type: CALL_MEMBER, state_key: key, content: {}, delay: 5000 });
  assert.ok(first.delay_id);
  await app.send('org.matrix.msc4157.update_delayed_event', { delay_id: first.delay_id, action: 'cancel' });
  assert.ok(!server.delayed.has(first.delay_id));
  server.delaysAsFirst = false;

  // Not its to send: another's membership, a chat message, the room's power, another room, a delayed room event.
  for (const [data, why] of [
    [{ type: CALL_MEMBER, state_key: `_${bob.userId}_${bob.deviceId}_m.call`, content: {} }, /state events/],
    [{ type: 'm.room.message', content: { msgtype: 'm.text', body: 'hi' } }, /room events/],
    [{ type: 'm.room.power_levels', state_key: '', content: {} }, /state events/],
    [{ type: 'io.element.call.encryption_keys', content: {}, room_id: '!elsewhere:example.org' }, /room timeline/],
    [{ type: 'io.element.call.encryption_keys', content: {}, delay: 1000 }, /Delayed/],
  ] as const) {
    const answer = await app.send('send_event', data);
    assert.match(String((answer.error as Json | undefined)?.message), why);
  }

  // A room event goes encrypted, as the room is; Bob's side opens it. The key is long enough
  // that the encrypted text never holds it by chance (a short one did, now and then).
  const callKey = 'callKeyNeverOnTheServer';
  const before = server.log.length;
  const sent = await app.send('send_event', { type: 'io.element.call.encryption_keys', content: { keys: [{ index: 0, key: callKey }], member: { id: 'x' } } });
  assert.ok(sent.event_id);
  const onServer = server.log.slice(before).map((l) => l.event);
  assert.deepEqual(
    onServer.map((e) => e.type),
    ['m.room.encrypted'],
  );
  assert.ok(!JSON.stringify(onServer).includes(callKey));
  const seenByBob: Json[] = [];
  setRoomTap((r, event, timeline) => {
    if (r === roomId && timeline) seenByBob.push(event);
  });
  await sync(bob, 0);
  setRoomTap(null);
  const keys = seenByBob.find((e) => e.type === 'io.element.call.encryption_keys')!;
  assert.equal(keys.content.keys[0].key, callKey);
  assert.equal(keys.event_id, sent.event_id);
  assert.equal(keys.room_id, roomId);

  // To-device: its media keys reach Bob's device through Olm; never a room key.
  const toBob: CallEvent[] = [];
  setCallHandler(async (_s, e) => {
    toBob.push(e);
    return false;
  });
  assert.deepEqual(
    await app.send('send_to_device', { type: 'io.element.call.encryption_keys', encrypted: true, messages: { [bob.userId]: { [bob.deviceId]: { keys: { index: 0, key: 'media' } } } } }),
    {},
  );
  const refused = await app.send('send_to_device', { type: 'm.room_key', encrypted: true, messages: { [bob.userId]: { [bob.deviceId]: {} } } });
  assert.ok(refused.error);
  await sync(bob, 0);
  setCallHandler(null);
  const media = toBob.find((e) => e.type === 'io.element.call.encryption_keys')!;
  assert.equal(media.encrypted, true);
  assert.equal(media.sender, alice.userId);
  assert.equal((media.content.keys as Json).key, 'media');
  assert.equal(media.senderDevice, alice.deviceId);
  assert.ok(!toBob.some((e) => e.type === 'm.room_key'));

  // Who the account is, for the media server; and where that is: the homeserver's list, else its .well-known.
  const openId = await app.send('get_openid');
  assert.equal(openId.state, 'allowed');
  assert.equal(server.openId.get(openId.access_token), alice.userId);
  server.transports = [{ type: 'livekit', livekit_service_url: 'https://sfu.example.org' }];
  assert.deepEqual((await app.send('org.matrix.msc4515.get_rtc_transports')).rtc_transports, server.transports);
  server.transports = null;
  server.wellKnown = { 'm.homeserver': { base_url: HS }, 'org.matrix.msc4143.rtc_foci': [{ type: 'livekit', livekit_service_url: 'https://jwt.example.org' }] };
  assert.deepEqual((await app.send('org.matrix.msc4515.get_rtc_transports')).rtc_transports, [{ type: 'livekit', livekit_service_url: 'https://jwt.example.org' }]);
  server.wellKnown = null;

  // Reading state: only what it may.
  const members = await app.send('org.matrix.msc2876.read_events', { type: 'm.room.member', state_key: true });
  assert.equal((members.events as Json[]).length, 2);
  assert.ok((await app.send('org.matrix.msc2876.read_events', { type: 'm.room.power_levels', state_key: '' })).error);

  // Events of its room reach it; of another room, or of a kind it did not ask for, not.
  const told = app.posted.length;
  host.roomEvent({ type: CALL_MEMBER, state_key: '_@bob:example.org_X_m.call', content: {}, room_id: roomId, event_id: '$m', sender: bob.userId }, true);
  host.roomEvent({ type: 'io.element.call.encryption_keys', content: {}, room_id: '!elsewhere:example.org', event_id: '$o', sender: bob.userId }, true);
  host.roomEvent({ type: 'm.room.message', content: { body: 'secret' }, room_id: roomId, event_id: '$s', sender: bob.userId }, true);
  host.toDevice({ type: 'm.room_key', sender: bob.userId, content: {} }, true);
  host.toDevice({ type: 'io.element.call.encryption_keys', sender: bob.userId, content: { keys: {} } }, true);
  await until(() => app.posted.length >= told + 3, 'the events');
  assert.deepEqual(
    app.posted.slice(told).map((m) => m.action),
    ['update_state', 'send_event', 'send_to_device'],
  );
  assert.equal(app.posted.at(-1)!.data.encrypted, true);
  assert.ok(!JSON.stringify(app.posted).includes('secret'));

  // What it says of the call.
  await app.send('io.element.join', { audioInput: null, videoInput: null });
  await app.send('im.vector.hangup');
  assert.deepEqual(news, ['joined', 'hangup']);
  // Unknown asks are refused; after stop, nothing is answered.
  assert.ok((await app.send('download_file', { content_uri: 'mxc://x/y' })).error);
  host.stop();
  const quiet = app.posted.length;
  void app.send('supported_api_versions');
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(app.posted.length, quiet);
});

// Element Call's window in the checks: what it was opened at, and the call app inside.
function window_() {
  const opened: { url: string; video: boolean }[] = [];
  let closed = 0;
  let asked: string[] = [];
  const app = callApp((m) => callWindowMessage(m), () => asked);
  const shownIn: CallWindow = {
    open(url, video) {
      opened.push({ url, video });
      const params = new URLSearchParams(url.split('#?')[1]);
      app.id = params.get('widgetId')!;
      asked = asks(params.get('userId')!, params.get('deviceId')!, params.get('roomId')!);
    },
    post: (m) => app.take(m),
    close() {
      closed += 1;
    },
  };
  return { shownIn, opened, app, closed: () => closed };
}

const ring = (video: boolean, lifetime = 30_000) => ({
  notification_type: 'ring',
  'm.mentions': { user_ids: [bob.userId], room: false },
  sender_ts: Date.now(),
  lifetime,
  'm.call.intent': video ? 'video' : 'audio',
  'm.relates_to': { rel_type: 'org.matrix.msc4075.rtc.notification.parent', event_id: '$member' },
});

const callLines = (state: MatrixState) => state.rooms[roomId].messages.filter((m) => m.call).map((m) => [m.sender === state.userId ? 'mine' : 'theirs', m.text.replace(/^📞 /, '')]);

test('a Matrix call rings, is answered in Element Call, and leaves its line', { skip: !coreReady }, async () => {
  await twoPeople();
  const w = window_();
  const stop = watchMatrixCalls(w.shownIn, { now: () => bob, ...accountOf(() => bob), page: 'https://appassets.androidplatform.net/element-call/index.html', parentUrl: 'https://appassets.androidplatform.net/element-call/index.html' });
  try {
    const before = callLines(bob).length;
    const ringId = await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', ring(true));
    await sync(bob, 0);
    const call = shownMatrixCall()!;
    assert.equal(call.state, 'incoming');
    assert.equal(call.from, alice.userId);
    assert.equal(call.ring, ringId);
    assert.equal(call.video, true);
    // The older ring beside it rings no second time.
    await sendEvent(alice, roomId, 'org.matrix.msc4075.call.notify', { notify_type: 'ring', application: 'm.call', 'm.mentions': { user_ids: [bob.userId] }, call_id: '' });
    await sync(bob, 0);
    assert.equal(shownMatrixCall(), call);

    answerMatrixCall(call);
    assert.equal(call.state, 'open');
    assert.equal(w.opened.length, 1);
    const params = new URLSearchParams(w.opened[0].url.split('#?')[1]);
    assert.equal(params.get('intent'), 'join_existing_dm');
    assert.equal(params.get('roomId'), roomId);
    assert.equal(params.get('userId'), bob.userId);
    assert.equal(params.get('deviceId'), bob.deviceId);
    assert.equal(params.get('baseUrl'), HS);

    // Element Call comes up, joins; Alice is in the call: the call has met.
    await w.app.send('content_loaded');
    await until(() => w.app.told('update_state').length > 0, 'the room state');
    await w.app.send('io.element.join', {});
    assert.ok(call.joinedAt);
    await sendStateEvent(alice, roomId, CALL_MEMBER, `_${alice.userId}_${alice.deviceId}_m.call`, { application: 'm.call', device_id: alice.deviceId, focus_active: { type: 'livekit' } });
    await sync(bob, 0);
    assert.ok(call.metAt);
    // It hears of it too, through the room tap.
    await until(() => w.app.told('update_state').some((m) => (m.data.state as Json[]).some((e) => e.sender === alice.userId && e.type === CALL_MEMBER)), 'Alice in the call');

    // Hanging up asks Element Call to leave, then its window closes.
    hangUpMatrixCall();
    await until(() => call.state === 'ended', 'the call to end');
    assert.equal(w.closed(), 1);
    assert.equal(shownMatrixCall(), null);
    assert.equal(w.app.told('im.vector.hangup').length, 1);
    assert.deepEqual(callLines(bob).slice(before), [['theirs', 'Video call, 0:00']]);
    await sendStateEvent(alice, roomId, CALL_MEMBER, `_${alice.userId}_${alice.deviceId}_m.call`, {});
  } finally {
    stop();
  }
});

test('a ring turned down tells the caller; one not answered, or left by the caller, is missed', { skip: !coreReady }, async () => {
  await twoPeople();
  const w = window_();
  const stop = watchMatrixCalls(w.shownIn, { now: () => bob, ...accountOf(() => bob), page: 'https://x/index.html', parentUrl: 'https://x/index.html' });
  try {
    await sync(alice, 0);
    const before = callLines(bob).length;

    // Turned down: Alice's side gets the decline, about her ring.
    const ringId = await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', ring(false));
    await sync(bob, 0);
    declineMatrixCall(shownMatrixCall()!);
    assert.equal(shownMatrixCall(), null);
    await until(() => server.log.length > 0 && server.log.at(-1)!.event.sender === bob.userId, 'the decline');
    const declines: Json[] = [];
    setRoomTap((_r, event) => {
      if (event.type === 'org.matrix.msc4310.rtc.decline') declines.push(event);
    });
    await sync(alice, 0);
    setRoomTap(null);
    assert.equal(declines.length, 1);
    assert.deepEqual(declines[0].content['m.relates_to'], { rel_type: 'm.reference', event_id: ringId });

    // Not answered in time.
    await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', ring(false, 300));
    await sync(bob, 0);
    assert.equal(shownMatrixCall()?.state, 'incoming');
    await until(() => shownMatrixCall() === null, 'the ring to stop');

    // The caller left before it was answered.
    await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', ring(true));
    await sync(bob, 0);
    assert.equal(shownMatrixCall()?.state, 'incoming');
    await sendStateEvent(alice, roomId, CALL_MEMBER, `_${alice.userId}_${alice.deviceId}_m.call`, {});
    await sync(bob, 0);
    assert.equal(shownMatrixCall(), null);
    await until(() => callLines(bob).length === before + 3, 'the lines');

    assert.deepEqual(callLines(bob).slice(before), [
      ['mine', 'Voice call, turned down'],
      ['theirs', 'Missed voice call'],
      ['theirs', 'Missed video call'],
    ]);
    assert.equal(w.opened.length, 0);
  } finally {
    stop();
  }
});

test('a ring is answered with the camera off or on, whatever it said: Element Call starts so', { skip: !coreReady }, async () => {
  await twoPeople();
  const w = window_();
  const stop = watchMatrixCalls(w.shownIn, { now: () => bob, ...accountOf(() => bob), page: 'https://x/index.html', parentUrl: 'https://x/index.html' });
  try {
    for (const [video, answered, intent] of [
      [true, false, 'join_existing_dm_voice'],
      [false, true, 'join_existing_dm'],
    ] as const) {
      await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', ring(video));
      await sync(bob, 0);
      const call = shownMatrixCall()!;
      assert.equal(call.video, video);
      answerMatrixCall(call, answered);
      const opened = w.opened.at(-1)!;
      assert.equal(new URLSearchParams(opened.url.split('#?')[1]).get('intent'), intent);
      // Its sound to the loudspeaker with the camera, to the earpiece without.
      assert.equal(opened.video, answered);
      assert.equal(call.camera, answered);
      callWindowClosed();
      assert.equal(shownMatrixCall(), null);
    }
  } finally {
    stop();
  }
});

test('a ring answered or turned down on another of our devices stops here', { skip: !coreReady }, async () => {
  await twoPeople();
  const bobPhone = await signIn(HS, 'bob', PASSWORD);
  await sync(bobPhone, 0);
  const w = window_();
  await sync(bob, 0);
  const stop = watchMatrixCalls(w.shownIn, { now: () => bob, ...accountOf(() => bob), page: 'https://x/index.html', parentUrl: 'https://x/index.html' });
  try {
    const before = callLines(bob).length;
    await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', ring(true));
    await sync(bob, 0);
    assert.equal(shownMatrixCall()?.state, 'incoming');
    await sendStateEvent(bobPhone, roomId, CALL_MEMBER, `_${bob.userId}_${bobPhone.deviceId}_m.call`, { application: 'm.call', device_id: bobPhone.deviceId });
    await sync(bob, 0);
    assert.equal(shownMatrixCall(), null);

    const ringId = await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', ring(false));
    await sync(bob, 0);
    assert.equal(shownMatrixCall()?.state, 'incoming');
    await sync(bobPhone, 0);
    await sendEvent(bobPhone, roomId, 'org.matrix.msc4310.rtc.decline', { 'm.relates_to': { rel_type: 'm.reference', event_id: ringId } });
    await sync(bob, 0);
    assert.equal(shownMatrixCall(), null);

    assert.deepEqual(callLines(bob).slice(before), [
      ['mine', 'Video call, answered on another device'],
      ['mine', 'Voice call, turned down'],
    ]);
    await sendStateEvent(bobPhone, roomId, CALL_MEMBER, `_${bob.userId}_${bobPhone.deviceId}_m.call`, {});
  } finally {
    stop();
  }
});

test('a call we start opens Element Call to ring them; its window closed ends it', { skip: !coreReady }, async () => {
  await twoPeople();
  const w = window_();
  const stop = watchMatrixCalls(w.shownIn, { now: () => alice, ...accountOf(() => alice), page: 'https://x/index.html', parentUrl: 'https://x/index.html' });
  try {
    await sync(alice, 0);
    const before = callLines(alice).length;
    const call = startMatrixCall(roomId, false);
    assert.throws(() => startMatrixCall(roomId, true), /call already/);
    assert.equal(new URLSearchParams(w.opened[0].url.split('#?')[1]).get('intent'), 'start_call_dm_voice');
    assert.equal(w.opened[0].video, false);
    callWindowClosed();
    assert.equal(call.state, 'ended');
    assert.equal(shownMatrixCall(), null);
    await until(() => callLines(alice).length === before + 1, 'the line');
    assert.deepEqual(callLines(alice).slice(before), [['mine', 'Voice call, not answered']]);
  } finally {
    stop();
  }
});

test('a ring missed long ago leaves one line, however often sync brings it', { skip: !coreReady }, async () => {
  await twoPeople();
  const w = window_();
  const stop = watchMatrixCalls(w.shownIn, { now: () => bob, ...accountOf(() => bob), page: 'https://x/index.html', parentUrl: 'https://x/index.html' });
  try {
    const before = callLines(bob).length;
    await sendEvent(alice, roomId, 'org.matrix.msc4075.rtc.notification', { ...ring(true), sender_ts: Date.now() - 60_000 });
    await sync(bob, 0);
    assert.equal(shownMatrixCall(), null);
    const since = bob.since;
    bob.since = undefined;
    await sync(bob, 0);
    bob.since = since;
    assert.deepEqual(callLines(bob).slice(before), [['theirs', 'Missed video call']]);
  } finally {
    stop();
  }
});

test("a hidden place's own account rings and calls as itself, and its call ends as its hidden chats close", { skip: !coreReady }, async () => {
  await twoPeople();
  // The phone's open hidden place has an account of its own, carol, in a chat with Alice.
  const carol = await signIn(HS, 'carol', PASSWORD);
  const carolRoom = (await startChat(alice, carol.userId)).id;
  await sync(carol, 0);
  await joinRoom(carol, carolRoom);
  await sync(carol, 0);
  await sync(alice, 0);
  let open = true;
  const watching = new Set<() => void>();
  const closePlace = () => {
    open = false;
    watching.forEach((listener) => listener());
  };
  const w = window_();
  const stop = watchMatrixCalls(w.shownIn, {
    now: () => bob,
    ...accountOf(() => bob),
    place: { now: () => (open ? carol : null), ...accountOf(() => carol) },
    watch: (listener) => {
      watching.add(listener);
      return () => watching.delete(listener);
    },
    page: 'https://x/index.html',
    parentUrl: 'https://x/index.html',
  });
  try {
    // A ring to the place's account rings as the place's, and is answered as carol, in her room.
    await sendEvent(alice, carolRoom, 'org.matrix.msc4075.rtc.notification', { ...ring(false), 'm.mentions': { user_ids: [carol.userId], room: false } });
    await sync(carol, 0);
    const call = shownMatrixCall()!;
    assert.equal(call.place, true);
    assert.equal(call.roomId, carolRoom);
    // The space's account hears nothing of it, and a ring of its own waits: the phone is busy.
    await sync(bob, 0);
    assert.equal(shownMatrixCall(), call);
    answerMatrixCall(call);
    const params = new URLSearchParams(w.opened[0].url.split('#?')[1]);
    assert.equal(params.get('userId'), carol.userId);
    assert.equal(params.get('deviceId'), carol.deviceId);
    assert.equal(params.get('roomId'), carolRoom);
    assert.equal(params.get('intent'), 'join_existing_dm_voice');

    // Element Call hears of carol's room, through carol's sync only.
    await w.app.send('content_loaded');
    await until(() => w.app.told('update_state').length > 0, 'the room state');
    await sendStateEvent(alice, carolRoom, CALL_MEMBER, `_${alice.userId}_${alice.deviceId}_m.call`, { application: 'm.call', device_id: alice.deviceId, focus_active: { type: 'livekit' } });
    await sync(carol, 0);
    await until(() => w.app.told('update_state').some((m) => (m.data.state as Json[]).some((e) => e.sender === alice.userId && e.type === CALL_MEMBER)), 'Alice in the call');

    // The hidden chats close: the call ends with them, and Element Call's window closes.
    closePlace();
    assert.equal(call.state, 'ended');
    assert.equal(shownMatrixCall(), null);
    assert.equal(w.closed(), 1);
    await sendStateEvent(alice, carolRoom, CALL_MEMBER, `_${alice.userId}_${alice.deviceId}_m.call`, {});

    // Open again, a call from the place's chat goes as carol; the space's account is not in that room.
    open = true;
    assert.throws(() => startMatrixCall(carolRoom, true), /Not signed in/);
    const ours = startMatrixCall(carolRoom, true, true);
    assert.equal(ours.place, true);
    assert.equal(new URLSearchParams(w.opened[1].url.split('#?')[1]).get('userId'), carol.userId);
    hangUpMatrixCall();
    await until(() => ours.state === 'ended', 'the call to end');
    // Its line is in the place's chat, not the space's.
    assert.ok(carol.rooms[carolRoom].messages.some((m) => m.call && m.text.includes('Video call')));
  } finally {
    stop();
  }
});

test("a ring to a closed hidden place's own account that receives rings with no name, and rings in it once the PIN opens it", { skip: !coreReady }, async () => {
  await twoPeople();
  const carol = await signIn(HS, 'carol', PASSWORD);
  const carolRoom = (await startChat(alice, carol.userId)).id;
  await sync(carol, 0);
  await joinRoom(carol, carolRoom);
  await sync(carol, 0);
  await sync(alice, 0);
  // The place's hidden chats are closed, and receive: carol's account syncs all the same.
  let open = false;
  const watching = new Set<() => void>();
  const rang: [number, number][] = [];
  const stopRang = onPlaceNetworkRing((space, pocket) => rang.push([space, pocket]));
  const carolAccount = { now: () => carol, ...accountOf(() => carol) };
  const w = window_();
  const stop = watchMatrixCalls(w.shownIn, {
    now: () => bob,
    ...accountOf(() => bob),
    place: { now: () => (open ? carol : null), ...accountOf(() => carol) },
    closed: (state) => (!open && state === carol ? { space: 3, pocket: 1, account: carolAccount } : null),
    watch: (listener) => {
      watching.add(listener);
      return () => watching.delete(listener);
    },
    page: 'https://x/index.html',
    parentUrl: 'https://x/index.html',
  });
  const lines = () => carol.rooms[carolRoom].messages.filter((m) => m.call).map((m) => [m.sender === carol.userId ? 'mine' : 'theirs', m.text.replace(/^📞 /, '')]);
  try {
    // Alice rings: nothing shows; the place rings with no name.
    const mention = { 'm.mentions': { user_ids: [carol.userId], room: false } };
    await sendEvent(alice, carolRoom, 'org.matrix.msc4075.rtc.notification', { ...ring(false), ...mention });
    await sync(carol, 0);
    assert.equal(shownMatrixCall(), null);
    assert.deepEqual(rang, [[3, 1]]);
    // She leaves the call before the PIN: missed, and the ring stops.
    setHiddenRinging({ space: 3, pocket: 1, at: Date.now() });
    await sendStateEvent(alice, carolRoom, CALL_MEMBER, `_${alice.userId}_${alice.deviceId}_m.call`, {});
    await sync(carol, 0);
    assert.equal(hiddenRinging(), null);
    assert.deepEqual(lines(), [['theirs', 'Missed voice call']]);

    // Again, with video: the PIN opens the place, and it rings there, as the place's.
    await sendEvent(alice, carolRoom, 'org.matrix.msc4075.rtc.notification', { ...ring(true), ...mention });
    await sync(carol, 0);
    assert.equal(shownMatrixCall(), null);
    assert.equal(rang.length, 2);
    open = true;
    watching.forEach((listener) => listener());
    const call = shownMatrixCall()!;
    assert.deepEqual([call.state, call.place, call.held, call.video, call.roomId], ['incoming', true, true, true, carolRoom]);
    declineMatrixCall(call);
    assert.equal(shownMatrixCall(), null);
    await until(() => lines().length === 2, 'its line');

    // One not answered before the place opens is missed.
    open = false;
    watching.forEach((listener) => listener());
    await sendEvent(alice, carolRoom, 'org.matrix.msc4075.rtc.notification', { ...ring(false, 300), ...mention });
    await sync(carol, 0);
    assert.equal(rang.length, 3);
    await until(() => lines().length === 3, 'the missed line');
    open = true;
    watching.forEach((listener) => listener());
    assert.equal(shownMatrixCall(), null);
    assert.deepEqual(lines(), [
      ['theirs', 'Missed voice call'],
      ['mine', 'Video call, turned down'],
      ['theirs', 'Missed voice call'],
    ]);

    // One that rings with no name as INVISIBLE is chosen (lib/modes.ts) rings no more: kept at once
    // as missed, its line saying why.
    open = false;
    watching.forEach((listener) => listener());
    await sendEvent(alice, carolRoom, 'org.matrix.msc4075.rtc.notification', { ...ring(false), ...mention });
    await sync(carol, 0);
    assert.equal(rang.length, 4);
    setHiddenRinging({ space: 3, pocket: 1, at: Date.now() });
    setThroughTor('all');
    setThroughTor('off');
    assert.equal(hiddenRinging(), null);
    await until(() => lines().length === 4, 'the INVISIBLE line');
    assert.deepEqual(lines().at(-1), ['theirs', 'Missed voice call, in INVISIBLE']);
    assert.equal(w.opened.length, 0);
  } finally {
    setThroughTor('off');
    setHiddenRinging(null);
    stop();
    stopRang();
  }
});
