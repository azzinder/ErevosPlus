// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { checkedChatNotify, type ChatNotify } from '../lock/chat-notify';
import { currentSpace } from '../lock/keys';
import type { Holder } from '../lock/sealed-file';
import type { StickerPlace } from '../lock/sticker-data';
import { lastRestore } from '../lock/restored';
import { loadXmpp, saveXmpp } from '../lock/xmpp-data';
import { checkedLook, type Look } from '../theme/look';
import { changeGuard, type GuardChange } from './chat-protect';
import { followDoor, spaceRelayOf } from './closed-notices';
import { canXmpp } from './core';
import { fileCache, pictureCache } from './file-cache';
import type { Preview } from './chat-parts';
import { t } from './i18n';
import { addNetwork, hearing } from './network-notices';
import { actingWhere, type NetworkWhere } from './network-place';
import { PlaceLives, type PlaceKey } from './place-lives';
import { checkedWriting, type WritingAccount } from './chat-writing';
import { dropUnsent, sendAgain, sendHeld } from './xmpp-writing';
import {
  acceptXmppDevice,
  addCallLine,
  addXmppContact,
  blockXmpp,
  changeXmppText,
  declineXmppRequest,
  forgetXmppChat,
  forwardable,
  forwardXmpp,
  heardXmpp,
  lookUpDevices,
  markXmppRead,
  pinXmpp,
  plainIn,
  prepareXmppFile,
  reactXmpp,
  replyXmppText,
  retractXmpp,
  publishOmemo,
  renameXmppContact,
  renewDevice,
  sendKeepAlive,
  sendXmppFile,
  sendXmppText,
  sendXmppTyping,
  setXmppAvatar,
  signInXmpp,
  registerXmpp,
  changeXmppPassword,
  deleteXmppAccount,
  signOutXmpp,
  startSession,
  takeStanza,
  XmppConnection,
  XmppError,
  type Taken,
  type XmppMessage,
  type XmppState,
  xmppTorWay,
} from './xmpp';
import { fetchXmppAvatar } from './xmpp-avatar';
import { downloadXmppFile, linkFits, shownType, uploadXmppFile, type XmppFile } from './xmpp-files';
import {
  addXmppGroupPeople,
  createXmppGroup,
  declineXmppInvite,
  describeXmppGroup,
  groupPeople,
  joinXmppGroup,
  leaveXmppGroup,
  removeFromXmppGroup,
  renameXmppGroup,
  searchChannels,
  serverChannels,
  setXmppGroupAdmin,
  setXmppGroupSubject,
  type FoundChannel,
} from './xmpp-muc';
import type { connectXmpp, XmppServer } from './xmpp-net';
import { keepXmppPush, startXmppPush, stopXmppPush } from './xmpp-push';
import { onRulesTick } from './chat-rules';
import { sweepXmppRules, xmppRulesDue } from './xmpp-rules';
import { ensureTor } from './tor';
import { accountTorOf, type AccountTor } from './account-tor';
import { onTorWay } from './relay';

// The open space's XMPP account as the screens use it (app/xmpp.tsx, app/xmpp-chat.tsx): loaded
// from its sealed value (lock/xmpp-data.ts), connected to its server while the space is open, and
// kept again after each change. Everything that changes the account runs one after another, as
// lib/matrix-store.ts does; what the server sends is read all the while, apart from that.
//
// It runs once something asks for it (runXmpp), and goes on until the space closes or another
// opens: then it disconnects and lets go of the account. A hidden place's own account runs beside
// it while its hidden chats are open, and while they are closed too if they receive while closed
// (followXmppPlaces, lib/place-networks.ts): the open one's screens show it and act on it
// (lib/network-place.ts); what comes to one tells only of its place (lib/network-notices.ts).

type Live = {
  /** The space's account, or a hidden place's. */
  holder: Holder;
  space: number;
  key: Uint8Array;
  state: XmppState | null;
  loaded: boolean;
  /** What went wrong last, for the screen. */
  problem: string;
  stopped: boolean;
  running: boolean;
  connection: XmppConnection | null;
  queue: Promise<unknown>;
  saving: ReturnType<typeof setTimeout> | null;
  /** What its chats had not read after the last change, to tell of what came (lib/network-notices.ts). */
  heard: ReturnType<typeof hearing>;
  /** Just signed in: what the archive keeps from before is taken in without telling of it. */
  fresh: boolean;
  /** Whether its push while closed (lib/xmpp-push.ts) was looked at this run. */
  pushChecked: boolean;
};

let live: Live | null = null;
// The hidden places' own accounts that run: the open hidden chats', and those receiving while closed.
const places = new PlaceLives<Live>(start, end);
let connect: typeof connectXmpp | undefined;
const listeners = new Set<() => void>();

/** Told each time the account, its contacts or its chats change. */
export function onXmppChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const told = () => listeners.forEach((listener) => listener());

/** For the checks: how the store reaches servers. */
export function setXmppConnect(next: typeof connectXmpp | undefined): void {
  connect = next;
}

/** The open space's account as it is now, or the open hidden place's: null while it loads, or when there is none. */
export function xmppNow(where: NetworkWhere = 'space'): { loaded: boolean; state: XmppState | null; problem: string; online: boolean } {
  const it = where === 'place' ? places.shown() : live;
  return { loaded: it?.loaded ?? false, state: it?.state ?? null, problem: it?.problem ?? '', online: Boolean(it?.connection?.isOpen) };
}

/** The account the screen on top acts on. */
function acting(): Live | null {
  return actingWhere() === 'place' ? places.shown() : live;
}

/** How many messages are not read in the open space's XMPP chats and groups, contact requests and invitations counted as one each. */
export function xmppUnread(): number {
  const state = live?.state;
  if (!state) return 0;
  return Object.values(state.chats).reduce((sum, chat) => sum + chat.unread, 0) + state.requests.length + (state.invites?.length ?? 0);
}

// Each chat's messages not read, by its home row (lib/inbox.ts): one who asks to add the account,
// or an invitation to a group, counts as one.
function unreadAt(state: XmppState | null): Map<string, number> {
  const at = new Map<string, number>();
  for (const chat of Object.values(state?.chats ?? {})) if (chat.unread > 0) at.set(`xmpp:${chat.jid}`, chat.unread);
  for (const jid of [...(state?.requests ?? []), ...(state?.invites ?? []).map((i) => i.room)]) at.set(`xmpp:${jid}`, (at.get(`xmpp:${jid}`) ?? 0) + 1);
  return at;
}

addNetwork('xmpp:', {
  unread: () => (live && !live.stopped ? unreadAt(live.state) : new Map()),
  notifyOf: (where) => checkedChatNotify(live?.state?.chats[where.slice('xmpp:'.length)]?.notify),
});

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function stillOpen(it: Live): boolean {
  if (it.stopped) return false;
  try {
    return currentSpace().space === it.space;
  } catch {
    return false;
  }
}

function keepSoon(it: Live): void {
  if (it.saving) return;
  it.saving = setTimeout(() => {
    it.saving = null;
    // Kept even after the space closed: the keys of what came last must not be lost.
    saveXmpp(it.space, it.key, it.state, it.holder).catch((error: unknown) => {
      it.problem = reason(error);
      told();
    });
  }, 500);
}

/**
 * Runs `change` on the account after every change asked for before, then keeps it and tells the
 * screens, and of the messages that came or were read; a `quiet` change tells of none.
 */
function changeAccount<T>(it: Live, change: () => Promise<T>, quiet = false): Promise<T> {
  const run = it.queue
    .catch(() => undefined)
    .then(async () => {
      const hush = quiet || !it.state;
      try {
        return await change();
      } finally {
        // What is gone by the chats' rules goes from here, before anything tells of it (lib/xmpp-rules.ts).
        if (it.state) sweepXmppRules(it.state);
        // A hidden place's tell only of its place (hearing).
        if (!it.stopped) it.heard.hear(unreadAt(it.state), hush);
      }
    });
  it.queue = run;
  return run.finally(() => {
    keepSoon(it);
    told();
  });
}

// While nothing comes, the accounts that run look for what is gone now and then: the space's, its
// open hidden place's, and one of the places receiving while closed each time.
onRulesTick(() => {
  const due = (it: Live | null): it is Live & { state: XmppState } => !!it && !it.stopped && !!it.state && xmppRulesDue(it.state);
  const closed = places.closed((it) => due(it))?.it ?? null;
  for (const it of new Set([live, places.shown(), closed])) if (due(it)) void changeAccount(it, async () => undefined).catch(() => undefined);
});

/** Changes the account the screen on top acts on, connected or not, after what was asked before, then keeps it and tells the screens (lib/xmpp-rules.ts). */
export function xmppAct<T>(use: (state: XmppState, connection: XmppConnection | null) => Promise<T>): Promise<T> {
  const it = need();
  return changeAccount(it, () => use(it.state, it.connection?.isOpen ? it.connection : null));
}

/** Takes what waits in the connection's inbox; `quiet`, telling of none of it. */
function drain(it: Live, connection: XmppConnection, quiet = false): Promise<void> {
  return changeAccount(it, async () => {
    if (!it.state || it.connection !== connection) return;
    const taken: Taken = { chats: [], republish: false };
    for (const stanza of connection.take()) {
      await takeStanza(it.state, connection, stanza, taken).catch(() => undefined);
    }
    if (taken.republish) await publishOmemo(it.state, connection).catch(() => undefined);
  }, quiet);
}

/** Stays connected while the space is open: connects, waits for the connection to end, and
 *  connects again after a pause that grows while the server cannot be reached. */
async function loop(it: Live): Promise<void> {
  if (it.running) return;
  it.running = true;
  let wait = 2000;
  try {
    while (it.state && stillOpen(it)) {
      const state = it.state;
      try {
        if (xmppTorWay(state) === 'always') await torStarted();
        const connection = await XmppConnection.open(state, connect);
        if (!stillOpen(it) || it.state !== state) {
          connection.close();
          continue;
        }
        it.connection = connection;
        await changeAccount(it, () => startSession(state, connection));
        // Just signed in: the archive's newest messages, from before, came with the session.
        if (it.fresh) {
          await drain(it, connection, true);
          it.fresh = false;
        }
        connection.listen(() => void drain(it, connection));
        if (!it.pushChecked && it.holder === 'space' && state.push) {
          it.pushChecked = true;
          void keepPush(it, connection);
        }
        if (it.problem) it.problem = '';
        told();
        wait = 2000;
        // While it is open: a ping when the server has said nothing for a while, so a connection
        // that died quietly is known.
        while (connection.isOpen && stillOpen(it) && it.state === state) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          if (connection.isOpen && Date.now() - connection.lastHeard > 240_000) {
            await sendKeepAlive(connection).catch(() => connection.close());
          }
        }
        if (connection.error) throw connection.error;
        connection.close();
      } catch (error) {
        it.connection = null;
        // The server no longer takes the password: the account is kept, and asks for it again.
        if (error instanceof XmppError && (error.condition === 'not-authorized' || error.condition === 'conflict')) {
          it.problem = reason(error);
          told();
          return;
        }
        it.problem = reason(error);
        told();
        await new Promise((resolve) => setTimeout(resolve, wait));
        wait = Math.min(wait * 2, 120_000);
      }
    }
  } finally {
    it.connection?.close();
    it.connection = null;
    it.running = false;
    told();
  }
}

// Once a run, once connected: the push while closed as it should be now, as the space moved to another
// relay, or the server or the relay let go of it. What fails is tried again the next run.
async function keepPush(it: Live, connection: XmppConnection): Promise<void> {
  const push = it.state?.push;
  if (!push || !it.state) return;
  try {
    const relay = await spaceRelayOf(it.space, it.key);
    if (!relay || !stillOpen(it) || !it.state || it.connection !== connection) return;
    const next = await keepXmppPush(it.state, connection, push, relay);
    if (next === push || !stillOpen(it)) return;
    await changeAccount(it, async () => {
      if (it.state) it.state.push = next;
    });
    await saveXmpp(it.space, it.key, it.state, it.holder);
    await followDoor(it.space, it.key);
  } catch {
    // Unreachable, or refused: the push stays as it was.
  }
}

/** Whether the open space tells of XMPP messages while closed (lib/xmpp-push.ts). */
export function xmppPushOn(): boolean {
  return !!live?.state?.push;
}

/**
 * Lets the open space tell of XMPP messages while closed, or no more: a queue at its relay and a
 * push to it from the XMPP server, or neither. Its door names the queue as it changes
 * (lib/closed-notices.ts).
 */
export async function xmppSetPush(on: boolean): Promise<void> {
  const it = need();
  if (it.holder !== 'space') throw new Error('A hidden place says nothing while closed.');
  const was = it.state.push;
  if (on === !!was) return;
  const relay = await spaceRelayOf(it.space, it.key);
  if (on) {
    if (!relay) throw new Error(t('This space has no queue at a server yet: it can say nothing while closed.'));
    const push = await startXmppPush(it.state, online(it), relay);
    await changeAccount(it, async () => {
      if (it.state) it.state.push = push;
    });
  } else if (was) {
    await stopXmppPush(was, it.connection, relay ?? undefined);
    await changeAccount(it, async () => {
      if (it.state) delete it.state.push;
    });
  }
  // Kept at once, as the door reads it from what is kept.
  await saveXmpp(it.space, it.key, it.state, it.holder);
  await followDoor(it.space, it.key).catch(() => undefined);
}

/** Loads the open space's account, once, and connects it while the space stays open. */
export function runXmpp(): void {
  if (!canXmpp()) return;
  let space: { space: number; key: Uint8Array };
  try {
    space = currentSpace();
  } catch {
    return;
  }
  if (live && live.space === space.space && !live.stopped) {
    void loop(live);
    return;
  }
  stopXmpp();
  live = start('space', space.space, space.key);
}

/**
 * Runs the own accounts of the hidden places of `space` in `wanted`, each loaded once and connected
 * while it stays wanted, and lets go of the others; `shown` is the pocket of the open hidden chats.
 */
export function followXmppPlaces(space: number, wanted: PlaceKey[], shown: number | null): void {
  const was = places.shown();
  if (!places.follow(space, canXmpp() ? wanted : [], shown)) return;
  // What was fetched for the open hidden chats goes as they close.
  if (was && !places.isShown(was)) {
    fetched.clear();
    pictures.clear();
  }
  told();
}

/** Disconnects every hidden place's account and lets go of them. */
export function closeXmppPlaces(): void {
  if (!places.stopAll()) return;
  fetched.clear();
  pictures.clear();
  told();
}

function end(it: Live): void {
  it.stopped = true;
  it.connection?.close();
}

function start(holder: Holder, space: number, key: Uint8Array, pocket?: number): Live {
  // A hidden place's muted chats tell of nothing (lib/network-notices.ts).
  const heard = hearing(pocket === undefined ? undefined : { space, pocket }, (where) => checkedChatNotify(it.state?.chats[where.slice('xmpp:'.length)]?.notify));
  const it: Live = { holder, space, key, state: null, loaded: false, problem: '', stopped: false, running: false, connection: null, queue: Promise.resolve(), saving: null, heard, fresh: false, pushChecked: false };
  loadXmpp(space, key, holder)
    .then(async (state) => {
      // Restored from a backup since it was last here: it goes on as a new device of the account.
      const restore = await lastRestore();
      if (state && state.restored !== restore) {
        if (state.restored !== undefined) await renewDevice(state);
        state.restored = restore;
        await saveXmpp(space, key, state, holder);
      }
      it.state = state;
      it.heard.hear(unreadAt(state), true);
      it.loaded = true;
      told();
      void loop(it);
    })
    .catch((error: unknown) => {
      it.loaded = true;
      it.problem = reason(error);
      told();
    });
  return it;
}

/** Disconnects and lets go of the account, as its space closes, and of its hidden place's. */
export function stopXmpp(): void {
  fetched.clear();
  pictures.clear();
  closeXmppPlaces();
  if (!live) return;
  live.stopped = true;
  live.connection?.close();
  live = null;
  told();
}

function need(): Live & { state: XmppState } {
  const it = acting();
  if (!it?.state) throw new Error(t('There is no XMPP account in this space.'));
  return it as Live & { state: XmppState };
}

function online(it: Live): XmppConnection {
  if (!it.connection?.isOpen) throw new Error(t('Not connected to the XMPP server yet. Try again in a moment.'));
  return it.connection;
}

/** Signs the open space in to XMPP: `jid` as name@example.org, `server` a host[:port] when its DNS does not say. */
export async function xmppSignIn(jid: string, password: string, server = '', tor: AccountTor = 'never'): Promise<void> {
  const it = acting();
  if (!it || it.stopped) throw new Error(t('There is no XMPP account in this space.'));
  if (tor === 'always') await torStarted();
  await signInWith(it, jid, password, serverOf(server), tor);
}

// Tor started for an account that goes only through it (Always, lib/account-tor.ts), whatever the space's way.
async function torStarted(): Promise<void> {
  try {
    await ensureTor();
  } catch {
    throw new Error(t('Tor is not ready.'));
  }
}

// Signs `it` in, as a new resource with an OMEMO device of its own. Answers whether it kept the
// account: not when one was signed in to meanwhile, which stays.
async function signInWith(it: Live, jid: string, password: string, given: XmppServer | undefined, tor: AccountTor = 'never'): Promise<boolean> {
  const { state, connection } = await signInXmpp(jid, password, given, connect, tor);
  state.restored = await lastRestore();
  let kept = false;
  await changeAccount(it, async () => {
    if (it.state) return;
    it.state = state;
    it.problem = '';
    it.fresh = true;
    kept = true;
  });
  if (!kept) {
    // Its OMEMO device was said already: unsaid, as signing out does.
    await signOutXmpp(state, connection).catch(() => connection.close());
    return false;
  }
  connection.close();
  await saveXmpp(it.space, it.key, state, it.holder);
  void loop(it);
  return true;
}

// The space's own account, or with `place` that hidden place's own while it runs
// (lib/place-networks.ts), loaded, for what Linked devices brings or lets go of
// (lib/linked-accounts.ts): null when `space` is not the open one, the place's does not run, or this
// build has no XMPP.
async function spaceAccount(space: number, place?: PlaceKey): Promise<Live | null> {
  if (!place) runXmpp();
  const now = () => (place ? places.running(space, place.pocket, place.key) : live);
  // A place's starts as its hidden chats open (lib/place-networks.ts), maybe just after its links.
  for (let waited = 0, it = now(); (it ? !it.loaded && !it.stopped : !!place) && waited < 20_000; waited += 200, it = now()) await new Promise((resolve) => setTimeout(resolve, 200));
  const it = now();
  return it && it.loaded && !it.stopped && it.space === space && (place || it.holder === 'space') ? it : null;
}

/**
 * Signs the space `space`, or its hidden `place`, in to the XMPP account its phone gave it
 * (lib/linked-accounts.ts), when it has none: answers whether it did, had that account already, or
 * has another; null when `space` is not open, or the place's account does not run. Throws when it
 * could not sign in, to be tried again.
 */
export async function xmppTake(space: number, jid: string, password: string, server?: XmppServer, place?: PlaceKey): Promise<'brought' | 'had' | 'other' | null> {
  const it = await spaceAccount(space, place);
  if (!it) return null;
  if (it.state) return it.state.jid === jid ? 'had' : 'other';
  if (await signInWith(it, jid, password, server)) return 'brought';
  // One signed in to here meanwhile.
  return (it.state as XmppState | null)?.jid === jid ? 'had' : 'other';
}

/** Signs the space `space` (or its hidden `place`) out of the XMPP account it brought from its phone (`jid`), once unlinked from it, if it still has it. */
export async function xmppLetGo(space: number, jid: string, place?: PlaceKey): Promise<void> {
  const it = await spaceAccount(space, place);
  if (it?.state?.jid === jid) await signOutOf(it);
}

/** host, host:port or a wss:// address, as written on the sign-in screen. */
export function serverOf(text: string): XmppServer | undefined {
  const given = text.trim();
  if (!given) return undefined;
  if (/^wss:\/\//.test(given)) return { websocket: given };
  const match = /^([a-z0-9.-]+)(?::(\d{1,5}))?$/i.exec(given);
  if (!match) throw new Error(t('Write the server as a name, such as xmpp.example.org, or name:port.'));
  const port = Number(match[2] ?? 5222);
  return { host: match[1], port, tls: port === 5223 || port === 443 ? 'direct' : 'starttls' };
}

/** Signs out, and forgets the account in this space. */
export async function xmppSignOut(): Promise<void> {
  await signOutOf(need());
}

async function signOutOf(it: Live): Promise<void> {
  const state = it.state;
  const connection = it.connection;
  // Its queue at the relay goes, and the server pushes there no more.
  if (state?.push) await stopXmppPush(state.push, connection, (await spaceRelayOf(it.space, it.key).catch(() => null)) ?? undefined);
  await changeAccount(it, async () => {
    if (state) await signOutXmpp(state, connection);
    it.connection = null;
    it.state = null;
  });
  await saveXmpp(it.space, it.key, null, it.holder);
  if (it.holder === 'space' && state?.push) await followDoor(it.space, it.key).catch(() => undefined);
}

/** Sends words; a preview of a link in them goes only where the chat is not encrypted (lib/xmpp-links.ts). */
export function xmppSend(jid: string, text: string, preview?: Preview | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await sendXmppText(it.state, online(it), jid, text, preview);
  });
}

/**
 * Makes a new account on its server (XEP-0077) and signs the space in with it, as signing in does.
 * A server that makes none here says so, with its page when it named one (XmppRegisterError).
 */
export async function xmppRegister(jid: string, password: string, server = '', tor: AccountTor = 'never'): Promise<void> {
  const it = acting();
  if (!it || it.stopped) throw new Error(t('There is no XMPP account in this space.'));
  if (it.state) throw new Error(t('This space is signed in to XMPP already.'));
  if (tor === 'always') await torStarted();
  const { state, connection } = await registerXmpp(jid, password, serverOf(server), connect, tor);
  connection.close();
  state.restored = await lastRestore();
  await changeAccount(it, async () => {
    it.state = state;
    it.problem = '';
    it.fresh = true;
  });
  await saveXmpp(it.space, it.key, state, it.holder);
  void loop(it);
}

/** Gives the account a new password on its server, and keeps it for the next sign-in. */
export function xmppChangePassword(password: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => changeXmppPassword(it.state, online(it), password));
}

/** Deletes the account on its server, then forgets it here, as signing out does. It cannot be brought back. */
export async function xmppDeleteAccount(): Promise<void> {
  const it: Live = need();
  const state = it.state;
  if (state?.push) await stopXmppPush(state.push, it.connection, (await spaceRelayOf(it.space, it.key).catch(() => null)) ?? undefined).catch(() => undefined);
  await changeAccount(it, async () => {
    if (state) await deleteXmppAccount(state, online(it));
    it.connection = null;
    it.state = null;
  });
  await saveXmpp(it.space, it.key, null, it.holder);
  if (it.holder === 'space' && state?.push) await followDoor(it.space, it.key).catch(() => undefined);
}

/** The groups our server lists. */
export function xmppServerChannels(): Promise<FoundChannel[]> {
  const it = need();
  return serverChannels(it.state, online(it));
}

/** Public groups on any server, from the search of search.jabber.network, which learns what was looked for. */
export function xmppSearchChannels(term: string): Promise<FoundChannel[]> {
  const it = need();
  return searchChannels(it.state, online(it), term);
}

/** Tells a contact we write, or stopped, when the account says so; nothing while offline or on failure. */
export function xmppTyped(jid: string, typing: boolean): void {
  const it = acting();
  if (!it?.state?.sayTyping || !it.connection?.isOpen) return;
  void sendXmppTyping(it.state, it.connection, jid, typing).catch(() => undefined);
}

/** Puts our profile picture on the server for our contacts, or takes it away with null. */
export function xmppSetAvatar(picture: { bytes: Uint8Array; type: string } | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await setXmppAvatar(it.state, online(it), picture);
  });
}

// Profile pictures fetched while Erevos runs, by address and SHA-1: kept in memory only.
const pictures = pictureCache(8 * 1024 * 1024);

/** Someone's profile picture (ours too), as its note last said, or null when they have none or it cannot be had now. */
export async function xmppAvatar(jid: string, where: NetworkWhere = 'space'): Promise<Uint8Array | null> {
  const it = where === 'place' ? places.shown() : live;
  const avatar = it?.state?.avatars?.[jid];
  if (!it?.state || !avatar) return null;
  const connection = it.connection;
  return pictures.get(`${jid} ${avatar.id}`, async () => {
    if (!connection?.isOpen) throw new Error('offline');
    return fetchXmppAvatar(connection, jid, avatar);
  }).catch(() => null);
}

// Changes what decides the account's Tor (its choice, or a chat's «Through Tor»), then, when the way
// that counts changed, connects again that way at once: the loop sees the connection closed.
async function changeTor(it: Live & { state: XmppState }, change: (state: XmppState) => void): Promise<void> {
  const before = xmppTorWay(it.state);
  const after = xmppTorWay((() => {
    // Tried first on a copy (each chat copied, its messages not), to know whether the way changes.
    const next = { tor: it.state.tor, chats: Object.fromEntries(Object.entries(it.state.chats).map(([jid, chat]) => [jid, { ...chat }])) };
    change(next as XmppState);
    return next;
  })());
  if (after === 'always') await torStarted();
  await changeAccount(it, async () => change(it.state));
  if (after !== before) it.connection?.close();
}

/** The account's Tor choice (lib/account-tor.ts): Off, as the space, or Always. */
export function xmppSetTor(way: AccountTor): Promise<void> {
  return changeTor(need(), (state) => {
    state.tor = way;
  });
}

/** «Through Tor» for the chat `jid`: while on, the whole account goes only through Tor. */
export function xmppSetChatTor(jid: string, on: boolean): Promise<void> {
  return changeTor(need(), (state) => {
    const chat = (state.chats[jid] ??= { jid, messages: [], unread: 0, lastAt: 0 });
    if (on) chat.tor = true;
    else delete chat.tor;
  });
}

/** The Tor way that counts now for the account the screen on top acts on, and its address: null when it has none. */
export function xmppActingTor(): { jid: string; way: AccountTor } | null {
  const state = acting()?.state;
  return state ? { jid: state.jid, way: xmppTorWay(state) } : null;
}

/** The account's own Tor choice, and the one that counts now (Always while a chat goes «Through Tor»). */
export function xmppTor(where: NetworkWhere = 'space'): { own: AccountTor; now: AccountTor; chats: boolean } {
  const state = (where === 'place' ? places.shown() : live)?.state;
  if (!state) return { own: 'never', now: 'never', chats: false };
  const own = accountTorOf(state.tor);
  const now = xmppTorWay(state);
  return { own, now, chats: now === 'always' && own !== 'always' };
}

/** Whether the others are told when we write. */
export function xmppSetSayTyping(on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    if (on) it.state.sayTyping = true;
    else delete it.state.sayTyping;
  });
}

/** Blocks someone, or lets them through again, on every app of the account. */
export function xmppBlock(jid: string, block: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await blockXmpp(it.state, online(it), jid, block);
  });
}

/** Answers the message `to` of a chat with `text`. */
export function xmppReply(jid: string, text: string, to: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await replyXmppText(it.state, online(it), jid, text, to);
  });
}

/** Gives a message of ours new words. */
export function xmppChange(jid: string, id: string, text: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await changeXmppText(it.state, online(it), jid, id, text);
  });
}

/** Reacts to a message with `emoji`, or takes our reaction back. */
export function xmppReact(jid: string, id: string, emoji: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await reactXmpp(it.state, online(it), jid, id, emoji);
  });
}

/** Takes a message of ours back, for everyone in the chat. */
export function xmppDelete(jid: string, id: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await retractXmpp(it.state, online(it), jid, id);
  });
}

/** A photo or file as picked, to send; a voice message recorded here says how long it lasts, in milliseconds, kept here only. */
export type XmppOutgoingFile = { bytes: Uint8Array; name: string; mime: string; duration?: number };

/**
 * Sends a photo or file: encrypted here when the chat is, put on the server's HTTP upload, and its
 * link in a message. The upload runs between two changes of the account, so what comes meanwhile
 * is not held back.
 */
export function xmppSendFile(jid: string, picked: XmppOutgoingFile): Promise<void> {
  return sendUploaded(need(), jid, picked, false);
}

/**
 * A sticker as the picture that goes: one made here from a photo (lock/sticker-data.ts), or a
 * built-in one drawn as a still. Its size and label say nothing on the way: an XMPP file message is
 * its link alone, and other apps show it as the photo it is.
 */
export type XmppSticker = { bytes: Uint8Array; mime: 'image/png' | 'image/jpeg'; w: number; h: number; label?: string };

/**
 * Sends a sticker to the chat `jid`, as a photo goes (xmppSendFile): encrypted when the chat is.
 * Every sticker an XMPP chat sends goes through here, whichever made its picture.
 */
export function xmppSendSticker(jid: string, sticker: XmppSticker): Promise<void> {
  return xmppSendFile(jid, { bytes: sticker.bytes, name: sticker.mime === 'image/png' ? 'sticker.png' : 'sticker.jpg', mime: sticker.mime });
}

// Puts a file on the server as the chat `jid` writes, and sends it there: as a copy from another chat when `forward`.
async function sendUploaded(it: Live & { state: XmppState }, jid: string, picked: XmppOutgoingFile, forward: boolean): Promise<void> {
  let ready: Awaited<ReturnType<typeof prepareXmppFile>> | null = null;
  await changeAccount(it, async () => {
    ready = await prepareXmppFile(it.state, online(it), jid);
  });
  const { encrypt, service } = ready!;
  const file = await uploadXmppFile(online(it), service, { bytes: picked.bytes, name: picked.name, type: picked.mime }, encrypt, xmppTorWay(it.state));
  if (picked.duration && picked.duration > 0) file.duration = Math.round(picked.duration);
  await changeAccount(it, async () => {
    if (forward) await forwardXmpp(it.state, online(it), jid, { file });
    else await sendXmppFile(it.state, online(it), jid, file);
  });
}

/**
 * Sends copies of messages of another chat to the chat `to`, one after another, the oldest first,
 * each marked as forwarded (lib/xmpp.ts forwardXmpp): words as new words; a file by its link when
 * that chat is written as the file was (lib/xmpp-files.ts linkFits), or else fetched and put on the
 * server again, encrypted as that chat is. One that cannot go (taken back, locked) is left out.
 */
export async function xmppForward(to: string, messages: XmppMessage[]): Promise<void> {
  const it = need();
  for (const message of [...messages].sort((a, b) => a.at - b.at)) {
    if (!forwardable(message)) continue;
    const file = message.file;
    const target = it.state.chats[to];
    const encrypt = !target || !plainIn(target);
    if (!file) {
      await changeAccount(it, async () => {
        await forwardXmpp(it.state, online(it), to, { text: message.text });
      });
    } else if (linkFits(file, encrypt)) {
      await changeAccount(it, async () => {
        await forwardXmpp(it.state, online(it), to, { file: { ...file } });
      });
    } else {
      const bytes = await xmppFile(file);
      await sendUploaded(it, to, { bytes, name: file.name, mime: shownType(file), duration: file.duration }, true);
    }
  }
}

/** Pins a message of a chat on this device only, or unpins it. */
export function xmppPin(jid: string, id: string, on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => pinXmpp(it.state, jid, id, on), true);
}

/** Keeps how long a sound of a chat lasts, once it was fetched and read (components/network-file.tsx). */
export function xmppHeard(jid: string, id: string, ms: number): Promise<void> {
  const it = need();
  return changeAccount(it, async () => void heardXmpp(it.state, jid, id, ms), true);
}

/**
 * Whose stickers made from photos the chats of an account send (lock/sticker-data.ts): the open
 * space's, or with 'place' the open hidden place's own, as its hidden chats have them. Null while
 * there is none.
 */
export function xmppStickerPlace(where: NetworkWhere = 'space'): StickerPlace | null {
  const it = where === 'place' ? places.shown() : live;
  return it && !it.stopped ? { holder: it.holder, space: it.space, key: it.key } : null;
}

/** Sends again one of ours that did not go, in its place (lib/xmpp-writing.ts). */
export function xmppSendAgain(jid: string, id: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => sendAgain(it.state, online(it), jid, id));
}

/** Forgets one of ours that did not go. */
export function xmppDropUnsent(jid: string, id: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => dropUnsent(it.state, jid, id));
}

// An account's drafts and messages held for later (lib/chat-writing.ts), changed in turn with the
// rest of it, telling of nothing. It can send while connected.
function writingOf(it: Live): WritingAccount {
  return {
    now: () => checkedWriting(it.state?.writing),
    change: (use) =>
      changeAccount(
        it,
        async () => {
          if (it.state) it.state.writing = use(checkedWriting(it.state.writing));
        },
        true,
      ),
    keep: async () => {
      if (it.state) await saveXmpp(it.space, it.key, it.state, it.holder);
    },
    ready: () => !it.stopped && !!it.state && !!it.connection?.isOpen,
    has: (chat) => !!it.state && (!!it.state.chats[chat] || !!it.state.roster[chat]),
    send: (held) =>
      changeAccount(it, async () => {
        if (!it.state) throw new Error(t('There is no XMPP account in this space.'));
        await sendHeld(it.state, online(it), held);
      }),
  };
}

/** The drafts and messages held of the open space's account, or of the open hidden place's own; null with none. */
export function xmppWriting(where: NetworkWhere = 'space'): WritingAccount | null {
  const it = where === 'place' ? places.shown() : live;
  return it && !it.stopped && it.state ? writingOf(it) : null;
}

/** Those of every account that runs: the space's, and its hidden places' (lib/chat-later.ts). */
export function xmppWritings(): WritingAccount[] {
  return [live, ...places.all()].filter((it): it is Live => !!it && !it.stopped && !!it.state).map(writingOf);
}

// Files fetched while Erevos runs, so one looked at again is not fetched again (lib/file-cache.ts).
const fetched = fileCache(40 * 1024 * 1024);

/** A message's photo or file, fetched from the server and opened, or kept from before. */
export function xmppFile(file: XmppFile): Promise<Uint8Array> {
  const state = acting()?.state;
  const way = state ? xmppTorWay(state) : 'never';
  return fetched.get(file.url, () => downloadXmppFile(file, way));
}

/** Writes to a person whose apps have no OMEMO without encryption from now on (or with it again). */
export function xmppSetPlain(jid: string, plain: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = (it.state.chats[jid] ??= { jid, messages: [], unread: 0, lastAt: 0 });
    chat.plain = plain || undefined;
  });
}

/** Takes the other key a device of `jid` came with, once the person compared it: what is written goes to it again. */
export function xmppAcceptDevice(jid: string, id: string, two: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => acceptXmppDevice(it.state, jid, id, two));
}

/** A chat's own notifications (lock/chat-notify.ts), or the app's again with null. */
export function xmppSetNotify(jid: string, notify: ChatNotify | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = (it.state.chats[jid] ??= { jid, messages: [], unread: 0, lastAt: 0 });
    if (notify) chat.notify = notify;
    else delete chat.notify;
  });
}

/** A chat's own look (theme/look.ts), or the space's again with null. */
export function xmppSetLook(jid: string, look: Look | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const chat = (it.state.chats[jid] ??= { jid, messages: [], unread: 0, lastAt: 0 });
    if (look) chat.look = checkedLook(look);
    else delete chat.look;
  });
}

/** A chat's PIN of its own, or its screenshots blocked, on this device only (lib/chat-protect.ts). */
export function xmppSetGuard(jid: string, change: GuardChange): Promise<void> {
  const it = need();
  return changeAccount(it, async () => changeGuard((it.state.chats[jid] ??= { jid, messages: [], unread: 0, lastAt: 0 }), change));
}

export function xmppRead(jid: string): Promise<void> {
  const it = need();
  if (!it.state.chats[jid]?.unread) return Promise.resolve();
  return changeAccount(it, () => markXmppRead(it.state, it.connection, jid));
}

export function xmppAddContact(jid: string, name?: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => addXmppContact(it.state, online(it), jid, name));
}

/** Names a contact as we see them, in the account's contacts on its server (lib/xmpp.ts renameXmppContact). */
export function xmppRenameContact(jid: string, name: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => renameXmppContact(it.state, online(it), jid, name));
}

export function xmppDecline(jid: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => declineXmppRequest(it.state, online(it), jid));
}

// An account and its connection, while it is connected.
function linkOf(it: Live | null): { state: XmppState; connection: XmppConnection } | null {
  return it?.state && it.connection?.isOpen ? { state: it.state, connection: it.connection } : null;
}

// Keeps a call's line in a chat of the account; one with the same `id` is said again in its place.
function callLineOf(it: Live | null, jid: string, mine: boolean, text: string, id: string, at: number): Promise<void> {
  if (!it?.state) return Promise.resolve();
  return changeAccount(it, async () => {
    if (it.state) addCallLine(it.state, jid, mine, text, id, at);
  });
}

const openPlace = () => places.shown();

/** The open space's account and its connection, while it is connected: for calls (lib/xmpp-calls.ts). */
export const xmppLink = () => linkOf(live);

/** Keeps a call's line in a chat of the space's account; one with the same `id` is said again in its place. */
export const xmppCallLine = (jid: string, mine: boolean, text: string, id: string, at = Date.now()) => callLineOf(live, jid, mine, text, id, at);

/** The open hidden place's own account, for its calls while its hidden chats are open: whether they
 *  are, the account and its connection while it is connected, and its chats' call lines. */
export const xmppPlaceAccount = {
  open: () => !!openPlace(),
  now: () => openPlace()?.state ?? null,
  link: () => linkOf(openPlace()),
  line: (jid: string, mine: boolean, text: string, id: string, at = Date.now()) => callLineOf(openPlace(), jid, mine, text, id, at),
};

/** Of the account `state` is, when it is a closed hidden place's that receives (lib/place-receiver.ts):
 *  its space and pocket, and its chats' call lines, for the calls that come to it. */
export function xmppClosedPlace(state: XmppState): { space: number; pocket: number; line(jid: string, mine: boolean, text: string, id: string, at?: number): Promise<void> } | null {
  const found = places.closed((it) => it.state === state);
  if (!found) return null;
  const { it, pocket } = found;
  return { space: it.space, pocket, line: (jid, mine, text, id, at = Date.now()) => callLineOf(it, jid, mine, text, id, at) };
}

export function xmppForgetChat(jid: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    if (it.state.chats[jid]?.room) await leaveXmppGroup(it.state, it.connection, jid);
    else forgetXmppChat(it.state, jid);
  });
}

/** Makes a private group named `name` with `people` (lib/xmpp-muc.ts), and answers its address. */
export function xmppCreateGroup(name: string, people: string[]): Promise<string> {
  const it = need();
  return changeAccount(it, () => createXmppGroup(it.state, online(it), name, people));
}

/** Joins a group by its address, or as an invitation asked; answers its address. */
export function xmppJoinGroup(address: string, password?: string): Promise<string> {
  const it = need();
  return changeAccount(it, () => joinXmppGroup(it.state, online(it), address, password));
}

export function xmppDeclineInvite(room: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => declineXmppInvite(it.state, it.connection, room));
}

/** Sets a group's subject (its admins). */
export function xmppSetSubject(room: string, subject: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => setXmppGroupSubject(it.state, online(it), room, subject));
}

/** Gives a group a new description, or takes it away with empty words (its owner). */
export function xmppDescribeGroup(room: string, description: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => describeXmppGroup(it.state, online(it), room, description));
}

/** Renames a group (its owner). */
export function xmppRenameGroup(room: string, name: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => renameXmppGroup(it.state, online(it), room, name));
}

/** Takes someone out of a group, or bars them from it with `ban` (its admins). */
export function xmppRemoveFromGroup(room: string, who: { address?: string; nick?: string }, ban = false): Promise<void> {
  const it = need();
  return changeAccount(it, () => removeFromXmppGroup(it.state, online(it), room, who, ban));
}

/** Makes a member an admin of a group, or a plain member again (its owner). */
export function xmppSetGroupAdmin(room: string, member: string, admin: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, () => setXmppGroupAdmin(it.state, online(it), room, member, admin));
}

/** Adds people to a group: members of a private one, and invited. */
export function xmppAddToGroup(room: string, people: string[]): Promise<void> {
  const it = need();
  return changeAccount(it, () => addXmppGroupPeople(it.state, online(it), room, people));
}

/** Looks up the keys of a chat's person, or of a private group's members, so they show before anything is written. */
export function xmppLookUpKeys(jid: string): Promise<void> {
  const it = need();
  const room = it.state.chats[jid]?.room;
  const people = room ? (room.private ? groupPeople(it.state, room) : []) : [jid];
  if (!people.length || !it.connection?.isOpen) return Promise.resolve();
  return changeAccount(it, () => lookUpDevices(it.state, online(it), people));
}

/** Leaves a group, on the account's other apps too, and forgets it here. */
export function xmppLeaveGroup(room: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => leaveXmppGroup(it.state, it.connection, room));
}

// INVISIBLE chosen or left (lib/modes.ts): every account goes through Tor in it, whatever it chose
// (lib/account-tor.ts), so a connection made the other way connects again, at once (the loop sees it
// closed). One that goes only through Tor anyway stays.
onTorWay(() => {
  for (const it of [live, ...places.all()]) {
    if (!it || it.stopped || !it.state || xmppTorWay(it.state) === 'always') continue;
    it.connection?.close();
  }
});
