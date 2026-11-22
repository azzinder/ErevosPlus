// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { loadE2EData, type E2EData, type NostrKey } from '../lock/e2e-data';
import type { History } from '../lock/history';
import { keptPlaces } from '../lock/hidden-keep';
import { loadRinged } from '../lock/hidden-ring';
import { loadWatched } from '../lock/hidden-watch';
import { currentSpace } from '../lock/keys';
import { saveDoor } from '../lock/doors';
import { loadMatrix } from '../lock/matrix-data';
import { loadNostrDm } from '../lock/nostr-dm-data';
import { loadPublicGroupData } from '../lock/public-group-data';
import { placeQueues, spaceQueues } from '../lock/queues-data';
import { hiddenHolder } from '../lock/sealed-file';
import { loadHiddenData, loadSpaceData, updateHiddenData, updateSpaceData, type SpaceData } from '../lock/space-data';
import { loadTelegram } from '../lock/telegram-data';
import { loadXmpp } from '../lock/xmpp-data';
import { dropFile, onRelay } from './attachments';
import { canNostrChat } from './core';
import { onHiddenPlaceChange, openHiddenPlace } from './hidden-contacts';
import { matrixSignOut } from './matrix-store';
import { nostrOf, setNostr } from './nostr';
import { chatCore } from './nostr-dm';
import { NostrRelay, nostrChatsThroughTor, type NostrEvent } from './nostr-dm-net';
import { nostrDmForget } from './nostr-dm-store';
import { placeChats } from './place-chats';
import { deleteQueue, dropLater, fromHex, isQueueNotFound, listInvites, relayStopped, sameRelay, setRelayStopped, takeBackInvite, torOff, whileClearing, type Relay } from './relay';
import { serverQueues, type KeptPlace, type ServerQueue } from './server-queues';
import { spaceChats } from './space-chats';
import { restartSpaceRunning } from './space-running';
import { telegramLeave } from './telegram-store';
import { xmppSignOut } from './xmpp-store';

// "Delete me from everywhere" (app/forget-me.tsx): what the servers keep for the open space is
// deleted, and the phone keeps all it has. The space is stopped first (SpaceData.stopped), so
// nothing makes its queues again meanwhile (lib/relay.ts refuses every request of a stopped space
// but those that delete, and Nostr reads and sends nowhere); then, each on the relay it is on:
//
// 1. every queue the space keeps (lib/server-queues.ts), with what waits in each, and the push
//    address a web app gave for it; and those of its hidden places whose key is with the space
//    (they receive while closed) or that are open now, never counted in what the screen says. A hidden place opened later, while the
//    space is still stopped, has its own deleted as it opens (watchStoppedPlaces).
// 2. our messages a relay holds for later, safety messages too, and those still held for
//    contacts deleted or blocked here.
// 3. the files that came and wait on a relay, not taken yet. The files sent from here are taken
//    off by those who take them; the others expire on the relay after 14 days: no list of them is
//    kept here to delete.
// 4. the invites made here and not used yet. One used is left: taking it back cuts that phone off.
// 5. through Nostr, the space's way (through Tor while it is ready, straight with Tor off), a
//    request to vanish (NIP-62, kind 62, every relay) signed by each key the chats read on there,
//    so a relay that keeps them drops the wraps for those keys.
//    Relays need not do as asked: the screen says so.
// 6. only when chosen: the space's Matrix and XMPP accounts signed out (the accounts stay on their
//    servers, which are theirs), and the space's Nostr account made here asked to vanish too and
//    forgotten here. One brought from another app is left alone: it is used elsewhere. In the
//    ErevosGram build, its Telegram signed out too, and TDLib's folder deleted from the phone.
//
// What failed is said, and the same can run again: what was deleted is gone already. Nothing
// deleted is forgotten here, so it runs again until done. The space then stays stopped until
// "Start again" (startAgain): from then on its queues are made anew, as after a relay lost them
// (lib/queue-move.ts), and its contacts are told quietly where to write, with the next look.

/** How many of something went, were gone already, or could not be asked. */
export type Count = { done: number; gone: number; failed: number };

/** Why the Nostr requests did not go: Tor is on but not ready, or this build cannot sign them. */
export type NostrSkip = 'tor' | 'core' | null;

export type ForgetReport = {
  queues: Count;
  held: Count;
  files: Count;
  invites: Count;
  nostr: Count & { skipped: NostrSkip };
  /** With the accounts chosen: whether each was signed out (true), failed (false), or there was none (missing). */
  matrix?: boolean;
  xmpp?: boolean;
  telegram?: boolean;
  nostrAccount?: 'vanished' | 'brought' | 'failed';
  /** The relays some queue could not be deleted on, to say. */
  unreached: string[];
};

const zero = (): Count => ({ done: 0, gone: 0, failed: 0 });
const emptyReport = (): ForgetReport => ({ queues: zero(), held: zero(), files: zero(), invites: zero(), nostr: { ...zero(), skipped: null }, unreached: [] });

type Place = { kept: KeptPlace; history: History | null; undropped: { id: string; relay: string; at: number }[] };

async function placeOf(space: number, pocket: number, key: Uint8Array): Promise<Place> {
  const holder = hiddenHolder(pocket);
  const [data, queues, e2e, matrix, xmpp, chats] = await Promise.all([
    loadHiddenData(space, pocket, key),
    placeQueues(space, pocket, key).load(),
    loadE2EData(holder, space, key).catch(() => null),
    loadMatrix(space, key, holder).catch(() => null),
    loadXmpp(space, key, holder).catch(() => null),
    placeChats(space, pocket, key).catch(() => null),
  ]);
  return { kept: { data, queues, e2e, matrix, xmpp }, history: chats?.history ?? null, undropped: chats?.e2e.undropped() ?? [] };
}

async function spaceOf(space: number, key: Uint8Array): Promise<Place> {
  const [data, queues, e2e, matrix, xmpp, publicGroups, watch, rings, chats] = await Promise.all([
    loadSpaceData(space, key),
    spaceQueues(space, key).load(),
    loadE2EData('space', space, key).catch(() => null),
    loadMatrix(space, key).catch(() => null),
    loadXmpp(space, key).catch(() => null),
    loadPublicGroupData(space, key).catch(() => null),
    loadWatched(space, key).catch(() => []),
    loadRinged(space, key).catch(() => []),
    spaceChats().catch(() => null),
  ]);
  return { kept: { data, queues, e2e, matrix, xmpp, publicGroups, watch, rings }, history: chats?.history ?? null, undropped: chats?.e2e.undropped() ?? [] };
}

// The relay at `url`, with the token kept for it in `data`, when it is one of its own.
function relayAt(data: SpaceData, url: string, token = ''): Relay {
  const kept = [{ url: data.url, token: data.token }, data.spare, ...(data.spare.more ?? [])].find((r) => r.url.trim() && sameRelay(r.url, url));
  const use = token.trim() || kept?.token.trim() || '';
  // A home relay reached only through Tor is reached so here too, never straight.
  const tor = (kept as { tor?: boolean } | undefined)?.tor === true;
  return { url, ...(use ? { token: use } : {}), ...(tor ? { tor: true } : {}) };
}

async function deleteQueues(queues: ServerQueue[], count: Count, unreached: Set<string>): Promise<void> {
  for (const q of queues) {
    try {
      await deleteQueue({ url: q.url, ...(q.token ? { token: q.token } : {}), ...(q.tor ? { tor: true } : {}) }, fromHex(q.recipientHex));
      count.done += 1;
    } catch (error) {
      if (isQueueNotFound(error)) count.gone += 1;
      else {
        count.failed += 1;
        unreached.add(q.url);
      }
    }
  }
}

// Ours a relay holds for later, by the messages kept, and those kept for contacts deleted or blocked.
async function dropAllHeld(place: Place, count: Count, now: number): Promise<void> {
  const held = [...(place.history?.heldLater(now).flatMap((m) => (m.held ? [m.held] : [])) ?? []), ...place.undropped.filter((u) => u.at > now)];
  const seen = new Set<string>();
  for (const one of held) {
    if (seen.has(one.id)) continue;
    seen.add(one.id);
    try {
      if (await dropLater(relayAt(place.kept.data, one.relay), one.id)) count.done += 1;
      else count.gone += 1;
    } catch {
      count.failed += 1;
    }
  }
}

// The files that came and wait on a relay, not taken: deleted through the place's own relay.
async function dropWaitingFiles(place: Place, count: Count): Promise<void> {
  const { data } = place.kept;
  if (!data.url.trim()) return;
  const own = relayAt(data, data.url, data.token);
  for (const m of place.history?.messages() ?? []) {
    const from = m.file?.from;
    if (m.mine || !from || !onRelay(from)) continue;
    try {
      await dropFile(own, from);
      count.done += 1;
    } catch {
      count.failed += 1;
    }
  }
}

// The invites made with the place's own token and not used yet.
async function takeBackInvites(place: Place, count: Count): Promise<void> {
  const { data } = place.kept;
  if (!data.url.trim() || !data.token.trim()) return;
  const relay = relayAt(data, data.url, data.token);
  try {
    const list = await listInvites(relay);
    for (const invite of list ?? []) {
      if (invite.used > 0) continue;
      if (await takeBackInvite(relay, invite.id).catch(() => null)) count.done += 1;
      else count.failed += 1;
    }
  } catch {
    count.failed += 1;
  }
}

/** The Nostr keys a place's chats read on: each contact's, and the one its contact link names. */
export function nostrKeysOf(e2e: E2EData | null): NostrKey[] {
  const keys = [...(e2e?.contacts ?? []).flatMap((c) => (c.nostr ? [c.nostr] : [])), ...(e2e?.nostrLink ? [e2e.nostrLink] : [])];
  return keys.filter((k, i) => keys.findIndex((o) => o.p === k.p) === i);
}

/** A request to vanish (NIP-62) for the key `secret` (hex), from every relay. */
export async function vanishEvent(secret: string, now = Date.now()): Promise<NostrEvent> {
  const { event } = await chatCore<{ event: NostrEvent }>('sign', { secret, created_at: Math.floor(now / 1000), kind: 62, tags: [['relay', 'ALL_RELAYS']], content: '' });
  return event;
}

// Each request to every relay in `relays`, one connection to each: done when one relay took it.
async function askRelays(relays: string[], events: NostrEvent[], count: Count): Promise<void> {
  const took = new Set<string>();
  for (const url of relays) {
    const relay = await NostrRelay.open(url, null).catch(() => null);
    if (!relay) continue;
    try {
      for (const event of events) if ((await relay.publish(event).catch(() => ({ ok: false }))).ok) took.add(event.id);
    } finally {
      relay.close();
    }
  }
  count.done += took.size;
  count.failed += events.length - took.size;
}

// Whether the Nostr requests can go now: through Tor while it is ready, or straight with Tor off.
// With Tor on but not ready they wait, rather than go straight.
const nostrGoes = () => nostrChatsThroughTor() || torOff();

async function vanishKeys(places: Place[], count: Count & { skipped: NostrSkip }): Promise<void> {
  const each = places.map((place) => ({ relays: place.kept.data.nostr.relays, keys: nostrKeysOf(place.kept.e2e) })).filter((p) => p.keys.length > 0 && p.relays.length > 0);
  if (each.length === 0) return;
  if (!canNostrChat()) {
    count.skipped = 'core';
    return;
  }
  if (!nostrGoes()) {
    count.skipped = 'tor';
    return;
  }
  for (const { relays, keys } of each) {
    const events = (await Promise.all(keys.map((k) => vanishEvent(k.s).catch(() => null)))).filter((e): e is NostrEvent => e !== null);
    count.failed += keys.length - events.length;
    await askRelays(relays, events, count);
  }
}

// Clears what the servers keep for one place: steps 1 to 5 above.
async function clear(places: Place[], report: ForgetReport, unreached: Set<string>): Promise<void> {
  const now = Date.now();
  await whileClearing(async () => {
    for (const place of places) await deleteQueues(serverQueues(place.kept), report.queues, unreached);
    for (const place of places) await dropAllHeld(place, report.held, now);
    for (const place of places) await dropWaitingFiles(place, report.files);
    for (const place of places) await takeBackInvites(place, report.invites);
  });
  await vanishKeys(places, report.nostr);
}

/** Stops the open space at once, so nothing makes its queues again: before anything is deleted. */
async function stopSpace(space: number, key: Uint8Array, data: SpaceData): Promise<number> {
  const at = data.stopped || Date.now();
  if (!data.stopped) await updateSpaceData(space, key, { stopped: at });
  setRelayStopped(true);
  setNostr(null);
  // No other space says a message came here while it is closed: its queues are gone.
  await saveDoor(space, null).catch(() => undefined);
  restartSpaceRunning();
  return at;
}

/**
 * Deletes what the servers keep for the open space, and for its hidden places reached now, and
 * stops it. `accounts`: its Matrix and XMPP accounts signed out too, and its Nostr account made
 * here asked to vanish. Runs again for what failed.
 */
export async function forgetMe(accounts: boolean): Promise<ForgetReport> {
  const { space, key } = currentSpace();
  const at = await stopSpace(space, key, await loadSpaceData(space, key));
  const report = emptyReport();
  const unreached = new Set<string>();
  const pockets: { pocket: number; key: Uint8Array }[] = await keptPlaces(space, key).catch(() => []);
  const open = openHiddenPlace();
  if (open && open.space === space && !pockets.some((p) => p.pocket === open.pocket)) pockets.push({ pocket: open.pocket, key: open.key });
  await clear([await spaceOf(space, key)], report, unreached);
  // The hidden places' are counted apart and never shown: what the report says, or a relay it
  // names, would tell that the space has hidden chats, and where they read. One that could not be
  // cleared whole is not marked, so it is cleared again as it opens (watchStoppedPlaces).
  for (const { pocket, key: placeKey } of pockets) {
    const place = await placeOf(space, pocket, placeKey).catch(() => null);
    if (!place) continue;
    const apart = emptyReport();
    await clear([place], apart, new Set());
    if (apart.queues.failed === 0 && apart.held.failed === 0) await updateHiddenData(space, pocket, placeKey, { stopped: at }).catch(() => undefined);
  }
  if (accounts) await signOutAccounts(space, key, report);
  report.unreached = [...unreached];
  return report;
}

async function signOutAccounts(space: number, key: Uint8Array, report: ForgetReport): Promise<void> {
  if (await loadMatrix(space, key).catch(() => null)) report.matrix = await whileClearing(() => matrixSignOut()).then(() => true, () => false);
  if (await loadXmpp(space, key).catch(() => null)) report.xmpp = await whileClearing(() => xmppSignOut()).then(() => true, () => false);
  if ((await loadTelegram(space, key).catch(() => null))?.account) report.telegram = await telegramLeave(true).then(() => true, () => false);
  const nostr = await loadNostrDm(space, key).catch(() => null);
  if (!nostr) return;
  if (!nostr.madeHere) {
    report.nostrAccount = 'brought';
    return;
  }
  try {
    if (!canNostrChat() || !nostrGoes()) throw new Error('no way');
    const count = zero();
    await askRelays(nostr.inbox, [await vanishEvent(nostr.secret)], count);
    if (count.done === 0) throw new Error('not taken');
    await nostrDmForget();
    report.nostrAccount = 'vanished';
  } catch {
    report.nostrAccount = 'failed';
  }
}

/** Whether the open space is stopped, and since when (ms), or 0. */
export async function stoppedSince(): Promise<number> {
  const { space, key } = currentSpace();
  return (await loadSpaceData(space, key)).stopped;
}

/**
 * Starts the open space again: it reaches its relays and Nostr once more, its queues are made anew
 * as after a relay lost them, and its contacts are told quietly where to write.
 */
export async function startAgain(): Promise<void> {
  const { space, key } = currentSpace();
  await updateSpaceData(space, key, { stopped: 0 });
  const data = await loadSpaceData(space, key);
  setRelayStopped(false);
  setNostr(nostrOf(data.nostr), data.nostr.tor === true);
  restartSpaceRunning();
}

/**
 * While the open space is stopped, a hidden place that opens and was not cleared for this stop
 * is cleared then. Runs while the space is open and stopped (app/_layout.tsx). Returns how to stop.
 */
export function watchStoppedPlaces(): () => void {
  let running = Promise.resolve();
  const look = () => {
    running = running.then(async () => {
      const open = openHiddenPlace();
      if (!open || !relayStopped()) return;
      const { space, key } = currentSpace();
      if (open.space !== space) return;
      const at = (await loadSpaceData(space, key)).stopped;
      const place = await placeOf(space, open.pocket, open.key);
      if (!at || place.kept.data.stopped === at) return;
      const report = emptyReport();
      await clear([place], report, new Set());
      // Asked again when it next opens, while some could not be deleted.
      if (report.queues.failed === 0 && report.held.failed === 0) await updateHiddenData(space, open.pocket, open.key, { stopped: at });
    }).catch(() => undefined);
  };
  look();
  return onHiddenPlaceChange(look);
}
