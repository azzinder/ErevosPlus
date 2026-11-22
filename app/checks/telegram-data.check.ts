// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A space's Telegram as kept (lock/telegram-data.ts): the opened messages are written last, in the
// order they were opened, so one more writes few pages however many there are.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { randomBytes, toHex } from '../lib/crypto';
import type { SealBody } from '../lib/telegram-seal';
import { FILE, loadTelegram, saveTelegram, type TelegramData } from '../lock/telegram-data';
import { PAGE_PREFIX, sealedFile } from '../lock/sealed-file';
import { blobs, files } from './files-memory';

const key64 = () => toHex(randomBytes(32));
const pages = () => new Map([...blobs.entries()].filter(([name]) => name.startsWith(PAGE_PREFIX)));

test('opened messages come back in their chats, and one more writes the first page and the last only', async () => {
  files.clear();
  blobs.clear();
  const key = randomBytes(32);
  const data: TelegramData = { account: true, seal: { account: 'acc', seen: ['s1'], chats: { '100': { state: 'ACTIVE', conv: 'c'.repeat(400), msgs: {} }, '-200': { state: 'ACTIVE', conv: 'd'.repeat(400), msgs: {} } } } };
  const text = (n: number): SealBody => ({ t: 'text', s: `μήνυμα ${n} ${'x'.repeat(150)}` });
  for (let n = 0; n < 600; n++) data.seal.chats[n % 2 ? '100' : '-200'].msgs![key64()] = text(n);
  data.seal.chats['100'].msgs![key64()] = '!';
  await saveTelegram(2, key, data);
  assert.ok(pages().size >= 8, `${pages().size}`);
  assert.deepEqual(await loadTelegram(2, key), data);
  // One more in the chat written first, and its keys moved on, as each message opened does.
  const before = pages();
  data.seal.chats['100'].msgs![key64()] = text(601);
  data.seal.chats['100'].conv = 'e'.repeat(400);
  await saveTelegram(2, key, data);
  const after = pages();
  const written = [...after.keys()].filter((name) => !before.has(name));
  assert.ok(written.length <= 3, `${written.length} pages written of ${after.size}`);
  assert.deepEqual(await loadTelegram(2, key), data);
  // Read anew, as after a start, the next one still writes few.
  const again = await loadTelegram(2, key);
  again.seal.chats['-200'].msgs![key64()] = text(602);
  const mid = pages();
  await saveTelegram(2, key, again);
  assert.ok([...pages().keys()].filter((name) => !mid.has(name)).length <= 3);
  assert.deepEqual(await loadTelegram(2, key), again);
});

test('a value kept before, with the messages inside their chats, is read as it is', async () => {
  files.clear();
  blobs.clear();
  const key = randomBytes(32);
  const k = key64();
  const old = { account: true, seal: { seen: [], chats: { '7': { state: 'ACTIVE', msgs: { [k]: { t: 'hello' } } } } } };
  const plain = sealedFile<unknown>({ name: FILE, empty: null, checked: (v) => v, block: 16 * 1024 });
  await plain.save('space', 1, key, old);
  const read = await loadTelegram(1, key);
  assert.deepEqual(read.seal.chats['7'].msgs, { [k]: { t: 'hello' } });
  await saveTelegram(1, key, read);
  assert.deepEqual((await plain.load('space', 1, key)) as unknown, { account: true, seal: { seen: [], chats: { '7': { state: 'ACTIVE' } } }, msgs: [['7', k, { t: 'hello' }]] });
  assert.deepEqual(await loadTelegram(1, key), read);
});
