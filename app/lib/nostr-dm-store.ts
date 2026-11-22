// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { checkedChatNotify, type ChatNotify } from '../lock/chat-notify';
import { currentSpace } from '../lock/keys';
import { loadNostrDm, saveNostrDm } from '../lock/nostr-dm-data';
import type { Holder } from '../lock/sealed-file';
import type { StickerPlace } from '../lock/sticker-data';
import { checkedLook, type Look } from '../theme/look';
import { changeGuard, type GuardChange } from './chat-protect';
import { canNostrChat } from './core';
import { sha256Bytes, toHex } from './crypto';
import { fileCache } from './file-cache';
import { plural, t } from './i18n';
import { addNetwork, hearing } from './network-notices';
import { actingWhere, type NetworkWhere } from './network-place';
import { PlaceLives, type PlaceKey } from './place-lives';
import { checkedWriting, sentOrShown, type WritingAccount } from './chat-writing';
import {
  addMessage,
  authEvent,
  chatOf,
  DEFAULT_INBOX,
  dropReaction,
  FOLLOWS_RELAYS,
  followsLook,
  forgetChat,
  INBOX_MOST,
  inboxEvent,
  inboxFilter,
  inboxOf,
  LOOKUP_RELAYS,
  markRead,
  nameIn,
  newGroup,
  newNostrDm,
  npubOf,
  OLD_DM_KIND,
  OLD_MOST,
  oldFilters,
  otherInboxes,
  POSTS_AT_ONCE,
  postParts,
  postsOf,
  profileEvent,
  pinHere,
  profileFieldsOf,
  putReaction,
  reactionContent,
  reactionOf,
  readersOf,
  readKey,
  readRelays,
  nip65Of,
  removeHere,
  sameRelays,
  setInbox,
  shortNpub,
  signed,
  signedOnce,
  TAKE_BACK_MOST,
  takeBack,
  takeWrap,
  verified,
  wrapMessage,
  writesOf,
  type NostrDmMessage,
  type NostrDmState,
  type NostrPost,
} from './nostr-dm';
import { lookUpNip05, NostrRelay, type NostrEvent } from './nostr-dm-net';
import { onRulesTick } from './chat-rules';
import { goesAtIn, nostrRulesDue, sweepNostrRules, timerOf } from './nostr-rules';
import { emojiTag } from './nostr-emoji';
import { accountTorOf, type AccountTor } from './account-tor';
import { accountHttp, chatTorHttp } from './net-http';
import { downloadBlob, FILE_SERVERS, fileTags, NOSTR_FILE_MOST, openFile, sealFile, uploadBlob, type NostrDmFile } from './nostr-files';
import { FEED_AT_ONCE, feedPage, feedPeople, feedRelays, tallyReactions, type FeedAnswer, type FeedPost, type PostReaction } from './nostr-feed';
import { POLL_KIND, POLL_RELAYS_MOST, pollCount, pollOf, pollOpen, pollTags, VOTE_KIND, voteTags, type PollCount } from './nostr-polls';

// The open space's Nostr chats as the screens use them (app/nostr-chats.tsx, app/nostr-chat.tsx):
// loaded from their sealed value (lock/nostr-dm-data.ts), reading the space's inbox relays while
// the space is open, and kept again after each change. Everything that changes the account runs one
// after another, as lib/xmpp-store.ts does; the relays are read all the while, apart from that.
//
// Each inbox relay has a connection of its own that reads, and answers one that asks who reads
// (NIP-42). Messages go out on other connections, which never say whose they are; so do look-ups
// of where someone reads and what they call themselves. A message to a group goes to each of its
// members' relays, a wrap for each; photos and files go to a Blossom server first
// (lib/nostr-files.ts).
//
// A hidden place's own key runs beside the space's while its hidden chats are open, and while they
// are closed too if they receive while closed (followNostrDmPlaces, lib/place-networks.ts): the
// open one's screens show it and act on it (lib/network-place.ts); what comes to one tells only of
// its place (lib/network-notices.ts), and its connections are its own, so no relay sees two keys on one.

type Live = {
  /** The space's account, or a hidden place's. */
  holder: Holder;
  space: number;
  key: Uint8Array;
  state: NostrDmState | null;
  loaded: boolean;
  problem: string;
  stopped: boolean;
  queue: Promise<unknown>;
  saving: ReturnType<typeof setTimeout> | null;
  /** The inbox relays read now, by address. */
  reading: Map<string, NostrRelay>;
  /** Which inbox each reader belongs to: a new inbox stops the old ones. */
  inboxAt: number;
  /** The inbox relays that said they sent all they keep, since the inbox was last read anew: the
   *  space has read all only once each of them has, so one not reached yet still sends from its start. */
  allSent: Set<string>;
  /** Its NIP-65 list is being looked for, for the relays of old private messages. */
  oldLooking: boolean;
  telling: boolean;
  /** The inbox or name changed while they were being told: told again after. */
  tellAgain: boolean;
  /** When the last list or name went out (seconds): the next one is newer, or relays keep the old. */
  listedAt: number;
  /** What its chats had not read after the last change, to tell of what came (lib/network-notices.ts). */
  heard: ReturnType<typeof hearing>;
  /** Its connections that only send or look up, by relay. */
  out: Map<string, { relay: Promise<NostrRelay>; idle: ReturnType<typeof setTimeout> | null }>;
};

let live: Live | null = null;
// The hidden places' own keys that run: the open hidden chats', and those receiving while closed.
const places = new PlaceLives<Live>(start, end);
const listeners = new Set<() => void>();

/** Told each time the account or its chats change. */
export function onNostrDmChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const told = () => listeners.forEach((listener) => listener());

const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));
const seconds = (now = Date.now()) => Math.floor(now / 1000);

/** The open space's account as it is now, or the open hidden place's, how many of its inbox relays it reads, and whether through Tor. */
export function nostrDmNow(where: NetworkWhere = 'space'): { loaded: boolean; state: NostrDmState | null; problem: string; reading: number; tor: boolean } {
  const it = where === 'place' ? places.shown() : live;
  const readers = [...(it?.reading.values() ?? [])].filter((relay) => relay.open);
  // The relays of its inbox read now; those read only for old private messages are not counted.
  const inbox = [...(it?.reading.entries() ?? [])].filter(([url, relay]) => relay.open && it?.state?.inbox.includes(url));
  return { loaded: it?.loaded ?? false, state: it?.state ?? null, problem: it?.problem ?? '', reading: inbox.length, tor: readers.length > 0 && readers.every((relay) => relay.tor) };
}

/** The account the screen on top acts on. */
function acting(): Live | null {
  return actingWhere() === 'place' ? places.shown() : live;
}

/** How many messages are not read in the open space's Nostr chats. */
export function nostrDmUnread(): number {
  const state = live?.state;
  return state ? Object.values(state.chats).reduce((sum, chat) => sum + chat.unread, 0) : 0;
}

// Each chat's messages not read, by its home row (lib/inbox.ts).
function unreadAt(state: NostrDmState | null): Map<string, number> {
  const at = new Map<string, number>();
  for (const chat of Object.values(state?.chats ?? {})) if (chat.unread > 0) at.set(`nostr:${chat.key}`, chat.unread);
  return at;
}

addNetwork('nostr:', {
  unread: () => (live && !live.stopped ? unreadAt(live.state) : new Map()),
  notifyOf: (where) => checkedChatNotify(live?.state?.chats[where.slice('nostr:'.length)]?.notify),
});

function stillOpen(it: Live): boolean {
  if (it.stopped) return false;
  try {
    return currentSpace().space === it.space;
  } catch {
    return false;
  }
}

function keepSoon(it: Live): void {
  if (it.saving) return;
  it.saving = setTimeout(() => {
    it.saving = null;
    saveNostrDm(it.space, it.key, it.state, it.holder).catch((error: unknown) => {
      it.problem = reason(error);
      told();
    });
  }, 500);
}

/**
 * Runs `change` on the account after every change asked for before, then keeps it and tells the
 * screens, and of the messages that came or were read. A key brought from another app first takes
 * what its relays still keep, until they say that was all, and tells of none of it.
 */
function changeAccount<T>(it: Live, change: () => Promise<T>, quietly = false): Promise<T> {
  const run = it.queue
    .catch(() => undefined)
    .then(async () => {
      const quiet = quietly || !it.state || it.state.caught === 0;
      try {
        return await change();
      } finally {
        // What is gone by the chats' rules goes from here, before anything tells of it (lib/nostr-rules.ts).
        if (it.state) sweepNostrRules(it.state);
        // A hidden place's tell only of its place (hearing).
        if (!it.stopped) it.heard.hear(unreadAt(it.state), quiet);
      }
    });
  it.queue = run;
  return run.finally(() => {
    keepSoon(it);
    told();
  });
}

// While nothing comes, the keys that run look for what is gone now and then: the space's, its open
// hidden place's, and one of the places receiving while closed each time.
onRulesTick(() => {
  const due = (it: Live | null): it is Live & { state: NostrDmState } => !!it && !it.stopped && !!it.state && nostrRulesDue(it.state);
  const closed = places.closed((it) => due(it))?.it ?? null;
  for (const it of new Set([live, places.shown(), closed])) if (due(it)) void changeAccount(it, async () => undefined).catch(() => undefined);
});

/** Changes the account the screen on top acts on, after what was asked before, then keeps it and tells the screens (lib/nostr-rules.ts). */
export function nostrDmAct<T>(use: (state: NostrDmState) => Promise<T>): Promise<T> {
  const it = need();
  return changeAccount(it, () => use(it.state));
}

// Connections that only send or look up, by relay, kept a minute after their last use.
const IDLE_CLOSE = 60_000;

// A chat sent through Tor by itself (NostrDmChat.tor) has connections of its own, on circuits of
// its own (lib/nostr-dm-net.ts chatTorLink): `via` names it, its key. Reading the space's inbox
// stays shared, so what comes follows the account's way.
function outTo(it: Live, url: string, via?: string): Promise<NostrRelay> {
  const out = it.out;
  const choice = choiceOf(it.state);
  const at = via ? `${via}\n${url}` : url;
  let held = out.get(at);
  if (held) {
    if (held.idle) clearTimeout(held.idle);
    held.idle = null;
  } else {
    held = { relay: NostrRelay.open(url, null, via, choice), idle: null };
    const it = held;
    out.set(at, it);
    it.relay.then(
      (relay) => relay.onEnd(() => out.get(at) === it && out.delete(at)),
      () => out.get(at) === it && out.delete(at),
    );
  }
  const used = held;
  used.idle = setTimeout(() => {
    if (out.get(at) !== used) return;
    out.delete(at);
    void used.relay.then((relay) => relay.close()).catch(() => undefined);
  }, IDLE_CLOSE);
  return held.relay;
}

function closeOut(it: Live): void {
  const out = it.out;
  for (const [url, held] of out) {
    if (held.idle) clearTimeout(held.idle);
    out.delete(url);
    void held.relay.then((relay) => relay.close()).catch(() => undefined);
  }
}

/** Sends `event` to each relay, on a chat's own connections with `via`; answers how many took it. */
async function publish(it: Live, urls: string[], event: NostrEvent, via?: string): Promise<number> {
  const took = await Promise.all(
    [...new Set(urls)].map(async (url) => {
      try {
        return (await (await outTo(it, url, via)).publish(event)).ok;
      } catch {
        return false;
      }
    }),
  );
  return took.filter(Boolean).length;
}

/** What these relays have for `filters`, together. */
async function lookUp(it: Live, urls: string[], filters: Record<string, unknown>[], ms = 8000, via?: string): Promise<NostrEvent[]> {
  return (await lookUpAnswered(it, urls, filters, ms, via)).events;
}

/** As lookUp, and whether any relay answered at all: none found, or none to ask, are not the same. */
async function lookUpAnswered(it: Live, urls: string[], filters: Record<string, unknown>[], ms = 8000, via?: string): Promise<{ events: NostrEvent[]; answered: boolean }> {
  const found = await Promise.all(
    [...new Set(urls)].map(async (url) => {
      try {
        return await (await outTo(it, url, via)).query(filters, ms);
      } catch {
        return null;
      }
    }),
  );
  return { events: found.flatMap((events) => events ?? []), answered: found.some((events) => events !== null) };
}

/** Says where the space reads, once its inbox changed or a week went by, and its name if it gave one. */
async function tell(it: Live): Promise<void> {
  if (it.telling) {
    it.tellAgain = true;
    return;
  }
  it.telling = true;
  try {
    do {
      it.tellAgain = false;
      const state = it.state;
      if (!state || state.told > seconds() - 7 * 24 * 3600) return;
      const where = [...state.inbox, ...LOOKUP_RELAYS];
      // A relay keeps one list per key, the newest: two in the same second could keep the older.
      const at = Math.max(Date.now(), (it.listedAt + 1) * 1000);
      it.listedAt = seconds(at);
      const events = [await inboxEvent(state, at)];
      // The name goes in the key's newest profile, which keeps what else it says (a key brought from
      // another app keeps its picture and words there): never written while no relay answered, nor
      // over a profile that cannot be read. It is tried again when the space next reads.
      let whole = true;
      if (state.name !== undefined) {
        const mine = await lookUpAnswered(it, where, [{ kinds: [0], authors: [state.public] }]);
        const kept = mine.answered ? await profileFieldsOf(state.public, mine.events) : null;
        // Later than the profile it changes, or relays keep that one.
        if (kept) events.push(await profileEvent(state, Math.max(at, (kept.at + 1) * 1000), kept.fields));
        else whole = false;
      }
      let took = 0;
      for (const event of events) took += await publish(it, where, event);
      if (took > 0 && whole && it.state === state && !it.tellAgain) {
        await changeAccount(it, async () => {
          state.told = seconds();
        });
      }
    } while (it.tellAgain && stillOpen(it));
  } finally {
    it.telling = false;
  }
}

/** Whether `ended` came within `ms`. */
function endedWithin(ended: Promise<unknown>, ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), ms);
    void ended.then(() => {
      clearTimeout(timer);
      resolve(true);
    });
  });
}

/** Reads one inbox relay while the space is open and the inbox still names it, connecting again after a wait that grows. */
async function read(it: Live, url: string, inboxAt: number): Promise<void> {
  let wait = 3000;
  while (stillOpen(it) && it.state && it.inboxAt === inboxAt) {
    const state = it.state;
    try {
      const relay = await NostrRelay.open(url, (where, challenge) => authEvent(state, where, challenge), undefined, choiceOf(state));
      if (!stillOpen(it) || it.inboxAt !== inboxAt) {
        relay.close();
        return;
      }
      it.reading.set(url, relay);
      told();
      const askedAt = seconds();
      let caughtUp = false;
      // An inbox relay is asked for the wraps and the old private messages (NIP-04); another, only for those.
      const inInbox = state.inbox.includes(url);
      const oldBefore = state.oldSent?.[url];
      const stop = relay.subscribe(
        inInbox ? [inboxFilter(state), ...oldFilters(state, url)] : oldFilters(state, url),
        (event) =>
          void changeAccount(
            it,
            async () => {
              if (it.state === state) await takeWrap(state, event);
            },
            // What a relay keeps of old private messages, until it said it sent all, came before.
            event.kind === OLD_DM_KIND && !oldBefore && !state.oldSent?.[url],
          ),
        () => {
          // It answers: should it end later, it is asked again soon.
          wait = 3000;
          if (it.inboxAt !== inboxAt) return;
          it.allSent.add(url);
          void changeAccount(it, async () => {
            if (it.inboxAt !== inboxAt || !readRelays(state).includes(url)) return;
            state.oldSent = keepOldSent(state, url, Math.max(state.oldSent?.[url] ?? 0, askedAt));
          });
          if (!inInbox) return;
          caughtUp = state.inbox.every((relay) => it.allSent.has(relay));
          if (!caughtUp) return;
          // Not once the inbox changed meanwhile: the new one is read from its start.
          void changeAccount(it, async () => {
            if (it.inboxAt === inboxAt && state.inbox.includes(url)) state.caught = Math.max(state.caught, askedAt);
          });
        },
        // The relay stopped sending (it closed the ask): it is asked again on a new connection,
        // after a wait that grows while it keeps doing so, instead of staying open and silent.
        () => relay.close(),
      );
      // While it reads: what came since counts as read too, every ten minutes.
      const ended = relay.whenEnded();
      for (;;) {
        const done = await endedWithin(ended, 600_000);
        if (done || !stillOpen(it) || it.inboxAt !== inboxAt) break;
        caughtUp = inInbox && state.inbox.every((relay) => it.allSent.has(relay));
        if (caughtUp) {
          void changeAccount(it, async () => {
            if (it.inboxAt === inboxAt && state.inbox.includes(url)) state.caught = Math.max(state.caught, seconds() - 60);
          });
        }
        if (it.allSent.has(url)) {
          void changeAccount(it, async () => {
            if (it.inboxAt === inboxAt && readRelays(state).includes(url)) state.oldSent = keepOldSent(state, url, seconds() - 60);
          });
        }
      }
      stop();
      relay.close();
      if (it.reading.get(url) === relay) it.reading.delete(url);
      told();
    } catch (error) {
      it.problem = reason(error);
      told();
    }
    if (!stillOpen(it) || it.inboxAt !== inboxAt) return;
    await new Promise((resolve) => setTimeout(resolve, wait));
    wait = Math.min(wait * 2, 300_000);
  }
}

function startReading(it: Live): void {
  const state = it.state;
  if (!state) return;
  it.inboxAt += 1;
  it.allSent = new Set();
  for (const relay of it.reading.values()) relay.close();
  it.reading.clear();
  for (const url of readRelays(state)) void read(it, url, it.inboxAt);
  // A key brought from another app first looks where that app reads its messages, and only then
  // says where it reads, so as not to name other relays than that app over its list.
  if (!state.madeHere && !state.inboxLooked) void lookForInbox(it, state).catch(() => undefined);
  else void tell(it).catch(() => undefined);
  // And where others write to it the old way (NIP-04): the relays of its own NIP-65 list.
  if (!state.madeHere && !state.oldLooked) void lookForOld(it, state).catch(() => undefined);
}

/** The relays read for old private messages and until when each sent all, for those still read. */
function keepOldSent(state: NostrDmState, url: string, at: number): Record<string, number> {
  const read = readRelays(state);
  const kept = Object.entries(state.oldSent ?? {}).filter(([relay, sent]) => read.includes(relay) && typeof sent === 'number');
  return { ...Object.fromEntries(kept), [url]: at };
}

/**
 * For a key brought from another app: the relays of its own NIP-65 list (kind 10002), looked for
 * once on the relays that gather such lists, where apps that send the old private messages
 * (NIP-04) write to it; read from then on, OLD_MOST relays at most besides the inbox. Until a relay
 * answers, it is tried again the next time.
 */
async function lookForOld(it: Live, state: NostrDmState): Promise<void> {
  if (it.oldLooking) return;
  it.oldLooking = true;
  try {
    const found = await lookUpAnswered(it, [...LOOKUP_RELAYS, ...FOLLOWS_RELAYS], [{ kinds: [10002], authors: [state.public] }], LOOK_WAIT);
    if (!found.answered || it.state !== state || !stillOpen(it)) return;
    const relays = (await nip65Of(state.public, found.events)).filter((relay) => !DEFAULT_INBOX.includes(relay)).slice(0, OLD_MOST);
    const before = readRelays(state);
    await changeAccount(it, async () => {
      if (it.state !== state) return;
      state.oldLooked = seconds();
      state.oldRelays = relays;
    });
    if (it.state === state && stillOpen(it) && !sameRelays(before, readRelays(state))) startReading(it);
  } finally {
    it.oldLooking = false;
  }
}

/** How long the lists of a brought key are waited for, through Tor, and the wraps a relay keeps. */
const LOOK_WAIT = 15_000;
const CATCH_UP_WAIT = 30_000;
/** The most relays asked once for what they keep. */
const CATCH_UP_MOST = 8;

/**
 * For a key brought from another app (Amethyst, say): where that app said its messages come (its
 * kind 10050), looked for on the relays that gather such lists, on the key's own (NIP-65) and the
 * inbox. An inbox Erevos chose (never changed here) becomes that app's, which then goes out again as
 * the key's newest list, and is read from its start; what the other lists' relays and the inbox
 * before keep is fetched once. Until a relay answers, it is tried again the next time.
 */
async function lookForInbox(it: Live, state: NostrDmState): Promise<void> {
  const me = state.public;
  const own = await lookUpAnswered(it, [...LOOKUP_RELAYS, ...FOLLOWS_RELAYS], [{ kinds: [10002], authors: [me] }], LOOK_WAIT);
  const writes = await writesOf(me, own.events);
  const where = [...new Set([...LOOKUP_RELAYS, ...FOLLOWS_RELAYS, ...DEFAULT_INBOX, ...state.inbox, ...writes])];
  const found = await lookUpAnswered(it, where, [{ kinds: [10050], authors: [me] }], LOOK_WAIT);
  if (!found.answered || it.state !== state || !stillOpen(it)) return;
  const others = await otherInboxes(me, found.events, state.inbox);
  const before = state.inbox;
  const adopt = others.length > 0 && sameRelays(state.inbox, DEFAULT_INBOX) ? others[0].relays.slice(0, INBOX_MOST) : null;
  await changeAccount(it, async () => {
    if (it.state !== state) return;
    state.inboxLooked = seconds();
    if (adopt) {
      state.inbox = adopt;
      state.told = 0;
      state.caught = 0;
    }
  });
  if (it.state !== state || !stillOpen(it)) return;
  if (adopt) startReading(it);
  else void tell(it).catch(() => undefined);
  const extra = [...new Set([...others.flatMap((other) => other.relays), ...(adopt ? before : [])])].filter((relay) => !state.inbox.includes(relay));
  await catchUp(it, state, extra.slice(0, CATCH_UP_MOST));
}

/** Fetches once what these relays keep for the key (its wraps), saying who reads where they ask, quietly: it came before. */
async function catchUp(it: Live, state: NostrDmState, urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      let relay: NostrRelay | null = null;
      try {
        relay = await NostrRelay.open(url, (where, challenge) => authEvent(state, where, challenge), undefined, choiceOf(state));
        const { events } = await relay.ask([{ kinds: [1059], '#p': [state.public], limit: 1000 }], CATCH_UP_WAIT);
        if (!events.length || it.state !== state || !stillOpen(it)) return;
        await changeAccount(
          it,
          async () => {
            for (const event of events) if (it.state === state) await takeWrap(state, event);
          },
          true,
        );
      } catch {
        // Not reached: what it keeps stays there.
      } finally {
        relay?.close();
      }
    }),
  );
}

/** Loads the open space's account, once, and reads its inbox while the space stays open. */
export function runNostrDm(): void {
  if (!canNostrChat()) return;
  let space: { space: number; key: Uint8Array };
  try {
    space = currentSpace();
  } catch {
    return;
  }
  if (live && live.space === space.space && !live.stopped) return;
  stopNostrDm();
  live = start('space', space.space, space.key);
}

/**
 * Runs the own keys of the hidden places of `space` in `wanted`, each loaded once and its inbox read
 * while it stays wanted, and lets go of the others; `shown` is the pocket of the open hidden chats.
 */
export function followNostrDmPlaces(space: number, wanted: PlaceKey[], shown: number | null): void {
  const was = places.shown();
  if (!places.follow(space, canNostrChat() ? wanted : [], shown)) return;
  // What was fetched for the open hidden chats goes as they close.
  if (was && !places.isShown(was)) fetched.clear();
  told();
}

/** Stops reading every hidden place's key and lets go of them. */
export function closeNostrDmPlaces(): void {
  if (!places.stopAll()) return;
  fetched.clear();
  told();
}

function start(holder: Holder, space: number, key: Uint8Array, pocket?: number): Live {
  const it: Live = {
    holder,
    space,
    key,
    state: null,
    loaded: false,
    problem: '',
    stopped: false,
    queue: Promise.resolve(),
    saving: null,
    reading: new Map(),
    inboxAt: 0,
    allSent: new Set(),
    oldLooking: false,
    telling: false,
    tellAgain: false,
    listedAt: 0,
    // A hidden place's muted chats tell of nothing (lib/network-notices.ts).
    heard: hearing(pocket === undefined ? undefined : { space, pocket }, (where) => checkedChatNotify(it.state?.chats[where.slice('nostr:'.length)]?.notify)),
    out: new Map(),
  };
  loadNostrDm(space, key, holder)
    .then((state) => {
      // What was still going when the space closed did not go.
      for (const chat of Object.values(state?.chats ?? {})) for (const m of chat.messages) if (m.state === 'sending') m.state = 'failed';
      it.state = state;
      it.heard.hear(unreadAt(state), true);
      it.loaded = true;
      told();
      startReading(it);
    })
    .catch((error: unknown) => {
      it.loaded = true;
      it.problem = reason(error);
      told();
    });
  return it;
}

function end(it: Live): void {
  it.stopped = true;
  it.inboxAt += 1;
  for (const relay of it.reading.values()) relay.close();
  it.reading.clear();
  closeOut(it);
}

/** Stops reading and lets go of the account, as its space closes, and of its hidden place's. */
export function stopNostrDm(): void {
  closeNostrDmPlaces();
  if (!live) return;
  end(live);
  live = null;
  fetched.clear();
  nostrDmFeedDone();
  told();
}

function need(): Live & { state: NostrDmState } {
  const it = acting();
  if (!it?.state) throw new Error(t('There are no Nostr chats in this space.'));
  return it as Live & { state: NostrDmState };
}

function opened(): Live {
  const it = acting();
  if (!it || it.stopped) throw new Error(t('There are no Nostr chats in this space.'));
  return it;
}

async function begin(it: Live, state: NostrDmState): Promise<void> {
  await changeAccount(it, async () => {
    it.state = state;
    it.problem = '';
  });
  await saveNostrDm(it.space, it.key, state, it.holder);
  startReading(it);
}

/** Makes the open space a Nostr key of its own, its Tor `tor` (Off unless chosen). */
export async function nostrDmMake(tor: AccountTor = 'never'): Promise<void> {
  const it = opened();
  await begin(it, { ...(await newNostrDm()), tor });
}

/** Brings a key from another Nostr app: its nsec. */
export async function nostrDmBring(nsec: string, tor: AccountTor = 'never'): Promise<void> {
  const it = opened();
  const written = await readKey(nsec);
  if (written.type !== 'nsec' || !written.secret) throw new Error(t('Write the key that starts with nsec1, from the app that has it.'));
  await begin(it, { ...(await newNostrDm(written.secret)), tor });
}

// The space's own account, or with `place` that hidden place's own while it runs
// (lib/place-networks.ts), loaded, for what Linked devices brings or lets go of
// (lib/linked-accounts.ts): null when `space` is not the open one, the place's does not run, or this
// build has no Nostr chats.
async function spaceAccount(space: number, place?: PlaceKey): Promise<Live | null> {
  if (!place) runNostrDm();
  const now = () => (place ? places.running(space, place.pocket, place.key) : live);
  // A place's starts as its hidden chats open (lib/place-networks.ts), maybe just after its links.
  for (let waited = 0, it = now(); (it ? !it.loaded && !it.stopped : !!place) && waited < 20_000; waited += 200, it = now()) await new Promise((resolve) => setTimeout(resolve, 200));
  const it = now();
  return it && it.loaded && !it.stopped && it.space === space && (place || it.holder === 'space') ? it : null;
}

/**
 * Gives the space `space`, or its hidden `place`, the Nostr key its phone gave it
 * (lib/linked-accounts.ts), with the relays it reads on, its name and file servers, when it has
 * none: answers whether it did, had that key already, or has another; null when `space` is not
 * open, or the place's account does not run.
 */
export async function nostrDmTake(space: number, given: { secret: string; inbox: string[]; name?: string; files?: string[] }, place?: PlaceKey): Promise<'brought' | 'had' | 'other' | null> {
  const it = await spaceAccount(space, place);
  if (!it) return null;
  const now = () => (it.state ? (it.state.secret === given.secret ? 'had' : 'other') : null);
  if (it.state) return now();
  const state = await newNostrDm(given.secret);
  if (given.inbox.length > 0) state.inbox = given.inbox.slice(0, INBOX_MOST);
  if (given.name !== undefined) state.name = given.name;
  if (given.files?.length) state.files = given.files.slice(0, 5);
  // The phone told where the key reads, and its name: told again from here once that is a week
  // old, or changed here. Where its other app reads was looked for there.
  state.told = seconds();
  state.inboxLooked = seconds();
  if (it.state || it.stopped) return it.stopped ? null : now();
  await begin(it, state);
  return 'brought';
}

/** Lets the space `space` (or its hidden `place`) forget the Nostr key it brought from its phone (`publicKey`, hex), once unlinked from it, if it still has it. */
export async function nostrDmLetGo(space: number, publicKey: string, place?: PlaceKey): Promise<void> {
  const it = await spaceAccount(space, place);
  if (it?.state?.public === publicKey) await forgetOf(it);
}

/** The public half of the Nostr key of the space `space`, or of its hidden `place` while its account runs, hex; null for none. */
export async function nostrDmPublicOf(space: number, place?: PlaceKey): Promise<string | null> {
  return (await spaceAccount(space, place))?.state?.public ?? null;
}

/** Forgets the space's key and its chats here. */
export async function nostrDmForget(): Promise<void> {
  await forgetOf(need());
}

async function forgetOf(it: Live): Promise<void> {
  await changeAccount(it, async () => {
    it.state = null;
    it.inboxAt += 1;
    for (const relay of it.reading.values()) relay.close();
    it.reading.clear();
  });
  await saveNostrDm(it.space, it.key, null, it.holder);
}

/** Reads on these relays from now on, and tells others so. */
export async function nostrDmSetInbox(relays: string[]): Promise<void> {
  const it = need();
  await changeAccount(it, async () => setInbox(it.state, relays));
  startReading(it);
}

/** The name the space shows to other Nostr apps (published, so anyone can read it), or none. */
export async function nostrDmSetName(name: string): Promise<void> {
  const it = need();
  await changeAccount(it, async () => {
    it.state.name = name.trim().slice(0, 64);
    it.state.told = 0;
  });
  await tell(it);
}

/** Where `key` reads (their kind 10050), as looked up now, and their name; on a chat's own connections with `via`. */
async function lookUpPerson(it: Live & { state: NostrDmState }, key: string, via = torWayOf(it.state, key)): Promise<string[] | null> {
  const state = it.state;
  const chat = state.chats[key];
  const where = [...state.inbox, ...LOOKUP_RELAYS, ...(chat?.hints ?? [])];
  const events = await lookUp(it, where, [{ kinds: [10050, 0], authors: [key] }], 8000, via);
  const relays = await inboxOf(key, events);
  const name = await nameIn(key, events);
  await changeAccount(it, async () => {
    const before = state.people[key];
    state.people[key] = {
      ...(name ? { name } : {}),
      at: seconds(),
      ...(relays ? { relays, relaysAt: seconds() } : before?.relays ? { relays: before.relays, relaysAt: before.relaysAt } : {}),
    };
  });
  return relays;
}

/** Where `key` reads: as looked up in the last six hours, or looked up now, or as last known. */
async function relaysOf(it: Live & { state: NostrDmState }, key: string, via?: string): Promise<string[] | null> {
  const state = it.state;
  if (key === state.public) return state.inbox;
  const person = state.people[key];
  // Before groups, a chat kept where its person reads.
  const known = person?.relays ?? state.chats[key]?.relays;
  const knownAt = person?.relaysAt ?? state.chats[key]?.relaysAt ?? 0;
  if (known && knownAt > seconds() - 6 * 3600) return known;
  return (await lookUpPerson(it, key, via).catch(() => null)) ?? known ?? null;
}

/** The account's own Tor choice (lib/account-tor.ts): Off for a new one unless chosen. */
function choiceOf(state: NostrDmState | null | undefined): AccountTor {
  return accountTorOf(state?.tor);
}

/** The account's Tor choice, of the open space's or the open hidden place's, as the screens show it. */
export function nostrDmTor(where: NetworkWhere = 'space'): AccountTor {
  return choiceOf(nostrDmNow(where).state);
}

/**
 * Changes the account's Tor choice: its connections close and open again the new way, its inbox
 * read again. A chat sent through Tor by itself stays so, whatever is chosen here.
 */
export async function nostrDmSetAccountTor(tor: AccountTor): Promise<void> {
  const it = need();
  await changeAccount(it, async () => {
    it.state.tor = tor;
  });
  closeOut(it);
  startReading(it);
}

/** The chat `key`'s own way through Tor (outTo's `via`) while it is sent through Tor by itself. */
function torWayOf(state: NostrDmState, key: string): string | undefined {
  return state.chats[key]?.tor ? key : undefined;
}

/** Starts a chat with someone written as an npub, an nprofile or a name@domain (NIP-05); answers their key. */
export async function nostrDmStart(written: string, name = ''): Promise<string> {
  const it = need();
  const text = written.trim();
  let found: { public: string; relays: string[] } | null;
  if (/^[^@\s]+@[^@\s]+$/.test(text) && !text.startsWith('npub') && !text.startsWith('nprofile')) {
    found = await lookUpNip05(text, choiceOf(it.state)).catch((error: unknown) => {
      // Tor not ready says so; a name that cannot be reached is one with no key.
      if (error instanceof Error && error.message === t('Tor is not ready.')) throw error;
      return null;
    });
    if (!found) throw new Error(t('No Nostr key was found for {name}.', { name: text }));
  } else {
    const key = await readKey(text);
    if (key.type === 'nsec') throw new Error(t('This is a secret key (nsec): never give it to anyone. Write their npub.'));
    found = key;
  }
  const key = found.public;
  await changeAccount(it, async () => {
    const chat = chatOf(it.state, key);
    if (name.trim()) chat.name = name.trim().slice(0, 64);
    const hints = found!.relays.filter((r) => /^wss?:\/\//.test(r)).slice(0, 5);
    if (hints.length) chat.hints = hints;
    chat.lastAt ||= Date.now();
  });
  void lookUpPerson(it, key).catch(() => undefined);
  return key;
}

/** Someone the space's Nostr key follows: their key, and the name they gave themselves if one was found. */
export type NostrFollow = { key: string; name?: string };

/**
 * How a look-up of the follow list went, said under its button when no one was found: each relay
 * asked and how it answered (all it keeps, closed and why, too slow, not reached), how many follow
 * lists of the key came, how many of them passed the check, and how many people the newest checked
 * one names.
 */
export type NostrFollowsReport = {
  relays: { url: string; how: 'all' | 'closed' | 'late' | 'unreached'; why?: string }[];
  lists: number;
  checked: number;
  people: number;
};

/**
 * What the screen says when the look-up found no one: why first (no relay answered, no list, no
 * list that passed the check, or an empty one), whose list was looked for, then the relays by how
 * they answered.
 */
export function sayFollowsReport(report: NostrFollowsReport, key: string): string[] {
  const said = [
    !report.relays.some((r) => r.how === 'all')
      ? t('No relay answered. Try again in a while.')
      : report.lists === 0
        ? t('No list of people you follow was found on your relays.')
        : report.checked === 0
          ? t('Lists of people you follow were found, but none passed the signature check.')
          : t('Your newest list of people you follow has no one in it.'),
    t('Looked for the list of {npub}.', { npub: shortNpub(npubOf(key)) }),
  ];
  return [...said, ...sayRelays(report.relays)];
}

/** How each relay answered, a line for each way, those that answered first. */
function sayRelays(relays: NostrFollowsReport['relays']): string[] {
  const said: string[] = [];
  const host = (url: string) => url.replace(/^wss?:\/\//, '').replace(/\/+$/, '');
  const of = (how: NostrFollowsReport['relays'][number]['how']) => relays.filter((r) => r.how === how);
  const answered = of('all').map((r) => host(r.url));
  const late = of('late').map((r) => host(r.url));
  const closed = of('closed').map((r) => (r.why ? `${host(r.url)} (${r.why.slice(0, 80)})` : host(r.url)));
  const unreached = of('unreached').map((r) => host(r.url));
  if (answered.length) said.push(t('Answered: {relays}.', { relays: answered.join(', ') }));
  if (late.length) said.push(t('Too slow: {relays}.', { relays: late.join(', ') }));
  if (closed.length) said.push(t('Closed: {relays}.', { relays: closed.join(', ') }));
  if (unreached.length) said.push(t('Not reached: {relays}.', { relays: unreached.join(', ') }));
  return said;
}

/**
 * What the Public tab says when the newest page of a key that follows people has no post: whether
 * posts came and none could be shown, or none came, then how each relay answered the ask.
 */
export function sayFeedReport(page: Pick<NostrFeedPage, 'follows' | 'came' | 'relays'>): string[] {
  const first =
    page.came > 0
      ? plural(page.came, '{n} post came from the relays, but none could be shown.', '{n} posts came from the relays, but none could be shown.')
      : plural(page.follows, 'You follow {n} person, but no relay sent a post of theirs.', 'You follow {n} people, but no relay sent a post of theirs.');
  return [first, ...sayRelays(page.relays)];
}

// How many people one look-up of names asks for, and how many such look-ups go at once.
const NAMES_AT_ONCE = 200;
const LOOKUPS_AT_ONCE = 2;
// How long the follow list's look-up waits for each relay to be reached, and then to say all it
// keeps: through Tor both take longer than straight.
const FOLLOWS_REACH_WAIT = 20_000;
const FOLLOWS_WAIT = 15_000;

/** A connection that only looks up, to the relay at `url`, or why none came within FOLLOWS_REACH_WAIT. */
async function reach(it: Live, url: string): Promise<NostrRelay> {
  let late: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      outTo(it, url),
      new Promise<never>((_, fail) => {
        late = setTimeout(() => fail(new Error(t('The Nostr relay did not answer.'))), FOLLOWS_REACH_WAIT);
      }),
    ]);
  } finally {
    clearTimeout(late);
  }
}

/** What each of these relays has for `filters`, together, and how each answered. */
async function lookUpEach(it: Live, urls: string[], filters: Record<string, unknown>[]): Promise<{ events: NostrEvent[]; relays: NostrFollowsReport['relays'] }> {
  const answers = await Promise.all(
    [...new Set(urls)].map(async (url) => {
      let relay: NostrRelay;
      try {
        relay = await reach(it, url);
      } catch (error) {
        return { url, how: 'unreached' as const, why: error instanceof Error ? error.message : String(error), events: [] };
      }
      return { url, ...(await relay.ask(filters, FOLLOWS_WAIT)) };
    }),
  );
  return {
    events: answers.flatMap((answer) => answer.events),
    relays: answers.map(({ url, how, why }) => (why ? { url, how, why } : { url, how })),
  };
}

/**
 * The follow list of the space's key (kind 3), looked up now on the relays it reads on, the usual
 * ones for look-ups and those that gather such lists, then on those its relay list (NIP-65) says it
 * writes on, where the other apps of a key brought here keep it: whom its newest checked one names,
 * and how the look-up went.
 */
async function followListOf(it: Live, state: NostrDmState): Promise<{ keys: string[]; report: NostrFollowsReport }> {
  const where = [...new Set([...state.inbox, ...LOOKUP_RELAYS, ...FOLLOWS_RELAYS])];
  const first = await lookUpEach(it, where, [{ kinds: [3, 10002], authors: [state.public] }]);
  const writes = (await writesOf(state.public, first.events)).filter((url) => !where.includes(url));
  const second = writes.length ? await lookUpEach(it, writes, [{ kinds: [3], authors: [state.public] }]) : { events: [], relays: [] };
  const look = await followsLook(state.public, [...first.events, ...second.events]);
  const relays = [...first.relays, ...second.relays];
  return { keys: look.keys, report: { relays, lists: look.lists, checked: look.checked, people: look.keys.length } };
}

/**
 * What these relays have for `filter` of each NAMES_AT_ONCE of `keys`, LOOKUPS_AT_ONCE look-ups at
 * once, together, each relay reached within FOLLOWS_REACH_WAIT as lookUpEach does: a relay that
 * cannot be reached keeps none waiting. With them, the keys of the batches a relay said all it
 * keeps for (`answered`): of the others, nothing found says nothing. No look-up begins after `ends`
 * (as Date.now() counts): its keys are not answered.
 */
async function lookUpBatched(
  it: Live,
  urls: string[],
  keys: string[],
  filter: (batch: string[]) => Record<string, unknown>,
  ends = Infinity,
): Promise<{ events: NostrEvent[]; answered: string[] }> {
  const batches: string[][] = [];
  for (let i = 0; i < keys.length; i += NAMES_AT_ONCE) batches.push(keys.slice(i, i + NAMES_AT_ONCE));
  const events: NostrEvent[] = [];
  const answered: string[] = [];
  for (let i = 0; i < batches.length && Date.now() < ends; i += LOOKUPS_AT_ONCE) {
    const asked = batches.slice(i, i + LOOKUPS_AT_ONCE);
    const found = await Promise.all(asked.map((batch) => lookUpEach(it, urls, [filter(batch)])));
    found.forEach((one, n) => {
      events.push(...one.events);
      if (one.relays.some((relay) => relay.how === 'all')) answered.push(...asked[n]);
    });
  }
  return { events, answered };
}

/** These events of `kind`, by their author's key. */
function byAuthor(found: { events: NostrEvent[] }, kind: number): Map<string, NostrEvent[]> {
  const byKey = new Map<string, NostrEvent[]>();
  for (const event of found.events) {
    if (event.kind !== kind) continue;
    const list = byKey.get(event.pubkey);
    if (list) list.push(event);
    else byKey.set(event.pubkey, [event]);
  }
  return byKey;
}

/**
 * Whom the space's Nostr key follows, as its follow list (kind 3) says (followListOf), with the
 * names they gave themselves (kind 0): named ones first, by name. The list is public, so asking for
 * it and their names tells a relay nothing it could not know; it goes as the space's Tor way says,
 * as every look-up does. With it, how the look-up went, for the screen to say when no one was found.
 */
export async function nostrDmFollows(): Promise<{ people: NostrFollow[]; report: NostrFollowsReport }> {
  const it = need();
  const state = it.state;
  const { keys, report } = await followListOf(it, state);
  if (keys.length === 0) return { people: [], report };
  // Names are asked of the relays that answered.
  const answering = report.relays.filter((r) => r.how === 'all').map((r) => r.url);
  const byKey = byAuthor(await lookUpBatched(it, answering, keys, (batch) => ({ kinds: [0], authors: batch })), 0);
  const follows = await Promise.all(
    keys.map(async (key): Promise<NostrFollow> => {
      // A name this space gave them comes first, as in their chat.
      const name = (!state.chats[key]?.members && state.chats[key]?.name) || (await nameIn(key, byKey.get(key) ?? [])) || state.people[key]?.name;
      return name ? { key, name } : { key };
    }),
  );
  const named = follows.filter((f) => f.name).sort((a, b) => a.name!.localeCompare(b.name!));
  return { people: [...named, ...follows.filter((f) => !f.name)], report };
}

// Where people write (their NIP-65 list), as looked up for their posts while Erevos runs: the next
// page of posts asks the same relays without looking again. Never kept.
const writesKnown = new Map<string, string[]>();

/**
 * The public posts of `key`, newest first, POSTS_AT_ONCE at most, before `before` (seconds) when
 * given: looked up now on the relays used for look-ups, on those their chat was given, and on those
 * their relay list (NIP-65) says they write on, as the space's Tor way says, as every look-up goes.
 * Posts are public, so asking for them tells a relay only that someone reads them; nothing of them
 * is kept. With them, whether any relay answered, and whether there may be older ones.
 */
export async function nostrDmPosts(key: string, before?: number): Promise<{ posts: NostrPost[]; answered: boolean; older: boolean }> {
  const it = need();
  const hints = (it.state.chats[key]?.hints ?? []).slice(0, 3);
  const where = [...new Set([...LOOKUP_RELAYS, ...hints].map((url) => url.replace(/\/+$/, '')))];
  const filter = { kinds: [1, 6], authors: [key], limit: POSTS_AT_ONCE, ...(before ? { until: before } : {}) };
  const known = writesKnown.get(key);
  const first = await lookUpEach(it, where, known ? [filter] : [filter, { kinds: [10002], authors: [key] }]);
  const writes = known ?? (await writesOf(key, first.events));
  // A list not found now is looked for again with the next page.
  if (!known && writes.length) writesKnown.set(key, writes);
  const more = writes.filter((url) => !where.includes(url));
  const second = more.length ? await lookUpEach(it, more, [filter]) : { events: [], relays: [] };
  const posts = await postsOf(key, [...first.events, ...second.events]);
  const answered = [...first.relays, ...second.relays].some((relay) => relay.how === 'all');
  return { posts, answered, older: posts.length >= POSTS_AT_ONCE };
}

// The feed of the Public tab on home (components/public-feed.tsx, lib/nostr-feed.ts): whom the
// space's key follows, where they write (their NIP-65 lists) and the names of those its pages
// showed, as looked up while it shows, for its next pages; forgotten as it goes from the screen
// (nostrDmFeedDone) or the space closes, and never kept. The space's key only: home never shows a
// hidden place's.
type FeedKnown = {
  of: Live;
  me: string;
  follows: string[];
  /** Where the relay lists and names of the people followed are asked: those of GATHERERS that
   *  answered the follow list's look-up, or, when none did, every relay that answered it. */
  listing: string[];
  writes: Map<string, string[]>;
  /** The names they gave themselves, null for one who gave none. */
  names: Map<string, string | null>;
};
let feedKnown: FeedKnown | null = null;
// Which showing of the feed a look-up is for: one that ends after the feed went keeps nothing.
let feedShowing = 0;
// How long the newest page may go on looking up where people write and their names, from when it
// began: through Tor, with some twenty relays, each step can take long, and the screen says
// Looking… until the page comes. A look-up not begun by then is let be: their posts are asked of
// the fixed relays, and their names wait for the next page.
const FEED_LOOK_MOST = 120_000;

/** Relays that gather everyone's relay lists and profiles: a list or a name is asked there, once,
 *  rather than of every relay. */
const GATHERERS = ['wss://purplepag.es', 'wss://user.kindpag.es', 'wss://indexer.coracle.social'];

/** A page of the feed, as nostrDmFeed answers. */
export type NostrFeedPage = {
  posts: FeedPost[];
  /** Until when (seconds) the next page is asked. */
  until: number;
  /** There may be older posts. */
  older: boolean;
  /** Whether a relay answered: for the posts, or for the follow list when it names no one. */
  answered: boolean;
  /** How many people the key follows. */
  follows: number;
  /** The names of the people on the page, by key: given here, or as they call themselves. */
  names: Record<string, string>;
  /** When the key follows no one: how the look-up of its follow list went. */
  report?: NostrFollowsReport;
  /** How many posts and shares the relays sent for this page, shown or not. */
  came: number;
  /** How each relay asked for the posts answered. */
  relays: NostrFollowsReport['relays'];
};

/**
 * What the relay at `url` sends of the posts and shares of `authors`, until `until` (seconds) when
 * given: an ask for each NAMES_AT_ONCE of them, LOOKUPS_AT_ONCE at once, on a connection that only
 * looks up. An ask cut short counts as full: what it did not send may be older. With them, whether
 * the relay answered.
 */
async function askFeed(it: Live, url: string, authors: string[], until?: number): Promise<{ answers: FeedAnswer[]; answered: boolean; report: NostrFollowsReport['relays'][number] }> {
  let relay: NostrRelay;
  try {
    relay = await reach(it, url);
  } catch (error) {
    return { answers: [], answered: false, report: { url, how: 'unreached', why: error instanceof Error ? error.message : String(error) } };
  }
  const filters: Record<string, unknown>[] = [];
  for (let i = 0; i < authors.length; i += NAMES_AT_ONCE) {
    filters.push({ kinds: [1, 6, POLL_KIND], authors: authors.slice(i, i + NAMES_AT_ONCE), limit: FEED_AT_ONCE, ...(until !== undefined ? { until } : {}) });
  }
  const answers: FeedAnswer[] = [];
  let answered = false;
  // How it answered: all it keeps for one ask at least, else as its last ask ended.
  let report: NostrFollowsReport['relays'][number] = { url, how: 'late' };
  for (let i = 0; i < filters.length; i += LOOKUPS_AT_ONCE) {
    const got = await Promise.all(filters.slice(i, i + LOOKUPS_AT_ONCE).map((filter) => relay.ask([filter], FOLLOWS_WAIT)));
    for (const one of got) {
      answers.push({ events: one.events, full: one.events.length >= FEED_AT_ONCE || one.how !== 'all' });
      answered ||= one.how === 'all';
      if (report.how !== 'all') report = one.why ? { url, how: one.how, why: one.why } : { url, how: one.how };
    }
  }
  return { answers, answered, report };
}

/**
 * A page of the Nostr tab's feed: the public posts and shares of the people the space's key
 * follows, newest first, FEED_AT_ONCE at most, until `until` (seconds) when given, none of those
 * `shown` (lib/nostr-feed.ts feedPage), with the names of the people it names. The newest page
 * looks up the follow list again (followListOf), and where those not looked up yet write; the posts
 * are asked of the relays for look-ups and those that gather lists, for everyone, and of the relays
 * that reach the most of them where they write (feedRelays), each for those who write there. All
 * of it is public, and goes as the space's Tor way says, on connections that never say whose key
 * asks; nothing of it is kept. Always the space's own key, never a hidden place's.
 */
export async function nostrDmFeed(until?: number, shown: readonly FeedPost[] = []): Promise<NostrFeedPage> {
  const it = live;
  if (!it?.state || it.stopped) throw new Error(t('There are no Nostr chats in this space.'));
  const state = it.state;
  const showing = feedShowing;
  const ends = Date.now() + FEED_LOOK_MOST;
  const kept = feedKnown?.of === it && feedKnown.me === state.public ? feedKnown : null;
  let known = kept;
  if (!known || until === undefined) {
    const { keys, report } = await followListOf(it, state);
    const answering = report.relays.filter((r) => r.how === 'all').map((r) => r.url);
    if (!keys.length) return { posts: [], until: 0, older: false, answered: answering.length > 0, follows: 0, names: {}, report, came: 0, relays: [] };
    const gathering = answering.filter((url) => GATHERERS.includes(url));
    const fresh: FeedKnown = { of: it, me: state.public, follows: keys, listing: gathering.length ? gathering : answering, writes: kept?.writes ?? new Map(), names: kept?.names ?? new Map() };
    // Where those not looked up yet write; one with no list found is asked of the fixed relays only.
    const unknown = keys.filter((key) => !fresh.writes.has(key));
    if (unknown.length) {
      const found = await lookUpBatched(it, fresh.listing, unknown, (batch) => ({ kinds: [10002], authors: batch }), ends);
      const lists = byAuthor(found, 10002);
      for (const key of found.answered) fresh.writes.set(key, await writesOf(key, lists.get(key) ?? []));
    }
    known = fresh;
    if (showing === feedShowing) feedKnown = fresh;
  }
  const plan = feedRelays(known.follows, known.writes, [...LOOKUP_RELAYS, ...FOLLOWS_RELAYS]);
  const asked = await Promise.all(plan.map(({ url, authors }) => askFeed(it, url, authors, until)));
  const page = await feedPage(
    new Set(known.follows),
    asked.flatMap((one) => one.answers),
    shown,
    until,
  );
  // The names of those on the page not looked up yet; a name given here comes first, as in their chat.
  const people = feedPeople(page.posts);
  const unnamed = people.filter((key) => key !== state.public && !known.names.has(key));
  if (unnamed.length && known.listing.length) {
    const found = await lookUpBatched(it, known.listing, unnamed, (batch) => ({ kinds: [0], authors: batch }), ends);
    const profiles = byAuthor(found, 0);
    for (const key of found.answered) known.names.set(key, (await nameIn(key, profiles.get(key) ?? [])) ?? null);
  }
  const names: Record<string, string> = {};
  for (const key of people) {
    const name = key === state.public ? t('You') : (!state.chats[key]?.members && state.chats[key]?.name) || known.names.get(key) || state.people[key]?.name;
    if (name) names[key] = name;
  }
  const came = asked.reduce((sum, one) => sum + one.answers.reduce((n, answer) => n + answer.events.length, 0), 0);
  return { posts: page.posts, until: page.until, older: page.older, answered: asked.some((one) => one.answered), follows: known.follows.length, names, came, relays: asked.map((one) => one.report) };
}

/** Forgets what the feed found, as it goes from the screen: its next showing looks all up again. */
export function nostrDmFeedDone(): void {
  feedShowing += 1;
  feedKnown = null;
}

// What the public feed (components/public-feed.tsx) does with a post besides reading it, as other
// Nostr apps do: answer it, share it again (NIP-18), like it (NIP-25), write a post of one's own,
// with photos, and take one's own back (NIP-09). These are public and signed with the space's
// key: anyone may read them, and they say they are of this key. They go to the relays the key
// writes on (its NIP-65 list), or to PUBLIC_RELAYS when it names none, and to the relays the post's
// writer writes on, a few, so that they see it; as the space's Tor way says. Always the space's
// own key, never a hidden place's.

/** Where a post goes when the key names no relays it writes on: widely read ones that take any. */
export const PUBLIC_RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net'];
/** How many relays of a post's writer a post about it goes to besides ours. */
const THEIRS_MOST = 3;
/** The most people an answer names (p tags): those of the post answered, and its writer. */
const NAMED_MOST = 20;

// What this space's key did with posts while Erevos runs, to show it, never kept: liked (with the
// like's id, to take it back) and shared again, by post.
const doneWith = { liked: new Map<string, string>(), shared: new Set<string>() };

/** Whether the space's key liked, or shared again, this post while Erevos runs. */
export function nostrDmDoneWith(note: string): { liked: boolean; shared: boolean } {
  return { liked: doneWith.liked.has(note), shared: doneWith.shared.has(note) };
}

function spaceLive(): Live & { state: NostrDmState } {
  const it = live;
  if (!it?.state || it.stopped) throw new Error(t('There are no Nostr chats in this space.'));
  return it as Live & { state: NostrDmState };
}

// The relays a key writes on: as found for the feed or its posts, or looked up now.
async function writesFor(it: Live, key: string): Promise<string[]> {
  const known = (feedKnown?.of === it ? feedKnown.writes.get(key) : undefined) ?? writesKnown.get(key);
  if (known) return known;
  const found = await lookUp(it, [...LOOKUP_RELAYS, ...FOLLOWS_RELAYS.slice(0, 2)], [{ kinds: [10002], authors: [key] }]).catch(() => [] as NostrEvent[]);
  const writes = await writesOf(key, found);
  if (writes.length) writesKnown.set(key, writes);
  return writes;
}

/**
 * Signs a public event with the space's key and sends it to where its posts go, to a few of the
 * relays `about` (the writer of the post it is about) writes on, and to `also` (a poll's). Answers
 * it; throws when no relay took it.
 */
async function postPublic(kind: number, tags: string[][], content: string, about?: string, also: string[] = []): Promise<NostrEvent> {
  const it = spaceLive();
  const state = it.state;
  const ours = await writesFor(it, state.public);
  const theirs = about && about !== state.public ? (await writesFor(it, about)).slice(0, THEIRS_MOST) : [];
  const where = [...new Set([...(ours.length ? ours : PUBLIC_RELAYS), ...theirs, ...also].map((url) => url.replace(/\/+$/, '')))];
  const event = await signed(state, kind, tags, content);
  const took = await publish(it, where, event);
  if (!took) throw new Error(t('No Nostr relay took it. Try again in a while.'));
  return event;
}

/** A photo to put in a public post: its bytes, as lib/pick-photo.ts made them (its metadata taken out). */
export type PublicPhoto = { bytes: Uint8Array; mime: string; w?: number; h?: number };

/** The tags of a post answering `to` (NIP-10): the thread's first post, the one answered, and the people in it. */
export function answerTags(to: NostrEvent, me: string): string[][] {
  const root = to.tags.find((tag) => tag[0] === 'e' && tag[3] === 'root' && /^[0-9a-f]{64}$/.test(tag[1] ?? ''))?.[1];
  const tags: string[][] = root && root !== to.id ? [['e', root, '', 'root'], ['e', to.id, '', 'reply']] : [['e', to.id, '', 'root']];
  const people = [to.pubkey, ...to.tags.filter((tag) => tag[0] === 'p' && /^[0-9a-f]{64}$/.test(tag[1] ?? '')).map((tag) => tag[1])];
  for (const key of [...new Set(people)].filter((key) => key !== me).slice(0, NAMED_MOST)) tags.push(['p', key]);
  return tags;
}

/**
 * Writes a public post (kind 1) with `text` and, put on the space's file server unencrypted as a
 * public post's are (BUD-02), `photos`, their addresses at its end with imeta tags (NIP-92); as an
 * answer to `to` when given. Answers the post.
 */
export async function nostrDmWritePost(text: string, photos: PublicPhoto[] = [], to?: NostrEvent): Promise<NostrEvent> {
  const it = spaceLive();
  const words = text.trim();
  const tags = to ? answerTags(to, it.state.public) : [];
  const urls: string[] = [];
  for (const photo of photos) {
    if (photo.bytes.length > NOSTR_FILE_MOST) throw new NostrFileTooLargeError();
    const url = await uploadBlob(it.state.files?.length ? it.state.files : FILE_SERVERS, photo.bytes, (kind, signTags, content) => signedOnce(kind, signTags, content), Date.now(), accountHttp(choiceOf(it.state)));
    urls.push(url);
    tags.push(['imeta', `url ${url}`, `m ${photo.mime}`, ...(photo.w && photo.h ? [`dim ${photo.w}x${photo.h}`] : []), `x ${toHex(sha256Bytes(photo.bytes))}`]);
  }
  const content = [words, ...urls].filter(Boolean).join('\n');
  if (!content) throw new Error(t('Write something first.'));
  return postPublic(1, tags, content, to?.pubkey);
}

/** Likes a post (NIP-25, "+"). */
export async function nostrDmLike(post: NostrEvent): Promise<void> {
  await nostrDmReactPost(post, '👍');
}

/** Takes back the space's like of a post (NIP-09): the relays that keep it are asked to drop it. */
export async function nostrDmUnlike(post: NostrEvent): Promise<void> {
  const id = doneWith.liked.get(post.id);
  if (id) await nostrDmTakeBackReactions(post, [id]);
}

/** Reacts to a post (NIP-25) with `sign`: an emoji, or a custom one (its :shortcode:) whose picture is at `url` (NIP-30). Answers the reaction. */
export async function nostrDmReactPost(post: NostrEvent, sign: string, url?: string): Promise<NostrEvent> {
  const made = await postPublic(7, [['e', post.id], ['p', post.pubkey], ['k', String(post.kind)], ...emojiTag(sign, url)], reactionContent(sign), post.pubkey);
  if (sign !== '👎') doneWith.liked.set(post.id, made.id);
  told();
  return made;
}

/** Takes back these reactions of the space's key to a post, by id (NIP-09, kind 5 naming kind 7). */
export async function nostrDmTakeBackReactions(post: NostrEvent, ids: string[]): Promise<void> {
  if (!ids.length) return;
  await postPublic(5, [...ids.map((id) => ['e', id]), ['k', '7']], '', post.pubkey);
  if (ids.includes(doneWith.liked.get(post.id) ?? '')) doneWith.liked.delete(post.id);
  told();
}

/** Shares a post again (NIP-18): a post with kind 6, anything else (a poll) with kind 16, the event in it. */
export async function nostrDmRepost(post: NostrEvent): Promise<void> {
  const generic = post.kind !== 1;
  await postPublic(generic ? 16 : 6, [['e', post.id, ''], ['p', post.pubkey], ...(generic ? [['k', String(post.kind)]] : [])], JSON.stringify(post), post.pubkey);
  doneWith.shared.add(post.id);
  told();
}

/** Asks the relays to take back a post of the space's key (NIP-09): those that keep it then drop it. */
export async function nostrDmTakeBack(post: NostrEvent): Promise<void> {
  const it = spaceLive();
  if (post.pubkey !== it.state.public) return;
  await postPublic(5, [['e', post.id], ['k', String(post.kind)]], '');
}

/** What is said under a post, as its screen shows it (app/public-post.tsx). */
export type PostTalk = {
  /** The answers to it, oldest first, checked, as posts of the feed show. */
  answers: FeedPost[];
  likes: number;
  shares: number;
  /** The reactions, each sign once, the most chosen first (lib/nostr-feed.ts tallyReactions). */
  reactions: PostReaction[];
  names: Record<string, string>;
  answered: boolean;
};

/** The most answers a post's screen shows. */
const ANSWERS_MOST = 200;

/**
 * The answers to a post (kind 1 naming it, NIP-10), and how many liked it and shared it again,
 * looked up now on the relays used for look-ups and those its writer writes on, with the names of
 * those who answered. Public, and never kept.
 */
export async function nostrDmPostTalk(post: NostrEvent): Promise<PostTalk> {
  const it = spaceLive();
  const state = it.state;
  const where = [...new Set([...LOOKUP_RELAYS.filter((url) => !GATHERERS.includes(url)), ...(await writesFor(it, post.pubkey)).slice(0, THEIRS_MOST)].map((url) => url.replace(/\/+$/, '')))];
  const found = await lookUpEach(it, where, [{ kinds: [1], '#e': [post.id], limit: ANSWERS_MOST }, { kinds: [6, 7], '#e': [post.id], limit: 500 }]);
  const seen = new Set<string>();
  const answers: FeedPost[] = [];
  const likers = new Set<string>();
  const sharers = new Set<string>();
  const reacted: NostrEvent[] = [];
  let liked = '';
  const latest = seconds() + 600;
  for (const event of found.events.sort((a, b) => a.created_at - b.created_at)) {
    if (seen.has(event.id) || event.created_at > latest || !event.tags.some((tag) => tag[0] === 'e' && tag[1] === post.id)) continue;
    if (!(await verified(event))) continue;
    seen.add(event.id);
    if (event.kind === 7) {
      reacted.push(event);
      if (reactionOf(event.content) === '👎') continue;
      likers.add(event.pubkey);
      if (event.pubkey === state.public) liked = event.id;
    } else if (event.kind === 6) sharers.add(event.pubkey);
    else if (answers.length < ANSWERS_MOST) answers.push({ id: event.id, note: event.id, by: event.pubkey, at: event.created_at * 1000, ...postParts(event), event });
  }
  if (liked) doneWith.liked.set(post.id, liked);
  if (sharers.has(state.public)) doneWith.shared.add(post.id);
  const people = [...new Set(answers.map((answer) => answer.by))];
  const names: Record<string, string> = {};
  const unnamed = people.filter((key) => key !== state.public && !(feedKnown?.names.has(key)));
  const profiles = unnamed.length ? byAuthor(await lookUpBatched(it, GATHERERS, unnamed, (batch) => ({ kinds: [0], authors: batch }), Date.now() + 30_000), 0) : new Map<string, NostrEvent[]>();
  for (const key of people) {
    const name = key === state.public ? t('You') : (!state.chats[key]?.members && state.chats[key]?.name) || feedKnown?.names.get(key) || (await nameIn(key, profiles.get(key) ?? [])) || state.people[key]?.name;
    if (name) names[key] = name;
  }
  return { answers, likes: likers.size, shares: sharers.size, reactions: tallyReactions(reacted, state.public), names, answered: found.relays.some((relay) => relay.how === 'all') };
}

/**
 * Writes a poll (kind 1068, NIP-88, lib/nostr-polls.ts): `question` as its words, `options`, one
 * or more choices, open until `endsAt` (seconds). Its votes are to go to the relays the space's
 * posts go to. Answers the poll.
 */
export async function nostrDmWritePoll(question: string, options: string[], multiple: boolean, endsAt: number): Promise<NostrEvent> {
  const it = spaceLive();
  const words = question.trim();
  const named = options.map((o) => o.trim()).filter(Boolean);
  if (!words || named.length < 2) throw new Error(t('Write something first.'));
  const ours = await writesFor(it, it.state.public);
  const relays = (ours.length ? ours : PUBLIC_RELAYS).slice(0, POLL_RELAYS_MOST);
  return postPublic(POLL_KIND, pollTags(named, multiple, endsAt, relays), words);
}

// The relays a poll's votes are sent to and asked of: those it names, else where its writer writes.
async function pollRelays(it: Live, poll: NostrEvent): Promise<string[]> {
  const named = pollOf(poll)?.relays ?? [];
  return named.length ? named : (await writesFor(it, poll.pubkey)).slice(0, POLL_RELAYS_MOST);
}

/** Votes on a poll (kind 1018) for the options `chosen`, by id: to the relays it names, and where the space's posts go. A later vote takes the place of one before. */
export async function nostrDmVote(poll: NostrEvent, chosen: string[]): Promise<void> {
  const it = spaceLive();
  const read = pollOf(poll);
  if (!read) return;
  if (!pollOpen(read)) throw new Error(t('This poll has ended.'));
  const tags = voteTags(poll.id, read, chosen);
  if (!tags) return;
  await postPublic(VOTE_KIND, tags, '', poll.pubkey, await pollRelays(it, poll));
}

/** How a poll stands, as its relays and those for look-ups have its votes now (lib/nostr-polls.ts pollCount), and whether any answered. */
export async function nostrDmPollCount(poll: NostrEvent): Promise<PollCount & { answered: boolean }> {
  const it = spaceLive();
  const read = pollOf(poll);
  if (!read) return { counts: [], voters: 0, mine: [], answered: false };
  const where = [...new Set([...(await pollRelays(it, poll)), ...LOOKUP_RELAYS.filter((url) => !GATHERERS.includes(url))])];
  const found = await lookUpEach(it, where, [{ kinds: [VOTE_KIND], '#e': [poll.id], limit: 1000, ...(read.endsAt ? { until: read.endsAt } : {}) }]);
  const count = await pollCount(poll.id, read, found.events, it.state.public, verified);
  return { ...count, answered: found.relays.some((relay) => relay.how === 'all') };
}

/** Looks up the name and inbox of `key` again when it is a week old or never was. */
export function nostrDmFreshen(key: string): void {
  const it = acting();
  if (!it?.state) return;
  const at = it.state.people[key]?.at ?? 0;
  if (at > seconds() - 7 * 24 * 3600) return;
  void lookUpPerson(it as Live & { state: NostrDmState }, key).catch(() => undefined);
}

/**
 * Sends a message of `kind` to the chat `key`: to the relays each of its readers reads on, a wrap
 * for each, and a copy to the space's own. `shown` makes the message as the chat shows it, from its
 * id and time; `changed` changes the chat as it goes (a reaction), given its id. It went once one
 * relay of one reader took it. A text or a file disappears `lasts` seconds after it went, or as
 * the chat's timer says (NIP-40, lib/nostr-rules.ts). Answers its id.
 */
async function sendTo(
  it: Live & { state: NostrDmState },
  key: string,
  kind: number,
  tags: string[][],
  content: string,
  shown?: (id: string, at: number) => NostrDmMessage,
  changed?: (id: string) => void,
  lasts = 0,
): Promise<string> {
  const state = it.state;
  const readers = readersOf(state, key);
  // A chat sent through Tor by itself: all it sends and looks up, on its own connections.
  const via = torWayOf(state, key);
  const where = await Promise.all(readers.map(async (reader) => [reader, await relaysOf(it, reader, via)] as const));
  const reachable = where.filter(([, relays]) => relays?.length) as (readonly [string, string[]])[];
  if (readers.length && !reachable.length) {
    throw new Error(
      readers.length === 1
        ? t('Their Nostr app does not say where it takes private messages (NIP-17), so they cannot get one yet.')
        : t('None of their Nostr apps says where it takes private messages (NIP-17), so they cannot get one yet.'),
    );
  }
  const now = Date.now();
  const going = kind === 14 || kind === 15 ? lasts || timerOf(state.chats[key]) : 0;
  const expires = going > 0 ? seconds(now) + going : 0;
  const made = await wrapMessage(state, key, kind, tags, content, now, expires);
  const ours = made.wraps[state.public];
  const message = shown?.(made.id, made.at);
  await changeAccount(it, async () => {
    if (message) addMessage(state, key, message);
    if (message && expires) goesAtIn(chatOf(state, key), made.id, expires * 1000);
    changed?.(made.id);
    state.seen.push(ours.id);
  });
  // Our own copy, for the space's other apps with this key (in notes to oneself, the message
  // itself); then each reader's, which say whether it went.
  const tookOurs = publish(it, state.inbox, ours, via);
  const took = readers.length ? (await Promise.all(reachable.map(([reader, relays]) => publish(it, relays, made.wraps[reader], via)))).filter((n) => n > 0).length : await tookOurs;
  const chat = state.chats[key];
  const told = made.subject !== undefined && took > 0 && (chat?.subject ?? '') === made.subject;
  if (message || told) {
    await changeAccount(it, async () => {
      if (message) message.state = took > 0 ? 'sent' : 'failed';
      // The name went: the next messages need not carry it.
      if (told) delete chat.subjectOwed;
    });
  }
  if (!took) throw new Error(t('None of their relays took the message. Try again later.'));
  return made.id;
}

/** Sends `text` to `key`, answering the message `replyTo` when given: to the relays they read on,
 *  and a copy to the space's own. With `lasts`, it disappears that many seconds after it went (NIP-40);
 *  without, as the chat's timer says. Answers its id. */
export async function nostrDmSend(key: string, text: string, replyTo?: string, lasts = 0): Promise<string> {
  return sendText(need(), key, text, replyTo, lasts);
}

// Sends words from the account `it`: the screen's, or one that runs unseen, as a message held for later goes.
async function sendText(it: Live & { state: NostrDmState }, key: string, text: string, replyTo?: string, lasts = 0): Promise<string> {
  const answers = replyTo ? { replyTo } : {};
  return sendTo(it, key, 14, replyTo ? [['e', replyTo, '', 'reply']] : [], text, (id, at) => ({ id, mine: true, text, at, state: 'sending', ...answers }), undefined, lasts);
}

// An account's drafts and messages held for later (lib/chat-writing.ts), changed in turn with the
// rest of it, telling of nothing. A message held goes as typed then, answering what is still here.
function writingOf(it: Live): WritingAccount {
  return {
    now: () => checkedWriting(it.state?.writing),
    change: (use) =>
      changeAccount(
        it,
        async () => {
          if (it.state) it.state.writing = use(checkedWriting(it.state.writing));
        },
        true,
      ),
    keep: async () => {
      if (it.state) await saveNostrDm(it.space, it.key, it.state, it.holder);
    },
    ready: () => !it.stopped && !!it.state,
    has: (chat) => !!it.state?.chats[chat],
    send: async (held) => {
      if (!it.state) throw new Error(t('There are no Nostr chats in this space.'));
      const live = it as Live & { state: NostrDmState };
      const messages = () => live.state.chats[held.chat]?.messages;
      const replyTo = held.replyTo && messages()?.some((m) => m.id === held.replyTo && m.state !== 'failed') ? held.replyTo : undefined;
      await sentOrShown(messages, (m) => m.mine && m.state === 'failed', () => sendText(live, held.chat, held.text, replyTo));
    },
  };
}

/** The drafts and messages held of the open space's account, or of the open hidden place's own; null with none. */
export function nostrDmWriting(where: NetworkWhere = 'space'): WritingAccount | null {
  const it = where === 'place' ? places.shown() : live;
  return it && !it.stopped && it.state ? writingOf(it) : null;
}

/** Those of every account that runs: the space's, and its hidden places' (lib/chat-later.ts). */
export function nostrDmWritings(): WritingAccount[] {
  return [live, ...places.all()].filter((it): it is Live => !!it && !it.stopped && !!it.state).map(writingOf);
}

/** A photo, file or voice message as picked, to send; a voice message says how long it lasts. */
export type NostrOutgoingFile = { bytes: Uint8Array; name: string; mime: string; dim?: string; durationMs?: number };

/** The file is larger than a file server takes. */
export class NostrFileTooLargeError extends Error {
  constructor() {
    super(t('Files up to {size} MB go in Nostr chats.', { size: String(NOSTR_FILE_MOST / (1024 * 1024)) }));
  }
}

/** Sends a photo or file: encrypted here, put on the space's file server, and its key in the message
 *  (kind 15), answering the message `replyTo` when given, as a text does. */
export async function nostrDmSendFile(key: string, picked: NostrOutgoingFile, replyTo?: string): Promise<void> {
  await sendPicked(need(), key, picked, replyTo);
}

// Sends a photo or file as nostrDmSendFile says; answers its id.
async function sendPicked(it: Live & { state: NostrDmState }, key: string, picked: NostrOutgoingFile, replyTo?: string): Promise<string> {
  if (picked.bytes.length > NOSTR_FILE_MOST) throw new NostrFileTooLargeError();
  const { sealed, file } = await sealFile(picked.bytes, picked.mime, picked.name, picked.dim, picked.durationMs);
  const via = torWayOf(it.state, key);
  const url = await uploadBlob(it.state.files?.length ? it.state.files : FILE_SERVERS, sealed, (kind, tags, content) => signedOnce(kind, tags, content), Date.now(), via ? chatTorHttp(via) : accountHttp(choiceOf(it.state)));
  return sendFile(it, key, { ...file, url }, replyTo);
}

async function sendFile(it: Live & { state: NostrDmState }, key: string, file: NostrDmFile, replyTo?: string): Promise<string> {
  const answers = replyTo ? { replyTo } : {};
  return sendTo(it, key, 15, [...(replyTo ? [['e', replyTo, '', 'reply']] : []), ...fileTags(file)], file.url, (id, at) => ({ id, mine: true, text: '', at, state: 'sending', file, ...answers }));
}

/** A sticker to send, as a picture: a PNG or JPEG, its width and height, and the words it stands for, if any. */
export type NostrSticker = { bytes: Uint8Array; mime: string; w: number; h: number; label?: string };

/**
 * Sends a sticker to `key`, answering `replyTo` when given. NIP-17 has no stickers, so it goes as
 * a photo does (kind 15), encrypted, with its size, and its words as the file's name: other Nostr
 * apps show it as a photo. Every sticker sent in a Nostr chat goes through here, whatever made its
 * picture (one of the space's own from a photo, lib/own-stickers.ts, or any other drawn to one).
 */
export async function nostrDmSendSticker(key: string, sticker: NostrSticker, replyTo?: string): Promise<void> {
  const end = sticker.mime === 'image/png' ? '.png' : '.jpg';
  const words = [...(sticker.label ?? '')].map((c) => (c < ' ' || '\\/:*?"<>|'.includes(c) ? ' ' : c)).join('').replace(/\s+/g, ' ').trim().slice(0, 60);
  const dim = sticker.w > 0 && sticker.h > 0 ? { dim: `${Math.round(sticker.w)}x${Math.round(sticker.h)}` } : {};
  await nostrDmSendFile(key, { bytes: sticker.bytes, name: `${words || 'sticker'}${end}`, mime: sticker.mime, ...dim }, replyTo);
}

/** The kind a message of a chat went as (k tags, NIP-25 and NIP-09). */
const kindOf = (message: NostrDmMessage) => (message.file ? '15' : '14');

/**
 * Reacts to a message with `emoji`, as NIP-25 says, to everyone in the chat: one of ours before
 * it is taken back (NIP-09) for the apps that show each. A custom emoji goes with the picture it
 * came with (NIP-30), for the other apps to show.
 */
export async function nostrDmReact(key: string, id: string, emoji: string): Promise<void> {
  const it = need();
  const state = it.state;
  const target = state.chats[key]?.messages.find((m) => m.id === id);
  if (!target) return;
  const reaction = reactionOf(emoji);
  if (target.reactions?.[state.public] === reaction) return;
  const before = target.reactionIds?.[state.public];
  const url = target.emoji?.[reaction];
  await sendTo(it, key, 7, [['e', id], ['k', kindOf(target)], ...emojiTag(reaction, url)], reactionContent(reaction), undefined, (made) => putReaction(target, state.public, reaction, made));
  if (before) await sendTo(it, key, 5, [['e', before], ['k', '7']], '', undefined, () => takeBack(state, key, state.public, [before])).catch(() => undefined);
}

/** Takes back the space's reaction to a message (NIP-09, kind 5 in a wrap, as NIP-17 allows): off here at once, and the others' apps that do so take it off too. */
export async function nostrDmUnreact(key: string, id: string): Promise<void> {
  const it = need();
  const state = it.state;
  const target = state.chats[key]?.messages.find((m) => m.id === id);
  const sent = target?.reactionIds?.[state.public];
  if (!target?.reactions?.[state.public]) return;
  // One from before reactions kept their ids goes from here only.
  if (!sent) {
    await changeAccount(it, async () => dropReaction(target, state.public));
    return;
  }
  await changeAccount(it, async () => {
    takeBack(state, key, state.public, [sent]);
  });
  await sendTo(it, key, 5, [['e', sent], ['k', '7']], '');
}

/**
 * Deletes these messages of a chat from this device. With `everyone`, of the space's own that went,
 * the others are asked to delete them too (NIP-09, kind 5 in a wrap, as NIP-17 allows),
 * TAKE_BACK_MOST in each ask: their apps that do so delete them, others keep them. Answers how many
 * of ours were asked for.
 */
export async function nostrDmDelete(key: string, ids: string[], everyone = true): Promise<number> {
  const it = need();
  const state = it.state;
  let removed: NostrDmMessage[] = [];
  await changeAccount(it, async () => {
    removed = removeHere(state, key, ids);
  });
  if (!everyone) return 0;
  // What did not go, and the old private messages (NIP-04), which no wrap can take back, go from here only.
  const ours = removed.filter((m) => m.mine && m.state !== 'failed' && m.state !== 'sending' && !m.old);
  for (let i = 0; i < ours.length; i += TAKE_BACK_MOST) {
    const some = ours.slice(i, i + TAKE_BACK_MOST);
    const kinds = [...new Set(some.map(kindOf))].sort();
    await sendTo(it, key, 5, [...some.map((m) => ['e', m.id]), ...kinds.map((kind) => ['k', kind])], '');
  }
  return ours.length;
}

/** Pins a message of a chat on this device only, or takes its pin off: NIP-17 has no pins, so nothing goes. */
export function nostrDmPin(key: string, id: string, on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => pinHere(it.state, key, id, on));
}

/** Whether a message can be forwarded: it has words, or a file Erevos can open. */
export const canForwardNostr = (message: NostrDmMessage): boolean => (message.file ? typeof message.file === 'object' : !!message.text);

/**
 * Forwards these messages of the chat `from` to the chat `to`, oldest first, each as a new message:
 * its words, or its file fetched and opened here and sent again, encrypted with a key of its own,
 * so nothing ties the copy to the message it came from. NIP-17 has no mark for a copy: each is
 * marked as forwarded here only, kept with the chat. Answers how many went.
 */
export async function nostrDmForward(from: string, ids: string[], to: string): Promise<number> {
  const it = need();
  const chosen = (it.state.chats[from]?.messages ?? []).filter((m) => ids.includes(m.id) && canForwardNostr(m));
  let went = 0;
  for (const message of chosen) {
    const file = message.file;
    let id: string;
    if (typeof file === 'object') {
      const bytes = await nostrDmFile(file, from);
      id = await sendPicked(it, to, { bytes, name: file.name ?? '', mime: file.type, ...(file.dim ? { dim: file.dim } : {}), ...(file.duration ? { durationMs: file.duration } : {}) });
    } else id = await nostrDmSend(to, message.text);
    await changeAccount(it, async () => {
      const copy = it.state.chats[to]?.messages.find((m) => m.id === id);
      if (copy) copy.forwarded = true;
    });
    went += 1;
  }
  return went;
}

/** Whose stickers made from photos the chats of `where` send (lock/sticker-data.ts): the space's, or its open hidden place's; null while it has none. */
export function nostrDmStickerPlace(where: NetworkWhere = 'space'): StickerPlace | null {
  const it = where === 'place' ? places.shown() : live;
  return it && !it.stopped ? { holder: it.holder, space: it.space, key: it.key } : null;
}

/** Sends a message that failed once more, as a new one. */
export async function nostrDmRetry(key: string, id: string): Promise<void> {
  const it = need();
  const chat = it.state.chats[key];
  const failed = chat?.messages.find((m) => m.id === id && m.state === 'failed');
  if (!failed) return;
  await changeAccount(it, async () => {
    chat.messages = chat.messages.filter((m) => m !== failed);
  });
  if (typeof failed.file === 'object') await sendFile(it, key, failed.file, failed.replyTo);
  else await nostrDmSend(key, failed.text, failed.replyTo);
}

/** Makes a group with these people (their keys), named or not: answers its key. Nothing goes until its first message. */
export async function nostrDmNewGroup(members: string[], subject = ''): Promise<string> {
  const it = need();
  let key = '';
  await changeAccount(it, async () => {
    key = newGroup(it.state, members, subject);
  });
  for (const member of members) nostrDmFreshen(member);
  return key;
}

/** Names a group for all its members: the name goes with the next message. */
export function nostrDmSetSubject(key: string, subject: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = it.state.chats[key];
    if (!chat?.members) return;
    chat.subject = subject.trim().slice(0, 100) || undefined;
    chat.subjectAt = seconds();
    chat.subjectOwed = true;
  });
}

/** The Blossom servers photos and files go to; none for Erevos's own list. */
export function nostrDmSetFileServers(servers: string[]): Promise<void> {
  const it = need();
  const list = [...new Set(servers.map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean))];
  const bad = list.find((s) => !/^https:\/\/[^/\s]+$/.test(s));
  if (bad) return Promise.reject(new Error(t('{server} is not a file server address (https://…).', { server: bad })));
  return changeAccount(it, async () => {
    if (list.length) it.state.files = list.slice(0, 5);
    else delete it.state.files;
  });
}

// Files fetched while Erevos runs, so one looked at again is not fetched again (lib/file-cache.ts).
const fetched = fileCache(40 * 1024 * 1024);

/** A message's photo or file, fetched from its server and opened, or kept from before; for the
 *  chat `key` sent through Tor by itself, on its own way. */
export function nostrDmFile(file: NostrDmFile, key?: string): Promise<Uint8Array> {
  const state = acting()?.state;
  const via = key && state ? torWayOf(state, key) : undefined;
  return fetched.get(file.url, async () => openFile(file, await downloadBlob(file.url, false, via ? chatTorHttp(via) : accountHttp(choiceOf(state)))));
}

/** Sends the chat `key` through Tor by itself, on circuits of its own, whatever the space's Tor
 *  way (on), or as the space's way says again (off). What comes follows the account: its inbox is read once for all. */
export function nostrDmSetTor(key: string, on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = chatOf(it.state, key);
    if (on) chat.tor = true;
    else delete chat.tor;
  });
}

/** A chat's own notifications (lock/chat-notify.ts), or the app's again with null. */
export function nostrDmSetNotify(key: string, notify: ChatNotify | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = chatOf(it.state, key);
    if (notify) chat.notify = notify;
    else delete chat.notify;
  });
}

/** A chat's own look (theme/look.ts), or the space's again with null. */
export function nostrDmSetLook(key: string, look: Look | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = chatOf(it.state, key);
    if (look) chat.look = checkedLook(look);
    else delete chat.look;
  });
}

/** A chat's PIN of its own, or its screenshots blocked, on this device only (lib/chat-protect.ts). */
export function nostrDmSetGuard(key: string, change: GuardChange): Promise<void> {
  const it = need();
  return changeAccount(it, async () => changeGuard(chatOf(it.state, key), change));
}

export function nostrDmRead(key: string): Promise<void> {
  const it = need();
  if (!it.state.chats[key]?.unread) return Promise.resolve();
  return changeAccount(it, async () => markRead(it.state, key));
}

export function nostrDmRename(key: string, name: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = chatOf(it.state, key);
    chat.name = name.trim().slice(0, 64) || undefined;
  });
}

export function nostrDmForgetChat(key: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => forgetChat(it.state, key));
}
