// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of texting with no relay, through Nostr, and the relay invites that come by themselves (app/chat.tsx, lib/nostr-chats.ts) (i18n/fr/index.ts).
export const nostrOnly: Record<string, string> = {
  'No Nostr server took it: {reason}': 'Aucun serveur Nostr ne l’a pris : {reason}',
  'Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. With no server between you, texts, stickers, reactions, photos, files and voice messages go through Nostr; calls need a server or their phone nearby.': 'Contact ajouté. Les messages qui lui sont envoyés sont chiffrés de bout en bout. Compare le numéro de sécurité avec le sien. Sans serveur entre vous, les textes, autocollants, réactions, photos, fichiers et messages vocaux passent par Nostr ; les appels demandent un serveur ou son téléphone à proximité.',
  '{name} gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': '{name} t’a donné de lui-même une place sur son serveur. Les photos, messages vocaux et appels passent maintenant aussi par là, avec tout le monde.',
  'A contact gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': 'Un contact t’a donné de lui-même une place sur son serveur. Les photos, messages vocaux et appels passent maintenant aussi par là, avec tout le monde.',
  'An invite to a contact’s server came, but it was not taken. {error}': 'Une invitation au serveur d’un contact est arrivée, mais elle n’a pas été prise. {error}',
  'Sticker sent through Nostr, end-to-end encrypted.': 'Autocollant envoyé par Nostr, chiffré de bout en bout.',
  'Photo sent through Nostr, end-to-end encrypted.': 'Photo envoyée par Nostr, chiffrée de bout en bout.',
  'File sent through Nostr, end-to-end encrypted.': 'Fichier envoyé par Nostr, chiffré de bout en bout.',
  'Photos and files go through Nostr, which cannot be reached.': 'Les photos et les fichiers passent par Nostr, qui est injoignable pour le moment.',
  'The photo waits, and goes by itself once Nostr can take it.': 'La photo attend et part toute seule dès que Nostr pourra la prendre.',
  'The file waits, and goes by itself once Nostr can take it.': 'Le fichier attend et part tout seul dès que Nostr pourra le prendre.',
  '{have} of {count} pieces of the photo have come.': '{have} morceaux de la photo sur {count} sont arrivés.',
  'With no server, files can be {size} MB at most.': 'Sans serveur, les fichiers peuvent faire {size} Mo au plus.',
  'No Nostr server or file server took it: {reason}': 'Aucun serveur Nostr ni serveur de fichiers ne l’a pris : {reason}',
};
