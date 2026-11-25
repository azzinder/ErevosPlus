// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Phone screen's numbers (lib/phone.ts), the SIM kept for each (lib/phone-sims.ts) and the
// call history (lib/phone-log.ts). The calls themselves are Android's, in modules/erevos-phone,
// and can only be tried on a phone.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { randomBytes } from '../lib/crypto';
import { callLength, cleanReplies, dialNumber, keyLetters, KEYS, knownNames, MAX_REPLIES, MAX_REPLY, typeKey } from '../lib/phone';
import { callKind, callMarks, callsWith, callWho, filterCalls, groupCalls, withDays, withoutCalls } from '../lib/phone-log';
import {
  addPrefix,
  blockedInternational,
  blockedUntil,
  blockGroup,
  blockUntil,
  checkedRules,
  liftGroup,
  liveGroups,
  NO_RULES,
  ownPrefix,
  removePrefix,
  rulesFrom,
  rulesJson,
  storedRules,
  TELEMARKETING,
} from '../lib/phone-rules';
import { lockedSpeedDials, phoneOpensLocked, setLockedSpeedDials, setPhoneOpensLocked } from '../lib/phone-open';
import { accountLabel, callAccount, PhoneSims } from '../lib/phone-sims';
import type { LoggedCall, PhoneAccount } from '../modules/erevos-phone';
import { files } from './files-memory';
import { store } from './secure-memory';
import { ROOT } from './words';

test('what is typed or pasted keeps only what can be called', () => {
  assert.equal(dialNumber('+30 (210) 123-4567'), '+302101234567');
  assert.equal(dialNumber('  0030 69 1234 5678 '), '00306912345678');
  // A + only at the start; the tones of an extension after a pause stay.
  assert.equal(dialNumber('12+34'), '1234');
  assert.equal(dialNumber('+3021+00'), '+302100');
  assert.equal(dialNumber('210 1234567,,42#'), '2101234567,,42#');
  assert.equal(dialNumber('*21#'), '*21#');
  assert.equal(dialNumber('tel:abc'), '');
});

test('the keypad types its keys, and a + only first', () => {
  assert.deepEqual(KEYS.flat(), ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']);
  assert.equal(typeKey('', '+'), '+');
  assert.equal(typeKey('+', '3'), '+3');
  assert.equal(typeKey('69', '+'), '69');
  assert.equal(typeKey('69', '#'), '69#');
});

test('quick replies are kept on one line each, none empty or twice, six at most', () => {
  assert.deepEqual(cleanReplies(['  On my way. ', '', 'Call\nme  later', 'On my way.']), ['On my way.', 'Call me later']);
  assert.equal(cleanReplies(['x'.repeat(400)])[0].length, MAX_REPLY);
  assert.equal(cleanReplies(['1', '2', '3', '4', '5', '6', '7']).length, MAX_REPLIES);
  assert.deepEqual(cleanReplies([' ', '\n']), []);
});

test('how long a call lasted reads as a clock', () => {
  assert.equal(callLength(0), '0:00');
  assert.equal(callLength(42), '0:42');
  assert.equal(callLength(725), '12:05');
  assert.equal(callLength(3723), '1:02:03');
  assert.equal(callLength(-5), '0:00');
});

test('the call screen knows the names of the contacts linked to a number, not of a request', () => {
  assert.deepEqual(
    knownNames([
      { name: ' Maria ', phone: '+306911111111', request: false },
      { name: 'Nikos', phone: '', request: false },
      { name: '', phone: '+306922222222', request: false },
      { name: 'Who', phone: '+306933333333', request: true },
    ]),
    { '+306911111111': 'Maria' },
  );
});

const sim = (id: string, slot: number, label = ''): PhoneAccount => ({ id, slot, label, name: `SIM ${slot + 1}` });

test('a call goes on the SIM kept for its number, else the owner chooses; with one SIM, the default', () => {
  const two = [sim('8930', 0, 'Cosmote'), sim('8931', 1, 'Vodafone')];
  assert.equal(callAccount([], ''), '');
  assert.equal(callAccount([sim('8930', 0)], ''), '');
  assert.equal(callAccount(two, '8931'), '8931');
  assert.equal(callAccount(two, ''), null);
  // A SIM taken out of the phone: chosen again.
  assert.equal(callAccount(two, '7777'), null);
  assert.equal(accountLabel(two[0]), 'SIM 1 · Cosmote');
  assert.equal(accountLabel(sim('8932', 1)), 'SIM 2');
});

test('the SIM chosen for a number is kept, sealed in the space, whichever way the number is written', async () => {
  files.clear();
  const key = randomBytes(32);
  const sims = await PhoneSims.open(0, key);
  assert.equal(sims.accountFor('+306911111111'), '');
  await sims.remember('+30 691 111 1111', '8931');
  await sims.remember('2101234567', '8930');
  const again = await PhoneSims.open(0, key);
  assert.equal(again.accountFor('6911111111'), '8931');
  assert.equal(again.accountFor('+302101234567'), '8930');
  await again.remember('6911111111', '8930');
  await again.remember('2101234567', '');
  const last = await PhoneSims.open(0, key);
  assert.equal(last.accountFor('+306911111111'), '8930');
  assert.equal(last.accountFor('2101234567'), '');
  // Nothing of it shows in the file, and another space's key, or another space, opens none of it.
  assert.ok(![...files.values()].some((v) => v.includes('6911111111') || v.includes('2101234567')));
  assert.equal((await PhoneSims.open(0, randomBytes(32))).accountFor('6911111111'), '');
  assert.equal((await PhoneSims.open(1, key)).accountFor('6911111111'), '');
});

test("speed dial with Erevos locked calls one space's numbers from a copy without their names, another space taking its place", async () => {
  files.clear();
  store.clear();
  await setPhoneOpensLocked(true);
  const [keyA, keyB] = [randomBytes(32), randomBytes(32)];
  const a = await PhoneSims.open(0, keyA);
  await a.setSpeed('2', '+30 691 111 1111', 'Anna');
  assert.equal(await a.feedsLocked(), false);
  assert.equal(await lockedSpeedDials(), null);
  await a.setFeedsLocked(true);
  assert.equal(await a.feedsLocked(), true);
  assert.deepEqual((await lockedSpeedDials())?.keys, [{ key: '2', number: '+306911111111' }]);
  assert.ok(!store.get('erevos.phone-speed')!.includes('Anna'));
  // It follows the space's keys as they change, and the space finds it again when it next opens.
  await (await PhoneSims.open(0, keyA)).setSpeed('3', '2101234567', '');
  assert.deepEqual((await lockedSpeedDials())?.keys.map((k) => k.key), ['2', '3']);

  // Another space's numbers stay its own until it asks; then they take the first one's place.
  const b = await PhoneSims.open(1, keyB);
  await b.setSpeed('5', '6922222222', 'Vera');
  assert.equal(await b.feedsLocked(), false);
  assert.deepEqual((await lockedSpeedDials())?.keys.map((k) => k.key), ['2', '3']);
  await b.setFeedsLocked(true);
  assert.deepEqual((await lockedSpeedDials())?.keys, [{ key: '5', number: '6922222222' }]);
  assert.equal(await (await PhoneSims.open(0, keyA)).feedsLocked(), false);
  // The space that lost its place changes nothing of the copy, by a key or by turning its own off.
  await (await PhoneSims.open(0, keyA)).setSpeed('4', '6933333333', '');
  await (await PhoneSims.open(0, keyA)).setFeedsLocked(false);
  assert.deepEqual((await lockedSpeedDials())?.keys, [{ key: '5', number: '6922222222' }]);
  await (await PhoneSims.open(1, keyB)).setFeedsLocked(false);
  assert.equal(store.has('erevos.phone-speed'), false);
});

test('the copy of speed dial numbers is there only while the Phone opens without the password', async () => {
  files.clear();
  store.clear();
  await setPhoneOpensLocked(true);
  const key = randomBytes(32);
  const sims = await PhoneSims.open(0, key);
  await sims.setSpeed('2', '6911111111', '');
  await sims.setFeedsLocked(true);
  assert.ok(store.has('erevos.phone-speed'));

  // Back behind the password: the copy goes with it, whichever space kept it, and that space sees so.
  await setPhoneOpensLocked(false);
  assert.equal(await phoneOpensLocked(), false);
  assert.equal(store.has('erevos.phone-speed'), false);
  assert.equal(await (await PhoneSims.open(0, key)).feedsLocked(), false);
  // None is written meanwhile: not by a key that changes, not by asking for it, not from outside a space.
  await (await PhoneSims.open(0, key)).setSpeed('3', '6922222222', '');
  assert.equal(store.has('erevos.phone-speed'), false);
  const asked = await PhoneSims.open(0, key);
  await asked.setFeedsLocked(true);
  assert.equal(await asked.feedsLocked(), false);
  await setLockedSpeedDials({ feed: 'ab', keys: [{ key: '2', number: '6911111111' }] });
  assert.equal(store.has('erevos.phone-speed'), false);
  // Opening without the password again brings no copy back by itself: the space is asked again.
  await setPhoneOpensLocked(true);
  assert.equal(await lockedSpeedDials(), null);
  await (await PhoneSims.open(0, key)).setFeedsLocked(true);
  assert.deepEqual((await lockedSpeedDials())?.keys.map((k) => k.key), ['2', '3']);
});

test('the screens offer speed dial with Erevos locked only while the Phone opens without the password, and a second password set anew drops the copy first', () => {
  // The option, under Phone → Settings.
  const settings = readFileSync(join(ROOT, 'app', 'phone-settings.tsx'), 'utf8');
  assert.ok(settings.includes("{passwordLock && opensLocked ? (\n        <>\n          <Text variant=\"bodyStrong\">{t('Speed dial with Erevos locked')}</Text>"));
  assert.ok(settings.includes('<SpeedDials opensLocked={opensLocked === true} />'));
  // Setting a second password replaces the one before, whose space may be the one that kept the copy.
  const security = readFileSync(join(ROOT, 'app', 'security.tsx'), 'utf8');
  const from = security.indexOf("} else if (editing === 'second') {");
  const to = security.indexOf('await setLockPassword(next, password, nextKey);', from);
  assert.ok(from > 0 && to > from);
  assert.ok(security.slice(from, to).includes('await dropOthersLockedSpeed(space, key);'));
  assert.ok(security.includes('await removeSecondPassword(space, currentSpace().key);'));
});

let nextId = 1;
const logged = (call: Partial<LoggedCall>): LoggedCall => ({
  id: nextId++,
  number: '+306911111111',
  shown: '691 111 1111',
  name: '',
  photo: '',
  at: new Date(2026, 9, 19, 12).getTime(),
  duration: 0,
  type: 1,
  features: 0,
  account: '8930',
  presentation: 1,
  isNew: false,
  blocked: 0,
  ...call,
});

test('what each call in the history was, and its marks', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 99].map(callKind), ['incoming', 'outgoing', 'missed', 'incoming', 'declined', 'blocked', 'incoming', 'incoming']);
  assert.deepEqual(callMarks(0), { wifi: false, hd: false });
  assert.deepEqual(callMarks(8 | 4 | 1), { wifi: true, hd: true });
  assert.deepEqual(callMarks(4), { wifi: false, hd: true });
  assert.equal(callWho(logged({ name: 'Maria' })), 'Maria');
  assert.equal(callWho(logged({})), '691 111 1111');
  assert.equal(callWho(logged({ number: '', presentation: 2 })), 'Private number');
  assert.equal(callWho(logged({ number: '', presentation: 3 })), 'Unknown number');
  assert.equal(callWho(logged({ number: '', presentation: 4 })), 'Payphone');
});

test('the filters keep missed, incoming (with the declined), outgoing or blocked calls, on one SIM or both', () => {
  const calls = [1, 2, 3, 5, 6, 7].map((type, i) => logged({ type, account: i % 2 ? '8931' : '8930' }));
  const types = (kept: LoggedCall[]) => kept.map((c) => c.type);
  assert.deepEqual(types(filterCalls(calls, 'all')), [1, 2, 3, 5, 6, 7]);
  assert.deepEqual(types(filterCalls(calls, 'missed')), [3]);
  assert.deepEqual(types(filterCalls(calls, 'incoming')), [1, 5, 7]);
  assert.deepEqual(types(filterCalls(calls, 'outgoing')), [2]);
  assert.deepEqual(types(filterCalls(calls, 'blocked')), [6]);
  assert.deepEqual(types(filterCalls(calls, 'all', '8931')), [2, 5, 7]);
  assert.deepEqual(types(filterCalls(calls, 'incoming', '8930')), [1]);
});

test('calls one after another with the same number, kind and day are one row, under their day', () => {
  const day = (d: number, h: number) => new Date(2026, 9, d, h).getTime();
  const calls = [
    logged({ type: 3, at: day(19, 12) }),
    logged({ type: 3, at: day(19, 11), number: '6911111111' }),
    logged({ type: 1, at: day(19, 10) }),
    logged({ type: 1, at: day(18, 22) }),
    logged({ type: 1, at: day(18, 21), number: '+302101234567' }),
    logged({ type: 3, at: day(18, 20), number: '', presentation: 2 }),
    logged({ type: 3, at: day(18, 19), number: '', presentation: 2 }),
    logged({ type: 2, at: day(12, 9) }),
  ];
  const rows = groupCalls(calls);
  assert.deepEqual(
    rows.map((r) => [r.kind, r.calls.length]),
    [['missed', 2], ['incoming', 1], ['incoming', 1], ['incoming', 1], ['missed', 2], ['outgoing', 1]],
  );
  const items = withDays(rows, day(19, 13));
  assert.deepEqual(
    items.map((i) => (i.kind === 'day' ? i.label : i.row.calls.length)),
    ['Today', 2, 1, 'Yesterday', 1, 1, 2, '12/10/26', 1],
  );
});

test('the calls of a number are found however it is written, and those being deleted are hidden', () => {
  const greek = logged({ number: '+306911111111' });
  const local = logged({ number: '6911111111' });
  const other = logged({ number: '+302101234567' });
  const hidden = logged({ number: '', presentation: 2 });
  const calls = [greek, local, other, hidden];
  assert.deepEqual(callsWith(calls, local).map((c) => c.id), [greek.id, local.id]);
  assert.deepEqual(callsWith(calls, other).map((c) => c.id), [other.id]);
  // A hidden number is no number: it has no calls of its own to delete.
  assert.deepEqual(callsWith(calls, hidden), []);
  assert.deepEqual(withoutCalls(calls, new Set([greek.id, hidden.id])), [local, other]);
  assert.equal(withoutCalls(calls, new Set()), calls);
});

test("the owner's prefixes are kept with their country code, or as the phone's country writes them", () => {
  assert.equal(ownPrefix('+33 1 62'), '+33162');
  assert.equal(ownPrefix('0033162'), '+33162');
  assert.equal(ownPrefix('(0)1-62'), '0162');
  assert.equal(ownPrefix('2310'), '2310');
  assert.equal(ownPrefix('1'), null);
  assert.equal(ownPrefix('+3'), null);
  assert.equal(ownPrefix('01 62 abc'), null);
  assert.equal(ownPrefix('+'), null);
  assert.equal(ownPrefix('1234567890123456'), null);
});

test('the telemarketing ranges and the own prefixes become the digits the phone matches', () => {
  assert.deepEqual(storedRules(NO_RULES), { telemarketing: false, own: [], groups: [], international: [], national: [] });
  const all = storedRules({ telemarketing: true, own: ['+4420', '0162', '+33162'], groups: [] });
  for (const p of ['33162', '33949', '339475', '339479', '34400', '56809', '91140', '55303', '4420']) assert.ok(all.international.includes(p), p);
  assert.equal(all.international.filter((p) => p === '33162').length, 1);
  assert.deepEqual(all.national, ['0162']);
  assert.ok(blockedInternational(all, '33162123456'));
  assert.ok(blockedInternational(all, '34400123456'));
  assert.ok(blockedInternational(all, '442071234567'));
  assert.ok(!blockedInternational(all, '33612345678'));
  assert.ok(!blockedInternational(all, '34600123456'));
  assert.ok(!blockedInternational(all, ''));
  assert.ok(!blockedInternational(storedRules(NO_RULES), '33162123456'));
});

test('the rules kept are read back, and what is not understood is left out', () => {
  const rules = addPrefix(addPrefix({ telemarketing: true, own: [], groups: [] }, '+33162'), '0162');
  assert.deepEqual(rulesFrom(rulesJson(rules)), rules);
  assert.deepEqual(addPrefix(rules, '0162'), rules);
  assert.deepEqual(removePrefix(rules, '+33162').own, ['0162']);
  assert.equal(rulesJson(NO_RULES), '');
  assert.deepEqual(rulesFrom(''), NO_RULES);
  assert.deepEqual(rulesFrom('{oops'), NO_RULES);
  assert.deepEqual(checkedRules({ telemarketing: 'yes', own: ['+33 162', 7, 'x', '+33162'] }), { telemarketing: false, own: ['+33162'], groups: [] });
  assert.ok(TELEMARKETING.every((r) => r.prefixes.length > 0 && /^\d+$/.test(r.code)));
});

test("a group's contacts are blocked for an hour, until tomorrow morning, or until lifted", () => {
  const now = new Date(2026, 9, 19, 14, 5).getTime();
  assert.equal(blockUntil('hour', now), now + 3600_000);
  assert.equal(blockUntil('lifted', now), 0);
  assert.equal(blockUntil('morning', now), new Date(2026, 9, 20, 7).getTime());
  // After midnight, tomorrow morning is this morning.
  const late = new Date(2026, 9, 20, 1, 30).getTime();
  assert.equal(blockUntil('morning', late), new Date(2026, 9, 20, 7).getTime());
  assert.equal(blockedUntil(blockUntil('hour', now), now), 'Blocked until 15:05');
  assert.equal(blockedUntil(blockUntil('morning', now), now), 'Blocked until tomorrow, 07:00');
  assert.equal(blockedUntil(0, now), 'Blocked until you lift it');

  let rules = blockGroup(NO_RULES, '12', blockUntil('hour', now));
  rules = blockGroup(rules, '7', 0);
  rules = blockGroup(rules, '12', blockUntil('morning', now));
  assert.deepEqual(rules.groups, [{ id: '7', until: 0 }, { id: '12', until: blockUntil('morning', now) }]);
  assert.deepEqual(rulesFrom(rulesJson(rules, now)).groups, rules.groups);
  // Over the next morning, only the one until lifted is left; lifted, nothing is.
  const after = new Date(2026, 9, 20, 8).getTime();
  assert.deepEqual(liveGroups(rules, after), [{ id: '7', until: 0 }]);
  assert.deepEqual(rulesFrom(rulesJson(rules, after)).groups, [{ id: '7', until: 0 }]);
  assert.equal(rulesJson(liftGroup(liftGroup(rules, '7'), '12'), now), '');
  assert.deepEqual(checkedRules({ groups: [{ id: '3', until: 5 }, { id: 'x', until: 1 }, { id: '4', until: -1 }, { id: '3', until: 9 }, null] }).groups, [{ id: '3', until: 5 }]);
});

test('the keys show the letters of the app’s language, the ones a name is found by', async () => {
  const { keysOf } = await import('../lib/contacts');
  assert.equal(keyLetters('2', 'el'), 'ΑΒΓ');
  assert.equal(keyLetters('7', 'el'), 'ΠΡΣ');
  assert.equal(keyLetters('9', 'de'), 'WXYZ');
  for (const key of ['1', '0', '*', '#']) assert.equal(keyLetters(key, 'el'), '');
  // Every letter shown on a key is found on that key.
  for (const lang of ['el', 'en']) {
    for (const key of '23456789') for (const letter of keyLetters(key, lang)) assert.equal(keysOf(letter), key, `${letter} on ${key}`);
  }
});

test('the spam list takes numbers with their country code, and starts of numbers', async () => {
  const { spamAddress, spamLines } = await import('../lib/spam-list');
  const list = [
    '# A list of numbers',
    '+30 211 000 4455, telemarketing',
    '0030211000999\tcall centre',
    '+33 162*',
    '+30 21*',
    '2110004455',
    '+30 12',
    '',
  ].join('\n');
  // The two whole numbers and the two starts; a national number and a short one are not taken.
  assert.equal(spamLines(list), 4);
  assert.equal(spamLines('nothing here\n'), 0);
  assert.equal(spamAddress(' https://example.org/spam.txt '), 'https://example.org/spam.txt');
  assert.equal(spamAddress('http://example.org/spam.txt'), null);
  assert.equal(spamAddress('example.org'), null);
});

test('a spam list is kept only when it came and holds numbers', async () => {
  const { downloadSpamList } = await import('../lib/spam-list');
  const { spamKept } = await import('./phone-memory');
  const bytes = (text: string) => new TextEncoder().encode(text);
  const kept = spamKept.length;
  assert.equal(await downloadSpamList('https://example.org/spam.txt', async () => ({ status: 200, bytes: bytes('+30 211 000 4455\n+33 162*\n') })), 2);
  assert.equal(spamKept.length, kept + 1);
  await assert.rejects(downloadSpamList('https://example.org/spam.txt', async () => ({ status: 404, bytes: bytes('') })));
  await assert.rejects(downloadSpamList('https://example.org/spam.txt', async () => ({ status: 200, bytes: bytes('<html>not a list</html>') })));
  assert.equal(spamKept.length, kept + 1);
});

test('the spam list comes again by itself only when switched on, and a week old; without Tor only when switched on without it', async () => {
  const { refreshSpamList, setSpamWeekly, SPAM_EVERY } = await import('../lib/spam-list');
  const tor = () => true;
  const noTor = () => false;
  const { spamKept, spamNow } = await import('./phone-memory');
  const list = async () => ({ status: 200, bytes: new TextEncoder().encode('+30 211 000 4455\n') });
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now() + 100 * day;
  Object.assign(spamNow, { source: 'https://example.org/spam.txt', at: now - SPAM_EVERY - day, auto: false });
  const kept = spamKept.length;
  assert.equal(await refreshSpamList(now, list, tor), false, 'switched off');
  Object.assign(spamNow, { auto: true, at: now - day });
  assert.equal(await refreshSpamList(now, list, tor), false, 'a day old');
  Object.assign(spamNow, { at: now - SPAM_EVERY - day });
  assert.equal(await refreshSpamList(now, list, tor), true);
  assert.equal(spamKept.length, kept + 1);
  // A server that does not answer is asked again a day later, not each time the Phone opens.
  Object.assign(spamNow, { at: now - SPAM_EVERY - day });
  const down = async () => ({ status: 503, bytes: new Uint8Array() });
  assert.equal(await refreshSpamList(now + 2 * day, down, tor), false);
  assert.equal(await refreshSpamList(now + 2 * day + 60_000, list, tor), false);
  assert.equal(await refreshSpamList(now + 3 * day + 60_000, list, tor), true);
  // Without Tor only when it was switched on without Tor, after the warning of the IP address.
  await setSpamWeekly(true, false);
  Object.assign(spamNow, { at: now - SPAM_EVERY - day });
  assert.equal(await refreshSpamList(now + 10 * day, list, noTor), false, 'switched on with Tor, Tor now off');
  assert.equal(await refreshSpamList(now + 10 * day, list, tor), true);
  await setSpamWeekly(true, true);
  Object.assign(spamNow, { at: now - SPAM_EVERY - day });
  assert.equal(await refreshSpamList(now + 20 * day, list, noTor), true, 'switched on without Tor');
  await setSpamWeekly(false, false);
  Object.assign(spamNow, { auto: false, source: '', at: 0 });
});

test('the phone module asks for the voicemails, which the phone app role gives, or the Voicemail tab stays hidden', () => {
  const manifest = readFileSync(join(ROOT, 'modules', 'erevos-phone', 'android', 'src', 'main', 'AndroidManifest.xml'), 'utf8');
  for (const name of ['READ_VOICEMAIL', 'WRITE_VOICEMAIL']) assert.ok(manifest.includes(`"com.android.voicemail.permission.${name}"`), name);
});
