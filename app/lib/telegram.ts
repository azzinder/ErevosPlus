// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';

import { toHex, utf8Encode } from './crypto';
import { t } from './i18n';
import { entitiesOf, marksOf } from './telegram-marks';

// Telegram in the ErevosGram build (modules/erevos-telegram, docs/erevosgram.md): what TDLib says,
// read into what the screens show. TDLib keeps the account, the chats and the messages in its own
// database on the phone, encrypted with a key from the space (`telegramKeys`); this keeps only what
// is on screen and what the lists need, in memory, and is built again from TDLib's updates each
// time the space opens. Self-contained, so the checks run it under plain Node.

/** A space's slot (its folder's name on the phone) and the key of its TDLib database, both from the space's key. */
export function telegramKeys(spaceKey: Uint8Array): { slot: string; dbKey: Uint8Array } {
  const slot = toHex(hkdf(sha256, spaceKey, undefined, utf8Encode('erevos telegram slot'), 16));
  const dbKey = hkdf(sha256, spaceKey, undefined, utf8Encode('erevos telegram database'), 32);
  return { slot, dbKey };
}

/** Where signing in stands. */
export type TgAuth =
  | { kind: 'starting' }
  | { kind: 'phone' }
  | { kind: 'code'; phone: string; length: number; via: 'telegram' | 'sms' | 'call' | 'other'; timeout: number }
  | { kind: 'password'; hint: string; recovery: boolean }
  | { kind: 'other-device'; link: string }
  | { kind: 'unsupported'; what: string }
  | { kind: 'ready' }
  | { kind: 'closing' }
  | { kind: 'closed' };

export type TgUser = { id: number; first: string; last: string; username: string; phone: string; photo?: number; deleted?: boolean; bot?: boolean; premium?: boolean; verified?: boolean; status?: TgStatus };

/**
 * When someone was last on Telegram, as much as they let it be seen: online now (until when, in
 * seconds), offline since a time, or only roughly (recently, within a week, a month, long ago).
 */
export type TgStatus =
  | { kind: 'online'; until: number }
  | { kind: 'offline'; was: number }
  | { kind: 'recently' | 'week' | 'month' | 'long' };

/** A user's TDLib userStatus as a TgStatus; undefined for userStatusEmpty (bots, deleted). */
export function readStatus(v: unknown): TgStatus | undefined {
  const st = obj(v);
  switch (type(st)) {
    case 'userStatusOnline':
      return { kind: 'online', until: num(st.expires) };
    case 'userStatusOffline':
      return { kind: 'offline', was: num(st.was_online) };
    case 'userStatusRecently':
      return { kind: 'recently' };
    case 'userStatusLastWeek':
      return { kind: 'week' };
    case 'userStatusLastMonth':
      return { kind: 'month' };
    default:
      return undefined;
  }
}

export type TgKind = 'text' | 'photo' | 'video' | 'voice' | 'audio' | 'document' | 'sticker' | 'animation' | 'video-note' | 'call' | 'poll' | 'location' | 'contact' | 'service' | 'other';

/** A reaction on a message: its emoji (or a custom emoji's id), how many gave it, and whether we did. Paid stars are left out. */
export type TgReaction = { emoji: string; count: number; mine: boolean; custom?: string };

/** A poll as a message has it, with the votes as Telegram tells them. */
export type TgPoll = {
  id: string;
  question: string;
  /** Its options, in order: what each says, how many voted for it, its share in percent, and whether we chose it. */
  options: { text: string; votes: number; percent: number; chosen: boolean }[];
  total: number;
  closed: boolean;
  anonymous: boolean;
  multiple: boolean;
  /** A quiz's right answers (by option index), once we may see them. */
  quiz?: number[];
  /** What a quiz says about its answer, once answered. */
  explanation?: string;
  /** Whether a vote can be taken back (never in a quiz). */
  revote: boolean;
};

/** Where a forwarded message first came from: a person, a chat or channel, or a name only (a hidden account). */
export type TgForward = { user?: number; chat?: number; name?: string };

export type TgMessage = {
  id: number;
  chatId: number;
  outgoing: boolean;
  /** Seconds, as Telegram counts. */
  date: number;
  edited: number;
  /** A user (positive) or a chat (as TDLib names it) that sent it. */
  sender: number;
  kind: TgKind;
  text: string;
  /** The file to show or play, TDLib's id for it. */
  file?: number;
  fileName?: string;
  /** A small picture to show before the file comes. */
  thumb?: number;
  duration?: number;
  width?: number;
  height?: number;
  replyTo?: number;
  sending?: 'pending' | 'failed';
  /** A sticker that moves (Lottie or video): its still picture shows instead. */
  animated?: true;
  /** A photo or video sent hidden: it shows blurred until tapped. */
  spoiler?: true;
  /** The preview Telegram made of the first link in its words: only its words, no picture. */
  preview?: { url: string; title: string; text: string };
  /** When a message sent for later goes (seconds), while Telegram keeps it: it is not in the chat yet. */
  later?: number;
  reactions?: TgReaction[];
  /** How many answered it in its thread (a group's replies, a channel post's comments). */
  replies?: number;
  /** How many saw it, for a channel's post. */
  views?: number;
  forward?: TgForward;
  pinned?: true;
  poll?: TgPoll;
  location?: { lat: number; lon: number };
  contact?: { name: string; phone: string; userId?: number };
};

export type TgChatType = 'private' | 'secret' | 'group' | 'channel';

export type TgChat = {
  id: number;
  title: string;
  type: TgChatType;
  /** The other person, in a private or secret chat. */
  userId?: number;
  /** A secret chat's own id at Telegram, which is not its chat's: what closing it names. */
  secretId?: number;
  /** A group's or a channel's own id at Telegram: a basic group's, or a supergroup's (channels are these too). */
  group?: { id: number; basic: boolean };
  photo?: number;
  last?: TgMessage;
  unread: number;
  /** Their order in the main list and in the archive, as TDLib gives it (bigger first); absent when not there. */
  main?: string;
  archive?: string;
  /** Its order in each of the account's Telegram folders it is in, by folder id. */
  folders?: Record<number, string>;
  pinned?: boolean;
  /** Marked as unread by hand (in Telegram or here), with no message unread. */
  markedUnread?: boolean;
  /** The other person, or this chat, is blocked by us. */
  blocked?: boolean;
  /** Seconds before a new message deletes itself, 0 for never. */
  autoDelete?: number;
  muted: boolean;
  /** What was typed and left in it, kept by Telegram on all the account's devices. */
  draft?: string;
  /** The last of ours they read, and the last they wrote that we read. */
  readOutbox: number;
  readInbox: number;
};

export type TgFile = { id: number; size: number; path: string; done: boolean; downloading: boolean; uploaded: boolean };

export type TgState = {
  auth: TgAuth;
  connection: 'waiting-network' | 'connecting-proxy' | 'connecting' | 'updating' | 'ready';
  me: number;
  users: Record<number, TgUser>;
  chats: Record<number, TgChat>;
  /** The messages of the chats shown or asked for, oldest first. */
  messages: Record<number, TgMessage[]>;
  /** How many changes each chat's messages have had (applyUpdate), loaded or not. */
  touched?: Record<number, number>;
  files: Record<number, TgFile>;
  /** Chats where someone types now: chat → user → until (ms). */
  typing: Record<number, Record<number, number>>;
  /** The account's Telegram folders, in its order. */
  folders: TgFolder[];
  /** Messages sent for later that Telegram keeps until their time, of the chats asked for, soonest first. */
  later?: Record<number, TgMessage[]>;
};

/** One of the folders the account made in Telegram (its chat folders). */
export type TgFolder = { id: number; name: string };

export const newTgState = (): TgState => ({ auth: { kind: 'starting' }, connection: 'connecting', me: 0, users: {}, chats: {}, messages: {}, files: {}, typing: {}, folders: [] });

type Json = Record<string, unknown>;
const obj = (v: unknown): Json => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : {});
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const type = (v: unknown) => str(obj(v)['@type']);

function file(v: unknown): TgFile | null {
  const f = obj(v);
  if (!f.id) return null;
  const local = obj(f.local);
  const remote = obj(f.remote);
  return {
    id: num(f.id),
    size: num(f.size) || num(f.expected_size),
    path: str(local.path),
    done: local.is_downloading_completed === true,
    downloading: local.is_downloading_active === true,
    uploaded: remote.is_uploading_completed === true,
  };
}

/** Keeps every file a message or a picture names, so the screens find its path once it is there. */
function keepFile(state: TgState, v: unknown): number | undefined {
  const f = file(v);
  if (!f) return undefined;
  state.files[f.id] = f;
  return f.id;
}

// A photo, video or GIF sent hidden, blurred until tapped.
function previewOf(v: unknown): { preview?: { url: string; title: string; text: string } } {
  const p = obj(v);
  const url = str(p.url);
  if (!/^https?:\/\//i.test(url)) return {};
  const title = str(p.title) || str(p.site_name);
  const text = str(obj(p.description).text).slice(0, 300);
  return title || text ? { preview: { url, title, text } } : {};
}

function draftOf(v: unknown): { draft?: string } {
  const content = obj(obj(v).content);
  const text = type(content) === 'draftMessageContentText' ? formatted(content.text) : '';
  return text.trim() ? { draft: text } : {};
}

const spoilerOf = (c: Json): { spoiler?: true } => (c.has_spoiler === true ? { spoiler: true } : {});

// Telegram's words with their bold, italic and the rest as Erevos's marks (lib/telegram-marks.ts).
const formatted = (v: unknown) => marksOf(str(obj(v).text), obj(v).entities);

/** A message's content as the screens show it. */
function content(state: TgState, c: Json): Pick<TgMessage, 'kind' | 'text' | 'file' | 'fileName' | 'thumb' | 'duration' | 'width' | 'height' | 'animated' | 'spoiler' | 'poll' | 'location' | 'contact'> {
  const thumbOf = (t: unknown) => keepFile(state, obj(t).file);
  switch (type(c)) {
    case 'messageText':
      return { kind: 'text', text: formatted(c.text), ...previewOf(c.link_preview) };
    case 'messagePhoto': {
      const sizes = (obj(c.photo).sizes as unknown[] | undefined) ?? [];
      const big = obj(sizes[sizes.length - 1]);
      const small = obj(sizes[0]);
      return { kind: 'photo', text: formatted(c.caption), file: keepFile(state, big.photo), thumb: sizes.length > 1 ? keepFile(state, small.photo) : undefined, width: num(big.width), height: num(big.height), ...spoilerOf(c) };
    }
    case 'messageVideo': {
      const v = obj(c.video);
      return { kind: 'video', text: formatted(c.caption), file: keepFile(state, v.video), fileName: str(v.file_name), thumb: thumbOf(v.thumbnail), duration: num(v.duration), width: num(v.width), height: num(v.height), ...spoilerOf(c) };
    }
    case 'messageAnimation': {
      const v = obj(c.animation);
      return { kind: 'animation', text: formatted(c.caption), file: keepFile(state, v.animation), thumb: thumbOf(v.thumbnail), width: num(v.width), height: num(v.height), ...spoilerOf(c) };
    }
    case 'messageVoiceNote': {
      const v = obj(c.voice_note);
      return { kind: 'voice', text: formatted(c.caption), file: keepFile(state, v.voice), duration: num(v.duration) };
    }
    case 'messageVideoNote': {
      const v = obj(c.video_note);
      return { kind: 'video-note', text: '', file: keepFile(state, v.video), thumb: thumbOf(v.thumbnail), duration: num(v.duration) };
    }
    case 'messageAudio': {
      const v = obj(c.audio);
      return { kind: 'audio', text: formatted(c.caption) || [str(v.performer), str(v.title)].filter(Boolean).join(' – '), file: keepFile(state, v.audio), fileName: str(v.file_name), duration: num(v.duration) };
    }
    case 'messageDocument': {
      const v = obj(c.document);
      return { kind: 'document', text: formatted(c.caption), file: keepFile(state, v.document), fileName: str(v.file_name), thumb: thumbOf(v.thumbnail) };
    }
    case 'messageSticker': {
      const v = obj(c.sticker);
      const moving = type(v.format) !== 'stickerFormatWebp';
      return { kind: 'sticker', text: str(v.emoji), file: keepFile(state, v.sticker), thumb: thumbOf(v.thumbnail), width: num(v.width), height: num(v.height), ...(moving ? { animated: true as const } : {}) };
    }
    case 'messageAnimatedEmoji':
    case 'messageDice':
      return { kind: 'text', text: str(c.emoji) };
    case 'messagePoll':
      return { kind: 'poll', text: formatted(obj(c.poll).question), poll: readPoll(c.poll) };
    case 'messageLocation': {
      const l = obj(c.location);
      return { kind: 'location', text: '', location: { lat: num(l.latitude), lon: num(l.longitude) } };
    }
    case 'messageVenue': {
      const v = obj(c.venue);
      const l = obj(v.location);
      return { kind: 'location', text: [str(v.title), str(v.address)].filter(Boolean).join(', '), location: { lat: num(l.latitude), lon: num(l.longitude) } };
    }
    case 'messageContact': {
      const v = obj(c.contact);
      return { kind: 'contact', text: '', contact: { name: [str(v.first_name), str(v.last_name)].filter(Boolean).join(' '), phone: str(v.phone_number), ...(num(v.user_id) ? { userId: num(v.user_id) } : {}) } };
    }
    case 'messageCall':
      return { kind: 'call', text: '', duration: num(c.duration) };
    case 'messageChatAddMembers':
    case 'messageChatJoinByLink':
    case 'messageChatDeleteMember':
    case 'messageChatChangeTitle':
    case 'messageChatChangePhoto':
    case 'messagePinMessage':
    case 'messageBasicGroupChatCreate':
    case 'messageSupergroupChatCreate':
    case 'messageContactRegistered':
    case 'messageScreenshotTaken':
    case 'messageChatSetMessageAutoDeleteTime':
      return { kind: 'service', text: type(c) };
    default:
      return { kind: 'other', text: '' };
  }
}

/** A TDLib poll as a message shows it. */
export function readPoll(v: unknown): TgPoll {
  const p = obj(v);
  const kind = obj(p.type);
  const quiz = type(kind) === 'pollTypeQuiz' ? ((kind.correct_option_ids as unknown[] | undefined) ?? []).map(num) : undefined;
  return {
    id: str(p.id) || String(num(p.id)),
    question: formatted(p.question),
    options: ((p.options as unknown[] | undefined) ?? []).map((o) => {
      const x = obj(o);
      return { text: formatted(x.text), votes: num(x.voter_count), percent: num(x.vote_percentage), chosen: x.is_chosen === true };
    }),
    total: num(p.total_voter_count),
    closed: p.is_closed === true,
    anonymous: p.is_anonymous === true,
    multiple: p.allows_multiple_answers === true,
    revote: p.allows_revoting !== false && type(kind) !== 'pollTypeQuiz',
    ...(quiz ? { quiz } : {}),
    ...(quiz && formatted(kind.explanation) ? { explanation: formatted(kind.explanation) } : {}),
  };
}

// The reactions of a message's interaction info, emoji and custom emoji; paid stars are not shown.
function readReactions(info: Json): TgReaction[] | undefined {
  const list = (obj(info.reactions).reactions as unknown[] | undefined) ?? [];
  const out: TgReaction[] = [];
  for (const r of list) {
    const x = obj(r);
    const kind = obj(x.type);
    if (type(kind) === 'reactionTypeEmoji') out.push({ emoji: str(kind.emoji), count: num(x.total_count), mine: x.is_chosen === true });
    else if (type(kind) === 'reactionTypeCustomEmoji') {
      const id = str(kind.custom_emoji_id) || String(num(kind.custom_emoji_id) || '');
      if (id) out.push({ emoji: '', custom: id, count: num(x.total_count), mine: x.is_chosen === true });
    }
  }
  return out.length ? out : undefined;
}

// What a message's interaction info adds to it: reactions, replies in its thread, views.
function interaction(v: unknown): Pick<TgMessage, 'reactions' | 'replies' | 'views'> {
  const info = obj(v);
  const reactions = readReactions(info);
  const replies = num(obj(info.reply_info).reply_count);
  const views = num(info.view_count);
  return { ...(reactions ? { reactions } : {}), ...(replies ? { replies } : {}), ...(views ? { views } : {}) };
}

function forwardOf(v: unknown): TgForward | undefined {
  const origin = obj(obj(v).origin);
  switch (type(origin)) {
    case 'messageOriginUser':
      return { user: num(origin.sender_user_id) };
    case 'messageOriginHiddenUser':
      return { name: str(origin.sender_name) };
    case 'messageOriginChat':
      return { chat: num(origin.sender_chat_id) };
    case 'messageOriginChannel':
      return { chat: num(origin.chat_id) };
    default:
      return undefined;
  }
}

function senderOf(v: unknown): number {
  const s = obj(v);
  return type(s) === 'messageSenderUser' ? num(s.user_id) : num(s.chat_id);
}

/** A TDLib message as the screens show it. */
export function readMessage(state: TgState, v: unknown): TgMessage | null {
  const m = obj(v);
  if (!m.id || !m.chat_id) return null;
  const reply = obj(m.reply_to);
  const sending = obj(m.sending_state);
  return {
    id: num(m.id),
    chatId: num(m.chat_id),
    outgoing: m.is_outgoing === true,
    date: num(m.date),
    edited: num(m.edit_date),
    sender: senderOf(m.sender_id),
    ...content(state, obj(m.content)),
    replyTo: type(reply) === 'messageReplyToMessage' && num(reply.chat_id) === num(m.chat_id) ? num(reply.message_id) || undefined : undefined,
    sending: type(sending) === 'messageSendingStatePending' ? 'pending' : type(sending) === 'messageSendingStateFailed' ? 'failed' : undefined,
    ...interaction(m.interaction_info),
    ...(m.forward_info ? (forwardOf(m.forward_info) ? { forward: forwardOf(m.forward_info) } : {}) : {}),
    ...(m.is_pinned === true ? { pinned: true as const } : {}),
    ...laterOf(m.scheduling_state),
  };
}

function laterOf(v: unknown): { later?: number } {
  const s = obj(v);
  return type(s) === 'messageSchedulingStateSendAtDate' ? { later: num(s.send_date) || 1 } : {};
}

/** Takes in the messages a chat has sent for later (getChatScheduledMessages), all of them. */
export function setLater(state: TgState, chatId: number, page: unknown): void {
  const list = ((obj(page).messages as unknown[]) ?? []).map((v) => readMessage(state, v)).filter((m): m is TgMessage => !!m && m.later !== undefined);
  (state.later ??= {})[chatId] = list.sort((a, b) => (a.later ?? 0) - (b.later ?? 0) || a.id - b.id);
}

function dropLater(state: TgState, chatId: number, ids: Set<number>): boolean {
  const list = state.later?.[chatId];
  if (!list?.some((m) => ids.has(m.id))) return false;
  state.later![chatId] = list.filter((m) => !ids.has(m.id));
  return true;
}

function readAuth(v: unknown): TgAuth {
  const a = obj(v);
  switch (type(a)) {
    case 'authorizationStateWaitTdlibParameters':
      return { kind: 'starting' };
    case 'authorizationStateWaitPhoneNumber':
      return { kind: 'phone' };
    case 'authorizationStateWaitCode': {
      const info = obj(a.code_info);
      const t = obj(info.type);
      const via = type(t) === 'authenticationCodeTypeTelegramMessage' ? 'telegram' : type(t) === 'authenticationCodeTypeSms' ? 'sms' : type(t) === 'authenticationCodeTypeCall' ? 'call' : 'other';
      return { kind: 'code', phone: str(info.phone_number), length: num(t.length), via, timeout: num(info.timeout) };
    }
    case 'authorizationStateWaitPassword':
      return { kind: 'password', hint: str(a.password_hint), recovery: a.has_recovery_email_address === true };
    case 'authorizationStateWaitOtherDeviceConfirmation':
      return { kind: 'other-device', link: str(a.link) };
    case 'authorizationStateWaitRegistration':
      return { kind: 'unsupported', what: 'registration' };
    case 'authorizationStateWaitEmailAddress':
    case 'authorizationStateWaitEmailCode':
      return { kind: 'unsupported', what: 'email' };
    case 'authorizationStateReady':
      return { kind: 'ready' };
    case 'authorizationStateLoggingOut':
    case 'authorizationStateClosing':
      return { kind: 'closing' };
    case 'authorizationStateClosed':
      return { kind: 'closed' };
    default:
      return { kind: 'unsupported', what: type(a) };
  }
}

function chatType(v: unknown): Pick<TgChat, 'type' | 'userId' | 'group' | 'secretId'> {
  const t = obj(v);
  switch (type(t)) {
    case 'chatTypePrivate':
      return { type: 'private', userId: num(t.user_id) };
    case 'chatTypeSecret':
      return { type: 'secret', userId: num(t.user_id), secretId: num(t.secret_chat_id) };
    case 'chatTypeSupergroup':
      return { type: t.is_channel === true ? 'channel' : 'group', group: { id: num(t.supergroup_id), basic: false } };
    case 'chatTypeBasicGroup':
      return { type: 'group', group: { id: num(t.basic_group_id), basic: true } };
    default:
      return { type: 'group' };
  }
}

function setPosition(chat: TgChat, v: unknown) {
  const p = obj(v);
  const list = type(p.list);
  const order = str(p.order) || String(num(p.order));
  const at = order === '0' || order === '' ? undefined : order;
  if (list === 'chatListMain') {
    chat.main = at;
    chat.pinned = at ? p.is_pinned === true : false;
  } else if (list === 'chatListArchive') chat.archive = at;
  else if (list === 'chatListFolder') {
    const folder = num(obj(p.list).chat_folder_id);
    const folders = { ...chat.folders };
    if (at) folders[folder] = at;
    else delete folders[folder];
    chat.folders = folders;
  }
}

function addMessage(state: TgState, m: TgMessage) {
  if (m.later !== undefined) {
    const later = ((state.later ??= {})[m.chatId] ??= []).filter((x) => x.id !== m.id);
    later.push(m);
    state.later[m.chatId] = later.sort((a, b) => (a.later ?? 0) - (b.later ?? 0) || a.id - b.id);
    return;
  }
  dropLater(state, m.chatId, new Set([m.id]));
  const list = state.messages[m.chatId];
  if (!list) return;
  const at = list.findIndex((x) => x.id === m.id);
  if (at >= 0) list[at] = m;
  else {
    list.push(m);
    list.sort((a, b) => a.id - b.id);
  }
}

/** Takes in one update of TDLib. Says whether the screens should draw again. */
export function applyUpdate(state: TgState, update: unknown): boolean {
  const u = obj(update);
  const changed = applyOne(state, u);
  // Each change to a chat's messages counts there, those not loaded too (a thread's, a channel
  // post's comments): a screen showing some of them asks again when its chat's count moves.
  const kind = type(u);
  if (kind === 'updateNewMessage' || kind === 'updateDeleteMessages' || (kind.startsWith('updateMessage') && kind !== 'updateMessageSendAcknowledged')) {
    const chat = kind === 'updateNewMessage' ? num(obj(u.message).chat_id) : num(u.chat_id);
    if (chat) {
      state.touched = { ...state.touched, [chat]: (state.touched?.[chat] ?? 0) + 1 };
      return true;
    }
  }
  return changed;
}

function applyOne(state: TgState, u: Json): boolean {
  switch (type(u)) {
    case 'updateAuthorizationState':
      state.auth = readAuth(u.authorization_state);
      if (state.auth.kind === 'closed') Object.assign(state, { ...newTgState(), auth: state.auth });
      return true;
    case 'updateConnectionState': {
      const s = type(u.state);
      state.connection = s === 'connectionStateWaitingForNetwork' ? 'waiting-network' : s === 'connectionStateConnectingToProxy' ? 'connecting-proxy' : s === 'connectionStateConnecting' ? 'connecting' : s === 'connectionStateUpdating' ? 'updating' : 'ready';
      return true;
    }
    case 'updateOption':
      if (str(u.name) === 'my_id') state.me = num(obj(u.value).value);
      return false;
    case 'updateUser': {
      const v = obj(u.user);
      const photo = obj(obj(v.profile_photo).small);
      state.users[num(v.id)] = {
        id: num(v.id),
        first: str(v.first_name),
        last: str(v.last_name),
        username: str((obj(v.usernames).active_usernames as unknown[] | undefined)?.[0]),
        phone: str(v.phone_number),
        photo: keepFile(state, photo),
        deleted: type(v.type) === 'userTypeDeleted' || undefined,
        bot: type(v.type) === 'userTypeBot' || undefined,
        premium: v.is_premium === true || undefined,
        verified: obj(v.verification_status).is_verified === true || v.is_verified === true || undefined,
        status: readStatus(v.status),
      };
      return true;
    }
    case 'updateUserStatus': {
      const user = state.users[num(u.user_id)];
      if (user) user.status = readStatus(u.status);
      return !!user;
    }
    case 'updateChatDraftMessage': {
      const chat = state.chats[num(u.chat_id)];
      if (!chat) return false;
      delete chat.draft;
      Object.assign(chat, draftOf(u.draft_message));
      return true;
    }
    case 'updateChatIsMarkedAsUnread': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) chat.markedUnread = u.is_marked_as_unread === true || undefined;
      return !!chat;
    }
    case 'updateChatBlockList': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) chat.blocked = !!u.block_list || undefined;
      return !!chat;
    }
    case 'updateChatMessageAutoDeleteTime': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) chat.autoDelete = num(u.message_auto_delete_time) || undefined;
      return !!chat;
    }
    case 'updateNewChat': {
      const c = obj(u.chat);
      const chat: TgChat = {
        id: num(c.id),
        title: str(c.title),
        ...chatType(c.type),
        photo: keepFile(state, obj(obj(c.photo).small)),
        unread: num(c.unread_count),
        muted: num(obj(c.notification_settings).mute_for) > 0,
        readOutbox: num(c.last_read_outbox_message_id),
        readInbox: num(c.last_read_inbox_message_id),
        ...(c.is_marked_as_unread === true ? { markedUnread: true } : {}),
        ...(c.block_list ? { blocked: true } : {}),
        ...(num(c.message_auto_delete_time) ? { autoDelete: num(c.message_auto_delete_time) } : {}),
        ...draftOf(c.draft_message),
      };
      for (const p of (c.positions as unknown[] | undefined) ?? []) setPosition(chat, p);
      if (c.last_message) chat.last = readMessage(state, c.last_message) ?? undefined;
      state.chats[chat.id] = chat;
      return true;
    }
    case 'updateChatFolders':
      // The name is a chatFolderName (text with entities) in this TDLib; a plain title in older ones.
      state.folders = ((u.chat_folders as unknown[] | undefined) ?? []).map((v) => {
        const f = obj(v);
        const name = obj(f.name);
        return { id: num(f.id), name: str(obj(name.text).text) || str(f.title) || str(f.name) };
      });
      return true;
    case 'updateChatTitle': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) chat.title = str(u.title);
      return !!chat;
    }
    case 'updateChatPhoto': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) chat.photo = keepFile(state, obj(obj(u.photo).small));
      return !!chat;
    }
    case 'updateChatPosition': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) setPosition(chat, u.position);
      return !!chat;
    }
    case 'updateChatLastMessage': {
      const chat = state.chats[num(u.chat_id)];
      if (!chat) return false;
      chat.last = u.last_message ? (readMessage(state, u.last_message) ?? undefined) : undefined;
      for (const p of (u.positions as unknown[] | undefined) ?? []) setPosition(chat, p);
      return true;
    }
    case 'updateChatReadInbox': {
      const chat = state.chats[num(u.chat_id)];
      if (!chat) return false;
      chat.unread = num(u.unread_count);
      chat.readInbox = num(u.last_read_inbox_message_id);
      return true;
    }
    case 'updateChatReadOutbox': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) chat.readOutbox = num(u.last_read_outbox_message_id);
      return !!chat;
    }
    case 'updateChatNotificationSettings': {
      const chat = state.chats[num(u.chat_id)];
      if (chat) chat.muted = num(obj(u.notification_settings).mute_for) > 0;
      return !!chat;
    }
    case 'updateNewMessage': {
      const m = readMessage(state, u.message);
      if (m) addMessage(state, m);
      return !!m;
    }
    case 'updateMessageSendSucceeded': {
      const m = readMessage(state, u.message);
      if (!m) return false;
      const list = state.messages[m.chatId];
      dropLater(state, m.chatId, new Set([num(u.old_message_id)]));
      if (list) {
        const at = list.findIndex((x) => x.id === num(u.old_message_id));
        if (at >= 0) list.splice(at, 1);
      }
      if (list || m.later !== undefined) addMessage(state, m);
      return true;
    }
    case 'updateMessageSendFailed': {
      const m = readMessage(state, u.message);
      if (m) addMessage(state, { ...m, sending: 'failed' });
      return !!m;
    }
    case 'updateMessageContent': {
      const list = state.messages[num(u.chat_id)];
      const at = list?.findIndex((x) => x.id === num(u.message_id)) ?? -1;
      if (!list || at < 0) {
        // Its chat is not open: only the chat's row shows it, when it is the last one.
        const row = state.chats[num(u.chat_id)];
        if (!row?.last || row.last.id !== num(u.message_id)) return false;
        row.last = { ...row.last, ...content(state, obj(u.new_content)) };
        return true;
      }
      list[at] = { ...list[at], ...content(state, obj(u.new_content)) };
      // The chat's row shows its last message: it says the new words too.
      const chat = state.chats[num(u.chat_id)];
      if (chat?.last?.id === list[at].id) chat.last = list[at];
      return true;
    }
    case 'updateMessageInteractionInfo': {
      const list = state.messages[num(u.chat_id)];
      const at = list?.findIndex((x) => x.id === num(u.message_id)) ?? -1;
      if (!list || at < 0) return false;
      const { reactions: _r, replies: _p, views: _v, ...rest } = list[at];
      list[at] = { ...rest, ...interaction(u.interaction_info) };
      return true;
    }
    case 'updateMessageIsPinned': {
      const list = state.messages[num(u.chat_id)];
      const at = list?.findIndex((x) => x.id === num(u.message_id)) ?? -1;
      if (!list || at < 0) return false;
      const { pinned: _p, ...rest } = list[at];
      list[at] = { ...rest, ...(u.is_pinned === true ? { pinned: true as const } : {}) };
      return true;
    }
    case 'updatePoll': {
      const poll = readPoll(u.poll);
      let changed = false;
      for (const list of Object.values(state.messages)) {
        for (let i = 0; i < list.length; i++) {
          if (list[i].poll?.id === poll.id) {
            list[i] = { ...list[i], poll };
            changed = true;
          }
        }
      }
      return changed;
    }
    case 'updateMessageEdited': {
      const list = state.messages[num(u.chat_id)];
      const at = list?.findIndex((x) => x.id === num(u.message_id)) ?? -1;
      // A new one in its place, as with new words: the screen draws again the messages that are new ones.
      if (list && at >= 0) list[at] = { ...list[at], edited: num(u.edit_date) };
      return at >= 0;
    }
    case 'updateDeleteMessages': {
      const gone = new Set(((u.message_ids as unknown[]) ?? []).map(num));
      // One sent for later leaves Telegram's keeping when it goes or is deleted.
      const later = dropLater(state, num(u.chat_id), gone);
      if (u.is_permanent !== true) return later;
      const list = state.messages[num(u.chat_id)];
      if (!list) return later;
      state.messages[num(u.chat_id)] = list.filter((m) => !gone.has(m.id));
      return true;
    }
    case 'updateFile': {
      const f = file(u.file);
      if (f) state.files[f.id] = f;
      return !!f;
    }
    case 'updateChatAction': {
      const chatId = num(u.chat_id);
      const who = senderOf(u.sender_id);
      const typing = (state.typing[chatId] ??= {});
      if (type(u.action) === 'chatActionCancel') delete typing[who];
      else typing[who] = Date.now() + 6000;
      return true;
    }
    default:
      return false;
  }
}

/** Which list of chats: all, the archive, or one of the account's folders (by its id). */
/** Telegram's largest file, for an account without Premium. */
export const TELEGRAM_MOST = 2000 * 1024 * 1024;

export type TgList = 'main' | 'archive' | number;

/** The chats of a list, in Telegram's order. */
export function chatList(state: TgState, list: TgList = 'main'): TgChat[] {
  const at = (c: TgChat) => (list === 'main' ? c.main : list === 'archive' ? c.archive : c.folders?.[list]);
  const order = (c: TgChat) => BigInt(at(c) ?? '0');
  return Object.values(state.chats)
    .filter((c) => at(c) !== undefined)
    .sort((a, b) => (order(b) > order(a) ? 1 : order(b) < order(a) ? -1 : 0));
}

/** A person's or a chat's name. */
export function nameOf(state: TgState, id: number): string {
  const user = state.users[id];
  if (user) return [user.first, user.last].filter(Boolean).join(' ') || (user.username ? `@${user.username}` : '');
  return state.chats[id]?.title ?? '';
}

/** Takes in a page of history (TDLib gives newest first). Says how many were new. */
export function addHistory(state: TgState, chatId: number, page: unknown): number {
  const list = (state.messages[chatId] ??= []);
  const known = new Set(list.map((m) => m.id));
  let added = 0;
  for (const v of (obj(page).messages as unknown[] | undefined) ?? []) {
    const m = readMessage(state, v);
    if (!m || known.has(m.id)) continue;
    list.push(m);
    added++;
  }
  list.sort((a, b) => a.id - b.id);
  return added;
}

/** A TDLib error's message, or null for an answer that is not one. */
export function tdError(answer: unknown): string | null {
  const a = obj(answer);
  return type(a) === 'error' ? str(a.message) || `error ${num(a.code)}` : null;
}

/**
 * What a Telegram error says, in the app's language: the ones a person meets (no right, wait,
 * privacy, a wrong code or password, a message or chat gone) said plainly; any other as Telegram
 * words it, marked as Telegram's.
 */
export function saidError(raw: string): string {
  const wait = /FLOOD_WAIT_(\d+)|retry after (\d+)/i.exec(raw);
  if (wait) return t('Telegram asks to wait {n} seconds before trying again.', { n: Number(wait[1] ?? wait[2]) });
  if (/CHAT_ADMIN_REQUIRED|RIGHT_FORBIDDEN|not enough rights|have no rights|CHAT_WRITE_FORBIDDEN|MESSAGE_DELETE_FORBIDDEN/i.test(raw)) return t('You do not have the right to do this here.');
  if (/USER_PRIVACY_RESTRICTED|USER_NOT_MUTUAL_CONTACT/.test(raw)) return t('Their privacy settings do not let you add them. Send them the invite link instead.');
  if (/PHONE_CODE_INVALID/.test(raw)) return t('That code is not right.');
  if (/PHONE_CODE_EXPIRED/.test(raw)) return t('That code has expired. Ask for a new one.');
  if (/PASSWORD_HASH_INVALID/.test(raw)) return t('That password is not right.');
  if (/PHONE_NUMBER_INVALID/.test(raw)) return t('That phone number is not right.');
  if (/MESSAGE_ID_INVALID|MSG_ID_INVALID|Message not found/i.test(raw)) return t('That message is not there any more.');
  if (/USER_NOT_PARTICIPANT|CHANNEL_PRIVATE|Chat not found/i.test(raw)) return t('You are not in that chat any more.');
  if (/USER_ALREADY_PARTICIPANT/.test(raw)) return t('They are in it already.');
  return t('Telegram said: {reason}', { reason: raw });
}

/** The phone number settings: no flash or missed calls, no Google SMS reading, no Firebase. */
export function phoneRequest(phone: string): Json {
  return {
    '@type': 'setAuthenticationPhoneNumber',
    phone_number: phone,
    settings: {
      '@type': 'phoneNumberAuthenticationSettings',
      allow_flash_call: false,
      allow_missed_call: false,
      is_current_phone_number: false,
      has_unknown_phone_number: false,
      allow_sms_retriever_api: false,
      authentication_tokens: [],
    },
  };
}

/** Sends `text`, without link previews (opening one tells the site you saw the link). */
/** A text message to send; its marks go as Telegram's entities, unless `plain` (ErevosGram's packets go as they are). */
export function textRequest(chatId: number, text: string, replyTo?: number, plain = false, later?: number, preview = false): Json {
  return {
    '@type': 'sendMessage',
    chat_id: chatId,
    // Telegram keeps one sent for later and sends it at its time (seconds), this phone off or not.
    ...(later ? { options: { '@type': 'messageSendOptions', scheduling_state: { '@type': 'messageSchedulingStateSendAtDate', send_date: later, repeat_period: 0 } } } : {}),
    ...(replyTo ? { reply_to: { '@type': 'inputMessageReplyToMessage', message_id: replyTo } } : {}),
    input_message_content: {
      '@type': 'inputMessageText',
      text: { '@type': 'formattedText', ...(plain ? { text, entities: [] } : entitiesOf(text)) },
      // Telegram's servers make a link's preview, when this space makes previews (Settings).
      link_preview_options: { '@type': 'linkPreviewOptions', is_disabled: !preview || plain },
      clear_draft: true,
    },
  };
}

/**
 * What a Telegram account's notices should hear (lib/network-notices.ts hearing): its chats'
 * unread counts `now`, but a count may grow over what was heard before (`before`) only by the
 * messages that truly came now (`fresh`, by the same key): new, not ours, after the chat's read
 * mark and since TDLib started. So a chat whose count grows for anything else says nothing: an old
 * chat loaded as the list scrolls, one unarchived or unmuted, TDLib catching up after a restart or
 * a reconnect with messages read already on another device, or a count it has not yet lowered
 * after a read here. A count that falls is heard as it is, so a read anywhere clears the notice.
 */
export function heardUnread(before: ReadonlyMap<string, number> | null, now: ReadonlyMap<string, number>, fresh: ReadonlyMap<string, number>): Map<string, number> {
  if (!before) return new Map(now);
  const heard = new Map<string, number>();
  for (const [where, n] of now) {
    const was = before.get(where) ?? 0;
    const shown = n > was ? Math.min(n, was + (fresh.get(where) ?? 0)) : n;
    if (shown > 0) heard.set(where, shown);
  }
  return heard;
}

/** Whether `m`, given by updateNewMessage, is one that truly came now: not ours, after the chat's read mark `readInbox`, and sent since `since` (ms). */
export function freshMessage(m: Pick<TgMessage, 'id' | 'outgoing' | 'date'>, readInbox: number, since: number): boolean {
  return !m.outgoing && m.id > readInbox && m.date * 1000 >= since;
}

/**
 * A read done here, at once in what the screens and notices count: the chat's read mark moves up
 * to `upTo` and its count falls to the messages after it that are known, never rising. TDLib's
 * own count follows a moment later; until it does, leaving Erevos would keep a notice of what was
 * just read. Says whether anything changed.
 */
export function readLocally(state: TgState, chatId: number, upTo: number): boolean {
  const chat = state.chats[chatId];
  if (!chat || upTo <= chat.readInbox) return false;
  chat.readInbox = upTo;
  const after = (state.messages[chatId] ?? []).filter((m) => !m.outgoing && m.id > upTo).length;
  chat.unread = Math.min(chat.unread, after);
  return true;
}

/**
 * The messages that came and are not told of yet, by home row: their ids, those the chat has read
 * since (`readInbox`) left out, and as many of the first as the notices told of (`heard` over
 * `before`). TDLib may give a message and the count it adds in different batches, so one waits
 * here until its count comes, or it is read.
 */
export function freshLeft(fresh: ReadonlyMap<string, readonly number[]>, readInbox: (where: string) => number, before: ReadonlyMap<string, number> | null, heard: ReadonlyMap<string, number>): Map<string, number[]> {
  const left = new Map<string, number[]>();
  for (const [where, ids] of fresh) {
    const told = Math.max(0, (heard.get(where) ?? 0) - (before?.get(where) ?? 0));
    const mark = readInbox(where);
    const rest = ids.filter((id) => id > mark).sort((a, b) => a - b).slice(told);
    if (rest.length) left.set(where, rest);
  }
  return left;
}

/** How many messages wait to be told of, by home row (freshLeft), as heardUnread takes them. */
export function freshCounts(fresh: ReadonlyMap<string, readonly number[]>, readInbox: (where: string) => number): Map<string, number> {
  const counts = new Map<string, number>();
  for (const [where, ids] of fresh) {
    const mark = readInbox(where);
    const n = ids.filter((id) => id > mark).length;
    if (n) counts.set(where, n);
  }
  return counts;
}
