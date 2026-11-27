// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of photos, files and voice messages in group chats (i18n/de/index.ts).
export const groups: Record<string, string> = {
  'A voice message did not come. {error}': 'Eine Sprachnachricht ist nicht angekommen. {error}',
  'A file goes as it is, up to 100 MB, with whatever it says inside. The server keeps it, encrypted, 14 days, for each member to take.':
    'Eine Datei geht, wie sie ist, bis 100 MB, mit allem, was darin steht. Der Server hebt sie verschlüsselt 14 Tage auf, damit jedes Mitglied sie abholen kann.',
  'Tap to play': 'Tippen zum Abspielen',
  'Tap to open': 'Tippen zum Öffnen',
  // Who got and who read one of ours (components/group-messages.tsx, components/who-read.tsx); Who read it is in Matrix chats too.
  'Who read it': 'Wer hat es gelesen',
  'Each member’s phone tells you, end-to-end encrypted. A member whose Erevos is older than these marks tells nothing, and stays under Not yet.':
    'Das Telefon jedes Mitglieds sagt es dir, Ende-zu-Ende-verschlüsselt. Ein Mitglied, dessen Erevos älter ist als diese Markierungen, sagt nichts und bleibt unter Noch nicht.',
  'No one else was there when you sent it.': 'Als du die Nachricht gesendet hast, war sonst niemand da.',
  'Read ✓✓✓': 'Gelesen ✓✓✓',
  'Reached their phone ✓✓': 'Auf ihrem Telefon angekommen ✓✓',
  'Not yet': 'Noch nicht',
  "Public groups stay on the phone: leave them first to move the groups.": "Öffentliche Gruppen bleiben auf dem Telefon: Verlass sie zuerst, um die Gruppen umzuziehen.",
  "The groups are here already.": "Die Gruppen sind schon hier.",
  "The groups are on their way to the other device. Try again in a moment.": "Die Gruppen sind auf dem Weg zum anderen Gerät. Versuch es gleich noch einmal.",
  "The groups are too large to move.": "Die Gruppen sind zu groß zum Verschieben.",
};
