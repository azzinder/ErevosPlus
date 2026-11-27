// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of a relay queue that moves on a deletion, a block or junk (lib/queue-move.ts), and of
// deleting and blocking a contact in chat details (app/chat.tsx), as in i18n/el/moves.ts.
export const moves: Record<string, string> = {
  // Chat details: deleting and blocking.
  'Block contact': 'Blokiraj kontakt',
  'Delete {name}? Your chat with them goes from this phone. Erevos gives you a new server queue and tells your other contacts quietly, so {name} can no longer write to you. With your contact link they can still ask to talk again.':
    'Obrisati kontakt {name}? Vaš razgovor nestaje s ovog telefona. Erevos vam daje novi red na serveru i tiho ga javlja vašim ostalim kontaktima, tako da vam {name} više ne može pisati. Preko vašeg linka za kontakt i dalje može zamoliti da ponovo razgovarate.',
  'Block {name}? As with deleting, and what they send later is dropped, a request too. You can unblock them under Blocked contacts.':
    'Blokirati kontakt {name}? Isto kao brisanje, a uz to se odbacuje sve što kasnije pošalje, pa i zahtjev. Blokadu možete ukloniti pod „Blokirani kontakti“.',
  '{name} is deleted. Your other contacts learn your new queue as soon as the server answers.':
    'Kontakt {name} je obrisan. Vaši ostali kontakti saznaju vaš novi red čim server odgovori.',
  '{name} is blocked. Your other contacts learn your new queue as soon as the server answers.':
    'Kontakt {name} je blokiran. Vaši ostali kontakti saznaju vaš novi red čim server odgovori.',
  'The server could not be reached, so your queue changes as soon as it can. Until then {name} can still write to it, but nothing they send shows.':
    'Server nije bio dostupan, pa se vaš red mijenja čim bude moguće. Do tada {name} još može pisati u njega, ali ništa od onoga što pošalje se ne prikazuje.',
  '{name} is still in one of your groups, and can write to you there. Leave it, or ask its admin to take them out.':
    'Kontakt {name} je još uvijek član jedne od vaših grupa i tamo vam može pisati. Izađite iz nje ili zamolite njenog administratora da ukloni kontakt {name}.',
  '{name} is still in {n} of your groups, and can write to you there. Leave them, or ask their admins to take {name} out.':
    'Kontakt {name} je još uvijek član {n} vaše grupe i tamo vam može pisati. Izađite iz tih grupa ili zamolite njihove administratore da uklone kontakt {name}. | Kontakt {name} je još uvijek član {n} vaše grupe i tamo vam može pisati. Izađite iz tih grupa ili zamolite njihove administratore da uklone kontakt {name}. | Kontakt {name} je još uvijek član {n} vaših grupa i tamo vam može pisati. Izađite iz tih grupa ili zamolite njihove administratore da uklone kontakt {name}.',
  // Relay and new contacts: a new contact link, and who is blocked.
  'New contact link': 'Novi link za kontakt',
  'Make a new contact link? The links and QR codes you gave before work until {date}, then no more. Your contacts are not affected.':
    'Napraviti novi link za kontakt? Linkovi i QR kodovi koje ste ranije dali rade do {date}, a onda više ne. Na vaše kontakte to ne utječe.',
  'You have a new contact link. The links and QR codes you gave before work until {date}.':
    'Imate novi link za kontakt. Linkovi i QR kodovi koje ste ranije dali rade do {date}.',
  "Create your server queue first, on New chat.": "Prvo napravite svoj red na serveru, pod „Novi razgovor“.",
  'Blocked contacts': 'Blokirani kontakti',
  'No one is blocked.': 'Nema blokiranih kontakata.',
  // What a move says once it is made.
  'Junk filled your server queue, so Erevos gave you a new one and told your contacts. Whoever sent it does not know the new one.':
    'Smeće je napunilo vaš red na serveru, pa vam je Erevos dao novi i javio ga vašim kontaktima. Ko god ga je slao, ne zna novi.',
  'Junk comes to your new queue too, so one of your contacts or the server sends it. Erevos does not change it again before tomorrow.':
    'Smeće stiže i u vaš novi red, pa ga šalje neki od vaših kontakata ili sam server. Erevos ga neće ponovo mijenjati prije sutra.',
  'Junk filled the queue your contact link names, so you have a new link. The links and QR codes you gave before work until {date}.':
    'Smeće je napunilo red koji navodi vaš link za kontakt, pa imate novi link. Linkovi i QR kodovi koje ste ranije dali rade do {date}.',
  'The server had lost your queue, so you have a new one. Your contacts are told quietly.':
    'Server je izgubio vaš red, pa imate novi. Vaši kontakti to saznaju tiho.',
  // Adding someone who is blocked here.
  '{name} is blocked here. Unblock them to add them again?':
    'Kontakt {name} je ovdje blokiran. Želite li ga odblokirati i ponovo dodati?',
  'This contact is blocked here. Unblock them to add them again?':
    'Ovaj kontakt je ovdje blokiran. Želite li ga odblokirati i ponovo dodati?',
  // The queue the contact link names, lost by the relay.
  'The server had lost the queue your contact link names, so you have a new link. The links and QR codes you gave before no longer work.':
    'Server je izgubio red koji navodi vaš link za kontakt, pa imate novi link. Linkovi i QR kodovi koje ste ranije dali više ne rade.',
  'A phone nearby brought your messages, so Erevos gave you a new server queue and told your contacts. That phone does not know the new one.':
    'Telefon u blizini je doneo vaše poruke, pa vam je Erevos dao novi red na serveru i rekao vašim kontaktima. Taj telefon ne zna novi.',
};
