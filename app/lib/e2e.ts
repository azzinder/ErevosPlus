// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { againAfter, INTRO_LASTS, MAX_INTROS, type IntroKept, MAX_PIECES, type PiecesKept, checkedAvatar, checkedNostrTo, checkedSpare, cleanName, EARLY_LASTS, isRelay, isRelayKey, isTimer, loadE2EData, MAX_BLOCKED, MAX_GONE, MAX_HELD, MAX_OLD_FILLERS, MAX_PREKEYS, MAX_INVITED, MAX_LINES, MAX_NOSTR_BACKUP, MAX_READY, MAX_SEEN_EACH, MAX_TOOK, MAX_UNDROPPED, NOSTR_BACKUP_LASTS, saveE2EData, TOOK_DAY, TOOK_LASTS, tookDay, UNVERIFIED_LASTS, type Avatar, type Blocked, type Contact, type E2EData, type Endpoint, type Holder, type Invited, type InviteLine, type Mine, type NostrKey, type NostrTo, type OldFiller, type OldMine, type Own, type OwnList, type Ready, type Relinks, type Route, type Spare, type Took, type Undropped, type HeldCopy, type Way } from '../lock/e2e-data';
import { checkedChatNotify, type ChatNotify } from '../lock/chat-notify';
import type { ChatPin } from '../lock/chat-pin';
import { COPIES_LAST, EMPTY_FANOUT, keepFanoutFile, loadFanoutData, MAX_COPIES, MAX_COPIES_EACH, saveFanoutData, type Copy, type FanoutData } from '../lock/fanout-data';

import { isReactionEmoji, isTag, newTag } from '../lock/history';

import * as core from './core';
import { readOffer, type FileOffer } from './attachments';
import { acts, carriedOf, toCarry, type Carried } from './chat-parts';
import { decodeCall, type CallSignal } from './call-signal';
import { decodeGroup, encodeGroup, type GroupSignal } from './group-signal';
import { isVoicePart, splitVoice, voiceIdOf, type VoicePart } from './voice';
import { entryKey, isSealedPacket, openPacket, ownPacketKey, packetKeys, SEALED_OVERHEAD, sealedWith, sealPacket, type PacketKeys } from './sealed-packet';
import { bodyOf, checkedList, checkedPass, PASS_MARGIN, readPass, verifyList, verifyPass, type DeviceList, type Pass } from './device-list';
import { blankWay, copiedAs, waysFor, withEarlyFirst, withRoutes, withUnverified } from './endpoints';
import { fromBase64, fromBase64Url, fromHex, randomBytes, sha256Bytes, toBase64, toBase64Url, toHex, utf8Decode, utf8Encode } from './crypto';
import { packed, unpacked } from './packing';
import { circuitOf, tellTorChats } from './tor-chats';
import { canTryLater, isQueueFull, sameRelay } from './relay';
import { TooLargeForSlowWayError } from './nearby';
import type { Look } from '../theme/look';
import { deletePhoto } from '../lock/avatar-photos';
import { lastRestore } from '../lock/restored';
import { CONTACT_GROUP } from './contact-queues';
import { GRACE, takesPlace, tellDue, toldOnce } from './moves';
import { NOSTR_AGAIN_MS, NOSTR_AGAIN_MOST, NOSTR_BACKUP_MS, NOSTR_KEEP_MOST, nostrKeysChanged, nostrRelays, nostrWraps } from './nostr';
import { t } from './i18n';
import { lookNow } from './look-now';
import { checkVerifyCode, verifyCode, type VerifyResult } from './verify-code';
import type { VoiceKind } from './voice-change';

// End-to-end encryption for one chat: a space's, or its hidden chats'. Each has its own account,
// so neither its contacts nor the relay can tie the two together. The account's public keys
// (its bundle) go in the contact link. Whoever adds a link starts a conversation with that
// account (PQXDH), and from then on each message moves the double ratchet. All of it is the
// Rust core's (lib/core.ts). What this file adds is which conversation a packet belongs to, and
// keeping the conversations, sealed, between launches (lock/e2e-data.ts).
//
// A packet says nothing about who sent it, so a packet that continues a conversation is tried
// in each one in turn. One that starts a conversation names its sender only inside, once
// opened. Each contact keeps its last MAX_CONVERSATIONS conversations, since both people may
// start one at the same time: each side then sends in the one it last received in, and opens
// packets in any of them.
//
// What travels inside a packet is a Message: the text and its tag, and the relay sender id that
// reaches the sender, so the other side can answer, and learns a new one when it changes. A
// conversation's first message has no text. Nor has one that asks the other phone to delete
// the messages of the chat, or one of them by its tag (`erase`): their Erevos does, but nothing
// makes a changed app do it.
//
// A phone says which messages came (`got`) and which were read (`read`), by their tags, so the
// sender's chat can mark them. A voice message travels in parts (lib/voice.ts), one in each
// message, all with the voice message's tag. A photo or file travels on its own through the
// relay's file store (lib/attachments.ts): its message carries where it is and its key. A call is
// set up with messages too, each with a call signal and no text (lib/call-signal.ts), and so is
// bringing a contact into a group (lib/group-signal.ts).
//
// Every message also carries the chat's timer for disappearing messages and when it was set, so
// each phone takes the later setting. A disappearing message lasts that long, or as long as its
// own `lasts` says when only that one disappears, from when it is read: on the sender's phone,
// from when the other says it read it. A message with no text and no `erase` only says the timer,
// and what came or was read. Their Erevos deletes the messages in time; nothing
// makes a changed app do it, or stops a screenshot.
//
// A phone says it is open (`on`: for how many seconds from `onAt`, by its clock) in what it writes,
// in answer to a contact whose chat is open and asks (`ask`), and with that asking. Nothing else
// says it, so the relay sees no more than a message now and then between two people talking. A
// chat set to appear offline (Contact.hide) says nothing of the kind, asks nothing, and holds what
// came and was read until it next writes: then it shows open for ONLINE_AFTER_WRITE.
//
// The contact link's prekeys stay as they are, since anyone with the link starts with them. The
// account also makes newer prekeys every PREKEYS_EVERY and gives them to each contact inside their
// conversation (`ak`, its bundle), and a contact that gets them starts a new conversation with them
// at once, quietly: a new PQXDH, with a new ML-KEM secret. Once older than the last MAX_PREKEYS,
// prekeys are thrown away, and with them what a stolen phone would have given of the ML-KEM half of
// the conversations they started. An Erevos before this ignores `ak` and stays in its conversation.
// A chat a backup put back starts a new conversation with each contact the same way, with the
// newest prekeys they gave it (E2E.startAnew), as those put back may have moved on there since.
//
// The space's chat also knows about the linked devices of its contacts' accounts, and of its own
// (docs/multi-device.md). Hidden chats know about their contacts' as the space's chat does, but
// never link a device, so they say what a space's chat that never linked one says: contacts cannot
// tell them from one. Each says in each message which list of the contact's account it holds
// (`dv`), but to a contact who knows it by another identity, as a chat moved here from the space's
// or from hidden chats: to them it says nothing of devices, as an Erevos from before, since no way
// to their endpoints could start from an identity that is not this chat's. The phone that holds
// the account gives a contact who holds an older one, or none, its bundle and its signed list
// (`ak`, `dl`) in a message of their own, as with newer prekeys. A contact's list is taken only
// from inside the conversation with their account, checked against their account's bundle, and
// from then on the chat writes to every endpoint it names as well as to their account
// (lib/endpoints.ts), and takes a conversation one of them starts, which says whose it is (`acct`):
// only once the list names it, never as a message request. A linked device's endpoint takes conversations too: from a contact who knows its
// account's list, and from their endpoints. Once a contact started one with it, and holds the list
// this device holds, the device writes to them itself rather than through the primary. A
// conversation started with an endpoint says whose endpoint it is meant for (`to`): only an
// endpoint of that account takes it, and an account never takes one that says either `to` or
// `acct`, as no list names its own account. So a list that names someone else's key makes that key
// read nothing, and a list's entry that names a contact's account is no endpoint.
//
// Every call runs after the one before it ends, so two calls never move the same conversation
// from the same state. A message key is never used twice: a packet is only handed back once the
// conversation that sealed it has been saved past it.

const MAX_CONVERSATIONS = 3;
/** How often the account makes newer prekeys for its contacts' next conversations. */
export const PREKEYS_EVERY = 30 * 24 * 3600 * 1000;
// How long a contact's phone surely still keeps the prekeys it gave this chat: it makes newer ones
// every PREKEYS_EVERY at most, gives each to its contacts with its next look at the relay, and keeps
// the last MAX_PREKEYS.
const KEPT_FOR = (MAX_PREKEYS - 1) * PREKEYS_EVERY;
// The longest bundle a message may give, in base64url characters (a bundle is about 1,350 bytes).
const MAX_BUNDLE = 4096;
// First packets remembered, so the relay cannot replay one to show its message again: 16 bytes
// each, so 1,000 are 32 KB as kept (lock/e2e-data.ts keeps 64 more for each contact). A replay of
// one older still, from a contact, shows its message once more, and its conversation is kept
// behind the one this chat sends in (E2E.accept, `fa`): it never becomes that one.
const MAX_SEEN = 1000;
// How many packets that came unsealed are tried, in an hour, in the conversations of contacts
// whose packets come sealed (E2E.mayTryUnsealed).
const UNSEALED_TRIES = 5;
const UNSEALED_TRIES_FOR = 60 * 60 * 1000;
// How long after giving a contact the account's list it is given again, should they still say they
// hold an older one; and how much later than a backup was put back a list they say they hold can be.
const LIST_AGAIN = 24 * 60 * 60 * 1000;
// The messages of contacts remembered with the endpoint each came from, so what says they came
// goes back that way.
const MAX_CAME = 2000;
// The seals whose copies wait for what went to the account (E2E.copiesAfter), at most, and for how long.
export const MAX_PENDING = 64;
export const PENDING_LASTS = 10 * 60_000;
// What went to the endpoints of contacts' accounts remembered, so what is sealed again copies none
// of it again (E2E.copied), at most.
const MAX_COPIED = 2000;

/** What a message asks the other phone to delete: every message of the chat, or the one with this tag. */
export type Erase = { all: true } | { tag: string };

/** A reaction to the message with this tag: an emoji, or none (`''`) to take it back. */
export type Reaction = { tag: string; emoji: string };

// The most tags one message says came, or were read.
const MAX_TAGS = 200;

/** Seconds a chat shows open to a contact after writing to them, and after saying it is open. */
export const ONLINE_AFTER_WRITE = 120;
export const ONLINE = 75;
// The longest a phone may say it stays open, seconds.
const MAX_ON = 600;
/** How long an invite given from here waits to be used (lib/welcome.ts), as an invite to a relay. */
export const WELCOME_DAYS = 7;
const isHi = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{32}$/.test(v);

// The `fa` a first message says: now, but later than the one before it, so two started in the same
// millisecond still say which came last.
let lastFirst = 0;
function firstAt(): number {
  lastFirst = Math.max(Date.now(), lastFirst + 1);
  return lastFirst;
}

// Whether a first packet from a known contact is older than the newest one taken from them: one
// that says no later a time (`fa`) than that one, or, while they said none, a queue made before the
// one kept (`qa`, a late copy). It never takes the place of the conversation this chat sends in.
// Exported for its check only.
export function staleFirst(message: Pick<Message, 'fa' | 'qa'>, known: Pick<Contact, 'firstAt' | 'qa'>): boolean {
  if (known.firstAt) return !message.fa || message.fa <= known.firstAt;
  return !message.fa && !takesPlace(message.qa, known.qa);
}

// `timer` is null in a message from an Erevos before disappearing messages. `lasts`: seconds this
// one message lasts, whatever the chat's timer, or 0. `got` and `read`: the tags of the other
// phone's messages that came here, and that were read here.
// `relay` and `relayKey`: the relay the sender's queue is on, and its key, so the other phone can
// write to it when it is not its own relay. Empty when not said. `spare`: the sender's backup
// queue (lib/spare.ts), said with `from`, so the other phone writes there when the relay is down.
// `quiet`: sent without sound, so its notice on the other phone makes none (lib/background.ts).
// `due`: when one sent for later should show (milliseconds, the sender's clock), as a relay that
// held it should send it then; a relay that sends it sooner does not make it show sooner.
// `re`: the tag of the message this one answers. `react`: a reaction to one of the chat's messages.
// `more`: what else it carries (lib/chat-parts.ts), each in a field of its own beside these.
type Message = {
  from: string;
  relay: string;
  relayKey: string;
  spare?: Spare | null;
  text: string;
  tag: string;
  erase: Erase | null;
  timer: number | null;
  timerAt: number;
  lasts: number;
  got: string[];
  read: string[];
  voice: VoicePart | null;
  file: FileOffer | null;
  on: number;
  onAt: number;
  ask: boolean;
  call: CallSignal | null;
  group: GroupSignal | null;
  quiet?: boolean;
  due?: number;
  re?: string;
  react?: Reaction | null;
  more?: Carried;
  /** The key the sender gave this chat for the packets it sends them (lib/sealed-packet.ts). */
  pk?: string;
  /** The sender's newer prekeys, its bundle (base64url), to start the next conversation with. */
  ak?: string;
  /** The relay sender id (hex) of this chat's ring queue, for a hidden place that rings its
   *  contacts' calls while it is closed (lock/hidden-ring.ts): empty to say it no longer rings,
   *  and absent from a chat that does not ring at all. An older Erevos ignores it. */
  rf?: string;
  /** The `n` of the other account's device list the sender holds, 0 for none (docs/multi-device.md). An Erevos before, and a chat moved into or out of hidden chats, say none. */
  dv?: number;
  /** 1: the sender's chat copies a call's signals to the endpoints of the other account, and takes
   *  them from its own endpoints and theirs (docs/multi-device.md, Calls). An Erevos before says none,
   *  and its calls go through the phone. */
  cl?: 1;
  /** The sender's account's device list, signed, with where each endpoint reads. */
  dl?: DeviceList;
  /** In the first message of a conversation a linked device's endpoint starts: the account it is one of (hex). */
  acct?: string;
  /** In the first message of a conversation started with an endpoint: the account it is for (hex), so a list that names someone else's endpoint makes it read nothing. */
  to?: string;
  /** In the first message of a conversation a linked device's endpoint starts with someone new
   *  (docs/multi-device.md, S5): its account's X25519 identity saying the bundle `ak` is its own
   *  (lib/core.ts accountBind), base64url, and the pass its account signed for that endpoint, which
   *  says where the account reads and until when it speaks for it (`ap`, lib/device-list.ts Pass). */
  ab?: string;
  ap?: Pass;
  /** When the queue `from` names was made (ms, the hour, later each time: lib/moves.ts queueAge), said with `from`: a message that says an older one than the last (a late copy) leaves where they read as it was. An Erevos before says none, and takes `from` from every message. */
  qa?: number;
  /** In the first message of a conversation started from an invite (lib/welcome.ts): its secret,
   *  said back, so the phone that gave it takes the sender as a contact at once. An Erevos before
   *  ignores it, and takes them as a message request. */
  hi?: string;
  /** Where the sender reads on Nostr (lib/nostr.ts): the key it gave this chat, its relays, and
   *  whether it asks for a bell on the relay too (`b`); '' to say it no longer reads there. Absent
   *  says nothing of it. An Erevos before ignores it, and sends through the relay. */
  ns?: NostrTo | '';
  /** In the first message of a conversation the sender's account starts with a contact's: when it
   *  started it (ms, its clock, later each time: firstAt). A first packet that says one no later than
   *  the newest taken from them (`Contact.firstAt`) is a replay or a late copy, never the conversation
   *  this chat sends in. An Erevos before says none, and ignores it. */
  fa?: number;
  /** When the sender's space was last open on its screen (ms, its clock: lib/last-seen.ts), or 0 to
   *  say it tells none, and wants none of it kept. Absent says nothing of it: an Erevos before, hidden
   *  chats, a chat that appears offline, or a time not known since the app started. */
  ls?: number;
  /** When the sender sealed this one (ms, its clock), in one with a tag: so a message that waited
   *  on a relay, as for a device or hidden chats that were closed, shows the time it was sent, not
   *  the time it came (lib/later.ts cameAt). An Erevos before says none, and it shows when it came. */
  st?: number;
  /** Whether the chat keeps screenshots out on both phones, and when the sender's phone, or one it
   *  heard from, set it (ms): each phone takes the later setting, as the timer (Contact.shots).
   *  Absent says nothing of it: an Erevos before, or a chat where neither ever set it. */
  sh?: Shots;
  /** The name the sender goes by (E2EData.myName), or '' to say it has none any more. Absent says
   *  nothing of it: an Erevos before, which ignores it, or one that told it already. */
  nm?: string;
  /** Says the sender's Erevos reads messages sealed with the post-quantum ratchet as well (lib/core.ts
   *  canPq, docs/spqr.md): the conversation it came in turns it on. Absent: an Erevos before it. */
  pq?: boolean;
  /** Says the sender's Erevos reads packed messages (lib/packing.ts): a long one to them may go packed. Absent: an Erevos before it. */
  zp?: boolean;
};

/** A chat's screenshot setting as a message says it (Message.sh). */
type Shots = { on: boolean; at: number };

function checkedShots(value: unknown): Shots | null {
  const v = value as { on?: unknown; at?: unknown } | null;
  if (!v || typeof v !== 'object' || typeof v.on !== 'boolean' || typeof v.at !== 'number' || !Number.isFinite(v.at) || v.at <= 0) return null;
  return { on: v.on, at: v.at };
}

/** What a message says of a contact's screenshot setting: nothing until either phone set it. */
const shotsSaid = (contact: Contact): { sh?: Shots } => (contact.shotsAt ? { sh: { on: contact.shots === true, at: contact.shotsAt } } : {});
/** How often a contact is told, unasked, that the app opened, at most (E2E.openDue). */
export const OPEN_EVERY = 15 * 60_000;
/** Only contacts who said their own "last seen" within this long are told so. */
export const OPEN_RECENT = 30 * 24 * 60 * 60_000;
// What counts as showing now: the time the space or place last showed is at most this old.
const OPEN_SHOWN = 60_000;
/** A contact told this lately that the app was open is not told again that it closed (E2E.closeDue). */
export const CLOSE_QUIET = 60_000;

// A conversation whose other side said its Erevos reads post-quantum messages (Message.pq), with the
// post-quantum ratchet on (lib/core.ts canPq, docs/spqr.md). One passed on with no conversation of
// its own (a linked device's, through the phone), or a core that cannot, stays as it was.
async function pqTurnedOn(opened: core.Opened, message: Message): Promise<core.Opened> {
  if (!message.pq || !core.canPq() || opened.conversation.length === 0) return opened;
  return { ...opened, conversation: await core.enablePq(opened.conversation).catch(() => opened.conversation) };
}

/** What else a message can carry. */
// `on`: seconds this phone says it stays open (0: says nothing). `ask`: asks them to say whether theirs is.
// `tag`: the tag a message that waited was kept with (lib/waiting.ts), so it keeps it as it goes.
// `quiet`: words that come without a sound. `due`: the time one sent for later should show.
// `re`: the tag of the message words answer. `react`: a reaction, sent with no words. `more`:
// what else it carries (lib/chat-parts.ts).
export type Extra = {
  erase?: Erase | null;
  lasts?: number;
  got?: string[];
  read?: string[];
  at?: Where;
  on?: number;
  ask?: boolean;
  call?: CallSignal | null;
  group?: GroupSignal | null;
  tag?: string;
  quiet?: boolean;
  due?: number;
  re?: string;
  react?: Reaction | null;
  more?: Carried;
  /** Gives them this chat's newest prekeys (`keysDue`), in a message with nothing else to show. */
  keys?: boolean;
  /** Says this chat's ring queue sender id (hex), or '' that it no longer rings (lock/hidden-ring.ts):
   *  a hidden place sends it so contacts can ring it while it is closed. Absent says nothing of one. */
  rf?: string;
  /** Says nothing of devices, as the chat will where it goes, to them and to each endpoint of their
   *  account it speaks to already: the chat moves into hidden chats, or out of them, and they stop
   *  writing to this account's devices, and their devices to this account (docs/multi-device.md). */
  leaving?: boolean;
};

/** Where a chat's own queue is: its relay and that relay's key for sealed sends (base64url). */
export type Where = { relay: string; relayKey: string };

const isOn = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= MAX_ON;
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
// Says nothing of being open.
const SAYS_NOTHING = { on: 0, onAt: 0, ask: false };

const tags = (value: unknown): string[] => (Array.isArray(value) ? value.filter(isTag).slice(0, MAX_TAGS) : []);

function encodeVoice({ id, part, parts, ms, data, talk }: VoicePart) {
  return { id, part, parts, ms, data: toBase64(data), ...(talk ? { talk } : {}) };
}

function decodeVoice(value: unknown): VoicePart | null {
  const v = value as Record<string, unknown> | null;
  if (typeof v?.data !== 'string') return null;
  let data: Uint8Array;
  try {
    data = fromBase64(v.data);
  } catch {
    return null;
  }
  const part = { id: v.id, part: v.part, parts: v.parts, ms: v.ms, data, ...(v.talk === true ? { talk: true } : {}) } as Partial<VoicePart>;
  return isVoicePart(part) ? part : null;
}

// `packs`: to a contact whose Erevos reads packed messages (Contact.packs), packed when that makes it
// smaller once padded (lib/packing.ts).
function encodeMessage(message: Message, packs = false): Uint8Array {
  const plain = plainMessage(message);
  return (packs && packed(plain)) || plain;
}

function plainMessage({ from, relay, relayKey, spare, text, tag, erase, timer, timerAt, lasts, got, read, voice, file, on, onAt, ask, call, group, quiet, due, re, react, more, pk, ak, rf, dv, cl, dl, acct, to, ab, ap, qa, hi, ns, ls, fa, st, sh, nm }: Message): Uint8Array {
  // Every message says this Erevos reads post-quantum ones, and packed ones, whatever it carries: one is enough.
  return utf8Encode(
    JSON.stringify({
      from,
      ...(relay ? { relay } : {}),
      ...(relayKey ? { relayKey } : {}),
      ...(spare ? { spare } : {}),
      text,
      ...(tag ? { tag } : {}),
      ...(erase ? { erase } : {}),
      ...(timer !== null ? { timer, timerAt } : {}),
      ...(lasts ? { lasts } : {}),
      ...(got.length > 0 ? { got } : {}),
      ...(read.length > 0 ? { read } : {}),
      ...(voice ? { voice: encodeVoice(voice) } : {}),
      ...(file ? { file } : {}),
      ...(on > 0 ? { on, onAt } : {}),
      ...(ask ? { ask } : {}),
      ...(call ? { call } : {}),
      ...(group ? { group: encodeGroup(group) } : {}),
      ...(quiet ? { quiet } : {}),
      ...(due ? { due } : {}),
      ...(re ? { re } : {}),
      ...(react ? { react } : {}),
      ...(pk ? { pk } : {}),
      ...(ak ? { ak } : {}),
      ...(rf !== undefined ? { rf } : {}),
      ...(cl ? { cl } : {}),
      ...(dv !== undefined ? { dv } : {}),
      ...(dl ? { dl } : {}),
      ...(acct ? { acct } : {}),
      ...(to ? { to } : {}),
      ...(ab ? { ab } : {}),
      ...(ap ? { ap } : {}),
      ...(ls !== undefined ? { ls } : {}),
      ...(from && qa ? { qa } : {}),
      ...(hi ? { hi } : {}),
      ...(ns !== undefined ? { ns } : {}),
      ...(fa ? { fa } : {}),
      ...(tag && st ? { st } : {}),
      ...(sh ? { sh } : {}),
      ...(nm !== undefined ? { nm } : {}),
      ...(core.canPq() ? { pq: 1 } : {}),
      zp: 1,
      ...more,
    }),
  );
}

/** Where a message from a contact says their queues are: the backup one goes, or changes, with it. */
// The `qa` a message says, from the own queue's (`own`, 0 while not known): to a contact moved here
// from the space or a hidden place, later than what the other said them last (`qaFloor`) by as much
// as the own one moved on since the chat came (`qaBase`), so a late copy of what the other sent
// never takes them back to its queue, nor one of this chat's from before a move here to that one,
// whichever of the two moved more lately.
function saidAge(own: number, { qaFloor: floor, qaBase: base = 0 }: Pick<Contact, 'qaFloor' | 'qaBase'> = {}): number {
  return floor ? Math.max(own, floor + 1 + Math.max(0, own - base)) : own;
}

// A contact's own queue, and the one it took the place of, as queues no one is to write to any
// more, read until `until` (0: deleted at once), the one before until its own time.
function minesOf({ mine }: Pick<Contact, 'mine'>, until: number): OldMine[] {
  if (!mine) return [];
  return [...(mine.was ? [{ ...mine.was, until: until === 0 ? 0 : Math.min(mine.was.until, until) }] : []), { r: mine.r, u: mine.u, until }];
}

// The contact queues to delete (E2EData.gone) with `more`, each once, at most MAX_GONE: past
// that the oldest are forgotten, and the relay lets them go once unused for long.
function withGone(gone: OldMine[] | undefined, more: OldMine[]): OldMine[] | undefined {
  if (more.length === 0) return gone;
  return [...(gone ?? []).filter((g) => !more.some((m) => m.r === g.r)), ...more].slice(-MAX_GONE);
}

function placeOf(message: Message, known?: Partial<Where> | null): Pick<Contact, 'relay' | 'relayKey' | 'spare'> {
  return { ...whereOf(message, known), spare: message.spare ?? null };
}

/** The ring queue sender id a message leaves a contact with: what it says (a sender id, or none for
 *  ''), or what was kept when it says nothing of one (`rf` absent). */
function ringSenderOf(message: Message, known: Contact | undefined): string | undefined {
  return message.rf === undefined ? known?.ringSender : message.rf || undefined;
}

/** A contact once their message came, as it says the name they go by: a name, '' for none any more; absent keeps it. */
function namedIn(contact: Contact, message: Message): Contact {
  if (message.nm === undefined || message.nm === (contact.said ?? '')) return contact;
  const { said: _said, ...rest } = contact;
  return message.nm ? { ...rest, said: message.nm } : rest;
}

// A contact once their message came: the texts that went through Nostr it says came, or were
// read, kept no more to go through the relay as well (Contact.nostrBackup).
function cameThrough(contact: Contact, message: Message): Contact {
  const backup = contact.nostrBackup;
  if (!backup || message.got.length + message.read.length === 0) return contact;
  const came = new Set([...message.got, ...message.read]);
  const left = backup.filter((b) => !came.has(b.t));
  if (left.length === backup.length) return contact;
  const { nostrBackup: _backup, ...rest } = contact;
  return left.length > 0 ? { ...rest, nostrBackup: left } : rest;
}

// A refusal of a packet that came sealed with a kept contact's mark: theirs, though it opened in
// none of their conversations, as from a phone whose conversation broke (lib/moves.ts, no junk).
function theirs(received: Received): Received {
  return received.kind === 'refused' && received.reason === 'unknown' ? { ...received, theirs: true } : received;
}

/**
 * Where a link or a message says a queue is. A queue said without a relay is on the same relay. A
 * message that names the relay `known` names with no key for it, as a phone says while it has not
 * had its relay's key yet, leaves the key known for it.
 */
function whereOf(said: { relay?: string; relayUrl?: string; relayKey?: string }, known?: Partial<Where> | null): Where {
  const relay = said.relay ?? said.relayUrl ?? '';
  if (!isRelay(relay)) return { relay: '', relayKey: '' };
  const key = isRelayKey(said.relayKey) ? said.relayKey : '';
  const kept = !key && known?.relay && known.relayKey && sameRelay(known.relay, relay) ? known.relayKey : '';
  return { relay, relayKey: key || kept };
}

/** A link's backup queue, as kept. */
type SpareSaid = { senderHex: string; relayUrl: string; relayKey?: string; more?: SpareSaid[] };
function spareOf(code: { spare?: SpareSaid }): Spare | null {
  const said = (one: SpareSaid) => ({ sender: one.senderHex, relay: one.relayUrl, relayKey: one.relayKey });
  return code.spare ? checkedSpare({ ...said(code.spare), more: (code.spare.more ?? []).map(said) }) : null;
}

function decodeErase(value: unknown): Erase | null {
  const erase = value as { all?: unknown; tag?: unknown } | null;
  if (erase?.all === true) return { all: true };
  return isTag(erase?.tag) ? { tag: erase.tag } : null;
}

function decodeReaction(value: unknown): Reaction | null {
  const react = value as { tag?: unknown; emoji?: unknown } | null;
  if (!isTag(react?.tag)) return null;
  return react.emoji === '' || isReactionEmoji(react.emoji) ? { tag: react.tag, emoji: react.emoji } : null;
}

function decodeMessage(bytes: Uint8Array): Message {
  try {
    const value = JSON.parse(utf8Decode(unpacked(bytes))) as Partial<Record<keyof Message, unknown>>;
    return {
      from: typeof value.from === 'string' && /^[0-9a-f]{48}$/.test(value.from) ? value.from : '',
      relay: isRelay(value.relay) ? value.relay : '',
      relayKey: isRelayKey(value.relayKey) ? value.relayKey : '',
      spare: checkedSpare(value.spare),
      text: typeof value.text === 'string' ? value.text : '',
      tag: isTag(value.tag) ? value.tag : '',
      erase: decodeErase(value.erase),
      timer: isTimer(value.timer) ? value.timer : null,
      timerAt: typeof value.timerAt === 'number' && Number.isFinite(value.timerAt) && value.timerAt >= 0 ? value.timerAt : 0,
      lasts: isTimer(value.lasts) ? value.lasts : 0,
      got: tags(value.got),
      read: tags(value.read),
      voice: decodeVoice(value.voice),
      file: readOffer(value.file),
      on: isOn(value.on) ? value.on : 0,
      onAt: isTime(value.onAt) ? value.onAt : 0,
      ask: value.ask === true,
      call: decodeCall(value.call),
      group: decodeGroup(value.group),
      quiet: value.quiet === true,
      due: isTime(value.due) ? value.due : 0,
      re: isTag(value.re) ? value.re : '',
      react: decodeReaction(value.react),
      more: carriedOf(value),
      pk: isRelayKey(value.pk) ? value.pk : '',
      ak: typeof value.ak === 'string' && value.ak.length <= MAX_BUNDLE && /^[A-Za-z0-9_-]+$/.test(value.ak) ? value.ak : '',
      // Absent (`undefined`) says nothing of a ring queue; present says it, a sender id or '' for none.
      rf: 'rf' in value ? (typeof value.rf === 'string' && /^[0-9a-f]{48}$/.test(value.rf) ? value.rf : '') : undefined,
      ...(Number.isSafeInteger(value.dv) && (value.dv as number) >= 0 ? { dv: value.dv as number } : {}),
      ...(value.cl === 1 ? { cl: 1 as const } : {}),
      ...(checkedList(value.dl) ? { dl: checkedList(value.dl)! } : {}),
      // Said but not an identity: said still, as nothing an account takes.
      ...(value.acct !== undefined ? { acct: typeof value.acct === 'string' && /^[0-9a-f]{64}$/.test(value.acct) ? value.acct : '' } : {}),
      ...(value.to !== undefined ? { to: typeof value.to === 'string' && /^[0-9a-f]{64}$/.test(value.to) ? value.to : '' } : {}),
      ...(typeof value.ab === 'string' && /^[A-Za-z0-9_-]{86}$/.test(value.ab) ? { ab: value.ab } : {}),
      ...(checkedPass(value.ap) ? { ap: checkedPass(value.ap)! } : {}),
      ...(isTime(value.qa) && value.qa > 0 ? { qa: value.qa } : {}),
      ...(isHi(value.hi) ? { hi: value.hi } : {}),
      ...(isTime(value.ls) ? { ls: value.ls } : {}),
      ...(isTime(value.fa) && value.fa > 0 ? { fa: value.fa } : {}),
      ...(isTime(value.st) && value.st > 0 ? { st: value.st } : {}),
      ...(checkedShots(value.sh) ? { sh: checkedShots(value.sh)! } : {}),
      // Said: a name, cleaned as names are kept, or '' for none; anything else says none.
      ...('nm' in value ? { nm: typeof value.nm === 'string' ? cleanName(value.nm) : '' } : {}),
      ...(value.pq === 1 ? { pq: true } : {}),
      ...(value.zp === 1 ? { zp: true } : {}),
      ...(value.ns === '' ? { ns: '' as const } : checkedNostrTo(value.ns) ? { ns: checkedNostrTo(value.ns)! } : {}),
    };
  } catch {
    return { from: '', relay: '', relayKey: '', text: '', tag: '', erase: null, timer: null, timerAt: 0, lasts: 0, got: [], read: [], voice: null, file: null, ...SAYS_NOTHING, call: null, group: null };
  }
}

/**
 * The chat's timer once a message came: the message's if it was set later than the one kept,
 * and how long the message itself lasts, as its sender meant: its own time, or the chat's. The
 * screenshot setting the same way (`shots`, kept as Contact.shots and shotsAt).
 */
function timerOf(message: Message, contact: Contact | undefined) {
  const kept = { timer: contact?.timer ?? 0, timerAt: contact?.timerAt ?? 0 };
  const later = message.timer !== null && message.timerAt > kept.timerAt;
  const now = later ? { timer: message.timer!, timerAt: message.timerAt } : kept;
  const lasts = message.lasts || (message.timer ?? now.timer);
  const keptShots = contact?.shots === true;
  const shotsLater = !!message.sh && message.sh.at > (contact?.shotsAt ?? 0);
  const shots: Shots | null = shotsLater ? message.sh! : contact?.shotsAt ? { on: keptShots, at: contact.shotsAt } : null;
  return {
    ...now,
    shots,
    received: { timer: lasts, timerChanged: later && now.timer !== kept.timer, noShots: shots?.on === true, shotsChanged: shotsLater && shots!.on !== keptShots },
  };
}

/** How a contact keeps the screenshot setting timerOf says (Contact.shots and shotsAt). */
const shotsKept = (shots: Shots | null): Pick<Contact, 'shots' | 'shotsAt'> => (shots ? { shotsAt: shots.at, ...(shots.on ? { shots: true as const } : {}) } : {});

/** A contact with the screenshot setting `shots`, or none. */
function withShots<C extends Contact>(contact: C, shots: Shots | null): C {
  const { shots: _on, shotsAt: _at, ...rest } = contact;
  return { ...rest, ...shotsKept(shots) } as C;
}

/** Base64url without padding, as the contact link carries the bundle. */
// lib/crypto has them, so that lib/device-list need not take lib/e2e, which takes it.
export { fromBase64Url, toBase64Url };

/** A contact as the chat shows it. `name` is empty until this chat gives one. */
export type ContactInfo = {
  identity: string;
  sender: string;
  /** The name shown for them: the one this chat gives them (`ownName`), or else the one they go by (`said`), or ''. */
  name: string;
  /** The name this chat gives them, '' for none. */
  ownName: string;
  /** The name they go by, as they told this chat (Contact.said), '' for none. */
  said: string;
  timer: number;
  /** Screenshots of this chat are kept out on both phones (Contact.shots). */
  shots: boolean;
  request: boolean;
  look: Look | null;
  avatar: Avatar | null;
  hide: boolean;
  /** The chat goes only through Tor (Contact.tor). */
  tor?: boolean;
  /** Its voice messages go with the voice changed so (Contact.voice). */
  voice?: VoiceKind;
  /** Locked with a PIN of its own (lock/chat-pin.ts). */
  locked: boolean;
  /** Its own notifications (lock/chat-notify.ts); missing while it has none. */
  notify?: ChatNotify;
};

export type Received =
  // `timer`: seconds this message lasts once read, 0 for ever. `timerChanged`: the other phone set
  // the chat's timer anew. `got` and `read`: tags of messages from here that came there, or were read.
  | {
      kind: 'message';
      identity: string;
      text: string;
      tag: string;
      added: boolean;
      // From a contact not accepted yet (see Contact.request).
      request: boolean;
      erase: Erase | null;
      timer: number;
      timerChanged: boolean;
      // The chat keeps screenshots out (Contact.shots), and the other phone changed that now.
      noShots: boolean;
      shotsChanged: boolean;
      got: string[];
      read: string[];
      // One part of a voice message, whose tag is `tag`.
      voice: VoicePart | null;
      // A photo or file, still on the relay.
      file: FileOffer | null;
      // Until when they said their phone is open, milliseconds on this phone's clock, or 0.
      online: number;
      // They ask whether this phone is open.
      ask: boolean;
      // They said when their Erevos was last open, or that they tell none (lib/last-seen.ts).
      seen: boolean;
      // Setting up or ending a call.
      call: CallSignal | null;
      // Bringing a contact into a group (lib/groups.ts).
      group: GroupSignal | null;
      // Sent without sound: its notice makes none.
      quiet: boolean;
      // When one sent for later should show (milliseconds), or 0.
      due: number;
      // When the sender sealed it (milliseconds, its clock), or 0 when it said none (lib/later.ts cameAt).
      sent: number;
      // The tag of the message this one answers, or ''.
      re: string;
      // Their reaction to one of the chat's messages.
      react: Reaction | null;
      // What else it carries (lib/chat-parts.ts).
      more: Carried;
      // The endpoint of their account it came through (its identity), or '' for their account.
      from: string;
      // It came before, from their account and again from one of their endpoints, or through the
      // phone and again directly (docs/multi-device.md): taken once, whether still kept or not.
      twice: boolean;
    }
  // Not encrypted (as messages before this version were), not for this account, or a replay. Or
  // `linked`: between this account's own devices, and taken by their link (lib/devices.ts). Or
  // `blocked`: a first packet from someone blocked here (E2E.deleteContact). `theirs`: sealed with
  // the key a kept contact was given, so theirs, though it opened in none of their conversations.
  | { kind: 'refused'; reason: 'plain' | 'unknown' | 'replay' | 'linked' | 'blocked'; theirs?: true };

/**
 * How a chat reaches the other devices of its account (lib/devices.ts). A linked device seals
 * nothing for a contact itself (`through`): each message goes sealed for its primary, the phone that
 * holds the account, which seals it for the contact; what the primary passes on from a contact it
 * opens as the contact's. The primary tells its linked devices what it opened from contacts and
 * what it sealed for them. The chat calls each in turn with its own calls, and none of them calls
 * the chat back.
 */
export interface Link {
  readonly through: boolean;
  /**
   * Opens a packet between the account's devices: a contact's message the primary passed on, or
   * `taken` for the link's own, with how the contacts change, and on a linked device who is
   * blocked on the phone (`blocked`); null for a packet that is not one.
   */
  /** `near`: the link nearby it came on (lib/nearby.ts), when it came on one. */
  open(packet: Uint8Array, near?: string): Promise<{ kind: 'message'; identity: string; plaintext: Uint8Array } | { kind: 'taken'; contacts?: (contacts: Contact[]) => Contact[]; blocked?: Blocked[] } | null>;
  /** On a linked device: a message for a contact, sealed for the primary. */
  wrap(identity: string, plaintext: Uint8Array): Promise<Uint8Array>;
  /** On a linked device: asks the primary to add the contact of a link (`identity`), and gives the contact to keep meanwhile. */
  add(code: Parameters<E2E['addContact']>[0], identity: string, known: Contact | undefined): Promise<Contact>;
  /** On the primary: a contact's message, opened here. */
  opened(identity: string, plaintext: Uint8Array): void;
  /** On the primary: a message sealed here for a contact. */
  sealed(identity: string, plaintext: Uint8Array): void;
  /** The contacts as kept now, which may have changed. */
  changed(contacts: readonly Contact[]): void;
  /** On a linked device: a contact was deleted here (E2E.deleteContact), or blocked, which the phone does too, and moves its queue. */
  deleted?(identity: string, block: boolean): void;
  /** On the primary: who is blocked here changed (E2E.deleteContact, E2E.unblock), which the linked devices keep too, so they ask to unblock as the phone does. */
  blockedChanged?(blocked: readonly Blocked[]): void;
  /** On a linked device: someone blocked on the phone was unblocked here, which the phone does too. */
  unblocked?(identity: string): void;
}

export class OwnCodeError extends Error {
  constructor() {
    super(t("That is this chat's own contact link."));
  }
}

export class NoKeyError extends Error {
  constructor() {
    super(t('That code has no key. Ask for their contact link or QR code from this version of Erevos.'));
  }
}

/** The contact of a link is blocked here: added only once unblocked (E2E.unblock). */
export class BlockedContactError extends Error {
  readonly identity: string;
  constructor(identity: string, name: string) {
    super(name ? t('{name} is blocked here. Unblock them to add them again?', { name }) : t('This contact is blocked here. Unblock them to add them again?'));
    this.identity = identity;
  }
}

// Now, or later than `before` should the clock have been set back since: what the list's `rAt`
// says, so each change of it is told apart from the one before.
function laterThan(before = 0): number {
  return Math.max(Date.now(), before + 1);
}

// A Nostr key for a contact (lib/nostr.ts), hex.
async function newNostrKey(): Promise<NostrKey> {
  const nostr = core.nostrCore();
  const secret = await nostr.nostrSecret();
  return { s: toHex(secret), p: toHex(await nostr.nostrPublic(secret)) };
}

// A contact's conversations as a restored backup put them back, each moved past the message keys
// it may have sealed with since the backup was made, so none of them seals with a key twice. Their
// phone opens what comes next as after lost messages. What their phone sent in a conversation that
// moved on since the backup no longer opens here, nor what this one sends in it there: so a new one
// is started with them (E2E.startAnew), and with each endpoint of their account with the next copy
// for it (`again`, from `now`), as when their side may have lost what it spoke in them.
async function restoredContact(contact: Contact, now: number): Promise<Contact> {
  const restored = (list: string[]) => Promise.all(list.map(async (c) => toBase64(await core.restored(fromBase64(c)))));
  const conversations = await restored(contact.conversations);
  const endpoints = contact.endpoints && (await Promise.all(contact.endpoints.map(async (w) => ({ ...w, conversations: await restored(w.conversations), ...(w.conversations.length > 0 && !w.first ? { again: now } : {}) }))));
  const direct = contact.direct && { ...contact.direct, conversations: await restored(contact.direct.conversations) };
  // Texts kept to go through the relay as well were sealed in conversations moved past now.
  const { nostrBackup: _backup, ...rest } = contact;
  return { ...rest, conversations, ...(endpoints ? { endpoints } : {}), ...(direct ? { direct } : {}) };
}

// A contact's ways to the endpoints of their account (lib/endpoints.ts) as none of them was spoken
// to: what a linked device's endpoint that is gone, or another now, started with them it no longer
// opens or seals in.
function unspoken({ direct: _direct, ...contact }: Contact): Contact {
  return contact.endpoints ? { ...contact, endpoints: contact.endpoints.map(blankAgain) } : contact;
}

// A way as no conversation was started with its endpoint, where it reads and the key it was sealed for kept.
function blankAgain(w: Way): Way {
  return { ...blankWay(w.id, w.bundle, w.sender ? { s: w.sender, relay: w.relay, rk: w.relayKey } : undefined), sealTo: w.sealTo };
}

/** Which of a contact's conversations a packet opened in: their account's, or one of their endpoints' (by its identity). */
type Slot = { contact: Contact; way: Way | null };

/**
 * What a sealing gives: the packets, in order, where they go, the first packet of the conversation
 * if the relay has not taken it yet, the number the copies for the endpoints of their account
 * wait under until those went (E2E.copiesAfter), 0 for none, and whether they were sealed for the
 * account's phone, on a linked device, which passes them on (`through`), or for the contact. For
 * a chat that goes only through Tor (Contact.tor), the name of its own circuits (`torChat`,
 * lib/tor-chats.ts circuitOf), which they go on wherever they go: to the phone too.
 */
type Sealed = { packets: Uint8Array[]; sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; copies: number; through: boolean; torChat?: string };

/** A copy as it goes: where the way to its endpoint says it reads now (its queue's sender id, hex; its relay, empty for this chat's own; that relay's key). */
export type Outgoing = Copy & { s: string; relay: string; rk: string };

// Whether a copy is the last packet of a message someone reads, as the relay is told (lib/relay.ts,
// Mark): words, a photo or file, a voice message's last part. All else a copy carries is quiet.
function readsAs(m: Message): boolean {
  if (!m.tag) return false;
  return m.voice ? m.voice.part === m.voice.parts - 1 : !!m.text || !!m.file;
}

// What a copy says of a message that goes to an endpoint only for what came from it (`got`) and
// what was read (`read`): that, with where this chat reads and the chat's timer, and nothing more.
function receiptOf(m: Message, got: string[], read: string[], pk: string): Message {
  return { from: m.from, relay: m.relay, relayKey: m.relayKey, spare: m.spare, text: '', tag: '', erase: null, timer: m.timer, timerAt: m.timerAt, lasts: 0, got, read, voice: null, file: null, ...SAYS_NOTHING, call: null, group: null, pk, ...(m.dv !== undefined ? { dv: m.dv } : {}) };
}

// What a whole copy is once it went to an endpoint, so it goes there once (E2E.copied): a message
// someone reads, by its tag, or the account's keys and list it gives. Empty for what may be said
// again, as a reaction taken back and given again.
function copyKey(m: Message): string {
  if (m.tag) return m.tag;
  return m.ak || m.dl ? `keys ${toHex(sha256Bytes(utf8Encode(JSON.stringify([m.ak ?? '', m.dl ?? null]))))}` : '';
}

/**
 * A copy a sealing is to make for one endpoint once what went to the account went (E2E.copiesGo),
 * not sealed yet, so one that never goes moves no conversation on: the message as it goes there
 * (`m`), what it is (`key`, copyKey; empty for what says what came and was read, kept by their
 * tags), the part of a voice message it is (`part`), and whether it is the last packet of a
 * message someone reads (`mark`).
 */
type ToCopy = { m: Message; key: string; part?: number; mark?: 'message' | 'ring' };

// A message sent for later that goes to each endpoint too, as a copy the relay holds till its time:
// one someone reads (words, a voice message, a photo or file), never a call's or a group's.
const laterCopied = (m: Message) => !!m.due && !!m.tag && !m.call && !m.group && (!!m.text || !!m.voice || !!m.file);

/** What a sealing is to copy: for its contact (`c`), to each endpoint (`w`), and what a conversation started with one says first (`like`, with `packetKey`), none when `leaving`. */
type Held = { c: string; ways: { w: string; items: ToCopy[] }[]; like: Message; packetKey: string; leaving: boolean; at: number };

// A contact once one of their messages was taken here, and whether it was taken before. Only where
// one can come twice: on a linked device, from every contact, directly and again through the phone;
// and from a contact whose account lists devices, from their account and from one of their
// endpoints. There its tag is kept once, with the day it first came and no more of when, for as
// long as another copy of it may still come (TOOK_LASTS, from the end of that day), and of a voice
// message the parts taken until all were. One taken again stays where it was, marked so (`two`).
// Once MAX_TOOK are kept, the oldest so marked gives way to a new one, and while none is, the new
// one is not kept: so what comes a second time, in the order it first came, pushes out nothing
// still to come again.
function tookIn(contact: Contact, message: Message, device: boolean, now = Date.now()): { contact: Contact; twice: boolean } {
  if (!contact.list && !device) {
    const { took: _took, ...rest } = contact;
    return { contact: rest, twice: false };
  }
  const tag = message.tag;
  if (!tag) return { contact, twice: false };
  const kept = (contact.took ?? []).filter((t) => now - t.at < TOOK_LASTS + TOOK_DAY);
  const was = kept.find((t) => t.t === tag);
  const voice = message.voice;
  if (was && (!voice || !was.p || was.p.includes(voice.part))) {
    return { contact: { ...contact, took: was.two ? kept : kept.map((t) => (t === was ? { ...t, two: true as const } : t)) }, twice: true };
  }
  // A part of a voice message not taken yet: with the others, until all were.
  const parts = [...(was?.p ?? []), ...(voice ? [voice.part] : [])];
  const took: Took = { t: tag, at: was?.at ?? tookDay(now), ...(voice && parts.length < voice.parts ? { p: parts } : {}), ...(was?.two ? { two: true as const } : {}) };
  if (was) return { contact: { ...contact, took: kept.map((t) => (t === was ? took : t)) }, twice: false };
  if (kept.length < MAX_TOOK) return { contact: { ...contact, took: [...kept, took] }, twice: false };
  const gives = kept.findIndex((t) => t.two);
  return { contact: { ...contact, took: gives < 0 ? kept : [...kept.slice(0, gives), ...kept.slice(gives + 1), took] }, twice: false };
}

// A way to an endpoint once a packet opened in one of its conversations (`at`): written to where
// its messages say it reads, in the one it last sent in, which also means it has the first packet,
// so none is started again for want of an answer.
function heardWay({ again: _again, ...way }: Way, at: number, opened: core.Opened, message: Message, sealed: boolean | undefined): Way {
  const others = way.conversations.filter((_, j) => j !== at);
  return {
    ...way,
    ...(message.from ? { sender: message.from, ...whereOf(message, way), spare: message.spare ?? null } : {}),
    conversations: [toBase64(opened.conversation), ...others].slice(0, MAX_CONVERSATIONS),
    first: '',
    sealTo: message.pk || way.sealTo,
    sealsIn: sealed ?? way.sealsIn,
  };
}

// Whether the next copy for a way starts another conversation with its endpoint (`Way.again`): the
// relay took the first packet of the one started here, and it has not answered in it for a day, or
// its side may have lost what it spoke in them.
function startsAgain(way: Way, now: number): boolean {
  return way.conversations.length > 0 && !way.first && way.again !== undefined && now >= way.again;
}

// Where each endpoint of this account's list reads as one contact (`identity`) is given it: the key
// to seal with each contact's own, drawn from the one kept for that entry (lib/sealed-packet.ts
// entryKey), so neither another contact nor a relay that works with one opens what they seal for it.
function routesFor(r: Record<string, Route>, identity: string): Record<string, Route> {
  return Object.fromEntries(Object.entries(r).map(([id, route]) => [id, route.pk ? { ...route, pk: entryKeyOf(route.pk, identity) } : route]));
}

// The key an entry whose kept key is `seed` (base64url) gives the contact with `identity`, base64url.
function entryKeyOf(seed: string, identity: string): string {
  return toBase64Url(entryKey(fromBase64Url(seed), identity));
}

async function endpointOf(account: Uint8Array): Promise<Endpoint> {
  const [identity, bundle] = await Promise.all([core.accountIdentity(account), core.accountBundle(account)]);
  return { id: toHex(identity), bundle: toBase64Url(bundle) };
}

const LINE_LETTERS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/** Ten random letters and digits: the name the relay has for an invite to it made here (E2E.lineFor). */
export function randomLineName(): string {
  let out = '';
  // 252 is 7 times 36: a byte past it is left out, so each letter is as likely.
  while (out.length < 10) for (const byte of randomBytes(16)) if (byte < 252 && out.length < 10) out += LINE_LETTERS[byte % 36];
  return out;
}

export class E2E {
  /** This account's identity key. */
  readonly identity: Uint8Array;
  /** This account's public keys, for its contact link. */
  readonly bundle: Uint8Array;
  private data: E2EData;
  private readonly account: Uint8Array;
  private readonly store: (data: E2EData) => Promise<void>;
  private queue: Promise<unknown> = Promise.resolve();
  // Until when each contact said their phone is open, and when this one last said it to them.
  // Only in memory: none of it is kept.
  private readonly online = new Map<string, number>();
  private readonly told = new Map<string, number>();
  // Whether this chat says when its space was last open, and is shown its contacts' (lib/last-seen.ts):
  // null, as for hidden chats, says nothing and shows nothing. And the time last said to each
  // contact, only in memory, so one who asks while the app is away is answered only with a newer one.
  private seenWay: { on: boolean; at: () => number; tells?: boolean } | null = null;
  // When each contact was last told, unasked, that the app opened (openDue).
  private readonly openTold = new Map<string, number>();
  private readonly seenTold = new Map<string, number>();
  // This chat's backup queue (lib/spare.ts), said in every message that says where its queue is.
  private ownSpare: Spare | null = null;
  // When this chat's own queue was made (`qa`, lib/queue-move.ts), said with it; 0 while not known.
  // Its sender id, and those it moved away from this run, by when each was made.
  private ownAge = 0;
  private ownFrom = '';
  private readonly froms = new Map<string, number>();
  // Whether the own queue is the one the contact link names, as before the first move (lib/queue-move.ts).
  private linkOwn = true;
  // Whether contacts take queues of their own, made ahead (lib/contact-queues.ts), and the relay this chat reads on now.
  private givesQueues = false;
  private ownUrl = '';
  // The account's other devices, for the space's own chat (lib/devices.ts).
  private link: Link | null = null;
  // The keys of packet keys (lib/sealed-packet.ts), by the packet key.
  private readonly packetKeys = new Map<string, PacketKeys>();
  // When a packet that came unsealed was last tried in the conversations of contacts whose packets
  // come sealed: so few that one sent to tire the phone costs it little.
  private unsealedTries: number[] = [];
  // On a linked device: its own endpoint, as its account (E2EData.endpoint) gives it.
  private ownEndpoint: Endpoint | null = null;
  // Whether this chat knows about the linked devices of accounts (docs/multi-device.md): the space's
  // and hidden chats alike, with a core that signs; with each contact only as `partOf` says.
  private readonly takesPart: boolean;
  // The copies for contacts' endpoints that wait for the relay (lock/fanout-data.ts), kept after the
  // conversations they were sealed in; and who is told when there are more.
  private fanout: FanoutData = EMPTY_FANOUT;
  private readonly keepFanout: (data: FanoutData) => Promise<void>;
  private readonly copyListeners = new Set<() => void>();
  // The endpoint each of a contact's messages came through ('' for their account), by contact and
  // tag, so what says it came goes back that way. Only in memory.
  private readonly cameFrom = new Map<string, string>();
  // The contacts given this account's list in what `seal` sealed with `keys`, with when, and which
  // list it was, its `n` and `rAt`, until `keysGiven`.
  private readonly listSealed = new Map<string, { at: number; n: number; rAt: number }>();
  // What `seal` sealed with `keys` said of Nostr (nostrSaid), by contact, until `keysGiven`.
  private readonly nostrSealed = new Map<string, string>();
  // The name `seal` sealed with `keys` said (nameDue), by contact, until `keysGiven`.
  private readonly nameSealed = new Map<string, string>();
  // Whether contacts are asked for a bell on the relay with each text through Nostr: hidden chats,
  // which hear of what came only so while closed (lib/nostr.ts).
  private bells = false;
  // The copies of each seal that wait for what it sealed for the account to go (`copiesAfter`), by
  // the seal's number, not sealed yet. Only in memory: lost, those endpoints miss them.
  private readonly heldCopies = new Map<number, Held>();
  private nextPending = 1;
  // What went to each endpoint of contacts' accounts (`copiesGo`), by contact, endpoint and what it
  // is (ToCopy.key; `got` and `read` with a tag): of a voice message, how many of its parts; 1 for
  // all else. The last MAX_COPIED, only in memory.
  private readonly copied = new Map<string, number>();
  // The endpoints whose queue the relay said was full the last time a copy went to it, by contact,
  // endpoint and where it read then, until it takes one there (`copiesSent`). Only in memory.
  private readonly refused = new Set<string>();
  // The endpoints the device list as last signed names, read from it once.
  private listed: { b: string; ids: string[] } | null = null;

  private constructor(data: E2EData, account: Uint8Array, identity: Uint8Array, bundle: Uint8Array, store: (data: E2EData) => Promise<void>, takesPart: boolean, keepFanout: (data: FanoutData) => Promise<void>) {
    this.data = data;
    this.account = account;
    this.identity = identity;
    this.bundle = bundle;
    this.store = store;
    this.takesPart = takesPart;
    this.keepFanout = keepFanout;
    this.tellTor(data.contacts);
  }

  /** The space's own chat, or its hidden chats (`holder`), sealed with `key`. Makes the account the first time. */
  static async open(holder: Holder, space: number, key: Uint8Array): Promise<E2E> {
    const store = (data: E2EData) => saveE2EData(holder, space, key, data);
    let data = await loadE2EData(holder, space, key);
    const made = !data.account;
    if (made) {
      data = { ...data, account: toBase64(await core.newAccount()) };
      await store(data);
    }
    const restore = await lastRestore();
    const account = fromBase64(data.account);
    const prekeys = data.prekeys ?? [];
    if (core.canRenewPrekeys() && (prekeys.length === 0 || Date.now() - prekeys[0].at >= PREKEYS_EVERY)) {
      const made = await core.newPrekeys(account);
      data = { ...data, prekeys: [{ secret: toBase64(made.secret), bundle: toBase64(made.bundle), at: Date.now() }, ...prekeys].slice(0, MAX_PREKEYS) };
      await store(data);
    }
    const takesPart = core.canSign();
    const keepFanout = (fanout: FanoutData) => (takesPart ? saveFanoutData(holder, space, key, fanout) : Promise.resolve());
    const e2e = new E2E(data, account, await core.accountIdentity(account), await core.accountBundle(account), store, takesPart, keepFanout);
    if (data.endpoint) e2e.ownEndpoint = await endpointOf(fromBase64(data.endpoint)).catch(() => null);
    e2e.bells = holder !== 'space';
    if (takesPart) e2e.fanout = await loadFanoutData(holder, space, key);
    if (takesPart && holder === 'space') await keepFanoutFile(space, key, e2e.fanout).catch(() => undefined);
    if (restore && data.restore !== restore && core.canRestore()) await e2e.putBack(restore, made);
    return e2e;
  }

  // A backup put back (lock/restored.ts), the first time this chat opens since: each contact's
  // conversations moved past the keys they may have used, and a new one started with them, all in
  // one save. An account made only now was not in the backup: no contact holds a list of it. Each
  // contact's own queue is still theirs; the ones kept ready may have been given out since, to
  // contacts the backup does not hold, so none is given again: they go, after the same grace as a
  // queue moved.
  private async putBack(restore: string, made: boolean): Promise<void> {
    const now = Date.now();
    const ready = (this.data.ready ?? []).map(({ r, u }) => ({ r, u, until: now + GRACE }));
    const contacts = await Promise.all(this.data.contacts.map(async (contact) => this.startAnew(await restoredContact(contact, now), now)));
    await this.save({ ...this.data, contacts, restore, ...(made ? {} : { putBack: now }), ready: undefined, gone: withGone(this.data.gone, ready) });
  }

  // A new conversation with a contact a backup put back (putBack), started with the newest prekeys
  // they gave this chat (Contact.bundle): those put back may have moved on there since the backup
  // was made, with keys this phone never had, and then open in neither direction. Its first message
  // says nothing, as one started with newer prekeys does (startedAgain), and when it was started
  // (`fa`), later than any before: so their Erevos takes it in place of the one it sends in, and sends
  // in it from then on, as an Erevos from before `fa` does with any new one. While their phone surely
  // still keeps those prekeys (KEPT_FOR since they came), this chat sends in it at once, after its
  // first packet (`first`). Later their phone may have thrown them away, and the first packet then
  // opens nothing there: it goes on its own (`renew`), and this chat goes on in the one put back
  // until they answer in the new one. Not on a linked device, nor with one who knows this chat by
  // another identity, a request not accepted, one whose first packet still waits, or one who never
  // gave newer prekeys (an Erevos before them): what moved on with those needs their link again.
  private async startAnew(contact: Contact, now: number): Promise<Contact> {
    const bundle = contact.bundle;
    if (this.data.own || contact.ownIdentity || contact.request || contact.first || !bundle || contact.conversations.length === 0) return contact;
    const first: Message = { from: '', relay: '', relayKey: '', text: '', tag: '', erase: null, timer: null, timerAt: 0, lasts: 0, got: [], read: [], voice: null, file: null, ...SAYS_NOTHING, call: null, group: null, pk: this.ownPacketKey(contact), ...this.saysDevices(contact), fa: firstAt() };
    let started: core.Sealed;
    try {
      started = await core.startConversation(this.account, fromBase64(bundle), encodeMessage(first));
    } catch {
      return contact;
    }
    const { renew: _renew, ...rest } = contact;
    const [sending, ...older] = contact.conversations;
    const conversation = toBase64(started.conversation);
    if (now - (contact.bundleAt ?? now) < KEPT_FOR) return { ...rest, conversations: [conversation, ...contact.conversations].slice(0, MAX_CONVERSATIONS), first: toBase64(started.packet) };
    return { ...rest, conversations: [sending, conversation, ...older].slice(0, MAX_CONVERSATIONS), renew: toBase64(started.packet) };
  }

  /** Says this backup queue from now on in what tells contacts where this chat's queue is, or none. */
  setSpare(spare: Spare | null): void {
    this.ownSpare = spare;
  }

  /** The backup queue this chat says, if any. */
  spare(): Spare | null {
    return this.ownSpare;
  }

  /** Reaches the account's other devices through `link` from now on, or no longer. */
  useLink(link: Link | null): void {
    this.link = link;
    this.tellTor(this.data.contacts);
  }

  /** Says from now on, in each message that says where this chat's queue is, when that queue was made (`qa`, lib/queue-move.ts), and which queue it is (`from`, its sender id). */
  setQueueAge(qa: number, from = ''): void {
    this.ownAge = qa;
    if (!from) return;
    this.ownFrom = from;
    this.froms.set(from, qa);
  }

  /** Says whether the own queue is the one the contact link names (no queue of its own yet, lib/queue-move.ts): then someone who asked to talk through it knows it, so blocking them moves it. */
  setLinkOwn(own: boolean): void {
    this.linkOwn = own;
  }

  /** Gives contacts queues of their own from now on, made ahead (lib/contact-queues.ts), or no more (`on` false), on the relay this chat reads on now (`url`). Those who have one there keep it either way. */
  useContactQueues(on: boolean, url: string): void {
    this.givesQueues = on;
    this.ownUrl = url;
  }

  // A contact's own queue, when it is on the relay this chat reads on now; never on a linked
  // device, whose phone holds the queues contacts write to.
  private mineHere(contact: Pick<Contact, 'mine'> | undefined): Mine | null {
    const mine = contact?.mine;
    return mine && !this.link?.through && !!this.ownUrl && sameRelay(mine.u, this.ownUrl) ? mine : null;
  }

  // Whether a contact knows the own queue as it is now (Contact.knows): one kept from before contact
  // queues does, as does one told it since it was made.
  private knowsOwn(contact: Pick<Contact, 'knows'>): boolean {
    return contact.knows === undefined || (contact.knows > 0 && contact.knows >= this.ownAge);
  }

  // A queue made ahead, for a contact about to be written to who has none of their own on the relay
  // this chat reads on now (lib/contact-queues.ts): taken from those made ahead in memory only, so
  // the save that keeps the contact keeps both. Its `qa` is later than any this chat said them, so
  // their phone takes it; one they had on another relay is read through its grace. Null while
  // contacts take no queues of their own, or none is made ahead.
  private takeReady(contact: Pick<Contact, 'mine' | 'qaFloor' | 'qaBase'> | undefined, now = Date.now()): Mine | null {
    if (!this.givesQueues || this.link?.through || !this.ownUrl || this.ownAge <= 0 || this.mineHere(contact)) return null;
    const ready = this.data.ready ?? [];
    const at = ready.findIndex((r) => sameRelay(r.u, this.ownUrl));
    if (at < 0) return null;
    const { r, s, u } = ready[at];
    const before = contact?.mine;
    const gone = before?.was ? withGone(this.data.gone, [before.was]) : this.data.gone;
    this.data = { ...this.data, ready: ready.filter((_, i) => i !== at), ...(gone ? { gone } : {}) };
    const qa = Math.max(saidAge(this.ownAge, contact), before?.qa ?? 0) + 1;
    return { r, s, u, qa, g: this.freeGroup(u), ...(before ? { was: { r: before.r, u: before.u, until: now + GRACE } } : {}) };
  }

  // The first group of contact queues on the relay at `url` with room for one more (CONTACT_GROUP).
  private freeGroup(url: string): number {
    const counts = new Map<number, number>();
    for (const c of this.data.contacts) if (c.mine && sameRelay(c.mine.u, url)) counts.set(c.mine.g, (counts.get(c.mine.g) ?? 0) + 1);
    let g = 0;
    while ((counts.get(g) ?? 0) >= CONTACT_GROUP) g++;
    return g;
  }

  /** The contacts' own queues (lib/contact-queues.ts), on any relay, each with the one it took the place of while that is read. */
  contactQueues(): { identity: string; mine: Mine }[] {
    if (this.link?.through) return [];
    return this.data.contacts.flatMap((c) => (c.mine ? [{ identity: c.identity, mine: c.mine }] : []));
  }

  /** How many kept contacts are to take a queue of their own on the relay at `url` and have none there, and how many are made ahead there. */
  queuesWanted(url: string): { want: number; ready: number } {
    if (this.link?.through) return { want: 0, ready: 0 };
    const want = this.data.contacts.filter((c) => !c.request && c.sender && c.conversations[0] && !(c.mine && sameRelay(c.mine.u, url) && !c.mine.move)).length;
    return { want, ready: (this.data.ready ?? []).filter((r) => sameRelay(r.u, url)).length };
  }

  /** The recipient ids (hex) of the queues made ahead on the relay at `url`, not given to anyone yet: the web app's pushes go for them already (lib/web-push.web.ts). */
  readyAt(url: string): string[] {
    if (this.link?.through) return [];
    return (this.data.ready ?? []).filter((r) => sameRelay(r.u, url)).map((r) => r.r);
  }

  /** Keeps queues made ahead on the relay for the next contacts written to; those made ahead on another relay, or past MAX_READY, are to be deleted (`gone`). */
  addReady(made: Ready[], url: string): Promise<void> {
    return this.run(async () => {
      const all = [...(this.data.ready ?? []), ...made];
      const here = all.filter((r) => sameRelay(r.u, url));
      const kept = here.slice(-MAX_READY);
      const over = [...all.filter((r) => !sameRelay(r.u, url)), ...here.slice(0, here.length - kept.length)];
      if (made.length === 0 && over.length === 0) return;
      const { ready: _ready, ...rest } = this.data;
      const gone = withGone(this.data.gone, over.map((r) => ({ r: r.r, u: r.u, until: 0 })));
      await this.save({ ...rest, ...(kept.length > 0 ? { ready: kept } : {}), ...(gone ? { gone } : {}) });
    });
  }

  /** The contact queues no one is to write to any more (E2EData.gone), the oldest first. */
  goneQueues(): OldMine[] {
    return this.data.gone ?? [];
  }

  /** Forgets those of `gone` with these recipient ids (hex): deleted on the relay, or no longer there. */
  goneDropped(rs: string[]): Promise<void> {
    return this.run(async () => {
      const left = this.goneQueues().filter((g) => !rs.includes(g.r));
      if (left.length === this.goneQueues().length) return;
      const { gone: _gone, ...rest } = this.data;
      await this.save(left.length > 0 ? { ...rest, gone: left } : rest);
    });
  }

  /**
   * The queues contacts' own queues took the place of (Mine.was), once their grace is over or the
   * contact was heard on the new one: to be deleted (`gone`), as no one writes to them any more.
   */
  oldMinesOver(now = Date.now()): Promise<void> {
    return this.run(async () => {
      const over = this.data.contacts.filter((c) => c.mine?.was && (c.mine.heard || c.mine.was.until <= now));
      if (over.length === 0) return;
      const gone = withGone(
        this.data.gone,
        over.map((c) => ({ ...c.mine!.was!, until: 0 })),
      );
      const ids = new Set(over.map((c) => c.identity));
      await this.save({
        ...this.data,
        contacts: this.data.contacts.map((c) => {
          if (!ids.has(c.identity) || !c.mine) return c;
          const { was: _was, ...mine } = c.mine;
          return { ...c, mine };
        }),
        ...(gone ? { gone } : {}),
      });
    });
  }

  /**
   * The phone a backup put this chat back from was lost (lib/queue-move.ts lostNow): each contact's
   * own queue, which that phone knows, is to move to one made ahead (`move`), a few with each look
   * (renewMine). Not on a linked device, whose phone holds them.
   */
  moveMines(): Promise<void> {
    return this.run(async () => {
      if (this.link?.through || !this.data.contacts.some((c) => c.mine && !c.mine.move)) return;
      await this.save({ ...this.data, contacts: this.data.contacts.map((c) => (c.mine && !c.mine.move ? { ...c, mine: { ...c.mine, move: true as const } } : c)) });
    });
  }

  /** The contacts whose own queue is to move (moveMines). */
  minesToMove(): string[] {
    return this.link?.through ? [] : this.data.contacts.filter((c) => c.mine?.move).map((c) => c.identity);
  }

  /**
   * A contact's own queue changes: the relay lost it (`lost`), junk came to it, or the phone a
   * backup came from knows it (`moved`, moveMines). They take one made ahead now, which the next
   * tell says; the one before is read through its grace, but one the relay lost. Says whether one
   * was made ahead: with none, nothing changes yet.
   */
  renewMine(identity: string, lost: boolean, now = Date.now(), moved = false): Promise<boolean> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact?.mine) return false;
      const { mine: before, ...rest } = contact;
      // The one the relay lost is not read again; one moved away from for junk is, through its grace.
      const kept: Contact = lost ? rest : contact;
      const mine = this.takeReady({ ...kept, mine: undefined }, now) ?? null;
      if (!mine) return false;
      const was = lost ? before.was : { r: before.r, u: before.u, until: now + GRACE };
      const gone = lost && before.was ? this.data.gone : before.was ? withGone(this.data.gone, [before.was]) : this.data.gone;
      await this.save({
        ...this.withContact({ ...rest, mine: { ...mine, qa: Math.max(mine.qa, before.qa + 1), ...(was ? { was } : {}), ...(lost || moved ? {} : { junk: now }) } }),
        ...(gone ? { gone } : {}),
      });
      return true;
    });
  }

  // What a message says of where this chat reads, and when that queue was made: one it moved away
  // from, as a screen that has not heard of the move yet says, is the one it moved to. To a contact
  // moved here from the space or a hidden place, later than what the other said them last (`qaFloor`).
  private fromNow(from: string, contact?: Pick<Contact, 'qaFloor' | 'qaBase' | 'mine'>): { from: string; qa: number } {
    if (!from) return { from, qa: 0 };
    // Theirs alone, when they have one (lib/contact-queues.ts).
    const mine = this.mineHere(contact);
    if (mine) return { from: mine.s, qa: mine.qa };
    const age = this.froms.get(from);
    const moved = age !== undefined && age < this.ownAge && !!this.ownFrom;
    return { from: moved ? this.ownFrom : from, qa: saidAge(this.ownAge, contact) };
  }

  /** The `qa` this chat says a contact now (lib/move-chat.ts, as the chat moves away from here), or 0 while it says none. */
  saidTo(identity: string): number {
    const contact = this.find(identity);
    return this.mineHere(contact)?.qa ?? saidAge(this.ownAge, contact);
  }

  /** When this chat's own queue was made, as last said (`setQueueAge`), or 0. */
  queueAge(): number {
    return this.ownAge;
  }

  /** The backup put back that this chat's conversations were last moved past (lock/restored.ts), or ''. */
  restoreId(): string {
    return this.data.restore ?? '';
  }

  /** When a backup was put back here (ms), or 0: for a day after, junk is not counted (lib/moves.ts junkStep). */
  putBackAt(): number {
    return this.data.putBack ?? 0;
  }

  /** When a contact was deleted or blocked here and this chat's own queue is to move for it (lib/queue-move.ts), or 0. */
  moveDue(): number {
    return this.data.moveDue ?? 0;
  }

  /** The move that started at `started` (ms) is done: what was due by then is no more. */
  moveDone(started: number): Promise<void> {
    return this.run(async () => {
      if (!this.data.moveDue || this.data.moveDue > started) return;
      const { moveDue: _due, ...rest } = this.data;
      await this.save(rest);
    });
  }

  /** Whether this chat is a linked device's, which reaches contacts through the phone. */
  onLinkedDevice(): boolean {
    return this.link?.through === true;
  }

  /** On a linked device: its phone asks it to move its own queue (lib/devices.ts `move`), as a deletion does on the phone. */
  moveSoon(): Promise<void> {
    return this.run(async () => {
      if (!this.data.moveDue) await this.save({ ...this.data, moveDue: Date.now() });
      // The move is made by the next look, which does not wait at the relay first.
      lookNow();
    });
  }

  /** Who is blocked here, the latest last. */
  blocked(): Blocked[] {
    return this.data.blocked ?? [];
  }

  /**
   * An invite for someone new, named `name` here (lib/welcome.ts): the secret its link carries,
   * which their first message says back, so they are a contact here at once, with that name, not a
   * message request. Good for one, for WELCOME_DAYS. `as`: the name this phone gives itself in the
   * invite, offered again for the next one (invitedAs).
   */
  welcome(name: string, as = ''): Promise<string> {
    return this.run(async () => {
      const hi = toHex(randomBytes(16));
      const now = Date.now();
      const invited: Invited[] = [...this.waitingInvites(now), { hi, name: cleanName(name), until: now + WELCOME_DAYS * 24 * 3600 * 1000 }].slice(-MAX_INVITED);
      const named = cleanName(as);
      const { invitedAs: _as, ...rest } = this.data;
      await this.save({ ...rest, invited, ...(named ? { invitedAs: named } : {}) });
      return hi;
    });
  }

  /**
   * Names, or names again, who an invite still waiting is for (welcome), and its invite to the
   * relay (`line`, lineFor), here only: the invite is made at a tap, before any name is typed.
   */
  nameInvite(hi: string, name: string, line = ''): Promise<void> {
    return this.run(async () => {
      const named = cleanName(name);
      const invited = (this.data.invited ?? []).map((i) => (i.hi === hi ? { ...i, name: named } : i));
      const lines = (this.data.lines ?? []).map((l) => (line && l.l === line ? { ...l, n: named } : l));
      await this.save({ ...this.data, invited, ...(this.data.lines ? { lines } : {}) });
    });
  }

  /** Whether the invite whose secret is `hi` still waits for whoever it is for. */
  inviteWaits(hi: string, now = Date.now()): boolean {
    return this.waitingInvites(now).some((i) => i.hi === hi);
  }

  /** Keeps `as` as the name this phone gives itself in its invites (invitedAs). */
  inviteAs(as: string): Promise<void> {
    return this.run(async () => {
      const named = cleanName(as);
      const { invitedAs: _as, ...rest } = this.data;
      await this.save({ ...rest, ...(named ? { invitedAs: named } : {}) });
    });
  }

  /** The name this phone gave itself in its last invite, or ''. */
  invitedAs(): string {
    return this.data.invitedAs ?? '';
  }

  /**
   * A name for an invite to the relay for someone named `name` here: random letters and digits, the
   * only name the relay and whoever runs it see for them, while `name` stays here (lineName).
   */
  lineFor(name: string): Promise<string> {
    return this.run(async () => {
      const line = randomLineName();
      const lines: InviteLine[] = [...(this.data.lines ?? []), { l: line, n: cleanName(name) }].slice(-MAX_LINES);
      await this.save({ ...this.data, lines });
      return line;
    });
  }

  /** Who the invite to the relay the relay names `line` was made for here, or '' when not from here. */
  lineName(line: string): string {
    return (this.data.lines ?? []).find((l) => l.l === line)?.n ?? '';
  }

  // The invites given from here that wait still.
  private waitingInvites(now: number): Invited[] {
    return (this.data.invited ?? []).filter((i) => i.until > now);
  }

  /** Lets someone blocked write again: a first packet from them comes as a message request. */
  unblock(identity: string): Promise<void> {
    return this.run(async () => {
      const blocked = this.blocked().filter((b) => b.identity !== identity);
      if (blocked.length === this.blocked().length) return;
      const { blocked: _blocked, ...rest } = this.data;
      await this.save(blocked.length > 0 ? { ...rest, blocked } : rest);
      if (this.link?.through) this.link.unblocked?.(identity);
      else this.link?.blockedChanged?.(blocked);
    });
  }

  /** On a device unlinked from the phone: who the phone blocked is kept here no more, as its contacts are not. */
  forgetBlocked(): Promise<void> {
    return this.run(async () => {
      if (!this.data.blocked) return;
      const { blocked: _blocked, ...rest } = this.data;
      await this.save(rest);
    });
  }

  /** What a relay still holds for later for those deleted or blocked here, that it was not yet asked to drop (lib/waiting.ts, dropHeld). */
  undropped(): Undropped[] {
    return this.data.undropped ?? [];
  }

  /** Forgets those of `undropped` with the ids `ids`, dropped or gone, and those whose time is past. */
  dropped(ids: string[], now = Date.now()): Promise<void> {
    return this.run(async () => {
      const left = this.undropped().filter((u) => !ids.includes(u.id) && u.at > now);
      if (left.length === this.undropped().length) return;
      const { undropped: _undropped, ...rest } = this.data;
      await this.save(left.length > 0 ? { ...rest, undropped: left } : rest);
    });
  }

  /** Keeps what a relay holds for later that is to go no more, to drop now or with a later look (lib/waiting.ts dropHeld): held anew for one deleted meanwhile, or one the relay could not be asked to take back. */
  keepUndropped(held: Undropped[]): Promise<void> {
    return this.run(async () => {
      if (held.length > 0) await this.save({ ...this.data, ...this.withUndropped(held) });
    });
  }

  // What a relay holds for later for one removed, kept to drop in the same save as their removal.
  private withUndropped(held: Undropped[]): Pick<E2EData, 'undropped'> {
    return held.length > 0 ? { undropped: [...this.undropped().filter((u) => !held.some((h) => h.id === u.id)), ...held].slice(-MAX_UNDROPPED) } : {};
  }

  /** What relays hold for later for the endpoints of a contact's account (lib/fanout.ts), of the message `tag`, or of all theirs without one. */
  laterCopies(c: string, tag?: string, now = Date.now()): HeldCopy[] {
    return (this.data.heldCopies ?? []).filter((h) => h.c === c && (tag === undefined || h.t === tag) && h.at > now);
  }

  /** Keeps what relays now hold for later for the endpoints of contacts' accounts; those past their time are let go of. */
  copiesHeld(held: HeldCopy[], now = Date.now()): Promise<void> {
    return this.run(async () => {
      const kept = [...(this.data.heldCopies ?? []).filter((h) => h.at > now && !held.some((x) => x.id === h.id)), ...held.filter((h) => h.at > now)].slice(-MAX_UNDROPPED);
      if (kept.length === 0 && !this.data.heldCopies) return;
      const { heldCopies: _was, ...rest } = this.data;
      await this.save(kept.length > 0 ? { ...rest, heldCopies: kept } : rest);
    });
  }

  /** The copies of a message sent for later (or of all a contact's) go no more, as it was taken back: kept to drop (lib/waiting.ts, dropHeld). */
  letGoCopies(c: string, tag?: string): Promise<void> {
    return this.run(async () => {
      const going = this.laterCopies(c, tag);
      if (going.length === 0) return;
      await this.save({ ...this.data, ...this.withUndropped(going.map(({ id, relay, at }) => ({ id, relay, at }))), ...this.withoutCopies(c, tag) });
    });
  }

  // What relays hold for the endpoints of a contact's account, without those of `tag` (all theirs without one).
  private withoutCopies(c: string, tag?: string): Pick<E2EData, 'heldCopies'> {
    const kept = (this.data.heldCopies ?? []).filter((h) => !(h.c === c && (tag === undefined || h.t === tag)));
    return { heldCopies: kept.length > 0 ? kept : undefined };
  }

  /** Whether `identity` is blocked here: what they ask through a group or an SMS invite is dropped too. */
  isBlocked(identity: string): boolean {
    return this.blocked().some((b) => b.identity === identity);
  }

  /**
   * The kept contacts to tell where this chat reads now, in a message with nothing in it
   * (lib/queue-move.ts): those not told the own queue made at `moved`, and again those not heard on
   * it since (lib/moves.ts tellDue). One with a queue of their own (lib/contact-queues.ts) is told
   * that one the same way, and as many as there are queues made ahead take one each, in the tell.
   * None for the queue the first look found (`since`), none to a message request, and none on a
   * linked device, whose phone tells them.
   */
  tellsDue(moved: number, since: number, now = Date.now()): string[] {
    if (this.link?.through) return [];
    let ready = this.givesQueues && this.ownAge > 0 ? (this.data.ready ?? []).filter((r) => sameRelay(r.u, this.ownUrl)).length : 0;
    const due = (c: Contact) => {
      const mine = this.mineHere(c);
      if (mine) return tellDue(mine.told, mine.heard ? mine.qa : undefined, mine.qa, 0, now);
      if (ready > 0) {
        ready--;
        return true;
      }
      return moved > 0 && tellDue(c.told, c.onNew, moved, since, now);
    };
    // A chat that goes only through Tor and has no queue of its own yet takes one first: until its
    // contact writes there, what they send comes to the own queue, which is not read through Tor.
    const first = (c: Contact) => (c.tor === true && !this.mineHere(c) ? 0 : 1);
    return [...this.data.contacts].sort((a, b) => first(a) - first(b)).filter((c) => !c.request && c.sender && c.conversations[0] && due(c)).map((c) => c.identity);
  }

  /** A contact was told the own queue made at `qa`, and the ring queue as it is now: the relay took it. `qa` 0: only the ring queue was due. */
  queueTold(identity: string, qa: number): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) return;
      const { ringTell: _ring, ...rest } = contact;
      // Theirs alone, when they have one: the tell said that one.
      const mine = this.mineHere(contact);
      const told = qa <= 0 ? {} : mine ? { mine: { ...mine, told: toldOnce(mine.told, mine.qa) } } : { told: toldOnce(contact.told, qa) };
      await this.save(this.withContact({ ...rest, ...told }));
    });
  }

  /** The place's ring queue moved (lib/queue-move.ts ringMove): each kept contact is told the new one with the next tells (`ringTellsDue`). */
  ringMoved(): Promise<void> {
    return this.run(async () => {
      if (this.link?.through) return;
      const due = (c: Contact) => !c.request && !!c.sender && !!c.conversations[0];
      if (!this.data.contacts.some((c) => due(c) && !c.ringTell)) return;
      await this.save({ ...this.data, contacts: this.data.contacts.map((c) => (due(c) ? { ...c, ringTell: true as const } : c)) });
    });
  }

  /** The kept contacts not told the ring queue since it moved. */
  ringTellsDue(): string[] {
    if (this.link?.through) return [];
    return this.data.contacts.filter((c) => c.ringTell && !c.request && c.sender && c.conversations[0]).map((c) => c.identity);
  }

  /** The `qa` of the own queue every kept contact was heard on at least: the least of theirs, Infinity with none (lib/moves.ts graceOver). */
  heardSince(): number {
    // One heard on a queue of their own writes to none of this chat's own any more.
    return this.data.contacts.filter((c) => !c.request && c.sender && !this.mineHere(c)?.heard).reduce((least, c) => Math.min(least, c.onNew ?? 0), Infinity);
  }

  // The keys of a packet key, made once.
  private keysOf(key: string): PacketKeys {
    let keys = this.packetKeys.get(key);
    if (!keys) {
      keys = packetKeys(fromBase64Url(key));
      this.packetKeys.set(key, keys);
    }
    return keys;
  }

  // The key this chat gives a contact for the packets they send it.
  private ownPacketKey(contact: Pick<Contact, 'identity' | 'packetKey'>): string {
    return contact.packetKey || toBase64Url(ownPacketKey(this.account, contact.identity));
  }

  // Whether a packet that came unsealed may still be tried in the conversations of contacts whose
  // packets come sealed: one of theirs restored from an old backup may not have this chat's key.
  private mayTryUnsealed(now = Date.now()): boolean {
    this.unsealedTries = this.unsealedTries.filter((at) => now - at < UNSEALED_TRIES_FOR);
    if (this.unsealedTries.length >= UNSEALED_TRIES) return false;
    this.unsealedTries.push(now);
    return true;
  }

  private run<T>(call: () => Promise<T>): Promise<T> {
    const next = this.queue.catch(() => undefined).then(call);
    this.queue = next;
    return next;
  }

  /** Keeps `data` in memory first, so even if saving fails no later call seals from the state before it. */
  private async save(data: E2EData): Promise<void> {
    this.data = data;
    this.link?.changed(data.contacts);
    this.tellTor(data.contacts);
    await this.store(data);
    await this.dropStale();
  }

  // Tells lib/tor-chats.ts which chats go only through Tor, by their queues. On a linked device
  // (told by its link, or before it has one by the account it keeps) not by a contact's own queue:
  // there every chat's is the phone's, which all of them and the device's own link to the phone
  // share, so one chat's circuits would carry them all. What is sealed there for such a chat says
  // its circuits itself instead (Sealed.torChat), and goes on them; its copies to the contact's
  // other devices, and a way the device writes to them by itself, are told by their own queues.
  private tellTor(contacts: readonly Contact[]): void {
    const linked = this.link ? this.link.through : !!this.data.own;
    tellTorChats(toHex(this.identity), contacts, linked);
  }

  private find(identity: string): Contact | undefined {
    return this.data.contacts.find((contact) => contact.identity === identity);
  }

  private withContact(contact: Contact): E2EData {
    const others = this.data.contacts.filter((c) => c.identity !== contact.identity);
    const at = this.data.contacts.findIndex((c) => c.identity === contact.identity);
    // A contact keeps its place in the list.
    others.splice(at < 0 ? others.length : at, 0, contact);
    return { ...this.data, contacts: others };
  }

  /** Where a contact's queue is, as they last said, or null for no contact: to tell whether a send can go before sealing it. */
  queueOf(identity: string): { sender: string; relay: string; relayKey: string; spare: Spare | null } | null {
    const contact = this.find(identity);
    return contact ? { sender: contact.sender, relay: contact.relay, relayKey: contact.relayKey, spare: contact.spare ?? null } : null;
  }

  /**
   * The contacts this chat sends an invite to its relay by itself (app/chat.tsx offerRelays): added
   * here, or accepted, never a message request; with no queue of their own; not sent one before.
   * None on a linked device, whose relay is its account's.
   */
  relayInvitesDue(): string[] {
    if (this.link?.through) return [];
    return this.data.contacts.filter((contact) => !contact.request && !contact.sender && !contact.ri).map((contact) => contact.identity);
  }

  /** An invite to this chat's relay went to them: none goes again. */
  relayInviteSent(identity: string, at = Date.now()): Promise<void> {
    return this.run(async () => {
      if (!this.find(identity)) return;
      await this.save({ ...this.data, contacts: this.data.contacts.map((c) => (c.identity === identity ? { ...c, ri: at } : c)) });
    });
  }

  /** Where a contact reads on Nostr, when they do (readsOnNostr): to put a photo's pieces and the like there. */
  nostrPlace(identity: string): NostrTo | null {
    return this.readsOnNostr(identity) ? (this.find(identity)?.nostrTo ?? null) : null;
  }

  /** Whether a contact reads on Nostr, as they or their link said, and this chat does too: what has no relay between the two goes there (lib/nostr-chats.ts nostrOnlyWay). */
  readsOnNostr(identity: string): boolean {
    return !!this.find(identity)?.nostrTo && !!nostrRelays() && !this.data.own;
  }

  /** Where a contact's ring queue is, as they last said (lock/hidden-ring.ts), or null when they
   *  said none: on the same relay as their message queue, with its own sender id. */
  ringOf(identity: string): { sender: string; relay: string; relayKey: string } | null {
    // A linked device's call goes through the phone, which does not ring it: should the device ring
    // them itself, a call that the phone, off, never passes on would ring with nothing to answer.
    if (this.link?.through) return null;
    const contact = this.find(identity);
    return contact?.ringSender ? { sender: contact.ringSender, relay: contact.relay, relayKey: contact.relayKey } : null;
  }

  contacts(): ContactInfo[] {
    return this.data.contacts.map(({ identity, sender, name, said, timer, shots, request, look, avatar, hide, tor, pin, notify, voice }) => ({
      identity,
      sender,
      // The name this chat gives them, or else the one they go by.
      name: name || said || '',
      ownName: name,
      said: said ?? '',
      timer,
      shots: shots === true,
      request,
      look,
      avatar,
      hide,
      ...(tor === true ? { tor: true } : {}),
      ...(voice ? { voice } : {}),
      locked: !!pin,
      ...(notify ? { notify } : {}),
    }));
  }

  /** Until when a contact said their phone is open, milliseconds, or 0 if it is not known to be. */
  onlineUntil(identity: string, now = Date.now()): number {
    const until = this.online.get(identity) ?? 0;
    return until > now ? until : 0;
  }

  /**
   * Says whether this chat tells its contacts when its space was last open (`on`), with when that was
   * (`at`), and is shown theirs: the space's own chat only (lib/last-seen.ts). Null, as hidden chats
   * keep it, says nothing and shows nothing.
   */
  setLastSeen(way: { on: boolean; at: () => number; tells?: boolean } | null): void {
    this.seenWay = way;
  }

  /**
   * The contacts to tell, unasked, that the app opened (`tells`, Say when I open Erevos): with
   * "last seen" on, while this space or hidden place shows, each at most once in OPEN_EVERY, and
   * only those who said their own time within OPEN_RECENT (so their "last seen" is on, and they
   * wrote or answered lately); never a chat that appears offline, nor a request. Each is taken as
   * told now.
   */
  openDue(now = Date.now()): string[] {
    const way = this.seenWay;
    if (!way?.on || way.tells === false || way.at() < now - OPEN_SHOWN) return [];
    const due = this.data.contacts
      .filter((c) => !c.hide && !c.request && (c.seenAt ?? 0) >= now - OPEN_RECENT && now - (this.openTold.get(c.identity) ?? 0) >= OPEN_EVERY)
      .map((c) => c.identity);
    for (const identity of due) this.openTold.set(identity, now);
    return due;
  }

  /**
   * The contacts to tell, unasked, that this chat's space or hidden place closed at `at` (Say when I
   * open Erevos), having shown since `since` (lib/last-seen.ts onShownEnded): those told while it
   * showed that it was open, unless they heard it in the last CLOSE_QUIET, so their "last seen" is
   * when it closed. None when it is another's that closed, or "last seen" or telling is off; never
   * a chat that appears offline, nor a request. Each is taken as told at `at`.
   */
  closeDue(since: number, at: number): string[] {
    const way = this.seenWay;
    if (!way?.on || way.tells === false || way.at() !== at) return [];
    const due = this.data.contacts
      .filter((c) => {
        const told = this.seenTold.get(c.identity) ?? 0;
        return !c.hide && !c.request && told >= since && told < at - CLOSE_QUIET;
      })
      .map((c) => c.identity);
    for (const identity of due) this.seenTold.set(identity, at);
    return due;
  }

  /**
   * Whether this chat's space or hidden place shows on the screen now (lib/last-seen.ts), so its
   * contacts may be told it is open: not the space while its hidden chats are open, nor hidden
   * chats once closed. True when not known (no "last seen" way set).
   */
  showsNow(now = Date.now()): boolean {
    const way = this.seenWay;
    return !way || way.at() >= now - 1000;
  }

  /** When a contact's Erevos was last open, as they said (ms), or 0: not said, not shown here, or a chat that appears offline. */
  lastSeen(identity: string): number {
    if (!this.seenWay?.on) return 0;
    const contact = this.find(identity);
    return contact && !contact.hide && !contact.request ? (contact.seenAt ?? 0) : 0;
  }

  /** Whether a contact who asks while the app is away is told when its space was last open: it was open since they were last told. */
  seenNews(identity: string): boolean {
    const way = this.seenWay;
    if (!way?.on) return false;
    const contact = this.find(identity);
    return !!contact && !contact.hide && !contact.request && way.at() > (this.seenTold.get(identity) ?? 0);
  }

  // What a message to a contact says of when this space was last open: nothing from hidden chats, to
  // a chat that appears offline, or to a request not accepted; 0 once turned off; else the time, once known.
  private saysSeen(contact: Contact): { ls?: number } {
    const way = this.seenWay;
    if (!way || contact.hide || contact.request) return {};
    if (!way.on) return { ls: 0 };
    const at = way.at();
    if (at <= 0) return {};
    this.seenTold.set(contact.identity, Math.max(at, this.seenTold.get(contact.identity) ?? 0));
    return { ls: at };
  }

  // A contact's message, as it says when their Erevos was last open: kept, the latest, never later
  // than now; 0 forgets it; absent leaves it. Only by a chat that shows it.
  private seenIn(contact: Contact, message: Message, now = Date.now()): Contact {
    if (message.ls === undefined || !this.seenWay) return contact;
    if (message.ls === 0) {
      const { seenAt: _seenAt, ...rest } = contact;
      return rest;
    }
    const at = Math.min(message.ls, now);
    return at > (contact.seenAt ?? 0) ? { ...contact, seenAt: at } : contact;
  }

  /** When this phone last said to a contact that it is open, milliseconds, or 0. */
  toldAt(identity: string): number {
    return this.told.get(identity) ?? 0;
  }

  /**
   * Whether the chat with a contact goes only through Tor (Contact.tor), or as the space's way says.
   * The account's other devices do the same (lib/devices.ts), as the phone, or a device, sets it.
   */
  setTor(identity: string, on: boolean): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      const { tor: _was, ...rest } = contact;
      await this.save(this.withContact(on ? { ...rest, tor: true } : rest));
      // What Nostr reads changes with it (nostrKeys).
      if (contact.nostr) nostrKeysChanged();
    });
  }

  /** The voice the chat with a contact sends its voice messages with (Contact.voice), or null for the voice as it is. */
  setVoice(identity: string, voice: VoiceKind | null): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      const { voice: _was, ...rest } = contact;
      await this.save(this.withContact(voice ? { ...rest, voice } : rest));
    });
  }

  /** The voice the chat with `identity` changes its voice messages to, if any. */
  voiceOf(identity: string): VoiceKind | undefined {
    return this.find(identity)?.voice;
  }

  /** Whether the chat with `identity` goes only through Tor (Contact.tor, lib/tor-chats.ts). */
  torChat(identity: string): boolean {
    return this.find(identity)?.tor === true;
  }

  /**
   * Makes the chat with a contact appear offline to them, or not. Shown again, what was held
   * goes with the next message to them, whatever it is.
   */
  setHidden(identity: string, hide: boolean): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      await this.save(this.withContact({ ...contact, hide }));
    });
  }

  /**
   * Keeps that these messages of theirs came (`got`) or were read here, to tell them with the next
   * message that goes to them, whatever it is: while their chat appears offline, the next this chat
   * writes; else the next look's (`readDue`). What was read is always kept so first: told from
   * memory alone, a phone put away right after reading never said it.
   */
  hold(identity: string, kind: 'got' | 'read', held: string[]): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact || held.length === 0) return;
      const add = (list: string[]) => [...list.filter((tag) => !held.includes(tag)), ...held].slice(-MAX_HELD);
      // A message read needs no word that it came.
      const heldGot = kind === 'got' ? add(contact.heldGot) : contact.heldGot.filter((tag) => !held.includes(tag));
      const heldRead = kind === 'read' ? add(contact.heldRead) : contact.heldRead;
      await this.save(this.withContact({ ...contact, heldGot, heldRead }));
    });
  }

  /**
   * The contacts still to hear what was read here (`hold`), by identity: any message sealed for
   * them says it. Not those whose chat appears offline, who hear with what is next written to
   * them, nor a message request, which hears nothing.
   */
  readDue(): string[] {
    return this.data.contacts.filter((contact) => !contact.hide && !contact.request && contact.heldRead.length > 0).map((contact) => contact.identity);
  }

  /** What is kept as read for a contact and not told yet. */
  heldRead(identity: string): string[] {
    return [...(this.find(identity)?.heldRead ?? [])];
  }

  /** The phone numbers linked to contacts, by identity. */
  phones(): { identity: string; phone: string }[] {
    return this.data.contacts.filter((c) => c.phone).map(({ identity, phone }) => ({ identity, phone }));
  }

  /** Links a phone number to a contact, or unlinks it with ''. A number is linked to one contact only. */
  linkPhone(identity: string, phone: string): Promise<void> {
    return this.run(async () => {
      if (phone && !/^\+?\d{3,20}$/.test(phone)) throw new Error(t('That is not a phone number.'));
      if (!this.find(identity)) return;
      const contacts = this.data.contacts.map((c) =>
        c.identity === identity ? { ...c, phone } : phone && c.phone === phone ? { ...c, phone: '' } : c,
      );
      await this.save({ ...this.data, contacts });
    });
  }

  /** Accepts a message request: the chat with them is like any other from now on. */
  /**
   * Makes a contact just added from the answer to this chat's contact card (lib/sms-relay.ts) a
   * message request, as a contact link's first message is: anyone who has the card can answer it.
   * Called only for a contact the answer has just added.
   */
  asRequest(identity: string): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (contact && !contact.request) await this.save(this.withContact({ ...contact, request: true }));
    });
  }

  acceptRequest(identity: string): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (contact?.request) await this.save(this.withContact({ ...contact, request: false }));
    });
  }

  // Who hears that a contact was removed or deleted here (the space's groups let go of asks for
  // their contact link, lib/groups.ts contactRemoved).
  private readonly removedListeners = new Set<(identity: string) => void>();

  /** Has `listener` called, with the identity, after a contact was removed or deleted here. Returns how to stop. */
  onContactRemoved(listener: (identity: string) => void): () => void {
    this.removedListeners.add(listener);
    return () => this.removedListeners.delete(listener);
  }

  private contactRemoved(identity: string): void {
    this.removedListeners.forEach((listener) => {
      try {
        listener(identity);
      } catch {
        // A listener that fails does not hold the removal.
      }
    });
  }

  /**
   * Forgets a contact and every conversation with them. A message they send later is refused.
   * `held`: what a relay holds for later for them (lib/waiting.ts, heldFor), kept to drop.
   */
  removeContact(identity: string, { held = [] }: { held?: Undropped[] } = {}): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      const gone = contact?.avatar;
      // Their own queue is deleted on the relay (lib/contact-queues.ts).
      const queues = contact ? withGone(this.data.gone, minesOf(contact, 0)) : undefined;
      const copies = this.laterCopies(identity).map(({ id, relay, at }) => ({ id, relay, at }));
      await this.save({ ...this.data, contacts: this.data.contacts.filter((c) => c.identity !== identity), ...this.withUndropped([...held, ...copies]), ...this.withoutCopies(identity), ...(queues ? { gone: queues } : {}) });
      if (contact) this.contactRemoved(identity);
      if (gone?.kind === 'photo') await deletePhoto(gone.id);
    });
  }

  /**
   * Deletes a contact as `removeContact` does, and, in the same save, has this chat's own queue
   * move (`moveDue`, lib/queue-move.ts), so they can no longer write to it: a crash leaves neither
   * without the other. Not for a message request, never answered, which knows only the queue the
   * contact link names; but one blocked while that is the own queue (`setLinkOwn`), before the first
   * move. `block`: also keeps them blocked, so a first packet from them later is dropped, a request too. On a linked device the phone does both (Link.deleted): it holds the
   * queues contacts write to. `held`: what a relay holds for later for them (lib/waiting.ts,
   * heldFor), kept to drop in the same save, so it goes to them no more though the relay cannot be
   * asked now.
   */
  deleteContact(identity: string, { block = false, held = [] }: { block?: boolean; held?: Undropped[] } = {}): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact && !block) return;
      const through = this.link?.through === true;
      const now = Date.now();
      const blocked = block && !through ? [...this.blocked().filter((b) => b.identity !== identity), { identity, name: contact?.name ?? '', at: now }].slice(-MAX_BLOCKED) : null;
      // Said before the save, whose change of the contacts tells the phone of it.
      if (contact) this.link?.deleted?.(identity, block);
      // Their own queue is deleted on the relay at once (lib/contact-queues.ts); the own queue
      // moves only while it is the one they know.
      const gone = contact ? withGone(this.data.gone, minesOf(contact, 0)) : undefined;
      const copies = this.laterCopies(identity).map(({ id, relay, at }) => ({ id, relay, at }));
      await this.save({
        ...this.data,
        ...this.withoutCopies(identity),
        contacts: this.data.contacts.filter((c) => c.identity !== identity),
        ...(through || !contact || (contact.request && !(block && this.linkOwn)) || !this.knowsOwn(contact) ? {} : { moveDue: now }),
        ...(blocked ? { blocked } : {}),
        ...this.withUndropped([...held, ...copies]),
        ...(gone ? { gone } : {}),
      });
      if (blocked) this.link?.blockedChanged?.(blocked);
      // A move due now is made by the next look, which does not wait at the relay first.
      if (this.data.moveDue) lookNow();
      if (contact) this.contactRemoved(identity);
      if (contact?.avatar?.kind === 'photo') await deletePhoto(contact.avatar.id);
    });
  }

  /**
   * Sets how long new messages with a contact last, seconds (0 keeps them). Set after any setting
   * this phone has seen, whatever its clock says, so the other phone takes it.
   */
  setTimer(identity: string, timer: number): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      if (!isTimer(timer)) throw new Error(t('Not a time Erevos keeps messages for.'));
      await this.save(this.withContact({ ...contact, timer, timerAt: Math.max(Date.now(), contact.timerAt + 1) }));
    });
  }

  /**
   * Sets whether screenshots of a chat are kept out on both phones. Set after any setting this phone
   * has seen, whatever its clock says, so the other phone takes it, as the timer.
   */
  setShots(identity: string, on: boolean): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      await this.save(this.withContact(withShots(contact, { on, at: Math.max(Date.now(), (contact.shotsAt ?? 0) + 1) })));
    });
  }

  /** Gives a contact a name, kept with it and sealed. An empty one takes the name away. */
  rename(identity: string, name: string): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      await this.save(this.withContact({ ...contact, name: cleanName(name) }));
    });
  }

  /** Locks a chat with a PIN of its own, as kept (lock/chat-pin.ts); null takes it off. */
  setPin(identity: string, pin: ChatPin | null): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      const { pin: _was, ...rest } = contact;
      await this.save(this.withContact(pin ? { ...rest, pin } : rest));
    });
  }

  /** The PIN a chat opens with, as kept, or null when it has none. */
  pinOf(identity: string): ChatPin | null {
    return this.find(identity)?.pin ?? null;
  }

  /** Gives a chat notifications of its own (lock/chat-notify.ts); null gives it the app's again. */
  setNotify(identity: string, notify: ChatNotify | null): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      const { notify: _was, ...rest } = contact;
      const kept = checkedChatNotify(notify);
      await this.save(this.withContact(kept ? { ...rest, notify: kept } : rest));
    });
  }

  /** A chat's own notifications, or null when it has none. */
  notifyOf(identity: string): ChatNotify | null {
    return this.find(identity)?.notify ?? null;
  }

  /** Gives a chat its own look, kept with the contact and sealed; null gives it the space's again. */
  setLook(identity: string, look: Look | null): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      await this.save(this.withContact({ ...contact, look }));
    });
  }

  /** This account's identity key, hex. */
  identityHex(): string {
    return toHex(this.identity);
  }

  /** This account's signature of `message` under `context` (lib/core.ts accountSign): on the primary, of its device list. */
  sign(context: string, message: Uint8Array): Promise<Uint8Array> {
    return core.accountSign(this.account, context, message);
  }

  /** On a linked device: its own endpoint (docs/multi-device.md), or null while it has none. */
  endpoint(): Endpoint | null {
    return this.ownEndpoint;
  }

  /** On a linked device: makes it an endpoint of its own, in place of any it had, which spoke to no contact's endpoints yet. */
  makeEndpoint(): Promise<Endpoint> {
    return this.run(async () => {
      const account = await core.newAccount();
      const made = await endpointOf(account);
      const { unverified: _unverified, early: _early, ...rest } = this.data;
      await this.save({ ...rest, contacts: this.data.endpoint ? this.data.contacts.map(unspoken) : this.data.contacts, endpoint: toBase64(account) });
      await this.dropCopies(() => true);
      this.ownEndpoint = made;
      return made;
    });
  }

  /**
   * Lets go of this device's endpoint, of what it checked of its account, and of what it started
   * as that endpoint with contacts' accounts and their endpoints: unlinked, or a linked device's
   * backup put back elsewhere. Nothing on a phone that has no endpoint.
   */
  dropEndpoint(): Promise<void> {
    return this.run(async () => {
      this.ownEndpoint = null;
      if (this.data.endpoint === undefined && this.data.own === undefined) return;
      const { endpoint: _endpoint, own: _own, unverified: _unverified, early: _early, ...rest } = this.data;
      await this.save({ ...rest, contacts: this.data.endpoint ? this.data.contacts.map(unspoken) : this.data.contacts });
      await this.dropCopies(() => true);
    });
  }

  /**
   * On a linked device: starts, as its endpoint, a conversation with another of the account's
   * devices from that one's bundle (lib/siblings.ts), or null with no endpoint. Not in the chat's
   * turn, as the links keep that conversation, and moves nothing the chat keeps.
   */
  startAsEndpoint(bundle: Uint8Array, plaintext: Uint8Array): Promise<core.Sealed | null> {
    return this.data.endpoint ? core.startConversation(fromBase64(this.data.endpoint), bundle, plaintext) : Promise.resolve(null);
  }

  /** On a linked device: opens, as its endpoint, a first packet another of the account's devices started a conversation with, as `startAsEndpoint`. Throws for one that is not. */
  acceptAsEndpoint(packet: Uint8Array): Promise<core.Opened> {
    return this.data.endpoint ? core.acceptConversation(fromBase64(this.data.endpoint), packet) : Promise.reject(new Error('no endpoint'));
  }

  /** On a linked device: its account as the phone said it, and the account's device list as last checked, or null. */
  own(): Own | null {
    return this.data.own ?? null;
  }

  /** On a linked device: keeps its account and that account's list, unless the list kept is that account's and no older. Says whether it did. */
  /** On a linked device: the account's word for its bundle and this device's pass, from the phone with the list it holds (S5). */
  keepPass(identity: string, ab: string, ap: Pass): Promise<void> {
    return this.run(async () => {
      const held = this.data.own;
      if (held?.identity !== identity) return;
      await this.save({ ...this.data, own: { ...held, ab, ap } });
    });
  }

  keepOwn(own: Own): Promise<boolean> {
    return this.run(async () => {
      const held = this.data.own;
      if (held?.identity === own.identity && (held.list?.n ?? 0) >= (own.list?.n ?? 0)) return false;
      await this.save({ ...this.data, own });
      return true;
    });
  }

  /**
   * On the primary: starts, as the account, a conversation with one of its devices' endpoints from
   * that endpoint's bundle, saying `plaintext` first: a phone a backup was put back on, asking that
   * device to link again (lib/devices.ts askAgain). Not in the chat's turn, as the links keep that
   * conversation, and moves nothing the chat keeps; its keys are its own, never a contact's.
   */
  startAsAccount(bundle: Uint8Array, plaintext: Uint8Array): Promise<core.Sealed> {
    return core.startConversation(this.account, bundle, plaintext);
  }

  /** On the primary: what a backup carries to ask its linked devices to link again (lock/e2e-data.ts Relinks), or null. */
  relinks(): Relinks | null {
    return this.data.relinks ?? null;
  }

  /** On the primary: keeps what a backup carries to ask its linked devices to link again, or none. */
  keepRelinks(relinks: Relinks | null): Promise<void> {
    return this.run(async () => {
      const { relinks: _was, ...rest } = this.data;
      await this.save(relinks && relinks.now.length + relinks.back.length > 0 ? { ...rest, relinks } : rest);
    });
  }

  /** On the primary: the device list as last signed, or null. */
  signedList(): OwnList | null {
    return this.data.list ?? null;
  }

  /** On the primary: keeps the device list just signed, unless one kept is as late, with the backup put back before it was. */
  keepList(list: OwnList): Promise<void> {
    return this.run(async () => {
      const held = this.data.list;
      if ((held?.n ?? 0) >= list.n) return;
      const { restore: _restore, qWas: _was, ...signed } = list;
      const qWas = held?.qWas;
      await this.save({ ...this.data, list: { ...signed, rAt: laterThan(held?.rAt), ...(this.data.restore ? { restore: this.data.restore } : {}), ...(qWas ? { qWas } : {}) } });
    });
  }

  /**
   * On the primary put back from a backup: the newest of this account's lists a contact it accepted
   * says they hold (`dv`), 0 for none, which may be later than the one kept, signed after the backup
   * was made. On a phone no backup was put back on none can be, so there it is 0, and what contacts
   * say never moves the `n` of the next list. One a message request says is left out, and so is one
   * said to be from more than a day after the backup was put back, by this clock then (`heldAtMost`):
   * no list this account signed.
   */
  newestHeld(): number {
    const most = this.heldAtMost();
    return this.data.contacts.reduce((n, c) => (!c.request && c.dv !== undefined && c.dv <= most ? Math.max(n, c.dv) : n), 0);
  }

  /** On the primary put back from a backup: the latest a list of this account a contact holds can be (`newestHeld`); 0 on one never put back. */
  heldAtMost(): number {
    return this.data.putBack ? this.data.putBack + LIST_AGAIN : 0;
  }

  /** On the primary: whether a backup was put back since the device list kept was signed. */
  restoredSince(): boolean {
    return !!this.data.list && !!this.data.restore && this.data.list.restore !== this.data.restore;
  }

  /**
   * On a linked device: what the keys contacts seal what they send its endpoint with for the relay
   * are drawn from, each contact's its own (lib/sealed-packet.ts entryKey), which the phone gives
   * each with where it reads; drawn from the endpoint, '' without one. Only the phone is told it.
   */
  endpointKey(): string {
    return this.data.endpoint ? toBase64Url(ownPacketKey(fromBase64(this.data.endpoint), 'endpoint')) : '';
  }

  /** About when a contact's account signed the list of its devices this chat holds (its `n`, ms), or 0 while it holds none. */
  devicesChanged(identity: string): number {
    return this.find(identity)?.list?.n ?? 0;
  }

  /** A contact as kept, conversations and all, or null. */
  record(identity: string): Contact | null {
    const contact = this.find(identity);
    return contact ? { ...contact } : null;
  }

  /**
   * Takes a contact out of this chat, conversations and all, to be put in another (moving a chat
   * into hidden chats): what it holds (its photo) stays, as it goes with it. Null if there is none.
   */
  takeOut(identity: string): Promise<Contact | null> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) return null;
      // Their own queue here is read through its grace, as they write to it until told where the
      // other chat reads, then deleted (lib/contact-queues.ts).
      const gone = withGone(this.data.gone, minesOf(contact, Date.now() + GRACE));
      await this.save({ ...this.data, contacts: this.data.contacts.filter((c) => c.identity !== identity), ...(gone ? { gone } : {}) });
      return contact;
    });
  }

  /**
   * Puts in a contact taken out of another chat, in place of any with the same key. What was kept of
   * their devices goes: they know this chat by the other's identity, and it says nothing of devices
   * to them (`partOf`); back where it was first, known by its own again, it and they give each other
   * their lists anew once each says it holds none.
   */
  putIn(contact: Contact, said = 0): Promise<void> {
    return this.run(async () => {
      // Its own queue was the other chat's, and what they knew of its own queue is nothing to this one's.
      const { dv: _dv, list: _list, endpoints: _endpoints, direct: _direct, listSent: _sent, listGiven: _given, took: _took, told: _told, onNew: _onNew, qaFloor: _floor, qaBase: _base, ringTell: _ring, mine: _mine, knows: _knows, ...plain } = contact;
      // Back where it was first: they know this chat by its own identity again.
      const own = contact.ownIdentity === this.identityHex() ? { ownIdentity: '' } : {};
      // When they were told the other's queue, and heard on it, is nothing to this chat's own; what
      // the other said them last (`said`, its `qa`) is what this chat says later than, by as much as
      // its own moves on from now (Contact.qaFloor, qaBase).
      await this.save(this.withContact({ ...plain, ...own, ...(said > 0 ? { qaFloor: said, ...(this.ownAge > 0 ? { qaBase: this.ownAge } : {}) } : {}) }));
    });
  }

  /** Gives a contact a picture of this chat's choosing, kept with it and sealed; null gives back the one drawn from their key. */
  setAvatar(identity: string, avatar: Avatar | null): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      await this.save(this.withContact({ ...contact, avatar: avatar && checkedAvatar(avatar) }));
      // The photo it had, if another took its place.
      if (contact.avatar?.kind === 'photo' && (avatar?.kind !== 'photo' || avatar.id !== contact.avatar.id)) await deletePhoto(contact.avatar.id);
    });
  }

  /** The 60-digit number both phones show for a contact: when they match, no one is in between. */
  safetyNumber(identity: string): Promise<string> {
    const own = this.find(identity)?.ownIdentity;
    return core.safetyNumber(own ? fromHex(own) : this.identity, fromHex(identity));
  }

  /** The QR code this chat shows a contact, for their phone to check its key by (lib/verify-code.ts). */
  verifyCode(identity: string): string {
    const contact = this.find(identity);
    if (!contact) throw new Error(t('No such contact.'));
    return verifyCode(contact.ownIdentity || this.identityHex(), identity);
  }

  /** When this phone checked a contact's key by their QR code, ms, or 0 while it has not. */
  verifiedAt(identity: string): number {
    return this.find(identity)?.verified ?? 0;
  }

  /**
   * Checks the text of a QR code their phone showed (verifyCode on their side) against the keys held
   * here, and marks the contact checked when it matches. Nothing is sent: their phone marks this one
   * by the code this one shows it.
   */
  checkVerify(identity: string, text: string, now = Date.now()): Promise<VerifyResult> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact) throw new Error(t('No such contact.'));
      const result = checkVerifyCode(text, contact.ownIdentity || this.identityHex(), identity);
      if (result === 'match') await this.save(this.withContact({ ...contact, verified: now }));
      return result;
    });
  }

  /** The introductions made here or asked of this chat (lib/intros.ts), those still kept. */
  intros(now = Date.now()): IntroKept[] {
    return (this.data.intros ?? []).filter((i) => now - i.at < INTRO_LASTS);
  }

  /** Changes the introductions kept, by what `change` makes of them, in the chat's turn: what it returns is kept. */
  changeIntros<T>(change: (now: IntroKept[]) => Promise<{ next: IntroKept[]; out: T }> | { next: IntroKept[]; out: T }): Promise<T> {
    return this.run(async () => {
      const { next, out } = await change(this.intros());
      const { intros: _intros, ...rest } = this.data;
      const kept = next.slice(-MAX_INTROS);
      await this.save(kept.length > 0 ? { ...rest, intros: kept } : rest);
      return out;
    });
  }

  /** Pieces of backup passwords kept here for contacts, or given to them (lib/pieces-kept.ts). */
  pieces(): PiecesKept {
    return this.data.pieces ?? {};
  }

  /** Changes the pieces kept, by what `change` makes of them, in the chat's turn. */
  changePieces<T>(change: (now: PiecesKept) => { next: PiecesKept; out: T }): Promise<T> {
    return this.run(async () => {
      const { next, out } = change(this.pieces());
      const { pieces: _pieces, ...rest } = this.data;
      const kept: PiecesKept = {
        ...(next.out?.length ? { out: next.out.slice(-MAX_PIECES) } : {}),
        ...(next.held?.length ? { held: next.held.slice(-MAX_PIECES) } : {}),
        ...(next.given?.length ? { given: next.given.slice(-MAX_PIECES) } : {}),
        ...(next.back?.length ? { back: next.back.slice(-MAX_PIECES) } : {}),
      };
      await this.save(Object.keys(kept).length > 0 ? { ...rest, pieces: kept } : rest);
      return out;
    });
  }

  /** Takes the mark off: the contact is no longer shown as checked. */
  unverify(identity: string): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact?.verified) return;
      const { verified: _verified, ...rest } = contact;
      await this.save(this.withContact(rest));
    });
  }

  /** On the primary: this account's X25519 identity saying its bundle's signing key is its own (lib/core.ts accountBind), base64url, for its linked devices: made once, '' with a core that cannot. */
  binding(): Promise<string> {
    return this.run(async () => {
      if (this.link?.through || this.data.own || !core.canBind()) return '';
      if (this.data.bound) return this.data.bound;
      const bound = toBase64Url(await core.accountBind(this.account));
      await this.save({ ...this.data, bound });
      return bound;
    });
  }

  // On a linked device: a conversation with someone new, started by this device's endpoint with
  // their link's bundle, whose first message says whom it is for (`to`), the account it speaks for
  // (`acct`), that account's bundle (`ak`) with its X25519 identity's word that it is its own
  // (`ab`), the list that bundle signed, which names this endpoint, where this device reads (`from`)
  // and this device's pass from its account (`ap`). Their Erevos takes it only with all of that holding
  // (acceptBound). Null when this device cannot: no word from the phone yet, no list, no endpoint.
  // What it gives the contact to keep: this device's own way to them, its first packet waiting, and
  // that they hold the list it gave.
  private async startBound(code: { senderHex: string; relayUrl?: string; relayKey?: string }, bundle: Uint8Array, identity: string, from: string, at: Where): Promise<Pick<Contact, 'direct' | 'dv' | 'calls'> | null> {
    const own = this.data.own;
    const endpoint = this.data.endpoint;
    // A pass close to running out is not used: someone new takes it a while after it went.
    const pass = own?.ap ? readPass(own.ap) : null;
    if (!own?.ab || !own.ap || !pass || pass.u - Date.now() < PASS_MARGIN || pass.i !== this.ownEndpoint?.id || !own.list || !endpoint || !this.takesPart || !core.canBind()) return null;
    const packetKey = this.ownPacketKey({ identity, packetKey: '' });
    const opening: Message = {
      ...at,
      ...this.fromNow(from),
      spare: null,
      text: '',
      tag: '',
      erase: null,
      timer: 0,
      timerAt: 0,
      lasts: 0,
      got: [],
      read: [],
      voice: null,
      file: null,
      ...SAYS_NOTHING,
      call: null,
      group: null,
      pk: packetKey,
      dv: 0,
      cl: 1,
      to: identity,
      acct: own.identity,
      ak: own.bundle,
      ab: own.ab,
      dl: { b: own.list.b, s: own.list.s },
      ap: own.ap,
    };
    const started = await core.startConversation(fromBase64(endpoint), bundle, encodeMessage(opening));
    const direct: Way = {
      id: identity,
      bundle: '',
      sender: code.senderHex,
      ...whereOf(code),
      spare: null,
      conversations: [toBase64(started.conversation)],
      first: toBase64(started.packet),
      seen: [],
      sealTo: '',
      sealsIn: false,
    };
    return { direct, dv: own.list.n, calls: true };
  }

  /** Throws BlockedContactError when the contact of a link is blocked here, as addContact would, before anything is made to add them: a queue, or a place lent on their relay. */
  async refuseBlocked(code: { key: string }): Promise<void> {
    if (!code.key) return;
    const identity = await core.bundleIdentity(fromBase64Url(code.key)).then(toHex, () => '');
    const blocked = this.blocked().find((b) => b.identity === identity);
    if (blocked) throw new BlockedContactError(identity, blocked.name);
  }

  /**
   * Adds the contact of a link and starts a conversation with them. `from` is this chat's relay
   * sender id. Afterwards the first packet waits for the relay (see `pending`). Throws if the
   * link has no key, or a key whose signatures do not hold, or is this chat's own. `hi`: the
   * secret of their invite (lib/welcome.ts), said back in the first message, so they take this
   * chat as a contact at once.
   */
  addContact(
    code: { senderHex: string; key: string; relayUrl?: string; relayKey?: string; spare?: SpareSaid; nostr?: { k: string; r: string[] }; d?: true },
    from: string,
    at: Where = { relay: '', relayKey: '' },
    hi = '',
  ): Promise<{ identity: string; added: boolean }> {
    return this.run(async () => {
      if (!code.key) throw new NoKeyError();
      const bundle = fromBase64Url(code.key);
      const identity = toHex(await core.bundleIdentity(bundle));
      if (identity === toHex(this.identity)) throw new OwnCodeError();
      // Someone blocked here is added only once unblocked: a link, an SMS invite's answer or a group gives them no way back.
      const blocked = this.blocked().find((b) => b.identity === identity);
      if (blocked) throw new BlockedContactError(identity, blocked.name);
      const known = this.find(identity);
      // On a linked device the primary adds them and starts the conversation; the chat keeps them
      // meanwhile. Someone new whose link says their Erevos takes it (`d`) this device starts a
      // conversation with itself too, as its endpoint, with the account's word for it, and writes to
      // them itself from then on, the phone off too (startBound).
      if (this.link?.through) {
        const kept = await this.link.add(code, identity, known);
        const bound = !known && code.d ? await this.startBound(code, bundle, identity, from, at).catch(() => null) : null;
        await this.save(this.withContact(bound ? { ...kept, ...bound } : kept));
        return { identity, added: !known };
      }
      if (known) {
        // Already talking: only where to reach them changes, if the link says and they never said
        // when their queue was made (`qa`), as an Erevos before: a link of theirs names where they
        // are asked to talk, not where they read. Adding their link accepts a request.
        const where = code.senderHex && known.qa === undefined ? { ...whereOf(code), sender: code.senderHex, spare: spareOf(code) } : {};
        // Where their link reads on Nostr, while they said nothing of it themselves.
        const there = code.nostr && !known.nostrTo ? { nostrTo: { k: code.nostr.k, r: code.nostr.r } } : {};
        await this.save(this.withContact({ ...known, ...where, ...there, request: false }));
        return { identity, added: false };
      }
      const packetKey = this.ownPacketKey({ identity, packetKey: this.find(identity)?.packetKey ?? '' });
      // A queue of their own, made ahead, said in the first message already (lib/contact-queues.ts):
      // then they never learn the own queue. Else the first message says that one.
      const mine = from ? this.takeReady(undefined) : null;
      const says = mine ? { from: mine.s, qa: mine.qa } : this.fromNow(from);
      const knows = mine || !from ? { knows: 0 } : this.ownAge > 0 ? { knows: this.ownAge } : {};
      // Where this chat reads on Nostr, said in the first message already, with a key of its own for
      // them: so they can answer there when no relay is between the two (lib/nostr-chats.ts).
      const relays = nostrRelays();
      const nostr = relays && !this.data.own ? await newNostrKey() : null;
      const ns = nostr && relays ? { k: nostr.p, r: relays, ...(this.bells ? { b: true as const } : {}) } : undefined;
      const started = await core.startConversation(
        this.account,
        bundle,
        encodeMessage({ ...at, spare: from ? this.ownSpare : null, text: '', tag: '', erase: null, timer: 0, timerAt: 0, lasts: 0, got: [], read: [], voice: null, file: null, ...SAYS_NOTHING, call: null, group: null, pk: packetKey, ...this.saysDevices(undefined), ...says, ...(isHi(hi) ? { hi } : {}), ...(ns ? { ns } : {}), fa: firstAt() }),
      );
      const told = nostr ? { nostr, nostrSaid: this.nostrSaid({ nostr } as Contact) } : {};
      await this.save(
        this.withContact({
          identity,
          sender: code.senderHex,
          ...whereOf(code),
          spare: spareOf(code),
          conversations: [toBase64(started.conversation)],
          first: toBase64(started.packet),
          name: '',
          timer: 0,
          timerAt: 0,
          request: false,
          look: this.find(identity)?.look ?? null,
          avatar: this.find(identity)?.avatar ?? null,
          ownIdentity: this.find(identity)?.ownIdentity ?? '',
          hide: false,
          heldGot: [],
          heldRead: [],
          phone: '',
          seen: this.find(identity)?.seen ?? [],
          packetKey,
          sealTo: this.find(identity)?.sealTo ?? '',
          sealsIn: false,
          ...told,
          ...(mine ? { mine } : {}),
          ...knows,
          // Their link's place on Nostr: where the first message goes when no relay is between the two.
          ...(code.nostr ? { nostrTo: { k: code.nostr.k, r: code.nostr.r } } : {}),
        }),
      );
      if (nostr) nostrKeysChanged();
      return { identity, added: true };
    });
  }

  /**
   * Seals a message for a contact, or, with `erase` and no text, asks them to delete messages, or
   * with `call` and no text, says something about a call.
   * A text with `lasts` (seconds) disappears that long after it is read, whatever the chat's
   * timer. `got` and `read` tell them which of their messages came, and were read, here. With no
   * text, it tells them only those, and the chat's timer. `from` is this chat's relay sender id.
   * Returns where to send it, the packet, the message's tag and how long it lasts once read
   * (seconds), after the first packet of the conversation if the relay has not taken that yet.
   * Send that one first, then call `firstSent`. Where to send it has no sender id while the
   * contact has said no relay queue: then it can only go to their phone nearby (lib/nearby.ts).
   * The copies for the endpoints of their account (`copies`) are sealed once that went, however it
   * went (`copiesAfter`), and then wait for the relay. On a linked device it may be sealed for the account's phone,
   * which passes it on (`through`), or for the contact, which this device writes to itself. For a
   * chat that goes only through Tor, the name of its own circuits (`torChat`), which it goes on to either.
   */
  seal(
    identity: string,
    text: string,
    from: string,
    { erase = null, lasts = 0, got = [], read = [], at = { relay: '', relayKey: '' }, on = 0, ask = false, call = null, group = null, tag: given, quiet = false, due = 0, re = '', react = null, more = {}, keys = false, rf, leaving = false }: Extra = {},
  ): Promise<{ sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; packet: Uint8Array; tag: string; timer: number; copies: number; through: boolean; nostr: NostrTo | null; torChat?: string }> {
    return this.run(async () => {
      let contact = this.find(identity);
      if (!contact || contact.conversations.length === 0) throw new Error(t('No conversation with this contact.'));
      const tag = text ? (isTag(given) ? given : newTag()) : '';
      if (!isTimer(lasts)) throw new Error(t('Not a time Erevos keeps messages for.'));
      const { timer, timerAt } = contact;
      const once = text ? lasts : 0;
      const signal = text ? null : call;
      const { ns: tellsNostr = false, nm: tellsName = false, ...keyed } = (!text && keys ? this.keysFor(contact) : null) ?? {};
      // The key this chat reads their texts on Nostr with, made the first time it is told them.
      if (tellsNostr && nostrRelays() && !contact.nostr) {
        contact = { ...contact, nostr: await newNostrKey() };
        await this.save(this.withContact(contact));
        nostrKeysChanged();
      }
      const ns = tellsNostr ? this.nostrTold(contact) : undefined;
      const list = keyed.dl && this.data.list ? { n: this.data.list.n, rAt: this.data.list.rAt ?? 0 } : null;
      const message = {
        from,
        ...at,
        text,
        tag,
        erase: text ? null : erase,
        timer,
        timerAt,
        lasts: once,
        got: tags(got),
        read: tags(read),
        voice: null,
        file: null,
        on: isOn(on) ? on : 0,
        onAt: 0,
        ask,
        call: signal,
        group: text ? null : group,
        quiet: !!text && quiet,
        due: text ? due : 0,
        re: text && isTag(re) ? re : '',
        react: text ? null : react,
        more: toCarry(more, !!text),
        ...keyed,
        ...(ns !== undefined ? { ns } : {}),
        ...shotsSaid(contact),
        ...(tellsName ? { nm: this.myName() } : {}),
        rf,
      };
      // Writing, reacting, pinning or calling accepts a request; telling them only what came or was read never does.
      const sealed = await this.sealFor(contact, [message], !!text || !!message.react || acts(message.more) || signal?.kind === 'offer', leaving);
      if (list) this.listSealed.set(identity, { ...list, at: Date.now() });
      if (tellsNostr) this.nostrSealed.set(identity, this.nostrSaid(contact));
      if (tellsName) this.nameSealed.set(identity, this.myName());
      const { packets: [packet], sender, relay, relayKey, spare, first, copies, through, torChat } = sealed;
      // Words go through Nostr when they said they read there, and this chat does too (lib/nostr.ts):
      // not after a first packet the relay has still to take, nor what is sent for later, which the
      // relay holds, nor from a linked device, nor what it seals for the account's phone to pass on.
      // With no relay between the two, as this chat has no queue (`from`) or they said none, all of
      // it goes there, the first packet with it (lib/nostr-chats.ts nostrOnlyWay).
      const nostr = this.nostrWay(contact, from, sender, first, [packet], through, !!text, due);
      return { sender, relay, relayKey, spare, first, packet, tag, timer: once || timer, copies, through, nostr, ...(torChat ? { torChat } : {}) };
    });
  }

  // Where sealed packets go through Nostr, when they do (lib/nostr-chats.ts): the contact reads
  // there and this chat does too, nothing is held for the relay (a first packet it has still to take,
  // what is sent for later), and it is not from a linked device or for the account's phone to pass
  // on. With no relay between the two, as this chat has no queue (`from`) or they said none, all of
  // it goes there, the first packet with it. `words`: whether these are texts, which go there
  // when a relay is between only should the relays not take them (orNostr); photos and voice
  // messages go too, as the contact's phone puts them together.
  private nostrWay(contact: Contact, from: string, sender: string, first: Uint8Array | null, packets: Uint8Array[], through: boolean, words: boolean, due: number): NostrTo | null {
    const only = !from || !sender;
    const fits = only ? nostrWraps(packets, first) !== null : words && !due && !first && nostrWraps(packets) !== null;
    return fits && !through && !this.data.own && nostrRelays() ? (contact.nostrTo ?? null) : null;
  }

  /**
   * Seals a voice message for a contact: its sound (`audio`, `ms` long) in parts, one packet
   * each, to send in order, whose id is drawn from its tag (lib/voice.ts voiceIdOf). Otherwise as
   * `seal`.
   */
  sealVoice(
    identity: string,
    audio: Uint8Array,
    ms: number,
    from: string,
    { lasts = 0, at = { relay: '', relayKey: '' }, talk = false, tag: given, due = 0, re = '', forwarded = false }: { lasts?: number; at?: Where; talk?: boolean; tag?: string; due?: number; re?: string; forwarded?: boolean } = {},
  ): Promise<{ sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; packets: Uint8Array[]; tag: string; timer: number; copies: number; through: boolean; nostr: NostrTo | null; torChat?: string }> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact || contact.conversations.length === 0) throw new Error(t('No conversation with this contact.'));
      if (!isTimer(lasts)) throw new Error(t('Not a time Erevos keeps messages for.'));
      const tag = isTag(given) ? given : newTag();
      const { timer, timerAt } = contact;
      const messages = splitVoice(audio, ms, talk, voiceIdOf(tag)).map((voice) => ({
        from,
        ...at,
        text: '',
        tag,
        erase: null,
        timer,
        timerAt,
        lasts,
        got: [],
        read: [],
        voice,
        file: null,
        ...shotsSaid(contact),
        ...SAYS_NOTHING, call: null, group: null,
        due,
        re: isTag(re) ? re : '',
        more: forwarded ? { forwarded: true as const } : {},
      }));
      const { packets, sender, relay, relayKey, spare, first, copies, through, torChat } = await this.sealFor(contact, messages, true);
      // Through Nostr only with no relay between the two: with one, a voice message is too large
      // to be kept for the relay's backup (NOSTR_KEEP_MOST), so it goes through the relay.
      const nostr = this.nostrWay(contact, from, sender, first, packets, through, false, due);
      return { sender, relay, relayKey, spare, first, packets, tag, timer: lasts || timer, copies, through, nostr, ...(torChat ? { torChat } : {}) };
    });
  }

  /**
   * Seals a photo or file for a contact: where it is on the relay and its key (`offer`, from
   * lib/attachments.ts). Otherwise as `seal`.
   */
  sealFile(
    identity: string,
    offer: FileOffer,
    from: string,
    { lasts = 0, at = { relay: '', relayKey: '' }, tag: given, due = 0, re = '', forwarded = false }: { lasts?: number; at?: Where; tag?: string; due?: number; re?: string; forwarded?: boolean } = {},
  ): Promise<{ sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; packet: Uint8Array; tag: string; timer: number; copies: number; through: boolean; nostr: NostrTo | null; torChat?: string }> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact || contact.conversations.length === 0) throw new Error(t('No conversation with this contact.'));
      if (!isTimer(lasts)) throw new Error(t('Not a time Erevos keeps messages for.'));
      const tag = isTag(given) ? given : newTag();
      const { timer, timerAt } = contact;
      const message = { from, ...at, text: '', tag, erase: null, timer, timerAt, lasts, got: [], read: [], voice: null, file: offer, ...shotsSaid(contact), ...SAYS_NOTHING, call: null, group: null, due, re: isTag(re) ? re : '', more: forwarded ? { forwarded: true as const } : {} };
      const { packets: [packet], sender, relay, relayKey, spare, first, copies, through, torChat } = await this.sealFor(contact, [message], true);
      // Pieces of a file that go through Nostr tell where they are in the same way (lib/nostr-files-own.ts).
      const nostr = this.nostrWay(contact, from, sender, first, [packet], through, offer.via !== undefined, due);
      return { sender, relay, relayKey, spare, first, packet, tag, timer: lasts || timer, copies, through, nostr, ...(torChat ? { torChat } : {}) };
    });
  }

  /**
   * On the primary: seals for a contact a message one of the account's linked devices wrote
   * (lib/devices.ts), as it wrote it, but saying where this chat's queue is (`from`, `at`), and with
   * the chat's timer if the message's was set later. Returns where to send it, after the first
   * packet of the conversation if the relay has not taken that yet.
   */
  sealAs(
    identity: string,
    plaintext: Uint8Array,
    from: string,
    at: Where,
  ): Promise<{ sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array | null; packet: Uint8Array; copies: number; through: boolean; torChat?: string }> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact || contact.conversations.length === 0) throw new Error(t('No conversation with this contact.'));
      // What only this chat says of the account and its devices, it says itself.
      const { ak: _ak, dl: _dl, acct: _acct, to: _to, dv: _dv, ...message } = decodeMessage(plaintext);
      const { timer, timerAt } = timerOf(message, contact);
      // Writing, reacting or calling accepts a request, as from this phone.
      const writes = !!message.text || !!message.voice || !!message.file || !!message.react || acts(message.more ?? {}) || message.call?.kind === 'offer';
      const { packets: [packet], sender, relay, relayKey, spare, first, copies, through, torChat } = await this.sealFor({ ...contact, timer, timerAt }, [{ ...message, from, ...at, timer, timerAt }], writes);
      return { sender, relay, relayKey, spare, first, packet, copies, through, ...(torChat ? { torChat } : {}) };
    });
  }

  // What this chat says in every message of the devices of a contact's account: which list of it
  // it holds (`dv`, 0 for none); to one it does not take part with (`partOf`), nothing.
  private saysDevices(contact: Contact | undefined): { dv?: number; cl?: 1 } {
    return this.partOf(contact) ? { dv: contact?.list?.n ?? 0, cl: 1 } : {};
  }

  // Whether this chat takes part with a contact (`takesPart`): with one made here, as a new one
  // (undefined), and on a linked device with every contact of its account; not with one who knows it
  // by another identity, a chat moved here from the space's or from hidden chats, as no way to their
  // endpoints could start from that identity, which is not this chat's (docs/multi-device.md).
  private partOf(contact: Pick<Contact, 'ownIdentity'> | undefined): boolean {
    return this.takesPart && (!contact?.ownIdentity || this.link?.through === true || contact.ownIdentity === this.data.own?.identity);
  }

  // Whether a list's entry names this chat's own account (on a linked device, its account too), or
  // a contact's, or the one a contact knows this chat by: no endpoint of anyone's, but someone a
  // list would have this chat write to as though it were (docs/threat-model.md).
  private isAccount(id: string): boolean {
    return id === this.identityHex() || id === this.data.own?.identity || this.data.contacts.some((c) => c.identity === id || c.ownIdentity === id);
  }

  // Seals messages in turn in the conversation to send in, and keeps it moved past them. Writing
  // to them (`writes`) accepts their request, if they made one, and says this phone is open for a
  // while. A chat that appears offline says nothing else of being open; what it held goes with
  // what it writes, and once it shows again with whatever goes next. On a linked device each goes
  // sealed for the primary instead, which seals it for the contact, unless this device writes to
  // them itself (`isDirect`): then it goes in this device's own way to their account.
  //
  // A contact whose account lists devices is copied each message for each endpoint their list
  // names, devices and the places that fill it alike, that it goes to (lib/endpoints.ts copiedAs):
  // the whole message, or what it says of what came from that one and of what was read. The copies
  // wait under the number the sealing gives (`copiesAfter`) until what went to the account went, not
  // sealed yet; only then are they sealed (`copiesGo`), each in a conversation with that endpoint of
  // its own, started then if there is none, whose first message says whose endpoint it is for
  // (`to`), and from a linked device the account it speaks for (`acct`), and wait for the relay
  // (`copies`). So what never goes moves none of those conversations on, and each endpoint's copies
  // are sealed in the order they go. One whose first packet the relay took, but which has not
  // answered in its conversation a day later, may never have had it: the next copy starts
  // another (`Way.again`, `startsAgain`), and so on until it answers, two days later, then four,
  // then every eight, those it has kept to open in. What went to an endpoint goes there once
  // (`copied`): a message sealed again, as one tried again, is copied there no more. Once
  // MAX_COPIES_EACH wait for an endpoint nothing new is copied to it, but a voice message goes
  // on to its last part, so one message is copied whole or not at all. A copy says nothing of
  // being open, nor asks. Each tells the relay what it carries as what went to the account does,
  // to a device and a place that fills the list alike: the last packet of a message someone
  // reads is one (`mark`), a way's first packet and all else quiet. `leaving`: says nothing of
  // devices, and starts nothing with an endpoint.
  private async sealFor(contact: Contact, messages: Message[], writes: boolean, leaving = false): Promise<Sealed> {
    const now = Date.now();
    // Those too old to go go first, so they leave room.
    await this.dropStale(now);
    // One about to be written to takes a queue of their own made ahead (lib/contact-queues.ts),
    // kept by this sealing's save: what goes now says it already.
    const given = this.takeReady(contact, now);
    if (given) contact = { ...contact, mine: given, knows: contact.knows ?? this.ownAge };
    const release = writes || !contact.hide;
    const direct = this.isDirect(contact, messages) ? contact.direct! : null;
    const through = this.link?.through === true && !direct;
    const packetKey = this.ownPacketKey(contact);
    const said: Message[] = messages.map((message, i) => {
      const spare = message.from ? this.ownSpare : null;
      const on = writes ? Math.max(message.on, ONLINE_AFTER_WRITE) : contact.hide ? 0 : message.on;
      const first = i === 0 && release;
      return {
        ...message,
        spare,
        // Where this chat reads now, and when that queue was made: what a linked device wrote says this chat's.
        ...this.fromNow(message.from, contact),
        on,
        onAt: on > 0 ? now : 0,
        ask: message.ask && !contact.hide,
        got: first ? tags([...message.got, ...contact.heldGot.filter((tag) => !contact.heldRead.includes(tag))]) : message.got,
        read: first ? tags([...message.read, ...contact.heldRead]) : message.read,
        ...(leaving ? {} : this.saysDevices(contact)),
        ...this.saysSeen(contact),
        // When it is sealed, or, written on a linked device, when the device sealed it for the phone.
        ...(message.tag ? { st: message.st && message.st <= now ? message.st : now } : {}),
      };
    });
    // A linked device's chats restored from its backup have no conversation to write in (lib/devices.ts, copied).
    if (!this.link?.through && !contact.conversations[0]) throw new Error(t('These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.'));
    // What goes to each endpoint of theirs with a queue and room for it, and which messages' `got`
    // went to the one they came from (`routed`, by message and endpoint): their account is not told those.
    const cameOf = (tag: string) => this.cameFrom.get(`${contact.identity}|${tag}`) ?? '';
    const waiting = this.waitingFor(contact.identity);
    const copying = this.partOf(contact) && contact.dv !== undefined && (!this.link?.through || !!direct);
    const ways: Held['ways'] = [];
    const routed = new Set<string>();
    let count = 0;
    for (const way of copying ? (contact.endpoints ?? []) : []) {
      if (!way.sender || this.isAccount(way.id) || (leaving && way.conversations.length === 0)) continue;
      const waits = waiting.get(way.id) ?? 0;
      const items = this.toCopy(contact.identity, way, said, cameOf, waits >= MAX_COPIES_EACH || (waits > 0 && this.isRefused(contact.identity, way)), routed, packetKey, contact.calls === true);
      if (items.length === 0) continue;
      // And its first packet, should one start, or the outbox have lost it (sealCopies).
      const starts = way.conversations.length === 0 || (!leaving && startsAgain(way, now)) || (!!way.first && !this.fanout.copies.some((c) => c.c === contact.identity && c.w === way.id && c.first));
      count += items.length + (starts ? 1 : 0);
      ways.push({ w: way.id, items });
    }
    if (count > 0 && !(await this.roomFor(contact.identity, count))) {
      ways.length = 0;
      routed.clear();
    }
    // What goes to their account, sealed in the conversation it goes in.
    const main = said.map((m, i) => ({ ...m, got: m.got.filter((tag) => !routed.has(`${i}|${cameOf(tag)}`)), pk: through || (direct ?? contact).sealsIn ? '' : packetKey }));
    // Packed only in the conversation with their account, to an Erevos that said it reads them.
    const packs = !through && !direct && contact.packs === true;
    const plaintexts = main.map((m) => encodeMessage(m, packs));
    const sealTo = (direct ?? contact).sealTo;
    let conversation = through ? null : fromBase64((direct ?? contact).conversations[0]);
    const packets: Uint8Array[] = [];
    for (const plaintext of plaintexts) {
      if (through) {
        packets.push(await this.link!.wrap(contact.identity, plaintext));
        continue;
      }
      const sealed = await core.seal(conversation!, plaintext);
      conversation = sealed.conversation;
      packets.push(sealTo ? sealPacket(this.keysOf(sealTo), sealed.packet) : sealed.packet);
    }
    const request = contact.request && !writes;
    const held = release ? { heldGot: [], heldRead: [] } : {};
    const kept = this.link?.through ? {} : { packetKey };
    // What says the own queue, the one for all, to them: they know it as it is now (Contact.knows),
    // its `qa` too once known.
    const mine = this.mineHere(contact);
    const toldOwn = !this.link?.through && said.some((m) => !!m.from && m.from !== mine?.s);
    const knows = toldOwn ? { knows: this.ownAge > 0 ? this.ownAge : undefined } : {};
    const sentIn = direct
      ? { direct: { ...direct, conversations: [toBase64(conversation!), ...direct.conversations.slice(1)] } }
      : through
        ? {}
        : { conversations: [toBase64(conversation!), ...contact.conversations.slice(1)] };
    await this.save(this.withContact({ ...contact, ...held, ...kept, request, ...sentIn, ...knows }));
    if (said.some((message) => message.on > 0)) this.told.set(contact.identity, now);
    if (!through) for (const plaintext of plaintexts) this.link?.sealed(contact.identity, plaintext);
    const to = direct ?? contact;
    const copies = this.holdCopies({ c: contact.identity, ways, like: said[0], packetKey, leaving, at: now });
    // A way this device started itself (startBound) sends its first packet first, as the account's does.
    const first = direct ? direct.first : contact.first;
    const torChat = contact.tor === true ? { torChat: circuitOf(contact.identity) } : {};
    return { packets, sender: to.sender, relay: to.relay, relayKey: to.relayKey, spare: to.spare ?? null, first: first ? fromBase64(first) : null, copies, through, ...torChat };
  }

  // What of `said` goes to one endpoint of the contact's account (`way`), as lib/endpoints.ts
  // copiedAs says: each message copied whole, and what one says of what came from that endpoint and
  // of what was read; none of it that went there before, nor a voice message's part but the one
  // after those that went. Once as many wait for it as one endpoint holds, or one waits for it
  // while the relay says its queue is full (`full`), only a voice message's next part. Says in
  // `routed` which messages' `got` is that endpoint's and went there.
  private toCopy(c: string, way: Way, said: Message[], cameOf: (tag: string) => string, full: boolean, routed: Set<string>, packetKey: string, calls = false): ToCopy[] {
    const pk = way.sealsIn ? '' : packetKey;
    const sofar = new Map<string, number>();
    const had = (key: string) => (sofar.has(key) ? sofar.get(key) : this.wentTo(c, way.id, key));
    const items: ToCopy[] = [];
    for (const [i, m] of said.entries()) {
      // A call's signal, to an account that takes them on its endpoints: to each, whole, so each rings,
      // and the one that has the call hears it. Never one of a group's call, nor with anything else.
      // And one sent for later, held for each by the relay till its time as for the account (lib/fanout.ts).
      const as = calls && m.call && !m.group && !m.due && !m.text ? 'whole' : calls && laterCopied(m) ? 'whole' : copiedAs({ ...m, ...m.more });
      const came = m.got.filter((tag) => cameOf(tag) === way.id);
      const got = came.filter((tag) => had(`got ${tag}`) === undefined);
      const read = m.read.filter((tag) => had(`read ${tag}`) === undefined);
      const key = as === 'whole' ? copyKey(m) : '';
      const part = key && m.voice ? m.voice.part : 0;
      const next = part > 0 ? had(key) === part : !full && (!key || had(key) === undefined);
      let item: ToCopy | null = null;
      // A call's offer copied rings where it goes, as on their account (lib/space-chats.ts markOf).
      const mark = readsAs(m) ? ('message' as const) : as === 'whole' && m.call?.kind === 'offer' ? ('ring' as const) : undefined;
      if (as === 'whole' && next) item = { m: { ...m, ...SAYS_NOTHING, got, read, pk }, key, ...(key && m.voice ? { part } : {}), ...(mark ? { mark } : {}) };
      else if (!full && got.length + read.length > 0) item = { m: receiptOf(m, got, read, pk), key: '' };
      if (item) {
        items.push(item);
        if (item.key) sofar.set(item.key, part + 1);
        for (const tag of got) sofar.set(`got ${tag}`, 1);
        for (const tag of read) sofar.set(`read ${tag}`, 1);
      }
      if (came.length > 0 && (item || got.length === 0)) routed.add(`${i}|${way.id}`);
    }
    return items;
  }

  // Starts a conversation with an endpoint of a contact's account, as this account, or on a linked
  // device as its endpoint: its first message says where this chat reads, the key it gives, which
  // list of their account it holds, whose endpoint it is for, and from a device the account it
  // speaks for. Null when it cannot be started.
  private async startWay(contact: Contact, way: Way, like: Message, packetKey: string): Promise<core.Sealed | null> {
    const device = this.link?.through === true;
    const account = device ? this.data.endpoint : null;
    const acct = device ? this.data.own?.identity : undefined;
    if (device && (!account || !acct)) return null;
    const opening: Message = {
      from: like.from,
      relay: like.relay,
      relayKey: like.relayKey,
      spare: like.spare,
      // And when that queue was made, as each message after it says.
      ...(like.from && like.qa ? { qa: like.qa } : {}),
      text: '',
      tag: '',
      erase: null,
      timer: null,
      timerAt: 0,
      lasts: 0,
      got: [],
      read: [],
      voice: null,
      file: null,
      ...SAYS_NOTHING,
      call: null,
      group: null,
      pk: packetKey,
      ...this.saysDevices(contact),
      to: contact.identity,
      ...(acct ? { acct } : {}),
    };
    return core.startConversation(account ? fromBase64(account) : this.account, fromBase64Url(way.bundle), encodeMessage(opening)).catch(() => null);
  }

  // Whether a linked device writes these to a contact itself, not through the primary: their
  // account started a conversation with this device's endpoint, which the list this device holds
  // names, and they hold that list too. Never a group's signal, nor a call's or one sent for later
  // to an account that does not take those from its endpoints, which the primary sends.
  private isDirect(contact: Contact, messages: Message[]): boolean {
    const own = this.data.own?.list;
    const endpoint = this.ownEndpoint;
    if (!this.link?.through || !this.takesPart || !endpoint || !own?.real.includes(endpoint.id) || contact.dv !== own.n) return false;
    if (!contact.direct?.conversations[0] || !contact.direct.sender) return false;
    // A call's signals too, once their account takes them from its endpoints and copies its own to this one's.
    // One sent for later too, held for their account and copied to each endpoint (lib/fanout.ts), once
    // they take those; the devices of this account see it as scheduled through the place's log
    // (lib/sync/later.ts).
    return messages.every((m) => (!m.call || contact.calls === true) && !m.group && (!m.due || contact.calls === true));
  }

  // Keeps what a sealing is to copy until what it sealed for the account went (`copiesAfter`): the
  // number it waits under, 0 for none. What waited too long, or the oldest past MAX_PENDING, goes
  // unsent, and so never sealed.
  private holdCopies(held: Held): number {
    for (const [n, h] of this.heldCopies) if (held.at - h.at >= PENDING_LASTS) this.heldCopies.delete(n);
    if (held.ways.length === 0) return 0;
    while (this.heldCopies.size >= MAX_PENDING) this.heldCopies.delete(this.heldCopies.keys().next().value!);
    const n = this.nextPending++;
    this.heldCopies.set(n, held);
    return n;
  }

  // How many copies wait for each endpoint of a contact's: for the relay, and for what went to the account.
  private waitingFor(identity: string): Map<string, number> {
    const counts = new Map<string, number>();
    const add = (w: string, n: number) => counts.set(w, (counts.get(w) ?? 0) + n);
    for (const c of this.fanout.copies) if (c.c === identity) add(c.w, 1);
    for (const held of this.heldCopies.values()) if (held.c === identity) for (const { w, items } of held.ways) add(w, items.length);
    return counts;
  }

  // Whether the relay said the queue of a contact's endpoint is full the last time a copy went to
  // it where it reads now.
  private isRefused(c: string, way: Way): boolean {
    return this.refused.has(`${c}|${way.id}|${way.sender}|${way.relay}`);
  }

  // Makes room in the outbox for `count` more of a contact's copies: when there is none, those for
  // an endpoint whose queue the relay said is full give way first, whoever's they are, the oldest
  // first and a conversation's first packets last, as what no one takes now should keep no one else
  // out; then the oldest of the contact with the most, while they have more than this one would,
  // first packets last. Says whether there is room.
  private async roomFor(identity: string, count: number): Promise<boolean> {
    const held = [...this.heldCopies.values()].reduce((n, h) => n + h.ways.reduce((m, w) => m + w.items.length, 0), 0);
    let over = this.fanout.copies.length + held + count - MAX_COPIES;
    if (over <= 0) return true;
    const ways = this.waysNow();
    const stuck = this.fanout.copies.filter((c) => {
      const way = ways.get(`${c.c}|${c.w}`);
      return !!way && this.isRefused(c.c, way);
    });
    const gone = new Set<number>();
    for (const c of [...stuck.filter((c) => !c.first), ...stuck.filter((c) => c.first)]) {
      if (over <= 0) break;
      gone.add(c.n);
      over--;
    }
    const counts = new Map<string, number>();
    for (const c of this.fanout.copies) if (!gone.has(c.n)) counts.set(c.c, (counts.get(c.c) ?? 0) + 1);
    const theirs = (counts.get(identity) ?? 0) + count;
    while (over > 0) {
      let most = '';
      for (const [c, n] of counts) if (c !== identity && n > (counts.get(most) ?? 0)) most = c;
      if (!most || (counts.get(most) ?? 0) <= theirs) return false;
      const oldest = this.fanout.copies.find((c) => c.c === most && !c.first && !gone.has(c.n)) ?? this.fanout.copies.find((c) => c.c === most && !gone.has(c.n));
      if (!oldest) return false;
      gone.add(oldest.n);
      counts.set(most, counts.get(most)! - 1);
      over--;
    }
    await this.dropCopies((c) => gone.has(c.n));
    return true;
  }

  /**
   * The copies a sealing made for the endpoints of the contact's account (its `copies`) are sealed
   * and go to the relay once what it sealed for their account went (`going`), however it went. If
   * that fails they never go, and none of those endpoints' conversations moved on: the message,
   * sealed again when it is tried again, makes them anew. Unless it can go later (lib/relay.ts
   * canTryLater: their queue is full, or a relay cannot be reached, as the relay said too when
   * only LoRa was left and it is too large for LoRa) and is to go again as it is (`waits`, its tag
   * kept): then they go all the same, so their endpoints have it while their account cannot take
   * it yet, and what is sealed for it again copies none of it. With `waits` 'full', only once the
   * relay said their queue is full, as hidden chats do (lib/waiting.ts handOverHidden).
   */
  async copiesAfter<T>(copies: number, going: Promise<T>, waits: boolean | 'full' = false): Promise<T> {
    let went: T;
    try {
      went = await going;
    } catch (error) {
      const later = canTryLater(error) || (error instanceof TooLargeForSlowWayError && canTryLater(error.relayError));
      if (waits === 'full' ? isQueueFull(error) : waits && later) await this.copiesGo(copies).catch(() => undefined);
      else this.heldCopies.delete(copies);
      throw error;
    }
    await this.copiesGo(copies).catch(() => undefined);
    return went;
  }

  /** The copies a sealing made (its `copies`) are sealed and go to the relay: what it sealed for the account went. */
  copiesGo(copies: number): Promise<void> {
    return this.run(async () => {
      const held = this.heldCopies.get(copies);
      this.heldCopies.delete(copies);
      if (held) await this.sealCopies(held);
    });
  }

  // Seals what a sealing is to copy, for each endpoint in its conversation as it is now: started now
  // if there is none, or another if it is to start again (`startsAgain`), its first packet first
  // again if the outbox lost it, and none of it that went there meanwhile. Keeps the conversations
  // moved past them, then puts them after those that wait.
  private async sealCopies(held: Held): Promise<void> {
    const now = Date.now();
    await this.dropStale(now);
    const contact = this.find(held.c);
    if (!contact?.endpoints) return;
    const copies: Omit<Copy, 'n'>[] = [];
    const went: { w: string; key: string; n: number }[] = [];
    const moved = new Map<string, Way>();
    for (const { w: id, items } of held.ways) {
      let w = contact.endpoints.find((way) => way.id === id);
      if (!w?.sender) continue;
      const sofar = new Map<string, number>();
      const had = (key: string) => (sofar.has(key) ? sofar.get(key) : this.wentTo(held.c, id, key));
      const due = items.filter((item) => {
        if (item.key && had(item.key) !== (item.part || undefined)) return false;
        if (item.key) sofar.set(item.key, (item.part ?? 0) + 1);
        return true;
      });
      if (due.length === 0) continue;
      const of = { c: held.c, w: id, at: now };
      if (w.conversations.length === 0 || (!held.leaving && startsAgain(w, held.at))) {
        if (held.leaving) continue;
        const started = await this.startWay(contact, w, held.like, held.packetKey);
        if (!started) continue;
        // Until it answers in it: those it has open what it sends in them still.
        w = { ...w, conversations: [toBase64(started.conversation), ...w.conversations].slice(0, MAX_CONVERSATIONS), first: toBase64(started.packet), again: now + againAfter(w.conversations.length) };
        copies.push({ ...of, p: w.first, first: true });
      } else if (w.first && !this.fanout.copies.some((c) => c.c === held.c && c.w === id && c.first)) copies.push({ ...of, p: w.first, first: true });
      let inWay = fromBase64(w.conversations[0]);
      for (const item of due) {
        const sealed = await core.seal(inWay, encodeMessage(item.m));
        inWay = sealed.conversation;
        copies.push({ ...of, p: toBase64(w.sealTo ? sealPacket(this.keysOf(w.sealTo), sealed.packet) : sealed.packet), ...(item.mark ? { mark: item.mark } : {}), ...(item.m.due && item.m.tag ? { due: item.m.due, t: item.m.tag } : {}) });
        if (item.key) went.push({ w: id, key: item.key, n: (item.part ?? 0) + 1 });
        for (const tag of item.m.got) went.push({ w: id, key: `got ${tag}`, n: 1 });
        for (const tag of item.m.read) went.push({ w: id, key: `read ${tag}`, n: 1 });
      }
      moved.set(id, { ...w, conversations: [toBase64(inWay), ...w.conversations.slice(1)] });
    }
    if (moved.size === 0) return;
    await this.save(this.withContact({ ...contact, endpoints: contact.endpoints.map((w) => moved.get(w.id) ?? w) }));
    for (const { w, key, n } of went) this.keepWent(held.c, w, key, n);
    await this.addCopies(copies);
  }

  // How far what `key` names went to a contact's endpoint `w` (`copied`): how many of a voice
  // message's parts, 1 for all else, none if it did not.
  private wentTo(c: string, w: string, key: string): number | undefined {
    const at = `${c}|${w}|${key}`;
    const n = this.copied.get(at);
    // Asked of again, it is remembered as long as what went last.
    if (n !== undefined) this.keepWent(c, w, key, n);
    return n;
  }

  private keepWent(c: string, w: string, key: string, n: number): void {
    const at = `${c}|${w}|${key}`;
    this.copied.delete(at);
    this.copied.set(at, n);
    if (this.copied.size > MAX_COPIED) this.copied.delete(this.copied.keys().next().value!);
  }

  // The ways to contacts' endpoints, by contact and endpoint.
  private waysNow(): Map<string, Way> {
    const ways = new Map<string, Way>();
    for (const c of this.data.contacts) for (const w of c.endpoints ?? []) ways.set(`${c.identity}|${w.id}`, w);
    return ways;
  }

  // Puts copies after those that wait for the relay, once the conversations they were sealed in
  // are kept, and says there are more. Not kept, they are lost: those endpoints miss them. Those
  // for an endpoint their list no longer names go.
  private async addCopies(copies: Omit<Copy, 'n'>[]): Promise<void> {
    const ways = this.waysNow();
    let next = this.fanout.next;
    const added = copies.filter((c) => ways.has(`${c.c}|${c.w}`)).map((c) => ({ ...c, n: next++ }));
    if (added.length === 0) return;
    this.fanout = { copies: [...this.fanout.copies, ...added], next };
    await this.keepFanout(this.fanout).catch(() => undefined);
    this.copyListeners.forEach((listener) => listener());
  }

  // Lets go of the copies `gone` says.
  private async dropCopies(gone: (copy: Copy) => boolean): Promise<void> {
    if (!this.fanout.copies.some(gone)) return;
    this.fanout = { ...this.fanout, copies: this.fanout.copies.filter((c) => !gone(c)) };
    await this.keepFanout(this.fanout).catch(() => undefined);
  }

  // Lets go of the copies older than the relay keeps a message, and of those for an endpoint no
  // list of their contact's names now, so one unlinked meanwhile gets nothing more, or whose
  // conversations were let go.
  private async dropStale(now = Date.now()): Promise<void> {
    if (this.fanout.copies.length === 0) return;
    const ways = this.waysNow();
    await this.dropCopies((c) => !ways.get(`${c.c}|${c.w}`)?.conversations.length || now - c.at >= COPIES_LAST);
  }

  /**
   * The copies of what this chat sealed for the endpoints of contacts' accounts that wait for the
   * relay, oldest first (lock/fanout-data.ts), each with where its endpoint reads now: none for one
   * whose queue the relay does not have, until where it reads is said again. Send them, then
   * `copiesSent`.
   */
  copies(now = Date.now()): Outgoing[] {
    const ways = this.waysNow();
    return this.fanout.copies.flatMap((c) => {
      const w = ways.get(`${c.c}|${c.w}`);
      return w?.sender && now - c.at < COPIES_LAST ? [{ ...c, s: w.sender, relay: w.relay, rk: w.relayKey }] : [];
    });
  }

  /**
   * The relay took the copies `sent`, and has no queue for those `gone` (or none can be reached):
   * nothing more goes to that endpoint, nor is sealed for it, until where it reads is said again.
   * Of one that went where its endpoint no longer reads, by the time it went, nothing changes: it
   * goes again where it reads now. For those `full` the relay said that endpoint's queue is full:
   * they wait, but nothing new is copied to it while one does, and they give way first should the
   * outbox fill (`roomFor`), until the relay takes one there.
   */
  copiesSent(sent: Outgoing[], gone: Outgoing[] = [], full: Outgoing[] = []): Promise<void> {
    return this.run(async () => {
      const ways = this.waysNow();
      const current = (o: Outgoing) => {
        const w = ways.get(`${o.c}|${o.w}`);
        return !!w && w.sender === o.s && w.relay === o.relay && w.relayKey === o.rk;
      };
      for (const o of sent) this.refused.delete(`${o.c}|${o.w}|${o.s}|${o.relay}`);
      for (const o of full.filter(current)) this.refused.add(`${o.c}|${o.w}|${o.s}|${o.relay}`);
      const key = (o: Pick<Copy, 'c' | 'w'>) => `${o.c}|${o.w}`;
      const lost = new Set(gone.filter(current).map(key));
      const firsts = new Set(sent.filter((o) => o.first && current(o)).map(key));
      const done = new Set([...sent, ...gone].filter(current).map((o) => o.n));
      let changed = false;
      const contacts = this.data.contacts.map((contact) => {
        const touched = (w: Way) => lost.has(`${contact.identity}|${w.id}`) || firsts.has(`${contact.identity}|${w.id}`);
        if (!contact.endpoints || !contact.endpoints.some(touched)) return contact;
        changed = true;
        const endpoints = contact.endpoints.map((w) => {
          const at = `${contact.identity}|${w.id}`;
          if (lost.has(at)) return { ...w, sender: '' };
          return firsts.has(at) ? { ...w, first: '' } : w;
        });
        return { ...contact, endpoints };
      });
      if (changed) await this.save({ ...this.data, contacts });
      await this.dropCopies((c) => done.has(c.n) || lost.has(key(c)));
    });
  }

  /** Calls `listener` each time copies were added to those that wait for the relay. Returns how to stop. */
  onCopies(listener: () => void): () => void {
    this.copyListeners.add(listener);
    return () => {
      this.copyListeners.delete(listener);
    };
  }

  // What of this account a contact is still to be given, in a message of its own: its newest
  // prekeys, and its device list with its bundle, whose key signed it (`ak`, `dl`); and where this
  // chat reads on Nostr, should that have changed since it last told them (`ns`, made in `seal`).
  // And the name this chat goes by, should it have changed since it last told them (`nm`).
  private keysFor(contact: Contact): { ak?: string; dl?: DeviceList; ns?: true; nm?: true } | null {
    const keys = this.prekeysFor(contact);
    const ns = this.nostrDue(contact);
    const nm = this.nameDue(contact);
    return keys || ns || nm ? { ...keys, ...(ns ? { ns: true as const } : {}), ...(nm ? { nm: true as const } : {}) } : null;
  }

  // Whether a contact is to be told the name this chat goes by, or that it has none any more: once
  // it changed since it last told them (nothing while it never had one). Never from a linked
  // device, whose phone tells them, nor to a request not accepted, which hears nothing back.
  private nameDue(contact: Contact): boolean {
    if (this.data.own || this.link?.through || contact.request || !contact.conversations[0]) return false;
    return (contact.nameSaid ?? '') !== this.myName();
  }

  /** The name this chat goes by (E2EData.myName), or '' for none. */
  myName(): string {
    return this.data.myName ?? '';
  }

  /** Sets the name this chat goes by, '' for none: each contact it accepted is told with the next look (keysDue). */
  setMyName(name: string): Promise<void> {
    return this.run(async () => {
      const named = cleanName(name);
      const { myName: _name, ...rest } = this.data;
      await this.save({ ...rest, ...(named ? { myName: named } : {}) });
    });
  }

  // Its newest prekeys and its device list. Not from a linked device, nor to one who knows this
  // chat by the space's identity (who starts nothing with this account), nor to a request not accepted.
  private prekeysFor(contact: Contact): { ak: string; dl?: DeviceList } | null {
    if (this.link?.through || contact.ownIdentity || contact.request || !contact.conversations[0]) return null;
    const newest = this.data.prekeys?.[0];
    const prekeys = newest !== undefined && (contact.bundleSent ?? 0) < newest.at;
    const list = this.listFor(contact);
    if (!prekeys && !list) return null;
    const ak = toBase64Url(newest ? fromBase64(newest.bundle) : this.bundle);
    return { ak, ...(list ? { dl: { b: list.b, s: list.s, ...(list.r ? { r: routesFor(list.r, contact.identity) } : {}) } } : {}) };
  }

  // What this chat says of Nostr to a contact: its key for them, whether it asks for a bell, and
  // the space's relays; '' while the space does not read there. A key not made yet says 'new'.
  private nostrSaid(contact: Contact): string {
    const relays = nostrRelays();
    return relays ? [contact.nostr?.p ?? 'new', this.bells ? 'b' : '-', ...relays].join(' ') : '';
  }

  // Whether a contact is to be told where this chat reads on Nostr, or that it no longer does: once
  // that changed since it last told them, and never from a linked device, which reads nothing
  // there, nor to a request not accepted, which hears nothing back.
  private nostrDue(contact: Contact): boolean {
    if (this.data.own || contact.request || !contact.conversations[0]) return false;
    return (contact.nostrSaid ?? '') !== this.nostrSaid(contact);
  }

  // The device list a contact is still to be given: to one who says which of this account's lists
  // they hold (`dv`) when it is an older one, or none, once and again a day after should they still
  // say so; or the same one, when where its endpoints read changed since they were given it. Each
  // by which list was given, its `n` and `rAt`, not by the clock, which may have been set back
  // since. None while where one of its endpoints reads is not known: one without, which only a
  // place that fills it could be, would say which that is; but to one whose list may name a device
  // this one does not (`cut`), it goes all the same, as cutting off a device comes first.
  private listFor(contact: Contact, now = Date.now()): OwnList | null {
    const list = this.data.list;
    if (!this.takesPart || !list || contact.dv === undefined) return null;
    if (!this.routed(list) && !(contact.dv > 0 && contact.dv <= (list.cut ?? 0))) return null;
    const given = contact.listGiven;
    const same = given?.n === list.n && given.rAt === (list.rAt ?? 0);
    const sent = contact.listSent ?? 0;
    const due = contact.dv < list.n ? !same || now - sent >= LIST_AGAIN || sent > now : contact.dv === list.n && !same;
    return due ? list : null;
  }

  /**
   * The contacts this chat's newest prekeys, or the account's device list, are still to go to: each
   * in a message of its own (`seal` with `keys`), as they make it larger than a text alone, through
   * the relay or to their phone nearby, never over LoRa. Then `keysGiven`.
   */
  keysDue(): string[] {
    return this.data.contacts.filter((contact) => this.keysFor(contact)).map((contact) => contact.identity);
  }

  // Whether where each endpoint of the list reads is known.
  private routed(list: OwnList): boolean {
    if (this.listed?.b !== list.b) this.listed = { b: list.b, ids: bodyOf(list)?.d.map((e) => e.i) ?? [] };
    return this.listed.ids.length > 0 && this.listed.ids.every((id) => !!list.r?.[id]);
  }

  /** What `seal` sealed with `keys` for this contact went: given as it was when it was sealed, so a list or a route changed since is given too. */
  keysGiven(identity: string): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      const newest = this.data.prekeys?.[0];
      const sealed = this.listSealed.get(identity);
      this.listSealed.delete(identity);
      const said = this.nostrSealed.get(identity);
      this.nostrSealed.delete(identity);
      const list = sealed ? { listSent: sealed.at, listGiven: { n: sealed.n, rAt: sealed.rAt } } : {};
      const nostr = said !== undefined ? { nostrSaid: said } : {};
      const named = this.nameSealed.get(identity);
      this.nameSealed.delete(identity);
      const name = named !== undefined ? { nameSaid: named } : {};
      if (contact && (newest || sealed || said !== undefined || named !== undefined)) await this.save(this.withContact({ ...contact, ...(newest ? { bundleSent: newest.at } : {}), ...list, ...nostr, ...name }));
    });
  }

  // Where this chat says it reads on Nostr, with its key for the contact, or '' for nowhere.
  private nostrTold(contact: Contact): NostrTo | '' {
    const relays = nostrRelays();
    return relays && contact.nostr ? { k: contact.nostr.p, r: relays, ...(this.bells ? { b: true as const } : {}) } : '';
  }

  /** The keys this chat reads on Nostr with (lib/nostr.ts readNostr): its contacts', and its link's. */
  nostrKeys(): NostrKey[] {
    return [...(this.data.nostrLink ? [this.data.nostrLink] : []), ...this.data.contacts.flatMap((contact) => (contact.nostr ? [contact.nostr] : []))];
  }

  /** The public keys (hex) of nostrKeys that are of chats that go only through Tor: read through Tor alone, never straight (lib/nostr.ts). */
  torNostrKeys(): Set<string> {
    return new Set(this.data.contacts.flatMap((contact) => (contact.nostr && contact.tor === true ? [contact.nostr.p] : [])));
  }

  /**
   * Where this chat's contact link says it reads on Nostr (lib/contact-code.ts `nk`, `nr`): the key the
   * link has there, made the first time and kept, and the space's relays. Null while it reads
   * nowhere, and on a linked device, which reads nothing there. What someone who adds the link writes
   * there first opens as from the relay: a conversation it starts, as a request.
   */
  linkNostr(): Promise<{ k: string; r: string[] } | null> {
    return this.run(async () => {
      const relays = nostrRelays();
      if (!relays || this.data.own || this.link?.through) return null;
      let key = this.data.nostrLink;
      if (!key) {
        key = await newNostrKey();
        await this.save({ ...this.data, nostrLink: key });
        nostrKeysChanged();
      }
      return { k: key.p, r: relays };
    });
  }

  /** Until when what came for this chat on the Nostr relays was read (seconds), 0 for never. */
  nostrSince(): number {
    return this.data.nostrAt ?? 0;
  }

  /** What came on the Nostr relays before `at` (seconds) was read: kept, at most every ten minutes. */
  nostrRead(at: number): Promise<void> {
    return this.run(async () => {
      if (at - (this.data.nostrAt ?? 0) < 600) return;
      await this.save({ ...this.data, nostrAt: at });
    });
  }

  /**
   * Keeps a text that went to a contact through Nostr (its `tag` and `wraps`), to go through the
   * relay as well should their phone not say it came within NOSTR_BACKUP_MS (`nostrBackupsDue`):
   * quiet there when a bell went with it already (`quiet`).
   */
  nostrKeep(identity: string, tag: string, wraps: Uint8Array[], quiet: boolean, now = Date.now()): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact || !isTag(tag)) return;
      // A voice message is many wraps: kept only while it stays small, or it would swell the space.
      if (wraps.reduce((sum, wrap) => sum + wrap.length, 0) > NOSTR_KEEP_MOST) return;
      const kept = (contact.nostrBackup ?? []).filter((b) => b.t !== tag && now - b.at < NOSTR_BACKUP_LASTS);
      const backup = [...kept, ...wraps.map((wrap) => ({ t: tag, at: now, p: toBase64(wrap), ...(quiet ? { q: true as const } : {}) }))].slice(-MAX_NOSTR_BACKUP);
      await this.save(this.withContact({ ...contact, nostrBackup: backup }));
    });
  }

  /**
   * Keeps a text that went to a contact Nostr is the only way to (lib/nostr-chats.ts nostrOnlyWay):
   * the wrap's packets as they went (`packed`), to go there again while their phone does not say it
   * came (`nostrAgainDue`), as a Nostr relay keeps it two days only.
   */
  nostrKeepOnly(identity: string, tag: string, wraps: Uint8Array[], now = Date.now()): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact || !isTag(tag)) return;
      if (wraps.reduce((sum, wrap) => sum + wrap.length, 0) > NOSTR_KEEP_MOST) return;
      const kept = (contact.nostrBackup ?? []).filter((b) => b.t !== tag && now - b.at < NOSTR_BACKUP_LASTS);
      const backup = [...kept, ...wraps.map((wrap) => ({ t: tag, at: now, p: toBase64(wrap), n: 1 }))].slice(-MAX_NOSTR_BACKUP);
      await this.save(this.withContact({ ...contact, nostrBackup: backup }));
    });
  }

  /** What went to contacts through Nostr only, not said to have come, and due to go there again: to each where they read now, then `nostrWentAgain`. */
  nostrAgainDue(now = Date.now()): { identity: string; tag: string; packed: Uint8Array; to: NostrTo }[] {
    return this.data.contacts.flatMap(({ identity, nostrTo: to, nostrBackup }) =>
      to ? (nostrBackup ?? []).filter((b) => b.n !== undefined && now - b.at >= NOSTR_AGAIN_MS).map((b) => ({ identity, tag: b.t, packed: fromBase64(b.p), to })) : [],
    );
  }

  /** What `nostrAgainDue` gave went to Nostr again: kept for the next time, until it went NOSTR_AGAIN_MOST times. */
  nostrWentAgain(identity: string, tag: string, now = Date.now()): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      const backup = contact?.nostrBackup;
      if (!contact || !backup?.some((b) => b.t === tag)) return;
      const left = backup.flatMap((b) => (b.t !== tag || b.n === undefined ? [b] : b.n + 1 >= NOSTR_AGAIN_MOST ? [] : [{ ...b, at: now, n: b.n + 1 }]));
      const { nostrBackup: _backup, ...rest } = contact;
      await this.save(this.withContact(left.length > 0 ? { ...rest, nostrBackup: left } : rest));
    });
  }

  /** The texts that went through Nostr whose contact's phone did not say they came in time: to send through the relay as well, then `nostrBackupSent`. */
  nostrBackupsDue(now = Date.now()): { identity: string; tag: string; packet: Uint8Array; quiet: boolean }[] {
    return this.data.contacts.flatMap((contact) =>
      (contact.nostrBackup ?? [])
        .filter((b) => b.n === undefined && now - b.at >= NOSTR_BACKUP_MS && now - b.at < NOSTR_BACKUP_LASTS)
        .map((b) => ({ identity: contact.identity, tag: b.t, packet: fromBase64(b.p), quiet: b.q === true })),
    );
  }

  /** A text kept by `nostrKeep` went through the relay as well (or is not to): kept no more. */
  nostrBackupSent(identity: string, tag: string): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (!contact?.nostrBackup?.some((b) => b.t === tag)) return;
      const left = contact.nostrBackup.filter((b) => b.t !== tag);
      const { nostrBackup: _backup, ...rest } = contact;
      await this.save(this.withContact(left.length > 0 ? { ...rest, nostrBackup: left } : rest));
    });
  }

  /**
   * A bell for a contact's relay queue, about `length` bytes, which says nothing and opens in none
   * of their conversations: sent marked as a message after a text that went through Nostr, it has
   * their hidden chats say something came while closed (lib/nostr.ts). Sealed with the key they
   * gave this chat for packets, as what is sent them is, so their phone knows it for theirs, not junk.
   */
  bell(identity: string, length: number): Uint8Array {
    const sealTo = this.find(identity)?.sealTo;
    const size = Math.max(64, length - (sealTo ? SEALED_OVERHEAD : 0));
    return sealTo ? sealPacket(this.keysOf(sealTo), randomBytes(size)) : randomBytes(size);
  }

  /** On the primary: keeps where each endpoint of the device list as last signed (`n`) reads, and the queues made for those only filling it (`q`). */
  keepRoutes(n: number, r: Record<string, Route>, q: Record<string, string>): Promise<void> {
    return this.run(async () => {
      const list = this.data.list;
      if (!list || list.n !== n) return;
      const moved = JSON.stringify(list.r ?? {}) !== JSON.stringify(r);
      if (!moved && JSON.stringify(list.q ?? {}) === JSON.stringify(q)) return;
      await this.save({ ...this.data, list: { ...list, r, q, ...(moved ? { rAt: laterThan(list.rAt) } : {}) } });
    });
  }

  /** On the primary: the queues the places that fill the list read on before, still emptied until each one's grace ends (lib/devices.ts drainFillers). */
  keepOldFillers(qWas: OldFiller[]): Promise<void> {
    return this.run(async () => {
      const list = this.data.list;
      if (!list || JSON.stringify(list.qWas ?? []) === JSON.stringify(qWas)) return;
      const { qWas: _was, ...rest } = list;
      await this.save({ ...this.data, list: { ...rest, ...(qWas.length > 0 ? { qWas: qWas.slice(-MAX_OLD_FILLERS) } : {}) } });
    });
  }

  /** The first packets still waiting for the relay, if any, and where they go: a new conversation's, or a newer one's (`renew`). */
  pending(): { identity: string; sender: string; relay: string; relayKey: string; spare: Spare | null; first: Uint8Array }[] {
    return this.data.contacts
      .filter((contact) => (contact.first || contact.renew) && contact.sender)
      .map(({ identity, sender, relay, relayKey, spare, first, renew }) => ({ identity, sender, relay, relayKey, spare: spare ?? null, first: fromBase64(first || renew!) }));
  }

  /** The relay took the first packet `pending` gave for this contact. */
  firstSent(identity: string): Promise<void> {
    return this.run(async () => {
      const contact = this.find(identity);
      if (contact?.first) await this.save(this.withContact({ ...contact, first: '' }));
      else if (contact?.direct?.first) await this.save(this.withContact({ ...contact, direct: { ...contact.direct, first: '' } }));
      else if (contact?.renew) await this.save(this.withContact({ ...contact, renew: '' }));
    });
  }

  /**
   * Opens a packet from the relay. `onOwn`: the sender id of the own queue it came to; when that is
   * this chat's own queue as it is now (`setQueueAge`), its sender is heard there (Contact.onNew),
   * and not when a look that started before a move read the one before. `old`: it came to a queue this chat moved away from, or
   * to the one its contact link or its groups name (lib/queue-move.ts), and is read cheaply: one
   * that came sealed opens only in the conversations of the contact whose mark it has, as always;
   * one that came unsealed only in those of contacts whose packets do not come sealed, never in
   * the few tries the others get (`mayTryUnsealed`). `onMine`: the recipient id (hex) of the
   * contact queue it came to (lib/contact-queues.ts), read cheaply as `old`: one of that contact's
   * there says they write to it (Mine.heard).
   */
  receive(packet: Uint8Array, { onOwn = '', old = false, onMine = '', near }: { onOwn?: string; old?: boolean; onMine?: string; near?: string } = {}): Promise<Received> {
    return this.run(async () => {
      const received = await this.receiveNow(packet, onOwn, old || !!onMine, near);
      if (onMine && received.kind === 'message') await this.heardOnMine(received.identity, onMine);
      return received;
    });
  }

  // A contact heard on the queue of their own (`r`, hex): they write to it, so the one it took the
  // place of may go (oldMinesOver), and they are not told it again.
  private async heardOnMine(identity: string, r: string): Promise<void> {
    const contact = this.find(identity);
    if (!contact?.mine || contact.mine.r !== r || contact.mine.heard) return;
    await this.save(this.withContact({ ...contact, mine: { ...contact.mine, heard: true } }));
  }

  private async receiveNow(packet: Uint8Array, onOwn: string, old: boolean, near?: string): Promise<Received> {
    {
      const heard = !!onOwn && !old && onOwn === this.ownFrom;
      // One between the account's devices, first (lib/devices.ts): what it says of the contacts
      // changes them here, and a contact's message the primary passed on opens as theirs.
      const linked = this.link ? await this.link.open(packet, near).catch(() => null) : null;
      if (linked?.kind === 'taken') {
        // On a linked device, who is blocked as the phone keeps them: their link is not added here either until unblocked.
        if (linked.blocked && this.link?.through) {
          const { blocked: _blocked, ...rest } = this.data;
          await this.save(linked.blocked.length > 0 ? { ...rest, blocked: linked.blocked } : rest);
        }
        if (linked.contacts) {
          const held = new Map(this.data.contacts.map((c) => [c.identity, c.list?.n ?? 0]));
          // The entries of a list the phone gave that name an account are no endpoints, as here.
          const contacts = linked.contacts(this.data.contacts);
          const account = (id: string) => id === this.identityHex() || id === this.data.own?.identity || contacts.some((o) => o.identity === id || o.ownIdentity === id);
          await this.save({ ...this.data, contacts: contacts.map((c) => (c.endpoints?.some((w) => account(w.id)) ? { ...c, endpoints: c.endpoints.filter((w) => !account(w.id)) } : c)) });
          // A contact's list given by the phone: what their endpoints started with this one may be taken now.
          for (const c of this.data.contacts) if ((c.list?.n ?? 0) > (held.get(c.identity) ?? 0)) await this.retryUnverified(c.identity);
          await this.retryEarly();
        }
        return { kind: 'refused', reason: 'linked' };
      }
      if (linked) return this.open(packet, linked, { heard });
      if (isSealedPacket(packet)) {
        // Whose it is, by its mark: then only their conversations are tried. One with their mark
        // that opens in none is still theirs: no junk (lib/moves.ts), as a broken conversation sends.
        const contact = this.data.contacts.find((c) => sealedWith(this.keysOf(this.ownPacketKey(c)), packet));
        const inner = contact ? openPacket(this.keysOf(this.ownPacketKey(contact)), packet) : null;
        if (contact && inner && (await core.packetKind(inner)) === 'following') return theirs(await this.open(inner, null, { only: contact.identity, sealed: true, heard }));
        if (contact) return { kind: 'refused', reason: 'unknown', theirs: true };
        // On a linked device, one sealed with the key the account's list gives a contact with where
        // its endpoint reads, by them or an endpoint of theirs not given another yet: whose it is, by
        // its mark, as that key is each contact's own (lib/sealed-packet.ts entryKey).
        const seed = !contact && this.link?.through ? this.endpointKey() : '';
        const listed = seed ? this.data.contacts.find((c) => sealedWith(this.keysOf(entryKeyOf(seed, c.identity)), packet)) : undefined;
        const opened = listed ? openPacket(this.keysOf(entryKeyOf(seed, listed.identity)), packet) : null;
        if (listed && opened && (await core.packetKind(opened)) === 'following') return this.open(opened, null, { only: listed.identity, heard });
        return { kind: 'refused', reason: 'unknown' };
      }
      const kind = await core.packetKind(packet);
      if (kind === 'first') return this.accept(packet, false, heard);
      if (kind === 'following') return this.open(packet, null, { sealed: false, old, heard });
      return { kind: 'refused', reason: 'plain' };
    }
  }

  // A first packet: a contact starting a conversation with this account, or someone new who has its
  // link (a message request). On a linked device, whose endpoint alone takes them, one a contact's
  // account starts with it, or one of their endpoints (`acct`); each only when it says it is for
  // this device's account (`to`). An account takes none that says either: no list names it, so one
  // that does was meant for an endpoint of someone else's.
  private async accept(packet: Uint8Array, retry = false, heard = false): Promise<Received> {
    // Damaged, as junk can be: refused, so the look counts it (lib/moves.ts), never thrown.
    const made = await core.firstMessageId(packet).catch(() => null);
    if (!made) return { kind: 'refused', reason: 'unknown' };
    const id = toHex(made).slice(0, 32);
    if (this.data.seen.includes(id)) return { kind: 'refused', reason: 'replay' };
    const device = this.link?.through === true;
    if (device && (!this.takesPart || !this.data.endpoint)) return { kind: 'refused', reason: 'unknown' };
    let opened: core.Opened;
    try {
      opened = device
        ? await core.acceptConversation(fromBase64(this.data.endpoint!), packet)
        : await core.acceptConversation(this.account, packet, (this.data.prekeys ?? []).map((p) => fromBase64(p.secret)));
    } catch {
      return { kind: 'refused', reason: 'unknown' };
    }
    const identity = toHex(await core.conversationPeer(opened.conversation));
    // Someone blocked here: dropped, kept nowhere, a request too.
    if (this.isBlocked(identity)) return { kind: 'refused', reason: 'blocked' };
    const message = decodeMessage(opened.plaintext);
    opened = await pqTurnedOn(opened, message);
    if (device) {
      const account = this.data.own?.identity;
      if (!account || message.to !== account) return { kind: 'refused', reason: 'unknown' };
      if (message.acct !== undefined) return message.acct ? this.acceptEndpoint(identity, message.acct, opened, message, id, toBase64(packet), retry) : { kind: 'refused', reason: 'unknown' };
      const known = this.find(identity);
      if (known) return this.acceptDirect(known, opened, message, id);
      if (!retry) await this.save({ ...this.data, early: withEarlyFirst(this.data.early, toBase64(packet), identity, Date.now()) });
      return { kind: 'refused', reason: 'unknown' };
    }
    // Someone new's linked device, with its account's word for it (S5): taken only as acceptBound says.
    if (message.to !== undefined && message.to === this.identityHex() && message.acct && message.ab && message.ak && message.dl) return this.acceptBound(identity, message, opened, id, heard);
    if (message.to !== undefined || message.acct !== undefined) return { kind: 'refused', reason: 'unknown' };
    const known = this.find(identity);
    // The space's list moves on with every new contact: theirs keeps what they sent.
    if (known?.seen.includes(id)) return { kind: 'refused', reason: 'replay' };
    // Someone new who says back an invite given from here (lib/welcome.ts): a contact at once,
    // named as the invite was, which is used then.
    const welcomed = !known && isHi(message.hi) ? this.waitingInvites(Date.now()).find((i) => i.hi === message.hi) : undefined;
    const timing = timerOf(message, known);
    // One older than the newest taken from them (a replay, once its id is no longer kept, or a late
    // copy): its conversation is kept behind the one this chat sends in, which they may have
    // dropped, and it moves nothing else on, nor starts their endpoints' conversations again. One
    // they really started with a clock behind becomes that one with the first message they send in it.
    const stale = !!known && staleFirst(message, known);
    // Where they read, unless they said it before from a queue made later (a late copy).
    const takes = !stale && takesPlace(message.qa, known?.qa);
    const qa = takes && message.qa ? message.qa : known?.qa;
    const nostrTo = takes && message.ns !== undefined ? message.ns || undefined : known?.nostrTo;
    const contact: Contact = {
      identity,
      sender: (takes && message.from) || known?.sender || message.from || '',
      ...(message.from && takes ? placeOf(message, known) : { relay: known?.relay ?? '', relayKey: known?.relayKey ?? '', spare: known?.spare ?? null }),
      conversations: (stale && known.conversations.length > 0 ? [known.conversations[0], toBase64(opened.conversation), ...known.conversations.slice(1)] : [toBase64(opened.conversation), ...(known?.conversations ?? [])]).slice(0, MAX_CONVERSATIONS),
      first: known?.first ?? '',
      name: known?.name ?? welcomed?.name ?? '',
      timer: timing.timer,
      timerAt: timing.timerAt,
      ...shotsKept(timing.shots),
      // Someone new who has this chat's link writes first: a request until accepted, unless invited.
      request: known ? known.request : !welcomed,
      look: known?.look ?? null,
      avatar: known?.avatar ?? null,
      ownIdentity: known?.ownIdentity ?? '',
      hide: known?.hide ?? false,
      ...(known?.tor ? { tor: true as const } : {}),
      heldGot: known?.heldGot ?? [],
      heldRead: known?.heldRead ?? [],
      phone: known?.phone ?? '',
      seen: [...(known?.seen ?? []), id].slice(-MAX_SEEN_EACH),
      packetKey: this.ownPacketKey({ identity, packetKey: known?.packetKey ?? '' }),
      sealTo: (stale ? known.sealTo || message.pk : message.pk || known?.sealTo) || '',
      // A new conversation from them: their phone may have lost this chat's key, so it is said again.
      sealsIn: stale ? known.sealsIn : false,
      ...(stale ? (known.firstAt ? { firstAt: known.firstAt } : {}) : message.fa ? { firstAt: message.fa } : known?.firstAt ? { firstAt: known.firstAt } : {}),
      ...((takes ? ringSenderOf(message, known) : known?.ringSender) ? { ringSender: takes ? ringSenderOf(message, known) : known?.ringSender } : {}),
      ...(qa ? { qa } : {}),
      // Whether their Erevos reads packed messages, as their latest message says.
      ...((takes ? message.zp : known?.packs) ? { packs: true as const } : {}),
      ...(known?.told ? { told: known.told } : {}),
      ...(heard && this.ownAge ? { onNew: this.ownAge } : known?.onNew ? { onNew: known.onNew } : {}),
      // What is known of their devices stays with them. Added again on their side, saying where
      // they read, their account's devices may have lost what they spoke with this chat's
      // endpoints in: those conversations start again. Not the account's first word after one of
      // its devices started the chat (`byDevice`): its phone adds this chat as that device asked.
      ...(known?.dv !== undefined ? { dv: known.dv } : {}),
      ...(known?.list ? { list: known.list } : {}),
      ...(known?.endpoints ? { endpoints: message.from && !known.byDevice && !stale ? known.endpoints.map(blankAgain) : known.endpoints } : {}),
      ...(known?.listSent ? { listSent: known.listSent } : {}),
      ...(known?.listGiven ? { listGiven: known.listGiven } : {}),
      ...(known?.took ? { took: known.took } : {}),
      // Where each reads on Nostr stays as it was, unless they say otherwise now.
      ...(known?.nostr ? { nostr: known.nostr } : {}),
      ...(nostrTo ? { nostrTo } : {}),
      ...(known?.nostrSaid !== undefined ? { nostrSaid: known.nostrSaid } : {}),
      ...(known?.nostrBackup ? { nostrBackup: known.nostrBackup } : {}),
      // Their own queue here stays theirs (lib/contact-queues.ts). Someone new knows the own queue
      // when they wrote to it, or the contact link names it; else they know none.
      ...(known?.mine ? { mine: known.mine } : {}),
      ...(known ? (known.knows !== undefined ? { knows: known.knows } : {}) : heard || this.linkOwn ? (this.ownAge > 0 ? { knows: this.ownAge } : {}) : { knows: 0 }),
      // What this phone keeps for the chat stays too: its own PIN and its notifications.
      ...(known?.pin ? { pin: known.pin } : {}),
      ...(known?.notify ? { notify: known.notify } : {}),
      ...(known?.verified ? { verified: known.verified } : {}),
      // The name they go by stays, unless they say otherwise now. A conversation they start anew
      // may come from a phone that lost the one this chat goes by: it is told again.
      ...(known?.said ? { said: known.said } : {}),
      ...(known?.nameSaid !== undefined && stale ? { nameSaid: known.nameSaid } : {}),
    };
    const learned = this.partOf(contact) ? await this.heardOf(contact, message) : {};
    const { contact: next, twice } = tookIn(this.seenIn(namedIn({ ...contact, ...learned }, message), message), message, this.link?.through === true);
    const kept = { ...this.withContact(next), seen: [...this.data.seen, id].slice(-MAX_SEEN) };
    if (welcomed) {
      const invited = (kept.invited ?? []).filter((i) => i.hi !== welcomed.hi);
      const { invited: _invited, ...rest } = kept;
      await this.save(invited.length > 0 ? { ...rest, invited } : rest);
    } else await this.save(kept);
    if (next.list && next.list.n !== known?.list?.n) await this.retryUnverified(identity);
    this.link?.opened(identity, opened.plaintext);
    if (message.tag) this.noteCame(identity, message.tag, '');
    return this.receivedOf(next, message, timing.received, !known, '', twice);
  }

  // On a linked device: a conversation a contact's account started with its endpoint, as it writes
  // to every endpoint this account's list names: this device's own way to them from then on. One
  // started while this device had one already: their side started its way here again, as when it
  // added this account again and its devices may have lost what they spoke with this one, or as
  // this one never answered. Each way to their endpoints then starts again with the next copy,
  // those it has kept to open in (`Way.again`), as on the phone when their account starts anew.
  private async acceptDirect(contact: Contact, opened: core.Opened, message: Message, id: string): Promise<Received> {
    const was = contact.direct;
    if (was?.seen.includes(id)) return { kind: 'refused', reason: 'replay' };
    const now = Date.now();
    const endpoints = was?.conversations.length ? contact.endpoints?.map((w) => (w.conversations.length > 0 ? { ...w, again: now } : w)) : contact.endpoints;
    const direct: Way = {
      id: contact.identity,
      bundle: '',
      sender: message.from || was?.sender || '',
      ...(message.from ? whereOf(message, was) : { relay: was?.relay ?? '', relayKey: was?.relayKey ?? '' }),
      spare: message.from ? (message.spare ?? null) : (was?.spare ?? null),
      conversations: [toBase64(opened.conversation), ...(was?.conversations ?? [])].slice(0, MAX_CONVERSATIONS),
      first: '',
      seen: [...(was?.seen ?? []), id].slice(-MAX_SEEN_EACH),
      sealTo: message.pk || was?.sealTo || '',
      sealsIn: false,
    };
    return this.tookFirst({ ...contact, direct, ...(endpoints ? { endpoints } : {}) }, contact, opened, message, id, '', '');
  }

  // On a linked device: a conversation an endpoint of a contact's account (`acct`) started with
  // this one: taken only once the list of that account checked here names it, never as a message
  // request. One of a contact who knows about devices that the list cannot be checked to name yet
  // waits for the account's next list (E2EData.unverified), in place of one before from the same
  // endpoint; tried again (`retry`), it waits no more.
  private async acceptEndpoint(identity: string, acct: string, opened: core.Opened, message: Message, id: string, packet: string, retry: boolean): Promise<Received> {
    const contact = this.find(acct);
    const way = contact?.endpoints?.find((w) => w.id === identity);
    if (!contact || !way) {
      if (!retry && contact?.dv !== undefined) await this.save({ ...this.data, unverified: withUnverified(this.data.unverified, packet, acct, identity, Date.now()) });
      return { kind: 'refused', reason: 'unknown' };
    }
    if (way.seen.includes(id)) return { kind: 'refused', reason: 'replay' };
    // What goes to it goes in the one it started, which it has: none is to start again.
    const { again: _again, ...kept } = way;
    const moved: Way = {
      ...kept,
      ...(message.from ? { sender: message.from, ...whereOf(message, way), spare: message.spare ?? null } : {}),
      conversations: [toBase64(opened.conversation), ...way.conversations].slice(0, MAX_CONVERSATIONS),
      seen: [...way.seen, id].slice(-MAX_SEEN_EACH),
      sealTo: message.pk || way.sealTo,
      sealsIn: false,
    };
    return this.tookFirst({ ...contact, endpoints: contact.endpoints!.map((w) => (w.id === identity ? moved : w)) }, contact, opened, message, id, identity, packet);
  }

  // A conversation one of someone's linked devices started with this account (docs/multi-device.md,
  // S5), saying it is for this account (`to`) and which account it speaks for (`acct`). Taken only
  // when the bundle it gives for that account (`ak`) is that account's by its X25519 identity's
  // word (`ab`, lib/core.ts bundleBound), the list that bundle signed (`dl`) names the endpoint that
  // started it as one of the account's, and that account is neither this one nor blocked: so no one
  // can speak for an account whose identity's secret they do not hold, and the safety number, which
  // covers that identity, covers the bundle and the list through it. Someone new is a message
  // request, as from their phone, unless it says back an invite given here; this chat starts its
  // own conversation with their account at once, with that bundle, whose first packet goes with
  // what it sends them first, to where the account reads as its pass for that endpoint says (`ap`),
  // good now: a device unlinked, lost or stolen keeps none good for long. Someone known takes it as their
  // endpoint's, with the list if it is a later one.
  private async acceptBound(endpoint: string, message: Message, opened: core.Opened, id: string, heard: boolean): Promise<Received> {
    const unknown: Received = { kind: 'refused', reason: 'unknown' };
    const acct = message.acct!;
    if (acct === this.identityHex() || endpoint === acct || this.isAccount(endpoint) || !core.canBind()) return unknown;
    if (this.isBlocked(acct)) return { kind: 'refused', reason: 'blocked' };
    let bundle: Uint8Array;
    try {
      bundle = fromBase64Url(message.ak!);
      const bound = await core.bundleBound(bundle, fromBase64Url(message.ab!));
      if (!bound || toHex(bound) !== acct) return unknown;
    } catch {
      return unknown;
    }
    const body = await verifyList(bundle, acct, message.dl!, 0).catch(() => null);
    if (!body || body === 'same' || !body.d.some((e) => e.i === endpoint)) return unknown;
    // Its pass, good now, someone known too: a list that names it may be old, a pass is not.
    const at = message.ap ? await verifyPass(bundle, acct, message.ap, endpoint) : null;
    if (!at) return unknown;
    const known = this.find(acct);
    // One who knows this chat by another identity hears nothing of its devices, nor these of theirs.
    if (known?.ownIdentity) return unknown;
    const later = !known?.list || body.n > known.list.n;
    const list = later ? { b: message.dl!.b, s: message.dl!.s, n: body.n } : known!.list!;
    const ways = later ? waysFor(known?.endpoints, body.d, message.dl!.r, (x) => this.isAccount(x)) : (known?.endpoints ?? []);
    const way = ways.find((w) => w.id === endpoint);
    if (!way) return unknown;
    if (way.seen.includes(id)) return { kind: 'refused', reason: 'replay' };
    const { again: _again, ...kept } = way;
    const moved: Way = {
      ...kept,
      ...(message.from ? { sender: message.from, ...whereOf(message, way), spare: message.spare ?? null } : {}),
      conversations: [toBase64(opened.conversation), ...way.conversations].slice(0, MAX_CONVERSATIONS),
      seen: [...way.seen, id].slice(-MAX_SEEN_EACH),
      sealTo: message.pk || way.sealTo,
      sealsIn: false,
    };
    const endpoints = ways.map((w) => (w.id === endpoint ? moved : w));
    if (known) return this.tookFirst({ ...known, list, endpoints }, known, opened, message, id, endpoint, '');
    const welcomed = isHi(message.hi) ? this.waitingInvites(Date.now()).find((i) => i.hi === message.hi) : undefined;
    const packetKey = this.ownPacketKey({ identity: acct, packetKey: '' });
    // Their account's own conversation, started now, as with newer prekeys (startedAgain): its
    // first message says nothing of where this chat reads, which what goes after it says.
    const first: Message = { from: '', relay: '', relayKey: '', text: '', tag: '', erase: null, timer: null, timerAt: 0, lasts: 0, got: [], read: [], voice: null, file: null, ...SAYS_NOTHING, call: null, group: null, pk: packetKey, ...this.saysDevices(undefined), fa: firstAt() };
    const started = await core.startConversation(this.account, bundle, encodeMessage(first));
    const timing = timerOf(message, undefined);
    const contact: Contact = {
      identity: acct,
      sender: at.s,
      relay: at.r,
      relayKey: at.k,
      spare: null,
      conversations: [toBase64(started.conversation)],
      first: toBase64(started.packet),
      name: welcomed?.name ?? '',
      timer: timing.timer,
      timerAt: timing.timerAt,
      ...shotsKept(timing.shots),
      request: !welcomed,
      look: null,
      avatar: null,
      ownIdentity: '',
      hide: false,
      heldGot: [],
      heldRead: [],
      phone: '',
      seen: [],
      packetKey,
      sealTo: '',
      sealsIn: false,
      bundle: toBase64(bundle),
      dv: message.dv ?? 0,
      ...(message.cl === 1 ? { calls: true as const } : {}),
      byDevice: true,
      list,
      endpoints,
      ...(heard || this.linkOwn ? (this.ownAge > 0 ? { knows: this.ownAge } : {}) : { knows: 0 }),
    };
    const { contact: next, twice } = tookIn(this.seenIn(contact, message), message, false);
    const saved = { ...this.withContact(next), seen: [...this.data.seen, id].slice(-MAX_SEEN) };
    if (welcomed) {
      const invited = (saved.invited ?? []).filter((i) => i.hi !== welcomed.hi);
      const { invited: _invited, ...rest } = saved;
      await this.save(invited.length > 0 ? { ...rest, invited } : rest);
    } else await this.save(saved);
    this.link?.opened(acct, opened.plaintext);
    if (message.tag) this.noteCame(acct, message.tag, endpoint);
    return this.receivedOf(next, message, timing.received, true, endpoint, twice);
  }

  // Keeps what a first packet from one of a contact's endpoints, or from their account to this
  // device's endpoint (`from` empty), brought; one that waited for their list (`packet`) waits no more.
  private async tookFirst(contact: Contact, was: Contact, opened: core.Opened, message: Message, id: string, from: string, packet: string): Promise<Received> {
    const timing = timerOf(message, contact);
    const learned = from ? {} : await this.heardOf(contact, message);
    const { contact: next, twice } = tookIn(this.seenIn(withShots({ ...contact, ...learned, timer: timing.timer, timerAt: timing.timerAt }, timing.shots), message), message, this.link?.through === true);
    const unverified = this.data.unverified?.filter((u) => u.packet !== packet);
    await this.save({ ...this.withContact(next), seen: [...this.data.seen, id].slice(-MAX_SEEN), ...(unverified ? { unverified } : {}) });
    if (next.list && next.list.n !== was.list?.n) await this.retryUnverified(next.identity);
    this.link?.opened(next.identity, opened.plaintext);
    if (message.tag) this.noteCame(next.identity, message.tag, from);
    return this.receivedOf(next, message, timing.received, false, from, twice);
  }

  // The first packets from endpoints of an account that waited for its list, tried again once it
  // has a later one: those it names are taken, the others go. What they say is not shown: a
  // conversation's first message has no text.
  private async retryUnverified(acct: string): Promise<void> {
    const now = Date.now();
    const waiting = (this.data.unverified ?? []).filter((u) => u.acct === acct && now - u.at < UNVERIFIED_LASTS);
    if (!this.data.unverified?.some((u) => u.acct === acct)) return;
    await this.save({ ...this.data, unverified: this.data.unverified.filter((u) => u.acct !== acct) });
    for (const u of waiting) await this.accept(fromBase64(u.packet), true).catch(() => undefined);
  }

  // On a linked device: the first packets of contacts it did not know yet (E2EData.early), tried
  // again once the phone said who one is: a new contact may have had the list, and written here,
  // before that came. Those of others wait on, until they are too old.
  private async retryEarly(): Promise<void> {
    const now = Date.now();
    const held = this.data.early ?? [];
    const waits = held.filter((e) => now - e.at < EARLY_LASTS && !this.find(e.identity));
    if (waits.length === held.length) return;
    const known = held.filter((e) => now - e.at < EARLY_LASTS && this.find(e.identity));
    const { early: _early, ...rest } = this.data;
    await this.save(waits.length > 0 ? { ...rest, early: waits } : rest);
    for (const e of known) await this.accept(fromBase64(e.packet), true).catch(() => undefined);
  }

  // What a message from a contact's account says of the devices of either: which of this account's
  // lists they hold (`dv`), and their account's own list (`dl`), checked against the bundle that
  // came with it (`ak`) or the one kept, both from inside the conversation with their account, so
  // the ways to the endpoints it names follow it. One that says nothing of devices is from a chat
  // that knows nothing of them (an Erevos before, or theirs moved into or out of hidden chats): what
  // was kept of their devices goes, and nothing more goes to those.
  private async heardOf(contact: Contact, message: Message): Promise<Partial<Contact>> {
    if (message.dv === undefined) return { dv: undefined, list: undefined, endpoints: undefined, direct: undefined, listSent: undefined, listGiven: undefined, calls: undefined };
    const learned: Partial<Contact> = { dv: message.dv, calls: message.cl === 1 ? true : undefined };
    // They hold an older list than they said: given it again.
    if (contact.dv !== undefined && message.dv < contact.dv) Object.assign(learned, { listSent: 0, listGiven: undefined });
    if (!message.dl) return learned;
    const bundles = [...(message.ak ? [fromBase64Url(message.ak)] : []), ...(contact.bundle ? [fromBase64(contact.bundle)] : [])];
    for (const bundle of bundles) {
      const body = await verifyList(bundle, contact.identity, message.dl, contact.list?.n ?? 0).catch(() => null);
      if (!body) continue;
      if (body === 'same') learned.endpoints = withRoutes(contact.endpoints, message.dl.r);
      else {
        learned.list = { b: message.dl.b, s: message.dl.s, n: body.n };
        // An entry that names an account, this one or a contact's, is none of their endpoints.
        learned.endpoints = waysFor(contact.endpoints, body.d, message.dl.r, (id) => this.isAccount(id));
      }
      // On a linked device, where no conversation starts with it, the bundle that holds is kept here.
      if (this.link?.through) learned.bundle = toBase64(bundle);
      break;
    }
    return learned;
  }

  // Remembers which way one of a contact's messages came, by its tag ('' for their account).
  private noteCame(identity: string, tag: string, from: string): void {
    const key = `${identity}|${tag}`;
    this.cameFrom.delete(key);
    this.cameFrom.set(key, from);
    if (this.cameFrom.size > MAX_CAME) this.cameFrom.delete(this.cameFrom.keys().next().value!);
  }

  // A contact's message, as the chat takes it: `twice` when it was taken before.
  private receivedOf(contact: Contact, message: Message, timing: { timer: number; timerChanged: boolean; noShots: boolean; shotsChanged: boolean }, added: boolean, from: string, twice = false): Received {
    const { identity, request } = contact;
    const { text, tag, erase, got, read, voice, file, ask, call, group } = message;
    const online = this.heard(identity, message);
    const quiet = message.quiet === true;
    const due = message.due ?? 0;
    const sent = message.st ?? 0;
    const re = message.re ?? '';
    const react = message.react ?? null;
    const more = message.more ?? {};
    const seen = message.ls !== undefined && !!this.seenWay;
    return { kind: 'message', identity, text, tag, added, request, erase, got, read, voice, file, online, ask, seen, call, group, quiet, due, sent, re, react, more, from, twice, ...timing };
  }

  // A contact's newer prekeys (`ak`), given in their conversation: kept, and a new conversation
  // started with them at once, with nothing in it. Its first packet goes on its own, through the
  // relay (`renew`, see `pending`), and nothing waits for it: this chat goes on sending in the one it
  // sends in, and moves to the new one once they answer in it, as their Erevos does once it has the
  // first packet. Not on a linked device, whose conversations the primary starts; nor for one who
  // knows this chat by the space's identity, nor a request not accepted (who hears nothing back),
  // nor while their conversation's own first packet still waits.
  private async startedAgain(contact: Contact, message: Message): Promise<Pick<Contact, 'bundle' | 'bundleAt' | 'conversations' | 'renew'> | null> {
    if (!message.ak || this.link?.through || contact.ownIdentity || contact.request || contact.first) return null;
    let bundle: Uint8Array;
    try {
      bundle = fromBase64Url(message.ak);
      if (toHex(await core.bundleIdentity(bundle)) !== contact.identity) return null;
    } catch {
      return null;
    }
    if (toBase64(bundle) === contact.bundle) return null;
    const first = { from: '', relay: '', relayKey: '', text: '', tag: '', erase: null, timer: null, timerAt: 0, lasts: 0, got: [], read: [], voice: null, file: null, ...SAYS_NOTHING, call: null, group: null, pk: this.ownPacketKey(contact), ...this.saysDevices(contact), fa: firstAt() };
    const started = await core.startConversation(this.account, bundle, encodeMessage(first));
    const [sending, ...older] = contact.conversations;
    return { bundle: toBase64(bundle), bundleAt: Date.now(), conversations: [sending, toBase64(started.conversation), ...older].slice(0, MAX_CONVERSATIONS), renew: toBase64(started.packet) };
  }

  // Keeps until when a contact said their phone is open. Counted from when they said it, so a message
  // that waited on the relay says nothing any more; a clock ahead of this one's counts from now.
  private heard(identity: string, { on, onAt }: Message): number {
    if (on <= 0) return this.onlineUntil(identity);
    const now = Date.now();
    const until = Math.min(onAt || now, now) + on * 1000;
    if (until > now) this.online.set(identity, Math.max(until, this.online.get(identity) ?? 0));
    return this.onlineUntil(identity, now);
  }

  // `given`: a contact's message the primary passed on, already opened (lib/devices.ts).
  // `sealed`: whether the packet came sealed for this chat (lib/sealed-packet.ts), with `only` the
  // contact it was sealed for; unsaid for one a linked device passed on. Tried in the conversations
  // with their account, but on a linked device, which has none, and in those with the endpoints of
  // their account and, on a device, its own way to their account.
  // `old`: one that came unsealed to a queue read cheaply is tried only in those who do not seal yet.
  // `heard`: it came to this chat's own queue as it is now.
  private async open(packet: Uint8Array, given: { identity: string; plaintext: Uint8Array } | null = null, { only, sealed, old = false, heard = false }: { only?: string; sealed?: boolean; old?: boolean; heard?: boolean } = {}): Promise<Received> {
    const device = this.link?.through === true;
    const slots: Slot[] = [];
    for (const contact of this.data.contacts) {
      if (given && contact.identity !== given.identity) continue;
      if (only && contact.identity !== only) continue;
      if (given || !device) slots.push({ contact, way: null });
      if (given || !this.partOf(contact)) continue;
      if (contact.direct) slots.push({ contact, way: contact.direct });
      for (const way of contact.endpoints ?? []) if (way.conversations.length > 0) slots.push({ contact, way });
    }
    // One that came unsealed is tried first in the conversations of those who do not seal yet.
    const unsealed = sealed === false;
    const sealsIn = ({ contact, way }: Slot) => (way ?? contact).sealsIn;
    const ordered = unsealed ? [...slots.filter((s) => !sealsIn(s)), ...slots.filter(sealsIn)] : slots;
    let triedSealing = false;
    for (const slot of ordered) {
      if (unsealed && sealsIn(slot) && !triedSealing) {
        if (old || !this.mayTryUnsealed()) break;
        triedSealing = true;
      }
      const conversations = (slot.way ?? slot.contact).conversations;
      for (let i = 0; i < conversations.length; i++) {
        let opened: core.Opened;
        try {
          opened = given ? { conversation: fromBase64(conversations[i]), plaintext: given.plaintext } : await core.open(fromBase64(conversations[i]), packet);
        } catch {
          continue;
        }
        return this.heardIn(slot, i, opened, !!given, sealed, heard);
      }
    }
    return { kind: 'refused', reason: 'unknown' };
  }

  // What a packet that opened in a contact's conversation (`at`, of `slot`) brings: the
  // conversation kept moved past it, they written to where they read now, the chat's timer if set
  // later, and from their account what they say of devices.
  // Where they read is taken from it unless they said it before from a queue made later (`qa`): a
  // late copy of an older message, carried nearby or held, never sends this chat back to it.
  private async heardIn({ contact, way }: Slot, at: number, opened: core.Opened, given: boolean, sealed: boolean | undefined, heard = false): Promise<Received> {
    const message = decodeMessage(opened.plaintext);
    // Their Erevos reads post-quantum messages: from now on this conversation seals them.
    opened = await pqTurnedOn(opened, message);
    const timing = timerOf(message, contact);
    const times = { timer: timing.timer, timerAt: timing.timerAt };
    const direct = !!way && way === contact.direct;
    let updated: Contact;
    if (way && direct) updated = { ...contact, ...times, direct: heardWay(way, at, opened, message, sealed) };
    else if (way) updated = { ...contact, ...times, endpoints: contact.endpoints!.map((w) => (w === way ? heardWay(w, at, opened, message, sealed) : w)) };
    else {
      const others = contact.conversations.filter((_, j) => j !== at);
      const takes = takesPlace(message.qa, contact.qa);
      updated = {
        ...contact,
        sender: (takes && message.from) || contact.sender,
        ...(message.from && takes ? placeOf(message, contact) : {}),
        ...(takes && message.qa ? { qa: message.qa } : {}),
        ...(heard && this.ownAge ? { onNew: this.ownAge } : {}),
        // Send in the one they last sent in. Their answer also means they have the first packet.
        conversations: [toBase64(opened.conversation), ...others],
        first: '',
        ...times,
        sealTo: message.pk || contact.sealTo,
        // Sealed: they have this chat's key, which need not be said any more; unsealed: they may not.
        sealsIn: sealed ?? contact.sealsIn,
        // A ring queue they said: set it, or '' clears it (they no longer ring); absent keeps it.
        ringSender: message.rf === undefined || !takes ? contact.ringSender : message.rf || undefined,
        // Where they read on Nostr, or '' that they no longer do; absent keeps it.
        nostrTo: message.ns === undefined || !takes ? contact.nostrTo : message.ns || undefined,
        // Whether their Erevos reads packed messages, as their latest message says.
        packs: takes ? message.zp === true || undefined : contact.packs,
      };
    }
    const account = !given && (!way || direct);
    const renewed = account && !way ? await this.startedAgain(updated, message) : null;
    const learned = account && this.partOf(updated) ? await this.heardOf(updated, message) : null;
    const { contact: took, twice } = tookIn(this.seenIn(namedIn({ ...updated, ...renewed, ...learned }, message), message), message, this.link?.through === true);
    const next = withShots(cameThrough(took, message), timing.shots);
    await this.save(this.withContact(next));
    if (next.list && next.list.n !== contact.list?.n) await this.retryUnverified(contact.identity);
    if (!given) this.link?.opened(contact.identity, opened.plaintext);
    const from = way && !direct ? way.id : '';
    if (message.tag && !given) this.noteCame(contact.identity, message.tag, from);
    return this.receivedOf(next, message, timing.received, false, from, twice);
  }
}
