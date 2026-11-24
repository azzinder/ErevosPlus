// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Mark all as read (lib/read-all.ts): which rows of a part of the list are read, and how each kind
// is: an Erevos contact's messages marked read in the history, what was read kept for the next look
// to tell them (a message request's not), a disappearing one's time started; and a chat that
// cannot be read now left as it is, the others read.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { randomBytes } from '../lib/crypto';
import type { ContactInfo } from '../lib/e2e';
import type { InboxRow, InboxSms } from '../lib/inbox';
import { onLookNow } from '../lib/look-now';
import { onReadElsewhere } from '../lib/notice-count';
import { kindOf, readAll, toRead, toReadIn, type ReadWays } from '../lib/read-all';
import { History, newTag } from '../lock/history';
import { blobs, files } from './files-memory';

const row = (identity: string, unread: number, more: Partial<InboxRow> = {}): InboxRow => ({
  identity,
  name: '',
  last: '',
  mine: false,
  mark: 0,
  at: 1,
  unread,
  timer: 0,
  imported: false,
  avatar: null,
  sms: '',
  lastSms: false,
  ...more,
});

const contact = (identity: string, more: Partial<ContactInfo> = {}): ContactInfo => ({
  identity,
  sender: '',
  name: '',
  ownName: '',
  said: '',
  timer: 0,
  shots: false,
  request: false,
  look: null,
  avatar: null,
  hide: false,
  locked: false,
  ...more,
});

// The space's chats as read-all uses them: the history as it is, and the contacts and what is kept for them to hear.
function chatsOf(history: History, contacts: ContactInfo[], phones: { identity: string; phone: string }[] = []) {
  const held: [string, string, string[]][] = [];
  const e2e = {
    contacts: () => contacts,
    phones: () => phones,
    hold: async (identity: string, kind: 'got' | 'read', tags: string[]) => {
      held.push([identity, kind, [...tags]]);
    },
  };
  return { chats: { e2e, history }, held };
}

// Ways that keep what each read, and fail for what `fails` names.
function waysOf(chats: Awaited<ReturnType<ReadWays['chats']>> | null, fails: string[] = []) {
  const read: string[] = [];
  const way = (prefix: string) => async (id: string) => {
    if (fails.includes(`${prefix}${id}`)) throw new Error('not now');
    read.push(`${prefix}${id}`);
  };
  const ways: ReadWays = {
    chats: async () => {
      if (!chats) throw new Error('no chats');
      return chats;
    },
    group: way('group:'),
    sms: way('sms:'),
    matrix: way('matrix:'),
    xmpp: way('xmpp:'),
    nostr: way('nostr:'),
  };
  return { ways, read };
}

const fresh = () => {
  files.clear();
  blobs.clear();
};

test('the rows of a part of the list that are read: those with messages not read, not an invitation', () => {
  const rows = [
    row('ann', 2),
    row('bob', 0),
    row('cat', 1, { locked: true }),
    row('dan', 1, { lastSms: true }),
    row('group:g1', 3, { muted: true }),
    row('group:g2', 0),
    row('sms:+301', 2, { sms: '+301', lastSms: true }),
    row('matrix:!r1:x.org', 4, { network: 'matrix' }),
    row('matrix:!r2:x.org', 1, { network: 'matrix', invited: true }),
    row('xmpp:eve@x.org', 1, { network: 'xmpp' }),
    row('xmpp:fay@x.org', 1, { network: 'xmpp', invited: true }),
    row('nostr:ab12', 5, { network: 'nostr' }),
  ];
  const ids = (list: { identity: string }[]) => list.map((r) => r.identity);
  assert.deepEqual(ids(toRead(rows)), ['ann', 'cat', 'dan', 'group:g1', 'sms:+301', 'matrix:!r1:x.org', 'xmpp:eve@x.org', 'nostr:ab12']);
  assert.deepEqual(ids(toReadIn(rows, 'all')), ids(toRead(rows)));
  // A chat locked with its PIN and a muted group are read too: reading shows nothing of them.
  assert.deepEqual(ids(toReadIn(rows, 'erevos')), ['ann', 'cat', 'dan', 'group:g1']);
  // A contact whose last message is an SMS shows among the SMS too.
  assert.deepEqual(ids(toReadIn(rows, 'sms')), ['dan', 'sms:+301']);
  assert.deepEqual(ids(toReadIn(rows, 'matrix')), ['matrix:!r1:x.org']);
  assert.deepEqual(ids(toReadIn(rows, 'xmpp')), ['xmpp:eve@x.org']);
  assert.deepEqual(ids(toReadIn(rows, 'nostr')), ['nostr:ab12']);
  // The public feed has no chats to read.
  assert.deepEqual(toReadIn(rows, 'public'), []);
  assert.deepEqual(rows.slice(4, 12).filter((r) => r.unread > 0 && !r.invited).map(kindOf), [
    { kind: 'group', id: 'g1' },
    { kind: 'sms', address: '+301' },
    { kind: 'matrix', room: '!r1:x.org' },
    { kind: 'xmpp', jid: 'eve@x.org' },
    { kind: 'nostr', key: 'ab12' },
  ]);
  assert.deepEqual(kindOf(row('ann', 1)), { kind: 'contact', identity: 'ann' });
});

test("an Erevos contact's messages are marked read and what was read is kept to tell them; a message request's are marked, and nothing is kept", async () => {
  fresh();
  const history = await History.open('space', 0, randomBytes(32));
  const now = Date.now();
  const tags = { a1: newTag(), a2: newTag(), mine: newTag(), later: newTag(), r1: newTag(), b1: newTag() };
  await history.add({ peer: 'contact:ann', text: 'one', mine: false, at: now - 3000, tag: tags.a1, mark: 0 });
  await history.add({ peer: 'contact:ann', text: 'mine', mine: true, at: now - 2500, tag: tags.mine, mark: 1 });
  await history.add({ peer: 'contact:ann', text: 'two', mine: false, at: now - 2000, tag: tags.a2, mark: 0 });
  // Theirs that waits for its time is not read before it shows (lib/later.ts).
  await history.add({ peer: 'contact:ann', text: 'later', mine: false, at: now + 3600_000, tag: tags.later, mark: 0, quiet: true });
  await history.add({ peer: 'contact:req', text: 'hello?', mine: false, at: now - 1000, tag: tags.r1, mark: 0 });
  // Another chat, not asked for, stays not read.
  await history.add({ peer: 'contact:bob', text: 'hi', mine: false, at: now - 1000, tag: tags.b1, mark: 0 });
  const { chats, held } = chatsOf(history, [contact('ann'), contact('req', { request: true }), contact('bob')]);
  const { ways } = waysOf(chats);
  let looks = 0;
  const stopLook = onLookNow(() => looks++);
  const told: string[][] = [];
  const stopRead = onReadElsewhere((where) => told.push(where));
  let ownRead = 0;
  try {
    const done = await readAll([row('ann', 2), row('req', 1)], { ways, now, onOwnRead: () => ownRead++ });
    assert.deepEqual(done, { read: 2, failed: 0 });
  } finally {
    stopLook();
    stopRead();
  }
  const markOf = (tag: string) => history.messages().find((m) => m.tag === tag)?.mark;
  assert.equal(markOf(tags.a1), 2);
  assert.equal(markOf(tags.a2), 2);
  assert.equal(markOf(tags.mine), 1);
  assert.equal(markOf(tags.later), 0);
  assert.equal(markOf(tags.r1), 2);
  assert.equal(markOf(tags.b1), 0);
  // Kept with the contact for the next look's message to say (E2E.hold, E2E.readDue); a request hears nothing.
  assert.deepEqual(held, [['ann', 'read', [tags.a1, tags.a2]]]);
  // The next look is asked for at once, and the messages notice counts these chats no more.
  assert.equal(looks, 1);
  assert.deepEqual(told, [['chat:ann', 'chat:req']]);
  assert.equal(ownRead, 1);
  // Read again, nothing is left to mark, nor to tell.
  held.length = 0;
  await readAll([row('ann', 2)], { ways, now });
  assert.deepEqual(held, []);
});

test('a disappearing message starts its time once read, as in its chat', async () => {
  fresh();
  const history = await History.open('space', 0, randomBytes(32));
  const now = Date.now();
  const tag = newTag();
  const stays = newTag();
  await history.add({ peer: 'contact:ann', text: 'gone soon', mine: false, at: now - 1000, tag, mark: 0, lasts: 30, until: 0 });
  await history.add({ peer: 'contact:ann', text: 'stays', mine: false, at: now - 500, tag: stays, mark: 0 });
  const { chats, held } = chatsOf(history, [contact('ann', { hide: true })]);
  await readAll([row('ann', 2)], { ways: waysOf(chats).ways, now });
  const fades = history.messages().find((m) => m.tag === tag)!;
  assert.equal(fades.mark, 2);
  assert.equal(fades.until, now + 30_000);
  assert.equal(fades.lasts, 0);
  const kept = history.messages().find((m) => m.tag === stays)!;
  assert.equal(kept.mark, 2);
  assert.ok(!kept.until);
  // A chat that appears offline keeps it too, to say with what it next writes (E2E.hold).
  assert.deepEqual(held, [['ann', 'read', [tag, stays]]]);
});

test("each kind is read its own way, a contact's number's SMS with it; one that cannot be read now is left, the others are read", async () => {
  fresh();
  const history = await History.open('space', 0, randomBytes(32));
  const now = Date.now();
  await history.add({ peer: 'contact:ann', text: 'hi', mine: false, at: now - 1000, tag: newTag(), mark: 0 });
  const { chats } = chatsOf(history, [contact('ann')], [{ identity: 'ann', phone: '+30 690 000 0001' }]);
  const { ways, read } = waysOf(chats, ['matrix:!bad:x.org', 'group:g2']);
  const sms: InboxSms[] = [
    { address: '+306900000001', text: 'sms', at: now, mine: false, unread: 1 },
    { address: '+306900000009', text: 'other', at: now, mine: false, unread: 2 },
    { address: '+306900000008', text: 'read', at: now, mine: false, unread: 0 },
  ];
  const groupsTold: string[][] = [];
  const stop = onReadElsewhere((where) => groupsTold.push(where));
  let done;
  try {
    done = await readAll(
      [
        row('ann', 2),
        // Gone from the contacts meanwhile: left as it is.
        row('gone', 1),
        row('group:g1', 1),
        row('group:g2', 1),
        row('sms:+306900000009', 2, { sms: '+306900000009', lastSms: true }),
        row('matrix:!bad:x.org', 1, { network: 'matrix' }),
        row('matrix:!ok:x.org', 1, { network: 'matrix' }),
        row('matrix:!inv:x.org', 1, { network: 'matrix', invited: true }),
        row('xmpp:eve@x.org', 1, { network: 'xmpp' }),
        row('nostr:ab12', 1, { network: 'nostr' }),
      ],
      { ways, sms, now },
    );
  } finally {
    stop();
  }
  // The invitation is no chat to read: neither read nor failed.
  assert.deepEqual(done, { read: 6, failed: 3 });
  assert.deepEqual([...read].sort(), ['group:g1', 'matrix:!ok:x.org', 'nostr:ab12', 'sms:+306900000001', 'sms:+306900000009', 'xmpp:eve@x.org']);
  // The messages notice is told of the space's own chats and groups read; the stores tell of theirs.
  assert.deepEqual(groupsTold.flat().sort(), ['chat:ann', 'group:g1']);
  // With the space's chats not open, its contacts are left as they are; the rest is read.
  const none = waysOf(null);
  assert.deepEqual(await readAll([row('ann', 1), row('nostr:ab12', 1, { network: 'nostr' })], { ways: none.ways, now }), { read: 1, failed: 1 });
  assert.deepEqual(none.read, ['nostr:ab12']);
});

test("Messenger's chats read with the others leave a Read all with the engine, for the older chats Meta sends later; Signal's do not", async () => {
  fresh();
  const all: string[] = [];
  const { ways, read } = waysOf(null);
  const msgWays: ReadWays = {
    ...ways,
    msg: async (service, key) => {
      read.push(`${service}:${key}`);
    },
    messengerAll: async () => {
      all.push('messenger');
    },
  };
  await readAll([row('signal:1', 1, { network: 'signal' })], { ways: msgWays });
  assert.deepEqual(all, []);
  assert.deepEqual(await readAll([row('messenger:5', 1, { network: 'messenger' })], { ways: msgWays }), { read: 1, failed: 0 });
  assert.deepEqual(all, ['messenger']);
  assert.deepEqual(read, ['signal:1', 'messenger:5']);
});
