// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of a relay proving its own key (lib/relay.ts, Channels; components/relay-key-note.tsx) (i18n/it/index.ts).
export const relayKey: Record<string, string> = {
  "✓ Your server proved its own key: no one in between can pass for it.": "✓ Il tuo server ha dimostrato la sua chiave: nessuno nel mezzo può spacciarsi per lui.",
  "Your server does not prove its own key yet: it is older than this app. It works as before; once its operator updates it, Erevos checks its key every time.": "Il tuo server non dimostra ancora la sua chiave: è più vecchio di questa app. Funziona come prima; quando il suo gestore lo aggiorna, Erevos controlla la sua chiave ogni volta.",
  "Forget the key kept for this server?": "Dimenticare la chiave che Erevos tiene per questo server?",
  "Only when its operator told you it has a new key. Erevos then takes the key the server gives next, and checks it every time from then on.": "Solo se il suo gestore ti ha detto che ha una chiave nuova. Erevos prende allora la chiave che il server darà la prossima volta, e la controlla ogni volta da lì in poi.",
  "Forget it": "Dimenticala",
  "Your server did not prove the key Erevos keeps for it: someone may be in between, or it has a new key. Nothing goes to it until it proves it; your messages wait.": "Il tuo server non ha dimostrato la chiave che Erevos tiene per lui: qualcuno potrebbe essere nel mezzo, o ha una chiave nuova. Niente gli viene inviato finché non la dimostra; i tuoi messaggi aspettano.",
  "It has a new key": "Ha una chiave nuova",
  "the server at {url} did not prove its key: someone may be in between, or the server has a new key": "il server a {url} non ha dimostrato la sua chiave: qualcuno potrebbe essere nel mezzo, o il server ha una chiave nuova",
  "the server sent what its channel does not hold": "il server ha inviato qualcosa che non appartiene al suo canale",
  "the server has no channel": "il server non ha un canale",
};
