// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { requireNativeViewManager, requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';
import type { ComponentType } from 'react';
import type { ViewProps } from 'react-native';

// Messenger, Signal and Session (messenger/ at the top of the repository), only in Erevos+ for
// Android (android/build.gradle). The plain Erevos has a module that says they are not here, and
// other platforms none: then `messengerNative` is null and nothing of them shows (lib/modules.ts).

/** The three services the engines speak. */
export type MessengerService = 'messenger' | 'signal' | 'session';

export type MessengerNative = {
  available(): boolean;
  /** Whether Erevos is in front: Session then reads new messages more often. */
  setInFront(front: boolean): void;
  /** Opens the engines' folders under the app's private files, sealed by the Android Keystore. */
  open(): Promise<void>;
  /**
   * One request to a service's engine (messenger/docs/api.md for Messenger; Signal and Session take
   * the same ops where they have them): its answer as JSON, `{"ok": …}` or `{"error": "…"}`.
   */
  call(service: MessengerService, op: string, args: string): Promise<string>;
  /**
   * A page of the service the owner fills in by themselves: 'messenger' is Messenger's sign-in on facebook.com,
   * answered with its cookies as JSON (to give to the `login` op); 'signalCaptcha' is Signal's
   * captcha, answered with its token (for `register`). Null when the owner went back.
   */
  webSignIn(kind: 'messenger' | 'signalCaptcha'): Promise<string | null>;
  /**
   * The same page, only through Tor: `door` is Tor's SOCKS door as JSON ({host, port, user,
   * password}, lib/tor.ts torSocks). Refused, never shown straight, where the web view cannot.
   * Missing in a build from before it.
   */
  webSignInTor?(kind: 'messenger' | 'signalCaptcha', door: string): Promise<string | null>;
  /**
   * Facebook itself (m.facebook.com) with the Messenger account's sign-in, on a screen of its own;
   * `door` is Tor's SOCKS door as JSON when the account goes through Tor, else ''. Answers
   * 'messages', or 'thread:<id>' for one chat, when the owner followed a Messenger link there;
   * null when they went back. Missing in a build from before it.
   */
  facebook?(door: string): Promise<string | null>;
  /**
   * Messenger in its case: facebook.com/messages itself in a closed web view of Erevos's own
   * (MessengerCaseActivity), with the engine's sign-in, given to the page only while it shows;
   * `door` as for `facebook`; `thread` a chat to open, or ''. Answers, as it closes, 'cookies:'
   * and the sign-in the page ended with (JSON, for the `login` op), 'signedOut' when the owner
   * signed out there, or null. Missing in a build from before it.
   */
  messengerCase?(door: string, thread: string): Promise<string | null>;
  /**
   * Closes the web pages on screens of their own (the case, Facebook, a sign-in page) as the space
   * locks or closes, or on panic (lib/web-pages.ts). Missing in a build from before it.
   */
  closeWebPages?(): void;
  /** Whether Messenger's case is on the screen now (not left behind Home, the screen off or the lock). */
  caseInFront?(): boolean;
  /** Keeps those pages out of screenshots and the recent apps preview, as Erevos's own screen. */
  setWebPagesSecure?(on: boolean): void;
  /** The colours of those pages' bar (JSON: bar, text, accent, dark), as Erevos's own screen. */
  setWebPagesLook?(look: string): void;
  /** The words of Session's call screen and notifications (lib/session-calls.ts). */
  setCallTexts(words: string): void;
  /**
   * Calls the person of a one-to-one Session chat (its key) on a screen of its own, which asks for
   * the microphone, and the camera for video. False when another Session call is on.
   */
  sessionCall(thread: string, name: string, video: boolean): boolean;
  /**
   * Each Session chat's notification choice, as JSON: chat key → muted until (ms; 0 or less for
   * ever), or → {until?: ms, ring?: ringtone uri, or '' for none}. A muted chat's call is shown quietly (no ringtone,
   * nothing over the lock screen); a chat's own ringtone rings its calls. Replaces earlier choices.
   */
  setSessionMuted(choices: string): void;
  /**
   * Signal's 1:1 calls (SignalCalls.kt, with RingRTC): calls the person whose chat key is `person`,
   * with this phone's camera on when `video` (the camera and microphone permissions given). How the
   * call stands comes as signalCallState events of the 'signal' service.
   */
  signalCall(person: string, video: boolean): Promise<void>;
  /** Answers the Signal call that rings, with this phone's camera on when `camera`. */
  signalAnswer(camera: boolean): Promise<void>;
  /** Hangs up, declines or cancels the Signal call. */
  signalHangUp(): Promise<void>;
  signalMute(on: boolean): Promise<void>;
  /** This phone's camera into the Signal call, or out of it. */
  signalCamera(on: boolean): Promise<void>;
  /** The front camera or the back one. */
  signalFlip(): Promise<void>;
  /** Stops Messenger's engine (the app is locked, or the module turned off). */
  close(): Promise<void>;
  /** Each event of an engine, as JSON with its `type` (messenger/docs/api.md). */
  addListener(event: 'onEvent', listener: (event: { service: MessengerService; json: string }) => void): EventSubscription;
};

const native = requireOptionalNativeModule<MessengerNative>('ErevosMessenger');

/** The engines, when this build has them. */
export const messengerNative: MessengerNative | null = native && native.available() ? native : null;

/** Where a Signal video call is drawn: 'remote' the other phone's picture, 'local' this phone's camera. */
export const SignalVideoView: ComponentType<ViewProps & { side: 'local' | 'remote' }> | null = messengerNative ? requireNativeViewManager('ErevosMessenger') : null;
