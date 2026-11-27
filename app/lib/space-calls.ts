// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { loadCurrentSpaceData } from '../lock/space-data';
import { soon } from './call';
import { callLineMessage, CONTACT_PREFIX, type CallPlace } from './calls';
import { callRelay, relayKey } from './relay';
import { canRelaySeal } from './core';
import { callHelpers, directNow } from './direct';
import { toBase64Url, type E2E } from './e2e';
import { nearby } from './nearby';
import { nostrReady } from './nostr';
import { nostrOnlyWay } from './nostr-chats';
import { announceReceived } from './receiver';
import { markOf, relayFor, ringOffer, sendSealed, sentMark, spaceChats } from './space-chats';
import type { Message } from '../lock/history';
import { t } from './i18n';

// Calls in the open space's chats (lib/calls.ts): their signals go through the space's own
// encryption, to the contact's phone nearby when it is (lib/nearby.ts), as on the same Wi-Fi with
// no internet, and through the relay as its settings say, read when sent: an offer rings, so it
// pushes, counted as a call, and the rest quiet (lib/relay.ts, Mark); from a linked
// device all of it quiet, as it goes to the account's phone, which marks it as it passes it on
// (lib/space-chats.ts, sentMark). With no relay between the two (none here, or the contact said no
// queue), and Direct connections on (lib/direct.ts), they go through Nostr, as that contact's texts
// do (lib/nostr-chats.ts nostrOnlyWay): the call then goes straight between the two phones, unless
// one of them has a call relay (lib/calls.ts). With it off, such a contact is reached only nearby,
// as before. Their lines are kept in its history. The chat screen, while
// open, shows a line as it comes (onSpaceCallLine); the home screen hears of it as of a message.

const lineListeners = new Set<(message: Message) => void>();

/** Calls `listener` with each call line kept in the space's history. Returns how to stop. */
export function onSpaceCallLine(listener: (message: Message) => void): () => void {
  lineListeners.add(listener);
  return () => {
    lineListeners.delete(listener);
  };
}

// How long a call waits on the relay before going on without it, as on a Wi-Fi with no internet,
// where reaching it can take long to fail, milliseconds.
const RELAY_WAIT = 4000;

// Our relay's key, said with every message so contacts on other relays reach us: asked once.
let ownKey: { url: string; key: string } | null = null;

async function where(own: { url: string; token?: string }) {
  if (ownKey?.url !== own.url && canRelaySeal()) {
    const key = await relayKey(own).catch(() => null);
    if (key) ownKey = { url: own.url, key: toBase64Url(key) };
  }
  return { relay: own.url, relayKey: ownKey?.url === own.url ? ownKey.key : '' };
}

async function settings() {
  const data = await loadCurrentSpaceData();
  const url = data.url.trim();
  if (!url || !data.ownQueue) throw new Error(t('Calls are set up through the server. Type its address in Server first.'));
  const own = { url, token: data.token.trim() || undefined };
  return { own, sends: relayFor(url, data.token, data.via, data.viaToken) ?? own, senderHex: data.ownQueue.senderHex };
}

// Whether a call with a contact may connect directly: Direct connections on, and their chat not set
// to go only through Tor, which a call straight between the phones would undo.
const directWith = (e2e: E2E, identity: string): boolean => directNow() && !e2e.torChat(identity);

export const spaceCalls: CallPlace = {
  async send(identity, signal) {
    const { e2e } = await spaceChats();
    // No relay set: to a phone nearby, or, with Direct connections on, through Nostr.
    const place = await settings().catch(() => null);
    const at = place ? await soon(where(place.own), RELAY_WAIT, { relay: place.own.url, relayKey: '' }) : { relay: '', relayKey: '' };
    const sealed = await e2e.seal(identity, '', place?.senderHex ?? '', { call: signal, at });
    const relay =
      place && sealed.sender
        ? () => sendSealed(place.sends, sealed, [sealed.packet], sentMark(sealed, markOf('', signal)), () => e2e.firstSent(identity))
        : directWith(e2e, identity)
          ? nostrOnlyWay(e2e, identity, sealed, [sealed.packet])
          : null;
    // A hidden contact that rings: wake it too, so it rings while its hidden chats are closed.
    if (place) void ringOffer(e2e, place.sends, identity, signal, sealed.packet.length).catch(() => undefined);
    await e2e.copiesAfter(sealed.copies, nearby.deliver(identity, sealed.first ? [sealed.first, sealed.packet] : [sealed.packet], relay));
  },
  async me() {
    const { e2e } = await spaceChats();
    return e2e.endpoint()?.id ?? '';
  },
  async callRelay() {
    const { own } = await settings();
    return soon(callRelay(own), RELAY_WAIT, null);
  },
  async direct(identity) {
    const { e2e } = await spaceChats();
    if (!directWith(e2e, identity)) return null;
    const groups = callHelpers(await loadCurrentSpaceData());
    // With their phone heard nearby, perhaps on a Wi-Fi with no internet, where no helper answers:
    // only the first are asked, so the call does not wait for a reserve too.
    return nearby.isNear(identity) ? groups.slice(0, 1) : groups;
  },
  async reaches(identity) {
    if (nearby.isNear(identity)) return true;
    const { e2e } = await spaceChats();
    // A linked device's signals go through the account's phone, which knows the way from there.
    if (e2e.endpoint()) return true;
    if (e2e.queueOf(identity)?.sender && (await settings().catch(() => null))) return true;
    return directWith(e2e, identity) && e2e.readsOnNostr(identity) && nostrReady();
  },
  async torChat(identity) {
    const { e2e } = await spaceChats();
    return e2e.torChat(identity);
  },
  line(peer, mine, text) {
    void spaceChats()
      .then(async ({ e2e, history }) => {
        const timer = e2e.contacts().find((contact) => `${CONTACT_PREFIX}${contact.identity}` === peer)?.timer ?? 0;
        const message = callLineMessage(peer, mine, text, timer);
        await history.add(message);
        lineListeners.forEach((listener) => listener(message));
        announceReceived();
      })
      .catch(() => {
        // Not kept: the call still happened.
      });
  },
  name(peer) {
    // Filled in by the call screen from the space's contacts (see spaceCallName).
    return spaceNames.get(peer) ?? t('contact {id}', { id: peer.slice(CONTACT_PREFIX.length, CONTACT_PREFIX.length + 8) });
  },
};

const spaceNames = new Map<string, string>();

/** Learns the names the space's chats give their contacts, for the call screen. */
export async function learnSpaceNames(): Promise<void> {
  const { e2e } = await spaceChats();
  spaceNames.clear();
  for (const contact of e2e.contacts()) if (contact.name) spaceNames.set(`${CONTACT_PREFIX}${contact.identity}`, contact.name);
}
