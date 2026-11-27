// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Messenger, Signal and Session in Erevos+ (lib/messenger.ts): their engines
// (modules/erevos-messenger), started while their module is on (app/_layout.tsx Receiver), and the
// state of each, which the home screen and their chats follow. The engines are the phone's, not a
// space's: their accounts show in the main space. The plain Erevos and other platforms have no
// engines: then nothing here starts and every service stays signed out.

import type { MessengerNative } from '../modules/erevos-messenger';
import { answerOf, applyEvent, countsAsNew, emptyMsgState, keepRead, MSG_SERVICES, readJson, SERVICE_NAMES, type MsgService, type MsgState } from './messenger';
import { loadMsgOwn, saveMsgOwn, type MessengerWay, type MsgOwn } from '../lock/msg-own-data';
import { accountNeverStraight, accountThroughTor, accountTorDoor, effectiveTor, type AccountTor } from './account-tor';
import { onTorReady, onTorWay } from './relay';
import { t } from './i18n';
import { currentSpace } from '../lock/keys';
import { loadNetworksBackup } from '../lock/networks-backup-data';
import { messengerAccountOf } from './backup-networks-data';
import { lastRestore } from '../lock/restored';
import { secureDelete, secureGet } from './secure';
import type { ChatNotify } from '../lock/chat-notify';
import { addNetwork, hearing } from './network-notices';
import { sessionCallTexts } from './session-calls';
import { readSignalCall, type SignalCall } from './signal-calls';

let native: MessengerNative | null = null;
let opened: Promise<void> | null = null;
let subscription: { remove(): void } | null = null;
const states: Record<MsgService, MsgState> = { messenger: emptyMsgState(), signal: emptyMsgState(), session: emptyMsgState() };
const listeners = new Set<() => void>();

const changed = () => listeners.forEach((listener) => listener());

// What each chat has not read, told of as it changes (lib/network-notices.ts), as Telegram's are:
// a notice and its sound (lib/background.ts) and the number on the icon. The engines say of a chat
// only whether it has any not read; the messages that came to it since it was last read count
// each. Each service its own, by its chats' home rows (`messenger:` and the key, and so on).
const cameSince: Record<MsgService, Map<string, number>> = { messenger: new Map(), signal: new Map(), session: new Map() };
const heard: Record<MsgService, ReturnType<typeof hearing>> = { messenger: hearing(), signal: hearing(), session: hearing() };
// Each chat marked read here, up to its last message then (lib/messenger.ts keepRead): what the
// engine sends again of it, or says of it before its service has heard, does not make it unread.
const readTo: Record<MsgService, Map<string, number>> = { messenger: new Map(), signal: new Map(), session: new Map() };

// Each chat's own notifications (lock/msg-own-data.ts), sealed with the first space's key: read as
// the engines start, while that space is open.
let own: MsgOwn = {};
// Signal's and Messenger's Tor (lib/account-tor.ts), 'never' until the owner turns it on, and
// their chats set «Through Tor», which make the whole account 'always' (msg-own-data.ts).
type TorService = 'messenger' | 'signal' | 'session';
const NO_TOR: Record<TorService, AccountTor> = { messenger: 'never', signal: 'never', session: 'never' };
let torChoice: Record<TorService, AccountTor> = { ...NO_TOR };
let torChats: Record<TorService, string[]> = { messenger: [], signal: [], session: [] };
let ownKey: Uint8Array | null = null;
// How Messenger is used: Erevos's engine, or its case (the official page in a closed web view).
let messengerWay: MessengerWay = 'engine';

// Session rings its calls itself (modules/erevos-messenger): a muted chat's quietly, one with a
// ringtone of its own with that. Told anew with each change.
function tellSessionMuted(): void {
  const choices: Record<string, { until?: number; ring?: string }> = {};
  for (const [where, notify] of Object.entries(own)) {
    // ring '' is a chosen silence, not "the phone's": it goes too.
    if (!where.startsWith('session:') || (!notify.until && notify.ring === undefined)) continue;
    choices[where.slice('session:'.length)] = { ...(notify.until ? { until: notify.until } : {}), ...(notify.ring !== undefined ? { ring: notify.ring } : {}) };
  }
  try {
    native?.setSessionMuted?.(JSON.stringify(choices));
  } catch {
    // A build from before it.
  }
}

async function readOwn(): Promise<void> {
  try {
    const { space, key } = currentSpace();
    if (space !== 0) return;
    const kept = await loadMsgOwn(key);
    own = kept.notify;
    torChoice = { messenger: kept.messengerTor, signal: kept.signalTor, session: kept.sessionTor };
    torChats = { messenger: kept.messengerTorChats, signal: kept.signalTorChats, session: kept.sessionTorChats };
    messengerWay = kept.messengerWay;
    ownKey = key;
    tellSessionMuted();
    changed();
    // Before Session starts (startMessenger), so its engine starts once, with the account restored.
    await restoredSession(key);
  } catch {
    // No space open, or none that opens it: no chat has notifications of its own.
  }
}

/** A Messenger, Signal or Session chat's own notifications, or null for none. */
export function msgNotifyOf(service: MsgService, key: string): ChatNotify | null {
  return own[`${service}:${key}`] ?? null;
}

/** Sets a chat's own notifications (null: as all others). */
export async function msgSetNotify(service: MsgService, key: string, notify: ChatNotify | null): Promise<void> {
  if (!ownKey) await readOwn();
  if (!ownKey) throw new Error('not here');
  const next = { ...own };
  delete next[`${service}:${key}`];
  if (notify) next[`${service}:${key}`] = notify;
  await saveMsgOwn(ownKey, ownData(next));
  own = next;
  tellSessionMuted();
  changed();
}
// What came before the engine was started (what the phone had not fetched yet, or fetches again) is
// counted, but told of only once the service was started: its first count is taken as it is.
const started = new Set<MsgService>();
// When each service's engine was started here.
const startedAt = new Map<MsgService, number>();
// Each chat's newest message counted as new here.
const countedTo: Record<MsgService, Map<string, number>> = { messenger: new Map(), signal: new Map(), session: new Map() };

/** Each chat of a service with messages not read, by its home row, and how many. */
export function msgUnreadOf(service: MsgService): Map<string, number> {
  const unread = new Map<string, number>();
  for (const t of Object.values(states[service].threads)) {
    const came = cameSince[service].get(t.key) ?? 0;
    if (t.unread || came > 0) unread.set(`${service}:${t.key}`, Math.max(came, 1));
  }
  return unread;
}

function hearNow(service: MsgService): void {
  heard[service].hear(msgUnreadOf(service), !started.has(service));
}

for (const service of MSG_SERVICES) {
  addNetwork(`${service}:`, { unread: () => msgUnreadOf(service), notifyOf: (where) => own[where] ?? null });
}

/** Counts a message that came from someone else, new here, in a chat not read since. */
function counted(service: MsgService, event: unknown): void {
  const e = (event ?? {}) as Record<string, unknown>;
  if (e.type !== 'message') return;
  // While Messenger's case is on the screen, its page shows what comes: Erevos tells of none of it.
  // Left behind (Home, the screen off, the lock), it tells again, as of Erevos's own chats.
  if (service === 'messenger' && caseOpen && (native?.caseInFront?.() ?? true)) return;
  const raw = (e.message ?? {}) as Record<string, unknown>;
  const key = String(raw.thread ?? '');
  const id = String(raw.id ?? '');
  if (!key || !id || raw.mine === true || raw.outgoing === true) return;
  if ((states[service].messages[key] ?? []).some((m) => m.id === id)) return;
  // Sent again, from before the chat was marked read here, from before the engine's start (what an
  // opening chat or a reconnect fetches), or older than one counted already: none is new
  // (lib/messenger.ts countsAsNew). What came while Erevos was away its account counts (the chat's
  // unread). Not by the chat's last time: Session and Messenger move it to a message before sending it.
  const ms = typeof raw.ms === 'number' ? raw.ms : null;
  if (!newHere(service, key, ms)) return;
  if (ms !== null) countedTo[service].set(key, Math.max(ms, countedTo[service].get(key) ?? 0));
  cameSince[service].set(key, (cameSince[service].get(key) ?? 0) + 1);
}

/**
 * Whether a message of `ms` in a chat is new here (lib/messenger.ts countsAsNew): what is counted
 * and told of, and what alone makes a chat unread besides its account's own word.
 */
function newHere(service: MsgService, key: string, ms: number | null): boolean {
  return countsAsNew(ms, readTo[service].get(key), countedTo[service].get(key), startedAt.get(service) ?? 0);
}

/** A chat read: here, or on another device of the account (its engine says it has none not read). */
function readHere(service: MsgService, key: string): void {
  cameSince[service].delete(key);
}

/** The engines of this build (app/_layout.tsx), or null. */
export function setMessengerNative(next: MessengerNative | null): void {
  native = next;
}

/** Whether this build has the engines. */
export const messengerHere = () => native !== null;

/** Calls `listener` at each change of any service's state; gives how to stop. */
export function onMessengerChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A service's state now. */
export function messengerNow(service: MsgService): MsgState {
  return states[service];
}

function set(service: MsgService, next: MsgState): void {
  if (next === states[service]) return;
  states[service] = next;
  changed();
}

/** One request to a service's engine: its answer, or an Error with the engine's word. */
export async function msgCall<T = unknown>(service: MsgService, op: string, args: Record<string, unknown> = {}): Promise<T> {
  if (!native) throw new Error('not here');
  await open();
  return answerOf<T>(await native.call(service, op, JSON.stringify(args)));
}

function open(): Promise<void> {
  if (!native) return Promise.reject(new Error('not here'));
  if (!opened) {
    const engines = native;
    subscription = engines.addListener('onEvent', ({ service, json }) => {
      if (service !== 'messenger' && service !== 'signal' && service !== 'session') return;
      try {
        const event = readJson(json);
        if (service === 'signal' && takeSignalCall(event)) return;
        counted(service, event);
        const next = keepRead(states[service], applyEvent(states[service], event, (key, ms) => newHere(service, key, ms)), readTo[service]);
        // Read on another device: no longer counted here.
        for (const t of Object.values(next.threads)) if (!t.unread && states[service].threads[t.key]?.unread) readHere(service, t.key);
        set(service, next);
        hearNow(service);
      } catch {
        // An event that does not read changes nothing.
      }
    });
    opened = engines
      .open()
      .then(() => engines.setCallTexts(JSON.stringify(sessionCallTexts())))
      .catch((e: unknown) => {
        opened = null;
        subscription?.remove();
        subscription = null;
        throw e;
      });
  }
  return opened;
}

// The services whose modules are on (startMessenger), and those being started now: one that could
// not start (its Tor not ready while it must not go straight) is started again as Tor comes.
const wanted = new Set<MsgService>();
const starting = new Set<MsgService>();

/** Whether a service's engine has an account on this phone, and if so starts it. */
async function startOne(service: MsgService): Promise<void> {
  if (starting.has(service)) return;
  starting.add(service);
  try {
    const signedIn =
      service === 'messenger'
        ? (await msgCall<boolean>('messenger', 'loggedIn')) === true
        : ((await (service === 'session' ? msgWay('session') : Promise.resolve()).then(() => msgCall<{ registered?: boolean }>(service, 'open'))) ?? {}).registered === true;
    set(service, { ...states[service], signedIn, status: '' });
    if (signedIn && torService(service)) await msgWay(service);
    // Messenger in its case: the engine runs too, to tell of new messages (they open in the case).
    if (signedIn) {
      if (!startedAt.has(service)) startedAt.set(service, Date.now());
      await msgCall(service, 'start');
    }
    started.add(service);
    hearNow(service);
  } catch (e) {
    set(service, { ...states[service], status: e instanceof Error ? e.message : String(e) });
  } finally {
    starting.delete(service);
  }
}

/** Starts the engines of the services on (their modules), each with an account here. */
export async function startMessenger(on: readonly MsgService[]): Promise<void> {
  if (!native) return;
  native.setInFront(true);
  await readOwn();
  followTor();
  wanted.clear();
  for (const service of MSG_SERVICES) if (on.includes(service)) wanted.add(service);
  await Promise.all([...wanted].map(startOne));
}

/**
 * Calls the person of a one-to-one Session chat, on Session's own call screen; false when a
 * Session call is already on.
 */
export async function sessionCall(key: string, name: string, video: boolean): Promise<boolean> {
  if (!native) throw new Error('not here');
  await open();
  native.setCallTexts(JSON.stringify(sessionCallTexts()));
  return native.sessionCall(key, name, video);
}

/** A Session group's members, as its engine knows them. */
export type SessionMember = { key: string; name: string; admin: boolean; me: boolean; invited: boolean; inviteFailed: boolean };

export async function sessionMembers(key: string): Promise<SessionMember[]> {
  const list = await msgCall<unknown[]>('session', 'members', { thread: key });
  return (Array.isArray(list) ? list : []).map((m) => {
    const o = (m ?? {}) as Record<string, unknown>;
    return {
      key: String(o.id ?? ''),
      name: String(o.person ?? o.name ?? ''),
      admin: o.admin === true,
      me: o.me === true,
      invited: o.invited === true,
      inviteFailed: o.inviteFailed === true,
    };
  });
}

/** A new Session group with us as its admin; the people (chat keys or Session IDs) get an invitation. Its key. */
export async function sessionNewGroup(title: string, people: readonly string[]): Promise<string> {
  const r = (await msgCall<unknown>('session', 'createGroup', { title, people: [...people] })) as Record<string, unknown> | null;
  return String(r?.key ?? r?.thread ?? '');
}

/** One change to a Session group: renameGroup, addMembers, removeMember, setAdmin or leaveGroup. */
export async function sessionGroupChange(op: 'renameGroup' | 'addMembers' | 'removeMember' | 'setAdmin' | 'leaveGroup', key: string, args: Record<string, unknown> = {}): Promise<void> {
  await msgCall('session', op, { thread: key, ...args });
}

/**
 * Stops Messenger's connection: the space closes, or every one of the three turned off. The lock
 * does not stop it: behind the password screen the space goes on, and its notices come.
 */
export async function stopMessenger(): Promise<void> {
  wanted.clear();
  own = {};
  torChoice = { ...NO_TOR };
  torChats = { messenger: [], signal: [], session: [] };
  messengerWay = 'engine';
  ownKey = null;
  if (!native || !opened) return;
  await native.close().catch(() => undefined);
  for (const service of MSG_SERVICES) set(service, { ...states[service], connected: false });
}

/** Whether Erevos is in front: Session then reads new messages more often. */
export function messengerInFront(front: boolean): void {
  native?.setInFront(front);
}

/**
 * A page of the service the owner fills in (Messenger's sign-in, Signal's captcha), the way its
 * account goes: through Tor when it does (lib/account-tor.ts), and then never straight; refused
 * where this phone's web view cannot go through Tor.
 */
async function webPage(kind: 'messenger' | 'signalCaptcha', cannot: () => Error): Promise<string | null> {
  if (!native) return null;
  await open();
  const door = await accountTorDoor(msgTorNow(kind === 'messenger' ? 'messenger' : 'signal'), kind === 'messenger' ? 'messenger' : 'signal');
  if (!door) return native.webSignIn(kind);
  if (!native.webSignInTor) throw cannot();
  return native.webSignInTor(kind, JSON.stringify({ host: door.host, port: door.port, user: door.user, password: door.password })).catch((e: unknown) => {
    throw (e as { code?: unknown } | null)?.code === 'NO_TOR_WEB' ? cannot() : e;
  });
}

/** Messenger's sign-in: its own page on facebook.com, then its cookies to the engine, the account's way. False when the owner went back. */
export async function messengerSignIn(): Promise<boolean> {
  if (!native) return false;
  await open();
  await msgWay('messenger');
  const cookies = await webPage('messenger', () => new Error(t('This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.')));
  if (!cookies) return false;
  await msgCall('messenger', 'login', { cookies: JSON.parse(cookies) as Record<string, string> });
  set('messenger', { ...states.messenger, signedIn: true, signInAgain: false });
  await msgCall('messenger', 'start');
  started.add('messenger');
  return true;
}

/** How Messenger is used here: 'engine' (Erevos speaks it itself) or 'case' (its own page, closed in). */
export function msgMessengerWay(): MessengerWay {
  return messengerWay;
}

/**
 * Sets how Messenger is used. In its case the engine still runs, to tell of new messages: its chats
 * show on home only while they have some not read, and open in the case (msgCaseOnly); in the
 * case itself Erevos tells of none, as the page shows them.
 */
export async function msgSetMessengerWay(way: MessengerWay): Promise<void> {
  if (!ownKey) await readOwn();
  if (!ownKey) throw new Error('not here');
  if (way === messengerWay) return;
  await saveMsgOwn(ownKey, { ...ownData(), messengerWay: way });
  messengerWay = way;
  // The engine runs either way (startOne): only where its chats show and open changes.
  changed();
  if (wanted.has('messenger') && !started.has('messenger')) await startOne('messenger');
}

/**
 * Messenger in its case: facebook.com/messages itself, in Erevos's own closed web view
 * (MessengerCaseActivity), with the engine's sign-in, the account's way (through Tor when it goes
 * through Tor, and then never straight; calls then do not work). `thread` opens one chat. As it
 * closes, the sign-in the page ended with goes back to the engine; signed out there, it is signed
 * out here too.
 */
export async function openMessengerCase(thread = ''): Promise<void> {
  if (caseOpen) return;
  caseOpen = true;
  try {
    await showCase(thread);
  } finally {
    caseOpen = false;
  }
}

// Whether Messenger's case shows now (openMessengerCase).
let caseOpen = false;

/**
 * Whether Messenger is used in its case: its chats then show on home only while they have messages
 * not read, and open in the case, at that chat.
 */
export function msgCaseOnly(service: MsgService): boolean {
  return service === 'messenger' && messengerWay === 'case';
}

async function showCase(thread: string): Promise<void> {
  if (!native?.messengerCase) throw new Error(t('This version of Erevos+ has no Messenger case yet.'));
  await open();
  // A sign-in from before, made on messenger.com, is not facebook.com's: the case would open signed out.
  if ((await msgCall<string>('messenger', 'webHost').catch(() => '')) !== 'www.facebook.com') {
    set('messenger', { ...states.messenger, signInAgain: true });
    throw new Error(t('Messenger asks you to sign in again.'));
  }
  const door = await accountTorDoor(msgTorNow('messenger'), 'messenger');
  const cannot = () => new Error(t('This phone cannot show Messenger through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to open it.'));
  const answer = await native.messengerCase(door ? JSON.stringify({ host: door.host, port: door.port, user: door.user, password: door.password }) : '', thread).catch((e: unknown) => {
    throw (e as { code?: unknown } | null)?.code === 'NO_TOR_WEB' ? cannot() : e;
  });
  if (answer === 'signedOut') {
    set('messenger', { ...states.messenger, signInAgain: true });
    return;
  }
  if (answer?.startsWith('cookies:')) {
    const cookies = JSON.parse(answer.slice('cookies:'.length)) as Record<string, string>;
    // The page may have renewed them: the engine keeps the newest.
    await msgCall('messenger', 'login', { cookies }).catch(() => undefined);
  }
}

/**
 * How the Messenger account is signed in, for Facebook itself: 'facebook' when on facebook.com, so
 * Facebook can open with it; 'messenger' for a sign-in on messenger.com from before; 'none' when
 * not signed in, or in a build without Facebook.
 */
export async function facebookWay(): Promise<'facebook' | 'messenger' | 'none'> {
  if (!native?.facebook || !states.messenger.signedIn || states.messenger.signInAgain) return 'none';
  const host = await msgCall<string>('messenger', 'webHost').catch(() => '');
  return host === 'www.facebook.com' ? 'facebook' : host === 'www.messenger.com' ? 'messenger' : 'none';
}

/**
 * Facebook itself with the Messenger account's sign-in, the account's way: through Tor when it
 * goes through Tor, and then never straight. Answers the Messenger chat key the owner followed a
 * link to there ('' for Messenger's chat list), or null.
 */
export async function openFacebook(): Promise<string | null> {
  if (!native?.facebook) return null;
  await open();
  const door = await accountTorDoor(msgTorNow('messenger'), 'messenger');
  const cannot = () => new Error(t('This phone cannot show Facebook through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to open it.'));
  if (door && !native.webSignInTor) throw cannot();
  const answer = await native.facebook(door ? JSON.stringify({ host: door.host, port: door.port, user: door.user, password: door.password }) : '').catch((e: unknown) => {
    throw (e as { code?: unknown } | null)?.code === 'NO_TOR_WEB' ? cannot() : e;
  });
  if (!answer) return null;
  return answer.startsWith('thread:') ? answer.slice('thread:'.length) : '';
}

/**
 * Signal's captcha, solved by the owner on Signal's page: its token, or null. The page goes the
 * way Signal goes (msgWay): through Tor when Signal does, and then never straight.
 */
export function signalCaptcha(): Promise<string | null> {
  return webPage('signalCaptcha', () => new Error(t('This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.')));
}

/** After a sign-in (Signal registered or linked, Session made or brought back): starts it. */
export async function msgSignedIn(service: MsgService): Promise<void> {
  set(service, { ...states[service], signedIn: true, signInAgain: false });
  if (service === 'signal') await msgCall('signal', 'open');
  if (torService(service)) await msgWay(service);
  await msgCall(service, 'start');
  // What a new account fetches from before is its history: counted, not told of.
  hearNow(service);
  started.add(service);
}

/** Whether the engines are on this phone (Erevos+ on Android): what a backup of their accounts needs. */
export function msgEnginesHere(): boolean {
  return native !== null;
}

// Where lib/backup-networks.ts marks a restore whose Session account waits for the first space.
const RESTORE_PENDING = 'erevos.networks-restore';
let restoring = false;

/**
 * After a restore from Backups, once the first space opens: Session's account the backup held
 * (lock/networks-backup-data.ts) goes back to the engine, sealed anew with this phone's Keystore,
 * and Session starts again with it. Only where there is no Session account, or the same one:
 * another account here is never replaced, and that is said. Signal's history it held (#68) is
 * added to what Signal's engine keeps, on its own, and Messenger's sign-in signs its engine in before
 * it starts (putMessenger). Once, for that restore.
 */
async function restoredSession(key: Uint8Array): Promise<void> {
  if (restoring || !native) return;
  restoring = true;
  try {
    const pending = await secureGet(RESTORE_PENDING);
    if (!pending) return;
    if (pending !== (await lastRestore())) {
      await secureDelete(RESTORE_PENDING);
      return;
    }
    const { session, signal, messenger } = await loadNetworksBackup(key);
    await secureDelete(RESTORE_PENDING);
    if (session) await putSession(session);
    if (signal) await putSignalHistory(signal);
    if (messenger) await putMessenger(messenger);
  } catch {
    // Tried again as the first space next opens, while the mark stays.
  } finally {
    restoring = false;
  }
}

// What a restore could not put back, said once (loaded here, not with this file: it needs the app around it).
async function sayNotBack(service: MsgService, text: string): Promise<void> {
  const { ask } = await import('./alert');
  ask(SERVICE_NAMES[service], text, [{ text: t('OK') }]);
}

// Messenger's sign-in from the backup (#68): the engine signs in with it before it starts, where
// this phone is not signed in to Messenger; signed in to the same account, it stays as it is; to
// another, that stays, and that is said.
async function putMessenger(signIn: string): Promise<void> {
  try {
    const account = messengerAccountOf(signIn);
    if (!account) return;
    if ((await msgCall<boolean>('messenger', 'loggedIn')) === true) {
      const here = await msgCall<Record<string, string>>('messenger', 'webCookies').catch(() => null);
      if (here?.c_user && here.c_user !== account) {
        await sayNotBack('messenger', t("This phone is signed in to another Messenger account, so the backup's was not put in its place. To bring the backup's back, sign out of Messenger here and restore the backup again."));
      }
      return;
    }
    await msgCall('messenger', 'login', { cookies: JSON.parse(signIn) as Record<string, string> });
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error);
    await sayNotBack('messenger', t("Messenger's sign-in could not go back: {error}", { error: said }));
  }
}

async function putSession(session: string): Promise<void> {
  try {
    await msgCall('session', 'restoreState', { state: session });
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error);
    await sayNotBack(
      'session',
      said === 'other-account'
        ? t("This phone has another Session account, so the backup's was not put in its place. To bring the backup's back, sign out of Session here and restore the backup again.")
        : t("Session's account could not go back: {error}", { error: said }),
    );
    return;
  }
  // Running before (its engine stopped for the restore): started again; otherwise as Session's module starts.
  const wasOn = started.has('session');
  set('session', emptyMsgState());
  cameSince.session.clear();
  readTo.session.clear();
  countedTo.session.clear();
  started.delete('session');
  startedAt.delete('session');
  hearNow('session');
  if (wasOn) await startOne('session');
}

// Signal's history: added to what the engine keeps, never in place of it; its chats show as the
// engine reads them (messenger/signal/src/engine.rs historyImport, and its chat list as it starts).
async function putSignalHistory(history: string): Promise<void> {
  try {
    // Opened first: the history is kept encrypted with a key made from the store's.
    await msgCall('signal', 'open');
    await msgCall('signal', 'historyImport', { history });
  } catch (error) {
    const said = error instanceof Error ? error.message : String(error);
    await sayNotBack('signal', t("Signal's history could not go back: {error}", { error: said }));
  }
}

/** Signs a service out on this phone: the engine forgets its account. */
export async function msgSignOut(service: MsgService): Promise<void> {
  await msgCall(service, 'logout');
  set(service, emptyMsgState());
  cameSince[service].clear();
  readTo[service].clear();
  countedTo[service].clear();
  started.delete(service);
  startedAt.delete(service);
  hearNow(service);
}

/** Asks for a chat's messages (they come as events). */
export async function msgOpenChat(service: MsgService, key: string): Promise<void> {
  await msgCall(service, 'messages', { thread: key }).catch(() => undefined);
  await msgReadChat(service, key).catch(() => undefined);
}

/** Marks a chat read, as its screen does when it shows (and Read all, lib/read-all.ts). */
export async function msgReadChat(service: MsgService, key: string): Promise<void> {
  const t = states[service].threads[key];
  const had = t?.unread || cameSince[service].has(key);
  readHere(service, key);
  const last = (states[service].messages[key] ?? []).reduce((most, m) => Math.max(most, m.ms), t?.lastMs ?? 0);
  if (last > 0) readTo[service].set(key, Math.max(last, readTo[service].get(key) ?? 0));
  if (t?.unread) set(service, { ...states[service], threads: { ...states[service].threads, [key]: { ...t, unread: false } } });
  hearNow(service);
  if (had) await msgCall(service, 'markRead', { thread: key });
}

/**
 * Read all, of every Messenger chat (lib/read-all.ts): the engine keeps it, so a chat Meta sends only
 * later, an older one fetched as the list goes further back, comes read too.
 */
export async function msgReadAllMessenger(): Promise<void> {
  await msgCall('messenger', 'markAllRead');
}

/** Sends text to a chat, as an answer to `replyTo` when given. */
export async function msgSend(service: MsgService, key: string, text: string, replyTo?: string): Promise<void> {
  await msgCall(service, 'sendText', { thread: key, text, ...(replyTo ? { replyTo } : {}) });
}

/** Sends a file (a path on the phone) to a chat. */
export async function msgSendFile(service: MsgService, key: string, path: string, mime: string, name?: string, caption?: string): Promise<void> {
  await msgCall(service, 'sendMedia', { thread: key, path, mime, ...(name ? { name } : {}), ...(caption ? { caption } : {}) });
}

/** Reacts to a message; '' takes the reaction back. */
export async function msgReact(service: MsgService, id: string, emoji: string): Promise<void> {
  await msgCall(service, 'react', { id, emoji });
}

/** Takes a message back for everyone (`everyone`) or deletes it here. */
export async function msgDelete(service: MsgService, id: string, everyone: boolean): Promise<void> {
  await msgCall(service, everyone ? 'unsend' : 'deleteForMe', { id });
  set(service, applyEvent(states[service], { type: 'deleted', id }));
}

/** People to start a chat with, by name, number or id. */
export async function msgSearch(service: MsgService, query: string): Promise<{ id: string; name: string }[]> {
  const found = await msgCall<unknown[]>(service, 'searchPeople', { query });
  return (Array.isArray(found) ? found : []).map((p) => {
    const o = (p ?? {}) as Record<string, unknown>;
    return { id: String(o.id ?? o.key ?? ''), name: String(o.name ?? '') };
  });
}

/**
 * Starts (or finds) a chat with a person: its key. Messenger's engine takes the person's id as a
 * number (and their name, for the new chat): it goes as text, which JavaScript keeps whole, and the
 * module makes it a number (modules/erevos-messenger). Signal and Session take theirs as text.
 */
export async function msgStartChat(service: MsgService, person: string, name?: string): Promise<string> {
  const args: Record<string, unknown> =
    service === 'messenger' && /^\d+$/.test(person) ? { id: person, name: name ?? '' } : { person, id: person };
  const r = await msgCall<unknown>(service, 'startChat', args);
  const o = (r ?? {}) as Record<string, unknown>;
  return String(typeof r === 'string' || typeof r === 'number' ? r : (o.thread ?? o.key ?? ''));
}

// ---- Signal's calls (lib/signal-calls.ts, components/signal-call.tsx) ----

let signalCall: SignalCall | null = null;

/** A signalCallState event (or a missed call's) taken; false when the event is not about calls. */
function takeSignalCall(event: unknown): boolean {
  const type = ((event ?? {}) as Record<string, unknown>).type;
  if (type === 'signalCallMissed') return true;
  if (type !== 'signalCallState') return false;
  const next = readSignalCall(event, signalCall, Date.now());
  if (next) {
    signalCall = next;
    changed();
  }
  return true;
}

/** The Signal call going on, ringing, or just ended (until forgotten). */
export function signalCallNow(): SignalCall | null {
  return signalCall;
}

/** Lets go of an ended Signal call, once its screen has shown how it ended. */
export function signalForgetCall(id: string): void {
  if (signalCall && signalCall.stage === 'ended' && signalCall.id === id) {
    signalCall = null;
    changed();
  }
}

/** Calls a Signal person (their chat key), with this phone's camera on when `video`. */
export async function signalCallStart(person: string, video: boolean): Promise<void> {
  if (!native) throw new Error('not here');
  if (signalCall && signalCall.stage !== 'ended') throw new Error('busy');
  await open();
  await native.signalCall(person, video);
}

export async function signalAnswer(camera: boolean): Promise<void> {
  await native?.signalAnswer(camera);
}

export async function signalHangUp(): Promise<void> {
  await native?.signalHangUp();
}

export async function signalMute(on: boolean): Promise<void> {
  await native?.signalMute(on);
}

export async function signalCamera(on: boolean): Promise<void> {
  await native?.signalCamera(on);
}

export async function signalFlip(): Promise<void> {
  await native?.signalFlip();
}

/** The loudspeaker or the earpiece: kept with the call, the sound itself is the app's (components/signal-call.tsx). */
export function signalSpeakerChosen(on: boolean): void {
  if (!signalCall) return;
  signalCall = { ...signalCall, speaker: on };
  changed();
}

// ---- Messenger, Signal and Session over Tor (lib/account-tor.ts; the engines' setProxy) ----

function torService(service: MsgService): service is TorService {
  return service === 'messenger' || service === 'signal' || service === 'session';
}

function ownData(notify: MsgOwn = own, choice = torChoice, chats = torChats) {
  return {
    notify,
    signalTor: choice.signal,
    signalTorChats: chats.signal,
    messengerTor: choice.messenger,
    messengerTorChats: chats.messenger,
    sessionTor: choice.session,
    sessionTorChats: chats.session,
    messengerWay,
  };
}

/** An account's own Tor choice, as its screen shows it: 'never' until turned on. */
export function msgTorChoice(service: TorService): AccountTor {
  return torChoice[service];
}

/** Whether any chat of the account is set «Through Tor»: the whole account then goes only through Tor. */
export function msgChatsThroughTor(service: TorService): boolean {
  return torChats[service].length > 0;
}

/** Whether a chat is set «Through Tor». */
export function msgChatTor(service: TorService, key: string): boolean {
  return torChats[service].includes(key);
}

/** The choice that counts now: 'always' while a chat of the account goes «Through Tor». */
export function msgTorNow(service: TorService): AccountTor {
  return effectiveTor(torChoice[service], torChats[service].length > 0);
}

// Where Signal goes when it must not go straight and Tor cannot be had: a door nobody answers, so
// it waits, rather than the engine's last way, which may be straight. Messenger's engine keeps that
// rule itself (torOnly), even before this run's door is known.
const NOWHERE = 'socks5h://closed:closed@127.0.0.1:9';

/**
 * Sets an engine's way (its circuits named for the service): straight, through Tor as the space
 * does, or only through Tor, as its choice and its chats say (effectiveTor). When it must not go
 * straight (accountNeverStraight) and Tor cannot be had, it goes nowhere and this throws: never
 * straight, not even as it starts, registers, links or signs in. One connection carries its files
 * too, so they go the way its messages go (Messenger's pictures through its engine: messengerMedia).
 * Calls are not in it.
 */
async function msgWay(service: TorService): Promise<void> {
  // Its choice is sealed with the first space: until it is read, nothing goes (it may be Always).
  if (!ownKey) await readOwn();
  if (!ownKey) {
    await nowhere(service).catch(() => undefined);
    throw new Error(t('Open the first space: {service} waits for its Tor setting.', { service: SERVICE_NAMES[service] }));
  }
  const choice = msgTorNow(service);
  const torOnly = accountNeverStraight(choice);
  let door: Awaited<ReturnType<typeof accountTorDoor>>;
  try {
    door = await accountTorDoor(choice, service, true);
  } catch (e) {
    await nowhere(service);
    throw e;
  }
  // Session sends everything (onion requests, files) from one place (SessionNet.setProxy); with
  // `required` nothing goes while it has no door.
  if (service === 'session') await msgCall('session', 'setProxy', { url: door?.url ?? '', required: torOnly });
  else if (service === 'messenger') await msgCall('messenger', 'setProxy', { url: door ? door.url.replace(/^socks5h:/, 'socks5:') : '', torOnly });
  else await msgCall('signal', 'setProxy', { url: door?.url ?? '' });
}

/** An engine that must not go straight and has no door: it sends nothing. */
async function nowhere(service: TorService): Promise<void> {
  if (service === 'messenger') await msgCall('messenger', 'setProxy', { url: '', torOnly: true });
  else if (service === 'session') await msgCall('session', 'setProxy', { url: '', required: true });
  else await msgCall('signal', 'setProxy', { url: NOWHERE });
}

/** Before making or bringing back a Session account: the way the choice says, never straight against it. */
export async function sessionSignInWay(): Promise<void> {
  await msgWay('session');
}

/** Before registering, confirming or linking: the way the choice says, never straight against it. */
export async function signalSignInWay(): Promise<void> {
  await msgWay('signal');
}

// A running account follows the space's Tor as it changes (its way, Tor becoming ready).
let followingTor = false;
function followTor(): void {
  if (followingTor) return;
  followingTor = true;
  const again = () => {
    for (const service of ['messenger', 'signal', 'session'] as const) {
      // One on that could not start (Tor was not ready and it must not go straight): start it now.
      if (wanted.has(service) && !started.has(service)) {
        void startOne(service);
        continue;
      }
      if (!states[service].signedIn || !started.has(service)) continue;
      msgWay(service).catch((e) => set(service, { ...states[service], status: e instanceof Error ? e.message : String(e) }));
    }
  };
  onTorWay(again);
  onTorReady(again);
}

async function saveTor(service: TorService, choice: AccountTor, chats: string[]): Promise<void> {
  if (!ownKey) await readOwn();
  if (!ownKey) throw new Error('not here');
  const nextChoice = { ...torChoice, [service]: choice };
  const nextChats = { ...torChats, [service]: chats };
  await saveMsgOwn(ownKey, ownData(own, nextChoice, nextChats));
  torChoice = nextChoice;
  torChats = nextChats;
  changed();
  if (states[service].signedIn) await msgWay(service);
}

/** Sets an account's Tor; a running one moves to the new way at once. */
export async function msgSetTorChoice(service: TorService, choice: AccountTor): Promise<void> {
  await saveTor(service, choice, torChats[service]);
}

/** Sets a chat «Through Tor» or not; the whole account follows at once. */
export async function msgSetChatTor(service: TorService, key: string, on: boolean): Promise<void> {
  const chats = torChats[service].filter((c) => c !== key);
  if (on) chats.push(key);
  await saveTor(service, torChoice[service], chats);
}

/** Whether Messenger's pictures and files must come through its engine: it goes through Tor now. */
export function messengerMediaThroughTor(): boolean {
  const choice = msgTorNow('messenger');
  return accountNeverStraight(choice) || accountThroughTor(choice, true);
}

/**
 * A Messenger picture or file while Messenger goes through Tor: fetched by its engine, the way
 * its account goes, to `path` on the phone (never by the app straight). Returns the path.
 */
export async function messengerMedia(url: string, path: string): Promise<string> {
  await msgCall('messenger', 'fetch', { url, path });
  return path;
}
