// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of encrypted messages by SMS when nothing else works (lib/sms-way.ts, app/sms-settings.tsx, app/chat.tsx) (i18n/sh/index.ts).
export const smsWay: Record<string, string> = {
  "Went by SMS, end-to-end encrypted.": "Poslano SMS-om, šifrirano s kraja na kraj.",
  "Came by SMS, end-to-end encrypted.": "Stiglo SMS-om, šifrirano s kraja na kraj.",
  "{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.": "{what} SMS-om, šifrirano s kraja na kraj, jer ništa drugo nije moglo. Mobilni operater vidi da ste pisali na broj kontakta {name}, i kada, kao kod svakog SMS-a.",
  "It went without the link’s preview, which is too much for SMS.": "Poslano je bez pregleda linka, koji je prevelik za SMS.",
  "It is too long for SMS.": "Preduga je za SMS.",
  "SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.": "SMS je uključen za svaki kontakt s brojem. Isključite ga pod „Postavke → Telefon i SMS → SMS“.",
  "SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.": "SMS se pojedinačno može uključiti za najviše {n} kontakata. Uključite ga za sve pod „Postavke → Telefon i SMS → SMS“.",
  "When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.": "Kad ništa drugo ne može prenijeti tekst kontaktu {name}, ide SMS-om, šifrirano s kraja na kraj. Svaki SMS košta koliko kaže vaša tarifa, a mobilni operater vidi da ste pisali na taj broj, i kada.",
  "Messages to {name} no longer go by SMS.": "Poruke kontaktu {name} više ne idu SMS-om.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the server, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.": "Tekstovi idu SMS-om na njegov broj, šifrirano s kraja na kraj, samo kad server, Nostr, telefoni u blizini i LoRa svi zakažu. Svaki put košta SMS, a mobilni operater vidi ko je kome pisao, i kada. Oba telefona trebaju Erevos kao SMS aplikaciju.",
  "SMS when nothing else works": "SMS kad ništa drugo ne radi",
  "Texts to Erevos contacts by SMS, encrypted: off unless turned on": "Tekstovi Erevos kontaktima SMS-om, šifrirano: isključeno dok ga ne uključite",
  "When the server, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.": "Kad server, Nostr, telefoni u blizini i LoRa svi zakažu, tekst Erevos kontaktu s povezanim brojem može ići SMS-om, šifrirano s kraja na kraj kao svaka Erevos poruka, u skrivenim podatkovnim SMS-ovima koje njegova SMS aplikacija ne prikazuje. Isključeno dok ga ne uključite, ovdje za sve takve kontakte ili u Detaljima razgovora za jedan.",
  "Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.": "Pazite na cijenu: svaki SMS košta koliko kaže vaša tarifa; kratak tekst zauzima 3 SMS-a, a duži do 10. I mobilni operater vidi koji je broj pisao kojem, i kada, kao kod svakog SMS-a; nikad šta je napisano.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.": "Tako idu samo tekstovi i brisanja, ne fotografije, datoteke, glasovne poruke, oznake ni pozivi, ni dugi tekstovi (najviše oko 800 latiničnih ili 400 grčkih slova), ni išta iz skrivenih razgovora. Oba telefona trebaju Erevos kao SMS aplikaciju.",
  "Turn off for all contacts": "Isključi za sve kontakte",
  "Turn on for all contacts": "Uključi za sve kontakte",
  "Erevos is not the SMS app yet, so nothing goes by SMS.": "Erevos još nije SMS aplikacija, pa ništa ne ide SMS-om.",
  "On for {n} contact in their chat's Details.": "Uključeno za {n} kontakt u Detaljima njegovog razgovora.",
  "On for {n} contacts in their chats' Details.": "Uključeno za {n} kontakt u Detaljima njihovih razgovora. | Uključeno za {n} kontakta u Detaljima njihovih razgovora. | Uključeno za {n} kontakata u Detaljima njihovih razgovora.",
  "Too long for SMS, which takes only short texts. It can go once the server can be reached, or near their phone.": "Preduga za SMS, koji nosi samo kratke tekstove. Može otići čim server bude dostupan, ili u blizini njegovog telefona.",
  "The SMS did not go.": "SMS nije otišao.",
};
