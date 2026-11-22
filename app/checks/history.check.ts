// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The messages kept on the phone (lock/history.ts) and the sealed file under them (lock/sealed-file.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { randomBytes } from '../lib/crypto';
import { EARLY_LASTS, FILE, History, newTag, PAGE, PAGE_PREFIX, pageSize, SIZE, WAITING } from '../lock/history';
import { sealedFile, sealedSize } from '../lock/sealed-file';
import { splitVoice, VoiceAssembler, PART_SIZE, MAX_PARTS } from '../lib/voice';
import { loadClip, saveClip } from '../lock/voice-clips';
import { blobs, files } from './files-memory';

const t = (name: string, fn: () => Promise<void>) =>
  test(name, async () => {
    files.clear();
    blobs.clear();
    await fn();
  });

const values = () => {
  const data = JSON.parse(files.get(FILE)!) as Record<string, string[]>;
  return [...data.space, ...data.hidden];
};

t('keeps the messages of a chat between launches, in order, sealed with its key', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  await history.add({ peer: 'contact:aa', text: 'γεια σου', mine: true, at: 1, tag: newTag() });
  await history.add({ peer: 'contact:bb', text: 'hello', mine: false, at: 2, tag: newTag() });
  await history.add({ peer: 'contact:aa', text: 'τι κάνεις;', mine: false, at: 3, tag: newTag() });

  const again = await History.open('space', 0, key);
  assert.deepEqual(
    again.messages().map((m) => [m.peer, m.text, m.mine]),
    [
      ['contact:aa', 'γεια σου', true],
      ['contact:bb', 'hello', false],
      ['contact:aa', 'τι κάνεις;', false],
    ],
  );
  // As the history holds it, in quotes: a short word alone may be in the sealed text by chance.
  assert.ok(!files.get(FILE)!.includes(JSON.stringify('hello')));
  assert.deepEqual((await History.open('space', 0, randomBytes(32))).messages(), []);
  assert.deepEqual((await History.open('hidden', 0, key)).messages(), []);
  // Theirs that waits for its time, sent without sound, keeps it.
  await again.add({ peer: 'contact:bb', text: 'later', mine: false, at: Date.now() + 3600_000, tag: newTag(), quiet: true });
  assert.equal((await History.open('space', 0, key)).messages().find((m) => m.text === 'later')?.quiet, true);
});

t('every value is the same size, used or not, whatever the text', async () => {
  const history = await History.open('hidden', 1, randomBytes(32));
  const sizes = () => new Set(values().map((v) => v.length));
  await history.add({ peer: 'contact:aa', text: 'a', mine: true, at: 1, tag: newTag() });
  assert.equal(values().length, 8);
  assert.equal(sizes().size, 1);
  const [size] = sizes();
  await history.add({ peer: 'contact:aa', text: 'αβγδ'.repeat(500), mine: true, at: 2, tag: newTag() });
  assert.deepEqual([...sizes()], [size]);
});

t('keeps every message, however many, in pages of the same size', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 2, key);
  const text = 'κείμενο '.repeat(100);
  for (let at = 0; at < 300; at++) await history.add({ peer: at % 2 ? 'contact:aa' : 'contact:bb', text, mine: true, at, tag: newTag() });
  const kept = (await History.open('space', 2, key)).messages();
  assert.equal(kept.length, 300);
  assert.deepEqual(kept.map((m) => m.at), [...Array(300).keys()]);
  const pages = [...blobs.keys()].filter((name) => name.startsWith(PAGE_PREFIX));
  assert.ok(pages.length > 5, `${pages.length}`);
  // Every page is a whole PAGE once sealed, and nothing in it reads.
  const sizes = new Set(pages.map((name) => blobs.get(name)!.length));
  assert.equal(sizes.size, 1);
  assert.ok([...sizes][0] > PAGE && [...sizes][0] < PAGE + 64);
  assert.ok(pages.every((name) => !Buffer.from(blobs.get(name)!).toString('utf8').includes('κείμενο')));
  // Another key finds none of them.
  assert.deepEqual((await History.open('space', 2, randomBytes(32))).messages(), []);
});

t('a change rewrites only its page, and a page left empty is deleted', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const text = 'x'.repeat(4000);
  const tags: string[] = [];
  for (let at = 0; at < 12; at++) {
    tags.push(newTag());
    await history.add({ peer: 'contact:aa', text, mine: false, at, tag: tags[at] });
  }
  const pages = () => [...blobs.keys()].filter((name) => name.startsWith(PAGE_PREFIX)).sort();
  const before = new Map(pages().map((name) => [name, blobs.get(name)]));
  await history.mark('contact:aa', false, 2, 100, [tags[0]]);
  const changed = pages().filter((name) => blobs.get(name) !== before.get(name));
  assert.equal(changed.length, 1);
  // Four of these fill a page: the first page goes with its four.
  for (const tag of tags.slice(0, 4)) await history.remove('contact:aa', tag);
  assert.equal(pages().length, before.size - 1);
  const again = await History.open('space', 0, key);
  assert.equal(again.messages().length, 8);
  assert.equal(again.messages()[0].at, 4);
});

t('a change in one chat leaves the pages and the messages of the others as they are', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const text = 'x'.repeat(4000);
  const tags: string[] = [];
  // Each chat's messages fill pages of their own: twelve of one, then twelve of the other.
  for (let at = 0; at < 24; at++) {
    tags.push(newTag());
    await history.add({ peer: at < 12 ? 'contact:aa' : 'contact:bb', text, mine: false, at, tag: tags[at] });
  }
  const pages = () => [...blobs.keys()].filter((name) => name.startsWith(PAGE_PREFIX)).sort();
  const before = new Map(pages().map((name) => [name, blobs.get(name)]));
  const were = history.messages();
  await history.mark('contact:bb', false, 2, 100, [tags[13]]);
  await history.react('contact:bb', tags[20], true, '👍');
  await history.remove('contact:bb', tags[23]);
  const changed = pages().filter((name) => blobs.get(name) !== before.get(name));
  assert.ok(changed.length >= 1 && changed.length <= 3, `${changed.length}`);
  const now = history.messages();
  assert.equal(now.length, 23);
  // Those kept as they were are the same ones, not unpacked again; the changed ones are new.
  for (let i = 0; i < 12; i++) assert.equal(now[i], were[i]);
  assert.notEqual(now[13], were[13]);
  assert.equal(now[13].mark, 2);
  assert.equal(now[20].myReaction, '👍');
  // And it all reads the same from the phone.
  assert.deepEqual((await History.open('space', 0, key)).messages(), now);
});

test('a page is measured from its messages as it is when written out whole', () => {
  const kept = (text: string, at: number) => [at, 1, text, newTag(), 0, 0, 0] as never;
  const entries = [
    ['contact:aa', kept('κείμενο 😀 "x"\n', 1)],
    ['contact:ββ', kept('', 2)],
    ['contact:aa', kept('\ud83d lone', 3)],
  ] as never[];
  for (let n = 0; n <= entries.length; n++) assert.equal(pageSize(entries.slice(0, n)), sealedSize({ m: entries.slice(0, n) }));
});

t('a message too long for one page gets a page of its own, whole', async () => {
  const key = randomBytes(32);
  const history = await History.open('hidden', 0, key);
  await history.add({ peer: 'contact:aa', text: 'α'.repeat(12000), mine: true, at: 1, tag: newTag() });
  await history.add({ peer: 'contact:aa', text: 'short', mine: true, at: 2, tag: newTag() });
  assert.deepEqual((await History.open('hidden', 0, key)).messages().map((m) => m.text.length), [12000, 5]);
});

t('deletes one message by its tag, and gives messages kept before tags a tag of their own', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const tag = newTag();
  await history.add({ peer: 'contact:aa', text: 'one', mine: true, at: 1, tag });
  await history.add({ peer: 'contact:aa', text: 'two', mine: false, at: 2, tag: newTag() });
  await history.remove('contact:aa', tag);
  await history.remove('contact:bb', tag);
  const kept = (await History.open('space', 0, key)).messages();
  assert.deepEqual(kept.map((m) => m.text), ['two']);
  assert.match(kept[0].tag, /^[0-9a-f]{12}$/);
  await history.remove('contact:aa', kept[0].tag);
  assert.deepEqual((await History.open('space', 0, key)).messages(), []);

  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 0, key, { chats: { 'contact:aa': [[1, 1, 'old']] } });
  const [old] = (await History.open('space', 0, key)).messages();
  assert.equal(old.text, 'old');
  assert.match(old.tag, /^[0-9a-f]{12}$/);
});

t('keeps which message one answers, and the reactions to it, ours and theirs', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const first = newTag();
  const answer = newTag();
  await history.add({ peer: 'contact:aa', text: 'question?', mine: false, at: 1, tag: first });
  await history.add({ peer: 'contact:aa', text: 'answer', mine: true, at: 2, tag: answer, re: first });
  assert.equal(await history.react('contact:aa', first, true, '👍'), true);
  assert.equal(await history.react('contact:aa', answer, false, '❤️'), true);
  assert.equal(await history.react('contact:aa', newTag(), false, '😂'), false);
  const kept = (await History.open('space', 0, key)).messages();
  assert.deepEqual(
    kept.map((m) => [m.text, m.re, m.myReaction, m.theirReaction]),
    [
      ['question?', undefined, '👍', undefined],
      ['answer', first, undefined, '❤️'],
    ],
  );
  // A reaction taken back is none; one that is words is never kept.
  await history.react('contact:aa', first, true, '');
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', first, 0, 0, 0, 0, 0, { y: 'hello', o: '<b>', p: 'not a tag' }]] } });
  const [odd] = (await History.open('space', 1, key)).messages();
  assert.deepEqual([odd.myReaction, odd.theirReaction, odd.re], [undefined, undefined, undefined]);
  assert.equal((await History.open('space', 0, key)).messages()[0].myReaction, undefined);
});

t('only its sender edits a message, words only, and it is kept as edited, when', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const [ours, theirs, sticker, waits] = [newTag(), newTag(), newTag(), newTag()];
  const preview = { url: 'https://example.org/a', title: 'A page', text: '' };
  await history.add({ peer: 'contact:aa', text: 'see https://example.org/a', mine: true, at: 1, tag: ours, preview });
  await history.add({ peer: 'contact:aa', text: 'helo', mine: false, at: 2, tag: theirs });
  await history.add({ peer: 'contact:aa', text: '🌝', mine: false, at: 3, tag: sticker, sticker: 'moon-smile' });
  await history.add({ peer: 'contact:aa', text: 'soon', mine: true, at: 4, tag: waits, mark: WAITING });
  assert.equal(await history.edit('contact:aa', theirs, true, 'mine now', 10), false, 'not ours to edit');
  assert.equal(await history.edit('contact:aa', theirs, false, 'hello', 10), true);
  assert.equal(await history.edit('contact:aa', theirs, false, 'hello', 11), false, 'the same words change nothing');
  assert.equal(await history.edit('contact:aa', ours, true, '   ', 12), false, 'no words is no edit');
  assert.equal(await history.edit('contact:aa', sticker, false, 'other', 12), false, 'a sticker is what it is');
  assert.equal(await history.edit('contact:aa', ours, true, 'no link now', 13), true);
  assert.equal(await history.edit('contact:aa', waits, true, 'later', 14), true);
  assert.equal(await history.edit('contact:aa', newTag(), false, 'gone', 15), false);
  const kept = (await History.open('space', 0, key)).messages();
  assert.deepEqual(
    kept.map((m) => [m.text, m.edited, m.preview]),
    [
      ['no link now', 13, undefined],
      ['hello', 10, undefined],
      ['🌝', undefined, undefined],
      // One that waits goes with the new words as it is.
      ['later', undefined, undefined],
    ],
  );
  // The preview stays while its link is in the words.
  const linked = newTag();
  await history.add({ peer: 'contact:bb', text: 'https://example.org/a', mine: true, at: 5, tag: linked, preview });
  await history.edit('contact:bb', linked, true, 'look: https://example.org/a', 16);
  assert.deepEqual(history.messages().find((m) => m.tag === linked)?.preview, preview);
});

t('keeps when a message was pinned, until it is taken down', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const tag = newTag();
  await history.add({ peer: 'contact:aa', text: 'the address', mine: false, at: 1, tag });
  assert.equal(await history.pin('contact:aa', tag, 5000), true);
  assert.equal(await history.pin('contact:aa', newTag(), 5000), false);
  assert.equal((await History.open('space', 0, key)).messages()[0].pinned, 5000);
  await history.pin('contact:aa', tag, 0);
  assert.equal((await History.open('space', 0, key)).messages()[0].pinned, undefined);
});

t('keeps a star on this phone, and a star of the wrong shape is none', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const tag = newTag();
  await history.add({ peer: 'contact:aa', text: 'keep this', mine: true, at: 1, tag });
  assert.equal(await history.star('contact:aa', tag, true), true);
  assert.equal((await History.open('space', 0, key)).messages()[0].starred, true);
  await history.star('contact:aa', tag, false);
  assert.equal((await History.open('space', 0, key)).messages()[0].starred, undefined);
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', tag, 0, 0, 0, 0, 0, { f: true, n: -5 }]] } });
  const [odd] = (await History.open('space', 1, key)).messages();
  assert.deepEqual([odd.starred, odd.pinned], [undefined, undefined]);
});

t('keeps that a message came or went through Nostr, on this phone', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const [sent, got] = [newTag(), newTag()];
  await history.add({ peer: 'contact:aa', text: 'through Nostr', mine: true, at: 1, tag: sent });
  await history.add({ peer: 'contact:aa', text: 'back', mine: false, at: 2, tag: got, nostr: true });
  assert.equal(await history.throughNostr('contact:aa', sent), true);
  assert.equal(await history.throughNostr('contact:aa', newTag()), false);
  assert.deepEqual(
    (await History.open('space', 0, key)).messages().map((m) => [m.text, m.nostr]),
    [
      ['through Nostr', true],
      ['back', true],
    ],
  );
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', sent, 0, 0, 0, 0, 0, { t: true }]] } });
  assert.equal((await History.open('space', 1, key)).messages()[0].nostr, undefined);
});

t('keeps the way a message went or came, and drops one of an unknown way', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  await history.add({ peer: 'contact:aa', text: 'one', mine: true, at: 1, tag: newTag(), route: 'relay' });
  await history.add({ peer: 'contact:aa', text: 'two', mine: false, at: 2, tag: newTag(), route: 'nearby' });
  await history.add({ peer: 'contact:aa', text: 'three', mine: true, at: 3, tag: newTag() });
  assert.deepEqual(
    (await History.open('space', 0, key)).messages().map((m) => [m.text, m.route]),
    [
      ['one', 'relay'],
      ['two', 'nearby'],
      ['three', undefined],
    ],
  );
  const raw = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await raw.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', newTag(), 0, 0, 0, 0, 0, { v: 'bluetooth' }]] } });
  assert.equal((await History.open('space', 1, key)).messages()[0].route, undefined);
});

t('keeps the sticker or the place a message is, and drops one of the wrong shape', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  await history.add({ peer: 'contact:aa', text: '🌝', mine: true, at: 1, tag: newTag(), sticker: 'moon-smile' });
  await history.add({ peer: 'contact:aa', text: 'here', mine: false, at: 2, tag: newTag(), place: { lat: 1.5, lon: -2.25, acc: 8 } });
  const kept = (await History.open('space', 0, key)).messages();
  assert.deepEqual(
    kept.map((m) => [m.sticker, m.place]),
    [
      ['moon-smile', undefined],
      [undefined, { lat: 1.5, lon: -2.25, acc: 8 }],
    ],
  );
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', newTag(), 0, 0, 0, 0, 0, { s: 'Big Sticker', l: { lat: 200, lon: 0 } }]] } });
  const [odd] = (await History.open('space', 1, key)).messages();
  assert.deepEqual([odd.sticker, odd.place], [undefined, undefined]);
});

t('keeps that a message was forwarded, and the preview of its link', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const preview = { url: 'https://x.example/', title: 'T', text: 'About it', image: '/9j/AAAA' };
  await history.add({ peer: 'contact:aa', text: 'look', mine: true, at: 1, tag: newTag(), forwarded: true });
  await history.add({ peer: 'contact:aa', text: 'https://x.example/', mine: false, at: 2, tag: newTag(), preview });
  assert.deepEqual(
    (await History.open('space', 0, key)).messages().map((m) => [m.forwarded, m.preview]),
    [
      [true, undefined],
      [undefined, preview],
    ],
  );
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', newTag(), 0, 0, 0, 0, 0, { w: { url: 'javascript:x', title: 'T', text: '' } }]] } });
  assert.equal((await History.open('space', 1, key)).messages()[0].preview, undefined);
});

t('keeps a poll and the votes on it, ours and theirs, as the poll allows', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const tag = newTag();
  await history.add({ peer: 'contact:aa', text: 'q', mine: true, at: 1, tag, poll: { q: 'Which?', o: ['a', 'b', 'c'] } });
  assert.equal(await history.vote('contact:aa', tag, true, [2]), true);
  assert.equal(await history.vote('contact:aa', tag, false, [0, 1]), true);
  assert.equal(await history.vote('contact:aa', tag, false, [5]), false);
  assert.equal(await history.vote('contact:aa', newTag(), false, [0]), false);
  const [poll] = (await History.open('space', 0, key)).messages();
  assert.deepEqual([poll.poll, poll.myVote, poll.theirVote], [{ q: 'Which?', o: ['a', 'b', 'c'] }, [2], [0]]);
  await history.vote('contact:aa', tag, true, []);
  assert.equal((await History.open('space', 0, key)).messages()[0].myVote, undefined);
});

t('keeps that a poll was ended, once, by its sender only, and takes no votes on it after', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const [ours, theirs] = [newTag(), newTag()];
  const poll = { q: 'Which?', o: ['a', 'b'] };
  await history.add({ peer: 'contact:aa', text: 'q', mine: true, at: 1, tag: ours, poll });
  await history.add({ peer: 'contact:aa', text: 'q', mine: false, at: 2, tag: theirs, poll });
  await history.add({ peer: 'contact:aa', text: 'no poll', mine: true, at: 3, tag: newTag() });
  assert.equal(await history.vote('contact:aa', ours, false, [1]), true);
  // Theirs is not ours to end, nor ours theirs; words are no poll.
  assert.equal(await history.close('contact:aa', theirs, true, 10), false);
  assert.equal(await history.close('contact:aa', ours, false, 10), false);
  assert.equal(await history.close('contact:aa', history.messages()[2].tag, true, 10), false);
  assert.equal(await history.close('contact:aa', ours, true, 10), true);
  assert.equal(await history.close('contact:aa', ours, true, 20), false);
  assert.equal(await history.close('contact:aa', theirs, false, 30), true);
  assert.equal(await history.vote('contact:aa', ours, false, [0]), false);
  assert.equal(await history.vote('contact:aa', theirs, true, [0]), false);
  const [mine, their] = (await History.open('space', 0, key)).messages();
  assert.deepEqual([mine.closed, mine.theirVote, their.closed, their.myVote], [10, [1], 30, undefined]);
});

t('keeps a contact card with its words, and leaves one of the wrong shape', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const card = 'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Lovelace;Ada;;;\r\nFN:Ada Lovelace\r\nTEL;TYPE=CELL:+302101234567\r\nEND:VCARD\r\n';
  await history.add({ peer: 'contact:aa', text: '👤 Ada Lovelace\n+302101234567', mine: false, at: 1, tag: newTag(), card });
  assert.equal((await History.open('space', 0, key)).messages()[0].card, card);
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', newTag(), 0, 0, 0, 0, 0, { j: 'not a card' }]] } });
  assert.equal((await History.open('space', 1, key)).messages()[0].card, undefined);
});

t('keeps a payment request, and that it was paid, once, by the one asked', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const [ours, theirs] = [newTag(), newTag()];
  const pay = { a: 4500, d: 2, c: 'EUR', w: 'Rent', r: 'tx-17' };
  await history.add({ peer: 'contact:aa', text: 'Payment request: €45.00 · Rent', mine: true, at: 1, tag: ours, pay });
  await history.add({ peer: 'contact:aa', text: 'Payment request: €5.00', mine: false, at: 2, tag: theirs, pay: { a: 500, d: 2, c: 'EUR', w: '' } });
  // Ours is marked by them, theirs by us: never the other way round.
  assert.equal(await history.paid('contact:aa', ours, true, 10), false);
  assert.equal(await history.paid('contact:aa', theirs, false, 10), false);
  assert.equal(await history.paid('contact:aa', ours, false, 10), true);
  assert.equal(await history.paid('contact:aa', ours, false, 20), false);
  assert.equal(await history.paid('contact:aa', theirs, true, 30), true);
  assert.equal(await history.paid('contact:aa', newTag(), true, 30), false);
  const [one, two] = (await History.open('space', 0, key)).messages();
  assert.deepEqual([one.pay, one.paid, two.paid], [pay, 10, 30]);
  // One kept with a request that is not of its shape keeps none.
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'x', newTag(), 0, 0, 0, 0, 0, { m: { a: -1, d: 2, c: 'EUR', w: '' }, u: 5 }]] } });
  const [bad] = (await History.open('space', 1, key)).messages();
  assert.deepEqual([bad.pay, bad.paid], [undefined, undefined]);
});

t('deletes the messages of one chat and keeps the others', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  await history.add({ peer: 'contact:aa', text: 'one', mine: true, at: 1, tag: newTag() });
  await history.add({ peer: 'contact:bb', text: 'two', mine: true, at: 2, tag: newTag() });
  await history.clear('contact:aa');
  assert.deepEqual(
    (await History.open('space', 0, key)).messages().map((m) => m.text),
    ['two'],
  );
});

t('a disappearing message is kept with its time, and goes once that has passed', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  await history.add({ peer: 'contact:aa', text: 'stays', mine: true, at: 1, tag: newTag() });
  await history.add({ peer: 'contact:aa', text: 'soon', mine: false, at: 2, tag: newTag(), until: 1000 });
  await history.add({ peer: 'contact:bb', text: 'later', mine: true, at: 3, tag: newTag(), until: 5000 });
  assert.equal(await history.expire(999), false);

  const again = await History.open('space', 0, key);
  assert.deepEqual(again.messages().map((m) => [m.text, m.until]), [['stays', 0], ['soon', 1000], ['later', 5000]]);
  assert.equal(await again.expire(1000), true);
  assert.deepEqual((await History.open('space', 0, key)).messages().map((m) => m.text), ['stays', 'later']);
  await again.expire(10_000);
  assert.deepEqual((await History.open('space', 0, key)).messages().map((m) => m.text), ['stays']);
  assert.ok(values().every((v) => v.length === values()[0].length));
});

t('marks what came and was read, and a disappearing message starts its time once read', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const [one, two, three] = [newTag(), newTag(), newTag()];
  await history.add({ peer: 'contact:aa', text: 'one', mine: true, at: 1, tag: one, lasts: 60 });
  await history.add({ peer: 'contact:aa', text: 'two', mine: true, at: 2, tag: two });
  await history.add({ peer: 'contact:aa', text: 'three', mine: false, at: 3, tag: three, lasts: 300 });
  await history.add({ peer: 'contact:bb', text: 'four', mine: false, at: 4, tag: newTag() });

  // Ours came to their phone; nothing starts yet, and waiting messages do not expire.
  assert.deepEqual((await history.mark('contact:aa', true, 1, 100, [one, two])).sort(), [one, two].sort());
  assert.deepEqual(await history.mark('contact:aa', true, 1, 100, [one]), []);
  assert.equal(await history.expire(Number.MAX_SAFE_INTEGER), false);

  // They read the first: it disappears 60 seconds from then. Read here: theirs starts too.
  assert.deepEqual(await history.mark('contact:aa', true, 2, 1000, [one]), [one]);
  assert.deepEqual(await history.mark('contact:aa', false, 2, 2000), [three]);
  const again = await History.open('space', 0, key);
  assert.deepEqual(
    again.messages().map((m) => [m.text, m.mark, m.until, m.lasts]),
    [
      ['one', 2, 61_000, 0],
      ['two', 1, 0, 0],
      ['three', 2, 302_000, 0],
      ['four', 0, 0, 0],
    ],
  );
  await again.expire(61_000);
  assert.deepEqual((await History.open('space', 0, key)).messages().map((m) => m.text), ['two', 'three', 'four']);

  // A message kept before marks reads as not read.
  const before = sealedFile<unknown>({ name: FILE, empty: {}, checked: (v) => v, block: SIZE, fixed: true });
  await before.save('space', 1, key, { chats: { 'contact:aa': [[1, 0, 'old', one, 0, 0, 7]] } });
  assert.deepEqual((await History.open('space', 1, key)).messages().map((m) => [m.mark, m.until, m.lasts]), [[0, 0, 0]]);
});

t('ours their phone said came, or read, before it was kept here is kept so, for a while', async () => {
  const key = randomBytes(32);
  const history = await History.open('space', 0, key);
  const [read, came, late, theirs] = [newTag(), newTag(), newTag(), newTag()];
  const now = Date.now();
  // Said while they went (through Nostr, their phone may have them first): none is kept yet.
  assert.deepEqual(await history.mark('contact:aa', true, 2, now, [read]), []);
  assert.deepEqual(await history.mark('contact:aa', true, 1, now, [read, came]), []);
  assert.deepEqual(await history.mark('contact:aa', true, 1, now - EARLY_LASTS, [late]), []);
  assert.deepEqual(await history.mark('contact:aa', false, 2, now, [theirs]), []);
  assert.deepEqual(history.markedEarly('contact:aa', read), { mark: 2, at: now });
  assert.equal(history.markedEarly('contact:bb', read), null, 'in their chat only');

  await history.add({ peer: 'contact:bb', text: 'another chat', mine: true, at: 1, tag: read });
  await history.add({ peer: 'contact:aa', text: 'read', mine: true, at: 2, tag: read, lasts: 60 });
  await history.add({ peer: 'contact:aa', text: 'came', mine: true, at: 3, tag: came });
  await history.add({ peer: 'contact:aa', text: 'long ago', mine: true, at: 4, tag: late });
  await history.add({ peer: 'contact:aa', text: 'theirs', mine: false, at: 5, tag: theirs });
  assert.deepEqual(
    (await History.open('space', 0, key)).messages().map((m) => [m.text, m.mark, m.until, m.lasts]),
    [
      ['another chat', 0, 0, 0],
      ['read', 2, now + 60_000, 0],
      ['came', 1, 0, 0],
      ['long ago', 0, 0, 0],
      ['theirs', 0, 0, 0],
    ],
  );
  // Once kept, it is kept no more: the same tag again starts as it is.
  assert.equal(history.markedEarly('contact:aa', read), null);
  await history.remove('contact:aa', came);
  await history.add({ peer: 'contact:aa', text: 'came again', mine: true, at: 6, tag: came });
  assert.equal(history.messages().find((m) => m.text === 'came again')?.mark, 0);
});

t('a voice message keeps its sound sealed in a file of its own, deleted with the message', async () => {
  const key = randomBytes(32);
  const sound = randomBytes(25_000);
  const voice = await saveClip(sound, 7400.4);
  assert.equal(voice.ms, 7400);
  const [name] = [...blobs.keys()].filter((n) => !n.startsWith(PAGE_PREFIX));
  assert.ok(name.startsWith('erevos-voice-') && name.endsWith(voice.id));
  assert.notDeepEqual(blobs.get(name)!.slice(12, 40), sound.slice(0, 28));
  assert.deepEqual(await loadClip(voice), sound);
  await assert.rejects(loadClip({ ...voice, key: '00'.repeat(32) }));

  const history = await History.open('space', 0, key);
  const tag = newTag();
  await history.add({ peer: 'contact:aa', text: '', mine: false, at: 1, tag, voice, lasts: 60 });
  await history.add({ peer: 'contact:aa', text: 'text', mine: true, at: 2, tag: newTag() });
  const [kept] = (await History.open('space', 0, key)).messages();
  assert.deepEqual([kept.voice, kept.lasts, kept.mark], [voice, 60, 0]);
  assert.ok(!files.get(FILE)!.includes(voice.key));

  // Read, its time runs out, and its sound goes with it.
  await history.mark('contact:aa', false, 2, 1000);
  await history.expire(61_000);
  assert.deepEqual([...blobs.keys()].filter((n) => !n.startsWith(PAGE_PREFIX)), []);
  assert.equal(await loadClip(voice), null);

  // However a message goes: deleted by its tag, or with its chat.
  const one = await saveClip(randomBytes(10), 1000);
  const two = await saveClip(randomBytes(10), 1000);
  await history.add({ peer: 'contact:aa', text: '', mine: true, at: 3, tag: 'aaaaaaaaaaaa', voice: one });
  await history.add({ peer: 'contact:bb', text: '', mine: true, at: 4, tag: newTag(), voice: two });
  await history.remove('contact:aa', 'aaaaaaaaaaaa');
  assert.deepEqual([await loadClip(one), (await loadClip(two))?.length], [null, 10]);
  await history.clear('contact:bb');
  assert.deepEqual([...blobs.keys()].filter((n) => !n.startsWith(PAGE_PREFIX)), []);
});

test('a voice message is cut in parts and put back together, whatever order they come in', () => {
  const sound = randomBytes(PART_SIZE * 2 + 123);
  const parts = splitVoice(sound, 5000);
  assert.deepEqual(parts.map((p) => [p.part, p.parts, p.data.length]), [[0, 3, PART_SIZE], [1, 3, PART_SIZE], [2, 3, 123]]);
  const assembler = new VoiceAssembler();
  assert.equal(assembler.has('contact:aa', parts[2], 0), false);
  assert.equal(assembler.add('contact:aa', parts[2], 0), null);
  // A part that came already is known, only for its chat, and only while it is not dropped.
  assert.equal(assembler.has('contact:aa', parts[2], 0), true);
  assert.equal(assembler.has('contact:aa', parts[0], 0), false);
  assert.equal(assembler.has('contact:bb', parts[2], 0), false);
  assert.equal(assembler.has('contact:aa', parts[2], 11 * 60_000), false);
  // Another chat's parts with the same id are another message.
  assert.equal(assembler.add('contact:bb', parts[0], 0), null);
  assert.equal(assembler.add('contact:aa', parts[0], 0), null);
  const whole = assembler.add('contact:aa', parts[1], 0)!;
  assert.deepEqual([whole.audio, whole.ms], [sound, 5000]);
  // Parts that stop coming are dropped after a while.
  assert.equal(assembler.add('contact:bb', parts[1], 11 * 60_000), null);
  assert.equal(assembler.add('contact:bb', parts[2], 11 * 60_000), null);
  assert.throws(() => splitVoice(new Uint8Array(PART_SIZE * MAX_PARTS + 1), 1000), /too long/);
});
