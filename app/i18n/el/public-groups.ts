// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of public groups, joined by a link, and their moderation (i18n/el/index.ts).
export const publicGroups: Record<string, string> = {
  // What the group keeps as notes (lib/public-groups.ts, lib/public-rules.ts).
  '{who} was muted.': '{who}: τέθηκε σε σίγαση.',
  '{who} can write again.': '{who}: μπορεί να γράφει ξανά.',
  '{who} was banned.': '{who}: αποκλείστηκε.',
  '{who} is no longer banned.': '{who}: ο αποκλεισμός άρθηκε.',
  '{who} was taken out.': '{who}: αφαιρέθηκε από την ομάδα.',
  '{who} is an admin.': '{who}: είναι πλέον διαχειριστής.',
  '{who} is no longer an admin.': '{who}: δεν είναι πια διαχειριστής.',
  '{who} owns the group now.': '{who}: είναι πλέον ο ιδιοκτήτης της ομάδας.',
  'A message was deleted for everyone.': 'Ένα μήνυμα διαγράφηκε για όλους.',
  'An admin took you out of the group.': 'Ένας διαχειριστής σε αφαίρεσε από την ομάδα.',
  'The group is full: its owner could not let you in.': 'Η ομάδα είναι γεμάτη: ο ιδιοκτήτης της δεν μπόρεσε να σε βάλει μέσα.',
  'You joined the group.': 'Μπήκες στην ομάδα.',
  'Your request to join was turned down.': 'Το αίτημά σου να μπεις απορρίφθηκε.',

  // What goes wrong (lib/public-groups.ts).
  'Admins moderate members, and only the owner moderates admins.': 'Οι διαχειριστές ελέγχουν τα μέλη, και μόνο ο ιδιοκτήτης ελέγχει τους διαχειριστές.',
  'An admin muted you in this group.': 'Ένας διαχειριστής σε έθεσε σε σίγαση σε αυτή την ομάδα.',
  'Choose the name the group sees.': 'Διάλεξε το όνομα που βλέπει η ομάδα.',
  'Only the group’s admins do that.': 'Αυτό το κάνουν μόνο οι διαχειριστές της ομάδας.',
  'Only the group’s owner does that.': 'Αυτό το κάνει μόνο ο ιδιοκτήτης της ομάδας.',
  'Share the group’s link to have people join.': 'Μοιράσου τον σύνδεσμο της ομάδας για να μπουν άτομα.',
  'That member is not in the group any more.': 'Αυτό το μέλος δεν είναι πια στην ομάδα.',
  'That message cannot be deleted for everyone.': 'Αυτό το μήνυμα δεν μπορεί να διαγραφεί για όλους.',
  'This link no longer works. Ask someone in the group for the new one.': 'Αυτός ο σύνδεσμος δεν λειτουργεί πια. Ζήτησε τον νέο από κάποιον στην ομάδα.',
  'You are in this group already.': 'Είσαι ήδη σε αυτή την ομάδα.',

  // The menu, and making or joining one (app/index.tsx, app/public-groups.tsx, app/join.tsx).
  'Public groups': 'Δημόσιες ομάδες',
  'Make a group anyone with its link can join, or join one by a link': 'Φτιάξε ομάδα όπου μπαίνει όποιος έχει τον σύνδεσμό της, ή μπες σε μία με σύνδεσμο',
  'This build of Erevos has no public groups yet. Update it to make or join one.':
    'Αυτή η έκδοση του Erevos δεν έχει ακόμα δημόσιες ομάδες. Ενημέρωσέ την για να φτιάξεις ή να μπεις σε μία.',
  'A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.':
    'Δημόσια ομάδα είναι μια ομάδα όπου μπορεί να ζητήσει να μπει όποιος έχει τον σύνδεσμο ή τον κωδικό QR της, με ιδιοκτήτη και διαχειριστές που την ελέγχουν. Τα μηνύματά της είναι κρυπτογραφημένα από άκρη σε άκρη όπως σε κάθε ομάδα, και κανένας server δεν μαθαίνει ποιος είναι μέσα.',
  'Make a public group': 'Νέα δημόσια ομάδα',
  'Whoever sees the link sees it too.': 'Το βλέπει και όποιος δει τον σύνδεσμο.',
  'Your name in it': 'Το όνομά σου σε αυτήν',
  'Members see this, not your contact name nor who you are in your chats.': 'Αυτό βλέπουν τα μέλη, όχι το όνομα επαφής σου ούτε ποιος είσαι στις συνομιλίες σου.',
  'A name for this group': 'Ένα όνομα για αυτή την ομάδα',
  'Who comes in': 'Ποιος μπαίνει',
  'Anyone with the link': 'Όποιος έχει τον σύνδεσμο',
  'An admin lets them in': 'Τους βάζει μέσα ένας διαχειριστής',
  'You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.':
    'Η ομάδα σου ανήκει: το τηλέφωνό σου βάζει μέσα όσους ζητούν, οπότε μπαίνουν μόλις το Erevos είναι ανοιχτό εδώ. Όποιος έχει τον σύνδεσμο διαβάζει ό,τι λέγεται από τη στιγμή που μπαίνει, ποτέ όσα ειπώθηκαν πριν.',
  'Make the public group': 'Δημιουργία δημόσιας ομάδας',
  'Join by a link': 'Συμμετοχή με σύνδεσμο',
  'Open the link': 'Άνοιγμα συνδέσμου',
  'That is not a group’s link. It starts with erevos://join': 'Αυτός δεν είναι σύνδεσμος ομάδας. Ξεκινά με erevos://join',
  'Waiting for an answer': 'Περιμένουν απάντηση',
  'A group': 'Μια ομάδα',
  'Stop asking': 'Ακύρωση αιτήματος',
  'The group shows in your chats once its owner’s phone lets you in.': 'Η ομάδα εμφανίζεται στις συνομιλίες σου μόλις σε βάλει μέσα το τηλέφωνο του ιδιοκτήτη της.',
  'Join a group': 'Συμμετοχή σε ομάδα',
  'Join {name}': 'Συμμετοχή στο «{name}»',
  'Not a group’s link': 'Δεν είναι σύνδεσμος ομάδας',
  'This link does not hold a group Erevos can ask to join.': 'Αυτός ο σύνδεσμος δεν περιέχει ομάδα στην οποία μπορεί να ζητήσει να μπει το Erevos.',
  'Your name in the group': 'Το όνομά σου στην ομάδα',
  'Everyone in the group sees it, beside the start of a key made for this group alone.': 'Το βλέπουν όλοι στην ομάδα, δίπλα στην αρχή ενός κλειδιού φτιαγμένου μόνο για αυτή την ομάδα.',
  'Its owner’s server': 'Ο server του ιδιοκτήτη της',
  'A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.':
    'Δημόσια ομάδα: μπαίνει όποιος έχει τον σύνδεσμό της, οπότε όποιος είναι μέσα μπορεί να είναι κάποιος που δεν ξέρεις, και μπορεί να αντιγράψει ό,τι λέγεται. Τα μέλη βλέπουν το όνομα που διαλέγεις και πού σε φτάνουν τα μηνύματά τους (τον server σου και την ουρά σου εκεί), όχι ποιος είσαι στις συνομιλίες σου.',
  'Ask to join': 'Ζήτα να μπεις',
  'Asked to join': 'Ζήτησες να μπεις',
  'The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.':
    'Η ομάδα εμφανίζεται στις συνομιλίες σου μόλις σε βάλει μέσα το τηλέφωνο του ιδιοκτήτη της: όταν το Erevos είναι ανοιχτό εκεί, και αν το ζητά η ομάδα, μόλις πει ναι ένας διαχειριστής.',

  // A public group's link and moderation (app/public-group.tsx, components/public-group.tsx).
  'Public group · tap for its link and members': 'Δημόσια ομάδα · πάτα για τον σύνδεσμο και τα μέλη',
  'A public group you own. Your phone lets people in when Erevos is open on it.': 'Δημόσια ομάδα που σου ανήκει. Το τηλέφωνό σου βάζει μέσα όσους ζητούν, όταν το Erevos είναι ανοιχτό εδώ.',
  'A public group you are an admin of.': 'Δημόσια ομάδα όπου είσαι διαχειριστής.',
  'A public group. Anyone with its link can ask to join.': 'Δημόσια ομάδα. Όποιος έχει τον σύνδεσμό της μπορεί να ζητήσει να μπει.',
  'The group’s link': 'Ο σύνδεσμος της ομάδας',
  'Share the link': 'Κοινοποίηση συνδέσμου',
  'The group’s link is copied.': 'Ο σύνδεσμος της ομάδας αντιγράφηκε.',
  'Change the link': 'Αλλαγή συνδέσμου',
  'The link and QR code shared so far stop working. Requests still waiting at the old one are lost.':
    'Ο σύνδεσμος και ο κωδικός QR που μοιράστηκες ως τώρα σταματούν να λειτουργούν. Τα αιτήματα που περιμένουν ακόμα στον παλιό χάνονται.',
  Change: 'Αλλαγή',
  'The group has a new link. The old one no longer works.': 'Η ομάδα έχει νέο σύνδεσμο. Ο παλιός δεν λειτουργεί πια.',
  'Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.':
    'Όποιος έχει αυτόν τον σύνδεσμο μπορεί να ζητήσει να μπει και να διαβάζει την ομάδα από τη στιγμή που μπαίνει: ποτέ όσα ειπώθηκαν πριν. Μοιράσου τον μόνο εκεί που θέλεις.',
  'The link is made once the owner’s phone has a queue for it on its server.': 'Ο σύνδεσμος φτιάχνεται μόλις το τηλέφωνο του ιδιοκτήτη έχει ουρά γι’ αυτόν στον server του.',
  'Asking to join': 'Ζητούν να μπουν',
  'Let in': 'Αποδοχή',
  'Turn away': 'Απόρριψη',
  'The owner’s phone lets them in once it hears your answer, when Erevos is open on it.':
    'Το τηλέφωνο του ιδιοκτήτη τους βάζει μέσα μόλις λάβει την απάντησή σου, όταν το Erevos είναι ανοιχτό εκεί.',
  Members: 'Μέλη',
  '{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.':
    '{n} στην ομάδα. Τα ονόματα τα διαλέγει ο καθένας, δεν αποδεικνύονται: δίπλα φαίνεται η αρχή του κλειδιού κάθε μέλους.',
  owner: 'ιδιοκτήτης',
  admin: 'διαχειριστής',
  muted: 'σε σίγαση',
  Moderate: 'Έλεγχος',
  'Let them write': 'Να γράφει ξανά',
  '{name} reads nothing the group says from now on, and can ask to join again by the link.':
    '{name}: δεν διαβάζει πια τίποτα από όσα λέει η ομάδα, και μπορεί να ζητήσει ξανά να μπει με τον σύνδεσμο.',
  Ban: 'Αποκλεισμός',
  '{name} is taken out, and what their phone asks after is turned away.': '{name}: αφαιρείται, και ό,τι ζητήσει μετά το τηλέφωνό του απορρίπτεται.',
  'Make an admin': 'Ορισμός διαχειριστή',
  'No longer an admin': 'Όχι πια διαχειριστής',
  'Hand the group over': 'Παράδοση της ομάδας',
  '{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.':
    '{name}: γίνεται ιδιοκτήτης της ομάδας. Το τηλέφωνό του βάζει μέσα όσους ζητούν, και ο σύνδεσμος αλλάζει σε έναν στον δικό του server. Εσύ μένεις διαχειριστής.',
  'Hand over': 'Παράδοση',
  Banned: 'Αποκλεισμένοι',
  'Lift the ban': 'Άρση αποκλεισμού',
  'Delete for everyone': 'Διαγραφή για όλους',
  'Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.':
    'Το τηλέφωνο κάθε μέλους το διαγράφει μόλις το μάθει. Όποιος το διάβασε ήδη μπορεί να κράτησε αντίγραφο.',
  'It goes from every member’s phone, as from yours.': 'Φεύγει από το τηλέφωνο κάθε μέλους, όπως και από το δικό σου.',
  'You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.':
    'Σου ανήκει: αν την κλείσεις, αφαιρούνται όλα τα μέλη και κανείς δεν μπορεί να γράψει ξανά σε αυτήν. Για να συνεχίσει χωρίς εσένα, παράδωσέ την πρώτα.',
  'The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.':
    'Το τηλέφωνο του ιδιοκτήτη σε αφαιρεί την επόμενη φορά που θα είναι ανοιχτό εκεί το Erevos. Δεν διαβάζεις τίποτα από όσα λέει η ομάδα μετά.',
  "Public groups stay on the phone: make and join them there.": "Οι δημόσιες ομάδες μένουν στο τηλέφωνο: φτιάξε τες και μπες σε αυτές από εκεί.",
};
