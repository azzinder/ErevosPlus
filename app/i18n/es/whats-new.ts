// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of What's new, what each version changed (lib/whats-new.ts, app/whats-new.tsx) (i18n/es/index.ts).
export const whatsNew: Record<string, string> = {
  "**Telegram notices go once read**: in Erevos+, a Telegram chat read and left at once no longer leaves its notice of new messages behind, and a muted chat says nothing of what came meanwhile once it is unmuted. See [Telegram](#telegram).":
    "**Los avisos de Telegram se van al leer**: en Erevos+, un chat de Telegram que lees y dejas enseguida ya no deja atrás su aviso de mensajes nuevos, y un chat silenciado no dice nada de lo que llegó entretanto cuando deja de estarlo. Mira [Telegram](#telegram).",
  "**Release candidate**: Erevos+ as it is meant to come out, with everything Erevos 3.0.0-rc.1 brought.":
    "**Versión candidata**: Erevos+ tal como debe salir, con todo lo que trajo Erevos 3.0.0-rc.1.",
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
};
