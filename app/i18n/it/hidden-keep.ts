// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of hidden chats that receive while they are closed (lock/hidden-keep.ts,
// lib/place-receiver.ts, the toggle at the top of an open place in app/chat.tsx) (i18n/it/index.ts).
export const hiddenKeep: Record<string, string> = {
  'Receive while closed': 'Ricevere da chiuse',
  'Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.':
    'Chiuse, queste chat nascoste ricevono come le tue altre chat: i loro contatti vedono subito che un messaggio è arrivato, una notifica dice solo «New message», una chiamata squilla senza nome e si risponde con il PIN, e un promemoria della loro Chat con me stesso dice solo «Promemoria». Per questo la loro chiave è conservata cifrata con lo spazio, quindi chi apre lo spazio e copia ciò che il telefono conserva potrebbe aprirle anche lui; il PIN le tiene comunque nascoste.',
  'Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the server until you open them.':
    'Chiuse, niente legge queste chat nascoste: la loro chiave è solo dietro il PIN, e i loro messaggi aspettano sul server finché non le apri.',
  'Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.':
    'I loro account Matrix, XMPP e Nostr restano collegati anch’essi: ciò che arriva lì dice solo «New message», e una chiamata squilla senza nome.',
  'Their own Matrix, XMPP and Nostr accounts connect only while they are open.':
    'I loro account Matrix, XMPP e Nostr si collegano solo mentre queste chat nascoste sono aperte.',
  // What waits in hidden chats, through their relay only (lib/waiting.ts).
  "Waiting. {reason} It goes by itself once the server can take it.": "In attesa. {reason} Partirà da solo appena il server potrà riceverlo.",
  "The voice message waits, and goes by itself once the server can take it.": "Il messaggio vocale aspetta, e partirà da solo appena il server potrà riceverlo.",
  "Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.":
    "Da chiuse, queste chat nascoste non inviano nulla: parte mentre sono aperte, a meno che tu non attivi «Ricevere da chiuse» in alto.",
};
