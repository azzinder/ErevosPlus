// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The encryption through Telegram chats (lib/telegram-seal.ts), in the ErevosGram app's words,
// with the real Rust core built to WebAssembly by checks/build-core.mjs. Skipped, with a note,
// when that build is missing. Two accounts talk through a pretend Telegram chat.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { setCore, type Core } from '../lib/core';
import { utf8Encode } from '../lib/crypto';
import { b64d, b64e, INVITE, isInvite, isWire, PIECE_BYTES, pieces, SEALED, TelegramSeal, wireKey, type SealData, type SealStore } from '../lib/telegram-seal';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const ready = existsSync(built);
if (ready) {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core);
} else {
  console.log('Skipping the Telegram encryption checks: build the core first with node checks/build-core.mjs');
}
const t = (name: string, fn: () => Promise<void>) => test(name, { skip: !ready }, fn);

type Msg = { id: number; text: string; from: 'a' | 'b'; replyTo?: number };

/** One private chat both sides see, with each side's chat id for it. */
function telegram() {
  const msgs: Msg[] = [];
  let next = 1;
  const side = (me: 'a' | 'b', chatId: number) => ({
    send: async (chat: number, text: string, replyTo?: number) => {
      assert.equal(chat, chatId);
      assert.ok(text.length <= 4096, 'fits one Telegram message');
      msgs.push({ id: next++, text, from: me, replyTo });
    },
    recent: async () => [...msgs].reverse().map((m) => ({ id: m.id, text: m.text })),
    remove: async (_chat: number, ids: number[]) => {
      for (const id of ids) {
        const at = msgs.findIndex((m) => m.id === id);
        if (at >= 0) msgs.splice(at, 1);
      }
    },
  });
  return { msgs, side };
}

function memory(): SealStore & { kept: () => SealData | null } {
  let kept: string | null = null;
  return {
    load: async () => (kept ? (JSON.parse(kept) as SealData) : null),
    save: async (data) => void (kept = JSON.stringify(data)),
    kept: () => (kept ? (JSON.parse(kept) as SealData) : null),
  };
}

const LINE = 'I use ErevosGram for end-to-end encryption.';

async function pair() {
  const chat = telegram();
  const aStore = memory();
  const bStore = memory();
  // The same chat has a different id on each side, as in Telegram.
  const a = new TelegramSeal(aStore, chat.side('a', 100), () => LINE);
  const b = new TelegramSeal(bStore, chat.side('b', 200), () => LINE);
  /** Shows each message the way its side draws it, as the chat screen does. */
  const read = async (who: 'a' | 'b') => {
    const seal = who === 'a' ? a : b;
    const out: (string | null)[] = [];
    for (const m of [...chat.msgs]) {
      const shown = await seal.shown(who === 'a' ? 100 : 200, m.id, m.text, m.from === who);
      out.push(shown ? (shown.kind === 'text' ? shown.text : `[${shown.kind}]`) : m.text);
    }
    return out;
  };
  return { chat, a, b, aStore, bStore, read };
}

test('wire texts: invitation and sealed message, as the ErevosGram app writes them', () => {
  const keys = 'A'.repeat(220);
  assert.equal(isInvite(`${LINE}\n\n${INVITE}${keys}`), true);
  assert.equal(isInvite(`${INVITE}${keys}`), true);
  assert.equal(isInvite(`${INVITE}short`), false);
  assert.equal(isInvite(`${INVITE}${keys} and more`), false);
  assert.equal(isWire(`${SEALED}abc`), true);
  assert.equal(isWire('hello'), false);
  // Base64url without padding, both ways.
  for (let n = 0; n < 6; n++) {
    const bytes = Uint8Array.from({ length: n }, (_, i) => 250 + i);
    assert.equal(/[=+/]/.test(b64e(bytes)), false);
    assert.deepEqual(b64d(b64e(bytes)), bytes);
  }
  // The hash of the trimmed text, as the app keys what it opened.
  assert.equal(wireKey(' x \n'), wireKey('x'));
  assert.equal(wireKey('x').length, 64);
});

test('long text goes in pieces below the padding bucket, never splitting a character', () => {
  const text = 'α'.repeat(1000) + '😀'.repeat(300);
  const all = pieces(text);
  assert.equal(all.join(''), text);
  for (const p of all) assert.ok(utf8Encode(p).length <= PIECE_BYTES);
  assert.deepEqual(pieces(''), []);
  assert.deepEqual(pieces('hi'), ['hi']);
});

t('invite, accept, talk both ways; the invitations go from the chat', async () => {
  const { chat, a, b, read } = await pair();
  await a.invite(100);
  assert.equal((await a.infos()).get(100)?.state, 'INVITED');
  assert.match(chat.msgs[0].text, new RegExp(`^${LINE}\\n\\nEGI1:`));
  assert.deepEqual(await read('b'), ['[invite-in]']);
  assert.equal((await b.infos()).get(200)?.state, 'INVITE_IN');
  assert.deepEqual(await read('a'), ['[invite-out]']);

  await b.accept(200);
  // B's own invitation-less hello is there; the invitation went for both.
  assert.equal(chat.msgs.some((m) => isInvite(m.text)), false);
  assert.deepEqual(await read('a'), ['[hello]']);
  assert.deepEqual(await read('b'), ['[hello]']);
  assert.equal((await a.infos()).get(100)?.state, 'ACTIVE');
  assert.equal((await b.infos()).get(200)?.state, 'ACTIVE');

  await a.send(100, 'Γεια σου');
  await b.send(200, 'hi back', chat.msgs[1].id);
  const long = 'λ'.repeat(1200);
  await a.send(100, long);
  for (const m of chat.msgs) assert.ok(m.text.startsWith(SEALED), 'nothing in the clear');
  assert.equal(chat.msgs[2].replyTo, chat.msgs[1].id);
  const bSees = await read('b');
  assert.deepEqual(bSees.slice(0, 3), ['[hello]', 'Γεια σου', 'hi back']);
  assert.equal(bSees.slice(3).join(''), long);
  // Drawn again, from what was kept: a packet opens only once.
  assert.deepEqual(await read('b'), bSees);
  assert.deepEqual((await read('a')).slice(0, 3), ['[hello]', 'Γεια σου', 'hi back']);

  const na = await a.safetyNumber(100);
  const nb = await b.safetyNumber(200);
  assert.ok(na && /^[\d ]+$/.test(na));
  assert.equal(na, nb);
});

t('a following message before its first stays closed, then opens', async () => {
  const { chat, a, b, read } = await pair();
  await a.invite(100);
  await read('b');
  await b.accept(200);
  await b.send(200, 'second');
  // A sees the second before the first (the first is not drawn yet).
  const second = chat.msgs[chat.msgs.length - 1];
  assert.deepEqual(await a.shown(100, second.id, second.text, false), { kind: 'unreadable' });
  assert.deepEqual(await read('a'), ['[hello]', 'second']);
});

t('a replayed first message and a forged packet do not open', async () => {
  const { chat, a, b, read } = await pair();
  await a.invite(100);
  await read('b');
  await b.accept(200);
  await read('a');
  const hello = chat.msgs[0];
  // The same text again is the same message, shown from what was kept.
  assert.deepEqual(await a.shown(100, 999, `${hello.text}\n`, false), { kind: 'hello' });
  // The same first message replayed into another chat does not start a conversation there.
  assert.deepEqual(await a.shown(300, 998, hello.text, false), { kind: 'unreadable' });
  assert.equal((await a.infos()).has(300), false);
  const forged = SEALED + b64e(Uint8Array.from({ length: 120 }, (_, i) => i));
  assert.deepEqual(await a.shown(100, 1000, forged, false), { kind: 'unreadable' });
  assert.deepEqual(await a.shown(100, 1000, forged, false), { kind: 'unreadable' });
});

t('both invite at once: one conversation wins on both phones', async () => {
  const { chat, a, b, read } = await pair();
  await a.invite(100);
  await b.invite(200);
  await read('a');
  await read('b');
  await a.accept(100);
  await b.accept(200);
  await read('a');
  await read('b');
  await a.send(100, 'from a');
  await b.send(200, 'from b');
  const aSees = await read('a');
  const bSees = await read('b');
  assert.equal(aSees[aSees.length - 1], 'from b');
  assert.equal(bSees[bSees.length - 2], 'from a');
  assert.equal(await a.safetyNumber(100), await b.safetyNumber(200));
});

t('new keys of the other side are told, and the safety number check starts over', async () => {
  const { chat, a, b, read } = await pair();
  await a.invite(100);
  await read('b');
  await b.accept(200);
  await read('a');
  await a.setVerified(100, true);
  // B comes back with a new phone: a new account, which invites again.
  const b2 = new TelegramSeal(memory(), { send: async (_c, text) => void chat.msgs.push({ id: 500, text, from: 'b' }), recent: async () => [], remove: async () => undefined }, () => LINE);
  await b2.invite(200);
  await read('a');
  const info = (await a.infos()).get(100);
  assert.equal(info?.state, 'INVITE_IN');
  assert.equal(info?.keysChanged, true);
  // Until A answers it, what A writes still goes sealed with the keys from before, never in the
  // clear: an invitation anyone put into the chat does not turn the encryption off.
  assert.equal(info?.sealed, true);
  await a.send(100, 'still sealed');
  assert.equal(chat.msgs[chat.msgs.length - 1].text.startsWith(SEALED), true);
  assert.equal(chat.msgs.some((m) => m.text.includes('still sealed')), false);
  // Declined, the chat is as it was.
  await a.decline(100);
  assert.deepEqual({ state: (await a.infos()).get(100)?.state, sealed: (await a.infos()).get(100)?.sealed }, { state: 'ACTIVE', sealed: true });
});

t('what the ErevosGram app kept comes in, and its chats go on', async () => {
  const { a, b, read, aStore } = await pair();
  await a.invite(100);
  await read('b');
  await b.accept(200);
  await read('a');
  const kept = aStore.kept();
  assert.ok(kept?.account);
  // A's state, moved to a new place (the merged app): it talks on with B.
  const chat2 = telegram();
  const moved = new TelegramSeal(memory(), chat2.side('a', 100), () => LINE);
  assert.deepEqual(await moved.adopt(kept!), { chats: 1, account: true });
  assert.equal((await moved.infos()).get(100)?.state, 'ACTIVE');
  await moved.send(100, 'from the new place');
  const m = chat2.msgs[0];
  assert.deepEqual(await b.shown(200, m.id, m.text, false), { kind: 'text', text: 'from the new place' });
  // An account made here first is kept, unless told to replace it.
  const fresh = new TelegramSeal(memory(), chat2.side('a', 100), () => LINE);
  await fresh.invite(100);
  assert.deepEqual(await fresh.adopt(kept!), { chats: 0, account: false });
  assert.deepEqual(await fresh.adopt(kept!, true), { chats: 1, account: true });
});
