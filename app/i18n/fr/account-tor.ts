// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network, and a chat of one (components/account-tor.tsx) in French (i18n/fr/index.ts).
export const accountTorText: Record<string, string> = {
  "Tor for this {network} account": "Tor pour ce compte {network}",
  "A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.": "Une discussion de ce compte est réglée pour passer par Tor, donc tout le compte passe uniquement par Tor tant que c’est le cas : {network} a une seule connexion pour toutes ses discussions. Jamais en direct.",
  "Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.": "Toujours par Tor, quoi que fasse l’espace, connexion comprise : le serveur {network} ne voit jamais ton adresse. Plus lent, et rien ne part tant que Tor ne se connecte pas. Les appels ne passent pas par Tor.",
  "Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.": "Pas par Tor : le serveur {network} voit ton adresse. Choisis « Comme l’espace » ou « Toujours par Tor » pour la cacher.",
  "Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.": "Par Tor, comme l’espace : le serveur {network} ne voit pas ton adresse. Les fichiers aussi, seulement quand l’espace envoie « Tout » par Tor.",
  "As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Relay and networks → Tor.": "Comme l’espace, qui ne passe pas par Tor en ce moment : le serveur {network} voit ton adresse. Tor se trouve dans Réglages → Relais et réseaux → Tor.",
  "Tor uses the bridges chosen under Settings → Relay and networks → Tor, as Erevos does.": "Tor utilise les ponts choisis dans Réglages → Relais et réseaux → Tor, comme Erevos.",
  "This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.": "Cette discussion passe uniquement par Tor, jamais en direct, quoi que disent le compte ou l’espace. {network} a une seule connexion pour toutes les discussions d’un compte, donc tout le compte passe par Tor tant que c’est activé. Les appels ne passent pas par Tor.",
  "This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.": "Cette discussion suit le réglage Tor du compte. Active-le pour qu’elle passe uniquement par Tor ; tout le compte {network} passe alors par Tor, car il a une seule connexion.",
  "This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.": "Ce téléphone ne peut pas afficher le captcha de Signal par Tor, et avec Tor activé il n’est jamais affiché en direct. Désactive Tor pour ce compte Signal pour t’inscrire, ou associe-le à Signal sur un autre téléphone.",
  "This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.": "Ce téléphone ne peut pas afficher la page de connexion de Messenger par Tor, et avec Tor activé elle n’est jamais affichée en direct. Désactive Tor pour Messenger pour te connecter, puis réactive-le.",
  "Meta may ask to confirm, or lock for a while, an account that signs in through Tor.": "Meta peut demander une confirmation, ou bloquer un moment, un compte qui se connecte par Tor.",
  "Through Tor…": "Par Tor…",
  "Account through Tor": "Compte par Tor",
  "The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.": "Tout le compte Messenger passe alors par Tor, pas seulement cette discussion. Meta peut demander une confirmation, ou bloquer un moment, un compte qui arrive par Tor.",
  "Not through Tor.": "Pas par Tor.",
};
