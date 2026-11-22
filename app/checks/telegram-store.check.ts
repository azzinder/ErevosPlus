// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The space's Telegram (lib/telegram-store.ts) against a pretend TDLib that answers as its JSON
// interface does: no TDLib before signing in, signing in, chats and messages, ErevosGram
// encryption between two spaces, and leaving. The encryption needs the core built to WebAssembly
// (checks/build-core.mjs); without it those checks are skipped, with a note.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { setCore, type Core } from '../lib/core';
import { randomBytes } from '../lib/crypto';
import { chatList } from '../lib/telegram';
import { isWire, SEALED } from '../lib/telegram-seal';
import {
  runTelegram,
  setTelegramNative,
  stopTelegram,
  telegramAccept,
  telegramAnswer,
  telegramAdsOn,
  telegramBegin,
  telegramCallNow,
  telegramCanCall,
  telegramCode,
  telegramHangUp,
  telegramInvite,
  telegramLeave,
  telegramNow,
  telegramOpenChat,
  telegramPhone,
  telegramSeals,
  telegramSend,
  telegramSetAds,
  telegramHomeFolders,
  telegramSetHomeFolder,
  telegramUnread,
  telegramSponsored,
  telegramShown,
  defaultRights,
  readRights,
  telegramAddMember,
  telegramReadChat,
  telegramSendPoll,
  telegramSetAdmin,
  type TelegramNativeLike,
} from '../lib/telegram-store';
import { setCurrentSpace } from '../lock/keys';
import { loadTelegram } from '../lock/telegram-data';
import { files } from './files-memory';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built);
if (coreReady) {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core);
} else {
  console.log('Skipping the Telegram encryption through the store: build the core first with node checks/build-core.mjs');
}

type Sent = { id: number; chatId: number; text: string; from: string };

/**
 * A pretend Telegram: each slot is a TDLib client, signed in with the code 12345. `world` is the
 * chat both spaces share, chat 700 for one, 800 for the other.
 */
function fakeTdlib() {
  const world: Sent[] = [];
  let next = 1;
  const opened = new Map<string, { chat: number; phone: string }>();
  // What TDLib's database remembers of each slot: signed in, to which chat.
  const signed = new Map<string, number>();
  const wiped: string[] = [];
  const log: string[] = [];
  // Every request, as TDLib got it.
  const requests: Record<string, any>[] = [];
  let listener: ((e: { slot: string; updates: string[] }) => void) | null = null;
  const emit = (slot: string, ...updates: unknown[]) => listener?.({ slot, updates: updates.map((u) => JSON.stringify(u)) });
  const auth = (slot: string, state: unknown) => emit(slot, { '@type': 'updateAuthorizationState', authorization_state: state });
  const message = (m: Sent, mine: boolean, chat: number) => ({
    '@type': 'message',
    id: m.id,
    chat_id: chat,
    is_outgoing: mine,
    date: 1700000000 + m.id,
    sender_id: { '@type': 'messageSenderUser', user_id: mine ? 1 : 2 },
    content: { '@type': 'messageText', text: { '@type': 'formattedText', text: m.text, entities: [] } },
  });
  const native: TelegramNativeLike = {
    async open(slot) {
      log.push(`open ${slot}`);
      const chat = signed.get(slot) ?? 0;
      opened.set(slot, { chat, phone: '' });
      setTimeout(() => {
        if (!chat) return auth(slot, { '@type': 'authorizationStateWaitPhoneNumber' });
        auth(slot, { '@type': 'authorizationStateReady' });
      }, 1);
    },
    async send(slot, text) {
      const r = JSON.parse(text) as Record<string, any>;
      requests.push(r);
      const me = opened.get(slot)!;
      switch (r['@type']) {
        case 'setAuthenticationPhoneNumber':
          me.phone = r.phone_number;
          setTimeout(() => auth(slot, { '@type': 'authorizationStateWaitCode', code_info: { phone_number: r.phone_number, type: { '@type': 'authenticationCodeTypeSms', length: 5 }, timeout: 60 } }), 1);
          return '{"@type":"ok"}';
        case 'checkAuthenticationCode': {
          if (r.code !== '12345') return '{"@type":"error","code":400,"message":"PHONE_CODE_INVALID"}';
          me.chat = me.phone === '+301' ? 700 : 800;
          signed.set(slot, me.chat);
          setTimeout(() => auth(slot, { '@type': 'authorizationStateReady' }), 1);
          return '{"@type":"ok"}';
        }
        case 'loadChats':
          // As TDLib: refused before signing in; the chats come as updates once asked for.
          if (!me.chat) return '{"@type":"error","code":401,"message":"Unauthorized"}';
          setTimeout(() => emit(slot, { '@type': 'updateNewChat', chat: { id: me.chat, title: 'Friend', type: { '@type': 'chatTypePrivate', user_id: 2 }, positions: [{ list: { '@type': 'chatListMain' }, order: '5' }] } }), 1);
          return '{"@type":"ok"}';
        case 'openChat':
          return '{"@type":"ok"}';
        case 'getChatHistory': {
          const list = world.filter((m) => !r.from_message_id || m.id < r.from_message_id).reverse().slice(0, r.limit);
          return JSON.stringify({ '@type': 'messages', messages: list.map((m) => message(m, m.from === slot, me.chat)) });
        }
        case 'sendMessage': {
          const m = { id: next++, chatId: 0, text: (r.input_message_content.text?.text ?? '') as string, from: slot };
          world.push(m);
          // Both clients hear of it.
          for (const [other, o] of opened) if (o.chat) emit(other, { '@type': 'updateNewMessage', message: message(m, other === slot, o.chat) });
          return JSON.stringify(message(m, true, me.chat));
        }
        case 'deleteMessages': {
          for (const id of r.message_ids as number[]) {
            const at = world.findIndex((m) => m.id === id);
            if (at >= 0) world.splice(at, 1);
          }
          for (const [other, o] of opened) if (o.chat) emit(other, { '@type': 'updateDeleteMessages', chat_id: o.chat, message_ids: r.message_ids, is_permanent: true });
          return '{"@type":"ok"}';
        }
        case 'addChatMember':
          // Someone whose privacy settings do not let them be added.
          return JSON.stringify({ '@type': 'failedToAddMembers', failed_to_add_members: r.user_id === 66 ? [{ '@type': 'failedToAddMember', user_id: 66 }] : [] });
        case 'logOut':
          log.push(`logOut ${slot}`);
          return '{"@type":"ok"}';
        default:
          return '{"@type":"ok"}';
      }
    },
    async close(slot) {
      log.push(`close ${slot}`);
      opened.delete(slot);
    },
    async wipe(slot) {
      wiped.push(slot);
      signed.delete(slot);
      opened.delete(slot);
    },
    addListener(_event, l) {
      listener = l as typeof listener;
      return { remove: () => void (listener = null) };
    },
  };
  return { native, world, log, wiped, opened, emit, requests };
}

const settle = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

async function signIn(phone: string) {
  await telegramBegin();
  await settle();
  assert.equal(telegramNow().state?.auth.kind, 'phone');
  await telegramPhone(phone);
  await settle();
  assert.deepEqual(telegramNow().state?.auth, { kind: 'code', phone, length: 5, via: 'sms', timeout: 60 });
  await assert.rejects(telegramCode('11111'), (e: Error & { telegram?: string }) => e.telegram === 'PHONE_CODE_INVALID' && e.message === 'That code is not right.');
  await telegramCode('12345');
  await settle();
  assert.equal(telegramNow().state?.auth.kind, 'ready');
}

test('a space that never signed in starts no TDLib; signing in starts it and is kept', async () => {
  files.clear();
  const fake = fakeTdlib();
  setTelegramNative(fake.native);
  const key = randomBytes(32);
  setCurrentSpace(3, key);
  try {
    runTelegram();
    await settle();
    assert.equal(telegramNow().loaded, true);
    assert.equal(telegramNow().account, false);
    assert.equal(fake.log.length, 0, 'no folder for a space without Telegram');
    await signIn('+301');
    assert.equal((await loadTelegram(3, key)).account, true);
    assert.deepEqual(chatList(telegramNow().state!).map((c) => c.id), [700]);
    // The space closes: TDLib closes; it opens again with it, without asking.
    stopTelegram();
    assert.equal(fake.log.at(-1)?.startsWith('close '), true);
    runTelegram();
    await settle();
    assert.equal(fake.log.filter((l) => l.startsWith('open ')).length, 2);
    // Leaving: logged out, the folder wiped, nothing kept.
    await telegramLeave(true);
    assert.equal(fake.log.some((l) => l.startsWith('logOut ')), true);
    assert.equal(fake.wiped.length, 1);
    const kept = await loadTelegram(3, key);
    assert.equal(kept.account, false);
    assert.equal(kept.seal.account, undefined);
  } finally {
    stopTelegram();
    setCurrentSpace(null);
    setTelegramNative(null);
  }
});

test('two spaces talk through Telegram with ErevosGram encryption', { skip: !coreReady }, async () => {
  files.clear();
  const fake = fakeTdlib();
  setTelegramNative(fake.native);
  const keyA = randomBytes(32);
  const keyB = randomBytes(32);
  // One store runs one open space: switch between the two as the two phones would each run theirs.
  const as = async (key: Uint8Array, space: number, job: () => Promise<void>) => {
    setCurrentSpace(space, key);
    runTelegram();
    await settle();
    await job();
    await settle();
  };
  try {
    await as(keyA, 1, () => signIn('+301'));
    // The other side runs beside it: a second "phone", started by hand on the same pretend world.
    stopTelegram();
    await as(keyB, 2, () => signIn('+302'));
    stopTelegram();

    await as(keyA, 1, async () => {
      await telegramOpenChat(700);
      await telegramSend(700, 'plain hello');
      await telegramInvite(700);
      assert.equal((await telegramSeals()).get(700)?.state, 'INVITED');
    });
    stopTelegram();
    await as(keyB, 2, async () => {
      await telegramOpenChat(800);
      await settle();
      assert.equal((await telegramSeals()).get(800)?.state, 'INVITE_IN');
      await telegramAccept(800);
      await settle();
      assert.equal(fake.world.some((m) => !isWire(m.text) && m.text.includes('EGI1:')), false);
      await telegramSend(800, 'κρυπτογραφημένα');
      const last = fake.world.at(-1)!;
      assert.equal(last.text.startsWith(SEALED), true, 'Telegram sees no words');
    });
    stopTelegram();
    await as(keyA, 1, async () => {
      await telegramOpenChat(700);
      await settle(80);
      const state = telegramNow().state!;
      const shown = (state.messages[700] ?? []).map((m) => {
        const s = telegramShown(700, m);
        return s ? (s.kind === 'text' ? s.text : `[${s.kind}]`) : m.text;
      });
      assert.deepEqual(shown, ['plain hello', '[hello]', 'κρυπτογραφημένα']);
      assert.equal((await telegramSeals()).get(700)?.state, 'ACTIVE');
    });
  } finally {
    stopTelegram();
    setCurrentSpace(null);
    setTelegramNative(null);
  }
});

test('a Telegram call rings in the space, is answered, and its sound starts, passes signaling and stops', async () => {
  files.clear();
  const fake = fakeTdlib();
  const sound: string[] = [];
  let onCall: ((e: { kind: string; data: string }) => void) | null = null;
  const asked: Record<string, unknown>[] = [];
  const send = fake.native.send;
  const native: TelegramNativeLike = {
    ...fake.native,
    async send(slot, text) {
      asked.push(JSON.parse(text) as Record<string, unknown>);
      return send(slot, text);
    },
    addListener(event: string, l: (e: never) => void) {
      if (event === 'onCall') {
        onCall = l as typeof onCall;
        return { remove: () => void (onCall = null) };
      }
      return fake.native.addListener('onUpdates', l as never);
    },
    callProtocol: async () => '{"@type":"callProtocol","library_versions":["11.0.0"]}',
    callStart: async (user, outgoing) => void sound.push(`start ${user} ${outgoing}`),
    callSignal: async (user, data) => void sound.push(`signal ${user} ${data}`),
    callMute: async (on) => void sound.push(`mute ${on}`),
    callStop: async () => void sound.push('stop'),
  } as TelegramNativeLike;
  setTelegramNative(native);
  const key = randomBytes(32);
  setCurrentSpace(4, key);
  try {
    assert.equal(telegramCanCall(), true);
    runTelegram();
    await settle();
    await signIn('+301');
    const slot = [...fake.opened.keys()][0];
    const say = (u: unknown) => fake.emit(slot, u);
    say({ '@type': 'updateCall', call: { id: 3, user_id: 2, is_outgoing: false, is_video: false, state: { '@type': 'callStatePending', is_created: true, is_received: true } } });
    await settle();
    assert.equal(telegramCallNow()?.stage, 'ringing');
    await telegramAnswer(3);
    assert.equal(asked.at(-1)?.['@type'], 'acceptCall');
    say({ '@type': 'updateNewCallSignalingData', call_id: 3, data: 'aGk=' });
    say({ '@type': 'updateCall', call: { id: 3, user_id: 2, is_outgoing: false, is_video: false, state: { '@type': 'callStateReady', protocol: {}, servers: [], encryption_key: 'AAAA', emojis: ['🐱'], allow_p2p: true } } });
    await settle();
    assert.deepEqual(sound, ['signal 2 aGk=', 'start 2 false']);
    onCall!({ kind: 'signal', data: 'eW8=' });
    await settle();
    assert.deepEqual(asked.at(-1), { '@type': 'sendCallSignalingData', call_id: 3, data: 'eW8=' });
    onCall!({ kind: 'state', data: 'CONNECTED' });
    assert.equal(telegramCallNow()?.stage, 'talking');
    await telegramHangUp(3);
    assert.equal(sound.at(-1), 'stop');
    assert.equal(asked.at(-1)?.['@type'], 'discardCall');
  } finally {
    stopTelegram();
    setCurrentSpace(null);
    setTelegramNative(null);
  }
});

test("Telegram's ads in channels: off unless turned on, kept with the space, never in a private chat", async () => {
  files.clear();
  const fake = fakeTdlib();
  setTelegramNative(fake.native);
  const key = randomBytes(32);
  setCurrentSpace(5, key);
  try {
    runTelegram();
    await settle();
    await signIn('+301');
    assert.equal(telegramAdsOn(), false);
    await telegramSetAds(true);
    assert.equal(telegramAdsOn(), true);
    assert.equal((await loadTelegram(5, key)).ads, true);
    assert.equal(await telegramSponsored(700), null);
    await telegramSetAds(false);
    assert.equal((await loadTelegram(5, key)).ads, undefined);
  } finally {
    stopTelegram();
    setCurrentSpace(null);
    setTelegramNative(null);
  }
});

test('Telegram folders chosen for home: kept with the space, and only their chats notify once one is chosen', async () => {
  files.clear();
  const fake = fakeTdlib();
  setTelegramNative(fake.native);
  const key = randomBytes(32);
  setCurrentSpace(6, key);
  try {
    runTelegram();
    await settle();
    await signIn('+301');
    const slot = [...fake.opened.keys()][0];
    const folder = (id: number) => ({ '@type': 'chatListFolder', chat_folder_id: id });
    fake.emit(
      slot,
      { '@type': 'updateChatFolders', chat_folders: [{ id: 2, title: 'Work' }, { id: 5, title: 'Family' }] },
      { '@type': 'updateNewChat', chat: { id: 31, title: 'w', type: { '@type': 'chatTypePrivate', user_id: 31 }, unread_count: 2, positions: [{ list: { '@type': 'chatListMain' }, order: '9' }, { list: folder(2), order: '9' }] } },
      { '@type': 'updateNewChat', chat: { id: 32, title: 'x', type: { '@type': 'chatTypePrivate', user_id: 32 }, unread_count: 3, positions: [{ list: { '@type': 'chatListMain' }, order: '8' }] } },
    );
    await settle();
    assert.deepEqual(telegramHomeFolders(), []);
    assert.equal(telegramUnread(), 5);
    await telegramSetHomeFolder(2, true);
    assert.deepEqual(telegramHomeFolders(), [2]);
    assert.deepEqual((await loadTelegram(6, key)).homeFolders, [2]);
    assert.equal(telegramUnread(), 2);
    // A chosen folder the account no longer has counts for nothing.
    await telegramSetHomeFolder(5, true);
    fake.emit(slot, { '@type': 'updateChatFolders', chat_folders: [{ id: 2, title: 'Work' }] });
    await settle();
    assert.deepEqual(telegramHomeFolders(), [2]);
    await telegramSetHomeFolder(2, false);
    await telegramSetHomeFolder(5, false);
    assert.equal((await loadTelegram(6, key)).homeFolders, undefined);
    assert.equal(telegramUnread(), 5);
  } finally {
    stopTelegram();
    setCurrentSpace(null);
    setTelegramNative(null);
  }
});

test('mark all as read, admins, adding members, quizzes: as TDLib takes them', async () => {
  files.clear();
  const fake = fakeTdlib();
  setTelegramNative(fake.native);
  const key = randomBytes(32);
  setCurrentSpace(7, key);
  try {
    runTelegram();
    await settle();
    await signIn('+301');
    const slot = [...fake.opened.keys()][0];
    const folder = (id: number) => ({ '@type': 'chatListFolder', chat_folder_id: id });
    const last = (chat: number, id: number) => ({ '@type': 'message', id, chat_id: chat, date: 1, sender_id: { '@type': 'messageSenderUser', user_id: 2 }, content: { '@type': 'messageText', text: { text: 'x' } } });
    fake.emit(
      slot,
      { '@type': 'updateChatFolders', chat_folders: [{ id: 2, title: 'Work' }] },
      { '@type': 'updateNewChat', chat: { id: 41, title: 'a', type: { '@type': 'chatTypePrivate', user_id: 41 }, unread_count: 2, last_message: last(41, 90), positions: [{ list: { '@type': 'chatListMain' }, order: '9' }, { list: folder(2), order: '9' }] } },
      { '@type': 'updateNewChat', chat: { id: 42, title: 'b', type: { '@type': 'chatTypePrivate', user_id: 42 }, unread_count: 0, is_marked_as_unread: true, positions: [{ list: { '@type': 'chatListMain' }, order: '8' }] } },
      { '@type': 'updateNewChat', chat: { id: 43, title: 'c', type: { '@type': 'chatTypePrivate', user_id: 43 }, unread_count: 0, positions: [{ list: { '@type': 'chatListMain' }, order: '7' }] } },
    );
    await settle();
    const asked = (type: string) => fake.requests.filter((r) => r['@type'] === type);

    // A chat read as Telegram's apps mark one read; one marked unread by hand is not any more.
    await telegramReadChat(41);
    await telegramReadChat(42);
    assert.deepEqual(asked('viewMessages').map((r) => [r.chat_id, r.message_ids, r.force_read]), [[41, [90], true]]);
    assert.deepEqual(asked('toggleChatIsMarkedAsUnread').map((r) => [r.chat_id, r.is_marked_as_unread]), [[42, false]]);
    assert.deepEqual(asked('readAllChatMentions').map((r) => r.chat_id), [41, 42]);
    await assert.rejects(telegramReadChat(999));

    // An admin with the rights chosen, and back to a member.
    const rights = { ...defaultRights(false), addAdmins: true };
    await telegramSetAdmin(41, 5, rights);
    await telegramSetAdmin(41, 5, null);
    const [up, down] = asked('setChatMemberStatus');
    assert.equal(up.status['@type'], 'chatMemberStatusAdministrator');
    assert.deepEqual([up.status.rights.can_promote_members, up.status.rights.can_restrict_members, up.status.rights.can_post_messages, up.status.rights.is_anonymous], [true, true, false, false]);
    assert.deepEqual(readRights(up.status.rights), rights);
    assert.equal(down.status['@type'], 'chatMemberStatusMember');

    await telegramAddMember(41, 5);
    await assert.rejects(telegramAddMember(41, 66), /privacy/);

    // A quiz: one right answer, one vote each, no vote taken back.
    await telegramSendPoll(41, 'Q?', ['a', 'b', 'c'], false, true, { correct: 2, explanation: 'because' });
    const quiz = asked('sendMessage').at(-1)!.input_message_content;
    assert.deepEqual([quiz.type['@type'], quiz.type.correct_option_ids, quiz.type.explanation.text, quiz.allows_multiple_answers, quiz.allows_revoting], ['inputPollTypeQuiz', [2], 'because', false, false]);
  } finally {
    stopTelegram();
    setCurrentSpace(null);
    setTelegramNative(null);
  }
});
