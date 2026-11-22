// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { requestRecordingPermissionsAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

import { randomBytes, toHex } from './crypto';
import { t } from './i18n';
import { fileName } from './imports';
import { pickPhoto, type PhotoQuality } from './pick-photo';
import { stickerImage } from './sticker-image';
import { stickerOf } from './stickers';
import { TooLargeError } from './pick-file';
import { whilePicking } from './picking';
import { telegramNative } from '../modules/erevos-telegram';
import type { TgSendKind, TgVoiceOut } from './telegram-store';

// A photo or file picked to send to a Telegram chat (app/telegram-chat.tsx): TDLib reads what it
// sends from a path of the app's own, so the pick is copied into the cache first. A photo is the
// one lib/pick-photo.ts makes, with what the camera wrote about place and time taken out. TDLib
// reads the copy while it uploads, which goes on after sendMessage answers, so a copy is deleted
// once a day has passed: by a later pick, or when a Telegram chat is opened.

const OUT = 'erevos-tg-out-';
const KEEP_MS = 24 * 60 * 60 * 1000;

export { TELEGRAM_MOST } from './telegram';
import { TELEGRAM_MOST } from './telegram';

/** Deletes the copies made to send that are a day old: at each pick, and when a Telegram chat opens. */
export function clearOld(now = Date.now()): void {
  try {
    for (const entry of Paths.cache.list()) {
      if (entry instanceof File && entry.name.startsWith(OUT) && now - (entry.modificationTime ?? now) > KEEP_MS) entry.delete();
    }
  } catch {
    // Tried again with the next pick.
  }
}

// A name that is safe as the end of a path: Telegram shows it as the file's name.
const safeName = (name: string) => name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(-120) || 'file';

// TDLib takes a plain path, not a file:// link with its letters escaped.
const pathOf = (file: File) => decodeURIComponent(file.uri.replace(/^file:\/\//, ''));

export type TgOutgoing = { path: string; name: string; kind: TgSendKind };

/** A photo from the gallery or the camera, ready to send; null if the owner went back. */
export async function telegramPickPhoto(from: 'photos' | 'camera', quality: PhotoQuality = 90): Promise<TgOutgoing | null> {
  const photo = await pickPhoto(from, quality);
  if (!photo) return null;
  clearOld();
  const name = safeName(photo.name);
  const copy = new File(Paths.cache, `${OUT}${toHex(randomBytes(8))}-${name}`);
  copy.create();
  copy.writeSync(photo.bytes);
  return { path: pathOf(copy), name, kind: 'photo' };
}

/** A photo or file Send to handed a Telegram chat (lib/shared-here.ts), read whole, as a copy TDLib sends: a photo as a photo, a video as a video. */
export function telegramFileOf(file: { name: string; mime: string; bytes: Uint8Array }): TgOutgoing {
  if (file.bytes.length > TELEGRAM_MOST) throw new TooLargeError();
  clearOld();
  const name = safeName(file.name);
  const copy = new File(Paths.cache, `${OUT}${toHex(randomBytes(8))}-${name}`);
  copy.create();
  copy.writeSync(file.bytes);
  const kind = file.mime.startsWith('image/') && file.mime !== 'image/gif' ? 'photo' : file.mime.startsWith('video/') ? 'video' : 'document';
  return { path: pathOf(copy), name, kind };
}

/** Any file, sent as it is (a video as a video); null if the owner went back. Throws TooLargeError above Telegram's size. */
export async function telegramPickFile(): Promise<TgOutgoing | null> {
  const picked = await whilePicking(() => File.pickFileAsync({ mimeTypes: ['*/*'] }));
  if (picked.canceled) return null;
  const file = picked.result;
  if (file.size > TELEGRAM_MOST) throw new TooLargeError();
  clearOld();
  const name = safeName(fileName(file.uri));
  const copy = new File(Paths.cache, `${OUT}${toHex(randomBytes(8))}-${name}`);
  await file.copy(copy);
  return { path: pathOf(copy), name, kind: (file.type ?? '').startsWith('video/') ? 'video' : 'document' };
}

/**
 * A Telegram voice message, recorded in Telegram's own Ogg/Opus by the ErevosGram build
 * (modules/erevos-telegram Voice.kt): start asks for the microphone first and says whether it
 * records; stop gives what to send (lib/telegram-store.ts telegramSendVoice), or null when it was
 * under a second; cancel lets it go.
 */
export async function telegramVoiceStart(): Promise<boolean> {
  if (!telegramNative) return false;
  const permission = await requestRecordingPermissionsAsync();
  if (!permission.granted) return false;
  return telegramNative.voiceStart();
}

export async function telegramVoiceStop(): Promise<TgVoiceOut | null> {
  return telegramNative ? telegramNative.voiceStop() : null;
}

export async function telegramVoiceCancel(): Promise<void> {
  await telegramNative?.voiceCancel();
}

/**
 * A built-in Erevos sticker (lib/stickers.ts) as Telegram takes one: its picture (lib/sticker-image.ts)
 * made a 512 WebP by the ErevosGram build (modules/erevos-telegram StickerOut.kt). Its file and
 * emoji, to send (lib/telegram-store.ts telegramSendStickerFile). It does not move at Telegram.
 */
export async function telegramErevosSticker(name: string): Promise<{ path: string; emoji: string }> {
  const png = telegramNative ? await stickerImage(name, 512) : null;
  if (!telegramNative || !png) throw new Error(t('This sticker cannot be sent to Telegram.'));
  return { path: await telegramNative.stickerWebp(png.bytes), emoji: stickerOf(name)?.emoji ?? '' };
}
