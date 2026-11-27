// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { DOOR_CONTACTS, DOOR_QUEUES, doorCame, hearDoor, hearDoorAll, loadDoor, openDoors, saveDoor, type Door } from '../lock/doors';
import { loadE2EData } from '../lock/e2e-data';
import { loadMatrix } from '../lock/matrix-data';
import { heardOf, type Watched } from '../lock/hidden-watch';
import { currentSpace } from '../lock/keys';
import { spaceQueues } from '../lock/queues-data';
import { loadSpaceData } from '../lock/space-data';
import { loadXmpp } from '../lock/xmpp-data';
import { bunches, contactQueuesAt, type Bunch } from './contact-queues';
import { t } from './i18n';
import { onNetworkChange } from './network-change';
import { canReadManyAt, canTellNewsAt, canWaitAt, fromHex, isQueueNotFound, newsOfAny, newsSince, NO_NEWS, relayStopped, sameRelay, SpaceStoppedError, torFor, waitForNews, type News, type Relay } from './relay';

// While a space is open, the other spaces that asked for it say how many messages came to them,
// with the same notice as the open space's chats ("New message", "3 new messages"), never which
// space: the relay is asked to wait until what came into each queue of their doors (lock/doors.ts)
// changes, without taking it, as for hidden chats (lib/hidden-notices.ts). The relay counts what
// came by what each send said it carries: messages, calls and sends that did not say are told of;
// word between phones, as that a message came or was read, is not. What came is told of once, as
// what the relay said is kept with the door; what came while that space was open was read there,
// and is heard as it is when it closes (keepDoor). A space that goes through Tor is waited on only
// through Tor, while the open space has it ready. A space's door is written anew each time it opens,
// its own queue moves, its contacts' queues change, and it closes, so it names the queues it reads
// on. Its contacts' queues (lib/contact-queues.ts) are asked of together, as the open space reads
// them: on the relay's `/read` path with no token, through Tor in the same groups, each on a way of
// its own, so the relay sees them asked of as it sees them read, and no more together.

const WAIT_FOR = 60;
const MOST_PAUSE = 60_000;
const NO_WAITING = 5 * 60_000;

const sameNews = (a: News, b: News) => a.round === b.round && a.messages === b.messages && a.unmarked === b.unmarked && a.rings === b.rings;

const relayOf = (door: Door, kept: Watched): Relay => ({ url: kept.url, token: kept.token || undefined, ...(door.tor !== 'off' ? { torOnly: true } : {}) });

// Where a closed space's contacts' queues are asked of: its relay, with no token (lib/relay.ts readerOf drops it anyway).
const contactsRelayOf = (door: Door): Relay => ({ url: door.contacts?.url ?? '', ...(door.tor !== 'off' ? { torOnly: true } : {}) });

/** How a closed space's contacts' queues are asked of: in the groups it reads them in, each through Tor on a way of its own, named for that space; without Tor all at once. */
export function doorBunches(space: number, door: Door): Bunch[] {
  if (!door.contacts) return [];
  return bunches(
    door.contacts.queues.map((q) => ({ identity: '', r: q.r, g: q.g })),
    `door-${space}`,
    door.tor !== 'off',
  );
}

/** The group a space's Matrix push queue (lib/matrix-push.ts) is read in, through Tor on a way of its own: no contact's group is ever so high. */
export const MATRIX_PUSH_GROUP = 1_000_000;
/** The group a space's XMPP push queue (lib/xmpp-push.ts) is read in, as the Matrix one: a way of its own. */
export const XMPP_PUSH_GROUP = 1_000_001;

type OwnQueue = { queue: { recipientHex: string }; url: string; token: string };

// The space's own queue as it reads on it now: where its last move put it, else its settings'.
function ownOf(data: Awaited<ReturnType<typeof loadSpaceData>>, queues: Awaited<ReturnType<ReturnType<typeof spaceQueues>['load']>>): OwnQueue | null {
  return queues.now ?? (data.ownQueue && data.url.trim() ? { queue: data.ownQueue, url: data.url.trim(), token: data.token.trim() } : null);
}

/** The relay the space `space` reads at now, with its token: where its contacts write, and its Matrix account is pushed. Null with no queue yet. */
export async function spaceRelayOf(space: number, key: Uint8Array): Promise<Relay | null> {
  const [data, queues] = await Promise.all([loadSpaceData(space, key), spaceQueues(space, key).load()]);
  const own = ownOf(data, queues);
  return own ? { url: own.url, token: own.token || undefined } : null;
}

/** The door of the space `space` opens with `key`: its queues as it reads on them now, its contacts' queues at its relay (`most` at most), its Matrix and XMPP push queues there first, and its Tor way. Null with no queue yet. */
export async function doorOf(space: number, key: Uint8Array, most = DOOR_CONTACTS): Promise<Door | null> {
  const [data, queues, chats, matrix, xmpp] = await Promise.all([
    loadSpaceData(space, key),
    spaceQueues(space, key).load(),
    loadE2EData('space', space, key).catch(() => null),
    loadMatrix(space, key).then(
      (account) => ({ push: account?.push }),
      () => null,
    ),
    loadXmpp(space, key).then(
      (account) => ({ push: account?.push }),
      () => null,
    ),
  ]);
  const own = ownOf(data, queues);
  const kept: Watched[] = [];
  for (const one of [own, queues.link, queues.group, queues.public]) {
    if (!one || kept.some((k) => k.recipientHex === one.queue.recipientHex)) continue;
    kept.push({ url: one.url, token: one.token, recipientHex: one.queue.recipientHex });
  }
  if (kept.length === 0) return null;
  if (!chats || !matrix || !xmpp) {
    // The chats or the Matrix account could not be read just now, as a save ran meanwhile
    // (lock/sealed-file.ts): the contacts' queues the door names stay as they are, rather than be
    // left out until the next change.
    const was = await loadDoor(space).catch(() => null);
    return { tor: data.tor, queues: kept.slice(0, DOOR_QUEUES), ...(was?.contacts ? { contacts: was.contacts } : {}), ...(data.sign ? { sign: true as const } : {}) };
  }
  // The Matrix and XMPP push queues, at the same relay, first: the contacts' queues where the space reads them,
  // its own queue's relay, then: theirs now first, then those they took the place of, still read for a while.
  const contacts: { r: string; g: number }[] = [];
  if (own && matrix.push && sameRelay(matrix.push.url, own.url)) contacts.push({ r: matrix.push.recipientHex, g: MATRIX_PUSH_GROUP });
  if (own && xmpp.push && sameRelay(xmpp.push.url, own.url)) contacts.push({ r: xmpp.push.recipientHex, g: XMPP_PUSH_GROUP });
  const mines = chats.contacts.flatMap((c) => (c.mine ? [{ identity: c.identity, mine: c.mine }] : []));
  const at = own ? contactQueuesAt(mines, own.url) : [];
  for (const q of [...at.filter((q) => !q.was), ...at.filter((q) => q.was)]) {
    if (contacts.length >= most) break;
    if (!contacts.some((c) => c.r === q.r) && !kept.some((k) => k.recipientHex === q.r)) contacts.push({ r: q.r, g: q.g });
  }
  return {
    tor: data.tor,
    queues: kept.slice(0, DOOR_QUEUES),
    ...(own && contacts.length > 0 ? { contacts: { url: own.url, queues: contacts } } : {}),
    ...(data.sign ? { sign: true as const } : {}),
  };
}

// The queues a door names, to tell whether it changed: its own and its contacts', and whether it asks for the dot.
const namesOf = (door: Door | null) =>
  door ? [...door.queues.map((q) => `${q.url} ${q.recipientHex}`), ...(door.contacts?.queues ?? []).map((q) => `${door.contacts!.url} ${q.r} ${q.g}`), door.tor, door.sign ? 'sign' : ''].join(',') : '';

/** Writes the open space's door anew if the queues it names changed, as a contact took a queue of their own: when its door is open. */
export async function followDoor(space: number, key: Uint8Array): Promise<void> {
  const was = await loadDoor(space);
  if (!was) return;
  const door = await doorOf(space, key);
  if (namesOf(door) !== namesOf(was)) await saveDoor(space, door, true, true);
}

/**
 * Writes the space's door anew, when it is open: with the queues it reads on now, all heard anew,
 * and, as it closes (`closing`), what came into each so far, read while it was open, as heard.
 */
export async function keepDoor(space: number, key: Uint8Array, closing = false): Promise<void> {
  if (!(await loadDoor(space))) return;
  const door = await doorOf(space, key);
  await saveDoor(space, door, true, true);
  if (!closing || !door) return;
  for (const kept of door.queues) {
    const relay = relayOf(door, kept);
    if (!canWaitAt(relay) || !canTellNewsAt(relay)) continue;
    const now = await waitForNews(relay, fromHex(kept.recipientHex), 0, NO_NEWS).catch(() => null);
    if (now) await hearDoor(space, kept.recipientHex, now).catch(() => undefined);
  }
  const relay = contactsRelayOf(door);
  if (!door.contacts || !canReadManyAt(relay)) return;
  for (const bunch of doorBunches(space, door)) {
    const now = await newsOfAny(relay, bunch.queues.map((q) => ({ recipient: fromHex(q.r), heard: NO_NEWS })), 0, bunch.way).catch(() => null);
    if (!now) continue;
    await hearDoorAll(space, bunch.queues.flatMap((q, i) => (now[i] ? [{ recipientHex: q.r, news: now[i]! }] : []))).catch(() => undefined);
  }
}

/** Whether the open space says a message came while another is open. */
export async function doorIsOpen(): Promise<boolean> {
  return (await loadDoor(currentSpace().space)) !== null;
}

/** Lets the open space say a message came while another is open, or no more. Throws when it has no relay queue yet. */
export async function setDoorOpen(on: boolean): Promise<void> {
  const { space, key } = currentSpace();
  if (!on) return saveDoor(space, null);
  if (relayStopped()) throw new SpaceStoppedError();
  const door = await doorOf(space, key);
  if (!door) throw new Error(t('This space has no queue at a server yet: it can say nothing while closed.'));
  await saveDoor(space, door, true);
}

/**
 * Starts waiting for the closed spaces that asked for it; `tell(count, space)` says that many
 * messages came there. Returns how to stop. With `none`, no space is open (Erevos started by itself
 * as the phone turned on, lib/background.ts startBootNotices): every space that asked is waited on.
 */
export function startClosedNotices(tell: (count: number, space: number) => void, none = false): () => void {
  let open = -1;
  if (!none) {
    try {
      open = currentSpace().space;
    } catch {
      return () => undefined;
    }
  }
  let stopped = false;
  const heard = new Map<string, News>();
  const waits = new Set<AbortController>();
  const wakers = new Set<() => void>();
  const pause = (ms: number) =>
    new Promise<void>((done) => {
      const timer = setTimeout(() => {
        wakers.delete(up);
        done();
      }, ms);
      const up = () => {
        clearTimeout(timer);
        wakers.delete(up);
        done();
      };
      wakers.add(up);
    });

  async function watch(space: number, index: number) {
    let failures = 0;
    while (!stopped) {
      const door = await loadDoor(space).catch(() => null);
      const kept = door?.queues[index];
      // Shut, or no such queue: nothing is waited on for it until that space opens again.
      if (!door || !kept) return;
      const relay = relayOf(door, kept);
      if (!canWaitAt(relay) || !canTellNewsAt(relay)) {
        await pause(NO_WAITING);
        continue;
      }
      if (relay.torOnly && !torFor(false)) {
        await pause(MOST_PAUSE);
        continue;
      }
      const wait = new AbortController();
      waits.add(wait);
      try {
        const before = heard.get(kept.recipientHex) ?? heardOf(kept);
        const now = await waitForNews(relay, fromHex(kept.recipientHex), WAIT_FOR, before ?? NO_NEWS, wait.signal);
        failures = 0;
        if (!now) continue;
        if (stopped || (before && sameNews(before, now))) continue;
        heard.set(kept.recipientHex, now);
        await hearDoor(space, kept.recipientHex, now).catch(() => undefined);
        const came = newsSince(before, now);
        const count = came.messages + came.unmarked + came.rings;
        if (count > 0) await doorCame(space).catch(() => undefined);
        if (count > 0 && !stopped) tell(count, space);
      } catch (error) {
        // A queue the relay no longer has: the space reads elsewhere now, and its door says where once it opens.
        if (isQueueNotFound(error)) return;
        failures++;
        await pause(Math.min(MOST_PAUSE, 5_000 * 2 ** failures));
      } finally {
        waits.delete(wait);
      }
    }
  }

  // A closed space's contacts' queues, one group of them (`way`, lib/contact-queues.ts bunches) held
  // at the relay until what came into one of them changes, as watch does for one queue.
  async function watchContacts(space: number, way: string) {
    let failures = 0;
    // Queues the relay said it no longer has: their contacts were deleted, or took another, while that space was closed.
    const gone = new Set<string>();
    while (!stopped) {
      const door = await loadDoor(space).catch(() => null);
      const bunch = door ? doorBunches(space, door).find((b) => b.way === way) : undefined;
      // Shut, or that group no longer: nothing is waited on for it until that space opens again.
      if (!door || !bunch) return;
      const asked = bunch.queues.filter((q) => !gone.has(q.r));
      if (asked.length === 0) return;
      const relay = contactsRelayOf(door);
      if (!canReadManyAt(relay)) {
        await pause(NO_WAITING);
        continue;
      }
      if (relay.torOnly && !torFor(false)) {
        await pause(MOST_PAUSE);
        continue;
      }
      const kept = new Map((door.contacts?.queues ?? []).map((q) => [q.r, q]));
      const before = asked.map((q) => heard.get(q.r) ?? heardOf(kept.get(q.r) ?? {}));
      const wait = new AbortController();
      waits.add(wait);
      try {
        const now = await newsOfAny(relay, asked.map((q, i) => ({ recipient: fromHex(q.r), heard: before[i] ?? NO_NEWS })), WAIT_FOR, way, wait.signal);
        failures = 0;
        if (stopped) return;
        // The relay cannot, as one from before (lib/relay.ts canReadManyAt): asked again after a while.
        if (!now) {
          await pause(NO_WAITING);
          continue;
        }
        let count = 0;
        const changed: { recipientHex: string; news: News }[] = [];
        asked.forEach((q, i) => {
          const news = now[i];
          if (news === null) {
            gone.add(q.r);
            return;
          }
          if (before[i] && sameNews(before[i]!, news)) return;
          heard.set(q.r, news);
          changed.push({ recipientHex: q.r, news });
          const came = newsSince(before[i], news);
          count += came.messages + came.unmarked + came.rings;
        });
        await hearDoorAll(space, changed).catch(() => undefined);
        if (count > 0) await doorCame(space).catch(() => undefined);
        if (count > 0 && !stopped) tell(count, space);
      } catch {
        failures++;
        await pause(Math.min(MOST_PAUSE, 5_000 * 2 ** failures));
      } finally {
        waits.delete(wait);
      }
    }
  }

  void openDoors(open)
    .then((doors) => {
      for (const { space, door } of doors) {
        for (let index = 0; index < door.queues.length; index++) if (!stopped) void watch(space, index);
        for (const bunch of doorBunches(space, door)) if (!stopped) void watchContacts(space, bunch.way);
      }
    })
    .catch(() => undefined);

  // The phone's network changed: a wait on the network gone ends as heard, and each asks again at
  // once, those paused too (lib/network-change.ts).
  const network = onNetworkChange(() => {
    waits.forEach((wait) => wait.abort());
    [...wakers].forEach((up) => up());
  });

  return () => {
    stopped = true;
    network();
    waits.forEach((wait) => wait.abort());
    [...wakers].forEach((up) => up());
    wakers.clear();
  };
}
