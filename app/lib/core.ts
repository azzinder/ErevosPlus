// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { setHardKey, utf8Decode, utf8Encode } from './crypto';
import { t } from './i18n';
// The Erevos core (Rust, crates/erevos-ffi): PQXDH to start a conversation and the double ratchet
// for every message after it. The app plugs in the core at startup: the Android module
// (modules/erevos-core), or for checks under Node the same core built to WebAssembly. The core
// keeps nothing between calls. What it returns, the app keeps sealed and passes in again.
// Self-contained on purpose, so it can run under plain Node for checks.

/** The core's calls, as both the Android module and the WebAssembly build give them. */
export interface Core {
  accountNew(): Promise<Uint8Array>;
  accountBundle(account: Uint8Array): Promise<Uint8Array>;
  accountIdentity(account: Uint8Array): Promise<Uint8Array>;
  bundleIdentity(bundle: Uint8Array): Promise<Uint8Array>;
  conversationStart(account: Uint8Array, bundle: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array>;
  conversationAccept(account: Uint8Array, packet: Uint8Array): Promise<Uint8Array>;
  conversationSeal(conversation: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array>;
  conversationOpen(conversation: Uint8Array, packet: Uint8Array): Promise<Uint8Array>;
  conversationPeer(conversation: Uint8Array): Promise<Uint8Array>;
  /** Missing in a build made before conversations were made safe after a restore. */
  conversationRestored?(conversation: Uint8Array): Promise<Uint8Array>;
  /** The post-quantum ratchet (crates/erevos-core spqr). Missing in a build made before it. */
  conversationEnablePq?(conversation: Uint8Array): Promise<Uint8Array>;
  conversationPq?(conversation: Uint8Array): Promise<Uint8Array>;
  packetKind(packet: Uint8Array): Promise<number>;
  firstMessageId(packet: Uint8Array): Promise<Uint8Array>;
  safetyNumber(ours: Uint8Array, theirs: Uint8Array): Promise<string>;
  importChats(name: Uint8Array, data: Uint8Array): Promise<Uint8Array>;
  /** Missing in a build made before two-hop sending. */
  relaySeal?(relayKey: Uint8Array, senderId: Uint8Array, message: Uint8Array): Promise<Uint8Array>;
  sealPublic?(secret: Uint8Array): Promise<Uint8Array>;
  /** Pairing by a short code (crates/erevos-core cpace, lib/pair-code.ts). Missing in a build made before it. */
  pairStart?(code: Uint8Array, channel: Uint8Array, session: Uint8Array): Promise<Uint8Array>;
  pairFinish?(secret: Uint8Array, session: Uint8Array, started: Uint8Array, answered: Uint8Array, ownStarted: Uint8Array): Promise<Uint8Array>;
  pairConfirm?(key: Uint8Array, started: Uint8Array): Promise<Uint8Array>;
  pairConfirmed?(key: Uint8Array, started: Uint8Array, tag: Uint8Array): Promise<Uint8Array>;
  /** A voice message's voice changed (crates/erevos-core voice_shift, lib/voice-change.ts). Missing in a build made before it. */
  voiceChange?(pcm: Uint8Array, rate: Uint8Array, kind: Uint8Array): Promise<Uint8Array>;
  /** A voice message written out (crates/erevos-speech, lib/speech.ts): Android only. Missing in a build made before it. */
  speechText?(path: Uint8Array, pcm: Uint8Array, rate: Uint8Array, language: Uint8Array): Promise<Uint8Array>;
  speechLetGo?(nothing: Uint8Array): Promise<Uint8Array>;
  /** A message translated (crates/erevos-speech marian.rs, lib/translate.ts): Android only. Missing in a build made before it. */
  translateText?(path: Uint8Array, from: Uint8Array, to: Uint8Array, text: Uint8Array): Promise<Uint8Array>;
  translateLetGo?(nothing: Uint8Array): Promise<Uint8Array>;
  sealOpen?(secret: Uint8Array, sealed: Uint8Array): Promise<Uint8Array>;
  /** The keys of a channel to a relay (crates/erevos-core relay_channel), phone to relay then relay
   *  to phone, 32 bytes each, once the relay's answer proves it holds `relayKey`'s secret; throws
   *  when it does not. Missing in a build made before the channel. */
  relayChannelKeys?(relayKey: Uint8Array, secret: Uint8Array, answer: Uint8Array): Promise<Uint8Array>;
  /** Argon2id for keys from passwords (lib/crypto.ts hardKey); `cost` is the memory in KiB and the
   *  passes, 4 bytes each, big-endian. Missing in a build made before it. */
  hardKey?(input: Uint8Array, salt: Uint8Array, cost: Uint8Array): Promise<Uint8Array>;
  /** One byte, 1 when `signature` is the Ed25519 signature of `message` by `key`. Missing in a build made before it. */
  signatureVerify?(key: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<Uint8Array>;
  /** Fresh prekeys signed by the account (their secret, then their bundle), and accepting a first
   *  packet with any of them or the contact link's: missing in a build made before prekeys changed. */
  accountPrekeys?(account: Uint8Array): Promise<Uint8Array>;
  conversationAcceptAny?(account: Uint8Array, prekeys: Uint8Array, packet: Uint8Array): Promise<Uint8Array>;
  /** An account's Ed25519 signature of `message` under `context`, and the check of one against a
   *  bundle (its identity key, or nothing when it does not hold): missing in a build made before
   *  linked devices that work with the primary off (docs/multi-device.md). */
  accountSign?(account: Uint8Array, context: Uint8Array, message: Uint8Array): Promise<Uint8Array>;
  bundleVerify?(bundle: Uint8Array, context: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<Uint8Array>;
  accountBind?(account: Uint8Array): Promise<Uint8Array>;
  bundleBound?(bundle: Uint8Array, signature: Uint8Array): Promise<Uint8Array>;
  /** Coupons for a token on a second relay (crates/erevos-core/src/coupon.rs): missing in a build made before them. */
  couponBlind?(spki: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
  couponFinalize?(spki: Uint8Array, blindSignature: Uint8Array, secret: Uint8Array, randomizer: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
  /** Group chats (crates/erevos-group): missing in a build made before them. */
  groupNew?(about: Uint8Array): Promise<Uint8Array>;
  groupKeyPackage?(state: Uint8Array): Promise<Uint8Array>;
  groupSetAbout?(state: Uint8Array, about: Uint8Array): Promise<Uint8Array>;
  groupCreate?(state: Uint8Array): Promise<Uint8Array>;
  groupAdd?(state: Uint8Array, id: Uint8Array, keyPackage: Uint8Array): Promise<Uint8Array>;
  groupRemove?(state: Uint8Array, id: Uint8Array, leaf: Uint8Array): Promise<Uint8Array>;
  groupCommitPending?(state: Uint8Array, id: Uint8Array): Promise<Uint8Array>;
  groupJoin?(state: Uint8Array, welcome: Uint8Array): Promise<Uint8Array>;
  groupSeal?(state: Uint8Array, id: Uint8Array, text: Uint8Array): Promise<Uint8Array>;
  groupLeave?(state: Uint8Array, id: Uint8Array): Promise<Uint8Array>;
  groupForget?(state: Uint8Array, id: Uint8Array): Promise<Uint8Array>;
  groupMembers?(state: Uint8Array, id: Uint8Array): Promise<Uint8Array>;
  groupOf?(message: Uint8Array): Promise<Uint8Array>;
  groupOpen?(state: Uint8Array, message: Uint8Array): Promise<Uint8Array>;
  /** Public groups (docs/public-groups.md): missing in a build made before them. */
  groupNewSigner?(state: Uint8Array): Promise<Uint8Array>;
  groupKeyPackageAs?(state: Uint8Array, key: Uint8Array, about: Uint8Array): Promise<Uint8Array>;
  groupCreatePublic?(state: Uint8Array, key: Uint8Array, about: Uint8Array, rules: Uint8Array): Promise<Uint8Array>;
  groupRules?(state: Uint8Array, id: Uint8Array): Promise<Uint8Array>;
  groupCommit?(state: Uint8Array, id: Uint8Array, keyPackages: Uint8Array, removes: Uint8Array, rules: Uint8Array): Promise<Uint8Array>;
  groupPackageAbout?(keyPackage: Uint8Array): Promise<Uint8Array>;
  groupEpoch?(message: Uint8Array): Promise<Uint8Array>;
  /** New keys in groups (lib/groups.ts RENEW_EVERY): missing in a build made before them. */
  groupRenewal?(state: Uint8Array, id: Uint8Array, about: Uint8Array): Promise<Uint8Array>;
  groupRenew?(state: Uint8Array, id: Uint8Array, leaf: Uint8Array, keyPackage: Uint8Array): Promise<Uint8Array>;
  groupSelfUpdate?(state: Uint8Array, id: Uint8Array): Promise<Uint8Array>;
  /** The keeper's new keys saying a new `about` of its leaf: missing in a build made before queues moved (lib/queue-move.ts). */
  groupSelfUpdateAs?(state: Uint8Array, id: Uint8Array, about: Uint8Array): Promise<Uint8Array>;
  groupRejoin?(state: Uint8Array, id: Uint8Array, welcome: Uint8Array): Promise<Uint8Array>;
  /** Relay requests through Tor: only in the Android app, and not in a build made before it. Bridges one per line. */
  torStart?(bridges: string): Promise<void>;
  torStatus?(): Promise<string>;
  torStop?(): Promise<void>;
  /** The SOCKS5 door into Tor for Signal's and Telegram's engines (lib/tor.ts torSocks), as JSON {port, password}: missing in a build from before it. */
  torSocks?(): Promise<string>;
  torSocksClose?(): Promise<void>;
  torRequest?(url: string, token: string, message: Uint8Array): Promise<Uint8Array>;
  torOpen?(url: string, token: string): Promise<Uint8Array>;
  torCall?(id: Uint8Array, message: Uint8Array): Promise<Uint8Array>;
  torClose?(id: Uint8Array): Promise<Uint8Array>;
  /** A relay connection through Tor that asks for a channel (lib/relay.ts), with no token: missing
   *  in a build made before the channel. */
  torOpenChannel?(url: string): Promise<Uint8Array>;
  /** A relay connection through Tor on the circuits named `way` (a channel when `channel`): every
   *  connection of one name goes the same way, and none of another's. Missing in a build from before. */
  torOpenOn?(url: string, token: string, way: string, channel: boolean): Promise<Uint8Array>;
  /** A Nostr relay's connection through Tor, text frames both ways: a frame waits until asked for
   *  (`torTextNext`, the wait in milliseconds, 8 bytes big-endian), '' when none came meanwhile.
   *  Missing in a build made before Nostr (lib/nostr.ts). */
  torTextOpen?(url: string): Promise<Uint8Array>;
  /** One HTTP request through Tor (a Matrix homeserver's, lib/matrix.ts): `head` is JSON, `{method,
   *  url, headers}`; answers the status in 2 bytes, big-endian, then the body. Missing in a build
   *  made before it. */
  torHttp?(head: string, body: Uint8Array): Promise<Uint8Array>;
  /** An XMPP server's connection (lib/xmpp-net.ts), straight or through Tor: `head` is JSON,
   *  `{host, port, domain, tls: 'direct' | 'starttls', tor}`; answers its handle. What the server
   *  sent waits until asked for (`netRead`, the wait in milliseconds, 8 bytes big-endian), empty
   *  when nothing came meanwhile. Missing in a build made before it. */
  netOpen?(head: string): Promise<Uint8Array>;
  netWrite?(id: Uint8Array, bytes: Uint8Array): Promise<Uint8Array>;
  netRead?(id: Uint8Array, wait: Uint8Array): Promise<Uint8Array>;
  netClose?(id: Uint8Array): Promise<Uint8Array>;
  torTextSend?(id: Uint8Array, frame: string): Promise<Uint8Array>;
  torTextNext?(id: Uint8Array, wait: Uint8Array): Promise<string>;
  torTextClose?(id: Uint8Array): Promise<Uint8Array>;
  /** Nostr for message text (crates/erevos-nostr): a new secret key, its public key, an event
   *  carrying bytes to a public key (`now` seconds, 8 bytes big-endian) as JSON, and what one for
   *  a secret's key carried (its id, 32 bytes, its time, 8, then the bytes). Missing in a build
   *  made before Nostr. */
  nostrSecret?(): Promise<Uint8Array>;
  nostrPublic?(secret: Uint8Array): Promise<Uint8Array>;
  nostrWrap?(to: Uint8Array, bytes: Uint8Array, now: Uint8Array): Promise<string>;
  nostrUnwrap?(secret: Uint8Array, event: string): Promise<Uint8Array>;
  /** Set on the WebAssembly core (lib/core-guard.ts), which gives an event as its bytes and takes one
   *  so (crates/erevos-ffi/src/web.rs), where Android's gives and takes it as text, as Core says:
   *  nostrSeal turns them into text. */
  eventsAsBytes?: true;
  /** Matrix accounts (crates/erevos-matrix, lib/matrix.ts): the JSON of one request in, the JSON
   *  of its answer out. Missing in a build made before them. */
  matrix?(request: Uint8Array): Promise<Uint8Array>;
  /** XMPP accounts' OMEMO (crates/erevos-xmpp, lib/xmpp-omemo.ts): the JSON of one request in, the
   *  JSON of its answer out. Missing in a build made before them. */
  xmpp?(request: Uint8Array): Promise<Uint8Array>;
  /** Chats with other Nostr apps (crates/erevos-nostr chat, lib/nostr-dm.ts): the JSON of one
   *  request in, the JSON of its answer out. Missing in a build made before them. */
  nostrChat?(request: Uint8Array): Promise<Uint8Array>;
}

let core: Core | null = null;

export function setCore(next: Core | null): void {
  core = next;
  const hardKey = next?.hardKey?.bind(next);
  setHardKey(
    hardKey
      ? (input, salt, { m, t }) => {
          const cost = new Uint8Array(8);
          const view = new DataView(cost.buffer);
          view.setUint32(0, m);
          view.setUint32(4, t);
          return hardKey(input, salt, cost);
        }
      : null,
  );
}

/** Whether this build has the core, and so can encrypt. */
export function hasCore(): boolean {
  return core !== null;
}

export class NoCoreError extends Error {
  constructor() {
    super(t('This build has no Erevos core, so it cannot encrypt. Rebuild the app.'));
  }
}

function need(): Core {
  if (!core) throw new NoCoreError();
  return core;
}

/** The values of a call that returns several, each a 4-byte big-endian length and its bytes. */
export function splitParts(bytes: Uint8Array, count: number): Uint8Array[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: Uint8Array[] = [];
  let at = 0;
  while (at < bytes.length) {
    if (at + 4 > bytes.length) break;
    const length = view.getUint32(at);
    if (at + 4 + length > bytes.length) break;
    out.push(bytes.slice(at + 4, at + 4 + length));
    at += 4 + length;
  }
  if (out.length !== count || at !== bytes.length) throw new Error(t('The Erevos core gave back something unexpected.'));
  return out;
}

export type Kind = 'first' | 'following' | 'other';

/** A conversation's secret state, and what a call made or opened with it. */
export type Sealed = { conversation: Uint8Array; packet: Uint8Array };
export type Opened = { conversation: Uint8Array; plaintext: Uint8Array };

export const newAccount = () => need().accountNew();
export const accountBundle = (account: Uint8Array) => need().accountBundle(account);
export const accountIdentity = (account: Uint8Array) => need().accountIdentity(account);
/** Checks the signatures of a bundle from a contact link, and returns its identity key. Throws if they do not hold. */
export const bundleIdentity = (bundle: Uint8Array) => need().bundleIdentity(bundle);
export const conversationPeer = (conversation: Uint8Array) => need().conversationPeer(conversation);
export const firstMessageId = (packet: Uint8Array) => need().firstMessageId(packet);
export const safetyNumber = (ours: Uint8Array, theirs: Uint8Array) => need().safetyNumber(ours, theirs);

/** Whether this build can seal a send for a contact's relay (two-hop sending). */
export function canRelaySeal(): boolean {
  return typeof core?.relaySeal === 'function';
}

/** Seals a send for the contact's relay, so this phone's own relay can carry it without reading it. */
export function relaySeal(relayKey: Uint8Array, senderId: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.relaySeal) throw new NoCoreError();
  return it.relaySeal(relayKey, senderId, message);
}

/** Whether this build can reach relays through Tor. */
export function canTor(): boolean {
  return typeof core?.torRequest === 'function';
}

/** Whether this build has the SOCKS5 door into Tor (lib/tor.ts torSocks). */
export function canTorSocks(): boolean {
  return typeof core?.torSocks === 'function';
}

/** Opens the SOCKS5 door into Tor, or gives the one open: {port, password} as JSON. */
export function torSocksDoor(): Promise<string> {
  const it = need();
  if (!it.torSocks) throw new NoCoreError();
  return it.torSocks();
}

/** The core's Tor calls, or an error saying this build has none. */
export function tor(): Required<Pick<Core, 'torStart' | 'torStatus' | 'torStop' | 'torRequest' | 'torOpen' | 'torCall' | 'torClose'>> {
  const it = need();
  if (!it.torStart || !it.torStatus || !it.torStop || !it.torRequest || !it.torOpen || !it.torCall || !it.torClose) {
    throw new Error(t('This build of Erevos has no Tor.'));
  }
  return {
    torStart: it.torStart.bind(it),
    torStatus: it.torStatus.bind(it),
    torStop: it.torStop.bind(it),
    torRequest: it.torRequest.bind(it),
    torOpen: it.torOpen.bind(it),
    torCall: it.torCall.bind(it),
    torClose: it.torClose.bind(it),
  };
}

// Whether this build reaches Nostr relays straight over WebSocket, having no Tor of its own: the
// web app, the computer app and Sailfish OS's (lib/crypto-setup.ts). Off unless set, as in the
// checks, whose core has no Tor either.
let nostrStraightOnly = false;

/** Says that this build reaches Nostr relays straight over WebSocket, as it has no Tor (lib/crypto-setup.ts). */
export function setNostrStraight(on: boolean): void {
  nostrStraightOnly = on;
}

/** Whether this build can reach Nostr relays through Tor (crates/erevos-tor text_open): on Android. */
export function canNostrTor(): boolean {
  return canTor() && typeof core?.torTextOpen === 'function' && typeof core?.nostrWrap === 'function';
}

/** Whether this build can make and open Nostr events and reach Nostr relays: through Tor, or,
 *  where it has no Tor, straight over WebSocket (setNostrStraight). */
export function canNostr(): boolean {
  return canNostrTor() || (nostrStraightOnly && nostrKeys() !== null && typeof WebSocket === 'function');
}

/** The core's calls for Nostr through Tor, or an error saying this build has none. */
export function nostrCore(): Required<
  Pick<Core, 'torTextOpen' | 'torTextSend' | 'torTextNext' | 'torTextClose' | 'nostrSecret' | 'nostrPublic' | 'nostrWrap' | 'nostrUnwrap'>
> {
  const it = need();
  const { torTextOpen, torTextSend, torTextNext, torTextClose, nostrSecret, nostrPublic, nostrWrap, nostrUnwrap } = it;
  if (!torTextOpen || !torTextSend || !torTextNext || !torTextClose || !nostrSecret || !nostrPublic || !nostrWrap || !nostrUnwrap) {
    throw new Error(t('This build of Erevos has no Nostr.'));
  }
  return {
    torTextOpen: torTextOpen.bind(it),
    torTextSend: torTextSend.bind(it),
    torTextNext: torTextNext.bind(it),
    torTextClose: torTextClose.bind(it),
    nostrSecret: nostrSecret.bind(it),
    nostrPublic: nostrPublic.bind(it),
    nostrWrap: nostrWrap.bind(it),
    nostrUnwrap: nostrUnwrap.bind(it),
  };
}

/** The core's Nostr keys and wraps alone, without Tor: what linking with the short code needs
 *  (lib/link-nostr.ts), on a computer too. Null in a build without them. */
export function nostrKeys(): Required<Pick<Core, 'nostrSecret' | 'nostrPublic' | 'nostrWrap' | 'nostrUnwrap'>> | null {
  const it = core;
  if (!it?.nostrSecret || !it.nostrPublic || !it.nostrWrap || !it.nostrUnwrap) return null;
  return { nostrSecret: it.nostrSecret.bind(it), nostrPublic: it.nostrPublic.bind(it), nostrWrap: it.nostrWrap.bind(it), nostrUnwrap: it.nostrUnwrap.bind(it) };
}

/** The core's Nostr keys and wraps, with Tor or without (lib/nostr.ts, lib/e2e.ts), an event as
 *  text whichever core it is (Core.eventsAsBytes), or an error saying this build has none. */
export function nostrSeal(): Required<Pick<Core, 'nostrSecret' | 'nostrPublic' | 'nostrWrap' | 'nostrUnwrap'>> {
  const keys = nostrKeys();
  if (!keys) throw new Error(t('This build of Erevos has no Nostr.'));
  if (!core?.eventsAsBytes) return keys;
  return {
    ...keys,
    nostrWrap: async (to, bytes, now) => utf8Decode((await keys.nostrWrap(to, bytes, now)) as unknown as Uint8Array),
    nostrUnwrap: (secret, event) => keys.nostrUnwrap(secret, utf8Encode(event) as unknown as string),
  };
}

/** Whether this build can encrypt for Matrix accounts (lib/matrix.ts). */
export function canMatrix(): boolean {
  return typeof core?.matrix === 'function';
}

/** The core's Matrix call, or an error saying this build has none. */
export function matrixCore(): (request: Uint8Array) => Promise<Uint8Array> {
  const it = need();
  if (!it.matrix) throw new Error(t('This build of Erevos has no Matrix.'));
  return it.matrix.bind(it);
}

/** Whether this build has connections of its own to XMPP servers (lib/xmpp-net.ts). */
export function canNet(): boolean {
  return typeof core?.netOpen === 'function';
}

/** The core's XMPP connections, or an error saying this build has none. */
export function net(): Required<Pick<Core, 'netOpen' | 'netWrite' | 'netRead' | 'netClose'>> {
  const it = need();
  if (!it.netOpen || !it.netWrite || !it.netRead || !it.netClose) throw new Error(t('This build of Erevos has no XMPP.'));
  return { netOpen: it.netOpen.bind(it), netWrite: it.netWrite.bind(it), netRead: it.netRead.bind(it), netClose: it.netClose.bind(it) };
}

/** Whether this build can encrypt for XMPP accounts (lib/xmpp-omemo.ts). */
export function canXmpp(): boolean {
  return typeof core?.xmpp === 'function';
}

/** The core's XMPP call, or an error saying this build has none. */
export function xmppCore(): (request: Uint8Array) => Promise<Uint8Array> {
  const it = need();
  if (!it.xmpp) throw new Error(t('This build of Erevos has no XMPP.'));
  return it.xmpp.bind(it);
}

/** Whether this build can make Nostr keys and chat with other Nostr apps (lib/nostr-dm.ts). */
export function canNostrChat(): boolean {
  return typeof core?.nostrChat === 'function';
}

/** The core's call for chats with other Nostr apps, or an error saying this build has none. */
export function nostrChatCore(): (request: Uint8Array) => Promise<Uint8Array> {
  const it = need();
  if (!it.nostrChat) throw new Error(t('This build of Erevos has no Nostr chats.'));
  return it.nostrChat.bind(it);
}

/** Whether this build can pair by a short code (a core from before it cannot). */
export function canPairCode(): boolean {
  return typeof core?.pairStart === 'function' && typeof core?.pairFinish === 'function' && typeof core?.pairConfirm === 'function' && typeof core?.pairConfirmed === 'function';
}

/** The core's pairing by a short code, or NoCoreError in a build made before it. */
export function pairCore(): Required<Pick<Core, 'pairStart' | 'pairFinish' | 'pairConfirm' | 'pairConfirmed'>> {
  const it = need();
  if (!it.pairStart || !it.pairFinish || !it.pairConfirm || !it.pairConfirmed) throw new NoCoreError();
  return it as Required<Pick<Core, 'pairStart' | 'pairFinish' | 'pairConfirm' | 'pairConfirmed'>>;
}

/** The core's change of a voice, or null in a build made before it. */
export function voiceCore(): ((pcm: Uint8Array, rate: Uint8Array, kind: Uint8Array) => Promise<Uint8Array>) | null {
  return typeof core?.voiceChange === 'function' ? core.voiceChange.bind(core) : null;
}

/** The core's writing out of voice messages, or null where it has none (the web, a build before it). */
export function speechCore(): Required<Pick<Core, 'speechText' | 'speechLetGo'>> | null {
  return typeof core?.speechText === 'function' && typeof core.speechLetGo === 'function' ? (core as Required<Pick<Core, 'speechText' | 'speechLetGo'>>) : null;
}

/** The core's translation (lib/translate.ts), or null in a build without it. */
export function translateCore(): Required<Pick<Core, 'translateText' | 'translateLetGo'>> | null {
  return typeof core?.translateText === 'function' && typeof core.translateLetGo === 'function' ? (core as Required<Pick<Core, 'translateText' | 'translateLetGo'>>) : null;
}

/** Whether the core can make and open SMS invites (a core from before them cannot). */
export function canSealOpen(): boolean {
  return typeof core?.sealPublic === 'function' && typeof core?.sealOpen === 'function';
}

/** The public key for a 32-byte secret, for others to seal to with `relaySeal`. */
export function sealPublic(secret: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.sealPublic) throw new NoCoreError();
  return it.sealPublic(secret);
}

/** Whether this build can open a channel to a relay's own key (a core from before it cannot). */
export function canRelayChannel(): boolean {
  return typeof core?.relayChannelKeys === 'function' && typeof core?.sealPublic === 'function';
}

/** The keys of a channel to the relay whose public key is `relayKey`, phone to relay then relay to
 *  phone, once its answer proves it holds that key's secret; throws when it does not. */
export function relayChannelKeys(relayKey: Uint8Array, secret: Uint8Array, answer: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.relayChannelKeys) throw new NoCoreError();
  return it.relayChannelKeys(relayKey, secret, answer);
}

/** A relay connection through Tor that asks for a channel, or an error saying this build has none. */
export function torOpenChannel(url: string): Promise<Uint8Array> {
  const it = need();
  if (!it.torOpenChannel) throw new Error(t('This build of Erevos has no Tor.'));
  return it.torOpenChannel(url);
}

/** Whether this build's Tor sends HTTP requests (torHttp). */
export function canTorHttp(): boolean {
  return canTor() && typeof core?.torHttp === 'function';
}

/** One HTTP request through Tor, or an error saying this build has none. */
export function torHttp(head: string, body: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.torHttp) throw new Error(t('This build of Erevos has no Tor.'));
  return it.torHttp(head, body);
}

/** Whether this build's Tor opens connections on circuits of a name (torOpenOn). */
export function canTorWays(): boolean {
  return typeof core?.torOpenOn === 'function';
}

/** A relay connection through Tor on the circuits named `way`, or an error saying this build has none. */
export function torOpenOn(url: string, token: string, way: string, channel: boolean): Promise<Uint8Array> {
  const it = need();
  if (!it.torOpenOn) throw new Error(t('This build of Erevos has no Tor.'));
  return it.torOpenOn(url, token, way, channel);
}

/** Opens what `relaySeal` sealed to the public key of `secret`: the sender id, then the message. */
export async function sealOpen(secret: Uint8Array, sealed: Uint8Array): Promise<{ senderId: Uint8Array; message: Uint8Array }> {
  const it = need();
  if (!it.sealOpen) throw new NoCoreError();
  const plain = await it.sealOpen(secret, sealed);
  return { senderId: plain.slice(0, 24), message: plain.slice(24) };
}

/**
 * What the core said when a call of it failed. On Android, Expo puts its own line first ("Call to
 * function 'ErevosCore.torRequest' has been rejected.") and the core's words after "→ Caused by: ",
 * with the name of the exception that carried them: only the core's words are kept.
 */
export function coreReason(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  const said = text.split('→ Caused by: ').pop()!.trim();
  return said.replace(/^(?:[A-Za-z_$][\w$]*\.)+[A-Za-z_$][\w$]*(?:Exception|Error): /, '') || text;
}

/** Whether the core can check Ed25519 signatures (a core from before them cannot). */
export function canVerify(): boolean {
  return typeof core?.signatureVerify === 'function';
}

/** Whether `signature` is the Ed25519 signature of `message` by the 32-byte public key `key`. */
export async function verifySignature(key: Uint8Array, message: Uint8Array, signature: Uint8Array): Promise<boolean> {
  const it = need();
  if (!it.signatureVerify) throw new NoCoreError();
  const answer = await it.signatureVerify(key, message, signature).catch(() => null);
  return answer?.length === 1 && answer[0] === 1;
}

/** Whether the core can sign as an account and check what an account signed (a core from before linked devices on their own cannot). */
export function canSign(): boolean {
  return typeof core?.accountSign === 'function' && typeof core?.bundleVerify === 'function';
}

/** The account's signature of `message` under `context` (a short name for what it is, such as "devices"). */
export function accountSign(account: Uint8Array, context: string, message: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.accountSign) throw new NoCoreError();
  return it.accountSign(account, utf8(context), message);
}

/**
 * The identity key of the account whose bundle signed `message` under `context`, or null when it
 * did not (or the bundle does not hold). Only a bundle that came inside a conversation with that
 * identity says who signed: a bundle's signature does not prove it holds the identity it names.
 */
export async function bundleVerify(bundle: Uint8Array, context: string, message: Uint8Array, signature: Uint8Array): Promise<Uint8Array | null> {
  const it = need();
  if (!it.bundleVerify) throw new NoCoreError();
  const identity = await it.bundleVerify(bundle, utf8(context), message, signature).catch(() => null);
  return identity?.length === 32 ? identity : null;
}

/** Whether the core can say an account's bundle is its own identity's, and check that (docs/multi-device.md, S5): a core from before cannot. */
export function canBind(): boolean {
  return typeof core?.accountBind === 'function' && typeof core?.bundleBound === 'function';
}

/** The account's X25519 identity saying that its bundle's signing key is its own (XEdDSA), for a contact link or a linked device to give with the bundle. */
export function accountBind(account: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.accountBind) throw new NoCoreError();
  return it.accountBind(account);
}

/**
 * The identity key of the bundle, when its X25519 identity said its signing key is its own
 * (`accountBind`), or null when it did not or the bundle does not hold. With this, a bundle that
 * did not come inside a conversation with its identity is that identity's all the same.
 */
export async function bundleBound(bundle: Uint8Array, signature: Uint8Array): Promise<Uint8Array | null> {
  const it = need();
  if (!it.bundleBound) throw new NoCoreError();
  const identity = await it.bundleBound(bundle, signature).catch(() => null);
  return identity?.length === 32 ? identity : null;
}

/** Whether the core makes coupons for a token on a second relay (lib/coupons.ts): a core from before cannot. */
export function canCoupons(): boolean {
  return typeof core?.couponBlind === 'function' && typeof core?.couponFinalize === 'function';
}

/** A coupon of `nonce` blinded for the issuer whose key is `spki`: the message to have signed, and the secret and randomizer to keep. */
export type BlindedCoupon = { message: Uint8Array; secret: Uint8Array; randomizer: Uint8Array };

export async function couponBlind(spki: Uint8Array, nonce: Uint8Array): Promise<BlindedCoupon> {
  const it = need();
  if (!it.couponBlind) throw new NoCoreError();
  const packed = await it.couponBlind(spki, nonce);
  const view = new DataView(packed.buffer, packed.byteOffset, packed.byteLength);
  const first = view.getUint16(0);
  const message = packed.slice(2, 2 + first);
  const second = view.getUint16(2 + first);
  const secret = packed.slice(4 + first, 4 + first + second);
  const randomizer = packed.slice(4 + first + second);
  if (randomizer.length !== 32) throw new Error('malformed coupon');
  return { message, secret, randomizer };
}

/** The coupon's signature from the issuer's blind one, checked against its key. */
export function couponFinalize(spki: Uint8Array, blindSignature: Uint8Array, coupon: BlindedCoupon, nonce: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.couponFinalize) throw new NoCoreError();
  return it.couponFinalize(spki, blindSignature, coupon.secret, coupon.randomizer, nonce);
}

const utf8 = (text: string) => new TextEncoder().encode(text);

export async function packetKind(packet: Uint8Array): Promise<Kind> {
  const kind = await need().packetKind(packet);
  return kind === 1 ? 'first' : kind === 2 ? 'following' : 'other';
}

/** Starts a conversation with the account of a bundle: its first packet carries `plaintext`. */
export async function startConversation(account: Uint8Array, bundle: Uint8Array, plaintext: Uint8Array): Promise<Sealed> {
  const [conversation, packet] = splitParts(await need().conversationStart(account, bundle, plaintext), 2);
  return { conversation, packet };
}

/**
 * Opens a first packet sent to this account: the conversation it starts, and its plaintext.
 * `prekeys` are the account's newer prekeys (`newPrekeys`), tried before its contact link's.
 */
export async function acceptConversation(account: Uint8Array, packet: Uint8Array, prekeys: Uint8Array[] = []): Promise<Opened> {
  const it = need();
  const opened = prekeys.length > 0 && it.conversationAcceptAny ? await it.conversationAcceptAny(account, joinParts(prekeys), packet) : await it.conversationAccept(account, packet);
  const [conversation, plaintext] = splitParts(opened, 2);
  return { conversation, plaintext };
}

/** Whether the core can make newer prekeys for an account, and accept first packets with them. */
export function canRenewPrekeys(): boolean {
  return typeof core?.accountPrekeys === 'function' && typeof core?.conversationAcceptAny === 'function';
}

/** Fresh prekeys signed by the account: their secret, to keep, and their bundle, for its contacts. */
export async function newPrekeys(account: Uint8Array): Promise<{ secret: Uint8Array; bundle: Uint8Array }> {
  const it = need();
  if (!it.accountPrekeys) throw new NoCoreError();
  const [secret, bundle] = splitParts(await it.accountPrekeys(account), 2);
  return { secret, bundle };
}


export async function seal(conversation: Uint8Array, plaintext: Uint8Array): Promise<Sealed> {
  const [next, packet] = splitParts(await need().conversationSeal(conversation, plaintext), 2);
  return { conversation: next, packet };
}

/** Whether this build can make a conversation put back from a backup safe to seal in again. */
export function canRestore(): boolean {
  return typeof core?.conversationRestored === 'function';
}

/** A conversation put back from a backup, moved past the message keys it may have used since
 *  that backup was made, so none is used twice. */
export function restored(conversation: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.conversationRestored) throw new NoCoreError();
  return it.conversationRestored(conversation);
}

/** Whether this build's core seals and opens messages with the post-quantum ratchet as well
 *  (docs/spqr.md): its messages say so, and a contact's conversation turns it on on hearing it. */
export function canPq(): boolean {
  return typeof core?.conversationEnablePq === 'function';
}

/** The conversation with the post-quantum ratchet on, once the other side says it reads its messages. */
export function enablePq(conversation: Uint8Array): Promise<Uint8Array> {
  const it = need();
  if (!it.conversationEnablePq) throw new NoCoreError();
  return it.conversationEnablePq(conversation);
}

/** Whether a conversation's post-quantum ratchet is on. */
export async function pqOn(conversation: Uint8Array): Promise<boolean> {
  const it = need();
  if (!it.conversationPq) return false;
  return (await it.conversationPq(conversation))[0] === 1;
}

/** Throws when the packet is not for this conversation, or was changed. */
export async function open(conversation: Uint8Array, packet: Uint8Array): Promise<Opened> {
  const [next, plaintext] = splitParts(await need().conversationOpen(conversation, packet), 2);
  return { conversation: next, plaintext };
}

/** Whether this build's core reads other messengers' exports: one built before it could not. */
export function canImport(): boolean {
  return typeof core?.importChats === 'function';
}

/** Reads another messenger's export: the chats in it as UTF-8 JSON (lib/imports.ts reads it). */
export const importChats = (name: Uint8Array, data: Uint8Array) => need().importChats(name, data);

/** Whether this build's core has group chats: one built before them has not. */
export function canGroup(): boolean {
  return typeof core?.groupOpen === 'function' && canSealOpen();
}

type GroupCalls = Required<Pick<Core, 'groupNew' | 'groupKeyPackage' | 'groupSetAbout' | 'groupCreate' | 'groupAdd' | 'groupRemove' | 'groupCommitPending' | 'groupJoin' | 'groupSeal' | 'groupLeave' | 'groupForget' | 'groupMembers' | 'groupOf' | 'groupOpen'>>;

function groups(): GroupCalls {
  const it = need();
  if (!canGroup()) throw new NoCoreError();
  return it as GroupCalls;
}

/** What a group message was, once opened (lib/groups.ts). */
export type GroupOpened =
  | { kind: 'message'; group: Uint8Array; sender: number; about: Uint8Array; text: Uint8Array }
  | { kind: 'changed' | 'removed' | 'later' | 'renewing'; group: Uint8Array }
  | { kind: 'leaving'; group: Uint8Array; sender: number }
  | { kind: 'nothing' };

const leafBytes = (leaf: number) => {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, leaf);
  return bytes;
};

/** A member's MLS state: its signing key, what it says about itself, and its groups. The calls
 *  that change it give it back first. */
export const group = {
  create: async (about: Uint8Array) => groups().groupNew(about),
  keyPackage: async (state: Uint8Array) => {
    const [next, keyPackage] = splitParts(await groups().groupKeyPackage(state), 2);
    return { state: next, keyPackage };
  },
  setAbout: async (state: Uint8Array, about: Uint8Array) => groups().groupSetAbout(state, about),
  newGroup: async (state: Uint8Array) => {
    const [next, id] = splitParts(await groups().groupCreate(state), 2);
    return { state: next, id };
  },
  add: async (state: Uint8Array, id: Uint8Array, keyPackage: Uint8Array) => {
    const [next, commit, welcome] = splitParts(await groups().groupAdd(state, id, keyPackage), 3);
    return { state: next, commit, welcome };
  },
  remove: async (state: Uint8Array, id: Uint8Array, leaf: number) => {
    const [next, commit] = splitParts(await groups().groupRemove(state, id, leafBytes(leaf)), 2);
    return { state: next, commit };
  },
  /** The commit is empty when there is nothing to commit. */
  commitPending: async (state: Uint8Array, id: Uint8Array) => {
    const [next, commit] = splitParts(await groups().groupCommitPending(state, id), 2);
    return { state: next, commit };
  },
  join: async (state: Uint8Array, welcome: Uint8Array) => {
    const [next, id] = splitParts(await groups().groupJoin(state, welcome), 2);
    return { state: next, id };
  },
  seal: async (state: Uint8Array, id: Uint8Array, text: Uint8Array) => {
    const [next, message] = splitParts(await groups().groupSeal(state, id, text), 2);
    return { state: next, message };
  },
  leave: async (state: Uint8Array, id: Uint8Array) => {
    const [next, message] = splitParts(await groups().groupLeave(state, id), 2);
    return { state: next, message };
  },
  forget: async (state: Uint8Array, id: Uint8Array) => groups().groupForget(state, id),
  /** UTF-8 JSON: `{own, members: [{leaf, about}]}`. */
  members: async (state: Uint8Array, id: Uint8Array) => groups().groupMembers(state, id),
  of: async (message: Uint8Array) => groups().groupOf(message),
  open: async (state: Uint8Array, message: Uint8Array): Promise<{ state: Uint8Array; opened: GroupOpened }> => {
    const [next, kind, id, sender, about, text] = splitParts(await groups().groupOpen(state, message), 6);
    const leaf = sender.length === 4 ? new DataView(sender.buffer, sender.byteOffset, 4).getUint32(0) : 0;
    const opened: GroupOpened =
      kind[0] === 1
        ? { kind: 'message', group: id, sender: leaf, about, text }
        : kind[0] === 2
          ? { kind: 'changed', group: id }
          : kind[0] === 3
            ? { kind: 'removed', group: id }
            : kind[0] === 4
              ? { kind: 'leaving', group: id, sender: leaf }
              : kind[0] === 5
                ? { kind: 'later', group: id }
                : kind[0] === 6
                  ? { kind: 'renewing', group: id }
                  : { kind: 'nothing' };
    return { state: next, opened };
  },
};

/** Whether this build's core gives group members new keys: one built before it does not. */
export function canRenewGroups(): boolean {
  return canGroup() && typeof core?.groupRenewal === 'function' && typeof core?.groupRenew === 'function' && typeof core?.groupSelfUpdate === 'function' && typeof core?.groupRejoin === 'function';
}

/** Whether this build's core lets the keeper of a group say a new `about` with its new keys (groupKeys.selfUpdate): one built before it keeps what it said. */
export function canSetGroupAbout(): boolean {
  return canRenewGroups() && typeof core?.groupSelfUpdateAs === 'function';
}

type RenewCalls = Required<Pick<Core, 'groupRenewal' | 'groupRenew' | 'groupSelfUpdate' | 'groupRejoin'>>;

function renewCalls(): RenewCalls {
  const it = need();
  if (!canRenewGroups()) throw new NoCoreError();
  return it as RenewCalls;
}

/** New keys in groups, on the same state as `group`'s. Those that change it give it back first. */
export const groupKeys = {
  /** A key package for the keeper to put this member in anew with, saying `about`. */
  renewal: async (state: Uint8Array, id: Uint8Array, about: Uint8Array) => {
    const [next, keyPackage] = splitParts(await renewCalls().groupRenewal(state, id, about), 2);
    return { state: next, keyPackage };
  },
  /** The keeper puts the member at `leaf` in anew with the key package it gave: the commit, then its welcome. */
  renew: async (state: Uint8Array, id: Uint8Array, leaf: number, keyPackage: Uint8Array) => {
    const [next, commit, welcome] = splitParts(await renewCalls().groupRenew(state, id, leafBytes(leaf), keyPackage), 3);
    return { state: next, commit, welcome };
  },
  /** New keys for the keeper's own leaf: the commit. With `about` (canSetGroupAbout), its leaf says that of itself from then on. */
  selfUpdate: async (state: Uint8Array, id: Uint8Array, about?: Uint8Array) => {
    const calls = renewCalls();
    const made = about && canSetGroupAbout() ? await core!.groupSelfUpdateAs!(state, id, about) : await calls.groupSelfUpdate(state, id);
    const [next, commit] = splitParts(made, 2);
    return { state: next, commit };
  },
  /** The group taken back from the keeper's welcome after this member's renewal. */
  rejoin: async (state: Uint8Array, id: Uint8Array, welcome: Uint8Array) => renewCalls().groupRejoin(state, id, welcome),
};

/** Whether this build's core has public groups (docs/public-groups.md): one built before them has not. */
export function canPublicGroup(): boolean {
  return canGroup() && typeof core?.groupCommit === 'function' && typeof core?.groupEpoch === 'function';
}

type PublicCalls = Required<Pick<Core, 'groupNewSigner' | 'groupKeyPackageAs' | 'groupCreatePublic' | 'groupRules' | 'groupCommit' | 'groupPackageAbout' | 'groupEpoch'>>;

function publicCalls(): PublicCalls {
  const it = need();
  if (!canPublicGroup()) throw new NoCoreError();
  return it as PublicCalls;
}

/** Values joined for a call that takes several in one: each a 4-byte big-endian length and its bytes. */
export function joinParts(items: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(items.reduce((sum, item) => sum + 4 + item.length, 0));
  const view = new DataView(out.buffer);
  let at = 0;
  for (const item of items) {
    view.setUint32(at, item.length);
    out.set(item, at + 4);
    at += 4 + item.length;
  }
  return out;
}

const bigEndian = (bytes: Uint8Array) => bytes.reduce((value, byte) => value * 256 + byte, 0);

/** A public group's rules as its group context has them now: its epoch, its keeper's leaf, then the app's rules. */
export type PublicRules = { epoch: number; keeper: number; rules: Uint8Array };

/** A public group's calls (lib/public-groups.ts), on the same state as `group`'s. Those that change it give it back first. */
export const publicGroup = {
  /** A key to sign with in one public group: its public half. */
  newSigner: async (state: Uint8Array) => {
    const [next, key] = splitParts(await publicCalls().groupNewSigner(state), 2);
    return { state: next, key };
  },
  keyPackage: async (state: Uint8Array, key: Uint8Array, about: Uint8Array) => {
    const [next, keyPackage] = splitParts(await publicCalls().groupKeyPackageAs(state, key, about), 2);
    return { state: next, keyPackage };
  },
  create: async (state: Uint8Array, key: Uint8Array, about: Uint8Array, rules: Uint8Array) => {
    const [next, id] = splitParts(await publicCalls().groupCreatePublic(state, key, about, rules), 2);
    return { state: next, id };
  },
  rules: async (state: Uint8Array, id: Uint8Array): Promise<PublicRules> => {
    const [epoch, keeper, rules] = splitParts(await publicCalls().groupRules(state, id), 3);
    return { epoch: bigEndian(epoch), keeper: bigEndian(keeper), rules };
  },
  /**
   * The keeper's one commit: who comes in (key packages), who goes (leaves), and with `rules`, the
   * keeper's leaf and the rules from then on. The welcome is empty when no one comes in.
   */
  commit: async (state: Uint8Array, id: Uint8Array, add: Uint8Array[], remove: number[], rules?: { keeper: number; rules: Uint8Array }) => {
    const leaves = new Uint8Array(remove.length * 4);
    remove.forEach((leaf, i) => new DataView(leaves.buffer).setUint32(i * 4, leaf));
    const ruled = new Uint8Array(rules ? 4 + rules.rules.length : 0);
    if (rules) {
      new DataView(ruled.buffer).setUint32(0, rules.keeper);
      ruled.set(rules.rules, 4);
    }
    const [next, commit, welcome] = splitParts(await publicCalls().groupCommit(state, id, joinParts(add), leaves, ruled), 3);
    return { state: next, commit, welcome };
  },
  /** What a key package says about its member, and the key it signs with. Throws when its signatures do not hold. */
  packageAbout: async (keyPackage: Uint8Array) => {
    const [about, key] = splitParts(await publicCalls().groupPackageAbout(keyPackage), 2);
    return { about, key };
  },
  /** The epoch a group message was sent in. */
  epoch: async (message: Uint8Array) => bigEndian(await publicCalls().groupEpoch(message)),
};
