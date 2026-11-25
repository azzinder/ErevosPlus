// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of the panic password (app/panic.tsx), the calculator in place of Erevos
// (components/launcher-icons.tsx), starting when the phone turns on (app/security.tsx), and their
// settings (lib/settings.ts) (i18n/el/index.ts).
export const guard: Record<string, string> = {
  // The panic password.
  "Panic password": "Κωδικός πανικού",
  "Set the panic password": "Ορισμός κωδικού πανικού",
  "Turn off the panic password": "Κλείσιμο του κωδικού πανικού",
  "Panic password set. Typed on the lock screen, it wipes Erevos.": "Ο κωδικός πανικού ορίστηκε. Αν γραφτεί στην οθόνη κλειδώματος, σβήνει το Erevos.",
  "Typed on the lock screen, it will then be only a wrong password.": "Στην οθόνη κλειδώματος θα είναι πια απλώς λάθος κωδικός.",
  "No panic password now.": "Δεν υπάρχει πια κωδικός πανικού.",
  "A password of its own that, typed on the lock screen, wipes Erevos as the button above does. The screen then looks as after a wrong password, and checking it takes as long as any other. It must differ from every password of your spaces.":
    "Ένας δικός του κωδικός που, αν γραφτεί στην οθόνη κλειδώματος, σβήνει το Erevos όπως το κουμπί παραπάνω. Η οθόνη τότε φαίνεται όπως μετά από λάθος κωδικό, και ο έλεγχός του κρατά όσο κάθε άλλου. Πρέπει να διαφέρει από κάθε κωδικό των χώρων σου.",
  "Erevos keeps nothing that shows whether one is set, so this screen cannot say either. Setting it again replaces the one before.":
    "Το Erevos δεν κρατά τίποτα που να δείχνει αν έχει οριστεί, οπότε ούτε αυτή η οθόνη μπορεί να το πει. Αν τον ορίσεις ξανά, αντικαθιστά τον προηγούμενο.",
  "Typed on the lock screen, it wipes everything Erevos keeps here.": "Αν γραφτεί στην οθόνη κλειδώματος, σβήνει ό,τι κρατά εδώ το Erevos.",
  // Starting when the phone turns on.
  "Start when the phone turns on": "Εκκίνηση όταν ανάβει το τηλέφωνο",
  "Wait until I open it": "Περιμένει να το ανοίξω",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open: the spaces set to say a message came also while another is open already say \"New message\", never which space, nor who or what. Everything else waits for a password, as Erevos keeps no key on the phone. Meanwhile a quiet notice says \"Locked\". Spaces that go through Tor say nothing until a space is open. With no such space, only a quiet notice says it is locked, and a tap on it opens Erevos.":
    "Αφού ανάψει το τηλέφωνο, ή αφού ενημερωθεί το Erevos, το Erevos ξεκινά μόνο του, χωρίς ανοιχτό χώρο: οι χώροι που λένε ότι ήρθε μήνυμα και όσο είναι ανοιχτός άλλος χώρος λένε ήδη «Νέο μήνυμα», ποτέ ποιος χώρος, ούτε ποιος ή τι. Όλα τα άλλα περιμένουν κωδικό, γιατί το Erevos δεν κρατά κανένα κλειδί στο τηλέφωνο. Στο μεταξύ μια ήσυχη ειδοποίηση λέει «Κλειδωμένο». Οι χώροι που πηγαίνουν μέσω Tor δεν λένε τίποτα μέχρι να ανοίξει ένας χώρος. Αν δεν υπάρχει τέτοιος χώρος, μόνο μια ήσυχη ειδοποίηση λέει ότι είναι κλειδωμένο, και ένα πάτημά της ανοίγει το Erevos.",
  "After the phone turns on, Erevos waits until you open it.": "Αφού ανάψει το τηλέφωνο, το Erevos περιμένει να το ανοίξεις.",
  // The calculator in place of Erevos.
  "Calculator in place of Erevos": "Αριθμομηχανή στη θέση του Erevos",
  "A calculator that works shows among the phone's apps instead of Erevos's icon. Type your code in it, then =, and Erevos opens, asking for its password as always. Only the icon is hidden: Android's list of apps, the notices and the recent apps still say Erevos.":
    "Μια αριθμομηχανή που δουλεύει φαίνεται στις εφαρμογές του κινητού αντί για το εικονίδιο του Erevos. Γράψε μέσα τον κωδικό σου, μετά =, και ανοίγει το Erevos, που ζητά τον κωδικό του όπως πάντα. Κρύβεται μόνο το εικονίδιο: η λίστα εφαρμογών του Android, οι ειδοποιήσεις και οι πρόσφατες εφαρμογές λένε ακόμα Erevos.",
  "On: the calculator stands in place of Erevos.": "Ενεργό: η αριθμομηχανή είναι στη θέση του Erevos.",
  "Change the code": "Αλλαγή κωδικού",
  "Show Erevos's icon again": "Δείξε ξανά το εικονίδιο του Erevos",
  "Put the calculator in its place": "Βάλε την αριθμομηχανή στη θέση του",
  "Calculator code": "Κωδικός αριθμομηχανής",
  "Digits only, 4 to 12 of them. Type them in the calculator, then =.": "Μόνο ψηφία, από 4 έως 12. Γράψ’ τα στην αριθμομηχανή, και μετά =.",
  "Use digits only, 4 to 12 of them.": "Μόνο ψηφία, από 4 έως 12.",
  "The calculator could not be set. Try again.": "Η αριθμομηχανή δεν μπόρεσε να μπει. Δοκίμασε ξανά.",
  "New code saved.": "Ο νέος κωδικός αποθηκεύτηκε.",
  "Done. Within a few seconds Erevos's icon leaves the phone's apps, and the calculator takes its place: open Erevos from it from now on.":
    "Έγινε. Σε λίγα δευτερόλεπτα το εικονίδιο του Erevos φεύγει από τις εφαρμογές του κινητού και τη θέση του παίρνει η αριθμομηχανή: από εδώ και πέρα άνοιγε το Erevos από αυτήν.",
  "Erevos's icon is back among the phone's apps.": "Το εικονίδιο του Erevos γύρισε στις εφαρμογές του κινητού.",
  "Hide Erevos's icon behind a calculator that works": "Κρύψε το εικονίδιο του Erevos πίσω από μια αριθμομηχανή που δουλεύει",
  "Erevos's camera at a tap, behind Erevos's password and the Collection's, as from the Collection. Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "Η κάμερα του Erevos με ένα πάτημα, πίσω από τον κωδικό του Erevos και της Συλλογής, όπως και από τη Συλλογή. Κρατώντας πατημένο το εικονίδιο του Erevos εμφανίζεται επίσης η Κάμερα. Κανένα από τα δύο δεν φαίνεται όσο η Συλλογή είναι κλειστή ή η αριθμομηχανή στέκεται στη θέση του Erevos.",
  "Put the Camera among the phone's apps":
    "Βάλε την Κάμερα στις εφαρμογές του κινητού",
  "Take the Camera off the phone's apps":
    "Βγάλε την Κάμερα από τις εφαρμογές του κινητού",
};
