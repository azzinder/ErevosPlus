// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of photos, files and voice messages in group chats (i18n/es/index.ts).
export const groups: Record<string, string> = {
  'A voice message did not come. {error}': 'Un mensaje de voz no llegó. {error}',
  'A file goes as it is, up to 100 MB, with whatever it says inside. The server keeps it, encrypted, 14 days, for each member to take.':
    'Un archivo se envía tal cual, hasta 100 MB, con todo lo que contenga. El servidor lo guarda, cifrado, 14 días, para que cada miembro lo recoja.',
  'Tap to play': 'Toca para reproducir',
  'Tap to open': 'Toca para abrir',
  // Who got and who read one of ours (components/group-messages.tsx, components/who-read.tsx); Who read it is in Matrix chats too.
  'Who read it': 'Quién lo leyó',
  'Each member’s phone tells you, end-to-end encrypted. A member whose Erevos is older than these marks tells nothing, and stays under Not yet.':
    'El teléfono de cada miembro te lo dice, cifrado de extremo a extremo. Un miembro cuyo Erevos es anterior a estas marcas no dice nada, y se queda en Todavía no.',
  'No one else was there when you sent it.': 'No había nadie más cuando lo enviaste.',
  'Read ✓✓✓': 'Lo leyeron ✓✓✓',
  'Reached their phone ✓✓': 'Llegó a su teléfono ✓✓',
  'Not yet': 'Todavía no',
  "Public groups stay on the phone: leave them first to move the groups.": "Los grupos públicos se quedan en el teléfono: sal de ellos primero para mover los grupos.",
  "The groups are here already.": "Los grupos ya están aquí.",
  "The groups are on their way to the other device. Try again in a moment.": "Los grupos van de camino al otro dispositivo. Inténtalo de nuevo en un momento.",
  "The groups are too large to move.": "Los grupos son demasiado grandes para moverlos.",
};
