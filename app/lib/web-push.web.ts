// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { currentSpace } from '../lock/keys';
import { spaceQueues } from '../lock/queues-data';
import { loadCurrentSpaceData, loadSpaceData, updateSpaceData, type Queue } from '../lock/space-data';

import { randomBytes } from './crypto';
import { WEB_APP } from './integrity';
import { leftAt, pushedQueues } from './push-queues';
import { useForMoves } from './queue-move';
import { fromHex, isPushExpired, isQueueNotFound, pushKey, relayHome, setPush, setPushes, toHex, type PushKeys, type Relay } from './relay';
import { spaceChats } from './space-chats';
import { t } from './i18n';

// Notifications for the web app while it is closed (an iPhone stops it as soon as it leaves the
// screen). The browser makes a push address for the relay's key; the relay pushes to that address
// whenever a message comes into the space's queue (crates/erevos-relay/src/push.rs). It is also
// given the browser's keys for the address, so a relay that counts puts in each push how many
// messages came, encrypted for the browser, and the service worker shows "3 new messages" (pwa/sw.js);
// from an older relay the push is empty, and the notice says "New message", or "New messages" once
// more came since Erevos was last open. The push goes through the browser's push service (Apple's
// on an iPhone), which sees when a message comes, never what, how many or from whom. Off unless
// turned on, per space, for the space's own queue, the queues its groups and public groups say
// (lib/queue-move.ts) and its contacts' own queues (lib/push-queues.ts): never for hidden chats,
// nor for the queue the contact link names (a request shows when the app opens), nor for one the
// space moved away from. The relay is given the address for them all on one connection when
// Erevos starts, and after that only for the queues it was not given it for yet, or when the
// browser changed the address (healPush). One the push service no longer takes, as the relay says,
// is made again: the relay is asked as Erevos shows again, every ASK_EVERY at most. Turned off when
// the relay cannot be told, it is told while the space stays open, every little while, or when it
// next opens.
//
// Each space has a push address of its own. A browser has one for each registration of a service
// worker, so a space that turns notifications on registers the app's worker again (pwa/sw.js) for a
// scope of its own, under PUSH_SCOPE with a random name kept in its encrypted data (pushScope),
// where the worker only shows notices. No relay is ever given the address another space gave its
// relay, so the address does not tie spaces together. The browser lists each registration: whoever
// can see its settings can count the spaces with notifications on. Turned off, the space's
// registration goes. A space whose notifications were on before has the browser's first address,
// which other spaces may share: it makes its own as it opens, and that one is never given again.

const supported = typeof window !== 'undefined' && 'PushManager' in window && 'Notification' in window && 'serviceWorker' in navigator;

export const PUSH_AVAILABLE = WEB_APP && supported;

function same(a: ArrayBuffer | null | undefined, b: Uint8Array): boolean {
  if (!a || a.byteLength !== b.length) return false;
  const bytes = new Uint8Array(a);
  return bytes.every((byte, i) => byte === b[i]);
}

const PUSH_SCOPE = '/__erevos/push/';
const scopeOf = (name: string) => new URL(`${PUSH_SCOPE}${name}/`, location.origin).href;

/** The space a registration is for: the one open when it began. */
type Mine = { space: number; key: Uint8Array };

/** The registration of the space's notices, by the name it keeps (pushScope), if there is one. */
async function spaceRegistration(name: string): Promise<ServiceWorkerRegistration | null> {
  if (!name) return null;
  const found = await navigator.serviceWorker.getRegistration(scopeOf(name));
  // One for a wider scope, the app's, is not the space's.
  return found?.scope === scopeOf(name) ? found : null;
}

// How long a new registration's worker is waited for, in milliseconds.
const STARTS_WITHIN = 30_000;

/** The registration once its worker is active: the browser makes a push address only then. */
function started(registration: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> {
  if (registration.active) return Promise.resolve(registration);
  const worker = registration.installing ?? registration.waiting;
  const failed = () => new Error('The service worker for notifications did not start.');
  if (!worker) return Promise.reject(failed());
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const changed = () => {
      if (worker.state === 'activated') done();
      else if (worker.state === 'redundant') done(failed());
    };
    const done = (error?: Error) => {
      clearTimeout(timer);
      worker.removeEventListener('statechange', changed);
      if (error) reject(error);
      else resolve(registration);
    };
    timer = setTimeout(() => done(failed()), STARTS_WITHIN);
    worker.addEventListener('statechange', changed);
    changed();
  });
}

/** The space's registration for its notices, registered if it has none, with a new name. */
async function ownRegistration(mine: Mine): Promise<ServiceWorkerRegistration> {
  let name = (await loadSpaceData(mine.space, mine.key)).pushScope;
  const found = await spaceRegistration(name);
  if (found) return started(found);
  if (!name) {
    name = toHex(randomBytes(16));
    await updateSpaceData(mine.space, mine.key, { pushScope: name });
  }
  return started(await navigator.serviceWorker.register('/sw.js', { scope: scopeOf(name), updateViaCache: 'none' }));
}

/** The space's registration goes, its push address with it: the push service then takes nothing for it, and the browser no longer lists it. */
async function dropRegistration(name: string): Promise<void> {
  const registration = await spaceRegistration(name);
  await (await registration?.pushManager.getSubscription())?.unsubscribe();
  await registration?.unregister();
}

/** The space's push address for `key`, made if there is none, it was made for another key, or it is `gone`. */
async function subscription(mine: Mine, key: Uint8Array, gone = false): Promise<PushSubscription> {
  const registration = await ownRegistration(mine);
  const kept = await registration.pushManager.getSubscription();
  if (kept && !gone && same(kept.options.applicationServerKey, key)) return kept;
  if (kept) await kept.unsubscribe();
  return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: new Uint8Array(key) });
}

// The keys the pushes are encrypted for, if this browser opens the encryption a relay uses (RFC 8291).
function keysOf(sub: PushSubscription): PushKeys | undefined {
  const encodings = (PushManager as { supportedContentEncodings?: readonly string[] }).supportedContentEncodings;
  if (encodings && !encodings.includes('aes128gcm')) return undefined;
  const p256dh = sub.getKey('p256dh');
  const auth = sub.getKey('auth');
  if (p256dh?.byteLength !== 65 || auth?.byteLength !== 16) return undefined;
  return { p256dh: new Uint8Array(p256dh), auth: new Uint8Array(auth) };
}

// The open space's chats, for its contacts' queues; none when they cannot open.
const contacts = () => spaceChats().then(({ e2e }) => e2e, () => null);

// The open space, or null when none is: a registration started for one is not finished for another.
function opened(): object | null {
  try {
    return currentSpace();
  } catch {
    return null;
  }
}

// The space's queues that push on the same relay as `queue`, its own (lib/push-queues.ts), as recipient ids in hex.
async function pushed(own: Relay, queue: Queue): Promise<string[]> {
  const { space, key } = currentSpace();
  const queues = await spaceQueues(space, key).load().catch(() => null);
  return pushedQueues(queue, queues, await contacts(), own.url);
}

// The queues the relay took this browser's push address for since Erevos started, by relay and
// address with its keys: each is given it again only once Erevos starts again, or the address
// changes. In memory only, as the ids open the queues on the relay's /read path.
const given = new Map<string, Set<string>>();
// One registration at a time: the receiver's, a move's and a tap's come close together.
let line: Promise<unknown> = Promise.resolve();

function inLine<T>(run: () => Promise<T>): Promise<T> {
  const next = line.then(run, run);
  line = next.catch(() => undefined);
  return next;
}

function givenAt(own: Relay, endpoint: string, keys: PushKeys | undefined): Set<string> {
  const at = `${relayHome(own.url)}\n${endpoint}\n${keys ? toHex(keys.p256dh) + toHex(keys.auth) : ''}`;
  let set = given.get(at);
  if (!set) given.set(at, (set = new Set()));
  return set;
}

// The relay no longer pushes for these: they are given the address again should they push again.
function taken(queues: string[]): void {
  for (const set of given.values()) for (const r of queues) set.delete(r);
}

// Gives the relay this browser's push address, made for the relay's key, for each of `queues` it
// was not given it for yet. The first `needed` (the space's own queue, when notifications are being
// turned on) must take it, before any other is asked; of the others, one the relay no longer has
// (a contact's it lost, one made ahead that ran out unused) is left out, and the rest still take it.
// Those it could not be given are asked again the next time (keepPush). When the relay says the push
// service no longer takes the address, the browser makes a new one, and they are given it, once.
// The address is the space's own, `mine`'s.
async function register(own: Relay, queues: string[], mine: Mine, needed = 0): Promise<string | null> {
  const key = await pushKey(own);
  if (!key) return t('Your server does not send notifications. It needs a newer version, set up with a push key.');
  if (await give(own, queues, needed, await subscription(mine, key))) await give(own, queues, needed, await subscription(mine, key, true), true);
  return null;
}

// Gives the relay the address `sub` as register says: true when the relay said it is gone.
async function give(own: Relay, queues: string[], needed: number, sub: PushSubscription, again = false): Promise<boolean> {
  const keys = keysOf(sub);
  const done = givenAt(own, sub.endpoint, keys);
  for (const r of queues.slice(0, needed)) {
    try {
      await setPush(own, fromHex(r), sub.endpoint, keys);
    } catch (error) {
      if (!again && isPushExpired(error)) return true;
      throw error;
    }
    done.add(r);
  }
  const rest = queues.slice(needed).filter((r) => !done.has(r));
  const answers = await setPushes(own, rest.map(fromHex), sub.endpoint, keys).catch(() => []);
  answers.forEach((error, i) => {
    if (!error) done.add(rest[i]);
  });
  return answers.some(isPushExpired);
}

// Whether notifications are on for the open space, and allowed.
async function pushOn(): Promise<boolean> {
  if (!PUSH_AVAILABLE || Notification.permission !== 'granted') return false;
  return (await loadCurrentSpaceData().catch(() => null))?.push === true;
}

/** Whether notifications are on for the open space, and allowed: the number on Erevos's icon is for such a space only (lib/push-notice.web.ts). */
export const notificationsOn = pushOn;

function spaceRelay(url: string, token: string): Relay {
  return { url: url.trim(), token: token.trim() || undefined };
}

/** Turns notifications on for the open space. Call it straight from a tap: Safari asks for the
 *  permission only then. Says what went wrong, or null. */
export async function turnOnPush(): Promise<string | null> {
  if (!PUSH_AVAILABLE) return t('This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return t('Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.');
  // This space's, as tapped: the line may be held a while, and another space open by then.
  const { space, key } = currentSpace();
  const at = opened();
  const data = await loadSpaceData(space, key);
  if (!data.url.trim() || !data.ownQueue) return t('Set up the server first, under Server.');
  const own = spaceRelay(data.url, data.token);
  const queue = data.ownQueue;
  try {
    const queues = await pushed(own, queue);
    const problem = await inLine(() => register(own, queues, { space, key }, 1));
    if (problem) return problem;
  } catch (error) {
    // Not on: the browser keeps no registration for it.
    if (!data.push) {
      await inLine(async () => dropRegistration((await loadSpaceData(space, key)).pushScope)).catch(() => undefined);
      await updateSpaceData(space, key, { pushScope: '' }).catch(() => undefined);
    }
    return t('Notifications could not be turned on: {reason}', { reason: error instanceof Error ? error.message : String(error) });
  }
  await updateSpaceData(space, key, { push: true, pushLeft: false });
  // Queues made ahead meanwhile were not given it, as notifications were not on yet.
  if (opened() === at) await keepPush(own, queue);
  return null;
}

// The open space's queues the relay may push for: those that push, and its contacts' that may
// still have the address. Null when they cannot be worked out, the chats among them: without its
// contacts' queues the relay would keep pushing for them.
function mayPush(own: Relay, queue: Queue): Promise<string[] | null> {
  return Promise.all([pushed(own, queue), spaceChats()]).then(
    ([pushing, { e2e }]) => [...new Set([...pushing, ...leftAt(e2e, own.url)])],
    () => null,
  );
}

// The relay forgets the push address of `queues`: true once it did for each, or has no such queue.
async function unregister(own: Relay, queues: string[]): Promise<boolean> {
  taken(queues);
  const answers = await setPushes(own, queues.map(fromHex), '');
  return answers.every((error) => !error || isQueueNotFound(error));
}

/** Turns notifications off for the open space: the relay forgets the push address of its queues,
 *  and of its contacts' queues that may still have it. Until it did, the space keeps `pushLeft`,
 *  and the relay is told again (tellLeft). */
export async function turnOffPush(): Promise<void> {
  const { space, key } = currentSpace();
  const at = opened();
  const data = await loadSpaceData(space, key);
  const relayed = Boolean(data.url.trim() && data.ownQueue);
  // Kept until the relay is told, so a turn-off cut short (Erevos closed meanwhile) is told when
  // the space next opens.
  await updateSpaceData(space, key, { push: false, pushLeft: relayed, pushScope: '' });
  await inLine(() => dropRegistration(data.pushScope)).catch(() => undefined);
  if (!data.url.trim() || !data.ownQueue) return;
  const own = spaceRelay(data.url, data.token);
  const queue = data.ownQueue;
  // Worked out now, for this space, as for turning them on; the own queue alone if they cannot be.
  const queues = await mayPush(own, queue);
  const told = await inLine(() => unregister(own, queues ?? [queue.recipientHex])).catch(() => false);
  const left = !told || !queues;
  await updateSpaceData(space, key, { pushLeft: left });
  if (left && at) tellLater(own, queue, at, LEFT_AGAIN);
}

// How long before a relay that could not be told notifications are off is told again, while its
// space stays open: the first wait, twice as long after each, and the longest.
const LEFT_AGAIN = 60_000;
const LEFT_AGAIN_MOST = 15 * 60_000;
let leftTimer: ReturnType<typeof setTimeout> | undefined;

function tellLater(own: Relay, queue: Queue, at: object, wait: number): void {
  clearTimeout(leftTimer);
  leftTimer = setTimeout(() => {
    if (opened() === at) void tellLeft(own, queue, Math.min(wait * 2, LEFT_AGAIN_MOST));
  }, wait);
}

// Turned off while the relay could not be told: it is told now, unless they were turned on again,
// and while the space stays open, again a while later until it is.
async function tellLeft(own: Relay, queue: Queue, wait = LEFT_AGAIN): Promise<void> {
  const at = opened();
  if (!PUSH_AVAILABLE || !at) return;
  // This space's, as asked: another may be open once the relay answers.
  const { space, key } = currentSpace();
  const left = () => loadSpaceData(space, key).then((data) => !data.push && data.pushLeft, () => false);
  if (!(await left())) return;
  const queues = await mayPush(own, queue);
  const told = await inLine(async () => {
    // Another space open, or turned on again: nothing to tell now.
    if (opened() !== at || !(await left())) return true;
    if (!queues || !(await unregister(own, queues))) return false;
    await updateSpaceData(space, key, { pushLeft: false });
    return true;
  }).catch(() => false);
  if (!told && opened() === at) tellLater(own, queue, at, wait);
}

/** Gives the relay the push address when the space opens or its queues change, if notifications
 *  are on, for each queue that pushes and was not given it yet: a browser may change the address,
 *  and a new queue has none. If they are off and the relay was not told yet, it is told. */
export async function keepPush(own: Relay, queue: Queue): Promise<void> {
  const at = opened();
  if (!(await pushOn())) return opened() === at ? tellLeft(own, queue) : undefined;
  const mine = currentSpace();
  await inLine(async () => {
    const queues = await pushed(own, queue);
    // Not if notifications were turned off, or another space opened, while it waited its turn.
    if (opened() === at && (await pushOn())) await register(own, queues, mine);
  }).catch(() => undefined);
}

/** Gives the relay the push address for queues made ahead for contacts (lib/queue-move.ts), if
 *  notifications are on, so a contact given one before the space opens again wakes the closed web app. */
export async function addPush(own: Relay, queues: string[]): Promise<void> {
  const at = opened();
  if (queues.length === 0 || !(await pushOn())) return;
  const mine = currentSpace();
  await inLine(async () => {
    if (opened() === at && (await pushOn())) await register(own, queues, mine);
  }).catch(() => undefined);
  // A new address made meanwhile goes to the space's other queues too.
  await healPush();
}

// How often at most the relay is asked whether it still takes the address it was given in this
// run, as Erevos shows again, by relay and address. In memory only, as `given`.
const ASK_EVERY = 10 * 60_000;
const asked = new Map<string, number>();

/** Gives the relay the push address again (keepPush), if notifications are on, when the browser's
 *  is not the one the space's own queue was given in this run (a browser may change it, or drop
 *  it), or when the worker says it changed (`changed`, pwa/sw.js). Else, every ASK_EVERY at most,
 *  it gives it for the own queue alone: a relay whose push service said the address is gone, which
 *  only the relay hears of, then says so (lib/relay.ts isPushExpired), and the browser makes a new
 *  one for every queue. */
export async function healPush(changed = false): Promise<void> {
  // The space it is for: another may open while it waits its turn.
  const space = opened();
  if (!space || !(await pushOn())) return;
  const data = await loadCurrentSpaceData().catch(() => null);
  if (!data?.url.trim() || !data.ownQueue) return;
  const own = spaceRelay(data.url, data.token);
  const queue = data.ownQueue;
  // Looked at after a registration under way, which may give it.
  const stale = await inLine(async () => {
    if (changed) given.clear();
    // The space's own, or none yet: one from before is the browser's first, which keepPush replaces.
    const registration = changed ? null : await spaceRegistration(data.pushScope);
    const sub = registration ? await registration.pushManager.getSubscription() : null;
    if (!sub) return true;
    const keys = keysOf(sub);
    const done = givenAt(own, sub.endpoint, keys);
    if (!done.has(queue.recipientHex)) return true;
    const asking = `${relayHome(own.url)}\n${sub.endpoint}`;
    if (Date.now() - (asked.get(asking) ?? 0) < ASK_EVERY) return false;
    asked.set(asking, Date.now());
    const gone = await setPush(own, fromHex(queue.recipientHex), sub.endpoint, keys).then(() => false, isPushExpired);
    // Every queue is given the new address: the relay dropped this one from them all.
    if (gone) done.clear();
    return gone;
  }).catch(() => false);
  if (stale && opened() === space) await keepPush(own, queue);
}

/** The relay forgets the push address of a queue the space or a contact moved away from, so what comes there never wakes the closed web app. */
export async function dropPush(own: Relay, queue: Queue): Promise<void> {
  if (!PUSH_AVAILABLE) return;
  taken([queue.recipientHex]);
  await setPush(own, fromHex(queue.recipientHex), '').catch(() => undefined);
}

/** Whether the open space's own push address is kept by the browser, as its relay was given it: null when that cannot be told. */
export async function pushSubscribed(): Promise<boolean | null> {
  if (!PUSH_AVAILABLE) return null;
  try {
    const registration = await spaceRegistration((await loadCurrentSpaceData()).pushScope);
    return registration ? (await registration.pushManager.getSubscription()) !== null : false;
  } catch {
    return null;
  }
}

/** Erevos is open again: the spaces' workers close the notices they showed (pwa/sw.js, 'close'). */
export async function closeSpaceNotices(): Promise<void> {
  if (!PUSH_AVAILABLE) return;
  const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
  for (const registration of registrations) {
    if (new URL(registration.scope).pathname.startsWith(PUSH_SCOPE)) registration.active?.postMessage({ erevos: 'close' });
  }
}

useForMoves({ push: { keep: keepPush, drop: dropPush, add: addPush } });
