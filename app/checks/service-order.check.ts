// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The order of the services on home and those hidden there (lib/service-order.ts).
// Run with: npm run check
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { arrangeServices, readServiceOrder, servicePart, startPart } from '../lib/service-order';

test('All messages stays first and is never hidden; the rest follow the order kept, new ones after', () => {
  const kept = { order: ['nostr', 'sms'], hidden: ['xmpp'] };
  assert.deepEqual(arrangeServices(['all', 'sms', 'erevos', 'xmpp', 'nostr'], kept), { shown: ['all', 'nostr', 'sms', 'erevos'], hidden: ['xmpp'] });
  assert.deepEqual(arrangeServices(['all', 'sms', 'erevos'], { order: ['all', 'erevos'], hidden: ['all'] }), { shown: ['all', 'erevos', 'sms'], hidden: [] });
  assert.deepEqual(arrangeServices(['all', 'sms', 'erevos'], { order: [], hidden: [] }), { shown: ['all', 'sms', 'erevos'], hidden: [] });
});

test('what was kept is read safely', () => {
  assert.deepEqual(readServiceOrder(null), { order: [], hidden: [] });
  assert.deepEqual(readServiceOrder('not json'), { order: [], hidden: [] });
  assert.deepEqual(readServiceOrder('{"order":["sms",3],"hidden":["all","nostr"]}'), { order: ['sms'], hidden: ['nostr'] });
});

test('a chat is of its network, the SMS, or Erevos', () => {
  assert.equal(servicePart({ sms: '', network: 'matrix' }), 'matrix');
  assert.equal(servicePart({ sms: '+300000000001' }), 'sms');
  assert.equal(servicePart({ sms: '' }), 'erevos');
});

test('the part Erevos opens on: kept, All messages when none or when hidden', () => {
  assert.deepEqual(readServiceOrder('{"order":[],"hidden":[],"start":"telegram"}'), { order: [], hidden: [], start: 'telegram' });
  assert.deepEqual(readServiceOrder('{"order":[],"hidden":[],"start":"all"}'), { order: [], hidden: [] });
  assert.equal(startPart({ order: [], hidden: [] }), 'all');
  assert.equal(startPart({ order: [], hidden: [], start: 'erevos' }), 'erevos');
  assert.equal(startPart({ order: [], hidden: ['erevos'], start: 'erevos' }), 'all');
});

test('a service hidden on home tells of nothing and counts on no icon; Telegram has its own way', async () => {
  const { addNetwork, hearing, inHiddenService, networkUnreadAt, onNetworkMessage, setHiddenServices } = await import('../lib/network-notices');
  addNetwork('signal:', { unread: () => new Map([['signal:7', 2]]), notifyOf: () => null });
  const told: string[] = [];
  const stop = onNetworkMessage((where) => told.push(where));
  const ear = hearing();
  ear.hear(new Map());
  setHiddenServices(['signal', 'telegram']);
  assert.equal(inHiddenService('signal:7'), true);
  assert.equal(inHiddenService('telegram:1'), false);
  assert.equal(networkUnreadAt().has('signal:7'), false);
  ear.hear(new Map([['signal:7', 1]]));
  assert.deepEqual(told, []);
  setHiddenServices([]);
  assert.equal(networkUnreadAt().get('signal:7'), 2);
  ear.hear(new Map([['signal:7', 2]]));
  assert.deepEqual(told, ['signal:7']);
  stop();
});
