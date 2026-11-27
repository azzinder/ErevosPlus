// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of photos, files and voice messages in group chats (i18n/sh/index.ts).
export const groups: Record<string, string> = {
  'A voice message did not come. {error}': 'Glasovna poruka nije stigla. {error}',
  'A file goes as it is, up to 100 MB, with whatever it says inside. The server keeps it, encrypted, 14 days, for each member to take.':
    'Datoteka ide onakva kakva je, do 100 MB, sa svime što je u njoj. Server je čuva, šifriranu, 14 dana, da je svaki član preuzme.',
  'Tap to play': 'Dodirnite za reprodukciju',
  'Tap to open': 'Dodirnite za otvaranje',
  // Who got and who read one of ours (components/group-messages.tsx, components/who-read.tsx); Who read it is in Matrix chats too.
  'Who read it': 'Ko je pročitao',
  'Each member’s phone tells you, end-to-end encrypted. A member whose Erevos is older than these marks tells nothing, and stays under Not yet.':
    'Telefon svakog člana to javlja vama, šifrirano s kraja na kraj. Član čiji je Erevos stariji od ovih oznaka ne javlja ništa i ostaje pod Još ne.',
  'No one else was there when you sent it.': 'Nikoga drugog nije bilo kad ste je poslali.',
  'Read ✓✓✓': 'Pročitali ✓✓✓',
  'Reached their phone ✓✓': 'Stiglo na njihov telefon ✓✓',
  'Not yet': 'Još ne',
  "Public groups stay on the phone: leave them first to move the groups.": "Javne grupe ostaju na telefonu: prvo izađi iz njih da bi premjestio grupe.",
  "The groups are here already.": "Grupe su već ovdje.",
  "The groups are on their way to the other device. Try again in a moment.": "Grupe su na putu do drugog uređaja. Pokušaj ponovo za trenutak.",
  "The groups are too large to move.": "Grupe su prevelike za premještanje.",
};
