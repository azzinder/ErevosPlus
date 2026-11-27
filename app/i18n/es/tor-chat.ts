// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A chat that goes only through Tor (lib/tor-chats.ts, app/chat.tsx) in Spanish (i18n/es/index.ts).
export const torChatText: Record<string, string> = {
  "This chat goes only through Tor, which this build of Erevos does not have.": "Este chat va solo por Tor, que esta versión de Erevos no tiene.",
  "Messages and files with {name} now go only through Tor. They wait while Tor starts.": "Los mensajes y archivos con {name} ahora van solo por Tor. Esperan mientras Tor arranca.",
  "Messages with {name} go as the space’s Tor setting says.": "Los mensajes con {name} van como dice el ajuste de Tor del espacio.",
  "Through Tor": "Por Tor",
  "This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the server does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.": "Este chat va solo por Tor, por sus propios circuitos, diga lo que diga el ajuste de Tor del espacio: el servidor no ve tu dirección para él. Más lento, y espera mientras Tor arranca. Las llamadas no van por Tor.",
  "This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.": "Este chat va como dice el ajuste de Tor del espacio. Actívalo para enviarlo solo por Tor.",
  "This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.": "Esta versión de Erevos no tiene Tor, así que este chat no envía nada desde aquí mientras esto esté activado. Desactívalo aquí o escribe desde el teléfono.",
};
