// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Τα ελληνικά του Erevos στον υπολογιστή, που μένει ανοιχτό με το παράθυρο κλειστό (lib/desktop.ts,
// components/desktop-background.tsx, Ρυθμίσεις → Ειδοποιήσεις → Στο παρασκήνιο) (i18n/el/index.ts).
export const desktop: Record<string, string> = {
  'Quit Erevos': 'Έξοδος από το Erevos',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its icon in the system tray.':
    'Το Erevos συνεχίζει να τρέχει με το παράθυρό του κλειστό: τα μηνύματα έρχονται και οι κλήσεις χτυπούν. Για έξοδο, χρησιμοποίησε το εικονίδιό του στη γραμμή συστήματος.',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its menu.':
    'Το Erevos συνεχίζει να τρέχει με το παράθυρό του κλειστό: τα μηνύματα έρχονται και οι κλήσεις χτυπούν. Για έξοδο, χρησιμοποίησε το μενού του.',
  '{n} new message': '{n} νέο μήνυμα',
  '{n} new messages': '{n} νέα μηνύματα',
  'Keep running when closed': 'Να τρέχει όταν κλείσει',
  'Quit when closed': 'Έξοδος όταν κλείσει',
  'When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.':
    'Όταν κλείνεις το παράθυρό του, το Erevos συνεχίζει να τρέχει στη γραμμή συστήματος: περιμένει στον server, μια κλήση χτυπά και φέρνει πίσω το παράθυρο, και μια ειδοποίηση λέει πόσα μηνύματα δεν έχουν διαβαστεί, ποτέ ποιος ή τι. Το ανοίγεις ξανά από το εικονίδιό του εκεί, ή ξεκινώντας το Erevos, και βγαίνεις από το μενού αυτού του εικονιδίου. Όπου η επιφάνεια εργασίας δεν δείχνει γραμμή συστήματος, όπως το GNOME χωρίς επέκταση γι’ αυτό, το παράθυρο ξαναβγαίνει όταν ξεκινάς ξανά το Erevos.',
  'When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.':
    'Όταν κλείνεις το παράθυρό του, το Erevos συνεχίζει να τρέχει στο Dock: περιμένει στον server, μια κλήση χτυπά και φέρνει πίσω το παράθυρο, και μια ειδοποίηση λέει πόσα μηνύματα δεν έχουν διαβαστεί, ποτέ ποιος ή τι. Πάτα το εικονίδιό του στο Dock για να το ανοίξεις ξανά, και βγες από το μενού του.',
  'Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.':
    'Όταν κλείνεις το παράθυρό του, το Erevos τερματίζεται: τα μηνύματα περιμένουν στον server ώσπου να το ανοίξεις ξανά, και μια κλήση που ήρθε στο μεταξύ φαίνεται ως αναπάντητη.',
};
