// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network, and a chat of one (components/account-tor.tsx) in Greek (i18n/el/index.ts).
export const accountTorText: Record<string, string> = {
  "Tor for this {network} account": "Tor για αυτόν τον λογαριασμό {network}",
  "A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.": "Μια συνομιλία αυτού του λογαριασμού είναι ρυθμισμένη να πηγαίνει μέσω Tor, οπότε όλος ο λογαριασμός πηγαίνει μόνο μέσω Tor όσο ισχύει αυτό: το {network} έχει μία σύνδεση για όλες τις συνομιλίες του. Ποτέ κατευθείαν.",
  "Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.": "Πάντα μέσω Tor, ό,τι κι αν κάνει ο χώρος, και στη σύνδεση: ο διακομιστής του {network} δεν βλέπει ποτέ τη διεύθυνσή σου. Πιο αργά, και τίποτα δεν φεύγει όσο το Tor δεν συνδέεται. Οι κλήσεις δεν περνούν από Tor.",
  "Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.": "Όχι μέσω Tor: ο διακομιστής του {network} βλέπει τη διεύθυνσή σου. Διάλεξε «Όπως ο χώρος» ή «Πάντα μέσω Tor» για να την κρύψεις.",
  "Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.": "Μέσω Tor, όπως ο χώρος: ο διακομιστής του {network} δεν βλέπει τη διεύθυνσή σου. Τα αρχεία επίσης, μόνο όταν ο χώρος στέλνει «Όλα» μέσω Tor.",
  "As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Relay and networks → Tor.": "Όπως ο χώρος, που τώρα δεν περνά από Tor: ο διακομιστής του {network} βλέπει τη διεύθυνσή σου. Το Tor είναι στις Ρυθμίσεις → Relay και δίκτυα → Tor.",
  "Tor uses the bridges chosen under Settings → Relay and networks → Tor, as Erevos does.": "Το Tor χρησιμοποιεί τις γέφυρες που διάλεξες στις Ρυθμίσεις → Relay και δίκτυα → Tor, όπως και το Erevos.",
  "This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.": "Αυτή η συνομιλία πηγαίνει μόνο μέσω Tor, ποτέ κατευθείαν, ό,τι κι αν λένε ο λογαριασμός ή ο χώρος. Το {network} έχει μία σύνδεση για όλες τις συνομιλίες ενός λογαριασμού, οπότε όλος ο λογαριασμός πηγαίνει μέσω Tor όσο αυτό είναι ανοιχτό. Οι κλήσεις δεν περνούν από Tor.",
  "This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.": "Αυτή η συνομιλία πηγαίνει όπως λέει η ρύθμιση Tor του λογαριασμού. Άνοιξέ το για να πηγαίνει μόνο μέσω Tor· τότε όλος ο λογαριασμός {network} πηγαίνει μέσω Tor, αφού έχει μία σύνδεση.",
  "This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.": "Αυτό το τηλέφωνο δεν μπορεί να δείξει το captcha του Signal μέσω Tor, και με το Tor ανοιχτό δεν το δείχνει ποτέ κατευθείαν. Κλείσε το Tor για αυτόν τον λογαριασμό Signal για να εγγραφείς, ή σύνδεσέ τον με το Signal σε άλλο τηλέφωνο.",
  "This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.": "Αυτό το τηλέφωνο δεν μπορεί να δείξει τη σελίδα σύνδεσης του Messenger μέσω Tor, και με το Tor ανοιχτό δεν τη δείχνει ποτέ κατευθείαν. Κλείσε το Tor για το Messenger για να συνδεθείς, και άνοιξέ το ξανά μετά.",
  "Meta may ask to confirm, or lock for a while, an account that signs in through Tor.": "Η Meta μπορεί να ζητήσει επιβεβαίωση, ή να κλειδώσει για λίγο, έναν λογαριασμό που συνδέεται μέσω Tor.",
  "Through Tor…": "Μέσω Tor…",
  "Account through Tor": "Λογαριασμός μέσω Tor",
  "The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.": "Τότε όλος ο λογαριασμός Messenger πηγαίνει μέσω Tor, όχι μόνο αυτή η συνομιλία. Η Meta μπορεί να ζητήσει επιβεβαίωση, ή να κλειδώσει για λίγο, έναν λογαριασμό που έρχεται μέσω Tor.",
  "Not through Tor.": "Όχι μέσω Tor.",
};
