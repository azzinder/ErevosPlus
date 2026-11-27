// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { ChatWriting } from './chat-writing';
import { nostrChatCore } from './core';
import { randomBytes, sha256Bytes, toHex, utf8Decode, utf8Encode } from './crypto';
import { t } from './i18n';
import { isEvent, type NostrEvent } from './nostr-dm-net';
import { emojiUrlOf, isEmojiCode } from './nostr-emoji';
import { fileOfRumor, type NostrDmFile } from './nostr-files';
import { isNostrRelay } from '../lock/e2e-data';
import type { ChatNotify } from '../lock/chat-notify';
import type { AccountTor } from './account-tor';
import type { ChatPin } from '../lock/chat-pin';
import type { Look } from '../theme/look';
import { checkedRules, withOne, type ChatRules } from './chat-rules';

// Chats with people on other Nostr apps (docs/nostr-chats.md): 0xchat, Amethyst, Coracle, Primal
// and any other that writes private messages as NIP-17 says. A space can have a Nostr key of its
// own for them (shown as an npub), made here or brought from another app (its nsec); its messages
// come to the relays it names for them (its "inbox", kind 10050), and go to those the other person
// names. The core makes and opens them (crates/erevos-nostr chat): each one sealed for its reader,
// wrapped by a key made for it alone, its time set up to two days back, so a relay sees only
// which key it is for. Texts (kind 14), photos and files (kind 15, lib/nostr-files.ts), reactions
// (kind 7), and asks to take back a message or a reaction (kind 5, NIP-09, as NIP-17 allows): the
// others' apps that do so remove it, and Erevos removes what its writer took back. A group is the
// set of people a message names (NIP-17 has no admins), and each of them gets a wrap of their own.
// Pins are this device's own: NIP-17 has none, and nothing of them goes anywhere.
//
// This is the account and its chats, as one value kept sealed in the space (lock/nostr-dm-data.ts);
// lib/nostr-dm-store.ts connects it to relays.
//
// Not anonymous: the key is the same to everyone it writes to, and its inbox relays know when it
// reads, and from where unless through Tor.

/** The most messages kept in each chat, and the most wraps remembered as taken. */
export const KEEP_MESSAGES = 500;
const SEEN_MOST = 5000;
// Reactions kept for messages not here yet, at most.
const EARLY_MOST = 200;
// Messages and reactions taken back that are remembered, so that one that comes late stays away.
const GONE_MOST = 500;
/** The most messages a chat keeps pinned. */
export const PINS_MOST = 20;
/** The most messages one ask to take back names: a wrap holds no more than some 64 kB. */
export const TAKE_BACK_MOST = 100;
/** How many chats a space keeps at most (roomForChat). */
export const CHATS_MOST = 300;

/** Relays a new key reads its messages on: well known ones that keep wraps for anyone. */
export const DEFAULT_INBOX = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net'];
/** Where people's lists of relays and names are looked up besides their own relays. */
export const LOOKUP_RELAYS = ['wss://purplepag.es', 'wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net'];
/**
 * Where a key's own follow list (kind 3) and relay list (kind 10002) are also looked for: relays
 * that gather these lists from everywhere, and big public ones many apps write to.
 */
export const FOLLOWS_RELAYS = ['wss://user.kindpag.es', 'wss://indexer.coracle.social', 'wss://relay.nostr.band', 'wss://relay.snort.social', 'wss://nostr.mom'];
/** NIP-17 asks to keep an inbox small. */
export const INBOX_MOST = 3;

/** How far back a wrap's time may be set (NIP-17): two days, in seconds. */
export const BACKDATE = 2 * 24 * 3600;

export type NostrDmMessage = {
  /** The message's own id (its rumor's), the same in every app. */
  id: string;
  mine: boolean;
  text: string;
  /** When it was written, as it says, in milliseconds. */
  at: number;
  state?: 'sending' | 'sent' | 'failed';
  /** In a group: who wrote it, when not the space. */
  from?: string;
  /** A photo or file (kind 15, lib/nostr-files.ts): where it is and how to open it; true for one
   *  Erevos cannot open (its encryption is not AES-GCM, or it came before Erevos opened files). */
  file?: NostrDmFile | true;
  /** Reactions (kind 7): the latest of each who reacted, by their key. */
  reactions?: Record<string, string>;
  /** The id of each of those reactions, by key: to take it back (kind 5), or know it taken back. */
  reactionIds?: Record<string, string>;
  /** Where the pictures of the custom emoji among them are (NIP-30), by :shortcode:: never
   *  fetched in a chat, only sent on with the same reaction, for the other apps to show. */
  emoji?: Record<string, string>;
  /** The message it answers, by id (its e tag, as NIP-17 has it). */
  replyTo?: string;
  /** An old private message (NIP-04, kind 4): the relays saw who wrote to whom, and when. */
  old?: true;
  /** Ours, sent on from another chat: marked so on this device only, as NIP-17 has no mark for it. */
  forwarded?: true;
};

export type NostrDmChat = {
  /** The other person's key, in hex; a group's, the hash of all its members' (groupKey). */
  key: string;
  /** In a group: the others in it, by key. A chat with one person has none. */
  members?: string[];
  /** A group's name as its members last set it (NIP-17's subject), and when (seconds). */
  subject?: string;
  subjectAt?: number;
  /** The name was given or changed here and goes with the next message, as NIP-17 asks: not with every one, so
   *  that an old name sent late does not undo a newer one. */
  subjectOwed?: boolean;
  messages: NostrDmMessage[];
  unread: number;
  lastAt: number;
  /** A name given here. */
  name?: string;
  /** Where they read their messages (their kind 10050), as last looked up, and when (seconds). */
  relays?: string[];
  relaysAt?: number;
  /** Relays someone or something named for them (an nprofile, a NIP-05 name), to look them up on. */
  hints?: string[];
  /** Its own notifications (lock/chat-notify.ts), kept on this device only. */
  notify?: ChatNotify;
  /** Sent through Tor by itself (lib/nostr-dm-store.ts nostrDmSetTor): what goes to them, their
   *  look-ups and its files, on circuits of its own, whatever the space's Tor way; on this device only. */
  tor?: true;
  /** Its own look (theme/look.ts), kept on this device only; missing while it takes the space's. */
  look?: Look;
  /** The PIN it opens with, as kept, and its screenshots blocked (lib/chat-protect.ts), on this device only. */
  pin?: ChatPin;
  shots?: true;
  /** Messages pinned here, by id, the latest first: on this device only, as NIP-17 has no pins. */
  pins?: string[];
  /** Its disappearing messages (lib/nostr-rules.ts): its timer, and the messages that go at a time of their own. */
  rules?: ChatRules;
  /** When its key was checked in person, by the QR code of it on their phone (ms). */
  checked?: number;
};

export type NostrDmState = {
  /** Its own Tor choice (lib/account-tor.ts): Off when missing, as for an account from before it. */
  tor?: AccountTor;
  /** The space's Nostr key, hex. */
  secret: string;
  public: string;
  /** Where it reads its messages: the relays its kind 10050 names. */
  inbox: string[];
  /** When its kind 10050 went out last with the inbox as it is (seconds), or 0 when it must go again. */
  told: number;
  /** A name it shows to others (its kind 0), and when that went out. */
  name?: string;
  chats: Record<string, NostrDmChat>;
  /** Names other people gave themselves (their kind 0), and when looked up (seconds); where they
   *  read their messages (their kind 10050), and when that was looked up. */
  people: Record<string, { name?: string; at: number; relays?: string[]; relaysAt?: number }>;
  /** The Blossom servers its photos and files go to, the first that takes one; FILE_SERVERS when none. */
  files?: string[];
  /** Up to when it read all its relays had (seconds): it asks again from two days before. */
  caught: number;
  /** Wraps taken already, by id. */
  seen: string[];
  /** Reactions that came before the message they are for (wraps come in any order): put on it as it comes. */
  early?: { key: string; target: string; from: string; emoji: string; id?: string; url?: string }[];
  /** Messages and reactions taken back (kind 5) or removed here, by id and by whose they were: one
   *  that comes after stays away. */
  gone?: { id: string; by: string }[];
  /** Made here (not brought from another app): its nsec is only here unless written down. */
  madeHere?: boolean;
  /** For a key brought from another app: when Erevos looked for where that app said its messages
   *  come (its kind 10050), to read there too (seconds). Until then, it tells no inbox of its own. */
  inboxLooked?: number;
  /** Relays of the key's own NIP-65 list, where old private messages (NIP-04, kind 4) are read too,
   *  besides the inbox and DEFAULT_INBOX; and when that list was looked for (seconds). */
  oldRelays?: string[];
  oldLooked?: number;
  /** For each relay read, until when (seconds) it said it sent all the old private messages it
   *  keeps: one not there sends from its start, and what it sends then is told of as nothing new. */
  oldSent?: Record<string, number>;
  /** Each chat's draft, and the messages held to go later, on this device only (lib/chat-writing.ts). */
  writing?: ChatWriting;
  /** Keys blocked on this device (lib/nostr-rules.ts): what they send is dropped as it comes. */
  blocked?: string[];
};

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isHex64 = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);

/** Whether a kept account has its shape: a damaged one is left out. */
export function isNostrDmState(value: unknown): value is NostrDmState {
  if (!object(value)) return false;
  const v = value as Partial<Record<keyof NostrDmState, unknown>>;
  return (
    isHex64(v.secret) &&
    isHex64(v.public) &&
    Array.isArray(v.inbox) &&
    v.inbox.every(isNostrRelay) &&
    typeof v.told === 'number' &&
    object(v.chats) &&
    object(v.people) &&
    typeof v.caught === 'number' &&
    Array.isArray(v.seen)
  );
}

type Json = Record<string, any>;

/** One call to the core's Nostr chat part. */
export async function chatCore<T extends Json>(op: string, request: Json = {}): Promise<T> {
  const answer = await nostrChatCore()(utf8Encode(JSON.stringify({ op, ...request })));
  return JSON.parse(utf8Decode(answer)) as T;
}

const seconds = (now = Date.now()) => Math.floor(now / 1000);

/** A new account with a key made here, or with the secret of one brought from another app. */
export async function newNostrDm(secret?: string, now = Date.now()): Promise<NostrDmState> {
  const keys = await chatCore<{ secret: string; public: string }>(secret ? 'keys_of' : 'keys_new', secret ? { secret } : {});
  return {
    secret: keys.secret,
    public: keys.public,
    inbox: [...DEFAULT_INBOX],
    told: 0,
    chats: {},
    people: {},
    // A key made here has nothing waiting; one brought along gets what its relays still keep.
    caught: secret ? 0 : seconds(now),
    seen: [],
    ...(secret ? {} : { madeHere: true }),
  };
}

/** What someone wrote to name a person or a key: their key, and relays named with it. */
export type Written = { type: 'npub' | 'nprofile' | 'nsec'; public: string; secret?: string; relays: string[] };

/** Reads an npub, nprofile, nsec or a key's hex (a `nostr:` before it is let be); throws when it is none. */
export async function readKey(text: string): Promise<Written> {
  try {
    return await chatCore<Written>('decode', { text });
  } catch (error) {
    const why = error instanceof Error ? error.message : String(error);
    throw new Error(why.includes('mistyped') ? t('This Nostr key has a typo in it.') : t('Write an npub, such as npub1…, or a name such as name@example.org.'));
  }
}

// NIP-19's bech32 (BIP 173), to show a key as npub1… at once, where waiting on the core would not
// do (a list of chats). The core reads keys people write, checksum and all (readKey).
const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i += 1) if ((top >>> i) & 1) chk ^= GEN[i];
  }
  return chk >>> 0;
}

/** A key, in hex, as an npub. */
export function npubOf(key: string): string {
  const words: number[] = [];
  let acc = 0;
  let bits = 0;
  for (let i = 0; i < key.length; i += 2) {
    acc = (acc << 8) | parseInt(key.slice(i, i + 2), 16);
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      words.push((acc >>> bits) & 31);
    }
    acc &= (1 << bits) - 1;
  }
  if (bits > 0) words.push((acc << (5 - bits)) & 31);
  const hrp = 'npub';
  const expanded = [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];
  const mod = bech32Polymod([...expanded, ...words, 0, 0, 0, 0, 0, 0]) ^ 1;
  const checksum = Array.from({ length: 6 }, (_, i) => (mod >>> (5 * (5 - i))) & 31);
  return `${hrp}1${[...words, ...checksum].map((w) => BECH32[w]).join('')}`;
}

/** The nsec of the space's key, to write down or take to another app. */
export async function nsecOf(state: NostrDmState): Promise<string> {
  return (await chatCore<{ nsec: string }>('nsec', { secret: state.secret })).nsec;
}

/** An nprofile of the space's key with its inbox relays: another app that reads it knows where to write. */
export async function profileOf(state: NostrDmState): Promise<string> {
  return (await chatCore<{ nprofile: string }>('nprofile', { public: state.public, relays: state.inbox })).nprofile;
}

/** A short form of a key for where no name is known: npub1abcd…wxyz. */
export function shortNpub(npub: string): string {
  return npub.length > 20 ? `${npub.slice(0, 9)}…${npub.slice(-4)}` : npub;
}

/** The chat with `key`, made if there is none. */
export function chatOf(state: NostrDmState, key: string): NostrDmChat {
  return (state.chats[key] ??= { key, messages: [], unread: 0, lastAt: 0 });
}

/** The most other people in a group: more is let be, so nobody can make the space write to crowds. */
export const GROUP_MOST = 20;

/** A group's key: the hash of all its members' keys, the space's too, however they are ordered. */
export function groupKey(keys: string[]): string {
  return toHex(sha256Bytes(utf8Encode([...new Set(keys)].sort().join(','))));
}

/** Who a chat's messages go to besides the space: the person, a group's others, or none (notes to oneself). */
export function readersOf(state: NostrDmState, key: string): string[] {
  const chat = state.chats[key];
  if (chat?.members) return chat.members;
  return key === state.public ? [] : [key];
}

/** A person's name: given here, or the one they gave themselves, or the start of their npub. */
export function personName(state: NostrDmState, key: string): string {
  if (key === state.public) return t('You');
  return (!state.chats[key]?.members && state.chats[key]?.name) || state.people[key]?.name || shortNpub(npubOf(key));
}

/** The name a chat shows: given here, or the one they gave themselves, or none. A group's: given
 *  here, or as its members named it, or its members' names. */
export function nameOf(state: NostrDmState, key: string): string {
  const chat = state.chats[key];
  if (chat?.members) return chat.name || chat.subject || chat.members.map((member) => personName(state, member)).join(', ');
  return chat?.name || state.people[key]?.name || '';
}

/** A new group with `members` (their keys), named `subject` or not: its key. Nothing goes until its first message. */
export function newGroup(state: NostrDmState, members: string[], subject = '', now = Date.now()): string {
  const others = [...new Set(members)].filter((key) => key !== state.public && isHex64(key)).sort();
  if (others.length < 2) throw new Error(t('A group needs at least two other people.'));
  if (others.length > GROUP_MOST) throw new Error(t('A group can have {n} other people at most.', { n: String(GROUP_MOST) }));
  const key = groupKey([...others, state.public]);
  const chat = chatOf(state, key);
  chat.members = others;
  if (subject.trim()) {
    chat.subject = subject.trim().slice(0, 100);
    chat.subjectAt = seconds(now);
    chat.subjectOwed = true;
  }
  chat.lastAt ||= now;
  return key;
}

/** How a reaction reads: NIP-25's + as 👍, - as 👎, a custom emoji as its :shortcode: (NIP-30), anything else as written, short. */
export function reactionOf(content: string): string {
  const said = content.trim();
  if (said === '' || said === '+') return '👍';
  if (said === '-') return '👎';
  if (isEmojiCode(said)) return said;
  return [...said].slice(0, 8).join('');
}

/** What a reaction says as it goes: NIP-25's + for 👍 and - for 👎, as other apps write them. */
export function reactionContent(sign: string): string {
  return sign === '👍' ? '+' : sign === '👎' ? '-' : sign;
}

/** Signs an event with the space's key (its inbox list, its name, an answer to a relay that asks who reads). */
export async function signed(state: NostrDmState, kind: number, tags: string[][], content: string, now = Date.now()): Promise<NostrEvent> {
  return (await chatCore<{ event: NostrEvent }>('sign', { secret: state.secret, created_at: seconds(now), kind, tags, content })).event;
}

/** The space's inbox, as NIP-17 asks it be told (kind 10050). */
export function inboxEvent(state: NostrDmState, now = Date.now()): Promise<NostrEvent> {
  return signed(
    state,
    10050,
    state.inbox.map((relay) => ['relay', relay]),
    '',
    now,
  );
}

/**
 * The space's name for others (kind 0). What else the key says of itself stays as its newest profile
 * has it (`kept`, from profileFieldsOf): its picture and words, when the key came from another Nostr
 * app. Only the name is Erevos's.
 */
export function profileEvent(state: NostrDmState, now = Date.now(), kept: Record<string, unknown> = {}): Promise<NostrEvent> {
  const said: Record<string, unknown> = { ...kept };
  const camel = 'displayName' in said;
  delete said.name;
  delete said.display_name;
  delete said.displayName;
  if (state.name) {
    said.name = state.name;
    said.display_name = state.name;
    if (camel) said.displayName = state.name;
  }
  return signed(state, 0, [], JSON.stringify(said), now);
}

// The longest profile read to keep its other fields: profiles are a few kilobytes.
const PROFILE_MOST = 64 * 1024;

/**
 * What `key` says of itself, from the newest of these profiles (kind 0) that is theirs and checked
 * (of two from the same second, the one with the lower id, as relays keep): its fields and its time
 * in seconds; no fields and 0 when there is none; null when the newest cannot be read (too long, or
 * not an object), which Erevos then does not write over.
 */
export async function profileFieldsOf(key: string, events: NostrEvent[]): Promise<{ fields: Record<string, unknown>; at: number } | null> {
  const profiles = events
    .filter((e) => e.kind === 0 && e.pubkey === key)
    .sort((a, b) => b.created_at - a.created_at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const profile of profiles) {
    if (!(await verified(profile))) continue;
    if (profile.content.length > PROFILE_MOST) return null;
    try {
      const said = JSON.parse(profile.content) as unknown;
      return typeof said === 'object' && said !== null && !Array.isArray(said) ? { fields: said as Record<string, unknown>, at: profile.created_at } : null;
    } catch {
      return null;
    }
  }
  return { fields: {}, at: 0 };
}

/** What a relay that keeps wraps for their reader only is told to show who reads (NIP-42). */
export function authEvent(state: NostrDmState, relay: string, challenge: string): Promise<NostrEvent> {
  return signed(
    state,
    22242,
    [
      ['relay', relay],
      ['challenge', challenge],
    ],
    '',
  );
}

/** Whether an event is what it says and signed by its key. */
export async function verified(event: NostrEvent): Promise<boolean> {
  try {
    return (await chatCore<{ ok: boolean }>('verify', { event })).ok;
  } catch {
    return false;
  }
}

/** The relays the newest of these lists names: a kind 10050 of `key`, checked. */
export async function inboxOf(key: string, events: NostrEvent[]): Promise<string[] | null> {
  const lists = events.filter((e) => e.kind === 10050 && e.pubkey === key).sort((a, b) => b.created_at - a.created_at);
  for (const list of lists) {
    if (!(await verified(list))) continue;
    const relays = [...new Set(list.tags.filter((tag) => tag[0] === 'relay' && isNostrRelay(tag[1])).map((tag) => tag[1].replace(/\/+$/, '')))];
    return relays;
  }
  return null;
}

/** Whether two lists of relays name the same ones, in any order. */
export function sameRelays(a: string[], b: string[]): boolean {
  const one = new Set(a.map((r) => r.replace(/\/+$/, '')));
  const two = new Set(b.map((r) => r.replace(/\/+$/, '')));
  return one.size === two.size && [...one].every((r) => two.has(r));
}

/**
 * The inboxes `key` named in these lists (kind 10050) other than `inbox`: another app's, where it
 * reads the key's messages, or one the key had before. Newest first, each checked, each set of
 * relays once, with its time (seconds).
 */
export async function otherInboxes(key: string, events: NostrEvent[], inbox: string[]): Promise<{ relays: string[]; at: number }[]> {
  const lists = events.filter((e) => e.kind === 10050 && e.pubkey === key).sort((a, b) => b.created_at - a.created_at);
  const found: { relays: string[]; at: number }[] = [];
  const ids = new Set<string>();
  for (const list of lists) {
    // A changed copy that keeps a list's id hides nothing: only a checked one counts as seen.
    if (ids.has(list.id) || !(await verified(list))) continue;
    ids.add(list.id);
    const relays = [...new Set(list.tags.filter((tag) => tag[0] === 'relay' && isNostrRelay(tag[1])).map((tag) => tag[1].replace(/\/+$/, '')))];
    if (!relays.length || sameRelays(relays, inbox) || found.some((f) => sameRelays(f.relays, relays))) continue;
    found.push({ relays, at: list.created_at });
  }
  return found;
}

/** The most of the relays someone writes on (their NIP-65 list) that their follow list is looked for on. */
export const WRITES_MOST = 8;

/**
 * Where `key` writes, from the newest of these relay lists (kind 10002, NIP-65) that is theirs and
 * checked: the relays it names for writing, or for both, WRITES_MOST at most.
 */
export async function writesOf(key: string, events: NostrEvent[]): Promise<string[]> {
  const lists = events.filter((e) => e.kind === 10002 && e.pubkey === key).sort((a, b) => b.created_at - a.created_at);
  for (const list of lists) {
    if (!(await verified(list))) continue;
    const relays = list.tags
      .filter((tag) => tag[0] === 'r' && isNostrRelay(tag[1]) && (tag[2] === undefined || tag[2] === '' || tag[2] === 'write'))
      .map((tag) => tag[1].replace(/\/+$/, ''));
    return [...new Set(relays)].slice(0, WRITES_MOST);
  }
  return [];
}

/** The most people of a follow list the New chat screen shows. */
export const MOST_FOLLOWS = 1000;

/**
 * Whom `key` follows, from the newest of these follow lists (kind 3) that is theirs and checked:
 * their keys, each once, as the list has them, but `key` itself, MOST_FOLLOWS at most. With them,
 * what was found on the way: how many follow lists of `key` came (the same one from two relays
 * counts once) and how many of them passed the check. A list that does not pass counts for
 * nothing, even with the id of one that does.
 */
export async function followsLook(key: string, events: NostrEvent[]): Promise<{ keys: string[]; lists: number; checked: number }> {
  const seen = new Set<string>();
  const lists = events
    .filter((e) => e.kind === 3 && e.pubkey === key)
    .filter((e) => {
      const whole = JSON.stringify([e.id, e.pubkey, e.created_at, e.kind, e.tags, e.content, e.sig]);
      return !seen.has(whole) && !!seen.add(whole);
    })
    .sort((a, b) => b.created_at - a.created_at);
  let keys: string[] | null = null;
  let checked = 0;
  for (const list of lists) {
    if (!(await verified(list))) continue;
    checked += 1;
    keys ??= [
      ...new Set(list.tags.filter((tag) => tag[0] === 'p' && typeof tag[1] === 'string' && /^[0-9a-f]{64}$/.test(tag[1])).map((tag) => tag[1])),
    ]
      .filter((k) => k !== key)
      .slice(0, MOST_FOLLOWS);
  }
  return { keys: keys ?? [], lists: lists.length, checked };
}

/** The name `key` gave itself, from the newest of these profiles (kind 0), checked. */
export async function nameIn(key: string, events: NostrEvent[]): Promise<string | undefined> {
  const profiles = events.filter((e) => e.kind === 0 && e.pubkey === key).sort((a, b) => b.created_at - a.created_at);
  for (const profile of profiles) {
    if (!(await verified(profile))) continue;
    try {
      const said = JSON.parse(profile.content) as Record<string, unknown>;
      const name = [said.display_name, said.displayName, said.name].find((n): n is string => typeof n === 'string' && n.trim() !== '');
      return name?.trim().slice(0, 64);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/** The expiration a message came with (NIP-40), in seconds, or 0 for none. */
export function expirationOf(tags: string[][]): number {
  const at = Number(tags.find((tag) => tag[0] === 'expiration')?.[1]);
  return Number.isSafeInteger(at) && at > 0 ? at : 0;
}

/** How much later, at most, a wrap's expiration is than its message's (seconds): at random, so the relays' copy does not say to the second when it was sent. */
export const EXPIRATION_LATER = 3600;

/**
 * A message of `kind` to the chat `key`: its id and time, and a wrap for each of its readers and
 * for the space's own copy, by key. It names them all (p tags), and a group's name. With `expires`
 * (seconds), it disappears then (NIP-40, as NIP-17 has it): its message says so, for the readers'
 * apps, and each wrap a little later, for the relays (lib/nostr-rules.ts).
 */
export async function wrapMessage(
  state: NostrDmState,
  key: string,
  kind: number,
  tags: string[][],
  content: string,
  now = Date.now(),
  expires = 0,
): Promise<{ id: string; at: number; wraps: Record<string, NostrEvent>; subject?: string }> {
  const readers = readersOf(state, key);
  const chat = state.chats[key];
  const named = (readers.length ? readers : [state.public]).map((reader) => ['p', reader]);
  // A group's name given here goes with its next message (not with a reaction).
  const owed = !!chat?.members && !!chat.subjectOwed && (kind === 14 || kind === 15);
  const subject = owed ? [['subject', chat.subject ?? '']] : [];
  const expiring = expires > 0 ? [['expiration', String(expires)]] : [];
  const [high, low] = randomBytes(2);
  const made = await chatCore<{ rumor: { id: string; created_at: number }; wraps: { to: string; event: string }[] }>('wrap', {
    secret: state.secret,
    rumor: { kind, created_at: seconds(now), tags: [...named, ...subject, ...tags, ...expiring], content },
    to: [...new Set([...readers, state.public])],
    now: seconds(now),
    ...(expires > 0 ? { expiration: expires + (((high << 8) | low) % (EXPIRATION_LATER + 1)) } : {}),
  });
  return {
    id: made.rumor.id,
    at: made.rumor.created_at * 1000,
    wraps: Object.fromEntries(made.wraps.map((w) => [w.to, JSON.parse(w.event) as NostrEvent])),
    ...(owed ? { subject: chat.subject ?? '' } : {}),
  };
}

/** A text to `key`: the wraps for them and for the space's own copy, and the message as it shows. */
export async function wrapText(state: NostrDmState, key: string, text: string, now = Date.now()): Promise<{ message: NostrDmMessage; theirs: NostrEvent; ours: NostrEvent; wraps: Record<string, NostrEvent> }> {
  const made = await wrapMessage(state, key, 14, [], text, now);
  return {
    message: { id: made.id, mine: true, text, at: made.at, state: 'sending' },
    theirs: made.wraps[readersOf(state, key)[0] ?? state.public],
    ours: made.wraps[state.public],
    wraps: made.wraps,
  };
}

/** Signs an event with a key made for it alone, never kept: a file server's permission to upload. */
export async function signedOnce(kind: number, tags: string[][], content: string, now = Date.now()): Promise<NostrEvent> {
  const once = await chatCore<{ secret: string }>('keys_new');
  return (await chatCore<{ event: NostrEvent }>('sign', { secret: once.secret, created_at: seconds(now), kind, tags, content })).event;
}

/**
 * Adds a message to its chat, once; answers whether it was new. One older than every message the
 * chat keeps (a relay sending again what this phone let go) is not: it is not counted as unread.
 * One of ours, written here or in another app with this key, says its chat was read up to it:
 * only theirs after it stay unread, as NIP-17 tells nothing of what was read elsewhere.
 */
export function addMessage(state: NostrDmState, key: string, message: NostrDmMessage): boolean {
  const chat = chatOf(state, key);
  if (chat.messages.some((m) => m.id === message.id)) return false;
  chat.messages.push(message);
  chat.messages.sort((a, b) => a.at - b.at);
  if (chat.messages.length > KEEP_MESSAGES) chat.messages = chat.messages.slice(-KEEP_MESSAGES);
  if (!chat.messages.includes(message)) return false;
  chat.lastAt = Math.max(chat.lastAt, message.at);
  if (!message.mine) chat.unread += 1;
  else if (chat.unread > 0) chat.unread = Math.min(chat.unread, chat.messages.filter((m) => !m.mine && m.at > message.at).length);
  return true;
}

/**
 * Whether one more chat fits. Anyone may write to a Nostr key, so a stranger could make chats
 * without end: past CHATS_MOST, the chat that moved least long ago and has nothing of ours makes
 * room; when every chat has, the new one waits until one is forgotten.
 */
function roomForChat(state: NostrDmState): boolean {
  const chats = Object.values(state.chats);
  if (chats.length < CHATS_MOST) return true;
  const theirsOnly = chats.filter((chat) => !chat.name && !chat.messages.some((m) => m.mine));
  if (!theirsOnly.length) return false;
  const stalest = theirsOnly.reduce((a, b) => (b.lastAt < a.lastAt ? b : a));
  delete state.chats[stalest.key];
  return true;
}

function remember(state: NostrDmState, id: string): void {
  state.seen.push(id);
  if (state.seen.length > SEEN_MOST) state.seen = state.seen.slice(-SEEN_MOST);
}

/**
 * Takes a wrap that came for the space's key: the message it carried goes to its chat, a group's
 * when it names more than one other person; a reaction, to the message it is for, when that is
 * here. Other kinds, and groups larger than GROUP_MOST, are let be. Answers the chat's key when
 * a message was new there, or a reaction changed.
 */
export async function takeWrap(state: NostrDmState, event: unknown, now = Date.now()): Promise<string | null> {
  if (!isEvent(event) || (event.kind !== 1059 && event.kind !== OLD_DM_KIND) || state.seen.includes(event.id)) return null;
  // An old private message (NIP-04) opens as a text of the two, with its own id, signed by who wrote it.
  const old = event.kind === OLD_DM_KIND;
  let opened: { rumor: { id: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string } };
  try {
    opened = await chatCore(old ? 'open_old' : 'unwrap', { secret: state.secret, event: JSON.stringify(event) });
  } catch {
    // Not one this key opens, or forged: never again.
    remember(state, event.id);
    return null;
  }
  const { rumor } = opened;
  if (rumor.kind !== 14 && rumor.kind !== 15 && rumor.kind !== 7 && rumor.kind !== 5) {
    remember(state, event.id);
    return null;
  }
  const mine = rumor.pubkey === state.public;
  // What a key blocked here sends is dropped, and not kept (lib/nostr-rules.ts).
  if (!mine && Array.isArray(state.blocked) && state.blocked.includes(rumor.pubkey)) {
    remember(state, event.id);
    return null;
  }
  // A message past its expiration (NIP-40) is not kept.
  const expires = rumor.kind === 14 || rumor.kind === 15 ? expirationOf(rumor.tags) : 0;
  if (expires && expires * 1000 <= now) {
    remember(state, event.id);
    return null;
  }
  // The chat is the sender and everyone it names: one other person (theirs, or ours to them from
  // another app with this key), nobody else (notes to oneself), or more: a group.
  const people = new Set([rumor.pubkey, ...rumor.tags.filter((tag) => tag[0] === 'p' && isHex64(tag[1])).map((tag) => tag[1])]);
  people.delete(state.public);
  if (people.size > GROUP_MOST) {
    remember(state, event.id);
    return null;
  }
  const group = people.size > 1;
  const key = group ? groupKey([...people, state.public]) : people.size ? [...people][0] : state.public;
  if (rumor.kind === 5) {
    remember(state, event.id);
    // NIP-09: what it takes back, by id, each only if it was its writer's.
    const ids = rumor.tags.filter((tag) => tag[0] === 'e' && isHex64(tag[1])).map((tag) => tag[1]);
    return takeBack(state, key, rumor.pubkey, ids.slice(0, TAKE_BACK_MOST)) ? key : null;
  }
  if (rumor.kind === 7) {
    remember(state, event.id);
    if (isGone(state, rumor.id, rumor.pubkey)) return null;
    // NIP-25: the last e tag is the message reacted to; one that is not here is let be.
    const target = [...rumor.tags].reverse().find((tag) => tag[0] === 'e' && isHex64(tag[1]))?.[1];
    if (!target) return null;
    const emoji = reactionOf(rumor.content);
    const url = emojiUrlOf(emoji, rumor.tags);
    const message = state.chats[key]?.messages.find((m) => m.id === target);
    if (!message) {
      // Its message may come after it: kept for it a while.
      const early = (Array.isArray(state.early) ? state.early : []).filter((r) => !(r.target === target && r.from === rumor.pubkey));
      early.push({ key, target, from: rumor.pubkey, emoji, id: rumor.id, ...(url ? { url } : {}) });
      state.early = early.slice(-EARLY_MOST);
      return null;
    }
    putReaction(message, rumor.pubkey, emoji, rumor.id, url);
    return key;
  }
  // One its writer took back already (wraps come in any order), or removed here.
  if (isGone(state, rumor.id, rumor.pubkey)) {
    remember(state, event.id);
    return null;
  }
  // With no room, it is not remembered: it comes again from the relay once there is.
  if (!state.chats[key] && !roomForChat(state)) return null;
  remember(state, event.id);
  const chat = chatOf(state, key);
  if (group) {
    chat.members ??= [...people].sort();
    // The newest name its members gave it.
    const subject = rumor.tags.find((tag) => tag[0] === 'subject')?.[1];
    if (subject !== undefined && rumor.created_at >= (chat.subjectAt ?? 0)) {
      chat.subject = subject.trim().slice(0, 100) || undefined;
      chat.subjectAt = rumor.created_at;
      // A newer name than one given here: that one no longer goes.
      delete chat.subjectOwed;
    }
  }
  // Its time as it says, but never later than now: a time to come would keep it first for good.
  const at = Math.min(rumor.created_at * 1000, now);
  // What it answers: the e tag marked so (NIP-10), else its only one.
  const answers = rumor.tags.filter((tag) => tag[0] === 'e' && isHex64(tag[1]));
  const replyTo = (answers.find((tag) => tag[3] === 'reply') ?? answers[0])?.[1];
  const base = { id: rumor.id, mine, at, ...(group && !mine ? { from: rumor.pubkey } : {}), ...(replyTo ? { replyTo } : {}), ...(old ? { old: true as const } : {}) };
  const message: NostrDmMessage = rumor.kind === 15 ? { ...base, text: '', file: fileOfRumor(rumor.tags, rumor.content) ?? true } : { ...base, text: rumor.content.slice(0, 64_000) };
  const added = addMessage(state, key, message);
  // It goes from here at its expiration (lib/nostr-rules.ts).
  if (added && expires) chat.rules = withOne(checkedRules(chat.rules), message.id, expires * 1000);
  // Reactions to it that came first.
  const early = Array.isArray(state.early) ? state.early.filter((r) => r.key === key && r.target === message.id) : [];
  if (!early.length) return added ? key : null;
  const kept = chat.messages.find((m) => m.id === message.id);
  if (kept) for (const r of early) putReaction(kept, r.from, r.emoji, r.id, r.url);
  state.early = state.early!.filter((r) => !early.includes(r));
  if (!state.early.length) delete state.early;
  return key;
}

/** Puts `from`'s reaction on a message, in place of their one before, with its id when known. */
export function putReaction(message: NostrDmMessage, from: string, emoji: string, id?: string, url?: string): void {
  message.reactions = { ...message.reactions, [from]: emoji };
  const ids = { ...message.reactionIds };
  if (id && isHex64(id)) ids[from] = id;
  else delete ids[from];
  if (Object.keys(ids).length) message.reactionIds = ids;
  else delete message.reactionIds;
  if (url) message.emoji = { ...message.emoji, [emoji]: url };
}

/** Takes `from`'s reaction off a message. */
export function dropReaction(message: NostrDmMessage, from: string): void {
  for (const field of ['reactions', 'reactionIds'] as const) {
    const rest = { ...message[field] };
    delete rest[from];
    if (Object.keys(rest).length) message[field] = rest;
    else delete message[field];
  }
}

/** Whose a message of the chat `key` is: the space's, a group member's, or the person's. */
export function authorOf(state: NostrDmState, key: string, message: NostrDmMessage): string {
  return message.mine ? state.public : (message.from ?? key);
}

/** Whether `by` took back, or this device removed, what has the id `id`. */
function isGone(state: NostrDmState, id: string, by: string): boolean {
  return Array.isArray(state.gone) && state.gone.some((g) => g.id === id && g.by === by);
}

function rememberGone(state: NostrDmState, id: string, by: string): void {
  if (isGone(state, id, by)) return;
  const gone = Array.isArray(state.gone) ? state.gone : [];
  gone.push({ id, by });
  state.gone = gone.slice(-GONE_MOST);
}

/** Takes a message out of its chat, with its pin and its place among those not read. */
function removeMessage(chat: NostrDmChat, message: NostrDmMessage): void {
  const theirs = chat.messages.filter((m) => !m.mine);
  // Those not read are the last of theirs.
  if (!message.mine && chat.unread > 0 && theirs.indexOf(message) >= theirs.length - chat.unread) chat.unread -= 1;
  chat.messages = chat.messages.filter((m) => m !== message);
  if (chat.pins) {
    chat.pins = chat.pins.filter((id) => id !== message.id);
    if (!chat.pins.length) delete chat.pins;
  }
}

/**
 * What `by` took back (NIP-09, kind 5) in the chat `key`: the messages of theirs and the reactions
 * of theirs with these ids, and a reaction of theirs still waiting for its message. Each id is
 * remembered, so that what it names stays away should it come after. Answers whether the chat changed.
 */
export function takeBack(state: NostrDmState, key: string, by: string, ids: readonly string[]): boolean {
  const chat = state.chats[key];
  let changed = false;
  for (const id of ids) {
    rememberGone(state, id, by);
    if (Array.isArray(state.early)) state.early = state.early.filter((r) => !(r.id === id && r.from === by));
    if (!chat) continue;
    const message = chat.messages.find((m) => m.id === id && authorOf(state, key, m) === by);
    if (message) {
      removeMessage(chat, message);
      changed = true;
    }
    for (const m of chat.messages) {
      if (m.reactionIds?.[by] !== id) continue;
      dropReaction(m, by);
      changed = true;
    }
  }
  if (Array.isArray(state.early) && !state.early.length) delete state.early;
  return changed;
}

/** Removes these messages of the chat `key` from this device; one that comes again stays away. Answers those removed, oldest first. */
export function removeHere(state: NostrDmState, key: string, ids: readonly string[]): NostrDmMessage[] {
  const chat = state.chats[key];
  if (!chat) return [];
  const removed = chat.messages.filter((m) => ids.includes(m.id));
  for (const message of removed) {
    rememberGone(state, message.id, authorOf(state, key, message));
    removeMessage(chat, message);
  }
  return removed;
}

/** Pins a message of a chat on this device, or (`on` false) takes its pin off: the latest pin first. */
export function pinHere(state: NostrDmState, key: string, id: string, on: boolean): void {
  const chat = state.chats[key];
  if (!chat || (on && !chat.messages.some((m) => m.id === id))) return;
  const pins = (chat.pins ?? []).filter((pin) => pin !== id);
  if (on) pins.unshift(id);
  if (pins.length) chat.pins = pins.slice(0, PINS_MOST);
  else delete chat.pins;
}

/** Marks a chat's messages read here (NIP-17 tells no one). */
export function markRead(state: NostrDmState, key: string): void {
  const chat = state.chats[key];
  if (chat) chat.unread = 0;
}

/** Forgets a chat here; what relays keep comes again only from what they send anew. */
export function forgetChat(state: NostrDmState, key: string): void {
  delete state.chats[key];
}

/** Sets the inbox: 1 to 3 relays, wss:// (or ws:// to an onion). Throws for one that is not. */
export function setInbox(state: NostrDmState, relays: string[]): void {
  const list = [...new Set(relays.map((r) => r.trim().replace(/\/+$/, '')).filter(Boolean))];
  if (!list.length) throw new Error(t('Name at least one server.'));
  if (list.length > INBOX_MOST) throw new Error(t('Three servers at most: NIP-17 asks to keep it small.'));
  const bad = list.find((r) => !isNostrRelay(r));
  if (bad) throw new Error(t('{relay} is not a Nostr server address (wss://…).', { relay: bad }));
  // A relay new to it is read from the start: what it keeps already comes too.
  if (list.some((relay) => !state.inbox.includes(relay))) state.caught = 0;
  state.inbox = list;
  state.told = 0;
}

/** What `filters` ask a relay for the space's messages, from two days before it last read all. */
export function inboxFilter(state: NostrDmState): Record<string, unknown> {
  const since = state.caught ? Math.max(0, state.caught - BACKDATE - 600) : 0;
  return { kinds: [1059], '#p': [state.public], ...(since ? { since } : { limit: 1000 }) };
}

/** The kind of the old private messages (NIP-04). */
export const OLD_DM_KIND = 4;
/** The most relays read for old private messages besides the inbox. */
export const OLD_MOST = 4;

/** What relay `url` is asked for the old private messages (NIP-04) to and from the key: since it
 *  last sent all it keeps, or from its start. */
export function oldFilters(state: NostrDmState, url: string): Record<string, unknown>[] {
  const sent = state.oldSent?.[url];
  const since = typeof sent === 'number' && sent > 0 ? Math.max(0, sent - 600) : 0;
  const when = since ? { since } : { limit: 1000 };
  return [
    { kinds: [OLD_DM_KIND], '#p': [state.public], ...when },
    { kinds: [OLD_DM_KIND], authors: [state.public], ...when },
  ];
}

/** The relays the key is read on: its inbox, and for old private messages also the big public
 *  relays most apps write to and those of the key's own NIP-65 list, OLD_MOST of them at most. */
export function readRelays(state: NostrDmState): string[] {
  const inbox = state.inbox.map((r) => r.replace(/\/+$/, ''));
  const own = (Array.isArray(state.oldRelays) ? state.oldRelays : []).filter((r) => typeof r === 'string' && isNostrRelay(r)).slice(0, 2);
  const more = [...new Set([...own, ...DEFAULT_INBOX].map((r) => r.replace(/\/+$/, '')))].filter((r) => !inbox.includes(r));
  return [...inbox, ...more.slice(0, OLD_MOST)];
}

/** The relays of `key`'s newest checked NIP-65 list (kind 10002), each once: those it reads on
 *  first (where others write to it), then those it only writes on. */
export async function nip65Of(key: string, events: NostrEvent[]): Promise<string[]> {
  const lists = events.filter((e) => e.kind === 10002 && e.pubkey === key).sort((a, b) => b.created_at - a.created_at);
  for (const list of lists) {
    if (!(await verified(list))) continue;
    const named = list.tags.filter((tag) => tag[0] === 'r' && isNostrRelay(tag[1]));
    const reads = named.filter((tag) => tag[2] !== 'write');
    const writes = named.filter((tag) => tag[2] === 'write');
    return [...new Set([...reads, ...writes].map((tag) => tag[1].replace(/\/+$/, '')))];
  }
  return [];
}

// Public posts (kind 1, NIP-01) and posts shared again (kind 6, NIP-18) of someone a chat is with,
// as their chat shows them, read only: looked up when asked for, never kept, nothing fetched for
// them (a picture is its address, as written).

/** One public post, as the screen shows it. */
export type NostrPost = {
  /** The post's id, or the share's. */
  id: string;
  /** When it was posted or shared, in milliseconds. */
  at: number;
  /** Its words, POST_MOST characters at most. */
  text: string;
  /** It answers another post (it names one, NIP-10). */
  answer?: true;
  /** Its content warning (NIP-36): the reason given, which may be empty. */
  warning?: string;
  /** A post of someone else shared again: whose. */
  sharedFrom?: string;
};

/** How many posts one look-up shows, and the most characters of one. */
export const POSTS_AT_ONCE = 30;
export const POST_MOST = 8000;

/** A post (kind 1) as shown: its words, whether it answers another, its warning (also lib/nostr-feed.ts). */
export function postParts(event: NostrEvent): Pick<NostrPost, 'text' | 'answer' | 'warning'> {
  const answer = event.tags.some((tag) => tag[0] === 'e' && typeof tag[1] === 'string' && tag[3] !== 'mention');
  const warned = event.tags.find((tag) => tag[0] === 'content-warning');
  return {
    text: event.content.slice(0, POST_MOST),
    ...(answer ? { answer: true as const } : {}),
    ...(warned ? { warning: typeof warned[1] === 'string' ? warned[1].slice(0, 200) : '' } : {}),
  };
}

/**
 * The public posts of `key` among these events, newest first, POSTS_AT_ONCE at most: its posts
 * (kind 1) and its shares (kind 6) of a post whose copy is in the share, each checked, the share's
 * copy too, each once. One dated more than ten minutes ahead is let be, as is a share with no
 * post in it to show.
 */
export async function postsOf(key: string, events: NostrEvent[], now = Date.now()): Promise<NostrPost[]> {
  const latest = Math.floor(now / 1000) + 600;
  const candidates = events
    .filter((e) => e.pubkey === key && (e.kind === 1 || e.kind === 6) && e.created_at <= latest)
    .sort((a, b) => b.created_at - a.created_at);
  const posts: NostrPost[] = [];
  const ids = new Set<string>();
  for (const event of candidates) {
    if (posts.length >= POSTS_AT_ONCE) break;
    // A changed copy that keeps a post's id hides nothing: only a checked one counts as seen.
    if (ids.has(event.id) || !(await verified(event))) continue;
    if (event.kind === 1) {
      ids.add(event.id);
      posts.push({ id: event.id, at: event.created_at * 1000, ...postParts(event) });
      continue;
    }
    let inner: unknown;
    try {
      inner = JSON.parse(event.content);
    } catch {
      continue;
    }
    if (!isEvent(inner) || inner.kind !== 1 || !(await verified(inner))) continue;
    ids.add(event.id);
    posts.push({ id: event.id, at: event.created_at * 1000, ...postParts(inner), sharedFrom: inner.pubkey });
  }
  return posts;
}

/** Keys and notes named in a post's words (nostr:npub1…, NIP-21), shortened to be read. */
export function shortMentions(text: string): string {
  return text.replace(/nostr:((?:npub|nprofile|note|nevent|naddr)1[02-9ac-hj-np-z]{20,})/g, (_, named: string) => `${named.slice(0, named.indexOf('1') + 6)}…${named.slice(-4)}`);
}
