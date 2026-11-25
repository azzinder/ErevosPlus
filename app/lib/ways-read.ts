// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { currentSpace } from '../lock/keys';
import { loadCurrentSpaceData } from '../lock/space-data';
import { smsPacketsReady, smsReady, smsStatus } from '../modules/erevos-sms';
import { canTor } from './core';
import { nearby } from './nearby';
import { nearbySettings } from './nearby-links';
import { nostrRelays, nostrStates, onNostrStates } from './nostr';
import { canLora, HAS_LINKS, HAS_RADIO, lora, savedRadio } from './radio';
import { onRelayHeard, relayHeard } from './relay';
import { spaceSmsLink } from './sms-relay';
import { spaceChats } from './space-chats';
import { torStatus } from './tor';
import { waysNow, type WayId, type WaysInput } from './ways';

// What the ways out of the open space are now (lib/ways.ts), read from each of them: for the Ways
// screen (app/ways.tsx) and its line on home (app/index.tsx).

// A colour of its own for each way, for a light and a dark look.
export const HUES: Record<WayId, [string, string]> = {
  relay: ['#3D78A8', '#7FB4E0'],
  nostr: ['#7A5BB5', '#B9A0E8'],
  nearby: ['#2F8A63', '#72C7A0'],
  lora: ['#9A7A12', '#D9B85A'],
  sms: ['#B5652A', '#E4A06A'],
  tor: ['#5E6B66', '#A6B3AD'],
};

export const NO_INPUT: WaysInput = { relay: { url: '', answered: 0, failed: 0, spare: '', via: false }, nostr: null, nearby: null, lora: null, sms: null, tor: null };

// What the screen reads now of each way, and how many of the space's own messages wait.
export async function readWays(): Promise<{ input: WaysInput; waiting: number }> {
  const data = await loadCurrentSpaceData();
  const heard = data.url ? relayHeard(data.url) : { answered: 0, failed: 0 };
  const input: WaysInput = { ...NO_INPUT, relay: { url: data.url, ...heard, spare: data.spare.url, via: !!data.via.trim() } };
  // The relays the space reads on now, and those of them that answer.
  const relays = nostrRelays() ?? [];
  const states = nostrStates();
  input.nostr = { on: data.nostr.on && relays.length > 0, relays: relays.length, reading: relays.filter((url) => states.get(url)?.read?.reading).length };
  if (HAS_LINKS) {
    const kept = await nearbySettings();
    input.nearby = { phones: nearby.count(), bluetooth: HAS_RADIO && kept.on, lan: kept.on && kept.lan, direct: HAS_RADIO && kept.on && kept.direct, carried: nearby.carriedCount().others };
  }
  if (canLora()) {
    const radio = await savedRadio().catch(() => null);
    const state = lora.state();
    input.lora = { set: radio !== null, status: state.status, name: state.name || radio?.name || '' };
  }
  if (smsReady() && smsPacketsReady()) {
    const app = !!smsStatus()?.isDefault;
    let contacts = 0;
    if (app) {
      const [link, chats] = await Promise.all([spaceSmsLink(), spaceChats()]);
      contacts = chats.e2e.phones().filter(({ identity, phone }) => !!phone && link.smsWayOn(identity)).length;
    }
    input.sms = { app, contacts };
  }
  if (canTor()) input.tor = { way: data.tor, ready: data.tor === 'off' ? false : !!(await torStatus().catch(() => null))?.ready };
  // Those sent for later wait for their time, not for a way.
  const now = Date.now();
  const waiting = (await spaceChats()).history.waiting().filter((message) => message.at <= now).length;
  return { input, waiting };
}


/** What home shows of the ways: each dot's way and look, and the count waiting. */
const shownKey = ({ input, waiting }: { input: WaysInput; waiting: number }) =>
  `${waysNow(input, waiting).ways.map((way) => `${way.id}:${way.look}`).join(',')}|${waiting}`;

/** Reads of the ways at most this often, however often a way changes. */
const WAYS_GAP_MS = 1000;

type WaysRead = { input: WaysInput; waiting: number };

// The last read of the space open now: home is drawn anew each time the space comes back from its
// password screen, and shows this at once, instead of a relay drawn as off until the first read
// ends. Nothing of it stays as the space closes (forgetWays).
let lastRead: { space: number; read: WaysRead } | null = null;

const spaceNow = (): number | null => {
  try {
    return currentSpace().space;
  } catch {
    return null;
  }
};

/** What was last read of the ways of the space open now, null when nothing was. */
export function knownWays(): WaysRead | null {
  const space = spaceNow();
  return space !== null && lastRead?.space === space ? lastRead.read : null;
}

/** As the space closes. */
export function forgetWays(): void {
  lastRead = null;
}

/**
 * The ways now, read while the screen shows: every `every` ms, and as one of them changes, at
 * most once a second; it changes only when a dot or the count waiting does. Null until they were
 * read once for the space open now.
 */
export function useWays(every: number): WaysRead | null {
  const [read, setRead] = useState<WaysRead | null>(knownWays);
  useFocusEffect(
    useCallback(() => {
      let stopped = false;
      let last = 0;
      let later: ReturnType<typeof setTimeout> | null = null;
      let key = '';
      const read = () => {
        last = Date.now();
        const space = spaceNow();
        readWays()
          .then((next) => {
            // Kept only for the space it was read of, though this screen is gone meanwhile.
            if (space !== null && spaceNow() === space) lastRead = { space, read: next };
            if (stopped) return;
            const nextKey = shownKey(next);
            if (nextKey === key) return;
            key = nextKey;
            setRead(next);
          })
          .catch(() => undefined);
      };
      const look = () => {
        if (stopped || later) return;
        const wait = last + WAYS_GAP_MS - Date.now();
        if (wait <= 0) read();
        else
          later = setTimeout(() => {
            later = null;
            if (!stopped) read();
          }, wait);
      };
      read();
      const timer = setInterval(look, every);
      const stops = [onRelayHeard(look), onNostrStates(look), nearby.onChange(look), lora.onChange(look)];
      return () => {
        stopped = true;
        clearInterval(timer);
        if (later) clearTimeout(later);
        stops.forEach((stop) => stop());
      };
    }, [every]),
  );
  return read;
}
