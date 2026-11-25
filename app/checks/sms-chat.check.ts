// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The phone's SMS with a contact's number in their Erevos chat (lib/sms-chat.ts), the way back to
// the plain SMS conversation, the numbers no hidden invite goes to, an invite's answer from someone
// blocked here, which adds no one, and the home screen's Erevos chats keeping a contact whose
// number's SMS came last (lib/inbox.ts). The SMS conversation's link to the chat runs with the
// real core built to WebAssembly by checks/build-core.mjs, and is skipped, with a note, without it.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { contactLink } from '../lib/contact-code';
import { relaySeal } from '../lib/core';
import { randomBytes, toHex } from '../lib/crypto';
import { E2E, toBase64Url } from '../lib/e2e';
import { fromHex } from '../lib/relay';
import { collectInvites, inviteAnswer } from '../lib/sms-invite';
import { forgetSmsLink, invitesDue, spaceSmsLink, takeInviteAnswer } from '../lib/sms-relay';
import { setCurrentSpace } from '../lock/keys';
import { buildInbox, showsIn } from '../lib/inbox';
import { searchMessages } from '../lib/message-search';
import {
  chatLines,
  chatSmsNumber,
  contactSmsNumber,
  findSmsConversations,
  findSmsUnread,
  isSmsLine,
  latestSms,
  linkedContact,
  numberOwned,
  plainSmsHref,
  smsFindables,
  smsLineId,
  smsMark,
  smsConversations,
} from '../lib/sms-chat';
import { loadE2EData } from '../lock/e2e-data';
import type { SmsMessage } from '../modules/erevos-sms';
import { files } from './files-memory';
import { useWasmCore } from './wasm-core';

const ANNA = 'aa'.repeat(32);

const sms = (id: number, at: number, more: Partial<SmsMessage> = {}): SmsMessage => ({ id, kind: 'sms', text: `sms ${id}`, at, mine: false, state: 'done', read: true, ...more });

test('a contact whose number sent the last SMS stays among the Erevos chats, and shows among the SMS too', () => {
  const rows = buildInbox(
    [{ identity: ANNA, name: 'Άννα', timer: 0, phone: '+306900000001' }],
    [{ peer: `contact:${ANNA}`, text: 'erevos', mine: true, at: 10, mark: 1 }],
    [],
    100,
    [
      { address: '6900000001', text: 'sms from Anna', at: 20, mine: false, unread: 1 },
      { address: '+306911111111', text: 'bank code', at: 30, mine: false, unread: 0 },
    ],
  );
  const anna = rows.find((r) => r.identity === ANNA)!;
  assert.equal(anna.lastSms, true);
  assert.equal(showsIn(anna, 'erevos'), true);
  assert.equal(showsIn(anna, 'sms'), true);
  assert.equal(showsIn(anna, 'all'), true);
  // An SMS conversation of a number no contact has stays out of the Erevos chats.
  const bank = rows.find((r) => r.sms === '+306911111111')!;
  assert.deepEqual([showsIn(bank, 'erevos'), showsIn(bank, 'sms')], [false, true]);
  // A chat whose last message is an Erevos one is only among the Erevos chats.
  const quiet = buildInbox([{ identity: ANNA, name: 'Άννα', timer: 0 }], [{ peer: `contact:${ANNA}`, text: 'hi', mine: false, at: 10 }], [], 100)[0];
  assert.deepEqual([showsIn(quiet, 'erevos'), showsIn(quiet, 'sms')], [true, false]);
});

test("the chat's messages and the SMS with their number go in one line by time, each keeping its order", () => {
  const chat = [
    { at: 10, mine: true, text: 'a' },
    { at: 30, mine: false, text: 'b' },
    { at: 30, mine: true, text: 'c' },
    { at: 60, mine: true, text: 'd' },
  ];
  const texts = [sms(1, 5), sms(2, 30, { mine: true, state: 'delivered' }), sms(3, 40), sms(4, 70)];
  const lines = chatLines(chat, texts, false);
  assert.deepEqual(
    lines.map((l) => (l.kind === 'chat' ? l.message.text : smsLineId(l.sms))),
    ['sms:1', 'a', 'b', 'c', 'sms:2', 'sms:3', 'd', 'sms:4'],
  );
  assert.deepEqual(
    lines.map((l) => l.at),
    [5, 10, 30, 30, 30, 40, 60, 70],
  );
  assert.equal(lines[4].mine, true);
  // Nothing to ask for earlier when all were read; with more, above the first SMS read.
  assert.ok(lines.every((l) => l.kind === 'chat' || !l.earlier));
  const paged = chatLines(chat, texts.slice(1), true);
  assert.deepEqual(
    paged.flatMap((l) => (l.kind === 'sms' && l.earlier ? [smsLineId(l.sms)] : [])),
    ['sms:2'],
  );
  // Without SMS, the chat is as it was.
  assert.deepEqual(
    chatLines(chat, [], false).map((l) => l.kind === 'chat' && l.message),
    chat,
  );
  assert.deepEqual(
    chatLines([], texts, false).map((l) => l.kind),
    ['sms', 'sms', 'sms', 'sms'],
  );
});

test('an SMS shows the marks of the SMS screen, and one that did not go is found again', () => {
  assert.deepEqual(
    (['sent', 'delivered', 'undelivered', 'failed', 'sending', 'done'] as const).map(smsMark),
    ['✓', '✓✓✓', 'not delivered', 'not sent', 'sending', ''],
  );
  assert.equal(smsLineId({ id: 3, kind: 'mms' }), 'mms:3');
  assert.equal(smsLineId({ id: 12 }), 'sms:12');
  const found = searchMessages(
    [
      { peer: `contact:${ANNA}`, tag: 'Q2hhdE1lc3NhZ2Ux', at: 10, mine: true, text: 'Dinner at eight?' },
      ...smsFindables(`contact:${ANNA}`, [sms(7, 20, { text: 'Το δείπνο αργεί' }), sms(8, 30, { text: 'unrelated' })]),
    ],
    'ΔΕΙΠΝΟ',
  );
  assert.deepEqual(
    found.map((f) => [f.tag, isSmsLine(f.tag)]),
    [['sms:7', true]],
  );
  assert.deepEqual(
    searchMessages(smsFindables(`contact:${ANNA}`, [sms(9, 5, { text: 'Dinner tomorrow' })]), 'dinner').map((f) => f.line),
    ['Dinner tomorrow'],
  );
  assert.equal(isSmsLine('Q2hhdE1lc3NhZ2Ux'), false);
});

test("only the conversation with the contact's number alone is read, never a group's MMS", async () => {
  const threads = [{ address: '+306900000001,+306922222222' }, { address: '6900000001' }, { address: '+306911111111' }, { address: '+30 690 000 0001' }];
  assert.deepEqual(smsConversations('+306900000001', threads), ['6900000001', '+30 690 000 0001']);
  assert.deepEqual(smsConversations('', threads), []);
  const asked: string[] = [];
  const store: Record<string, SmsMessage[]> = {
    '+306900000001,+306922222222': [sms(90, 25, { kind: 'mms', from: '+306900000001' })],
    '6900000001': [sms(1, 10), sms(2, 20), sms(4, 40)],
    '+30 690 000 0001': [sms(2, 20), sms(3, 30)],
  };
  const read = {
    threads: async () => threads,
    messages: async (address: string, limit: number) => {
      asked.push(address);
      return (store[address] ?? []).slice(-limit);
    },
  };
  const addresses = await findSmsConversations('+306900000001', read);
  const all = await latestSms(addresses, 10, read);
  assert.deepEqual(asked, ['6900000001', '+30 690 000 0001']);
  assert.deepEqual(
    all.messages.map(smsLineId),
    ['sms:1', 'sms:2', 'sms:3', 'sms:4'],
  );
  assert.equal(all.more, false);
  // A page: the latest of them, and earlier ones to ask for.
  const page = await latestSms(addresses, 2, read);
  assert.deepEqual(page.messages.map(smsLineId), ['sms:3', 'sms:4']);
  assert.equal(page.more, true);
  // A number with no conversation is not asked for, so none starts.
  asked.length = 0;
  assert.deepEqual(await latestSms(await findSmsConversations('+306933333333', read), 10, read), { messages: [], more: false });
  assert.deepEqual(asked, []);
  // A contact's number is one number; a group's numbers are no chat's.
  assert.equal(chatSmsNumber({ hidden: false, access: true, phone: '+306900000001,+306922222222' }), '');
  assert.equal(chatSmsNumber({ hidden: false, access: true, phone: '+306900000001' }), '+306900000001');
});

test("a chat counts theirs not read in its number's conversations, shown or not, as the home screen does", async () => {
  const threads = [
    { address: '+306900000001,+306922222222', unread: 4 },
    { address: '6900000001', unread: 1 },
    { address: '+306911111111', unread: 2 },
    { address: '+30 690 000 0001', unread: 0 },
  ];
  const read = { threads: async () => threads };
  assert.deepEqual(await findSmsUnread('+306900000001', read), { addresses: ['6900000001', '+30 690 000 0001'], unread: 1 });
  assert.deepEqual(await findSmsUnread('+306933333333', read), { addresses: [], unread: 0 });
  assert.deepEqual(await findSmsUnread('', read), { addresses: [], unread: 0 });
  // The home screen counts the same one on the contact's row, whatever the chat shows of it.
  const rows = buildInbox([{ identity: ANNA, name: 'Anna', timer: 0, phone: '+306900000001' }], [], [], 100, [
    { address: '6900000001', text: 'Hi', at: 50, mine: false, unread: 1 },
  ]);
  assert.equal(rows.find((r) => r.identity === ANNA)?.unread, 1);
});

test('nothing of the SMS without access to them, and nothing in hidden chats', () => {
  assert.equal(chatSmsNumber({ hidden: false, access: false, phone: '+306900000001' }), '');
  assert.equal(chatSmsNumber({ hidden: true, access: true, phone: '+306900000001' }), '');
  assert.equal(chatSmsNumber({ hidden: true, access: false, phone: '+306900000001' }), '');
  assert.equal(chatSmsNumber({ hidden: false, access: true, phone: '' }), '');
});

test('a chat sends and reads SMS on the linked number, else on a number of a contact card that is theirs', () => {
  const cards = [
    { phones: [{ value: '+302100000000', kind: 'home' }, { value: '+306944444444', kind: 'mobile' }] },
    { phones: [{ value: '+306955555555', kind: 'mobile' }] },
  ];
  assert.equal(contactSmsNumber('+306900000001', cards), '+306900000001');
  assert.equal(contactSmsNumber('', cards), '+306944444444');
  assert.equal(contactSmsNumber('', [{ phones: [{ value: '+302100000000', kind: 'home' }] }]), '+302100000000');
  assert.equal(contactSmsNumber('', [{ phones: [{ value: 'no number' }] }]), '');
  assert.equal(contactSmsNumber('', []), '');
});

test('the SMS conversation of a linked number opens the chat, and plain=1 opens the SMS screen itself', () => {
  const contacts = [
    { identity: ANNA, phone: '+306900000001' },
    { identity: 'bb'.repeat(32), phone: '' },
  ];
  assert.equal(linkedContact(contacts, '6900000001', false)?.identity, ANNA);
  assert.equal(linkedContact(contacts, '6900000001', true), null);
  // A group's conversation with that number, and a sender with a name, stay SMS.
  assert.equal(linkedContact(contacts, '+306900000001,+306922222222', false), null);
  assert.equal(linkedContact(contacts, 'Bank', false), null);
  assert.equal(linkedContact(contacts, '+306911111111', false), null);
  // The chat's details open the SMS screen so: with the number, and plain.
  const href = plainSmsHref('+306900000001');
  const params = new URLSearchParams(href.slice(href.indexOf('?') + 1));
  assert.ok(href.startsWith('/sms?'));
  assert.deepEqual([params.get('to'), params.get('plain')], ['+306900000001', '1']);
  assert.equal(linkedContact(contacts, params.get('to')!, params.get('plain') === '1'), null);
});

test("a number linked to a contact, or on a contact card of theirs, is theirs: no hidden invite goes to it", () => {
  const contacts = [{ identity: ANNA, phone: '+30 690 000 0001' }, { identity: 'bb'.repeat(32) }];
  const cards = [{ phones: [{ value: '(691) 111-1111' }, { value: '+30 692 222 2222' }] }];
  assert.ok(numberOwned('6900000001', contacts, []));
  assert.ok(numberOwned('+306922222222', [], cards));
  assert.ok(numberOwned('6911111111', contacts, cards));
  assert.equal(numberOwned('+306933333333', contacts, cards), false);
  // A group's conversation, a sender with a name, and no number are no one's.
  assert.equal(numberOwned('+306900000001,+306933333333', contacts, cards), false);
  assert.equal(numberOwned('Bank', contacts, cards), false);
  assert.equal(numberOwned('', [{ phone: '' }], [{ phones: [{ value: '' }] }]), false);
});

const core = useWasmCore();
if (!core) console.log('Skipping the SMS link to a chat: build the core first with node checks/build-core.mjs');

test('linking a number sends its SMS conversation to the chat, and unlinking it brings the SMS screen back', { skip: !core }, async () => {
  files.clear();
  const key = randomBytes(32);
  const alice = await E2E.open('space', 0, key);
  const bob = await E2E.open('hidden', 0, randomBytes(32));
  const { identity } = await alice.addContact({ senderHex: toHex(randomBytes(24)), key: toBase64Url(bob.bundle) }, toHex(randomBytes(24)));
  // As app/sms.tsx reads it: the space's contacts, from what is kept.
  const opens = async (to: string, plain = false) => linkedContact((await loadE2EData('space', 0, key)).contacts, to, plain)?.identity ?? null;
  assert.equal(await opens('+306900000001'), null);
  await alice.linkPhone(identity, '+306900000001');
  assert.equal(await opens('6900000001'), identity);
  assert.equal(await opens('6900000001', true), null);
  await alice.linkPhone(identity, '');
  assert.equal(await opens('6900000001'), null);
});

test('with SMS invites turned off, an invite the owner took by hand is still answered, and one that came by SMS waits', () => {
  // A contact QR code or an invite link taken here has no number; an invite by SMS has its sender's.
  const taken = { from: '', name: 'Bob' };
  const came = { from: '+306900000001' };
  assert.deepEqual(invitesDue([taken, came], true), { now: [taken, came], later: [] });
  assert.deepEqual(invitesDue([taken, came], false), { now: [taken], later: [came] });
  assert.deepEqual(invitesDue([came], false), { now: [], later: [came] });
  assert.deepEqual(invitesDue([], false), { now: [], later: [] });
});

test('the answer to an SMS invite from someone blocked here adds no one; anyone else’s adds them', { skip: !core }, async () => {
  files.clear();
  const key = randomBytes(32);
  setCurrentSpace(0, key);
  forgetSmsLink();
  try {
    const alice = await E2E.open('space', 0, key);
    const own = { senderHex: toHex(randomBytes(24)), relay: 'wss://relay.example.org', relayKey: '' };
    const here = { relay: own.relay, relayKey: '' };
    // An invite from here to `number`, and its answer from `who`'s phone, with their contact link.
    const answer = async (who: E2E, number: string) => {
      const pieces: Uint8Array[] = [];
      await (await spaceSmsLink()).invite(number, own, async (_to, piece) => void pieces.push(piece));
      const { invites } = collectInvites(pieces.map((data) => ({ from: number, data, at: Date.now() })));
      const theirs = contactLink({ senderHex: toHex(randomBytes(24)), relayUrl: own.relay, key: toBase64Url(who.bundle) });
      return relaySeal(invites[0].invite.key, fromHex(own.senderHex), inviteAnswer(theirs));
    };
    const bob = await E2E.open('hidden', 0, randomBytes(32));
    const carol = await E2E.open('hidden', 1, randomBytes(32));
    await alice.deleteContact(carol.identityHex(), { block: true });
    assert.equal(await takeInviteAnswer(alice, await answer(carol, '+306900000002'), own.senderHex, here), null);
    assert.deepEqual(alice.contacts(), []);
    const took = await takeInviteAnswer(alice, await answer(bob, '+306900000001'), own.senderHex, here);
    assert.equal(took?.identity, bob.identityHex());
    assert.deepEqual(alice.contacts().map((c) => c.identity), [bob.identityHex()]);
  } finally {
    setCurrentSpace(null);
    forgetSmsLink();
  }
});
