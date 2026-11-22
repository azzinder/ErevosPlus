// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network, and a chat of one (components/account-tor.tsx) in Serbo-Croatian (i18n/sh/index.ts).
export const accountTorText: Record<string, string> = {
  "Tor for this {network} account": "Tor za ovaj {network} račun",
  "A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.": "Jedan razgovor ovog računa je postavljen da ide preko Tora, pa cijeli račun ide samo preko Tora dok je tako: {network} ima jednu vezu za sve razgovore. Nikad direktno.",
  "Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.": "Uvijek preko Tora, šta god prostor radio, i pri prijavi: {network} server nikad ne vidi vašu adresu. Sporije, i ništa ne ide dok se Tor ne poveže. Pozivi ne idu preko Tora.",
  "Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.": "Ne preko Tora: {network} server vidi vašu adresu. Izaberite „Kao prostor” ili „Uvijek preko Tora” da je sakrijete.",
  "Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.": "Preko Tora, kao prostor: {network} server ne vidi vašu adresu. Datoteke također, samo kad prostor šalje „Sve” preko Tora.",
  "As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Relay and networks → Tor.": "Kao prostor, koji sada ne ide preko Tora: {network} server vidi vašu adresu. Tor je u Postavke → Relay i mreže → Tor.",
  "Tor uses the bridges chosen under Settings → Relay and networks → Tor, as Erevos does.": "Tor koristi mostove izabrane u Postavke → Relay i mreže → Tor, kao i Erevos.",
  "This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.": "Ovaj razgovor ide samo preko Tora, nikad direktno, šta god kažu račun ili prostor. {network} ima jednu vezu za sve razgovore računa, pa cijeli račun ide preko Tora dok je ovo uključeno. Pozivi ne idu preko Tora.",
  "This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.": "Ovaj razgovor ide kako kaže Tor podešavanje računa. Uključite da ide samo preko Tora; tada ceo {network} račun ide preko Tora, jer ima jednu vezu.",
  "This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.": "Ovaj telefon ne može prikazati Signalov captcha preko Tora, a s uključenim Torom nikad se ne prikazuje direktno. Isključite Tor za ovaj Signal račun da se registrujete, ili ga povežite sa Signalom na drugom telefonu.",
  "This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.": "Ovaj telefon ne može prikazati stranicu za prijavu na Messenger preko Tora, a s uključenim Torom nikad se ne prikazuje direktno. Isključite Tor za Messenger da se prijavite, i uključite ga ponovo poslije.",
  "Meta may ask to confirm, or lock for a while, an account that signs in through Tor.": "Meta može tražiti potvrdu, ili na neko vrijeme zaključati, račun koji se prijavljuje preko Tora.",
  "Through Tor…": "Preko Tora…",
  "Account through Tor": "Račun preko Tora",
  "The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.": "Tada cijeli Messenger račun ide preko Tora, ne samo ovaj razgovor. Meta može tražiti potvrdu, ili na neko vrijeme zaključati, račun koji dolazi preko Tora.",
  "Not through Tor.": "Ne preko Tora.",
};
