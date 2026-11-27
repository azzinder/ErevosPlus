// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of hidden chats that receive while they are closed (lock/hidden-keep.ts,
// lib/place-receiver.ts, the toggle at the top of an open place in app/chat.tsx) (i18n/pt/index.ts).
export const hiddenKeep: Record<string, string> = {
  'Receive while closed': 'Receber quando fechadas',
  'Closed, these hidden chats receive as your other chats do: their contacts see at once that a message came, a notice says only "New message", a call rings with no name, answered with the PIN, and a reminder of their Chat with myself says only "Reminder". For it, their key is kept encrypted with the space, so whoever opens the space and copies what the phone keeps could open them too; the PIN still keeps them out of sight.':
    'Fechadas, estas conversas ocultas recebem como as suas outras conversas: os seus contatos veem logo que uma mensagem chegou, um aviso diz apenas «New message», uma chamada toca sem nome e é atendida com o PIN, e um lembrete da Conversa comigo delas diz só “Lembrete”. Para isso, a chave delas fica guardada cifrada com o espaço, então quem abrir o espaço e copiar o que o telefone guarda poderia abri-las também; o PIN continua a mantê-las fora de vista.',
  'Closed, nothing reads these hidden chats: their key is only behind the PIN, and their messages wait on the server until you open them.':
    'Fechadas, nada lê estas conversas ocultas: a chave delas está só atrás do PIN, e as suas mensagens esperam no servidor até você abri-las.',
  'Their own Matrix, XMPP and Nostr accounts stay connected too: what comes there says only "New message", and a call rings with no name.':
    'As contas Matrix, XMPP e Nostr próprias delas também continuam conectadas: o que chega ali diz apenas «New message», e uma chamada toca sem nome.',
  'Their own Matrix, XMPP and Nostr accounts connect only while they are open.':
    'As contas Matrix, XMPP e Nostr próprias delas se conectam só enquanto estas conversas ocultas estão abertas.',
  // What waits in hidden chats, through their relay only (lib/waiting.ts).
  "Waiting. {reason} It goes by itself once the server can take it.": "Aguardando. {reason} Ela sai sozinha assim que o servidor puder recebê-la.",
  "The voice message waits, and goes by itself once the server can take it.": "A mensagem de voz aguarda, e sai sozinha assim que o servidor puder recebê-la.",
  "Closed, these hidden chats send nothing: it goes while they are open, unless you turn on Receive while closed at the top.":
    "Fechadas, estas conversas ocultas não enviam nada: ela sai enquanto estiverem abertas, a menos que você ligue “Receber quando fechadas” no topo.",
};
