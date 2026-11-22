// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { plural } from '../lib/i18n';
import { secureGet, secureSet } from '../lib/secure';
import { device } from '../modules/erevos-device';

// Wrong passwords are counted on the phone, across restarts, wherever a password is checked (the
// lock screen, and the lock settings, which compare a new password with the other spaces'). After
// FREE_TRIES, every further wrong one makes the next check wait, twice as long each time, up to
// an hour. One count for every space, as the lock screen comes before any space. A right
// password ends the wait.
//
// The wait is measured on a clock the owner cannot set (uptimeNow): on Android how long the phone
// has been on since it started (modules/erevos-device, clock), elsewhere how long this page has
// been open. Moving the phone's date and time forward does not end it. After the phone starts again,
// or the page opens again, that clock started over too, and the time already waited cannot be
// known: the wait then starts again from its beginning, rather than trusting the date and time.
// Where no such clock exists (a build before it), the wait is by the date and time, as before.

const KEY = 'erevos.lock-tries';
/** The lock screen's count, and every other check against the spaces' passwords. */
export const KEY_TRIES = KEY;
/** Searches on the home screen are tried as the hidden chats' PIN (hidden.ts), counted apart, so
 *  searching never makes the lock screen wait. */
export const SEARCH_TRIES = 'erevos.search-tries';
/** PINs of chats locked with one of their own (chat-pin.ts), counted apart too. */
export const CHAT_TRIES = 'erevos.chat-tries';
export const FREE_TRIES = 5;
const FIRST_WAIT_MS = 30_000;
const MAX_WAIT_MS = 3_600_000;
/** A search's wrong tries are let go of after this long without another: a search is typed by
 *  anyone, for anything, and searches that found nothing an hour ago are no attack. The first
 *  while brings the count back under FREE_TRIES, and each further one takes one more off, so a
 *  search is never made to wait for long by searching, while guessing a PIN by searching stays at
 *  about one try a while. The while is measured on the clock the owner cannot set, like the waits:
 *  moving the date forward lets nothing go, and neither does a new start of the phone, after which
 *  how long passed cannot be known. The wait a search brings stays short for the same reason. */
const SEARCH_FORGET_MS = 15 * 60_000;
const SEARCH_MAX_WAIT_MS = 5 * 60_000;

/** The clock the owner cannot set: ms since it started, and which start it is. */
export type Uptime = { up: number; boot: string };

// This page's own start, for the clock of a page: another each time it opens.
const RUN = `run:${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;

function ownUptime(): Uptime | null {
  try {
    const kept = device?.clock?.();
    if (kept && Number.isFinite(kept.up) && typeof kept.boot === 'string' && kept.boot) return { up: kept.up, boot: kept.boot };
  } catch {
    // A build before the clock: below.
  }
  // A page (the web app, a computer, Sailfish OS): how long it has been open.
  if (typeof document !== 'undefined' && typeof performance !== 'undefined' && typeof performance.now === 'function') return { up: performance.now(), boot: RUN };
  return null;
}

let uptimeNow: () => Uptime | null = ownUptime;

/** For the checks: the clock the waits are measured on, or null for none (the date and time only). */
export function setUptimeForChecks(clock: (() => Uptime | null) | null): void {
  uptimeNow = clock ?? ownUptime;
}

interface Tries {
  fails: number;
  /** When the last wrong one was tried (ms, the date and time), for the searches' forgetting where there is no clock of the phone's own. */
  at?: number;
  /** When the last wrong one was tried on the clock the owner cannot set, and in which start: for the searches' forgetting. */
  lastUp?: number;
  lastBoot?: string;
  /** When the wait ends by the date and time (ms): what the lock screen says, and the measure with no clock of the phone's own. */
  until: number;
  /** How long the wait is, from `up` on the clock of start `boot`; 0 with none, or once it is over. */
  wait: number;
  up: number;
  boot: string;
}

const NONE: Tries = { fails: 0, until: 0, wait: 0, up: 0, boot: '' };

export class LockedOutError extends Error {
  until: number;

  constructor(until: number) {
    super('lockedOut');
    this.until = until;
  }
}

const waitAfter = (fails: number, entry = KEY) => (fails < FREE_TRIES ? 0 : Math.min(entry === SEARCH_TRIES ? SEARCH_MAX_WAIT_MS : MAX_WAIT_MS, FIRST_WAIT_MS * 2 ** (fails - FREE_TRIES)));

async function load(entry = KEY): Promise<Tries> {
  try {
    const raw = await secureGet(entry);
    if (raw) {
      const data = JSON.parse(raw) as Partial<Tries>;
      if (typeof data.fails === 'number' && typeof data.until === 'number') {
        // Kept by a build before the clock: its wait, as long as its count makes it.
        const wait = typeof data.wait === 'number' ? data.wait : data.until > 0 ? waitAfter(data.fails, entry) : 0;
        const up = typeof data.up === 'number' ? data.up : 0;
        const boot = typeof data.boot === 'string' ? data.boot : '';
        return {
          fails: data.fails,
          until: data.until,
          wait,
          up,
          boot,
          ...(typeof data.at === 'number' ? { at: data.at } : {}),
          ...(typeof data.lastUp === 'number' && typeof data.lastBoot === 'string' ? { lastUp: data.lastUp, lastBoot: data.lastBoot } : {}),
        };
      }
    }
  } catch {
    // Starts afresh.
  }
  return { ...NONE };
}

const save = (entry: string, tries: Tries) => secureSet(entry, JSON.stringify(tries));

/** The count exists from the first start, so its entry does not show that a password was ever tried. */
export async function prepareTries(): Promise<void> {
  for (const entry of [KEY, SEARCH_TRIES, CHAT_TRIES]) if (!(await secureGet(entry))) await save(entry, NONE);
}

/** Throws LockedOutError while a wait is on. */
export async function assertNotLockedOut(now = Date.now(), entry = KEY): Promise<void> {
  const tries = await load(entry);
  if (tries.wait <= 0) return;
  const clock = uptimeNow();
  if (!clock) {
    if (tries.until > now) throw new LockedOutError(tries.until);
    return;
  }
  if (tries.boot !== clock.boot || clock.up < tries.up) {
    // The phone started again, or the page opened again, since the wait began (or a build before
    // the clock began it): how much of it passed cannot be known, so it starts again from here.
    await save(entry, { ...tries, until: now + tries.wait, up: clock.up, boot: clock.boot });
    throw new LockedOutError(now + tries.wait);
  }
  const left = tries.up + tries.wait - clock.up;
  if (left > 0) throw new LockedOutError(now + left);
  // Over: kept so, so that starting the phone again does not start it again.
  await save(entry, { ...tries, until: 0, wait: 0 });
}

// How long passed since the search's last wrong try: on the clock the owner cannot set when
// there is one (nothing known across a new start), by the date and time only where there is none.
function sinceLast(before: Tries, now: number, clock: Uptime | null): number {
  if (clock) return before.lastBoot === clock.boot && before.lastUp !== undefined && clock.up >= before.lastUp ? clock.up - before.lastUp : 0;
  return before.at !== undefined ? Math.max(0, now - before.at) : 0;
}

/** What is left of a search's wrong tries `fails` after `since` ms without another. */
export function searchFailsLeft(fails: number, since: number): number {
  const whiles = Math.floor(since / SEARCH_FORGET_MS);
  return whiles > 0 ? Math.max(0, Math.min(fails, FREE_TRIES - 1) - (whiles - 1)) : fails;
}

// One check of a password at a time, in this page and, in a browser, in every tab of it
// (navigator.locks): two checks at once would both pass the wait and both read the same count, so
// one of them would not count. Checks inside one must not ask for another: they would wait on
// themselves.
const LINE = 'erevos.lock-tries';
let line: Promise<unknown> = Promise.resolve();

type Locks = { request: <T>(name: string, run: () => Promise<T>) => Promise<T> };

function tabsLock(): Locks | null {
  try {
    const locks = (globalThis as { navigator?: { locks?: Locks } }).navigator?.locks;
    return locks && typeof locks.request === 'function' ? locks : null;
  } catch {
    return null;
  }
}

/** Runs `run` once every check of a password started before it is over. */
export function oneCheckAtATime<T>(run: () => Promise<T>): Promise<T> {
  const locks = tabsLock();
  const go = locks ? () => locks.request(LINE, run) : run;
  const result = line.then(go, go);
  line = result.catch(() => undefined);
  return result;
}

/**
 * A check of a password, counted (oneCheckAtATime): throws LockedOutError while it must wait;
 * otherwise counts it as wrong BEFORE `check` runs, so a check cut short (the app closed, the
 * page left while the slow keys are made) still counts, and takes that back once `right` says it
 * opened something.
 */
export function countedCheck<T>(entry: string, now: number, check: () => Promise<T>, right: (result: T) => boolean): Promise<T> {
  return oneCheckAtATime(async () => {
    await assertNotLockedOut(now, entry);
    await recordWrongPassword(now, entry);
    const result = await check();
    if (right(result)) await recordRightPassword(entry);
    return result;
  });
}

/** Counts a wrong password; returns when the next check may run (now, while tries are free). */
export async function recordWrongPassword(now = Date.now(), entry = KEY): Promise<number> {
  const before = await load(entry);
  const search = entry === SEARCH_TRIES;
  const clock = uptimeNow();
  const fails = (search ? searchFailsLeft(before.fails, sinceLast(before, now, clock)) : before.fails) + 1;
  const wait = waitAfter(fails, entry);
  const until = wait ? now + wait : 0;
  const waitClock = wait ? clock : null;
  await save(entry, {
    fails,
    until,
    wait,
    up: waitClock?.up ?? 0,
    boot: waitClock?.boot ?? '',
    ...(search ? { at: now, ...(clock ? { lastUp: clock.up, lastBoot: clock.boot } : {}) } : {}),
  });
  return until;
}

export async function recordRightPassword(entry = KEY): Promise<void> {
  await save(entry, NONE);
}

/** "Try again in …", in seconds or minutes. */
export function lockedOutMessage(until: number, now = Date.now()): string {
  const seconds = Math.max(1, Math.ceil((until - now) / 1000));
  return seconds >= 90
    ? plural(Math.ceil(seconds / 60), 'Too many attempts. Try again in {n} minute.', 'Too many attempts. Try again in {n} minutes.')
    : plural(seconds, 'Too many attempts. Try again in {n} second.', 'Too many attempts. Try again in {n} seconds.');
}
