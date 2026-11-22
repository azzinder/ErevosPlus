// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A Matrix account inside Erevos (docs/matrix.md): Erevos talks to the person's homeserver itself,
// as Element does, so chats with people on Matrix stay encrypted from end to end. No bridge reads
// them on the way. The homeserver still sees who talks with whom and when, so these chats are not
// anonymous, and the app says so on them.
//
// This file holds the account and does the talking to the homeserver (the Client-Server API, v3);
// the keys and the encryption are the core's (crates/erevos-matrix, through lib/core.ts
// matrixCore): Olm between two devices, Megolm for a room's messages. Everything the account
// needs, its keys and sessions included, is one JSON state (MatrixState), which the app keeps
// sealed with the rest of the space and hands back here.
//
// What it does:
//  - Signs in with a password (signIn), as a new device named Erevos, publishes the device's keys,
//    and, when the account has none yet, its cross-signing keys, signing this device with them.
//  - Syncs (sync): rooms, members, names, messages, invites, and the keys other devices send.
//  - Sends a text (sendText): in an encrypted room, it first gives the room's current Megolm key
//    to every device of every member that does not have it yet, through Olm, then sends. A device
//    new in someone's list gets it too, and the room says so; one that came back with other keys
//    gets nothing more.
//  - Opens a room message only with a key its sender gave, through Olm, from a device of theirs:
//    one restored from the key backup, or from a device not known yet, opens it as not verified.
//  - Starts a chat with someone (startChat), joins, leaves, marks as read, signs out.
//  - Shows a sticker (m.sticker) as a picture of its own, fetched as a photo is; keeps who may do
//    what in each room (m.room.power_levels, and in rooms of version 12 who made it), for
//    lib/matrix-power.ts to say.
//  - Passes the steps of a check by emoji, to-device or in a room, to lib/matrix-verify.ts.
//  - Passes a call's events to lib/matrix-calls.ts, and a room's events to Element Call while it
//    shows that room (lib/matrix-widget.ts), with what Element Call asks of the homeserver.
//
// Photos and files are lib/matrix-media.ts's; the key backup and secret storage,
// lib/matrix-backup.ts's. Not audited.

import type { ChatNotify } from '../lock/chat-notify';
import type { ChatPin } from '../lock/chat-pin';
import type { Look } from '../theme/look';
import type { ChatRules } from './chat-rules';
import { deviceLine } from './call-lines';
import { canTorHttp, matrixCore, torHttp } from './core';
import type { MatrixBackup } from './matrix-backup';
import type { MatrixPush } from './matrix-push';
import { randomBytes, toHex, utf8Decode, utf8Encode } from './crypto';
import type { Place, Poll, Preview } from './chat-parts';
import type { ChatWriting } from './chat-writing';
import { t } from './i18n';
import { formattedOf, styledOf } from './matrix-html';
import type { StyledPart } from './text-style';
import { cleanStatus, type NetPresence } from './net-presence';
import {
  endContent,
  endPoll,
  locationContent,
  placeOfContent,
  POLL_END,
  POLL_RESPONSE,
  POLL_START,
  pollContent,
  pollOfContent,
  pollOver,
  previewOfContent,
  takeVote,
  threadOf,
  threadRelation,
  voteContent,
  votedOf,
  type MatrixPoll,
} from './matrix-parts';
import { creatorsOf, powerOfContent, type MatrixPower } from './matrix-power';
import { fetchCapped, HTTP_MOST, HttpTooLargeError } from './net-http';
import { ensureTor } from './tor';
import { ACCOUNT_TOR_DEFAULT, accountNeverStraight, accountThroughTor, AccountTorError, accountTorOf, effectiveTor, type AccountTor } from './account-tor';
import { editionName } from './edition';

/** The olm and megolm algorithms, as Matrix names them. */
export const OLM = 'm.olm.v1.curve25519-aes-sha2';
export const MEGOLM = 'm.megolm.v1.aes-sha2';

/** How many messages of each room the account keeps, newest last. */
export const KEEP_MESSAGES = 300;

/** A room's Megolm key goes out of use after this many messages, or this long, as Matrix advises. */
export const ROTATE_MESSAGES = 100;
export const ROTATE_MS = 7 * 24 * 3600_000;

/** How many read message indexes are kept against replays. */
export const KEEP_SEEN = 5000;

export type Json = Record<string, unknown>;

/** One message in a room, as Erevos shows it. */
export type MatrixMessage = {
  id: string;
  sender: string;
  ts: number;
  text: string;
  /** Still locked: the key for it has not come (yet). Kept to try again as keys come. */
  locked?: { sessionId: string; ciphertext: string; senderKey: string };
  /** Ours, while the homeserver has not taken it, or when it refused it. */
  state?: 'sending' | 'failed';
  /** A photo, a video, a sound or a file: where it is, and its key when the room is encrypted (lib/matrix-media.ts). */
  file?: MatrixFile;
  /** A call's line, kept here only: its text in English, shown by lib/call-lines.ts. */
  call?: true;
  /** Reactions to it (m.annotation), by their key, an emoji: who chose each. */
  reactions?: Record<string, string[]>;
  /** The message it answers (m.in_reply_to). */
  replyTo?: string;
  /** When its writer changed it after it went (m.replace). */
  edited?: number;
  /** Taken back (redacted): what it said is gone. */
  deleted?: true;
  /** A poll, with the votes on it (lib/matrix-parts.ts). */
  poll?: MatrixPoll;
  /** A place sent once (m.location). */
  place?: Place;
  /** The preview of a link in its words, as the sender's phone made it (MSC4095). */
  preview?: Preview;
  /** The thread it is in, by its first message's ID (m.thread): it shows there, not in the room's thread. */
  thread?: string;
  /** For a thread's first message, how many answers it has, as the homeserver last counted them. */
  threadCount?: number;
  /** Opened with a key whose sender's device is not known for sure: one restored from the key
   *  backup, or sent by a device not known yet (openMegolm). */
  unverified?: true;
  /** A sticker (m.sticker): its picture is `file`, its words what it shows. */
  sticker?: true;
  /** How its words look, as its HTML (formatted_body) says, when that changes their look (lib/matrix-html.ts). */
  styled?: StyledPart[];
  /** Ours, sent on from another chat: marked so here only, as Matrix has no mark for it that does not tell where it came from. */
  forwarded?: true;
};

/** The key and checks of an encrypted file, as Matrix writes them (EncryptedFile). */
export type EncryptedFile = { url: string; key: { kty: 'oct'; key_ops: string[]; alg: 'A256CTR'; k: string; ext: true }; iv: string; hashes: { sha256: string }; v: 'v2' };

export type MatrixFile = {
  kind: 'image' | 'video' | 'audio' | 'file';
  name: string;
  mime: string;
  size?: number;
  w?: number;
  h?: number;
  /** An mxc:// address, for a file sent in the clear. */
  url?: string;
  encrypted?: EncryptedFile;
  /** A voice message (MSC3245), how long it is, ms, and how it is drawn, 0 to 1024 a bar (MSC3246). */
  voice?: true;
  duration?: number;
  waveform?: number[];
};

export type MatrixRoom = {
  id: string;
  /** Its name, or for a chat with one person, theirs. */
  name: string;
  /** Members by their Matrix ID: 'join' or 'invite', with their display name. */
  members: Record<string, { membership: 'join' | 'invite'; name?: string; avatar?: string }>;
  /** «Through Tor»: on, the whole account goes only through Tor while it is (matrixWayOf). */
  tor?: true;
  /** Its picture (m.room.avatar), an mxc:// address; members' are theirs (avatar_url). */
  avatar?: string;
  encrypted: boolean;
  direct: boolean;
  unread: number;
  /** When it was last read, here (markRead) or on another of our devices (our receipt, or a message
   *  of ours from there): the homeserver's count, until it hears of that, says nothing new unless a
   *  message from someone else came after it. */
  readTs?: number;
  messages: MatrixMessage[];
  /** Set while we are only invited: who asked. */
  invitedBy?: string;
  /** Its own notifications (lock/chat-notify.ts), kept on this device only. */
  notify?: ChatNotify;
  /** Its own look (theme/look.ts), kept on this device only; missing while it takes the space's. */
  look?: Look;
  /** A name of our own for it, given here and kept on this device only (shownRoomName): nobody is told. */
  own?: string;
  /** The PIN it opens with, as kept, and its screenshots blocked (lib/chat-protect.ts), on this device only. */
  pin?: ChatPin;
  shots?: true;
  /** Reactions by their own event ID, so one taken back comes off its message. */
  reactionsBy?: Record<string, { target: string; key: string; sender: string }>;
  /** Where its older messages are to be fetched from (/messages), once the homeserver said. */
  before?: string;
  /** Its first message is here: there is nothing older. */
  start?: true;
  /** How many messages it keeps, more than KEEP_MESSAGES once older ones were fetched. */
  keep?: number;
  /** Reactions and changes fetched from before ahead of the message they are for. */
  waiting?: { id: string; sender: string; ts: number; type: string; content: Json }[];
  /** The messages pinned to its top (m.room.pinned_events), the latest last. */
  pinned?: string[];
  /** Its tags in our account (m.tag): one of our favourites, or of low priority. */
  tags?: { favourite?: true; low?: true };
  /** A space (m.space): a room that holds other rooms, not a chat. */
  space?: true;
  /** Who may join it (m.room.join_rules): anyone ('public'), or only those asked or let in
   *  ('other'). Not known yet for a room joined before Erevos kept it (lib/public-feed.ts asks). */
  joins?: 'public' | 'other';
  /** What it is about (m.room.topic), and the address it is known by (m.room.canonical_alias). */
  topic?: string;
  alias?: string;
  /** How far each other member read it, as the homeserver last said (m.receipt, m.read): the event
   *  they read up to, and when. Only members it lists, the latest MOST_READERS. */
  readBy?: Record<string, { event: string; ts: number }>;
  /** Who may do what in it (m.room.power_levels), once the homeserver said (lib/matrix-power.ts). */
  power?: MatrixPower;
  /** In a room of version 12 on, those who made it, above every level (m.room.create). */
  creators?: string[];
  /** Its disappearing messages and those deleted on this device only (lib/matrix-rules.ts), kept here only. */
  rules?: ChatRules;
};

/** The most members a room keeps how far they read. */
export const MOST_READERS = 200;

/** The most messages a room keeps, however many older ones were fetched. */
export const MOST_KEPT = 2000;
/** The most reactions and changes that wait for their message. */
const MOST_WAITING = 400;

type Device = {
  curve25519: string;
  ed25519: string;
  /** It came back with other keys than these, which are not taken: nothing goes to it (queryDevices). */
  changed?: true;
  /** The next room whose key goes out says it is new, or changed its keys; then this goes. */
  unsaid?: 'new' | 'changed';
};

/** A Megolm session we read with, and who gave it: through Olm, the sender and their device's
 *  Ed25519 key (`untied` while that device was not known yet); or restored from the key backup,
 *  where nothing says who did. Kept before Erevos noted the sender, only `senderKey`. */
type Inbound = { session: Json; senderKey: string; sender?: string; ed25519?: string; untied?: true; backup?: true };

type Outbound = { session: Json; sessionId: string; created: number; count: number; sharedWith: string[] };

/** All of a Matrix account, as the app keeps it sealed. */
export type MatrixState = {
  homeserver: string;
  userId: string;
  deviceId: string;
  accessToken: string;
  /** The device's Olm account (vodozemac's pickle). */
  account: Json;
  /** Cross-signing secrets made on this device, when the account had none. */
  crossSigning?: { master: string; selfSigning: string; userSigning: string };
  since?: string;
  rooms: Record<string, MatrixRoom>;
  /** Members' devices, checked, by user then device; a user whose list changed is in `outdated`. */
  devices: Record<string, Record<string, Device>>;
  outdated: string[];
  /** Olm sessions by the other device's Curve25519 key, the newest first. */
  olm: Record<string, Json[]>;
  /** Megolm sessions we read with, by `${roomId} ${sessionId}`: the session and who gave it. */
  inbound: Record<string, Inbound>;
  /** The Megolm session we send with, by room. */
  outbound: Record<string, Outbound>;
  /** Which message index of which session has been read, by `${sessionId} ${index}`, against replays. */
  seen: Record<string, string>;
  /** What a check by emoji proved (lib/matrix-verify.ts), by user: their devices' Ed25519 keys, and their master key. */
  verified?: Record<string, { devices: Record<string, string>; master?: string }>;
  /** The key backup, once the Security Key opened it or this device set it up (lib/matrix-backup.ts). */
  backup?: MatrixBackup;
  /** Where the homeserver pushes while the space is closed, once asked to (lib/matrix-push.ts). */
  push?: MatrixPush;
  /** The restore of a backup this account was made after (lib/matrix-store.ts): '' for none. */
  restored?: string;
  /** Whether the others are told when we write (m.typing): off unless turned on, as the homeserver sees it. */
  sayTyping?: true;
  /** Whether the others see when we are online (m.presence): off unless turned on, as the homeserver sees it. */
  sayOnline?: true;
  /** Our profile picture, an mxc:// address, as last set or fetched. */
  avatar?: string;
  /** Each room's draft, and the messages held to go later, on this device only (lib/chat-writing.ts). */
  writing?: ChatWriting;
  /** Those the account blocks (m.ignored_user_list), as the homeserver last said (lib/matrix-rules.ts). */
  ignored?: string[];
  /** How this account goes through Tor (lib/account-tor.ts): absent, Off, as every account starts. */
  tor?: MatrixTor;
};

/**
 * How one Matrix account reaches its homeserver, as every account of another network does
 * (lib/account-tor.ts): 'never' (Off, the default), 'space', or 'always'. A room «Through Tor»
 * (MatrixRoom.tor) makes the whole account 'always' while it is: the account syncs on one
 * connection, which would tell the homeserver the phone's address whatever one room's sends did.
 */
export type MatrixTor = AccountTor;

/** What a request needs to reach a homeserver: where it is, the account's token once signed in, its Tor way, and its rooms (one «Through Tor» makes it 'always'). */
export type MatrixServer = { homeserver: string; accessToken?: string; tor?: MatrixTor; rooms?: Record<string, Pick<MatrixRoom, 'tor'>> };

/** Whether a room of the account goes «Through Tor». */
export function roomsThroughTor(state: { rooms?: Record<string, Pick<MatrixRoom, 'tor'>> }): boolean {
  return Object.values(state.rooms ?? {}).some((room) => room.tor === true);
}

/** The Tor way an account's requests go by now: its own, or 'always' while a room of it goes «Through Tor». */
export function matrixWayOf(state: MatrixServer): MatrixTor {
  return effectiveTor(accountTorOf(state.tor), roomsThroughTor(state));
}

// The homeserver's answer to one request.
export type MatrixAnswer = { status: number; json: Json; bytes?: Uint8Array };
export type MatrixRequest = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: unknown;
  token?: string;
  /** Bytes to send as they are (an upload), of type `contentType`, instead of JSON. */
  bytes?: Uint8Array;
  contentType?: string;
  /** Answer the bytes as they are (a download). */
  raw?: boolean;
  /** The most bytes the answer may have, HTTP_MOST unless less (lib/net-http.ts). */
  most?: number;
  /** The account's Tor way now (matrixWayOf): Off when absent. */
  tor?: MatrixTor;
};
export type MatrixHttp = (request: MatrixRequest) => Promise<MatrixAnswer>;

const headersOf = ({ token, bytes, contentType }: MatrixRequest) => {
  const headers: Record<string, string> = { 'Content-Type': bytes ? (contentType ?? 'application/octet-stream') : 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const jsonOf = (text: string): Json => {
  try {
    return text ? (JSON.parse(text) as Json) : {};
  } catch {
    return {};
  }
};

const mostOf = (asked: MatrixRequest) => Math.min(asked.most ?? HTTP_MOST, HTTP_MOST);

// Straight to the homeserver, over HTTPS; the answer read as it comes and stopped once it is too
// large (lib/net-http.ts), not taken whole.
async function straight(asked: MatrixRequest): Promise<MatrixAnswer> {
  const { method, url, body, bytes, raw } = asked;
  const sent = bytes ? (bytes as unknown as BodyInit) : body === undefined ? undefined : JSON.stringify(body);
  const { response, bytes: said } = await fetchCapped(url, { method, headers: headersOf(asked), body: sent }, mostOf(asked));
  if (raw && response.ok) return { status: response.status, json: {}, bytes: said };
  return { status: response.status, json: jsonOf(utf8Decode(said)) };
}

// Through the core's Tor (crates/erevos-tor http), on circuits kept for this homeserver.
async function viaTor(asked: MatrixRequest): Promise<MatrixAnswer> {
  const { method, url, body, bytes, raw } = asked;
  const sent = bytes ?? (body === undefined ? new Uint8Array(0) : utf8Encode(JSON.stringify(body)));
  const answer = await torHttp(JSON.stringify({ method, url, headers: headersOf(asked) }), sent);
  const status = (answer[0] << 8) | answer[1];
  const rest = answer.slice(2);
  if (rest.length > mostOf(asked)) throw new HttpTooLargeError(mostOf(asked));
  if (raw && status >= 200 && status < 300) return { status, json: {}, bytes: rest };
  return { status, json: jsonOf(utf8Decode(rest)) };
}

/**
 * How a request goes, by the account's Tor way (lib/account-tor.ts): Off, straight; As the space,
 * as the space's way says, files and media through Tor only with Everything, and straight while
 * Tor is not ready with Messages; Always, or the space's Everything, only through Tor, Tor started
 * for it when the space's way did not, and never straight. The checks put a homeserver of their
 * own here.
 */
export const defaultMatrixHttp: MatrixHttp = async (asked) => {
  const way = accountTorOf(asked.tor);
  const files = !!asked.bytes || !!asked.raw;
  const never = accountNeverStraight(way);
  if (!never && !accountThroughTor(way, files)) return straight(asked);
  if (never) {
    if (!canTorHttp()) throw new AccountTorError();
    try {
      await ensureTor();
    } catch {
      throw new AccountTorError();
    }
    return viaTor(asked);
  }
  try {
    return await viaTor(asked);
  } catch (error) {
    if (error instanceof HttpTooLargeError) throw error;
    return straight(asked);
  }
};

let http: MatrixHttp = defaultMatrixHttp;

/** Whether an account with Tor way `tor` sends its messages through Tor now. */
export function matrixThroughTor(tor: MatrixTor = ACCOUNT_TOR_DEFAULT): boolean {
  return accountThroughTor(tor);
}

export function setMatrixHttp(next: MatrixHttp): void {
  http = next;
}

/** The homeserver said no: its Matrix error code and message. */
export class MatrixError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** One call to the core's Matrix part (crates/erevos-matrix). */
export async function core<T extends Json>(op: string, request: Json): Promise<T> {
  const answer = await matrixCore()(utf8Encode(JSON.stringify({ op, ...request })));
  return JSON.parse(utf8Decode(answer)) as T;
}

export const enc = encodeURIComponent;

/** A new transaction ID, so a request sent again is not taken twice. */
export const txn = () => `erevos${Date.now()}${toHex(randomBytes(6))}`;

/** One request to the Client-Server API (v3), its JSON answered or the refusal thrown. */
export async function call(state: MatrixServer, method: MatrixRequest['method'], path: string, body?: unknown): Promise<Json> {
  return answered(await http({ method, url: `${state.homeserver}/_matrix/client/v3${path}`, body, token: state.accessToken || undefined, tor: matrixWayOf(state) }));
}

/** One request to the Client-Server API, its answer as it is, a refusal too: for asks that take more steps (lib/matrix-account.ts). */
export async function callAnswer(state: MatrixServer, method: MatrixRequest['method'], path: string, body?: unknown): Promise<MatrixAnswer> {
  return http({ method, url: `${state.homeserver}/_matrix/client/v3${path}`, body, token: state.accessToken || undefined, tor: matrixWayOf(state) });
}

/** Throws the homeserver's refusal, as `call` does, or answers what it said. */
export function answeredJson(answer: MatrixAnswer): Json {
  return answered(answer);
}

/** One request to a part of the Client-Server API still unstable, under the MSC that names it. */
async function unstable(state: MatrixServer, feature: string, method: MatrixRequest['method'], path: string, body?: unknown): Promise<Json> {
  return answered(await http({ method, url: `${state.homeserver}/_matrix/client/unstable/${feature}${path}`, body, token: state.accessToken, tor: matrixWayOf(state) }));
}

/** One request as it is (lib/matrix-media.ts), the homeserver's refusal thrown. */
export async function request(state: MatrixServer, asked: Omit<MatrixRequest, 'token' | 'tor'>): Promise<MatrixAnswer> {
  const answer = await http({ ...asked, token: state.accessToken, tor: matrixWayOf(state) });
  answered(answer);
  return answer;
}

function answered(answer: MatrixAnswer): Json {
  if (answer.status >= 200 && answer.status < 300) return answer.json;
  throw new MatrixError(answer.status, String(answer.json.errcode ?? 'M_UNKNOWN'), String(answer.json.error ?? t('The Matrix server refused the request.')));
}

/** Whether `id` looks like a Matrix ID: @name:server. */
export function isMatrixId(id: string): boolean {
  return /^@[^:\s]+:[^\s]+$/.test(id.trim());
}

/** The homeserver of a server name or Matrix ID, as its /.well-known/matrix/client says, or the server itself. */
export async function findHomeserver(nameOrId: string, tor?: MatrixTor): Promise<string> {
  const given = nameOrId.trim();
  const server = isMatrixId(given) ? given.slice(given.indexOf(':') + 1) : given.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!server) throw new Error(t('Write a Matrix server or a Matrix ID, such as @name:matrix.org.'));
  try {
    const answer = await http({ method: 'GET', url: `https://${server}/.well-known/matrix/client`, tor });
    const base = (answer.json['m.homeserver'] as Json | undefined)?.base_url;
    if (answer.status === 200 && typeof base === 'string' && /^https:\/\//.test(base)) return base.replace(/\/+$/, '');
  } catch {
    // No well-known: the server answers itself.
  }
  return `https://${server}`;
}

function userPart(nameOrId: string): string {
  const given = nameOrId.trim();
  return isMatrixId(given) ? given.slice(1, given.indexOf(':')) : given.replace(/^@/, '');
}

/**
 * Signs in to `homeserver` as a new device, and publishes its keys. When the account has no
 * cross-signing keys yet, it makes them and signs this device with them, with the same password,
 * so other people's apps trust this device as the account's own.
 */
export async function signIn(homeserver: string, user: string, password: string, tor?: MatrixTor): Promise<MatrixState> {
  const identifier = { type: 'm.id.user', user: userPart(user) };
  const login = await call({ homeserver, tor }, 'POST', '/login', {
    type: 'm.login.password',
    identifier,
    password,
    initial_device_display_name: editionName(),
  });
  return newDevice(homeserver, login, { type: 'm.login.password', identifier, password }, tor);
}

/** The ways a homeserver lets one sign in: a password, and single sign-on with its providers. */
export type LoginWays = { password: boolean; sso: { id: string; name: string }[] | null };

export async function loginWays(homeserver: string, tor?: MatrixTor): Promise<LoginWays> {
  const flows = (((await call({ homeserver, tor }, 'GET', '/login')).flows as Json[] | undefined) ?? []).filter((f) => f && typeof f === 'object');
  const sso = flows.find((f) => f.type === 'm.login.sso');
  const providers = Array.isArray(sso?.identity_providers) ? (sso!.identity_providers as Json[]) : [];
  return {
    password: flows.some((f) => f.type === 'm.login.password'),
    sso: sso
      ? providers
          .filter((p) => typeof p.id === 'string' && typeof p.name === 'string')
          .slice(0, 12)
          .map((p) => ({ id: String(p.id), name: String(p.name).slice(0, 60) }))
      : null,
  };
}

/**
 * The page the browser opens to sign in with single sign-on on `homeserver` (with provider `idp`,
 * when it named some), which sends the browser back to `back` with a one-use login token.
 */
export function ssoLink(homeserver: string, back: string, idp?: string): string {
  return `${homeserver}/_matrix/client/v3/login/sso/redirect${idp ? `/${enc(idp)}` : ''}?redirectUrl=${enc(back)}`;
}

/**
 * Signs in with the one-use token single sign-on gave, as a new device, and publishes its keys.
 * Cross-signing keys are made only when the server takes them without asking again (spec 1.11),
 * as there is no password to give; otherwise a check by emoji or the Security Key does it later.
 */
export async function signInWithToken(homeserver: string, token: string, tor?: MatrixTor): Promise<MatrixState> {
  const login = await call({ homeserver, tor }, 'POST', '/login', { type: 'm.login.token', token, initial_device_display_name: editionName() });
  return newDevice(homeserver, login, null, tor);
}

/** The account a sign-in or a new account gave (`login`), as a new device of it with its keys published (lib/matrix-account.ts makes accounts). */
export async function newDevice(homeserver: string, login: Json, auth: Json | null, tor?: MatrixTor): Promise<MatrixState> {
  const { account } = await core<{ account: Json }>('account_new', {});
  const state: MatrixState = {
    homeserver,
    userId: String(login.user_id),
    deviceId: String(login.device_id),
    accessToken: String(login.access_token),
    account,
    rooms: {},
    devices: {},
    outdated: [],
    olm: {},
    inbound: {},
    outbound: {},
    seen: {},
    ...(tor && tor !== ACCOUNT_TOR_DEFAULT ? { tor } : {}),
  };
  const keys = await core<{ device_keys: Json }>('device_keys', { account, user_id: state.userId, device_id: state.deviceId });
  await call(state, 'POST', '/keys/upload', { device_keys: keys.device_keys });
  await publishOneTimeKeys(state, 50, true);
  await setUpCrossSigning(state, keys.device_keys, auth);
  return state;
}

/** Publishes `count` new one-time keys, and a new fallback key with `fallback`. */
async function publishOneTimeKeys(state: MatrixState, count: number, fallback: boolean): Promise<void> {
  const made = await core<{ account: Json; one_time_keys: Json; fallback_keys: Json }>('one_time_keys', {
    account: state.account,
    user_id: state.userId,
    device_id: state.deviceId,
    count,
    fallback,
  });
  await call(state, 'POST', '/keys/upload', { one_time_keys: made.one_time_keys, ...(fallback ? { fallback_keys: made.fallback_keys } : {}) });
  state.account = made.account;
}

const KEY_ID = (publicKey: string) => `ed25519:${publicKey}`;

/** `object` signed by us: with a cross-signing `secret`, or else with this device's own key. Its
 *  `signatures` hold only the new one, as /keys/signatures/upload wants. */
export async function signWith(state: MatrixState, object: Json, secret?: string): Promise<Json> {
  const keyId = secret ? KEY_ID((await core<{ public: string }>('signing_key_public', { secret })).public) : `ed25519:${state.deviceId}`;
  const { signatures: _, unsigned: __, ...bare } = object;
  const signed = (await core<{ json: Json }>('sign_json', { json: bare, ...(secret ? { secret } : { account: state.account }), user_id: state.userId, key_id: keyId })).json;
  return { ...object, signatures: { [state.userId]: { [keyId]: (signed.signatures as Record<string, Json>)[state.userId][keyId] } } };
}

async function setUpCrossSigning(state: MatrixState, deviceKeys: Json, auth: Json | null): Promise<void> {
  const own = await call(state, 'POST', '/keys/query', { device_keys: { [state.userId]: [] } });
  if ((own.master_keys as Json | undefined)?.[state.userId]) return;
  const [master, selfSigning, userSigning] = await Promise.all([0, 1, 2].map(() => core<{ secret: string; public: string }>('signing_key_new', {})));
  const keyOf = (usage: string, key: { public: string }) => ({ user_id: state.userId, usage: [usage], keys: { [KEY_ID(key.public)]: key.public } });
  const byMaster = async (object: Json) =>
    (await core<{ json: Json }>('sign_json', { json: object, secret: master.secret, user_id: state.userId, key_id: KEY_ID(master.public) })).json;
  const masterKey = (
    await core<{ json: Json }>('sign_json', { json: keyOf('master', master), account: state.account, user_id: state.userId, key_id: `ed25519:${state.deviceId}` })
  ).json;
  const body: Json = {
    master_key: masterKey,
    self_signing_key: await byMaster(keyOf('self_signing', selfSigning)),
    user_signing_key: await byMaster(keyOf('user_signing', userSigning)),
  };
  // The server asks for the password again: the first try only opens a session for it.
  const first = await http({ method: 'POST', url: `${state.homeserver}/_matrix/client/v3/keys/device_signing/upload`, body, token: state.accessToken, tor: matrixWayOf(state) });
  if (first.status === 401) {
    if (!auth) return;
    await call(state, 'POST', '/keys/device_signing/upload', { ...body, auth: { ...auth, session: first.json.session } });
  } else if (first.status < 200 || first.status >= 300) {
    throw new MatrixError(first.status, String(first.json.errcode ?? 'M_UNKNOWN'), String(first.json.error ?? ''));
  }
  const signed = (
    await core<{ json: Json }>('sign_json', {
      json: deviceKeys,
      secret: selfSigning.secret,
      user_id: state.userId,
      key_id: KEY_ID(selfSigning.public),
    })
  ).json;
  // Only the new signature goes up: the server has the device's own already.
  const signature = (signed.signatures as Record<string, Json>)[state.userId][KEY_ID(selfSigning.public)];
  const onlyNew = { ...signed, signatures: { [state.userId]: { [KEY_ID(selfSigning.public)]: signature } } };
  await call(state, 'POST', '/keys/signatures/upload', { [state.userId]: { [state.deviceId]: onlyNew } });
  state.crossSigning = { master: master.secret, selfSigning: selfSigning.secret, userSigning: userSigning.secret };
}

/** Signs out: the homeserver forgets this device and its keys. */
export async function signOut(state: MatrixState): Promise<void> {
  await call(state, 'POST', '/logout', {});
}

const FILTER = JSON.stringify({ room: { timeline: { limit: 50 }, state: { lazy_load_members: true } } });

/** What one sync brought, before it is taken in (syncApply). */
export type MatrixNews = Json;

/**
 * Asks the homeserver for what came since the last sync, waiting up to `waitMs` for news. Changes
 * nothing: syncApply takes it in, so a send can go on while a sync waits.
 */
export async function syncFetch(state: Pick<MatrixState, 'homeserver' | 'accessToken' | 'since' | 'sayOnline'>, waitMs = 30_000): Promise<MatrixNews> {
  // Online only when the account says so: otherwise the homeserver is told not to show it.
  const query = `?timeout=${waitMs}&filter=${enc(FILTER)}&set_presence=${state.sayOnline ? 'online' : 'offline'}${state.since ? `&since=${enc(state.since)}` : ''}`;
  return call(state, 'GET', `/sync${query}`);
}

/** A step of a check by emoji (m.key.verification.*), as it came: to-device, or in `roomId`. */
export type VerificationEvent = { type: string; content: Json; sender: string; roomId?: string; eventId?: string; ts?: number };
type VerificationHandler = (state: MatrixState, event: VerificationEvent) => Promise<boolean>;
let verificationHandler: VerificationHandler | null = null;

/** Where the steps of checks by emoji go (lib/matrix-verify.ts sets it). */
export function setVerificationHandler(next: VerificationHandler | null): void {
  verificationHandler = next;
}

const isVerification = (type: unknown, content: Json | undefined) =>
  (typeof type === 'string' && type.startsWith('m.key.verification.')) || (type === 'm.room.message' && content?.msgtype === 'm.key.verification.request');

async function passVerification(state: MatrixState, event: VerificationEvent): Promise<boolean> {
  return verificationHandler ? verificationHandler(state, event).catch(() => false) : false;
}

/** A call's event: one that rings, answers or ends a call, a room's call members, or the keys of a
 *  call's media sent to this device, each opened first when it came encrypted. `age`: how long ago
 *  the homeserver had it, when it says. `encrypted`: for one sent to this device, whether it came
 *  encrypted. */
export type CallEvent = {
  type: string;
  content: Json;
  sender: string;
  ts: number;
  roomId?: string;
  eventId?: string;
  stateKey?: string;
  senderDevice?: string;
  age?: number;
  encrypted?: boolean;
  /** It came encrypted in the room (Megolm), not as it is. */
  sealed?: boolean;
};
type CallHandler = (state: MatrixState, event: CallEvent) => Promise<boolean>;
let callHandler: CallHandler | null = null;

/** Where calls' events go (the calls set it while the space is open), or none. */
export function setCallHandler(next: CallHandler | null): void {
  callHandler = next;
}

/** Legacy calls (m.call.*), and MatrixRTC's: rings, declines, call members, media keys. */
export const isCallEvent = (type: unknown): type is string =>
  typeof type === 'string' &&
  (type.startsWith('m.call.') ||
    type.startsWith('m.rtc.') ||
    type.startsWith('org.matrix.msc4075.') ||
    type.startsWith('org.matrix.msc4310.') ||
    type === 'org.matrix.msc3401.call.member' ||
    type.startsWith('io.element.call.'));

// The older one-to-one calls (m.call.*, lib/matrix-voip.ts) have a handler of their own.
let legacyHandler: CallHandler | null = null;
const LEGACY_CALLS = new Set(['m.call.invite', 'm.call.candidates', 'm.call.answer', 'm.call.select_answer', 'm.call.hangup', 'm.call.reject', 'm.call.negotiate']);

/** Where the older one-to-one calls' events go (lib/matrix-voip.ts). */
export function setLegacyCallHandler(next: CallHandler | null): void {
  legacyHandler = next;
}

async function passCall(state: MatrixState, event: CallEvent): Promise<boolean> {
  const handler = LEGACY_CALLS.has(event.type) ? legacyHandler : callHandler;
  return handler ? handler(state, event).catch(() => false) : false;
}

/** An event of a room as the homeserver has it (`room_id` set), opened when it came encrypted.
 *  `timeline`: it came in the room's timeline, not only as a piece of its state; `state`: the
 *  account it came to (the space's, or a hidden place's). */
export type RoomTap = (roomId: string, event: Json, timeline: boolean, state: MatrixState) => void;
let roomTap: RoomTap | null = null;

/** Where every event of the rooms goes as it comes, or nowhere: Element Call, while it shows (lib/matrix-calls.ts). */
export function setRoomTap(next: RoomTap | null): void {
  roomTap = next;
}

function tap(state: MatrixState, roomId: string, event: Json, timeline: boolean): void {
  try {
    roomTap?.(roomId, { ...event, room_id: roomId }, timeline, state);
  } catch {
    // Whoever listens, the sync goes on.
  }
}

const callIn = (roomId: string, event: Json, type: string, content: Json): CallEvent => {
  const age = (event.unsigned as Json | undefined)?.age;
  return {
    type,
    content,
    sender: String(event.sender),
    ts: Number(event.origin_server_ts ?? Date.now()),
    roomId,
    eventId: String(event.event_id),
    ...(typeof event.state_key === 'string' ? { stateKey: event.state_key } : {}),
    ...(typeof age === 'number' ? { age } : {}),
  };
};

/** Takes in what one sync brought. Answers whether anything a person would see changed. */
export async function syncApply(state: MatrixState, news: MatrixNews): Promise<boolean> {
  let seen = false;
  for (const event of ((news.to_device as Json | undefined)?.events as Json[] | undefined) ?? []) {
    const changed = isVerification(event.type, event.content as Json)
      ? await passVerification(state, { type: String(event.type), content: (event.content as Json) ?? {}, sender: String(event.sender) })
      : await takeToDevice(state, event);
    if (changed) seen = true;
  }
  const lists = news.device_lists as { changed?: unknown; left?: unknown } | undefined;
  const users = (list: unknown) => (Array.isArray(list) ? list.filter((u): u is string => typeof u === 'string') : []);
  for (const user of users(lists?.changed)) if (!state.outdated.includes(user)) state.outdated.push(user);
  for (const user of users(lists?.left)) delete state.devices[user];
  takePresence(state, news);
  takeIgnored(state, news);
  const direct = directRooms(news);
  const rooms = (news.rooms as Json | undefined) ?? {};
  for (const [id, room] of Object.entries((rooms.join as Record<string, Json> | undefined) ?? {})) {
    if (await takeRoom(state, id, room, direct)) seen = true;
  }
  for (const [id, room] of Object.entries((rooms.invite as Record<string, Json> | undefined) ?? {})) {
    takeInvite(state, id, room);
    seen = true;
  }
  for (const id of Object.keys((rooms.leave as Json | undefined) ?? {})) {
    if (state.rooms[id]) seen = true;
    delete state.rooms[id];
    delete state.outbound[id];
  }
  const counts = news.device_one_time_keys_count as Json | undefined;
  const left = Number(counts?.signed_curve25519 ?? 0);
  const fallbackGone = Array.isArray(news.device_unused_fallback_key_types) && !(news.device_unused_fallback_key_types as string[]).includes('signed_curve25519');
  if (left < 25 || fallbackGone) await publishOneTimeKeys(state, 50 - left, fallbackGone);
  // Only the latest indexes are needed against replays: older ones go, so the state stays small.
  const seenKeys = Object.keys(state.seen);
  if (seenKeys.length > KEEP_SEEN) for (const key of seenKeys.slice(0, seenKeys.length - KEEP_SEEN)) delete state.seen[key];
  // A sync answer without the next batch's token (never from a homeserver) leaves it where it was.
  if (typeof news.next_batch === 'string' && news.next_batch) state.since = news.next_batch;
  return seen;
}

// Others' presence (m.presence), by account, then user: in memory only, never kept in the
// account's file or a backup.
const presences = new WeakMap<MatrixState, Map<string, NetPresence>>();

function takePresence(state: MatrixState, news: Json): void {
  const events = ((news.presence as Json | undefined)?.events as Json[] | undefined) ?? [];
  if (!events.length) return;
  let all = presences.get(state);
  if (!all) presences.set(state, (all = new Map()));
  const now = Date.now();
  for (const event of events) {
    const who = event.sender;
    const content = event.content as Json | undefined;
    if (event.type !== 'm.presence' || typeof who !== 'string' || who === state.userId || !content) continue;
    const said = content.presence;
    const show: NetPresence['show'] = said === 'online' ? (content.currently_active === false ? 'away' : 'online') : said === 'unavailable' ? 'away' : said === 'org.matrix.msc3026.busy' || said === 'busy' ? 'busy' : 'offline';
    const ago = Number(content.last_active_ago);
    all.set(who, { show, status: cleanStatus(content.status_msg), ...(Number.isFinite(ago) && ago >= 0 ? { lastActive: now - ago } : {}) });
  }
}

/** Whether a user is online, as their homeserver last said, or null when it said nothing (many homeservers do not). */
export function matrixPresence(state: MatrixState, userId: string): NetPresence | null {
  return presences.get(state)?.get(userId) ?? null;
}

/** The one other person of a chat with one person, or undefined. */
export function directOther(state: MatrixState, room: MatrixRoom): string | undefined {
  if (!room.direct) return undefined;
  const others = Object.keys(room.members).filter((who) => who !== state.userId);
  return others.length === 1 ? others[0] : undefined;
}

/** Tells the homeserver whether we are online now: offline when the account does not say it. */
export async function sendOwnPresence(state: MatrixState): Promise<void> {
  await call(state, 'PUT', `/presence/${enc(state.userId)}/status`, { presence: state.sayOnline ? 'online' : 'offline' });
}

/** One sync, fetched and taken in. */
export async function sync(state: MatrixState, waitMs = 30_000): Promise<boolean> {
  return syncApply(state, await syncFetch(state, waitMs));
}

// How far each other member of a room read it (m.receipt): what they read up to in its main thread
// (m.read, of no thread or of 'main'), each one's latest, by when. Only those it lists as members.
function takeReceipts(state: MatrixState, room: MatrixRoom, content: unknown): boolean {
  if (!content || typeof content !== 'object') return false;
  let changed = false;
  for (const [event, kinds] of Object.entries(content as Json)) {
    // Ours, from another of our devices (Element, another phone): the room is read up to there.
    for (const kind of ['m.read', 'm.read.private']) {
      const said = ((kinds as Json | undefined)?.[kind] as Json | undefined)?.[state.userId] as Json | undefined;
      const thread = said?.thread_id;
      if (!said || (thread !== undefined && thread !== 'main')) continue;
      const at = room.messages.find((m) => m.id === event)?.ts ?? (typeof said.ts === 'number' && Number.isFinite(said.ts) ? said.ts : undefined);
      if (at !== undefined && at > (room.readTs ?? 0)) {
        room.readTs = at;
        changed = true;
      }
    }
    const read = (kinds as Json | undefined)?.['m.read'];
    if (!read || typeof read !== 'object' || !event.startsWith('$')) continue;
    for (const [user, said] of Object.entries(read as Json)) {
      const ts = (said as Json | undefined)?.ts;
      const thread = (said as Json | undefined)?.thread_id;
      if (user === state.userId || !room.members[user] || typeof ts !== 'number' || !Number.isFinite(ts) || (thread !== undefined && thread !== 'main')) continue;
      if ((room.readBy?.[user]?.ts ?? -1) >= ts) continue;
      room.readBy = { ...room.readBy, [user]: { event, ts } };
      changed = true;
    }
  }
  const readers = Object.entries(room.readBy ?? {});
  if (readers.length > MOST_READERS) room.readBy = Object.fromEntries(readers.sort(([, a], [, b]) => b.ts - a.ts).slice(0, MOST_READERS));
  return changed;
}

/**
 * Who of a room's other members read one of its messages, and when, as they last said: one who
 * read up to it or to one after it. One whose latest read is of a message not kept here read it
 * once they said so after it went (the homeserver takes no read back).
 */
export function readersOf(room: Pick<MatrixRoom, 'messages' | 'readBy'>, message: Pick<MatrixMessage, 'id' | 'ts'>, me: string): Record<string, number> {
  const at = new Map(room.messages.map((m, i) => [m.id, i]));
  const mine = at.get(message.id) ?? -1;
  const readers: Record<string, number> = {};
  for (const [user, read] of Object.entries(room.readBy ?? {})) {
    if (user === me) continue;
    const upTo = at.get(read.event);
    if (upTo === undefined ? read.ts >= message.ts : mine >= 0 && upTo >= mine) readers[user] = read.ts;
  }
  return readers;
}

/** Whether every other member in a room read one of ours (✓✓✓), as readersOf says; false while it is alone. */
export function readByAll(room: Pick<MatrixRoom, 'messages' | 'readBy' | 'members'>, message: Pick<MatrixMessage, 'id' | 'ts'>, me: string): boolean {
  const others = Object.entries(room.members).filter(([user, m]) => user !== me && m.membership === 'join');
  if (others.length === 0) return false;
  const readers = readersOf(room, message, me);
  return others.every(([user]) => readers[user] !== undefined);
}

/** Those an m.ignored_user_list names: whom the account blocks. */
export function ignoredOf(content: unknown): string[] {
  const users = (content as Json | undefined)?.ignored_users;
  return typeof users === 'object' && users !== null ? Object.keys(users).filter(isMatrixId).slice(0, 1000) : [];
}

/** Whom the account blocks, when a sync's account data says it anew (lib/matrix-rules.ts). */
function takeIgnored(state: MatrixState, news: Json): void {
  const events = ((news.account_data as Json | undefined)?.events as Json[] | undefined) ?? [];
  const list = events.filter((e) => e.type === 'm.ignored_user_list').at(-1);
  if (!list) return;
  const ignored = ignoredOf(list.content);
  if (ignored.length) state.ignored = ignored;
  else delete state.ignored;
}

function directRooms(news: Json): Set<string> | null {
  const events = ((news.account_data as Json | undefined)?.events as Json[] | undefined) ?? [];
  const direct = events.find((e) => e.type === 'm.direct');
  if (!direct) return null;
  return new Set(Object.values((direct.content as Record<string, string[]>) ?? {}).flat());
}

function roomOf(state: MatrixState, id: string): MatrixRoom {
  state.rooms[id] ??= { id, name: '', members: {}, encrypted: false, direct: false, unread: 0, messages: [] };
  return state.rooms[id];
}

/** An mxc:// address as one can be, or none. */
function mxcOf(value: unknown): string | undefined {
  return typeof value === 'string' && /^mxc:\/\/[^/]+\/[^/?#]+$/.test(value) ? value : undefined;
}

/** The most characters of a name of our own for a room. */
export const OWN_ROOM_NAME = 64;

/** A room's name as we see it: the one of our own given here, else its own (or its person's). */
export function shownRoomName(room: Pick<MatrixRoom, 'name' | 'own'>): string {
  return (typeof room.own === 'string' && room.own.trim()) || room.name;
}

/** A room's picture: its own, or in a chat with one person, theirs. */
export function roomAvatar(state: MatrixState, room: MatrixRoom): string | undefined {
  if (room.avatar) return room.avatar;
  if (!room.direct) return undefined;
  const others = Object.entries(room.members).filter(([who]) => who !== state.userId);
  return others.length === 1 ? others[0][1].avatar : undefined;
}

/** Puts our profile picture on the homeserver (an mxc:// address from an upload), or takes it away with ''. */
export async function setOwnAvatar(state: MatrixState, mxc: string): Promise<void> {
  await call(state, 'PUT', `/profile/${enc(state.userId)}/avatar_url`, { avatar_url: mxc });
  state.avatar = mxc || undefined;
}

/** Our profile picture as the homeserver has it now. */
export async function fetchOwnAvatar(state: MatrixState): Promise<void> {
  const profile = await call(state, 'GET', `/profile/${enc(state.userId)}`);
  state.avatar = mxcOf(profile.avatar_url);
}

function takeState(room: MatrixRoom, event: Json): void {
  const content = (event.content as Json | undefined) ?? {};
  switch (event.type) {
    case 'm.room.name':
      room.name = String(content.name ?? '');
      break;
    case 'm.room.encryption':
      if (content.algorithm === MEGOLM) room.encrypted = true;
      break;
    case 'm.room.avatar':
      room.avatar = mxcOf(content.url);
      break;
    case 'm.room.pinned_events': {
      const pinned = Array.isArray(content.pinned) ? content.pinned.filter((id): id is string => typeof id === 'string' && id.startsWith('$')).slice(-50) : [];
      if (pinned.length) room.pinned = pinned;
      else delete room.pinned;
      break;
    }
    case 'm.room.create': {
      if (content.type === 'm.space') room.space = true;
      const makers = creatorsOf(event.sender, content);
      if (makers) room.creators = makers;
      break;
    }
    case 'm.room.power_levels':
      room.power = powerOfContent(content);
      break;
    case 'm.room.join_rules':
      room.joins = content.join_rule === 'public' ? 'public' : 'other';
      break;
    case 'm.room.topic':
      if (typeof content.topic === 'string' && content.topic.trim()) room.topic = content.topic.trim().slice(0, 500);
      else delete room.topic;
      break;
    case 'm.room.canonical_alias':
      if (typeof content.alias === 'string' && /^#[^:\s]+:\S+$/.test(content.alias)) room.alias = content.alias;
      else delete room.alias;
      break;
    case 'm.room.member': {
      const who = String(event.state_key);
      if (content.membership === 'join' || content.membership === 'invite') {
        room.members[who] = { membership: content.membership, name: typeof content.displayname === 'string' ? content.displayname : undefined, avatar: mxcOf(content.avatar_url) };
        if (content.is_direct === true) room.direct = true;
      } else delete room.members[who];
      break;
    }
  }
}

async function takeRoom(state: MatrixState, id: string, data: Json, direct: Set<string> | null): Promise<boolean> {
  const room = roomOf(state, id);
  delete room.invitedBy;
  if (direct) room.direct = direct.has(id);
  let seen = false;
  for (const event of ((data.state as Json | undefined)?.events as Json[] | undefined) ?? []) {
    takeState(room, event);
    tap(state, id, event, false);
    if (isCallEvent(event.type) && (await passCall(state, callIn(id, event, event.type, (event.content as Json) ?? {})))) seen = true;
  }
  const timeline = (data.timeline as Json | undefined) ?? {};
  // Where older messages are: the first time the room is seen, or after a gap the homeserver left
  // (limited), from which fetching older ones fills it. A first sight with no gap is the whole room.
  const firstSight = room.before === undefined && !room.start && room.messages.length === 0;
  if (typeof timeline.prev_batch === 'string' && (timeline.limited === true || firstSight)) {
    room.before = timeline.prev_batch;
    delete room.start;
  } else if (firstSight && timeline.limited === false) room.start = true;
  // The messages here before this sync, to tell which came with it (freshFromOthers).
  const had = new Set(room.messages.map((m) => m.id));
  const live = !!state.since;
  for (const event of (timeline.events as Json[] | undefined) ?? []) {
    if (typeof event.state_key === 'string') {
      takeState(room, event);
      tap(state, id, event, true);
      if (isCallEvent(event.type) && (await passCall(state, callIn(id, event, event.type, (event.content as Json) ?? {})))) seen = true;
      continue;
    }
    if (typeof event.type === 'string' && event.type.startsWith('m.key.verification.')) {
      if (await passVerification(state, inRoom(id, event, event.type, (event.content as Json) ?? {}))) seen = true;
      continue;
    }
    if (await takeEvent(state, id, event, false)) seen = true;
  }
  keepLatest(room);
  // How far the room was read before this sync: ours from another device (a message of ours that
  // came with it, not sent from here, or our own receipt below) reads it up to there.
  const readBefore = room.readTs;
  const ownLatest = room.messages.filter((m) => !had.has(m.id) && m.sender === state.userId && !m.state).at(-1);
  if (live && ownLatest && ownLatest.ts > (room.readTs ?? 0)) room.readTs = ownLatest.ts;
  // Who writes in it now, as the homeserver says (m.typing): kept here only. And how far each read.
  for (const event of ((data.ephemeral as Json | undefined)?.events as Json[] | undefined) ?? []) {
    if (event.type === 'm.receipt') {
      if (takeReceipts(state, room, event.content)) seen = true;
      continue;
    }
    if (event.type !== 'm.typing') continue;
    const ids = (event.content as Json | undefined)?.user_ids;
    setTyping(state, id, Array.isArray(ids) ? ids.filter((u): u is string => typeof u === 'string' && u !== state.userId).slice(0, 20) : []);
  }
  // Our tags on it (m.tag), in our account: a favourite, or of low priority.
  for (const event of ((data.account_data as Json | undefined)?.events as Json[] | undefined) ?? []) {
    if (event.type !== 'm.tag') continue;
    const tags = ((event.content as Json | undefined)?.tags as Json | undefined) ?? {};
    room.tags = { ...('m.favourite' in tags ? { favourite: true as const } : {}), ...('m.lowpriority' in tags ? { low: true as const } : {}) };
    if (!room.tags.favourite && !room.tags.low) delete room.tags;
    seen = true;
  }
  const unread = (data.unread_notifications as Json | undefined)?.notification_count;
  const before = room.unread;
  if (typeof unread === 'number') room.unread = unread > 0 && !newSinceRead(state, room) ? 0 : unread;
  // In an encrypted room the homeserver cannot read what came, so its count follows only what its
  // push rules guess of encrypted events, and many accounts have them say nothing (Element's
  // «Encrypted messages in group chats» off): what came from others after the last read counts here.
  if (room.encrypted && live) room.unread = Math.max(room.unread, readBefore === room.readTs ? before + freshFromOthers(state, room, had) : sinceRead(state, room));
  if (!room.name) room.name = nameFromMembers(state, room);
  return seen;
}

// Who writes in each room now, by account and room, and since when the homeserver said it. Erevos
// says it of us only when the account says so (sendTyping), as the homeserver learns each time one writes.
const typingIn = new Map<string, { who: string[]; at: number }>();
const typingListeners = new Set<() => void>();
/** How long what the homeserver last said of who writes is trusted, when nothing new came. */
export const MATRIX_TYPING_SHOWS = 60_000;

function setTyping(state: MatrixState, roomId: string, who: string[]): void {
  const key = `${state.userId} ${roomId}`;
  const was = typingIn.get(key)?.who ?? [];
  if (who.length) typingIn.set(key, { who, at: Date.now() });
  else typingIn.delete(key);
  if (was.join() !== who.join()) typingListeners.forEach((listener) => listener());
}

/** Who writes in a room now, other than us, as the homeserver last said. */
export function matrixTyping(state: MatrixState, roomId: string, now = Date.now()): string[] {
  const it = typingIn.get(`${state.userId} ${roomId}`);
  return it && now - it.at < MATRIX_TYPING_SHOWS ? it.who : [];
}

/** Told each time who writes in a room changes. */
export function onMatrixTyping(listener: () => void): () => void {
  typingListeners.add(listener);
  return () => typingListeners.delete(listener);
}

/** How long the homeserver shows us as writing after it was told, unless told we stopped. */
export const MATRIX_TYPING_SAID = 15_000;

/** Tells a room we write, or stopped, when the account says so (state.sayTyping). */
export async function sendTyping(state: MatrixState, roomId: string, typing: boolean): Promise<boolean> {
  if (!state.sayTyping || !state.rooms[roomId] || state.rooms[roomId].invitedBy) return false;
  await call(state, 'PUT', `/rooms/${enc(roomId)}/typing/${enc(state.userId)}`, typing ? { typing: true, timeout: MATRIX_TYPING_SAID } : { typing: false });
  return true;
}

function nameFromMembers(state: MatrixState, room: MatrixRoom): string {
  const others = Object.entries(room.members).filter(([who]) => who !== state.userId);
  return others.map(([who, m]) => m.name || who).join(', ') || room.id;
}

function takeInvite(state: MatrixState, id: string, data: Json): void {
  const room = roomOf(state, id);
  for (const event of ((data.invite_state as Json | undefined)?.events as Json[] | undefined) ?? []) {
    takeState(room, event);
    const content = (event.content as Json | undefined) ?? {};
    if (event.type === 'm.room.member' && event.state_key === state.userId && content.membership === 'invite') {
      room.invitedBy = String(event.sender);
      if (content.is_direct === true) room.direct = true;
    }
  }
  if (!room.name) room.name = nameFromMembers(state, room);
}

const inRoom = (roomId: string, event: Json, type: string, content: Json): VerificationEvent => ({
  type,
  content,
  sender: String(event.sender),
  roomId,
  eventId: String(event.event_id),
  ts: Number(event.origin_server_ts ?? Date.now()),
});

/**
 * Takes one event of a room's timeline, as it came (`older` false) or fetched from before
 * (`older` true, then nothing in it rings, checks or taps): a message shows, or one still locked;
 * a reaction goes on its message, a change (m.replace) changes it, a redaction takes back a
 * message or a reaction. A step of a check by emoji goes on to lib/matrix-verify.ts, and its
 * request shows too, as Element shows it. Whether anything shown changed.
 */
async function takeEvent(state: MatrixState, roomId: string, event: Json, older: boolean): Promise<boolean> {
  const room = roomOf(state, roomId);
  const base: { id: string; sender: string; ts: number; unverified?: true } = { id: String(event.event_id), sender: String(event.sender), ts: Number(event.origin_server_ts ?? Date.now()) };
  // Nothing of one the account blocks, nor a message deleted on this device that comes again (lib/matrix-rules.ts).
  if (state.ignored?.includes(base.sender) || (Array.isArray(room.rules?.hidden) && room.rules.hidden.includes(base.id))) return false;
  let type = String(event.type);
  let content = (event.content as Json) ?? {};
  const unsigned = event.unsigned as Json | undefined;
  // Taken back before it came here: it shows as such, its words gone.
  if (unsigned?.redacted_because) {
    if (type !== 'm.room.message' && type !== 'm.room.encrypted' && type !== STICKER && !POLL_START.includes(type)) return false;
    return place(room, { ...base, text: '', deleted: true }, event, older);
  }
  if (type === 'm.room.redaction') return redact(room, String(event.redacts ?? content.redacts ?? ''));
  // Relations stay readable to the homeserver, outside what is encrypted (m.relates_to).
  const relation = content['m.relates_to'] as Json | undefined;
  if (type === 'm.room.encrypted') {
    if (content.algorithm !== MEGOLM) return false;
    const locked = { sessionId: String(content.session_id), ciphertext: String(content.ciphertext), senderKey: String(content.sender_key ?? '') };
    const opened = await openMegolm(state, roomId, base.id, base.sender, locked);
    if (!opened) {
      // A reaction or a change that cannot be opened has nothing to show.
      if (relation?.rel_type === 'm.annotation' || relation?.rel_type === 'm.replace' || relation?.rel_type === 'm.reference') return false;
      return place(room, { ...base, text: '', locked }, event, older);
    }
    type = opened.type;
    content = opened.content;
    if (relation && !content['m.relates_to']) content = { ...content, 'm.relates_to': relation };
    if (opened.unverified) base.unverified = true;
  }
  if (!older) {
    tap(state, roomId, { ...event, type, content }, true);
    if (isVerification(type, content)) await passVerification(state, inRoom(roomId, event, type, content));
    // A call's events show as its line, which the calls keep (lib/matrix-calls.ts, lib/matrix-voip.ts).
    if (isCallEvent(type)) await passCall(state, { ...callIn(roomId, event, type, content), sealed: event.type === 'm.room.encrypted' });
  }
  const changed = await takeContent(state, roomId, base, type, content, event, older);
  // A thread's first message comes with how many answers it has (m.relations).
  const threaded = (unsigned?.['m.relations'] as Json | undefined)?.['m.thread'] as Json | undefined;
  if (changed && typeof threaded?.count === 'number') {
    const root = room.messages.find((m) => m.id === base.id);
    if (root) root.threadCount = Math.max(0, Math.min(1e6, Math.floor(threaded.count)));
  }
  // Fetched from before, a message comes with its latest change bundled (m.relations).
  const bundled = ((unsigned?.['m.relations'] as Json | undefined)?.['m.replace'] as Json | undefined) ?? undefined;
  if (older && changed && typeof bundled?.event_id === 'string' && typeof bundled.type === 'string') await takeEvent(state, roomId, bundled, true);
  return changed;
}

/** What an event's opened content does: shows a message, reacts, or changes one. */
async function takeContent(state: MatrixState, roomId: string, base: { id: string; sender: string; ts: number }, type: string, content: Json, event: Json, older: boolean): Promise<boolean> {
  const room = roomOf(state, roomId);
  const relation = content['m.relates_to'] as Json | undefined;
  if (type === 'm.reaction') return react(room, base, relation) || (older && waitFor(room, base, type, content));
  if (POLL_RESPONSE.includes(type) || POLL_END.includes(type)) return pollRelation(room, base, type, content) || (older && waitFor(room, base, type, content));
  if (POLL_START.includes(type)) {
    const poll = pollOfContent(content);
    const words = poll ? '' : bodyOf(content) || String(content['org.matrix.msc1767.text'] ?? '');
    return place(room, { ...base, text: words, ...(poll ? { poll } : {}) }, event, older);
  }
  if (type === STICKER) return place(room, { ...base, ...stickerShown(content) }, event, older);
  if (type !== 'm.room.message') return false;
  if (relation?.rel_type === 'm.replace') return change(room, base, relation, content) || (older && waitFor(room, base, type, content));
  return place(room, { ...base, ...shownOf(content) }, event, older);
}

/** A vote on a poll, or its end, which only its maker may send: on the poll it is for. */
function pollRelation(room: MatrixRoom, base: { sender: string; ts: number }, type: string, content: Json): boolean {
  const relation = content['m.relates_to'] as Json | undefined;
  if (relation?.rel_type !== 'm.reference') return false;
  const poll = room.messages.find((m) => m.id === relation.event_id && m.poll && !m.deleted)?.poll;
  if (!poll) return false;
  if (POLL_END.includes(type)) {
    const maker = room.messages.find((m) => m.poll === poll)?.sender;
    if (base.sender !== maker) return false;
    endPoll(poll, base.ts);
    return true;
  }
  const ids = votedOf(content, poll);
  return ids !== null && takeVote(poll, base.sender, ids, base.ts);
}

/** Fetched from before, a reaction or a change comes ahead of its message: it waits for it. */
function waitFor(room: MatrixRoom, base: { id: string; sender: string; ts: number }, type: string, content: Json): false {
  const target = (content['m.relates_to'] as Json | undefined)?.event_id;
  if (typeof target !== 'string' || room.messages.some((m) => m.id === target)) return false;
  const waiting = (room.waiting ??= []);
  if (!waiting.some((w) => w.id === base.id)) waiting.push({ ...base, type, content });
  if (waiting.length > MOST_WAITING) waiting.splice(0, waiting.length - MOST_WAITING);
  return false;
}

/** Puts a message in its room: in place of the one it is (ours, as it went), else at the end, or where its time says when it is older. */
function place(room: MatrixRoom, message: MatrixMessage, event: Json, older: boolean): boolean {
  const transaction = (event.unsigned as Json | undefined)?.transaction_id;
  const at = room.messages.findIndex((m) => m.id === message.id || (m.state && transaction === m.id));
  if (at >= 0) {
    const before = room.messages[at];
    // What came for it while it went, or before it was fetched again, stays.
    const { styled, ...rest } = message;
    // A change's words keep the look the change gave them.
    const look = before.edited && !message.deleted ? before.styled : styled;
    room.messages[at] = {
      ...rest,
      ...(look ? { styled: look } : {}),
      ...(before.reactions ? { reactions: before.reactions } : {}),
      ...(before.edited && !message.deleted ? { text: before.text, edited: before.edited } : {}),
      ...(before.forwarded && !message.deleted ? { forwarded: true as const } : {}),
      ...(before.threadCount !== undefined ? { threadCount: before.threadCount } : {}),
      ...(message.poll && before.poll ? { poll: { ...message.poll, votes: before.poll.votes, ended: before.poll.ended } } : {}),
    };
    return true;
  }
  if (!older) {
    room.messages.push(message);
    return true;
  }
  const after = room.messages.findIndex((m) => m.ts > message.ts);
  room.messages.splice(after < 0 ? room.messages.length : after, 0, message);
  // What came for it from later pages, in the order it was done.
  const its = room.waiting?.filter((w) => (w.content['m.relates_to'] as Json | undefined)?.event_id === message.id);
  if (its?.length) {
    room.waiting = room.waiting!.filter((w) => !its.includes(w));
    if (!room.waiting.length) delete room.waiting;
    for (const w of its.sort((a, b) => a.ts - b.ts)) {
      const relation = w.content['m.relates_to'] as Json;
      if (w.type === 'm.reaction') react(room, w, relation);
      else if (w.type === 'm.room.message') change(room, w, relation, w.content);
      else pollRelation(room, w, w.type, w.content);
    }
  }
  return true;
}

/** A reaction on its message, once for each who chose it. */
function react(room: MatrixRoom, base: { id: string; sender: string }, relation: Json | undefined): boolean {
  if (relation?.rel_type !== 'm.annotation' || typeof relation.event_id !== 'string' || typeof relation.key !== 'string' || !relation.key) return false;
  const target = room.messages.find((m) => m.id === relation.event_id);
  if (!target || target.deleted) return false;
  const key = relation.key.slice(0, 40);
  const who = ((target.reactions ??= {})[key] ??= []);
  if (!who.includes(base.sender)) who.push(base.sender);
  (room.reactionsBy ??= {})[base.id] = { target: target.id, key, sender: base.sender };
  return true;
}

/** A message changed by whoever wrote it: its words, or its file, as they are now. */
function change(room: MatrixRoom, base: { sender: string; ts: number; unverified?: true }, relation: Json, content: Json): boolean {
  const target = room.messages.find((m) => m.id === relation.event_id);
  const fresh = content['m.new_content'] as Json | undefined;
  // Only its writer may change it; a change of a change is not one.
  if (!target || !fresh || target.sender !== base.sender || target.deleted || target.call || target.sticker) return false;
  // An older change than the one it shows, fetched after it, is past.
  if (target.edited && target.edited > base.ts) return true;
  const shown = shownOf(fresh);
  target.text = shown.text;
  if (shown.styled) target.styled = shown.styled;
  else delete target.styled;
  if (shown.file) target.file = shown.file;
  if (shown.preview) target.preview = shown.preview;
  else delete target.preview;
  target.edited = base.ts;
  // Words now from a key not known for sure are no surer than it.
  if (base.unverified) target.unverified = true;
  return true;
}

/** Takes back the message or the reaction `id` names: the homeserver let it be, so it is. */
function redact(room: MatrixRoom, id: string): boolean {
  const reaction = room.reactionsBy?.[id];
  if (reaction) {
    delete room.reactionsBy![id];
    const target = room.messages.find((m) => m.id === reaction.target);
    const who = target?.reactions?.[reaction.key];
    if (!target?.reactions || !who) return false;
    target.reactions[reaction.key] = who.filter((w) => w !== reaction.sender);
    if (!target.reactions[reaction.key].length) delete target.reactions[reaction.key];
    if (!Object.keys(target.reactions).length) delete target.reactions;
    return true;
  }
  const target = room.messages.find((m) => m.id === id);
  if (!target || target.deleted) return false;
  target.text = '';
  target.deleted = true;
  for (const gone of ['file', 'locked', 'reactions', 'replyTo', 'edited', 'poll', 'place', 'preview', 'sticker', 'styled', 'forwarded'] as const) delete target[gone];
  return true;
}

/** Keeps the room's latest messages, and the reactions of those it keeps. */
function keepLatest(room: MatrixRoom): void {
  room.messages = room.messages.slice(-(room.keep ?? KEEP_MESSAGES));
  if (room.reactionsBy) {
    const kept = new Set(room.messages.map((m) => m.id));
    for (const [id, reaction] of Object.entries(room.reactionsBy)) if (!kept.has(reaction.target)) delete room.reactionsBy[id];
  }
}

function bodyOf(content: Json | undefined): string {
  return typeof content?.body === 'string' ? content.body : '';
}

const KINDS: Record<string, MatrixFile['kind']> = { 'm.image': 'image', 'm.video': 'video', 'm.audio': 'audio', 'm.file': 'file' };

function isEncryptedFile(value: unknown): value is EncryptedFile {
  const v = value as Partial<EncryptedFile> | null;
  return (
    typeof v?.url === 'string' &&
    v.url.startsWith('mxc://') &&
    v.key?.alg === 'A256CTR' &&
    typeof v.key.k === 'string' &&
    typeof v.iv === 'string' &&
    typeof v.hashes?.sha256 === 'string'
  );
}

/** The message a content answers, when it answers one. */
function replyOf(content: Json | undefined): string | undefined {
  const relation = content?.['m.relates_to'] as Json | undefined;
  // In a thread, the message it seems to answer is only the thread's latest, for apps without threads.
  if (relation?.rel_type === 'm.thread' && relation.is_falling_back === true) return undefined;
  const to = ((content?.['m.relates_to'] as Json | undefined)?.['m.in_reply_to'] as Json | undefined)?.event_id;
  return typeof to === 'string' && to.startsWith('$') ? to : undefined;
}

/** An answer's words without the quote of what it answers, which older apps put before them. */
function withoutQuote(body: string): string {
  const lines = body.split('\n');
  let at = 0;
  while (at < lines.length && lines[at].startsWith('>')) at++;
  if (at === 0 || at >= lines.length || lines[at].trim() !== '') return body;
  return lines.slice(at + 1).join('\n');
}

/** How words look, when their content's HTML says it (lib/matrix-html.ts): never the HTML itself. */
function styleOf(content: Json | undefined): Pick<MatrixMessage, 'styled'> {
  const styled = styledOf(content);
  return styled ? { styled } : {};
}

/** What a message's content shows: its words, its file when it carries one, and what it answers. */
function shownOf(content: Json | undefined): Pick<MatrixMessage, 'text' | 'file' | 'replyTo' | 'place' | 'preview' | 'thread' | 'styled'> {
  const thread = content ? threadOf(content) : null;
  if (thread) {
    const inside = shownOf({ ...content, 'm.relates_to': thread.answers ? { 'm.in_reply_to': { event_id: thread.answers } } : undefined });
    return { ...inside, thread: thread.root };
  }
  const replyTo = replyOf(content);
  if (replyTo) return { ...shownOf({ ...content, 'm.relates_to': undefined, body: withoutQuote(bodyOf(content)) }), replyTo };
  const where = content ? placeOfContent(content) : null;
  if (where) return { text: '', place: where };
  const preview = content && content.msgtype === 'm.text' ? previewOfContent(content) : null;
  if (preview) return { text: bodyOf(content), preview, ...styleOf(content) };
  if (content?.msgtype === 'm.key.verification.request') return { text: t('Asked to check devices by emoji.') };
  const kind = KINDS[String(content?.msgtype)];
  if (!content || !kind) return { text: bodyOf(content), ...styleOf(content) };
  const info = (content.info as Json | undefined) ?? {};
  const encrypted = isEncryptedFile(content.file) ? content.file : undefined;
  const url = typeof content.url === 'string' && content.url.startsWith('mxc://') ? content.url : undefined;
  if (!encrypted && !url) return { text: bodyOf(content) };
  const name = String(content.filename ?? content.body ?? 'file').slice(0, 200);
  const number = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : undefined);
  const file: MatrixFile = { kind, name, mime: typeof info.mimetype === 'string' ? info.mimetype : 'application/octet-stream' };
  if (number(info.size) !== undefined) file.size = number(info.size);
  if (number(info.w) !== undefined) file.w = number(info.w);
  if (number(info.h) !== undefined) file.h = number(info.h);
  if (encrypted) file.encrypted = encrypted;
  else file.url = url;
  if (kind === 'audio' && content['org.matrix.msc3245.voice'] !== undefined) file.voice = true;
  const duration = number(info.duration) ?? number((content['org.matrix.msc1767.audio'] as Json | undefined)?.duration);
  if (kind === 'audio' && duration !== undefined) file.duration = duration;
  const waveform = (content['org.matrix.msc1767.audio'] as Json | undefined)?.waveform;
  if (file.voice && Array.isArray(waveform) && waveform.length > 1) file.waveform = waveform.slice(0, 1000).map((v) => Math.round(Math.min(1024, number(v) ?? 0)));
  // A caption, when the words are not only the file's name.
  const text = !file.voice && content.filename && content.body !== content.filename ? bodyOf(content) : '';
  return { text, file };
}

/** A sticker's event type. */
export const STICKER = 'm.sticker';

/**
 * What a sticker's content (m.sticker) shows: its picture, as a photo's is (`url`, or `file` where
 * it came encrypted, as Element, FluffyChat and Element X read it), its words its name; only its
 * words when it has no picture. What it answers, and its thread, as a message's.
 */
export function stickerShown(content: Json): Pick<MatrixMessage, 'text' | 'file' | 'replyTo' | 'thread' | 'sticker'> {
  const words = bodyOf(content).trim().slice(0, 200);
  const shown = shownOf({ ...content, msgtype: 'm.image', body: words || 'Sticker', filename: undefined });
  if (!shown.file) return shown;
  return { ...shown, text: '', file: { ...shown.file, kind: 'image' }, sticker: true };
}

/** `text` parsed as a JSON object, or null when it is none. */
function jsonObject(text: string): Json | null {
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : null;
  } catch {
    return null;
  }
}

/** The device among those known whose Curve25519 key is `curve25519`, and whose it is. */
function deviceOfKey(state: MatrixState, curve25519: string): { user: string; device: Device } | undefined {
  for (const [user, devices] of Object.entries(state.devices)) {
    const device = Object.values(devices).find((d) => d.curve25519 === curve25519);
    if (device) return { user, device };
  }
  return undefined;
}

/**
 * Whether an event that the homeserver says `sender` sent may open with `inbound`: only when the
 * session is theirs, or the homeserver could make any member say anything with a key it has. A
 * session given through Olm by a device not known then is tied to it once it is, or refused when
 * that device is someone else's or has other keys; until then what opens with it is not verified.
 * One restored from the backup is never sure (anyone with the backup's public key can add to it).
 */
function ownerCheck(state: MatrixState, inbound: Inbound, sender: string): 'sure' | 'unverified' | 'refused' {
  const holder = deviceOfKey(state, inbound.senderKey);
  if (inbound.sender !== undefined) {
    if (inbound.sender !== sender) return 'refused';
    if (!inbound.untied) return 'sure';
    if (!holder) return 'unverified';
    if (holder.user !== sender || holder.device.ed25519 !== inbound.ed25519) return 'refused';
    delete inbound.untied;
    return 'sure';
  }
  if (holder && holder.user !== sender) return 'refused';
  if (inbound.backup || !holder) return 'unverified';
  // Kept before the sender was noted, from Olm, whose sender key is the device's own.
  inbound.sender = sender;
  inbound.ed25519 = holder.device.ed25519;
  return 'sure';
}

/** The content of a room message `sender` sent under the room's Megolm keys, and whether it is not
 *  verified; null without the key, or when the key is not the sender's. */
async function openMegolm(state: MatrixState, roomId: string, eventId: string, sender: string, locked: NonNullable<MatrixMessage['locked']>): Promise<{ type: string; content: Json; unverified?: true } | null> {
  const key = `${roomId} ${locked.sessionId}`;
  const inbound = state.inbound[key];
  if (!inbound) return null;
  const owner = ownerCheck(state, inbound, sender);
  if (owner === 'refused') {
    // A key whose device turned out not to be its sender's goes, so the right one can still come.
    if (inbound.untied) delete state.inbound[key];
    return null;
  }
  let opened: { session: Json; index: number; plaintext: string };
  try {
    opened = await core('megolm_decrypt', { session: inbound.session, ciphertext: locked.ciphertext });
  } catch {
    return null;
  }
  // The same index under the same session with another event is a replay: refused.
  const seenKey = `${locked.sessionId} ${opened.index}`;
  if (state.seen[seenKey] && state.seen[seenKey] !== eventId) return null;
  state.seen[seenKey] = eventId;
  // What opened has to be an event: one that is not (a client's doing) is let go of, not thrown
  // on, which would stop the whole sync at this batch for good.
  const payload = jsonObject(opened.plaintext);
  if (!payload || payload.room_id !== roomId) return null;
  return { type: String(payload.type), content: (payload.content as Json) ?? {}, ...(owner === 'unverified' ? { unverified: true as const } : {}) };
}

/** Takes in one to-device event: a room key sent us through Olm, or a call's. Answers whether a
 *  locked message opened with it, or the call took it. */
async function takeToDevice(state: MatrixState, event: Json): Promise<boolean> {
  if (event.type !== 'm.room.encrypted') {
    // Sent as it is: the call decides what to make of that.
    if (!isCallEvent(event.type)) return false;
    return passCall(state, { type: event.type, content: (event.content as Json) ?? {}, sender: String(event.sender), ts: Date.now(), encrypted: false });
  }
  const content = (event.content as Json) ?? {};
  const ours = await core<{ curve25519: string; ed25519: string }>('account_keys', { account: state.account });
  const mine = (content.ciphertext as Record<string, { type: number; body: string }> | undefined)?.[ours.curve25519];
  if (content.algorithm !== OLM || !mine) return false;
  const senderKey = String(content.sender_key);
  let opened: { account: Json; session: Json; index: number; plaintext: string };
  try {
    opened = await core('olm_decrypt', { account: state.account, sessions: state.olm[senderKey] ?? [], sender_key: senderKey, type: mine.type, body: mine.body });
  } catch {
    return false;
  }
  state.account = opened.account;
  const sessions = (state.olm[senderKey] ?? []).filter((_, i) => i !== opened.index);
  state.olm[senderKey] = [opened.session, ...sessions].slice(0, 5);
  const payload = jsonObject(opened.plaintext);
  if (!payload) return false;
  // The payload has to say it is from the sender and for us, as Matrix asks to check.
  if (payload.sender !== event.sender || payload.recipient !== state.userId) return false;
  if ((payload.recipient_keys as Json | undefined)?.ed25519 !== ours.ed25519) return false;
  const claimed = (payload.keys as Json | undefined)?.ed25519;
  let known = Object.values(state.devices[String(event.sender)] ?? {}).find((d) => d.curve25519 === senderKey);
  if (known && known.ed25519 !== claimed) return false;
  if (isVerification(payload.type, payload.content as Json)) return passVerification(state, { type: String(payload.type), content: (payload.content as Json) ?? {}, sender: String(event.sender) });
  if (isCallEvent(payload.type)) {
    const device = typeof payload.sender_device === 'string' ? payload.sender_device : known ? Object.entries(state.devices[String(event.sender)] ?? {}).find(([, d]) => d.curve25519 === senderKey)?.[0] : undefined;
    return passCall(state, { type: payload.type, content: (payload.content as Json) ?? {}, sender: String(event.sender), ts: Date.now(), encrypted: true, ...(device ? { senderDevice: device } : {}) });
  }
  if (payload.type !== 'm.room_key') return false;
  const key = (payload.content as Json) ?? {};
  if (key.algorithm !== MEGOLM || typeof key.room_id !== 'string' || typeof key.session_key !== 'string') return false;
  const made = await core<{ session: Json; session_id: string }>('megolm_inbound', { session_key: key.session_key });
  if (made.session_id !== key.session_id) return false;
  const roomId = key.room_id;
  const sender = String(event.sender);
  // A key can come before the device that sent it is known: its list is asked for again, and a
  // device still not known leaves the session untied, what opens with it not verified (ownerCheck).
  if (!known) {
    if (!state.outdated.includes(sender)) state.outdated.push(sender);
    await queryDevices(state, [sender]).catch(() => undefined);
    known = Object.values(state.devices[sender] ?? {}).find((d) => d.curve25519 === senderKey);
    if (known && known.ed25519 !== claimed) return false;
  }
  const holder = deviceOfKey(state, senderKey);
  if (holder && holder.user !== sender) return false;
  if (typeof claimed !== 'string') return false;
  if (!state.inbound[`${roomId} ${made.session_id}`]) state.inbound[`${roomId} ${made.session_id}`] = { session: made.session, senderKey, sender, ed25519: claimed, ...(known ? {} : { untied: true as const }) };
  return retryLocked(state, roomId, made.session_id);
}

/** Opens the messages of `roomId` locked under `sessionId`, now that its key is here. */
export async function retryLocked(state: MatrixState, roomId: string, sessionId: string): Promise<boolean> {
  const room = state.rooms[roomId];
  if (!room) return false;
  let any = false;
  for (const message of [...room.messages]) {
    if (message.locked?.sessionId !== sessionId) continue;
    const opened = await openMegolm(state, roomId, message.id, message.sender, message.locked);
    if (!opened) continue;
    any = true;
    if (opened.unverified) message.unverified = true;
    if (opened.type === 'm.room.message' && (opened.content['m.relates_to'] as Json | undefined)?.rel_type !== 'm.replace') {
      Object.assign(message, shownOf(opened.content));
      delete message.locked;
      continue;
    }
    // Not a message after all (a reaction, a change): it goes on what it is about, and its place goes.
    room.messages = room.messages.filter((m) => m !== message);
    await takeContent(state, roomId, message, opened.type, opened.content, {}, true);
  }
  return any;
}

/** Everyone in a room who should be able to read what we send: those in it and those invited. */
async function membersOf(state: MatrixState, roomId: string): Promise<string[]> {
  const answer = await call(state, 'GET', `/rooms/${enc(roomId)}/members?not_membership=leave`);
  const room = roomOf(state, roomId);
  for (const event of (answer.chunk as Json[] | undefined) ?? []) takeState(room, event);
  return Object.keys(room.members);
}

/**
 * Brings the devices of `users` up to date, keeping only those whose keys are signed by themselves.
 * The homeserver could add a device to anyone's list, ours too, and it would get the room keys: a
 * device new in a list that came after the first is still given them, as a member's new phone
 * should be, but the next room whose key goes out says so (shareRoomKey). A device we knew keeps
 * its keys: one that comes back with others is kept as it was, marked, and given nothing more, as
 * Element does.
 */
async function queryDevices(state: MatrixState, users: string[]): Promise<void> {
  const need = users.filter((u) => !state.devices[u] || state.outdated.includes(u));
  if (!need.length) return;
  const answer = await call(state, 'POST', '/keys/query', { device_keys: Object.fromEntries(need.map((u) => [u, []])) });
  const all = (answer.device_keys as Record<string, Record<string, Json>> | undefined) ?? {};
  for (const user of need) {
    const kept: Record<string, Device> = {};
    const had = state.devices[user];
    for (const [deviceId, keys] of Object.entries(all[user] ?? {})) {
      if (keys.user_id !== user || keys.device_id !== deviceId) continue;
      const k = (keys.keys as Json) ?? {};
      const ed25519 = String(k[`ed25519:${deviceId}`] ?? '');
      const curve25519 = String(k[`curve25519:${deviceId}`] ?? '');
      if (!ed25519 || !curve25519) continue;
      const before = had?.[deviceId];
      if (before && (before.changed || before.ed25519 !== ed25519)) {
        kept[deviceId] = before.changed ? before : { ...before, changed: true, unsaid: 'changed' };
        continue;
      }
      const { ok } = await core<{ ok: boolean }>('verify_json', { json: keys, key: ed25519, user_id: user, key_id: `ed25519:${deviceId}` });
      if (!ok) continue;
      const ours = user === state.userId && deviceId === state.deviceId;
      const unsaid = before ? before.unsaid : had && !ours ? 'new' : undefined;
      kept[deviceId] = { curve25519, ed25519, ...(unsaid ? { unsaid } : {}) };
    }
    state.devices[user] = kept;
    state.outdated = state.outdated.filter((u) => u !== user);
  }
}

/** The Megolm session to send with in `roomId`: the one in use, or a new one when it is old or someone left. */
async function outboundFor(state: MatrixState, roomId: string, members: string[]): Promise<Outbound> {
  const now = Date.now();
  const current = state.outbound[roomId];
  const someoneLeft = current?.sharedWith.some((d) => !members.includes(d.slice(0, d.lastIndexOf(' '))));
  if (current && !someoneLeft && current.count < ROTATE_MESSAGES && now - current.created < ROTATE_MS) return current;
  const made = await core<{ session: Json; session_id: string; session_key: string }>('megolm_new', {});
  // We read our own messages with it too, as they come back in the sync.
  const own = await core<{ session: Json; session_id: string }>('megolm_inbound', { session_key: made.session_key });
  const ours = await core<{ curve25519: string; ed25519: string }>('account_keys', { account: state.account });
  state.inbound[`${roomId} ${own.session_id}`] = { session: own.session, senderKey: ours.curve25519, sender: state.userId, ed25519: ours.ed25519 };
  const next: Outbound = { session: made.session, sessionId: made.session_id, created: now, count: 0, sharedWith: [] };
  state.outbound[roomId] = next;
  return next;
}

/** One device to send to through Olm. */
type Target = { user: string; deviceId: string; device: Device };

/** Olm-encrypts to each of `targets` what `payloadOf` gives it, claiming a one-time key for a
 *  device with no session yet. Answers the to-device messages, by user and device, and the devices
 *  they are for: one whose one-time key cannot be had, or is not signed by it, is left out. */
async function sealToDevices<T extends Target>(state: MatrixState, targets: T[], payloadOf: (target: T) => { type: string; content: Json }): Promise<{ messages: Record<string, Record<string, Json>>; sealed: T[] }> {
  const noSession = targets.filter((d) => !state.olm[d.device.curve25519]?.length);
  const claimed: Record<string, string> = {};
  if (noSession.length) {
    const ask: Record<string, Record<string, string>> = {};
    for (const d of noSession) (ask[d.user] ??= {})[d.deviceId] = 'signed_curve25519';
    const answer = await call(state, 'POST', '/keys/claim', { one_time_keys: ask });
    const got = (answer.one_time_keys as Record<string, Record<string, Record<string, Json>>> | undefined) ?? {};
    for (const d of noSession) {
      const keys = got[d.user]?.[d.deviceId] ?? {};
      const [keyId, key] = Object.entries(keys)[0] ?? [];
      if (!keyId || !key) continue;
      const { ok } = await core<{ ok: boolean }>('verify_json', { json: key, key: d.device.ed25519, user_id: d.user, key_id: `ed25519:${d.deviceId}` });
      if (ok) claimed[d.device.curve25519] = String(key.key);
    }
  }
  const ours = await core<{ curve25519: string; ed25519: string }>('account_keys', { account: state.account });
  const messages: Record<string, Record<string, Json>> = {};
  const sealed: T[] = [];
  for (const d of targets) {
    const session = state.olm[d.device.curve25519]?.[0];
    if (!session && !claimed[d.device.curve25519]) continue;
    const payload = {
      ...payloadOf(d),
      sender: state.userId,
      sender_device: state.deviceId,
      keys: { ed25519: ours.ed25519 },
      recipient: d.user,
      recipient_keys: { ed25519: d.device.ed25519 },
    };
    const made = await core<{ session: Json; type: number; body: string }>('olm_encrypt', {
      account: state.account,
      session: session ?? null,
      identity_key: d.device.curve25519,
      one_time_key: claimed[d.device.curve25519] ?? null,
      plaintext: JSON.stringify(payload),
    });
    state.olm[d.device.curve25519] = [made.session, ...(state.olm[d.device.curve25519] ?? []).slice(session ? 1 : 0)].slice(0, 5);
    (messages[d.user] ??= {})[d.deviceId] = {
      algorithm: OLM,
      sender_key: ours.curve25519,
      ciphertext: { [d.device.curve25519]: { type: made.type, body: made.body } },
    };
    sealed.push(d);
  }
  return { messages, sealed };
}

/** Gives the room's current Megolm key to every member device that does not have it yet, but one
 *  that changed its keys; the room says first when one is new or changed, once for each. */
async function shareRoomKey(state: MatrixState, roomId: string, outbound: Outbound, members: string[]): Promise<void> {
  await queryDevices(state, members);
  const targets: Target[] = [];
  for (const user of members) {
    for (const [deviceId, device] of Object.entries(state.devices[user] ?? {})) {
      if (user === state.userId && deviceId === state.deviceId) continue;
      if (device.unsaid) {
        addMatrixCallLine(state, roomId, user === state.userId, deviceLine(device.unsaid, user), `device ${device.unsaid} ${user} ${deviceId}`);
        delete device.unsaid;
      }
      if (device.changed || outbound.sharedWith.includes(`${user} ${deviceId}`)) continue;
      targets.push({ user, deviceId, device });
    }
  }
  if (!targets.length) return;
  // The key as it is now: a member who comes later reads from here on, not what came before.
  const { session_key } = await core<{ session_key: string }>('megolm_session_key', { session: outbound.session });
  const { messages, sealed } = await sealToDevices(state, targets, () => ({
    type: 'm.room_key',
    content: { algorithm: MEGOLM, room_id: roomId, session_id: outbound.sessionId, session_key },
  }));
  for (const d of sealed) outbound.sharedWith.push(`${d.user} ${d.deviceId}`);
  if (Object.keys(messages).length) await call(state, 'PUT', `/sendToDevice/m.room.encrypted/${txn()}`, { messages });
}

/** Sends an event of `type` to devices, encrypted through Olm: `to` gives, by user, the content for
 *  each of their device IDs, or for all of them under '*'. This device is left out. */
export async function sendToDeviceSealed(state: MatrixState, type: string, to: Record<string, Record<string, Json>>): Promise<void> {
  await queryDevices(state, Object.keys(to));
  const targets: (Target & { content: Json })[] = [];
  for (const [user, devices] of Object.entries(to)) {
    for (const [deviceId, device] of Object.entries(state.devices[user] ?? {})) {
      if ((user === state.userId && deviceId === state.deviceId) || device.changed) continue;
      const content = devices[deviceId] ?? devices['*'];
      if (content) targets.push({ user, deviceId, device, content });
    }
  }
  if (!targets.length) return;
  const { messages } = await sealToDevices(state, targets, (d) => ({ type, content: d.content }));
  if (Object.keys(messages).length) await call(state, 'PUT', `/sendToDevice/m.room.encrypted/${txn()}`, { messages });
}

/** Sends a to-device event as it is, not encrypted, to devices by user then device ID ('*' for all of a user's). */
export async function sendToDevicePlain(state: MatrixState, type: string, to: Record<string, Record<string, Json>>): Promise<void> {
  await call(state, 'PUT', `/sendToDevice/${enc(type)}/${txn()}`, { messages: to });
}

/** Sends `text` to a room, encrypted when the room is. Answers the message as it now shows. */
/** Sends words, naming `mentions`; `extra` goes with them, such as the preview of a link in them (lib/matrix-parts.ts). */
export function sendText(state: MatrixState, roomId: string, text: string, mentions: string[] = [], extra: Json = {}): Promise<MatrixMessage> {
  return sendContent(state, roomId, { msgtype: 'm.text', body: text, ...formattedOf(text), ...mentionsOf(mentions), ...extra });
}

/**
 * Sends words in the thread of `root` (m.thread), as an answer to `answers` there when given;
 * otherwise as the thread's latest message, which an app without threads shows as an answer to it.
 */
export function sendInThread(state: MatrixState, roomId: string, root: string, text: string, answers?: string, mentions: string[] = [], extra: Json = {}): Promise<MatrixMessage> {
  return sendContent(state, roomId, { msgtype: 'm.text', body: text, ...formattedOf(text), 'm.relates_to': threadRelation(root, latestIn(state, roomId, root), answers), ...mentionsOf(mentions), ...extra });
}

/** Sends a poll (lib/matrix-parts.ts), as Element sends one. */
export function sendPoll(state: MatrixState, roomId: string, poll: Poll): Promise<MatrixMessage> {
  return sendContent(state, roomId, pollContent(poll), POLL_START[0]);
}

/** Votes on the poll `target` with the answers `ids`; none takes our vote back. */
export async function sendVote(state: MatrixState, roomId: string, target: string, ids: string[]): Promise<void> {
  const poll = roomOf(state, roomId).messages.find((m) => m.id === target)?.poll;
  if (!poll || pollOver(poll)) throw new Error(t('This poll has ended.'));
  await sendEvent(state, roomId, POLL_RESPONSE[0], voteContent(target, ids));
  takeVote(poll, state.userId, ids, Date.now());
}

/** Ends a poll of ours: no more votes count. */
export async function sendPollEnd(state: MatrixState, roomId: string, target: string): Promise<void> {
  const message = roomOf(state, roomId).messages.find((m) => m.id === target);
  if (!message?.poll || message.sender !== state.userId) throw new Error(t('Only who made a poll can end it.'));
  await sendEvent(state, roomId, POLL_END[0], endContent(target, t('The poll has ended.')));
  // Ended when the homeserver says, by its clock, as the votes are: until then, closing.
  if (message.poll.ended === undefined) message.poll.closing = true;
}

/** Sends where we are, once (m.location). */
export function sendLocation(state: MatrixState, roomId: string, where: Place, thread?: string): Promise<MatrixMessage> {
  const content = locationContent(where, t('Location'));
  return sendContent(state, roomId, thread ? { ...content, 'm.relates_to': threadRelation(thread, latestIn(state, roomId, thread)) } : content);
}

/** The relation that puts what is sent in the thread of `root`, after its latest message. */
export function threadFor(state: MatrixState, roomId: string, root: string): Json {
  return threadRelation(root, latestIn(state, roomId, root));
}

/** The latest message in the thread of `root`, or the root itself. */
function latestIn(state: MatrixState, roomId: string, root: string): string {
  return roomOf(state, roomId).messages.filter((m) => !m.state && (m.thread === root || m.id === root)).at(-1)?.id ?? root;
}

/** Who a message names (m.mentions), so their apps tell them of it, as Element does; inside the encryption in an encrypted room. */
function mentionsOf(userIds: string[]): Json {
  const named = [...new Set(userIds.filter(isMatrixId))].slice(0, 32);
  return named.length ? { 'm.mentions': { user_ids: named } } : {};
}

/** Sends a message's content to a room, encrypted when the room is: an m.room.message, or a poll's start. */
export async function sendContent(state: MatrixState, roomId: string, content: Json, type = 'm.room.message'): Promise<MatrixMessage> {
  const room = roomOf(state, roomId);
  const id = txn();
  const poll = POLL_START.includes(type) ? pollOfContent(content) : null;
  const shown = poll ? { text: '', poll } : type === STICKER ? stickerShown(content) : shownOf(content);
  const message: MatrixMessage = { id, sender: state.userId, ts: Date.now(), ...shown, state: 'sending' };
  room.messages.push(message);
  try {
    message.id = await sendEvent(state, roomId, type, content, id);
    delete message.state;
  } catch (error) {
    message.state = 'failed';
    throw error;
  }
  return message;
}

/** Answers the message `replyTo` with `text`. */
export function sendReply(state: MatrixState, roomId: string, text: string, replyTo: string, mentions: string[] = [], extra: Json = {}): Promise<MatrixMessage> {
  return sendContent(state, roomId, { msgtype: 'm.text', body: text, ...formattedOf(text), 'm.relates_to': { 'm.in_reply_to': { event_id: replyTo } }, ...mentionsOf(mentions), ...extra });
}

/** Reacts to a message with `key`, an emoji; once only. */
export async function sendReaction(state: MatrixState, roomId: string, target: string, key: string): Promise<void> {
  const room = roomOf(state, roomId);
  if (room.messages.find((m) => m.id === target)?.reactions?.[key]?.includes(state.userId)) return;
  const relation = { rel_type: 'm.annotation', event_id: target, key };
  // Sent as it is, as Element does: its relation, key included, is readable to the homeserver
  // anyway, so encrypting it would hide only its kind, and would wake the other's phone for it
  // (Matrix's push rules let a plain reaction be, not an encrypted one).
  const sent = await call(state, 'PUT', `/rooms/${enc(roomId)}/send/m.reaction/${txn()}`, { 'm.relates_to': relation });
  const id = String(sent.event_id);
  react(room, { id, sender: state.userId }, relation);
}

/** Takes back our reaction `key` on a message. */
export async function takeBackReaction(state: MatrixState, roomId: string, target: string, key: string): Promise<void> {
  const room = roomOf(state, roomId);
  const ours = Object.entries(room.reactionsBy ?? {}).find(([, r]) => r.target === target && r.key === key && r.sender === state.userId);
  if (!ours) return;
  await redactEvent(state, roomId, ours[0]);
  redact(room, ours[0]);
}

/** Changes the words of a message of ours (m.replace), for everyone in the room. */
export async function sendChange(state: MatrixState, roomId: string, target: string, text: string): Promise<void> {
  const room = roomOf(state, roomId);
  const message = room.messages.find((m) => m.id === target);
  if (!message || message.sender !== state.userId || message.deleted || message.state || message.poll || message.place) throw new Error(t('Only a message of yours that went can be changed.'));
  // Its new look goes too, for the apps that show the change, and for those that show only what changed it.
  const formatted = formattedOf(text);
  await sendEvent(state, roomId, 'm.room.message', {
    msgtype: 'm.text',
    body: `* ${text}`,
    ...(formatted.formatted_body ? { format: formatted.format, formatted_body: `* ${formatted.formatted_body}` } : {}),
    'm.new_content': { msgtype: 'm.text', body: text, ...formatted },
    'm.relates_to': { rel_type: 'm.replace', event_id: target },
  });
  message.text = text;
  message.edited = Date.now();
  delete message.preview;
  // Its marks show as they are typed.
  delete message.styled;
}

/** Takes back a message, for everyone in the room (a redaction): ours, or anyone's where we may. */
export async function deleteMessage(state: MatrixState, roomId: string, target: string): Promise<void> {
  await redactEvent(state, roomId, target);
  redact(roomOf(state, roomId), target);
}

async function redactEvent(state: MatrixState, roomId: string, eventId: string): Promise<void> {
  await call(state, 'PUT', `/rooms/${enc(roomId)}/redact/${enc(eventId)}/${txn()}`, {});
}

/**
 * Fetches up to `count` messages from before the oldest here (/messages), and opens them: those
 * still locked may open from the key backup later. Without a place to start from, the newest page
 * comes first and what is already here is passed over. Answers how many new messages came.
 */
export async function loadEarlier(state: MatrixState, roomId: string, count = 40): Promise<number> {
  const room = state.rooms[roomId];
  if (!room || room.start) return 0;
  let added = 0;
  for (let page = 0; page < 5 && !added; page++) {
    const from = room.before ? `&from=${enc(room.before)}` : '';
    const answer = await call(state, 'GET', `/rooms/${enc(roomId)}/messages?dir=b&limit=${count}${from}&filter=${enc(JSON.stringify({ lazy_load_members: true }))}`);
    const chunk = (answer.chunk as Json[] | undefined) ?? [];
    for (const event of [...chunk].reverse()) {
      if (typeof event.state_key === 'string' || typeof event.event_id !== 'string') continue;
      if (room.messages.some((m) => m.id === event.event_id)) continue;
      const known = room.messages.length;
      if ((await takeEvent(state, roomId, event, true)) && room.messages.length > known) added += room.messages.length - known;
    }
    if (typeof answer.end === 'string' && chunk.length) room.before = answer.end;
    else {
      room.start = true;
      delete room.before;
      // Nothing older is left for what still waits.
      delete room.waiting;
      break;
    }
  }
  room.keep = Math.min(MOST_KEPT, Math.max(room.keep ?? KEEP_MESSAGES, room.messages.length));
  return added;
}

/** Sends an event of any `type` to a room, encrypted when the room is, and answers its ID. */
export async function sendEvent(state: MatrixState, roomId: string, type: string, content: Json, id = txn()): Promise<string> {
  const room = roomOf(state, roomId);
  let sent: Json;
  {
    if (room.encrypted) {
      const members = await membersOf(state, roomId);
      const outbound = await outboundFor(state, roomId, members);
      await shareRoomKey(state, roomId, outbound, members);
      const sealed = await core<{ session: Json; ciphertext: string }>('megolm_encrypt', {
        session: outbound.session,
        plaintext: JSON.stringify({ type, content, room_id: roomId }),
      });
      outbound.session = sealed.session;
      outbound.count += 1;
      const ours = await core<{ curve25519: string }>('account_keys', { account: state.account });
      sent = await call(state, 'PUT', `/rooms/${enc(roomId)}/send/m.room.encrypted/${id}`, {
        algorithm: MEGOLM,
        sender_key: ours.curve25519,
        ciphertext: sealed.ciphertext,
        session_id: outbound.sessionId,
        device_id: state.deviceId,
        // A relation stays readable to the homeserver, as Matrix has it, so it can bundle them.
        ...(content['m.relates_to'] ? { 'm.relates_to': content['m.relates_to'] } : {}),
      });
    } else {
      sent = await call(state, 'PUT', `/rooms/${enc(roomId)}/send/${enc(type)}/${id}`, content);
    }
  }
  return String(sent.event_id);
}

/** Sets a piece of a room's state (never encrypted, as Matrix keeps state readable to the
 *  homeserver), and answers its event's ID. */
export async function sendStateEvent(state: MatrixState, roomId: string, type: string, stateKey: string, content: Json): Promise<string> {
  const sent = await call(state, 'PUT', `/rooms/${enc(roomId)}/state/${enc(type)}/${enc(stateKey)}`, content);
  return String(sent.event_id);
}

/** A room's state as the homeserver has it now: each piece's latest event, `room_id` set. */
export async function roomState(state: MatrixState, roomId: string): Promise<Json[]> {
  const answer = (await call(state, 'GET', `/rooms/${enc(roomId)}/state`)) as unknown;
  return Array.isArray(answer) ? (answer as Json[]).map((event) => ({ ...event, room_id: roomId })) : [];
}

const DELAYED = 'org.matrix.msc4140';

/** Sets a piece of a room's state after `delayMs`, unless told otherwise before then (MSC4140):
 *  the homeserver keeps it back meanwhile. A call's "left the call" waits so, and goes out by itself
 *  if the phone goes quiet. Answers the delay's ID. */
export async function sendDelayedState(state: MatrixState, roomId: string, type: string, stateKey: string, content: Json, delayMs: number): Promise<string> {
  try {
    const sent = await unstable(state, DELAYED, 'PUT', `/rooms/${enc(roomId)}/delayed_event/${enc(type)}/${txn()}`, { delay_ms: delayMs, state_key: stateKey, content });
    return String(sent.delay_id);
  } catch (error) {
    if (!(error instanceof MatrixError && error.code === 'M_UNRECOGNIZED')) throw error;
  }
  // A homeserver with MSC4140 as it was first: the delay asked of the usual request.
  const sent = await call(state, 'PUT', `/rooms/${enc(roomId)}/state/${enc(type)}/${enc(stateKey)}?${DELAYED}.delay=${Math.round(delayMs)}`, content);
  return String(sent.delay_id);
}

/** Tells the homeserver what to do with a delayed event now: send it, wait again from now, or drop it. */
export async function updateDelayed(state: MatrixState, delayId: string, action: 'send' | 'restart' | 'cancel'): Promise<void> {
  try {
    await unstable(state, DELAYED, 'POST', `/delayed_events/${enc(delayId)}/${action}`, {});
    return;
  } catch (error) {
    if (!(error instanceof MatrixError && error.code === 'M_UNRECOGNIZED')) throw error;
  }
  await unstable(state, DELAYED, 'POST', `/delayed_events/${enc(delayId)}`, { action });
}

/** Where a call's media may go (MSC4143): the media servers the homeserver lists, or, from a
 *  homeserver that lists none, those its server's .well-known names, as servers said before. */
export async function rtcTransports(state: MatrixState): Promise<Json[]> {
  try {
    const listed = (await unstable(state, 'org.matrix.msc4143', 'GET', '/rtc/transports')).rtc_transports;
    if (Array.isArray(listed) && listed.length) return listed as Json[];
  } catch {
    // None listed: the .well-known then.
  }
  const server = state.userId.slice(state.userId.indexOf(':') + 1);
  const answer = await http({ method: 'GET', url: `https://${server}/.well-known/matrix/client`, tor: matrixWayOf(state) });
  const foci = answer.status === 200 ? answer.json['org.matrix.msc4143.rtc_foci'] : undefined;
  return Array.isArray(foci) ? (foci as Json[]) : [];
}

/** A token that proves to another service who this account is (OpenID), as a call's media
 *  server asks for (MatrixRTC with LiveKit). It says only the account, for an hour or so. */
export async function openIdToken(state: MatrixState): Promise<Json> {
  return call(state, 'POST', `/user/${enc(state.userId)}/openid/request_token`, {});
}

/** A call's line in `roomId`, kept here only; one with the same `id` is replaced. A missed call
 *  counts as not read. */
export function addMatrixCallLine(state: MatrixState, roomId: string, mine: boolean, text: string, id: string, at = Date.now()): void {
  const room = state.rooms[roomId];
  if (!room) return;
  const missed = !mine && text.includes('Missed ');
  const before = room.messages.find((m) => m.call && m.id === id);
  if (before) {
    if (before.sender !== state.userId && before.text.includes('Missed ') && !missed && room.unread > 0) room.unread -= 1;
    before.text = text;
    if (mine) before.sender = state.userId;
    return;
  }
  const others = Object.keys(room.members).filter((m) => m !== state.userId);
  room.messages.push({ id, sender: mine ? state.userId : (others[0] ?? ''), ts: at, text, call: true });
  room.messages.sort((a, b) => a.ts - b.ts);
  room.messages = room.messages.slice(-KEEP_MESSAGES);
  if (missed) room.unread += 1;
}

/** Starts an encrypted chat with one person, by their Matrix ID. Answers the room. */
export async function startChat(state: MatrixState, userId: string): Promise<MatrixRoom> {
  const who = userId.trim();
  if (!isMatrixId(who)) throw new Error(t('Write a Matrix ID, such as @name:matrix.org.'));
  const made = await call(state, 'POST', '/createRoom', {
    preset: 'trusted_private_chat',
    is_direct: true,
    invite: [who],
    initial_state: [{ type: 'm.room.encryption', state_key: '', content: { algorithm: MEGOLM } }],
  });
  const room = roomOf(state, String(made.room_id));
  room.encrypted = true;
  room.direct = true;
  room.members[state.userId] = { membership: 'join' };
  room.members[who] = { membership: 'invite' };
  room.name = who;
  // Element lists a chat with one person apart because of m.direct: ours keeps every such room.
  const direct: Record<string, string[]> = {};
  for (const r of Object.values(state.rooms)) {
    if (!r.direct) continue;
    for (const member of Object.keys(r.members)) if (member !== state.userId) (direct[member] ??= []).push(r.id);
  }
  await call(state, 'PUT', `/user/${enc(state.userId)}/account_data/m.direct`, direct);
  return room;
}

/** The most people a new group is made with at once. */
export const MOST_INVITED = 50;

/**
 * Makes a group: a room for those invited only (private_chat), encrypted, with its name, as
 * Element makes one; `invite` are Matrix IDs, each asked to join.
 */
export async function createGroup(state: MatrixState, name: string, invite: string[]): Promise<MatrixRoom> {
  const named = name.trim().slice(0, 100);
  if (!named) throw new Error(t('Give the group a name.'));
  const people = [...new Set(invite.map((who) => who.trim()).filter(Boolean))];
  const wrong = people.find((who) => !isMatrixId(who));
  if (wrong) throw new Error(t('Write a Matrix ID, such as @name:matrix.org.'));
  if (people.length > MOST_INVITED) throw new Error(t('At most {count} people at once.', { count: MOST_INVITED }));
  const made = await call(state, 'POST', '/createRoom', {
    preset: 'private_chat',
    name: named,
    invite: people.filter((who) => who !== state.userId),
    initial_state: [{ type: 'm.room.encryption', state_key: '', content: { algorithm: MEGOLM } }],
  });
  const room = roomOf(state, String(made.room_id));
  room.encrypted = true;
  room.direct = false;
  room.name = named;
  room.members[state.userId] = { membership: 'join' };
  for (const who of people) if (who !== state.userId) room.members[who] = { membership: 'invite' };
  return room;
}

/** Asks someone to join a room we are in. */
export async function inviteToRoom(state: MatrixState, roomId: string, userId: string): Promise<void> {
  const who = userId.trim();
  if (!isMatrixId(who)) throw new Error(t('Write a Matrix ID, such as @name:matrix.org.'));
  await call(state, 'POST', `/rooms/${enc(roomId)}/invite`, { user_id: who });
  const room = state.rooms[roomId];
  if (room && room.members[who]?.membership !== 'join') room.members[who] = { ...(room.members[who] ?? {}), membership: 'invite' };
}

/** Joins a room we were invited to, or one by its ID or #alias:server. */
export async function joinRoom(state: MatrixState, idOrAlias: string): Promise<string> {
  const joined = await call(state, 'POST', `/join/${enc(idOrAlias.trim())}`, {});
  const id = String(joined.room_id);
  const room = roomOf(state, id);
  delete room.invitedBy;
  room.members[state.userId] = { membership: 'join' };
  return id;
}

/** Leaves a room, or says no to an invite. */
export async function leaveRoom(state: MatrixState, roomId: string): Promise<void> {
  await call(state, 'POST', `/rooms/${enc(roomId)}/leave`, {});
  delete state.rooms[roomId];
  delete state.outbound[roomId];
}

/** How many messages from others came in this sync (not among `had`) after the room was last read here. */
export function freshFromOthers(state: MatrixState, room: MatrixRoom, had: ReadonlySet<string>): number {
  const read = room.readTs ?? 0;
  return room.messages.filter((m) => !had.has(m.id) && m.sender !== state.userId && !m.state && !m.deleted && m.ts > read).length;
}

/** How many messages from others the room has after it was last read, here or on another of our devices. */
export function sinceRead(state: MatrixState, room: MatrixRoom): number {
  const read = room.readTs ?? 0;
  return room.messages.filter((m) => m.sender !== state.userId && !m.state && !m.deleted && m.ts > read).length;
}

/**
 * Whether a message from someone else came after the room was last read here. Until then a count
 * of the homeserver's above nothing is one from before it heard of the read (a sync on its way, a
 * receipt not taken), and the room stays read: it is not told of again.
 */
export function newSinceRead(state: MatrixState, room: MatrixRoom): boolean {
  if (room.readTs === undefined) return true;
  const read = room.readTs;
  return room.messages.some((m) => m.sender !== state.userId && m.ts > read);
}

/** Tells the homeserver we read the room up to its last message. */
export async function markRead(state: MatrixState, roomId: string): Promise<void> {
  const room = state.rooms[roomId];
  if (!room) return;
  // Up to its last message the homeserver knows by its own ID: one kept only here (a call's line)
  // or not sent yet has none it would take.
  const last = room.messages.filter((m) => !m.state && m.id.startsWith('$')).at(-1);
  room.unread = 0;
  room.readTs = Math.max(room.readTs ?? 0, room.messages.at(-1)?.ts ?? Date.now());
  if (last) await call(state, 'POST', `/rooms/${enc(roomId)}/receipt/m.read/${enc(last.id)}`, {});
}

/** The rooms as a list shows them: invites first, then by their newest message. */
export function roomList(state: MatrixState): MatrixRoom[] {
  const last = (r: MatrixRoom) => r.messages.at(-1)?.ts ?? 0;
  return Object.values(state.rooms).sort((a, b) => Number(!!b.invitedBy) - Number(!!a.invitedBy) || last(b) - last(a));
}
