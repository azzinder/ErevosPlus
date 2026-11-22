// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Signal's calls in Erevos+ (lib/signal-calls.ts): how RingRTC's call stands, read into what the
// call screen shows.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readJson } from '../lib/messenger';
import { readSignalCall, signalCallTalks } from '../lib/signal-calls';

const ev = (o: Record<string, unknown>) => ({ type: 'signalCallState', network: 'signal', uuid: 'u-1', person: '-42', name: 'Ada', callId: '18446744073709551615', ...o });

test('not a call state: nothing', () => {
  assert.equal(readSignalCall({ type: 'message' }, null, 1), null);
  assert.equal(readSignalCall(ev({ stage: 'nonsense' }), null, 1), null);
});

test('a call that rings, is answered, talks and ends', () => {
  const ringing = readSignalCall(ev({ stage: 'incoming', video: true }), null, 1000)!;
  assert.equal(ringing.stage, 'ringing');
  assert.equal(ringing.since, null);
  // A video call starts on the loudspeaker.
  assert.equal(ringing.speaker, true);
  const talking = readSignalCall(ev({ stage: 'talking', video: true, camera: true }), ringing, 5000)!;
  assert.equal(talking.stage, 'talking');
  assert.equal(talking.since, 5000);
  assert.ok(signalCallTalks(talking));
  // The length counts from when it began to talk, through a reconnection.
  const again = readSignalCall(ev({ stage: 'reconnecting', video: true }), talking, 9000)!;
  assert.equal(again.since, 5000);
  const ended = readSignalCall(ev({ stage: 'ended', why: 'declined' }), again, 12000)!;
  assert.equal(ended.stage, 'ended');
  assert.equal(ended.why, 'declined');
  assert.equal(ended.since, 5000);
  assert.ok(!signalCallTalks(ended));
});

test('the owner\'s loudspeaker stays with the call; a new call starts afresh', () => {
  const voice = readSignalCall(ev({ stage: 'calling', outgoing: true }), null, 1)!;
  assert.equal(voice.speaker, false);
  const chosen = { ...voice, speaker: true };
  assert.equal(readSignalCall(ev({ stage: 'talking', outgoing: true }), chosen, 2)!.speaker, true);
  const other = readSignalCall(ev({ stage: 'incoming', callId: '7' }), { ...chosen, stage: 'ended' }, 3)!;
  assert.equal(other.speaker, false);
  assert.equal(other.since, null);
});

test('the 64-bit call id stays whole through the event\'s JSON', () => {
  const e = readJson('{"type":"signalCallState","stage":"calling","callId":"18446744073709551615","uuid":"u"}');
  assert.equal(readSignalCall(e, null, 1)!.id, '18446744073709551615');
  // An ended call with no reason says it was hung up.
  assert.equal(readSignalCall(ev({ stage: 'ended' }), null, 1)!.why, 'hung up');
});
