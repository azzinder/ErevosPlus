// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Erevos+'s other networks in backups (lib/backup-networks-data.ts): only a Session account as its
// engine keeps it is read back; anything else is left out, so a restore never puts it in place.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkedNetworks } from '../lib/backup-networks-data';

const seed = '0123456789abcdef0123456789abcdef';
const state = JSON.stringify({ seed, name: 'Ada', chats: [{ id: '05ab', messages: [{ id: 'ss:1', text: 'hi' }] }], groups: [] });

test("a Session account as its engine keeps it comes back as it was", () => {
  assert.deepEqual(checkedNetworks({ session: state }), { session: state });
});

test('what is not one is left out', () => {
  assert.equal(checkedNetworks(undefined), null);
  assert.equal(checkedNetworks(null), null);
  assert.equal(checkedNetworks({}), null);
  assert.equal(checkedNetworks({ session: '' }), null);
  assert.equal(checkedNetworks({ session: 42 }), null);
  assert.equal(checkedNetworks({ session: 'not json' }), null);
  assert.equal(checkedNetworks({ session: JSON.stringify({ name: 'no seed' }) }), null);
  // A seed is 16 bytes: not shorter, not longer, and only hex.
  assert.equal(checkedNetworks({ session: JSON.stringify({ seed: seed.slice(2) }) }), null);
  assert.equal(checkedNetworks({ session: JSON.stringify({ seed: seed + '00' }) }), null);
  assert.equal(checkedNetworks({ session: JSON.stringify({ seed: 'zz' + seed.slice(2) }) }), null);
});

test("only Session goes in: what another network might say is not read", () => {
  assert.deepEqual(checkedNetworks({ session: state, signal: 'x', telegram: 'y' }), { session: state });
});

test("what the first space keeps for backups: Session's account as it was, or none", async () => {
  const { checkedNetworksBackup } = await import('../lock/networks-backup-data');
  assert.deepEqual(checkedNetworksBackup({ session: state, at: 5 }), { session: state, signal: '', at: 5 });
  assert.deepEqual(checkedNetworksBackup({ session: 'not json', at: 5 }), { session: '', signal: '', at: 5 });
  assert.deepEqual(checkedNetworksBackup({ session: state, at: -1 }), { session: state, signal: '', at: 0 });
  assert.deepEqual(checkedNetworksBackup(null), { session: '', signal: '', at: 0 });
});

// Signal's history (#68): chats and messages as its engine makes them, nothing else.
const history = JSON.stringify({ v: 1, chats: [{ key: 7, name: 'Ada', group: false, person: '' }], messages: [{ id: 'sg:1:a', thread: 7, ms: 1, text: 'hi' }] });

test("Signal's history is kept beside Session's account, each on its own", async () => {
  const { checkedNetworksBackup } = await import('../lock/networks-backup-data');
  assert.deepEqual(checkedNetworksBackup({ session: state, signal: history, at: 5 }), { session: state, signal: history, at: 5 });
  assert.deepEqual(checkedNetworksBackup({ session: 'not json', signal: history, at: 5 }), { session: '', signal: history, at: 5 });
  assert.deepEqual(checkedNetworksBackup({ session: state, signal: 'not json', at: 5 }), { session: state, signal: '', at: 5 });
});

test("a Signal history not as its engine makes it is left out", async () => {
  const { checkedSignalHistory } = await import('../lib/backup-networks-data');
  assert.equal(checkedSignalHistory(history), history);
  assert.equal(checkedSignalHistory(''), null);
  assert.equal(checkedSignalHistory(42), null);
  assert.equal(checkedSignalHistory({ v: 1 }), null);
  assert.equal(checkedSignalHistory('not json'), null);
  assert.equal(checkedSignalHistory(JSON.stringify({ v: 1, chats: [] })), null);
  assert.equal(checkedSignalHistory(JSON.stringify({ chats: [], messages: [{}] })), null);
  // One with no messages holds nothing.
  assert.equal(checkedSignalHistory(JSON.stringify({ v: 1, chats: [], messages: [] })), null);
});
