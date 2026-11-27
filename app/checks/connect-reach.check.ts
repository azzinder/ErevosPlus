// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// What New chat says at the top of how this phone connects (lib/connect-reach.ts): how far it
// reaches, in plain words, and the relay's address with what goes with it.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { connectReach, type Connection } from '../lib/connect-reach';
import { setLang } from '../lib/i18n';

const NONE: Connection = { linked: false, relayUrl: '', queue: false, hidden: false, nostr: false, nearby: true, lent: false, via: false };

test('with a queue on its relay, everything works, and the address shows without its scheme', async () => {
  await setLang('en');
  const ready = connectReach({ ...NONE, relayUrl: ' wss://erevos.lphl.nekten.eu/ ', queue: true });
  assert.equal(ready.reach, 'ready');
  assert.equal(ready.title, 'Through your server');
  assert.match(ready.line, /^Everything works.*with no internet too\.$/);
  assert.equal(ready.detail, 'erevos.lphl.nekten.eu');
  // Where nothing looks for phones nearby (the web app), it does not say they reach you.
  assert.doesNotMatch(connectReach({ ...NONE, relayUrl: 'wss://r.example', queue: true, nearby: false }).line, /no internet/);
  // A lent place and a second relay are said beside the address.
  assert.equal(connectReach({ ...NONE, relayUrl: 'wss://r.example', queue: true, lent: true, via: true }).detail, 'r.example · lent by a contact · through a second server');
  // Hidden chats say their queue is their own.
  assert.match(connectReach({ ...NONE, relayUrl: 'wss://r.example', queue: true, hidden: true }).line, /hidden chats have a queue of their own/);
});

test('a relay with no queue, Nostr, or nothing: each says what is missing and where to go', async () => {
  await setLang('en');
  const noQueue = connectReach({ ...NONE, relayUrl: 'ws://192.168.1.2:7879' });
  assert.deepEqual([noQueue.reach, noQueue.title, noQueue.detail], ['part', 'Getting ready', undefined]);
  const nostr = connectReach({ ...NONE, nostr: true });
  assert.deepEqual([nostr.reach, nostr.title, nostr.detail], ['part', 'Messages only, for now', undefined]);
  assert.match(nostr.line, /ask someone who uses Erevos for an invite/);
  assert.doesNotMatch(nostr.line, /relay|queue/);
  assert.doesNotMatch(connectReach(NONE).line, /relay|queue/);
  assert.deepEqual([connectReach(NONE).reach, connectReach(NONE).title], ['none', 'Only nearby, for now']);
  // Hidden chats with no relay are told where to type one, not to choose a way in; with Nostr they
  // reach their contacts there meanwhile, as the space's chats do.
  const hidden = connectReach({ ...NONE, hidden: true });
  assert.deepEqual([hidden.reach, hidden.title], ['none', 'No server yet']);
  assert.match(hidden.line, /For advanced users/);
  const hiddenNostr = connectReach({ ...NONE, hidden: true, nostr: true });
  assert.deepEqual([hiddenNostr.reach, hiddenNostr.title], ['part', 'Through Nostr, with no server']);
  assert.match(hiddenNostr.line, /calls need a server: type its address under For advanced users/);
});

test('a linked device says it goes through the phone, with no address of its own', async () => {
  await setLang('en');
  const linked = connectReach({ ...NONE, linked: true, relayUrl: 'wss://r.example', queue: true });
  assert.deepEqual([linked.reach, linked.title, linked.detail], ['ready', 'Linked to your phone', undefined]);
});

test('it is said in the chosen language', async () => {
  await setLang('el');
  try {
    assert.equal(connectReach({ ...NONE, hidden: true, nostr: true }).title, 'Μέσω Nostr, χωρίς server');
    assert.equal(connectReach({ ...NONE, relayUrl: 'wss://r.example', queue: true, lent: true }).detail, 'r.example · δανεική θέση από επαφή');
  } finally {
    await setLang('en');
  }
});
