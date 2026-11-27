// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { MAX_READY, type Ready } from '../lock/e2e-data';
import { currentSpace } from '../lock/keys';
import { spaceQueues, type KeptQueue, type LostStep, type MoveReason, type OldQueue, type QueueKind, type QueuesData, type QueuesStore } from '../lock/queues-data';
import { lostMark } from '../lock/restored';
import type { Queue, SpaceData } from '../lock/space-data';
import { bunches, contactQueuesAt, ContactWatch, type ContactQueue } from './contact-queues';
import { packetKind } from './core';
import type { E2E, Received } from './e2e';
import { isGroupPacket } from './groups';
import { locale, t } from './i18n';
import { FIRST_QA, GRACE, HEAL_EVERY, JUNK_AGAIN, JUNK_BATCH, JunkMeter, QUEUE_JITTER, QUEUE_OFFSET, graceOver, junkStep, newOffset, queueAge, randomHours, withOld, type Look } from './moves';
import { createQueue, deleteQueue, fromHex, isQueueNotFound, readsManyAt, receiveMessage, receiveOnRead, sameRelay, toHex, waitForAny, type Relay } from './relay';
import { lookNow } from './look-now';
import { isSealedPacket } from './sealed-packet';
import { joinSpaceChats, type SpaceChats } from './space-chats';
import { forgetSpare, homeRelays, readySpare, spareSaid, spaceSpare, type SpareStore } from './spare';

// A space's own relay queue, or a hidden place's, moves to a new one when a contact is deleted or
// blocked there, when junk fills it, and when the relay lost it or another relay is set: so the one
// deleted or blocked, or whoever sent the junk, can no longer write to it (docs/threat-model.md).
// On the same relay, with the space's token and Tor setting. The own queue's sender id is in no
// link and no group: only in the `from` of each message (lib/e2e.ts), with when it was made (`qa`,
// lib/moves.ts queueAge), so each kept contact is told the new one in a quiet message with nothing
// in it, again 7, 14 and 21 days later while not heard on it, and at once when heard on an old one.
//
// The contact link names a queue of its own (`link`), which a delete or block leaves alone: the
// first move makes the own queue as it was the link's, so every link and QR code given before
// keeps working. It moves only for junk on it, or New contact link. The space's groups say a queue
// of their own (`group`, lib/space-groups.ts), and its public groups another (`public`), each made
// with the first look of this version, used or not, so every space shows the same set. A hidden
// place has neither, as it has no groups. Each queue moved away from is read cheaply for GRACE
// (lib/e2e.ts receive with `old`), or until every kept contact was heard on a later one, then
// emptied and deleted; a group's once no group says it. All of it is kept in the queues entry
// (lock/queues-data.ts); what is kept of each contact, with the contact (lock/e2e-data.ts).
//
// Each look of the chat screen, or of the receiver beside the other screens (lib/receiver.ts),
// hands this what it found on the own queue, then this reads the others: the groups' with every
// look, the rest every READ_EVERY while the app shows, and with every look in the background, but
// for those a wait at the relay found nothing come to (lib/receiver.ts awayQueues). The
// link's, the groups' and the public groups' are read a whole batch at a time (JUNK_BATCH), as the
// own queue is, so junk on them is counted the same way.
//
// Once the phone a backup came from was said lost (lock/restored.ts lostMark), a space or place
// that backup put back here moves every queue that phone knows, once, with its next look (lostNow):
// each contact's own one, a few with each look, the own one with its backup queues, its ring queue,
// its watch slot and its devices' places, the contact link's, whose links and QR codes given before
// work for GRACE, and the groups' and public groups'. Kept contacts are told as for any move; the
// old ones are read until each contact was heard on a new one, or their grace ends.

const READ_EVERY = 10;
// Packets taken from an old queue in one look, at most, and of them first packets (requests,
// contact asks) and group packets; the rest are dropped unopened.
const READ_MOST = 20;
const OLD_FIRSTS = 3;
const LINK_FIRSTS = 5;
const OLD_GROUPS = 10;
// An old queue is emptied before it is deleted: the relay holds this many at most (MAX_QUEUED).
const DRAIN_MOST = 1000;
// Kept contacts told in one look, at most, and how long one that could not be told waits.
const TELLS_EACH = 20;
const TELL_RETRY = 60_000;
// How often the groups are asked which queues they say.
const NAMED_EVERY = 60 * 60_000;
// Contact queues (lib/contact-queues.ts): made ahead in one look at most, and deleted in one look at most.
const FILL_EACH = 4;
const DELETES_EACH = 10;

/** What one packet that came to a queue was: junk (lib/moves.ts) or not, and the kept contact it came from, if it came from one. */
export type Took = { junk: boolean; from?: string };

/** Takes one packet from one of the queues, as the look takes one from the own queue: `old` for any but the own, read cheaply. */
export type Take = (bytes: Uint8Array, kind: QueueKind | 'old') => Promise<Took>;

/** What a packet the chat opened (or refused) is to the junk meter: not junk when it opened, when it
 *  was a kept contact's though it opened in none of their conversations, a replay, or a word between
 *  this account's devices. */
export function tookOf(received: Received): Took {
  if (received.kind === 'message') return { junk: false, ...(received.request ? {} : { from: received.identity }) };
  return { junk: !received.theirs && (received.reason === 'unknown' || received.reason === 'plain' || received.reason === 'blocked') };
}

/** The space's groups, as a move needs them. */
export type MoveGroups = {
  /** Has each private group (`group`), or each public one, say where this phone reads now, as it renews its keys there (lib/groups.ts); `members`, only those it is not the admin of. */
  renewAgain(kind: 'group' | 'public', members?: boolean): Promise<void>;
  /** The queues the groups say this phone reads on, in its own leaf, by sender id. */
  named(): Promise<Set<string>>;
  /** The kinds whose queues are made: both, unless said (a hidden place has no public groups). */
  kinds?: readonly ('group' | 'public')[];
};

/** Where a move happens: the space, or a hidden place. */
export type MoveAt = {
  e2e: E2E;
  queues: QueuesStore;
  /** Its settings (SpaceData), the own queue among them, and its backup relay (lib/spare.ts). */
  data: SpareStore;
  /** Its groups (lib/space-groups.ts, lib/place-groups.ts). */
  groups?: MoveGroups;
  /** The web app's push address for a queue made, and none for one left (lib/web-push.web.ts). `add`: for contacts'
   *  queues made ahead (recipient ids in hex); a deleted one's goes with it at the relay. */
  push?: { keep(own: Relay, queue: Queue): Promise<void>; drop(own: Relay, queue: Queue): Promise<void>; add?(own: Relay, queues: string[]): Promise<void> };
  /** What moves with the own queue besides, and why it moved: a hidden place's watch slot, a phone's linked devices. */
  moved?: (queue: Queue, old: Queue | null, why: MoveWhy) => Promise<void>;
  /** A hidden place's: moves its ring queue, if it rings (lib/hidden-ring.ts moveRingPocket). Says
   *  whether it did: false when it does not ring. Throws when the relay cannot be reached. */
  ring?: () => Promise<boolean>;
  /** The space's: its contacts take queues of their own (lib/contact-queues.ts), read on ways through Tor named from `way`, its own. None in a hidden place. */
  contacts?: { way: string };
};

/** One look, as the chat screen or the receiver made it. */
export type MoveLook = {
  /** The space's relay, straight, with its token: where queues are made, read and deleted. */
  own: Relay;
  /** What the look found on the own queue. */
  found: Look;
  take: Take;
  /** Tells a kept contact where this chat reads now: a quiet message with nothing in it. Throws when it did not go. */
  tell: (identity: string) => Promise<void>;
  /** Whether the app shows: the other queues are read less often then, unless the look waited at the relay on them (`waited`). */
  shows: boolean;
  /** The look waited at the relay, on the other queues too (lib/receiver.ts waitWhileAway): those not in `empty` are read. */
  waited?: boolean;
  stop?: () => boolean;
  /** The other queues a wait at the relay found nothing come to, by recipient id in hex (lib/receiver.ts awayQueues): not read. */
  empty?: string[];
  /** Takes one packet from a contact's own queue (`r`, its recipient id in hex), as `take` does from an old one. Without it, those are not read. */
  takeMine?: (bytes: Uint8Array, r: string) => Promise<Took>;
};

/** What a look did: the own queue it moved to, if it moved, and what to say. */
export type MoveNews = { queue: Queue | null; notes: string[] };

type Here = { url: string; token: string; tor?: boolean };
// Why the own queue moves: a deletion or block, junk on it, the relay lost it, or a new contact link.
type Why = MoveReason;

/** Why the own queue moved: a contact deleted or blocked (`due`), junk on it, the relay lost it, a new contact link, or it was made elsewhere (another relay, or by hand). */
export type MoveWhy = Why | 'elsewhere';

const same = (a: KeptQueue | null | undefined, queue: Queue) => !!a && a.queue.recipientHex === queue.recipientHex;
// The old queues once `old` is added, and those let go of early, kept to empty and delete (QueuesData.early).
const adding = (d: Pick<QueuesData, 'was' | 'early'>, old: OldQueue): Pick<QueuesData, 'was' | 'early'> => {
  const made = withOld(d.was, old);
  return { was: made.was, early: [...d.early.filter((e) => !made.early.some((m) => m.queue.recipientHex === e.queue.recipientHex)), ...made.early] };
};
// The `qa` of an own queue a move makes now.
const movedAge = (d: QueuesData, now: number) => queueAge(d.moved, now, d.offset, randomHours(QUEUE_JITTER));
const queueOf = (ids: { recipientId: Uint8Array; senderId: Uint8Array }): Queue => ({ recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) });
const relayOf = (k: Here): Relay => ({ url: k.url, token: k.token || undefined, ...(k.tor === true ? { tor: true } : {}) });

/** The queue the contact link names: the link's own, or the own queue while it is the link's. */
export function linkOf(queues: QueuesData, own: Queue): Queue {
  return queues.link?.queue ?? own;
}

/**
 * The sender ids the space's groups, and its public groups, say it reads on, on the relay at `url`
 * (lib/space-groups.ts): their own queues; until one is made, or again after the relay lost it, the
 * one the contact link names. Never the own queue once it moved: no group says that one.
 */
export function groupSenders(queues: QueuesData, own: Queue, url: string): { groupHex: string; publicHex: string } {
  const on = (kept: KeptQueue | null) => (kept && sameRelay(kept.url, url) ? kept.queue.senderHex : '');
  // The link's (linkOf): the own queue only while it is the link's, before the first move.
  const groupHex = on(queues.group) || on(queues.link) || own.senderHex;
  return { groupHex, publicHex: on(queues.public) || groupHex };
}

// Whether a packet starts a conversation: a request, or a contact's new one. A sealed one never does.
async function isFirst(bytes: Uint8Array): Promise<boolean> {
  if (isSealedPacket(bytes) || isGroupPacket(bytes)) return false;
  return (await packetKind(bytes).catch(() => 'none')) === 'first';
}

// Whether the own queue moving to `next` (`why`) is the first move, after which the one before is
// the one the contact link names: not for a new link, nor one the relay lost, nor one the phone
// lost knows, nor on a linked device, which names its queue in no link.
function firstMove(d: QueuesData, next: Queue, here: Here, why: Why, device: boolean): d is QueuesData & { now: KeptQueue } {
  return !d.link && !!d.now && !same(d.now, next) && why !== 'link' && why !== 'lost' && why !== 'phone' && !device && sameRelay(d.now.url, here.url);
}

// The queues once the own queue moved to `next` (`why`), at `now`: the one before goes with its
// grace, or, on the first move, stays the one the contact link names (set with `next`, before
// the move); one the relay lost goes. A linked device names its queue in no link (`device`): its
// old one only goes with its grace. One the phone lost knows, while it is the link's, goes as a
// link's: the links given before work for its grace, and from then on name the new one.
function finished(d: QueuesData, next: Queue, here: Here, why: Why, now: number, device = false): QueuesData {
  const moved = movedAge(d, now);
  const kept = { queue: next, ...here };
  const old = d.now;
  const done = { now: kept, next: null, nextWhy: undefined, moved };
  if (!old || same(old, next) || why === 'lost' || same(d.link, old.queue)) return { ...d, ...done };
  if (firstMove(d, next, here, why, device)) return { ...d, ...done, link: old };
  const link = why === 'link' || (why === 'phone' && !d.link && !device);
  const gone: OldQueue = link ? { ...old, kind: 'link', until: now + GRACE } : { ...old, kind: 'own', until: now + GRACE, by: moved };
  return { ...d, ...done, ...adding(d, gone), ...(link ? { linkAt: now, linkUntil: now + GRACE } : {}) };
}

// The queues once `step` of the move for the phone lost was made (QueueMove.lostNow).
const stepDone = (d: QueuesData, step: LostStep): QueuesData => (d.losing && !d.lostDone.includes(step) ? { ...d, lostDone: [...d.lostDone, step] } : d);

// An old own queue, or an old backup one, goes once every kept contact was heard on the own queue
// made at `moved` or a later one, if not sooner (lib/moves.ts graceOver).
const goesBy = (w: OldQueue, moved: number): OldQueue => ((w.kind === 'own' || w.kind === 'spare') && !(w.by !== undefined && w.by <= moved) ? { ...w, by: moved } : w);

// The queues once the own queue was made elsewhere: on another relay, where the link's and the
// groups' go with it, made anew there; or on the same relay by hand, as a move.
function elsewhere(d: QueuesData, own: Queue, here: Here, now: number, device = false): QueuesData {
  const moved = movedAge(d, now);
  const kept = { queue: own, ...here };
  const old = d.now!;
  let olds: Pick<QueuesData, 'was' | 'early'> = { was: d.was, early: d.early };
  const add = (k: KeptQueue | null, kind: QueueKind, by?: number) => {
    if (k) olds = adding(olds, { ...k, kind, until: now + GRACE, ...(by ? { by } : {}) });
  };
  if (!sameRelay(old.url, here.url)) {
    add(old, 'own', moved);
    add(d.link, 'link');
    add(d.group, 'group');
    add(d.public, 'public');
    return { ...d, now: kept, link: null, group: null, public: null, ...olds, next: null, moved };
  }
  if (!d.link && !device) return { ...d, now: kept, link: old, next: null, moved };
  add(old, 'own', moved);
  return { ...d, now: kept, ...olds, next: null, moved };
}

export class QueueMove {
  private readonly meter = new JunkMeter();
  private looks = 0;
  // When each kept contact heard on an old queue was last told the new one, and when a tell that
  // did not go may be tried again. Only in memory.
  private readonly healed = new Map<string, number>();
  private readonly failed = new Map<string, number>();
  private named: { at: number; senders: Set<string> | null } | null = null;
  // What the receiver's looks had to say, for the chat screen to say once it opens.
  private notes: string[] = [];
  private turn: Promise<unknown> = Promise.resolve();
  // The waits on the contacts' queues, while the space is open, and the looks that read them.
  private watch: ContactWatch | null = null;
  private contactLooks = 0;
  private stopped = false;
  // The contact queues let go of but kept a while (a chat moved into hidden chats) that the web
  // app's push address was taken from. Only in memory: once each time the space opens.
  private readonly unpushed = new Set<string>();

  private readonly at: MoveAt;

  constructor(at: MoveAt) {
    this.at = at;
  }

  private run<T>(call: () => Promise<T>): Promise<T> {
    const next = this.turn.catch(() => undefined).then(call);
    this.turn = next;
    return next;
  }

  /** Stops the waits on the contacts' queues, for good: the space closed. */
  stop(): void {
    this.stopped = true;
    this.watch?.stop();
    this.watch = null;
  }

  /**
   * Deletes at once the queues of a contact just deleted or blocked, not with the next look: nothing
   * of theirs comes to them meanwhile, nor wakes the closed web app.
   */
  dropGone(own: Relay): Promise<void> {
    if (!this.at.contacts || this.at.e2e.onLinkedDevice()) return Promise.resolve();
    return this.run(() => this.deleteGone(own, own.url, Date.now()));
  }

  /** The queues as kept. */
  queues(): Promise<QueuesData> {
    return this.at.queues.load();
  }

  /** Keeps what a look had to say while no screen could, to be said later (`said`). */
  hold(notes: string[]): void {
    this.notes = [...this.notes, ...notes].slice(-4);
  }

  /** What was kept to say, once. */
  said(): string[] {
    const notes = this.notes;
    this.notes = [];
    return notes;
  }

  /** One look: what it found on the own queue counted, a move made if one is due, kept contacts told, the other queues read. */
  look(look: MoveLook): Promise<MoveNews> {
    return this.run(() => this.lookNow(look));
  }

  /** A phone nearby read the own queue for this phone (lib/bridge.ts): it moves with the next look that reaches the relay. */
  bridged(now = Date.now()): Promise<void> {
    return this.at.queues.update((d) => ({ ...d, bridged: now })).then(() => undefined);
  }

  /** The relay no longer has the own queue: a new one, which kept contacts are told. Null when it cannot be made now. */
  lost(own: Relay): Promise<Queue | null> {
    return this.run(async () => {
      const space = await this.at.data.load();
      const url = space.url.trim();
      if (!url) return null;
      const started = Date.now();
      const ids = await createQueue(own).catch(() => null);
      return ids ? this.settle(queueOf(ids), { url, token: space.token.trim() }, 'lost', started, own) : null;
    });
  }

  /**
   * A deletion or block just made: the move now, rather than with the next look. Says the own
   * queue it moved to and the queue the contact link names after it, or null with none due; throws
   * when the relay cannot be reached.
   */
  moveNow(own: Relay): Promise<{ queue: Queue; link: Queue } | null> {
    return this.run(async () => {
      if (this.at.e2e.moveDue() <= 0) return null;
      const space = await this.at.data.load();
      const url = space.url.trim();
      if (!url || !space.ownQueue) return null;
      const here = { url, token: space.token.trim() };
      await this.reconcile(space, here, own);
      const started = Date.now();
      const ids = await createQueue(own);
      const queue = await this.settle(queueOf(ids), here, 'due', started, own);
      return { queue, link: linkOf(await this.at.queues.load(), queue) };
    });
  }

  /**
   * A new contact link: the queue the link names moves, and the one before is read until its grace
   * ends, so the links and QR codes given before work until then. While the own queue is the link's,
   * it moves itself, and kept contacts are told. Says until when the ones before work, and the own
   * queue it moved to, if it did; throws when the relay cannot be reached.
   */
  newLink(own: Relay): Promise<{ until: number; queue: Queue | null }> {
    return this.run(async () => {
      const space = await this.at.data.load();
      const url = space.url.trim();
      if (!url || !space.ownQueue) throw new Error(t('Create your server queue first, on New chat.'));
      const here = { url, token: space.token.trim() };
      const { q } = await this.reconcile(space, here, own);
      const started = Date.now();
      const ids = await createQueue(own);
      if (!q.link) return { until: started + GRACE, queue: await this.settle(queueOf(ids), here, 'link', started, own) };
      await this.linkTo(queueOf(ids), here, started);
      return { until: started + GRACE, queue: null };
    });
  }

  /**
   * Moves a hidden place's ring queue (MoveAt.ring), as rings that brought no call call for: at
   * once, or, when the relay cannot be reached, with each look until it can. Kept contacts are told
   * the new one with the next tells. Says whether it moved now.
   */
  ringMove(): Promise<boolean> {
    return this.run(() => this.ringNow());
  }

  private async ringNow(): Promise<boolean> {
    if (!this.at.ring) return false;
    await this.at.queues.update((d) => (d.ringDue ? d : { ...d, ringDue: true }));
    let moved: boolean;
    try {
      moved = await this.at.ring();
    } catch {
      return false;
    }
    await this.at.queues.update((d) => ({ ...d, ringDue: false, rings: [] }));
    if (moved) await this.at.e2e.ringMoved();
    return moved;
  }

  // What the chats say from now on of the own queue: when it was made, which it is, and whether the
  // contact link names it.
  private say(q: QueuesData) {
    this.at.e2e.setQueueAge(q.moved, q.now?.queue.senderHex);
    this.at.e2e.setLinkOwn(!q.link);
  }

  private async lookNow(look: MoveLook): Promise<MoveNews> {
    const notes: string[] = [];
    const now = Date.now();
    const space = await this.at.data.load();
    const url = space.url.trim();
    if (!url || !space.ownQueue) return { queue: null, notes };
    const here = { url, token: space.token.trim() };
    const e2e = this.at.e2e;
    let { q, queue } = await this.reconcile(space, here, look.own);
    let own = queue ?? space.ownQueue;
    // The phone a backup came from was lost: every queue it knows moves, once, tried with every
    // look until the relay answers. Not on a linked device, whose phone moves for it.
    const mark = e2e.onLinkedDevice() ? '' : await lostMark();
    if (mark && q.lost !== mark) {
      const moved = await this.lostNow(mark, here, look.own).catch(() => null);
      if (moved) own = queue = moved;
    }
    // Due since a contact was deleted or blocked: tried with every look until the relay answers.
    if (e2e.moveDue() > 0) {
      const ids = await createQueue(look.own).catch(() => null);
      if (ids) own = queue = await this.settle(queueOf(ids), here, 'due', now, look.own);
    }
    // Junk on the own queue, as the look found it.
    if (this.meter.look(`own:${own.recipientHex}`, look.found, now)) {
      q = await this.at.queues.load();
      const step = junkStep(q, 'own', e2e.putBackAt(), now);
      if (step === 'move') {
        const ids = await createQueue(look.own).catch(() => null);
        if (ids) {
          own = queue = await this.settle(queueOf(ids), here, 'junk', now, look.own);
          await this.at.queues.update((d) => ({ ...d, junk: { ...d.junk, own: now } }));
          notes.push(t('Junk filled your server queue, so Erevos gave you a new one and told your contacts. Whoever sent it does not know the new one.'));
        }
      } else if (step === 'say') {
        await this.at.queues.update((d) => ({ ...d, junkSaid: { ...d.junkSaid, own: now } }));
        notes.push(t('Junk comes to your new queue too, so one of your contacts or the server sends it. Erevos does not change it again before tomorrow.'));
      }
    }
    q = await this.at.queues.load();
    // A phone nearby read the own queue while the relay could not be reached here: it knows the
    // queue, so it moves now that the relay answers, and kept contacts are told the new one.
    if (q.bridged) {
      const was = q.bridged;
      const ids = await createQueue(look.own).catch(() => null);
      if (ids) {
        own = queue = await this.settle(queueOf(ids), here, 'bridge', now, look.own);
        q = await this.at.queues.update((d) => (d.bridged === was ? { ...d, bridged: undefined } : d));
        notes.push(t('A phone nearby brought your messages, so Erevos gave you a new server queue and told your contacts. That phone does not know the new one.'));
      }
    }
    // A ring queue due to move since the relay could not be reached: before the tells, which say it.
    if (q.ringDue) {
      await this.ringNow();
      q = await this.at.queues.load();
    }
    // A linked device is in no group itself: the phone is, for it.
    if (this.at.groups && !e2e.onLinkedDevice()) q = await this.makeGroupQueues(q, look.own, here);
    // Contact queues made ahead, before the tells, which give them out; those no one writes to deleted.
    if (this.at.contacts && !e2e.onLinkedDevice()) await this.contactsNow(look, here, now).catch(() => undefined);
    await this.tellAll(q, look);
    // The other queues: the groups' with every look, the rest less often while the app shows.
    this.looks++;
    const all = !look.shows || !!look.waited || this.looks % READ_EVERY === 1;
    let lost = false;
    for (const kind of all ? (['group', 'link', 'public'] as const) : (['group'] as const)) {
      const kept = q[kind];
      if (!kept || look.stop?.() || look.empty?.includes(kept.queue.recipientHex)) continue;
      const found = await this.read(look.own, kept.queue, kind, false, look, JUNK_BATCH);
      if (found === 'gone') {
        // The relay lost it. The groups' are made anew below. The link gets a queue of its own
        // anew, never the own queue: the links given before no longer work, as the relay lost
        // the one they name. Until it can be made, tried again with the next look.
        if (kind !== 'link') {
          await this.at.queues.update((d) => (same(d[kind], kept.queue) ? { ...d, [kind]: null } : d));
          lost = true;
          continue;
        }
        const ids = await createQueue(look.own).catch(() => null);
        if (!ids) continue;
        this.say(await this.at.queues.update((d) => (same(d.link, kept.queue) ? { ...d, link: { queue: queueOf(ids), ...here }, linkAt: now, linkUntil: now } : d)));
        notes.push(t('The server had lost the queue your contact link names, so you have a new link. The links and QR codes you gave before no longer work.'));
        continue;
      }
      if (!found || !this.meter.look(`${kind}:${kept.queue.recipientHex}`, found, now)) continue;
      const step = junkStep(await this.at.queues.load(), kind, e2e.putBackAt(), now);
      if (step !== 'move') continue;
      const ids = await createQueue(look.own).catch(() => null);
      if (!ids) continue;
      if (kind === 'link') {
        await this.linkTo(queueOf(ids), here, now);
        notes.push(t('Junk filled the queue your contact link names, so you have a new link. The links and QR codes you gave before work until {date}.', { date: new Date(now + GRACE).toLocaleDateString(locale()) }));
      } else await this.groupsTo(kind, queueOf(ids), here, look.own, now);
      await this.at.queues.update((d) => ({ ...d, junk: { ...d.junk, [kind]: now } }));
    }
    if (lost && this.at.groups && !e2e.onLinkedDevice()) await this.makeGroupQueues(await this.at.queues.load(), look.own, here);
    if (this.at.contacts && look.takeMine) await this.readContacts(look, here.url, now).catch(() => undefined);
    if (all) await this.readOld(look, now);
    return { queue, notes };
  }

  // The queues as kept, set right with what the space says now: as the first look of this version
  // found them; a move the app stopped in finished; an own queue made elsewhere taken as a move.
  private async reconcile(space: SpaceData, here: Here, own: Relay): Promise<{ q: QueuesData; queue: Queue | null }> {
    const e2e = this.at.e2e;
    const ownQueue = space.ownQueue!;
    const restore = e2e.restoreId();
    let q = await this.at.queues.load();
    // A backup put back since this last looked: contacts may hold a later `qa` than any kept here,
    // from moves made after the backup was.
    const restored = !!restore && q.restore !== restore;
    // The offset this space or place puts its `qa` off by, drawn once. One whose offset is not known
    // after a backup was put back (one from before this version, or made before its first look)
    // draws one past any it could have had, so what it says next is later than what any move made
    // since said.
    if (!q.offset) q = await this.at.queues.update((d) => (d.offset ? d : { ...d, offset: restored ? QUEUE_OFFSET + newOffset() : newOffset() }));
    if (!q.now) {
      // Every contact knows the queue found now: nothing to tell of it, and its `qa` says nothing of
      // when. After a backup was put back, they may have been told a later one since: this one says
      // a later `qa` than any of those, and each kept contact is told it.
      if (restored) await this.restoredGroups();
      q = await this.at.queues.update((d) => {
        if (d.now) return d;
        const moved = restored ? queueAge(d.moved, Date.now(), d.offset, QUEUE_JITTER) : Math.max(d.moved, FIRST_QA);
        return { ...d, now: { queue: ownQueue, ...here }, moved, since: restored ? d.since : moved, restore };
      });
      this.say(q);
      return { q, queue: null };
    }
    if (q.next) {
      const queue = await this.settle(q.next, here, q.nextWhy ?? 'due', Date.now(), own);
      return { q: await this.at.queues.load(), queue };
    }
    if (!same(q.now, ownQueue)) {
      // One moved away from, written back by what held it before: the one it moved to again.
      if (sameRelay(q.now.url, here.url) && (q.was.some((w) => same(w, ownQueue)) || same(q.link, ownQueue))) {
        await this.at.data.update({ ownQueue: q.now.queue });
        this.say(q);
        return { q, queue: q.now.queue };
      }
      const old = q.now;
      q = await this.at.queues.update((d) => elsewhere(d, ownQueue, here, Date.now(), e2e.onLinkedDevice()));
      this.say(q);
      await this.after(ownQueue, old, here, own, 'elsewhere');
      return { q, queue: null };
    }
    if (q.now.url !== here.url || q.now.token !== here.token) q = await this.at.queues.update((d) => ({ ...d, now: { queue: ownQueue, ...here } }));
    // A backup put back since: contacts may have learned a later queue meanwhile, so this one says a
    // later `qa` than any a move made since could have said.
    if (q.restore !== restore) {
      if (restore) await this.restoredGroups();
      q = await this.at.queues.update((d) => ({ ...d, moved: queueAge(d.moved, Date.now(), d.offset, QUEUE_JITTER), restore }));
    }
    this.say(q);
    return { q, queue: null };
  }

  // A backup put back since this last looked: in each group this phone is a member of, it asks the
  // admin to put it in anew (lib/groups.ts renewAgain), as the group may have moved on since with
  // keys the backup does not hold. Not on a linked device, which is in no group itself.
  private async restoredGroups() {
    if (!this.at.groups || this.at.e2e.onLinkedDevice()) return;
    for (const kind of this.at.groups.kinds ?? (['group', 'public'] as const)) await this.at.groups.renewAgain(kind, true).catch(() => undefined);
  }

  // The move's writes, each of which a stop after resumes from: `next` first, with why, and on the
  // first move the queue the contact link names from then on, then the space's own queue, then the
  // queues as they are after it. A link made at any moment between names the queue before, never
  // `next`. What was due by `started` is no more.
  private async settle(next: Queue, here: Here, why: Why, started: number, own: Relay): Promise<Queue> {
    const device = this.at.e2e.onLinkedDevice();
    const before = await this.at.queues.update((d) => ({ ...d, next, nextWhy: why, ...(firstMove(d, next, here, why, device) ? { link: d.now } : {}) }));
    const old = same(before.now, next) ? null : before.now;
    await this.at.data.update({ ownQueue: next });
    const done = await this.at.queues.update((d) => finished(d, next, here, why, Date.now(), device));
    this.say(done);
    await this.at.e2e.moveDone(started);
    await this.after(next, old, here, own, why);
    // Once all that moves with it moved: a move cut short before is made again.
    if (why === 'phone') await this.at.queues.update((d) => stepDone(d, 'own'));
    // Kept contacts are told where this chat reads now with the next look, which does not wait at the relay first.
    lookNow();
    return next;
  }

  // What moves with the own queue: the backup queue on the home relay (not for one made on another
  // relay), each home relay's for the phone lost, the web app's pushes, and what the place or the
  // phone moves besides.
  private async after(next: Queue, old: KeptQueue | null, here: Here, own: Relay, why: MoveWhy) {
    if (why !== 'lost' && why !== 'elsewhere') await this.moveSpare(why === 'phone').catch(() => undefined);
    if (this.at.push) {
      await this.at.push.keep(own, next).catch(() => undefined);
      if (old && sameRelay(old.url, here.url)) await this.at.push.drop(own, old.queue).catch(() => undefined);
    }
    if (old) this.meter.forget(`own:${old.queue.recipientHex}`);
    await this.at.moved?.(next, old?.queue ?? null, why).catch(() => undefined);
    // The ring queue moves too, so whoever was deleted or blocked can no longer ring; a new contact
    // link changes nothing of who may.
    if (why !== 'link') await this.ringNow();
  }

  // The backup queue moves on the home relay, or, with `all`, on each one: the one before is read
  // through its grace there.
  private async moveSpare(all = false) {
    const store = this.at.data;
    const { spare } = await store.load();
    const list = homeRelays(spare);
    const moving = (all ? list : list.slice(0, 1)).filter((one) => one.url.trim() && one.queue);
    if (moving.length === 0) return;
    const until = Date.now() + GRACE;
    const olds: OldQueue[] = moving.map((one) => ({ queue: one.queue!, url: one.url.trim(), token: one.token.trim(), kind: 'spare', until, ...(one.tor === true ? { tor: true } : {}) }));
    await this.at.queues.update((d) => ({ ...d, ...olds.reduce((at: Pick<QueuesData, 'was' | 'early'>, was) => adding(at, was), d) }));
    const [first, ...more] = list.map((one) => (moving.includes(one) ? { ...one, queue: null } : one));
    await store.update({ spare: more.length > 0 ? { ...first, more } : first });
    forgetSpare(store);
    await readySpare(store).catch(() => false);
    this.at.e2e.setSpare(spareSaid(store));
  }

  // The contact link names `queue` from now on; the one before it is read through its grace. With
  // `lost`, as a step of the move for the phone lost, kept as made in the same write.
  private async linkTo(queue: Queue, here: Here, now: number, lost = false) {
    this.say(
      await this.at.queues.update((d) => {
        const next = { ...d, ...(d.link ? adding(d, { ...d.link, kind: 'link', until: now + GRACE }) : {}), link: { queue, ...here }, linkAt: now, linkUntil: now + GRACE };
        return lost ? stepDone(next, 'link') : next;
      }),
    );
  }

  // The phone a backup came from was lost (`mark`, lock/restored.ts): every queue of this space or
  // place it knows moves, one step after another, each kept as made, so a look cut short goes on
  // with the next. First the contacts' own queues are marked to move, a few with each look
  // (contactsNow), then the own queue moves with all that moves with it (settle, after), then the
  // contact link's, when it has one of its own, and the groups' and public groups'. The old own and
  // backup queues go once every kept contact was heard on the new one (goesBy), the link's when
  // its grace ends. One whose chats no backup put back was made here, unknown to that phone:
  // nothing moves. Says the own queue it moved to, if it did; throws when the relay cannot be
  // reached, and the next look tries again.
  private async lostNow(mark: string, here: Here, own: Relay): Promise<Queue | null> {
    const e2e = this.at.e2e;
    if (e2e.putBackAt() === 0) {
      await this.at.queues.update((d) => ({ ...d, lost: mark, losing: '', lostDone: [] }));
      return null;
    }
    let q = await this.at.queues.update((d) => (d.losing === mark ? d : { ...d, losing: mark, lostDone: [] }));
    const step = (made: LostStep) => this.at.queues.update((d) => (d.losing === mark ? stepDone(d, made) : d));
    let queue: Queue | null = null;
    if (!q.lostDone.includes('mines')) {
      if (this.at.contacts) await e2e.moveMines();
      q = await step('mines');
    }
    if (!q.lostDone.includes('own')) {
      const started = Date.now();
      queue = await this.settle(queueOf(await createQueue(own)), here, 'phone', started, own);
      q = await this.at.queues.load();
    }
    if (!q.lostDone.includes('link')) {
      if (q.link) await this.linkTo(queueOf(await createQueue(own)), here, Date.now(), true);
      q = await step('link');
    }
    for (const kind of this.at.groups ? (this.at.groups.kinds ?? (['group', 'public'] as const)) : []) {
      if (q.lostDone.includes(kind)) continue;
      if (q[kind]) await this.groupsTo(kind, queueOf(await createQueue(own)), here, own, Date.now());
      q = await step(kind);
    }
    await this.at.queues.update((d) => (d.losing === mark ? { ...d, was: d.was.map((w) => goesBy(w, d.moved)), lost: mark, losing: '', lostDone: [] } : d));
    return queue;
  }

  // The groups' queue, or the public groups', is `queue` from now on: each group is told it as this
  // phone renews its keys there, and the one before is read until no group says it.
  private async groupsTo(kind: 'group' | 'public', queue: Queue, here: Here, own: Relay, now: number) {
    let old: KeptQueue | null = null;
    await this.at.queues.update((d) => {
      old = d[kind];
      return { ...d, ...(old ? adding(d, { ...old, kind, until: now + GRACE }) : {}), [kind]: { queue, ...here } };
    });
    await this.at.push?.keep(own, queue).catch(() => undefined);
    const before = old as KeptQueue | null;
    if (before && sameRelay(before.url, here.url)) await this.at.push?.drop(own, before.queue).catch(() => undefined);
    await this.at.groups?.renewAgain(kind).catch(() => undefined);
    this.named = null;
  }

  // The groups' and the public groups' queues, made the first time, or again after the relay lost them.
  private async makeGroupQueues(q: QueuesData, own: Relay, here: Here): Promise<QueuesData> {
    for (const kind of this.at.groups?.kinds ?? (['group', 'public'] as const)) {
      if (q[kind]) continue;
      const ids = await createQueue(own).catch(() => null);
      if (!ids) return q;
      await this.groupsTo(kind, queueOf(ids), here, own, Date.now());
      q = await this.at.queues.load();
    }
    return q;
  }

  // Each kept contact not told the own queue yet, or due a tell again, or not told the ring queue
  // since it moved (MoveAt.ring): each tell says both.
  private async tellAll(q: QueuesData, look: MoveLook) {
    const now = Date.now();
    const queue = new Set(this.at.e2e.tellsDue(q.moved, q.since, now));
    const due = [...new Set([...queue, ...this.at.e2e.ringTellsDue()])].filter((id) => (this.failed.get(id) ?? 0) <= now);
    for (const identity of due.slice(0, TELLS_EACH)) {
      if (look.stop?.()) return;
      try {
        await look.tell(identity);
        await this.at.e2e.queueTold(identity, queue.has(identity) ? q.moved : 0);
        this.failed.delete(identity);
        this.healed.set(identity, Date.now());
      } catch {
        this.failed.set(identity, Date.now() + TELL_RETRY);
      }
    }
  }

  // A kept contact heard on a queue this chat moved away from is told the new one at once: an
  // Erevos that knows nothing of `qa` may have gone back to it. At most once in HEAL_EVERY.
  private async heal(identity: string, look: MoveLook) {
    const now = Date.now();
    if (now - (this.healed.get(identity) ?? 0) < HEAL_EVERY) return;
    this.healed.set(identity, now);
    await look.tell(identity).catch(() => undefined);
  }

  // Reads one queue of `kind` (in `was` when `old`): up to `most` packets, of which only the first
  // few first packets, and on an old one group packets, are opened at once. The first packets past
  // those are opened too once one of those few was no junk, so a batch of requests is not lost;
  // else, as in a flood of made-up ones, they count as junk unopened. What one look found there,
  // 'gone' once the relay no longer has it, or null when it could not be reached.
  private async read(relay: Relay, queue: Queue, kind: QueueKind, old: boolean, look: MoveLook, most = READ_MOST): Promise<Look | 'gone' | null> {
    const firstsMost = !old && (kind === 'link' || kind === 'group') ? LINK_FIRSTS : OLD_FIRSTS;
    const groupsMost = old ? OLD_GROUPS : Infinity;
    const recipient = fromHex(queue.recipientHex);
    let firsts = 0;
    let groups = 0;
    let taken = 0;
    let junk = 0;
    let asked = false;
    const later: Uint8Array[] = [];
    // Opens one; says whether it was no junk.
    const open = async (bytes: Uint8Array): Promise<boolean> => {
      try {
        const took = await look.take(bytes, 'old');
        if (took.junk) junk++;
        else if (took.from && (old || kind === 'link')) await this.heal(took.from, look);
        return !took.junk;
      } catch {
        // This one is lost, as from the own queue; the next ones still come.
        return false;
      }
    };
    let gone = false;
    let away = false;
    for (let i = 0; i < most && !look.stop?.(); i++) {
      let bytes: Uint8Array | null;
      try {
        bytes = await receiveMessage(relay, recipient);
      } catch (error) {
        gone = isQueueNotFound(error);
        away = !gone;
        break;
      }
      if (!bytes) break;
      taken++;
      if (isGroupPacket(bytes)) {
        if (groups++ >= groupsMost) junk++;
        else await open(bytes);
        continue;
      }
      const first = await isFirst(bytes);
      if (first && firsts++ >= firstsMost) later.push(bytes);
      else if ((await open(bytes)) && first) asked = true;
    }
    if (asked) for (const bytes of later) await open(bytes);
    else junk += later.length;
    if (gone) return 'gone';
    if (away && taken === 0) return null;
    return { taken, junk };
  }

  // The queues moved away from: read cheaply, and once their grace is over, emptied and deleted.
  // Any a group of this space still names stays, whatever kind it is now (lib/moves.ts graceOver),
  // one let go of early too: that one is deleted once no group names it.
  private async readOld(look: MoveLook, now: number) {
    const q = await this.at.queues.load();
    const heard = this.at.e2e.heardSince();
    const named = q.was.length + q.early.length > 0 ? await this.namedNow() : new Set<string>();
    // Those over the most kept go first, emptied too: kept until then, though the app stops.
    const early = q.early;
    const all = [...early, ...q.was];
    for (const [i, w] of all.entries()) {
      if (look.stop?.()) return;
      const relay = relayOf(w);
      const kept = !named || named.has(w.queue.senderHex);
      const over = i < early.length ? !kept : graceOver(w, heard, kept, now);
      const found = await this.read(relay, w.queue, w.kind, true, look, over ? DRAIN_MOST : READ_MOST);
      if (found === null) continue;
      if (found !== 'gone' && over) {
        try {
          await deleteQueue(relay, fromHex(w.queue.recipientHex));
        } catch (error) {
          if (!isQueueNotFound(error)) continue;
        }
      }
      if (found === 'gone' || over) await this.at.queues.update((d) => ({ ...d, was: d.was.filter((x) => !same(x, w.queue)), early: d.early.filter((x) => !same(x, w.queue)) }));
    }
  }

  // At a relay that showed it reads queues with no token, many at once, contacts take queues of their
  // own: enough are made ahead for the next few written to, and one more for someone new; those no
  // one writes to any more are deleted there, with the token that made them. One on another relay
  // is left to it, as no token here is for it.
  private async contactsNow(look: MoveLook, here: Here, now: number) {
    const e2e = this.at.e2e;
    const proven = await readsManyAt(look.own, `${this.at.contacts!.way}-0`);
    e2e.useContactQueues(proven, here.url);
    if (!proven) return;
    const { want, ready } = e2e.queuesWanted(here.url);
    const made: Ready[] = [];
    for (let i = Math.min(MAX_READY, Math.min(want, FILL_EACH) + 1) - ready; i > 0 && made.length < FILL_EACH && !look.stop?.(); i--) {
      const ids = await createQueue(look.own).catch(() => null);
      if (!ids) break;
      made.push({ r: toHex(ids.recipientId), s: toHex(ids.senderId), u: here.url });
    }
    await e2e.addReady(made, here.url);
    if (made.length > 0) await this.at.push?.add?.(look.own, made.map((m) => m.r)).catch(() => undefined);
    // Those the phone lost knows (lostNow), each to one made ahead: the closed web app no longer
    // wakes for what comes to the one before, read through its grace once Erevos is open.
    for (const identity of e2e.minesToMove().slice(0, FILL_EACH)) {
      if (look.stop?.()) break;
      const before = e2e.contactQueues().find((c) => c.identity === identity)?.mine;
      if (!(await e2e.renewMine(identity, false, now, true))) break;
      if (before) await this.at.push?.drop(look.own, { recipientHex: before.r, senderHex: before.s }).catch(() => undefined);
    }
    await e2e.oldMinesOver(now);
    // What comes to them no longer wakes the closed web app: it is no chat of this space's now.
    for (const gone of this.at.push ? e2e.goneQueues() : []) {
      if (gone.until <= now || this.unpushed.has(gone.r) || !sameRelay(gone.u, here.url) || look.stop?.()) continue;
      this.unpushed.add(gone.r);
      await this.at.push!.drop(look.own, { recipientHex: gone.r, senderHex: '' }).catch(() => undefined);
    }
    await this.deleteGone(look.own, here.url, now, look.stop);
  }

  // The queues no one writes to any more, deleted at `url`, with the token that made them; those at
  // another relay are let go of here.
  private async deleteGone(own: Relay, url: string, now: number, stop?: () => boolean) {
    const e2e = this.at.e2e;
    const dropped: string[] = [];
    for (const gone of e2e.goneQueues().filter((g) => g.until <= now).slice(0, DELETES_EACH)) {
      if (stop?.()) break;
      if (!sameRelay(gone.u, url)) {
        dropped.push(gone.r);
        continue;
      }
      try {
        await deleteQueue(own, fromHex(gone.r));
        dropped.push(gone.r);
      } catch (error) {
        if (isQueueNotFound(error)) dropped.push(gone.r);
      }
    }
    await e2e.goneDropped(dropped);
  }

  /**
   * Reads at once what the watch found in the contacts' own queues on `look.own` (ContactWatch),
   * before the rest of a look (lib/receiver.ts): a call's offer then waits for no send and no other
   * queue, which through Tor can take tens of seconds. What the look reads later is then only what
   * came since.
   */
  async readCame(look: Pick<MoveLook, 'own' | 'takeMine' | 'stop'>): Promise<void> {
    if (!this.at.contacts || !look.takeMine || !this.watch?.unread()) return;
    const came = this.watch.came();
    const now = Date.now();
    for (const b of bunches(contactQueuesAt(this.at.e2e.contactQueues(), look.own.url), this.at.contacts.way)) {
      for (const q of b.queues) {
        if (look.stop?.()) return;
        if (came.has(q.r)) await this.readContact(look, q, b.way, now);
      }
    }
  }

  // The contacts' own queues: those the watch found something in, and every READ_EVERY looks all
  // of them, as one wait of none at the relay finds them. The watch waits on them from now on.
  private async readContacts(look: MoveLook, url: string, now: number) {
    const e2e = this.at.e2e;
    const list = bunches(contactQueuesAt(e2e.contactQueues(), url), this.at.contacts!.way);
    if (!this.stopped) {
      this.watch ??= new ContactWatch();
      this.watch.use(look.own, list);
    }
    const came = this.watch?.came() ?? new Set<string>();
    const all = this.contactLooks++ % READ_EVERY === 0;
    for (const b of list) {
      if (look.stop?.()) return;
      let waiting = b.queues.filter((q) => came.has(q.r));
      if (all) {
        const found = await waitForAny(look.own, b.queues.map((q) => fromHex(q.r)), 0, b.way).catch(() => null);
        if (found) waiting = b.queues.filter((_, i) => found[i] !== 'none');
      }
      for (const q of waiting) await this.readContact(look, q, b.way, now);
    }
  }

  // Reads one contact's queue, a whole batch at a time as the own queue, so junk is counted the same
  // way: junk filling theirs has them take a new one, once a day at most. One the relay lost, they
  // take a new one at once.
  private async readContact(look: Pick<MoveLook, 'own' | 'takeMine' | 'stop'>, q: ContactQueue, way: string, now: number) {
    const e2e = this.at.e2e;
    const recipient = fromHex(q.r);
    let taken = 0;
    let junk = 0;
    for (let i = 0; i < JUNK_BATCH && !look.stop?.(); i++) {
      let bytes: Uint8Array | null;
      try {
        bytes = await receiveOnRead(look.own, recipient, way);
      } catch (error) {
        if (isQueueNotFound(error) && !q.was) await e2e.renewMine(q.identity, true, now);
        return;
      }
      if (!bytes) break;
      taken++;
      try {
        if ((await look.takeMine!(bytes, q.r)).junk) junk++;
      } catch {
        // This one is lost, as from the own queue; the next ones still come.
      }
    }
    if (q.was || !this.meter.look(`mine:${q.r}`, { taken, junk }, now)) return;
    const mine = e2e.contactQueues().find((c) => c.identity === q.identity)?.mine;
    if (mine?.r !== q.r || (mine.junk && now - mine.junk < JUNK_AGAIN)) return;
    this.meter.forget(`mine:${q.r}`);
    // What comes to the one before, junk as it may be, no longer wakes the closed web app: it is read once Erevos is open.
    if (await e2e.renewMine(q.identity, false, now)) await this.at.push?.drop(look.own, { recipientHex: mine.r, senderHex: mine.s }).catch(() => undefined);
  }

  // The queues the groups say, asked once an hour; null when they could not say, so none goes.
  private async namedNow(): Promise<Set<string> | null> {
    if (!this.at.groups) return new Set();
    if (this.named && Date.now() - this.named.at < NAMED_EVERY) return this.named.senders;
    const senders = await this.at.groups.named().catch(() => null);
    this.named = { at: Date.now(), senders };
    return senders;
  }
}

// ---- The space's ----

const movedListeners = new Set<(queue: Queue, old: Queue | null, why: MoveWhy) => Promise<void>>();

/** Has `listener` called each time the open space's own queue moved (lib/devices.ts). */
export function onSpaceMoved(listener: (queue: Queue, old: Queue | null, why: MoveWhy) => Promise<void>): () => void {
  movedListeners.add(listener);
  return () => movedListeners.delete(listener);
}

// ---- A hidden place's ----

const placeMovedListeners = new Set<(space: number, pocket: number, queue: Queue, old: Queue | null, why: MoveWhy) => Promise<void>>();

/** Has `listener` called each time a hidden place's own queue moved (lib/devices.ts, its own links). */
export function onPlaceMoved(listener: (space: number, pocket: number, queue: Queue, old: Queue | null, why: MoveWhy) => Promise<void>): () => void {
  placeMovedListeners.add(listener);
  return () => placeMovedListeners.delete(listener);
}

/** Says that the own queue of the hidden place in `pocket` of `space` moved: its moves call it, open or receiving closed (app/chat.tsx, lib/place-receiver.ts). */
export async function placeMoved(space: number, pocket: number, queue: Queue, old: Queue | null, why: MoveWhy): Promise<void> {
  for (const listener of placeMovedListeners) await listener(space, pocket, queue, old, why).catch(() => undefined);
}

let spaceGroups: MoveGroups | undefined;
let spacePush: MoveAt['push'];

/** How a space's move reaches its groups and the web app's pushes, set once by those (lib/space-groups.ts, lib/web-push.web.ts). */
export function useForMoves({ groups, push }: { groups?: MoveGroups; push?: MoveAt['push'] }): void {
  if (groups) spaceGroups = groups;
  if (push) spacePush = push;
}

let opened: { of: object; e2e: E2E; mover: QueueMove } | null = null;

// Whether `space` is the one open now: the web app's pushes are given only for it, as its own
// settings say whether they are on (lib/web-push.web.ts).
function isOpen(space: object): boolean {
  try {
    return currentSpace() === space;
  } catch {
    return false;
  }
}

/** The open space's moves, made once while its chats are open. */
export function spaceMover({ e2e }: Pick<SpaceChats, 'e2e'>): QueueMove {
  const current = currentSpace();
  if (opened?.of !== current || opened.e2e !== e2e) {
    opened?.mover.stop();
    const push = spacePush;
    const mover = new QueueMove({
      e2e,
      queues: spaceQueues(current.space, current.key),
      data: spaceSpare(),
      groups: spaceGroups,
      // A look that ends after another space opened gives that one nothing: its own looks do.
      push: push && {
        keep: (own, queue) => (isOpen(current) ? push.keep(own, queue) : Promise.resolve()),
        drop: push.drop,
        ...(push.add ? { add: (own: Relay, queues: string[]) => (isOpen(current) ? push.add!(own, queues) : Promise.resolve()) } : {}),
      },
      contacts: { way: `contacts-${current.space}` },
      moved: async (queue, old, why) => {
        for (const listener of movedListeners) await listener(queue, old, why).catch(() => undefined);
      },
    });
    opened = { of: current, e2e, mover };
  }
  return opened.mover;
}

/** Lets go of the space's moves when it closes. */
export function forgetSpaceMover(): void {
  opened?.mover.stop();
  opened = null;
}

/** The sender id the open space's contact link names (lib/sms-relay.ts, the SMS screen): the link queue's, or the own queue's while it is the link's. */
export async function spaceLinkSender(own: Queue): Promise<string> {
  const { space, key } = currentSpace();
  return linkOf(await spaceQueues(space, key).load(), own).senderHex;
}

// The space's chats say when their own queue was made from the first, before any look.
joinSpaceChats(async (chats, space, key) => {
  const q = await spaceQueues(space, key).load();
  if (q.moved > 0) chats.e2e.setQueueAge(q.moved, q.now?.queue.senderHex);
  if (q.now) chats.e2e.setLinkOwn(!q.link);
});
