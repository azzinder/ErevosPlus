// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of hidden chats that receive while they are closed (lock/hidden-keep.ts,
// lib/place-receiver.ts, the toggle at the top of an open place in app/chat.tsx) (i18n/sh/index.ts).
export const hiddenKeep: Record<string, string> = {
  'Receive while closed': 'Primanje dok su zatvoreni',
  'Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.':
    'Dok su zatvoreni, ovi skriveni razgovori primaju kao i ostali vaši razgovori: njihovi kontakti odmah vide da je poruka stigla, obavijest kaže samo „New message“, poziv zvoni bez imena i javljate se PIN-om, a podsjetnik njihovog Razgovora sa sobom kaže samo „Podsjetnik“. Zato se njihov ključ čuva šifriran uz prostor, pa bi ih i onaj tko otvori prostor i kopira ono što telefon čuva mogao otvoriti; PIN ih i dalje drži skrivenima.',
  'Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the server until you open them.':
    'Dok su zatvoreni, ništa ne čita ove skrivene razgovore: njihov ključ je samo iza PIN-a, a njihove poruke čekaju na serveru dok ih ne otvorite.',
  'Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.':
    'Njihovi vlastiti Matrix, XMPP i Nostr računi također ostaju povezani: ono što tamo stigne kaže samo „New message“, a poziv zvoni bez imena.',
  'Their own Matrix, XMPP and Nostr accounts connect only while they are open.':
    'Njihovi vlastiti Matrix, XMPP i Nostr računi povezuju se samo dok su ovi skriveni razgovori otvoreni.',
  // What waits in hidden chats, through their relay only (lib/waiting.ts).
  "Waiting. {reason} It goes by itself once the server can take it.": "Na čekanju. {reason} Šalje se sama kad je server može preuzeti.",
  "The voice message waits, and goes by itself once the server can take it.": "Glasovna poruka čeka i šalje se sama kad je server može preuzeti.",
  "Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.":
    "Zatvoreni, ovi skriveni razgovori ne šalju ništa: šalje se dok su otvoreni, osim ako na vrhu uključite „Primanje dok su zatvoreni“.",
};
