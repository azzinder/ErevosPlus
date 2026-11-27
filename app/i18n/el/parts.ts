// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Greek for parts (lib/i18n.ts).
export const parts: Record<string, string> = {
  // The password screen and the password sheet (lock/gate.tsx, components/PasswordSheet.tsx).
  'Enter your password': 'Γράψε τον κωδικό σου',
  Unlock: 'Ξεκλείδωμα',
  'Wrong password': 'Λάθος κωδικός',
  'Use at least {n} characters.': 'Χρησιμοποίησε τουλάχιστον {n} χαρακτήρες.',
  'The passwords do not match.': 'Οι κωδικοί δεν ταιριάζουν.',
  'Use a different password.': 'Χρησιμοποίησε άλλον κωδικό.',
  'New password': 'Νέος κωδικός',
  'Repeat password': 'Επανάληψη κωδικού',
  'Too many attempts. Try again in {n} minute.': 'Πάρα πολλές προσπάθειες. Δοκίμασε ξανά σε {n} λεπτό.',
  'Too many attempts. Try again in {n} minutes.': 'Πάρα πολλές προσπάθειες. Δοκίμασε ξανά σε {n} λεπτά.',
  'Too many attempts. Try again in {n} second.': 'Πάρα πολλές προσπάθειες. Δοκίμασε ξανά σε {n} δευτερόλεπτο.',
  'Too many attempts. Try again in {n} seconds.': 'Πάρα πολλές προσπάθειες. Δοκίμασε ξανά σε {n} δευτερόλεπτα.',

  // Small parts of screens.
  'QR code': 'Κωδικός QR',
  Group: 'Ομάδα',

  // Calls (components/call-screen.tsx, components/group-call-screen.tsx).
  'Call ended': 'Η κλήση τελείωσε',
  'They hung up': 'Έκλεισε τη γραμμή',
  'Turned down': 'Απορρίφθηκε',
  'They turned it down': 'Την απέρριψε',
  'They are in another call': 'Είναι σε άλλη κλήση',
  'Not answered': 'Δεν απάντησε',
  'The call could not connect': 'Η κλήση δεν μπόρεσε να συνδεθεί',
  'The call could not connect on their phone': 'Η κλήση δεν μπόρεσε να συνδεθεί στο τηλέφωνό του',
  'Calling…': 'Κλήση…',
  'Ringing…': 'Χτυπάει…',
  'Incoming video call': 'Εισερχόμενη βιντεοκλήση',
  'Incoming voice call': 'Εισερχόμενη φωνητική κλήση',
  'Connecting…': 'Σύνδεση…',
  'Missed call': 'Αναπάντητη κλήση',
  Decline: 'Απόρριψη',
  Answer: 'Απάντηση',
  Unmute: 'Ήχος',
  Mute: 'Σίγαση',
  Speaker: 'Ηχείο',
  'Camera on': 'Κάμερα ανοιχτή',
  'Camera off': 'Κάμερα κλειστή',
  Flip: 'Αλλαγή',
  End: 'Τέλος',
  'You started a group video call': 'Ξεκίνησες ομαδική βιντεοκλήση',
  'You started a group call': 'Ξεκίνησες ομαδική κλήση',
  '{name} started a group video call': '{name}: ξεκίνησε ομαδική βιντεοκλήση',
  '{name} started a group call': '{name}: ξεκίνησε ομαδική κλήση',
  'Waiting for others · {time}': 'Αναμονή για τους άλλους · {time}',
  'Missed group call': 'Αναπάντητη ομαδική κλήση',
  'Could not open the microphone': 'Το μικρόφωνο δεν άνοιξε',
  'Pictures pause with more than {n} in the call': 'Η εικόνα σταματά με περισσότερους από {n} στην κλήση',
  'Group video call · end-to-end encrypted': 'Ομαδική βιντεοκλήση · κρυπτογραφημένη από άκρη σε άκρη',
  'Group voice call · end-to-end encrypted': 'Ομαδική φωνητική κλήση · κρυπτογραφημένη από άκρη σε άκρη',
  'In the call': 'Στην κλήση',
  Join: 'Συμμετοχή',
  '{name} tried to call. Accept their message request to take calls from them.':
    '{name}: προσπάθησε να σε καλέσει. Αποδέξου το αίτημα μηνυμάτων για να δέχεσαι κλήσεις από αυτή την επαφή.',
  'The call ended.': 'Η κλήση τελείωσε.',
  'The call has ended.': 'Η κλήση έχει τελειώσει.',
  'Calls are set up through the server. Type its address in Server first.': 'Οι κλήσεις στήνονται μέσω του server. Γράψε πρώτα τη διεύθυνσή του στον «Server».',

  // The web app's card (components/integrity-card.tsx, lib/integrity.web.ts).
  'This web app': 'Αυτή η web εφαρμογή',
  'Release {version}, checked': 'Έκδοση {version}, ελεγμένη',
  'Not checked: no service worker runs Erevos here': 'Δεν ελέγχθηκε: κανένας service worker δεν τρέχει το Erevos εδώ',
  "Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is":
    'Το Erevos τρέχει μόνο κώδικα υπογεγραμμένο με το κλειδί εκδόσεών του, που φυλάγεται σε αυτή τη συσκευή. Το αποτύπωμα του κλειδιού είναι',
  '. It must match the one you were given with the address of this server.': '. Πρέπει να ταιριάζει με αυτό που σου δόθηκε μαζί με τη διεύθυνση αυτού του server.',
  'Release {version} is checked and starts the next time Erevos opens.': 'Η έκδοση {version} ελέγχθηκε και ξεκινά την επόμενη φορά που θα ανοίξει το Erevos.',
  'Last looked for updates {when}.': 'Τελευταίος έλεγχος για ενημερώσεις: {when}.',
  'Refused:': 'Απορρίφθηκαν:',
  'Looking…': 'Έλεγχος…',
  'Look for an update': 'Έλεγχος για ενημέρωση',
  'Notifications while closed': 'Ειδοποιήσεις όταν είναι κλειστό',
  'On in this space': 'Ενεργές σε αυτόν τον χώρο',
  'Off in this space': 'Ανενεργές σε αυτόν τον χώρο',
  'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.':
    'Όταν έρχονται μηνύματα, ή χτυπά μια κλήση, ενώ το Erevos είναι κλειστό, ο server σου στέλνει μια ειδοποίηση push μέσω της υπηρεσίας push αυτού του browser (της Apple σε iPhone), και το Erevos γράφει πόσα μηνύματα ήρθαν από τότε που το άνοιξες τελευταία φορά, για παράδειγμα «3 νέα μηνύματα», ή «Κλήση» αν χτύπησε μόνο μια κλήση, τίποτα άλλο. Η ειδοποίηση δεν περιέχει ούτε μήνυμα ούτε αποστολέα, και ο αριθμός της είναι κρυπτογραφημένος για αυτόν τον browser, αλλά η υπηρεσία push βλέπει πότε έρχεται κάτι για αυτή τη συσκευή, και ότι χρησιμοποιεί το Erevos. Με έναν server ή το Erevos ενός αποστολέα παλαιότερο από την έκδοση 2.0.0, ή με ένα μήνυμα που μετέφεραν στον server άλλα τηλέφωνα, δεν υπάρχει αριθμός: το Erevos γράφει «Νέο μήνυμα», ή «Νέα μηνύματα» αν ήρθαν κι άλλα, μέχρι να το ανοίξεις. Οι κρυφές συνομιλίες δεν παίρνουν ποτέ ειδοποιήσεις. Κάθε χώρος που τις ενεργοποιεί έχει δική του διεύθυνση push, οπότε η διεύθυνση δεν συνδέει δύο χώρους μεταξύ τους στον server τους.',
  'Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.':
    'Δεν ήταν ακόμα δυνατό να ενημερωθεί ο server σου, οπότε μπορεί να έρχονται ακόμα ειδοποιήσεις. Το Erevos τον ενημερώνει μόλις ο server είναι διαθέσιμος.',
  'A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.':
    'Μια κλήση που έρχεται όσο το Erevos είναι κλειστό δεν χτυπά: βγαίνει μόνο η ειδοποίηση «Κλήση». Στο iPhone δεν γίνεται κάτι παραπάνω: η Apple δεν αφήνει μια web εφαρμογή ούτε να τρέχει όσο είναι κλειστή ούτε να χτυπά όπως ένα τηλέφωνο· γι’ αυτό θα χρειαζόταν εφαρμογή από το App Store. Στο Android, η εφαρμογή του Erevos χτυπά ακόμη κι όταν είναι κλειστή.',
  "Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.":
    'Κάθε χώρος που τις έχει ανοιχτές έχει δικό του service worker σε αυτόν τον browser, που φαίνεται στις ρυθμίσεις του: όποιος τις βλέπει μπορεί να μετρήσει τους χώρους με ανοιχτές ειδοποιήσεις. Ένα αίτημα μηνύματος από κάποιον καινούργιο, μέσω του συνδέσμου επαφής σου, μπορεί να φανεί μόνο όταν ανοίξει το Erevos.',
  'Turn off': 'Απενεργοποίηση',
  'Turn on': 'Ενεργοποίηση',
  'Erevos was tampered with': 'Κάποιος πείραξε το Erevos',
  'The server sent this device a new service worker, the part of Erevos that checks its code, and no signed release lists it. Erevos goes on with the checked code while it is open, but once it is closed the browser may start the new one, which could show a fake Erevos. Do not open Erevos from this server again, and do not type your passwords into it, until whoever runs the server knows why. Your chats stay sealed with your password.':
    'Ο server έστειλε σε αυτή τη συσκευή νέο service worker, το κομμάτι του Erevos που ελέγχει τον κώδικά του, και καμία υπογεγραμμένη έκδοση δεν τον αναφέρει. Το Erevos συνεχίζει με τον ελεγμένο κώδικα όσο είναι ανοιχτό, αλλά μόλις κλείσει ο browser μπορεί να ξεκινήσει τον νέο, που θα μπορούσε να δείξει ένα ψεύτικο Erevos. Μην ανοίξεις ξανά το Erevos από αυτόν τον server, και μη γράψεις εκεί τους κωδικούς σου, μέχρι να μάθει γιατί όποιος τρέχει τον server. Οι συνομιλίες σου μένουν κρυπτογραφημένες με τον κωδικό σου.',
  'I understand': 'Κατάλαβα',
  'Update refused': 'Η ενημέρωση απορρίφθηκε',
  '{reason} Erevos keeps the release it has. Settings → Privacy and security → This web app shows what was refused.':
    '{reason} Το Erevos κρατά την έκδοση που έχει. Στις Ρυθμίσεις → Απόρρητο και ασφάλεια → Αυτή η web εφαρμογή φαίνεται τι απορρίφθηκε.',

  // Files and photos (lib/attachments.ts, lib/photo*.ts, lib/pick-*.ts, lib/save-file*.ts, lib/backup-place.web.ts).
  'Files can be 100 MB at most.': 'Τα αρχεία μπορούν να είναι έως 100 MB.',
  'The file was changed on the way, so it was not kept.': 'Το αρχείο άλλαξε στη διαδρομή, γι’ αυτό δεν κρατήθηκε.',
  'The file is not on the server any more. Files wait there 14 days.': 'Το αρχείο δεν είναι πια στον server. Τα αρχεία περιμένουν εκεί 14 μέρες.',
  'This file is not on this phone.': 'Αυτό το αρχείο δεν είναι σε αυτό το τηλέφωνο.',
  'This file is not on this computer.': 'Αυτό το αρχείο δεν είναι σε αυτόν τον υπολογιστή.',
  // Shown after "in", as «στο {folder}»: no article.
  'the place you chose': 'σημείο που διάλεξες',
  'the downloads folder': 'φάκελο λήψεων',
  'Not saved: the share sheet was closed.': 'Δεν αποθηκεύτηκε: το παράθυρο κοινοποίησης έκλεισε.',
  'That folder is not there any more. Choose it again.': 'Αυτός ο φάκελος δεν υπάρχει πια. Διάλεξέ τον ξανά.',
  // A backup that a folder did not take, in plain words (lib/backup-place.ts folderTrouble).
  'The app this folder belongs to made no file in it. Choose a folder on the phone instead, or try again later.':
    'Η εφαρμογή στην οποία ανήκει αυτός ο φάκελος δεν έφτιαξε το αρχείο. Διάλεξε καλύτερα έναν φάκελο στο τηλέφωνο, ή δοκίμασε ξανά αργότερα.',
  'Erevos may no longer write in this folder. Choose it again.': 'Το Erevos δεν έχει πια άδεια να γράφει σε αυτόν τον φάκελο. Διάλεξέ τον ξανά.',
  'There is no room left in this folder. Make room, or choose another one.': 'Δεν έχει μείνει χώρος σε αυτόν τον φάκελο. Κάνε χώρο ή διάλεξε άλλον.',
  'The backup could not be written in this folder: {reason}': 'Το αντίγραφο δεν γράφτηκε σε αυτόν τον φάκελο: {reason}',
  'Ready to save.': 'Έτοιμο για αποθήκευση.',
  Original: 'Αρχική',
  'Original: the photo as it was, full size, with only its place, phone and time taken out.':
    'Αρχική: η φωτογραφία όπως ήταν, σε πλήρες μέγεθος, χωρίς μόνο το μέρος, το τηλέφωνο και την ώρα λήψης.',
  '{quality}%: a new, smaller photo, quicker to send. It says nothing but its picture.':
    '{quality}%: μια νέα, μικρότερη φωτογραφία, πιο γρήγορη στην αποστολή. Δεν λέει τίποτα πέρα από την εικόνα της.',
  'This photo does not get small enough for an MMS.': 'Αυτή η φωτογραφία δεν μικραίνει αρκετά για MMS.',
  'Erevos may not use the camera. Allow it in the phone settings to take photos.': 'Το Erevos δεν έχει άδεια για την κάμερα. Δώσε την άδεια στις ρυθμίσεις του τηλεφώνου για να βγάζεις φωτογραφίες.',
  'Voice message': 'Φωνητικό μήνυμα',
  Sticker: 'Αυτοκόλλητο',
  'File: {name}': 'Αρχείο: {name}',
  'That voice message is too long.': 'Αυτό το φωνητικό μήνυμα είναι πολύ μεγάλο.',

  // When a message or an SMS sent for later goes (components/later-picker.tsx, lib/later.ts).
  'In 1 hour': 'Σε 1 ώρα',
  'Tonight 20:00': 'Απόψε 20:00',
  'Tomorrow 09:00': 'Αύριο 09:00',
  Day: 'Ημέρα',
  Hour: 'Ώρα',
  Minutes: 'Λεπτά',
  'Goes on {when}.': 'Θα σταλεί στις {when}.',
  'That time has gone by. Choose one ahead.': 'Αυτή η ώρα πέρασε. Διάλεξε μια που έρχεται.',
  'At most a year ahead.': 'Το πολύ έναν χρόνο μπροστά.',
  // The home screen's list (lib/inbox.ts).
  'You: {text}': 'Εσύ: {text}',
  Sun: 'Κυρ',
  Mon: 'Δευ',
  Tue: 'Τρί',
  Wed: 'Τετ',
  Thu: 'Πέμ',
  Fri: 'Παρ',
  Sat: 'Σάβ',

  // Contacts and chats (lib/e2e.ts, lib/space-chats.ts, lock/).
  "That is this chat's own contact link.": 'Αυτός είναι ο δικός σου σύνδεσμος επαφής.',
  'That code has no key. Ask for their contact link or QR code from this version of Erevos.':
    'Αυτός ο κωδικός δεν έχει κλειδί. Ζήτησε τον σύνδεσμο επαφής ή τον κωδικό QR από αυτή την έκδοση του Erevos.',
  'No such contact.': 'Δεν υπάρχει τέτοια επαφή.',
  'Not a contact.': 'Δεν είναι επαφή.',
  'That is not a phone number.': 'Αυτός δεν είναι αριθμός τηλεφώνου.',
  'Not a time Erevos keeps messages for.': 'Το Erevos δεν κρατά μηνύματα για τόσο χρόνο.',
  'No conversation with this contact.': 'Δεν υπάρχει συνομιλία με αυτή την επαφή.',
  'That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.':
    'Αυτή η επαφή χρησιμοποιεί τον server στο {relay}, και ο σύνδεσμός της δεν έχει κλειδί γι’ αυτόν. Ζήτησέ της νέο σύνδεσμο.',
  'Wrong password for this backup.': 'Λάθος κωδικός για αυτό το αντίγραφο ασφαλείας.',

  // Groups (lib/groups.ts, lib/space-groups.ts).
  'No groups here yet.': 'Δεν υπάρχουν ακόμα ομάδες εδώ.',
  'Give the group a name.': 'Δώσε όνομα στην ομάδα.',
  'You made the group.': 'Δημιούργησες την ομάδα.',
  'Only the group’s admin adds members.': 'Μόνο ο διαχειριστής της ομάδας προσθέτει μέλη.',
  'You are not in this group any more.': 'Δεν είσαι πια σε αυτή την ομάδα.',
  'Only the group’s admin renames it.': 'Μόνο ο διαχειριστής της ομάδας αλλάζει το όνομά της.',
  'Only the group’s admin takes members out.': 'Μόνο ο διαχειριστής της ομάδας αφαιρεί μέλη.',
  'You closed the group.': 'Έκλεισες την ομάδα.',
  'You asked to leave. The group closes here once the admin takes you out.': 'Ζήτησες να φύγεις. Η ομάδα κλείνει εδώ μόλις σε αφαιρέσει ο διαχειριστής.',
  'You left the group.': 'Έφυγες από την ομάδα.',
  'You are no longer in the group.': 'Δεν είσαι πια στην ομάδα.',
  'member {id}': 'μέλος {id}',
  '{who} added you to the group.': '{who}: σε πρόσθεσε στην ομάδα.',
  '{who} joined.': '{who}: μπήκε στην ομάδα.',
  '{who} left.': '{who}: έφυγε.',
  'You asked {who} for their contact link.': '{who}: ζήτησες τον σύνδεσμο επαφής.',
  '{who} asked for your contact link.': '{who}: ζήτησε τον σύνδεσμο επαφής σου.',
  'You sent {who} your contact link. You are each other’s contacts now.':
    '{who}: έστειλες τον σύνδεσμο επαφής σου. Τώρα έχετε ο ένας τον άλλον στις επαφές.',
  '{who} sent their contact link. You are each other’s contacts now.':
    '{who}: σου έστειλε τον σύνδεσμο επαφής. Τώρα έχετε ο ένας τον άλλον στις επαφές.',
  '{who} could not be added as a contact.': '{who}: δεν μπόρεσε να προστεθεί στις επαφές.',
  'Ask for contact links on the phone that holds this account.': 'Για να ζητήσεις σύνδεσμο επαφής, χρησιμοποίησε το τηλέφωνο που έχει τον λογαριασμό.',
  'They are not in this group any more.': 'Δεν είναι πια σε αυτή την ομάδα.',
  'Not in public groups.': 'Δεν γίνεται σε δημόσιες ομάδες.',
  'More than one member of this group shows this key, so one of them is not who they say. Ask for their contact link some other way.':
    'Πάνω από ένα μέλος αυτής της ομάδας φαίνεται με αυτό το κλειδί, άρα κάποιο δεν είναι αυτό που λέει. Ζήτησε τον σύνδεσμο επαφής του με άλλον τρόπο.',
  'Another space is open now.': 'Τώρα είναι ανοιχτός άλλος χώρος.',
  'Groups go through the server. Type its address in Server first.': 'Οι ομάδες λειτουργούν μέσω του server. Γράψε πρώτα τη διεύθυνσή του στον «Server».',

  // The build and updates (lib/core.ts, lib/crypto.ts, lib/install-update*.ts, lib/updates.ts, lib/shell.ts).
  'This build has no Erevos core, so it cannot encrypt. Rebuild the app.': 'Αυτή η έκδοση δεν έχει τον πυρήνα του Erevos, οπότε δεν μπορεί να κρυπτογραφήσει. Φτιάξε ξανά την εφαρμογή.',
  'The Erevos core gave back something unexpected.': 'Ο πυρήνας του Erevos επέστρεψε κάτι απρόσμενο.',
  'This build of Erevos has no Tor.': 'Αυτή η έκδοση του Erevos δεν έχει Tor.',
  'This build of Erevos has no Nostr.': 'Αυτή η έκδοση του Erevos δεν έχει Nostr.',
  'This build has no secure random source. Rebuild the app so it includes expo-crypto.':
    'Αυτή η έκδοση δεν έχει ασφαλή πηγή τυχαίων αριθμών. Φτιάξε ξανά την εφαρμογή ώστε να περιέχει το expo-crypto.',
  'This release has no Android package.': 'Αυτή η έκδοση δεν έχει πακέτο για Android.',
  'The download was cut short.': 'Η λήψη διακόπηκε.',
  'The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.':
    'Η λήψη σταμάτησε σε κάθε προσπάθεια, γιατί η σύνδεση δεν έφερνε τίποτα για αρκετή ώρα. Δεν εγκαταστάθηκε τίποτα: δοκίμασε ξανά αργότερα ή σε άλλο δίκτυο.',
  'Show what is typed': 'Εμφάνιση όσων γράφεις',
  'Hide what is typed': 'Απόκρυψη όσων γράφεις',
  'The downloaded package is not the one the release published. Nothing was installed.':
    'Το πακέτο που κατέβηκε δεν είναι αυτό που δημοσίευσε η έκδοση. Δεν εγκαταστάθηκε τίποτα.',
  'This version installs from the download page.': 'Αυτή η έκδοση εγκαθίσταται από τη σελίδα λήψης.',
  'GitHub answered {status}.': 'Το GitHub απάντησε {status}.',
  "The web app's server answered {status}.": 'Ο server της web εφαρμογής απάντησε {status}.',
  'The desktop app answered {status}.': 'Η εφαρμογή υπολογιστή απάντησε {status}.',
  'There is no room left on this device. Free some space and try again.': 'Δεν έμεινε χώρος σε αυτή τη συσκευή. Ελευθέρωσε λίγο χώρο και δοκίμασε ξανά.',
  'This computer has no keyring to seal Erevos’s keys with, so Erevos keeps none. Start a keyring (KWallet, or GNOME Keyring with --password-store=gnome-libsecret), or start Erevos with --plain-secrets to keep them unsealed, readable by your user, and set a password lock.': 'Αυτός ο υπολογιστής δεν έχει κλειδοθήκη για να κρυπτογραφήσει τα κλειδιά του Erevos, οπότε το Erevos δεν κρατά κανένα. Ξεκίνα μια κλειδοθήκη (KWallet, ή GNOME Keyring με --password-store=gnome-libsecret), ή ξεκίνα το Erevos με --plain-secrets για να τα κρατά χωρίς κρυπτογράφηση, αναγνώσιμα από τον χρήστη σου, και βάλε κλείδωμα με κωδικό.',
  'The browser did not open its storage.': 'Ο browser δεν άνοιξε τον χώρο αποθήκευσής του.',

  // LoRa and nearby phones (lib/lora.ts, lib/nearby.ts).
  'The radio restarts with its new settings, and links again.': 'Ο ασύρματος ξεκινά ξανά με τις νέες ρυθμίσεις του και συνδέεται ξανά.',
  'There is no server, and no Erevos phone is linked nearby. Type the server address in Server, or come near their phone.':
    'Δεν υπάρχει server, ούτε κοντινό τηλέφωνο με Erevos συνδεδεμένο. Γράψε τη διεύθυνση του server στον «Server», ή έλα κοντά στο τηλέφωνό του.',
  'Too large for LoRa, which takes only text. It can go once the server can be reached, or near their phone.':
    'Πολύ μεγάλο για LoRa, που παίρνει μόνο κείμενο. Μπορεί να φύγει μόλις ο server είναι προσβάσιμος, ή κοντά στο τηλέφωνό του.',

  // The relay (lib/relay.ts, lib/sms-invite.ts); {what} is the request's name.
  'An id is 48 hex characters.': 'Ένα id έχει 48 δεκαεξαδικούς χαρακτήρες.',
  'Through Tor: {reason}': 'Μέσω Tor: {reason}',
  'cannot reach the server at {url}, or the token is wrong': 'δεν είναι δυνατή η σύνδεση με τον server στο {url}, ή το token είναι λάθος',
  'message is not held': 'το μήνυμα δεν κρατιέται',
  'the server at {url} cannot keep messages for later: update it': 'ο server στο {url} δεν μπορεί να κρατήσει μηνύματα για αργότερα: ενημέρωσέ τον',
  'The server at {url} that keeps it is no longer set here.': 'Ο server στο {url} που το κρατά δεν είναι πια ρυθμισμένος εδώ.',
  'the server closed the connection': 'ο server έκλεισε τη σύνδεση',
  'the server did not answer in time': 'ο server δεν απάντησε εγκαίρως',
  'lost the connection to the server': 'χάθηκε η σύνδεση με τον server',
  '{what}: queue not found': '{what}: η ουρά δεν βρέθηκε',
  '{what}: queue is full': '{what}: η ουρά είναι γεμάτη',
  '{what}: your free place on this server has used all it may today. It goes on tomorrow.': '{what}: η δωρεάν θέση σου σε αυτόν τον server έφτασε το σημερινό της όριο. Συνεχίζει αύριο.',
  '{what}: the server could not save it, try again later': '{what}: ο server δεν μπόρεσε να το αποθηκεύσει, δοκίμασε ξανά αργότερα',
  '{what}: the second server could not reach your server, try again later': '{what}: ο δεύτερος server δεν μπόρεσε να φτάσει τον server σου, δοκίμασε ξανά αργότερα',
  '{what}: the file is not on the server any more': '{what}: το αρχείο δεν είναι πια στον server',
  '{what}: the server has no room for files now, try again later': '{what}: ο server δεν έχει χώρο για αρχεία τώρα, δοκίμασε ξανά αργότερα',
  '{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.': '{what}: η δωρεάν θέση σου σε αυτόν τον server έφτασε το σημερινό όριο αρχείων. Τα αρχεία συνεχίζουν αύριο.',
  '{what}: the server could not keep it, try again later': '{what}: ο server δεν μπόρεσε να το κρατήσει, δοκίμασε ξανά αργότερα',
  '{what}: your server could not reach the server the file is on': '{what}: ο server σου δεν μπόρεσε να φτάσει τον server όπου είναι το αρχείο',
  '{reason}. A server older than this app cannot take files: update it.': '{reason}. Ένας server παλαιότερος από αυτή την εφαρμογή δεν δέχεται αρχεία: ενημέρωσέ τον.',
  'message is too large': 'το μήνυμα είναι πολύ μεγάλο',
  'your server has no key for two-hop sending, so it was not sent through the second server':
    'ο server σου δεν έχει κλειδί για αποστολή με δύο βήματα, οπότε δεν στάλθηκε μέσω του δεύτερου server',
  'the link has given all its places on its server. Ask them for a new link': 'ο σύνδεσμος έδωσε ήδη όλες τις θέσεις του στον server του. Ζήτησέ τους νέο σύνδεσμο',
  'The server address is too long for an SMS invite.': 'Η διεύθυνση του server είναι πολύ μεγάλη για πρόσκληση με SMS.',

  // Notifications in the web app (lib/web-push*.ts).
  'Notifications through the browser are for the web app.': 'Οι ειδοποιήσεις μέσω browser είναι για τη web εφαρμογή.',
  'Your server does not send notifications. It needs a newer version, set up with a push key.':
    'Ο server σου δεν στέλνει ειδοποιήσεις. Χρειάζεται νεότερη έκδοση, ρυθμισμένη με κλειδί push.',
  'This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.':
    'Αυτός ο browser δεν μπορεί να δείξει ειδοποιήσεις για κλειστή web εφαρμογή. Σε iPhone, πρόσθεσε πρώτα το Erevos στην αρχική οθόνη.',
  'Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.':
    'Οι ειδοποιήσεις δεν επιτρέπονται για το Erevos. Επίτρεψέ τες στις ρυθμίσεις αυτού του browser ή του τηλεφώνου.',
  'Set up the server first, under Server.': 'Ρύθμισε πρώτα τον server, στον «Server».',
  'Notifications could not be turned on: {reason}': 'Οι ειδοποιήσεις δεν ενεργοποιήθηκαν: {reason}',
  // Calls' lines in a chat (lib/call-lines.ts).
  'Voice call': 'Φωνητική κλήση',
  'Video call': 'Βιντεοκλήση',
  'Group call': 'Ομαδική κλήση',
  'Group video call': 'Ομαδική βιντεοκλήση',
  'Missed voice call': 'Αναπάντητη φωνητική κλήση',
  'Missed video call': 'Αναπάντητη βιντεοκλήση',
  'Missed group video call': 'Αναπάντητη ομαδική βιντεοκλήση',
  '{missed}, while in another call': '{missed}, ενώ μιλούσες σε άλλη κλήση',
  'turned down': 'απορρίφθηκε',
  'could not connect': 'δεν συνδέθηκε',
  'they were in another call': 'μιλούσε σε άλλη κλήση',
  'not answered': 'δεν απαντήθηκε',
  'Only {given} of the {all} files went to the downloads, so they are not all saved.': 'Μόνο {given} από τα {all} αρχεία πήγαν στις λήψεις, οπότε δεν αποθηκεύτηκαν όλα.',
  'Save the files': 'Αποθήκευση των αρχείων',
  '{given} of the {all} files went to the downloads. Tap Save for the next one: {name}': '{given} από τα {all} αρχεία πήγαν στις λήψεις. Πάτα Αποθήκευση για το επόμενο: {name}',
  "The browser did not keep it.": "Ο browser δεν το κράτησε.",
  "New device of {who}: your messages go to it too.": "Νέα συσκευή του {who}: τα μηνύματά σου πηγαίνουν και σε αυτή.",
  "A device of {who} changed its key: your messages do not go to it.": "Μια συσκευή του {who} άλλαξε το κλειδί της: τα μηνύματά σου δεν πηγαίνουν σε αυτή.",
};
