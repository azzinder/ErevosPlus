// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { SealBody, SealChat, SealData } from '../lib/telegram-seal';

import { checkedChatNotify, type ChatNotify } from './chat-notify';
import { checkedChatPin, type ChatPin } from './chat-pin';

import { sealedFile, type Holder } from './sealed-file';

// A space's Telegram (the ErevosGram build, lib/telegram-store.ts, docs/erevosgram.md): whether it
// has an account, and the keys and opened messages of its ErevosGram encryption
// (lib/telegram-seal.ts), as one value kept in FILE, sealed with the space's key, one for each
// space (sealed-file.ts), so nothing tells whether a space has one; a hidden place's own likewise,
// sealed with its key in its own value. TDLib keeps the rest (the account, the chats and the
// messages) in its own database, encrypted with a key from the space (lib/telegram.ts), and its
// folder is made only once the space signs in, so a space that never did leaves none.
//
// The opened messages are written after everything else, in the order they were opened, not
// inside their chats: a value this large is kept in pages, and only the pages that differ are
// written (sealed-file.ts), so a message opened writes the first page, with its chat's keys, and
// the last, not every page after its chat's place. A value kept before that, with each chat's
// messages inside it, is read as it is.

export const FILE = 'erevos-telegram';
const BLOCK = 16 * 1024;

export type TelegramData = {
  /** Signed in (or signing in): TDLib runs for this space while it is open. */
  account: boolean;
  seal: SealData;
  /** Telegram's ads in large public channels shown (its terms, 3.3): off unless turned on. */
  ads?: boolean;
  /** How the account goes to Telegram through Tor (lib/account-tor.ts): 'space' as the space's Tor way,
   *  'always' only through Tor; not kept for Off, the default. An Erevos before kept `true` for 'always'. */
  tor?: 'space' | 'always';
  /** The chats set «Through Tor» on this phone (Telegram info): while any is, the whole account goes only through Tor. */
  torChats?: number[];
  /** The account's Telegram folders chosen on this phone, by id: each shows as its own tab on home and
   *  in the Telegram screen, and once one is chosen only their chats notify. */
  homeFolders?: number[];
  /** The chats locked with a PIN of their own (lock/chat-pin.ts), by chat id: each asks for it as it opens. */
  pins?: Record<string, ChatPin>;
  /** The space's: its chats kept in hidden chats (lib/telegram-store.ts telegramHideChat), shown only there. */
  away?: number[];
  /** A hidden place's: the chats of the space's account it keeps, shown among its hidden chats. */
  fromSpace?: number[];
  /** The messages starred on this phone (a message's menu → Star), by chat id: their ids. */
  stars?: Record<string, number[]>;
  /** The chats that keep out of screenshots on this phone (Telegram info → Block screenshots). */
  shots?: number[];
  /** The chats' own notifications on this phone (lock/chat-notify.ts), by chat id: a sound, a ringtone, a mute for a while. */
  notify?: Record<string, ChatNotify>;
};

const EMPTY: TelegramData = { account: false, seal: { seen: [], chats: {} } };

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const STATES = new Set(['NONE', 'INVITED', 'INVITE_IN', 'ACTIVE']);

function checkedChat(value: unknown): SealChat | null {
  if (!object(value) || typeof value.state !== 'string' || !STATES.has(value.state)) return null;
  return value as SealChat;
}

// A list of chat ids, those that are whole numbers; none at all when none is.
function idsOf<K extends 'away' | 'fromSpace' | 'shots' | 'torChats'>(name: K, value: unknown): Partial<Record<K, number[]>> {
  const ids = Array.isArray(value) ? [...new Set(value.filter((n): n is number => Number.isSafeInteger(n)))] : [];
  return ids.length ? ({ [name]: ids } as Partial<Record<K, number[]>>) : {};
}

// The starred messages that are whole, by chat; none at all when none is.
function starsOf(value: unknown): { stars?: Record<string, number[]> } {
  if (!object(value)) return {};
  const stars: Record<string, number[]> = {};
  for (const [id, list] of Object.entries(value)) {
    const ids = /^-?\d+$/.test(id) && Array.isArray(list) ? [...new Set(list.filter((n): n is number => Number.isSafeInteger(n)))] : [];
    if (ids.length) stars[id] = ids;
  }
  return Object.keys(stars).length ? { stars } : {};
}

// The chats' own notifications that are whole, by a chat id; none at all when none is.
function notifyOf(value: unknown): { notify?: Record<string, ChatNotify> } {
  if (!object(value)) return {};
  const notify: Record<string, ChatNotify> = {};
  for (const [id, n] of Object.entries(value)) {
    const ok = /^-?\d+$/.test(id) ? checkedChatNotify(n) : null;
    if (ok) notify[id] = ok;
  }
  return Object.keys(notify).length ? { notify } : {};
}

// The chats' PINs that are whole, by a chat id; none at all when none is.
function pinsOf(value: unknown): { pins?: Record<string, ChatPin> } {
  if (!object(value)) return {};
  const pins: Record<string, ChatPin> = {};
  for (const [id, pin] of Object.entries(value)) {
    const ok = /^-?\d+$/.test(id) ? checkedChatPin(pin) : null;
    if (ok) pins[id] = ok;
  }
  return Object.keys(pins).length ? { pins } : {};
}

/** What was kept, with anything of the wrong shape left out (a damaged chat starts over). */
export function checkedTelegram(value: unknown): TelegramData {
  if (!object(value)) return { ...EMPTY, seal: { seen: [], chats: {} } };
  const seal = object(value.seal) ? value.seal : {};
  const chats: Record<string, SealChat> = {};
  if (object(seal.chats)) {
    for (const [id, chat] of Object.entries(seal.chats)) {
      const ok = /^-?\d+$/.test(id) ? checkedChat(chat) : null;
      if (ok) chats[id] = ok;
    }
  }
  return {
    account: value.account === true,
    ...(value.ads === true ? { ads: true } : {}),
    ...(value.tor === true || value.tor === 'always' ? { tor: 'always' as const } : value.tor === 'space' ? { tor: 'space' as const } : {}),
    ...idsOf('torChats', value.torChats),
    ...(Array.isArray(value.homeFolders) && value.homeFolders.some((n) => Number.isSafeInteger(n))
      ? { homeFolders: (value.homeFolders as unknown[]).filter((n): n is number => Number.isSafeInteger(n)) }
      : {}),
    ...pinsOf(value.pins),
    ...idsOf('away', value.away),
    ...idsOf('fromSpace', value.fromSpace),
    ...starsOf(value.stars),
    ...idsOf('shots', value.shots),
    ...notifyOf(value.notify),
    seal: {
      account: typeof seal.account === 'string' ? seal.account : undefined,
      seen: Array.isArray(seal.seen) ? seal.seen.filter((s): s is string => typeof s === 'string') : [],
      chats,
    },
  };
}

type Opened = [chat: string, key: string, body: SealBody | '!'];
// As kept: the chats without their opened messages, which follow, last.
type Kept = Omit<TelegramData, 'seal'> & { seal: SealData; msgs?: Opened[] };

const KEY = /^[0-9a-f]{64}$/;
const SEP = '|';

// The order the opened messages were last written in, for each value, and as each one read was
// written: the ones opened since go after them, so what is written grows at its end.
const orders = new Map<string, string[]>();
const readOrders = new WeakMap<TelegramData, string[]>();

// What was kept, with the opened messages back in their chats.
function checkedKept(value: unknown): TelegramData {
  const data = checkedTelegram(value);
  // Those kept inside their chats, by an Erevos before this one, come first.
  const order = Object.entries(data.seal.chats).flatMap(([id, chat]) => Object.keys(chat.msgs ?? {}).map((key) => id + SEP + key));
  readOrders.set(data, order);
  const list = object(value) && Array.isArray(value.msgs) ? value.msgs : [];
  for (const entry of list) {
    if (!Array.isArray(entry) || typeof entry[0] !== 'string' || typeof entry[1] !== 'string' || !KEY.test(entry[1])) continue;
    const chat = data.seal.chats[entry[0]];
    const body: unknown = entry[2];
    if (!chat || !(body === '!' || (object(body) && typeof body.t === 'string'))) continue;
    if (!chat.msgs?.[entry[1]]) order.push(entry[0] + SEP + entry[1]);
    (chat.msgs ??= {})[entry[1]] = body as SealBody | '!';
  }
  return data;
}

const store = sealedFile<TelegramData>({ name: FILE, empty: EMPTY, checked: checkedKept, block: BLOCK });

function keptOf(slot: string, data: TelegramData): Kept {
  const chats: Record<string, SealChat> = {};
  const all = new Map<string, Opened>();
  for (const [id, chat] of Object.entries(data.seal.chats)) {
    const { msgs, ...rest } = chat;
    chats[id] = rest;
    for (const [key, body] of Object.entries(msgs ?? {})) all.set(id + SEP + key, [id, key, body]);
  }
  const order: string[] = [];
  const msgs: Opened[] = [];
  for (const name of orders.get(slot) ?? []) {
    const entry = all.get(name);
    if (!entry) continue;
    all.delete(name);
    order.push(name);
    msgs.push(entry);
  }
  for (const [name, entry] of all) {
    order.push(name);
    msgs.push(entry);
  }
  orders.set(slot, order);
  const { seal, ...rest } = data;
  return { ...rest, seal: { ...seal, chats }, ...(msgs.length > 0 ? { msgs } : {}) };
}

/** The space's Telegram, or a hidden place's own (`holder`). */
export async function loadTelegram(space: number, key: Uint8Array, holder: Holder = 'space'): Promise<TelegramData> {
  const data = await store.load(holder, space, key);
  // As it was written, so the next save writes them in the same order.
  orders.set(`${holder}/${space}`, readOrders.get(data) ?? []);
  return data;
}

/** Keeps the space's Telegram, or a hidden place's. */
export function saveTelegram(space: number, key: Uint8Array, data: TelegramData, holder: Holder = 'space'): Promise<void> {
  return store.save(holder, space, key, keptOf(`${holder}/${space}`, data) as TelegramData);
}
