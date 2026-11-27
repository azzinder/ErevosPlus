// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { isPieceText } from '../lib/chat-parts';
import { isRelayAddress } from '../lib/relay';
import { MAX_PARTS } from '../lib/voice';
import { checkedVoice, type VoiceKind } from '../lib/voice-change';
import { checkedLook, type Look } from '../theme/look';
import { isPhotoRef, type PhotoRef } from './avatar-photos';
import { checkedChatNotify, type ChatNotify } from './chat-notify';
import { checkedChatPin, type ChatPin } from './chat-pin';
import { isTag } from './history';
import { sealedFile, type Holder } from './sealed-file';

// What each space, and each space's hidden chats, keeps for end-to-end encryption (lib/e2e.ts):
// its own account, whose public keys its contact link gives out, and a conversation with each
// contact; on a linked device also its own endpoint and what it checked of its account, and on the
// phone that holds the account its device list (lib/device-list.ts). Of a contact whose account
// lists devices, also that list as checked here and a way to each endpoint it names (`Way`), and on
// a linked device its endpoint's own way to their account (docs/multi-device.md). Kept sealed in
// FILE, one value for each space and each hidden chats (sealed-file.ts), in blocks of BLOCK bytes.
// A space whose key changed starts with a new account and no contacts.

export type { Holder };

export type Contact = {
  /** The contact's identity key, hex: who they are. */
  identity: string;
  /** Their Erevos reads packed messages (lib/packing.ts), as their latest message said. Absent: it does not, or has not said. */
  packs?: true;
  /** The relay sender id that reaches them, hex. Empty until they say. */
  sender: string;
  /** The relay their queue is on, when it is not this chat's own: ws:// or wss://. Empty for the
   *  same relay as this chat, or when they have not said. */
  relay: string;
  /** That relay's key for sealed sends, base64url, so messages reach it through this chat's relay. */
  relayKey: string;
  /** Their backup queue, on another relay (one at home, say): where to write when their relay
   *  cannot be reached. Null, or missing in what was kept before backup relays, when they have none. */
  spare?: Spare | null;
  /** Conversations with them, base64, newest first: the first is the one to send in. */
  conversations: string[];
  /** The first packet of a conversation started here, base64, until the relay has taken it. */
  first: string;
  /** The name this chat gives them. Empty until one is given. Only this phone knows it. */
  name: string;
  /** Seconds after which new messages with them disappear, on both phones. 0 keeps them. */
  timer: number;
  /** When either phone last set the timer, milliseconds on that phone's clock: the later setting wins. */
  timerAt: number;
  /** Screenshots and screen recordings of this chat are kept out on both phones, where the phone can
   *  (Android): set from either phone, the later setting wins (`shotsAt`, that phone's clock), as the
   *  timer. Missing while neither ever set it, or off. */
  shots?: true;
  shotsAt?: number;
  /** What goes to them and comes from them goes only through Tor, on circuits of this chat's own,
   *  whatever the space's Tor way (lib/tor-chats.ts): never straight, so it waits while Tor starts.
   *  Calls do not: their sound goes as every call's does. The account's linked devices keep it alike
   *  (lib/link-wire.ts Synced), set on the phone or on any of them. Missing: as the space. */
  tor?: true;
  /** The voice messages this chat sends go with the voice changed so (lib/voice-change.ts). Only
   *  this phone knows it. Missing: the voice as it is. */
  voice?: VoiceKind;
  /** They wrote first, from this chat's link, and this chat has not accepted them yet: a message
   *  request. Their phone hears nothing back (not even that a message came) until it does. */
  request: boolean;
  /** This chat's own look (Appearance, from its details), or null for the space's. Only this phone knows it. */
  look: Look | null;
  /** The picture this chat gives them instead of the one drawn from their key, or null. Only this phone knows it. */
  avatar: Avatar | null;
  /** This chat appears offline to them: nothing tells them this phone is open, and what came
   *  and was read is held (`heldGot`, `heldRead`) until this chat next writes to them. */
  hide: boolean;
  /** Tags of their messages that came here, and that were read here, not told yet because the chat
   *  appears offline. */
  heldGot: string[];
  heldRead: string[];
  /** Their phone number, when this chat linked it to them (by hand, or through an SMS invite), so
   *  writing to the number goes through Erevos. Empty when not linked. Only this phone knows it. */
  phone: string;
  /** The identity key, hex, they know this chat by, when it is not this account's: a chat moved
   *  here from the space (into its hidden chats) keeps the space's, so the safety number stays the
   *  same, and one moved from hidden chats into the space keeps theirs; to them the chat says nothing
   *  of devices (lib/e2e.ts partOf). Empty for this account's own; on a linked device, its account's. */
  ownIdentity: string;
  /** Ids of the first messages taken from them, the latest MAX_SEEN_EACH: one a relay sends again
   *  is refused, however many others came since. */
  seen: string[];
  /** The time (`fa`, their clock) the newest first packet taken from them said it was started. One
   *  that says no later a time is kept behind the conversation this chat sends in (lib/e2e.ts
   *  accept). Missing while none said one: an Erevos before, or a chat from before this was kept. */
  firstAt?: number;
  /** The key this chat gave them for the packets they send it (lib/sealed-packet.ts), base64url,
   *  once made; `sealTo`, the one they gave this chat, once said. `sealsIn`: their packets come
   *  sealed, so one that does not is tried in their conversations only now and then. */
  packetKey: string;
  sealTo: string;
  sealsIn: boolean;
  /** The relay sender id, hex, of a ring queue this contact (a hidden place) said it has, for a
   *  call to ring them while their hidden chats are closed (lock/hidden-ring.ts). On the same relay
   *  as their message queue (`relay`/`sender`). Empty when they said none, or an older Erevos that
   *  says nothing of a ring queue: then a call to them rings only while their chats are open. */
  ringSender?: string;
  /** When their Erevos was last open on their screen (ms, their clock, never later than here), as
   *  they last said (lib/last-seen.ts). Missing while they said none, or said they tell none. */
  seenAt?: number;
  /** Their prekeys as they last gave them inside their conversation (their bundle, base64), when
   *  newer than their link's: what the conversation started next with them starts with. Missing
   *  until they give some. `bundleAt`: when they came here (ms), so a backup put back long after
   *  knows their phone may have thrown them away since (lib/e2e.ts putBack); missing for those kept
   *  before this was. */
  bundle?: string;
  bundleAt?: number;
  /** When the newest prekeys this chat gave them were made (`E2EData.prekeys`, ms), or 0. */
  bundleSent?: number;
  /** The first packet of a conversation started here with their newer prekeys, base64, until the
   *  relay has taken it. Nothing waits for it: it goes on its own. */
  renew?: string;
  /** The `n` of this chat's account's device list they last said they hold (`dv`), 0 for none;
   *  missing while what they send says nothing of devices (an Erevos before, or a chat of theirs
   *  moved into or out of hidden chats), and with one this chat says nothing of devices to. */
  dv?: number;
  /** Their account takes a call's signals copied to and from its endpoints, and copies its own to this chat's (`cl`, lib/e2e.ts): a call rings on each of their devices, and any of them calls with the phone off. */
  calls?: true;
  /** Someone new whose linked device started the chat with its account's word for it (S5, lib/e2e.ts acceptBound): their account's own first message after is no new start, and the ways to its endpoints stay. Gone with that message. */
  byDevice?: true;
  /** Their account's device list as last checked here, against `bundle`. */
  list?: TheirList;
  /** A way to each endpoint their list names, devices and the places that fill it alike. */
  endpoints?: Way[];
  /** On a linked device: its own endpoint's way to their account, once it writes to them itself. */
  direct?: Way;
  /** On the primary: when this chat last gave them its account's list (ms), so one they still do
   *  not hold is given again a day later; and which it gave, its `n` and its `rAt` (OwnList), so the
   *  same is not given again, but a later one, or where its endpoints read changed since, is. */
  listSent?: number;
  listGiven?: { n: number; rAt: number };
  /** The `qa` their messages last said (lib/moves.ts): when the queue they read on was made. A later
   *  message that says an older one, as a late copy, leaves where they read as it is. Missing while
   *  none said one (an Erevos before). */
  qa?: number;
  /** When this chat last told them its own queue (lib/queue-move.ts), and `onNew`: the `qa` of this
   *  chat's own queue they were last heard on, so the old one goes once all were. */
  told?: Told;
  onNew?: number;
  /** Moved here from the space or one of its hidden places (lock/move-chat.ts): the `qa` the other
   *  said to them last (`qaFloor`), and this chat's own then (`qaBase`). What this chat says them is
   *  later than the first by as much as its own moved on since, so a late copy of what the other
   *  sent, or of what this chat sent before a move, never takes them back, nor are its moves lost
   *  on them. */
  qaFloor?: number;
  qaBase?: number;
  /** The place's ring queue moved since they were told it: the next tell says it (`rf`). */
  ringTell?: true;
  /** On a linked device, and from a contact whose account lists devices (`list`): their messages
   *  taken here, each once by its tag, with the day it first came, for as long as another copy of
   *  it may still come (TOOK_LASTS), and of a voice message not all taken yet the parts that were;
   *  so one that comes again, through the phone and directly, or from their account and from one
   *  of their endpoints, is taken once, whether or not it is still kept. */
  took?: Took[];
  /** This chat's Nostr key for them (lib/nostr.ts): its secret and its public key, hex, made the
   *  first time this chat tells them it reads on Nostr. Only this phone knows the secret. */
  nostr?: NostrKey;
  /** The Nostr key and relays they said they read on (`ns`), and whether they asked for a bell on
   *  the relay too (`b`, a hidden place, which hears of it so while closed): texts to them go there,
   *  through Tor. Missing while they said none, or once they said they no longer read there. */
  nostrTo?: NostrTo;
  /** What this chat last told them of Nostr (lib/e2e.ts nostrSaid): its key, the bell and the relays,
   *  or '' for none. Missing until it told them anything. */
  nostrSaid?: string;
  /** Texts that went to them through Nostr not said to have come yet: each to go through the relay
   *  as well should that not be said in time (lib/nostr.ts NOSTR_BACKUP_MS). */
  nostrBackup?: NostrBackup[];
  /** When this chat sent them, by itself, an invite to its relay (app/chat.tsx offerRelays), as they
   *  had no queue of their own: sent once. */
  ri?: number;
  /** The id of that invite (lib/text-invite.ts inviteId), to tell whether their phone came onto the
   *  relay with it, and to take that place back. Missing for one sent before, and once the relay
   *  said it was not used. */
  rid?: string;
  /** When this chat saw their phone came onto its relay with that invite, and said so in their chat:
   *  said once (app/chat.tsx invitesCame). */
  rin?: number;
  /** When this phone took that place back (Take back under that line): said once too. */
  rib?: number;
  /** The PIN this chat opens with, when locked with one of its own (lock/chat-pin.ts), as kept.
   *  Missing when it has none. Only this phone knows it; it asks nothing while in hidden chats. */
  pin?: ChatPin;
  /** This chat's own notifications (lock/chat-notify.ts): muted, its own sounds. Missing while it
   *  has none. Kept on this phone only, as its PIN. */
  notify?: ChatNotify;
  /** This chat's queue for them alone (lib/contact-queues.ts), once they have one: what each
   *  message to them says as where this chat reads (`from`, with its `qa`), so the relay cannot
   *  tell whom else this phone hears from. Missing while they have none: they write to the own
   *  queue then, as before contact queues. */
  mine?: Mine;
  /** The `qa` of this chat's own queue, the one for all, they were last told, by what a message
   *  said or by the contact link while it named that queue; 0 for none. Deleting or blocking them
   *  moves that queue only while it is still the one they know. Missing in what was kept before
   *  contact queues: they know it. */
  knows?: number;
  /** When this phone checked their key in person, by the QR code their phone showed
   *  (lib/verify-code.ts), ms. Missing while it has not. Only this phone knows it: theirs marks
   *  this one on its own, by the code this one shows. */
  verified?: number;
  /** The name they gave themselves (`nm`, lib/e2e.ts), cleaned as names are kept: shown while this
   *  chat gives them none of its own (`name`). Missing while they said none, or said they have none. */
  said?: string;
  /** The name this chat last told them it goes by (E2EData.myName), '' for none. Missing until it
   *  told them anything: then it says one only once it has one. */
  nameSaid?: string;
};

/**
 * A contact's own queue on this chat's relay (Contact.mine): its recipient and sender ids (hex),
 * the relay it is on (`u`), the `qa` said with it, and the group it is read in (`g`,
 * lib/contact-queues.ts). `heard`: they wrote to it. `told`: when they were told it, as of the own
 * queue (lib/moves.ts tellDue). `was`: the one it took the place of, read until its time, then
 * deleted. `junk`: when it last moved for junk on it. `move`: the phone a backup came from knows it
 * and was lost, so it moves to one made ahead with a next look (lib/queue-move.ts lostNow).
 */
export type Mine = { r: string; s: string; u: string; qa: number; g: number; heard?: true; told?: Told; was?: OldMine; junk?: number; move?: true };

/** A contact queue no one is to write to any more: its recipient id (hex), its relay, and until when it is read (ms); 0: deleted at once. */
export type OldMine = { r: string; u: string; until: number };

/** A queue made ahead on this chat's relay for the next contact to have one (E2EData.ready): its recipient and sender ids (hex), and its relay. */
export type Ready = { r: string; s: string; u: string };

/** The most queues made ahead, and the most kept to delete. */
export const MAX_READY = 8;
export const MAX_GONE = 512;

/** A Nostr key: its secret (`s`) and its public key (`p`, x only), hex. */
export type NostrKey = { s: string; p: string };

/** Where a contact said it reads on Nostr: its public key (hex), its relays, and whether a bell goes to its relay queue too. */
export type NostrTo = { k: string; r: string[]; b?: true };

/**
 * A text that went through Nostr (Contact.nostrBackup): its tag, when it went (ms), its packet as it
 * went (base64), and whether its contact also had a bell (`q`), so the relay copy goes quiet. With
 * `n`, it went to a contact Nostr is the only way to (lib/nostr-chats.ts nostrOnlyWay): what it
 * keeps is the wrap's packets as they went, which go to Nostr again, now and then, while their
 * phone does not say they came: `n` times so far, the last at `at`.
 */
export type NostrBackup = { t: string; at: number; p: string; q?: true; n?: number };

/** The most texts kept to go through the relay as well, for each contact, and for how long: no longer than the relay keeps one. */
export const MAX_NOSTR_BACKUP = 64;
export const NOSTR_BACKUP_LASTS = 14 * 24 * 60 * 60_000;

/** The most Nostr relays one says it reads on, and the longest address of one. */
export const MAX_NOSTR_RELAYS = 5;
const MAX_NOSTR_URL = 256;

/** A Nostr relay's address: wss://, or ws:// to an onion service, which Tor encrypts itself. */
export const isNostrRelay = (v: unknown): v is string =>
  typeof v === 'string' && v.length <= MAX_NOSTR_URL && (/^wss:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(v) || /^ws:\/\/[a-z2-7]{56}\.onion(:\d+)?(\/[^\s]*)?$/i.test(v));

const isKeyHex = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v);

/** Where a contact said it reads on Nostr, checked: null when it is not that. */
export function checkedNostrTo(value: unknown): NostrTo | null {
  const v = (value ?? {}) as Partial<Record<keyof NostrTo, unknown>>;
  const r = Array.isArray(v.r) ? [...new Set(v.r.filter(isNostrRelay))].slice(0, MAX_NOSTR_RELAYS) : [];
  return isKeyHex(v.k) && r.length > 0 ? { k: v.k, r, ...(v.b === true ? { b: true as const } : {}) } : null;
}

function checkedNostrKey(value: unknown): NostrKey | null {
  const v = (value ?? {}) as Partial<Record<keyof NostrKey, unknown>>;
  return isKeyHex(v.s) && isKeyHex(v.p) ? { s: v.s, p: v.p } : null;
}

function checkedNostrBackup(value: unknown): NostrBackup | null {
  const v = (value ?? {}) as Partial<Record<keyof NostrBackup, unknown>>;
  return isTag(v.t) && isTime(v.at) && isBase64(v.p) && v.p ? { t: v.t, at: v.at, p: v.p, ...(v.q === true ? { q: true as const } : {}), ...(typeof v.n === 'number' && Number.isInteger(v.n) && v.n > 0 && v.n < 1000 ? { n: v.n } : {}) } : null;
}

/**
 * A message of a contact's taken here (Contact.took): its tag (`t`), the day it first came (`at`,
 * ms at the start of that day, UTC: no more than the day is kept), of a voice message not all taken
 * yet the parts that were (`p`), and whether it came again since (`two`).
 */
export type Took = { t: string; at: number; p?: number[]; two?: true };

/** When a contact was told this chat's own queue: its `qa`, when first, and how many times (lib/moves.ts). */
export type Told = { qa: number; at: number; n: number };

/** Someone blocked (E2E.deleteContact): their identity (hex), the name they had here, and when. */
export type Blocked = { identity: string; name: string; at: number };

/** The most blocked kept: the oldest goes first. */
export const MAX_BLOCKED = 200;

/**
 * Ours a relay holds for later that is to go no more, that it was not yet asked to drop
 * (lib/waiting.ts, dropHeld): for a contact deleted or blocked here, or held anew elsewhere
 * (holdAgain); its ids there (hex, comma-separated), that relay, and when it would go (ms), after
 * which there is nothing to drop.
 */
export type Undropped = { id: string; relay: string; at: number };

/** A copy of a message sent for later that a relay holds for an endpoint of a contact's account
 *  (lib/fanout.ts): for contact `c`, of the message `t`, till `at`. Taken back with that message. */
export type HeldCopy = Undropped & { c: string; t: string };

/** An invite given from here (lib/welcome.ts): its secret said back (`hi`, 32 hex) makes whoever
 *  says it a contact at once, named `name`, until it is used or `until` (ms). */
export type Invited = { hi: string; name: string; until: number };

/** The most invites waiting at once: the oldest goes first. */
export const MAX_INVITED = 20;

/** An invite to the relay made from here: the name of random letters and digits the relay has for it (`l`), and who it is for (`n`). */
export type InviteLine = { l: string; n: string };

/** The most names of invites to the relay kept: as many phones as a relay usually lets in by invite. The oldest goes first. */
export const MAX_LINES = 100;

/**
 * An introduction (lib/intros.ts), as kept. Made here (`by`): the two contacts asked (`a` is told
 * where to write, `b` gives the link), whether each said yes (`ya`, `yb`) and `b`'s link and secret
 * until they go to `a`; `end` once it went, or one said no. Asked here (`from`, who asks): the
 * name of whom it is to (`n`), whether this chat gives the link (`g`), and what this chat said:
 * 'asked' (nothing yet), 'yes', 'no' or 'done' (the contact added, or the link given and taken).
 * `at`: when it was made or came (ms). Kept INTRO_LASTS, MAX_INTROS at most.
 */
export type IntroKept =
  | { i: string; by: true; a: string; b: string; at: number; ya?: true; yb?: true; l?: string; h?: string; end?: 'went' | 'no' }
  | { i: string; from: string; n: string; g?: true; at: number; st: 'asked' | 'yes' | 'no' | 'done' };

export const MAX_INTROS = 32;
export const INTRO_LASTS = 7 * 24 * 60 * 60_000;
const INTRO_STATES = ['asked', 'yes', 'no', 'done'];
const isIdentity = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{64}$/.test(v);

function checkedIntroKept(value: unknown): IntroKept | null {
  const v = (value ?? {}) as Record<string, unknown>;
  if (typeof v.i !== 'string' || !/^[0-9a-f]{32}$/.test(v.i) || !isTime(v.at)) return null;
  if (v.by === true) {
    if (!isIdentity(v.a) || !isIdentity(v.b) || v.a === v.b) return null;
    return {
      i: v.i,
      by: true,
      a: v.a,
      b: v.b,
      at: v.at,
      ...(v.ya === true ? { ya: true as const } : {}),
      ...(v.yb === true ? { yb: true as const } : {}),
      ...(isText(v.l) && v.l.length <= 4096 ? { l: v.l } : {}),
      ...(isText(v.h) && /^[0-9a-f]{32}$/.test(v.h) ? { h: v.h } : {}),
      ...(v.end === 'went' || v.end === 'no' ? { end: v.end } : {}),
    };
  }
  if (!isIdentity(v.from) || !isText(v.n) || typeof v.st !== 'string' || !INTRO_STATES.includes(v.st)) return null;
  return { i: v.i, from: v.from, n: cleanName(v.n), ...(v.g === true ? { g: true as const } : {}), at: v.at, st: v.st as 'asked' | 'yes' | 'no' | 'done' };
}

/**
 * Pieces of backup passwords (lib/backup-pieces.ts): `held`, pieces contacts gave this chat to
 * keep for them (`from`), until they ask for them back; `given`, the splits this chat made of its
 * own password, by their set id, k of n, and the contacts given one; `back`, pieces of its own
 * given back; `out`, pieces that wait to go with our message of this tag, in a chat (lock/history.ts),
 * deleted once it went. `at`: when each came or was made (ms). MAX_PIECES of each at most.
 */
export type PiecesKept = {
  out?: { tag: string; p: string }[];
  held?: { from: string; p: string; at: number }[];
  given?: { set: string; k: number; n: number; to: string[]; at: number }[];
  back?: { p: string; at: number }[];
};

export const MAX_PIECES = 32;
const isSplitCount = (v: unknown, most: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 2 && v <= most;

function checkedPieces(value: unknown): PiecesKept | null {
  const v = (value ?? {}) as Record<string, unknown>;
  const list = (items: unknown) => (Array.isArray(items) ? items : []).map((item) => (item ?? {}) as Record<string, unknown>);
  const held = list(v.held)
    .filter((h) => isIdentity(h.from) && isPieceText(h.p) && isTime(h.at))
    .map((h) => ({ from: h.from as string, p: h.p as string, at: h.at as number }))
    .slice(-MAX_PIECES);
  const given = list(v.given)
    .filter((g) => isText(g.set) && /^[0-9a-f]{16}$/.test(g.set) && isSplitCount(g.k, 16) && isSplitCount(g.n, 16) && (g.k as number) <= (g.n as number) && Array.isArray(g.to) && g.to.every(isIdentity) && isTime(g.at))
    .map((g) => ({ set: g.set as string, k: g.k as number, n: g.n as number, to: (g.to as string[]).slice(0, 16), at: g.at as number }))
    .slice(-MAX_PIECES);
  const back = list(v.back)
    .filter((b) => isPieceText(b.p) && isTime(b.at))
    .map((b) => ({ p: b.p as string, at: b.at as number }))
    .slice(-MAX_PIECES);
  const out = list(v.out)
    .filter((o) => isTag(o.tag) && isPieceText(o.p))
    .map((o) => ({ tag: o.tag as string, p: o.p as string }))
    .slice(-MAX_PIECES);
  if (!held.length && !given.length && !back.length && !out.length) return null;
  return { ...(out.length ? { out } : {}), ...(held.length ? { held } : {}), ...(given.length ? { given } : {}), ...(back.length ? { back } : {}) };
}

/** The most kept to drop, far more than wait to go at once; past it the oldest goes first. */
export const MAX_UNDROPPED = 256;

/** A contact's device list as checked: its body and the account's signature (base64url), and its `n`. */
export type TheirList = { b: string; s: string; n: number };

/**
 * One endpoint of a contact's account, as their list names it, or their account itself from a
 * linked device: its identity (hex) and bundle (base64url, empty for their account); where it reads (its relay queue's sender
 * id, hex, empty until known; the relay; the relay's key, base64url); the conversations with it,
 * base64, newest first; the first packet of one started here, until the relay has taken it; the ids
 * of the first packets taken from it; the key it gave this chat for the packets it sends it
 * (`sealTo`), and whether its packets come sealed (`sealsIn`). `again`: from when the next copy
 * starts another conversation with it, those it has kept to open in, until it answers in one: a
 * day after one was started here, should it never answer in it (its first packet may have been
 * lost after the relay took it), longer as more were before it (`againAfter`), and at once when
 * its side may have lost them.
 */
export type Way = {
  id: string;
  bundle: string;
  sender: string;
  relay: string;
  relayKey: string;
  spare?: Spare | null;
  conversations: string[];
  first: string;
  seen: string[];
  sealTo: string;
  sealsIn: boolean;
  again?: number;
};

/** How long a conversation started with an endpoint, or with another of the account's devices, waits for an answer in it before the next packet for it starts another (Way.again): a day, and as more are kept from before it to open in (`before`), two, four, then eight days, so one that never answers costs ever less, and a device away for long still finds one the relay kept (14 days). */
export const WAY_AGAIN = 24 * 60 * 60_000;
export const againAfter = (before: number): number => WAY_AGAIN * 2 ** Math.min(before, 3);

/** A first packet from an endpoint (`peer`, hex) its account's list could not be checked to name yet: tried again with that account's next list. */
export type Unverified = { packet: string; acct: string; peer: string; at: number };

/** The most first packets kept to try again, in all and from one account, and for how long. */
export const MAX_UNVERIFIED = 16;
export const MAX_UNVERIFIED_EACH = 4;
export const UNVERIFIED_LASTS = 14 * 24 * 60 * 60_000;

/** On a linked device: a first packet a contact's account (`identity`, hex) started with its endpoint before the phone said who they are: tried again once it does. */
export type Early = { packet: string; identity: string; at: number };

/** The most of those kept, and for how long. */
export const MAX_EARLY = 8;
export const EARLY_LASTS = UNVERIFIED_LASTS;

/**
 * The most of a contact's messages kept as taken (`took`), and for how long after the day one came:
 * as long as its second copy may take within what this version and its relay keep, one waiting in
 * the contact's outbox (lock/fanout-data.ts COPIES_LAST) and then in a device's queue on the relay,
 * or in the phone's queue and then, passed on, in the device's, 14 days each, and two days more. A
 * copy can come later still: one the phone passes on after it was off, or its queue full, for
 * longer, as the contact's phone tries it again until it takes it, or one from a relay that keeps
 * messages longer.
 */
export const MAX_TOOK = 2000;
export const TOOK_LASTS = 30 * 24 * 60 * 60_000;
export const TOOK_DAY = 24 * 60 * 60_000;

/** The start of the day (UTC) `ms` is in, as Took.at says when a message came. */
export const tookDay = (ms: number): number => ms - (ms % TOOK_DAY);

/** A queue on a backup relay: its sender id (hex), the relay, and the relay's key (base64url, or
 *  empty when it has none). `more`: the queues on the phone's other home relays, up to MORE_SPARE,
 *  tried after it in their order. An Erevos before them leaves `more` out and keeps the first. */
export type Spare = { sender: string; relay: string; relayKey: string; more?: Spare[] };

/** The most queues on other home relays a backup queue says beside it. */
export const MORE_SPARE = 2;

/** A backup queue as said, checked: null when it is not one. One of `more` that does not read, or
 *  says the same relay twice, is left out; past MORE_SPARE they are too. */
export function checkedSpare(value: unknown, inner = false): Spare | null {
  const v = (value ?? {}) as Partial<Record<keyof Spare, unknown>>;
  if (!isHex(v.sender) || v.sender.length !== 48 || !isRelay(v.relay)) return null;
  const first: Spare = { sender: v.sender, relay: v.relay, relayKey: isRelayKey(v.relayKey) ? v.relayKey : '' };
  if (inner || !Array.isArray(v.more)) return first;
  const seen = new Set([first.relay.toLowerCase()]);
  const more: Spare[] = [];
  for (const m of v.more.slice(0, MORE_SPARE * 2)) {
    const one = checkedSpare(m, true);
    if (!one || seen.has(one.relay.toLowerCase()) || more.length >= MORE_SPARE) continue;
    seen.add(one.relay.toLowerCase());
    more.push(one);
  }
  return more.length > 0 ? { ...first, more } : first;
}

/** Each queue a backup queue names, the first and then `more`, in order. */
export function sparesOf(spare: Spare | null | undefined): Spare[] {
  if (!spare) return [];
  const { more, ...first } = spare;
  return [first, ...(more ?? [])];
}

/** A contact's picture of this chat's choosing: a sign (an emoji) on a colour, or a photo (lock/avatar-photos.ts). */
export type Avatar = { kind: 'emoji'; emoji: string; color: string } | ({ kind: 'photo' } & PhotoRef);

const HEX_COLOR = /^#[0-9A-F]{6}$/;

/** A kept picture, checked: one this version does not know (written by a newer one, or damaged) is none. */
export function checkedAvatar(value: unknown): Avatar | null {
  const v = (value ?? {}) as Partial<Record<'kind' | 'emoji' | 'color' | 'id' | 'key', unknown>>;
  if (v.kind === 'photo') return isPhotoRef(v) ? { kind: 'photo', id: v.id, key: v.key } : null;
  if (v.kind !== 'emoji' || !isText(v.emoji) || typeof v.color !== 'string') return null;
  const emoji = v.emoji.trim();
  const color = v.color.toUpperCase();
  // One sign: a few code points at most (a flag, a skin tone, a joined emoji).
  if (!emoji || [...emoji].length > 8 || /[\u0000-\u001f\u202a-\u202e\u2066-\u2069]/.test(emoji) || !HEX_COLOR.test(color)) return null;
  return { kind: 'emoji', emoji, color };
}

/**
 * The account's device list (lib/device-list.ts) as the primary signed it last, or as one of its
 * linked devices last checked it: its body and the account's signature of it (base64url), its `n`,
 * and which of its endpoints are the devices' (`real`, hex): the others only fill its places. Only
 * the account's own devices know which.
 */
export type OwnList = { b: string; s: string; n: number; real: string[]; r?: Record<string, Route>; q?: Record<string, string>; rAt?: number; restore?: string; cut?: number; qWas?: OldFiller[] };

/**
 * A queue a place that fills the list read on before the phone's own queue moved for a contact
 * deleted or blocked (lib/devices.ts): its recipient id (hex), on the relay it was made on, emptied
 * now and then until `until` (ms), then deleted. Kept in `qWas`, at most MAX_OLD_FILLERS.
 */
export type OldFiller = { q: string; relay: string; until: number };
export const MAX_OLD_FILLERS = 16;

/**
 * Where an endpoint reads, as a list says it to contacts (lib/device-list.ts Route): its queue's
 * sender id (hex), its relay, that relay's key, and the key contacts seal what they send it with
 * for that relay (`pk`, lib/sealed-packet.ts), each contact's its own. On the primary `r` holds one
 * for each endpoint its list names, with the key each contact's is drawn from (entryKey: a device's
 * `ek`, a random one for a place that fills the list), `q` the recipient id (hex) of each queue it made for a place that fills the list, on
 * the relay `r` says, `rAt` when the list was signed or `r` last changed (later each time, whatever
 * the clock says), `restore` the restore of a backup (E2EData.restore) the list was signed after,
 * and `cut` the `n` of the last list before it that may name a device it does not (one unlinked, or
 * one a phone put back from a backup does not know of): a contact who holds that one or an older
 * one is given it even while a place in it has no route yet.
 */
export type Route = { s: string; relay: string; rk: string; pk?: string };

/** On a linked device: its account as the phone said it over the link (identity, hex; bundle, base64url), and the account's list as last checked. */
/** `ab`: the account's X25519 identity saying `bundle`'s signing key is its own (lib/core.ts accountBind), base64url, as the phone gave it: what a new contact checks a conversation this device starts by (docs/multi-device.md, S5). */
// A linked device's pass from the phone (lib/device-list.ts Pass), its shape only.
function checkedOwnPass(value: unknown): { b: string; s: string } | null {
  const v = (value ?? null) as Record<string, unknown> | null;
  return v && typeof v === 'object' && typeof v.b === 'string' && /^[A-Za-z0-9_-]{1,2048}$/.test(v.b) && typeof v.s === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(v.s) ? { b: v.b, s: v.s } : null;
}

export type Own = { identity: string; bundle: string; list: OwnList | null; ab?: string; ap?: { b: string; s: string } };

/**
 * On the primary: one of its linked devices as a phone this account's backup is put back on needs
 * it, to ask that device to link again (lib/devices.ts askAgain): its endpoint's identity (hex) and
 * bundle (base64url), where it reads (its queue's sender id, hex, its relay and that relay's key),
 * its name, when it was linked (ms), whether photos and files went to it, and the key it gave this
 * phone in their link to be asked with (`key`, base64url, lib/link-again.ts), which only the two of
 * them hold. Nothing of the link's conversation, whose keys a backup never holds.
 */
export type Relink = { id: string; bundle: string; s: string; relay: string; rk: string; name: string; since: number; files: boolean; key: string };

/**
 * On the primary: its linked devices as Relink keeps them (`now`), as of the restore of a backup
 * they were kept under (`at`, E2EData.restore); and, on a phone a backup was put back on since,
 * the devices of the phone it was made on (`back`), each until it is linked again or let go of.
 */
export type Relinks = { at: string; now: Relink[]; back: Relink[] };

/** The most devices of a phone a backup came from that are kept to ask: those of two backups put back one after the other. */
export const MAX_BACK = 8;

/** A linked device's own endpoint (docs/multi-device.md) as others know it: its identity, hex, and its bundle, base64url. */
/** A linked device's endpoint: its identity (hex) and bundle (base64url), and what the key each contact seals what they send it with for the relay is drawn from (`ek`, base64url, lib/sealed-packet.ts entryKey), which a device from before does not say. */
export type Endpoint = { id: string; bundle: string; ek?: string };

export type E2EData = {
  /** The account's secret keys, base64. Empty until the chat first opens. */
  account: string;
  contacts: Contact[];
  /** The ids of the first packets opened here, hex, oldest first, so a replayed one is dropped. */
  seen: string[];
  /** The restore of a backup (lock/restored.ts) the conversations were last moved past, or ''.
   *  Missing in what was kept before it. */
  restore: string;
  /** The account's newer prekeys (lib/e2e.ts PREKEYS_EVERY), newest first, each its secret and
   *  bundle (base64) and when it was made (ms): contacts start their next conversations with the
   *  newest, and a first packet opens with any kept. Missing in what was kept before them. */
  prekeys?: Prekeys[];
  /** On a linked device: its own endpoint (docs/multi-device.md), a core account's secret keys,
   *  base64, that the device made and no one else holds. Missing elsewhere, and in what was kept
   *  before it. */
  endpoint?: string;
  /** On a linked device: its account, and the account's device list. */
  own?: Own;
  /** On the primary: the device list as last signed, which a backup carries, so a phone put back
   *  from one signs a later one. */
  list?: OwnList;
  /** On the primary: what a backup carries for a phone it is put back on to ask each linked device
   *  to link again (Relinks). Missing on one that never linked a device of this version, and in
   *  what was kept before it: an Erevos from before leaves it out. */
  relinks?: Relinks;
  /** When a backup was last put back under this account (ms, by this phone's clock then): its
   *  contacts may hold a later list than the one kept, signed after the backup was made. Missing on
   *  one never put back, and on an account made since. */
  putBack?: number;
  /** First packets from endpoints of contacts' accounts, their lists not checked to name them yet. */
  unverified?: Unverified[];
  /** On a linked device: first packets from contacts' accounts it did not know yet. */
  early?: Early[];
  /** When a contact was deleted or blocked here (ms): this chat's own queue moves (lib/queue-move.ts)
   *  once it has not since. Saved with the contact's removal, so neither is kept without the other.
   *  Missing when no move is due. */
  moveDue?: number;
  /** Who is blocked: a first packet from them is dropped, and so is what they ask through a group or an SMS invite. */
  blocked?: Blocked[];
  /** What a relay still holds for later for those deleted or blocked here. Saved with their removal. Missing when none. */
  undropped?: Undropped[];
  /** On the primary: this account's X25519 identity saying its bundle's signing key is its own
   *  (lib/core.ts accountBind), base64url, made once and given to its linked devices with the list.
   *  Missing until made, and with a core that cannot. */
  bound?: string;
  /** What relays hold for later for the endpoints of contacts' accounts, by message (HeldCopy). Missing when none. */
  heldCopies?: HeldCopy[];
  /** Invites given from here and not used yet (lib/welcome.ts). Missing when none. */
  invited?: Invited[];
  /** The name this phone gave itself in its last invite, offered again for the next. */
  invitedAs?: string;
  /** The name this chat goes by (Settings, My name): told, encrypted, to each contact it accepted
   *  (`nm`, lib/e2e.ts), and said in its groups (lock/group-data.ts About.name). Each space and each
   *  hidden place has its own, none at first, so a name never ties one of them to another. Missing
   *  while it has none. */
  myName?: string;
  /** Who each invite to the relay made from here is for, by the name of random letters the relay has for it (lib/e2e.ts lineFor), the latest last. Missing when none. */
  lines?: InviteLine[];
  /** Introductions made here, or asked of this chat (lib/intros.ts). Missing when none. */
  intros?: IntroKept[];
  /** Pieces of backup passwords, kept for contacts or given to them (lib/backup-pieces.ts). Missing when none. */
  pieces?: PiecesKept;
  /** Until when what came for this chat on the Nostr relays was read (seconds, kept now and then):
   *  what is asked of them next starts somewhat over an hour before it (lib/nostr.ts). Missing
   *  until they were read. */
  nostrAt?: number;
  /** The Nostr key this chat's contact link names (lib/contact-code.ts `nk`): what someone who adds
   *  the link writes to first, there, when no relay is between the two (lib/nostr-chats.ts). Made
   *  the first time the link names one, and kept, so the link stays as it was. */
  nostrLink?: NostrKey;
  /** Queues made ahead on this chat's relay, given to no one yet (lib/contact-queues.ts): the next
   *  contact written to takes one, so even the first message to someone new says a queue of their
   *  own. Missing when none. */
  ready?: Ready[];
  /** Contact queues no one is to write to any more (a contact deleted, blocked or moved away, or
   *  queues from before a backup was put back): read until their time, then deleted on the relay,
   *  the oldest first. Missing when none. */
  gone?: OldMine[];
};

export type Prekeys = { secret: string; bundle: string; at: number };

/** The most newer prekeys kept: a first packet started with older ones no longer opens. */
export const MAX_PREKEYS = 3;

export const EMPTY_E2E: E2EData = { account: '', contacts: [], seen: [], restore: '' };

export const FILE = 'erevos-e2e';
const BLOCK = 16 * 1024;

export const MAX_NAME = 40;

/** The longest a disappearing message lasts, seconds: four weeks. */
export const MAX_TIMER = 28 * 24 * 3600;

export const isTimer = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_TIMER;
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/** A contact's name as kept: one line of at most MAX_NAME characters, without control or direction marks. */
export function cleanName(text: string): string {
  const line = text.replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2028\u2029\u2066-\u2069]/g, ' ');
  return [...line.replace(/\s+/g, ' ').trim()].slice(0, MAX_NAME).join('').trim();
}

const isText = (v: unknown): v is string => typeof v === 'string';
const isBase64 = (v: unknown): v is string => isText(v) && /^[A-Za-z0-9+/]*={0,2}$/.test(v);
const isHex = (v: unknown): v is string => isText(v) && /^([0-9a-f]{2})*$/.test(v);
const isBase64Url = (v: unknown, most: number): v is string => isText(v) && v.length > 0 && v.length <= most && /^[A-Za-z0-9_-]+$/.test(v);
/** A relay address as contact links give it. */
export const isRelay = (v: unknown): v is string => isText(v) && v.length <= 512 && /^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(v);
/** A relay's public key for sealed sends: 32 bytes, base64url without padding. */
export const isRelayKey = (v: unknown): v is string => isText(v) && /^[A-Za-z0-9_-]{43}$/.test(v);

/** The most tags held for a contact, of each kind: the latest are kept. */
export const MAX_HELD = 200;
const heldTags = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isTag).slice(-MAX_HELD) : []);
/** The most first-message ids kept for a contact: 16 bytes each, 2 KB as kept. An Erevos before
 *  kept 16, and keeps the latest 16 of these. */
export const MAX_SEEN_EACH = 64;

function checkedContact(value: unknown): Contact | null {
  const v = (value ?? {}) as Partial<Record<keyof Contact, unknown>>;
  if (!isHex(v.identity) || v.identity.length !== 64) return null;
  const conversations = Array.isArray(v.conversations) ? v.conversations.filter(isBase64) : [];
  return {
    identity: v.identity,
    sender: isHex(v.sender) && v.sender.length === 48 ? v.sender : '',
    relay: isRelay(v.relay) ? v.relay : '',
    relayKey: isRelayKey(v.relayKey) ? v.relayKey : '',
    spare: checkedSpare(v.spare),
    conversations,
    first: isBase64(v.first) ? v.first : '',
    name: isText(v.name) ? cleanName(v.name) : '',
    timer: isTimer(v.timer) ? v.timer : 0,
    timerAt: isTime(v.timerAt) ? v.timerAt : 0,
    ...(isTime(v.shotsAt) && v.shotsAt > 0 ? { shotsAt: v.shotsAt, ...(v.shots === true ? { shots: true as const } : {}) } : {}),
    request: v.request === true,
    look: v.look && typeof v.look === 'object' ? checkedLook(v.look) : null,
    avatar: checkedAvatar(v.avatar),
    ownIdentity: isHex(v.ownIdentity) && v.ownIdentity.length === 64 ? v.ownIdentity : '',
    hide: v.hide === true,
    ...(v.tor === true ? { tor: true as const } : {}),
    ...(checkedVoice(v.voice) ? { voice: checkedVoice(v.voice) } : {}),
    heldGot: heldTags(v.heldGot),
    heldRead: heldTags(v.heldRead),
    phone: isText(v.phone) && /^\+?\d{3,20}$/.test(v.phone) ? v.phone : '',
    seen: Array.isArray(v.seen) ? v.seen.filter(isHex).slice(-MAX_SEEN_EACH) : [],
    packetKey: isRelayKey(v.packetKey) ? v.packetKey : '',
    sealTo: isRelayKey(v.sealTo) ? v.sealTo : '',
    sealsIn: v.sealsIn === true,
    ...(isHex(v.ringSender) && v.ringSender.length === 48 ? { ringSender: v.ringSender } : {}),
    ...(v.packs === true ? { packs: true as const } : {}),
    ...(isTime(v.seenAt) && v.seenAt > 0 ? { seenAt: v.seenAt } : {}),
    ...(isTime(v.firstAt) && v.firstAt > 0 ? { firstAt: v.firstAt } : {}),
    ...(isBase64(v.bundle) && v.bundle ? { bundle: v.bundle, ...(isTime(v.bundleAt) && v.bundleAt > 0 ? { bundleAt: v.bundleAt } : {}) } : {}),
    ...(isTime(v.bundleSent) ? { bundleSent: v.bundleSent } : {}),
    ...(isBase64(v.renew) && v.renew ? { renew: v.renew } : {}),
    ...(isCount(v.dv) ? { dv: v.dv } : {}),
    ...(v.calls === true ? { calls: true as const } : {}),
    ...(v.byDevice === true ? { byDevice: true as const } : {}),
    ...(checkedTheirList(v.list) ? { list: checkedTheirList(v.list)! } : {}),
    ...(Array.isArray(v.endpoints) ? { endpoints: v.endpoints.map(checkedWay).filter((w): w is Way => w !== null).slice(0, MAX_REAL) } : {}),
    ...(checkedWay(v.direct) ? { direct: checkedWay(v.direct)! } : {}),
    ...(isCount(v.listSent) ? { listSent: v.listSent } : {}),
    ...(checkedGiven(v.listGiven) ? { listGiven: checkedGiven(v.listGiven)! } : {}),
    ...(Array.isArray(v.took) ? { took: v.took.map(checkedTook).filter((t): t is Took => t !== null).slice(-MAX_TOOK) } : {}),
    ...(isTime(v.qa) ? { qa: v.qa } : {}),
    ...(checkedTold(v.told) ? { told: checkedTold(v.told)! } : {}),
    ...(isTime(v.onNew) ? { onNew: v.onNew } : {}),
    ...(isTime(v.qaFloor) && v.qaFloor > 0 ? { qaFloor: v.qaFloor } : {}),
    ...(isTime(v.qaBase) && v.qaBase > 0 ? { qaBase: v.qaBase } : {}),
    ...(v.ringTell === true ? { ringTell: true as const } : {}),
    ...(checkedNostrKey(v.nostr) ? { nostr: checkedNostrKey(v.nostr)! } : {}),
    ...(checkedNostrTo(v.nostrTo) ? { nostrTo: checkedNostrTo(v.nostrTo)! } : {}),
    ...(isText(v.nostrSaid) && v.nostrSaid.length <= 2048 ? { nostrSaid: v.nostrSaid } : {}),
    ...(Array.isArray(v.nostrBackup) ? { nostrBackup: v.nostrBackup.map(checkedNostrBackup).filter((b): b is NostrBackup => b !== null).slice(-MAX_NOSTR_BACKUP) } : {}),
    ...(isTime(v.ri) && v.ri > 0 ? { ri: v.ri } : {}),
    ...(isHex(v.rid) && v.rid.length === 32 ? { rid: v.rid } : {}),
    ...(isTime(v.rin) && v.rin > 0 ? { rin: v.rin } : {}),
    ...(isTime(v.rib) && v.rib > 0 ? { rib: v.rib } : {}),
    ...(checkedChatPin(v.pin) ? { pin: checkedChatPin(v.pin)! } : {}),
    ...(checkedChatNotify(v.notify) ? { notify: checkedChatNotify(v.notify)! } : {}),
    ...(checkedMine(v.mine) ? { mine: checkedMine(v.mine)! } : {}),
    ...(isTime(v.knows) ? { knows: v.knows } : {}),
    ...(isTime(v.verified) && v.verified > 0 ? { verified: v.verified } : {}),
    ...(isText(v.said) && cleanName(v.said) ? { said: cleanName(v.said) } : {}),
    ...(isText(v.nameSaid) ? { nameSaid: cleanName(v.nameSaid) } : {}),
  };
}

const isId = (v: unknown): v is string => isHex(v) && v.length === 48;

function checkedOldMine(value: unknown): OldMine | null {
  const v = (value ?? {}) as Partial<Record<keyof OldMine, unknown>>;
  return isId(v.r) && isRelay(v.u) && isTime(v.until) ? { r: v.r, u: v.u, until: v.until } : null;
}

function checkedReady(value: unknown): Ready | null {
  const v = (value ?? {}) as Partial<Record<keyof Ready, unknown>>;
  return isId(v.r) && isId(v.s) && isRelay(v.u) ? { r: v.r, s: v.s, u: v.u } : null;
}

function checkedMine(value: unknown): Mine | null {
  const v = (value ?? {}) as Partial<Record<keyof Mine, unknown>>;
  const ready = checkedReady(v);
  if (!ready || !isTime(v.qa) || v.qa <= 0 || !isCount(v.g)) return null;
  const was = checkedOldMine(v.was);
  return {
    ...ready,
    qa: v.qa,
    g: v.g,
    ...(v.heard === true ? { heard: true as const } : {}),
    ...(checkedTold(v.told) ? { told: checkedTold(v.told)! } : {}),
    ...(was ? { was } : {}),
    ...(isTime(v.junk) && v.junk > 0 ? { junk: v.junk } : {}),
    ...(v.move === true ? { move: true as const } : {}),
  };
}

function checkedTold(value: unknown): Told | null {
  const v = (value ?? {}) as Partial<Record<keyof Told, unknown>>;
  return isTime(v.qa) && isTime(v.at) && isCount(v.n) ? { qa: v.qa, at: v.at, n: v.n } : null;
}

/** One blocked, as stored or as the phone tells its devices (lib/link-wire.ts), or null if of the wrong shape. */
export function checkedBlocked(value: unknown): Blocked | null {
  const v = (value ?? {}) as Partial<Record<keyof Blocked, unknown>>;
  return isHex(v.identity) && v.identity.length === 64 && isTime(v.at) ? { identity: v.identity, name: isText(v.name) ? cleanName(v.name) : '', at: v.at } : null;
}

const HELD_ID = /^[0-9a-f]{32}(?:,[0-9a-f]{32}){0,63}$/;

function checkedUndropped(value: unknown): Undropped | null {
  const v = (value ?? {}) as Partial<Record<keyof Undropped, unknown>>;
  return typeof v.id === 'string' && HELD_ID.test(v.id) && typeof v.relay === 'string' && isRelayAddress(v.relay) && isTime(v.at) ? { id: v.id, relay: v.relay, at: v.at } : null;
}

function checkedHeldCopy(value: unknown): HeldCopy | null {
  const v = (value ?? {}) as Partial<Record<keyof HeldCopy, unknown>>;
  const held = checkedUndropped(value);
  return held && typeof v.c === 'string' && /^[0-9a-f]{64}$/.test(v.c) && typeof v.t === 'string' && /^[0-9a-f]{12}$/.test(v.t) ? { ...held, c: v.c, t: v.t } : null;
}

const isCount = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;

function checkedGiven(value: unknown): { n: number; rAt: number } | null {
  const v = (value ?? {}) as Partial<Record<'n' | 'rAt', unknown>>;
  return isCount(v.n) && isCount(v.rAt) ? { n: v.n, rAt: v.rAt } : null;
}

// One kept by the version before, with the time it came to the millisecond, is kept with its day only.
function checkedTook(value: unknown): Took | null {
  const v = (value ?? {}) as Partial<Record<keyof Took, unknown>>;
  if (!isTag(v.t) || !isTime(v.at)) return null;
  const parts = Array.isArray(v.p) ? v.p.filter((p): p is number => isCount(p)).slice(0, MAX_PARTS) : null;
  return { t: v.t, at: tookDay(v.at), ...(parts ? { p: parts } : {}), ...(v.two === true ? { two: true as const } : {}) };
}

function checkedTheirList(value: unknown): TheirList | null {
  const v = (value ?? {}) as Partial<Record<keyof TheirList, unknown>>;
  return isBase64Url(v.b, MAX_LIST) && isBase64Url(v.s, 128) && isCount(v.n) && v.n > 0 ? { b: v.b, s: v.s, n: v.n } : null;
}

/** A way as kept, checked: null when it is not one. */
export function checkedWay(value: unknown): Way | null {
  const v = (value ?? {}) as Partial<Record<keyof Way, unknown>>;
  // A linked device's way to their account has no bundle: their account started it.
  if (!isHex(v.id) || v.id.length !== 64 || !(v.bundle === '' || isBase64Url(v.bundle, MAX_BUNDLE))) return null;
  return {
    id: v.id,
    bundle: v.bundle as string,
    sender: isHex(v.sender) && v.sender.length === 48 ? v.sender : '',
    relay: isRelay(v.relay) ? v.relay : '',
    relayKey: isRelayKey(v.relayKey) ? v.relayKey : '',
    spare: checkedSpare(v.spare),
    conversations: Array.isArray(v.conversations) ? v.conversations.filter((c): c is string => isBase64(c) && c !== '').slice(0, 3) : [],
    first: isBase64(v.first) ? v.first : '',
    seen: Array.isArray(v.seen) ? v.seen.filter(isHex).slice(-MAX_SEEN_EACH) : [],
    sealTo: isRelayKey(v.sealTo) ? v.sealTo : '',
    sealsIn: v.sealsIn === true,
    ...(isTime(v.again) && v.again > 0 ? { again: v.again } : {}),
  };
}

function checkedRoute(value: unknown): Route | null {
  const v = (value ?? {}) as Partial<Record<keyof Route, unknown>>;
  return isHex(v.s) && v.s.length === 48 && isRelay(v.relay) ? { s: v.s, relay: v.relay, rk: isRelayKey(v.rk) ? v.rk : '', ...(isRelayKey(v.pk) ? { pk: v.pk } : {}) } : null;
}

function checkedUnverified(value: unknown): Unverified | null {
  const v = (value ?? {}) as Partial<Record<keyof Unverified, unknown>>;
  if (!isBase64(v.packet) || !v.packet || !isHex(v.acct) || v.acct.length !== 64 || !isTime(v.at)) return null;
  return { packet: v.packet, acct: v.acct, peer: isHex(v.peer) && v.peer.length === 64 ? v.peer : '', at: v.at };
}

function checkedEarly(value: unknown): Early | null {
  const v = (value ?? {}) as Partial<Record<keyof Early, unknown>>;
  if (!isBase64(v.packet) || !v.packet || !isHex(v.identity) || v.identity.length !== 64 || !isTime(v.at)) return null;
  return { packet: v.packet, identity: v.identity, at: v.at };
}

function checkedPrekeys(value: unknown): Prekeys | null {
  const v = (value ?? {}) as Partial<Record<keyof Prekeys, unknown>>;
  return isBase64(v.secret) && v.secret && isBase64(v.bundle) && v.bundle && isTime(v.at) ? { secret: v.secret, bundle: v.bundle, at: v.at } : null;
}

// A bundle is about 1800 characters, a list's body about four of them, and a list names at most
// four devices (lib/device-list.ts).
const MAX_BUNDLE = 4096;
const MAX_LIST = 24 * 1024;
const MAX_REAL = 4;

function checkedList(value: unknown): OwnList | null {
  const v = (value ?? {}) as Partial<Record<keyof OwnList, unknown>>;
  if (!isBase64Url(v.b, MAX_LIST) || !isBase64Url(v.s, 128) || !Number.isSafeInteger(v.n) || (v.n as number) <= 0) return null;
  const real = Array.isArray(v.real) ? v.real.filter((id): id is string => isHex(id) && id.length === 64).slice(0, MAX_REAL) : [];
  const r: Record<string, Route> = {};
  const q: Record<string, string> = {};
  if (v.r && typeof v.r === 'object') {
    for (const [id, route] of Object.entries(v.r).slice(0, MAX_REAL)) {
      const checked = isHex(id) && id.length === 64 ? checkedRoute(route) : null;
      if (checked) r[id] = checked;
    }
  }
  if (v.q && typeof v.q === 'object') {
    for (const [id, recipient] of Object.entries(v.q).slice(0, MAX_REAL)) if (isHex(id) && id.length === 64 && isHex(recipient) && recipient.length === 48) q[id] = recipient;
  }
  const qWas = Array.isArray(v.qWas) ? v.qWas.map(checkedOldFiller).filter((w): w is OldFiller => w !== null).slice(-MAX_OLD_FILLERS) : [];
  return {
    b: v.b,
    s: v.s,
    n: v.n as number,
    real,
    ...(Object.keys(r).length > 0 ? { r } : {}),
    ...(Object.keys(q).length > 0 ? { q } : {}),
    ...(isTime(v.rAt) && v.rAt > 0 ? { rAt: v.rAt } : {}),
    ...(isText(v.restore) && v.restore ? { restore: v.restore } : {}),
    ...(isCount(v.cut) && v.cut > 0 ? { cut: v.cut } : {}),
    ...(qWas.length > 0 ? { qWas } : {}),
  };
}

function checkedInvited(value: unknown): Invited | null {
  const v = (value ?? {}) as Partial<Record<keyof Invited, unknown>>;
  return isText(v.hi) && /^[0-9a-f]{32}$/.test(v.hi) && isText(v.name) && isTime(v.until) ? { hi: v.hi, name: cleanName(v.name), until: v.until } : null;
}

function checkedLine(value: unknown): InviteLine | null {
  const v = (value ?? {}) as Partial<Record<keyof InviteLine, unknown>>;
  return isText(v.l) && /^[a-z0-9]{10}$/.test(v.l) && isText(v.n) ? { l: v.l, n: cleanName(v.n) } : null;
}

function checkedOldFiller(value: unknown): OldFiller | null {
  const v = (value ?? {}) as Partial<Record<keyof OldFiller, unknown>>;
  return isHex(v.q) && v.q.length === 48 && isText(v.relay) && v.relay.length <= 2048 && isTime(v.until) ? { q: v.q, relay: v.relay, until: v.until } : null;
}

function checkedRelink(value: unknown): Relink | null {
  const v = (value ?? {}) as Partial<Record<keyof Relink, unknown>>;
  if (!isHex(v.id) || v.id.length !== 64 || !isBase64Url(v.bundle, MAX_BUNDLE) || !isHex(v.s) || v.s.length !== 48 || !isRelay(v.relay) || !isRelayKey(v.key)) return null;
  return { id: v.id, bundle: v.bundle, s: v.s, relay: v.relay, rk: isRelayKey(v.rk) ? v.rk : '', name: isText(v.name) ? v.name.slice(0, 40) : '', since: isTime(v.since) ? v.since : 0, files: v.files === true, key: v.key };
}

function checkedRelinks(value: unknown): Relinks | null {
  const v = (value ?? {}) as Partial<Record<keyof Relinks, unknown>>;
  if (!isHex(v.at) || (v.at.length !== 0 && v.at.length !== 32)) return null;
  const now = Array.isArray(v.now) ? v.now.map(checkedRelink).filter((r): r is Relink => r !== null).slice(0, MAX_REAL) : [];
  const back = Array.isArray(v.back) ? v.back.map(checkedRelink).filter((r): r is Relink => r !== null).slice(-MAX_BACK) : [];
  return now.length + back.length > 0 ? { at: v.at, now, back } : null;
}

function checkedOwn(value: unknown): Own | null {
  const v = (value ?? {}) as Partial<Record<keyof Own, unknown>>;
  if (!isHex(v.identity) || v.identity.length !== 64 || !isBase64Url(v.bundle, MAX_BUNDLE)) return null;
  return { identity: v.identity, bundle: v.bundle, list: checkedList(v.list), ...(typeof v.ab === 'string' && /^[A-Za-z0-9_-]{86}$/.test(v.ab) ? { ab: v.ab } : {}), ...(checkedOwnPass(v.ap) ? { ap: checkedOwnPass(v.ap)! } : {}) };
}

/** What was stored, with anything of the wrong shape left out. */
function checked(value: unknown): E2EData {
  const v = (value ?? {}) as Partial<Record<keyof E2EData, unknown>>;
  const contacts = Array.isArray(v.contacts) ? v.contacts.map(checkedContact).filter((c): c is Contact => c !== null) : [];
  const own = checkedOwn(v.own);
  const list = checkedList(v.list);
  const relinks = checkedRelinks(v.relinks);
  return {
    account: isBase64(v.account) ? v.account : '',
    contacts,
    seen: Array.isArray(v.seen) ? v.seen.filter(isHex) : [],
    restore: isHex(v.restore) && v.restore.length === 32 ? v.restore : '',
    ...(Array.isArray(v.prekeys) ? { prekeys: v.prekeys.map(checkedPrekeys).filter((p): p is Prekeys => p !== null).slice(0, MAX_PREKEYS) } : {}),
    ...(isBase64(v.endpoint) && v.endpoint ? { endpoint: v.endpoint } : {}),
    ...(own ? { own } : {}),
    ...(list ? { list } : {}),
    ...(relinks ? { relinks } : {}),
    ...(isTime(v.putBack) && v.putBack > 0 ? { putBack: v.putBack } : {}),
    ...(Array.isArray(v.unverified) ? { unverified: v.unverified.map(checkedUnverified).filter((u): u is Unverified => u !== null).slice(-MAX_UNVERIFIED) } : {}),
    ...(Array.isArray(v.early) ? { early: v.early.map(checkedEarly).filter((e): e is Early => e !== null).slice(-MAX_EARLY) } : {}),
    ...(isTime(v.moveDue) && v.moveDue > 0 ? { moveDue: v.moveDue } : {}),
    ...(Array.isArray(v.blocked) ? { blocked: v.blocked.map(checkedBlocked).filter((b): b is Blocked => b !== null).slice(-MAX_BLOCKED) } : {}),
    ...(Array.isArray(v.undropped) ? { undropped: v.undropped.map(checkedUndropped).filter((u): u is Undropped => u !== null).slice(-MAX_UNDROPPED) } : {}),
    ...(typeof v.bound === 'string' && /^[A-Za-z0-9_-]{86}$/.test(v.bound) ? { bound: v.bound } : {}),
    ...(Array.isArray(v.heldCopies) && v.heldCopies.length > 0 ? { heldCopies: v.heldCopies.map(checkedHeldCopy).filter((u): u is HeldCopy => u !== null).slice(-MAX_UNDROPPED) } : {}),
    ...(Array.isArray(v.invited) ? { invited: v.invited.map(checkedInvited).filter((i): i is Invited => i !== null).slice(-MAX_INVITED) } : {}),
    ...(isText(v.invitedAs) && cleanName(v.invitedAs) ? { invitedAs: cleanName(v.invitedAs) } : {}),
    ...(isText(v.myName) && cleanName(v.myName) ? { myName: cleanName(v.myName) } : {}),
    ...(Array.isArray(v.lines) && v.lines.length > 0 ? { lines: v.lines.map(checkedLine).filter((l): l is InviteLine => l !== null).slice(-MAX_LINES) } : {}),
    ...(Array.isArray(v.intros) ? { intros: v.intros.map(checkedIntroKept).filter((i): i is IntroKept => i !== null).slice(-MAX_INTROS) } : {}),
    ...(checkedPieces(v.pieces) ? { pieces: checkedPieces(v.pieces)! } : {}),
    ...(isTime(v.nostrAt) && v.nostrAt > 0 ? { nostrAt: v.nostrAt } : {}),
    ...(checkedNostrKey(v.nostrLink) ? { nostrLink: checkedNostrKey(v.nostrLink)! } : {}),
    ...(Array.isArray(v.ready) && v.ready.length > 0 ? { ready: v.ready.map(checkedReady).filter((r): r is Ready => r !== null).slice(-MAX_READY) } : {}),
    ...(Array.isArray(v.gone) && v.gone.length > 0 ? { gone: v.gone.map(checkedOldMine).filter((g): g is OldMine => g !== null).slice(-MAX_GONE) } : {}),
  };
}

const store = sealedFile({ name: FILE, empty: EMPTY_E2E, checked, block: BLOCK });

export const loadE2EData = store.load;
export const saveE2EData = store.save;
