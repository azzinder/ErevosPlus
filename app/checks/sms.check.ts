// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// SMS invites (lib/sms-invite.ts, lib/sms-link.ts) and SMS rows in the home screen's list
// (lib/inbox.ts). What an SMS or MMS carries besides its words (lib/sms-parts.ts): places in its
// words, sent and read; voice messages and contact cards by their type; a contact sent as a vCard. The invite answer runs with the real core built to WebAssembly by
// checks/build-core.mjs, and is skipped, with a note, without it.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { canSealOpen, relaySeal, setCore, type Core } from '../lib/core';
import { fromHex, randomBytes, toHex } from '../lib/crypto';
import { toBase64Url } from '../lib/e2e';
import { buildInbox } from '../lib/inbox';
import { collectInvites, inviteAnswer, invitePieces, PIECE, plainNumber, sameNumber, type SmsInvite } from '../lib/sms-invite';
import { groupName, sameAddress, sameConversation, smsAddress, smsNumbers } from '../lib/sms-group';
import { cancelLater, sendDue } from '../lib/sms-later';
import type { LaterSmsHolder, LaterSmsState } from '../modules/erevos-sms';
import { chooseSim, simLabel, SmsLink } from '../lib/sms-link';
import { MAX_LATER } from '../lock/sms-data';
import { EMPTY_FIELDS } from '../lib/contacts';
import { setLang } from '../lib/i18n';
import { contactVCard, listWords, partKind, partsOf, partWord, placesIn, placeSms } from '../lib/sms-parts';
import { parseVCards } from '../lib/vcard';
import { files } from './files-memory';

const invite = (relay: string): SmsInvite => ({
  sender: toHex(randomBytes(24)),
  key: randomBytes(32),
  relay,
  relayKey: toBase64Url(randomBytes(32)),
});

test('an invite with a short relay address fits one data SMS and comes back whole', () => {
  const sent = invite('wss://relay.example.org');
  const pieces = invitePieces(sent, randomBytes(4));
  assert.equal(pieces.length, 1);
  assert.ok(pieces[0].length <= PIECE);
  const { invites, waiting } = collectInvites([{ from: '+306900000001', data: pieces[0], at: 5 }]);
  assert.deepEqual(waiting, []);
  assert.deepEqual(invites, [{ from: '+306900000001', invite: sent, at: 5 }]);
});

test('a longer invite comes in pieces, in any order, and waits until all have come', () => {
  const sent = { ...invite(`wss://${'r'.repeat(60)}.example.org/erevos`), relayKey: '' };
  const pieces = invitePieces(sent, randomBytes(4));
  assert.equal(pieces.length, 2);
  const first = collectInvites([{ from: 'a', data: pieces[1], at: 1 }]);
  assert.deepEqual(first.invites, []);
  assert.equal(first.waiting.length, 1);
  const done = collectInvites([...first.waiting, { from: 'a', data: pieces[0], at: 2 }]);
  assert.deepEqual(done.invites, [{ from: 'a', invite: sent, at: 2 }]);
  // The same pieces from another number are another invite.
  assert.equal(collectInvites([{ from: 'b', data: pieces[0], at: 1 }, { from: 'a', data: pieces[1], at: 1 }]).invites.length, 0);
  assert.throws(() => invitePieces({ ...sent, relay: `wss://${'r'.repeat(400)}.org` }, randomBytes(4)));
});

test('pieces that are not invites are dropped', () => {
  const [piece] = invitePieces(invite('ws://relay:7879'), randomBytes(4));
  const bad = [Uint8Array.of(1, 2, 3), piece.map((b, i) => (i === 0 ? 0 : b)), piece.map((b, i) => (i === 7 ? 0 : b))];
  const { invites, waiting } = collectInvites(bad.map((data) => ({ from: 'a', data, at: 1 })));
  assert.deepEqual([invites, waiting], [[], []]);
  // A body whose relay address is not one.
  const wrong = invitePieces({ ...invite('ws://relay:7879') }, Uint8Array.of(1, 2, 3, 4))[0];
  wrong.set(new TextEncoder().encode('http'), wrong.length - 'ws://relay:7879'.length);
  assert.deepEqual(collectInvites([{ from: 'a', data: wrong, at: 1 }]).invites, []);
});

test('the same number written two ways is the same phone', () => {
  assert.equal(plainNumber('+30 690-000 0001'), '+306900000001');
  assert.ok(sameNumber('+30 6900000001', '6900000001'));
  assert.ok(sameNumber('0030 690 000 0001', '+306900000001'));
  assert.ok(!sameNumber('+306900000001', '+306900000002'));
  assert.ok(sameNumber('1234', '1234'));
  assert.ok(!sameNumber('', ''));
});

test('SMS with a linked number go in the contact row, the others get rows of their own', () => {
  const A = 'aa'.repeat(32);
  const rows = buildInbox(
    [{ identity: A, name: 'Άννα', timer: 0, phone: '+306900000001' }],
    [{ peer: `contact:${A}`, text: 'erevos', mine: true, at: 10, mark: 1 }],
    [],
    100,
    [
      { address: '6900000001', text: 'sms from Anna', at: 20, mine: false, unread: 1 },
      { address: '+306911111111', text: 'bank code', at: 30, mine: false, unread: 2 },
    ],
  );
  assert.deepEqual(
    rows.map((r) => [r.name, r.last, r.unread, r.sms, r.lastSms]),
    [
      ['+306911111111', 'bank code', 2, '+306911111111', true],
      ['Άννα', 'sms from Anna', 1, '', true],
    ],
  );
});

test('an SMS number with a name from the phone\'s contacts shows it, and keeps its number', () => {
  const rows = buildInbox([], [], [], 100, [{ address: '+306911111111', text: 'hi', at: 30, mine: false, unread: 0, name: 'Γιώργος' }, { address: '+306922222222', text: 'yo', at: 20, mine: false, unread: 0 }]);
  assert.deepEqual(
    rows.map((r) => [r.name, r.sms]),
    [
      ['Γιώργος', '+306911111111'],
      ['+306922222222', '+306922222222'],
    ],
  );
});

test('the SIM for a number: the one chosen, else the one its last message came on, else the default', () => {
  const two = [
    { id: 3, slot: 0, name: 'Vodafone' },
    { id: 7, slot: 1, name: 'Cosmote' },
  ];
  assert.equal(chooseSim(two, 7, 3), 7);
  assert.equal(chooseSim(two, -1, 3), 3);
  // A SIM taken out of the phone is not chosen.
  assert.equal(chooseSim(two, 9, -1), -1);
  assert.equal(chooseSim(two, 9, 7), 7);
  // With one SIM there is nothing to choose.
  assert.equal(chooseSim([two[0]], 3, 3), -1);
  assert.equal(simLabel(two, 7), 'SIM 2');
  assert.equal(simLabel(two, -1), '');
});

test('names from contacts start off, and the SIM chosen for a number is kept, sealed in the space', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  assert.equal(link.names, false);
  assert.equal(link.simFor('+306911111111'), -1);
  await link.setNames(true);
  await link.setSim('+30 691 111 1111', 7);
  await link.setSim('6922222222', 3);
  const again = await SmsLink.open(0, key);
  assert.equal(again.names, true);
  // The same number, written either way.
  assert.equal(again.simFor('6911111111'), 7);
  assert.equal(again.simFor('+306922222222'), 3);
  await again.setSim('+306911111111', -1);
  assert.equal((await SmsLink.open(0, key)).simFor('+306911111111'), -1);
  assert.equal((await SmsLink.open(0, key)).simFor('+306922222222'), 3);
  // Another space's key opens nothing of it.
  assert.equal((await SmsLink.open(0, randomBytes(32)).catch(() => null))?.names ?? false, false);
});

test('a group MMS: several numbers make one address, each number once, in any order', () => {
  assert.deepEqual(smsNumbers('+30 691 111 1111, 6922222222;+306911111111, x, 12'), ['+306911111111', '6922222222']);
  assert.equal(smsAddress(smsNumbers('+306911111111,+306922222222')), '+306911111111,+306922222222');
  assert.ok(sameAddress('+306911111111,+306922222222', '6922222222, 6911111111'));
  assert.ok(!sameAddress('+306911111111,+306922222222', '+306911111111'));
  assert.ok(!sameAddress('+306911111111', '+306911111111,+306922222222'));
  assert.equal(groupName(['+306911111111', '+306922222222'], { '+306922222222': 'Νίκος' }), '+306911111111, Νίκος');
});

test('a sender that writes with a name is one conversation by that name, and never a number\'s', () => {
  assert.ok(sameConversation('BANK', ' bank'));
  assert.ok(!sameConversation('BANK', 'SHOP'));
  assert.ok(!sameConversation('BANK', '+306911111111'));
  // A name with digits is a name, not the number its digits make.
  assert.ok(!sameConversation('PROMO2024', 'SALE2024'));
  assert.ok(sameConversation('PROMO2024', 'promo2024'));
  assert.deepEqual(smsNumbers('PROMO2024'), []);
  assert.ok(!sameConversation('+306911111111', 'BANK'));
  assert.ok(sameConversation('+306911111111,+306922222222', '6922222222, 6911111111'));
  assert.ok(!sameConversation('', ''));
});

test('a group MMS conversation keeps its own row, even with a contact\'s number in it', () => {
  const A = 'aa'.repeat(32);
  const rows = buildInbox(
    [{ identity: A, name: 'Άννα', timer: 0, phone: '+306922222222' }],
    [],
    [],
    100,
    [{ address: '+306911111111,+306922222222', text: 'to all', at: 30, mine: false, unread: 1, name: '+306911111111, Άννα' }],
  );
  const group = rows.find((r) => r.sms);
  assert.equal(group?.sms, '+306911111111,+306922222222');
  assert.equal(group?.name, '+306911111111, Άννα');
  assert.equal(rows.find((r) => r.identity.endsWith(A))?.lastSms ?? false, false);
});

test('the SIM chosen for a group is kept for the group, not for its numbers', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  await link.setSim('+306911111111,+306922222222', 7);
  const again = await SmsLink.open(0, key);
  assert.equal(again.simFor('6922222222,6911111111'), 7);
  assert.equal(again.simFor('+306911111111'), -1);
});

test('SMS sent for later are kept sealed in the space, the soonest first, and go once their time came', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  assert.deepEqual(link.later, []);
  assert.ok(await link.addLater({ to: '+306911111111', text: 'second', at: 200, sim: -1 }));
  assert.ok(await link.addLater({ to: '+306922222222', text: 'first', at: 100, sim: 3 }));
  const again = await SmsLink.open(0, key);
  assert.deepEqual(again.later.map((l) => [l.to, l.text, l.at, l.sim]), [['+306922222222', 'first', 100, 3], ['+306911111111', 'second', 200, -1]]);
  assert.deepEqual((await SmsLink.open(0, randomBytes(32)).catch(() => null))?.later ?? [], []);

  const sent: string[] = [];
  const send = async (to: string, text: string, sim: number) => {
    sent.push(`${to} ${text} ${sim}`);
  };
  // Not before its time; then only the one whose time came, forgotten once it went.
  assert.deepEqual(await sendDue(again, send, 50), { went: [], next: 100 });
  const first = await sendDue(again, send, 150);
  assert.deepEqual([first.went.map((l) => l.text), first.next], [['first'], 200]);
  assert.deepEqual(sent, ['+306922222222 first 3']);
  assert.deepEqual((await SmsLink.open(0, key)).later.map((l) => l.text), ['second']);
  // One that cannot go stays, and is tried again a while later.
  const failing = await sendDue(again, async () => Promise.reject(new Error('no')), 250);
  assert.deepEqual([failing.went, failing.next], [[], 250 + 5 * 60_000]);
  assert.equal((await SmsLink.open(0, key)).later.length, 1);
  // Cancelled, it is gone.
  await again.removeLater(again.later[0].id);
  assert.deepEqual((await SmsLink.open(0, key)).later, []);
  assert.deepEqual(await sendDue(again, send, 1000), { went: [], next: 0 });
});

// Android holding SMS for later, as LaterSms.kt does: what it was given, and what went.
function fakeHolder() {
  const held = new Map<string, { to: string; text: string; at: number }>();
  const went = new Set<string>();
  const holder: LaterSmsHolder = {
    schedule: async (sms) => void held.set(sms.id, sms),
    cancel: async (id) => held.delete(id),
    state: async (ids) => Object.fromEntries(ids.map((id): [string, LaterSmsState] => [id, held.has(id) ? 'waiting' : went.has(id) ? 'went' : 'unknown'])),
  };
  const fire = (now: number) => {
    for (const [id, sms] of held) if (sms.at <= now) {
      held.delete(id);
      went.add(id);
    }
  };
  return { holder, held, fire };
}

test('Android holds SMS for later, and the space forgets each once Android says it went', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  assert.ok(await link.addLater({ to: '+306944444444', text: 'ahead', at: 500, sim: -1 }));
  assert.ok(await link.addLater({ to: '+306955555555', text: 'due before', at: 50, sim: 1 }));
  const { holder, held, fire } = fakeHolder();
  const sent: string[] = [];
  const send = async (to: string, text: string) => void sent.push(`${to} ${text}`);
  // One kept before Android held them, whose time came, goes from here; the other goes to Android,
  // and needs no timer here.
  const first = await sendDue(link, send, 100, holder);
  assert.deepEqual([first.went.map((l) => l.text), first.next, sent], [['due before'], 0, ['+306955555555 due before']]);
  assert.deepEqual([...held.values()].map((h) => h.text), ['ahead']);
  assert.deepEqual(link.later.map((l) => l.text), ['ahead']);
  // Not sent twice, nor given to Android again; late at Android, it is looked at again a while later.
  assert.deepEqual(await sendDue(link, send, 400, holder), { went: [], next: 0 });
  assert.equal((await sendDue(link, send, 600, holder)).next, 600 + 5 * 60_000);
  assert.equal(sent.length, 1);
  // Android sent it: the space forgets it.
  fire(600);
  const after = await sendDue(link, send, 601, holder);
  assert.deepEqual([after.went.map((l) => l.text), after.next, sent.length], [['ahead'], 0, 1]);
  assert.deepEqual((await SmsLink.open(0, key)).later, []);
  // When Android cannot say what it holds, nothing goes from here, as it may send them itself.
  assert.ok(await link.addLater({ to: '+306944444444', text: 'unsure', at: 610, sim: -1 }));
  const unsure: LaterSmsHolder = { ...holder, state: async () => Promise.reject(new Error('no')) };
  assert.deepEqual(await sendDue(link, send, 620, unsure), { went: [], next: 620 + 5 * 60_000 });
  assert.equal(sent.length, 1);
  await link.removeLater(link.later[0].id);
  // Without Android's hold, it goes from here at its time, as before.
  assert.ok(await link.addLater({ to: '+306944444444', text: 'here', at: 700, sim: -1 }));
  assert.deepEqual(await sendDue(link, send, 650, null), { went: [], next: 700 });
});

test('a cancelled SMS for later is gone from Android and the space, or says it had gone', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  const { holder, held, fire } = fakeHolder();
  assert.ok(await link.addLater({ to: '+306944444444', text: 'one', at: 500, sim: -1 }));
  assert.ok(await link.addLater({ to: '+306944444444', text: 'two', at: 900, sim: -1 }));
  await sendDue(link, async () => undefined, 100, holder);
  assert.equal(held.size, 2);
  const [one, two] = link.later;
  assert.equal(await cancelLater(link, one.id, holder), true);
  assert.deepEqual([[...held.values()].map((h) => h.text), link.later.map((l) => l.text)], [['two'], ['two']]);
  fire(900);
  assert.equal(await cancelLater(link, two.id, holder), false);
  assert.equal(link.later.length, 0);
  // When Android cannot be asked, nothing is forgotten.
  assert.ok(await link.addLater({ to: '+306944444444', text: 'three', at: 999, sim: -1 }));
  const broken: LaterSmsHolder = { ...holder, cancel: async () => Promise.reject(new Error('no')) };
  await assert.rejects(cancelLater(link, link.later[0].id, broken));
  assert.deepEqual(link.later.map((l) => l.text), ['three']);
});

test('no more than MAX_LATER SMS wait to go later, and none is dropped for a new one', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  for (let i = 0; i < MAX_LATER; i++) assert.ok(await link.addLater({ to: '+306933333333', text: `n${i}`, at: 1000 + i, sim: -1 }));
  assert.equal(await link.addLater({ to: '+306933333333', text: 'one more', at: 5, sim: -1 }), false);
  const kept = (await SmsLink.open(0, key)).later;
  assert.deepEqual([kept.length, kept[0].text], [MAX_LATER, 'n0']);
});

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
if (existsSync(built)) {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core);
}
// A core built before SMS invites has no sealOpen: build it again.
const sealing = existsSync(built) && canSealOpen();
if (!sealing) console.log('Skipping the SMS invite answer check: build the core (again) with node checks/build-core.mjs');

test('an invite answered through the relay gives the inviter the link, once', { skip: !sealing }, async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  const own = { senderHex: toHex(randomBytes(24)), relay: 'wss://relay.example.org', relayKey: '' };
  const sent: Uint8Array[] = [];
  assert.ok(link.wantsInvite('+306900000001'));
  await link.invite('+306900000001', own, async (_number, piece) => void sent.push(piece));
  assert.ok(!link.wantsInvite('6900000001'));

  // The invited phone answers with its link, sealed to the invite's key.
  const [got] = collectInvites(sent.map((data) => ({ from: '+306900000002', data, at: 1 }))).invites;
  assert.equal(got.invite.sender, own.senderHex);
  const answer = await relaySeal(got.invite.key, fromHex(toHex(randomBytes(24))), inviteAnswer('erevos://contact?id=x'));

  // Another screen's copy sees what was sent, and opens the answer.
  const other = await SmsLink.open(0, key);
  assert.equal(await other.openAnswer(randomBytes(80)), null);
  assert.deepEqual(await other.openAnswer(answer), { number: '+306900000001', link: 'erevos://contact?id=x', name: '' });
  assert.equal(await other.openAnswer(answer), null);
  await link.refresh();
  assert.ok(!link.waiting);

  // The invited side remembers whose first message to accept.
  await other.answered('+30 690 000 0002', own.senderHex);
  assert.deepEqual((await SmsLink.open(0, key)).answeredFor(own.senderHex), { number: '+306900000002', name: '' });
  assert.equal((await SmsLink.open(0, key)).answeredFor('ab'.repeat(24)), null);
});

test('a place goes as an SMS of plain ASCII, its geo: address and a map link, and comes back as one place', () => {
  const text = placeSms({ lat: 37.97536, lon: 23.73495, acc: 12 });
  assert.equal(text, 'geo:37.97536,23.73495;u=12\nhttps://www.openstreetmap.org/?mlat=37.97536&mlon=23.73495#map=17/37.97536/23.73495');
  // GSM's own letters, so one SMS of 160 holds it.
  assert.ok(/^[\x20-\x7e\n]+$/.test(text) && text.length <= 160);
  assert.deepEqual(placesIn(text), [{ lat: 37.97536, lon: 23.73495, acc: 12 }]);
  assert.deepEqual(placesIn(placeSms({ lat: -33.8688, lon: 151.2093 })), [{ lat: -33.8688, lon: 151.2093 }]);
});

test('places in the words of an SMS: geo: addresses and the links of maps sites, each once, in order', () => {
  const at = (lat: number, lon: number) => ({ lat, lon });
  assert.deepEqual(placesIn('Here: geo:0,0?q=37.9715,23.7257(Acropolis) see you'), [at(37.9715, 23.7257)]);
  assert.deepEqual(placesIn('geo:0,0'), []);
  assert.deepEqual(placesIn('https://maps.google.com/?q=40.6892,-74.0445'), [at(40.6892, -74.0445)]);
  assert.deepEqual(placesIn('https://www.google.com/maps/search/?api=1&query=48.8584%2C2.2945.'), [at(48.8584, 2.2945)]);
  assert.deepEqual(placesIn('https://www.google.com/maps/@51.5007,-0.1246,17z'), [at(51.5007, -0.1246)]);
  assert.deepEqual(placesIn('https://www.google.gr/maps/place/38.2466,21.7346'), [at(38.2466, 21.7346)]);
  assert.deepEqual(placesIn('Apple: https://maps.apple.com/?ll=35.6586,139.7454&q=Tower'), [at(35.6586, 139.7454)]);
  assert.deepEqual(placesIn('https://www.openstreetmap.org/#map=16/41.0082/28.9784'), [at(41.0082, 28.9784)]);
  assert.deepEqual(placesIn('https://osm.org/?mlat=59.3293&mlon=18.0686'), [at(59.3293, 18.0686)]);
  assert.deepEqual(placesIn('https://waze.com/ul?ll=45.4642,9.19&navigate=yes'), [at(45.4642, 9.19)]);
  // Two places, in the order written, and the same one twice once.
  assert.deepEqual(placesIn('geo:1.5,2.5 then https://maps.google.com/?q=3.5,4.5 and geo:1.5,2.5'), [at(1.5, 2.5), at(3.5, 4.5)]);
  // What says no place: a short link (only its site knows), a search by name, another site, a place off the earth.
  assert.deepEqual(placesIn('https://maps.app.goo.gl/AbCdEf123'), []);
  assert.deepEqual(placesIn('https://maps.google.com/?q=Athens'), []);
  assert.deepEqual(placesIn('https://example.com/?q=37.9,23.7 and geo:91,10'), []);
  assert.deepEqual(placesIn('no place 37.9,23.7'), []);
});

test('the parts of an MMS by their type, and the words the list says of one without text', async () => {
  assert.equal(partKind('image/jpeg'), 'picture');
  assert.equal(partKind('audio/amr'), 'voice');
  assert.equal(partKind('Audio/3GPP; codecs=samr'), 'voice');
  assert.equal(partKind('application/ogg'), 'voice');
  assert.equal(partKind('text/x-vcard'), 'card');
  assert.equal(partKind('text/vcard; charset=utf-8'), 'card');
  assert.equal(partKind('application/smil'), null);
  assert.deepEqual(
    partsOf({ pictures: [{ uri: 'a', type: 'image/png' }], voices: [{ uri: 'b', type: 'audio/amr' }], cards: [{ uri: 'c', type: 'text/x-vcard' }] }).map((p) => p.uri),
    ['a', 'b', 'c'],
  );
  // A build before them says none.
  assert.deepEqual(partsOf({}), []);
  await setLang('el');
  assert.equal(partWord('audio/amr'), 'Φωνητικό μήνυμα');
  assert.equal(partWord('text/x-vcard'), 'Κάρτα επαφής');
  assert.equal(listWords('Voice message'), 'Φωνητικό μήνυμα');
  assert.equal(listWords('Picture'), 'Εικόνα');
  assert.equal(listWords('Hello'), 'Hello');
  await setLang('en');
});

test('a contact goes as a vCard without the owner\'s note and groups, and without its photo when too large', () => {
  const card = {
    ...EMPTY_FIELDS,
    given: 'Μαρία',
    family: 'Παπά',
    name: 'Μαρία Παπά',
    phones: [{ value: '+30 691 000 0001', kind: 'mobile' as const, label: '' }],
    note: 'owes me 20',
    groups: [3, 4],
  };
  const small = new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]);
  const text = new TextDecoder().decode(contactVCard(card, small, 280 * 1024));
  assert.ok(!/NOTE|CATEGORIES|owes/.test(text));
  assert.match(text, /PHOTO;ENCODING=b;TYPE=JPEG:/);
  const [back] = parseVCards(contactVCard(card, small, 280 * 1024));
  assert.equal(back.name, 'Μαρία Παπά');
  assert.deepEqual(back.phones.map((p) => p.value), ['+30 691 000 0001']);
  // A photo that would make it too large for an MMS stays out.
  const large = new Uint8Array(4000).fill(7);
  const bytes = contactVCard(card, large, 2000);
  assert.ok(bytes.length <= 2000);
  assert.ok(!new TextDecoder().decode(bytes).includes('PHOTO'));
});

test('an SMS counts as the phone company counts it, and goes without accents in capitals when chosen', async () => {
  const { smsCount, withoutAccents, isGsm } = await import('../lib/sms-count');
  assert.deepEqual(smsCount('a'.repeat(160)), { used: 160, parts: 1, each: 160, gsm: true });
  assert.deepEqual(smsCount('a'.repeat(161)), { used: 161, parts: 2, each: 153, gsm: true });
  // A letter of the extension table counts twice.
  assert.equal(smsCount('€'.repeat(80)).used, 160);
  assert.equal(smsCount('€'.repeat(81)).parts, 2);
  // Greek small letters make it UCS-2: 70 in one, 67 in each part.
  assert.deepEqual(smsCount('α'.repeat(70)), { used: 70, parts: 1, each: 70, gsm: false });
  assert.equal(smsCount('α'.repeat(71)).parts, 2);
  assert.equal(smsCount('α'.repeat(135)).parts, 3);
  // The Greek capitals that look Latin go Latin; Δ Λ Σ Ω and the others stay.
  assert.equal(withoutAccents('Ναί, θά έρθω στίς 8!'), 'NAI, ΘA EPΘΩ ΣTIΣ 8!');
  assert.equal(withoutAccents('Καλημέρα «φίλε»…'), 'KAΛHMEPA "ΦIΛE"...');
  assert.ok(isGsm(withoutAccents('ΐ ΰ ϊ ϋ άέήίόύώ ς') ?? ''));
  assert.equal(withoutAccents('plain words'), 'plain words');
  assert.equal(withoutAccents('Ναι 👍'), null);
  assert.equal(withoutAccents('Да'), null);
  assert.equal(smsCount(withoutAccents('α'.repeat(150)) ?? '').parts, 1);
});

test('a video of an MMS is a video, in the list and among its parts', async () => {
  const { partKind, partsOf } = await import('../lib/sms-parts');
  assert.equal(partKind('video/3gpp'), 'video');
  assert.equal(partKind('video/mp4; name=clip.mp4'), 'video');
  const video = { uri: 'content://mms/part/9', type: 'video/mp4' };
  assert.deepEqual(partsOf({ pictures: [], voices: [], cards: [], videos: [video] }), [video]);
});

test("an iPhone's or Google Messages' reaction by SMS shows as a mark on the message it names", async () => {
  const { reactionOf, withReactions } = await import('../lib/sms-reactions');
  assert.deepEqual(reactionOf('Liked “See you at 8”'), { emoji: '👍', quoted: 'See you at 8', removed: false, picture: false });
  assert.deepEqual(reactionOf('Reacted 😂 to "See you at 8"'), { emoji: '😂', quoted: 'See you at 8', removed: false, picture: false });
  assert.equal(reactionOf('Removed a heart from “See you at 8”')?.removed, true);
  assert.equal(reactionOf('Loved an image')?.picture, true);
  assert.equal(reactionOf('I liked “the film”'), null);
  assert.equal(reactionOf('Reacted badly to “that”'), null);
  const at = (n: number) => 1_700_000_000_000 + n * 1000;
  const sms = (id: number, text: string, mine: boolean) => ({ id, kind: 'sms' as const, text, at: at(id), mine, state: 'done', read: true, sim: -1 });
  const messages = [
    sms(1, 'Έρχομαι σε 10\'', true),
    sms(2, 'Liked “Έρχομαι σε 10\'”', false),
    sms(3, 'A long one that an iPhone cuts when it quotes it in a reaction, as it does', true),
    sms(4, 'Loved “A long one that an iPhone cuts…”', false),
    sms(5, 'Laughed at “nothing said here”', false),
    sms(6, 'Removed a like from “Έρχομαι σε 10\'”', false),
  ];
  const { lines, marks } = withReactions(messages as never);
  assert.deepEqual(lines.map((m) => m.id), [1, 3, 5]);
  assert.deepEqual(marks.get('sms:1'), []);
  assert.deepEqual(marks.get('sms:3'), ['❤️']);
});

test('quick texts are the app\'s own until the owner keeps theirs, each kept once', async () => {
  const { checked } = await import('../lock/sms-data');
  assert.equal(checked({}).quick, null);
  assert.deepEqual(checked({ quick: ['On my way', 'On my way', '', 7, 'x'.repeat(400), 'Later'] }).quick, ['On my way', 'Later']);
});

test("an MMS video's type is read from its bytes, not its name", async () => {
  const { videoMimeOf } = await import('../lib/video-type');
  const box = (brand: string) => new Uint8Array([0, 0, 0, 24, ...'ftyp'.split('').map((c) => c.charCodeAt(0)), ...brand.split('').map((c) => c.charCodeAt(0)), 0, 0, 0, 0]);
  assert.equal(videoMimeOf(box('3gp4'), 'video/mp4'), 'video/3gpp');
  assert.equal(videoMimeOf(box('3g2a'), 'video/mp4'), 'video/3gpp2');
  assert.equal(videoMimeOf(box('isom'), 'video/3gpp'), 'video/mp4');
  assert.equal(videoMimeOf(box('mp42'), 'video/3gpp'), 'video/mp4');
  assert.equal(videoMimeOf(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 1]), 'video/mp4'), 'video/webm');
  assert.equal(videoMimeOf(new Uint8Array([1, 2, 3]), 'video/3gpp'), 'video/3gpp');
});
