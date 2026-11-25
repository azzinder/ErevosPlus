// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of What's new, what each version changed (lib/whats-new.ts, app/whats-new.tsx) (i18n/es/index.ts).
export const whatsNew: Record<string, string> = {
  "**Release candidate 3**: Erevos+ with everything Erevos 3.0.0-rc.3 brought, and what is below.":
    "**Versión candidata 3**: Erevos+ con todo lo que trajo Erevos 3.0.0-rc.3, y lo que sigue.",
  "**Session and Signal in backups**: in Erevos+, a backup now holds Session's account and chats, sealed with its password, and a restore brings them back. It holds Signal's history too, but not its link to the account: register or link Signal again, and the old messages show beside the new ones, to read only. **Backups** and the message after a backup say that Telegram and Messenger are not in it, and what each needs after a restore. See [Backups](#backup).":
    "**Session y Signal en las copias**: en Erevos+, una copia de seguridad guarda ahora la cuenta y los chats de Session, cifrados con su contraseña, y restaurar los devuelve. Guarda también el historial de Signal, pero no su enlace con la cuenta: registra o vincula Signal de nuevo, y los mensajes antiguos se ven junto a los nuevos, solo para leer. **Copias de seguridad** y el mensaje tras una copia dicen que Telegram y Messenger no están en ella, y qué necesita cada uno tras restaurar. Ver [Copias de seguridad](#backup).",
  "**One + for every chat**: in Erevos+'s Telegram, Signal, Messenger and Session chats, **+** beside where you write opens a grid with icons, as in Erevos's own chats, in place of the grey buttons. See [Telegram](#telegram).":
    "**Un + para cada chat**: en los chats de Telegram, Signal, Messenger y Session de Erevos+, **+** junto a donde escribes abre una cuadrícula con iconos, como en los chats propios de Erevos, en lugar de los botones grises. Ver [Telegram](#telegram).",
  "**Where you write stays at the bottom**: in a Telegram, Signal, Messenger or Session chat with few messages, the field no longer sits under the last message in the middle of the screen.":
    "**Donde escribes se queda abajo**: en un chat de Telegram, Signal, Messenger o Session con pocos mensajes, el campo ya no queda bajo el último mensaje en mitad de la pantalla.",
  "**Messenger in its case, one way in**: in Erevos+, with Messenger **In its case**, its card in **Services** opens the case as Settings does, and Facebook's feed is in the case's own bar, with no Facebook card or button beside it. If the case cannot open, Erevos says why. See [Messenger](#messenger).":
    "**Messenger en su funda, un solo camino**: en Erevos+, con Messenger **En su funda**, su tarjeta en **Servicios** abre la funda como los Ajustes, y el inicio de Facebook está en la barra de la funda, sin tarjeta ni botón de Facebook al lado. Si la funda no puede abrirse, Erevos dice por qué. Mira [Messenger](#messenger).",
  "**Telegram notices go once read**: in Erevos+, a Telegram chat read and left at once no longer leaves its notice of new messages behind, and a muted chat says nothing of what came meanwhile once it is unmuted. See [Telegram](#telegram).":
    "**Los avisos de Telegram se van al leer**: en Erevos+, un chat de Telegram que lees y dejas enseguida ya no deja atrás su aviso de mensajes nuevos, y un chat silenciado no dice nada de lo que llegó entretanto cuando deja de estarlo. Mira [Telegram](#telegram).",
  "**Release candidate**: Erevos+ as it is meant to come out, with everything Erevos 3.0.0-rc.1 brought.":
    "**Versión candidata**: Erevos+ tal como debe salir, con todo lo que trajo Erevos 3.0.0-rc.1.",
  "**Release candidate 3**: Erevos Lite with what Erevos 3.0.0-rc.3 brought to its chats: it starts by itself after the phone turns on, shows nothing of a space before its password, sends backups to your own server by hand too, and can begin with a server of your own.":
    "**Candidata 3**: Erevos Lite con lo que Erevos 3.0.0-rc.3 trajo a sus chats: se inicia solo al encender el teléfono, no muestra nada de un espacio antes de su contraseña, envía copias de seguridad a tu propio servidor también a mano, y puede empezar con un servidor propio.",
  "**Your own server from the first start**: on a phone with no relay yet, **I have no invite**, at the first start and on **New chat**, opens one screen that says where your messages wait and offers every way to begin: an account at a server such as LPHL, **I have a server of my own**, with its address and the code you were given, or **Start without a server**. See [Erevos on your own servers](#own-servers).":
    "**Tu propio servidor desde el primer inicio**: en un teléfono que aún no tiene relay, **No tengo invitación**, en el primer inicio y en **Chat nuevo**, abre una pantalla que dice dónde esperan tus mensajes y ofrece todas las formas de empezar: una cuenta en un servidor como LPHL, **Tengo un servidor propio**, con su dirección y el código que te dieron, o **Empezar sin servidor**. Ver [Erevos en tus propios servidores](#own-servers).",
  "**Speech and translation models from a server of yours**: where Erevos asks to download them, **Download from another server…** takes a web folder of yours that holds the same files; Erevos checks every file and refuses one that was changed. See [Erevos on your own servers](#own-servers).":
    "**Modelos de voz y de traducción desde un servidor tuyo**: donde Erevos pide descargarlos, **Descargar de otro servidor…** toma una carpeta web tuya que tiene los mismos archivos; Erevos comprueba cada archivo y rechaza el que haya cambiado. Ver [Erevos en tus propios servidores](#own-servers).",
  "A contact link made for a website is read when pasted or scanned whatever web server its page is on; until now, only from LPHL's.":
    "Un enlace de contacto para un sitio web se lee al pegarlo o escanearlo, esté en el servidor web que esté su página; hasta ahora, solo desde el de LPHL.",
  "An invite by SMS is read the same way, whatever web server its page is on.":
    "Una invitación por SMS se lee igual, esté en el servidor web que esté su página.",
  "LPHL's addresses are now in one place in the code: a community that builds Erevos for itself can name its own web server and first relay instead.":
    "Las direcciones de LPHL están ahora en un solo lugar del código: una comunidad que compila Erevos para sí misma puede indicar en su lugar su propio servidor web y su primer relay.",
  "**Erevos starts by itself after the phone turns on**: where it receives in the background, it now does so unless you choose **Wait until I open it**, under **Settings** → **Notifications** → **In the background**; until now, only once you turned it on there. Before you open a space it reads no message and rings for no call: the spaces set to **Also while another space is open** say only that something came. See [Chat through a relay](#relay).":
    "**Erevos se inicia solo al encender el teléfono**: donde recibe en segundo plano, ahora lo hace salvo que elijas **Esperar a que yo lo abra**, en **Ajustes** → **Notificaciones** → **En segundo plano**; hasta ahora, solo si lo activabas allí. Antes de que abras un espacio no lee ningún mensaje ni suena por ninguna llamada: los espacios con **También mientras otro espacio está abierto** dicen solo que llegó algo. Ver [Chatear a través de un relay](#relay).",
  "**Nothing of a space shows before its password**: on Android, the phone covers Erevos's screens as it goes to the background, and back after the 30 seconds they show only after the password. **Lock now** covers them at once, and **Fingerprint or face** is there as soon as the password screen shows. See [Password lock](#lock).":
    "**Nada de un espacio se ve antes de su contraseña**: en Android, el teléfono cubre las pantallas de Erevos cuando pasa a segundo plano, y si vuelves después de los 30 segundos, solo se ven tras la contraseña. **Bloquear ahora** las cubre al instante, y **Huella o cara** está ahí en cuanto aparece la pantalla de la contraseña. Ver [Bloqueo con contraseña](#lock).",
  "**Camera before the password**: on Android, with Erevos locked, the camera's icon opens the camera at once. What it takes is encrypted as it is taken and shows only after the password, in the Collection; to have the camera wait for the password, turn off **Open the camera without the password** in the Collection's settings. See [Collection](#collection).":
    "**Cámara antes de la contraseña**: en Android, con Erevos bloqueado, el icono de la cámara abre la cámara al instante. Lo que toma se cifra al tomarlo y solo se ve tras la contraseña, en la Colección; para que la cámara espere la contraseña, desactiva **Abrir la cámara sin la contraseña** en los ajustes de la Colección. Ver [Colección](#collection).",
  "**Backups to your own server, by hand too**: **Make a backup** offers **To a server (WebDAV)** beside **Into a folder**, also with automatic backups off; once a server is set, its button sends a backup there at once. See [Backups](#backup).":
    "**Copias a tu propio servidor, también a mano**: **Hacer una copia de seguridad** ofrece **A un servidor (WebDAV)** junto a **En una carpeta**, también con las copias automáticas desactivadas; con un servidor ya puesto, su botón envía allí una copia al instante. Ver [Copias de seguridad](#backup).",
  "**Clear numbers for a backup**: once one is made, Erevos says how big it is in all, with the files beside it, when it began and when it ended, and what is not in it. See [Backups](#backup).":
    "**Números claros de una copia**: cuando termina, Erevos dice cuánto ocupa en total, con los archivos que la acompañan, cuándo empezó y cuándo terminó, y qué no contiene. Ver [Copias de seguridad](#backup).",
  "**The Collection's server, checked and brought back**: in the Collection's settings, **Check** looks whether every piece of its files is on its WebDAV server, whole, and opens 4 picked at random; **Bring back the files not on this phone** fetches at once every file this phone lacks. See [Collection](#collection).":
    "**El servidor de la Colección, comprobado y de vuelta**: en los ajustes de la Colección, **Comprobar** mira si cada trozo de sus archivos está entero en su servidor WebDAV, y abre 4 elegidos al azar; **Traer de vuelta los archivos que no están en este teléfono** trae de una vez cada archivo que le falta a este teléfono. Ver [Colección](#collection).",
  "**New chat, as it was meant to look**: **Near me**, **Far away** and **I have their code** are three large buttons, with **My link**, **Blocked contacts** and **For advanced users** small under them; the QR code for someone beside you shows small, and large at a tap, and an invite's link shows short on the page, though what is sent is always the whole link. See [Chat through a relay](#relay).":
    "**Chat nuevo, como se pensó**: **A mi lado**, **Lejos** y **Tengo su código** son tres botones grandes, con **Mi enlace**, **Contactos bloqueados** y **Para usuarios avanzados** pequeños debajo; el código QR para alguien a tu lado se ve pequeño, y grande con un toque, y el enlace de una invitación se ve corto en la página, aunque lo que se envía es siempre el enlace entero. Ver [Chatear a través de un relay](#relay).",
  "**SMS conversations like Erevos's own chats**: **+** opens under the field as in them, with **Send later** among the rest, and in a short conversation the field stays at the bottom. See [SMS](#sms).":
    "**Las conversaciones SMS como los chats de Erevos**: **+** se abre bajo el campo como en ellos, con **Enviar más tarde** entre lo demás, y en una conversación corta el campo se queda abajo. Ver [SMS](#sms).",
  "**Nostr, Matrix and XMPP chats like Erevos's own**: **+** opens under the field as in them, with **Disappearing message** and **Send later**, and in a short chat the field stays at the bottom.":
    "**Los chats de Nostr, Matrix y XMPP como los de Erevos**: **+** se abre bajo el campo como en ellos, con **Mensaje temporal** y **Enviar más tarde**, y en un chat corto el campo se queda abajo.",
  "The home screen no longer says, for a few seconds after the password on a phone with many chats, that there is no relay yet: the line waits until it knows.":
    "La pantalla de inicio ya no dice durante unos segundos tras la contraseña, en un teléfono con muchos chats, que aún no hay relay: la línea espera hasta saberlo.",
  "On Android and in the desktop app, a backup made by hand is now read back from its folder, as the automatic ones are, and a backup sent to a server is checked there: it and every part it names are there, each of the size it was sent with.":
    "En Android y en la app de escritorio, una copia hecha a mano ahora se vuelve a leer desde su carpeta, como las automáticas, y una copia enviada a un servidor se comprueba allí: ella y cada parte que nombra están, cada una del tamaño con que se envió.",
  "After each copy of the Collection to its WebDAV server, Erevos lists the folder again: a piece that is not there whole goes again with the next copy.":
    "Tras cada copia de la Colección a su servidor WebDAV, Erevos vuelve a listar la carpeta: un trozo que no está entero allí vuelve a ir con la copia siguiente.",
  "On Android, the lock's 30 seconds are counted on a clock that changing the phone's date and time does not move.":
    "En Android, los 30 segundos del bloqueo se cuentan en un reloj que cambiar la fecha y la hora del teléfono no mueve.",
  "What the camera takes with Erevos locked is encrypted for the Collection of the space opened last, with a key of its own: the locked camera keeps no key that opens anything.":
    "Lo que toma la cámara con Erevos bloqueado se cifra para la Colección del último espacio abierto, con una clave propia: la cámara bloqueada no guarda ninguna clave que abra nada.",
  "**QR codes and invites with SMS invites off**: a contact QR code or an invite link you take yourself now works also with the invites by SMS turned off under **Find Erevos on a number**; until now nothing happened then.":
    "**Códigos QR e invitaciones con las invitaciones por SMS desactivadas**: un código QR de contacto o un enlace de invitación que aceptas tú mismo funciona ahora también con las invitaciones por SMS desactivadas en **Descubrir Erevos en un número**; hasta ahora no pasaba nada.",
  "**Release candidate 2**: Erevos Lite with what Erevos 3.0.0-rc.2 brought to its chats: New chat that asks where the other person is, and the fixes with it.":
    "**Candidata 2**: Erevos Lite con lo que Erevos 3.0.0-rc.2 trajo a sus chats: Chat nuevo, que pregunta dónde está la otra persona, y las correcciones que lo acompañan.",
  "**New chat asks where the other person is**: **Near me** makes two phones side by side each other's contacts with nothing typed, once both show the same six pictures; **Far away** sends an invite with any app; **I have their code** takes 8 digits, a link or a QR code. See [Chat through a relay](#relay).":
    "**Chat nuevo pregunta dónde está la otra persona**: **A mi lado** hace contactos a dos teléfonos que están juntos sin escribir nada, en cuanto los dos muestran las mismas seis imágenes; **Lejos** envía una invitación con cualquier app; **Tengo su código** acepta 8 dígitos, un enlace o un código QR. Ver [Chatear a través de un relay](#relay).",
  "**Camera at a tap**: on Android, **Appearance** → **Launcher icons** → **Camera** gives the Collection's camera an icon of its own among the phone's apps, and holding Erevos's icon down offers **Camera** too. See [Collection](#collection).":
    "**La cámara a un toque**: en Android, **Apariencia** → **Iconos del lanzador** → **Cámara** da a la cámara de la Colección un icono propio entre las apps del teléfono, y al mantener pulsado el icono de Erevos también se ofrece **Cámara**. Ver [Colección](#collection).",
  "**Chat options in SMS conversations**: a sliders button beside where you write opens **Chat options**, one tidy list in place of the rows of buttons: notifications, the chat's look, search, media and more.":
    "**Opciones del chat en las conversaciones SMS**: un botón de controles junto a donde escribes abre **Opciones del chat**, una lista ordenada en lugar de las filas de botones: notificaciones, aspecto del chat, búsqueda, multimedia y más.",
  "**Chat options in Nostr, Matrix and XMPP chats**: the same sliders button beside where you write, with the contact's own options on Nostr; Nostr's **+** now holds what goes with a message.":
    "**Opciones del chat en los chats de Nostr, Matrix y XMPP**: el mismo botón de controles junto a donde escribes, con las opciones propias del contacto en Nostr; el **+** de Nostr tiene ahora lo que va con un mensaje.",
  "**The warning without Tor comes once**: that your internet address can be seen is now said once for a whole network, not in every chat; after that a quiet line above where you write says it, with **Through Tor for this chat**.":
    "**El aviso sin Tor llega una vez**: que tu dirección de internet se puede ver se dice ahora una vez para toda la red, no en cada chat; después lo dice una línea discreta sobre donde escribes, con **Por Tor para este chat**.",
  "**Start when the phone turns on**: after the phone restarts, Erevos now waits with a notice in the status bar and no longer stops without a word; a tap on the notice opens it for the password.":
    "**Iniciar al encender el teléfono**: tras reiniciar el teléfono, Erevos espera ahora con un aviso en la barra de estado y ya no se detiene sin decir nada; un toque en el aviso lo abre para la contraseña.",
  "**Backup progress stays in sight**: **Make a backup** shows how far it is again when you leave the screen, or Erevos, and come back, and then how it ended.":
    "**El progreso de la copia sigue a la vista**: **Hacer una copia de seguridad** vuelve a mostrar por dónde va cuando sales de la pantalla, o de Erevos, y vuelves, y luego cómo terminó.",
  "Unlocking with a fingerprint or face no longer turns itself off by mistake, when Erevos checked its key while the phone itself was locked or Android answered late.":
    "El desbloqueo con huella o rostro ya no se desactiva solo por error, cuando Erevos comprobaba su clave con el propio teléfono bloqueado o Android tardaba en responder.",
  "**Near me** shows six pictures made from a key the two phones agree on then: a phone in between would show each of you different ones, and each phone gives its contact link only once its owner says the pictures are the same.":
    "**A mi lado** muestra seis imágenes hechas de una clave que los dos teléfonos acuerdan en ese momento: un teléfono en medio mostraría a cada uno otras distintas, y cada teléfono da su enlace de contacto solo cuando su dueño dice que las imágenes son las mismas.",
  "**Speed dial with Erevos locked**: if you turn it on under **Phone** → **Settings**, holding 2 to 9 on the Phone opened without the password calls your speed dial numbers with Erevos locked too. See [Phone](#phone).":
    "**Marcación rápida con Erevos bloqueado**: si la activas en **Teléfono** → **Ajustes**, mantener pulsado del 2 al 9 en el Teléfono abierto sin contraseña llama a tus números de marcación rápida también con Erevos bloqueado. Ver [Teléfono](#phone).",
  "**Release candidate**: Erevos Lite as it is meant to come out, with what Erevos 3.0.0-rc.1 brought to its chats and calls.":
    "**Versión candidata**: Erevos Lite tal como debe salir, con lo que Erevos 3.0.0-rc.1 trajo a sus chats y llamadas.",
  "**Search and Ways stay in sight**: on home, the search and the **Ways** line stay under the top bar while the list scrolls.":
    "**Búsqueda y Caminos a la vista**: en el inicio, la búsqueda y la línea **Caminos** se quedan bajo la barra superior mientras la lista se desplaza.",
  "**Calls on a locked phone**: a call that rings with the phone locked or its screen off now turns the screen on by itself. See [Phone](#phone).":
    "**Llamadas con el teléfono bloqueado**: una llamada que suena con el teléfono bloqueado o la pantalla apagada ahora enciende la pantalla sola. Consulta [Teléfono](#phone).",
  "From a code review made with the help of AI: a restore that cannot finish leaves the phone as it was, and the relay keeps its lent places, held messages and deletions right, also after a power cut.":
    "De una revisión de código hecha con ayuda de IA: una restauración que no termina deja el teléfono como estaba, y el relay lleva bien los sitios prestados, los mensajes para más tarde y los borrados, también tras un corte de luz.",
  "**Erevos Lite**: Erevos's own chats, groups and calls, end-to-end encrypted, in an app of its own that asks for fewer permissions. It moves to Erevos or Erevos+, and they to it, under **Updates**. See [Updates](#updates).":
    "**Erevos Lite**: los chats, grupos y llamadas propios de Erevos, cifrados de extremo a extremo, en una app propia que pide menos permisos. Se pasa a Erevos o a Erevos+, y ellos a él, en **Actualizaciones**. Ver [Actualizaciones](#updates).",
  "**Short passwords**: a new password, or PIN of hidden chats, that is short is taken only after **Use it anyway**. See [Password lock](#lock).":
    "**Contraseñas cortas**: una contraseña nueva, o un PIN de chats ocultos, que sea corto solo se acepta tras **Usar de todos modos**. Consulta [Bloqueo con contraseña](#lock).",
  "Tries of a password or PIN count one at a time, also across a browser's tabs; a restore that cannot finish puts back what the phone had; a release's SHA256SUMS is signed.":
    "Los intentos de contraseña o PIN cuentan de uno en uno, también entre pestañas de un navegador; una restauración que no termina devuelve lo que tenía el teléfono; el SHA256SUMS de cada versión está firmado.",
  "**Erevos, Erevos+ or Erevos Lite**: each is now an app of its own. Choose another under **Updates**, and this Erevos hands it everything here on the phone, encrypted: open the new one within a day and it brings your chats. See [Updates](#updates).":
    "**Erevos, Erevos+ o Erevos Lite**: cada una es ahora una app aparte. Elige otra en **Actualizaciones** y este Erevos le pasa todo aquí en el teléfono, cifrado: abre la nueva en un día y trae tus chats. Ver [Actualizaciones](#updates).",
  "**Make a backup** shows what it does and how far it is in its card, with a bar, and a notice says when the backup is done. See [Backups](#backup).":
    "**Hacer una copia de seguridad** muestra en su tarjeta qué hace y cuánto lleva, con una barra, y un aviso dice cuándo está hecha la copia. Ver [Copias de seguridad](#backup).",
  "**MMS abroad**: while roaming, an MMS waits for a tap, **Fetch (may cost)**, unless you choose otherwise under **Settings** → **Phone and SMS** → **SMS** → **MMS**. See [SMS](#sms).":
    "**MMS en el extranjero**: en itinerancia, un MMS espera un toque, **Descargar (puede costar)**, salvo que elijas otra cosa en **Ajustes** → **Teléfono y SMS** → **SMS** → **MMS**. Ver [SMS](#sms).",
  "**Quick texts**: hold the **+** in an SMS conversation down for short words you write often, and keep your own. See [SMS](#sms).":
    "**Textos rápidos**: mantén pulsado el **+** en una conversación SMS para palabras cortas que escribes a menudo, y guarda las tuyas. Ver [SMS](#sms).",
  "**Reactions from iPhones**: a like or another reaction an iPhone or Google Messages sends by SMS, Liked “…”, shows as 👍 on your message instead of a message of its own. See [SMS](#sms).":
    "**Reacciones de iPhones**: un like u otra reacción que un iPhone o Google Messages envía por SMS, Liked “…”, se muestra como 👍 en tu mensaje en vez de como un mensaje aparte. Ver [SMS](#sms).",
  "**Videos by MMS**: **+** → **Record a video** in an SMS conversation records one in MMS quality with the phone's camera app, and a video that comes plays with a tap. See [SMS](#sms).":
    "**Vídeos por MMS**: **+** → **Grabar un vídeo** en una conversación SMS graba uno en calidad de MMS con la cámara del teléfono, y un vídeo que llega se reproduce con un toque. Ver [SMS](#sms).",
  "**Answer an SMS from its notice**: **What an SMS says, on its notice**, under the SMS settings, off at first, shows who wrote and what on the notice while the space is open, with **Reply** and **Mark as read**. Locked, it says \"New message\" again. See [SMS](#sms).":
    "**Responder un SMS desde su aviso**: **Lo que dice un SMS, en su aviso**, en los ajustes de SMS, desactivado al principio, muestra en el aviso quién escribió y qué mientras el espacio está abierto, con **Responder** y **Marcar como leído**. Bloqueado, vuelve a decir «Mensaje nuevo». Ver [SMS](#sms).",
  "**What an SMS costs**: as you write a longer SMS, a line over the field says how many SMS it goes as, 70 letters each with Greek small letters, accents or an emoji, 160 without. **Without accents (cheaper)**, under the SMS settings, sends it without accents and Greek in capitals, as the old phones wrote it. See [SMS](#sms).":
    "**Lo que cuesta un SMS**: al escribir un SMS largo, una línea sobre el campo dice en cuántos SMS va, 70 caracteres cada uno con minúsculas griegas, acentos o un emoji, 160 sin ellos. **Sin acentos (más barato)**, en los ajustes de SMS, lo envía sin acentos y el griego en mayúsculas, como los teléfonos antiguos. Ver [SMS](#sms).",
  "**Who an unknown number is, without asking anyone**: the call screen of a number that is none of your contacts says its country, place and whether it is a mobile, from the number alone, and warns of spam from a list you download whole under **Phone** → **Settings** → **Spam list**, or numbers you reported in **Recents**. See [Phone](#phone).":
    "**Quién es un número desconocido, sin preguntar a nadie**: la pantalla de llamada de un número que no está en tus contactos dice su país, su lugar y si es un móvil, solo por el número, y avisa del spam con una lista que descargas entera en **Teléfono** → **Ajustes** → **Lista de spam**, o con los números que denunciaste en **Recientes**. Mira [Teléfono](#phone).",
  "**Video calls through your phone company**: where your SIM and network carry them (ViLTE), a video call that comes shows **Answer with video** and **Audio only**, a call can turn video on with **Video**, and **⋯** beside a typed number offers **Video call**. See [Phone](#phone).":
    "**Videollamadas a través de tu compañía**: donde tu SIM y tu red las admiten (ViLTE), una videollamada entrante muestra **Responder con vídeo** y **Solo audio**, una llamada activa el vídeo con **Vídeo**, y **⋯** junto a un número escrito ofrece **Videollamada**. Mira [Teléfono](#phone).",
  "**Who is in a conference call**: once calls are merged, the call screen lists each person, with **Separate** to talk with one alone and **End** to drop one, where your phone company allows it. See [Phone](#phone).":
    "**Quién está en una conferencia**: con las llamadas combinadas, la pantalla de llamada muestra a cada persona, con **Separar** para hablar solo con ella y **Colgar** para sacarla, donde tu compañía lo permite. Mira [Teléfono](#phone).",
  "**Speed dial**: hold a key from 2 to 9 on the Phone's empty keypad to call the number you put on it; an empty key offers to choose one, and **Phone** → **Settings** → **Speed dial** shows them all. Kept sealed in the space. See [Phone](#phone).":
    "**Marcación rápida**: mantén pulsada una tecla del 2 al 9 en el teclado vacío del Teléfono para llamar al número que le pusiste; una tecla vacía te deja elegir uno, y **Teléfono** → **Ajustes** → **Marcación rápida** los muestra todos. Se guardan cifrados en el espacio. Mira [Teléfono](#phone).",
  "**Call settings in one place**: under **Phone** → **Settings**, **Call settings** opens Android's screens for call forwarding, call waiting, showing your number and the voicemail number, for each SIM, and asks your phone company with the usual codes where a phone has no such screen. See [Phone](#phone).":
    "**Los ajustes de llamadas en un sitio**: en **Teléfono** → **Ajustes**, **Ajustes de llamadas** abre las pantallas de Android para el desvío, la llamada en espera, mostrar tu número y el número del buzón de voz, para cada SIM, y pregunta a tu compañía con los códigos de siempre donde el teléfono no tiene esa pantalla. Mira [Teléfono](#phone).",
  "**Voicemail at a hold**: on the Phone's keypad, hold **1** to call your voicemail. Where your phone company sends voicemails as recordings, **Voicemail** beside **Recents** lists them, to play, call back or delete. See [Phone](#phone).":
    "**El buzón de voz con mantener pulsado**: en el teclado del Teléfono, mantén pulsado el **1** para llamar a tu buzón de voz. Donde tu compañía envía los mensajes como grabaciones, **Buzón de voz** junto a **Recientes** los muestra, para escucharlos, devolver la llamada o borrarlos. Mira [Teléfono](#phone).",
  "**Emergency calls without delay**: an emergency number is called at once, never asking which SIM, and with Erevos locked, **Emergency call** on the password screen opens Android's emergency keypad. See [Phone](#phone).":
    "**Llamadas de emergencia sin demora**: un número de emergencia se llama al momento, sin preguntar la SIM, y con Erevos bloqueado, **Llamada de emergencia** en la pantalla de contraseña abre el teclado de emergencia de Android. Consulta [Teléfono](#phone).",
  "**Gallery originals, deleted as chosen**: with **Delete the original from the gallery after importing** on, a photo picked from the phone's storage is now deleted from the gallery too, and when Android does not say which photo of the gallery it is, Erevos says so instead of keeping quiet. See [Collection](#collection).":
    "**Los originales de la galería se borran como elegiste**: con **Borrar el original de la galería tras importar** activado, una foto del almacenamiento del teléfono ahora también se borra de la galería, y cuando Android no dice qué foto de la galería es, Erevos lo dice en lugar de callar. Consulta [Colección](#collection).",
  "**The services stay in sight**: on home, the services button stays under the top bar while the list scrolls, so another part is a tap away; the search and **Ways** scroll with the list. **Names** shows only on the **SMS** part, where it belongs.":
    "**Los servicios siguen a la vista**: en el inicio, el botón de servicios se queda bajo la barra superior mientras la lista se desplaza, así otra parte está a un toque; la búsqueda y **Caminos** se desplazan con la lista. **Nombres** aparece solo en la parte **SMS**, donde corresponde.",
  "**New SMS on the SMS part**: on the **SMS** part of the chat list, the button at the bottom is **New SMS** and opens only a new SMS, also with Erevos's own chats on. See [SMS](#sms).":
    "**SMS nuevo en la parte SMS**: en la parte **SMS** de la lista de chats, el botón de abajo es **SMS nuevo** y abre solo un SMS nuevo, también con los chats propios de Erevos activados. Consulta [SMS](#sms).",
  "What's new": 'Novedades',
  'What each version changed': 'Qué cambió en cada versión',
  'What each version of Erevos changed, the newest first.': 'Qué cambió en cada versión de Erevos, primero la más reciente.',
  'Not out yet': 'Aún no ha salido',
  'This version': 'Esta versión',
  'For you': 'Para ti',
  'Under the hood': 'Bajo el capó',
  // Not out yet.
  // 7.0.0-rc.7
  // 7.0.0-rc.6
  // 7.0.0-rc.5
  // 7.0.0-rc.4
  // 7.0.0-rc.3
  // 7.0.0-rc.2
  // 7.0.0-rc.1
  // 6.0.0-rc.2
  // 6.0.0-rc.1
  // 4.0.0-rc.10
  // 4.0.0-rc.9
  // 4.0.0-rc.8
  // 4.0.0-rc.7
  // 4.0.0-rc.6
  // 4.0.0-rc.5
  // 4.0.0-rc.4
  // 4.0.0-rc.3
  // 4.0.0-rc.2
  // 4.0.0-rc.1
  // 3.4.2
  // 3.4.1
  // 3.4.0
  // 3.3.2
  // 3.3.1
  // 3.3.0
  // 3.2.1
  // 3.2.0
  // 3.1.2
  // 3.1.1
  // 3.1.0
  // 3.0.0
  // 2.0.3
  // 2.0.2
  // 2.0.1
  // 2.0.0
  // 0.1.16
  // 0.1.14
  // 0.1.12
  // 0.1.11
  // 0.1.10
  // 0.1.8
  // 0.1.7 to 0.1.2
  "**Photos and videos, as in a gallery**: in the Collection, **Camera** is Erevos's own, so no other app sees what it takes, **From the gallery** brings in many photos and videos at once, HEIC and AVIF photos show among the photos, **Edit** turns and cuts a photo into a new one, and **Information** says whether a photo or video says where it was taken. A photo that leaves Erevos goes without where and when it was taken, unless you choose otherwise. See [Collection](#collection).": "**Fotos y vídeos, como en una galería**: en la Colección, **Cámara** es la propia de Erevos, así que ninguna otra aplicación ve lo que toma, **De la galería** trae muchas fotos y vídeos a la vez, las fotos HEIC y AVIF aparecen entre las fotos, **Editar** gira y recorta una foto en una nueva, e **Información** dice si una foto o un vídeo dice dónde se tomó. Una foto que sale de Erevos sale sin dónde ni cuándo se tomó, salvo que elijas otra cosa. Mira [Colección](#collection).",
  "**Night photos and HDR**: Erevos's own camera now uses the night, HDR and portrait modes of the phone's maker where the phone has them, as on a Pixel, made on the phone itself. A tap focuses there, **Darker** and **Brighter** set the light, the zoom buttons go to the wide lens, 2× and 5×, and videos can be HDR. A photo is never written anywhere, not even for a moment. See [Collection](#collection).": "**Fotos nocturnas y HDR**: la cámara propia de Erevos usa ahora los modos noche, HDR y retrato del fabricante del teléfono donde el teléfono los tiene, como en un Pixel, hechos en el propio teléfono. Un toque enfoca ahí, **Más oscuro** y **Más claro** ajustan la luz, los botones de zoom van al gran angular, a 2× y 5×, y los vídeos pueden ser HDR. Una foto nunca se escribe en ningún sitio, ni por un momento. Consulta [Colección](#collection).",
  "**Messenger in its case tells you of new messages**: in Erevos+, when you use Messenger in its case, Erevos now tells you of its new messages as it does of other chats, even if you never opened the case. A chat with messages not read shows on home until it is read, and tapping it opens it in the case; while the case is open, Erevos tells of nothing, as the page shows it. See [Messenger](#messenger).":
    "**Messenger en su funda te avisa de los mensajes nuevos**: en Erevos+, cuando usas Messenger en su funda, Erevos ahora te avisa de sus mensajes nuevos como de los demás chats, aunque nunca hayas abierto la funda. Un chat con mensajes sin leer aparece en el inicio hasta que se lee, y al tocarlo se abre en la funda; mientras la funda está abierta, Erevos no avisa, porque la página ya lo muestra. Consulta [Messenger](#messenger).",
  "**Messenger in its case wears your whole look**: in Erevos+, Meta's own Messenger page in its case now takes your look: its colours, dark or light as Erevos is, the shape of your bubbles (round, square or a line), your text size, your style's letters, and what lies behind your screens (a wallpaper, Neon's grid, Paper's lines and the others), and it changes with your look even while it is open. A photo of your own stays in Erevos: there the page shows a soft gradient instead. Where Meta changes its page, parts of it may keep Meta's look. See [Messenger](#messenger).":
    "**Messenger en su funda lleva todo tu aspecto**: en Erevos+, la propia página de Messenger de Meta en su funda toma ahora tu aspecto: sus colores, oscura o clara como Erevos, la forma de tus burbujas (redondas, cuadradas o una línea), tu tamaño de texto, las letras de tu estilo y lo que hay detrás de tus pantallas (un fondo, la cuadrícula de Neon, las líneas de Paper y los demás), y cambia con tu aspecto incluso mientras está abierta. Una foto tuya se queda en Erevos: ahí la página muestra en su lugar un degradado suave. Donde Meta cambie su página, algunas partes pueden conservar el aspecto de Meta. Consulta [Messenger](#messenger).",
  "**Messenger in its case asks for the PIN once**: in Erevos+, what Meta's page keeps now stays in the case between openings, apart from every other page, so Meta knows your phone again and no longer asks for the PIN of your encrypted chats each time you open it. It goes when you sign out of Messenger, or when another account opens the case. See [Messenger](#messenger).":
    "**Messenger en su funda pide el PIN una sola vez**: en Erevos+, lo que guarda la página de Meta ahora se queda en la funda entre una apertura y otra, aparte de cualquier otra página, así que Meta reconoce tu teléfono y ya no pide el PIN de tus chats cifrados cada vez que la abres. Se borra cuando cierras la sesión de Messenger o cuando otra cuenta abre la funda. Consulta [Messenger](#messenger).",
  "**Your networks move with Erevos+**: moving from one Erevos+ to another on the same phone (as from Erevos+ 7.x to the new Erevos+), Telegram, Signal, Session, Messenger and Matrix now go on signed in, as they were. Telegram's photos and files download again as they are opened, and Messenger's page asks for its PIN once more. Moving from Erevos+ to Erevos or Erevos Lite says first that those accounts stay behind, and to write down Session's 13 recovery words. See [Updates](#updates).":
    "**Tus redes se mudan con Erevos+**: al mudarte de un Erevos+ a otro en el mismo teléfono (como de Erevos+ 7.x al nuevo Erevos+), Telegram, Signal, Session, Messenger y Matrix ahora siguen con la sesión iniciada, como estaban. Las fotos y archivos de Telegram se descargan de nuevo al abrirlos, y la página de Messenger pide su PIN una vez más. Mudarse de Erevos+ a Erevos o Erevos Lite avisa antes de que esas cuentas se quedan atrás, y de anotar las 13 palabras de recuperación de Session. Consulta [Actualizaciones](#updates).",
  "**Messenger's chats stay read**: in Erevos+, a Messenger chat you read no longer comes back unread after a while, and Mark all as read also covers the older chats Meta sends later. Only chats in Meta's inbox count as not read, as on Meta's own page: message requests and archived chats do not. With Messenger in its case, its card opens the case and home stays as you left it. See [Messenger](#messenger).":
    "**Los chats de Messenger siguen leídos**: en Erevos+, un chat de Messenger que leíste ya no vuelve a aparecer como no leído al rato, y Marcar todo como leído cubre también los chats más antiguos que Meta envía después. Solo cuentan como no leídos los chats de la bandeja de entrada de Meta, como en su propia página: las solicitudes de mensajes y los chats archivados no. Con Messenger en su funda, su tarjeta abre la funda y el inicio queda como lo dejaste. Consulta [Messenger](#messenger).",
  "**Chat options in reach**: in Erevos+'s Telegram, Signal, Messenger and Session chats too, a sliders button beside where you write opens the chat's options in one tidy list, as in Erevos's own. See [Telegram](#telegram).":
    "**Opciones del chat a mano**: también en los chats de Telegram, Signal, Messenger y Session de Erevos+, un botón de deslizadores junto a donde escribes abre las opciones del chat en una lista ordenada, como en los de Erevos. Ver [Telegram](#telegram).",
  "**Signal finds your contacts**: in Erevos+, **New chat** on Signal offers the phone's contacts that match as you type, and a typed number as **New number**. Signal is asked only about the one you tap. See [Signal](#signal).":
    "**Signal encuentra tus contactos**: en Erevos+, **Nuevo chat** de Signal ofrece mientras escribes los contactos del teléfono que coinciden, y un número escrito como **Número nuevo**. A Signal solo se le pregunta por el que tocas. Ver [Signal](#signal).",
  "**Release candidate 2**: Erevos+ with everything Erevos 3.0.0-rc.2 brought, and what is below.":
    "**Versión candidata 2**: Erevos+ con todo lo que trajo Erevos 3.0.0-rc.2, y lo que sigue.",
  "**Messenger's old chats no longer come back unread**: in Erevos+, after the phone restarted, Erevos+ showed old Messenger, Signal or Session chats as not read again, each with one message, although nothing new had come. Only a message that really comes now, or one that came while Erevos+ was closed, makes a chat unread. See [Messenger](#messenger).":
    "**Los chats antiguos de Messenger ya no vuelven como no leídos**: en Erevos+, tras reiniciar el teléfono, Erevos+ mostraba otra vez chats antiguos de Messenger, Signal o Session como no leídos, cada uno con un mensaje, aunque no había llegado nada nuevo. Solo un mensaje que llega de verdad ahora, o que llegó mientras Erevos+ estaba cerrado, deja un chat como no leído. Consulta [Messenger](#messenger).",
};
