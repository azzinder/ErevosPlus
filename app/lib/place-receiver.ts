// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { keptPlaces, onKeptChange } from '../lock/hidden-keep';
import { isRingedQueue, loadRinged, moveRingPocket } from '../lock/hidden-ring';
import { loadWatched, wasWatchedQueue, watchPocket } from '../lock/hidden-watch';
import { currentSpace } from '../lock/keys';
import type { QueueKind } from '../lock/queues-data';
import { placeQueues } from '../lock/queues-data';
import { loadHiddenData, updateHiddenData } from '../lock/space-data';
import { offerMissed, offerRingsFor } from './call';
import { callLineMessage, CONTACT_PREFIX } from './calls';
import { canRelaySeal, hasCore } from './core';
import { toBase64Url, type Received } from './e2e';
import { sendCopies } from './fanout';
import { isGroupPacket } from './groups';
import { hiddenRinging, setHiddenRinging } from './hidden-ring';
import { callsOff, CALLS_OFF_LINE } from './modes';
import { nostrKeysChanged, nostrReady, readNostr } from './nostr';
import { nostrReaderOf, sendNostrAgain } from './nostr-chats';
import { forgetPlaceChats, placeChats } from './place-chats';
import { openHeldIn, openPlaceNearby, placeNear } from './place-nearby';
import { placeGroupsAt } from './place-groups';
import { placeMoved, QueueMove, tookOf, type Took } from './queue-move';
import {
  appShown,
  awayPace,
  awayQueues,
  cameBefore,
  endWaits,
  keepWith,
  onAppShown,
  receiveState,
  sendKeys,
  sendPending,
  sendReceipts,
  tell,
  shownPace,
  waitWhileAway,
  type ReceivePlace,
  type ReceiveState,
} from './receiver';
import { joinSleepLooks, lightSleep, lookBegan, lookEnded, type LookPart } from './sleep-look';
import { onNetworkChange } from './network-change';
import { canTryLater, fromHex, isQueueNotFound, onTorWay, receiveMessage, relayKey, type Relay } from './relay';
import { relayFor, type SpaceChats } from './space-chats';
import { hiddenSpare, lookAtSpare, spareBackup, type SpareStore } from './spare';
import { readNearby } from './bridge';
import { sendWaiting } from './waiting';
import { driveShares } from './share-rounds';

// Hidden chats that receive while they are closed (their switch, lock/hidden-keep.ts): while their
// space is open, whatever screen shows, and with Erevos in the background (lib/background.ts), each
// such place's relay queue is looked at as the space's is (lib/receiver.ts), with its own key, chats
// (lib/place-chats.ts), queues and backup relay: what came is kept in its history, its contacts are
// told it came, and the screens hear of it (onPlaceMessage), to say "New message" with no name. A
// call rings as a hidden ring does, with no name (onPlaceRing, lib/hidden-ring.ts), and is held here
// until the PIN opens the place (takePlaceCalls); one not taken in time, or that its caller ended,
// is kept as missed. What comes for it on Nostr (lib/nostr.ts) is read too, as the space's
// receiver reads the space's. While the place's chat screen is open, the screen takes its messages
// itself and holds this (holdPlace). None of it shows anywhere until the PIN opens the place.
// What came from phones nearby and opened in none of the space's chats is tried here too
// (lib/place-nearby.ts), and what was kept so, as the place starts to receive; where its contacts
// were heard is its own (NearHeard), and what it says back goes to them there.

const EVERY = 3000;
// Messages taken in one look, at most.
const BATCH = 50;
// Calls held for their place to open, at most, each place.
const MOST_CALLS = 8;

type Run = {
  space: number;
  pocket: number;
  key: Uint8Array;
  state: ReceiveState;
  spare: SpareStore;
  mover: QueueMove | null;
  timer: ReturnType<typeof setTimeout> | null;
  looking: Promise<unknown>;
  stopped: boolean;
  // Asked to look at once while a look was under way: the next one starts as soon as it ends.
  again: boolean;
  wake: () => void;
  // Its part in the look of the battery mode Sleep (lib/sleep-look.ts), while it runs.
  part: LookPart | null;
  // The place's chats once a look opened them, for what comes on Nostr; reading there while
  // nothing holds the place (how to stop), and what came there, opened in turn.
  chats: SpaceChats | null;
  unlisten: (() => void) | null;
  nostrTurn: Promise<void>;
  // No relay queue at the last look: what is said back goes through Nostr.
  relayless: boolean;
  // Where its contacts were heard nearby, while it receives, and how to stop taking what comes there.
  release: () => void;
};

// A message of a call held for its place to open; an offer that rings, with its timer, and what
// keeps it as missed, with why.
type Held = { received: Extract<Received, { kind: 'message' }>; timer: ReturnType<typeof setTimeout> | null; miss?: (why: string) => void };

const runs = new Map<number, Run>();
const holds = new Map<number, number>();
// The calls that came to each closed place, by pocket, oldest first.
const calls = new Map<number, Held[]>();
let openSpace: number | null = null;
const messageListeners = new Set<(space: number, pocket: number, received: Extract<Received, { kind: 'message' }>) => void>();
const ringListeners = new Set<(space: number, pocket: number) => void>();
const changeListeners = new Set<() => void>();

const sameKey = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, i) => byte === b[i]);

/** Calls `listener` with each message a closed place's look opens, after it is kept. Returns how to stop. */
export function onPlaceMessage(listener: (space: number, pocket: number, received: Extract<Received, { kind: 'message' }>) => void): () => void {
  messageListeners.add(listener);
  return () => {
    messageListeners.delete(listener);
  };
}

/** Calls `listener` each time a call comes to a closed place, to ring it with no name. Returns how to stop. */
export function onPlaceRing(listener: (space: number, pocket: number) => void): () => void {
  ringListeners.add(listener);
  return () => {
    ringListeners.delete(listener);
  };
}

/** Calls `listener` each time the places that receive change. Returns how to stop. */
export function onPlacesChange(listener: () => void): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

/** Whether the hidden chats in `pocket` of the open `space` receive while closed, as last read. */
export function receivesPocket(space: number, pocket: number): boolean {
  return openSpace === space && runs.has(pocket);
}

/** The open space's hidden chats that receive while closed, as last read, with their keys: their own accounts on other networks run too (lib/place-networks.ts). */
export function receivingPlaces(): { space: number; pocket: number; key: Uint8Array }[] {
  return openSpace === null ? [] : [...runs.values()].filter((run) => run.space === openSpace).map(({ space, pocket, key }) => ({ space, pocket, key }));
}

// The space whose receiver started and has not yet read which places receive: until then no one
// knows which pockets tell of what came themselves (lib/hidden-notices.ts waits for it).
let reading: number | null = null;

/** Whether it is known which places of `space` receive while closed: its receiver read them, or none runs. */
export function placesRead(space: number): boolean {
  return reading !== space;
}

/**
 * Stops looking at a place's queue, once a look under way has ended, until the function it gives
 * is called: its chat screen holds it while open, and a chat moved into it while it moves. Let go
 * of by all, a place that does not receive lets go of its chats too.
 */
export async function holdPlace(space: number, pocket: number): Promise<() => void> {
  holds.set(pocket, (holds.get(pocket) ?? 0) + 1);
  const run = openSpace === space ? runs.get(pocket) : undefined;
  if (run) {
    unlisten(run);
    endWaits();
    await Promise.all([run.looking.catch(() => undefined), run.nostrTurn]);
  }
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    const left = (holds.get(pocket) ?? 1) - 1;
    if (left > 0) {
      holds.set(pocket, left);
      return;
    }
    holds.delete(pocket);
    const now = openSpace === space ? runs.get(pocket) : undefined;
    if (now) {
      listen(now);
      now.wake();
    } else forgetPlaceChats(space, pocket);
  };
}

/** The calls that came to a place while it was closed, still ringing, for its chat screen to take as it opens; taking them clears them. */
export function takePlaceCalls(space: number, pocket: number): Extract<Received, { kind: 'message' }>[] {
  if (openSpace !== space) return [];
  const held = calls.get(pocket) ?? [];
  calls.delete(pocket);
  for (const call of held) if (call.timer) clearTimeout(call.timer);
  return held.map((call) => call.received);
}

// INVISIBLE chosen (lib/modes.ts): the calls that ring with no name stop, as none could be answered,
// each kept as missed at once, its line says why.
onTorWay(() => {
  if (!callsOff()) return;
  for (const [pocket, held] of calls) {
    for (const h of held) {
      if (h.timer) clearTimeout(h.timer);
      h.miss?.(CALLS_OFF_LINE);
    }
    const ringing = hiddenRinging();
    if (ringing && ringing.space === openSpace && ringing.pocket === pocket) setHiddenRinging(null);
  }
  calls.clear();
});

/** Looks at the queues of the open space's places that receive (every `every` milliseconds, in the checks), until the function it gives is called. */
export function startPlaceReceiver(every?: number): () => void {
  let open: { space: number; key: Uint8Array };
  try {
    open = currentSpace();
  } catch {
    return () => undefined;
  }
  const { space, key } = open;
  openSpace = space;
  reading = space;
  let stopped = false;
  let following: Promise<void> = Promise.resolve();
  // Which places receive, read again each time a switch changes.
  const follow = () => {
    following = following.then(async () => {
      const found = await keptPlaces(space, key).catch(() => null);
      if (stopped) return;
      // Read, or not to be read: what waits for it waits no longer.
      const first = reading === space;
      if (first) reading = null;
      if (!found) {
        if (first) changeListeners.forEach((listener) => listener());
        return;
      }
      const wanted = new Map(found.map((place) => [place.pocket, place.key]));
      for (const [pocket, run] of runs) {
        const placeKey = wanted.get(pocket);
        if (placeKey && sameKey(placeKey, run.key)) continue;
        stopRun(run);
        runs.delete(pocket);
        if (!holds.get(pocket)) forgetPlaceChats(space, pocket);
      }
      for (const place of found) if (!runs.has(place.pocket)) runs.set(place.pocket, startRun(space, place.pocket, place.key, every));
      changeListeners.forEach((listener) => listener());
    });
  };
  follow();
  const stopKept = onKeptChange(follow);
  // Shown again: each looks at once, not after a wait meant for the background; and as the phone's
  // network changes, its waits ended (lib/receiver.ts).
  const stopShown = onAppShown((shown) => {
    if (shown) runs.forEach((run) => run.wake());
  });
  const stopNetwork = onNetworkChange(() => runs.forEach((run) => run.wake()));
  return () => {
    stopped = true;
    stopKept();
    stopShown();
    stopNetwork();
    for (const run of runs.values()) stopRun(run);
    runs.clear();
    for (const held of calls.values()) for (const call of held) if (call.timer) clearTimeout(call.timer);
    calls.clear();
    if (openSpace === space) openSpace = null;
    if (reading === space) reading = null;
    changeListeners.forEach((listener) => listener());
  };
}

function stopRun(run: Run) {
  run.stopped = true;
  run.part?.leave();
  run.part = null;
  run.release();
  if (run.timer) clearTimeout(run.timer);
  run.timer = null;
  run.mover?.stop();
  unlisten(run);
}

// Reads what comes on Nostr for a place while nothing holds it: its chat screen reads it itself.
function listen(run: Run) {
  if (run.stopped || run.unlisten || (holds.get(run.pocket) ?? 0) > 0) return;
  run.unlisten = readNostr(
    nostrReaderOf(
      () => run.chats?.e2e ?? null,
      (bytes) => {
        const next = run.nostrTurn.then(() => openNostrPlace(run, bytes).catch(() => undefined));
        run.nostrTurn = next;
        return next;
      },
      () => run.chats?.pieces ?? null,
    ),
  );
}

function unlisten(run: Run) {
  run.unlisten?.();
  run.unlisten = null;
}

// What came on Nostr for a closed place, kept as what comes to its queue (lookPlace), and its
// sender told it came with the next look.
async function openNostrPlace(run: Run, bytes: Uint8Array): Promise<void> {
  const chats = run.chats;
  // A group's message comes through the relay only.
  if (!chats || run.stopped || isGroupPacket(bytes)) return;
  let received: Received;
  try {
    received = await chats.e2e.receive(bytes);
  } catch {
    return;
  }
  const came = cameBefore(chats, received);
  await keepWith(chats, received, run.state, true);
  if (came) await heard(run, chats, came);
  if (came?.group) await placeGroupsAt(run.space, run.pocket, run.key).signal(came.identity, came.group, came.request).catch(() => undefined);
  if (run.state.place || run.relayless) await sendReceipts(chats, run.state.place, run.state);
}

// What came from a phone nearby (`link`), or was kept so (null), and opened in none of the space's
// chats, tried in a closed place, as what comes to its queue: false when it is none of its, or its
// chat screen holds it and takes them itself. A group's message comes through the relay only.
function openNearbyPlace(run: Run, link: string | null, packet: Uint8Array): Promise<boolean> {
  const next = run.nostrTurn.then(async () => {
    if (run.stopped || (holds.get(run.pocket) ?? 0) > 0 || !hasCore() || isGroupPacket(packet)) return false;
    const chats = run.chats ?? (await placeChats(run.space, run.pocket, run.key));
    if (run.stopped) return false;
    let received: Received;
    try {
      received = await chats.e2e.receive(packet);
    } catch {
      return false;
    }
    if (received.kind === 'refused' && received.reason === 'unknown') return false;
    if (received.kind === 'message' && link) run.state.near?.heardOn(received.identity, link);
    const came = cameBefore(chats, received);
    await keepWith(chats, received, run.state, false, link ? 'nearby' : undefined);
    if (came) await heard(run, chats, came);
    if (came?.group) await placeGroupsAt(run.space, run.pocket, run.key).signal(came.identity, came.group, came.request).catch(() => undefined);
    if (run.state.place || run.relayless) await sendReceipts(chats, run.state.place, run.state);
    return true;
  });
  run.nostrTurn = next.then(
    () => undefined,
    () => undefined,
  );
  return next.catch(() => false);
}

function startRun(space: number, pocket: number, key: Uint8Array, every?: number): Run {
  const run: Run = {
    space,
    pocket,
    key,
    state: receiveState(),
    spare: hiddenSpare(space, pocket, key),
    mover: null,
    timer: null,
    looking: Promise.resolve(),
    stopped: false,
    again: false,
    wake: () => undefined,
    part: null,
    chats: null,
    unlisten: null,
    nostrTurn: Promise.resolve(),
    relayless: false,
    release: () => undefined,
  };
  const held = () => (holds.get(pocket) ?? 0) > 0;
  // What comes nearby for it, and where its contacts were heard, while it receives: a contact heard
  // anew may have what waits for them now.
  const near = placeNear(space, pocket);
  run.state.near = near.heard;
  const stopHeard = near.heard.onChange(() => run.wake());
  const open = (link: string | null, packet: Uint8Array) => openNearbyPlace(run, link, packet);
  const stopOpening = openPlaceNearby(space, pocket, open);
  run.release = () => {
    stopOpening();
    stopHeard();
    run.state.near = undefined;
    near.release();
  };
  const next = () => {
    if (run.stopped) return;
    run.timer = setTimeout(tick, run.again ? 0 : (every ?? (appShown() ? shownPace(run.state.waited, EVERY) : awayPace(run.state.waited, run.state.failures))));
    run.again = false;
  };
  const tick = () => {
    run.timer = null;
    if (run.stopped) return;
    const began = run.part?.begin() ?? 0;
    if (held()) {
      // Its chat screen looks itself: the phone stays awake for it as long as the alarm holds it.
      run.part?.ended(began, 'came');
      return next();
    }
    run.state.took = 0;
    lookBegan();
    run.looking = lookPlace(run, () => run.stopped || held())
      .then(() => {
        run.part?.ended(began, run.state.took ? 'came' : run.state.failures > 0 ? 'failed' : 'quiet');
        // In Light sleep the alarm's look is followed at once by one that waits at the relay (lib/receiver.ts).
        if (began && lightSleep() && run.state.failures === 0) run.again = true;
      })
      .catch(() => {
        // The relay could not be reached: tried again with the next look.
        run.part?.ended(began, 'failed');
      })
      .finally(() => {
        lookEnded();
        next();
      });
  };
  run.wake = () => {
    if (run.stopped) return;
    if (!run.timer) {
      run.again = true;
      return;
    }
    clearTimeout(run.timer);
    run.timer = setTimeout(tick, 0);
  };
  // The alarm of the battery mode Sleep woke the phone: it looks at once (the waits were ended, lib/receiver.ts).
  run.part = joinSleepLooks(() => run.wake());
  next();
  listen(run);
  void openHeldIn(open);
  return run;
}

// What moves with the place's own queue, while closed, as its chat screen does it open: the watch
// slot, when it said a message came from the queue before; and its ring queue, if it rings.
function placeMover(run: Run, chats: SpaceChats, own: Relay): QueueMove {
  const { space, pocket, key } = run;
  return new QueueMove({
    e2e: chats.e2e,
    queues: placeQueues(space, pocket, key),
    data: run.spare,
    groups: placeGroupsAt(space, pocket, key).moves,
    moved: async (queue, old, why) => {
      await placeMoved(space, pocket, queue, old, why);
      const spaceKey = currentSpace().key;
      // Its slot names the old queue, or, as the relay lost it, says it was the one waited on.
      if (!old || !wasWatchedQueue(await loadWatched(space, spaceKey), pocket, old.recipientHex)) return;
      await watchPocket(space, spaceKey, pocket, { url: own.url, token: own.token ?? '', recipientHex: queue.recipientHex });
    },
    ring: async () => {
      const spaceKey = currentSpace().key;
      const before = (await loadHiddenData(space, pocket, key)).ringQueue;
      if (!before || !isRingedQueue(await loadRinged(space, spaceKey), pocket, before.recipientHex)) return false;
      const made = await moveRingPocket(space, spaceKey, pocket, own, before.recipientHex);
      await updateHiddenData(space, pocket, key, { ringQueue: { recipientHex: made.recipientHex, senderHex: made.senderHex } });
      return true;
    },
  });
}

// One look at a place's queue, as the receiver's at the space's (lib/receiver.ts lookOnce), with
// what hidden chats have: groups of their own, phones nearby only as lib/place-nearby.ts says, no SMS. What comes on Nostr is read apart.
// With no relay queue, what goes through Nostr goes, as the receiver's nostrLook does.
async function lookPlace(run: Run, stop: () => boolean): Promise<void> {
  if (!hasCore()) return;
  const { space, pocket, key, state } = run;
  const data = await loadHiddenData(space, pocket, key);
  // Stopped meanwhile (receive while closed turned off, or the space closed): its chats, and their
  // links to its devices, are not opened again.
  if (stop()) return;
  const chats = await placeChats(space, pocket, key);
  if (!run.chats) {
    run.chats = chats;
    // Its Nostr keys are known now: the relays there are asked for them.
    nostrKeysChanged();
  }
  if (stop()) return;
  const url = data.url.trim();
  const queue = data.ownQueue;
  run.relayless = !url || !queue;
  if (!url || !queue) {
    state.place = null;
    await nostrLookPlace(chats, state);
    return;
  }
  const own: Relay = { url, token: data.token.trim() || undefined };
  const sends = relayFor(url, data.token, data.via, data.viaToken, spareBackup(run.spare)) ?? own;
  const was = state.place && state.place.own.url === url ? state.place : null;
  let place: ReceivePlace = { own, sends, queue, here: was?.here ?? { relay: url, relayKey: '' }, keyAsked: was?.keyAsked ?? !canRelaySeal() };
  // Contacts on other relays reach the place through its relay's key, said with every message.
  if (!place.keyAsked) {
    const found = await relayKey(own).catch(() => undefined);
    if (found !== undefined) place = { ...place, here: { ...place.here, relayKey: found ? toBase64Url(found) : '' }, keyAsked: true };
  }
  state.place = place;
  // Its chat screen opening holds the place and waits for this look to end (holdPlace): each step
  // that may go through Tor is the last one then, and the screen sends what waits itself.
  if (stop()) return;
  await sendPending(chats, place.sends);
  if (stop()) return;
  await sendKeys(chats, place, state.near);
  if (stop()) return;
  await sendCopies(chats.e2e, place.sends).catch(() => 0);
  if (stop()) return;
  run.mover ??= placeMover(run, chats, own);
  const mover = run.mover;
  const here = place;
  const groups = placeGroupsAt(space, pocket, key);
  const take = async (bytes: Uint8Array, kind?: QueueKind | 'old'): Promise<Took> => {
    state.took = (state.took ?? 0) + 1;
    // A group's message (lib/place-groups.ts): its screens, and its notice, hear of it themselves.
    if (isGroupPacket(bytes)) return { junk: !(await groups.take(bytes).catch(() => true)) };
    // Taken from the relay, so kept whatever happens meanwhile.
    try {
      const received = await chats.e2e.receive(bytes, kind === 'own' ? { onOwn: here.queue.senderHex } : { old: kind !== undefined });
      const came = cameBefore(chats, received);
      await keepWith(chats, received, state, false, 'relay');
      if (came) await heard(run, chats, came);
      if (received.kind === 'message' && received.group) await groups.signal(received.identity, received.group, received.request).catch(() => undefined);
      return tookOf(received);
    } catch {
      // This one is lost, as in the chat; the next ones still come.
      return { junk: false };
    }
  };
  const recipient = fromHex(place.queue.recipientHex);
  // In the background, what comes to its other queues at its relay wakes the look too.
  const others = awayQueues(await mover.queues().catch(() => null), url);
  const found = { taken: 0, junk: 0 };
  let failed: unknown = null;
  state.waited = false;
  try {
    if (!stop()) state.waited = await waitWhileAway(own, recipient, others.map(fromHex));
    // Nothing came to the queue while the wait lasted: it is not asked again.
    for (let i = 0; i < BATCH && state.waited !== 'empty' && !stop(); i++) {
      const bytes = await receiveMessage(own, recipient);
      if (!bytes) break;
      found.taken++;
      if ((await take(bytes, 'own')).junk) found.junk++;
    }
  } catch (error) {
    failed = error;
  }
  // No internet here: a phone beside this one the owner said yes to for these hidden chats may bring what waits (lib/bridge.ts).
  if (failed && canTryLater(failed) && !stop()) {
    const { brought, asked } = await readNearby(own, recipient, (bytes) => take(bytes, 'own'), BATCH, stop, `${space}:${pocket}`).catch(() => ({ brought: 0, asked: true }));
    if (brought > 0) found.taken += brought;
    // The phone asked learned the queue: it moves once the relay can be reached here.
    if (asked) await mover.bridged().catch(() => undefined);
  }
  state.failures = failed ? state.failures + 1 : 0;
  // What came to its backup queue, whether or not its relay answered.
  await lookAtSpare(chats.e2e, (bytes) => take(bytes).then(() => undefined), stop, run.spare).catch(() => undefined);
  if (failed && isQueueNotFound(failed)) {
    // The relay no longer has its queue: a new one, which contacts are told quietly.
    await mover.lost(own).catch(() => null);
    return;
  }
  if (!failed && !stop()) {
    await mover
      .look({ own, found, take: (bytes, kind) => take(bytes, kind), tell: (identity) => tell(chats, here, identity, {}), shows: appShown(), waited: state.waited !== false, stop, empty: state.waited === 'empty' ? others : [] })
      .catch(() => null);
    // What waited to go, now that the relay answers (lib/waiting.ts).
    await sendWaiting(chats, { sends: here.sends, own, senderHex: here.queue.senderHex, here: here.here, ownKey: here.here.relayKey, relayUp: true, hidden: true, near: state.near }).catch(() => []);
    // Imported chats shared, going and coming in rounds (lib/share-rounds.ts): shared chats that
    // came are kept once the place's chat screen opens, which knows its own devices.
    driveShares({ chats, own, send: (identity, rounds) => tell(chats, here, identity, { more: { rounds } }, state.near), stopped: stop, packs: false });
  }
  await sendReceipts(chats, here, state);
  await sendCopies(chats.e2e, here.sends).catch(() => 0);
  await groups.flush().catch(() => undefined);
}

// With no relay queue: to the contacts Nostr is the only way to (lib/nostr-chats.ts), while Tor is
// ready, the place's new prekeys, what is due there again, what waited and what is to be said back.
async function nostrLookPlace(chats: SpaceChats, state: ReceiveState): Promise<void> {
  if (!nostrReady()) return;
  await sendKeys(chats, null, state.near);
  await sendNostrAgain(chats.e2e);
  await sendWaiting(chats, { sends: null, own: null, senderHex: '', here: { relay: '', relayKey: '' }, ownKey: '', relayUp: false, hidden: true, near: state.near }).catch(() => []);
  await sendReceipts(chats, null, state);
}

// What a message that came to a closed place says to the screens. A call is held for the place to
// open: its offer rings, while fresh, with no name; one its caller ended, or not taken in time, is
// kept as missed, as the chat would.
async function heard(run: Run, chats: SpaceChats, received: Extract<Received, { kind: 'message' }>) {
  const { space, pocket } = run;
  const call = received.call;
  if (call && !received.twice) {
    const held = calls.get(pocket) ?? [];
    const missed = (offer: Extract<Received, { kind: 'message' }>, why = '') => {
      const video = offer.call?.kind === 'offer' && offer.call.video;
      const timer = chats.e2e.contacts().find((contact) => contact.identity === offer.identity)?.timer ?? 0;
      void chats.history.add(callLineMessage(`${CONTACT_PREFIX}${offer.identity}`, false, `${video ? 'Missed video call' : 'Missed voice call'}${why}`, timer)).catch(() => undefined);
    };
    const drop = (id: string) => {
      const left = (calls.get(pocket) ?? []).filter((h) => {
        if (h.received.call?.id !== id) return true;
        if (h.timer) clearTimeout(h.timer);
        return false;
      });
      if (left.length > 0) calls.set(pocket, left);
      else calls.delete(pocket);
      const ringing = hiddenRinging();
      if (ringing && ringing.space === space && ringing.pocket === pocket && !left.some((h) => h.received.call?.kind === 'offer')) setHiddenRinging(null);
    };
    if (call.kind === 'offer') {
      // Made while the place was closed and no look took it: it has stopped ringing on their side.
      if (received.request || offerMissed(call.at)) {
        if (!received.request) missed(received);
      } else if (callsOff()) {
        // INVISIBLE (lib/modes.ts): it rings not even with no name, as it could not be answered.
        // Kept as missed at once, its line says why.
        missed(received, CALLS_OFF_LINE);
      } else {
        const entry: Held = { received, timer: null, miss: (why) => missed(received, why) };
        entry.timer = setTimeout(
          () => {
            entry.timer = null;
            if (!(calls.get(pocket) ?? []).includes(entry)) return;
            drop(call.id);
            missed(received);
          },
          offerRingsFor(call.at),
        );
        calls.set(pocket, [...held, entry].slice(-MOST_CALLS));
        ringListeners.forEach((listener) => listener(space, pocket));
      }
    } else if (call.kind === 'end') {
      const offer = held.find((h) => h.received.call?.id === call.id && h.received.call.kind === 'offer');
      if (offer) {
        drop(call.id);
        missed(offer.received);
      }
    } else if (held.some((h) => h.received.call?.id === call.id)) {
      calls.set(pocket, [...held, { received, timer: null }].slice(-MOST_CALLS));
    }
  }
  messageListeners.forEach((listener) => listener(space, pocket, received));
}
