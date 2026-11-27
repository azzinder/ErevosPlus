// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of a relay proving its own key (lib/relay.ts, Channels; components/relay-key-note.tsx) (i18n/de/index.ts).
export const relayKey: Record<string, string> = {
  "✓ Your server proved its own key: no one in between can pass for it.": "✓ Dein Server hat seinen eigenen Schlüssel bewiesen: Niemand dazwischen kann sich als er ausgeben.",
  "Your server does not prove its own key yet: it is older than this app. It works as before; once its operator updates it, Erevos checks its key every time.": "Dein Server beweist seinen eigenen Schlüssel noch nicht: Er ist älter als diese App. Er funktioniert wie bisher; sobald sein Betreiber ihn aktualisiert, prüft Erevos seinen Schlüssel jedes Mal.",
  "Forget the key kept for this server?": "Den Schlüssel vergessen, den Erevos für diesen Server hat?",
  "Only when its operator told you it has a new key. Erevos then takes the key the server gives next, and checks it every time from then on.": "Nur wenn sein Betreiber dir gesagt hat, dass der Server einen neuen Schlüssel hat. Erevos nimmt dann den Schlüssel, den er als Nächstes gibt, und prüft ihn von da an jedes Mal.",
  "Forget it": "Vergessen",
  "Your server did not prove the key Erevos keeps for it: someone may be in between, or it has a new key. Nothing goes to it until it proves it; your messages wait.": "Dein Server hat den Schlüssel, den Erevos dafür hat, nicht bewiesen: Jemand könnte dazwischen sein, oder er hat einen neuen Schlüssel. Nichts geht dorthin, bis er ihn beweist; deine Nachrichten warten.",
  "It has a new key": "Er hat einen neuen Schlüssel",
  "the server at {url} did not prove its key: someone may be in between, or the server has a new key": "der Server unter {url} hat seinen Schlüssel nicht bewiesen: Jemand könnte dazwischen sein, oder der Server hat einen neuen Schlüssel",
  "the server sent what its channel does not hold": "der Server hat etwas gesendet, das nicht zu seinem Kanal gehört",
  "the server has no channel": "der Server hat keinen Kanal",
};
