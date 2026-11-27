// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of "last seen" (lib/last-seen.ts): the chat's header and details (app/chat.tsx), and its
// part of Settings → Privacy and security (app/security.tsx, lib/settings.ts) (i18n/sh/index.ts).
export const lastSeen: Record<string, string> = {
  'last seen today at {time}': 'posljednji put viđen danas u {time}',
  'last seen yesterday at {time}': 'posljednji put viđen jučer u {time}',
  'last seen {date} at {time}': 'posljednji put viđen {date} u {time}',
  'Last seen': 'Posljednji put viđen',
  'Who sees when you last had Erevos open: off in a new space, until you turn it on':
    'Ko vidi kad ste posljednji put imali otvoren Erevos: isključeno u novom prostoru, dok ne uključite',
  'Your contacts see the exact time you last had Erevos open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. In all chats of this space; hidden chats have their own switch.':
    'Vaši kontakti vide tačno vrijeme kad ste posljednji put imali otvoren Erevos, a vi vidite njihovo. Ide šifrirano s kraja na kraj samo njima, nikad serveru. U svim razgovorima ovog prostora; skriveni razgovori imaju vlastiti prekidač.',
  'Your contacts here see the exact time you last had these hidden chats open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. Only in these hidden chats, with a time of their own: the space’s chats have their own switch.':
    'Vaši kontakti ovdje vide tačno vrijeme kad ste posljednji put imali otvorene ove skrivene razgovore, a vi vidite njihovo. Ide šifrirano s kraja na kraj samo njima, nikad serveru. Samo u ovim skrivenim razgovorima, s vlastitim vremenom: razgovori prostora imaju vlastiti prekidač.',
  'No one here sees when you last had these hidden chats open, and you see no one’s here either. Those who saw it lose it with your next message.':
    'Niko ovdje ne vidi kad ste posljednji put imali otvorene ove skrivene razgovore, a ni vi ne vidite ničije ovdje. Oni koji su ga vidjeli gube ga s vašom sljedećom porukom.',
  'No one sees when you last had Erevos open, and you see no one’s either. Those who saw it lose it with your next message.':
    'Niko ne vidi kad ste posljednji put imali otvoren Erevos, a ni vi ne vidite ničije. Oni koji su ga vidjeli gube ga s vašom sljedećom porukom.',
  'On: your contacts see the exact time you last had Erevos open, and you see theirs.':
    'Uključeno: vaši kontakti vide tačno vrijeme kad ste posljednji put imali otvoren Erevos, a vi vidite njihovo.',
  'Off: no one sees when you last had Erevos open, and you see no one’s either.':
    'Isključeno: niko ne vidi kad ste posljednji put imali otvoren Erevos, a ni vi ne vidite ničije.',
  'It goes end-to-end encrypted, inside what goes to your contacts anyway, never to the server. Only for the chats of this space: hidden chats have their own switch, in a chat’s details there. Whether you are online now has its own switch in each chat: Appear offline.':
    'Ide šifrirano s kraja na kraj, unutar onoga što ionako ide vašim kontaktima, nikad serveru. Samo za razgovore ovog prostora: skriveni razgovori imaju vlastiti prekidač, u detaljima razgovora tamo. Jeste li sada na mreži ima vlastiti prekidač u svakom razgovoru: Prikazuj me kao da nisam na mreži.',
  // Matrix and XMPP contacts online, as their servers say (lib/net-presence.ts), and our own on Matrix (components/say-typing.tsx).
  "Away":
    "Odsutan",
  "Do not disturb":
    "Ne ometaj",
  "Say when I am online":
    "Reci kad sam na mreži",
  "The others see when you are online, and when you last were. It goes through the {server} server not encrypted, so the server learns it too.":
    "Drugi vide kad ste na mreži i kad ste bili posljednji put. Ide preko {server} servera nešifrirano, pa to saznaje i server.",
  "The others do not see when you are online. You still see it of those whose server says it.":
    "Drugi ne vide kad ste na mreži. Vi to i dalje vidite kod onih čiji server to kaže.",
  "Say when I open and close Erevos":
    "Javi kad otvorim i zatvorim Erevos",
  "As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The server sees that something goes to them then, so it can tell when you open and close Erevos.":
    "Čim se Erevos otvori, kontakti s kojima si razgovarao u zadnjih 30 dana, a koji i sami pokazuju svoje vrijeme, saznaju to odmah, svaki nakon nasumičnog čekanja do jedne minute, najviše svakih 15 minuta. Kad se zatvori, oni kojima je javljeno dok je bio otvoren saznaju kada se zatvorio. Server vidi da im tada nešto ide, pa može znati kada otvaraš i zatvaraš Erevos.",
  "Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The server learns nothing new.":
    "Tvoje vrijeme ide samo s onim što ionako ide tvojim kontaktima: s porukom, s oznakom da su njihove stigle ili pročitane, ili s odgovorom dok imaju otvoren vaš razgovor. Server ne saznaje ništa novo.",
};
