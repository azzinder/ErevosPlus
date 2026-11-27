// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of a relay queue that moves on a deletion, a block or junk (lib/queue-move.ts), and of
// deleting and blocking a contact in chat details (app/chat.tsx), as in i18n/el/moves.ts.
export const moves: Record<string, string> = {
  // Chat details: deleting and blocking.
  'Block contact': 'Kontakt blockieren',
  'Delete {name}? Your chat with them goes from this phone. Erevos gives you a new server queue and tells your other contacts quietly, so {name} can no longer write to you. With your contact link they can still ask to talk again.':
    '{name} löschen? Euer Chat verschwindet von diesem Telefon. Erevos gibt dir eine neue Server-Warteschlange und teilt sie deinen anderen Kontakten still mit, sodass {name} dir nicht mehr schreiben kann. Über deinen Kontaktlink kann {name} dich trotzdem bitten, wieder miteinander zu schreiben.',
  'Block {name}? As with deleting, and what they send later is dropped, a request too. You can unblock them under Blocked contacts.':
    '{name} blockieren? Wie beim Löschen, und was später noch kommt, wird verworfen, auch eine Anfrage. Die Blockierung kannst du unter „Blockierte Kontakte“ aufheben.',
  '{name} is deleted. Your other contacts learn your new queue as soon as the server answers.':
    '{name} ist gelöscht. Deine anderen Kontakte erfahren deine neue Warteschlange, sobald der Server antwortet.',
  '{name} is blocked. Your other contacts learn your new queue as soon as the server answers.':
    '{name} ist blockiert. Deine anderen Kontakte erfahren deine neue Warteschlange, sobald der Server antwortet.',
  'The server could not be reached, so your queue changes as soon as it can. Until then {name} can still write to it, but nothing they send shows.':
    'Der Server war nicht erreichbar, deshalb ändert sich deine Warteschlange, sobald es geht. Bis dahin kann {name} noch dorthin schreiben, aber nichts davon wird angezeigt.',
  '{name} is still in one of your groups, and can write to you there. Leave it, or ask its admin to take them out.':
    '{name} ist noch in einer deiner Gruppen und kann dir dort schreiben. Verlass sie oder bitte ihren Admin, {name} zu entfernen.',
  '{name} is still in {n} of your groups, and can write to you there. Leave them, or ask their admins to take {name} out.':
    '{name} ist noch in {n} deiner Gruppen und kann dir dort schreiben. Verlass sie oder bitte ihre Admins, {name} zu entfernen.',
  // Relay and new contacts: a new contact link, and who is blocked.
  'New contact link': 'Neuer Kontaktlink',
  'Make a new contact link? The links and QR codes you gave before work until {date}, then no more. Your contacts are not affected.':
    'Einen neuen Kontaktlink erstellen? Die Links und QR-Codes, die du bisher weitergegeben hast, funktionieren bis zum {date}, danach nicht mehr. Deine Kontakte betrifft das nicht.',
  'You have a new contact link. The links and QR codes you gave before work until {date}.':
    'Du hast einen neuen Kontaktlink. Die Links und QR-Codes von vorher funktionieren bis zum {date}.',
  "Create your server queue first, on New chat.": "Erstelle zuerst deine Server-Warteschlange, unter „Neuer Chat“.",
  'Blocked contacts': 'Blockierte Kontakte',
  'No one is blocked.': 'Niemand ist blockiert.',
  // What a move says once it is made.
  'Junk filled your server queue, so Erevos gave you a new one and told your contacts. Whoever sent it does not know the new one.':
    'Müll hat deine Server-Warteschlange gefüllt, deshalb hat Erevos dir eine neue gegeben und deinen Kontakten Bescheid gesagt. Wer den Müll geschickt hat, kennt die neue nicht.',
  'Junk comes to your new queue too, so one of your contacts or the server sends it. Erevos does not change it again before tomorrow.':
    'Auch in deine neue Warteschlange kommt Müll, also schickt ihn einer deiner Kontakte oder der Server selbst. Erevos ändert sie vor morgen nicht noch einmal.',
  'Junk filled the queue your contact link names, so you have a new link. The links and QR codes you gave before work until {date}.':
    'Müll hat die Warteschlange gefüllt, die dein Kontaktlink nennt, deshalb hast du einen neuen Link. Die Links und QR-Codes von vorher funktionieren bis zum {date}.',
  'The server had lost your queue, so you have a new one. Your contacts are told quietly.':
    'Der Server hatte deine Warteschlange verloren, deshalb hast du eine neue. Deine Kontakte erfahren es still.',
  // Adding someone who is blocked here.
  '{name} is blocked here. Unblock them to add them again?':
    '{name} ist hier blockiert. Blockierung aufheben und wieder hinzufügen?',
  'This contact is blocked here. Unblock them to add them again?':
    'Dieser Kontakt ist hier blockiert. Blockierung aufheben und wieder hinzufügen?',
  // The queue the contact link names, lost by the relay.
  'The server had lost the queue your contact link names, so you have a new link. The links and QR codes you gave before no longer work.':
    'Der Server hatte die Warteschlange verloren, die dein Kontaktlink nennt, deshalb hast du einen neuen Link. Die Links und QR-Codes von vorher funktionieren nicht mehr.',
  'A phone nearby brought your messages, so Erevos gave you a new server queue and told your contacts. That phone does not know the new one.':
    'Ein Telefon in der Nähe hat deine Nachrichten geholt, deshalb hat Erevos dir eine neue Server-Warteschlange gegeben und deinen Kontakten Bescheid gesagt. Jenes Telefon kennt die neue nicht.',
};
