// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useMemo, useState } from 'react';

import { t } from './i18n';
import { matrixInboxRows, nostrInboxRows, shownName, xmppInboxRows, type InboxRow } from './inbox';
import { MATRIX_MOST, MatrixFileTooLargeError } from './matrix-media';
import { matrixNow, onMatrixChange } from './matrix-store';
import type { Module } from './modules';
import { NostrFileTooLargeError, nostrDmNow, onNostrDmChange } from './nostr-dm-store';
import { NOSTR_FILE_MOST } from './nostr-files';
import type { SharedSource } from './share-in';
import { XMPP_FILE_MOST } from './xmpp-files';
import { onXmppChange, xmppNow } from './xmpp-store';
import { chatList, TELEGRAM_MOST } from './telegram';
import { onTelegramChange, telegramAwayChats, telegramLockedChats, telegramNow } from './telegram-store';

// Send to (app/share.tsx) reaches the chats of the space's own Matrix, XMPP, Nostr and Telegram accounts
// too, never a hidden place's. The chat picked opens with the words in its message field, to read
// and send there, as an Erevos chat does; a photo or file is handed to it in memory
// (lib/share-in.ts handShared) and goes as soon as it opens, read whole first, as each of these
// networks sends a file from memory, and only up to the size that network takes (lib/shared-here.ts).

export type Network = 'matrix' | 'xmpp' | 'nostr' | 'telegram';

/** A chat on a network, as Send to lists it: `to` is its row's identity (`matrix:` and the room's id, `xmpp:` and an address, `nostr:` and a key). */
export type NetworkTarget = { key: string; name: string; kind: Network; at: number; to: string; open: string };

/** A photo or file read whole, to send on a network. */
export type NetworkFile = { name: string; mime: string; bytes: Uint8Array; w?: number; h?: number };

/** The largest file a chat on each network sends. */
export const NETWORK_MOST: Record<Network, number> = { matrix: MATRIX_MOST, xmpp: XMPP_FILE_MOST, nostr: NOSTR_FILE_MOST, telegram: TELEGRAM_MOST };

// Read a megabyte at a time.
const PIECE = 1024 * 1024;

/** What a chat on `network` says of a file larger than it sends. */
export function tooLargeFor(network: Network): Error {
  if (network === 'matrix') return new MatrixFileTooLargeError();
  if (network === 'nostr') return new NostrFileTooLargeError();
  if (network === 'telegram') return new Error(t('That file is too large for Telegram.'));
  return new Error(t('Files up to {size} MB go in XMPP chats.', { size: String(Math.floor(XMPP_FILE_MOST / (1024 * 1024))) }));
}

/** The network of a chat Send to hands to (its `to`), or null for an Erevos chat, a group or an SMS conversation. */
export function networkOf(to: string): Network | null {
  const at = to.indexOf(':');
  const network = at > 0 ? to.slice(0, at) : '';
  return network === 'matrix' || network === 'xmpp' || network === 'nostr' || network === 'telegram' ? network : null;
}

/** A row of the home screen's list as Send to offers it: a chat of a network, not one only invited to; null for any other. */
export function networkTarget(row: InboxRow): NetworkTarget | null {
  if (!row.network || row.network === 'telegram' || row.invited || networkOf(row.identity) !== row.network) return null;
  const id = row.identity.slice(row.network.length + 1);
  if (!id) return null;
  const open = row.network === 'matrix' ? `/matrix-chat?room=${encodeURIComponent(id)}` : row.network === 'xmpp' ? `/xmpp-chat?jid=${encodeURIComponent(id)}` : `/nostr-chat?key=${encodeURIComponent(id)}`;
  return { key: row.identity, name: row.name || shownName(row), kind: row.network, at: row.at, to: row.identity, open };
}

/**
 * The space's Telegram chats (the ErevosGram build) as Send to lists them: those of its main list,
 * but for one locked with its PIN or kept in hidden chats, and channels, where most may not write.
 */
export function telegramTargets(): NetworkTarget[] {
  const state = telegramNow('space').state;
  if (!state || state.auth.kind !== 'ready') return [];
  const locked = telegramLockedChats('space');
  const away = telegramAwayChats();
  return chatList(state, 'main')
    .filter((c) => !locked.has(c.id) && !away.has(c.id) && c.type !== 'channel')
    .map((c) => ({ key: `telegram:${c.id}`, name: c.title, kind: 'telegram' as const, at: (c.last?.date ?? 0) * 1000, to: `telegram:${c.id}`, open: `/telegram-chat?id=${c.id}` }));
}

/**
 * Send to's list: those the home screen showed last first (`order`, their identities, as its
 * list was kept), in its order, then the rest by name.
 */
export function inOrder<T extends { key: string; name: string }>(targets: T[], order: string[]): T[] {
  const place = new Map(order.map((key, n) => [key, n] as const));
  const recent = targets.filter((target) => place.has(target.key)).sort((a, b) => (place.get(a.key) ?? 0) - (place.get(b.key) ?? 0));
  const rest = targets.filter((target) => !place.has(target.key)).sort((a, b) => a.name.localeCompare(b.name));
  return [...recent, ...rest];
}

/**
 * Whether a file of `size` bytes can go to a chat on `network`: a photo always may, as it is made
 * smaller before it goes, and the chat says so if it is still too large.
 */
export function fitsNetwork(network: Network, size: number, photo: boolean): boolean {
  return photo || size <= NETWORK_MOST[network];
}

/** The chats of the space's own Matrix, XMPP and Nostr accounts, for those of them `on`, as their accounts load. */
export function useNetworkTargets(on: ReadonlySet<Module>): NetworkTarget[] {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const again = () => setTick((n) => n + 1);
    const stops = [onMatrixChange(again), onXmppChange(again), onNostrDmChange(again), onTelegramChange(again)];
    return () => stops.forEach((stop) => stop());
  }, []);
  const matrix = on.has('matrix');
  const xmpp = on.has('xmpp');
  const nostr = on.has('nostr');
  const telegram = on.has('telegram');
  return useMemo(() => {
    const matrixState = matrix ? matrixNow('space').state : null;
    const xmppState = xmpp ? xmppNow('space').state : null;
    const nostrState = nostr ? nostrDmNow('space').state : null;
    const rows = [...(matrixState ? matrixInboxRows(matrixState) : []), ...(xmppState ? xmppInboxRows(xmppState) : []), ...(nostrState ? nostrInboxRows(nostrState) : [])];
    const found = rows.map(networkTarget).filter((target): target is NetworkTarget => target !== null);
    return telegram ? [...found, ...telegramTargets()] : found;
  }, [tick, matrix, xmpp, nostr, telegram]);
}

/**
 * Reads a photo or file handed to a chat on `network` whole, as share-in.ts readShared gives it (a
 * photo made ready as one picked there is), and closes it; larger than the network takes, an error
 * that says so.
 */
export async function readWhole(network: Network, read: SharedSource): Promise<NetworkFile> {
  try {
    const size = read.source.size;
    if (size > NETWORK_MOST[network]) throw tooLargeFor(network);
    const bytes = new Uint8Array(size);
    for (let at = 0; at < size; ) {
      const piece = await read.source.read(at, Math.min(PIECE, size - at));
      if (piece.length === 0) throw new Error(t('This file is not on this phone.'));
      bytes.set(piece.subarray(0, size - at), at);
      at += piece.length;
    }
    return { name: read.name, mime: read.mime, bytes, ...(read.w && read.h ? { w: read.w, h: read.h } : {}) };
  } finally {
    read.close();
  }
}
