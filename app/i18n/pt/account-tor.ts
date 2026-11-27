// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network, and a chat of one (components/account-tor.tsx) in Portuguese (i18n/pt/index.ts).
export const accountTorText: Record<string, string> = {
  "Tor for this {network} account": "Tor para esta conta do {network}",
  "A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.": "Uma conversa desta conta está definida para passar pelo Tor, então a conta inteira passa só pelo Tor enquanto estiver assim: o {network} tem uma conexão para todas as conversas. Nunca direto.",
  "Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.": "Sempre pelo Tor, faça o espaço o que fizer, também ao entrar: o servidor do {network} nunca vê o seu endereço. Mais lento, e nada sai enquanto o Tor não conectar. As chamadas não passam pelo Tor.",
  "Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.": "Não pelo Tor: o servidor do {network} vê o seu endereço. Escolha «Como o espaço» ou «Sempre pelo Tor» para escondê-lo.",
  "Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.": "Pelo Tor, como o espaço: o servidor do {network} não vê o seu endereço. Os arquivos também, só quando o espaço envia «Tudo» pelo Tor.",
  "As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Server and networks → Tor.": "Como o espaço, que agora não passa pelo Tor: o servidor do {network} vê o seu endereço. O Tor fica em Configurações → Servidor e redes → Tor.",
  "This space is INVISIBLE: the whole account goes only through Tor too, whatever is chosen here, and has no calls. Never straight.": "Este espaço está em INVISIBLE: toda a conta também passa só pelo Tor, seja qual for a escolha aqui, e não tem chamadas. Nunca direto.",
  "Tor uses the bridges chosen under Settings → Server and networks → Tor, as Erevos does.": "O Tor usa as pontes escolhidas em Configurações → Servidor e redes → Tor, como o Erevos.",
  "This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.": "Esta conversa passa só pelo Tor, nunca direto, digam o que disserem a conta ou o espaço. O {network} tem uma conexão para todas as conversas de uma conta, então a conta inteira passa pelo Tor enquanto isto estiver ativo. As chamadas não passam pelo Tor.",
  "This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.": "Esta conversa segue a configuração de Tor da conta. Ative para enviá-la só pelo Tor; então a conta inteira do {network} passa pelo Tor, pois tem uma conexão.",
  "This phone cannot show Signal’s captcha through Tor, and with Tor on it is never shown straight. Turn Tor for this Signal account off to register, or link to Signal on another phone.": "Este telefone não pode mostrar o captcha do Signal pelo Tor, e com o Tor ativo ele nunca é mostrado direto. Desative o Tor desta conta do Signal para se registrar, ou vincule-a ao Signal em outro telefone.",
  "This phone cannot show Messenger’s sign-in page through Tor, and with Tor on it is never shown straight. Turn Tor for Messenger off to sign in, and on again after.": "Este telefone não pode mostrar a página de entrada do Messenger pelo Tor, e com o Tor ativo ela nunca é mostrada direto. Desative o Tor do Messenger para entrar, e ative de novo depois.",
  "Meta may ask to confirm, or lock for a while, an account that signs in through Tor.": "A Meta pode pedir confirmação, ou bloquear por um tempo, uma conta que entra pelo Tor.",
  "Through Tor…": "Pelo Tor…",
  "Account through Tor": "Conta pelo Tor",
  "The whole Messenger account then goes through Tor, not only this chat. Meta may ask to confirm, or lock for a while, an account that comes through Tor.": "Então toda a conta do Messenger passa pelo Tor, não só esta conversa. A Meta pode pedir confirmação, ou bloquear por um tempo, uma conta que chega pelo Tor.",
  "Not through Tor.": "Não pelo Tor.",
};
