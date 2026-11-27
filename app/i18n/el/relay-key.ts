// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of a relay proving its own key (lib/relay.ts, Channels; components/relay-key-note.tsx) (i18n/el/index.ts).
export const relayKey: Record<string, string> = {
  "✓ Your server proved its own key: no one in between can pass for it.": "✓ Ο server σου απέδειξε το δικό του κλειδί: κανείς ενδιάμεσος δεν μπορεί να περάσει για αυτόν.",
  "Your server does not prove its own key yet: it is older than this app. It works as before; once its operator updates it, Erevos checks its key every time.": "Ο server σου δεν αποδεικνύει ακόμη το δικό του κλειδί: είναι παλαιότερος από αυτή την εφαρμογή. Λειτουργεί όπως πριν· μόλις τον ενημερώσει ο διαχειριστής του, το Erevos ελέγχει το κλειδί του κάθε φορά.",
  "Forget the key kept for this server?": "Να ξεχαστεί το κλειδί που κρατά το Erevos για αυτόν τον server;",
  "Only when its operator told you it has a new key. Erevos then takes the key the server gives next, and checks it every time from then on.": "Μόνο αν ο διαχειριστής του σού είπε ότι έχει νέο κλειδί. Τότε το Erevos παίρνει το κλειδί που θα δώσει ο server την επόμενη φορά και το ελέγχει κάθε φορά από εκεί και πέρα.",
  "Forget it": "Να ξεχαστεί",
  "Your server did not prove the key Erevos keeps for it: someone may be in between, or it has a new key. Nothing goes to it until it proves it; your messages wait.": "Ο server σου δεν απέδειξε το κλειδί που κρατά το Erevos για αυτόν: μπορεί να είναι κάποιος στη μέση ή να έχει νέο κλειδί. Τίποτα δεν πηγαίνει σε αυτόν μέχρι να το αποδείξει· τα μηνύματά σου περιμένουν.",
  "It has a new key": "Έχει νέο κλειδί",
  "the server at {url} did not prove its key: someone may be in between, or the server has a new key": "ο server στο {url} δεν απέδειξε το κλειδί του: μπορεί να είναι κάποιος στη μέση ή ο server να έχει νέο κλειδί",
  "the server sent what its channel does not hold": "ο server έστειλε κάτι που δεν ανήκει στο κανάλι του",
  "the server has no channel": "ο server δεν έχει κανάλι",
};
