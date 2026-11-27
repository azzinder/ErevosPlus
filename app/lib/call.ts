// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { MAX_SDP, type CallEnd, type CallSignal } from './call-signal';
import { randomBytes, toHex } from './crypto';
import { forgetCallRelays, type CallRelay } from './relay';
import { t } from './i18n';

// One voice or video call with a contact, over WebRTC (lib/webrtc.ts on the phone). It is set up
// with call signals sent in the chat's end-to-end encrypted messages (lib/call-signal.ts), and the
// sound and picture then go straight between the two phones, encrypted between them (DTLS-SRTP).
//
// With a call relay beside the chat's relay (a TURN server, see crates/erevos-relay/src/turn.rs),
// the call goes only through it: each phone offers only call relay addresses, so neither learns the
// other's IP address. Without one, the phones can only reach each other on the same network, and
// then each sees the other's address there; the chat says so before such a call. With Direct
// connections on (lib/direct.ts: SPEED, lib/modes.ts), a phone calls straight over the internet
// instead (CallOptions.open): it says every address it has, its internet address too, as a helper
// server tells it (STUN), and takes every address of theirs, so each of the two sees the other's.
// With a call relay too, it says the relay's addresses beside its own: WebRTC tries every way at
// once, and keeps the straight one where it works, so the call goes through the relay only where
// it cannot go straight (his word, 2026-11-26: straight first, the server if that fails). A side
// with Direct connections off still goes only through its call relay, and only the other's address
// shows.
//
// A call that rings is answered with the camera or with voice only. While it goes on, either side
// may send a new description of it (reoffer), sealed as the offer is: video added to a voice call,
// which the other side's screen asks about, or a camera turned on in a video call answered without
// it, which it takes at once. Only between phones whose offer and answer said they take one: an
// Erevos from before is sent none. XMPP's and Matrix's calls do the same their own way
// (CallEvents.addMedia). On a computer, the camera switches to the next one it has.
//
// A phone has one call at a time.

/** How long a call rings before it is missed, milliseconds. */
export const RING_MS = 45_000;
/** How long an answered call may take to connect, milliseconds. */
export const CONNECT_MS = 30_000;
/** How long a connection that dropped may take to come back, milliseconds. */
export const RECONNECT_MS = 10_000;
/** How long to wait for the addresses to try before sending what there is, milliseconds. */
export const GATHER_MS = 5_000;
/** Through a call relay, how long after its first relayed address over UDP the others still may come:
 *  only relayed addresses are tried, so that one is enough to start, and waiting for every one (the
 *  relay over TCP, say, where a network holds it back) kept a call from starting for up to GATHER_MS
 *  on each side. */
export const RELAYED_GRACE_MS = 300;
/** Straight over the internet, how long after the first address a helper server told the others still may come, milliseconds. */
export const OPEN_GRACE_MS = 500;
/** Straight over the internet, how long a helper server's answer is waited for before the addresses found by then go: less than
 *  GATHER_MS, so two phones on a Wi-Fi with no internet, where no helper answers, still ring soon, milliseconds. */
export const OPEN_WAIT_MS = 2_500;
/** An offer older than this when it comes is a missed call, not one that rings, milliseconds. */
export const OFFER_FRESH_MS = 60_000;
/**
 * How long a call we make waits, once its offer went, for their phone to say it rings, beyond
 * OFFER_FRESH_MS: their phone still rings for an offer that long on the way, and its word that it
 * does takes a while to come back, milliseconds. Once it rings there, it rings RING_MS from then, so
 * an offer that came late does not ring there only to stop at once.
 */
export const RINGING_BACK_MS = 15_000;
/** How long a new description of ours, as video is added to a call, waits for their answer: their screen asks them, milliseconds. */
export const ADD_MS = 60_000;
/** How long their asking to add video waits for a yes here before it is a no: less than they wait, milliseconds. */
export const ASK_MS = 50_000;

// How far this phone's clock is behind its relay's, as last measured (lib/receiver.ts): calls are
// stamped, and judged fresh, by the relay's time, so a phone whose clock is off by minutes still
// rings and is rung. 0 with no relay to say, or one from before it: this phone's own clock.
let clockOffset = 0;

/** This phone's clock is `ms` behind its relay's (ahead, when less than 0). */
export function setClockOffset(ms: number): void {
  clockOffset = ms;
}

/** Now, by the relay's clock as far as this phone knows it: what a call's stamp is made and judged by. */
export function callNow(): number {
  return Date.now() + clockOffset;
}

/** Whether an offer stamped `at` is too old to ring: a missed call. */
export function offerMissed(at: number, now = callNow()): boolean {
  return now - at > OFFER_FRESH_MS;
}

/** How much longer an offer stamped `at` may wait to be answered: never more than OFFER_FRESH_MS, though its stamp is ahead. */
export function offerRingsFor(at: number, now = callNow()): number {
  return Math.min(OFFER_FRESH_MS, Math.max(0, at + OFFER_FRESH_MS - now));
}

// What lib/call.ts needs of WebRTC: the phone's (react-native-webrtc) and the browser's both fit.
export interface Track {
  readonly kind: string;
  /** The browser's and the phone's have one: a view of a camera is made anew when it changes. */
  readonly id?: string;
  enabled: boolean;
  stop(): void;
  _switchCamera?(): void;
  /** Which camera it is: `environment` is one facing away, whose picture is not mirrored. */
  getSettings?(): { deviceId?: string; facingMode?: string };
}
/** What sends one of our tracks to them. */
export interface Sender {
  readonly track: Track | null;
  replaceTrack?(track: Track | null): Promise<void>;
}
/** One kind of media of a connection, its sending and its receiving. */
export interface Transceiver {
  direction: string;
  readonly sender: Sender;
  readonly receiver: { readonly track: Track | null };
}
export interface Stream {
  getTracks(): Track[];
  getAudioTracks(): Track[];
  getVideoTracks(): Track[];
  /** A camera's track joins the stream of a call's sound, as video is added to a voice call. */
  addTrack?(track: Track): void;
  removeTrack?(track: Track): void;
}
// A rollback takes back an offer of ours that the other side would not have.
type Description = { type: 'offer' | 'answer' | 'rollback'; sdp: string };
export interface Connection {
  readonly iceGatheringState: string;
  readonly connectionState: string;
  readonly localDescription: { sdp: string } | null;
  addTrack(track: Track, stream: Stream): unknown;
  removeTrack?(sender: unknown): void;
  createOffer(): Promise<Description>;
  createAnswer(): Promise<Description>;
  setLocalDescription(description: Description): Promise<void>;
  setRemoteDescription(description: Description): Promise<void>;
  addEventListener(type: 'icegatheringstatechange' | 'connectionstatechange', listener: () => void): void;
  addEventListener(type: 'track', listener: (event: { streams: readonly Stream[]; track?: Track }) => void): void;
  addEventListener(type: 'icecandidate', listener: (event: { candidate?: { candidate: string } | null }) => void): void;
  /** One more address of theirs to try, as XMPP's calls send them one at a time (lib/xmpp-calls.ts). */
  addIceCandidate?(candidate: { candidate: string; sdpMid: string }): Promise<void>;
  getSenders?(): Sender[];
  getTransceivers?(): Transceiver[];
  /** What WebRTC measures of the connection (lib/call-quality.ts). */
  getStats?(): Promise<{ forEach(each: (value: unknown) => void): void }>;
  /** Media with no track of ours on it: their picture, in a video call we are in without our camera. */
  addTransceiver?(kind: 'audio' | 'video', init: { direction: string }): unknown;
  close(): void;
}
export type IceServer = { urls: string[]; username?: string; credential?: string };
export type ConnectionConfig = { iceServers: IceServer[]; iceTransportPolicy: 'relay' | 'all' };
export interface Rtc {
  connect(config: ConnectionConfig): Connection;
  media(constraints: { audio: boolean; video: boolean }): Promise<Stream>;
  /** How many cameras there are, as told once one was opened. */
  cameras?(): Promise<number>;
  /** The next camera's track after `current`'s, where a camera is switched by opening the next (a
   *  browser's); null when there is no other. */
  nextCamera?(current: Track): Promise<Track | null>;
}

export type CallState =
  // Ours, before their phone rings.
  | 'calling'
  // Ours, ringing on their phone.
  | 'ringing'
  // Theirs, ringing here.
  | 'incoming'
  | 'connecting'
  | 'connected'
  | 'ended';

/** How a call ended, and who ended it. `elsewhere`: another device of the account answered it, or turned it down (lib/devices.ts). */
export type Ended = { reason: CallEnd; byUs: boolean; elsewhere?: boolean };

export type CallEvents = {
  /** Something about the call changed: its state, its streams, mute or camera. */
  onChange(call: Call): void;
  /** Sends a call signal to the contact. Rejects when the relay did not take it. */
  send(signal: CallSignal): Promise<void>;
  /** The offer of a call that rang before its offer came, asked for as it is answered: XMPP's
   *  calls ring first, and the caller sends the offer once one of the person's devices answers
   *  (lib/xmpp-calls.ts). */
  offer?(): Promise<string>;
  /** Asks them to take the video our new description `sdp` adds to the call, and answers their
   *  whole description for it; rejects when they would not. XMPP's content-add (lib/xmpp-calls.ts);
   *  a call without it cannot have video added. */
  addMedia?(id: string, sdp: string): Promise<string>;
  /** Our answer to their asking to add video: our whole description, or null for no. A call with
   *  neither (Erevos's own) says both with its own signals (reoffer, reanswer). */
  answerMedia?(id: string, sdp: string | null): Promise<void>;
  /** addMedia only adds media to the call (XMPP's content-add): our camera is not turned on with it
   *  in a video call answered without it. */
  addsOnly?: boolean;
  /** An answer without our camera still says video goes both ways, as other XMPP apps expect: our
   *  camera, turned on later, goes on it with nothing more to say. */
  bothWays?: boolean;
};

export type CallOptions = {
  peer: string;
  video: boolean;
  /** The call relay, or null with none: then directly, on the same network, unless `open`. */
  relay: CallRelay | null;
  /**
   * The helper servers (STUN, lib/direct.ts callHelpers) asked for this phone's internet address,
   * for a call straight between the two phones over the internet, where each sees the other's
   * address: with a call relay too, straight where it can, through the relay where it cannot. In
   * groups: those of the first are asked, and those of the next only when none of the ones before
   * answered (answeringHelpers), so a reserve sees the address only then. No group: no helper is
   * asked. Null or left out: only through the call relay, or with none on the same network only.
   */
  open?: string[][] | null;
  rtc: Rtc;
  events: CallEvents;
};

let current: Call | null = null;

/** The call in progress on this phone, if any. */
export function currentCall(): Call | null {
  return current && current.state !== 'ended' ? current : null;
}

// A call not of Erevos's own, on this phone (a Matrix one, lib/matrix-calls.ts): none of ours starts
// or rings meanwhile.
let other: () => boolean = () => false;

/** How to know whether a call not of Erevos's own is on. */
export function callsOther(busy: () => boolean): void {
  other = busy;
}

/** Whether a call not of Erevos's own is on. */
export function otherCallOn(): boolean {
  return other();
}

/** `promise`, or `fallback` if it has not settled within `ms`: for a relay that may take long to
 *  fail, as on a Wi-Fi with no internet. */
export function soon<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

export function newCallId(): string {
  return toHex(randomBytes(8));
}

/** The most a camera sends, in bits a second, on a call through the call relay: the relay carries
 *  each picture. 720p at 1 Mbps looks much the same on a phone and takes about half (his choice,
 *  2026-11-14). A call straight over the internet (CallOptions.open) is held to the same: the other
 *  side may still go through its call relay, and mobile data is spared. A call direct on the same
 *  network is not held back. */
export const RELAY_VIDEO_BITRATE = 1_000_000;

type Encodings = { encodings?: { maxBitrate?: number }[] };

/** Holds a camera's `sender` (what addTrack gave) to RELAY_VIDEO_BITRATE when the call goes through the
 *  relay, or straight over the internet (`throughRelay`); sound, and a call on the same network, as they
 *  are. Where the platform cannot, the picture goes as before. */
export async function capVideo(sender: unknown, track: Track, throughRelay: boolean): Promise<void> {
  if (!throughRelay || track.kind !== 'video' || !sender) return;
  const s = sender as { getParameters?(): Encodings; setParameters?(parameters: Encodings): Promise<void> };
  try {
    const parameters = s.getParameters?.();
    if (!parameters || !s.setParameters) return;
    const encodings = parameters.encodings?.length ? parameters.encodings : [{}];
    parameters.encodings = encodings.map((encoding) => ({ ...encoding, maxBitrate: Math.min(encoding.maxBitrate ?? Infinity, RELAY_VIDEO_BITRATE) }));
    await s.setParameters(parameters);
  } catch {
    // Not here: the picture goes at the bitrate WebRTC chooses.
  }
}

const holds = (stream: Stream, track: Track) => stream.getTracks().some((t) => t === track || (t.id !== undefined && t.id === track.id));

/** The stream their picture and sound show from, as a track of theirs comes in `came`: never one
 *  with their sound only in place of one with their picture, whichever came first, as a phone may say
 *  them in streams of their own; the track said with it joins it if it is not in it yet. */
export function theirStream(shown: Stream | null, came: Stream, track?: Track): Stream {
  if (track && !holds(came, track)) came.addTrack?.(track);
  if (!shown || shown === came || came.getVideoTracks().length > 0 || shown.getVideoTracks().length === 0) {
    // Their sound, when it came in a stream of its own before: in this one too.
    if (shown && shown !== came) for (const t of shown.getTracks()) if (t.kind === 'audio' && !holds(came, t)) came.addTrack?.(t);
    return came;
  }
  for (const t of came.getTracks()) if (!holds(shown, t)) shown.addTrack?.(t);
  return shown;
}

/**
 * The connection set-up for a call: through the call relay only; or, with `open` (CallOptions.open),
 * every way, over the internet too, asking its helper servers for this phone's address there, and
 * through the call relay where there is one, the way WebRTC keeps only when no other works; or,
 * with neither, direct on the same network.
 */
export function connectionConfig(relay: CallRelay | null, open: string[] | null = null): ConnectionConfig {
  const helpers = open?.length ? [{ urls: open }] : [];
  if (!relay) return { iceServers: helpers, iceTransportPolicy: 'all' };
  const turn = { urls: relay.urls, username: relay.username, credential: relay.credential };
  return open ? { iceServers: [...helpers, turn], iceTransportPolicy: 'all' } : { iceServers: [turn], iceTransportPolicy: 'relay' };
}

// An address on this network only: private IPv4, link-local, loopback, unique-local IPv6, or a
// name the network's own mDNS gives (`….local`), which no one outside it can reach.
export function isLocalAddress(address: string): boolean {
  const a = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (a.endsWith('.local')) return true;
  const v4 = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(a);
  if (v4) {
    const [x, y] = [Number(v4[1]), Number(v4[2])];
    return x === 10 || x === 127 || (x === 172 && y >= 16 && y <= 31) || (x === 192 && y === 168) || (x === 169 && y === 254);
  }
  if (a.includes(':')) return a === '::1' || /^fe[89ab]/.test(a) || /^f[cd]/.test(a);
  return false;
}

// The address of an SDP candidate line (`a=candidate:…` or `candidate:…`), its fifth field.
const candidateAddress = (line: string): string => line.replace(/^a=/, '').split(' ')[4] ?? '';

/** Whether every address an SDP offers is on its own network only (none at all counts so). */
export function offersOnlyLocal(sdp: string): boolean {
  return sdp
    .split(/\r?\n/)
    .filter((line) => line.startsWith('a=candidate:'))
    .every((line) => isLocalAddress(candidateAddress(line)));
}

/** An SDP without the addresses that are not on its own network only: what a direct call, with
 *  no call relay, may say of this device, so that it never shows its internet address. */
export function localOnlySdp(sdp: string): string {
  const eol = sdp.includes('\r\n') ? '\r\n' : '\n';
  return sdp
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('a=candidate:') || isLocalAddress(candidateAddress(line)))
    .join(eol);
}

/** The other side's description as this device takes it: `direct`, with no call relay, only its
 *  addresses on this network, so that this device's checks never reach an internet address and
 *  show it its own. */
export function remoteSdp(sdp: string, direct: boolean): string {
  return direct ? localOnlySdp(sdp) : sdp;
}

/** Whether a candidate the other side sent apart may be tried: any through a call relay, only one
 *  on this network when `direct`. */
export function candidateFits(candidate: { candidate: string }, direct: boolean): boolean {
  return !direct || isLocalAddress(candidateAddress(candidate.candidate));
}

const hasCandidate = (sdp: string): boolean => /^a=candidate:/m.test(sdp);

/** An SDP that fits in a call signal (MAX_SDP): as it is when it does; else without its addresses
 *  over TCP, the last tried and seldom the ones that connect, which a phone with several networks
 *  says many of when it says every address it has. */
export function fittingSdp(sdp: string): string {
  if (sdp.length <= MAX_SDP) return sdp;
  const eol = sdp.includes('\r\n') ? '\r\n' : '\n';
  return sdp
    .split(/\r?\n/)
    .filter((line) => !/^a=candidate:\S+ \d+ tcp /i.test(line))
    .join(eol);
}

/** A connection's session description once the addresses to try are in it, or after GATHER_MS
 *  with those found by then. `direct`: with no call relay, only its addresses on this network.
 *  `open`: straight over the internet (CallOptions.open): every address it has, soon after the
 *  first a helper server told, or after OPEN_WAIT_MS with none; with a call relay too (`relayed`),
 *  soon after the first address it relays, as through a call relay only, so that the call can go
 *  through it where it cannot go straight. */
export function describedSdp(connection: Connection, direct = false, open = false, relayed = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const done = () => {
      clearTimeout(timer);
      const given = connection.localDescription?.sdp ?? '';
      const sdp = direct ? localOnlySdp(given) : open ? fittingSdp(given) : given;
      if (!sdp || sdp.length > MAX_SDP) reject(new Error('No session description to send.'));
      else resolve(sdp);
    };
    let timer = setTimeout(done, open && !relayed ? OPEN_WAIT_MS : GATHER_MS);
    // «Complete» with no address in it yet is not taken: WebRTC 155 on Android says it before it
    // has seen the phone's networks (found on a Pixel, 2026-11-18), and its addresses come a moment
    // later. Sent without them, the other side has nothing to try, and both stay at «Connecting».
    const complete = () => connection.iceGatheringState === 'complete' && hasCandidate(connection.localDescription?.sdp ?? '');
    if (complete()) done();
    else {
      connection.addEventListener('icegatheringstatechange', () => complete() && done());
      let soon = false;
      connection.addEventListener('icecandidate', ({ candidate }) => {
        if (soon) return;
        // The last word (no candidate) after the addresses came: what there is goes.
        if (!candidate) {
          if (complete()) done();
          return;
        }
        // Through a call relay: soon after the first address it relays over UDP, not after every one.
        // Direct on one network: soon after an address there, should «complete» have come already.
        // Straight over the internet: soon after the first address a helper server told, over UDP; a
        // helper that does not answer is not waited for longer than OPEN_WAIT_MS. With a call relay
        // too: soon after the first address it relays, with the moment more of straight over the
        // internet for one a helper told, which mostly came already.
        const enough = direct ? connection.iceGatheringState === 'complete' : open && !relayed ? / udp .* typ srflx/i.test(candidate.candidate) : / udp .* typ relay/i.test(candidate.candidate);
        if (!enough) return;
        soon = true;
        clearTimeout(timer);
        timer = setTimeout(done, open ? OPEN_GRACE_MS : RELAYED_GRACE_MS);
      });
    }
  });
}

/** How long a group of helper servers is waited for before the next is asked (answeringHelpers), milliseconds. */
export const HELPER_WAIT_MS = 1_200;

/**
 * Asks `helpers` (STUN) what this phone's internet address is, on a connection of its own that
 * carries nothing and is closed at once: how long the first answer took, milliseconds; null when
 * none came within `wait`; or 'cannot' where a connection cannot be made only to ask.
 */
export function askHelpers(rtc: Rtc, helpers: string[], wait = HELPER_WAIT_MS): Promise<number | null | 'cannot'> {
  return new Promise((resolve) => {
    if (helpers.length === 0) return resolve(null);
    const began = Date.now();
    let connection: Connection | null = null;
    let over = false;
    const done = (answer: boolean | 'cannot') => {
      if (over) return;
      over = true;
      clearTimeout(timer);
      try {
        connection?.close();
      } catch {
        // Closed already.
      }
      resolve(answer === 'cannot' ? 'cannot' : answer ? Date.now() - began : null);
    };
    const timer = setTimeout(() => done(false), wait);
    try {
      const asking = rtc.connect(connectionConfig(null, helpers));
      connection = asking;
      if (!asking.addTransceiver) return done('cannot');
      // An address a helper told is said as one of its own kind (srflx). «Complete» is not waited
      // for: it may be said before any address came (describedSdp).
      asking.addEventListener('icecandidate', ({ candidate }) => {
        if (candidate && / typ srflx/i.test(candidate.candidate)) done(true);
      });
      asking.addTransceiver('audio', { direction: 'recvonly' });
      asking
        .createOffer()
        .then((offer) => asking.setLocalDescription(offer))
        .catch(() => done(false));
    } catch {
      done('cannot');
    }
  });
}

/**
 * Which helper servers a call straight over the internet asks (CallOptions.open): the first of
 * `groups` one of whose servers answers within `wait`, each group asked only when none of those
 * before it answered. None, when no group answers: the call then says only the addresses the phone
 * has by itself, which is enough on the same network, or with an address of its own on the
 * internet. Where a connection cannot be made only to ask, the first group, asked in the call itself.
 */
export async function answeringHelpers(rtc: Rtc, groups: string[][], wait = HELPER_WAIT_MS): Promise<string[]> {
  for (const [i, group] of groups.entries()) {
    const took = await askHelpers(rtc, group, wait);
    if (took === 'cannot') return i === 0 ? group : [];
    if (took !== null) return group;
  }
  return [];
}

/** Whether an offer reaches beyond its own network: it says a call relay's address, or an internet
 *  address of its own. One that says only addresses on its own network, as from a phone with no
 *  internet on the same Wi-Fi, can only be answered there. */
export function offersBeyond(offer: string): boolean {
  return / typ relay/.test(offer) || !offersOnlyLocal(offer);
}

/** The call relay to answer an offer with: none when the offer has no call relay address and
 *  offers only addresses on its own network, as from a phone with no internet on the same Wi-Fi,
 *  where only a direct connection can work. One with no call relay but an internet address is
 *  answered through ours all the same: a direct connection would show each side's address, which
 *  only Direct connections let it do, straight too (lib/calls.ts callSignal). */
export function relayToAnswer(offer: string, relay: CallRelay | null): CallRelay | null {
  return offersBeyond(offer) ? relay : null;
}

/** How many cameras `rtc` says there are; 0 when it cannot say. */
export async function cameraCount(rtc: Rtc): Promise<number> {
  try {
    return (await rtc.cameras?.()) ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Turns the camera of `local` to the next one: on the phone front to back, and back, by its own
 * switch; in a browser to the next camera it has, whose track then goes on each of `connections` in
 * place of the one before. `live`: whether the call still goes on. Resolves with whether it turned.
 */
export async function turnCamera(rtc: Rtc, local: Stream | null, connections: Connection[], live: () => boolean): Promise<boolean> {
  const [track] = local?.getVideoTracks() ?? [];
  if (!local || !track) return false;
  if (track._switchCamera) {
    track._switchCamera();
    return true;
  }
  if (!rtc.nextCamera) return false;
  const next = await rtc.nextCamera(track).catch(() => null);
  if (!next) return false;
  if (!live() || !local.getVideoTracks().includes(track)) {
    next.stop();
    return false;
  }
  next.enabled = track.enabled;
  for (const connection of connections) {
    const sender = connection.getSenders?.().find((s) => s.track === track);
    await sender?.replaceTrack?.(next).catch(() => undefined);
  }
  local.removeTrack?.(track);
  local.addTrack?.(next);
  track.stop();
  // It ended meanwhile: the camera goes off with it.
  if (!live()) next.stop();
  return true;
}

export class Call {
  readonly id: string;
  readonly peer: string;
  /** Video goes both ways: from the start, or once added to a voice call. A video call answered
   *  without the camera is one too: their picture comes, and ours goes once the camera is on. */
  video: boolean;
  readonly outgoing: boolean;
  /** Video is being added to the call from here, until they say yes or no; or our camera turned on. */
  addingVideo = false;
  state: CallState;
  ended: Ended | null = null;
  local: Stream | null = null;
  remote: Stream | null = null;
  muted = false;
  cameraOff = false;
  /** How many cameras the phone or computer has, once one was opened; 0 while not known. */
  cameras = 0;
  /** When it connected, milliseconds, or 0. */
  connectedAt = 0;
  /** When it was made or came; when their phone rang, ours; and when it was answered here, or their answer came: milliseconds, or 0 (lib/call-quality.ts). */
  readonly madeAt = Date.now();
  ringingAt = 0;
  answeredAt = 0;
  private connection: Connection | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly options: CallOptions;
  // The offer, for a call that rings here.
  private offer: string;
  // Their addresses that came before their description was set, and whether it is.
  private candidates: { candidate: string; sdpMid: string }[] = [];
  private described = false;
  // Their description that adds video, while they wait for our yes or no, and how long it waits.
  private videoOffer: string | null = null;
  private askTimer: ReturnType<typeof setTimeout> | null = null;
  // An offer of ours could not be taken back: the call goes on, but nothing more is added to it.
  private settled = false;
  // They take a new description of the call while it goes on, as their offer or answer said
  // (CallSignal's reoffer); an Erevos from before does not, and is sent none.
  private theyChange = false;
  // A voice call answered with the camera: video is asked for once it connects.
  private videoWanted = false;
  // A video call answered without the camera, where the answer still said video goes both ways
  // (CallEvents.bothWays): what sends our camera, once it is turned on.
  private idle: Sender | null = null;
  // Our new description, waiting for their answer as Erevos's own signals say it.
  private reanswered: ((sdp: string | null) => void) | null = null;
  // Their new description being taken; and the last one of Erevos's own signals, so one come twice is taken once.
  private taking = false;
  private lastChange = '';

  private constructor(id: string, outgoing: boolean, offer: string, options: CallOptions) {
    this.id = id;
    this.peer = options.peer;
    this.video = options.video;
    this.outgoing = outgoing;
    this.state = outgoing ? 'calling' : 'incoming';
    this.offer = offer;
    this.options = options;
  }

  /** Calls a contact. Throws if a call is already in progress. */
  static start(options: CallOptions): Call {
    if (currentCall() || otherCallOn()) throw new Error(t('There is a call already.'));
    const call = new Call(newCallId(), true, '', options);
    current = call;
    void call.dial();
    return call;
  }

  /** A contact's call that rings here, from their offer. Null if a call is already in progress. */
  static incoming(signal: Extract<CallSignal, { kind: 'offer' }>, options: Omit<CallOptions, 'video'>): Call | null {
    if (currentCall() || otherCallOn()) return null;
    const call = new Call(signal.id, false, signal.sdp, { ...options, video: signal.video });
    call.theyChange = signal.reoffer === true;
    current = call;
    call.wait(RING_MS, 'missed', true);
    call.say({ id: call.id, kind: 'ringing' });
    return call;
  }

  /** What WebRTC measures of the connection now, or null with none (lib/call-quality.ts). */
  async stats(): Promise<{ forEach(each: (value: unknown) => void): void } | null> {
    return (await this.connection?.getStats?.().catch(() => null)) ?? null;
  }

  /** Whether the call has a call relay to go through, which sees this phone's internet address: only through it, or, straight over the internet too (CallOptions.open), where it cannot go straight. */
  get throughRelay(): boolean {
    return this.options.relay !== null;
  }

  /** Whether the call goes from here straight to them over the internet, with no call relay of ours (CallOptions.open): they see this phone's internet address. */
  get direct(): boolean {
    return this.options.relay === null && !!this.options.open;
  }

  /** Whether the call ended without ever connecting straight between the two phones (CallOptions.open), where no call relay of ours could carry it instead. */
  get failedDirect(): boolean {
    return this.direct && !this.connectedAt && this.ended?.reason === 'failed';
  }

  // With no call relay, and not straight over the internet: only addresses on this network are said, and taken.
  private get nearOnly(): boolean {
    return this.options.relay === null && !this.options.open;
  }

  // Our description of the call, with the addresses to try as its way says them.
  private ourSdp(connection: Connection): Promise<string> {
    return describedSdp(connection, this.nearOnly, !!this.options.open, this.throughRelay);
  }

  /** Whether our camera is on its way to them: not in a call answered with voice only, until it is turned on. */
  get hasCamera(): boolean {
    return (this.local?.getVideoTracks().length ?? 0) > 0;
  }

  /** Whether this call, ringing here, can be answered with video: a video call, or a voice call whose way can add video. */
  get canAnswerWithVideo(): boolean {
    return this.video || this.theyChange;
  }

  /**
   * Answers a call that rings here, with the camera (`video`) or with voice only. A voice call
   * answered with the camera asks them, once it connects, to take its video and send theirs; a
   * video call answered without it gets their picture, and ours goes only once the camera is on.
   */
  async answer(video = this.video): Promise<void> {
    if (this.outgoing || this.state !== 'incoming') return;
    this.answeredAt = Date.now();
    this.set('connecting');
    this.wait(CONNECT_MS, 'failed', true);
    this.videoWanted = video && !this.video;
    const camera = video && this.video;
    if (this.video && !camera) this.cameraOff = true;
    try {
      if (!this.offer && this.options.events.offer) this.offer = await this.options.events.offer();
      if ((this.state as CallState) === 'ended') return;
      const connection = await this.connect(camera);
      await connection.setRemoteDescription({ type: 'offer', sdp: remoteSdp(this.offer, this.nearOnly) });
      this.described = true;
      this.addCandidates([]);
      if (this.video && !camera && this.options.events.bothWays) this.keepBothWays(connection);
      await connection.setLocalDescription(await connection.createAnswer());
      const sdp = await this.ourSdp(connection);
      // Hung up while it connected.
      if ((this.state as CallState) === 'ended') return;
      await this.options.events.send({ id: this.id, kind: 'answer', sdp, reoffer: true });
    } catch {
      this.end('failed', true);
    }
  }

  /** Turns down a call that rings here. */
  decline(): void {
    if (this.state === 'incoming') this.end('decline', true);
  }

  /**
   * Stops a call that rings here, or was just answered here, as another device of the account
   * answered it first, or turned it down (`declined`). Nothing is said to the contact: that device did.
   */
  endedElsewhere(declined: boolean): void {
    if (this.outgoing || (this.state !== 'incoming' && this.state !== 'connecting')) return;
    this.end(declined ? 'decline' : 'hangup', true, true);
  }

  /** Ends the call from here. */
  hangUp(): void {
    if (this.state === 'ended') return;
    // Ours, not answered: to them, a call they missed.
    this.end(this.outgoing && this.state !== 'connecting' && this.state !== 'connected' ? 'missed' : 'hangup', true);
  }

  /** What the contact's phone said about this call. */
  receive(signal: CallSignal): void {
    if (signal.id !== this.id || this.state === 'ended') return;
    if (signal.kind === 'ringing' && this.state === 'calling') {
      this.ringingAt = Date.now();
      this.set('ringing');
      this.wait(RING_MS, 'missed', true);
    } else if (signal.kind === 'answer' && this.outgoing && (this.state === 'calling' || this.state === 'ringing')) {
      if (signal.reoffer) this.theyChange = true;
      this.answeredAt = Date.now();
      this.set('connecting');
      this.wait(CONNECT_MS, 'failed', true);
      this.connection
        ?.setRemoteDescription({ type: 'answer', sdp: remoteSdp(signal.sdp, this.nearOnly) })
        .then(() => {
          this.described = true;
          this.addCandidates([]);
        })
        .catch(() => this.end('failed', true));
    } else if (signal.kind === 'end') {
      this.end(signal.reason, false);
    } else if (signal.kind === 'reoffer' && this.theyChange) {
      // The same that came twice, through the account's phone and straight: taken once.
      if (signal.sdp === this.lastChange) return;
      this.lastChange = signal.sdp;
      this.videoAsked(signal.sdp);
    } else if (signal.kind === 'reanswer') {
      this.reanswered?.(signal.sdp ?? null);
    }
  }

  /** Their addresses that came apart from their description, tried once it is set. */
  addCandidates(candidates: { candidate: string; sdpMid: string }[]): void {
    this.candidates.push(...candidates);
    const connection = this.connection;
    if (!this.described || !connection?.addIceCandidate || this.state === 'ended') return;
    for (const candidate of this.candidates.splice(0)) if (candidateFits(candidate, this.nearOnly)) connection.addIceCandidate(candidate).catch(() => undefined);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.local?.getAudioTracks().forEach((track) => (track.enabled = !muted));
    this.changed();
  }

  setCameraOff(off: boolean): void {
    // No camera to turn on: one answered with voice only is turned on by turnCameraOn.
    if (!off && !this.hasCamera) return;
    this.cameraOff = off;
    this.local?.getVideoTracks().forEach((track) => (track.enabled = !off));
    this.changed();
  }

  /** Front camera to back, or back; in a browser, the next camera there is. */
  switchCamera(): void {
    void turnCamera(this.options.rtc, this.local, this.connection ? [this.connection] : [], () => this.state !== 'ended').then((turned) => {
      if (!turned) return;
      this.changed();
      // The phone says which way it faces once it turned: its picture is mirrored only facing us.
      setTimeout(() => this.state !== 'ended' && this.changed(), 600);
    });
  }

  // A change of the call can be asked for now: where its way can, connected, nothing else being changed.
  private get changeable(): boolean {
    return this.theyChange && this.state === 'connected' && !this.addingVideo && !this.taking && this.videoOffer === null && !this.settled;
  }

  /** Whether video can be added to this voice call from here: once it is connected, where its way of calling can. */
  get canAddVideo(): boolean {
    return !this.video && this.changeable;
  }

  /** Whether our camera can be turned on in a video call answered without it. */
  get canTurnCameraOn(): boolean {
    if (!this.video || this.hasCamera || this.state !== 'connected' || this.addingVideo) return false;
    return !!this.idle || (this.changeable && !this.options.events.addsOnly);
  }

  /** Whether they ask to add video to this voice call, waiting for acceptVideo or declineVideo. */
  get askingVideo(): boolean {
    return this.videoOffer !== null;
  }

  /** Turns the camera on in a voice call, and asks them to take its video and send theirs; in a
   *  video call answered without the camera, turns it on (turnCameraOn). */
  async addVideo(): Promise<void> {
    const connection = this.connection;
    if (!connection || !(this.canAddVideo || (this.canTurnCameraOn && !this.idle))) return;
    this.addingVideo = true;
    this.changed();
    let camera: { track: Track; sender: unknown } | null = null;
    let offered = false;
    try {
      camera = await this.camera(connection);
      await connection.setLocalDescription(await connection.createOffer());
      offered = true;
      const sdp = await this.ourSdp(connection);
      const answer = await this.changeMedia(sdp);
      if ((this.state as CallState) === 'ended') return;
      await connection.setRemoteDescription({ type: 'answer', sdp: remoteSdp(answer, this.nearOnly) });
      this.video = true;
      this.cameraOff = false;
    } catch {
      // They would not, or it did not go: the call goes on as it was.
      if ((this.state as CallState) !== 'ended') await this.takeBack(connection, camera, offered);
    } finally {
      this.addingVideo = false;
      this.changed();
    }
  }

  /**
   * Turns our camera on in a video call answered without it: at once where the answer kept video
   * both ways (CallEvents.bothWays), else as a new description of the call, which their phone takes
   * without asking, as it sends its own picture already.
   */
  async turnCameraOn(): Promise<void> {
    if (!this.canTurnCameraOn) return;
    const idle = this.idle;
    if (!idle) return this.addVideo();
    this.idle = null;
    this.addingVideo = true;
    this.changed();
    let track: Track | undefined;
    try {
      const camera = await this.options.rtc.media({ audio: false, video: true });
      camera.getAudioTracks().forEach((t) => t.stop());
      track = camera.getVideoTracks()[0];
      if (!track || !idle.replaceTrack) throw new Error('No camera.');
      if ((this.state as CallState) === 'ended') throw new Error(t('The call ended.'));
      await idle.replaceTrack(track);
      if ((this.state as CallState) === 'ended') throw new Error(t('The call ended.'));
      this.local?.addTrack?.(track);
      this.cameraOff = false;
      void this.countCameras();
    } catch {
      track?.stop();
      this.idle = idle;
    } finally {
      this.addingVideo = false;
      this.changed();
    }
  }

  /**
   * Their new description of the call, while it goes on. In a voice call it asks to add video, and
   * waits ASK_MS for acceptVideo or declineVideo; in a video call it is taken at once, as their
   * camera turned on. `ask` false: taken at once in either (Matrix's calls, which have no no).
   */
  videoAsked(sdp: string, ask = true): void {
    // Where media can only be added (XMPP's), more of it in a video call is not taken.
    const more = this.video && !!this.options.events.addsOnly;
    if (more || this.state !== 'connected' || this.addingVideo || this.taking || this.videoOffer !== null || this.settled) {
      this.answerChange(null).catch(() => undefined);
      return;
    }
    if (this.video || !ask) {
      void this.takeChange(sdp);
      return;
    }
    this.videoOffer = sdp;
    this.askTimer = setTimeout(() => this.declineVideo(), ASK_MS);
    this.changed();
  }

  /** Yes to their video: our camera goes on too. */
  async acceptVideo(): Promise<void> {
    const connection = this.connection;
    const offer = this.videoOffer;
    if (!connection || offer === null) return;
    this.stopAsking();
    this.taking = true;
    this.changed();
    let camera: { track: Track; sender: unknown } | null = null;
    try {
      camera = await this.camera(connection);
      await connection.setRemoteDescription({ type: 'offer', sdp: remoteSdp(offer, this.nearOnly) });
      await connection.setLocalDescription(await connection.createAnswer());
      const sdp = await this.ourSdp(connection);
      if ((this.state as CallState) === 'ended') return;
      await this.answerChange(sdp);
      this.video = true;
      this.cameraOff = false;
    } catch {
      if (camera) this.dropCamera(connection, camera);
      this.answerChange(null).catch(() => undefined);
      // Their offer was taken, but no answer went: nothing more can be added.
      this.settled = true;
    } finally {
      this.taking = false;
      this.changed();
    }
  }

  /** No to their video: the call goes on as a voice call. */
  declineVideo(): void {
    if (this.videoOffer === null) return;
    this.stopAsking();
    this.answerChange(null).catch(() => undefined);
    this.changed();
  }

  private stopAsking(): void {
    this.videoOffer = null;
    if (this.askTimer) clearTimeout(this.askTimer);
    this.askTimer = null;
  }

  // Their answer to our new description: the call's way's (XMPP's content-add, Matrix's
  // negotiate), or Erevos's own signals, waiting ADD_MS for theirs.
  private changeMedia(sdp: string): Promise<string> {
    const add = this.options.events.addMedia;
    if (add) return add(this.id, sdp);
    return new Promise((resolve, reject) => {
      const done = (answer: string | null) => {
        clearTimeout(timer);
        if (this.reanswered === done) this.reanswered = null;
        if (answer) resolve(answer);
        else reject(new Error('They did not take it.'));
      };
      const timer = setTimeout(() => done(null), ADD_MS);
      this.reanswered = done;
      this.options.events.send({ id: this.id, kind: 'reoffer', sdp }).catch(() => done(null));
    });
  }

  // Our answer to their new description, or with null our no.
  private answerChange(sdp: string | null): Promise<void> {
    const answer = this.options.events.answerMedia;
    if (answer) return answer(this.id, sdp);
    return this.options.events.send(sdp === null ? { id: this.id, kind: 'reanswer' } : { id: this.id, kind: 'reanswer', sdp });
  }

  // Their new description taken as it is, with nothing of ours added: their camera turned on in a
  // video call, or (Matrix's) whatever they changed, their picture added to a voice call too.
  private async takeChange(offer: string): Promise<void> {
    const connection = this.connection;
    if (!connection) return;
    this.taking = true;
    try {
      await connection.setRemoteDescription({ type: 'offer', sdp: remoteSdp(offer, this.nearOnly) });
      await connection.setLocalDescription(await connection.createAnswer());
      const sdp = await this.ourSdp(connection);
      if ((this.state as CallState) === 'ended') return;
      await this.answerChange(sdp);
      // Their picture, added to a voice call: it shows, and our camera stays off until turned on.
      if (!this.video && /^m=video /m.test(offer)) {
        this.video = true;
        this.cameraOff = true;
      }
    } catch {
      if ((this.state as CallState) !== 'ended') {
        this.settled = true;
        this.answerChange(null).catch(() => undefined);
      }
    } finally {
      this.taking = false;
      this.changed();
    }
  }

  // The camera's track, in the stream of the call's sound and on its way to them.
  private async camera(connection: Connection): Promise<{ track: Track; sender: unknown }> {
    const camera = await this.options.rtc.media({ audio: false, video: true });
    camera.getAudioTracks().forEach((track) => track.stop());
    const [track] = camera.getVideoTracks();
    if (!track) throw new Error('No camera.');
    if ((this.state as CallState) === 'ended') {
      track.stop();
      throw new Error(t('The call ended.'));
    }
    const local = this.local ?? camera;
    if (local !== camera) local.addTrack?.(track);
    const sender = connection.addTrack(track, local);
    void capVideo(sender, track, !this.nearOnly);
    void this.countCameras();
    return { track, sender };
  }

  private dropCamera(connection: Connection, camera: { track: Track; sender: unknown }): void {
    try {
      connection.removeTrack?.(camera.sender);
    } catch {
      // Gone with the connection.
    }
    this.local?.removeTrack?.(camera.track);
    camera.track.stop();
  }

  // Back to the voice call as it was: our offer taken back, the camera off.
  private async takeBack(connection: Connection, camera: { track: Track; sender: unknown } | null, offered: boolean): Promise<void> {
    if (offered) {
      try {
        await connection.setLocalDescription({ type: 'rollback', sdp: '' });
      } catch {
        this.settled = true;
      }
    }
    if (camera) this.dropCamera(connection, camera);
  }

  // XMPP's: the answer still says video goes both ways, with nothing of ours on it until the camera is on.
  private keepBothWays(connection: Connection): void {
    const idle = connection.getTransceivers?.().find((t) => t.receiver.track?.kind === 'video' && !t.sender.track);
    if (!idle) return;
    try {
      idle.direction = 'sendrecv';
      this.idle = idle.sender;
    } catch {
      // As it came: their picture only.
    }
  }

  private async countCameras(): Promise<void> {
    const count = await cameraCount(this.options.rtc);
    if (count === this.cameras || this.state === 'ended') return;
    this.cameras = count;
    this.changed();
  }

  private async dial(): Promise<void> {
    this.wait(RING_MS, 'missed', true);
    try {
      const connection = await this.connect(this.video);
      await connection.setLocalDescription(await connection.createOffer());
      const sdp = await this.ourSdp(connection);
      if (this.state === 'ended') return;
      await this.options.events.send({ id: this.id, kind: 'offer', video: this.video, sdp, at: callNow(), reoffer: true });
      // Gone: their phone may ring for it until it is OFFER_FRESH_MS old (calls.ts), so this waits
      // that long for it to say so, unless it said so already, or answered.
      if (this.state === 'calling') this.wait(OFFER_FRESH_MS + RINGING_BACK_MS, 'missed', true);
    } catch {
      this.end('failed', true);
    }
  }

  // The microphone, and the camera when `camera`, and the connection carrying them.
  private async connect(camera: boolean): Promise<Connection> {
    // Straight over the internet, with a call relay or not: which helper servers answer is asked
    // meanwhile, a reserve only when those before it do not (answeringHelpers).
    const asked = this.options.open ? answeringHelpers(this.options.rtc, this.options.open) : null;
    const local = await this.options.rtc.media({ audio: true, video: camera });
    if (this.state === 'ended') {
      local.getTracks().forEach((track) => track.stop());
      throw new Error(t('The call ended.'));
    }
    this.local = local;
    if (camera) void this.countCameras();
    const helpers = await asked;
    if ((this.state as CallState) === 'ended') throw new Error(t('The call ended.'));
    const connection = this.options.rtc.connect(connectionConfig(this.options.relay, helpers));
    this.connection = connection;
    local.getTracks().forEach((track) => void capVideo(connection.addTrack(track, local), track, !this.nearOnly));
    connection.addEventListener('track', ({ streams, track }) => {
      // Their video, added to a voice call, comes in the stream of its sound: shown anew all the same.
      if (streams[0]) {
        this.remote = theirStream(this.remote, streams[0], track);
        this.changed();
      } else if (track && this.remote && !this.remote.getTracks().includes(track)) {
        // One said with no stream of its own (from an answer that kept video both ways): with their sound's.
        this.remote.addTrack?.(track);
        this.changed();
      }
    });
    connection.addEventListener('connectionstatechange', () => this.connectionChanged(connection.connectionState));
    this.changed();
    return connection;
  }

  private connectionChanged(state: string) {
    if (this.state === 'ended') return;
    if (state === 'connected') {
      this.stopWaiting();
      if (!this.connectedAt) this.connectedAt = Date.now();
      this.set('connected');
      // Answered with the camera: their phone is asked to take its video now.
      if (this.videoWanted) {
        this.videoWanted = false;
        if (this.canAddVideo) void this.addVideo();
      }
    } else if (state === 'disconnected' && this.state === 'connected') {
      // Wi-Fi to mobile data, a tunnel: give it a moment to come back.
      this.wait(RECONNECT_MS, 'failed', true);
    } else if (state === 'failed') {
      this.end('failed', true);
    }
  }

  private end(reason: CallEnd, byUs: boolean, elsewhere = false): void {
    if (this.state === 'ended') return;
    // Through the call relay and never connected: its credentials kept are asked for anew next time.
    if (reason === 'failed' && this.options.relay && !this.connectedAt) forgetCallRelays();
    this.stopWaiting();
    this.stopAsking();
    this.ended = { reason, byUs, ...(elsewhere ? { elsewhere } : {}) };
    this.state = 'ended';
    this.local?.getTracks().forEach((track) => track.stop());
    try {
      this.connection?.close();
    } catch {
      // Closed already.
    }
    if (current === this) current = null;
    // Our new description waits no more.
    this.reanswered?.(null);
    if (byUs && !elsewhere) this.say({ id: this.id, kind: 'end', reason });
    this.changed();
  }

  // A signal whose loss only means the other phone finds out later (by its own timeout).
  private say(signal: CallSignal) {
    this.options.events.send(signal).catch(() => undefined);
  }

  private wait(ms: number, reason: CallEnd, byUs: boolean) {
    this.stopWaiting();
    this.timer = setTimeout(() => this.end(reason, byUs), ms);
  }

  private stopWaiting() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private set(state: CallState) {
    if (this.state === state || this.state === 'ended') return;
    this.state = state;
    this.changed();
  }

  private changed() {
    this.options.events.onChange(this);
  }
}
