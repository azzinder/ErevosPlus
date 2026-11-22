// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Telegram calls (lib/telegram-calls.ts): TDLib's call updates as its JSON interface writes them,
// and the sound (NTgCalls) started, fed and stopped as they say.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readCall, TelegramCalls, type CallsNativeLike } from '../lib/telegram-calls';

const ready = { '@type': 'callStateReady', protocol: { '@type': 'callProtocol', library_versions: ['11.0.0'] }, servers: [], config: '{}', encryption_key: 'AAAA', emojis: ['🐱', '🚀', '🍋', '🎸'], allow_p2p: true, custom_parameters: '' };
const call = (id: number, outgoing: boolean, state: unknown) => ({ '@type': 'updateCall', call: { '@type': 'call', id, user_id: 2, is_outgoing: outgoing, is_video: false, state } });

function setup() {
  const asked: Record<string, unknown>[] = [];
  const sound: string[] = [];
  let changes = 0;
  let clock = 1000;
  const native: CallsNativeLike = {
    callProtocol: async () => JSON.stringify({ '@type': 'callProtocol', udp_p2p: true, udp_reflector: true, min_layer: 65, max_layer: 92, library_versions: ['11.0.0'] }),
    callStart: async (user, outgoing, r) => void sound.push(`start ${user} ${outgoing} ${(JSON.parse(r) as { encryption_key: string }).encryption_key}`),
    callSignal: async (user, data) => void sound.push(`signal ${user} ${data}`),
    callMute: async (on) => void sound.push(`mute ${on}`),
    callStop: async () => void sound.push('stop'),
  };
  const calls = new TelegramCalls(
    async (body) => {
      asked.push(body);
      return { '@type': 'ok' };
    },
    () => native,
    () => changes++,
    () => clock,
  );
  return { calls, asked, sound, changes: () => changes, tick: (ms: number) => (clock += ms) };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 5));

test('a call as TDLib says it: ringing, connecting, the emoji, ended and why', () => {
  assert.equal(readCall(call(1, false, { '@type': 'callStatePending', is_created: true, is_received: true }).call)?.stage, 'ringing');
  assert.equal(readCall(call(1, true, { '@type': 'callStatePending' }).call)?.stage, 'calling');
  const r = readCall(call(1, true, ready).call)!;
  assert.equal(r.stage, 'connecting');
  assert.deepEqual(r.emojis, ['🐱', '🚀', '🍋', '🎸']);
  // Ready again while talking stays talking.
  assert.equal(readCall(call(1, true, ready).call, { ...r, stage: 'talking' })?.stage, 'talking');
  const missed = readCall(call(1, false, { '@type': 'callStateDiscarded', reason: { '@type': 'callDiscardReasonMissed' } }).call)!;
  assert.deepEqual([missed.stage, missed.why], ['ended', 'missed']);
  assert.equal(readCall(call(1, false, { '@type': 'callStateError', error: { code: 500, message: 'CALL_PROTOCOL_LAYER_INVALID' } }).call)?.why, 'CALL_PROTOCOL_LAYER_INVALID');
  assert.equal(readCall({ nothing: true }), null);
});

test('calling out: the protocol from NTgCalls, the sound once ready, signaling both ways, hanging up', async () => {
  const { calls, asked, sound, tick } = setup();
  await calls.call(2);
  assert.equal(asked[0]['@type'], 'createCall');
  assert.deepEqual((asked[0].protocol as { library_versions: string[] }).library_versions, ['11.0.0']);
  calls.take(call(9, true, { '@type': 'callStatePending', is_created: true }));
  assert.equal(calls.current()?.stage, 'calling');
  await assert.rejects(calls.call(3), /busy/);
  // The other's signaling may come before the sound opens: it goes to the sound anyway, which keeps it.
  calls.take({ '@type': 'updateNewCallSignalingData', call_id: 9, data: 'b3RoZXI=' });
  calls.take(call(9, true, { '@type': 'callStateExchangingKeys' }));
  calls.take(call(9, true, ready));
  await settle();
  assert.deepEqual(sound, ['signal 2 b3RoZXI=', 'start 2 true AAAA']);
  // Ready told again does not start it twice.
  calls.take(call(9, true, ready));
  await settle();
  assert.equal(sound.filter((s) => s.startsWith('start')).length, 1);
  calls.fromSound('signal', 'bWluZQ==');
  assert.deepEqual(asked.at(-1), { '@type': 'sendCallSignalingData', call_id: 9, data: 'bWluZQ==' });
  calls.fromSound('state', 'CONNECTED');
  assert.equal(calls.current()?.stage, 'talking');
  await calls.mute(true);
  assert.equal(calls.current()?.muted, true);
  tick(61_000);
  await calls.hangUp(9);
  assert.equal(sound.at(-1), 'stop');
  const discard = asked.at(-1)!;
  assert.deepEqual([discard['@type'], discard.duration, discard.is_disconnected], ['discardCall', 61, false]);
  calls.take(call(9, true, { '@type': 'callStateDiscarded', reason: { '@type': 'callDiscardReasonHungUp' } }));
  assert.equal(calls.current()?.stage, 'ended');
  calls.forget(9);
  assert.equal(calls.current(), null);
});

test('a call comes in: answered; a second one while it goes on is declined as busy; lost sound hangs up', async () => {
  const { calls, asked, sound } = setup();
  calls.take(call(4, false, { '@type': 'callStatePending', is_created: true, is_received: true }));
  assert.equal(calls.current()?.stage, 'ringing');
  await calls.answer(4);
  assert.equal(asked.at(-1)!['@type'], 'acceptCall');
  calls.take(call(5, false, { '@type': 'callStatePending', is_created: true, is_received: true }));
  assert.deepEqual([asked.at(-1)!['@type'], asked.at(-1)!.call_id], ['discardCall', 5]);
  assert.equal(calls.current()?.id, 4);
  calls.take(call(4, false, ready));
  await settle();
  assert.equal(sound[0], 'start 2 false AAAA');
  calls.fromSound('state', 'FAILED');
  await settle();
  const discard = asked.at(-1)!;
  assert.deepEqual([discard['@type'], discard.call_id, discard.is_disconnected], ['discardCall', 4, true]);
  assert.equal(sound.at(-1), 'stop');
  // The other side ended it: the sound stops.
  calls.take(call(4, false, { '@type': 'callStateDiscarded', reason: { '@type': 'callDiscardReasonDisconnected' } }));
  assert.equal(calls.current()?.why, 'disconnected');
});

test('the sound ends with the call however it ends', async () => {
  const { calls, sound } = setup();
  calls.take(call(7, false, ready));
  await settle();
  calls.take(call(7, false, { '@type': 'callStateDiscarded', reason: { '@type': 'callDiscardReasonHungUp' } }));
  await settle();
  assert.deepEqual(sound, ['start 2 false AAAA', 'stop']);
  assert.equal(calls.take({ '@type': 'updateNewMessage' }), false);
});

test('a video call: the camera asked for goes with the sound, theirs is told, and ours turns off and on', async () => {
  const asked: Record<string, unknown>[] = [];
  const said: string[] = [];
  const native: CallsNativeLike = {
    callProtocol: async () => JSON.stringify({ '@type': 'callProtocol' }),
    callStart: async (_user, _outgoing, _ready, camera) => void said.push(`start camera=${camera}`),
    callSignal: async () => undefined,
    callMute: async () => undefined,
    callStop: async () => void said.push('stop'),
    callCamera: async (on) => void said.push(`camera ${on}`),
  };
  const calls = new TelegramCalls(async (body) => (asked.push(body), {}), () => native, () => undefined);
  await calls.call(5, true);
  assert.equal(asked[0].is_video, true);
  calls.take({ '@type': 'updateCall', call: { id: 9, user_id: 5, is_outgoing: true, is_video: true, state: { '@type': 'callStatePending' } } });
  assert.equal(calls.current()?.camera, true);
  calls.take({ '@type': 'updateCall', call: { id: 9, user_id: 5, is_outgoing: true, is_video: true, state: { '@type': 'callStateReady', emojis: ['a'] } } });
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.deepEqual(said, ['start camera=true']);
  calls.fromSound('video', 'on');
  assert.equal(calls.current()?.remoteVideo, true);
  await calls.camera(false);
  assert.deepEqual([calls.current()?.camera, said.at(-1)], [false, 'camera false']);
  await calls.hangUp(9);
  assert.equal(asked.at(-1)?.is_video, true);
});
