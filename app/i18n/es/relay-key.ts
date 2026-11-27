// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of a relay proving its own key (lib/relay.ts, Channels; components/relay-key-note.tsx) (i18n/es/index.ts).
export const relayKey: Record<string, string> = {
  "✓ Your server proved its own key: no one in between can pass for it.": "✓ Tu servidor demostró su propia clave: nadie en medio puede hacerse pasar por él.",
  "Your server does not prove its own key yet: it is older than this app. It works as before; once its operator updates it, Erevos checks its key every time.": "Tu servidor aún no demuestra su propia clave: es anterior a esta app. Funciona como antes; cuando su operador lo actualice, Erevos comprobará su clave cada vez.",
  "Forget the key kept for this server?": "¿Olvidar la clave que Erevos guarda para este servidor?",
  "Only when its operator told you it has a new key. Erevos then takes the key the server gives next, and checks it every time from then on.": "Solo si su operador te dijo que tiene una clave nueva. Erevos toma entonces la clave que el servidor dé la próxima vez y la comprueba cada vez desde entonces.",
  "Forget it": "Olvidarla",
  "Your server did not prove the key Erevos keeps for it: someone may be in between, or it has a new key. Nothing goes to it until it proves it; your messages wait.": "Tu servidor no demostró la clave que Erevos guarda para él: puede haber alguien en medio, o tiene una clave nueva. Nada va a él hasta que la demuestre; tus mensajes esperan.",
  "It has a new key": "Tiene una clave nueva",
  "the server at {url} did not prove its key: someone may be in between, or the server has a new key": "el servidor en {url} no demostró su clave: puede haber alguien en medio, o el servidor tiene una clave nueva",
  "the server sent what its channel does not hold": "el servidor envió algo que no pertenece a su canal",
  "the server has no channel": "el servidor no tiene canal",
};
