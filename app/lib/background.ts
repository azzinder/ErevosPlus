// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { AppRegistry, AppState, PermissionsAndroid, Platform } from 'react-native';

import { mutedNow } from '../lock/chat-notify';
import { loadBatteryMode, onBatteryMode, type BatteryMode } from './battery-mode';
import { openDoors } from '../lock/doors';
import { currentSpace } from '../lock/keys';
import { callAudio, type BackgroundState } from '../modules/erevos-call';
import { onSmsEvent, smsShowOnScreen } from '../modules/erevos-sms';
import { currentCall, RING_MS } from './call';
import { CONTACT_PREFIX } from './calls';
import { chatNotify } from './chat-notices';
import { cryptoReady, setupCrypto } from './crypto-setup';
import { followDoor, keepDoor, startClosedNotices } from './closed-notices';
import { movedOut } from './move-state';
import { onContactQueuesChanged } from './contact-queues';
import { currentGroupCall } from './group-call';
import { placeGroupTells } from './hidden-contacts';
import { startHiddenNotices } from './hidden-notices';
import { hiddenRinging, onHiddenRingingChange, ringLeavesLock, setHiddenRinging } from './hidden-ring';
import { startHiddenRinging } from './hidden-ring-notices';
import { iconNumberOn } from './icon-number';
import { networkChanged } from './network-change';
import { laterTheirs, showsAt } from './later';
import { onNetworkMessage, onNetworkRead, onPlaceNetworkMessage, onPlaceNetworkRing } from './network-notices';
import { loadServiceOrder } from './service-order';
import { NoticeCount, onReadElsewhere } from './notice-count';
import { onPlaceGroupMessage } from './place-groups';
import { isPicking } from './picking';
import { onPlaceMessage, onPlaceRing, receivesPocket } from './place-receiver';
import { onSpaceMoved } from './queue-move';
import { appShown, isNews, onAppShown, onMessage } from './receiver';
import { setLightSleep, sleepLook } from './sleep-look';
import { secureGet, secureSet } from './secure';
import { spaceChats } from './space-chats';
import { onSpaceGroupGone, onSpaceGroupMessage } from './space-groups';
import { smsSoundOf } from './sms-notices';
import { spaceUnreadAt } from './unread';

// Receiving while Erevos is in the background, on Android: while a space is open, Erevos keeps
// running with a quiet notice that says no more than its name, so it keeps waiting at the relay
// (lib/receiver.ts) and on the links to phones nearby (lib/nearby-links.ts). A call rings with the
// phone's ringtone and a notice that says only "Incoming call", over the lock screen, and messages
// that came show a notice that says only how many, and on a locked phone only "Erevos". Only the
// open space's chats and groups are read, never hidden chats, whose key is in memory only while
// they are open; those that asked for it only say how many messages came (lib/hidden-notices.ts),
// and so do the other spaces that asked for it, while closed (lib/closed-notices.ts).
// While Erevos shows, a message shows the same notice, with sound, except in the chat or group on
// the screen, where it only sounds; what came in one goes from the count once it is open. The
// space's chats on Matrix, XMPP and Nostr tell of theirs the same way (lib/network-notices.ts).
// Leaving the screen with messages not read in the open space, a notice without sound says how
// many, and counts on from them, so the launcher keeps their number on Erevos's icon until they
// are read (Settings → Notifications → Number on the icon, lib/icon-number.ts).
// On by default; switches on the Lock screen turn it off on this phone, or only the messages
// notice. Swiped away from the recent apps, it goes on without its screens (lib/space-running.ts);
// stopped by Android, Erevos looks at nothing and cannot ring, and a quiet notice says so
// (modules/erevos-call, ReceiveService). So does one when the space that received locked and
// Erevos leaves the screen with the password asked: it receives nothing until it is open again.

const KEY = 'erevos.ring-background';
const NOTICES_KEY = 'erevos.message-notices';

/** Whether this phone can ring in the background at all: Android, in a build with the call module. */
export const canRingInBackground = Platform.OS === 'android' && !!callAudio?.startReceiving;

// React Native stops timers while the app is in the background, unless a background task runs:
// the call module starts this one with the receiving (ErevosCallModule.keepTimers), and it lasts
// until the receiving stops, so the receiver goes on looking at the relay.
const KEEP_TASK = 'ErevosReceive';
const keeping = new Set<() => void>();
// Battery mode Light sleep (lib/battery-mode.ts): whether it is on and the receiving runs, and how
// often its alarm goes, seconds. Its holds are on only while Erevos is in the background.
let lightOn = false;
const LIGHT_LOOK_EVERY = 240;
function lightHolds() {
  const on = lightOn && !appShown() && !!callAudio?.holdAwake && !!callAudio.lookDone;
  setLightSleep(on ? { hold: () => callAudio?.holdAwake?.(), release: () => callAudio?.lookDone?.() } : null);
}

if (canRingInBackground) {
  AppRegistry.registerHeadlessTask(KEEP_TASK, () => () => new Promise<void>((done) => keeping.add(done)));
}

// Whether the space that closed last was receiving: Erevos then leaves the screen with no space
// open, and the "Locked" notice says it receives nothing, until a space opens (startBackground).
let closedReceiving = false;
if (canRingInBackground) {
  AppState.addEventListener('change', (state) => {
    if (!closedReceiving) return;
    try {
      callAudio?.setLocked?.(state === 'background');
    } catch {
      // A build from before the notice.
    }
  });
}

export async function loadRingInBackground(): Promise<boolean> {
  const kept = await secureGet(KEY).catch(() => null);
  return kept !== 'off';
}

const changes = new Set<() => void>();

/** Keeps the choice, and starts or stops the receiving in the open space at once. */
export async function saveRingInBackground(on: boolean): Promise<void> {
  await secureSet(KEY, on ? 'on' : 'off');
  changes.forEach((change) => change());
}

/** Whether a notice says that messages came, while Erevos shows too: on unless turned off. */
export async function loadMessageNotices(): Promise<boolean> {
  const kept = await secureGet(NOTICES_KEY).catch(() => null);
  return kept !== 'off';
}

export async function saveMessageNotices(on: boolean): Promise<void> {
  await secureSet(NOTICES_KEY, on ? 'on' : 'off');
  changes.forEach((change) => change());
}

// While the messages notice is on, how many messages came, by where they show (a chat, a group,
// a hidden place: screenOf...), since Erevos last came back from the background; and what the open
// space had not read as Erevos left the screen, a muted chat's aside (lib/unread.ts), which the
// notice counts on from, with the number on the icon (lib/notice-count.ts).
let telling = false;
const count = new NoticeCount();
// The chat, group or hidden place that shows on the screen now (showOnScreen).
let onScreen: string | null = null;

/** Where a contact's messages show, for messageCame and showOnScreen. */
export const screenOfChat = (identity: string) => `chat:${identity}`;
/** Where a group's messages show. */
export const screenOfGroup = (id: string) => `group:${id}`;
/** Where a hidden place's chats show. */
export const screenOfHidden = (pocket: number) => `hidden:${pocket}`;
/** Where a closed space's chats show: in it, once it is open. */
export const screenOfSpace = (space: number) => `space:${space}`;
// A chat on Matrix, XMPP or Nostr shows where its home row is known (lib/network-notices.ts):
// `matrix:` and its room, `xmpp:` and the address, `nostr:` and the person's key.

const unseenCount = () => count.total();

/**
 * A message came in the open space, from a contact or in a group, shown at `where`: the notice
 * says one more came (`times` more, that came at once, in one change of the notice) and sounds,
 * whether Erevos shows or not; where it shows on the screen just then, it only sounds. One sent without sound (`quiet`) makes none: the notice shows or counts on
 * silently. `chat` is the chat or group it came in (`chat:` or `group:`, and who), when `where`
 * does not say it, as for a hidden place: one muted there tells of nothing, and one with a sound of
 * its own sounds with it, or with none (lib/chat-notices.ts); in hidden chats only muting counts,
 * as a sound of their own would tell which chat it is. The chat screen tells of what it opens
 * itself. `tag` is the message's, so that it no longer counts once it is deleted (messageGone).
 * A group's message that names this phone with @ (`named`, lib/mentions.ts) tells in a muted
 * group too.
 */
export function messageCame(quiet = false, where = '', chat = where, times = 1, tag?: string, named = false): void {
  if (!telling) return;
  const pocket = where.startsWith('hidden:') ? Number(where.slice('hidden:'.length)) : undefined;
  const notify = chatNotify(chat, pocket);
  if (mutedNow(notify) && !named) return;
  const sound = pocket === undefined ? notify?.sound : undefined;
  const silent = quiet || sound === '';
  if (where && where === onScreen && appShown()) {
    if (!silent) chime(sound);
    return;
  }
  count.came(where, chat, times, tag);
  try {
    if (silent || !sound) callAudio?.tellMessages?.(unseenCount(), silent);
    else callAudio?.tellMessages?.(unseenCount(), false, sound);
  } catch {
    // A build from before the notice: nothing shows.
  }
}

function chime(sound?: string) {
  try {
    if (sound) callAudio?.chime?.(sound);
    else callAudio?.chime?.();
  } catch {
    // A build from before the sound: none plays.
  }
}

/**
 * While `where` (screenOf...) shows on the screen, what comes there only sounds, and the notice
 * no longer counts what came there before. Returns how to stop.
 */
export function showOnScreen(where: string): () => void {
  onScreen = where;
  if (count.seen(where)) recount();
  return () => {
    if (onScreen === where) onScreen = null;
  };
}

// The SMS conversation on the screen, by its numbers (app/sms.tsx, a contact's chat): an SMS from
// one of them only sounds, as a message in the chat on the screen does; one from another number
// shows its notice while Erevos shows too (SmsStore.kt). None while Erevos is away or its password
// screen shows.
let smsShown: string[] = [];
const tellSmsShown = () => {
  try {
    smsShowOnScreen(appShown() ? smsShown : []);
  } catch {
    // A build from before it: SMS come with no notice while Erevos shows.
  }
};
if (Platform.OS === 'android') {
  // The phone's network changed: the waits at the relay ask again at once (lib/network-change.ts).
  try {
    callAudio?.addListener?.('onNetwork', networkChanged);
  } catch {
    // A build from before it: the waits run out on their own.
  }
  // The alarm of the battery mode Sleep woke the phone (SleepWake.kt): everything looks at once,
  // and when nothing came the phone is let sleep again, not held for the alarm's whole time. In
  // Light sleep it is let go once the looks wait at the relay again (lib/sleep-look.ts).
  try {
    callAudio?.addListener?.('onSleepLook', () => {
      if (appShown()) return;
      void sleepLook().then((quiet) => {
        if (quiet && !lightOn) callAudio?.lookDone?.();
      });
    });
    onAppShown(lightHolds);
  } catch {
    // A build from before it: the phone is held for the alarm's whole time.
  }
  onAppShown(tellSmsShown);
  // Spam that Spam's built-in rule caught (SmsStore.kt) plays nothing, on the screen too. A
  // conversation muted in the open space plays nothing either; one with a sound of its own came with
  // a notice that made none, and plays its own here, on the screen or not (lib/sms-notices.ts).
  onSmsEvent('onSms', ({ address, shown, spam, failed }) => {
    // An MMS that did not come when fetched only changes the screens that list it.
    if (spam || failed) return;
    const own = smsSoundOf(address);
    if (own === null) return;
    if (own !== undefined) {
      if (own && (!shown || appShown())) chime(own);
      return;
    }
    if (shown && appShown()) chime();
  });
}

/** While the SMS conversation with `numbers` shows on the screen, what comes in it only sounds. Returns how to stop. */
export function showSmsOnScreen(numbers: string[]): () => void {
  smsShown = numbers;
  tellSmsShown();
  return () => {
    if (smsShown !== numbers) return;
    smsShown = [];
    tellSmsShown();
  };
}

// Notices of messages that came before their time, waiting for it, by chat and tag: they go as
// the space closes, so none tells in the next; the open space's are set again as it opens.
const due = new Map<string, ReturnType<typeof setTimeout>>();
let untagged = 0;

/**
 * As messageCame, at `at` (milliseconds) when that is ahead: for a message that came before its
 * time (lib/later.ts, showsAt), once for its `tag`; when `still` says no by then, it tells nothing.
 */
export function messageCameAt(at: number, quiet = false, where = '', chat = where, tag?: string, still?: () => boolean): void {
  const wait = at - Date.now();
  if (wait <= 0) {
    messageCame(quiet, where, chat, 1, tag);
    return;
  }
  const id = `${chat}|${tag ?? `#${++untagged}`}`;
  if (due.has(id)) return;
  const timer = setTimeout(() => {
    due.delete(id);
    if (!still || still()) messageCame(quiet, where, chat, 1, tag);
  }, Math.min(wait, 2 ** 31 - 1));
  due.set(id, timer);
}

function dropDue() {
  due.forEach((timer) => clearTimeout(timer));
  due.clear();
}

function clearMessages() {
  if (!count.clear()) return;
  try {
    callAudio?.clearMessages?.();
  } catch {
    // As above.
  }
}

// The notice says the count as it is now, without sound, or goes once it is none; one swiped away
// does not come back for it.
function recount() {
  try {
    const now = unseenCount();
    if (now === 0) callAudio?.clearMessages?.();
    else callAudio?.recountMessages?.(now);
  } catch {
    // As above.
  }
}

/**
 * The message `tag` of the contact's `chat` (screenOfChat), or all its messages (null), was deleted
 * for everyone, as it was kept: the notice no longer counts it, nor tells of it later at its time.
 * `space` says it is in the open space's chats, not a hidden place's, whose count is also held to
 * what the chat has not read now.
 */
export async function messageGone(chat: string, tag: string | null, space: boolean): Promise<void> {
  for (const [id, timer] of due) {
    if (tag === null ? !id.startsWith(`${chat}|`) : id !== `${chat}|${tag}`) continue;
    clearTimeout(timer);
    due.delete(id);
  }
  if (!telling) return;
  let changed = count.gone(chat, tag);
  if (space && count.counts([chat])) {
    const notRead = await spaceUnreadAt();
    if (notRead && telling) changed = count.readNow([chat], notRead) || changed;
  }
  if (changed) recount();
}

// The space's chats or groups `where` (screenOfChat, screenOfGroup) were read elsewhere, or lost a
// message not read yet: each counts no more than it has not read now.
async function heldToUnread(where: string[]) {
  if (!telling || !count.counts(where)) return;
  const notRead = await spaceUnreadAt();
  if (notRead && telling && count.readNow(where, notRead)) recount();
}

/** What Android lets Erevos do for it, or null where it cannot ring in the background. */
export function backgroundState(): BackgroundState | null {
  if (!canRingInBackground) return null;
  try {
    return callAudio!.backgroundState?.() ?? null;
  } catch {
    return null;
  }
}

// The question Android 13 and later put last, while it waits for an answer.
let asking: Promise<void> = Promise.resolve();

/**
 * Android 13 and later ask once whether Erevos may show notices; without them, it rings with no
 * notice, no notice says a message came, and a message in a chat makes no sound.
 */
function askNotices(): Promise<void> {
  if (Number(Platform.Version) < 33) return Promise.resolve();
  asking = PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS').then(
    () => undefined,
    () => undefined,
  );
  return asking;
}

/** Once Android's question whether Erevos may show notices, if one is up, has its answer. */
export function noticesAsked(): Promise<void> {
  return asking;
}

// Erevos started by itself as the phone turned on, or after an update (modules/erevos-call,
// BootStart.kt), as the owner chose: no space is open, and none can be without its password, so
// only the closed spaces that asked to say a message came while another is open are waited on
// (lib/closed-notices.ts), with the same notice, never which space, until a space opens
// (startBackground). With none, or the messages notice off, it stops at once. Android runs it as a
// task with no screen (registered in index.js), which lasts as long.
let bootStop: (() => void) | null = null;

/** Whether Erevos can start by itself as the phone turns on: Android, in a build with it. */
export const canStartAtBoot = canRingInBackground && !!callAudio?.setBootStart;

/** Whether Erevos starts by itself as the phone turns on: the phone's choice, off unless chosen. */
export function loadBootStart(): boolean {
  try {
    return callAudio?.bootStart?.() ?? false;
  } catch {
    return false;
  }
}

// The choice is kept by the phone (BootStart.kt), as it is read before anything of Erevos runs,
// and here too, with the phone's other settings that go with a copy of Erevos (SETTINGS in the
// lock): so a restore, or a move to another edition (lib/edition-move.ts), keeps it as it was.
const BOOT_KEY = 'erevos.boot-start';

export function saveBootStart(on: boolean): void {
  try {
    callAudio?.setBootStart?.(on);
  } catch {
    // A build from before it: nothing to keep.
  }
  void secureSet(BOOT_KEY, on ? 'on' : 'off').catch(() => undefined);
}

/**
 * As Erevos starts: the phone's choice made what the kept one says, after a restore or a move to
 * another edition; with none kept yet (before it was kept, or one restored from before), the phone's
 * is kept.
 */
export async function syncBootStart(): Promise<void> {
  if (!canStartAtBoot) return;
  const kept = await secureGet(BOOT_KEY).catch(() => null);
  if (kept === 'on' || kept === 'off') {
    if (loadBootStart() !== (kept === 'on')) {
      try {
        callAudio?.setBootStart?.(kept === 'on');
      } catch {
        // A build from before it.
      }
    }
    return;
  }
  await secureSet(BOOT_KEY, loadBootStart() ? 'on' : 'off').catch(() => undefined);
}

const spaceOpen = () => {
  try {
    currentSpace();
    return true;
  } catch {
    return false;
  }
};

/** The task Erevos runs as it starts by itself (index.js): ends once a space opens, or at once with nothing to wait for. */
export function startBootNotices(): Promise<void> {
  return new Promise<void>((done) => {
    void (async () => {
      if (spaceOpen() || bootStop) return done();
      // Moved to another edition (lib/edition-move.ts): that one tells of its messages, not this.
      if (movedOut()) {
        try {
          callAudio?.stopReceiving?.();
        } catch {
          // Gone with Erevos anyway.
        }
        return done();
      }
      // No screen of Erevos ran yet (app/_layout.tsx does this as it loads), so the encryption and
      // the core are set up here, and the relay connections kept from loading the WebView.
      setupCrypto();
      try {
        callAudio?.noCookies?.();
      } catch {
        // A build from before it.
      }
      await cryptoReady();
      const [notices, doors] = await Promise.all([loadMessageNotices(), openDoors(-1).catch(() => [])]);
      if (spaceOpen()) return done();
      if (!notices || doors.length === 0) {
        // Nothing to say while closed: the service and its notice go, and the quiet "Locked" notice
        // stays, so that Erevos is seen to have started and a tap on it opens Erevos for a password,
        // until a space opens (startBackground).
        try {
          callAudio?.stopReceiving?.();
        } catch {
          // Gone with Erevos anyway.
        }
        closedReceiving = true;
        try {
          callAudio?.setLocked?.(true);
        } catch {
          // A build from before the notice.
        }
        return done();
      }
      telling = true;
      const closed = startClosedNotices((count, space) => messageCame(false, screenOfSpace(space), screenOfSpace(space), count), true);
      bootStop = () => {
        bootStop = null;
        closed();
        done();
      };
    })().catch(() => done());
  });
}

/**
 * Receives in the background for the open space while this phone rings in the background, and
 * follows the switch. Returns how to stop. Android lets it start only while Erevos shows, as it
 * does when a space opens or the switch is turned on.
 */
export function startBackground(): () => void {
  if (!canRingInBackground) return () => undefined;
  // A space opened after Erevos started by itself: it waits as ever from now on.
  bootStop?.();
  let stopped = false;
  let running = false;
  // Android refused to start the receiving, as Erevos had already left the screen: it tries again
  // once Erevos shows, and meanwhile a quiet notice says it is not receiving.
  let refused = false;
  // A space opens: the "Locked" notice of the one that closed says nothing of it any more.
  closedReceiving = false;
  try {
    callAudio?.setLocked?.(false);
  } catch {
    // A build from before the notice.
  }
  // The hidden chats' notices, while the messages notice is on (lib/hidden-notices.ts).
  let hidden: (() => void) | null = null;
  // The other spaces' notices, while closed, those that asked for it (lib/closed-notices.ts).
  let closed: (() => void) | null = null;
  const tellHidden = (on: boolean) => {
    if (on && !hidden)
      hidden = startHiddenNotices((count, pocket) => messageCame(false, screenOfHidden(pocket), screenOfHidden(pocket), count));
    if (!on && hidden) {
      hidden();
      hidden = null;
    }
    if (on && !closed)
      closed = startClosedNotices((count, space) => messageCame(false, screenOfSpace(space), screenOfSpace(space), count));
    if (!on && closed) {
      closed();
      closed = null;
    }
  };
  // This space's door names the queues it reads on, should it say a message came once closed: written
  // as it opens, as its own queue moves, and as it closes, with what came so far heard.
  let own: { space: number; key: Uint8Array } | null = null;
  try {
    own = currentSpace();
  } catch {
    // No space is open: none to keep a door for.
  }
  const door = own;
  if (door) void keepDoor(door.space, door.key).catch(() => undefined);
  const moved = onSpaceMoved(async () => {
    if (door) await keepDoor(door.space, door.key).catch(() => undefined);
  });
  // A contact took a queue of their own, or was deleted: the door names their queues as they are now.
  const contactsChanged = onContactQueuesChanged(() => {
    if (door) void followDoor(door.space, door.key).catch(() => undefined);
  });
  // A hidden place that rings its contacts' calls (lib/hidden-ring-notices.ts). On whenever
  // receiving runs, not with the messages notice: ringing is its own per-place setting. One hidden
  // call rings at a time, and none while a call is in progress.
  let ringWatch: (() => void) | null = null;
  let ringTimer: ReturnType<typeof setTimeout> | null = null;
  const stopRing = () => {
    if (ringTimer) {
      clearTimeout(ringTimer);
      ringTimer = null;
    }
    try {
      callAudio?.stopRinging?.();
    } catch {
      // A build from before ringing: nothing was playing.
    }
  };
  // A ring came for a hidden place: play the phone's ringtone and, while Erevos is not on screen or
  // the password screen is in front, the "Incoming call" notice over the lock screen, naming no one,
  // as for the space's calls; stop after it has rung a while unanswered (a missed call).
  const onRing = (space: number, pocket: number, at = Date.now()) => {
    if (currentCall() || currentGroupCall() || hiddenRinging()) return;
    setHiddenRinging({ space, pocket, at });
    try {
      callAudio?.ring?.(false, !appShown());
      callAudio?.showOverLock?.(true);
    } catch {
      // As above.
    }
    if (ringTimer) clearTimeout(ringTimer);
    ringTimer = setTimeout(() => setHiddenRinging(null), RING_MS);
  };
  // Hidden chats that receive while closed (lib/place-receiver.ts): a message says "New message"
  // with no name, as the space's chats do, and a call rings with none, as a hidden ring does.
  const places = [
    onPlaceMessage((_space, pocket, received) => {
      if (isNews(received)) messageCameAt(showsAt(received.due), received.quiet, screenOfHidden(pocket), screenOfChat(received.identity), received.tag);
      if (received.erase) void messageGone(screenOfChat(received.identity), 'all' in received.erase ? null : received.erase.tag, false).catch(() => undefined);
    }),
    // Their groups' too (lib/place-groups.ts).
    // Only as their contacts' messages do: while Erevos shows, or the place says so with it away.
    onPlaceGroupMessage((space, pocket, group, named) => {
      if (placeGroupTells(space, pocket, appShown(), receivesPocket(space, pocket))) messageCame(false, screenOfHidden(pocket), screenOfGroup(group), 1, undefined, named);
    }),
    onPlaceRing(onRing),
    // Their own accounts on Matrix, XMPP and Nostr (lib/place-networks.ts), as their contacts' messages and calls do.
    onPlaceNetworkMessage((space, pocket, where, times) => {
      if (placeGroupTells(space, pocket, appShown(), receivesPocket(space, pocket))) messageCame(false, screenOfHidden(pocket), where, times);
    }),
    onPlaceNetworkRing(onRing),
  ];
  // Answered, turned down, or timed out: the ringtone and notice stop (the call, if answered, took
  // over the sound itself). Turned down or unanswered, Erevos no longer shows over the lock screen,
  // as after a call (components/call-host.tsx); answered with the PIN, the call it waits for may.
  let rung = hiddenRinging();
  const ringChange = onHiddenRingingChange(() => {
    const was = rung;
    rung = hiddenRinging();
    if (rung) return;
    stopRing();
    if (!ringLeavesLock(was, !!(currentCall() || currentGroupCall()))) return;
    try {
      callAudio?.showOverLock?.(false);
    } catch {
      // A build from before ringing: it never showed over the lock screen.
    }
  });
  const ringHidden = (on: boolean) => {
    if (on && !ringWatch) ringWatch = startHiddenRinging(onRing);
    if (!on && ringWatch) {
      ringWatch();
      ringWatch = null;
      if (hiddenRinging()) setHiddenRinging(null);
      stopRing();
    }
  };
  const stop = () => {
    running = false;
    lightOn = false;
    lightHolds();
    tellHidden(false);
    ringHidden(false);
    callAudio!.stopReceiving!();
    keeping.forEach((done) => done());
    keeping.clear();
  };
  const follow = async () => {
    const [on, notices] = await Promise.all([loadRingInBackground(), loadMessageNotices()]);
    if (stopped) return;
    // While Erevos shows, the notice tells of messages with the receiving off too.
    telling = notices;
    if (!notices) clearMessages();
    if (!on) {
      if (running) stop();
      // The notice and the sound of a message while Erevos shows need it too.
      if (notices) await askNotices();
      return;
    }
    if (running) {
      tellHidden(notices);
      ringHidden(true);
      return;
    }
    await askNotices();
    if (stopped || running) return;
    const mode = await loadBatteryMode();
    if (stopped || running) return;
    try {
      callAudio!.startReceiving!();
      sleepy(mode);
      running = true;
      closedReceiving = false;
      tellHidden(notices);
      ringHidden(true);
    } catch {
      // Android refused (Erevos was already in the background): it rings while it shows, and tries
      // again as it shows (the notice "Closed by Android" says so meanwhile, ErevosCallModule.kt).
      refused = true;
    }
  };
  // The battery mode Sleep lets the phone sleep between looks at the relay (ReceiveService.kt).
  // Light sleep does too, with the waits at the relay left open to wake it, and a slower alarm
  // (lib/sleep-look.ts); a build without what that needs keeps the phone awake, as before it.
  const sleepy = (mode: BatteryMode) => {
    try {
      const light = mode === 'light' && !!callAudio?.holdAwake && !!callAudio.lookDone && !!callAudio.setLookEvery;
      callAudio?.setLookEvery?.(light ? LIGHT_LOOK_EVERY : 60);
      callAudio?.setSleepy?.(mode === 'sleep' || light);
      lightOn = light;
      lightHolds();
    } catch {
      // A build from before it: the phone stays awake.
    }
  };
  const stopBattery = onBatteryMode((mode) => {
    if (running) sleepy(mode);
  });
  void follow();
  changes.add(follow);
  // The open space's messages that came before their time and wait for it, from before Erevos
  // started anew: their notices wait again.
  void spaceChats()
    .then(({ history }) => {
      if (stopped) return;
      for (const m of laterTheirs(history.messages())) messageCameAt(m.at, !!m.quiet, screenOfChat(m.peer.slice(CONTACT_PREFIX.length)), undefined, m.tag);
    })
    .catch(() => undefined);
  void loadServiceOrder();
  const told = [
    onMessage((received) => {
      if (isNews(received)) messageCameAt(showsAt(received.due), received.quiet, screenOfChat(received.identity), undefined, received.tag);
      if (received.erase) void messageGone(screenOfChat(received.identity), 'all' in received.erase ? null : received.erase.tag, true).catch(() => undefined);
    }),
    onSpaceGroupMessage((group, named) => messageCame(false, screenOfGroup(group), screenOfGroup(group), 1, undefined, named)),
    // The space's chats on other networks: as its own chats, read here or on another device of the account.
    onNetworkMessage((where, times) => messageCame(false, where, where, times)),
    onNetworkRead((where) => void heldToUnread(where).catch(() => undefined)),
    // A member deleted for everyone a message not read yet; what was read on a linked device.
    onSpaceGroupGone((group) => void heldToUnread([screenOfGroup(group)]).catch(() => undefined)),
    onReadElsewhere((where) => void heldToUnread(where).catch(() => undefined)),
  ];
  // The space shows again (not the password screen in front of it): what came shows there, so the notice goes.
  const shown = onAppShown((on) => {
    if (on) clearMessages();
  });
  // Erevos leaves the screen: what the open space has not read stays, as a notice without sound
  // that says how many, for the number on the icon, until it is read; with the number turned off,
  // the notice tells only of what comes after.
  let leaving = 0;
  const leave = async () => {
    const left = ++leaving;
    if (!telling || !(await iconNumberOn())) return;
    // What came in the space's chats and groups is in what they have not read, as far as their
    // history has it yet (a voice message whose parts are still coming has no row): the hidden
    // places' and the closed spaces' stay apart.
    const counted = count.spaceCounted();
    const notRead = await spaceUnreadAt();
    if (left !== leaving || stopped || !telling || notRead === null || AppState.currentState === 'active') return;
    count.leave(counted, notRead);
    const now = unseenCount();
    try {
      // None: a notice left from before (Erevos closed by Android meanwhile) goes too.
      if (now > 0) callAudio?.tellMessages?.(now, true);
      else callAudio?.clearMessages?.();
    } catch {
      // A build from before the notice.
    }
  };
  // Opening a photo, a file or the camera takes Erevos off the screen too, but the owner is not leaving.
  const app = AppState.addEventListener('change', (state) => {
    if (state === 'background' && !isPicking()) void leave().catch(() => undefined);
    else leaving++;
    if (state === 'active' && refused && !stopped && !running) {
      refused = false;
      void follow();
    }
  });
  // The space opens on the screen: a messages notice still there is from before, kept as Android
  // closed Erevos, and says nothing of it now.
  try {
    callAudio?.clearMessages?.();
  } catch {
    // A build from before the notice.
  }
  return () => {
    stopped = true;
    dropDue();
    telling = false;
    moved();
    contactsChanged();
    if (door) void keepDoor(door.space, door.key, true).catch(() => undefined);
    changes.delete(follow);
    stopBattery();
    told.forEach((stopTelling) => stopTelling());
    places.forEach((stopPlace) => stopPlace());
    shown();
    app.remove();
    ringChange();
    ringHidden(false);
    clearMessages();
    if (running) {
      stop();
      // The space closes (locked): unless it opens again first, Erevos leaving the screen says so.
      closedReceiving = true;
      if (AppState.currentState === 'background') callAudio?.setLocked?.(true);
    }
  };
}

/** Android's own question to leave Erevos out of battery saving, so it is not stopped in the background. */
export function askBattery(): void {
  callAudio?.askBattery?.();
}

/** Android's setting that lets Erevos show a call over the lock screen. */
export function askFullScreen(): void {
  callAudio?.askFullScreen?.();
}
