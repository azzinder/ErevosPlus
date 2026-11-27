// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of settings that stand apart: Tor bridges, unlocking with a fingerprint, colors, languages (i18n/el/index.ts).
export const more: Record<string, string> = {
  // Tor bridges (the Tor screen).
  Bridges: 'Γέφυρες',
  'Automatic': 'Αυτόματα',
  'straight': 'απευθείας',
  'your own bridges': 'τις δικές σου γέφυρες',
  'Tor is off for this space: messages go straight to the server.': 'Το Tor είναι κλειστό σε αυτόν τον χώρο: τα μηνύματα πάνε κατευθείαν στον server.',
  'Tor is connected, {how}.': 'Το Tor συνδέθηκε, {how}.',
  'Tor is connected.': 'Το Tor συνδέθηκε.',
  'Tor cannot connect from this network. Try Automatic, or bridges of your own.': 'Το Tor δεν μπορεί να συνδεθεί από αυτό το δίκτυο. Δοκίμασε το Αυτόματα, ή δικές σου γέφυρες.',
  'Erevos tries the ways in turn until Tor connects: straight, then the obfs4 bridges, then Snowflake, then your own bridges, if you have any. It remembers the one that worked on Wi-Fi and on mobile data for 30 days, and tries it first.': 'Το Erevos δοκιμάζει τους τρόπους με τη σειρά ώσπου να συνδεθεί το Tor: απευθείας, μετά τις γέφυρες obfs4, μετά το Snowflake, μετά τις δικές σου γέφυρες, αν έχεις. Θυμάται για 30 μέρες αυτόν που δούλεψε στο Wi-Fi και στα δεδομένα κινητής, και τον δοκιμάζει πρώτο.',
  'My network is watched': 'Το δίκτυό μου παρακολουθείται',
  'On, Tor never goes straight: whoever watches the network sees only a bridge, never that Tor is used.': 'Ανοιχτό, το Tor δεν πάει ποτέ απευθείας: όποιος παρακολουθεί το δίκτυο βλέπει μόνο μια γέφυρα, ποτέ ότι χρησιμοποιείται Tor.',
  'Trying: {how}…': 'Δοκιμή: {how}…',
  'Connected: {how}.': 'Συνδέθηκε: {how}.',
  'No way worked from this network. Add bridges of your own, from bridges.torproject.org.': 'Κανένας τρόπος δεν δούλεψε από αυτό το δίκτυο. Πρόσθεσε δικές σου γέφυρες, από το bridges.torproject.org.',
  'Check my connection': 'Έλεγξε τη σύνδεσή μου',
  'No bridges': 'Χωρίς γέφυρες',
  'My own': 'Δικές μου',
  'None of these is a bridge Erevos can use, so Tor stays off and messages wait.':
    'Καμία από αυτές δεν είναι γέφυρα που μπορεί να χρησιμοποιήσει το Erevos, οπότε το Tor μένει κλειστό και τα μηνύματα περιμένουν.',
  'None of these is a bridge Erevos can use, so Tor stays off and messages go straight.':
    'Καμία από αυτές δεν είναι γέφυρα που μπορεί να χρησιμοποιήσει το Erevos, οπότε το Tor μένει κλειστό και τα μηνύματα πάνε κατευθείαν.',
  'Tor goes straight to its relays. Where Tor is blocked, choose bridges: Tor then reaches its network only through them.':
    'Το Tor πηγαίνει κατευθείαν στους αναμεταδότες του. Όπου το Tor είναι μπλοκαρισμένο, διάλεξε γέφυρες: τότε το Tor φτάνει στο δίκτυό του μόνο μέσα από αυτές.',
  'The obfs4 bridges Tor Browser comes with: to whoever watches the network, Tor looks like random bytes. Where a censor blocks these too, choose Snowflake or bridges of your own.':
    'Οι γέφυρες obfs4 που έχει ο Tor Browser: σε όποιον παρακολουθεί το δίκτυο, το Tor μοιάζει με τυχαία bytes. Όπου ένας λογοκριτής μπλοκάρει κι αυτές, διάλεξε Snowflake ή δικές σου γέφυρες.',
  "Snowflake goes through volunteers' browsers, over WebRTC, the way a video call does. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block.":
    'Το Snowflake περνά μέσα από browsers εθελοντών, με WebRTC, όπως μια βιντεοκλήση. Για να βρει έναν, το Erevos ρωτά τον broker του Snowflake μέσω ενός CDN, πίσω από το όνομα άλλου site, και διακομιστές STUN λένε στο τηλέφωνο τη δική του διεύθυνση: βλέπουν αυτή τη διεύθυνση, ποτέ τα μηνύματά σου. Πιο αργό, και δύσκολο να μπλοκαριστεί.',
  'Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, one per line. obfs4, Snowflake, WebTunnel, meek and plain bridges work.':
    'Γραμμές γεφυρών από το bridges.torproject.org, από το bridges@torproject.org με email, ή από το @GetBridgesBot στο Telegram, μία ανά γραμμή. Δουλεύουν obfs4, Snowflake, WebTunnel, meek και απλές γέφυρες.',
  'Bridge lines': 'Γραμμές γεφυρών',
  'Not a bridge line Erevos can use: {line}': 'Δεν είναι γραμμή γέφυρας που μπορεί να χρησιμοποιήσει το Erevos: {line}',
  '{n} bridge': '{n} γέφυρα',
  '{n} bridges': '{n} γέφυρες',
  'Use these bridges': 'Χρήση αυτών των γεφυρών',
  'Not in use until you tap Use these bridges.': 'Δεν χρησιμοποιούνται μέχρι να πατήσεις «Χρήση αυτών των γεφυρών».',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages wait. Bridges count only while Tor is on.':
    'Με γέφυρες, το Tor δεν πηγαίνει ποτέ κατευθείαν στους αναμεταδότες του: όταν καμία γέφυρα δεν απαντά, τα μηνύματα περιμένουν. Οι γέφυρες μετράνε μόνο όσο το Tor είναι ενεργό.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages go to the server without Tor until one does.':
    'Με γέφυρες, το Tor δεν πηγαίνει ποτέ κατευθείαν στους αναμεταδότες του: όταν καμία γέφυρα δεν απαντά, τα μηνύματα πάνε στον server χωρίς Tor μέχρι να απαντήσει κάποια.',

  // Updates on Windows, and on every computer: the file to take.
  'The download page opens: take {file}, see User guide → Updates.': 'Ανοίγει η σελίδα λήψης: πάρε το {file}, δες «Οδηγός χρήσης → Ενημερώσεις».',

  // Material You: the phone's own colors (Appearance).
  "Material You takes no glass: its colors are the phone's own.": 'Το Material You δεν παίρνει γυαλί: τα χρώματά του είναι του ίδιου του τηλεφώνου.',
  "Your phone's own colors, which Android makes from its wallpaper: a new wallpaper changes them here too.":
    'Τα χρώματα του ίδιου του τηλεφώνου σου, που τα φτιάχνει το Android από την ταπετσαρία του: μια νέα ταπετσαρία τα αλλάζει κι εδώ.',
  "Material You takes the phone's own colors, on Android 12 and later. Here it shows in Classic's.":
    'Το Material You παίρνει τα χρώματα του ίδιου του τηλεφώνου, σε Android 12 και νεότερο. Εδώ δείχνει με του Classic.',

  // Unlocking with a fingerprint or face (Lock, and the password screen).
  'Fingerprint or face': 'Δακτυλικό αποτύπωμα ή πρόσωπο',
  'On: Erevos opens with your fingerprint or face too. The password always works.':
    'Ενεργό: το Erevos ανοίγει και με το δακτυλικό σου αποτύπωμα ή το πρόσωπό σου. Ο κωδικός δουλεύει πάντα.',
  'Open Erevos with your fingerprint or face instead of typing the password. The password always works too.':
    'Άνοιξε το Erevos με το δακτυλικό σου αποτύπωμα ή το πρόσωπό σου αντί να γράφεις τον κωδικό. Ο κωδικός δουλεύει πάντα κι αυτός.',
  'It opens only what your first password opens, never the space of a second password or hidden chats. Someone who holds you can press your finger to the phone: if that may happen, keep it off.':
    'Ανοίγει μόνο ό,τι ανοίγει ο πρώτος σου κωδικός, ποτέ τον χώρο ενός δεύτερου κωδικού ή κρυφές συνομιλίες. Όποιος σε κρατά μπορεί να πιέσει το δάχτυλό σου στο τηλέφωνο: αν μπορεί να συμβεί αυτό, άφησέ το ανενεργό.',
  'Fingerprint or face for Erevos': 'Δακτυλικό αποτύπωμα ή πρόσωπο για το Erevos',
  'Erevos opens with your fingerprint or face too.': 'Το Erevos ανοίγει πια και με το δακτυλικό σου αποτύπωμα ή το πρόσωπό σου.',
  'Unlock Erevos': 'Ξεκλείδωμα του Erevos',
  'Use password': 'Με κωδικό',
  'Unlocking with a fingerprint or face stopped working, so it is off now. Type your password, and turn it on again in Lock.':
    'Το ξεκλείδωμα με δακτυλικό αποτύπωμα ή πρόσωπο σταμάτησε να δουλεύει, οπότε τώρα είναι ανενεργό. Γράψε τον κωδικό σου, και ενεργοποίησέ το ξανά στο Κλείδωμα.',
};
