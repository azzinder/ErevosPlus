// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of linked devices: the account on the phone and on a computer (lib/devices.ts, app/devices.tsx; i18n/pt/index.ts).
export const devices: Record<string, string> = {
  // Linking and the links (lib/devices.ts).
  Computer: 'Computador',
  'Linked devices could not open.': 'Não foi possível abrir os dispositivos conectados.',
  'That device is linked already.': 'Esse dispositivo já está conectado.',
  'That is not a code from Linked devices.': 'Esse não é um código de “Dispositivos conectados”.',
  'The code changed. Compare it again.': 'O código mudou. Compare de novo.',
  'This device is no longer linked to a phone.': 'Este dispositivo não está mais conectado a um celular.',
  'This is a linked device. Link from the phone that holds the account.':
    'Este é um dispositivo conectado. Faça a conexão pelo celular que tem a conta.',
  'This space has chats of its own. Link from a space with none, such as one that opens with a new password.':
    'Este espaço tem conversas próprias. Faça a conexão por um espaço sem nenhuma, como um que abre com uma senha nova.',
  'This space is linked already.': 'Este espaço já está conectado.',
  'These hidden chats are linked already.': 'Estas conversas ocultas já estão conectadas.',
  'These hidden chats have chats of their own. Link from hidden chats with none, such as those a new PIN sets.':
    'Estas conversas ocultas têm conversas próprias. Conecte a partir de conversas ocultas sem nenhuma, como as que um novo PIN abre.',
  'Too long to go through the phone.': 'Longo demais para passar pelo celular.',
  'Type the server address in Server first: linked devices reach this phone through it.':
    'Digite primeiro o endereço do servidor em “Servidor”: os dispositivos conectados chegam a este celular por ele.',
  '{n} devices are linked already, the most there can be.': '{n} dispositivos já estão conectados, o máximo possível.',

  // The menu, and the chat on a linked device (app/index.tsx, app/chat.tsx).
  'Linked devices': 'Dispositivos conectados',
  'Not sent by the phone': 'Não enviada pelo celular',
  'These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.':
    'Estas conversas vêm do backup de um dispositivo conectado: você pode lê-las aqui, mas não escrever nelas. Para escrever, conecte de novo este dispositivo ao celular, em Dispositivos conectados.',
  'This account on a computer or in a browser too': 'Esta conta também num computador ou num navegador',
  "This chat is the phone's: move it into hidden chats there.": 'Esta conversa é do celular: mova-a para as conversas ocultas por lá.',
  'These hidden chats are linked to a phone: move the chat into them there.':
    'Estas conversas ocultas estão conectadas a um celular: mova a conversa para elas por lá.',
  "This chat is the phone's: move it out of the hidden chats there.": 'Esta conversa é do celular: tire-a das conversas ocultas por lá.',

  // A call answered on another device of the account (components/call-screen.tsx, lib/call-lines.ts).
  'Answered on another device': 'Atendida em outro dispositivo',
  'answered on another device': 'atendida em outro dispositivo',

  // Linked devices (app/devices.tsx).
  'All of it': 'Todas',
  'The last month': 'Do último mês',
  'The last week': 'Da última semana',
  None: 'Nenhuma',
  'Web browser': 'Navegador',
  'Code copied. Paste it on the phone in Settings → Data and devices → Linked devices.': 'Código copiado. Cole no celular em “Configurações → Dados e dispositivos → Dispositivos conectados”.',
  'Code copied. Paste it on the phone, in Linked devices of the same hidden chats.':
    'Código copiado. Cole no celular, em “Dispositivos conectados” das mesmas conversas ocultas.',
  'Linked. The chats come from the phone, and with them the messages it chose to bring over.':
    'Conectado. As conversas vêm do celular, e com elas as mensagens que ele escolheu trazer.',
  'Not linked. Someone else may have read the code. Make a new one, and link again.':
    'Não conectado. Outra pessoa pode ter lido o código. Gere um novo e conecte de novo.',
  'Now the computer shows a code too. If it is {code}, tap They match there.':
    'Agora o computador também mostra um código. Se for {code}, toque em “São iguais” lá.',
  'Unlink this device': 'Desconectar este dispositivo',
  'Unlink {name}': 'Desconectar {name}',
  "The account's chats leave this device, messages and all, and so do the accounts it brought over from the phone. The phone keeps them.":
    'As conversas da conta saem deste dispositivo, com mensagens e tudo, e as contas que ele trouxe do celular também. O celular continua com elas.',
  'Nothing more goes to it, and nothing it sends is taken. What it has stays on it, behind its own lock.':
    'Nada mais vai para ele, e nada do que ele enviar é aceito. O que ele tem fica nele, atrás do próprio bloqueio.',
  'Unlinked.': 'Desconectado.',
  'Unlinked here. The phone was not told: unlink this device there too.':
    'Desconectado aqui. O celular não foi avisado: desconecte este dispositivo lá também.',
  'Unlinked. The device was not told, and gets nothing more.': 'Desconectado. O dispositivo não foi avisado, e não recebe mais nada.',
  'The messages go to it now. What it has already is not kept twice.':
    'As mensagens estão indo para ele agora. O que ele já tem não fica guardado duas vezes.',
  'Messages to bring over': 'Mensagens a trazer',
  'Photos and files too': 'Fotos e arquivos também',
  'Linked to {name}': 'Conectado a {name}',
  'Since {when}. Last heard from {last}.': 'Desde {when}. Último contato: {last}.',
  'This device has the chats and groups of the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server. Calls ring here too. New groups, public groups and group calls stay on the phone for now.':
    'Este dispositivo tem as conversas e os grupos do celular que tem a conta. O que você escreve aqui passa pelo celular, que precisa estar ligado e acessar o servidor. As chamadas também tocam aqui. Por enquanto, novos grupos, grupos públicos e chamadas em grupo ficam no celular.',
  'These hidden chats have the chats and groups of the same hidden chats on the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server, with these hidden chats open or receiving while closed there. Calls ring here too. New groups and group calls stay on the phone for now.':
    'Estas conversas ocultas têm as conversas e os grupos das mesmas conversas ocultas do celular que tem a conta. O que você escreve aqui passa pelo celular, que precisa estar ligado e acessar o servidor, com estas conversas ocultas abertas lá ou recebendo quando fechadas. As chamadas também tocam aqui. Por enquanto, novos grupos e chamadas em grupo ficam no celular.',
  'Make or join groups on the phone that holds this account.': 'Crie grupos ou entre em grupos pelo celular que tem esta conta.',
  'Group calls ring on the phone that holds this account, for now. Call from there.':
    'Por enquanto, as chamadas em grupo tocam no celular que tem esta conta. Ligue de lá.',
  'The same account on a computer or in a browser. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Hidden chats and what a second password opens never go with it: each links on its own, from inside it.':
    'A mesma conta num computador ou num navegador. A conta continua sendo a do celular: ele repassa, criptografado de ponta a ponta, o que chega e o que o computador escreve, então os contatos não veem nada de novo. As conversas ocultas e o que uma segunda senha abre nunca vão junto: cada um se conecta por conta própria, de dentro.',
  'These hidden chats on a computer or in a browser, linked on their own. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Nothing of it shows in the space, nor goes to its linked devices.':
    'Estas conversas ocultas num computador ou num navegador, conectadas por conta própria. A conta continua sendo a do celular: ele repassa, criptografado de ponta a ponta, o que chega e o que o computador escreve, então os contatos não veem nada de novo. Nada disso aparece no espaço, nem vai para os dispositivos conectados dele.',
  'Link {name}': 'Conectar {name}',
  'Once you tap Link, the computer shows this code. Link only if it shows the same:':
    'Assim que você tocar em “Conectar”, o computador mostra este código. Só conecte se ele mostrar o mesmo:',
  Link: 'Conectar',
  Devices: 'Dispositivos',
  'Linked {when}. Last heard from {last}.': 'Conectado em {when}. Último contato: {last}.',
  'Linked {when}.': 'Conectado em {when}.',
  'Waiting for They match to be tapped on it.': 'Aguardando tocarem em “São iguais” nele.',
  'Bringing over messages: {n} so far.': 'Trazendo as mensagens: {n} até agora.',
  'Bring over': 'Trazer',
  'Bring over messages again': 'Trazer as mensagens de novo',
  'Signed in as {name}: this device has a token of its own there. Now tap Link to my phone.':
    'Você entrou como {name}: este dispositivo tem ali um token próprio. Agora toque em “Conectar ao meu celular”.',
  'Link a computer to this phone': 'Conectar um computador a este celular',
  "On the computer, open Settings → Data and devices → Linked devices → Link to my phone. Then scan its code with this phone's camera, or copy it there and paste it here.":
    'No computador, abra “Configurações → Dados e dispositivos → Dispositivos conectados → Conectar ao meu celular”. Depois escaneie o código dele com a câmera deste celular, ou copie lá e cole aqui.',
  "On the computer, open the same hidden chats with their PIN, then Linked devices → Link to my phone in them. Then scan its code with this phone's camera while these hidden chats are open, or copy it there and paste it here.":
    'No computador, abra as mesmas conversas ocultas com o PIN delas e, dentro delas, “Dispositivos conectados → Conectar ao meu celular”. Depois escaneie o código dele com a câmera deste celular enquanto estas conversas ocultas estão abertas, ou copie lá e cole aqui.',
  'Code from the computer': 'Código do computador',
  Next: 'Avançar',
  'Link to my phone': 'Conectar ao meu celular',
  'The phone read the code. Does it show this one too?': 'O celular leu o código. Ele também mostra este?',
  'They match': 'São iguais',
  'They differ': 'São diferentes',
  'On the phone that holds the account, scan this code with the camera, or paste it in Settings → Data and devices → Linked devices. This space must have no chats of its own.':
    'No celular que tem a conta, escaneie este código com a câmera, ou cole em “Configurações → Dados e dispositivos → Dispositivos conectados”. Este espaço não pode ter conversas próprias.',
  'On the phone that holds the account, open the same hidden chats with their PIN, then scan this code with the camera, or paste it in Linked devices in them. These hidden chats must have no chats of their own.':
    'No celular que tem a conta, abra as mesmas conversas ocultas com o PIN delas e depois escaneie este código com a câmera, ou cole nos “Dispositivos conectados” delas. Estas conversas ocultas não podem ter conversas próprias.',
  'Copy the code': 'Copiar o código',
  'Share the code': 'Compartilhar o código',
  'Waiting for the phone. The code works for half an hour.': 'Aguardando o celular. O código vale por meia hora.',
  'Use this when this device is the computer: its chats become those of the phone that holds the account.':
    'Use isto quando este dispositivo for o computador: as conversas dele passam a ser as do celular que tem a conta.',
  'Use this when this device is the computer: these hidden chats become those of the same hidden chats on the phone that holds the account.':
    'Use isto quando este dispositivo for o computador: estas conversas ocultas passam a ser as mesmas conversas ocultas do celular que tem a conta.',
  'These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.':
    'Estas conversas ocultas ainda não têm fila no servidor: dentro delas, digite o endereço do servidor em “Para usuários avançados” e depois crie a fila delas.',
  'The phone answers on a queue of this device on a server: the one the phone uses, or any other. If the server asks for a token, sign in when it offers that, or type one.':
    'O celular responde numa fila deste dispositivo num servidor: o que o celular usa, ou qualquer outro. Se o servidor pedir um token, entre quando ele oferecer essa opção, ou digite um.',
  'Name of this device': 'Nome deste dispositivo',
  'Tap Link to my phone, and a QR code for the phone shows here.': 'Toque em “Conectar ao meu celular”, e um código QR para o celular aparece aqui.',
  'Send the accounts to {name}': 'Enviar as contas para {name}',
  "This space's Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'As contas Matrix, XMPP e Nostr deste espaço vão para ele, criptografadas de ponta a ponta, e ele entra em cada uma como um novo dispositivo. Depois de desconectado, ele sai delas.',
  "These hidden chats' own Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, into the same hidden chats there, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'As contas próprias de Matrix, XMPP e Nostr destas conversas ocultas vão para ele, criptografadas de ponta a ponta, para as mesmas conversas ocultas de lá, e ele entra em cada uma como um novo dispositivo. Ao ser desconectado, sai delas.',
  'Sent to {name}: {accounts}.': 'Enviado para {name}: {accounts}.',
  'Nothing went: this space has no Matrix, XMPP or Nostr account, or too much waits for that device already.':
    'Nada foi enviado: este espaço não tem conta Matrix, XMPP nem Nostr, ou já há coisa demais esperando por esse dispositivo.',
  'Nothing went: these hidden chats have no Matrix, XMPP or Nostr account of their own, or too much waits for that device already.':
    'Nada foi: estas conversas ocultas não têm conta própria de Matrix, XMPP ou Nostr, ou já há coisas demais esperando por esse dispositivo.',
  'Accounts from the phone': 'Contas do celular',
  'Matrix: {id}, signed in here as a new device.': 'Matrix: {id}, conectado aqui como um novo dispositivo.',
  'Matrix: sign in to {id} here once, with its password. Its keys come from the phone, so no Security Key or check by emoji is needed.':
    'Matrix: entre aqui uma vez em {id}, com a senha da conta. As chaves dela vêm do celular, então não é preciso chave de segurança nem verificar por emoji.',
  'Sign in to Matrix': 'Entrar no Matrix',
  'XMPP: {id}, signed in here as a new device.': 'XMPP: {id}, conectado aqui como um novo dispositivo.',
  'Nostr: the key of the Nostr chats is here too.': 'Nostr: a chave das conversas Nostr também está aqui.',
  'Not brought over yet: {accounts}. Tried again each time this space opens.':
    'Ainda não trazidos: {accounts}. Nova tentativa toda vez que este espaço abre.',
  'Not brought over yet: {accounts}. Tried again each time these hidden chats open.':
    'Ainda não trazidos: {accounts}. Nova tentativa toda vez que estas conversas ocultas abrem.',
  'Once this device is unlinked, it signs out of the accounts it brought over.':
    'Depois que este dispositivo for desconectado, ele sai das contas que trouxe do celular.',
  'Send the accounts': 'Enviar as contas',
  'Same settings on every device': 'As mesmas configurações em todos os dispositivos',
  'The language, the look and Last seen change on the other devices too. A photo behind the screens, passwords, PINs and what is about this device alone stay as they are on each.':
    'O idioma, a aparência e Visto por último mudam também nos outros dispositivos. Uma foto atrás das telas, as senhas, os PINs e o que diz respeito só a este dispositivo ficam como estão em cada um.',
  "The groups come back to this phone once the device that holds them hears it.": "Os grupos voltam para este celular assim que o dispositivo que os tem souber.",
  "The groups go to {name} once it hears it.": "Os grupos vão para {name} assim que ele souber.",
  "Groups stay on": "Os grupos ficam em",
  "Moving: both devices have to be on.": "Movendo: os dois dispositivos precisam estar ligados.",
  "The keys of the groups are on one device at a time, never copied. There, groups work with the phone off; the other devices write in them through it, so it has to be on. Moving them needs both on, and the server. Public groups stay on the phone.": "As chaves dos grupos ficam em um dispositivo por vez, nunca copiadas. Lá, os grupos funcionam com o celular desligado; os outros dispositivos escrevem neles por meio dele, então ele precisa estar ligado. Para movê-los, os dois precisam estar ligados, e o servidor. Os grupos públicos ficam no celular.",
  "The groups are held here": "Os grupos estão aqui",
  "Groups work on this device with the phone off, and you can make new ones here. The phone and the other devices write in them through this one, so it has to be on.": "Os grupos funcionam neste dispositivo com o celular desligado, e você pode criar novos aqui. O celular e os outros dispositivos escrevem neles por meio deste, então ele precisa estar ligado.",
  "The groups are held on this device. On the phone, move them back to it first, under Groups stay on.": "Os grupos estão neste dispositivo. No celular, traga-os de volta para ele primeiro, em Os grupos ficam em.",
  "The groups are held on {name}. Move them back to this phone first, under Groups stay on.": "Os grupos estão em {name}. Traga-os de volta para este celular primeiro, em Os grupos ficam em.",
  "That device is no longer linked.": "Esse dispositivo não está mais conectado.",
  "The groups go to the other device through the server. Type its address in Server first.": "Os grupos vão para o outro dispositivo pelo servidor. Digite primeiro o endereço dele em Servidor.",
  "Unlink all the same?": "Desconectar mesmo assim?",
  "Unlinked now, the groups go from this device, and the phone shows each as left.": "Ao desconectar, os grupos saem deste dispositivo e o celular mostra cada um como abandonado.",
  "Unlinked now, this phone shows each of the groups as left, unless they are still on their way to it: those stay here. Do it if the device is lost.": "Ao desconectar, este celular mostra cada grupo como abandonado, exceto os que ainda estão a caminho dele: esses ficam aqui. Faça isso se o dispositivo foi perdido.",
  "A device whose Erevos is older cannot hold them: update it there first.": "Um dispositivo com um Erevos mais antigo não pode guardá-los: atualize-o lá primeiro.",
  "{name} has an older Erevos: update it there first.": "{name} tem um Erevos mais antigo: atualize-o lá primeiro.",
  "The other device could not take the groups: they stay here.": "O outro dispositivo não conseguiu receber os grupos: eles ficam aqui.",

  // Linking with the short code (components/quick-link.tsx, lib/link-nostr.ts).
  'Inside hidden chats, link with the code Link to my phone shows inside the same hidden chats on the computer.':
    'Dentro das conversas ocultas, conecte com o código que “Conectar ao meu celular” mostra dentro das mesmas conversas ocultas no computador.',
  '{why} Link this way instead: sign in to the server below, then tap Link to my phone.':
    '{why} Conecte de outro jeito: entre no servidor abaixo e depois toque em “Conectar ao meu celular”.',
  'Link another way':
    'Conectar de outro jeito',
  'The phone that answered is not the one that read the code. Make a new code, and link again.':
    'O celular que respondeu não é o que leu o código. Crie um código novo e conecte de novo.',
  'The phone answered, but this computer could not use its server: {error}':
    'O celular respondeu, mas este computador não conseguiu usar o servidor dele: {error}',
  'The phone answered. Setting up this computer…':
    'O celular respondeu. Configurando este computador…',
  'Linking with the phone…':
    'Conectando com o celular…',
  'Keep both open for a moment. Nothing has to be typed or compared.':
    'Deixe os dois abertos por um momento. Não é preciso digitar nem comparar nada.',
  'Scan this with the phone that holds the account, then tap Link on the phone. Nothing else.':
    'Escaneie isto com o celular que tem a conta e depois toque em “Conectar” no celular. Só isso.',
  'Making the code…':
    'Criando o código…',
  'The phone sends this computer what it needs through Nostr, end-to-end encrypted. The code works for half an hour.':
    'O celular envia a este computador o que ele precisa pelo Nostr, criptografado de ponta a ponta. O código vale meia hora.',
  'The computer did not answer. On it, tap Link another way and sign in to the server there, then scan its code again.':
    'O computador não respondeu. Nele, toque em “Conectar de outro jeito”, entre lá no servidor e escaneie o código dele de novo.',
  'Linked to {name}. The chats go to it now.':
    'Conectado a {name}. As conversas vão para ele agora.',
  'Link {name} to this phone?':
    'Conectar {name} a este celular?',
  'Link only a computer of yours, whose code you scanned just now. It gets the chats of this space and the messages chosen below.':
    'Conecte só um computador seu, cujo código você acabou de escanear. Ele recebe as conversas deste espaço e as mensagens escolhidas abaixo.',
  'Waiting for the computer…':
    'Esperando o computador…',
  'No Nostr server could be reached.':
    'Não foi possível alcançar nenhum servidor do Nostr.',
  'The Nostr server did not take it.':
    'O servidor do Nostr não aceitou.',
  'No Nostr server took it.':
    'Nenhum servidor do Nostr aceitou.',
  'Asked. On {name}, tap Link again: it links to this phone and keeps its chats.':
    'Pedido enviado. Em {name}, toque em “Conectar de novo”: ele se conecta a este celular e mantém suas conversas.',
  'Let go of {name}':
    'Esquecer {name}',
  'It is asked nothing from this phone. To link it later, link it as the first time.':
    'Este celular não pede mais nada a ele. Para conectá-lo depois, conecte-o como da primeira vez.',
  'Let go':
    'Esquecer',
  'Said yes. Once the phone hears it, this device is linked to it again.':
    'Você disse sim. Assim que o celular souber, este dispositivo estará conectado a ele de novo.',
  '{name} asks to link again':
    '{name} pede para conectar de novo',
  'A backup of the phone was put back on {name}, which asked {when}. If you did that, link this device to it: it keeps its chats and gets what came since, and the phone before gets nothing more from it. If not, tap Not now: it stays linked as it is.':
    'Um backup do celular foi restaurado em {name}, que pediu em {when}. Se foi você, conecte este dispositivo a ele: ele mantém suas conversas e recebe o que chegou desde então, e o celular anterior não recebe mais nada dele. Se não, toque em “Agora não”: ele continua conectado como está.',
  'Waiting for {name}: it has to be on.':
    'Aguardando {name}: ele precisa estar ligado.',
  'Link again':
    'Conectar de novo',
  'From the backup':
    'Do backup',
  'These devices were linked to the phone this backup was made on. Ask only those that are still yours: each shows the ask, and links to this phone once Link again is tapped on it. It keeps its chats, and gets what came since.':
    'Estes dispositivos estavam conectados ao celular em que este backup foi feito. Peça só aos que ainda são seus: cada um mostra o pedido e se conecta a este celular assim que tocarem em “Conectar de novo” nele. Ele mantém suas conversas e recebe o que chegou desde então.',
  'It said yes. Linking…':
    'Ele disse sim. Conectando…',
  'Asked {when}. Waiting for Link again to be tapped on it.':
    'Pedido em {when}. Aguardando tocarem em “Conectar de novo” nele.',
  'Linked there {when}.':
    'Conectado lá em {when}.',
  'Not asked yet.':
    'Ainda não pedido.',
  'Ask to link again':
    'Pedir para conectar de novo',
  'The phone no longer asks this device to link again.':
    'O celular não pede mais a este dispositivo para conectar de novo.',
  '{name} asks this device to link again, as a backup of the phone was put back there. If you did that, tap Link again in Linked devices.':
    '{name} pede a este dispositivo para conectar de novo, pois um backup do celular foi restaurado lá. Se foi você, toque em “Conectar de novo” em Dispositivos conectados.',
  'The phone this backup was made on had linked devices. In Linked devices, ask those that are yours to link again: each keeps its chats.':
    'O celular em que este backup foi feito tinha dispositivos conectados. Em Dispositivos conectados, peça aos que são seus para conectar de novo: cada um mantém suas conversas.',
};
