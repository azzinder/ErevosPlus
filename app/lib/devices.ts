// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { deleteChunks, type FileRef } from '../lock/attachment-files';
import { loadNotes, mergeNotes, notesSince, onNotesWritten, setNoteFile, stampOf as noteStamp, type Note, type NoteCame, type NotesChanges, type NotesPlace } from '../lock/myself-data';
import { keepDevicesFile, loadDevicesData, MAX_ASKS_SEEN, MAX_LEFT, MAX_OUTBOX, saveDevicesData, type Answer, type Asked, type Asking, type Brought, type DevicesData, type Left, type OutMark, type Peer, type Told } from '../lock/devices-data';
import { againAfter, MAX_BACK, type Blocked, type Contact, type OldFiller, type OwnList, type Relink, type Relinks, type Route } from '../lock/e2e-data';
import { checkedGroupData, MAX_HELD_GROUPS, type Group, type GroupMessage } from '../lock/group-data';
import { isReactionEmoji, isTag, WAITING, type Mark, type Message } from '../lock/history';
import { currentSpace } from '../lock/keys';
import { keepSyncFile, loadSyncData, saveSyncData } from '../lock/sync-data';
import { placeQueues, spaceQueues } from '../lock/queues-data';
import { hiddenHolder, type Holder } from '../lock/sealed-file';
import { loadHiddenData, loadSpaceData } from '../lock/space-data';
import { loadClip, saveClip, type VoiceRef } from '../lock/voice-clips';
import {
  bytesSource,
  dropFile,
  FileDamagedError,
  FileGoneError,
  FileMissingError,
  offerRef,
  onRelay,
  readFile,
  readOffer,
  sendFile,
  takeFile,
  uploadFile,
  watchTakenFiles,
  type FileFrom,
  type FileOffer,
  type TakenFiles,
} from './attachments';
import { currentCall } from './call';
import { decodeCall } from './call-signal';
import { callsElsewhere, onCallChange } from './calls';
import { carriedOf } from './chat-parts';
import { contactLink, type ContactCode } from './contact-code';
import * as core from './core';
import { fromBase64, randomBytes, sha256Bytes, toBase64, toHex, utf8Decode, utf8Encode } from './crypto';
import { unpacked } from './packing';
import { bodyOf, flagsHold, MAX_LISTED, nextList, PASS_LASTS, PASS_RENEW, signList, signPass, verifyList, verifyPass, type DeviceList } from './device-list';
import { fromBase64Url, OwnCodeError, toBase64Url, type Link, type Where } from './e2e';
import { isCopied, waysFor } from './endpoints';
import { currentGroupCall } from './group-call';
import { groupPartsOf } from './group-parts';
import type { GroupMember, Groups, GroupTransport, HeldGroups } from './groups';
import type { GroupSignal } from './group-signal';
import { t } from './i18n';
import { AGAIN_LASTS, checkAgain, makeAgain } from './link-again';
import { cleanDeviceName, linkCodeLink, linkSafetyCode, parseLinkCode, type LinkCode } from './link-code';
import {
  changedFields,
  changedGroups,
  changeEnvelopes,
  chatPartsOf,
  encodeEnvelope,
  encodeOne,
  groupEnvelopes,
  groupMarks,
  groupMessageKey,
  groupMirror,
  isCall,
  isKept,
  isSignal,
  isWorthTelling,
  lastKey,
  marksChanged,
  marksDigest,
  marksOf,
  MAX_TOOK,
  messagesAfter,
  mirrorGroups,
  mirrorMark,
  mirrorOf,
  onlyCame,
  Parts,
  readGroupEntries,
  readPack,
  syncedOf,
  tellsTheirs,
  TIMED,
  withoutPlace,
  wholeMarks,
  writePack,
  type ChatChange,
  type Deleted,
  type Envelope,
  MAX_NOTE_VOICE,
  type NoteSaid,
  type GivenAccounts,
  type GroupAsk,
  type GroupChange,
  type GroupEntry,
  type GroupMarked,
  type GroupMirror,
  type Json,
  type PackEntry,
  type Place,
  type Synced,
  type WholeGroup,
  heldMark,
  wayOf,
  withWay,
} from './link-wire';
import { LinkedCalls, type CallStep } from './linked-calls';
import { nearby } from './nearby';
import { orNostr, type ForNostr } from './nostr-chats';
import { joinPlaceChats, onForgetPlaceChats, placeChats } from './place-chats';
import { placeGroupsAt } from './place-groups';
import { readElsewhere } from './notice-count';
import { announceReceived } from './receiver';
import { GRACE, linkSpare } from './moves';
import { onPlaceMoved, onSpaceMoved, type MoveWhy } from './queue-move';
import { createQueue, deleteQueue, fromHex, isQueueNotFound, receiveMessage, relayKey, sameRelay, sendMessage, type Mark as RelayMark, type Relay } from './relay';
import { isSealedPacket, openPacket, packetKeys, sealedWith, sealPacket, type PacketKeys } from './sealed-packet';
import {
  blankSynced,
  buried,
  changedBy,
  EARLY_LASTS,
  goesFor,
  MAX_BEFORE,
  MAX_HELD,
  MAX_SEEN,
  removedAtOf,
  settled,
  siblingsFrom,
  stamped,
  stampOf,
  starts,
  withEarly,
  withErased,
  withRemoved,
  withRoutes,
  type Change,
  type Sibling,
  type Siblings,
} from './siblings';
import { contactTarget, joinSpaceChats, markOf, relayFor, sendSealed, spaceChats, type SpaceChats } from './space-chats';
import { spaceGroups, spaceGroupTransport } from './space-groups';
import { spareCode } from './spare';
import { isVoicePart, VoiceAssembler, type VoicePart } from './voice';
import { dropHeld, heldAfter, heldFor, sendWaiting, type SendPlace } from './waiting';
import { blockedFromLog, changesFor, checkedLookOf, setsFromLog, syncChangesOf } from './sync/contacts';
import { SyncLinks, type SyncHeard, type Who } from './sync/links';
import { onSettingChanged, settingCame, settingsNow } from './sync/settings';
import { isThere as isThereInLog, valueOf as syncValueOf, type Change as SyncChange, type Json as SyncJson, type Log as SyncLog } from './sync/log';
import type { Said as SyncSaid } from './sync/wire';
import type { ChunkWay } from './sync/chunks';
import { ChunkGiver, lanWay, type ChunkChannel, type ChunkOffer } from './sync/lan-chunks';
import { CollectionSync } from './collection-links';
import { laterChanges, laterFrom, laterGone, type Scheduled } from './sync/later';
import { ASK_KIND, askDone, asksOf, oldAsks, READ_KIND, readsOf, SMS_KIND, smsChanges, smsShared, smsView, type SharedSmsAll, type SmsAsk } from './sync/sms';
import { showMirrored } from './sms-mirror';
import { cameAt } from './later';

// The account's other devices (docs/linked-devices.md): the phone that holds the account (the
// primary) relays for a computer or a browser linked to it, and contacts see nothing new. Each link
// is a conversation of the core's own kind through the relay, between a key the device made for it
// and one the phone made, kept with the rest of the space's links (lock/devices-data.ts); what goes
// in it is lib/link-wire.ts's.
//
// On the primary, the chat (lib/e2e.ts, `Link`) says what it opened from contacts and what it sealed
// for them: each linked device is told, as the chat opened it, without where the contact reads. A
// message a device wrote comes as the chat sealed it there; the primary seals it for the contact as
// it came, saying where its own queue is, and keeps it in its history as its own. What the
// devices keep of the contacts (names, timers, looks, pictures, requests) goes both ways, a field at
// a time. On a linked device, the chat seals each message for the primary instead of the contact,
// and opens what the primary passes on as the contact's.
//
// What waits for a device, sealed, waits in its outbox until the relay takes it, so nothing is
// sealed twice for it. A device the outbox cannot hold any more for is not sealed for until it
// drained, so the link never skips more than its ratchet can: then it is sent the contacts and what
// of the history it missed.
//
// A photo or file passed on to devices, or a copy of one put on the relay for them, is left there
// when taken until each device told of it said it took it, and this phone took it too if it was
// still to: whichever comes last, the primary has it deleted there. A device unlinked takes nothing
// more, so what waited only for it goes then. What no one takes expires on the relay after 14 days.
//
// A contact's call rings on the phone and on each linked device, and a device calls through the
// account: lib/linked-calls.ts decides on the primary where each call signal goes. A call answered
// or turned down on one device stops ringing on the others, quietly.
//
// The account's groups, but public ones, are the devices' too (lib/groups.ts, GroupLink): the
// primary tells each device what changed in them, a group as it is now and the messages it was not
// told of yet, and does what a device asks in one, as its own. A device keeps them as the phone said
// them; it makes and joins no group, and group calls ring on the phone only.
//
// What is done later to a message told already reaches the devices too. In a chat, the phone's
// reactions, pins and votes go with what it sealed for the contact (`out`), the contact's with what
// came (`in`); a star or deleting on the phone only, which the contact is not told of, goes as a
// change (`changed`). In a group, the primary keeps what was done to each group's messages as last
// told (`marked`, in memory) and a mark of it for each device: what changed since goes to each
// device that has it, and a device that may not (after the space opened again with changes not told,
// or caught up) is told the group's marks whole.
//
// A linked device's own backup has the account's chats as they were but not the link, which no
// backup holds (lock/devices-data.ts): restored, they are read, not written in, and it says so once.
// Such a space links again: the chats the phone still has stay, with what came since, and the
// others go.
//
// The phone's own backup holds no link either, but it carries, for each linked device, what the
// phone needs to reach and recognise it, and a key the device gave the phone to be asked with
// (lock/e2e-data.ts Relinks). On a phone a backup was put back on, the devices of the phone it was
// made on show under From the backup; each one the holder asks there is asked, in a conversation
// that phone starts as the account with the device's endpoint, signed with the account's key and
// with the device's (lib/link-again.ts). The device shows the ask, and once Link again is tapped
// on it, sends that phone the code of a new link in it, which the phone links as if it read it:
// fresh keys, no code to read or compare, the chats kept and what came since brought. Linked
// again, the device lets go of the link before, its endpoint and its key, so the phone the backup
// came from, or another with the same backup, can ask it nothing more.
//
// Each linked device also has an endpoint of its own (docs/multi-device.md): a core account it
// makes once linked, never the key of its link, and says to the phone (`endpoint`). The phone
// signs, with the account's own key, the list of its devices' endpoints (lib/device-list.ts), again
// each time a device says one or is unlinked, or as the space opens if the list and the links
// differ (as on another phone a backup was put back on), and tells each device the list and the
// account's bundle (`list`), with where each of the others reads (`routes`). A device keeps the
// list once that bundle is the account's it was linked to and the bundle's key signed it. A device
// from before says no endpoint and is in no list, and a phone from before leaves the endpoint
// alone: either keeps passing on as before. A device's backup put back elsewhere lets go of its
// endpoint as it opens. Only the account's own devices are given the list in this version; a build
// whose core cannot sign does none of it.
//
// The devices the list names reach each other directly too, endpoint to endpoint (lib/siblings.ts),
// so they see each other's messages and changes with the phone off: what a device seals for a
// contact goes to the phone (`send`) and to each of them (`out`), and a change it makes to a
// contact to the phone and to each of them (`set`), with when it was made, so changes made at once
// settle the later first; the phone settles them so too, and says when with the contacts. Contacts'
// messages still come only through the phone, and what only the phone can do (adding a contact, the
// groups, linking) still goes to it alone.
//
// Each side of a link, and of two devices', gives the other a key for the packets it sends back
// (`pk`), and once it has the other's, seals each packet with it (lib/sealed-packet.ts), as the
// chat does for contacts: to the relay they look like any contact's, and each opens in its own
// conversation only. A version from before says none, and is sealed nothing.
//
// Each packet tells the relay what it carries (lib/relay.ts, Mark), for a web app's notice while it
// is closed, a linked one's too. On the primary, a contact's message passed on to the devices (`in`)
// is a message, a voice message on its last part only, but quiet to a device the contact wrote it
// to as well, which counts the one that came from them (copiedTo); a call's offer rings, counted
// as a call; a member's message in a group goes in an envelope of its own, a message, as the relay
// counts one for each packet. The rest between the devices is quiet, and a packet waiting in a
// device's outbox keeps how it goes (`marks`). What a device wrote goes on to the contact marked
// as the chat marks its own, a voice message once: on its last part, but for one that waits whole
// after a part could not go, which is counted as it goes. To the phone, all a device sends is
// quiet, as it goes to the account's own queue (lib/space-chats.ts, sentMark); what it writes to a
// contact itself goes to them marked as the phone's own would.
//
// The phone gives every device the space's own Matrix, XMPP and Nostr accounts too, once the codes
// match, again as they change (followAccounts, as the log's records of kind `account` say who each
// is), or when asked again later (`accounts`); one the log no longer names, the devices let go of
// (accountsFrom). A hidden place's links give
// the place's own, never the space's. lib/linked-accounts.ts gives and brings them, and registers
// itself here (handAccounts), so this file need not know the networks: the device signs in as a
// new device of each, never a copy of the phone's, and lets go of what it brought once unlinked,
// as it lets go of the chats.
//
// Three turns keep it straight: the chat's own (E2E), which may wait for this file's; this file's
// (`run`), for the links and their keys, which never waits for the chat; and the work a message
// brings (`act`: the history, sealing for contacts, the relay's file store), which waits for both.
// A call's signals are work of their own (`ring`), which cannot wait behind the history; so are
// the accounts given or brought (`aside`), which messages cannot wait behind.

/** The most devices one account links: as many as its device list names. */
export const MAX_DEVICES = MAX_LISTED;
// How long a code shown on a device answers, how long a message sealed here waits to be kept as
// sent before its devices are told, and how big a pack of the history grows.
const OFFER_LASTS = 30 * 60_000;
const ECHO_LASTS = 10 * 60_000;
const ECHO_EVERY = 1500;
const PACK_BYTES = 1024 * 1024;
// How often the links are looked at while the space is open, and the first and longest wait after
// the relay could not take what waits.
const TICK = 60_000;
const RETRY = 5000;
const RETRY_MOST = 5 * 60_000;
// Messages a device wrote that could not go to the contact yet (not the ones the chat keeps), and how often each is tried.
const MAX_LATER = 50;
const LATER_TRIES = 5;
// How long a photo or file left on the relay for devices is kept track of: the relay drops it after 14 days.
const LEFT_LASTS = 15 * 24 * 60 * 60_000;
// How long a call answered or turned down on another device is remembered, should it ring here only after.
const ENDED_LASTS = 2 * 60_000;
// How often the primary empties the queues of the places that fill its device list, and the most it takes from one at a time.
const DRAIN_EVERY = 60 * 60_000;
// How often each side says how far it has the account's log (lib/sync/), besides each change.
const SYNC_EVERY = 10 * 60_000;
// The whole log goes as a file on the relay once larger than this (more than one packet), and is
// taken back up to this size.
const SNAP_OVER = 12 * 1024;
const SNAP_MOST = 64 * 1024 * 1024;
// The groups' MLS state handed on (docs/sync.md, S6) is told again this often till the other device
// says it took it; what came for the groups meanwhile waits here, this much of it at most.
const HAND_AGAIN = 10 * 60_000;
const GROUPS_WAITING = 500;

// What came on the phone for the groups while their state was on its way (S6): an ask of a device
// (`from`), a group message, or a contact's group signal.
type GroupsWaiting = { k: 'group'; from: string; id: string; ask: GroupAsk } | { k: 'gpkt'; p: string } | { k: 'gsig'; c: string; s: GroupSignal; r: boolean };

// The groups' state handed here cannot be taken, ever: as it is, or too large.
class HeldError extends Error {}

/** Unlinking the device the groups are held on, or unlinking this one that holds them (S6): `unlink` again with `force` to all the same. */
export class GroupsHeldError extends Error {}
// How often the phone looks whether the accounts on other networks changed, for the devices.
const ACCOUNTS_EVERY = 60_000;
const DRAIN_MOST = 1000;
// After the phone's queue moved for a contact deleted or blocked, a new device list at most this often.
const RESIGN_EVERY = 60 * 60_000;
// A device linked again after a backup was put back on another phone is brought the history from a
// day before it last heard from the phone it was linked to, should their clocks differ.
const AGAIN_BEFORE = 24 * 60 * 60_000;
// How often the phone asks a device that gave no key to be asked to link again with for one.
const RELINK_ASK_EVERY = 24 * 60 * 60_000;
const CONTACT_PREFIX = 'contact:';
// What a message a device wrote may say that need not be tried again: where it reads, that it is
// open, the timer (which went with the contact here), and what came or was read (held for the next).
const QUIET = new Set(['from', 'relay', 'relayKey', 'spare', 'text', 'tag', 'timer', 'timerAt', 'sh', 'lasts', 'got', 'read', 'on', 'onAt', 'ask', 'ls', 'quiet', 'due']);

/** What a device was told of a contact's devices (`way`), in short (Peer.ways): enough to tell whether it changed since. */
export function wayDigest(way: { dv: number; list?: DeviceList }): string {
  return toHex(sha256Bytes(utf8Encode(JSON.stringify([way.dv, way.list?.s ?? '', way.list?.r ?? {}])))).slice(0, 16);
}

/** Which this space is: the phone that holds the account and has devices linked, a linked device, or neither. */
export type Role = 'primary' | 'linked' | null;

/** A device as Linked devices shows it: on the primary each one; on a linked device, the phone. */
export type DeviceInfo = { id: string; name: string; since: number; heard: number; linked: boolean; history: { done: number } | null };

/** What the links changed in the history: messages deleted, of a chat (`peer`) or one of its messages (`tag`). */
export type LinkedChange = { gone: { peer: string; tag?: string }[] };

/** What of the history a device is brought over: from `since` (milliseconds, 0 for all), or none (null), with photos and files or not. `accounts` is of before: the accounts go always now. */
export type HistoryChoice = { since: number | null; files: boolean; accounts?: boolean };

/**
 * On a phone a backup was put back on: a device of the phone it was made on, which can be asked to
 * link again (Links.askAgain): its endpoint's id, its name, when it was linked there, when it was
 * asked here (0 for not yet), and whether it said yes.
 */
export type AgainInfo = { id: string; name: string; since: number; asked: number; said: boolean };

/** On a linked device: its phone, put back from a backup, asking it to link again: the name it gives, when it asked, and whether yes was said here. */
export type AskedHere = { name: string; made: number; said: boolean };

/**
 * What gives and brings the accounts on other networks of a space, or of its hidden place `pocket`
 * with that place's key (lib/linked-accounts.ts): on the primary, those it has, to give a device;
 * on a linked device, brings those the phone gave, as far as it can now, answering what is still
 * to bring, what it brought and what went wrong; and once unlinked, lets go of those it brought.
 */
export type AccountsHand = {
  give(space: number, key: Uint8Array, pocket: number | null): Promise<GivenAccounts>;
  /** On the primary: who each account is, as the log follows them: none (null) where there is none, unsaid where not known now. */
  who(space: number, key: Uint8Array, pocket: number | null): Promise<AccountsWho>;
  /** `had`: those brought from the phone before, which one given in its place replaces. */
  take(space: number, key: Uint8Array, given: GivenAccounts, pocket: number | null, had?: Brought): Promise<{ left: GivenAccounts; brought: Brought; gone?: (keyof Brought)[]; problems: string[] }>;
  letGo(space: number, key: Uint8Array, brought: Brought, pocket: number | null): Promise<void>;
};

/** Who the accounts on other networks are (AccountsHand.who): the Matrix user, the XMPP address, the Nostr key's public half. */
export type AccountsWho = { matrix?: string | null; xmpp?: string | null; nostr?: string | null };

/** The networks whose accounts the log follows, each a record of kind `account` by its name, who it is in field `v`. */
const NETWORKS = ['matrix', 'xmpp', 'nostr'] as const;

let hand: AccountsHand | null = null;

// This device's fast channel for the chunks of large files on the same Wi-Fi (lib/chunk-channel.ts), none until set.
let chunkHand: ChunkChannel | null = null;
let giver: ChunkGiver | null = null;

/** Has `channel` give and take the chunks of large files on the same Wi-Fi (set once where there is one). */
export function handChunks(channel: ChunkChannel | null): void {
  chunkHand = channel;
  giver = channel ? new ChunkGiver(channel) : null;
}

/** Has `next` give and bring the accounts (lib/linked-accounts.ts sets it once). */
export function handAccounts(next: AccountsHand | null): void {
  hand = next;
}

/**
 * What gives the phone's SMS to the space's linked devices and does what they ask of them
 * (lib/sms-share.ts, docs/sync.md S8), so this file need not know the phone's SMS.
 */
export type SmsHand = {
  /** On the phone: its SMS as they go to the devices of the space now; null while they do not go, undefined when they cannot be read now. `known`: the numbers of the space's contacts. */
  shared(space: number, key: Uint8Array, known: readonly string[]): Promise<SharedSmsAll | null | undefined>;
  /** On the phone: sends what a device asked, once ever; 'old' for one asked too long ago. */
  send(space: number, key: Uint8Array, ask: SmsAsk): Promise<'sent' | 'failed' | 'old'>;
  /** On the phone: a conversation read on a device, marked read here too. */
  read(address: string): Promise<void>;
  /** Calls `changed` as the phone's SMS change, once they settle; returns how to stop. */
  watch(changed: () => void): () => void;
};

let smsHand: SmsHand | null = null;

/** Has `next` give the phone's SMS to the devices (lib/sms-share.ts sets it once). */
export function handSms(next: SmsHand | null): void {
  smsHand = next;
}

/** On a linked device: the accounts the phone gave that it still waits to bring, those it brought, and what went wrong last. */
export type AccountsHere = { left: GivenAccounts; brought: Brought; problems: string[] };

const isEmpty = (o: object | undefined) => !o || Object.keys(o).length === 0;

// Where this side reads, and whether the relay's key is known (`keyed`): asked of it and answered,
// none or one. Not known, the place's key says none, which may not be so.
type Here = { own: Relay; sends: Relay; place: Place; where: Where; keyed: boolean };
// What is sealed for: a link, or another device directly.
type Sealable = { conversation: string; outbox: string[]; marks?: Record<string, OutMark>; told: string; behind: number; key?: string; sealTo?: string };
type Taken = Awaited<ReturnType<Link['open']>>;
// A photo or file told of with an envelope, left on the relay for the devices it goes to; `phone`: this phone is still to take it too.
type Leaving = { from: FileFrom; phone: boolean };
type Pending = { code: LinkCode; bundle: Uint8Array; account: Uint8Array; device: string; safety: string };

/** A hidden place, by its space and pocket. */
export type PlaceAt = { space: number; pocket: number };

// Who listens, to the open space's links (no place) or to a hidden place's: each hears only its own.
const listeners = new Set<{ at: PlaceAt | null; listener: (change: LinkedChange) => void }>();

/** Calls `listener` each time the links of the open space, or of the hidden place `at`, changed the history or the devices. Returns how to stop. */
export function onLinked(listener: (change: LinkedChange) => void, at: PlaceAt | null = null): () => void {
  const entry = { at, listener };
  listeners.add(entry);
  return () => {
    listeners.delete(entry);
  };
}

const isText = (v: unknown): v is string => typeof v === 'string';
const isObject = (v: unknown): v is Json => !!v && typeof v === 'object' && !Array.isArray(v);
const tagsOf = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isTag) : []);
const peerOf = (identity: string) => `${CONTACT_PREFIX}${identity}`;

// What a chat's message (`m`, as lib/e2e.ts says it) carries, as the relay is told: one the chat
// keeps is a message, a voice message on its last part only; a call's offer rings; all else is
// quiet.
function relayMarkOf(m: Json): RelayMark {
  if (isCall(m)) return markOf('', decodeCall(m.call));
  if (!isKept(m)) return 'quiet';
  const voice = m.voice;
  return !isObject(voice) || (typeof voice.parts === 'number' && voice.part === voice.parts - 1) ? 'message' : 'quiet';
}

// How a packet for a device goes, kept with it in the outbox: nothing for one that is quiet.
function outMarkOf(mark: RelayMark): OutMark | undefined {
  return mark === 'quiet' ? undefined : mark;
}

// A peer without what of its outbox went, nor the marks of those.
function withoutSent<T extends Sealable>(peer: T, sent: Set<string>): T {
  const outbox = peer.outbox.filter((p) => !sent.has(p));
  const { marks, ...rest } = peer;
  const left = marks ? Object.entries(marks).filter(([p]) => !sent.has(p)) : [];
  return { ...rest, outbox, ...(left.length > 0 ? { marks: Object.fromEntries(left) } : {}) } as T;
}

function parse(plaintext: Uint8Array): Json | null {
  try {
    // A packed message (lib/packing.ts) as it was: the linked devices get it as JSON, as before.
    const value: unknown = JSON.parse(utf8Decode(unpacked(plaintext)));
    return isObject(value) ? value : null;
  } catch {
    return null;
  }
}

function voiceOf(v: unknown): VoicePart | null {
  if (!isObject(v) || !isText(v.data)) return null;
  try {
    const part = { id: v.id, part: v.part, parts: v.parts, ms: v.ms, data: fromBase64(v.data), ...(v.talk === true ? { talk: true } : {}) } as Partial<VoicePart>;
    return isVoicePart(part) ? part : null;
  } catch {
    return null;
  }
}

// The offer of a file not taken yet, from where it waits on the relay.
function offerOf(ref: FileRef): FileOffer | null {
  if (!ref.from) return null;
  const { id: _id, count: _count, from, ...shared } = ref;
  // The pieces of a photo that came in Nostr wraps are on this phone only; a file on a file server is for any of them to take.
  if (from.via === 'nostr') return null;
  return readOffer({ ...shared, relay: from.relay, ids: from.ids, ...(from.via ? { via: from.via, url: from.url, x: from.x } : {}) });
}

const fromOf = (offer: FileOffer): FileFrom => ({ relay: offer.relay, ids: offer.ids, ...(offer.via ? { via: offer.via, ...(offer.url ? { url: offer.url } : {}), ...(offer.x ? { x: offer.x } : {}) } : {}) });
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const isTimed = (field: string): field is (typeof TIMED)[number] => (TIMED as readonly string[]).includes(field);
const contactsOf = (contacts: ((c: Contact[]) => Contact[]) | null) => (contacts ? { contacts } : {});
const removedOf = (removed: Record<string, number>) => ({ removed: Object.keys(removed).length > 0 ? removed : undefined });
// The links without the account's other devices reached directly: unlinked, or met as another
// endpoint.
function withoutSiblings(data: DevicesData): DevicesData {
  const { siblings: _siblings, ...rest } = data;
  return rest;
}

// A key this side gives another for the packets it sends here.
const newPacketKey = () => toBase64Url(randomBytes(32));
// The links without an ask to link again (Links.linkAgain), or with only the asks `asked` keeps.
function withoutAsking(data: DevicesData): DevicesData {
  const { asking: _asking, ...rest } = data;
  return rest;
}
function withAsked(data: DevicesData, asked: Asked[]): DevicesData {
  const { asked: _asked, ...rest } = data;
  return asked.length > 0 ? { ...rest, asked } : rest;
}
// What the contacts become with two changes, one after the other.
const both = (a: ((c: Contact[]) => Contact[]) | null, b: ((c: Contact[]) => Contact[]) | null) => (a && b ? (c: Contact[]) => b(a(c)) : (a ?? b));

// Who the notes go to: a linked device, or the phone (`sibling` false), or another device reached directly.
type NotesTarget = { id: string; sibling: boolean };

// What of the notes goes in one envelope: by about how long it is (a voice message's sound, base64,
// some 11 bytes a millisecond at most), a long voice message alone filling one; never two changes
// with the same stamp apart, as a device is told up to a stamp.
const NOTES_BATCH = 400_000;
function notesBatches({ notes, gone }: NotesChanges): { notes: Note[]; gone: { id: string; v: number }[]; v: number }[] {
  const items = [...notes.map((note) => ({ v: noteStamp(note), note })), ...gone.map((g) => ({ v: g.v, gone: g }))].sort((a, b) => a.v - b.v);
  const batches: { notes: Note[]; gone: { id: string; v: number }[]; v: number }[] = [];
  let batch: (typeof batches)[number] | null = null;
  let size = 0;
  for (const item of items) {
    const long = 'note' in item && item.note ? 300 + item.note.text.length * 3 + (item.note.voice ? item.note.voice.ms * 11 : 0) + (item.note.file ? 600 : 0) : 60;
    if (!batch || (size + long > NOTES_BATCH && item.v !== batch.v)) {
      batch = { notes: [], gone: [], v: item.v };
      batches.push(batch);
      size = 0;
    }
    if ('note' in item && item.note) batch.notes.push(item.note);
    else if ('gone' in item && item.gone) batch.gone.push(item.gone);
    batch.v = item.v;
    size += long;
  }
  return batches;
}

/** The links of one space's chat to the account's other devices. */
export class Links implements Link, TakenFiles {
  private data: DevicesData;
  private turn: Promise<unknown> = Promise.resolve();
  private acts: Promise<unknown> = Promise.resolve();
  private readonly parts = new Parts();
  // The parts of voice messages: on the primary, of those a device wrote; on a device, of those the primary sent.
  private readonly voiceParts = new VoiceAssembler();
  private readonly voiceLate = new Set<string>();
  // On the primary: a device being linked, between its code and Link.
  private pending: Pending | null = null;
  // On the primary: messages sealed for contacts that the chat keeps, until it keeps them as sent.
  private readonly echoes = new Map<string, { c: string; tag: string; m: Json; at: number }>();
  private echoTimer: ReturnType<typeof setTimeout> | null = null;
  private later: { c: string; m: Json; tries: number; shared: boolean }[] = [];
  // On the primary: where each call goes. On either: calls answered or turned down on another device, should they ring here after.
  private readonly calls = new LinkedCalls();
  private readonly endedThere = new Map<string, { declined: boolean; at: number }>();
  private rings: Promise<unknown> = Promise.resolve();
  private stopCalls: (() => void) | null = null;
  private stopMoves: (() => void) | null = null;
  private stopNotes: (() => void) | null = null;
  private stopSettings: (() => void) | null = null;
  // The accounts given or brought (lib/linked-accounts.ts), one after another, apart from other
  // work: a sign-in or a key backup's keys may take long, and messages cannot wait for them. On a
  // linked device, what went wrong last bringing them.
  private accounts: Promise<unknown> = Promise.resolve();
  private accountsProblems: string[] = [];
  // The groups' state on its way between devices (S6): what came for them meanwhile, here till they
  // are held again; what went wrong moving them last; whether this device said it can hold them.
  private groupsWaiting: GroupsWaiting[] = [];
  private groupsProblem: string | null = null;
  private saidCan = false;
  // When the phone last looked who the accounts are (followAccounts); none yet, so the first tick does.
  private accountsLooked = 0;
  // Where each linked device gives the chunks of large files on the same Wi-Fi, as it last said (`chunks`).
  private readonly chunkOffers = new Map<string, ChunkOffer>();
  // On a linked device: the contacts deleted (1) or blocked (2) here, until the phone is told.
  private readonly deletions = new Map<string, Deleted>();
  // The space's groups, and which of them go to the devices; on the primary, whether telling them is
  // under way, and whether a message could not go to them yet.
  private groups: { groups: Groups; transport: GroupTransport; shared: (id: string) => boolean } | null = null;
  private stopGroups: (() => void) | null = null;
  private telling = false;
  private groupsLate = false;
  // On the primary: what was done to each group's messages as last told, and its mark (marksDigest).
  private readonly marked = new Map<string, { marks: Map<string, GroupMarked>; digest: string }>();
  // Where this side reads, as last found, said with what goes; and the relay's key, asked once for each relay.
  private at: Place | null = null;
  // The queue the account's contact link names (lib/queue-move.ts): the own queue's while it is the link's.
  private linkSender = '';
  // The keys of packet keys (lib/sealed-packet.ts), by the packet key.
  private readonly packetKeys = new Map<string, PacketKeys>();
  // On the primary: when a device set what it changed of a contact, until the devices are told.
  private readonly stamps = new Map<string, { at: number; change: Change; added?: true }>();
  private keyOf: { url: string; key: string } | null = null;
  // On the primary: when each device that gave no key to be asked to link again with was asked for one.
  private readonly relinkAsked = new Map<string, number>();
  // On the primary: when the queues of the places that fill the device list were last emptied, and
  // whether a device is still to be told what is known of some contacts' devices (tellWays).
  private drainedAt = 0;
  private waysLeft = false;
  private flushing: Promise<void> | null = null;
  private again = false;
  private retries = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private closed = false;
  // Chat with myself (tellNotes): the work on the notes, apart from the rest; whether some are still
  // to be told, or a photo or file of a note that came is still to be taken; and those gone from the
  // relay.
  private notesWork: Promise<unknown> = Promise.resolve();
  private notesLeft = true;
  private noteFilesLeft = true;
  private notesLost = new Set<string>();
  private readonly space: number;
  private readonly key: Uint8Array;
  private readonly chats: SpaceChats;
  // Whose links these are: the space's, or a hidden place's (`pocket`), which links on its own,
  // sealed with its own key, and of which nothing goes to the space or its devices.
  private readonly holder: Holder;
  private readonly pocket: number | null;
  // The account's log (lib/sync/, docs/sync.md), said in these links; when it was last told.
  private readonly syncs: SyncLinks;
  private syncSaid = Date.now();
  // The place's Collection on the account's other devices (lib/collection-links.ts), and when it was last looked at.
  private readonly collection: CollectionSync;
  private collectionLooked = 0;
  private collectionWork: Promise<unknown> = Promise.resolve();
  // What is sent for later, as the place's log says it (lib/sync/later.ts): written and taken in turn.
  private laterWork: Promise<unknown> = Promise.resolve();
  // The phone's SMS on the devices (lib/sync/sms.ts), the space's links only: on the phone, given
  // and what the devices ask done, in turn, when last looked at, and whether to look again once that
  // look is done; on a linked device, whether they show here.
  private smsWork: Promise<unknown> = Promise.resolve();
  private smsLooked = 0;
  private smsAgain = false;
  private smsLooking = false;
  private smsShowing = false;
  private stopSms?: () => void;

  private constructor(space: number, key: Uint8Array, chats: SpaceChats, data: DevicesData, pocket: number | null) {
    this.space = space;
    this.key = key;
    this.chats = chats;
    this.data = data;
    this.pocket = pocket;
    this.holder = pocket === null ? 'space' : hiddenHolder(pocket);
    this.syncs = new SyncLinks({
      load: () => loadSyncData(space, key, this.holder).then((d) => d.log),
      save: (log) => saveSyncData(space, key, { log }, this.holder),
      send: (to, said) => this.sendSync(to, said),
      who: () => this.syncWho(),
    });
    this.collection = new CollectionSync({
      place: { holder: this.holder, space, key },
      write: (changesOf) => this.syncs.writeFrom(changesOf),
      peers: () => (this.data.primary ? [this.data.primary.id] : this.linked().map((d) => d.id)),
      ask: async (peer, ids) => void (await this.say({ k: 'cfetch', ids }, peer)),
      answer: async (peer, list) => void (await this.say({ k: 'cfile', list }, peer)),
      upload: async (ref) => {
        const at = await this.here();
        if (!at) throw new FileMissingError();
        return uploadFile(at.own, ref);
      },
      take: async (ref, offer) => {
        const at = await this.here();
        if (!at) throw new FileMissingError();
        await takeFile(at.own, { ...ref, from: { relay: offer.relay, ids: offer.ids } }, undefined, false);
      },
      ways: () => this.chunkWays(),
      offer: (peer, ids) => this.offerChunks(peer, ids),
    });
  }

  /**
   * The links of a space's chats (`chats`), sealed with `key`; from now on the chat reaches the
   * devices through them. With `pocket`, those of the hidden place there, its chats and key the
   * place's own.
   */
  static async open(space: number, key: Uint8Array, chats: SpaceChats, tick = TICK, pocket: number | null = null): Promise<Links> {
    const holder: Holder = pocket === null ? 'space' : hiddenHolder(pocket);
    const data = await loadDevicesData(space, key, holder);
    // The space's value in the file, so the file is there whichever space or place links.
    if (pocket === null) await keepDevicesFile(space, key, data).catch(() => undefined);
    if (pocket === null) await keepSyncFile(space, key, await loadSyncData(space, key)).catch(() => undefined);
    const links = new Links(space, key, chats, data, pocket);
    // A space that is no linked device has no endpoint: one there is a linked device's backup put
    // back elsewhere, without its link, and goes before anything is sealed, so two never seal as one.
    if (!links.data.primary) await chats.e2e.dropEndpoint().catch(() => undefined);
    // So do the other devices it met as an endpoint it no longer has, as when a backup with another
    // was put back here.
    const { siblings } = links.data;
    if (siblings && (!links.data.primary || siblings.of !== chats.e2e.endpoint()?.id)) await links.save(withoutSiblings(links.data));
    chats.e2e.useLink(links);
    links.stopCalls = onCallChange(() => links.callChanged());
    links.stopMoves =
      pocket === null
        ? onSpaceMoved(async (_queue, _old, why) => links.spaceMoved(why))
        : onPlaceMoved(async (at, moved, _queue, _old, why) => {
            if (at === space && moved === pocket) links.spaceMoved(why);
          });
    links.stopNotes = onNotesWritten((place) => links.notesWritten(place));
    // The settings the devices share (lib/sync/settings.ts) go in the space's log only.
    if (pocket === null) links.stopSettings = onSettingChanged((id, value) => links.syncSetting(id, value));
    // So do the phone's SMS (lib/sync/sms.ts): the phone gives them as they change, a device shows them.
    if (pocket === null) {
      links.stopSms = smsHand?.watch(() => void links.smsShare().catch(() => undefined));
      if (links.data.primary) void links.smsShow().catch(() => undefined);
    }
    links.tickTimer = setInterval(() => links.tick(), tick);
    links.tick();
    links.act(() => links.listsAtOpen());
    // What the phone gave that was not brought yet: tried again each time the space opens.
    if (links.data.given) void links.aside(() => links.bringGiven());
    return links;
  }

  /** Stops, once the space closes. */
  close(): void {
    this.closed = true;
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.echoTimer) clearTimeout(this.echoTimer);
    this.stopCalls?.();
    this.stopMoves?.();
    this.stopNotes?.();
    this.stopSettings?.();
    this.stopSms?.();
    if (this.smsShowing) {
      this.smsShowing = false;
      showMirrored(null, null);
    }
    this.collection.close();
    this.stopGroups?.();
    this.groups?.groups.useLink(null);
    this.chats.e2e.useLink(null);
  }

  private run<T>(call: () => Promise<T>): Promise<T> {
    const next = this.turn.catch(() => undefined).then(call);
    this.turn = next;
    return next;
  }

  // Work a message brought, one after another, after the turn that brought it; none once closed,
  // so a place's links do nothing more on its relay once it closes.
  private act(call: () => Promise<unknown>): void {
    this.acts = this.acts
      .catch(() => undefined)
      .then(() => (this.closed ? undefined : call()))
      .catch(() => undefined);
  }

  // A call's signal, one after another, apart from other work: a call cannot wait for the history to go.
  private ring(call: () => Promise<unknown>): void {
    this.rings = this.rings
      .catch(() => undefined)
      .then(call)
      .catch(() => undefined);
  }

  // The accounts given or brought, one after another, apart from other work.
  private aside(call: () => Promise<unknown>): Promise<unknown> {
    this.accounts = this.accounts
      .catch(() => undefined)
      .then(call)
      .catch(() => undefined);
    return this.accounts;
  }

  /** Waits for the work under way, as the checks do. */
  async settled(): Promise<void> {
    for (let i = 0; i < 20; i++) {
      const [turn, acts, rings, accounts, flushing, notes] = [this.turn, this.acts, this.rings, this.accounts, this.flushing, this.notesWork];
      await Promise.all([turn.catch(() => undefined), acts, rings, accounts, flushing?.catch(() => undefined), notes]);
      if (turn === this.turn && acts === this.acts && rings === this.rings && accounts === this.accounts && flushing === this.flushing && notes === this.notesWork) return;
    }
  }

  private async save(data: DevicesData): Promise<void> {
    this.data = data;
    await saveDevicesData(this.space, this.key, data, this.holder);
  }

  // Tells the screens of these links' own chats that the history or the devices changed: the
  // space's, or the hidden place's only, so the space hears nothing of a place.
  private announce(change: LinkedChange = { gone: [] }): void {
    const at = this.pocket === null ? null : { space: this.space, pocket: this.pocket };
    for (const { at: of, listener } of listeners) if (of === at || (of && at && of.space === at.space && of.pocket === at.pocket)) listener(change);
    if (this.pocket === null) announceReceived();
  }

  get through(): boolean {
    return this.data.primary !== null;
  }

  role(): Role {
    if (this.data.primary) return 'linked';
    return this.data.devices.some((d) => d.linked) ? 'primary' : null;
  }

  /** On the primary its devices, linked or still being linked; on a linked device the phone. */
  devices(): DeviceInfo[] {
    const info = ({ id, name, since, heard, linked, history }: Peer): DeviceInfo => ({ id, name, since, heard, linked, history: history && { done: history.done } });
    return this.data.primary ? [info(this.data.primary)] : this.data.devices.map(info);
  }

  /**
   * Whether this space's chats are a linked device's copy, restored from its backup: not linked, and
   * its contacts all as a linked device keeps them (with no conversation of their own), its groups
   * with no state. They can be read, not written in, until it is linked again.
   */
  copied(): boolean {
    if (this.role() !== null) return false;
    const { e2e } = this.chats;
    const contacts = e2e.contacts();
    const groups = this.groups?.groups;
    if (contacts.length === 0 && (groups?.all().length ?? 0) === 0) return false;
    return contacts.every((c) => !e2e.record(c.identity)?.conversations[0]) && !groups?.hasState();
  }

  /** In a linked device's copy (copied): whether to say so, once. */
  sayCopy(): Promise<boolean> {
    return this.run(async () => {
      if (this.data.copySaid || !this.copied()) return false;
      await this.save({ ...this.data, copySaid: true });
      return true;
    });
  }

  /** On a linked device: the account's contact link, to show as this chat's own. */
  accountLink(): string | null {
    return this.data.primary && this.data.link ? this.data.link : null;
  }

  /** On a linked device being linked: the code the phone shows, once it answered. */
  answerCode(): string | null {
    return this.data.answer?.code ?? null;
  }

  // Where this side reads: the space's relay and queue, and the relay's key. Null without them.
  private async here(): Promise<Here | null> {
    const data = this.pocket === null ? await loadSpaceData(this.space, this.key) : await loadHiddenData(this.space, this.pocket, this.key);
    const url = data.url.trim();
    if (!url || !data.ownQueue) return null;
    const own: Relay = { url, token: data.token.trim() || undefined };
    const sends = relayFor(url, data.token, data.via, data.viaToken) ?? own;
    if (this.keyOf?.url !== url) {
      const key = await relayKey(own).catch(() => undefined);
      if (key !== undefined) this.keyOf = { url, key: key ? toBase64Url(key) : '' };
    }
    const keyed = this.keyOf?.url === url;
    const rk = keyed ? this.keyOf!.key : '';
    const place: Place = { sender: data.ownQueue.senderHex, relay: url, relayKey: rk, spare: this.chats.e2e.spare() };
    this.at = place;
    const queues = this.pocket === null ? spaceQueues(this.space, this.key) : placeQueues(this.space, this.pocket, this.key);
    const link = (await queues.load().catch(() => null))?.link;
    this.linkSender = link && sameRelay(link.url, url) ? link.queue.senderHex : place.sender;
    return { own, sends, place, where: { relay: url, relayKey: rk }, keyed };
  }

  // Hidden chats keep nothing waiting as the space's do (lib/waiting.ts, `hidden`).
  private sendPlace(here: Here | null): SendPlace {
    const hidden = this.pocket === null ? {} : { hidden: true };
    if (!here) return { sends: null, own: null, senderHex: '', here: { relay: '', relayKey: '' }, ownKey: '', relayUp: false, ...hidden };
    return { sends: here.sends, own: here.own, senderHex: here.place.sender, here: here.where, ownKey: here.where.relayKey, relayUp: true, ...hidden };
  }

  // The account's contact link, as the primary's chat shows it: the queue the link names, not the
  // one contacts write to; and while that is the own queue, its backup queue, which moves with it.
  // On the primary: where the account reads first messages, as its contact link says: for a pass (S5).
  private accountReads(): { sender: string; relay: string; relayKey: string } | null {
    if (!this.at || this.data.primary) return null;
    const sender = this.linkSender || this.at.sender;
    return sender && this.at.relay ? { sender, relay: this.at.relay, relayKey: this.at.relayKey } : null;
  }

  private ownLink(): string {
    if (!this.at) return '';
    const { sender, relay, relayKey: rk } = this.at;
    return contactLink({ senderHex: this.linkSender || sender, relayUrl: relay, key: toBase64Url(this.chats.e2e.bundle), relayKey: rk || undefined, spare: linkSpare(this.linkSender, sender, spareCode(this.chats.e2e.spare())) });
  }

  // Seals an envelope for a peer and puts it in its outbox, in the turn. One the outbox has no room
  // for is not sealed: the peer is behind from then on. Each says the key this side gives the peer,
  // and once the peer said its own, each packet is sealed with it. One that is not quiet (`mark`)
  // goes so with its last packet.
  private async seal<T extends Sealable>(peer: T, envelope: Envelope, mark?: OutMark): Promise<T> {
    if (peer.outbox.length >= MAX_OUTBOX) return { ...peer, behind: peer.behind || Date.now() };
    const key = peer.key || newPacketKey();
    let conversation = fromBase64(peer.conversation);
    const outbox = [...peer.outbox];
    for (const bytes of encodeEnvelope(envelope, this.at, key)) {
      const sealed = await core.seal(conversation, bytes);
      conversation = sealed.conversation;
      outbox.push(toBase64(this.sealedFor(peer, sealed.packet)));
    }
    const marks = mark ? { ...peer.marks, [outbox[outbox.length - 1]]: mark } : peer.marks;
    return { ...peer, key, conversation: toBase64(conversation), outbox, ...(marks ? { marks } : {}), told: this.at ? JSON.stringify(this.at) : peer.told };
  }

  // A packet as it goes to a peer: sealed with the key it gave, once it gave one.
  private sealedFor(peer: Sealable, packet: Uint8Array): Uint8Array {
    return peer.sealTo ? sealPacket(this.keysOf(peer.sealTo), packet) : packet;
  }

  private keysOf(key: string): PacketKeys {
    let keys = this.packetKeys.get(key);
    if (!keys) {
      keys = packetKeys(fromBase64Url(key));
      this.packetKeys.set(key, keys);
    }
    return keys;
  }

  // Says something to each linked device (on the primary) or to the phone (on a linked device).
  // Returns the devices it was sealed for; the photos and files it tells of (`files`) are left on
  // the relay for them, in the same turn, so this phone taking one meanwhile does not delete it.
  // What is not quiet (`mark`, or as it says for each) is so only for the devices: to the phone it is.
  private say(envelope: Envelope | ((peer: Peer) => Envelope), only?: string, files: Leaving[] = [], mark?: OutMark | ((peer: Peer) => OutMark | undefined)): Promise<string[]> {
    return this.run(async () => {
      const make = typeof envelope === 'function' ? envelope : () => envelope;
      if (this.data.primary) {
        if (only && only !== this.data.primary.id) return [];
        const was = this.data.primary;
        const sealed = await this.seal(was, make(was));
        await this.save({ ...this.data, primary: sealed });
        // One whose outbox is full takes no more: not told.
        return sealed.outbox.length > was.outbox.length ? [was.id] : [];
      }
      const devices: Peer[] = [];
      const told: string[] = [];
      for (const d of this.data.devices) {
        if (!d.linked || (only && d.id !== only)) {
          devices.push(d);
          continue;
        }
        const sealed = await this.seal(d, make(d), typeof mark === 'function' ? mark(d) : mark);
        if (sealed.outbox.length > d.outbox.length) told.push(d.id);
        devices.push(sealed);
      }
      await this.save({ ...this.data, devices, left: this.leftFor(told, files) });
      return told;
    }).then((told) => {
      void this.flush().catch(() => undefined);
      return told;
    });
  }

  // The photos and files left on the relay, with `files` left for the devices `told` too.
  private leftFor(told: string[], files: Leaving[]): Left[] {
    if (told.length === 0 || files.length === 0) return this.data.left;
    const now = Date.now();
    let left = this.data.left;
    for (const { from, phone } of files) {
      const kept = left.find((l) => l.ids === from.ids);
      left = kept
        ? left.map((l) => (l === kept ? { ...l, devices: [...new Set([...l.devices, ...told])] } : l))
        : [...left, { relay: from.relay, ids: from.ids, at: now, phone, devices: told }];
    }
    return left.slice(-MAX_LEFT);
  }

  private linked(): Peer[] {
    return this.data.primary ? [this.data.primary] : this.data.devices.filter((d) => d.linked);
  }

  // ---- What the chat calls (lib/e2e.ts, Link) ----

  open(packet: Uint8Array, near?: string): ReturnType<Link['open']> {
    if (!this.data.primary && this.data.devices.length === 0 && !this.data.offer && !this.data.asked?.length) return Promise.resolve(null);
    return this.run(async () => {
      const taken = await this.openNow(packet);
      // Came on a link nearby (the same Wi-Fi, lib/nearby.ts): what goes to that device goes there
      // first from now on. The space's links only: a hidden place's stay on the relay.
      if (taken && near && this.pocket === null && this.openedFrom) nearby.heardOn(`device:${this.openedFrom}`, near);
      this.openedFrom = null;
      return taken;
    });
  }

  // Who the packet open just opened came from, a link's peer or another device: for open, above.
  private openedFrom: string | null = null;

  private async openNow(packet: Uint8Array): ReturnType<Link['open']> {
    {
      const peers = this.data.primary ? [this.data.primary] : this.data.devices;
      const siblings = this.siblingList();
      if (isSealedPacket(packet)) {
        // Whose it is, by its mark: then it is tried in that one's conversation only. One no link's
        // mark knows may be a contact's (lib/e2e.ts).
        const marked = (p: Sealable) => !!p.key && sealedWith(this.keysOf(p.key), packet);
        const peer = peers.find(marked);
        const sibling = peer ? undefined : siblings.find(marked);
        // Or an ask to link again's, on either side.
        const asked = peer ?? sibling ? undefined : (this.data.asked ?? []).find(marked);
        const asking = peer ?? sibling ?? asked ? undefined : this.data.asking && marked(this.data.asking) ? this.data.asking : undefined;
        const key = (peer ?? sibling ?? asked ?? asking)?.key;
        const inner = key ? openPacket(this.keysOf(key), packet) : null;
        if (!inner || (await core.packetKind(inner)) !== 'following') return null;
        if (asked) return this.openAsked(asked, inner);
        if (asking) return this.openAsking(asking, inner);
        this.openedFrom = (peer ?? sibling)!.id;
        return peer ? this.openFrom(peer, inner) : this.openFromSibling(sibling!, inner);
      }
      const kind = await core.packetKind(packet);
      if (kind === 'first') return (await this.answered(packet)) ?? (await this.againAnswered(packet)) ?? this.siblingFirst(packet);
      if (kind !== 'following') return null;
      for (const peer of peers) {
        const taken = await this.openFrom(peer, packet);
        if (taken) {
          this.openedFrom = peer.id;
          return taken;
        }
      }
      for (const sibling of siblings) {
        const taken = await this.openFromSibling(sibling, packet);
        if (taken) {
          this.openedFrom = sibling.id;
          return taken;
        }
      }
      for (const asked of this.data.asked ?? []) {
        const taken = await this.openAsked(asked, packet);
        if (taken) return taken;
      }
      return this.data.asking ? this.openAsking(this.data.asking, packet) : null;
    }
  }

  // A packet that continues a link's conversation, in the turn, or null if it does not.
  private async openFrom(peer: Peer, packet: Uint8Array): Promise<Taken> {
    let opened: core.Opened;
    try {
      opened = await core.open(fromBase64(peer.conversation), packet);
    } catch {
      return null;
    }
    const now = Date.now();
    // Kept moved past it before anything else, as the chat keeps its conversations.
    const moved = { ...peer, conversation: toBase64(opened.conversation), heard: now };
    await this.keepPeer(moved);
    const said = this.parts.take(peer.id, opened.plaintext, now);
    if (!said) return { kind: 'taken' };
    return this.take(moved, said);
  }

  private async keepPeer(peer: Peer): Promise<void> {
    if (this.data.primary?.id === peer.id) await this.save({ ...this.data, primary: peer });
    else await this.save({ ...this.data, devices: this.data.devices.map((d) => (d.id === peer.id ? peer : d)) });
  }

  // A device being linked hears from the phone that took its code: if the secret is the code's,
  // the codes to compare. One that came after the first is not taken: a new code starts again.
  private async answered(packet: Uint8Array): Promise<Taken> {
    const offer = this.data.offer;
    if (!offer || this.data.primary || this.data.answer || Date.now() - offer.made > OFFER_LASTS) return null;
    let opened: core.Opened;
    try {
      opened = await core.acceptConversation(fromBase64(offer.account), packet);
    } catch {
      return null;
    }
    const said = this.parts.take('answer', opened.plaintext);
    if (said?.k !== 'hello' || said.secret !== offer.secret || !said.at) return { kind: 'taken' };
    // A code shown in hidden chats links only hidden chats, and a space's only a space, whichever
    // the phone had open when it read the code: its own camera may hand it to the other. The code
    // goes, and the device shows a new one.
    if ((said.h === 1) !== (this.pocket !== null)) {
      await this.save({ ...this.data, offer: null });
      this.announce();
      return { kind: 'taken' };
    }
    await this.save({ ...this.data, answer: await this.answerOf(offer.account, opened, said) });
    this.announce();
    return { kind: 'taken' };
  }

  // The phone that answered a code with `hello` in the conversation it started (`opened`), and the code to compare.
  private async answerOf(account: string, opened: core.Opened, said: Extract<Envelope, { k: 'hello' }> & { at?: Place; pk?: string }): Promise<Answer> {
    const phone = await core.conversationPeer(opened.conversation);
    const own = await core.accountIdentity(fromBase64(account));
    const code = linkSafetyCode(await core.safetyNumber(own, phone));
    const now = Date.now();
    const peer: Peer = {
      id: toHex(phone),
      name: cleanDeviceName(said.name),
      conversation: toBase64(opened.conversation),
      at: said.at!,
      since: now,
      heard: now,
      linked: true,
      outbox: [],
      told: '',
      history: null,
      files: false,
      behind: 0,
      groups: {},
      ...(said.pk ? { sealTo: said.pk } : {}),
    };
    return { peer, account: said.account, code };
  }

  // What one envelope from a peer says, in the turn. What the chat keeps of the contacts changes
  // in the chat's turn (`contacts`); what the history keeps, in the work after.
  private async take(peer: Peer, said: Envelope & { at?: Place; pk?: string }): Promise<Taken> {
    let moved = peer;
    let place: ((contacts: Contact[]) => Contact[]) | null = null;
    if (said.at && JSON.stringify(said.at) !== JSON.stringify(peer.at)) {
      moved = { ...moved, at: said.at };
      // On a linked device the contacts are written to through the phone's queue.
      if (this.data.primary) {
        const at = said.at;
        place = (contacts) => contacts.map((c) => ({ ...c, sender: at.sender, relay: at.relay, relayKey: at.relayKey, spare: at.spare }));
      }
      // On the primary, the device's others are told where it reads now, and the contacts in time:
      // with a new list, when it moved as this phone asked it to (movedFor).
      else if (peer.endpoint)
        this.act(async () => {
          await this.routeList();
          await this.tellList();
          if ((this.data.moving ?? 0) > Date.now()) await this.resignSoon();
          await this.keepRelinks();
        });
    }
    if (said.pk && said.pk !== peer.sealTo) moved = { ...moved, sealTo: said.pk };
    if (moved !== peer) await this.keepPeer(moved);
    if (this.data.primary) return this.takeOnDevice(said, place);
    await this.takeOnPrimary(moved, said);
    return { kind: 'taken', ...(place ? { contacts: place } : {}) };
  }

  private async takeOnPrimary(peer: Peer, said: Envelope): Promise<void> {
    // Whatever a device says once linked tells that the codes matched there.
    if (!peer.linked) await this.ready(peer, said.k === 'ready' ? said.name : '');
    else if (said.k === 'ready' && said.name) await this.keepPeer({ ...peer, name: cleanDeviceName(said.name) || peer.name });
    switch (said.k) {
      case 'send': {
        if (isCall(said.m)) {
          this.callFor(peer.id, said.c, said.m);
          break;
        }
        // A photo or file the device's others may take too stays on the relay for them.
        const shared = this.othersOf(peer).length > 0;
        this.act(() => this.sendFor(said.c, said.m, 0, shared));
        break;
      }
      case 'add':
        this.act(() => this.addFor(said.code, said.when));
        break;
      case 'set':
        this.act(() => this.setFor(said.c, said.change, said.remove === true, said.when, said.del));
        break;
      case 'took':
        this.act(() => this.letGo(peer.id, said.ids));
        break;
      case 'group':
        this.act(() => this.groupFor(peer.id, said.id, said.ask));
        break;
      // The groups held on that device (docs/sync.md, S6): as it tells them, and given back.
      case 'groups':
        if (peer.id === this.data.holder) {
          const members: DevicesData['members'] = said.all ? {} : { ...this.data.members };
          for (const id of said.gone) delete members[id];
          for (const g of said.list) members[g.id] = g.members;
          await this.save({ ...this.data, members });
          this.act(() => this.mirrorFrom(said));
        }
        break;
      case 'changed':
        if (peer.id === this.data.holder) {
          this.act(() => this.changedFrom([], said.groups, said.whole));
          // What the device that holds them could not send for another device, that device is told.
          const unsent = said.groups.filter((g) => g.unsent);
          if (unsent.length > 0) for (const d of this.groupPeers()) void this.say({ k: 'changed', chats: [], groups: unsent, whole: [] }, d.id).catch(() => undefined);
        }
        break;
      case 'hold':
        if (peer.id === this.data.holder) this.act(() => this.heldFrom(peer, said.offer));
        break;
      case 'held':
      case 'nohold':
        this.act(() => this.handedTo(peer, said.f, said.k === 'held'));
        break;
      case 'gpkt':
        this.act(() => this.packetFrom(peer, said.p, said.h));
        break;
      case 'gsig':
        this.act(() => this.signalFor(peer, said.c, said.s, said.r === true));
        break;
      case 'can': {
        const now = this.data.devices.find((d) => d.id === peer.id);
        if (now && !now.canHold) await this.keepPeer({ ...now, canHold: true });
        this.announce();
        break;
      }
      case 'relink': {
        // The key the device gives to be asked to link again with, which the backup carries.
        const now = this.data.devices.find((d) => d.id === peer.id);
        if (now && said.key) await this.keepPeer({ ...now, relink: said.key });
        this.act(() => this.keepRelinks());
        break;
      }
      case 'endpoint':
        if (core.canSign()) await this.endpointFrom(peer.id, said.bundle, said.ek);
        // The log names it from now: what it lacks of it goes, the contacts first written should none be.
        this.syncContacts(this.contactsKept(), this.chats.e2e.blocked());
        if (this.pocket === null) this.seedSettings();
        break;
      case 'out':
        // What the device wrote to a contact itself: this phone's own too, and the devices that do
        // not reach it directly are told it as from here.
        this.act(() => this.ownFrom(said.c, said.m, said.mark));
        this.passOn(peer, { k: 'out', c: said.c, m: said.m, ...(said.mark ? { mark: said.mark } : {}) });
        break;
      case 'came':
        this.act(() => this.cameHere(said.c, said.got));
        this.passOn(peer, { k: 'in', c: said.c, m: { text: '', got: said.got } });
        break;
      case 'notes': {
        // To the devices that do not hear it directly too, the photos and files left on the relay for them.
        const direct = new Set([peer.id, ...this.othersOf(peer).map((d) => d.id)]);
        const others = this.linked().some((d) => !direct.has(d.id));
        const files = said.list.some((n) => n.file);
        await this.heardNotes({ id: peer.id, sibling: false });
        void this.noting(() => this.notesFrom(said, said.keep === true || (others && files)));
        this.passOn(peer, { ...said, ...(others && files ? { keep: true as const } : {}) });
        break;
      }
      case 'chunks':
        this.chunkOffers.set(peer.id, { hosts: said.hosts, port: said.port, key: said.key });
        break;
      case 'cfetch':
        void this.collection.asking(peer.id, said.ids).catch(() => undefined);
        break;
      case 'cfile':
        this.collection.answered(said.list);
        break;
      case 'sync':
        if (peer.endpoint) {
          const heard = await this.syncHeard(peer.endpoint.id, said.s).catch(() => null);
          if (heard) this.act(() => this.syncOnPrimary(heard));
          if (heard) this.settingsFrom(heard);
          if (heard) this.collectionFrom(heard);
          if (heard) this.laterFrom(heard);
          if (heard && heard.took.some((op) => op.k === ASK_KIND || op.k === READ_KIND)) void this.smsShare().catch(() => undefined);
        }
        break;
      case 'unblock':
        // Unblocked on the device, as it asked when their link was added there: so here too, before what it says next.
        this.act(() => this.chats.e2e.unblock(said.c));
        break;
      case 'bye':
        this.chunksGone(peer.id);
        // Gone with the groups held there (an Erevos that let it go all the same): they are left.
        if (this.data.holder === peer.id) await this.groupsGone();
        await this.save({ ...this.data, devices: this.data.devices.filter((d) => d.id !== peer.id) });
        this.act(() => this.letGo(peer.id, null));
        this.callSteps(this.calls.unlinked(peer.id));
        this.act(() => this.signAgain());
        this.act(() => this.keepRelinks());
        this.announce();
        break;
      default:
        break;
    }
  }

  private async takeOnDevice(said: Envelope, place: ((contacts: Contact[]) => Contact[]) | null): Promise<Taken> {
    const primary = this.data.primary!;
    switch (said.k) {
      case 'in':
        // One erased here, from another device, before it came through the phone.
        if (isKept(said.m) && this.erasedHere(peerOf(said.c), said.m.tag as string)) break;
        return { kind: 'message', identity: said.c, plaintext: utf8Encode(JSON.stringify(said.m)) };
      case 'contacts': {
        // As settled with what this device keeps (lib/siblings.ts), and without those removed here
        // since that the phone has not heard of yet.
        const kept = this.data.synced;
        const removed = { ...this.data.removed };
        const synced: Record<string, Synced> = said.all ? {} : { ...kept };
        for (const gone of said.gone) delete synced[gone];
        const list: Synced[] = [];
        for (const s of said.list) {
          if (buried(removed[s.identity], s)) continue;
          delete removed[s.identity];
          synced[s.identity] = settled(kept[s.identity], s);
          list.push(synced[s.identity]);
        }
        const gone = Object.keys(kept).filter((id) => !synced[id]);
        await this.save({ ...this.data, synced, ...removedOf(removed), ...(said.link !== undefined ? { link: said.link } : {}) });
        if (gone.length > 0) this.act(() => this.clearChats(gone));
        const { all } = said;
        const account = this.data.account;
        return {
          kind: 'taken',
          contacts: (contacts) => {
            const placed = place ? place(contacts) : contacts;
            const byId = new Map(placed.map((c) => [c.identity, c]));
            if (all) return list.map((s) => mirrorOf(s, byId.get(s.identity), primary.at, account));
            const next = placed.filter((c) => synced[c.identity]);
            for (const s of list) {
              const mirror = mirrorOf(s, byId.get(s.identity), primary.at, account);
              const at = next.findIndex((c) => c.identity === s.identity);
              if (at < 0) next.push(mirror);
              else next[at] = mirror;
            }
            return next;
          },
        };
      }
      case 'out':
        this.act(() => this.ownFrom(said.c, said.m, said.mark));
        break;
      case 'history':
        await this.save({ ...this.data, packs: [...this.data.packs, said.offer] });
        this.act(() => this.takePacks());
        break;
      case 'call':
        this.endElsewhere(said.id, said.done === 'declined');
        break;
      case 'groups': {
        // Held here, they are told from here, not to here.
        if (this.data.holds) break;
        // Who is in each, in the turn; the groups and their messages, in the work after.
        const members: DevicesData['members'] = said.all ? {} : { ...this.data.members };
        for (const id of said.gone) delete members[id];
        for (const g of said.list) members[g.id] = g.members;
        await this.save({ ...this.data, members });
        this.act(() => this.mirrorFrom(said));
        break;
      }
      case 'changed':
        this.act(() => this.changedFrom(said.chats, this.data.holds ? said.groups.filter((g) => g.unsent) : said.groups, this.data.holds ? [] : said.whole));
        break;
      // The groups held here or to be (docs/sync.md, S6): handed on, asked back, and what comes for
      // them on the phone, passed on.
      case 'hold':
        this.act(() => this.heldFrom(primary, said.offer));
        break;
      case 'held':
      case 'nohold':
        this.act(() => this.handedTo(primary, said.f, said.k === 'held'));
        break;
      case 'give':
        this.act(async () => {
          if (this.data.holds) await this.handGroups('').catch(() => undefined);
        });
        break;
      // In the work after, as the groups handed here before it are. Not held here (they are on
      // their way, or went), back to the phone.
      case 'group':
        this.act(async () => {
          if (this.data.holds) await this.groupFor(primary.id, said.id, said.ask);
          else await this.say({ k: 'group', id: said.id, ask: said.ask });
        });
        break;
      case 'gpkt':
        this.act(() => this.packetFrom(primary, said.p, said.h));
        break;
      case 'gsig':
        this.act(() => this.signalFor(primary, said.c, said.s, said.r === true));
        break;
      case 'list':
        if (core.canSign()) return { kind: 'taken', ...contactsOf(both(place, await this.listFrom(said))) };
        break;
      case 'way': {
        const { c } = said;
        return { kind: 'taken', contacts: both(place, (contacts) => contacts.map((x) => (x.identity === c ? withWay(x, said) : x)))! };
      }
      case 'came':
        this.act(() => this.cameHere(said.c, said.got));
        break;
      case 'notes':
        await this.heardNotes({ id: primary.id, sibling: false });
        void this.noting(() => this.notesFrom(said, said.keep === true));
        break;
      case 'chunks':
        this.chunkOffers.set(primary.id, { hosts: said.hosts, port: said.port, key: said.key });
        break;
      case 'cfetch':
        void this.collection.asking(primary.id, said.ids).catch(() => undefined);
        break;
      case 'cfile':
        this.collection.answered(said.list);
        break;
      case 'sync':
        return this.syncOnDevice(await this.syncHeard(this.data.account, said.s).catch(() => null), place);
      case 'move':
        // The phone's queue moved for a contact deleted or blocked: this device's moves with its next look (lib/queue-move.ts).
        this.act(() => this.chats.e2e.moveSoon());
        break;
      case 'blocked':
        // Who is blocked on the phone, kept here in the chat's turn: their link asks to unblock here too.
        return { kind: 'taken', blocked: said.list, ...(place ? { contacts: place } : {}) };
      case 'accounts': {
        // In place of what the phone gave before and was not brought yet.
        const given: GivenAccounts = { ...(said.matrix ? { matrix: said.matrix } : {}), ...(said.xmpp ? { xmpp: said.xmpp } : {}), ...(said.nostr ? { nostr: said.nostr } : {}) };
        await this.save({ ...this.data, given: isEmpty(given) ? undefined : given });
        void this.aside(() => this.bringGiven());
        this.announce();
        break;
      }
      case 'relink':
        // The phone asks for the key to be asked to link again with: one it was given before it
        // took it is given again, the same.
        if (!said.key) {
          if (primary.relink) await this.save({ ...this.data, primary: await this.seal(primary, { k: 'relink', key: primary.relink }) });
          else await this.giveRelink();
        }
        break;
      case 'bye':
        this.chunksGone(primary.id);
        this.act(() => this.forget());
        break;
      default:
        break;
    }
    return { kind: 'taken', ...(place ? { contacts: place } : {}) };
  }

  wrap(identity: string, plaintext: Uint8Array): Promise<Uint8Array> {
    let told = false;
    return this.run(async () => {
      const primary = this.data.primary;
      if (!primary) throw new Error(t('This device is no longer linked to a phone.'));
      const m = parse(plaintext);
      const key = primary.key || newPacketKey();
      const bytes = m && encodeOne({ k: 'send', c: identity, m: withoutPlace(m) }, this.at, key);
      if (!bytes) throw new Error(t('Too long to go through the phone.'));
      const sealed = await core.seal(fromBase64(primary.conversation), bytes);
      // The account's other devices see it as this one's own, with the phone off too: not a call's
      // signal, nor one sent for later, which they see once the phone sends it.
      const erased = m ? this.erasedBy(identity, m) : this.data.erased;
      const tell = m && !isSignal(m) && !m.due && (isKept(m) || isWorthTelling(m)) && this.siblingList().length > 0;
      const siblings = tell ? await this.sealSiblings({ k: 'out', c: identity, m: withoutPlace(m) }) : this.data.siblings;
      told = !!tell;
      await this.save({ ...this.data, primary: { ...primary, key, conversation: toBase64(sealed.conversation) }, siblings, erased });
      return this.sealedFor(primary, sealed.packet);
    }).then((packet) => {
      if (told) void this.flush().catch(() => undefined);
      return packet;
    });
  }

  // The tags erased in each chat, with those a message this device sealed for a contact erases: so
  // a late copy of one, from the phone or another device, does not bring it back.
  private erasedBy(identity: string, m: Json): Record<string, string[]> | undefined {
    const erase = isObject(m.erase) ? m.erase : null;
    const peer = peerOf(identity);
    const tags = erase?.all === true ? this.chats.history.messages().filter((x) => x.peer === peer && x.tag).map((x) => x.tag) : erase && isTag(erase.tag) ? [erase.tag] : [];
    return tags.length > 0 ? withErased(this.data.erased ?? {}, peer, tags) : this.data.erased;
  }

  async add(code: ContactCode, identity: string, known: Contact | undefined): Promise<Contact> {
    const primary = this.data.primary;
    if (!primary) throw new Error(t('This device is no longer linked to a phone.'));
    if (identity === this.data.account) throw new OwnCodeError();
    await this.say({ k: 'add', code, when: Date.now() });
    // Ahead of what the chat writes to them next, if the relay takes it now.
    await this.flush().catch(() => undefined);
    if (known) return { ...known, request: false };
    const synced: Synced = { identity, name: '', timer: 0, timerAt: 0, request: false, look: null, hide: false, tor: false };
    return mirrorOf(synced, undefined, primary.at, this.data.account);
  }

  opened(identity: string, plaintext: Uint8Array): void {
    // On a linked device, what a contact's endpoint said came of what this device wrote to it
    // itself: the phone and the other devices mark it too.
    if (this.data.primary) {
      const got = tagsOf(parse(plaintext)?.got);
      if (got.length > 0) void this.tellOthers({ k: 'came', c: identity, got });
      return;
    }
    if (!this.data.devices.some((d) => d.linked)) return;
    const m = parse(plaintext);
    const call = m && isCall(m) ? decodeCall(m.call) : null;
    // A contact whose chat copies a call's signals to the account's endpoints rang each device it
    // reaches already (docs/multi-device.md, Calls): this phone rings only the others.
    const rang = call && this.chats.e2e.record(identity)?.calls ? this.copiedTo(m!, true) : new Set<string>();
    if (call) this.callSteps(this.calls.contact(identity, call, this.linked().filter((d) => !rang.has(d.id)).map((d) => d.id), !!(currentCall() || currentGroupCall())));
    if (!m) return;
    // What a call's or a group's signal says was read goes on as a receipt says it: the signal
    // itself goes as lib/linked-calls.ts says, or not at all.
    if (isSignal(m)) {
      const read = tagsOf(m.read);
      if (read.length > 0) void this.say({ k: 'in', c: identity, m: { text: '', read } }).catch(() => undefined);
      return;
    }
    // Their photo or file stays on the relay until each device took it, and this phone too.
    const offer = isObject(m.file) ? readOffer(m.file) : null;
    // A device they wrote it to as well counts it as it comes from them: passed on, it is quiet there.
    const mark = outMarkOf(relayMarkOf(m));
    const copied = mark ? this.copiedTo(m) : new Set<string>();
    void this.say({ k: 'in', c: identity, m: withoutPlace(m) }, undefined, offer ? [{ from: fromOf(offer), phone: true }] : [], (d) => (copied.has(d.id) ? undefined : mark)).catch(() => undefined);
  }

  // On the primary: the linked devices a contact's message (`m`) went to directly too, as their chat
  // writes to the endpoints of the list it holds: one it copies (lib/endpoints.ts isCopied), or a call's signal (`call`) from one that copies those, from a
  // chat that holds the list signed last (`dv`), to each device that list names as taking messages
  // (waysFor) and that reads where it says, as one that said what the keys contacts seal for it
  // with are drawn from does; one that did not reads none of it. Whether it went, only their chat knows: its outbox may
  // have had no room for that device, or the device's queue was gone.
  private copiedTo(m: Json, call = false): Set<string> {
    const list = this.chats.e2e.signedList();
    const body = list && m.dv === list.n && (call || isCopied(m)) ? bodyOf(list) : null;
    if (!list || !body) return new Set();
    const taking = new Set(waysFor(undefined, body.d, undefined).map((w) => w.id).filter((id) => list.real.includes(id)));
    return new Set(this.data.devices.filter((d) => d.linked && d.endpoint?.ek && taking.has(d.endpoint.id)).map((d) => d.id));
  }

  sealed(identity: string, plaintext: Uint8Array): void {
    // On a linked device, what it wrote to a contact itself: the phone and the other devices keep it
    // as their own, as what it writes through the phone.
    if (this.data.primary) {
      const m = parse(plaintext);
      if (m && !isSignal(m) && !m.due && (isKept(m) || isWorthTelling(m))) void this.tellOthers({ k: 'out', c: identity, m: withoutPlace(m) }, identity, m);
      return;
    }
    if (!this.data.devices.some((d) => d.linked)) return;
    const m = parse(plaintext);
    const call = m && isCall(m) ? decodeCall(m.call) : null;
    if (call) this.callSteps(this.calls.phone(identity, call));
    if (!m || isSignal(m)) return;
    if (isKept(m)) {
      // Told once the chat keeps it as sent: one that waits is sealed again when it goes.
      const part = isObject(m.voice) && typeof m.voice.part === 'number' ? m.voice.part : '';
      this.echoes.set(`${identity}|${m.tag as string}|${part}`, { c: identity, tag: m.tag as string, m: withoutPlace(m), at: Date.now() });
      this.watchEchoes();
    } else if (isWorthTelling(m)) {
      void this.say({ k: 'out', c: identity, m: withoutPlace(m) }).catch(() => undefined);
    }
  }

  deleted(identity: string, block: boolean): void {
    if (this.data.primary) this.deletions.set(identity, block ? 2 : 1);
  }

  blockedChanged(blocked: readonly Blocked[]): void {
    if (this.data.primary || !this.data.devices.some((d) => d.linked)) return;
    void this.say({ k: 'blocked', list: [...blocked] }).catch(() => undefined);
    this.syncContacts(this.contactsKept(), blocked);
  }

  unblocked(identity: string): void {
    // Said ahead of what the chat says next, the link it adds again (add).
    if (this.data.primary) void this.say({ k: 'unblock', c: identity }).catch(() => undefined);
  }

  changed(contacts: readonly Contact[]): void {
    const role = this.role();
    if (!role) return;
    const now = contacts.map(syncedOf);
    if (!this.data.primary) this.syncContacts(contacts, this.chats.e2e.blocked());
    void this.run(async () => {
      if (this.data.primary) await this.tellChanges(now);
      else {
        await this.sendChanges(now);
        await this.tellWays(contacts);
      }
    })
      .then(() => this.flush())
      .catch(() => undefined);
  }

  // On a linked device, in the turn: says something to the phone and to each other device, with
  // the tags a message this device sealed for a contact erases (`m`), kept erased here.
  private tellOthers(envelope: Envelope, identity = '', m?: Json): Promise<void> {
    return this.run(async () => {
      const primary = this.data.primary;
      if (!primary) return;
      const sealed = await this.seal(primary, envelope);
      const siblings = await this.sealSiblings(envelope);
      const erased = m ? this.erasedBy(identity, m) : this.data.erased;
      await this.save({ ...this.data, primary: sealed, siblings, erased });
    })
      .then(() => this.flush())
      .catch(() => undefined);
  }

  // On the primary: what a device said of a contact that its others hear from it directly, to the
  // linked devices that do not: one from before, or one the list does not name. What came of what
  // it wrote to them itself goes also to those from before contacts wrote to endpoints, which do
  // not know it as said directly, as what came from them.
  private passOn(from: Peer, envelope: Envelope): void {
    const knows = (d: Peer) => envelope.k !== 'in' || !!d.endpoint?.ek;
    const direct = new Set([from.id, ...this.othersOf(from).filter(knows).map((d) => d.id)]);
    for (const d of this.linked()) if (!direct.has(d.id)) void this.say(envelope, d.id).catch(() => undefined);
  }

  // What a contact's endpoint said came of what one of this account's devices wrote to it itself:
  // marked here as there.
  private async cameHere(c: string, got: string[]): Promise<void> {
    if (!this.chats.e2e.record(c)) return;
    if ((await this.chats.history.mark(peerOf(c), true, 1, Date.now(), got)).length > 0) this.announce();
  }

  // On the primary, in the turn: what it knows of the devices of each contact's account (`way`,
  // lib/link-wire.ts), to each linked device that takes contacts' conversations, as it changes and
  // what that device was not told yet (Peer.ways), so a device writes to their endpoints, and to
  // them itself, with the phone off. Never so much at once that it fills more than half of a
  // device's outbox: the rest goes once it drained (tick), and nothing else waits for it.
  private async tellWays(contacts: readonly Contact[] = this.contactsKept()): Promise<void> {
    const relay = this.at?.relay ?? '';
    const said = new Map<string, { way: ReturnType<typeof wayOf>; short: string }>();
    for (const c of contacts) {
      const way = wayOf(c, relay);
      said.set(c.identity, { way, short: way ? wayDigest(way) : '' });
    }
    this.waysLeft = false;
    let changed = false;
    const devices: Peer[] = [];
    for (const d of this.data.devices) {
      if (!d.linked || !d.endpoint?.ek) {
        devices.push(d);
        continue;
      }
      let told = d;
      const ways: Record<string, string> = {};
      for (const [c, short] of Object.entries(d.ways ?? {})) if (said.has(c)) ways[c] = short;
      for (const [c, { way, short }] of said) {
        if ((ways[c] ?? '') === short) continue;
        if (told.outbox.length >= MAX_OUTBOX / 2) {
          this.waysLeft = true;
          break;
        }
        told = await this.seal(told, { k: 'way', c, ...(way ?? {}) });
        if (short) ways[c] = short;
        else delete ways[c];
      }
      const same = JSON.stringify(ways) === JSON.stringify(d.ways ?? {});
      if (told === d && same) devices.push(d);
      else {
        changed = true;
        const { ways: _ways, ...rest } = told;
        devices.push(Object.keys(ways).length > 0 ? { ...rest, ways } : rest);
      }
    }
    if (changed) await this.save({ ...this.data, devices });
  }

  // On the primary: the chat's contacts as it keeps them.
  private contactsKept(): Contact[] {
    const { e2e } = this.chats;
    return e2e.contacts().flatMap((c) => e2e.record(c.identity) ?? []);
  }

  // On a linked device: each change to a contact goes to the phone, field by field, and to the
  // account's other devices, with when it was made (lib/siblings.ts).
  private async tellChanges(now: Synced[]): Promise<void> {
    const { siblings } = this.data;
    let primary = this.data.primary!;
    let list = siblings?.list ?? [];
    const synced = { ...this.data.synced };
    let removed = this.data.removed ?? {};
    let changes = false;
    const time = Date.now();
    const logged: SyncChange[] = [];
    const tell = async (envelope: Envelope) => {
      if (envelope.k === 'set') logged.push(...syncChangesOf(envelope));
      primary = await this.seal(primary, envelope);
      const told: Sibling[] = [];
      for (const s of list) told.push(await this.sealSibling(s, envelope));
      list = told;
    };
    for (const s of now) {
      const before = synced[s.identity];
      const change = changedFields(before ?? { ...s, ...blankSynced(s.identity) }, s);
      if (Object.keys(change).length === 0) continue;
      // One not kept before was added here, on purpose: it comes back if removed before.
      const at = stampOf(before, change, time);
      await tell({ k: 'set', c: s.identity, change, when: at, ...(before ? {} : { added: true as const }) });
      synced[s.identity] = stamped({ ...(before ?? {}), ...s }, change, at, !before);
      if (!before) {
        const { [s.identity]: _removed, ...rest } = removed;
        removed = rest;
      }
      changes = true;
    }
    for (const id of Object.keys(synced)) {
      if (now.some((s) => s.identity === id)) continue;
      const at = removedAtOf(synced[id], time);
      // Deleted or blocked, not only taken out of the address book: the phone does it too.
      const del = this.deletions.get(id);
      this.deletions.delete(id);
      await tell({ k: 'set', c: id, change: {}, remove: true, when: at, ...(del ? { del } : {}) });
      removed = withRemoved(removed, id, at);
      delete synced[id];
      changes = true;
    }
    if (changes) await this.save({ ...this.data, primary, synced, ...removedOf(removed), ...(siblings ? { siblings: { ...siblings, list } } : {}) });
    // The same into the account's log (lib/sync/), which the phone and the others take too.
    if (logged.length > 0) void this.syncs.write(logged).catch(() => undefined);
  }

  // On the primary: what changed of the contacts goes to each linked device, with when each field
  // was set: by a device, as it said (setFor), or here, now.
  private async sendChanges(now: Synced[], except = ''): Promise<void> {
    const time = Date.now();
    const list: Synced[] = [];
    const synced: Record<string, Synced> = {};
    for (const s of now) {
      const before = this.data.synced[s.identity];
      const { at: times = {}, ...was } = before ?? s;
      if (before && JSON.stringify(was) === JSON.stringify(s)) {
        synced[s.identity] = before;
        continue;
      }
      const change = changedFields(before ?? blankSynced(s.identity), s);
      const given = this.stamps.get(s.identity);
      const at = { ...(before ? times : {}) };
      // One a device added is told as added, and set, then.
      const addedAt = !before && given?.added ? given.at : undefined;
      for (const field of TIMED) {
        if (before && !(field in change)) continue;
        const said = given && field in given.change && JSON.stringify(given.change[field] ?? null) === JSON.stringify(s[field] ?? null);
        at[field] = addedAt ?? (said ? given.at : Math.max(time, (at[field] ?? 0) + 1));
      }
      if (!before) at.added = addedAt ?? time;
      synced[s.identity] = { ...s, at };
      list.push(synced[s.identity]);
    }
    const gone = Object.keys(this.data.synced).filter((id) => !now.some((s) => s.identity === id));
    if (list.length === 0 && gone.length === 0) return;
    const devices: Peer[] = [];
    for (const d of this.data.devices) devices.push(d.linked && d.id !== except ? await this.seal(d, { k: 'contacts', all: false, list, gone }) : d);
    await this.save({ ...this.data, devices, synced });
  }

  // On the primary: the contacts as each device is told them whole, with when each field was set.
  private contactsNow(): Synced[] {
    return this.chats.e2e.contacts().map((c) => {
      const s = syncedOf(this.chats.e2e.record(c.identity)!);
      return { ...s, at: this.data.synced[s.identity]?.at ?? {} };
    });
  }

  // On the primary, in the turn: a device said the codes match. It gets the contacts and the groups,
  // and the work after brings it the history chosen, up to now.
  private async ready(peer: Peer, name: string): Promise<void> {
    const now = Date.now();
    const { accounts: _chosen, ...linking } = peer;
    await this.sendChanges(
      this.chats.e2e.contacts().map((c) => syncedOf(this.chats.e2e.record(c.identity)!)),
      peer.id,
    );
    const link = this.ownLink();
    const linked = await this.groupsTo(
      await this.seal(
        await this.seal(
          { ...linking, linked: true, heard: now, name: cleanDeviceName(name) || peer.name, history: peer.history && { ...peer.history, upTo: now } },
          { k: 'contacts', all: true, list: this.contactsNow(), gone: [], link },
        ),
        { k: 'blocked', list: [...this.chats.e2e.blocked()] },
      ),
    );
    await this.save({ ...this.data, devices: this.data.devices.map((d) => (d.id === peer.id ? linked : d)), link });
    // The contacts go now, with no history to wait for.
    void this.flush().catch(() => undefined);
    // The accounts always go, apart from the history, which may be long to go.
    void this.aside(() => this.giveAccounts(peer.id));
    this.act(() => this.bringHistory(peer.id));
    // A device of a backup's phone linked again here is no longer to ask (keepRelinks).
    this.act(() => this.keepRelinks());
    // The notes of Chat with myself, once it says it takes them.
    void this.noting(() => this.tellNotes());
    this.announce();
  }

  // ---- The account's log (lib/sync/, docs/sync.md) ----

  /** The account's log as this side keeps it (lib/sync/log.ts); null while it takes no part. */
  syncLog(): Promise<SyncLog | null> {
    return this.syncs.read();
  }

  // Who is who in the log: on a linked device, its endpoint, the account and the others the phone
  // named; on the primary, the account and each linked device that has an endpoint. None while
  // nothing is linked, or this device has no endpoint yet.
  private syncWho(): Who | null {
    const { e2e } = this.chats;
    if (this.data.primary) {
      const own = e2e.endpoint()?.id;
      const account = this.data.account;
      if (!own || !account) return null;
      return { me: own, primary: account, peers: (this.data.siblings?.list ?? []).map((s) => s.id) };
    }
    const devices = this.data.devices.filter((d) => d.linked && d.endpoint?.ek);
    if (devices.length === 0) return null;
    const me = e2e.identityHex();
    return { me, primary: me, peers: devices.map((d) => d.endpoint!.id) };
  }

  // Says something of the log to one of the account's devices, by its id in the log, in its link.
  private sendSync(to: string, said: SyncSaid): void {
    // The whole log, once it is more than one packet holds: put on the relay as a file, encrypted
    // with a key of its own that goes in the envelope, and the envelope says where it waits.
    if (said.k === 'whole' && JSON.stringify(said).length > SNAP_OVER) {
      void this.snapshot(said)
        .then((snap) => this.sendSyncNow(to, snap ?? said))
        .catch(() => this.sendSyncNow(to, said));
      return;
    }
    this.sendSyncNow(to, said);
  }

  // The whole log as a file on this device's relay queue (lib/attachments.ts), as the history's
  // packs go: null with no relay to put it on.
  private async snapshot(said: SyncSaid): Promise<Json | null> {
    const here = await this.here();
    if (!here) return null;
    const { ref, offer } = await sendFile(here.own, bytesSource(utf8Encode(JSON.stringify(said))), { name: 'sync.json', mime: 'application/json', kind: 'file' });
    await deleteChunks(ref.id, ref.count).catch(() => undefined);
    return { k: 'snap', offer } as unknown as Json;
  }

  // What another device said in the log's way (lib/sync/wire.ts), as the links heard it: a snapshot
  // on the relay is taken first, and heard as the whole log it holds. One that cannot be taken now
  // is let be: the device asks again (SYNC_EVERY), and is given the whole log again.
  private async syncHeard(from: string, s: Json): Promise<SyncHeard | null> {
    let said: unknown = s;
    if (typeof s === 'object' && s !== null && !Array.isArray(s) && s.k === 'snap') {
      const offer = readOffer(s.offer);
      const here = offer && (await this.here());
      if (!offer || !here) return null;
      const ref = await takeFile(here.own, offerRef(offer), undefined, false);
      const bytes = await readFile(ref);
      await deleteChunks(ref.id, ref.count).catch(() => undefined);
      if (!bytes || bytes.length > SNAP_MOST) return null;
      said = JSON.parse(utf8Decode(bytes)) as unknown;
      if (typeof said !== 'object' || said === null || (said as { k?: unknown }).k !== 'whole') return null;
    }
    return this.syncs.heard(from, said);
  }

  private sendSyncNow(to: string, said: SyncSaid | Json): void {
    const envelope: Envelope = { k: 'sync', s: said as unknown as Json };
    if (this.data.primary) {
      if (to === this.data.account) {
        void this.say(envelope).catch(() => undefined);
        return;
      }
      void this.run(async () => {
        if (!this.data.siblings?.list.some((s) => s.id === to)) return;
        await this.save({ ...this.data, siblings: await this.sealSiblings(envelope, [to]) });
      })
        .then(() => this.flush())
        .catch(() => undefined);
      return;
    }
    const device = this.data.devices.find((d) => d.linked && d.endpoint?.id === to);
    if (device) void this.say(envelope, device.id).catch(() => undefined);
  }

  // On the primary: the contacts and those blocked, as this phone has them, written into the log
  // should it say otherwise, so it ends with what the phone has. The envelopes of before (contacts,
  // set, blocked) still carry them too, for devices of the 6 series.
  private syncContacts(contacts: readonly Contact[], blocked: readonly Blocked[]): void {
    if (this.data.primary) return;
    const logged = contacts.map((c) => ({ identity: c.identity, name: c.name, timer: c.timer, request: c.request, look: (c.look ?? null) as SyncJson, hide: c.hide, tor: c.tor === true }));
    const kept = blocked.map((b) => ({ identity: b.identity, name: b.name }));
    void this.syncs.writeFrom((log) => changesFor(log, logged, kept)).catch(() => undefined);
  }

  // A setting this device changed (lib/sync/settings.ts), into the space's log should it say otherwise.
  private syncSetting(id: string, value: SyncJson): void {
    const v = JSON.stringify(value);
    void this.syncs.writeFrom((log) => (JSON.stringify(syncValueOf(log, 'setting', id, 'v') ?? null) === v ? [] : [{ k: 'setting', id, f: 'v', v: value }])).catch(() => undefined);
  }

  // On the primary: the settings as they are here, into a log that has none of them yet, so a
  // device linked takes them though none was changed since.
  private seedSettings(): void {
    const here = settingsNow();
    void this.syncs.writeFrom((log) => here.filter(({ id }) => syncValueOf(log, 'setting', id, 'v') === undefined).map(({ id, value }) => ({ k: 'setting', id, f: 'v', v: value }))).catch(() => undefined);
  }

  /**
   * The shared settings as the space's log has them, put in place here: once this device shares them
   * again (Settings → Data and devices → Linked devices), so it ends with the account's.
   */
  async takeSettings(): Promise<void> {
    if (this.pocket !== null) return;
    const log = await this.syncs.read().catch(() => null);
    if (log) this.settingsFrom({ log, took: [], whole: true });
  }

  // On the primary: who the accounts on other networks are now, into the log should it say
  // otherwise; and one there now that was not, or another in its place, given to every device linked,
  // so each has all of them, as they change. One gone is removed from the log, and the devices let go
  // of what they brought of it. What cannot be read now is left as the log says.
  private async followAccounts(): Promise<void> {
    if (!hand || this.data.primary || this.linked().length === 0) return;
    const who = await hand.who(this.space, this.key, this.pocket).catch(() => null);
    if (!who) return;
    let give = false;
    await this.syncs.writeFrom((log) => {
      const changes: SyncChange[] = [];
      for (const n of NETWORKS) {
        const now = who[n];
        if (now === undefined) continue;
        const there = isThereInLog(log, 'account', n) ? syncValueOf(log, 'account', n, 'v') : null;
        if (now === there) continue;
        if (now === null) changes.push({ k: 'account', id: n, x: 'del' });
        else {
          if (!isThereInLog(log, 'account', n)) changes.push({ k: 'account', id: n, x: 'add' });
          changes.push({ k: 'account', id: n, f: 'v', v: now });
          give = true;
        }
      }
      return changes;
    });
    if (give) for (const d of this.linked()) void this.aside(() => this.giveAccounts(d.id));
  }

  // On a linked device: an account the log no longer names, or names as another, lets go of the one
  // brought from the phone for it. One of this device's own stays.
  private accountsFrom({ log, took, whole }: SyncHeard): void {
    const brought = this.data.brought;
    if (!hand || !brought) return;
    const ids = whole ? [...NETWORKS] : [...new Set(took.filter((op) => op.k === 'account').map((op) => op.id))];
    const gone: Brought = {};
    for (const n of NETWORKS) {
      const had = brought[n];
      // One the log never named (a phone that has not followed them yet) stays as it is.
      if (!had || !ids.includes(n) || !log.data.account?.[n]) continue;
      const there = isThereInLog(log, 'account', n) ? syncValueOf(log, 'account', n, 'v') : null;
      const same = n === 'matrix' ? there === brought.matrix?.userId : there === had;
      if (same) continue;
      // Another in its place is brought as it comes, and replaces this one then.
      if (there !== null && there !== undefined) continue;
      Object.assign(gone, { [n]: had });
    }
    if (isEmpty(gone)) return;
    void this.aside(async () => {
      await hand?.letGo(this.space, this.key, gone, this.pocket).catch(() => undefined);
      await this.run(async () => {
        const kept: Brought = { ...this.data.brought };
        for (const n of Object.keys(gone) as (keyof Brought)[]) delete kept[n];
        await this.save({ ...this.data, brought: isEmpty(kept) ? undefined : kept });
      });
      this.announce();
    });
  }

  // The place's Collection as the log took it, put in place here.
  private collectionFrom({ log, took, whole }: SyncHeard): void {
    const touched = whole || took.some((op) => op.k === 'collection');
    this.collectionWork = this.collectionWork.catch(() => undefined).then(() => this.collection.heard(log, touched));
  }

  /** For the checks: the Collection's work under way here, done. */
  async collectionSettled(): Promise<void> {
    await this.collectionWork.catch(() => undefined);
    await this.collection.settled();
  }

  // What this device sent for later and a relay holds, as the log says it: none of a safety
  // message, which only this device puts off as its owner opens Erevos (lib/safety.ts).
  private scheduledHere(): Scheduled[] {
    const { e2e, history } = this.chats;
    return history.heldLater(Date.now()).flatMap((m): Scheduled[] => {
      if (!m.peer.startsWith(CONTACT_PREFIX) || !m.held || !m.mine || m.safety || !m.tag) return [];
      const c = m.peer.slice(CONTACT_PREFIX.length);
      if (!e2e.record(c)) return [];
      const copies = e2e.laterCopies(c, m.tag).map(({ id, relay }) => ({ id, relay }));
      return [{ c, tag: m.tag, at: m.at, text: m.text, what: m.voice ? 'voice' : m.file ? 'file' : 'text', ...(m.file ? { name: m.file.name } : {}), lasts: m.lasts ?? 0, held: m.held, copies }];
    });
  }

  /** Writes into the place's log what is sent for later here, so each device of the account shows it and can take it back; done in turn with what came of it. */
  laterWritten(): Promise<void> {
    const run = this.laterWork.catch(() => undefined).then(() => this.syncs.writeFrom((log) => laterChanges(log, this.scheduledHere())));
    this.laterWork = run;
    return run.then(() => undefined);
  }

  // What another device sent for later, as the log took it, shown here as scheduled; one it took
  // back, let go of here. Kept without the queue it was held for, so only the device that sent it
  // holds it anew should their queue move (lib/waiting.ts, holdAgain).
  private laterFrom({ log, took, whole }: SyncHeard): void {
    const ids = whole ? null : [...new Set(took.filter((op) => op.k === 'later').map((op) => op.id))];
    if (ids && ids.length === 0) return;
    this.laterWork = this.laterWork.catch(() => undefined).then(async () => {
      const { e2e, history } = this.chats;
      const { came, gone } = laterFrom(log, ids);
      const changed: LinkedChange['gone'] = [];
      let added = false;
      for (const s of came) {
        const peer = peerOf(s.c);
        if (!e2e.record(s.c) || this.erasedHere(peer, s.tag) || history.messages().some((m) => m.peer === peer && m.tag === s.tag)) continue;
        // Words, or what a voice message or file is: its sound and bytes are the relay's, sealed for them.
        const text = s.what === 'text' ? s.text : [s.what === 'voice' ? '🎤' : `📎 ${s.name ?? ''}`.trim(), s.text].filter(Boolean).join('\n');
        await history.add({ peer, text, mine: true, at: s.at, tag: s.tag, lasts: s.lasts, held: s.held });
        if (s.copies.length > 0) await e2e.copiesHeld(s.copies.map((h) => ({ ...h, at: s.at, c: s.c, t: s.tag })));
        added = true;
      }
      for (const { c, tag } of gone) {
        const peer = peerOf(c);
        const kept = history.messages().find((m) => m.peer === peer && m.tag === tag);
        if (kept?.mine && kept.held && kept.at > Date.now()) {
          await history.remove(peer, tag);
          changed.push({ peer, tag });
        }
        await e2e.letGoCopies(c, tag);
      }
      if (added || changed.length > 0) this.announce({ gone: changed });
    });
  }

  /** For the checks: what is sent for later, written and taken here. */
  async laterSettled(): Promise<void> {
    await this.laterWork.catch(() => undefined);
  }

  /**
   * On the phone, in the space's links: what the devices asked of its SMS, done (each SMS sent once,
   * each conversation read marked read), then its SMS as they go now written into the log, with what
   * became of each ask, in one write; with none linked, nothing. A look asked for while one is under
   * way follows it.
   */
  smsShare(): Promise<void> {
    if (this.pocket !== null || this.data.primary || !smsHand) return Promise.resolve();
    if (this.smsLooking) {
      this.smsAgain = true;
      return this.smsWork.then(() => undefined, () => undefined);
    }
    this.smsLooking = true;
    this.smsLooked = Date.now();
    const run = this.smsWork
      .catch(() => undefined)
      .then(async () => {
        do {
          this.smsAgain = false;
          await this.smsLook();
        } while (this.smsAgain && !this.closed);
      })
      .finally(() => {
        this.smsLooking = false;
      });
    this.smsWork = run;
    return run.then(() => undefined, () => undefined);
  }

  private async smsLook(): Promise<void> {
    const sms = smsHand;
    if (!sms || this.linked().length === 0) return;
    const log = await this.syncs.read();
    if (!log) return;
    const done: { id: string; how: 'sent' | 'failed' | 'old' }[] = [];
    if (smsShared(log)) {
      for (const ask of asksOf(log)) {
        if (ask.d) continue;
        done.push({ id: ask.id, how: await sms.send(this.space, this.key, ask).catch(() => 'failed' as const) });
      }
      // A conversation read on a device up to its latest that came, read here too.
      const view = smsView(log);
      for (const [thread, at] of readsOf(log)) {
        const c = view?.conversations.find((x) => x.thread === thread);
        const latest = c ? Math.max(0, ...c.messages.filter((m) => !m.mine).map((m) => m.at)) : 0;
        if (c && c.unread > 0 && at >= latest) await sms.read(c.address).catch(() => undefined);
      }
    }
    const known = this.chats.e2e.phones().map((p) => p.phone);
    const shared = await sms.shared(this.space, this.key, known).catch(() => undefined);
    if (shared === undefined && done.length === 0) return;
    const now = Date.now();
    await this.syncs.writeFrom((l) => [...(shared === undefined ? [] : smsChanges(l, shared)), ...done.flatMap(({ id, how }) => askDone(l, id, how)), ...oldAsks(l, now)]);
  }

  // On a linked device, in the space's links: the phone's SMS as the log took them, shown here.
  private smsFrom({ took, whole }: SyncHeard): void {
    if (this.pocket !== null || !this.data.primary) return;
    if (!whole && !took.some((op) => op.k === SMS_KIND || op.k === ASK_KIND || op.k === READ_KIND)) return;
    void this.smsShow().catch(() => undefined);
  }

  // On a linked device: the phone's SMS as the log has them now, shown here, with what is written of them.
  private smsShow(): Promise<void> {
    const run = this.smsWork
      .catch(() => undefined)
      .then(async () => {
        if (this.closed || this.pocket !== null || !this.data.primary) return;
        const log = await this.syncs.read();
        const view = log ? smsView(log) : null;
        this.smsShowing = view !== null;
        showMirrored(view, (changesOf) => this.smsWrite(changesOf));
      });
    this.smsWork = run;
    return run.then(() => undefined);
  }

  // On a linked device: what is written of the phone's SMS here (an SMS to send, a conversation read), then shown again.
  private async smsWrite(changesOf: (log: SyncLog) => readonly SyncChange[]): Promise<void> {
    if (this.closed || !this.data.primary) throw new Error(t('The SMS go through your phone, and they no longer come to this device.'));
    await this.syncs.writeFrom(changesOf);
    await this.smsShow();
  }

  /** For the checks: the work on the phone's SMS under way here, done. */
  async smsSettled(): Promise<void> {
    for (let i = 0; i < 5; i++) {
      const work = this.smsWork;
      await work.catch(() => undefined);
      if (work === this.smsWork) return;
    }
  }

  // The settings another device changed, as the space's log took them, put in place here.
  private settingsFrom({ log, took, whole }: SyncHeard): void {
    if (this.pocket !== null) return;
    const ids = whole ? Object.keys(log.data.setting ?? {}) : [...new Set(took.filter((op) => op.k === 'setting').map((op) => op.id))];
    for (const id of ids) {
      const value = syncValueOf(log, 'setting', id, 'v');
      if (value !== undefined) void settingCame(id, value).catch(() => undefined);
    }
  }

  // On a linked device, in the turn: what the log took changes the contacts here, as a change
  // another device said in `set` does (setFrom), field by field, each by when it was set: so what
  // came the way of before already changes nothing, and a later one either way wins. A contact the
  // log removed goes; one the log has not named yet stays. Those blocked, as the log says them.
  private async syncOnDevice(heard: SyncHeard | null, place: ((contacts: Contact[]) => Contact[]) | null): Promise<Taken> {
    const none: Taken = { kind: 'taken', ...(place ? { contacts: place } : {}) };
    if (!heard || !this.data.primary) return none;
    this.settingsFrom(heard);
    this.accountsFrom(heard);
    this.collectionFrom(heard);
    this.laterFrom(heard);
    this.smsFrom(heard);
    const { log, took, whole } = heard;
    const ids = whole ? [...new Set([...Object.keys(log.data.contact ?? {}), ...Object.keys(this.data.synced)])] : [...new Set(took.filter((op) => op.k === 'contact').map((op) => op.id))];
    const fns: ((contacts: Contact[]) => Contact[])[] = place ? [place] : [];
    for (const c of ids) {
      for (const said of setsFromLog(log, c, this.data.synced[c])) {
        const taken = await this.setFrom(said);
        if (taken?.kind === 'taken' && taken.contacts) fns.push(taken.contacts);
      }
    }
    const blockedToo = whole || took.some((op) => op.k === 'blocked');
    return {
      kind: 'taken',
      ...(fns.length > 0 ? { contacts: (contacts: Contact[]) => fns.reduce((x, fn) => fn(x), contacts) } : {}),
      ...(blockedToo ? { blocked: blockedFromLog(log) } : {}),
    };
  }

  // On the primary, in the work after: what a device wrote into the log of a contact, done as its
  // `set` is (setFor); then the log says again what this phone has, should it differ, so every
  // device ends with the phone's.
  private async syncOnPrimary(heard: SyncHeard): Promise<void> {
    for (const op of heard.took) {
      if (op.k !== 'contact' || op.x === 'add') continue;
      if (op.x === 'del') await this.setFor(op.id, {}, true, op.at.t);
      else if (op.f === 'timer' && typeof op.v === 'number') await this.setFor(op.id, { timer: op.v, timerAt: op.at.t }, false, op.at.t);
      else if (op.f === 'request' && op.v === false) await this.setFor(op.id, { request: false }, false, op.at.t);
      else if (op.f === 'name' && typeof op.v === 'string') await this.setFor(op.id, { name: op.v }, false, op.at.t);
      else if (op.f === 'hide' && typeof op.v === 'boolean') await this.setFor(op.id, { hide: op.v }, false, op.at.t);
      else if (op.f === 'tor' && typeof op.v === 'boolean') await this.setFor(op.id, { tor: op.v }, false, op.at.t);
      else if (op.f === 'look') {
        const look = checkedLookOf(op.v);
        if (look !== undefined) await this.setFor(op.id, { look }, false, op.at.t);
      }
    }
    if (heard.took.some((op) => op.k === 'contact')) this.syncContacts(this.contactsKept(), this.chats.e2e.blocked());
  }

  // ---- Linking ----

  /**
   * On the device to link: makes its link key, a secret and the code to show (lib/link-code.ts),
   * named `name`. Only a space with no chats of its own links, or a linked device's copy: its chats
   * become the phone's.
   */
  makeOffer(name: string): Promise<string> {
    return this.run(async () => {
      const place = this.pocket !== null;
      if (this.role() !== null) throw new Error(place ? t('These hidden chats are linked already.') : t('This space is linked already.'));
      const chats = this.chats.e2e.contacts().length > 0 || (this.groups?.groups.all().length ?? 0) > 0;
      if (chats && !this.copied()) {
        throw new Error(
          place
            ? t('These hidden chats have chats of their own. Link from hidden chats with none, such as those a new PIN sets.')
            : t('This space has chats of its own. Link from a space with none, such as one that opens with a new password.'),
        );
      }
      const here = await this.here();
      if (!here) throw new Error(t('Type the server address first.'));
      const account = await core.newAccount();
      const secret = toHex(randomBytes(16));
      await this.save({ ...this.data, offer: { account: toBase64(account), secret, name: cleanDeviceName(name), made: Date.now() }, answer: null });
      return this.offerLink(here);
    });
  }

  /** On the device to link: the code it shows, while it is good. */
  /** On the device to link: whether a code is shown still, not gone since (refused, or too old). */
  offered(): boolean {
    const offer = this.data.offer;
    return !!offer && Date.now() - offer.made <= OFFER_LASTS;
  }

  async shownOffer(): Promise<string | null> {
    const offer = this.data.offer;
    if (!offer || Date.now() - offer.made > OFFER_LASTS) return null;
    const here = await this.here();
    return here ? this.offerLink(here) : null;
  }

  private async offerLink(here: Here): Promise<string> {
    const offer = this.data.offer!;
    const bundle = await core.accountBundle(fromBase64(offer.account));
    const { sender, relay, relayKey: rk } = here.place;
    return linkCodeLink({ key: toBase64Url(bundle), senderHex: sender, relayUrl: relay, relayKey: rk || undefined, secret: offer.secret, name: offer.name });
  }

  /**
   * On the device to link: the codes match. From now on its chats are the phone's. A linked device's
   * copy keeps those of its chats the phone has once it says them, and lets go of the others.
   */
  confirm(code: string): Promise<void> {
    return this.run(async () => {
      const answer = this.data.answer;
      if (!answer || answer.code !== code) throw new Error(t('The code changed. Compare it again.'));
      await this.here().catch(() => null);
      const { e2e } = this.chats;
      const synced = this.copied() ? Object.fromEntries(e2e.contacts().map((c) => [c.identity, syncedOf(e2e.record(c.identity)!)])) : {};
      const primary = await this.seal({ ...answer.peer, since: Date.now() }, { k: 'ready', name: this.data.offer?.name ?? '' });
      await this.save({ ...withoutSiblings(this.data), primary, account: answer.account, offer: null, answer: null, synced, packs: [], copySaid: false, removed: undefined, erased: undefined });
    }).then(async () => {
      this.announce();
      // Its own endpoint, a new one, said after the codes matched: a phone from before leaves it alone.
      await this.newEndpoint(true).catch(() => undefined);
      await this.sayCan();
      await this.run(() => this.giveRelink()).catch(() => undefined);
      return this.flush().catch(() => undefined);
    });
  }

  /** On the device to link: the codes do not match. The code shown goes, and a new one has to be made. */
  refuse(): Promise<void> {
    return this.run(async () => {
      await this.save({ ...this.data, offer: null, answer: null });
    });
  }

  /** On the primary: reads a device's code and gives its name and the code to compare, before anything goes. */
  async prepare(text: string): Promise<{ name: string; code: string }> {
    const code = parseLinkCode(text);
    if (!code) throw new Error(t('That is not a code from Linked devices.'));
    if (this.data.primary) throw new Error(t('This is a linked device. Link from the phone that holds the account.'));
    if (this.data.devices.filter((d) => d.linked).length >= MAX_DEVICES) throw new Error(t('{n} devices are linked already, the most there can be.', { n: MAX_DEVICES }));
    if (!(await this.here())) throw new Error(t('Type the server address in Server first: linked devices reach this phone through it.'));
    let device: Uint8Array;
    const bundle = fromBase64Url(code.key);
    try {
      device = await core.bundleIdentity(bundle);
    } catch {
      throw new Error(t('That is not a code from Linked devices.'));
    }
    if (this.data.devices.some((d) => d.id === toHex(device) && d.linked)) throw new Error(t('That device is linked already.'));
    const account = await core.newAccount();
    const safety = linkSafetyCode(await core.safetyNumber(await core.accountIdentity(account), device));
    this.pending = { code, bundle, account, device: toHex(device), safety };
    return { name: code.name, code: safety };
  }

  /** On the primary: links the device prepared, named `phone` there, and brings it the history chosen once it says the codes match. */
  async link(history: HistoryChoice, phone: string): Promise<void> {
    const pending = this.pending;
    if (!pending) throw new Error(t('That is not a code from Linked devices.'));
    this.pending = null;
    const here = await this.here();
    if (!here) throw new Error(t('Type the server address in Server first: linked devices reach this phone through it.'));
    const peer = await this.linkPeer(pending, history, phone, here);
    await this.run(async () => {
      await this.save({ ...this.data, devices: [...this.data.devices.filter((d) => d.id !== peer.id), peer] });
    });
    this.announce();
    await this.flush().catch(() => undefined);
  }

  // On the primary: a device whose code was read (`pending`), as it is kept until it says the codes
  // match: the conversation started with it, saying the code's secret first, and the history chosen.
  private async linkPeer(pending: Pending, history: HistoryChoice, phone: string, here: Here): Promise<Peer> {
    const now = Date.now();
    const key = newPacketKey();
    // Whether this is a space or hidden chats, always said, at the same size: the device takes the
    // phone only from the same kind (answered).
    const hello = encodeOne({ k: 'hello', secret: pending.code.secret, name: cleanDeviceName(phone), account: this.chats.e2e.identityHex(), h: this.pocket === null ? 0 : 1 }, here.place, key)!;
    const started = await core.startConversation(pending.account, pending.bundle, hello);
    const { senderHex, relayUrl, relayKey: rk, name } = pending.code;
    return {
      id: pending.device,
      name: name || t('Computer'),
      conversation: toBase64(started.conversation),
      at: { sender: senderHex, relay: relayUrl, relayKey: rk ?? '', spare: null },
      since: now,
      heard: 0,
      linked: false,
      outbox: [toBase64(started.packet)],
      told: JSON.stringify(here.place),
      // With none chosen, what comes while the codes are compared.
      history: { since: history.since ?? now, files: history.files, upTo: now, done: 0 },
      files: history.files,
      behind: 0,
      groups: {},
      key,
      ...(history.accounts ? { accounts: true as const } : {}),
    };
  }

  /** On the primary: brings a linked device a period of the history again; what it has already is not kept twice. */
  async bringAgain(id: string, history: HistoryChoice): Promise<void> {
    await this.run(async () => {
      const now = Date.now();
      const devices = this.data.devices.map((d) => (d.id === id && d.linked ? { ...d, history: { since: history.since ?? now, files: history.files, upTo: now, done: 0 } } : d));
      await this.save({ ...this.data, devices });
    });
    this.act(() => this.bringHistory(id));
  }

  /**
   * On the primary: gives the linked device `id` the space's Matrix, XMPP and Nostr accounts, or a
   * hidden place's own (lib/linked-accounts.ts). Answers which networks went: none when it has none
   * of them, or the device is not linked, or has too much waiting for it already.
   */
  async giveAccounts(id: string): Promise<(keyof GivenAccounts)[]> {
    if (!hand || this.data.primary) return [];
    const given = await hand.give(this.space, this.key, this.pocket);
    if (isEmpty(given)) return [];
    const told = await this.say({ k: 'accounts', ...given }, id);
    return told.includes(id) ? (Object.keys(given) as (keyof GivenAccounts)[]) : [];
  }

  /** On a linked device: brings what it can now of the accounts the phone gave, after the work under way. */
  async bringAccounts(): Promise<void> {
    await this.aside(() => this.bringGiven());
  }

  /** On a linked device: the accounts the phone gave, still to bring and brought; null on the primary, or before any came. */
  accountsHere(): AccountsHere | null {
    const { given, brought, primary } = this.data;
    if (!primary || (!given && !brought)) return null;
    return { left: given ?? {}, brought: brought ?? {}, problems: this.accountsProblems };
  }

  // On a linked device, in the work after: brings what it can of the accounts the phone gave, and
  // keeps what is still to bring, unless the phone gave others meanwhile. Unlinked meanwhile, it
  // lets go of what it brought.
  private async bringGiven(): Promise<void> {
    const given = this.data.given;
    if (!hand || !given || !this.data.primary || this.closed) return;
    const { left, brought, gone, problems } = await hand.take(this.space, this.key, given, this.pocket, this.data.brought);
    this.accountsProblems = problems;
    const unlinked = await this.run(async () => {
      if (!this.data.primary) return true;
      const next = this.data.given === given ? left : this.data.given;
      const kept: Brought = { ...this.data.brought };
      for (const n of gone ?? []) delete kept[n];
      const all = { ...kept, ...brought };
      await this.save({ ...this.data, given: isEmpty(next) ? undefined : next, brought: isEmpty(all) ? undefined : all });
      return false;
    });
    if (unlinked && !isEmpty(brought)) await hand.letGo(this.space, this.key, brought, this.pocket).catch(() => undefined);
    this.announce();
  }

  /**
   * Unlinks a device (on the primary, by its id) or this one (on a linked device): nothing more goes
   * to it, nor is anything opened from it. It is told, if the relay takes it now. On a linked device
   * the account's chats go from here, and the accounts it brought from the phone.
   */
  /**
   * Lets the linked device `id` (the phone, on a linked device) take the chunks of the files `ids`
   * on the same Wi-Fi, in place of what it could before, and tells it where and with which key,
   * inside their link: whether it was told. Not where this device has no channel, or no address.
   */
  async offerChunks(id: string, ids: string[]): Promise<boolean> {
    const peer = this.data.primary ?? this.data.devices.find((d) => d.id === id);
    if (!giver || !peer || (!this.data.primary && peer.id !== id)) return false;
    const offer = await giver.offer(peer.id, ids);
    if (!offer) return false;
    await this.say({ k: 'chunks', ...offer }, peer.id);
    return true;
  }

  /** The fast ways to bring chunks from the linked devices on the same Wi-Fi that said where they give them. */
  chunkWays(): ChunkWay[] {
    if (!chunkHand) return [];
    const known = new Set([this.data.primary?.id, ...this.data.devices.map((d) => d.id)]);
    return [...this.chunkOffers].filter(([id]) => known.has(id)).map(([, offer]) => lanWay(chunkHand!, offer));
  }

  // On the phone: the device the groups were held on is gone (S6). Those handed to it and not taken
  // yet are kept here again; otherwise, with their state gone with it, each is left here.
  private async groupsGone(): Promise<void> {
    const shared = this.groups;
    const handed = shared?.groups.handed();
    if (shared && handed && handed.to === this.data.holder) await shared.groups.takeBack().catch(() => undefined);
    else if (shared) await shared.groups.mirror((groups) => ({ groups: groups.map((g) => ({ ...g, status: 'out' as const })), came: [] })).catch(() => undefined);
    const { holder: _holder, moveTo: _moveTo, handing: _handing, ...rest } = this.data;
    await this.save(rest);
    this.groupsWaiting = [];
  }

  // A device unlinked: what it could take, and where it gave, go.
  private chunksGone(id: string): void {
    this.chunkOffers.delete(id);
    void giver?.forget(id);
  }

  async unlink(id = '', force = false): Promise<boolean> {
    const peer = this.data.primary ?? this.data.devices.find((d) => d.id === id);
    if (!peer) return true;
    // The groups' MLS state is on one device only (docs/sync.md, S6): back to the phone first, or,
    // `force`d (the device is lost), they go: on the phone, those handed and not taken yet come
    // back, and otherwise each is left; on this device, they go with the account's chats.
    if (!force && (this.data.holds || this.groups?.groups.handed())) throw new GroupsHeldError(t('The groups are held on this device. On the phone, move them back to it first, under Groups stay on.'));
    if (!force && !this.data.primary && this.data.holder === peer.id) throw new GroupsHeldError(t('The groups are held on {name}. Move them back to this phone first, under Groups stay on.', { name: peer.name }));
    if (!this.data.primary && this.data.holder === peer.id) await this.run(() => this.groupsGone());
    let told = false;
    try {
      const here = await this.here();
      const bye = await this.run(async () => {
        const said = await this.seal({ ...peer, outbox: [] }, { k: 'bye' });
        await this.keepPeer({ ...said, outbox: peer.outbox });
        return said.outbox;
      });
      if (here) {
        const to = contactTarget(here.sends, peer.at);
        for (const packet of bye) await sendMessage(to, fromHex(peer.at.sender), fromBase64(packet), 'quiet');
        told = true;
      }
    } catch {
      // Not told: it gets nothing more all the same.
    }
    this.chunksGone(peer.id);
    if (this.data.primary) await this.forget();
    else {
      await this.run(async () => {
        await this.save({ ...this.data, devices: this.data.devices.filter((d) => d.id !== peer.id) });
      });
      this.announce();
      // What was left on the relay only for it, and a call it has; the list no longer names it.
      this.act(() => this.letGo(peer.id, null));
      this.callSteps(this.calls.unlinked(peer.id));
      this.act(() => this.signAgain());
      this.act(() => this.keepRelinks());
    }
    return told;
  }

  // On a linked device, unlinked: the account's chats go, contacts, messages and groups, and its
  // endpoint, with its conversations with the account's other devices, and the accounts it brought
  // from the phone. The link goes first, so the contacts going is not said to the phone.
  private async forget(): Promise<void> {
    const { e2e } = this.chats;
    const brought = await this.run(async () => {
      const was = this.data.brought;
      await this.save({ ...withoutAsking(withoutSiblings(this.data)), primary: null, account: '', link: '', synced: {}, packs: [], offer: null, answer: null, members: {}, removed: undefined, erased: undefined, given: undefined, brought: undefined, holds: undefined, handing: undefined, tookHold: undefined, asksSeen: undefined });
      return was;
    });
    // The accounts brought from the phone go with the chats.
    if (brought && hand) await hand.letGo(this.space, this.key, brought, this.pocket).catch(() => undefined);
    await e2e.dropEndpoint().catch(() => undefined);
    await this.syncs.forget().catch(() => undefined);
    // The phone's SMS show here no more.
    if (this.smsShowing) {
      this.smsShowing = false;
      showMirrored(null, null);
    }
    await e2e.forgetBlocked().catch(() => undefined);
    const gone = e2e.contacts().map((c) => c.identity);
    for (const identity of gone) await e2e.removeContact(identity).catch(() => undefined);
    await this.groups?.groups.mirror(() => ({ groups: [], came: [] })).catch(() => undefined);
    // Held here, the groups' state goes too (S6).
    await this.groups?.groups.wipe().catch(() => undefined);
    await this.clearChats(gone);
  }

  private async clearChats(identities: string[]): Promise<void> {
    for (const identity of identities) await this.chats.history.clear(peerOf(identity)).catch(() => undefined);
    this.announce({ gone: identities.map((identity) => ({ peer: peerOf(identity) })) });
  }

  // ---- Linking again, once a backup was put back on another phone (lib/link-again.ts) ----

  // On a linked device, in the turn: gives the phone, in their link, a key to ask this device to
  // link again with (lib/link-again.ts), should the phone's backup be put back on another: only the
  // two of them hold it, and the phone's backup carries it (keepRelinks). Once with each link, as
  // this device has an endpoint to be asked at; a phone from before lets it be.
  private async giveRelink(): Promise<void> {
    const primary = this.data.primary;
    if (!primary || primary.relink || !core.canSign() || !this.chats.e2e.endpoint()) return;
    const key = toBase64Url(randomBytes(32));
    const sealed = await this.seal(primary, { k: 'relink', key });
    await this.save({ ...this.data, primary: sealed.outbox.length > primary.outbox.length ? { ...sealed, relink: key } : sealed });
  }

  // What the chat keeps to link again is changed one change after another (keepRelinks, forgetAgain).
  private relinkWork: Promise<unknown> = Promise.resolve();
  private relinking<T>(call: () => Promise<T>): Promise<T> {
    const next = this.relinkWork.catch(() => undefined).then(call);
    this.relinkWork = next.catch(() => undefined);
    return next;
  }

  // On the primary, in the work after: keeps with the chat, which a backup carries, what a phone it
  // is put back on needs to ask each linked device to link again (lock/e2e-data.ts Relinks), and
  // never a key of a link's conversation. Once a backup was put back here, the devices of the phone
  // it was made on are kept apart (`back`), each until it is linked again here (its ask names the
  // link made, which said the codes match) or let go of (forgetAgain), and so is what it was asked.
  private keepRelinks(): Promise<void> {
    return this.relinking(async () => {
      if (this.data.primary || !core.canSign()) return;
      const { e2e } = this.chats;
      const held = e2e.relinks();
      const at = e2e.restoreId();
      const now: Relink[] = this.data.devices.flatMap((d) =>
        d.linked && d.endpoint?.ek && d.relink ? [{ id: d.endpoint.id, bundle: d.endpoint.bundle, s: d.at.sender, relay: d.at.relay, rk: d.at.relayKey, name: d.name, since: d.since, files: d.files, key: d.relink }] : [],
      );
      const asked = this.data.asked ?? [];
      const done = new Set(asked.filter((a) => a.link && this.data.devices.some((d) => d.id === a.link && d.linked)).map((a) => a.id));
      // Those of a backup put back since they were kept are the phone's before; of each, the last kept.
      const was = !held ? [] : held.at === at ? held.back : [...held.back, ...held.now];
      const back: Relink[] = [];
      for (const r of [...was].reverse()) if (!done.has(r.id) && !now.some((n) => n.id === r.id) && !back.some((b) => b.id === r.id)) back.unshift(r);
      const next: Relinks = { at, now, back: back.slice(-MAX_BACK) };
      if (JSON.stringify(next) !== JSON.stringify(held ?? { at, now: [], back: [] })) await e2e.keepRelinks(next);
      const gone =
        (this.data.asked ?? []).length > 0 &&
        (await this.run(async () => {
          const left = (this.data.asked ?? []).filter((a) => next.back.some((b) => b.id === a.id));
          if (left.length === (this.data.asked ?? []).length) return false;
          await this.save(withAsked(this.data, left));
          return true;
        }));
      if (gone || JSON.stringify(next.back) !== JSON.stringify(held?.back ?? [])) this.announce();
    });
  }

  /** On a phone a backup was put back on: the devices of the phone it was made on, to ask to link again (askAgain). */
  fromBackup(): AgainInfo[] {
    if (this.data.primary) return [];
    const asked = this.data.asked ?? [];
    return (this.chats.e2e.relinks()?.back ?? []).map((r) => {
      const ask = asked.find((a) => a.id === r.id);
      return { id: r.id, name: r.name || t('Computer'), since: r.since, asked: ask?.made ?? 0, said: !!ask?.link };
    });
  }

  /**
   * On a phone a backup was put back on: asks the device `id` of the phone it was made on
   * (fromBackup) to link again, as the account's holder said here. The ask goes in a conversation
   * this phone starts as the account with that device's endpoint, signed with the account's key
   * and with the key the device gave the phone before (lib/link-again.ts): the device shows it, and
   * links again only once it is said yes there too. Asked again, the ask before goes.
   */
  async askAgain(id: string): Promise<void> {
    if (this.data.primary) throw new Error(t('This is a linked device. Link from the phone that holds the account.'));
    const back = this.chats.e2e.relinks()?.back.find((r) => r.id === id);
    if (!back || !core.canSign()) return;
    if (this.linked().length >= MAX_DEVICES) throw new Error(t('{n} devices are linked already, the most there can be.', { n: MAX_DEVICES }));
    const here = await this.here();
    if (!here) throw new Error(t('Type the server address in Server first: linked devices reach this phone through it.'));
    const { e2e } = this.chats;
    const key = newPacketKey();
    const said = await makeAgain((context, message) => e2e.sign(context, message), fromBase64Url(back.key), { a: e2e.identityHex(), e: back.id, at: Date.now(), name: t('Phone') });
    const first = encodeOne({ k: 'again', ...said }, here.place, key);
    if (!first) return;
    const started = await e2e.startAsAccount(fromBase64Url(back.bundle), first);
    const asked: Asked = { id, conversation: toBase64(started.conversation), outbox: [toBase64(started.packet)], told: JSON.stringify(here.place), behind: 0, key, at: { sender: back.s, relay: back.relay, relayKey: back.rk, spare: null }, made: Date.now() };
    await this.run(async () => {
      await this.save(withAsked(this.data, [...(this.data.asked ?? []).filter((a) => a.id !== id), asked].slice(-MAX_BACK)));
    });
    this.announce();
    await this.flush().catch(() => undefined);
  }

  /** On a phone a backup was put back on: lets go of the device `id` of the phone it was made on, which is asked nothing more from here. */
  async forgetAgain(id: string): Promise<void> {
    await this.relinking(async () => {
      const held = this.chats.e2e.relinks();
      if (held?.back.some((r) => r.id === id)) await this.chats.e2e.keepRelinks({ ...held, back: held.back.filter((r) => r.id !== id) });
    });
    await this.run(async () => {
      await this.save(withAsked(this.data, (this.data.asked ?? []).filter((a) => a.id !== id)));
    });
    this.announce();
  }

  // On a phone a backup was put back on, in the turn: a packet in the conversation it started with
  // a device to ask it to link again, or null if it is not one; there the device says yes.
  private async openAsked(asked: Asked, packet: Uint8Array): Promise<Taken> {
    let opened: core.Opened;
    try {
      opened = await core.open(fromBase64(asked.conversation), packet);
    } catch {
      return null;
    }
    const said = this.parts.take(`asked:${asked.id}`, opened.plaintext);
    let moved: Asked = { ...asked, conversation: toBase64(opened.conversation) };
    if (said?.at) moved = { ...moved, at: said.at };
    if (said?.pk) moved = { ...moved, sealTo: said.pk };
    await this.save(withAsked(this.data, (this.data.asked ?? []).map((a) => (a.id === asked.id ? moved : a))));
    if (said?.k === 'agreed') await this.agreedFrom(moved, said.link, said.since);
    return { kind: 'taken' };
  }

  // On a phone a backup was put back on, in the turn: a device asked to link again said yes, with
  // the code of a new link it made for this phone, as a device being linked shows one. The phone
  // links it as if it read that code there (link), bringing it the history from a day before it last
  // heard from the phone it was linked to, and says in the ask's conversation the code to compare,
  // which the device compares by itself: nothing is typed or read, as the code came where only the
  // account could ask. Once, for each ask.
  private async agreedFrom(asked: Asked, text: string, since: number): Promise<void> {
    const code = parseLinkCode(text);
    const back = this.chats.e2e.relinks()?.back.find((r) => r.id === asked.id);
    if (!code || !back || asked.link || this.data.primary || this.linked().length >= MAX_DEVICES) return;
    const here = await this.here();
    const bundle = fromBase64Url(code.key);
    const device = await core.bundleIdentity(bundle).catch(() => null);
    if (!here || !device || this.data.devices.some((d) => d.id === toHex(device) && d.linked)) return;
    const account = await core.newAccount();
    const safety = linkSafetyCode(await core.safetyNumber(await core.accountIdentity(account), device));
    const now = Date.now();
    const peer = await this.linkPeer({ code: { ...code, name: back.name }, bundle, account, device: toHex(device), safety }, { since: Math.max(0, Math.min(since, now) - AGAIN_BEFORE), files: back.files }, t('Phone'), here);
    const told = await this.seal({ ...asked, link: peer.id }, { k: 'match', code: safety });
    await this.save({ ...withAsked(this.data, (this.data.asked ?? []).map((a) => (a.id === asked.id ? told : a))), devices: [...this.data.devices.filter((d) => d.id !== peer.id), peer] });
    this.announce();
    void this.flush().catch(() => undefined);
  }

  // On a linked device, in the turn: a first packet the account started a conversation with this
  // device's endpoint with, which may be its phone, put back from a backup, asking it to link again
  // (lib/link-again.ts). Kept to show, once, when the account signed it with the bundle its phone
  // gave over their link, for this endpoint, lately, with the key this device gave that phone to be
  // asked with: a phone that has the account but not that key asks nothing. Nothing links until it
  // is said yes here (linkAgain).
  private async askedFrom(opened: core.Opened, packet: Uint8Array): Promise<Taken> {
    const { e2e } = this.chats;
    const own = e2e.own();
    const endpoint = e2e.endpoint();
    const relink = this.data.primary?.relink;
    const account = this.data.account;
    const id = toHex(await core.firstMessageId(packet)).slice(0, 32);
    const said = this.parts.take('ask', opened.plaintext);
    if (!relink || !endpoint || own?.identity !== account || said?.k !== 'again' || !said.at || (this.data.asksSeen ?? []).includes(id)) return { kind: 'taken' };
    const body = await checkAgain(fromBase64Url(own.bundle), account, endpoint.id, fromBase64Url(relink), said).catch(() => null);
    if (!body) return { kind: 'taken' };
    const asking: Asking = { conversation: toBase64(opened.conversation), outbox: [], told: '', behind: 0, ...(said.pk ? { sealTo: said.pk } : {}), at: said.at, name: cleanDeviceName(body.name) || t('Phone'), made: Date.now() };
    await this.save({ ...this.data, asking, asksSeen: [...(this.data.asksSeen ?? []), id].slice(-MAX_ASKS_SEEN) });
    this.announce();
    return { kind: 'taken' };
  }

  /** On a linked device: its phone, put back from a backup, asking it to link again, or null. */
  askedHere(): AskedHere | null {
    const asking = this.data.asking;
    if (!asking || !this.data.primary) return null;
    return { name: asking.name, made: asking.made, said: !!asking.offer };
  }

  /**
   * On a linked device: says yes to its phone, put back from a backup, asking it to link again
   * (askedHere). A new link is made, with keys of its own, as with a code shown for a phone to read;
   * but the code goes to that phone in the ask's conversation, and the code to compare comes back
   * there, compared here by itself. Once both match, this device is that phone's, and keeps its
   * chats, with what came since.
   */
  linkAgain(): Promise<void> {
    return this.run(async () => {
      const asking = this.data.asking;
      const primary = this.data.primary;
      if (!asking || !primary) throw new Error(t('The phone no longer asks this device to link again.'));
      if (asking.offer) return;
      const here = await this.here();
      if (!here) throw new Error(t('Type the server address first.'));
      const account = await core.newAccount();
      const secret = toHex(randomBytes(16));
      const bundle = await core.accountBundle(account);
      const { sender, relay, relayKey: rk } = here.place;
      const link = linkCodeLink({ key: toBase64Url(bundle), senderHex: sender, relayUrl: relay, relayKey: rk || undefined, secret, name: '' });
      const sealed = await this.seal(asking, { k: 'agreed', link, since: primary.heard });
      await this.save({ ...this.data, asking: { ...sealed, offer: { account: toBase64(account), secret, name: '', made: Date.now() } } });
    }).then(() => {
      this.announce();
      return this.flush().catch(() => undefined);
    });
  }

  /** On a linked device: not now, to its phone put back from a backup asking it to link again. It stays linked as it is; asked again, it shows that. */
  notAgain(): Promise<void> {
    return this.run(async () => {
      await this.save(withoutAsking(this.data));
    }).then(() => this.announce());
  }

  // On a linked device, in the turn: a packet in the conversation its phone, put back from a backup,
  // started to ask it to link again, or null if it is not one: the code to compare for the new link,
  // once this device said yes. Linked again once it is that link's (relinked); one that differs
  // ends the ask.
  private async openAsking(asking: Asking, packet: Uint8Array): Promise<Taken> {
    let opened: core.Opened;
    try {
      opened = await core.open(fromBase64(asking.conversation), packet);
    } catch {
      return null;
    }
    const said = this.parts.take('asking', opened.plaintext);
    let moved: Asking = { ...asking, conversation: toBase64(opened.conversation) };
    if (said?.at) moved = { ...moved, at: said.at };
    if (said?.pk) moved = { ...moved, sealTo: said.pk };
    if (said?.k === 'match' && moved.offer) {
      if (moved.answer?.code === said.code) return this.relinked(moved.answer);
      if (moved.answer) {
        await this.save(withoutAsking(this.data));
        this.announce();
        return { kind: 'taken' };
      }
      moved = { ...moved, match: said.code };
    }
    await this.save({ ...this.data, asking: moved });
    return { kind: 'taken' };
  }

  // On a linked device that said yes to linking again, in the turn: the phone's first word on the
  // new link, as a device being linked hears it (answered), from the account this device is linked
  // to, and of the same kind of place. Linked again once the code the phone said in the ask's
  // conversation is that link's own (relinked).
  private async againAnswered(packet: Uint8Array): Promise<Taken> {
    const asking = this.data.asking;
    const offer = asking?.offer;
    if (!asking || !offer || asking.answer || !this.data.primary || Date.now() - offer.made > AGAIN_LASTS) return null;
    let opened: core.Opened;
    try {
      opened = await core.acceptConversation(fromBase64(offer.account), packet);
    } catch {
      return null;
    }
    const said = this.parts.take('answer', opened.plaintext);
    if (said?.k !== 'hello' || said.secret !== offer.secret || !said.at) return { kind: 'taken' };
    const answer = await this.answerOf(offer.account, opened, said);
    if (said.account !== this.data.account || (said.h === 1) !== (this.pocket !== null) || (asking.match && asking.match !== answer.code)) {
      await this.save(withoutAsking(this.data));
      this.announce();
      return { kind: 'taken' };
    }
    if (asking.match) return this.relinked(answer);
    await this.save({ ...this.data, asking: { ...asking, answer } });
    return { kind: 'taken' };
  }

  // On a linked device, in the turn: linked again, to its phone put back from a backup. The chats
  // stay, with what came since, which that phone brings. The link to the phone before goes, told
  // nothing, as that phone is lost; so do this device's endpoint, the others it met as that endpoint
  // and the account's list it last checked, and the key it gave to be asked with: a new endpoint,
  // which the phone the backup came from never knew, is said in the new link with a new key, so
  // that phone, or whoever holds the same backup, can ask this device nothing more.
  private async relinked(answer: Answer): Promise<Taken> {
    await this.here().catch(() => null);
    const primary = await this.seal({ ...answer.peer, since: Date.now() }, { k: 'ready', name: '' });
    await this.save({ ...withoutAsking(withoutSiblings(this.data)), primary, account: answer.account, offer: null, answer: null, removed: undefined });
    this.saidCan = false;
    this.act(async () => {
      await this.chats.e2e.dropEndpoint().catch(() => undefined);
      await this.newEndpoint(true).catch(() => undefined);
      await this.run(() => this.giveRelink());
      await this.sayCan();
    });
    this.announce();
    void this.flush().catch(() => undefined);
    return { kind: 'taken' };
  }

  // What waits in the conversation of an ask to link again, on either side, to where the other reads.
  private async flushAsked(here: Here, id: string): Promise<void> {
    const asked = this.data.asked?.find((a) => a.id === id);
    if (!asked || asked.outbox.length === 0) return;
    await this.sendOut(here, asked.at, asked.outbox, async (sent) => {
      await this.save(withAsked(this.data, (this.data.asked ?? []).map((a) => (a.id === id ? withoutSent(a, sent) : a))));
    });
  }

  private async flushAsking(here: Here): Promise<void> {
    const asking = this.data.asking;
    if (!asking || asking.outbox.length === 0) return;
    await this.sendOut(here, asking.at, asking.outbox, async (sent) => {
      if (this.data.asking) await this.save({ ...this.data, asking: withoutSent(this.data.asking, sent) });
    });
  }

  /**
   * Whether to say, once, as the space's first screen shows: on a phone a backup was put back on,
   * that the devices of the phone it was made on can be asked to link again; on a linked device,
   * that its phone asks it to. What to say, or null.
   */
  sayAgain(): Promise<string | null> {
    return this.run(async () => {
      const asking = this.data.asking;
      if (this.data.primary && asking && !asking.offer && this.data.askSaid !== asking.made) {
        await this.save({ ...this.data, askSaid: asking.made });
        return t('{name} asks this device to link again, as a backup of the phone was put back there. If you did that, tap Link again in Linked devices.', { name: asking.name });
      }
      if (!this.data.primary && !this.data.backSaid && this.fromBackup().length > 0) {
        await this.save({ ...this.data, backSaid: true });
        return t('The phone this backup was made on had linked devices. In Linked devices, ask those that are yours to link again: each keeps its chats.');
      }
      return null;
    });
  }

  // ---- Endpoints and the device list (lib/device-list.ts) ----

  // As the space opens, in the work after. On a linked device: one linked before endpoints, or that
  // did not say its endpoint yet, makes one or says it. On the primary: the device list is signed
  // again if it does not name the linked devices as they are, and each is told it; and what a backup
  // carries to ask them to link again is kept as they are, the devices of the phone a backup put back
  // since was made on apart.
  private async listsAtOpen(): Promise<void> {
    if (!core.canSign()) return;
    if (this.data.primary) await this.newEndpoint(false);
    else {
      await this.signAgain();
      await this.keepRelinks();
    }
  }

  // On a linked device: makes its endpoint, a new one (`fresh`, as it is linked) or only if it has
  // none, or if it said the one it has without what contacts' keys for it are drawn from, as the version
  // before did: the phone listed that one as a place no device takes, contacts' ways to it were
  // started for that place, and a new one, which takes an old one's place in the list as linking
  // a device does, has them start anew with this device. Then it says it to the phone.
  private async newEndpoint(fresh: boolean): Promise<void> {
    if (!core.canSign() || !this.data.primary) return;
    const made = this.chats.e2e.endpoint();
    const said = this.data.primary.endpoint;
    if (fresh || !made || (said?.id === made.id && !said.ek)) {
      await this.chats.e2e.makeEndpoint();
      // The other devices met as the endpoint before are met again, once the phone lists this one.
      await this.run(async () => {
        if (this.data.siblings) await this.save(withoutSiblings(this.data));
      });
    }
    await this.tellEndpoint();
  }

  // On a linked device: says its endpoint to the phone, with what the key each contact seals for it
  // with is drawn from (lib/sealed-packet.ts entryKey), so it takes their conversations: once for each it made, or `again` when a list the phone signed
  // does not name it.
  private async tellEndpoint(again = false): Promise<void> {
    await this.run(async () => {
      const primary = this.data.primary;
      const made = this.chats.e2e.endpoint();
      const ek = this.chats.e2e.endpointKey();
      if (!primary || !made || !ek || (!again && primary.endpoint?.id === made.id && primary.endpoint.ek === ek)) return;
      const endpoint = { ...made, ek };
      const sealed = await this.seal(primary, { k: 'endpoint', bundle: endpoint.bundle, ek });
      await this.save({ ...this.data, primary: sealed.outbox.length > primary.outbox.length ? { ...sealed, endpoint } : sealed });
    });
    void this.flush().catch(() => undefined);
  }

  // On the primary, in the turn: a linked device said its endpoint, and, one that takes contacts'
  // conversations, what the key each seals for it with is drawn from (`ek`). One whose bundle holds and that is neither
  // the account nor another device's is kept with the device, which is told the list again and
  // what is known of each contact's devices; the work after signs one that names it.
  private async endpointFrom(id: string, bundle: string, ek: string | undefined): Promise<void> {
    const peer = this.data.devices.find((d) => d.id === id && d.linked);
    if (!peer) return;
    const endpoint = await core.bundleIdentity(fromBase64Url(bundle)).then(toHex, () => '');
    if (!endpoint || endpoint === this.chats.e2e.identityHex() || this.data.devices.some((d) => d.id !== id && d.endpoint?.id === endpoint)) return;
    const { ways: _ways, ...told } = peer;
    await this.keepPeer({ ...told, endpoint: { id: endpoint, bundle, ...(ek ? { ek } : {}) }, listed: 0 });
    this.act(() => this.signAgain());
    this.act(() => this.keepRelinks());
    if (ek) this.act(() => this.run(() => this.tellWays()));
  }

  // On the primary, in the work after: signs the device list again when it does not name the linked
  // devices as they are, each by the endpoint it said: one said a new one, one was unlinked, or none
  // is linked on the phone a backup was put back on; when it does not say of each that it takes
  // messages, as one an Erevos before signed may not; when a backup was put back since it was
  // signed, as a device linked after the backup was made is named no more then; and, on a phone a
  // backup was put back on (lib/e2e.ts newestHeld), with none kept once a contact says they hold
  // one, and with one kept once a contact still holds a later one, as with this phone's clock
  // behind: that once more, above any a contact can say, so no contact makes it sign again. Then
  // each is told the list it was not told yet.
  private async signAgain(force = false): Promise<void> {
    if (this.data.primary || !core.canSign()) return;
    const { e2e } = this.chats;
    const held = e2e.signedList();
    if (force && !held) return;
    const devices = this.data.devices.flatMap((d) => (d.linked && d.endpoint ? [d.endpoint] : [])).slice(0, MAX_LISTED);
    const real = devices.map((d) => d.id).sort();
    const old = devices.filter((d) => !d.ek).map((d) => d.id);
    const after = e2e.newestHeld();
    const put = e2e.restoredSince() || after > (held?.n ?? 0);
    const behind = !!held && !e2e.restoredSince() && after > held.n;
    const differs = force || (held ? JSON.stringify([...held.real].sort()) !== JSON.stringify(real) || !flagsHold(held) || put : real.length > 0 || after > 0);
    if (differs) {
      const body = await nextList(e2e.identityHex(), devices.map(({ id, bundle }) => ({ id, bundle })), held, { after: behind ? e2e.heldAtMost() : after });
      const list = await signList((context, message) => e2e.sign(context, message), body);
      // The queues of the places the next list fills as the last did stay theirs, and so does a
      // device's that says no key for contacts, which reads as those do.
      const filling = (id: string) => (!real.includes(id) || old.includes(id)) && body.d.some((e) => e.i === id);
      const r = Object.fromEntries(Object.entries(held?.r ?? {}).filter(([id]) => filling(id)));
      const q = Object.fromEntries(Object.entries(held?.q ?? {}).filter(([id]) => filling(id)));
      // Contacts who hold a list that may name a device this one does not are given it before the
      // places in it each have a queue: all of them, put back from a backup, as one signed since it
      // was made may name any; otherwise those who hold the one before an unlinked device left.
      const cut = put ? body.n - 1 : held && held.real.some((id) => !real.includes(id)) ? held.n : held?.cut;
      await e2e.keepList({ b: list.b, s: list.s, n: body.n, real, ...(Object.keys(r).length > 0 ? { r } : {}), ...(Object.keys(q).length > 0 ? { q } : {}), ...(cut ? { cut } : {}) });
    }
    await this.routeList();
    await this.tellList();
  }

  // On the primary: where each endpoint of the device list as last signed reads, as contacts are
  // given it with the list, and the key kept for it, from which each contact is given a key of its
  // own to seal what they send it with for the relay (lib/e2e.ts routesFor): each device where it
  // said it reads, with the key it said, and each place that only fills the list, and a device that
  // said no key for contacts, which takes nothing from them, a queue made for it on this phone's
  // relay, which this phone empties now and then (drainFillers), with a random key of its own that
  // no one reads with. So contacts write to every place alike, sealed alike, each with keys no other
  // contact has, and the relay takes each, and nothing in the list says which is a device. A place's queue goes with this phone to
  // another relay, or to one whose key is known only now (one whose key it could not ask is taken
  // as the same); one that cannot be made now stays as it was, its key with it, and is made with a
  // later tick (routesLeft), as is one that never had one; until then contacts are given no list,
  // but those who may hold one naming a device it no longer names (lib/e2e.ts listFor).
  private async routeList(): Promise<void> {
    const { e2e } = this.chats;
    const list = e2e.signedList();
    const body = list && !this.data.primary && core.canSign() ? bodyOf(list) : null;
    if (!list || !body) return;
    const here = await this.here().catch(() => null);
    const r: Record<string, Route> = {};
    const q: Record<string, string> = {};
    for (const { i } of body.d) {
      const was = list.r?.[i];
      const device = list.real.includes(i) ? this.data.devices.find((d) => d.linked && d.endpoint?.id === i) : undefined;
      if (device?.endpoint?.ek) {
        r[i] = { s: device.at.sender, relay: device.at.relay, rk: device.at.relayKey, pk: device.endpoint.ek };
        continue;
      }
      if (list.real.includes(i) && !device) continue;
      // Where a device read as it said, with its key, is no place this phone made: it gets one of its own.
      const made = was?.pk && was.s !== device?.at.sender ? was : undefined;
      if (list.q?.[i] && made && (!here || (made.relay === here.place.relay && (!here.keyed || made.rk === here.place.relayKey)))) {
        r[i] = made;
        q[i] = list.q[i];
        continue;
      }
      const ids = here ? await createQueue(here.own).catch(() => null) : null;
      if (ids && here) {
        r[i] = { s: toHex(ids.senderId), relay: here.place.relay, rk: here.place.relayKey, pk: made?.pk ?? toBase64Url(randomBytes(32)) };
        q[i] = toHex(ids.recipientId);
      } else if (made) {
        r[i] = made;
        if (list.q?.[i]) q[i] = list.q[i];
      }
    }
    await e2e.keepRoutes(list.n, r, q);
  }

  // On the primary: whether an endpoint of the device list as last signed has no route yet, or a
  // place this phone made a queue for has none now, so routeList tries again.
  private routesLeft(list: OwnList): boolean {
    const keyed = (id: string) => this.data.devices.some((d) => d.linked && d.endpoint?.id === id && !!d.endpoint.ek);
    return (bodyOf(list)?.d ?? []).some(({ i }) => !list.r?.[i] || (!keyed(i) && !list.q?.[i]));
  }

  /**
   * On the primary: takes what came to the queues of the places that fill the device list, on this
   * phone's relay as it reaches it, and drops it, so they never fill and the relay keeps them, as it
   * keeps those their devices read. One the relay no longer has is made anew, as is one this phone
   * left behind on a relay it no longer uses, which it does not connect to, each with the key
   * contacts' keys for it are drawn from: they are told where it is with the list.
   */
  async drainFillers(): Promise<void> {
    const list = this.chats.e2e.signedList();
    if (!list || this.data.primary) return;
    const here = await this.here().catch(() => null);
    if (!here) return;
    const lost: string[] = [];
    let moved = (bodyOf(list)?.d ?? []).some((e) => !list.r?.[e.i]);
    for (const [id, recipient] of Object.entries(list.q ?? {})) {
      const route = list.r?.[id];
      if (!route || route.relay !== here.place.relay || (here.keyed && route.rk !== here.place.relayKey) || !route.pk) {
        moved = true;
        continue;
      }
      try {
        for (let n = 0; n < DRAIN_MOST && (await receiveMessage(here.own, fromHex(recipient))); n++);
      } catch (error) {
        if (isQueueNotFound(error)) lost.push(id);
      }
    }
    if (lost.length > 0) await this.chats.e2e.keepRoutes(list.n, list.r ?? {}, Object.fromEntries(Object.entries(list.q ?? {}).filter(([id]) => !lost.includes(id))));
    if (moved || lost.length > 0) await this.routeList();
    await this.drainOldFillers(here);
  }

  // The queues the places that fill the list read on before this phone's queue moved for a contact
  // deleted or blocked: emptied until each one's grace ends, then deleted. One on a relay this
  // phone no longer uses is let go, as one the relay no longer has.
  private async drainOldFillers(here: Here): Promise<void> {
    const was = this.chats.e2e.signedList()?.qWas ?? [];
    if (was.length === 0) return;
    const kept: OldFiller[] = [];
    for (const w of was) {
      if (!sameRelay(w.relay, here.place.relay)) continue;
      try {
        for (let n = 0; n < DRAIN_MOST && (await receiveMessage(here.own, fromHex(w.q))); n++);
        if (Date.now() < w.until) kept.push(w);
        else await deleteQueue(here.own, fromHex(w.q));
      } catch (error) {
        if (!isQueueNotFound(error)) kept.push(w);
      }
    }
    await this.chats.e2e.keepOldFillers(kept);
  }

  // Once the space's own queue moved (lib/queue-move.ts): the devices are told where this side
  // reads now at once, and on the primary, for a contact deleted or blocked, or the phone a backup
  // came from lost, the rest moves too.
  private spaceMoved(why: MoveWhy): void {
    if (this.closed || !this.isOpenSpace()) return;
    if ((why === 'due' || why === 'phone') && !this.data.primary) this.act(() => this.movedFor());
    void this.flush().catch(() => undefined);
  }

  // Whether this is the open space's: only its queues move.
  private isOpenSpace(): boolean {
    try {
      return currentSpace().space === this.space;
    } catch {
      return false;
    }
  }

  // On the primary, its own queue moved for a contact deleted or blocked, or the phone lost: they
  // may know every place the device list says too. So the places that fill it get new queues (the old ones are emptied
  // until their grace ends, drainOldFillers), each linked device is asked to move its own (`move`),
  // and the list is signed anew, `n` + 1, so a contact who holds the one before is given it again
  // (lib/e2e.ts listFor), with each device's new place once it moved.
  private async movedFor(): Promise<void> {
    const { e2e } = this.chats;
    const list = e2e.signedList();
    const now = Date.now();
    if (list && core.canSign()) {
      const fillers = Object.entries(list.q ?? {});
      const old = fillers.flatMap(([id, q]) => {
        const relay = list.r?.[id]?.relay;
        return relay ? [{ q, relay, until: now + GRACE }] : [];
      });
      if (old.length > 0) await e2e.keepOldFillers([...(list.qWas ?? []), ...old]);
      const r = Object.fromEntries(Object.entries(list.r ?? {}).filter(([id]) => !list.q?.[id]));
      await e2e.keepRoutes(list.n, r, {});
      await this.routeList();
    }
    if (this.linked().length > 0) await this.say({ k: 'move' });
    await this.run(() => this.save({ ...this.data, moving: now + GRACE }));
    await this.resignSoon();
  }

  // On the primary: a new list is due after a move, signed now unless one was within the hour; then with a later tick.
  private async resignSoon(): Promise<void> {
    if (this.data.primary || !this.chats.e2e.signedList()) return;
    if (!this.data.resign) await this.run(() => this.save({ ...this.data, resign: Date.now() }));
    await this.resignDue();
  }

  private async resignDue(): Promise<void> {
    if (!this.data.resign || Date.now() - (this.data.resignedAt ?? 0) < RESIGN_EVERY) return;
    await this.signAgain(true);
    await this.run(async () => {
      const { resign: _resign, ...rest } = this.data;
      await this.save({ ...rest, resignedAt: Date.now() });
    });
  }

  // On the primary: each linked device not told the device list as last signed is told it, with the
  // account's bundle, whose key signed it, which of its endpoints are the devices', and where each
  // of the others reads, to reach them directly; told again when one of those reads elsewhere. A
  // device from before leaves it alone.
  private async tellList(): Promise<void> {
    const list = this.chats.e2e.signedList();
    if (!list || this.data.primary) return;
    const ak = toBase64Url(this.chats.e2e.bundle);
    // And the account's word that the bundle is its own, with a pass for each device whose
    // endpoint the list names, for it to start a chat with someone new (S5): given anew well before
    // it runs out.
    const ab = await this.chats.e2e.binding().catch(() => '');
    const at = this.accountReads();
    const told = await this.run(async () => {
      const devices: Peer[] = [];
      const now = Date.now();
      for (const d of this.data.devices) {
        const routes = this.routesFor(d);
        const routed = JSON.stringify(routes);
        const passes = !!ab && !!at && !!d.endpoint && list.real.includes(d.endpoint.id);
        if (!d.linked || (d.listed === list.n && (!d.endpoint || d.routed === routed) && (!passes || ((d.passed ?? 0) - now > PASS_RENEW && d.passTo === JSON.stringify(at))))) {
          devices.push(d);
          continue;
        }
        const u = now + PASS_LASTS;
        const ap = passes ? await signPass((context, message) => this.chats.e2e.sign(context, message), { a: this.chats.e2e.identityHex(), i: d.endpoint!.id, s: at!.sender, r: at!.relay, k: at!.relayKey, u }) : null;
        const sealed = await this.seal(d, { k: 'list', list: { b: list.b, s: list.s }, ak, real: list.real, ...(Object.keys(routes).length > 0 ? { routes } : {}), ...(ap ? { ab, ap } : {}) });
        devices.push(sealed.outbox.length > d.outbox.length ? { ...sealed, listed: list.n, ...(d.endpoint ? { routed } : {}), ...(ap ? { passed: u, passTo: JSON.stringify(at) } : {}) } : sealed);
      }
      if (devices.every((d, i) => d === this.data.devices[i])) return false;
      await this.save({ ...this.data, devices });
      return true;
    });
    if (told) void this.flush().catch(() => undefined);
  }

  // On the primary: where each of a device's others reads (othersOf), by its endpoint.
  private routesFor(peer: Peer): Record<string, Place> {
    return Object.fromEntries(this.othersOf(peer).map((d) => [d.endpoint!.id, d.at]));
  }

  // On a linked device, in the turn: the account's device list, from the phone. Kept once it holds:
  // the bundle it came with is the account's this device was linked to (whose identity came in
  // `hello`, in the link whose codes were compared), that bundle's key signed it, and it is later
  // than the one kept. The devices it names as the account's are this device's others from then
  // on, met at once (meetSiblings); one that does not name this device's endpoint, the phone may not
  // have had: it is said again. The same list again says where the others read now, and names them
  // to a device that kept it before devices met. Gives what the first packets tried again change of
  // the contacts.
  private async listFrom(said: Extract<Envelope, { k: 'list' }>): Promise<((contacts: Contact[]) => Contact[]) | null> {
    const { e2e } = this.chats;
    const account = this.data.account;
    if (!this.data.primary || !account) return null;
    const bundle = fromBase64Url(said.ak);
    if ((await core.bundleIdentity(bundle).then(toHex, () => '')) !== account) return null;
    const own = e2e.own();
    const kept = own?.identity === account ? own.list : null;
    const endpoint = e2e.endpoint();
    const held = endpoint && this.data.siblings?.of === endpoint.id ? this.data.siblings : null;
    const body = await verifyList(bundle, account, said.list, Math.max(kept?.n ?? 0, held?.n ?? 0));
    if (!body) return null;
    // The account's word that this bundle is its own, and this device's pass, kept once both hold
    // (S5): what someone new takes a conversation this device starts by.
    const bound = !!said.ab && !!said.ap && !!endpoint && core.canBind() && (await core.bundleBound(bundle, fromBase64Url(said.ab)).then((id) => !!id && toHex(id) === account, () => false));
    const passed = bound && (await verifyPass(bundle, account, said.ap!, endpoint!.id)) ? { ab: said.ab!, ap: said.ap! } : null;
    const routes = said.routes ?? {};
    let real = kept?.real ?? [];
    if (body !== 'same') {
      real = said.real ? said.real.filter((id) => body.d.some((e) => e.i === id)) : body.d.map((e) => e.i);
      const list = { b: said.list.b, s: said.list.s, n: body.n, real };
      this.act(async () => {
        await e2e.keepOwn({ identity: account, bundle: said.ak, list, ...(passed ?? (own?.identity === account && own.ab && own.ap ? { ab: own.ab, ap: own.ap } : {})) });
        if (endpoint && !real.includes(endpoint.id)) await this.tellEndpoint(true);
      });
    }
    // The same list again, with a new pass: kept with it.
    if (body === 'same' && passed) this.act(() => e2e.keepPass(account, passed.ab, passed.ap));
    if (!endpoint) return null;
    // The same list again: as kept, unless the one kept is not that one yet (keepOwn, in the work
    // after).
    const named = body !== 'same' ? body : kept && kept.n >= (held?.n ?? 0) ? bodyOf(kept) : null;
    if (named) return this.meetSiblings(siblingsFrom(held, endpoint.id, named.n, named.d, real, routes, newPacketKey));
    return held ? this.meetSiblings(withRoutes(held, routes)) : null;
  }

  // ---- The account's other devices, directly (lib/siblings.ts) ----

  private siblingList(): Sibling[] {
    return this.data.primary ? (this.data.siblings?.list ?? []) : [];
  }

  // On the primary: the other linked devices a device reaches directly: both are in the list as
  // last signed.
  private othersOf(peer: Peer): Peer[] {
    const real = this.chats.e2e.signedList()?.real ?? [];
    const listed = (d: Peer) => d.linked && !!d.endpoint && real.includes(d.endpoint.id);
    return listed(peer) ? this.data.devices.filter((d) => d.id !== peer.id && listed(d)) : [];
  }

  private async keepSibling(sibling: Sibling): Promise<void> {
    const siblings = this.data.siblings;
    if (siblings) await this.save({ ...this.data, siblings: { ...siblings, list: siblings.list.map((s) => (s.id === sibling.id ? sibling : s)) } });
  }

  // In the turn: the others as a list names them, each this device starts a conversation with
  // started, and the first packets that came before a list named their senders tried again.
  private async meetSiblings(siblings: Siblings): Promise<((contacts: Contact[]) => Contact[]) | null> {
    const own = this.chats.e2e.endpoint();
    const list: Sibling[] = [];
    for (const s of siblings.list) list.push(own && !s.conversation && starts(own.id, s.id) ? await this.startSibling(s) : s);
    const now = Date.now();
    const waiting = siblings.early.filter((e) => now - e.at < EARLY_LASTS);
    await this.save({ ...this.data, siblings: { ...siblings, list, early: waiting } });
    let contacts: ((c: Contact[]) => Contact[]) | null = null;
    for (const early of waiting) {
      const taken = await this.siblingFirst(fromBase64(early.packet), true);
      contacts = both(contacts, taken?.kind === 'taken' ? (taken.contacts ?? null) : null);
    }
    void this.flush().catch(() => undefined);
    return contacts;
  }

  // Starts the conversation with another device, as the one with the lower id does: its first
  // packet says where this one reads and the key it gives, then what waited for it goes. Started
  // again (`again`), the one before is kept to open what the other sealed there while away (`before`).
  private async startSibling(sibling: Sibling): Promise<Sibling> {
    const first = encodeOne({ k: 'here' }, this.at, sibling.key);
    const started = first && (await this.chats.e2e.startAsEndpoint(fromBase64Url(sibling.bundle), first).catch(() => null));
    if (!started) return sibling;
    const before = sibling.conversation ? [sibling.conversation, ...(sibling.before ?? [])].slice(0, MAX_BEFORE) : [];
    // As for a contact's endpoint (lib/e2e.ts): by how many it had before this one.
    const again = Date.now() + againAfter(sibling.conversation ? 1 + (sibling.before?.length ?? 0) : 0);
    let met: Sibling = { ...sibling, ...(before.length > 0 ? { before } : {}), conversation: toBase64(started.conversation), outbox: [toBase64(started.packet)], held: [], told: this.at ? JSON.stringify(this.at) : '', again };
    for (const json of sibling.held) met = await this.seal(met, JSON.parse(json) as Envelope);
    return met;
  }

  // Seals an envelope for another device, in the turn; held while it is to start the conversation.
  // One that has said nothing in the conversation this one started, a day after it went, may never
  // have had its first packet: it starts again, and so on until it answers, ever less often.
  private async sealSibling(sibling: Sibling, envelope: Envelope): Promise<Sibling> {
    const own = this.chats.e2e.endpoint();
    const again = !!own && starts(own.id, sibling.id) && !!sibling.conversation && sibling.outbox.length === 0 && sibling.again !== undefined && Date.now() >= sibling.again;
    if (again) {
      const started = await this.startSibling(sibling);
      if (started.conversation !== sibling.conversation) return this.seal(started, envelope);
    }
    if (sibling.conversation) return this.seal(sibling, envelope);
    if (own && starts(own.id, sibling.id)) {
      const started = await this.startSibling(sibling);
      if (started.conversation) return this.seal(started, envelope);
    }
    return { ...sibling, held: [...sibling.held, JSON.stringify(envelope)].slice(-MAX_HELD) };
  }

  // Seals an envelope for each other device, or those `only` names, in the turn.
  private async sealSiblings(envelope: Envelope, only?: string[]): Promise<Siblings | undefined> {
    const siblings = this.data.siblings;
    if (!siblings || !this.data.primary) return siblings;
    const list: Sibling[] = [];
    for (const s of siblings.list) list.push(only && !only.includes(s.id) ? s : await this.sealSibling(s, envelope));
    return { ...siblings, list };
  }

  // On a linked device, in the turn: a first packet that may be another device's, starting a
  // conversation with this one's endpoint. Taken only from a device the list last checked names,
  // one that should start it, and once; one from a device that list names but that was not met yet
  // (the phone said nothing of where it reads) is tried again with the next, a few for a while
  // (`retry`). One from anyone else is dropped, so none can push those out: a device a later list
  // names starts again a day or more later, as it heard nothing back. Null for one that is not for
  // this endpoint.
  private async siblingFirst(packet: Uint8Array, retry = false): Promise<Taken> {
    const { e2e } = this.chats;
    const own = e2e.endpoint();
    if (!this.data.primary || !own) return null;
    let opened: core.Opened;
    try {
      opened = await e2e.acceptAsEndpoint(packet);
    } catch {
      return null;
    }
    // A contact's, or one of their endpoints', is the chat's (lib/e2e.ts).
    const value = parse(opened.plaintext);
    if (value?.v !== 1 || !isText(value.k)) return null;
    const from = toHex(await core.conversationPeer(opened.conversation));
    // The account itself: its phone, put back from a backup, asking to link again.
    if (from === this.data.account) return this.askedFrom(opened, packet);
    const id = toHex(await core.firstMessageId(packet)).slice(0, 32);
    const early = toBase64(packet);
    const held = this.data.siblings?.of === own.id ? this.data.siblings : null;
    const siblings: Siblings = held ?? { of: own.id, n: 0, list: [], seen: [], early: [] };
    const rest = siblings.early.filter((e) => e.packet !== early);
    const sibling = siblings.list.find((s) => s.id === from);
    if (!sibling && !siblings.seen.includes(id)) {
      const named = e2e.own()?.list?.real.includes(from) === true;
      if (!retry && named) await this.save({ ...this.data, siblings: { ...siblings, early: withEarly(siblings.early, early, Date.now()) } });
      return { kind: 'taken' };
    }
    if (!sibling || siblings.seen.includes(id) || !starts(from, own.id)) {
      if (rest.length < siblings.early.length) await this.save({ ...this.data, siblings: { ...siblings, early: rest } });
      return { kind: 'taken' };
    }
    // What was sealed in the one before still goes: one that started again keeps that to open in
    // (`before`), and to one that lost it, it is nothing. What waited goes now.
    const { again: _again, before: _before, ...was } = sibling;
    let met: Sibling = { ...was, conversation: toBase64(opened.conversation), heard: Date.now(), held: [], told: '' };
    for (const json of sibling.held) met = await this.seal(met, JSON.parse(json) as Envelope);
    const list = siblings.list.map((s) => (s.id === from ? met : s));
    await this.save({ ...this.data, siblings: { ...siblings, list, seen: [...siblings.seen, id].slice(-MAX_SEEN), early: rest } });
    void this.flush().catch(() => undefined);
    const said = this.parts.take(from, opened.plaintext);
    return said ? this.fromSibling(met, said) : { kind: 'taken' };
  }

  // A packet that continues another device's conversation, in the turn, or null if it does not:
  // in the one this device writes in, or one it started before that one.
  private async openFromSibling(sibling: Sibling, packet: Uint8Array): Promise<Taken> {
    if (!sibling.conversation) return null;
    const kept = [sibling.conversation, ...(sibling.before ?? [])];
    let opened: core.Opened | null = null;
    let at = -1;
    while (!opened && ++at < kept.length) opened = await core.open(fromBase64(kept[at]), packet).catch(() => null);
    if (!opened) return null;
    const now = Date.now();
    const conversation = toBase64(opened.conversation);
    // It answered in the one this device writes in: it has the first packet, and none is started
    // again. In one before: it was away, and has the first packet of the last one still to read.
    const { again: _again, before: _before, ...answered } = sibling;
    const moved: Sibling = at === 0 ? { ...answered, conversation, heard: now } : { ...sibling, before: kept.slice(1).map((c, j) => (j === at - 1 ? conversation : c)), heard: now };
    await this.keepSibling(moved);
    const said = this.parts.take(sibling.id, opened.plaintext, now);
    return said ? this.fromSibling(moved, said) : { kind: 'taken' };
  }

  // What another device said directly, in the turn: where it reads and the key it gives; what it
  // sealed for a contact, kept here as this device's own, as from the phone; a change it made to a
  // contact. Nothing else is taken from it: what only the phone says comes from the phone.
  private async fromSibling(sibling: Sibling, said: Envelope & { at?: Place; pk?: string }): Promise<Taken> {
    let moved = sibling;
    if (said.at && JSON.stringify(said.at) !== JSON.stringify(sibling.at)) moved = { ...moved, at: said.at };
    if (said.pk && said.pk !== sibling.sealTo) moved = { ...moved, sealTo: said.pk };
    if (moved !== sibling) await this.keepSibling(moved);
    if (said.k === 'out') this.act(() => this.ownFrom(said.c, said.m, said.mark));
    else if (said.k === 'came') this.act(() => this.cameHere(said.c, said.got));
    else if (said.k === 'set') return this.setFrom(said);
    else if (said.k === 'sync') return this.syncOnDevice(await this.syncHeard(sibling.id, said.s).catch(() => null), null);
    else if (said.k === 'notes') {
      await this.heardNotes({ id: sibling.id, sibling: true });
      void this.noting(() => this.notesFrom(said, said.keep === true));
    }
    return { kind: 'taken' };
  }

  // In the turn: a change another device made to a contact, and when. Each field it set later than
  // the one kept here is taken, a request only accepted; a contact it removed goes, unless added
  // here again since, and stays removed for what comes of it later; one it added comes, unless
  // removed here since.
  private async setFrom(said: Extract<Envelope, { k: 'set' }>): Promise<Taken> {
    const { c, when: at } = said;
    const primary = this.data.primary;
    if (at === undefined || !primary) return { kind: 'taken' };
    const kept = this.data.synced[c];
    if (said.remove) {
      if (!goesFor(kept, at)) return { kind: 'taken' };
      const { [c]: _gone, ...synced } = this.data.synced;
      await this.save({ ...this.data, synced, removed: withRemoved(this.data.removed ?? {}, c, at) });
      if (kept) this.act(() => this.clearChats([c]));
      return { kind: 'taken', contacts: (contacts) => contacts.filter((x) => x.identity !== c) };
    }
    const next = changedBy(kept, c, said.change, at, said.added === true, this.data.removed?.[c] ?? 0);
    if (!next) return { kind: 'taken' };
    const { [c]: _removed, ...removed } = this.data.removed ?? {};
    await this.save({ ...this.data, synced: { ...this.data.synced, [c]: next }, ...removedOf(removed) });
    const account = this.data.account;
    return {
      kind: 'taken',
      contacts: (contacts) => {
        const i = contacts.findIndex((x) => x.identity === c);
        const mirror = mirrorOf(next, contacts[i], primary.at, account);
        return i < 0 ? [...contacts, mirror] : contacts.map((x, j) => (j === i ? mirror : x));
      },
    };
  }

  // Whether a chat's message (by its peer and tag) was erased on this device, or on another and said
  // here.
  private erasedHere(peer: string, tag: string): boolean {
    return this.data.erased?.[peer]?.includes(tag) ?? false;
  }

  // ---- Chat with myself (lock/myself-data.ts) ----
  //
  // The space's notes go to the account's other devices as they change here: on the primary to each
  // linked device, on a linked device to the phone and to each other device it reaches directly; what
  // a device says to the phone goes on from it to the devices that do not hear that one directly
  // (passOn). Each side first says, with nothing in it, that it takes them, once (`notesSaid`): a
  // version from before says nothing back, and is told nothing more until, updated, it says so
  // itself. A device heard from is
  // told every note once, then each change made here after, by stamp (Peer.notesTold), as far as
  // half its outbox has room; the rest with a later tick. A photo or file goes on the relay, once for
  // all the devices told it at once, and stays there for them (`keep`) until it expires, or, for one
  // device, until it took it; a voice message's sound goes with its note.

  // The notes of these links' own chats: the space's, or the hidden place's (components/myself-chat.tsx).
  private notesPlace(): NotesPlace {
    return { holder: this.holder, space: this.space, key: this.key };
  }

  private noting(call: () => Promise<unknown>): Promise<unknown> {
    this.notesWork = this.notesWork
      .catch(() => undefined)
      .then(() => (this.closed ? undefined : call()))
      .catch(() => undefined);
    return this.notesWork;
  }

  /** A change made here to a space's notes, or a hidden place's (lock/myself-data.ts): told to the account's other devices. */
  notesWritten(place: NotesPlace): void {
    if (this.closed || place.holder !== this.holder || place.space !== this.space || !this.role()) return;
    void this.noting(() => this.tellNotes());
  }

  // Who the notes go to: on the primary each linked device; on a linked device the phone, and each
  // other device it reaches directly.
  private notesTargets(): NotesTarget[] {
    if (!this.data.primary) return this.data.devices.filter((d) => d.linked).map((d) => ({ id: d.id, sibling: false }));
    return [{ id: this.data.primary.id, sibling: false }, ...this.siblingList().filter((s) => s.conversation).map((s) => ({ id: s.id, sibling: true }))];
  }

  private notesTarget({ id, sibling }: NotesTarget): Peer | Sibling | undefined {
    if (sibling) return this.siblingList().find((s) => s.id === id);
    return this.data.primary?.id === id ? this.data.primary : this.data.devices.find((d) => d.id === id && d.linked);
  }

  private async keepTarget({ sibling }: NotesTarget, next: Peer | Sibling): Promise<void> {
    if (sibling) await this.keepSibling(next as Sibling);
    else await this.keepPeer(next as Peer);
  }

  // In the turn: a device said something of the notes, so it takes them. Heard of for the first
  // time, it is told them.
  private async heardNotes(target: NotesTarget): Promise<void> {
    const now = this.notesTarget(target);
    if (!now || now.notesHeard) return;
    await this.keepTarget(target, { ...now, notesHeard: true });
    void this.noting(() => this.tellNotes());
  }

  // Tells each device what of the notes it was not told yet; to one not heard from, says once that
  // this side takes them.
  private async tellNotes(): Promise<void> {
    if (this.closed || !this.role()) return;
    this.notesLeft = false;
    const targets = this.notesTargets();
    const place = this.notesPlace();
    // The photos and files put on the relay this time, by note, each for all the devices told it now.
    const offers = new Map<string, FileOffer | null>();
    const keep = targets.filter((target) => this.notesTarget(target)?.notesHeard).length > 1;
    let here: Here | null | undefined;
    const ownRelay = async () => (here === undefined ? (here = await this.here()) : here);
    for (const target of targets) {
      const now = this.notesTarget(target);
      if (!now) continue;
      if (!now.notesHeard) {
        if (now.notesSaid) continue;
        await this.run(async () => {
          const peer = this.notesTarget(target);
          if (peer && !peer.notesSaid) await this.keepTarget(target, { ...(await this.sealFor(target, peer, { k: 'notes', list: [], gone: [] })), notesSaid: true });
        });
        continue;
      }
      let told = now.notesTold ?? 0;
      const batches = notesBatches(await notesSince(place, told, told === 0));
      // Nothing to tell one heard from, not yet told this side takes them too: it is said so.
      if (batches.length === 0 && !now.notesSaid) batches.push({ notes: [], gone: [], v: told });
      for (const batch of batches) {
        const list: NoteSaid[] = [];
        for (const note of batch.notes) {
          const said = await this.noteSaid(note, offers, ownRelay);
          if (said === 'later') {
            this.notesLeft = true;
            void this.flush().catch(() => undefined);
            return;
          }
          if (said) list.push(said);
        }
        const envelope: Envelope = { k: 'notes', list, gone: batch.gone, ...(keep && list.some((n) => n.file) ? { keep: true as const } : {}) };
        const from = told;
        const went = await this.run(async () => {
          const peer = this.notesTarget(target);
          if (!peer || (peer.notesTold ?? 0) !== from || peer.outbox.length >= MAX_OUTBOX / 2) return false;
          let sealed: Peer | Sibling;
          try {
            sealed = await this.sealFor(target, peer, envelope);
          } catch {
            // Too long to go between devices, as it should never be: passed over, so the rest still go.
            await this.keepTarget(target, { ...peer, notesTold: batch.v });
            return true;
          }
          if (sealed.outbox.length === 0 || (sealed.conversation === peer.conversation && sealed.outbox.length <= peer.outbox.length)) return false;
          await this.keepTarget(target, { ...sealed, notesTold: batch.v, notesSaid: true });
          return true;
        });
        if (!went) {
          this.notesLeft = true;
          break;
        }
        told = batch.v;
      }
    }
    void this.flush().catch(() => undefined);
  }

  private sealFor(target: NotesTarget, peer: Peer | Sibling, envelope: Envelope): Promise<Peer | Sibling> {
    return target.sibling ? this.sealSibling(peer as Sibling, envelope) : this.seal(peer as Peer, envelope);
  }

  // A note as it goes to a device: its photo or file put on the relay, once for all the devices told
  // it now, or as where it waits there, not taken here yet; its voice message's sound with it. Null
  // for one whose photo, file or voice message is not here (not in a backup) and has no words;
  // 'later' while the relay cannot take it.
  private async noteSaid(note: Note, offers: Map<string, FileOffer | null>, here: () => Promise<Here | null>): Promise<NoteSaid | null | 'later'> {
    const said: NoteSaid = { id: note.id, at: note.at, v: noteStamp(note), text: note.text, ...(note.due !== undefined ? { due: note.due } : {}), ...(note.every ? { every: note.every } : {}), ...(note.told ? { told: true as const } : {}), folder: note.folder ?? '' };
    if (note.file) {
      let offer = offers.get(note.id);
      if (offer === undefined) {
        if (note.file.from) offer = offerOf(note.file);
        else {
          const at = await here();
          if (!at) return 'later';
          try {
            offer = await uploadFile(at.own, note.file);
          } catch (error) {
            if (!(error instanceof FileMissingError)) return 'later';
            offer = null;
          }
        }
        offers.set(note.id, offer);
      }
      if (offer) return { ...said, file: offer };
    } else if (note.voice) {
      const audio = await loadClip(note.voice).catch(() => null);
      const data = audio ? toBase64(audio) : '';
      if (data && data.length <= MAX_NOTE_VOICE) return { ...said, voice: { ms: note.voice.ms, data } };
    } else return said;
    return note.text ? said : null;
  }

  // What another device said of the notes: of each, the later change kept; a photo or file then
  // taken from the relay, and left there with `leave`, for the other devices that take it too.
  private async notesFrom(said: Extract<Envelope, { k: 'notes' }>, leave: boolean): Promise<void> {
    const came = said.list.map(
      (n): NoteCame => ({
        note: { id: n.id, at: n.at, v: n.v, text: n.text, ...(n.due !== undefined ? { due: n.due } : {}), ...(n.every ? { every: n.every } : {}), ...(n.told ? { told: true as const } : {}), ...(n.folder !== undefined ? { folder: n.folder } : {}) },
        make: async () => {
          if (n.file) return { file: offerRef(n.file) };
          if (!n.voice) return {};
          try {
            return { voice: await saveClip(fromBase64(n.voice.data), n.voice.ms) };
          } catch {
            return {};
          }
        },
      }),
    );
    const { changed } = await mergeNotes(this.notesPlace(), came, said.gone);
    if (changed.some((n) => n.file?.from)) await this.takeNoteFiles(leave);
  }

  // The photos and files of notes that came and are still on the relay: taken, and left there with
  // `leave`, as a later try does, not knowing whether another device still takes one. One gone from
  // the relay stays as it is (not on this phone), and is not tried again while the space is open.
  private async takeNoteFiles(leave = true): Promise<void> {
    this.noteFilesLeft = false;
    const place = this.notesPlace();
    const waiting = (await loadNotes(place)).filter((n) => !!n.file?.from && onRelay(n.file.from) && !this.notesLost.has(n.id));
    if (waiting.length === 0) return;
    const here = await this.here();
    if (!here) {
      this.noteFilesLeft = true;
      return;
    }
    for (const note of waiting) {
      if (this.closed) return;
      const file = note.file!;
      try {
        const taken = await takeFile(here.own, file, undefined, leave);
        if (!(await setNoteFile(place, note.id, file.from!.ids, taken))) await deleteChunks(taken.id, taken.count).catch(() => undefined);
      } catch (error) {
        if (error instanceof FileGoneError || error instanceof FileDamagedError) this.notesLost.add(note.id);
        else {
          this.noteFilesLeft = true;
          return;
        }
      }
    }
  }

  // ---- Photos and files left on the relay (lib/attachments.ts, TakenFiles) ----

  leave(): boolean {
    // On the primary, whether a device is still to take it is known once the turn that told it ended (`taken`).
    return this.role() !== null;
  }

  taken(from: FileFrom, left: boolean): void {
    if (this.data.primary) {
      // The phone deletes it there, once each device took it.
      if (left) void this.say({ k: 'took', ids: [from.ids] }).catch(() => undefined);
      return;
    }
    void this.run(async () => {
      const kept = this.data.left.find((l) => l.ids === from.ids);
      const waits = left && !!kept && kept.devices.length > 0;
      if (kept) await this.save({ ...this.data, left: waits ? this.data.left.map((l) => (l === kept ? { ...l, phone: false } : l)) : this.data.left.filter((l) => l !== kept) });
      return left && !waits;
    })
      .then((drop) => {
        if (drop) this.act(() => this.drop(from));
      })
      .catch(() => undefined);
  }

  // On the primary: a device took the photos and files `ids`, or, with null, takes none any more,
  // unlinked. Those no one else is still to take are deleted from the relay.
  private async letGo(device: string, ids: string[] | null): Promise<void> {
    const done = await this.run(async () => {
      const gone: Left[] = [];
      const left: Left[] = [];
      for (const l of this.data.left) {
        if (!l.devices.includes(device) || (ids && !ids.includes(l.ids))) left.push(l);
        else if (l.devices.length === 1 && !l.phone) gone.push(l);
        else left.push({ ...l, devices: l.devices.filter((d) => d !== device) });
      }
      if (left.length !== this.data.left.length || left.some((l, i) => l !== this.data.left[i])) await this.save({ ...this.data, left });
      return gone;
    });
    for (const l of done) await this.drop(l);
  }

  private async drop(from: FileFrom): Promise<void> {
    const here = await this.here().catch(() => null);
    if (here) await dropFile(here.own, from).catch(() => undefined);
  }

  // ---- The relay ----

  // What waits for each peer goes to its queue, oldest first; what went leaves the outbox. Where
  // this side reads goes to those told otherwise, and a device that fell behind is caught up.
  flush(): Promise<void> {
    if (this.closed) return Promise.resolve();
    if (this.flushing) {
      this.again = true;
      return this.flushing;
    }
    const run = (async () => {
      do {
        this.again = false;
        const here = await this.here();
        if (!here) throw new Error(t('Type the server address first.'));
        const told = JSON.stringify(here.place);
        if (this.linked().some((p) => p.told !== told)) {
          for (const p of this.linked()) if (p.told !== told) await this.say({ k: 'here' }, p.id);
        }
        const unsaid = this.siblingList().filter((s) => s.conversation && s.told !== told);
        if (unsaid.length > 0) {
          await this.run(async () => {
            const siblings = await this.sealSiblings({ k: 'here' }, unsaid.map((s) => s.id));
            await this.save({ ...this.data, siblings });
          });
        }
        if (!this.data.primary && this.data.link !== this.ownLink() && this.linked().length > 0) {
          const link = this.ownLink();
          await this.run(async () => {
            const devices: Peer[] = [];
            for (const d of this.data.devices) devices.push(d.linked ? await this.seal(d, { k: 'contacts', all: false, list: [], gone: [], link }) : d);
            await this.save({ ...this.data, devices, link });
          });
        }
        // One device the relay cannot reach holds none of the others back.
        let failed: unknown = null;
        for (const peer of [...(this.data.primary ? [this.data.primary] : []), ...this.data.devices]) {
          await this.flushPeer(here, peer.id).catch((error: unknown) => {
            failed ??= error;
          });
        }
        for (const sibling of this.siblingList()) {
          await this.flushSibling(here, sibling.id).catch((error: unknown) => {
            failed ??= error;
          });
        }
        for (const asked of this.data.asked ?? []) {
          await this.flushAsked(here, asked.id).catch((error: unknown) => {
            failed ??= error;
          });
        }
        await this.flushAsking(here).catch((error: unknown) => {
          failed ??= error;
        });
        await this.catchUp();
        if (failed) throw failed;
      } while (this.again);
    })();
    this.flushing = run;
    return run.then(
      () => {
        this.flushing = null;
        this.retries = 0;
      },
      (error: unknown) => {
        this.flushing = null;
        this.retryLater();
        throw error;
      },
    );
  }

  private retryLater() {
    if (this.closed || this.retryTimer) return;
    const wait = Math.min(RETRY_MOST, RETRY * 2 ** this.retries++);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.flush().catch(() => undefined);
    }, wait);
  }

  private async flushPeer(here: Here, id: string): Promise<void> {
    const find = () => (this.data.primary?.id === id ? this.data.primary : this.data.devices.find((d) => d.id === id));
    const peer = find();
    if (!peer || peer.outbox.length === 0) return;
    await this.sendOut(here, peer.at, peer.outbox, async (sent) => {
      const now = find();
      if (now) await this.keepPeer(withoutSent(now, sent));
    }, peer.marks, id);
  }

  // What waits for another device, to where it reads once that is known.
  private async flushSibling(here: Here, id: string): Promise<void> {
    const find = () => this.siblingList().find((s) => s.id === id);
    const sibling = find();
    if (!sibling?.at || sibling.outbox.length === 0) return;
    await this.sendOut(here, sibling.at, sibling.outbox, async (sent) => {
      const now = find();
      const outbox = now?.outbox.filter((p) => !sent.has(p));
      if (now && outbox) await this.keepSibling({ ...now, outbox, behind: outbox.length > 0 ? now.behind : 0 });
    }, undefined, id);
  }

  // Sends what waits in an outbox to the queue at `at`, oldest first, each quiet but as `marks`
  // says; `went` takes what went out of it, in the turn.
  // A device heard on a link nearby (the same Wi-Fi) is handed them there first, each once, so they
  // come with no internet too; the relay's copy still goes, as the outbox keeps them until it took
  // them, and the one that comes second is let be.
  private async sendOut(here: Here, at: Place, outbox: string[], went: (sent: Set<string>) => Promise<void>, marks?: Record<string, OutMark>, near?: string): Promise<void> {
    if (near && this.pocket === null) {
      const fresh = outbox.filter((p) => !this.nearGiven.has(p));
      if (fresh.length > 0 && nearby.toHeard(`device:${near}`, fresh.map((p) => fromBase64(p)))) for (const p of fresh) this.nearGiven.add(p);
    }
    const to = contactTarget(here.sends, at);
    const sent = new Set<string>();
    try {
      for (const packet of outbox) {
        const mark = marks?.[packet];
        await sendMessage(to, fromHex(at.sender), fromBase64(packet), mark === 'none' ? undefined : (mark ?? 'quiet'));
        sent.add(packet);
      }
    } finally {
      for (const p of sent) this.nearGiven.delete(p);
      if (sent.size > 0) await this.run(() => went(sent));
    }
  }

  // What was handed to a device nearby already, until the relay took it too.
  private readonly nearGiven = new Set<string>();

  // A device the outbox had no room for, once it drained: the contacts again, and the history from when it fell behind.
  private async catchUp(): Promise<void> {
    // On a device that holds the groups, the phone it could not tell of them: all of them again,
    // what it has already kept once (lib/link-wire.ts mirrorGroups).
    const primary = this.data.primary;
    if (primary && this.data.holds && primary.behind && primary.outbox.length === 0) {
      await this.run(() => this.save({ ...this.data, primary: { ...this.data.primary!, behind: 0, groups: {} } }));
      this.groupsChanged();
    }
    for (const d of this.data.devices) {
      if (!d.linked || !d.behind || d.outbox.length > 0) continue;
      await this.run(async () => {
        const now = this.data.devices.find((p) => p.id === d.id);
        if (!now) return;
        const contacts = await this.seal({ ...now, behind: 0 }, { k: 'contacts', all: true, list: this.contactsNow(), gone: [], link: this.ownLink() });
        const said = await this.groupsTo(await this.seal(contacts, { k: 'blocked', list: [...this.chats.e2e.blocked()] }), true);
        const history = { since: now.behind, files: now.files, upTo: Date.now(), done: 0 };
        await this.keepPeer({ ...said, history });
      });
      // The contacts go with this flush; what was done in the groups meanwhile, after the history.
      this.again = true;
      this.act(() => this.bringHistory(d.id));
      this.groupsChanged();
    }
  }

  // Looked at now and then while the space is open: what waits, the history still to bring, what a
  // device wrote that could not go yet, and a group's message that could not go to the devices yet.
  private tick(): void {
    if (this.closed) return;
    // The places that fill the device list, emptied now and then, whether or not a device is
    // linked, and made again where this phone reads now; one that has no queue yet, with each tick.
    // A list this phone put back from a backup holds no longer, once a contact says they hold a
    // later one.
    const signed = this.chats.e2e.signedList();
    if (!this.data.primary && signed && Date.now() - this.drainedAt >= DRAIN_EVERY) {
      this.drainedAt = Date.now();
      this.act(() => this.drainFillers());
    } else if (!this.data.primary && signed && this.routesLeft(signed)) this.act(() => this.routeList());
    if (!this.data.primary && core.canSign() && this.chats.e2e.newestHeld() > (signed?.n ?? 0)) this.act(() => this.signAgain());
    if (!this.data.primary && this.data.resign && Date.now() - (this.data.resignedAt ?? 0) >= RESIGN_EVERY) this.act(() => this.resignDue());
    if (this.waysLeft) this.act(() => this.run(() => this.tellWays()).then(() => this.flush()));
    // The groups' state handed on and not said taken (S6), told again; and, from a device, once as
    // it opens, that it can hold them.
    if (this.groups?.groups.handed()) this.act(() => this.sendHanded());
    if (this.data.primary && !this.saidCan) this.act(() => this.sayCan());
    // What the relay dropped by now.
    const old = Date.now() - LEFT_LASTS;
    if (this.data.left.some((l) => l.at < old)) {
      void this.run(async () => {
        await this.save({ ...this.data, left: this.data.left.filter((l) => l.at >= old) });
      }).catch(() => undefined);
    }
    // Linking again (lib/link-again.ts): on a linked device, the key to be asked with, given the
    // phone once with each link, and an ask no longer taken, after as long as the relay keeps what
    // waits; on the primary, what a backup carries for it kept as the devices are, and what waits
    // for a device of a backup's phone asked, whether or not one is linked here.
    if (this.data.primary && !this.data.primary.relink && this.chats.e2e.endpoint()) this.act(() => this.run(() => this.giveRelink()));
    const asking = this.data.asking;
    if (asking && Date.now() - (asking.offer?.made ?? asking.made) > AGAIN_LASTS) {
      void this.run(async () => {
        if (this.data.asking === asking) await this.save(withoutAsking(this.data));
      }).then(() => this.announce(), () => undefined);
    }
    if (!this.data.primary) this.act(() => this.keepRelinks());
    // A device linked a day or more ago that says its endpoint as this version does but gave no
    // key, as one linked while this phone's Erevos was older: asked for it once as the space opens,
    // then once a day.
    for (const d of this.data.devices) {
      const now = Date.now();
      if (!d.linked || !d.endpoint?.ek || d.relink || now - d.since < RELINK_ASK_EVERY || now - (this.relinkAsked.get(d.id) ?? 0) < RELINK_ASK_EVERY) continue;
      this.relinkAsked.set(d.id, now);
      this.act(() => this.say({ k: 'relink' }, d.id));
    }
    if (!this.role()) {
      if (this.data.asked?.some((a) => a.outbox.length > 0)) this.flush().catch(() => undefined);
      return;
    }
    if (Date.now() - this.syncSaid >= SYNC_EVERY) {
      this.syncSaid = Date.now();
      void this.syncs.ask().catch(() => undefined);
    }
    if (Date.now() - this.collectionLooked >= ACCOUNTS_EVERY) {
      this.collectionLooked = Date.now();
      void this.collection.written().catch(() => undefined);
      void this.laterWritten().catch(() => undefined);
    }
    if (!this.data.primary && Date.now() - this.smsLooked >= ACCOUNTS_EVERY) void this.smsShare().catch(() => undefined);
    if (!this.data.primary && Date.now() - this.accountsLooked >= ACCOUNTS_EVERY) {
      this.accountsLooked = Date.now();
      void this.followAccounts().catch(() => undefined);
    }
    // As notes are still to be told, or a device met since was not said to that this side takes them.
    if (this.notesLeft || this.notesTargets().some((target) => !this.notesTarget(target)?.notesSaid)) void this.noting(() => this.tellNotes());
    if (this.noteFilesLeft) void this.noting(() => this.takeNoteFiles());
    this.flush().catch(() => undefined);
    if (this.data.primary && this.data.packs.length > 0) this.act(() => this.takePacks());
    for (const d of this.data.devices) if (d.linked && d.history) this.act(() => this.bringHistory(d.id));
    if (this.later.length > 0) this.act(() => this.sendLater());
    if (this.groupsLate) this.groupsChanged();
    // A device not told the device list as last signed, or where its others read, as one its outbox
    // had no room for.
    const list = !this.data.primary && core.canSign() ? this.chats.e2e.signedList() : null;
    const untold = (d: Peer) => d.listed !== list?.n || (!!d.endpoint && d.routed !== JSON.stringify(this.routesFor(d))) || (!!d.endpoint && core.canBind() && !!list?.real.includes(d.endpoint.id) && ((d.passed ?? 0) - Date.now() <= PASS_RENEW || d.passTo !== JSON.stringify(this.accountReads())));
    if (list && this.data.devices.some((d) => d.linked && untold(d))) this.act(() => this.tellList());
  }

  // Seals word for a contact as the chat does, and hands it to their phone nearby when it is, and
  // to the relay, saying what it carries (`mark`); then its copies for the endpoints of their
  // account go too, and, with `waits`, also once the relay could take it only later, as it is tried
  // again as it is (lib/e2e.ts copiesAfter).
  // A hidden place's goes through the relay, or Nostr, only, as its chat's does (lib/waiting.ts
  // handOverHidden), and its copies go though the relay could take it only later only once their
  // account's queue is full.
  private async deliver(identity: string, sealed: { sender: string; relay: string; relayKey: string; spare: Contact['spare']; first: Uint8Array | null; packet: Uint8Array; copies: number } & ForNostr, here: Here, mark: RelayMark, waits = false) {
    const send = () => sendSealed(here.sends, sealed, [sealed.packet], mark, () => this.chats.e2e.firstSent(identity));
    const relay = sealed.sender ? orNostr(this.chats.e2e, here.sends, identity, sealed, [sealed.packet], send) : null;
    if (this.pocket !== null) {
      await this.chats.e2e.copiesAfter(sealed.copies, relay ? relay() : Promise.reject(new Error(t('There is no server.'))), waits && 'full');
      return;
    }
    await this.chats.e2e.copiesAfter(sealed.copies, nearby.deliver(identity, sealed.first ? [sealed.first, sealed.packet] : [sealed.packet], relay), waits);
  }

  // ---- On the primary: what a device wrote ----

  // A message a device wrote to a contact: sealed for them as it came, and, one the chat keeps,
  // kept here as this phone's own (Waiting, if it could not go now). What it says was read here is
  // marked read here too, and what it deletes on both phones goes here as well. One for a contact
  // not added here yet, or that could not be handled now, is tried again a few times. A photo or
  // file the device's others were told of too (`shared`) is left where it put it, for them to take.
  private async sendFor(c: string, m: Json, tries = 0, shared = false): Promise<void> {
    try {
      if (await this.sendOne(c, m, shared)) return;
    } catch {
      // Tried again, below.
    }
    if (tries < LATER_TRIES) this.later = [...this.later, { c, m, tries: tries + 1, shared }].slice(-MAX_LATER);
  }

  // Says whether it is done with the message, or it should be tried again.
  private async sendOne(c: string, m: Json, shared: boolean): Promise<boolean> {
    const { e2e, history } = this.chats;
    const contact = e2e.record(c);
    if (isSignal(m)) return true;
    if (!contact) return false;
    const peer = peerOf(c);
    const now = Date.now();
    const kept = isKept(m);
    const gone: LinkedChange['gone'] = [];
    const read = tagsOf(m.read);
    if (read.length > 0) {
      await history.mark(peer, false, 2, now, read);
      // Read there: the messages notice no longer counts them here (lib/background.ts).
      if (this.pocket === null) readElsewhere([`chat:${c}`]);
    }
    const erase = isObject(m.erase) ? m.erase : null;
    if (erase?.all === true) {
      await history.clear(peer);
      gone.push({ peer });
    } else if (erase && isTag(erase.tag)) {
      await history.remove(peer, erase.tag);
      gone.push({ peer, tag: erase.tag });
    }
    if (!kept && onlyCame(m, contact.timerAt)) {
      if (gone.length > 0 || read.length > 0) this.announce({ gone });
      return true;
    }
    const here = await this.here().catch(() => null);
    let said = m;
    let file: FileRef | null = null;
    if (kept && isObject(m.file)) {
      // Taken from the device's relay first, then put on this phone's, as the contact deletes theirs
      // once taken. Left where the device put it when its others may take it too: it expires there.
      const offer = readOffer(m.file);
      if (!offer) return true;
      if (!here) return false;
      file = await takeFile(here.own, offerRef(offer), undefined, shared);
      const upload = await uploadFile(here.own, file).catch(() => null);
      said = upload ? { ...m, file: upload } : m;
      if (!upload) {
        await this.keepAsSent(peer, m, file, null, WAITING);
        void sendWaiting(this.chats, this.sendPlace(here)).catch(() => undefined);
        this.announce();
        return true;
      }
    }
    const part = voiceOf(m.voice);
    // A voice message one of whose parts could not go is sent again whole once all came (below),
    // and counted then: its last part goes quiet now. Its parts come in turn, the last after those.
    const voiceKey = `${peer}|${m.tag as string}`;
    const says = part && this.voiceLate.has(voiceKey) ? 'quiet' : relayMarkOf(said);
    // Its copies go though the relay could take it for them only later when it goes again as it is,
    // with its tag: one kept, which waits, or one that says only what came or was read, held for the
    // next message (lib/e2e.ts copiesAfter). Not a reaction, pin, vote or delete, tried again a few
    // times below, as their copies would go with each try.
    const waits = kept || !Object.keys(m).some((key) => !QUIET.has(key));
    let went = false;
    if (here) {
      try {
        await this.deliver(c, await e2e.sealAs(c, utf8Encode(JSON.stringify(said)), here.place.sender, here.where), here, says, waits);
        went = true;
      } catch {
        // It waits, below.
      }
    }
    if (!kept) {
      // What was read goes with the next message to them; what else it says is tried again. Its
      // reaction, pin or vote is this phone's own once it went.
      if (!went && read.length > 0) await e2e.hold(c, 'read', read);
      if (went) await this.marksAsOwn(peer, m, now);
      this.announce({ gone });
      return went || !Object.keys(m).some((key) => !QUIET.has(key));
    }
    let mark: Mark = went ? 0 : WAITING;
    let voice: VoiceRef | null = null;
    if (part) {
      // A voice message is kept once all its parts came; it waits if any could not go.
      if (!went) this.voiceLate.add(voiceKey);
      const whole = this.voiceParts.add(`send ${peer}`, part, now);
      if (!whole) return true;
      mark = this.voiceLate.delete(voiceKey) ? WAITING : 0;
      voice = await saveClip(whole.audio, whole.ms);
    }
    await this.keepAsSent(peer, m, file, voice, mark);
    if (mark === WAITING) void sendWaiting(this.chats, this.sendPlace(here)).catch(() => undefined);
    this.announce();
    return true;
  }

  // Keeps in the history a message a device wrote, as this phone's own, once.
  private async keepAsSent(peer: string, m: Json, file: FileRef | null, voice: VoiceRef | null, mark: Mark): Promise<void> {
    const { e2e, history } = this.chats;
    const tag = m.tag as string;
    if (history.messages().some((x) => x.peer === peer && x.tag === tag)) return;
    const lasts = typeof m.lasts === 'number' && m.lasts > 0 ? m.lasts : 0;
    // One that went lasts the chat's time if it has none of its own; one that waits is given it as it goes.
    const timer = e2e.record(peer.slice(CONTACT_PREFIX.length))?.timer ?? 0;
    await history.add({
      peer,
      text: isText(m.text) ? m.text : '',
      mine: true,
      // When the device sealed it, as it may have waited on the relay for this phone.
      at: cameAt(0, isTime(m.st) ? m.st : 0),
      tag,
      lasts: mark === WAITING ? lasts : lasts || timer,
      mark,
      ...(voice ? { voice } : {}),
      ...(file ? { file } : {}),
      ...(mark === WAITING && m.quiet === true ? { quiet: true } : {}),
    });
  }

  // What a device wrote that could not go to the contact, tried again.
  private async sendLater(): Promise<void> {
    const waiting = this.later;
    this.later = [];
    for (const item of waiting) await this.sendFor(item.c, item.m, item.tries, item.shared);
  }

  // A contact a device added from their link: this phone adds them and starts the conversation.
  // One that cannot be added leaves the devices again.
  // The devices are told it was added when the device added it (`when`), so a removal on another
  // device after that, and before it came here, still removes it.
  private async addFor(code: ContactCode, when?: number): Promise<void> {
    const { e2e } = this.chats;
    const here = await this.here().catch(() => null);
    const added = await core.bundleIdentity(fromBase64Url(code.key)).then(toHex, () => '');
    if (added && when !== undefined && !e2e.record(added)) this.stamps.set(added, { at: when, change: {}, added: true });
    let identity: string;
    try {
      identity = (await e2e.addContact(code, here?.place.sender ?? '', here?.where ?? { relay: '', relayKey: '' })).identity;
    } catch {
      if (added && !e2e.record(added)) await this.say({ k: 'contacts', all: false, list: [], gone: [added] });
      return;
    } finally {
      if (added && when !== undefined) await this.run(async () => this.stamps.delete(added));
    }
    // The conversation's first packet; one the relay does not take now goes with the next look (lib/receiver.ts).
    const first = e2e.pending().find((p) => p.identity === identity);
    if (first && here) {
      try {
        await sendMessage(contactTarget(here.sends, first), fromHex(first.sender), first.first, 'quiet');
        await e2e.firstSent(identity);
      } catch {
        // Sent later.
      }
    }
    this.announce();
    // What the device wrote to them meanwhile.
    if (this.later.length > 0) await this.sendLater();
  }

  // A change a device made to a contact, made here too: the timer only when set later than this
  // phone's, a request only accepted. A timer set later is told to the contact, as the chat does. A
  // device that says when it made the change (`when`) has each field changed only if set later than
  // the one kept, and a contact removed only if not added again since; the devices are told the
  // change with that time.
  private async setFor(c: string, said: Change, remove: boolean, at?: number, del?: Deleted): Promise<void> {
    const { e2e, history } = this.chats;
    const contact = e2e.record(c);
    if (!contact) return;
    const kept = this.data.synced[c];
    if (remove) {
      if (at !== undefined && !goesFor(kept, at)) return;
      // One a device deleted or blocked: this phone's queues move for it, as for one deleted here.
      // What a relay holds for later to them from this phone goes no more, now or with a later look.
      const held = heldFor(history, c);
      if (del) await e2e.deleteContact(c, { block: del === 2, held });
      else await e2e.removeContact(c, { held });
      // And what a look under way held anew for them meanwhile, before their chat is cleared.
      const more = await heldAfter(this.chats, c, held).catch(() => []);
      await history.clear(peerOf(c));
      if (held.length + more.length > 0) void this.here().then((here) => here && dropHeld(e2e, here.sends)).catch(() => undefined);
      this.announce({ gone: [{ peer: peerOf(c) }] });
      return;
    }
    if (at === undefined) return this.makeChange(c, contact, said);
    const change = Object.fromEntries(Object.entries(said).filter(([field]) => !isTimed(field) || at > (kept?.at?.[field] ?? 0))) as Change;
    this.stamps.set(c, { at, change });
    try {
      await this.makeChange(c, contact, change);
    } finally {
      // The devices were told it by then: in the turn after the chat kept it (sendChanges).
      await this.run(async () => this.stamps.delete(c));
    }
  }

  // Makes a change a device made to a contact here, field by field.
  private async makeChange(c: string, contact: Contact, change: Change): Promise<void> {
    const { e2e } = this.chats;
    if (change.name !== undefined && change.name !== contact.name) await e2e.rename(c, change.name);
    if (change.look !== undefined && JSON.stringify(change.look) !== JSON.stringify(contact.look)) await e2e.setLook(c, change.look);
    if (change.avatar !== undefined && change.avatar?.kind !== 'photo' && JSON.stringify(change.avatar) !== JSON.stringify(contact.avatar)) await e2e.setAvatar(c, change.avatar);
    if (change.hide !== undefined && change.hide !== contact.hide) await e2e.setHidden(c, change.hide);
    if (change.tor !== undefined && change.tor !== (contact.tor === true)) await e2e.setTor(c, change.tor);
    if (change.request === false && contact.request) await e2e.acceptRequest(c);
    if (change.timer !== undefined && change.timerAt !== undefined && change.timerAt > contact.timerAt) {
      await e2e.setTimer(c, change.timer);
      const here = await this.here().catch(() => null);
      if (here) await this.deliver(c, await e2e.seal(c, '', here.place.sender, { at: here.where }), here, 'quiet').catch(() => undefined);
    }
    this.announce();
  }

  /**
   * On the primary: one of a chat's messages starred or deleted on this phone only, or all of them
   * deleted here, which the contact is not told of: its linked devices do the same.
   */
  changedHere(change: ChatChange): void {
    // Taken back here (or the whole chat deleted): what the log says was sent for later goes on every device.
    if (change.gone) void this.syncs.writeFrom((log) => laterGone(log, change.c, change.tag)).catch(() => undefined);
    if (this.data.primary || !this.data.devices.some((d) => d.linked) || !this.chats.e2e.record(change.c)) return;
    void this.say({ k: 'changed', chats: [change], groups: [], whole: [] }).catch(() => undefined);
  }

  // ---- Calls (lib/linked-calls.ts) ----

  /** On the primary: whether a linked device, or the phone, has a call it took or made through here, but the one `id` names. */
  inCall(id?: string): boolean {
    return this.calls.busy(Date.now(), id);
  }

  // On the primary: a call signal a device wrote to a contact (`m`, as it came).
  private callFor(device: string, c: string, m: Json): void {
    const signal = decodeCall(m.call);
    if (!signal || !this.chats.e2e.record(c)) return;
    this.callSteps(this.calls.device(device, c, signal, !!(currentCall() || currentGroupCall())), m);
  }

  // Does what lib/linked-calls.ts said: `m` is the device's message a step to the contact sends on.
  private callSteps(steps: CallStep[], m?: Json): void {
    for (const step of steps) {
      if (step.to === 'phone') this.endElsewhere(step.id, step.declined);
      else if (step.to === 'done') {
        for (const id of step.ids) void this.say({ k: 'call', id: step.id, done: step.declined ? 'declined' : 'answered' }, id).catch(() => undefined);
      } else if (step.to === 'devices') {
        // An offer rings there.
        for (const id of step.ids) void this.say({ k: 'in', c: step.c, m: { text: '', call: step.signal } }, id, [], outMarkOf(markOf('', step.signal))).catch(() => undefined);
      } else {
        const said = m ?? { text: '', call: step.signal };
        this.ring(() => this.callTo(step.c, said));
      }
    }
  }

  // Seals a device's call signal for the contact, as it came, from the account.
  private async callTo(c: string, m: Json): Promise<void> {
    const here = await this.here().catch(() => null);
    if (!here) return;
    await this.deliver(c, await this.chats.e2e.sealAs(c, utf8Encode(JSON.stringify(m)), here.place.sender, here.where), here, relayMarkOf(m));
  }

  // A call answered or turned down on another device: it stops ringing here, now or as soon as it rings.
  private endElsewhere(id: string, declined: boolean): void {
    const now = Date.now();
    for (const [old, { at }] of this.endedThere) if (now - at > ENDED_LASTS) this.endedThere.delete(old);
    const call = currentCall();
    if (call?.id === id) call.endedElsewhere(declined);
    else this.endedThere.set(id, { declined, at: now });
  }

  private callChanged(): void {
    const call = currentCall();
    const there = call && this.endedThere.get(call.id);
    if (!call || !there) return;
    this.endedThere.delete(call.id);
    // After the screens heard it ring, so they hear it stop too.
    setTimeout(() => call.endedElsewhere(there.declined), 0);
  }

  // ---- Groups (lib/groups.ts) ----

  /**
   * The space's groups: on the primary, those `shared` says (not public groups) are told to the
   * devices as they change; on a linked device, they are the phone's.
   */
  useGroups(groups: Groups, transport: GroupTransport, shared: (id: string) => boolean = () => true): void {
    this.stopGroups?.();
    this.groups = { groups, transport, shared };
    groups.useLink({
      through: () => !this.holdsGroups(),
      device: () => this.data.primary !== null,
      // On the phone, to the device that holds them; on a device, to the phone, which passes it on.
      ask: async (id, ask) => {
        await this.say({ k: 'group', id, ask }, this.data.primary ? undefined : this.data.holder);
      },
      members: (id) => this.seatsOf(id),
      // A copy a device that holds them put on the relay for the phone goes as all left there does.
      took: (from) => (this.data.primary ? this.tookAll([from.ids]) : undefined),
      pass: async (packet) => {
        await this.say({ k: 'gpkt', p: toBase64(packet), h: 1 }, this.data.primary ? undefined : this.data.holder);
      },
      passSignal: async (identity, signal, request) => {
        if (this.data.primary || !this.data.holder) return;
        await this.say({ k: 'gsig', c: identity, s: signal, ...(request ? { r: true as const } : {}) }, this.data.holder);
      },
    });
    // What was done to their messages as the space opens: what the devices were told, unless the
    // space closed before they were told of a change (their marks then differ, and they are told whole).
    this.marked.clear();
    for (const group of groups.all()) if (shared(group.id)) this.marked.set(group.id, this.marksNow(group));
    this.stopGroups = groups.onChange(() => this.groupsChanged());
  }

  private marksNow(group: Group): { marks: Map<string, GroupMarked>; digest: string } {
    const marks = groupMarks(group.messages);
    return { marks, digest: marksDigest(marks) };
  }

  // Whether the groups' MLS state is here (docs/sync.md, S6): on the phone, unless it handed them
  // to a device; on a device, once it was handed them.
  private holdsGroups(): boolean {
    return this.data.primary ? this.data.holds === true : !this.data.holder;
  }

  // Who is told of the groups as they change here: from where they are held, on the phone each
  // linked device but the one that holds them, on that device the phone. None where they are not.
  private groupPeers(): Peer[] {
    if (this.data.primary) return this.data.holds ? [this.data.primary] : [];
    return this.data.devices.filter((d) => d.linked && d.id !== this.data.holder);
  }

  /**
   * On the phone: where the groups are held, the device's id, or null for this phone; where they go
   * next, while they move; the linked devices that can hold them (an older Erevos cannot); and what
   * went wrong moving them last.
   */
  groupsHolder(): { on: string | null; to: string | null | undefined; can: string[]; problem: string | null } {
    const problem = this.groupsProblem;
    if (this.data.primary) return { on: this.data.holds ? 'here' : null, to: undefined, can: [], problem };
    const to = this.groups?.groups.handed()?.to ?? this.data.moveTo;
    return { on: this.data.holder ?? null, to: to === undefined ? undefined : to || null, can: this.data.devices.filter((d) => d.linked && d.canHold).map((d) => d.id), problem };
  }

  /**
   * On the phone: moves the groups to the linked device `to`, or back to this phone (null), as the
   * account's one MLS state, never copied (docs/sync.md, S6). From a device, it asks them back
   * first, and they go on from here once they came. Throws while in a public group, with no relay
   * to hand them on through, to a device whose Erevos cannot hold them, and while they move.
   */
  moveGroups(to: string | null): Promise<void> {
    return this.run(async () => {
      if (this.data.primary || !this.groups) return;
      const device = to === null ? null : this.data.devices.find((d) => d.linked && d.id === to);
      if (to !== null && !device) throw new Error(t('That device is no longer linked.'));
      if (device && !device.canHold) throw new Error(t('{name} has an older Erevos: update it there first.', { name: device.name }));
      if (this.groups.groups.handed()) throw new Error(t('The groups are on their way to the other device. Try again in a moment.'));
      this.groupsProblem = null;
      const on = this.data.holder ?? null;
      if (on === to) {
        if (this.data.moveTo !== undefined) await this.save({ ...this.data, moveTo: undefined });
        return;
      }
      await this.save({ ...this.data, moveTo: to ?? '' });
    }).then(async () => {
      this.announce();
      const { on, to: next } = this.groupsHolder();
      if (next === undefined) return;
      if (on) await this.say({ k: 'give' }, on);
      else if (next) await this.handGroups(next);
    });
  }

  // Hands the groups' MLS state to `to` (the phone, from a device: ''): wiped here and kept as it
  // went in one save (lib/groups.ts moveOut), then put on the relay as a file whose key goes in the
  // envelope, told again till the other device says it took it or cannot.
  private async handGroups(to: string): Promise<void> {
    const shared = this.groups;
    const here = await this.here();
    if (!shared || !here) throw new Error(t('The groups go to the other device through the server. Type its address in Server first.'));
    await shared.groups.moveOut(to);
    await this.handedFlags();
    this.announce();
    await this.sendHanded(true);
  }

  // What says where the groups are, as what was handed on says: on the phone, the device they went
  // to; on a device, not here. Should it have stopped between the two saves.
  private async handedFlags(): Promise<void> {
    const handed = this.groups?.groups.handed();
    if (!handed) return;
    await this.run(async () => {
      if (this.data.primary) {
        if (!this.data.holds) return;
        const { holds: _holds, ...rest } = this.data;
        await this.save(rest);
      } else if (this.data.holder !== handed.to || this.data.moveTo !== undefined) {
        const { moveTo: _moveTo, ...rest } = this.data;
        await this.save({ ...rest, holder: handed.to });
      }
    });
  }

  // The groups' state handed on and not taken yet: put on the relay once, and told to the other
  // device, again each HAND_AGAIN (`now`: at once) till it says.
  private async sendHanded(now = false): Promise<void> {
    const shared = this.groups;
    const handed = shared?.groups.handed();
    if (!shared || !handed) return;
    await this.handedFlags();
    const was = this.data.handing;
    if (was && !now && Date.now() - was.at < HAND_AGAIN) return;
    let offer = was?.offer;
    if (!offer) {
      const here = await this.here();
      if (!here) return;
      const sent = await sendFile(here.own, bytesSource(utf8Encode(handed.held)), { name: 'groups.json', mime: 'application/json', kind: 'file' });
      await deleteChunks(sent.ref.id, sent.ref.count).catch(() => undefined);
      offer = sent.offer;
    }
    const told = await this.say({ k: 'hold', offer }, handed.to || undefined);
    const made = offer;
    await this.run(async () => {
      await this.save({ ...this.data, handing: { offer: made, at: told.length > 0 ? Date.now() : 0 } });
    });
  }

  // The groups' MLS state another device handed on (`hold`), taken from the relay and kept here,
  // with what each device was told of them as it is now: each has them as told already. Said taken
  // (`held`), and then the relay lets go of it; one that cannot be taken, ever, is said so (`nohold`),
  // and kept there again. One that cannot be taken now is told again.
  private async heldFrom(from: Peer, offer: FileOffer): Promise<void> {
    const shared = this.groups;
    const here = await this.here();
    if (!shared || !here) return;
    const f = heldMark(offer);
    const answer = (k: 'held' | 'nohold') => this.say({ k, f }, this.data.primary ? undefined : from.id);
    if (this.data.tookHold === f) {
      await answer('held');
      return;
    }
    if (this.holdsGroups()) return;
    // Taken in before, and Erevos stopped before this file said so (below): theirs now, as it
    // would be; else the same offer would come again and again, refused each time, for good.
    if (shared.groups.hasState()) {
      await this.heldNow(f, from, Object.fromEntries((await this.groupMirrors()).map(({ group, mark }) => [group.id, { meta: mark, last: lastKey(group), at: group.messages[group.messages.length - 1]?.at ?? 0, marks: this.marksNow(group).digest }])));
      await answer('held');
      this.announce();
      this.groupsAgain();
      return;
    }
    let held: HeldGroups;
    try {
      if (offer.size > MAX_HELD_GROUPS) throw new HeldError();
      const ref = await takeFile(here.own, offerRef(offer), undefined, true);
      let bytes: Uint8Array | null;
      try {
        bytes = await readFile(ref);
      } finally {
        await deleteChunks(ref.id, ref.count).catch(() => undefined);
      }
      if (!bytes || bytes.length > MAX_HELD_GROUPS) throw new HeldError();
      const data = checkedGroupData(JSON.parse(utf8Decode(bytes)) as unknown);
      if (!data.state || !data.seal) throw new HeldError();
      held = { state: data.state, seal: data.seal, orphans: data.orphans, given: data.given, groups: data.groups };
    } catch (error) {
      if (error instanceof HeldError || error instanceof FileGoneError || error instanceof FileDamagedError || error instanceof SyntaxError) await answer('nohold');
      return;
    }
    await shared.groups.moveIn(held);
    const told = Object.fromEntries((await this.groupMirrors()).map(({ group, mark }) => [group.id, { meta: mark, last: lastKey(group), at: group.messages[group.messages.length - 1]?.at ?? 0, marks: this.marksNow(group).digest }]));
    const next = await this.heldNow(f, from, told);
    await answer('held');
    this.announce();
    this.groupsAgain();
    if (next && next !== from.id) await this.handGroups(next).catch((error: unknown) => this.movedWrong(error));
  }

  // Keeps that the groups are held here, taken with the offer marked `f` from `from`, with what
  // each is at (`told`); on a device, gives back where they go next (moveTo), if anywhere.
  private heldNow(f: string, from: Peer, told: Record<string, Told>): Promise<string | null> {
    return this.run(async () => {
      if (this.data.primary) {
        await this.save({ ...this.data, holds: true, tookHold: f, primary: { ...this.data.primary, groups: told } });
        return null;
      }
      const { holder: _holder, moveTo, ...rest } = this.data;
      await this.save({ ...rest, tookHold: f, devices: this.data.devices.map((d) => (d.id === from.id ? { ...d, groups: told } : d)) });
      return moveTo || null;
    });
  }

  // The other device said what it did with the groups handed to it (`held`, or `nohold`: they are
  // kept here again, as they went). Then the relay lets go of them.
  private async handedTo(from: Peer, f: string, took: boolean): Promise<void> {
    const shared = this.groups;
    const handed = shared?.groups.handed();
    const handing = this.data.handing;
    if (!shared || !handed || !handing || heldMark(handing.offer) !== f) return;
    if (this.data.primary ? from.id !== this.data.primary.id : from.id !== handed.to) return;
    if (took) await shared.groups.handedDone();
    else await shared.groups.takeBack();
    await this.run(async () => {
      const { handing: _handing, ...rest } = this.data;
      if (took) await this.save(rest);
      else if (this.data.primary) await this.save({ ...rest, holds: true });
      else {
        const { holder: _holder, moveTo: _moveTo, ...back } = rest;
        await this.save(back);
      }
    });
    if (!took) this.groupsProblem = t('The other device could not take the groups: they stay here.');
    const ref = offerRef(handing.offer);
    if (ref.from) await this.drop(ref.from);
    this.announce();
    this.groupsAgain();
  }

  // On a linked device: says to the phone it can hold the groups (`can`), once each time it opens.
  private async sayCan(): Promise<void> {
    if (!this.data.primary || this.saidCan) return;
    this.saidCan = true;
    const told = await this.say({ k: 'can', g: 1 }).catch(() => []);
    if (told.length === 0) this.saidCan = false;
  }

  private movedWrong(error: unknown): void {
    this.groupsProblem = error instanceof Error ? error.message : String(error);
    this.announce();
  }

  // What came for the groups while their state was on its way (`GroupsWaiting`): kept till it is
  // held somewhere again, then done here or passed on there. And what is done with each now.
  private waitGroups(item: GroupsWaiting): void {
    this.groupsWaiting = [...this.groupsWaiting, item].slice(-GROUPS_WAITING);
  }

  private groupsAgain(): void {
    const waiting = this.groupsWaiting;
    this.groupsWaiting = [];
    for (const item of waiting) this.act(() => this.groupsCame(item));
  }

  private async groupsCame(item: GroupsWaiting): Promise<void> {
    switch (item.k) {
      case 'group':
        if (this.holdsGroups()) return this.groupFor(item.from, item.id, item.ask);
        if (this.data.holder) await this.say({ k: 'group', id: item.id, ask: item.ask }, this.data.holder);
        return;
      case 'gpkt':
        return this.packetFrom(null, item.p, 1);
      case 'gsig':
        return this.signalFor(null, item.c, item.s, item.r);
    }
  }

  // A group message that came where the groups are not held, passed on (`gpkt`): taken here; on a
  // device, back to the phone; on the phone, on to the device that holds them, at most twice, or,
  // should it come from that device, kept till they are held again: they are on their way.
  private async packetFrom(from: Peer | null, p: string, h: number): Promise<void> {
    const shared = this.groups;
    if (!shared) return;
    if (this.holdsGroups()) {
      await shared.groups.receive(fromBase64(p), shared.transport).catch(() => false);
      return;
    }
    if (this.data.primary) {
      await this.say({ k: 'gpkt', p, h: 2 });
      return;
    }
    const holder = this.data.holder;
    if (!holder) return;
    if (from?.id === holder) this.waitGroups({ k: 'gpkt', p });
    else if (h < 2) await this.say({ k: 'gpkt', p, h: h + 1 }, holder);
  }

  // A contact's group signal the phone passed on (`gsig`), as packetFrom does with a message.
  private async signalFor(from: Peer | null, c: string, signal: GroupSignal, request: boolean): Promise<void> {
    const shared = this.groups;
    if (!shared) return;
    if (this.holdsGroups()) {
      await shared.groups.signal(c, signal, request, shared.transport);
      return;
    }
    const said: Envelope = { k: 'gsig', c, s: signal, ...(request ? { r: true as const } : {}) };
    if (this.data.primary) {
      await this.say(said);
      return;
    }
    const holder = this.data.holder;
    if (!holder) return;
    if (from?.id === holder) this.waitGroups({ k: 'gsig', c, s: signal, r: request });
    else await this.say(said, holder);
  }

  // The groups the devices are told of, as they are now, with their members.
  private async groupMirrors(): Promise<{ group: Group; mirror: GroupMirror; mark: string }[]> {
    const shared = this.groups;
    if (!shared) return [];
    const out: { group: Group; mirror: GroupMirror; mark: string }[] = [];
    for (const group of shared.groups.all()) {
      if (!shared.shared(group.id)) continue;
      const mirror = groupMirror(group, await shared.groups.members(group.id).catch(() => [] as GroupMember[]));
      out.push({ group, mirror, mark: mirrorMark(mirror) });
    }
    return out;
  }

  // In the turn, on the primary, for a device linked or caught up: every group as it is now, all
  // there are, and those it had that went. Their messages up to now go with the history, with what
  // was done to them, and those after as they come. A device just linked has none of them yet, so
  // what changes in them from now on is all it is to be told; one caught up (`caught`) may have
  // missed changes, and is told the groups' marks whole next.
  private async groupsTo(peer: Peer, caught = false): Promise<Peer> {
    const now = await this.groupMirrors();
    const gone = Object.keys(peer.groups).filter((id) => !now.some((g) => g.group.id === id));
    let sealed = peer;
    for (const envelope of groupEnvelopes(
      now.map((g) => g.mirror),
      gone,
      [],
      true,
    ))
      sealed = await this.seal(sealed, envelope);
    const told = ({ group, mark }: { group: Group; mark: string }): Peer['groups'][string] => {
      const marked = this.marked.get(group.id) ?? this.marksNow(group);
      this.marked.set(group.id, marked);
      return { meta: mark, last: lastKey(group), at: group.messages[group.messages.length - 1]?.at ?? 0, marks: caught ? '' : marked.digest };
    };
    return { ...sealed, groups: Object.fromEntries(now.map((g) => [g.group.id, told(g)])) };
  }

  // On the primary: a group changed. The devices are told, once for changes close together.
  private groupsChanged(): void {
    if (this.telling || this.closed || this.groupPeers().length === 0) return;
    this.telling = true;
    this.act(async () => {
      this.telling = false;
      await this.tellGroups();
    });
  }

  // On the primary: each linked device is told what changed in the groups since it was last told: a
  // group as it is now once that changed, the messages after the last it was told of, what was done
  // since to those it was told of, and the groups gone. A photo or file this phone keeps goes as a
  // copy put on the relay for the devices, deleted there once they took it.
  private async tellGroups(): Promise<void> {
    if (!this.groups || this.groupPeers().length === 0) return;
    this.groupsLate = false;
    const now = await this.groupMirrors();
    const here = await this.here().catch(() => null);
    const copies = new Map<string, FileOffer | null>();
    const kept = new Set<string>();
    const marked = new Map(now.map(({ group }) => [group.id, this.marksNow(group)]));
    for (const d of this.groupPeers()) {
      if (d.behind) continue;
      const told = d.groups;
      const list: GroupMirror[] = [];
      const entries: GroupEntry[] = [];
      const changes: GroupChange[] = [];
      const whole: WholeGroup[] = [];
      const files: Leaving[] = [];
      const next: Peer['groups'] = {};
      for (const { group, mirror, mark } of now) {
        const was = told[group.id];
        if (was?.meta !== mark) list.push(mirror);
        let last = was?.last ?? '';
        let at = was?.at ?? 0;
        for (const m of messagesAfter(group.messages, last, at)) {
          const entry = await this.groupEntryOf(group.id, m, true, here, files, copies);
          // One whose photo or file cannot go now waits, with those after it, for the next look.
          if (!entry && m.file) {
            this.groupsLate = true;
            break;
          }
          if (entry) entries.push(entry);
          last = groupMessageKey(m);
          at = m.at;
        }
        // What was done since to the messages it was told of: what changed, from what it was told
        // last; or, not knowing what it has, all of it.
        const is = marked.get(group.id)!;
        if (was && was.marks !== is.digest) {
          const before = this.marked.get(group.id);
          if (before && was.marks === before.digest) changes.push(...marksChanged(group.id, before.marks, is.marks));
          else {
            const all = wholeMarks(group.id, is.marks);
            changes.push(...all.changes);
            whole.push(all.whole);
          }
        }
        next[group.id] = { meta: mark, last, at, marks: is.digest };
      }
      const gone = Object.keys(told).filter((id) => !now.some((g) => g.group.id === id));
      const groups = list.length > 0 || entries.length > 0 || gone.length > 0;
      const changed = changes.length > 0 || whole.length > 0;
      if (!groups && !changed && JSON.stringify(next) === JSON.stringify(told)) continue;
      await this.run(async () => {
        const peer = this.groupPeers().find((p) => p.id === d.id);
        // Told otherwise meanwhile, as when caught up: the next change tells it.
        if (!peer || peer.behind || JSON.stringify(peer.groups) !== JSON.stringify(told)) return;
        let sealed = peer;
        const envelopes = [...(groups ? groupEnvelopes(list, gone, entries) : []), ...(changed ? changeEnvelopes([], changes, whole) : [])];
        // Each member's message is a message, in an envelope of its own; the rest is quiet.
        for (const envelope of envelopes) sealed = await this.seal(sealed, envelope, tellsTheirs(envelope) ? 'message' : undefined);
        if (sealed.behind) {
          await this.keepPeer(sealed);
          return;
        }
        await this.keepPeer({ ...sealed, groups: next });
        // On a device that holds them, a copy for the phone stays on the relay till it expires.
        if (!this.data.primary) await this.save({ ...this.data, left: this.leftFor([peer.id], files) });
        for (const file of files) kept.add(file.from.ids);
      });
    }
    // From now on, what changes is told as what changed since this.
    this.marked.clear();
    for (const [id, marks] of marked) this.marked.set(id, marks);
    // A copy no device was told of goes at once.
    for (const offer of copies.values()) if (offer && !kept.has(offer.ids)) await this.drop(fromOf(offer));
    void this.flush().catch(() => undefined);
  }

  // A group's message as it goes to the devices, with what was done to it. A photo, file or voice
  // message goes as where it waits on the relay for the group's members, or, kept here, as a copy put
  // there for the devices (`left`), one for all of them (`copies`, by file id). Null for one that
  // cannot go, and, without `files`, for a photo or file (not a voice message).
  private async groupEntryOf(group: string, m: GroupMessage, files: boolean, here: Here | null, left: Leaving[], copies: Map<string, FileOffer | null>): Promise<GroupEntry | null> {
    // What it answers, and what it is beyond its words, as it came.
    const parts = groupPartsOf(m, !m.file);
    const entry: GroupEntry = {
      group,
      at: m.at,
      from: m.from,
      text: m.text,
      tag: m.tag,
      ...(m.note ? { note: true } : { marks: marksOf(m) }),
      ...(Object.keys(parts).length > 0 ? { parts } : {}),
    };
    if (!m.file) return m.text || m.note ? entry : null;
    if (!files && m.ms === undefined) return null;
    let offer = offerOf(m.file);
    if (!offer) {
      if (!copies.has(m.file.id)) copies.set(m.file.id, here ? await uploadFile(here.own, m.file).catch(() => null) : null);
      offer = copies.get(m.file.id) ?? null;
      if (offer) left.push({ from: fromOf(offer), phone: false });
    }
    return offer ? { ...entry, file: offer, ...(m.ms !== undefined ? { ms: m.ms } : {}) } : null;
  }

  // On the primary: what a device asked to do in one of the groups that go to it, done here as this
  // phone's own. A message that cannot go to the group, the device that wrote it shows as not sent.
  private async groupFor(device: string, id: string, ask: GroupAsk): Promise<void> {
    // Held on a device: it does it there (docs/sync.md, S6). From that device, they are on their way
    // here: done once they came.
    if (!this.data.primary && this.data.holder) {
      if (device === this.data.holder) this.waitGroups({ k: 'group', from: device, id, ask });
      else await this.say({ k: 'group', id, ask }, this.data.holder);
      return;
    }
    const shared = this.groups;
    const there = !!shared?.shared(id) && shared.groups.all().some((g) => g.id === id);
    if (ask.t === 'text' || ask.t === 'file') {
      let went = false;
      if (shared && there) {
        const { groups, transport } = shared;
        try {
          if (ask.t === 'text') await groups.send(id, ask.text, transport, ask.parts, ask.tag);
          // Left where the device put it, as a member's is: each member takes it from there, this phone too.
          else await groups.sendFile(id, offerRef(ask.file), ask.file, ask.ms, transport, ask.parts, ask.tag);
          went = true;
        } catch {
          // The device is told, below.
        }
      }
      if (!went) await this.say({ k: 'changed', chats: [], groups: [{ group: id, tag: ask.tag, unsent: true }], whole: [] }, device);
      return;
    }
    if (!shared || !there) return;
    const { groups, transport } = shared;
    switch (ask.t) {
      case 'mark':
        await groups.mark(id, ask.marked, transport);
        return;
      case 'add':
        return groups.add(id, ask.identities, transport);
      case 'name':
        return groups.rename(id, ask.name, transport);
      case 'remove':
        return groups.remove(id, ask.leaf, transport);
      case 'leave':
        return groups.leave(id, transport);
      case 'forget':
        return groups.forget(id);
      case 'read':
        await groups.markRead(id, transport);
        if (this.pocket === null) readElsewhere([`group:${id}`]);
        return;
    }
  }

  // On a linked device: what the phone said changed in the groups, kept as the phone's. Those of
  // the history (`quiet`) do not say a message came.
  private async mirrorFrom(said: { list: GroupMirror[]; gone: string[]; entries: GroupEntry[] }, quiet = false): Promise<void> {
    const shared = this.groups;
    // Held here, what was said before they came is past.
    if (!shared || this.holdsGroups()) return;
    let again: FileFrom[] = [];
    await shared.groups.mirror((groups) => {
      const made = mirrorGroups(groups, said);
      again = made.again;
      return { groups: made.groups, came: quiet ? [] : made.came };
    });
    this.tookAll(again.map((from) => from.ids));
  }

  // On a linked device: what the phone said changed in messages told already: in a chat, a star or
  // deleting there; in a group, what was done to its messages since, or all of it.
  private async changedFrom(chats: ChatChange[], groups: GroupChange[], whole: WholeGroup[]): Promise<void> {
    const { e2e, history } = this.chats;
    const gone: LinkedChange['gone'] = [];
    for (const change of chats) {
      if (!e2e.record(change.c)) continue;
      const peer = peerOf(change.c);
      if (!change.tag) {
        await history.clear(peer);
        gone.push({ peer });
      } else if (change.gone) {
        await history.remove(peer, change.tag);
        gone.push({ peer, tag: change.tag });
      } else if (change.starred !== undefined) await history.star(peer, change.tag, change.starred);
    }
    if (chats.length > 0) this.announce({ gone });
    const shared = this.groups;
    if (shared && (groups.length > 0 || whole.length > 0)) await shared.groups.mirror((kept) => ({ groups: changedGroups(kept, { groups, whole }, Date.now()), came: [] }));
  }

  // On a linked device: a group's members as the phone said them, only who each is, as nothing is sealed for them here.
  private seatsOf(id: string): GroupMember[] {
    return (this.data.members[id] ?? []).map((s) => ({ leaf: s.leaf, me: s.me, about: s.id ? { id: s.id, sender: '', relay: '', relayKey: '', seal: '' } : null }));
  }

  // On a linked device: tells the phone of photos and files taken here, a few at a time.
  private tookAll(ids: string[]): void {
    for (let at = 0; at < ids.length; at += MAX_TOOK) void this.say({ k: 'took', ids: ids.slice(at, at + MAX_TOOK) }).catch(() => undefined);
  }

  // ---- On the primary: what it sealed itself ----

  private watchEchoes(): void {
    if (this.echoTimer || this.closed) return;
    this.echoTimer = setTimeout(() => {
      this.echoTimer = null;
      this.act(() => this.tellEchoes());
    }, ECHO_EVERY);
  }

  // Messages sealed here that the chat now keeps as sent: each linked device is told, a photo or
  // file with a copy of its own on the relay.
  private async tellEchoes(): Promise<void> {
    if (this.echoes.size === 0) return;
    const now = Date.now();
    const kept = new Map<string, Message>();
    for (const m of this.chats.history.messages()) if (m.mine) kept.set(`${m.peer}|${m.tag}`, m);
    for (const [key, echo] of [...this.echoes]) {
      const message = kept.get(`${peerOf(echo.c)}|${echo.tag}`);
      if (!message || message.mark === WAITING) {
        if (now - echo.at > ECHO_LASTS) this.echoes.delete(key);
        continue;
      }
      this.echoes.delete(key);
      let m = echo.m;
      const files: Leaving[] = [];
      if (isObject(m.file)) {
        const here = await this.here().catch(() => null);
        const offer = here && message.file ? (offerOf(message.file) ?? (await uploadFile(here.own, message.file).catch(() => null))) : null;
        if (!offer) continue;
        m = { ...m, file: offer };
        files.push({ from: fromOf(offer), phone: !!message.file?.from });
      }
      const mark = (message.mark ?? 0) > 0 ? (message.mark as 1 | 2) : undefined;
      await this.say({ k: 'out', c: echo.c, m, ...(mark ? { mark } : {}) }, undefined, files);
    }
    if (this.echoes.size > 0) this.watchEchoes();
  }

  // ---- On the primary: the history ----

  // Brings a device what of the history is still to go, a pack at a time, until it all went.
  private async bringHistory(id: string): Promise<void> {
    for (;;) {
      const peer = this.data.devices.find((d) => d.id === id);
      const job = peer?.linked ? peer.history : null;
      if (!job || this.closed) return;
      const here = await this.here();
      if (!here) return;
      const { e2e, history } = this.chats;
      const known = new Set(e2e.contacts().map((c) => peerOf(c.identity)));
      const now = Date.now();
      const chats = history.messages().filter((m) => known.has(m.peer) && m.tag && m.at >= job.since && m.at <= job.upTo && m.mark !== WAITING && !(m.until && m.until <= now));
      // The groups' messages of the same time go with them.
      const shared = this.groups;
      const inGroups = shared
        ? shared.groups
            .all()
            .filter((g) => shared.shared(g.id))
            .flatMap((g) => g.messages.filter((m) => m.at >= job.since && m.at <= job.upTo).map((m) => ({ at: m.at, group: { id: g.id, m } })))
        : [];
      const all: { at: number; chat?: Message; group?: { id: string; m: GroupMessage } }[] = [...chats.map((m) => ({ at: m.at, chat: m })), ...inGroups].sort((a, b) => a.at - b.at);
      const entries: PackEntry[] = [];
      const groupEntries: GroupEntry[] = [];
      const files: Leaving[] = [];
      const copies = new Map<string, FileOffer | null>();
      let size = 0;
      let used = 0;
      // A pack ends between messages of different times, so the next starts where this one ended.
      while (used < all.length && (size < PACK_BYTES || all[used].at === all[used - 1].at)) {
        const { chat, group } = all[used];
        used++;
        if (chat) {
          const entry = await this.entryOf(chat, job.files, here, files);
          if (!entry) continue;
          entries.push(entry);
          size += JSON.stringify(entry).length;
        } else if (group) {
          const entry = await this.groupEntryOf(group.id, group.m, job.files, here, files, copies);
          if (!entry) continue;
          groupEntries.push(entry);
          size += JSON.stringify(entry).length;
        }
      }
      const last = used >= all.length;
      const done = entries.length + groupEntries.length;
      if (done > 0) {
        const { ref, offer } = await sendFile(here.own, bytesSource(writePack(entries, groupEntries)), { name: 'history.json', mime: 'application/json', kind: 'file' });
        await deleteChunks(ref.id, ref.count).catch(() => undefined);
        await this.say({ k: 'history', offer, last }, id, files);
      }
      await this.run(async () => {
        const devices = this.data.devices.map((d) =>
          d.id === id && d.history ? { ...d, history: last ? null : { ...d.history, since: all[used].at, done: d.history.done + done } } : d,
        );
        await this.save({ ...this.data, devices });
      });
      this.announce();
      if (last) return;
    }
  }

  // One message as it goes in a pack; a photo or file in it goes as where it waits on the relay, or a copy put there (`left`).
  private async entryOf(m: Message, files: boolean, here: Here, left: Leaving[]): Promise<PackEntry | null> {
    const entry: PackEntry = {
      peer: m.peer,
      text: m.text,
      mine: m.mine,
      at: m.at,
      tag: m.tag,
      ...(m.until ? { until: m.until } : {}),
      ...(m.lasts ? { lasts: m.lasts } : {}),
      ...(m.mark && m.mark > 0 ? { mark: m.mark } : {}),
    };
    // What it answers or is beyond its words, and what was done to it: reactions, a pin, votes, a star.
    const parts = chatPartsOf(m as unknown as Json);
    if (Object.keys(parts).length > 0) entry.parts = parts;
    if (m.voice) {
      const audio = await loadClip(m.voice).catch(() => null);
      return audio ? { ...entry, voice: { ms: m.voice.ms, data: toBase64(audio) } } : null;
    }
    if (m.file) {
      if (!files) return null;
      const offer = offerOf(m.file) ?? (await uploadFile(here.own, m.file).catch(() => null));
      if (!offer) return null;
      left.push({ from: fromOf(offer), phone: !!m.file.from });
      return { ...entry, file: offer };
    }
    return m.text ? entry : null;
  }

  // ---- On a linked device ----

  // A message the phone or another device sent to a contact, or what it said read or deleted: kept
  // here as this device's own, once, by its tag; one deleted stays so, should a copy come late.
  private async ownFrom(c: string, m: Json, mark: Mark | undefined): Promise<void> {
    const { e2e, history } = this.chats;
    if (!e2e.record(c)) return;
    const peer = peerOf(c);
    const now = Date.now();
    const gone: LinkedChange['gone'] = [];
    const read = tagsOf(m.read);
    if (read.length > 0) {
      await history.mark(peer, false, 2, now, read);
      if (this.pocket === null) readElsewhere([`chat:${c}`]);
    }
    const erase = isObject(m.erase) ? m.erase : null;
    if (erase?.all === true || (erase && isTag(erase.tag))) {
      await this.run(async () => {
        const erased = this.erasedBy(c, m);
        if (erased !== this.data.erased) await this.save({ ...this.data, erased });
      });
    }
    if (erase?.all === true) {
      await history.clear(peer);
      gone.push({ peer });
    } else if (erase && isTag(erase.tag)) {
      await history.remove(peer, erase.tag);
      gone.push({ peer, tag: erase.tag });
    }
    await this.marksAsOwn(peer, m, now);
    if (isKept(m) && !this.erasedHere(peer, m.tag as string)) {
      const tag = m.tag as string;
      const have = history.messages().find((x) => x.peer === peer && x.tag === tag);
      if (have) {
        if (mark && have.mine && (have.mark ?? 0) < mark) await history.mark(peer, true, mark, now, [tag]);
      } else {
        const lasts = typeof m.lasts === 'number' && m.lasts > 0 ? m.lasts : typeof m.timer === 'number' ? m.timer : 0;
        // With what it answers, and what it is beyond words (lib/chat-parts.ts): a sticker, a place, a poll, a payment request, a preview.
        const { sticker, place, poll, preview, forwarded, pay, card } = carriedOf(m);
        const parts = { ...(isTag(m.re) ? { re: m.re } : {}), ...(sticker ? { sticker } : {}), ...(place ? { place } : {}), ...(poll ? { poll } : {}), ...(pay ? { pay } : {}), ...(card ? { card } : {}), ...(preview ? { preview } : {}), ...(forwarded ? { forwarded } : {}) };
        // At when the phone sealed it, as a place closed here takes it only as it opens.
        const base: Message = { peer, text: '', mine: true, at: cameAt(0, isTime(m.st) ? m.st : 0, now), tag, lasts, mark: mark ?? 0, ...parts };
        const voice = voiceOf(m.voice);
        const offer = isObject(m.file) ? readOffer(m.file) : null;
        if (isText(m.text) && m.text) await history.add({ ...base, text: m.text });
        else if (voice) {
          const whole = this.voiceParts.add(`out ${peer}`, voice, now);
          if (whole) await history.add({ ...base, voice: await saveClip(whole.audio, whole.ms) });
        } else if (offer) await history.add({ ...base, file: offerRef(offer) });
      }
    }
    this.announce({ gone });
  }

  // What a message sealed for a contact says of one of the chat's messages, kept as this side's own,
  // as the chat keeps what it sends: a reaction, a pin, a vote, new words for one of ours, a request paid.
  private async marksAsOwn(peer: string, m: Json, now: number): Promise<void> {
    const { history } = this.chats;
    const react = isObject(m.react) && isTag(m.react.tag) && (m.react.emoji === '' || isReactionEmoji(m.react.emoji)) ? { tag: m.react.tag, emoji: m.react.emoji as string } : null;
    if (react) await history.react(peer, react.tag, true, react.emoji);
    const { pin, vote, edit, settled, close } = carriedOf(m);
    if (pin) await history.pin(peer, pin.tag, pin.on ? now : 0);
    if (vote) await history.vote(peer, vote.tag, true, vote.chose);
    if (close) await history.close(peer, close.tag, true, now);
    if (edit) await history.edit(peer, edit.tag, true, edit.text, now);
    if (settled) await history.paid(peer, settled.tag, true, now);
  }

  // Packs of the history the phone put on the relay: each taken, opened and kept, then deleted.
  private async takePacks(): Promise<void> {
    while (this.data.primary && this.data.packs.length > 0) {
      const offer = this.data.packs[0];
      const here = await this.here();
      if (!here) return;
      let entries: PackEntry[] = [];
      let groupEntries: GroupEntry[] = [];
      try {
        const ref = await takeFile(here.own, offerRef(offer), undefined, false);
        const bytes = await readFile(ref);
        await deleteChunks(ref.id, ref.count).catch(() => undefined);
        entries = bytes ? readPack(bytes) : [];
        groupEntries = bytes ? readGroupEntries(bytes) : [];
      } catch (error) {
        if (!(error instanceof FileGoneError)) throw error;
      }
      await this.putIn(entries);
      if (groupEntries.length > 0) await this.mirrorFrom({ list: [], gone: [], entries: groupEntries }, true);
      await this.run(async () => {
        await this.save({ ...this.data, packs: this.data.packs.filter((p) => p !== offer && p.ids !== offer.ids) });
      });
    }
  }

  private async putIn(entries: PackEntry[]): Promise<void> {
    const { e2e, history } = this.chats;
    const known = new Set(e2e.contacts().map((c) => peerOf(c.identity)));
    const have = new Set(history.messages().map((m) => `${m.peer}|${m.tag}`));
    const added: Message[] = [];
    for (const e of entries) {
      const key = `${e.peer}|${e.tag}`;
      if (!known.has(e.peer) || have.has(key) || this.erasedHere(e.peer, e.tag)) continue;
      have.add(key);
      const message: Message = { peer: e.peer, text: e.text, mine: e.mine, at: e.at, tag: e.tag, until: e.until ?? 0, lasts: e.lasts ?? 0, mark: e.mark ?? 0, ...e.parts };
      if (e.voice) {
        let audio: Uint8Array;
        try {
          audio = fromBase64(e.voice.data);
        } catch {
          continue;
        }
        added.push({ ...message, voice: await saveClip(audio, e.voice.ms) });
      } else if (e.file) added.push({ ...message, file: offerRef(e.file) });
      else if (e.text) added.push(message);
    }
    if (added.length === 0) return;
    await history.putIn(added);
    this.announce();
  }
}

// ---- The open space's links ----

let current: Links | null = null;

// To a contact who calls while a linked device has a call, the account is in one: one of the
// space's, or of a hidden place's, as a call in hidden chats is one the phone is in.
callsElsewhere((id) => (current?.inCall(id) ?? false) || [...places.values()].some((links) => links.inCall(id)));

joinSpaceChats(async (chats, space, key) => {
  current?.close();
  current = null;
  watchTakenFiles(null);
  // The space's groups, before anything comes: public groups stay on the phone.
  const groups = core.canGroup() ? await spaceGroups().catch(() => null) : null;
  current = await Links.open(space, key, chats);
  if (groups) current.useGroups(groups, spaceGroupTransport, (id) => !groups.isPublic(id));
  watchTakenFiles(current);
});

/** The open space's links, once its chats are open. */
export async function spaceLinks(): Promise<Links> {
  await spaceChats();
  if (!current) throw new Error(t('Linked devices could not open.'));
  return current;
}

/** Lets go of the space's links when it closes. */
export function forgetLinks(): void {
  current?.close();
  current = null;
  watchTakenFiles(null);
}

/** Which the open space is (Role), as far as its chats are open yet. */
export function linkedRole(): Role {
  return current?.role() ?? null;
}

/** On a linked device: the account's contact link, to show as the chat's own. */
export function accountLink(): string | null {
  return current?.accountLink() ?? null;
}

/** Once, in a space whose chats are a linked device's copy restored from its backup: what to say of it. Null otherwise. */
export async function copyNote(): Promise<string | null> {
  if (!core.hasCore()) return null;
  const links = await spaceLinks().catch(() => null);
  return links && (await links.sayCopy().catch(() => false)) ? t('These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.') : null;
}

/**
 * Once, in the open space: on a phone a backup was put back on, that the devices of the phone it
 * was made on can be asked to link again; on a linked device, that its phone asks it to (Links,
 * sayAgain). Null otherwise. Hidden chats say theirs only in their own Linked devices.
 */
export async function againNote(): Promise<string | null> {
  if (!core.hasCore()) return null;
  const links = await spaceLinks().catch(() => null);
  return links ? links.sayAgain().catch(() => null) : null;
}

/**
 * On the primary: what was done on this phone only to the open space's chat (lib/link-wire.ts,
 * ChatChange), for its linked devices to do too; with `at`, to that hidden place's chat, for its own
 * linked devices. The space's devices are never told of a place.
 */
export function changedHere(change: ChatChange, at: PlaceAt | null = null): void {
  (at ? placeLinksNow(at.space, at.pocket) : current)?.changedHere(change);
}

// ---- Each hidden place's own links (docs/multi-device.md, phase 5) ----

// The links of each hidden place whose chats are open (lib/place-chats.ts), by space and pocket:
// opened with them, as the place opens with its PIN or as it receives while closed
// (lib/place-receiver.ts), and closed as they are let go of. So a place links only while it is open
// or receives while closed: closed otherwise, what its devices and its phone say to it waits on the
// relay. Each has its own data, sealed with the place's key under its own holder, and goes through
// the place's own relay and queue: nothing of it is the space's, nor goes to the space's devices.
const places = new Map<string, Links>();
const placeId = (space: number, pocket: number) => `${space}.${pocket}`;
// How many times every place's chats, and each one's, were let go of: links that open while theirs
// are let go of close again at once.
let forgotten = 0;
const forgottenAt = new Map<string, number>();
const forgetCount = (at: string) => `${forgotten}.${forgottenAt.get(at) ?? 0}`;

// Whether `space` is still the one open: a place of a space closed meanwhile links no more.
const spaceOpen = (space: number) => {
  try {
    return currentSpace().space === space;
  } catch {
    return false;
  }
};

joinPlaceChats(async (chats, space, pocket, key) => {
  if (!spaceOpen(space)) return;
  const at = placeId(space, pocket);
  const before = forgetCount(at);
  places.get(at)?.close();
  places.delete(at);
  // The place's groups, before anything comes, as the space's (lib/place-groups.ts): none is public.
  const groupsAt = placeGroupsAt(space, pocket, key);
  const groups = core.canGroup() ? await groupsAt.groups().catch(() => null) : null;
  const links = await Links.open(space, key, chats, TICK, pocket);
  if (forgetCount(at) !== before || !spaceOpen(space)) {
    links.close();
    return;
  }
  if (groups) links.useGroups(groups, groupsAt.transport);
  places.set(at, links);
});

onForgetPlaceChats((space, pocket) => {
  if (space === undefined || pocket === undefined) {
    forgotten++;
    for (const links of places.values()) links.close();
    places.clear();
    return;
  }
  const at = placeId(space, pocket);
  forgottenAt.set(at, (forgottenAt.get(at) ?? 0) + 1);
  places.get(at)?.close();
  places.delete(at);
});

/** The own links of the hidden place in `pocket` of `space`, open with `key`, once its chats are open. */
export async function placeLinks(space: number, pocket: number, key: Uint8Array): Promise<Links> {
  await placeChats(space, pocket, key);
  const links = places.get(placeId(space, pocket));
  if (!links) throw new Error(t('Linked devices could not open.'));
  return links;
}

/** The own links of the hidden place in `pocket` of `space`, if its chats are open, or null. */
export function placeLinksNow(space: number, pocket: number): Links | null {
  return places.get(placeId(space, pocket)) ?? null;
}
