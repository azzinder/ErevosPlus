// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A Session chat that was read stays read (messenger/.../session/Session.kt), read from the Kotlin
// itself, as it runs only on a phone. A swarm node that does not know our last hash hands out all
// it keeps (about 14 days), so old messages can come again after a restart or a new swarm:
// - the read is written at once, not after the 2 s pause, and remembered as a time (readMs, as
//   Session's own apps keep last_read): a message at or before it does not make the chat unread;
// - messages taken away here (deleted, unsent, gone after their timer) are remembered and not
//   added again; the swarm hashes already taken are kept in full, not cut to fewer.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const kt = readFileSync(new URL('../../messenger/android/app/src/main/java/eu/erevos/messenger/session/Session.kt', import.meta.url), 'utf8');
const fn = (name: string) => {
  const start = kt.indexOf(`private fun ${name}(`);
  assert.ok(start >= 0, name);
  const next = kt.indexOf('\n    private fun ', start + 1);
  return kt.slice(start, next < 0 ? undefined : next);
};

test('a read is kept as a time, saved at once, and old messages do not make the chat unread again', () => {
  assert.match(kt, /var readMs = 0L/);
  assert.match(kt, /readMs = c\.optLong\("readMs"\)/);
  assert.match(kt, /\.put\("readMs", c\.readMs\)/);
  assert.match(fn('read'), /c\.unread = false/);
  assert.match(fn('read'), /c\.readMs = maxOf\(c\.readMs, c\.messages\.filter \{ !it\.mine \}\.maxOfOrNull \{ it\.ms \}/);
  for (const name of ['markRead', 'markAll']) {
    const body = fn(name);
    assert.match(body, /read\(it\)/, name);
    assert.match(body, /work\.execute\(saveSoon\)/, name);
    assert.doesNotMatch(body, /\bsave\(\)/, name);
  }
  const add = fn('addMessage');
  assert.match(add, /if \(incoming && isNew\(m\.ms, c\.readMs\)\) \{\s*\n\s*c\.unread = true/);
  assert.match(kt, /private fun isNew\(ms: Long, readMs: Long\) = ms > readMs/);
  // The rule itself: what came after the read is new, what came at or before it is not.
  const isNew = (ms: number, readMs: number) => ms > readMs;
  assert.equal(isNew(1_000, 0), true);
  assert.equal(isNew(1_000, 1_000), false);
  assert.equal(isNew(900, 1_000), false);
  assert.equal(isNew(1_001, 1_000), true);
});

test('messages taken away here do not come back from the swarm', () => {
  assert.match(fn('addMessage'), /if \(m\.id in gone \|\| c\.messages\.any \{ it\.id == m\.id \}\) return/);
  assert.match(fn('deleteForMe'), /removeIf \{ it\.id == id \}\s*\n\s*forget\(id\)/);
  // Unsent by them: remembered even when the message itself has not come yet.
  assert.match(kt, /ch\.messages\.removeIf \{ it\.id == id \} \}\?\.id\s*\n\s*\.also \{ forget\(id\) \}/);
  assert.match(fn('forget'), /gone\.add\(id\)/);
  assert.match(kt, /o\.optJSONArray\("gone"\)/);
  assert.match(kt, /o\.put\("gone", JSONArray\(gone\.toList\(\)\.takeLast\(KEEP_SEEN\)\)\)/);
});

test('the swarm hashes already taken are all saved, not cut to fewer than are kept', () => {
  assert.match(kt, /o\.put\("seen", JSONArray\(seen\.toList\(\)\.takeLast\(KEEP_SEEN\)\)\)/);
  assert.doesNotMatch(kt, /seen\.size > 3000|takeLast\(2000\)/);
  const keep = /private const val KEEP_SEEN = (\d+)/.exec(kt);
  assert.ok(keep && Number(keep[1]) >= 3000, 'KEEP_SEEN');
  const trims = kt.match(/while \(seen\.size > (\w+)\)/g) ?? [];
  assert.ok(trims.length >= 2);
  for (const t of trims) assert.match(t, /KEEP_SEEN/);
});
