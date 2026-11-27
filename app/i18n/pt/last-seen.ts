// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of "last seen" (lib/last-seen.ts): the chat's header and details (app/chat.tsx), and its
// part of Settings → Privacy and security (app/security.tsx, lib/settings.ts) (i18n/pt/index.ts).
export const lastSeen: Record<string, string> = {
  'last seen today at {time}': 'visto por último hoje às {time}',
  'last seen yesterday at {time}': 'visto por último ontem às {time}',
  'last seen {date} at {time}': 'visto por último em {date} às {time}',
  'Last seen': 'Visto por último',
  'Who sees when you last had Erevos open: off in a new space, until you turn it on':
    'Quem vê quando você abriu o Erevos pela última vez: desativado em um espaço novo, até você ativar',
  'Your contacts see the exact time you last had Erevos open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. In all chats of this space; hidden chats have their own switch.':
    'Seus contatos veem a hora exata em que você abriu o Erevos pela última vez, e você vê a deles. Ela vai criptografada de ponta a ponta só para eles, nunca para o servidor. Em todas as conversas deste espaço; as conversas ocultas têm um interruptor próprio.',
  'Your contacts here see the exact time you last had these hidden chats open, and you see theirs. It goes end-to-end encrypted to them only, never to the server. Only in these hidden chats, with a time of their own: the space’s chats have their own switch.':
    'Seus contatos daqui veem a hora exata em que você abriu estas conversas ocultas pela última vez, e você vê a deles. Ela vai criptografada de ponta a ponta só para eles, nunca para o servidor. Só nestas conversas ocultas, com uma hora própria: as conversas do espaço têm um interruptor próprio.',
  'No one here sees when you last had these hidden chats open, and you see no one’s here either. Those who saw it lose it with your next message.':
    'Ninguém daqui vê quando você abriu estas conversas ocultas pela última vez, e você também não vê a de ninguém daqui. Quem a via a perde com a sua próxima mensagem.',
  'No one sees when you last had Erevos open, and you see no one’s either. Those who saw it lose it with your next message.':
    'Ninguém vê quando você abriu o Erevos pela última vez, e você também não vê a de ninguém. Quem a via a perde com a sua próxima mensagem.',
  'On: your contacts see the exact time you last had Erevos open, and you see theirs.':
    'Ativado: seus contatos veem a hora exata em que você abriu o Erevos pela última vez, e você vê a deles.',
  'Off: no one sees when you last had Erevos open, and you see no one’s either.':
    'Desativado: ninguém vê quando você abriu o Erevos pela última vez, e você também não vê a de ninguém.',
  'It goes end-to-end encrypted, inside what goes to your contacts anyway, never to the server. Only for the chats of this space: hidden chats have their own switch, in a chat’s details there. Whether you are online now has its own switch in each chat: Appear offline.':
    'Ela vai criptografada de ponta a ponta, dentro do que já vai para os seus contatos de qualquer forma, nunca para o servidor. Só para as conversas deste espaço: as conversas ocultas têm um interruptor próprio, nos detalhes de uma conversa de lá. Se você está online agora tem um interruptor próprio em cada conversa: Aparecer offline.',
  // Matrix and XMPP contacts online, as their servers say (lib/net-presence.ts), and our own on Matrix (components/say-typing.tsx).
  "Away":
    "Ausente",
  "Do not disturb":
    "Não incomodar",
  "Say when I am online":
    "Avisar quando estou online",
  "The others see when you are online, and when you last were. It goes through the {server} server not encrypted, so the server learns it too.":
    "Os outros veem quando você está online e quando esteve pela última vez. Passa pelo servidor {server} sem criptografia, então o servidor também fica sabendo.",
  "The others do not see when you are online. You still see it of those whose server says it.":
    "Os outros não veem quando você está online. Você ainda vê isso de quem tem um servidor que diz.",
  "Say when I open and close Erevos":
    "Avisar quando eu abrir e fechar o Erevos",
  "As Erevos opens, the contacts you talked with in the last 30 days, who show their own time too, are told so at once, each after a random wait of up to a minute, at most every 15 minutes. As it closes, those told while it was open are told when it closed. The server sees that something goes to them then, so it can tell when you open and close Erevos.":
    "Assim que o Erevos abre, os contatos com quem você conversou nos últimos 30 dias, que também mostram o próprio horário, ficam sabendo na hora, cada um depois de uma espera aleatória de até um minuto, no máximo a cada 15 minutos. Quando ele fecha, quem foi avisado enquanto estava aberto fica sabendo quando fechou. O servidor vê que algo vai para eles nesse momento, então pode saber quando você abre e fecha o Erevos.",
  "Your time goes only with what goes to your contacts anyway: a message, a mark that theirs came or was read, or an answer while they have your chat open. The server learns nothing new.":
    "Seu horário vai só com o que já vai para seus contatos de qualquer forma: uma mensagem, uma marca de que as deles chegaram ou foram lidas, ou uma resposta enquanto eles estão com a conversa de vocês aberta. O servidor não fica sabendo nada de novo.",
};
