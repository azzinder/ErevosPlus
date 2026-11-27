// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of hidden chats that receive while they are closed (lock/hidden-keep.ts,
// lib/place-receiver.ts, the toggle at the top of an open place in app/chat.tsx) (i18n/fr/index.ts).
export const hiddenKeep: Record<string, string> = {
  'Receive while closed': 'Recevoir une fois fermées',
  'Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.':
    "Fermées, ces discussions masquées reçoivent comme tes autres discussions : leurs contacts voient aussitôt qu'un message est arrivé, une notification dit seulement « New message », un appel sonne sans nom et se prend avec le code PIN, et un rappel de leur Discussion avec moi-même dit seulement « Rappel ». Pour cela, leur clé est gardée chiffrée avec l'espace, si bien que qui ouvre l'espace et copie ce que garde le téléphone pourrait les ouvrir aussi ; le code PIN les garde toujours hors de vue.",
  'Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the server until you open them.':
    "Fermées, rien ne lit ces discussions masquées : leur clé n'est que derrière le code PIN, et leurs messages attendent sur le serveur jusqu'à ce que tu les ouvres.",
  'Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.':
    'Leurs propres comptes Matrix, XMPP et Nostr restent eux aussi connectés : ce qui y arrive dit seulement « New message », et un appel sonne sans nom.',
  'Their own Matrix, XMPP and Nostr accounts connect only while they are open.':
    'Leurs propres comptes Matrix, XMPP et Nostr ne se connectent que tant que ces discussions masquées sont ouvertes.',
  // What waits in hidden chats, through their relay only (lib/waiting.ts).
  "Waiting. {reason} It goes by itself once the server can take it.": "En attente. {reason} Il partira tout seul dès que le serveur pourra le recevoir.",
  "The voice message waits, and goes by itself once the server can take it.": "Le message vocal attend, et partira tout seul dès que le serveur pourra le recevoir.",
  "Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.":
    "Fermées, ces discussions masquées n’envoient rien : il part tant qu’elles sont ouvertes, sauf si vous activez « Recevoir une fois fermées » en haut.",
};
