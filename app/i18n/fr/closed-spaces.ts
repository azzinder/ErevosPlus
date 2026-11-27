// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of a closed space that says a message came while another is open (app/security.tsx,
// lib/closed-notices.ts), and of a message that came or went through Nostr (app/chat.tsx) (i18n/fr/index.ts).
export const closedSpaces: Record<string, string> = {
  'Went through Nostr.': 'Envoyé par Nostr.',
  'Came through Nostr.': 'Arrivé par Nostr.',
  'Went through the server.': 'Envoyé par le serveur.',
  'Came through the server.': 'Arrivé par le serveur.',
  'Went to their phone nearby.': 'Envoyé à son téléphone proche.',
  'Came from a phone nearby.': 'Arrivé d\'un téléphone proche.',
  'Went over LoRa.': 'Envoyé par LoRa.',
  'Went to the phones nearby, which carry it to their server.': 'Envoyé aux téléphones proches, qui le portent à son serveur.',
  'Went to the phones nearby, in case theirs is one of them.': 'Envoyé aux téléphones proches, au cas où le sien en serait un.',
  '{what} through Nostr, end-to-end encrypted.': '{what} par Nostr, chiffré de bout en bout.',
  'Took the last text {seconds} s after it was sent, at {time}.': 'A pris le dernier texte {seconds} s après l’envoi, à {time}.',
  'Did not take the last text, at {time}. {why}': 'N’a pas pris le dernier texte, à {time}. {why}',
  'No text given to it since Erevos started.': 'Aucun texte ne lui a été donné depuis le démarrage d’Erevos.',
  'Read on since {time}.': 'Lu depuis {time}.',
  'Could not be read on, at {time}. {why}': 'N’a pas pu être lu, à {time}. {why}',
  'Not read on yet.': 'Pas encore lu.',
  'What the servers did last': 'Ce que les serveurs ont fait en dernier',
  'Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts\' servers show here too once a text went to them.': 'Depuis le démarrage d’Erevos, sur ce téléphone seulement et tant qu’il tourne : si chaque serveur a pris le dernier texte qu’il a reçu, et s’il est lu. Les serveurs de tes contacts s’affichent aussi ici dès qu’un texte leur est allé.',
  'It did not say it took it within {seconds} seconds.': 'Il n’a pas dit l’avoir pris en {seconds} secondes.',
  'It refused it: "{reason}"': 'Il l’a refusé : « {reason} »',
  'It refused it.': 'Il l’a refusé.',
  'Not reached: {reason}': 'Pas joint : {reason}',
  'This space only while open': 'Cet espace seulement quand il est ouvert',
  'Also while another space is open': 'Aussi quand un autre espace est ouvert',
  'While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its server outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its server may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.': 'Quand un autre espace est ouvert, celui-ci dit seulement « New message », comme celui-là, jamais quel espace ; ses discussions masquées ne disent rien alors. Pour cela le téléphone garde les adresses de ses files sur son serveur hors de son mot de passe, dont celle où écrit chacun de ses contacts, jusqu’à 64 contacts, jamais ses clés, ni qui sont ses contacts, ni ses messages, et son serveur peut savoir que les deux espaces sont sur un même téléphone. Si cet espace passe par Tor (Messages ou Tout), il n’est interrogé que par Tor : tant que l’espace ouvert a Tor désactivé, ou que son Tor démarre ou vient d’échouer, celui-ci ne dit rien, et ce qui est arrivé est signalé dès que Tor y est prêt.',
  'Closed, this space receives nothing: its messages wait at its server and come when it opens.': 'Fermé, cet espace ne reçoit rien : ses messages attendent sur son serveur et arrivent quand il s’ouvre.',
  'This space has no queue at a server yet: it can say nothing while closed.': 'Cet espace n’a pas encore de file sur un serveur : fermé, il ne peut rien dire.',
  'Tor is not ready.': 'Tor n’est pas prêt.',
};
