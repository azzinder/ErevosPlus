// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Messenger's store in Erevos+ (lib/messenger-store.ts) as Erevos starts afresh, as after the phone
// restarted: nothing is in memory, and the engine sends every chat again with its last message.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { randomBytes } from '../lib/crypto';
import { messengerNow, msgUnreadOf, setMessengerNative, startMessenger, stopMessenger } from '../lib/messenger-store';
import { setCurrentSpace } from '../lock/keys';
import { files } from './files-memory';

type Listener = (event: { service: string; json: string }) => void;

function fakeEngines() {
  let listener: Listener | null = null;
  const calls: string[] = [];
  const native = {
    available: () => true,
    setInFront: () => undefined,
    open: async () => null,
    close: async () => undefined,
    setCallTexts: () => undefined,
    call: async (_service: string, op: string) => {
      calls.push(op);
      return JSON.stringify({ ok: op === 'loggedIn' ? true : null });
    },
    addListener: (_event: string, l: Listener) => {
      listener = l;
      return { remove: () => void (listener = null) };
    },
  };
  const emit = (event: Record<string, unknown>) => listener?.({ service: 'messenger', json: JSON.stringify(event) });
  return { native, emit, calls };
}

const settle = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

test("after a fresh start, the chats the engine sends again with their last messages are not unread; what comes after is", async () => {
  const fake = fakeEngines();
  setMessengerNative(fake.native as never);
  // Messenger is the phone's: it runs with its first space, whose key opens its own settings.
  files.clear();
  setCurrentSpace(0, randomBytes(32));
  try {
    await startMessenger(['messenger']);
    await settle();
    assert.ok(fake.calls.includes('start'), `the engine was started (${fake.calls.join(', ')})`);
    const long = Date.now() - 400 * 24 * 3600 * 1000;
    const lately = Date.now() - 3600 * 1000;
    // As the engine connects: each chat as its account has it (read), then its last message, theirs.
    // The same comes for older chats later, as the list goes further back.
    for (const [key, ms] of [
      ['11', long],
      ['12', lately],
    ] as const) {
      fake.emit({ type: 'thread', thread: { key, name: `chat ${key}`, snippet: 'old', lastMs: ms, unread: false } });
      fake.emit({ type: 'message', message: { thread: key, id: `last-${key}`, sender: '7', text: 'old', ms, mine: false } });
    }
    // The chat moved to its last message only by the message itself (the engine's chat had an older time).
    fake.emit({ type: 'thread', thread: { key: '13', name: 'chat 13', snippet: '', lastMs: long - 1000, unread: false } });
    fake.emit({ type: 'message', message: { thread: '13', id: 'last-13', sender: '7', text: 'old', ms: long, mine: false } });
    // A message sent again when its attachments came.
    fake.emit({ type: 'message', message: { thread: '11', id: 'last-11', sender: '7', text: 'old', ms: long, mine: false, attachments: [{ kind: 'image', url: 'file:///a.jpg' }] } });
    await settle();
    assert.deepEqual([...msgUnreadOf('messenger')], [], 'nothing fetched again is unread');
    assert.deepEqual(
      Object.values(messengerNow('messenger').threads).map((t) => t.unread),
      [false, false, false],
    );
    assert.equal(messengerNow('messenger').messages['11']?.length, 1, 'its last message is there to read');

    // A chat its account says is unread (something came while Erevos was away) is unread.
    fake.emit({ type: 'thread', thread: { key: '14', name: 'chat 14', snippet: 'new', lastMs: lately, unread: true } });
    fake.emit({ type: 'message', message: { thread: '14', id: 'last-14', sender: '7', text: 'new', ms: lately, mine: false } });
    // A message that comes now makes its chat unread, and is counted.
    const now = Date.now();
    fake.emit({ type: 'message', message: { thread: '12', id: 'fresh', sender: '7', text: 'hi', ms: now, mine: false } });
    // Our own, from another device, does not.
    fake.emit({ type: 'message', message: { thread: '11', id: 'mine', sender: '1', text: 'me', ms: now, mine: true } });
    await settle();
    assert.deepEqual([...msgUnreadOf('messenger')].sort(), [
      ['messenger:12', 1],
      ['messenger:14', 1],
    ]);
    assert.equal(messengerNow('messenger').threads['12'].unread, true);
    assert.equal(messengerNow('messenger').threads['11'].unread, false);

    // Read on another device (Messenger's case, its app), in a chat its engine never had unread: its
    // engine sends only how far it was read (#78). Not up to what came: still unread.
    fake.emit({ type: 'read', thread: '12', upTo: now - 1 });
    await settle();
    assert.equal(messengerNow('messenger').threads['12'].unread, true);
    assert.deepEqual([...msgUnreadOf('messenger')].sort().map(([k]) => k), ['messenger:12', 'messenger:14']);
    // Up to it: read here too, and what comes again of it is not new.
    fake.emit({ type: 'read', thread: '12', upTo: now });
    fake.emit({ type: 'message', message: { thread: '12', id: 'fresh', sender: '7', text: 'hi', ms: now, mine: false } });
    await settle();
    assert.equal(messengerNow('messenger').threads['12'].unread, false);
    assert.deepEqual([...msgUnreadOf('messenger')], [['messenger:14', 1]]);
    // Something after it is unread again.
    fake.emit({ type: 'message', message: { thread: '12', id: 'later', sender: '7', text: 'and', ms: now + 5, mine: false } });
    await settle();
    assert.equal(messengerNow('messenger').threads['12'].unread, true);
  } finally {
    await stopMessenger();
    setMessengerNative(null);
    setCurrentSpace(null);
  }
});
