// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Greek of "last seen" (lib/last-seen.ts): the chat's header and details (app/chat.tsx), and its
// part of Settings → Privacy and security (app/security.tsx, lib/settings.ts) (i18n/el/index.ts).
export const lastSeen: Record<string, string> = {
  'last seen today at {time}': 'τελευταία φορά σήμερα {time}',
  'last seen yesterday at {time}': 'τελευταία φορά χθες {time}',
  'last seen {date} at {time}': 'τελευταία φορά {date} {time}',
  'Last seen': 'Τελευταία φορά ενεργός',
  'Who sees when you last had Erevos open: off in a new space, until you turn it on': 'Ποιος βλέπει πότε άνοιξες τελευταία το Erevos: κλειστό σε νέο χώρο, μέχρι να το ανοίξεις',
  'Your contacts see the exact time you last had Erevos open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. In all chats of this space; hidden chats have their own switch.':
    'Οι επαφές σου βλέπουν την ακριβή ώρα που είχες τελευταία φορά ανοικτό το Erevos, κι εσύ τη δική τους. Πηγαίνει κρυπτογραφημένο από άκρη σε άκρη μόνο σε αυτές, ποτέ στον server. Σε όλες τις συνομιλίες αυτού του χώρου· οι κρυφές συνομιλίες έχουν δικό τους διακόπτη.',
  'Your contacts here see the exact time you last had these hidden chats open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. Only in these hidden chats, with a time of their own: the space’s chats have their own switch.':
    'Οι επαφές σου εδώ βλέπουν την ακριβή ώρα που είχες τελευταία φορά ανοικτές αυτές τις κρυφές συνομιλίες, κι εσύ τη δική τους. Πηγαίνει κρυπτογραφημένο από άκρη σε άκρη μόνο σε αυτές, ποτέ στον server. Μόνο σε αυτές τις κρυφές συνομιλίες, με δική τους ώρα: οι συνομιλίες του χώρου έχουν δικό τους διακόπτη.',
  'No one here sees when you last had these hidden chats open, and you see no one’s here either. Those who saw it lose it with your next message.':
    'Κανείς εδώ δεν βλέπει πότε είχες τελευταία φορά ανοικτές αυτές τις κρυφές συνομιλίες, και δεν βλέπεις ούτε εσύ κανενός εδώ. Όσοι το είχαν δει το χάνουν με το επόμενο μήνυμά σου.',
  'No one sees when you last had Erevos open, and you see no one’s either. Those who saw it lose it with your next message.':
    'Κανείς δεν βλέπει πότε είχες τελευταία φορά ανοικτό το Erevos, και δεν βλέπεις ούτε εσύ κανενός. Όσοι το είχαν δει το χάνουν με το επόμενο μήνυμά σου.',
  'On: your contacts see the exact time you last had Erevos open, and you see theirs.':
    'Ανοικτό: οι επαφές σου βλέπουν την ακριβή ώρα που είχες τελευταία φορά ανοικτό το Erevos, κι εσύ τη δική τους.',
  'Off: no one sees when you last had Erevos open, and you see no one’s either.':
    'Κλειστό: κανείς δεν βλέπει πότε είχες τελευταία φορά ανοικτό το Erevos, και δεν βλέπεις ούτε εσύ κανενός.',
  'It goes end-to-end encrypted, inside what goes to your contacts anyway, never to the server. Only for the chats of this space: hidden chats have their own switch, in a chat’s details there. Whether you are online now has its own switch in each chat: Appear offline.':
    'Πηγαίνει κρυπτογραφημένο από άκρη σε άκρη, μέσα σε ό,τι στέλνεται έτσι κι αλλιώς στις επαφές σου, ποτέ στον server. Μόνο για τις συνομιλίες αυτού του χώρου: οι κρυφές συνομιλίες έχουν δικό τους διακόπτη, στις λεπτομέρειες μιας συνομιλίας εκεί. Το αν είσαι συνδεδεμένος τώρα έχει δικό του διακόπτη σε κάθε συνομιλία: Εμφάνιση εκτός σύνδεσης.',
  // Matrix and XMPP contacts online, as their servers say (lib/net-presence.ts), and our own on Matrix (components/say-typing.tsx).
  "Away":
    "Λείπει",
  "Do not disturb":
    "Μην ενοχλείτε",
  "Say when I am online":
    "Να λέει όταν είμαι συνδεδεμένος",
  "The others see when you are online, and when you last were. It goes through the {server} server not encrypted, so the server learns it too.":
    "Οι άλλοι βλέπουν πότε είσαι συνδεδεμένος, και πότε ήσουν τελευταία φορά. Περνά από τον server του {server} χωρίς κρυπτογράφηση, οπότε το μαθαίνει και ο server.",
  "The others do not see when you are online. You still see it of those whose server says it.":
    "Οι άλλοι δεν βλέπουν πότε είσαι συνδεδεμένος. Εσύ το βλέπεις ακόμα για όσους το λέει ο server τους.",
  "Say when I open and close Erevos":
    "Να λέει πότε ανοίγω και κλείνω το Erevos",
  "As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The server sees that something goes to them then, so it can tell when you open and close Erevos.":
    "Μόλις ανοίγει το Erevos, οι επαφές με τις οποίες μίλησες τις τελευταίες 30 μέρες, και που δείχνουν κι αυτές τη δική τους ώρα, το μαθαίνουν αμέσως, η καθεμία μετά από τυχαία αναμονή έως ένα λεπτό, το πολύ κάθε 15 λεπτά. Μόλις κλείνει, όσες το έμαθαν όσο ήταν ανοιχτό μαθαίνουν πότε έκλεισε. Ο server βλέπει ότι κάτι πηγαίνει σε αυτές εκείνη τη στιγμή, οπότε μπορεί να καταλάβει πότε ανοίγεις και κλείνεις το Erevos.",
  "Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The server learns nothing new.":
    "Η ώρα σου πηγαίνει μόνο μαζί με ό,τι πηγαίνει έτσι κι αλλιώς στις επαφές σου: ένα μήνυμα, μια ένδειξη ότι τα δικά τους ήρθαν ή διαβάστηκαν, ή μια απάντηση όσο έχουν ανοιχτή τη συνομιλία σας. Ο server δεν μαθαίνει τίποτα νέο.",
};
