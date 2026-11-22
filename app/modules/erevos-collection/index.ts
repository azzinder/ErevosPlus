// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { ComponentType, Ref } from 'react';
import type { ViewProps } from 'react-native';
import { requireNativeViewManager, requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';

// The Collection's own part of Android (ErevosCollectionModule.kt): its files read where they lie,
// encrypted, to open with another app, to show a PDF, and to play music and videos with the screen
// off; a picked file brought in, encrypted as it is read; the gallery's originals deleted once
// brought in; and a photo or file another app shared, encrypted as it came. Null on the web, on a
// computer and in an Android build before it: then the Collection does without.

/** A file of the Collection as the catalogue keeps it (lock/attachment-files.ts FileRef): where its chunks are, and its key, hex. */
export type SealedRef = { id: string; key: string; chunk: number; count: number; size: number };

/** A file of a list to play: the file, its name and type, and whether it is a video. */
export type PlayItem = SealedRef & {
  name: string;
  mime: string;
  video: boolean;
  /** Where it starts the first time it plays in the list, ms (0: from its start). */
  resume?: number;
  /** A video's subtitles: an .srt or .vtt file of the Collection, with its type. */
  subtitles?: SealedRef & { mime: string };
};

/**
 * An internet radio station to play, by its https link (lib/collection-radio.ts), or a TV channel
 * (lib/collection-tv.ts, `video`); `mime` says an HLS stream; `tor`, only through Tor (Play through
 * Tor, where canPlayThroughTor). Not in builds before it; a channel plays only its sound in builds
 * before channels.
 */
export type PlayStation = { url: string; name: string; mime: string; video: boolean; tor?: boolean };

/** What plays again: nothing, the whole list, or the one file. */
export type Repeat = 'off' | 'all' | 'one';

/** The player's state (Playing.kt): never a file's name. `position` and `duration` in ms, duration -1 while not known. */
export type PlayerState = {
  active: boolean;
  playing: boolean;
  index: number;
  count: number;
  position: number;
  duration: number;
  video: boolean;
  buffering: boolean;
  ended: boolean;
  /** Why the file could not play (Media3's error code name), when that is what changed. */
  error?: string | null;
  /** The list plays in an order of its own. */
  shuffle?: boolean;
  repeat?: Repeat;
  /** How fast it plays: 1 as it is. */
  speed?: number;
  /** Whether there is a file to go on to, or back to, as the order and repeat say. */
  hasNext?: boolean;
  hasPrevious?: boolean;
  /** What the file says of itself (its tags), for the screen inside Erevos only. */
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  /** Whether it has a cover inside (playerArtwork). */
  artwork?: boolean;
  /** Whether the video has subtitles, and whether they show. */
  subtitles?: boolean;
  subtitlesOn?: boolean;
};

type Native = {
  /** A link another app opens the file by, streamed as it is decrypted; forget it by its token. */
  openWith(file: SealedRef, name: string, mime: string): { token: string; uri: string };
  /** The same for a chat's file, its bytes (base64) held in memory only until forgotten. Not in builds before it. */
  openBytesWith?(data: string, name: string, mime: string): { token: string; uri: string };
  forget(token: string): void;
  /** Forgets every link and closes every PDF. */
  forgetAll(): void;
  /** The space locked or closed: forgetAll, and the list stops if the owner chose so. */
  locked(): void;
  /** What locked does, in `ms`, unless called again first; -1 to call it off. */
  lockAfter(ms: number): void;
  /** The panic button: everything here stops and every key goes. */
  panic(): void;
  pdfAvailable(): boolean;
  pdfOpen(file: SealedRef): Promise<{ handle: string; pages: number }>;
  /** One page `width` pixels wide, base64 PNG (or JPEG), and its size in pixels. */
  pdfPage(handle: string, index: number, width: number, format: 'png' | 'jpeg'): Promise<{ data: string; width: number; height: number }>;
  pdfClose(handle: string): void;
  playList(items: (PlayItem | PlayStation)[], start: number, options: { showTitle: boolean; neutral: string; stopOnLock: boolean; stopLabel: string }): Promise<PlayerState>;
  /** Whether a station or a channel plays only through Tor here (PlayStation `tor`). Not in builds before it, which play every one straight. */
  canPlayThroughTor?(): boolean;
  pause(): Promise<void>;
  resume(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  /** To `index` in the list (-1 for the one playing), `ms` from its start. */
  seek(index: number, ms: number): Promise<void>;
  stop(): Promise<void>;
  setStopOnLock(on: boolean): void;
  playerState(): Promise<PlayerState>;
  /** The list in an order of its own, or in its order again. Not in builds before it. */
  setShuffle?(on: boolean): Promise<void>;
  setRepeat?(mode: Repeat): Promise<void>;
  /** 0.5 to 2. */
  setSpeed?(speed: number): Promise<void>;
  /** A video's subtitles shown, or not. */
  setSubtitles?(on: boolean): Promise<void>;
  /** Where the files of the list got to since last asked, by their place in it (ms; 0 once played to its end), with how long each is (-1 if not known). */
  takePositions?(): Promise<{ index: number; position: number; duration: number }[]>;
  /** The cover inside the file playing, base64, or null. */
  playerArtwork?(): Promise<string | null>;
  canDeleteFromGallery(): boolean;
  /** Android's own dialog asks the owner to delete these from the gallery. */
  deleteFromGallery(uris: string[]): Promise<'deleted' | 'kept' | 'none' | 'unavailable'>;
  /**
   * Encrypts the file a content:// link names into the Collection's chunks as it is read, with no
   * plain copy (Sealer.kt); `expected` is the size the picker said, for the progress only, told as
   * onSeal events of `job`. Rejects ERR_CANCELLED, ERR_TOO_LARGE or ERR_SEAL, leaving nothing.
   * Not in builds before it.
   */
  sealFromUri?(uri: string, expected: number, job: string): Promise<SealedRef>;
  sealCancel?(job: string): void;
  /** The first `length` bytes of the file a content:// link names, base64 (1 MiB at most). */
  readHead?(uri: string, length: number): Promise<string>;
  /**
   * The photo or file another app shared, encrypted as it came (ShareActivity.kt, SharedIn.kt), by
   * the id its link gave: as the catalogue keeps it, with a photo's size as it shows (0 if not a
   * photo) and its small picture (base64 JPEG, '' if none); null when it is not the one waiting.
   * Not in builds before it.
   */
  sharedFile?(id: string): (SealedRef & { w: number; h: number; thumb: string }) | null;
  /** The Collection takes the shared file's chunks as its own: its key goes from Android's memory. */
  sharedKeep?(id: string): void;
  /** The shared file was sent or left: its chunks and key go. */
  sharedDrop?(id: string): void;
  /** The words of Send to's encrypting screen, in Erevos's language (`encrypting`, `cancel`). Not in builds before it. */
  setShareTexts?(texts: { encrypting: string; cancel: string }): void;
  addListener(event: 'onPlayer', listener: (state: PlayerState) => void): EventSubscription;
  addListener(event: 'onSeal', listener: (event: { job: string; done: number; count: number }) => void): EventSubscription;
};

export const collectionNative = requireOptionalNativeModule<Native>('ErevosCollection');

let videoView: ComponentType<ViewProps> | null | undefined;

/** The video of the list playing, with its controls (VideoView.kt); null where there is none. */
export function collectionVideoView(): ComponentType<ViewProps> | null {
  if (videoView !== undefined) return videoView;
  try {
    videoView = collectionNative ? requireNativeViewManager<ViewProps>('ErevosCollection') : null;
  } catch {
    videoView = null;
  }
  return videoView;
}

/** A photo Extension of the phone's maker (CameraX Extensions): night, HDR, portrait (bokeh), auto. */
export type CameraEffect = 'night' | 'hdr' | 'bokeh' | 'auto';

/** What the camera open can do (CameraPreview.kt tellReady), for the buttons to show. */
export type CameraReady = {
  /** The Extensions this camera has, if any. */
  effects: CameraEffect[];
  /** The zoom it takes, as ratios: below 1 where it has a wide lens. */
  minZoom: number;
  maxZoom: number;
  /** Whether it can be made brighter or darker, by steps of exposureStep (EV) from exposureMin to exposureMax. */
  exposure: boolean;
  exposureMin: number;
  exposureMax: number;
  exposureStep: number;
  /** Whether it films video in HDR (HLG, 10-bit). */
  hdrVideo: boolean;
  /** Whether it has a flash, for the flash and the light. */
  flash: boolean;
  /** Whether the phone has a front camera. */
  front: boolean;
};

export type CameraProps = ViewProps & {
  facing: 'back' | 'front';
  mode: 'photo' | 'video';
  effect: CameraEffect | 'none';
  quality: '720p' | '1080p' | '2160p';
  hdrVideo: boolean;
  flash: 'off' | 'on' | 'auto';
  torch: boolean;
  /** The zoom, as a ratio (CameraReady minZoom to maxZoom). */
  zoom: number;
  onReady?: (event: { nativeEvent: CameraReady }) => void;
  /** The camera could not open, or stopped: `kind` says which; `message` is English, never shown. */
  onFail?: (event: { nativeEvent: { kind: 'open' | 'stopped'; message: string } }) => void;
  /** How far a night photo has come, 0 to 100. */
  onProcessing?: (event: { nativeEvent: { progress: number } }) => void;
};

/** What the camera is asked to do, through its ref. */
export type CameraHandle = {
  /** A photo taken into memory, cleaned of everything but its picture: JPEG bytes, its size, and its small picture (JPEG). */
  takePhoto(silent: boolean): Promise<{ data: Uint8Array | string; width: number; height: number; thumb?: Uint8Array | string }>;
  /** Records until stopRecording; resolves then with the video's file:// link in the app's cache. */
  record(muted: boolean, silent: boolean): Promise<{ uri: string }>;
  stopRecording(): Promise<void>;
  /** Focuses and meters at a point of the view; false where the camera cannot. */
  focusAt(x: number, y: number): Promise<boolean>;
  setExposure(index: number): Promise<void>;
};

let cameraViewType: ComponentType<CameraProps & { ref?: Ref<CameraHandle> }> | null | undefined;

/** Erevos's own camera (CameraPreview.kt); null on the web, a computer, and builds before it. */
export function cameraView(): ComponentType<CameraProps & { ref?: Ref<CameraHandle> }> | null {
  if (cameraViewType !== undefined) return cameraViewType;
  try {
    cameraViewType = requireOptionalNativeModule('ErevosCamera') ? requireNativeViewManager<CameraProps>('ErevosCamera') : null;
  } catch {
    cameraViewType = null;
  }
  return cameraViewType;
}
