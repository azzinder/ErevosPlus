// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { currentSpace } from '../lock/keys';
import { loadCurrentSpaceData, loadSpaceData, updateSpaceData } from '../lock/space-data';
import { placeChanged } from './receiver';
import { createQueue, onTokenRefused, openPlaceRefusal, relayHome, takeOpenPlace, toHex, tokenTaken, type OpenPlaceRefusal, type Relay } from './relay';
import { ownToken, type OwnToken } from './relay-signin';
import { secureDelete, secureGet, secureSet } from './secure';
import { LPHL_RELAY } from './servers';
import { loadSetupAfter } from './setup-after';

// The server a new phone is on from its first start (#74): with no server of its own yet, its first
// space takes a place on LPHL's open server by itself, typing nothing, as the first start's third
// step says (app/first-steps.tsx): a token of its own there, which only the relay's SHA-256 of it
// knows, and a queue. It is taken once the mode is chosen on that step, never before, so nothing
// leaves the phone until then, and with INVISIBLE only through Tor (lib/relay.ts goes the space's
// Tor way). Wanted from the first start's setup on (wantFirstServer), for its first space, until
// it is taken, or the space has a server some other way (For advanced users, an invite): a start
// with no network, or a server that had no place left, tries again as the space opens next, once
// the first start's steps are done (retryFirstServer), and on the home screen. An invite Erevos was
// first opened with that brings a server of its own takes its place (lib/invite-server.ts).
//
// A free place the server let go, as it does once its phone did not connect for long (crates/
// erevos-relay/src/open.rs), shows as the server ending the channel at its token (lib/relay.ts
// RelayTokenError): it is asked for again at once, with the same token, so every queue, link and
// contact of the space stays as it was, as the server keeps queues for months after (reopenPlace).
// Through Tor, which tells only that the connection closed, the token alone is tried once more
// first, at most once a minute (tokenTaken). Should the server give none now, the home screen says
// why, and it is asked for again as the space opens and with Try again.

/** Why the open server gave no place (lib/relay.ts openPlaceRefusal): it gives none, every place is
 *  taken, today's new places are, or this address had its share today. */
export type OpenRefusal = OpenPlaceRefusal;

/** What the first space's server is, as the first start and the home screen say it. */
export type FirstServer =
  | { kind: 'none' }
  | { kind: 'waiting' }
  | { kind: 'taking' }
  | { kind: 'ready'; url: string; lphl: boolean; open: boolean }
  | { kind: 'refused'; why: OpenRefusal }
  | { kind: 'failed'; error: string };

const WANTED = 'erevos.open-place';
// The least time between two looks at a token the server may have ended a channel at.
const LOOK_EVERY_MS = 60_000;

let state: FirstServer = { kind: 'none' };
let taking: Promise<FirstServer> | null = null;
const listeners = new Set<() => void>();
// The free place of a space the server no longer takes, by the space and its token, until it is
// given again: in memory only, as the next channel ended at it says so again.
let lost: { space: number; token: string } | null = null;
let reopening: Promise<FirstServer> | null = null;
let refusing: Promise<void> | null = null;
let lookedAt = 0;

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

function set(next: FirstServer): FirstServer {
  state = next;
  for (const listener of listeners) listener();
  return next;
}

/** The first start's setup chose Erevos's own chats: the space `space` (the first, 0, at the first
 *  start) is to take a place on LPHL's server. */
export async function wantFirstServer(space = 0): Promise<void> {
  await secureSet(WANTED, `lphl:${space}`);
}

/** Whether a place is still wanted for the space `space`, the one open now unless said: none is
 *  for another space. */
export async function firstServerWanted(space?: number): Promise<boolean> {
  if (space === undefined) {
    try {
      space = currentSpace().space;
    } catch {
      return false;
    }
  }
  return (await secureGet(WANTED).catch(() => null)) === `lphl:${space}`;
}

/** No place is wanted any more: the space has a server, or it was set up otherwise. */
export async function firstServerDone(): Promise<void> {
  await secureDelete(WANTED).catch(() => undefined);
}

/** What is known now of the first space's server. */
export function firstServer(): FirstServer {
  return state;
}

/** Says when what is known of the first space's server changes. */
export function onFirstServer(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Whether `url` is LPHL's server. */
export function isLphl(url: string): boolean {
  return url.trim().replace(/\/+$/, '') === LPHL_RELAY;
}

/** Whether the space's server is a free place its server gave by itself (an open place): its token
 *  is the one kept as such. */
export function isOpenPlace(data: { url: string; token: string; ownToken: OwnToken }): boolean {
  const url = data.url.trim();
  if (!url || !data.token.trim() || data.ownToken.open !== true) return false;
  const own = ownToken(url, data.token);
  return data.ownToken.hash === own.hash && data.ownToken.relay.trim().replace(/\/+$/, '') === url.replace(/\/+$/, '');
}

// What the first space's server is once it has one.
function ready(data: { url: string; token: string; ownToken: OwnToken }): FirstServer {
  const url = data.url.trim();
  return { kind: 'ready', url, lphl: isLphl(url), open: isOpenPlace(data) };
}

/**
 * Takes the place, when it is still wanted and the open space has no server yet: a token on LPHL's
 * open server, then a queue with it, both kept in the space at once, and the receiver told. With a
 * server already there, or another one chosen meanwhile, nothing is taken, and none is wanted from
 * then on; a place taken before whose queue was not made yet only gets its queue. A refusal, or a
 * failure such as no network, keeps it wanted, to try again later. One at a time.
 */
export function takeFirstServer(): Promise<FirstServer> {
  // A free place the server let go: asked for again, with the same token.
  if (lostHere()) return reopenPlace();
  taking ??= (async () => {
    try {
      // The space open as it starts: what is taken is kept there, even if another opens meanwhile.
      const { space, key } = currentSpace();
      const data = await loadSpaceData(space, key);
      const url = data.url.trim();
      if (url && (data.ownQueue || !isLphl(url))) {
        if (await firstServerWanted(space)) await firstServerDone();
        return set(ready(data));
      }
      if (!(await firstServerWanted(space))) return set(url ? ready(data) : { kind: 'none' });
      set({ kind: 'taking' });
      let token = url ? data.token.trim() : '';
      if (!token) {
        try {
          ({ token } = await takeOpenPlace(LPHL_RELAY));
        } catch (error) {
          const why = openPlaceRefusal(error);
          return set(why ? { kind: 'refused', why } : { kind: 'failed', error: error instanceof Error ? error.message : String(error) });
        }
        // The token is kept at once: the server has its line now, and a queue made later still finds it.
        await updateSpaceData(space, key, { url: LPHL_RELAY, token, ownToken: { ...ownToken(LPHL_RELAY, token), open: true } });
      }
      try {
        const ids = await createQueue({ url: LPHL_RELAY, token });
        await updateSpaceData(space, key, { ownQueue: { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) } });
      } catch (error) {
        return set({ kind: 'failed', error: error instanceof Error ? error.message : String(error) });
      }
      await firstServerDone();
      placeChanged();
      return set(ready(await loadSpaceData(space, key)));
    } catch (error) {
      return set({ kind: 'failed', error: error instanceof Error ? error.message : String(error) });
    }
  })().finally(() => {
    taking = null;
  });
  return taking;
}

// Whether the free place of the open space is one the server let go, and gave not again yet.
function lostHere(): boolean {
  try {
    return lost !== null && lost.space === currentSpace().space;
  } catch {
    return false;
  }
}

/**
 * Asks the server again for the free place it no longer takes (`lost`), with the same token, so the
 * space's queues, links and contacts stay as they were; nothing when the space has another token or
 * server now. One the server cannot give now says why, as for a first place, and is asked for again
 * as the space opens next and with Try again; one the server had still (it ended the channel as
 * the way failed) is ready as it was. One at a time.
 */
function reopenPlace(): Promise<FirstServer> {
  reopening ??= (async () => {
    try {
      const { space, key } = currentSpace();
      const was = lost;
      if (!was || was.space !== space) return state;
      const data = await loadSpaceData(space, key);
      const url = data.url.trim();
      if (data.token.trim() !== was.token || !isOpenPlace(data)) {
        lost = null;
        return set(url && data.ownQueue ? ready(data) : { kind: 'none' });
      }
      set({ kind: 'taking' });
      try {
        await takeOpenPlace(url, was.token);
      } catch (error) {
        const why = openPlaceRefusal(error);
        // FAILED, as for a line the server has still: the token alone is tried, and taken, it is.
        if (!why && (await tokenTaken({ url, token: was.token }).catch(() => false))) {
          lost = null;
          return set(ready(data));
        }
        return set(why ? { kind: 'refused', why } : { kind: 'failed', error: errorText(error) });
      }
      lost = null;
      placeChanged();
      return set(ready(data));
    } catch (error) {
      return set({ kind: 'failed', error: errorText(error) });
    }
  })().finally(() => {
    reopening = null;
  });
  return reopening;
}

// A channel the server ended at the open space's own token, a free place's there: the place is
// taken as lost, then asked for again; through Tor (not `sure`) only once the token alone, tried
// again, is not taken either, as the way may have failed instead.
async function placeRefused(relay: Relay, sure: boolean): Promise<void> {
  const { space, key } = currentSpace();
  const data = await loadSpaceData(space, key);
  const token = (relay.token ?? '').trim();
  const url = data.url.trim();
  if (!token || token !== data.token.trim() || !url || relayHome(relay.url) !== relayHome(url) || !isOpenPlace(data)) return;
  // Lost already: asked for again as the space opens and with Try again, not at each refusal.
  if (lost?.space === space && lost.token === token) return;
  if (!sure) {
    if (Date.now() - lookedAt < LOOK_EVERY_MS) return;
    lookedAt = Date.now();
    if (await tokenTaken({ url, token })) return;
  }
  lost = { space, token };
  await reopenPlace();
}

/** A channel the server ended at `relay.token`, as lib/relay.ts tells it (onTokenRefused): for the
 *  checks too, as one through Tor (not `sure`). Done once what follows from it is done. */
export function heardRefusal(relay: Relay, sure: boolean): Promise<void> {
  refusing ??= placeRefused(relay, sure)
    .catch(() => undefined)
    .finally(() => {
      refusing = null;
    });
  return refusing;
}

onTokenRefused((relay, sure) => {
  void heardRefusal(relay, sure);
});

/** As a space opens (app/_layout.tsx): a place still wanted once the first start's steps are done is
 *  taken now. While they are not, the mode step takes it, once the mode is chosen. */
export async function retryFirstServer(): Promise<void> {
  // What was known is of the space open before.
  if (!taking && !reopening) state = { kind: 'none' };
  // A free place the server let go, which it gave not again yet: asked for once more.
  if (lostHere()) {
    await reopenPlace();
    return;
  }
  if (!(await firstServerWanted())) return;
  if (await loadSetupAfter()) return;
  await takeFirstServer();
}

/** What is known now, read again: the space's server, a place wanted and not taken yet, how the
 *  last try went, or none. */
export async function readFirstServer(): Promise<FirstServer> {
  const data = await loadCurrentSpaceData().catch(() => null);
  const url = data?.url.trim() ?? '';
  // A free place the server let go: how asking for it again goes, never ready until it is given.
  if (data && lostHere() && data.token.trim() === lost?.token) return state.kind === 'taking' || state.kind === 'refused' || state.kind === 'failed' ? state : set({ kind: 'taking' });
  if (data && url && data.ownQueue) return set(ready(data));
  if (state.kind === 'taking' || state.kind === 'refused' || state.kind === 'failed') return state;
  if (await firstServerWanted()) return set({ kind: 'waiting' });
  return set(data && url ? ready(data) : { kind: 'none' });
}

/** The open space has no server, and its owner asks for LPHL's (the first home): a place is wanted
 *  for it from now on, and taken now. */
export async function askFirstServer(): Promise<FirstServer> {
  await wantFirstServer(currentSpace().space);
  return takeFirstServer();
}

/** What is known of the first space's server, read once and then as it changes. */
export function useFirstServer(): FirstServer {
  const [now, setNow] = useState(state);
  useEffect(() => {
    const off = onFirstServer(() => setNow(state));
    void readFirstServer().catch(() => undefined);
    return off;
  }, []);
  return now;
}
