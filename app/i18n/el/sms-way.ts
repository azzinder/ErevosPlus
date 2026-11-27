// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of encrypted messages by SMS when nothing else works (lib/sms-way.ts, app/sms-settings.tsx, app/chat.tsx) (i18n/el/index.ts).
export const smsWay: Record<string, string> = {
  "Went by SMS, end-to-end encrypted.": "Πήγε με SMS, κρυπτογραφημένο από άκρη σε άκρη.",
  "Came by SMS, end-to-end encrypted.": "Ήρθε με SMS, κρυπτογραφημένο από άκρη σε άκρη.",
  "{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.": "{what} με SMS, κρυπτογραφημένο από άκρη σε άκρη, γιατί τίποτε άλλο δεν μπορούσε να το πάρει. Η εταιρεία τηλεφωνίας βλέπει ότι έγραψες στον αριθμό του/της {name}, και πότε, όπως σε κάθε SMS.",
  "It went without the link’s preview, which is too much for SMS.": "Έφυγε χωρίς την προεπισκόπηση του συνδέσμου, που είναι πολύ μεγάλη για SMS.",
  "It is too long for SMS.": "Είναι πολύ μεγάλο για SMS.",
  "SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.": "Τα SMS είναι ενεργά για κάθε επαφή με αριθμό. Απενεργοποίησέ τα στις Ρυθμίσεις → Τηλέφωνο και SMS → SMS.",
  "SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.": "Τα SMS μπορούν να ενεργοποιηθούν ένα-ένα για {n} επαφές το πολύ. Ενεργοποίησέ τα για όλες στις Ρυθμίσεις → Τηλέφωνο και SMS → SMS.",
  "When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.": "Όταν τίποτε άλλο δεν μπορεί να πάρει ένα κείμενο προς {name}, πηγαίνει με SMS, κρυπτογραφημένο από άκρη σε άκρη. Κάθε SMS κοστίζει όσο λέει το πρόγραμμά σου, και η εταιρεία τηλεφωνίας βλέπει ότι έγραψες στον αριθμό του/της, και πότε.",
  "Messages to {name} no longer go by SMS.": "Τα μηνύματα προς {name} δεν πηγαίνουν πια με SMS.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the server, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.": "Τα κείμενα πηγαίνουν με SMS στον αριθμό του/της, κρυπτογραφημένα από άκρη σε άκρη, μόνο όταν αποτύχουν όλα: ο server, το Nostr, τα κοντινά τηλέφωνα και το LoRa. Κάθε φορά κοστίζει SMS, και η εταιρεία τηλεφωνίας βλέπει ποιος έγραψε σε ποιον, και πότε. Και τα δύο τηλέφωνα χρειάζονται το Erevos ως εφαρμογή SMS.",
  "SMS when nothing else works": "SMS όταν τίποτε άλλο δεν λειτουργεί",
  "Texts to Erevos contacts by SMS, encrypted: off unless turned on": "Κείμενα σε επαφές Erevos με SMS, κρυπτογραφημένα: ανενεργό αν δεν το ενεργοποιήσεις",
  "When the server, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.": "Όταν αποτύχουν όλα, ο server, το Nostr, τα κοντινά τηλέφωνα και το LoRa, ένα κείμενο σε επαφή Erevos με συνδεδεμένο αριθμό μπορεί να πάει με SMS, κρυπτογραφημένο από άκρη σε άκρη όπως κάθε μήνυμα του Erevos, ως κρυφά SMS δεδομένων που η εφαρμογή SMS του άλλου δεν δείχνει. Ανενεργό αν δεν το ενεργοποιήσεις, εδώ για όλες αυτές τις επαφές ή στις Λεπτομέρειες μιας συνομιλίας για μία.",
  "Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.": "Πρόσεξε το κόστος: κάθε SMS κοστίζει όσο λέει το πρόγραμμά σου, ένα σύντομο κείμενο θέλει 3 SMS και ένα μεγαλύτερο έως 10. Και η εταιρεία τηλεφωνίας βλέπει ποιος αριθμός έγραψε σε ποιον, και πότε, όπως σε κάθε SMS· ποτέ τι γράφτηκε.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.": "Έτσι πηγαίνουν μόνο κείμενα και διαγραφές, όχι φωτογραφίες, αρχεία, φωνητικά μηνύματα, ενδείξεις ή κλήσεις, ούτε μεγάλα κείμενα (το πολύ περίπου 800 λατινικά γράμματα ή 400 ελληνικά), ούτε τίποτε από κρυφές συνομιλίες. Και τα δύο τηλέφωνα χρειάζονται το Erevos ως εφαρμογή SMS.",
  "Turn off for all contacts": "Απενεργοποίηση για όλες τις επαφές",
  "Turn on for all contacts": "Ενεργοποίηση για όλες τις επαφές",
  "Erevos is not the SMS app yet, so nothing goes by SMS.": "Το Erevos δεν είναι ακόμα η εφαρμογή SMS, οπότε τίποτε δεν πηγαίνει με SMS.",
  "On for {n} contact in their chat's Details.": "Ενεργό για {n} επαφή στις Λεπτομέρειες της συνομιλίας της.",
  "On for {n} contacts in their chats' Details.": "Ενεργό για {n} επαφές στις Λεπτομέρειες των συνομιλιών τους.",
  "Too long for SMS, which takes only short texts. It can go once the server can be reached, or near their phone.": "Πολύ μεγάλο για SMS, που παίρνουν μόνο σύντομα κείμενα. Μπορεί να πάει μόλις ο server γίνει διαθέσιμος, ή κοντά στο τηλέφωνό του/της.",
  "The SMS did not go.": "Το SMS δεν έφυγε.",
};
