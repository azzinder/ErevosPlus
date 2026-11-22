// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { newTag, type Message, type Route } from '../lock/history';
import type { QueueKind, QueuesData } from '../lock/queues-data';
import { loadCurrentSpaceData, type Queue } from '../lock/space-data';
import { saveClip } from '../lock/voice-clips';
import { offerRef } from './attachments';
import { contentOf } from './chat-parts';
import { canRelaySeal, hasCore } from './core';
import { randomBytes } from './crypto';
import { ONLINE, toBase64Url, type E2E, type Extra, type Received, type Where } from './e2e';
import { sendCopies } from './fanout';
import { nearby, SMS_LINK, type NearHeard } from './nearby';
import { unopenedNearby } from './place-nearby';
import { nostrKeysChanged, nostrReady, readNostr } from './nostr';
import { nostrOnlyWay, nostrReaderOf, onNostrWent, sendNostrAgain, sendNostrBackups } from './nostr-chats';
import { keepOffer, offerOf } from './relay-offer';
import { takeIntro, type IntroSend } from './intros';
import { keepPieceFrom } from './pieces-kept';
import { driveShares, packCame, roundsCame, takingCame } from './share-rounds';
import {
  ackTaken,
  canReadManyAt,
  canWaitAt,
  carryTo,
  fromHex,
  isQueueNotFound,
  MAX_ANY,
  queueNotFound,
  receiveMessage,
  relayClockOffset,
  relayKey,
  sameRelay,
  sendMessage,
  toHex,
  waitForAny,
  waitForMessage,
  warmCallRelay,
  type Relay,
} from './relay';
import { needsBridge, readNearby } from './bridge';
import { answerInvites, expireTextInvites, linkInviter, refreshSmsLink, takeInviteAnswer } from './sms-relay';
import { isGroupPacket } from './groups';
import { cameAt } from './later';
import { linkOf, spaceMover, tookOf, type Took } from './queue-move';
import { contactTarget, relayFor, sendSealed, spaceChats, type SpaceChats } from './space-chats';
import { lookAtSpare, spareBackup } from './spare';
import { lookNow, looksAsked, onLookNow } from './look-now';
import { briefLook, joinSleepLooks, lightSleep, lookBegan, lookEnded, waitBegan, waitEnded } from './sleep-look';
import { flushGroups, takeGroupPacket, takeGroupSignal } from './space-groups';
import { nextDue, sendWaiting, type SendPlace } from './waiting';
import { setShownCheck } from './safety';
import { keepPush } from './web-push';
import { cameUnread, onContactsCame } from './contact-queues';
import { onNetworkChange } from './network-change';
import { setClockOffset } from './call';
import { t } from './i18n';
import { callAudio } from '../modules/erevos-call';

// Whether Android says the phone has internet; undefined where it is not told.
function phoneOnline(): boolean | undefined {
  try {
    return callAudio?.hasInternet?.();
  } catch {
    return undefined;
  }
}
import { onShownEnded } from './last-seen';

// Messages that come while a space is open, whatever screen shows. The chat screen takes them
// itself while it is open, and holds this meanwhile (holdReceiver). Otherwise this looks at the
// space's relay queue every few seconds, keeps what came in the space's history as the chat
// would, tells the contacts' phones that it came, and tells the home screen (onReceived). What
// only the chat says, such as that a contact set a timer, is not said. A photo or file is taken
// from the relay once its chat opens. A contact whose chat appears offline is told nothing: what
// came waits with the contact (E2E.hold). Otherwise, while the app shows, what is told says the
// phone is open, and so does an answer to a contact who asks. Hidden chats are not looked at: their key is in memory only
// while they are open. What this phone carries from phones nearby goes to its relays meanwhile.
//
// What comes from phones nearby (lib/nearby.ts, on the links lib/nearby-links.ts keeps up while
// the space is open) is opened here the same way, one packet at a time, unless the chat screen
// takes it itself (takeNearby). The marks go back to the contact's phone nearby when it is, as
// with no internet, and through the relay too.
//
// It does not ask every few seconds: it waits at the relay until something comes for the queue
// (waitForMessage), or for the groups', the contact link's or the public groups' queue there
// (awayQueues), so the phone's radio rests in between, and what comes is taken at once. A wait
// that ran out with nothing come asks none of them again: only the others are read. While Erevos
// is in the background (lib/background.ts) one wait lasts WAIT_FOR; while it shows, FRONT_WAIT, as
// each look also sends what is due, and it is ended at once when something is to be said
// (lookNow). At a relay that cannot wait, it asks every EVERY while it shows, every AWAY_EVERY in
// the background; after a look that failed there, it waits longer each time, AWAY_RETRY_MOST at
// most. In a call the looks go fast, with no wait (setReceiverPace).

const EVERY = 3000;
// In the background: how long one wait at the relay lasts, seconds; how often a relay that cannot
// wait is asked; and the first and longest wait after a look that failed, milliseconds.
const WAIT_FOR = 60;
// While Erevos shows: how long one wait at the relay lasts, seconds.
const FRONT_WAIT = 15;
const AWAY_EVERY = 20_000;
const AWAY_RETRY = 5000;
const AWAY_RETRY_MOST = 120_000;
// Messages taken in one look, at most.
const BATCH = 50;
const CONTACT_PREFIX = 'contact:';

type Receipts = Record<string, string[]>;
// `near`: in a hidden place's run (lib/place-receiver.ts), where its contacts were heard nearby.
// `took`: how many packets the look under way took from the relay, for the look of the battery mode Sleep (lib/sleep-look.ts).
type State = { place: Place | null; seen: number; receipts: Receipts; answers: Set<string>; waited: Waited; failures: number; took?: number; near?: NearHeard };

// Where this space's messages come and go: our relay, the relay that sends (through the second
// one when set), our queue, and where contacts reach us, said in every message.
type Place = { own: Relay; sends: Relay; queue: Queue; here: Where; keyAsked: boolean };

// When this phone's clock was last measured against its relay's, for calls (lib/call.ts callNow):
// again after CLOCK_EVERY_MS, as the phone's own clock may be set meanwhile.
let clockAt = 0;
const CLOCK_EVERY_MS = 60 * 60_000;

/** What a run of looks keeps between them, and where its messages come and go, as the space's has: for a hidden place's own (lib/place-receiver.ts). */
export type ReceiveState = State;
export type ReceivePlace = Place;

/** A run of looks' state, before its first look. */
export function receiveState(): ReceiveState {
  return { place: null, seen: -1, receipts: {}, answers: new Set(), waited: false, failures: 0 };
}

let holds = 0;
// Bumped each time a hold ends, as the chat may have changed the relay or the queue meanwhile, and
// each time a screen with no hold changed them (placeChanged): the next look reads them again.
let released = 0;
let look: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
// Whether the app shows on the screen: only then is a contact told this phone is open.
let shows = true;
// The waits at the relay under way, ended when the app shows or the chat opens, and how to look
// again at once.
const waits = new Set<AbortController>();
let hurry: (() => void) | null = null;

const shownListeners = new Set<(shown: boolean) => void>();

// Which of the looks asked for at once (lib/look-now.ts) each queue's waits have heard: a look that
// was past its wait when asked does not wait at its next one. The chat screen's and the hidden
// places' looks hear it too, which lookSoon does not hurry.
const heard = new Map<string, number>();
onLookNow(() => lookSoon());
export { lookNow };

/** Ends the wait at the relay and looks at once: something new waits to go (app/backup-pieces.tsx). */
export function lookSoon(): void {
  endWaits();
  hurry?.();
}

/**
 * The space's relay, token or queue changed on a screen that does not hold the receiver, as Linked
 * devices makes a new computer's queue to link with: the next look, at once, reads them again, so
 * what the phone answers on that queue is taken, not left on the relay until a chat opens.
 */
export function placeChanged(): void {
  released++;
  lookSoon();
}

// A safety message is put off only while the owner looks (lib/safety.ts).
setShownCheck(() => shows);

/** Says whether the app shows on the screen (AppState 'active'). Shown again, it looks at once. */
export function setAppShown(shown: boolean): void {
  const changed = shows !== shown;
  shows = shown;
  if (changed) shownListeners.forEach((listener) => listener(shown));
  if (!shown) return;
  endWaits();
  hurry?.();
}

/** Calls `listener` each time the app shows or stops showing, until the function it gives is called. */
export function onAppShown(listener: (shown: boolean) => void): () => void {
  shownListeners.add(listener);
  return () => shownListeners.delete(listener);
}

// The waits ended from outside, not by what came.
const ended = new WeakSet<AbortController>();

/** Ends the waits at the relay under way, so their looks go on at once (lib/place-receiver.ts). */
export function endWaits(): void {
  waits.forEach((wait) => {
    ended.add(wait);
    wait.abort();
  });
  waits.clear();
}

// Something came to a contact's own queue (lib/contact-queues.ts): the wait at the relay ends, and
// a look takes it at once, here or in the chat screen.
onContactsCame(() => {
  endWaits();
  hurry?.();
});

// The phone's network changed: a wait at the relay on the network gone ends, and a look goes at once.
onNetworkChange(() => {
  endWaits();
  hurry?.();
});

// A look when the next message sent for later should go (lib/waiting.ts), the wait at the relay
// ended first, so it goes on time while Erevos runs.
let dueTimer: ReturnType<typeof setTimeout> | null = null;

function lookWhenDue(at: number) {
  if (dueTimer) clearTimeout(dueTimer);
  dueTimer = null;
  if (at <= 0) return;
  // Timers longer than about 24 days go off at once: one that far looks again then, and waits on.
  dueTimer = setTimeout(
    () => {
      dueTimer = null;
      endWaits();
      hurry?.();
    },
    Math.min(Math.max(0, at - Date.now()), 2 ** 31 - 1),
  );
}

/** How a wait at the relay ended: it did not wait (false), something came, or it ran out with nothing come. */
export type Waited = false | 'came' | 'empty';

/**
 * Waits at the relay until something comes for the queue, or for one of `others` (awayQueues), or
 * a while (longer in the background): then a look takes it. Says how it ended; false at once in a
 * call, after lookNow, during the look of the battery mode Sleep (lib/sleep-look.ts), at a
 * relay that cannot wait, or once the wait was ended. Throws when
 * the relay cannot be reached, or no longer has the queue: only the queue's own wait throws. One
 * of `others` the relay lost ends the wait, so the look finds it gone and makes it anew; one that
 * fails otherwise drops out, and the others wait on. On a relay that reads many queues at once,
 * one wait asks of them all, on its `/read` path, with no token (lib/relay.ts waitForAny).
 */
export async function waitWhileAway(relay: Relay, recipient: Uint8Array, others: Uint8Array[] = []): Promise<Waited> {
  // What came to a contact's own queue, not taken yet, is taken first (lib/contact-queues.ts).
  if (briefLook() || !canWaitAt(relay) || cameUnread()) return false;
  // In a call the looks go fast (setReceiverPace): none waits.
  if (shows && pace() < EVERY) return false;
  const id = toHex(recipient);
  const asked = looksAsked();
  // A queue not waited on before, as one just moved to, has heard of nothing asked so far.
  if ((heard.get(id) ?? 0) !== asked) {
    heard.set(id, asked);
    return false;
  }
  heard.set(id, asked);
  const seconds = shows ? FRONT_WAIT : WAIT_FOR;
  const wait = new AbortController();
  waits.add(wait);
  let came = false;
  // What came, for the battery mode Light sleep (lib/sleep-look.ts): the wait's answer woke the phone.
  let some = false;
  let answered = false;
  waitBegan(true);
  try {
    if (canReadManyAt(relay) && others.length < MAX_ANY) {
      // Their own way through Tor, named for the queue: none other goes on it.
      const found = await waitForAny(relay, [recipient, ...others], seconds, `read-${id.slice(0, 16)}`, wait.signal);
      if (found) {
        answered = true;
        if (found[0] === 'gone') throw queueNotFound('wait');
        if (!canWaitAt(relay) || ended.has(wait)) return false;
        some = found.some((f) => f !== 'none');
        return some ? 'came' : 'empty';
      }
    }
    // The first that answers ends the others.
    const mine = waitForMessage(relay, recipient, seconds, wait.signal)
      .then((got) => void (came ||= got))
      .finally(() => wait.abort());
    const theirs = others.map((r) =>
      waitForMessage(relay, r, seconds, wait.signal).then(
        (got) => {
          came ||= got;
          wait.abort();
        },
        (error) => {
          if (!isQueueNotFound(error)) return new Promise<void>(() => undefined);
          came = true;
          wait.abort();
        },
      ),
    );
    await Promise.race([mine, ...theirs]);
    answered = true;
    if (!canWaitAt(relay) || ended.has(wait)) return false;
    some = came;
    return came ? 'came' : 'empty';
  } finally {
    // Ended from outside: the look that follows says what was asked of it until now.
    if (ended.has(wait)) heard.set(id, looksAsked());
    waitEnded(true, some, !answered);
    waits.delete(wait);
    ended.delete(wait);
  }
}

/**
 * The queues besides the own one to wait on in the background (waitWhileAway), as recipient ids
 * in hex: the groups', the contact link's and the public groups' (lib/queue-move.ts), those on the
 * relay at `url`. What came to them is read by the look that follows (QueueMove.look), and none
 * of them is read after a wait that ran out with nothing come.
 */
export function awayQueues(queues: QueuesData | null, url: string): string[] {
  if (!queues) return [];
  return [queues.group, queues.link, queues.public].flatMap((kept) => (kept && sameRelay(kept.url, url) ? [kept.queue.recipientHex] : []));
}

/** How long to wait before the next look while Erevos is in the background: after a wait at the relay, a look that did not wait, or `failures` that failed in a row. */
export function awayPace(waited: Waited | boolean, failures: number): number {
  if (failures > 0) return Math.min(AWAY_RETRY_MOST, AWAY_RETRY * 2 ** (failures - 1));
  return waited ? 500 : AWAY_EVERY;
}

/** How long to wait before the next look while Erevos shows: a moment after a wait at the relay, else `every`. */
export function shownPace(waited: Waited | boolean, every: number): number {
  return waited ? Math.min(500, every) : every;
}

/** Whether the app shows on the screen, as last said. */
export function appShown(): boolean {
  return shows;
}

/** Whether to answer a contact who asks if this phone is open: the app shows, and it was not just said. */
export function answersAsk(toldAt: number, now = Date.now()): boolean {
  return shows && now - toldAt > (ONLINE * 1000) / 2;
}
const messageListeners = new Set<(received: Extract<Received, { kind: 'message' }>) => void>();
// Where the last look found the space's relay and queue, once it knew the relay's key: what the
// marks for what came nearby say too.
let lastPlace: Place | null = null;
// The chat screen, while it takes what comes nearby itself, and what came nearby, one at a time.
type NearbyTaker = (link: string | null, packet: Uint8Array) => Promise<void>;
let nearbyTaker: NearbyTaker | null = null;
let nearbyTurn: Promise<unknown> = Promise.resolve();
// What opens what comes on Nostr for the space's chats while their chat screen shows (takeNostr).
let nostrTaker: ((packet: Uint8Array) => Promise<void>) | null = null;
const nearbyState: State = { place: null, seen: -1, receipts: {}, answers: new Set(), waited: false, failures: 0 };

// A look's receipts, with what came on Nostr or nearby and could not be said to have come then
// (openHere): said with the look, not only once something more comes so.
function withNearby(state: State): State {
  for (const [peer, got] of Object.entries(nearbyState.receipts)) {
    delete nearbyState.receipts[peer];
    state.receipts[peer] = [...(state.receipts[peer] ?? []), ...got];
  }
  return state;
}
// How long to wait before the next look, asked each time.
let pace = () => EVERY;

/**
 * Stops looking at the relay, once a look under way has ended, until the function it gives is
 * called. The chat screen holds it while it is open, and a backup being restored.
 */
export async function holdReceiver(): Promise<() => void> {
  holds++;
  endWaits();
  await look.catch(() => undefined);
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    holds--;
    released++;
  };
}

/** Calls `listener` each time messages or marks came. Returns how to stop. */
export function onReceived(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Tells the screens that listen (onReceived) that the space's chats changed, as when a call left its line. */
export function announceReceived(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Whether what came is news to tell of: words, a voice message on its last part, as the relay
 * counts it (lib/space-chats.ts sendSealed), a photo or file; not marks, edits, deletes, calls or a
 * group's setting up, nor a message that came already (`twice`), as one does on a linked device
 * directly and again through the phone (docs/multi-device.md).
 */
export function isNews(received: Extract<Received, { kind: 'message' }>): boolean {
  if (received.twice || received.erase || received.call || received.group) return false;
  if (received.voice) return received.voice.part === received.voice.parts - 1;
  return received.text.length > 0 || received.file !== null;
}

/** Calls `listener` with each message the receiver opens, after it is kept, said to come `twice` when it came already, by what the chat took or what the history holds; not those the chat screen opens itself. */
export function onMessage(listener: (received: Extract<Received, { kind: 'message' }>) => void): () => void {
  messageListeners.add(listener);
  return () => {
    messageListeners.delete(listener);
  };
}

/** Sets how long the receiver waits between looks, milliseconds, asked before each: shorter while something waits for an answer. */
export function setReceiverPace(next: () => number): void {
  pace = next;
}

/** Looks at the open space's relay queue every few seconds (or every `every` milliseconds) until the function it gives is called. */
export function startReceiver(every?: number): () => void {
  const state: State = { place: null, seen: -1, receipts: {}, answers: new Set(), waited: false, failures: 0 };
  lastPlace = null;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  // Asked to look at once while a look was under way: the next one starts as soon as it ends.
  let again = false;
  // What comes on Nostr for the space's chats (lib/nostr.ts), once they are open.
  let chats: SpaceChats | null = null;
  const stopNostr = readNostr(nostrReaderOf(() => chats?.e2e ?? null, openNostr, () => chats?.pieces ?? null));
  // A text that went through Nostr while the chat was not open says so in it.
  const stopWent = onNostrWent((identity, tag) => void chats?.history.throughNostr(`${CONTACT_PREFIX}${identity}`, tag).catch(() => undefined));
  const openChats = () => {
    if (chats || !hasCore()) return;
    void spaceChats()
      .then((open) => {
        if (stopped) return;
        chats = open;
        // The space's keys are known now: its Nostr reading asks at once, not at its next look.
        nostrKeysChanged();
      })
      .catch(() => undefined);
  };
  openChats();
  const next = () => {
    if (stopped) return;
    timer = setTimeout(tick, again ? 0 : (every ?? (shows ? shownPace(state.waited, pace()) : awayPace(state.waited, state.failures))));
    again = false;
  };
  const tick = () => {
    timer = null;
    if (stopped) return;
    openChats();
    const began = part.begin();
    if (holds > 0) {
      // The chat screen looks itself: the phone stays awake for it as long as the alarm holds it.
      part.ended(began, 'came');
      return next();
    }
    state.took = 0;
    lookBegan();
    look = lookOnce(state, () => stopped || holds > 0)
      .then((changed) => {
        if (changed && !stopped) listeners.forEach((listener) => listener());
        part.ended(began, changed || state.took ? 'came' : state.failures > 0 ? 'failed' : 'quiet');
        // In Light sleep the alarm's look is followed at once by one that waits at the relay, for
        // the network to wake the phone on.
        if (began && lightSleep() && state.failures === 0) again = true;
      })
      .catch(() => {
        // The relay could not be reached: tried again with the next look.
        part.ended(began, 'failed');
      })
      .finally(() => {
        lookEnded();
        next();
      });
  };
  next();
  const now = () => {
    if (stopped) return;
    if (!timer) {
      again = true;
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(tick, 0);
  };
  hurry = now;
  // The space stopped showing: those told meanwhile that it was open hear when it closed
  // (E2E.closeDue). The chat screen, open on the space, tells them itself first; what it left is
  // told here, at once where the relay is known, else with the next look.
  const stopClosed = onShownEnded((_key, since, at) => {
    setTimeout(() => {
      if (stopped || !chats) return;
      const due = chats.e2e.closeDue(since, at);
      if (due.length === 0) return;
      for (const identity of due) state.answers.add(`${CONTACT_PREFIX}${identity}`);
      if (lastPlace) void sendReceipts(chats, lastPlace, state).catch(() => undefined);
    }, 0);
  });
  // The alarm of the battery mode Sleep woke the phone: a wait from before it slept ends, and a look goes at once.
  const part = joinSleepLooks(() => {
    endWaits();
    now();
  });
  return () => {
    stopped = true;
    stopClosed();
    part.leave();
    stopNostr();
    stopWent();
    if (timer) clearTimeout(timer);
    if (hurry === now) hurry = null;
    endWaits();
    lookWhenDue(0);
    lastPlace = null;
  };
}

/**
 * Opens a packet from a phone nearby, on `link`, one that came by SMS (SMS_LINK, lib/sms-way.ts),
 * or one kept for this space (null): in the chat screen while it takes them, otherwise here, as
 * one from the relay. One for none of the space's chats is kept for the others.
 */
export function openNearby(link: string | null, packet: Uint8Array): Promise<void> {
  const next = nearbyTurn.catch(() => undefined).then(() => (nearbyTaker ? nearbyTaker(link, packet) : openHere(link, packet)));
  nearbyTurn = next;
  return next.catch(() => undefined);
}

/**
 * Opens a packet that came on Nostr for the space's chats (lib/nostr.ts): in the space's chat screen
 * while it takes them (takeNostr), otherwise here, as one kept for this space is (openNearby).
 */
export function openNostr(packet: Uint8Array): Promise<void> {
  const next = nearbyTurn.catch(() => undefined).then(() => (nostrTaker ? nostrTaker(packet) : openHere(null, packet, true)));
  nearbyTurn = next;
  return next.catch(() => undefined);
}

/** Has the space's chat screen open what comes on Nostr itself (`taker`), until the function it gives is called. */
export function takeNostr(taker: (packet: Uint8Array) => Promise<void>): () => void {
  nostrTaker = taker;
  return () => {
    if (nostrTaker === taker) nostrTaker = null;
  };
}

/** Has the chat screen open what comes nearby itself (`taker`), until the function it gives is called. */
export function takeNearby(taker: NearbyTaker): () => void {
  nearbyTaker = taker;
  return () => {
    if (nearbyTaker === taker) nearbyTaker = null;
  };
}

async function openHere(link: string | null, packet: Uint8Array, nostr = false): Promise<void> {
  if (!hasCore()) {
    if (link) nearby.hold(packet);
    return;
  }
  // A group's message (lib/groups.ts), as on the same Wi-Fi with no internet.
  if (isGroupPacket(packet)) {
    const ours = await takeGroupPacket(packet).catch(() => false);
    if (!ours && link) nearby.hold(packet);
    else if (!link) nearby.dropHeld(packet);
    return;
  }
  const chats = await spaceChats();
  let received: Received;
  try {
    received = await chats.e2e.receive(packet, link && link !== SMS_LINK ? { near: link } : {});
  } catch {
    if (!link) nearby.dropHeld(packet);
    return;
  }
  if (received.kind === 'refused' && received.reason === 'unknown') {
    // Perhaps an open hidden place's, or one that receives (lib/place-nearby.ts); else kept.
    if (link) await unopenedNearby(link, packet);
    return;
  }
  if (!link) nearby.dropHeld(packet);
  if (received.kind === 'message' && link && link !== SMS_LINK) nearby.heardOn(received.identity, link);
  const came = cameBefore(chats, received);
  const changed = await keep(chats, received, nearbyState, nostr, link === SMS_LINK ? 'sms' : link ? 'nearby' : undefined);
  if (came) {
    messageListeners.forEach((listener) => listener(came));
    if (came.group) await takeGroupSignal(came.identity, came.group, came.request).catch(() => undefined);
  }
  if (changed) listeners.forEach((listener) => listener());
  await sendReceipts(chats, lastPlace, nearbyState);
  // What could not be said now goes with the next look (withNearby), which does not wait at the relay first.
  if (Object.keys(nearbyState.receipts).length > 0) lookNow();
}

async function placeNow(): Promise<Place | null> {
  const data = await loadCurrentSpaceData();
  const url = data.url.trim();
  if (!url || !data.ownQueue) return null;
  const own: Relay = { url, token: data.token.trim() || undefined };
  const sends = relayFor(url, data.token, data.via, data.viaToken) ?? own;
  return { own, sends, queue: data.ownQueue, here: { relay: url, relayKey: '' }, keyAsked: !canRelaySeal() };
}

// One look at the queue: what waits to be sent first, then up to BATCH messages, then the
// receipts. Says whether anything the home screen shows changed.
async function lookOnce(state: State, stop: () => boolean): Promise<boolean> {
  if (!hasCore()) return false;
  if (state.seen !== released) {
    state.place = await placeNow();
    state.seen = released;
    if (state.place) void keepPush(state.place.own, state.place.queue);
    // A call then starts without asking for the call relay first (lib/relay.ts callRelay).
    if (state.place) warmCallRelay(state.place.own);
  }
  let place = state.place;
  if (!place) return nostrLook(state);
  const chats = await spaceChats();
  // Sends go through the space's backup relay when ours cannot be reached, once it is ready.
  const backup = spareBackup();
  if (backup && !place.sends.backup) {
    place = { ...place, sends: { ...place.sends, backup: { ...backup, via: place.sends.via } } };
    state.place = place;
  }
  let changed = false;
  const here = place;
  const mover = spaceMover(chats);
  // One message from our queue (`own`), from one of the others (`old`, lib/queue-move.ts), or from
  // the backup queue: what it was to the junk meter.
  const take = async (bytes: Uint8Array, kind?: QueueKind | 'old', mine = ''): Promise<Took> => {
    state.took = (state.took ?? 0) + 1;
    // A group's message (lib/groups.ts): the group screens hear of it themselves.
    if (isGroupPacket(bytes)) return { junk: !(await takeGroupPacket(bytes).catch(() => true)) };
    // Taken from the relay, so kept whatever happens meanwhile.
    try {
      // An answer to an SMS invite sent from here: a new contact, linked to the number.
      if (await takeInviteAnswer(chats.e2e, bytes, here.queue.senderHex, here.here).catch(() => null)) {
        changed = true;
        return { junk: false };
      }
      let received = await chats.e2e.receive(bytes, kind === 'own' ? { onOwn: here.queue.senderHex } : mine ? { onMine: mine } : { old: kind !== undefined });
      // Someone whose SMS invite was answered here: no message request.
      if (received.kind === 'message' && received.added && (await linkInviter(chats.e2e, received.identity).catch(() => null))) {
        received = { ...received, request: false };
      }
      const came = cameBefore(chats, received);
      changed = (await keep(chats, received, state, false, 'relay')) || changed;
      if (came) messageListeners.forEach((listener) => listener(came));
      if (received.kind === 'message' && received.group) await takeGroupSignal(received.identity, received.group, received.request).catch(() => undefined);
      return tookOf(received);
    } catch {
      // This one is lost, as in the chat; the next ones still come.
      return { junk: false };
    }
  };
  // What came to a contact's own queue, as a call's offer, is read before the sends and between
  // them, which through Tor can take tens of seconds (QueueMove.readCame).
  const early = () => mover.readCame({ own: here.own, takeMine: (bytes, r) => take(bytes, 'old', r), stop }).catch(() => undefined);
  await early();
  // Contacts on other relays reach us through our relay's key, said with every message. Asked
  // again with the next look when the relay cannot be reached.
  if (!place.keyAsked) {
    const key = await relayKey(place.own).catch(() => undefined);
    if (key !== undefined) {
      place.here = { ...place.here, relayKey: key ? toBase64Url(key) : '' };
      place.keyAsked = true;
    }
  }
  if (place.keyAsked) lastPlace = place;
  const sinceClock = Date.now() - clockAt;
  if (sinceClock > CLOCK_EVERY_MS || sinceClock < 0) {
    const offset = await relayClockOffset(place.own).catch(() => null);
    if (offset !== null) {
      setClockOffset(offset);
      clockAt = Date.now();
    }
  }
  await early();
  await sendPending(chats, place.sends);
  await early();
  await sendKeys(chats, place);
  await early();
  // Texts that went through Nostr, not said to have come in time, through the relay as well; and
  // to contacts Nostr is the only way to, there again.
  await sendNostrBackups(chats.e2e, place.sends);
  await sendNostrAgain(chats.e2e);
  await early();
  watchCopies(chats.e2e);
  await sendCopies(chats.e2e, place.sends).catch(() => 0);
  await early();
  // What this phone carries for its relays, from phones nearby or its own (lib/nearby.ts).
  const sends = place.sends;
  void nearby.uploadCarried((url, sealed, mark) => carryTo(sends, url, sealed, mark)).catch(() => undefined);
  // An SMS invite sent from the SMS screen since: its answer may be on its way.
  await refreshSmsLink().catch(() => undefined);
  await early();
  const recipient = fromHex(place.queue.recipientHex);
  // In the background, what comes to the other queues at our relay wakes the look too.
  const others = awayQueues(await mover.queues().catch(() => null), place.own.url);
  let failed: unknown = null;
  const found = { taken: 0, junk: 0 };
  state.waited = false;
  try {
    if (!stop()) state.waited = await waitWhileAway(place.own, recipient, others.map(fromHex));
    // Nothing came to the queue while the wait lasted: it is not asked again.
    for (let i = 0; i < BATCH && state.waited !== 'empty' && !stop(); i++) {
      const bytes = await receiveMessage(place.own, recipient);
      if (!bytes) break;
      found.taken++;
      if ((await take(bytes, 'own')).junk) found.junk++;
    }
    // The last one taken is kept: the relay may delete it now, not only at the next look.
    await ackTaken(place.own, recipient);
  } catch (error) {
    failed = error;
  }
  // No internet here: a phone beside this one that has it may bring what waits (lib/bridge.ts).
  if (failed && needsBridge(failed, phoneOnline()) && !stop()) {
    const { brought, asked } = await readNearby(place.own, recipient, (bytes) => take(bytes, 'own'), BATCH, stop).catch(() => ({ brought: 0, asked: true }));
    if (brought > 0) found.taken += brought;
    // The phone asked learned the queue: it moves once the relay can be reached here.
    if (asked) await mover.bridged().catch(() => undefined);
  }
  // Phones beside this one are told whether it reads for them: it does while it reaches its relay.
  nearby.setOnline(!failed, place.own.url);
  state.failures = failed ? state.failures + 1 : 0;
  // What came to the backup queue, whether or not our relay answered.
  await lookAtSpare(chats.e2e, (bytes) => take(bytes).then(() => undefined), stop).catch(() => undefined);
  // Our relay could not be reached: tried again with the next look. What came to the backup
  // queue still goes on, and so do the receipts, through the backup relay.
  if (failed && isQueueNotFound(failed)) {
    // The relay no longer has our queue: a new one, which contacts are told quietly.
    const queue = await mover.lost(place.own);
    if (!queue) return changed;
    state.place = { ...place, queue };
    if (state.place.keyAsked) lastPlace = state.place;
    mover.hold([t('The relay had lost your queue, so you have a new one. Your contacts are told quietly.')]);
    return changed;
  }
  if (!failed && !stop()) {
    const moved = await mover
      .look({ own: place.own, found, take, takeMine: (bytes, r) => take(bytes, 'old', r), tell: (identity) => tell(chats, here, identity, {}), shows, waited: state.waited !== false, stop, empty: state.waited === 'empty' ? others : [] })
      .catch(() => null);
    if (moved?.queue) {
      place = { ...place, queue: moved.queue };
      state.place = place;
      if (place.keyAsked) lastPlace = place;
    }
    if (moved) mover.hold(moved.notes);
  }
  // The queue the contact link names as the look left it: a move in it never names the new own queue.
  const after = await mover.queues().catch(() => null);
  const link = after ? linkOf(after, after.now?.queue ?? place.queue).senderHex : place.queue.senderHex;
  await answerInvites(chats.e2e, link, place.here, place.sends).catch(() => undefined);
  // Invites by plain SMS that are over: their invites to the relay, taken back when unused.
  await expireTextInvites(place.own).catch(() => undefined);
  // What waited to go, now that the relay answers (lib/waiting.ts).
  if (!failed && (await sendWaiting(chats, sendPlace(place, true)).catch(() => [])).length > 0) changed = true;
  // Imported chats shared, going and coming in rounds while Erevos runs (lib/share-rounds.ts).
  if (!failed) driveShares({ chats, own: here.own, send: (identity, rounds) => tell(chats, here, identity, { more: { rounds } }), stopped: stop });
  lookWhenDue(nextDue(chats.history));
  await sendReceipts(chats, place, withNearby(state));
  await sendCopies(chats.e2e, place.sends).catch(() => 0);
  await flushGroups().catch(() => undefined);
  return changed;
}

// The chats whose copies for contacts' endpoints have the receiver look at once when there are more (lib/fanout.ts).
const watched = new WeakSet<E2E>();

function watchCopies(e2e: E2E) {
  if (watched.has(e2e)) return;
  watched.add(e2e);
  e2e.onCopies(() => hurry?.());
}

// Where what waits goes from, as the last look found it: with no relay, to phones nearby only.
function sendPlace(place: Place | null, relayUp: boolean): SendPlace {
  if (!place) return { sends: null, own: null, senderHex: '', here: { relay: '', relayKey: '' }, ownKey: '', relayUp: false };
  return { sends: place.sends, own: place.own, senderHex: place.queue.senderHex, here: place.here, ownKey: place.here.relayKey, relayUp };
}

/**
 * Sends what waits to contacts heard nearby, or over LoRa, as the links nearby change (lib/nearby-links.ts):
 * unless the chat screen is open, which does it itself.
 */
export function nearbyChanged(): void {
  if (nearbyTaker || !hasCore()) return;
  void spaceChats()
    .then((chats) => sendWaiting(chats, sendPlace(lastPlace, false)))
    .then((went) => {
      if (went.length > 0) listeners.forEach((listener) => listener());
    })
    .catch(() => undefined);
}

/**
 * A message as the listeners are told it, before it is kept: said to come twice when the chat took
 * it before, the history holds it, or it is a part of a voice message that came already (one that
 * went in part goes again whole, with every part). Null for what is no message.
 */
export function cameBefore({ history, voiceParts }: SpaceChats, received: Received): Extract<Received, { kind: 'message' }> | null {
  if (received.kind !== 'message') return null;
  const peer = `${CONTACT_PREFIX}${received.identity}`;
  const twice = received.twice || (!!received.tag && history.has(peer, received.tag)) || (!!received.voice && voiceParts.has(peer, received.voice));
  return { ...received, twice };
}

// Keeps what one message brought, as the chat's own handling does. Says whether anything changed.
// One that came already, from their account and again from one of their endpoints, or through the
// phone and again directly (docs/multi-device.md), is kept once, and said to have come once.
async function keep(chats: SpaceChats, received: Received, state: State, nostr = false, route?: Route, ofPlace = false): Promise<boolean> {
  const { e2e, history, voiceParts } = chats;
  const { receipts, answers } = state;
  if (received.kind === 'refused') return false;
  const peer = `${CONTACT_PREFIX}${received.identity}`;
  const { identity, tag, timer } = received;
  const at = Date.now();
  // One sent for later that a relay sent too soon shows at its time, and one that waited on a relay
  // shows when it was sent (lib/later.ts).
  const shows = cameAt(received.due, received.sent, at);
  const hidden = e2e.contacts().some((contact) => contact.identity === identity && contact.hide);
  // Their phone says it is open, or when it last was: the home screen shows it.
  let changed = received.added || received.timerChanged || received.shotsChanged || received.online > 0 || received.seen;
  const twice = received.twice || history.has(peer, tag);
  const add = async (message: Partial<Message>) => {
    if (twice) return;
    // One sent without sound that waits for its time keeps it, for its notice then (lib/background.ts).
    await history.add({ peer, text: '', mine: false, at: shows, tag: tag || newTag(), lasts: timer, ...(received.quiet && shows > at ? { quiet: true } : {}), ...(received.re ? { re: received.re } : {}), ...contentOf(received.more), ...(nostr ? { nostr: true } : route ? { route } : {}), ...message });
    // A message request hears nothing back, not even that its message came, until accepted.
    if (tag && !received.request) {
      if (hidden) await e2e.hold(identity, 'got', [tag]);
      else receipts[peer] = [...(receipts[peer] ?? []), tag];
    }
    changed = true;
  };
  // While the app is away, one who asks is told only when the space was last open, should it have
  // been open since they were last told (lib/last-seen.ts): once, not each time they ask.
  if (received.ask && !received.request && !hidden && (answersAsk(e2e.toldAt(identity), at) || (!appShown() && e2e.seenNews(identity)))) answers.add(peer);
  // A voice message's parts are put together while the history does not hold it, those that came
  // before too: sealed again after only some of it went, its parts are those of the first try
  // (lib/voice.ts voiceIdOf). Kept once whole, unless every part came before, as of one that left
  // the history since.
  if (received.voice && !(tag && history.has(peer, tag))) {
    const whole = voiceParts.add(peer, received.voice);
    if (whole && !twice) await add({ voice: await saveClip(whole.audio, whole.ms) });
  }
  if (received.file) await add({ file: offerRef(received.file) });
  // Imported chats a contact shared: kept with the next round of shares (lib/share-rounds.ts), as
  // what they say of a share's rounds is taken in then.
  if (received.file?.history && !twice) await packCame(chats, identity, tag).catch(() => undefined);
  if (received.more.rounds && !received.twice) await roundsCame(chats, identity, received.more.rounds).catch(() => undefined);
  if (received.more.taking && !received.twice) await takingCame(chats, identity, received.more.taking).catch(() => undefined);
  if (received.text) await add({ text: received.text });
  if (received.got.length > 0 && (await history.mark(peer, true, 1, at, received.got)).length > 0) changed = true;
  if (received.read.length > 0 && (await history.mark(peer, true, 2, at, received.read)).length > 0) changed = true;
  if (received.react && (await history.react(peer, received.react.tag, false, received.react.emoji))) changed = true;
  const { pin, vote, edit, close } = received.more;
  if (pin && (await history.pin(peer, pin.tag, pin.on ? at : 0))) changed = true;
  if (vote && (await history.vote(peer, vote.tag, false, vote.chose))) changed = true;
  // They ended one of their polls: it takes no more votes.
  if (close && (await history.close(peer, close.tag, false, at))) changed = true;
  // New words for one of theirs: only their own changes, and it shows as edited.
  if (edit && (await history.edit(peer, edit.tag, false, edit.text, at))) changed = true;
  // They paid one of our payment requests (lib/pay.ts), as they marked it: once.
  if (received.more.settled && (await history.paid(peer, received.more.settled.tag, false, at))) changed = true;
  // An invite to their relay: kept for the chat, which takes it by itself when it opens (lib/relay-offer.ts).
  // Never from a hidden place's contact: the offer is kept in the space's settings, and taking it
  // would put the space on a relay its hidden contact chose, which ties the two together.
  const offer = twice || ofPlace ? null : offerOf(received);
  if (offer) await keepOffer(offer).catch(() => undefined);
  // A step of an introduction (lib/intros.ts): kept, answered by what follows, the contact it gives added.
  if (received.more.intro && !twice) {
    const place = state.place;
    const send = (m: IntroSend) => tell(chats, place, m.to, { more: m.more }, state.near);
    await takeIntro(e2e, identity, received.more.intro, received.request, send, place?.queue.senderHex ?? '', place?.here ?? { relay: '', relayKey: '' }).catch(() => undefined);
    changed = true;
  }
  // A piece of a contact's backup password, to keep for them, or one of ours given back (lib/pieces-kept.ts).
  if (received.more.piece && !twice) await keepPieceFrom(e2e, identity, received.more.piece, received.request).catch(() => null);
  if (received.erase && 'all' in received.erase) {
    await history.clear(peer);
    changed = true;
  } else if (received.erase) {
    await history.remove(peer, received.erase.tag);
    changed = true;
  }
  return changed;
}

/** Keeps what one message brought as the receiver does, in chats with their own run of looks (`state`): a hidden place's; `nostr` when it came there. Says whether anything changed. */
export function keepWith(chats: SpaceChats, received: Received, state: ReceiveState, nostr = false, route?: Route): Promise<boolean> {
  return keep(chats, received, state, nostr, route, true);
}

/** Keeps what one message brought as the receiver does, with what is to be said back (`receipts`), as the checks do. */
export function keepReceived(chats: SpaceChats, received: Received, receipts: Record<string, string[]> = {}): Promise<boolean> {
  return keep(chats, received, { place: null, seen: -1, receipts, answers: new Set(), waited: false, failures: 0 });
}

// Seals word for a contact and hands it to their phone nearby when it is, and to the relay, after
// the first packet of the conversation if the relay has not taken that yet (lib/nearby.ts): quiet,
// as it is no message (lib/relay.ts, Mark), and then its copies for the endpoints of their
// account, also once the relay could take it only later, as it is said again with the next look.
// With no `place`, it says nothing of where this phone's queue is, and goes nearby only. `near`: a
// hidden place's, whose contact this is (lib/nearby.ts NearHeard).
export async function tell({ e2e }: SpaceChats, place: Place | null, identity: string, extra: Extra, near: NearHeard | null = null) {
  const sealed = await e2e.seal(identity, '', place?.queue.senderHex ?? '', { ...extra, at: place?.here ?? { relay: '', relayKey: '' } });
  // With no relay between the two, through Nostr when they read there (lib/nostr-chats.ts).
  const relay = place && sealed.sender ? () => sendSealed(place.sends, sealed, [sealed.packet], 'quiet', () => e2e.firstSent(identity)) : nostrOnlyWay(e2e, identity, sealed, [sealed.packet]);
  await e2e.copiesAfter(sealed.copies, nearby.deliver(identity, sealed.first ? [sealed.first, sealed.packet] : [sealed.packet], relay, null, false, near), true);
}

/** How long, at most, telling a contact that the app opened waits: a random time for each, so they do not all go at once. */
export const OPEN_SPREAD = 60_000;

/**
 * While the app shows, the contacts due to hear that it opened (E2E.openDue, Say when I open
 * Erevos) join `answers` each after a random wait up to OPEN_SPREAD, so they are told with the
 * next look, as one who asked would be, with "last seen" in it. Gone from the screen meanwhile, a
 * contact is told nothing.
 */
export function tellOpenLater(e2e: E2E, answers: Set<string>): void {
  if (!shows) return;
  for (const identity of e2e.openDue()) {
    const wait = new DataView(randomBytes(4).buffer).getUint32(0) % OPEN_SPREAD;
    setTimeout(() => {
      if (shows) answers.add(`${CONTACT_PREFIX}${identity}`);
    }, wait);
  }
}

// Tells contacts' phones which of their messages came, and, while the app shows, that this phone
// is open, as the ones who asked wait to hear. What the relay cannot take now is told with the
// next look.
export async function sendReceipts(chats: SpaceChats, place: Place | null, { receipts, answers, near }: State) {
  tellOpenLater(chats.e2e, answers);
  // What was read in a chat and its screen did not get to say (E2E.hold) is said here: any message does.
  const due = chats.e2e.readDue().map((identity) => `${CONTACT_PREFIX}${identity}`);
  for (const peer of new Set([...Object.keys(receipts), ...answers, ...due])) {
    const got = receipts[peer] ?? [];
    delete receipts[peer];
    answers.delete(peer);
    const identity = peer.slice(CONTACT_PREFIX.length);
    // A contact deleted meanwhile is told nothing.
    if (!chats.e2e.contacts().some((contact) => contact.identity === identity)) continue;
    const held = chats.e2e.heldRead(identity);
    try {
      await tell(chats, place, identity, { got, on: shows && chats.e2e.showsNow() ? ONLINE : 0 }, near);
    } catch {
      // Sealed, it is no longer kept: kept again, for the next look.
      if (held.length > 0) await chats.e2e.hold(identity, 'read', held).catch(() => undefined);
      if (got.length > 0) receipts[peer] = [...got, ...(receipts[peer] ?? [])];
    }
  }
}

// With no relay: what goes through Nostr to contacts it is the only way to (lib/nostr-chats.ts),
// with each look: what waited, the keys, and what is due there again. Says whether what the home
// screen shows changed.
async function nostrLook(state: State): Promise<boolean> {
  if (!nostrReady()) return false;
  const chats = await spaceChats();
  await sendKeys(chats, null);
  await sendNostrAgain(chats.e2e);
  const went = await sendWaiting(chats, sendPlace(null, false)).catch(() => []);
  await sendReceipts(chats, null, withNearby(state));
  return went.length > 0;
}

// This chat's newest prekeys, to the contacts who have not had them (lib/e2e.ts keysDue). What
// cannot go now goes with the next look.
export async function sendKeys(chats: SpaceChats, place: Place | null, near: NearHeard | null = null) {
  for (const identity of chats.e2e.keysDue()) {
    try {
      await tell(chats, place, identity, { keys: true }, near);
      await chats.e2e.keysGiven(identity);
    } catch {
      // Tried again with the next look.
    }
  }
}

// The first packets of conversations started here that the relay has not taken yet.
export async function sendPending({ e2e }: SpaceChats, sends: Relay) {
  for (const { identity, sender, relay, relayKey: key, first } of e2e.pending()) {
    try {
      await sendMessage(contactTarget(sends, { relay, relayKey: key }), fromHex(sender), first, 'quiet');
      await e2e.firstSent(identity);
    } catch {
      // Tried again with the next look.
    }
  }
}
