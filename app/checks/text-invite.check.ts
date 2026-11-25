// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Invites by plain SMS (lib/text-invite.ts): the link that goes in the SMS, read back as the page
// opens it in the app or as it is pasted, what is not one, and its hand-over to the chat of the
// space it was opened in; and what the inviting and the invited phone keep of it (lib/sms-link.ts).
// How the answer is sealed and opened is the SMS invites' (checks/sms.check.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fromHex, randomBytes, sha256Bytes, toHex, utf8Decode } from '../lib/crypto';
import { toBase64Url } from '../lib/e2e';
import { linkHref, linkParts } from '../lib/open-link';
import { SmsLink } from '../lib/sms-link';
import {
  forgetTextInvite,
  inviteId,
  offerTextInvite,
  onTextInviteOffered,
  parseTextInvite,
  TEXT_INVITE_PAGE,
  textInviteLink,
  textInviteOf,
  type TextInvite,
} from '../lib/text-invite';
import { START_RELAY } from '../lib/welcome';
import { files } from './files-memory';

const made = (change: Partial<TextInvite> = {}): TextInvite => ({
  sender: toHex(randomBytes(24)),
  key: randomBytes(32),
  code: toHex(randomBytes(32)),
  relay: START_RELAY,
  relayKey: toBase64Url(randomBytes(32)),
  name: 'Νίκος',
  expires: 1_800_000_000_000,
  ...change,
});

// What follows # in the link, as the page hands it to the app.
const data = (link: string) => link.slice(link.indexOf('#') + 1);

test('the link brings the invite whole, short enough for an SMS', () => {
  const invite = made();
  const link = textInviteLink(invite);
  assert.ok(link.startsWith(`${TEXT_INVITE_PAGE}#`));
  assert.deepEqual(parseTextInvite(link), invite);
  // LPHL's relay goes unnamed: a link of about 220 characters.
  assert.ok(link.length <= 230, `${link.length}`);
  const other = made({ relay: 'wss://relay.example.org/erevos', relayKey: '', name: '' });
  assert.deepEqual(parseTextInvite(textInviteLink(other)), other);
});

test('the page opens it in the app, and a pasted link is read too', () => {
  const invite = made();
  const link = textInviteLink(invite);
  const app = `erevos://text-invite?d=${data(link)}`;
  assert.deepEqual(parseTextInvite(app), invite);
  // As a link that opens Erevos, it is the route app/text-invite.tsx with the same invite.
  const { path, params } = linkParts(linkHref(app));
  assert.equal(path, '/text-invite');
  assert.deepEqual(textInviteOf(params.d), invite);
  assert.deepEqual(parseTextInvite(`  ${link}\n`), invite);
  // The server answers /i with /i/, so the address bar can show /i/#.
  assert.deepEqual(parseTextInvite(link.replace('/i#', '/i/#')), invite);
  assert.equal(parseTextInvite(link.replace('/i#', '/ix#')), null);
});

test('the time it is over comes in whole seconds', () => {
  const invite = parseTextInvite(textInviteLink(made({ expires: 1_800_000_000_999 })))!;
  assert.equal(invite.expires, 1_800_000_000_000);
});

test('the name comes as one short line, without control or direction marks', () => {
  const invite = parseTextInvite(textInviteLink(made({ name: `  Ma\nria\u202e\u0007 ${'x'.repeat(200)}` })))!;
  assert.ok(invite.name.startsWith('Ma ria'));
  assert.ok(!/[\u0000-\u001f\u202e]/.test(invite.name));
  assert.ok(new TextEncoder().encode(invite.name).length <= 120);
});

test('a name that is not UTF-8 is read without failing', () => {
  // F5 to FF start no UTF-8; read as four bytes they named a code point past U+10FFFF.
  assert.equal(utf8Decode(Uint8Array.from([0x61, 0xff, 0xbf, 0xbf, 0xbf, 0x62])), 'a\ufffdb');
  const bytes = Buffer.from(data(textInviteLink(made())), 'base64url');
  for (let lead = 0xf5; lead <= 0xff; lead++) {
    const copy = Uint8Array.from(bytes);
    copy[126] = 120;
    copy.fill(lead, 127, 135);
    assert.doesNotThrow(() => parseTextInvite(`${TEXT_INVITE_PAGE}#${Buffer.from(copy).toString('base64url')}`));
  }
});

test('what is not an invite by SMS is not taken for one', () => {
  const link = textInviteLink(made());
  const bytes = Buffer.from(data(link), 'base64url');
  const changed = (at: number, value: number) => {
    const copy = Uint8Array.from(bytes);
    copy[at] = value;
    return `${TEXT_INVITE_PAGE}#${Buffer.from(copy).toString('base64url')}`;
  };
  assert.equal(parseTextInvite(changed(0, 2)), null);
  assert.equal(parseTextInvite(changed(1, 4)), null);
  assert.equal(parseTextInvite(`${TEXT_INVITE_PAGE}#${Buffer.from(bytes.subarray(0, 94)).toString('base64url')}`), null);
  // A name longer than the rest of the link says.
  assert.equal(parseTextInvite(changed(126, 120)), null);
  assert.equal(parseTextInvite(link.replace('#', '#!')), null);
  // On another server it is read as on LPHL's (lib/servers.ts, checks/servers.check.ts), but only
  // over https and at /i.
  assert.deepEqual(parseTextInvite(`https://example.org/i#${data(link)}`), parseTextInvite(link));
  assert.equal(parseTextInvite(`http://example.org/i#${data(link)}`), null);
  assert.equal(parseTextInvite(`https://example.org/x/i#${data(link)}`), null);
  assert.equal(parseTextInvite('erevos://text-invite?d='), null);
  assert.equal(textInviteOf(undefined), null);
  // A relay without TLS is taken only on a private network, as an invite to a relay is.
  assert.equal(parseTextInvite(textInviteLink(made({ relay: 'ws://relay.example.org' }))), null);
  assert.ok(parseTextInvite(textInviteLink(made({ relay: 'ws://192.168.178.29:7879' }))));
});

test('the relay knows the invite by the first half of its secret’s SHA-256', () => {
  const code = 'cd'.repeat(32);
  assert.equal(inviteId(code), toHex(sha256Bytes(fromHex(code)).subarray(0, 16)));
  assert.match(inviteId(code), /^[0-9a-f]{32}$/);
});

test('an invite goes to the chat of the space it was opened in, and to no other', () => {
  const invite = made();
  const got: [number, TextInvite][] = [];
  offerTextInvite(invite, 1);
  const stop = onTextInviteOffered(1, (i) => got.push([1, i]));
  assert.deepEqual(got, [[1, invite]]);
  offerTextInvite(invite, 2);
  const other = onTextInviteOffered(3, (i) => got.push([3, i]));
  assert.equal(got.length, 1);
  other();
  stop();
  offerTextInvite(invite, 2);
  forgetTextInvite();
  onTextInviteOffered(2, (i) => got.push([2, i]))();
  assert.equal(got.length, 1);
});

test('the inviting phone keeps its invite by SMS until it is over, then lets go of what it no longer needs', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  const code = 'ef'.repeat(32);
  const secret = randomBytes(32);
  await link.textInvited('+30 690 000 0001', secret, code, 'Μαρία');
  // No hidden invite goes with a first SMS to that number as well.
  assert.ok(!link.wantsInvite('+306900000001'));
  assert.ok(link.waiting);
  const kept = await SmsLink.open(0, key);
  assert.deepEqual(kept.textInvitesDue(Date.now() - 1000), []);
  const [due] = kept.textInvitesDue(Date.now() + 1000);
  assert.deepEqual([due.number, due.code, due.name], ['+306900000001', code, 'Μαρία']);
  // Used by a phone: only the invite to the relay goes, so it may still answer.
  await kept.settleTextInvite(due.secret, false);
  assert.deepEqual(kept.textInvitesDue(Date.now() + 1000), []);
  assert.ok((await SmsLink.open(0, key)).waiting);
  // Not used: it is forgotten.
  await kept.textInvited('+306900000002', randomBytes(32), code, '');
  const [unused] = kept.textInvitesDue(Date.now() + 1000);
  await kept.settleTextInvite(unused.secret, true);
  assert.deepEqual((await SmsLink.open(0, key)).state.sent.map((s) => s.number), ['+306900000001']);
});

test('the invited phone takes the first message of whoever sent it, with the name given them', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  const sender = toHex(randomBytes(24));
  await link.answered('', sender, '  Νίκος ');
  assert.deepEqual((await SmsLink.open(0, key)).answeredFor(sender), { number: '', name: 'Νίκος' });
  // Answered again, as when the first answer was lost: one entry.
  await link.answered('', sender);
  assert.deepEqual((await SmsLink.open(0, key)).answeredFor(sender), { number: '', name: '' });
  assert.equal((await SmsLink.open(0, key)).state.got.length, 1);
});

test('an invite shown as a QR code has no number, lasts its own days, and takes a name later', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  const code = 'ab'.repeat(32);
  const secret = randomBytes(32);
  await link.textInvited('', secret, code, '', 7);
  const kept = await SmsLink.open(0, key);
  const [sent] = kept.state.sent;
  assert.deepEqual([sent.number, sent.days, sent.name], ['', 7, undefined]);
  assert.ok(kept.textInviteWaits(sent.secret));
  // Over only 7 days after it was made, not 2 as one by plain SMS.
  const twoDays = 2 * 24 * 3600 * 1000;
  assert.deepEqual(kept.textInvitesDue(Date.now() - twoDays + 3 * twoDays), []);
  assert.equal(kept.textInvitesDue(Date.now() + 5 * 24 * 3600 * 1000 + 1000).length, 1);
  await kept.nameTextInvite(sent.secret, '  Μαρία ');
  assert.equal((await SmsLink.open(0, key)).state.sent[0].name, 'Μαρία');
  await kept.nameTextInvite(sent.secret, '');
  assert.equal((await SmsLink.open(0, key)).state.sent[0].name, undefined);
  assert.ok(!kept.textInviteWaits('x'));
});

test('a contact card has no invite to the relay and no end, and is shorter still', () => {
  const card = made({ code: '', expires: 0, card: true });
  const link = textInviteLink(card);
  assert.deepEqual(parseTextInvite(link), card);
  assert.ok(link.length <= 180, `${link.length}`);
  // With no relay key and no name it is shorter, and still read.
  const bare = made({ code: '', expires: 0, card: true, relayKey: '', name: '' });
  assert.deepEqual(parseTextInvite(textInviteLink(bare)), bare);
  const elsewhere = made({ code: '', expires: 0, card: true, relay: 'wss://relay.example.org' });
  assert.deepEqual(parseTextInvite(textInviteLink(elsewhere)), elsewhere);
  // A card's relay is held to an invite's rules: no plain ws:// to the internet.
  assert.equal(parseTextInvite(textInviteLink(made({ code: '', expires: 0, card: true, relay: 'ws://relay.example.org' }))), null);
});

test("New chat's one-time card makes only the first to answer the newest a contact at once", async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  const first = toBase64Url(await link.onceSecret());
  const second = toBase64Url(await link.onceSecret());
  assert.notEqual(first, second, 'new each time');
  assert.ok(link.waiting);
  assert.equal(await link.takeOnce(first), false, 'an older card: a message request');
  assert.equal(await link.takeOnce(second), true, 'the newest, the first time: at once');
  assert.equal(await (await SmsLink.open(0, key)).takeOnce(second), false, 'once only, kept');
  assert.equal(await link.takeOnce(toBase64Url(randomBytes(32))), false);
  for (let i = 0; i < 7; i++) await link.onceSecret();
  const third = toBase64Url(await link.onceSecret());
  // The same opening of New chat shows the same card, while it is unused.
  assert.equal(toBase64Url(await link.onceSecret(third)), third);
  assert.equal(await link.takeOnce(first), false);
  assert.equal(await link.takeOnce(third), true);
  assert.notEqual(toBase64Url(await link.onceSecret(third)), third, 'used: a new one');
  // Older cards are kept a month, so an answer to one still opens, as a message request.
  const kept = (l: SmsLink) => (l as unknown as { data: { cardsOnce: { secret: string; at: number }[] } }).data.cardsOnce;
  assert.ok(kept(await SmsLink.open(0, key)).some((c) => c.secret === first), 'kept past five');
  await link.onceSecret('', Date.now() + 31 * 24 * 3600 * 1000);
  assert.equal(kept(await SmsLink.open(0, key)).some((c) => c.secret === first), false, 'not past a month');
});

test('the contact card opens the answers sealed to it, and stays for the next', async () => {
  files.clear();
  const key = randomBytes(32);
  const link = await SmsLink.open(0, key);
  const secret = await link.cardSecret();
  assert.deepEqual(await (await SmsLink.open(0, key)).cardSecret(), secret, 'made once');
  assert.ok(link.waiting);
});
