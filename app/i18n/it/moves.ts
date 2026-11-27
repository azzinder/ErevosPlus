// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of a relay queue that moves on a deletion, a block or junk (lib/queue-move.ts), and of
// deleting and blocking a contact in chat details (app/chat.tsx), as in i18n/el/moves.ts.
export const moves: Record<string, string> = {
  // Chat details: deleting and blocking.
  'Block contact': 'Blocca contatto',
  'Delete {name}? Your chat with them goes from this phone. Erevos gives you a new server queue and tells your other contacts quietly, so {name} can no longer write to you. With your contact link they can still ask to talk again.':
    'Eliminare {name}? La vostra chat sparisce da questo telefono. Erevos ti dà una nuova coda sul server e la comunica in silenzio agli altri tuoi contatti, così {name} non potrà più scriverti. Con il tuo link di contatto può comunque chiederti di tornare a parlare.',
  'Block {name}? As with deleting, and what they send later is dropped, a request too. You can unblock them under Blocked contacts.':
    'Bloccare {name}? Come con l’eliminazione, e in più quello che invierà in seguito viene scartato, anche una richiesta. Puoi togliere il blocco in «Contatti bloccati».',
  '{name} is deleted. Your other contacts learn your new queue as soon as the server answers.':
    'Hai eliminato {name}. Gli altri tuoi contatti conoscono la tua nuova coda appena il server risponde.',
  '{name} is blocked. Your other contacts learn your new queue as soon as the server answers.':
    'Hai bloccato {name}. Gli altri tuoi contatti conoscono la tua nuova coda appena il server risponde.',
  'The server could not be reached, so your queue changes as soon as it can. Until then {name} can still write to it, but nothing they send shows.':
    'Il server non era raggiungibile, quindi la tua coda cambierà appena possibile. Fino ad allora {name} può ancora scriverci, ma niente di quello che invia viene mostrato.',
  '{name} is still in one of your groups, and can write to you there. Leave it, or ask its admin to take them out.':
    '{name} è ancora in uno dei tuoi gruppi e lì può scriverti. Esci dal gruppo o chiedi a chi lo amministra di togliere {name}.',
  '{name} is still in {n} of your groups, and can write to you there. Leave them, or ask their admins to take {name} out.':
    '{name} è ancora in {n} dei tuoi gruppi e lì può scriverti. Esci da quei gruppi o chiedi a chi li amministra di togliere {name}.',
  // Relay and new contacts: a new contact link, and who is blocked.
  'New contact link': 'Nuovo link di contatto',
  'Make a new contact link? The links and QR codes you gave before work until {date}, then no more. Your contacts are not affected.':
    'Creare un nuovo link di contatto? I link e i codici QR che hai dato finora funzionano fino al {date}, poi non più. Per i tuoi contatti non cambia niente.',
  'You have a new contact link. The links and QR codes you gave before work until {date}.':
    'Hai un nuovo link di contatto. I link e i codici QR che hai dato prima funzionano fino al {date}.',
  "Create your server queue first, on New chat.": "Crea prima la tua coda sul server, in «Nuova chat».",
  'Blocked contacts': 'Contatti bloccati',
  'No one is blocked.': 'Nessuno è bloccato.',
  // What a move says once it is made.
  'Junk filled your server queue, so Erevos gave you a new one and told your contacts. Whoever sent it does not know the new one.':
    'Messaggi spazzatura hanno riempito la tua coda sul server, quindi Erevos te ne ha data una nuova e l’ha detto ai tuoi contatti. Chi li mandava non conosce quella nuova.',
  'Junk comes to your new queue too, so one of your contacts or the server sends it. Erevos does not change it again before tomorrow.':
    'Messaggi spazzatura arrivano anche nella tua nuova coda, quindi li manda uno dei tuoi contatti o il server stesso. Erevos non la cambierà di nuovo prima di domani.',
  'Junk filled the queue your contact link names, so you have a new link. The links and QR codes you gave before work until {date}.':
    'Messaggi spazzatura hanno riempito la coda indicata dal tuo link di contatto, quindi hai un nuovo link. I link e i codici QR che hai dato prima funzionano fino al {date}.',
  'The server had lost your queue, so you have a new one. Your contacts are told quietly.':
    'Il server aveva perso la tua coda, quindi ne hai una nuova. I tuoi contatti vengono avvisati in silenzio.',
  // Adding someone who is blocked here.
  '{name} is blocked here. Unblock them to add them again?':
    'Hai bloccato {name} qui. Sbloccare il contatto per aggiungerlo di nuovo?',
  'This contact is blocked here. Unblock them to add them again?':
    'Hai bloccato questo contatto qui. Sbloccarlo per aggiungerlo di nuovo?',
  // The queue the contact link names, lost by the relay.
  'The server had lost the queue your contact link names, so you have a new link. The links and QR codes you gave before no longer work.':
    'Il server aveva perso la coda indicata dal tuo link di contatto, quindi hai un nuovo link. I link e i codici QR che hai dato prima non funzionano più.',
  'A phone nearby brought your messages, so Erevos gave you a new server queue and told your contacts. That phone does not know the new one.':
    'Un telefono vicino ha portato i tuoi messaggi, quindi Erevos ti ha dato una nuova coda sul server e l’ha detto ai tuoi contatti. Quel telefono non conosce la nuova.',
};
