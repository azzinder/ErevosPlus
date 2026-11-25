// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Directory, File, Paths } from 'expo-file-system';

import { translateCore } from './core';
import { t } from './i18n';
import { loadModelsServer } from './models-server';
import { steps, type Language, type Model } from './translate-ways';
import { DOWNLOAD_TRIES, stalled } from './updates';

// A message translated, on the phone (components/translate-sheet.tsx), between Greek, English,
// German, Spanish, French and Italian (lib/translate-ways.ts). The models (Helsinki-NLP's OPUS-MT,
// CC-BY 4.0) are run by the core (crates/erevos-speech marian.rs). As with the speech model
// (lib/speech.ts), none is in the app: each is downloaded once, when the owner asks for it, from
// the models' folder (lib/models-server.ts), and checked by the core against the SHA-256 it knows for it before it is opened.
// Downloading is the only thing that leaves the phone, and it says nothing of any message; the
// message and its translation never do. Android only (the core has it there alone).

const folder = () => new Directory(Paths.document, 'translate');
const modelFile = (m: Model) => new File(folder(), m.file);
const partFile = (m: Model) => new File(folder(), `${m.file}.part`);

/** Whether messages can be translated here: a build whose core translates (Android). */
export function canTranslate(): boolean {
  return translateCore() !== null;
}

/** Whether the model `m` is on this phone (whole; the core still checks it). */
export function modelHere(m: Model): boolean {
  try {
    const file = modelFile(m);
    return file.exists && file.size === m.bytes;
  } catch {
    return false;
  }
}

/** The models `from` into `to` needs that are not on this phone yet. */
export function missing(from: Language, to: Language): Model[] {
  return steps(from, to).filter((m) => !modelHere(m));
}

/** Whether any translation model is on this phone. */
export function anyModelHere(): boolean {
  try {
    const dir = folder();
    return dir.exists && dir.list().some((f) => f instanceof File && f.name.endsWith('.gguf'));
  } catch {
    return false;
  }
}

/** Deletes every translation model, and what was downloaded of them. */
export function deleteModels(): void {
  letGoOfModels();
  try {
    const dir = folder();
    if (dir.exists) dir.delete();
  } catch {
    // Gone already.
  }
}

async function downloadOne(m: Model, onProgress: (received: number) => void, signal: AbortSignal): Promise<void> {
  if (modelHere(m)) return;
  const dir = folder();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const part = partFile(m);
  const from = (await loadModelsServer()) + m.file;
  for (let tries = 1; ; tries++) {
    try {
      if (part.exists) part.delete();
      await File.downloadFileAsync(from, part, {
        idempotent: true,
        signal,
        onProgress: ({ bytesWritten }) => onProgress(bytesWritten),
      });
      break;
    } catch (e) {
      if (part.exists) part.delete();
      if (signal.aborted || !stalled(e)) throw e;
      if (tries >= DOWNLOAD_TRIES) throw new Error(t('The download stopped each time it was tried, as the connection brought nothing for a while. Try again later, or on another network.'));
    }
  }
  if (part.size !== m.bytes) {
    part.delete();
    throw new Error(t('The download was cut short.'));
  }
  const whole = modelFile(m);
  if (whole.exists) whole.delete();
  await part.move(whole);
}

/**
 * Downloads the models `list` names, one after another, telling `onProgress` how much of them all
 * has come. A download whose connection brings nothing for a while is tried again from the start.
 * Throws if it is cut short or stopped.
 */
export async function downloadModels(list: Model[], onProgress: (received: number) => void, signal: AbortSignal): Promise<void> {
  let done = 0;
  for (const m of list) {
    await downloadOne(m, (got) => onProgress(done + got), signal);
    done += m.bytes;
  }
}

const utf8 = (text: string) => new TextEncoder().encode(text);

/**
 * `text` translated on this phone from `from` into `to`, through English when neither is. Throws
 * when it cannot be: a model missing, or one that is not the one expected (then it is deleted, to
 * be downloaded again).
 */
export async function translate(text: string, from: Language, to: Language): Promise<string> {
  const core = translateCore();
  if (!core) throw new Error(t('This Erevos cannot translate messages.'));
  let said = text;
  for (const m of steps(from, to)) {
    if (!modelHere(m)) throw new Error(t('The translation model is not on this phone.'));
    const path = decodeURIComponent(modelFile(m).uri.replace(/^file:\/\//, ''));
    try {
      said = new TextDecoder().decode(await core.translateText(utf8(path), utf8(m.from), utf8(m.to), utf8(said))).trim();
    } catch (e) {
      if (String(e).includes('not the one expected')) {
        try {
          modelFile(m).delete();
        } catch {
          // Gone already.
        }
        throw new Error(t('The translation model on this phone is not the one expected, so it was deleted. Download it again.'));
      }
      throw e;
    }
  }
  return said;
}

/** Lets go of the open models and the memory they hold (about 300 MB each), once no more is translated for now. */
export function letGoOfModels(): void {
  void translateCore()?.translateLetGo(new Uint8Array()).catch(() => undefined);
}

/** The name of a language the app translates, in the app's language. */
export function languageName(code: Language): string {
  switch (code) {
    case 'el':
      return t('Greek');
    case 'en':
      return t('English');
    case 'de':
      return t('German');
    case 'es':
      return t('Spanish');
    case 'fr':
      return t('French');
    case 'it':
      return t('Italian');
  }
}
