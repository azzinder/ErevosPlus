// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of hidden chats that receive while they are closed (lock/hidden-keep.ts,
// lib/place-receiver.ts, the toggle at the top of an open place in app/chat.tsx) (i18n/es/index.ts).
export const hiddenKeep: Record<string, string> = {
  'Receive while closed': 'Recibir estando cerrados',
  'Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.':
    'Cerrados, estos chats ocultos reciben como tus otros chats: sus contactos ven al instante que un mensaje llegó, un aviso dice solo «New message», una llamada suena sin nombre y se contesta con el PIN, y un recordatorio de su Chat conmigo dice solo «Recordatorio». Para ello, su clave se guarda cifrada con el espacio, así que quien abra el espacio y copie lo que guarda el teléfono también podría abrirlos; el PIN los sigue manteniendo fuera de la vista.',
  'Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the server until you open them.':
    'Cerrados, nada lee estos chats ocultos: su clave está solo tras el PIN, y sus mensajes esperan en el servidor hasta que los abras.',
  'Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.':
    'Sus propias cuentas de Matrix, XMPP y Nostr también siguen conectadas: lo que llega ahí dice solo «New message», y una llamada suena sin nombre.',
  'Their own Matrix, XMPP and Nostr accounts connect only while they are open.':
    'Sus propias cuentas de Matrix, XMPP y Nostr se conectan solo mientras estos chats ocultos están abiertos.',
  // What waits in hidden chats, through their relay only (lib/waiting.ts).
  "Waiting. {reason} It goes by itself once the server can take it.": "En espera. {reason} Se enviará solo en cuanto el servidor pueda recibirlo.",
  "The voice message waits, and goes by itself once the server can take it.": "El mensaje de voz espera, y se enviará solo en cuanto el servidor pueda recibirlo.",
  "Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.":
    "Cerrados, estos chats ocultos no envían nada: se envía mientras estén abiertos, salvo que actives arriba «Recibir estando cerrados».",
};
