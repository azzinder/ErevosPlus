// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of more in Nostr chats and public posts: pins for this device, deleting, stickers, polls (i18n/es/index.ts).
export const nostrMore: Record<string, string> = {
  'They are removed from this phone. Of your own, the others are asked to remove them too: their Nostr apps may or may not do so.':
    'Se quitan de este teléfono. De los tuyos, también se pide a los demás que los quiten: sus apps de Nostr pueden hacerlo o no.',
  'Your stickers go as photos do, encrypted: other Nostr apps show them as photos.': 'Tus stickers van como las fotos, cifrados: otras apps de Nostr los muestran como fotos.',
  'Open for': 'Abierta durante',
  Vote: 'Votar',
  Results: 'Resultados',
  'Open until {when}': 'Abierta hasta {when}',
  'Your vote is public: anyone can see what you chose.': 'Tu voto es público: cualquiera puede ver lo que elegiste.',
  '{n} vote': '{n} voto',
  '{n} votes': '{n} votos',
  'Through Tor: on': 'Por Tor: activado',
  "What you send here, the look-up of where they read, and the photos and files of this chat go only through Tor, on circuits of their own, whatever the space’s Tor way; never without Tor. What comes to you follows your Nostr account, whose servers are read once for all its chats.":
    'Lo que envías aquí, la búsqueda de dónde leen y las fotos y archivos de este chat van solo por Tor, en circuitos propios, sea cual sea el modo Tor del espacio; nunca sin Tor. Lo que te llega sigue a tu cuenta de Nostr, cuyos servidores se leen una vez para todos sus chats.',
  "Not through Tor now: the Nostr servers see your address.":
    'Ahora no va por Tor: los servidores de Nostr ven tu dirección.',
  "Not through Tor now: the Nostr servers see your address. Tor for this account is under Settings → Server and networks → Nostr chats.":
    'Ahora no va por Tor: los servidores de Nostr ven tu dirección. El Tor de esta cuenta está en Ajustes → Servidor y redes → Chats de Nostr.',
  'A chat can also go through Tor by itself, on circuits of its own: «Through Tor» at its foot. It does, whatever is chosen here.':
    'Un chat también puede ir por Tor por sí solo, en circuitos propios: «Por Tor» al pie del chat. Entonces va así, elijas lo que elijas aquí.',
};
