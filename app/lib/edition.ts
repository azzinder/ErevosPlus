// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { Module } from './modules';
import { KEEPS_EREVOS, KEEPS_SOME } from './edition-keeps';

// The edition this build is (docs/editions.md), from the same code: Erevos+ (`plus`, the default)
// has every module; the plain Erevos (`erevos`, built with EREVOS_EDITION=erevos, app.config.js) has
// only Erevos's own chats, the Phone, the SMS and the Collection, and its core has no other
// network in it; Erevos Lite (`lite`, EREVOS_EDITION=lite) has Erevos's own chats and calls alone,
// with no Phone, SMS, Collection or camera, and none of their code or permissions in its app. Each is
// an app of its own (app.erevos, app.erevos.plus, app.erevos.lite): moving from one to another hands
// everything over (lib/edition-move.ts), and the chats of a module the edition has not stay kept, and
// are there again in an edition that has it.

export type Edition = 'plus' | 'erevos' | 'lite';

/** The modules of the plain Erevos. */
export const EREVOS_MODULES: readonly Module[] = ['erevos', 'phone', 'sms', 'collection'];

/** The modules of Erevos Lite: Erevos's own chats and calls, nothing else. */
export const LITE_MODULES: readonly Module[] = ['erevos'];

/** The edition of this build: `extra.edition` in app.config.js ('erevos' or 'lite'), else Erevos+.
 *  Expo is asked only when it is there, so the checks, in plain Node, can load this file. */
function read(): Edition {
  try {
    const constants = (require('expo-constants') as typeof import('expo-constants')).default;
    const given = constants.expoConfig?.extra?.edition;
    return given === 'erevos' || given === 'lite' ? given : 'plus';
  } catch {
    return 'plus';
  }
}

export const EDITION: Edition = read();

/** Whether this build is Erevos+'s bridge (EREVOS_BRIDGE, app.config.js `extra.bridge`): Erevos+ as
 *  app.erevos under a 7.x name, which the Erevos+ 7.x apps take as an update and which then moves to
 *  app.erevos.plus (lib/edition-move.ts). */
function readBridge(): boolean {
  try {
    const constants = (require('expo-constants') as typeof import('expo-constants')).default;
    return constants.expoConfig?.extra?.bridge === true;
  } catch {
    return false;
  }
}

export const BRIDGE: boolean = readBridge();

/** Whether `edition` is one without the other networks, the plain Erevos or Erevos Lite. */
export function withoutNetworks(edition: Edition = EDITION): boolean {
  return edition !== 'plus';
}

/** Whether `module` is part of `edition`. */
export function inEdition(module: Module, edition: Edition = EDITION): boolean {
  return edition === 'plus' || (edition === 'lite' ? LITE_MODULES : EREVOS_MODULES).includes(module);
}

/** The app's name in `edition`. */
export function editionName(edition: Edition = EDITION): string {
  return edition === 'plus' ? 'Erevos+' : edition === 'lite' ? 'Erevos Lite' : 'Erevos';
}

/** `text` (already in the app's language) with the app's name as `edition` has it: in Erevos+ each
 *  «Erevos» is «Erevos+», in Erevos Lite «Erevos Lite», so the same words serve both editions in every language. A word that names
 *  more than the app is left: ErevosGram, a path or address (azzinder/Erevos, Erevos.apk). */
export function named(text: string, edition: Edition = EDITION): string {
  return edition === 'erevos' ? text : text.replace(/(?<![\w/.-])Erevos(?![\w+/-])(?!\.\w)(?! Lite\b)/g, editionName(edition));
}

/** Whether `t` gives the edition's own name (lib/i18n.ts): always in the app; the checks read the
 *  words as Erevos has them (checks/register.mjs), and edition.check.ts turns this on to check it. */
export function ownNames(): boolean {
  return (globalThis as { __EREVOS_PLAIN_NAMES__?: boolean }).__EREVOS_PLAIN_NAMES__ !== true;
}

/** Whether a text speaks of the two editions apart (it names Erevos+ already: «the next update is the
 *  plain Erevos»), says whose Erevos is (the licence's «Erevos, by azzinder»), or speaks of the other
 *  person's Erevos or of what both editions share (lib/edition-keeps.ts): then it stays as written. */
export function namesEditions(text: string): boolean {
  return text.includes('Erevos+') || text.includes('Erevos Lite') || text.includes('azzinder') || KEEPS_EREVOS.has(text);
}

/** The app's words for `key` (its English), `words` in the language shown, as `edition` says them:
 *  in Erevos+ and Erevos Lite each «Erevos» says the edition's name (named), unless the text speaks of
 *  the editions apart (namesEditions); in a text that speaks both of this app and of the other person's
 *  (lib/edition-keeps.ts KEEPS_SOME) only this app's «Erevos» does, and where the translation has
 *  another count of them each stays as written. */
export function namedFor(key: string, words: string, edition: Edition = EDITION): string {
  if (edition === 'erevos' || namesEditions(key)) return words;
  const keep = KEEPS_SOME.get(key);
  if (!keep) return named(words, edition);
  const name = /(?<![\w/.-])Erevos(?![\w+/-])(?!\.\w)(?! Lite\b)/g;
  if ((words.match(name)?.length ?? 0) !== keep.length) return words;
  let at = 0;
  return words.replace(name, (found) => (keep[at++] ? found : editionName(edition)));
}

/** `text` as Erevos+ or Erevos Lite says it (named), unless it speaks of the two editions apart (namesEditions). */
export function asEdition(text: string, edition: Edition = EDITION): string {
  return edition !== 'erevos' && !namesEditions(text) ? named(text, edition) : text;
}

/** A guide's text as `edition` says it: in Erevos+ and Erevos Lite each paragraph, list item, table row
 *  or heading with the app's name, unless it speaks of the editions apart (asEdition), on any of its
 *  lines, and but each «Erevos» marked {=Erevos}, which stays as written. */
export function guideNamed(source: string, edition: Edition = EDITION): string {
  if (edition === 'erevos') return unmarkKept(source);
  const blocks: string[][] = [];
  for (const line of source.split('\n')) {
    const starts = line.trim() === '' || /^\s*(- |\| |#|> |\d+\. )/.test(line) || blocks.length === 0 || blocks[blocks.length - 1][0].trim() === '';
    if (starts) blocks.push([line]);
    else blocks[blocks.length - 1].push(line);
  }
  // «{=Erevos}» is an Erevos the guide keeps as written: the other person's, or what both editions share.
  return blocks.map((block) => asEdition(block.join('\n'), edition).replace(/\{=Erevos(?:\+| Lite)?\}/g, '{=Erevos}')).map(unmarkKept).join('\n');
}

/** The guide's text without its marks of an «Erevos» kept as written ({=Erevos}). */
export function unmarkKept(source: string): string {
  return source.replace(/\{=([^{}]*)\}/g, '$1');
}
