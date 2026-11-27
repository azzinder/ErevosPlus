// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of public groups, joined by a link, and their moderation (i18n/pt/index.ts).
export const publicGroups: Record<string, string> = {
  // What the group keeps as notes (lib/public-groups.ts, lib/public-rules.ts).
  '{who} was muted.': '{who} não pode mais escrever.',
  '{who} can write again.': '{who} pode escrever de novo.',
  '{who} was banned.': '{who} foi banido.',
  '{who} is no longer banned.': 'O banimento de {who} foi retirado.',
  '{who} was taken out.': '{who} foi removido do grupo.',
  '{who} is an admin.': '{who} agora é admin.',
  '{who} is no longer an admin.': '{who} não é mais admin.',
  '{who} owns the group now.': '{who} agora é o dono do grupo.',
  'A message was deleted for everyone.': 'Uma mensagem foi apagada para todos.',
  'An admin took you out of the group.': 'Um admin removeu você do grupo.',
  'The group is full: its owner could not let you in.': 'O grupo está cheio: o dono não conseguiu deixar você entrar.',
  'You joined the group.': 'Você entrou no grupo.',
  'Your request to join was turned down.': 'O seu pedido para entrar foi recusado.',

  // What goes wrong (lib/public-groups.ts).
  'Admins moderate members, and only the owner moderates admins.': 'Os admins moderam os membros, e só o dono modera os admins.',
  'An admin muted you in this group.': 'Um admin silenciou você neste grupo.',
  'Choose the name the group sees.': 'Escolha o nome que o grupo vê.',
  'Only the group’s admins do that.': 'Só os admins do grupo fazem isso.',
  'Only the group’s owner does that.': 'Só o dono do grupo faz isso.',
  'Share the group’s link to have people join.': 'Compartilhe o link do grupo para as pessoas entrarem.',
  'That member is not in the group any more.': 'Esse membro não está mais no grupo.',
  'That message cannot be deleted for everyone.': 'Essa mensagem não pode ser apagada para todos.',
  'This link no longer works. Ask someone in the group for the new one.': 'Este link não funciona mais. Peça o novo a alguém do grupo.',
  'You are in this group already.': 'Você já está neste grupo.',

  // The menu, and making or joining one (app/index.tsx, app/public-groups.tsx, app/join.tsx).
  'Public groups': 'Grupos públicos',
  'Make a group anyone with its link can join, or join one by a link':
    'Crie um grupo em que qualquer pessoa com o link pode entrar, ou entre num pelo link',
  'This build of Erevos has no public groups yet. Update it to make or join one.':
    'Esta versão do Erevos ainda não tem grupos públicos. Atualize para criar um ou entrar num.',
  'A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.':
    'Um grupo público é um grupo em que qualquer pessoa com o link ou o código QR pode pedir para entrar, com um dono e admins que o moderam. As mensagens dele são criptografadas de ponta a ponta como em qualquer grupo, e nenhum servidor fica sabendo quem está nele.',
  'Make a public group': 'Criar um grupo público',
  'Whoever sees the link sees it too.': 'Quem vir o link também o vê.',
  'Your name in it': 'Seu nome nele',
  'Members see this, not your contact name nor who you are in your chats.':
    'Os membros veem isto, não o seu nome de contato nem quem você é nas suas conversas.',
  'A name for this group': 'Um nome para este grupo',
  'Who comes in': 'Quem entra',
  'Anyone with the link': 'Qualquer pessoa com o link',
  'An admin lets them in': 'Um admin aprova a entrada',
  'You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.':
    'Você é o dono do grupo: o seu celular deixa as pessoas entrarem, então elas entram assim que o Erevos estiver aberto nele. Quem tem o link lê o que é dito a partir de quando entra, nunca o que veio antes.',
  'Make the public group': 'Criar o grupo público',
  'Join by a link': 'Entrar por um link',
  'Open the link': 'Abrir o link',
  'That is not a group’s link. It starts with erevos://join': 'Esse não é um link de grupo. Ele começa com erevos://join',
  'Waiting for an answer': 'Aguardando resposta',
  'A group': 'Um grupo',
  'Stop asking': 'Cancelar pedido',
  'The group shows in your chats once its owner’s phone lets you in.':
    'O grupo aparece nas suas conversas assim que o celular do dono deixar você entrar.',
  'Join a group': 'Entrar num grupo',
  'Join {name}': 'Entrar em {name}',
  'Not a group’s link': 'Não é um link de grupo',
  'This link does not hold a group Erevos can ask to join.': 'Este link não contém um grupo em que o Erevos possa pedir para entrar.',
  'Your name in the group': 'Seu nome no grupo',
  'Everyone in the group sees it, beside the start of a key made for this group alone.':
    'Todos no grupo veem, ao lado do começo de uma chave feita só para este grupo.',
  'Its owner’s server': 'O servidor do dono',
  'A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.':
    'Um grupo público: quem tem o link pode entrar, então qualquer pessoa nele pode ser alguém que você não conhece, e pode copiar o que é dito. Os membros veem o nome que você escolher e onde as mensagens deles chegam a você (o seu servidor e a sua fila nele), não quem você é nas suas conversas.',
  'Ask to join': 'Pedir para entrar',
  'Asked to join': 'Pedido enviado',
  'The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.':
    'O grupo aparece nas suas conversas assim que o celular do dono deixar você entrar: quando o Erevos estiver aberto nele e, se o grupo exigir, assim que um admin aprovar.',

  // A public group's link and moderation (app/public-group.tsx, components/public-group.tsx).
  'Public group · tap for its link and members': 'Grupo público · toque para ver o link e os membros',
  'A public group you own. Your phone lets people in when Erevos is open on it.':
    'Um grupo público que é seu. O seu celular deixa as pessoas entrarem quando o Erevos está aberto nele.',
  'A public group you are an admin of.': 'Um grupo público em que você é admin.',
  'A public group. Anyone with its link can ask to join.': 'Um grupo público. Qualquer pessoa com o link pode pedir para entrar.',
  'The group’s link': 'O link do grupo',
  'Share the link': 'Compartilhar o link',
  'The group’s link is copied.': 'O link do grupo foi copiado.',
  'Change the link': 'Trocar o link',
  'The link and QR code shared so far stop working. Requests still waiting at the old one are lost.':
    'O link e o código QR compartilhados até agora deixam de funcionar. Os pedidos ainda aguardando no antigo se perdem.',
  Change: 'Trocar',
  'The group has a new link. The old one no longer works.': 'O grupo tem um link novo. O antigo não funciona mais.',
  'Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.':
    'Quem tem este link pode pedir para entrar e ler o grupo a partir de quando for aceito: nunca o que foi dito antes. Compartilhe só onde você quiser.',
  'The link is made once the owner’s phone has a queue for it on its server.':
    'O link é criado assim que o celular do dono tiver uma fila para ele no servidor dele.',
  'Asking to join': 'Pedidos para entrar',
  'Let in': 'Aceitar',
  'Turn away': 'Recusar',
  'The owner’s phone lets them in once it hears your answer, when Erevos is open on it.':
    'O celular do dono deixa a pessoa entrar assim que receber a sua resposta, quando o Erevos estiver aberto nele.',
  Members: 'Membros',
  '{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.':
    '{n} no grupo. Os nomes são escolhidos, não comprovados: o começo da chave de cada membro aparece ao lado.',
  owner: 'dono',
  admin: 'admin',
  muted: 'silenciado',
  Moderate: 'Moderar',
  'Let them write': 'Deixar escrever',
  '{name} reads nothing the group says from now on, and can ask to join again by the link.':
    '{name} não lê mais nada do que for dito no grupo, e pode pedir para entrar de novo pelo link.',
  Ban: 'Banir',
  '{name} is taken out, and what their phone asks after is turned away.':
    '{name} sai do grupo, e o que o celular dessa pessoa pedir depois é recusado.',
  'Make an admin': 'Tornar admin',
  'No longer an admin': 'Tirar de admin',
  'Hand the group over': 'Transferir o grupo',
  '{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.':
    '{name} passa a ser o dono do grupo: o celular dessa pessoa aprova as entradas, e o link muda para um no servidor dela. Você continua admin.',
  'Hand over': 'Transferir',
  Banned: 'Banidos',
  'Lift the ban': 'Retirar o banimento',
  'Delete for everyone': 'Apagar para todos',
  'Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.':
    'O celular de cada membro a apaga quando recebe o aviso. Quem já leu pode ter guardado uma cópia.',
  'It goes from every member’s phone, as from yours.': 'Ela some do celular de cada membro, como do seu.',
  'You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.':
    'O grupo é seu: fechar o grupo remove todos os membros, e ninguém mais poderá escrever nele. Para que ele continue sem você, transfira-o primeiro.',
  'The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.':
    'O celular do dono vai remover você na próxima vez que o Erevos estiver aberto nele. Depois disso, você não lê mais nada do grupo.',
  "Public groups stay on the phone: make and join them there.": "Os grupos públicos ficam no celular: crie-os e entre neles por lá.",
};
