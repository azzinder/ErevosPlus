// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of encrypted messages by SMS when nothing else works (lib/sms-way.ts, app/sms-settings.tsx, app/chat.tsx) (i18n/it/index.ts).
export const smsWay: Record<string, string> = {
  "Went by SMS, end-to-end encrypted.": "Inviato via SMS, crittografato end-to-end.",
  "Came by SMS, end-to-end encrypted.": "Arrivato via SMS, crittografato end-to-end.",
  "{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.": "{what} via SMS, crittografato end-to-end, perché nient’altro poteva prenderlo. L’operatore vede che hai scritto al numero di {name}, e quando, come per ogni SMS.",
  "It went without the link’s preview, which is too much for SMS.": "È partito senza l’anteprima del link, troppo grande per un SMS.",
  "It is too long for SMS.": "È troppo lungo per un SMS.",
  "SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.": "Gli SMS sono attivi per ogni contatto con un numero. Disattivali in «Impostazioni → Telefono e SMS → SMS».",
  "SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.": "Gli SMS si possono attivare uno per uno per {n} contatti al massimo. Attivali per tutti in «Impostazioni → Telefono e SMS → SMS».",
  "When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.": "Quando nient’altro può prendere un testo per {name}, va via SMS, crittografato end-to-end. Ogni SMS costa quanto dice il tuo piano, e l’operatore vede che hai scritto al suo numero, e quando.",
  "Messages to {name} no longer go by SMS.": "I messaggi a {name} non vanno più via SMS.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the server, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.": "I testi vanno via SMS al suo numero, crittografati end-to-end, solo quando server, Nostr, i telefoni vicini e LoRa falliscono tutti. Ognuno costa SMS, e l’operatore vede chi ha scritto a chi, e quando. Entrambi i telefoni hanno bisogno di Erevos come app per gli SMS.",
  "SMS when nothing else works": "SMS quando nient’altro funziona",
  "Texts to Erevos contacts by SMS, encrypted: off unless turned on": "Testi ai contatti Erevos via SMS, crittografati: disattivato finché non lo attivi",
  "When the server, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.": "Quando server, Nostr, i telefoni vicini e LoRa falliscono tutti, un testo a un contatto Erevos con numero collegato può andare via SMS, crittografato end-to-end come ogni messaggio Erevos, in SMS dati nascosti che la sua app per gli SMS non mostra. Disattivato finché non lo attivi, qui per tutti questi contatti o nei Dettagli di una chat per uno solo.",
  "Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.": "Attento al costo: ogni SMS costa quanto dice il tuo piano; un testo breve richiede 3 SMS e uno più lungo fino a 10. E l’operatore vede quale numero ha scritto a quale, e quando, come per ogni SMS; mai cosa è stato scritto.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.": "Così vanno solo testi ed eliminazioni, non foto, file, messaggi vocali, segni o chiamate, né testi lunghi (al massimo circa 800 lettere latine, o 400 greche), né nulla dalle chat nascoste. Entrambi i telefoni hanno bisogno di Erevos come app per gli SMS.",
  "Turn off for all contacts": "Disattiva per tutti i contatti",
  "Turn on for all contacts": "Attiva per tutti i contatti",
  "Erevos is not the SMS app yet, so nothing goes by SMS.": "Erevos non è ancora l’app per gli SMS, quindi niente va via SMS.",
  "On for {n} contact in their chat's Details.": "Attivo per {n} contatto nei Dettagli della sua chat.",
  "On for {n} contacts in their chats' Details.": "Attivo per {n} contatti nei Dettagli delle loro chat.",
  "Too long for SMS, which takes only short texts. It can go once the server can be reached, or near their phone.": "Troppo lungo per un SMS, che prende solo testi brevi. Può partire quando il server è raggiungibile, o vicino al suo telefono.",
  "The SMS did not go.": "L’SMS non è partito.",
};
