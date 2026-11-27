// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A chat that goes only through Tor (lib/tor-chats.ts, app/chat.tsx) in Italian (i18n/it/index.ts).
export const torChatText: Record<string, string> = {
  "This chat goes only through Tor, which this build of Erevos does not have.": "Questa chat passa solo tramite Tor, che questa versione di Erevos non ha.",
  "Messages and files with {name} now go only through Tor. They wait while Tor starts.": "Messaggi e file con {name} ora passano solo tramite Tor. Aspettano mentre Tor si avvia.",
  "Messages with {name} go as the space’s Tor setting says.": "I messaggi con {name} passano come dice l’impostazione Tor dello spazio.",
  "Through Tor": "Tramite Tor",
  "This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the server does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.": "Questa chat passa solo tramite Tor, su circuiti propri, qualunque sia l’impostazione Tor dello spazio: il server non vede il tuo indirizzo per essa. Più lenta, e aspetta mentre Tor si avvia. Le chiamate non passano tramite Tor.",
  "This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.": "Questa chat passa come dice l’impostazione Tor dello spazio. Attiva per inviarla solo tramite Tor.",
  "This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.": "Questa versione di Erevos non ha Tor, quindi questa chat non invia nulla da qui finché è attivo. Disattivalo qui, oppure scrivi dal telefono.",
};
