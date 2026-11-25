// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// One invite for everything (lib/welcome.ts): the link that brings someone new in, with the
// inviting phone's contact link, an invite to its relay, the secret said back and its name; read
// back as a scanned link opens its screen, and handed to the chat of the space it was opened in.
// What the secret does once said back is checked with the contacts (checks/e2e.check.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { contactLink, parseContact } from '../lib/contact-code';
import { linkHref, linkParts } from '../lib/open-link';
import { forgetWelcome, offerWelcome, onWelcomeOffered, parseWelcome, welcomeLink, welcomeOf, type Welcome } from '../lib/welcome';

const code = 'cd'.repeat(32);
const hi = 'ab'.repeat(16);
const contact = {
  senderHex: '12'.repeat(24),
  relayUrl: 'wss://relay.example.org/erevos',
  key: 'abc-DEF_123',
  relayKey: 'k'.repeat(43),
  spare: { senderHex: '34'.repeat(24), relayUrl: 'wss://spare.example.org' },
};
const link = contactLink(contact);

test('an invite brings the contact link whole, with the invite to its relay, the secret and the name', () => {
  const welcome = parseWelcome(welcomeLink(link, { code, hi, name: 'Νίκος' }))!;
  assert.deepEqual(welcome.contact, parseContact(link));
  assert.deepEqual(welcome.invite, { relayUrl: contact.relayUrl, code });
  assert.equal(welcome.hi, hi);
  assert.equal(welcome.name, 'Νίκος');
});

test('as a scanned link opens its screen, the screen reads the same invite', () => {
  const made = welcomeLink(link, { code, hi, name: 'Maria & Co = 100%' });
  const href = linkHref(made);
  assert.ok(href.startsWith('/welcome?'), href);
  const { path, params } = linkParts(href);
  assert.equal(path, '/welcome');
  assert.deepEqual(welcomeOf(params), parseWelcome(made));
  assert.equal(welcomeOf(params)?.name, 'Maria & Co = 100%');
});

test('with no invite to the relay, or no name, the rest still works', () => {
  const welcome = parseWelcome(welcomeLink(link, { hi }))!;
  assert.equal(welcome.invite, null);
  assert.equal(welcome.name, '');
  assert.deepEqual(welcome.contact, parseContact(link));
  // An invite that does not read is left out, as one with no invite.
  assert.equal(parseWelcome(`${welcomeLink(link, { hi })}&code=short`)?.invite, null);
});

test('the name comes as one short line, without control or direction marks', () => {
  const welcome = parseWelcome(welcomeLink(link, { hi, name: `  Ma\nria‮\u0007 ${'x'.repeat(80)}` }))!;
  assert.equal(welcome.name, `Ma ria ${'x'.repeat(33)}`);
  assert.equal([...welcome.name].length, 40);
});

test('what is not an invite is not taken for one', () => {
  assert.equal(parseWelcome(link), null);
  assert.equal(parseWelcome('erevos://welcome?'), null);
  // The secret must be 32 hex characters; capitals read as the same.
  assert.equal(parseWelcome(welcomeLink(link, { hi: 'ab'.repeat(15) })), null);
  assert.equal(parseWelcome(welcomeLink(link, { hi: 'zz'.repeat(16) })), null);
  assert.equal(parseWelcome(welcomeLink(link, { hi: hi.toUpperCase() }))?.hi, hi);
  // Who invites has a relay and keys.
  assert.equal(parseWelcome(welcomeLink(contactLink({ ...contact, relayUrl: '' }), { hi })), null);
  assert.equal(parseWelcome(welcomeLink(contactLink({ ...contact, key: '' }), { hi })), null);
  assert.equal(parseWelcome('erevos://welcome?id=%E0%A4%A&hi=' + hi), null);
  assert.throws(() => welcomeLink('erevos://relay-invite?relay=x', { hi }));
});

test('an invite goes to the chat of the space it was opened in, and to no other', () => {
  const welcome = parseWelcome(welcomeLink(link, { code, hi }))!;
  const got: Array<[number, Welcome]> = [];
  // Opened before the chat: it waits for it.
  offerWelcome(welcome, 1);
  const stop = onWelcomeOffered(1, (w) => got.push([1, w]));
  assert.deepEqual(got, [[1, welcome]]);
  // While it is open, at once; one for another space goes to it only when that one's chat opens.
  offerWelcome(welcome, 1);
  offerWelcome(welcome, 2);
  assert.equal(got.length, 2);
  stop();
  const other = onWelcomeOffered(3, (w) => got.push([3, w]));
  assert.equal(got.length, 2);
  other();
  // The space locks: what waited goes.
  offerWelcome(welcome, 2);
  forgetWelcome();
  onWelcomeOffered(2, (w) => got.push([2, w]))();
  assert.equal(got.length, 2);
});

// New chat's first page asks where the other person is; someone setting Erevos up with an invite in
// hand is past that question. The card's own words are what I have their code takes: its QR code
// scanned, its link pasted.
test("First steps' I have an invite opens the page that takes one, not the question before it", () => {
  const read = (name: string) => readFileSync(join(import.meta.dirname, '..', 'app', name), 'utf8');
  const steps = read('first-steps.tsx');
  const card = steps.slice(steps.indexOf("{t('I have an invite')}"), steps.indexOf("{t('Other ways in')}"));
  assert.ok(card.includes("t('Scan its QR code, or open or paste the link they sent you.')"));
  assert.ok(card.includes("router.push('/chat?setup=code')"));
  // The chat opens on that page for it, and Back there leaves New chat as it came.
  const chat = read('chat.tsx');
  assert.ok(chat.includes("codeNow={setup === 'code'}"));
  assert.ok(chat.includes("inviteNow ? 'far' : codeNow ? 'code' : 'root'"));
  assert.ok(chat.includes('useRef(relaySettings || nearbyOpen || inviteNow || codeNow)'));
});
