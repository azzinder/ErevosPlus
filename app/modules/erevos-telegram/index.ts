// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { ComponentType } from 'react';
import type { ViewProps } from 'react-native';
import { requireNativeViewManager, requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';

// Telegram through TDLib, only in the ErevosGram build of Erevos for Android (android/build.gradle).
// Every other build has a module that says it is not here, and other platforms none: then
// `telegramNative` is null and nothing of Telegram shows (lib/modules.ts).

/** TDLib for each space with a Telegram account, named by its slot (hex from the space's key). */
export type TelegramNative = {
  available(): boolean;
  /** The slots with a folder on the phone. */
  slots(): string[];
  /** Opens a space's client; `key` (32 bytes) encrypts its database; `proxy`, an addProxy request TDLib gets before it first connects ('' for none). */
  open(slot: string, key: Uint8Array, lang: string, proxy?: string): Promise<void>;
  /** A TDLib request as JSON; the answer as JSON, an error object too. */
  send(slot: string, request: string): Promise<string>;
  close(slot: string): Promise<void>;
  /** Deletes the space's Telegram from the phone, without logging out. */
  wipe(slot: string): Promise<void>;
  /** The space's sign-in as TDLib keeps it (encrypted with `open`'s key), base64, for a backup; null where it has none. Missing in a build from before it. */
  signIn?(slot: string): Promise<string | null>;
  /** Puts a backup's sign-in in place before the space's client first opens; false where it has one, or is open. Missing in a build from before it. */
  putSignIn?(slot: string, signIn: string): Promise<boolean>;
  addListener(event: 'onUpdates', listener: (event: { slot: string; updates: string[] }) => void): EventSubscription;
  /** Starts recording a voice message in Telegram's Ogg/Opus; false when the microphone could not start. */
  voiceStart(): Promise<boolean>;
  /** Stops: the file, its length in seconds, its waveform (base64) and whether it is Opus; null when under a second. */
  voiceStop(): Promise<TelegramVoice | null>;
  /** Lets the recording go. */
  voiceCancel(): Promise<void>;
  /** An Erevos sticker's PNG made a WebP Telegram takes as a sticker (512 on its longer side): its path. */
  stickerWebp(png: Uint8Array): Promise<string>;
} & TelegramCallsNative;

/** A recorded Telegram voice message, a file in the app's cache until it is sent. */
export type TelegramVoice = { path: string; seconds: number; waveform: string; opus: boolean };

/**
 * The sound of a Telegram call (NTgCalls, in its own class loader); TDLib does the calling. One
 * call at a time. Bytes cross as base64, as TDLib's JSON writes them.
 */
export type TelegramCallsNative = {
  /** TDLib's callProtocol for this phone, as JSON. */
  callProtocol(): Promise<string>;
  /** Opens the sound once TDLib's call is ready: `ready` is its callStateReady as JSON. */
  callStart(userId: number, outgoing: boolean, ready: string, camera: boolean): Promise<void>;
  /** This phone's camera into the call or out of it; the camera permission must be given. */
  callCamera(on: boolean): Promise<void>;
  /** The front camera or the back one. */
  callSwitchCamera(): Promise<void>;
  /** Signaling data from the other phone (updateNewCallSignalingData). */
  callSignal(userId: number, data: string): Promise<void>;
  callMute(on: boolean): Promise<void>;
  callStop(): Promise<void>;
  /** "signal": data to give TDLib (sendCallSignalingData); "state": CONNECTING, CONNECTED, FAILED, TIMEOUT or CLOSED; "video": "on" or "off", the other's camera. */
  addListener(event: 'onCall', listener: (event: { kind: 'signal' | 'state' | 'video'; data: string }) => void): EventSubscription;
};

const native = requireOptionalNativeModule<TelegramNative>('ErevosTelegram');

export const telegramNative: TelegramNative | null = native && native.available() ? native : null;

/**
 * Where a Telegram video call's pictures are drawn (CallVideo.kt): `side` "remote" for the other
 * phone's, "local" for this phone's camera. Null in every build without Telegram.
 */
export const TelegramVideoView: ComponentType<ViewProps & { side: 'local' | 'remote' }> | null = telegramNative ? requireNativeViewManager('ErevosTelegram') : null;

/**
 * A Telegram sticker that moves (StickerView.kt), played from its downloaded file: `path`. Null in
 * every build without Telegram.
 */
export const TelegramStickerView: ComponentType<ViewProps & { path: string }> | null = telegramNative ? requireNativeViewManager('ErevosTelegram', 'TelegramStickerView') : null;

/**
 * A message's video or GIF (MediaView.kt), from its downloaded file: `path`. Without `controls` it
 * plays muted and round and round, as a GIF; with them, with sound and Android's own controls.
 * Null in every build without Telegram.
 */
export const TelegramMediaView: ComponentType<ViewProps & { path: string; controls?: boolean }> | null = telegramNative ? requireNativeViewManager('ErevosTelegram', 'TelegramMediaView') : null;
