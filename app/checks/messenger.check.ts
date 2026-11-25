// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Messenger, Signal and Session in Erevos+ (lib/messenger.ts): 64-bit keys read whole, which
// service a key is of, and the state the engines' events make.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkedMsgOwnData } from '../lock/msg-own-data';
import { caseBackdrop, contrast, FONT_URL, messengerCaseLook, ownBubble } from '../lib/messenger-case-look';
import type { Colors } from '../theme/colors';
import { answerOf, applyEvent, countsAsNew, emptyMsgState, keepRead, KEEP_MESSAGES, START_SLACK_MS, readJson, serviceOfKey, threadList } from '../lib/messenger';

test('long numbers are read as their text, short ones and those in strings as they are', () => {
  assert.deepEqual(readJson('{"key":100004567891234567,"ms":1762900000000,"t":"x 12345678901234567 y","n":-4611686018427387905,"f":1.5,"a":[12345678901234567,3]}'), {
    key: '100004567891234567',
    ms: 1762900000000,
    t: 'x 12345678901234567 y',
    n: '-4611686018427387905',
    f: 1.5,
    a: ['12345678901234567', 3],
  });
  assert.deepEqual(readJson('{"s":"a \\" 12345678901234567"}'), { s: 'a " 12345678901234567' });
});

test('a key is Messenger\'s when positive, Signal\'s down to -2^62, Session\'s below', () => {
  assert.equal(serviceOfKey('100004567891234567'), 'messenger');
  assert.equal(serviceOfKey('-1'), 'signal');
  assert.equal(serviceOfKey('-4611686018427387904'), 'signal');
  assert.equal(serviceOfKey('-4611686018427387905'), 'session');
  assert.equal(serviceOfKey('-9223372036854775808'), 'session');
});

test('chats and messages from events: added, replaced when sent again, reacted to, edited, deleted', () => {
  let s = emptyMsgState();
  s = applyEvent(s, { type: 'connected' });
  assert.ok(s.signedIn && s.connected);
  s = applyEvent(s, { type: 'thread', thread: { key: '5', name: 'Ann', snippet: 'hi', lastMs: 10, encrypted: true, group: false, unread: false } });
  s = applyEvent(s, { type: 'thread', thread: { key: '6', name: 'Bob', snippet: '', lastMs: 20, encrypted: false, group: true, unread: false } });
  assert.deepEqual(threadList(s).map((t) => t.key), ['6', '5']);
  s = applyEvent(s, { type: 'message', message: { thread: '5', id: 'm1', sender: '7', name: 'Ann', text: 'hello', ms: 30, mine: false } });
  assert.equal(s.threads['5'].snippet, 'hello');
  assert.equal(s.threads['5'].unread, true);
  assert.deepEqual(threadList(s).map((t) => t.key), ['5', '6']);
  s = applyEvent(s, { type: 'reaction', thread: '5', id: 'm1', actor: '9', emoji: '👍' });
  s = applyEvent(s, { type: 'message', message: { thread: '5', id: 'm1', sender: '7', name: 'Ann', text: 'hello', ms: 30, attachments: [{ kind: 'image', url: 'file:///a.jpg' }] } });
  assert.equal(s.messages['5'].length, 1);
  assert.equal(s.messages['5'][0].attachments[0].url, 'file:///a.jpg');
  assert.deepEqual(s.messages['5'][0].reactions, { '9': '👍' });
  s = applyEvent(s, { type: 'message', message: { thread: '5', id: 'm0', text: 'earlier', ms: 25 } });
  assert.deepEqual(s.messages['5'].map((m) => m.id), ['m0', 'm1']);
  s = applyEvent(s, { type: 'edited', id: 'm1', text: 'hello!' });
  assert.equal(s.messages['5'][1].text, 'hello!');
  assert.ok(s.messages['5'][1].edited);
  s = applyEvent(s, { type: 'reaction', id: 'm1', actor: '9', emoji: '' });
  assert.deepEqual(s.messages['5'][1].reactions, {});
  s = applyEvent(s, { type: 'deleted', thread: '5', id: 'm0' });
  assert.deepEqual(s.messages['5'].map((m) => m.id), ['m1']);
  s = applyEvent(s, { type: 'threadGone', key: '6' });
  assert.deepEqual(Object.keys(s.threads), ['5']);
  s = applyEvent(s, { type: 'fatal', error: 'logged out', signIn: true });
  assert.ok(s.signInAgain && !s.signedIn && !s.connected);
  assert.equal(applyEvent(s, { type: 'something new' }), s);
});

test('only the latest messages of a chat are kept in memory', () => {
  let s = emptyMsgState();
  for (let i = 0; i < KEEP_MESSAGES + 5; i++) s = applyEvent(s, { type: 'message', message: { thread: '1', id: `m${i}`, ms: i } });
  assert.equal(s.messages['1'].length, KEEP_MESSAGES);
  assert.equal(s.messages['1'][0].id, 'm5');
});

test('an answer gives its value, an error is thrown', () => {
  assert.deepEqual(answerOf('{"ok":{"self":100004567891234567}}'), { self: '100004567891234567' });
  assert.equal(answerOf('{"ok":null}'), null);
  assert.throws(() => answerOf('{"error":"not signed in"}'), /not signed in/);
});

test('Signal linking: the QR address, then linked or failed; our own reaction is kept as ours', () => {
  let s = applyEvent(emptyMsgState(), { type: 'signalLink', url: 'sgnl://linkdevice?uuid=x' });
  assert.equal(s.linkUrl, 'sgnl://linkdevice?uuid=x');
  assert.equal(applyEvent(s, { type: 'signalLinkFailed', error: 'timeout' }).linkError, 'timeout');
  s = applyEvent(s, { type: 'signalLinked' });
  assert.ok(s.signedIn && !s.linkUrl);
  s = applyEvent(s, { type: 'message', message: { thread: '-5', id: 'sg:1', ms: 1 } });
  s = applyEvent(s, { type: 'reaction', id: 'sg:1', actor: '-9', emoji: '❤️', mine: true });
  assert.deepEqual(s.messages['-5'][0].reactions, { me: '❤️' });
});

test('a chat marked read here stays read when its messages come again, until a newer one comes', () => {
  let s = applyEvent(emptyMsgState(), { type: 'thread', thread: { key: '5', name: 'Ann', lastMs: 10, unread: false } });
  const readTo = new Map([['5', 10]]);
  const step = (event: unknown) => (s = keepRead(s, applyEvent(s, event), readTo));
  // The last message again (the chat opens, the engine reconnects), and the account still unread.
  step({ type: 'message', message: { thread: '5', id: 'm1', ms: 10 } });
  assert.equal(s.threads['5'].unread, false);
  step({ type: 'thread', thread: { key: '5', name: 'Ann', lastMs: 10, unread: true } });
  assert.equal(s.threads['5'].unread, false);
  // A newer one is unread.
  step({ type: 'message', message: { thread: '5', id: 'm2', ms: 11 } });
  assert.equal(s.threads['5'].unread, true);
  // A chat never marked read here is as the engine says.
  step({ type: 'thread', thread: { key: '6', name: 'Bob', lastMs: 3, unread: true } });
  assert.equal(s.threads['6'].unread, true);
});

test('each new message counts, even when the engine moved its chat to it first; what was read, fetched again or older does not', () => {
  // As Session and Messenger send them: the chat with its new last time, then the message. Counted
  // here as the store counts (lib/messenger-store.ts counted): by the read mark and what was counted.
  const startedAt = 1_000_000;
  let s = emptyMsgState();
  let countedTo: number | undefined;
  let readTo: number | undefined;
  let came = 0;
  const comes = (id: string, ms: number) => {
    s = applyEvent(s, { type: 'thread', thread: { key: '7', name: 'Eve', lastMs: ms, unread: true } });
    if (s.messages['7']?.some((m) => m.id === id)) return;
    if (countsAsNew(ms, readTo, countedTo, startedAt)) {
      countedTo = Math.max(ms, countedTo ?? 0);
      came += 1;
    }
    s = applyEvent(s, { type: 'message', message: { thread: '7', id, ms } });
  };
  comes('a', startedAt + 1);
  comes('b', startedAt + 2);
  comes('c', startedAt + 3);
  assert.equal(came, 3);
  // Read here; the same messages and older ones fetched again count for nothing.
  readTo = startedAt + 3;
  s = { ...s, messages: {} };
  comes('a', startedAt + 1);
  comes('c', startedAt + 3);
  comes('old', startedAt - START_SLACK_MS - 1);
  assert.equal(came, 3);
  // A minute before the start still counts: the phone's clock may run ahead.
  assert.equal(countsAsNew(startedAt - 1000, undefined, undefined, startedAt), true);
  // The next one does.
  comes('d', startedAt + 4);
  assert.equal(came, 4);
});

test('Messenger is used by the engine unless its case was chosen; anything else kept is the engine', () => {
  assert.equal(checkedMsgOwnData({}).messengerWay, 'engine');
  assert.equal(checkedMsgOwnData({ messengerWay: 'case' }).messengerWay, 'case');
  assert.equal(checkedMsgOwnData({ messengerWay: 'web' }).messengerWay, 'engine');
  assert.equal(checkedMsgOwnData({ messengerWay: true }).messengerWay, 'engine');
});

const CASE_COLORS = {
  background: '#0D0B09', surface: '#17140F', surfaceAlt: '#2A2520', surfacePressed: '#352F28', border: '#4A4036',
  text: '#F5EFE6', textMuted: '#BFB6AA', textFaint: '#A39A8D', primary: '#D9A441', primaryPressed: '#C4902F',
  onPrimary: '#0D0B09', primarySoft: '#3A2E17', hero: '#D9A441', heroText: '#0D0B09', heroMuted: '#5A4520',
  success: '#7FB2A8', warning: '#D9A441', danger: '#E08F6E', overlay: 'rgba(0, 0, 0, 0.6)',
  ground: 'transparent', sheet: 'rgba(23, 20, 15, 0.7)', popover: '#17140F', accentText: '#D9A441',
} as Colors;

test('Messenger\'s case is painted in the space\'s colours, dark as Erevos is', () => {
  const look = messengerCaseLook(CASE_COLORS, 'dark');
  assert.equal(look.dark, true);
  assert.equal(look.ground, '#0d0b09');
  assert.match(look.css, /--web-wash:#0d0b09!important;/);
  assert.match(look.css, /--primary-text:#F5EFE6!important;/);
  assert.match(look.css, /--primary-button-background:#D9A441!important;/);
  assert.match(look.css, /\.__fb-dark-mode/);
  assert.doesNotMatch(look.css, /font-family/);
  assert.match(messengerCaseLook(CASE_COLORS, 'light', 'serif').css, /font-family:serif!important/);
  assert.equal(messengerCaseLook(CASE_COLORS, 'light').dark, false);
});

test('only colours go into the case\'s page, and ours are fills white words read on', () => {
  const css = messengerCaseLook({ ...CASE_COLORS, text: 'red;}body{display:none', primary: '#fff}' } as Colors, 'dark').css;
  assert.doesNotMatch(css, /display:none/);
  assert.doesNotMatch(css, /--primary-text:/);
  assert.doesNotMatch(css, /#fff}/);
  // Gold is too light for Meta's white words: deepened; a deep blue stays as it is.
  assert.ok(contrast(ownBubble('#D9A441'), '#ffffff') >= 4.5);
  assert.equal(ownBubble('#1a3a8a'), '#1a3a8a');
  assert.equal(ownBubble('nonsense'), '#0A7CFF');
});

test('the case takes the rest of the look: text size, bubbles, letters, what lies behind', () => {
  const plain = messengerCaseLook(CASE_COLORS, 'dark');
  assert.equal(plain.textZoom, 100);
  assert.deepEqual(plain.fonts, []);
  assert.doesNotMatch(plain.css, /background-image/);
  assert.equal(plain.bubbles.theirs, 'rgb(42, 37, 32)');
  assert.match(plain.bubbles.mine, /^rgb\(\d+, \d+, \d+\)$/);

  assert.equal(messengerCaseLook(CASE_COLORS, 'dark', null, { textScale: 1.3 }).textZoom, 130);
  assert.match(messengerCaseLook(CASE_COLORS, 'dark', null, { bubbles: 'square', squareCorner: 0 }).css, /\.erevos-mine,\.erevos-theirs\{border-radius:0px!important;\}/);
  const line = messengerCaseLook(CASE_COLORS, 'dark', null, { bubbles: 'line' }).css;
  assert.match(line, /\.erevos-mine\{border-right:3px solid rgb\(217, 164, 65\)!important/);
  assert.match(messengerCaseLook(CASE_COLORS, 'dark', null, { glow: true }).css, /box-shadow:0 0 12px rgba\(217, 164, 65, 0\.45\)/);

  // The style's letters come from the case's own address, by index; a serif or monospace wins.
  const fonts = [{ weight: 400, file: '/data/user/0/app.erevos/cache/a.ttf' }, { weight: 700, file: '/data/user/0/app.erevos/cache/b.ttf' }];
  const lettered = messengerCaseLook(CASE_COLORS, 'dark', null, { fonts });
  assert.deepEqual(lettered.fonts, fonts.map((f) => f.file));
  assert.ok(lettered.css.includes(`src:url("${FONT_URL}1") format("truetype");font-weight:700`));
  assert.doesNotMatch(lettered.css, /cache\/a\.ttf/);
  assert.deepEqual(messengerCaseLook(CASE_COLORS, 'dark', 'serif', { fonts }).fonts, []);

  // Behind the page: Neon's grid in tiles, the page's grounds see-through over it.
  const grid = messengerCaseLook(CASE_COLORS, 'dark', null, { backdrop: { kind: 'grid', side: 'dusk', accent: '#D9A441', sheet: false } });
  assert.equal(grid.ground, '#07060f');
  assert.match(grid.css, /--web-wash:transparent!important;/);
  assert.match(grid.css, /background-size:100% 100%,44px 44px,44px 44px!important/);
  // A photo of one's own never leaves Erevos: a gradient of the accent instead.
  const photo = caseBackdrop({ kind: 'pattern', side: 'dusk', accent: '#D9A441', sheet: false, pattern: { name: 'photo', ground: '#0D0B09', dark: true, glass: false, photo: null } });
  assert.match(photo?.layers[0].image ?? '', /^linear-gradient\(160deg/);
  assert.equal(caseBackdrop(null), null);
});

// Signal's history from a backup (#68): a chat Signal no longer has is only to read, a file the
// backup did not hold says so, and chats of another account are told.
test("a Signal chat from a backup is only to read until Signal has it again", () => {
  let s = applyEvent(emptyMsgState(), { type: 'thread', thread: { key: '7', name: 'Old group', readOnly: true } });
  assert.equal(s.threads['7'].readOnly, true);
  s = applyEvent(s, { type: 'thread', thread: { key: '7', name: 'Old group' } });
  assert.equal(s.threads['7'].readOnly, undefined);
});

test("a file a backup did not hold is marked missing, and another account's chats are told", () => {
  const s = applyEvent(emptyMsgState(), { type: 'message', message: { id: 'sg:1:a', thread: '7', ms: 1, attachments: [{ kind: 'image', url: '', missing: true }, { kind: 'image', url: 'file:///x.jpg' }] } });
  const [gone, here] = s.messages['7'][0].attachments;
  assert.equal(gone.missing, true);
  assert.equal(here.missing, undefined);
  assert.equal(applyEvent(emptyMsgState(), { type: 'keptOther' }).keptOther, true);
});
