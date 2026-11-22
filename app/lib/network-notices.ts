// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { mutedNow, type ChatNotify } from '../lock/chat-notify';

// The open space's chats on other networks (Matrix, XMPP and Nostr: lib/matrix-store.ts,
// lib/xmpp-store.ts, lib/nostr-dm-store.ts) tell of their messages as the space's own chats do.
// Each store says here, after every change, how many messages each of its chats has not read:
// where that went up, messages came; where it went down, they were read, here or on another device
// of the account. lib/background.ts makes the Android notice and its sound of it, lib/desktop.ts
// the computer's notice, and the number on Erevos's icon counts them (lib/unread.ts). A chat is
// known as its home row is (lib/inbox.ts): `matrix:` and its room, `xmpp:` and the address,
// `nostr:` and the person's key. Each has notifications of its own (lock/chat-notify.ts), kept
// with the chat in the account's encrypted value: a muted one tells of nothing, and the icon's
// number leaves it out. Kept apart from React Native, so the checks run in Node.

// And on a linked device, the phone's SMS (lib/sms-mirror.ts): `sms:` and the conversation's address.
// In Erevos+, Messenger, Signal and Session (lib/messenger-store.ts): the service, `:` and the chat's key.
export const NETWORK_PREFIXES = ['matrix:', 'xmpp:', 'nostr:', 'telegram:', 'sms:', 'messenger:', 'signal:', 'session:'] as const;

/** Whether `where` is a chat on another network. */
export const isNetworkChat = (where: string): boolean => NETWORK_PREFIXES.some((prefix) => where.startsWith(prefix));

/** What a network's store says of its chats. */
export type NetworkChats = {
  /** How many messages each chat has not read, those with any, by where. */
  unread(): ReadonlyMap<string, number>;
  /** A chat's own notifications, or null for none. */
  notifyOf(where: string): ChatNotify | null;
};

const networks = new Map<string, NetworkChats>();

// The services hidden on home (lib/service-order.ts): their chats tell of nothing and the icon's
// number leaves them out, as for a muted chat, until the service shows again. Telegram's are told
// by lib/telegram-store.ts, which has its folders shown on home as services of their own.
let hiddenServices: ReadonlySet<string> = new Set();

/** The services hidden on home now, by their keys ('messenger', 'matrix', 'sms' and so on). */
export function setHiddenServices(keys: readonly string[]): void {
  hiddenServices = new Set(keys.filter((key) => key !== 'telegram' && !key.startsWith('tg:')));
}

/** Whether `where` is a chat of a service hidden on home. */
export const inHiddenService = (where: string): boolean => {
  const at = where.indexOf(':');
  return at > 0 && hiddenServices.has(where.slice(0, at));
};

/** A store says how to read its chats, under its `prefix`. */
export function addNetwork(prefix: (typeof NETWORK_PREFIXES)[number], chats: NetworkChats): void {
  networks.set(prefix, chats);
}

const networkOf = (where: string) => networks.get(NETWORK_PREFIXES.find((prefix) => where.startsWith(prefix)) ?? '');

/** The chats on other networks with messages not read, a muted one's aside, by where. */
export function networkUnreadAt(now = Date.now()): Map<string, number> {
  const at = new Map<string, number>();
  for (const chats of networks.values()) {
    try {
      for (const [where, n] of chats.unread()) if (n > 0 && !mutedNow(chats.notifyOf(where), now) && !inHiddenService(where)) at.set(where, n);
    } catch {
      // Its account is not open.
    }
  }
  return at;
}

/** A network chat's own notifications, or null when it has none or is not one. */
export function networkNotify(where: string): ChatNotify | null {
  try {
    return networkOf(where)?.notifyOf(where) ?? null;
  } catch {
    return null;
  }
}

const cameListeners = new Set<(where: string, times: number) => void>();
const readListeners = new Set<(where: string[]) => void>();

/** Calls `listener` as `times` messages come in a network chat. Returns how to stop. */
export function onNetworkMessage(listener: (where: string, times: number) => void): () => void {
  cameListeners.add(listener);
  return () => {
    cameListeners.delete(listener);
  };
}

/** Calls `listener` with the network chats that now have fewer messages not read. Returns how to stop. */
export function onNetworkRead(listener: (where: string[]) => void): () => void {
  readListeners.add(listener);
  return () => {
    readListeners.delete(listener);
  };
}

/** What changed between two counts of messages not read: where more came, and where fewer are. */
export function unreadChange(before: ReadonlyMap<string, number>, after: ReadonlyMap<string, number>): { came: [string, number][]; read: string[] } {
  const came: [string, number][] = [];
  const read: string[] = [];
  for (const [where, n] of after) {
    const was = before.get(where) ?? 0;
    if (n > was) came.push([where, n - was]);
    else if (n < was) read.push(where);
  }
  for (const where of before.keys()) if (!after.has(where)) read.push(where);
  return { came, read };
}

// A hidden place's own accounts (lib/place-networks.ts) tell only their place, and only to
// lib/background.ts, which says "New message" of it with no name, as for the place's other chats;
// a call to one closed rings with no name, as theirs do. A muted chat of theirs tells of nothing,
// as a muted hidden chat does; a sound of its own it has none, which would tell which chat it is.
const placeListeners = new Set<(space: number, pocket: number, where: string, times: number) => void>();
const ringListeners = new Set<(space: number, pocket: number) => void>();

/** Calls `listener` as `times` messages come in the chat `where` of a hidden place's own account, open or receiving while closed. Returns how to stop. */
export function onPlaceNetworkMessage(listener: (space: number, pocket: number, where: string, times: number) => void): () => void {
  placeListeners.add(listener);
  return () => {
    placeListeners.delete(listener);
  };
}

/** Calls `listener` as a call comes to a closed hidden place's own account, to ring it with no name. Returns how to stop. */
export function onPlaceNetworkRing(listener: (space: number, pocket: number) => void): () => void {
  ringListeners.add(listener);
  return () => {
    ringListeners.delete(listener);
  };
}

/** A call came to the own account of the closed hidden place in `pocket` of `space`. */
export function placeNetworkRang(space: number, pocket: number): void {
  ringListeners.forEach((listener) => listener(space, pocket));
}

/**
 * What one store last said its chats had not read. `hear` tells of what changed since; a `quiet`
 * one only takes the count as it is, as when an account is signed in to and fetches what came
 * before. Until the first, nothing is told. A hidden place's (`place`) tells only of what came, and
 * only as that place's, and nothing of a chat that `notifyOf` says is muted.
 */
export function hearing(
  place?: { space: number; pocket: number },
  notifyOf?: (where: string) => ChatNotify | null,
): { hear(now: ReadonlyMap<string, number>, quiet?: boolean): void } {
  let heard: ReadonlyMap<string, number> | null = null;
  return {
    hear(now, quiet = false) {
      const before = heard;
      heard = new Map(now);
      if (!before || quiet) return;
      const { came, read } = unreadChange(before, now);
      if (place) {
        const at = Date.now();
        for (const [where, times] of came) {
          if (mutedNow(notifyOf?.(where), at)) continue;
          placeListeners.forEach((listener) => listener(place.space, place.pocket, where, times));
        }
        return;
      }
      for (const [where, times] of came) if (!inHiddenService(where)) cameListeners.forEach((listener) => listener(where, times));
      if (read.length) readListeners.forEach((listener) => listener(read));
    },
  };
}
