// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of a closed space that says a message came while another is open (app/security.tsx,
// lib/closed-notices.ts), and of a message that came or went through Nostr (app/chat.tsx) (i18n/pt/index.ts).
export const closedSpaces: Record<string, string> = {
  'Went through Nostr.': 'Foi pelo Nostr.',
  'Came through Nostr.': 'Veio pelo Nostr.',
  'Went through the server.': 'Foi pelo servidor.',
  'Came through the server.': 'Veio pelo servidor.',
  'Went to their phone nearby.': 'Foi para o telefone dele por perto.',
  'Came from a phone nearby.': 'Veio de um telefone por perto.',
  'Went over LoRa.': 'Foi por LoRa.',
  'Went to the phones nearby, which carry it to their server.': 'Foi para os telefones por perto, que o levam ao servidor dele.',
  'Went to the phones nearby, in case theirs is one of them.': 'Foi para os telefones por perto, caso o dele seja um deles.',
  '{what} through Nostr, end-to-end encrypted.': '{what} pelo Nostr, criptografada de ponta a ponta.',
  'Took the last text {seconds} s after it was sent, at {time}.': 'Aceitou o último texto {seconds} s depois do envio, às {time}.',
  'Did not take the last text, at {time}. {why}': 'Não aceitou o último texto, às {time}. {why}',
  'No text given to it since Erevos started.': 'Nenhum texto lhe foi dado desde que o Erevos abriu.',
  'Read on since {time}.': 'Lido desde as {time}.',
  'Could not be read on, at {time}. {why}': 'Não foi possível ler, às {time}. {why}',
  'Not read on yet.': 'Ainda não é lido.',
  'What the servers did last': 'O que os servidores fizeram por último',
  'Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts\' servers show here too once a text went to them.': 'Desde que o Erevos abriu, só neste telefone e só enquanto está funcionando: se cada servidor aceitou o último texto que recebeu e se é lido. Os servidores dos seus contatos também aparecem aqui quando um texto foi para eles.',
  'It did not say it took it within {seconds} seconds.': 'Não disse que o aceitou em {seconds} segundos.',
  'It refused it: "{reason}"': 'Recusou-o: «{reason}»',
  'It refused it.': 'Recusou-o.',
  'Not reached: {reason}': 'Não alcançado: {reason}',
  'This space only while open': 'Este espaço só enquanto aberto',
  'Also while another space is open': 'Também enquanto outro espaço está aberto',
  'While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its server outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its server may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.': 'Enquanto outro espaço está aberto, este diz só “Nova mensagem”, como aquele, nunca qual espaço; as conversas ocultas dele não dizem nada então. Para isso o celular guarda os endereços das filas dele no servidor fora da senha dele, entre elas a fila em que cada contato dele escreve, até 64 contatos, nunca as chaves, quem são os contatos dele ou as mensagens, e o servidor dele pode perceber que os dois espaços estão no mesmo celular. Se este espaço vai pelo Tor (Mensagens ou Tudo), ele só é consultado pelo Tor: enquanto o espaço aberto está com o Tor desativado, ou o Tor dele está iniciando ou acabou de falhar, este não diz nada, e o que chegou é avisado assim que o Tor estiver pronto ali.',
  'Closed, this space receives nothing: its messages wait at its server and come when it opens.': 'Fechado, este espaço não recebe nada: as mensagens dele esperam no servidor e chegam quando ele abre.',
  'This space has no queue at a server yet: it can say nothing while closed.': 'Este espaço ainda não tem uma fila em um servidor: fechado, não pode dizer nada.',
  'Tor is not ready.': 'O Tor não está pronto.',
};
