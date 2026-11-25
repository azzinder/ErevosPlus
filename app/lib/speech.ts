// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { device } from '../modules/erevos-device';
import { speechCore } from './core';
import { t } from './i18n';
import { loadModelsServer } from './models-server';
import { soundOf } from './voice';
import { DOWNLOAD_TRIES, stalled } from './updates';

// A voice message written out, on the phone (components/speech-sheet.tsx). The words are heard by
// a speech model, Whisper small (OpenAI's, MIT), run by the core (crates/erevos-speech): it hears
// about a hundred languages, and says which it heard. The model is not in the app, as it is 268
// MB: it is downloaded once, when the owner asks for it, from the models' folder (lib/models-server.ts), and checked by the core
// against its SHA-256 before it is opened. Downloading it is the only thing that leaves the
// phone, and it says nothing of any message; the sound and its words never do. Android only, from
// a recording Android reads (Voice.kt samples); about as long to write out as the message lasts.

/** The model's file, in the folder the models are downloaded from (lib/models-server.ts): LPHL's, or one the owner named. */
export const MODEL_FILE = 'erevos-whisper-small-q8.gguf';
/** The model's size, bytes (crates/erevos-speech MODEL_SHA256 is its hash). */
export const MODEL_BYTES = 268_638_368;

const folder = () => new Directory(Paths.document, 'speech');
const modelFile = () => new File(folder(), 'erevos-whisper-small-q8.gguf');
const partFile = () => new File(folder(), 'erevos-whisper-small-q8.gguf.part');

/** Whether voice messages can be written out here: on Android, in a build with the core's speech and Android's reading of sound. */
export function canWriteOut(): boolean {
  return Platform.OS === 'android' && speechCore() !== null && !!device?.voiceSamples;
}

/** Whether the model is on this phone (whole; the core still checks it). */
export function modelHere(): boolean {
  try {
    const file = modelFile();
    return file.exists && file.size === MODEL_BYTES;
  } catch {
    return false;
  }
}

/** Deletes the model, and what was downloaded of it. */
export function deleteModel(): void {
  void speechCore()?.speechLetGo(new Uint8Array()).catch(() => undefined);
  try {
    const dir = folder();
    if (dir.exists) dir.delete();
  } catch {
    // Gone already.
  }
}

/**
 * Downloads the model, telling `onProgress` how much has come. A download whose connection brings
 * nothing for a while is tried again from the start. Throws if it is cut short or stopped.
 */
export async function downloadModel(onProgress: (received: number, total: number) => void, signal: AbortSignal): Promise<void> {
  if (modelHere()) return;
  const dir = folder();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const part = partFile();
  const from = (await loadModelsServer()) + MODEL_FILE;
  for (let tries = 1; ; tries++) {
    try {
      if (part.exists) part.delete();
      await File.downloadFileAsync(from, part, {
        idempotent: true,
        signal,
        onProgress: ({ bytesWritten }) => onProgress(bytesWritten, MODEL_BYTES),
      });
      break;
    } catch (e) {
      if (part.exists) part.delete();
      if (signal.aborted || !stalled(e)) throw e;
      if (tries >= DOWNLOAD_TRIES) throw new Error(t('The download stopped each time it was tried, as the connection brought nothing for a while. Try again later, or on another network.'));
    }
  }
  if (part.size !== MODEL_BYTES) {
    part.delete();
    throw new Error(t('The download was cut short.'));
  }
  const whole = modelFile();
  if (whole.exists) whole.delete();
  await part.move(whole);
}

// A file path from a file: uri, as the core opens it.
function pathOf(uri: string): string {
  return decodeURIComponent(uri.replace(/^file:\/\//, ''));
}

const utf8 = (text: string) => new TextEncoder().encode(text);

/**
 * The words of a voice message's sound, written out on this phone; empty when no words were
 * heard. Throws when it cannot be: no model, a model that is not the one expected (then it is
 * deleted, to be downloaded again), or a sound Android does not read.
 */
export async function writeOut(audio: Uint8Array): Promise<string> {
  const speech = speechCore();
  if (!speech || !device?.voiceSamples) throw new Error(t('This Erevos cannot write out voice messages.'));
  if (!modelHere()) throw new Error(t('The speech model is not on this phone.'));
  // Android reads the sound from a file: one in the cache folder recordings go to, named as they
  // are, so it is deleted the next time a chat opens should Erevos close before it is.
  const dir = new Directory(Paths.cache, 'Audio');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const kind = soundOf(audio);
  const file = new File(dir, `recording-${Date.now()}.${kind === 'mp4' ? 'm4a' : kind || 'ogg'}`);
  let read: Uint8Array | null;
  try {
    file.writeSync(audio);
    read = await device.voiceSamples(file.uri).catch(() => null);
  } finally {
    try {
      if (file.exists) file.delete();
    } catch {
      // The cache was cleared.
    }
  }
  if (!read || read.length < 6) throw new Error(t('Android could not read the sound of this voice message.'));
  try {
    const words = await speech.speechText(utf8(pathOf(modelFile().uri)), read.subarray(4), read.subarray(0, 4), new Uint8Array());
    return new TextDecoder().decode(words).trim();
  } catch (e) {
    if (String(e).includes('not the one expected')) {
      deleteModel();
      throw new Error(t('The speech model on this phone is not the one expected, so it was deleted. Download it again.'));
    }
    throw e;
  }
}

/** Lets go of the model and the memory it holds (about 1.5 GB), once no more is written out for now. */
export function letGoOfModel(): void {
  void speechCore()?.speechLetGo(new Uint8Array()).catch(() => undefined);
}
