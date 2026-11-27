// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { currentCall } from './call';
import { CALL_LINE, callClock } from './calls';
import { currentGroupCall } from './group-call';
import { hiddenRinging, setHiddenRinging } from './hidden-ring';
import { lang, t } from './i18n';
import { randomBytes, toHex } from './crypto';
import { addMatrixCallLine, sendEvent, setCallHandler, setRoomTap, type CallEvent, type Json, type MatrixState } from './matrix';
import { CALL_MEMBER, hostWidget, type WidgetHost, type WidgetMessage, type WidgetNews } from './matrix-widget';
import { callsOff, callsOffNote, CALLS_OFF_LINE } from './modes';
import { placeNetworkRang } from './network-notices';
import { onTorWay } from './relay';

// Calls with people on Matrix, as Element X makes them (docs/matrix.md): with Element Call, Element's
// own call app, which Erevos carries inside it (modules/erevos-webcall) and shows in a window of its
// own, the call's screen. Erevos is its host (lib/matrix-widget.ts): it lets it into the call's room
// and does what it asks of the account there. Its sound and picture go to the media server the
// homeserver names (LiveKit), encrypted with keys that only the people in the call have, which
// they give each other encrypted through Matrix.
//
// A call rings here as Element Call rings it: an event in the room (an RTC notification, MSC4075)
// that says ring, mentions us, and lasts a while. It stops ringing when it is over, when the caller
// leaves the call, or when another of our devices answers or turns it down. Turning it down tells
// the caller (MSC4310). Answering opens Element Call into the call.
//
// The older Matrix calls (m.call.*, one to one, as FluffyChat makes them) are lib/matrix-voip.ts's.
//
// A hidden place's own account (lib/place-networks.ts) calls and is called the same way while its
// hidden chats are open, and they stay open through its call (app/chat.tsx). Its call rings with
// the phone's ringtone, as the hidden chats' do, and ends as they close. While they are closed, if
// they receive while closed, a ring to it rings with no name (lib/background.ts) and waits for the
// PIN to open them (held): then it rings in them, and the PIN on the ring screen answers it.

/** Where Element Call shows: its window on Android, a frame on the web. The checks give their own. */
export type CallWindow = {
  /** Opens Element Call at `url`. */
  open(url: string, video: boolean): void;
  /** Hands it a message of the Widget API. */
  post(message: WidgetMessage): void;
  close(): void;
};

/** A Matrix account that calls (lib/matrix-store.ts). */
export type MatrixCallsAccount = {
  /** The account as it is now, or null. */
  now(): MatrixState | null;
  /** Runs `use` with the account after the changes asked for before it, and keeps what it changed. */
  change<T>(use: (state: MatrixState) => Promise<T>): Promise<T>;
  /** Runs `use` with the account at once, for what changes nothing of it. */
  read<T>(use: (state: MatrixState) => Promise<T>): Promise<T>;
};

/** A hidden place's own account while its hidden chats are closed and receive: which place, and the account. */
export type MatrixClosedPlace = { space: number; pocket: number; account: MatrixCallsAccount };

/** What the calls need of the open space: its Matrix account, the open hidden place's own, those
 *  of its closed places that receive, and where Element Call's page is. */
export type MatrixCallsSpace = MatrixCallsAccount & {
  /** The open hidden place's own account, whose `now` is null while none is open. */
  place?: MatrixCallsAccount;
  /** The closed hidden place whose account `state` is, while it receives; null for none. */
  closed?(state: MatrixState): MatrixClosedPlace | null;
  /** Calls the listener as the accounts change (one signed in or out, a place's opened or closed). Returns how to stop. */
  watch?(listener: () => void): () => void;
  /** Element Call's page, and the address its host says it is at (the Widget API's parentUrl). */
  page: string;
  parentUrl: string;
  /** Where its sound goes is chosen by its host (the phone's earpiece or loudspeaker), not by
   *  Element Call itself, as in a browser, which lists the computer's own. True when left out. */
  hostAudio?: boolean;
};

export type MatrixCallState = 'incoming' | 'open' | 'ended';

/** A Matrix call on this phone, from its ring (or our start) to its end. */
export type MatrixCall = {
  /** Its own: the ring's event, or one made for ours. Its line in the chat goes by it. */
  id: string;
  roomId: string;
  video: boolean;
  outgoing: boolean;
  state: MatrixCallState;
  /** Who rang, and their ring's event, for a call that rings here. */
  from?: string;
  ring?: string;
  /** When Element Call was in the call, and when someone else was there with us first. */
  joinedAt?: number;
  metAt?: number;
  /** How it ended, when not hung up: turned down (by them, or here or on another of our devices),
   *  answered on another device, not answered, rung while in another call, or while calls were off
   *  (INVISIBLE, lib/modes.ts). */
  end?: 'declined' | 'elsewhere' | 'missed' | 'busy' | 'off';
  /** A call of the open hidden place's own account, not the space's. */
  place?: true;
  /** It rang with no name while that place was closed, and rings now that its PIN opened it. */
  held?: true;
  /** Answered with the camera on, or off, whatever the ring said. */
  camera?: boolean;
};

/** The rings of a call: the one MatrixRTC sends now, and the older one sent beside it. */
const RINGS = new Set(['org.matrix.msc4075.rtc.notification', 'm.rtc.notification', 'org.matrix.msc4075.call.notify']);
const DECLINES = new Set(['org.matrix.msc4310.rtc.decline', 'm.rtc.decline']);
// A ring lasts no longer than this, whatever it says (MSC4075).
const RING_MOST_MS = 2 * 60_000;
// A ring said to be sent more than this ahead of when the homeserver had it is measured from the homeserver's time.
const AHEAD_MOST_MS = 20_000;
// How long Element Call has to hang up when asked, before its window closes anyway.
const HANG_UP_WAIT_MS = 4000;
// Missed rings older than this, as an account's first sync brings them, leave no line.
const LINE_AGE_MOST_MS = 24 * 3600_000;

let shown: MatrixCall | null = null;
let host: WidgetHost | null = null;
let callWindow: CallWindow | null = null;
let space: MatrixCallsSpace | null = null;
let ringEnds: ReturnType<typeof setTimeout> | null = null;
let closing: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

/** The account a call is of: the space's, or the open hidden place's. */
const accountOf = (call: Pick<MatrixCall, 'place'>): MatrixCallsAccount | undefined => (call.place ? space?.place : (space ?? undefined));

/** Whose `state` is, as its events come: the space's account (false), the open hidden place's
 *  (true), or neither (null), one let go of whose last sync still ends. */
function placeOf(state: MatrixState): boolean | null {
  if (space?.now() === state) return false;
  if (space?.place?.now() === state) return true;
  return null;
}

function changed(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // One listener's failure does not keep the others from hearing.
    }
  });
}

/** The Matrix call on this phone: one that rings, or Element Call open. */
export function shownMatrixCall(): MatrixCall | null {
  return shown;
}

/** Whether a Matrix call is on: ringing or open. Erevos's own calls do not ring meanwhile (lib/calls.ts). */
export function inMatrixCall(): boolean {
  return !!shown && shown.state !== 'ended';
}

/** Calls `listener` each time the Matrix call changes. Returns how to stop. */
export function onMatrixCallChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The address Element Call opens at, for `intent` (Element Call's: start_call_dm, join_existing…). */
export function elementCallUrl(o: { page: string; parentUrl: string; widgetId: string; roomId: string; userId: string; deviceId: string; baseUrl: string; intent: string; hostAudio?: boolean }): string {
  const params = new URLSearchParams({
    widgetId: o.widgetId,
    parentUrl: o.parentUrl,
    roomId: o.roomId,
    userId: o.userId,
    deviceId: o.deviceId,
    baseUrl: o.baseUrl,
    intent: o.intent,
    lang: lang(),
    theme: 'dark',
    // Its back arrow puts the call in a small window, as the phone's Back does.
    header: 'app_bar',
    confineToRoom: 'true',
    appPrompt: 'false',
    // Each person's media under keys of their own, given only to those in the call.
    perParticipantE2EE: 'true',
    // Never a public server of Element's to reach the other side through.
    allowIceFallback: 'false',
    hideScreensharing: 'true',
  });
  // Earpiece or loudspeaker: Erevos switches them (lib/call-host.tsx).
  if (o.hostAudio !== false) params.set('controlledAudioDevices', 'true');
  // In the fragment: the page never sends it anywhere.
  return `${o.page}#?${params.toString()}`;
}

/** What a ring says, if it rings for us now: whether it is a video call, and when it stops. */
export function ringOf(event: CallEvent, me: string, now = Date.now()): { video: boolean; until: number } | null {
  const c = event.content;
  if (event.sender === me || !RINGS.has(event.type)) return null;
  const older = event.type === 'org.matrix.msc4075.call.notify';
  const type = older ? c.notify_type : c.notification_type;
  // Newer rings leave how to tell to the app: in a chat with one person a call rings.
  if (type !== undefined && type !== 'ring') return null;
  const mentions = c['m.mentions'] as { room?: unknown; user_ids?: unknown } | undefined;
  const mentioned = mentions?.room === true || (Array.isArray(mentions?.user_ids) && mentions.user_ids.includes(me));
  if (!mentioned) return null;
  const at = event.ts;
  let until: number;
  if (older) {
    // The older ring says nothing of how long it lasts: as long as Element rang it.
    until = at + 60_000;
  } else {
    const senderTs = c.sender_ts;
    const lifetime = c.lifetime;
    if (typeof senderTs !== 'number' || typeof lifetime !== 'number' || lifetime < 0) return null;
    const basis = senderTs - at > AHEAD_MOST_MS ? at : senderTs;
    until = Math.min(basis + lifetime, now + RING_MOST_MS);
  }
  const intent = c['m.call.intent'];
  return { video: intent !== 'audio', until };
}

/** Whether a call member event says nobody is there: empty, or past its expiry. */
function memberGone(content: Json, ts: number, now: number): boolean {
  if (!Object.keys(content).length) return true;
  const expires = content.expires;
  return typeof expires === 'number' && ts + expires < now;
}

/** The line a call leaves in its chat, in English (lib/call-lines.ts shows it). */
export function matrixCallLine(call: MatrixCall, now = Date.now()): string {
  const kind = call.video ? 'Video call' : 'Voice call';
  if (call.metAt !== undefined) return `${kind}, ${callClock(now - call.metAt)}`;
  if (call.end === 'elsewhere') return `${kind}, answered on another device`;
  if (call.end === 'declined') return `${kind}, turned down`;
  if (call.end === 'busy') return `Missed ${kind.toLowerCase()}, while in another call`;
  if (call.end === 'off') return `Missed ${kind.toLowerCase()}${CALLS_OFF_LINE}`;
  if (call.outgoing) return `${kind}, not answered`;
  return `Missed ${kind.toLowerCase()}`;
}

function line(call: MatrixCall, state?: MatrixState, account = accountOf(call)): void {
  const text = `${CALL_LINE}${matrixCallLine(call)}`;
  const mine = call.outgoing || call.end === 'declined' || call.end === 'elsewhere';
  // Inside a change already (a sync's), or a change of its own.
  if (state) addMatrixCallLine(state, call.roomId, mine, text, call.id);
  else void account?.change(async (s) => addMatrixCallLine(s, call.roomId, mine, text, call.id)).catch(() => undefined);
}

function finish(call: MatrixCall, state?: MatrixState): void {
  if (call.state === 'ended') return;
  call.state = 'ended';
  if (ringEnds) clearTimeout(ringEnds);
  ringEnds = null;
  if (closing) clearTimeout(closing);
  closing = null;
  host?.stop();
  host = null;
  setRoomTap(null);
  try {
    callWindow?.close();
  } catch {
    // Closed already.
  }
  line(call, state);
  // Nothing of it shows any more: Element Call's window is its screen, and it closed.
  if (shown === call) shown = null;
  changed();
}

// The rooms whose call did not ring here as calls were off (lib/modes.ts), until when it would have
// rung: the older ring sent beside the newer one keeps no second line.
const rangWhileOff = new Map<string, number>();

// A ring while calls are off: a missed call's line that says so, once for the call.
function rangOff(rung: MatrixCall, until: number, state: MatrixState): boolean {
  const now = Date.now();
  for (const [room, end] of rangWhileOff) if (end <= now) rangWhileOff.delete(room);
  if (rangWhileOff.has(rung.roomId)) return true;
  rangWhileOff.set(rung.roomId, until);
  rung.state = 'ended';
  rung.end = 'off';
  line(rung, state);
  return true;
}

/** Busy with another call: Erevos's own, a group's, or a Matrix one. */
function busy(): boolean {
  return !!currentCall() || !!currentGroupCall() || inMatrixCall();
}

// A call's event, as sync brings it (lib/matrix.ts): a ring, a decline, a member come or gone, or
// one for Element Call, which gets every event of its room through the room tap meanwhile.
async function onCallEvent(state: MatrixState, event: CallEvent): Promise<boolean> {
  // The space's account, or the open hidden place's: each hears only its own calls.
  const place = placeOf(state);
  if (place === null) return onClosedEvent(state, event);
  const ours = (call: MatrixCall) => !!call.place === place;
  if (event.encrypted !== undefined) {
    if (shown && ours(shown)) host?.toDevice({ type: event.type, sender: event.sender, content: event.content }, event.encrypted);
    return false;
  }
  if (!event.roomId) return false;
  const now = Date.now();
  const me = state.userId;
  const call = shown && shown.state !== 'ended' && shown.roomId === event.roomId && ours(shown) ? shown : null;
  if (RINGS.has(event.type)) {
    const ring = ringOf(event, me, now);
    if (!ring || !event.eventId) return false;
    // The older ring beside the newer one, or another for a call that already rings or is open.
    if (call) return false;
    const rung: MatrixCall = { id: event.eventId, roomId: event.roomId, video: ring.video, outgoing: false, state: 'incoming', from: event.sender, ring: event.eventId, ...(place ? { place: true as const } : {}) };
    if (ring.until <= now) {
      if ((event.age ?? now - event.ts) < LINE_AGE_MOST_MS && !state.rooms[event.roomId]?.messages.some((m) => m.id === event.eventId)) {
        rung.state = 'ended';
        line(rung, state);
        return true;
      }
      return false;
    }
    // INVISIBLE (lib/modes.ts): no call rings, as a call would show this phone's internet address.
    if (callsOff()) return rangOff(rung, ring.until, state);
    if (busy()) {
      rung.state = 'ended';
      rung.end = 'busy';
      line(rung, state);
      return true;
    }
    shown = rung;
    ringEnds = setTimeout(() => {
      if (shown === rung && rung.state === 'incoming') {
        rung.end = 'missed';
        finish(rung);
      }
    }, ring.until - now);
    changed();
    return true;
  }
  if (!call) return false;
  const relates = (event.content['m.relates_to'] as Json | undefined)?.event_id;
  if (DECLINES.has(event.type)) {
    // Ours from another device, for the ring here; or theirs, for our call (Element Call ends it itself).
    if (call.state === 'incoming' && event.sender === me && relates === call.ring) {
      call.end = 'declined';
      finish(call, state);
      return true;
    }
    if (call.outgoing && event.sender !== me && !call.metAt) call.end = 'declined';
    return false;
  }
  if (event.type === CALL_MEMBER) {
    const gone = memberGone(event.content, event.ts, now);
    if (call.state === 'incoming') {
      // The caller left before it was answered.
      if (event.sender === call.from && gone) {
        call.end = 'missed';
        finish(call, state);
        return true;
      }
      // Another of our devices answered it.
      if (event.sender === me && !gone && event.content.device_id !== state.deviceId) {
        call.end = 'elsewhere';
        finish(call, state);
        return true;
      }
    } else if (call.state === 'open' && call.joinedAt && event.sender !== me && !gone) {
      call.metAt ??= now;
    }
  }
  return false;
}

// ---- a closed hidden place's ----

/** A ring to a closed hidden place's own account, waiting for the PIN to open the place. */
type Held = { call: MatrixCall; state: MatrixState; closed: MatrixClosedPlace; until: number; timer: ReturnType<typeof setTimeout> | null };

const held = new Map<string, Held>();

// No longer held: kept as `end` says in its chat, unless null; its place's ring stops with its last call.
function letGo(h: Held, end: MatrixCall['end'] | null, state?: MatrixState): void {
  if (held.get(h.call.id) !== h) return;
  held.delete(h.call.id);
  if (h.timer) clearTimeout(h.timer);
  if (end !== null) {
    h.call.state = 'ended';
    h.call.end = end;
    line(h.call, state, h.closed.account);
  }
  const { space: where, pocket } = h.closed;
  const ringing = hiddenRinging();
  if (ringing?.space === where && ringing.pocket === pocket && ![...held.values()].some((o) => o.closed.space === where && o.closed.pocket === pocket)) setHiddenRinging(null);
}

// A closed place's ring, held while it rings; and what ends it before the place opens.
async function onClosedEvent(state: MatrixState, event: CallEvent): Promise<boolean> {
  const closed = space?.closed?.(state);
  if (!closed || event.encrypted !== undefined || !event.roomId) return false;
  const now = Date.now();
  const me = state.userId;
  const h = [...held.values()].find((o) => o.state === state && o.call.roomId === event.roomId);
  if (RINGS.has(event.type)) {
    const ring = ringOf(event, me, now);
    if (!ring || !event.eventId || h) return false;
    const rung: MatrixCall = { id: event.eventId, roomId: event.roomId, video: ring.video, outgoing: false, state: 'incoming', from: event.sender, ring: event.eventId };
    if (ring.until <= now) {
      if ((event.age ?? now - event.ts) >= LINE_AGE_MOST_MS || state.rooms[event.roomId]?.messages.some((m) => m.id === event.eventId)) return false;
      rung.state = 'ended';
      line(rung, state);
      return true;
    }
    // INVISIBLE (lib/modes.ts): it does not ring when the place opens either.
    if (callsOff()) return rangOff(rung, ring.until, state);
    const next: Held = { call: rung, state, closed, until: ring.until, timer: null };
    held.set(rung.id, next);
    next.timer = setTimeout(() => letGo(next, 'missed'), ring.until - now);
    placeNetworkRang(closed.space, closed.pocket);
    return true;
  }
  if (!h) return false;
  const relates = (event.content['m.relates_to'] as Json | undefined)?.event_id;
  // Turned down on another device of ours.
  if (DECLINES.has(event.type) && event.sender === me && relates === h.call.ring) {
    letGo(h, 'declined', state);
    return true;
  }
  if (event.type === CALL_MEMBER) {
    const gone = memberGone(event.content, event.ts, now);
    // The caller left before the place opened, or another of our devices answered.
    if (event.sender === h.call.from && gone) letGo(h, 'missed', state);
    else if (event.sender === me && !gone && event.content.device_id !== state.deviceId) letGo(h, 'elsewhere', state);
    else return false;
    return true;
  }
  return false;
}

// Its place opened, its account the open one's now: what still rings rings there.
function promote(): void {
  const now = space?.place?.now();
  if (!now) return;
  for (const h of [...held.values()]) {
    if (h.state !== now) continue;
    held.delete(h.call.id);
    if (h.timer) clearTimeout(h.timer);
    const call: MatrixCall = { ...h.call, place: true, held: true };
    const left = h.until - Date.now();
    if (left <= 0 || busy() || callsOff()) {
      call.state = 'ended';
      call.end = left <= 0 ? 'missed' : callsOff() ? 'off' : 'busy';
      line(call);
      continue;
    }
    shown = call;
    ringEnds = setTimeout(() => {
      if (shown === call && call.state === 'incoming') {
        call.end = 'missed';
        finish(call);
      }
    }, left);
    changed();
  }
}

function open(call: MatrixCall, intent: string): void {
  if (!space || !callWindow) throw new Error(t('Matrix calls are not ready on this device.'));
  const from = accountOf(call);
  const state = from?.now();
  if (!from || !state) throw new Error(t('Not signed in to Matrix.'));
  const widgetId = toHex(randomBytes(12));
  const account = { userId: state.userId, deviceId: state.deviceId, change: from.change, read: from.read };
  const opened = callWindow;
  host = hostWidget({
    widgetId,
    roomId: call.roomId,
    account,
    post: (message) => opened.post(message),
    told: (news) => heard(call, news),
  });
  const own = host;
  // Only the call's account's: the other may be in the same room.
  setRoomTap((roomId, event, timeline, tapped) => {
    if (roomId === call.roomId && tapped === from.now()) own.roomEvent(event, timeline);
  });
  call.state = 'open';
  opened.open(
    elementCallUrl({ page: space.page, parentUrl: space.parentUrl, widgetId, roomId: call.roomId, userId: state.userId, deviceId: state.deviceId, baseUrl: state.homeserver, intent, hostAudio: space.hostAudio }),
    call.camera ?? call.video,
  );
  changed();
}

function heard(call: MatrixCall, news: WidgetNews): void {
  if (shown !== call) return;
  if (news === 'joined') {
    call.joinedAt ??= Date.now();
    changed();
    return;
  }
  // Hung up, or closed: the call is over here.
  finish(call);
}

/** Calls the people of a Matrix room, of the space's account or (`place`) the open hidden place's:
 *  Element Call opens and rings them. Throws if a call is on. */
export function startMatrixCall(roomId: string, video: boolean, place = false): MatrixCall {
  if (callsOff()) throw new Error(callsOffNote());
  if (busy()) throw new Error(t('There is a call already.'));
  const room = accountOf({ place: place || undefined })?.now()?.rooms[roomId];
  if (!room) throw new Error(t('Not signed in to Matrix.'));
  const call: MatrixCall = { id: `call-${toHex(randomBytes(8))}`, roomId, video, outgoing: true, state: 'open', ...(place ? { place: true as const } : {}) };
  shown = call;
  try {
    open(call, room.direct ? (video ? 'start_call_dm' : 'start_call_dm_voice') : video ? 'start_call' : 'start_call_voice');
  } catch (error) {
    shown = null;
    throw error;
  }
  return call;
}

/** Answers the call that rings, with the camera on (`video`) or off: Element Call opens into it,
 *  its camera as its voice or video intent starts it. */
export function answerMatrixCall(call: MatrixCall, video = call.video): void {
  if (shown !== call || call.state !== 'incoming') return;
  if (ringEnds) clearTimeout(ringEnds);
  ringEnds = null;
  const direct = accountOf(call)?.now()?.rooms[call.roomId]?.direct ?? true;
  if (video !== call.video) call.camera = video;
  open(call, direct ? (video ? 'join_existing_dm' : 'join_existing_dm_voice') : video ? 'join_existing' : 'join_existing_voice');
}

/** Turns down the call that rings, and tells the caller. */
export function declineMatrixCall(call: MatrixCall): void {
  if (shown !== call || call.state !== 'incoming') return;
  call.end = 'declined';
  const ring = call.ring;
  // The older ring has no decline: it just stops ringing.
  if (ring) {
    void accountOf(call)
      ?.change((state) => sendEvent(state, call.roomId, 'org.matrix.msc4310.rtc.decline', { 'm.relates_to': { rel_type: 'm.reference', event_id: ring } }))
      .catch(() => undefined);
  }
  finish(call);
}

/** Hangs up the open call: Element Call leaves it, then its window closes. */
export function hangUpMatrixCall(): void {
  const call = shown;
  if (!call || call.state === 'ended') return;
  if (call.state === 'incoming') {
    declineMatrixCall(call);
    return;
  }
  if (closing) return;
  closing = setTimeout(() => finish(call), HANG_UP_WAIT_MS);
  void host
    ?.ask('im.vector.hangup')
    .catch(() => undefined)
    .then(() => finish(call));
}

// INVISIBLE chosen, or everything of the space sent through Tor on its screen: a call on, or one
// that rings, ends, as no call goes through Tor (lib/modes.ts). One that rings with no name for a
// closed place stops, kept as missed at once, its line says why.
onTorWay(() => {
  if (!callsOff()) return;
  hangUpMatrixCall();
  for (const h of [...held.values()]) {
    rangWhileOff.set(h.call.roomId, h.until);
    letGo(h, 'off');
  }
});

/** A message from Element Call's window. */
export function callWindowMessage(message: unknown): void {
  host?.receive(message);
}

/** Element Call's window went away by itself (closed by the person, or by Android). */
export function callWindowClosed(): void {
  if (shown && shown.state === 'open') finish(shown);
}

/** Takes Matrix calls in while the space is open (components/call-host.tsx), and shows Element Call
 *  in `shownIn`. Returns how to stop, which ends the call. */
export function watchMatrixCalls(shownIn: CallWindow, given: MatrixCallsSpace): () => void {
  callWindow = shownIn;
  space = given;
  setCallHandler(onCallEvent);
  // A hidden place's call ends as its hidden chats close: its account goes with them. One held for
  // a closed place rings there as it opens.
  const stopWatch = given.watch?.(() => {
    promote();
    if (shown?.place && shown.state !== 'ended' && !given.place?.now()) {
      if (shown.state === 'incoming') shown.end = 'missed';
      finish(shown);
    }
  });
  return () => {
    stopWatch?.();
    for (const h of [...held.values()]) letGo(h, null);
    if (shown) {
      if (shown.state === 'incoming') shown.end = 'missed';
      finish(shown);
    }
    setCallHandler(null);
    setRoomTap(null);
    callWindow = null;
    space = null;
    changed();
  };
}
