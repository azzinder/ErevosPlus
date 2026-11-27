// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Ways screen's words and lines (lib/ways.ts): each way out of the open space, how it is now,
// and how many of its own messages wait to go.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { setLang } from '../lib/i18n';
import { hostOf, waysNow, type WaysInput } from '../lib/ways';

const BARE: WaysInput = { relay: { url: '', answered: 0, failed: 0, spare: '', via: false }, nostr: null, nearby: null, lora: null, sms: null, tor: null };

const ALL: WaysInput = {
  relay: { url: 'wss://erevos.lphl.nekten.eu/', answered: 2000, failed: 1000, spare: 'wss://relay.dojo-thessaloniki.gr:7879', via: false },
  nostr: { on: true, relays: 4, reading: 3 },
  nearby: { phones: 1, bluetooth: true, lan: true, direct: false, carried: 3 },
  lora: { set: false, status: 'off', name: '' },
  sms: { app: true, contacts: 2 },
  tor: { way: 'off', ready: false },
};

test('every way the device has shows, in order, and only those', async () => {
  await setLang('en');
  assert.deepEqual(
    waysNow(ALL, 0).ways.map((way) => way.id),
    ['relay', 'nostr', 'nearby', 'lora', 'sms', 'tor'],
  );
  // The web app: no radios, no SMS, no Tor; the relay always shows.
  assert.deepEqual(
    waysNow({ ...BARE, nostr: { on: true, relays: 3, reading: 0 } }, 0).ways.map((way) => way.id),
    ['relay', 'nostr'],
  );
});

test('each line is full when the way works, faint when it reaches no one, dashed when off', async () => {
  await setLang('en');
  const looks = Object.fromEntries(waysNow(ALL, 0).ways.map((way) => [way.id, way.look]));
  assert.deepEqual(looks, { relay: 'up', nostr: 'up', nearby: 'up', lora: 'off', sms: 'up', tor: 'off' });
  const relay = waysNow(ALL, 0).ways[0];
  assert.equal(relay.figure, 'erevos.lphl.nekten.eu');
  assert.equal(relay.line, 'It answers. Home server: relay.dojo-thessaloniki.gr.');
  // Not reached at its last try, after it answered once: faint, and it says it tries again.
  const down = waysNow({ ...ALL, relay: { ...ALL.relay, failed: 3000 } }, 0).ways[0];
  assert.equal(down.look, 'trying');
  assert.match(down.line, /cannot be reached now/);
  // No relay at all: dashed.
  assert.equal(waysNow(BARE, 0).ways[0].look, 'off');
  // Nostr on, but no relay of it reads now.
  assert.equal(waysNow({ ...ALL, nostr: { on: true, relays: 3, reading: 0 } }, 0).ways[1].look, 'trying');
  assert.equal(waysNow(ALL, 0).ways[1].figure, '3/4');
  // Nobody near: faint, not off, as it still looks.
  const alone = waysNow({ ...ALL, nearby: { ...ALL.nearby!, phones: 0, carried: 0 } }, 0).ways[2];
  assert.equal(alone.look, 'trying');
  assert.equal(alone.line, 'Looks for phones by Bluetooth, the same Wi-Fi. No phone with Erevos is near now.');
  // What it carries for others is said on the nearby card.
  assert.match(waysNow(ALL, 0).ways[2].line, /You carry 3 encrypted messages of others\.$/);
  // SMS: not the SMS app, or on for no one, is off.
  assert.equal(waysNow({ ...ALL, sms: { app: false, contacts: 2 } }, 0).ways[4].look, 'off');
  assert.equal(waysNow({ ...ALL, sms: { app: true, contacts: 0 } }, 0).ways[4].look, 'off');
  // Tor on and starting, then ready.
  assert.equal(waysNow({ ...ALL, tor: { way: 'messages', ready: false } }, 0).ways[5].look, 'trying');
  assert.equal(waysNow({ ...ALL, tor: { way: 'all', ready: true } }, 0).ways[5].line, 'Everything goes through Tor.');
});

test('the sentence on top names the ways that work, Tor aside, and what waits', async () => {
  await setLang('en');
  const shown = waysNow({ ...ALL, tor: { way: 'messages', ready: true } }, 2);
  assert.equal(shown.lead, 'Messages go out by Server, Nostr, Nearby and SMS.');
  assert.equal(shown.waiting, '2 of your messages wait to go.');
  assert.equal(waysNow(ALL, 1).waiting, '1 of your messages waits to go.');
  assert.equal(waysNow(ALL, 0).waiting, 'Nothing of yours waits to go.');
  assert.match(waysNow(BARE, 0).lead, /^Nothing takes messages now/);
});

test('in Greek, too', async () => {
  await setLang('el');
  const shown = waysNow(ALL, 2);
  assert.equal(shown.waiting, '2 μηνύματά σου περιμένουν να φύγουν.');
  assert.equal(shown.ways[2].figure, '1 τηλέφωνο');
  await setLang('en');
});

test('a relay shows by its host alone', () => {
  assert.equal(hostOf(' wss://relay.example:7879/read '), 'relay.example');
  assert.equal(hostOf('ws://192.168.1.2:7879'), '192.168.1.2');
});
