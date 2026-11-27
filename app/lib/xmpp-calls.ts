// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { callNow, currentCall, OFFER_FRESH_MS, type Call, type Rtc } from './call';
import type { CallEnd, CallSignal } from './call-signal';
import { CALL_LINE, callSignal, shownCall, startCall, type CallPlace } from './calls';
import { hiddenRinging, setHiddenRinging } from './hidden-ring';
import { t } from './i18n';
import { candidatesOf, GROUPING, ICE, JINGLE, jingleToSdp, otherSetup, RTP, sdpToJingle, setupOf, type Role } from './jingle-sdp';
import { callsOff, CALLS_OFF_LINE } from './modes';
import { placeNetworkRang } from './network-notices';
import { onTorWay, type CallRelay } from './relay';
import { spaceCalls } from './space-calls';
import { bare, nameOf, NS, setCallHook, type XmppConnection, type XmppState } from './xmpp';
import { watchXmppGroupCalls } from './xmpp-muji';
import { onXmppChange, xmppCallLine, xmppClosedPlace, xmppLink, xmppNow, xmppPlaceAccount } from './xmpp-store';
import { child, children, el, type XmlElement } from './xmpp-xml';

// One-to-one calls with people on XMPP (docs/xmpp.md), as Conversations, Monal and Dino make them:
// a call rings with Jingle Message Initiation (XEP-0353): the caller proposes it to all the
// person's devices, the one that answers says proceed, and then Jingle (XEP-0166, XEP-0167) sets
// it up between those two devices: the session-initiate carries the caller's description, the
// session-accept the answer, each turned to and from WebRTC's by lib/jingle-sdp.ts, and more
// addresses come one at a time (transport-info). The call itself is lib/call.ts's, the same as
// Erevos's own, and shows on the same screen (lib/calls.ts, components/call-host.tsx).
//
// Video is added to a voice call as Conversations adds it (content-add, XEP-0166): the side that
// adds it sends the new content, the other side's screen asks, and a yes (content-accept) turns its
// camera on too; a no (content-reject) leaves the call as it was. Each side's description of the
// call as it is now is put together from the contents said so far (Session.theirs). A voice call
// answered with video asks so once it connects. A video call answered with voice only still says
// video goes both ways, as the other apps expect, with nothing of ours on it until the camera is
// turned on, which then needs nothing more said.
//
// What is not the same: the descriptions, the key fingerprint of the call's encryption
// (DTLS-SRTP) included, pass through the XMPP servers as they are, not end-to-end encrypted, so
// those servers could put themselves in between. The call goes through our own call relay when
// the space has one, else the XMPP server's (XEP-0215), and only through it, so the other side
// learns no address of this phone; with neither, it goes straight and they learn it.
//
// A hidden place's own account (lib/place-networks.ts) calls and is called the same way while its
// hidden chats are open, as a place of calls of its own (xmppPlaceCalls): they stay open through
// its call (app/chat.tsx), and it ends as they close. While they are closed, if they receive while
// closed, a call to it rings with no name (lib/background.ts) and waits for the PIN to open them
// (held): then it rings in them as their other calls do, and the PIN on the ring screen answers it.
//
// Group calls, as Dino makes them, are lib/xmpp-muji.ts's: what comes for them is handed over here.

export const XMPP_PREFIX = 'xmpp:';

const JMI = NS.jmi;
const RTP_INFO = 'urn:xmpp:jingle:apps:rtp:info:1';
const ERRORS = 'urn:xmpp:jingle:errors:1';

/** One call with someone on XMPP, from its first ring to its end. */
type Session = {
  /** The id of the ring (XEP-0353), which is the Jingle session's too. */
  id: string;
  /** Their bare address. */
  jid: string;
  /** The address of their device in the call: the one that answered ours, or that rings us. */
  full: string;
  outgoing: boolean;
  video: boolean;
  /** Ours, kept until one of their devices answers. */
  offer: string;
  /** Rung with XEP-0353, not with the session-initiate itself (as older apps do). */
  rung: boolean;
  /** The session-initiate went or came. */
  started: boolean;
  /** Their session-initiate, as it came. */
  initiate: XmlElement | null;
  /** The answer, waiting for their session-initiate. */
  waiting: ((initiate: XmlElement) => void) | null;
  /** Their contents as the call has them now, in order: what their session-initiate or
   *  session-accept said, and what was added since; and whether they are bundled (XEP-0338). */
  theirs: XmlElement[];
  bundled: boolean;
  /** Their DTLS role, once the call is set up. */
  setup?: string;
  /** Ours, adding video: the names of the contents it adds, and their answer once it comes (null for no). */
  adding: { names: string[]; done: (accepted: XmlElement[] | null) => void } | null;
  /** Theirs, adding video: the contents they add, waiting for our yes or no. */
  asked: XmlElement[] | null;
  /** Of the open hidden place's own account, not the space's. */
  place?: true;
  /** Their addresses that came before the call was there to take them (transport-info). */
  early?: { candidate: string; sdpMid: string }[];
};

const noneYet = { initiate: null, waiting: null, theirs: [], bundled: false, adding: null, asked: null } as const;

/** How long video added from here waits for their yes, milliseconds: their screen asks them. */
const ADD_MS = 60_000;

/** An XMPP account that calls (lib/xmpp-store.ts). */
export type XmppCallsAccount = {
  /** The account and its connection, while it is connected. */
  link(): { state: XmppState; connection: XmppConnection } | null;
  /** Keeps a call's line in the chat with `jid`; one with the same `id` is said again in its place. */
  line(jid: string, mine: boolean, text: string, id: string, at?: number): Promise<void>;
};

/** A hidden place's own account, while its hidden chats are closed and receive: which place, and
 *  its chats' call lines. */
export type XmppClosedPlace = {
  space: number;
  pocket: number;
  line(jid: string, mine: boolean, text: string, id: string, at?: number): Promise<void>;
};

/** What the calls need of the open space: its XMPP account, the open hidden place's own, those of
 *  its closed places that receive, and its own call relay. The checks give their own. */
export type XmppCallsSpace = XmppCallsAccount & {
  /** The call relay beside the space's relay, or null. */
  callRelay(): Promise<CallRelay | null>;
  /** The open hidden place's own account, and whether its hidden chats are open (connected or not). */
  place?: XmppCallsAccount & { open(): boolean; now(): XmppState | null };
  /** The closed hidden place whose account `state` is, while it receives; null for none. */
  closed?(state: XmppState): XmppClosedPlace | null;
  /** Calls the listener as the accounts change (a place's opened or closed). Returns how to stop. */
  watch?(listener: () => void): () => void;
};

const theSpace: XmppCallsSpace = {
  link: xmppLink,
  line: xmppCallLine,
  callRelay: () => spaceCalls.callRelay(),
  place: xmppPlaceAccount,
  closed: xmppClosedPlace,
  watch: onXmppChange,
};

const sessions = new Map<string, Session>();
let rtcNow: Rtc | null = null;
let space = theSpace;

const calling = (id: string): Call | null => {
  const call = currentCall();
  return call?.id === id ? call : null;
};

/** The account of the space (false) or of the open hidden place (true). */
const accountOf = (place: boolean | undefined): XmppCallsAccount | undefined => (place ? space.place : space);

function link(place: boolean): { state: XmppState; connection: XmppConnection } {
  const now = accountOf(place)?.link();
  if (!now) throw new Error(t('Not connected to the XMPP server yet. Try again in a moment.'));
  return now;
}

/** Whether `state` is the open hidden place's account (true) or the space's (false); null for neither. */
function placeOf(state: XmppState): boolean | null {
  if (space.link()?.state === state) return false;
  if (space.place?.link()?.state === state) return true;
  return null;
}

/** A call of the account `place` says: one of the other is none of its. */
const sessionOf = (id: string, place: boolean): Session | undefined => {
  const s = sessions.get(id);
  return s && !!s.place === place ? s : undefined;
};

const jmi = (to: string, name: string, id: string, ...inner: XmlElement[]) =>
  el('message', { to, type: 'chat', id: `${name}-${id}` }, el(name, { xmlns: JMI, id }, ...inner), el('store', { xmlns: NS.hints }));

const reasonElement = (reason: string) => el('reason', { xmlns: JINGLE }, el(reason));

/** Jingle's reason for how a call of ours ended (XEP-0166). */
function jingleReason(end: CallEnd, outgoing: boolean, connected: boolean): string {
  if (end === 'decline') return 'decline';
  if (end === 'busy') return 'busy';
  if (end === 'failed') return 'connectivity-error';
  if (end === 'missed') return outgoing ? 'cancel' : 'timeout';
  return connected ? 'success' : 'cancel';
}

/** How a call of theirs ended, from Jingle's reason, or XEP-0353's. */
function callEnd(reason: XmlElement | undefined, connected: boolean): CallEnd {
  const name = children(reason).find((c) => c.name !== 'text')?.name ?? '';
  if (name === 'decline') return 'decline';
  if (name === 'busy') return 'busy';
  if (name === 'success') return 'hangup';
  if (name === 'cancel' || name === 'timeout' || name === 'expired' || name === '') return connected ? 'hangup' : 'missed';
  return 'failed';
}

// ---- the places, as lib/calls.ts knows places: the space's account's calls, and the open hidden place's ----

function callsOf(place: boolean): CallPlace {
  const mark = place ? { place: true as const } : {};
  return {
    async send(jid, signal) {
      const { connection } = link(place);
      const s = sessionOf(signal.id, place);
      switch (signal.kind) {
        case 'offer': {
          // Ours: it rings on every device of theirs that can take calls.
          sessions.set(signal.id, { ...noneYet, theirs: [], id: signal.id, jid, full: '', outgoing: true, video: signal.video, offer: signal.sdp, rung: true, started: false, ...mark });
          const media = [el('description', { xmlns: 'urn:xmpp:jingle:apps:rtp:1', media: 'audio' }), signal.video ? el('description', { xmlns: 'urn:xmpp:jingle:apps:rtp:1', media: 'video' }) : null];
          await connection.send(jmi(jid, 'propose', signal.id, ...media.filter((m): m is XmlElement => m !== null)));
          return;
        }
        case 'ringing':
          if (!s) return;
          if (s.rung) await connection.send(jmi(s.full, 'ringing', s.id));
          else await connection.iq('set', s.full, el('jingle', { xmlns: JINGLE, action: 'session-info', sid: s.id }, el('ringing', { xmlns: RTP_INFO })));
          return;
        case 'answer':
          if (!s) throw new Error(t('The call ended.'));
          await connection.iq('set', s.full, el('jingle', { xmlns: JINGLE, action: 'session-accept', sid: s.id, responder: connection.fullJid }, ...sdpToJingle(signal.sdp, 'responder')));
          // The call as their offer and our answer set it up, for video added later.
          if (s.initiate) settle(s, s.initiate, otherSetup(setupOf(signal.sdp)));
          return;
        case 'end': {
          if (!s) return;
          sessions.delete(s.id);
          // The call has ended here already, and is no longer the current one: the one shown.
          const call = shownCall()?.call;
          const reason = jingleReason(signal.reason, s.outgoing, call?.id === s.id && !!call.connectedAt);
          if (s.started) {
            await connection.iq('set', s.full, el('jingle', { xmlns: JINGLE, action: 'session-terminate', sid: s.id }, reasonElement(reason))).catch(() => undefined);
            // Rung with XEP-0353: the end is told in both archives too, for their other devices.
            if (s.rung) await connection.send(jmi(s.jid, 'finish', s.id, reasonElement(reason))).catch(() => undefined);
          } else if (s.outgoing) {
            await connection.send(jmi(s.jid, 'retract', s.id, reasonElement(reason)));
          } else if (s.rung) {
            // Ours turned it down, or it rang out here: their phone stops ringing, and our other devices too.
            await connection.send(jmi(s.full, 'reject', s.id, reasonElement(reason)));
          }
          return;
        }
      }
    },

    async callRelay() {
      // Our own call relay first: the XMPP server then sees nothing of the call's addresses.
      const ours = await space.callRelay().catch(() => null);
      if (ours) return ours;
      const now = accountOf(place)?.link();
      return now ? serverTurn(now.state, now.connection).catch(() => null) : null;
    },

    line(peer, mine, text, id) {
      // By the call's id, the same as its ring's: a call has one line, however it ended.
      void accountOf(place)?.line(peer.slice(XMPP_PREFIX.length), mine, `${CALL_LINE}${text}`, `call-${id}`).catch(() => undefined);
    },

    name(peer) {
      const jid = peer.slice(XMPP_PREFIX.length);
      const state = accountOf(place)?.link()?.state ?? xmppNow(place ? 'place' : 'space').state;
      return state ? nameOf(state, jid) : jid;
    },

    // Video added from here: the contents our new description adds go to them (content-add), and
    // once they take them (content-accept), the call's whole description as theirs is now.
    async addMedia(jid, id, sdp) {
      const s = sessionOf(id, place);
      const { connection } = link(place);
      if (!s || s.jid !== jid || !s.theirs.length || s.adding || s.asked) throw new Error(t('The call ended.'));
      const ours: Role = s.outgoing ? 'initiator' : 'responder';
      const known = new Set(s.theirs.map((c) => c.attrs.name));
      const all = sdpToJingle(sdp, ours);
      const added = all.filter((c) => c.name === 'content' && !known.has(c.attrs.name));
      if (!added.length) throw new Error('Nothing to add.');
      for (const content of added) content.attrs.creator = ours;
      const came = new Promise<XmlElement[] | null>((resolve) => (s.adding = { names: added.map((c) => c.attrs.name ?? ''), done: resolve }));
      const timer = setTimeout(() => s.adding?.done(null), ADD_MS);
      try {
        await connection.iq('set', s.full, el('jingle', { xmlns: JINGLE, action: 'content-add', sid: s.id }, ...added, all.find((c) => c.name === 'group') ?? null));
        const accepted = await came;
        if (!accepted) throw new Error('They did not take the video.');
        const contents = [...s.theirs, ...accepted];
        const answer = described(s, contents, s.outgoing ? 'responder' : 'initiator');
        s.theirs = contents;
        return answer;
      } finally {
        clearTimeout(timer);
        s.adding = null;
      }
    },

    // Our yes to their video, with our camera's (content-accept), or our no (content-reject).
    async answerMedia(jid, id, sdp) {
      const s = sessionOf(id, place);
      const asked = s?.asked;
      if (!s || s.jid !== jid || !asked) return;
      s.asked = null;
      const { connection } = link(place);
      if (sdp === null) {
        await connection.iq('set', s.full, el('jingle', { xmlns: JINGLE, action: 'content-reject', sid: s.id }, ...asked.map((c) => el('content', { creator: c.attrs.creator, name: c.attrs.name })), reasonElement('decline')));
        return;
      }
      const names = new Map(asked.map((c) => [c.attrs.name, c.attrs.creator]));
      const all = sdpToJingle(sdp, s.outgoing ? 'initiator' : 'responder');
      const answered = all.filter((c) => c.name === 'content' && names.has(c.attrs.name));
      for (const content of answered) content.attrs.creator = names.get(content.attrs.name) ?? content.attrs.creator;
      await connection.iq('set', s.full, el('jingle', { xmlns: JINGLE, action: 'content-accept', sid: s.id }, ...answered, all.find((c) => c.name === 'group') ?? null));
      s.theirs = [...s.theirs, ...asked];
    },

    // Answering: their device is told to go on (proceed), our other devices to stop ringing
    // (accept), and the call waits for their session-initiate.
    async offer(jid) {
      const call = currentCall();
      const s = call ? sessionOf(call.id, place) : undefined;
      if (!s || s.jid !== jid || s.outgoing) throw new Error(t('The call ended.'));
      if (!s.initiate) {
        const { state, connection } = link(place);
        const came = new Promise<XmlElement>((resolve) => (s.waiting = resolve));
        await connection.send(jmi(s.full, 'proceed', s.id));
        await connection.send(jmi(state.jid, 'accept', s.id)).catch(() => undefined);
        s.initiate = await came;
      }
      return jingleToSdp(s.initiate, 'initiator', s.id);
    },

    // Content-add adds media, and changes none: a video call answered without the camera says
    // video goes both ways all the same, as the apps here expect, and the camera goes on it later.
    addsOnly: true,
    bothWays: true,
  };
}

/** The calls of the space's XMPP account. */
export const xmppCalls: CallPlace = callsOf(false);
/** The calls of the open hidden place's own XMPP account, while its hidden chats are open. */
export const xmppPlaceCalls: CallPlace = callsOf(true);

const callsFor = (place: boolean | undefined) => (place ? xmppPlaceCalls : xmppCalls);

/** Keeps the call's contents as their description set it up, and their DTLS role. */
function settle(s: Session, theirs: XmlElement, setup: string | undefined): void {
  s.theirs = children(theirs, 'content').filter((c) => child(c, 'description', RTP));
  s.bundled = children(theirs, 'group', GROUPING).some((g) => g.attrs.semantics === 'BUNDLE');
  s.setup = setup;
}

/** Their side of the call as it is now, from `contents` they wrote as `role`: bundled, a content
 *  that came without its transport has the first one's. */
function described(s: Session, contents: XmlElement[], role: Role): string {
  const first = child(contents[0], 'transport', ICE);
  const whole = contents.map((c) =>
    child(c, 'transport', ICE) || !first || !s.bundled ? c : el('content', c.attrs, ...c.children.filter((x): x is XmlElement => typeof x !== 'string'), el('transport', first.attrs, ...children(first, 'fingerprint'))),
  );
  const group = s.bundled ? el('group', { xmlns: GROUPING, semantics: 'BUNDLE' }, ...whole.map((c) => el('content', { name: c.attrs.name }))) : null;
  return jingleToSdp(el('jingle', { xmlns: JINGLE }, ...whole, group), role, s.id, s.setup);
}

/** The XMPP server's TURN server for calls (XEP-0215), as a call relay; null when it has none. */
async function serverTurn(state: XmppState, connection: XmppConnection): Promise<CallRelay | null> {
  const answer = await connection.iq('get', state.jid.slice(state.jid.indexOf('@') + 1), el('services', { xmlns: NS.extdisco }), 10_000);
  const turns = children(child(answer, 'services', NS.extdisco), 'service').filter(
    (s) => (s.attrs.type === 'turn' || s.attrs.type === 'turns') && s.attrs.host && s.attrs.username && s.attrs.password,
  );
  const first = turns[0];
  if (!first) return null;
  const same = turns.filter((s) => s.attrs.username === first.attrs.username && s.attrs.password === first.attrs.password);
  const urls = same.map((s) => {
    const host = s.attrs.host.includes(':') ? `[${s.attrs.host}]` : s.attrs.host;
    const port = s.attrs.port ? `:${s.attrs.port}` : '';
    return `${s.attrs.type}:${host}${port}${s.attrs.transport ? `?transport=${s.attrs.transport}` : ''}`;
  });
  return { urls, username: first.attrs.username, credential: first.attrs.password };
}

// ---- what comes ----

/** Whether a person may ring us: one in our contacts. Others' calls are only told as missed. */
function mayRing(state: XmppState, jid: string): boolean {
  const contact = state.roster[jid];
  return !!contact && contact.subscription !== 'none' && contact.subscription !== 'remove';
}

const kindOf = (video: boolean) => (video ? 'video call' : 'voice call');

// Rings with no offer: lib/call.ts asks for it as the call is answered (xmppCalls.offer), so the
// answer goes through a call relay whether or not their description has an address of one.
function ring(state: XmppState, s: Session, at: number): void {
  sessions.set(s.id, s);
  const rtc = rtcNow;
  const missed = (why = '') => {
    sessions.delete(s.id);
    void accountOf(s.place)?.line(s.jid, false, `${CALL_LINE}Missed ${kindOf(s.video)}${why}`, `call-${s.id}`, at).catch(() => undefined);
  };
  if (!rtc || !mayRing(state, s.jid)) return missed();
  // By the relay's clock, as lib/calls.ts judges an offer fresh.
  const stamp = callNow() - (Date.now() - at);
  // Video is added to it, or asked to be, with content-add (reoffer).
  void callSignal(callsFor(s.place), `${XMPP_PREFIX}${s.jid}`, { id: s.id, kind: 'offer', video: s.video, sdp: '', at: stamp, reoffer: true }, false, rtc)
    .then(() => {
      const call = calling(s.id);
      // Not rung here (missed, or busy with another call): lib/calls.ts said so, and kept its line.
      if (!call) sessions.delete(s.id);
      else if (s.early?.length) call.addCandidates(s.early.splice(0));
    })
    .catch(() => missed());
}

function onMessage(state: XmppState, connection: XmppConnection, message: XmlElement, how: { at: number; live: boolean; mine: boolean }): void {
  // The space's account's calls, or the open hidden place's: each hears its own.
  const place = placeOf(state);
  if (place === null) return onClosedMessage(state, message, how);
  const account = accountOf(place);
  const what = message.children.find((c): c is XmlElement => typeof c !== 'string' && c.ns === JMI);
  const id = what?.attrs.id;
  if (!what || !id) return;
  const from = message.attrs.from ?? '';
  const s = sessionOf(id, place);
  // Our propose came back as an error: their server or device cannot take it.
  if (message.attrs.type === 'error') {
    if (s?.outgoing) calling(id)?.receive({ id, kind: 'end', reason: 'failed' });
    return;
  }
  if (how.mine) {
    // Another device of ours answered or turned down the call that rings here.
    if (from === connection.fullJid) return;
    if ((what.name === 'accept' || what.name === 'proceed' || what.name === 'reject') && s && !s.outgoing && !s.started) {
      sessions.delete(id);
      calling(id)?.endedElsewhere(what.name === 'reject');
    }
    // From the archive: a call that rang here, answered or turned down elsewhere.
    if (!how.live && (what.name === 'proceed' || what.name === 'accept')) {
      const peer = bare(message.attrs.to ?? '');
      if (peer && peer !== state.jid) void account?.line(peer, false, `${CALL_LINE}${s?.video ? 'Video' : 'Voice'} call, answered on another device`, `call-${id}`, how.at).catch(() => undefined);
    }
    return;
  }
  const jid = bare(from);
  switch (what.name) {
    case 'propose': {
      const video = children(what, 'description').some((d) => d.attrs.media === 'video');
      const fresh = how.live && Date.now() - how.at < OFFER_FRESH_MS;
      const next: Session = { ...noneYet, theirs: [], id, jid, full: from, outgoing: false, video, offer: '', rung: true, started: false, ...(place ? { place: true as const } : {}) };
      if (!fresh) {
        void account?.line(jid, false, `${CALL_LINE}Missed ${kindOf(video)}`, `call-${id}`, how.at).catch(() => undefined);
        return;
      }
      ring(state, next, how.at);
      return;
    }
    case 'ringing':
      if (s?.outgoing && s.jid === jid) calling(id)?.receive({ id, kind: 'ringing' });
      return;
    case 'proceed':
      // The first of their devices to answer has the call; it gets our description.
      if (!s?.outgoing || s.jid !== jid || s.full) return;
      s.full = from;
      s.started = true;
      void connection
        .iq('set', from, el('jingle', { xmlns: JINGLE, action: 'session-initiate', sid: id, initiator: connection.fullJid }, ...sdpToJingle(s.offer, 'initiator')))
        .catch(() => calling(id)?.receive({ id, kind: 'end', reason: 'failed' }));
      return;
    case 'reject':
      if (!s?.outgoing || s.jid !== jid) return;
      sessions.delete(id);
      calling(id)?.receive({ id, kind: 'end', reason: callEnd(child(what, 'reason', JINGLE), false) === 'busy' ? 'busy' : 'decline' });
      return;
    case 'retract':
      if (!s || s.outgoing || s.jid !== jid) return;
      sessions.delete(id);
      calling(id)?.receive({ id, kind: 'end', reason: 'missed' });
      return;
    case 'finish':
      if (s && s.jid === jid) {
        sessions.delete(id);
        const call = calling(id);
        call?.receive({ id, kind: 'end', reason: callEnd(child(what, 'reason', JINGLE), !!call.connectedAt) });
      }
      return;
  }
}

async function onIq(state: XmppState, connection: XmppConnection, iq: XmlElement): Promise<void> {
  const jingle = child(iq, 'jingle', JINGLE)!;
  const from = iq.attrs.from ?? '';
  const sid = jingle.attrs.sid ?? '';
  const action = jingle.attrs.action;
  const reply = () => connection.send(el('iq', { type: 'result', id: iq.attrs.id, to: from }));
  const refuse = (condition: string, extra?: XmlElement) =>
    connection.send(el('iq', { type: 'error', id: iq.attrs.id, to: from }, el('error', { type: 'cancel' }, el(condition, { xmlns: NS.stanzas }), extra ?? null)));
  const place = placeOf(state);
  if (place === null) {
    const closed = space.closed?.(state);
    if (!closed) return refuse('service-unavailable');
    return onClosedIq(closed, state, jingle, from, reply, refuse);
  }
  const s = sessionOf(sid, place);
  if (action === 'session-initiate') {
    if (s) {
      // Ours answered their ring: this is the description it waits for.
      if (s.outgoing || s.full !== from || s.started) return refuse('bad-request');
      await reply();
      s.started = true;
      s.initiate = jingle;
      s.waiting?.(jingle);
      s.waiting = null;
      return;
    }
    // A call without a ring first, as older apps make: it rings with its description, once it can be read.
    try {
      jingleToSdp(jingle, 'initiator', sid);
    } catch {
      return refuse('feature-not-implemented');
    }
    await reply();
    const video = children(jingle, 'content').some((c) => children(c, 'description').some((d) => d.attrs.media === 'video'));
    ring(state, { ...noneYet, theirs: [], id: sid, jid: bare(from), full: from, outgoing: false, video, offer: '', rung: false, started: true, initiate: jingle, ...(place ? { place: true as const } : {}) }, Date.now());
    return;
  }
  if (!s || s.full !== from) return refuse('item-not-found', el('unknown-session', { xmlns: ERRORS }));
  switch (action) {
    case 'session-accept': {
      if (!s.outgoing) return refuse('bad-request');
      let sdp: string;
      try {
        sdp = jingleToSdp(jingle, 'responder', sid);
      } catch {
        await refuse('feature-not-implemented');
        calling(sid)?.receive({ id: sid, kind: 'end', reason: 'failed' });
        return;
      }
      await reply();
      settle(s, jingle, setupOf(sdp));
      calling(sid)?.receive({ id: sid, kind: 'answer', sdp, reoffer: true });
      return;
    }
    case 'content-add': {
      // Their video, added to the voice call: our screen asks, once it is set up and nothing else is being added.
      if (s.adding) return refuse('conflict', el('tie-break', { xmlns: ERRORS }));
      await reply();
      const call = calling(sid);
      const known = new Set(s.theirs.map((c) => c.attrs.name));
      const added = children(jingle, 'content');
      const video = added.length > 0 && added.every((c) => !known.has(c.attrs.name) && child(c, 'description', RTP)?.attrs.media === 'video');
      let sdp = '';
      try {
        if (call && video && s.theirs.length && !s.asked) sdp = described(s, [...s.theirs, ...added], s.outgoing ? 'responder' : 'initiator');
      } catch {
        sdp = '';
      }
      s.asked = added;
      if (sdp && call) call.videoAsked(sdp);
      else await callsFor(place).answerMedia!(s.jid, sid, null).catch(() => undefined);
      return;
    }
    case 'content-accept':
      await reply();
      if (s.adding) {
        const accepted = children(jingle, 'content').filter((c) => s.adding!.names.includes(c.attrs.name ?? ''));
        s.adding.done(accepted.length === s.adding.names.length ? accepted : null);
      }
      return;
    case 'content-reject':
      await reply();
      s.adding?.done(null);
      return;
    case 'transport-info': {
      await reply();
      const call = calling(sid);
      if (call) call.addCandidates(candidatesOf(jingle));
      else (s.early ??= []).push(...candidatesOf(jingle));
      return;
    }
    case 'session-info':
      await reply();
      if (s.outgoing && child(jingle, 'ringing', RTP_INFO)) calling(sid)?.receive({ id: sid, kind: 'ringing' });
      return;
    case 'session-terminate': {
      await reply();
      sessions.delete(sid);
      const call = calling(sid);
      call?.receive({ id: sid, kind: 'end', reason: callEnd(child(jingle, 'reason', JINGLE), !!call.connectedAt) });
      return;
    }
    default:
      // Moving a call, taking video off it, and the rest: not yet.
      return refuse('feature-not-implemented', el('unsupported-info', { xmlns: ERRORS }));
  }
}

// ---- a closed hidden place's ----

/** A call to a closed hidden place's own account, waiting for the PIN to open the place. */
type Held = { s: Session; state: XmppState; closed: XmppClosedPlace; at: number; timer: ReturnType<typeof setTimeout> | null };

const held = new Map<string, Held>();
// The held calls that rang in their place once it opened, for the PIN on the ring screen to answer.
const opened = new Set<string>();

/** Whether the call `id` waited, closed, for its hidden place to open: the PIN on the ring screen answers it (components/call-host.tsx). Asking forgets it. */
export function takeHeldXmppCall(id: string): boolean {
  return opened.delete(id);
}

// It rings with no name, from a contact of the account, while it is fresh (`live`, not from the
// archive, and not yet a minute old); else it is kept as missed. In INVISIBLE (lib/modes.ts) it
// does not ring at all, as it could not be answered: kept as missed at once, its line says why.
function hold(closed: XmppClosedPlace, state: XmppState, s: Session, at: number, live = true): void {
  if (held.has(s.id)) return;
  const stale = !rtcNow || !live || !mayRing(state, s.jid) || Date.now() - at >= OFFER_FRESH_MS;
  if (stale || callsOff()) {
    void closed.line(s.jid, false, `${CALL_LINE}Missed ${kindOf(s.video)}${stale ? '' : CALLS_OFF_LINE}`, `call-${s.id}`, at).catch(() => undefined);
    return;
  }
  const h: Held = { s, state, closed, at, timer: null };
  held.set(s.id, h);
  h.timer = setTimeout(() => letGo(h, `Missed ${kindOf(s.video)}`), at + OFFER_FRESH_MS - Date.now());
  placeNetworkRang(closed.space, closed.pocket);
}

// No longer held: kept with `text` as its line, unless null; its place's ring stops with its last call.
function letGo(h: Held, text: string | null, mine = false): void {
  if (held.get(h.s.id) !== h) return;
  held.delete(h.s.id);
  if (h.timer) clearTimeout(h.timer);
  if (text) void h.closed.line(h.s.jid, mine, `${CALL_LINE}${text}`, `call-${h.s.id}`, h.at).catch(() => undefined);
  const { space: where, pocket } = h.closed;
  const ringing = hiddenRinging();
  if (ringing?.space === where && ringing.pocket === pocket && ![...held.values()].some((o) => o.closed.space === where && o.closed.pocket === pocket)) setHiddenRinging(null);
}

// INVISIBLE chosen (lib/modes.ts): a closed place's call that rings with no name stops, as it could
// not be answered, kept as missed at once, its line says why.
onTorWay(() => {
  if (callsOff()) for (const h of [...held.values()]) letGo(h, `Missed ${kindOf(h.s.video)}${CALLS_OFF_LINE}`);
});

// Its place opened, its account the open one's now: what still rings rings there.
function promote(): void {
  const now = space.place?.now();
  if (!now) return;
  for (const h of [...held.values()]) {
    if (h.state !== now) continue;
    held.delete(h.s.id);
    if (h.timer) clearTimeout(h.timer);
    opened.add(h.s.id);
    ring(now, { ...h.s, place: true }, h.at);
  }
}

const capital = (kind: string) => kind.charAt(0).toUpperCase() + kind.slice(1);

function onClosedMessage(state: XmppState, message: XmlElement, how: { at: number; live: boolean; mine: boolean }): void {
  const closed = space.closed?.(state);
  const what = message.children.find((c): c is XmlElement => typeof c !== 'string' && c.ns === JMI);
  const id = what?.attrs.id;
  if (!closed || !what || !id || message.attrs.type === 'error') return;
  const h = held.get(id);
  const from = message.attrs.from ?? '';
  if (how.mine) {
    // Answered, or turned down, on another device of the account.
    if (h && (what.name === 'accept' || what.name === 'proceed')) letGo(h, `${capital(kindOf(h.s.video))}, answered on another device`, true);
    else if (h && what.name === 'reject') letGo(h, `${capital(kindOf(h.s.video))}, turned down`, true);
    return;
  }
  const jid = bare(from);
  if (what.name === 'propose') {
    const video = children(what, 'description').some((d) => d.attrs.media === 'video');
    const s: Session = { ...noneYet, theirs: [], id, jid, full: from, outgoing: false, video, offer: '', rung: true, started: false };
    hold(closed, state, s, how.at, how.live);
    return;
  }
  // Taken back, or ended, by the caller before the place opened.
  if (h && h.s.jid === jid && (what.name === 'retract' || what.name === 'finish')) letGo(h, `Missed ${kindOf(h.s.video)}`);
}

// A call without a ring first, as older apps make, held as one with; and what comes for one held.
async function onClosedIq(
  closed: XmppClosedPlace,
  state: XmppState,
  jingle: XmlElement,
  from: string,
  reply: () => Promise<void>,
  refuse: (condition: string, extra?: XmlElement) => Promise<void>,
): Promise<void> {
  const sid = jingle.attrs.sid ?? '';
  const h = held.get(sid);
  if (jingle.attrs.action === 'session-initiate') {
    if (h) return refuse('bad-request');
    try {
      jingleToSdp(jingle, 'initiator', sid);
    } catch {
      return refuse('feature-not-implemented');
    }
    await reply();
    const video = children(jingle, 'content').some((c) => children(c, 'description').some((d) => d.attrs.media === 'video'));
    hold(closed, state, { ...noneYet, theirs: [], id: sid, jid: bare(from), full: from, outgoing: false, video, offer: '', rung: false, started: true, initiate: jingle }, Date.now());
    return;
  }
  if (!h || h.s.full !== from) return refuse('item-not-found', el('unknown-session', { xmlns: ERRORS }));
  await reply();
  if (jingle.attrs.action === 'transport-info') (h.s.early ??= []).push(...candidatesOf(jingle));
  else if (jingle.attrs.action === 'session-terminate') letGo(h, `Missed ${kindOf(h.s.video)}`);
}

/** Takes XMPP calls in, with `rtc`, while the space is open (components/call-host.tsx). Returns how to stop. */
export function watchXmppCalls(rtc: Rtc, given: XmppCallsSpace = theSpace): () => void {
  rtcNow = rtc;
  space = given;
  const groups = watchXmppGroupCalls(rtc, {
    link: (place) => accountOf(place)?.link() ?? null,
    line: (place, jid, mine, text, id, at) => accountOf(place)?.line(jid, mine, text, id, at) ?? Promise.resolve(),
    callRelay: (place) => callsFor(place).callRelay(),
    placeOf,
    mayRing,
    placeOpen: () => !!given.place?.open(),
    closed: (state) => given.closed?.(state) ?? null,
    watch: given.watch,
  });
  setCallHook({
    message: onMessage,
    // A group call's session first: the rest are calls with one person.
    iq: async (state, connection, iq) => {
      if (!(await groups.iq(state, connection, iq))) await onIq(state, connection, iq);
    },
    invite: groups.invite,
    presence: groups.presence,
  });
  // A hidden place's call ends as its hidden chats close: its account goes with them. One held
  // for a closed place rings there as it opens.
  const stopWatch = given.watch?.(() => {
    promote();
    const shown = shownCall();
    if (shown?.place !== xmppPlaceCalls || given.place?.open()) return;
    if (shown.call.state === 'incoming') shown.call.decline();
    else shown.call.hangUp();
  });
  return () => {
    stopWatch?.();
    groups.stop();
    setCallHook(null);
    for (const h of [...held.values()]) letGo(h, null);
    opened.clear();
    rtcNow = null;
    space = theSpace;
    sessions.clear();
  };
}

/** Calls someone on XMPP from their chat, of the space's account or (`place`) the open hidden
 *  place's. Throws when not connected, or a call is going on. */
export async function startXmppCall(jid: string, video: boolean, rtc: Rtc, place = false): Promise<Call> {
  link(place);
  const calls = callsFor(place);
  const relay = await calls.callRelay();
  return startCall(calls, `${XMPP_PREFIX}${jid}`, video, relay, rtc);
}

/** For the checks: what is going on. */
export function xmppCallSessions(): number {
  return sessions.size;
}

export type { CallSignal };
