// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Stars on the messages of the chats on Matrix, XMPP and Nostr and of the SMS (lib/stars.ts,
// lock/stars-data.ts): kept sealed per place, the space's and each hidden place's apart, one star a
// message, the oldest going past the most; a starred message gone, or its chat, losing its star,
// while one only older than what its chat keeps stays; each opening its own chat at it; and the
// starred messages of every chat, Erevos's and the others', listed together, the latest first.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { files } from './files-memory';
import { randomBytes } from '../lib/crypto';
import { setLang } from '../lib/i18n';
import {
  checkedStars,
  latestFirst,
  MAX_LINE,
  MAX_STARS,
  sameStar,
  starGone,
  starHref,
  starredNow,
  starRow,
  starsIn,
  withStar,
  type Star,
  type StarChat,
} from '../lib/stars';
import { hiddenHolder } from '../lock/sealed-file';
import { FILE, forgetStars, loadStars, onStarsChange, starMessage, type StarPlace } from '../lock/stars-data';

const t = (name: string, fn: () => void | Promise<void>) =>
  test(name, async () => {
    files.clear();
    setLang('en');
    await fn();
  });

const star = (over: Partial<Star> = {}): Star => ({ service: 'matrix', account: '@ann:example.org', chat: '!room:example.org', id: '$one', at: 1000, mine: false, line: 'Coffee at five', ...over });

t('one star a message: given again it takes the place of the one before, and taken off it goes', () => {
  const a = star();
  const b = star({ id: '$two', at: 2000 });
  let list = withStar([], a, true);
  list = withStar(list, b, true);
  list = withStar(list, { ...a, line: 'Coffee at six' }, true);
  assert.deepEqual(list.map((s) => [s.id, s.line]), [['$two', 'Coffee at five'], ['$one', 'Coffee at six']]);
  assert.deepEqual(withStar(list, a, false).map((s) => s.id), ['$two']);
  // The same id in another chat, account or network is another message.
  for (const other of [{ chat: '!other:example.org' }, { account: '@ben:example.org' }, { service: 'xmpp' as const }]) assert.ok(!sameStar(a, star(other)));
  assert.deepEqual(starsIn(list, 'matrix', '@ann:example.org', '!room:example.org').length, 2);
  assert.deepEqual(starsIn(list, 'matrix', '@ben:example.org', '!room:example.org'), []);
});

t('a place keeps its latest stars, the most there can be, each line cut short', () => {
  let list: Star[] = [];
  for (let i = 0; i < MAX_STARS + 5; i++) list = withStar(list, star({ id: `$${i}` }), true);
  assert.equal(list.length, MAX_STARS);
  assert.equal(list[0].id, '$5', 'the first starred went first');
  assert.equal(withStar([], star({ line: 'λ'.repeat(MAX_LINE * 2) }), true)[0].line.length, MAX_LINE);
});

t('what was kept is read back with anything of the wrong shape left out', () => {
  const good = star({ group: true, thread: '$root' });
  const read = checkedStars([
    good,
    good,
    { ...good, id: '$x', service: 'telegram' },
    { ...good, id: '' },
    { ...good, id: '$y', at: 'soon' },
    { ...good, id: '$z', mine: 'yes' },
    { ...good, id: '$w', line: 7 },
    { ...good, id: '$v', group: 'yes', thread: 9 },
    null,
    'star',
  ]);
  assert.deepEqual(read, [good, { ...star({ id: '$v' }) }]);
  assert.deepEqual(checkedStars(undefined), []);
  assert.deepEqual(checkedStars({ stars: [] }), []);
});

t('a starred message deleted, or its chat left, is gone; one older than what the chat keeps stays', () => {
  const kept = [
    { id: 'a', at: 500 },
    { id: 'b', at: 1000, deleted: true },
    { id: 'c', at: 1500 },
  ];
  assert.equal(starGone({ id: 'a', at: 500 }, kept), false);
  assert.equal(starGone({ id: 'b', at: 1000 }, kept), true, 'taken back');
  assert.equal(starGone({ id: 'gone', at: 1200 }, kept), true, 'deleted from among those kept');
  assert.equal(starGone({ id: 'old', at: 100 }, kept), false, 'only older than what is kept');
  assert.equal(starGone({ id: 'a', at: 500 }, null), true, 'its chat is no longer here');
  assert.equal(starGone({ id: 'a', at: 500 }, []), false, 'nothing kept tells nothing');
});

t('each starred message opens its own chat at it, a hidden place’s with its account', () => {
  assert.equal(starHref(star()), '/matrix-chat?room=!room%3Aexample.org&at=%24one');
  assert.equal(starHref(star({ thread: '$root' }), true), '/matrix-chat?room=!room%3Aexample.org&thread=%24root&at=%24one&hidden=1');
  assert.equal(starHref(star({ service: 'xmpp', chat: 'ben@example.org', id: 'x/1' })), '/xmpp-chat?jid=ben%40example.org&at=x%2F1');
  assert.equal(starHref(star({ service: 'nostr', chat: 'ab'.repeat(32), id: 'cd'.repeat(32) }), true), `/nostr-chat?key=${'ab'.repeat(32)}&at=${'cd'.repeat(32)}&hidden=1`);
  // The SMS themselves, even of a number linked to a contact; an SMS has no hidden place.
  assert.equal(starHref(star({ service: 'sms', account: '', chat: '+306900000001,+306900000002', id: 'mms:4' }), true), '/sms?to=%2B306900000001%2C%2B306900000002&plain=1&at=mms%3A4');
});

t('the starred of every chat are listed together, the latest first, each with its network', () => {
  const ann = star({ at: 3000 });
  const mine = star({ service: 'xmpp', account: 'me@example.org', chat: 'ben@example.org', id: 'x1', at: 1000, mine: true });
  const inGroup = star({ service: 'nostr', account: 'aa', chat: 'bb', id: 'n1', at: 2000, mine: true, group: true });
  const text = star({ service: 'sms', account: '', chat: '+3069', id: 'sms:1', at: 4000 });
  const gone = star({ id: '$gone', at: 3500 });
  const left = star({ service: 'xmpp', account: 'me@example.org', chat: 'left@example.org', id: 'x2', at: 100 });
  const signedOut = star({ account: '@old:example.org', id: '$old' });
  const chats: Record<string, StarChat | undefined> = {
    '!room:example.org': { name: 'Ann', messages: [{ id: '$one', at: 3000 }, { id: '$x', at: 3600 }] },
    'ben@example.org': { name: 'Ben', messages: [{ id: 'x1', at: 1000 }] },
    bb: { name: 'Climbers', messages: [{ id: 'n1', at: 2000 }] },
    // The SMS not read now: shown, never forgotten.
    '+3069': { name: 'Mum' },
    'left@example.org': { name: '', messages: null },
  };
  const { rows, gone: lost } = starredNow([ann, mine, inGroup, text, gone, left, signedOut], (s) => (s.account === '@old:example.org' ? undefined : chats[s.chat]));
  assert.deepEqual(lost.map((s) => s.id), ['$gone', 'x2']);
  const erevos = { key: 'contact:aa|t1', name: 'Dora', line: 'From Erevos', at: 2500, href: '/chat?contact=aa&at=t1' };
  const listed = latestFirst([erevos, ...rows]);
  assert.deepEqual(
    listed.map((r) => [r.name, r.line]),
    [
      ['Mum · SMS', 'Coffee at five'],
      ['Ann · Matrix', 'Coffee at five'],
      ['Dora', 'From Erevos'],
      ['You in Climbers · Nostr', 'Coffee at five'],
      ['You to Ben · XMPP', 'Coffee at five'],
    ],
  );
  assert.equal(listed[1].href, starHref(ann));
  assert.equal(starRow(text, 'Mum').key, 'sms||+3069|sms:1');
});

t('a disappearing message, or one deleted on this phone, takes its star along, even older than what is kept', () => {
  // Gone by the chat's timer: older than the messages kept, it would otherwise stay with its line.
  const timed = star({ id: '$timed', at: 1000 });
  const kept = star({ id: '$kept', at: 2000 });
  const here = star({ service: 'xmpp', account: 'me@example.org', chat: 'ben@example.org', id: 'x0', at: 500 });
  const chats: Record<string, StarChat> = {
    '!room:example.org': { name: 'Ann', messages: [{ id: '$kept', at: 2000 }], goneHere: (id) => id === '$timed' },
    'ben@example.org': { name: 'Ben', messages: [], goneHere: (id) => id === 'x0' },
  };
  const { rows, gone } = starredNow([timed, kept, here], (s) => chats[s.chat]);
  assert.deepEqual(gone.map((s) => s.id), ['$timed', 'x0']);
  assert.deepEqual(rows.map((r) => r.key), [starRow(kept, 'Ann').key]);
});

const place = (holder: StarPlace['holder'] = 'space', key = randomBytes(32)): StarPlace => ({ holder, space: 0, key });

t('a place’s stars are kept sealed, the space’s and each hidden place’s apart', async () => {
  const space = place();
  const hidden = place(hiddenHolder(1));
  await starMessage(space, star(), true);
  await starMessage(hidden, star({ service: 'nostr', account: 'aa', chat: 'bb', id: 'n1', line: 'Κρυφό' }), true);
  assert.deepEqual((await loadStars(space)).map((s) => s.id), ['$one']);
  assert.deepEqual((await loadStars(hidden)).map((s) => s.line), ['Κρυφό']);
  // Nothing of them shows in the file, nor opens with another key. Each looked-for text holds a
  // space, «!», «:» or Greek, which the sealed text never does, so a chance run of letters in it
  // (16 KB a place) cannot look like one.
  const sealed = files.get(FILE) ?? '';
  assert.ok(sealed.length > 0);
  for (const plain of ['Coffee at five', '!room:example.org', '@ann:example.org', 'Κρυφό']) assert.ok(!sealed.includes(plain), plain);
  assert.deepEqual(await loadStars({ ...space, key: randomBytes(32) }), []);
  assert.deepEqual(await loadStars(place(hiddenHolder(2))), []);
});

t('stars given at once are all kept, each told, and those forgotten go', async () => {
  const space = place();
  const told: string[] = [];
  const off = onStarsChange((name) => told.push(name));
  try {
    await Promise.all(Array.from({ length: 5 }, (_, i) => starMessage(space, star({ id: `$${i}`, at: i }), true)));
    assert.deepEqual((await loadStars(space)).map((s) => s.id).sort(), ['$0', '$1', '$2', '$3', '$4']);
    assert.deepEqual(told, Array(5).fill('space/0'));
    await forgetStars(space, [star({ id: '$1' }), star({ id: '$3' }), star({ id: '$nothing' })]);
    assert.deepEqual((await loadStars(space)).map((s) => s.id).sort(), ['$0', '$2', '$4']);
    assert.equal(told.length, 6);
    // Nothing starred among them: nothing written, nobody told.
    await forgetStars(space, [star({ id: '$nothing' })]);
    assert.equal(told.length, 6);
    await starMessage(space, star({ id: '$2' }), false);
    assert.deepEqual((await loadStars(space)).map((s) => s.id).sort(), ['$0', '$4']);
  } finally {
    off();
  }
});
