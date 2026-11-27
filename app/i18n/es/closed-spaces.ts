// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of a closed space that says a message came while another is open (app/security.tsx,
// lib/closed-notices.ts), and of a message that came or went through Nostr (app/chat.tsx) (i18n/es/index.ts).
export const closedSpaces: Record<string, string> = {
  'Went through Nostr.': 'Enviado por Nostr.',
  'Came through Nostr.': 'Llegó por Nostr.',
  'Went through the server.': 'Enviado por el servidor.',
  'Came through the server.': 'Llegó por el servidor.',
  'Went to their phone nearby.': 'Enviado a su teléfono cercano.',
  'Came from a phone nearby.': 'Llegó de un teléfono cercano.',
  'Went over LoRa.': 'Enviado por LoRa.',
  'Went to the phones nearby, which carry it to their server.': 'Enviado a los teléfonos cercanos, que lo llevan a su servidor.',
  'Went to the phones nearby, in case theirs is one of them.': 'Enviado a los teléfonos cercanos, por si el suyo es uno de ellos.',
  '{what} through Nostr, end-to-end encrypted.': '{what} por Nostr, cifrado de extremo a extremo.',
  'Took the last text {seconds} s after it was sent, at {time}.': 'Aceptó el último texto {seconds} s después de enviarlo, a las {time}.',
  'Did not take the last text, at {time}. {why}': 'No aceptó el último texto, a las {time}. {why}',
  'No text given to it since Erevos started.': 'No se le ha dado ningún texto desde que se abrió Erevos.',
  'Read on since {time}.': 'Se lee desde las {time}.',
  'Could not be read on, at {time}. {why}': 'No se pudo leer, a las {time}. {why}',
  'Not read on yet.': 'Aún no se lee.',
  'What the servers did last': 'Lo último que hicieron los servidores',
  'Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts\' servers show here too once a text went to them.': 'Desde que se abrió Erevos, solo en este teléfono y solo mientras funciona: si cada servidor aceptó el último texto que recibió y si se lee. Los servidores de tus contactos también aparecen aquí cuando les llega un texto.',
  'It did not say it took it within {seconds} seconds.': 'No dijo que lo aceptó en {seconds} segundos.',
  'It refused it: "{reason}"': 'Lo rechazó: «{reason}»',
  'It refused it.': 'Lo rechazó.',
  'Not reached: {reason}': 'No se alcanzó: {reason}',
  'This space only while open': 'Este espacio solo mientras está abierto',
  'Also while another space is open': 'También mientras otro espacio está abierto',
  'While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its server outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its server may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.': 'Mientras otro espacio está abierto, este dice solo «Mensaje nuevo», como aquel, nunca qué espacio; sus chats ocultos no dicen nada entonces. Para ello el teléfono guarda las direcciones de sus colas en su servidor fuera de su contraseña, entre ellas la cola en la que escribe cada uno de sus contactos, hasta 64 contactos, nunca sus claves, quiénes son sus contactos ni sus mensajes, y su servidor puede saber que los dos espacios están en un mismo teléfono. Si este espacio va por Tor (Mensajes o Todo), solo se le pregunta por Tor: mientras el espacio abierto tiene Tor desactivado, o su Tor se está iniciando o acaba de fallar, este no dice nada, y lo que llegó se avisa en cuanto Tor está listo ahí.',
  'Closed, this space receives nothing: its messages wait at its server and come when it opens.': 'Cerrado, este espacio no recibe nada: sus mensajes esperan en su servidor y llegan cuando se abre.',
  'This space has no queue at a server yet: it can say nothing while closed.': 'Este espacio aún no tiene una cola en un servidor: cerrado no puede decir nada.',
  'Tor is not ready.': 'Tor no está listo.',
};
