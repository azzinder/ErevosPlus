// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Client for the Erevos relay over WebSocket (ws:// or wss://). The relay holds
// one-way queues: a sender writes with its sender id, and the recipient reads
// with its recipient id. Each request is one binary message, and each reply is
// one binary message. The wire format is in crates/erevos-relay/src/server.rs.
// Self-contained on purpose, so it can run under plain Node for checks.
//
// Two-hop sending: when a relay is given a second relay (`via`), messages for it are sealed to
// its key and handed to the second relay, which passes them on. The first relay then never sees
// this phone's address, and the second never sees which queue a message is for.
//
// Files: the chunks of an encrypted file (lib/attachments.ts) go to the relay's file store, many
// requests on one connection (RelaySession). A contact on another relay takes them through its
// own relay (`via`), so the sender's relay never sees the contact's phone.
//
// Carried messages (lib/nearby.ts): a message sealed for a contact's relay, which a phone nearby
// hands to that relay once it reaches the internet, through its own relay (carryTo).
//
// Sent for later (sendMessageLater): a message sealed now is handed to the relay that would take it
// now, with the time it should go, and that relay sends it on then, so it goes though this phone is
// off by then. Until then this phone may take it back (dropLater).
//
// Lent places (crates/erevos-relay/src/lend.rs): a relay lends places to phones that have no relay
// of their own. Its phones put a ticket for one in their contact link (lendTicket); a phone with no
// relay that adds them takes a place with it (borrowPlace): a queue, and a lent token, which goes
// where the relay's token goes from then on. With a lent token the relay connects nowhere for this
// phone, so sends to contacts on other relays go straight to their /sealed path, and their files
// come straight from their /files path; it holds nothing for later and gives no call relay.
//
// Invites (crates/erevos-relay/src/invites.rs): a phone with a token of its own on a relay that
// invites makes an invite for one more phone (makeInvite), shown as a QR code (lib/relay-invite.ts).
// The phone that takes it makes a token for itself and gives the relay only its SHA-256 with the
// invite, on the /join path, which needs no token (redeemInvite): the relay adds a line for it to
// its file of tokens, and the token goes where the relay's token goes from then on. The inviter
// sees its invites (listInvites) and takes back one (takeBackInvite), which for one already used
// cuts that phone off. A phone that came with the relay's one token trades it, once, for a line of
// its own the same way (takeOwnLine), so it can invite too, and the relay's operator can take it
// out alone and change the relay's token without cutting it off.
//
// Signing in (crates/erevos-relay/src/signin.rs): a relay may let phones sign in with a provider,
// such as LPHL, for a token of their own (signInOffer). The browser signs in on the relay's pages,
// which then show a code; the phone claims the token on the /join path with the claim secret it
// made before and the code typed from the page (claimSignIn, lib/relay-signin.ts), giving the relay
// only the new token's SHA-256. The relay drops the sign-in after 5 wrong codes.
//
// Open places (crates/erevos-relay/src/open.rs): a relay may give a place to any phone that asks,
// with no invite and no sign-in, so a new phone has a relay from its first start (takeOpenPlace).
// The phone makes a token for itself and gives the relay only its SHA-256, on the /join path, as
// for an invite; the relay adds a line named `open-` and 8 hex characters for it. The relay gives
// only so many in all, a day, and a day to phones from one address, and each place may do only so
// much a day: make queues, move file bytes, take credentials for the call relay. An open place
// invites no one, lends no places and has no coupons signed, and its line goes when its token is
// not used for some time (60 days, or 7 after the day it was made when it never came back, unless
// whoever runs the relay sets otherwise; LPHL's server 100 and 30).
//
// Marks: a send may say what it carries (Mark), for a web app's notice while it is closed
// (lib/web-push.web.ts): a message someone reads, which the relay counts in the push, word between
// phones, which pushes nothing, or a call that rings, which pushes, counts as no message, and has
// the push say a call rang. The mark is one byte after the request; a relay from before
// marks reads no further than the request, and one that holds a message for later keeps the mark
// for when it goes. Without a mark the relay pushes, but says it could not count it, as for what
// another phone carried there (carryTo), which cannot know what it holds. A web app on
// the screen also says so when it takes its messages (receiveMessage): finding the queue empty
// then, the relay drops a push still waiting, which would tell of messages already read.
//
// Taken to keep (receiveMessage, receiveOnRead): the phone asks the relay to keep each message it
// hands over until the phone says it has it, which it says with its next take from that queue, once
// what took the message before has kept it, or at the end of a look (ackTaken). So a message whose
// reply was lost with the connection, through Tor or as the network changed, comes again rather
// than being lost; one kept and then handed over again, after a restart say, opens in no
// conversation the second time (a message key is never used twice, lib/e2e.ts) and shows once. A
// relay from before it reads no further than the mark, and hands over and deletes as before, which
// its reply says.
//
// Through Tor (setThroughTor, lib/tor.ts): the space's way says which requests go through the
// core's Tor (crates/erevos-tor) instead of the phone's own connection.
// - 'messages', the first way: all but those of files (RelaySession.open with `files`), while Tor
//   is ready (setTorReady). While it is not, starting or blocked, and for TOR_REST_MS after one
//   through it failed, they go straight, so messages never wait for Tor.
// - 'all': every request, files too, with no falling back to a direct connection: when Tor cannot
//   reach the relay, the request fails.
// - 'off': none.
//
// Channels to a relay's own key (crates/erevos-core/src/relay_channel.rs): a connection to a relay
// whose key this phone knows opens with a hello, which the relay must answer with the proof that it
// holds that key, and every message after it, each way, goes encrypted to it, the token in the
// first. So a relay is known by its own key, not by the TLS certificate shown for its name, which
// anyone who gets one for that name could show; and its certificate renewed changes nothing. The key
// comes from a contact's link (`Relay.key`), from what the relay said (relayKey), or from where a
// space keeps the keys its relays proved (lock/space-data.ts, pinRelay). A relay that has proved its
// key is never reached without a channel again: when it cannot prove it, the connection fails
// (RelayKeyError), and what was to go waits. One that has not proved it, a relay from before
// channels, is reached as before, and tried again after an hour.

import { chacha20poly1305 } from '@noble/ciphers/chacha.js';

import { canRelayChannel, canTor, canTorWays, coreReason, relayChannelKeys, relaySeal, sealPublic, tor, torOpenChannel, torOpenOn } from './core';
import { randomBytes, sha256Bytes } from './crypto';
import { t } from './i18n';
import { isSignInPage } from './relay-signin';

const CREATE = 1;
const SEND = 2;
const RECEIVE = 3;
const DELETE = 4;
const KEY = 5;
const FORWARD = 6;
const SEALED_SEND = 7;
const FILE_PUT = 8;
const FILE_GET = 9;
const FILE_DELETE = 10;
const FILE_VIA = 11;
const CALL_RELAY = 12;
const WAIT = 13;
const PUSH_KEY = 14;
const PUSH_SET = 15;
const LATER = 16;
const UNLATER = 17;
const FILE_KEEP = 18;
const LEND = 19;
const BORROW = 20;
const INVITE = 21;
const INVITES = 22;
const UNINVITE = 23;
const REDEEM = 24;
const SIGN_IN = 25;
const CLAIM = 26;
const NEWS = 27;
const OWN = 28;
const WAIT_ANY = 29;
const NEWS_ANY = 30;
const TIME = 31;
const XMPP_PUSH = 32;
const COUPON_KEY = 33;
const COUPON_SIGN = 34;
const COUPON_KEYS = 35;
const COUPON_REDEEM = 36;
const ACK = 37;
const PAIR = 38;
const OPEN = 39;

// The marks' bytes (crates/erevos-relay/src/server.rs).
const MARKS = { message: 1, quiet: 2, ring: 3 } as const;
const SHOWN = 1;
// After the mark of a RECEIVE: keep the message until it is acknowledged; and the flag of a reply
// that hands over one kept so, with its number.
const HOLD = 1;
const HELD = 2;

const OK = 0;
const NOT_FOUND = 1;
const FULL = 2;
const FAILED = 3;
const UNREACHABLE = 4;
// For a claim only: not the code the relay's page shows (crates/erevos-relay/src/server.rs).
const WRONG = 5;
// For a push address only: the push service said it is gone (crates/erevos-relay/src/push.rs). An
// older relay never says it.
const EXPIRED = 6;
// For an open place only (takeOpenPlace): the relay gave all the open places it gives a day, or all
// it gives a day to phones from this phone's address.
const DAY_FULL = 7;
const ADDRESS_FULL = 8;

// Same limit as the relay's MAX_MESSAGE.
const MAX_MESSAGE = 64 * 1024;
/** The largest chunk of a file the relay takes, as its MAX_CHUNK. */
export const MAX_CHUNK = 1024 * 1024;

// UTF-8 without TextEncoder, which not every JS runtime has.
function utf8Encode(text: string): Uint8Array {
  const binary = unescape(encodeURIComponent(text));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function utf8Decode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return decodeURIComponent(escape(binary));
}

export type QueueIds = { recipientId: Uint8Array; senderId: Uint8Array };

/** Where the relay is. `token` is sent as a bearer token when the relay requires one. With
 *  `via`, messages for this relay go through that relay first (two-hop sending). */
// `fallback`: where a send goes next when this relay cannot take it (lib/spare.ts), each with the
// sender id there, or the same one when it has none. `backup`: this phone's backup relay, which
// sends to contacts go through when its own relay cannot be reached.
/** A relay, its token, and how it is reached; `torOnly` only through Tor, never straight (lib/closed-notices.ts).
 *  `tor`: always through Tor, whatever the space's way, files too, never straight: a backup relay
 *  that is not to see this phone's address (lib/spare.ts). */
/** `torChat`: for a chat that goes only through Tor (setTorChats), the name of its own circuits there. */
export type Relay = { url: string; token?: string; via?: Relay; key?: Uint8Array; fallback?: Fallback[]; backup?: Relay; torOnly?: boolean; tor?: boolean; torChat?: string };
export type Fallback = { relay: Relay; senderId?: Uint8Array };

export class RelayError extends Error {
  /** The relay's status byte when it refused the request, such as NOT_FOUND. */
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/** The relay could not be reached, or the connection to it ended before it answered. */
export class RelayUnreachableError extends RelayError {}

/**
 * The relay ended the channel at its token, as it does for a token it does not take, such as a free
 * place's whose line it took out once its phone did not connect for long (crates/erevos-relay
 * open.rs). Everywhere else it reads as unreachable, as before. `sure` when the relay said so
 * itself, closing the WebSocket for policy (`unauthorized`); through Tor, which tells only that it
 * closed, or when the connection was lost then, it may also have been the way.
 */
export class RelayTokenError extends RelayUnreachableError {
  readonly sure: boolean;

  constructor(message: string, sure: boolean) {
    super(message);
    this.sure = sure;
  }
}

// Told each time a relay ended a channel at its token (RelayTokenError): lib/open-place.ts asks for
// a free place again with the same token.
const tokenListeners = new Set<(relay: Relay, sure: boolean) => void>();

/** Has `listener` called with the relay, as asked, each time one ended a channel at its token
 *  (RelayTokenError). Returns how to stop. */
export function onTokenRefused(listener: (relay: Relay, sure: boolean) => void): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

/** The address is not one a connection can be opened to; what waits for it goes once it is fixed. */
export class BadRelayAddressError extends RelayUnreachableError {
  constructor(url: string) {
    super(`"${url}" is not a relay address. One looks like wss://relay.example.org or ws://192.168.1.10:7879.`);
  }
}

// ws:// or wss://, then a host (a name of dot-separated labels, or an IPv6 address in brackets), a
// port maybe, and a path maybe.
const LABEL = '[A-Za-z0-9_](?:[A-Za-z0-9_-]{0,61}[A-Za-z0-9_])?';
const RELAY_ADDRESS = new RegExp(`^wss?://(?:${LABEL}(?:\\.${LABEL})*|\\[([0-9A-Fa-f:.]+)\\])(?::(\\d{1,5}))?(?:/\\S*)?$`);
const IPV4_PART = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

function isIpv6(text: string): boolean {
  const halves = text.split('::');
  if (halves.length > 2) return false;
  let groups = halves.flatMap((half) => (half === '' ? [] : half.split(':')));
  let count = groups.length;
  // The last group may be four numbers, which count as two groups.
  const last = groups[groups.length - 1];
  if (last?.includes('.')) {
    const parts = last.split('.');
    if (parts.length !== 4 || !parts.every((part) => IPV4_PART.test(part))) return false;
    groups = groups.slice(0, -1);
    count += 1;
  }
  if (!groups.every((group) => /^[0-9A-Fa-f]{1,4}$/.test(group))) return false;
  return halves.length === 2 ? count <= 7 : count === 8;
}

/**
 * Whether `url` is an address a relay connection can be opened to. Android's WebSocket stops the
 * whole app on an address it cannot read, such as the first letters of one being typed, so no other
 * is ever opened.
 */
export function isRelayAddress(url: string): boolean {
  const match = RELAY_ADDRESS.exec(url);
  if (!match) return false;
  const [, ipv6, port] = match;
  if (ipv6 !== undefined && !isIpv6(ipv6)) return false;
  return port === undefined || (Number(port) >= 1 && Number(port) <= 65535);
}

/**
 * Whether what failed may go later: the relay could not be reached, or said to try again later
 * (full, could not save it, could not reach the next relay, or a free place there used its day).
 */
export function canTryLater(error: unknown): boolean {
  if (error instanceof RelayUnreachableError) return true;
  return error instanceof RelayError && (error.status === FULL || error.status === FAILED || error.status === UNREACHABLE || error.status === DAY_FULL);
}

/** Whether the relay said a free place there (an open place) used all it may today: new chats,
 *  files, calls through it or sends to other servers, each its own share. It goes on tomorrow. */
export function isDayFull(error: unknown): boolean {
  return error instanceof RelayError && error.status === DAY_FULL;
}

/** Whether the relay said the queue is full: as many wait there as it keeps for one, unread. */
export function isQueueFull(error: unknown): boolean {
  return error instanceof RelayError && error.status === FULL;
}

/** Whether the relay said the queue does not exist: it was deleted, or the relay lost it. */
export function isQueueNotFound(error: unknown): boolean {
  return error instanceof RelayError && error.status === NOT_FOUND;
}

/** Whether the relay said the push address given is gone, as its push service told it (setPush). */
export function isPushExpired(error: unknown): boolean {
  return error instanceof RelayError && error.status === EXPIRED;
}

/** Lowercase hex for an id or any other bytes. */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Parses a 48-character hex id. Throws if the text is not one. */
export function fromHex(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase();
  if (!/^[0-9a-f]{48}$/.test(clean)) throw new RelayError(t('An id is 48 hex characters.'));
  const bytes = new Uint8Array(24);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

/** What the app sends through a queue: the sender's own relay sender id (so the
 *  recipient can answer) and the text. Empty `from` means the sender has no queue. */
export type Envelope = { from: string; text: string };

export function encodeEnvelope(from: string, text: string): Uint8Array {
  return utf8Encode(JSON.stringify({ from, text }));
}

export function decodeEnvelope(bytes: Uint8Array): Envelope | null {
  try {
    const value = JSON.parse(utf8Decode(bytes));
    return typeof value?.from === 'string' && typeof value?.text === 'string' ? value : null;
  } catch {
    return null;
  }
}

// React Native's WebSocket takes a third argument with request headers. The DOM typings do not.
type HeaderSocket = new (url: string, protocols: undefined, options: { headers: Record<string, string> }) => WebSocket;

const IN_REACT_NATIVE = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

/** A browser cannot set headers on a WebSocket, so there the token goes as a subprotocol, in
 * hex, next to the plain "erevos" one the relay answers with (crates/erevos-relay, serve_ws). */
export function tokenProtocols(token: string): string[] {
  const hex = Array.from(new TextEncoder().encode(token), (b) => b.toString(16).padStart(2, '0')).join('');
  return ['erevos', `erevos-token.${hex}`];
}

function connect(relay: Relay): WebSocket {
  const socket = !relay.token
    ? new WebSocket(relay.url)
    : IN_REACT_NATIVE
      ? new (WebSocket as unknown as HeaderSocket)(relay.url, undefined, {
          headers: { Authorization: `Bearer ${relay.token}` },
        })
      : new WebSocket(relay.url, tokenProtocols(relay.token));
  socket.binaryType = 'arraybuffer';
  return socket;
}

/** Which of a space's relay requests go through Tor: those of messages, all, or none. */
export type TorWay = 'messages' | 'all' | 'off';

/** How long requests of messages go straight after one through Tor failed, the way 'messages'. */
export const TOR_REST_MS = 60_000;

let torWay: TorWay = 'off';
let torReady = false;
let torRestUntil = 0;

const torWayListeners = new Set<() => void>();

/** Sends the relay requests the way says through Tor from now on. */
export function setThroughTor(way: TorWay): void {
  const was = torWay;
  torWay = way;
  torRestUntil = 0;
  if (way !== was) torWayListeners.forEach((listener) => listener());
}

/** Calls `listener` each time the way changes, as the connections it chose may now go the wrong way. Returns how to stop. */
export function onTorWay(listener: () => void): () => void {
  torWayListeners.add(listener);
  return () => {
    torWayListeners.delete(listener);
  };
}

const torReadyListeners = new Set<() => void>();

/** Whether Tor is ready, as lib/tor.ts last found: until it is, the way 'messages' goes straight. */
export function setTorReady(ready: boolean): void {
  const was = torReady;
  torReady = ready;
  if (ready && !was) torReadyListeners.forEach((listener) => listener());
}

/** Calls `listener` each time Tor becomes ready. Returns how to stop. */
export function onTorReady(listener: () => void): () => void {
  torReadyListeners.add(listener);
  return () => {
    torReadyListeners.delete(listener);
  };
}

/**
 * Waits up to `ms` for Tor to be ready while the space sends anything through it, as a backup to a
 * server does (lib/backup-cloud.ts): just after a space opens, Tor is still starting.
 */
export function waitForTor(ms: number): Promise<void> {
  if (torWay === 'off' || torReady) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      stop();
      clearTimeout(timer);
      resolve();
    };
    const stop = onTorReady(done);
    const timer = setTimeout(done, ms);
  });
}

/** Whether every relay request goes through Tor, files too (the way 'all'). */
export function throughTor(): boolean {
  return torWay === 'all';
}

/** Whether nothing of the space goes through Tor (the way 'off', the default of a new space). */
export function torOff(): boolean {
  return torWay === 'off';
}

/** Whether a request goes through Tor now; `files` for one of files. */
export function torFor(files: boolean, now = Date.now()): boolean {
  if (torWay === 'all') return true;
  return torWay === 'messages' && !files && torReady && now >= torRestUntil;
}

// The circuits a request to `relay` goes on: for one reached only through Tor (Relay.tor), circuits
// of its own host alone, so that its requests never share a circuit, and so an exit, with those of
// the space's relay or of another home relay; `way` within them, when given.
function torWayOf(relay: Relay, way?: string): string | undefined {
  if (relay.torChat && relay.tor !== true) return `chat ${relay.torChat}${way ? ` ${way}` : ''}`;
  if (relay.tor !== true) return way;
  const host = relay.url.replace(/^wss?:\/\//i, '').split('/')[0].toLowerCase();
  return `home ${host}${way ? ` ${way}` : ''}`;
}

// Whether a request to `relay` goes through Tor now: always for one reached only through Tor
// (Relay.tor) and for a chat set to go through Tor (Relay.torChat), else as the space's way says.
function torTo(relay: Relay, files: boolean): boolean {
  return relay.tor === true || !!relay.torChat || torFor(files);
}

// Chats set to go only through Tor, each by itself (lock/e2e-data.ts Contact.tor), whatever the
// space's way: what is sent to them, by the sender ids of their queues, and what is read from
// them, their queues' recipient ids (lib/contact-queues.ts bunches). Each on circuits of its own,
// so the relay sees neither this phone's address nor one exit for two such chats. Never straight:
// with Tor not ready, what goes to them waits and is tried again, as for a relay reached only
// through Tor. Starting Tor is lib/tor.ts's, told here (setTorStarter), as it imports this.
let torChatSenders = new Map<string, string>();
let torChatReaders = new Set<string>();
let torStarter: (() => Promise<void>) | null = null;

/** The chats that go only through Tor now: their queues' sender ids (hex) with each one's circuit name, and the recipient ids (hex) of the queues they write to. */
export function setTorChats(senders: ReadonlyMap<string, string>, readers: ReadonlySet<string>): void {
  torChatSenders = new Map(senders);
  torChatReaders = new Set(readers);
  if (senders.size > 0 || readers.size > 0) void torStarter?.().catch(() => undefined);
}

/** Whether what comes into the queue `recipient` (hex) is read only through Tor. */
export const readsThroughTor = (recipient: string): boolean => torChatReaders.has(recipient.toLowerCase());

/** How Tor is started for a chat that goes through it (lib/tor.ts ensureTor). */
export function setTorStarter(start: () => Promise<void>): void {
  torStarter = start;
}

/** Starts Tor for a chat that goes only through it, whatever the space's way; throws when this build has none. */
export async function torForChat(): Promise<void> {
  if (!canTor()) throw new RelayUnreachableError(t('This chat goes only through Tor, which this build of Erevos does not have.'));
  await torStarter?.();
}

// `relay` for a send with `senderId`: on its chat's own circuits through Tor when that chat goes only through Tor.
function forSender(relay: Relay, senderId: Uint8Array): Relay {
  const circuit = torChatSenders.get(toHex(senderId));
  return circuit ? { ...relay, torChat: circuit } : relay;
}

// The core's Tor says what failed in its own words: a RelayError, as a direct connection's failure is.
// The way 'messages' then goes straight for a while rather than wait for Tor, unless `rest` is false:
// for a channel being opened, which a relay from before them ends, and which is tried again without one.
async function viaTor<T>(call: () => Promise<T>, rest = true): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (rest && torWay === 'messages') torRestUntil = Date.now() + TOR_REST_MS;
    // Tor's own words for a relay that took too long, said as a direct connection's are.
    const reason = coreReason(error);
    throw new RelayUnreachableError(t('Through Tor: {reason}', { reason: /timed? ?out/i.test(reason) ? t('the server did not answer in time') : reason }));
  }
}

// A request ended from this side (`signal`) before its reply came.
class Ended extends Error {}

// How long a request may go without its reply, milliseconds: a connection that died on the way, as
// one does when the phone's network sleeps or changes, says nothing, and the look waiting on it would
// wait for ever. A wait at the relay (WAIT, NEWS) lasts its seconds, and a file's chunk takes longer.
const ANSWER_MS = 45_000;
const FILE_ANSWER_MS = 120_000;
const WAIT_MORE_MS = 30_000;

let answerScale = 1;

/** For checks: replies are waited for `scale` times as long; null for the usual times. */
export function setAnswerScale(scale: number | null): void {
  answerScale = scale ?? 1;
}

/** How long the request `bytes` may go without its reply before it counts as failed, milliseconds. */
export function answerWithin(bytes: Uint8Array): number {
  const op = bytes[0];
  // A wait's seconds: after the queue for WAIT and NEWS, last for WAIT_ANY and NEWS_ANY.
  const waits = (op === WAIT || op === NEWS) && bytes.length > 25 ? bytes[25] : (op === WAIT_ANY || op === NEWS_ANY) && bytes.length > 2 ? bytes[bytes.length - 1] : null;
  const ms = waits !== null ? waits * 1000 + WAIT_MORE_MS : op === FILE_PUT || op === FILE_GET || op === FILE_VIA || op === FILE_KEEP ? FILE_ANSWER_MS : ANSWER_MS;
  return ms * answerScale;
}

/** Thrown when the relay did not answer in time: the connection died on the way, or the relay is stuck. */
const lateError = () => new RelayUnreachableError(t('the server did not answer in time'));

// A stopped space (lib/forget-me.ts, "Delete me from everywhere"): its queues were deleted on the
// relays, and nothing may make them again, read them or send from them, or the delete is undone in
// seconds (lib/queue-move.ts makes anew a queue the relay lost). While the open space is stopped,
// every request fails as one to a relay that cannot be reached, so what tries again waits and
// makes nothing, but for those that delete: a queue, a message held for later, a file, an invite
// not used yet. A session of requests opens only while the space's servers are being cleared.

/** What a stopped space asks of a relay: nothing, as a relay that cannot be reached. */
export class SpaceStoppedError extends RelayUnreachableError {
  constructor() {
    super(t('This space is stopped: it reaches no server until you start it again.'));
  }
}

let stopped = false;
let clearing = 0;

/** The open space is stopped (`on`), or not: as it opens, and as it closes (false). */
export function setRelayStopped(on: boolean): void {
  stopped = on;
}

/** Whether the open space is stopped. */
export function relayStopped(): boolean {
  return stopped;
}

/** Runs `call` while what a stopped space keeps on the servers is deleted: sessions may open then. */
export async function whileClearing<T>(call: () => Promise<T>): Promise<T> {
  clearing += 1;
  try {
    return await call();
  } finally {
    clearing -= 1;
  }
}

// What a stopped space may still ask: requests that delete. A file's through another relay only to delete it.
function deletes(bytes: Uint8Array): boolean {
  const op = bytes[0];
  if (op === DELETE || op === UNLATER || op === FILE_DELETE || op === INVITES || op === UNINVITE) return true;
  if (op !== FILE_VIA || bytes.length < 3) return false;
  const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(1);
  return bytes[3 + length] === FILE_DELETE;
}

function refuseStopped(bytes: Uint8Array | null): void {
  if (stopped && !(bytes && deletes(bytes))) throw new SpaceStoppedError();
}

/** The relay at `url` could not prove the key this phone keeps for it: someone may be in between, or the relay has a new key. */
export class RelayKeyError extends RelayUnreachableError {
  constructor(url: string) {
    super(t('the server at {url} did not prove its key: someone may be in between, or the server has a new key', { url }));
  }
}

// The first byte of a channel's hello, and the subprotocols its connection offers
// (crates/erevos-relay/src/server.rs, CHANNEL_PROTOCOL).
const HELLO = 0xec;
const CHANNEL_PROTOCOLS = ['erevos', 'erevos-channel'];
// How long a relay that showed no channel is reached without trying one again.
const NO_CHANNEL_MS = 60 * 60_000;

/** A relay's key as this phone keeps it: `proven` once the relay proved it in a channel. */
type Pin = { key: Uint8Array; proven: boolean };

// The keys of relays by their home address (relayHome); until when a relay that showed no channel
// is reached without trying one; and the relays that did not prove the key kept for them.
const pins = new Map<string, Pin>();
const noChannel = new Map<string, number>();
const unproven = new Set<string>();

type KeyListener = (home: string, key: Uint8Array | null) => void;
const keyListeners = new Set<KeyListener>();
const checkListeners = new Set<() => void>();

// What relayCheck says of a relay changed.
function checkChanged(): void {
  for (const listener of checkListeners) listener();
}

const sameBytes = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, i) => byte === b[i]);

/** The address a relay's key is kept by: its own, without one of its paths (relayPath), in any case. */
export function relayHome(url: string): string {
  return url.trim().replace(/\/+$/, '').replace(/\/(?:sealed|files|join|read)$/i, '').toLowerCase();
}

/**
 * Takes `key` as the relay at `url`'s own, for channels to it; `proven` when it proved it before
 * (lock/space-data.ts keeps those), so it is never reached without one. A key proven stays: another
 * one, unproven, does not take its place, and only forgetRelayKey takes it away.
 */
export function pinRelay(url: string, key: Uint8Array, proven = false): void {
  if (key.length !== 32) return;
  const home = relayHome(url);
  const pin = pins.get(home);
  if (pin && sameBytes(pin.key, key)) {
    pin.proven ||= proven;
    return;
  }
  if (pin?.proven && !proven) return;
  pins.set(home, { key: key.slice(), proven });
}

/** Forgets the key kept for the relay at `url`, also where a space keeps it: for when its operator gave it a new one. */
export function forgetRelayKey(url: string): void {
  const home = relayHome(url);
  pins.delete(home);
  for (const at of keys.keys()) if (relayHome(at) === home) keys.delete(at);
  unproven.delete(home);
  noChannel.delete(home);
  for (const listener of keyListeners) listener(home, null);
  checkChanged();
}

/** Hears each relay's key as it is proven for the first time (by its home address), and null when one is forgotten. */
export function onRelayKey(listener: KeyListener): () => void {
  keyListeners.add(listener);
  return () => keyListeners.delete(listener);
}

/** What this phone knows of a relay's key: 'proven' in a channel, 'refused' when the relay could not prove it, 'none' for a relay with no channel, 'unknown' before one was tried. */
export type RelayCheck = 'proven' | 'refused' | 'none' | 'unknown';

/** Hears each change of what relayCheck says of a relay. */
export function onRelayCheck(listener: () => void): () => void {
  checkListeners.add(listener);
  return () => checkListeners.delete(listener);
}

/** The key the relay at `url` proved in a channel, or null: for a helper that waits there for the app, which then goes to it only in a channel (lib/shell-watch.ts). */
export function provenRelayKey(url: string): Uint8Array | null {
  const pin = pins.get(relayHome(url));
  return pin?.proven ? pin.key.slice() : null;
}

export function relayCheck(url: string): RelayCheck {
  const home = relayHome(url);
  if (unproven.has(home)) return 'refused';
  if (pins.get(home)?.proven) return 'proven';
  return (noChannel.get(home) ?? 0) > Date.now() ? 'none' : 'unknown';
}

/** For checks: forgets every relay's key and what each showed. */
export function forgetRelayKeys(): void {
  pins.clear();
  noChannel.clear();
  unproven.clear();
  keys.clear();
}

// The key a connection to `relay` goes in a channel to now, or null: when the core cannot make one,
// no key is known, or the relay showed no channel within the hour.
function channelPin(relay: Relay): Pin | null {
  if (!canRelayChannel()) return null;
  if (relay.key) pinRelay(relay.url, relay.key);
  const home = relayHome(relay.url);
  const pin = pins.get(home);
  if (!pin) return null;
  if (!pin.proven && (noChannel.get(home) ?? 0) > Date.now()) return null;
  return pin;
}

// After a channel could not open: whether to go without one. Never once the relay proved its key, or
// when it did not prove it now; otherwise it may be a relay from before channels.
function mayGoWithout(error: unknown, pin: Pin): boolean {
  return error instanceof RelayUnreachableError && !(error instanceof RelayKeyError) && !pin.proven;
}

function noChannelAt(url: string): void {
  noChannel.set(relayHome(url), Date.now() + NO_CHANNEL_MS);
  checkChanged();
}

function refusedAt(url: string): void {
  unproven.add(relayHome(url));
  checkChanged();
}

function provenAt(url: string, pin: Pin): void {
  const home = relayHome(url);
  const was = unproven.delete(home) || noChannel.delete(home);
  if (pin.proven) {
    if (was) checkChanged();
    return;
  }
  pin.proven = true;
  for (const listener of keyListeners) listener(home, pin.key);
  checkChanged();
}

// A message's nonce in a channel: the count of the messages before it that way, little-endian.
function countNonce(count: number): Uint8Array {
  const nonce = new Uint8Array(12);
  for (let i = 0, left = count; i < 8 && left > 0; i++, left = Math.floor(left / 256)) nonce[i] = left % 256;
  return nonce;
}

/** Both ways of a channel to a relay's key, each counting its messages. */
class Channel {
  private readonly toRelay: Uint8Array;
  private readonly toPhone: Uint8Array;
  private sent = 0;
  private received = 0;

  constructor(toRelay: Uint8Array, toPhone: Uint8Array) {
    this.toRelay = toRelay;
    this.toPhone = toPhone;
  }

  seal(plain: Uint8Array): Uint8Array {
    return chacha20poly1305(this.toRelay, countNonce(this.sent++)).encrypt(plain);
  }

  open(sealed: Uint8Array): Uint8Array {
    try {
      return chacha20poly1305(this.toPhone, countNonce(this.received++)).decrypt(sealed);
    } catch {
      throw new RelayUnreachableError(t('the server sent what its channel does not hold'));
    }
  }
}

/** A connection's messages, each answered before the next goes: straight, or through Tor. `rest`
 *  false while a channel opens: a failure through Tor then sends no request straight (viaTor). */
interface Line {
  call(bytes: Uint8Array, within: number, rest?: boolean): Promise<Uint8Array>;
  close(): void;
}

/** A WebSocket's messages. */
class SocketLine implements Line {
  private readonly socket: WebSocket;
  private waiting: ((reply: Uint8Array | RelayError) => void) | null = null;
  private ended: RelayError | null = null;

  private constructor(socket: WebSocket) {
    this.socket = socket;
    const answer = (reply: Uint8Array | RelayError) => {
      const waiting = this.waiting;
      this.waiting = null;
      waiting?.(reply);
    };
    socket.onmessage = (event) => answer(new Uint8Array(event.data as ArrayBuffer));
    socket.onerror = () => {
      this.ended ??= new RelayUnreachableError(t('lost the connection to the server'));
      answer(this.ended);
    };
    socket.onclose = (event) => {
      // Closed for policy, `unauthorized`: the relay did not take the token (RelayTokenError).
      const refused = event?.code === 1008 && event?.reason === 'unauthorized';
      this.ended ??= refused ? new RelayTokenError(t('the server closed the connection'), true) : new RelayUnreachableError(t('the server closed the connection'));
      answer(this.ended);
    };
  }

  /** Opens it, for a channel (`channel`, no token in the handshake) or not; fails after `within` milliseconds. */
  static open(relay: Relay, channel: boolean, within: number): Promise<SocketLine> {
    return new Promise((resolve, reject) => {
      const socket = channel ? new WebSocket(relay.url, CHANNEL_PROTOCOLS) : connect(relay);
      socket.binaryType = 'arraybuffer';
      const late = setTimeout(() => {
        socket.close();
        reject(lateError());
      }, within);
      socket.onopen = () => {
        clearTimeout(late);
        resolve(new SocketLine(socket));
      };
      socket.onerror = () => {
        clearTimeout(late);
        reject(new RelayUnreachableError(t('cannot reach the server at {url}, or the token is wrong', { url: relay.url })));
      };
      socket.onclose = () => {
        clearTimeout(late);
        reject(new RelayUnreachableError(t('the server closed the connection')));
      };
    });
  }

  call(bytes: Uint8Array, within: number): Promise<Uint8Array> {
    if (this.ended) return Promise.reject(this.ended);
    return new Promise((resolve, reject) => {
      // No reply in time: the connection is given up, as one that closed.
      const timer = setTimeout(() => {
        this.waiting = null;
        this.ended ??= lateError();
        this.socket.close();
        reject(this.ended);
      }, within);
      this.waiting = (answer) => {
        clearTimeout(timer);
        if (answer instanceof RelayError) reject(answer);
        else resolve(answer);
      };
      this.socket.send(bytes);
    });
  }

  close(): void {
    this.ended ??= new RelayError('closed');
    this.socket.close();
  }
}

/** A connection's messages through the core's Tor, which is slower: each may take twice as long. */
class TorLine implements Line {
  private readonly id: Uint8Array;
  // To a relay reached only through Tor (Relay.tor): its failures say nothing of the space's way.
  private readonly own: boolean;
  private ended: RelayError | null = null;

  private constructor(id: Uint8Array, own: boolean) {
    this.id = id;
    this.own = own;
  }

  /** On the circuits named `way`, when given and this build can (canTorWays). */
  static async open(relay: Relay, channel: boolean, given?: string): Promise<TorLine> {
    const way = torWayOf(relay, given);
    const token = channel ? '' : (relay.token ?? '');
    const open = () =>
      way && canTorWays() ? torOpenOn(relay.url, token, way, channel) : channel ? torOpenChannel(relay.url) : tor().torOpen(relay.url, token);
    // A relay reached only through Tor, or a chat that goes only through it, says nothing of how the space's other requests go.
    const own = relay.tor === true || !!relay.torChat;
    return new TorLine(await viaTor(open, !channel && !own), own);
  }

  call(bytes: Uint8Array, within: number, rest = true): Promise<Uint8Array> {
    if (this.ended) return Promise.reject(this.ended);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (rest && !this.own && torWay === 'messages') torRestUntil = Date.now() + TOR_REST_MS;
        this.ended ??= lateError();
        this.close();
        reject(this.ended);
      }, 2 * within);
      viaTor(() => tor().torCall(this.id, bytes), rest && !this.own)
        .catch((error: RelayError) => {
          this.ended ??= error;
          throw error;
        })
        .then(resolve, reject)
        .finally(() => clearTimeout(timer));
    });
  }

  close(): void {
    this.ended ??= new RelayError('closed');
    tor()
      .torClose(this.id)
      .catch(() => undefined);
  }
}

/** A plain line to `relay`: through Tor when `throughTor`, else straight. */
function plainLine(relay: Relay, throughTor: boolean): Promise<Line> {
  return throughTor ? TorLine.open(relay, false) : SocketLine.open(relay, false, ANSWER_MS * answerScale);
}

// The token at the start of a channel's first message: a 2-byte length, then the token; the request after it.
function tokenFrame(token: string, request: Uint8Array): Uint8Array {
  const bytes = utf8Encode(token);
  const out = new Uint8Array(2 + bytes.length + request.length);
  out[0] = bytes.length >> 8;
  out[1] = bytes.length & 0xff;
  out.set(bytes, 2);
  out.set(request, 2 + bytes.length);
  return out;
}

/**
 * Opens a channel to `relay` with the key `pin`: through Tor when `throughTor`, the hello, then the
 * token with `first`, if any, in the first message. Returns the line, the channel and the reply to
 * that message (OK without `first`). `signal` ends it.
 */
async function openChannel(
  relay: Relay,
  pin: Pin,
  throughTor: boolean,
  first: Uint8Array | null,
  signal?: AbortSignal,
  way?: string,
): Promise<{ line: Line; channel: Channel; reply: Uint8Array }> {
  const within = ANSWER_MS * answerScale;
  const line = throughTor ? await TorLine.open(relay, true, way) : await SocketLine.open(relay, true, within);
  const end = () => line.close();
  signal?.addEventListener('abort', end);
  try {
    if (signal?.aborted) throw new Ended();
    const secret = randomBytes(32);
    const hello = new Uint8Array(33);
    hello[0] = HELLO;
    hello.set(await sealPublic(secret), 1);
    const answer = await line.call(hello, within, false);
    // Something else than an answer to a hello: no channel there, as from a relay from before them.
    if (answer.length !== 64) throw new RelayUnreachableError(t('the server has no channel'));
    let keys: Uint8Array;
    try {
      keys = await relayChannelKeys(pin.key, secret, answer);
    } catch {
      refusedAt(relay.url);
      throw new RelayKeyError(relay.url);
    } finally {
      secret.fill(0);
    }
    provenAt(relay.url, pin);
    const channel = new Channel(keys.slice(0, 32), keys.slice(32, 64));
    keys.fill(0);
    let sealed: Uint8Array;
    try {
      sealed = await line.call(channel.seal(tokenFrame(relay.token ?? '', first ?? new Uint8Array())), first ? answerWithin(first) : within, false);
    } catch (error) {
      // The relay ends the connection on a wrong token, as it refuses it in the handshake without a channel.
      if (error instanceof RelayError && !(error instanceof RelayUnreachableError && /did not answer/.test(error.message))) {
        const refused = new RelayTokenError(t('cannot reach the server at {url}, or the token is wrong', { url: relay.url }), error instanceof RelayTokenError && error.sure);
        for (const listener of tokenListeners) {
          try {
            listener(relay, refused.sure);
          } catch {
            // A listener's own trouble changes nothing here.
          }
        }
        throw refused;
      }
      throw error;
    }
    return { line, channel, reply: channel.open(sealed) };
  } catch (error) {
    line.close();
    if (signal?.aborted) throw new Ended();
    throw error;
  } finally {
    signal?.removeEventListener('abort', end);
  }
}

/**
 * Opens a connection, sends one request, and returns the reply. Closes the connection, also when
 * `signal` ends it. In a channel when the relay's key is known (see Channels above). Through Tor on
 * the circuits named `way`, when given. With the way 'messages' a message never waits for Tor: one
 * Tor could not take to the relay goes straight at once, as those after it do for a while
 * (TOR_REST_MS). Never one a relay refused, nor to a relay that did not prove its key.
 */
async function request(relay: Relay, bytes: Uint8Array, signal?: AbortSignal, way?: string): Promise<Uint8Array> {
  try {
    const reply = await requestTried(relay, bytes, signal, way);
    heardFrom(relay.url, true);
    return reply;
  } catch (error) {
    if (error instanceof RelayUnreachableError && !signal?.aborted) heardFrom(relay.url, false);
    throw error;
  }
}

async function requestTried(relay: Relay, bytes: Uint8Array, signal?: AbortSignal, way?: string): Promise<Uint8Array> {
  const tor = torFor(false);
  try {
    return await requestOnce(relay, bytes, signal, way);
  } catch (error) {
    if (!tor || torWay !== 'messages' || relay.torOnly || relay.tor || relay.torChat || signal?.aborted || !(error instanceof RelayUnreachableError) || error instanceof RelayKeyError) throw error;
    torRestUntil = Math.max(torRestUntil, Date.now() + TOR_REST_MS);
    return requestOnce(relay, bytes, signal, way);
  }
}

// When each relay last answered a request of this app, and when one last could not reach it, by
// its address without a path (relayHome), for the Ways screen (app/ways.tsx): in memory only, for this run.
export type RelayHeard = { answered: number; failed: number };
const heardAt = new Map<string, RelayHeard>();
const heardListeners = new Set<() => void>();

function heardFrom(url: string, answered: boolean): void {
  const home = relayHome(url);
  const before = heardAt.get(home) ?? { answered: 0, failed: 0 };
  heardAt.set(home, answered ? { ...before, answered: Date.now() } : { ...before, failed: Date.now() });
  heardListeners.forEach((listener) => listener());
}

/** When the relay at `url` last answered, and when it last could not be reached, this run: 0 for never. */
export function relayHeard(url: string): RelayHeard {
  return heardAt.get(relayHome(url)) ?? { answered: 0, failed: 0 };
}

/** Has `listener` called each time a relay answered or could not be reached. Returns how to stop. */
export function onRelayHeard(listener: () => void): () => void {
  heardListeners.add(listener);
  return () => heardListeners.delete(listener);
}

async function requestOnce(relay: Relay, bytes: Uint8Array, signal?: AbortSignal, way?: string): Promise<Uint8Array> {
  if (signal?.aborted) throw new Ended();
  refuseStopped(bytes);
  if (!isRelayAddress(relay.url)) throw new BadRelayAddressError(relay.url);
  // A space that goes through Tor, waited on while another is open: never straight.
  if (relay.torOnly && !torFor(false)) throw new RelayUnreachableError(t('Tor is not ready.'));
  if (relay.tor && !canTor()) throw new RelayUnreachableError(t('This server is reached only through Tor, which this build of Erevos does not have.'));
  if (relay.torChat && !canTor()) throw new RelayUnreachableError(t('This chat goes only through Tor, which this build of Erevos does not have.'));
  if (relay.torChat) await torStarter?.();
  const pin = channelPin(relay);
  if (!pin) return plainRequest(relay, bytes, signal, way);
  try {
    const { line, reply } = await openChannel(relay, pin, torTo(relay, false), bytes, signal, way);
    line.close();
    return reply;
  } catch (error) {
    if (!mayGoWithout(error, pin)) throw error;
    // No channel there: a relay from before them, or none could be reached.
    const reply = await plainRequest(relay, bytes, signal, way);
    noChannelAt(relay.url);
    return reply;
  }
}

/** One request on a connection of its own, with no channel; through Tor on the circuits named `way`, when given. */
function plainRequest(relay: Relay, bytes: Uint8Array, signal?: AbortSignal, way?: string): Promise<Uint8Array> {
  if (signal?.aborted) return Promise.reject(new Ended());
  // Tor may have gone to rest while a channel was tried through it: a Tor-only relay still never goes straight.
  if (relay.torOnly && !torFor(false)) return Promise.reject(new RelayUnreachableError(t('Tor is not ready.')));
  const within = answerWithin(bytes);
  if (torTo(relay, false)) {
    // TorLine.open names the circuits as torWayOf says.
    const reply =
      torWayOf(relay, way) && canTorWays()
        ? TorLine.open(relay, false, way).then((line) =>
            line.call(bytes, within).finally(() => line.close()),
          )
        : viaTor(() => tor().torRequest(relay.url, relay.token ?? '', bytes), !relay.tor && !relay.torChat);
    // Tor's request runs on until it ends; its reply is not waited for once the request ended
    // here, or took too long (twice as long as straight, as Tor is slower).
    return new Promise((resolve, reject) => {
      const end = () => reject(new Ended());
      const late = setTimeout(() => {
        // A relay reached only through Tor says nothing of how the space's other requests go.
        if (torWay === 'messages' && !relay.tor && !relay.torChat) torRestUntil = Date.now() + TOR_REST_MS;
        reject(lateError());
      }, 2 * within);
      signal?.addEventListener('abort', end);
      reply.then(resolve, reject).finally(() => {
        clearTimeout(late);
        signal?.removeEventListener('abort', end);
      });
    });
  }
  return new Promise((resolve, reject) => {
    const socket = connect(relay);
    const end = () => {
      settled();
      socket.close();
      reject(new Ended());
    };
    // No reply in time: the connection is given up, as one that closed.
    const late = setTimeout(() => {
      settled();
      socket.close();
      reject(lateError());
    }, within);
    signal?.addEventListener('abort', end);
    const settled = () => {
      clearTimeout(late);
      signal?.removeEventListener('abort', end);
    };
    socket.onopen = () => socket.send(bytes);
    socket.onmessage = (event) => {
      settled();
      socket.close();
      resolve(new Uint8Array(event.data as ArrayBuffer));
    };
    socket.onerror = () => {
      settled();
      reject(new RelayUnreachableError(t('cannot reach the server at {url}, or the token is wrong', { url: relay.url })));
    };
    socket.onclose = () => {
      settled();
      reject(new RelayUnreachableError(t('the server closed the connection')));
    };
  });
}

/** What a request on a queue the relay no longer has throws (isQueueNotFound). */
export function queueNotFound(what: string): RelayError {
  return new RelayError(t('{what}: queue not found', { what }), NOT_FOUND);
}

function check(reply: Uint8Array, what: string): void {
  if (reply[0] === OK) return;
  if (reply[0] === NOT_FOUND) throw queueNotFound(what);
  if (reply[0] === FULL) throw new RelayError(t('{what}: queue is full', { what }), FULL);
  // A free place on the server (an open place) has a day's share of new chats, calls and sends to
  // other servers: past it, it goes on the next day.
  if (reply[0] === DAY_FULL) throw new RelayError(t('{what}: your free place on this server has used all it may today. It goes on tomorrow.', { what }), DAY_FULL);
  if (reply[0] === FAILED) throw new RelayError(t('{what}: the server could not save it, try again later', { what }), FAILED);
  if (reply[0] === UNREACHABLE)
    throw new RelayError(t('{what}: the second server could not reach your server, try again later', { what }), UNREACHABLE);
  throw new RelayError(`${what}: unexpected reply ${reply[0]}`, reply[0]);
}

/** Creates a queue. Keep the recipient id private; hand the sender id to whoever writes to you. */
export async function createQueue(relay: Relay): Promise<QueueIds> {
  const reply = await request(relay, Uint8Array.of(CREATE));
  check(reply, 'create');
  return { recipientId: reply.slice(1, 25), senderId: reply.slice(25, 49) };
}

// Relay keys by address, fetched once per run.
const keys = new Map<string, Uint8Array>();

/** The relay's key for sealed sends, or null if it has none. A key given with the relay (from a
 *  contact link) is used as it is, without asking that relay. */
export async function relayKey(relay: Relay): Promise<Uint8Array | null> {
  if (relay.key) return relay.key;
  const known = keys.get(relay.url);
  if (known) return known;
  // The key it proved, when it did: the relay is not asked, so no one in between can give another.
  const pinned = pins.get(relayHome(relay.url));
  if (pinned?.proven) return pinned.key;
  const reply = await request(relay, Uint8Array.of(KEY));
  if (reply[0] === NOT_FOUND) return null;
  check(reply, 'key');
  if (reply.length !== 33) throw new RelayError('key: unexpected reply');
  const key = reply.slice(1);
  keys.set(relay.url, key);
  // From now on in a channel to it, when the relay has them.
  pinRelay(relay.url, key);
  return key;
}

/** How long, ms, before a relay that could not be reached is asked for its key again (askRelayKey): twice as long each time after, up to five minutes. */
export const KEY_AGAIN_MS = 5_000;
const KEY_AGAIN_MOST = 5 * 60_000;

/**
 * Asks `relay` for its key (`ask`, relayKey) until it answers, again after a longer wait each time
 * it cannot be reached: `take` hears the key, or null for a relay with none. Stops when the
 * function it gives is called.
 */
export function askRelayKey(relay: Relay, take: (key: Uint8Array | null) => void, wait = KEY_AGAIN_MS, ask: (relay: Relay) => Promise<Uint8Array | null> = relayKey): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const once = (next: number) => {
    ask(relay).then(
      (key) => {
        if (!stopped) take(key);
      },
      () => {
        if (!stopped) timer = setTimeout(() => once(Math.min(next * 2, KEY_AGAIN_MOST)), next);
      },
    );
  };
  once(wait);
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/** What a send carries: a message someone reads, word between phones, or a call that rings (see Marks above). */
export type Mark = keyof typeof MARKS;

// The request with its mark after it, if it has one.
function marked(bytes: Uint8Array, mark: Mark | undefined): Uint8Array {
  if (!mark) return bytes;
  const out = new Uint8Array(bytes.length + 1);
  out.set(bytes);
  out[bytes.length] = MARKS[mark];
  return out;
}

/** Hands a message sealed for the relay at `to` to the relay `via`, which passes it on. */
export async function forwardMessage(via: Relay, to: string, sealed: Uint8Array, mark?: Mark): Promise<void> {
  check(await request(via, marked(forwardRequest(to, sealed), mark)), 'send');
}

function sealedSendRequest(sealed: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(1 + 4 + sealed.length);
  bytes[0] = SEALED_SEND;
  new DataView(bytes.buffer).setUint32(1, sealed.length);
  bytes.set(sealed, 5);
  return bytes;
}

function forwardRequest(to: string, sealed: Uint8Array): Uint8Array {
  const address = utf8Encode(to);
  const bytes = new Uint8Array(1 + 2 + address.length + 4 + sealed.length);
  const view = new DataView(bytes.buffer);
  bytes[0] = FORWARD;
  view.setUint16(1, address.length);
  bytes.set(address, 3);
  view.setUint32(3 + address.length, sealed.length);
  bytes.set(sealed, 3 + address.length + 4);
  return bytes;
}

/**
 * Hands a message sealed for the relay at `url` (relaySeal) to that relay, for the phone that
 * carried it there (lib/nearby.ts): through our own relay, or the second one when set, as a
 * two-hop send, so the relay at `url` never sees this phone's address. `mark` only for this
 * phone's own: one carried for another says nothing, as it cannot know. True when the relay took
 * it, false when it never will: the queue is not there, or it was sealed for another key. Throws
 * when a relay could not be reached or could not keep it now: try again later.
 */
export async function carryTo(own: Relay, url: string, sealed: Uint8Array, mark?: Mark): Promise<boolean> {
  if (sealed.length > MAX_MESSAGE + 1024) return false;
  const first = own.via ?? own;
  try {
    if (sameRelay(first.url, url)) check(await request(first, marked(sealedSendRequest(sealed), mark)), 'send');
    // A place lent on our relay cannot have it connect to theirs.
    else if (isLentToken(first.token)) check(await request(relayPath(url, '/sealed'), marked(sealedSendRequest(sealed), mark)), 'send');
    else await forwardMessage(first, url.trim().replace(/\/+$/, ''), sealed, mark);
    return true;
  } catch (error) {
    if (isQueueNotFound(error)) return false;
    throw error;
  }
}

/** Queues one message, through the relay's `via` if it has one, or else where its `fallback` says,
 *  in turn, with its `mark` if given. Throws, with what the relay first said, if none takes it: the
 *  sender id is unknown, the queue is full, or no relay can be reached. */
export async function sendMessage(relay: Relay, senderId: Uint8Array, message: Uint8Array, mark?: Mark): Promise<void> {
  if (message.length > MAX_MESSAGE) throw new RelayError(t('message is too large'));
  try {
    await sendOne(relay, senderId, message, mark);
  } catch (error) {
    for (const next of relay.fallback ?? []) {
      try {
        await sendOne(next.relay, next.senderId ?? senderId, message, mark);
        return;
      } catch {
        // The next one, if any.
      }
    }
    throw error;
  }
}

async function sendOne(relay: Relay, senderId: Uint8Array, message: Uint8Array, mark: Mark | undefined): Promise<void> {
  const { to, bytes } = await sendRequest(relay, senderId, message);
  check(await request(forSender(to, senderId), marked(bytes, mark)), 'send');
}

// The request that queues one message, and the relay it goes to: the second relay with the message
// sealed for this one, when it has one, or else this one. From a place lent on the second relay,
// which connects nowhere for it, the sealed message goes straight to this one's /sealed path.
async function sendRequest(relay: Relay, senderId: Uint8Array, message: Uint8Array): Promise<{ to: Relay; bytes: Uint8Array }> {
  if (relay.via) {
    const key = await relayKey(relay);
    if (!key) throw new RelayError(t('your server has no key for two-hop sending, so it was not sent through the second server'));
    const sealed = await relaySeal(key, senderId, message);
    if (isLentToken(relay.via.token)) return { to: relayPath(relay.url, '/sealed'), bytes: sealedSendRequest(sealed) };
    return { to: relay.via, bytes: forwardRequest(relay.url, sealed) };
  }
  const bytes = new Uint8Array(1 + 24 + 4 + message.length);
  bytes[0] = SEND;
  bytes.set(senderId, 1);
  new DataView(bytes.buffer).setUint32(25, message.length);
  bytes.set(message, 1 + 24 + 4);
  return { to: relay, bytes };
}

// Relays that can hold messages for later, or cannot (from before LATER), by address, for this run.
const holds = new Map<string, boolean>();

/**
 * Whether the relay can hold a message for later. A relay from before it closes the connection, as
 * for any request it does not know: then one that answers a plain request cannot, and is not asked
 * again this run. Throws when the relay cannot be reached.
 */
export async function canHoldAt(relay: Relay): Promise<boolean> {
  // A lent place holds nothing for later.
  if (isLentToken(relay.token)) return false;
  const address = relay.url.trim().toLowerCase();
  const known = holds.get(address);
  if (known !== undefined) return known;
  try {
    // Taking back one it never held: a relay that holds says it holds none.
    const reply = await request(relay, Uint8Array.of(UNLATER, ...randomBytes(16)));
    if (reply[0] !== NOT_FOUND) check(reply, 'later');
  } catch (error) {
    if (!(error instanceof RelayUnreachableError)) throw error;
    await request(relay, Uint8Array.of(KEY)).catch(() => {
      throw error;
    });
    holds.set(address, false);
    return false;
  }
  holds.set(address, true);
  return true;
}

// Unix seconds as 8 bytes at `at`, without BigInt.
function putSeconds(view: DataView, at: number, ms: number): void {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  view.setUint32(at, Math.floor(seconds / 2 ** 32));
  view.setUint32(at + 4, seconds % 2 ** 32);
}

/** A message held for later: its ids (hex, one for each packet, comma-separated) and the relay that holds it. */
export type HeldAt = { id: string; relay: string };

/** Thrown when no relay that would take a message can hold it for later. */
export class CannotHoldError extends RelayError {}

/**
 * Hands the packets of one message to the relay that would take them now, or else where its
 * `fallback` says, in turn, to go at `at` (milliseconds) in their order: they go then, though this
 * phone is off by then. Says which relay holds them, and the ids to take them back with. Throws,
 * with what the relay first said, if none takes them all: CannotHoldError when none of them can
 * hold any. What a relay took of them before it failed, it is asked to drop. The `mark` goes
 * after each packet's whole request (inside it, the relay would refuse it): a message is one,
 * so it goes with the last packet, and the ones before it are quiet.
 */
export async function sendMessageLater(relay: Relay, senderId: Uint8Array, messages: Uint8Array[], at: number, mark?: Mark): Promise<HeldAt> {
  if (messages.some((message) => message.length > MAX_MESSAGE)) throw new RelayError(t('message is too large'));
  let first: unknown = null;
  for (const route of [{ relay, senderId }, ...(relay.fallback ?? []).map((f) => ({ relay: f.relay, senderId: f.senderId ?? senderId }))]) {
    const ids: string[] = [];
    let holder: Relay | null = null;
    try {
      for (const [i, message] of messages.entries()) {
        const made = await sendRequest(route.relay, route.senderId, message);
        const to = forSender(made.to, route.senderId);
        const bytes = made.bytes;
        if (!(await canHoldAt(to))) throw new CannotHoldError(t('the server at {url} cannot keep messages for later: update it', { url: to.url }));
        holder = to;
        const id = randomBytes(16);
        const held = new Uint8Array(1 + 8 + 16 + 4 + bytes.length);
        const view = new DataView(held.buffer);
        held[0] = LATER;
        putSeconds(view, 1, at);
        held.set(id, 9);
        view.setUint32(25, bytes.length);
        held.set(bytes, 29);
        check(await request(to, marked(held, mark === 'message' && i < messages.length - 1 ? 'quiet' : mark)), 'send');
        ids.push(toHex(id));
      }
      return { id: ids.join(','), relay: holder!.url };
    } catch (error) {
      first ??= error;
      if (holder) for (const id of ids) await dropLater(holder, id).catch(() => undefined);
    }
  }
  throw first;
}

/**
 * Takes back a message held for later by the relay `holder`: true when it did not go and now never
 * will, false when it went already (or is going now). Throws when the relay cannot be reached.
 */
export async function dropLater(holder: Relay, id: string): Promise<boolean> {
  let dropped = false;
  for (const one of id.split(',')) {
    if (!/^[0-9a-f]{32}$/.test(one)) throw new RelayError(t('message is not held'));
    const id = Uint8Array.from(one.match(/../g)!, (pair) => parseInt(pair, 16));
    const reply = await request(holder, Uint8Array.of(UNLATER, ...id));
    if (reply[0] === NOT_FOUND) continue;
    check(reply, 'delete');
    dropped = true;
  }
  return dropped;
}

// Whether the web app shows on the screen. Never on a phone, whose queues the relay does not push for.
function onScreen(): boolean {
  return typeof document !== 'undefined' && document.visibilityState === 'visible';
}

// When a queue last gave this app a message, or was found empty, in milliseconds since 1970.
let lastTaken = 0;

/** When a queue last gave this app a message, or was found empty: a push sent before then, held
 *  back by its push service, is of messages the web app has (lib/push-notice.web.ts). 0 if never. */
export function lastTakenAt(): number {
  return lastTaken;
}

/**
 * Takes the oldest message from the queue, or returns null if it is empty. A relay that keeps it
 * until it is acknowledged (see Taken to keep above) is told, with this phone's next take from the
 * queue, that the one before was kept: so call it again only once the message it gave is kept. An
 * older relay forgets it at once. `shown`: taken on the screen (see Marks above).
 */
export async function receiveMessage(relay: Relay, recipientId: Uint8Array, shown = onScreen()): Promise<Uint8Array | null> {
  const key = heldKey(relay, recipientId);
  const taken = receivedOf(await request(relay, receiveBytes(recipientId, shown, held.get(key))), key);
  lastTaken = Date.now();
  return taken;
}

// The number of the message each queue handed over last and still keeps, by relay and queue: kept
// by now, and said so with the next take or ackTaken. In memory only: after a restart the message
// comes again.
const held = new Map<string, Uint8Array>();

const heldKey = (relay: Relay, recipientId: Uint8Array) => `${relayHome(relay.url)} ${toHex(recipientId)}`;

/**
 * Tells the relay that the message the queue handed over last is kept, so it is deleted there now
 * rather than with the next take: at the end of a look, and before a wait on the queue, which the
 * message would end at once. With `way`, on the relay's `/read` path through Tor as receiveOnRead.
 * Nothing when none waits to be told, as from an older relay. Throws when the relay cannot be
 * reached; told again then with the next take.
 */
export async function ackTaken(relay: Relay, recipientId: Uint8Array, way?: string): Promise<void> {
  const key = heldKey(relay, recipientId);
  const number = held.get(key);
  if (!number) return;
  const bytes = new Uint8Array(1 + 24 + 8);
  bytes[0] = ACK;
  bytes.set(recipientId, 1);
  bytes.set(number, 25);
  const reply = way === undefined ? await request(relay, bytes) : await readRequest(relay, bytes, way, undefined, [recipientId]);
  if (reply === null || reply === 'ended') return;
  if (reply[0] !== NOT_FOUND) check(reply, 'receive');
  if (held.get(key) === number) held.delete(key);
}

/** Forgets which messages were handed over and are not acknowledged yet, as a restart does: they come again. */
export function forgetTaken(): void {
  held.clear();
}

function receiveBytes(recipientId: Uint8Array, shown: boolean, kept?: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(1 + 24 + 2 + (kept?.length ?? 0));
  bytes[0] = RECEIVE;
  bytes.set(recipientId, 1);
  bytes[25] = shown ? SHOWN : 0;
  bytes[26] = HOLD;
  if (kept) bytes.set(kept, 27);
  return bytes;
}

function receivedOf(reply: Uint8Array, key: string): Uint8Array | null {
  // No such queue: nothing of it is kept any more. Otherwise, answered: the one before was kept.
  if (reply[0] === OK || reply[0] === NOT_FOUND) held.delete(key);
  check(reply, 'receive');
  if (reply[1] === 0) return null;
  const read = new DataView(reply.buffer, reply.byteOffset, reply.byteLength);
  if (reply[1] !== HELD) return reply.slice(6, 6 + read.getUint32(2));
  if (reply.length < 14) throw new RelayError(`receive: unexpected reply of ${reply.length} bytes`, reply[0]);
  held.set(key, reply.slice(2, 10));
  return reply.slice(14, 14 + read.getUint32(10));
}

// A relay from before a request closes the connection, as for any request it does not know; but so
// does a connection that died on the way, as when the phone's network changed or the relay
// restarted. So a relay taken as one from before is asked again after this long, and one that
// answered the request this run is never taken as one: its connection died.
const CANNOT_FOR_MS = 10 * 60_000;

const addressOf = (relay: Relay) => relay.url.trim().toLowerCase();

// Relays that cannot wait for a message (from before WAIT), by address, until when they are asked again; and those that waited this run.
const cannotWait = new Map<string, number>();
const waited = new Set<string>();

/** Whether the relay may be asked to wait for a message (`waitForMessage`), as far as this run knows. */
export function canWaitAt(relay: Relay): boolean {
  return (cannotWait.get(addressOf(relay)) ?? 0) <= Date.now();
}

/**
 * Waits until a message is in the queue, `seconds` at most (60), without taking it: true once
 * one is, false when none came in that time, the wait was ended (`signal`), or the relay cannot
 * wait. A relay from before it closes the connection, as for any request it does not know: then
 * one that answers a plain request is not asked to wait again for a while, unless it waited this
 * run, as then its connection died on the way. Throws when the relay cannot be reached. The message
 * the queue handed over last is said to be kept first, as one waits only once it is.
 */
export async function waitForMessage(relay: Relay, recipientId: Uint8Array, seconds: number, signal?: AbortSignal): Promise<boolean> {
  await ackTaken(relay, recipientId).catch(() => undefined);
  const bytes = new Uint8Array(1 + 24 + 1);
  bytes[0] = WAIT;
  bytes.set(recipientId, 1);
  bytes[25] = Math.max(0, Math.min(60, Math.round(seconds)));
  let reply: Uint8Array;
  try {
    reply = await request(relay, bytes, signal);
  } catch (error) {
    if (error instanceof Ended) return false;
    if (!(error instanceof RelayUnreachableError) || signal?.aborted) throw error;
    // One that waited this run: the connection died on the way.
    if (waited.has(addressOf(relay))) throw error;
    // It answers a request any relay knows: it is there, and cannot wait.
    try {
      await request(relay, Uint8Array.of(KEY), signal);
    } catch (again) {
      if (again instanceof Ended) return false;
      throw error;
    }
    cannotWait.set(addressOf(relay), Date.now() + CANNOT_FOR_MS);
    return false;
  }
  check(reply, 'wait');
  waited.add(addressOf(relay));
  return reply[1] === 1;
}

// Relays that cannot say their time (from before TIME), by address, until when they are asked again.
const cannotTime = new Map<string, number>();
// A round trip longer than this says too little of when the relay read its clock.
const MAX_TIME_TRIP_MS = 10_000;

/**
 * How far this phone's clock is behind the relay's, in milliseconds (less than 0: ahead), by one
 * round trip: what calls are stamped and judged fresh by (lib/call.ts). Null when the relay cannot
 * say, as one from before it closes the connection (asked again after a while, as one that could
 * not be reached), or the trip took too long to tell.
 */
export async function relayClockOffset(relay: Relay): Promise<number | null> {
  if ((cannotTime.get(addressOf(relay)) ?? 0) > Date.now()) return null;
  const sent = Date.now();
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(TIME));
  } catch (error) {
    if (error instanceof RelayUnreachableError) cannotTime.set(addressOf(relay), Date.now() + CANNOT_FOR_MS);
    return null;
  }
  const back = Date.now();
  if (reply[0] !== OK || reply.length < 9 || back - sent > MAX_TIME_TRIP_MS) return null;
  const read = new DataView(reply.buffer, reply.byteOffset, reply.byteLength);
  const at = read.getUint32(1) * 2 ** 32 + read.getUint32(5);
  return Math.round(at - (sent + back) / 2);
}

/**
 * What came into a queue since its recipient last found it empty, as the relay counts it by what
 * each send said it carries (Mark): messages, sends that did not say, and rings; word between
 * phones counts nothing. `round` is new each time something comes into a queue found empty, and
 * 0 while nothing came since.
 */
export type News = { round: number; messages: number; unmarked: number; rings: number };

export const NO_NEWS: News = { round: 0, messages: 0, unmarked: 0, rings: 0 };

// Relays that cannot say what came (from before NEWS), by address, until when they are asked again; and those that said this run.
const cannotTell = new Map<string, number>();
const told = new Set<string>();

/** Whether the relay may be asked what came into a queue (`waitForNews`), as far as this run knows. */
export function canTellNewsAt(relay: Relay): boolean {
  return (cannotTell.get(addressOf(relay)) ?? 0) <= Date.now();
}

/**
 * Waits until what came into the queue differs from `heard`, `seconds` at most (60), without
 * taking anything, and returns what came: `heard` again when nothing changed in that time or the
 * wait was ended (`signal`). Null when the relay cannot say: a relay from before it closes the
 * connection, as for any request it does not know, and then one that answers a plain request is
 * not asked again for a while, unless it said this run, as then its connection died on the way
 * (waitForMessage may still wait there). Throws when the relay cannot be reached.
 */
export async function waitForNews(relay: Relay, recipientId: Uint8Array, seconds: number, heard: News, signal?: AbortSignal): Promise<News | null> {
  const bytes = new Uint8Array(1 + 24 + 1 + 16);
  bytes[0] = NEWS;
  bytes.set(recipientId, 1);
  bytes[25] = Math.max(0, Math.min(60, Math.round(seconds)));
  const view = new DataView(bytes.buffer);
  [heard.round, heard.messages, heard.unmarked, heard.rings].forEach((n, i) => view.setUint32(26 + 4 * i, n >>> 0));
  let reply: Uint8Array;
  try {
    reply = await request(relay, bytes, signal);
  } catch (error) {
    if (error instanceof Ended) return heard;
    if (!(error instanceof RelayUnreachableError) || signal?.aborted) throw error;
    // One that said this run: the connection died on the way.
    if (told.has(addressOf(relay))) throw error;
    try {
      await request(relay, Uint8Array.of(KEY), signal);
    } catch (again) {
      if (again instanceof Ended) return heard;
      throw error;
    }
    cannotTell.set(addressOf(relay), Date.now() + CANNOT_FOR_MS);
    return null;
  }
  check(reply, 'news');
  told.add(addressOf(relay));
  if (reply.length < 17) throw new RelayError(`news: unexpected reply of ${reply.length} bytes`, reply[0]);
  const read = new DataView(reply.buffer, reply.byteOffset, reply.byteLength);
  return { round: read.getUint32(1), messages: read.getUint32(5), unmarked: read.getUint32(9), rings: read.getUint32(13) };
}

/** Most queues one waitForAny or newsOfAny asks of (the relay's MAX_ANY). */
export const MAX_ANY = 64;
// In a reply to WAIT_ANY or NEWS_ANY: no such queue.
const GONE = 2;

// Relays that cannot read many queues at once on /read (from before WAIT_ANY), by address, until when they are asked again.
const cannotReadMany = new Map<string, number>();

/** Whether the relay may be asked to wait on many queues at once on /read (waitForAny, newsOfAny), as far as this run knows. */
export function canReadManyAt(relay: Relay): boolean {
  return (cannotReadMany.get(relayHome(relay.url)) ?? 0) <= Date.now();
}

// Relays that answered on /read this run, by address.
const readsMany = new Set<string>();

/**
 * Whether the relay showed this run that it reads queues on its `/read` path, many at once: asked
 * once, through Tor on the circuits named `way`, of a queue no one has, so that nothing of this
 * phone's is named. False for one from before, or when it cannot be reached.
 */
export async function readsManyAt(relay: Relay, way: string): Promise<boolean> {
  const home = relayHome(relay.url);
  if (readsMany.has(home)) return true;
  if (!canReadManyAt(relay)) return false;
  return !!(await waitForAny(relay, [randomBytes(24)], 0, way).catch(() => null));
}

/**
 * Takes the oldest message from the queue on the relay's `/read` path, with no token, through Tor
 * on the circuits named `way`, as receiveMessage does on its own path. Null when it is empty, or
 * the relay has no such path. Throws when the relay cannot be reached, or has no such queue.
 */
export async function receiveOnRead(relay: Relay, recipientId: Uint8Array, way: string, shown = onScreen()): Promise<Uint8Array | null> {
  const key = heldKey(relay, recipientId);
  const reply = await readRequest(relay, receiveBytes(recipientId, shown, held.get(key)), way, undefined, [recipientId]);
  if (reply === null || reply === 'ended') return null;
  const taken = receivedOf(reply, key);
  lastTaken = Date.now();
  return taken;
}

// Through a phone nearby (lib/nearby.ts, the bridge): a phone with no internet has one beside it
// that has internet read its queue on the relay's `/read` path, with no token, as receiveOnRead.
// It passes the very request, RECEIVE or ACK of one queue, and the relay's reply comes back as it
// is: the phone nearby learns the relay's address and the queue's id, never what the messages
// hold, which only this phone opens. The messages a take hands over are kept on the relay until
// the next take or ACK says so, as here.

/** Sends `bytes` to the relay through a phone nearby, and gives the relay's reply. Throws when it did not come. */
export type ReadThrough = (url: string, key: Uint8Array | undefined, bytes: Uint8Array) => Promise<Uint8Array>;

/** Whether a queue on this relay may be read through a phone nearby: never one reached only through Tor, nor through another relay. */
export function mayReadThrough(relay: Relay): boolean {
  return !relay.torOnly && !relay.tor && !relay.torChat && !relay.via;
}

/** Takes the oldest message from the queue through a phone nearby (`through`), as receiveMessage does. Null when it is empty. */
export async function receiveThrough(relay: Relay, recipientId: Uint8Array, through: ReadThrough): Promise<Uint8Array | null> {
  const key = heldKey(relay, recipientId);
  const reply = await through(relay.url, relay.key, receiveBytes(recipientId, false, held.get(key)));
  if (reply.length < 2) throw new RelayError(`receive: unexpected reply of ${reply.length} bytes`, reply[0]);
  return receivedOf(reply, key);
}

/** Tells the relay through a phone nearby that the message the queue handed over last is kept, as ackTaken. */
export async function ackThrough(relay: Relay, recipientId: Uint8Array, through: ReadThrough): Promise<void> {
  const key = heldKey(relay, recipientId);
  const number = held.get(key);
  if (!number) return;
  const bytes = new Uint8Array(1 + 24 + 8);
  bytes[0] = ACK;
  bytes.set(recipientId, 1);
  bytes.set(number, 25);
  const reply = await through(relay.url, relay.key, bytes);
  if (reply[0] !== NOT_FOUND) check(reply, 'receive');
  if (held.get(key) === number) held.delete(key);
}

/** Whether `bytes` is a request a phone nearby may have this one pass to a relay: RECEIVE or ACK of one queue, nothing else. */
export function isReadForOthers(bytes: Uint8Array): boolean {
  if (bytes[0] === RECEIVE) return bytes.length === 27 || bytes.length === 35;
  return bytes[0] === ACK && bytes.length === 33;
}

/** The most bytes a reply passed on for a phone nearby may hold: one message as the relay keeps it. */
export const MAX_READ_FOR_OTHERS = MAX_MESSAGE + 1024;

/**
 * For a phone nearby with no internet: passes its request (isReadForOthers) to `own`, this phone's
 * own relay, on its `/read` path with no token, and gives the reply as it is. Another relay would
 * learn this phone's address from a stranger's word (the relay this phone uses already knows it):
 * only once the owner said yes to that, warned of it (`warned`, lib/nearby.ts askServe). Never
 * while the space goes through Tor, which a request straight to the relay would go around. Throws when it is not such a request, the relay is not `own`, Tor is on,
 * the reply is larger than one message (MAX_READ_FOR_OTHERS), or the relay cannot be reached.
 */
export async function readForOthers(own: string, url: string, key: Uint8Array | undefined, bytes: Uint8Array, warned = false): Promise<Uint8Array> {
  if (!isReadForOthers(bytes)) throw new RelayError('read: not a request this phone passes on');
  if (!own || (!sameRelay(own, url) && !warned)) throw new RelayError('read: not this phone\'s relay');
  if (!torOff()) throw new RelayError('read: the space goes through Tor');
  const reply = await request(readerOf({ url, ...(key ? { key } : {}) }), bytes);
  if (reply.length > MAX_READ_FOR_OTHERS) throw new RelayError('read: too large to pass on');
  return reply;
}

/** What a queue was, as one waitForAny or newsOfAny found it. */
export type AnyFound = 'none' | 'waiting' | 'gone';

/**
 * The relay's path where queues are read with no token (`/read`): knowing a queue's recipient id is
 * what reads it, so the token, which names this phone, does not tie the queues read there together.
 * With the relay's key, for its channel, and as reached through Tor as the relay is.
 */
function readerOf(relay: Relay): Relay {
  return { url: relayPath(relay.url, '/read').url, ...(relay.key ? { key: relay.key } : {}), ...(relay.torOnly ? { torOnly: true } : {}), ...(relay.torChat ? { torChat: relay.torChat } : {}) };
}

/**
 * One request to the relay's `/read` path, through Tor on the circuits named `way`. Null when the
 * relay has no such path, as one from before it (it refuses the connection there, or closes it at
 * the request): then one that answers a plain request is not asked again for a while, unless it
 * answered there this run, as then its connection died on the way. Throws when the relay cannot be
 * reached.
 */
async function readRequest(relay: Relay, bytes: Uint8Array, way: string, signal?: AbortSignal, recipients: Uint8Array[] = []): Promise<Uint8Array | null | 'ended'> {
  // Queues of a chat that goes only through Tor (setTorChats) are read on circuits of their own,
  // never with others (lib/contact-queues.ts bunches keeps them apart), and never straight.
  if (!relay.torChat && recipients.some((id) => torChatReaders.has(toHex(id)))) relay = { ...relay, torChat: `read ${way}` };
  try {
    return await request(readerOf(relay), bytes, signal, way);
  } catch (error) {
    if (error instanceof Ended) return 'ended';
    if (!(error instanceof RelayUnreachableError) || error instanceof RelayKeyError || signal?.aborted) throw error;
    // One that answered there this run: the connection died on the way.
    if (readsMany.has(relayHome(relay.url))) throw error;
    try {
      await request(relay, Uint8Array.of(KEY), signal);
    } catch (again) {
      if (again instanceof Ended) return 'ended';
      throw error;
    }
    cannotReadMany.set(relayHome(relay.url), Date.now() + CANNOT_FOR_MS);
    return null;
  }
}

/**
 * Waits until a message is in one of `recipients` (1 to MAX_ANY queues), `seconds` at most (60),
 * without taking any (the message each handed over last said to be kept first, as for
 * waitForMessage), on the relay's `/read` path through Tor on the circuits named `way`: what each
 * queue was then, in the same order. All 'none' when the wait was ended (`signal`). Null when the
 * relay cannot (canReadManyAt). Throws when the relay cannot be reached.
 */
export async function waitForAny(relay: Relay, recipients: Uint8Array[], seconds: number, way: string, signal?: AbortSignal): Promise<AnyFound[] | null> {
  if (recipients.length < 1 || recipients.length > MAX_ANY) throw new RangeError(`waitForAny: ${recipients.length} queues`);
  for (const id of recipients) await ackTaken(relay, id, way).catch(() => undefined);
  const bytes = new Uint8Array(2 + 24 * recipients.length + 1);
  bytes[0] = WAIT_ANY;
  bytes[1] = recipients.length;
  recipients.forEach((id, i) => bytes.set(id, 2 + 24 * i));
  bytes[bytes.length - 1] = Math.max(0, Math.min(60, Math.round(seconds)));
  const reply = await readRequest(relay, bytes, way, signal, recipients);
  if (reply === null) return null;
  if (reply === 'ended') return recipients.map(() => 'none');
  check(reply, 'wait');
  readsMany.add(relayHome(relay.url));
  if (reply.length !== 1 + recipients.length) throw new RelayError(`wait: unexpected reply of ${reply.length} bytes`, reply[0]);
  return [...reply.slice(1)].map((b) => (b === GONE ? 'gone' : b === 1 ? 'waiting' : 'none'));
}

/**
 * Waits until what came into one of the queues `asked` (1 to MAX_ANY, each with what was heard of
 * it) differs from what was heard, or one is gone, `seconds` at most (60), on `/read` as
 * waitForAny does: each queue's news now, null for one gone. What was heard again when the wait was
 * ended. Null when the relay cannot. Throws when the relay cannot be reached.
 */
export async function newsOfAny(
  relay: Relay,
  asked: { recipient: Uint8Array; heard: News }[],
  seconds: number,
  way: string,
  signal?: AbortSignal,
): Promise<(News | null)[] | null> {
  if (asked.length < 1 || asked.length > MAX_ANY) throw new RangeError(`newsOfAny: ${asked.length} queues`);
  const bytes = new Uint8Array(2 + 40 * asked.length + 1);
  const view = new DataView(bytes.buffer);
  bytes[0] = NEWS_ANY;
  bytes[1] = asked.length;
  asked.forEach(({ recipient, heard }, i) => {
    bytes.set(recipient, 2 + 40 * i);
    [heard.round, heard.messages, heard.unmarked, heard.rings].forEach((n, j) => view.setUint32(2 + 40 * i + 24 + 4 * j, n >>> 0));
  });
  bytes[bytes.length - 1] = Math.max(0, Math.min(60, Math.round(seconds)));
  const reply = await readRequest(relay, bytes, way, signal, asked.map((a) => a.recipient));
  if (reply === null) return null;
  if (reply === 'ended') return asked.map((a) => a.heard);
  check(reply, 'news');
  readsMany.add(relayHome(relay.url));
  if (reply.length !== 1 + 17 * asked.length) throw new RelayError(`news: unexpected reply of ${reply.length} bytes`, reply[0]);
  const read = new DataView(reply.buffer, reply.byteOffset, reply.byteLength);
  return asked.map((_, i) => {
    const at = 1 + 17 * i;
    if (reply[at] === GONE) return null;
    return { round: read.getUint32(at + 1), messages: read.getUint32(at + 5), unmarked: read.getUint32(at + 9), rings: read.getUint32(at + 13) };
  });
}

/** What `now` counts that `heard` did not: all of it when it is another round, or nothing was heard. */
export function newsSince(heard: News | null, now: News): Omit<News, 'round'> {
  const before = heard && heard.round === now.round ? heard : NO_NEWS;
  return {
    messages: Math.max(0, now.messages - before.messages),
    unmarked: Math.max(0, now.unmarked - before.unmarked),
    rings: Math.max(0, now.rings - before.rings),
  };
}

/**
 * A ticket for a place on the relay, for our contact link, or null if it lends none: it has no
 * key, lending is off, or it is from before lending (it closes the connection, as for any request
 * it does not know). None for a place lent to us. Throws when the relay cannot be reached.
 */
export async function lendTicket(relay: Relay): Promise<string | null> {
  if (isLentToken(relay.token)) return null;
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(LEND));
  } catch (error) {
    if (!(error instanceof RelayUnreachableError)) throw error;
    await request(relay, Uint8Array.of(KEY)).catch(() => {
      throw error;
    });
    return null;
  }
  if (reply[0] === NOT_FOUND) return null;
  check(reply, 'lend');
  const ticket = utf8Decode(reply.slice(1));
  if (!isTicket(ticket)) throw new RelayError('lend: unexpected reply');
  return ticket;
}

/**
 * Takes a place on the relay at `url` with a ticket from a contact's link: our queue there, and
 * the lent token to use it with from now on, where the relay's token goes. Throws when the ticket
 * gave all its places (FULL), or the relay cannot be reached or does not take it (expired, or the
 * relay has a new key).
 */
export async function borrowPlace(url: string, ticket: string): Promise<{ queue: QueueIds; token: string }> {
  const reply = await request({ url, token: ticket }, Uint8Array.of(BORROW));
  if (reply[0] === FULL) throw new RelayError(t('the link has given all its places on its server. Ask them for a new link'), FULL);
  check(reply, 'borrow');
  const token = utf8Decode(reply.slice(49));
  if (!isLentToken(token)) throw new RelayError('borrow: unexpected reply');
  return { queue: { recipientId: reply.slice(1, 25), senderId: reply.slice(25, 49) }, token };
}

/** The longest name an invite may carry, bytes of UTF-8, as the relay's MAX_TYPED. */
const MAX_INVITE_NAME = 64;

/** An invite as its inviter sees it: `id` (hex) to take it back with, the name on the line it
 *  gives, when it expires, and when it was used (milliseconds; 0 while it was not). */
export type InviteListed = { id: string; name: string; expires: number; used: number };

// Unix seconds as 8 bytes at `at`, in milliseconds, without BigInt.
function secondsAt(view: DataView, at: number): number {
  return (view.getUint32(at) * 2 ** 32 + view.getUint32(at + 4)) * 1000;
}

/**
 * An invite for one more phone, named `name` (cut to what the relay takes), with the relay's token
 * of this phone's own: its secret (64 hex characters) and when it expires (milliseconds). Null when
 * this phone cannot invite here: the relay does not invite, the token is not one of its own, or the
 * relay is from before invites (it closes the connection, as for any request it does not know).
 * Throws when the phone made all the invites it may for now, or the relay let in all the phones it
 * lets in by invite (FULL), or the relay cannot be reached.
 */
export async function makeInvite(relay: Relay, name: string): Promise<{ code: string; expires: number } | null> {
  let letters = Array.from(name.trim());
  while (utf8Encode(letters.join('')).length > MAX_INVITE_NAME) letters = letters.slice(0, -1);
  const bytes = utf8Encode(letters.join(''));
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(INVITE, bytes.length, ...bytes));
  } catch (error) {
    if (await fromBefore(relay, error)) return null;
    throw error;
  }
  if (reply[0] === NOT_FOUND) return null;
  if (reply[0] === FULL) throw new RelayError(t('No invite now: you may have 5 waiting at once and make 10 a day, and this server lets in only so many phones by invite.'), FULL);
  check(reply, 'invite');
  const code = utf8Decode(reply.slice(9));
  if (reply.length < 9 || !/^[0-9a-f]{64}$/.test(code)) throw new RelayError('invite: unexpected reply');
  return { code, expires: secondsAt(new DataView(reply.buffer, reply.byteOffset, reply.byteLength), 1) };
}

/**
 * This phone's invites on the relay, the oldest first: those waiting and those used whose phone is
 * still let in. Null when this phone cannot invite here, as for makeInvite.
 */
export async function listInvites(relay: Relay): Promise<InviteListed[] | null> {
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(INVITES));
  } catch (error) {
    if (await fromBefore(relay, error)) return null;
    throw error;
  }
  if (reply[0] === NOT_FOUND) return null;
  check(reply, 'invites');
  const view = new DataView(reply.buffer, reply.byteOffset, reply.byteLength);
  const unexpected = () => new RelayError('invites: unexpected reply');
  if (reply.length < 3) throw unexpected();
  const count = view.getUint16(1);
  const listed: InviteListed[] = [];
  let at = 3;
  for (let i = 0; i < count; i++) {
    if (at + 33 > reply.length) throw unexpected();
    const length = reply[at + 32];
    if (at + 33 + length > reply.length) throw unexpected();
    listed.push({
      id: toHex(reply.slice(at, at + 16)),
      expires: secondsAt(view, at + 16),
      used: secondsAt(view, at + 24),
      name: utf8Decode(reply.slice(at + 33, at + 33 + length)),
    });
    at += 33 + length;
  }
  return listed;
}

/** Takes back one of this phone's invites: one used cuts its phone off. False when the relay has no
 *  such invite of this phone's (it expired, or was taken back already). */
export async function takeBackInvite(relay: Relay, id: string): Promise<boolean> {
  if (!/^[0-9a-f]{32}$/.test(id)) return false;
  const reply = await request(relay, Uint8Array.of(UNINVITE, ...id.match(/../g)!.map((pair) => parseInt(pair, 16))));
  if (reply[0] === NOT_FOUND) return false;
  check(reply, 'invite');
  return true;
}

// The token made for each invite taken, or sign-in claimed, here while Erevos runs, so taking one
// again after the answer was lost gives the same token, which the relay answers again.
const madeFor = new Map<string, string>();

/** A token of this phone's own, as `erevos-relay new-token` makes one: 64 hex characters. */
export function newPhoneToken(): string {
  return toHex(randomBytes(32));
}

/**
 * Takes the invite `code` (64 hex characters) on the relay at `url`: makes a token of this phone's
 * own and has the relay add a line for it, from the /join path, which needs no token. Returns the
 * token, for where the relay's token goes, and the name on its line there. Throws when the invite
 * is no longer good (NOT_FOUND), another phone took it (FULL), or the relay cannot be reached.
 */
export async function redeemInvite(url: string, code: string): Promise<{ token: string; name: string }> {
  if (!/^[0-9a-f]{64}$/.test(code)) throw new RelayError(t('That is not an invite to a server.'));
  const token = madeFor.get(code) ?? newPhoneToken();
  madeFor.set(code, token);
  const secret = Uint8Array.from(code.match(/../g)!, (pair) => parseInt(pair, 16));
  const reply = await request(relayPath(url, '/join'), Uint8Array.of(REDEEM, ...secret, ...sha256Bytes(utf8Encode(token))));
  if (reply[0] === NOT_FOUND) throw new RelayError(t('The invite is no longer good: it lasts 7 days, for one phone, and can be taken back. Ask for a new one.'), NOT_FOUND);
  if (reply[0] === FULL) throw new RelayError(t('Another phone took this invite already. Ask for a new one.'), FULL);
  check(reply, 'invite');
  madeFor.delete(code);
  return { token, name: utf8Decode(reply.slice(1)) };
}

/** Why a relay gave no open place (takeOpenPlace): it gives none, or is from before them ('off');
 *  it gave all it gives ('full'), all it gives a day ('day'), or all it gives a day to phones from
 *  this phone's address ('address'). */
export type OpenPlaceRefusal = 'off' | 'full' | 'day' | 'address';

// What each refusal says. A screen that shows one says it in its own words, from openPlaceRefusal.
const OPEN_REFUSED: Record<OpenPlaceRefusal, string> = {
  off: 'open place: the server gives none',
  full: 'open place: the server gave all it gives',
  day: 'open place: the server gave all it gives today',
  address: 'open place: the server gave all it gives today to phones from this address',
};

/** What takeOpenPlace throws when the relay gives no open place: `refusal` says why. */
export class OpenPlaceRefusedError extends RelayError {
  readonly refusal: OpenPlaceRefusal;

  constructor(refusal: OpenPlaceRefusal, status: number) {
    super(OPEN_REFUSED[refusal], status);
    this.refusal = refusal;
  }
}

/** Why the relay gave no open place, when `error` is what takeOpenPlace threw for that; null for
 *  any other error, such as a relay that cannot be reached, which may give one later. */
export function openPlaceRefusal(error: unknown): OpenPlaceRefusal | null {
  return error instanceof OpenPlaceRefusedError ? error.refusal : null;
}

/**
 * Takes an open place on the relay at `url` (crates/erevos-relay/src/open.rs), one it gives a phone
 * that asks, with no invite: makes a token of this phone's own and has the relay add a line for it,
 * from the /join path, which needs no token. Returns the token, for where the relay's token goes,
 * and the name on its line there (`open-` and 8 hex characters). Each call makes a new token, as
 * the relay adds no line for a token it has one for, but for `again`: the token of a free place
 * there whose line the relay took out (RelayTokenError), asked for again as it was, so every queue
 * made with it stays the space's. Throws an OpenPlaceRefusedError (see openPlaceRefusal) when the
 * relay gives no place; a RelayError when it could not add the line (FAILED, as when it has one
 * for that token still), or cannot be reached.
 */
export async function takeOpenPlace(url: string, again?: string): Promise<{ token: string; name: string }> {
  const relay = relayPath(url, '/join');
  const token = again ?? newPhoneToken();
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(OPEN, ...sha256Bytes(utf8Encode(token))));
  } catch (error) {
    // The /join path takes no KEY. SIGN_IN changes nothing, and a relay answers it there whether it
    // signs phones in or not.
    if (await fromBefore(relay, error, Uint8Array.of(SIGN_IN))) throw new OpenPlaceRefusedError('off', NOT_FOUND);
    throw error;
  }
  if (reply[0] === NOT_FOUND) throw new OpenPlaceRefusedError('off', NOT_FOUND);
  if (reply[0] === FULL) throw new OpenPlaceRefusedError('full', FULL);
  if (reply[0] === DAY_FULL) throw new OpenPlaceRefusedError('day', DAY_FULL);
  if (reply[0] === ADDRESS_FULL) throw new OpenPlaceRefusedError('address', ADDRESS_FULL);
  check(reply, 'open place');
  const name = utf8Decode(reply.slice(1));
  if (!/^open-[0-9a-z]+$/i.test(name)) throw new RelayError('open place: unexpected reply');
  return { token, name };
}

/**
 * Whether the relay takes `relay.token` now: a channel opened with the token alone, with no request.
 * False when the relay ended it at the token (RelayTokenError); throws when it could not be reached.
 */
export async function tokenTaken(relay: Relay): Promise<boolean> {
  try {
    (await RelaySession.open(relay)).close();
    return true;
  } catch (error) {
    if (error instanceof RelayTokenError) return false;
    throw error;
  }
}

/**
 * Trades the relay's one token in `relay`, which every phone may have, for a line of this phone's
 * own there (crates/erevos-relay, OWN): makes a token of this phone's own and has the relay add a
 * line for it, named after `name` (cut to what the relay takes; `phone` when nothing is left of
 * it). Returns the token, for where the relay's token goes, and the name on its line. Null when the
 * relay does not do so: it does not invite, `relay.token` is a phone's own already, or the relay is
 * from before (it closes the connection, as for any request it does not know). Throws when the
 * relay added all the lines it adds so a day (FULL), or cannot be reached.
 */
export async function takeOwnLine(relay: Relay, name: string): Promise<{ token: string; name: string } | null> {
  let letters = Array.from(name.trim());
  while (utf8Encode(letters.join('')).length > MAX_INVITE_NAME) letters = letters.slice(0, -1);
  const bytes = utf8Encode(letters.join(''));
  const asked = `own ${relay.url} ${relay.token ?? ''}`;
  const token = madeFor.get(asked) ?? newPhoneToken();
  madeFor.set(asked, token);
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(OWN, bytes.length, ...bytes, ...sha256Bytes(utf8Encode(token))));
  } catch (error) {
    if (await fromBefore(relay, error)) return null;
    throw error;
  }
  if (reply[0] === NOT_FOUND) return null;
  if (reply[0] === FULL) throw new RelayError(t('The server gives only so many phones a token of their own a day. Try again tomorrow.'), FULL);
  check(reply, 'own');
  madeFor.delete(asked);
  return { token, name: utf8Decode(reply.slice(1)) };
}

/**
 * The public key `relay` signs coupons with for this phone (crates/erevos-relay/src/coupons.rs),
 * as SubjectPublicKeyInfo DER: null when it signs none, not for this token (a token that came with
 * a coupon, or the relay's one token), or is from before.
 */
export async function couponKey(relay: Relay): Promise<Uint8Array | null> {
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(COUPON_KEY));
  } catch (error) {
    if (await fromBefore(relay, error)) return null;
    throw error;
  }
  if (reply[0] === NOT_FOUND) return null;
  check(reply, 'coupon');
  return reply.slice(1);
}

/**
 * The relays `relay` is paired with (crates/erevos-relay coupons.rs, EREVOS_RELAY_PAIR): ones that
 * take its coupons, which a space with no home relay takes by itself (lib/pair.ts). None when it
 * names none, signs no coupons for this token, or is from before.
 */
export async function relayPair(relay: Relay): Promise<string[]> {
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(PAIR));
  } catch (error) {
    if (await fromBefore(relay, error)) return [];
    throw error;
  }
  if (reply[0] === NOT_FOUND) return [];
  check(reply, 'pair');
  return pairOf(reply);
}

/** The addresses of a reply to PAIR: OK, a count, then each after its 2-byte length; only those
 *  that are relay addresses (ws:// or wss://). */
export function pairOf(reply: Uint8Array): string[] {
  const out: string[] = [];
  let at = 2;
  for (let i = 0; i < (reply[1] ?? 0) && at + 2 <= reply.length; i++) {
    const length = (reply[at] << 8) | reply[at + 1];
    at += 2;
    if (at + length > reply.length) break;
    const url = utf8Decode(reply.slice(at, at + length)).trim();
    at += length;
    if (url.length <= 255 && /^wss?:\/\/[^\s/?#]+(\/[^\s?#]*)?$/i.test(url)) out.push(url);
  }
  return out;
}

/** Has `relay` sign a blinded coupon with this phone's token: the blind signature. Throws FULL when
 *  this phone had all the coupons it may signed today. */
export async function signCoupon(relay: Relay, blinded: Uint8Array): Promise<Uint8Array> {
  const reply = await request(relay, Uint8Array.of(COUPON_SIGN, blinded.length >> 8, blinded.length & 0xff, ...blinded));
  if (reply[0] === FULL) throw new RelayError(t('Your server signs only a few coupons a day for each phone. Erevos tries again tomorrow.'), FULL);
  if (reply[0] === NOT_FOUND) throw new RelayError(t('Your server signs no coupons for this phone.'), NOT_FOUND);
  check(reply, 'coupon');
  return reply.slice(1);
}

/** The relay a backup relay's coupon requests go to: its /join path, reached as `tor` says. */
function joinOf(url: string, tor: boolean): Relay {
  return { ...relayPath(url, '/join'), ...(tor ? { tor: true } : {}) };
}

/** The SHA-256 of each issuer's key whose coupons the relay at `url` takes, through Tor when `tor`:
 *  none when it takes no coupons, or is from before. */
export async function couponIssuers(url: string, tor: boolean): Promise<Uint8Array[]> {
  const relay = joinOf(url, tor);
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(COUPON_KEYS));
  } catch (error) {
    if (await fromBefore(relay, error)) return [];
    throw error;
  }
  if (reply[0] === NOT_FOUND) return [];
  check(reply, 'coupon');
  const count = reply[1] ?? 0;
  if (reply.length !== 2 + 32 * count) throw new RelayError('coupon: unexpected reply');
  return Array.from({ length: count }, (_, i) => reply.slice(2 + 32 * i, 34 + 32 * i));
}

/** A coupon finished, to take to a backup relay: the SHA-256 of its issuer's key, and its nonce,
 *  message randomizer and signature. */
export type Coupon = { issuer: Uint8Array; nonce: Uint8Array; randomizer: Uint8Array; signature: Uint8Array };

/**
 * Takes `coupon` to the relay at `url`, through Tor when `tor`, for a line for `token` there,
 * a token this phone made for it: the name on the line. The same again is answered again. Throws
 * when the relay does not take it (NOT_FOUND), it was taken with another token (WRONG), or the
 * relay has all the lines from coupons it may (FULL).
 */
export async function redeemCoupon(url: string, tor: boolean, coupon: Coupon, token: string): Promise<string> {
  const { issuer, nonce, randomizer, signature } = coupon;
  // On circuits of its own, new each time: none the token is used on later, nor any other coupon's.
  const reply = await request(
    joinOf(url, tor),
    Uint8Array.of(COUPON_REDEEM, ...issuer, ...nonce, ...randomizer, signature.length >> 8, signature.length & 0xff, ...signature, ...sha256Bytes(utf8Encode(token))),
    undefined,
    tor ? `coupon ${toHex(randomBytes(8))}` : undefined,
  );
  if (reply[0] === NOT_FOUND) throw new RelayError(t('The home server does not take coupons from your server.'), NOT_FOUND);
  if (reply[0] === WRONG) throw new RelayError(t('This coupon was taken already.'), WRONG);
  if (reply[0] === FULL) throw new RelayError(t('The home server gives no more tokens for coupons now.'), FULL);
  check(reply, 'coupon');
  return utf8Decode(reply.slice(1));
}

/**
 * Whether the relay at `url` lets phones sign in with a provider for a token of their own: the
 * provider's name, and the page the browser opens to sign in. Null when it does not, is from
 * before signing in, or cannot be reached now. Asked on the /join path, which needs no token.
 * The page must be an https:// one on the relay's own host (lib/relay-signin.ts, isSignInPage).
 */
export async function signInOffer(url: string): Promise<{ name: string; start: string } | null> {
  let reply: Uint8Array;
  try {
    reply = await request(relayPath(url, '/join'), Uint8Array.of(SIGN_IN));
  } catch {
    return null;
  }
  if (reply[0] !== OK || reply.length < 4) return null;
  const at = 2 + reply[1];
  const name = utf8Decode(reply.slice(2, at));
  const start = utf8Decode(reply.slice(at + 2, at + 2 + ((reply[at] << 8) | reply[at + 1])));
  if (!name.trim() || !isSignInPage(url, start)) return null;
  return { name, start };
}

/**
 * Claims, on the relay at `url`, what was signed in in the browser with the claim secret `claim`
 * (64 hex characters) and the six digits `code` the relay's page showed: makes a token of this
 * phone's own and has the relay add a line for it, in place of the line of `oldToken`, this phone's
 * token before on that relay (lib/relay-signin.ts, oldToken), when that line is the same account's.
 * Returns the token and the name on its line; `wrong` with the tries left when the code is not the
 * page's, the sign-in being over at none; null when nothing was signed in with that secret yet, or
 * `code` is not six digits. Throws when the account has all the phones it may there (FULL), or the
 * relay cannot be reached.
 */
export async function claimSignIn(
  url: string,
  claim: string,
  code: string,
  oldToken = '',
): Promise<{ token: string; name: string } | { wrong: number } | null> {
  const digits = code.replace(/\s/g, '');
  if (!/^[0-9a-f]{64}$/.test(claim) || !/^\d{6}$/.test(digits)) return null;
  const token = madeFor.get(claim) ?? newPhoneToken();
  madeFor.set(claim, token);
  const old = oldToken.trim() && !isLentToken(oldToken) ? sha256Bytes(utf8Encode(oldToken.trim())) : new Uint8Array(32);
  const secret = Uint8Array.from(claim.match(/../g)!, (pair) => parseInt(pair, 16));
  const reply = await request(
    relayPath(url, '/join'),
    Uint8Array.of(CLAIM, ...secret, ...sha256Bytes(utf8Encode(token)), ...old, ...utf8Encode(digits)),
  );
  if (reply[0] === NOT_FOUND) return null;
  if (reply[0] === WRONG && reply.length === 2) return { wrong: reply[1] };
  if (reply[0] === FULL) throw new RelayError(t('This account is signed in on all the phones it may be on this server. Ask whoever runs it to take one off.'), FULL);
  check(reply, 'claim');
  madeFor.delete(claim);
  return { token, name: utf8Decode(reply.slice(1)) };
}

// A relay from before a request closes the connection, as for any it does not know: then one that
// answers a plain request (`plain`, KEY unless another is given) is from before it. Throws what
// failed when that relay cannot be reached.
async function fromBefore(relay: Relay, error: unknown, plain = Uint8Array.of(KEY)): Promise<boolean> {
  if (!(error instanceof RelayUnreachableError)) return false;
  await request(relay, plain).catch(() => {
    throw error;
  });
  return true;
}

/** Deletes the queue. Later sends to it fail. */
export async function deleteQueue(relay: Relay, recipientId: Uint8Array): Promise<void> {
  const bytes = new Uint8Array(1 + 24);
  bytes[0] = DELETE;
  bytes.set(recipientId, 1);
  check(await request(relay, bytes), 'delete');
}

/** Whether `token` is a lent token, for a place lent on a relay, rather than the relay's own token:
 *  `lent.` and, in hex, its ticket's nonce, its own nonce and its code (crates/erevos-relay lend.rs). */
export function isLentToken(token: string | undefined): boolean {
  return !!token && /^lent\.[0-9a-f]{96}$/.test(token.trim());
}

/** Whether `text` is a ticket for a place on a relay, as a contact link carries. */
export function isTicket(text: string): boolean {
  return /^ticket\.[0-9a-f]{80}$/.test(text);
}

/** When a ticket expires, in milliseconds. */
export function ticketExpires(ticket: string): number {
  return parseInt(ticket.slice(7, 23), 16) * 1000;
}

/** The path of the relay at `url` that other relays use: `/sealed` for sealed sends, `/files` for files; `/join`, where a
 *  phone takes an invite; and `/read`, where a phone reads its queues (readQueues). No token. */
export function relayPath(url: string, path: '/sealed' | '/files' | '/join' | '/read'): Relay {
  return { url: `${url.trim().replace(/\/+$/, '')}${path}` };
}

/** Relay addresses that differ only in case or a trailing slash are the same relay. */
export function sameRelay(a: string, b: string): boolean {
  const plain = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();
  return plain(a) === plain(b);
}

/** One connection to a relay for many requests, each answered before the next goes. */
export class RelaySession {
  private readonly line: Line;
  // The channel its messages go in, when the relay's key is known (see Channels above).
  private readonly channel: Channel | null;
  private last: Promise<unknown> = Promise.resolve();

  private constructor(line: Line, channel: Channel | null) {
    this.line = line;
    this.channel = channel;
  }

  /** Opens it; `files` for the requests of files, which go through Tor only the way 'all'. */
  static async open(relay: Relay, files = false): Promise<RelaySession> {
    if (stopped && clearing === 0) throw new SpaceStoppedError();
    // As a single request (requestOnce): an address that may come from a contact, never opened unread.
    if (!isRelayAddress(relay.url)) throw new BadRelayAddressError(relay.url);
    if (relay.tor && !canTor()) throw new RelayUnreachableError(t('This server is reached only through Tor, which this build of Erevos does not have.'));
    if (relay.torChat && !canTor()) throw new RelayUnreachableError(t('This chat goes only through Tor, which this build of Erevos does not have.'));
    if (relay.torChat) await torStarter?.();
    const throughTor = torTo(relay, files);
    const pin = channelPin(relay);
    if (pin) {
      try {
        const { line, channel, reply } = await openChannel(relay, pin, throughTor, null);
        if (reply[0] === OK) return new RelaySession(line, channel);
        line.close();
        throw new RelayUnreachableError(t('cannot reach the server at {url}, or the token is wrong', { url: relay.url }));
      } catch (error) {
        if (!mayGoWithout(error, pin)) throw error;
      }
    }
    const line = await plainLine(relay, throughTor);
    // No channel there: a relay from before them, or none could be reached.
    if (pin) noChannelAt(relay.url);
    return new RelaySession(line, null);
  }

  /** Sends one request after the ones before it are answered, and returns its reply. */
  call(bytes: Uint8Array): Promise<Uint8Array> {
    try {
      refuseStopped(bytes);
    } catch (error) {
      return Promise.reject(error);
    }
    const within = answerWithin(bytes);
    // A reply that does not come in time ends the connection, and so every request after it; in a
    // channel, so does one it does not hold, as the counts of its messages no longer match.
    const reply = this.last.then(async () => {
      const channel = this.channel;
      if (!channel) return this.line.call(bytes, within);
      try {
        return channel.open(await this.line.call(channel.seal(bytes), within));
      } catch (error) {
        this.line.close();
        throw error;
      }
    });
    this.last = reply.catch(() => undefined);
    return reply;
  }

  close(): void {
    this.line.close();
  }
}

/**
 * Queues messages one after another as `sendMessage` does, each with its `mark`, those for one
 * relay on one connection (RelaySession), until `close`: the copies of what a chat sealed for the
 * endpoints of a contact's account, which go to the same few relays (lib/fanout.ts). One through a
 * second relay (`via`), or one a connection could not take, goes as `sendMessage` sends it, with
 * its fallbacks.
 */
export class RelaySends {
  private readonly sessions = new Map<string, Promise<RelaySession | null>>();

  async send(relay: Relay, senderId: Uint8Array, message: Uint8Array, mark?: Mark): Promise<void> {
    // A chat that goes only through Tor, on its own circuits: never on a connection shared with others.
    if (relay.via || message.length > MAX_MESSAGE || torChatSenders.has(toHex(senderId))) return sendMessage(relay, senderId, message, mark);
    const key = `${relay.url}\n${relay.token ?? ''}`;
    let opened = this.sessions.get(key);
    if (!opened) {
      opened = RelaySession.open(relay).catch(() => null);
      this.sessions.set(key, opened);
    }
    const session = await opened;
    if (session) {
      try {
        const { bytes } = await sendRequest(relay, senderId, message);
        check(await session.call(marked(bytes, mark)), 'send');
        return;
      } catch (error) {
        // What the relay answered stands, unless there is somewhere else to try; a connection
        // lost is opened again for the next.
        if (error instanceof RelayUnreachableError) this.sessions.delete(key);
        else if (!relay.fallback?.length) throw error;
      }
    }
    return sendMessage(relay, senderId, message, mark);
  }

  close(): void {
    for (const opened of this.sessions.values()) void opened.then((session) => session?.close());
    this.sessions.clear();
  }
}

function checkFile(reply: Uint8Array, what: string): void {
  if (reply[0] === OK) return;
  if (reply[0] === NOT_FOUND) throw new RelayError(t('{what}: the file is not on the server any more', { what }), NOT_FOUND);
  if (reply[0] === FULL) throw new RelayError(t('{what}: the server has no room for files now, try again later', { what }), FULL);
  // A free place on the server (an open place) moves so many megabytes of files a day.
  if (reply[0] === DAY_FULL) throw new RelayError(t('{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.', { what }), DAY_FULL);
  if (reply[0] === FAILED) throw new RelayError(t('{what}: the server could not keep it, try again later', { what }), FAILED);
  if (reply[0] === UNREACHABLE) throw new RelayError(t('{what}: your server could not reach the server the file is on', { what }), UNREACHABLE);
  throw new RelayError(`${what}: unexpected reply ${reply[0]}`, reply[0]);
}

// A relay from before files closes the connection at a file request.
function older(error: unknown): unknown {
  if (error instanceof RelayError && error.status === undefined) {
    return new RelayError(t('{reason}. A server older than this app cannot take files: update it.', { reason: error.message }));
  }
  return error;
}

/**
 * Puts one chunk of an encrypted file on the relay, and returns its id. With `from` (milliseconds),
 * for a file in a message sent for later, its time on the relay starts then instead of now.
 */
export async function putChunk(session: RelaySession, chunk: Uint8Array, from = 0): Promise<Uint8Array> {
  if (chunk.length > MAX_CHUNK) throw new RelayError('chunk is too large');
  const head = from > 0 ? 9 : 1;
  const bytes = new Uint8Array(head + 4 + chunk.length);
  bytes[0] = from > 0 ? FILE_KEEP : FILE_PUT;
  if (from > 0) putSeconds(new DataView(bytes.buffer), 1, from);
  new DataView(bytes.buffer).setUint32(head, chunk.length);
  bytes.set(chunk, head + 4);
  const reply = await session.call(bytes).catch((error) => {
    throw older(error);
  });
  checkFile(reply, 'send');
  if (reply.length !== 25) throw new RelayError('send: unexpected reply');
  return reply.slice(1);
}

// A file request, through our relay to the relay at `via` when the chunk is there.
function fileRequest(op: number, id: Uint8Array, via?: string): Uint8Array {
  if (!via) return Uint8Array.of(op, ...id);
  const address = utf8Encode(via);
  const bytes = new Uint8Array(1 + 2 + address.length + 1 + id.length);
  bytes[0] = FILE_VIA;
  new DataView(bytes.buffer).setUint16(1, address.length);
  bytes.set(address, 3);
  bytes[3 + address.length] = op;
  bytes.set(id, 4 + address.length);
  return bytes;
}

/** Takes one chunk, from our relay or, with `via`, from that relay through ours. Null if it is gone. */
export async function getChunk(session: RelaySession, id: Uint8Array, via?: string): Promise<Uint8Array | null> {
  const reply = await session.call(fileRequest(FILE_GET, id, via)).catch((error) => {
    throw older(error);
  });
  if (reply[0] === NOT_FOUND) return null;
  checkFile(reply, 'receive');
  const length = reply.length >= 5 ? new DataView(reply.buffer, reply.byteOffset, reply.byteLength).getUint32(1) : -1;
  if (length !== reply.length - 5) throw new RelayError('receive: unexpected reply');
  return reply.slice(5);
}

/** Deletes one chunk, as `getChunk` finds it. False if it was gone already. */
export async function deleteChunk(session: RelaySession, id: Uint8Array, via?: string): Promise<boolean> {
  const reply = await session.call(fileRequest(FILE_DELETE, id, via));
  if (reply[0] === NOT_FOUND) return false;
  checkFile(reply, 'delete');
  return true;
}

/** A call relay (TURN server) and credentials for it, as WebRTC takes them. */
export type CallRelay = { urls: string[]; username: string; credential: string };

// The call relay as last asked, for each relay and token: its credentials last hours (the relay's
// LIFETIME, crates/erevos-relay/src/turn.rs, their username being when they end), so a call does
// not wait for the relay to be asked first, which over a slow network took seconds on each phone,
// the one called before it even rang. Kept while CALL_RELAY_LEFT is left of them; one with no end
// to read, or a relay with none, for CALL_RELAY_KEEP.
const CALL_RELAY_LEFT = 60 * 60_000;
const CALL_RELAY_KEEP = 10 * 60_000;
const callRelays = new Map<string, { relay: CallRelay | null; until: number }>();
const callRelaysAsked = new Map<string, Promise<CallRelay | null>>();

/** Until when a call relay as asked may be used for a call, milliseconds: an hour before its credentials end. */
export function callRelayUntil(relay: CallRelay | null, now = Date.now()): number {
  const ends = relay ? Number(/^\d{9,12}(?=$|:)/.exec(relay.username)?.[0] ?? NaN) * 1000 : NaN;
  return Number.isFinite(ends) ? Math.min(ends - CALL_RELAY_LEFT, now + 24 * 60 * 60_000) : now + CALL_RELAY_KEEP;
}

/** Credentials for the call relay beside the relay, or null if it has none: as asked before while
 *  they still last, else asked now (askCallRelay). */
export function callRelay(relay: Relay, now = Date.now()): Promise<CallRelay | null> {
  // A lent place gets none.
  if (isLentToken(relay.token)) return Promise.resolve(null);
  const key = `${relay.url}\n${relay.token ?? ''}`;
  const kept = callRelays.get(key);
  if (kept && kept.until > now) return Promise.resolve(kept.relay);
  const asking = callRelaysAsked.get(key);
  if (asking) return asking;
  const asked = askCallRelay(relay)
    .then((got) => {
      callRelays.set(key, { relay: got, until: callRelayUntil(got) });
      return got;
    })
    .finally(() => callRelaysAsked.delete(key));
  callRelaysAsked.set(key, asked);
  return asked;
}

/** Forgets the call relays as asked (callRelay), so the next call asks anew: as when a call
 *  through one could not connect, its credentials perhaps no longer taken (a new secret there, or
 *  this phone's clock far off from the relay's). */
export function forgetCallRelays(): void {
  callRelays.clear();
}

/** Asks the relay for its call relay now, ahead of a call (callRelay): nothing when it was asked already. */
export function warmCallRelay(relay: Relay): void {
  void callRelay(relay).catch(() => undefined);
}

/** Asks the relay for credentials for the call relay beside it, or null if it has none. */
export async function askCallRelay(relay: Relay): Promise<CallRelay | null> {
  if (isLentToken(relay.token)) return null;
  const reply = await request(relay, Uint8Array.of(CALL_RELAY));
  if (reply[0] === NOT_FOUND) return null;
  check(reply, 'call relay');
  const view = new DataView(reply.buffer, reply.byteOffset, reply.byteLength);
  let at = 1;
  const short = () => {
    if (at + 2 > reply.length) throw new RelayError('call relay: unexpected reply');
    const length = view.getUint16(at);
    if (at + 2 + length > reply.length) throw new RelayError('call relay: unexpected reply');
    const text = utf8Decode(reply.slice(at + 2, at + 2 + length));
    at += 2 + length;
    return text;
  };
  const username = short();
  const credential = short();
  const count = reply[at++] ?? 0;
  const urls = Array.from({ length: count }, short).filter((url) => /^turns?:/.test(url));
  return urls.length > 0 ? { urls, username, credential } : null;
}

/** The relay's key for Web Push, or null if it does not push (an older relay closes the
 *  connection at an opcode it does not know, which is the same answer). */
export async function pushKey(relay: Relay): Promise<Uint8Array | null> {
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(PUSH_KEY));
  } catch (error) {
    if (error instanceof RelayUnreachableError) return null;
    throw error;
  }
  if (reply[0] === NOT_FOUND) return null;
  check(reply, 'push key');
  return reply.slice(1);
}

/** The name XMPP servers push to at the relay (XEP-0357, crates/erevos-relay xmpp_push.rs), or null
 *  when it takes no XMPP pushes (an older relay closes the connection at an opcode it does not know,
 *  which is the same answer). */
export async function xmppPushName(relay: Relay): Promise<string | null> {
  let reply: Uint8Array;
  try {
    reply = await request(relay, Uint8Array.of(XMPP_PUSH));
  } catch (error) {
    if (error instanceof RelayUnreachableError) return null;
    throw error;
  }
  if (reply[0] === NOT_FOUND) return null;
  check(reply, 'xmpp push');
  const name = utf8Decode(reply.slice(1));
  return /^[a-z0-9.-]{1,253}$/.test(name) ? name : null;
}

/** A browser's keys for its push address (PushSubscription.getKey): its P-256 key, 65 bytes, and
 *  its authentication secret, 16 bytes. */
export type PushKeys = { p256dh: Uint8Array; auth: Uint8Array };

/** Asks the relay for a push to `endpoint` whenever a message comes into the queue, or for none
 *  when `endpoint` is empty. With the browser's `keys`, a relay that counts puts in each push how
 *  many messages came, encrypted for the browser: true when it said it will. An older relay takes
 *  the address alone, and its pushes are empty. */
export async function setPush(relay: Relay, recipientId: Uint8Array, endpoint: string, keys?: PushKeys): Promise<boolean> {
  const { bytes, sent } = pushSetBytes(recipientId, endpoint, keys);
  const reply = await request(relay, bytes);
  check(reply, 'push');
  return sent > 0 && reply[1] === 1;
}

/** Asks as setPush does for each of many queues, one after another on one connection (RelaySession):
 *  for each, null once the relay took it, or the error it gave for that one, as for a queue it does
 *  not have. Throws when it cannot be reached; a connection lost partway gives the rest that error. */
export async function setPushes(relay: Relay, recipientIds: Uint8Array[], endpoint: string, keys?: PushKeys): Promise<(Error | null)[]> {
  if (recipientIds.length === 0) return [];
  const session = await RelaySession.open(relay);
  try {
    const answers: (Error | null)[] = [];
    for (const id of recipientIds) {
      try {
        check(await session.call(pushSetBytes(id, endpoint, keys).bytes), 'push');
        answers.push(null);
      } catch (error) {
        answers.push(error instanceof Error ? error : new Error(String(error)));
      }
    }
    return answers;
  } finally {
    session.close();
  }
}

// A PUSH_SET request, and how many bytes of the browser's keys it carries.
function pushSetBytes(recipientId: Uint8Array, endpoint: string, keys?: PushKeys): { bytes: Uint8Array; sent: number } {
  const address = utf8Encode(endpoint);
  const sent = keys && endpoint ? keys.p256dh.length + keys.auth.length : 0;
  const bytes = new Uint8Array(1 + 24 + 2 + address.length + sent);
  bytes[0] = PUSH_SET;
  bytes.set(recipientId, 1);
  new DataView(bytes.buffer).setUint16(25, address.length);
  bytes.set(address, 27);
  if (keys && sent) {
    bytes.set(keys.p256dh, 27 + address.length);
    bytes.set(keys.auth, 27 + address.length + keys.p256dh.length);
  }
  return { bytes, sent };
}
