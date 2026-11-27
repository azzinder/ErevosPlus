// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of encrypted messages by SMS when nothing else works (lib/sms-way.ts, app/sms-settings.tsx, app/chat.tsx) (i18n/fr/index.ts).
export const smsWay: Record<string, string> = {
  "Went by SMS, end-to-end encrypted.": "Envoyé par SMS, chiffré de bout en bout.",
  "Came by SMS, end-to-end encrypted.": "Arrivé par SMS, chiffré de bout en bout.",
  "{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.": "{what} par SMS, chiffré de bout en bout, car rien d’autre ne pouvait le prendre. L’opérateur voit que tu as écrit au numéro de {name}, et quand, comme pour tout SMS.",
  "It went without the link’s preview, which is too much for SMS.": "Il est parti sans l’aperçu du lien, trop lourd pour un SMS.",
  "It is too long for SMS.": "Il est trop long pour un SMS.",
  "SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.": "Les SMS sont activés pour chaque contact avec un numéro. Désactive-les dans « Réglages → Téléphone et SMS → SMS ».",
  "SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.": "Les SMS peuvent être activés un par un pour {n} contacts au plus. Active-les pour tous dans « Réglages → Téléphone et SMS → SMS ».",
  "When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.": "Quand rien d’autre ne peut prendre un texte pour {name}, il part par SMS, chiffré de bout en bout. Chaque SMS coûte ce que dit ton forfait, et l’opérateur voit que tu as écrit à son numéro, et quand.",
  "Messages to {name} no longer go by SMS.": "Les messages à {name} ne passent plus par SMS.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the server, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.": "Les textes partent par SMS vers son numéro, chiffrés de bout en bout, seulement quand le serveur, Nostr, les téléphones à proximité et LoRa échouent tous. Chacun coûte des SMS, et l’opérateur voit qui a écrit à qui, et quand. Les deux téléphones ont besoin d’Erevos comme app SMS.",
  "SMS when nothing else works": "SMS quand rien d’autre ne marche",
  "Texts to Erevos contacts by SMS, encrypted: off unless turned on": "Textes aux contacts Erevos par SMS, chiffrés : désactivé sauf si tu l’actives",
  "When the server, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.": "Quand le serveur, Nostr, les téléphones à proximité et LoRa échouent tous, un texte à un contact Erevos dont le numéro est lié peut partir par SMS, chiffré de bout en bout comme tout message Erevos, en SMS de données cachés que son app SMS n’affiche pas. Désactivé sauf si tu l’actives, ici pour tous ces contacts ou dans les Détails d’une discussion pour un seul.",
  "Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.": "Pense au coût : chaque SMS coûte ce que dit ton forfait ; un texte court prend 3 SMS et un plus long jusqu’à 10. Et l’opérateur voit quel numéro a écrit à quel autre, et quand, comme pour tout SMS ; jamais ce qui a été écrit.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.": "Seuls les textes et les suppressions partent ainsi, pas les photos, fichiers, messages vocaux, marques ni appels, ni les longs textes (environ 800 lettres latines au plus, ou 400 grecques), ni rien des discussions cachées. Les deux téléphones ont besoin d’Erevos comme app SMS.",
  "Turn off for all contacts": "Désactiver pour tous les contacts",
  "Turn on for all contacts": "Activer pour tous les contacts",
  "Erevos is not the SMS app yet, so nothing goes by SMS.": "Erevos n’est pas encore l’app SMS, donc rien ne part par SMS.",
  "On for {n} contact in their chat's Details.": "Activé pour {n} contact dans les Détails de sa discussion.",
  "On for {n} contacts in their chats' Details.": "Activé pour {n} contacts dans les Détails de leurs discussions.",
  "Too long for SMS, which takes only short texts. It can go once the server can be reached, or near their phone.": "Trop long pour un SMS, qui ne prend que des textes courts. Il pourra partir quand le serveur sera joignable, ou près de son téléphone.",
  "The SMS did not go.": "Le SMS n’est pas parti.",
};
