// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { checkedChatNotify, type ChatNotify } from '../lock/chat-notify';
import { loadMatrix, saveMatrix } from '../lock/matrix-data';
import type { StickerPlace } from '../lock/sticker-data';
import { currentSpace } from '../lock/keys';
import { lastRestore, restoreWasMove } from '../lock/restored';
import type { Holder } from '../lock/sealed-file';
import { checkedLook, type Look } from '../theme/look';
import { changeGuard, type GuardChange } from './chat-protect';
import { canMatrix } from './core';
import { randomBytes, sha256Bytes, toHex } from './crypto';
import { pictureCache } from './file-cache';
import { t } from './i18n';
import {
  deleteMessage,
  findHomeserver,
  loginWays,
  signInWithToken,
  ssoLink,
  type LoginWays,
  createGroup,
  inviteToRoom,
  joinRoom,
  leaveRoom,
  loadEarlier,
  markRead,
  MatrixError,
  OWN_ROOM_NAME,
  sendChange,
  sendInThread,
  sendLocation,
  sendPoll,
  sendPollEnd,
  sendReaction,
  sendReply,
  sendText,
  sendVote,
  type Json,
  sendTyping,
  fetchOwnAvatar,
  setOwnAvatar,
  signIn,
  signOut,
  startChat,
  syncApply,
  syncFetch,
  sendOwnPresence,
  takeBackReaction,
  type MatrixFile,
  type MatrixMessage,
  type MatrixRoom,
  type MatrixState,
  type MatrixTor,
  roomsThroughTor,
  matrixWayOf,
} from './matrix';
import { ACCOUNT_TOR_DEFAULT, accountThroughTor, accountTorOf } from './account-tor';
import { formattedOf } from './matrix-html';
import { backUpKeys, recoveryInfo, restoreLocked, setUpRecovery, takeGiven, unlockRecovery, type Unlocked } from './matrix-backup';
import { fetchFile, fetchPicture, sendFile, sendSticker, uploadPicture, type OutgoingFile, type OutgoingSticker } from './matrix-media';
import { learnRule, removeMember, renameRoom, roomMembers, searchPeople, setAdmin, setTopic, type FoundPerson, type RoomMember } from './matrix-members';
import { listDevices, register, renameDevice, signOutDevices, type AccountDevice, type AuthAsk } from './matrix-account';
import { pollShown, previewContent } from './matrix-parts';
import { onRulesTick } from './chat-rules';
import { matrixRulesDue, sweepMatrixRules } from './matrix-rules';
import { learnJoins, leaveAndForget, pinMessage, publicRooms, spaceRooms, tagRoom, type FoundRoom } from './matrix-rooms';
import type { Place, Poll, Preview } from './chat-parts';
import type { GivenMatrix } from './link-wire';
import {
  acceptVerification,
  cancelVerification,
  confirmScanned,
  confirmVerification,
  forgetVerifications,
  onVerificationChange,
  requestVerification,
  scanCode,
  type Verification,
  verifications,
  verifyByEmoji,
} from './matrix-verify';
import { followDoor, spaceRelayOf } from './closed-notices';
import { keepMatrixPush, startMatrixPush, stopMatrixPush } from './matrix-push';
import { addNetwork, hearing } from './network-notices';
import type { MatrixCallsAccount } from './matrix-calls';
import { actingWhere, type NetworkWhere } from './network-place';
import { PlaceLives, type PlaceKey } from './place-lives';
import { checkedWriting, type WritingAccount } from './chat-writing';
import { dropUnsent, sendAgain, sendHeld, unsentIn } from './matrix-writing';

// The open space's Matrix account as the screens use it (app/matrix.tsx, app/matrix-chat.tsx):
// loaded from its sealed value (lock/matrix-data.ts), synced with its homeserver while it runs,
// and kept again after each change. Everything that changes the account runs one after another;
// a sync waits on the homeserver outside of that, so a message goes out while it waits.
//
// It runs once something asks for it (runMatrix), and goes on until the space closes or another
// opens: then it stops and lets go of the account. A hidden place's own account runs beside it
// while its hidden chats are open, and while they are closed too if they receive while closed
// (followMatrixPlaces, lib/place-networks.ts): the open one's screens show it and act on it
// (lib/network-place.ts); what comes to one tells only of its place (lib/network-notices.ts), and
// none has push. Its calls are made while its hidden chats are open, and ring then, or with no
// name while they are closed and receive (lib/matrix-calls.ts).

type Live = {
  /** The space's account, or a hidden place's. */
  holder: Holder;
  space: number;
  key: Uint8Array;
  state: MatrixState | null;
  loaded: boolean;
  /** What went wrong last, for the screen. */
  problem: string;
  stopped: boolean;
  running: boolean;
  queue: Promise<unknown>;
  saving: ReturnType<typeof setTimeout> | null;
  /** Room keys already asked of the key backup while it runs. */
  asked: Set<string>;
  /** What its rooms had not read after the last change, to tell of what came (lib/network-notices.ts). */
  heard: ReturnType<typeof hearing>;
  /** Whether its push while closed (lib/matrix-push.ts) was looked at this run. */
  pushChecked: boolean;
  /** The Tor way chosen before signing in, which the account then keeps (MatrixState.tor): in memory only. */
  tor?: MatrixTor;
};

let live: Live | null = null;
// The hidden places' own accounts that run: the open hidden chats', and those receiving while closed.
const places = new PlaceLives<Live>(start, end);
const listeners = new Set<() => void>();

/** Told each time the account, its rooms or their messages change. */
export function onMatrixChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const told = () => listeners.forEach((listener) => listener());
onVerificationChange(told);

/** The open space's account as it is now, or the open hidden place's: null while it loads, or when there is none. */
export function matrixNow(where: NetworkWhere = 'space'): { loaded: boolean; state: MatrixState | null; problem: string } {
  const it = where === 'place' ? places.shown() : live;
  return { loaded: it?.loaded ?? false, state: it?.state ?? null, problem: it?.problem ?? '' };
}

/** How the account `where` reaches its homeserver (lib/account-tor.ts): its own way once signed in, or the one chosen for signing in; Off unless chosen. */
export function matrixTorWay(where: NetworkWhere = 'space'): MatrixTor {
  const it = where === 'place' ? places.shown() : live;
  return accountTorOf(it?.state ? it.state.tor : it?.tor);
}

/** Whether a room of the account `where` goes «Through Tor», which makes the whole account go only through Tor. */
export function matrixRoomsThroughTor(where: NetworkWhere = 'space'): boolean {
  const it = where === 'place' ? places.shown() : live;
  return !!it?.state && roomsThroughTor(it.state);
}

/**
 * Sets how the account on the screen reaches its homeserver: from its next request on, the sync
 * too. Before signing in, how the sign-in goes, and the account then keeps it.
 */
export function matrixSetTor(way: MatrixTor): Promise<void> {
  const it = acting();
  if (!it || it.stopped) return Promise.reject(new Error(t('There is no Matrix account in this space.')));
  if (!it.state) {
    if (way === ACCOUNT_TOR_DEFAULT) delete it.tor;
    else it.tor = way;
    told();
    return Promise.resolve();
  }
  const signed = it as Live & { state: MatrixState };
  return changeAccount(signed, async () => {
    if (way === ACCOUNT_TOR_DEFAULT) delete signed.state.tor;
    else signed.state.tor = way;
  });
}

/** Whether the account on the screen (lib/network-place.ts) sends through Tor now, `files` for photos and files: its way, or Always while a room of it goes «Through Tor». */
export function matrixActingThroughTor(files = false): boolean {
  const it = acting();
  return accountThroughTor(it?.state ? matrixWayOf(it.state) : accountTorOf(it?.tor), files);
}

/** A room's «Through Tor»: on, the whole account goes only through Tor while it is (lib/matrix.ts matrixWayOf). */
export function matrixSetRoomTor(roomId: string, on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const room = it.state.rooms[roomId];
    if (!room) return;
    if (on) room.tor = true;
    else delete room.tor;
  });
}

// The Tor way an account signing in goes by: the one chosen on its screen.
const signingTor = (it: Live): MatrixTor | undefined => it.tor;

/** The account the screen on top acts on. */
function acting(): Live | null {
  return actingWhere() === 'place' ? places.shown() : live;
}

/** How many messages are not read in the open space's Matrix rooms, invites counted as one each. */
export function matrixUnread(): number {
  const rooms = Object.values(live?.state?.rooms ?? {});
  return rooms.reduce((sum, room) => sum + (room.invitedBy ? 1 : room.unread), 0);
}

// Each room's messages not read, by its home row (lib/inbox.ts): an invite counts as one.
function unreadAt(state: MatrixState | null): Map<string, number> {
  const at = new Map<string, number>();
  for (const room of Object.values(state?.rooms ?? {})) {
    const n = room.invitedBy ? 1 : room.unread;
    if (n > 0) at.set(`matrix:${room.id}`, n);
  }
  return at;
}

addNetwork('matrix:', {
  unread: () => (live && !live.stopped ? unreadAt(live.state) : new Map()),
  notifyOf: (where) => checkedChatNotify(live?.state?.rooms[where.slice('matrix:'.length)]?.notify),
});

function reason(error: unknown): string {
  if (error instanceof MatrixError && error.code === 'M_FORBIDDEN') return t('The Matrix server says the name or the password is wrong.');
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
    saveMatrix(it.space, it.key, it.state, it.holder).catch((error: unknown) => {
      it.problem = reason(error);
      told();
    });
  }, 500);
}

/**
 * Runs `change` on the account after every change asked for before, then keeps it and tells the
 * screens, and of the messages that came or were read. Until its first sync, an account only takes
 * in what came before it, and tells of none of it.
 */
function changeAccount<T>(it: Live, change: () => Promise<T>): Promise<T> {
  const run = it.queue
    .catch(() => undefined)
    .then(async () => {
      const quiet = !it.state?.since;
      try {
        return await change();
      } finally {
        // A hidden place's tell only of its place (hearing).
        if (!it.stopped) it.heard.hear(unreadAt(it.state), quiet);
      }
    });
  it.queue = run;
  return run.finally(() => {
    keepSoon(it);
    told();
  });
}

// What is gone by the rooms' rules goes from the account, ours taken back for everyone first (lib/matrix-rules.ts).
const sweep = (state: MatrixState) => sweepMatrixRules(state, (roomId, id) => deleteMessage(state, roomId, id)).catch(() => false);

// While nothing comes, the accounts that run look for what is gone now and then: the space's, its
// open hidden place's, and one of the places receiving while closed each time.
onRulesTick(() => {
  const due = (it: Live | null): it is Live & { state: MatrixState } => !!it && !it.stopped && !!it.state && matrixRulesDue(it.state);
  const closed = places.closed((it) => due(it))?.it ?? null;
  for (const it of new Set([live, places.shown(), closed])) if (due(it)) void changeAccount(it, () => sweep(it.state)).catch(() => undefined);
});

/** Changes the account the screen on top acts on, after what was asked before, then keeps it and tells the screens (lib/matrix-rules.ts). */
export function matrixAct<T>(use: (state: MatrixState) => Promise<T>): Promise<T> {
  const it = need();
  return changeAccount(it, () => use(it.state));
}

// The accounts told they are offline this run (loop).
const toldOffline = new WeakSet<MatrixState>();

async function loop(it: Live): Promise<void> {
  if (it.running) return;
  it.running = true;
  let wait = 2000;
  try {
    while (it.state && stillOpen(it)) {
      const since = it.state.since;
      try {
        const news = await syncFetch(it.state, since ? 30_000 : 0);
        if (!stillOpen(it) || !it.state || it.state.since !== since) continue;
        await changeAccount(it, async () => {
          if (!it.state) return;
          await syncApply(it.state, news);
          // With a key backup: locked messages ask it for their keys, and new keys go into it.
          if (it.state.backup) {
            await restoreLocked(it.state, it.asked).catch(() => 0);
            await backUpKeys(it.state).catch(() => 0);
          }
          await sweep(it.state);
        });
        if (it.problem) {
          it.problem = '';
          told();
        }
        // Once a run: an account that showed online before (as every one did before 7.0.0) shows offline now.
        if (it.state && !it.state.sayOnline && !toldOffline.has(it.state)) {
          toldOffline.add(it.state);
          void sendOwnPresence(it.state).catch(() => undefined);
        }
        if (!it.pushChecked && it.holder === 'space') {
          it.pushChecked = true;
          void keepPush(it);
          void changeAccount(it, async () => {
            if (it.state) await fetchOwnAvatar(it.state);
          }).catch(() => undefined);
        }
        wait = 2000;
      } catch (error) {
        // The homeserver signed this device out: the account is forgotten here too.
        if (error instanceof MatrixError && error.code === 'M_UNKNOWN_TOKEN') {
          it.state = null;
          it.problem = t('The Matrix server signed this device out. Sign in again.');
          keepSoon(it);
          told();
          return;
        }
        it.problem = reason(error);
        told();
        await new Promise((resolve) => setTimeout(resolve, wait));
        wait = Math.min(wait * 2, 60_000);
      }
    }
  } finally {
    it.running = false;
  }
}

// Once a run, after a sync: the push while closed as it should be now, as the space moved to another
// relay, or the homeserver or the relay let go of it. What fails is tried again the next run.
async function keepPush(it: Live): Promise<void> {
  const push = it.state?.push;
  if (!push || !it.state) return;
  try {
    const relay = await spaceRelayOf(it.space, it.key);
    if (!relay || !stillOpen(it) || !it.state) return;
    const next = await keepMatrixPush(it.state, push, relay);
    if (next === push || !stillOpen(it)) return;
    await changeAccount(it, async () => {
      if (it.state) it.state.push = next;
    });
    await saveMatrix(it.space, it.key, it.state);
    await followDoor(it.space, it.key);
  } catch {
    // Unreachable, or refused: the push stays as it was.
  }
}

/** Whether the open space tells of Matrix messages while closed (lib/matrix-push.ts). */
export function matrixPushOn(): boolean {
  return !!live?.state?.push;
}

/**
 * Lets the open space tell of Matrix messages while closed, or no more: a queue at its relay and a
 * pusher on the homeserver, or neither. Its door names the queue as it changes (lib/closed-notices.ts).
 */
export async function matrixSetPush(on: boolean): Promise<void> {
  const it = need();
  if (it.holder !== 'space') throw new Error('A hidden place says nothing while closed.');
  const was = it.state.push;
  if (on === !!was) return;
  const relay = await spaceRelayOf(it.space, it.key);
  if (on) {
    if (!relay) throw new Error(t('This space has no queue at a server yet: it can say nothing while closed.'));
    const push = await startMatrixPush(it.state, relay);
    await changeAccount(it, async () => {
      it.state.push = push;
    });
  } else if (was) {
    await stopMatrixPush(it.state, was, relay ?? undefined);
    await changeAccount(it, async () => {
      delete it.state.push;
    });
  }
  // Kept at once, as the door reads it from what is kept.
  await saveMatrix(it.space, it.key, it.state);
  await followDoor(it.space, it.key).catch(() => undefined);
}

/** Loads the open space's account, once, and syncs it while the space stays open. */
export function runMatrix(): void {
  if (!canMatrix()) return;
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
  stopMatrix();
  live = start('space', space.space, space.key);
}

/**
 * Runs the own accounts of the hidden places of `space` in `wanted`, each loaded once and synced
 * while it stays wanted, and lets go of the others; `shown` is the pocket of the open hidden chats.
 */
export function followMatrixPlaces(space: number, wanted: PlaceKey[], shown: number | null): void {
  const was = places.shown();
  if (!places.follow(space, canMatrix() ? wanted : [], shown)) return;
  // What was fetched for the open hidden chats goes as they close.
  if (was && !places.isShown(was)) fetched.clear();
  told();
}

/** Stops every hidden place's account and lets go of them. */
export function closeMatrixPlaces(): void {
  if (!places.stopAll()) return;
  fetched.clear();
  pictures.clear();
  told();
}

function end(it: Live): void {
  it.stopped = true;
  if (it.state) forgetVerifications(it.state);
}

function start(holder: Holder, space: number, key: Uint8Array, pocket?: number): Live {
  // A hidden place's muted rooms tell of nothing (lib/network-notices.ts).
  const heard = hearing(pocket === undefined ? undefined : { space, pocket }, (where) => checkedChatNotify(it.state?.rooms[where.slice('matrix:'.length)]?.notify));
  const it: Live = { holder, space, key, state: null, loaded: false, problem: '', stopped: false, running: false, queue: Promise.resolve(), saving: null, asked: new Set(), heard, pushChecked: false };
  loadMatrix(space, key, holder)
    .then(async (loaded) => {
      let state = loaded;
      // Restored from a backup since it was signed in: its device's keys are as the backup kept them,
      // which would use again what was used since, on a device the phone it came from may still be.
      // The Matrix server takes no device back, so it is let go of here (never signed out, which
      // would end the other phone's), and the space signs in again as a new one. A move from another
      // edition on this phone is not that: the app moved from does nothing more, so the device goes
      // on here as it was (lock/restored.ts markMove).
      const restore = await lastRestore();
      if (state && state.restored !== restore) {
        if (state.restored !== undefined && !(await restoreWasMove(restore))) {
          state = null;
          it.problem = t('A backup was restored here: sign in to Matrix again, as a new device. Your Security Key opens the messages from before.');
        } else state.restored = restore;
        await saveMatrix(space, key, state, holder);
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

/** Stops syncing and lets go of the account, as its space closes, and of its hidden place's. */
export function stopMatrix(): void {
  closeMatrixPlaces();
  if (!live) return;
  live.stopped = true;
  if (live.state) forgetVerifications(live.state);
  live = null;
  fetched.clear();
  pictures.clear();
  told();
}

/** An account for its calls (lib/matrix-calls.ts): as it is now, and changed after what was asked
 *  before, then kept. */
function callAccount(of: () => Live | null): MatrixCallsAccount {
  return {
    now: () => of()?.state ?? null,
    change<T>(use: (state: MatrixState) => Promise<T>): Promise<T> {
      const it = need(of());
      return changeAccount(it, () => use(it.state));
    },
    /** For what changes nothing of the account: at once, and nothing kept. */
    async read<T>(use: (state: MatrixState) => Promise<T>): Promise<T> {
      return use(need(of()).state);
    },
  };
}

/** Of the account `state` is, when it is a closed hidden place's that receives (lib/place-receiver.ts):
 *  its space and pocket, and the account, for the calls that ring it. */
function closedPlace(state: MatrixState): { space: number; pocket: number; account: MatrixCallsAccount } | null {
  const found = places.closed((it) => it.state === state);
  if (!found) return null;
  const { it, pocket } = found;
  return { space: it.space, pocket, account: callAccount(() => (it.stopped ? null : it)) };
}

/** The open space's account for its calls, its open hidden place's while their chats are open, and
 *  those of its closed places that receive. */
export const matrixCallAccount: MatrixCallsAccount & {
  place: MatrixCallsAccount;
  closed: typeof closedPlace;
  watch(listener: () => void): () => void;
} = {
  ...callAccount(() => live),
  place: callAccount(() => places.shown()),
  closed: closedPlace,
  watch: onMatrixChange,
};

function need(it = acting()): Live & { state: MatrixState } {
  if (!it?.state) throw new Error(t('There is no Matrix account in this space.'));
  return it as Live & { state: MatrixState };
}

/** Signs the open space in to Matrix: `who` is a Matrix ID, `server` a homeserver when it is not the ID's own. */
export async function matrixSignIn(who: string, password: string, server = ''): Promise<void> {
  const it = acting();
  if (!it || it.stopped) throw new Error(t('There is no Matrix account in this space.'));
  try {
    const homeserver = await findHomeserver(server.trim() || who, signingTor(it));
    const state = await signIn(homeserver, who, password, signingTor(it));
    state.restored = await lastRestore();
    await changeAccount(it, async () => {
      it.state = state;
      it.problem = '';
    });
    await saveMatrix(it.space, it.key, state, it.holder);
    void loop(it);
  } catch (error) {
    throw new Error(reason(error));
  }
}

// A sign-in with single sign-on under way: whose account it is for (the space's, or a hidden
// place's, which may have locked and opened again meanwhile), its homeserver, and the one-use mark
// the address back carries, so a login token that comes for another sign-in, or long after, is not
// taken. In memory only: closing the app ends it.
let sso: { holder: Holder; space: number; whose: string; homeserver: string; mark: string; at: number } | null = null;
// Which key an account is sealed with, without keeping the key.
const whoseOf = (it: Live) => toHex(sha256Bytes(it.key));
const SSO_LASTS = 10 * 60_000;

/** The ways the homeserver of `whoOrServer` lets one sign in. */
export async function matrixLoginWays(whoOrServer: string): Promise<LoginWays & { homeserver: string }> {
  const tor = acting()?.tor;
  try {
    const homeserver = await findHomeserver(whoOrServer, tor);
    return { homeserver, ...(await loginWays(homeserver, tor)) };
  } catch (error) {
    throw new Error(reason(error));
  }
}

/**
 * Starts signing in with single sign-on: answers the page for the browser, which comes back to
 * `back` (Erevos's own address) with a login token once the person signed in there.
 */
export function matrixSsoStart(homeserver: string, back: string, idp?: string): string {
  const it = acting();
  if (!it || it.stopped) throw new Error(t('There is no Matrix account in this space.'));
  const mark = toHex(randomBytes(16));
  sso = { holder: it.holder, space: it.space, whose: whoseOf(it), homeserver, mark, at: Date.now() };
  return ssoLink(homeserver, `${back}${back.includes('?') ? '&' : '?'}sso=${mark}`, idp);
}

/** Ends a sign-in with single sign-on: the login token that came back with `mark`. */
export async function matrixSsoFinish(mark: string, token: string): Promise<void> {
  const under = sso;
  const it = acting();
  const same = !!under && !!it && !it.stopped && it.holder === under.holder && it.space === under.space && whoseOf(it) === under.whose;
  if (!under || under.mark !== mark || Date.now() - under.at > SSO_LASTS || !same || !it) {
    sso = null;
    throw new Error(t('This sign-in is not the one Erevos started, or it took too long. Start it again.'));
  }
  sso = null;
  if (it.state) throw new Error(t('This space is signed in to Matrix already.'));
  try {
    const state = await signInWithToken(under.homeserver, token, signingTor(it));
    state.restored = await lastRestore();
    await changeAccount(it, async () => {
      it.state = state;
      it.problem = '';
    });
    await saveMatrix(it.space, it.key, state, it.holder);
    void loop(it);
  } catch (error) {
    throw new Error(reason(error));
  }
}

// The space's own account, or with `place` that hidden place's own while it runs
// (lib/place-networks.ts), loaded, for what Linked devices brings or lets go of
// (lib/linked-accounts.ts): null when `space` is not the open one, the place's does not run, or this
// build has no Matrix.
async function spaceAccount(space: number, place?: PlaceKey): Promise<Live | null> {
  if (!place) runMatrix();
  const now = () => (place ? places.running(space, place.pocket, place.key) : live);
  // A place's starts as its hidden chats open (lib/place-networks.ts), maybe just after its links.
  for (let waited = 0, it = now(); (it ? !it.loaded && !it.stopped : !!place) && waited < 20_000; waited += 200, it = now()) await new Promise((resolve) => setTimeout(resolve, 200));
  const it = now();
  return it && it.loaded && !it.stopped && it.space === space && (place || it.holder === 'space') ? it : null;
}

/** What became of a Matrix account the phone gave (matrixTake). */
export type MatrixTaken = { state: 'closed' | 'wait' | 'other' } | { state: 'done'; deviceId: string; signedIn: boolean; problem?: string };

/**
 * Brings the space `space`, or its hidden `place`, the Matrix account its phone gave it
 * (lib/linked-accounts.ts): signs in as a new device with the login token, when it came with one
 * and the space has no account; then,
 * once the space's account is that user, takes the keys the phone gave, which it was not given
 * before. Answers `wait` while the space has no account to take them for, as one signed in to here
 * by hand later; `other` when it has another; `closed` when `space` is not open.
 */
export async function matrixTake(space: number, given: GivenMatrix, place?: PlaceKey): Promise<MatrixTaken> {
  const it = await spaceAccount(space, place);
  if (!it) return { state: 'closed' };
  let signedIn = false;
  if (!it.state && given.token) {
    let state: MatrixState;
    try {
      state = await signInWithToken(given.homeserver, given.token, signingTor(it));
    } catch {
      // A token too old, or one the homeserver did not take: signed in to by hand.
      return { state: 'wait' };
    }
    state.restored = await lastRestore();
    await changeAccount(it, async () => {
      if (it.state || state.userId !== given.userId) return;
      it.state = state;
      it.problem = '';
      signedIn = true;
    });
    if (!signedIn) await signOut(state).catch(() => undefined);
    else {
      await saveMatrix(it.space, it.key, state, it.holder);
      void loop(it);
    }
  }
  if (!it.state) return { state: 'wait' };
  if (it.state.userId !== given.userId) return { state: 'other' };
  const deviceId = it.state.deviceId;
  try {
    await changeAccount(it, async () => {
      if (it.state?.userId === given.userId) await takeGiven(it.state, given.keys, given.backup, it.asked);
    });
  } catch (error) {
    return { state: 'done', deviceId, signedIn, problem: reason(error) };
  }
  return { state: 'done', deviceId, signedIn };
}

/** Signs the space `space` (or its hidden `place`) out of the Matrix device it brought from its phone, once unlinked from it, if it is still signed in as that one. */
export async function matrixLetGo(space: number, device: { userId: string; deviceId: string }, place?: PlaceKey): Promise<void> {
  const it = await spaceAccount(space, place);
  if (it?.state?.userId === device.userId && it.state.deviceId === device.deviceId) await signOutOf(it);
}

/** Signs out, and forgets the account in this space. */
export async function matrixSignOut(): Promise<void> {
  await signOutOf(need());
}

async function signOutOf(it: Live): Promise<void> {
  if (it.state) {
    forgetVerifications(it.state);
    // Its pusher goes with the device; its queue at the relay is deleted here.
    if (it.state.push) await stopMatrixPush(it.state, it.state.push, (await spaceRelayOf(it.space, it.key).catch(() => null)) ?? undefined);
    await signOut(it.state).catch(() => undefined);
  }
  await changeAccount(it, async () => {
    it.state = null;
  });
  await saveMatrix(it.space, it.key, null, it.holder);
  if (it.holder === 'space') await followDoor(it.space, it.key).catch(() => undefined);
}

/** Tells a room we write, or stopped, when the account says so; nothing on failure. */
export function matrixTyped(roomId: string, typing: boolean): void {
  const it = acting();
  if (!it?.state?.sayTyping) return;
  void sendTyping(it.state, roomId, typing).catch(() => undefined);
}

/** Puts our profile picture on the homeserver, or takes it away with null. */
export function matrixSetAvatar(picture: { bytes: Uint8Array; mime: string } | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await setOwnAvatar(it.state, picture ? await uploadPicture(it.state, picture.bytes, picture.mime) : '');
  });
}

// Profile and room pictures fetched while Erevos runs, by address: kept in memory only, one fetch at
// a time for each, and one that failed not asked for again for a while (lib/file-cache.ts).
const pictures = pictureCache(8 * 1024 * 1024);

/** The picture at an mxc:// address, or null when it cannot be had now. */
export async function matrixPicture(mxc: string, where: NetworkWhere = 'space'): Promise<Uint8Array | null> {
  const it = where === 'place' ? places.shown() : live;
  const state = it?.state;
  if (!state) return null;
  return pictures.get(mxc, () => fetchPicture(state, mxc)).catch(() => null);
}

/** Whether the others are told when we write. */
export function matrixSetSayTyping(on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    if (on) it.state.sayTyping = true;
    else delete it.state.sayTyping;
  });
}

/** Whether the others see when we are online: the homeserver is told at once. */
export function matrixSetSayOnline(on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    if (on) it.state.sayOnline = true;
    else delete it.state.sayOnline;
    await sendOwnPresence(it.state).catch(() => undefined);
  });
}

/** Sends words to a room, with the preview of a link in them when this phone made one. */
export function matrixSend(roomId: string, text: string, mentions: string[] = [], preview?: Preview | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await sendText(it.state, roomId, text, mentions, preview ? previewContent(preview) : {});
  });
}

/** Answers a message of the room with `text`. */
export function matrixReply(roomId: string, text: string, replyTo: string, mentions: string[] = [], preview?: Preview | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await sendReply(it.state, roomId, text, replyTo, mentions, preview ? previewContent(preview) : {});
  });
}

/** Sends words in the thread of `root`, as an answer to `answers` there when given. */
export function matrixSendInThread(roomId: string, root: string, text: string, answers?: string, mentions: string[] = [], preview?: Preview | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await sendInThread(it.state, roomId, root, text, answers, mentions, preview ? previewContent(preview) : {});
  });
}

/** Sends a poll to a room. */
export function matrixPoll(roomId: string, poll: Poll): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await sendPoll(it.state, roomId, poll);
  });
}

/** Votes on a poll with its answers by number; none takes our vote back. */
export function matrixVote(roomId: string, target: string, chose: number[]): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const poll = it.state.rooms[roomId]?.messages.find((m) => m.id === target)?.poll;
    if (!poll) return;
    await sendVote(it.state, roomId, target, chose.map((i) => poll.answers[i]?.id).filter((id): id is string => !!id));
  });
}

/** Ends a poll of ours. */
export function matrixEndPoll(roomId: string, target: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => sendPollEnd(it.state, roomId, target));
}

/** Sends where we are, once, to a room or a thread of it. */
export function matrixLocation(roomId: string, place: Place, thread?: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await sendLocation(it.state, roomId, place, thread);
  });
}

/** Pins a message to the room's top, or takes it down. */
export function matrixPin(roomId: string, target: string, on: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, () => pinMessage(it.state, roomId, target, on));
}

/** Makes a room a favourite, of low priority, or neither. */
export function matrixTag(roomId: string, tag: 'favourite' | 'low' | null): Promise<void> {
  const it = need();
  return changeAccount(it, () => tagRoom(it.state, roomId, tag));
}

/** Leaves a room, and the homeserver forgets it. */
export function matrixForget(roomId: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => leaveAndForget(it.state, roomId));
}

/** Learns who may join the space's rooms not known yet (lib/matrix-rooms.ts learnJoins), for the
 *  public feed (components/public-feed.tsx); answers how many it learned. Never a hidden place's. */
export function matrixLearnJoins(): Promise<number> {
  const it = live;
  if (!it?.state || it.stopped) return Promise.resolve(0);
  const state = it.state;
  if (!Object.values(state.rooms).some((room) => room.joins === undefined && !room.direct && !room.space && !room.invitedBy)) return Promise.resolve(0);
  return changeAccount(it, () => learnJoins(state));
}

/** The public rooms of our homeserver, or of `server`, with `term` in them. */
export async function matrixPublicRooms(term: string, server = '', since?: string): Promise<{ rooms: FoundRoom[]; next?: string }> {
  try {
    return await publicRooms(need().state, term, server, since);
  } catch (error) {
    throw new Error(reason(error));
  }
}

/** The rooms in a space. */
export async function matrixSpaceRooms(spaceId: string, since?: string): Promise<{ rooms: FoundRoom[]; next?: string }> {
  try {
    return await spaceRooms(need().state, spaceId, since);
  } catch (error) {
    throw new Error(reason(error));
  }
}

/**
 * Sends a copy of a message to another room of the same account: its words, with their look, place
 * or poll anew; a photo's or file's bytes fetched, opened and sent again under a key of their own,
 * so the copy shares nothing with the message on the homeserver. The others see it as ours: the one
 * mark Matrix has for a copy (MSC2723) would tell them the room and the person it came from, so
 * it is marked as forwarded here only.
 */
export async function matrixForward(fromRoom: string, messageId: string, toRoom: string): Promise<void> {
  const it = need();
  const message = it.state.rooms[fromRoom]?.messages.find((m) => m.id === messageId);
  if (!message || message.deleted || message.locked || message.call || !it.state.rooms[toRoom]) throw new Error(t('This message cannot be forwarded.'));
  const file = message.file;
  const bytes = file ? await matrixFile(file) : null;
  await changeAccount(it, async () => {
    let sent: MatrixMessage;
    if (file && bytes && message.sticker) {
      sent = await sendSticker(it.state, toRoom, { bytes, mime: file.mime, label: file.name, ...(file.w && file.h ? { w: file.w, h: file.h } : {}) });
    } else if (file && bytes) {
      sent = await sendFile(it.state, toRoom, {
        name: file.name,
        mime: file.mime,
        bytes,
        ...(file.w && file.h ? { w: file.w, h: file.h } : {}),
        ...(file.voice ? { voice: { durationMs: file.duration ?? 0, ...(file.waveform ? { waveform: file.waveform } : {}) } } : {}),
      });
    } else if (message.place) sent = await sendLocation(it.state, toRoom, message.place);
    else if (message.poll) sent = await sendPoll(it.state, toRoom, pollShown(message.poll).poll);
    else sent = await sendText(it.state, toRoom, message.text, [], { ...formattedOf(message.text, message.styled), ...(message.preview ? previewContent(message.preview) : {}) });
    sent.forwarded = true;
  });
}

/** Sends again one of ours that did not go, in its place (lib/matrix-writing.ts): a photo or file
 *  is fetched back from the homeserver first; words name `mentions`. */
export async function matrixSendAgain(roomId: string, id: string, mentions: string[] = []): Promise<void> {
  const it = need();
  const failed = unsentIn(it.state, roomId, id);
  if (!failed) return;
  const bytes = failed.file ? await matrixFile(failed.file) : null;
  await changeAccount(it, () => sendAgain(it.state, roomId, failed, mentions, bytes));
}

/** Forgets one of ours that did not go: it never reached the room. */
export function matrixDropUnsent(roomId: string, id: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => dropUnsent(it.state, roomId, id));
}

// An account's drafts and messages held for later (lib/chat-writing.ts), changed in turn with the
// rest of it. It can send while its last sync reached the homeserver.
function writingOf(it: Live): WritingAccount {
  return {
    now: () => checkedWriting(it.state?.writing),
    change: (use) =>
      changeAccount(it, async () => {
        if (it.state) it.state.writing = use(checkedWriting(it.state.writing));
      }),
    keep: async () => {
      if (it.state) await saveMatrix(it.space, it.key, it.state, it.holder);
    },
    ready: () => !it.stopped && !!it.state && !it.problem,
    has: (chat) => !!it.state?.rooms[chat] && !it.state.rooms[chat].invitedBy,
    send: (held) => changeAccount(it, () => sendHeld(need(it).state, held)),
  };
}

/** The drafts and messages held of the open space's account, or of the open hidden place's own; null with none. */
export function matrixWriting(where: NetworkWhere = 'space'): WritingAccount | null {
  const it = where === 'place' ? places.shown() : live;
  return it && !it.stopped && it.state ? writingOf(it) : null;
}

/** Those of every account that runs: the space's, and its hidden places' (lib/chat-later.ts). */
export function matrixWritings(): WritingAccount[] {
  return [live, ...places.all()].filter((it): it is Live => !!it && !it.stopped && !!it.state).map(writingOf);
}

/** The account's devices. */
export async function matrixDevices(): Promise<AccountDevice[]> {
  try {
    return await listDevices(need().state);
  } catch (error) {
    throw new Error(reason(error));
  }
}

/** Gives a device of the account a new name. */
export async function matrixRenameDevice(deviceId: string, name: string): Promise<void> {
  try {
    await renameDevice(need().state, deviceId, name);
  } catch (error) {
    throw new Error(reason(error));
  }
}

/** Signs other devices out, or answers what the homeserver asks for first (authFor answers it). */
export async function matrixSignOutDevices(ids: string[], auth?: Json): Promise<{ done: true } | { ask: AuthAsk }> {
  const it = need();
  try {
    return await changeAccount(it, () => signOutDevices(it.state, ids, auth));
  } catch (error) {
    throw new Error(reason(error));
  }
}

/**
 * Makes a new Matrix account `name` on `server` and signs the space in with it, as signing in does;
 * or answers what the homeserver asks for first, to be answered (authFor) and tried again.
 */
export async function matrixRegister(server: string, name: string, password: string, auth?: Json): Promise<{ done: true; userId: string } | { ask: AuthAsk; homeserver: string }> {
  const it = acting();
  if (!it || it.stopped) throw new Error(t('There is no Matrix account in this space.'));
  if (it.state) throw new Error(t('This space is signed in to Matrix already.'));
  try {
    const homeserver = await findHomeserver(server, signingTor(it));
    const made = await register(homeserver, name.trim(), password, auth, signingTor(it));
    if ('ask' in made) return { ask: made.ask, homeserver };
    const state = made.state;
    state.restored = await lastRestore();
    await changeAccount(it, async () => {
      it.state = state;
      it.problem = '';
    });
    await saveMatrix(it.space, it.key, state, it.holder);
    void loop(it);
    return { done: true, userId: state.userId };
  } catch (error) {
    throw new Error(reason(error));
  }
}

/** Reacts to a message with an emoji, or takes our reaction back when it is there. */
export function matrixReact(roomId: string, target: string, key: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const ours = it.state.rooms[roomId]?.messages.find((m) => m.id === target)?.reactions?.[key]?.includes(it.state.userId);
    if (ours) await takeBackReaction(it.state, roomId, target, key);
    else await sendReaction(it.state, roomId, target, key);
  });
}

/** Changes the words of a message of ours. */
export function matrixChange(roomId: string, target: string, text: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => sendChange(it.state, roomId, target, text));
}

/** Takes a message back, for everyone in the room. */
export function matrixDelete(roomId: string, target: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => deleteMessage(it.state, roomId, target));
}

/** Takes several messages back, for everyone in the room, each in turn; what the homeserver refused of them is thrown after. */
export function matrixDeleteMany(roomId: string, targets: string[]): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    let refused: unknown = null;
    for (const target of targets) await deleteMessage(it.state, roomId, target).catch((error: unknown) => (refused ??= error));
    if (refused) throw refused;
  });
}

/** Whose stickers made from photos a Matrix chat offers: the space's, or the hidden place's own whose account it is. */
export function matrixStickerPlace(where: NetworkWhere = 'space'): StickerPlace | null {
  const it = where === 'place' ? places.shown() : live;
  return it && !it.stopped ? { holder: it.holder, space: it.space, key: it.key } : null;
}

/** Sends a sticker made here to a room, or to the thread of `thread`; its picture is kept as fetched, so it shows at once. */
export function matrixSendSticker(roomId: string, sticker: OutgoingSticker, thread?: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const sent = await sendSticker(it.state, roomId, sticker, thread);
    if (sent.file) keepFetched(sent.file, sticker.bytes);
  });
}

/** The members of a room as its homeserver has them now; the room learns again who may do what in it. */
export function matrixMembers(roomId: string): Promise<RoomMember[]> {
  const it = need();
  return changeAccount(it, () => roomMembers(it.state, roomId));
}

/** Learns who may do what in a room, for one whose levels this phone did not keep yet. */
export function matrixLearnRule(roomId: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => learnRule(it.state, roomId));
}

/** Makes a member of a room an admin, or no more one. */
export function matrixSetAdmin(roomId: string, target: string, admin: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, () => setAdmin(it.state, roomId, target, admin));
}

/** Takes a member out of a room, or bars them from it. */
export function matrixRemoveMember(roomId: string, target: string, ban: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, () => removeMember(it.state, roomId, target, ban));
}

/** Gives a room a new name. */
export function matrixRename(roomId: string, name: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => renameRoom(it.state, roomId, name));
}

/** Sets what a room is about, or takes it away with ''. */
export function matrixSetTopic(roomId: string, topic: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => setTopic(it.state, roomId, topic));
}

/** The people the homeserver's user directory finds by name or Matrix ID. */
export async function matrixSearchPeople(term: string): Promise<{ people: FoundPerson[]; more: boolean }> {
  try {
    return await searchPeople(need().state, term);
  } catch (error) {
    throw new Error(reason(error));
  }
}

/** Fetches older messages of a room; answers how many came. Locked ones are tried with the key backup. */
export function matrixLoadEarlier(roomId: string): Promise<number> {
  const it = need();
  return changeAccount(it, async () => {
    const added = await loadEarlier(it.state, roomId);
    if (added && it.state.backup) await restoreLocked(it.state).catch(() => 0);
    return added;
  });
}

export function matrixStartChat(userId: string): Promise<MatrixRoom> {
  const it = need();
  return changeAccount(it, () => startChat(it.state, userId));
}

/** Makes an encrypted group with a name, and invites `invite` to it. */
export function matrixCreateGroup(name: string, invite: string[]): Promise<MatrixRoom> {
  const it = need();
  return changeAccount(it, () => createGroup(it.state, name, invite));
}

/** Asks someone to join a room we are in. */
export function matrixInvite(roomId: string, userId: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => inviteToRoom(it.state, roomId, userId));
}

/** Joins a room we were invited to, or one by its ID or #alias:server; says its ID. */
export function matrixJoin(roomId: string): Promise<string> {
  const it = need();
  return changeAccount(it, () => joinRoom(it.state, roomId));
}

export function matrixLeave(roomId: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => leaveRoom(it.state, roomId));
}

/** A room's own notifications (lock/chat-notify.ts), or the app's again with null. */
export function matrixSetNotify(roomId: string, notify: ChatNotify | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const room = it.state.rooms[roomId];
    if (!room) return;
    if (notify) room.notify = notify;
    else delete room.notify;
  });
}

/** A room's own look (theme/look.ts), or the space's again with null. */
export function matrixSetLook(roomId: string, look: Look | null): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const room = it.state.rooms[roomId];
    if (!room) return;
    if (look) room.look = checkedLook(look);
    else delete room.look;
  });
}

/** A name of our own for a room, kept on this device only; empty, its own shows again. */
export function matrixSetOwnName(roomId: string, name: string): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const room = it.state.rooms[roomId];
    if (!room) return;
    const own = name.trim().slice(0, OWN_ROOM_NAME);
    if (own) room.own = own;
    else delete room.own;
  });
}

/** A room's PIN of its own, or its screenshots blocked, on this device only (lib/chat-protect.ts). */
export function matrixSetGuard(roomId: string, change: GuardChange): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    const room = it.state.rooms[roomId];
    if (room) changeGuard(room, change);
  });
}

export function matrixRead(roomId: string): Promise<void> {
  const it = need();
  if (!it.state.rooms[roomId]?.unread) return Promise.resolve();
  return changeAccount(it, () => markRead(it.state, roomId));
}

/** Sends a photo or file to a room. */
export function matrixSendFile(roomId: string, file: OutgoingFile): Promise<void> {
  const it = need();
  return changeAccount(it, async () => {
    await sendFile(it.state, roomId, file);
  });
}

// Files fetched while Erevos runs, by their address, so a photo scrolled past is not fetched again:
// the newest few, up to FETCHED_MOST bytes in all. Never written to the phone.
const FETCHED_MOST = 40 * 1024 * 1024;
const fetched = new Map<string, Uint8Array>();

/** A message's file, fetched from the homeserver and opened, or kept from before. */
export async function matrixFile(file: MatrixFile): Promise<Uint8Array> {
  const it = need();
  const where = file.encrypted?.url ?? file.url ?? '';
  const kept = fetched.get(where);
  if (kept) return kept;
  const bytes = await fetchFile(it.state, file);
  keepFetched(file, bytes);
  return bytes;
}

/** A message's file as fetched before, while Erevos runs, or null. */
export function matrixFileKept(file: MatrixFile): Uint8Array | null {
  return fetched.get(file.encrypted?.url ?? file.url ?? '') ?? null;
}

// Keeps a file's bytes as fetched, the newest few up to FETCHED_MOST.
function keepFetched(file: MatrixFile, bytes: Uint8Array): void {
  const where = file.encrypted?.url ?? file.url ?? '';
  if (!where) return;
  fetched.delete(where);
  fetched.set(where, bytes);
  let total = [...fetched.values()].reduce((sum, b) => sum + b.length, 0);
  for (const [key, b] of fetched) {
    if (total <= FETCHED_MOST || key === where) continue;
    fetched.delete(key);
    total -= b.length;
  }
}

/** The open space's checks by emoji (lib/matrix-verify.ts), or the open hidden place's: asked, going on, or just ended. */
export function matrixVerifications(where: NetworkWhere = 'space'): Verification[] {
  const it = where === 'place' ? places.shown() : live;
  return it?.state ? verifications(it.state) : [];
}

/** Asks `userId` to check by emoji, in the chat `roomId`; without one, another device of ours. */
export function matrixVerify(userId: string, roomId?: string): Promise<Verification> {
  const it = need();
  return changeAccount(it, () => requestVerification(it.state, userId, roomId));
}

export function matrixVerifyAccept(id: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => acceptVerification(it.state, id));
}

/** The pictures match, or they do not. What the check proves is kept with the account. */
export function matrixVerifyMatch(id: string, match: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, () => confirmVerification(it.state, id, match));
}

/** Compares emoji instead of a code. */
export function matrixVerifyEmoji(id: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => verifyByEmoji(it.state, id));
}

/** Their code, photographed: checked, and its secret sent back. */
export function matrixVerifyScan(id: string, bytes: Uint8Array): Promise<void> {
  const it = need();
  return changeAccount(it, () => scanCode(it.state, id, bytes));
}

/** They photographed our code: their app said it went well, or not. */
export function matrixVerifyScanned(id: string, ok: boolean): Promise<void> {
  const it = need();
  return changeAccount(it, () => confirmScanned(it.state, id, ok));
}

export function matrixVerifyCancel(id: string): Promise<void> {
  const it = need();
  return changeAccount(it, () => cancelVerification(it.state, id));
}

/** Whether the account has a Security Key, and a phrase that makes it. */
export function matrixRecoveryInfo(): Promise<{ storage: boolean; phrase: boolean }> {
  return recoveryInfo(need().state);
}

/** Opens the account's secret storage and key backup with its Security Key or phrase. */
export function matrixUnlock(words: string): Promise<Unlocked> {
  const it = need();
  return changeAccount(it, () => unlockRecovery(it.state, words));
}

/** Sets up a Security Key and key backup for an account with none. Answers the key, to write down. */
export function matrixSetUpRecovery(): Promise<string> {
  const it = need();
  return changeAccount(it, () => setUpRecovery(it.state));
}

