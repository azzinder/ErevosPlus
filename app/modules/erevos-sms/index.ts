// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';

// The phone's SMS, for Android: Erevos as the default SMS app, its conversations, sending, and
// the hidden SMS invites between Erevos phones (data SMS to a port, see lib/sms-invite.ts).
// On other platforms, and in an app built before this module, there is no SMS: smsReady() is false.
// On a linked device whose phone gives it its SMS (lib/sms-mirror.ts, docs/sync.md S8), they are
// the phone's, as the account's log brings them, in place of any this device has: it reads them,
// marks them read and sends through the phone, and nothing else (no SIMs, deleting, blocking, MMS
// pictures, invites or encrypted SMS).

/** `slots`: how many SIMs the phone can hold (0 in an app built before it). */
export type SmsStatus = { sdk: number; phone: boolean; isDefault: boolean; slots?: number };

/** A SIM in the phone: `id` is what sending takes, `slot` counts from 0. */
export type Sim = { id: number; slot: number; name: string };

/** The latest message of a conversation. `at` is milliseconds. `replied`: any message in it is
 *  ours (missing in an app built before it). */
export type SmsThread = { thread: number; address: string; text: string; at: number; mine: boolean; unread: number; replied?: boolean };

/** What the phone's contacts have for a number: its name, and its picture as an address the app
 *  may show (empty when none). */
export type ContactCard = { name: string; photo: string };

/** A part of an MMS besides its text, as an address the app may show or read (smsPictureBytes),
 *  with its type: a picture, a sound, a contact card. */
export type SmsPart = { uri: string; type: string };
/** A picture of an MMS. */
export type SmsPicture = SmsPart;

/** `sim` is the SIM it came or went on (-1 if unknown); `kind` and `pictures` are missing in an app
 *  built before MMS, `voices` and `cards` in one built before voice messages and contact cards by
 *  MMS. One of ours that went is `sent`, then `delivered` or `undelivered` when the network sends a
 *  delivery report (an older build says `done`). */
export type SmsMessage = {
  id: number;
  kind?: 'sms' | 'mms';
  text: string;
  at: number;
  mine: boolean;
  state: 'done' | 'sending' | 'failed' | 'sent' | 'delivered' | 'undelivered';
  read: boolean;
  sim?: number;
  pictures?: SmsPicture[];
  /** Its sounds: voice messages (audio/amr and the like). */
  voices?: SmsPart[];
  /** Its contact cards (text/x-vcard). */
  cards?: SmsPart[];
  /** Its videos (video/*); missing in a build before them. */
  videos?: SmsPart[];
  /** Who wrote it, in a group's conversation (an MMS that came). */
  from?: string;
};

/** Where an SMS sent for later is, as Android holds it: waiting there for its time, went, or
 *  never given to it (kept before this build, or it could not be opened). */
export type LaterSmsState = 'waiting' | 'went' | 'unknown';

/** Android holding SMS sent for later until their time, so they go with Erevos closed. */
export type LaterSmsHolder = {
  schedule(sms: { id: string; to: string; text: string; sim: number; at: number }): Promise<void>;
  cancel(id: string): Promise<boolean>;
  state(ids: string[]): Promise<Record<string, LaterSmsState>>;
};

/** A piece of an SMS invite that came, base64. */
export type SmsInvitePart = { from: string; data: string; at: number };

/** A piece of an encrypted message that came by SMS (lib/sms-packets.ts), base64; `n` names it, to forget it. */
export type SmsPacketPart = { n: number; from: string; data: string; at: number };

export type SmsEvents = {
  /** `shown`: its conversation shows on the screen (smsShowOnScreen), so it came with no notice.
   *  `spam`: Spam's built-in rule caught it (BuiltInSpam.kt), so it came with no notice and plays
   *  nothing; the app's Spam folder (lib/sms-folders.ts) still decides where it shows. */
  onSms: (event: { address: string; mms?: number; shown?: boolean; spam?: boolean; waiting?: boolean; failed?: boolean }) => void;
  onSmsSent: (event: { id: number; ok: boolean; mms?: boolean }) => void;
  onSmsDelivered: (event: { id: number; ok: boolean }) => void;
  /** An SMS sent for later went, held by Android until its time (`id`: lock/sms-data.ts's). */
  onSmsLaterSent: (event: { id: string }) => void;
  onInvite: (event: { from: string }) => void;
  /** A piece of an encrypted message came by SMS (smsPacketParts). */
  onSmsPacket: () => void;
  /** The phone's SMS or MMS changed, a moment before, while another app is the SMS app: watched
   *  only while this is listened to. */
  onSmsChanged: () => void;
};

type NativeSms = {
  status(): SmsStatus;
  requestDefault(): void;
  threads(limit: number): Promise<SmsThread[]>;
  messages(address: string, limit: number): Promise<SmsMessage[]>;
  markRead(address: string): Promise<void>;
  showOnScreen?(numbers: string[]): void;
  setSpamFilter?(on: boolean): void;
  setOwnNotices?(muted: string[], until: number[], sounds: string[]): void;
  setNoticeDetails?(on: boolean): void;
  mmsSwitches?(): { auto: boolean; roaming: boolean };
  setMmsSwitches?(auto: boolean, roaming: boolean): void;
  waitingMms?(): WaitingMms[];
  fetchMms?(location: string): Promise<void>;
  /** `sim` only in a build with MMS (an older one takes two arguments). */
  send(address: string, text: string, sim?: number): Promise<number>;
  sendMms?(address: string, text: string, data: Uint8Array, type: string, sim: number): Promise<number>;
  sims?(): Promise<Sim[]>;
  contactNames?(numbers: string[]): Promise<Record<string, string>>;
  sendData(address: string, data: Uint8Array): Promise<void>;
  takeInvites(): Promise<SmsInvitePart[]>;
  sendPacket?(address: string, data: Uint8Array, piece: number, sim: number): Promise<boolean>;
  smsPackets?(): Promise<SmsPacketPart[]>;
  forgetPackets?(ns: number[]): Promise<void>;
  scheduleLater?(id: string, to: string, text: string, sim: number, at: number): Promise<void>;
  cancelLater?(id: string): Promise<boolean>;
  laterState?(ids: string[]): Promise<Record<string, LaterSmsState>>;
  deleteThread?(address: string, upTo: number): Promise<number>;
  deleteMessages?(ids: string[]): Promise<number>;
  resend?(kind: string, id: number, sim: number): Promise<number>;
  pictureBytes?(uri: string): Promise<Uint8Array>;
  contactCards?(numbers: string[]): Promise<Record<string, ContactCard>>;
  canBlock?(): Promise<boolean>;
  blocked?(): Promise<string[]>;
  block?(number: string): Promise<boolean>;
  unblock?(number: string): Promise<boolean>;
  exportSms?(): Promise<Uint8Array>;
  importSms?(data: Uint8Array): Promise<{ sms: number; mms: number }>;
  addListener<Name extends keyof SmsEvents>(name: Name, listener: SmsEvents[Name]): EventSubscription;
};

const native = requireOptionalNativeModule<NativeSms>('ErevosSms');

/** The phone's SMS on a linked device (lib/sms-mirror.ts): what it reads, marks and sends through the phone. */
export type SmsMirror = {
  threads(limit: number): Promise<SmsThread[]>;
  messages(address: string, limit: number): Promise<SmsMessage[]>;
  markRead(address: string): Promise<void>;
  /** Asks the phone to send it; returns the row it shows as until the phone sent it (below 0). */
  send(address: string, text: string): Promise<number>;
  cards(numbers: string[]): Record<string, ContactCard>;
};

let mirror: SmsMirror | null = null;
const mirrorListeners = new Map<keyof SmsEvents, Set<(event: never) => void>>();

/** The phone's SMS as this linked device has them, or none (null): set by lib/sms-mirror.ts. */
export function setSmsMirror(next: SmsMirror | null): void {
  mirror = next;
}

/** Whether the SMS here are the phone's, on a linked device. */
export function smsMirrored(): boolean {
  return mirror !== null;
}

/** Tells those who listen of a change of the phone's SMS on this linked device. */
export function smsMirrorEvent<Name extends keyof SmsEvents>(name: Name, event: Parameters<SmsEvents[Name]>[0]): void {
  for (const listener of [...(mirrorListeners.get(name) ?? [])]) {
    try {
      (listener as (event: Parameters<SmsEvents[Name]>[0]) => void)(event);
    } catch {
      // One listener's trouble stops none of the others.
    }
  }
}

// The phone's own module, where its SMS are this device's own: none on a linked device given the phone's.
const own = (): NativeSms | null => (mirror ? null : native);

export function smsReady(): boolean {
  return native !== null || mirror !== null;
}

export function smsStatus(): SmsStatus | null {
  if (mirror) return { sdk: 0, phone: false, isDefault: true, slots: 0 };
  return native ? native.status() : null;
}

/** Shows Android's question whether Erevos should be the phone's SMS app. */
export function requestDefaultSms(): void {
  own()?.requestDefault();
}

export function smsThreads(limit = 200): Promise<SmsThread[]> {
  if (mirror) return mirror.threads(limit);
  return native ? native.threads(limit) : Promise.resolve([]);
}

export function smsMessages(address: string, limit = 300): Promise<SmsMessage[]> {
  if (mirror) return mirror.messages(address, limit);
  return native ? native.messages(address, limit) : Promise.resolve([]);
}

export function markSmsRead(address: string): Promise<void> {
  if (mirror) return mirror.markRead(address);
  return native ? native.markRead(address) : Promise.resolve();
}

/** Sends a plain, unencrypted SMS, on a SIM (-1: the phone's default). Returns its row in the
 *  phone's SMS store, or -1. */
export function sendSms(address: string, text: string, sim = -1): Promise<number> {
  if (mirror) return mirror.send(address, text);
  if (!native) return Promise.reject(new Error('This app was built without SMS.'));
  return mmsReady() ? native.send(address, text, sim) : native.send(address, text);
}

/** Whether this build can send and receive MMS. On a linked device given the phone's SMS: no
 *  pictures, though words to a group go (sendMms with none). */
export function mmsReady(): boolean {
  return typeof own()?.sendMms === 'function';
}

/** Sends an MMS to one number, or to a group's numbers comma-separated: a part (a picture, a voice
 *  message, a contact card) with text, or text alone (a group's). As plain as an SMS. Returns its
 *  row, or -1. */
export function sendMms(address: string, text: string, picture: { bytes: Uint8Array; mime: string } | null, sim = -1): Promise<number> {
  if (mirror && !picture) return mirror.send(address, text);
  if (mirror) return Promise.reject(new Error('A photo goes by MMS from the phone itself.'));
  if (!native?.sendMms) return Promise.reject(new Error('This build of Erevos cannot send MMS yet.'));
  return native.sendMms(address, text, picture?.bytes ?? new Uint8Array(0), picture?.mime ?? '', sim);
}

/** The SIMs in the phone, once Erevos may read the phone's state; else none. */
export function smsSims(): Promise<Sim[]> {
  const sms = own();
  return sms?.sims ? sms.sims() : Promise.resolve([]);
}

/** The names the phone's contacts give these numbers, once Erevos may read them; else none. */
export function contactNames(numbers: string[]): Promise<Record<string, string>> {
  if (mirror) return Promise.resolve(Object.fromEntries(Object.entries(mirror.cards(numbers)).map(([number, card]) => [number, card.name])));
  return native?.contactNames && numbers.length > 0 ? native.contactNames(numbers) : Promise.resolve({});
}

export function sendSmsData(address: string, data: Uint8Array): Promise<void> {
  const sms = own();
  if (!sms) return Promise.reject(new Error('This app was built without SMS.'));
  return sms.sendData(address, data);
}

/** Whether this build can send and take encrypted messages by SMS (lib/sms-way.ts). */
export function smsPacketsReady(): boolean {
  return typeof own()?.sendPacket === 'function';
}

/**
 * Sends the pieces of an encrypted message as data SMS to Erevos's SMS port, `data` holding them
 * one after the other, each `piece` bytes but the last, on a SIM (-1: the phone's default).
 * True once the phone said each went.
 */
export function sendSmsPacket(address: string, data: Uint8Array, piece: number, sim = -1): Promise<boolean> {
  const sms = own();
  return sms?.sendPacket ? sms.sendPacket(address, data, piece, sim) : notInBuild();
}

/** The pieces of encrypted messages that came by SMS and are kept until forgotten, oldest first. */
export function smsPacketParts(): Promise<SmsPacketPart[]> {
  return native?.smsPackets ? native.smsPackets() : Promise.resolve([]);
}

/** Forgets pieces kept: put together, or never to be. */
export function forgetSmsPacketParts(ns: number[]): Promise<void> {
  return native?.forgetPackets && ns.length > 0 ? native.forgetPackets(ns) : Promise.resolve();
}

/** Android's hold on SMS sent for later, or null in a build without it (and with no SMS). */
export function laterSmsHolder(): LaterSmsHolder | null {
  const sms = own();
  if (!sms?.scheduleLater || !sms.cancelLater || !sms.laterState) return null;
  return {
    schedule: (l) => sms.scheduleLater!(l.id, l.to, l.text, l.sim, l.at),
    cancel: (id) => sms.cancelLater!(id),
    state: (ids) => (ids.length > 0 ? sms.laterState!(ids) : Promise.resolve({})),
  };
}

/** The names and pictures the phone's contacts give these numbers, once Erevos may read them;
 *  else none. A build before pictures gives the names alone. */
export async function contactCards(numbers: string[]): Promise<Record<string, ContactCard>> {
  if (numbers.length === 0) return {};
  if (mirror) return mirror.cards(numbers);
  if (native?.contactCards) return native.contactCards(numbers);
  const names = await contactNames(numbers);
  return Object.fromEntries(Object.entries(names).map(([number, name]) => [number, { name, photo: '' }]));
}

/** Whether this build can delete SMS, send again, block numbers and back up the phone's SMS. */
export function smsToolsReady(): boolean {
  return typeof own()?.deleteThread === 'function';
}

const notInBuild = () => Promise.reject(new Error('This build of Erevos cannot do this yet.'));

/** Deletes from the phone a conversation's SMS and MMS up to `upTo` (milliseconds), as the SMS app. */
export function deleteSmsThread(address: string, upTo: number): Promise<number> {
  const sms = own();
  return sms?.deleteThread ? sms.deleteThread(address, upTo) : notInBuild();
}

/** Deletes messages from the phone, each by its kind and row: "sms:12", "mms:3". */
export function deleteSmsMessages(ids: string[]): Promise<number> {
  const sms = own();
  return sms?.deleteMessages ? sms.deleteMessages(ids) : notInBuild();
}

/** Sends one of ours that did not go again, in its place, on `sim` (-1: the SIM it was for). */
export function resendSms(message: Pick<SmsMessage, 'kind' | 'id'>, sim = -1): Promise<number> {
  const sms = own();
  return sms?.resend ? sms.resend(message.kind ?? 'sms', message.id, sim) : notInBuild();
}

/** The bytes of an MMS's picture, sound or contact card, by its address (SmsPart.uri). */
export function smsPictureBytes(uri: string): Promise<Uint8Array> {
  const sms = own();
  return sms?.pictureBytes ? sms.pictureBytes(uri) : notInBuild();
}

/** Whether Erevos may block numbers in Android's own list: as the SMS app or the phone app, in a build with it. */
export function canBlockNumbers(): Promise<boolean> {
  const sms = own();
  return sms?.canBlock ? sms.canBlock().catch(() => false) : Promise.resolve(false);
}

/** The numbers in Android's list of blocked numbers, as the SMS app or the phone app may read them; else none. */
export function blockedNumbers(): Promise<string[]> {
  const sms = own();
  return sms?.blocked ? sms.blocked().catch(() => []) : Promise.resolve([]);
}

/** Puts a number in Android's list: Android then rejects its SMS, MMS and calls. */
export function blockNumber(number: string): Promise<boolean> {
  const sms = own();
  return sms?.block ? sms.block(number) : notInBuild();
}

export function unblockNumber(number: string): Promise<boolean> {
  const sms = own();
  return sms?.unblock ? sms.unblock(number) : notInBuild();
}

/** Every SMS and MMS on the phone, for a backup (lib/backup-sms.ts reads them); null in a build
 *  without it. */
export function exportPhoneSms(): Promise<Uint8Array | null> {
  const sms = own();
  return sms?.exportSms ? sms.exportSms() : Promise.resolve(null);
}

/** Puts the SMS and MMS of a backup into the phone's, those it does not have yet, as the SMS app. */
export function importPhoneSms(data: Uint8Array): Promise<{ sms: number; mms: number }> {
  const sms = own();
  return sms?.importSms ? sms.importSms(data) : notInBuild();
}

/** The invite pieces that came since the last call. Each is given once. */
export function takeSmsInvites(): Promise<SmsInvitePart[]> {
  return native ? native.takeInvites() : Promise.resolve([]);
}

/** The numbers of the SMS conversation that shows on the screen now, or none: an SMS from one of
 *  them comes with no notice, only its sound (lib/background.ts). A build before it notices none
 *  while Erevos shows. */
export function smsShowOnScreen(numbers: string[]): void {
  own()?.showOnScreen?.(numbers);
}

/** Tells the phone whether Spam's filter is on, the only thing of it kept outside the encrypted
 *  space: with it on, an SMS Spam's built-in rule catches comes with no notice (SmsStore.kt). */
export function smsSpamFilter(on: boolean): void {
  try {
    native?.setSpamFilter?.(on);
  } catch {
    // A build from before it: every SMS comes with a notice.
  }
}

/** Whether this phone keeps SMS conversations' own notifications (lib/sms-notices.ts): a build with
 *  them, on the phone whose SMS they are. */
export function canSmsOwnNotices(): boolean {
  return typeof own()?.setOwnNotices === 'function';
}

/** Tells the phone the open space's conversations muted, by their numbers and until when (ms), and
 *  those with a sound of their own, or none: kept in memory only (SmsStore.kt), none once it closes.
 *  False in a build without it, or when it could not. */
export function smsOwnNotices(muted: { number: string; until: number }[], sounds: string[]): boolean {
  const sms = own();
  if (!sms?.setOwnNotices) return false;
  try {
    sms.setOwnNotices(muted.map((m) => m.number), muted.map((m) => m.until), sounds);
    return true;
  } catch {
    return false;
  }
}

/** Listens to the phone's SMS: this device's own, and on a linked device the phone's as they come. */
export function onSmsEvent<Name extends keyof SmsEvents>(name: Name, listener: SmsEvents[Name]): EventSubscription {
  const listeners = mirrorListeners.get(name) ?? new Set();
  mirrorListeners.set(name, listeners);
  const mine = listener as (event: never) => void;
  listeners.add(mine);
  const subscription = native ? native.addListener(name, listener) : null;
  return {
    remove: () => {
      listeners.delete(mine);
      subscription?.remove();
    },
  };
}

/** Tells the phone whether an SMS's notice shows who wrote and what, with Reply and Mark as read,
 *  while the open space says so: in memory only (SmsStore.kt). */
export function smsNoticeDetails(on: boolean): void {
  try {
    own()?.setNoticeDetails?.(on);
  } catch {
    // A build from before it: every notice says "New message".
  }
}

/** An MMS announced by the carrier and not fetched yet, as the owner fetches none at once, or none
 *  while roaming (MmsStore.kt): from whom, how big (bytes), and when; whether it is being fetched,
 *  or the last try did not bring it. Listed for 7 days, as long as carriers keep one. */
export type WaitingMms = { location: string; from: string; size: number; at: number; sim: number; fetching?: boolean; failed?: boolean };

/** Whether MMS are fetched at once (on unless turned off) and while roaming (off unless turned on); null in a build without it. */
export function mmsSwitches(): { auto: boolean; roaming: boolean } | null {
  try {
    return own()?.mmsSwitches?.() ?? null;
  } catch {
    return null;
  }
}

export function setMmsSwitches(auto: boolean, roaming: boolean): void {
  own()?.setMmsSwitches?.(auto, roaming);
}

/** The MMS waiting at the carrier for a tap. */
export function waitingMms(): WaitingMms[] {
  try {
    return own()?.waitingMms?.() ?? [];
  } catch {
    return [];
  }
}

/** Fetches a waiting MMS now; it comes as any MMS does. */
export function fetchMms(location: string): Promise<void> {
  const sms = own();
  return sms?.fetchMms ? sms.fetchMms(location) : Promise.reject(new Error('This build of Erevos cannot do this yet.'));
}
