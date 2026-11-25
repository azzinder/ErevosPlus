// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The warnings that this phone's internet address may be seen (lib/ip-warning.ts, components/ip-warning.tsx) in Serbo-Croatian (i18n/sh/index.ts).
export const ipWarningStrings: Record<string, string> = {
  "Your internet address can be seen": "Tvoja IP adresa može biti vidljiva",
  "On {network}, what you send here can go without Tor. The servers that carry it, yours and your contact's, can then see this phone's internet address (IP address), though not what you wrote.": "Na {network}, ono što ovdje šalješ može ići bez Tora. Serveri koji to nose, tvoj i server tvog kontakta, tada mogu vidjeti IP adresu ovog telefona, ali ne i ono što je napisano.",
  "On {network}, what you send here can go without Tor. Your {network} server then sees this phone's internet address (IP address), though not what you wrote.": "Na {network}, ono što ovdje šalješ može ići bez Tora. Tvoj {network} server tada vidi IP adresu ovog telefona, ali ne i ono što je napisano.",
  "Calls never go through Tor. The call relay that carries the sound and picture, yours or your contact's, sees this phone's internet address (IP address), though not what is said.": "Pozivi nikad ne idu preko Tora. Relay za pozive koji nosi zvuk i sliku, tvoj ili tvog kontakta, vidi IP adresu ovog telefona, ali ne i ono što se govori.",
  "This file is on a server your contact chose. Fetched without Tor, that server sees this phone's internet address (IP address), though not what the file holds.": "Ova datoteka je na serveru koji je odabrao tvoj kontakt. Preuzeta bez Tora, taj server vidi IP adresu ovog telefona, ali ne i ono što datoteka sadrži.",
  "The site sees this phone's internet address (IP address), as any web page you open does. To hide it, open links in Tor Browser.": "Stranica vidi IP adresu ovog telefona, kao i svaka web-stranica koju otvoriš. Da je sakriješ, otvaraj linkove u Tor Browseru.",
  "To show a link's preview, the page is fetched from its site. Without Tor, the site sees this phone's internet address (IP address).": "Da bi se prikazao pregled linka, stranica se preuzima s njenog sajta. Bez Tora, sajt vidi IP adresu ovog telefona.",
  "On {network}, joining goes through a server. Without Tor, it sees this phone's internet address (IP address).": "Na {network}, pridruživanje ide preko servera. Bez Tora, on vidi IP adresu ovog telefona.",
  "A contact invited this phone to a place on their relay. Taken without Tor, that relay sees this phone's internet address (IP address), though not what you send. Not taken, the invite is let go.": "Kontakt je pozvao ovaj telefon na mjesto na svom releju. Ako ga prihvatiš bez Tora, taj relej vidi internet adresu (IP adresu) ovog telefona, ali ne i ono što šalješ. Ako ga ne prihvatiš, poziv se odbacuje.",
  "Guide": "Vodič",
  "Through Tor for this chat": "Preko Tora za ovaj razgovor",
  "A station plays straight from its server, which then sees this phone's internet address (IP address) for as long as it plays, as any site does.": "Stanica svira direktno sa svog servera, koji tada vidi IP adresu ovog telefona sve dok svira, kao i svaki sajt.",
  "A TV channel plays straight from its server, which then sees this phone's internet address (IP address) for as long as it plays, as any site does.": "TV kanal se pušta direktno sa svog servera, koji tada vidi IP adresu ovog telefona sve dok se pušta, kao i svaki sajt.",
  "To pair by a code, the two phones meet on public Nostr relays. Without Tor, those relays see this phone's internet address (IP address), though not the code or your contact links, which go encrypted.": "Za uparivanje kodom, dva telefona se sreću na javnim Nostr relayima. Bez Tora, ti relayi vide internet adresu ovog telefona (IP adresu), ali ne i kod ni vaše kontakt linkove, koji idu šifrovani.",
  "A phone beside this one has no internet and asks this one to bring its messages from the relay {network}, which this phone does not use. That relay then sees this phone's internet address (IP address), though not what the messages say, which only that phone opens.": "Telefon pored ovog nema internet i traži od ovog da donese njegove poruke sa relaya {network}, koji ovaj telefon ne koristi. Taj relay tada vidi internet adresu ovog telefona (IP adresu), ali ne i šta poruke kažu, a njih otvara samo onaj telefon.",
  "Without Tor: the relays see your internet address.": "Bez Tora: relayi vide tvoju internet adresu.",
};
