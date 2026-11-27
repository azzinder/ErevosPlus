// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A chat that goes only through Tor (lib/tor-chats.ts, app/chat.tsx) in Portuguese (i18n/pt/index.ts).
export const torChatText: Record<string, string> = {
  "This chat goes only through Tor, which this build of Erevos does not have.": "Esta conversa passa só pelo Tor, que esta versão do Erevos não tem.",
  "Messages and files with {name} now go only through Tor. They wait while Tor starts.": "Mensagens e ficheiros com {name} passam agora só pelo Tor. Esperam enquanto o Tor arranca.",
  "Messages with {name} go as the space’s Tor setting says.": "As mensagens com {name} passam como diz a definição de Tor do espaço.",
  "Through Tor": "Pelo Tor",
  "This chat goes only through Tor, on its own circuits, whatever the space’s Tor setting: the server does not see your address for it. Slower, and it waits while Tor starts. Calls do not go through Tor.": "Esta conversa passa só pelo Tor, pelos seus próprios circuitos, seja qual for a definição de Tor do espaço: o servidor não vê o teu endereço para ela. Mais lenta, e espera enquanto o Tor arranca. As chamadas não passam pelo Tor.",
  "This chat goes as the space’s Tor setting says. Turn on to send it only through Tor.": "Esta conversa passa como diz a definição de Tor do espaço. Ativa para a enviar só pelo Tor.",
  "This build of Erevos has no Tor, so this chat sends nothing from here while this is on. Turn it off here, or write from the phone.": "Esta versão do Erevos não tem o Tor, por isso esta conversa não envia nada daqui enquanto isto estiver ativo. Desativa aqui, ou escreve a partir do telefone.",
};
