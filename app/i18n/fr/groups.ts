// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of photos, files and voice messages in group chats (i18n/fr/index.ts).
export const groups: Record<string, string> = {
  'A voice message did not come. {error}': 'Un message vocal n’est pas arrivé. {error}',
  'A file goes as it is, up to 100 MB, with whatever it says inside. The server keeps it, encrypted, 14 days, for each member to take.':
    'Un fichier part tel quel, jusqu’à 100 Mo, avec tout ce qu’il contient. Le serveur le garde, chiffré, 14 jours, pour que chaque membre le récupère.',
  'Tap to play': 'Appuie pour lire',
  'Tap to open': 'Appuie pour ouvrir',
  // Who got and who read one of ours (components/group-messages.tsx, components/who-read.tsx); Who read it is in Matrix chats too.
  'Who read it': 'Qui l’a lu',
  'Each member’s phone tells you, end-to-end encrypted. A member whose Erevos is older than these marks tells nothing, and stays under Not yet.':
    'Le téléphone de chaque membre te le dit, chiffré de bout en bout. Un membre dont l’Erevos est plus ancien que ces marques ne dit rien, et reste sous Pas encore.',
  'No one else was there when you sent it.': 'Personne d’autre n’était là quand tu l’as envoyé.',
  'Read ✓✓✓': 'Ont lu ✓✓✓',
  'Reached their phone ✓✓': 'Arrivé sur leur téléphone ✓✓',
  'Not yet': 'Pas encore',
  "Public groups stay on the phone: leave them first to move the groups.": "Les groupes publics restent sur le téléphone : quitte-les d’abord pour déplacer les groupes.",
  "The groups are here already.": "Les groupes sont déjà ici.",
  "The groups are on their way to the other device. Try again in a moment.": "Les groupes sont en route vers l’autre appareil. Réessaie dans un instant.",
  "The groups are too large to move.": "Les groupes sont trop volumineux pour être déplacés.",
};
