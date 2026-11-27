// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of texting with no relay, through Nostr, and the relay invites that come by themselves (app/chat.tsx, lib/nostr-chats.ts) (i18n/el/index.ts).
export const nostrOnly: Record<string, string> = {
  'No Nostr server took it: {reason}': 'Κανένας server Nostr δεν το πήρε: {reason}',
  'Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. With no server between you, texts, stickers, reactions, photos, files and voice messages go through Nostr; calls need a server or their phone nearby.': 'Η επαφή προστέθηκε. Τα μηνύματα προς αυτήν είναι κρυπτογραφημένα από άκρη σε άκρη. Σύγκρινε τον αριθμό ασφαλείας με τον δικό τους. Χωρίς server ανάμεσά σας, κείμενα, αυτοκόλλητα, αντιδράσεις, φωτογραφίες, αρχεία και φωνητικά μηνύματα πηγαίνουν μέσω Nostr· οι κλήσεις χρειάζονται server ή το κινητό τους κοντά.',
  '{name} gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': 'Ο/η {name} σού έδωσε μόνο του/της μια θέση στον server του/της. Φωτογραφίες, φωνητικά μηνύματα και κλήσεις πηγαίνουν τώρα κι αυτά, με όλους.',
  'A contact gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': 'Μια επαφή σού έδωσε μόνη της μια θέση στον server της. Φωτογραφίες, φωνητικά μηνύματα και κλήσεις πηγαίνουν τώρα κι αυτά, με όλους.',
  'An invite to a contact’s server came, but it was not taken. {error}': 'Ήρθε πρόσκληση στον server μιας επαφής, αλλά δεν πάρθηκε. {error}',
  'Sticker sent through Nostr, end-to-end encrypted.': 'Το αυτοκόλλητο στάλθηκε μέσω Nostr, κρυπτογραφημένο από άκρη σε άκρη.',
  'Photo sent through Nostr, end-to-end encrypted.': 'Η φωτογραφία στάλθηκε μέσω Nostr, κρυπτογραφημένη από άκρη σε άκρη.',
  'File sent through Nostr, end-to-end encrypted.': 'Το αρχείο στάλθηκε μέσω Nostr, κρυπτογραφημένο από άκρη σε άκρη.',
  'Photos and files go through Nostr, which cannot be reached.': 'Οι φωτογραφίες και τα αρχεία πηγαίνουν μέσω Nostr, που δεν είναι προσιτό αυτή τη στιγμή.',
  'The photo waits, and goes by itself once Nostr can take it.': 'Η φωτογραφία περιμένει και φεύγει μόνη της μόλις το Nostr μπορέσει να την πάρει.',
  'The file waits, and goes by itself once Nostr can take it.': 'Το αρχείο περιμένει και φεύγει μόνο του μόλις το Nostr μπορέσει να το πάρει.',
  '{have} of {count} pieces of the photo have come.': 'Ήρθαν {have} από τα {count} κομμάτια της φωτογραφίας.',
  'With no server, files can be {size} MB at most.': 'Χωρίς server, τα αρχεία μπορούν να είναι έως {size} MB.',
  'No Nostr server or file server took it: {reason}': 'Κανένας server Nostr ή server αρχείων δεν το πήρε: {reason}',
};
