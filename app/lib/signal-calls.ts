// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Signal's 1:1 voice and video calls in Erevos+ (modules/erevos-messenger, SignalCalls.kt): RingRTC,
// Signal's own calling library, does the call, so it rings and talks with the official Signal apps;
// the call's messages go between it and the Signal engine without passing here. What comes here is
// how the call stands (the module's signalCallState events), read into what the call screen shows
// (components/signal-call.tsx). Pure, so the checks can run it; lib/messenger-store.ts keeps it.
//
// The call is end to end encrypted, as in Signal, and goes through Signal's own relays (TURN):
// the other phone never learns this phone's address.

/** How a call stands: ours rings at theirs ('calling'), theirs rings here ('ringing'). */
export type SignalCallStage = 'calling' | 'ringing' | 'talking' | 'reconnecting' | 'ended';

export type SignalCall = {
  /** RingRTC's call id (a 64-bit number, as text). */
  id: string;
  /** The other person: their Signal ACI, their chat key and name as Signal tells it. */
  uuid: string;
  person: string;
  name: string;
  outgoing: boolean;
  video: boolean;
  stage: SignalCallStage;
  /** When it began to talk (ms), for the call's length. */
  since: number | null;
  muted: boolean;
  /** This phone's camera is in the call. */
  camera: boolean;
  /** The other phone's camera is on: their picture shows. */
  remoteVideo: boolean;
  /** Through the loudspeaker (else the earpiece). */
  speaker: boolean;
  /** Why it ended: 'hung up', 'declined', 'busy', 'no answer', 'missed', 'disconnected', or RingRTC's word. */
  why: string;
};

type Raw = Record<string, unknown>;

const STAGES: Record<string, SignalCallStage> = {
  calling: 'calling',
  incoming: 'ringing',
  ringing: 'ringing',
  talking: 'talking',
  reconnecting: 'reconnecting',
  ended: 'ended',
};

const str = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '');

/**
 * A signalCallState event read into the call it says, given the call shown before (its start time,
 * name and loudspeaker stay); null when it is not one.
 */
export function readSignalCall(event: unknown, before: SignalCall | null, now: number): SignalCall | null {
  const e = (event ?? {}) as Raw;
  if (e.type !== 'signalCallState') return null;
  const stage = STAGES[str(e.stage)];
  if (!stage) return null;
  const id = str(e.callId) || (before && before.uuid === str(e.uuid) ? before.id : '');
  const same = !!before && (before.id === id || (!before.id && before.uuid === str(e.uuid)));
  const prev = same ? before : null;
  const video = e.video === true;
  return {
    id,
    uuid: str(e.uuid),
    person: str(e.person) || prev?.person || '',
    name: str(e.name) || prev?.name || '',
    outgoing: e.outgoing === true,
    video,
    stage,
    since: stage === 'talking' || stage === 'reconnecting' ? (prev?.since ?? now) : stage === 'ended' ? (prev?.since ?? null) : null,
    muted: e.muted === true,
    camera: e.camera === true,
    remoteVideo: e.remoteVideo === true,
    // A video call starts on the loudspeaker, a voice call on the earpiece; the owner's choice stays.
    speaker: prev ? prev.speaker : video,
    why: stage === 'ended' ? str(e.why) || 'hung up' : '',
  };
}

/** Whether the sound of the call should be set up: it talks (or reconnects). */
export const signalCallTalks = (c: SignalCall | null) => c?.stage === 'talking' || c?.stage === 'reconnecting';
