// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// El español de las copias a un servidor (lib/backup-cloud.ts, app/backup.tsx) (i18n/es/index.ts).
export const cloudBackup: Record<string, string> = {
  'Made a backup in {folder}, but it did not go to the server. {error}': 'Copia hecha en {folder}, pero no llegó al servidor. {error}',
  'Made a backup in {folder} and sent it to {server}.': 'Copia hecha en {folder} y enviada a {server}.',
  'Stop sending to the server': 'Dejar de enviar al servidor',
  'Automatic backups will go only to the folder from now on. Those already on the server stay there until you delete them.':
    'Desde ahora las copias automáticas irán solo a la carpeta. Las que ya están en el servidor se quedan allí hasta que las borres.',
  'Backups no longer go to the server.': 'Las copias ya no van al servidor.',
  'To a server too': 'También a un servidor',
  'To {server}': 'A {server}',
  'Last one sent {when}.': 'La última se envió {when}.',
  'None sent yet.': 'Todavía no se envió ninguna.',
  'Each automatic backup goes there too, and the server keeps the {n} newest.': 'Cada copia automática va también allí, y el servidor guarda las {n} más recientes.',
  'The last one did not go: {error} Erevos tries again next time it opens.': 'La última no llegó: {error} Erevos lo intenta de nuevo la próxima vez que se abra.',
  'Stop sending': 'Dejar de enviar',
  'Folder address (WebDAV)': 'Dirección de la carpeta (WebDAV)',
  'In Nextcloud: Files → Files settings → WebDAV gives the start; add a folder you made for backups, like …/remote.php/dav/files/NAME/Backups':
    'En Nextcloud: Archivos → Ajustes de archivos → WebDAV da el comienzo; añade una carpeta que hayas creado para las copias, como …/remote.php/dav/files/NOMBRE/Backups',
  'User name': 'Nombre de usuario',
  "Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.":
    'Mejor una contraseña de aplicación solo para Erevos, de los ajustes de seguridad del servidor: puedes retirarla allí sin cambiar la tuya.',
  'Add a server': 'Añadir un servidor',
  'That is not a folder address. It starts with https://': 'Eso no es una dirección de carpeta. Empieza por https://',
  'The address has to start with https://, so the password and backups go encrypted.':
    'La dirección tiene que empezar por https://, para que la contraseña y las copias vayan cifradas.',
  'Put the user name and password in their own fields, not in the address.': 'Pon el nombre de usuario y la contraseña en sus propios campos, no en la dirección.',
  'The server did not take that user name and password.': 'El servidor no aceptó ese nombre de usuario y esa contraseña.',
  'That folder is not on the server. Make it there first.': 'Esa carpeta no está en el servidor. Créala allí primero.',
  'The server has no room left for it.': 'El servidor no tiene más espacio para ella.',
  'The server answered {status}.': 'El servidor respondió {status}.',
  'Could not reach the server. {error}': 'No se pudo llegar al servidor. {error}',
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, when one comes and roughly how big it is, and your address unless the backup goes through Tor, as the space's Tor setting says. Nothing goes until you add one.":
    "Cada copia automática puede ir también a una carpeta en un servidor que elijas, como tu Nextcloud, por WebDAV. El servidor recibe bytes aleatorios con un nombre aleatorio: no puede abrirlos ni saber que son de Erevos. Aun así ve tu cuenta, cuándo llega una y más o menos cuánto ocupa, y tu dirección, salvo que la copia vaya por Tor, como dice el ajuste de Tor del espacio. No se envía nada hasta que añadas uno.",
  "This space sends Everything through Tor, and Tor here cannot reach a server, so nothing went to it.":
    "Este espacio envía Todo por Tor, y aquí Tor no puede llegar a un servidor, así que no se le envió nada.",
  "There is no Erevos backup in that folder.":
    "No hay ninguna copia de seguridad de Erevos en esa carpeta.",
  "Restore from a server":
    "Restaurar desde un servidor",
  "The folder on your server that automatic backups went to. The password is used for this restore only and not kept.":
    "La carpeta de tu servidor a la que iban las copias automáticas. La contraseña se usa solo para esta restauración y no se guarda.",
  "Look there":
    "Buscar allí",
  "Backups on {server}, newest first. Choose one, then type its password.":
    "Copias en {server}, las más recientes primero. Elige una y luego escribe su contraseña.",
  "In a browser the server has to let the web app in (CORS), and this one did not, or could not be reached.":
    "En un navegador el servidor tiene que dejar entrar a la web app (CORS), y este no la dejó o no se pudo alcanzar.",
  "Erevos forgets the server and its password here. The backups already on it stay there until you delete them.":
    "Erevos olvida aquí el servidor y su contraseña. Las copias que ya están en él se quedan allí hasta que las borres.",
  "Send a backup there now and then; the server keeps the {n} newest.":
    "Envía allí una copia de vez en cuando; el servidor guarda las {n} más recientes.",
  "The last one did not go: {error}":
    "La última no se envió: {error}",
  "Send a backup now":
    "Enviar una copia ahora",
  "A backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV, each time you send one. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Una copia puede ir también a una carpeta en un servidor que elijas, como tu Nextcloud, por WebDAV, cada vez que envíes una. El servidor recibe bytes aleatorios con un nombre aleatorio: no puede abrirlos ni saber que son de Erevos. Aun así ve tu cuenta, tu dirección, cuándo llega una y más o menos cuánto ocupa. No se envía nada hasta que añadas uno.",
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Cada copia automática puede ir también a una carpeta en un servidor que elijas, como tu Nextcloud, por WebDAV. El servidor recibe bytes aleatorios con un nombre aleatorio: no puede abrirlos ni saber que son de Erevos. Aun así ve tu cuenta, tu dirección, cuándo llega una y más o menos cuánto ocupa. No se envía nada hasta que añadas uno.",
  "In a browser this works only with a server set to let the web app in (CORS), which Nextcloud is not as it comes. The desktop app and Android need nothing of it.":
    "En un navegador esto solo funciona con un servidor configurado para dejar entrar a la web app (CORS), cosa que Nextcloud no hace de serie. La app de escritorio y Android no necesitan nada de eso.",
  "A backup larger than {size} MB does not come from a server. Download it from the server and tap Restore a backup.": "Una copia de más de {size} MB no llega desde un servidor. Descárgala del servidor y toca Restaurar una copia de seguridad.",
  "Automatic backups need a folder on {device}: choose one.":
    "Las copias automáticas necesitan una carpeta en {device}: elige una.",
  "Sent a backup to {server}.":
    "Copia enviada a {server}.",
  "Making the backup: photos, files and voice messages, {percent}%…":
    "Haciendo la copia: fotos, archivos y mensajes de voz, {percent} %…",
  "Putting back photos, files and voice messages: {percent}%…":
    "Restaurando fotos, archivos y mensajes de voz: {percent} %…",
  "Choose the files":
    "Elegir los archivos",
  "Choose the folder":
    "Elegir la carpeta",
  "No folder on {device} yet":
    "Aún no hay carpeta en {device}",
  "These automatic backups came with a backup made on another device, with their password; the folder they went to stays with that device. Choose a folder here, and they go on into it.":
    "Estas copias automáticas llegaron con una copia hecha en otro dispositivo, con su contraseña; la carpeta a la que iban se queda con ese dispositivo. Elige aquí una carpeta y seguirán yendo a ella.",
  "Until then they go only to the server.":
    "Hasta entonces solo van al servidor.",
  "Choose a folder":
    "Elegir una carpeta",
  "What stays with each device and comes with no backup: the fingerprint, the folders Erevos may write in, what the phone lets it do and which apps make calls and send SMS. An XMPP account comes back as a new device of itself, and Matrix asks you to sign in again.":
    "Lo que se queda en cada dispositivo y no viene con ninguna copia: la huella dactilar, las carpetas en las que Erevos puede escribir, lo que el teléfono le permite hacer y qué apps hacen las llamadas y envían los SMS. Una cuenta XMPP vuelve como un dispositivo nuevo de sí misma, y Matrix te pide que vuelvas a iniciar sesión.",
  "Its photos, files and voice messages are in {n} more file beside it, with the same start: keep them together.":
    "Sus fotos, archivos y mensajes de voz están en {n} archivo más junto a ella, con el mismo comienzo de nombre: mantenlos juntos.",
  "Its photos, files and voice messages are in {n} more files beside it, with the same start: keep them together.":
    "Sus fotos, archivos y mensajes de voz están en {n} archivos más junto a ella, con el mismo comienzo de nombre: mantenlos juntos.",
  "A file of this backup is not there: {name}.":
    "Un archivo de esta copia no está: {name}.",
  "{n} files of this backup are not there, {name} among them.":
    "{n} archivos de esta copia no están, entre ellos {name}.",
  "This backup's photos, files and voice messages are in {n} more file beside it, whose name starts as its own or as an earlier backup's. Choose it.":
    "Las fotos, archivos y mensajes de voz de esta copia están en {n} archivo más junto a ella, cuyo nombre empieza como el suyo o como el de una copia anterior. Elígelo.",
  "This backup's photos, files and voice messages are in {n} more files beside it, whose names start as its own or as an earlier backup's. Choose them all.":
    "Las fotos, archivos y mensajes de voz de esta copia están en {n} archivos más junto a ella, cuyos nombres empiezan como el suyo o como el de una copia anterior. Elígelos todos.",
  "This backup's photos, files and voice messages are in {n} more file beside it. Choose the folder the backup is in.":
    "Las fotos, archivos y mensajes de voz de esta copia están en {n} archivo más junto a ella. Elige la carpeta en la que está la copia.",
  "This backup's photos, files and voice messages are in {n} more files beside it. Choose the folder the backup is in.":
    "Las fotos, archivos y mensajes de voz de esta copia están en {n} archivos más junto a ella. Elige la carpeta en la que está la copia.",
  "A file of this backup is missing: {name}. Nothing was changed.":
    "Falta un archivo de esta copia: {name}. No se cambió nada.",
  "A file of this backup is damaged, or belongs to another backup: {name}. Nothing was changed.":
    "Un archivo de esta copia está dañado o pertenece a otra copia: {name}. No se cambió nada.",
  "A file of this backup is damaged, or belongs to another backup: {name}.":
    "Un archivo de esta copia está dañado o pertenece a otra copia: {name}.",
  "Restore everything else without it? The photos, files and voice messages on {device} stay as they are, and those it holds do not come back.":
    "¿Restaurar todo lo demás sin él? Las fotos, los archivos y los mensajes de voz en {device} quedan como están, y los que contiene no vuelven.",
  "Restore everything else without them? The photos, files and voice messages on {device} stay as they are, and those they hold do not come back.":
    "¿Restaurar todo lo demás sin ellos? Las fotos, los archivos y los mensajes de voz en {device} quedan como están, y los que contienen no vuelven.",
  "Restore the rest":
    "Restaurar el resto",
  "Restored without {n} file of the backup, {name}: the photos, files and voice messages in it did not come back.":
    "Restaurada sin {n} archivo de la copia, {name}: las fotos, los archivos y los mensajes de voz que contenía no volvieron.",
  "Restored without {n} files of the backup, {name} among them: the photos, files and voice messages in them did not come back.":
    "Restaurada sin {n} archivos de la copia, entre ellos {name}: las fotos, los archivos y los mensajes de voz que contenían no volvieron.",
  "What takes room":
    "Qué ocupa espacio",
  "How much room Erevos takes on {device}, by kind: each automatic backup holds it all. Only the files’ names and sizes are looked at, here, and nothing is sent.":
    "Cuánto espacio ocupa Erevos en {device}, por tipo: cada copia automática lo contiene todo. Solo se miran los nombres y tamaños de los archivos, aquí, y no se envía nada.",
  "In all: {size}":
    "En total: {size}",
  "Measure":
    "Medir",
  "Measure again":
    "Medir de nuevo",
  "The Collection, and photos and files in chats":
    "La Colección, y fotos y archivos en los chats",
  "Contact pictures":
    "Fotos de contactos",
  "Chat history":
    "Historial de chats",
  "Backups kept inside Erevos":
    "Copias de seguridad dentro de Erevos",
  "Left over from writes that did not end":
    "Restos de escrituras que no terminaron",
  "Cache":
    "Caché",
  "Other: {name}":
    "Otros: {name}",
  "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.":
    "Parte de lo que guarda un lugar no se pudo leer, así que nada se toma por un resto. Inténtalo más tarde.",
  "Nothing opens with that. Check it and type it again.":
    "Con eso no se abre nada. Revísalo y escríbelo de nuevo.",
  "Opened {opened} of {count}; they are read with the rest.":
    "Abiertos {opened} de {count}; se leen con el resto.",
  "Opened, and it is read with the rest.":
    "Abierto, y se lee con lo demás.",
  "That one is read already.":
    "Ese ya se lee.",
  "Delete the leftovers?":
    "¿Borrar los restos?",
  "{size} of photos and files that none of the places read here names (places read: {n}). A place you did not open here loses its photos and files for good: open every one first. Backups already made keep them.":
    "{size} de fotos y archivos que ninguno de los lugares leídos aquí nombra (lugares leídos: {n}). Un lugar que no abriste aquí pierde sus fotos y archivos para siempre: abre todos primero. Las copias de seguridad ya hechas los conservan.",
  "{size} freed.":
    "{size} liberados.",
  "Photos and files that nothing on the phone names any more, as those of an import that stopped in its middle, stay on it and in every backup. Only a place opened with its key can say which are its own: so first type here, one at a time or several at once separated by commas or spaces, the PIN of each of your hidden chats and the password of any other space you have. This space is read by itself. Nothing is deleted before you see how much and say so; a file written in the last day is never taken.":
    "Las fotos y archivos que ya nada en el teléfono nombra, como los de una importación que se cortó a medias, se quedan en él y en cada copia de seguridad. Solo un lugar abierto con su clave puede decir cuáles son suyos: por eso escribe aquí primero, uno a uno o varios a la vez separados por comas o espacios, el PIN de cada uno de tus chats ocultos y la contraseña de cualquier otro espacio que tengas. Este espacio se lee solo. No se borra nada antes de que veas cuánto es y digas que sí; un archivo escrito en el último día nunca se toma.",
  "PIN or password":
    "PIN o contraseña",
  "Read with this space: {n}":
    "Leídos con este espacio: {n}",
  "Leftovers: {size} in {n} chunks.":
    "Restos: {size} en {n} trozos.",
  "No leftovers.":
    "No hay restos.",
  "Find leftovers":
    "Buscar restos",
  "Delete them":
    "Borrarlos",
  "Leftovers":
    "Restos",
  "The backup itself is not there.":
    "La copia en sí no está.",
  "The backup itself is still empty there.":
    "La copia en sí sigue vacía ahí.",
  "It is not made with the automatic backups’ password, so it cannot be checked here.":
    "No está hecha con la contraseña de las copias automáticas, así que no se puede comprobar aquí.",
  "The backup itself is damaged: {error}":
    "La copia en sí está dañada: {error}",
  "There is no backup there.":
    "No hay ninguna copia ahí.",
  "Check the backups":
    "Comprobar las copias",
  "After each automatic backup Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two of them, picked at random, are read through and open too. Of the server it then only looks at what is listed there, so nothing is downloaded. Check now also downloads the server’s newest backup and ten of its parts, and reads ten in the folder.":
    "Tras cada copia automática, Erevos la vuelve a leer de la carpeta: se abre con su contraseña, cada parte que nombra está ahí, con su tamaño, y dos de ellas, elegidas al azar, se leen enteras y también se abren. Del servidor solo mira entonces lo que aparece en su lista, así que no se descarga nada. Comprobar ahora además descarga la copia más reciente del servidor y diez de sus partes, y lee diez en la carpeta.",
  "Checking…":
    "Comprobando…",
  "Check now":
    "Comprobar ahora",
  "{place}: not checked yet.":
    "{place}: aún sin comprobar.",
  "{place}, {when}: {error}":
    "{place}, {when}: {error}",
  "{place}, {when}: of its {parts} parts, {missing} are missing and {damaged} are not as made. A restore would lack their photos and files. Back up now, then check again.":
    "{place}, {when}: de sus {parts} partes faltan {missing} y {damaged} no están como se hicieron. Una restauración no tendría sus fotos y archivos. Haz una copia ahora y vuelve a comprobar.",
  "{place}, {when}: whole. It opens, all {parts} parts are there, and the {read} read through open too.":
    "{place}, {when}: completa. Se abre, las {parts} partes están, y las {read} leídas enteras también se abren.",
  "{place}, {when}: the backup and all {parts} parts are there, each of its size.":
    "{place}, {when}: la copia y sus {parts} partes están ahí, cada una con su tamaño.",
  "Stopped after {done} of {count} parts.":
    "Detenido tras {done} de {count} partes.",
  "Checking the parts: {done} of {count}":
    "Comprobando las partes: {done} de {count}",
  "Full check of the folder":
    "Comprobación completa de la carpeta",
  "The full check reads every part in the folder through and compares it with the SHA-256 the backup wrote down for it. It takes a few minutes for many GB, and nothing leaves the phone.":
    "La comprobación completa lee entera cada parte de la carpeta y la compara con el SHA-256 que la copia anotó para ella. Con muchos GB tarda unos minutos, y nada sale del teléfono.",
  "The check after it found a problem: {error}":
    "La comprobación posterior encontró un problema: {error}",
  "The check after it found {missing} of its {parts} parts missing and {damaged} damaged.":
    "La comprobación posterior encontró que de sus {parts} partes faltan {missing} y {damaged} están dañadas.",
  "Making the backup…": "Haciendo la copia…",
  "Gathering chats, contacts, SMS, calls and settings…": "Reuniendo chats, contactos, SMS, llamadas y ajustes…",
  "Encrypting and saving…": "Cifrando y guardando…",
  "Encrypting photos, files and voice messages…": "Cifrando fotos, archivos y mensajes de voz…",
  "Keep Erevos open until it is done: a notice says when.": "Mantén Erevos abierto hasta que termine: un aviso te dirá cuándo.",
  "Backup made": "Copia hecha",
  "{name} ({size}) is saved in {folder}.": "{name} ({size}) está guardado en {folder}.",
  "Encrypting and sending…": "Cifrando y enviando…",
  "Sent a backup to {server}: {total}.": "Copia enviada a {server}: {total}.",
  "Or to {server}, your server: it gets the backup encrypted, under a random name.": "O a {server}, tu servidor: recibe la copia cifrada, con un nombre al azar.",
  "Or to a folder on a server of yours over WebDAV, such as Nextcloud: it gets the backup encrypted, under a random name.": "O a una carpeta de un servidor tuyo por WebDAV, como Nextcloud: recibe la copia cifrada, con un nombre al azar.",
  "To a server (WebDAV)": "A un servidor (WebDAV)",
  "Sent a backup to {server}, with {n} file beside it: {total} in all.": "Copia enviada a {server}, con {n} archivo al lado: {total} en total.",
  "Sent a backup to {server}, with {n} files beside it: {total} in all.": "Copia enviada a {server}, con {n} archivos al lado: {total} en total.",
  "The backup itself is there, but not of the size it was sent with.": "La copia en sí está, pero no del tamaño con que se envió.",
  "A backup of {total} in all went to {server}.": "Una copia de {total} en total se envió a {server}.",
  "{name} and {n} file beside it, {total} in all, are saved in {folder}.": "{name} y {n} archivo al lado, {total} en total, están guardados en {folder}.",
  "{name} and {n} files beside it, {total} in all, are saved in {folder}.": "{name} y {n} archivos al lado, {total} en total, están guardados en {folder}.",
  "A backup sent by hand goes whole each time, with every photo and file: up to about {size} now.":
    "Una copia enviada a mano va entera cada vez, con cada foto y archivo: hasta unos {size} ahora.",
  "A backup sent by hand goes whole each time, with every photo and file.":
    "Una copia enviada a mano va entera cada vez, con cada foto y archivo.",
  "With automatic backups on, only what is new goes each time.":
    "Con las copias automáticas activadas, cada vez solo va lo nuevo.",
  "The server keeps the {n} newest whole.":
    "El servidor guarda enteras las {n} más recientes.",
  "Automatic backups to a server":
    "Copias automáticas a un servidor",
  "Add the WebDAV folder they go to, such as one in your Nextcloud. Then choose their password: from then on Erevos sends one by itself every day, encrypted.":
    "Añade la carpeta WebDAV a la que irán, por ejemplo una en tu Nextcloud. Luego elige su contraseña: desde entonces Erevos envía una por sí solo cada día, cifrada.",
  "Only to {server}":
    "Solo a {server}",
  "Made while Erevos is open, and as it goes to the background, once the last one is older than that. A folder on {device} as well keeps one more copy close at hand.":
    "Se hace mientras Erevos está abierto, y al pasar a segundo plano, cuando la última es más antigua. Una carpeta en {device} además guarda una copia más a mano.",
  "Automatic backups stop too, as they have no folder on {device}. Those already on the server stay there until you delete them.":
    "También se detienen las copias automáticas, porque no tienen carpeta en {device}. Las que ya están en el servidor se quedan allí hasta que las borres.",
  // Google Drive (lib/google-drive.ts).
  "Not sent to Google Drive. {error}": "No enviado a Google Drive. {error}",
  "Sent a backup to Google Drive.": "Copia enviada a Google Drive.",
  "Automatic backups will go only to the folder and Google Drive from now on. Those already on the server stay there until you delete them.":
    "Desde ahora las copias automáticas irán solo a la carpeta y a Google Drive. Las que ya están en el servidor se quedan allí hasta que las borres.",
  "Automatic backups will go only to Google Drive from now on. Those already on the server stay there until you delete them.":
    "Desde ahora las copias automáticas irán solo a Google Drive. Las que ya están en el servidor se quedan allí hasta que las borres.",
  "Automatic backups stop too, as they have no folder on {device}. Those already in your Google Drive stay there until you delete them.":
    "También se detienen las copias automáticas, porque no tienen carpeta en {device}. Las que ya están en tu Google Drive se quedan allí hasta que las borres.",
  "Google takes back Erevos's access to your Google Drive, and Erevos forgets the sign-in here. The backups already there stay until you delete them.":
    "Google retira el acceso de Erevos a tu Google Drive, y Erevos olvida aquí el inicio de sesión. Las copias que ya están allí se quedan hasta que las borres.",
  "Stop sending to Google Drive": "Dejar de enviar a Google Drive",
  "Backups no longer go to Google Drive.": "Las copias ya no van a Google Drive.",
  "Backups no longer go to Google Drive, but Google could not be reached to take back Erevos's access: you can take it back in your Google account's security settings.":
    "Las copias ya no van a Google Drive, pero no se pudo llegar a Google para retirar el acceso de Erevos: puedes retirarlo tú en los ajustes de seguridad de tu cuenta de Google.",
  "There is no Erevos backup in that Google Drive.": "No hay ninguna copia de seguridad de Erevos en ese Google Drive.",
  "Only to {server} and Google Drive": "Solo a {server} y a Google Drive",
  "Only to Google Drive": "Solo a Google Drive",
  "To Google Drive too": "También a Google Drive",
  "To Google Drive": "A Google Drive",
  "Each automatic backup goes there too, into the folder named Erevos, which keeps the {n} newest.":
    "Cada copia automática va también allí, a la carpeta llamada Erevos, que guarda las {n} más recientes.",
  "Automatic backups are off, so none goes there. Turn them on to send one every day.":
    "Las copias automáticas están desactivadas, así que no va ninguna allí. Actívalas para enviar una cada día.",
  "Turn on automatic backups": "Activar las copias automáticas",
  "Sign in with Google again": "Volver a iniciar sesión con Google",
  "Each automatic backup can also go to your Google Drive, into a folder named Erevos that Erevos makes there. Google gets random bytes under a random name and cannot open them, but it knows your account, when one comes and how big it is. Nothing goes until you sign in with Google.":
    "Cada copia automática puede ir también a tu Google Drive, a una carpeta llamada Erevos que Erevos crea allí. Google recibe bytes aleatorios con un nombre aleatorio y no puede abrirlos, pero conoce tu cuenta, cuándo llega una y cuánto ocupa. No se envía nada hasta que inicies sesión con Google.",
  "Sign in with Google": "Iniciar sesión con Google",
  "Google Drive is checked as a server is.": "Google Drive se comprueba como un servidor.",
  "Restore from Google Drive": "Restaurar desde Google Drive",
  "Backups in Google Drive, newest first. Choose one, then type its password.":
    "Copias en Google Drive, las más recientes primero. Elige una y luego escribe su contraseña.",
  "Google Drive is not in this build of Erevos.": "Google Drive no está en esta versión de Erevos.",
  "Google no longer lets Erevos into your Google Drive. Sign in with Google again.":
    "Google ya no deja entrar a Erevos en tu Google Drive. Vuelve a iniciar sesión con Google.",
  "Google Drive answered {status}.": "Google Drive respondió {status}.",
  "Your Google Drive has no room left for it.": "Tu Google Drive no tiene más espacio para ella.",
  "That file is not in your Google Drive any more.": "Ese archivo ya no está en tu Google Drive.",
  "This sign-in is not one Erevos started here, or it is more than {minutes} minutes old. Start it again.":
    "Este inicio de sesión no lo empezó Erevos aquí, o tiene más de {minutes} minutos. Empieza de nuevo.",
  "You did not allow it at Google, so nothing changed.": "No lo permitiste en Google, así que no cambió nada.",
  "Google did not take the sign-in: {error}. Start it again.": "Google no aceptó el inicio de sesión: {error}. Empieza de nuevo.",
  "Erevos was not allowed to keep files in your Google Drive. Sign in again and allow it.":
    "Erevos no recibió permiso para guardar archivos en tu Google Drive. Vuelve a iniciar sesión y permítelo.",
  "Automatic backups went only to Google Drive, and the Erevos from F-Droid sends none there, so none goes anywhere now. Choose a folder on {device}, or add a server, and they go on there.":
    "Las copias automáticas iban solo a Google Drive, y el Erevos de F-Droid no envía ninguna allí, así que ahora no van a ninguna parte. Elige una carpeta en {device}, o añade un servidor, y seguirán allí.",
  "No longer sent to Google Drive":
    "Ya no se envían a Google Drive",
  "The Erevos from F-Droid keeps to services anyone may run, so it sends no backups to Google Drive. Those already there stay until you delete them. Stop sending also takes back, at Google, Erevos's access to your Google Drive.":
    "El Erevos de F-Droid se queda con servicios que cualquiera puede ejecutar, así que no envía copias a Google Drive. Las que ya están allí se quedan hasta que las borres. «Dejar de enviar» además retira, en Google, el acceso de Erevos a tu Google Drive.",
};
