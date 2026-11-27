// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of texting with no relay, through Nostr, and the relay invites that come by themselves (app/chat.tsx, lib/nostr-chats.ts) (i18n/es/index.ts).
export const nostrOnly: Record<string, string> = {
  'No Nostr server took it: {reason}': 'Ningún servidor de Nostr lo aceptó: {reason}',
  'Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. With no server between you, texts, stickers, reactions, photos, files and voice messages go through Nostr; calls need a server or their phone nearby.': 'Contacto añadido. Los mensajes a él están cifrados de extremo a extremo. Compara el número de seguridad con el suyo. Sin servidor entre vosotros, los textos, stickers, reacciones, fotos, archivos y mensajes de voz van por Nostr; las llamadas necesitan un servidor o su teléfono cerca.',
  '{name} gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': '{name} te dio por sí solo un sitio en su servidor. Las fotos, los mensajes de voz y las llamadas ahora también van por ahí, con todos.',
  'A contact gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': 'Un contacto te dio por sí solo un sitio en su servidor. Las fotos, los mensajes de voz y las llamadas ahora también van por ahí, con todos.',
  'An invite to a contact’s server came, but it was not taken. {error}': 'Llegó una invitación al servidor de un contacto, pero no se aceptó. {error}',
  'Sticker sent through Nostr, end-to-end encrypted.': 'Sticker enviado por Nostr, cifrado de extremo a extremo.',
  'Photo sent through Nostr, end-to-end encrypted.': 'Foto enviada por Nostr, cifrada de extremo a extremo.',
  'File sent through Nostr, end-to-end encrypted.': 'Archivo enviado por Nostr, cifrado de extremo a extremo.',
  'Photos and files go through Nostr, which cannot be reached.': 'Las fotos y los archivos van por Nostr, que no está al alcance ahora.',
  'The photo waits, and goes by itself once Nostr can take it.': 'La foto espera y sale sola en cuanto Nostr pueda tomarla.',
  'The file waits, and goes by itself once Nostr can take it.': 'El archivo espera y sale solo en cuanto Nostr pueda tomarlo.',
  '{have} of {count} pieces of the photo have come.': 'Han llegado {have} de {count} trozos de la foto.',
  'With no server, files can be {size} MB at most.': 'Sin servidor, los archivos pueden pesar {size} MB como máximo.',
  'No Nostr server or file server took it: {reason}': 'Ningún servidor de Nostr ni servidor de archivos lo tomó: {reason}',
};
