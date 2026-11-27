// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network, and a chat of one (components/account-tor.tsx) in German (i18n/de/index.ts).
export const accountTorText: Record<string, string> = {
  "Tor for this {network} account": "Tor für dieses {network}-Konto",
  "A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.": "Ein Chat dieses Kontos ist auf „Über Tor“ gestellt, deshalb geht das ganze Konto nur über Tor, solange das so ist: {network} hat eine Verbindung für alle Chats. Nie direkt.",
  "Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.": "Immer über Tor, egal was der Bereich tut, auch beim Anmelden: Der {network}-Server sieht deine Adresse nie. Langsamer, und nichts geht, solange Tor keine Verbindung bekommt. Anrufe gehen nicht über Tor.",
  "Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.": "Nicht über Tor: Der {network}-Server sieht deine Adresse. Wähle „Wie der Bereich“ oder „Immer über Tor“, um sie zu verbergen.",
  "Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.": "Über Tor, wie der Bereich: Der {network}-Server sieht deine Adresse nicht. Dateien nur dann auch, wenn der Bereich „Alles“ über Tor schickt.",
  "As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Server and networks → Tor.": "Wie der Bereich, der gerade nicht über Tor geht: Der {network}-Server sieht deine Adresse. Tor findest du unter Einstellungen → Server und Netze → Tor.",
  "This space is INVISIBLE: the whole account goes only through Tor too, whatever is chosen here, and has no calls. Never straight.": "Dieser Bereich ist INVISIBLE: Das ganze Konto geht ebenfalls nur über Tor, egal was hier gewählt ist, und hat keine Anrufe. Nie direkt.",
  "Tor uses the bridges chosen under Settings → Server and networks → Tor, as Erevos does.": "Tor nutzt die Brücken, die unter Einstellungen → Server und Netze → Tor gewählt sind, wie Erevos.",
  "This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.": "Dieser Chat geht nur über Tor, nie direkt, egal was Konto oder Bereich sagen. {network} hat eine Verbindung für alle Chats eines Kontos, deshalb geht das ganze Konto über Tor, solange das an ist. Anrufe gehen nicht über Tor.",
  "This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.": "Dieser Chat geht so, wie die Tor-Einstellung des Kontos sagt. Schalte es ein, damit er nur über Tor geht; dann geht das ganze {network}-Konto über Tor, da es eine Verbindung hat.",
  "This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.": "Dieses Telefon kann das Captcha von Signal nicht über Tor zeigen, und mit Tor an wird es nie direkt gezeigt. Schalte Tor für dieses Signal-Konto aus, um dich zu registrieren, oder verknüpfe es mit Signal auf einem anderen Telefon.",
  "This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.": "Dieses Telefon kann die Anmeldeseite von Messenger nicht über Tor zeigen, und mit Tor an wird sie nie direkt gezeigt. Schalte Tor für Messenger zum Anmelden aus und danach wieder ein.",
  "Meta may ask to confirm, or lock for a while, an account that signs in through Tor.": "Meta kann bei einem Konto, das sich über Tor anmeldet, eine Bestätigung verlangen oder es eine Weile sperren.",
  "Through Tor…": "Über Tor…",
  "Account through Tor": "Konto über Tor",
  "The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.": "Dann geht das ganze Messenger-Konto über Tor, nicht nur dieser Chat. Meta kann bei einem Konto, das über Tor kommt, eine Bestätigung verlangen oder es eine Weile sperren.",
  "Not through Tor.": "Nicht über Tor.",
};
