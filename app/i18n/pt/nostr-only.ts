// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of texting with no relay, through Nostr, and the relay invites that come by themselves (app/chat.tsx, lib/nostr-chats.ts) (i18n/pt/index.ts).
export const nostrOnly: Record<string, string> = {
  'No Nostr server took it: {reason}': 'Nenhum servidor do Nostr o aceitou: {reason}',
  'Contact added. Messages to it are end-to-end encrypted. Compare the safety number with theirs. With no server between you, texts, stickers, reactions, photos, files and voice messages go through Nostr; calls need a server or their phone nearby.': 'Contacto adicionado. As mensagens para ele são cifradas de ponta a ponta. Compara o número de segurança com o dele. Sem servidor entre vocês, textos, autocolantes, reações, fotos, ficheiros e mensagens de voz vão pelo Nostr; as chamadas precisam de um servidor ou do telemóvel dele por perto.',
  '{name} gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': '{name} te deu por conta própria um lugar no servidor dele. Fotos, mensagens de voz e chamadas também vão agora por lá, com todos.',
  'A contact gave you a place on their server, by itself. Photos, voice messages and calls now go there too, with everyone.': 'Um contato te deu por conta própria um lugar no servidor dele. Fotos, mensagens de voz e chamadas também vão agora por lá, com todos.',
  'An invite to a contact’s server came, but it was not taken. {error}': 'Chegou um convite para o servidor de um contato, mas não foi aceito. {error}',
  'Sticker sent through Nostr, end-to-end encrypted.': 'Autocolante enviado pelo Nostr, cifrado de ponta a ponta.',
  'Photo sent through Nostr, end-to-end encrypted.': 'Foto enviada pelo Nostr, cifrada de ponta a ponta.',
  'File sent through Nostr, end-to-end encrypted.': 'Ficheiro enviado pelo Nostr, cifrado de ponta a ponta.',
  'Photos and files go through Nostr, which cannot be reached.': 'As fotos e os ficheiros vão pelo Nostr, que agora não está acessível.',
  'The photo waits, and goes by itself once Nostr can take it.': 'A foto espera e segue sozinha assim que o Nostr a puder receber.',
  'The file waits, and goes by itself once Nostr can take it.': 'O ficheiro espera e segue sozinho assim que o Nostr o puder receber.',
  '{have} of {count} pieces of the photo have come.': 'Chegaram {have} de {count} partes da foto.',
  'With no server, files can be {size} MB at most.': 'Sem servidor, os ficheiros podem ter {size} MB no máximo.',
  'No Nostr server or file server took it: {reason}': 'Nenhum servidor do Nostr nem servidor de ficheiros o aceitou: {reason}',
};
