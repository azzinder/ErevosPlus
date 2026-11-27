// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of "last seen" (lib/last-seen.ts): the chat's header and details (app/chat.tsx), and its
// part of Settings → Privacy and security (app/security.tsx, lib/settings.ts) (i18n/es/index.ts).
export const lastSeen: Record<string, string> = {
  'last seen today at {time}': 'última vez hoy a las {time}',
  'last seen yesterday at {time}': 'última vez ayer a las {time}',
  'last seen {date} at {time}': 'última vez el {date} a las {time}',
  'Last seen': 'Última vez',
  'Who sees when you last had Erevos open: off in a new space, until you turn it on':
    'Quién ve cuándo tuviste Erevos abierto por última vez: desactivado en un espacio nuevo, hasta que lo actives',
  'Your contacts see the exact time you last had Erevos open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. In all chats of this space; hidden chats have their own switch.':
    'Tus contactos ven la hora exacta en que tuviste Erevos abierto por última vez, y tú ves la suya. Va cifrada de extremo a extremo solo a ellos, nunca al servidor. En todos los chats de este espacio; los chats ocultos tienen su propio interruptor.',
  'Your contacts here see the exact time you last had these hidden chats open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. Only in these hidden chats, with a time of their own: the space’s chats have their own switch.':
    'Tus contactos de aquí ven la hora exacta en que tuviste estos chats ocultos abiertos, y tú ves la suya. Va cifrada de extremo a extremo solo a ellos, nunca al servidor. Solo en estos chats ocultos, con una hora propia: los chats del espacio tienen su propio interruptor.',
  'No one here sees when you last had these hidden chats open, and you see no one’s here either. Those who saw it lose it with your next message.':
    'Nadie de aquí ve cuándo tuviste estos chats ocultos abiertos, y tú tampoco ves la de nadie de aquí. Quienes la veían la pierden con tu siguiente mensaje.',
  'No one sees when you last had Erevos open, and you see no one’s either. Those who saw it lose it with your next message.':
    'Nadie ve cuándo tuviste Erevos abierto por última vez, y tú tampoco ves la de nadie. Quienes la veían la pierden con tu siguiente mensaje.',
  'On: your contacts see the exact time you last had Erevos open, and you see theirs.':
    'Activado: tus contactos ven la hora exacta en que tuviste Erevos abierto por última vez, y tú ves la suya.',
  'Off: no one sees when you last had Erevos open, and you see no one’s either.':
    'Desactivado: nadie ve cuándo tuviste Erevos abierto por última vez, y tú tampoco ves la de nadie.',
  'It goes end-to-end encrypted, inside what goes to your contacts anyway, never to the server. Only for the chats of this space: hidden chats have their own switch, in a chat’s details there. Whether you are online now has its own switch in each chat: Appear offline.':
    'Va cifrada de extremo a extremo, dentro de lo que ya va a tus contactos de todos modos, nunca al servidor. Solo para los chats de este espacio: los chats ocultos tienen su propio interruptor, en los detalles de un chat de allí. Si estás en línea ahora tiene su propio interruptor en cada chat: Aparecer sin conexión.',
  // Matrix and XMPP contacts online, as their servers say (lib/net-presence.ts), and our own on Matrix (components/say-typing.tsx).
  "Away":
    "Ausente",
  "Do not disturb":
    "No molestar",
  "Say when I am online":
    "Avisar cuando estoy en línea",
  "The others see when you are online, and when you last were. It goes through the {server} server not encrypted, so the server learns it too.":
    "Los demás ven cuándo estás en línea y cuándo lo estuviste por última vez. Pasa por el servidor de {server} sin cifrar, así que el servidor también lo sabe.",
  "The others do not see when you are online. You still see it of those whose server says it.":
    "Los demás no ven cuándo estás en línea. Tú sigues viéndolo de aquellos cuyo servidor lo dice.",
  "Say when I open and close Erevos":
    "Avisar cuando abro y cierro Erevos",
  "As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The server sees that something goes to them then, so it can tell when you open and close Erevos.":
    "En cuanto Erevos se abre, los contactos con los que hablaste en los últimos 30 días, que también muestran su propia hora, lo saben al momento, cada uno tras una espera aleatoria de hasta un minuto, como mucho cada 15 minutos. Al cerrarse, a quienes se avisó mientras estaba abierto se les dice cuándo se cerró. El servidor ve que entonces algo va hacia ellos, así que puede saber cuándo abres y cierras Erevos.",
  "Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The server learns nothing new.":
    "Tu hora va solo con lo que va a tus contactos de todos modos: un mensaje, una marca de que los suyos llegaron o se leyeron, o una respuesta mientras tienen vuestro chat abierto. El servidor no sabe nada nuevo.",
};
