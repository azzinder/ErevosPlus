// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A chat that goes only through Tor (lib/tor-chats.ts, app/chat.tsx) in Serbo-Croatian (i18n/sh/index.ts).
export const torChatText: Record<string, string> = {
  "This chat goes only through Tor, which this build of Erevos does not have.": "Ovaj razgovor ide samo preko Tora, koji ova verzija Erevosa nema.",
  "Messages and files with {name} now go only through Tor. They wait while Tor starts.": "Poruke i datoteke sa {name} sada idu samo preko Tora. Čekaju dok se Tor pokreće.",
  "Messages with {name} go as the space’s Tor setting says.": "Poruke sa {name} idu kako kaže Tor podešavanje prostora.",
  "Through Tor": "Preko Tora",
  "This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the server does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.": "Ovaj razgovor ide samo preko Tora, svojim krugovima, bez obzira na Tor podešavanje prostora: server ne vidi tvoju adresu za njega. Sporije, i čeka dok se Tor pokreće. Pozivi ne idu preko Tora.",
  "This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.": "Ovaj razgovor ide kako kaže Tor podešavanje prostora. Uključi da ide samo preko Tora.",
  "This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.": "Ova verzija Erevosa nema Tor, pa ovaj razgovor odavde ne šalje ništa dok je ovo uključeno. Isključi ovdje ili piši s telefona.",
};
