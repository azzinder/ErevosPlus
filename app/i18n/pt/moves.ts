// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of a relay queue that moves on a deletion, a block or junk (lib/queue-move.ts), and of
// deleting and blocking a contact in chat details (app/chat.tsx), as in i18n/el/moves.ts.
export const moves: Record<string, string> = {
  // Chat details: deleting and blocking.
  'Block contact': 'Bloquear contato',
  'Delete {name}? Your chat with them goes from this phone. Erevos gives you a new server queue and tells your other contacts quietly, so {name} can no longer write to you. With your contact link they can still ask to talk again.':
    'Apagar {name}? A conversa de vocês sai deste celular. O Erevos te dá uma nova fila no servidor e avisa seus outros contatos em silêncio, para que {name} não possa mais te escrever. Com o seu link de contato, essa pessoa ainda pode pedir para voltar a conversar.',
  'Block {name}? As with deleting, and what they send later is dropped, a request too. You can unblock them under Blocked contacts.':
    'Bloquear {name}? Como ao apagar, e o que essa pessoa enviar depois é descartado, até um pedido. Você pode desbloquear em “Contatos bloqueados”.',
  '{name} is deleted. Your other contacts learn your new queue as soon as the server answers.':
    'Você apagou {name}. Seus outros contatos ficam sabendo da nova fila assim que o servidor responder.',
  '{name} is blocked. Your other contacts learn your new queue as soon as the server answers.':
    'Você bloqueou {name}. Seus outros contatos ficam sabendo da nova fila assim que o servidor responder.',
  'The server could not be reached, so your queue changes as soon as it can. Until then {name} can still write to it, but nothing they send shows.':
    'Não foi possível alcançar o servidor, então sua fila muda assim que der. Até lá, {name} ainda pode escrever nela, mas nada do que enviar aparece.',
  '{name} is still in one of your groups, and can write to you there. Leave it, or ask its admin to take them out.':
    '{name} ainda está em um dos seus grupos e pode te escrever lá. Saia do grupo ou peça a quem o administra para tirar {name}.',
  '{name} is still in {n} of your groups, and can write to you there. Leave them, or ask their admins to take {name} out.':
    '{name} ainda está em {n} dos seus grupos e pode te escrever lá. Saia deles ou peça a quem os administra para tirar {name}.',
  // Relay and new contacts: a new contact link, and who is blocked.
  'New contact link': 'Novo link de contato',
  'Make a new contact link? The links and QR codes you gave before work until {date}, then no more. Your contacts are not affected.':
    'Criar um novo link de contato? Os links e códigos QR que você deu antes funcionam até {date} e depois não mais. Seus contatos não são afetados.',
  'You have a new contact link. The links and QR codes you gave before work until {date}.':
    'Você tem um novo link de contato. Os links e códigos QR que você deu antes funcionam até {date}.',
  "Create your server queue first, on New chat.": "Crie primeiro sua fila no servidor, em “Nova conversa”.",
  'Blocked contacts': 'Contatos bloqueados',
  'No one is blocked.': 'Ninguém está bloqueado.',
  // What a move says once it is made.
  'Junk filled your server queue, so Erevos gave you a new one and told your contacts. Whoever sent it does not know the new one.':
    'Lixo encheu sua fila no servidor, então o Erevos te deu uma nova e avisou seus contatos. Quem mandava o lixo não conhece a nova.',
  'Junk comes to your new queue too, so one of your contacts or the server sends it. Erevos does not change it again before tomorrow.':
    'Também chega lixo na sua nova fila, então quem manda é um dos seus contatos ou o próprio servidor. O Erevos não vai trocá-la de novo antes de amanhã.',
  'Junk filled the queue your contact link names, so you have a new link. The links and QR codes you gave before work until {date}.':
    'Lixo encheu a fila que o seu link de contato indica, então você tem um link novo. Os links e códigos QR que você deu antes funcionam até {date}.',
  'The server had lost your queue, so you have a new one. Your contacts are told quietly.':
    'O servidor tinha perdido sua fila, então você tem uma nova. Seus contatos são avisados em silêncio.',
  // Adding someone who is blocked here.
  '{name} is blocked here. Unblock them to add them again?':
    'Você bloqueou {name} aqui. Desbloquear o contato para adicioná-lo de novo?',
  'This contact is blocked here. Unblock them to add them again?':
    'Você bloqueou este contato aqui. Desbloquear para adicioná-lo de novo?',
  // The queue the contact link names, lost by the relay.
  'The server had lost the queue your contact link names, so you have a new link. The links and QR codes you gave before no longer work.':
    'O servidor tinha perdido a fila que o seu link de contato indica, então você tem um link novo. Os links e códigos QR que você deu antes não funcionam mais.',
  'A phone nearby brought your messages, so Erevos gave you a new server queue and told your contacts. That phone does not know the new one.':
    'Um celular por perto trouxe suas mensagens, então o Erevos te deu uma fila nova no servidor e avisou seus contatos. Aquele celular não conhece a nova.',
};
