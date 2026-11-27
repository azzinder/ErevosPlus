// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of a relay queue that moves on a deletion, a block or junk (lib/queue-move.ts), and of
// deleting and blocking a contact in chat details (app/chat.tsx), as in i18n/el/moves.ts.
export const moves: Record<string, string> = {
  // Chat details: deleting and blocking.
  'Block contact': 'Bloquer le contact',
  'Delete {name}? Your chat with them goes from this phone. Erevos gives you a new server queue and tells your other contacts quietly, so {name} can no longer write to you. With your contact link they can still ask to talk again.':
    'Supprimer {name} ? Ta conversation avec cette personne disparaît de ce téléphone. Erevos te donne une nouvelle file d’attente sur le serveur et la communique discrètement à tes autres contacts, pour que {name} ne puisse plus t’écrire. Avec ton lien de contact, cette personne peut encore demander à reprendre contact.',
  'Block {name}? As with deleting, and what they send later is dropped, a request too. You can unblock them under Blocked contacts.':
    'Bloquer {name} ? Comme pour la suppression, et en plus ce que cette personne enverra ensuite est rejeté, même une demande. Tu peux la débloquer dans « Contacts bloqués ».',
  '{name} is deleted. Your other contacts learn your new queue as soon as the server answers.':
    'Tu as supprimé {name}. Tes autres contacts apprennent ta nouvelle file d’attente dès que le serveur répond.',
  '{name} is blocked. Your other contacts learn your new queue as soon as the server answers.':
    'Tu as bloqué {name}. Tes autres contacts apprennent ta nouvelle file d’attente dès que le serveur répond.',
  'The server could not be reached, so your queue changes as soon as it can. Until then {name} can still write to it, but nothing they send shows.':
    'Le serveur n’a pas pu être joint, ta file d’attente changera donc dès que possible. D’ici là, {name} peut encore y écrire, mais rien de ce que cette personne envoie ne s’affiche.',
  '{name} is still in one of your groups, and can write to you there. Leave it, or ask its admin to take them out.':
    '{name} est encore dans un de tes groupes et peut t’y écrire. Quitte-le, ou demande à son admin de retirer {name}.',
  '{name} is still in {n} of your groups, and can write to you there. Leave them, or ask their admins to take {name} out.':
    '{name} est encore dans {n} de tes groupes et peut t’y écrire. Quitte-les, ou demande à leurs admins de retirer {name}.',
  // Relay and new contacts: a new contact link, and who is blocked.
  'New contact link': 'Nouveau lien de contact',
  'Make a new contact link? The links and QR codes you gave before work until {date}, then no more. Your contacts are not affected.':
    'Créer un nouveau lien de contact ? Les liens et codes QR donnés jusqu’ici fonctionnent jusqu’au {date}, puis plus du tout. Tes contacts ne sont pas concernés.',
  'You have a new contact link. The links and QR codes you gave before work until {date}.':
    'Tu as un nouveau lien de contact. Les liens et codes QR donnés avant fonctionnent jusqu’au {date}.',
  "Create your server queue first, on New chat.": "Crée d’abord ta file d’attente sur le serveur, dans « Nouvelle discussion ».",
  'Blocked contacts': 'Contacts bloqués',
  'No one is blocked.': 'Personne n’est bloqué.',
  // What a move says once it is made.
  'Junk filled your server queue, so Erevos gave you a new one and told your contacts. Whoever sent it does not know the new one.':
    'Des messages indésirables ont rempli ta file d’attente sur le serveur, Erevos t’en a donc donné une nouvelle et a prévenu tes contacts. Qui les envoyait ne connaît pas la nouvelle.',
  'Junk comes to your new queue too, so one of your contacts or the server sends it. Erevos does not change it again before tomorrow.':
    'Des messages indésirables arrivent aussi dans ta nouvelle file d’attente : c’est donc un de tes contacts ou le serveur qui les envoie. Erevos ne la change plus avant demain.',
  'Junk filled the queue your contact link names, so you have a new link. The links and QR codes you gave before work until {date}.':
    'Des messages indésirables ont rempli la file d’attente qu’indique ton lien de contact, tu as donc un nouveau lien. Les liens et codes QR donnés avant fonctionnent jusqu’au {date}.',
  'The server had lost your queue, so you have a new one. Your contacts are told quietly.':
    'Le serveur avait perdu ta file d’attente, tu en as donc une nouvelle. Tes contacts en sont informés discrètement.',
  // Adding someone who is blocked here.
  '{name} is blocked here. Unblock them to add them again?':
    'Tu as bloqué {name} ici. Débloquer ce contact pour l’ajouter à nouveau ?',
  'This contact is blocked here. Unblock them to add them again?':
    'Tu as bloqué ce contact ici. Le débloquer pour l’ajouter à nouveau ?',
  // The queue the contact link names, lost by the relay.
  'The server had lost the queue your contact link names, so you have a new link. The links and QR codes you gave before no longer work.':
    'Le serveur avait perdu la file d’attente qu’indique ton lien de contact, tu as donc un nouveau lien. Les liens et codes QR donnés avant ne fonctionnent plus.',
  'A phone nearby brought your messages, so Erevos gave you a new server queue and told your contacts. That phone does not know the new one.':
    'Un téléphone à proximité a apporté tes messages, alors Erevos t’a donné une nouvelle file d’attente sur le serveur et l’a dit à tes contacts. Ce téléphone ne connaît pas la nouvelle.',
};
