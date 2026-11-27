// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of photos, files and voice messages in group chats (i18n/pt/index.ts).
export const groups: Record<string, string> = {
  'A voice message did not come. {error}': 'Uma mensagem de voz não chegou. {error}',
  'A file goes as it is, up to 100 MB, with whatever it says inside. The server keeps it, encrypted, 14 days, for each member to take.':
    'Um arquivo vai como está, até 100 MB, com tudo o que tem dentro. O servidor o guarda, criptografado, por 14 dias, para cada membro buscar.',
  'Tap to play': 'Toque para ouvir',
  'Tap to open': 'Toque para abrir',
  // Who got and who read one of ours (components/group-messages.tsx, components/who-read.tsx); Who read it is in Matrix chats too.
  'Who read it': 'Quem leu',
  'Each member’s phone tells you, end-to-end encrypted. A member whose Erevos is older than these marks tells nothing, and stays under Not yet.':
    'O celular de cada membro avisa você, com criptografia de ponta a ponta. Um membro cujo Erevos é mais antigo que estas marcas não avisa nada e fica em Ainda não.',
  'No one else was there when you sent it.': 'Não havia mais ninguém quando você a enviou.',
  'Read ✓✓✓': 'Leram ✓✓✓',
  'Reached their phone ✓✓': 'Chegou ao celular deles ✓✓',
  'Not yet': 'Ainda não',
  "Public groups stay on the phone: leave them first to move the groups.": "Os grupos públicos ficam no celular: saia deles primeiro para mover os grupos.",
  "The groups are here already.": "Os grupos já estão aqui.",
  "The groups are on their way to the other device. Try again in a moment.": "Os grupos estão a caminho do outro dispositivo. Tente de novo em instantes.",
  "The groups are too large to move.": "Os grupos são grandes demais para mover.",
};
