// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { EDITION, guideNamed, ownNames, unmarkKept, type Edition } from '../lib/edition';
import { editionSource, parseGuide, type GuideSection } from '../lib/guide';
import { lang, type Lang } from '../lib/i18n';

import { guide as de } from './de';
import { guide as el } from './el';
import { guide as en } from './en';
import { guide as es } from './es';
import { guide as fr } from './fr';
import { guide as it } from './it';
import { guide as pt } from './pt';
import { guide as sh } from './sh';

/**
 * The user guide (Home → User guide), as in LPHL FASOULI: the same for everyone, in every language
 * of the app. Keep it up to date with every visible change, like the README, in all of them, and
 * keep saying plainly what Erevos does not protect yet.
 */
export type GuideLang = Lang;

export const GUIDE_LANGS: GuideLang[] = ['el', 'en', 'de', 'es', 'fr', 'it', 'pt', 'sh'];

export const GUIDE_SOURCES: Record<GuideLang, string> = { de, el, en, es, fr, it, pt, sh };

/** The guide's own words around the sections. */
export const GUIDE_UI: Record<GuideLang, {
  title: string;
  search: string;
  noResults: (query: string) => string;
  sections: string;
  previous: string;
  next: string;
  missing: string;
  version: (version: string) => string;
  update: string;
}> = {
  el: {
    title: 'Οδηγός χρήσης',
    search: 'Αναζήτηση στον οδηγό',
    noResults: (query) => `Δεν βρέθηκε τίποτα για «${query}».`,
    sections: 'Ενότητες',
    previous: 'Προηγούμενη',
    next: 'Επόμενη',
    missing: 'Αυτό το κομμάτι του οδηγού δεν βρέθηκε.',
    version: (version) => `Erevos ${version}, δοκιμαστική έκδοση`,
    update: 'Έλεγχος για ενημέρωση',
  },
  en: {
    title: 'User guide',
    search: 'Search the guide',
    noResults: (query) => `Nothing found for “${query}”.`,
    sections: 'Sections',
    previous: 'Previous',
    next: 'Next',
    missing: 'This part of the guide was not found.',
    version: (version) => `Erevos ${version}, test version`,
    update: 'Check for updates',
  },
  de: {
    title: 'Anleitung',
    search: 'In der Anleitung suchen',
    noResults: (query) => `Nichts gefunden für „${query}“.`,
    sections: 'Abschnitte',
    previous: 'Vorheriger',
    next: 'Nächster',
    missing: 'Dieser Teil der Anleitung wurde nicht gefunden.',
    version: (version) => `Erevos ${version}, Testversion`,
    update: 'Nach Updates suchen',
  },
  es: {
    title: 'Guía de uso',
    search: 'Buscar en la guía',
    noResults: (query) => `No se encontró nada para «${query}».`,
    sections: 'Secciones',
    previous: 'Anterior',
    next: 'Siguiente',
    missing: 'No se encontró esta parte de la guía.',
    version: (version) => `Erevos ${version}, versión de prueba`,
    update: 'Buscar actualizaciones',
  },
  fr: {
    title: 'Guide d’utilisation',
    search: 'Rechercher dans le guide',
    noResults: (query) => `Rien trouvé pour « ${query} ».`,
    sections: 'Sections',
    previous: 'Précédente',
    next: 'Suivante',
    missing: 'Cette partie du guide est introuvable.',
    version: (version) => `Erevos ${version}, version de test`,
    update: 'Rechercher des mises à jour',
  },
  it: {
    title: 'Guida',
    search: 'Cerca nella guida',
    noResults: (query) => `Nessun risultato per «${query}».`,
    sections: 'Sezioni',
    previous: 'Precedente',
    next: 'Successiva',
    missing: 'Questa parte della guida non è stata trovata.',
    version: (version) => `Erevos ${version}, versione di prova`,
    update: 'Cerca aggiornamenti',
  },
  pt: {
    title: 'Guia de uso',
    search: 'Buscar no guia',
    noResults: (query) => `Nada encontrado para “${query}”.`,
    sections: 'Seções',
    previous: 'Anterior',
    next: 'Próxima',
    missing: 'Esta parte do guia não foi encontrada.',
    version: (version) => `Erevos ${version}, versão de teste`,
    update: 'Procurar atualizações',
  },
  sh: {
    title: 'Korisnički vodič',
    search: 'Pretraži vodič',
    noResults: (query) => `Ništa nije pronađeno za „${query}“.`,
    sections: 'Odjeljci',
    previous: 'Prethodni',
    next: 'Sljedeći',
    missing: 'Ovaj dio vodiča nije pronađen.',
    version: (version) => `Erevos ${version}, probna verzija`,
    update: 'Provjeri ažuriranja',
  },
};

const parsed = new Map<string, GuideSection[]>();

/** The sections of networks only Erevos+ has (lib/edition.ts): the plain Erevos leaves them out. */
export const PLUS_SECTIONS: readonly string[] = ['matrix', 'xmpp', 'nostr-chats', 'telegram', 'messenger', 'signal', 'session'];

export function guideFor(lang: GuideLang, edition: Edition = EDITION): GuideSection[] {
  const key = `${lang} ${edition}`;
  let sections = parsed.get(key);
  if (!sections) {
    const source = editionSource(GUIDE_SOURCES[lang], edition);
    sections = parseGuide(ownNames() ? guideNamed(source, edition) : unmarkKept(source));
    parsed.set(key, sections);
  }
  return edition === 'lite' ? sections.filter((section) => !PLUS_SECTIONS.includes(section.id)) : sections;
}

/** The guide shows in the app's language (lib/i18n.ts). */
export function guideLang(): GuideLang {
  return lang();
}
