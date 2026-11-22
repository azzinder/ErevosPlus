// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network, and a chat of one (components/account-tor.tsx) in Spanish (i18n/es/index.ts).
export const accountTorText: Record<string, string> = {
  "Tor for this {network} account": "Tor para esta cuenta de {network}",
  "A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.": "Un chat de esta cuenta está configurado para ir por Tor, así que toda la cuenta va solo por Tor mientras lo esté: {network} tiene una conexión para todos sus chats. Nunca directo.",
  "Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.": "Siempre por Tor, haga lo que haga el espacio, también al iniciar sesión: el servidor de {network} nunca ve tu dirección. Más lento, y nada sale mientras Tor no conecte. Las llamadas no van por Tor.",
  "Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.": "No por Tor: el servidor de {network} ve tu dirección. Elige «Como el espacio» o «Siempre por Tor» para ocultarla.",
  "Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.": "Por Tor, como el espacio: el servidor de {network} no ve tu dirección. Los archivos también, solo cuando el espacio envía «Todo» por Tor.",
  "As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Relay and networks → Tor.": "Como el espacio, que ahora no va por Tor: el servidor de {network} ve tu dirección. Tor está en Ajustes → Relay y redes → Tor.",
  "Tor uses the bridges chosen under Settings → Relay and networks → Tor, as Erevos does.": "Tor usa los puentes elegidos en Ajustes → Relay y redes → Tor, como Erevos.",
  "This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.": "Este chat va solo por Tor, nunca directo, digan lo que digan la cuenta o el espacio. {network} tiene una conexión para todos los chats de una cuenta, así que toda la cuenta va por Tor mientras esto esté activado. Las llamadas no van por Tor.",
  "This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.": "Este chat va como dice el ajuste de Tor de la cuenta. Actívalo para enviarlo solo por Tor; entonces toda la cuenta de {network} va por Tor, ya que tiene una conexión.",
  "This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.": "Este teléfono no puede mostrar el captcha de Signal por Tor, y con Tor activado nunca se muestra directo. Desactiva Tor para esta cuenta de Signal para registrarte, o vincúlala con Signal en otro teléfono.",
  "This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.": "Este teléfono no puede mostrar la página de inicio de sesión de Messenger por Tor, y con Tor activado nunca se muestra directa. Desactiva Tor para Messenger para iniciar sesión, y actívalo de nuevo después.",
  "Meta may ask to confirm, or lock for a while, an account that signs in through Tor.": "Meta puede pedir confirmación, o bloquear un tiempo, una cuenta que inicia sesión por Tor.",
  "Through Tor…": "Por Tor…",
  "Account through Tor": "Cuenta por Tor",
  "The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.": "Entonces toda la cuenta de Messenger va por Tor, no solo este chat. Meta puede pedir confirmación, o bloquear un tiempo, una cuenta que llega por Tor.",
  "Not through Tor.": "No por Tor.",
};
