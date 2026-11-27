// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A chat that goes only through Tor (lib/tor-chats.ts, app/chat.tsx) in German (i18n/de/index.ts).
export const torChatText: Record<string, string> = {
  "This chat goes only through Tor, which this build of Erevos does not have.": "Dieser Chat läuft nur über Tor, das diese Erevos-Version nicht hat.",
  "Messages and files with {name} now go only through Tor. They wait while Tor starts.": "Nachrichten und Dateien mit {name} laufen jetzt nur über Tor. Sie warten, während Tor startet.",
  "Messages with {name} go as the space’s Tor setting says.": "Nachrichten mit {name} laufen so, wie die Tor-Einstellung des Bereichs es sagt.",
  "Through Tor": "Über Tor",
  "This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the server does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.": "Dieser Chat läuft nur über Tor, auf eigenen Verbindungen, egal was die Tor-Einstellung des Bereichs sagt: Der Server sieht dafür deine Adresse nicht. Langsamer, und er wartet, während Tor startet. Anrufe laufen nicht über Tor.",
  "This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.": "Dieser Chat läuft so, wie die Tor-Einstellung des Bereichs es sagt. Einschalten, um ihn nur über Tor zu senden.",
  "This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.": "Diese Erevos-Version hat kein Tor, darum sendet dieser Chat von hier nichts, solange das eingeschaltet ist. Schalte es hier aus oder schreibe vom Telefon.",
};
