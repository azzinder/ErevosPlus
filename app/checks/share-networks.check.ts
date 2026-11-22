// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Send to (app/share.tsx) on Matrix, XMPP and Nostr too (lib/share-networks.ts): which chats it
// offers and in what order, which file each network takes, and a photo or file read whole to send
// there. And a file shared as Erevos locks over Send to waits for it after the password.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bytesSource } from '../lib/attachments';
import { randomBytes } from '../lib/crypto';
import type { InboxRow } from '../lib/inbox';
import { holdLink, holdsShare, lockingKeepsLink, takeLink } from '../lib/open-link';
import { fitsNetwork, inOrder, NETWORK_MOST, networkOf, networkTarget, readWhole } from '../lib/share-networks';

const row = (identity: string, extra: Partial<InboxRow> = {}): InboxRow => ({
  identity,
  name: 'Ann',
  last: '',
  mine: false,
  mark: 0,
  at: 5,
  unread: 0,
  timer: 0,
  imported: false,
  avatar: null,
  sms: '',
  lastSms: false,
  ...extra,
});

test('a chat on Matrix, XMPP or Nostr is offered, opening its own chat; one only invited to, or an Erevos chat, is not', () => {
  assert.deepEqual(networkTarget(row('matrix:!abc:example.org', { network: 'matrix' })), {
    key: 'matrix:!abc:example.org',
    name: 'Ann',
    kind: 'matrix',
    at: 5,
    to: 'matrix:!abc:example.org',
    open: '/matrix-chat?room=!abc%3Aexample.org',
  });
  assert.equal(networkTarget(row('xmpp:ann@example.org', { network: 'xmpp' }))?.open, '/xmpp-chat?jid=ann%40example.org');
  const key = 'a'.repeat(64);
  assert.equal(networkTarget(row(`nostr:${key}`, { network: 'nostr' }))?.open, `/nostr-chat?key=${key}`);
  assert.equal(networkTarget(row('matrix:!abc:example.org', { network: 'matrix', invited: true })), null);
  assert.equal(networkTarget(row('xmpp:ann@example.org', { network: 'matrix' })), null, 'the row must be of the network it says');
  assert.equal(networkTarget(row('0123abcd')), null);
  assert.equal(networkTarget(row('sms:+30690', { sms: '+30690' })), null);
});

test('the network a chat is handed to is told by its identity', () => {
  assert.equal(networkOf('matrix:!abc:example.org'), 'matrix');
  assert.equal(networkOf('xmpp:ann@example.org'), 'xmpp');
  assert.equal(networkOf(`nostr:${'b'.repeat(64)}`), 'nostr');
  assert.equal(networkOf('telegram:-100123'), 'telegram');
  assert.equal(networkOf('contact:0123'), null);
  assert.equal(networkOf('group:42'), null);
  assert.equal(networkOf('+30690'), null);
});

test('those the home screen showed last come first, in its order, then the rest by name', () => {
  const targets = [
    { key: 'contact:a', name: 'Zoe' },
    { key: 'matrix:!r', name: 'Bob' },
    { key: 'nostr:k', name: 'Alice' },
    { key: 'xmpp:c@x', name: 'Carl' },
  ];
  assert.deepEqual(
    inOrder(targets, ['xmpp:c@x', 'sms:+30', 'contact:a']).map((t) => t.key),
    ['xmpp:c@x', 'contact:a', 'nostr:k', 'matrix:!r'],
  );
});

test('a file goes to a network only up to the size it takes; a photo always, as it is made smaller first', () => {
  assert.equal(fitsNetwork('nostr', NETWORK_MOST.nostr, false), true);
  assert.equal(fitsNetwork('nostr', NETWORK_MOST.nostr + 1, false), false);
  assert.equal(fitsNetwork('nostr', 90 * 1024 * 1024, true), true);
  assert.equal(fitsNetwork('matrix', 30 * 1024 * 1024, false), true);
  assert.equal(fitsNetwork('xmpp', 60 * 1024 * 1024, false), false);
});

test('a file handed to a network chat is read whole, and one larger than it takes is not', async () => {
  const bytes = randomBytes(2 * 1024 * 1024 + 123);
  let closed = 0;
  const close = () => void closed++;
  const read = await readWhole('matrix', { name: 'notes.pdf', mime: 'application/pdf', source: bytesSource(bytes), close });
  assert.equal(read.name, 'notes.pdf');
  assert.equal(read.mime, 'application/pdf');
  assert.deepEqual(read.bytes, bytes);
  assert.equal(closed, 1, 'closed once read, so its copy or chunks go');
  const photo = await readWhole('nostr', { name: 'a.jpg', mime: 'image/jpeg', source: bytesSource(bytes.subarray(0, 10)), w: 40, h: 30, close });
  assert.deepEqual([photo.w, photo.h], [40, 30]);
  const large = { size: NETWORK_MOST.nostr + 1, read: async () => new Uint8Array(0) };
  await assert.rejects(readWhole('nostr', { name: 'big.zip', mime: 'application/zip', source: large, close }), /20 MB/);
  assert.equal(closed, 3);
});

test('a file shared as Erevos locks over Send to waits for it after the password', () => {
  const id = 'c'.repeat(32);
  holdLink(`erevos://share?text=&sealed=${id}&name=a.pdf&mime=application%2Fpdf`, 1000);
  assert.ok(takeLink(1000)?.startsWith('/share?'));
  assert.equal(holdsShare(id, 1000), false, 'shown now: left without a pick, it goes');
  // Erevos comes back from the background with the share and locks over Send to.
  lockingKeepsLink(1500);
  assert.equal(holdsShare(id, 1500), true);
  assert.equal(holdsShare('d'.repeat(32), 1500), false);
  assert.equal(holdsShare('', 1500), false);
  assert.ok(takeLink(2000)?.includes(`sealed=${id}`));
  assert.equal(holdsShare(id, 2000), false);
});
