// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of more in Nostr chats and public posts: pins for this device, deleting, stickers, polls (i18n/sh/index.ts).
export const nostrMore: Record<string, string> = {
  'They are removed from this phone. Of your own, the others are asked to remove them too: their Nostr apps may or may not do so.':
    'Uklanjaju se s ovog telefona. Za vaše vlastite i od drugih se traži da ih uklone: njihove Nostr aplikacije to mogu, a i ne moraju učiniti.',
  'Your stickers go as photos do, encrypted: other Nostr apps show them as photos.': 'Vaše naljepnice šalju se kao fotografije, šifrirane: druge Nostr aplikacije prikazuju ih kao fotografije.',
  'Open for': 'Traje',
  Vote: 'Glasajte',
  Results: 'Rezultati',
  'Open until {when}': 'Otvorena do {when}',
  'Your vote is public: anyone can see what you chose.': 'Vaš glas je javan: svatko može vidjeti što ste izabrali.',
  '{n} vote': '{n} glas',
  '{n} votes': '{n} glas | {n} glasa | {n} glasova',
  'Through Tor: on': 'Preko Tora: uključeno',
  "What you send here, the look-up of where they read, and the photos and files of this chat go only through Tor, on circuits of their own, whatever the space’s Tor way; never without Tor. What comes to you follows your Nostr account, whose servers are read once for all its chats.":
    'Ono što ovdje šaljete, traženje gdje čitaju i fotografije i datoteke ovog razgovora idu samo preko Tora, na vlastitim krugovima, kakav god da je Tor način prostora; nikad bez Tora. Ono što stiže vama prati vaš Nostr račun, čiji se serveri čitaju jednom za sve njegove razgovore.',
  "Not through Tor now: the Nostr servers see your address.":
    'Trenutno ne preko Tora: Nostr serveri vide vašu adresu.',
  "Not through Tor now: the Nostr servers see your address. Tor for this account is under Settings → Server and networks → Nostr chats.":
    'Trenutno ne preko Tora: Nostr serveri vide vašu adresu. Tor za ovaj račun je pod Postavke → Server i mreže → Nostr razgovori.',
  'A chat can also go through Tor by itself, on circuits of its own: «Through Tor» at its foot. It does, whatever is chosen here.':
    'Razgovor može ići i sam preko Tora, na vlastitim krugovima: «Preko Tora» na dnu razgovora. Tada ide tako, što god ovdje izabrali.',
};
