// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { store } from './secure-memory';

type Tries = typeof import('../lock/tries');
// The query makes Node load a module instance of its own each time, as another tab would.
const tab = (name: string): Promise<Tries> => import(`../lock/tries.ts?tab=${name}`);

// Separate imports model two browser tabs: each has its own module-local promise queue, while
// both share the same secure-storage backend and the same browser LockManager.
test('password failures from independent tabs are serialized by Web Locks', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const queues = new Map<string, Promise<unknown>>();
  let acquisitions = 0;
  let active = 0;
  let peak = 0;
  const locks = {
    request<T>(name: string, run: () => Promise<T>): Promise<T> {
      const before = queues.get(name) ?? Promise.resolve();
      const work = before.catch(() => undefined).then(async () => {
        acquisitions++;
        active++;
        peak = Math.max(peak, active);
        try { return await run(); }
        finally { active--; }
      });
      queues.set(name, work.catch(() => undefined));
      return work;
    },
  };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks } });
  try {
    const [first, second] = await Promise.all([tab('one'), tab('two')]);
    store.clear();
    const now = Date.now();
    let checked = 0;
    const attempts = Array.from({ length: 30 }, (_, index) => {
      const tab = index % 2 === 0 ? first : second;
      return tab.countedCheck(tab.KEY_TRIES, now, async () => {
        checked++;
        await new Promise((resolve) => setTimeout(resolve, 1));
        return false;
      }, (right) => right);
    });
    const results = await Promise.allSettled(attempts);
    assert.equal(checked, first.FREE_TRIES, 'only the permitted failed attempts must run KDF');
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, first.FREE_TRIES);
    assert.ok(results.slice(first.FREE_TRIES).every((r) => r.status === 'rejected' && (r.reason instanceof first.LockedOutError || r.reason instanceof second.LockedOutError)));
    assert.equal(acquisitions, 30, 'every attempt must acquire the browser lock');
    assert.equal(peak, 1, 'the simulated browser lock must be exclusive');
    const saved = JSON.parse(store.get(first.KEY_TRIES)!);
    assert.equal(saved.fails, first.FREE_TRIES, 'no failed tries may be lost');
  } finally {
    store.clear();
    if (previous) Object.defineProperty(globalThis, 'navigator', previous);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});

// No security policy should accidentally reset a pending lockout after a module is reloaded.
test('lockout survives a new tab module instance', async () => {
  const tries = await tab('fresh');
  store.clear();
  try {
    const now = Date.now();
    for (let n = 0; n < tries.FREE_TRIES; n++) await tries.recordWrongPassword(now);
    await assert.rejects(tries.assertNotLockedOut(now), tries.LockedOutError);
  } finally {
    store.clear();
  }
});

// A cancelled/failed operation must still consume a try; an authenticated check clears it.
test('interrupted checks are counted and a successful check clears the shared counter', async () => {
  const tries = await tab('interrupted');
  store.clear();
  try {
    const now = Date.now();
    await assert.rejects(
      tries.countedCheck(tries.KEY_TRIES, now, async () => { throw new Error('interrupted'); }, () => true),
      /interrupted/,
    );
    assert.equal(JSON.parse(store.get(tries.KEY_TRIES)!).fails, 1);
    assert.equal(await tries.countedCheck(tries.KEY_TRIES, now, async () => true, (result) => result), true);
    assert.equal(JSON.parse(store.get(tries.KEY_TRIES)!).fails, 0);
  } finally {
    store.clear();
  }
});
