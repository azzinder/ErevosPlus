// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// O português dos backups para um servidor (lib/backup-cloud.ts, app/backup.tsx) (i18n/pt/index.ts).
export const cloudBackup: Record<string, string> = {
  'Made a backup in {folder}, but it did not go to the server. {error}': 'Backup feito em {folder}, mas não chegou ao servidor. {error}',
  'Made a backup in {folder} and sent it to {server}.': 'Backup feito em {folder} e enviado para {server}.',
  'Stop sending to the server': 'Parar de enviar ao servidor',
  'Automatic backups will go only to the folder from now on. Those already on the server stay there until you delete them.':
    'De agora em diante os backups automáticos vão só para a pasta. Os que já estão no servidor ficam lá até você apagar.',
  'Backups no longer go to the server.': 'Os backups não vão mais para o servidor.',
  'To a server too': 'Também para um servidor',
  'To {server}': 'Para {server}',
  'Last one sent {when}.': 'O último enviado {when}.',
  'None sent yet.': 'Nenhum enviado ainda.',
  'Each automatic backup goes there too, and the server keeps the {n} newest.': 'Cada backup automático vai também para lá, e o servidor guarda os {n} mais recentes.',
  'The last one did not go: {error} Erevos tries again next time it opens.': 'O último não foi: {error} O Erevos tenta de novo na próxima vez que abrir.',
  'Stop sending': 'Parar de enviar',
  'Folder address (WebDAV)': 'Endereço da pasta (WebDAV)',
  'In Nextcloud: Files → Files settings → WebDAV gives the start; add a folder you made for backups, like …/remote.php/dav/files/NAME/Backups':
    'No Nextcloud: Arquivos → Configurações de arquivos → WebDAV dá o começo; acrescente uma pasta que você criou para os backups, como …/remote.php/dav/files/NOME/Backups',
  'User name': 'Nome de usuário',
  "Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.":
    'Melhor uma senha de aplicativo só para o Erevos, nas configurações de segurança do servidor: você pode revogá-la lá sem mudar a sua.',
  'Add a server': 'Adicionar um servidor',
  'That is not a folder address. It starts with https://': 'Isso não é um endereço de pasta. Ele começa com https://',
  'The address has to start with https://, so the password and backups go encrypted.': 'O endereço tem que começar com https://, para que a senha e os backups vão criptografados.',
  'Put the user name and password in their own fields, not in the address.': 'Coloque o nome de usuário e a senha nos campos deles, não no endereço.',
  'The server did not take that user name and password.': 'O servidor não aceitou esse nome de usuário e essa senha.',
  'That folder is not on the server. Make it there first.': 'Essa pasta não existe no servidor. Crie-a lá primeiro.',
  'The server has no room left for it.': 'O servidor não tem mais espaço para ele.',
  'The server answered {status}.': 'O servidor respondeu {status}.',
  'Could not reach the server. {error}': 'Não foi possível chegar ao servidor. {error}',
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, when one comes and roughly how big it is, and your address unless the backup goes through Tor, as the space's Tor setting says. Nothing goes until you add one.":
    "Cada backup automático também pode ir para uma pasta num servidor que você escolher, como o seu Nextcloud, por WebDAV. O servidor recebe bytes aleatórios com um nome aleatório: não consegue abri-los nem saber que são do Erevos. Ainda assim vê sua conta, quando chega um e mais ou menos o tamanho, e seu endereço, a não ser que o backup passe pelo Tor, como diz a configuração de Tor do espaço. Nada é enviado até você adicionar um.",
  "This space sends Everything through Tor, and Tor here cannot reach a server, so nothing went to it.":
    "Este espaço envia Tudo pelo Tor, e aqui o Tor não consegue chegar a um servidor, então nada foi para ele.",
  "There is no Erevos backup in that folder.":
    "Não há nenhum backup do Erevos nessa pasta.",
  "Restore from a server":
    "Restaurar de um servidor",
  "The folder on your server that automatic backups went to. The password is used for this restore only and not kept.":
    "A pasta no seu servidor para onde iam os backups automáticos. A senha é usada só para esta restauração e não fica guardada.",
  "Look there":
    "Procurar lá",
  "Backups on {server}, newest first. Choose one, then type its password.":
    "Backups em {server}, os mais recentes primeiro. Escolha um e depois digite a senha dele.",
  "In a browser the server has to let the web app in (CORS), and this one did not, or could not be reached.":
    "Num navegador o servidor tem de deixar o web app entrar (CORS), e este não deixou ou não pôde ser alcançado.",
  "Erevos forgets the server and its password here. The backups already on it stay there until you delete them.":
    "O Erevos esquece aqui o servidor e a senha dele. Os backups que já estão nele ficam lá até você apagá-los.",
  "Send a backup there now and then; the server keeps the {n} newest.":
    "Envie um backup para lá de vez em quando; o servidor guarda os {n} mais recentes.",
  "The last one did not go: {error}":
    "O último não foi: {error}",
  "Send a backup now":
    "Enviar um backup agora",
  "A backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV, each time you send one. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Um backup também pode ir para uma pasta num servidor que você escolher, como o seu Nextcloud, por WebDAV, cada vez que você enviar um. O servidor recebe bytes aleatórios com um nome aleatório: não consegue abri-los nem saber que são do Erevos. Ainda assim vê sua conta, seu endereço, quando chega um e mais ou menos o tamanho. Nada é enviado até você adicionar um.",
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Cada backup automático também pode ir para uma pasta num servidor que você escolher, como o seu Nextcloud, por WebDAV. O servidor recebe bytes aleatórios com um nome aleatório: não consegue abri-los nem saber que são do Erevos. Ainda assim vê sua conta, seu endereço, quando chega um e mais ou menos o tamanho. Nada é enviado até você adicionar um.",
  "In a browser this works only with a server set to let the web app in (CORS), which Nextcloud is not as it comes. The desktop app and Android need nothing of it.":
    "Num navegador isto só funciona com um servidor configurado para deixar o web app entrar (CORS), o que o Nextcloud não é de fábrica. O app para computador e o Android não precisam de nada disso.",
  "A backup larger than {size} MB does not come from a server. Download it from the server and tap Restore a backup.": "Um backup maior que {size} MB não chega de um servidor. Baixe-o do servidor e toque em Restaurar um backup.",
  "Automatic backups need a folder on {device}: choose one.":
    "Os backups automáticos precisam de uma pasta {device}: escolha uma.",
  "Sent a backup to {server}.":
    "Backup enviado para {server}.",
  "Making the backup: photos, files and voice messages, {percent}%…":
    "Fazendo o backup: fotos, arquivos e mensagens de voz, {percent}%…",
  "Putting back photos, files and voice messages: {percent}%…":
    "Restaurando fotos, arquivos e mensagens de voz: {percent}%…",
  "Choose the files":
    "Escolher os arquivos",
  "Choose the folder":
    "Escolher a pasta",
  "No folder on {device} yet":
    "Ainda não há pasta {device}",
  "These automatic backups came with a backup made on another device, with their password; the folder they went to stays with that device. Choose a folder here, and they go on into it.":
    "Estes backups automáticos vieram com um backup feito em outro dispositivo, com a senha deles; a pasta para onde iam fica com aquele dispositivo. Escolha uma pasta aqui, e eles continuam nela.",
  "Until then they go only to the server.":
    "Até lá, eles vão só para o servidor.",
  "Choose a folder":
    "Escolher uma pasta",
  "What stays with each device and comes with no backup: the fingerprint, the folders Erevos may write in, what the phone lets it do and which apps make calls and send SMS. An XMPP account comes back as a new device of itself, and Matrix asks you to sign in again.":
    "O que fica com cada dispositivo e não vem com nenhum backup: a impressão digital, as pastas em que o Erevos pode gravar, o que o celular permite que ele faça e quais apps fazem as chamadas e enviam os SMS. Uma conta XMPP volta como um novo dispositivo dela mesma, e o Matrix pede que você entre de novo.",
  "Its photos, files and voice messages are in {n} more file beside it, with the same start: keep them together.":
    "As fotos, arquivos e mensagens de voz dele estão em mais {n} arquivo ao lado dele, com o mesmo começo de nome: mantenha-os juntos.",
  "Its photos, files and voice messages are in {n} more files beside it, with the same start: keep them together.":
    "As fotos, arquivos e mensagens de voz dele estão em mais {n} arquivos ao lado dele, com o mesmo começo de nome: mantenha-os juntos.",
  "A file of this backup is not there: {name}.":
    "Um arquivo deste backup não está lá: {name}.",
  "{n} files of this backup are not there, {name} among them.":
    "{n} arquivos deste backup não estão lá, entre eles {name}.",
  "This backup's photos, files and voice messages are in {n} more file beside it, whose name starts as its own or as an earlier backup's. Choose it.":
    "As fotos, arquivos e mensagens de voz deste backup estão em mais {n} arquivo ao lado dele, cujo nome começa como o dele ou como o de um backup anterior. Escolha-o.",
  "This backup's photos, files and voice messages are in {n} more files beside it, whose names start as its own or as an earlier backup's. Choose them all.":
    "As fotos, arquivos e mensagens de voz deste backup estão em mais {n} arquivos ao lado dele, cujos nomes começam como o dele ou como o de um backup anterior. Escolha todos.",
  "This backup's photos, files and voice messages are in {n} more file beside it. Choose the folder the backup is in.":
    "As fotos, arquivos e mensagens de voz deste backup estão em mais {n} arquivo ao lado dele. Escolha a pasta em que o backup está.",
  "This backup's photos, files and voice messages are in {n} more files beside it. Choose the folder the backup is in.":
    "As fotos, arquivos e mensagens de voz deste backup estão em mais {n} arquivos ao lado dele. Escolha a pasta em que o backup está.",
  "A file of this backup is missing: {name}. Nothing was changed.":
    "Falta um arquivo deste backup: {name}. Nada mudou.",
  "A file of this backup is damaged, or belongs to another backup: {name}. Nothing was changed.":
    "Um arquivo deste backup está danificado ou pertence a outro backup: {name}. Nada mudou.",
  "A file of this backup is damaged, or belongs to another backup: {name}.":
    "Um arquivo deste backup está danificado ou pertence a outro backup: {name}.",
  "Restore everything else without it? The photos, files and voice messages on {device} stay as they are, and those it holds do not come back.":
    "Restaurar todo o resto sem ele? As fotos, os arquivos e as mensagens de voz {device} ficam como estão, e os que ele contém não voltam.",
  "Restore everything else without them? The photos, files and voice messages on {device} stay as they are, and those they hold do not come back.":
    "Restaurar todo o resto sem eles? As fotos, os arquivos e as mensagens de voz {device} ficam como estão, e os que eles contêm não voltam.",
  "Restore the rest":
    "Restaurar o resto",
  "Restored without {n} file of the backup, {name}: the photos, files and voice messages in it did not come back.":
    "Restaurado sem {n} arquivo do backup, {name}: as fotos, os arquivos e as mensagens de voz que ele continha não voltaram.",
  "Restored without {n} files of the backup, {name} among them: the photos, files and voice messages in them did not come back.":
    "Restaurado sem {n} arquivos do backup, entre eles {name}: as fotos, os arquivos e as mensagens de voz que eles continham não voltaram.",
  "What takes room":
    "O que ocupa espaço",
  "How much room Erevos takes on {device}, by kind: each automatic backup holds it all. Only the files’ names and sizes are looked at, here, and nothing is sent.":
    "Quanto espaço o Erevos ocupa em {device}, por tipo: cada cópia automática contém tudo isto. Só se olham os nomes e tamanhos dos ficheiros, aqui, e nada é enviado.",
  "In all: {size}":
    "No total: {size}",
  "Measure":
    "Medir",
  "Measure again":
    "Medir de novo",
  "The Collection, and photos and files in chats":
    "A Coleção, e fotos e ficheiros nas conversas",
  "Contact pictures":
    "Fotos dos contactos",
  "Chat history":
    "Histórico das conversas",
  "Backups kept inside Erevos":
    "Cópias de segurança dentro do Erevos",
  "Left over from writes that did not end":
    "Restos de escritas que não terminaram",
  "Cache":
    "Cache",
  "Other: {name}":
    "Outros: {name}",
  "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.":
    "Parte do que um lugar guarda não pôde ser lida, por isso nada é tomado por resto. Tenta mais tarde.",
  "Nothing opens with that. Check it and type it again.":
    "Nada abre com isso. Verifica e escreve de novo.",
  "Opened {opened} of {count}; they are read with the rest.":
    "Abertos {opened} de {count}; são lidos com o resto.",
  "Opened, and it is read with the rest.":
    "Aberto, e é lido com o resto.",
  "That one is read already.":
    "Esse já é lido.",
  "Delete the leftovers?":
    "Apagar os restos?",
  "{size} of photos and files that none of the places read here names (places read: {n}). A place you did not open here loses its photos and files for good: open every one first. Backups already made keep them.":
    "{size} de fotos e ficheiros que nenhum dos lugares lidos aqui nomeia (lugares lidos: {n}). Um lugar que não abriste aqui perde as suas fotos e ficheiros para sempre: abre todos primeiro. As cópias de segurança já feitas guardam-nos.",
  "{size} freed.":
    "{size} libertados.",
  "Photos and files that nothing on the phone names any more, as those of an import that stopped in its middle, stay on it and in every backup. Only a place opened with its key can say which are its own: so first type here, one at a time or several at once separated by commas or spaces, the PIN of each of your hidden chats and the password of any other space you have. This space is read by itself. Nothing is deleted before you see how much and say so; a file written in the last day is never taken.":
    "As fotos e ficheiros que já nada no telefone nomeia, como os de uma importação que parou a meio, ficam nele e em cada cópia de segurança. Só um lugar aberto com a sua chave pode dizer quais são seus: por isso escreve aqui primeiro, um de cada vez ou vários de uma vez separados por vírgulas ou espaços, o PIN de cada uma das tuas conversas ocultas e a palavra-passe de qualquer outro espaço que tenhas. Este espaço é lido por si. Nada é apagado antes de veres quanto é e dizeres que sim; um ficheiro escrito no último dia nunca é tomado.",
  "PIN or password":
    "PIN ou palavra-passe",
  "Read with this space: {n}":
    "Lidos com este espaço: {n}",
  "Leftovers: {size} in {n} chunks.":
    "Restos: {size} em {n} pedaços.",
  "No leftovers.":
    "Não há restos.",
  "Find leftovers":
    "Procurar restos",
  "Delete them":
    "Apagá-los",
  "Leftovers":
    "Restos",
  "The backup itself is not there.":
    "A cópia em si não está lá.",
  "The backup itself is still empty there.":
    "A cópia em si ainda está vazia lá.",
  "It is not made with the automatic backups’ password, so it cannot be checked here.":
    "Não foi feita com a palavra-passe das cópias automáticas, por isso não pode ser verificada aqui.",
  "The backup itself is damaged: {error}":
    "A cópia em si está danificada: {error}",
  "There is no backup there.":
    "Não há nenhuma cópia lá.",
  "Check the backups":
    "Verificar as cópias",
  "After each automatic backup Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two of them, picked at random, are read through and open too. Of the server it then only looks at what is listed there, so nothing is downloaded. Check now also downloads the server’s newest backup and ten of its parts, and reads ten in the folder.":
    "Depois de cada cópia automática, o Erevos volta a lê-la da pasta: abre com a sua palavra-passe, cada parte que nomeia está lá, com o seu tamanho, e duas delas, escolhidas ao acaso, são lidas por inteiro e abrem também. Do servidor só olha então para o que lá está listado, por isso nada é descarregado. Verificar agora descarrega também a cópia mais recente do servidor e dez das suas partes, e lê dez na pasta.",
  "Checking…":
    "A verificar…",
  "Check now":
    "Verificar agora",
  "{place}: not checked yet.":
    "{place}: ainda não verificada.",
  "{place}, {when}: {error}":
    "{place}, {when}: {error}",
  "{place}, {when}: of its {parts} parts, {missing} are missing and {damaged} are not as made. A restore would lack their photos and files. Back up now, then check again.":
    "{place}, {when}: das suas {parts} partes, faltam {missing} e {damaged} não estão como foram feitas. Um restauro ficaria sem as suas fotos e ficheiros. Faz uma cópia agora e verifica de novo.",
  "{place}, {when}: whole. It opens, all {parts} parts are there, and the {read} read through open too.":
    "{place}, {when}: inteira. Abre, todas as {parts} partes estão lá, e as {read} lidas por inteiro abrem também.",
  "{place}, {when}: the backup and all {parts} parts are there, each of its size.":
    "{place}, {when}: a cópia e todas as {parts} partes estão lá, cada uma com o seu tamanho.",
  "Stopped after {done} of {count} parts.":
    "Parado depois de {done} de {count} partes.",
  "Checking the parts: {done} of {count}":
    "A verificar as partes: {done} de {count}",
  "Full check of the folder":
    "Verificação completa da pasta",
  "The full check reads every part in the folder through and compares it with the SHA-256 the backup wrote down for it. It takes a few minutes for many GB, and nothing leaves the phone.":
    "A verificação completa lê por inteiro cada parte da pasta e compara-a com o SHA-256 que a cópia anotou para ela. Com muitos GB demora alguns minutos, e nada sai do telefone.",
  "The check after it found a problem: {error}":
    "A verificação a seguir encontrou um problema: {error}",
  "The check after it found {missing} of its {parts} parts missing and {damaged} damaged.":
    "A verificação a seguir encontrou, das suas {parts} partes, {missing} em falta e {damaged} danificadas.",
  "Making the backup…": "Fazendo o backup…",
  "Gathering chats, contacts, SMS, calls and settings…": "Juntando conversas, contatos, SMS, chamadas e configurações…",
  "Encrypting and saving…": "Criptografando e salvando…",
  "Encrypting photos, files and voice messages…": "Criptografando fotos, arquivos e mensagens de voz…",
  "Keep Erevos open until it is done: a notice says when.": "Mantenha o Erevos aberto até terminar: um aviso dirá quando.",
  "Backup made": "Backup feito",
  "{name} ({size}) is saved in {folder}.": "{name} ({size}) está salvo em {folder}.",
  "Encrypting and sending…": "Criptografando e enviando…",
  "Sent a backup to {server}: {total}.": "Backup enviado para {server}: {total}.",
  "Or to {server}, your server: it gets the backup encrypted, under a random name.": "Ou para {server}, o seu servidor: ele recebe o backup criptografado, com um nome aleatório.",
  "Or to a folder on a server of yours over WebDAV, such as Nextcloud: it gets the backup encrypted, under a random name.": "Ou para uma pasta num servidor seu via WebDAV, como o Nextcloud: ele recebe o backup criptografado, com um nome aleatório.",
  "To a server (WebDAV)": "Para um servidor (WebDAV)",
  "Sent a backup to {server}, with {n} file beside it: {total} in all.": "Backup enviado para {server}, com {n} arquivo ao lado: {total} no total.",
  "Sent a backup to {server}, with {n} files beside it: {total} in all.": "Backup enviado para {server}, com {n} arquivos ao lado: {total} no total.",
  "The backup itself is there, but not of the size it was sent with.": "O backup em si está lá, mas não do tamanho com que foi enviado.",
  "A backup of {total} in all went to {server}.": "Um backup de {total} no total foi enviado para {server}.",
  "{name} and {n} file beside it, {total} in all, are saved in {folder}.": "{name} e {n} arquivo ao lado, {total} no total, estão salvos em {folder}.",
  "{name} and {n} files beside it, {total} in all, are saved in {folder}.": "{name} e {n} arquivos ao lado, {total} no total, estão salvos em {folder}.",
  "A backup sent by hand goes whole each time, with every photo and file: up to about {size} now.":
    "Um backup enviado à mão vai inteiro a cada vez, com cada foto e arquivo: até cerca de {size} agora.",
  "A backup sent by hand goes whole each time, with every photo and file.":
    "Um backup enviado à mão vai inteiro a cada vez, com cada foto e arquivo.",
  "With automatic backups on, only what is new goes each time.":
    "Com os backups automáticos ativados, a cada vez só vai o que é novo.",
  "The server keeps the {n} newest whole.":
    "O servidor guarda inteiros os {n} mais recentes.",
  "Automatic backups to a server":
    "Backups automáticos para um servidor",
  "Add the WebDAV folder they go to, such as one in your Nextcloud. Then choose their password: from then on Erevos sends one by itself every day, encrypted.":
    "Adicione a pasta WebDAV para onde eles vão, como uma no seu Nextcloud. Depois escolha a senha deles: a partir daí o Erevos envia um sozinho todo dia, criptografado.",
  "Only to {server}":
    "Só para {server}",
  "Made while Erevos is open, and as it goes to the background, once the last one is older than that. A folder on {device} as well keeps one more copy close at hand.":
    "Feito enquanto o Erevos está aberto, e quando vai para segundo plano, assim que o último é mais antigo que isso. Uma pasta {device} também guarda mais uma cópia à mão.",
  "Automatic backups stop too, as they have no folder on {device}. Those already on the server stay there until you delete them.":
    "Os backups automáticos também param, pois não têm pasta {device}. Os que já estão no servidor ficam lá até você apagar.",
  // Google Drive (lib/google-drive.ts).
  "Not sent to Google Drive. {error}": "Não enviado para o Google Drive. {error}",
  "Sent a backup to Google Drive.": "Backup enviado para o Google Drive.",
  "Automatic backups will go only to the folder and Google Drive from now on. Those already on the server stay there until you delete them.":
    "De agora em diante os backups automáticos vão só para a pasta e para o Google Drive. Os que já estão no servidor ficam lá até você apagar.",
  "Automatic backups will go only to Google Drive from now on. Those already on the server stay there until you delete them.":
    "De agora em diante os backups automáticos vão só para o Google Drive. Os que já estão no servidor ficam lá até você apagar.",
  "Automatic backups stop too, as they have no folder on {device}. Those already in your Google Drive stay there until you delete them.":
    "Os backups automáticos também param, pois não têm pasta {device}. Os que já estão no seu Google Drive ficam lá até você apagar.",
  "Google takes back Erevos's access to your Google Drive, and Erevos forgets the sign-in here. The backups already there stay until you delete them.":
    "O Google retira o acesso do Erevos ao seu Google Drive, e o Erevos esquece o login aqui. Os backups que já estão lá ficam até você apagá-los.",
  "Stop sending to Google Drive": "Parar de enviar ao Google Drive",
  "Backups no longer go to Google Drive.": "Os backups não vão mais para o Google Drive.",
  "Backups no longer go to Google Drive, but Google could not be reached to take back Erevos's access: you can take it back in your Google account's security settings.":
    "Os backups não vão mais para o Google Drive, mas não foi possível chegar ao Google para retirar o acesso do Erevos: você mesmo pode retirá-lo nas configurações de segurança da sua Conta do Google.",
  "There is no Erevos backup in that Google Drive.": "Não há nenhum backup do Erevos nesse Google Drive.",
  "Only to {server} and Google Drive": "Só para {server} e o Google Drive",
  "Only to Google Drive": "Só para o Google Drive",
  "To Google Drive too": "Também para o Google Drive",
  "To Google Drive": "Para o Google Drive",
  "Each automatic backup goes there too, into the folder named Erevos, which keeps the {n} newest.":
    "Cada backup automático vai também para lá, para a pasta chamada Erevos, que guarda os {n} mais recentes.",
  "Automatic backups are off, so none goes there. Turn them on to send one every day.":
    "Os backups automáticos estão desativados, então nenhum vai para lá. Ative-os para enviar um todo dia.",
  "Turn on automatic backups": "Ativar os backups automáticos",
  "Sign in with Google again": "Entrar com o Google de novo",
  "Each automatic backup can also go to your Google Drive, into a folder named Erevos that Erevos makes there. Google gets random bytes under a random name and cannot open them, but it knows your account, when one comes and how big it is. Nothing goes until you sign in with Google.":
    "Cada backup automático também pode ir para o seu Google Drive, para uma pasta chamada Erevos que o Erevos cria lá. O Google recebe bytes aleatórios com um nome aleatório e não consegue abri-los, mas conhece a sua conta, sabe quando chega um e qual o tamanho dele. Nada é enviado até você entrar com o Google.",
  "Sign in with Google": "Entrar com o Google",
  "Google Drive is checked as a server is.": "O Google Drive é verificado como um servidor.",
  "Restore from Google Drive": "Restaurar do Google Drive",
  "Backups in Google Drive, newest first. Choose one, then type its password.":
    "Backups no Google Drive, os mais recentes primeiro. Escolha um e depois digite a senha dele.",
  "Google Drive is not in this build of Erevos.": "O Google Drive não está nesta versão do Erevos.",
  "Google no longer lets Erevos into your Google Drive. Sign in with Google again.":
    "O Google não deixa mais o Erevos entrar no seu Google Drive. Entre com o Google de novo.",
  "Google Drive answered {status}.": "O Google Drive respondeu {status}.",
  "Your Google Drive has no room left for it.": "O seu Google Drive não tem mais espaço para ele.",
  "That file is not in your Google Drive any more.": "Esse arquivo não está mais no seu Google Drive.",
  "This sign-in is not one Erevos started here, or it is more than {minutes} minutes old. Start it again.":
    "Este login não foi iniciado pelo Erevos aqui, ou tem mais de {minutes} minutos. Comece de novo.",
  "You did not allow it at Google, so nothing changed.": "Você não permitiu no Google, então nada mudou.",
  "Google did not take the sign-in: {error}. Start it again.": "O Google não aceitou o login: {error}. Comece de novo.",
  "Erevos was not allowed to keep files in your Google Drive. Sign in again and allow it.":
    "O Erevos não recebeu permissão para guardar arquivos no seu Google Drive. Entre de novo e permita.",
  "Automatic backups went only to Google Drive, and the Erevos from F-Droid sends none there, so none goes anywhere now. Choose a folder on {device}, or add a server, and they go on there.":
    "Os backups automáticos iam só para o Google Drive, e o Erevos do F-Droid não envia nenhum para lá, então agora não vão para lugar nenhum. Escolha uma pasta {device}, ou adicione um servidor, e eles continuam lá.",
  "No longer sent to Google Drive":
    "Não são mais enviados para o Google Drive",
  "The Erevos from F-Droid keeps to services anyone may run, so it sends no backups to Google Drive. Those already there stay until you delete them. Stop sending also takes back, at Google, Erevos's access to your Google Drive.":
    "O Erevos do F-Droid fica com serviços que qualquer um pode rodar, então não envia backups para o Google Drive. Os que já estão lá ficam até você apagá-los. “Parar de enviar” também retira, no Google, o acesso do Erevos ao seu Google Drive.",
};
