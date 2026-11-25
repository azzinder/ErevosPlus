// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Τα ελληνικά του αντιγράφου σε server (lib/backup-cloud.ts, app/backup.tsx, Ρυθμίσεις →
// Δεδομένα και συσκευές → Αντίγραφα ασφαλείας) (i18n/el/index.ts).
export const cloudBackup: Record<string, string> = {
  'Made a backup in {folder}, but it did not go to the server. {error}': 'Έγινε αντίγραφο στο {folder}, αλλά δεν πήγε στον server. {error}',
  'Made a backup in {folder} and sent it to {server}.': 'Έγινε αντίγραφο στο {folder} και στάλθηκε στο {server}.',
  'Stop sending to the server': 'Τέλος η αποστολή στον server',
  'Automatic backups will go only to the folder from now on. Those already on the server stay there until you delete them.':
    'Τα αυτόματα αντίγραφα θα πηγαίνουν από τώρα μόνο στον φάκελο. Όσα είναι ήδη στον server μένουν εκεί μέχρι να τα σβήσεις.',
  'Backups no longer go to the server.': 'Τα αντίγραφα δεν πηγαίνουν πια στον server.',
  'To a server too': 'Και σε server',
  'To {server}': 'Στο {server}',
  'Last one sent {when}.': 'Το τελευταίο στάλθηκε {when}.',
  'None sent yet.': 'Δεν έχει σταλεί κανένα ακόμα.',
  'Each automatic backup goes there too, and the server keeps the {n} newest.': 'Κάθε αυτόματο αντίγραφο πηγαίνει και εκεί, και ο server κρατά τα {n} πιο πρόσφατα.',
  'The last one did not go: {error} Erevos tries again next time it opens.': 'Το τελευταίο δεν πήγε: {error} Το Erevos ξαναδοκιμάζει την επόμενη φορά που θα ανοίξει.',
  'Stop sending': 'Τέλος η αποστολή',
  'Folder address (WebDAV)': 'Διεύθυνση φακέλου (WebDAV)',
  'In Nextcloud: Files → Files settings → WebDAV gives the start; add a folder you made for backups, like …/remote.php/dav/files/NAME/Backups':
    'Στο Nextcloud: Αρχεία → Ρυθμίσεις αρχείων → WebDAV δίνει την αρχή· πρόσθεσε έναν φάκελο που έφτιαξες για τα αντίγραφα, π.χ. …/remote.php/dav/files/ΟΝΟΜΑ/Backups',
  'User name': 'Όνομα χρήστη',
  "Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.":
    'Καλύτερα ένας κωδικός εφαρμογής μόνο για το Erevos, από τις ρυθμίσεις ασφαλείας του server: τον παίρνεις πίσω από εκεί χωρίς να αλλάξεις τον δικό σου.',
  'Add a server': 'Προσθήκη server',
  'That is not a folder address. It starts with https://': 'Αυτό δεν είναι διεύθυνση φακέλου. Αρχίζει με https://',
  'The address has to start with https://, so the password and backups go encrypted.':
    'Η διεύθυνση πρέπει να αρχίζει με https://, ώστε ο κωδικός και τα αντίγραφα να πηγαίνουν κρυπτογραφημένα.',
  'Put the user name and password in their own fields, not in the address.': 'Βάλε το όνομα χρήστη και τον κωδικό στα δικά τους πεδία, όχι στη διεύθυνση.',
  'The server did not take that user name and password.': 'Ο server δεν δέχτηκε αυτό το όνομα χρήστη και τον κωδικό.',
  'That folder is not on the server. Make it there first.': 'Αυτός ο φάκελος δεν υπάρχει στον server. Φτιάξ’ τον εκεί πρώτα.',
  'The server has no room left for it.': 'Ο server δεν έχει άλλο χώρο γι’ αυτό.',
  'The server answered {status}.': 'Ο server απάντησε {status}.',
  'Could not reach the server. {error}': 'Δεν βρέθηκε ο server. {error}',
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, when one comes and roughly how big it is, and your address unless the backup goes through Tor, as the space's Tor setting says. Nothing goes until you add one.":
    "Κάθε αυτόματο αντίγραφο μπορεί να πηγαίνει και σε έναν φάκελο σε server που διαλέγεις εσύ, όπως το Nextcloud σου, μέσω WebDAV. Ο server παίρνει τυχαία bytes με τυχαίο όνομα: δεν μπορεί να τα ανοίξει ούτε να καταλάβει ότι είναι του Erevos. Βλέπει όμως τον λογαριασμό σου, πότε έρχεται ένα και περίπου πόσο μεγάλο είναι, και τη διεύθυνσή σου, εκτός αν το αντίγραφο πηγαίνει μέσω Tor, όπως λέει η ρύθμιση Tor του χώρου. Τίποτα δεν στέλνεται μέχρι να προσθέσεις server.",
  "This space sends Everything through Tor, and Tor here cannot reach a server, so nothing went to it.":
    "Αυτός ο χώρος στέλνει τα Όλα μέσω Tor, και το Tor εδώ δεν μπορεί να φτάσει σε server, οπότε δεν πήγε τίποτα.",
  "There is no Erevos backup in that folder.":
    "Δεν υπάρχει αντίγραφο του Erevos σε αυτόν τον φάκελο.",
  "Restore from a server":
    "Επαναφορά από server",
  "The folder on your server that automatic backups went to. The password is used for this restore only and not kept.":
    "Ο φάκελος στον server σου όπου πήγαιναν τα αυτόματα αντίγραφα. Ο κωδικός χρησιμοποιείται μόνο για αυτή την επαναφορά και δεν κρατιέται.",
  "Look there":
    "Αναζήτηση εκεί",
  "Backups on {server}, newest first. Choose one, then type its password.":
    "Αντίγραφα στο {server}, τα νεότερα πρώτα. Διάλεξε ένα και μετά γράψε τον κωδικό του.",
  "In a browser the server has to let the web app in (CORS), and this one did not, or could not be reached.":
    "Σε έναν browser ο server πρέπει να αφήνει το web app να μπει (CORS), και αυτός δεν το άφησε ή δεν βρέθηκε.",
  "Erevos forgets the server and its password here. The backups already on it stay there until you delete them.":
    "Το Erevos ξεχνά εδώ τον server και τον κωδικό του. Τα αντίγραφα που είναι ήδη εκεί μένουν μέχρι να τα σβήσεις.",
  "Send a backup there now and then; the server keeps the {n} newest.":
    "Στέλνε εκεί ένα αντίγραφο πού και πού· ο server κρατά τα {n} πιο πρόσφατα.",
  "The last one did not go: {error}":
    "Το τελευταίο δεν πήγε: {error}",
  "Send a backup now":
    "Αποστολή αντιγράφου τώρα",
  "A backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV, each time you send one. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Ένα αντίγραφο μπορεί να πηγαίνει και σε έναν φάκελο σε server που διαλέγεις εσύ, όπως το Nextcloud σου, μέσω WebDAV, κάθε φορά που στέλνεις ένα. Ο server παίρνει τυχαία bytes με τυχαίο όνομα: δεν μπορεί να τα ανοίξει ούτε να καταλάβει ότι είναι του Erevos. Βλέπει όμως τον λογαριασμό σου, τη διεύθυνσή σου, πότε έρχεται ένα και περίπου πόσο μεγάλο είναι. Τίποτα δεν στέλνεται μέχρι να προσθέσεις server.",
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Κάθε αυτόματο αντίγραφο μπορεί να πηγαίνει και σε έναν φάκελο σε server που διαλέγεις εσύ, όπως το Nextcloud σου, μέσω WebDAV. Ο server παίρνει τυχαία bytes με τυχαίο όνομα: δεν μπορεί να τα ανοίξει ούτε να καταλάβει ότι είναι του Erevos. Βλέπει όμως τον λογαριασμό σου, τη διεύθυνσή σου, πότε έρχεται ένα και περίπου πόσο μεγάλο είναι. Τίποτα δεν στέλνεται μέχρι να προσθέσεις server.",
  "In a browser this works only with a server set to let the web app in (CORS), which Nextcloud is not as it comes. The desktop app and Android need nothing of it.":
    "Σε έναν browser αυτό δουλεύει μόνο με server ρυθμισμένο να αφήνει το web app να μπει (CORS), όπως δεν είναι το Nextcloud από μόνο του. Η εφαρμογή υπολογιστή και το Android δεν χρειάζονται τίποτα τέτοιο.",
  "A backup larger than {size} MB does not come from a server. Download it from the server and tap Restore a backup.": "Ένα αντίγραφο μεγαλύτερο από {size} MB δεν έρχεται από server. Κατέβασέ το από τον server και πάτα Επαναφορά αντιγράφου.",
  "Automatic backups need a folder on {device}: choose one.":
    "Τα αυτόματα αντίγραφα χρειάζονται έναν φάκελο σε {device}: διάλεξε έναν.",
  "Sent a backup to {server}.":
    "Στάλθηκε αντίγραφο στο {server}.",
  "Making the backup: photos, files and voice messages, {percent}%…":
    "Γίνεται το αντίγραφο: φωτογραφίες, αρχεία και φωνητικά μηνύματα, {percent}%…",
  "Putting back photos, files and voice messages: {percent}%…":
    "Επαναφορά φωτογραφιών, αρχείων και φωνητικών μηνυμάτων: {percent}%…",
  "Choose the files":
    "Επιλογή αρχείων",
  "Choose the folder":
    "Επιλογή φακέλου",
  "No folder on {device} yet":
    "Ακόμα κανένας φάκελος σε {device}",
  "These automatic backups came with a backup made on another device, with their password; the folder they went to stays with that device. Choose a folder here, and they go on into it.":
    "Αυτά τα αυτόματα αντίγραφα ήρθαν με ένα αντίγραφο από άλλη συσκευή, μαζί με τον κωδικό τους· ο φάκελος όπου πήγαιναν μένει σε εκείνη τη συσκευή. Διάλεξε εδώ έναν φάκελο, και συνεχίζουν σε αυτόν.",
  "Until then they go only to the server.":
    "Μέχρι τότε πηγαίνουν μόνο στον server.",
  "Choose a folder":
    "Επιλογή φακέλου",
  "What stays with each device and comes with no backup: the fingerprint, the folders Erevos may write in, what the phone lets it do and which apps make calls and send SMS. An XMPP account comes back as a new device of itself, and Matrix asks you to sign in again.":
    "Μένουν σε κάθε συσκευή και δεν έρχονται με κανένα αντίγραφο: το δακτυλικό αποτύπωμα, οι φάκελοι όπου μπορεί να γράφει το Erevos, ό,τι του επιτρέπει το τηλέφωνο και ποιες εφαρμογές κάνουν τις κλήσεις και στέλνουν τα SMS. Ένας λογαριασμός XMPP επιστρέφει ως νέα συσκευή του ίδιου λογαριασμού, και το Matrix σού ζητά να συνδεθείς ξανά.",
  "Its photos, files and voice messages are in {n} more file beside it, with the same start: keep them together.":
    "Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματά του είναι σε {n} ακόμα αρχείο δίπλα του, με την ίδια αρχή στο όνομα: κράτα τα μαζί.",
  "Its photos, files and voice messages are in {n} more files beside it, with the same start: keep them together.":
    "Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματά του είναι σε {n} ακόμα αρχεία δίπλα του, με την ίδια αρχή στο όνομα: κράτα τα μαζί.",
  "A file of this backup is not there: {name}.":
    "Ένα αρχείο αυτού του αντιγράφου δεν βρίσκεται εκεί: {name}.",
  "{n} files of this backup are not there, {name} among them.":
    "{n} αρχεία αυτού του αντιγράφου δεν βρίσκονται εκεί, ανάμεσά τους το {name}.",
  "This backup's photos, files and voice messages are in {n} more file beside it, whose name starts as its own or as an earlier backup's. Choose it.":
    "Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα αυτού του αντιγράφου είναι σε {n} ακόμα αρχείο δίπλα του, με όνομα που αρχίζει όπως του αντιγράφου ή όπως ενός παλαιότερου. Διάλεξέ το.",
  "This backup's photos, files and voice messages are in {n} more files beside it, whose names start as its own or as an earlier backup's. Choose them all.":
    "Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα αυτού του αντιγράφου είναι σε {n} ακόμα αρχεία δίπλα του, με ονόματα που αρχίζουν όπως του αντιγράφου ή όπως ενός παλαιότερου. Διάλεξέ τα όλα.",
  "This backup's photos, files and voice messages are in {n} more file beside it. Choose the folder the backup is in.":
    "Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα αυτού του αντιγράφου είναι σε {n} ακόμα αρχείο δίπλα του. Διάλεξε τον φάκελο όπου είναι το αντίγραφο.",
  "This backup's photos, files and voice messages are in {n} more files beside it. Choose the folder the backup is in.":
    "Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα αυτού του αντιγράφου είναι σε {n} ακόμα αρχεία δίπλα του. Διάλεξε τον φάκελο όπου είναι το αντίγραφο.",
  "A file of this backup is missing: {name}. Nothing was changed.":
    "Λείπει ένα αρχείο αυτού του αντιγράφου: {name}. Δεν άλλαξε τίποτα.",
  "A file of this backup is damaged, or belongs to another backup: {name}. Nothing was changed.":
    "Ένα αρχείο αυτού του αντιγράφου είναι χαλασμένο ή ανήκει σε άλλο αντίγραφο: {name}. Δεν άλλαξε τίποτα.",
  "A file of this backup is damaged, or belongs to another backup: {name}.":
    "Ένα αρχείο αυτού του αντιγράφου είναι χαλασμένο ή ανήκει σε άλλο αντίγραφο: {name}.",
  "Restore everything else without it? The photos, files and voice messages on {device} stay as they are, and those it holds do not come back.":
    "Επαναφορά όλων των άλλων χωρίς αυτό; Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα σε {device} μένουν όπως είναι, και όσα κρατά αυτό δεν επιστρέφουν.",
  "Restore everything else without them? The photos, files and voice messages on {device} stay as they are, and those they hold do not come back.":
    "Επαναφορά όλων των άλλων χωρίς αυτά; Οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα σε {device} μένουν όπως είναι, και όσα κρατούν αυτά δεν επιστρέφουν.",
  "Restore the rest":
    "Επαναφορά των υπολοίπων",
  "Restored without {n} file of the backup, {name}: the photos, files and voice messages in it did not come back.":
    "Επανήλθε χωρίς {n} αρχείο του αντιγράφου, το {name}: οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα που είχε δεν επέστρεψαν.",
  "Restored without {n} files of the backup, {name} among them: the photos, files and voice messages in them did not come back.":
    "Επανήλθε χωρίς {n} αρχεία του αντιγράφου, ανάμεσά τους το {name}: οι φωτογραφίες, τα αρχεία και τα φωνητικά μηνύματα που είχαν δεν επέστρεψαν.",
  "What takes room":
    "Τι πιάνει χώρο",
  "How much room Erevos takes on {device}, by kind: each automatic backup holds it all. Only the files’ names and sizes are looked at, here, and nothing is sent.":
    "Πόσο χώρο πιάνει το Erevos σε {device}, ανά είδος: κάθε αυτόματο αντίγραφο τα περιέχει όλα. Κοιτάζονται μόνο τα ονόματα και τα μεγέθη των αρχείων, εδώ, και δεν στέλνεται τίποτα.",
  "In all: {size}":
    "Συνολικά: {size}",
  "Measure":
    "Μέτρηση",
  "Measure again":
    "Νέα μέτρηση",
  "The Collection, and photos and files in chats":
    "Η Συλλογή, και φωτογραφίες και αρχεία στις συνομιλίες",
  "Contact pictures":
    "Φωτογραφίες επαφών",
  "Chat history":
    "Ιστορικό συνομιλιών",
  "Backups kept inside Erevos":
    "Αντίγραφα ασφαλείας μέσα στο Erevos",
  "Left over from writes that did not end":
    "Υπολείμματα από εγγραφές που δεν ολοκληρώθηκαν",
  "Cache":
    "Κρυφή μνήμη",
  "Other: {name}":
    "Άλλα: {name}",
  "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.":
    "Κάποια από όσα κρατά ένα μέρος δεν διαβάστηκαν, οπότε τίποτα δεν θεωρείται υπόλειμμα. Δοκίμασε ξανά αργότερα.",
  "Nothing opens with that. Check it and type it again.":
    "Δεν ανοίγει τίποτα με αυτό. Έλεγξέ το και γράψ' το ξανά.",
  "Opened {opened} of {count}; they are read with the rest.":
    "Άνοιξαν {opened} από {count}· διαβάζονται με τα υπόλοιπα.",
  "Opened, and it is read with the rest.":
    "Άνοιξε, και διαβάζεται μαζί με τα υπόλοιπα.",
  "That one is read already.":
    "Αυτό διαβάζεται ήδη.",
  "Delete the leftovers?":
    "Διαγραφή των υπολειμμάτων;",
  "{size} of photos and files that none of the places read here names (places read: {n}). A place you did not open here loses its photos and files for good: open every one first. Backups already made keep them.":
    "{size} φωτογραφιών και αρχείων που δεν τα αναφέρει κανένα από τα μέρη που διαβάστηκαν εδώ (μέρη: {n}). Ένα μέρος που δεν άνοιξες εδώ χάνει τις φωτογραφίες και τα αρχεία του για πάντα: άνοιξε πρώτα όλα. Τα αντίγραφα ασφαλείας που έχουν ήδη γίνει τα κρατούν.",
  "{size} freed.":
    "Ελευθερώθηκαν {size}.",
  "Photos and files that nothing on the phone names any more, as those of an import that stopped in its middle, stay on it and in every backup. Only a place opened with its key can say which are its own: so first type here, one at a time or several at once separated by commas or spaces, the PIN of each of your hidden chats and the password of any other space you have. This space is read by itself. Nothing is deleted before you see how much and say so; a file written in the last day is never taken.":
    "Φωτογραφίες και αρχεία που δεν τα αναφέρει πια τίποτα στο τηλέφωνο, όπως όσα έμειναν από μια εισαγωγή που κόπηκε στη μέση, μένουν σε αυτό και σε κάθε αντίγραφο ασφαλείας. Μόνο ένα μέρος ανοιγμένο με το κλειδί του μπορεί να πει ποια είναι δικά του: γι' αυτό γράψε πρώτα εδώ, ένα ένα ή πολλά μαζί χωρισμένα με κόμμα ή κενό, το PIN καθεμιάς από τις κρυφές σου συνομιλίες και τον κωδικό κάθε άλλου χώρου που έχεις. Αυτός ο χώρος διαβάζεται μόνος του. Τίποτα δεν σβήνεται πριν δεις πόσα είναι και πεις ναι· ένα αρχείο που γράφτηκε την τελευταία μέρα δεν πιάνεται ποτέ.",
  "PIN or password":
    "PIN ή κωδικός",
  "Read with this space: {n}":
    "Διαβάζονται μαζί με αυτόν τον χώρο: {n}",
  "Leftovers: {size} in {n} chunks.":
    "Υπολείμματα: {size} σε {n} κομμάτια.",
  "No leftovers.":
    "Δεν υπάρχουν υπολείμματα.",
  "Find leftovers":
    "Εύρεση υπολειμμάτων",
  "Delete them":
    "Διαγραφή τους",
  "Leftovers":
    "Υπολείμματα",
  "The backup itself is not there.":
    "Το ίδιο το αντίγραφο δεν είναι εκεί.",
  "It is not made with the automatic backups’ password, so it cannot be checked here.":
    "Δεν έγινε με τον κωδικό των αυτόματων αντιγράφων, οπότε δεν ελέγχεται εδώ.",
  "The backup itself is damaged: {error}":
    "Το ίδιο το αντίγραφο είναι χαλασμένο: {error}",
  "There is no backup there.":
    "Δεν υπάρχει αντίγραφο εκεί.",
  "Check the backups":
    "Έλεγχος αντιγράφων",
  "After each automatic backup Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two of them, picked at random, are read through and open too. Of the server it then only looks at what is listed there, so nothing is downloaded. Check now also downloads the server’s newest backup and ten of its parts, and reads ten in the folder.":
    "Μετά από κάθε αυτόματο αντίγραφο το Erevos το ξαναδιαβάζει από τον φάκελο: ανοίγει με τον κωδικό του, κάθε κομμάτι που αναφέρει είναι εκεί, στο μέγεθός του, και δύο από αυτά, στην τύχη, διαβάζονται ολόκληρα και ανοίγουν κι αυτά. Από τον server κοιτάζει τότε μόνο τι υπάρχει στη λίστα του, οπότε δεν κατεβαίνει τίποτα. Ο «Έλεγχος τώρα» κατεβάζει επίσης το νεότερο αντίγραφο του server και δέκα κομμάτια του, και διαβάζει δέκα στον φάκελο.",
  "Checking…":
    "Έλεγχος…",
  "Check now":
    "Έλεγχος τώρα",
  "{place}: not checked yet.":
    "{place}: δεν έχει ελεγχθεί ακόμα.",
  "{place}, {when}: {error}":
    "{place}, {when}: {error}",
  "{place}, {when}: of its {parts} parts, {missing} are missing and {damaged} are not as made. A restore would lack their photos and files. Back up now, then check again.":
    "{place}, {when}: από τα {parts} κομμάτια του, λείπουν {missing} και {damaged} δεν είναι όπως φτιάχτηκαν. Μια επαναφορά θα έχανε τις φωτογραφίες και τα αρχεία τους. Κάνε αντίγραφο τώρα και έλεγξε ξανά.",
  "{place}, {when}: whole. It opens, all {parts} parts are there, and the {read} read through open too.":
    "{place}, {when}: ακέραιο. Ανοίγει, και τα {parts} κομμάτια είναι εκεί, και τα {read} που διαβάστηκαν ολόκληρα ανοίγουν κι αυτά.",
  "{place}, {when}: the backup and all {parts} parts are there, each of its size.":
    "{place}, {when}: το αντίγραφο και όλα τα {parts} κομμάτια είναι εκεί, το καθένα στο μέγεθός του.",
  "Stopped after {done} of {count} parts.":
    "Σταμάτησε μετά από {done} από {count} κομμάτια.",
  "Checking the parts: {done} of {count}":
    "Έλεγχος κομματιών: {done} από {count}",
  "Full check of the folder":
    "Πλήρης έλεγχος φακέλου",
  "The full check reads every part in the folder through and compares it with the SHA-256 the backup wrote down for it. It takes a few minutes for many GB, and nothing leaves the phone.":
    "Ο πλήρης έλεγχος διαβάζει ολόκληρο κάθε κομμάτι στον φάκελο και το συγκρίνει με το SHA-256 που κράτησε γι' αυτό το αντίγραφο. Για πολλά GB θέλει λίγα λεπτά, και τίποτα δεν φεύγει από το κινητό.",
  "The check after it found a problem: {error}":
    "Ο έλεγχος μετά βρήκε πρόβλημα: {error}",
  "The check after it found {missing} of its {parts} parts missing and {damaged} damaged.":
    "Ο έλεγχος μετά βρήκε ότι από τα {parts} κομμάτια του λείπουν {missing} και {damaged} είναι χαλασμένα.",
  "Making the backup…": "Δημιουργία αντιγράφου…",
  "Gathering chats, contacts, SMS, calls and settings…": "Συγκέντρωση συνομιλιών, επαφών, SMS, κλήσεων και ρυθμίσεων…",
  "Encrypting and saving…": "Κρυπτογράφηση και αποθήκευση…",
  "Encrypting photos, files and voice messages…": "Κρυπτογράφηση φωτογραφιών, αρχείων και φωνητικών μηνυμάτων…",
  "Keep Erevos open until it is done: a notice says when.": "Κράτα το Erevos ανοιχτό μέχρι να τελειώσει: μια ειδοποίηση θα σου το πει.",
  "Backup made": "Το αντίγραφο έγινε",
  "{name} ({size}) is saved in {folder}.": "Το {name} ({size}) αποθηκεύτηκε στο {folder}.",
  "Encrypting and sending…": "Κρυπτογράφηση και αποστολή…",
  "Sent a backup to {server}: {total}.": "Στάλθηκε αντίγραφο στο {server}: {total}.",
  "Or to {server}, your server: it gets the backup encrypted, under a random name.": "Ή στο {server}, τον server σου: παίρνει το αντίγραφο κρυπτογραφημένο, με τυχαίο όνομα.",
  "Or to a folder on a server of yours over WebDAV, such as Nextcloud: it gets the backup encrypted, under a random name.": "Ή σε φάκελο σε δικό σου server μέσω WebDAV, όπως το Nextcloud: παίρνει το αντίγραφο κρυπτογραφημένο, με τυχαίο όνομα.",
  "To a server (WebDAV)": "Σε server (WebDAV)",
  "Sent a backup to {server}, with {n} file beside it: {total} in all.": "Στάλθηκε αντίγραφο στο {server}, με {n} αρχείο δίπλα του: {total} συνολικά.",
  "Sent a backup to {server}, with {n} files beside it: {total} in all.": "Στάλθηκε αντίγραφο στο {server}, με {n} αρχεία δίπλα του: {total} συνολικά.",
  "The backup itself is there, but not of the size it was sent with.": "Το ίδιο το αντίγραφο είναι εκεί, αλλά όχι με το μέγεθος που στάλθηκε.",
  "A backup of {total} in all went to {server}.": "Ένα αντίγραφο {total} συνολικά πήγε στο {server}.",
  "{name} and {n} file beside it, {total} in all, are saved in {folder}.": "Το {name} και {n} αρχείο δίπλα του, {total} συνολικά, αποθηκεύτηκαν στο {folder}.",
  "{name} and {n} files beside it, {total} in all, are saved in {folder}.": "Το {name} και {n} αρχεία δίπλα του, {total} συνολικά, αποθηκεύτηκαν στο {folder}.",
  "A backup sent by hand goes whole each time, with every photo and file: up to about {size} now.":
    "Ένα αντίγραφο που στέλνεται με το χέρι πηγαίνει ολόκληρο κάθε φορά, με κάθε φωτογραφία και αρχείο: έως περίπου {size} τώρα.",
  "A backup sent by hand goes whole each time, with every photo and file.":
    "Ένα αντίγραφο που στέλνεται με το χέρι πηγαίνει ολόκληρο κάθε φορά, με κάθε φωτογραφία και αρχείο.",
  "With automatic backups on, only what is new goes each time.":
    "Με τα αυτόματα αντίγραφα ανοιχτά, πηγαίνει κάθε φορά μόνο ό,τι είναι νέο.",
  "The server keeps the {n} newest whole.":
    "Ο server κρατά τα {n} πιο πρόσφατα ολόκληρα.",
};
