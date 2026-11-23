// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useSyncExternalStore } from 'react';

import { DE } from '../i18n/de/index';
import { EL } from '../i18n/el/index';
import { ES } from '../i18n/es/index';
import { FR } from '../i18n/fr/index';
import { IT } from '../i18n/it/index';
import { PT } from '../i18n/pt/index';
import { SH } from '../i18n/sh/index';
import { EDITION, namedFor, ownNames, type Edition } from './edition';

// The kept choice is read and written through lib/secure, which itself shows words through t() (lib/shell,
// lib/web-store): it is taken when first needed, not at load, so neither waits on the other half made.
const secure = () => import('./secure');

/**
 * The app's language, for the whole app on every platform: English, Greek or another of LANGS.
 * The words are written in English in the code, inside t('…'), and i18n/el/ has each in Greek,
 * i18n/de/ in German and so on, keyed by the English. Greek has every one (checks/i18n.check.ts
 * makes sure none is missing); a word another language does not have yet shows in English, and
 * `npm run i18n-missing` lists them. The guide (guide/) is in each of LANGS too. The first start follows the phone's language, if it is one of
 * these; the choice (Home → Menu → Settings → Language) is kept on the phone, outside every space, so the
 * password screen shows it too.
 */
export type Lang = 'en' | 'el' | 'de' | 'es' | 'fr' | 'it' | 'pt' | 'sh';

/** As the language switch lists them: the two the guide is written in first, then the others. */
export const LANGS: Lang[] = ['el', 'en', 'de', 'es', 'fr', 'it', 'pt', 'sh'];
/** Each language by its own name. */
export const LANG_LABELS: Record<Lang, string> = {
  el: 'Ελληνικά',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  sh: 'Srpskohrvatski',
};

const WORDS: Record<Exclude<Lang, 'en'>, Record<string, string>> = { el: EL, de: DE, es: ES, fr: FR, it: IT, pt: PT, sh: SH };

// How each writes dates and times, when the phone's own is another language. Portuguese is
// Brazilian, as its words are. Serbo-Croatian writes them as Bosnian does: in Latin letters,
// ijekavian as its words are (srijeda), the months named as in Bosnia, Montenegro and Serbia
// (oktobar).
const LOCALES: Record<Exclude<Lang, 'en'>, string> = { el: 'el-GR', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-BR', sh: 'bs-BA' };

// Phones in Serbian, Croatian, Bosnian or Montenegrin start in Serbo-Croatian.
const SAME_LANG = new Map<string, Lang>([
  ['sr', 'sh'],
  ['hr', 'sh'],
  ['bs', 'sh'],
  ['cnr', 'sh'],
]);

// Which counts take a word's first form, as plural() is given it: 1 alone, unless the language
// counts otherwise here. French and Brazilian Portuguese say 0 and 1 alike ("0 message").
const zeroAndOne = (n: number) => Math.abs(n) < 2;
const ONE: Partial<Record<Lang, (n: number) => boolean>> = { fr: zeroAndOne, pt: zeroAndOne };

// Languages whose words for a count have three forms, by how the count ends: Serbo-Croatian says
// 21 kontakt, 22 kontakta, 25 kontakata, and 11 to 14 as 25. There 1 alone takes plural()'s first
// form, and the words for its second form hold the three for every other count, split by ' | ':
// '{n} contacts': '{n} kontakt | {n} kontakta | {n} kontakata', for 21, 31…, for 2 to 4, 22 to
// 24…, and for the rest. Each gives the form a count takes there: 0, 1 or 2.
const FORMS: Partial<Record<Lang, (n: number) => number>> = {
  sh: (n) => {
    const ten = n % 10;
    const hundred = n % 100;
    if (ten === 1 && hundred !== 11) return 0;
    return ten >= 2 && ten <= 4 && (hundred < 12 || hundred > 14) ? 1 : 2;
  },
};
/** How the forms are split in the words of plural()'s second form. */
export const FORM_SPLIT = ' | ';

/** How many forms the words of plural()'s second form hold in `l`: 1, or 3 (FORMS above). */
export function formsOf(l: Lang): number {
  return FORMS[l] ? 3 : 1;
}

const KEY = 'erevos.lang';

/** The language of a locale such as 'de-AT' or 'hr-HR', if Erevos has it; English otherwise. */
export function langOf(locale: string): Lang {
  const code = locale.toLowerCase().split(/[-_]/)[0];
  const same = SAME_LANG.get(code) ?? code;
  return (LANGS as string[]).includes(same) ? (same as Lang) : 'en';
}

/**
 * Whether dates are written in the phone's own locale: one of the app's language, and for
 * Serbo-Croatian, in Latin letters too. A Serbian phone writes in Cyrillic unless it says Latn
 * (sr-Latn-RS), and Croatian and Bosnian ones in Latin unless they say Cyrl. A Montenegrin or
 * Serbo-Croatian one (cnr, sh) is not known everywhere, so it takes LOCALES' instead.
 */
export function phoneWrites(phone: string, l: Lang): boolean {
  if (langOf(phone) !== l) return false;
  if (l !== 'sh') return true;
  const tag = phone.toLowerCase().replace(/_/g, '-');
  return /^(hr|bs)(-|$)/.test(tag) ? !/-cyrl(-|$)/.test(tag) : /^sr-latn(-|$)/.test(tag);
}

function phoneLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return null;
  }
}

/** The phone's language, if Erevos has it; English otherwise. */
export function deviceLang(): Lang {
  const locale = phoneLocale();
  return locale ? langOf(locale) : 'en';
}

let current: Lang = deviceLang();
const listeners = new Set<() => void>();

export function lang(): Lang {
  return current;
}

/** Shows the app in `next` at once, and keeps the choice. */
export async function setLang(next: Lang): Promise<void> {
  if (next !== current) {
    current = next;
    for (const listener of listeners) listener();
  }
  await secure()
    .then(({ secureSet }) => secureSet(KEY, next))
    .catch(() => undefined);
}

/** Reads the kept choice, once at start, before the first screen. */
export async function loadLang(): Promise<Lang> {
  try {
    const kept = await (await secure()).secureGet(KEY);
    if (kept && (LANGS as string[]).includes(kept)) {
      if (kept !== current) {
        current = kept as Lang;
        for (const listener of listeners) listener();
      }
    }
  } catch {
    // The phone's language, then.
  }
  return current;
}

/** Reads the choice again, as a restored backup put it (lib/backup-settings.ts): the phone's
 *  language when it holds none. */
export async function reloadLang(): Promise<Lang> {
  const kept = await secure()
    .then(({ secureGet }) => secureGet(KEY))
    .catch(() => null);
  const next = kept && (LANGS as string[]).includes(kept) ? (kept as Lang) : deviceLang();
  if (next !== current) {
    current = next;
    for (const listener of listeners) listener();
  }
  return current;
}

export function onLangChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The language, for a screen that shows words: it draws again when the language changes. */
export function useLang(): Lang {
  return useSyncExternalStore(onLangChange, lang, lang);
}

/** The words of `l` by their English, for the checks; none for English itself. */
export function words(l: Lang): Record<string, string> {
  return l === 'en' ? {} : WORDS[l];
}

/**
 * The locale dates and times are written in, for toLocaleString: the phone's own in English, or
 * when the phone is in the app's language (so de-AT stays Austrian, and hr-HR Croatian), else
 * the language's own.
 */
export function locale(): string | undefined {
  if (current === 'en') return undefined;
  const phone = phoneLocale();
  return phone && phoneWrites(phone, current) ? phone : LOCALES[current];
}

/**
 * `text` in the app's language. `text` is the English, written out in the call so the check finds
 * it; {name} in it is replaced by vars.name, in every language. A word the language does not have
 * yet shows in English.
 */
export function t(text: string, vars?: Record<string, string | number>): string {
  return tFor(EDITION, text, vars);
}

/** `t`, with the name of `edition`'s app: Erevos+ says its own name wherever the words say Erevos
 *  (lib/edition.ts), unless they speak of the two editions apart, as the English says: the translation
 *  follows it. A text about a release of the plain Erevos, in Erevos+, asks for 'erevos'. */
export function tFor(edition: Edition, text: string, vars?: Record<string, string | number>): string {
  const words = current === 'en' ? text : (WORDS[current][text] ?? text);
  const shown = ownNames() ? namedFor(text, words, edition) : words;
  return vars ? fill(shown, vars) : shown;
}

/** Marks English kept in a constant and translated where it is shown, with t(value). */
export function mark<T extends string>(text: T): T {
  return text;
}

/**
 * The count's form of a word: plural(n, '{n} chat', '{n} chats'), both forms written for the
 * check. The language decides which counts take the first (ONE above); each language then has
 * its own words for both forms. In a language of three forms (FORMS above) the second form's
 * words hold the three, and every count but 1 takes the one it counts with.
 */
export function plural(n: number, one: string, many: string, vars?: Record<string, string | number>): string {
  const all = { n, ...vars };
  const form = FORMS[current];
  if (form && n !== 1) {
    // English, until the language has the words: one form, for every count.
    const forms = (words(current)[many] ?? many).split(FORM_SPLIT);
    const chosen = forms[Math.min(form(Math.abs(n)), forms.length - 1)];
    return fill(ownNames() ? namedFor(many, chosen) : chosen, all);
  }
  const first = ONE[current] ?? ((count: number) => count === 1);
  return t(first(n) ? one : many, all);
}

function fill(text: string, vars: Record<string, string | number>): string {
  // A value that ends in a period of its own, as a Greek time's «μ.μ.», ends the sentence with it.
  return text.replace(/\{(\w+)\}(\.?)/g, (all, name: string, stop: string) => {
    if (!(name in vars)) return all;
    const value = String(vars[name]);
    return stop && value.endsWith('.') ? value : value + stop;
  });
}
