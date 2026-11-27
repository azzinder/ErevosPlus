// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { History } from '../lock/history';
import { currentSpace } from '../lock/keys';
import { canRelaySeal, relaySeal } from './core';
import { randomBytes } from './crypto';
import { E2E, fromBase64Url } from './e2e';
import type { Carried } from './nearby';
import { sparesOf, type Spare } from '../lock/e2e-data';
import { fromHex, sameRelay, sendMessage, type Fallback, type Mark, type Relay } from './relay';
import { VoiceAssembler } from './voice';
import { sweepPieces, type PiecePlace } from './nostr-pieces';
import { keepPiecesFile } from '../lock/nostr-pieces-data';
import { t } from './i18n';
import { shownAt, spaceSeenKey } from './last-seen';
import { loadSpaceData, updateSpaceData } from '../lock/space-data';
import { onSettingCame, onSettingNow, settingChanged } from './sync/settings';

// The open space's chats through the relay, opened once while the space is: its account and
// contacts (lib/e2e.ts), the messages it keeps (lock/history.ts), and the voice messages still
// coming in parts. The chat screen, the home screen and the receiver (lib/receiver.ts) use the
// same ones: two copies of a conversation's keys would each move on without the other, and what
// one sealed the contact could no longer open. Hidden chats are not here: the chat screen opens
// them itself, only while they are open.

/** A place's chats: its account and contacts, its messages, its voice messages coming in parts, and where it keeps pieces of photos that come through Nostr (lib/nostr-pieces.ts). */
export type SpaceChats = { e2e: E2E; history: History; voiceParts: VoiceAssembler; pieces?: PiecePlace };

let opened: { of: object; chats: Promise<SpaceChats> } | null = null;
// Whether the open space says when it was last open (SpaceData.lastSeen), once its chats opened.
let lastSeenNow: { of: object; on: boolean } | null = null;
// The same once open, for what must know at once (lib/chat-notices.ts).
let ready: SpaceChats | null = null;
// What joins the space's chats as they open, before anything uses them: the links to the account's
// other devices (lib/devices.ts), which registers itself here so this file need not know it.
const joiners: ((chats: SpaceChats, space: number, key: Uint8Array) => Promise<void>)[] = [];

/** Has `join` called each time the space's chats open, before they are handed out. */
export function joinSpaceChats(join: (chats: SpaceChats, space: number, key: Uint8Array) => Promise<void>): void {
  joiners.push(join);
}

/** The open space's chats, opened the first time they are asked for. */
export function spaceChats(): Promise<SpaceChats> {
  const current = currentSpace();
  if (opened?.of !== current) {
    const chats = (async () => {
      const history = await History.open('space', current.space, current.key);
      const e2e = await E2E.open('space', current.space, current.key);
      // Whether its contacts are told when it was last open, and it is shown theirs (lib/last-seen.ts).
      const data = await loadSpaceData(current.space, current.key).catch(() => null);
      const lastSeen = data?.lastSeen ?? true;
      e2e.setLastSeen({ on: lastSeen, at: () => shownAt(spaceSeenKey(current.space)), tells: data?.tellOpen ?? true });
      lastSeenNow = { of: current, on: lastSeen };
      const pieces: PiecePlace = { holder: 'space', space: current.space, key: current.key };
      // The space's value among the pieces' (lock/nostr-pieces-data.ts), so the file is there
      // whichever place waits for pieces, and what waited too long goes.
      await keepPiecesFile(current.space, current.key).catch(() => undefined);
      void sweepPieces(pieces).catch(() => undefined);
      const chats = { e2e, history, voiceParts: new VoiceAssembler(), pieces };
      // The chats still open without what could not join them.
      for (const join of joiners) await join(chats, current.space, current.key).catch(() => undefined);
      if (opened?.of === current) ready = chats;
      return chats;
    })();
    opened = { of: current, chats };
    ready = null;
    // Tried again the next time they are asked for.
    chats.catch(() => {
      if (opened?.chats === chats) opened = null;
    });
  }
  return opened.chats;
}

/**
 * Turns "last seen" on or off for the open space (SpaceData.lastSeen): kept, and its chats tell
 * and show it, or no longer, from their next message on (lib/last-seen.ts).
 */
export async function setLastSeen(on: boolean): Promise<void> {
  const current = currentSpace();
  await updateSpaceData(current.space, current.key, { lastSeen: on });
  lastSeenNow = { of: current, on };
  // To the account's other devices too, as they share the settings (lib/sync/settings.ts).
  settingChanged('lastSeen', on);
  if (opened?.of === current) {
    const tells = (await loadSpaceData(current.space, current.key).catch(() => null))?.tellOpen ?? true;
    (await opened.chats).e2e.setLastSeen({ on, at: () => shownAt(spaceSeenKey(current.space)), tells });
  }
}

/** Turns "Say when I open Erevos" on or off for the open space (SpaceData.tellOpen): kept, and its chats do so, or no longer. */
export async function setTellOpen(tells: boolean): Promise<void> {
  const current = currentSpace();
  await updateSpaceData(current.space, current.key, { tellOpen: tells });
  if (opened?.of !== current) return;
  const on = (await loadSpaceData(current.space, current.key).catch(() => null))?.lastSeen ?? true;
  (await opened.chats).e2e.setLastSeen({ on, at: () => shownAt(spaceSeenKey(current.space)), tells });
}

/** Whether the open space says when it was last open, once its chats opened; else null. */
export function lastSeenOn(): boolean | null {
  return lastSeenNow && lastSeenNow.of === opened?.of ? lastSeenNow.on : null;
}

/** "Last seen" goes as it is set, and comes as another device of the account set it. Once, at start. */
export function shareLastSeen(): () => void {
  const stopNow = onSettingNow('lastSeen', () => lastSeenOn() ?? undefined);
  const stopCame = onSettingCame('lastSeen', async (value) => {
    if (typeof value !== 'boolean' || lastSeenOn() === null || lastSeenOn() === value) return;
    await setLastSeen(value);
  });
  return () => {
    stopNow();
    stopCame();
  };
}

/** The open space's chats if they are open already, or null. */
export function spaceChatsNow(): SpaceChats | null {
  return ready;
}

/** Lets go of the space's chats when it closes, so nothing of it stays in memory. */
export function forgetSpaceChats(): void {
  opened = null;
  ready = null;
}

/** A relay to send to, with the second relay to go through when one is set, and the space's
 *  backup relay (lib/spare.ts) for when it cannot be reached. Null without an address. */
export function relayFor(url: string, token: string, via: string, viaToken: string, backup?: { url: string; token?: string; tor?: boolean }): Relay | null {
  const address = url.trim();
  if (!address) return null;
  const second = via.trim();
  const through = second && !sameRelay(second, address) ? { url: second, token: viaToken.trim() || undefined } : undefined;
  const spare = backup?.url.trim();
  return {
    url: address,
    token: token.trim() || undefined,
    via: through,
    // A backup relay reached only through Tor stays so (lib/spare.ts, Relay.tor).
    backup: spare && !sameRelay(spare, address) ? { url: spare, token: backup?.token?.trim() || undefined, via: through, ...(backup?.tor ? { tor: true } : {}) } : undefined,
  };
}

// A contact's queue on `where.relay` (ours, `hop`, when it says none), reached from `hop`: straight
// when it is the same relay, otherwise sealed for theirs and handed to ours (or the second relay).
function reach(hop: Relay, where: { relay: string; relayKey: string }, home: string): Relay {
  const relay = where.relay || home;
  // A hop reached only through Tor (Relay.tor) stays so, straight or as the second relay.
  const tor = hop.tor ? { tor: true } : {};
  if (sameRelay(relay, hop.url)) return { url: hop.url, token: hop.token, via: hop.via, ...tor };
  // Our own relay, through the backup: its key is the one it gave this run.
  if (sameRelay(relay, home) && !where.relayKey) return { url: relay, via: hop.via ?? { url: hop.url, token: hop.token, ...tor } };
  if (!where.relayKey) throw new Error(t('That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.', { relay }));
  return { url: relay, key: fromBase64Url(where.relayKey), via: hop.via ?? { url: hop.url, token: hop.token, ...tor } };
}

/**
 * Where to send to a contact: our own relay when they use it too, otherwise their relay, reached
 * through ours (or the second relay) so their relay never sees this phone's address. When that
 * cannot take it, their backup queue, and then the same through our backup relay, if there are.
 */
export function contactTarget(own: Relay, where: { relay: string; relayKey: string; spare?: Spare | null }): Relay {
  const routes: { make: () => Relay; sender?: string }[] = [{ make: () => reach(own, where, own.url) }];
  // Each of their home relays in turn (lib/spare.ts), the first one first.
  const spares = sparesOf(where.spare);
  for (const spare of spares) routes.push({ make: () => reach(own, spare, own.url), sender: spare.sender });
  if (own.backup) {
    const backup = own.backup;
    routes.push({ make: () => reach(backup, where, own.url) });
    for (const spare of spares) routes.push({ make: () => reach(backup, spare, own.url), sender: spare.sender });
  }
  let first: { relay: Relay; sender?: string } | null = null;
  let failed: unknown = null;
  const fallback: Fallback[] = [];
  for (const route of routes) {
    let relay: Relay;
    try {
      relay = route.make();
    } catch (error) {
      failed ??= error;
      continue;
    }
    if (!first) first = { relay, sender: route.sender };
    else fallback.push({ relay, senderId: route.sender ? fromHex(route.sender) : undefined });
  }
  if (!first) throw failed;
  // The first route is the contact's main queue unless it could not be made.
  if (first.sender) throw failed;
  return fallback.length > 0 ? { ...first.relay, fallback } : first.relay;
}

/**
 * What a message sealed for a contact carries, as the relay is told (lib/relay.ts, Mark), by its
 * words and the call signal in it, if any: words someone reads are a message; a call's offer rings,
 * so it pushes, counted as a call and not a message; all else is word between phones.
 */
export function markOf(text: string, call?: { kind: string } | null): Mark {
  if (text) return 'message';
  return call?.kind === 'offer' ? 'ring' : 'quiet';
}

/**
 * When `identity` said it has a ring queue (lib/e2e.ts ringOf, lock/hidden-ring.ts) and `signal` is
 * a call offer, sends one ring to it: `length` random bytes, the size of the sealed offer, marked
 * `ring`. The bytes name nothing and are never opened — the contact's phone drops them when its
 * hidden chats open — but their arrival rings it while those chats are closed. The ring goes to the
 * contact's relay, reached through `own` (or its second relay) as a message does. Does nothing when
 * the signal is not an offer, or the contact said no ring queue. Rejects when the relay did not
 * take it; the caller lets that pass, as the offer itself still went to the message queue.
 */
export async function ringOffer(e2e: E2E, own: Relay, identity: string, signal: { kind: string } | null | undefined, length: number): Promise<void> {
  if (signal?.kind !== 'offer') return;
  const ring = e2e.ringOf(identity);
  if (!ring?.sender) return;
  const to = contactTarget(own, { relay: ring.relay, relayKey: ring.relayKey });
  await sendMessage(to, fromHex(ring.sender), randomBytes(length), 'ring');
}

/**
 * How what was sealed for a contact goes to the relay: as `mark` says, but all quiet when a linked
 * device sealed it for the account's phone (lib/e2e.ts, `through`), as it goes to the account's
 * own queue, on its phone, which says what it carries as it passes it on to the contact. What a
 * device writes to a contact itself, with the phone off too, goes to their queue as `mark` says.
 */
export function sentMark(sealed: { through: boolean }, mark: Mark): Mark {
  return sealed.through ? 'quiet' : mark;
}

// `relay` on a chat's own circuits through Tor (Relay.torChat, lib/tor-chats.ts), and the relay it
// goes through and each it falls back to with it: none of them reached straight.
function onCircuits(relay: Relay, torChat: string): Relay {
  return {
    ...relay,
    torChat,
    ...(relay.via ? { via: onCircuits(relay.via, torChat) } : {}),
    ...(relay.fallback ? { fallback: relay.fallback.map((f) => ({ ...f, relay: onCircuits(f.relay, torChat) })) } : {}),
  };
}

/**
 * Where what was sealed for a contact goes (contactTarget, from `own`): for a chat that goes only
 * through Tor (`torChat`, lib/e2e.ts), on that chat's circuits, each relay on the way, or not at
 * all. So on a linked device too, where it goes to the phone's queue, which every chat shares, and
 * so is not told apart by its sender id as on the phone (lib/tor-chats.ts).
 */
export function sealedTarget(own: Relay, sealed: { relay: string; relayKey: string; spare?: Spare | null; torChat?: string }): Relay {
  const target = contactTarget(own, sealed);
  return sealed.torChat ? onCircuits(target, sealed.torChat) : target;
}

/**
 * Hands a contact's packets to the relay in turn, to where `sealed` says (sealedTarget, from
 * `own`: a chat's that goes only through Tor on its circuits), after the conversation's first
 * packet if the relay has not taken that yet, then `firstSent`. `mark` goes with the last packet
 * only, and the ones before it, the first packet too, are quiet: what comes in parts, as a voice
 * message does, is one message.
 */
export async function sendSealed(
  own: Relay,
  sealed: { sender: string; relay: string; relayKey: string; spare?: Spare | null; first: Uint8Array | null; torChat?: string },
  packets: Uint8Array[],
  mark: Mark,
  firstSent: () => Promise<void>,
): Promise<void> {
  const to = sealedTarget(own, sealed);
  const sender = fromHex(sealed.sender);
  if (sealed.first) {
    await sendMessage(to, sender, sealed.first, 'quiet');
    await firstSent();
  }
  for (const [i, packet] of packets.entries()) await sendMessage(to, sender, packet, i === packets.length - 1 ? mark : 'quiet');
}

/**
 * A contact's packets sealed for their relay, for phones nearby to carry there (lib/nearby.ts):
 * the relay their messages say, or our own (`own`, with its key) when they say none. Empty when
 * that relay's key is not known, they have no relay queue, or the core cannot seal for a relay.
 * `mark` goes with the last, as sendSealed does, and the ones before are quiet: this phone says it
 * as it hands its own over.
 */
export async function carriedFor(
  contact: { sender: string; relay: string; relayKey: string },
  packets: Uint8Array[],
  own: { url: string; key: string },
  mark?: Mark,
): Promise<Carried[]> {
  const url = (contact.relay || own.url).trim();
  const key = contact.relayKey || (url && sameRelay(url, own.url) ? own.key : '');
  if (!contact.sender || !url || !key || !canRelaySeal()) return [];
  const relayKey = fromBase64Url(key);
  const sender = fromHex(contact.sender);
  return Promise.all(
    packets.map(async (packet, i) => ({ url, sealed: await relaySeal(relayKey, sender, packet), ...(mark ? { mark: i === packets.length - 1 ? mark : ('quiet' as const) } : {}) })),
  );
}
