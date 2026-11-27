// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of encrypted messages by SMS when nothing else works (lib/sms-way.ts, app/sms-settings.tsx, app/chat.tsx) (i18n/de/index.ts).
export const smsWay: Record<string, string> = {
  "Went by SMS, end-to-end encrypted.": "Per SMS gesendet, Ende-zu-Ende-verschlüsselt.",
  "Came by SMS, end-to-end encrypted.": "Per SMS gekommen, Ende-zu-Ende-verschlüsselt.",
  "{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.": "{what}: per SMS, Ende-zu-Ende-verschlüsselt, weil sonst nichts sie nehmen konnte. Der Mobilfunkanbieter sieht, dass du der Nummer von {name} geschrieben hast, und wann, wie bei jeder SMS.",
  "It went without the link’s preview, which is too much for SMS.": "Sie ging ohne die Linkvorschau, die für SMS zu groß ist.",
  "It is too long for SMS.": "Sie ist zu lang für SMS.",
  "SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.": "SMS sind für jeden Kontakt mit Nummer an. Schalte sie unter „Einstellungen → Telefon und SMS → SMS“ aus.",
  "SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.": "SMS können einzeln für höchstens {n} Kontakte an sein. Schalte sie unter „Einstellungen → Telefon und SMS → SMS“ für alle an.",
  "When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.": "Wenn sonst nichts einen Text an {name} nehmen kann, geht er per SMS, Ende-zu-Ende-verschlüsselt. Jede SMS kostet, was dein Tarif sagt, und der Mobilfunkanbieter sieht, dass du dieser Nummer geschrieben hast, und wann.",
  "Messages to {name} no longer go by SMS.": "Nachrichten an {name} gehen nicht mehr per SMS.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the server, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.": "Texte gehen per SMS an die Nummer, Ende-zu-Ende-verschlüsselt, nur wenn Server, Nostr, die Telefone in der Nähe und LoRa alle versagen. Das kostet SMS, und der Mobilfunkanbieter sieht, wer wem geschrieben hat, und wann. Beide Telefone brauchen Erevos als SMS-App.",
  "SMS when nothing else works": "SMS, wenn sonst nichts geht",
  "Texts to Erevos contacts by SMS, encrypted: off unless turned on": "Texte an Erevos-Kontakte per SMS, verschlüsselt: aus, bis du es einschaltest",
  "When the server, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.": "Wenn Server, Nostr, die Telefone in der Nähe und LoRa alle versagen, kann ein Text an einen Erevos-Kontakt mit verknüpfter Nummer stattdessen per SMS gehen, Ende-zu-Ende-verschlüsselt wie jede Erevos-Nachricht, als versteckte Daten-SMS, die seine SMS-App nicht zeigt. Aus, bis du es einschaltest: hier für alle solchen Kontakte oder in den Details eines Chats für einen.",
  "Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.": "Denk an die Kosten: Jede SMS kostet, was dein Tarif sagt; ein kurzer Text braucht 3 SMS, ein längerer bis zu 10. Und der Mobilfunkanbieter sieht, welche Nummer welcher geschrieben hat, und wann, wie bei jeder SMS; nie, was geschrieben wurde.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.": "So gehen nur Texte und Löschungen, keine Fotos, Dateien, Sprachnachrichten, Markierungen oder Anrufe, keine langen Texte (höchstens etwa 800 lateinische oder 400 griechische Buchstaben) und nichts aus versteckten Chats. Beide Telefone brauchen Erevos als SMS-App.",
  "Turn off for all contacts": "Für alle Kontakte ausschalten",
  "Turn on for all contacts": "Für alle Kontakte einschalten",
  "Erevos is not the SMS app yet, so nothing goes by SMS.": "Erevos ist noch nicht die SMS-App, also geht nichts per SMS.",
  "On for {n} contact in their chat's Details.": "An für {n} Kontakt in den Details seines Chats.",
  "On for {n} contacts in their chats' Details.": "An für {n} Kontakte in den Details ihrer Chats.",
  "Too long for SMS, which takes only short texts. It can go once the server can be reached, or near their phone.": "Zu lang für SMS, die nur kurze Texte nehmen. Sie kann gehen, sobald der Server erreichbar ist, oder in der Nähe des anderen Telefons.",
  "The SMS did not go.": "Die SMS ging nicht.",
};
