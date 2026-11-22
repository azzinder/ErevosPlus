// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';

// The phone's calls, for Android: Erevos as the phone app (Android's dialer role), with its own
// call screen, which shows over the lock screen and works while Erevos is locked; making calls on
// a SIM. On other platforms, and in an app built before this module, there is no phone: phoneReady()
// is false and everything here does nothing.

/** `calls`: how many calls are on now; `slots`: how many SIMs the phone can hold; `screens`:
 *  whether Android asks Erevos about each call before it rings (the call screening role);
 *  `callLog`: whether Android lets Erevos read the call history, unknown to a build before it. */
export type PhoneStatus = { sdk: number; phone: boolean; isDefault: boolean; calls: number; slots: number; screens: boolean; callLog?: boolean };

/** A way the phone can call: a SIM. `id` is what placeCall takes and the call history keeps;
 *  `slot` counts from 0, -1 for an account that is no SIM's; `name` is "SIM 1" or the account's. */
export type PhoneAccount = { id: string; label: string; slot: number; name: string };

/**
 * A call in Android's call history. `type` is Android's: 1 came, 2 made, 3 missed, 5 declined,
 * 6 blocked, 7 answered on another device (lib/phone-log.ts); `features` its marks, 4 for HD voice
 * and 8 for Wi-Fi calling; `account` the SIM's id, as PhoneAccount's; `shown` the number as the
 * phone's country writes it; `name` and `photo` (a content: address) from the phone's contacts, ''
 * when it has none; `presentation` 1 when the number shows, 2 private, 3 unknown, 4 a payphone;
 * `isNew` a missed call not seen yet; `blocked` why it was blocked, 0 when it was not. `at` and
 * `duration` in milliseconds and seconds.
 */
export type LoggedCall = {
  id: number;
  number: string;
  shown: string;
  name: string;
  photo: string;
  at: number;
  duration: number;
  type: number;
  features: number;
  account: string;
  presentation: number;
  isNew: boolean;
  blocked: number;
};

/** One of the phone's starred contacts, with its numbers: `primary` is its default number, or ''. */
export type Favourite = {
  id: string;
  name: string;
  photo: string;
  numbers: { number: string; shown: string; label: string }[];
  primary: string;
};

/** One of the phone's contact groups (labels): its id in the phone's contacts, its title, the
 *  account it is in, and how many contacts it has. */
export type ContactGroup = { id: string; title: string; account: string; count: number };

/**
 * A voicemail Android keeps (visual voicemail, which only some phone companies send): `shown` the
 * number as the phone's country writes it, `name` from the phone's contacts or ''; `at` in
 * milliseconds, `duration` in seconds; `isNew` not heard yet; `transcript` the words, when the phone
 * company sends them; `playable` whether its recording came; `account` the SIM's id.
 */
export type Voicemail = {
  id: number;
  number: string;
  shown: string;
  name: string;
  at: number;
  duration: number;
  isNew: boolean;
  transcript: string;
  playable: boolean;
  account: string;
};

/** The spam list (Spam.kt): how many numbers the downloaded list holds, where from and when (ms,
 *  0 for never), how many the owner reported, and whether the call screen warns of them and
 *  whether they ring silently. */
export type SpamState = { count: number; source: string; at: number; own: number; warn: boolean; silence: boolean; auto?: boolean };

export type PhoneEvents = {
  /** A call came, was made, or ended: how many are on now. */
  onCalls: (event: { count: number }) => void;
  /** The call history or the phone's contacts changed. */
  onHistory: (event: Record<string, never>) => void;
  /** A voicemail started or stopped playing. */
  onVoicemail: (event: { id: number; playing: boolean }) => void;
};

type NativePhone = {
  status(): PhoneStatus;
  requestDefault(): void;
  requestScreening(): void;
  rules(): string;
  setRules(json: string): void;
  accounts(): Promise<PhoneAccount[]>;
  placeCall(number: string, account: string): Promise<void>;
  isEmergency?(number: string): boolean;
  emergencyDial?(): boolean;
  history(): Promise<{ allowed: boolean; calls: LoggedCall[] }>;
  callVoicemail?(account: string): Promise<void>;
  openCallSettings?(kind: string, account: string): boolean;
  videoCalling?(): boolean;
  spamState?(): SpamState;
  setSpamList?(text: string, source: string): Promise<number>;
  clearSpamList?(): void;
  setSpamSwitches?(warn: boolean, silence: boolean): void;
  setSpamAuto?(auto: boolean): void;
  reportSpam?(number: string, spam: boolean): void;
  reportedSpam?(number: string): boolean;
  clearSpamReports?(): void;
  placeVideoCall?(number: string, account: string): Promise<void>;
  hasVoicemail?(account: string): string;
  voicemails?(): Promise<{ allowed: boolean; voicemails: Voicemail[] }>;
  playVoicemail?(id: number): Promise<void>;
  stopVoicemail?(): void;
  deleteVoicemail?(id: number): Promise<boolean>;
  favourites(): Promise<{ allowed: boolean; favourites: Favourite[] }>;
  seenMissed(): void;
  deleteCalls(ids: number[]): Promise<number>;
  deleteCallsOf(number: string, before: number): Promise<number>;
  groups(): Promise<{ allowed: boolean; groups: ContactGroup[] }>;
  quickReplies(): { replies: string[]; own: boolean };
  setQuickReplies(replies: string[]): void;
  showCall(): void;
  setKnownNames(names: Record<string, string>): void;
  clearKnownNames(): void;
  forgetKnownNamesAfter(ms: number): void;
  backupCalls?(): Promise<string>;
  restoreCalls?(json: string): Promise<{ calls: number; blocked: number }>;
  addListener<Name extends keyof PhoneEvents>(name: Name, listener: PhoneEvents[Name]): EventSubscription;
};

const native = requireOptionalNativeModule<NativePhone>('ErevosPhone');

export function phoneReady(): boolean {
  return native !== null;
}

export function phoneStatus(): PhoneStatus | null {
  return native ? native.status() : null;
}

/** Shows Android's question whether Erevos should be the phone app. */
export function requestDefaultPhone(): void {
  native?.requestDefault();
}

/** Shows Android's question whether Erevos should screen calls (the call screening role), so a
 *  blocked call is turned away before it rings. */
export function requestScreening(): void {
  native?.requestScreening();
}

/**
 * The blocking rules (lib/phone-rules.ts), JSON, '' for none: kept in the module's own
 * preferences, the same for every space, as calls are screened with Erevos locked. Only
 * prefixes, group ids and times, never names.
 */
export function blockingRules(): string {
  return native ? native.rules() : '';
}

export function setBlockingRules(json: string): void {
  native?.setRules(json);
}

/** The phone's SIMs, once Erevos may read the phone's state; else none. */
export function phoneAccounts(): Promise<PhoneAccount[]> {
  return native ? native.accounts() : Promise.resolve([]);
}

// Emergency numbers every network takes, for when Android cannot say (an older build of this module).
const ALWAYS_EMERGENCY = new Set(['112', '911']);

/** Opens Android's emergency keypad, which calls only emergency numbers, with no password; false if it could not. */
export function openEmergencyDial(): boolean {
  try {
    return native?.emergencyDial?.() === true;
  } catch {
    return false;
  }
}

/** Whether `number` is an emergency number: called at once, on the SIM Android picks, never asked. */
export function isEmergencyNumber(number: string): boolean {
  const plain = number.replace(/[\s-]/g, '');
  if (ALWAYS_EMERGENCY.has(plain)) return true;
  try {
    return native?.isEmergency?.(plain) === true;
  } catch {
    return false;
  }
}

/** Calls `number` on the SIM with this account id, or on the phone's default SIM for ''. Needs
 *  Android's call permission, which the phone app role gives. */
export function placeCall(number: string, account = ''): Promise<void> {
  if (!native) return Promise.reject(new Error('This app was built without the phone.'));
  return native.placeCall(number, account);
}

/** Opens Android's own screen of the SIM's call settings, which the phone company keeps:
 *  'calls' (forwarding, call waiting, showing your number) or 'voicemail' (its number); false when
 *  the phone has none, or in a build without it. */
export function openCallSettings(kind: 'calls' | 'voicemail', account = ''): boolean {
  try {
    return native?.openCallSettings?.(kind, account) === true;
  } catch {
    return false;
  }
}

/** Whether this build can call the voicemail and show the voicemails. */
export function voicemailReady(): boolean {
  return typeof native?.callVoicemail === 'function';
}

/** Calls the voicemail of the SIM with this account id, or of the phone's default SIM for ''. */
export function callVoicemail(account = ''): Promise<void> {
  if (!native?.callVoicemail) return Promise.reject(new Error('This build of Erevos cannot do this yet.'));
  return native.callVoicemail(account);
}

/** Whether that SIM has a voicemail number: true, false, or null when Android does not say. */
export function hasVoicemail(account = ''): boolean | null {
  try {
    const answer = native?.hasVoicemail?.(account) ?? '';
    return answer === 'yes' ? true : answer === 'no' ? false : null;
  } catch {
    return null;
  }
}

/** The voicemails Android keeps, newest first; none where the phone company sends no visual
 *  voicemail. `allowed` is false while Erevos is not the phone app. Erevos keeps no copy. */
export function voicemails(): Promise<{ allowed: boolean; voicemails: Voicemail[] }> {
  return native?.voicemails ? native.voicemails() : Promise.resolve({ allowed: false, voicemails: [] });
}

/** Plays a voicemail from Android's store, stopping any other; it is marked heard. */
export function playVoicemail(id: number): Promise<void> {
  return native?.playVoicemail ? native.playVoicemail(id) : Promise.reject(new Error('This build of Erevos cannot do this yet.'));
}

export function stopVoicemail(): void {
  native?.stopVoicemail?.();
}

/** Deletes a voicemail; whether it went. */
export function deleteVoicemail(id: number): Promise<boolean> {
  return native?.deleteVoicemail ? native.deleteVoicemail(id) : Promise.resolve(false);
}

/** Whether this build has the spam list. */
export function spamReady(): boolean {
  return typeof native?.spamState === 'function';
}

export function spamState(): SpamState | null {
  try {
    return native?.spamState?.() ?? null;
  } catch {
    return null;
  }
}

/** Keeps a downloaded list in place of the one before; how many numbers it holds. */
export function setSpamList(text: string, source: string): Promise<number> {
  return native?.setSpamList ? native.setSpamList(text, source) : Promise.reject(new Error('This build of Erevos cannot do this yet.'));
}

export function clearSpamList(): void {
  native?.clearSpamList?.();
}

export function setSpamSwitches(warn: boolean, silence: boolean): void {
  native?.setSpamSwitches?.(warn, silence);
}

/** Whether the list is downloaded again each week (lib/spam-list.ts refreshSpamList). */
export function setSpamAuto(auto: boolean): void {
  native?.setSpamAuto?.(auto);
}

/** Reports a number as spam on this phone only, or takes it back. */
export function reportSpam(number: string, spam: boolean): void {
  native?.reportSpam?.(number, spam);
}

export function reportedSpam(number: string): boolean {
  try {
    return native?.reportedSpam?.(number) === true;
  } catch {
    return false;
  }
}

export function clearSpamReports(): void {
  native?.clearSpamReports?.();
}

/** Whether a SIM of the phone can make the phone company's video calls (ViLTE); false in a build without them. */
export function videoCalling(): boolean {
  try {
    return native?.videoCalling?.() === true;
  } catch {
    return false;
  }
}

/** A video call through the phone company (ViLTE) to `number`, on that SIM or the default one. */
export function placeVideoCall(number: string, account = ''): Promise<void> {
  if (!native?.placeVideoCall) return Promise.reject(new Error('This build of Erevos cannot do this yet.'));
  return native.placeVideoCall(number, account);
}

/** Android's call history, its newest 500 calls; `allowed` is false while Android does not let
 *  Erevos read it. Erevos keeps no copy. */
export function callHistory(): Promise<{ allowed: boolean; calls: LoggedCall[] }> {
  return native ? native.history() : Promise.resolve({ allowed: false, calls: [] });
}

/** Deletes calls from Android's call history, by their ids; how many went. The phone app may. */
export function deleteCalls(ids: number[]): Promise<number> {
  return native ? native.deleteCalls(ids) : Promise.resolve(0);
}

/** Deletes every call with this number from the call history up to `before` (when the owner
 *  deleted them), the older ones too. */
export function deleteCallsOf(number: string, before: number): Promise<number> {
  return native ? native.deleteCallsOf(number, before) : Promise.resolve(0);
}

/** Whether this build can put the call history and the blocked numbers in backups (lib/backup-calls.ts). */
export function callsBackupReady(): boolean {
  return typeof native?.backupCalls === 'function';
}

/**
 * The call history, its newest calls, and Android's blocked numbers, for a backup, as JSON
 * (CallsBackup.kt): `allowed` false while Android does not let Erevos read the call history, no
 * `blocked` while it does not let it read the list, as only the phone app and the SMS app may.
 * Null in a build without it.
 */
export function backupCallLog(): Promise<string | null> {
  return native?.backupCalls ? native.backupCalls() : Promise.resolve(null);
}

/** Adds to the phone's call history and blocked numbers those of a backup it lacks (JSON, as
 *  lib/backup-calls.ts gives them), as the phone app; how many of each went in. */
export function restoreCallLog(json: string): Promise<{ calls: number; blocked: number }> {
  return native?.restoreCalls ? native.restoreCalls(json) : Promise.reject(new Error('This build of Erevos cannot do this yet.'));
}

/** The phone's starred contacts, by name; `allowed` is false while Android does not let Erevos
 *  read the contacts. */
export function phoneFavourites(): Promise<{ allowed: boolean; favourites: Favourite[] }> {
  return native ? native.favourites() : Promise.resolve({ allowed: false, favourites: [] });
}

/** The phone's contact groups, by title, to block one's calls for a while; `allowed` is false
 *  while Android does not let Erevos read the contacts. */
export function phoneGroups(): Promise<{ allowed: boolean; groups: ContactGroup[] }> {
  return native ? native.groups() : Promise.resolve({ allowed: false, groups: [] });
}

/** The missed calls were seen: Android's notice of them goes. */
export function seenMissedCalls(): void {
  native?.seenMissed();
}

/** The quick replies the call screen's Message offers, to decline a call with an SMS: the owner's
 *  own (`own`), else the usual ones in the app's language. Kept on the phone, not sealed, as the
 *  call screen shows them with Erevos locked. */
export function quickReplies(): { replies: string[]; own: boolean } {
  return native ? native.quickReplies() : { replies: [], own: false };
}

/** Keeps the owner's quick replies; [] goes back to the usual ones. */
export function setQuickReplies(replies: string[]): void {
  native?.setQuickReplies(replies);
}

/** Brings the call screen back while a call is on. */
export function showCall(): void {
  native?.showCall();
}

/**
 * Names Erevos knows for phone numbers, `{ number: name }`, which the call screen and its notice
 * show for a call with one of them, before the phone's contacts: the names of contacts kept only
 * inside Erevos, sealed. Give them only while a space is open, and only the space's own, with an
 * open hidden place's only while it is open (lib/known-names.ts). They stay in the memory of Erevos's process only, never written anywhere, and
 * each call replaces the ones before; clearKnownNames() forgets them, which the app does whenever
 * the space locks (app/_layout.tsx), and forgetKnownNamesAfter() when it would, in the background.
 * With Erevos locked, a call shows the phone's contacts only.
 */
export function setKnownNames(names: Record<string, string>): void {
  native?.setKnownNames(names);
}

export function clearKnownNames(): void {
  native?.clearKnownNames();
}

/** Erevos went to the background: the names are forgotten after `ms`, when the space would lock,
 *  unless the app keeps them again first, with `ms` -1. The native side forgets them on its own,
 *  as the app may not run in the background. */
export function forgetKnownNamesAfter(ms: number): void {
  native?.forgetKnownNamesAfter(ms);
}

export function onPhoneEvent<Name extends keyof PhoneEvents>(name: Name, listener: PhoneEvents[Name]): EventSubscription | null {
  return native ? native.addListener(name, listener) : null;
}
