// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of texting with no relay, through Nostr, and the relay invites that come by themselves (app/chat.tsx, lib/nostr-chats.ts) (i18n/sh/index.ts).
export const nostrOnly: Record<string, string> = {
  'No Nostr server took it: {reason}': 'Nijedan Nostr server ga nije primio: {reason}',
  'Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. With no server between you, texts, stickers, reactions, photos, files and voice messages go through Nostr; calls need a server or their phone nearby.': 'Kontakt je dodan. Poruke prema njemu su šifrirane s kraja na kraj. Usporedite sigurnosni broj s njegovim. Bez servera između vas, tekstovi, naljepnice, reakcije, fotografije, datoteke i glasovne poruke idu preko Nostra; pozivi trebaju server ili njegov telefon u blizini.',
  '{name} gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': '{name}: dobili ste sami od sebe mjesto na njegovom serveru. Fotografije, glasovne poruke i pozivi sada idu i tamo, sa svima.',
  'A contact gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': 'Jedan kontakt vam je sam od sebe dao mjesto na svom serveru. Fotografije, glasovne poruke i pozivi sada idu i tamo, sa svima.',
  'An invite to a contact’s server came, but it was not taken. {error}': 'Stigla je pozivnica za server jednog kontakta, ali nije prihvaćena. {error}',
  'Sticker sent through Nostr, end-to-end encrypted.': 'Naljepnica je poslana preko Nostra, šifrirana s kraja na kraj.',
  'Photo sent through Nostr, end-to-end encrypted.': 'Fotografija je poslana preko Nostra, šifrirana s kraja na kraj.',
  'File sent through Nostr, end-to-end encrypted.': 'Datoteka je poslana preko Nostra, šifrirana s kraja na kraj.',
  'Photos and files go through Nostr, which cannot be reached.': 'Fotografije i datoteke idu preko Nostra, koji trenutno nije dostupan.',
  'The photo waits, and goes by itself once Nostr can take it.': 'Fotografija čeka i ide sama čim je Nostr bude mogao primiti.',
  'The file waits, and goes by itself once Nostr can take it.': 'Datoteka čeka i ide sama čim je Nostr bude mogao primiti.',
  '{have} of {count} pieces of the photo have come.': 'Stiglo je {have} od {count} dijelova fotografije.',
  'With no server, files can be {size} MB at most.': 'Bez servera datoteke mogu imati najviše {size} MB.',
  'No Nostr server or file server took it: {reason}': 'Nijedan Nostr server ni poslužitelj datoteka je nije primio: {reason}',
};
