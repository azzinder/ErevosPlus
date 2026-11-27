// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Portuguese for parts (lib/i18n.ts).
export const parts: Record<string, string> = {
  // The password screen and the password sheet (lock/gate.tsx, components/PasswordSheet.tsx).
  'Enter your password': 'Digite sua senha',
  Unlock: 'Desbloquear',
  'Wrong password': 'Senha incorreta',
  'Use at least {n} characters.': 'Use pelo menos {n} caracteres.',
  'The passwords do not match.': 'As senhas não coincidem.',
  'Use a different password.': 'Use uma senha diferente.',
  'New password': 'Nova senha',
  'Repeat password': 'Repita a senha',
  'Too many attempts. Try again in {n} minute.': 'Tentativas demais. Tente de novo em {n} minuto.',
  'Too many attempts. Try again in {n} minutes.': 'Tentativas demais. Tente de novo em {n} minutos.',
  'Too many attempts. Try again in {n} second.': 'Tentativas demais. Tente de novo em {n} segundo.',
  'Too many attempts. Try again in {n} seconds.': 'Tentativas demais. Tente de novo em {n} segundos.',

  // Small parts of screens.
  'QR code': 'Código QR',
  Group: 'Grupo',

  // Calls (components/call-screen.tsx, components/group-call-screen.tsx).
  'Call ended': 'Chamada encerrada',
  'They hung up': 'Desligou',
  'Turned down': 'Recusada',
  'They turned it down': 'Recusou',
  'They are in another call': 'Está em outra chamada',
  'Not answered': 'Não atendida',
  'The call could not connect': 'Não foi possível conectar a chamada',
  'The call could not connect on their phone': 'Não foi possível conectar a chamada no outro celular',
  'Calling…': 'Chamando…',
  'Ringing…': 'Tocando…',
  'Incoming video call': 'Videochamada recebida',
  'Incoming voice call': 'Chamada de voz recebida',
  'Connecting…': 'Conectando…',
  'Missed call': 'Chamada perdida',
  Decline: 'Recusar',
  Answer: 'Atender',
  Unmute: 'Ativar microfone',
  Mute: 'Silenciar',
  Speaker: 'Alto-falante',
  'Camera on': 'Ligar câmera',
  'Camera off': 'Desligar câmera',
  Flip: 'Virar',
  End: 'Encerrar',
  'You started a group video call': 'Você iniciou uma videochamada em grupo',
  'You started a group call': 'Você iniciou uma chamada em grupo',
  '{name} started a group video call': '{name} iniciou uma videochamada em grupo',
  '{name} started a group call': '{name} iniciou uma chamada em grupo',
  'Waiting for others · {time}': 'Aguardando os outros · {time}',
  'Missed group call': 'Chamada em grupo perdida',
  'Could not open the microphone': 'Não foi possível abrir o microfone',
  'Pictures pause with more than {n} in the call': 'As imagens pausam com mais de {n} na chamada',
  'Group video call · end-to-end encrypted': 'Videochamada em grupo · criptografada de ponta a ponta',
  'Group voice call · end-to-end encrypted': 'Chamada de voz em grupo · criptografada de ponta a ponta',
  'In the call': 'Na chamada',
  Join: 'Entrar',
  '{name} tried to call. Accept their message request to take calls from them.':
    '{name} tentou ligar. Aceite a solicitação de mensagem para receber as chamadas dessa pessoa.',
  'The call ended.': 'A chamada terminou.',
  'The call has ended.': 'A chamada foi encerrada.',
  'Calls are set up through the server. Type its address in Server first.': 'As chamadas são feitas pelo servidor. Digite primeiro o endereço dele em “Servidor”.',

  // The web app's card (components/integrity-card.tsx, lib/integrity.web.ts).
  'This web app': 'Este app web',
  'Release {version}, checked': 'Versão {version}, verificada',
  'Not checked: no service worker runs Erevos here': 'Não verificada: nenhum service worker executa o Erevos aqui',
  "Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is":
    'O Erevos só executa código assinado com a chave de publicação dele, guardada neste dispositivo. A impressão digital da chave é',
  '. It must match the one you were given with the address of this server.': '. Ela precisa ser igual à que você recebeu junto com o endereço deste servidor.',
  'Release {version} is checked and starts the next time Erevos opens.': 'A versão {version} foi verificada e começa na próxima vez que o Erevos abrir.',
  'Last looked for updates {when}.': 'Última busca por atualizações: {when}.',
  'Refused:': 'Recusado:',
  'Looking…': 'Procurando…',
  'Look for an update': 'Procurar atualização',
  'Notifications while closed': 'Notificações com o app fechado',
  'On in this space': 'Ativadas neste espaço',
  'Off in this space': 'Desativadas neste espaço',
  'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.':
    'Quando chegam mensagens, ou toca uma chamada, com o Erevos fechado, o seu servidor envia um push pelo serviço de push deste navegador (o da Apple, num iPhone), e o Erevos mostra quantas mensagens chegaram desde a última vez que você o abriu, como “3 novas mensagens”, ou “Chamada” quando só tocou uma chamada, nada mais. O push não leva a mensagem nem o remetente, e a contagem dele é criptografada para este navegador, mas o serviço de push vê quando chega algo para este dispositivo, e que ele usa o Erevos. Com um servidor, ou o Erevos de um remetente, mais antigo que a versão 2.0.0, ou com uma mensagem que outros celulares levaram até o servidor, não há número: o Erevos mostra “Nova mensagem”, ou “Novas mensagens” se chegaram mais, até você abri-lo. As conversas ocultas nunca recebem notificações. Cada espaço que as ativa tem o seu próprio endereço de push, então o endereço não liga dois espaços entre si no servidor deles.',
  'Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.':
    'Ainda não foi possível avisar o seu servidor, então as notificações podem continuar chegando. O Erevos avisa o servidor assim que ele estiver acessível.',
  'A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.':
    'Uma chamada que chega com o Erevos fechado não toca: só aparece a notificação “Chamada”. Num iPhone não dá para fazer mais: a Apple não deixa um app web rodar enquanto está fechado nem tocar como um telefone; para isso seria preciso um app da App Store. No Android, o app do Erevos toca mesmo fechado.',
  "Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.":
    'Cada espaço com elas ativadas tem o seu próprio service worker neste navegador, que as configurações dele mostram: quem puder vê-las pode contar os espaços com notificações. Uma solicitação de mensagem de alguém novo, pelo seu link de contato, pode aparecer só quando o Erevos abrir.',
  'Turn off': 'Desativar',
  'Turn on': 'Ativar',
  'Erevos was tampered with': 'O Erevos foi adulterado',
  'The server sent this device a new service worker, the part of Erevos that checks its code, and no signed release lists it. Erevos goes on with the checked code while it is open, but once it is closed the browser may start the new one, which could show a fake Erevos. Do not open Erevos from this server again, and do not type your passwords into it, until whoever runs the server knows why. Your chats stay sealed with your password.':
    'O servidor enviou a este dispositivo um novo service worker, a parte do Erevos que verifica o código dele, e nenhuma versão assinada o inclui. O Erevos continua com o código verificado enquanto estiver aberto, mas, depois de fechado, o navegador pode iniciar o novo, que poderia mostrar um Erevos falso. Não abra mais o Erevos por este servidor, nem digite suas senhas nele, até quem cuida do servidor saber o motivo. Suas conversas continuam seladas com a sua senha.',
  'I understand': 'Entendi',
  'Update refused': 'Atualização recusada',
  '{reason} Erevos keeps the release it has. Settings → Privacy and security → This web app shows what was refused.':
    '{reason} O Erevos mantém a versão que tem. Em “Configurações → Privacidade e segurança → Este app web” aparece o que foi recusado.',

  // Files and photos (lib/attachments.ts, lib/photo*.ts, lib/pick-*.ts, lib/save-file*.ts, lib/backup-place.web.ts).
  'Files can be 100 MB at most.': 'Os arquivos podem ter no máximo 100 MB.',
  'The file was changed on the way, so it was not kept.': 'O arquivo foi alterado no caminho, então não foi guardado.',
  'The file is not on the server any more. Files wait there 14 days.': 'O arquivo não está mais no servidor. Os arquivos ficam lá 14 dias.',
  'This file is not on this phone.': 'Este arquivo não está neste celular.',
  'This file is not on this computer.': 'Este arquivo não está neste computador.',
  // Shown after "in", as “em {folder}”: with no article.
  'the place you chose': 'um local escolhido por você',
  'the downloads folder': 'Downloads',
  'Not saved: the share sheet was closed.': 'Não salvo: o menu de compartilhamento foi fechado.',
  'That folder is not there any more. Choose it again.': 'Essa pasta não existe mais. Escolha de novo.',
  // A backup that a folder did not take, in plain words (lib/backup-place.ts folderTrouble).
  'The app this folder belongs to made no file in it. Choose a folder on the phone instead, or try again later.':
    'O app a que esta pasta pertence não criou nenhum arquivo nela. Escolha uma pasta no celular, ou tente de novo mais tarde.',
  'Erevos may no longer write in this folder. Choose it again.': 'O Erevos talvez não possa mais escrever nesta pasta. Escolha de novo.',
  'There is no room left in this folder. Make room, or choose another one.': 'Não há mais espaço nesta pasta. Libere espaço ou escolha outra.',
  'The backup could not be written in this folder: {reason}': 'Não foi possível salvar o backup nesta pasta: {reason}',
  'Ready to save.': 'Pronto para salvar.',
  Original: 'Original',
  'Original: the photo as it was, full size, with only its place, phone and time taken out.':
    'Original: a foto como era, em tamanho real, só sem o local, o celular e o horário em que foi tirada.',
  '{quality}%: a new, smaller photo, quicker to send. It says nothing but its picture.':
    '{quality}%: uma foto nova, menor, mais rápida de enviar. Ela não diz nada além da própria imagem.',
  'This photo does not get small enough for an MMS.': 'Esta foto não fica pequena o suficiente para um MMS.',
  'Erevos may not use the camera. Allow it in the phone settings to take photos.': 'O Erevos não tem permissão para usar a câmera. Permita nas configurações do celular para tirar fotos.',
  'Voice message': 'Mensagem de voz',
  Sticker: 'Figurinha',
  'File: {name}': 'Arquivo: {name}',
  'That voice message is too long.': 'Essa mensagem de voz é longa demais.',

  // When a message or an SMS sent for later goes (components/later-picker.tsx, lib/later.ts).
  'In 1 hour': 'Daqui a 1 hora',
  'Tonight 20:00': 'Hoje à noite 20:00',
  'Tomorrow 09:00': 'Amanhã 09:00',
  Day: 'Dia',
  Hour: 'Hora',
  Minutes: 'Minutos',
  'Goes on {when}.': 'Agendada para {when}.',
  'That time has gone by. Choose one ahead.': 'Esse horário já passou. Escolha um mais à frente.',
  'At most a year ahead.': 'No máximo um ano à frente.',
  // The home screen's list (lib/inbox.ts).
  'You: {text}': 'Você: {text}',
  Sun: 'Dom',
  Mon: 'Seg',
  Tue: 'Ter',
  Wed: 'Qua',
  Thu: 'Qui',
  Fri: 'Sex',
  Sat: 'Sáb',

  // Contacts and chats (lib/e2e.ts, lib/space-chats.ts, lock/).
  "That is this chat's own contact link.": 'Esse é o seu próprio link de contato.',
  'That code has no key. Ask for their contact link or QR code from this version of Erevos.':
    'Esse código não tem chave. Peça um link de contato ou código QR desta versão do Erevos.',
  'No such contact.': 'Esse contato não existe.',
  'Not a contact.': 'Não é um contato.',
  'That is not a phone number.': 'Isso não é um número de telefone.',
  'Not a time Erevos keeps messages for.': 'O Erevos não guarda mensagens por esse tempo.',
  'No conversation with this contact.': 'Nenhuma conversa com este contato.',
  'That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.':
    'Esse contato usa o servidor {relay}, e o link dele não tem chave para esse servidor. Peça um link novo.',
  'Wrong password for this backup.': 'Senha incorreta para este backup.',

  // Groups (lib/groups.ts, lib/space-groups.ts).
  'No groups here yet.': 'Ainda não há grupos aqui.',
  'Give the group a name.': 'Dê um nome ao grupo.',
  'You made the group.': 'Você criou o grupo.',
  'Only the group’s admin adds members.': 'Só o admin do grupo adiciona membros.',
  'You are not in this group any more.': 'Você não está mais neste grupo.',
  'Only the group’s admin renames it.': 'Só o admin do grupo pode renomeá-lo.',
  'Only the group’s admin takes members out.': 'Só o admin do grupo remove membros.',
  'You closed the group.': 'Você fechou o grupo.',
  'You asked to leave. The group closes here once the admin takes you out.': 'Você pediu para sair. O grupo fecha aqui assim que o admin remover você.',
  'You left the group.': 'Você saiu do grupo.',
  'You are no longer in the group.': 'Você não está mais no grupo.',
  'member {id}': 'membro {id}',
  '{who} added you to the group.': '{who} adicionou você ao grupo.',
  '{who} joined.': '{who} entrou.',
  '{who} left.': '{who} saiu.',
  'You asked {who} for their contact link.': 'Você pediu o link de contato de {who}.',
  '{who} asked for your contact link.': '{who} pediu o seu link de contato.',
  'You sent {who} your contact link. You are each other’s contacts now.': 'Você enviou o seu link de contato para {who}. Agora vocês são contatos um do outro.',
  '{who} sent their contact link. You are each other’s contacts now.': '{who} enviou o link de contato. Agora vocês são contatos um do outro.',
  '{who} could not be added as a contact.': 'Não foi possível adicionar {who} aos contatos.',
  'Ask for contact links on the phone that holds this account.': 'Peça links de contato pelo celular que tem esta conta.',
  'They are not in this group any more.': 'Esse membro não está mais neste grupo.',
  'Not in public groups.': 'Não em grupos públicos.',
  'More than one member of this group shows this key, so one of them is not who they say. Ask for their contact link some other way.':
    'Mais de um membro deste grupo mostra esta chave, então um deles não é quem diz ser. Peça o link de contato dele de outro jeito.',
  'Another space is open now.': 'Agora outro espaço está aberto.',
  'Groups go through the server. Type its address in Server first.': 'Os grupos passam pelo servidor. Digite primeiro o endereço dele em “Servidor”.',

  // The build and updates (lib/core.ts, lib/crypto.ts, lib/install-update*.ts, lib/updates.ts, lib/shell.ts).
  'This build has no Erevos core, so it cannot encrypt. Rebuild the app.': 'Esta versão não tem o núcleo do Erevos, então não consegue criptografar. Compile o app de novo.',
  'The Erevos core gave back something unexpected.': 'O núcleo do Erevos devolveu algo inesperado.',
  'This build of Erevos has no Tor.': 'Esta versão do Erevos não tem Tor.',
  'This build of Erevos has no Nostr.': 'Esta versão do Erevos não tem Nostr.',
  'This build has no secure random source. Rebuild the app so it includes expo-crypto.':
    'Esta versão não tem uma fonte aleatória segura. Compile o app de novo para que inclua o expo-crypto.',
  'This release has no Android package.': 'Esta versão não tem pacote para Android.',
  'The download was cut short.': 'O download foi interrompido.',
  'The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.':
    'O download parou em cada tentativa, porque a conexão não trazia nada durante algum tempo. Nada foi instalado: tente de novo mais tarde ou em outra rede.',
  'Show what is typed': 'Mostrar o que você digita',
  'Hide what is typed': 'Ocultar o que você digita',
  'The downloaded package is not the one the release published. Nothing was installed.':
    'O pacote baixado não é o que a versão publicou. Nada foi instalado.',
  'This version installs from the download page.': 'Esta versão é instalada pela página de download.',
  'GitHub answered {status}.': 'O GitHub respondeu {status}.',
  "The web app's server answered {status}.": 'O servidor do app web respondeu {status}.',
  'The desktop app answered {status}.': 'O app para computador respondeu {status}.',
  'There is no room left on this device. Free some space and try again.': 'Não há mais espaço neste dispositivo. Libere um pouco de espaço e tente de novo.',
  'This computer has no keyring to seal Erevos’s keys with, so Erevos keeps none. Start a keyring (KWallet, or GNOME Keyring with --password-store=gnome-libsecret), or start Erevos with --plain-secrets to keep them unsealed, readable by your user, and set a password lock.': 'Este computador não tem chaveiro para selar as chaves do Erevos, então o Erevos não guarda nenhuma. Inicie um chaveiro (KWallet, ou GNOME Keyring com --password-store=gnome-libsecret), ou inicie o Erevos com --plain-secrets para guardá-las sem selo, legíveis pelo seu usuário, e coloque um bloqueio com senha.',
  'The browser did not open its storage.': 'O navegador não abriu o armazenamento dele.',

  // LoRa and nearby phones (lib/lora.ts, lib/nearby.ts).
  'The radio restarts with its new settings, and links again.': 'O rádio reinicia com as novas configurações e se conecta de novo.',
  'There is no server, and no Erevos phone is linked nearby. Type the server address in Server, or come near their phone.':
    'Não há servidor, e nenhum celular com Erevos está conectado por perto. Digite o endereço do servidor em “Servidor”, ou chegue perto do celular da outra pessoa.',
  'Too large for LoRa, which takes only text. It can go once the server can be reached, or near their phone.':
    'Grande demais para LoRa, que só transmite texto. Poderá ser enviado quando o servidor estiver acessível, ou perto do celular da outra pessoa.',

  // The relay (lib/relay.ts, lib/sms-invite.ts); {what} is the request's name.
  'An id is 48 hex characters.': 'Um ID tem 48 caracteres hexadecimais.',
  'Through Tor: {reason}': 'Pelo Tor: {reason}',
  'cannot reach the server at {url}, or the token is wrong': 'não foi possível acessar o servidor {url}, ou o token está errado',
  'message is not held': 'a mensagem não está guardada',
  'the server at {url} cannot keep messages for later: update it': 'o servidor {url} não consegue guardar mensagens para depois: atualize-o',
  'The server at {url} that keeps it is no longer set here.': 'O servidor {url} que a guarda não está mais configurado aqui.',
  'the server closed the connection': 'o servidor fechou a conexão',
  'the server did not answer in time': 'o servidor não respondeu a tempo',
  'lost the connection to the server': 'a conexão com o servidor caiu',
  '{what}: queue not found': '{what}: fila não encontrada',
  '{what}: queue is full': '{what}: a fila está cheia',
  '{what}: your free place on this server has used all it may today. It goes on tomorrow.': '{what}: seu lugar gratuito neste servidor já usou hoje tudo o que pode. Continua amanhã.',
  '{what}: the server could not save it, try again later': '{what}: o servidor não conseguiu salvar, tente de novo mais tarde',
  '{what}: the second server could not reach your server, try again later': '{what}: o segundo servidor não conseguiu acessar o seu servidor, tente de novo mais tarde',
  '{what}: the file is not on the server any more': '{what}: o arquivo não está mais no servidor',
  '{what}: the server has no room for files now, try again later': '{what}: o servidor está sem espaço para arquivos agora, tente de novo mais tarde',
  '{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.': '{what}: seu lugar gratuito neste servidor já passou hoje todos os arquivos que pode. Os arquivos continuam amanhã.',
  '{what}: the server could not keep it, try again later': '{what}: o servidor não conseguiu guardar, tente de novo mais tarde',
  '{what}: your server could not reach the server the file is on': '{what}: o seu servidor não conseguiu acessar o servidor onde está o arquivo',
  '{reason}. A server older than this app cannot take files: update it.': '{reason}. Um servidor mais antigo que este app não aceita arquivos: atualize-o.',
  'message is too large': 'a mensagem é grande demais',
  'your server has no key for two-hop sending, so it was not sent through the second server':
    'o seu servidor não tem chave para o envio em dois saltos, então ela não passou pelo segundo servidor',
  'the link has given all its places on its server. Ask them for a new link': 'o link já deu todos os lugares dele no servidor dele. Peça um link novo',
  'The server address is too long for an SMS invite.': 'O endereço do servidor é longo demais para um convite por SMS.',

  // Notifications in the web app (lib/web-push*.ts).
  'Notifications through the browser are for the web app.': 'As notificações pelo navegador são para o app web.',
  'Your server does not send notifications. It needs a newer version, set up with a push key.':
    'O seu servidor não envia notificações. Ele precisa de uma versão mais nova, configurada com uma chave de push.',
  'This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.':
    'Este navegador não consegue mostrar notificações de um app web fechado. Num iPhone, adicione primeiro o Erevos à tela de início.',
  'Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.':
    'As notificações não estão permitidas para o Erevos. Permita nas configurações deste navegador ou celular.',
  'Set up the server first, under Server.': 'Configure primeiro o servidor, em “Servidor”.',
  'Notifications could not be turned on: {reason}': 'Não foi possível ativar as notificações: {reason}',
  // Calls' lines in a chat (lib/call-lines.ts).
  'Voice call': 'Chamada de voz',
  'Video call': 'Videochamada',
  'Group call': 'Chamada em grupo',
  'Group video call': 'Videochamada em grupo',
  'Missed voice call': 'Chamada de voz perdida',
  'Missed video call': 'Videochamada perdida',
  'Missed group video call': 'Videochamada em grupo perdida',
  '{missed}, while in another call': '{missed}, durante outra chamada',
  'turned down': 'recusada',
  'could not connect': 'não conectou',
  'they were in another call': 'estava em outra chamada',
  'not answered': 'não atendida',
  'Only {given} of the {all} files went to the downloads, so they are not all saved.': 'Só {given} dos {all} arquivos foram para os downloads, então não estão todos salvos.',
  'Save the files': 'Salvar os arquivos',
  '{given} of the {all} files went to the downloads. Tap Save for the next one: {name}': '{given} dos {all} arquivos foram para os downloads. Toque em Salvar para o próximo: {name}',
  "The browser did not keep it.": "O navegador não o guardou.",
  "New device of {who}: your messages go to it too.": "Novo dispositivo de {who}: suas mensagens também vão para ele.",
  "A device of {who} changed its key: your messages do not go to it.": "Um dispositivo de {who} mudou de chave: suas mensagens não vão para ele.",
};
