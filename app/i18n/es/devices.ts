// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of linked devices: the account on the phone and on a computer (lib/devices.ts, app/devices.tsx; i18n/es/index.ts).
export const devices: Record<string, string> = {
  // Linking and the links (lib/devices.ts).
  Computer: 'Ordenador',
  'Linked devices could not open.': 'No se han podido abrir los dispositivos vinculados.',
  'That device is linked already.': 'Ese dispositivo ya está vinculado.',
  'That is not a code from Linked devices.': 'Eso no es un código de «Dispositivos vinculados».',
  'The code changed. Compare it again.': 'El código ha cambiado. Vuelve a compararlo.',
  'This device is no longer linked to a phone.': 'Este dispositivo ya no está vinculado a un teléfono.',
  'This is a linked device. Link from the phone that holds the account.': 'Este es un dispositivo vinculado. Vincula desde el teléfono que tiene la cuenta.',
  'This space has chats of its own. Link from a space with none, such as one that opens with a new password.':
    'Este espacio tiene chats propios. Vincula desde un espacio sin ninguno, como uno que se abra con una contraseña nueva.',
  'This space is linked already.': 'Este espacio ya está vinculado.',
  'These hidden chats are linked already.': 'Estos chats ocultos ya están vinculados.',
  'These hidden chats have chats of their own. Link from hidden chats with none, such as those a new PIN sets.':
    'Estos chats ocultos tienen chats propios. Vincula desde chats ocultos sin ninguno, como los que abre un PIN nuevo.',
  'Too long to go through the phone.': 'Demasiado largo para pasar por el teléfono.',
  'Type the server address in Server first: linked devices reach this phone through it.':
    'Escribe primero la dirección del servidor en «Servidor»: los dispositivos vinculados llegan a este teléfono a través de él.',
  '{n} devices are linked already, the most there can be.': 'Ya hay {n} dispositivos vinculados, el máximo posible.',

  // The menu, and the chat on a linked device (app/index.tsx, app/chat.tsx).
  'Linked devices': 'Dispositivos vinculados',
  'Not sent by the phone': 'El teléfono no lo envió',
  'These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.':
    'Estos chats vienen de la copia de seguridad de un dispositivo vinculado: puedes leerlos aquí, pero no escribir en ellos. Para escribir, vuelve a vincular este dispositivo al teléfono en Dispositivos vinculados.',
  'This account on a computer or in a browser too': 'Esta cuenta también en un ordenador o en un navegador',
  "This chat is the phone's: move it into hidden chats there.": 'Este chat es del teléfono: muévelo a los chats ocultos desde ahí.',
  'These hidden chats are linked to a phone: move the chat into them there.':
    'Estos chats ocultos están vinculados a un teléfono: mueve el chat a ellos desde ahí.',
  "This chat is the phone's: move it out of the hidden chats there.": 'Este chat es del teléfono: sácalo de los chats ocultos desde ahí.',

  // A call answered on another device of the account (components/call-screen.tsx, lib/call-lines.ts).
  'Answered on another device': 'Respondida en otro dispositivo',
  'answered on another device': 'respondida en otro dispositivo',

  // Linked devices (app/devices.tsx).
  'All of it': 'Todos',
  'The last month': 'El último mes',
  'The last week': 'La última semana',
  None: 'Ninguno',
  'Web browser': 'Navegador web',
  'Code copied. Paste it on the phone in Settings → Data and devices → Linked devices.': 'Código copiado. Pégalo en el teléfono, en «Ajustes → Datos y dispositivos → Dispositivos vinculados».',
  'Code copied. Paste it on the phone, in Linked devices of the same hidden chats.':
    'Código copiado. Pégalo en el teléfono, en «Dispositivos vinculados» de los mismos chats ocultos.',
  'Linked. The chats come from the phone, and with them the messages it chose to bring over.':
    'Vinculado. Los chats llegan desde el teléfono, y con ellos los mensajes que se eligió traer.',
  'Not linked. Someone else may have read the code. Make a new one, and link again.':
    'No vinculado. Puede que otra persona haya leído el código. Crea uno nuevo y vuelve a vincular.',
  'Now the computer shows a code too. If it is {code}, tap They match there.': 'Ahora el ordenador también muestra un código. Si es {code}, toca «Coinciden» ahí.',
  'Unlink this device': 'Desvincular este dispositivo',
  'Unlink {name}': 'Desvincular {name}',
  "The account's chats leave this device, messages and all, and so do the accounts it brought over from the phone. The phone keeps them.":
    'Los chats de la cuenta salen de este dispositivo, con todos sus mensajes, igual que las cuentas que trajo del teléfono. El teléfono los conserva.',
  'Nothing more goes to it, and nothing it sends is taken. What it has stays on it, behind its own lock.':
    'Ya no se le envía nada, y no se acepta nada de lo que envíe. Lo que tiene se queda en él, tras su propio bloqueo.',
  'Unlinked.': 'Desvinculado.',
  'Unlinked here. The phone was not told: unlink this device there too.': 'Desvinculado aquí. El teléfono no se ha enterado: desvincula este dispositivo también desde ahí.',
  'Unlinked. The device was not told, and gets nothing more.': 'Desvinculado. El dispositivo no se ha enterado, y ya no recibe nada.',
  'The messages go to it now. What it has already is not kept twice.': 'Ahora se le envían los mensajes. Lo que ya tiene no se guarda dos veces.',
  'Messages to bring over': 'Mensajes que traer',
  'Photos and files too': 'También fotos y archivos',
  'Linked to {name}': 'Vinculado a {name}',
  'Since {when}. Last heard from {last}.': 'Desde el {when}. Última conexión: {last}.',
  'This device has the chats and groups of the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server. Calls ring here too. New groups, public groups and group calls stay on the phone for now.':
    'Este dispositivo tiene los chats y los grupos del teléfono que tiene la cuenta. Lo que escribes aquí pasa por el teléfono, que tiene que estar encendido y llegar al servidor. Las llamadas también suenan aquí. Por ahora, los grupos nuevos, los grupos públicos y las llamadas de grupo se quedan en el teléfono.',
  'These hidden chats have the chats and groups of the same hidden chats on the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server, with these hidden chats open or receiving while closed there. Calls ring here too. New groups and group calls stay on the phone for now.':
    'Estos chats ocultos tienen los chats y los grupos de los mismos chats ocultos del teléfono que tiene la cuenta. Lo que escribes aquí pasa por el teléfono, que tiene que estar encendido y llegar al servidor, con estos chats ocultos abiertos allí o recibiendo estando cerrados. Las llamadas también suenan aquí. Por ahora, los grupos nuevos y las llamadas de grupo se quedan en el teléfono.',
  'Make or join groups on the phone that holds this account.': 'Crea grupos o únete a ellos desde el teléfono que tiene esta cuenta.',
  'Group calls ring on the phone that holds this account, for now. Call from there.':
    'Por ahora, las llamadas de grupo suenan en el teléfono que tiene esta cuenta. Llama desde ahí.',
  'The same account on a computer or in a browser. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Hidden chats and what a second password opens never go with it: each links on its own, from inside it.':
    'La misma cuenta en un ordenador o en un navegador. La cuenta sigue en el teléfono: él reenvía, cifrado de extremo a extremo, lo que llega y lo que escribe el ordenador, así que tus contactos no ven nada nuevo. Los chats ocultos y lo que abre una segunda contraseña nunca se pasan con ella: cada uno se vincula por su cuenta, desde dentro.',
  'These hidden chats on a computer or in a browser, linked on their own. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Nothing of it shows in the space, nor goes to its linked devices.':
    'Estos chats ocultos en un ordenador o en un navegador, vinculados por su cuenta. La cuenta sigue en el teléfono: él reenvía, cifrado de extremo a extremo, lo que llega y lo que escribe el ordenador, así que tus contactos no ven nada nuevo. Nada de esto se ve en el espacio ni va a sus dispositivos vinculados.',
  'Link {name}': 'Vincular {name}',
  'Once you tap Link, the computer shows this code. Link only if it shows the same:': 'Cuando toques «Vincular», el ordenador mostrará este código. Vincula solo si muestra el mismo:',
  Link: 'Vincular',
  Devices: 'Dispositivos',
  'Linked {when}. Last heard from {last}.': 'Vinculado el {when}. Última conexión: {last}.',
  'Linked {when}.': 'Vinculado el {when}.',
  'Waiting for They match to be tapped on it.': 'Esperando a que se toque «Coinciden» en él.',
  'Bringing over messages: {n} so far.': 'Trayendo mensajes: {n} hasta ahora.',
  'Bring over': 'Traer',
  'Bring over messages again': 'Volver a traer los mensajes',
  'Signed in as {name}: this device has a token of its own there. Now tap Link to my phone.':
    'Sesión iniciada como {name}: este dispositivo tiene ahí un token propio. Ahora toca «Vincular a mi teléfono».',
  'Link a computer to this phone': 'Vincular un ordenador a este teléfono',
  "On the computer, open Settings → Data and devices → Linked devices → Link to my phone. Then scan its code with this phone's camera, or copy it there and paste it here.":
    'En el ordenador, abre «Ajustes → Datos y dispositivos → Dispositivos vinculados → Vincular a mi teléfono». Luego escanea su código con la cámara de este teléfono, o cópialo ahí y pégalo aquí.',
  "On the computer, open the same hidden chats with their PIN, then Linked devices → Link to my phone in them. Then scan its code with this phone's camera while these hidden chats are open, or copy it there and paste it here.":
    'En el ordenador, abre los mismos chats ocultos con su PIN y luego, dentro de ellos, «Dispositivos vinculados → Vincular a mi teléfono». Después escanea su código con la cámara de este teléfono mientras estos chats ocultos están abiertos, o cópialo allí y pégalo aquí.',
  'Code from the computer': 'Código del ordenador',
  Next: 'Siguiente',
  'Link to my phone': 'Vincular a mi teléfono',
  'The phone read the code. Does it show this one too?': 'El teléfono ha leído el código. ¿Muestra también este?',
  'They match': 'Coinciden',
  'They differ': 'No coinciden',
  'On the phone that holds the account, scan this code with the camera, or paste it in Settings → Data and devices → Linked devices. This space must have no chats of its own.':
    'En el teléfono que tiene la cuenta, escanea este código con la cámara, o pégalo en «Ajustes → Datos y dispositivos → Dispositivos vinculados». Este espacio no debe tener chats propios.',
  'On the phone that holds the account, open the same hidden chats with their PIN, then scan this code with the camera, or paste it in Linked devices in them. These hidden chats must have no chats of their own.':
    'En el teléfono que tiene la cuenta, abre los mismos chats ocultos con su PIN y luego escanea este código con la cámara, o pégalo en sus «Dispositivos vinculados». Estos chats ocultos no deben tener chats propios.',
  'Copy the code': 'Copiar el código',
  'Share the code': 'Compartir el código',
  'Waiting for the phone. The code works for half an hour.': 'Esperando al teléfono. El código vale durante media hora.',
  'Use this when this device is the computer: its chats become those of the phone that holds the account.':
    'Usa esto cuando este dispositivo sea el ordenador: sus chats pasan a ser los del teléfono que tiene la cuenta.',
  'Use this when this device is the computer: these hidden chats become those of the same hidden chats on the phone that holds the account.':
    'Úsalo cuando este dispositivo sea el ordenador: estos chats ocultos pasan a ser los mismos chats ocultos del teléfono que tiene la cuenta.',
  'These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.':
    'Estos chats ocultos aún no tienen cola en el servidor: dentro de ellos, escribe la dirección del servidor en «Para usuarios avanzados» y luego crea su cola.',
  'The phone answers on a queue of this device on a server: the one the phone uses, or any other. If the server asks for a token, sign in when it offers that, or type one.':
    'El teléfono responde en una cola de este dispositivo en un servidor: el que usa el teléfono, u otro cualquiera. Si el servidor pide un token, inicia sesión cuando lo ofrezca, o escribe uno.',
  'Name of this device': 'Nombre de este dispositivo',
  'Tap Link to my phone, and a QR code for the phone shows here.': 'Toca «Vincular a mi teléfono» y aquí aparece un código QR para el teléfono.',
  'Send the accounts to {name}': 'Enviar las cuentas a {name}',
  "This space's Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Las cuentas de Matrix, XMPP y Nostr de este espacio se le envían, cifradas de extremo a extremo, y él inicia sesión en cada una como un dispositivo nuevo. Una vez desvinculado, cierra sesión en ellas.',
  "These hidden chats' own Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, into the same hidden chats there, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Las cuentas propias de Matrix, XMPP y Nostr de estos chats ocultos van a él, cifradas de extremo a extremo, a los mismos chats ocultos de allí, y él inicia sesión en cada una como dispositivo nuevo. Al desvincularse, cierra la sesión en ellas.',
  'Sent to {name}: {accounts}.': 'Enviado a {name}: {accounts}.',
  'Nothing went: this space has no Matrix, XMPP or Nostr account, or too much waits for that device already.':
    'No se envió nada: este espacio no tiene ninguna cuenta de Matrix, XMPP ni Nostr, o ya hay demasiado esperando a ese dispositivo.',
  'Nothing went: these hidden chats have no Matrix, XMPP or Nostr account of their own, or too much waits for that device already.':
    'No se envió nada: estos chats ocultos no tienen cuenta propia de Matrix, XMPP ni Nostr, o ya espera demasiado para ese dispositivo.',
  'Accounts from the phone': 'Cuentas del teléfono',
  'Matrix: {id}, signed in here as a new device.': 'Matrix: {id}, con la sesión iniciada aquí como un dispositivo nuevo.',
  'Matrix: sign in to {id} here once, with its password. Its keys come from the phone, so no Security Key or check by emoji is needed.':
    'Matrix: inicia sesión aquí una vez en {id}, con su contraseña. Sus claves vienen del teléfono, así que no hace falta clave de seguridad ni comprobar con emojis.',
  'Sign in to Matrix': 'Iniciar sesión en Matrix',
  'XMPP: {id}, signed in here as a new device.': 'XMPP: {id}, con la sesión iniciada aquí como un dispositivo nuevo.',
  'Nostr: the key of the Nostr chats is here too.': 'Nostr: la clave de los chats de Nostr también está aquí.',
  'Not brought over yet: {accounts}. Tried again each time this space opens.':
    'Aún sin traer: {accounts}. Se vuelve a intentar cada vez que se abre este espacio.',
  'Not brought over yet: {accounts}. Tried again each time these hidden chats open.':
    'Aún sin traer: {accounts}. Se vuelve a intentar cada vez que se abren estos chats ocultos.',
  'Once this device is unlinked, it signs out of the accounts it brought over.':
    'Cuando se desvincule este dispositivo, cerrará sesión en las cuentas que trajo.',
  'Send the accounts': 'Enviar las cuentas',
  'Same settings on every device': 'Los mismos ajustes en todos los dispositivos',
  'The language, the look and Last seen change on the other devices too. A photo behind the screens, passwords, PINs and what is about this device alone stay as they are on each.':
    'El idioma, el aspecto y Última vez cambian también en los otros dispositivos. Una foto detrás de las pantallas, las contraseñas, los PIN y lo que solo atañe a este dispositivo se quedan como están en cada uno.',
  "The groups come back to this phone once the device that holds them hears it.": "Los grupos vuelven a este teléfono en cuanto lo sepa el dispositivo que los tiene.",
  "The groups go to {name} once it hears it.": "Los grupos van a {name} en cuanto lo sepa.",
  "Groups stay on": "Los grupos están en",
  "Moving: both devices have to be on.": "Se están moviendo: los dos dispositivos tienen que estar encendidos.",
  "The keys of the groups are on one device at a time, never copied. There, groups work with the phone off; the other devices write in them through it, so it has to be on. Moving them needs both on, and the server. Public groups stay on the phone.": "Las claves de los grupos están en un solo dispositivo a la vez, nunca copiadas. Allí los grupos funcionan con el teléfono apagado; los otros dispositivos escriben en ellos a través de él, así que tiene que estar encendido. Para moverlos hacen falta los dos encendidos, y el servidor. Los grupos públicos se quedan en el teléfono.",
  "The groups are held here": "Los grupos están aquí",
  "Groups work on this device with the phone off, and you can make new ones here. The phone and the other devices write in them through this one, so it has to be on.": "Los grupos funcionan en este dispositivo con el teléfono apagado, y puedes crear grupos nuevos aquí. El teléfono y los otros dispositivos escriben en ellos a través de este, así que tiene que estar encendido.",
  "The groups are held on this device. On the phone, move them back to it first, under Groups stay on.": "Los grupos están en este dispositivo. En el teléfono, devuélvelos primero allí, en Los grupos están en.",
  "The groups are held on {name}. Move them back to this phone first, under Groups stay on.": "Los grupos están en {name}. Devuélvelos primero a este teléfono, en Los grupos están en.",
  "That device is no longer linked.": "Ese dispositivo ya no está vinculado.",
  "The groups go to the other device through the server. Type its address in Server first.": "Los grupos van al otro dispositivo a través del servidor. Escribe primero su dirección en Servidor.",
  "Unlink all the same?": "¿Desvincular de todos modos?",
  "Unlinked now, the groups go from this device, and the phone shows each as left.": "Al desvincular, los grupos se van de este dispositivo y el teléfono muestra cada uno como abandonado.",
  "Unlinked now, this phone shows each of the groups as left, unless they are still on their way to it: those stay here. Do it if the device is lost.": "Al desvincular, este teléfono muestra cada grupo como abandonado, salvo los que aún van de camino hacia él: esos se quedan aquí. Hazlo si perdiste el dispositivo.",
  "A device whose Erevos is older cannot hold them: update it there first.": "Un dispositivo con un Erevos más antiguo no puede guardarlos: actualízalo allí primero.",
  "{name} has an older Erevos: update it there first.": "{name} tiene un Erevos más antiguo: actualízalo allí primero.",
  "The other device could not take the groups: they stay here.": "El otro dispositivo no pudo recibir los grupos: se quedan aquí.",

  // Linking with the short code (components/quick-link.tsx, lib/link-nostr.ts).
  'Inside hidden chats, link with the code Link to my phone shows inside the same hidden chats on the computer.':
    'Dentro de los chats ocultos, vincula con el código que muestra «Vincular a mi teléfono» dentro de los mismos chats ocultos en el ordenador.',
  '{why} Link this way instead: sign in to the server below, then tap Link to my phone.':
    '{why} Vincula de otra forma: inicia sesión en el servidor de abajo y toca «Vincular a mi teléfono».',
  'Link another way':
    'Vincular de otra forma',
  'The phone that answered is not the one that read the code. Make a new code, and link again.':
    'El teléfono que respondió no es el que leyó el código. Crea un código nuevo y vincula de nuevo.',
  'The phone answered, but this computer could not use its server: {error}':
    'El teléfono respondió, pero este ordenador no pudo usar su servidor: {error}',
  'The phone answered. Setting up this computer…':
    'El teléfono respondió. Preparando este ordenador…',
  'Linking with the phone…':
    'Vinculando con el teléfono…',
  'Keep both open for a moment. Nothing has to be typed or compared.':
    'Deja ambos abiertos un momento. No hay que escribir ni comparar nada.',
  'Scan this with the phone that holds the account, then tap Link on the phone. Nothing else.':
    'Escanea esto con el teléfono que tiene la cuenta y toca «Vincular» en el teléfono. Nada más.',
  'Making the code…':
    'Creando el código…',
  'The phone sends this computer what it needs through Nostr, end-to-end encrypted. The code works for half an hour.':
    'El teléfono envía a este ordenador lo que necesita a través de Nostr, cifrado de extremo a extremo. El código funciona media hora.',
  'The computer did not answer. On it, tap Link another way and sign in to the server there, then scan its code again.':
    'El ordenador no respondió. En él, toca «Vincular de otra forma», inicia sesión en el servidor allí y escanea su código de nuevo.',
  'Linked to {name}. The chats go to it now.':
    'Vinculado a {name}. Los chats van ahora a él.',
  'Link {name} to this phone?':
    '¿Vincular {name} a este teléfono?',
  'Link only a computer of yours, whose code you scanned just now. It gets the chats of this space and the messages chosen below.':
    'Vincula solo un ordenador tuyo, cuyo código acabas de escanear. Recibe los chats de este espacio y los mensajes elegidos abajo.',
  'Waiting for the computer…':
    'Esperando al ordenador…',
  'No Nostr server could be reached.':
    'No se pudo llegar a ningún servidor de Nostr.',
  'The Nostr server did not take it.':
    'El servidor de Nostr no lo aceptó.',
  'No Nostr server took it.':
    'Ningún servidor de Nostr lo aceptó.',
  'Asked. On {name}, tap Link again: it links to this phone and keeps its chats.':
    'Pedido. En {name}, toca «Volver a vincular»: se vincula a este teléfono y conserva sus chats.',
  'Let go of {name}':
    'Olvidar {name}',
  'It is asked nothing from this phone. To link it later, link it as the first time.':
    'Este teléfono ya no le pide nada. Para vincularlo más tarde, vincúlalo como la primera vez.',
  'Let go':
    'Olvidar',
  'Said yes. Once the phone hears it, this device is linked to it again.':
    'Dijiste que sí. En cuanto el teléfono lo sepa, este dispositivo vuelve a estar vinculado a él.',
  '{name} asks to link again':
    '{name} pide volver a vincular',
  'A backup of the phone was put back on {name}, which asked {when}. If you did that, link this device to it: it keeps its chats and gets what came since, and the phone before gets nothing more from it. If not, tap Not now: it stays linked as it is.':
    'Se restauró una copia de seguridad del teléfono en {name}, que lo pidió el {when}. Si lo hiciste tú, vincula este dispositivo a él: conserva sus chats y recibe lo que llegó desde entonces, y el teléfono anterior ya no recibe nada de él. Si no, toca «Ahora no»: sigue vinculado como está.',
  'Waiting for {name}: it has to be on.':
    'Esperando a {name}: tiene que estar encendido.',
  'Link again':
    'Volver a vincular',
  'From the backup':
    'De la copia de seguridad',
  'These devices were linked to the phone this backup was made on. Ask only those that are still yours: each shows the ask, and links to this phone once Link again is tapped on it. It keeps its chats, and gets what came since.':
    'Estos dispositivos estaban vinculados al teléfono en que se hizo esta copia de seguridad. Pide solo a los que siguen siendo tuyos: cada uno muestra la petición y se vincula a este teléfono en cuanto se toca «Volver a vincular» en él. Conserva sus chats y recibe lo que llegó desde entonces.',
  'It said yes. Linking…':
    'Dijo que sí. Vinculando…',
  'Asked {when}. Waiting for Link again to be tapped on it.':
    'Pedido el {when}. Esperando a que se toque «Volver a vincular» en él.',
  'Linked there {when}.':
    'Vinculado allí el {when}.',
  'Not asked yet.':
    'Aún no se ha pedido.',
  'Ask to link again':
    'Pedir que vuelva a vincularse',
  'The phone no longer asks this device to link again.':
    'El teléfono ya no pide a este dispositivo que vuelva a vincularse.',
  '{name} asks this device to link again, as a backup of the phone was put back there. If you did that, tap Link again in Linked devices.':
    '{name} pide a este dispositivo que vuelva a vincularse, porque allí se restauró una copia de seguridad del teléfono. Si lo hiciste tú, toca «Volver a vincular» en Dispositivos vinculados.',
  'The phone this backup was made on had linked devices. In Linked devices, ask those that are yours to link again: each keeps its chats.':
    'El teléfono en que se hizo esta copia de seguridad tenía dispositivos vinculados. En Dispositivos vinculados, pide a los que son tuyos que vuelvan a vincularse: cada uno conserva sus chats.',
};
