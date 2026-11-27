// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of hidden chats that receive while they are closed (lock/hidden-keep.ts,
// lib/place-receiver.ts, the toggle at the top of an open place in app/chat.tsx) (i18n/el/index.ts).
export const hiddenKeep: Record<string, string> = {
  'Receive while closed': 'Λήψη όσο είναι κλειστές',
  'Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.':
    'Κλειστές, αυτές οι κρυφές συνομιλίες λαμβάνουν όπως οι άλλες συνομιλίες σου: οι επαφές τους βλέπουν αμέσως ότι ένα μήνυμα έφτασε, μια ειδοποίηση λέει μόνο «Νέο μήνυμα», μια κλήση χτυπά χωρίς όνομα και απαντιέται με το PIN, και μια υπενθύμιση της Συνομιλίας με τον εαυτό μου λέει μόνο «Υπενθύμιση». Γι’ αυτό το κλειδί τους φυλάγεται κρυπτογραφημένο μαζί με τον χώρο, οπότε όποιος ανοίξει τον χώρο και αντιγράψει ό,τι κρατά το τηλέφωνο θα μπορούσε να τις ανοίξει κι αυτός· το PIN εξακολουθεί να τις κρατά κρυμμένες.',
  'Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the server until you open them.':
    'Κλειστές, τίποτα δεν διαβάζει αυτές τις κρυφές συνομιλίες: το κλειδί τους είναι μόνο πίσω από το PIN, και τα μηνύματά τους περιμένουν στον server μέχρι να τις ανοίξεις.',
  'Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.':
    'Οι δικοί τους λογαριασμοί Matrix, XMPP και Nostr μένουν κι αυτοί συνδεδεμένοι: ό,τι έρχεται εκεί λέει μόνο «Νέο μήνυμα», και μια κλήση χτυπά χωρίς όνομα.',
  'Their own Matrix, XMPP and Nostr accounts connect only while they are open.':
    'Οι δικοί τους λογαριασμοί Matrix, XMPP και Nostr συνδέονται μόνο όσο αυτές είναι ανοιχτές.',
  // What waits in hidden chats, through their relay only (lib/waiting.ts).
  "Waiting. {reason} It goes by itself once the server can take it.": "Σε αναμονή. {reason} Φεύγει μόνο του μόλις το πάρει ο server.",
  "The voice message waits, and goes by itself once the server can take it.": "Το φωνητικό μήνυμα περιμένει, και φεύγει μόνο του μόλις το πάρει ο server.",
  "Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.":
    "Κλειστές, αυτές οι κρυφές συνομιλίες δεν στέλνουν τίποτα: φεύγει όσο είναι ανοιχτές, εκτός αν ανοίξεις τη «Λήψη όσο είναι κλειστές» στην κορυφή.",
};
