// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of "last seen" (lib/last-seen.ts): the chat's header and details (app/chat.tsx), and its
// part of Settings → Privacy and security (app/security.tsx, lib/settings.ts) (i18n/fr/index.ts).
export const lastSeen: Record<string, string> = {
  'last seen today at {time}': 'vu pour la dernière fois aujourd’hui à {time}',
  'last seen yesterday at {time}': 'vu pour la dernière fois hier à {time}',
  'last seen {date} at {time}': 'vu pour la dernière fois le {date} à {time}',
  'Last seen': 'Vu pour la dernière fois',
  'Who sees when you last had Erevos open: off in a new space, until you turn it on':
    'Qui voit quand tu as eu Erevos ouvert pour la dernière fois : désactivé dans un nouvel espace, jusqu’à ce que tu l’actives',
  'Your contacts see the exact time you last had Erevos open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. In all chats of this space; hidden chats have their own switch.':
    'Tes contacts voient l’heure exacte à laquelle tu as eu Erevos ouvert pour la dernière fois, et tu vois la leur. Elle part chiffrée de bout en bout vers eux seuls, jamais vers le serveur. Dans toutes les discussions de cet espace ; les discussions masquées ont leur propre interrupteur.',
  'Your contacts here see the exact time you last had these hidden chats open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. Only in these hidden chats, with a time of their own: the space’s chats have their own switch.':
    'Tes contacts d’ici voient l’heure exacte à laquelle tu as eu ces discussions masquées ouvertes, et tu vois la leur. Elle part chiffrée de bout en bout vers eux seuls, jamais vers le serveur. Seulement dans ces discussions masquées, avec une heure à part : les discussions de l’espace ont leur propre interrupteur.',
  'No one here sees when you last had these hidden chats open, and you see no one’s here either. Those who saw it lose it with your next message.':
    'Personne ici ne voit quand tu as eu ces discussions masquées ouvertes, et tu ne vois celle de personne ici. Ceux qui la voyaient la perdent avec ton message suivant.',
  'No one sees when you last had Erevos open, and you see no one’s either. Those who saw it lose it with your next message.':
    'Personne ne voit quand tu as eu Erevos ouvert pour la dernière fois, et tu ne vois celle de personne. Ceux qui la voyaient la perdent avec ton message suivant.',
  'On: your contacts see the exact time you last had Erevos open, and you see theirs.':
    'Activé : tes contacts voient l’heure exacte à laquelle tu as eu Erevos ouvert pour la dernière fois, et tu vois la leur.',
  'Off: no one sees when you last had Erevos open, and you see no one’s either.':
    'Désactivé : personne ne voit quand tu as eu Erevos ouvert pour la dernière fois, et tu ne vois celle de personne.',
  'It goes end-to-end encrypted, inside what goes to your contacts anyway, never to the server. Only for the chats of this space: hidden chats have their own switch, in a chat’s details there. Whether you are online now has its own switch in each chat: Appear offline.':
    'Elle part chiffrée de bout en bout, à l’intérieur de ce qui part de toute façon vers tes contacts, jamais vers le serveur. Seulement pour les discussions de cet espace : les discussions masquées ont leur propre interrupteur, dans les détails d’une discussion de là-bas. Savoir si tu es en ligne maintenant a son propre interrupteur dans chaque discussion : Apparaître hors ligne.',
  // Matrix and XMPP contacts online, as their servers say (lib/net-presence.ts), and our own on Matrix (components/say-typing.tsx).
  "Away":
    "Absent",
  "Do not disturb":
    "Ne pas déranger",
  "Say when I am online":
    "Dire quand je suis en ligne",
  "The others see when you are online, and when you last were. It goes through the {server} server not encrypted, so the server learns it too.":
    "Les autres voient quand tu es en ligne, et quand tu l’étais pour la dernière fois. Cela passe par le serveur {server} sans chiffrement, donc le serveur l’apprend aussi.",
  "The others do not see when you are online. You still see it of those whose server says it.":
    "Les autres ne voient pas quand tu es en ligne. Tu le vois toujours pour ceux dont le serveur le dit.",
  "Say when I open and close Erevos":
    "Dire quand j’ouvre et ferme Erevos",
  "As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The server sees that something goes to them then, so it can tell when you open and close Erevos.":
    "Dès qu’Erevos s’ouvre, les contacts avec qui tu as parlé ces 30 derniers jours, et qui montrent aussi leur propre heure, l’apprennent aussitôt, chacun après une attente aléatoire d’au plus une minute, au plus toutes les 15 minutes. Quand il se ferme, ceux qui ont été prévenus pendant qu’il était ouvert apprennent quand il s’est fermé. Le serveur voit que quelque chose leur part à ce moment, il peut donc savoir quand tu ouvres et fermes Erevos.",
  "Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The server learns nothing new.":
    "Ton heure ne part qu’avec ce qui part de toute façon vers tes contacts : un message, une marque que les leurs sont arrivés ou ont été lus, ou une réponse pendant qu’ils ont votre discussion ouverte. Le serveur n’apprend rien de nouveau.",
};
