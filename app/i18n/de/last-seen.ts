// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of "last seen" (lib/last-seen.ts): the chat's header and details (app/chat.tsx), and its
// part of Settings → Privacy and security (app/security.tsx, lib/settings.ts) (i18n/de/index.ts).
export const lastSeen: Record<string, string> = {
  'last seen today at {time}': 'zuletzt online heute um {time}',
  'last seen yesterday at {time}': 'zuletzt online gestern um {time}',
  'last seen {date} at {time}': 'zuletzt online am {date} um {time}',
  'Last seen': 'Zuletzt online',
  'Who sees when you last had Erevos open: off in a new space, until you turn it on':
    'Wer sieht, wann du Erevos zuletzt offen hattest: aus in einem neuen Bereich, bis du es einschaltest',
  'Your contacts see the exact time you last had Erevos open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. In all chats of this space; hidden chats have their own switch.':
    'Deine Kontakte sehen die genaue Zeit, zu der du Erevos zuletzt offen hattest, und du siehst ihre. Sie geht Ende-zu-Ende-verschlüsselt nur an sie, nie an den Server. In allen Chats dieses Bereichs; versteckte Chats haben einen eigenen Schalter.',
  'Your contacts here see the exact time you last had these hidden chats open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. Only in these hidden chats, with a time of their own: the space’s chats have their own switch.':
    'Deine Kontakte hier sehen die genaue Zeit, zu der du diese versteckten Chats zuletzt offen hattest, und du siehst ihre. Sie geht Ende-zu-Ende-verschlüsselt nur an sie, nie an den Server. Nur in diesen versteckten Chats, mit einer eigenen Zeit: Die Chats des Bereichs haben einen eigenen Schalter.',
  'No one here sees when you last had these hidden chats open, and you see no one’s here either. Those who saw it lose it with your next message.':
    'Niemand hier sieht, wann du diese versteckten Chats zuletzt offen hattest, und du siehst hier auch niemandes. Wer sie sah, verliert sie mit deiner nächsten Nachricht.',
  'No one sees when you last had Erevos open, and you see no one’s either. Those who saw it lose it with your next message.':
    'Niemand sieht, wann du Erevos zuletzt offen hattest, und du siehst auch niemandes. Wer sie sah, verliert sie mit deiner nächsten Nachricht.',
  'On: your contacts see the exact time you last had Erevos open, and you see theirs.':
    'An: Deine Kontakte sehen die genaue Zeit, zu der du Erevos zuletzt offen hattest, und du siehst ihre.',
  'Off: no one sees when you last had Erevos open, and you see no one’s either.':
    'Aus: Niemand sieht, wann du Erevos zuletzt offen hattest, und du siehst auch niemandes.',
  'It goes end-to-end encrypted, inside what goes to your contacts anyway, never to the server. Only for the chats of this space: hidden chats have their own switch, in a chat’s details there. Whether you are online now has its own switch in each chat: Appear offline.':
    'Sie geht Ende-zu-Ende-verschlüsselt, innerhalb dessen, was ohnehin an deine Kontakte geht, nie an den Server. Nur für die Chats dieses Bereichs: Versteckte Chats haben einen eigenen Schalter, dort in den Details eines Chats. Ob du gerade online bist, hat in jedem Chat einen eigenen Schalter: Offline erscheinen.',
  // Matrix and XMPP contacts online, as their servers say (lib/net-presence.ts), and our own on Matrix (components/say-typing.tsx).
  "Away":
    "Abwesend",
  "Do not disturb":
    "Nicht stören",
  "Say when I am online":
    "Sagen, wenn ich online bin",
  "The others see when you are online, and when you last were. It goes through the {server} server not encrypted, so the server learns it too.":
    "Die anderen sehen, wann du online bist und wann du es zuletzt warst. Es geht unverschlüsselt über den {server}-Server, also erfährt es auch der Server.",
  "The others do not see when you are online. You still see it of those whose server says it.":
    "Die anderen sehen nicht, wann du online bist. Du siehst es weiterhin bei denen, deren Server es sagt.",
  "Say when I open and close Erevos":
    "Sagen, wenn ich Erevos öffne und schließe",
  "As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The server sees that something goes to them then, so it can tell when you open and close Erevos.":
    "Sobald Erevos öffnet, erfahren es die Kontakte, mit denen du in den letzten 30 Tagen geschrieben hast und die ihre eigene Zeit auch zeigen, sofort, jeder nach einer zufälligen Wartezeit von bis zu einer Minute, höchstens alle 15 Minuten. Sobald es schließt, erfahren die, denen es gesagt wurde, solange es offen war, wann es geschlossen wurde. Der Server sieht, dass dann etwas an sie geht, und kann so erkennen, wann du Erevos öffnest und schließt.",
  "Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The server learns nothing new.":
    "Deine Zeit geht nur mit dem, was ohnehin an deine Kontakte geht: eine Nachricht, eine Markierung, dass ihre ankam oder gelesen wurde, oder eine Antwort, während sie euren Chat offen haben. Der Server erfährt nichts Neues.",
};
