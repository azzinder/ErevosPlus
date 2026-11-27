// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { searchHidden } from '../lock/hidden';
import { currentSpace } from '../lock/keys';
import { hiddenHolder, type Holder } from '../lock/sealed-file';
import { mutedNow, type ChatNotify } from '../lock/chat-notify';
import type { ChatPin } from '../lock/chat-pin';
import { loadTelegram, saveTelegram, type TelegramData } from '../lock/telegram-data';
import { checkedTelegramRestore, loadTelegramSignIn, RESTORE_PENDING, saveTelegramSignIn } from '../lock/telegram-sign-in';
import { lastRestore } from '../lock/restored';
import { secureDelete, secureGet, secureSet } from './secure';
import { t } from './i18n';
import { addNetwork, hearing, placeNetworkRang } from './network-notices';
import { canTor, canTorSocks } from './core';
import { accountNeverStraight, accountTorDoor, AccountTorError, accountTorOf, canAccountTor, effectiveTor, type AccountTor } from './account-tor';
import { onTorReady, onTorWay } from './relay';
import { callsOff, callsOffNote } from './modes';
import { actingWhere, type NetworkWhere } from './network-place';
import { PlaceLives, type PlaceKey } from './place-lives';
import { addHistory, applyUpdate, freshCounts, freshLeft, freshMessage, heardUnread, readLocally, newTgState, phoneRequest, readMessage, saidError, setLater, tdError, telegramKeys, textRequest, type TgList, type TgMessage, type TgState } from './telegram';
import { entitiesOf } from './telegram-marks';
import { TelegramCalls, type CallsNativeLike, type TgCall } from './telegram-calls';
import { isWire, TelegramSeal, type SealInfo, type Shown } from './telegram-seal';

// The open space's Telegram as the screens use it (the ErevosGram build: app/telegram.tsx,
// app/telegram-chat.tsx, docs/erevosgram.md): TDLib runs for the space while it is open, once the
// space has signed in or begun to (lock/telegram-data.ts), and its updates are read into what the
// screens show (lib/telegram.ts). A hidden place's own Telegram runs beside it while its hidden
// chats are open, or receive while closed (lib/place-networks.ts), as for XMPP and Matrix.
// A space that never signed in starts no TDLib, so it leaves no folder on the phone.
//
// The ErevosGram encryption (lib/telegram-seal.ts) opens what comes as it comes, in order, even
// with the chat closed: a following packet opens only after its first, and each one only once.

/** TDLib for the space, as modules/erevos-telegram gives it; replaced in the checks. */
export type TelegramNativeLike = {
  /** `proxy`: an addProxy request TDLib gets right after its parameters, before it first connects; '' for none. */
  open(slot: string, key: Uint8Array, lang: string, proxy?: string): Promise<void>;
  send(slot: string, request: string): Promise<string>;
  close(slot: string): Promise<void>;
  wipe(slot: string): Promise<void>;
  /** The slot's sign-in as TDLib keeps it, base64, for a backup; null where it has none. Missing in a build from before it. */
  signIn?(slot: string): Promise<string | null>;
  /** Puts a backup's sign-in in place before the slot's client first opens; false where it has one, or is open. */
  putSignIn?(slot: string, signIn: string): Promise<boolean>;
  addListener(event: 'onUpdates', listener: (event: { slot: string; updates: string[] }) => void): { remove(): void };
} & Partial<CallsNativeLike> & {
  /** The sound of a call (modules/erevos-telegram Calls.kt): signaling to pass on, or how it connects. */
  addListener?(event: 'onCall', listener: (event: { kind: string; data: string }) => void): { remove(): void };
};

type Live = {
  holder: Holder;
  space: number;
  key: Uint8Array;
  slot: string;
  dbKey: Uint8Array;
  data: TelegramData | null;
  state: TgState;
  seal: TelegramSeal;
  calls: TelegramCalls;
  /** The pocket of a hidden place's own account; undefined for the space's. */
  pocket?: number;
  /** What its chats had not read, told of as it changes (lib/network-notices.ts). */
  heard: ReturnType<typeof hearing>;
  /** Until when what is not read is only counted, not told of: TDLib brings every chat as it starts. */
  hushUntil: number;
  /** When TDLib started for it (ms): a message sent before, caught up with as it starts, is not told of. */
  startedAt: number;
  /** What its notices last heard (heardUnread), null before the first time. */
  lastHeard: Map<string, number> | null;
  /** The messages that truly came and are not told of yet, by home row: their ids (freshLeft). */
  fresh: Map<string, number[]>;
  /** What each wire message of ours shows, by `chat:message`. */
  shown: Map<string, Shown>;
  loaded: boolean;
  running: boolean;
  stopped: boolean;
  problem: string;
  saving: Promise<void>;
};

let native: TelegramNativeLike | null = null;
let lang = () => 'en';
let live: Live | null = null;
const places = new PlaceLives<Live>(start, end);
const listeners = new Set<() => void>();
let subscribed: { remove(): void } | null = null;
let callSubscribed: { remove(): void } | null = null;
let soon: ReturnType<typeof setTimeout> | null = null;

/** Plugs in TDLib (the ErevosGram build's module, or the checks' own) and the language Telegram is told. */
export function setTelegramNative(next: TelegramNativeLike | null, language?: () => string): void {
  subscribed?.remove();
  subscribed = null;
  callSubscribed?.remove();
  callSubscribed = null;
  native = next;
  if (language) lang = language;
  if (next) subscribed = next.addListener('onUpdates', ({ slot, updates }) => take(slot, updates));
  // The sound is one for the phone: the space whose call it is takes what it says.
  if (next && next.callStart) callSubscribed = (next.addListener as (event: 'onCall', listener: (event: { kind: string; data: string }) => void) => { remove(): void })('onCall', ({ kind, data }) => every().forEach((it) => it.calls.fromSound(kind, data)));
}

/** Whether this build has Telegram. */
export const telegramHere = () => native !== null;

/** Told each time the account, its chats or its messages change. */
export function onTelegramChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Many updates come at once: the screens draw once for them.
function told(): void {
  if (soon) return;
  soon = setTimeout(() => {
    soon = null;
    listeners.forEach((listener) => listener());
  }, 16);
}

function every(): Live[] {
  return [...(live ? [live] : []), ...places.all()];
}

function take(slot: string, updates: string[]): void {
  const it = every().find((x) => x.slot === slot && !x.stopped);
  if (!it) return;
  let changed = false;
  for (const text of updates) {
    let update: Record<string, unknown>;
    try {
      update = JSON.parse(text) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (it.calls.take(update)) {
      // A call to a closed hidden place rings with no name (lib/background.ts).
      const call = it.calls.current();
      if (it.pocket !== undefined && call?.stage === 'ringing' && update['@type'] === 'updateCall' && Number((update.call as { id?: number })?.id) === call.id) placeNetworkRang(it.space, it.pocket);
      continue;
    }
    const wasReady = it.state.auth.kind === 'ready';
    if (applyUpdate(it.state, update)) changed = true;
    // Signed in now (or again): the chats come as updates once asked for. Asked at the start
    // too, but before signing in TDLib refuses it.
    if (!wasReady && it.state.auth.kind === 'ready') {
      void request(it, { '@type': 'loadChats', chat_list: { '@type': 'chatListMain' }, limit: 100 }).catch(() => undefined);
      for (const id of it.data?.homeFolders ?? []) void request(it, { '@type': 'loadChats', chat_list: { '@type': 'chatListFolder', chat_folder_id: id }, limit: 100 }).catch(() => undefined);
    }
    if (update['@type'] === 'updateNewMessage') {
      const raw = update.message as { chat_id?: number; id?: number; is_outgoing?: boolean; date?: number } | undefined;
      const chatId = Number(raw?.chat_id);
      const readInbox = it.state.chats[chatId]?.readInbox ?? 0;
      if (raw && freshMessage({ id: Number(raw.id), outgoing: raw.is_outgoing === true, date: Number(raw.date) }, readInbox, it.startedAt)) {
        it.fresh.set(`telegram:${chatId}`, [...(it.fresh.get(`telegram:${chatId}`) ?? []), Number(raw.id)]);
      }
      const m = it.state.messages[Number((update.message as { chat_id?: number })?.chat_id)]?.find((x) => x.id === Number((update.message as { id?: number }).id));
      const message = m ?? null;
      if (message && message.kind === 'text' && isWire(message.text)) void openWire(it, message);
    }
    // A chat's last message, as it changes or as the chat first comes with one: the list shows what it says.
    if (update['@type'] === 'updateChatLastMessage' || update['@type'] === 'updateNewChat') {
      const last = it.state.chats[Number(update['@type'] === 'updateNewChat' ? (update.chat as { id?: number } | undefined)?.id : update.chat_id)]?.last;
      if (last && last.kind === 'text' && isWire(last.text)) void openWire(it, last);
    }
  }
  if (changed) {
    hear(it, Date.now() < it.hushUntil);
    told();
  }
}

// Tells the notices what its chats have not read (unreadAt), as heardUnread lets them: `quiet`
// counts only; else only the messages that truly came (it.fresh) may be told of.
function hear(it: Live, quiet: boolean): void {
  const now = unreadAt(it);
  const before = it.lastHeard;
  const mark = (where: string) => it.state.chats[Number(where.slice('telegram:'.length))]?.readInbox ?? 0;
  const heard = quiet ? now : heardUnread(before, now, freshCounts(it.fresh, mark));
  it.fresh = quiet ? new Map() : freshLeft(it.fresh, mark, before, heard, unsilenced(it));
  it.lastHeard = heard;
  it.heard.hear(heard, quiet);
}

// A read done here counts at once (readLocally): leaving Erevos right after reading leaves no
// notice of what was read, and the read is told so a notice already up goes.
function readHere(it: Live, chatId: number, upTo: number): void {
  if (!readLocally(it.state, chatId, upTo)) return;
  hear(it, false);
  told();
}

async function openWire(it: Live, m: TgMessage): Promise<void> {
  const at = `${m.chatId}:${m.id}`;
  if (it.shown.has(at)) return;
  const shown = await it.seal.shown(m.chatId, m.id, m.text, m.outgoing).catch(() => null);
  if (!shown || it.stopped) return;
  it.shown.set(at, shown);
  told();
}

async function keep(it: Live): Promise<void> {
  const data = it.data;
  if (!data) return;
  it.saving = it.saving.catch(() => undefined).then(() => saveTelegram(it.space, it.key, data, it.holder));
  await it.saving;
}

// Each chat's messages not read, by its home row: the main list's, a muted one's left out.
// The chats that notify, with what they have not read: the main list's, muted ones left out; and once
// folders are chosen for home (telegramHomeFolders), only those of the chosen folders.
function unreadAt(it: Live): Map<string, number> {
  const at = new Map<string, number>();
  const listens = listening(it);
  for (const c of Object.values(it.state.chats)) {
    if (c.unread <= 0 || !listens(`telegram:${c.id}`)) continue;
    at.set(`telegram:${c.id}`, c.unread);
  }
  return at;
}

// Which home rows the notices hear now (unreadAt): not silenced, and in the folders chosen, or the
// main list.
function listening(it: Live): (where: string) => boolean {
  const folders = chosenFolders(it);
  const loud = unsilenced(it);
  return (where) => {
    const c = it.state.chats[Number(where.slice('telegram:'.length))];
    if (!c || !loud(where)) return false;
    return folders.length ? folders.some((id) => c.folders?.[id] !== undefined) : c.main !== undefined;
  };
}

// Which home rows are not silenced: not muted, here or in Telegram, nor kept in hidden chats (one
// there says nothing outside them). What came to a silenced chat is forgotten (freshLeft), so being
// heard again tells of nothing from meanwhile. Its place in the list is not asked: TDLib gives a new
// chat's, or one coming back's, after its first message, and that message is still told of.
function unsilenced(it: Live): (where: string) => boolean {
  const away = new Set(it.data?.away ?? []);
  return (where) => {
    const c = it.state.chats[Number(where.slice('telegram:'.length))];
    return !!c && !c.muted && !away.has(c.id) && !mutedNow(it.data?.notify?.[String(c.id)]);
  };
}

function start(holder: Holder, space: number, key: Uint8Array, pocket?: number): Live {
  const { slot, dbKey } = telegramKeys(key);
  const it = {} as Live;
  const seal = new TelegramSeal(
    {
      load: async () => it.data?.seal ?? null,
      save: async (sealData) => {
        if (!it.data) return;
        it.data.seal = sealData;
        await keep(it);
      },
    },
    {
      send: async (chatId, text, replyTo) => void (await request(it, textRequest(chatId, text, replyTo, true))),
      recent: async (chatId) => {
        const page = await request(it, { '@type': 'getChatHistory', chat_id: chatId, from_message_id: 0, offset: 0, limit: 100, only_local: false });
        const list = ((page as { messages?: Record<string, unknown>[] }).messages ?? []) as { id: number; content?: { '@type'?: string; text?: { text?: string } } }[];
        return list.filter((m) => m.content?.['@type'] === 'messageText').map((m) => ({ id: m.id, text: m.content?.text?.text ?? '' }));
      },
      remove: async (chatId, ids) => void (await request(it, { '@type': 'deleteMessages', chat_id: chatId, message_ids: ids, revoke: true })),
    },
    () => t('I use ErevosGram for end-to-end encryption and invited you to an encrypted chat. To accept, get it here: https://lphl.nekten.eu/erevos'),
  );
  const calls = new TelegramCalls((body) => request(it, body), callSound, told, Date.now, () => (callsOff() ? callsOffNote() : null));
  // A hidden place's tell only of its place, with no name (hearing).
  const heard = hearing(pocket === undefined ? undefined : { space, pocket }, (where) => chatNotify(it, where));
  Object.assign(it, { holder, space, key: key.slice(), slot, dbKey, data: null, state: newTgState(), seal, calls, pocket, heard, hushUntil: 0, startedAt: Date.now(), lastHeard: null, fresh: new Map(), shown: new Map(), loaded: false, running: false, stopped: false, problem: '', saving: Promise.resolve() });
  seal.onChange(told);
  loadTelegram(space, key, holder)
    .then(async (data) => {
      it.data = data;
      it.loaded = true;
      if (data.account) await run(it);
      told();
    })
    .catch((error: unknown) => {
      it.loaded = true;
      it.problem = reason(error);
      told();
    });
  return it;
}

async function run(it: Live): Promise<void> {
  if (!native || it.running || it.stopped) return;
  it.running = true;
  it.hushUntil = Date.now() + 8000;
  it.startedAt = Date.now();
  try {
    followTor();
    // The proxy goes with the opening, so that TDLib has it before it first connects, and never goes straight when it must not.
    const proxy = await proxyOf(it);
    // After a restore, the backup's sign-in goes in place first, so TDLib opens signed in.
    await restoredSignIn(it);
    if (it.stopped) return;
    await native.open(it.slot, it.dbKey, lang(), proxy ? JSON.stringify(proxy) : '');
    await torWay(it, proxy).catch((error: unknown) => {
      it.problem = reason(error);
    });
    // The chats come as updates once asked for.
    await request(it, { '@type': 'loadChats', chat_list: { '@type': 'chatListMain' }, limit: 100 }).catch(() => undefined);
  } catch (error) {
    it.running = false;
    it.problem = reason(error);
  }
  told();
}

/**
 * For a backup about to be made: each Telegram of the open space and its hidden places keeps its
 * sign-in as TDLib has it now (lock/telegram-sign-in.ts), signed in; one signed out keeps none, so
 * it does not stay in backups. Another space's stays as that space last kept it. Never throws.
 */
export async function keepTelegramForBackup(now = Date.now()): Promise<{ kind: 'none' | 'in' } | { kind: 'failed'; error: string }> {
  const n = native;
  if (!n?.signIn) return { kind: 'none' };
  let any = false;
  let failed: string | null = null;
  for (const it of every()) {
    if (it.stopped || !it.loaded) continue;
    try {
      // Signed in now: its sign-in as it is. Not signed in, nor signing in: none. Starting or
      // connecting: as last kept, as TDLib has not said yet.
      const ready = it.running && it.state.auth.kind === 'ready';
      const asks = ['phone', 'code', 'password', 'other-device'].includes(it.state.auth.kind);
      const out = !it.data?.account || (it.running && asks);
      if (ready) {
        const signIn = await n.signIn(it.slot);
        await saveTelegramSignIn(it.space, it.key, { signIn: signIn ?? '', at: signIn ? now : 0 }, it.holder);
        any ||= !!signIn;
      } else if (out) {
        await saveTelegramSignIn(it.space, it.key, { signIn: '', at: 0 }, it.holder);
      }
    } catch (error) {
      failed = reason(error);
    }
  }
  if (failed !== null) return { kind: 'failed', error: failed };
  return { kind: any ? 'in' : 'none' };
}

/** Marks the restore `id` just made: each space's Telegram sign-in goes back as its Telegram first opens. */
export async function telegramRestored(id: string): Promise<void> {
  await secureSet(RESTORE_PENDING, JSON.stringify({ id, done: [] }));
}

// The backup's sign-in of `it`, put in place before its Telegram first opens after a restore,
// once; where this phone has a sign-in for it already, that stays.
async function restoredSignIn(it: Live): Promise<void> {
  const n = native;
  if (!n?.putSignIn) return;
  try {
    const pending = checkedTelegramRestore(await secureGet(RESTORE_PENDING));
    if (!pending) return;
    if (pending.id !== (await lastRestore())) {
      await secureDelete(RESTORE_PENDING);
      return;
    }
    if (pending.done.includes(it.slot)) return;
    const { signIn } = await loadTelegramSignIn(it.space, it.key, it.holder);
    if (signIn) await n.putSignIn(it.slot, signIn);
    await secureSet(RESTORE_PENDING, JSON.stringify({ id: pending.id, done: [...pending.done, it.slot] }));
    // Said once, as it went back: the same sign-in on two phones signs both out from either.
    if (signIn) void import('./alert').then(({ ask }) => ask('Telegram', t("Telegram is signed in from the backup. On the old phone delete Erevos+ without signing out: signing out there signs this phone out too."), [{ text: t('OK') }])).catch(() => undefined);
  } catch (error) {
    // TDLib opens without it: Telegram asks to sign in, as before backups held it.
    it.problem = t("Telegram's sign-in from the backup could not go back: {error}", { error: reason(error) });
  }
}

// The sound of calls, where this build has it.
function callSound(): CallsNativeLike | null {
  const n = native;
  if (!n?.callProtocol || !n.callStart || !n.callSignal || !n.callMute || !n.callStop) return null;
  return n as CallsNativeLike;
}

function end(it: Live): void {
  void it.calls.stop().catch(() => undefined);
  it.stopped = true;
  if (it.running && native) void native.close(it.slot).catch(() => undefined);
  it.running = false;
  it.dbKey.fill(0);
}

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** A TDLib request of the space's Telegram; throws TDLib's error. */
async function request(it: Live, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!native || !it.running) throw new Error(t('Telegram is not running in this space.'));
  const answer = JSON.parse(await native.send(it.slot, JSON.stringify(body))) as Record<string, unknown>;
  const error = tdError(answer);
  // Said in the app's language (saidError); the raw words stay with it, for the checks and logs.
  if (error) throw Object.assign(new Error(saidError(error)), { telegram: error });
  return answer;
}

/** Runs the open space's Telegram while it stays open, once it has an account. */
export function runTelegram(): void {
  if (!native) return;
  let space: { space: number; key: Uint8Array };
  try {
    space = currentSpace();
  } catch {
    return;
  }
  if (live && live.space === space.space && !live.stopped) return;
  stopTelegram();
  live = start('space', space.space, space.key);
}

/** Stops the open space's Telegram as the space closes, and its hidden places'. */
export function stopTelegram(): void {
  closeTelegramPlaces();
  if (!live) return;
  end(live);
  live = null;
  told();
}

/** Runs the Telegram of the hidden places of `space` in `wanted`; `shown` is the open hidden chats' pocket. */
export function followTelegramPlaces(space: number, wanted: PlaceKey[], shown: number | null): void {
  if (places.follow(space, native ? wanted : [], shown)) told();
}

export function closeTelegramPlaces(): void {
  if (places.stopAll()) told();
}

function acting(where: NetworkWhere = actingWhere()): Live | null {
  return where === 'place' ? places.shown() : live;
}

function need(): Live {
  const it = acting();
  if (!it || it.stopped || !it.data) throw new Error(t('Telegram is not running in this space.'));
  return it;
}

/** The space's Telegram as it is now (or the open hidden place's). */
export function telegramNow(where: NetworkWhere = 'space'): { loaded: boolean; account: boolean; state: TgState | null; problem: string } {
  const it = acting(where);
  return { loaded: it?.loaded ?? false, account: it?.data?.account ?? false, state: it && !it.stopped ? it.state : null, problem: it?.problem ?? '' };
}

/** Starts signing in: TDLib starts for this space and asks for the phone number. */
export async function telegramBegin(): Promise<void> {
  const it = need();
  if (!it.data!.account) {
    it.data!.account = true;
    await keep(it);
  }
  await run(it);
}

export async function telegramPhone(phone: string): Promise<void> {
  await request(need(), phoneRequest(phone.replace(/[^\d+]/g, '')));
}

export async function telegramCode(code: string): Promise<void> {
  await request(need(), { '@type': 'checkAuthenticationCode', code: code.trim() });
}

export async function telegramPassword(password: string): Promise<void> {
  await request(need(), { '@type': 'checkAuthenticationPassword', password });
}

export async function telegramResendCode(): Promise<void> {
  await request(need(), { '@type': 'resendAuthenticationCode', reason: { '@type': 'resendCodeReasonUserRequest' } });
}

/**
 * Leaves Telegram in this space: `logOut` signs this device out at Telegram too; otherwise only
 * this phone forgets it (the device stays in Telegram's active sessions). Either way TDLib's folder
 * goes from the phone, and the ErevosGram encryption's keys with it.
 */
export async function telegramLeave(logOut: boolean): Promise<void> {
  const it = need();
  if (logOut && it.running) await request(it, { '@type': 'logOut' }).catch(() => undefined);
  if (native) await native.wipe(it.slot);
  it.running = false;
  it.state = newTgState();
  it.shown.clear();
  it.data = { account: false, seal: { seen: [], chats: {} } };
  await keep(it);
  told();
}

/** Loads more chats of a list, as the screen scrolls. */
export async function telegramMoreChats(list: TgList = 'main'): Promise<void> {
  const chatList = list === 'main' ? { '@type': 'chatListMain' } : list === 'archive' ? { '@type': 'chatListArchive' } : { '@type': 'chatListFolder', chat_folder_id: list };
  await request(need(), { '@type': 'loadChats', chat_list: chatList, limit: 50 }).catch((error: unknown) => {
    // 404: every chat of the list is here.
    if (!reason(error).includes('404')) throw error;
  });
}

/** Opens a chat: TDLib is told it is on screen, and its latest messages load. */
export async function telegramOpenChat(chatId: number): Promise<void> {
  const it = need();
  await request(it, { '@type': 'openChat', chat_id: chatId });
  await telegramOlder(chatId);
}

export async function telegramCloseChat(chatId: number): Promise<void> {
  await request(need(), { '@type': 'closeChat', chat_id: chatId }).catch(() => undefined);
}

/** Loads older messages of a chat; says how many came. */
export async function telegramOlder(chatId: number): Promise<number> {
  const it = need();
  const list = it.state.messages[chatId] ?? [];
  const from = list[0]?.id ?? 0;
  const page = await request(it, { '@type': 'getChatHistory', chat_id: chatId, from_message_id: from, offset: 0, limit: 50, only_local: false });
  const added = addHistory(it.state, chatId, page);
  for (const m of it.state.messages[chatId] ?? []) if (m.kind === 'text' && isWire(m.text)) void openWire(it, m);
  told();
  return added;
}

/** Marks messages read: Telegram tells the other side, as read receipts. */
export async function telegramRead(chatId: number, ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const it = need();
  readHere(it, chatId, Math.max(...ids));
  await request(it, { '@type': 'viewMessages', chat_id: chatId, message_ids: ids, force_read: true }).catch(() => undefined);
}

/**
 * Sends text: sealed when the chat has ErevosGram encryption, as it is otherwise. A chat that was
 * encrypted stays so while an invitation with other keys waits in it: anyone who can write into
 * the chat, Telegram too, can put one there, and it must not make what follows go in the clear.
 */
export async function telegramSend(chatId: number, text: string, replyTo?: number, preview = false): Promise<void> {
  const it = need();
  const info = (await it.seal.infos()).get(chatId);
  if (info?.sealed) await it.seal.send(chatId, text, replyTo);
  else await request(it, textRequest(chatId, text, replyTo, false, undefined, preview));
}

/**
 * Sends text for later: Telegram keeps it and sends it at `at` (ms), even with this phone off. Not
 * in a chat with ErevosGram encryption, as Telegram would have to send it sealed by this phone.
 */
export async function telegramSendLater(chatId: number, text: string, at: number, replyTo?: number, preview = false): Promise<void> {
  const it = need();
  if ((await it.seal.infos()).get(chatId)?.sealed) throw new Error('sealed');
  await request(it, textRequest(chatId, text, replyTo, false, Math.floor(at / 1000), preview));
}

/**
 * Leaves what was typed in a chat as its draft, or (empty) takes it away. Telegram keeps it on all
 * the account's devices, so a chat with ErevosGram encryption keeps none there (app/telegram-chat.tsx
 * keeps that one on this phone, while Erevos runs).
 */
export async function telegramSetDraft(chatId: number, text: string, where: NetworkWhere = 'space'): Promise<void> {
  const it = acting(where);
  if (!it || it.stopped || !it.data) return;
  if ((await it.seal.infos()).get(chatId)?.sealed) return;
  const draft = text.trim()
    ? { '@type': 'draftMessage', reply_to: null, date: Math.floor(Date.now() / 1000), content: { '@type': 'draftMessageContentText', text: { '@type': 'formattedText', ...entitiesOf(text) }, link_preview_options: null } }
    : null;
  await request(it, { '@type': 'setChatDraftMessage', chat_id: chatId, topic_id: null, draft_message: draft });
}

/** The last message of a chat at or before `at` (seconds), or null for none. */
export async function telegramMessageAt(chatId: number, at: number): Promise<TgMessage | null> {
  const it = need();
  const found = await request(it, { '@type': 'getChatMessageByDate', chat_id: chatId, date: at }).catch(() => null);
  return found ? readMessage(it.state, found) : null;
}

/** Sends again messages that could not be sent. */
export async function telegramResend(chatId: number, ids: number[]): Promise<void> {
  await request(need(), { '@type': 'resendMessages', chat_id: chatId, message_ids: ids, quote: null, paid_message_star_count: 0 });
}

/** Asks Telegram for the messages a chat has sent for later. */
export async function telegramLaterList(chatId: number): Promise<void> {
  const it = need();
  setLater(it.state, chatId, await request(it, { '@type': 'getChatScheduledMessages', chat_id: chatId }));
  told();
}

/** Sends a message kept for later at once. */
export async function telegramSendNow(chatId: number, id: number): Promise<void> {
  await request(need(), { '@type': 'editMessageSchedulingState', chat_id: chatId, message_id: id, scheduling_state: null });
}

/** What may be done with a message, as Telegram says for this account: what its menu offers. */
export type TgCan = { forMe: boolean; forAll: boolean; thread: boolean; pin: boolean };

/** Asks Telegram what may be done with each message; the ways open for all of them together. */
export async function telegramCan(chatId: number, ids: number[]): Promise<TgCan> {
  const it = need();
  const all: TgCan = { forMe: true, forAll: true, thread: true, pin: true };
  for (const id of ids) {
    const p = await request(it, { '@type': 'getMessageProperties', chat_id: chatId, message_id: id });
    all.forMe &&= p.can_be_deleted_only_for_self === true;
    all.forAll &&= p.can_be_deleted_for_all_users === true;
    all.thread &&= p.can_get_message_thread === true;
    all.pin &&= p.can_be_pinned === true;
  }
  return all;
}

/** Deletes messages, for everyone when `revoke`. */
export async function telegramDelete(chatId: number, ids: number[], revoke: boolean): Promise<void> {
  await request(need(), { '@type': 'deleteMessages', chat_id: chatId, message_ids: ids, revoke });
}

/**
 * Edits a message of ours. In a chat with ErevosGram encryption only what was sent before it began can
 * be edited: an encrypted one is a packet that Telegram cannot open, and changing it would send the new
 * words readable.
 */
export async function telegramEdit(chatId: number, messageId: number, text: string): Promise<void> {
  const it = need();
  const m = it.state.messages[chatId]?.find((x) => x.id === messageId);
  if (m && m.kind === 'text' && isWire(m.text)) throw new Error(t('An encrypted message cannot be edited.'));
  if ((await it.seal.infos()).get(chatId)?.sealed) throw new Error(t('In an encrypted chat, write a new message instead.'));
  await request(it, {
    '@type': 'editMessageText',
    chat_id: chatId,
    message_id: messageId,
    input_message_content: { '@type': 'inputMessageText', text: { '@type': 'formattedText', ...entitiesOf(text) }, link_preview_options: { '@type': 'linkPreviewOptions', is_disabled: true } },
  });
}

/** What a file sent to a Telegram chat is sent as: a photo, a video, or a file as it is. */
export type TgSendKind = 'photo' | 'video' | 'document';

/**
 * Sends a file of the phone (a path TDLib can read) to a chat, with words under it. Telegram can read
 * files even in a chat with ErevosGram encryption, which covers only text: the screen says so first.
 */
export async function telegramSendFile(chatId: number, path: string, kind: TgSendKind, caption = '', replyTo?: number, threadId?: number, spoiler = false): Promise<void> {
  const file = { '@type': 'inputFileLocal', path: path.replace(/^file:\/\//, '') };
  const text = { '@type': 'formattedText', ...entitiesOf(caption) };
  // This TDLib wraps each file in its own input object (inputPhoto, inputVideo, inputDocument).
  const content =
    kind === 'photo'
      ? { '@type': 'inputMessagePhoto', photo: { '@type': 'inputPhoto', photo: file, added_sticker_file_ids: [], width: 0, height: 0 }, caption: text, has_spoiler: spoiler }
      : kind === 'video'
        ? { '@type': 'inputMessageVideo', video: { '@type': 'inputVideo', video: file, added_sticker_file_ids: [], duration: 0, width: 0, height: 0, supports_streaming: true }, caption: text, has_spoiler: spoiler }
        : { '@type': 'inputMessageDocument', document: { '@type': 'inputDocument', document: file, disable_content_type_detection: false }, caption: text };
  await request(need(), {
    '@type': 'sendMessage',
    chat_id: chatId,
    ...topic(threadId),
    ...(replyTo ? { reply_to: { '@type': 'inputMessageReplyToMessage', message_id: replyTo } } : {}),
    input_message_content: content,
  });
}

/** Sends a message whose content is already made (lib/telegram-shares.ts): a place or a contact card. */
export async function telegramSendContent(chatId: number, content: Record<string, unknown>, replyTo?: number, threadId?: number): Promise<void> {
  await request(need(), {
    '@type': 'sendMessage',
    chat_id: chatId,
    ...topic(threadId),
    ...(replyTo ? { reply_to: { '@type': 'inputMessageReplyToMessage', message_id: replyTo } } : {}),
    input_message_content: content,
  });
}

/** A voice message recorded by the ErevosGram build (modules/erevos-telegram Voice.kt), as it sends it. */
export type TgVoiceOut = { path: string; seconds: number; waveform: string };

/** Sends a recorded voice message. Like a file, Telegram can read it even in an encrypted chat. */
export async function telegramSendVoice(chatId: number, voice: TgVoiceOut, replyTo?: number, threadId?: number): Promise<void> {
  await request(need(), {
    '@type': 'sendMessage',
    chat_id: chatId,
    ...topic(threadId),
    ...(replyTo ? { reply_to: { '@type': 'inputMessageReplyToMessage', message_id: replyTo } } : {}),
    input_message_content: {
      '@type': 'inputMessageVoiceNote',
      voice_note: { '@type': 'inputVoiceNote', voice_note: { '@type': 'inputFileLocal', path: voice.path.replace(/^file:\/\//, '') }, duration: voice.seconds, waveform: voice.waveform },
      caption: { '@type': 'formattedText', text: '', entities: [] },
    },
  });
}

// A message sent in a thread of a group (the replies to one of its messages), as TDLib names it.
const topic = (threadId?: number) => (threadId ? { topic_id: { '@type': 'messageTopicThread', message_thread_id: threadId } } : {});

/** Sends text in the thread of a group's message (its replies), or a channel post's comments. Groups have no ErevosGram encryption. */
export async function telegramSendInThread(chatId: number, threadId: number, text: string, replyTo?: number): Promise<void> {
  await request(need(), { ...textRequest(chatId, text, replyTo), ...topic(threadId) });
}

/**
 * The thread of a message: the replies to a group's message, or a channel post's comments (which live
 * in the channel's discussion group). Says in which chat the thread is, its first message's id there,
 * and its messages, oldest first.
 */
export async function telegramThread(chatId: number, messageId: number): Promise<{ chatId: number; threadId: number; messages: TgMessage[] }> {
  const it = need();
  const info = await request(it, { '@type': 'getMessageThread', chat_id: chatId, message_id: messageId });
  const at = Number(info.chat_id) || chatId;
  const threadId = Number(info.message_thread_id) || messageId;
  const page = await request(it, { '@type': 'getMessageThreadHistory', chat_id: at, message_id: threadId, from_message_id: 0, offset: 0, limit: 100 });
  const firsts = ((info.messages as unknown[] | undefined) ?? []).map((m) => readMessage(it.state, m)).filter(Boolean) as TgMessage[];
  const rest = ((page.messages as unknown[] | undefined) ?? []).map((m) => readMessage(it.state, m)).filter(Boolean) as TgMessage[];
  const byId = new Map<number, TgMessage>();
  for (const m of [...firsts, ...rest]) byId.set(m.id, m);
  return { chatId: at, threadId, messages: [...byId.values()].sort((a, b) => a.id - b.id) };
}

/** Gives a reaction (an emoji, or a custom emoji by its id) to a message, or takes ours back. */
export async function telegramReact(chatId: number, messageId: number, emoji: string, on: boolean, custom?: string): Promise<void> {
  const reaction = custom ? { '@type': 'reactionTypeCustomEmoji', custom_emoji_id: custom } : { '@type': 'reactionTypeEmoji', emoji };
  if (on) await request(need(), { '@type': 'addMessageReaction', chat_id: chatId, message_id: messageId, reaction_type: reaction, is_big: false, update_recent_reactions: true });
  else await request(need(), { '@type': 'removeMessageReaction', chat_id: chatId, message_id: messageId, reaction_type: reaction });
}

/** The emoji reactions this chat allows on a message, the most used first; a short default when Telegram says none. */
export async function telegramReactions(chatId: number, messageId: number): Promise<string[]> {
  const answer = await request(need(), { '@type': 'getMessageAvailableReactions', chat_id: chatId, message_id: messageId, row_size: 8 }).catch(() => null);
  const seen = new Set<string>();
  for (const key of ['top_reactions', 'recent_reactions', 'popular_reactions']) {
    for (const r of ((answer?.[key] as Record<string, any>[] | undefined) ?? [])) {
      if (r?.type?.['@type'] === 'reactionTypeEmoji' && r.needs_premium !== true && typeof r.type.emoji === 'string') seen.add(r.type.emoji);
    }
  }
  return seen.size || answer ? [...seen] : ['👍', '❤', '😂', '😮', '😢', '🙏', '🔥', '👎'];
}

/** Votes in a poll (the options by index; none takes the vote back). */
export async function telegramVote(chatId: number, messageId: number, options: number[]): Promise<void> {
  await request(need(), { '@type': 'setPollAnswer', chat_id: chatId, message_id: messageId, option_ids: options });
}

/** Closes a poll of ours: nobody can vote any more. */
export async function telegramClosePoll(chatId: number, messageId: number): Promise<void> {
  await request(need(), { '@type': 'stopPoll', chat_id: chatId, message_id: messageId, reply_markup: null });
}

/** A quiz: which option is the right one (by index), and what is said once someone answered. */
export type TgQuiz = { correct: number; explanation: string };

/**
 * Sends a poll (not in a private chat with a person, where Telegram has none). A quiz has one right
 * answer, one vote each, and no vote taken back.
 */
export async function telegramSendPoll(chatId: number, question: string, options: string[], anonymous: boolean, multiple: boolean, quiz?: TgQuiz): Promise<void> {
  const text = (words: string) => ({ '@type': 'formattedText', text: words, entities: [] });
  await request(need(), {
    '@type': 'sendMessage',
    chat_id: chatId,
    input_message_content: {
      '@type': 'inputMessagePoll',
      question: text(question),
      options: options.map((o) => ({ '@type': 'inputPollOption', text: text(o) })),
      is_anonymous: anonymous,
      allows_multiple_answers: quiz ? false : multiple,
      allows_revoting: !quiz,
      type: quiz
        ? { '@type': 'inputPollTypeQuiz', correct_option_ids: [quiz.correct], explanation: text(quiz.explanation), explanation_media: null }
        : { '@type': 'inputPollTypeRegular', allow_adding_options: false },
      open_period: 0,
      close_date: 0,
      is_closed: false,
    },
  });
}

// The custom emoji already asked for, by id: their pictures stay known while the app runs.
const customEmoji = new Map<string, TgSticker>();

/**
 * The pictures of custom emoji (those of reactions), by id: asked of Telegram once each. One Telegram
 * does not give is left out.
 */
export async function telegramCustomEmoji(ids: string[]): Promise<Map<string, TgSticker>> {
  const it = need();
  const missing = [...new Set(ids)].filter((id) => !customEmoji.has(id));
  if (missing.length) {
    const answer = await request(it, { '@type': 'getCustomEmojiStickers', custom_emoji_ids: missing }).catch(() => null);
    for (const raw of (answer?.stickers as Record<string, any>[] | undefined) ?? []) {
      const id = String(raw?.full_type?.custom_emoji_id ?? '');
      const m = readMessage(it.state, { id: 1, chat_id: 1, content: { '@type': 'messageSticker', sticker: raw } });
      if (id && m?.file !== undefined) customEmoji.set(id, { file: m.file, thumb: m.thumb, emoji: m.text, animated: !!m.animated });
    }
  }
  const out = new Map<string, TgSticker>();
  for (const id of ids) {
    const found = customEmoji.get(id);
    if (found) out.set(id, found);
  }
  return out;
}

/** One of the account's sticker packs. */
export type TgStickerSet = { id: string; title: string };
/** A sticker of a pack: the file to show and send, its emoji, and whether it moves (then its still picture shows). */
export type TgSticker = { file: number; thumb?: number; emoji: string; animated: boolean };

/** The sticker packs the account has added, in its order. */
export async function telegramStickerSets(): Promise<TgStickerSet[]> {
  const answer = await request(need(), { '@type': 'getInstalledStickerSets', sticker_type: { '@type': 'stickerTypeRegular' } });
  return ((answer.sets as Record<string, unknown>[] | undefined) ?? []).map((x) => ({ id: String(x.id), title: String(x.title ?? '') }));
}

/** The stickers of a pack; their files come to the phone as asked for (telegramDownload). */
export async function telegramStickers(setId: string): Promise<TgSticker[]> {
  const it = need();
  const answer = await request(it, { '@type': 'getStickerSet', set_id: setId });
  const out: TgSticker[] = [];
  for (const raw of (answer.stickers as unknown[] | undefined) ?? []) {
    // Read as a message's sticker would be, so its files are kept and come with updateFile.
    const m = readMessage(it.state, { id: 1, chat_id: 1, content: { '@type': 'messageSticker', sticker: raw } });
    if (m?.file !== undefined) out.push({ file: m.file, thumb: m.thumb, emoji: m.text, animated: !!m.animated });
  }
  return out;
}

/** Sends a sticker the account has (by its file). Telegram can read it even in an encrypted chat. */
export async function telegramSendSticker(chatId: number, file: number, emoji = '', replyTo?: number, threadId?: number): Promise<void> {
  await request(need(), {
    '@type': 'sendMessage',
    chat_id: chatId,
    ...topic(threadId),
    ...(replyTo ? { reply_to: { '@type': 'inputMessageReplyToMessage', message_id: replyTo } } : {}),
    input_message_content: { '@type': 'inputMessageSticker', sticker: { '@type': 'inputSticker', sticker: { '@type': 'inputFileId', id: file }, width: 0, height: 0 }, emoji },
  });
}

/**
 * Sends a sticker made on this phone (an Erevos sticker as a 512×512 WebP: lib/telegram-out.ts) from
 * its file. Telegram can read it even in an encrypted chat.
 */
export async function telegramSendStickerFile(chatId: number, path: string, emoji = '', replyTo?: number, threadId?: number): Promise<void> {
  await request(need(), {
    '@type': 'sendMessage',
    chat_id: chatId,
    ...topic(threadId),
    ...(replyTo ? { reply_to: { '@type': 'inputMessageReplyToMessage', message_id: replyTo } } : {}),
    input_message_content: { '@type': 'inputMessageSticker', sticker: { '@type': 'inputSticker', sticker: { '@type': 'inputFileLocal', path: path.replace(/^file:\/\//, '') }, width: 512, height: 512 }, emoji },
  });
}

/** Pins a message at the top of its chat (for everyone, or for us alone in a private chat), or unpins it. */
export async function telegramPinMessage(chatId: number, messageId: number, on: boolean, onlyForMe = false): Promise<void> {
  if (on) await request(need(), { '@type': 'pinChatMessage', chat_id: chatId, message_id: messageId, disable_notification: false, only_for_self: onlyForMe });
  else await request(need(), { '@type': 'unpinChatMessage', chat_id: chatId, message_id: messageId });
}

/**
 * The messages pinned in a chat, the newest first (as Telegram shows them at the top, one at a time).
 * When the search finds none, the one Telegram says is pinned at the top, if any.
 */
export async function telegramPinned(chatId: number): Promise<TgMessage[]> {
  const it = need();
  const found = await request(it, {
    '@type': 'searchChatMessages',
    chat_id: chatId,
    topic_id: null,
    query: '',
    sender_id: null,
    from_message_id: 0,
    offset: 0,
    limit: 100,
    filter: { '@type': 'searchMessagesFilterPinned' },
  }).catch(() => null);
  const list = ((found?.messages as unknown[] | undefined) ?? []).map((m) => readMessage(it.state, m)).filter(Boolean) as TgMessage[];
  if (list.length) return list.sort((a, b) => b.id - a.id);
  const top = await request(it, { '@type': 'getChatPinnedMessage', chat_id: chatId }).catch(() => null);
  const one = top ? readMessage(it.state, top) : null;
  return one ? [one] : [];
}

/** One who is in a group or channel, and what they are there; an admin's rights, and whether we may change them. */
export type TgMember = { user: number; role: 'owner' | 'admin' | 'member' | 'restricted' | 'left' | 'banned'; rights?: TgRights; editable?: boolean };

/** What an admin of a group or channel may do (the rights Telegram's apps show). */
export type TgRights = {
  changeInfo: boolean;
  postMessages: boolean;
  editMessages: boolean;
  deleteMessages: boolean;
  banUsers: boolean;
  inviteUsers: boolean;
  pinMessages: boolean;
  manageVideoChats: boolean;
  addAdmins: boolean;
  anonymous: boolean;
};

const RIGHTS: [keyof TgRights, string][] = [
  ['changeInfo', 'can_change_info'],
  ['postMessages', 'can_post_messages'],
  ['editMessages', 'can_edit_messages'],
  ['deleteMessages', 'can_delete_messages'],
  ['banUsers', 'can_restrict_members'],
  ['inviteUsers', 'can_invite_users'],
  ['pinMessages', 'can_pin_messages'],
  ['manageVideoChats', 'can_manage_video_chats'],
  ['addAdmins', 'can_promote_members'],
  ['anonymous', 'is_anonymous'],
];

/** The rights a new admin gets at first, as Telegram's apps give them: all but adding admins and staying anonymous. */
export function defaultRights(channel: boolean): TgRights {
  return { changeInfo: true, postMessages: channel, editMessages: channel, deleteMessages: true, banUsers: !channel, inviteUsers: true, pinMessages: !channel, manageVideoChats: true, addAdmins: false, anonymous: false };
}

/** An owner has every right. */
const ALL_RIGHTS: TgRights = { changeInfo: true, postMessages: true, editMessages: true, deleteMessages: true, banUsers: true, inviteUsers: true, pinMessages: true, manageVideoChats: true, addAdmins: true, anonymous: false };

export function readRights(v: unknown): TgRights {
  const r = (v ?? {}) as Record<string, unknown>;
  return Object.fromEntries(RIGHTS.map(([key, name]) => [key, r[name] === true])) as TgRights;
}

function memberOf(raw: Record<string, any>): TgMember {
  const role = roleOf(raw.status);
  return {
    user: Number(raw.member_id.user_id),
    role,
    ...(role === 'admin' ? { rights: readRights(raw.status?.rights), editable: raw.status?.can_be_edited === true } : {}),
    ...(role === 'owner' ? { rights: ALL_RIGHTS } : {}),
  };
}

function roleOf(status: unknown): TgMember['role'] {
  switch ((status as { '@type'?: string } | undefined)?.['@type']) {
    case 'chatMemberStatusCreator':
      return 'owner';
    case 'chatMemberStatusAdministrator':
      return 'admin';
    case 'chatMemberStatusRestricted':
      return 'restricted';
    case 'chatMemberStatusLeft':
      return 'left';
    case 'chatMemberStatusBanned':
      return 'banned';
    default:
      return 'member';
  }
}

/** The people in a group or channel (as many as Telegram lets us see), and our own role there. */
export async function telegramMembers(chatId: number): Promise<{ members: TgMember[]; me: TgMember['role']; rights?: TgRights }> {
  const it = need();
  const chat = it.state.chats[chatId];
  if (!chat?.group) return { members: [], me: 'member' };
  const answer = chat.group.basic
    ? await request(it, { '@type': 'getBasicGroupFullInfo', basic_group_id: chat.group.id })
    : await request(it, { '@type': 'getSupergroupMembers', supergroup_id: chat.group.id, filter: { '@type': 'supergroupMembersFilterRecent' }, offset: 0, limit: 200 });
  const members: TgMember[] = [];
  for (const raw of (answer.members as Record<string, any>[] | undefined) ?? []) {
    if (raw?.member_id?.['@type'] !== 'messageSenderUser') continue;
    members.push(memberOf(raw));
  }
  const mine = await request(it, { '@type': 'getChatMember', chat_id: chatId, member_id: { '@type': 'messageSenderUser', user_id: it.state.me } }).catch(() => null);
  if (!mine) return { members, me: 'member' };
  const me = memberOf({ ...mine, member_id: { user_id: it.state.me } });
  return { members, me: me.role, ...(me.rights ? { rights: me.rights } : {}) };
}

/** Renames a group or channel (for those allowed to change its info). */
export async function telegramSetTitle(chatId: number, title: string): Promise<void> {
  await request(need(), { '@type': 'setChatTitle', chat_id: chatId, title });
}

/** Changes a group's or channel's description. */
export async function telegramSetDescription(chatId: number, description: string): Promise<void> {
  await request(need(), { '@type': 'setChatDescription', chat_id: chatId, description });
}

/**
 * Adds a person (by their Telegram user id, one we know) to a group or channel. Their privacy settings
 * can say no: then it throws, and they can be sent the invite link instead.
 */
export async function telegramAddMember(chatId: number, userId: number): Promise<void> {
  const answer = await request(need(), { '@type': 'addChatMember', chat_id: chatId, user_id: userId, forward_limit: 100 });
  if (((answer.failed_to_add_members as unknown[] | undefined) ?? []).length) throw new Error(t('Their privacy settings do not let you add them. Send them the invite link instead.'));
}

/**
 * Makes a member an admin with these rights (or changes an admin's rights), or makes an admin a plain
 * member again. Only an owner, or an admin allowed to add admins, can; and only for admins they made.
 */
export async function telegramSetAdmin(chatId: number, userId: number, rights: TgRights | null): Promise<void> {
  const status = rights
    ? { '@type': 'chatMemberStatusAdministrator', can_be_edited: true, rights: { '@type': 'chatAdministratorRights', can_manage_chat: true, ...Object.fromEntries(RIGHTS.map(([key, name]) => [name, rights[key]])) } }
    : { '@type': 'chatMemberStatusMember', member_until_date: 0 };
  await request(need(), { '@type': 'setChatMemberStatus', chat_id: chatId, member_id: { '@type': 'messageSenderUser', user_id: userId }, status });
}

/** The account's contacts whose names match (all of them, for no words), to add to a group. */
export async function telegramContacts(query = ''): Promise<number[]> {
  const answer = await request(need(), { '@type': 'searchContacts', query: query.trim(), limit: 200 });
  return ((answer.user_ids as unknown[] | undefined) ?? []).map(Number).filter(Number.isFinite);
}

/** Removes someone from a group or channel: banned, so they cannot come back by a link, until unbanned. */
export async function telegramRemoveMember(chatId: number, userId: number): Promise<void> {
  await request(need(), { '@type': 'setChatMemberStatus', chat_id: chatId, member_id: { '@type': 'messageSenderUser', user_id: userId }, status: { '@type': 'chatMemberStatusBanned', banned_until_date: 0 } });
}

/** Finds a person or a public chat by their @name: the chat to open with them, or null. */
export async function telegramFindByName(username: string): Promise<number | null> {
  const answer = await request(need(), { '@type': 'searchPublicChat', username: username.replace(/^@/, '').trim() }).catch(() => null);
  return answer && typeof answer.id === 'number' ? answer.id : null;
}

/** The chat with a person (made if there is none yet), to open it. */
export async function telegramChatWith(userId: number): Promise<number> {
  const answer = await request(need(), { '@type': 'createPrivateChat', user_id: userId, force: false });
  return Number(answer.id);
}

/** Where a Telegram link of its own goes: a chat (and a message in it), or an invitation to one not joined yet. */
export type TgLinkTarget = { kind: 'chat'; chatId: number; at?: number } | { kind: 'invite'; link: string; title: string; members: number };

/**
 * Where a t.me, telegram.me or tg: link goes, asked of Telegram: a public chat or person by its
 * @name, a message by its link, an invitation (a chat already joined opens). Null for one this
 * does not open, which then opens in the browser, as other links do.
 */
export async function telegramLinkTarget(url: string): Promise<TgLinkTarget | null> {
  const it = need();
  const link = /^[a-z]+:/i.test(url) ? url : `https://${url}`;
  const type = await request(it, { '@type': 'getInternalLinkType', link }).catch(() => null);
  if (!type) return null;
  switch (type['@type']) {
    case 'internalLinkTypePublicChat': {
      const chat = await request(it, { '@type': 'searchPublicChat', username: String(type.chat_username ?? '') });
      return { kind: 'chat', chatId: Number(chat.id) };
    }
    case 'internalLinkTypeMessage': {
      const info = await request(it, { '@type': 'getMessageLinkInfo', url: String(type.url ?? link) });
      const message = info.message as { id?: number } | null | undefined;
      return Number(info.chat_id) ? { kind: 'chat', chatId: Number(info.chat_id), ...(message?.id ? { at: Number(message.id) } : {}) } : null;
    }
    case 'internalLinkTypeChatInvite': {
      const invite = String(type.invite_link ?? link);
      const info = await request(it, { '@type': 'checkChatInviteLink', invite_link: invite });
      if (Number(info.chat_id) && Number(info.accessible_for ?? 0) === 0) return { kind: 'chat', chatId: Number(info.chat_id) };
      return { kind: 'invite', link: invite, title: String(info.title ?? ''), members: Number(info.member_count ?? 0) };
    }
    default:
      return null;
  }
}

/** Joins a chat by its invitation: its id, or 0 when its admins must let the account in first. */
export async function telegramJoinInvite(link: string): Promise<number> {
  const result = await request(need(), { '@type': 'joinChatByInviteLink', invite_link: link });
  return result['@type'] === 'chatJoinResultSuccess' ? Number(result.chat_id) : result['@type'] === 'chat' ? Number(result.id) : 0;
}

/** Sends messages on to another chat, as Telegram forwards them (with who wrote them). */
export async function telegramForward(fromChatId: number, ids: number[], toChatId: number): Promise<void> {
  ids = [...ids].sort((a, b) => a - b);
  await request(need(), { '@type': 'forwardMessages', chat_id: toChatId, from_chat_id: fromChatId, message_ids: ids, send_copy: false, remove_caption: false });
}

/** Mutes a chat for good, or unmutes it; Telegram keeps it for every device. */
export async function telegramMuteChat(chatId: number, on: boolean): Promise<void> {
  await request(need(), {
    '@type': 'setChatNotificationSettings',
    chat_id: chatId,
    notification_settings: { '@type': 'chatNotificationSettings', use_default_mute_for: false, mute_for: on ? 2147483647 : 0, use_default_sound: true, use_default_show_preview: true, show_preview: true, use_default_mute_stories: true, use_default_story_sound: true, use_default_show_story_poster: true, use_default_disable_pinned_message_notifications: true, use_default_disable_mention_notifications: true },
  });
}

/** Pins a chat at the top of the main list, or unpins it. */
export async function telegramPinChat(chatId: number, on: boolean): Promise<void> {
  await request(need(), { '@type': 'toggleChatIsPinned', chat_list: { '@type': 'chatListMain' }, chat_id: chatId, is_pinned: on });
}

/** Marks a chat unread by hand, or read: its last message is marked seen, which Telegram tells them. */
export async function telegramMarkUnread(chatId: number, unread: boolean): Promise<void> {
  const it = need();
  if (!unread) {
    const last = it.state.chats[chatId]?.last;
    if (last) await request(it, { '@type': 'viewMessages', chat_id: chatId, message_ids: [last.id], force_read: true }).catch(() => undefined);
  }
  await request(it, { '@type': 'toggleChatIsMarkedAsUnread', chat_id: chatId, is_marked_as_unread: unread });
}

/**
 * Marks a chat read as Telegram's "Mark as read" does: its messages up to its last are marked seen
 * (which Telegram tells the others), its mentions and reactions too, and one marked unread by hand
 * is not any more. For "Mark all as read" (lib/read-all.ts).
 */
export async function telegramReadChat(chatId: number): Promise<void> {
  const it = need();
  const c = it.state.chats[chatId];
  if (!c) throw new Error('no such chat');
  if (c.unread > 0 && c.last) {
    readHere(it, c.id, c.last.id);
    await request(it, { '@type': 'viewMessages', chat_id: c.id, message_ids: [c.last.id], source: null, force_read: true });
  }
  await request(it, { '@type': 'readAllChatMentions', chat_id: c.id }).catch(() => undefined);
  await request(it, { '@type': 'readAllChatReactions', chat_id: c.id }).catch(() => undefined);
  if (c.markedUnread) await request(it, { '@type': 'toggleChatIsMarkedAsUnread', chat_id: c.id, is_marked_as_unread: false });
}

/** Moves a chat to the archive, or back to the main list. */
export async function telegramArchiveChat(chatId: number, on: boolean): Promise<void> {
  await request(need(), { '@type': 'addChatToList', chat_id: chatId, chat_list: { '@type': on ? 'chatListArchive' : 'chatListMain' } });
}

/** Puts a chat in one of the account's folders, or takes it out: Telegram changes the folder for every device. */
export async function telegramChatInFolder(chatId: number, folderId: number, on: boolean): Promise<void> {
  const it = need();
  const answer = await request(it, { '@type': 'getChatFolder', chat_folder_id: folderId });
  const ids = new Set(((answer.included_chat_ids as number[] | undefined) ?? []).map(Number));
  const pinned = new Set(((answer.pinned_chat_ids as number[] | undefined) ?? []).map(Number));
  const excluded = new Set(((answer.excluded_chat_ids as number[] | undefined) ?? []).map(Number));
  if (on) {
    ids.add(chatId);
    excluded.delete(chatId);
  } else {
    ids.delete(chatId);
    pinned.delete(chatId);
    // A chat the folder takes in by its kind (all groups, say) is left out by name.
    if (it.state.chats[chatId]?.folders?.[folderId] !== undefined) excluded.add(chatId);
  }
  const { '@extra': _extra, ...folder } = answer;
  await request(it, { '@type': 'editChatFolder', chat_folder_id: folderId, folder: { ...folder, included_chat_ids: [...ids], pinned_chat_ids: [...pinned].filter((id) => ids.has(id)), excluded_chat_ids: [...excluded] } });
}

/** Blocks the other person of a private chat (they can no longer write or call), or unblocks them. */
export async function telegramBlock(chatId: number, on: boolean): Promise<void> {
  const it = need();
  const chat = it.state.chats[chatId];
  const sender = chat?.userId ? { '@type': 'messageSenderUser', user_id: chat.userId } : { '@type': 'messageSenderChat', chat_id: chatId };
  await request(it, { '@type': 'setMessageSenderBlockList', sender_id: sender, block_list: on ? { '@type': 'blockListMain' } : null });
}

/** Deletes every message of a chat for us, or in a private chat for both when `revoke`; the chat stays. */
export async function telegramClearChat(chatId: number, revoke: boolean): Promise<void> {
  await request(need(), { '@type': 'deleteChatHistory', chat_id: chatId, remove_from_chat_list: false, revoke });
  const it = need();
  it.state.messages[chatId] = [];
  told();
}

/** Leaves a group or a channel, or deletes a private chat (for both when `revoke`); it goes from the lists. */
export async function telegramDeleteChat(chatId: number, revoke: boolean): Promise<void> {
  const it = need();
  const chat = it.state.chats[chatId];
  if (chat?.type === 'group' || chat?.type === 'channel') await request(it, { '@type': 'leaveChat', chat_id: chatId });
  else if (chat?.type === 'secret' && chat.secretId) await request(it, { '@type': 'closeSecretChat', secret_chat_id: chat.secretId }).catch(() => undefined);
  await request(it, { '@type': 'deleteChatHistory', chat_id: chatId, remove_from_chat_list: true, revoke: revoke && chat?.type === 'private' }).catch(() => undefined);
}

/** Sets after how long new messages in a chat delete themselves for both sides (0: never). */
export async function telegramAutoDelete(chatId: number, seconds: number): Promise<void> {
  await request(need(), { '@type': 'setChatMessageAutoDeleteTime', chat_id: chatId, message_auto_delete_time: seconds });
}

/** What Telegram tells of a person or of a group beyond its chat: as its info screen shows it. */
export type TgInfo = {
  /** A person's own words about them, or a group's or channel's description. */
  about: string;
  /** How many are in a group or a channel, when Telegram says. */
  members?: number;
  /** How many groups we share with a person. */
  commonGroups?: number;
  /** A group's or channel's public link name, or a person's. */
  username?: string;
  /** A group's invite link, when we may see it. */
  invite?: string;
};

/** Asks Telegram for a chat's info: a person's bio and the groups in common, or a group's description and members. */
export async function telegramInfo(chatId: number): Promise<TgInfo> {
  const it = need();
  const chat = it.state.chats[chatId];
  if (!chat) throw new Error(t('This Telegram chat is not here any more.'));
  if (chat.userId) {
    const full = await request(it, { '@type': 'getUserFullInfo', user_id: chat.userId });
    const bio = full.bio as { text?: string } | undefined;
    return { about: typeof bio?.text === 'string' ? bio.text : '', commonGroups: Number(full.group_in_common_count) || 0, username: it.state.users[chat.userId]?.username || undefined };
  }
  if (chat.group) {
    const full = chat.group.basic
      ? await request(it, { '@type': 'getBasicGroupFullInfo', basic_group_id: chat.group.id })
      : await request(it, { '@type': 'getSupergroupFullInfo', supergroup_id: chat.group.id });
    const group = chat.group.basic ? null : await request(it, { '@type': 'getSupergroup', supergroup_id: chat.group.id }).catch(() => null);
    const names = (group?.usernames as { active_usernames?: string[] } | undefined)?.active_usernames;
    const members = chat.group.basic ? ((full.members as unknown[] | undefined) ?? []).length : Number(full.member_count) || Number(group?.member_count) || undefined;
    const link = (full.invite_link as { invite_link?: string } | undefined)?.invite_link;
    return { about: String(full.description ?? ''), members, username: names?.[0], invite: typeof link === 'string' && link.startsWith('https://') ? link : undefined };
  }
  return { about: '' };
}

/** Finds messages of a chat with these words in them, newest first; their messages are kept with the chat's. */
/** A kind of a chat's messages, as its Media, links and files shows them apart. */
export type TgMediaKind = 'photo' | 'video' | 'voice' | 'document' | 'link';

const MEDIA_FILTERS: Record<TgMediaKind, string> = {
  photo: 'searchMessagesFilterPhoto',
  video: 'searchMessagesFilterVideo',
  voice: 'searchMessagesFilterVoiceNote',
  document: 'searchMessagesFilterDocument',
  link: 'searchMessagesFilterUrl',
};

export async function telegramSearch(chatId: number, query: string, kind?: TgMediaKind): Promise<TgMessage[]> {
  const it = need();
  const filter = kind ? { '@type': MEDIA_FILTERS[kind] } : null;
  const answer = await request(it, { '@type': 'searchChatMessages', chat_id: chatId, query, sender_id: null, from_message_id: 0, offset: 0, limit: kind ? 100 : 50, filter, topic_id: null });
  return (((answer.messages as unknown[] | undefined) ?? []).map((m) => readMessage(it.state, m)).filter(Boolean) as TgMessage[]);
}

/** Starts downloading a file; its path comes with the file's update. */
export async function telegramDownload(fileId: number): Promise<void> {
  await request(need(), { '@type': 'downloadFile', file_id: fileId, priority: 16, offset: 0, limit: 0, synchronous: false });
}

/** What a message shows: its own text, or what an ErevosGram packet carried once opened. */
export function telegramShown(chatId: number, m: TgMessage, where: NetworkWhere = 'space'): Shown | null {
  if (m.kind !== 'text' || !isWire(m.text)) return null;
  return acting(where)?.shown.get(`${chatId}:${m.id}`) ?? { kind: 'unreadable' };
}

/** Where the ErevosGram encryption stands in each chat that has begun it. */
export function telegramSeals(): Promise<Map<number, SealInfo>> {
  return need().seal.infos();
}

export const telegramInvite = (chatId: number) => need().seal.invite(chatId);
export const telegramAccept = (chatId: number) => need().seal.accept(chatId);
export const telegramDecline = (chatId: number) => need().seal.decline(chatId);
export const telegramSafetyNumber = (chatId: number) => need().seal.safetyNumber(chatId);
export const telegramVerified = (chatId: number, verified: boolean) => need().seal.setVerified(chatId, verified);

/** Takes in what the ErevosGram app kept of its encryption (lib/telegram-seal.ts adopt). */
export const telegramAdopt = (from: Parameters<TelegramSeal['adopt']>[0], replace = false) => need().seal.adopt(from, replace);

/** How many messages are not read in the space's Telegram chats that notify (unreadAt), muted ones left out. */
export function telegramUnread(): number {
  if (!live || live.stopped) return 0;
  return [...unreadAt(live).values()].reduce((sum, n) => sum + n, 0);
}

// Each chat's messages not read, by its home row (lib/inbox.ts): the main list's, a muted one's left out.
addNetwork('telegram:', {
  unread: () => (live && !live.stopped ? unreadAt(live) : new Map()),
  notifyOf: (where) => (live && !live.stopped ? chatNotify(live, where) : null),
});

/** The Telegram call going on, ringing, or just ended, of the space (or the open hidden place). */
export function telegramCallNow(where: NetworkWhere = 'space'): TgCall | null {
  const it = acting(where);
  return it && !it.stopped ? it.calls.current() : null;
}

/** Whether calls can have sound in this build. */
export const telegramCanCall = () => callSound() !== null;

// The call of the space or of the open hidden place (`where`), as the call screen shows it.
function calling(where?: NetworkWhere): TelegramCalls {
  const it = acting(where);
  if (!it || it.stopped) throw new Error(t('Telegram is not running in this space.'));
  return it.calls;
}

export const telegramCall = (userId: number, where?: NetworkWhere, video = false) => calling(where).call(userId, video);
export const telegramAnswer = (callId: number, where?: NetworkWhere, camera = false) => calling(where).answer(callId, camera);
export const telegramCamera = (on: boolean, where?: NetworkWhere) => calling(where).camera(on);
export const telegramSwitchCamera = (where?: NetworkWhere) => calling(where).switchCamera();
export const telegramHangUp = (callId: number, where?: NetworkWhere) => calling(where).hangUp(callId);
export const telegramMute = (on: boolean, where?: NetworkWhere) => calling(where).mute(on);
/** Lets go of an ended call once shown; nothing when its Telegram has stopped. */
export function telegramForgetCall(callId: number, where?: NetworkWhere): void {
  const it = acting(where);
  if (it && !it.stopped) it.calls.forget(callId);
}

/** The folders of this space's Telegram chosen on this phone (by id), in the account's order: each is a tab
 *  on home and in the Telegram screen, and while any is chosen only their chats notify. */
export function telegramHomeFolders(where: NetworkWhere = 'space'): number[] {
  const it = acting(where);
  return it ? chosenFolders(it) : [];
}

// The chosen folders that the account still has, in its order.
function chosenFolders(it: Live): number[] {
  const chosen = new Set(it.data?.homeFolders ?? []);
  return it.state.folders.filter((f) => chosen.has(f.id)).map((f) => f.id);
}

/** Chooses one of the account's Telegram folders for home, or leaves it out; Telegram keeps it either way. */
export async function telegramSetHomeFolder(id: number, on: boolean): Promise<void> {
  const it = need();
  const chosen = new Set(it.data!.homeFolders ?? []);
  if (on) chosen.add(id);
  else chosen.delete(id);
  if (chosen.size) it.data!.homeFolders = [...chosen].sort((a, b) => a - b);
  else delete it.data!.homeFolders;
  await keep(it);
  // Its chats come once asked for, as the main list's did.
  if (on) void request(it, { '@type': 'loadChats', chat_list: { '@type': 'chatListFolder', chat_folder_id: id }, limit: 100 }).catch(() => undefined);
  hear(it, true);
  told();
}

/** The PIN a chat of the space's Telegram is locked with (lock/chat-pin.ts), or undefined. A hidden place's chats have none. */
export function telegramChatPin(chatId: number, where: NetworkWhere = 'space'): ChatPin | undefined {
  return where === 'space' ? live?.data?.pins?.[String(chatId)] : undefined;
}

/** The chats of the space's Telegram locked with a PIN of their own. */
export function telegramLockedChats(where: NetworkWhere = 'space'): ReadonlySet<number> {
  return new Set(where === 'space' ? Object.keys(live?.data?.pins ?? {}).map(Number) : []);
}

/** Locks a chat of the space's Telegram with a PIN of its own, or (null) takes it off. Kept on this phone only. */
export async function telegramSetChatPin(chatId: number, pin: ChatPin | null): Promise<void> {
  const it = live;
  if (!it || it.stopped || !it.data) throw new Error(t('Telegram is not running in this space.'));
  const pins = { ...it.data.pins };
  if (pin) pins[String(chatId)] = pin;
  else delete pins[String(chatId)];
  if (Object.keys(pins).length) it.data.pins = pins;
  else delete it.data.pins;
  await keep(it);
  told();
}

/** The messages of a chat starred on this phone (a message's menu → Star). */
export function telegramStars(chatId: number, where: NetworkWhere = 'space'): ReadonlySet<number> {
  return new Set(acting(where)?.data?.stars?.[String(chatId)] ?? []);
}

// A chat's own notifications on this phone, by its home row (telegram:<id>).
function chatNotify(it: Live, where: string): ChatNotify | null {
  return it.data?.notify?.[where.slice('telegram:'.length)] ?? null;
}

/** A chat's own notifications on this phone (lock/chat-notify.ts). */
export function telegramChatNotify(chatId: number, where: NetworkWhere = 'space'): ChatNotify | null {
  return acting(where)?.data?.notify?.[String(chatId)] ?? null;
}

/** Sets a chat's own notifications on this phone, or (null) the app's again; Telegram knows nothing of them. */
export async function telegramSetChatNotify(chatId: number, next: ChatNotify | null, where: NetworkWhere = 'space'): Promise<void> {
  const it = acting(where);
  if (!it || it.stopped || !it.data) throw new Error(t('Telegram is not running in this space.'));
  const all = { ...it.data.notify };
  if (next) all[String(chatId)] = next;
  else delete all[String(chatId)];
  if (Object.keys(all).length) it.data.notify = all;
  else delete it.data.notify;
  await keep(it);
  told();
}

/** Whether a chat keeps out of screenshots on this phone. */
export function telegramShots(chatId: number, where: NetworkWhere = 'space'): boolean {
  return acting(where)?.data?.shots?.includes(chatId) ?? false;
}

/** Makes a chat keep out of screenshots on this phone, or not; Telegram and the other side know nothing of it. */
export async function telegramSetShots(chatId: number, on: boolean, where: NetworkWhere = 'space'): Promise<void> {
  const it = acting(where);
  if (!it || it.stopped || !it.data) throw new Error(t('Telegram is not running in this space.'));
  const ids = new Set(it.data.shots ?? []);
  if (on) ids.add(chatId);
  else ids.delete(chatId);
  if (ids.size) it.data.shots = [...ids];
  else delete it.data.shots;
  await keep(it);
  told();
}

/** Stars a message on this phone, or takes its star off; Telegram knows nothing of it. */
export async function telegramSetStar(chatId: number, messageId: number, on: boolean): Promise<void> {
  const it = need();
  const stars = { ...it.data!.stars };
  const ids = new Set(stars[String(chatId)] ?? []);
  if (on) ids.add(messageId);
  else ids.delete(messageId);
  if (ids.size) stars[String(chatId)] = [...ids];
  else delete stars[String(chatId)];
  if (Object.keys(stars).length) it.data!.stars = stars;
  else delete it.data!.stars;
  await keep(it);
  told();
}

/**
 * The starred messages of the space's Telegram, as the home screen's Starred messages lists them:
 * none of a chat locked with its PIN, nor of one kept in hidden chats. Asked of Telegram one by one;
 * one it no longer has is left out.
 */
export async function telegramStarredMessages(): Promise<{ chat: string; message: TgMessage }[]> {
  const it = live;
  if (!it?.data?.stars || !it.running) return [];
  const away = new Set([...(it.data.away ?? []), ...Object.keys(it.data.pins ?? {}).map(Number)]);
  const out: { chat: string; message: TgMessage }[] = [];
  for (const [chat, ids] of Object.entries(it.data.stars)) {
    const chatId = Number(chat);
    if (away.has(chatId)) continue;
    for (const id of ids) {
      const got = await request(it, { '@type': 'getMessage', chat_id: chatId, message_id: id }).catch(() => null);
      const message = got ? readMessage(it.state, got) : null;
      if (message) out.push({ chat: it.state.chats[chatId]?.title ?? '', message });
    }
  }
  return out.sort((a, b) => b.message.date - a.message.date);
}

/** The chats of the space's Telegram kept in hidden chats: they show only there. */
export function telegramAwayChats(): ReadonlySet<number> {
  return new Set(live?.data?.away ?? []);
}

/** The chats of the space's Telegram kept in the open hidden chats, shown among them. */
export function telegramKeptChats(): number[] {
  const place = places.shown();
  return place && live?.data ? (place.data?.fromSpace ?? []) : [];
}

// Changes the Telegram value of the hidden place in `pocket`, open with `key`: through its account
// while that runs, as it writes the whole value, or else as it is kept.
async function changePlace(space: number, place: { pocket: number; key: Uint8Array }, change: (data: TelegramData) => void): Promise<void> {
  const running = places.running(space, place.pocket, place.key);
  if (running?.data) {
    change(running.data);
    await keep(running);
    return;
  }
  const holder = hiddenHolder(place.pocket);
  const data = await loadTelegram(space, place.key, holder);
  change(data);
  await saveTelegram(space, place.key, data, holder);
}

/**
 * Keeps a chat of the space's Telegram in the hidden chats that `pin` opens, as ErevosGram did: it
 * leaves the space's lists and its count, and shows only among those hidden chats, opened with their
 * PIN. Telegram itself knows nothing of it: the account still has the chat, on every device. The
 * space keeps only which chats are away, sealed with its key; which hidden chats keep them only
 * they know. False when the PIN opens none.
 */
export async function telegramHideChat(chatId: number, pin: string): Promise<boolean> {
  const it = live;
  if (!it || it.stopped || !it.data) throw new Error(t('Telegram is not running in this space.'));
  // Tried as the home screen's search tries it, its wrong tries counted with those.
  const place = await searchHidden(it.space, pin);
  if (!place) return false;
  await changePlace(it.space, place, (data) => {
    data.fromSpace = [...new Set([...(data.fromSpace ?? []), chatId])];
  });
  it.data.away = [...new Set([...(it.data.away ?? []), chatId])];
  await keep(it);
  hear(it, true);
  told();
  return true;
}

/** Brings a chat of the space's Telegram kept in the open hidden chats back to the space's lists. */
export async function telegramUnhideChat(chatId: number): Promise<void> {
  const it = live;
  const place = places.shown();
  if (!it || it.stopped || !it.data || !place?.data) throw new Error(t('Telegram is not running in this space.'));
  place.data.fromSpace = (place.data.fromSpace ?? []).filter((id) => id !== chatId);
  if (!place.data.fromSpace.length) delete place.data.fromSpace;
  await keep(place);
  it.data.away = (it.data.away ?? []).filter((id) => id !== chatId);
  if (!it.data.away.length) delete it.data.away;
  await keep(it);
  hear(it, true);
  told();
}

/** One of Telegram's ads in a channel, as its chat shows it, marked as an ad. */
export type TgSponsored = { id: number; title: string; text: string; url: string; button: string };

/** Whether Telegram's ads in channels show in this space's Telegram (off unless turned on). */
export function telegramAdsOn(where: NetworkWhere = 'space'): boolean {
  return acting(where)?.data?.ads === true;
}

// What marks the proxy Erevos gave TDLib for Tor, among any others.
const TOR_PROXY = 'erevos-tor';

// Where TDLib goes when the account must not go straight and Tor cannot be had: nothing listens
// there, so it connects nowhere until Tor can be had, rather than straight.
const NOWHERE = { host: '127.0.0.1', port: 9, user: '', password: '' };

/** Whether a Telegram account can go through Tor in this build (the core's SOCKS5 door). */
export const telegramCanTor = () => canTor() && canTorSocks() && canAccountTor();

// The account's Tor as it counts now: 'always' while a chat of it goes «Through Tor» (lib/account-tor.ts).
function torOf(it: Live): AccountTor {
  return effectiveTor(accountTorOf(it.data?.tor), (it.data?.torChats?.length ?? 0) > 0);
}

/**
 * The SOCKS5 proxy TDLib should go through, as an addProxy request, or null for straight: the core's
 * door into Tor (lib/account-tor.ts accountTorDoor), its circuits named for this account; NOWHERE
 * when the account must not go straight and Tor cannot be had. TDLib has one connection for all of
 * the account, so with the space's way Messages all of it goes through Tor while Tor is ready.
 */
async function proxyOf(it: Live): Promise<Record<string, unknown> | null> {
  const choice = torOf(it);
  let door: { host: string; port: number; user: string; password: string } | null;
  if (!telegramCanTor()) door = accountNeverStraight(choice) ? NOWHERE : null;
  else door = await accountTorDoor(choice, `telegram-${it.slot.slice(0, 20).toLowerCase()}`).catch(() => NOWHERE);
  if (!door) return null;
  return {
    '@type': 'addProxy',
    proxy: { '@type': 'proxy', server: door.host, port: door.port, type: { '@type': 'proxyTypeSocks5', username: door.user, password: door.password } },
    enable: true,
    comment: TOR_PROXY,
  };
}

/**
 * Sets TDLib's way to Telegram as the account's Tor says (proxyOf), and lets the old proxy of ours
 * go. TDLib keeps the proxy and that it is on, so the next start connects only through it, even
 * before this runs and gives it the door's new port and password; it never falls back to going
 * straight. A first start gets it from the module itself, right after its parameters (run).
 */
async function torWay(it: Live, proxy?: Record<string, unknown> | null): Promise<void> {
  const want = proxy === undefined ? await proxyOf(it) : proxy;
  const list = await request(it, { '@type': 'getProxies' });
  const ours = ((list.proxies as { id?: number; comment?: string }[] | undefined) ?? []).filter((p) => p.comment === TOR_PROXY);
  if (!want) {
    if (ours.length) await request(it, { '@type': 'disableProxy' });
    for (const p of ours) await request(it, { '@type': 'removeProxy', proxy_id: Number(p.id) });
    return;
  }
  const added = await request(it, want);
  for (const p of ours) if (Number(p.id) !== Number(added.id)) await request(it, { '@type': 'removeProxy', proxy_id: Number(p.id) });
  const door = (want.proxy as { port?: number }).port;
  if (door === NOWHERE.port) throw new AccountTorError();
}

// Each running account follows the space's Tor way, and Tor once it is ready, as they change.
let torFollowing = false;
function followTor(): void {
  if (torFollowing) return;
  torFollowing = true;
  const again = (wayChanged: boolean) => {
    for (const it of every()) {
      // INVISIBLE chosen (lib/modes.ts): no call goes on.
      if (wayChanged && callsOff() && !it.stopped) void it.calls.endAll().catch(() => undefined);
      // As the space, or Always (waiting for Tor); and, as the way changes, Off too, which goes
      // through Tor while the space is INVISIBLE (lib/account-tor.ts).
      if (!it.running || it.stopped || (torOf(it) === 'never' && !wayChanged)) continue;
      void torWay(it)
        .then(() => {
          if (it.problem === t('Tor is not ready.')) it.problem = '';
        })
        .catch((error: unknown) => {
          it.problem = reason(error);
        })
        .finally(told);
    }
  };
  onTorWay(() => again(true));
  onTorReady(() => again(false));
}

/** The account's Tor as it counts now (a chat «Through Tor» makes it Always), for the warning before sending (components/telegram-ip.ts). */
export function telegramTorNow(where: NetworkWhere = 'space'): AccountTor {
  const it = acting(where);
  return it ? torOf(it) : 'never';
}

/** The account's own Tor choice (Off, As the space, Always), as on its screen. */
export function telegramTorChoice(where: NetworkWhere = 'space'): AccountTor {
  return accountTorOf(acting(where)?.data?.tor);
}

/** Whether a chat of the account goes «Through Tor», which makes the whole account go only through Tor. */
export function telegramTorChats(where: NetworkWhere = 'space'): boolean {
  return (acting(where)?.data?.torChats?.length ?? 0) > 0;
}

// Keeps what changed and sets TDLib's way at once, when it runs.
async function keepTor(it: Live): Promise<void> {
  await keep(it);
  if (it.running) {
    try {
      await torWay(it);
      if (it.problem === t('Tor is not ready.')) it.problem = '';
    } catch (error) {
      it.problem = reason(error);
    }
  }
  told();
}

/** Chooses how the account goes through Tor; kept with it, on this phone. Can be chosen before signing in. */
export async function telegramSetTorChoice(choice: AccountTor, where: NetworkWhere = 'space'): Promise<void> {
  const it = acting(where);
  if (!it || it.stopped || !it.data) throw new Error(t('Telegram is not running in this space.'));
  if (choice === 'never') delete it.data.tor;
  else it.data.tor = choice;
  await keepTor(it);
}

/** Whether a chat goes «Through Tor» (Telegram info). */
export function telegramChatTor(chatId: number, where: NetworkWhere = 'space'): boolean {
  return acting(where)?.data?.torChats?.includes(chatId) ?? false;
}

/** Sends a chat only through Tor, or as the account says again; with one connection, the whole account follows. */
export async function telegramSetChatTor(chatId: number, on: boolean, where: NetworkWhere = 'space'): Promise<void> {
  const it = acting(where);
  if (!it || it.stopped || !it.data) throw new Error(t('Telegram is not running in this space.'));
  const ids = new Set(it.data.torChats ?? []);
  if (on) ids.add(chatId);
  else ids.delete(chatId);
  if (ids.size) it.data.torChats = [...ids];
  else delete it.data.torChats;
  await keepTor(it);
}

export async function telegramSetAds(on: boolean): Promise<void> {
  const it = need();
  if (on) it.data!.ads = true;
  else delete it.data!.ads;
  await keep(it);
  told();
}

/**
 * The ad Telegram has for a channel, when ads are on and it is one: Telegram's terms ask clients to
 * show them in large public channels. Told to Telegram as seen once shown (telegramSponsorSeen).
 */
export async function telegramSponsored(chatId: number): Promise<TgSponsored | null> {
  const it = need();
  if (it.data?.ads !== true || it.state.chats[chatId]?.type !== 'channel') return null;
  const answer = await request(it, { '@type': 'getChatSponsoredMessages', chat_id: chatId }).catch(() => null);
  const m = ((answer?.messages ?? []) as Record<string, any>[])[0];
  if (!m || typeof m.message_id !== 'number') return null;
  const url = typeof m.sponsor?.url === 'string' && /^https:\/\//.test(m.sponsor.url) ? m.sponsor.url : '';
  return { id: m.message_id, title: String(m.title ?? ''), text: String(m.content?.text?.text ?? ''), url, button: String(m.button_text ?? '') };
}

export async function telegramSponsorSeen(chatId: number, id: number): Promise<void> {
  await request(need(), { '@type': 'viewMessages', chat_id: chatId, message_ids: [id], source: { '@type': 'messageSourceChatHistory' }, force_read: false }).catch(() => undefined);
}

export async function telegramSponsorClicked(chatId: number, id: number): Promise<void> {
  await request(need(), { '@type': 'clickChatSponsoredMessage', chat_id: chatId, message_id: id, is_media_click: false, from_fullscreen: false }).catch(() => undefined);
}
