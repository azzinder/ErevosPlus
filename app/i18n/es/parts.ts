// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Spanish for parts (lib/i18n.ts).
export const parts: Record<string, string> = {
  // The password screen and the password sheet (lock/gate.tsx, components/PasswordSheet.tsx).
  'Enter your password': 'Introduce tu contraseña',
  Unlock: 'Desbloquear',
  'Wrong password': 'Contraseña incorrecta',
  'Use at least {n} characters.': 'Usa al menos {n} caracteres.',
  'The passwords do not match.': 'Las contraseñas no coinciden.',
  'Use a different password.': 'Usa una contraseña distinta.',
  'New password': 'Contraseña nueva',
  'Repeat password': 'Repite la contraseña',
  'Too many attempts. Try again in {n} minute.': 'Demasiados intentos. Vuelve a intentarlo en {n} minuto.',
  'Too many attempts. Try again in {n} minutes.': 'Demasiados intentos. Vuelve a intentarlo en {n} minutos.',
  'Too many attempts. Try again in {n} second.': 'Demasiados intentos. Vuelve a intentarlo en {n} segundo.',
  'Too many attempts. Try again in {n} seconds.': 'Demasiados intentos. Vuelve a intentarlo en {n} segundos.',

  // Small parts of screens.
  'QR code': 'Código QR',
  Group: 'Grupo',

  // Calls (components/call-screen.tsx, components/group-call-screen.tsx).
  'Call ended': 'Llamada finalizada',
  'They hung up': 'Ha colgado',
  'Turned down': 'Rechazada',
  'They turned it down': 'Ha rechazado la llamada',
  'They are in another call': 'Está en otra llamada',
  'Not answered': 'Sin respuesta',
  'The call could not connect': 'No se pudo conectar la llamada',
  'The call could not connect on their phone': 'No se pudo conectar la llamada en el otro teléfono',
  'Calling…': 'Llamando…',
  'Ringing…': 'Sonando…',
  'Incoming video call': 'Videollamada entrante',
  'Incoming voice call': 'Llamada de voz entrante',
  'Connecting…': 'Conectando…',
  'Missed call': 'Llamada perdida',
  Decline: 'Rechazar',
  Answer: 'Responder',
  Unmute: 'Activar micro',
  Mute: 'Silenciar',
  Speaker: 'Altavoz',
  'Camera on': 'Activar cámara',
  'Camera off': 'Apagar cámara',
  Flip: 'Girar',
  End: 'Colgar',
  'You started a group video call': 'Has iniciado una videollamada de grupo',
  'You started a group call': 'Has iniciado una llamada de grupo',
  '{name} started a group video call': '{name} ha iniciado una videollamada de grupo',
  '{name} started a group call': '{name} ha iniciado una llamada de grupo',
  'Waiting for others · {time}': 'Esperando a los demás · {time}',
  'Missed group call': 'Llamada de grupo perdida',
  'Could not open the microphone': 'No se pudo abrir el micrófono',
  'Pictures pause with more than {n} in the call': 'Las imágenes se pausan con más de {n} en la llamada',
  'Group video call · end-to-end encrypted': 'Videollamada de grupo · cifrada de extremo a extremo',
  'Group voice call · end-to-end encrypted': 'Llamada de voz de grupo · cifrada de extremo a extremo',
  'In the call': 'En la llamada',
  Join: 'Unirse',
  '{name} tried to call. Accept their message request to take calls from them.':
    '{name} ha intentado llamarte. Acepta su solicitud de mensaje para recibir sus llamadas.',
  'The call ended.': 'La llamada ha terminado.',
  'The call has ended.': 'La llamada ha finalizado.',
  'Calls are set up through the server. Type its address in Server first.': 'Las llamadas se establecen por el servidor. Escribe primero su dirección en «Servidor».',

  // The web app's card (components/integrity-card.tsx, lib/integrity.web.ts).
  'This web app': 'Esta app web',
  'Release {version}, checked': 'Versión {version}, verificada',
  'Not checked: no service worker runs Erevos here': 'Sin verificar: aquí ningún service worker ejecuta Erevos',
  "Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is":
    'Erevos solo ejecuta código firmado con su clave de publicación, guardada en este dispositivo. La huella de la clave es',
  '. It must match the one you were given with the address of this server.': '. Debe coincidir con la que te dieron junto con la dirección de este servidor.',
  'Release {version} is checked and starts the next time Erevos opens.': 'La versión {version} está verificada y se iniciará la próxima vez que se abra Erevos.',
  'Last looked for updates {when}.': 'Última búsqueda de actualizaciones: {when}.',
  'Refused:': 'Rechazado:',
  'Looking…': 'Buscando…',
  'Look for an update': 'Buscar una actualización',
  'Notifications while closed': 'Notificaciones con la app cerrada',
  'On in this space': 'Activadas en este espacio',
  'Off in this space': 'Desactivadas en este espacio',
  'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.':
    'Cuando llegan mensajes o entra una llamada con Erevos cerrado, tu servidor envía un push a través del servicio push de este navegador (el de Apple en un iPhone), y Erevos muestra cuántos mensajes han llegado desde la última vez que lo abriste, por ejemplo «3 mensajes nuevos», o «Llamada» si solo ha entrado una llamada, nada más. El push no lleva ni el mensaje ni el remitente, y su recuento está cifrado para este navegador, pero el servicio push ve cuándo llega algo para este dispositivo, y que usa Erevos. Con un servidor o el Erevos de un remitente con una versión anterior a la 2.0.0, o con un mensaje que otros teléfonos llevaron hasta el servidor, no hay número: Erevos muestra «Mensaje nuevo», o «Mensajes nuevos» si han llegado más, hasta que lo abras. Los chats ocultos nunca reciben notificaciones. Cada espacio que las activa tiene su propia dirección push, así que la dirección no une dos espacios en su servidor.',
  'Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.':
    'Aún no se ha podido avisar a tu servidor, así que puede que sigan llegando notificaciones. Erevos le avisa en cuanto esté disponible.',
  'A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.':
    'Una llamada que entra con Erevos cerrado no suena: solo aparece la notificación «Llamada». En un iPhone no se puede hacer más: Apple no deja que una app web funcione mientras está cerrada ni que suene como un teléfono; para eso haría falta una app de la App Store. En Android, la app de Erevos suena incluso cerrada.',
  "Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.":
    'Cada espacio que las tiene activadas tiene su propio service worker en este navegador, que sus ajustes muestran: quien pueda verlos puede contar los espacios con notificaciones. Una solicitud de mensaje de alguien nuevo, a través de tu enlace de contacto, puede que solo aparezca cuando se abra Erevos.',
  'Turn off': 'Desactivar',
  'Turn on': 'Activar',
  'Erevos was tampered with': 'Erevos ha sido manipulado',
  'The server sent this device a new service worker, the part of Erevos that checks its code, and no signed release lists it. Erevos goes on with the checked code while it is open, but once it is closed the browser may start the new one, which could show a fake Erevos. Do not open Erevos from this server again, and do not type your passwords into it, until whoever runs the server knows why. Your chats stay sealed with your password.':
    'El servidor ha enviado a este dispositivo un service worker nuevo, la parte de Erevos que verifica su código, y ninguna versión firmada lo incluye. Erevos sigue con el código verificado mientras está abierto, pero cuando se cierre, el navegador puede iniciar el nuevo, que podría mostrar un Erevos falso. No vuelvas a abrir Erevos desde este servidor ni escribas en él tus contraseñas hasta que quien gestiona el servidor sepa por qué. Tus chats siguen sellados con tu contraseña.',
  'I understand': 'Entendido',
  'Update refused': 'Actualización rechazada',
  '{reason} Erevos keeps the release it has. Settings → Privacy and security → This web app shows what was refused.':
    '{reason} Erevos mantiene la versión que tiene. En «Ajustes → Privacidad y seguridad → Esta app web» se ve lo que se ha rechazado.',

  // Files and photos (lib/attachments.ts, lib/photo*.ts, lib/pick-*.ts, lib/save-file*.ts, lib/backup-place.web.ts).
  'Files can be 100 MB at most.': 'Los archivos pueden ocupar como máximo 100 MB.',
  'The file was changed on the way, so it was not kept.': 'El archivo se modificó por el camino, así que no se ha guardado.',
  'The file is not on the server any more. Files wait there 14 days.': 'El archivo ya no está en el servidor. Los archivos esperan allí 14 días.',
  'This file is not on this phone.': 'Este archivo no está en este teléfono.',
  'This file is not on this computer.': 'Este archivo no está en este ordenador.',
  // Shown after "in", as «en {folder}»: with its article.
  'the place you chose': 'el lugar que elegiste',
  'the downloads folder': 'la carpeta Descargas',
  'Not saved: the share sheet was closed.': 'No guardado: se cerró el menú de compartir.',
  'That folder is not there any more. Choose it again.': 'Esa carpeta ya no existe. Vuelve a elegirla.',
  // A backup that a folder did not take, in plain words (lib/backup-place.ts folderTrouble).
  'The app this folder belongs to made no file in it. Choose a folder on the phone instead, or try again later.':
    'La app a la que pertenece esta carpeta no creó ningún archivo en ella. Elige mejor una carpeta del teléfono o inténtalo de nuevo más tarde.',
  'Erevos may no longer write in this folder. Choose it again.': 'Puede que Erevos ya no pueda escribir en esta carpeta. Vuelve a elegirla.',
  'There is no room left in this folder. Make room, or choose another one.': 'Ya no queda espacio en esta carpeta. Libera espacio o elige otra.',
  'The backup could not be written in this folder: {reason}': 'No se pudo guardar la copia de seguridad en esta carpeta: {reason}',
  'Ready to save.': 'Listo para guardar.',
  Original: 'Original',
  'Original: the photo as it was, full size, with only its place, phone and time taken out.':
    'Original: la foto tal cual, a tamaño completo, sin el lugar, el teléfono y la hora en que se hizo.',
  '{quality}%: a new, smaller photo, quicker to send. It says nothing but its picture.':
    '{quality} %: una foto nueva, más pequeña, más rápida de enviar. No dice nada más que su imagen.',
  'This photo does not get small enough for an MMS.': 'Esta foto no se puede reducir lo suficiente para un MMS.',
  'Erevos may not use the camera. Allow it in the phone settings to take photos.': 'Erevos no tiene permiso para usar la cámara. Permítelo en los ajustes del teléfono para hacer fotos.',
  'Voice message': 'Mensaje de voz',
  Sticker: 'Sticker',
  'File: {name}': 'Archivo: {name}',
  'That voice message is too long.': 'Ese mensaje de voz es demasiado largo.',

  // When a message or an SMS sent for later goes (components/later-picker.tsx, lib/later.ts).
  'In 1 hour': 'En 1 hora',
  'Tonight 20:00': 'Esta noche 20:00',
  'Tomorrow 09:00': 'Mañana 09:00',
  Day: 'Día',
  Hour: 'Hora',
  Minutes: 'Minutos',
  'Goes on {when}.': 'Se enviará el {when}.',
  'That time has gone by. Choose one ahead.': 'Esa hora ya ha pasado. Elige una posterior.',
  'At most a year ahead.': 'Como máximo con un año de antelación.',
  // The home screen's list (lib/inbox.ts).
  'You: {text}': 'Tú: {text}',
  Sun: 'Dom',
  Mon: 'Lun',
  Tue: 'Mar',
  Wed: 'Mié',
  Thu: 'Jue',
  Fri: 'Vie',
  Sat: 'Sáb',

  // Contacts and chats (lib/e2e.ts, lib/space-chats.ts, lock/).
  "That is this chat's own contact link.": 'Es tu propio enlace de contacto.',
  'That code has no key. Ask for their contact link or QR code from this version of Erevos.':
    'Ese código no tiene clave. Pide un enlace de contacto o un código QR de esta versión de Erevos.',
  'No such contact.': 'Ese contacto no existe.',
  'Not a contact.': 'No es un contacto.',
  'That is not a phone number.': 'Eso no es un número de teléfono.',
  'Not a time Erevos keeps messages for.': 'Erevos no guarda mensajes durante ese tiempo.',
  'No conversation with this contact.': 'No hay conversación con este contacto.',
  'That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.':
    'Ese contacto usa el servidor {relay}, y su enlace no tiene clave para él. Pídele un enlace nuevo.',
  'Wrong password for this backup.': 'Contraseña incorrecta para esta copia de seguridad.',

  // Groups (lib/groups.ts, lib/space-groups.ts).
  'No groups here yet.': 'Aún no hay grupos aquí.',
  'Give the group a name.': 'Ponle un nombre al grupo.',
  'You made the group.': 'Has creado el grupo.',
  'Only the group’s admin adds members.': 'Solo el admin del grupo añade miembros.',
  'You are not in this group any more.': 'Ya no estás en este grupo.',
  'Only the group’s admin renames it.': 'Solo el admin del grupo puede cambiarle el nombre.',
  'Only the group’s admin takes members out.': 'Solo el admin del grupo expulsa a miembros.',
  'You closed the group.': 'Has cerrado el grupo.',
  'You asked to leave. The group closes here once the admin takes you out.': 'Has pedido salir. El grupo se cerrará aquí en cuanto el admin te saque.',
  'You left the group.': 'Has salido del grupo.',
  'You are no longer in the group.': 'Ya no estás en el grupo.',
  'member {id}': 'miembro {id}',
  '{who} added you to the group.': '{who} te ha añadido al grupo.',
  '{who} joined.': '{who} se ha unido.',
  '{who} left.': '{who} ha salido.',
  'You asked {who} for their contact link.': 'Has pedido a {who} su enlace de contacto.',
  '{who} asked for your contact link.': '{who} ha pedido tu enlace de contacto.',
  'You sent {who} your contact link. You are each other’s contacts now.':
    'Has enviado tu enlace de contacto a {who}. Ahora cada uno está en los contactos del otro.',
  '{who} sent their contact link. You are each other’s contacts now.': '{who} ha enviado su enlace de contacto. Ahora cada uno está en los contactos del otro.',
  '{who} could not be added as a contact.': 'No se ha podido añadir a {who} como contacto.',
  'Ask for contact links on the phone that holds this account.': 'Pide enlaces de contacto desde el teléfono que tiene esta cuenta.',
  'They are not in this group any more.': 'Ya no está en este grupo.',
  'Not in public groups.': 'No en grupos públicos.',
  'More than one member of this group shows this key, so one of them is not who they say. Ask for their contact link some other way.':
    'Más de un miembro de este grupo muestra esta clave, así que uno de ellos no es quien dice ser. Pide su enlace de contacto de otra forma.',
  'Another space is open now.': 'Ahora hay otro espacio abierto.',
  'Groups go through the server. Type its address in Server first.': 'Los grupos van por el servidor. Escribe primero su dirección en «Servidor».',

  // The build and updates (lib/core.ts, lib/crypto.ts, lib/install-update*.ts, lib/updates.ts, lib/shell.ts).
  'This build has no Erevos core, so it cannot encrypt. Rebuild the app.': 'Esta versión no tiene el núcleo de Erevos, así que no puede cifrar. Vuelve a compilar la app.',
  'The Erevos core gave back something unexpected.': 'El núcleo de Erevos ha devuelto algo inesperado.',
  'This build of Erevos has no Tor.': 'Esta versión de Erevos no tiene Tor.',
  'This build of Erevos has no Nostr.': 'Esta versión de Erevos no tiene Nostr.',
  'This build has no secure random source. Rebuild the app so it includes expo-crypto.':
    'Esta versión no tiene una fuente aleatoria segura. Vuelve a compilar la app para que incluya expo-crypto.',
  'This release has no Android package.': 'Esta versión no tiene paquete para Android.',
  'The download was cut short.': 'La descarga se ha interrumpido.',
  'The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.':
    'La descarga se ha detenido en cada intento, porque la conexión no traía nada durante un rato. No se ha instalado nada: vuelve a intentarlo más tarde o en otra red.',
  'Show what is typed': 'Mostrar lo que escribes',
  'Hide what is typed': 'Ocultar lo que escribes',
  'The downloaded package is not the one the release published. Nothing was installed.':
    'El paquete descargado no es el que publicó la versión. No se ha instalado nada.',
  'This version installs from the download page.': 'Esta versión se instala desde la página de descargas.',
  'GitHub answered {status}.': 'GitHub ha respondido {status}.',
  "The web app's server answered {status}.": 'El servidor de la app web respondió {status}.',
  'The desktop app answered {status}.': 'La app de escritorio ha respondido {status}.',
  'There is no room left on this device. Free some space and try again.': 'No queda espacio en este dispositivo. Libera algo de espacio y vuelve a intentarlo.',
  'This computer has no keyring to seal Erevos’s keys with, so Erevos keeps none. Start a keyring (KWallet, or GNOME Keyring with --password-store=gnome-libsecret), or start Erevos with --plain-secrets to keep them unsealed, readable by your user, and set a password lock.': 'Este ordenador no tiene llavero para sellar las claves de Erevos, así que Erevos no guarda ninguna. Inicia un llavero (KWallet, o GNOME Keyring con --password-store=gnome-libsecret), o inicia Erevos con --plain-secrets para guardarlas sin sellar, legibles por tu usuario, y pon un bloqueo con contraseña.',
  'The browser did not open its storage.': 'El navegador no ha abierto su almacenamiento.',

  // LoRa and nearby phones (lib/lora.ts, lib/nearby.ts).
  'The radio restarts with its new settings, and links again.': 'La radio se reinicia con sus ajustes nuevos y se vuelve a conectar.',
  'There is no server, and no Erevos phone is linked nearby. Type the server address in Server, or come near their phone.':
    'No hay servidor, y no hay ningún teléfono con Erevos conectado cerca. Escribe la dirección del servidor en «Servidor», o acércate a su teléfono.',
  'Too large for LoRa, which takes only text. It can go once the server can be reached, or near their phone.':
    'Demasiado grande para LoRa, que solo transmite texto. Podrá enviarse cuando el servidor esté disponible, o cerca de su teléfono.',

  // The relay (lib/relay.ts, lib/sms-invite.ts); {what} is the request's name.
  'An id is 48 hex characters.': 'Un ID tiene 48 caracteres hexadecimales.',
  'Through Tor: {reason}': 'Por Tor: {reason}',
  'cannot reach the server at {url}, or the token is wrong': 'no se puede contactar con el servidor {url}, o el token es incorrecto',
  'message is not held': 'el mensaje no está guardado',
  'the server at {url} cannot keep messages for later: update it': 'el servidor {url} no puede guardar mensajes para más tarde: actualízalo',
  'The server at {url} that keeps it is no longer set here.': 'El servidor {url} que lo guarda ya no está configurado aquí.',
  'the server closed the connection': 'el servidor ha cerrado la conexión',
  'the server did not answer in time': 'el servidor no respondió a tiempo',
  'lost the connection to the server': 'se ha perdido la conexión con el servidor',
  '{what}: queue not found': '{what}: cola no encontrada',
  '{what}: queue is full': '{what}: la cola está llena',
  '{what}: your free place on this server has used all it may today. It goes on tomorrow.': '{what}: tu sitio gratuito en este servidor ya usó hoy todo lo que puede. Sigue mañana.',
  '{what}: the server could not save it, try again later': '{what}: el servidor no pudo guardarlo, inténtalo más tarde',
  '{what}: the second server could not reach your server, try again later': '{what}: el segundo servidor no pudo contactar con tu servidor, inténtalo más tarde',
  '{what}: the file is not on the server any more': '{what}: el archivo ya no está en el servidor',
  '{what}: the server has no room for files now, try again later': '{what}: el servidor no tiene espacio para archivos ahora, inténtalo más tarde',
  '{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.': '{what}: tu sitio gratuito en este servidor ya movió hoy todos los archivos que puede. Los archivos siguen mañana.',
  '{what}: the server could not keep it, try again later': '{what}: el servidor no pudo conservarlo, inténtalo más tarde',
  '{what}: your server could not reach the server the file is on': '{what}: tu servidor no pudo contactar con el servidor donde está el archivo',
  '{reason}. A server older than this app cannot take files: update it.': '{reason}. Un servidor más antiguo que esta app no acepta archivos: actualízalo.',
  'message is too large': 'el mensaje es demasiado grande',
  'your server has no key for two-hop sending, so it was not sent through the second server':
    'tu servidor no tiene clave para el envío en dos saltos, así que no se envió por el segundo servidor',
  'the link has given all its places on its server. Ask them for a new link': 'el enlace ya dio todos sus sitios en su servidor. Pídele un enlace nuevo',
  'The server address is too long for an SMS invite.': 'La dirección del servidor es demasiado larga para una invitación por SMS.',

  // Notifications in the web app (lib/web-push*.ts).
  'Notifications through the browser are for the web app.': 'Las notificaciones a través del navegador son para la app web.',
  'Your server does not send notifications. It needs a newer version, set up with a push key.':
    'Tu servidor no envía notificaciones. Necesita una versión más reciente, configurada con una clave push.',
  'This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.':
    'Este navegador no puede mostrar notificaciones de una app web cerrada. En un iPhone, añade primero Erevos a la pantalla de inicio.',
  'Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.':
    'Las notificaciones no están permitidas para Erevos. Permítelas en los ajustes de este navegador o teléfono.',
  'Set up the server first, under Server.': 'Configura primero el servidor, en «Servidor».',
  'Notifications could not be turned on: {reason}': 'No se pudieron activar las notificaciones: {reason}',
  // Calls' lines in a chat (lib/call-lines.ts).
  'Voice call': 'Llamada de voz',
  'Video call': 'Videollamada',
  'Group call': 'Llamada de grupo',
  'Group video call': 'Videollamada de grupo',
  'Missed voice call': 'Llamada de voz perdida',
  'Missed video call': 'Videollamada perdida',
  'Missed group video call': 'Videollamada de grupo perdida',
  '{missed}, while in another call': '{missed}, durante otra llamada',
  'turned down': 'rechazada',
  'could not connect': 'no se pudo conectar',
  'they were in another call': 'estaba en otra llamada',
  'not answered': 'sin respuesta',
  'Only {given} of the {all} files went to the downloads, so they are not all saved.': 'Solo {given} de los {all} archivos fueron a las descargas, así que no están todos guardados.',
  'Save the files': 'Guardar los archivos',
  '{given} of the {all} files went to the downloads. Tap Save for the next one: {name}': '{given} de los {all} archivos fueron a las descargas. Toca Guardar para el siguiente: {name}',
  "The browser did not keep it.": "El navegador no lo ha guardado.",
  "New device of {who}: your messages go to it too.": "Nuevo dispositivo de {who}: tus mensajes también van a él.",
  "A device of {who} changed its key: your messages do not go to it.": "Un dispositivo de {who} cambió su clave: tus mensajes no van a él.",
};
