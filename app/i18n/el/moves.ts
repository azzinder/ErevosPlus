// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of a relay queue that moves on a deletion, a block or junk (lib/queue-move.ts), and of
// deleting and blocking a contact in chat details (app/chat.tsx) (i18n/el/index.ts).
export const moves: Record<string, string> = {
  // Chat details: deleting and blocking.
  'Block contact': 'Αποκλεισμός επαφής',
  'Delete {name}? Your chat with them goes from this phone. Erevos gives you a new server queue and tells your other contacts quietly, so {name} can no longer write to you. With your contact link they can still ask to talk again.':
    'Να διαγράψεις την επαφή {name}; Η συνομιλία σας φεύγει από αυτό το τηλέφωνο. Το Erevos σου δίνει νέα ουρά στον server και ενημερώνει αθόρυβα τις άλλες επαφές σου, ώστε η επαφή {name} να μην μπορεί πια να σου γράψει. Με τον σύνδεσμο επαφής σου μπορεί ακόμα να ζητήσει να ξαναμιλήσετε.',
  'Block {name}? As with deleting, and what they send later is dropped, a request too. You can unblock them under Blocked contacts.':
    'Να αποκλείσεις την επαφή {name}; Γίνεται ό,τι και με τη διαγραφή, και ό,τι σου στείλει από εκεί και πέρα πετιέται, ακόμα και αίτημα. Μπορείς να άρεις τον αποκλεισμό στις «Αποκλεισμένες επαφές».',
  '{name} is deleted. Your other contacts learn your new queue as soon as the server answers.':
    'Η επαφή {name} διαγράφηκε. Οι άλλες επαφές σου μαθαίνουν τη νέα σου ουρά μόλις απαντήσει ο server.',
  '{name} is blocked. Your other contacts learn your new queue as soon as the server answers.':
    'Η επαφή {name} αποκλείστηκε. Οι άλλες επαφές σου μαθαίνουν τη νέα σου ουρά μόλις απαντήσει ο server.',
  'The server could not be reached, so your queue changes as soon as it can. Until then {name} can still write to it, but nothing they send shows.':
    'Ο server δεν απάντησε, οπότε η ουρά σου θα αλλάξει μόλις γίνει. Ως τότε η επαφή {name} μπορεί ακόμα να γράφει εκεί, αλλά τίποτα απ’ όσα στέλνει δεν εμφανίζεται.',
  '{name} is still in one of your groups, and can write to you there. Leave it, or ask its admin to take them out.':
    'Η επαφή {name} είναι ακόμα σε μία από τις ομάδες σου και μπορεί να σου γράφει εκεί. Βγες από την ομάδα ή ζήτα από τον διαχειριστή της να την αφαιρέσει.',
  '{name} is still in {n} of your groups, and can write to you there. Leave them, or ask their admins to take {name} out.':
    'Η επαφή {name} είναι ακόμα σε {n} από τις ομάδες σου και μπορεί να σου γράφει εκεί. Βγες από αυτές ή ζήτα από τους διαχειριστές τους να αφαιρέσουν την επαφή {name}.',
  // Relay and new contacts: a new contact link, and who is blocked.
  'New contact link': 'Νέος σύνδεσμος επαφής',
  'Make a new contact link? The links and QR codes you gave before work until {date}, then no more. Your contacts are not affected.':
    'Να φτιαχτεί νέος σύνδεσμος επαφής; Οι σύνδεσμοι και οι κωδικοί QR που έδωσες ως τώρα θα λειτουργούν ως τις {date} και μετά όχι. Οι επαφές σου δεν επηρεάζονται.',
  'You have a new contact link. The links and QR codes you gave before work until {date}.':
    'Έχεις νέο σύνδεσμο επαφής. Οι σύνδεσμοι και οι κωδικοί QR που έδωσες πριν λειτουργούν ως τις {date}.',
  "Create your server queue first, on New chat.": "Φτιάξε πρώτα την ουρά σου στον server, στη «Νέα συνομιλία».",
  'Blocked contacts': 'Αποκλεισμένες επαφές',
  'No one is blocked.': 'Δεν έχεις αποκλείσει κανέναν.',
  // What a move says once it is made.
  'Junk filled your server queue, so Erevos gave you a new one and told your contacts. Whoever sent it does not know the new one.':
    'Η ουρά σου στον server γέμισε σκουπίδια, οπότε το Erevos σου έδωσε νέα και ενημέρωσε τις επαφές σου. Όποιος τα έστελνε δεν ξέρει τη νέα.',
  'Junk comes to your new queue too, so one of your contacts or the server sends it. Erevos does not change it again before tomorrow.':
    'Σκουπίδια έρχονται και στη νέα σου ουρά, άρα τα στέλνει κάποια από τις επαφές σου ή ο ίδιος ο server. Το Erevos δεν θα την αλλάξει ξανά πριν από αύριο.',
  'Junk filled the queue your contact link names, so you have a new link. The links and QR codes you gave before work until {date}.':
    'Η ουρά που δείχνει ο σύνδεσμος επαφής σου γέμισε σκουπίδια, οπότε έχεις νέο σύνδεσμο. Οι σύνδεσμοι και οι κωδικοί QR που έδωσες πριν λειτουργούν ως τις {date}.',
  'The server had lost your queue, so you have a new one. Your contacts are told quietly.':
    'Ο server είχε χάσει την ουρά σου, οπότε έχεις νέα. Οι επαφές σου ενημερώνονται αθόρυβα.',
  // Adding someone who is blocked here.
  '{name} is blocked here. Unblock them to add them again?':
    'Έχεις αποκλείσει την επαφή {name}. Να αρθεί ο αποκλεισμός για να την προσθέσεις ξανά;',
  'This contact is blocked here. Unblock them to add them again?':
    'Έχεις αποκλείσει αυτή την επαφή. Να αρθεί ο αποκλεισμός για να την προσθέσεις ξανά;',
  // The queue the contact link names, lost by the relay.
  'The server had lost the queue your contact link names, so you have a new link. The links and QR codes you gave before no longer work.':
    'Ο server είχε χάσει την ουρά που δείχνει ο σύνδεσμος επαφής σου, οπότε έχεις νέο σύνδεσμο. Οι σύνδεσμοι και οι κωδικοί QR που έδωσες πριν δεν λειτουργούν πια.',
  'A phone nearby brought your messages, so Erevos gave you a new server queue and told your contacts. That phone does not know the new one.':
    'Ένα κινητό κοντά σου έφερε τα μηνύματά σου, γι’ αυτό το Erevos σού έδωσε νέα ουρά στον server και το είπε στις επαφές σου. Εκείνο το κινητό δεν ξέρει τη νέα.',
};
