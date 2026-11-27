// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network, and a chat of one (components/account-tor.tsx) in Italian (i18n/it/index.ts).
export const accountTorText: Record<string, string> = {
  "Tor for this {network} account": "Tor per questo account {network}",
  "A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.": "Una chat di questo account è impostata per passare da Tor, quindi tutto l’account passa solo da Tor finché è così: {network} ha una sola connessione per tutte le chat. Mai diretto.",
  "Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.": "Sempre tramite Tor, qualunque cosa faccia lo spazio, anche all’accesso: il server {network} non vede mai il tuo indirizzo. Più lento, e non parte nulla finché Tor non si connette. Le chiamate non passano da Tor.",
  "Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.": "Non tramite Tor: il server {network} vede il tuo indirizzo. Scegli «Come lo spazio» o «Sempre tramite Tor» per nasconderlo.",
  "Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.": "Tramite Tor, come lo spazio: il server {network} non vede il tuo indirizzo. Anche i file, solo quando lo spazio manda «Tutto» tramite Tor.",
  "As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Server and networks → Tor.": "Come lo spazio, che ora non passa da Tor: il server {network} vede il tuo indirizzo. Tor è in Impostazioni → Server e reti → Tor.",
  "This space is INVISIBLE: the whole account goes only through Tor too, whatever is chosen here, and has no calls. Never straight.": "Questo spazio è INVISIBLE: tutto l’account passa anch’esso solo tramite Tor, qualunque cosa sia scelta qui, e non ha chiamate. Mai diretto.",
  "Tor uses the bridges chosen under Settings → Server and networks → Tor, as Erevos does.": "Tor usa i bridge scelti in Impostazioni → Server e reti → Tor, come Erevos.",
  "This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.": "Questa chat passa solo da Tor, mai diretta, qualunque cosa dicano l’account o lo spazio. {network} ha una sola connessione per tutte le chat di un account, quindi tutto l’account passa da Tor finché è attivo. Le chiamate non passano da Tor.",
  "This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.": "Questa chat segue l’impostazione Tor dell’account. Attivalo per mandarla solo tramite Tor; allora tutto l’account {network} passa da Tor, perché ha una sola connessione.",
  "This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.": "Questo telefono non può mostrare il captcha di Signal tramite Tor, e con Tor attivo non viene mai mostrato in diretta. Disattiva Tor per questo account Signal per registrarti, o collegalo a Signal su un altro telefono.",
  "This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.": "Questo telefono non può mostrare la pagina di accesso di Messenger tramite Tor, e con Tor attivo non viene mai mostrata in diretta. Disattiva Tor per Messenger per accedere, e riattivalo dopo.",
  "Meta may ask to confirm, or lock for a while, an account that signs in through Tor.": "Meta può chiedere una conferma, o bloccare per un po’, un account che accede tramite Tor.",
  "Through Tor…": "Tramite Tor…",
  "Account through Tor": "Account tramite Tor",
  "The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.": "Allora tutto l’account Messenger passa tramite Tor, non solo questa chat. Meta può chiedere una conferma, o bloccare per un po’, un account che arriva tramite Tor.",
  "Not through Tor.": "Non tramite Tor.",
};
