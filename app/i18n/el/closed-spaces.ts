// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of a closed space that says a message came while another is open (app/security.tsx,
// lib/closed-notices.ts), and of a message that came or went through Nostr (app/chat.tsx) (i18n/el/index.ts).
export const closedSpaces: Record<string, string> = {
  'Went through Nostr.': 'Πήγε μέσω Nostr.',
  'Came through Nostr.': 'Ήρθε μέσω Nostr.',
  'Went through the server.': 'Πήγε μέσω του server.',
  'Came through the server.': 'Ήρθε μέσω του server.',
  'Went to their phone nearby.': 'Πήγε στο κοντινό τηλέφωνό τους.',
  'Came from a phone nearby.': 'Ήρθε από κοντινό τηλέφωνο.',
  'Went over LoRa.': 'Πήγε μέσω LoRa.',
  'Went to the phones nearby, which carry it to their server.': 'Πήγε στα κοντινά τηλέφωνα, που το πηγαίνουν στον server τους.',
  'Went to the phones nearby, in case theirs is one of them.': 'Πήγε στα κοντινά τηλέφωνα, μήπως είναι ένα από αυτά το δικό τους.',
  '{what} through Nostr, end-to-end encrypted.': '{what} μέσω Nostr, κρυπτογραφημένο από άκρη σε άκρη.',
  'Took the last text {seconds} s after it was sent, at {time}.': 'Πήρε το τελευταίο κείμενο {seconds} δευτ. μετά την αποστολή, στις {time}.',
  'Did not take the last text, at {time}. {why}': 'Δεν πήρε το τελευταίο κείμενο, στις {time}. {why}',
  'No text given to it since Erevos started.': 'Δεν του δόθηκε κείμενο από τότε που άνοιξε το Erevos.',
  'Read on since {time}.': 'Διαβάζεται από τις {time}.',
  'Could not be read on, at {time}. {why}': 'Δεν διαβάστηκε, στις {time}. {why}',
  'Not read on yet.': 'Δεν διαβάζεται ακόμα.',
  'What the servers did last': 'Τι έκαναν τελευταία οι servers',
  'Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts\' servers show here too once a text went to them.': 'Από τότε που άνοιξε το Erevos, μόνο σε αυτό το κινητό και μόνο όσο τρέχει: αν κάθε server πήρε το τελευταίο κείμενο που του δόθηκε, και αν διαβάζεται. Οι servers των επαφών σου φαίνονται κι αυτοί εδώ, μόλις πάει ένα κείμενο σε αυτούς.',
  'It did not say it took it within {seconds} seconds.': 'Δεν είπε ότι το πήρε μέσα σε {seconds} δευτερόλεπτα.',
  'It refused it: "{reason}"': 'Το αρνήθηκε: «{reason}»',
  'It refused it.': 'Το αρνήθηκε.',
  'Not reached: {reason}': 'Δεν έγινε σύνδεση: {reason}',
  'This space only while open': 'Αυτός ο χώρος μόνο όταν είναι ανοιχτός',
  'Also while another space is open': 'Και όσο είναι ανοιχτός άλλος χώρος',
  'While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its server outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its server may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.': 'Όσο είναι ανοιχτός άλλος χώρος, αυτός λέει μόνο «Νέο μήνυμα», όπως κι εκείνος, ποτέ ποιος χώρος· οι κρυφές του συνομιλίες δεν λένε τίποτα τότε. Γι’ αυτό το τηλέφωνο κρατά έξω από τον κωδικό του τις διευθύνσεις των ουρών του στον server του, μαζί και την ουρά όπου γράφει κάθε επαφή του, ως 64 επαφές, ποτέ τα κλειδιά του, ποιες είναι οι επαφές του ή τα μηνύματά του, και ο server του μπορεί να καταλάβει ότι οι δύο χώροι είναι στο ίδιο τηλέφωνο. Αν αυτός ο χώρος πηγαίνει μέσω Tor (Μηνύματα ή Όλα), ο server του ρωτιέται μόνο μέσω Tor: όσο ο ανοιχτός χώρος έχει το Tor κλειστό, ή το Tor του ξεκινά ή μόλις απέτυχε, αυτός δεν λέει τίποτα, και όσα ήρθαν λέγονται μόλις το Tor είναι έτοιμο εκεί.',
  'Closed, this space receives nothing: its messages wait at its server and come when it opens.': 'Κλειστός, αυτός ο χώρος δεν λαμβάνει τίποτα: τα μηνύματά του περιμένουν στον server του και έρχονται όταν ανοίξει.',
  'This space has no queue at a server yet: it can say nothing while closed.': 'Αυτός ο χώρος δεν έχει ακόμη ουρά σε server: κλειστός δεν μπορεί να πει τίποτα.',
  'Tor is not ready.': 'Το Tor δεν είναι έτοιμο.',
};
