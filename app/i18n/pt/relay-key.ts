// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of a relay proving its own key (lib/relay.ts, Channels; components/relay-key-note.tsx) (i18n/pt/index.ts).
export const relayKey: Record<string, string> = {
  "✓ Your server proved its own key: no one in between can pass for it.": "✓ O seu servidor provou a própria chave: ninguém no meio pode se passar por ele.",
  "Your server does not prove its own key yet: it is older than this app. It works as before; once its operator updates it, Erevos checks its key every time.": "O seu servidor ainda não prova a própria chave: é mais antigo que este app. Funciona como antes; quando o operador dele o atualizar, o Erevos confere a chave dele toda vez.",
  "Forget the key kept for this server?": "Esquecer a chave que o Erevos guarda para este servidor?",
  "Only when its operator told you it has a new key. Erevos then takes the key the server gives next, and checks it every time from then on.": "Só se o operador dele disse a você que ele tem uma chave nova. O Erevos pega então a chave que o servidor der na próxima vez e a confere toda vez daí em diante.",
  "Forget it": "Esquecer",
  "Your server did not prove the key Erevos keeps for it: someone may be in between, or it has a new key. Nothing goes to it until it proves it; your messages wait.": "O seu servidor não provou a chave que o Erevos guarda para ele: pode haver alguém no meio, ou ele tem uma chave nova. Nada vai para ele até que a prove; as suas mensagens esperam.",
  "It has a new key": "Ele tem uma chave nova",
  "the server at {url} did not prove its key: someone may be in between, or the server has a new key": "o servidor em {url} não provou a chave dele: pode haver alguém no meio, ou o servidor tem uma chave nova",
  "the server sent what its channel does not hold": "o servidor enviou algo que não pertence ao canal dele",
  "the server has no channel": "o servidor não tem canal",
};
