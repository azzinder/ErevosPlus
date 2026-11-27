// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Call, currentCall, OFFER_FRESH_MS, offerMissed, offersBeyond, otherCallOn, relayToAnswer, type Rtc } from './call';
import type { CallSignal } from './call-signal';
import { currentGroupCall } from './group-call';
import { onTorWay, type CallRelay } from './relay';
import { newTag, type Message } from '../lock/history';
import { t } from './i18n';
import type { IpKeep } from './ip-warning';
import { callsOff, callsOffNote, CALLS_OFF_LINE } from './modes';

// The call on this phone, whatever screen shows: the chat starts it, and a contact's call rings
// from the chat or from the receiver beside the other screens (lib/receiver.ts), so it rings
// anywhere in the open space. The call screen at the app's root (components/call-host.tsx) shows
// it. Each call keeps where it belongs (CallPlace): the space's chats, or the hidden chats while
// they are open; its signals go through that chat's encryption, and its line is kept there.

export const CONTACT_PREFIX = 'contact:';
/** The start of a call's line in the chat. */
export const CALL_LINE = '📞 ';

/** Where a call belongs: how it reaches the contact, and where its line is kept. */
export type CallPlace = {
  /** Sends a call signal to the contact, end-to-end encrypted. Rejects if the relay did not take it. */
  send(identity: string, signal: CallSignal): Promise<void>;
  /** The call relay beside our relay, or null if it has none. */
  callRelay(): Promise<CallRelay | null>;
  /** Keeps the call's line in the chat; `id` is the call's. */
  line(peer: string, mine: boolean, text: string, id: string): void;
  /** The contact's name as the chat shows it. */
  name(peer: string): string;
  /** A hidden contact's call answered with its hidden chats closed (app/chat.tsx `callOnly`): the call shows no name and no face. */
  nameless?: boolean;
  /** Where the hidden chats keep that a call's warning was said (lib/ip-warning.ts IpKeep): their own data, not the space's. */
  ipKeep?(): IpKeep | undefined;
  /** The offer of their call that rang before it came, once it is answered here (lib/xmpp-calls.ts). */
  offer?(identity: string): Promise<string>;
  /** Video added to a voice call, both ways (lib/xmpp-calls.ts, lib/matrix-voip.ts): as Call's
   *  events have them. Without them, Erevos's own signals say it (reoffer, reanswer). */
  addMedia?(identity: string, id: string, sdp: string): Promise<string>;
  answerMedia?(identity: string, id: string, sdp: string | null): Promise<void>;
  /** As Call's events have them (XMPP's). */
  addsOnly?: boolean;
  bothWays?: boolean;
  /** Which of the account's devices this is, as contacts know it: its endpoint (hex) on a linked device, '' on the phone. */
  me?(): Promise<string>;
  /**
   * With Direct connections on (lib/direct.ts), the helper servers a call with this contact asks when
   * it goes straight between the two phones over the internet, through the call relay too where it
   * cannot, in groups (lib/call.ts CallOptions.open); null when it may not go so: the switch is off,
   * something of the space goes through Tor, or their chat goes only through Tor. A place without it
   * (hidden chats, XMPP) never calls so.
   */
  direct?(identity: string): Promise<string[][] | null>;
  /** Whether a call signal can go to the contact from here now: through the relay, to their phone nearby, or, with Direct connections on, through Nostr. A place without it is taken to. */
  reaches?(identity: string): Promise<boolean>;
  /** Whether the chat with the contact is set to go only through Tor: a call's warning is then said whatever Direct connections says. */
  torChat?(identity: string): Promise<boolean>;
};

/** A peer's identity: what comes after `contact:`, or after `xmpp:` for an XMPP address. */
const identityOf = (peer: string) => peer.slice(peer.indexOf(':') + 1);

let shown: { call: Call; place: CallPlace } | null = null;
const listeners = new Set<() => void>();
// A contact's hang-up of a call that has no Call here yet, by peer and call id, with when it came: the
// offer and the `end` came in one look, and the offer still waits for the call relay (callSignal) when
// the `end` is read, which would be dropped, and the phone would ring 45 seconds for a call nobody is on.
const endedBefore = new Map<string, number>();
const ENDED_KEPT_MS = 2 * OFFER_FRESH_MS;
const callKey = (peer: string, id: string) => `${peer} ${id}`;
// The calls that did not ring here as calls were off (lib/modes.ts), by peer and call id, the last
// QUIET_KEPT: the same offer again, through another way, keeps no second line.
const quietBefore = new Set<string>();
const QUIET_KEPT = 50;

// Whether the contact hung up the call `id` before its offer was read here; forgotten once asked.
function endedAlready(peer: string, id: string): boolean {
  const now = Date.now();
  for (const [key, at] of endedBefore) if (now - at > ENDED_KEPT_MS) endedBefore.delete(key);
  return endedBefore.delete(callKey(peer, id));
}
// Whether another device of the account has a call, but the one `id` names (lib/devices.ts): to a contact who calls, the account is in one.
let elsewhere: (id?: string) => boolean = () => false;

/** How to know whether another device of the account has a call. */
export function callsElsewhere(busy: (id?: string) => boolean): void {
  elsewhere = busy;
}

function changed() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // One listener's failure does not keep the others from hearing.
    }
  });
}

/** The call to show, until its screen closes: it stays a moment after it ends. */
export function shownCall(): { call: Call; place: CallPlace } | null {
  return shown;
}

/** Calls `listener` each time the call, or anything about it, changes. Returns how to stop. */
export function onCallChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The screen of an ended call closed. */
export function closeCall(call: Call): void {
  if (shown?.call !== call) return;
  shown = null;
  changed();
}

/** What the line in the chat says about a call that ended. */
export function endedLine(ended: Call, now = Date.now()): string {
  const kind = ended.video ? 'Video call' : 'Voice call';
  const reason = ended.ended?.reason;
  if (ended.connectedAt) return `${kind}, ${callClock(now - ended.connectedAt)}`;
  if (ended.ended?.elsewhere) return reason === 'decline' ? `${kind}, turned down` : `${kind}, answered on another device`;
  if (reason === 'decline') return `${kind}, turned down`;
  if (reason === 'failed') return ended.direct ? `${kind}, could not connect directly` : `${kind}, could not connect`;
  if (ended.outgoing) return reason === 'busy' ? `${kind}, they were in another call` : `${kind}, not answered`;
  return `Missed ${kind.toLowerCase()}`;
}

function events(place: CallPlace, identity: string) {
  return {
    send: (signal: CallSignal) => place.send(identity, signal),
    offer: place.offer ? () => place.offer!(identity) : undefined,
    addMedia: place.addMedia ? (id: string, sdp: string) => place.addMedia!(identity, id, sdp) : undefined,
    answerMedia: place.answerMedia ? (id: string, sdp: string | null) => place.answerMedia!(identity, id, sdp) : undefined,
    addsOnly: place.addsOnly,
    bothWays: place.bothWays,
    onChange: (call: Call) => {
      if (call.state === 'ended' && shown?.call === call) place.line(call.peer, call.outgoing, endedLine(call), call.id);
      changed();
    },
  };
}

/** Calls a contact. `open`: straight over the internet, with these helper servers (CallPlace.direct), through the call relay too where it cannot go straight. Throws if a call is already in progress, or calls are off (INVISIBLE). */
export function startCall(place: CallPlace, peer: string, video: boolean, relay: CallRelay | null, rtc: Rtc, open: string[][] | null = null): Call {
  if (callsOff()) throw new Error(callsOffNote());
  if (currentGroupCall() || elsewhere() || otherCallOn()) throw new Error(t('There is a call already.'));
  const call = Call.start({ peer, video, relay, open, rtc, events: events(place, identityOf(peer)) });
  shown = { call, place };
  changed();
  return call;
}

/**
 * A call signal from a contact: a call that rings here, or news of ours. `request`: they are a
 * message request, which hears nothing back, so it does not ring either. Says what to tell the
 * user, if anything.
 */
export async function callSignal(place: CallPlace, peer: string, signal: CallSignal, request: boolean, rtc: Rtc, from = ''): Promise<string | null> {
  const ours = currentCall();
  const identity = identityOf(peer);
  if (signal.kind !== 'offer') {
    const mine = ours?.peer === peer && ours.id === signal.id;
    // The caller says which of this account's devices answered or turned it down: that one goes on,
    // the others stop ringing (docs/multi-device.md, Calls).
    if (signal.kind === 'end' && signal.by !== undefined) {
      if (signal.by === ((await place.me?.().catch(() => '')) ?? '')) return null;
      if (mine && !ours.outgoing) ours.endedElsewhere(signal.reason === 'decline');
      else if (!mine) endedBefore.set(callKey(peer, signal.id), Date.now());
      return null;
    }
    if (!mine) {
      // Their hang-up read before its offer rang here: the offer is not rung.
      if (signal.kind === 'end') endedBefore.set(callKey(peer, signal.id), Date.now());
      return null;
    }
    const waiting = ours.outgoing && (ours.state === 'calling' || ours.state === 'ringing');
    ours.receive(signal);
    // Ours, answered or turned down on one of their devices: the others are told, so they stop ringing.
    if (waiting && signal.kind === 'answer' && ours.state === 'connecting') place.send(identity, { id: signal.id, kind: 'end', reason: 'taken', by: from }).catch(() => undefined);
    else if (waiting && signal.kind === 'end' && signal.reason === 'decline' && from) place.send(identity, { id: signal.id, kind: 'end', reason: 'decline', by: from }).catch(() => undefined);
    return null;
  }
  if (ours?.id === signal.id) return null;
  const kind = signal.video ? 'video call' : 'voice call';
  if (request) return t('{name} tried to call. Accept their message request to take calls from them.', { name: place.name(peer) });
  // Made while no space was open here: it has stopped ringing on their side. Or hung up already.
  if (offerMissed(signal.at) || endedAlready(peer, signal.id)) {
    place.line(peer, false, `Missed ${kind}`, signal.id);
    return null;
  }
  // INVISIBLE (lib/modes.ts): no call rings, as a call would show this phone's internet address. The
  // caller's phone is told nothing, and rings until no one answers. Asked again before it would ring,
  // as INVISIBLE may be chosen while the call relay is asked.
  const invisible = () => {
    const key = callKey(peer, signal.id);
    if (quietBefore.has(key)) return null;
    quietBefore.add(key);
    if (quietBefore.size > QUIET_KEPT) quietBefore.delete(quietBefore.values().next().value as string);
    place.line(peer, false, `Missed ${kind}${CALLS_OFF_LINE}`, signal.id);
    return t('{name} tried to call. In INVISIBLE no call rings, as a call would show your internet address. To take calls, choose ANONYMOUS or SPEED at the top of Settings.', { name: place.name(peer) });
  };
  if (callsOff()) return invisible();
  const busy = () => {
    place.send(identity, { id: signal.id, kind: 'end', reason: 'busy' }).catch(() => undefined);
    place.line(peer, false, `Missed ${kind}, while in another call`, signal.id);
    return null;
  };
  if (ours || currentGroupCall() || elsewhere(signal.id) || otherCallOn()) return busy();
  // No way back to them from here: their call came through Nostr, with no relay between the two,
  // and Direct connections is off here (ANONYMOUS). It could not be answered, so it does not ring.
  if (place.reaches && !(await place.reaches(identity).catch(() => true))) {
    place.line(peer, false, `Missed ${kind}`, signal.id);
    return t('{name} tried to call, with no server between you two. To take such calls, choose SPEED at the top of Settings.', { name: place.name(peer) });
  }
  // An offer still to come (XMPP's calls ring first) answers through our call relay, if there is one.
  const callRelay = await place.callRelay().catch(() => null);
  const relay = signal.sdp ? relayToAnswer(signal.sdp, callRelay) : callRelay;
  // With Direct connections on here (SPEED): straight between the two phones over the internet,
  // through our call relay too where it cannot go straight, unless their offer says only its own
  // network, answered there as before.
  const open = signal.sdp && offersBeyond(signal.sdp) ? ((await place.direct?.(identity).catch(() => null)) ?? null) : null;
  // They hung up while the call relay was asked.
  if (endedAlready(peer, signal.id)) {
    place.line(peer, false, `Missed ${kind}`, signal.id);
    return null;
  }
  // INVISIBLE chosen while the call relay was asked.
  if (callsOff()) return invisible();
  // Another call came, or started, while the call relay was asked (offers of one look are read
  // together). The same offer again, through another way, says nothing: a busy with its id would
  // end the call it rings for.
  const now = currentCall();
  if (now?.id === signal.id) return null;
  if (now || currentGroupCall() || elsewhere(signal.id) || otherCallOn()) return busy();
  const ringing = Call.incoming(signal, { peer, relay, open, rtc, events: events(place, identity) });
  if (!ringing) return null;
  shown = { call: ringing, place };
  changed();
  return null;
}

// INVISIBLE chosen, or everything of the space sent through Tor on its screen: a call on ends, as no
// call goes through Tor (lib/modes.ts).
onTorWay(() => {
  if (callsOff()) shown?.call.hangUp();
});

/** Ends the call if it belongs to `place`, as when hidden chats close. */
export function endCallsOf(place: CallPlace): void {
  if (shown?.place === place) shown.call.hangUp();
}

/** Ends any call, as when the space closes. */
export function endCall(): void {
  shown?.call.hangUp();
}

/** How long a call has lasted: 0:42, 12:05, 1:02:09. */
export function callClock(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const two = (n: number) => String(n).padStart(2, '0');
  return hours ? `${hours}:${two(minutes % 60)}:${two(seconds % 60)}` : `${minutes}:${two(seconds % 60)}`;
}

/** A line the chat keeps as it is, not sent (lib/call-lines.ts): no marks, and it disappears with
 *  the chat's timer. */
export function keptLineMessage(peer: string, mine: boolean, text: string, timer: number, at = Date.now()): Message {
  return { peer, text, mine, at, tag: newTag(), until: timer ? at + timer * 1000 : 0, lasts: 0, mark: 2 };
}

/** A call's line as the chat keeps it: no marks, and it disappears with the chat's timer. */
export function callLineMessage(peer: string, mine: boolean, text: string, timer: number, at = Date.now()): Message {
  return keptLineMessage(peer, mine, `${CALL_LINE}${text}`, timer, at);
}
