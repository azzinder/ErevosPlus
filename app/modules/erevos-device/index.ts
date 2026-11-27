// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';

export type DeviceEvents = {
  /** Where the phone was found, once findPlace started: `acc` metres, -1 when not said, `age` seconds before; or `error`. */
  onPlace: (event: { lat?: number; lon?: number; acc?: number; age?: number; error?: 'timeout' }) => void;
};

/**
 * The panic button's settings (Panic.kt): `trigger` and `pending` are packages, '' for none.
 * `triggerThere`: the trusted app is installed and signed as when trusted (or moved to a new key by
 * APK key rotation); `triggerInstalled`: installed at all. `refused`: when the trusted app last
 * asked to wipe and was refused (ms, 0 for never), and `refusedKey` whether for its signature;
 * missing in a build before them.
 */
/** An app that takes PanicKit's TRIGGER, as Fasouli: told as Erevos wipes when `told`. */
export type PanicResponder = { pkg: string; label: string; told: boolean };

export type PanicState = {
  on: boolean;
  backups: boolean;
  trigger: string;
  triggerLabel: string;
  triggerThere: boolean;
  triggerInstalled?: boolean;
  refused?: number;
  /** Whether that refusal was for the app's signature, not the switch. */
  refusedKey?: boolean;
  pending: string;
  pendingLabel: string;
};

/** One kind of Erevos's own files: the start of their names (erevos-file-), or a folder (files/tor/), its bytes and how many files. */
export type AppSpaceRow = { kind: string; bytes: number; files: number };

/** A file of a folder picked with Android's folder picker (Folders.kt). */
export type FolderFile = { name: string; size: number; uri: string };

/** This Erevos given nearby (NearbyApk.kt): where, the package's SHA-256, size and version, and its certificates' SHA-256s, joined with commas. */
export type GivingApp = { addresses: string[]; port: number; token: string; sha256: string; size: number; version: string; cert: string; until: number };

type Device = {
  /** Whether Android shows the keyboard over the app now (its window's insets); null with no screen showing or before Android 11. Missing in a build before it. */
  keyboardShown?(): Promise<boolean | null>;
  /** The clock the owner cannot set: ms since the phone started, sleep included, and which start that is (lock/tries.ts). Missing in a build before it. */
  clock?(): { up: number; boot: string };
  /** Answers as an NFC tag with `uri` (an https address), until nfcStop or ten minutes (NfcShare.kt). False when it cannot. Missing in a build before it. */
  nfcShare?(uri: string): boolean;
  /** Stops answering as an NFC tag. Missing in a build before it. */
  nfcStop?(): void;
  /** Whether this phone can give a link by NFC: 'on', 'off' (NFC off in Android's settings) or 'none'. Missing in a build before it. */
  nfcState?(): 'on' | 'off' | 'none';
  /** Puts the text on the phone's clipboard, marked sensitive. False when it could not. */
  copyText(text: string): boolean;
  /** Starts looking for where the phone is, once: '' when it did, else why not. Missing in a build before places. */
  findPlace?(): '' | 'permission' | 'off' | 'approximate';
  /** Stops looking, with nothing said. Missing in a build before it. */
  stopPlace?(): void;
  /** Keeps the app out of screenshots and the recent apps preview while on. False with no screen showing. Missing in a build before it. */
  setSecure?(on: boolean): boolean;
  /** The curtain over a space with a password lock (Curtain.kt, lib/curtain.ts): from now on the phone covers the screens as they go out of sight, in the colour `ground` (Android's own number for it), and keeps them covered when they come back after more than `after` ms; under 0, no longer. Missing in a build before it, as the four below. */
  curtainArm?(after: number, ground: number): void;
  /** Covers the screens now, until curtainLift. */
  curtainLower?(): void;
  /** Takes the cover away: at once, or with `onScreen` once a screen marked CURTAIN_END is drawn under it. */
  curtainLift?(onScreen: boolean): void;
  /** What happened as the screens last came back, once: how long Erevos was away (ms, on the clock nobody can set) and whether the cover stayed. Null when they were not out of sight since. */
  curtainBack?(): { away: number; kept: boolean } | null;
  /** Whether the cover is there now. */
  curtainDown?(): boolean;
  /** While on, the screen turns with the phone even with its auto-rotate off; off, it follows the setting again. False with no screen showing. Missing in a build before it. */
  turnWithPhone?(on: boolean): boolean;
  /** Keeps a reminder of Chat with myself for `at` (ms), told with Erevos closed; one with this id is replaced. False when too many wait. Missing in a build before it. */
  remind?(id: string, at: number): boolean;
  /** Forgets a reminder that has not come. Missing in a build before reminders. */
  forgetReminder?(id: string): void;
  /** Reminders seen in their chat: the notice no longer tells of them, and goes once it tells of none. Missing in a build before it. */
  seenReminders?(ids: string[]): void;
  /** A notice says that Erevos `name` is out, and opens Updates (lib/release-notice.ts). Missing in a build before it. */
  tellUpdate?(name: string): void;
  /** A notice says that a backup made by hand is done: `title`, `text`, in a channel named `channel`, all in the app's words (app/backup.tsx). Missing in a build before it. */
  tellBackup?(title: string, text: string, channel: string): void;
  /** This app's Android package (app.erevos, app.erevos.plus, app.erevos.lite). Missing in a build before moves. */
  packageName?(): string;
  /** The folder a move's files are written to, for another edition to take (Move.kt); null with no app context. */
  moveOutDir?(): string | null;
  /** Deletes the move's files. */
  moveClear?(): boolean;
  /** Whether the app `pkg` is installed, however signed. */
  appInstalled?(pkg: string): boolean;
  /** Opens the edition `pkg` (one of the three, installed): whether it opened. */
  openApp?(pkg: string): boolean;
  /** The other editions on the phone, signed as this one, whose move waits: each one's package and its move.json. */
  moveSources?(): Promise<{ pkg: string; move: string }[]>;
  /** Copies the file `name` of `pkg`'s move to `path`, a file of this app's own: its size. */
  moveCopy?(pkg: string, name: string, path: string): Promise<number>;
  /** The bytes this app's engines carry in a move beside its backup (MoveNet.kt): 0 when none. */
  moveNetSize?(): number;
  /** Takes what `pkg`'s engines carry in its move, beside this app's own, not yet in place: its bytes. */
  moveTakeNet?(pkg: string): Promise<number>;
  /** Puts in place what a move carried: false when an engine is open here, and it goes in place at the next start. */
  movePlaceNet?(): Promise<boolean>;
  /** Ends this app's process (an app moved out, left: lib/move-state.ts), so no engine runs on in it. */
  endProcess?(): void;
  /** Deletes what a move carried and did not put in place. */
  moveDropNet?(): boolean;
  /** Whether what a move carried waits for the next start to go in place. */
  moveNetPending?(): boolean;
  /** Tells `pkg` that its move was taken, so its files go. */
  moveDone?(pkg: string): Promise<boolean>;
  /** The panic button's settings (Panic.kt). Null with no app context. Missing in a build before it. */
  panicState?(): PanicState | null;
  /** Whether the trusted panic app may wipe, and whether automatic backups in `folder` (a tree uri) go too. */
  setPanic?(on: boolean, backups: boolean, folder: string): void;
  /** Trusts the panic app that asked (`pkg`, as panicState's `pending` names it). False when it is no longer that one. */
  allowPanicApp?(pkg: string): boolean;
  /** Says no to the panic app that asked. */
  refusePanicApp?(): void;
  /** Trusts no panic app any more. */
  forgetPanicApp?(): void;
  /** Trusts the trusted panic app again as it is signed now. False when it is not installed. */
  renewPanicApp?(): boolean;
  /** The owner saw that a wipe was refused. */
  seenPanicRefused?(): void;
  /** Wipes everything Erevos keeps; Android then stops Erevos. */
  wipeNow?(): boolean;
  /** The apps on the phone that take PanicKit's TRIGGER, and whether Erevos tells them as it wipes (Panic.kt). Missing in a build before it. */
  panicResponders?(): PanicResponder[];
  /** Tells `pkg` as Erevos wipes, or no longer; it is sent CONNECT or DISCONNECT. False when it is not installed. */
  tellPanicApp?(pkg: string, on: boolean): boolean;
  /** Starts giving this Erevos's APK to a phone nearby (NearbyApk.kt), its page in these words. Missing in a build before it. */
  giveAppStart?(words: Record<string, string>): Promise<GivingApp | { error: 'split' | 'network' | 'unsigned' }>;
  /** Stops giving it. */
  giveAppStop?(): void;
  /** Whether it is still given, and how many phones took it whole. */
  giveAppState?(): { on: boolean; given: number };
  /** Takes the APK a phone nearby gives into cache/updates/nearby.apk, and checks it; `fdroid` when it is F-Droid's build. */
  takeNearbyApp?(host: string, port: number, token: string, sha256: string): Promise<{ version: string; build: number; fdroid?: boolean } | { error: string }>;
  /** How much of it came, in bytes. */
  nearbyAppProgress?(): { received: number; total: number };
  /** Stops taking it. */
  cancelNearbyApp?(): void;
  /** Starts recording a voice message as Ogg/Opus, smaller with `talk` (Voice.kt): its file's uri, or null before Android 10 or when it could not start. Missing in a build before it. */
  voiceStart?(talk: boolean): Promise<string | null>;
  /** How loud the recording was since last asked, dBFS (-160 for silence); null when none is recording. */
  voiceLevel?(): number | null;
  /** Stops the recording: its file's uri, to read and delete, or null when it failed. */
  voiceStop?(): Promise<string | null>;
  /** The sound of a recording Voice made (its uri): 4 bytes of samples a second, big-endian, then mono 16-bit little-endian samples; null when it cannot be read. Missing in a build before it. */
  voiceSamples?(uri: string): Promise<Uint8Array | null>;
  /** Mono 16-bit little-endian samples at `rate` as Ogg/Opus: the file's uri, to read and delete, or null before Android 10 or when it failed. Missing in a build before it. */
  voiceOpus?(pcm: Uint8Array, rate: number): Promise<string | null>;
  /** A folder picked with Android's folder picker (a tree uri): its files with their names, sizes (-1 where it does not say) and uris, in one look (Folders.kt). Null where it cannot be read. Missing in a build before it. */
  folderFiles?(folder: string): Promise<FolderFile[] | null>;
  /** Writes `bytes` as a new file in that folder: its name as the folder gave it, and its uri. Rejects, with none of it left, when it could not be written whole. */
  folderWrite?(folder: string, name: string, bytes: Uint8Array): Promise<{ name: string; uri: string }>;
  /** Deletes the files of these uris; how many went. */
  folderDelete?(uris: string[]): Promise<number>;
  /** Each file's size and SHA-256 (hex), read through, by its uri (Folders.kt): size -1 and sha '' for one that cannot be read. Missing in a build before it. */
  folderSha256?(uris: string[]): Promise<{ size: number; sha: string }[]>;
  /** How much room Erevos takes on the phone, by the kind its files' names say (AppSpace.kt), the largest first. Missing in a build before it. */
  appSpace?(): Promise<AppSpaceRow[] | null>;
  /** The chunks of photos and files, by the file they belong to: its id, their bytes and number, and when the newest was written (ms). Missing in a build before it. */
  chunkFiles?(): Promise<{ id: string; bytes: number; files: number; at: number }[] | null>;
  /** The names of the other files in the app's own folder, where sealed values may be. */
  storeNames?(): Promise<string[] | null>;
  /** Deletes every chunk of these files: the bytes that went. */
  deleteChunkFiles?(ids: string[]): Promise<number>;
  addListener<Name extends keyof DeviceEvents>(name: Name, listener: DeviceEvents[Name]): EventSubscription;
};

// What a chat asks of the phone itself on Android (lib/clipboard.ts, lib/place.ts). Null in a build
// made before this module was added, and on other platforms, which have their own ways or none.
export const device = requireOptionalNativeModule<Device>('ErevosDevice');
