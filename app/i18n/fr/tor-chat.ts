// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A chat that goes only through Tor (lib/tor-chats.ts, app/chat.tsx) in French (i18n/fr/index.ts).
export const torChatText: Record<string, string> = {
  "This chat goes only through Tor, which this build of Erevos does not have.": "Cette discussion passe uniquement par Tor, que cette version d’Erevos n’a pas.",
  "Messages and files with {name} now go only through Tor. They wait while Tor starts.": "Les messages et fichiers avec {name} passent désormais uniquement par Tor. Ils attendent pendant le démarrage de Tor.",
  "Messages with {name} go as the space’s Tor setting says.": "Les messages avec {name} passent comme le dit le réglage Tor de l’espace.",
  "Through Tor": "Par Tor",
  "This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the server does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.": "Cette discussion passe uniquement par Tor, sur ses propres circuits, quel que soit le réglage Tor de l’espace : le serveur ne voit pas ton adresse pour elle. Plus lent, et elle attend pendant le démarrage de Tor. Les appels ne passent pas par Tor.",
  "This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.": "Cette discussion passe comme le dit le réglage Tor de l’espace. Active pour l’envoyer uniquement par Tor.",
  "This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.": "Cette version d’Erevos n’a pas Tor, donc cette discussion n’envoie rien d’ici tant que cela est activé. Désactive-le ici, ou écris depuis le téléphone.",
};
