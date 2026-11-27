// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of hidden chats that receive while they are closed (lock/hidden-keep.ts,
// lib/place-receiver.ts, the toggle at the top of an open place in app/chat.tsx) (i18n/de/index.ts).
export const hiddenKeep: Record<string, string> = {
  'Receive while closed': 'Empfangen, wenn geschlossen',
  'Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.':
    'Geschlossen empfangen diese versteckten Chats wie deine anderen Chats: Ihre Kontakte sehen sofort, dass eine Nachricht ankam, eine Mitteilung sagt nur „New message“, ein Anruf klingelt ohne Namen und wird mit der PIN angenommen, und eine Erinnerung ihres Chats mit mir selbst sagt nur „Erinnerung“. Dafür wird ihr Schlüssel verschlüsselt beim Bereich aufbewahrt, sodass, wer den Bereich öffnet und kopiert, was das Telefon speichert, sie ebenfalls öffnen könnte; die PIN hält sie weiterhin verborgen.',
  'Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the server until you open them.':
    'Geschlossen liest nichts diese versteckten Chats: Ihr Schlüssel liegt nur hinter der PIN, und ihre Nachrichten warten auf dem Server, bis du sie öffnest.',
  'Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.':
    'Ihre eigenen Matrix-, XMPP- und Nostr-Konten bleiben ebenfalls verbunden: Was dort ankommt, sagt nur „New message“, und ein Anruf klingelt ohne Namen.',
  'Their own Matrix, XMPP and Nostr accounts connect only while they are open.':
    'Ihre eigenen Matrix-, XMPP- und Nostr-Konten verbinden sich nur, solange die versteckten Chats offen sind.',
  // What waits in hidden chats, through their relay only (lib/waiting.ts).
  "Waiting. {reason} It goes by itself once the server can take it.": "Wartet. {reason} Sie geht von selbst, sobald der Server sie annehmen kann.",
  "The voice message waits, and goes by itself once the server can take it.": "Die Sprachnachricht wartet und geht von selbst, sobald der Server sie annehmen kann.",
  "Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.":
    "Geschlossen senden diese versteckten Chats nichts: Sie geht, solange sie offen sind, es sei denn, du schaltest oben „Empfangen, wenn geschlossen“ ein.",
};
