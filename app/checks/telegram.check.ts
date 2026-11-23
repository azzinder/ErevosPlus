// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// What TDLib says, read into what the screens show (lib/telegram.ts), with updates as TDLib's JSON
// interface writes them.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { addHistory, applyUpdate, freshCounts, freshLeft, freshMessage, heardUnread, readLocally, chatList, setLater, nameOf, newTgState, phoneRequest, readMessage, readPoll, tdError, telegramKeys, textRequest } from '../lib/telegram';
import { inboxParts, showsIn, tabUnread, telegramInboxRows, telegramKeptRows, tgFolderOf } from '../lib/inbox';
import { statusLine, telegramLine, telegramStatusLine } from '../lib/telegram-view';
import { hideVideo, newVideoSlots, playsNow, showVideo, takeSlot } from '../lib/video-slots';
import { makeChatPin, opensChat } from '../lock/chat-pin';
import { entitiesOf, marksOf } from '../lib/telegram-marks';
import { inAllMessages } from '../lib/service-order';
import { checkedTelegram } from '../lock/telegram-data';
import { isTelegramLink, withMentions } from '../lib/telegram-links';
import { splitLinks } from '../lib/links';
import { contactContent, locationContent } from '../lib/telegram-shares';
import { cardOf } from '../lib/card-share';
import { EMPTY_FIELDS } from '../lib/contacts';

const text = (id: number, chatId: number, words: string, outgoing = false) => ({
  '@type': 'message',
  id,
  chat_id: chatId,
  is_outgoing: outgoing,
  date: 1700000000 + id,
  sender_id: { '@type': 'messageSenderUser', user_id: outgoing ? 1 : 2 },
  content: { '@type': 'messageText', text: { '@type': 'formattedText', text: words, entities: [] } },
});

test('a space has its own slot and database key, the same each time', () => {
  const a = telegramKeys(new Uint8Array(32).fill(1));
  const b = telegramKeys(new Uint8Array(32).fill(2));
  assert.match(a.slot, /^[0-9a-f]{32}$/);
  assert.equal(a.dbKey.length, 32);
  assert.notEqual(a.slot, b.slot);
  assert.deepEqual(telegramKeys(new Uint8Array(32).fill(1)), a);
  // The slot says nothing of the key it came from.
  assert.notEqual(a.slot, Buffer.from(a.dbKey).toString('hex').slice(0, 32));
});

test('signing in: phone, code, password, ready, and closed starts over', () => {
  const s = newTgState();
  const auth = (v: unknown) => applyUpdate(s, { '@type': 'updateAuthorizationState', authorization_state: v });
  auth({ '@type': 'authorizationStateWaitPhoneNumber' });
  assert.deepEqual(s.auth, { kind: 'phone' });
  auth({ '@type': 'authorizationStateWaitCode', code_info: { phone_number: '+30', type: { '@type': 'authenticationCodeTypeTelegramMessage', length: 5 }, timeout: 60 } });
  assert.deepEqual(s.auth, { kind: 'code', phone: '+30', length: 5, via: 'telegram', timeout: 60 });
  auth({ '@type': 'authorizationStateWaitPassword', password_hint: 'cat', has_recovery_email_address: true });
  assert.deepEqual(s.auth, { kind: 'password', hint: 'cat', recovery: true });
  auth({ '@type': 'authorizationStateWaitRegistration' });
  assert.equal(s.auth.kind, 'unsupported');
  auth({ '@type': 'authorizationStateReady' });
  assert.equal(s.auth.kind, 'ready');
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 5, title: 'x', type: { '@type': 'chatTypePrivate', user_id: 2 }, positions: [] } });
  auth({ '@type': 'authorizationStateClosed' });
  assert.equal(s.auth.kind, 'closed');
  assert.deepEqual(s.chats, {});
});

test('chats in Telegram order, with their last message, unread and archive', () => {
  const s = newTgState();
  const chat = (id: number, order: string, list = 'chatListMain', pinned = false) =>
    applyUpdate(s, {
      '@type': 'updateNewChat',
      chat: { id, title: `chat ${id}`, type: { '@type': 'chatTypePrivate', user_id: id }, unread_count: id, notification_settings: { mute_for: 0 }, positions: [{ '@type': 'chatPosition', list: { '@type': list }, order, is_pinned: pinned }] },
    });
  chat(1, '9221294780217032704');
  chat(2, '9221294780217032705', 'chatListMain', true);
  chat(3, '100', 'chatListArchive');
  assert.deepEqual(chatList(s).map((c) => c.id), [2, 1]);
  assert.equal(chatList(s)[0].pinned, true);
  assert.deepEqual(chatList(s, 'archive').map((c) => c.id), [3]);
  applyUpdate(s, { '@type': 'updateChatLastMessage', chat_id: 1, last_message: text(10, 1, 'hello'), positions: [{ '@type': 'chatPosition', list: { '@type': 'chatListMain' }, order: '9221294780217032706' }] });
  assert.deepEqual(chatList(s).map((c) => c.id), [1, 2]);
  assert.equal(s.chats[1].last?.text, 'hello');
  applyUpdate(s, { '@type': 'updateChatReadInbox', chat_id: 1, unread_count: 0, last_read_inbox_message_id: 10 });
  assert.equal(s.chats[1].unread, 0);
  // Out of the list: order 0.
  applyUpdate(s, { '@type': 'updateChatPosition', chat_id: 2, position: { '@type': 'chatPosition', list: { '@type': 'chatListMain' }, order: '0' } });
  assert.deepEqual(chatList(s).map((c) => c.id), [1]);
  applyUpdate(s, { '@type': 'updateChatNotificationSettings', chat_id: 1, notification_settings: { mute_for: 1000 } });
  assert.equal(s.chats[1].muted, true);
});

test("the account's Telegram folders and their chats", () => {
  const s = newTgState();
  applyUpdate(s, {
    '@type': 'updateChatFolders',
    chat_folders: [
      { '@type': 'chatFolderInfo', id: 2, name: { '@type': 'chatFolderName', text: { '@type': 'formattedText', text: 'Work', entities: [] }, animate_custom_emoji: false } },
      { '@type': 'chatFolderInfo', id: 5, title: 'Family' },
    ],
    main_chat_list_position: 0,
  });
  assert.deepEqual(s.folders, [{ id: 2, name: 'Work' }, { id: 5, name: 'Family' }]);
  const folder = (id: number) => ({ '@type': 'chatListFolder', chat_folder_id: id });
  applyUpdate(s, {
    '@type': 'updateNewChat',
    chat: { id: 1, title: 'a', type: { '@type': 'chatTypePrivate', user_id: 1 }, positions: [{ list: { '@type': 'chatListMain' }, order: '10' }, { list: folder(2), order: '10' }] },
  });
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 3, title: 'b', type: { '@type': 'chatTypePrivate', user_id: 3 }, positions: [{ list: folder(2), order: '20' }] } });
  assert.deepEqual(chatList(s, 2).map((c) => c.id), [3, 1]);
  assert.deepEqual(chatList(s, 5), []);
  assert.deepEqual(chatList(s).map((c) => c.id), [1]);
  // Out of the folder: order 0; into another one.
  applyUpdate(s, { '@type': 'updateChatPosition', chat_id: 3, position: { list: folder(2), order: '0' } });
  applyUpdate(s, { '@type': 'updateChatPosition', chat_id: 3, position: { list: folder(5), order: '7' } });
  assert.deepEqual(chatList(s, 2).map((c) => c.id), [1]);
  assert.deepEqual(chatList(s, 5).map((c) => c.id), [3]);
});

test('names of people and chats', () => {
  const s = newTgState();
  applyUpdate(s, { '@type': 'updateUser', user: { id: 2, first_name: 'Νίκος', last_name: 'Π', usernames: { active_usernames: ['nikos'] }, phone_number: '30690' } });
  applyUpdate(s, { '@type': 'updateUser', user: { id: 3, first_name: '', last_name: '', usernames: { active_usernames: ['only'] } } });
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: -100, title: 'Ομάδα', type: { '@type': 'chatTypeSupergroup', is_channel: false } } });
  assert.equal(nameOf(s, 2), 'Νίκος Π');
  assert.equal(nameOf(s, 3), '@only');
  assert.equal(nameOf(s, -100), 'Ομάδα');
  assert.equal(s.chats[-100].type, 'group');
});

test('messages: history, new, sent, failed, edited, deleted', () => {
  const s = newTgState();
  // Not loaded: a new message does not start a list on its own.
  applyUpdate(s, { '@type': 'updateNewMessage', message: text(1, 7, 'a') });
  assert.equal(7 in s.messages, false);
  const msgs = () => s.messages[7];
  assert.equal(addHistory(s, 7, { messages: [text(3, 7, 'c'), text(2, 7, 'b'), text(1, 7, 'a')] }), 3);
  assert.equal(addHistory(s, 7, { messages: [text(2, 7, 'b')] }), 0);
  assert.deepEqual(msgs().map((m) => m.text), ['a', 'b', 'c']);
  applyUpdate(s, { '@type': 'updateNewMessage', message: { ...text(99, 7, 'mine', true), sending_state: { '@type': 'messageSendingStatePending' } } });
  assert.equal(msgs()[3].sending, 'pending');
  applyUpdate(s, { '@type': 'updateMessageSendSucceeded', old_message_id: 99, message: text(4, 7, 'mine', true) });
  assert.deepEqual(msgs().map((m) => m.id), [1, 2, 3, 4]);
  assert.equal(msgs()[3].sending, undefined);
  applyUpdate(s, { '@type': 'updateMessageContent', chat_id: 7, message_id: 2, new_content: { '@type': 'messageText', text: { text: 'B!' } } });
  applyUpdate(s, { '@type': 'updateMessageEdited', chat_id: 7, message_id: 2, edit_date: 5 });
  assert.equal(msgs()[1].text, 'B!');
  assert.equal(msgs()[1].edited, 5);
  // The chat's row says its last message's new words, with the chat open or not.
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 7, title: 'Seven', type: { '@type': 'chatTypePrivate', user_id: 7 }, last_message: text(4, 7, 'mine', true) } });
  applyUpdate(s, { '@type': 'updateMessageContent', chat_id: 7, message_id: 4, new_content: { '@type': 'messageText', text: { text: 'mine, edited' } } });
  assert.equal(s.chats[7].last?.text, 'mine, edited');
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 8, title: 'Eight', type: { '@type': 'chatTypePrivate', user_id: 8 }, last_message: text(1, 8, 'theirs') } });
  assert.equal(applyUpdate(s, { '@type': 'updateMessageContent', chat_id: 8, message_id: 1, new_content: { '@type': 'messageText', text: { text: 'theirs, edited' } } }), true);
  assert.equal(s.chats[8].last?.text, 'theirs, edited');
  // One not loaded (a thread's): the row stays as it was, but the chat's count moves, so a thread
  // screen showing it asks again.
  const before = s.touched?.[8] ?? 0;
  assert.equal(applyUpdate(s, { '@type': 'updateMessageContent', chat_id: 8, message_id: 5, new_content: { '@type': 'messageText', text: { text: 'x' } } }), true);
  assert.equal(s.chats[8].last?.text, 'theirs, edited');
  assert.equal(s.touched?.[8], before + 1);
  // Not permanent: only out of TDLib's cache, the message is still there.
  applyUpdate(s, { '@type': 'updateDeleteMessages', chat_id: 7, message_ids: [1], is_permanent: false });
  assert.equal(msgs().length, 4);
  applyUpdate(s, { '@type': 'updateDeleteMessages', chat_id: 7, message_ids: [1, 3], is_permanent: true });
  assert.deepEqual(msgs().map((m) => m.id), [2, 4]);
});

test('media: photo, voice, document, sticker, with their files', () => {
  const s = newTgState();
  const f = (id: number, done = false) => ({ '@type': 'file', id, size: 100, local: { path: done ? `/x/${id}` : '', is_downloading_completed: done }, remote: {} });
  const photo = readMessage(s, { id: 1, chat_id: 7, content: { '@type': 'messagePhoto', caption: { text: 'look' }, photo: { sizes: [{ photo: f(10), width: 90, height: 60 }, { photo: f(11), width: 1280, height: 853 }] } } });
  assert.deepEqual({ kind: photo?.kind, text: photo?.text, file: photo?.file, thumb: photo?.thumb, width: photo?.width }, { kind: 'photo', text: 'look', file: 11, thumb: 10, width: 1280 });
  const voice = readMessage(s, { id: 2, chat_id: 7, content: { '@type': 'messageVoiceNote', voice_note: { voice: f(12, true), duration: 7 } } });
  assert.equal(voice?.kind, 'voice');
  assert.equal(s.files[12].path, '/x/12');
  const doc = readMessage(s, { id: 3, chat_id: 7, content: { '@type': 'messageDocument', document: { file_name: 'a.pdf', document: f(13) } } });
  assert.equal(doc?.fileName, 'a.pdf');
  const sticker = readMessage(s, { id: 4, chat_id: 7, content: { '@type': 'messageSticker', sticker: { emoji: '😀', sticker: f(14) } } });
  assert.equal(sticker?.text, '😀');
  applyUpdate(s, { '@type': 'updateFile', file: f(11, true) });
  assert.equal(s.files[11].done, true);
  const hidden = readMessage(s, { id: 5, chat_id: 7, content: { '@type': 'messagePhoto', has_spoiler: true, caption: { text: '' }, photo: { sizes: [{ photo: f(15), width: 90, height: 60 }] } } });
  assert.equal(hidden?.spoiler, true);
  assert.equal(photo?.spoiler, undefined);
  assert.equal(readMessage(s, { id: 5, chat_id: 7, content: { '@type': 'messageGame' } })?.kind, 'other');
  assert.equal(readMessage(s, { chat_id: 7 }), null);
});

test('requests as TDLib takes them, and its errors', () => {
  const phone = phoneRequest('+30690');
  assert.equal(phone['@type'], 'setAuthenticationPhoneNumber');
  assert.equal((phone.settings as Record<string, unknown>).allow_flash_call, false);
  assert.equal((phone.settings as Record<string, unknown>).allow_sms_retriever_api, false);
  const send = textRequest(7, 'hi', 3) as Record<string, any>;
  assert.equal(send.input_message_content.link_preview_options.is_disabled, true);
  assert.equal(send.reply_to.message_id, 3);
  assert.equal('reply_to' in textRequest(7, 'hi'), false);
  assert.equal(tdError({ '@type': 'error', code: 400, message: 'PHONE_NUMBER_INVALID' }), 'PHONE_NUMBER_INVALID');
  assert.equal(tdError({ '@type': 'ok' }), null);
});

test('when a Telegram user was last on, as the chat header says it', () => {
  const s = newTgState();
  applyUpdate(s, { '@type': 'updateUser', user: { id: 2, first_name: 'A', status: { '@type': 'userStatusOnline', expires: 2000 } } });
  assert.deepEqual(s.users[2].status, { kind: 'online', until: 2000 });
  assert.equal(statusLine(s.users[2].status, 1999_000), 'Online');
  // Online until a time gone: they left without saying so.
  assert.match(statusLine(s.users[2].status, 3_000_000), /^last seen/);
  applyUpdate(s, { '@type': 'updateUserStatus', user_id: 2, status: { '@type': 'userStatusOffline', was_online: 1000 } });
  assert.deepEqual(s.users[2].status, { kind: 'offline', was: 1000 });
  applyUpdate(s, { '@type': 'updateUserStatus', user_id: 2, status: { '@type': 'userStatusRecently' } });
  assert.equal(telegramStatusLine(s.users[2]), 'last seen recently');
  applyUpdate(s, { '@type': 'updateUserStatus', user_id: 2, status: { '@type': 'userStatusLastWeek' } });
  assert.equal(telegramStatusLine(s.users[2]), 'last seen within a week');
  applyUpdate(s, { '@type': 'updateUser', user: { id: 3, first_name: 'Bot', type: { '@type': 'userTypeBot' }, status: { '@type': 'userStatusEmpty' } } });
  assert.equal(telegramStatusLine(s.users[3]), 'bot');
  assert.equal(telegramStatusLine(undefined), '');
  // Nobody is told of a user Telegram never sent.
  assert.equal(applyUpdate(s, { '@type': 'updateUserStatus', user_id: 9, status: { '@type': 'userStatusRecently' } }), false);
});

test("a chat's marks: unread by hand, blocked, deleting itself, and its group's id", () => {
  const s = newTgState();
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: -1005, title: 'g', type: { '@type': 'chatTypeSupergroup', supergroup_id: 5, is_channel: false }, is_marked_as_unread: true, message_auto_delete_time: 86400 } });
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: -7, title: 'b', type: { '@type': 'chatTypeBasicGroup', basic_group_id: 7 } } });
  assert.deepEqual([s.chats[-1005].group, s.chats[-1005].markedUnread, s.chats[-1005].autoDelete], [{ id: 5, basic: false }, true, 86400]);
  assert.deepEqual(s.chats[-7].group, { id: 7, basic: true });
  // A secret chat's own id is not its chat's: closing it names that one.
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 900, title: 's', type: { '@type': 'chatTypeSecret', secret_chat_id: 31, user_id: 4 } } });
  assert.deepEqual([s.chats[900].type, s.chats[900].secretId, s.chats[900].userId], ['secret', 31, 4]);
  applyUpdate(s, { '@type': 'updateChatIsMarkedAsUnread', chat_id: -1005, is_marked_as_unread: false });
  applyUpdate(s, { '@type': 'updateChatMessageAutoDeleteTime', chat_id: -1005, message_auto_delete_time: 0 });
  applyUpdate(s, { '@type': 'updateChatBlockList', chat_id: -7, block_list: { '@type': 'blockListMain' } });
  assert.deepEqual([s.chats[-1005].markedUnread, s.chats[-1005].autoDelete, s.chats[-7].blocked], [undefined, undefined, true]);
});

test('Telegram folders chosen for home: their own tabs, and a chat only in a folder shows only there', () => {
  const s = newTgState();
  const folder = (id: number) => ({ '@type': 'chatListFolder', chat_folder_id: id });
  applyUpdate(s, { '@type': 'updateChatFolders', chat_folders: [{ id: 2, title: 'Work' }, { id: 5, title: 'Family' }] });
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 1, title: 'a', type: { '@type': 'chatTypePrivate', user_id: 1 }, unread_count: 2, positions: [{ list: { '@type': 'chatListMain' }, order: '10' }, { list: folder(2), order: '10' }] } });
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 3, title: 'b', type: { '@type': 'chatTypePrivate', user_id: 3 }, unread_count: 1, positions: [{ list: folder(2), order: '20' }] } });
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 4, title: 'c', type: { '@type': 'chatTypePrivate', user_id: 4 }, unread_count: 4, positions: [{ list: { '@type': 'chatListMain' }, order: '30' }] } });
  // No folder chosen: the main list alone, as before.
  assert.deepEqual(telegramInboxRows(s).map((r) => r.identity).sort(), ['telegram:1', 'telegram:4']);
  const rows = telegramInboxRows(s, undefined, 'main', [2]);
  const by = Object.fromEntries(rows.map((r) => [r.identity, r]));
  assert.deepEqual(by['telegram:1'].tgFolders, [2]);
  assert.equal(by['telegram:3'].tgFolderOnly, true);
  assert.deepEqual(rows.filter((r) => showsIn(r, 'tg:2')).map((r) => r.identity).sort(), ['telegram:1', 'telegram:3']);
  assert.deepEqual(rows.filter((r) => showsIn(r, 'telegram')).map((r) => r.identity).sort(), ['telegram:1', 'telegram:4']);
  assert.deepEqual(rows.filter((r) => showsIn(r, 'all')).map((r) => r.identity).sort(), ['telegram:1', 'telegram:3', 'telegram:4']);
  assert.equal(tabUnread(rows, 'tg:2'), 3);
  assert.equal(tabUnread(rows, 'tg:5'), 0);
  assert.deepEqual(inboxParts(rows, { telegram: true, tgFolders: [2, 5] }), ['telegram', 'tg:2', 'tg:5']);
  assert.equal(tgFolderOf('tg:5'), 5);
  assert.equal(tgFolderOf('telegram'), null);
});

test('a message with reactions, replies, views, a forward, a pin; a poll, a place and a contact', () => {
  const s = newTgState();
  addHistory(s, 9, { messages: [] });
  const base = { '@type': 'message', chat_id: 9, date: 1, sender_id: { '@type': 'messageSenderUser', user_id: 2 } };
  applyUpdate(s, {
    '@type': 'updateNewMessage',
    message: {
      ...base,
      id: 1,
      is_pinned: true,
      content: { '@type': 'messageText', text: { text: 'hi' } },
      forward_info: { origin: { '@type': 'messageOriginUser', sender_user_id: 5 } },
      interaction_info: { view_count: 40, reply_info: { reply_count: 3 }, reactions: { reactions: [{ type: { '@type': 'reactionTypeEmoji', emoji: '👍' }, total_count: 2, is_chosen: true }, { type: { '@type': 'reactionTypePaid' }, total_count: 9 }] } },
    },
  });
  const m = s.messages[9][0];
  assert.deepEqual([m.pinned, m.forward, m.views, m.replies, m.reactions], [true, { user: 5 }, 40, 3, [{ emoji: '👍', count: 2, mine: true }]]);
  applyUpdate(s, { '@type': 'updateMessageInteractionInfo', chat_id: 9, message_id: 1, interaction_info: { reactions: { reactions: [] } } });
  applyUpdate(s, { '@type': 'updateMessageIsPinned', chat_id: 9, message_id: 1, is_pinned: false });
  const after = s.messages[9][0];
  assert.deepEqual([after.reactions, after.replies, after.views, after.pinned, after.text], [undefined, undefined, undefined, undefined, 'hi']);

  const poll = { '@type': 'poll', id: '77', question: { text: 'Πού;' }, options: [{ text: { text: 'Α' }, voter_count: 1, vote_percentage: 100, is_chosen: true }, { text: { text: 'Β' }, voter_count: 0, vote_percentage: 0 }], total_voter_count: 1, is_anonymous: true, allows_multiple_answers: false, is_closed: false, type: { '@type': 'pollTypeRegular' } };
  applyUpdate(s, { '@type': 'updateNewMessage', message: { ...base, id: 2, content: { '@type': 'messagePoll', poll } } });
  assert.equal(s.messages[9][1].kind, 'poll');
  assert.deepEqual(s.messages[9][1].poll?.options.map((o) => [o.text, o.votes, o.chosen]), [['Α', 1, true], ['Β', 0, false]]);
  applyUpdate(s, { '@type': 'updatePoll', poll: { ...poll, is_closed: true, total_voter_count: 2 } });
  assert.deepEqual([s.messages[9][1].poll?.closed, s.messages[9][1].poll?.total], [true, 2]);

  applyUpdate(s, { '@type': 'updateNewMessage', message: { ...base, id: 3, content: { '@type': 'messageLocation', location: { latitude: 40.6, longitude: 22.9 } } } });
  applyUpdate(s, { '@type': 'updateNewMessage', message: { ...base, id: 4, content: { '@type': 'messageContact', contact: { first_name: 'Νίκος', last_name: '', phone_number: '3069', user_id: 8 } } } });
  applyUpdate(s, { '@type': 'updateNewMessage', message: { ...base, id: 5, content: { '@type': 'messageSticker', sticker: { emoji: '🙂', format: { '@type': 'stickerFormatTgs' }, sticker: { id: 3 } } } } });
  const [, , place, contact, sticker] = s.messages[9];
  assert.deepEqual(place.location, { lat: 40.6, lon: 22.9 });
  assert.deepEqual(contact.contact, { name: 'Νίκος', phone: '3069', userId: 8 });
  assert.equal(sticker.animated, true);
  assert.equal(telegramLine(place), '📍 Location');
  assert.equal(telegramLine(contact), '👤 Νίκος');
  assert.equal(telegramLine(s.messages[9][1]), '📊 Πού;');
  // A custom emoji reaction comes with its id; a quiz with its right answer and explanation, and no vote taken back.
  applyUpdate(s, { '@type': 'updateMessageInteractionInfo', chat_id: 9, message_id: 1, interaction_info: { reactions: { reactions: [{ type: { '@type': 'reactionTypeCustomEmoji', custom_emoji_id: '5368324170671202286' }, total_count: 4, is_chosen: false }] } } });
  assert.deepEqual(s.messages[9][0].reactions, [{ emoji: '', custom: '5368324170671202286', count: 4, mine: false }]);
  assert.equal(s.messages[9][1].poll?.revote, true);
  const quiz = readPoll({ ...poll, allows_revoting: false, type: { '@type': 'pollTypeQuiz', correct_option_ids: [1], explanation: { text: 'Γιατί' } } });
  assert.deepEqual([quiz.quiz, quiz.explanation, quiz.revote], [[1], 'Γιατί', false]);
});

test('moving stickers: the 4 newest play, two of one message by the one drawn later, a freed place goes on', () => {
  const slots = newVideoSlots();
  // Six of the same message (a sticker and its reactions' emoji): only 4 play, the later drawn.
  const same = [1, 2, 3, 4, 5, 6].map(() => takeSlot(slots));
  for (const seq of same) showVideo(slots, seq, 7);
  assert.deepEqual(same.map((seq) => playsNow(slots, seq)), [false, false, true, true, true, true]);
  // A newer message's one takes a place from the oldest still playing.
  const newer = takeSlot(slots);
  showVideo(slots, newer, 9);
  assert.equal(playsNow(slots, newer), true);
  assert.equal(playsNow(slots, same[2]), false);
  // One that goes gives its place on.
  hideVideo(slots, newer);
  hideVideo(slots, same[5]);
  assert.deepEqual(same.slice(0, 5).map((seq) => playsNow(slots, seq)), [false, true, true, true, true]);
  assert.equal(playsNow(slots, newer), false);
});

test('a chat locked with its PIN: its home row says nothing of its last message; the PIN is kept whole or not at all', async () => {
  const s = newTgState();
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 9, title: 'Nine', type: { '@type': 'chatTypePrivate', user_id: 9 }, unread_count: 2, last_message: { id: 3, chat_id: 9, date: 5, is_outgoing: false, content: { '@type': 'messageText', text: { text: 'secret words' } } }, positions: [{ list: { '@type': 'chatListMain' }, order: '10' }] } });
  assert.equal(telegramInboxRows(s)[0].last, 'secret words');
  const row = telegramInboxRows(s, undefined, 'main', [], new Set([9]))[0];
  assert.equal(row.last, '');
  assert.equal(row.locked, true);
  assert.equal(row.unread, 2);
  const pin = await makeChatPin('2468');
  const kept = checkedTelegram({ account: true, seal: {}, pins: { '9': pin, x: pin, '10': { salt: 1 } } });
  assert.deepEqual(Object.keys(kept.pins ?? {}), ['9']);
  assert.equal(await opensChat('2468', kept.pins!['9']), true);
  assert.equal(checkedTelegram({ account: true, seal: {} }).pins, undefined);
});

test('a chat kept in hidden chats: gone from the space\'s rows, shown among the hidden chats\' as the space\'s', () => {
  const s = newTgState();
  for (const id of [1, 2]) applyUpdate(s, { '@type': 'updateNewChat', chat: { id, title: `c${id}`, type: { '@type': 'chatTypePrivate', user_id: id }, unread_count: 1, positions: [{ list: { '@type': 'chatListMain' }, order: String(id) }] } });
  assert.deepEqual(telegramInboxRows(s, undefined, 'main', [], new Set(), new Set([2])).map((r) => r.identity), ['telegram:1']);
  const kept = telegramKeptRows(s, [2, 7]);
  assert.deepEqual(kept.map((r) => [r.identity, r.tgKept, r.name]), [['telegram-kept:2', true, 'c2']]);
  const data = checkedTelegram({ account: true, seal: {}, away: [2, 2, 'x', 3.5], fromSpace: [5] });
  assert.deepEqual(data.away, [2]);
  assert.deepEqual(data.fromSpace, [5]);
  assert.equal(checkedTelegram({ account: true, seal: {}, away: [] }).away, undefined);
});

test('bold, italic and the rest: Telegram\'s entities come as Erevos\'s marks, and the marks go as entities', () => {
  const e = (offset: number, length: number, type: string, url?: string) => ({ offset, length, type: { '@type': type, ...(url ? { url } : {}) } });
  assert.equal(marksOf('hello bold world', [e(6, 5, 'textEntityTypeBold')]), 'hello *bold* world');
  assert.equal(marksOf('a b c', [e(0, 5, 'textEntityTypeItalic'), e(2, 1, 'textEntityTypeBold')]), '_a *b* c_');
  assert.equal(marksOf('see here', [e(4, 4, 'textEntityTypeTextUrl', 'https://example.org')]), 'see here (https://example.org)');
  assert.equal(marksOf('a secret', [e(2, 6, 'textEntityTypeSpoiler'), e(0, 99, 'textEntityTypeBold')]), 'a ||secret||');
  const sent = entitiesOf('hi *bold* and _it_ ||sp|| `c`');
  assert.equal(sent.text, 'hi bold and it sp c');
  assert.deepEqual(sent.entities.map((x) => [x.offset, x.length, (x.type as { '@type': string })['@type']]), [
    [3, 4, 'textEntityTypeBold'],
    [12, 2, 'textEntityTypeItalic'],
    [15, 2, 'textEntityTypeSpoiler'],
    [18, 1, 'textEntityTypeCode'],
  ]);
  // A packet of ErevosGram's goes as it is: its letters are never read for marks.
  const packet = textRequest(1, 'EGM1:abc_def-_ghi_', undefined, true) as { input_message_content: { text: { text: string; entities: unknown[] } } };
  assert.deepEqual(packet.input_message_content.text, { '@type': 'formattedText', text: 'EGM1:abc_def-_ghi_', entities: [] });
});

test('starred Telegram messages are kept by chat, whole numbers only', () => {
  const data = checkedTelegram({ account: true, seal: {}, stars: { '5': [1, 1, 2, 'x'], y: [3], '6': [] } });
  assert.deepEqual(data.stars, { '5': [1, 2] });
  assert.equal(checkedTelegram({ account: true, seal: {}, stars: {} }).stars, undefined);
});

test('with Telegram hidden from home, the chats of its folders that still show stay under All messages', () => {
  assert.equal(inAllMessages({ sms: '', network: 'telegram' }, ['telegram']), false);
  assert.equal(inAllMessages({ sms: '', network: 'telegram', tgFolders: [2] }, ['telegram']), true);
  assert.equal(inAllMessages({ sms: '', network: 'telegram', tgFolders: [2] }, ['telegram', 'tg:2']), false);
  assert.equal(inAllMessages({ sms: '', network: 'telegram', tgFolders: [2] }, ['tg:2']), true);
  assert.equal(inAllMessages({ sms: '' }, ['telegram']), true);
});

test('a place and a contact card, as Telegram takes them', () => {
  assert.deepEqual(locationContent({ lat: 40.6, lon: 22.9, acc: 12 }), { '@type': 'inputMessageLocation', location: { '@type': 'location', latitude: 40.6, longitude: 22.9, horizontal_accuracy: 12 } });
  const card = cardOf({ ...EMPTY_FIELDS, name: 'Maria Papa', given: 'Maria', family: 'Papa', phones: [{ kind: 'mobile', label: '', value: '+30 690 000 0000' }] });
  assert.ok(card);
  const sent = contactContent(card!) as { contact: Record<string, unknown> };
  assert.equal(sent.contact.phone_number, '+30 690 000 0000');
  assert.equal(sent.contact.first_name, 'Maria');
  assert.equal(sent.contact.last_name, 'Papa');
  const mailOnly = cardOf({ ...EMPTY_FIELDS, name: 'Nikos', given: 'Nikos', emails: [{ kind: 'home', label: '', value: 'n@example.org' }] });
  assert.equal(contactContent(mailOnly!), null);
});

test('messages sent for later: kept apart until they go', () => {
  const s = newTgState();
  addHistory(s, 7, { messages: [] });
  const later = (id: number, at: number) => ({ id, chat_id: 7, is_outgoing: true, date: 1, content: { '@type': 'messageText', text: { text: 'hi' } }, scheduling_state: { '@type': 'messageSchedulingStateSendAtDate', send_date: at } });
  applyUpdate(s, { '@type': 'updateNewMessage', message: later(5, 2000) });
  applyUpdate(s, { '@type': 'updateNewMessage', message: later(6, 1000) });
  assert.equal(s.messages[7].length, 0);
  assert.deepEqual(s.later?.[7].map((m) => m.id), [6, 5]);
  applyUpdate(s, { '@type': 'updateDeleteMessages', chat_id: 7, message_ids: [6], is_permanent: false });
  assert.deepEqual(s.later?.[7].map((m) => m.id), [5]);
  applyUpdate(s, { '@type': 'updateMessageSendSucceeded', old_message_id: 5, message: { ...later(9, 0), scheduling_state: undefined } });
  assert.equal(s.later?.[7].length, 0);
  assert.deepEqual(s.messages[7].map((m) => m.id), [9]);
  setLater(s, 7, { messages: [later(11, 3000)] });
  assert.equal(s.later?.[7][0].later, 3000);
  const req = textRequest(7, 'hi', undefined, false, 3000) as { options: { scheduling_state: { send_date: number } } };
  assert.equal(req.options.scheduling_state.send_date, 3000);
  assert.equal('options' in textRequest(7, 'hi'), false);
});

test('link previews: read from Telegram, asked for only when this space makes them', () => {
  const s = newTgState();
  const m = readMessage(s, { id: 1, chat_id: 7, content: { '@type': 'messageText', text: { text: 'see https://example.org' }, link_preview: { url: 'https://example.org', site_name: 'Example', title: '', description: { text: 'A page' } } } });
  assert.deepEqual(m?.preview, { url: 'https://example.org', title: 'Example', text: 'A page' });
  const bad = readMessage(s, { id: 2, chat_id: 7, content: { '@type': 'messageText', text: { text: 'x' }, link_preview: { url: 'javascript:alert(1)', title: 'x' } } });
  assert.equal(bad?.preview, undefined);
  const off = textRequest(7, 'https://example.org') as { input_message_content: { link_preview_options: { is_disabled: boolean } } };
  assert.equal(off.input_message_content.link_preview_options.is_disabled, true);
  const on = textRequest(7, 'https://example.org', undefined, false, undefined, true) as typeof off;
  assert.equal(on.input_message_content.link_preview_options.is_disabled, false);
});

test('chats kept out of screenshots are kept as whole chat ids', () => {
  assert.deepEqual(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, shots: [5, 5, 'x', 1.5, -100] }).shots, [5, -100]);
  assert.equal(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, shots: [] }).shots, undefined);
});

test("a Telegram chat's own notifications are kept whole, by chat id", () => {
  const kept = checkedTelegram({ account: true, seal: { seen: [], chats: {} }, notify: { '5': { until: 100, sound: '' }, x: { until: 1 }, '6': { sound: 'javascript:x' } } });
  assert.deepEqual(kept.notify, { '5': { until: 100, sound: '' } });
});

test("a Telegram chat's draft: read from TDLib, changed by its update", () => {
  const s = newTgState();
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 7, title: 'A', type: { '@type': 'chatTypeBasicGroup' }, draft_message: { content: { '@type': 'draftMessageContentText', text: { text: 'half' } } } } });
  assert.equal(s.chats[7].draft, 'half');
  applyUpdate(s, { '@type': 'updateChatDraftMessage', chat_id: 7, draft_message: null });
  assert.equal(s.chats[7].draft, undefined);
});

test("Telegram's links: @names tappable as t.me, and t.me links known as Telegram's own", () => {
  const parts = withMentions(splitLinks('hi @some_one, mail a@b.org or see https://x.org/@nope'));
  assert.deepEqual(parts.filter((p) => p.url).map((p) => [p.text, p.url]), [['@some_one', 'https://t.me/some_one'], ['https://x.org/@nope', 'https://x.org/@nope']]);
  assert.equal(parts.map((p) => p.text).join(''), 'hi @some_one, mail a@b.org or see https://x.org/@nope');
  assert.equal(withMentions([{ text: '@abc' }]).some((p) => p.url), false);
  for (const yes of ['https://t.me/joinchat/AbC', 't.me/durov', 'https://telegram.me/x', 'tg://resolve?domain=x', 'https://t.me/c/123/45']) assert.equal(isTelegramLink(yes), true, yes);
  for (const no of ['https://example.org/t.me/x', 'https://nott.me/x', 'https://t.me']) assert.equal(isTelegramLink(no), false, no);
});

test('the Telegram account through Tor is kept only when turned on', () => {
  // The old switch kept `true`: it reads as Always. Off is the default and is not kept.
  assert.equal(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, tor: true }).tor, 'always');
  assert.equal(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, tor: 'always' }).tor, 'always');
  assert.equal(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, tor: 'space' }).tor, 'space');
  assert.equal(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, tor: 'yes' }).tor, undefined);
  assert.equal(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, tor: 'never' }).tor, undefined);
  assert.deepEqual(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, torChats: [5, 5, 'x', -100123] }).torChats, [5, -100123]);
  assert.equal(checkedTelegram({ account: true, seal: { seen: [], chats: {} }, torChats: [] }).torChats, undefined);
});

test('notices: a count tells only of messages that truly came, never of ones read or old', () => {
  const m = (pairs: [string, number][]) => new Map(pairs);
  // The first hearing is only counted.
  assert.deepEqual([...heardUnread(null, m([['telegram:1', 5]]), m([]))], [['telegram:1', 5]]);
  // An old chat loaded as the list scrolls, unarchived or unmuted, or TDLib catching up: no new message, no notice.
  const before = m([['telegram:1', 2]]);
  const caught = heardUnread(before, m([['telegram:1', 2], ['telegram:2', 7]]), m([]));
  assert.equal(caught.has('telegram:2'), false);
  assert.equal(caught.get('telegram:1'), 2);
  // A count that grows by more than what came tells only of what came.
  const one = heardUnread(before, m([['telegram:1', 9]]), m([['telegram:1', 1]]));
  assert.equal(one.get('telegram:1'), 3);
  // Then a stale count lowered by a read here, or on another device: heard as read.
  const read = heardUnread(one, m([]), m([]));
  assert.equal(read.size, 0);
  // A later new message in a chat that was held back tells of one, not of the old ones.
  const later = heardUnread(m([]), m([['telegram:2', 8]]), m([['telegram:2', 1]]));
  assert.equal(later.get('telegram:2'), 1);
  // What truly came: not ours, after the read mark, sent since TDLib started.
  assert.equal(freshMessage({ id: 10, outgoing: false, date: 2000 }, 9, 1_000_000), true);
  assert.equal(freshMessage({ id: 10, outgoing: true, date: 2000 }, 9, 1_000_000), false);
  assert.equal(freshMessage({ id: 9, outgoing: false, date: 2000 }, 9, 1_000_000), false);
  assert.equal(freshMessage({ id: 10, outgoing: false, date: 999 }, 9, 1_000_000), false);
});

test('notices: a read here counts at once, and a count that comes after its message is still told of', () => {
  const s = newTgState();
  applyUpdate(s, { '@type': 'updateNewChat', chat: { id: 7, title: 'A', type: { '@type': 'chatTypePrivate', user_id: 1 }, unread_count: 1, last_read_inbox_message_id: 4, last_read_outbox_message_id: 0, notification_settings: { mute_for: 0 }, positions: [] } });
  addHistory(s, 7, { messages: [{ id: 5, chat_id: 7, is_outgoing: false, date: 10, sender_id: { '@type': 'messageSenderUser', user_id: 1 }, content: { '@type': 'messageText', text: { text: 'hi' } } }] });
  // Read on the screen: at once nothing is unread, before TDLib says so, so leaving Erevos leaves no notice.
  assert.equal(readLocally(s, 7, 5), true);
  assert.equal(s.chats[7].unread, 0);
  assert.equal(s.chats[7].readInbox, 5);
  // Never back down, nor twice.
  assert.equal(readLocally(s, 7, 3), false);
  // A message that came in one batch, its count in the next: still told of once, and only once.
  const m = (pairs: [string, number][]) => new Map(pairs);
  const fresh = new Map([['telegram:7', [6]]]);
  const mark = () => 5;
  const first = heardUnread(m([]), m([]), freshCounts(fresh, mark));
  const waiting = freshLeft(fresh, mark, m([]), first);
  assert.deepEqual([...waiting], [['telegram:7', [6]]]);
  const then = heardUnread(first, m([['telegram:7', 1]]), freshCounts(waiting, mark));
  assert.equal(then.get('telegram:7'), 1);
  assert.equal(freshLeft(waiting, mark, first, then).size, 0);
  // One read before its count came (here or on another device) waits no more.
  assert.equal(freshLeft(fresh, () => 6, m([]), m([])).size, 0);
  assert.equal(freshCounts(fresh, () => 6).size, 0);
});

test('notices: a chat muted, hidden or out of the folders keeps nothing to tell of when it is heard again', () => {
  const m = (pairs: [string, number][]) => new Map(pairs);
  const mark = () => 0;
  // Three messages came while the chat was heard, their count not yet: then it is muted.
  const fresh = new Map([['telegram:7', [1, 2, 3]]]);
  const muted = (where: string) => where !== 'telegram:7';
  const kept = freshLeft(fresh, mark, m([]), m([]), muted);
  assert.equal(kept.size, 0);
  // Unmuted with three unread: none was told of, so none is now.
  const heard = heardUnread(m([]), m([['telegram:7', 3]]), freshCounts(kept, mark));
  assert.equal(heard.get('telegram:7') ?? 0, 0);
  // A chat still heard keeps its own while another forgets.
  const two = new Map([['telegram:7', [1]], ['telegram:8', [4]]]);
  assert.deepEqual([...freshLeft(two, mark, m([]), m([]), muted)], [['telegram:8', [4]]]);
  // Once heard again, a message that truly comes then is told of, once.
  const after = heardUnread(m([]), m([['telegram:7', 4]]), freshCounts(new Map([['telegram:7', [5]]]), mark));
  assert.equal(after.get('telegram:7'), 1);
});
