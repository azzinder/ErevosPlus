// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/** The user guide in Spanish. Its format: lib/guide.ts. The same sections, in the same order and shape, as the English one. */
export const guide = `
## Qué es Erevos {#about}

Erevos es una app de mensajería hecha para la privacidad. No necesitas cuenta, número de teléfono ni email para usarla,
y está pensada para seguir funcionando estés donde estés: a través de un teléfono cercano sin ninguna red, por Wi-Fi o
por internet.

- **Cerca, sin internet:** dos teléfonos Android hablan directamente por Bluetooth, Wi-Fi Aware o Wi-Fi Direct, con
  cifrado de extremo a extremo, y lo mismo hacen teléfonos y ordenadores en la misma Wi-Fi o en el punto de acceso de un
  teléfono. Con una radio LoRa, los textos llegan a kilómetros.
- **A través de un relay:** por Wi-Fi o por internet, a través de un pequeño servidor (un relay) que puedes tener tú
  mismo.
- **Espacios:** un bloqueo con contraseña, una segunda contraseña que abre un Erevos aparte y vacío, y chats ocultos en
  cada espacio.
- **Apariencia:** los acabados de LPHL: Classic, Modernist y Nocturne, doce paletas, y cristal como en lphl.nekten.eu.

{-**Erevos+** es la misma app con más: chats con gente en Telegram, Messenger, Signal, Session, Matrix, XMPP y
Nostr, en Android 8.0 o posterior. Pasa a ella, o vuelve, en **Actualizaciones**: ver [Erevos, Erevos+ o Erevos Lite, y betas](#update-channel).}

> Los mensajes están **cifrados de extremo a extremo**, tanto a través de un relay como cerca, pero nada ha sido auditado
> todavía por expertos independientes. [Qué está protegido hoy](#privacy) dice exactamente qué lo está y qué no.

Esta guía se abre desde **Guía de uso** en el menú de la pantalla de inicio (los tres puntos de arriba). La búsqueda de su
parte superior encuentra cualquier palabra que haya en ella. La guía está en todos los idiomas de la app, y se muestra en el que
elegiste, ver [Idioma](#start).

### Quién lo hace, y por qué

- **Quién:** Erevos, by azzinder: la misma persona que hizo [Fasouli](https://github.com/azzinder/lphl-chrima-releases/releases/latest), una app privada para tus finanzas.
- **Dónde:** no importa. Lo que importa es que el relay y la app para el navegador funcionan en el servidor propio de
  quien lo hace (lphl.nekten.eu).
- **Para quién:** para cualquiera que quiera hablar con los suyos sin dar un número de teléfono, un email ni una
  cuenta: amigos, familias, grupos, y quienes viven donde internet se corta o se vigila. Y para quienes, sin nada que
  ocultar, quieren mantener su espacio personal en privado, lejos de miradas indiscretas.
- **Por qué:** porque las apps conocidas piden un número de teléfono, saben quién habla con quién y dejan de funcionar
  cuando cae internet. Porque las «condiciones de uso» de algunas no nos amparan, y tenemos dudas sobre cómo protegen
  nuestra privacidad. Porque a otras les faltan funciones que necesitamos. Erevos no pide nada y encuentra un camino a
  través de lo que haya: internet, Wi-Fi, Bluetooth, un teléfono cercano.
- **Quién paga:** nadie: sin anuncios, sin inversores, sin recogida de datos. Quien quiera puede ayudar con los gastos
  de funcionamiento, como el servidor: **Ajustes** → **General** → **Apoyar Erevos** tiene las formas, Liberapay,
  PayPal, Monero y Bitcoin. Dar o no dar no cambia nada en la app.
  **Por qué:** cada forma se abre fuera de Erevos, en el navegador o en un monedero, solo cuando la tocas, así que Erevos
  en sí no envía nada y nunca sabe quién dio. PayPal sabe quién da; Monero no muestra ni quién dio ni cuánto; Bitcoin no
  muestra nombres, pero lo que recibió la dirección es público.
- **Contacto:** **Ajustes** → **General** → **Contacto** añade a quien hace Erevos como contacto, y le escribes en el
  propio Erevos, con cifrado de extremo a extremo, sin número de teléfono ni email.

### Hecho con el código abierto de otros

Erevos en sí es software libre, con la licencia AGPL-3.0-or-later, ver [Licencia](#licence), y está construido sobre el
trabajo de código abierto de otros. Estas son las partes principales, cada una con sus autores y su licencia:

- **Element Call** (Element; AGPL-3.0): las llamadas de Matrix.
- **Arti, lyrebird, Snowflake y WebTunnel** (The Tor Project; Arti MIT o Apache-2.0, lyrebird BSD-2-Clause, Snowflake
  BSD-3-Clause, WebTunnel MIT): Tor dentro de la app, y los puentes de Tor en Android.
- **vodozemac** (Matrix.org Foundation; Apache-2.0): el cifrado de Matrix.
- **OpenMLS** (OpenMLS Authors; MIT): los grupos cifrados.
- **Las bibliotecas de RustCrypto y dalek-cryptography** (sus desarrolladores; MIT o Apache-2.0 en RustCrypto,
  BSD-3-Clause en dalek-cryptography): el cifrado en sí.
- **React Native, Expo y react-native-webrtc** (Meta, 650 Industries y la comunidad de React Native WebRTC; MIT): la app
  y sus llamadas.
- **Electron** (Electron contributors; MIT): la app para ordenador.
- **Las fuentes Inter** (Rasmus Andersson y los Inter Project Authors; SIL Open Font License 1.1): las tipografías de la
  app.

La lista completa, cada paquete con su licencia, está en el archivo \`CREDITS.md\` que viene con el código fuente de
{=Erevos}.

**Por qué:** porque sus autores dieron su trabajo libremente y pidieron que se les nombrara, y porque debes poder ver de
qué está hecho Erevos.

Esta parte también se abre desde **Ajustes** → **General** → **Acerca de Erevos**.

## Primeros pasos {#start}

Erevos se descarga de su página de versiones, un archivo para cada sistema: ver [Actualizaciones](#updates) para saber
dónde, y cómo actualizarlo. Funciona en Android, en un ordenador (Linux, macOS y Windows), en Sailfish OS y, desde el
navegador, en un iPhone. Si eres nuevo, empieza con una invitación de alguien que lo use: un código QR o un enlace, y ya
estás dentro, con esa persona como contacto (ver Invitar a alguien nuevo, en [Chatear a través de un relay](#relay)).

La pantalla de inicio es la lista de tus chats, con el que se movió por última vez arriba. Cada uno muestra la imagen del
contacto, el último mensaje con sus marcas, cuándo llegó y cuántos de sus mensajes no has leído. Un reloj al lado
significa que sus mensajes desaparecen. **Buscar chats** encuentra un chat por su nombre o por su último mensaje y, bajo
los chats, los mensajes que contienen lo que escribes, en todos los chats del espacio: toca uno para abrir su chat en ese
punto. En un chat, sus detalles tienen **Buscar en este chat**: ▲ y ▼ van a lo que encontró antes y después. Ambas
buscan solo en este teléfono: en lo que guarda sellado{~, y **Buscar en este chat** también en los SMS que muestra el chat
de un contacto}; los chats ocultos solo se buscan desde dentro. Un chat largo se abre en sus últimos 100 mensajes, y los
anteriores, entre ellos los importados de Telegram o WhatsApp, llegan solos al desplazarte hacia arriba (**Mostrar
mensajes anteriores**, encima de ellos, también los trae); ir a uno anterior (desde la búsqueda, un mensaje destacado o
el mensaje al que responde otro) también lo trae.
Cada chat se abre en su último mensaje, con la barra de mensajes debajo: los chats con contactos{~, los grupos y las
conversaciones SMS|
y los grupos}{+, y también los chats de Matrix, XMPP y Nostr}. Al desplazarte un poco hacia arriba, aparecen flechas
redondas abajo a la derecha, en todos ellos: la de arriba va al principio del chat, la de abajo vuelve a su final. Entre
ellas, si al abrir el chat había mensajes nuevos, una doble marca va al primero de ellos, donde lo dejaste, mientras ese
mensaje no se vea. Desde el principio, **Mostrar mensajes posteriores**, bajo lo que se ve, trae más; escribir un mensaje,
o la flecha de abajo, vuelve al final.

**Por qué:** un chat largo se abre en sus últimos mensajes para que se abra al instante: dibujarlo entero de una vez
sería lento, sobre todo en teléfonos antiguos. Los chats ocultos quedan fuera de la búsqueda de la pantalla de inicio
para que se vea igual tanto si un espacio tiene alguno como si no: sus mensajes solo se pueden leer mientras su PIN los
tiene abiertos.

**Fijados y archivados:** mantén pulsado cualquier chat en la pantalla de inicio, de un contacto o de un grupo{~, de
|}{+Matrix, XMPP, Nostr o SMS}{-{~una conversación SMS}}, para **Fijar arriba**, **Archivar** y, en Android, **Silenciar este chat**. Como mucho 10
chats quedan fijados. Un chat archivado sale de la lista hasta que llega un mensaje nuevo de él; toca **Archivadas**
arriba para ver lo que archivaste,{~ SMS también,} y tócalo otra vez para volver. Los chats ocultos tienen sus propios
chats fijados y archivados.

- **La imagen** se dibuja a partir de la clave del contacto: la misma clave da siempre los mismos colores y la misma luna{+
  (en verdes con Matrix)}, así que reconoces un chat de un vistazo sin ninguna foto. No es una comprobación de la clave;
  el [número de seguridad](#relay) sí lo es.
- **La línea bajo la búsqueda** dice si hay un relay configurado y si tu cola está lista. Tócala para configurar uno.
- **La búsqueda y esa línea se quedan** bajo la barra superior{~, con el botón de servicios,|} mientras la lista se desplaza.
- **Chat conmigo**, siempre el primero de los chats, con una chincheta, guarda tus notas para ti: ver Chat conmigo y
  recordatorios más abajo.
- [+] **Los chats de Matrix**, una vez que inicias sesión en Matrix, están en la lista con los demás, los más recientes
  primero, cada uno marcado **Matrix**, y una invitación sale arriba. El chip **Matrix** muestra solo ellos, y allí
  **Chat nuevo** empieza un chat de Matrix: ver [Matrix](#matrix).
- [+] **Los chats de XMPP**, una vez que inicias sesión en XMPP, están en la lista de la misma manera, cada uno marcado
  **XMPP**, y quien pide añadirte o te invita a un grupo sale arriba. El chip **XMPP** muestra solo ellos, y allí **Chat
  nuevo** empieza un chat de XMPP: ver [XMPP](#xmpp).
- [+] **Los chats de Nostr**, cuando el espacio tiene una clave de Nostr, están en la lista de la misma manera, cada uno
  marcado **Nostr**. El botón **Nostr** muestra solo ellos, con cuántos mensajes no se han leído, y allí **Chat nuevo**
  abre la pantalla de chats de Nostr: ver [Chats con otras apps de Nostr](#nostr-chats).
- **Marcar todo como leído**, en el menú ⋮, lee de una vez todos los chats de la parte de la lista en la que estás
  (todos los mensajes{~, SMS| o}{-{~ o|} Erevos}{+, Erevos, Matrix, XMPP o Nostr}), también los silenciados y los bloqueados con PIN, después de
  preguntar. Cada uno se lee como si lo abrieras, así que quienes escribieron lo saben como entonces; las invitaciones y
  las personas que piden añadirte quedan hasta que les respondas.{+ Las pantallas de Matrix, XMPP y Nostr lo tienen en
  **Chats** para sus propios chats.} Los chats ocultos no los lee nunca.
- [+] **El feed público**, cuando el espacio tiene una clave de Nostr o está en una sala pública de Matrix, es un botón más,
  **Público**: un solo feed, como en Amethyst, con las publicaciones públicas de las personas que sigue tu clave de
  Nostr y los mensajes de las salas públicas de Matrix en las que estás, las más recientes primero. Cada una muestra
  quién la escribió (una pequeña N o M dice la red), cuándo, sus palabras, sus fotos dentro de la publicación y una
  tarjeta para su enlace. Con ambas activadas, **Todo**, **Nostr** y **Matrix**, sobre el feed, eligen qué se ve, y
  **Fotos** elige cómo se traen las fotos y las tarjetas. Bajo una publicación: responder, compartir de nuevo, dar Me
  gusta y compartir; bajo un mensaje de Matrix: responder, reaccionar y compartir. **Nueva publicación**, el lápiz de
  abajo, escribe una publicación pública, con hasta cuatro fotos. Ver [Chats con otras apps de Nostr](#nostr-chats).
- **Chat nuevo**, abajo, pregunta dónde está la otra persona, **A mi lado**, **Lejos** o **Tengo su código**, y la
  añade; las filas de debajo abren tu propio enlace, los contactos bloqueados y los ajustes del relay. **Recordarme**,
  la campana naranja de al lado, te escribe un recordatorio.
- **{~El auricular verde y la persona violeta|La persona violeta}** de arriba, en Android, {~abren **Teléfono** y **Contactos** directamente, en
  los colores de sus iconos|abre **Contactos** directamente, en el color de su icono} en la pantalla de inicio del teléfono. {~No están|No está} además en el menú de los tres puntos.
- [~] **El botón de servicios**, bajo la barra superior, donde se queda mientras la lista se desplaza, cuando hay dos partes con mensajes activadas en Módulos, dice qué parte
  de la lista se ve (**Todos los servicios**, o la elegida), con los signos de los servicios, los mensajes sin leer de
  todos y, en rojo, un servicio que ahora no está conectado. Tócalo para la ventana **Servicios**: una tarjeta por
  cada parte activada, también sin chats todavía, cada una con sus mensajes sin leer (99+ por encima de 99) y un
  punto, verde mientras su red está conectada, rojo con **Sin conexión** cuando no. Una tarjeta muestra solo esa
  parte: **Todos** todos los chats, **SMS** solo los SMS (con los chats cuyo último mensaje fue un SMS; ahí se dice si
  Erevos aún no es la app de SMS), **Erevos** solo los chats de Erevos, los de cada contacto, llegara lo que llegara
  al final{+, y **Matrix**, **XMPP**, **Público** y **Nostr** los suyos}. **Añadir** abre Módulos, para activar más, y
  **Marcar todo como leído** lee la parte que se ve. Mantén pulsada una tarjeta para moverla antes o después u
  ocultarla con **Ocultar**: un servicio oculto sigue activado, pero no avisa ni cuenta en el número del icono
  (Telegram, cuyas carpetas pueden verse en el inicio, sí), y sus chats salen también de
  **Todos** (la búsqueda aún los encuentra), y espera al pie de la ventana, donde un toque lo muestra de nuevo. Cualquier tarjeta que mantengas pulsada, también
  **Todos**, puede ser **Abre primero**: Erevos se abre en ella desde su icono, y en **Todos** mientras no elijas ninguna. Los
  chats y grupos en **Silenciado** no cuentan, como en el número del icono de Erevos, y lo que se escribe en la
  búsqueda no cambia los números. Bajo el botón, sin búsqueda, primero van los chats con mensajes sin leer, en **No
  leídos**, con **Marcar todo como leído** al lado, y luego los demás en **Recientes**.
- **El widget**, en Android: añade Erevos desde los widgets de tu pantalla de inicio. {~Sus cuatro botones abren
  **Teléfono**, los **SMS**, los **Mensajes** de Erevos y **Contactos**, tras la contraseña como cualquier enlace (el
  Teléfono sin ella, si lo permites). Sobre los tres primeros muestra cuántas llamadas perdidas, SMS sin leer y mensajes
  nuevos hay, nunca de quién ni qué; con llamadas perdidas, **Teléfono** se abre en **Recientes**.|Sus dos botones abren los
  **Mensajes** de Erevos y **Contactos**, tras la contraseña como cualquier enlace. Sobre **Mensajes** muestra cuántos
  mensajes nuevos hay, nunca de quién ni qué.} Un botón tocado otra
  vez vuelve a mostrar su pantalla, también después de haber elegido otra pestaña ahí. Sus palabras siguen el idioma de
  Erevos. **Ajustes** → **Apariencia** → **Widget** fija el orden de sus botones.
- **El candado naranja** de arriba bloquea Erevos al instante cuando hay una contraseña puesta, o abre los ajustes del
  bloqueo cuando no.
- **Los tres puntos** abren lo demás:

| En el menú | Qué abre |
| --- | --- |
| **Grupo nuevo** | Un chat de grupo con tus contactos. Ver [Chats de grupo](#groups). |
| **Grupos públicos** | Un grupo al que cualquiera con su enlace puede pedir unirse, con un propietario y admins. Ver [Grupos públicos](#public-groups). |
| **Mensajes destacados** | Los mensajes que destacaste, en todos tus chats. Ver El menú de un mensaje, en Chatear a través de un relay. |
| **Teléfonos cercanos** | Tus contactos por Bluetooth y Wi-Fi Aware, o en la misma Wi-Fi, sin internet. Ver [Chatear con un teléfono cercano](#nearby). |
| **Guía de uso** | Esta guía. |
| **Ajustes** | La última fila, con un engranaje: todo lo que puedes ajustar, en grupos, con una búsqueda. Ver Ajustes más abajo. |

Dentro de un chat, su nombre y su imagen están arriba con cómo viaja: **Cifrado** (de extremo a extremo), **En línea**,
**Cerca** mientras su teléfono está conectado al tuyo por radio, o **escribiendo…**, con un cronómetro cuando los
mensajes del chat desaparecen. A su lado, el recuadro azul con una cámara inicia una videollamada y el verde con un
auricular, una llamada de voz. Toca el nombre, o **⋯** tras ellos (**⋮** en Android), para los **Detalles** del chat: su
imagen (tócala para cambiarla), **Llamar**, **Vídeo**, **Cambiar nombre** e **Imagen**, luego **Mensajes temporales**, **Bloquear capturas de pantalla**,
**Aparecer sin conexión**, **Apariencia del chat**, el **Número de seguridad**, **Mover a chats ocultos**, **Mover a otro espacio** y **Eliminar
mensajes**. **Hecho** los cierra.

**Multimedia, enlaces y archivos**, en los detalles bajo **Buscar en este chat**, lista lo que contiene el chat, cada tipo
en su propia pestaña con cuántos hay: **Fotos** (en cuadrícula), **Vídeos**, **Mensajes de voz**, **Música**, **Archivos**
y **Enlaces**, los más nuevos primero bajo sus meses, también los importados de Telegram o WhatsApp. Un toque abre una
foto o un archivo para verlo o guardarlo, reproduce un sonido ahí mismo, o abre un enlace después de preguntar;
manteniéndolo pulsado, cada uno ofrece **Ver en el chat**, que va a su mensaje. Uno que aún no se ha recogido del relay
lleva al chat, donde un toque lo recoge. El calendario de arriba va a un día: están marcados los días que tienen algo de
ese tipo. **Ir a un día**, debajo en los detalles, hace lo mismo con el propio chat: va al primer mensaje de ese día.

**Por qué:** las listas se hacen en este teléfono a partir de lo que ya guarda, así que ningún servidor sabe qué
contiene un chat; y solo se leen las fotos que están en pantalla, como en el chat, así que un chat con miles de ellas se
abre tan rápido como uno sin ninguna.

[~] **También en {+Matrix, XMPP, Nostr y }SMS:** {+un chat de Matrix, XMPP o Nostr tiene abajo **Buscar en este chat**,
**Multimedia, enlaces y archivos**, **Ir a un día** y **Exportar chat**, junto a **Notificaciones**, y }una
conversación SMS {+los tiene primero en su **⋮**}{-tiene **Buscar en este chat**, **Multimedia, enlaces y archivos**, **Ir a un día** y **Exportar chat** al principio de su **⋮**}. Solo miran lo que este teléfono guarda del chat: {+los mensajes que
guarda un chat de Matrix (bajo la búsqueda, **Cargar mensajes anteriores** trae otros más antiguos de su servidor,
como hace el principio del chat), los de un chat de XMPP o Nostr, y }cada SMS y MMS de la conversación en el teléfono;
ir a un SMS más antiguo carga la conversación hasta él. Nada de lo que escribes en la búsqueda sale del teléfono. Las
fotos y los archivos aparecen en la lista, y un toque lleva a cada uno en el chat, donde un toque lo trae de su
servidor como antes, así ningún servidor sabe cuáles miraste; las imágenes de un MMS se ven en la propia lista.
**Exportar chat** escribe el chat como para un contacto, tras la misma pregunta; los chats de un lugar oculto no se
exportan.

Una buena primera hora:

1. Abre **Ajustes** → **Privacidad y seguridad** → **Bloqueo y segunda contraseña** y pon una contraseña, para que nadie
   que coja el teléfono pueda abrir Erevos.
2. Abre **Teléfonos cercanos** desde el menú en dos teléfonos que estén cerca el uno del otro, y permite lo que pida
   Android.
3. Añadíos mutuamente con **Chat nuevo** → **A mi lado**, en los dos teléfonos, como en [Chatear con un teléfono
   cercano](#nearby), y envía un mensaje: va de cerca, cifrado de extremo a extremo, sin relay y sin internet.
4. Para hablar desde más lejos, configura un relay como en [Chatear a través de un relay](#relay).

### Chat conmigo y recordatorios

**Chat conmigo** está siempre arriba de los chats, con una chincheta, en cada espacio. Es un chat sin nadie más: escríbete
notas, enlaces, fotos, archivos y mensajes de voz, como en cualquier chat. No va a nadie más: se queda cifrado en el
espacio, y va solo a tus propios dispositivos vinculados, cifrado de extremo a extremo, para que cada uno tenga las
mismas notas y los mismos recordatorios (ver [Dispositivos vinculados](#devices)). Una copia de seguridad lo incluye
todo, notas, fotos, archivos y mensajes de voz, como con los chats.

- **Un recordatorio:** toca **Recordarme** (la campana naranja junto a **Chat nuevo**), escribe lo que quieres que te
  recuerde, elige una hora (**En 1 hora**, **Esta noche 20:00**, **Mañana 09:00**, o cualquier día, hora y minuto) y
  toca **Recordarme**. Va a Chat conmigo, con una campana y su hora. En el chat, **+** → **Recordarme**, o mantener
  pulsada la flecha de enviar, también da una hora a la nota que escribes.
- **A su hora**, en Android, el teléfono muestra un aviso, **Reminder** (o **3 reminders**) – «Open Chat with myself
  to read it», nunca lo que dice, también con Erevos cerrado y bloqueado; al tocarlo, abre Chat conmigo, tras la
  contraseña. Hasta que abras el chat, el recordatorio aparece en su fila arriba de los chats, con un contador, y en el
  chat con un borde de color; visto ahí, también se va del aviso. En un ordenador, en la app web, o con los avisos
  desactivados, es ahí donde lo ves. Si **Horas exactas** no está permitido (**Ajustes** → **General** →
  **Permisos**), Android puede mostrarlo unos minutos tarde.
- **Mantener pulsada una nota** ofrece **Copiar**, **Abrir** (una foto o un archivo), **Recordarme**, o **Cambiar el
  recordatorio** y **Sin recordatorio**, **Mover a una carpeta** y **Eliminar**.
- **Carpetas:** el botón de carpeta de arriba, junto a **Apariencia del chat**, crea una. Entonces aparecen pestañas
  sobre las notas: **Todas**, y una por cada carpeta, que muestra solo lo que hay en ella; lo que escribes, envías o
  grabas mientras hay una carpeta elegida entra en ella. Una nota está como mucho en una carpeta: **Mover a una
  carpeta** la pone en otra, en una nueva o en **Sin carpeta**. Mantener pulsada la pestaña de una carpeta, o tocarla
  otra vez, ofrece **Renombrar la carpeta** y **Borrar la carpeta**; sus notas se quedan, sin carpeta. Una nota va a
  tus dispositivos vinculados con su carpeta, y una carpeta renombrada o borrada en uno lo está también en los demás;
  una vacía se queda en el dispositivo donde se creó.
- Cada espacio tiene su propio Chat conmigo, y también cada lugar de chats ocultos, arriba de su lista (ver [Chats
  ocultos](#hidden)). Los recordatorios de un lugar oculto aparecen ahí en cuanto su PIN lo abre; el teléfono los
  avisa a su hora solo mientras **Recibir estando cerrados** está activado para ese lugar, con el mismo aviso. Un PIN
  nuevo para el lugar, que lo empieza vacío, o quitar el lugar, quita sus recordatorios del teléfono. Las notas de un
  lugar oculto van solo a los dispositivos vinculados a ese lugar por su cuenta, nunca a los del espacio (ver
  [Dispositivos vinculados](#devices)).
- **Desde otra app:** una app del teléfono puede pedir guardar aquí una nota, como Fasouli para un pago que se acerca,
  con su recordatorio. Erevos abre el Chat conmigo tras la contraseña, en el espacio que abres, y pregunta primero
  **¿Guardar esta nota?**, con el texto y la hora; solo **Añadir** la guarda. Nada vuelve a la app. Para un pago programado el recordatorio vuelve, cada mes o según se repita el pago: en cuanto lo ves, pasa a su próxima vez.

**Por qué:** un aviso se muestra en la pantalla bloqueada a quien tenga el teléfono, así que lo que dice un recordatorio
se queda cifrado en su espacio y a Android solo se le dice su hora: el aviso no puede contar a nadie qué querías
recordar, ni en qué espacio está. Y las notas no van a nadie más que a tus propios dispositivos, cifradas de extremo a
extremo entre ellos como tus chats: el relay solo las lleva cifradas.

- [~] **Desde otros chats:** un mensaje de {+un chat de Matrix, XMPP, Nostr o }{-una conversación }SMS también puede venir aquí, con un
  recordatorio: **Recordarme** en su menú.

### Moverse deslizando

- **Atrás:** desliza hacia la derecha en cualquier punto de una pantalla para volver, como hace la flecha de volver.
  Sale una flecha redonda a la izquierda; suelta cuando esté completa, o haz un gesto rápido, y habrás vuelto. Si
  sueltas antes, te quedas. En un chat hace lo que hace su flecha de volver: vuelve a la lista de chats, o sale de los
  chats ocultos, cerrándolos. En los **Detalles** de un chat, los cierra.
- **Pestañas:** desliza hacia la izquierda o la derecha para ir a la pestaña de al lado, como al tocar su chip:{~
  **Todos**, **SMS**}{+,}{-{~ y}}{~ **Erevos**}{+, **Matrix**, **XMPP** y **Nostr**}{~ en la pantalla de inicio (los activados en
  Módulos), **Teclado**, **Recientes** y **Favoritos** en **Teléfono**,} los filtros en **Contactos**, y los grupos de
  stickers.{~ En la pantalla de inicio las partes se eligen en la ventana **Servicios**, con el botón bajo la barra superior.}
- En una pantalla con pestañas, deslizar solo cambia de pestaña, también sobre las filas de su lista, y más allá de la
  primera o la última pestaña no hace nada: vuelve ahí con la flecha de volver.{~ Una conversación SMS se archiva o se
  elimina manteniéndola pulsada.}

### Ajustes

**Ajustes**, la última fila del menú (los tres puntos), contiene todo lo que puedes ajustar en Erevos, en grupos, como
hacen los ajustes del propio teléfono. En los idiomas que no son el inglés lleva su nombre en ese idioma y en inglés,
como **Ajustes · Settings**, para encontrarlo en un idioma que no sabes leer.

- **Buscar en los ajustes,** arriba, encuentra un ajuste por el principio de sus palabras, con o sin tildes, y muestra
  dónde está, como {~**Teléfono y SMS › SMS**|**Privacidad y seguridad › Chats ocultos**}. Tócalo para abrirlo.
- **Idioma · Language,** la fila bajo la búsqueda, abre la lista de idiomas, ver Idioma más abajo.
- **Un grupo** abre la lista de sus ajustes, y un ajuste abre su pantalla. Un ajuste con partes, como {~**SMS**|**Copias de seguridad**}, las
  lista, y cada parte se abre por separado.
- **Solo aparece lo que funciona aquí:** en un ordenador, en Sailfish OS y en la app web no hay {~**Teléfono y SMS**, |}Tor,
  Nostr ni LoRa, y un grupo sin nada que ajustar aquí no aparece.
- [~] **Solo los módulos activados:** los ajustes de un módulo desactivado, como {+**Matrix** o }**Teléfono y SMS**,
  tampoco aparecen: ver [Módulos](#modules).

| Grupo | Qué contiene |
| --- | --- |
| **General** | **Idioma**, {~**Módulos**, |}**Actualizaciones**, **Dar Erevos a un teléfono cercano** (Android), **Novedades**, **Acerca de Erevos**, **Apoyar Erevos** y **Permisos** (Android y la app web). Ver Idioma más abajo, {~[Módulos](#modules), |}[Actualizaciones](#updates) y [Erevos a un teléfono cercano](#give-app). |
| **Apariencia** | **Estilo y colores** (acabado, cristal, estilo, tema, colores y texto sobre zonas de color, con la vista previa), **Fondo de pantalla**, **Mensajes** (la forma de las burbujas), **Iconos del lanzador** (Android), **Widget** (Android) y **Vibrar al tocar** (Android). Ver [Apariencia](#appearance). |
| **Notificaciones** | **En segundo plano** (Android y la app de ordenador): recibir y sonar mientras Erevos está cerrado, y el aviso de mensajes; en un ordenador, si Erevos sigue funcionando con la ventana cerrada. **Notificaciones con la app cerrada** (la app web): Web Push. **Número en el icono**: cuántos mensajes no has leído, en el icono de Erevos. Ver [En un iPhone](#iphone) y [En un ordenador](#desktop). |
| **Privacidad y seguridad** | **Bloqueo y segunda contraseña** (bloquear al abrir Erevos, la contraseña, la privacidad de la pantalla, huella o cara, la segunda contraseña), **Chats ocultos** (los PIN de los 4 lugares), **Botón de pánico** (con la contraseña de pánico), **Calculadora en lugar de Erevos** (Android, en Apariencia), **Capturas de pantalla** (Android) y **Esta app web** (solo la app web). Ver [Bloqueo con contraseña](#lock), [Segunda contraseña](#second), [Chats ocultos](#hidden) y [Botón de pánico](#panic). Ver también [Borrarme de todas partes](#forget). |
| **Relay y redes** | **Caminos**, **Relay** (abre **Chat nuevo** con **Para usuarios avanzados** abierto), **Relay de casa**, **Tor** (Android), **Nostr** (Android){+,}{- y} **Radio LoRa** (Android){+, **Matrix**, **XMPP** y **Chats de Nostr**}. Ver [Chatear a través de un relay](#relay), [Relay de casa](#home-relay), [A través de Tor](#tor), [A través de Nostr](#nostr){+,}{- y} [Con una radio LoRa](#lora){+, [Matrix](#matrix), [XMPP](#xmpp) y [Chats con otras apps de Nostr](#nostr-chats)}. |
[~] | **Teléfono y SMS** (Android) | **Teléfono**, los ajustes de la app de teléfono, los mismos que **Teléfono** → **Ajustes**. **SMS**, en partes: **Erevos como app de SMS**, **Descubrir Erevos en un número**, **SMS cuando nada más funciona**, **Nombres de tus contactos**, **Archivadas, spam y papelera**, **Filtro de spam**, **Números bloqueados**, **Deshacer el envío de un SMS**, **Dos SIM** (solo con dos SIM) y **SMS nuevo**. Ver [Teléfono](#phone) y [SMS](#sms). |
| **Datos y dispositivos** | **Copias de seguridad**, **Piezas de copias**, **Dispositivos vinculados** y **Chats importados**. Ver [Copias de seguridad](#backup), [Piezas de copias con amigos](#backup-pieces), [Dispositivos vinculados](#devices) y [Chats importados](#import). |
| **Para pruebas** | **Prueba del relay** y **Prueba de radio** (Android). Ver [Las pantallas de prueba](#tests). |

### Idioma

Erevos está en inglés, griego, alemán, francés, español, italiano, portugués y serbocroata. La primera vez que se
inicia, sigue el idioma del teléfono si es uno de estos (un teléfono en serbio, croata, bosnio o montenegrino empieza en
serbocroata), y si no, está en inglés. Para cambiarlo, abre el menú (los tres puntos), toca **Ajustes**, su última fila,
y luego la primera fila de ahí, **Idioma · Language**. En los idiomas que no son el inglés, los dos llevan su nombre en
ese idioma y en inglés, como **Ajustes · Settings** e **Idioma · Language**. Luego toca el idioma, cada uno con su
propio nombre: **Ελληνικά**, **English**, **Deutsch**, **Español**, **Français**, **Italiano**, **Português** o
**Srpskohrvatski**. Toda la app cambia al instante.

- **Esta guía** también está en cada uno de estos idiomas, y nombra los botones como los muestra la app en el tuyo. En
  los idiomas que no son el inglés ni el griego, una palabra nueva en la app puede aparecer en inglés durante un
  tiempo, hasta que se traduzca.
- **Guardado en el teléfono:** la elección se guarda en este teléfono, fuera de todos los espacios, así que la pantalla
  de la contraseña también se muestra en ese idioma, y todos los espacios se abren en él. No está sellada: quien tenga
  el teléfono puede ver qué idioma elegiste.
- **Los avisos de Android** (una llamada entrante, mensajes nuevos, Erevos recibiendo en segundo plano) están en griego
  cuando Erevos lo está, y en inglés en cualquier otro idioma.

## Módulos {#modules}

Erevos se compone de partes, sus módulos: **Erevos** mismo (sus propios chats, grupos y llamadas, cifrados de extremo a
extremo, con los chats ocultos), el **Teléfono**{- y}{+,} los **SMS**{+ y los chats con apps de **Nostr**, **Matrix** y **XMPP**, y **Telegram**, **Messenger**, **Signal** y **Session**}.
La **Colección** (tus fotos y archivos, cifrados) también es un módulo. El Teléfono y los SMS solo existen en Android, la Colección en Android, en la aplicación de escritorio, en la app web y en Sailfish OS. Cualquiera puede estar activado, también Erevos mismo, uno o varios, al
menos uno: **Ajustes** → **General** → **Módulos** activa o desactiva cada uno en cualquier momento.

La primera vez que se inicia, Erevos se configura como lo hace un instalador. Antes de que se abra su primer espacio: lo
que no entregas (ni número de teléfono, ni correo, ni nombre de usuario, ni cuenta: añades gente con un código QR o un
enlace, o te invitan ellos), un nombre para tus contactos si quieres uno, y el idioma; luego qué módulos usar, cada uno
con lo que hace. Después, en el espacio: una pantalla para cada módulo elegido, con cómo empezar con él (para Erevos,
cómo entras; para el Teléfono y los SMS, Erevos como app de teléfono y como app de SMS{+; para Nostr, Matrix y XMPP, tu
cuenta allí}) y lo que Android, o el navegador, debe permitir para él. Cada permiso está en la primera pantalla que lo
necesita, y **Permitir todo, una por una** hace las preguntas que hace Android en el propio Erevos, una tras otra. Luego
el bloqueo con contraseña y las copias automáticas, y después lo que está listo y lo que falta, con **Invitar a
alguien**. **El resto, luego** deja el resto para Ajustes; hasta que termines o lo pospongas, los pasos vuelven a salir
cuando se inicia Erevos. Si Erevos se abrió con una invitación, la muestra cuando terminan los pasos. Tras una
actualización todos los módulos siguen activados, como antes, hasta que los cambies.

- **El nombre:** no es un nombre de usuario: nadie lo busca, y no tiene que ser único. Va, cifrado, solo a quienes
  añades, y **Mi nombre**, en Ajustes → Privacidad y seguridad, lo cambia.
- **Pasar desde otro teléfono:** en Android, **Ya tengo {=Erevos} en otro teléfono** se salta el nombre y los módulos, que
  vienen con la copia de seguridad. Se abre el espacio, **Abrir copias de seguridad** la restaura (mira [Pasar a un
  teléfono nuevo](#new-phone)), y siguen las pantallas de los módulos que trae, luego la huella y la carpeta de las
  copias automáticas, que se quedan con cada teléfono. **Aún no tengo copia** dice cómo hacer una.
- **En un ordenador o en un navegador:** **Vincular a mi teléfono** se salta los pasos y abre **Dispositivos
  vinculados**.

- **Desactivado:** un módulo desactivado no se inicia: nada de él funciona, espera en un servidor ni suena, así que
  Erevos es más ligero, abre más rápido y gasta menos batería. No aparece en ningún sitio: ni en la pantalla de inicio,
  ni en su menú, ni en los ajustes, y los iconos del Teléfono y de los SMS salen de las apps del teléfono. Un enlace,
  un aviso o el widget que aún lleven a él dicen que está desactivado, con **Abrir módulos**.
- **No se borra nada:** sus chats, contactos, cuentas y ajustes vuelven a estar cuando se activa de nuevo. Los
  contactos, el bloqueo con contraseña, los espacios, las copias de seguridad y los ajustes siempre están, sea lo que
  sea lo que esté activado.
- **Activado de nuevo:** un módulo que se activa se inicia al instante, y **Permisos** muestra lo que Android debe
  permitir para él, como en el primer inicio.
- **Nuevo con una actualización:** un módulo que llega con una actualización, como la Colección con la 7, está
  activado, también donde elegiste los módulos antes de que llegara, hasta que lo desactives.
- **El Teléfono o los SMS desactivados** mientras Erevos sigue siendo la app de teléfono o la app de SMS: Android sigue
  dando a Erevos las llamadas o los SMS, guardados como antes. **Abrir aplicaciones predeterminadas** elige otra app.
- **El Teléfono solo:** sin ningún módulo que traiga mensajes, la pantalla de inicio lo dice, con **Teléfono** y
  **Módulos**.
- **Guardado en el teléfono:** la elección es para este teléfono, la misma en todos los espacios, y se guarda fuera de
  los espacios, como los iconos, ya que el Teléfono puede abrirse sin la contraseña.

**Por qué:** no todo el mundo quiere todo. Quien usa {=Erevos} solo como teléfono, o solo para Nostr, obtiene una app que
hace solo eso, y un teléfono que no espera en segundo plano mensajes que nunca llegan.

## Chatear con un teléfono cercano {#nearby}

Mientras un espacio está abierto, en cualquier pantalla, Erevos busca otros teléfonos con {=Erevos} a su alrededor, por
Bluetooth y, donde el teléfono lo tiene, Wi-Fi Aware, y en la Wi-Fi a la que está conectado, teléfonos y ordenadores por
igual. No hace falta internet, SIM ni red Wi-Fi. Lleva los mensajes a tus contactos, cifrados de extremo a extremo como
los que van por el relay.

Solo busca cuando **Buscar teléfonos cerca** está activado, en **Para usuarios avanzados** → **Cerca, sin internet**,
en **Chat nuevo**: está apagado hasta que lo actives, en los dos teléfonos, y hasta entonces todo va por el relay.
Solo **A mi lado**, en Chat nuevo, busca sin él, mientras su página está abierta, para añadir un contacto.

1. Abre **Teléfonos cercanos** desde el menú en los dos teléfonos. La primera vez, Android pide permiso para encontrar
   dispositivos cercanos (en Android 12 y anteriores, también para la ubicación); permítelo, o los teléfonos no podrán
   encontrarse.
2. Si aún no sois contactos, añadíos mutuamente: en los dos teléfonos toca **Chat nuevo** y luego **A mi lado**, y
   toca **Sí, las mismas** cuando los dos muestren las mismas imágenes, como en [Chatear a través de un
   relay](#relay). Sin relay cada teléfono da solo sus claves, y os podéis contactar solo cerca, hasta que tengáis
   uno.
3. Elige el contacto, escribe en la barra de mensajes de abajo y toca la flecha de enviar. En cuanto su teléfono
   responde, la parte de arriba del chat dice **Cerca**.

- **Mientras un espacio está abierto:** los enlaces empiezan cuando se abre un espacio, sea cual sea la pantalla que se
  vea, y se detienen cuando se abre otro espacio: bloqueado, el espacio sigue detrás de la pantalla de la contraseña. Un
  mensaje de cerca aparece en la pantalla de inicio como uno que llega por el relay, y una llamada también suena ahí. En
  Android siguen activos con Erevos en segundo plano, mientras **En segundo plano** está en **Recibir y sonar**. Para
  ahorrar batería en ese caso, busca teléfonos con menos frecuencia: Wi-Fi Direct cada diez minutos, Wi-Fi Aware un
  minuto de cada cinco, y en la misma Wi-Fi escucha a los demás veinte segundos de cada dos minutos. Así, un teléfono
  cercano puede encontrarse unos minutos más tarde; los enlaces que ya están activos siguen activos, y en cuanto Erevos
  se ve, busca con la misma frecuencia de antes.
- **Alcance:** unas decenas de metros al aire libre, menos a través de paredes.
- **Wi-Fi Aware:** más rápido, pero no todos los teléfonos lo tienen. Bluetooth funciona en todos. Para detenerlo,
  desactiva **Buscar con Wi-Fi Aware**, encima de **Buscar Erevos en la misma Wi-Fi**.
- **La misma Wi-Fi o un punto de acceso:** los teléfonos en una misma Wi-Fi, o en el punto de acceso de un teléfono,
  se encuentran y hablan directamente, aunque esa Wi-Fi no tenga internet; la app de escritorio también. Si Android
  pregunta si quedarse en una Wi-Fi sin internet, quédate. Cualquiera en esa Wi-Fi puede saber que hay una app Erevos,
  no de quién. El cortafuegos de un ordenador debe dejar entrar el puerto 47905 (UDP y TCP). Para detenerlo, desactiva
  **Buscar Erevos en la misma Wi-Fi** bajo **Para usuarios avanzados** → **Cerca, sin internet**, en **Chat nuevo**.
- **Una Wi-Fi propia (Android 10 y posteriores):** sin ninguna Wi-Fi en común, dos teléfonos con {=Erevos} cerca el uno del
  otro crean una pequeña Wi-Fi propia (Wi-Fi Direct) y hablan por ella como en la misma Wi-Fi: más rápido que Bluetooth,
  y una llamada va por ella sin internet. No pregunta nada; cada teléfono se queda también en su propia Wi-Fi donde
  puede. Cualquiera que esté cerca puede saber que hay un teléfono con {=Erevos}, y podría unirse a esa pequeña Wi-Fi,
  obteniendo solo bytes sellados. Necesita **Buscar Erevos en la misma Wi-Fi** activado; para detener solo esto,
  desactiva **Crear una Wi-Fi con teléfonos cercanos**, debajo.
- **En un teléfono Samsung** **Buscar con Wi-Fi Aware** y **Crear una Wi-Fi con teléfonos cercanos** están desactivados
  hasta que los actives: mientras una app los usa, Samsung pide desactivar su propia función de compartir. Bluetooth y
  la misma Wi-Fi funcionan sin ellos.
- **Otros teléfonos cercanos** solo reciben bytes sellados que no pueden abrir, y solo hasta que se conoce el teléfono
  de tu contacto: a partir de entonces, lo que envías va solo a él. Los mensajes de voz solo van a un contacto que se
  sabe que está cerca. Las fotos y los archivos necesitan el relay.
- **Con un relay además,** cada mensaje también va por él, así que no se pierde nada si el enlace se corta; la copia que
  llega en segundo lugar no se vuelve a mostrar. Si el relay no está disponible, la copia de cerca es la que cuenta.
- **Llevados por otros teléfonos:** cuando el relay no está disponible y tu contacto no está cerca, los teléfonos con
  {=Erevos} cercanos también se llevan tu mensaje sellado para el relay de tu contacto. Cada uno lo guarda, tres días
  como mucho, se lo da a dos teléfonos más como mucho de los que encuentre, y lo entrega a ese relay a través de su
  propio relay en cuanto puede; el tuyo hace lo mismo. No pueden leerlo, ni saber de quién es ni para quién: solo ven
  la dirección del relay. Se conserva cuando Erevos se cierra, sellado en el teléfono. Los tuyos se quedan en tu
  espacio, y solo salen mientras está abierto. Llevar mensajes de otros está activado salvo que desactives **Llevar
  mensajes de otros** bajo **Para usuarios avanzados** → **Cerca, sin internet**, en **Chat nuevo**, y solo para
  relays en internet con TLS (wss://): un desconocido cercano nunca hace que tu teléfono, o tu relay, contacte con uno
  de una red local o del propio teléfono. Tus propios mensajes los llevan los teléfonos cercanos que lo tienen
  activado.
- **Traídos por otros teléfonos:** al revés, cuando tu teléfono no tiene internet, un teléfono con Erevos a su lado
  que tiene internet, y lleva para otros, toma lo que te espera en tu relay y te lo da de cerca. Erevos pregunta una
  vez por cada teléfono así, también por el de un contacto, porque un desconocido puede pasar mensajes de un contacto
  para parecer él, y solo mientras está delante: **Un teléfono cerca de ti tiene internet. ¿Quieres que traiga tus
  mensajes?** Ese teléfono sabe qué cola de tu relay es la tuya y cuándo la lees; nunca lo que dicen tus mensajes, que
  solo abre tu teléfono. Conociendo la cola, podría llevarse tus mensajes antes de que te lleguen, así que en cuanto
  tu teléfono vuelve a tener internet pasa solo a una cola nueva y se lo dice en silencio a tus contactos. Por los
  chats ocultos pregunta aparte, y solo mientras están en la pantalla, porque ese teléfono sabría que hay una segunda
  cola, y por tanto que puede haber chats ocultos. Nunca para un relay al que se llega solo por Tor. Tu teléfono hace
  lo mismo para los teléfonos a su lado mientras **Llevar mensajes de otros** está activado, nunca mientras va por
  Tor, y de un relay distinto del suyo solo cuando dices que sí, avisado de que ese relay ve entonces la dirección de
  internet de tu teléfono.

**Por qué:** un paquete no dice para quién es, así que nadie cercano puede saber por él de quién es. Hasta que el
teléfono de tu contacto responde en un enlace, tu teléfono tampoco puede saber cuál de los teléfonos cercanos es el suyo:
así que los paquetes cortos van a todos, cada uno los prueba, y desde el primero que lo abre, ese enlace es el de tu
contacto. Un mensaje de voz, en trozos más grandes, espera a eso.

> Un mensaje de cerca solo se abre en el espacio que tiene ese contacto. Uno para otro espacio de este teléfono espera
> en memoria, seis horas como mucho, hasta que ese espacio se abra. Uno para chats ocultos solo se abre
> mientras están abiertos, o reciben cerrados, y hasta entonces espera igual.

**Por qué:** los enlaces de cerca pertenecen al teléfono, no a un espacio, y nada en ellos nombra uno: lo que llega se
prueba en los chats del espacio que está abierto, y se guarda un rato en memoria para los demás, sin escribirse nunca en
el teléfono. Los chats ocultos
también los usan, pero lo que oyen es suyo: el enlace en el que se oyó a un contacto oculto se guarda aparte del del
espacio, solo en memoria y solo mientras esos chats ocultos están abiertos o reciben cerrados, así que el espacio nunca
sabe que uno de sus contactos está cerca; y en el aire sus mensajes se ven como los del espacio. Nunca llevan mensajes de
otros, otros nunca llevan los suyos, y nunca van por LoRa{~ ni por SMS}.

**Bluetooth que no se puede seguir:** lo que tu teléfono emite por Bluetooth para que otros lo encuentren solo dice
que cerca hay un teléfono con {=Erevos}, con un número aleatorio que cambia cada nueve a doce minutos, y en Android 8 y
posteriores desde una dirección que cambia con él. Así, quien escucha en un sitio y luego en otro no puede saber que es
el mismo teléfono, al menos por Erevos. Las conexiones abiertas siguen abiertas. Los teléfonos con un {=Erevos} más
antiguo encuentran el tuyo, y el tuyo a ellos, como antes.

## Con una radio LoRa {#lora}

Con una radio LoRa Meshtastic conectada al teléfono por Bluetooth, Erevos llega a otro Erevos con una radio en la misma
malla, a kilómetros, sin internet: directamente, o a través de las radios Meshtastic que haya entre medias. Está
desactivado salvo que configures una radio, y solo en Android.

1. Configura primero la radio en la app Meshtastic, sobre todo su **región**: sin ella no transmite nada. Luego cierra
   la app Meshtastic, o desconéctala ahí: una radio se conecta a una sola app a la vez.
2. Abre **Ajustes** → **Relay y redes** → **Radio LoRa**, toca **Buscar mi radio**, lee lo que dice, y toca tu radio
   cuando aparezca. Una radio aún no emparejada pide su PIN: aparece en la pantalla de la radio, o es 123456.
3. Tu contacto hace lo mismo con la suya, en la misma malla: la misma región y el mismo primer canal.
4. Escribe como siempre. Cuando el relay no está disponible y no hay ningún teléfono cerca, un texto va por LoRa,
   y la línea bajo el chat lo dice.

- **Solo texto, y despacio:** un mensaje va en trozos de unos 220 bytes, cada uno un segundo o dos en el aire, y la ley
  solo permite a una radio cierto tiempo de emisión (en la UE, una décima parte de cada hora). Así que LoRa solo lleva
  textos y eliminaciones, y solo cuando nada más lo hace. Los mensajes de voz, las fotos y los archivos esperan en el
  chat, marcados como **En espera**, y salen solos en cuanto el relay o un teléfono cercano pueden recibirlos; las
  llamadas también necesitan uno de esos. El primer mensaje a un contacto tarda más, porque lleva las claves.
- **Marcas:** **✓✓** llega con su siguiente mensaje, ya que las marcas solas no van por LoRa.
- **Piezas de repuesto, y textos largos comprimidos:** un mensaje de dos piezas o más va con piezas de repuesto
  detrás, una por cada cuatro, para que el Erevos de tu contacto rehaga las piezas perdidas por el camino, sin
  volver a enviar nada; ocupan algo más de tiempo en el aire. Un texto largo va comprimido, más pequeño y sin perder
  nada, a un contacto cuyo Erevos lee mensajes comprimidos, así ocupa menos piezas, o llega a caber; uno corto va tal
  cual.
- **A todas las radios al alcance:** cada mensaje lo oyen todas las radios de alrededor, y lo retransmiten las radios
  Meshtastic, como hace Meshtastic. Todos los Erevos lo prueban; solo el de tu contacto lo abre. Por LoRa no se lleva
  nada de otros.
- **Su nombre y dónde está:** las radios Meshtastic anuncian su nombre de vez en cuando a todas las radios al alcance, y
  dónde están si tienen GPS o una posición fija, sin cifrar. Erevos impide que la tuya lo haga (**Ocultos**): pone su
  rol en Client hidden, apaga su GPS y quita una posición fija. Aun así responde a una radio que le pregunte su nombre,
  así que dale un nombre que no diga nada de ti, en la app Meshtastic. **Anunciados a todos al alcance** devuelve su rol
  y su GPS, tras una advertencia; una posición fija se vuelve a poner en la app Meshtastic. Si la radio no conserva los
  ajustes, la pantalla de LoRa lo dice.
- **Sigue conectada** mientras Erevos funciona, y se vuelve a conectar sola cuando la radio vuelve a estar al alcance.
  **Desactivar LoRa** devuelve a la radio su rol y su GPS, si está conectada, y luego la desconecta y la olvida. Los
  chats ocultos nunca van por LoRa.

**Por qué:** lo que una radio Meshtastic dice de sí misma va sin cifrar, a cualquiera que escuche a kilómetros: su nombre
y dónde está podrían mostrar dónde estás tú y vincular la radio contigo, así que Erevos la mantiene en silencio salvo que
elijas otra cosa. Y como la ley solo permite a una radio cierto tiempo de emisión, LoRa se reserva para tus propios
textos, cuando nada más puede llevarlos, nunca para lo que otros teléfonos le harían llevar.

> Una radio LoRa se oye a kilómetros, y su señal se puede rastrear hasta donde está, en silencio o no. Lo que Erevos
> envía sigue cifrado de extremo a extremo, pero cualquiera con una radio puede saber que la tuya transmite, cuándo y
> cuánto. Con **Anunciados a todos al alcance**, cualquiera con una radio también puede leer su nombre y dónde está.

## Chatear a través de un relay {#relay}

Un relay es un pequeño servidor que guarda colas de un solo sentido: cada teléfono tiene su propia cola, y quien tenga su
**enlace de contacto** puede dejar mensajes en ella. El relay no guarda cuentas, nombres ni números de teléfono, y no
puede leer los mensajes: están cifrados de extremo a extremo, y solo los dos teléfonos tienen las claves. Cada teléfono
puede usar un relay propio: un mensaje para un contacto de otro relay se sella para el suyo y se entrega al tuyo, que lo
pasa, así que su relay nunca ve la dirección de tu teléfono. Un teléfono sin relay obtiene un sitio en el de su
contacto, ver **Sin relay propio** más abajo.

**Por qué:** con colas y sin cuentas, ningún servidor tiene una lista de quién conoce a quién, y nadie necesita tu número
de teléfono ni tu email para contactarte: quien tenga tu enlace de contacto puede escribir en tu cola, y solo tú la lees.

1. En la pantalla de inicio, toca **Chat nuevo**. Mientras falte algo, arriba **Cómo te conectas ahora** dice con
   palabras sencillas cómo te contactan tus contactos: a través de tu relay, a través de Nostr sin relay, o solo de
   cerca; cuando todo funciona, no se muestra. Con un relay, un campo arriba del todo encuentra un contacto por su
   nombre o añade un enlace pegado en él. Luego viene una pregunta, **¿Dónde está la otra persona?**, y cada respuesta
   abre una página propia: **A mi lado**, **Lejos** y **Tengo su código**, como en los pasos 4 a 6 de abajo. Tres
   filas debajo abren lo demás: **Mi enlace**, **Contactos bloqueados** y **Para usuarios avanzados**, donde están los
   ajustes propios del relay; **Ajustes** → **Relay y redes** → **Relay** abre Chat nuevo con ellos abiertos.
2. En **Para usuarios avanzados**, escribe la **Dirección del relay**: \`ws://<dirección del ordenador>:7879\` para un
   relay en tu propia red, o \`wss://relay.example.org\` para uno en internet. Añade el **Token** si el relay lo pide.
3. Erevos crea tu cola en él por sí solo, unos segundos después, y dice **Cola del relay creada**: todo funciona, textos, fotos, mensajes de voz,
   llamadas y grupos, y **Cómo te conectas ahora** desaparece, porque no falta nada. Si no puede, la nota dice por qué; **Crear mi cola en el relay**, debajo de la dirección, lo intenta de nuevo.
4. **A mi lado**, para alguien que está junto a ti: en los dos teléfonos, tocad **Chat nuevo** y luego **A mi lado**.
   Los dos teléfonos se encuentran solos, por Bluetooth o por la Wi-Fi que comparten, y cada uno muestra **Se ha
   encontrado un teléfono** con seis imágenes. Mirad las dos pantallas: cuando las imágenes son las mismas, en el
   mismo orden, cada uno toca **Sí, las mismas**, y ya sois contactos, sin relay, sin internet y sin escribir nada.
   **No, otras** deja ese teléfono a un lado. Las imágenes salen de una clave que los dos teléfonos crean entre sí,
   así que un teléfono que se pusiera en medio mostraría a cada uno otras distintas; cada teléfono da su enlace de
   contacto solo cuando su dueño dice que sí, cifrado con esa clave. La página busca teléfonos solo mientras está
   abierta, también con **Buscar teléfonos cerca** apagado, que sigue apagado; en los chats ocultos y en la app web no
   busca nada. Bajo **Si no se encuentra**, la página tiene las otras formas para alguien que está a tu lado: un
   código QR para su cámara, que es una invitación donde tu relay deja invitar a este teléfono, y si no tu enlace de
   contacto; **Mostrar un código de 8 dígitos**, que la otra persona escribe como en el paso 6; **Escanear el suyo** y
   **Escribir su código**, para el suyo; y, en Android, **¿No tiene Erevos en su teléfono?**, que le da la app misma.
5. **Lejos**, para alguien que no está contigo: la página crea una invitación, un enlace para una persona, dentro de
   un mensaje listo para enviar. Toca **Enviar con…** y elige la app con la que va (en un navegador y en un ordenador,
   **Copiar la invitación**), o **El código QR de la invitación** para mostrarla como código. La otra persona toca el
   enlace: con Erevos en su teléfono se abre ahí, y sin él el enlace le muestra antes dónde conseguirlo. Su teléfono
   se une entonces a tu relay con acceso propio, sin escribir nada, y ya sois contactos. La página dice por dónde va,
   **La invitación está lista**, **Esperando a que la abra**, **Estáis conectados**, y mientras tanto puedes salir de
   ella: en cuanto su teléfono se ha unido, aparece en tus chats. Más sobre las invitaciones en Invitar a alguien
   nuevo, más abajo. Donde este teléfono no puede crear una invitación, aún sin relay, en los chats ocultos o en un
   ordenador vinculado, la página da en su lugar tu enlace de contacto para enviar: la otra persona lo abre en Erevos,
   o lo pega en **Tengo su código**.
6. **Tengo su código**, para lo que te ha dado la otra persona. Escribe los 8 dígitos que su teléfono muestra en **A
   mi lado** → **Mostrar un código de 8 dígitos**, a tu lado o dichos en una llamada: entonces cada teléfono tiene al
   otro como contacto. El código nunca sale de los teléfonos: se demuestran el uno al otro que lo conocen, y sus
   enlaces de contacto van cifrados con una clave que solo el mismo código da. Se encuentran en relays públicos de
   Nostr, que no ven ni el código ni los enlaces, y quien adivina tiene 3 intentos antes de que el código se cierre.
   Un código dura 10 minutos. Debajo de los dígitos, pega su enlace de contacto o su invitación en el campo y toca
   **Añadir**, o toca **Escanear su código QR** y haz una foto del código en su pantalla, o **Desde una foto de su
   código QR** para una captura o una foto del código que te haya enviado. Erevos lo lee y lo añade al instante. En un
   ordenador, en Sailfish OS y en la app web, **Escanear su código QR** pide una foto de él; en un iPhone también
   ofrece la cámara. Los chats ocultos también tienen esta página.
7. **Mi enlace**, en las filas bajo las tres, es el código QR y el enlace de contacto propios de este teléfono. Deja
   que el otro teléfono escanee el código con su cámara, y que luego abra el enlace en Erevos. La pantalla **Añadir un
   contacto** muestra lo que contiene: toca **Añadir al chat** solo si lo escaneaste tú. **Añadir y vincular a uno de
   mis contactos** también lo añade, vinculado al contacto que elijas, cuyo nombre toma el chat. El código es corto,
   así que cualquier cámara lo lee. Quien lo escanea responde con su propio enlace de contacto, y luego este teléfono
   le escribe primero. El código es nuevo cada vez que se abre la página, y vale una vez: el primero que lo escanea es
   un contacto al instante; quien lo escanee después, o tome el enlace que compartes, escribe primero una solicitud de
   mensaje. **Código QR grande, sin internet** muestra en su lugar el código entero, que funciona cerca sin internet,
   y **Código QR pequeño** vuelve atrás. **Compartir**, debajo, envía un enlace corto que cualquier app te deja tocar;
   en Android abre Erevos, que pregunta antes de aceptarlo. Para añadir a alguien con su código QR de contacto, tu
   teléfono necesita antes un relay. Este código QR solo funciona si los dos teléfonos tienen un relay, como dice la
   página: si no, usa **A mi lado**, o una invitación desde **Lejos**. **Escanear el suyo** y **Desde una foto de su
   código QR**, debajo, leen desde aquí el código del otro teléfono. Lo mismo vale por contacto: mientras se muestra
   el código pequeño y el NFC está activado en Android, el otro teléfono lo toma si apoyas su parte trasera contra la
   del tuyo. Solo funciona con Erevos en primer plano, no en segundo plano, y nunca con el código QR grande.

Elijas la forma que elijas, termina en **Estáis conectados**: su imagen, **Su nombre en tus chats**, que su teléfono
puede haber dicho y que puedes cambiar, y **Escribir un mensaje** o **Añadir a otra persona**. El chat nuevo aparece
en la pantalla de inicio con el nombre **contacto** y los primeros caracteres de su clave, hasta que tenga un nombre:
**Cambiar nombre** en sus detalles le da uno. Justo después de añadirlo aquí, **Vincular a uno de mis contactos**,
bajo el aviso de que se ha añadido, te deja elegir en su lugar uno de tus contactos (**Ahora no** lo deja así): el
chat toma el nombre de ese contacto, si no tiene uno propio, y la ficha del contacto muestra el chat. Los chats
ocultos solo ofrecen sus propios contactos, nunca los del teléfono. Basta con que un teléfono añada al otro: añadir un
enlace inicia una conversación cifrada y le dice al otro teléfono cómo responder, así que este muestra el chat la
próxima vez que consulta su cola, cosa que hace cada pocos segundos.

**Lo que el relay ve de un chat:** todos tus contactos escriben en tu única cola. En cuanto cada teléfono ha recibido un
mensaje del otro, cada mensaje entre ellos se sella una vez más para el teléfono al que va, con una clave que ese
teléfono dio dentro del chat, así que para el relay cada uno son bytes aleatorios de uno de unos pocos tamaños, y no
puede saber por ellos a qué conversación pertenecen. El primer mensaje de un chat, y los que se envíen antes de que
llegue la respuesta, todavía lo muestran. El relay sigue viendo qué dirección deja cada mensaje, y cuándo. Y cada uno le
dice al relay, en un byte que este lee, lo que lleva: un mensaje que alguien lee, aviso entre teléfonos (que un mensaje
llegó o se leyó, escribiendo, estar en línea, reacciones, claves nuevas), o una llamada que suena. Así que el relay ve
cuáles son mensajes, y cuándo empieza una llamada, estén las notificaciones activadas o no: así es como el aviso de una
app web cerrada puede contarlos, y el aviso de los chats ocultos cerrados.

### Formas de entrar al relay

Un relay que pide token deja entrar a un teléfono de tres formas. Cada forma acaba con un token propio del teléfono ahí,
así que quien gestiona el relay puede sacar a cualquier teléfono por separado.

- **Una invitación:** un código QR o un enlace de un teléfono que ya está en el relay (ver Invitar a alguien nuevo más
  abajo). Nada que escribir, y sois contactos al instante.
- **Una cuenta:** **Iniciar sesión con LPHL**, cuando el relay lo ofrece (ver Iniciar sesión en el relay más abajo).
  Cualquier cuenta LPHL puede, en hasta 10 teléfonos.
- **El token del relay:** el token único para todos, de quien gestiona el relay, escrito en **Token**. Erevos lo cambia
  al instante, por sí solo, por un token propio del teléfono, con el nombre con el que te presentas en las invitaciones
  (\`phone\` si no diste ningún nombre), lo dice, y a partir de entonces solo usa ese. Así este teléfono también puede
  invitar. Necesita un relay que acepte invitaciones, posterior a Erevos 3.1.0; con uno más antiguo, o uno que no acepte
  invitaciones, el teléfono se queda con el token del relay y no puede invitar.
- **Los límites:** un teléfono puede tener 5 invitaciones pendientes a la vez y crear 10 al día (el día según UTC); cada
  una es para un teléfono y dura 7 días. El relay deja entrar 100 teléfonos por invitación en total, contando también
  las invitaciones pendientes, salvo que quien lo gestiona haya elegido otra cosa. Los teléfonos que entraron con una
  cuenta o con el token del relay no cuentan en esos 100: el relay da un token propio a 50 teléfonos al día que llegaron
  con su token, y una cuenta tiene 10 teléfonos. El relay atiende 512 conexiones a la vez, sean de quien sean, salvo que
  quien lo gestiona haya elegido otra cosa.
- **Sacar un teléfono:** quien gestiona el relay borra su línea en el archivo de tokens del relay: ya no puede usar el
  relay, mientras que los teléfonos que invitó conservan su acceso. Si alguna vez tuvo el token del relay, también
  cambia ese token, para que no pueda volver con él. Los teléfonos con tokens propios siguen como están: solo un
  teléfono que todavía tenga escrito el token antiguo (sin abrirse desde entonces, o con un {=Erevos} más antiguo) necesita
  el nuevo.
- **Los chats ocultos** conservan el token del relay escrito para ellos: cambiarlo en el mismo momento que el del
  espacio mostraría al relay que son de este teléfono. Cuando cambia el token del relay, escribe el nuevo en su **Para
  usuarios avanzados**.

**Por qué:** el relay da a cada conexión un hilo propio, así que solo atiende cierto número a la vez; y solo añade cierto
número de líneas al día para teléfonos que llegaron con su token único, así que un token que fue a parar donde no debía
no puede llenar su archivo de tokens.

### Invitar a alguien nuevo

Un código QR o un enlace trae a alguien nuevo: su teléfono se une a {=Erevos} en tu relay, con acceso propio, sin escribir
nada, y sois contactos el uno del otro al instante, sin solicitud de mensaje.

- **Para invitar:** en la pantalla de inicio, toca **Invitar** junto a la línea del relay o, en **Chat nuevo**, toca
  **Lejos**. La invitación se crea al instante y aparece dentro de un mensaje listo para enviar: toca **Enviar con…**
  y elige la app, o toca **El código QR de la invitación** y deja que lo escanee con la cámara de su teléfono. Debajo
  puedes escribir para quién es (su nombre en tus chats) y **Tu nombre, para esa persona**, o dejar ambos vacíos. Si
  la abres de nuevo mientras nadie la haya tomado y le quede al menos un día, muestra la misma invitación, así que no
  gasta ninguna de las 5 en espera ni de las 10 al día; **Invitar a otra persona** crea una nueva, y **Retirar esta
  invitación** cierra su enlace mientras ningún teléfono la haya tomado. Es para una persona, por 7 días, o menos si
  la invitación del relay termina antes. Quien la toma primero la tiene, así que dásela solo a esa persona. Para
  alguien que está a tu lado, **A mi lado** también muestra una invitación así como código QR. En un teléfono Android
  con NFC activado también puedes dársela por contacto: apoya la parte trasera de su teléfono contra la trasera del
  tuyo mientras se muestra el código, y su teléfono abre el enlace solo, en Erevos si está instalado, y si no en la
  página web de Erevos, que ofrece {=Erevos}. Si el NFC está apagado, la página te dice que lo actives en los ajustes de
  Android.
- **Para unirse:** toca el enlace que te ha enviado, o escanea la invitación con la cámara y abre el enlace en Erevos:
  abre **… te invita a Erevos**, y tocas **Unirse** solo si viene de esa persona. Dentro de Erevos, **Tengo su
  código** en **Chat nuevo** también acepta una invitación: toca **Escanear su código QR** y haz una foto de la
  invitación en su pantalla, o **Desde una foto de su código QR**, o pega el enlace en el campo de ahí y toca
  **Añadir**. Erevos obtiene acceso propio a su relay y una cola ahí, la añade y dice **Te damos la bienvenida a
  Erevos**. Su primer mensaje avisa a su teléfono, que añade este como contacto al instante, con el nombre que
  escribió.
- **Las otras formas de entrar:** en **Chat nuevo**, **Para usuarios avanzados** abre las demás, para quien las
  busque: **Iniciar sesión con LPHL** inicia sesión en el relay de LPHL desde este teléfono con una cuenta LPHL, en el
  navegador (ver Iniciar sesión en el relay más abajo), y luego añades a tus contactos con sus invitaciones o enlaces;
  **Empezar sin relay**, como en Sin ningún relay, en A través de Nostr; y los ajustes del relay, como en los pasos 1
  a 3 de arriba. Una invitación es la forma más sencilla de entrar, y en el relay un teléfono invitado solo tiene un
  nombre de letras y cifras al azar.
- **Otro relay:** debajo de **Iniciar sesión con LPHL**, **Iniciar sesión en otro relay…** toma la dirección de otro
  relay, tal como te la dio quien lo gestiona, por ejemplo relay.example.org: la tarjeta inicia sesión allí, con el
  nombre de las cuentas que acepta ese relay, o dice que no ofrece inicio de sesión, y entonces quien lo gestiona puede
  darte una invitación. **Volver a** trae de nuevo el de LPHL.
- **Lo que tu relay debe permitir:** el acceso propio es una invitación a tu relay (ver Invitaciones al relay más
  abajo), así que solo sale de un teléfono con token propio en un relay que acepte invitaciones. Cuenta entre tus
  invitaciones, con un nombre de letras y cifras al azar, y se queda aunque el tuyo se vaya. Un teléfono con el token
  único del relay para todos lo cambia antes por uno propio (ver Formas de entrar al relay más arriba); donde el relay
  no lo hace, no crea ninguna invitación: inicia sesión en el relay primero (debajo del **Token**, en **Para usuarios
  avanzados**), o usa una invitación a él. Cuando tu relay no acepta invitaciones, la invitación igualmente os hace
  contactos, y su teléfono usa tu relay solo como le permite tu enlace de contacto, como en Sin relay propio más
  abajo. Una invitación así solo se abre en un teléfono que ya tiene Erevos.
- **Un teléfono que ya tiene relay** conserva el suyo: la invitación solo te añade, y sois contactos al instante igual.
- **Lo que se guarda:** tu teléfono guarda el secreto de cada invitación y el nombre para esa persona, sellados en el
  espacio, hasta que se usa o acaban sus 7 días, 20 como mucho a la vez. Nada de ello está en el relay salvo la
  invitación al relay.
- [~] **Por SMS, a alguien que aún no tiene {=Erevos}:** en Android, la ficha de un contacto que no está en Erevos tiene
  **Invitar por SMS**. Escribe un SMS a su primer número con un enlace corto, en la app de SMS (la propia de Erevos
  cuando es la app de SMS del teléfono), para que lo envíes o no. La página del enlace en el servidor web de LPHL le
  ofrece {=Erevos} (la app de Android, o la app web en un iPhone) y luego abre en ella la invitación; en la app web en un
  iPhone, pega el enlace en **Tengo una invitación**. Toca **Unirse**: su teléfono se une a tu relay como arriba y
  responde al tuyo a través de él, lo que lo añade, vinculado a ese número y con el nombre de la ficha. Su primer
  mensaje, que sale solo, te hace su contacto, con el nombre con el que te presentaste en tu última invitación. La
  invitación va tras la **#** del enlace, que no se envía a ningún servidor web, pero la compañía telefónica ve el SMS,
  como todo SMS: por eso es para una persona, durante dos días, y cuando acaban los dos días sin que ningún teléfono la
  haya usado, tu teléfono retira su invitación al relay. Necesita un relay que deje invitar a tu teléfono, como arriba.

### Sin relay propio

Un teléfono sin relay chatea por internet igualmente: al añadir el enlace de un contacto cuyo relay presta sitios, toma
un sitio ahí, sin token.

- **Cómo:** añade su enlace como en el paso 6, sin nada en **Relay**. Erevos dice que ahora tienes un sitio en su
  relay, prestado a través de su enlace, y a partir de entonces lo usa como propio: tu propio enlace lo nombra, así
  que los demás también te contactan ahí.
- **Quién presta:** tu enlace lleva un billete para un sitio en tu relay solo cuando activas **Compartir un sitio en
  mi relay con este enlace**, bajo **Mi enlace** en **Chat nuevo**, y solo para el enlace que se muestra entonces: la
  próxima vez que se abra el chat, vuelve a estar desactivado. El relay necesita una clave para el envío en dos
  saltos, y solo presta cuando quien lo gestiona activa el préstamo; también puede retirar los sitios de un billete.
  Un billete dura 30 días y da hasta cuatro sitios. Cualquiera que vea un enlace con billete puede tomar un sitio con
  él, así que da ese enlace solo a quien quieras.
- **Lo que no hace un sitio prestado:** los mensajes a contactos de otros relays van directamente a su relay, que
  entonces ve la dirección de tu teléfono. No guarda nada para más tarde (un mensaje enviado más tarde espera en el
  teléfono), no da relay de llamadas (las llamadas van directamente entre los teléfonos), y crea 4 colas más y envía 50
  MB de archivos al día como mucho. Tu enlace no presta nada a su vez.
- **Tu propio relay en su lugar:** escribe su dirección en **Relay**: se deja el sitio prestado, y los contactos conocen
  el nuevo con tu siguiente mensaje.
- **Un enlace sin billete** (de un relay o un Erevos más antiguo): un relay que no pide token se usa tal cual; si no,
  os podéis contactar solo cerca, hasta que tengas un relay.

**Por qué:** un enlace con billete es una llave de tu relay para quien lo vea, así que tu enlace solo lleva uno cuando
tú lo eliges, para el enlace que se muestra entonces, y el relay solo presta cuando quien lo gestiona lo permite. Los
archivos de un sitio prestado se limitan a unas pocas fotos y mensajes de voz al día, para que nunca ocupe todo el
almacenamiento del relay.

### Invitaciones al relay

Un teléfono con token propio en un relay que acepta invitaciones puede dejar que un teléfono más use ese relay, con un
token propio de ese teléfono, así que no se escribe ni se pasa ningún token.

- **Para invitar:** en **Para usuarios avanzados** de **Chat nuevo**, debajo del **Token**, toca **Invitar al relay**,
  escribe para quién es y toca **Crear la invitación**. Se abre un código QR: deja que su teléfono lo escanee con la
  cámara y abra el enlace en Erevos, o toca **Compartir la invitación** y envíasela. Vale para un teléfono durante 7
  días, y quien la use primero se la queda, así que muéstrasela solo a esa persona.
- **Para usar una:** el enlace abre **Invitación a un relay**, con la dirección del relay: toca **Usar este relay**
  solo si viene de alguien que conoces. En Erevos, **Tengo su código** en **Chat nuevo** también acepta una
  invitación: con **Escanear su código QR**, **Desde una foto de su código QR**, o su enlace pegado en el campo de
  ahí. Erevos crea un token para este teléfono, lo guarda con la dirección del relay solo en este espacio y crea tu
  cola ahí. Si el teléfono usa otro relay, pregunta antes, y los contactos conocen tu nueva cola con tu siguiente
  mensaje. Erevos acepta una invitación a un relay wss://, o a uno ws:// solo en una red doméstica (como
  \`ws://192.168.1.10:7879\`). Los chats ocultos no aceptan invitaciones.
- **Tus invitaciones:** listadas bajo el botón, pendientes o en uso. **Retirar** retira una todavía pendiente, o corta
  al instante el teléfono que la usó, solo ese: los teléfonos que este invitó a su vez conservan su acceso.
- **El suyo se queda:** un teléfono que invitaste conserva su línea en el relay aunque la tuya desaparezca, porque el
  teléfono que te invitó la retiró, la cuenta con la que iniciaste sesión ya no puede usar el relay, o quien lo gestiona
  la sacó, y lo mismo los teléfonos que este invitó. Solo tus invitaciones aún pendientes ya no dejan entrar a nadie.
- **Lo que guarda el relay:** para ese teléfono un nombre de letras y cifras al azar, que no dice nada de quién es (el
  nombre que escribiste se queda en tu teléfono; un Erevos anterior a 6.0.0 daba al relay ese nombre, en letras
  latinas), que lo invitaste tú, y una huella de su token, no el token. Quien gestiona el relay ve esto, y puede sacar
  del relay a cualquier teléfono. Un teléfono puede tener 5 invitaciones pendientes a la vez, y crear 10 al día, y el
  relay solo deja entrar cierto número de teléfonos por invitación (100, salvo que quien lo gestiona haya elegido otra
  cosa).
- **Quién puede invitar:** un teléfono con token propio, en un relay cuyo gestor activó las invitaciones (ver
  [Tener tu propio relay](#own-relay)). Un teléfono con el token único del relay para todos lo cambia antes por uno
  propio (ver Formas de entrar al relay más arriba). Con un sitio prestado no hay **Invitar al relay**.

**Por qué:** el relay solo guarda una huella de cada token, nunca el token, así que su archivo no le dice a nadie cómo
conectarse. Y una invitación nombra un relay wss://, o uno ws:// en casa, así que nunca puede enviar las peticiones de
tu teléfono por internet sin cifrar.

### Iniciar sesión en el relay

Un relay puede dejar que los teléfonos inicien sesión con una cuenta en la que confía quien lo gestiona, como LPHL, para
obtener un token propio, sin nada que escribir en Erevos.

- **Para iniciar sesión:** escribe la dirección del relay en **Relay**. Cuando el relay lo ofrece, **Iniciar sesión
  con LPHL** aparece debajo del **Token**. Tócalo: el navegador abre la página de inicio de sesión, donde escribes tu
  nombre y tu contraseña, que Erevos nunca ve. Luego la página del relay muestra seis dígitos. En Android, toca ahí
  **Abrir {=Erevos}** y Erevos termina de iniciar sesión por sí solo; si no, escríbelos como se describe a continuación.
  De vuelta en Erevos, que te deja directamente en **Código de la página**, escríbelos ahí y toca **Terminar de
  iniciar sesión**: el teléfono guarda su token con la dirección del relay solo en este espacio, y crea tu cola ahí.
  Escribe el código solo en Erevos en tu propio teléfono y no se lo des a nadie, aunque te lo pidan: quien lo escriba
  usa el relay como si fuera tú. Tras 5 códigos incorrectos, el inicio de sesión se acaba: vuelve a iniciar sesión.
  Erevos solo abre una página de inicio de sesión en la dirección propia del relay, por https.
- **Volver a iniciar sesión** en el mismo teléfono sustituye su línea en el relay, cuando su token es el que obtuvo de
  ese relay. Cada teléfono obtiene una línea propia, 10 como mucho para una cuenta.
- **Lo que ven el relay y LPHL:** el relay nombra la línea del teléfono con tu nombre de usuario (\`lphl:nekten\`), y
  cada hora pregunta a LPHL si la cuenta todavía puede usarlo: en cuanto la cuenta se cierra o se desactiva, o no se
  puede preguntar a LPHL durante 3 días, la línea desaparece, y el teléfono ya no puede usar el relay; los teléfonos que
  invitó conservan su acceso. LPHL ve cada inicio de sesión y estas comprobaciones, pero nada de tus espacios, chats o
  contactos. Iniciar sesión desde otro espacio con la misma cuenta muestra al relay que los dos son tuyos.
- **Los chats ocultos** no inician sesión.

**Por qué:** la página muestra el código y tú lo escribes en Erevos, no al revés, así que un enlace de inicio de
sesión que te envíe otra persona no le sirve de nada: solo quien inició sesión ve el código, y cinco incorrectos lo
anulan. Erevos solo abre una página de inicio de sesión en la dirección propia del relay, por https, así que nada que
responda en lugar del relay puede enviarte a una página en otro sitio. Y un proveedor al que no se puede preguntar
durante un tiempo no corta ningún teléfono al instante: solo lo hacen 3 días sin una respuesta válida. Y el botón
**Abrir Erevos** es igual de seguro: el enlace contiene solo los seis dígitos, que no reclaman nada sin el secreto que
solo tiene el teléfono que inició el inicio de sesión, así que una aplicación que captara el enlace no obtiene nada.

### La clave propia del relay

En cuanto Erevos conoce la clave de tu relay (se la pide al relay la primera vez, o se la da un enlace de contacto),
cada conexión a ese relay empieza con una comprobación: el relay debe demostrar que tiene esa clave, y el token y todo lo
que sigue van cifrados con esa clave, dentro del cifrado propio de la conexión (TLS). En **Cómo te conectas ahora**,
Erevos dice entonces que tu relay demostró su propia clave. A partir de entonces, este espacio nunca contacta con ese
relay sin la comprobación.

- Un relay más antiguo que esta app no demuestra nada: funciona como antes, y **Cómo te conectas ahora** dice que es
  más antiguo. Erevos lo vuelve a intentar cada hora.
- Un relay que no puede demostrar la clave que Erevos guarda para él no recibe nada, y tus mensajes esperan; **Cómo te
  conectas ahora** lo dice en rojo. Solo si quien lo gestiona te dijo que tiene una clave nueva, toca **Tiene una clave
  nueva**: Erevos toma entonces la clave que dé el relay a continuación.

**Por qué:** el certificado de la conexión solo dice que quien responde tiene un certificado para el nombre del relay,
que una empresa que emite certificados también puede darle a otra persona, por error o cuando se la obliga. La clave
propia del relay solo está en su servidor, así que nadie entre medias puede hacerse pasar por él, y un certificado
renovado no cambia nada.

### El número de seguridad

Abre el chat, toca su nombre y luego **Número de seguridad**. Los dos teléfonos muestran los mismos 60 dígitos para
vosotros dos. Comparadlos en persona o en una llamada: si coinciden, no hay nadie en medio. Si son distintos, no confíes
en ese chat, y vuelve a añadir el enlace, escaneado de su propio teléfono. En cuanto haya vinculado un dispositivo,
también dice cuándo cambió por última vez la lista de sus dispositivos: tus mensajes van también a cada lugar de ella,
así que si no vinculó o desvinculó uno entonces, pregúntale.

Uno junto al otro, podéis comprobarlo con códigos en lugar de leer las cifras: bajo el número cada teléfono muestra un
código QR. Toca **Hacer una foto de su código** y fotografía el código de su teléfono; luego deja que hagan lo mismo
con el tuyo. Cuando coincide, la fila dice **Comprobado en persona**. Cada teléfono marca al otro solo por lo que vio
él mismo, y no se envía nada. Si dice que no coincide, puede que haya alguien en medio: no te fíes de ese chat.
**Elegir una foto de su código** comprueba, en cambio, una foto de su código que ya tienes. La marca **Comprobado en
persona**, con el día, se queda hasta que toques **Quitar la marca**. Se queda en este teléfono, va con el chat cuando
entra en los chats ocultos o sale de ellos, y no se pasa a tus dispositivos vinculados. Un código de un {=Erevos} más
nuevo lo dice: actualiza Erevos y haz la foto de nuevo.

**Por qué:** el código solo lleva un hash de vuestras dos claves, en un orden que distingue los dos teléfonos, así que
una foto de tu propia pantalla no comprueba nada, y una foto del código no dice quiénes sois a quien no tenga ya las
dos claves.

### Presentar a dos contactos

En los detalles del chat de un contacto, **Presentar a un contacto** te deja elegir a otro de tus contactos y **Preguntar
a los dos**. A cada uno se le pregunta en tu chat con él, con un mensaje que nombra al otro como tú lo nombraste; los
dos necesitan un nombre. Cada uno responde **Decir que sí** o **Decir que no** en ese chat. Solo si los dos dicen que sí
se hacen contactos: aquel desde cuyo chat hiciste la presentación escribe primero, y el teléfono del otro lo acepta al
instante, con el nombre que tú le diste. Si uno dice que no, no pasa nada, y al otro no se le dice. Una presentación
espera una semana.

**Por qué:** todo va dentro del cifrado de tus chats con cada uno, así que ningún relay ve a quién se presenta a quién.
Solo pasas el enlace de contacto que el segundo eligió dar, después de decir que sí. Como quien presenta podría hacer
pasar a otra persona, compara el número de seguridad con el nuevo contacto como con cualquier otro.

### Enviado, llegado y leído

Encima del primer mensaje de cada día, en todos los chats, también en los grupos y en Chat conmigo, el día se ve bien
marcado: **Hoy**, **Ayer**, el día de la semana dentro de la última semana y, antes, el día de la semana con la fecha,
como **Martes, 10 de noviembre**.

Bajo cada uno de tus mensajes a un contacto, **✓** dice que el relay o un teléfono cercano lo recogió, **✓✓** que llegó
a su teléfono, y **✓✓✓** que lo leyó. Su teléfono se lo dice al tuyo, dentro del cifrado, la próxima vez que cada uno
consulta el relay, o al instante cuando están cerca. Un mensaje cuenta como leído en cuanto su chat se ve en la
pantalla. **Marcar todo como leído** en el menú ⋮ cuenta igual: sus teléfonos lo saben en la siguiente mirada al relay.

En un grupo que no es público, tus mensajes tienen las mismas marcas, para todos los demás miembros a la vez: **✓** al
enviarse, **✓✓** cuando el mensaje llegó al teléfono de cada miembro que estaba en el grupo cuando lo enviaste, y
**✓✓✓** cuando todos lo leyeron. El teléfono de cada miembro se lo dice al tuyo, en un mensaje de grupo silencioso destinado solo a ti, cifrado de extremo a extremo como el resto del grupo: que el mensaje llegó, unos segundos después
(junto con los demás que llegaron entretanto, en uno solo), y que se leyó, cuando el grupo se ve en la pantalla.
Mantén pulsado un mensaje tuyo y elige **Quién lo leyó** para ver quién lo leyó y cuándo, a qué teléfono llegó y
cuándo, y quién no ha hecho ninguna de las dos cosas, bajo **Todavía no**. Un miembro cuyo {=Erevos} es anterior a estas
marcas no dice nada, así que se queda en **Todavía no** y el mensaje se queda en **✓**. Los grupos públicos no tienen
marcas. Un ordenador vinculado a este teléfono muestra las mismas marcas.

- **Enviando…:** en el momento en que pulsas Enviar, el teléfono da una vibración corta, el campo se vacía y el mensaje
  aparece, marcado como **Enviando…** hasta que el relay o su teléfono lo recogen. Si no puede salir y no puede esperar,
  sus palabras vuelven al campo. Si sales del chat mientras muestra **Enviando…**, no se pierde: sale, o espera
  marcado como **En espera**.
- **En espera:** un mensaje que nada pudo recoger, porque el relay no está disponible y su teléfono no está cerca, se
  queda en el chat marcado como **En espera**, y sale solo, en orden, en cuanto el relay o su teléfono cercano pueden
  recibirlo, mientras haya un espacio abierto; entonces muestra **✓**. Un texto espera directamente. Un mensaje de voz,
  una foto o un archivo pregunta antes: **Dejar en espera** o **Eliminar**. Un mensaje en espera se elimina solo en este
  teléfono. En los chats ocultos también espera, pero sale solo por su relay, nunca al teléfono cercano ni por LoRa:
  mientras están abiertos, o, con **Recibir estando cerrados** activado, mientras el espacio está abierto. Cuando la
  cola del contacto en el relay está llena, un texto, mensaje de voz, foto o archivo sigue yendo a sus dispositivos
  vinculados, si tiene alguno, aparece como enviado, y se vuelve a intentar para su teléfono mientras los chats ocultos
  sigan abiertos: si se cierran antes de que salga, su teléfono nunca lo recibe.
- **Enviar más tarde:** mantén pulsada la flecha de enviar y elige **Más tarde…**, o toca **+** y luego **Enviar más
  tarde**. Elige una hora con un toque (**En 1 hora**, **Esta noche 20:00**, **Mañana 09:00**) o el día, la hora y los
  minutos, hasta un año vista, y luego **Enviar más tarde**. El mensaje se queda en el chat marcado como
  **Programado** con su hora. Va cifrado al relay, que lo guarda y lo envía a esa hora, aunque este teléfono esté
  apagado o bloqueado entonces, y su teléfono lo muestra a partir de esa hora, no antes. Sin ningún relay disponible
  ahora, espera en este teléfono y va al relay en cuanto haya uno disponible. Sin nada escrito, la hora que elijas es
  para la siguiente foto, archivo o mensaje de voz: una foto o un archivo va a tu relay al instante y se queda ahí hasta
  que lo recojan, 14 días después de su hora como mucho. Los chats ocultos también lo tienen, igual, a través de su
  relay. Hasta su hora, elimínalo para retirarlo del relay, y nunca sale. Si su cola en el relay
  cambia antes, Erevos lo vuelve a programar para la nueva la próxima vez que contacte con el relay.
  Con un token propio de este teléfono, solo sale si el teléfono todavía tiene su línea en ese relay entonces. Un
  mensaje sin sonido sigue sin sonido. Un relay anterior a esto no guarda nada para más tarde: entonces el mensaje
  espera en este teléfono y sale a su hora mientras Erevos funciona, también en segundo plano mientras **En segundo
  plano** está en **Recibir y sonar** (más abajo), o cuando Erevos se vuelva a abrir.
- **Mensaje de seguridad:** escríbelo, toca **+** y luego **Mensaje de seguridad**, y elige cuánto tiempo: 6 o 12
  horas, 1, 2 o 3 días, o una semana. Va al relay al instante, como uno enviado para más tarde, y el relay lo envía por
  sí solo a esa hora. Cada vez que abres Erevos, pasada su contraseña, se retrasa de nuevo ese tiempo, así que solo sale
  si no abres Erevos a tiempo: si el teléfono se pierde, te lo quitan, se rompe o se queda sin internet, o si te ha
  pasado algo. Erevos en segundo plano no lo retrasa, ni tampoco su pantalla de contraseña, ni una ventana que se deja
  abierta sin que nadie la toque ni escriba en ella durante 10 minutos. En los chats ocultos se retrasa mientras su
  lugar recibe, o cuando lo abres. En el chat aparece marcado como **Mensaje de seguridad** con la hora a la que
  saldría; elimínalo para detenerlo. Escríbelo de modo que diga lo que es: a tu contacto le llega como un mensaje
  corriente. Si no se puede contactar con el relay cuando abres Erevos, conserva su hora. Se cifra una sola vez y va al
  relay otra vez tal como está cada vez que se retrasa, así que no le cuesta nada a tu chat.
  **Por qué:** un mensaje que guarda el relay no necesita nada de este teléfono para salir, así que quien se lleve el
  teléfono no puede detenerlo, salvo abriendo Erevos con su contraseña.
- **Enviar sin sonido:** mantén pulsada la flecha de enviar y elige **Sin sonido**: su teléfono muestra el aviso sin
  sonido ni vibración. Un Erevos anterior no lo sabe y suena como siempre, y lo mismo hace Erevos como app web, cuyo
  aviso viene del navegador. Lo mismo hace el aviso de un lugar de chats ocultos que está cerrado, con **Avisar cuando
  llega un mensaje** activado, y el de un espacio cerrado con **También mientras otro espacio está abierto**: estos
  solo preguntan al relay cuántos llegaron, y el relay no puede distinguir uno sin sonido de otro, ya que solo lo dice
  el mensaje cifrado.
- **Enlaces:** una dirección web en un mensaje aparece subrayada, también una sin más, como t.me/name o
  example.org/page, tal como la muestran Telegram y Signal; una dirección de correo o el nombre de un archivo
  (photo.jpg) no. Tócala y Erevos la muestra entera, para abrirla en el navegador solo si es adonde quieres ir. Antes
  de eso no se descarga nada.
- **Compartir desde otra app** (Android): en **Compartir** de otra app, como el del navegador para una página, elige
  **Erevos**. En cuanto hay un espacio abierto, **Enviar a** lista los chats{~, grupos y conversaciones SMS| y grupos} que mostró por
  última vez la pantalla de inicio, luego todos los demás chats y grupos{+, y los chats de tus cuentas de Matrix, XMPP y
  Nostr}, con una búsqueda; nunca los chats ocultos. Las palabras y los enlaces se abren en el campo de mensaje del que
  elijas, para leerlos y enviarlos ahí; una foto o un archivo sale en cuanto se abre ese chat o grupo, una foto con la
  calidad que elegiste para las fotos{~, y nunca como SMS}. Un archivo puede tener como mucho 100 MB{+ en un chat de Erevos,
  50 MB en Matrix y XMPP y 20 MB en Nostr}. Se cifra al llegar, con una clave solo en la memoria de Erevos, y así espera
  en el teléfono, también mientras das la contraseña si Erevos se bloquea antes; desaparece una vez enviado, o cuando
  sales de **Enviar a**.
- **Tu contacto ve cuándo lees:** tu teléfono se lo dice al suyo, como el suyo al tuyo, salvo que ese chat aparezca sin
  conexión (más abajo).
- **Cuando llegan mensajes:** Erevos consulta el relay cada pocos segundos mientras está abierto y desbloqueado, en
  cualquier pantalla, y la pantalla de inicio sube el chat arriba por sí sola. En Android cada mensaje nuevo suena, con
  un aviso que solo dice cuántos llegaron, también mientras Erevos está a la vista; en el chat o grupo abierto en la
  pantalla solo suena el sonido, y abrir un chat quita del contador lo que llegó ahí. Escribir, y que un mensaje llegó o
  se leyó, no hacen ninguno. En Android también sigue en segundo plano, mientras **En
  segundo plano** está en **Recibir y sonar** (más abajo): ahí espera en el relay hasta que llega algo, un minuto cada
  vez, en lugar de preguntar cada pocos segundos, y no pregunta nada más cuando no llegó nada, para que la batería dure,
  y un aviso solo dice cuántos mensajes llegaron. Cerrado, bloqueado, o
  mucho tiempo en segundo plano en otro caso, no lo hace: los mensajes esperan en el relay, hasta 14 días, y llegan en
  cuanto Erevos se vuelve a abrir. Una petición al relay sin respuesta a tiempo (una espera ahí, su minuto y medio
  minuto más; cualquier otra cosa, 45 segundos; una parte de un archivo, 2 minutos) cuenta como fallida y se vuelve a
  hacer, así que una conexión que murió por el camino, como cuando la red del teléfono se duerme o cambia, no retiene
  nada.

### En línea, última vez, y aparecer sin conexión

Mientras el chat de un contacto está abierto en tu pantalla, Erevos pregunta de vez en cuando a su teléfono si está
abierto, y dice que el tuyo lo está. Si el suyo lo está, el chat dice **En línea** bajo su nombre con un punto verde, y
la pantalla de inicio muestra el punto en su imagen. Escribirle a alguien también te muestra en línea para esa persona
durante dos minutos. Todo va dentro del cifrado, solo entre tú y ese contacto: el relay ve un mensaje de vez en cuando,
como con cualquier chat.

Cuando un contacto no está en línea, su chat dice cuándo tuvo Erevos abierto por última vez, al minuto: **última vez
hoy a las 14:32**. Tu teléfono les dice la tuya a tus contactos de la misma manera, dentro de lo que ya les va de
todos modos (un mensaje, o que ha llegado uno), y una vez cuando uno abre tu chat mientras Erevos está cerrado en tu
teléfono, solo si estuvo abierto desde la última vez que se les dijo. Está desactivada en un espacio nuevo hasta que
la actives, en **Ajustes** → **Privacidad y seguridad** → **Última vez**, o en los detalles de cualquier chat; un
espacio creado antes de la 7.0.1 la conserva como estaba, activada salvo que la desactivaras. Va en los dos sentidos:
desactivada, nadie ve la tuya, y tú tampoco ves la de nadie; quienes la veían la pierden con tu siguiente mensaje. Se
ajusta para todo el espacio y sus dispositivos vinculados, cada espacio por separado. Cada lugar de chats ocultos
tiene su propio interruptor, en los detalles de un chat de allí, y su propia hora: mientras están abiertos, solo ellos
cuentan como abiertos, no el espacio.

Con **Avisar cuando abro y cierro Erevos** activado (bajo **Última vez**, activado salvo que lo apagues), al abrir Erevos tus
contactos también lo saben al momento, sin esperar a un mensaje: solo aquellos con los que hablaste en los últimos 30
días y que también muestran su propia hora, cada uno tras una espera aleatoria de hasta un minuto, como mucho cada 15
minutos, nunca un chat que aparece desconectado ni una solicitud de mensaje. Al cerrarse Erevos, o sus chats
ocultos, a quienes se avisó mientras estaba abierto se les dice al momento cuándo se cerró, así que su **Última vez** es
esa hora. El relay ve entonces que algo va hacia ellos cuando abres y cierras Erevos, así que puede saber cuándo lo haces: apágalo y tu hora irá solo con lo que les llega de todos
modos.

Mientras escribes a un contacto que aparece en línea, su chat muestra **escribiendo…** bajo tu nombre durante unos
segundos, y el tuyo bajo el suyo cuando escribe. Se dice como mucho cada pocos segundos, solo mientras aparece en línea,
nunca a una solicitud de mensaje, y no en los grupos.

**Por qué:** estar en línea solo se dice entre tú y un contacto cuyo chat está abierto, dentro del cifrado, así que el
relay no ve más que un mensaje de vez en cuando entre dos personas que hablan. La hora en que estuviste por última vez
viaja dentro de esos mismos mensajes, cifrada de extremo a extremo: el relay nunca la conoce. Sí les dice a tus
contactos cuándo duermes o trabajas, y de dos contactos vistos en el mismo minuto se puede suponer que hablan entre
sí: desactívala si eso te importa. Alguien que solo tiene tu enlace, y te escribe como solicitud de mensaje, no recibe
nada de vuelta hasta que aceptes: ni que has leído, ni que estás en línea o escribiendo, ni cuándo estuviste por
última vez. Hasta que aceptes, solo se ven sus palabras: sus fotos y archivos esperan sin descargarse, y sus enlaces
no muestran vista previa. Si sus primeros mensajes piden un código, un PIN, una contraseña o dinero, prometen dinero
fácil, o su nombre se parece al de uno de tus contactos, **Ten cuidado** lo dice encima. Erevos lo busca solo en tu
teléfono, y no bloquea nada.

Para ocultarlo a un contacto, abre su chat, toca su nombre y luego **Aparecer sin conexión**. Con eso activado:

- **No te ve en línea**, ni que estás escribiendo, y tu teléfono no le envía nada mientras lees.
- **Sus mensajes se quedan en ✓** en su teléfono, no en ✓✓ ni ✓✓✓, mientras los lees.
- **Cuando le escribes**, apareces en línea durante dos minutos, y cada mensaje suyo que lees pasa a ✓✓✓ al instante.
- **Tú tampoco lo ves en línea**, ya que tu teléfono no pregunta, ni cuándo estuvo en línea por última vez; y no
  recibe ninguna hora tuya.

Se ajusta para cada chat, solo en este teléfono. Desactívalo de nuevo y verá lo que leíste en tu siguiente consulta al
relay.

### Nombres y eliminar

Abre un chat, toca su nombre y luego **Cambiar nombre** para darle un nombre. El nombre se queda en este teléfono,
sellado con el chat: el otro teléfono no lo ve. Un nombre vacío devuelve el principio de su clave, salvo que uno de tus
contactos esté vinculado a él: entonces vuelve a tomar su nombre la próxima vez que se abra su ficha, mientras el
vínculo siga (ver [Contactos](#contacts)).

**Mi nombre:** en Ajustes → Privacidad y seguridad → **Mi nombre** puedes elegir el nombre que tus contactos ven en lugar de un código. Se dice cifrado, solo a los contactos que aceptaste, y tus grupos privados también lo conocen: allí, quienes no son tus contactos aparecen como «Nombre · 1a2b», con el comienzo de su clave. Si diste a un contacto un nombre propio (**Cambiar nombre**), sigues viendo el tuyo; el que eligió él aparece en sus **Detalles** como «Se hace llamar» y como pista en el campo de renombrar. Cada espacio tiene su propio nombre, y también cada lugar de chats ocultos (en sus ajustes, junto a **Recibir estando cerrados**): un lugar oculto nunca toma el nombre del espacio y empieza vacío, y el mismo nombre en dos de ellos le dice a quien vea ambos que son tuyos. Un nombre tiene 40 caracteres como máximo.

Toca su nombre y luego **Imagen** para darle una imagen que elijas tú, un símbolo sobre un color, en lugar de la
dibujada a partir de su clave. O toca **Foto** (o **Hacer foto**) para una foto: recortada en cuadrado, reducida y
redibujada, para que no quede nada más que su imagen (ni un lugar ni un teléfono), y luego sellada en un archivo propio.
También se queda en este teléfono, y entra en las copias de seguridad; **Imagen a partir de su clave** devuelve la
dibujada.

Cada chat también puede tener su propio aspecto: toca su nombre y luego **Apariencia del chat** para las mismas opciones
que **Apariencia** (estilo, tema, colores, tipo de letra, fondo de pantalla, mensajes y el tamaño de su texto), solo
para ese chat. Un grupo tiene **Apariencia del chat** donde se abre su nombre (en un grupo público, en **⋯**), Chat
conmigo lo tiene arriba{+, y un chat de Matrix, XMPP o Nostr al final, junto a **Notificaciones**}. Como el nombre, se
queda en este teléfono, sellado con el chat. **Como la app** le devuelve el aspecto de la app.

Para guardar un chat fuera de Erevos, toca su nombre y luego **Exportar chat**: sus mensajes van a un archivo de texto,
cada día bajo su fecha y cada mensaje con su hora y quién lo escribió, guardado en la carpeta que elijas (en un
ordenador, donde elijas). El archivo no está cifrado: cualquiera que lo tenga, o cualquier app que lea esa carpeta,
puede leerlo. Las fotos, los archivos y los mensajes de voz solo se nombran, los mensajes que desaparecen se omiten, y
los chats ocultos no se exportan, para que ningún archivo fuera de Erevos muestre que existen.

**Por qué:** un mensaje que desaparece se omite, y también una cita de uno, porque quien lo envió quería que
desapareciera, no que se quedara en un archivo.

Para eliminar un mensaje, mantenlo pulsado y toca **Eliminar**. Para eliminar todos los mensajes de un chat, toca su
nombre y luego **Eliminar mensajes**.
En ambos casos Erevos pregunta dónde:

- **Este teléfono:** solo aquí. El otro teléfono conserva los suyos.
- **Los dos teléfonos:** su teléfono también los elimina, la próxima vez que consulte el relay. Su Erevos lo hace, pero
  una app modificada, una captura de pantalla o una copia todavía pueden conservarlos.

### Eliminar y bloquear un contacto

Toca el nombre de un chat y luego **Eliminar contacto** para olvidarlo: su chat desaparece de este teléfono, y Erevos te
da al instante una nueva cola en el relay. A tus otros contactos se les dice discretamente, en un mensaje sin nada
dentro, y otra vez 7, 14 y 21 días después mientras no hayan escrito a la nueva; lo que escribieron a la antigua
mientras tanto se sigue mostrando durante 14 días. Al contacto eliminado no se le dice, y nada de lo que envíe ahí
aparece. Tu enlace de contacto sigue como estaba, así que todavía puede pedir volver a hablar con él, como solicitud de
mensaje, como cualquiera que lo tenga.

**Por qué:** todos tus contactos escriben en tu única cola, así que la persona que eliminas todavía sabe dónde está; en
cuanto se mueve, ya no puede escribirte ahí, ni tampoco quien envió la basura de más abajo. Tu enlace de contacto nombra
una cola propia, que una eliminación no toca, así que todos los enlaces y códigos QR que diste siguen funcionando.

**Una cola para cada contacto:** en un relay actualizado para ello, cada contacto escribe en una cola propia, que solo
conoce él, dicha dentro de tus mensajes cifrados; la cola de tu enlace de contacto queda entonces solo para los primeros
mensajes. Así el relay no puede saber, por adónde van los mensajes, que dos contactos escriben al mismo teléfono, y
eliminar o bloquear a alguien elimina solo su cola: la tuya solo se mueve si también la conocía, como la conocen los
contactos de antes de esto, y alguien que llegó por tu enlace de contacto antes de su primer movimiento. Los contactos
de antes reciben a su vez una propia, unos pocos cada vez, discretamente, y un Erevos suyo de antes también la acepta.
Estas colas se leen sin token, así que el token, que nombra tu teléfono, no las relaciona; a través de Tor, de ocho en
ocho, cada ocho por circuitos propios. Aun así se crean y se eliminan con el token, así que un relay que guarde
registros puede relacionarlas en ese momento. Los chats ocultos y los ordenadores vinculados mantienen una sola cola
para todos, por ahora. La app web no tiene Tor, así que mientras está abierta espera en las colas de todos tus
contactos a la vez, desde una sola dirección; con las notificaciones con la app cerrada activadas, tu relay también
tiene una dirección push para las colas de todos tus contactos (ver [En un iPhone](#iphone)).

- **Bloquear contacto**, debajo, hace lo mismo, y además descarta lo que envíe después, también una solicitud.
  **Bloquear**, junto a **Rechazar**, bloquea una solicitud de mensaje: una solicitud solo conoce tu enlace de contacto,
  así que mueve tu cola solo mientras el enlace todavía nombre esa, como pasa hasta tu primer movimiento. A quien
  bloqueaste está en **Contactos bloqueados** en **Chat nuevo**, con **Desbloquear**. Volver a añadirlo desde su enlace
  te pide desbloquearlo antes;
  hasta entonces nada lo añade, {~ni su respuesta a una invitación por SMS ni su enlace de contacto|ni siquiera su enlace de contacto} en un grupo. Cada
  persona que escribe desde tu enlace de contacto puede hacer sonar el teléfono, como cualquier mensaje: **Rechazar** o
  **Bloquear** detiene a esa persona, **Notificaciones** → **Silenciado** en su chat la silencia sin rechazarla, y
  **Nuevo enlace de contacto** detiene a quien tenga el enlace antiguo una vez pasados sus 14 días.
- **Grupos:** alguien de uno de tus grupos todavía puede escribirte ahí. Erevos dice en cuántos estáis juntos: sal de
  ellos, o pide a su admin que lo saque.
- **Cuando el relay no está disponible**, la cola cambia en cuanto responde, y hasta entonces nada de lo que envíe
  aparece.
- **Los mensajes programados** que tenías para esa persona se retiran del relay, al instante o en cuanto responda, así
  que nunca salen.
- **Basura:** cuando tu cola se llena de lo que no es para nadie de aquí, Erevos te da una nueva de la misma manera y lo
  dice, como mucho una vez al día. Cuando la basura llena la cola que nombra tu enlace de contacto, recibes en su lugar
  un enlace nuevo. Una avalancha de solicitudes de mensaje inventadas también cuenta como basura, mientras que un lote de
  solicitudes reales sigue llegando.
- **Nuevo enlace de contacto**, en **Mi enlace** de **Chat nuevo**, te da un enlace nuevo: los enlaces y códigos QR
  que diste antes funcionan 14 días más, y luego ya no. Tus contactos no se ven afectados. Si el relay pierde la cola
  que nombra tu enlace, recibes un enlace nuevo de la misma manera, pero los que diste antes dejan de funcionar al
  instante.
- **Enlace para una web**, a su lado, en los chats del espacio, te da un enlace para poner en una página web, como tu
  página de contacto, con el nombre que elijas. Abre una página que ofrece {=Erevos} a quien aún no lo tiene, en Android,
  un iPhone o un ordenador, y luego te añade. Cualquiera que lo vea puede escribirte, así que lo que envíe llega como
  solicitud de mensaje, que aceptas, rechazas o bloqueas. No da un lugar en tu relay y vale mientras valga tu enlace de
  contacto: **Nuevo enlace de contacto** también lo anula.
- **En un ordenador vinculado** va al teléfono, que también lo elimina o lo bloquea y mueve sus colas, también las del
  ordenador. El teléfono guarda quién está bloqueado y se lo dice al ordenador: añadirlo ahí desde su enlace también te
  pide desbloquearlo, y **Desbloquear** también lo desbloquea en el teléfono.
- **En los chats ocultos** solo se mueven las colas de ese lugar, su cola de llamadas al instante, para que el contacto
  eliminado ya no pueda hacer sonar el teléfono. Nada del espacio ni de los otros lugares se mueve.

El **Eliminar** de la ficha del contacto (ver [Contactos](#contacts)) solo quita la ficha, no el chat. Una copia de
seguridad hecha antes de una eliminación o un bloqueo devuelve ese contacto: elimínalo o bloquéalo de nuevo tras
restaurarla. Una vez restaurada, tu cola dice que es más nueva que cualquiera que conozcan tus contactos, y se les dice
otra vez a cada uno, para que todos escriban donde tú lees.

### El menú de un mensaje

Mantén pulsado un mensaje para su menú: las reacciones arriba, y luego lo que puedes hacer con él.

- **Reacciones:** toca una, o **+** para más. Aparece bajo el mensaje en los dos teléfonos, la tuya resaltada; tócala
  otra vez para retirarla. Cada uno de vosotros tiene una reacción por mensaje. Sale al instante, o no sale: cuando ni
  el relay ni su teléfono cercano pueden recibirla, no cambia nada.
- **Responder:** tu siguiente mensaje le responde, y lo muestra citado encima de tus palabras, en los dos teléfonos.
  Toca la cita para ir al mensaje al que responde; **✕** la quita. Un Erevos anterior a esto muestra la respuesta sin la
  cita.
- **Responder en el hilo:** le responde en un hilo, como en un grupo: el hilo se ve solo, con **Hilo** arriba, y lo que
  envías allí le responde. Bajo un mensaje respondido, **n respuestas en el hilo** lo abre; Atrás vuelve a mostrar
  todo el chat. Un Erevos anterior muestra cada respuesta con su cita.
- **Reenviar:** envía una copia a otro chat: elige un contacto, o un grupo. Sus palabras, sticker o lugar van de nuevo,
  una encuesta como una nueva sin respuestas todavía, y el sonido de un mensaje de voz o los bytes de una foto o un
  archivo se envían otra vez, cifrados con una clave nueva, así que nada relaciona la copia con el mensaje del que
  viene. La copia dice **Reenviado** debajo, no de dónde; un Erevos anterior a esto la muestra sin eso. Un mensaje que
  desaparece no se reenvía, y desde los chats ocultos un mensaje solo va a esos mismos chats ocultos.
- **Destacar:** lo destaca, solo en este teléfono, para encontrarlo otra vez: **Mensajes destacados** en el menú de la
  pantalla de inicio los lista de todos tus chats, y los detalles de un chat listan los suyos. Un toque va al mensaje.
  Los mensajes destacados de los chats ocultos solo aparecen en los detalles de sus chats.{~ }{+Los chats de Matrix, XMPP y
  Nostr, y las}{-{~Las}}{~ conversaciones SMS}{+,}{~ también tienen **Destacar**, guardado cifrado solo en este teléfono: los **Mensajes
  destacados** propios de un chat listan los suyos, y los de la pantalla de inicio los listan con todos los demás,
  cada uno abriendo su chat en el mensaje. En esos chats, al mantener pulsada una foto, un vídeo, un mensaje de voz,
  un archivo o la imagen de un MMS también ves **Guardar en la Colección**, y al mantener pulsado un sticker o una
  foto que llegó ves **Añadir a mis stickers**; el selector de stickers de SMS también ofrece los tuyos, para
  enviarlos como MMS.}
- **Fijar:** lo fija arriba del chat, en los dos teléfonos; cualquiera de los dos puede **Dejar de fijar**. Con más de
  uno fijado, se ve el último; tócalo para ir a él, y se ve el siguiente.
- **Copiar:** pone sus palabras en el portapapeles, para pegarlas en otra app. En Android la copia se marca como
  privada, así que el aviso del teléfono sobre ella no muestra las palabras, pero cualquier app que lea el portapapeles
  puede leerlas.
- **Seleccionar:** elige este mensaje, y un toque en otros los añade; una barra ofrece entonces **Copiar**, que pone
  todas sus palabras en un solo texto con la hora y el autor de cada uno, **Reenviar**, que los envía a un chat, y
  **Eliminar**, que pregunta una vez antes de eliminarlos. **Atrás** deja de elegir.
- **Editar:** para un mensaje tuyo, hasta un día después de enviarlo. Sus palabras van al campo bajo **Editar
  mensaje**: cámbialas y envía, o **✕** para dejarlo como estaba. Los dos teléfonos muestran las nuevas palabras, con
  **Editado** junto a la hora. Solo se editan palabras, no un sticker, un lugar, una encuesta, un mensaje de voz, una
  foto ni un archivo, ni palabras que reenviaste. Uno que todavía espera salir sale con las nuevas palabras, sin marca;
  uno enviado para más tarde no se edita. La edición sale al instante, o no sale, como una reacción, y tus dispositivos
  vinculados también la muestran. Un Erevos anterior a esto conserva las palabras antiguas.
  **Por qué:** un día es tiempo suficiente para corregir un error, y nadie puede cambiar lo que dijo hace días. La marca
  muestra que las palabras no son las primeras.
- **Terminar la encuesta:** para una encuesta tuya: ya no cuentan más votos y se ven los resultados finales. Un Erevos
  anterior a esto la sigue viendo abierta, y un voto enviado en ese momento puede contar solo en algunos teléfonos.
- **Eliminar:** en este teléfono, o en los dos, como arriba.

Las reacciones, respuestas, mensajes fijados y ediciones viajan dentro del cifrado, como los mensajes.

### Cómo se ven las palabras

Las marcas escritas alrededor de las palabras cambian cómo se ven, en chats y grupos, como en WhatsApp y Signal:
\`*negrita*\`, \`_cursiva_\`, \`~tachado~\`, una palabra entre acentos graves como código (tres acentos graves
alrededor de líneas para un bloque de código) y \`||palabras||\`, ocultas tras una barra gris hasta que las toques, en la
pantalla, en la línea de la pantalla de inicio y en una cita (allí como ▒▒▒).

- **Solo alrededor de palabras:** una marca cuenta cuando empieza una palabra y termina otra, así que \`2*3*4\`,
  \`snake_case\` y las direcciones web se quedan como están. La negrita, la cursiva y el tachado se quedan en una línea.
- **Los demás ven las marcas:** un Erevos de antes y otras apps muestran las palabras con sus marcas, tal como se
  escribieron.
- **Foto oculta:** bajo **+**, **Foto oculta** envía una foto que se ve borrosa en el chat, en los chats con contactos y
  en los grupos, hasta que la tocas, y entonces se abre sola. En **Multimedia, enlaces y archivos** también se ve
  borrosa. Un Erevos de antes la muestra como cualquier foto.
- **Foto de una sola vista:** bajo **+**, **Foto de una sola vista** envía una foto que nunca se ve en el chat, en los
  chats con contactos y en los grupos. **Cámara, de una sola vista** envía del mismo modo una que tomas en ese
  momento. Quien la recibe la toca y la ve una vez, sola, sin capturas de pantalla donde el teléfono lo permite; al
  cerrarla, Erevos la borra de su teléfono, y el chat dice **Foto vista una vez**. No se puede reenviar{~, guardar ni
  poner en la Colección| ni guardar}, y tu propio teléfono la borra en cuanto les llega. Nada impide una cámara apuntando a la
  pantalla, y un Erevos anterior la muestra como foto oculta.

**Por qué:** una marca escrita en las palabras viaja en ellas, dentro del cifrado, sin nada al lado que la distinga.

### Mensajes temporales

Abre un chat, toca su nombre y luego **Mensajes temporales** para elegir cuánto duran sus mensajes nuevos una vez
leídos: 5 minutos, 1 hora, 1 día o 1 semana. Para que solo desaparezca el siguiente mensaje, toca el cronómetro junto al
campo de mensaje (o **Mensaje temporal** bajo **+**, o **Temporal** en el menú de la flecha de enviar): **Desaparece 1
hora después de leerse** aparece sobre el campo. Toca el tiempo para elegir otro, o **✕** para desactivarlo. Va con el
siguiente mensaje que envíes: palabras, un mensaje de voz, una foto o un archivo, un sticker, un lugar o una encuesta,
ahora o más tarde.{~ Un SMS no puede desaparecer: enviado como SMS, se queda en los dos teléfonos (Erevos lo dice antes),
y el cronómetro vuelve a desactivarse.} Su tiempo empieza cuando el otro teléfono lo muestra en la pantalla, y tu copia
empieza cuando su teléfono lo dice (**✓✓✓**). Cada mensaje dice cuándo desaparece. El otro teléfono conoce el ajuste del
chat la próxima vez que consulta el relay, y cualquiera de los dos teléfonos puede cambiarlo: gana el cambio más
reciente. Los mensajes que ya están en el chat se quedan.

- **Hasta que se lee**, un mensaje temporal se queda en los dos teléfonos, sellado como el resto. Si su {=Erevos} nunca
  dice que lo leyó, tu copia se queda.
- **Mientras Erevos está cerrado:** un mensaje cuyo tiempo ha llegado se elimina la próxima vez que se abre el chat.
  Hasta entonces se queda en el teléfono, sellado como el resto.
- **No es una garantía:** su {=Erevos} los elimina, pero una app modificada, una captura de pantalla o una copia todavía
  pueden conservarlos.

### Bloquear capturas de pantalla

Abre un chat, toca su nombre y luego **Bloquear capturas de pantalla**: en Android, ninguno de los dos teléfonos puede hacer una captura ni una grabación de pantalla del chat mientras se ve, y las apps recientes lo muestran en blanco. El otro teléfono lo sabe con tu próximo mensaje, y cualquiera de los dos puede volver a desactivarlo: vale el cambio más reciente. El chat lo dice cuando la otra persona lo cambia.

**Por qué:** lo que escribes queda entre vosotros dos, salvo que alguien se proponga copiarlo.

- **Solo en Android:** {=Erevos} en un iPhone, en un ordenador, en un navegador o en Sailfish no puede bloquear las capturas de pantalla, y el chat lo dice allí.
- **No es una garantía:** una foto de la pantalla hecha con otra cámara, o una app modificada, lo guarda igualmente.

### Notificaciones de este chat

En Android, abre un chat, toca su nombre y luego **Notificaciones**; en un grupo, toca su nombre (en un grupo público,
**⋯**) y luego **Notificaciones**. **Silenciado** durante 8 horas, 1 semana o **Siempre**: sus mensajes no suenan ni
muestran notificación, así que el icono de Erevos tampoco los cuenta; la lista los sigue mostrando, con una campana
tachada, y sus llamadas siguen sonando. **Sonido de mensaje** y **Tono de llamada** le dan un sonido propio para sus
mensajes y para sus llamadas, de la propia lista de sonidos de Android, o **Sin sonido**. En los detalles de un chat la
fila dice entonces **Silenciado hasta** y la hora, o **Sonidos propios**.

**Por qué:** un chat silenciado sigue contando en la lista, para que no se pierda nada de lo que llegó: solo el
teléfono deja de llamarte a él. Sus sonidos se guardan solo en este teléfono, con el chat en los datos cifrados del
espacio, porque cada teléfono tiene sus propios sonidos: un dispositivo vinculado guarda los suyos, y el otro teléfono
no sabe nada de ellos.

- **En los chats ocultos** solo hay **Silenciado**: un sonido propio le diría a cualquiera cerca qué chat es.{+ Así
  también los chats de las cuentas propias de Matrix, XMPP y Nostr de un lugar oculto: silenciados, no dicen nada, ni
  siquiera «Mensaje nuevo».}
- **Un espacio cerrado, y los chats ocultos mientras están cerrados,** no saben en qué chat llegó un mensaje, así que
  avisan de él como dicen los ajustes de la app.
- **Solo en Android** por ahora: la app web avisa de cada chat como dicen sus ajustes.

### Mensajes de voz

En el chat de un contacto, sin nada escrito, mantén pulsado el micrófono al final de la barra de mensajes mientras
hablas, y suelta para enviar; desliza a la izquierda antes de soltar para descartarlo. Una pulsación de menos de un
segundo se toma por un descuido y no envía nada. Al cabo de un minuto se envía solo. La primera vez, Android pregunta si
Erevos puede usar el micrófono: solo graba mientras lo mantienes pulsado. Con TalkBack, tócalo una vez para empezar y
otra para enviar. Toca un mensaje de voz para reproducirlo, y tócalo otra vez para pararlo. Los mensajes de voz tienen
las mismas marcas que el resto, y siguen el ajuste de mensajes temporales del chat.

**Cambiar mi voz:** en los detalles del chat con un contacto, **Cambiar mi voz** envía tus mensajes de voz en ese chat
**Más grave** o **Más aguda**, igual de largos. Tu teléfono cambia el sonido antes de que salga el mensaje, así que tu
propia voz nunca sale de él; si el cambio falla, el mensaje no se envía. Solo tu teléfono conoce el ajuste. Hace tu
voz difícil de reconocer de oído, pero alguien con la grabación y tiempo podría deshacer parte. En Android 10 y
posteriores, y en navegadores que hacen Opus ellos mismos (WebCodecs); el walkie-talkie mantiene tu voz.

**En palabras:** mantén pulsado un mensaje de voz, en el chat de un contacto o en un grupo, y elige **En palabras**:
tu teléfono escribe lo que se dijo, para leerlo o copiarlo. La primera vez descarga un modelo de voz de 268 MB, cuando
tú lo digas, del propio servidor de Erevos, que ve tu dirección como en cualquier descarga; después todo se hace en tu
teléfono, y ni el sonido ni sus palabras salen de él. Entiende unos cien idiomas, el griego entre ellos, y reconoce el
que se habla. Puede equivocarse, y las palabras no se guardan. **Borrar el modelo de voz**, debajo, libera el espacio.
Solo en Android, y necesita un teléfono con unos 2 GB de memoria libre, pues mientras escribe ocupa unos 1,5 GB; si
falla, el siguiente intento vuelve a abrir el modelo. Donde nadie habla, en silencio o con ruido, no escribe nada, en
vez de palabras que nadie dijo.

**Habla para escribir:** toca el micrófono junto al campo del mensaje, en un chat o un grupo, y elige **Habla para escribir**: desde entonces, al mantener pulsado el micrófono escucha en vez de grabar un mensaje de voz, hasta que elijas **Mensaje de voz** en el mismo menú. Habla; toca **Hecho**, y tus palabras se escriben en el campo, para cambiarlas antes de enviarlas. Usa el mismo
modelo de voz que **En palabras**, descargado una vez cuando lo dices, y todo se hace en tu teléfono: ni tu voz ni sus
palabras salen de él, y el sonido no se guarda. Escucha hasta dos minutos y puede cometer errores. Solo en Android.

**Traducir:** mantén pulsado un mensaje, en el chat de un contacto o en un grupo, y elige **Traducir**: tu teléfono lo
traduce a tu idioma, para leerlo o copiarlo, entre griego, inglés, alemán, español, francés e italiano. Adivina el
idioma del mensaje; toca otro bajo **De** o **A** para cambiar cualquiera de los dos. La primera vez para un idioma
descarga sus modelos de traducción, de 60 a 95 MB cada uno, cuando tú lo digas, del propio servidor de Erevos, que ve tu
dirección como en cualquier descarga; dos idiomas que no son el inglés pasan por el inglés, con un modelo para cada
uno. Después todo se hace en tu teléfono, y ni el mensaje ni su traducción salen de él. Los modelos son OPUS-MT, de la
Universidad de Helsinki (CC-BY 4.0). Puede equivocarse, y la traducción no se guarda. **Borrar los modelos de
traducción**, debajo, libera el espacio. Solo en Android.

**Por qué:** en Android 10 y posteriores, en la app web y en un ordenador, un mensaje de voz es Opus a 32 kbit/s, unos
240 KB por minuto, como los envían Telegram, Element y Conversations: tan claro como puede ser el habla. En Android 9 y
anteriores, y en Safari antes de iOS 18.4 y macOS 15.4, es AAC a 64 kbit/s, unos 480 KB por minuto. Más no se oiría en
una voz, pero tardaría más en enviarse, sobre todo por Bluetooth. Todos los Erevos reproducen ambos: Safari antes de
18.4 reproduce Opus cuando Erevos lo reempaqueta para él, y donde un navegador no puede reproducir uno, Erevos lo dice.

- **Por el relay, o cerca,** cifrados de extremo a extremo como las palabras, en varios trozos. Nadie entre medias puede
  oírlos, pero por los trozos el relay, o quien escuche cerca, puede saber que se envió algo largo, y más o menos de
  qué duración. Cerca solo van al teléfono de un contacto que se sabe que está cerca.
- **En el teléfono** cada sonido se guarda en un archivo propio, sellado con su propia clave, que solo tiene el
  historial sellado del chat. Cuando el mensaje desaparece, eliminado, temporal o por ser el más antiguo, su archivo
  también. Cuántos de estos archivos hay, y sus tamaños, muestran más o menos cuántos mensajes de voz guarda el
  teléfono, en todos sus espacios juntos, no en cuál.
- **Mientras se reproduce**, el sonido queda sin sellar en la caché de Erevos, y se elimina en cuanto se detiene. Si
  Erevos se cierra mientras graba o reproduce, lo que quedó desaparece la próxima vez que se abre un chat.

### Fotos y archivos

En el chat de un contacto, toca **+** junto al campo de mensaje, que se abre donde estaba el teclado, y luego **Foto**
para elegir una de las fotos del teléfono, **Cámara** para hacer una, o **Archivo** para cualquier otra cosa, hasta 100
MB. Debajo, **Calidad de la foto** fija cómo van las fotos, y Erevos lo recuerda:

- **Original** (por defecto): la foto exactamente como era, a tamaño completo, sin perder calidad. Solo se quita lo que
  dice aparte de su imagen: dónde se hizo, el teléfono, la hora, las miniaturas. Su nombre es solo "photo".
  Una foto enviada con **Archivo** (JPEG, PNG, GIF o WebP, hasta 64 MB) también va sin eso, con su propio nombre; con un
  archivo HEIC o AVIF, o uno mayor, Erevos pregunta antes, porque no puede quitárselo.
- **90%** y **75%:** una foto nueva, más pequeña, más rápida de enviar, que no dice nada más que su imagen.

Sus fotos y archivos de hasta 16 MB llegan solos; toca uno más grande para recogerlo. Toca una foto para verla en toda
la pantalla, con su tamaño: dos dedos o un doble toque la amplían, un dedo la mueve mientras está ampliada, y un toque
oculta o muestra lo que hay alrededor. Toca un archivo para guardarlo. Erevos gira con el teléfono mientras **Girar
automáticamente** está activado en él, y una foto vista sola gira incluso cuando está desactivado. **Guardar** pone
una copia en una carpeta que eliges la primera vez, y **Guardar en otra carpeta** la cambia. Las fotos y los archivos
tienen las mismas marcas que el resto, y siguen el ajuste de mensajes temporales del chat.

- **Abrir con otra app:** un archivo que no es una foto tiene también **Abrir**, en Android: la app del teléfono para su
  tipo, un lector de PDF por ejemplo, lo lee de la memoria de Erevos, sin que quede una copia en el teléfono, y el
  enlace se suelta al abrir el siguiente archivo o al bloquearse el espacio. Erevos pregunta primero, pues esa app está
  fuera de Erevos y de su cifrado, y nunca abre así páginas web, dibujos ni paquetes de apps, que podrían conectarse a
  internet fuera de Tor: guárdalos en su lugar.
- **Cómo viajan:** cada archivo se cifra en el teléfono con una clave propia, en trozos todos del mismo tamaño, y se
  pone en tu relay. Solo dónde están los trozos y la clave van al contacto, cifrados de extremo a extremo. Su teléfono
  recoge los trozos a través de su propio relay, así que tu relay nunca ve la dirección de su teléfono, comprueba cada
  trozo, y luego los elimina del relay. Los trozos que nadie recoge se eliminan a los 14 días.
- **Lo que ve el relay:** cuántos trozos hay y su tamaño, así que más o menos lo grande que es el archivo, y cuándo. No
  lo que es ni para quién.
- **Un archivo va tal cual,** con lo que diga dentro: el autor de un documento, o el lugar y el teléfono de una foto si
  la envías con **Archivo**. Envía las fotos con **Foto**.
- **En el teléfono** cada archivo se guarda en sus trozos, tal como viajaron, sellado con su propia clave, que solo
  tiene el historial sellado del chat. Cuando el mensaje desaparece, sus trozos también. Cuántos trozos hay muestra más
  o menos cuánto guarda el teléfono, en todos sus espacios juntos, no en cuál. Una foto se muestra desde la memoria,
  nunca se escribe sin sellar. El selector de fotos del teléfono entrega una copia en la caché de Erevos, que se
  elimina en cuanto se lee, y una foto hecha aquí no se guarda en las fotos del teléfono.
- **Las fotos y archivos guardados** están fuera de Erevos, sin sellar: cualquiera con el teléfono puede abrirlos.
- **Solo por el relay:** los archivos necesitan su almacén de archivos, aunque el contacto esté cerca. Un relay más
  antiguo que esta versión no puede recibir archivos: actualízalo.

### Más bajo +

Bajo **+** hay más cosas que enviar aparte de fotos y archivos (la carita al final del campo de mensaje también abre
los stickers):

- **Sticker:** uno de los 576 stickers que trae Erevos, en 24 grupos de 24 (entre ellos **Lunas**, **Perros**,
  **Grecia**, **Frases** y **Antojos**), dibujados por cada teléfono: solo viaja su nombre, así que nunca se descarga
  nada. Un Erevos anterior a esto muestra su emoji en su lugar. Todos menos las frases y los antojos se mueven un poco
  durante unos segundos al llegar y al tocarlos, y luego se quedan quietos; con el ajuste de reducir el movimiento del
  teléfono activado, se quedan quietos. Las frases aparecen en el idioma de la app.
- **Como imagen:** en un chat de otra red que solo acepta imágenes, un sticker de los que trae Erevos va en su lugar
  como su imagen: 512 por 512 con fondo transparente, dibujada en tu teléfono o tu ordenador con las mismas formas,
  quieta, con sus palabras en el idioma de la app. No se descarga nada para hacerla.
- **Míos**, entre los stickers, contiene los que haces a partir de fotos. **Nuevo sticker a partir de una foto** recorta
  uno en cuadrado, lo reduce (512 por 512, unos 100 KB como mucho) y solo conserva su imagen, nada de dónde ni con qué se
  hizo. Se guarda sellado en el espacio, o en los chats ocultos donde se hizo, y solo aparece ahí, hasta 100; mantén
  pulsado uno para eliminarlo. Como el resto, entra en una copia de seguridad, sellado, y nunca va a los otros
  dispositivos de la cuenta. Va como va una foto, cifrado de extremo a extremo por el relay, marcado como sticker, así
  que aparece solo, sin burbuja; un Erevos anterior a esto lo muestra como una foto. Mantén pulsado un sticker que te
  hayan enviado y toca **Añadir a mis stickers** para guardarlo.
- **Ubicación** (en Android): envía dónde estás, una vez, como un lugar. La primera vez, Android pregunta si Erevos
  puede usar la ubicación. El teléfono busca por todas las vías que tiene a la vez: por satélite, cuando permitiste la
  ubicación precisa, y por su ubicación de red, que en muchos teléfonos pregunta a Google o al fabricante del teléfono. Se
  abre en seguida una hoja que dice que está buscando; en interiores, donde los satélites se ven mal, eso puede tardar
  hasta un minuto. Si no llega nada a tiempo, ofrece el lugar que el teléfono encontró en los últimos diez minutos,
  diciendo hace cuánto, o dice por qué no se encontró ninguno, con **Volver a intentarlo** y la pantalla del teléfono que
  lo cambia. Erevos solo mira cuando tocas, te muestra el lugar antes de enviarlo, y no te sigue después. El mensaje solo
  contiene las coordenadas, cifradas de extremo a extremo; en Erevos no se carga ningún mapa. **Abrir en mapas** pasa el
  lugar a tu app de mapas, que puede cargar su mapa de internet. Un Erevos anterior a esto muestra las coordenadas como
  palabras.
- **Tarjeta de contacto:** envía un contacto de los contactos de tu teléfono como tarjeta, con su nombre, números y
  direcciones de correo, cifrados de extremo a extremo. La otra persona ve la tarjeta con **Añadir a contactos**; un
  Erevos anterior a esto la muestra como palabras. En los chats ocultos eliges solo entre los contactos guardados en el
  lugar oculto, nunca los del teléfono.
- **Encuesta:** una pregunta con dos opciones o más, hasta 12, y, con **Más de una respuesta**, más de una para elegir.
  Toca una opción para elegirla, y otra vez para retirarla; cada opción muestra cuántos la eligieron, y quiénes. Los
  votos viajan dentro del cifrado, como las reacciones. Un Erevos anterior a esto muestra la pregunta y sus opciones
  como palabras, para responder con palabras.
- [~] **Solicitud de pago** (pedida desde otra app, como Fasouli): un importe y para qué, como tarjeta. Quien la recibe toca
  **Pagado** cuando paga, y tu teléfono lo sabe; no se puede deshacer. Luego **Marcar en Fasouli**, en Android, la marca
  cobrada allí. Erevos no mueve dinero ni conoce ningún banco: la tarjeta solo dice lo que se pidió. Solo en chats con
  un contacto, nunca en ocultos. Un Erevos anterior muestra el importe como texto.

**Por qué:** un paquete de stickers descargado de internet le diría a un servidor que este teléfono tiene {=Erevos}, así
que los stickers vienen incluidos y solo viajan sus nombres. Los tuyos se listan en un único valor sellado del mismo
tamaño para cada espacio y lugar oculto, se use o no, así que una lista en uso parece igual que una que no lo está: 100
es lo que cabe. Un lugar solo se envía desde Android: en un ordenador o en la app web, el navegador preguntaría a un
servicio externo dónde está.

### Vistas previas de enlaces

Un enlace en un mensaje aparece subrayado, y solo se abre cuando lo tocas y lo confirmas. Con **Vistas previas de
enlaces** activado, en los detalles de un chat, un enlace que envías va con su vista previa: al enviarlo, este teléfono
descarga la página y toma su título, una línea sobre ella y una imagen pequeña, y van dentro del mensaje, cifrados de
extremo a extremo. El teléfono que lo recibe no descarga nada: muestra lo que llegó. Está desactivado salvo que lo
actives, y entonces está activado para todos los chats del espacio;
cada lugar de chats ocultos tiene su propio interruptor, en los detalles de un chat de ahí.

**Por qué:** solo el teléfono que envía descarga la página, así que el teléfono que recibe un enlace no contacta con
ningún sitio elegido por otra persona, y no le muestra a ese sitio nada de sí mismo, ni siquiera su dirección.

- **El sitio ve la dirección de internet de este teléfono**, y cuándo, como la vería desde un navegador, pero no para
  quién es el mensaje. Con **Por Tor** activado, en **Vistas previas de enlaces**, la página y su imagen se descargan
  solo por Tor, diga lo que diga el ajuste de Tor del espacio, así que el sitio no ve la dirección. Eso es más lento y
  espera mientras Tor arranca; una página que te manda a otra parte, o que no deja entrar a Tor, no tiene vista
  previa. Mientras todo lo del espacio va por Tor (**Todo** en Tor), las vistas previas se hacen solo con **Por Tor**
  activado.
- {=Erevos} en un ordenador no hace ninguna, pero muestra igualmente las que llegan.
- **Por LoRa**, que solo lleva poco, un mensaje va sin su vista previa en lugar de esperar, y aquí no guarda ninguna.
- Una vista previa es lo que la página dice de sí misma, sea cierto o no. Un Erevos anterior a esto muestra el enlace
  sin ella.

### Llamadas de voz y vídeo

En el chat de un contacto, toca el auricular verde de arriba para una llamada de voz, o la cámara azul de al lado para
una videollamada. La primera vez, Android pregunta si Erevos puede usar el micrófono, y la cámara para el vídeo. Su
teléfono suena mientras {=Erevos} está abierto ahí, en cualquier pantalla del espacio: toca **Responder** o **Rechazar**.
Durante la llamada puedes silenciar, cambiar al altavoz, apagar tu cámara, alternar entre la cámara frontal y la
trasera, y **Colgar**. Cada llamada deja una línea en el chat, como cuánto duró, o una llamada perdida.

- **Responder con vídeo o solo con voz:** una llamada que suena ofrece **Responder**, solo con voz, y **Responder con
  vídeo**, en las llamadas de Erevos{+ y en las de XMPP y Matrix}; en una llamada de grupo son **Unirse** y **Unirse con
  vídeo**. Una videollamada respondida solo con voz empieza con tu cámara apagada.
- **Adónde va el sonido** (Android): con unos auriculares Bluetooth o con cable conectados, **Altavoz** pasa a ser
  **Salida de audio**: muestra adónde va ahora el sonido, **Teléfono**, **Altavoz**, **Auriculares** o **Bluetooth**, y un
  toque los muestra todos, unos auriculares Bluetooth con su propio nombre, para elegir. Unos auriculares conectados al
  empezar la llamada, o durante ella, se quedan con el sonido, como en una llamada de teléfono, y encender la cámara lo
  deja ahí; cuando se desconectan, el sonido vuelve al teléfono, o al altavoz en una videollamada.
- **Activar la cámara después:** **Activar cámara**, en la pantalla de la llamada, funciona cuando la app del otro lado
  puede cambiar una llamada mientras dura; una llamada de grupo queda como entraste.
- **Añadir vídeo a una llamada de voz:** en una llamada de voz de Erevos, **Añadir vídeo** enciende tu cámara cuando la
  otra persona dice que sí; si dice que no, la llamada sigue siendo de voz.
- **Tu propia imagen:** en una videollamada tu cámara llena la pantalla hasta que llega la imagen del otro; luego pasa
  a una ventana pequeña en la esquina superior, en ambos teléfonos, para que cada uno vea al otro y a sí mismo.
- **Cambiar de cámara:** **Girar** pasa a la siguiente cámara. En un ordenador solo aparece cuando hay más de una
  cámara.
- **Cómo se conecta la llamada:** mantén pulsada un momento la pantalla de la llamada para ver cuánto sonido del otro
  se perdió o hubo que rellenar, lo que se oye como cortes, cuántas veces pasó, el tiempo de ida y vuelta, el camino de la
  llamada y cuánto tardó en sonar y en conectarse. Un toque lo cierra. Se mide solo en tu teléfono y ayuda a saber por
  qué una llamada suena mal.

**Una llamada a un teléfono que tarda en recibirla:** cuando su teléfono recibe tu llamada tarde, por ejemplo porque
lee por Tor, **Llamando…** se ve hasta un minuto y cuarto, y en cuanto suena allí, suena durante 45 segundos desde
entonces, para que una llamada que llegó tarde no suene en su teléfono solo para parar enseguida. Su teléfono además
lee una llamada antes de todo lo que tiene que enviar, y tras un cambio de red (de Wi-Fi a datos móviles) vuelve a
esperar llamadas de inmediato.

**Una llamada normal por la red móvil:** cuando un contacto tiene su número de teléfono vinculado, o está vinculado a
uno de tus contactos con número (**Vincular a uno de mis contactos** en su chat, primero un número de móvil), el teclado
naranja de arriba de su chat, antes de la cámara, abre un teclado con ese número escrito{~, y lo mismo hace el de arriba
de una conversación SMS}. Es {~el **Teléfono** de Erevos cuando Erevos es la app de teléfono, o si no |}el del propio
teléfono: toca ahí la tecla de llamar. Una llamada así va por la red de la compañía telefónica y no está cifrada{~, igual
que un SMS normal}. Los chats ocultos y los ordenadores no la tienen.

- **Cifrado de extremo a extremo:** la llamada se establece con mensajes por el relay, cifrados como el resto. Estos
  llevan la clave que cifra la propia llamada, así que nadie entre medias puede escuchar, ni siquiera el relay de
  llamadas de más abajo.
- **Por el relay de llamadas:** un relay configurado con el kit de \`deploy/relay\` tiene un relay de llamadas al lado.
  La llamada va a través de él, así que ningún teléfono conoce la dirección IP del otro. Por Wi-Fi o datos móviles, en
  cualquier sitio.
- **Sin relay de llamadas** (un relay en tu propio ordenador, por ejemplo), Erevos pregunta antes: la llamada va
  entonces directamente entre los teléfonos, solo funciona en la misma Wi-Fi, y cada teléfono ve en ella la dirección
  del otro.
- **Sin internet:** en la misma Wi-Fi, en el punto de acceso de un teléfono, o en la Wi-Fi que crean dos teléfonos
  (Wi-Fi Direct), con un espacio abierto en los dos, una llamada no necesita ningún relay: se establece por el enlace de
  cerca y va directamente entre los teléfonos (u ordenadores). Lo mismo vale para los mensajes de grupo
  y las llamadas de grupo.
- **En segundo plano (Android):** mientras un espacio está abierto, Erevos sigue funcionando cuando sales de él, con
  Inicio, con Atrás en su primera pantalla o quitándolo de las apps recientes, con un aviso discreto, «Erevos – Ready
  for calls and messages», que no aparece en la pantalla de bloqueo. Espera en el relay y en los enlaces a teléfonos
  cercanos, así que los mensajes llegan: un aviso solo dice «New message», o cuántos llegaron, y en un teléfono
  bloqueado solo «Erevos». Una solicitud de mensaje, de alguien que solo tiene tu enlace de contacto, hace el mismo
  aviso y sonido, y cuenta en el icono, como cualquier mensaje. Una llamada suena con el tono del teléfono y un aviso,
  «Incoming call» (o «Incoming video call») – «Open Erevos to answer», sin nombre, también sobre la pantalla de bloqueo
  y el salvapantallas, y la pantalla se enciende. Tócalo para responder. Con el bloqueo con contraseña activado, una
  llamada que suena aparece antes de la contraseña, y Erevos se bloquea en cuanto termina. Bloqueado, el espacio sigue
  detrás de la pantalla de la contraseña, así que los mensajes y las llamadas siguen llegando, y una llamada aparece
  sobre la pantalla de la contraseña. Solo llegan así los chats y grupos de ese espacio, y los chats ocultos con
  **Recibir estando cerrados** activado; los demás chats ocultos solo dicen que llegó un mensaje, o suenan sin nombre,
  si lo permites (ver Chats ocultos). Ajústalo en **Ajustes** → **Notificaciones** → **En segundo plano**: **Recibir y
  sonar** (por defecto) o **Solo mientras Erevos está a la vista**, y **Avisar de mensajes nuevos** (por defecto) o
  **Sin aviso**, que vale también mientras Erevos está a la vista. Ahí también, si Android los pide, **Seguir
  funcionando con ahorro de batería** y **Mostrar llamadas sobre la pantalla de bloqueo**. Debajo, **Solo lo que se
  desperdicia** (la opción por defecto), **Y los teléfonos cercanos** y **Y el sueño** deciden cuánta batería ahorra en
  segundo plano: la segunda apaga también las radios para teléfonos cercanos mientras Erevos está en segundo plano, la
  tercera deja dormir también al teléfono, así que Erevos mira el relay una vez por minuto y un mensaje o una llamada
  puede llegar uno o dos minutos tarde.
- **Y el sueño ligero:** una cuarta opción allí, entre **Y los teléfonos cercanos** e **Y el sueño**. El teléfono puede dormir, pero Erevos deja abierta su espera en el relay, así que lo que llega despierta al teléfono y un mensaje o una llamada sigue llegando al instante donde la red y Android lo permiten; Erevos también mira por sí mismo cada pocos minutos. Es nueva y aún no se ha probado en muchos teléfonos: si con ella los mensajes llegan tarde, elige otra.
- **El número en el icono:** con **Avisar de mensajes nuevos** activado, cuando sales de Erevos con mensajes sin leer
  en los chats y grupos del espacio abierto, el aviso se queda, sin sonido, y dice cuántos son, con los que avise
  después; se va mientras Erevos está a la vista, y vuelve al salir, hasta que los hayas leído. No cuenta los mensajes
  de un chat silenciado (ver Notificaciones de este chat), ni los de uno oculto al salir. El launcher de Android lo
  muestra en el icono de Erevos, como un número o, en algunos teléfonos, como los Pixel, como un punto. **Ajustes** →
  **Notificaciones** → **Número en el icono** lo desactiva: entonces el aviso solo habla de lo que llegó desde la
  última vez que tuviste Erevos abierto, y el número del launcher se va con él. Un mensaje eliminado para todos antes
  de que lo leas, o leído en un ordenador vinculado, ya no cuenta.

  **Por qué:** en Android solo un aviso puede poner un número en el icono de una app, así que el aviso se queda
  mientras esperan mensajes; no dice más que cuántos son, como siempre.
- **Un espacio que está cerrado:** no recibe nada, ya que su clave solo está en memoria mientras está abierto: sus
  mensajes esperan en su relay y llegan cuando lo abres. Salvo que elijas, en ese espacio, **También mientras otro
  espacio está abierto** en **Ajustes** → **Notificaciones** → **En segundo plano** (por defecto es **Este espacio solo
  mientras está abierto**): entonces, mientras otro espacio está abierto y recibe, solo dice «New message», o cuántos
  llegaron, con el mismo aviso que ese espacio, nunca qué espacio, y sus chats ocultos no dicen nada. Lo que otros
  teléfonos llevaron a su relay cuenta como mensaje, también las eliminaciones, y un mensaje que se le envía sin sonido
  suena como siempre (ver **Enviar sin sonido**). Para ello el teléfono guarda las direcciones de sus colas en su relay
  fuera de su contraseña, entre ellas la cola en la que escribe cada uno de sus contactos, hasta 64 contactos, nunca sus
  claves, quiénes son sus contactos ni sus mensajes, y solo pregunta al relay cuántos llegaron, nunca los pide: se
  quedan ahí hasta que se abre el espacio. A un espacio que va por Tor (**Mensajes** o **Todo**, en **Qué va
  por Tor**) solo se le pregunta a través de Tor: mientras el espacio abierto tiene Tor desactivado, o su Tor se
  está iniciando o acaba de fallar, el espacio cerrado no dice nada, y lo que llegó se avisa en cuanto Tor está listo
  ahí.

  **Por qué:** un espacio tras una segunda contraseña no debe mostrar que existe, así que esto está desactivado salvo
  que lo actives, y entonces no dice más de lo que diría el espacio abierto. Si se le preguntara directamente desde el
  teléfono mientras otro espacio está abierto, su relay o alguien que vigile la red podría relacionar los dos espacios
  por la dirección de internet del teléfono. Como cada contacto escribe en una cola propia, el espacio tiene que
  preguntar también por cada una de ellas, o sus mensajes no dirían nada. El precio es que su relay puede saber que los
  dos espacios están en un mismo teléfono, y alguien que examine el teléfono con herramientas puede descubrir que un
  segundo espacio guarda direcciones ahí, y cuántos contactos tiene.
- **Un punto para los otros espacios:** en un espacio con **También mientras otro espacio está abierto**, **Punto en
  los otros espacios**, debajo (por defecto es **Sin punto**), muestra además un pequeño punto en el candado sobre los
  chats del espacio abierto, en cuanto llegó un mensaje a este mientras estaba cerrado, hasta que lo abras: nunca
  cuántos, ni qué espacio. Funciona donde funciona el aviso: en Android, mientras el espacio abierto tiene **Recibir y
  sonar** y **Avisar de mensajes nuevos** activados. Para ello el teléfono guarda, junto a las direcciones de arriba,
  solo si llegó un mensaje. Quien vea los chats del espacio abierto ve también el punto, y puede sospechar que hay
  otro espacio.
- **Cuando se enciende el teléfono:** después de que el teléfono arranca, Erevos no funciona hasta que lo abres. Con
  **Iniciar al encender el teléfono** en **Ajustes** → **Notificaciones** → **En segundo plano** (por defecto es
  **Esperar a que yo lo abra**), se inicia solo tras encender el teléfono, o tras actualizar Erevos, sin ningún
  espacio abierto: ningún espacio puede abrirse sin su contraseña, ya que Erevos no guarda ninguna clave en el
  teléfono. Entonces los espacios con **También mientras otro espacio está abierto** ya dicen «New message», o cuántos
  llegaron, nunca qué espacio, ni quién o qué, y un aviso discreto dice «Locked». Las llamadas no suenan, y nada más
  llega, hasta que abras un espacio; los espacios que van por Tor no dicen nada hasta entonces. Si no hay ningún
  espacio así, o con **Sin aviso**, solo un aviso discreto dice que está bloqueado, y al tocarlo se abre
  Erevos. Solo en Android.

  **Por qué:** tras un reinicio, Erevos no podía decirte que había mensajes esperando hasta que por casualidad lo
  abrías. Sin tu contraseña sigue sin poder leerlos, así que no dice más de lo que dice un espacio cerrado.
- **Donde no puede sonar:** detenido por Android (o por el ahorro de batería del teléfono, o por el ajuste propio del
  fabricante), después de reiniciar el teléfono hasta que abras Erevos y el espacio una vez, en otro espacio (solo dice
  que llegó un mensaje, si lo permites, como arriba), o en un ordenador o en la app
  web mientras están cerrados. Una llamada ahí aparece como llamada perdida en cuanto Erevos se abre. Cuando Android
  cierra Erevos mientras recibe y lo vuelve a iniciar, como suele hacer, un aviso discreto lo dice: abre Erevos y el
  espacio para volver a recibir. Tras **Forzar detención**, con el uso de batería en Restringido, o cuando el ajuste
  propio del fabricante lo cierra, Android no vuelve a iniciar nada, así que ningún aviso lo dice: el aviso «Erevos»
  simplemente desaparece, y nada suena hasta que abras Erevos. **Permisos** (más abajo) avisa de antemano si alguno de
  estos está configurado. Lo mismo hace otro aviso, «Locked», cuando el espacio que recibía se cierra (tras restaurar
  una copia de seguridad, por ejemplo) y Erevos deja la pantalla pidiendo la contraseña. Una solicitud de mensaje no
  puede llamarte hasta que la aceptes.
- **Permisos (Android):** **Ajustes** → **General** → **Permisos** muestra lo que Android deja hacer a Erevos para las
  llamadas y los mensajes en segundo plano (avisos, el aviso de llamada y que aparezca en pantalla, el aviso de
  mensajes, con sus avisos «Messages without sound» y «Messages with a chat's own sound», que también mantienen el
  número en el icono, llamadas sobre la pantalla de bloqueo, funcionar con ahorro de batería, funcionar en segundo plano
  sin el uso de batería en Restringido, no pausarse si no se usa, datos móviles en segundo plano, el micrófono) y para
  otras cosas (el sonido de mensajes nuevos, avisos en la pantalla de bloqueo, llamadas a pesar de «No molestar»,
  cámara, teléfonos cercanos, contactos, horas exactas para {~los SMS enviados más tarde y |}los recordatorios, el aviso de
  recordatorios una vez que llegó un recordatorio), cada uno con su porqué y un botón que abre la pregunta o el ajuste
  del propio Android. También dice cuándo el teléfono está en silencio o en vibración, cuándo está activado el ahorro
  de batería, y cuándo está activado «No molestar» sin dejar pasar las llamadas de Erevos. En teléfonos Huawei, Honor,
  Xiaomi, OPPO, realme, OnePlus, vivo, Samsung y ASUS también dice dónde está el ajuste propio del fabricante, que
  Erevos no puede leer: toca **Ya lo hice** una vez configurado. Tras cada versión nueva, y la primera vez, se abre
  solo cuando las llamadas o los mensajes necesitan algo. En la app web muestra lo que permite el navegador, ver
  [En un iPhone](#iphone).
- **Una llamada a la vez.** Una llamada sigue mientras te mueves entre pantallas del espacio. Termina cuando el espacio
  se cierra, y una llamada en los chats ocultos cuando estos se cierran, cosa que no hacen durante una llamada. Quitar
  Erevos de las apps recientes también termina una llamada.
- Las llamadas no van por un teléfono cercano ni por Bluetooth. Ahí, **Talkie** bajo **+** convierte el chat en un
  walkie-talkie, y **Talkie activado** aparece sobre el campo: mantén pulsado el walkie-talkie al final de la barra
  mientras hablas, suelta, y se reproduce en su teléfono según llega, si el chat contigo está abierto
  ahí; si no, espera como mensaje de voz. Es un mensaje de voz más pequeño (unos 3 KB por segundo), así que va a todas
  partes adonde va un mensaje, Bluetooth incluido.

**Por qué:** las claves que abren los mensajes de un espacio solo están en memoria mientras está abierto, y selladas
tras su contraseña el resto del tiempo. Así que después de reiniciar el teléfono no se puede leer nada y nada suena
hasta que abras Erevos y el espacio una vez; y los chats ocultos, cuya clave solo está en memoria mientras están
abiertos salvo que **Recibir estando cerrados** la guarde con el espacio, si no solo dicen que llegó un mensaje, o
suenan sin nombre, si lo permites.

> Los ajustes del relay, tu cola, tus contactos y sus nombres, las claves de tus conversaciones y los mensajes se
> guardan en este espacio, sellados. El historial no tiene límite: se guarda en páginas selladas del mismo tamaño,
> mezcladas con las páginas de los otros espacios y chats ocultos, así que solo se ve cuánto ocupan todas juntas, no de
> quién son. El resto se guarda con el mismo tamaño para cada espacio y chats ocultos, se use o no; lo que es más grande
> va a páginas como las del historial, entre ellas. Los mensajes eliminados pueden quedarse un tiempo en el
> almacenamiento del teléfono, sellados como el resto, hasta que algo se escribe encima. Los mensajes enviados o
> recibidos de cerca se guardan de la misma manera.

## Chats de grupo {#groups}

Desde el menú de la pantalla de inicio, **Grupo nuevo**: dale un nombre, marca los contactos a los que invitar, y toca
**Crear el grupo**. Eres su admin. El teléfono de cada contacto responde solo la próxima vez que {=Erevos} esté abierto ahí,
y se une: el grupo aparece entonces en su pantalla de inicio, con una nota de quién lo añadió. Un teléfono solo se une a
un grupo cuyo admin es el contacto que se lo pidió, y un admin solo deja entrar a un contacto como sí mismo, nunca como
otra persona. Los grupos van por el relay, así que tiene que estar configurado.

**Por qué:** solo el teléfono del admin cambia el grupo (quién está en él, su nombre), así que ningún servidor tiene que
ordenar los cambios: todos los teléfonos los toman de ese. Por eso un miembro sale pidiéndoselo al admin, y solo el admin
añade o saca miembros.

- **A quién se puede invitar:** contactos que has aceptado, en este espacio. Los miembros que no son contactos entre sí
  igualmente hablan en el grupo, y aparecen por el principio de su clave.
- **Añadir como contacto:** en la lista de miembros (**⋯**), **Añadir como contacto** bajo un miembro que no es tu
  contacto le pide, en un mensaje que solo recibe esa persona, su enlace de contacto, y le da el tuyo. En su teléfono la
  petición aparece una vez, arriba del grupo, y toca **Enviar** o **No enviar**; si toca **No enviar**, no se te dice.
  En cuanto lo envía sois contactos el uno del otro, con un chat propio, y **Nombre** le da un nombre, como lo hace bajo
  cualquier contacto que todavía no tenga uno. Que no haya respuesta puede significar que aún no ha abierto el grupo,
  que dijo que no, que tiene un {=Erevos} más antiguo, o que todavía te tiene como contacto, lo que no le muestra nada;
  pasada una semana puedes volver a pedirlo. En cuanto sois contactos el uno del otro, en cualquier grupo o por un
  enlace de contacto, lo que se pidió en vuestros otros grupos desaparece, y su petición ya no aparece. Un miembro
  sacado del grupo ya no pide nada. Si dos miembros muestran la misma clave, uno de ellos no es quien dice ser, y ningún
  enlace de contacto va a ninguno de los dos ni se toma de ninguno. No en los grupos públicos. Pedirlo es cosa del
  teléfono que tiene la cuenta; **Nombre** también funciona en un dispositivo vinculado.
- **Cifrado de extremo a extremo para el grupo:** MLS (RFC 9420). Cada mensaje se cifra una vez para el grupo, y luego
  se sella otra vez para cada miembro, así que lo que llega a la cola de cada miembro no se parece a nada de lo que
  reciben los demás, y ningún relay puede saber quién está en un grupo. Va directamente a la cola de cada miembro, a
  través de tu relay. Cada semana las claves de cada teléfono en el grupo se renuevan, las del admin por sí solas y las
  de cada miembro a través del admin, así que unas claves sacadas una vez de un teléfono dejan de leer el grupo.
- **Miembros:** toca el nombre del grupo arriba, o **⋯** a su lado. El admin añade contactos, saca miembros y cambia el
  nombre del grupo. Un miembro sacado no lee nada de lo que diga el grupo a partir de entonces, y el grupo se queda en
  su teléfono, solo para leer, hasta que lo elimine.
- **Hilos:** mantén pulsado un mensaje y elige **Responder en el hilo** para responderle en un hilo, o toca **n
  respuestas en el hilo** bajo un mensaje para abrirlo. El hilo se ve solo, y lo que envías ahí le responde.
- **Descripción:** el admin del grupo la escribe en la hoja de miembros, bajo **Descripción**, y toca **Guardar**. Todos
  los miembros la leen, también quienes se unan después. Un cambio de cualquier otra persona se ignora.
- **Salir:** **Salir del grupo** se lo pide al admin, cuyo teléfono te saca la próxima vez que {=Erevos} esté abierto ahí.
  El botón propio del admin es **Cerrar el grupo**: saca a todos los miembros.
- **Un solo admin:** un grupo privado tiene un admin, quien lo creó. **Por qué:** los cambios del grupo deben llegar en
  un solo orden, y con MLS ningún servidor los pone en orden, así que dos admins podrían cambiar el grupo a la vez y
  partirlo en dos. Un Erevos anterior a esto acepta cambios solo de quien creó el grupo.
- **Llamadas de grupo:** el auricular verde de arriba del grupo inicia una llamada de voz en él, y la cámara azul de al
  lado una videollamada (también **Videollamada** bajo **⋯**). Mientras hay una en curso, solo aparece su propio botón,
  para unirse. Suena en los teléfonos de los miembros donde Erevos está abierto, y quien responde entra. Una llamada en
  curso aparece arriba del grupo, para unirse más tarde. Hasta ocho personas: cada teléfono se conecta con cada uno de
  los otros, a través del relay de llamadas, así que ningún teléfono ve la dirección IP de otro; sin relay de llamadas,
  solo en la misma Wi-Fi. Cifrado de extremo a extremo entre cada dos teléfonos, con sus claves enviadas en el cifrado
  del grupo. En una videollamada cada teléfono envía su imagen a cada uno de los otros, así que las imágenes se ven
  para hasta cuatro personas; con más, se pausan y el sonido sigue, hasta que se monte un servidor para videollamadas
  más grandes. Una llamada que suena ofrece **Unirse** y **Unirse con vídeo**.
- **Fotos, archivos y mensajes de voz:** **+** junto al campo envía una foto o un archivo, como en el chat de un
  contacto, con la misma **Calidad de la foto**; mantén pulsado el micrófono mientras hablas, y suelta para enviar.
  Cada uno se cifra con una clave propia y se pone una vez en tu relay, y solo dónde está y su clave van al grupo, en
  su cifrado. El teléfono de cada miembro lo recoge de ahí a través de su propio relay: hasta 16 MB solo mientras el
  grupo está abierto, uno más grande al tocarlo. Toca una foto para verla entera, un archivo para guardarlo, un mensaje
  de voz para reproducirlo.
  - **El relay lo guarda 14 días,** cifrado, ya que no puede saber cuándo lo han recogido todos los miembros.
  - **Solo por el relay,** aunque los miembros estén cerca.
  - **Un miembro que se une más tarde** no recibe lo que llegó antes, como con las palabras. Un miembro cuyo {=Erevos}
    sea anterior a esta versión no ve nada de ello.
  - **En el teléfono** cada uno se guarda en sus trozos, sellado, como en el chat de un contacto. Eliminar el grupo
    aquí los elimina.
- **El menú de un mensaje,** al mantenerlo pulsado, como en el chat de un contacto: las reacciones, **Responder**,
  **Reenviar**, **Destacar**, **Fijar**, **Copiar**, **Editar** y **Eliminar**. Cada miembro tiene una reacción por
  mensaje, y una encuesta muestra quién eligió qué. Un mensaje fijado es para todos, y cualquier miembro puede **Dejar
  de fijar**. **Editar** da a tus propias palabras otras nuevas para todos los miembros, hasta un día después de que
  salieran, marcadas como **Editado**. **Eliminar** pregunta **Este teléfono** o, para un mensaje tuyo, **Para todos**:
  el Erevos de los miembros también lo elimina, y una foto, archivo o mensaje de voz tuyo sale de tu relay al instante
  en lugar de a los 14 días. **+** también tiene aquí **Sticker**, **Ubicación** y **Encuesta**. Los enlaces aparecen
  subrayados y se pregunta antes de abrirlos, y las **Vistas previas de enlaces**, cuando están activadas, van con los
  tuyos. En la hoja de miembros, o en la pantalla propia de un grupo público, **Buscar en este chat** recorre los
  mensajes del grupo y **Exportar chat** los escribe en un archivo, y **Multimedia, enlaces y archivos** lista las fotos, vídeos, mensajes de voz, música, archivos y enlaces del grupo, cada tipo aparte, como en el chat de un contacto (mira arriba), y cada uno va a su mensaje; **Mensajes destacados** y la búsqueda de la pantalla
  de inicio también incluyen los grupos. Un miembro cuyo {=Erevos} sea anterior a esta versión ve las palabras, el emoji de
  un sticker, las coordenadas de un lugar y la pregunta de una encuesta, y nada de reacciones, mensajes fijados,
  ediciones y eliminaciones. **Seleccionar** elige varios mensajes para copiarlos, reenviarlos o eliminarlos juntos, una
  encuesta tuya tiene **Terminar la encuesta**, y **+** tiene también **Tarjeta de contacto**. **Para todos** se ofrece
  al eliminar solo si todo lo elegido es tuyo.
- **Nombrar a un miembro:** escribe **@** en el campo del mensaje y los miembros cuyos nombres empiezan por lo que
  sigue aparecen encima: toca uno para poner su nombre entero. Un miembro nombrado así se entera del mensaje aunque
  haya silenciado el grupo. Solo cuentan los nombres enteros, así que **@Ana** no nombra a Ana María. Un Erevos de antes
  muestra solo las palabras y avisa como dicen los ajustes del grupo.
- **Todavía no:** escribiendo y mensajes temporales en los grupos, y grupos a través de un teléfono cercano.

## Grupos públicos {#public-groups}

Un grupo público es uno al que cualquiera con su enlace, o su código QR, puede pedir unirse: para un club, una calle o
una clase, donde no todos son tus contactos. Desde el menú de la pantalla de inicio, **Grupos públicos**: dale un nombre
y el nombre con el que te presentas en él, elige quién entra, y toca **Crear el grupo público**. Eres su propietario.
Sus mensajes están cifrados de extremo a extremo con MLS y van a cada miembro como en cualquier grupo, y ningún relay
sabe quién está en él.

- **El enlace:** toca el nombre del grupo arriba para su enlace y su código QR, y **Compartir el enlace**. Quien lo abre,
  o escanea el código con la cámara del teléfono, elige el nombre que ve el grupo y toca **Pedir unirse**. Un enlace
  también se puede pegar en **Unirse con un enlace**. Todos los miembros tienen el enlace, y pueden pasarlo.
- **Descripción:** el propietario o un admin la escribe en la pantalla propia del grupo, bajo **Descripción**, y toca
  **Guardar**; todos en el grupo la leen.
- **Unirse mientras no estás:** la petición espera en tu relay, sellada para que solo tu teléfono la abra, hasta que
  Erevos esté abierto en tu teléfono: mira cada pocos segundos mientras Erevos está a la vista, y más o menos cada
  minuto en segundo plano. Entonces lo deja entrar, y el grupo aparece en su teléfono.
- **Quién entra:** **Cualquiera con el enlace**, o **Un admin les deja entrar**: entonces quien lo pide espera en
  **Quieren unirse**, a que tú o un admin toquéis **Dejar entrar** o **Rechazar**. Tu teléfono lo deja entrar igualmente,
  en cuanto se entera.
- **Admins:** en **Miembros**, toca **Moderar** junto a un miembro, y luego **Hacer admin**. Los admins silencian,
  expulsan y vetan miembros, dejan entrar a quien lo pide, y eliminan un mensaje para todos; solo tú moderas a los
  admins, y nadie te modera a ti.
  - **Silenciar:** su teléfono no envía nada en el grupo, y ningún teléfono muestra lo que el suyo envíe de todos
    modos. **Dejar que escriba** lo deshace.
  - **Expulsar:** no lee nada de lo que diga el grupo a partir de entonces, y puede volver a pedir unirse por el
    enlace.
  - **Vetar:** expulsado, y lo que su teléfono pida después se rechaza. **Levantar el veto**, en **Vetados**, lo
    deshace. Un veto detiene al mismo teléfono, no a alguien que vuelve con una nueva cola en el relay: contra eso,
    elige **Un admin les deja entrar**, o cambia el enlace.
  - **Eliminar para todos:** los últimos mensajes aparecen listados abajo; **Eliminar** quita uno del teléfono de
    todos los miembros. Quien ya lo haya leído puede haber guardado una copia.
- **Cambiar el enlace:** el enlace y el código QR compartidos hasta ahora dejan de funcionar al instante, y todos los
  miembros reciben el nuevo. Las peticiones que todavía esperaban en el antiguo se pierden.
- **Ceder el grupo:** en **Moderar** de un miembro. Su teléfono pasa a ser el propietario y deja entrar a la gente, así
  que el enlace cambia a uno de su relay; tú sigues siendo admin. Si tu teléfono se pierde antes de cederlo, nadie podrá
  volver a dejar entrar a nadie, aunque el grupo sigue para quienes están en él.
- **Cerrar el grupo** saca a todos los miembros. **Salir del grupo** de un miembro le pide a tu teléfono que lo saque.
- **Un grupo de un solo uso,** para una ocasión: antes de crearlo, en **Termina**, elige **Tras un día**, **Tras 3
  días** o **Tras 7 días**. Cuando se acaba su tiempo, el Erevos de cada miembro lo borra, cada uno según el reloj de
  su propio teléfono, con sus mensajes, fotos y archivos, la próxima vez que esté abierto, y su enlace deja de
  funcionar. Cuándo termina se fija al crear el grupo y no cambia nunca. La pantalla del propio grupo dice cuándo
  termina. Un miembro con un {=Erevos} anterior lo conserva, y hasta entonces cualquiera puede haber guardado una copia o
  una captura de pantalla.
- **Hasta 100 miembros,** ya que todo el grupo tiene que caber en el único mensaje que deja entrar a alguien.
- **Todos los teléfonos de un grupo público necesitan esta versión de {=Erevos}.** Los grupos creados a partir de
  contactos funcionan como antes.

**Por qué:** solo el teléfono del propietario cambia el grupo y deja entrar a la gente, así que los cambios nunca
compiten y ningún servidor tiene que ordenarlos. Por eso el grupo sigue sin él, pero no entra nadie nuevo: cédelo antes
de cambiar de teléfono.

### Lo que revela un grupo público

> Cualquiera con el enlace puede leer el grupo desde que se le deja entrar, nunca lo que se dijo antes, y el enlace se
> puede pasar: cámbialo para impedirlo.

- **El enlace** muestra el nombre del grupo y la dirección de tu relay a quien lo vea.
- **Cada miembro ve de cada miembro** el nombre elegido, una clave hecha solo para este grupo, la dirección de su relay
  y el sender id de su cola. La clave no dice nada de quién es en sus chats, ni en qué otros grupos está. La cola es
  una en la que solo leen sus grupos públicos, no la de su enlace de contacto, la misma en cada uno de sus grupos
  públicos (un Erevos anterior a 2.0.0 da la de su enlace de contacto).
- **Los nombres se eligen, no se demuestran:** cualquiera puede llamarse como quiera. El principio de la clave de cada
  miembro aparece junto al nombre, y el propietario y los admins están marcados.
- **Lo que se diga se puede copiar** por cualquiera del grupo: el cifrado de extremo a extremo deja fuera a los relays,
  no a los miembros.
- **Los relays** no leen nada ni conocen a nadie del grupo. El tuyo ve llegar peticiones a la puerta del grupo, cuántas
  y cuándo, no de quién. Los miembros pueden llenarse la cola unos a otros con lo que no se puede leer, hasta lo que
  admita el relay.

## Cómo elige Erevos el camino {#paths}

Cuando envías un mensaje, Erevos elige el camino por sí solo:

1. **Su teléfono está cerca** (la parte de arriba del chat dice **Cerca**): va por el enlace de cerca, y también por el
   relay cuando hay uno.
2. **Si no, con un relay:** va por el relay, y un mensaje corto también va a los teléfonos con {=Erevos} conectados cerca,
   para que el suyo pueda responder de cerca si es uno de ellos. Si el relay no está disponible, esa copia es la que
   cuenta, y esos teléfonos también la llevan al relay de tu contacto, como en
   [Chatear con un teléfono cercano](#nearby).
3. **Si no, sin relay,** va a los teléfonos con {=Erevos} conectados cerca, como en el 2.
4. **Y por LoRa,** cuando hay una radio configurada y el relay no pudo recibir un texto, como en
   [Con una radio LoRa](#lora). Sin ningún camino, el mensaje espera, marcado como **En espera**, y sale solo en cuanto
   haya uno, como en [Enviado, llegado y leído](#relay); una línea bajo el chat dice por qué.
5. [~] **Y por SMS,** lo último de todo, cuando lo activaste para ese contacto y nada más llevó un texto, como en
   [SMS](#sms).

Todos los caminos están cifrados de extremo a extremo: ningún relay ni ningún teléfono entre medias puede leer lo que
envías.

**Caminos**, en **Ajustes** → **Relay y redes**, muestra cada camino de un vistazo: una tarjeta para el relay, Nostr, los teléfonos cercanos, LoRa{~, SMS} y Tor, cada una con cómo está ahora y una línea debajo, llena cuando funciona, tenue cuando está activo pero ahora no llega a nadie, y de guiones cuando está apagado. Encima dice cuántos de tus mensajes esperan salir, con un punto naranja por cada uno. Una tarjeta abre los ajustes de su camino. Solo muestra el espacio abierto, nunca los chats ocultos. En el inicio, la línea bajo la barra superior también es **Caminos**, una vez puesto un relay: un punto por cada camino, y cuántos de tus mensajes esperan; un toque lo abre.

| Línea bajo el chat | Qué hacer |
| --- | --- |
| **Enviado cerca, cifrado de extremo a extremo.** | Nada: su teléfono está cerca y lo tiene. |
| **Enviado por el relay, cifrado de extremo a extremo.** | Nada: está en camino. |
| **Enviado a los teléfonos con {=Erevos} cercanos, cifrado de extremo a extremo, porque el relay no estaba disponible.** | Solo llega si uno de ellos es el suyo: espera a **✓✓**, o revisa el relay. |
| **… Si el suyo no está entre ellos, se lo entregan a su relay en cuanto tengan internet, y este teléfono también.** | Nada: llega en cuanto uno de ellos, o este teléfono, tenga internet. Espera a **✓✓**. |
| **Enviado por LoRa, cifrado de extremo a extremo, porque el relay no estaba disponible.** | Llega si su {=Erevos} tiene una radio en la misma malla, al alcance: espera a **✓✓**, o revisa el relay. |
[~] | **Enviado por SMS, cifrado de extremo a extremo, porque nada más podía llevarlo.** | Nada: cuesta SMS, y la compañía telefónica ve que escribiste a su número. **✓✓** llega en cuanto se puede llegar al relay o a Nostr. |
| **En espera. El relay no está disponible (o No hay relay), y su teléfono no está cerca.** | Nada: sale solo en cuanto el relay o su teléfono cercano puedan recibirlo, y entonces muestra **✓**. Sin relay, rellena su dirección, como en [Chatear a través de un relay](#relay), o acércate a su teléfono. |
| **En espera. Es demasiado largo para LoRa.** | Nada: sale en cuanto el relay o su teléfono cercano puedan recibirlo. O envíalo en partes más cortas. |
[~] | **En espera. Es demasiado largo para SMS.** | Nada: se envía en cuanto el relay o su teléfono cercano puedan llevarlo. O envíalo en partes más cortas. |
| **No enviado. El relay ya no tiene la cola de este contacto.** | Pídele que te escriba, o su nuevo enlace de contacto. |
| **Esta versión no puede cifrar, así que los chats por el relay están desactivados.** | Vuelve a compilar la app: esta compilación es anterior a su cifrado. |

## Tener tu propio relay {#own-relay}

Un relay que gestionas tú es el más seguro, ya que quien gestiona un relay ve quién se conecta a él. El código fuente
lo tiene todo en \`deploy/relay\`.

- **En tu propia red:** ejecuta el relay en un ordenador, abre el puerto 7879 en su cortafuegos, y escribe
  \`ws://<su dirección>:7879\` en cada teléfono. Vuelve a cerrar el puerto cuando acabes.
- **En internet:** un servidor (VPS) con Debian 12 o Ubuntu 22.04 o posterior, un nombre de dominio (o un nombre
  gratuito de \`sslip.io\`) y los puertos 80 y 443 abiertos. Un solo comando instala el relay detrás de Caddy, con un
  certificado de Let's Encrypt y un token aleatorio. Cada teléfono usa entonces \`wss://<tu dominio>\` y ese token. El
  mismo comando configura el relay de llamadas para las llamadas, que necesita además el puerto 3478 y los puertos UDP
  50000 a 50999 abiertos.

Las colas y los mensajes en espera se guardan en el disco del servidor, y también los trozos cifrados de fotos y
archivos hasta que se recogen (1024 MB en total como mucho), así que un reinicio no pierde nada, y no se registra ninguna
petición.
Los mensajes enviados para más tarde también se guardan ahí hasta su hora, 10.000 o 256 MB como mucho: el relay ve
cuándo debe salir cada uno, no lo que dice.

**Por qué:** lo que guarda el relay tiene límites, para que los teléfonos que lo usan no puedan llenar su disco ni su
memoria.

**Su propia clave:** el archivo de clave del relay (\`EREVOS_RELAY_KEY\`, que configura el único comando) es lo que
demuestra en cada conexión, así que los teléfonos lo reconocen por esa clave y no por su certificado (ver
[La clave propia del relay](#relay)). Guarda ese archivo, también en sus copias de seguridad: con uno nuevo, todos los
teléfonos que conocían la clave antigua rechazan el relay hasta que alguien toca **Tiene una clave nueva** en ellos.

**Invitaciones:** el relay puede dejar que cada teléfono tenga un token propio, en un archivo de tokens, y luego dejar
que esos teléfonos inviten a más, cada invitación para un teléfono (ver [Invitaciones al relay](#relay)). Actívalo con
\`EREVOS_RELAY_INVITES=on\` junto a \`EREVOS_RELAY_TOKENS\`; el relay escribe entonces él mismo en ese archivo las
líneas de los teléfonos invitados, con quién los invitó y cuándo, y quitar una línea corta ese teléfono, solo ese: los
teléfonos que invitó conservan las suyas, así que para sacarlos también, borra cada una de sus líneas (cada una dice
quién lo invitó). Deja entrar 100 teléfonos por invitación como mucho (\`EREVOS_RELAY_MAX_INVITED\`). \`erevos-relay
free-line NAME\`, ejecutado con el relay parado, hace de una línea una de las tuyas: el teléfono que la invitó ya no
puede retirarla, y ya no cuenta entre los 100. Un teléfono que llega con el token del relay (\`EREVOS_RELAY_TOKEN\`)
pide una vez una línea propia, que el relay añade como una de las tuyas, indicando que llegó con el token del relay y
cuándo, 50 al día como mucho: así puedes repartir ese token, eliminar la línea de un teléfono cualquiera, y luego
cambiar el token sin cortar a los demás. \`deploy/relay/README.md\` explica cómo.

**Inicio de sesión:** con un archivo de tokens, el relay también puede dejar que los teléfonos inicien sesión con un
proveedor OpenID Connect, como Authentik, para obtener un token propio, y comprueba cada cuenta cada hora, quitando sus
teléfonos tras 3 días sin respuesta y otras dos comprobaciones de cada teléfono que fallen con una hora de diferencia
(ver [Iniciar sesión en el relay](#relay)). Un navegador puede empezar 10 inicios de sesión por minuto. Con
\`EREVOS_RELAY_OIDC_GROUP\`, solo pueden las cuentas de ese grupo.
Necesita un cliente en el proveedor, unos pocos ajustes, y que \`/signin/\` se pase al relay como HTTP simple:
\`deploy/relay/README.md\` explica cómo.

> No publiques nunca el token donde otros puedan leerlo. Quien gestiona el servidor ve las direcciones IP que se
> conectan, los ids de las colas, y cuándo y cuánto llega. No puede leer los mensajes, que están cifrados de extremo a
> extremo.

## Relay de casa {#home-relay}

En **Ajustes** → **Relay y redes** → **Relay de casa**, un espacio puede tener un segundo relay con una cola propia: uno
en casa, en una Raspberry Pi o en un ordenador viejo, o cualquier otro relay en el que confíes. Es opcional.

- **Lo que hace:** tu enlace de contacto y cada mensaje indican esa cola junto a tu relay. Mientras tu relay no está
  disponible, los contactos escriben ahí, y Erevos recoge lo que llega ahí en cada consulta. Lo que envías va a través
  de él cuando tu propio relay está caído.
- **Cómo configurarlo:** ejecuta un relay como en [Tener tu propio relay](#own-relay), escribe su dirección (y su
  token, si tiene) y elige **Guardar**. Los contactos lo conocen con tu siguiente mensaje, o con tu nuevo enlace de
  contacto.
- **Lo que ve:** lo que ve tu relay, la dirección de este teléfono cuando recoge mensajes (pero no cuando es solo por
  Tor), y cuándo y cuánto llega. Los chats ocultos no lo usan.
- **Solo por Tor:** un interruptor para cada relay de casa. Ese relay nunca ve la dirección de este teléfono, sea cual
  sea el ajuste de Tor para el resto. Sin token escrito, da un token a cambio de un cupón: tu relay, el del propio
  espacio, firma el cupón a ciegas, así que ninguno de los dos relays puede saber de quién es el token. El cupón se usa
  hasta una hora después de firmarse, en un momento al azar, de modo que las horas que vieron los dos relays no coinciden, y el
  token llega del relay de casa en menos de una hora. El token dura 90 días, y Erevos toma un cupón nuevo por sí solo un día al azar entre el día 30 y el día 60. Un límite: con pocos teléfonos en un relay, quien gestione los dos aún podría adivinar solo por las
  horas. Así, dos espacios (mira [Segunda contraseña](#second)) pueden usar cada uno el relay del otro como relay de
  casa, y ningún relay los relaciona. Los dos relays deben tener los cupones activados, y hace falta una versión con
  Tor, en Android (mira [A través de Tor](#tor)).
- **Automáticamente desde tu relay:** un interruptor, apagado salvo que lo actives, en Android, donde Erevos tiene
  Tor. Cuando tu relay nombra un relay emparejado con él (lo configura quien lo gestiona), un espacio sin relay de casa
  toma ese por sí solo, solo por Tor, con su token de un cupón como arriba: nada que escribir, y nada que hacer cuando
  tu relay nombra otro. Al apagarlo suelta el relay de casa que tomó, y quitar a mano el relay de casa lo desactiva para ese espacio; un relay de casa que escribiste
  tú queda como está. Los lugares ocultos nunca toman uno así.
- **Para los chats ocultos:** cada lugar oculto puede tener un relay de casa propio, en **Para usuarios avanzados** de
  su pantalla sin ningún chat elegido, mientras está abierto. Se guarda solo con ese lugar, sellado con su PIN, así que
  el espacio no sabe nada de él, y se consulta mientras el lugar está abierto. Usa un relay distinto del del espacio: un
  relay que viera las dos colas podría relacionarlas.

**Más de uno:** **Añadir otro relay de casa** da hasta dos más, cada uno con su propia cola, por ejemplo uno en casa y
otro en casa de un amigo. Los contactos los prueban en el orden mostrado, y Erevos recoge lo que llega a cada uno. Tu
enlace de contacto nombra los demás solo mientras sigue siendo lo bastante corto para un código QR; el resto llega a
tus contactos con tu próximo mensaje. Un contacto con un {=Erevos} más antiguo usa solo el primero.

## A través de Tor {#tor}

En **Ajustes** → **Relay y redes** → **Tor**, **Qué va por Tor** elige cuáles de las peticiones de este espacio a sus
relays van por la red Tor. Cada espacio tiene su propia elección:

| Opción | Qué va por Tor |
| --- | --- |
| **Nada** | Salvo que lo cambies. El relay y los relays de Nostr ven la dirección IP de tu teléfono para todo. |
| **Mensajes** | Lo que escribes, y lo que les dice algo a tus contactos, como que un mensaje se leyó. Las imágenes, los archivos y los mensajes de voz van directos, que es más rápido: para ellos el relay ve la dirección IP de tu teléfono. |
| **Todo** | También los archivos. Nada va a un relay sin Tor. |

**Por qué:** un espacio nuevo empieza con **Nada**, porque Tor hace los mensajes más lentos; un espacio hecho antes
conserva su elección. Con **Mensajes**, lo que escribes queda oculto por Tor y nunca lo espera, mientras que las
imágenes, los archivos y los mensajes de voz, que son grandes, van directos y por tanto más rápido.

- **Activar Tor:** de **Nada** a **Mensajes** o **Todo**, Erevos pregunta antes **¿Activar Tor?** y dice que los
  mensajes irán más lentos; **Cancelar** mantiene **Nada**.

- **Un solo chat por Tor:** en un chat de Erevos, **Detalles** → **Por Tor** envía los mensajes y archivos de ese chat
  solo por Tor, por circuitos de Tor propios, sea cual sea la elección de este espacio; está desactivado salvo que lo
  actives. El relay entonces no ve la dirección IP de tu teléfono para ese chat, y ninguna salida de Tor lo lleva
  junto con otro chat. Es más lento, y lo que sale espera mientras Tor arranca. Las llamadas no van por Tor. Los chats
  ocultos también lo tienen, cada uno en sus propios **Detalles**.
  Es igual en tus dispositivos vinculados: activado o desactivado en uno, queda así en todos. En un dispositivo sin
  Tor, como la aplicación web, ese chat no envía nada mientras esté activado.
  Cubre también los textos de Nostr de ese chat y sus fotos y archivos en servidores de archivos de Nostr, aunque la
  elección de este espacio sea **Nada**: Tor se arranca para ellos y nada va directo. Hasta que tu contacto escribe
  por primera vez en la cola propia del chat, sus primeros mensajes llegan a la cola del espacio, que se lee como dice
  el espacio. Mira [Quién ve tu dirección de internet](#ip).

- **Lo que oculta:** el relay ya no ve la dirección IP de tu teléfono, solo una salida de Tor (o nada, para un relay con
  una dirección \`.onion\`). Tu compañía telefónica o la Wi-Fi solo ven que usas Tor, no qué relay.
- **Lo que cuesta:** lo que va por Tor llega y sale más despacio, y el primer arranque de Tor tarda un rato. La pantalla
  muestra cuánto le falta a Tor. Para ahorrar batería, Erevos envía el relleno reducido que Tor hizo para los teléfonos:
  el relleno que Tor envía para ocultar cuándo hablas sale cada 9 a 14 segundos, no cada pocos, y no llega ninguno al
  teléfono.
- **Lo que no cubre:** las llamadas, cuyo sonido e imagen van directamente entre los teléfonos o a través del relay de
  llamadas; los teléfonos cercanos{~ y los SMS}, que no usan internet.
- **Solo en Android:** {=Erevos} en un ordenador y la app web aún no tienen Tor, así que ahí todo va directo.

> Con **Mensajes**, un mensaje nunca espera a Tor: uno que Tor no pudo llevar al relay sale directo al instante, y lo
> mismo los mensajes mientras Tor arranca, o durante un minuto después de que no pudiera contactar con el relay; luego
> se vuelve a probar Tor. Con **Todo**, nada va a un relay sin Tor:
> cuando Tor no puede contactar con el relay, el mensaje espera y se vuelve a intentar; Erevos nunca vuelve por sí solo
> a tu propia conexión.

### Puentes

Donde Tor está bloqueado, **Puentes** en la misma pantalla deja que Tor llegue a su red a través de puentes. Está en
**Sin puentes** salvo que elijas, cada espacio tiene su propia elección, y solo cuenta mientras algo va por Tor.

| Opción | Qué es |
| --- | --- |
| **Automático** | Erevos prueba las formas por turnos hasta que Tor se conecta: directo, los puentes obfs4, Snowflake, luego tus propias líneas, si tienes. Recuerda durante 30 días la que funcionó en Wi-Fi y en datos móviles, y la prueba primero; en otra red busca de nuevo. Con **Mi red está vigilada** activado, nunca prueba directo, así la red solo ve un puente. |
| **obfs4** | Los puentes obfs4 que trae Tor Browser. Para quien vigila la red, Tor parece bytes aleatorios. Un censor que los conozca puede bloquearlos. |
| **Snowflake** | A través de los navegadores de voluntarios, con WebRTC, como va una videollamada. Para encontrar uno, Erevos pregunta al broker de Snowflake a través de una CDN, tras el nombre de otro sitio, y unos servidores STUN le dicen al teléfono su propia dirección: ven esa dirección, nunca tus mensajes. Más lento, y difícil de bloquear. |
| **Los míos** | Líneas de puentes de bridges.torproject.org, de bridges@torproject.org por correo, o de @GetBridgesBot en Telegram, pegadas una por línea; luego toca **Usar estos puentes**. Funcionan obfs4, Snowflake, WebTunnel, meek y puentes normales. |

- **Solo a través de ellos:** con puentes, Tor nunca va directamente a sus relays. Cuando ningún puente responde, con
  **Todo** los mensajes esperan, como cuando Tor no puede contactar con el relay; con **Mensajes** van al relay sin Tor
  hasta que alguno responda. Las líneas que no son puentes no se aceptan, y Tor se queda apagado.
- **Comprobar mi conexión**, debajo, dice si Tor se conecta, y de qué forma, nunca la dirección del teléfono. Con
  **Automático**, busca de nuevo desde el principio.
- **Cambiarlos** mientras Tor funciona cierra sus conexiones y las vuelve a hacer de la nueva manera.
- **Solo en Android:** la app lleva lyrebird, el programa propio de Tor para obfs4, Snowflake, WebTunnel y meek. Un
  ordenador y la app web aún no tienen Tor, así que tampoco puentes.

## A través de Nostr {#nostr}

En **Ajustes** → **Relay y redes** → **Nostr**, **Textos por Nostr** está **Activado** salvo que lo cambies. Entonces
lo que escribes a un contacto cuyo {=Erevos} también lee en Nostr va primero por tus relays: tu relay, luego los relays de
casa de tu contacto, luego tu relay de casa; y por relays públicos de Nostr solo cuando ninguno lo aceptó. Cada espacio
tiene su propia elección, y sus propios relays de Nostr.

- **Cómo se sella:** cifrado de extremo a extremo como siempre, luego sellado una vez más para una clave que tu contacto
  dio solo para este chat, y firmado por una clave hecha para ese único texto (un gift wrap NIP-59). Los relays de Nostr
  ven que alguien escribió a una clave que no nombra a nadie, cuándo, y de qué tamaño; no quién lo escribió, ni a quién.
  Tu relay no ve lo que fue por ese camino.
- **Lo que pueden saber los relays de Nostr:** tu teléfono pide a cada uno todas sus claves a la vez:
  un relay puede saber que esas claves se leen juntas. Por Tor, nunca desde dónde: a cada relay se llega por circuitos
  de Tor propios, así que ninguna salida de Tor lleva lo que va a dos de ellos, y ninguna puede saber que es de un mismo
  teléfono. Con **Nada** va directo, así que ven la dirección IP de tu teléfono, aunque no quién escribió a quién. Algunos relays rechazan algunas salidas de Tor, y algunas salidas no pueden llegar a un relay: tras un fallo
  así, el siguiente intento va por otra salida.
- **Cómo va:** con **Nada**, los textos van directos a los relays de Nostr. Con **Mensajes**, por Tor cuando Tor está
  listo, y por tu relay mientras Tor arranca. Con **Todo**, solo por Tor. Cuando cambia la vía, las conexiones de Nostr
  se cierran y se abren de nuevo por la vía nueva.
- **Nostr por Tor:** en la pantalla **Nostr**, **Nostr por Tor** está **Desactivado** salvo que lo actives.
  **Activado**, Erevos llega a los relays de Nostr y a los servidores de archivos de Nostr solo por Tor y arranca Tor
  para ello, aunque el Tor del espacio sea **Nada**; un texto que va allí espera mientras Tor arranca. Solo añade Tor:
  con Tor activado para el espacio, Nostr va por Tor diga lo que diga esto, y un chat con **Por Tor** va por Tor diga
  lo que diga esto. Mira [Quién ve tu dirección de internet](#ip).
- **Los relays:** relay.damus.io, nos.lol y relay.primal.net salvo que los cambies; puedes añadir los tuyos, cinco como
  mucho. A tus contactos se les dicen los relays en los que lees, y te escriben ahí; basta con uno que acepte un texto.
- **Lo que se queda en tu relay:** llamadas, reacciones, y las marcas de que un mensaje llegó o se leyó; y lo que escribes a contactos en un iPhone o un ordenador, que no leen en Nostr. Las imágenes, los archivos y los mensajes de voz van por tu relay cuando hay uno entre vosotros; sin relay entre vosotros van también por Nostr (ver Sin ningún relay).
- **Por dónde fue:** mantén pulsado un mensaje: su menú dice **Enviado por Nostr** o **Llegó por Nostr** cuando un relay
  de Nostr lo aceptó. Desde ahora también dice **Enviado por el relay**, **Llegó por el relay**, **Enviado a su teléfono
  cercano**, **Llegó de un teléfono cercano** o **Enviado por LoRa**; un mensaje anterior no dice nada. La nota bajo los
  mensajes también dice **Enviado por Nostr**. Dos teléfonos uno al lado del otro se dan los textos de cerca primero,
  luego por los relays; Nostr lleva un texto solo cuando los relays no lo aceptaron.
- **Lo último que hicieron los relays:** la pantalla de **Nostr** muestra, para cada relay, si aceptó el último texto
  que se le dio y cuántos segundos después, o por qué no, y si tu teléfono lee en él. Se guarda solo en este teléfono,
  hasta que Erevos se cierra. Un texto nunca espera a los relays de Nostr mientras tus relays lo aceptan.
- **Solo en Android,** como Tor.

**Por qué:** los relays de Nostr son públicos, así que, con Tor activado en el espacio, Erevos llega a ellos por Tor, y
nunca saben dónde está tu teléfono; con **Nada** llega a ellos directo. Solo van ahí los textos, como respaldo de tus
relays: un texto que fue ahí va otra vez por tu relay por si no llega, mientras que las marcas de que un mensaje llegó o
se leyó no tendrían ninguno, y un mensaje enviado para más tarde necesita que tu relay lo guarde hasta su hora. Sin
relay entre vosotros, las imágenes, los archivos y los mensajes de voz van también ahí (ver Sin ningún relay).

> Un texto que fue por Nostr va otra vez por tu relay si el teléfono de tu contacto no dice en cinco minutos que llegó,
> y lo ve una vez. Cuando ni tus relays ni ningún relay de Nostr lo aceptan, espera y vuelve a ir, como cualquier
> mensaje.

- **Chats ocultos:** también leen en Nostr, mientras están abiertos, y también cerrados mientras **Recibir estando
  cerrados** está activado para ellos y el espacio está abierto (ver [Chats ocultos](#hidden)). Cerrados, siguen
  mostrando «New message»: con cada texto por Nostr, tu contacto también envía a tu relay una campanita, un mensaje que
  no dice nada, que tu relay cuenta como uno, como antes. Sin relay, su enlace de contacto y su código QR dicen dónde
  leen en Nostr, con una clave solo de ese lugar, y los textos, las reacciones y las marcas de que un mensaje llegó van
  ahí, como desde un teléfono sin relay.

### Sin ningún relay {#nostr-only}

Un teléfono sin relay, sin invitación y sin cuenta LPHL igualmente puede empezar: su enlace de contacto y su código QR
dicen dónde lee en Nostr, y eso basta para hablar.

- **Para empezar:** en **Chat nuevo**, en **Para usuarios avanzados**, toca **Empezar sin relay**, luego **Mostrar mi
  código QR** o **Compartir mi enlace de contacto**, y dáselo a alguien que use {=Erevos}. Quien lo añada te escribe por
  Nostr, y aparece como solicitud de mensaje, que aceptas. Tú también puedes añadir su enlace o su código QR, de la
  misma manera.
- **Lo que va:** textos, stickers, reacciones, ediciones, y las marcas de que un mensaje llegó o se leyó, todo por Nostr; y fotos, archivos y mensajes de voz. Un mensaje de voz va en wraps como un texto. Una foto de hasta 3 MB va en trozos de 32 KB, un wrap cada uno, enviados antes del mensaje que la ofrece; el otro teléfono los guarda, cifrados con el resto del espacio o de los chats ocultos para los que llegaron, hasta que lleguen todos, cuatro días como máximo. Una foto mayor, un vídeo o cualquier otro archivo, de hasta 20 MB, va como un solo blob, cifrado en el teléfono, a un servidor de archivos Blossom (blossom.primal.net, blossom.band o nostr.download), por Tor según la elección de Tor del espacio (directo con **Nada**): el servidor guarda solo lo que no puede leer. Las llamadas y los grupos necesitan un relay, o el otro teléfono cerca. Los chats ocultos también funcionan así, solo por Nostr (ver [Chats ocultos](#hidden)).
- **Cuando no llega:** los relays de Nostr guardan un texto dos días. Hasta que el teléfono de tu contacto diga que
  llegó, Erevos se lo vuelve a dar una vez al día, durante dos semanas.
- **Un relay por sí solo:** cuando tu contacto tiene un relay que le deja invitar, su {=Erevos} le envía al tuyo una
  invitación a él por sí solo, una vez, en el chat, tanto si os conocisteis por Nostr como de cerca, por Bluetooth,
  Wi-Fi o un código QR. Tu teléfono la acepta por sí solo, y a partir de entonces las fotos, los mensajes de voz y las
  llamadas también funcionan, con todos. Cuenta como una de sus invitaciones. Alguien cuya solicitud de mensaje no has
  aceptado no elige ningún relay por ti: su invitación espera hasta que lo aceptes, una semana como mucho.
- **Un Erevos más antiguo** no lee la parte de Nostr de un enlace: solo te contacta de cerca, hasta que tengas un relay.

**Por qué:** Nostr es solo la forma de entrar. Nadie necesita una invitación para empezar, y en cuanto uno de vosotros
tiene un relay, este lleva lo que es demasiado grande para Nostr.

## Quién ve tu dirección de internet {#ip}

La dirección de internet de tu teléfono, su dirección IP, muestra más o menos dónde estás y qué proveedor usas. No
muestra lo que escribes. Quien se conecta con tu teléfono la ve, salvo que la conexión pase por Tor.

- **Tu relay y los relays de tus contactos:** la ven. Para ocultarla, activa Tor para el espacio (**Ajustes** →
  **Relay y redes** → **Tor**) o **Por Tor** en los **Detalles** de un chat. Mira [A través de Tor](#tor).

- [+] **XMPP:** tu servidor de XMPP la ve mientras Erevos está conectado, salvo que la cuenta vaya por Tor; los servidores
  de tus contactos y grupos no, ya que tu servidor les lleva tus mensajes. Erevos avisa antes de que envíes en un chat
  mientras la cuenta no va por Tor (con **Por Tor** para ese chat como solución), antes de cada llamada y antes de
  descargar un archivo de otro servidor que no sea el tuyo. Mira [XMPP](#xmpp).

- **Los relays públicos de Nostr y los servidores de archivos de Nostr:** la ven, salvo que la conexión pase por Tor.
  Activa **Nostr por Tor** en **Ajustes** → **Relay y redes** → **Nostr**, o **Por Tor** para un chat. Mira [A través
  de Nostr](#nostr).
- **Un código de 8 dígitos**, en **A mi lado** y **Tengo su código**: los dos teléfonos se encuentran en esos mismos
  relays públicos de Nostr, así que sin Nostr a través de Tor ven la dirección, pero no el código ni los enlaces de
  contacto. Erevos lo avisa antes de la primera vez.

- [+] **Matrix:** solo tu propio servidor de Matrix la ve, no los servidores de tus contactos: las fotos y archivos de
  otros servidores también te llegan a través del tuyo. Elige **Tor para esta cuenta de Matrix** en la pantalla de
  Matrix, o activa **Por Tor** bajo los botones de un chat, que lleva toda la cuenta por Tor. Ver [Matrix](#matrix).
- [+] **Telegram:** los servidores de Telegram la ven, salvo que la cuenta vaya por Tor: elige **Siempre por Tor** en
  **Tor para esta cuenta de Telegram**, en los ajustes de Telegram, o activa **Por Tor** en la información de un chat,
  que lleva toda la cuenta por Tor. Consulta [Telegram](#telegram).
- [+] **Chats con otras apps de Nostr y el feed Público:** sus relays y servidores de archivos la ven, salvo que la cuenta
  pase por Tor (**Tor** en la pantalla **Chats de Nostr**) o esté activado **Por Tor** del chat. Publicar, dar me gusta
  o votar en el feed Público, y sus fotos y vistas previas de enlaces sin Tor, también la muestran. Mira [Chats con
  otras apps de Nostr](#nostr-chats).
- [+] **Messenger, Signal y Session** (Erevos+): la ven sus propios servidores (los de Meta, los de Signal o el primer
  nodo de Session), no tus contactos, salvo que la cuenta vaya por Tor: elige **Siempre por Tor** en **Tor para esta
  cuenta de …** en su pantalla, o activa **Por Tor** en un chat, que envía toda la cuenta por Tor. El inicio de
  sesión, el captcha de Signal, las fotos de Messenger y **Abrir Facebook** van igual. Erevos avisa antes de que envíes en un chat
  mientras la cuenta no vaya por Tor, y antes de cada llamada. Consulta [Messenger](#messenger), [Signal](#signal) y [Session](#session).

- **Las llamadas:** nunca van por Tor. El relay de llamadas, el tuyo o el de tu contacto, ve la dirección, aunque no
  lo que se dice. Una llamada entre teléfonos cercanos en la misma red se queda en esa red.

- **Un archivo en un servidor que eligió tu contacto:** el servidor ve la dirección cuando tu teléfono descarga el
  archivo. Tor la oculta.

- **Los enlaces web que abres:** el sitio la ve, como cualquier página web. Para ocultarla, abre los enlaces en Tor
  Browser. La vista previa de un enlace también se descarga de su sitio, y el sitio ve la dirección igual.
  Con **Por Tor** activado para las vistas previas de enlaces, no la ve.

- **El relay de un contacto:** mientras tu espacio no tenga relay propio, o solo un lugar prestado en uno, un contacto
  puede darte un lugar en el suyo, y llega con su mensaje. Su relay ve entonces la dirección, así que Erevos pregunta
  antes de aceptarlo, salvo que el espacio lo envíe todo por Tor. Si no se acepta, la invitación se deja.

- **Los grupos:** un mensaje en un grupo de Erevos pasa por un servidor, que ve la dirección. Tor para el espacio la
  oculta; un grupo no tiene interruptor propio.

- **Copias de seguridad, {~el servidor de la Colección, listas de radio y TV, |}vistas previas de enlaces y
  actualizaciones:** cada una tiene su propio interruptor **Por Tor**, en su propia pantalla, desactivado salvo que lo
  actives. Mira [Copias de seguridad](#backup), {~[Colección](#collection), |}[Chatear a través de un relay](#relay) y
  [Actualizaciones](#updates).

- [~] **Emisoras de radio y canales de TV:** cada uno ve la dirección mientras se reproduce. **Reproducir por Tor**, en los
  ajustes de la Colección en Android, desactivado salvo que lo actives, los reproduce solo por Tor. Mira
  [Colección](#collection).

Erevos avisa una vez antes de cada uno de ellos, con el título **Tu dirección de internet puede verse**, un botón
**Guía** que abre esta sección y, donde puede, un botón que lo arregla, como **Por Tor para este chat**. **Seguir**
continúa. Para lo que envías, se dice una vez para toda la red, no en cada chat: después, un chat o grupo que va sin
Tor muestra solo una línea discreta encima de donde escribes, **Sin Tor: los relays ven tu dirección de internet.**,
con **Por Tor para este chat** y **Guía** al lado.

Después de la guía vuelve la misma pregunta, y lo que estabas enviando, como un mensaje de voz o un archivo, la
espera. Una llamada que suena aquí lo dice debajo de la llamada, y contestar sigue adelante. Los chats ocultos guardan
lo dicho consigo, aparte del espacio.

Los teléfonos cercanos{~, LoRa y los SMS| y LoRa} no usan internet, así que no muestran ninguna dirección de internet.

## Matrix {#matrix}

En **Ajustes** → **Relay y redes** → **Matrix**, un espacio puede iniciar sesión en una cuenta de Matrix, para chatear
con personas que usan Element u otra app de Matrix. Erevos habla él mismo con el servidor de Matrix, como Element:
ningún puente se pone en medio.

- **Iniciar sesión:** tu ID de Matrix, como @nombre:matrix.org, y su contraseña. Erevos pasa a ser un dispositivo
  nuevo de la cuenta, llamado Erevos. La sesión y las claves del dispositivo se guardan cifradas en este espacio, y
  están en las copias de seguridad: tras restaurar, el espacio inicia sesión de nuevo, como un dispositivo nuevo. Sus
  chats ocultos pueden tener una cuenta de Matrix propia, ver [Chats ocultos](#hidden).
- **Inicio de sesión único:** en Android, cuando tu servidor de Matrix hace entrar a la gente en otro sitio (como pide
  matrix.org en cuentas nuevas), **Iniciar sesión con inicio único (SSO)** abre el navegador en esa página, y vuelve a
  Erevos cuando hayas entrado allí; un servidor con varios proveedores te deja elegir uno. El navegador no pasa por
  Tor, así que esa página ve tu dirección. Como no hay contraseña que dar, Erevos crea las claves de firma cruzada de
  la cuenta solo cuando el servidor las acepta sin volver a preguntar; si no, comprueba este dispositivo con emoji o
  código QR desde otro tuyo, o introduce la clave de seguridad.
- **Chats:** **Chat nuevo** empieza un chat cifrado con un ID de Matrix. Las invitaciones salen primero, con **Unirse**
  y **Rechazar**. Escribe un nombre en vez de un ID de Matrix para buscar personas en el directorio de usuarios de tu
  servidor Matrix, que se entera de a quién buscaste; **Iniciar** empieza el chat con la persona que toques.
- **Grupos:** **Grupo nuevo**, en la pantalla de Matrix, crea un grupo cifrado con un nombre y los ID de Matrix que
  escribas, cada uno invitado a unirse, como lo crea Element; todos en él ven quiénes son los demás. **Unirse a un
  grupo** entra en uno por su dirección, como #name:matrix.org. Un grupo público puede no estar cifrado, y entonces su
  pantalla lo dice. En un grupo, **Invitar** invita a otra persona, si el grupo te deja.
  Al escribir **@** en un grupo aparecen sus miembros; un mensaje nombra a quienes se escriben enteros, y sus apps se lo
  avisan.
- **Miembros:** en un grupo, **Miembros** lista a su gente y muestra quién es **propietario**, **admin** o
  **moderador**, según dicen sus niveles de poder. Donde tu nivel lo permite, renombras el grupo, pones su **Asunto**,
  **Hacer admin** o **Quitar como admin**, **Expulsar** a alguien (los mensajes del grupo ya no le llegan) o **Vetar**
  (no puede volver a unirse hasta que un admin lo deje).
- **Cifrado:** los mensajes van cifrados de extremo a extremo con el cifrado propio de Matrix (Olm y Megolm, a través
  de vodozemac). Un chat sin cifrar lo dice.
- **No anónimo:** el servidor de Matrix ve tu cuenta, quién habla con quién y cuándo, y, sin Tor, desde dónde. En un
  chat con personas de otros servidores, esos servidores también lo ven.
- **Por Tor:** en Android, la pantalla de Matrix, también antes de iniciar sesión, tiene la elección de Tor que tiene
  cada cuenta: **Desactivado** (lo predeterminado) va directo, y el servidor de Matrix ve tu dirección; **Como el
  espacio** sigue **Ajustes** → **Relay y redes** → **Tor**: con **Mensajes**, por Tor en cuanto está listo y directo
  mientras arranca, fotos y archivos directos; con **Todo**, todo solo por Tor; **Siempre por Tor** envía esta cuenta
  solo por Tor, también al iniciar sesión, y nada sin él. Tor usa los puentes del espacio. **Por Tor** de un chat,
  bajo sus botones, hace que toda la cuenta vaya solo por Tor mientras está activado: Matrix tiene una conexión para
  todos los chats de una cuenta. Las llamadas nunca van por Tor.
- **Mensajes de antes:** un mensaje enviado antes de que Erevos iniciara sesión, o uno cuya clave aún no llegó, sale
  bloqueado.
- **Fotos y archivos:** **Foto** y **Archivo** los envían, hasta 50 MB, cifrados en el teléfono antes de ir al servidor
  de Matrix, que así guarda solo lo que no puede leer. Una foto recibida se descarga solo al tocar **Mostrar foto**;
  **Guardar** deja cualquier archivo en el teléfono.
  Toca una foto que se muestra para verla en toda la pantalla, como en el chat de un contacto: dos dedos o un doble
  toque la amplían, gira con el teléfono, y **Guardar** la conserva (ver Fotos y archivos, en [Chatear a través de un
  relay](#relay)).
- **Stickers:** un sticker que envían Element, FluffyChat o Element X se ve en el chat; **Mostrar sticker** lo trae por
  tu servidor Matrix. **Sticker** envía tus propios stickers hechos con fotos (**Míos**) como imágenes, cifradas donde
  el chat lo está. Los grupos que trae Erevos también están: cada sticker va como su imagen, hecha en tu dispositivo,
  con sus palabras para las apps que solo muestran esas.
- **Reacciones, respuestas, cambios y eliminar:** mantén pulsado un mensaje para abrir su menú: elige una reacción
  arriba, **Responder** para responderle, **Copiar** para sus palabras, y en un mensaje tuyo **Editar** o **Eliminar**.
  Una respuesta muestra el mensaje al que responde encima de sus palabras, y un toque en eso va al mensaje. Las
  reacciones se ven bajo un mensaje; toca una para reaccionar igual, o toca la tuya para retirarla. No van cifradas, tal
  como las envía Element, ni siquiera en un chat cifrado: el servidor de Matrix ve qué mensaje recibió qué reacción, y
  de quién. Solo tú puedes cambiar tus propios mensajes, y uno cambiado dice **Editado**. **Eliminar** retira un mensaje
  tuyo para todos en el chat, una vez que lo confirmas; no se puede deshacer, y el chat conserva una línea que dice que
  se eliminó.
- **Varios mensajes:** **Seleccionar**, en el menú de un mensaje, lo elige, y un toque añade otros; luego **Copiar**,
  **Reenviar** o **Eliminar**. **Eliminar** los retira para todos en el chat, tras confirmar: los tuyos y, donde tu
  nivel lo permite, los de otros. No se puede deshacer.
- **Este teléfono o todos:** **Eliminar**, para un mensaje o varios, pregunta primero: **Este teléfono** los elimina
  solo aquí, y siguen ocultos si vuelven a llegar; **Para todos** los retira como se dice arriba, y solo se ofrece
  cuando cada uno puede retirarse.
- **Escribiendo:** quien está escribiendo ahora en el chat, según dice el servidor de Matrix, aparece debajo con
  **escribiendo…**. Erevos lo dice de ti solo si activas **Avisar cuando escribo** en la pantalla de Matrix; al
  principio está desactivado, ya que pasa por el servidor de Matrix sin cifrar, así que el servidor sabe cada vez que
  escribes.
- **En línea:** en un chat con una persona, bajo su nombre dice **En línea**, **Ausente** o **No molestar**, con las
  palabras que puso, o cuándo estuvo en línea por última vez, según dice su servidor de Matrix, y su foto en la lista
  de chats tiene un punto verde mientras está en línea. Algunos servidores no lo dicen. Erevos lo dice de ti solo si
  activas **Avisar cuando estoy en línea** en la pantalla de Matrix; al principio está desactivado, ya que pasa por el
  servidor de Matrix sin cifrar.
- **Marcas:** tus mensajes muestran **✓** cuando el servidor de Matrix los recogió y **✓✓✓** cuando todos los demás
  miembros del chat los leyeron, según lo dice a su servidor la app de Matrix de cada uno (confirmaciones de lectura).
  Matrix no tiene marca para un mensaje que llegó a un teléfono, así que no hay **✓✓**. Mantén pulsado un mensaje tuyo
  y elige **Quién lo leyó** para ver quién lo leyó y cuándo, y quién no (los primeros 100). Una app de Matrix puede
  estar ajustada para no enviar confirmaciones de lectura: su miembro aparece entonces como que no ha leído.
- **Fotos de perfil:** una sala de Matrix, o la persona en un chat con una persona, muestra su foto en la lista de
  chats, y lo mismo un contacto de XMPP. **Elegir una foto**, en la pantalla de Matrix, pone la tuya para tus
  contactos; **Quitar** la quita. Las fotos no están cifradas en ninguna app de Matrix ni XMPP: el servidor las ve, y
  tus contactos ven la tuya.
- **Mensajes anteriores:** un chat con más historial en el servidor de Matrix muestra arriba **Cargar mensajes
  anteriores**; cada toque trae más, y el chat se queda donde estabas leyendo. Un mensaje cuya clave aún no llegó sale
  bloqueado.
- **Mensajes de voz:** mantén pulsado el micrófono bajo el campo del mensaje para grabar, y suelta para enviar; desliza
  a la izquierda antes de soltar para descartar la grabación. Un minuto es el máximo, y una pulsación de menos de un
  segundo no envía nada. Con TalkBack, tócalo una vez para empezar y otra para enviar. En un chat cifrado se cifra como
  una foto, y Element y otras apps de Matrix lo reproducen como mensaje de voz. Uno que llega se reproduce con
  **Reproducir**, y se trae solo cuando lo reproduces. Su forma de onda va con él, como la dibuja Element, y uno que
  llega con forma de onda la muestra bajo **Reproducir**, coloreada mientras suena.
- **Comprobar con emojis:** en un chat con una persona, **Comprobar con emojis** os muestra a los dos siete imágenes;
  si son iguales y en el mismo orden, tocad **Coinciden** en los dos teléfonos. Así nadie puede estar en medio sin
  que se note, y el chat dice **Comprobado con emojis**. **Comprobar este dispositivo con otro tuyo**, en la pantalla
  de Matrix, hace lo mismo con tu propio Element, para que confíe en el dispositivo de Erevos. Element también puede
  empezar cualquiera de las dos.
- **Comprobar con código QR:** cuando ambos lados aceptaron una comprobación y las dos apps pueden hacerlo, la tarjeta
  muestra un código y **Fotografiar su código**. Deja que la otra app fotografíe el código que se ve aquí (en Element:
  **Escanear**) y responde **Sí, lo dice** cuando diga que la comprobación salió bien; o fotografía el código que
  muestra su app. **Comparar emoji en su lugar** va por el otro camino. El código lleva las claves de las dos cuentas
  (o dispositivos) y un secreto de un solo uso, así que un código de alguien en medio no encaja. Nada se da por fiable
  hasta que los dos lados dicen que terminaron.
- **Clave de seguridad:** en **Clave de seguridad**, en la pantalla de Matrix, escribe la clave (o frase) de seguridad
  que creó Element: los mensajes anteriores se abren desde la copia de claves de la cuenta, las claves nuevas entran
  en ella, y tus otros dispositivos confían en este. Una cuenta sin ella puede **Crear una clave de seguridad** aquí;
  apúntala, porque Erevos no la guarda.
- **Llamadas:** los dos recuadros de arriba del chat llaman por voz o con video, con Element Call, la app de llamadas
  de Element y Element X, que Erevos lleva dentro y muestra sobre la app, en una ventana propia: en Android, en la app
  web y en un ordenador (Windows, macOS y Linux). Su flecha de atrás, o la tecla Esc, reduce la ventana a una esquina
  sobre Erevos, para que puedas seguir usando Erevos durante la llamada; un toque en la ventana pequeña la devuelve a su
  tamaño completo. Hasta que la llamada ha empezado, un botón **Cerrar** debajo la termina, por si nunca empieza. Las
  llamadas para ti suenan aquí como las propias de Erevos, mientras este espacio está abierto: **Responder** abre
  Element Call en la llamada, **Rechazar** se lo dice a quien llama. El sonido y la imagen van cifrados de extremo a
  extremo, con claves que solo tienen los que están en la llamada, y pasan por el servidor de medios (LiveKit) que
  indica tu servidor de Matrix, que ve la dirección de este dispositivo; un servidor de Matrix sin uno no puede llamar.
  Lo que Element Call le dice al servidor de Matrix pasa por Erevos, y por Tor como el resto de Matrix, pero la llamada
  en sí nunca pasa por Tor. Element Call no llega a ningún rastreador. Las llamadas de Matrix más antiguas entre dos, como las hace FluffyChat, suenan también aquí (mira **Llamada antigua**). Mientras una llamada de Matrix está en curso o suena, otra llamada, de
  Erevos o de XMPP, no suena y aparece como perdida, y al revés. En Android, Atrás o salir de Erevos hace pequeña la
  ventana de la llamada sobre otras apps (imagen en imagen). Sailfish OS no tiene llamadas de Matrix.
- **En la app web y en un ordenador:** el navegador o el ordenador pide una sola vez la cámara y el micrófono; en un
  ordenador, solo la ventana de la llamada puede usar la cámara. A dónde va el sonido y qué micrófono se usa lo decide
  el ordenador o el navegador. En la app web, Element Call viene de una segunda dirección propia,
  erevos-call.lphl.nekten.eu, y en un ordenador de una parte aparte de la app, así que no puede leer nada de Erevos: ni
  sus claves ni sus chats. La app web comprueba los archivos de Element Call con la misma versión firmada que la propia
  app antes de ejecutarlo, por lo que la primera llamada en la app web tarda un poco más, mientras obtiene y comprueba
  Element Call.
  **Por qué:** el código de Element Call no lo escribe Erevos, así que se ejecuta aparte de Erevos, donde nunca puede
  acercarse a sus claves y chats.
- **Notificaciones:** un mensaje que llega muestra un aviso y cuenta en el número del icono de Erevos, como en los chats
  propios de Erevos, mientras este espacio está abierto; en un ordenador, mientras Erevos funciona. En Android,
  **Notificaciones**, al final de un chat, lo silencia o le da un sonido propio; un chat silenciado no cuenta.
  **Apariencia del chat**, a su lado, da al chat un aspecto propio.
- **Opciones del chat:** el botón de los deslizadores junto a donde escribes, o **⋯** arriba, las abre todas en una
  lista ordenada, a mano por largo que sea el chat: **Notificaciones**, **Apariencia del chat**, el PIN, las capturas
  y los mensajes que desaparecen en **Este chat**, y luego búsqueda, multimedia, un día y exportar en **Buscar**.
- **Mientras este espacio está cerrado:** en Android, **Avisar de mensajes nuevos**, en **Mientras este espacio está
  cerrado** de la pantalla de Matrix, deja que este espacio diga «Mensaje nuevo» cuando llega algo en Matrix mientras
  otro espacio está abierto, como hacen sus propios chats con **También mientras otro espacio está abierto** en
  **Ajustes** → **Notificaciones** → **En segundo plano**, que también necesita. Nunca dice qué, de quién ni en qué
  chat, y una llamada no suena entonces: solo la clave del espacio abre lo que llegó. Para ello el servidor de Matrix
  avisa al relay de este espacio de cada mensaje, sin ninguna palabra de él, así que el servidor de Matrix conoce la
  dirección del relay, y el relay cuándo llegan mensajes. Apagado hasta que lo enciendas; necesita un relay
  actualizado para ello, al que llegue el servidor de Matrix.
- **Hilos:** mantén pulsado un mensaje y elige **Responder en el hilo** para responder en un hilo. Un hilo se abre en
  su propia pantalla, y un mensaje con respuestas dice cuántas hay; tócalo para abrir el hilo. Las apps sin hilos
  muestran las respuestas como respuestas normales.
- **Encuestas:** **Encuesta**, bajo el cuadro de mensaje, hace una pregunta con varias opciones. Toca una opción en la
  burbuja para elegirla, y otra vez para retirarla; todos ven quién eligió qué. Quien hizo una encuesta puede
  mantenerla pulsada y elegir **Terminar la encuesta**: después no cuenta ningún voto.
- **Ubicaciones:** **Ubicación** envía dónde estás, una vez, como hace Element; va cifrada como el chat y se muestra
  con **Abrir en mapas** en Android.
- **Vistas previas de enlaces:** con **Vistas previas de enlaces** activadas, como en los chats con tus contactos, el
  primer enlace de un mensaje va con una vista previa hecha por tu teléfono, cifrada también en un chat cifrado. Por Tor solo con **Por Tor** activado en **Vistas previas de enlaces**, y nunca en un lugar oculto.
- **Fijar y reenviar:** **Fijar**, en el menú de un mensaje, lo fija arriba de la sala para todos, si la sala te deja;
  una barra sobre el chat muestra el último mensaje fijado, y al tocarla va a él y luego muestra el siguiente. **Dejar
  de fijar** lo quita. **Reenviar** manda una copia a otro chat de esta cuenta; la copia no comparte nada con el
  original. Un chat sin cifrar lo dice junto a su nombre, porque su servidor lee una copia enviada ahí.
- **Encontrar grupos:** **Encontrar un grupo**, en la pantalla de Matrix, busca entre las salas públicas de tu
  servidor de Matrix, o de otro que escribas, que entonces se entera de lo que buscas. **Espacios** lista las salas de
  los espacios en que estás, para unirte. **Buscar mensajes** busca solo entre los mensajes guardados en este teléfono
  y no pregunta a nadie.
- **Favoritos:** mantén pulsado un chat de la lista para **Hacer favorito** (va primero), **Baja prioridad** (va el
  último) y **Salir y olvidar**, que además hace que el servidor de Matrix lo olvide, así tus otras apps de Matrix ya
  no lo muestran. Se guardan en tu cuenta, así que tus otras apps de Matrix ordenan igual.
- **Una cuenta nueva:** en la pantalla de inicio de sesión, **Crear una cuenta nueva** crea una en un servidor de
  Matrix que lo permita, con un servidor, un nombre y una contraseña. Si el servidor lo pide, Erevos te pide aceptar
  sus condiciones, dar un token de registro o dar un paso en la página propia del servidor, como un captcha, que se
  abre en el navegador, no por Tor. Un servidor que pide un correo electrónico crea cuentas solo en su web; crea una
  allí y luego inicia sesión aquí.
- **Dispositivos:** **Dispositivos**, en la pantalla de Matrix, lista los dispositivos de la cuenta con cuándo se vio
  cada uno por última vez. **Cambiar nombre** da un nombre nuevo a uno. **Cerrar sesión en los otros dispositivos**
  los quita de la cuenta: pierden sus claves y ya no pueden leer lo que llega. El servidor de Matrix pide antes tu
  contraseña.
- **Llamadas antiguas:** en un chat con una persona, los iconos de llamada preguntan **Element Call** o **Llamada
  antigua**. La llamada antigua funciona con FluffyChat, Nheko y Element en el ordenador, y suena aquí cuando llaman.
  Sus señales van como el chat, cifradas en un chat cifrado, por tu relay si el espacio tiene uno, si no por el relay
  de llamadas de tu servidor de Matrix; la llamada en sí va cifrada (DTLS-SRTP).

**Por qué:** los chats propios de Erevos ocultan quién habla con quién; un servidor de Matrix no puede. Por eso los
chats de Matrix van aparte y marcados, para las personas a las que solo llegarías por Matrix.

- **Lo que lleva un mensaje:** las marcas de cómo se ven las palabras, como negrita y palabras ocultas, se ven como en
  un chat de Erevos (ver [Chatear a través de un relay](#relay)) y van con el mensaje, así que Element también las
  muestra. De lo que envía otra app solo se ven negrita, cursiva, tachado, código y palabras ocultas: nada de ello se
  ejecuta, no se trae ninguna imagen y un enlace muestra adónde lleva de verdad. Las direcciones web se pueden tocar,
  y Erevos pregunta antes de abrir una. Junto a **Foto** y **Archivo** están **Cámara**, **Vídeo**, **Tarjeta de
  contacto** y **Calidad de la foto**: una tarjeta de contacto va como un archivo .vcf que cualquier app abre, y una
  que llega se ve como tarjeta en cuanto tocas **Mostrar**, con **Añadir a contactos**; un vídeo va sin las partes que
  dicen dónde se grabó o con qué teléfono. Un mensaje que reenvías se marca **Reenviado** solo en tu teléfono, así los
  demás nunca saben de dónde vino.
- **Fijadas, al final y con nombre:** fijar una sala la hace tu favorita en Matrix, así que tus otras apps de Matrix
  también la muestran fijada, y las salas de prioridad baja van al final. En la lista de la pantalla de inicio tu
  último mensaje muestra ✓✓✓ en cuanto todos en la sala lo han leído. **Ponerle un nombre aquí** (una persona) o
  **Darle un nombre aquí** (un grupo), al pie del chat, da a una sala un nombre tuyo, solo en este teléfono; nadie se
  entera.
- **Borradores:** lo que escribes y no envías queda como borrador del chat, cifrado solo en este teléfono. Vuelve
  cuando abres el chat otra vez, también después de que Erevos se cerró, y la lista de la pantalla de inicio lo
  muestra en la fila del chat como **Borrador**. Un hilo de Matrix no guarda borrador propio.
- **Enviar más tarde:** mantén pulsado **Enviar**, elige una hora (**En 1 hora**, **Esta noche 20:00**, **Mañana
  09:00** o cualquier día y hora) y toca **Enviar más tarde**. El mensaje espera en este teléfono, cifrado, con borde
  discontinuo después de los mensajes del chat y con su hora, y sale de este teléfono a esa hora mientras Erevos está
  desbloqueado, en Android también en segundo plano; si no, en cuanto vuelve a desbloquearse. Solo texto. Tócalo para
  enviarlo ya o eliminarlo. En los chats ocultos sale solo mientras están abiertos, salvo que reciban también
  cerrados. Uno que trajo de vuelta una copia de seguridad restaurada, cuya hora llegó antes de restaurarla, no sale
  solo: el teléfono del que vino la copia puede haberlo enviado ya.
- **Volver a enviar:** un mensaje tuyo que muestra **No enviado** tiene **Volver a enviar** y **Eliminar** en su menú.
- **Recordarme:** el menú de un mensaje tiene **Recordarme**. Elige una hora: el mensaje, con el nombre de su chat, va
  a **Chat conmigo** y te lo recuerda entonces. Necesita **Erevos** activado en [Módulos](#modules).
- **Mensajes temporales:** **Mensajes temporales**, bajo el campo de mensaje, fija un tiempo para los mensajes nuevos,
  enviados o recibidos: 5 minutos, 1 hora, 1 día o 1 semana después de enviarse cada uno. Entonces se van de este
  teléfono, y los tuyos se retiran también para todos en el chat (sus apps los muestran como eliminados), o en cuanto
  Erevos vuelva a funcionar. Lo que enviaron los demás se queda con ellos. **Temporal**, junto a **Encuesta** y
  **Ubicación**, lo hace solo para el siguiente mensaje. Los mensajes que ya están en el chat se quedan.
- **Bloquear:** **Bloquear**, en un chat con una persona, la añade a la lista de ignorados de tu cuenta: nada suyo
  llega a tu cuenta de Matrix, en ninguna de sus apps, y no se le avisa. **Contactos bloqueados**, en la pantalla de
  Matrix, los lista, con **Desbloquear**.

## XMPP {#xmpp}

En **Ajustes** → **Relay y redes** → **XMPP**, un espacio puede iniciar sesión en una cuenta de XMPP, para chatear con
personas que usan Conversations, Monal, Gajim, Dino u otra app de XMPP. Erevos habla él mismo con el servidor de XMPP,
como esas apps: ningún puente se pone en medio.

- **Iniciar sesión:** tu dirección XMPP, como name@example.org, y su contraseña. Erevos encuentra el servidor a partir
  de la dirección; **Servidor** solo hace falta si no lo encuentra (un nombre, nombre:puerto o una dirección wss://).
  Erevos pasa a ser un dispositivo nuevo de la cuenta. La sesión y las claves del dispositivo se guardan cifradas en
  este espacio, y están en las copias de seguridad: tras restaurar, la cuenta sigue como un dispositivo nuevo. Sus chats
  ocultos pueden tener una cuenta de XMPP propia, ver [Chats ocultos](#hidden).
- **Chats:** **Chat nuevo** añade la dirección a tus contactos, pide a la persona que te deje ver cuándo está en línea,
  como hacen otras apps de XMPP, y abre el chat. Quien pide añadirte sale arriba en la lista y en la pantalla de XMPP,
  con **Aceptar** y **Rechazar**. Los contactos que la cuenta ya tiene están en **Contactos**.
- **Cifrado:** los mensajes se cifran con OMEMO, para cada uno de sus dispositivos y para los otros dispositivos de tu
  cuenta, que leen a la vez: con OMEMO 2 para un dispositivo cuya app lo tiene, como Kaidan, y con la versión 0.3, la
  que hablan Conversations, Monal, Gajim y Dino, para los demás. Es código propio de Erevos, sin auditar, comprobado
  contra otras bibliotecas de OMEMO. Si sus apps no tienen OMEMO, Erevos lo dice y solo escribe cuando eliges **Escribir
  sin cifrado** para ese chat; **Cifrar de nuevo** vuelve atrás.
- **Sus claves:** al final del chat están las huellas de sus dispositivos. Compáralas con lo que muestra su app, por
  otra vía distinta del chat. Una clave que cambió desde que se vio por primera vez lo dice. La clave de este
  dispositivo está en la pantalla de XMPP, dos veces: como la muestran las apps con OMEMO 0.3 y como la muestra Kaidan.
  Un dispositivo tiene una sola clave en ambas, escrita de dos maneras.
- **Marcas:** una marca al enviar, dos cuando su app lo tiene, tres cuando lo leen, como en los chats propios de
  Erevos, con las apps que envían estas marcas.
- **Responder, cambiar, reaccionar, eliminar:** mantén pulsado un mensaje para ver su menú: **Responder** lo responde,
  **Editar** cambia las palabras de uno tuyo, **Eliminar** retira uno tuyo para todos en el chat, y los emoji
  reaccionan a él; tocar una reacción bajo un mensaje reacciona igual, o retira la tuya. Funcionan con apps que hacen
  lo mismo, como Conversations, Dino, Gajim, Monal y Kaidan; otras apps muestran una respuesta con una cita de lo que
  responde, y un cambio como un mensaje nuevo. Las palabras de una respuesta y de un cambio van cifradas como el chat,
  pero a qué mensaje se refiere una respuesta, cambio, reacción o eliminación, y el emoji de una reacción, van como
  los envían esas apps, sin cifrar, así que los servidores XMPP los ven. En un grupo, un mensaje se puede responder,
  reaccionar o eliminar una vez que el grupo lo ha devuelto. Tocar la cita de una respuesta va al mensaje al que
  responde. **Reenviar** envía uno o varios mensajes a otro chat XMPP. **Fijar solo para mí** mantiene un mensaje arriba
  del chat, solo en este teléfono. **Seleccionar** elige varios mensajes para copiar, reenviar o eliminar; **Eliminar**
  ahí retira solo los tuyos.
- **Este teléfono o todos:** **Eliminar**, para un mensaje o varios, pregunta primero: **Este teléfono** los elimina
  solo aquí, y siguen ocultos si vuelven a llegar; **Para todos** los retira como se dice arriba, y solo se ofrece
  cuando cada uno puede retirarse.
- **Escribiendo:** cuando la app de la otra persona avisa de que está escribiendo, **escribiendo…** aparece bajo el
  chat. Erevos lo dice de ti solo si activas **Avisar cuando escribo** en la pantalla de XMPP, y solo a un contacto
  que ve tu presencia, nunca en un grupo; al principio está desactivado, ya que pasa por el servidor XMPP sin cifrar,
  así que el servidor sabe cada vez que escribes.
- **En línea:** bajo el nombre de un contacto dice **En línea**, **Ausente** o **No molestar**, con las palabras que
  puso, o cuándo estuvo en línea por última vez, según dicen sus apps, y su foto en la lista de chats tiene un punto
  verde mientras está en línea; solo de un contacto que te deja ver su presencia. Como en toda app de XMPP, los
  contactos que ven tu presencia ven cuándo Erevos está conectado; pasa por los servidores XMPP sin cifrar.
- **Fotos de perfil:** una sala de Matrix, o la persona en un chat con una persona, muestra su foto en la lista de
  chats, y lo mismo un contacto de XMPP. **Elegir una foto**, en la pantalla de XMPP, pone la tuya para tus contactos;
  **Quitar** la quita. Las fotos no están cifradas en ninguna app de Matrix ni XMPP: el servidor las ve, y tus
  contactos ven la tuya.
- **Bloquear:** **Bloquear**, al final de un chat, impide que los mensajes, llamadas y solicitudes de esa persona lleguen
  a tu cuenta XMPP, en cualquiera de sus apps, como lo hace el servidor XMPP (XEP-0191); no se le avisa.
  **Desbloquear** la deja pasar de nuevo. Quien fue bloqueado en otra app de la cuenta también lo está aquí.
- **Mensajes de antes:** lo que llegó mientras Erevos estaba cerrado se trae del archivo del servidor al conectar, si el
  servidor lo guarda. Un mensaje enviado antes de que este dispositivo iniciara sesión, o no pensado para él, sale
  bloqueado.
- **Fotos y archivos:** **Foto** y **Archivo**, bajo la caja del mensaje, envían uno de hasta 50 MB, o menos si tu
  servidor de XMPP acepta menos, por la subida de archivos del servidor. En un chat cifrado se cifra antes en este
  teléfono, con una clave hecha solo para él, y la clave va en el mensaje, cifrada con OMEMO, así que el servidor
  guarda solo lo que no puede leer; Conversations, Monal, Gajim y Dino lo abren. En un chat escrito sin cifrado el
  archivo va tal cual. Una foto, un sonido o un archivo que llega se descarga solo al tocar **Mostrar foto**,
  **Reproducir** o **Guardar**. En Android, los archivos van por Tor como el chat.
  Toca una foto que se muestra para verla en toda la pantalla, como en el chat de un contacto: dos dedos o un doble
  toque la amplían, gira con el teléfono, y **Guardar** la conserva (ver Fotos y archivos, en [Chatear a través de un
  relay](#relay)).
- **Stickers:** **Sticker** envía tus propios stickers hechos con fotos (**Míos**) como fotos, cifradas como el chat;
  otras apps XMPP los muestran como fotos. Los grupos que trae Erevos también están: cada sticker va como su imagen,
  hecha en tu dispositivo. Un paquete de stickers que envía otra app (XEP-0449) no se descarga: muestra sus palabras.
- **Mensajes de voz:** mantén pulsado el micrófono bajo el cuadro de mensaje para grabar, y suelta para enviar, como en
  un chat de Matrix. Va como archivo de sonido, cifrado como el chat, igual que lo envía Conversations. Un mensaje de
  voz de Conversations u otra app XMPP (un archivo .m4a o .ogg) también se ve como mensaje de voz, con **Reproducir** y
  su duración.
- **Grupos:** un **grupo privado** es solo para sus miembros, y cada uno ve quiénes son los demás. Cada mensaje se cifra
  con OMEMO para los dispositivos de cada miembro, como hacen los grupos privados de Conversations, así que los
  servidores de XMPP no pueden leerlo; lo escrito antes de que entraras sale bloqueado. Un **canal** es cualquier otro
  grupo: no está cifrado, así que todos los que están en él, y los servidores, pueden leerlo, y su pantalla lo dice. En
  la pantalla de XMPP, **Grupo nuevo** crea un grupo privado en tu servidor de XMPP con un nombre y los contactos que
  elijas, y **Unirse a un grupo** entra en uno con su dirección, como nombre@conference.example.org, con su contraseña
  si la pide. Bajo un grupo privado, **Miembros** lista a su gente con sus claves, para comparar como en un chat, y avisa
  de quien no tiene claves OMEMO y no puede leer lo cifrado; su administrador puede **Añadir personas**. Un contacto que
  te invita a un grupo sale en **Invitaciones a grupos**, con **Unirse** y **Rechazar**; la invitación de cualquier otra
  persona no se muestra. Tus grupos siguen a las otras apps de XMPP de tu cuenta mediante sus marcadores: un grupo al
  que entras allí lo tienes también aquí, y **Salir del grupo** sale también allí. Un canal avisa solo de los mensajes
  que te nombran. En un grupo, **propietario** y **admin** se muestran junto a los miembros que lo son, y la
  **Descripción** del grupo se ve bajo su asunto.
- **Gestionar un grupo:** los admins de un grupo ven **Gestionar el grupo** en su pantalla. Ponen el **Asunto**; el
  propietario también puede **cambiarle el nombre**. En un grupo privado, cada miembro tiene **Expulsar** (los
  mensajes del grupo ya no le llegan, y un admin puede volver a añadirlo) y **Vetar** (no puede volver a entrar hasta
  que un admin lo permita); el propietario puede **Hacer admin** a un miembro o **Quitar como admin**. En un canal,
  **Gestionar el grupo** lista quién está dentro, cada uno con **Expulsar**. Los admins no pueden expulsar a otros
  admins; solo el propietario. El propietario también pone la **Descripción** del grupo; algunos servidores no la
  permiten, y Erevos lo dice.
- **Llamadas:** los dos recuadros de arriba del chat llaman a la persona, por voz o con video, en la misma pantalla de
  llamada que las llamadas propias de Erevos, y sus llamadas suenan aquí igual, mientras este espacio está abierto; una
  llamada de alguien que no está en tus contactos solo aparece como perdida. Funciona con apps que llaman como
  Conversations (Jingle, con el timbre de XEP-0353). La llamada en sí está cifrada (DTLS-SRTP), pero la huella de su
  clave pasa por los servidores de XMPP tal cual, sin cifrado de extremo a extremo, así que esos servidores podrían
  ponerse en medio. Pasa por el relay de llamadas de este espacio cuando lo hay, si no por el servidor TURN del servidor
  de XMPP, y solo por él, así que la otra persona no conoce tu dirección; sin ninguno de los dos, va directa, y la
  conoce. Una llamada nunca pasa por Tor: el relay de llamadas o el servidor TURN ve la dirección de este teléfono.
  En una llamada de voz, cualquiera de los dos puede activar el video: **Añadir vídeo**, en la pantalla de la llamada,
  enciende tu cámara y pregunta primero a la otra persona, que elige **Ahora no** o **Activar vídeo**. El video empieza
  solo si dice que sí, y un no deja la llamada como estaba. Funciona con apps que añaden video a una llamada como
  Conversations.
- **Llamadas de grupo:** en un grupo privado en el que estás, los dos recuadros de arriba inician una llamada de voz o
  una videollamada en el grupo, y una llamada iniciada en uno de tus grupos suena aquí, mientras este espacio está
  abierto. Mientras hay una llamada en curso en un grupo, un recuadro de arriba y una línea bajo su nombre lo dicen, y
  tocar cualquiera de los dos te une a la llamada, hasta que sale su última persona. Funciona con Dino, que llama en
  grupos de la misma manera (MUJI): cada llamada tiene una sala propia en el servicio de grupos, a la que solo pueden
  entrar los miembros del grupo, y cada teléfono de la llamada se conecta directamente con cada uno de los otros, como
  en las llamadas de grupo propias de Erevos, a través del relay de llamadas de este espacio o del servidor TURN del
  servidor de XMPP, con ocho personas como máximo. Como en una llamada con una persona, la llamada está cifrada
  (DTLS-SRTP), pero las huellas de sus claves, y las invitaciones, pasan por los servidores de XMPP tal cual, y el
  servicio de grupos ve quién está en la llamada y cuándo. La cuenta de XMPP propia de los chats ocultos llama en sus
  grupos de la misma manera, mientras los chats ocultos están abiertos; mientras están cerrados, con **Recibir estando
  cerrados** activado, una llamada que llega en uno de sus grupos aparece como perdida.
- **No anónimo:** el servidor de XMPP ve tu cuenta, tus contactos, quién habla con quién y cuándo, y, sin Tor, desde
  dónde. El servidor de la otra persona ve lo mismo de sus chats contigo.
- **Por Tor:** en Android, la pantalla de XMPP, y la de antes de iniciar sesión, elige el Tor de la cuenta:
  **Desactivado** (por defecto: directo, y el servidor ve tu dirección), **Como el espacio** (como dice la elección de este
  espacio en **Ajustes** → **Relay y redes** → **Tor**: con **Mensajes** por Tor en cuanto Tor está listo, los archivos
  directos; con **Todo** solo por Tor, también los archivos; con **Nada** directo) o **Siempre por Tor** (solo por Tor,
  haga lo que haga el espacio, también al iniciar sesión, y nada sale mientras Tor no pueda conectarse). Su conexión, la
  búsqueda de su servidor y sus archivos siguen la elección; Tor usa los puentes del espacio. Las llamadas nunca van por
  Tor, y no se hace vista previa de enlaces mientras la cuenta no pueda ir directa. Donde Erevos no puede abrir una
  conexión propia (la app web, un ordenador), usa el WebSocket del servidor, directo, y un servidor sin él no se alcanza.
- **Un chat por Tor:** **Por Tor** bajo un chat o grupo, desactivado hasta que lo actives, lo manda solo por Tor. Una
  conexión con el servidor lleva todos los chats de la cuenta, así que mientras un chat lo tenga activado, toda la
  cuenta va solo por Tor, se elija lo que se elija para ella, y la pantalla de XMPP lo dice.
- **Notificaciones:** un mensaje que llega muestra un aviso y cuenta en el número del icono de Erevos, como en los chats
  propios de Erevos, mientras este espacio está abierto; en un ordenador, mientras Erevos funciona. En Android,
  **Notificaciones**, al final de un chat, lo silencia o le da un sonido propio; un chat silenciado no cuenta.
  **Apariencia del chat**, a su lado, da al chat un aspecto propio.
- **Opciones del chat:** el botón de los deslizadores junto a donde escribes, o **⋯** arriba, las abre todas en una
  lista ordenada, a mano por largo que sea el chat: **Notificaciones**, **Apariencia del chat**, el PIN, las capturas
  y los mensajes que desaparecen en **Este chat**, y luego búsqueda, multimedia, un día y exportar en **Buscar**.
- **Mientras este espacio está cerrado:** en Android, **Avisar de mensajes nuevos**, en **Mientras este espacio está
  cerrado** de la pantalla de XMPP, deja que este espacio diga «Mensaje nuevo» cuando llega algo en XMPP mientras otro
  espacio está abierto, como hacen sus propios chats con **También mientras otro espacio está abierto** en **Ajustes** →
  **Notificaciones** → **En segundo plano**, que también necesita. Nunca dice qué, de quién ni en qué chat, y una
  llamada no suena entonces: solo la clave del espacio abre lo que llegó. Para ello el servidor de XMPP avisa al relay
  de este espacio de cada mensaje mientras ninguna app de la cuenta está activa, así que el servidor de XMPP conoce el
  nombre del relay, y el relay cuándo llegan mensajes. Apagado hasta que lo enciendas; necesita un relay actualizado
  para ello, al que lleguen los servidores de XMPP (su dueño abre un puerto para ellos), y un servidor XMPP que envíe
  avisos a las apps inactivas, como casi todos.
- **Una cuenta nueva:** en la pantalla de inicio de sesión, **Crear una cuenta nueva** crea una en un servidor de XMPP
  que lo permita (XEP-0077), con una dirección y una contraseña. Un servidor que pide un captcha, o crea cuentas solo
  en su web, lo dice y da su página si la tiene; crea la cuenta allí y luego inicia sesión aquí.
- **Contraseña y borrado:** **Cuenta**, en la pantalla de XMPP, tiene **Cambiar la contraseña** y **Borrar la
  cuenta**, que borra la cuenta del servidor para siempre, tras dos preguntas, la segunda pidiendo la dirección.
  Erevos olvida sus claves; puede que la dirección no se pueda crear de nuevo.
- **Encontrar grupos:** **Encontrar un grupo** tiene **Grupos en tu servidor**, los que el servidor deja encontrar a
  cualquiera, y **Buscar grupos públicos**, que pregunta a search.jabber.network: se entera de las palabras que buscas
  y ve el nombre de tu servidor, y tu servidor no. Un grupo público es un canal, sin cifrar.
- **Ubicaciones:** **Ubicación** envía dónde estás como un enlace geo:, como hace Conversations, cifrado como el chat;
  uno que llega así se muestra como ubicación, con **Abrir en mapas** en Android.
- **Vistas previas de enlaces:** en un chat escrito sin cifrado, con **Vistas previas de enlaces** activadas, el
  primer enlace va con su vista previa (XEP-0511), y una que llega así se muestra bajo las palabras. Un chat cifrado
  no envía ninguna, porque diría a los servidores qué es el enlace.

**Por qué:** los chats propios de Erevos ocultan quién habla con quién; un servidor de XMPP no puede. Por eso los chats
de XMPP van aparte y marcados, para las personas a las que solo llegarías por XMPP.

- **Lo que lleva un mensaje:** las marcas de cómo se ven las palabras y direcciones web que se pueden tocar, como en
  un chat de Matrix, con **Cámara**, **Vídeo**, **Tarjeta de contacto** y **Calidad de la foto** (ver
  [Matrix](#matrix)). En un grupo, al escribir @ ves sus miembros, y un toque escribe el nombre de ese miembro en el
  grupo, como hace Conversations.
- **Un nombre tuyo:** **Ponerle un nombre aquí**, al pie del chat de un contacto, guarda un nombre tuyo para él en tus
  contactos de tu servidor XMPP, así que tus otras apps de XMPP también lo muestran. No se le avisa. Déjalo vacío para
  volver a mostrar su dirección.
- **Borradores:** lo que escribes y no envías queda como borrador del chat, cifrado solo en este teléfono. Vuelve
  cuando abres el chat otra vez, también después de que Erevos se cerró, y la lista de la pantalla de inicio lo
  muestra en la fila del chat como **Borrador**.
- **Enviar más tarde:** mantén pulsado **Enviar**, elige una hora (**En 1 hora**, **Esta noche 20:00**, **Mañana
  09:00** o cualquier día y hora) y toca **Enviar más tarde**. El mensaje espera en este teléfono, cifrado, con borde
  discontinuo después de los mensajes del chat y con su hora, y sale de este teléfono a esa hora mientras Erevos está
  desbloqueado, en Android también en segundo plano; si no, en cuanto vuelve a desbloquearse. Solo texto. Tócalo para
  enviarlo ya o eliminarlo. En los chats ocultos sale solo mientras están abiertos, salvo que reciban también
  cerrados. Uno que trajo de vuelta una copia de seguridad restaurada, cuya hora llegó antes de restaurarla, no sale
  solo: el teléfono del que vino la copia puede haberlo enviado ya.
- **Volver a enviar:** un mensaje tuyo que muestra **No enviado** tiene **Volver a enviar** y **Eliminar** en su menú.
- **Recordarme:** el menú de un mensaje tiene **Recordarme**. Elige una hora: el mensaje, con el nombre de su chat, va
  a **Chat conmigo** y te lo recuerda entonces. Necesita **Erevos** activado en [Módulos](#modules).
- **Mensajes temporales:** **Mensajes temporales**, bajo el campo de mensaje, elimina de este teléfono los mensajes
  nuevos ese tiempo después de enviarse, y **Temporal** lo hace solo para el siguiente mensaje. El otro lado los
  guarda: XMPP no tiene forma de eliminarlos allí. Los mensajes que ya están aquí se quedan.
- **Aparecer sin conexión:** al pie de un chat con una persona, **Aparecer sin conexión** te muestra sin conexión para
  ella, muestre lo que muestre tu cuenta a los demás, y no le dice nada de lo que lees o escribes, ni que sus mensajes
  llegaron. Un grupo que compartís aún te muestra. Vale solo para la conexión de este teléfono.
- **Comprobar en persona:** bajo **Sus claves**, **Comprobar en persona** muestra un código de tu dirección y tus
  claves, como hace Conversations. Fotografía allí el suyo: cada uno de sus dispositivos cuya clave coincide se marca
  como comprobado. Una clave que difiere no marca nada y lo dice: puede haber alguien en medio, o cambiaron de app. No
  se envía nada.
- **Contactos bloqueados:** la pantalla de XMPP lista a quién bloquea la cuenta, con **Desbloquear**.

## Chats con otras apps de Nostr {#nostr-chats}

En **Ajustes** → **Relay y redes** → **Chats de Nostr**, un espacio puede tener una clave de Nostr propia, para chatear
de tú a tú o en grupos con personas que usan Damus, Amethyst, Primal, 0xchat u otra app de Nostr que envía mensajes
privados como pide NIP-17. No es [A través de Nostr](#nostr), que lleva los chats propios de Erevos.

- **La clave:** **Crear una clave de Nostr** crea una para este espacio; **O traer una clave de otra app de Nostr**
  toma el nsec de una que ya tienes, y lee lo que sus relays aún guardan. La clave y sus chats se guardan cifrados en
  este espacio, y están en las copias de seguridad: tras restaurar, vuelven como estaban. Sus chats ocultos pueden tener
  una clave de Nostr propia, ver [Chats ocultos](#hidden). **Mostrar la clave secreta (nsec)** la muestra, para anotarla
  o llevarla a otra app: quien la tenga lee estos chats y escribe como tú.
- **Tu clave de Nostr:** da su npub a las personas que deban escribirte, con **Copiar** o **Mostrar el código QR**.
  **Tu nombre**, si das uno, es público: otras apps de Nostr lo muestran en lugar de tu npub. Allí solo cambia el nombre: una
  foto o unas palabras que otra app de tu clave puso en tu perfil se quedan.
- **Chats:** **Chat nuevo** toma su npub (o nprofile), de su perfil en su app, o un nombre como nombre@example.org
  (NIP-05). **Mostrar a las personas que sigues**, debajo, lista las personas que sigue tu clave de Nostr (su lista
  pública de seguidos, buscada también en relays que reúnen esas listas y en los relays donde escribe tu clave), con
  sus nombres: toca una para escribirle. Cuando no encuentra a nadie, dice por qué, de quién buscó la lista y cómo
  respondió cada relay. No se carga nada hasta que lo tocas, ni fotos de perfil. Los chats también están en la lista de
  inicio, cada uno marcado **Nostr**; el botón **Nostr** muestra solo ellos, y allí **Chat nuevo** abre
  esta pantalla. **Ponerle un nombre aquí** da a un chat un nombre que solo ves tú.
- **Grupos:** **Grupo nuevo** crea uno con dos o más de las personas con quienes chateas, veinte como mucho, con un
  nombre si quieres. Los grupos de Nostr no tienen administradores: un grupo son las personas que nombran sus mensajes,
  cada mensaje va a cada una, cifrado para cada una, y nadie puede añadirse ni quitarse después; un grupo con otras
  personas es un grupo nuevo. **Ponle nombre al grupo** le cambia el nombre para todos, con tu próximo mensaje. Un
  mensaje que otra app te envía a ti y a otros se muestra también como grupo, cada mensaje con quién lo escribió.
- **Fotos y archivos:** **Foto** y **Archivo**, bajo el campo del mensaje de un chat, envían uno de hasta 20 MB. Se
  cifra en este teléfono con una clave hecha solo para él (AES-GCM, como pide NIP-17) y se pone en un servidor de
  archivos Blossom, que guarda solo lo que no puede leer; su clave va en el mensaje, cifrada como los mensajes, y la
  subida la firma una clave hecha solo para ella, así que el servidor no sabe de quién es. En Android, los archivos van
  por Tor como estos chats. **Servidores de archivos** dice adónde van, al primero que acepte uno: blossom.primal.net,
  blossom.band y nostr.download si no los cambias. Una foto o un archivo que llega se trae solo cuando tocas **Mostrar
  foto** o **Guardar**, y se abre solo si es el que se envió.
  Toca una foto que se muestra para verla en toda la pantalla, como en el chat de un contacto: dos dedos o un doble
  toque la amplían, gira con el teléfono, y **Guardar** la conserva (ver Fotos y archivos, en [Chatear a través de un
  relay](#relay)).
- **Reacciones:** mantén pulsado un mensaje para abrir su menú y reaccionar con 👍, ❤️, 😂, 😮, 😢 o 🙏, o con una de las que
  hay tras **+**; debajo se ven las reacciones, la última de cada persona, como las envían otras apps de Nostr (NIP-25).
  Toca una reacción bajo un mensaje para añadir la misma, o toca la tuya para retirarla; a las apps de los demás se les
  pide que la quiten.
- **Respuestas:** **Responder**, en el menú de un mensaje que mantienes pulsado, le responde. El mensaje aparece sobre
  el campo del mensaje, con una ✕ para soltarlo, y luego encima de tu respuesta en el chat, donde un toque va a él.
  Otras apps de Nostr también la muestran como respuesta (NIP-17 la marca como respuesta). Una foto, un archivo o un
  mensaje de voz que envías mientras aparece también le responde. **Copiar**, en el mismo menú, toma las palabras de un
  mensaje.
- **Mensajes de voz:** mantén pulsado el micrófono bajo el campo del mensaje para grabar, y suelta para enviar; desliza
  a la izquierda antes de soltar para descartar la grabación. Un minuto es el máximo, y una pulsación de menos de un
  segundo no envía nada. Va como un archivo: cifrado en este teléfono y puesto en un servidor de archivos, con lo que
  dura dentro del mensaje; si otra app lo reproduce como mensaje de voz o como archivo de sonido lo decide esa app. Uno
  que llega con su duración se reproduce con **Reproducir**, y se trae solo cuando lo reproduces.
- **Fijar solo para mí:** mantiene un mensaje arriba del chat, solo en este teléfono; nadie más lo ve.
- **Seleccionar:** elige varios mensajes para **Copiar**, **Reenviar** a otro chat de Nostr (las fotos y los archivos se
  envían otra vez) o **Eliminar**. Eliminar los quita de este teléfono y pide a las apps de los demás que eliminen
  también los tuyos: sus apps pueden hacerlo o no.
- **Este teléfono o todos:** **Eliminar** pregunta primero: **Este teléfono** los elimina solo aquí, y siguen ocultos
  si vuelven a llegar; **Para todos** pide además a las apps de los demás que eliminen los tuyos (NIP-09), algo que
  pueden hacer o no.
- **Stickers:** **Sticker** envía tus propios stickers hechos con fotos (**Míos**) como fotos, cifradas: otras apps de
  Nostr los muestran como fotos. Los grupos que trae Erevos también están: cada sticker va como su imagen, hecha en tu
  dispositivo.
- **Cifrado:** cada mensaje se cifra para la otra persona y lo firmas tú, y luego lo envuelve otra vez una clave creada
  solo para ese mensaje, con su hora atrasada hasta dos días (NIP-17, con NIP-44 y NIP-59). Los relays ven para quién
  es, no quién lo escribió, cuándo ni qué dice. Una copia va a tus propios relays, para que tus otras apps de Nostr con
  esta clave lean también. Es código propio de Erevos, sin auditar, comprobado con el ejemplo del propio NIP-17 y frente
  a nostr-tools.
- **Dónde llegan tus mensajes:** los relays a los que otras apps envían tus mensajes: relay.damus.io, nos.lol y
  relay.primal.net si no los cambias, tres como mucho. Erevos se los dice a otras apps (una lista kind 10050) cuando
  cambian y una vez por semana. Envía a los relays que nombra la app de la otra persona; una app que no nombra ninguno
  aún no puede recibir un mensaje, y Erevos lo dice. Una clave traída de otra app lee donde esa app indicó que llegan
  tus mensajes (su propia lista kind 10050), salvo que los hayas cambiado aquí, y vuelve a decir esa lista, así que
  ambas apps reciben los mismos mensajes; lee esos relays desde su principio, y trae una vez lo que los relays nombrados
  en listas anteriores de la clave aún guardan.
- **Mensajes privados antiguos:** muchas apps aún envían y guardan mensajes privados a la manera antigua (NIP-04, kind
  4); Damus y Primal los mostraron durante años. Erevos también los lee, pasados y nuevos, y los muestra en los mismos
  chats: en los relays donde llegan tus mensajes y en hasta cuatro más, los que lee la otra app de tu clave (su lista
  kind 10002, para una clave traída de otra app) y relay.damus.io, nos.lol y relay.primal.net. Estos mensajes también
  van cifrados, pero los relays ven quién escribió a quién y cuándo. El propio Erevos solo envía a la manera de NIP-17.
- **Publicaciones públicas:** en un chat con una persona, **Publicaciones públicas** muestra lo que publica para todos
  (kind 1) y las publicaciones de otras personas que volvió a compartir, las más recientes primero, de treinta en
  treinta, con **Publicaciones anteriores** para ver más. Es solo de lectura: desde aquí no se puede responder,
  reaccionar ni publicar nada. Se busca al abrirlo, en los relays que se usan para las búsquedas y en aquellos donde,
  según su lista de relays (NIP-65), escribe, como indica la elección de Tor de este espacio, y nada de ello se guarda.
  No se abren imágenes ni enlaces: se muestran como direcciones, que se pueden copiar. Una publicación con advertencia
  de contenido muestra sus palabras tras tocar **Mostrar**. Una cuenta que solo publica para todos, como la de un
  proyecto, no envía mensajes privados: su chat queda vacío y sus publicaciones están aquí.
- **El feed público:** en la pantalla de inicio, el botón **Público** muestra un solo feed con lo que publican para todos
  las personas que sigue tu clave de Nostr, y lo que compartieron de nuevo, y con los mensajes de las salas públicas de
  Matrix en las que estás (salas a las que puede unirse cualquiera), las más recientes primero, como en Amethyst: la
  cara de quien escribió, con una pequeña **N** o **M**, su nombre, cuándo, las palabras, las fotos dentro de la
  publicación (una a todo el ancho, de dos a cuatro en una cuadrícula) y, para el primer enlace, una tarjeta con su
  imagen, sitio, título y una línea. En Matrix, la línea bajo el nombre dice la sala y su servidor: tócala para abrir la
  sala. Vienen más al llegar al final, o con **Publicaciones anteriores**; tira de la lista hacia abajo para las más
  recientes (en un navegador, **Volver a buscar**). Seguir a gente se sigue haciendo en otra app de Nostr con la misma
  clave. Tu lista de seguidos, dónde escriben (sus listas NIP-65) y sus publicaciones se buscan solo mientras el feed se
  ve, en los relays de las búsquedas, en los que reúnen listas y en los que ellos escriben, como dice la opción de Tor
  del espacio; los nombres solo para las publicaciones que se ven. No se guarda nada.
  **Fotos**, sobre el feed, es la elección que importa para la privacidad. Una foto o una tarjeta de enlace viene del
  servidor donde la puso quien escribió la publicación, y ese servidor ve la dirección desde la que se trajo, por Tor la
  de una salida de Tor, y que alguien la abrió. **Siempre** las muestra al instante, por Tor cuando Tor está activado en
  este espacio; **Solo por Tor** las muestra solo cuando Tor está activado, y si no, al tocar; **Al tocar** no trae
  ninguna antes de que la toques. **Vistas previas de enlaces** activa o desactiva las tarjetas. No se trae nada
  mientras el feed no se ve, una foto se guarda solo mientras se ve su publicación, y ninguna se almacena; la que no
  llega muestra **Mostrar la foto** para intentarlo de nuevo. Solo se traen direcciones de internet, nunca una de este
  teléfono ni de tu red doméstica.
  Bajo una publicación de Nostr: **Responder** escribe una respuesta, **Compartir de nuevo** la muestra a tus seguidores
  (antes pregunta), el corazón le da Me gusta, y la flecha comparte un enlace a ella. Sus tres puntos: **Copiar texto**,
  las **Publicaciones públicas** de quien la escribió, **Escribirle**, y **Retirar** si es tuya. Toca una publicación
  para abrirla con cuántos le dieron Me gusta y la compartieron de nuevo, y sus respuestas. **Nueva publicación**, el
  lápiz, escribe una publicación pública, con hasta cuatro fotos. Las respuestas, compartir de nuevo, los Me gusta y las
  publicaciones son públicos y van firmados con la clave de Nostr del espacio: cualquiera puede leerlos, y se ve que son
  tuyos; una foto que añades se pone sin cifrar en el servidor de archivos del espacio, como debe ser en una publicación
  pública. Bajo un mensaje de Matrix: **Responder**, **Reaccionar** (a elegir entre seis) y compartir (un enlace de
  matrix.to), y en sus tres puntos **Copiar texto** y **Abrir la sala**. Siempre es la clave y la cuenta de este
  espacio, nunca las propias de los chats ocultos.
- **Encuestas:** en el feed público una encuesta se ve con sus respuestas, para **Votar** y, mientras está abierta, con
  **Resultados**. **Nueva publicación** y luego **Encuesta** hace una: hasta 10 respuestas, una o varias a elegir,
  abierta 1, 3 o 7 días. Los votos son públicos: cualquiera puede ver lo que elegiste. Una reacción tuya bajo una
  publicación se retira tocándola otra vez.
- **Emoji personalizados:** en el feed público, los emoji que hacen otras apps se cargan como las fotos de las
  publicaciones, según dicen arriba **Fotos** y Tor. En los chats privados se ven como :nombre: y nunca se cargan.
- **Marcas:** un ✓ en cuanto uno de sus relays aceptó el mensaje. NIP-17 no devuelve nada: ni cuándo lo tiene su app, ni
  cuándo lo leen. Leer un chat aquí no se lo dice a nadie.
- **No anónimo:** tu clave es la misma para todos a quienes escribes, y cualquiera que tenga un npub puede escribirle.
  Los relays donde llegan tus mensajes ven a tu clave leerlos y, sin Tor, desde dónde. Solo la conexión que lee tus
  relays les dice quién lee, cuando un relay lo pide (NIP-42); enviar y buscar personas, nunca.
- **Por Tor:** en Android, **Tor** en esta pantalla elige cómo esta cuenta de Nostr llega a sus relays y servidores de
  archivos, como la cuenta de cada red: **Desactivado**, lo predeterminado para una clave nueva, directo; **Como el
  espacio**, como dice la elección del espacio en **Ajustes** → **Relay y redes** → **Tor** (con **Mensajes** por Tor
  en cuanto Tor está listo, con **Todo** solo por Tor); **Siempre por Tor**, solo por Tor, iniciado para ella, nunca
  directo. Una clave de antes de esta elección también empieza en **Desactivado**. La pantalla dice por dónde van ahora. En la app
  web y en un ordenador van directo.
  **Por Tor**, al pie de un chat, envía solo ese chat únicamente por Tor, sea cual sea el modo del espacio, en circuitos
  propios, para que ninguna salida de Tor lleve sus mensajes junto con los de otro chat: lo que envías en él, la
  búsqueda de dónde leen, y sus fotos y archivos; sin Tor, no sale nada de él. Lo que te llega sigue el modo del
  espacio, ya que una sola conexión lee tus mensajes para todos los chats. Se guarda solo en este teléfono.
- **Notificaciones:** un mensaje que llega muestra un aviso y cuenta en el número del icono de Erevos, como en los chats
  propios de Erevos, mientras este espacio está abierto; en un ordenador, mientras Erevos funciona. En Android,
  **Notificaciones**, al final de un chat, lo silencia o le da un sonido propio; un chat silenciado no cuenta.
  **Apariencia del chat**, a su lado, da al chat un aspecto propio.
- **Opciones del chat:** el botón de los deslizadores junto a donde escribes, o **⋯** arriba, las abre todas en una
  lista ordenada, a mano por largo que sea el chat: **Notificaciones**, **Apariencia del chat**, el PIN, las capturas
  y los mensajes que desaparecen en **Este chat**, y luego búsqueda, multimedia, un día y exportar en **Buscar**.
- **Aún no:** archivos que otra app cifra de otro modo (se muestran como un archivo que Erevos no puede abrir).

**Por qué:** mucha gente está en Nostr y seguirá allí. Así les escribes desde Erevos, aparte y marcado, porque una clave
de Nostr es la misma para todos a quienes escribes, mientras que los chats propios de Erevos ocultan quién habla con
quién.

- **Lo que lleva un mensaje:** como en un chat de Matrix (ver [Matrix](#matrix)), y **Ubicación**, que envía dónde
  estás como una dirección geo: y un enlace de mapa que cualquier app de Nostr puede mostrar; un lugar enviado así se
  ve como un lugar. En un grupo, al escribir @ ves sus miembros, nombrados de modo que cualquier app de Nostr sabe a
  quién se refiere. Un mensaje que reenvías se marca **Reenviado** solo en tu teléfono.
- **Borradores:** lo que escribes y no envías queda como borrador del chat, cifrado solo en este teléfono. Vuelve
  cuando abres el chat otra vez, también después de que Erevos se cerró, y la lista de la pantalla de inicio lo
  muestra en la fila del chat como **Borrador**.
- **Enviar más tarde:** mantén pulsado **Enviar**, elige una hora (**En 1 hora**, **Esta noche 20:00**, **Mañana
  09:00** o cualquier día y hora) y toca **Enviar más tarde**. El mensaje espera en este teléfono, cifrado, con borde
  discontinuo después de los mensajes del chat y con su hora, y sale de este teléfono a esa hora mientras Erevos está
  desbloqueado, en Android también en segundo plano; si no, en cuanto vuelve a desbloquearse. Solo texto. Tócalo para
  enviarlo ya o eliminarlo. En los chats ocultos sale solo mientras están abiertos, salvo que reciban también
  cerrados. Uno que trajo de vuelta una copia de seguridad restaurada, cuya hora llegó antes de restaurarla, no sale
  solo: el teléfono del que vino la copia puede haberlo enviado ya.
- **Recordarme:** el menú de un mensaje tiene **Recordarme**. Elige una hora: el mensaje, con el nombre de su chat, va
  a **Chat conmigo** y te lo recuerda entonces. Necesita **Erevos** activado en [Módulos](#modules).
- **Mensajes temporales:** **Mensajes temporales**, bajo el campo de mensaje, elimina de este teléfono los mensajes
  nuevos, enviados o recibidos, ese tiempo después de enviarse. Los tuyos llevan ese tiempo (NIP-40), así que su app y
  los relays que lo respetan los eliminan entonces; los que no, los guardan. **Temporal** lo hace solo para el
  siguiente mensaje. Un mensaje que llega con su propio tiempo se va a esa hora.
- **Bloquear:** **Bloquear**, al pie de un chat, descarta en este teléfono lo que envía esa clave, sin leer; no vuelve
  si la desbloqueas. No se le avisa: Nostr no puede impedir que nadie te escriba. **Contactos bloqueados**, en la
  pantalla de chats de Nostr, los lista, con **Desbloquear**.
- **Comprobar en persona:** en un chat con una persona, **Comprobar en persona** muestra el código de tu clave.
  Fotografía el código que muestra su app (nostr:npub…): el chat se marca como comprobado cuando es la clave de este
  chat. No se envía nada.

## Telegram {#telegram}

Solo en Erevos+, en Android, un espacio puede iniciar sesión en tu cuenta de Telegram y chatear con personas en Telegram, en **Ajustes** → **Relay y redes** → **Telegram**. Erevos no está hecho por Telegram y usa la API de Telegram. Los chats se unen a la lista de la pantalla de inicio, marcados como **Telegram** y con un chip propio.

- **Iniciar sesión:** toca **Iniciar sesión en Telegram**, escribe tu número de teléfono con el prefijo del país y luego el código que envía Telegram: a su aplicación en tus otros dispositivos, por SMS o por llamada; **Enviar el código otra vez** lo pide de nuevo. Si tu cuenta tiene una contraseña de verificación en dos pasos, Erevos la pide y muestra tu pista. Si Telegram quiere que confirmes en otro dispositivo, Erevos muestra el enlace que abrir allí. Una cuenta nueva de Telegram o entrar con correo electrónico, Erevos aún no lo puede hacer: hazlo una vez en la aplicación oficial de Telegram. Lo que Telegram guarda en este teléfono se guarda cifrado en este espacio.
- **Chats normales:** Telegram puede leerlos. Un chat normal de Telegram está cifrado solo entre tú y los servidores de Telegram, y los grupos y canales nunca están cifrados de extremo a extremo. Un chat privado lo dice arriba: **Telegram puede leer este chat**.
- **Cifrado ErevosGram:** en un chat privado, **Cifrado ErevosGram** envía una invitación a la otra persona. Si usa {=Erevos} o la aplicación ErevosGram y toca **Aceptar**, el chat pasa a ser **Cifrado de extremo a extremo (ErevosGram)**: lo que escribís los dos se sella con el protocolo propio de Erevos antes de llegar a Telegram, que solo ve texto que no puede leer. Cuando te invitan ellos, el chat muestra **Quieren el cifrado ErevosGram**, con **Aceptar** y **Rechazar**. Es código propio de Erevos, sin auditar. Lo escrito antes de activarlo sigue pudiendo leerlo Telegram.
- **Número de seguridad:** toca el candado de arriba en un chat cifrado para ver su número de seguridad. Compáralo con el de su teléfono, por otra vía distinta a Telegram, y toca **Marcar como verificado** cuando los dos sean iguales. Si sus claves cambian, el chat te avisa: compara de nuevo antes de fiarte.
- **Llamadas:** en un chat privado, el botón de llamada de arriba inicia una llamada de voz de Telegram, y una entrante aparece sobre cualquier pantalla con **Responder** y **Rechazar**. La llamada la hace el propio sistema de Telegram, cifrada de extremo a extremo con el cifrado de llamadas de Telegram. Compara los cuatro emojis de tu pantalla con los del otro teléfono: si son iguales, nadie escucha. **Videollamada**, al lado, empieza una con tu cámara encendida; una videollamada suena con **Responder con vídeo** junto a **Responder**. En cualquier llamada, **Cámara** enciende o apaga tu cámara y **Cambiar** pasa de la delantera a la trasera; la imagen de la otra persona llena la pantalla mientras su cámara está encendida.
- **Chats y Ajustes:** la pantalla de Telegram muestra tus chats en filas, como la pantalla de inicio, y trae más al bajar. **Ajustes**, junto al título, tiene **Anuncios en canales**, **Carpetas de Telegram**, las **Claves de ErevosGram** y **Salir de Telegram en este teléfono**; **Chats** allí, o Atrás, vuelve a la lista.
- **Traer claves de la app ErevosGram:** en la pantalla de Telegram, **Traer claves de la app ErevosGram**. En la app ErevosGram exporta las claves, lo que escribe erevosgram-keys.txt y muestra un código de 20 caracteres; pega la línea del archivo en Erevos y escribe el código. Los chats cifrados allí se abren aquí. Después no uses la app ErevosGram para esos chats. Si este espacio ya tiene claves ErevosGram, reemplazarlas se pide aparte y los chats cifrados aquí hasta entonces dejan de abrirse.
- **Anuncios en canales:** desactivados salvo que actives **Anuncios en canales** en la pantalla de Telegram. Telegram pide a las apps que muestren sus anuncios en canales públicos grandes; activados, un canal puede mostrar arriba una tarjeta pequeña marcada **Anuncio**, que puedes cerrar.
- **Carpetas:** las carpetas que creaste en Telegram aparecen como fichas en la pantalla de Telegram, entre **Chats** y **Archivar**. En **Carpetas de Telegram**, activa las que quieras: cada una aparece como su propia pestaña allí y en la pantalla de inicio. En cuanto hay una carpeta activada, solo notifican los chats de esas carpetas. En Telegram las carpetas quedan como están.
- **Información del chat:** toca el nombre de un chat para ver cuándo estuvo la persona por última vez, su nombre, número y biografía, o la descripción, los miembros y los enlaces de un grupo. Allí puedes silenciar el chat, fijarlo, archivarlo, marcarlo como leído o no leído, ponerlo en tus carpetas de Telegram (Telegram las cambia en todos tus dispositivos), hacer que los mensajes nuevos se borren solos tras un día, una semana o un mes, bloquear a la persona, borrar el historial y borrar el chat o salir del grupo o del canal.
- **Opciones del chat:** el botón de los deslizadores junto a donde escribes abre, en una lista ordenada a mano por largo que sea el chat, **Notificaciones** e **Información del chat** en **Este chat**, y luego **Buscar** e **Ir a un día** en **Buscar**.
- **Enviar fotos y archivos:** **+**, junto a donde escribes, abre como en un chat de Erevos una cuadrícula con iconos: **Foto**, **Cámara**, **Archivo** y el resto, con **Enviar más tarde** bajo **Forma de envío**. Lo que hayas escrito va debajo como su texto. El cifrado de ErevosGram cubre solo el texto: en un chat cifrado Erevos pregunta antes, porque Telegram puede leer fotos y archivos.
- **Editar, reenviar, buscar:** mantén pulsado un mensaje tuyo y toca **Editar** para cambiar su texto (no en un chat cifrado), o mantén pulsado un mensaje normal y toca **Reenviar** para mandarlo a otro chat. **Buscar**, arriba en un chat, recorre sus mensajes.
- **Mensajes de voz:** con nada escrito, el micrófono junto a **Enviar** graba mientras lo mantienes pulsado; suéltalo para enviar, desliza a la izquierda para cancelar. Como un archivo, un mensaje de voz no lo cubre el cifrado de ErevosGram, así que en un chat cifrado Erevos pregunta antes.
- **Reacciones:** mantén pulsado un mensaje y toca **Reaccionar** para elegir un emoji. Las reacciones salen bajo el mensaje; toca una para dar o retirar la tuya.
- **Encuestas y stickers:** en un grupo o canal, **+** → **Encuesta** pide una pregunta, de dos a diez opciones y si los votos son anónimos y se permiten varias respuestas. Toca una opción para votar (**Votar**, si se permiten varias); **Retirar voto** lo quita y **Cerrar encuesta**, en el menú de tu propia encuesta, la termina. **+** → **Sticker** envía uno de tus paquetes.
- **Hilos:** un mensaje con respuestas muestra cuántas; tócalo para leerlas y escribir una. **Responder en el hilo**, en el menú de un mensaje, abre o continúa un hilo en un grupo o canal.
- **Mensaje fijado:** un mensaje fijado sale en una barra arriba del chat; tócala para ir a él. **Fijar** y **Dejar de fijar** están en el menú del mensaje; en un chat privado eliges entre **Para los dos** y **Solo para mí**.
- **Varios mensajes:** **Seleccionar**, en el menú de un mensaje, te deja tocar más y luego **Copiar**, **Reenviar** o **Eliminar** juntos. Los mensajes cifrados no se pueden reenviar y se dejan fuera.
- **Miembros y administradores:** en un grupo o canal, la información del chat lista los **Miembros**, marcados como **Propietario** o **Administrador**; toca uno para escribirle. El propietario y los administradores pueden **Editar** el título y la descripción y **Quitar** a un miembro.
- **Más en grupos y chats:** con el permiso de añadir administradores, **Hacer admin** junto a un miembro elige lo que puede hacer, y **Permisos** junto a un administrador lo cambia o, con **Quitar como administrador**, lo vuelve miembro. **Añadir miembro** añade a uno de tus contactos, o a cualquiera por su @nombre; si su privacidad no lo permite, envíale el enlace de invitación. **+** → **Encuesta** puede crear un **Cuestionario**: toca la casilla junto a la respuesta correcta y, si quieres, añade una explicación; cuando alguien responde, la respuesta correcta aparece con ✅. Los stickers animados se mueven en el chat. **+** → **Sticker de Erevos** envía uno de los stickers de Erevos; Telegram lo recibe como un sticker de imagen fija. Una reacción con emoji personalizado muestra su imagen. Con varios mensajes fijados, la barra de arriba los muestra de uno en uno: cada toque va a uno y pasa al anterior. Un hilo tiene **+**, el micrófono y un menú de mensaje, como un chat. En la pantalla de inicio, en la pestaña de Telegram o en una de sus carpetas, el menú tiene **Marcar todo como leído**. Las fotos se ven solas en el chat y los GIF se reproducen allí; un vídeo muestra su imagen con ▶ y cuánto dura, y un toque lo reproduce en toda la pantalla, con sonido. El nombre y los botones del chat se quedan arriba mientras te desplazas. **Bloquear con un PIN**, en la información de un chat, lo bloquea como un chat de Erevos: pide su PIN cada vez que se abre, y el inicio no muestra nada de lo que dice. **Mover a chats ocultos**, también allí, guarda el chat en los chats ocultos que abre su PIN: sale de las listas y cuentas de este espacio y solo aparece allí; **Volver a mis chats** lo trae de vuelta. Telegram lo sigue teniendo, en todos tus dispositivos. En **+** de un chat de Telegram, **Foto oculta** envía una foto que se ve borrosa hasta que se toca, y las que recibes se ven igual. **Ubicación** y **Tarjeta de contacto** en **+** envían un lugar o uno de tus contactos a un chat de Telegram, como los muestran las apps de Telegram; Telegram puede leer ambos, y una tarjeta solo se envía con número de teléfono. **Enviar más tarde** en **+** de un chat de Telegram envía lo escrito a la hora que elijas: Telegram lo guarda y lo envía entonces, aunque este teléfono esté apagado, y **se enviarán más tarde** encima del cuadro de mensaje los muestra, con **Enviar ahora** y **Eliminar**. No en un chat con cifrado ErevosGram. En un chat de Telegram, el botón de búsqueda también muestra sus **Multimedia, enlaces y archivos**: **Fotos**, **Vídeos**, **Mensajes de voz**, **Archivos** o **Enlaces**, cada tipo aparte, todos desde Telegram y no solo los de este teléfono; toca uno para ir a él en el chat. Con **Vistas previas de enlaces** activadas en Ajustes, el primer enlace de un mensaje enviado a un chat de Telegram va con la vista previa que hacen los servidores de Telegram, como en sus propias apps; las que llegan se ven bajo el texto, sin su imagen, y preguntan antes de abrir el enlace. **Bloquear capturas de pantalla** en la información de un chat de Telegram lo deja fuera de las capturas y de la vista de apps recientes en este teléfono, en Android; Telegram no puede pedir lo mismo a la otra parte. Un chat de Telegram abierto con su PIN, o guardado en los chats ocultos, también queda fuera, como un chat de Erevos. **Notificaciones** en la información de un chat de Telegram le pone sonido y tono propios en este teléfono, o lo silencia aquí un tiempo, como en un chat de Erevos; **Silenciar notificaciones** encima lo silencia en Telegram, en todos tus dispositivos. En un chat de Telegram, lo escrito y dejado vuelve cuando el chat se abre de nuevo: Telegram lo guarda como borrador en todos tus dispositivos, salvo en un chat con cifrado ErevosGram, donde solo lo guarda este teléfono mientras Erevos funciona. Un mensaje que no se pudo enviar tiene **Volver a enviar** y **Eliminar** en su menú, y el botón de búsqueda tiene **Ir a un día**. Mantén pulsada una foto, un vídeo o un archivo en un chat de Telegram y elige **Guardar en la Colección** para guardar allí una copia cifrada; la de un chat oculto va a su Colección. **Enviar a**, desde Compartir de otra app, también muestra los chats de Telegram del espacio, salvo los bloqueados con PIN, los guardados en chats ocultos o los canales: el texto va al cuadro de mensaje del chat, y una foto o un archivo de hasta 100 MB sale enseguida. En un chat de Telegram, un @nombre se puede tocar, y un enlace t.me (una persona, un grupo o canal, un mensaje, una invitación) se abre dentro del Telegram de Erevos, preguntando antes de unirte por invitación; los demás enlaces preguntan antes de abrirse en el navegador. **Tor para esta cuenta de Telegram**, en los ajustes de Telegram y antes de iniciar sesión, tiene **Desactivado** (lo de partida), **Como el espacio** y **Siempre por Tor**, como toda cuenta de otra red: con Siempre, o mientras el espacio envía Todo por Tor, Telegram se alcanza solo por Tor, con circuitos propios, también al iniciar sesión, y nunca directo, ni siquiera cuando Tor no puede conectar; la cuenta de cada lugar oculto elige por su cuenta. **Por Tor** en la información de un chat de Telegram lleva ese chat solo por Tor: Telegram tiene una conexión para todos los chats de una cuenta, así que toda la cuenta va por Tor mientras esté activado. Más lento, y las llamadas no van por Tor.
- **Buscar por @nombre:** arriba en la pantalla de Telegram, escribe un nombre en **Buscar por @nombre** para abrir el chat con esa persona o canal.
- **Chats ocultos:** cada lugar oculto puede tener una cuenta de Telegram propia, que no aparece en ningún sitio fuera de sus chats ocultos. Mira [Chats ocultos](#hidden).
- **Salir:** **Salir de Telegram en este teléfono**, al final de la pantalla de Telegram, te pide elegir: **Cerrar sesión también en Telegram** quita este teléfono de tus dispositivos en Telegram, y **Solo olvidarlo aquí** lo deja en la lista de allí hasta que lo quites en la aplicación de Telegram. En ambos casos Erevos borra lo que Telegram guardaba en este teléfono y las claves de ErevosGram, así que los chats cifrados no se pueden volver a leer.
- **Fotos y archivos:** una foto, un mensaje de voz, un vídeo o un archivo se descarga de Telegram solo cuando lo pides, y luego se muestra o se guarda. Los mensajes de voz y los vídeos se muestran por ahora como archivos.

## Messenger {#messenger}

Solo en Erevos+, en Android, Erevos puede iniciar sesión en tu cuenta de Facebook Messenger y chatear con personas en Messenger, en **Ajustes** → **Relay y redes** → **Messenger**, o desde su tarjeta en la pantalla de inicio. Erevos habla él mismo con los servidores de Meta, sin puente de por medio; no está hecho por Meta. La cuenta pertenece al teléfono, no a un espacio: sus chats se unen a la lista de inicio del primer espacio, marcados con **Messenger** y con una tarjeta propia. Activa o desactiva Messenger en **Ajustes** → **General** → **Módulos**.

- **Iniciar sesión:** **Iniciar sesión en Messenger** abre la propia página de inicio de sesión de Facebook. Entra allí como en facebook.com, con el código o la comprobación que pida Facebook, y Erevos guarda el inicio de sesión, cifrado, en este teléfono. Si Messenger lo termina más tarde, la pantalla de Messenger dice **Messenger te pide que vuelvas a iniciar sesión.**
- **Lo que Meta puede leer:** bajo el nombre de un chat, Erevos dice si está cifrado de extremo a extremo. Meta no puede leer un chat cifrado de extremo a extremo, pero sabe quién habla con quién y cuándo; cualquier otro chat, Meta puede leerlo.
- **Chats:** la pantalla de Messenger lista tus chats, los más recientes primero. **Chat nuevo** busca personas por nombre: escríbelo, toca **Buscar** y toca a la persona para empezar.
- **Escribir:** **+** junto al cuadro de mensaje ofrece **Foto**, **Cámara**, **Archivo** (hasta 100 MB) y **Sticker**. Con nada escrito, mantén pulsado el micrófono para grabar un mensaje de voz. Mantén pulsado un mensaje para su menú: una reacción, **Responder**, **Copiar** y **Eliminar**, con **Eliminar para todos** para tus propios mensajes y **Borrar para mí** para cualquiera. Las respuestas, reacciones, ediciones y eliminaciones se muestran según llegan. Las llamadas de Messenger no están en Erevos.
- **Abrir Facebook:** en la pantalla de Messenger, **Abrir Facebook** muestra la propia página de Facebook con el mismo inicio de sesión. Los enlaces de Messenger allí vuelven a Erevos; los demás enlaces se abren en tu navegador, sin las marcas de seguimiento de Facebook y nunca por Tor, así que ese sitio ve tu dirección de internet. Si la pantalla te pide primero cerrar sesión y volver a entrar, hazlo una vez: Messenger ahora inicia sesión en facebook.com. Facebook también tiene su propia tarjeta en la ventana **Servicios** de la pantalla de inicio, junto a Messenger, que lo abre al momento. Con Messenger **En su funda** no hay ni tarjeta ni botón: el inicio de Facebook está en la barra de la funda, y la tarjeta de Messenger abre la funda.
- **Messenger en su funda:** en la pantalla de Messenger, en **Cómo se usa Messenger aquí**, con **Por Erevos** (lo predeterminado) Erevos habla Messenger por sí mismo, y **En su funda** muestra en su lugar la propia página de Messenger de Meta, como en un ordenador, encerrada por Erevos con el mismo inicio de sesión; **Abrir Messenger** la abre. Solo cargan en ella los sitios de Meta, los enlaces hacia fuera se abren en tu navegador sin las marcas de rastreo de Facebook, y lo que guarda la página de Meta queda solo en la funda, aparte de cualquier otra página, para que reconozca tu teléfono y no pida cada vez el PIN de tus chats cifrados; se borra cuando cierras la sesión de Messenger o la abre otra cuenta. Las llamadas funcionan en ella, pero no a través de Tor: si Messenger va por Tor, la página va solo por Tor, sin llamadas, y los enlaces hacia fuera no se abren. Erevos te sigue avisando de los mensajes nuevos, aunque nunca hayas abierto la funda: un chat con mensajes sin leer aparece en el inicio hasta que se lee, y al tocarlo se abre en la funda; mientras la funda está abierta, Erevos no avisa, porque la página ya lo muestra. Los bloqueos de chat, los chats ocultos y la Colección no se aplican a sus chats. Se cierra en cuanto el espacio se bloquea o se cierra, y con el botón de pánico, y queda fuera de las capturas de pantalla y de la vista de apps recientes siempre que lo queda la pantalla del propio Erevos; lo mismo la página de Facebook. Se muestra bajo la propia barra de Erevos, con los colores de Erevos: **←** vuelve a Erevos, y **Facebook** en la barra muestra el feed de Facebook en la misma página, con **Messenger** para volver. La página se ajusta al ancho del teléfono, así que se lee sin ampliar. La propia página de Meta toma todo tu aspecto: sus colores, oscura o clara como Erevos, la forma de tus burbujas, tu tamaño de texto, las letras de tu estilo y lo que hay detrás de tus pantallas, y cambia con él incluso mientras está abierta; una foto tuya se queda en Erevos y la página muestra en su lugar un degradado suave. Donde Meta cambie su página, algunas partes pueden conservar el aspecto de Meta.
- **Opciones del chat:** el botón de los deslizadores junto a donde escribes, o **⋯** arriba, abre las **Notificaciones** del chat y **Por Tor** en una lista ordenada, a mano por largo que sea el chat.
- **Adjuntos y más:** **+**, junto a donde escribes, abre como en un chat de Erevos una cuadrícula con iconos: **Foto**, **Cámara** y **Archivo**, y **Sticker** donde el chat tiene stickers. Los chats de Signal y Session también lo tienen.
- **Notificaciones y lectura:** los mensajes nuevos te notifican y cuentan en el icono de Erevos, como los de otros chats. Abrir un chat lo marca como leído, y sigue leído hasta que alguien escriba de nuevo, incluso antes de que Messenger lo sepa. Cada chat tiene sus propias **Notificaciones** bajo su cuadro de mensaje: silenciado, o con un sonido propio.
- **Por Tor:** **Tor para esta cuenta de Messenger**, en la pantalla de Messenger y también antes de iniciar sesión, está en **Desactivado** por defecto, y los servidores de Meta ven tu dirección de internet; **Como el espacio** sigue **Ajustes** → **Relay y redes** → **Tor**; **Siempre por Tor** envía la cuenta, su inicio de sesión y sus imágenes solo por Tor. **Por Tor** bajo un chat envía toda la cuenta por Tor, pues Messenger tiene una sola conexión para todos sus chats. Meta puede pedir confirmación, o bloquear un tiempo, una cuenta que inicia sesión por Tor. Consulta [Quién ve tu dirección de internet](#ip).
- **Cerrar sesión:** **Cerrar sesión de Messenger en este teléfono** saca sus chats de Erevos; puedes iniciar sesión de nuevo. Las copias de seguridad guardan las notificaciones de cada chat y la elección de Tor, no el inicio de sesión: tras restaurar, inicia sesión otra vez.

## Signal {#signal}

Solo en Erevos+, en Android, Erevos puede tener tu cuenta de Signal y chatear con personas en Signal, en **Ajustes** → **Relay y redes** → **Signal**, o desde su tarjeta en la pantalla de inicio. Erevos habla el propio protocolo de Signal con los servidores de Signal, y todo chat está cifrado de extremo a extremo; no está hecho por Signal. La cuenta pertenece al teléfono, no a un espacio: sus chats se unen a la lista de inicio del primer espacio, marcados con **Signal** y con una tarjeta propia. Activa o desactiva Signal en **Ajustes** → **General** → **Módulos**.

- **Dos formas de entrar:** **Cuenta nueva de Signal con mi número** hace de Erevos el Signal de ese número, y la aplicación Signal de otro teléfono con el mismo número deja entonces de funcionar. **Vincular con Signal de otro teléfono** deja tu Signal donde está y añade Erevos como uno de sus dispositivos vinculados.
- **Una cuenta nueva:** escribe tu número con el prefijo del país, como +34 6…, y elige si el código llega por SMS o, con **El código llega por llamada**, por una llamada. Signal te pide primero resolver un captcha en su propia página. Luego escribe el código que Signal envió y el nombre que otros ven en Signal (el apellido es opcional).
- **Vincular:** en el otro teléfono, en Signal: Ajustes → Dispositivos vinculados → Vincular nuevo dispositivo, y escanea el código que muestra Erevos. Los mensajes nuevos llegan entonces a los dos.
- **Chats y grupos:** la pantalla de Signal lista tus chats y grupos, los más recientes primero. **Chat nuevo** busca a una persona por número de teléfono o por nombre; tócala para empezar. Los grupos en los que estás funcionan como chats; los grupos nuevos se crean en la aplicación Signal.
- **Escribir:** **+** ofrece **Foto**, **Cámara**, **Archivo** (hasta 100 MB) y **Sticker**; con nada escrito, mantén pulsado el micrófono para un mensaje de voz. Mantén pulsado un mensaje para una reacción, **Responder**, **Copiar** y **Eliminar**, con **Eliminar para todos** para tus propios mensajes y **Borrar para mí** para cualquiera. Mientras escribes, salen también los contactos del teléfono que coinciden, y un número escrito como **Número nuevo**: a Signal solo se le pregunta por el que tocas.
- **Llamadas:** en un chat con una persona, **Llamada de voz** y **Videollamada** la llaman en Signal, cifradas de extremo a extremo. Una llamada entrante de Signal aparece sobre cualquier pantalla, con **Responder**, **Responder con vídeo** y **Rechazar**. Las llamadas no pasan por Tor, y Erevos te avisa antes de cada una.
- **Notificaciones y lectura:** como en Messenger, los mensajes nuevos te notifican y cuentan en el icono, un chat leído aquí sigue leído, y cada chat tiene sus propias **Notificaciones**, con un tono propio para las llamadas.
- **Opciones del chat:** como en Messenger, el botón de los deslizadores junto a donde escribes, o **⋯** arriba.
- **Por Tor:** **Tor para esta cuenta de Signal**, también antes de iniciar sesión, funciona como en Messenger: **Desactivado** por defecto, así que los servidores de Signal ven tu dirección de internet. Con **Siempre por Tor**, el registro, su captcha y la vinculación también pasan por Tor. **Por Tor** bajo un chat envía toda la cuenta por Tor.
- **Cerrar sesión:** **Cerrar sesión de Signal en este teléfono** saca sus chats de Erevos. Las copias de seguridad guardan las notificaciones de cada chat y la elección de Tor, no la cuenta: tras restaurar, regístrate o vincula de nuevo.

## Session {#session}

Solo en Erevos+, en Android, Erevos puede tener una cuenta de Session y chatear con personas en Session, en **Ajustes** → **Relay y redes** → **Session**, o desde su tarjeta en la pantalla de inicio. Session no pide número de teléfono ni correo: la cuenta son 13 palabras de recuperación, y sus mensajes van cifrados de extremo a extremo por el enrutamiento cebolla de los nodos de Session. Erevos no está hecho por Session. La cuenta pertenece al teléfono, no a un espacio: sus chats se unen a la lista de inicio del primer espacio, marcados con **Session** y con una tarjeta propia. Activa o desactiva Session en **Ajustes** → **General** → **Módulos**.

- **Una cuenta nueva:** toca **Cuenta nueva de Session**, escribe tu nombre en Session y toca **Crear la cuenta**. Erevos muestra **Tus 13 palabras de recuperación**: anótalas, guárdalas bien y toca **Ya las anoté**. Son la única forma de recuperar la cuenta, y quien las tenga puede leer tus chats.
- **Una cuenta que ya tienes:** **Recuperar una cuenta con sus 13 palabras** toma las palabras, con espacios entre ellas, y tu nombre; luego toca **Recuperarla**.
- **Tu ID de Session:** la pantalla de Session lo muestra, con **Copiar**. Otros empiezan un chat contigo con él.
- **Chats:** **Chat nuevo** toma un ID de Session o un nombre ONS, y **Abrir** empieza el chat.
- **Grupos:** **Nuevo grupo de Session** crea un grupo con un nombre y las personas que elijas entre tus chats de Session. Reciben una invitación y entran cuando la aceptan, y tú eres su admin. En un grupo, su botón muestra los **Miembros**; un admin puede **Añadir personas**, **Cambiar nombre** al grupo y **Hacer admin** o **Quitar del grupo** a quien no sea admin. **Salir del grupo** lo deja, y volver necesita una invitación nueva.
- **Escribir:** **+** ofrece **Foto**, **Cámara**, **Archivo** (hasta 10 MB) y **Sticker**; con nada escrito, mantén pulsado el micrófono para un mensaje de voz. Mantén pulsado un mensaje para una reacción, **Responder**, **Copiar** y **Eliminar**.
- **Llamadas:** en un chat con una persona, **Llamada de voz** y **Videollamada** la llaman en Session. Session hace sonar sus llamadas él mismo, en silencio para un chat silenciado. Las llamadas no pasan por Tor, y Erevos te avisa antes de cada una.
- **Notificaciones y lectura:** como en Messenger y Signal, con las **Notificaciones** propias de cada chat y un tono propio para las llamadas.
- **Opciones del chat:** como en Messenger, el botón de los deslizadores junto a donde escribes, o **⋯** arriba.
- **Por Tor:** **Tor para esta cuenta de Session** funciona como en Messenger y Signal, **Desactivado** por defecto. El enrutamiento cebolla de Session ya oculta tu dirección de internet a quienes escribes; el primer nodo de Session la ve salvo que la cuenta vaya por Tor.
- **Cerrar sesión:** **Cerrar sesión de Session en este teléfono** pregunta antes, porque sin tus 13 palabras de recuperación la cuenta no puede volver. Las copias de seguridad no guardan la cuenta: tras restaurar, recupérala con sus palabras.

## SMS {#sms}

En Android, Erevos puede ser la app de SMS del teléfono: en **Ajustes** → **Teléfono y SMS** → **SMS** → **Erevos como
app de SMS**, toca **Hacer que Erevos sea la app de SMS**. La pantalla de inicio muestra entonces los SMS y los chats de
Erevos en una sola lista.

> **Erevos no cifra los SMS ni los MMS.** Viajan como cualquier SMS, y se quedan en el almacén de SMS del propio
> Android, donde cualquier app con permiso para leer SMS los ve y las copias de seguridad de Android los guardan. Solo
> los chats de Erevos están cifrados de extremo a extremo.

- **SMS de antes:** nada que importar. Erevos muestra los SMS y MMS que ya hay en el teléfono, del almacén propio de
  Android, donde se quedan para cualquier otra app de SMS. Android los guarda, sin sellar por Erevos, como con cualquier
  app de SMS.
- **Si Erevos no se convierte en la app de SMS:** Android 15 y posteriores pueden impedirlo a una app instalada desde un
  navegador. En **Ajustes** → **Teléfono y SMS** → **SMS** → **Erevos como app de SMS**, toca **Abrir aplicaciones
  predeterminadas** → **Aplicación de SMS** → Erevos. Si Android dice que es un ajuste restringido, abre la
  **información de la aplicación de Erevos**, toca **⋮** arriba a la derecha → **Permitir ajustes restringidos**, y
  vuelve a elegir Erevos.
- **Cuando llega un SMS:** un aviso dice «New message», sin quién lo envió ni qué dice. Si no llega ninguno,
  **Erevos como app de SMS** muestra **Permitir notificaciones** mientras Android los retenga.
- **Códigos de un solo uso:** un SMS que dice contener un código (de un banco, de un inicio de sesión), en cualquiera de
  los idiomas de la app, lleva **Copiar código** debajo en el chat, y también en su aviso, sin que el código se vea
  ahí; en Android 12 y posteriores el botón del aviso pide desbloquear antes el teléfono. Solo se copian sus 4 a 8
  dígitos, nunca un número de teléfono, un importe, una fecha ni una hora, y Android no muestra ninguna vista previa de
  ellos. Cualquier app que lea el portapapeles puede leerlos, así que pega el código pronto.
- **Responder desde el aviso:** **Ajustes** → **Teléfono y SMS** → **SMS** → **Lo que dice un SMS, en su aviso**,
  desactivado al principio, muestra en el aviso de un SMS quién escribió y qué mientras este espacio está abierto,
  con **Responder**, que envía un SMS simple por la SIM por la que llegó, y **Marcar como leído**. Quien vea la
  pantalla lo ve; bloqueado, o con otro espacio abierto, el aviso vuelve a decir solo «Mensaje nuevo», y uno con
  código de un solo uso siempre.
- **Si no aparece ningún SMS:** Android 15 y posteriores retienen el permiso de SMS a una app instalada desde un
  navegador. En **Ajustes** → **Teléfono y SMS** → **SMS** → **Erevos como app de SMS**, toca **Permitir SMS**. Si
  Android dice que es un ajuste restringido, abre la **información de la aplicación de Erevos**, toca **⋮** arriba a la
  derecha → **Permitir ajustes restringidos**, y permite los SMS en **Permisos**. Los chats enviados como RCS («chat» en
  Google Mensajes) se quedan en esa app y no aparecen.
  **Erevos como app de SMS** dice cuántas conversaciones SMS lee Erevos, o por qué no pudo leerlas.
- **Escribir a alguien con {=Erevos}:** va por Erevos, cifrado de extremo a extremo, en cuanto su número está vinculado a
  su contacto. Vincúlalo a mano en la conversación SMS, o deja que lo encuentre una invitación oculta. A partir de
  entonces su conversación SMS abre su chat.
- **Sus SMS en el chat:** los SMS y MMS con su número, los de antes y los que lleguen, aparecen entre los mensajes del
  chat por orden de hora, cada uno con un borde y marcado como **SMS (sin cifrar)**, con su ✓ y sus fotos. Mantén
  pulsado uno para copiarlo, reenviarlo o eliminarlo, como en la conversación SMS. Se quedan en los SMS del teléfono,
  nunca en el historial sellado del chat; solo aparece la conversación con ese único número, no un MMS de grupo, y solo
  mientras Erevos es la app de SMS o puede leer SMS, nunca en los chats ocultos. Los más recientes aparecen primero:
  **Mostrar SMS anteriores**, encima de ellos, trae más, y la búsqueda del chat también los encuentra. Abrir el chat
  marca como leídos todos los suyos, también los anteriores, para que ninguno quede contado en la pantalla de inicio. Un
  número en la ficha de su contacto hace lo mismo, sin vincularlo.
- **Un SMS normal a esa persona:** cuando no hay internet, por ejemplo. **SMS normal** en los **Detalles** del chat abre
  su conversación SMS para escribirlo ahí, y **+** → **Enviar como SMS**, o **Como SMS** al mantener pulsada la flecha
  de enviar, envía lo que escribiste como SMS, después de preguntar. Aparece en el chat como un SMS. La compañía
  telefónica puede leerlo. Un SMS no puede desaparecer ni responder a un mensaje: con el cronómetro activado, o con un
  mensaje respondido, Erevos lo dice al preguntar.
- **Invitaciones ocultas:** con el primer SMS a un número que no es un contacto, Erevos también envía una invitación
  oculta corta. No va ninguna al número de un contacto de Erevos, vinculado o en la ficha de su contacto. Un teléfono
  sin {=Erevos} no muestra nada; un teléfono con {=Erevos} responde por el relay y los dos se hacen contactos. Responde por
  sí mismo solo a un número que conoce, en tus contactos o uno al que has escrito por SMS; para cualquier otro
  pregunta primero, **Una invitación por SMS**, porque el remitente de un SMS puede ser inventado. A cada número se le
  pregunta como mucho una vez al mes, y **Desactivar invitaciones**, en **Ajustes** → **Teléfono y SMS** → **SMS** →
  **Descubrir Erevos en un número**, las detiene.

**Por qué:** para que dos teléfonos con {=Erevos} se encuentren solo a partir de un número de teléfono, sin ningún servidor
que conozca números. La invitación es un SMS de datos, que las apps de mensajería no muestran, así que un teléfono sin
{=Erevos} no muestra nada.

- **Todos los demás:** un SMS normal, marcado como SMS. La compañía telefónica puede leerlo, como lee cualquier SMS.
- **✓ y ✓✓✓:** un SMS tuyo muestra ✓ en cuanto salió, y ✓✓✓ en cuanto el informe de entrega de la red dice que llegó a
  su teléfono, o «no entregado». Algunas compañías telefónicas no envían informes de entrega; entonces se queda en ✓.
  Los SMS no pueden decir si se leyeron.
- **Fotos, mensajes de voz y tarjetas de contacto (MMS):** **+** → **Foto** añade una foto, reducida para caber en un
  MMS (unos 280 KB), sin nada en ella aparte de la imagen. Mantén pulsado el micrófono, sin nada escrito, para grabar un
  mensaje de voz de hasta un minuto, enviado como MMS en AMR, el formato que reproducen las apps de mensajes de los
  teléfonos. **+** → **Tarjeta de contacto** envía un contacto de los contactos del teléfono como vCard, sin tus notas
  sobre él ni sus grupos, y con su imagen solo si aún cabe. **+** → **Sticker** envía uno de los stickers que trae
  Erevos como su imagen, solo en un MMS. Las fotos, mensajes de voz y tarjetas de contacto que llegan se ven en la
  conversación, para reproducir o guardar (**Guardar** abre un contacto nuevo con los datos de la tarjeta). Un MMS es
  tan claro como un SMS: la operadora puede verlo.
- **Vídeos (MMS):** **+** → **Grabar un vídeo** pide a la app de cámara del teléfono un vídeo en calidad de MMS,
  hasta 30 segundos de imagen pequeña, que la mayoría de cámaras respetan; **Vídeo del teléfono** toma uno solo si
  ya es lo bastante pequeño, unos 280 KB, ya que Erevos no reduce vídeos. Un vídeo que llega muestra ▶ en la
  conversación, y un toque lo reproduce en la app de vídeo del teléfono.
- **MMS en el extranjero:** un MMS espera en la operadora hasta que el teléfono lo descarga por datos móviles, que
  en el extranjero pueden costar. **Ajustes** → **Teléfono y SMS** → **SMS** → **MMS** los descarga al momento pero,
  salvo que lo actives, no en itinerancia: entonces uno aparece en su conversación como **MMS** con su tamaño y
  **Descargar (puede costar)**, y también bajo **MMS**, para un número sin conversación aún. Desactivado del todo,
  cada MMS espera un toque.
- **Dónde estás:** **+** → **Ubicación** envía dónde estás como un SMS con una dirección geo: y un enlace de
  OpenStreetMap, que abre cualquier teléfono. Una dirección geo:, o un enlace de OpenStreetMap, Google Maps, Apple Maps
  o Waze, en un SMS que llega se ve como un lugar, para abrir en la app de mapas; un enlace corto sigue siendo un
  enlace, porque habría que descargarlo para saber el lugar.
- **Reacciones desde un iPhone o Google Messages:** cuando alguien sin Erevos reacciona a un SMS tuyo, su teléfono
  la envía como palabras, Liked “Nos vemos a las 8” o Reacted 😂 to “Nos vemos a las 8”: la conversación la muestra
  como 👍 o 😂 bajo el mensaje que nombra, el último con esas palabras, y no como un mensaje aparte; una retirada
  (Removed a like from …) desaparece. Por ahora solo se leen las escritas en inglés; una cuyo mensaje no se
  encuentra queda como llegó.
- **Fijados para ti:** mantén pulsado un mensaje y elige **Fijar solo para mí** para fijarlo sobre la conversación. Los
  SMS no tienen fijados: se guarda solo en este teléfono, cifrado con los datos de SMS del espacio, y la otra persona
  nunca lo sabe.
- **Varios mensajes:** mantén pulsado un mensaje y elige **Seleccionar**, luego toca otros: **Copiar** los pone en un
  solo texto, **Reenviar** los envía como uno al borrador de otra conversación, y **Eliminar** los elimina del teléfono,
  con **Deshacer** unos segundos.
- **SMS nuevo:** en la parte **SMS** de la lista de chats, el botón de abajo es **SMS nuevo** y abre solo eso,
  también con los chats propios de Erevos activados.
- **Elegir al destinatario:** en **SMS nuevo**, toca **Contactos** para elegir entre tus contactos, con búsqueda, o
  simplemente escribe: los contactos que coinciden con el nombre o el número que escribes aparecen bajo el campo, y un
  toque lo rellena. Un contacto con varios números muestra una línea por cada uno. En un grupo, cada contacto que elijas
  se añade a los números que ya hay. Son los contactos del teléfono y, con Erevos desbloqueado, los que se guardan solo
  en Erevos y tus contactos de Erevos con número, nunca los nombres de chats ocultos. Con solo los SMS abiertos, solo
  salen los contactos del teléfono. Android pregunta antes si Erevos puede leerlos.
- **MMS de grupo:** en **Ajustes** → **Teléfono y SMS** → **SMS** → **SMS nuevo**, escribe varios números separados por
  comas y toca **Escribir**. Cada mensaje va a todos ellos como un solo MMS, también el texto solo, y sus respuestas
  llegan a la misma conversación, cada una con quién la escribió. Todos los que están en ella ven el número de todos, y
  la compañía telefónica lo ve todo.
- **Dos SIM:** la SIM con la que enviar aparece encima del campo de mensaje; toca **Elegir la SIM** una vez para que
  Erevos las vea. Tu elección se guarda para ese número; hasta entonces, Erevos responde con la SIM por la que llegó el
  último mensaje. Cada mensaje muestra su SIM.
- **SMS más tarde:** mantén pulsado el botón redondo **Enviar** tras el campo y elige una hora, como en un chat. El SMS
  aparece al final de la conversación marcado como **Programado**; tócalo para cancelarlo. Sale a esa hora, también con
  Erevos cerrado y bloqueado; si el teléfono está apagado entonces, en cuanto se vuelva a encender y desbloquear. Hasta
  entonces no está en los SMS del teléfono, donde otras apps lo verían, y la compañía telefónica no lo tiene. Espera
  bloqueado con una clave del propio teléfono (Android Keystore), no con la contraseña de tu espacio, ya que Android
  tiene que enviarlo mientras Erevos está bloqueado: la protección que tiene cualquier SMS una vez enviado, ya que los
  SMS enviados se quedan en los SMS del teléfono. Solo texto, a un número.
- **Enlaces:** una dirección web en un SMS aparece subrayada, y se abre como en un chat, después de haberla visto
  entera.
- **Nombres de tus contactos:** desactivado al principio, así que los números de los SMS aparecen como números.
  **Nombres**, encima de la lista en la parte **SMS**, los desbloquea (como **Mostrar nombres de mis contactos** en **Ajustes** → **Teléfono
  y SMS** → **SMS** → **Nombres de tus contactos**): los nombres que los contactos de tu teléfono dan a los números de
  SMS, y las fotos que tienen para ellos, o si no los de tus contactos guardados solo en Erevos, en la lista y en la
  conversación. Toca **Nombres** otra vez para ver solo números. Erevos solo los lee para mostrarlos, y no guarda
  ninguna copia.
- **Remitentes con nombre:** un SMS de un nombre en lugar de un número, como el de un banco, se abre para leerlo, pero
  no se puede responder.
- **Recordarme:** mantén pulsado un mensaje para **Recordarme**: va a **Chat conmigo** con el nombre de la
  conversación, y te lo recuerda a la hora que elijas.
- **Mensajes temporales:** con Erevos como app de SMS, **Mensajes temporales**, bajo la línea **SMS normal** de una
  conversación, elimina de este teléfono sus SMS nuevos ese tiempo después de enviarse, o en cuanto Erevos vuelva a
  funcionar. El otro teléfono los guarda: un SMS no puede eliminarse allí. Los mensajes que ya están aquí se quedan.

### SMS cifrados cuando nada más funciona

Cuando fallan el relay, Nostr, los teléfonos cercanos y LoRa, un texto a un contacto de Erevos con número vinculado
puede ir por SMS, cifrado de extremo a extremo como cualquier mensaje de Erevos. Está desactivado salvo que lo actives:
para todos esos contactos en **Ajustes** → **Teléfono y SMS** → **SMS** → **SMS cuando nada más funciona** (**Activar
para todos los contactos**), o para uno en los **Detalles** de su chat → **SMS cuando nada más funciona**.

- **Lo que cuesta:** cada SMS cuesta lo que diga tu tarifa. Un texto corto ocupa 3 SMS y uno más largo hasta 10; en el
  extranjero un SMS puede costar mucho más.
- **Lo que ve la compañía telefónica:** qué número escribió a cuál, cuándo y cuántos SMS, como con cualquier SMS; nunca
  lo que se escribió, que va como el mismo mensaje cifrado que habría llevado el relay.
- **Lo que va:** solo textos y borrados. No fotos, archivos, mensajes de voz, llamadas, reacciones ni las marcas de que
  un mensaje llegó o se leyó, ni textos de más de unas 800 letras latinas (400 griegas), ni el primer mensaje a un
  contacto nuevo, que lleva las claves. Esos esperan, marcados **En espera**, como en
  [Cómo elige Erevos el camino](#paths). Los chats ocultos nunca van por SMS.
- **Ambos teléfonos** necesitan {=Erevos} como app de SMS, y el número del contacto vinculado a su chat. Los SMS son SMS
  de datos ocultos para Erevos, que ninguna app de SMS muestra, y nada de ellos queda en los SMS del teléfono.
- **Por dónde fue:** mantén pulsado el mensaje: su menú dice **Enviado por SMS** o **Llegó por SMS**. **✓✓** llega en
  cuanto se puede llegar de nuevo al relay o a Nostr: ningún SMS vuelve por sí solo.

**Por qué:** los SMS llegan a un teléfono sin nada de internet, donde haya red móvil. Pero cuestan dinero y le dicen a
la compañía telefónica quién habla con quién, lo que Erevos si no oculta; por eso el SMS es el último camino, y solo
cuando tú lo eliges.

> Actívalo solo para quienes necesites alcanzar así. La compañía telefónica, y quien pueda ver sus registros, sabe por
> estos SMS que vuestros dos números hablan, y cuándo.

### Mantener los SMS en orden

- **Mantener pulsado:** en la lista, mantén pulsada una conversación SMS para lo que puede hacer: **Fijar arriba**,
  **Archivar**, **Marcar como spam**, **Bloquear** y **Eliminar**, y **Añadir a contactos** para un número que no es
  ninguno de tus contactos. En una conversación, **⋮** arriba muestra lo mismo, y primero **Buscar en este chat**,
  **Multimedia, enlaces y archivos**, **Ir a un día** y **Exportar chat** (ver [Primeros pasos](#start)), y un número
  así también tiene **Añadir a contactos** bajo su nombre: un contacto nuevo con el número dentro.
- **Fijadas:** hasta 10 conversaciones SMS se quedan arriba de la lista, con una chincheta. **Dejar de fijar** devuelve
  una a su sitio.
- **Conversaciones archivadas:** fuera de la lista, en **Archivadas** arriba de la pantalla de inicio. Una vuelve sola
  a la lista cuando llega un SMS nuevo de ese número, o con **Desarchivar**.
- **Nombres de MMS de grupo:** mantén pulsado un MMS de grupo y elige **Darle un nombre aquí** para darle un nombre
  tuyo, solo en este teléfono.
- **Lo propio de una conversación:** bajo su línea **SMS normal**, una conversación tiene **Apariencia del chat**,
  como un chat, y, con un número, **Notificaciones**: siléncialo un rato o siempre, o dale un sonido propio, o
  ninguno. Valen mientras el espacio está abierto; con él cerrado, cada SMS avisa como dicen los ajustes.
- **Opciones del chat:** el botón de los deslizadores junto a donde escribes, o **⋯** arriba, las abre todas en una
  lista ordenada, a mano por largo que sea el chat: **Notificaciones**, **Apariencia del chat**, el PIN, las capturas
  y los mensajes que desaparecen en **Este chat**, y luego búsqueda, multimedia, un día y exportar en **Buscar**.
- **Papelera:** una conversación eliminada espera en la **Papelera** 30 días, y luego Erevos la elimina de los SMS del
  teléfono. Hasta entonces **Recuperar** la devuelve a la lista; **Eliminar ahora** y **Vaciar la papelera** eliminan al
  instante, para siempre. Un SMS que llega después de que fuera a la Papelera aparece de nuevo en la lista. Solo la app
  de SMS puede eliminar SMS.
- **Spam:** un filtro que funciona solo en el teléfono, con reglas, y no envía nada a ninguna parte. Un SMS de un número
  que no es un contacto y al que nunca respondiste va a **Spam** cuando tiene un enlace con palabras que intentan
  engañar, como un paquete retenido o un premio, o una de las palabras que añades en **Ajustes** → **Teléfono y SMS** →
  **SMS** → **Filtro de spam**. **Marcar como spam** y **No es spam** deciden para un número de una vez por todas. Un
  SMS que atrapan las propias palabras del filtro (un enlace con palabras que intentan engañar, de un número de teléfono que no está en ningún contacto del teléfono y al que nunca respondiste) llega sin aviso y sin sonido, ya que el teléfono también conoce esas palabras; cualquier otro spam, por tus palabras, tus reglas o del extranjero, sigue mostrando «New message», ya que ese aviso llega antes de abrir Erevos y el resto del filtro queda cifrado en el espacio. Un número que marcaste como **No es spam** o que dejas pasar también llega en silencio cuando envía esas palabras, salvo que esté en los contactos del teléfono. Con el **Filtro de spam** apagado, cada SMS tiene su aviso: el teléfono guarda solo si el filtro está encendido, según el último espacio abierto.
  Cada conversación en
  **Spam**, en la carpeta y arriba de la conversación, dice por qué está ahí: el número está bloqueado, lo marcaste, tu
  regla nombra al remitente, un número del extranjero, tu palabra, o un enlace y qué palabras.
- **Letras que se parecen:** un SMS de estafa que cambia una letra por otra de otro alfabeto que se ve igual, como una а cirílica en una palabra latina, o esconde dentro de una palabra una marca que no se ve, no pasa el filtro: lee las palabras como se ven. Quién envía nunca se compara así, porque un remitente parecido a uno permitido no es ese remitente.
- **Reglas sobre quién envía:** en **Filtro de spam**, **Remitentes** acepta el nombre de un remitente, como los que
  envían las tiendas y los bancos (letras, sin distinguir tildes ni mayúsculas), o un número, donde \`*\` vale por
  cualquier cosa: \`+4470*\` es cualquier número que empiece así, \`1234*\` cualquier código corto que lo haga, y con tu
  prefijo de país conocido, \`69*\` es también cualquier número \`+3069...\`. **A «Spam»** envía los suyos ahí; **Dejar
  pasar** les quita las reglas del filtro, como a los de tu banco o tu familia, aunque un número que marcaste como spam,
  o que bloqueaste, sigue yendo ahí. **Enviar a «Spam» los números del extranjero** envía cualquier número escrito con
  un prefijo de país distinto de **Tu prefijo de país**, que Erevos toma de los números a los que respondes y que puedes
  cambiar. Un número escrito sin prefijo es de aquí. Toca una regla para quitarla.
- **Bloquear:** **Bloquear** en el menú de una conversación, o **Ajustes** → **Teléfono y SMS** → **SMS** → **Números
  bloqueados**, pone un número en la lista de números bloqueados del propio Android: Android rechaza sus SMS, MMS y
  llamadas, y todos los espacios y la app de teléfono ven la misma lista. Solo la app de SMS o la app de teléfono pueden
  verla y cambiarla.
- **Borradores:** lo que escribes y no envías se queda con esa conversación, y la lista lo muestra como **Borrador**. Un
  SMS que no pudo salir también se queda ahí como borrador.
- **Textos rápidos:** mantén pulsado el **+** junto al campo, o elige **Textos rápidos** en él, para palabras cortas
  que escribes a menudo (Voy de camino, Te llamo luego): un toque pone uno en el campo, para enviarlo tal cual o con
  algo más. **Añadir** guarda uno tuyo, y mantener uno pulsado lo quita; desde entonces la lista es tuya, guardada
  cifrada con los SMS del espacio, cada espacio la suya.
- **Deshacer el envío de un SMS:** un SMS que envías espera antes 5 segundos al final de la conversación: tócalo
  entonces para devolverlo al campo de mensaje. **Ajustes** → **Teléfono y SMS** → **SMS** → **Deshacer el envío de un
  SMS** fija **Desactivado**, 5 o 10 segundos. Cuando sales de Erevos, sale al instante.
- **Lo que cuesta enviar:** un SMS más largo muestra sobre el campo una línea con cuántos caracteres tiene y en
  cuántos SMS va: 160 caracteres en un SMS, o 153 en cada parte de uno más largo, pero 70, o 67, en cuanto tiene una
  minúscula griega, un acento o un emoji. **Ajustes** → **Teléfono y SMS** → **SMS** → **Sin acentos (más barato)**
  envía un SMS simple sin acentos y el griego en mayúsculas, como lo escribían los teléfonos antiguos (ΚΑΛΗΜΕΡΑ), y
  vuelve a admitir 160; no uno con emoji, ni un MMS.
- **Volver a enviar:** uno tuyo que no salió, o no se entregó, lo dice: tócalo para volver a enviarlo. Mantén pulsado
  cualquier mensaje para **Reenviar**, **Volver a enviar** y **Eliminar**, con sus palabras para seleccionar y copiar;
  un mensaje eliminado también tiene **Deshacer**.
- **Reenviar:** mantén pulsado un mensaje → **Reenviar**, luego escribe un número y toca **Escribir**, o elige un
  contacto en **A un chat de Erevos**. Se abre en esa conversación, para leerlo y enviarlo ahí. A un número también va
  su imagen, como MMS; a un chat solo sus palabras.
- **Cada espacio lo suyo:** las conversaciones fijadas, las archivadas, la Papelera, las marcas de spam y los borradores
  pertenecen al espacio, sellados con su contraseña. Los SMS en sí se quedan en los SMS del teléfono: otro espacio los ve
  tal cual, y uno que está en la Papelera aquí aparece ahí hasta que se elimina del teléfono.

### En tus dispositivos vinculados

Los SMS del teléfono también pueden aparecer en los [dispositivos vinculados](#devices) de este espacio: un ordenador,
un navegador, una tablet. Allí los lees y respondes, y el teléfono envía la respuesta como SMS. Está desactivado hasta
que lo actives, en el teléfono: **Ajustes** → **Teléfono y SMS** → **SMS** → **También en mis dispositivos
vinculados** → **Enviar mis SMS también a mis dispositivos**.

- **Qué va:** las últimas 50 conversaciones de la lista y de **Archivadas**, cada una con sus últimos 50 mensajes,
  cifrados de extremo a extremo como todo lo que comparten los dispositivos. Las más antiguas, las de la **Papelera** y
  las de **Spam**, y las fotos se quedan en el teléfono: un mensaje con foto dice **📷 Una foto, en el teléfono**. Los
  nombres van solo mientras el teléfono los muestra (**Nombres de tus contactos**).
- **Responder:** lo que escribes en un dispositivo aparece como enviándose hasta que el teléfono lo envía, por la SIM
  que usa para ese número, y entonces queda entre los propios del teléfono. Uno que el teléfono no pudo enviar lo dice:
  tócalo para volver a enviarlo. El teléfono envía cada uno una sola vez, y como máximo 60 por hora desde los
  dispositivos, para que un dispositivo perdido no pueda enviar una avalancha de SMS; uno que esperó más de un día no
  sale.
- **Leído:** una conversación leída en un dispositivo también se marca como leída en el teléfono.
- **Avisos:** un SMS nuevo da un aviso también en el dispositivo, según sus ajustes de notificaciones.
- **A través del teléfono:** los SMS vienen y van solo mientras este espacio está abierto en el teléfono, como todo lo
  que pasa por el teléfono. En un dispositivo las pantallas son las del teléfono, sin lo que solo hace el teléfono:
  eliminar, bloquear, enviar más tarde, fotos e invitaciones.
- **Cada espacio lo suyo:** el interruptor pertenece al espacio. Un lugar de chats ocultos nunca envía los SMS a los
  dispositivos.
- **Desactivar:** **Dejar de enviar los SMS a mis dispositivos**, en el teléfono, los quita de todos los dispositivos.

**Por qué:** solo el teléfono tiene una SIM, así que solo el teléfono envía y recibe SMS. Los dispositivos los ven a
través del teléfono, cifrados de extremo a extremo como el resto, y la compañía telefónica no ve nada más que antes.

## Teléfono {#phone}

En Android, Erevos puede ser la app de teléfono del teléfono: en **Teléfono** en el menú, toca **Ajustes** → **Hacer que
Erevos sea la app de teléfono**. Cada llamada aparece entonces en la pantalla de llamada propia de Erevos, y los enlaces
tel: y el botón de llamada del teléfono abren el teclado de Erevos. **Teléfono** también se abre desde el auricular de
arriba de la pantalla de inicio, y tiene un icono propio entre las apps del teléfono, **Teléfono**, verde con un
auricular sobre la marca de Erevos, que abre el teclado. Cada uno de estos, como un enlace tel:,
lo abre en cuanto Erevos está desbloqueado: con contraseña, después de escribirla, salvo que el Teléfono se abra sin
ella (ver La contraseña de Erevos, más abajo). Hasta entonces una tarjeta arriba dice **Erevos no es la app de
teléfono**; en un teléfono pequeño solo muestra ese título, y al tocarla se abren los **Ajustes** del Teléfono.

- **Llamadas de emergencia:** un número de emergencia (112, o el de tu país) se llama al momento, sin preguntar la
  SIM: la elige Android. Con Erevos bloqueado y Teléfono tras la contraseña, **Llamada de emergencia** en la pantalla
  de contraseña abre el teclado de emergencia de Android, sin contraseña.
- **Buscar contactos:** arriba del Teléfono, escribe un nombre, un número o parte de cualquiera de los dos: los
  contactos con número aparecen en lugar de las pestañas, cada número en una línea propia. Toca uno para llamarlo, o
  mantenlo pulsado para ponerlo en el teclado. Busca en los contactos del teléfono y, con Erevos desbloqueado, en los
  guardados solo en Erevos y en tus contactos de Erevos con número; nunca en los chats ocultos.
- **Contactos al marcar:** mientras tecleas en el **Teclado**, los contactos que encuentra aparecen en una lista sobre el
  número: uno cuyo número contiene los dígitos tecleados, o cuyo nombre empieza con ellos en las letras de las teclas,
  como 2 para ABC (y ΑΒΓ). Cada tecla muestra sus letras en el idioma de la app. Toca un contacto para llamarlo, o
  mantenlo pulsado para poner su número en el teclado. En una pantalla pequeña, donde no hay sitio sobre el número, el
  primero aparece sobre las teclas y **más**, a su lado, muestra los demás.
- **La pantalla de llamada:** quién llama, o a quién llamas, con el nombre y la foto que le dan los contactos de tu
  teléfono; mientras Erevos está desbloqueado, un número vinculado a uno de tus contactos de Erevos muestra el nombre
  que le diste, y lo mismo el número de un contacto guardado solo en Erevos; el de un contacto de chats ocultos
  abiertos, solo mientras están abiertos. Aparece sobre la pantalla de bloqueo y no necesita contraseña, ya que una
  llamada tiene que poder responderse con Erevos bloqueado. Una llamada que entra muestra **Answer**, **Decline** y
  **Message**, y Android suena con el tono propio del contacto; las teclas de volumen lo silencian. En una llamada:
  **Mute**, **Keypad** para los tonos que pide un menú, **Speaker**, **Hold**, **Add call** y **End**.
  Junto a tu oreja la pantalla se apaga.
- **Por dónde va el sonido:** con un dispositivo Bluetooth o unos auriculares, el botón junto a **Keypad** dice por
  dónde va el sonido, y un toque te deja elegir: el teléfono, el altavoz, los auriculares o el dispositivo Bluetooth.
- **Una segunda llamada:** una que entra durante una llamada muestra **Hold and answer**, **End and answer** y
  **Decline**. Con una llamada retenida, la línea bajo el nombre lo dice: tócala, o **Swap**, para hablar con la
  otra. **Merge** junta las dos en una llamada, cuando tu compañía telefónica lo permite.
- **Una conferencia:** con las llamadas combinadas, la pantalla de llamada muestra a las personas que están en ella
  en lugar de la foto. Junto a cada una, **Separar** habla solo con ella mientras las demás esperan en espera, y
  **Colgar** saca solo a esa; cada botón aparece solo donde tu compañía lo permite.
- **Videollamadas a través de tu compañía:** donde tu SIM y tu red las admiten (ViLTE, por 4G o 5G), una
  videollamada entrante muestra **Responder con vídeo** y **Solo audio**; en la llamada, el otro lado aparece a
  pantalla completa y tu cámara en una esquina, con **Apagar cámara** y **Cambiar de cámara**. Una llamada sin vídeo
  muestra **Vídeo** cuando ambos lados pueden, y cuando el otro lo pide, Erevos te pregunta: **Activar vídeo** o
  **Seguir solo con audio**. Para empezar una, escribe el número y toca **⋯** → **Videollamada**. Android pide la
  cámara una vez. Como cualquier llamada telefónica, la lleva tu compañía y puede verla; nada de esto aparece donde
  la red no tiene videollamadas.
- **Rechazar con un mensaje:** **Message**, en una llamada que suena, la rechaza con una respuesta rápida, o una que
  escribas, que tu teléfono envía a quien llama como SMS; aparece entre tus SMS. En **Teléfono** → **Ajustes**,
  **Respuestas rápidas** las cambia: **Añadir una respuesta**, **Quitar**, **Guardar** y **Usar las respuestas
  habituales**. Se guardan en el teléfono, sin sellar, ya que la pantalla de llamada las muestra con Erevos bloqueado.
- **El teclado:** en **Teléfono**, escribe un número y toca **Llamar**; mantén pulsado **0** para el +. Al mantenerlo
  pulsado, el campo del número pega uno. **Add call**, durante una llamada, lo abre en cuanto Erevos está
  desbloqueado.
- **Buzón de voz:** con el teclado vacío, mantén pulsado el **1** (marcado oo) para llamar a tu buzón de voz, desde
  la SIM elegida encima de **Llamar**. Si la SIM no tiene número de buzón, el Teléfono lo dice: te lo da tu
  compañía. Donde tu compañía envía los mensajes como grabaciones (buzón de voz visual), **Buzón de voz** aparece
  junto a **Favoritos**: cada mensaje con quién lo dejó, cuándo, cuánto dura y sus palabras cuando llegaron. **▶**
  lo reproduce, **■** lo para; un toque en la fila ofrece **Devolver la llamada**, **Enviar un SMS** y **Borrar este
  mensaje de voz**. **Llamar al buzón de voz** arriba lo llama. Erevos los reproduce desde el almacén de Android y
  no guarda copia; con Erevos bloqueado la pestaña no aparece.
- **Marcación rápida:** con el teclado vacío, mantén pulsada una tecla del 2 al 9 para llamar a su número. Una tecla
  sin número te deja elegir uno: escribe un nombre o un número y toca el contacto, o **Usar** el número escrito. En
  **Teléfono** → **Ajustes**, **Marcación rápida** muestra las ocho teclas; toca una para cambiarla o vaciarla. La
  marcación rápida se guarda cifrada en el espacio y funciona con Erevos desbloqueado. Mientras el Teléfono se abre
  sin contraseña, **Marcación rápida también con Erevos bloqueado** (apagado al principio) la hace funcionar también
  ahí: una copia de los números, sin sus nombres, queda entonces en el móvil fuera del espacio, y quien tenga el móvil
  desbloqueado puede llamarlos. Un espacio a la vez. Puede mostrar que el espacio existe: quien vea otro espacio tuyo
  encuentra que las teclas llaman a números que no son de ese espacio. La copia se borra cuando el Teléfono vuelve
  tras la contraseña, cuando se restaura una copia de seguridad, cuando se desactiva el bloqueo y cuando se quita o se
  pone de nuevo una segunda contraseña con otro espacio abierto; actívala entonces otra vez.
- **Ajustes de llamadas:** en **Teléfono** → **Ajustes**, **Ajustes de llamadas** abre las pantallas del propio
  Android para lo que tu compañía guarda de las llamadas de cada SIM: **Desvío, espera y tu número** y **Número del
  buzón de voz**; con dos SIM, toca primero la SIM. En **Preguntar a tu compañía**, cada botón marca el código de la
  red (**Comprobar** el desvío \`*#21#\`, **Desactivarlo todo** \`##002#\`; llamada en espera \`*#43#\`,
  **Activado** \`*43#\`, **Desactivado** \`#43#\`; mostrar tu número \`*#31#\`), y la respuesta aparece en un
  mensaje de Android. Para ocultar tu número en una sola llamada, escribe \`#31#\` antes del número.
- **Dos SIM:** encima de **Llamar**, toca la SIM con la que llamar; la primera vez, **Elegir la SIM** pide a Android que
  deje a Erevos verlas. Un número al que llamas sin elegir pregunta con cuál (**Llamar con**). Erevos guarda la SIM que
  usaste para cada número, sellada en el espacio, y la próxima vez llama con la misma. La pantalla de llamada nombra la
  SIM de cada llamada.
- **Las llamadas:** en **Teléfono**, **Recientes** lista el historial de llamadas de Android, las más nuevas primero,
  bajo cada día: quién, qué llamada fue, con qué SIM, y cómo. **Todo**, **Perdidas**, **Entrantes**, **Salientes** y,
  en cuanto se bloqueó una llamada, **Bloqueadas** lo filtran; con dos SIM, **SIM 1** o **SIM 2** deja las llamadas de
  esa SIM. Las llamadas seguidas con el mismo número aparecen una vez, con cuántas fueron. **☏** devuelve la llamada; un
  toque en la fila muestra sus llamadas, cuánto duró cada una, y **Llamar** (con dos SIM, uno para cada una), **Enviar
  un SMS**, **Añadir a contactos** para un número que no es ninguno de tus contactos, y **Cambiar el número antes de
  llamar**. Vistas ahí, las llamadas perdidas salen del aviso de Android, y ese aviso abre **Recientes**.
- **Eliminar llamadas:** en las llamadas de la fila, **Eliminar esta llamada** (o **Eliminar estas 3 llamadas**, para
  una fila de varias) las elimina del historial de llamadas de Android, **Eliminar** junto a una de varias elimina solo
  esa, y **Eliminar todas las llamadas con este número**, cuando tiene más, las elimina todas, también las más antiguas.
  **Deshacer** aparece antes durante unos segundos; hasta entonces solo se ocultan.
- **Favoritos:** los contactos marcados con estrella en los contactos de tu teléfono, con sus fotos. Un toque llama al
  número predeterminado del contacto, o pregunta cuál cuando hay varios y ninguno es el predeterminado; al mantenerlo
  pulsado, los muestra todos.
- **Más para un número:** en cuanto se escribe un número en el teclado, **⋯** a su lado ofrece **Añadir a contactos**, **Añadir a un contacto existente** (se abren tus contactos: toca aquel al que añadir el número, o crea uno nuevo), **Enviar un SMS** y **Copiar el número**. En **Recientes**, las llamadas de la fila ofrecen lo mismo, y **Abrir el contacto** para un número que es uno de tus contactos. En **Favoritos**, mantén pulsado un contacto para ver sus números, cada uno con **Enviar un SMS** y **Copiar el número**, y **Abrir el contacto**. Con Erevos bloqueado, el Teléfono solo llama y copia un número: sin SMS, sin cambios en tus contactos. Cada tecla, **Llamar** y el Intro del teclado dan una vibración breve; en **Ajustes** → **Apariencia** → **Vibrar al tocar** la desactivas. Ver [Apariencia](#appearance).
- **Llamada por Wi-Fi y voz HD:** la pantalla de llamada lo dice bajo el nombre cuando una llamada va por Wi-Fi o con
  voz HD, y **Recientes** lo dice para cada llamada.
- **Bloqueo de llamadas:** en **Teléfono** → **Ajustes**, **Bloquear el telemarketing** bloquea las llamadas de los
  números que algunos países reservan para el telemarketing: Francia (01 62, 01 63, 02 70, 02 71, 03 77, 03 78, 04 24,
  04 25, 05 68, 05 69, 09 48, 09 49 y 09 475 a 09 479, por la decisión 2022-1583 de ARCEP), España (400, desde el 17 de
  octubre de 2026), Chile (809), India (140) y Brasil (0303, que quienes llaman ahí pueden omitir desde agosto de 2025).
  Otros países no reservan esos números, o Erevos no está seguro de que lo hagan, así que no se bloquea nada para ellos.
  En **Números que empiezan por**, escribe el principio de más números que bloquear, con el prefijo de país (+33 162) o
  como lo marcas aquí (0162), y toca **Bloquear**; **Quitar** elimina uno. Estos nunca bloquean un número de los
  contactos de tu teléfono. Una llamada bloqueada no suena y no deja aviso; aparece en **Recientes**, en
  **Bloqueadas**. Android pregunta una vez si Erevos puede filtrar las llamadas
  (**Dejar que Erevos filtre las llamadas**): sin eso, una llamada bloqueada suena un momento antes de que Erevos la
  corte. Lo que se bloquea es igual en todos los espacios, así que no dice nada de ninguno, y se guarda en el teléfono
  sin nombres.
- **Números bloqueados:** en **Teléfono** → **Ajustes**, **Números bloqueados** es la lista propia de Android, la misma
  que **Ajustes** → **Teléfono y SMS** → **SMS** → **Números bloqueados**: escribe un número y toca **Bloquear**, o toca
  uno para desbloquearlo. En **Recientes**, las llamadas de una fila muestran **Bloquear este número** o **Desbloquear
  este número**, con **Deshacer**. Android rechaza sus llamadas antes de que suenen, y sus SMS y MMS. Todos los
  espacios ven la misma lista.
- **Números desconocidos y spam:** para un número que no está en tus contactos, la pantalla de llamada dice bajo el
  número de dónde es (su país y bandera, y la ciudad de un fijo cuando el número la indica) y si es un móvil, un
  fijo, gratuito o de tarificación adicional: leído solo del número, en el teléfono. En **Teléfono** → **Ajustes**,
  **Lista de spam** descarga entera una lista de números conocidos por spam desde la dirección https:// que
  escribes: un número por línea con su código de país, o el comienzo de números seguido de \`*\`, y luego qué tipo
  de llamadas son. Erevos no tiene una propia; elige una lista de confianza. Sin Tor, el servidor de la lista ve la
  dirección de internet del teléfono, y Erevos lo dice antes. La pantalla de llamada de un número de la lista
  muestra **Posible spam**; **Llamadas de spam en silencio** las hace sonar sin sonido (Android 10 y posteriores),
  nunca las de un contacto. En **Recientes**, **Denunciar como spam** en un número que no está en tus contactos lo
  añade solo en este teléfono, y **No es spam** lo quita; **Olvidar mis denuncias** las borra. Ningún número se
  busca nunca en ningún sitio. **Descargarla de nuevo cada semana** la trae otra vez de la misma dirección cuando
  tiene una semana, con Erevos desbloqueado, por Tor cuando la vía Tor del espacio está activada; está desactivado
  hasta que lo actives.
- **Un grupo de contactos durante un tiempo:** en **Teléfono** → **Ajustes**, **Bloquear un grupo de contactos** lista
  los grupos (las etiquetas) de los contactos de tu teléfono. **Bloquear** junto a uno bloquea las llamadas de sus
  contactos **Durante una hora**, **Hasta mañana por la mañana** (7:00) o **Hasta que lo desbloquee**; la línea bajo el
  grupo dice hasta cuándo, y **Desbloquear** lo termina antes. Una llamada así se bloquea como las demás: no suena, y
  aparece en **Recientes**, en **Bloqueadas**. Erevos solo lee los grupos, y guarda el id del grupo y la hora, no su
  nombre. Mientras un grupo está bloqueado, la pantalla de **Teléfono** lo dice arriba, hasta cuándo, con
  **Desbloquear**.

**Por qué:** una llamada también se filtra con Erevos bloqueado, así que lo que se bloquea no puede estar sellado dentro
de un espacio; y guardado igual para todos los espacios, no muestra nada de ninguno.

- **La contraseña de Erevos:** la pantalla de **Teléfono**, con el teclado, las llamadas y los favoritos, está tras ella
  como el resto de Erevos. Solo la pantalla de llamada no lo está, salvo que dejes que el Teléfono se abra sin ella: en
  **Teléfono** → **Ajustes**, **Abrir el Teléfono sin la contraseña** (desactivado al principio, y solo visible mientras
  Erevos tiene contraseña). Con Erevos bloqueado, el icono del Teléfono, un enlace tel: y el aviso de una llamada
  perdida abren entonces el teclado, **Recientes** y **Favoritos**, que Android guarda para cualquier app de teléfono,
  solo con los nombres de los contactos del teléfono: nunca los guardados solo en Erevos ni los de chats ocultos, y sin
  ninguna SIM guardada para un número. Ahí puedes llamar, nada más: ni eliminar, ni bloquear, ni SMS, ni añadir a
  contactos. **Abrir Erevos** arriba muestra la pantalla de la contraseña, como el propio icono de Erevos después de que
  Erevos haya estado en segundo plano más de 30 segundos, salvo que una llamada hecha ahí lo sacara. **Volver a poner el
  Teléfono tras la contraseña** lo desactiva.
- **Si Erevos no se convierte en la app de teléfono:** como con los SMS, Android 15 y posteriores pueden impedirlo a una
  app instalada desde un navegador. En **Ajustes**, toca **Abrir aplicaciones predeterminadas** → **Aplicación de
  teléfono** → Erevos. Si Android dice que es un ajuste restringido, abre la **información de la aplicación de Erevos**,
  toca **⋮** arriba a la derecha → **Permitir ajustes restringidos**, y vuelve a elegir Erevos. **Permitir llamadas y
  contactos** aparece mientras Android todavía retiene las llamadas, el historial de llamadas o los contactos.
- **Después de reiniciar el teléfono:** hasta que desbloquees el teléfono por primera vez, responde la pantalla de
  llamada propia de Android.
- **Qué es una llamada telefónica:** una llamada telefónica normal, como con cualquier app de teléfono: la lleva la
  compañía telefónica, que puede escucharla. Las llamadas a tus contactos de Erevos desde un chat son otra cosa: cifradas
  de extremo a extremo, por internet.

## Contactos {#contacts}

En Android, **Contactos** en el menú muestra los contactos del teléfono: los que están en los contactos propios de
Android, que también usan tus otras apps, así que no hay nada que importar. Android pregunta una vez si Erevos puede
leerlos y cambiarlos (**Permitir contactos**). También se abren desde la persona de arriba de la pantalla de inicio, y
tienen un icono propio entre las apps del teléfono, **Contactos**, violeta con una persona sobre la marca de Erevos, que
los abre tras el bloqueo de Erevos: con contraseña, en cuanto la escribes.

- **Encontrar a alguien:** **Buscar contactos** busca en todos los campos: nombres, números (se escriban como se
  escriban, con o sin prefijo de país), emails, direcciones, la empresa, el cumpleaños y la nota. **Favoritos** muestra
  solo los contactos con estrella.
- **Un contacto:** toca uno para verlo entero. Toca un número para llamarlo{~, o **SMS** a su lado para escribirle en
  Erevos}; toca un email o una dirección para abrirlo. **Añadir a favoritos** arriba le da una estrella, en los contactos
  de Android, para que la app de teléfono también lo liste entre los favoritos.
- **Contacto nuevo** y **Editar:** nombre y apellidos, empresa y cargo, tantos números, emails y direcciones como
  necesites, cada uno con su tipo (**Móvil**, **Casa**, **Trabajo**, **Otro**), un cumpleaños (día/mes/año, o
  día/mes) y una nota. Un contacto nuevo se guarda **Solo en este teléfono**, o en una cuenta con la que el teléfono
  sincroniza los contactos (Google), como elijas. Lo que Erevos no muestra de un contacto, como los datos propios de
  otra app, se queda como estaba.
- **Foto:** toca la imagen de arriba de un contacto para **Elegir una foto** de las fotos del teléfono, **Hacer foto**
  con la cámara, o **Quitar la foto**. La recortas en cuadrado, y Erevos la redibuja, para que no quede nada de lo que
  decía la foto aparte de su imagen (ni un lugar ni un teléfono). Se guarda con el contacto en los contactos de Android,
  donde el teléfono la muestra cuando llama.
- **Tono de llamada:** en un contacto, **Elegir tono de llamada** abre el selector propio de Android, con los sonidos
  del teléfono y los que añadiste; el teléfono suena con él cuando llama ese contacto. **Tono predeterminado** ahí
  devuelve el propio del teléfono.
- **Archivos .vcf:** **Importar de un archivo .vcf** en el menú de Contactos lee un archivo vCard que guardó otro
  teléfono u otra app (cualquiera de sus versiones, también la de los antiguos teléfonos griegos) y guarda los que aún
  no están en el teléfono, con sus fotos y grupos, solo en este teléfono o en una cuenta. **Guardar como archivo .vcf**
  ahí guarda los contactos que se muestran (todos, los favoritos, un grupo, o lo que encontró la búsqueda) como un
  archivo, en una carpeta que elijas; en un contacto, guarda ese. El archivo está fuera de Erevos y sin sellar:
  cualquiera que lo tenga puede leer los contactos.
- **Códigos QR:** **Código QR** en un contacto muestra su vCard como código QR, que la cámara de otro teléfono lee como
  un contacto que añadir: su nombre, números, emails, direcciones y nota, sin su foto (una nota larga o muchas
  direcciones se omiten para que quepa). Quien lo vea puede leerlo. **Leer el código QR de un contacto** en el menú lee
  uno de una foto que haces o eliges, aquí en el teléfono, y empieza un contacto nuevo con él, que solo se guarda cuando
  lo guardas. El código QR de Erevos de alguien empieza uno con su ID de {=Erevos}.
- **Duplicados:** **Buscar duplicados** en el menú lista los contactos que parecen la misma persona guardada dos veces:
  el mismo nombre (sus palabras en cualquier orden), número o email. **Combinar** se queda con el más completo, con todos
  los números, emails y direcciones de los demás, sus notas, y su foto, tono, estrella y grupos cuando no los tiene, y
  elimina los demás; **Combinar todos** lo hace con cada conjunto. **No son iguales** oculta un conjunto hasta que
  vuelvas a abrir la lista.
- **Cumpleaños:** el chip **Cumpleaños** bajo la búsqueda lista los contactos con cumpleaños, el próximo primero, con
  cuántos días faltan y los años que cumplen. **Recordatorios de cumpleaños** en el menú (desactivado al principio) pone
  un aviso la mañana de cada uno, desde las 9:00, incluso con Erevos cerrado; en la pantalla de bloqueo solo dice que hay
  un cumpleaños. Son solo los cumpleaños de los contactos del teléfono, nunca los de contactos guardados solo en Erevos.
- **Contactos de la SIM** en el menú lee los contactos de las tarjetas SIM del teléfono y copia los que aún no están en
  el teléfono (todos elegidos al principio) a los contactos de Android, solo en este teléfono o en una cuenta. La SIM
  conserva los suyos.
- **Solo en Erevos:** en **Guardado en**, un contacto nuevo se puede guardar **Solo en Erevos** en su lugar: sellado en
  este espacio como sus chats, nunca en los contactos de Android, así que ninguna otra app ni cuenta lo ve, y las otras
  apps solo muestran su número; la pantalla de llamada de Erevos muestra su nombre mientras Erevos está desbloqueado.
  Tiene un candado en la lista, y el chip **Solo en Erevos** muestra solo esos. **Guardar solo en Erevos** en un
  contacto del teléfono lo traslada, con su foto y su estrella, y lo elimina de los contactos del teléfono; **Mover a
  los contactos del teléfono** lo vuelve a sacar. Su foto se sella con él. Los grupos, los tonos y los recordatorios de
  cumpleaños son de Android, así que no tiene ninguno. Una llamada{~ o un SMS} a él sigue yendo por el teléfono, y aparece
  en el registro de llamadas{~ y en los SMS} del teléfono como cualquier otro. Una copia de seguridad de Erevos contiene
  estos contactos, sellados.
- **En los chats ocultos:** **Contactos** arriba de los chats ocultos abiertos lista sus propios contactos, guardados
  solo ahí y sellados con ellos: no aparecen en ningún otro sitio, ni siquiera en los contactos del espacio, y la
  pantalla no muestra nada en cuanto se cierran los chats ocultos. Un contacto nuevo ahí siempre es uno de los suyos. Se
  le puede dar una foto, ya que los chats ocultos siguen abiertos mientras la eliges o la haces. Su menú solo tiene lo
  suyo: **Importar de un archivo .vcf** guarda los contactos de un archivo con ellos, sellados, nunca en los contactos
  del teléfono; **Guardar como archivo .vcf** guarda los que se muestran, o uno desde su ficha, en una carpeta que elijas
  (fuera de Erevos y sin cifrar); **Leer el código QR de un contacto** empieza uno de sus contactos. Un ID de {=Erevos}
  escrito o leído ahí lo añade a los chats ocultos, nunca a los del espacio. Llamar a uno por la app de teléfono cierra
  los chats ocultos en cuanto Erevos está fuera más de 30 segundos, y aparece en su registro de llamadas.
- **ID de {=Erevos}:** el ID de {=Erevos} de un contacto es el enlace de contacto que muestra su {=Erevos}, bajo **Copiar mi
  enlace de contacto** o como su código QR. En la ficha de un contacto, o en **ID de {=Erevos}** al escribir uno, pégalo, o
  léelo con **Hacer foto del código QR** o **Elegir foto del código QR**: **Añadir a Erevos** (o **Guardar**) lo añade a
  tus chats de Erevos, que se abren con él, y vincula el contacto con él, y el chat toma el nombre del contacto si no
  tiene uno propio. Un contacto que es un contacto de Erevos muestra el principio de su clave como **ID de {=Erevos}**.
- **Contactos de Erevos:** un contacto que es la misma persona que uno de los contactos de Erevos de tus chats aparece
  como una sola ficha con él: por un número vinculado a él en Erevos, por su ID de {=Erevos}, o con **Elegir de mis chats
  de Erevos** en su ficha, un vínculo sellado en el espacio, nunca en los contactos de Android (**No es este contacto de
  Erevos** lo deshace). La ficha tiene entonces **Mensaje**, **Llamar** y **Vídeo**, cifrados de extremo a extremo por
  Erevos en lugar de por la compañía telefónica. Un contacto de los chats que no es ningún contacto tiene una ficha
  propia, con el escudo, donde **Añadir a contactos** crea uno y **Vincular a uno de mis contactos** lo vincula a uno
  que tienes, cuya ficha lo muestra entonces; el chip **Contactos de Erevos** los lista todos. Un contacto de Erevos sin
  nombre propio toma el nombre del contacto vinculado a él, al vincularse o al abrirse la ficha de ese contacto; un
  nombre que le diste en Erevos se queda, y uno que vaciaste vuelve del contacto entonces. En los chats ocultos, estos
  son los propios contactos de los chats ocultos, y su chat se abre ahí.
- **Historial:** la ficha de un contacto lista {~sus últimas llamadas en el registro de llamadas del teléfono, sus SMS y
  |}sus mensajes en Erevos, los más nuevos primero; toca uno para {~devolver la llamada, escribir un SMS o |}abrir el chat.{~ Las
  llamadas aparecen en cuanto dejas que Erevos lea el registro de llamadas (**Mostrar llamadas**). Erevos solo las lee
  para mostrarlas, y no guarda ninguna copia.}
- **Otras apps:** **Añadir a contactos** de otra app (un número en la app de teléfono, un email en el correo) puede
  abrirse en Erevos: un contacto nuevo con lo que dio esa app, o la lista para tocar el contacto al que añadirlo. Una app
  que muestra o cambia un contacto también puede abrirlo en Erevos, tras el bloqueo de Erevos. Android pregunta qué app
  usar; elige Erevos. Una app que te pide elegir un contacto, o un número, email o dirección, recibe solo el que tocas,
  de los contactos del teléfono: los guardados solo en Erevos nunca aparecen ahí.
- **Eliminar** quita el contacto del teléfono, de todas las cuentas en las que está guardado; uno guardado solo en
  Erevos, de Erevos.
- **Grupos:** **Grupos** en el menú de Contactos (los tres puntos) lista los grupos propios de Android, como Familia o
  Trabajo, con cuántos hay en cada uno, y crea otros nuevos. Abre uno para **Añadir contactos**, quita uno con **×**,
  **Cambiar nombre** o **Eliminar grupo** (sus contactos se quedan). En un contacto, **Elegir grupos** lo pone en
  grupos o lo saca. Los chips bajo la búsqueda muestran los contactos de un grupo. Un grupo se guarda en una cuenta,
  como sus contactos: un contacto solo se une a él si también está guardado en esa cuenta.

## Bloqueo con contraseña {#lock}

En **Ajustes** → **Privacidad y seguridad** → **Bloqueo y segunda contraseña**, **Bloquear al abrir Erevos** tiene dos
opciones: **Sin bloqueo** y **Contraseña**.

1. Toca **Contraseña**, escríbela dos veces (al menos 4 caracteres) y toca **Guardar**.
2. A partir de entonces Erevos la pide cada vez que se abre, y otra vez después de 30 segundos en segundo plano.
3. **Cambiar contraseña** la cambia, y **Bloquear ahora** bloquea Erevos al instante.

- **Una frase, no un PIN corto:** lo que comprueba la contraseña se guarda en el almacén de claves del teléfono, así
  que una copia de su almacenamiento no sirve para probar contraseñas. Pero quien rompa la seguridad del propio
  teléfono, como hacen herramientas forenses en algunos teléfonos, podría probar en ordenadores propios, y un PIN de 6
  dígitos, un millón de combinaciones, cae en días. Una frase de 4 o 5 palabras no. Bajo una contraseña nueva corta, o
  un PIN de chats ocultos, Erevos lo dice, y la acepta solo tras pulsar **Usar de todos modos**. Quien tenga una copia
  de seguridad y su contraseña puede probar lo mismo en ella: ahí un PIN corto es más débil.
- **Bloqueado, sigue recibiendo:** cuando Erevos se bloquea, la pantalla de la contraseña se pone delante del espacio
  abierto, que sigue detrás: los mensajes y las llamadas siguen llegando, con sus avisos, y una llamada aparece sobre la
  pantalla de la contraseña. Sus pantallas se cierran, también los chats ocultos, y la pantalla de llamada ya no muestra
  los nombres de sus contactos. Su contraseña lo vuelve a abrir; la contraseña de otro espacio lo cierra antes, sin
  dejar nada de él en memoria.
- [~] **Solo los SMS:** con Erevos bloqueado, el icono de SMS, el botón **SMS** del widget y el aviso de un SMS nuevo siguen
  pidiendo la contraseña, pero luego abren solo los SMS: la lista de las conversaciones de SMS del teléfono, cada una en
  su propia fila, las conversaciones mismas, **Archivadas**, **Spam** y **Papelera**, y **SMS nuevo**. Nada más del
  espacio se muestra. Cualquier otra cosa, un contacto, un chat, **Ajustes**, el icono propio de Erevos o el candado
  naranja **Desbloquear todo** de arriba, vuelve a pedir la contraseña y luego abre todo el espacio. Así un código que
  llegó por SMS se puede leer con alguien al lado, y el resto de Erevos sigue cerrado.
- **Solo los Contactos:** del mismo modo, el icono de Contactos, el botón **Contactos** del widget y el aviso de un
  cumpleaños piden la contraseña, y luego abren solo los contactos: su lista, la ficha de un contacto (sin tus chats ni
  llamadas con él), **Editar**, los grupos, los duplicados, la SIM y la importación. **Llamar** sigue abriendo el
  marcador del teléfono. Un chat,{~ un SMS,} **Ajustes** o el candado naranja **Desbloquear todo** de arriba vuelve a
  pedir la contraseña y luego abre todo el espacio. Otro icono, el widget o un aviso, con {~solo los SMS o |}solo los
  Contactos abiertos, pide la contraseña como cuando Erevos está bloqueado y luego abre lo que nombra: el icono de
  Contactos solo los contactos, {~el icono de SMS solo los SMS, |}el icono propio de Erevos todo el espacio.

- **Ver lo que escribes:** cada campo para una contraseña, un PIN o un token, aquí y en todo Erevos, tiene un ojo al
  final: tócalo para ver lo que escribes, y otra vez para ocultarlo. Vuelve a ocultarse cada vez que el campo aparece
  de nuevo, y en Android se le pide al teclado que no lo aprenda.
- **Contraseñas incorrectas:** tras 5 intentos fallidos, cada intento más te hace esperar, 30 segundos al principio y el
  doble cada vez, hasta una hora. El contador sobrevive a un reinicio. La espera se cuenta con el reloj propio del
  teléfono desde que se encendió, que nadie puede ajustar, así que adelantar la fecha y la hora no la termina; si el
  teléfono se apaga y se enciende durante una espera, vuelve a esperarla desde el principio, porque no se puede saber
  el tiempo ya esperado. En la app web y en un ordenador va igual mientras Erevos sigue abierto, y empieza de nuevo
  desde el principio cuando Erevos se abre otra vez.
- **Lo que está sellado:** los contactos de cada espacio, las claves de sus conversaciones, sus mensajes, sus ajustes
  del relay y su aspecto se guardan en el teléfono sellados con una clave que solo abre su contraseña.
- **La lista al instante:** la pantalla de inicio guarda una copia sellada de sus primeras filas, así que la lista
  aparece en cuanto se abre el espacio y luego se actualiza. Siempre tiene el mismo tamaño, así que no le dice a nadie
  cuántos chats hay ni qué espacios se usan, y nunca contiene lo que decía un mensaje temporal.

**Por qué:** cada contraseña probada cuesta tiempo y mucha memoria a propósito (PBKDF2, luego Argon2id), para que quien
copie lo que guarda el teléfono no pueda probar contraseñas rápido; y alguien que tenga el teléfono espera más tras cada
intento fallido. El contador es uno para todo el teléfono, conservado entre reinicios, ya que la pantalla de la
contraseña va antes de que se abra ningún espacio, y la espera se mide donde mover el reloj no puede acortarla.

> No hay forma de recuperar una contraseña olvidada: no se guarda nada que pudiera abrir los datos sin ella. Solo una
> huella o la cara, mientras esté activada, sigue abriendo el primer espacio (ver más abajo).

### Capturas de pantalla

Con el bloqueo con contraseña activado, Android deja Erevos fuera de las capturas de pantalla, las grabaciones de
pantalla y las apps recientes: ahí la última pantalla de Erevos aparece en blanco, así que quien tenga un momento el
teléfono desbloqueado no ve tus chats en ella. En **Ajustes** → **Privacidad y seguridad** → **Capturas de pantalla**,
**Desactivar** deja que las capturas vuelvan a funcionar (para enviar una, por ejemplo), y **Activar** lo restablece.
Mientras está activado, los chats ocultos también se quedan fuera, incluso en un espacio sin bloqueo con contraseña;
desactivado, las capturas funcionan en ellos también. El ajuste es del
teléfono, el mismo en todos los espacios. En un ordenador y en la app web no existe.

**Por qué:** sin esto, la última pantalla de Erevos se queda como imagen entre las apps recientes hasta que Erevos se
vuelve a abrir, así que los chats ocultos siempre se quedan fuera, para no aparecer nunca ahí sin su PIN. El ajuste es
el mismo en todos los espacios para que no diga nada de qué espacio se abrió.

### Huella o cara

En Android 11 y posteriores, con una huella o una cara configurada en los ajustes del teléfono, Erevos también puede
abrirse con ella. Está desactivado salvo que lo actives.

1. Con el bloqueo con contraseña activado, en **Huella o cara**, toca **Activar**.
2. Escribe la contraseña del espacio en el que estás, toca **Activar**, y toca el sensor (o mira al teléfono).
3. A partir de entonces la pantalla de la contraseña tiene un botón **Huella o cara**. La contraseña siempre funciona
   también, y **Desactivar** lo desactiva.

- **Solo el espacio de la primera contraseña:** una huella nunca abre el espacio de una segunda contraseña, ni los
  chats ocultos. Activada en el espacio que abre una segunda contraseña, no abre nada: la primera vez que se prueba se
  desactiva sola, y la contraseña abre Erevos. El ajuste se ve igual en todos los espacios.
- **Bajo presión:** alguien que te retenga puede apretar tu dedo contra el teléfono, o ponértelo delante de la cara. Si
  eso puede pasar, déjalo desactivado: así necesitan una contraseña, y puedes darles la segunda.
- **Cómo se guarda:** la clave del primer espacio está sellada por una clave del hardware seguro del teléfono (el
  Android Keystore) que solo funciona justo después de una comprobación fuerte de huella o cara, una vez por cada uso.
  Añadir o quitar una huella o una cara hace que Android descarte esa clave: entonces queda desactivado, y lo vuelves
  a activar. Una clave que deja de funcionar de otro modo también lo desactiva, tras tres intentos seguidos en los que
  no se pudo usar. Nada sale del teléfono.
- **Qué cara:** una cara solo cuenta donde Android califica su desbloqueo facial como fuerte, como en el Pixel 8 y
  posteriores; en los demás, es la huella.
- **Las contraseñas incorrectas** se cuentan como antes: una huella no cambia el contador.
- **No en un ordenador ni en la web:** solo se ofrece en Android. Desactivar el bloqueo también lo desactiva.

**Por qué:** un dedo es más fácil de forzar que una contraseña, y cualquiera cuyo dedo o cara conozca el teléfono podría
usarlo, así que nunca abre el espacio de una segunda contraseña ni los chats ocultos. Activado en otro espacio, guarda
una clave que no abre nada, con la misma forma, así que lo que se guarda no muestra en qué espacio se activó.

## Segunda contraseña {#second}

Si alguien te obliga a abrir Erevos, escribe la segunda contraseña en lugar de la tuya. Abre un Erevos aparte y vacío,
con sus propios contactos, relay y aspecto. Tus chats reales siguen ocultos, y nada en la app muestra que existen.

1. Con el bloqueo con contraseña activado, toca **Poner segunda contraseña**.
2. Escríbela dos veces y toca **Guardar**. Debe ser distinta de tu propia contraseña.

- **El aspecto:** el segundo espacio empieza con el aspecto del espacio en el que se puso, para que no llame la
  atención.
- **Una cada vez:** poner otra vez una segunda contraseña sustituye a la anterior. **Quitar la segunda contraseña** la
  quita.
- **Desde la búsqueda:** en un espacio abierto, escribe la contraseña de otro espacio en **Buscar chats** y pulsa
  Enter: el espacio abierto se cierra, sin que quede nada de él, y se abre el otro, como con **Bloquear ahora** y su
  contraseña. Tarda lo mismo escribas lo que escribas, así que su tiempo no muestra si hay otro espacio. Una
  contraseña equivocada, o la del espacio abierto, es solo una búsqueda; la contraseña de pánico funciona solo en la
  pantalla de contraseña.
- **Mover un chat allí:** en los **Detalles** de un chat, toca **Mover a otro espacio**, escribe la contraseña del otro
  espacio y toca **Mover**. El chat pasa allí con sus mensajes, nombre, imagen y aspecto, y los chats importados en él,
  cifrado con la clave de ese espacio, y ese espacio sigue cerrado. El número de seguridad sigue igual, y a su teléfono
  se le dice al instante que a partir de ahora escriba allí. La opción se ve en todos los espacios, y la contraseña se
  prueba como en la búsqueda: una equivocada, o la del espacio abierto, no mueve nada. Un chat con alguien con quien el
  otro espacio ya tiene un chat propio se queda donde está. Quien lea el otro espacio con una herramienta forense podría
  ver que el chat vino de otro sitio: su contacto lo sigue conociendo por la clave de este espacio.
  Si ese espacio aún no tiene relay, Erevos ofrece el de este espacio: **Mover con el relay de este espacio** mueve el
  chat y le da a ese espacio este relay para quedárselo, y entonces el relay puede saber que ambos espacios están en
  un mismo teléfono.
- **Discreción:** por privacidad, la app nunca muestra si hay una segunda contraseña puesta. En la app web con las
  notificaciones con la app cerrada activadas, el número en el icono de Erevos se queda mientras Erevos está cerrado:
  si no coincide con el espacio que abres, puede delatar otro (**Número en el icono** lo desactiva).

## Chats ocultos {#hidden}

Cada espacio tiene 4 lugares para chats ocultos, cada uno se abre solo con su propio PIN, y nunca aparecen entre tus
otros chats. No hay ningún botón para ellos en ningún sitio. Cada lugar puede contener un chat o varios, así que 2
espacios tienen 8 lugares.

**Por qué:** cada lugar ya tiene un PIN propio, así que un chat solo en un lugar tiene una clave propia, y un lugar
también puede contener varios chats bajo un mismo PIN. El número de lugares es fijo por dos razones:

- **Para que no se note nada.** Los 4 lugares existen desde el primer arranque, llenos de datos aleatorios mientras no
  se usan. Quien te obligue a abrir el teléfono, o copie lo que guarda, no puede saber si tienes chats ocultos, ni
  cuántos. Con una clave para cada chat, los archivos sellados crecerían con cada nuevo chat oculto, y delatarían
  cuántos hay.
- **Para que siga siendo rápido.** Un PIN escrito en la búsqueda se prueba en cada lugar, y cada intento es lento a
  propósito (Argon2id, que requiere mucha memoria y tiempo, para que los PIN no se puedan adivinar rápido). Con 4
  lugares, abrirlos sigue siendo breve y siempre tarda lo mismo, así que el tiempo tampoco dice cuántos se usan.

El número se puede aumentar más adelante sin perder nada, a cambio de abrir un poco más despacio; reducirlo eliminaría
lo que contienen los lugares que se quitaran.

1. Empieza un lugar de una de estas dos formas: en **Ajustes** → **Privacidad y seguridad** → **Chats ocultos**, elige
   de **Posición 1** a **Posición 4**, toca **Poner PIN de chats ocultos**, escríbelo dos veces y toca **Guardar**; o
   abre los **Detalles** de un chat, toca **Mover a chats ocultos**, escribe un PIN de 4 caracteres o más, toca **Chats
   ocultos nuevos**, elige un lugar, y luego **Crear y mover**. Recuerda qué lugares usas: por privacidad, Erevos no
   puede decir cuáles están libres.
2. Para abrirlos, escribe el PIN en **Buscar chats** en la pantalla de inicio y pulsa Intro (la tecla de búsqueda del
   teclado). O mantén pulsado **Chat nuevo** un momento: se abre un campo para el PIN, con una vibración corta en Android, igual en todos los espacios;
   escríbelo y toca **Abrir**. Solo abre el lugar con ese PIN. Un PIN incorrecto es solo una búsqueda, o solo cierra el
   campo: no pasa nada.
3. Se abren con el título **Chats ocultos**, con **Contactos** y **Cambiar PIN** arriba, y listan sus chats y grupos
   como la pantalla de inicio lista los tuyos: los más nuevos primero, cada uno con lo último que se dijo, cuándo, y
   cuántos no se han leído. Toca uno para abrirlo. La flecha de volver los cierra.
4. Para mover otro chat a un lugar, abre sus **Detalles**, toca **Mover a chats ocultos**, escribe el PIN de ese lugar y
   toca **Mover**. El chat sale de tu lista con sus mensajes, nombre, imagen y aspecto, y los chats importados en él, y
   su número de seguridad sigue igual. A su teléfono se le dice al instante que a partir de ahora escriba a los chats
   ocultos; un mensaje que envíe justo en ese momento puede no llegar.
5. Para devolver un chat a los chats del espacio, ábrelo en los chats ocultos, luego sus **Detalles**, toca **Volver a
   mis chats** y **Mover**. Va con sus mensajes, nombre, imagen, aspecto y chats importados, y a su teléfono se le dice
   dónde escribir.

- **Relay, Nostr y teléfonos cercanos:** los chats ocultos tienen su propia cola en el relay y sus propias claves.
  Mientras están abiertos, o reciben cerrados, también llegan al teléfono de un contacto cercano, como tus otros chats
  (ver [Chatear con un teléfono cercano](#nearby)), pero otros teléfonos nunca los llevan, y nunca van por LoRa{~ ni por
  SMS}. Sin relay, su enlace de contacto dice dónde leen en Nostr, con una clave solo de ese lugar, y los
  textos van ahí, como desde un teléfono sin relay; las fotos, los mensajes de voz, las llamadas y los grupos necesitan
  un relay. Mientras están cerrados, sus mensajes esperan en el relay, o en Nostr dos días, salvo que **Recibir estando
  cerrados** esté activado.
- **Recibir estando cerrados:** un interruptor arriba de cada lugar. Activado, sus chats ocultos reciben como tus otros
  chats mientras el espacio está abierto, sea cual sea la pantalla que se vea y con Erevos en segundo plano: sus
  contactos ven al instante que llegó un mensaje, un aviso solo dice «New message», en Android una llamada suena con
  «Incoming call» y sin nombre (en la pantalla de la llamada, **Responder** la contesta sin PIN, en una pantalla sin nombre ni cara, y los chats ocultos siguen cerrados; el pequeño signo, el PIN y **Conectar** los abren y la contestan allí), y un recordatorio de su Chat conmigo muestra un aviso que solo dice **Reminder**. Lo que
  les llega por Nostr también se lee entonces{+, y sus propias cuentas de Matrix, XMPP y Nostr siguen conectadas (ver
  abajo)}. Una llamada que terminó antes de que los abrieras, o que sonó demasiado, aparece como perdida. Nada de ellos
  aparece en ningún sitio hasta que el PIN los abre. Un lugar nuevo empieza con esto activado; los lugares configurados
  antes se quedan como estaban hasta que lo actives. Para ello, la clave del lugar se guarda cifrada con el espacio,
  entre una clave aleatoria para cada uno de los otros lugares, así que abrir el espacio no muestra qué lugares reciben,
  ni cuáles están configurados. Pero quien abra el espacio y copie lo que guarda el teléfono también podría abrir ese
  lugar, sin PIN: el PIN los mantiene entonces fuera de la vista de quien tenga el teléfono, no de una herramienta
  forense. Desactivado, su clave solo está tras el PIN, y sus mensajes esperan en el relay hasta que los abras. Las
  copias de seguridad conservan el interruptor.
- **Punto para lo no leído:** con **Recibir estando cerrados** activado, un interruptor debajo (apagado salvo que lo
  actives). Activado, mientras uno de los chats o grupos del lugar tenga un mensaje sin leer{+, o uno de sus propios
  chats de Matrix, XMPP o Nostr haya tenido uno desde la última vez que lo abriste}, un pequeño punto aparece en la
  lupa de **Buscar chats** en la pantalla de inicio: nunca cuántos, ni dónde. Se va en cuanto los lees. Quien vea los
  chats del espacio también lo ve, y puede sospechar que hay chats ocultos. Los lugares que solo tienen **Avisar
  cuando llega un mensaje** no tienen punto: el interruptor tendría que guardarse donde el espacio puede leerlo.
- **Se cierran solos** en cuanto Erevos ha estado en segundo plano más de 30 segundos, como se vuelve a bloquear el PIN
  propio de un chat, pero no durante una llamada, ni mientras eliges una foto o un archivo para ellos o haces una foto.
- **Mientras están abiertos,** un mensaje que llega reproduce el sonido de mensajes nuevos, como en tus otros chats.
  Con Erevos en segundo plano antes de que se cierren, un aviso dice «New message» solo si **Recibir estando cerrados**
  o **Avisar cuando llega un mensaje** está activado para ese lugar.
- **Como tus otros chats:** lo que no puede salir ahora espera, marcado como **En espera**, solo por su relay, o por
  Nostr sin relay (ver **En espera** en [Chatear a través de un relay](#relay)), **Enviar más tarde** funciona como
  ahí, y un chat exportado de otra app se puede importar en los detalles de un chat oculto (ver
  [Chats importados](#import)). Ahí también se puede añadir un contacto a partir de una foto de su código QR, hecha o
  elegida mientras siguen abiertos. Cada lugar tiene su propio **Chat conmigo**, el primero de su lista (ver **Chat
  conmigo y recordatorios** en [Primeros pasos](#start)).
- **Grupos:** **Grupo nuevo**, bajo su lista, crea un grupo con sus contactos, como en la pantalla de inicio (ver
  [Chats de grupo](#groups)), y aparece en su lista entre sus chats. Sus miembros son solo contactos de ese lugar, y uno
  que añadas como contacto desde él pasa a ser un contacto de ese lugar. Lo que se escribe en él va solo por el relay
  del lugar, a una cola propia ahí, nunca a un teléfono cercano; mientras el lugar está cerrado solo se lee con
  **Recibir estando cerrados** activado, y **Avisar cuando llega un mensaje** no lo cuenta. Sus llamadas solo suenan
  mientras los chats ocultos están abiertos: una iniciada mientras están cerrados aparece como perdida. Un grupo ahí no
  tiene PIN propio, y ninguno es público.
- [+] **Matrix, XMPP y Nostr:** bajo su lista, **Matrix**, **XMPP** y **Nostr** abren las pantallas de esas redes (ver
  [Matrix](#matrix), [XMPP](#xmpp) y [Chats con otras apps de Nostr](#nostr-chats)) para cuentas propias de los chats
  ocultos, aparte de las del espacio: una cuenta de Matrix y otra de XMPP en las que iniciar sesión, y una clave de
  Nostr. Las sesiones y la clave se guardan cifradas con la clave de los chats ocultos, y nada de ellas se ve fuera de
  los chats ocultos: sus chats están solo en la lista de los chats ocultos, y no suman al número del icono de Erevos ni
  a la lista de inicio. Las cuentas se conectan mientras los chats ocultos están abiertos, y también mientras están
  cerrados si **Recibir estando cerrados** está activado, como reciben los propios chats ocultos: entonces un mensaje
  ahí muestra un aviso que solo dice «New message», y en Android una llamada de Matrix o de XMPP suena con «Incoming
  call» y sin nombre, y se responde con el PIN como sus otras llamadas; una que no se responde a tiempo aparece como
  perdida, y también una llamada de grupo de XMPP que llega mientras están cerrados. Desactivado, las cuentas se
  conectan solo mientras los chats ocultos están abiertos, y mientras están cerrados no llega nada. Sus chats llaman
  como los del espacio, desde la cuenta propia de los chats ocultos; una llamada a ella, mientras los chats ocultos
  están abiertos, suena con el tono del teléfono, y siguen abiertos hasta que termina. Una cuenta de Matrix suya no
  tiene **Avisar de mensajes nuevos**.
- **Dispositivos vinculados:** bajo su lista, **Dispositivos vinculados** vincula estos chats ocultos por su cuenta al
  mismo lugar en un ordenador o en un navegador, desde dentro, aparte del espacio y de sus dispositivos vinculados:
  sus chats, mensajes y cuentas propias van allí, y nada de ello se ve en el espacio (ver **Los chats ocultos y las
  segundas contraseñas** en [Dispositivos vinculados](#devices)). Sin vincular, están solo en este teléfono.
- **Las vistas previas de enlaces** tienen un interruptor propio en los detalles de un chat oculto, para todos los chats
  de ese lugar, desactivado salvo que lo actives (ver **Vistas previas de enlaces** en
  [Chatear a través de un relay](#relay)).
- **Avisar cuando llega un mensaje** (Android): arriba de un lugar mientras **Recibir estando cerrados** está
  desactivado. Activado, mientras el lugar está cerrado un aviso solo dice «New message», o cuántos llegaron, como para
  los otros chats, con Erevos en segundo plano o a la vista, cada mensaje una vez, también cuando Erevos estaba cerrado
  y se volvió a iniciar; lo que llegó mientras el lugar estaba abierto no hace ninguno una vez que se cierra. Que un
  mensaje tuyo les llegó o se leyó, escribiendo y las claves nuevas no hacen ninguno, ni una llamada que sonó (ver
  **Sonar las llamadas cuando están cerrados**); una que no sonó cuenta como mensaje. Un mensaje o una eliminación que
  otros teléfonos con {=Erevos} llevaron al relay (ver **Llevados por otros teléfonos** en
  [Chatear con un teléfono cercano](#nearby)) no puede decir lo que lleva, ya que los teléfonos que lo llevan no deben
  saberlo: cuenta como mensaje, así que una eliminación también muestra «New message», y el primer mensaje de un chat
  puede contar como dos; y uno enviado sin sonido suena como siempre (ver **Enviar sin sonido**). Necesita **Recibir y
  sonar** y **Avisar de mensajes nuevos** en **En segundo plano**, cosa que el interruptor dice cuando no están
  activados, y un relay que espere (del 18 de octubre de 2026 en adelante); uno anterior al 23 de octubre de 2026 solo
  puede decir que algo espera, así que entonces también aparece «New message» por eso, una vez hasta que abras ese
  lugar. Para ello, el espacio guarda una cola en el relay para cada uno de sus 4 lugares, las que no están en uso
  creadas para nada en el mismo relay, así que abrir el espacio no muestra ni si hay chats ocultos configurados ni
  cuáles, siempre que usen el relay del espacio; al relay solo se le pregunta cuántos mensajes llegaron, ya que los
  cuenta por el byte que lleva cada uno (ver lo que ve el relay, más arriba), nunca se le piden. Quien vea el aviso y no
  encuentre nada nuevo en tus chats puede suponer que hay más. Después de borrar o bloquear a alguien en el lugar, el
  primer mensaje de alguien nuevo, por el enlace de contacto o el código QR del lugar, no hace ninguno: se ve al abrir
  el lugar. Las copias de seguridad lo conservan.
- **Sonar las llamadas cuando están cerrados** (Android): debajo de **Avisar cuando llega un mensaje**, mientras
  **Recibir estando cerrados** está desactivado. Activado, mientras el lugar está cerrado, con Erevos en segundo plano o
  en cualquier pantalla, una llamada de uno de sus contactos hace sonar el teléfono y mostrar «Incoming call» sin
  nombre, como una llamada de tus otros chats. En la pantalla de llamada entrante, toca **Responder** o el pequeño
  símbolo, escribe el PIN y toca **Conectar** para responder; **Rechazar** detiene el timbre. Quien toca **Responder**
  sin el PIN no pasa del campo del PIN. El timbre dura unos 45 segundos. Necesita **Recibir y sonar** en **En segundo
  plano**, cosa que el interruptor dice cuando no está activado, y un relay que espere, y usa una cola en el relay
  propia para cada uno de los 4 lugares, las que no suenan creadas para nada en el mismo relay, igual que el
  aviso de mensajes de arriba, así que abrir el espacio no delata nada. Quien llama solo hace sonar una cola ahí; la
  llamada en sí espera en la cola propia del chat hasta que el PIN la abre. Un contacto que has eliminado todavía puede
  hacerlo sonar, pero la llamada nunca puede conectarse. Una llamada hecha desde un ordenador vinculado solo suena
  mientras los chats ocultos están abiertos. Las copias de seguridad lo conservan.
- **Un PIN nuevo para un lugar** (desde **Chats ocultos** en **Ajustes**, o **Chats ocultos nuevos**) lo empieza vacío
  y sustituye lo que había en él. Para conservarlos y cambiar solo el PIN, ábrelos y usa **Cambiar PIN** ahí. Cada PIN
  debe ser distinto de los demás y de la contraseña que abre Erevos.
- **Los PIN incorrectos en la búsqueda** se cuentan aparte de los de la pantalla de bloqueo: tras cinco, las búsquedas
  dejan de probar durante un rato, en silencio, y la pantalla de bloqueo nunca espera por ellos.
- **Un PIN deja fuera a quien coge el teléfono,** no a quien copia lo que guarda: con una herramienta forense en un
  teléfono desbloqueado o rooteado, los PIN se pueden probar sin espera. Cada intento cuesta un Argon2id (mucha memoria
  y tiempo), pero un PIN de 4 dígitos son solo 10.000 intentos. Si eso es lo que temes, usa un PIN más largo, o unas
  cuantas palabras.
- **Discreción:** cada espacio tiene los 4 lugares desde el principio, los no usados llenos de datos aleatorios que
  parecen usados, y la búsqueda prueba cada lugar cada vez. Así que nada muestra si hay chats ocultos configurados, ni
  cuántos.

### Un chat bloqueado con un PIN {#chat-pin}

Un chat o un grupo puede tener un PIN propio, aparte de los chats ocultos: se queda entre tus chats, pero solo se abre
con su PIN.

1. Abre el chat, toca **⋮** arriba para sus **Detalles**, y luego **Bloquear con un PIN** (en un grupo: el nombre del
   grupo arriba, y luego **Bloquear con un PIN**).
2. Escribe dos veces un PIN de al menos 4 caracteres, y luego **Bloqueo**.

- **Abrirlo:** pide el PIN. Se vuelve a bloquear en cuanto sales de él, abres otro chat, o Erevos está fuera más de
  medio minuto (como el bloqueo con contraseña).
- **Tras el PIN** no se ve nada del chat: no se dibuja ninguno de sus mensajes hasta que se escribe el PIN, y con
  cristal, un fondo de pantalla o la escena propia de un estilo, la pantalla del PIN está sobre una escarcha densa que
  no deja pasar nada.
- **En la lista** muestra su nombre con un candado y **Bloqueado con un PIN**, nada de sus mensajes, ni en la búsqueda,
  en **Mensajes destacados** o en **Chats importados**. El aviso solo dice **New message**, como para cualquier chat.
- **Los PIN incorrectos** se cuentan en el teléfono, para todos los chats a la vez y aparte de los de la pantalla de
  bloqueo: tras cinco, el siguiente intento espera, más cada vez.
- **¿Olvidaste el PIN?** Bajo el PIN, donde el espacio tiene contraseña, **¿Olvidaste el PIN?** lo quita con la
  contraseña que abre el espacio. Sin contraseña, nada puede volver a abrirlo: eliminar el contacto es entonces la
  única forma.
- **A los chats ocultos:** un chat que mueves a los chats ocultos se lleva su PIN, que ahí no pide nada, ya que el PIN
  propio de los chats ocultos los protege. Devuelto a los chats, el mismo PIN vuelve a pedirse.
- **Para quitarlo:** **Detalles** → **Bloquear con un PIN** otra vez, y escribe su PIN.
- **Solo este teléfono lo conoce,** y cada dispositivo vinculado tiene el suyo. Las copias de seguridad lo conservan.
- [~] **También en {+Matrix, XMPP, Nostr y }SMS:** {+un chat de Matrix, XMPP o Nostr tiene **Bloquear con un PIN** al pie, y
  }una conversación SMS {-tiene **Bloquear con un PIN** }bajo su línea **SMS normal**, y funciona igual: en la lista su nombre con un candado, ninguno
  de sus mensajes en la búsqueda, y la contraseña del espacio quita un PIN olvidado. **Bloquear capturas de pantalla**
  está al lado, solo en este teléfono (Android): los demás no se enteran. Los chats de un lugar oculto no ofrecen
  ninguno de los dos, ya que su propio PIN los guarda y quedan fuera de las capturas
  mientras **Capturas de pantalla** esté activado.

**Por qué:** algunos chats deben quedarse donde están, pero sin abrirse para quien tenga el teléfono un momento. El PIN
solo se guarda como su Argon2id, así que no se puede leer del teléfono, y los intentos de adivinarlo son lentos. Es un
bloqueo en la pantalla, no una clave propia: los mensajes del chat siguen cifrados con el resto del espacio, y quien
copie lo que guarda el teléfono mientras el espacio está abierto todavía podría leerlos. Para un chat que ni siquiera
debe verse, usa los chats ocultos.

## Colección {#collection}

La Colección es un lugar cifrado para tus fotos, archivos y carpetas, en cada espacio y en cada lugar oculto, cada uno con la suya: la del espacio solo se abre en el espacio, la de un lugar oculto solo en ese lugar oculto, y nada en el teléfono dice que un lugar tiene una. Su icono, dos imágenes con un diminuto candado, está en la pantalla de inicio a la izquierda del candado y arriba en los chats de un lugar oculto. Es un módulo, en Android, en la aplicación de escritorio, en la app web y en Sailfish OS: **Ajustes** → **General** → **Módulos**.

- **Dentro:** pestañas arriba: las **Fotos** en una cuadrícula por meses, los **Vídeos**, la **Música** y los demás **Archivos** en listas, cada una con encima las carpetas que tienen algo suyo (**Archivos** también las vacías). **+** hace una foto con la cámara, que va directa aquí y nunca a la galería, trae un archivo de los archivos del teléfono, de hasta 4 GB, cifrado a medida que se lee, sin copia previa, o crea una carpeta nueva. Mantén pulsado para elegir varios, para moverlos, enviarlos o borrarlos; mantén pulsada una carpeta para renombrarla o borrarla, lo que conserva sus archivos.
- **Cifrada:** cada archivo se cifra con una clave propia, en trozos con nombres al azar entre los trozos de los chats, de modo que nada en el teléfono distingue un archivo de la Colección de una foto de un chat. Solo el catálogo propio de la Colección, sellado como los chats, dice cuál es cuál. La Colección queda fuera de las capturas de pantalla y se cierra cuando el espacio se bloquea.
- **Pide de nuevo:** donde el espacio tiene contraseña, la Colección la pide cada vez que se abre, y otra vez cuando Erevos estuvo fuera más de 30 segundos, antes de mostrar nada; también sirve la huella o la cara donde desbloquea Erevos. Las contraseñas erróneas cuentan como en la pantalla de bloqueo. La Colección de un lugar oculto no pide nada más, porque los chats ocultos se cierran en cuanto sales de Erevos.
- **Desde un chat u otra app:** mantén pulsada una foto o un archivo de un chat y luego **Guardar en la Colección**: se copia en la Colección del lugar de ese chat. Desde Compartir de otra app, **Enviar a** tiene primero la **Colección** y pregunta en qué carpeta; entra tal como llegó, ya cifrado, así que nunca queda sin cifrar en el teléfono. Puede ser de hasta 4 GB; uno de más de 100 MB solo puede ir a la Colección, ya que un chat acepta 100 MB como máximo.
- **Fuera de la Colección:** una foto se abre a pantalla completa, para deslizar y hacer zoom, con **Enviar a un chat**, **Guardar en el teléfono**, **Información** y **Borrar**. Guardar en el teléfono o abrir un archivo con otra app lo saca sin cifrar, y Erevos lo avisa antes. Enviar a un chat deja la copia de la Colección donde está. Desde la Colección de un lugar oculto los archivos van solo a los chats y grupos de ese lugar oculto, nunca a los del espacio, y la Colección del espacio nunca a un lugar oculto. Desliza, o usa las flechas, para la foto siguiente o la anterior; **Presentación** arriba las muestra una tras otra, cada 4 segundos, hasta un toque.
- **Desde un chat:** **+** bajo el campo del mensaje y luego **Colección** abre la Colección del lugar de ese chat: toca las fotos o archivos que quieras enviar y luego **Enviar**, y van a ese chat.
- **Copias de seguridad:** una copia guarda la Colección con el resto del teléfono. **Ajustes** → **Datos y dispositivos** → **Colección**, o los tres puntos dentro de la Colección, pueden dejar esa Colección fuera de las copias que se hacen mientras está abierta: cada Colección tiene su propia elección.
- **En un servidor WebDAV:** en los ajustes de la Colección, **También en un servidor WebDAV** copia los archivos de esa Colección tal como están, cifrados, a una carpeta en un servidor que eliges, Nextcloud, ownCloud o cualquiera que hable WebDAV: da la dirección de la carpeta, un nombre de usuario y, mejor, una contraseña de aplicación, y toca **Conectar**; **Probar la conexión** los comprueba antes. Cada espacio y cada lugar oculto tiene su propia elección y su propio servidor; primero se propone el servidor de las copias de seguridad. Solo va lo que aún no está allí, una pieza cada vez, mientras el lugar está abierto, y sigue donde se quedó si cae la red; un archivo borrado aquí se borra también allí. Nada más de la carpeta se toca. El servidor solo ve piezas con nombres al azar, en una subcarpeta con un nombre al azar, y no puede abrirlas. Un teléfono al que le falta un archivo, como tras restaurar una copia en un teléfono nuevo, lo trae de allí al abrirlo, y solo guarda piezas que se abren con la clave del archivo. Erevos muestra cuánto ha llegado ya, con **Cancelar**: lo que llegó se queda, y la próxima vez solo llega el resto; la música, los vídeos, los PDF y **Abrir con otra aplicación** también lo traen primero. Mientras todo está copiado, las copias de seguridad hechas con el lugar abierto pueden dejar fuera sus piezas, también después de que Erevos vuelva a arrancar, hasta que se añada o se borre un archivo. Tiene su propio interruptor **Por Tor**, desactivado salvo que lo actives: activado, la copia va solo por Tor, diga lo que diga el ajuste de Tor del espacio, así que el servidor no ve tu dirección IP; es más lento y espera mientras Tor arranca. Donde no hay Tor, en la aplicación de escritorio y en la app web, un servidor con él activado no recibe nada.
- **Con Nextcloud, como el de LPHL:** en ese formulario, y en **Añadir un servidor** de las copias de seguridad, escribe la dirección de tu Nextcloud en **Tu Nextcloud** y toca **Iniciar sesión con Nextcloud**: inicia sesión en el navegador, como en Fasouli, con Authentik o como se inicie allí, y elige **Conceder acceso**. Erevos obtiene una contraseña de aplicación propia y rellena el formulario con su propia carpeta en tus archivos, **Erevos/Collection** o **Erevos/Backups**, creada si no existe, junto a la de Fasouli, que nunca lee; luego toca **Conectar**. Esa contraseña se retira en Nextcloud → Configuración → Seguridad. El inicio de sesión sigue el interruptor **Por Tor** del servidor para el que se hace: activado, Erevos pregunta a tu Nextcloud solo por Tor, pero la página del navegador en sí va como siempre.
- **En tus dispositivos vinculados:** en los ajustes de la Colección, **También en mis dispositivos vinculados** envía esa Colección a los [dispositivos vinculados](#devices) de su espacio o lugar oculto, y el interruptor vale para todos. Un archivo añadido, renombrado, movido o borrado en uno lo está en todos. Las miniaturas llegan enseguida; el archivo en sí llega enseguida en la misma Wi-Fi, si no cuando lo abres, desde el servidor WebDAV si la Colección tiene uno, o por el relay hasta 100 MB. Cada trozo se guarda solo cuando abre con la clave del archivo, y una transferencia cortada sigue desde el trozo que faltaba. Un archivo se borra en otro lugar solo cuando se borra en uno de tus dispositivos, nunca porque falte allí. La Colección de un lugar oculto va solo a los dispositivos vinculados de ese lugar.
- **Música, vídeos y PDF:** un PDF se lee página a página dentro de Erevos (Android 11 y posteriores), descifrado solo en la memoria. La música y los vídeos se reproducen directamente desde sus trozos cifrados, nunca desde una copia: un vídeo a pantalla completa, la música con las siguientes de la carpeta, sin parar con la pantalla apagada, con reproducir, pausa, siguiente y anterior en la notificación y en la pantalla de bloqueo del teléfono, y solo eso allí. La lista sigue después de que el espacio se bloquee, salvo que **Detener la reproducción cuando el espacio se bloquea** esté activado en los ajustes de la Colección; **Detener** y el botón de pánico la terminan. La notificación solo dice **Reproduciendo**, salvo que **Mostrar el título en la notificación** esté activado. **Abrir con otra aplicación** entrega el archivo a medida que se descifra, sin copia en el teléfono, hasta que salgas de la Colección; la otra aplicación puede quedarse con una propia.
- **Originales de la galería:** con **Borrar el original de la galería tras importarlo** activado, una foto o un vídeo elegido de los archivos del teléfono se borra de la galería en cuanto está en la Colección, después de que Android te pida confirmarlo. Hace falta Android 11 o posterior. Una foto de la cámara nunca va a la galería. Si Android no dice qué foto de la galería es (como desde **Recientes** en el selector de archivos), el original se queda y Erevos lo dice: elígela en **Imágenes** o en el almacenamiento del teléfono.
- **Fotos y vídeos:** en **+**, **Cámara** es la propia de Erevos: fotos y vídeos uno tras otro, con flash y cámara frontal, directo a la Colección, nunca a la galería, y ninguna otra aplicación los ve; una foto nunca se escribe en ningún sitio, ni por un momento, y no lleva nada más que su imagen. Donde el fabricante del teléfono los ofrece, como en un Pixel, **Noche** y **Retrato** están junto a **Foto**, y arriba **HDR activado**: son del propio teléfono, se hacen en él, y nada sale. Un toque enfoca y ajusta la luz ahí; con dos dedos haces zoom, y los botones sobre el obturador van al gran angular (**0.5×**), a **1×**, **2×** y **5×** donde el teléfono los tiene. **Más** tiene un temporizador de 3 o 10 segundos, una cuadrícula, un obturador silencioso donde la ley lo permite, **Más oscuro** y **Más claro** y, para vídeos, HD, Full HD o 4K, y **Vídeo HDR activado** donde el teléfono lo graba; en vídeo la luz puede quedarse encendida. **De la galería** trae muchas fotos y vídeos a la vez; con **Borrar el original de la galería tras importarlo** activado, Android pregunta una sola vez por todos. Las fotos HEIC y AVIF aparecen en **Fotos** (Android muestra HEIC desde 9 y AVIF desde 12); una que el dispositivo no puede mostrar ofrece **Abrir con otra aplicación**. Bajo una foto, **Editar** la gira un cuarto cada vez y la recorta con un marco que arrastras por las esquinas: se guarda como foto nueva, y la original se queda como estaba. **Información** dice si una foto o un vídeo dice dónde se tomó. Una foto JPEG, PNG, WebP o GIF guardada fuera o abierta con otra aplicación sale sin dónde ni cuándo se tomó ni el teléfono, salvo que **Las fotos salen con lugar y hora** esté activado en los ajustes de la Colección; un vídeo o una foto HEIC sale tal cual, y Erevos avisa antes si nombra un lugar. La cámara, la galería y **Editar** están en Android; en la app de escritorio y en un navegador también se ven las fotos AVIF.
- **En la aplicación de escritorio:** en Linux, macOS y Windows la Colección también funciona, con sus archivos cifrados en la carpeta propia de Erevos en el ordenador. **+** trae un archivo del ordenador, cifrado trozo a trozo; no hay cámara. Fotos, textos, PDF (en el visor de PDF integrado), música y vídeos se abren solo en la memoria de Erevos, nunca como copia sin cifrar en el disco, hasta 1 GB cada uno, y música y vídeos de cualquier tamaño, leídos trozo a trozo de sus partes cifradas mientras suenan; el archivo se cierra, y la música o un vídeo se detiene, cuando el espacio se bloquea o con el botón de pánico. **Guardar en el ordenador** pregunta antes, como en el teléfono; **Abrir con otra aplicación** no está.
- **En un navegador y en Sailfish OS:** la app web, también en la pantalla de inicio de un iPhone, y {=Erevos} en Sailfish OS tienen también la Colección. **+** trae un archivo con el selector del propio navegador, leído y cifrado trozo a trozo, así que uno grande nunca se tiene entero en memoria; sus trozos se guardan en el almacenamiento del navegador, o en Sailfish OS en la carpeta propia de Erevos. Un navegador da a un sitio un espacio limitado: cuando se acaba, no se guarda nada del archivo, y Erevos lo dice. Fotos, textos, música y vídeos se abren solo en memoria, hasta 256 MB cada uno, y se cierran cuando el espacio se bloquea; un PDF no se muestra allí: guárdalo para leerlo con otra aplicación. **Guardar en este dispositivo** (en Sailfish OS **Guardar en el teléfono**) pregunta antes; en un navegador admite hasta 256 MB, mientras que Sailfish OS escribe en Descargas un archivo de cualquier tamaño trozo a trozo. En un navegador el servidor WebDAV tiene que dejar entrar a la app web, como para las copias de seguridad; Sailfish OS no tiene copia en WebDAV.
- **Formatos:** en Android se reproducen MP3, AAC y M4A, FLAC, Ogg y Opus, WAV, AMR, MP4, MKV, WebM y 3GP, también un archivo que llegó sin tipo, reconocido por la terminación de su nombre, como suelen llegar los archivos de otras apps. En la app de escritorio y en un navegador, lo que el navegador reproduce de ellos: ni 3GP ni AMR.
- **La pantalla de reproducción:** toca la barra de la música que suena abajo en la Colección, o **Sonando ahora** bajo un archivo de música, para ver la portada, el título, el artista y el álbum como los dice el archivo (si no, su nombre), una barra para tocar o arrastrar a otro punto, anterior, reproducir o pausa y siguiente, **Aleatorio**, **Repetir** (la lista, o el archivo) y la velocidad, de 0.5× a 2×, y la lista, con la que suena marcada: toca otra para oírla. Un vídeo, o música de 10 minutos o más, empieza donde lo dejaste: el punto se guarda en el catálogo de la Colección, cifrado con él, en ningún otro sitio del teléfono, y solo para este dispositivo. La notificación y la pantalla de bloqueo muestran el título, el artista y la portada solo con **Mostrar el título en la notificación** activado; si no, solo **Reproduciendo**.
- **Subtítulos:** un archivo .srt o .vtt en la misma carpeta que un vídeo, con su nombre (film.mkv y film.srt, o film.en.srt), se muestra como sus subtítulos, leído de sus partes cifradas como el vídeo; **Subtítulos sí** arriba los quita, y los vuelve a poner.
- **Listas de reproducción:** arriba en **Música**, **Nueva lista de reproducción** crea una; las canciones entran desde su menú (**Añadir a una lista de reproducción**) o elegidas juntas (mantén una pulsada, luego **Lista de reproducción**). Ábrela para reproducirla en orden o en orden aleatorio, subir o bajar una canción, o quitarla: se queda en la Colección. Las listas se guardan cifradas con la Colección, nunca sin cifrar.
- **Radio:** la pestaña **Radio** tiene emisoras de radio por internet, cada una por su enlace; **+** allí añade una. Solo enlaces https: Erevos no abre http sin cifrar, así que una emisora que solo tiene un enlace http no se puede añadir. Un enlace de lista (.m3u, .pls) se lee una vez, al añadirlo, para obtener el enlace del propio flujo; un flujo HLS (.m3u8) suena en el teléfono. Una emisora suena como la música, con el mismo aviso, el mismo **Detener la reproducción cuando el espacio se bloquea** y el botón de pánico; el título que envía se ve en la pantalla de reproducción, y en el aviso solo cuando **Mostrar el título en la notificación** está activado. Salvo que **Reproducir por Tor** esté activado, más abajo, la emisora, y quien lleva su servidor, ve la dirección IP de tu dispositivo mientras suena, como cualquier sitio, y Erevos lo dice antes de que suene la primera. Erevos no le envía nada más a una emisora, y solo «Erevos» como su nombre. Las emisoras se guardan cifradas con la Colección.
- **Encontrar una emisora:** **Añadir una emisora** también busca en Radio Browser (radio-browser.info), un directorio libre de emisoras al que cualquiera puede añadir: se le envían solo las palabras que escribes, cuando pulsas **Buscar**, y ve la dirección IP de tu dispositivo, como la emisora. Solo se muestran emisoras para las que tiene un enlace https; un toque añade una. Con **Por Tor** activado en **Listas de radio y TV**, más abajo, la búsqueda va por Tor y Radio Browser no ve tu dirección IP.
- **Una lista ya hecha de un país:** **Añadir una emisora** también añade, con **Añadir las emisoras de este país**, las emisoras más escuchadas de Radio Browser en el país que elijas, hasta 100, cada una con un enlace https. A Radio Browser se le pregunta una vez, al pulsarlo, y ve la dirección IP de tu dispositivo, salvo que **Por Tor** esté activado en **Listas de radio y TV**.
- **Una lista con muchas emisoras:** un enlace de lista (.m3u, .pls) que nombra muchas emisoras las añade todas, e **Importar un archivo de lista** añade las emisoras de un archivo .m3u o .pls de tu dispositivo, que se lee allí y no se envía a ninguna parte. Solo se añaden emisoras con enlace https (500 como máximo de una lista), y Erevos dice cuántas quedaron fuera.
- **Cuando se corta un flujo:** si el servidor de una emisora, o un proxy en el camino, termina el flujo, o la red se va un momento, Erevos vuelve a pedir la emisora solo tras 1, 2, 4… segundos (30 como máximo), mientras quieras que suene, en Android, en el ordenador y en el navegador. Tras 12 intentos seguidos se detiene y lo dice.
- **TV:** la pestaña **TV** guarda canales de TV, cada uno por su enlace https, en los grupos que les da su lista, con una fila para mostrar un grupo y una búsqueda por nombre. Un toque reproduce un canal en toda la pantalla, como un vídeo, con el mismo **Detener la reproducción cuando el espacio se bloquea** y el botón de pánico; no hay guía de programación. Se reproduce en Android, en la app de escritorio y en un navegador; allí un flujo HLS se reproduce con hls.js, y solo cuando su servidor deja que la app web lo lea.
- **Añadir canales:** **+** en **TV** añade una lista por su enlace (.m3u), que se lee una vez al añadirla, un archivo de lista de tu dispositivo (**Importar un archivo de lista (.m3u)**), que se lee allí y no se envía a ningún sitio, o un canal por su enlace. Solo se añaden canales con enlace https, cada enlace una vez, hasta 15.000 en cada Colección, y Erevos dice cuántos quedaron fuera. Mantén pulsado un canal para renombrarlo, eliminarlo a él o a todo su grupo, o mandar con **Enviar a un chat** su nombre y enlace; el menú de una emisora de radio también tiene **Enviar a un chat**.
- **iptv-org:** **Añadir canales** ofrece iptv-org (github.com/iptv-org/iptv), una lista pública de canales gratuitos: **iptv-org por país**, primero la región de tu dispositivo, o **iptv-org: todos los canales**, más de 10.000. Su servidor ve la dirección IP de tu dispositivo cuando se descarga la lista, y cada canal cuando se reproduce, salvo que **Reproducir por Tor** esté activado. Con **Por Tor** activado en **Listas de radio y TV**, más abajo, la lista se descarga por Tor, así que su servidor no ve tu dirección IP; cada canal sigue viéndola cuando se reproduce, salvo que **Reproducir por Tor** también esté activado.
- **Lo que ve un canal:** salvo que **Reproducir por Tor** esté activado, más abajo, el canal, y quien lleva su servidor, ve la dirección IP de tu dispositivo mientras se reproduce, como cualquier sitio, y Erevos lo dice antes de que se reproduzca el primero. Los logotipos solo se muestran con **Mostrar los logotipos de los canales** activado en los ajustes de la Colección, porque el servidor de cada logotipo también ve tu dirección IP; si no, un icono de TV. Los canales se guardan cifrados con la Colección.
- **Listas de radio y TV por Tor:** en los ajustes de la Colección, la tarjeta **Listas de radio y TV** tiene **Por Tor**, desactivado salvo que lo actives. Activado, Erevos pregunta solo por Tor, diga lo que diga el ajuste de Tor del espacio, por la búsqueda en Radio Browser, una lista de reproducción o de TV descargada por su enlace, la lista de iptv-org y los logotipos de los canales, así que sus servidores no ven la dirección IP de tu dispositivo. Es más lento y espera mientras Tor arranca. Reproducir las propias emisoras y canales tiene su propio interruptor, justo después.
- **Reproducir por Tor:** en Android los ajustes de la Colección también tienen **Reproducir por Tor**, desactivado salvo que lo actives. Activado, las emisoras y los canales se reproducen solo por Tor, así que ni ellos ni quien lleva sus servidores ven la dirección IP de tu dispositivo; si Tor no arranca, nada se reproduce directo en su lugar. Es más lento y espera mientras Tor arranca, y un canal de TV puede tardar en empezar o atascarse un momento. Mientras el espacio envía todo por Tor, se reproducen por Tor aunque esté desactivado. Desactivado, se reproducen directo: antes de que suene el primero, Erevos dice que su servidor ve tu dirección IP, con un botón **Reproducir por Tor** que lo activa y reproduce por Tor, y **Seguir**, que reproduce directo. Solo Android los reproduce por Tor: en otros sitios, con él activado, no se reproducen, y Erevos dice por qué; en un ordenador tampoco mientras el espacio envía todo por Tor.

**Por qué:** algunas fotos y archivos, un pasaporte, un contrato, una imagen, no deben estar en la galería para que cualquier app los lea ni viajar en un chat. La Colección los guarda con el mismo cifrado que los chats, aparte de ellos. Cuando un archivo se guarda en el teléfono o se abre con otra app, está fuera de Erevos, sin cifrar.

## Copias de seguridad {#backup}

Una copia de seguridad contiene todo lo que Erevos guarda en este teléfono: cada espacio, con sus contactos, las
claves de sus conversaciones, sus mensajes, fotos, archivos, mensajes de voz, chats importados y chats ocultos, {+sus
cuentas de Matrix, XMPP y Nostr, }su Chat conmigo, el bloqueo y la contraseña de pánico, y los ajustes que te acompañan
a otro teléfono. Dentro de ella cada espacio sigue sellado con su propia contraseña, y la copia se vuelve a sellar con
una contraseña propia. Sus fotos, archivos y mensajes de voz van en archivos propios junto a ella, de hasta 4 MB cada
uno, cuyos nombres empiezan como el de la copia; una copia automática usa también los archivos de las anteriores:
mantén junta toda la carpeta. Está en **Ajustes** → **Datos y dispositivos** →
**Copias de seguridad**.

[+] Telegram, Signal, Messenger y Session no están en una copia de seguridad: sus cuentas y chats se quedan en cada red. Tras restaurar, vuelve a iniciar sesión en Telegram y Messenger, registra o vincula Signal de nuevo y recupera Session con sus 13 palabras de recuperación; sus mensajes vuelven solo hasta donde cada red los guarda. Lo que Erevos guarda de ellos sí entra: las notificaciones de cada chat, la elección de Tor y las claves del cifrado ErevosGram.

1. **Hacer una copia de seguridad:** toca **Hacer una copia de seguridad**, elige una carpeta (en el teléfono, una
   tarjeta de memoria, o una app en la nube que muestre ahí sus carpetas; en un ordenador, cualquier carpeta), escribe
   dos veces una contraseña para la copia (al menos 12 caracteres, o cuatro palabras) y toca **Guardar**. En un navegador, la copia y sus archivos van al menú de compartir o a las descargas: el primero enseguida, y cada uno de los siguientes tras un toque en **Guardar**.
   Mientras se hace, su tarjeta dice qué hace y cuánto lleva; cuando termina, lo dice un aviso.
2. **Copias automáticas:** elige **Cada 6 horas**, **Cada día** o **Cada semana**, y luego una carpeta y una
   contraseña. Erevos hace una mientras está abierto, en cuanto la última es más antigua que eso: cuando se abre un
   espacio, cada 15 minutos y al pasar a segundo plano, antes de bloquearse; nunca sin un espacio abierto. Cada una
   escribe solo las fotos, archivos y mensajes de voz que son nuevos desde la anterior, y nombra de nuevo los archivos
   de las anteriores para el resto, así que una cada 6 horas cuesta poco. La carpeta conserva las 3 más nuevas, con
   todos los archivos que necesitan, y borra los archivos que ninguna de ellas necesita. Una que falló se vuelve a
   intentar cuando se abre un espacio, o una hora después. Debajo están **Hacer
   copia ahora**, **Cambiar carpeta** y **Cambiar contraseña**; **Desactivado** las detiene, y las ya hechas se quedan
   en la carpeta.
3. **También a un servidor:** en Android y en la app de escritorio, con las copias automáticas activadas, **Añadir un
   servidor** en **También a un servidor** envía cada una también a una carpeta en un servidor que elijas y que hable
   WebDAV, como tu propio Nextcloud: da la dirección de la carpeta, un nombre de usuario y, mejor, una contraseña de
   aplicación solo para Erevos, y toca **Conectar**. El servidor guarda las 3 más recientes, con todos los archivos
   que necesitan, y cada una envía solo lo nuevo; **Dejar de enviar** lo
   detiene, y las que hay allí se quedan. En la web app, que no hace copias por sí sola, **Enviar una copia ahora**
   envía una allí, con una contraseña que escribes cada vez.
   Cada servidor tiene un interruptor **Por Tor**, en su tarjeta y en el formulario que lo añade, desactivado salvo
   que lo actives (mira **En un servidor** más abajo).
4. **Restaurar:** toca **Restaurar una copia de seguridad**, elige el archivo y escribe su contraseña. Erevos pregunta
   una vez más, encuentra los archivos de la copia junto a ella, o te pide que los elijas a ellos o su carpeta (para
   una copia automática, elige todos los archivos de la carpeta, pues algunos de sus archivos pueden empezar como el
   nombre de una copia anterior), y luego
   pone la copia en lugar de todo lo que hay en el teléfono, y se abre como estaba cuando se hizo la copia, con las
   contraseñas de entonces. Si falta uno de sus archivos, está dañado o es de otra copia, Erevos dice cuál, y no se cambia nada a menos que elijas restaurar el resto sin él: entonces las fotos, los archivos y los mensajes de voz del teléfono quedan como están, y los que contiene no vuelven.
   **Restaurar desde un servidor** mira en la carpeta a la que van las copias automáticas, o en una que des con su
   usuario y contraseña, y muestra las copias que hay allí, las más recientes primero: elige una, escribe su contraseña
   y se restaura igual, con sus archivos desde allí.

- **Guarda la contraseña de la copia:** nada abre una copia sin ella, y nadie puede recuperarla. Sin bloqueo con
  contraseña, la contraseña de la copia es lo único que la protege. Quien tenga el archivo puede probar contraseñas en
  él tan rápido como dé su ordenador, sin ningún teléfono que lo frene, así que una corta no aguanta: Erevos no acepta
  ninguna de menos de 12 caracteres.
- **Las copias automáticas guardan su contraseña en el teléfono,** así que no necesitan contraseña cada vez. Quien abra
  su carpeta sigue necesitando las contraseñas de los espacios para leer los chats.
- **Qué ocupa espacio:** en Android, **Medir** en **Qué ocupa espacio** muestra cuánto espacio ocupa Erevos en el teléfono, por tipo: {~la Colección con |}las fotos y archivos de los chats, los mensajes de voz, el historial de chats, Tor y los restos de escrituras que no terminaron. Cada copia automática lo contiene todo, así se ve por qué una es grande. Solo se miran los nombres y tamaños de los archivos, en el teléfono, y no se envía nada.
- **Restos:** las fotos y archivos que ya ningún chat{~, Colección ni| ni} importación nombra, como los de una importación que se cortó a medias, se quedan en el teléfono y en cada copia. En **Restos**, escribe uno a uno, o varios a la vez separados por comas o espacios, el PIN de cada uno de tus chats ocultos y la contraseña de cualquier otro espacio, y toca **Buscar restos**: Erevos lee qué archivos nombra cada uno y este espacio, y muestra cuánto no nombra ninguno. **Borrarlos** los borra, después de que lo confirmes una vez más. Un lugar que no abriste allí pierde sus fotos y archivos: abre todos primero. Un archivo escrito en el último día nunca se toma, y las copias ya hechas lo conservan todo.
- **Comprobar las copias:** tras cada copia automática, Erevos la vuelve a leer de la carpeta: se abre con su contraseña, cada parte que nombra está ahí, con su tamaño, y dos partes elegidas al azar se leen enteras. De un servidor solo mira entonces la lista, así que no se descarga nada. **Comprobar ahora** además descarga la copia más reciente del servidor y diez de sus partes. Una parte que falta o está dañada se ve en rojo: haz una copia ahora y vuelve a comprobar. **Comprobación completa de la carpeta** lee entera cada parte de ahí y la compara con el SHA-256 que la copia anotó para ella: unos minutos con muchos GB, y nada sale del teléfono.
- **En un servidor:** la copia que va allí está sellada con su contraseña como las demás, y esa contraseña nunca sale
  del teléfono, así que el servidor no puede abrirla. Su nombre es aleatorio y el archivo parece bytes aleatorios, de
  uno de pocos tamaños, así que ninguno dice que es de Erevos ni cuánto guarda exactamente. Sus fotos, archivos y
  mensajes de voz van como subidas propias, todas del mismo tamaño, cada una también con un nombre aleatorio y sellada
  con la contraseña de la copia, atada a esa copia y a su lugar en ella, así que ninguna puede cambiarse, faltar o
  venir de otra copia sin que se note; el servidor guarda cada una mientras la necesite alguna de las copias que
  guarda, y luego la borra. Sus nombres son tan largos como el de la copia, pero su tamaño las distingue de ella, así que el servidor puede contarlas, y saber así más o menos cuánto guarda la copia. Lo que dejó allí una copia cortada a medias se borra antes de que vaya la siguiente, así que un servidor que no tenía sitio vuelve a tenerlo. Aun así el servidor ve
  tu cuenta, cuándo llega una y más o menos cuánto ocupa. En Android, las copias van allí como dice la elección del
  espacio en **Ajustes** → **Relay y redes** → **Tor**{+, como Matrix}: con **Todo** solo por Tor, así que el servidor no
  ve la dirección del teléfono; con **Mensajes** por Tor en cuanto Tor está listo, y directo mientras Tor arranca o
  cuando falla; con **Nada** directo, y el servidor ve la dirección del teléfono. Una copia espera primero hasta dos
  minutos a que arranque Tor, y **También a un servidor** dice por dónde va ahora. En la app de escritorio las envía
  la propia app, no su página, ya que una página no puede llegar a un servidor así; en la web app las envía el
  navegador, que solo llega a un servidor configurado para dejar entrar a la web app (CORS), cosa que Nextcloud no
  hace de serie. Ninguna de las dos tiene Tor para ello: mientras un espacio envía **Todo** por Tor, no va ninguna
  desde ahí. En la web app la contraseña del servidor se guarda en el navegador, sellada con una clave que el
  navegador no entrega. **Restaurar desde un servidor** descarga la que elijas del mismo modo, por Tor según diga el
  espacio, y no escribe nada allí; una contraseña escrita para ello se usa solo para esa restauración y no se guarda.
  Por Tor no llega ningún archivo de una copia de más de 64 MB, y directamente ninguno de más de 100 MB, lo máximo que
  Erevos acepta en una descarga: entonces descarga la copia y sus archivos del servidor y toca **Restaurar una copia de
  seguridad**. Un Erevos anterior a esta versión no abre una copia así. Google Drive queda fuera a propósito: Google
  ata el archivo a tu nombre, y Erevos necesitaría las apps de Google y una sesión de Google en el teléfono.
  El interruptor **Por Tor** de cada servidor, desactivado salvo que lo actives, va antes que la elección del espacio
  para ese servidor: activado, sus copias van solo por Tor, diga lo que diga el ajuste de Tor del espacio, y esperan a
  que Tor arranque, así que el servidor no ve la dirección del teléfono. **Restaurar desde un servidor** y el
  formulario que añade un servidor tienen el mismo interruptor, y el inicio de sesión con Nextcloud sigue el
  interruptor del servidor para el que se hace: la página del navegador en sí va como siempre. La aplicación de
  escritorio y la app web no tienen Tor: un servidor con el interruptor activado no recibe nada desde allí. Las piezas
  de copia que das a amigos ([Piezas de copias con amigos](#backup-pieces)) no llevan el interruptor.
- **Chats que siguieron después de la copia:** restaurar devuelve las claves de cada conversación como estaban
  entonces. Los mensajes que llegaron después de la copia y ya se leyeron no están en ella. Una conversación que
  siguió después de la copia dejaría de abrir mensajes nuevos, así que cada chat restaurado, el del espacio y el de
  cada lugar oculto al abrirse, empieza solo y sin ruido una conversación nueva con cada contacto, desde las claves
  más nuevas que este le dio, y su {=Erevos} sigue en ella. Con un contacto cuyo {=Erevos} es más antiguo, pídele su enlace
  de contacto otra vez. Antes de que un chat
  restaurado vuelva a escribir, sus conversaciones saltan por delante de las claves que puedan haber usado desde la
  copia, para que ninguna clave selle nunca dos mensajes: uno sellado dos veces dejaría a quien guardara los dos
  paquetes leerlos juntos. En un grupo, un miembro restaurado pide al Erevos del administrador que lo vuelva a meter,
  lo que funciona mientras el grupo solo ha avanzado un poco; si no, pide que te añadan de nuevo.
- [+] **Matrix, XMPP y Nostr:** las cuentas de cada espacio y de sus chats ocultos están en la copia. Una clave de
  **Nostr** vuelve con sus chats, como estaban. Una cuenta de **XMPP** vuelve con su sesión, sus contactos, sus chats y
  las claves que conoce de otras personas, y sigue como un dispositivo nuevo de la cuenta: conserva su clave de
  identidad, así que las apps de tus contactos siguen conociendo su clave, pero toma un identificador de dispositivo, un
  recurso y unas claves nuevos, cada conversación empieza de nuevo, y el dispositivo antiguo sale de las listas de
  dispositivos de la cuenta cuando se conecta. No puede leer los mensajes cifrados para el dispositivo antiguo después
  de la copia. Una cuenta de **Matrix** se suelta en este teléfono, sin cerrar su sesión en el servidor, lo que acabaría
  con el dispositivo del teléfono de donde vino la copia; el espacio inicia sesión de nuevo, como un dispositivo nuevo,
  y su clave de seguridad abre los mensajes de antes. Puestas como estaban, las conversaciones de un dispositivo así
  volverían a usar claves de mensaje que los demás rechazan, y el teléfono de donde vino la copia puede seguir usando el
  dispositivo.
- **Chats cerrados:** una copia guarda también lo que necesitan **Sonar las llamadas cuando están cerrados** y
  **Avisar cuando llega un mensaje** de los chats ocultos, y **También mientras otro espacio está abierto**. Así, tras
  restaurarla, también en otro teléfono, siguen como estaban. Una copia de antes de esta versión no tiene nada de eso:
  restaurarla los deja como los tiene el teléfono.
- **Ajustes:** una copia guarda los ajustes que son tuyos y no del teléfono: el idioma,{~ los módulos,} la vibración, los
  avisos en segundo plano y el número en el icono, el ahorro de batería, la privacidad de la pantalla, la calidad de
  las fotos, si el Teléfono se abre sin la contraseña, y cómo llega Erevos a los teléfonos cercanos (llevando sus
  mensajes, la misma Wi-Fi, Wi-Fi Direct, Wi-Fi Aware y una radio LoRa, que solo vuelve a encenderse donde este teléfono
  la conoce). En Android guarda también las respuestas rápidas del Teléfono y las llamadas que rechaza, las de un grupo
  de contactos solo donde este teléfono tiene un grupo con ese nombre en la misma cuenta. Las copias automáticas y su
  servidor vuelven con su contraseña, pero no con su carpeta, en la que Android solo deja escribir al teléfono en el
  que se eligió: en otro teléfono, **Copias de seguridad** dice que elijas una, y hasta entonces solo van al servidor.
- **Un teléfono a la vez:** una copia restaurada en un segundo teléfono lee las mismas colas del relay que el primero,
  y cada uno recoge mensajes que entonces el otro nunca recibe. Úsala para pasar a un teléfono nuevo, no para tener dos.
- **El teléfono anterior se perdió:** un teléfono que se perdió o te robaron y sigue encendido sigue leyendo las colas
  del relay que conocía, así que los mensajes enviados allí pueden llegarle a él y nunca al teléfono nuevo. Tras
  restaurar la copia en el teléfono nuevo, toca **El teléfono anterior se perdió** en **Copias de seguridad** (tras
  restaurar una copia de otro teléfono, Erevos lo señala) y di **Cambiar las colas**. Cada espacio y sus chats ocultos
  pasan entonces a colas nuevas del relay, cada uno la próxima vez que se abre aquí, y tus contactos y grupos reciben
  el aviso sin ruido. Las colas antiguas se leen aquí hasta que cada contacto escribe en las nuevas, 14 días como
  máximo, y los enlaces de contacto y los códigos QR que diste antes sirven 14 días, y luego ya no. Lo que llega por
  Nostr{+, XMPP o Matrix} sigue llegando al teléfono anterior. Tras otra restauración, tócalo de nuevo.
- **Discreción:** todos los espacios muestran la misma pantalla de Copias de seguridad, y una copia contiene todos los
  espacios, así que ninguna de las dos dice cuántos espacios hay ni si hay chats ocultos configurados. Los nombres de
  los archivos dicen que son una copia de seguridad de Erevos, y su número y tamaño muestran más o menos cuánto se guarda.
- [~] **Los SMS del teléfono:** en Android, **Incluir los SMS en las copias** añade los SMS y MMS del teléfono a cada copia
  a partir de entonces, con hasta 32 MB de sus imágenes, mientras Erevos es la app de SMS. Se sellan con la contraseña
  de la copia como el resto. Restaurar la copia devuelve a los SMS del teléfono cada mensaje que aún no tiene, y no
  elimina ninguno; Erevos también tiene que ser la app de SMS entonces, o el resto se restaura sin ellos. Los SMS son
  del teléfono, los mismos en todos los espacios. Un Erevos más antiguo no abre una copia que contenga SMS.
- [~] **Las llamadas del teléfono:** en Android, **Incluir las llamadas en las copias**, en **Las llamadas del teléfono**,
  añade a cada copia, a partir de entonces, el historial de llamadas del teléfono (sus 10.000 llamadas más recientes,
  sin el buzón de voz) y la propia lista de números bloqueados de Android, mientras Android deja a Erevos leer el
  historial de llamadas; los números bloqueados, solo mientras Erevos es la app de Teléfono o SMS. Está desactivado
  hasta que lo actives, y la elección va en las copias. Se sellan con la contraseña de la copia como el resto.
  Restaurar la copia añade al teléfono cada llamada y cada número bloqueado que aún no tiene, y no borra ninguno;
  Erevos tiene que ser entonces la app de Teléfono (**Ajustes** → **Teléfono y SMS** → **Teléfono**), o el resto se
  restaura sin ellos. Android guarda más o menos las 500 llamadas más recientes de cada SIM, así que las más antiguas
  restauradas pueden irse a medida que llegan llamadas nuevas. Un Erevos más antiguo no abre una copia que contenga
  llamadas.
- [~] **Los SMS en orden:** las conversaciones fijadas, las archivadas, la Papelera, los borradores, el filtro y las marcas
  de spam de cada espacio, cuánto espera un SMS para poder deshacer su envío, los SMS que se envían más tarde (**SMS
  más tarde**), las invitaciones, los nombres de tus contactos, si los mensajes a contactos de Erevos pueden ir por SMS,
  y la SIM elegida para cada número están en todas las copias, sellados con la contraseña del espacio como el resto. La SIM elegida solo vuelve en el mismo teléfono, ya que cada teléfono da a sus SIM identificadores propios: en otro, los SMS y las llamadas van por su SIM predeterminada hasta que elijas una allí.
  Un SMS para más tarde cuya hora llegó antes de la restauración no sale solo, ya que el teléfono del que vino la copia
  puede haberlo enviado: aparece como no enviado, y un toque en él lo envía o lo borra. Uno cuya hora aún no ha llegado
  sale a su hora. Un Erevos más antiguo no abre una copia que los contenga; una hecha por un {=Erevos} más antiguo se
  restaura como siempre, sin ellos.
- **Lo que nunca vuelve:** lo que pertenece al propio teléfono no viene con ninguna copia, así que una restauración en
  otro teléfono no puede traerlo: la huella o la cara, cuya clave Android guarda en el chip de ese teléfono; las
  carpetas en las que Erevos puede escribir, como la de las copias automáticas, en las que Android solo lo deja entrar
  en el teléfono en que se eligieron; lo que Android permite hacer a Erevos{~ y qué apps hacen las llamadas y envían los
  SMS}, que solo tú puedes permitir en cada teléfono, por eso tras restaurar en Android se abre **Permisos**{~ para los
  módulos activados}; {~el historial de llamadas y la propia lista de números bloqueados de Android, salvo que **Incluir
  las llamadas en las copias** estuviera activado, como arriba; |}y el contador de contraseñas incorrectas.{+ Una cuenta XMPP vuelve como un dispositivo nuevo de sí
  misma y Matrix vuelve a iniciar sesión, como arriba, y los}{- Los} dispositivos vinculados se vuelven a vincular, como
  abajo.
- **Dispositivos vinculados:** un vínculo se queda con el teléfono y el ordenador en los que se hizo, y ninguna copia
  lo guarda, pero una copia guarda lo que permite al teléfono en que se restaura pedir a cada uno de ellos que se
  vincule de nuevo. Después de restaurar una copia en otro teléfono, abre allí **Ajustes** → **Datos y dispositivos**
  → **Dispositivos vinculados**: en **De la copia de seguridad**, toca **Pedir que vuelva a vincularse** para cada
  dispositivo que sigue siendo tuyo, o **Olvidar** para uno que ya no lo es. El dispositivo, que tiene que estar
  encendido, muestra la petición: toca ahí **Volver a vincular** solo si restauraste tú la copia, y si no **Ahora
  no**. Entonces se vincula al teléfono nuevo sin código que escanear, conserva sus chats y recibe lo que llegó desde
  entonces; los mensajes que llegaron al teléfono anterior después de la copia se quedan solo en él. Una vez vinculado
  de nuevo, ni el teléfono anterior ni nadie con la misma copia llega a él. Una petición vale 14 días, y los
  dispositivos de un lugar oculto se piden desde dentro de ese lugar. Un dispositivo con un {=Erevos} más antiguo no
  muestra la petición: toca en él **Desvincular este dispositivo**, y luego vincúlalo como la primera vez, ver
  [Dispositivos vinculados](#devices). Los contactos con esta versión dejan de escribir a tus ordenadores hasta que se
  vinculen de nuevo: el teléfono les da una
  nueva lista de sus dispositivos que no nombra ninguno. Si el reloj de este teléfono va por detrás del del teléfono
  perdido, esa lista desaparece en cuanto le escriben, y los detalles de su chat pueden decir que cambió el día después
  de que restauraras. La propia copia de un ordenador vinculado contiene los chats del teléfono como estaban, pero
  no el vínculo para escribir en ellos: restaurados, se pueden leer ahí pero no escribir, y Erevos lo dice una vez.
  Para escribir en ellos, vuelve a vincular ese ordenador al teléfono: los chats que el teléfono todavía tiene se
  quedan, con lo que llegó desde entonces, y los demás desaparecen. En el teléfono, desvincula el dispositivo que era
  antes. Haz las copias en el teléfono.
- **Versiones:** una copia se abre solo en un Erevos tan nuevo como el que la hizo, o más. Una hecha por un {=Erevos} más
  nuevo se rechaza, sin cambiar nada: actualiza primero Erevos a la última versión. Un Erevos anterior a la 6.0.0 dice
  de una copia de la 6.0.0 en adelante que no es una copia de seguridad de Erevos: actualízalo también.

## Piezas de copias con amigos {#backup-pieces}

La contraseña de tus copias de seguridad puede ir a amigos en piezas, en **Ajustes** → **Datos y dispositivos** →
**Piezas de copias**: elige **2 de 3**, **2 de 4**, **3 de 4** o **3 de 5**, luego otros tantos contactos, y toca
**Dar las piezas**. Con las copias automáticas activadas, Erevos comprueba que la contraseña que escribes es la suya.
Con un servidor en **También a un servidor**, las piezas pueden guardar también su dirección, usuario y contraseña,
para que con ellas se puedan encontrar y abrir las copias que hay allí. Cada contacto recibe un mensaje que dice qué
es, y su {=Erevos} guarda la pieza aparte del chat, en **Piezas que guardas para amigos**.

1. **Para recuperarla:** pide sus piezas a suficientes de ellos. Cada uno toca **Mostrar el código** junto a la tuya,
   y tú tocas **Escanear un código** en **Juntar tus piezas**; o tocan **Copiar** y te mandan el texto por otra vía, y
   tú lo pegas y tocas **Añadir**; o, mientras tu teléfono aún tenga la cuenta, tocan **Devolverla en vuestro chat**.
   Luego toca **Juntar**: Erevos muestra la contraseña y, con un servidor en las piezas, **Restaurar desde ese
   servidor** lista las copias de allí.
2. **Una contraseña nueva:** en cuanto tus copias tienen una contraseña nueva, las piezas dadas antes ya no sirven: da
   otras nuevas.

- **Qué muestra una pieza:** nada. Menos piezas de las necesarias no dicen nada de la contraseña, por mucha potencia
  de cálculo que se use: con ellas, cualquier contraseña es tan probable como otra. Todas las piezas tienen el mismo
  tamaño, sea cual sea la contraseña, y nada en ellas te nombra ni a ti ni a los demás amigos.
- **En tu teléfono:** el mensaje se queda en el chat, pero su pieza no: una vez enviada, nada en tu teléfono guarda
  las piezas, solo a quién fueron. Quien abra uno de tus espacios sabe a quién diste piezas, no la contraseña. Las
  piezas van solo a contactos del espacio, no a chats ocultos.
- **Lo que no puede impedir:** suficientes amigos juntos pueden abrir tus copias si también consiguen el archivo:
  elige personas que no se conozcan todas entre sí. Alguien puede hacerse pasar por ti, desde un número o una cuenta
  nuevos, para conseguir las piezas: un amigo debería devolver una solo a ti en persona, o en el chat que ya tiene
  contigo. Un amigo con un {=Erevos} anterior a esta versión ve el mensaje pero no guarda ninguna pieza.

**Por qué:** una copia de seguridad es tan segura como su contraseña, y una contraseña fuerte se pierde con facilidad.
Repartida así (el reparto de secretos de Shamir), ningún amigo por sí solo, ni ningún relay, tiene nada que la abra.

## Pasar a un teléfono nuevo {#new-phone}

Todo lo que guarda Erevos pasa a un teléfono nuevo en una sola copia de seguridad: cada espacio con sus chats ocultos,
contactos, mensajes, fotos{~, archivos y Colección| y archivos}, sus cuentas y relays, el bloqueo, la contraseña de pánico y tus
ajustes. Ningún servidor guarda una copia por ti, así que nada pasa solo: lo lleva la copia, sellada con su contraseña.

1. **En el teléfono nuevo, instala {=Erevos}:** la misma versión que en el viejo, o una más nueva, porque un {=Erevos} más
   antiguo rechaza una copia hecha por uno más nuevo. Sin internet, el teléfono viejo puede dártelo, mira
   [Erevos a un teléfono cercano](#give-app).
2. [~] **En el teléfono viejo, prepáralo:** para que pasen también los SMS del teléfono, activa **Incluir los SMS en las
   copias** en **Copias de seguridad**, y para su historial de llamadas **Incluir las llamadas en las copias**. Una Colección que no está en las copias se queda atrás: vuelve a incluirla, o
   dale un servidor WebDAV, mira [Colección](#collection).{+ Ten a mano tu clave de seguridad de Matrix, porque Matrix
   inicia sesión de nuevo en el teléfono nuevo.}
3. **En el teléfono viejo, haz la copia:** en **Ajustes** → **Datos y dispositivos** → **Copias de seguridad**, toca
   **Hacer una copia de seguridad**, o **Hacer copia ahora** si usas copias automáticas. Hazla la última, justo antes
   de mudarte, y desde entonces no abras Erevos en el teléfono viejo: lo que llegue después espera en los relays al
   nuevo.
4. **Pásala:** copia la copia y todos los archivos cuyo nombre empieza como el suyo, todos en una carpeta, al teléfono
   nuevo, con un cable, una tarjeta de memoria o una app en la nube. Una copia en tu servidor no hay que copiarla.
5. **En el teléfono nuevo, restaura:** en el primer inicio, toca **Ya tengo {=Erevos} en otro teléfono** (o pasa por el
   primer inicio).{~ En Android, para los SMS, deja que Erevos sea también allí la app de SMS.} Luego, en **Ajustes** →
   **Datos y dispositivos** → **Copias de seguridad**, toca **Restaurar una copia de seguridad** y elige el archivo, o
   **Restaurar desde un servidor** y da la dirección, el nombre de usuario y la contraseña del servidor; escribe la
   contraseña de la copia y di que sí. Erevos se abre como estaba el teléfono viejo, con las mismas contraseñas.
6. **En el teléfono nuevo, vuelve a poner lo que es del teléfono:** **Permisos** se abre para lo que Android debe
   permitir. Luego activa de nuevo la huella o el rostro (mira [Bloqueo con contraseña](#lock)), elige otra vez la
   carpeta de las copias automáticas en **Copias de seguridad**, y la SIM de cada número{+, e inicia sesión en Matrix con
   su clave de seguridad}.
7. **En el teléfono viejo, borra Erevos:** cuando el teléfono nuevo muestre tus chats y los mensajes nuevos lleguen
   allí, toca **Borrarlo todo ahora** en **Ajustes** → **Privacidad y seguridad** → **Botón de pánico**. No **Borrarme
   de todas partes**: eso borra las colas de los relays que lee el teléfono nuevo.

- **Un teléfono a la vez:** los dos teléfonos leen las mismas colas de los relays, y un mensaje va a quien lo recoge
  primero, así que el otro nunca lo recibe. Deja el viejo cerrado desde la copia y bórralo al final.
- **Tus contactos:** cada espacio conserva su relay, su token y su relay de casa, así que no hay nada que escribir de
  nuevo ni invitación que pedir. Tus contactos te escriben como antes.
- **Chats ocultos:** cada lugar oculto viene con la copia, cada uno con su PIN, y nada en el teléfono nuevo dice que
  haya alguno, mira [Chats ocultos](#hidden).
- [+] **Matrix, XMPP y Nostr:** una clave de Nostr sigue como era, una cuenta de XMPP como un dispositivo nuevo de sí
  misma, y Matrix inicia sesión de nuevo como dispositivo nuevo, con su clave de seguridad abriendo los mensajes de
  antes, mira [Copias de seguridad](#backup).
- **Dispositivos vinculados:** en el teléfono nuevo, en **Ajustes** → **Datos y dispositivos** → **Dispositivos
  vinculados**, toca **Pedir que vuelva a vincularse** para cada ordenador o navegador que siga siendo tuyo, y luego
  **Volver a vincular** en él: conserva sus chats, sin código que escanear. Los dispositivos de un lugar oculto, desde
  dentro de ese lugar. Un dispositivo con un {=Erevos} más antiguo: toca en él **Desvincular este dispositivo** y
  vincúlalo al teléfono nuevo como la primera vez. Mira [Copias de seguridad](#backup).
- [~] **La Colección:** viene en los archivos de la copia. Una que no está en las copias viene solo de su servidor WebDAV,
  cada archivo al abrirlo; una sin ninguna de las dos se queda en el teléfono viejo, y el borrado la elimina.
- **{~Módulos y ajustes:** los módulos activados, el|Ajustes:** el} idioma y tus otros ajustes vienen con la copia. Lo que Android
  guarda para cada teléfono se queda allí, como lo que permite a Erevos{~; el historial de llamadas y sus números
  bloqueados vienen también con **Incluir las llamadas en las copias** activado}.
- **Falta un archivo:** si falta un archivo de la copia o está dañado, Erevos dice cuál y no cambia nada, a menos que
  elijas restaurar el resto sin él.
- **Si el teléfono viejo se pierde:** restaura tu copia más reciente en el teléfono nuevo cuanto antes, también desde
  tu servidor, y luego toca **El teléfono anterior se perdió** en **Copias de seguridad**, para que no lea nada más
  tuyo en los relays. Si perdiste la contraseña de la copia, los amigos que guardan sus piezas pueden devolvértela, mira
  [Piezas de copias con amigos](#backup-pieces).

**Por qué:** Erevos no guarda nada tuyo en un servidor que pudiera devolverlo, así que ninguna cuenta lleva tus chats a
un teléfono nuevo. Una copia, sellada con su contraseña, lo lleva todo, y solo tú puedes abrirla.

## Botón de pánico {#panic}

Cuando estás en peligro, Erevos puede borrarse al instante, en **Ajustes** → **Privacidad y seguridad** → **Botón de
pánico**: toca **Borrarlo todo ahora** y di **Borrar**. En Android, en la app web, en un ordenador y en Sailfish OS.

Para encontrarlo rápido en una emergencia, también es el primero, en rojo, en el menú **⋯** de la pantalla de inicio, y
mantener pulsado el candado de arriba de la pantalla de inicio lo abre al instante. Un toque en el candado sigue
bloqueando; solo mantenerlo pulsado abre el botón de pánico, y allí **Borrarlo todo ahora** vuelve a preguntar una vez.

- **Qué se borra:** cada espacio con sus chats ocultos, con sus contactos, mensajes, fotos, archivos y claves; el
  bloqueo y sus contraseñas; {+las cuentas de Matrix, XMPP y Nostr y }los tokens del relay; los ajustes y la contraseña de
  las copias automáticas, y de su servidor. En Android, Erevos se cierra después y la próxima vez se abre como recién
  instalado. Con **También las copias automáticas de** elegido, primero se borran los archivos de copia de allí.
- **Qué se queda:** lo que Erevos no alcanza: copias que copiaste a otro sitio o enviaste a un servidor (su contraseña
  las sigue protegiendo), lo que el relay guarda para ti hasta que caduca, y lo que tienen tus contactos.

1. **Desde una app de pánico:** en Android, una app de pánico como Ripple borra las apps que elijas con un solo gesto.
   Instala una y elige Erevos en ella: Erevos abre esta pantalla, tras su contraseña, y pregunta. Toca **Decir que
   sí**.
2. **Solo esa app:** solo la app a la que dijiste que sí puede borrar Erevos, y solo mientras **Una app de pánico puede
   borrar Erevos** esté activado. Erevos comprueba el nombre de la app y su firma: otra app, o el mismo nombre instalado
   de nuevo por otra persona, no puede. Una actualización de la app que pasa a una clave nueva, de la forma que Android
   permite (rotación de claves), sigue siendo de confianza. **Dejar de confiar** lo termina.
4. **Cuando Erevos se negó:** si la app de confianza pidió borrar con el interruptor apagado, o firmada con otra clave,
   esta pantalla lo dice en rojo, con el día y la hora. Cuando la app está firmada con otra clave, **Confiar en … tal
   como está ahora** vuelve a confiar en ella: di que sí solo si la actualizaste tú.
3. **Después de borrar:** la app de pánico también se olvida: vuelve a decirle que sí cuando configures Erevos de
   nuevo.

- **En un ordenador y en Sailfish OS:** no hay app de pánico, solo **Borrarlo todo ahora**, con **También las copias
  automáticas de** su carpeta si lo eliges. En un ordenador, Erevos vuelve a abrirse después como recién instalado; en
  Sailfish OS se cierra. El elemento del llavero para Erevos se queda en un ordenador, pero lo que sellaba ya no existe,
  así que no abre nada.
- **Lo que no puede ocultar:** en el teléfono, sin la contraseña, aún se ve que Erevos está instalado y que una app de
  pánico puede borrarlo, pero no lo que contenía.
- **Avisar a otras apps (Android):** en **Avisar a otras apps** eliges las apps que Erevos avisa al borrar, como una
  app de pánico, desde el botón, la contraseña de pánico o una app de pánico. Cada una te pregunta primero si Erevos
  puede. Fasouli entonces se bloquea: se cierra y pide su bloqueo de nuevo al abrirse.

**Por qué:** en una frontera o en una detención puede no haber tiempo para abrir cada chat. Un toque, o el gesto de una
app de pánico, no deja nada que abrir.

### Contraseña de pánico

Con el bloqueo con contraseña activado, la misma pantalla ofrece una **Contraseña de pánico**: una contraseña propia
que, escrita en la pantalla de bloqueo, borra Erevos como lo hace **Borrarlo todo ahora**. En Android, en la app web,
en un ordenador y en Sailfish OS.

1. Toca **Poner la contraseña de pánico**, escríbela dos veces (al menos 4 caracteres) y toca **Guardar**. Debe ser
   distinta de todas las contraseñas de tus espacios: Erevos rechaza una que abra un espacio, y la contraseña de
   ningún espacio podrá convertirse en ella más tarde.
2. Escrita en la pantalla de bloqueo, muestra **Contraseña incorrecta**, como cualquier incorrecta, y Erevos lo borra
   todo al instante. En Android, Erevos se cierra después y la próxima vez se abre como recién instalado, y las copias
   automáticas de su carpeta también se borran cuando está activado **También las copias automáticas de** en **Desde
   una app de pánico**; en otras partes se quedan.
3. **Desactivar la contraseña de pánico** hace que vuelva a ser solo una contraseña incorrecta. Si la pones de nuevo,
   sustituye a la anterior. Al desactivar el bloqueo con contraseña, también se desactiva.

- **Nada la delata:** Erevos guarda un sitio para una contraseña de pánico desde su primer inicio, aleatorio hasta que
  se pone una y con la misma forma después, y lo comprueba con cada contraseña escrita en la pantalla de bloqueo, de
  la misma manera y durante el mismo tiempo. Así que ni lo que guarda el teléfono ni lo que tarda una comprobación
  muestran si hay una puesta, y esta pantalla tampoco puede decírtelo: si no estás seguro, ponla de nuevo.
- **Solo en la pantalla de bloqueo:** escrita en cualquier otro sitio donde Erevos pide una contraseña, es solo una
  contraseña incorrecta. Las copias de seguridad la conservan como estaba cuando se hicieron. Mientras los intentos
  fallidos hacen esperar a la pantalla de bloqueo (ver [Bloqueo con contraseña](#lock)), ella también espera.

**Por qué:** alguien puede obligarte a abrir Erevos. Con una contraseña de pánico puedes parecer darle la tuya, y lo
que vería ya no está antes de que cambie la pantalla.

## Borrarme de todas partes {#forget}

Cuando quieras que desaparezca lo que los servidores guardan de ti, en **Ajustes** → **Privacidad y seguridad** → **Borrarme de
todas partes**: toca **Borrarme de todas partes** y di que sí dos veces. Tu teléfono conserva todo lo que tiene; esto no es el
[Botón de pánico](#panic), que borra el teléfono.

- **Qué desaparece:** cada cola que este espacio tiene en los relés, con los mensajes que esperan en ella: la tuya, la que nombra
  tu enlace de contacto, las de tus grupos, las de tus contactos, la de tu relé de casa, {+las de los avisos de Matrix y XMPP, }las
  puertas de tus grupos públicos y las de tus dispositivos vinculados. También los mensajes que un relé guarda para enviarlos más
  tarde, los archivos que llegaron y esperan en él, y las invitaciones que hiciste y nadie usó. Los chats ocultos que reciben aun
  cerrados se van con el espacio; los demás, cuando los abras con el espacio detenido. Las listas de la pantalla dejan fuera los
  chats ocultos, para no mostrar nunca que los hay. Erevos también pide a cada relé de Nostr que olvide las claves en
  las que leen tus chats (una petición de desaparecer, NIP-62): por Tor si Tor está activado, directo si está desactivado.
  Con Tor activado pero aún no listo, no se pregunta a Nostr; espera a que lo esté y borra otra vez.
- [+] **Matrix, XMPP, Nostr:** con **También cerrar sesión en Matrix y XMPP y borrar la cuenta de Nostr creada aquí**, esas cuentas
  se cierran aquí. Las cuentas siguen en sus servidores, que son suyos, no de Erevos. Una cuenta de Nostr que trajiste de otra
  aplicación se deja como está.
- **El espacio se detiene:** no recibe ni envía nada, para que no se vuelva a crear enseguida ninguna cola (Erevos rehace por sí
  solo una cola perdida). **Iniciar de nuevo** lo termina: se crean colas nuevas, como cuando un relé las perdió, y tus contactos
  reciben aviso en silencio. Dales también un enlace de contacto nuevo, porque los viejos nombran colas que ya no existen.
- **Lo que no alcanza:** los teléfonos de tus contactos, los relés de Nostr que no hacen lo pedido{- y}{+,} los archivos que enviaste por
  un servidor de archivos{+ y los servidores de Matrix y XMPP}. La pantalla enumera lo borrado, lo que ya no estaba y lo que no se
  pudo alcanzar; **Borrar otra vez** intenta el resto.

**Por qué:** un relé, aunque confíes en él, es un lugar que guarda algo de ti. Este es el único toque que lo recupera todo sin
borrar el teléfono, para cuando dejas un relé o cierras un capítulo de tu vida.

## Chats importados {#import}

Tus chats antiguos de Telegram y WhatsApp pueden entrar en Erevos, para leerlos, con sus fotos, vídeos, mensajes de voz
y archivos, y los de Viber con sus palabras. Se quedan en este teléfono, sellados en el espacio al que los traes, y no
van a nadie, salvo que compartas uno con la persona con la que fue (abajo).

Primero exporta el chat desde la otra app:

- **WhatsApp:** abre el chat, luego **Más**, **Exportar chat**, **Incluir archivos**, y guarda el .zip en el teléfono.
  **Sin archivos** trae solo las palabras.
- **Telegram Desktop:** **Exportar historial del chat**, formato **JSON**, con las fotos, vídeos, mensajes de voz y
  archivos que quieras. Luego haz un .zip de la carpeta que creó (en Windows: clic derecho sobre ella, **Enviar a**,
  **Carpeta comprimida (en zip)**) y copia el .zip al teléfono. **result.json** por sí solo trae únicamente las palabras.
- **Viber:** Viber en sí no exporta chats. En Android, la app **Backup Text for Viber** guarda uno como archivo .html:
  cópialo al teléfono. Solo entran las palabras, con los emoticonos de Viber como emoji. Tus propios mensajes ahí no
  llevan nombre, así que entran como **Yo**, ya elegido como tú. Los mensajes de un día anterior a que existiera Viber,
  como 1970, son de un teléfono cuyo reloj estaba mal: entran sin hora.

Luego:

1. En Erevos, abre **Ajustes** → **Datos y dispositivos** → **Chats importados** y toca **Importar un archivo**, y luego
   elige el archivo.
2. Erevos dice lo que encontró, con cuántas fotos y archivos y lo que ocupan en total. Toca tu propio nombre, para que
   tus mensajes aparezcan a la derecha, y toca **Guardar**. Los archivos entran uno tras otro, y dice cuántos y qué
   parte de ellos han entrado. **Cancelar** lo detiene entonces, y no se queda con ninguno.
3. Elimina tú mismo el archivo exportado del teléfono: Erevos guarda su propia copia sellada, pero el archivo que
   guardaste no está sellado.

Para seguir la conversación en Erevos, la otra persona también necesita Erevos:

1. Con **Chat nuevo**, añádela como contacto a través del relay, como en [Chatear a través de un relay](#relay).
2. Abre el chat importado, toca **Continuar en Erevos** y elígela.
3. Su chat muestra ahora los mensajes antiguos antes de los nuevos, como si siempre hubieran estado en Erevos: en
   burbujas, por día, con sus horas, y **Continúa en Erevos** entre ellos y los nuevos. **Abrir el chat** te lleva ahí,
   y un contacto al que no has puesto nombre toma el nombre del chat importado.

**Desde dentro del chat:** el chat de un contacto tiene **Chats importados** en sus **Detalles**, encima de
**Privacidad**. **Importar un chat aquí** trae un archivo directamente a ese chat, sin pasar por **Ajustes**: cuando el
archivo contiene varios chats, como una exportación de Telegram de todos ellos, pregunta cuál sigue aquí, y propone el
más largo. Cada chat importado que sigue ahí aparece con tres botones:

- **Solo en el chat** lo quita de **Ajustes** → **Datos y dispositivos** → **Chats importados**: solo aparece en ese
  chat, como si siempre hubiera estado ahí. Un chat traído desde los detalles del chat se guarda así desde el principio.
  **Mostrar también en Chats importados** lo devuelve a la lista, y lo mismo hace la propia lista, cuando ese contacto
  ya no está.
- **Desvincular** hace que deje de aparecer en el chat; se queda en **Chats importados**, para leerlo o para seguirlo
  con otra persona.
- **Eliminar** lo elimina del teléfono, con sus fotos y archivos, después de preguntar.

**Por qué:** un chat antiguo pertenece a la persona con la que fue, así que se trae, se guarda y se elimina donde hablas
con ella, y la lista de **Ajustes** solo guarda lo que no tiene otro sitio. Nada de él sale del teléfono, salvo que lo
compartas.

- **Las fotos, los vídeos, los mensajes de voz y los archivos** entran desde un .zip, cada uno sellado en este espacio
  como lo está un archivo en un chat. Las fotos aparecen en el chat al desplazarte hasta ellas, y los stickers como
  stickers; toca una foto o un archivo para verlo por separado y guardarlo (**Guardar**). Los mensajes de voz y las
  canciones se reproducen en el propio chat con un toque; un vídeo se reproduce en la app propia del teléfono una vez
  guardado. Mantén pulsado un mensaje importado para copiarlo (**Copiar**) o abrir su archivo (**Abrir**). **Buscar en
  este chat** también encuentra los mensajes importados. Los archivos de más de 4 GB, y los que la exportación no
  contiene, se quedan fuera, y el chat dice dónde había uno.
- **Espacio en el teléfono:** mientras entra un .zip, el teléfono necesita libre más o menos el doble de su tamaño, ya
  que Erevos lee una copia y guarda los archivos sellados. Los archivos importados también están en las copias de
  seguridad, como los demás archivos.
- **Solo para leer:** los mensajes importados no se envían como mensajes, así que el otro teléfono los tiene solo si
  compartes el chat con él. Erevos no puede mostrar quién los escribió realmente.
- **Los avisos y las llamadas** de la otra app se omiten, y el chat dice cuántos.
- **En los chats ocultos** también: en los **Detalles** de un chat oculto, **Importar un chat aquí** guarda el chat con
  ese lugar, cifrado con su clave, y solo lo muestra en ese chat, nunca en **Ajustes** → **Datos y dispositivos** →
  **Chats importados**; ahí solo se puede eliminar. Un chat movido a los chats ocultos se lleva los chats importados en
  él, guardados solo en él ahí, y los devuelve si vuelve.
- **Eliminar mensajes** en un chat deja los importados: elimínalos en los **Detalles** del chat, en **Chats
  importados**, o en **Ajustes** → **Datos y dispositivos** → **Chats importados**.

**Compártelo con esa persona:** la persona con la que continúa un chat importado también puede tenerlo. En los
**Detalles** de su chat, bajo **Chats importados**, toca **Compartir con** y su nombre; en **Ajustes** → **Datos y
dispositivos** → **Chats importados**, un chat que continúa con alguien tiene el mismo botón, que abre su chat. Erevos
dice cuántos mensajes y cuántos MB van, y pregunta primero. Luego todos los chats importados con esa persona van juntos,
sea cual sea su tamaño, cada mensaje con cada foto, vídeo, mensaje de voz y archivo guardado, solo a ella, cifrados de
extremo a extremo por tu relay, y el chat dice que lo compartiste.

- **Por su lado** no hay nada que hacer: su {=Erevos} guarda los mensajes enseguida, dice en el chat quién los compartió,
  de dónde y cuántos, y los muestra antes de los nuevos, solo para leer, como un chat importado. Las fotos y los
  archivos se completan a medida que llegan, y bajo esa línea dice cuántos llegaron, **Archivos: 3 de 10**. Los lados se
  cambian: lo que escribiste aparece como tuyo, a su izquierda, y en un chat de dos lo que escribió esa persona aparece
  como suyo, a la derecha; en un grupo, cada uno conserva su nombre. Se guarda solo en vuestro chat allí, y puede
  eliminarlo en sus **Detalles**. Sus dispositivos vinculados guardan solo los mensajes.
- **Compartido de nuevo**, ocupa el lugar de la copia que tenía, así que nunca está dos veces. Un chat que alguien
  compartió contigo no se comparte más allá.
- **Solo con esa persona:** solo con un contacto de Erevos con el que continúa el chat, nunca con un grupo, y no se
  puede reenviar. En los chats ocultos funciona igual, y por su lado se queda en el lugar donde está vuestro chat,
  también en los ocultos.
- **Por rondas:** las fotos y los archivos van después de los mensajes, unas decenas de MB cada vez: cada ronda espera
  en tu relay hasta que su teléfono la recoge y la borra allí, y entonces va la siguiente. Así va un chat de cualquier
  tamaño, cada archivo de hasta 4 GB, y necesita poco del espacio del relay, que comparten otros archivos; cuando el
  relay está lleno, Erevos espera y vuelve a preguntar, un poco más tarde cada vez. Sigue siempre que los dos teléfonos
  tengan Erevos en marcha, también después de que uno estuviera apagado o sin conexión un tiempo; una ronda que no se
  recoge en 12 días se vuelve a poner en el relay antes de que caduque. Un archivo borrado de este teléfono desde
  entonces se nombra como uno que se quedó atrás.
- **Hasta dónde va** se ve bajo tu línea en el chat, **Compartiendo, 40 %**. Tócala para **Dejar de compartir**: lo que
  espera en el relay se quita, y su {=Erevos} borra lo que llegó. Si esa persona borra los chats, se detiene igual.
- **Desde un relay del que su {=Erevos} no toma por sí solo**, los chats esperan en su lado un toque en su línea; luego
  dice hasta dónde han llegado, **Recibiendo, 40%**, y tu línea dice **Compartiendo · su teléfono lo está recibiendo**. Si
  no se pudieron tomar, lo dicen los dos teléfonos y el suyo vibra dos veces: lo tocan para volver a intentarlo.
  Tomarlos de allí sin Tor muestra a ese servidor su dirección de internet, y {=Erevos} lo dice antes.
- **Un Erevos anterior** recibe en su lugar un archivo, **Chat de Telegram.json**, con los mensajes dentro como texto, y
  ninguna de las fotos ni de los archivos.

> El archivo de chats importados crece con lo que traes, así que su tamaño dice más o menos cuánto se importó, pero no a
> qué espacio.

## Apariencia {#appearance}

**Apariencia** sigue a Fasouli y al sitio de LPHL. Está en **Ajustes** → **Apariencia**, en partes que se abren
cada una por separado: **Estilo y colores** (el acabado, el cristal, el estilo, el tema, los colores y el texto sobre
zonas de color de abajo, con la **Vista previa**), **Fondo de pantalla**, **Mensajes**, y en Android **Iconos del
lanzador** y **Widget**.

| Ajuste | Opciones |
| --- | --- |
| **Acabado** | **Plano**, o **Glass** como en lphl.nekten.eu. Glass viene en dos tipos: **Paneles** (cada tarjeta, un panel de cristal sobre el fondo de pantalla) y **Un panel** (cada pantalla sobre un solo panel esmerilado). |
| **Estilo** | **Classic** (el oscuro y dorado de Erevos), **Modernist** (Inter Tight), **Nocturne** (siempre oscuro, con sus propios colores), **Neon** (LED cian y magenta que brillan, sobre una cuadrícula que corre hacia un sol poniente), **Matrix** (verde sobre negro en monoespaciada, con código que llueve detrás), **Paper** (azul de pluma estilográfica sobre crema, en una serif, sobre líneas pautadas con un margen rojo), **Aurora** (violeta sobre casi blanco, suave y redondeado, sobre charcos de luz menta, lila y melocotón), **Material You** (los colores del propio teléfono, en Android 12 y posteriores) y **Personalizado** (tu propio fondo y acento). |
| **Tema** | **Sistema**, **Claro** u **Oscuro**. Nocturne, Neon y Matrix son siempre oscuros, Paper y Aurora siempre claros, y Personalizado es claro u oscuro según su fondo. Material You lo sigue. |
| **Colores** | Los propios del estilo, una de las doce paletas de LPHL, o **Mi color**. Elegir una paleta con un estilo que tiene colores propios vuelve al estilo elegido antes. |
| **Personalizado** | Con **Personalizado** elegido: su **fondo** (ocho claros, ocho oscuros) y su **acento**. El texto y las superficies se crean a partir del fondo, y se comprueba que cada color se lea bien sobre él. |
| **Texto sobre zonas de color** | **Blanco**, **Como la paleta**, o **Mi color**. |
| **Tipo de letra** | Las letras de todo texto: **La del estilo**, **La del teléfono**, **Con serifa** (trazos pequeños en los extremos de las letras, como en los libros) o **Monoespaciada** (cada letra igual de ancha, como en una máquina de escribir). |
| **Fondo de pantalla** | Lo que hay detrás de cada pantalla: **Según el estilo** (la escena o el brillo propios del estilo), **Liso**, o un motivo dibujado suavemente en el color de acento: **Puntos**, **Cuadrícula**, **Rayas**, **Estrellas**, **Luces** (círculos suaves de luz) o **Degradado**; o **Foto**, una foto tuya, reducida, redibujada y sellada, bajo un velo para que el texto se lea (**Cambiar foto** elige otra). La pantalla de la contraseña muestra en su lugar el del estilo. |
| **Mensajes** | Cómo dibuja un chat los mensajes: burbujas de tipo **Redondeado**, de tipo **Cuadrado**, o **Línea**, sin burbuja sino una línea junto al texto, como un registro. |
| **Tamaño del texto** | Cómo de grande es el texto de los mensajes: **Pequeño**, **Normal**, **Grande** o **Más grande**. El resto de la pantalla sigue igual. |

Erevos recién instalado empieza con **Glass** (**Paneles**), **Modernist**, **Sistema**, **Mi color** en azul cielo, texto **Como la paleta**, letra **La del teléfono** y mensajes **Cuadrado**. Un aspecto elegido antes se queda como estaba.

Neon, Matrix, Paper y Aurora dibujan su propia escena detrás de cada pantalla, Personalizado mantiene el fondo que
elegiste y Material You los colores del teléfono, así que **Glass** espera mientras están elegidos. La lluvia se queda
quieta cuando el teléfono está configurado para reducir el movimiento.

La **Vista previa** muestra unos cuantos mensajes y botones con el aspecto que elegiste. Cada combinación se comprueba
para que el texto siempre se lea bien, también sobre cristal.

- **Cada espacio guarda su propio aspecto.**
- **La pantalla de la contraseña** muestra el último aspecto usado. Para ello se guarda fuera de los datos sellados: no
  dice nada de tus chats, pero quien abra el teléfono ve qué aspecto usas.
- **Material You** toma los colores que Android crea a partir de tu fondo de pantalla (Android 12 y posteriores), claros
  u oscuros según diga **Tema**, con botones redondos y tarjetas suavemente redondeadas, en la fuente propia del
  teléfono. Un fondo de pantalla nuevo también los cambia en Erevos, en cuanto se vuelve a ver. Se leen en el teléfono y
  no van a ninguna parte. En Android más antiguos y en un ordenador no se ofrece.
- **Iconos del lanzador** (Android): el color de cada uno de los iconos de Erevos entre las apps del teléfono,
  **Erevos** (rojo, abre los chats de Erevos, o el chat que dejaste abierto){~, **Teléfono** (verde, abre el teclado),
  **SMS** (azul, abre la lista de SMS)} y **Contactos** (violeta): rojo, naranja, verde, azul, violeta u oscuro. Cada toque
  abre lo que nombra su icono, también cuando Erevos mostraba otro de ellos. El color es del teléfono, no de cada
  espacio, ya que los iconos se ven antes de desbloquear Erevos. Después de un cambio, algunos lanzadores quitan el icono
  de la pantalla de inicio: vuelve a añadirlo desde la lista de apps.
- [~] **Cámara** (Android, en **Iconos del lanzador**): la cámara de Erevos con un toque. **Poner la Cámara entre las apps
  del teléfono** añade un icono propio (naranja al principio, en cualquier color), y si mantienes pulsado el icono de
  Erevos también ofrece **Cámara**, que puedes arrastrar a la pantalla de inicio. Ambos abren la cámara de la Colección,
  tras la contraseña de Erevos y la de la Colección, y lo que toma va directo a la Colección. Ninguno se muestra
  mientras la Colección está desactivada en **Módulos** o la calculadora ocupa el lugar de Erevos.
- **Puntos y números en los iconos** (Android): Android da el punto o el número de un aviso a la app, no a uno de sus
  iconos, así que en la mayoría de los lanzadores, como los de los Pixel y GrapheneOS, el de Samsung, el de Xiaomi y
  Kvaesitso, cada aviso de Erevos (un mensaje, {~un SMS, |}una llamada, un cumpleaños) aparece igual en los iconos Erevos{~,
  Teléfono, SMS y| y} Contactos; ahí Erevos no puede cambiarlo. Para dejar el punto solo en algunos avisos, desactívalo
  para los demás en los ajustes de Android para las notificaciones de Erevos, donde cada tipo de aviso tiene su propio
  interruptor. Los lanzadores de Huawei y Honor aceptan un número para cada icono: ahí, con **Ajustes** →
  **Notificaciones** → **Número en el icono** → **Mostrar el número**, el propio icono de Erevos muestra los mensajes
  que cuenta su aviso{~, el de SMS los SMS sin leer, el de Teléfono las llamadas perdidas} y el de Contactos un
  cumpleaños de hoy, cada número solo en su icono.
- **Calculadora en lugar de Erevos** (Android, en **Iconos del lanzador**): una calculadora que funciona aparece entre
  las apps del teléfono en lugar del icono de Erevos. Toca **Poner la calculadora en su lugar**, escribe dos veces un
  código de 4 a 12 dígitos y toca **Guardar**. A partir de entonces abre la calculadora, escribe el código y luego
  **=**: Erevos se abre y pide su contraseña como siempre. Cualquier otra operación es solo una operación. **Cambiar
  el código** lo cambia; **Mostrar de nuevo el icono de Erevos** devuelve el icono, con su color, y olvida el código.
  Solo se oculta el icono: la lista de apps de Android, los avisos, las apps recientes y {~los iconos de Teléfono, SMS y
  Contactos siguen mostrando|el icono de Contactos sigue mostrando} Erevos. El teléfono guarda solo un hash del código: es una puerta, no la cerradura. Una
  vez borrado Erevos, por la contraseña de pánico o por **Borrar almacenamiento** de Android, ningún código lo abre
  ya: entonces la calculadora abre Erevos, como nuevo, y el icono propio de Erevos vuelve a su lugar.

  **Por qué:** quien eche un vistazo al teléfono ve una calculadora, no un mensajero; la contraseña sigue guardando lo
  que hay dentro.
- **Widget** (Android): el orden de los {~cuatro|dos} botones del widget, de izquierda a derecha, con el widget dibujado como
  se verá. Toca ↑ o ↓ para mover un botón; **Orden inicial** los devuelve a su sitio.
- **Vibrar al tocar** (Android): una vibración breve al tocar una tecla del teclado, Enviar, Intro o un interruptor, y al abrirse un menú; nunca al desplazarte. Activada, salvo que la desactives aquí. Es del teléfono, igual en cada espacio.

## En un ordenador {#desktop}

Erevos también funciona en un ordenador, Linux, macOS o Windows, como app propia. Chatea a través de un relay, cifrado
de extremo a extremo como en el teléfono, y guarda sus contactos, mensajes y ajustes sellados de la misma manera.

1. Instálalo. En Linux: el paquete para sistemas basados en Arch (\`erevos-linux-x86_64.pacman\`, con
   \`sudo pacman -U\`) o la AppImage. En un Mac: abre la imagen de disco y arrastra Erevos a Aplicaciones. No tiene firma
   de pago de Apple, así que la primera vez permítelo en **Ajustes del Sistema → Privacidad y seguridad → Abrir
   igualmente**. En Windows 10 u 11: ejecuta \`erevos-windows-x64-setup.exe\`, que instala Erevos solo para ti, sin
   administrador, y lo pone en el menú Inicio; o deja \`erevos-windows-x64-portable.exe\` donde quieras y ejecútalo, sin
   instalar nada. Ninguno de los dos tiene firma de pago, así que la primera vez Windows dice que protegió tu PC: toca
   **Más información**, y luego **Ejecutar de todas formas**.
2. Configura el relay y añade contactos como en el teléfono, ver [Chatear a través de un relay](#relay). **Copiar mi
   enlace de contacto** copia tu enlace, para pegarlo donde deba ir.

- **Lo que solo hace el teléfono:** Bluetooth, Wi-Fi Aware y LoRa, y sus pruebas. A los contactos en la misma Wi-Fi
  llega como lo hace un teléfono, ver [Chatear con un teléfono cercano](#nearby). El resto es igual: espacios y la
  segunda contraseña, chats ocultos, mensajes de voz, chats importados y copias de seguridad.
- **Dónde guarda las cosas:** en su propia carpeta (en Linux \`~/.config/Erevos\`, en un Mac \`~/Library/Application
  Support/Erevos\`, en Windows \`%APPDATA%\\Erevos\`), sellado como en el teléfono. Su almacén de claves está sellado
  con el llavero del sistema (en un Mac, el Llavero; en Windows, la clave de tu cuenta de Windows). En un sistema Linux
  sin llavero (KWallet o GNOME Keyring), o con uno que Erevos no encuentra, Erevos se abre con una nota y no guarda
  nada: inicia el llavero, o pásale a Erevos \`--password-store=gnome-libsecret\`. Iniciado con \`--plain-secrets\`,
  guarda ahí su almacén de claves tal cual, legible por tu usuario: en ese caso pon un bloqueo con contraseña. La app
  portátil de Windows guarda sus cosas en la misma carpeta que la instalada, y desinstalarla las deja ahí.

**Por qué:** sin llavero, el almacén de claves quedaría en el disco tal cual, legible por tu usuario, así que Erevos no
guarda nada ahí salvo que lo elijas con \`--plain-secrets\`: ninguna ranura de contraseña queda ahí sin sellar por
sorpresa.

- **El cortafuegos de Windows** pregunta, la primera vez que se abre Erevos, si puede usar la red. Permítelo en las
  redes privadas, o los teléfonos y ordenadores en la misma Wi-Fi no podrán llegar a él; los relays funcionan en
  cualquier caso.
- **Los mensajes de voz** grabados en un ordenador son Opus, en un teléfono AAC. Los dos se reproducen en los dos.
- **Las fotos** vienen de los archivos del ordenador; no hay cámara. **Guardar** pregunta dónde poner una foto o un
  archivo.
- **Un ordenador y un teléfono pueden compartir una cuenta:** vincula el ordenador al teléfono, y los dos tienen los
  mismos chats y contactos, ver [Dispositivos vinculados](#devices). O una copia de seguridad lo pasa todo de uno a
  otro, ver [Copias de seguridad](#backup), y a partir de entonces usa solo uno.
- **En segundo plano:** al cerrar su ventana, Erevos sigue funcionando en la bandeja del sistema (en un Mac, en el
  Dock), salvo que lo desactives: **Ajustes** → **Notificaciones** → **En segundo plano** → **Salir al cerrar**. Sigue
  esperando en el relay: una llamada suena, con un timbre propio, y trae de vuelta la ventana, y una notificación dice
  cuántos mensajes no se han leído, nunca de quién ni qué, hasta que Erevos vuelve a verse. Lo abres desde su icono en
  la bandeja, o iniciando Erevos de nuevo, y sales desde el menú de ese icono (en un Mac, desde su menú). Donde el
  escritorio no muestra bandeja, como GNOME sin una extensión para ello, iniciar Erevos de nuevo trae de vuelta la
  ventana. Cerrado del todo, no recibe nada: los mensajes esperan en el relay, y una llamada aparece como llamada
  perdida en cuanto se abre.
- **Las llamadas** suenan mientras Erevos se ve, con un timbre propio: dos toques cortos cada 3 segundos, hasta que se
  contesta la llamada o termina.
- **Probado hasta ahora** en Linux. Las versiones de Mac y Windows se compilan y se abren en los ordenadores de GitHub,
  todavía no por una persona.

## Dispositivos vinculados {#devices}

La misma cuenta en el teléfono y en un ordenador, o en un navegador: los mismos chats, contactos y mensajes en los dos.
El teléfono sigue siendo la cuenta: solo él añade contactos, y vincula y desvincula dispositivos. Cada dispositivo
vinculado tiene claves propias, que el teléfono firma en una lista de los dispositivos de la cuenta y da a sus
contactos. Los contactos con esta versión escriben entonces también a cada dispositivo, cifrado de extremo a extremo,
así que este recibe sus mensajes con el teléfono apagado; para los que tienen versiones más antiguas, el teléfono pasa
al ordenador lo que llega, y sella para ellos lo que escribe el ordenador. Los contactos ven la misma cuenta y el mismo
número de seguridad, tengan la versión de Erevos que tengan.

**Por qué:** cada dispositivo tiene claves propias, nunca una copia de las de la cuenta: Erevos no tiene ningún
servidor que pudiera cortar un dispositivo perdido, así que un dispositivo nunca es más que una entrada en una lista que
firma el teléfono, y desvincularlo basta. La lista tiene siempre cuatro lugares, y los que no ocupa ningún dispositivo
contienen claves creadas para nada, así que los contactos no pueden saber cuántos dispositivos tienes. Y con el
teléfono como cuenta, los contactos con cualquier Erevos más antiguo te contactan como antes.

Para vincular un ordenador:

1. En el ordenador, en un espacio sin chats propios (una instalación nueva, un espacio que abre una contraseña nueva, o
   los chats de un ordenador vinculado restaurados desde su copia), abre **Ajustes** → **Datos y dispositivos** →
   **Dispositivos vinculados**. Ahí, **Vincular a mi teléfono** aparece primero y muestra al instante un código QR
   pequeño: no hay que escribir nada.
2. En el teléfono, escanea el código con la cámara: Erevos pregunta **¿Vincular … a este teléfono?** Elige qué
   parte del historial pasa (**Todos**, **El último mes**, **La última semana** o **Ninguno**), si **También fotos y
   archivos**, y toca **Vincular**. Eso es todo: el teléfono da al ordenador lo que necesita a través de Nostr, cifrado
   de extremo a extremo, el ordenador muestra al teléfono su propio código y los códigos de seguridad se comparan solos,
   así que tú no escribes ni comparas nada.
3. Si no se llega a Nostr, o el ordenador no puede usar el relay, lo dice. Toca ahí **Vincular de otra forma**: si pide
   un relay, el de LPHL ya viene rellenado, así que toca **Iniciar sesión con LPHL** para un token propio del
   ordenador, o escribe otro relay y su token. Ponle nombre al dispositivo y toca **Vincular a mi teléfono**: entonces
   muestra un código QR más grande. Escanéalo con el teléfono, o copia el código, pégalo en el teléfono en **Código del
   ordenador** y toca **Siguiente**. El teléfono muestra el nombre del ordenador y un código de cuatro grupos de cinco
   dígitos; elige como arriba y toca **Vincular**.
4. Solo así el ordenador muestra también un código: si es el del teléfono, toca **Coinciden**. Si no, toca **No
   coinciden**: puede que otra persona leyera su código QR, y no le llegó nada. Los chats ocultos se vinculan solo así,
   desde dentro, con el código completo.

Los chats llegan entonces al ordenador, y tras ellos los mensajes elegidos.

- **Los mensajes** de los contactos llegan a los dos, y cada uno los guarda una vez: uno que vuelve a llegar en 30 días
  (hasta 2000 de un mismo contacto) no se vuelve a guardar, aunque haya desaparecido o se haya eliminado ahí. Para eso
  cada uno guarda, durante 30 días, qué mensajes llegaron y qué día, no lo que decían, también una vez desaparecidos o
  eliminados, y en una copia de seguridad hecha mientras tanto; el teléfono también lo guarda para un contacto que
  vinculó un dispositivo. Lo que escribes en el ordenador va a un contacto con esta versión directamente desde él, una
  vez que haya escrito al ordenador, y a través del teléfono si no: el teléfono lo muestra como tuyo, y el contacto lo
  recibe de la cuenta. Lo que escribes en el teléfono también aparece en el ordenador. Las marcas de leído, las
  reacciones, los mensajes fijados, los votos, las eliminaciones en los dos teléfonos, los nombres, los temporizadores,
  la apariencia de los chats y las imágenes, aparecer sin conexión y aceptar solicitudes van en los dos sentidos. Una
  estrella, o una eliminación en **Este teléfono**, hecha en el teléfono también va al ordenador; hecha en el
  ordenador, se queda ahí.
- **Con el teléfono apagado**, los contactos con esta versión siguen llegando al ordenador, y el ordenador a ellos: lo
  que escriben, leen y a lo que reaccionan llega, y lo que escribes sale. Si el teléfono sigue apagado tanto tiempo que
  su cola en el relay se llena (1000 mensajes), lo que escriben y leen sigue llegando al ordenador, un mensaje de voz
  largo entero; aquello a lo que reaccionan, fijan, votan o eliminan, y sus llamadas, no pasa hasta que el teléfono se
  vuelve a encender. Para los contactos con versiones más antiguas (también añadirlos) y los grupos, **el teléfono tiene que estar encendido** y llegar al
  relay: lo que el ordenador escribe mientras tanto espera en el relay, y sale en cuanto vuelve el teléfono. A alguien nuevo cuyo enlace de contacto es de esta versión el ordenador lo añade
  también con el teléfono apagado: empieza él mismo el chat, esa persona ve tu cuenta como una solicitud, y el teléfono
  la añade también en cuanto se enciende. Dos o más
  dispositivos vinculados también se comunican directamente: con el teléfono apagado, cada uno sigue mostrando lo que
  los otros escriben, leen y a lo que reaccionan, y los cambios que hacen en los contactos; uno que se perdió el primer
  mensaje de otro recibe uno nuevo un día o más después. Un ordenador que estuvo apagado más tiempo del que el relay
  guarda los mensajes (14 días), o que se perdió el primer mensaje de un contacto para él, sigue recibiendo lo que este
  escriba después: su {=Erevos} vuelve a empezar con él un día o más después, y luego cada vez con menos frecuencia, hasta
  que responde. Después de que un contacto te elimine y te vuelva a añadir, el ordenador también vuelve a empezar con
  sus dispositivos.
- **Las fotos y los archivos** que llegan se quedan en el relay hasta que tanto el teléfono como el ordenador los han
  recogido; entonces el teléfono los elimina de ahí. Uno que el ordenador nunca recoge desaparece cuando se desvincula,
  o a los 14 días, como cualquiera que no se recoja.
- **Chat conmigo** es igual en cada dispositivo: una nota, foto, archivo o mensaje de voz escrito en uno va a los
  otros, y también un recordatorio puesto, cambiado o visto y una nota eliminada; de dos cambios en una misma nota,
  queda el más reciente. Lo escrito antes de vincular va una vez, en los dos sentidos, en cuanto los dos tienen esta
  versión. Un recordatorio se muestra en cada dispositivo a su hora, y visto en uno se va de los otros. La foto o el
  archivo de una nota va como copia en el relay, eliminada de ahí en cuanto se recoge, o, con dos dispositivos o más,
  se deja ahí hasta que caduca (14 días). Las notas de los chats ocultos van solo dentro de su propio vínculo, más
  abajo.
- **Ajustes:** el idioma, el aspecto (el estilo, los colores, el tamaño del texto) y **Última vez** son los mismos en
  todos los dispositivos del espacio: cambiados en uno, cambian también en los otros. Una foto detrás de las pantallas
  se queda en el dispositivo donde se eligió, igual que todo lo que atañe a un solo dispositivo: contraseñas, PIN y el
  código de pánico, el tiempo del bloqueo, la vibración, el relay y Tor,{~ los módulos,} el nombre del dispositivo. Un
  dispositivo que deba guardar los suyos: **Ajustes** → **Datos y dispositivos** → **Dispositivos vinculados** → **Los
  mismos ajustes en todos los dispositivos** desactivado. Activado de nuevo, toma enseguida los de los otros. Los
  chats ocultos guardan los suyos.
- **Por Tor para un chat:** el interruptor **Por Tor** en los **Detalles** de un chat de Erevos es igual en cada
  dispositivo: activado o desactivado en uno, queda así en todos. En un dispositivo sin Tor, como la aplicación web,
  ese chat no envía nada mientras esté activado. Un dispositivo con una versión anterior nunca lo desactiva en los
  demás. Ver [A través de Tor](#tor).
- **En la misma Wi-Fi:** el teléfono y un ordenador en la misma Wi-Fi o punto de acceso (con **Buscar Erevos en la misma Wi-Fi** activado) se dan lo que cambia directamente allí, también sin internet; el relay recibe igualmente su copia,
  que entonces ya no cambia nada. Solo los del espacio: los vínculos de los chats ocultos van por el relay.
- **Las llamadas** suenan en el teléfono y en el ordenador. Responde en cualquiera de los dos: el otro deja de
  sonar, y dice que se respondió en otro dispositivo. Rechazar una llamada en uno la rechaza en los dos. Con un
  contacto con esta versión, el ordenador llama y recibe llamadas por sí mismo, también con el teléfono apagado; con
  uno con una versión más antigua llama a través del teléfono, que solo tiene que seguir encendido para establecerla.
  En los dos casos la llamada en sí va directamente entre el ordenador y el contacto, cifrada entre ellos.
- **Enviar más tarde** funciona también en el ordenador. A un contacto con esta versión el ordenador lo entrega él
  mismo al relay, con una copia para cada uno de sus dispositivos, así que sale a su hora con tu teléfono apagado y
  llega a los suyos con su teléfono apagado; a uno con una versión más antigua va a través del teléfono. Cada
  dispositivo tuyo lo muestra como programado, y eliminarlo en cualquiera de ellos antes de su hora lo retira en
  todos.
- **Los grupos** también están en el ordenador, con sus mensajes, fotos, archivos y mensajes de voz. Escribe en ellos,
  responde, reacciona, vota, fija, elimina los tuyos para todos, añade y saca miembros, cambia el nombre de uno o sal de
  él, ahí como en el teléfono: el teléfono lo hace por el ordenador, como propio. Una foto o un archivo que guarda el
  teléfono va al ordenador como copia en el relay, eliminada de ahí en cuanto el ordenador la recoge. Lo que los
  miembros hacen después con un mensaje (reaccionar, votar, fijarlo, eliminarlo para todos) también aparece en el
  ordenador, igual que una estrella o una eliminación en **Este teléfono** hecha en el teléfono. Un
  mensaje que el teléfono no pudo enviar al grupo (uno cerrado mientras tanto, por ejemplo) aparece en el ordenador
  como **El teléfono no lo envió**. Crear un grupo, los grupos públicos y las llamadas de grupo se quedan en el teléfono
  por ahora.
- **Los grupos están en** el dispositivo que elijas: en el teléfono, en **Ajustes** → **Datos y dispositivos** →
  **Dispositivos vinculados** → **Los grupos están en**, elige **Este teléfono** o un ordenador vinculado. Las claves de
  los grupos se mueven entonces allí, nunca copiadas, así que los grupos funcionan allí con el teléfono apagado, y se
  pueden crear grupos nuevos allí; el teléfono y los otros dispositivos escriben en ellos a través de él, así que tiene
  que estar encendido. Los miembros no ven nada nuevo: a ti, como siempre, solo que tus mensajes de grupo llegan a otra
  cola. Para moverlos hacen falta los dos encendidos y el relay, y los grupos públicos se quedan en el teléfono (sal de
  ellos primero). Para desvincular ese ordenador, devuelve primero los grupos al teléfono. Si lo perdiste, desvincúlalo de todos modos: los
  grupos aparecen entonces como abandonados en el teléfono. Un ordenador con un {=Erevos} más antiguo no puede guardarlos.
- **Los chats ocultos y las segundas contraseñas** nunca van con el vínculo del espacio: cada uno se vincula por su
  cuenta, desde dentro. Para un lugar de chats ocultos: en el ordenador, abre ese lugar con su PIN, nuevo y vacío como
  lo deja un PIN nuevo, y dale una cola propia en el relay en **Para usuarios avanzados** allí; luego toca
  **Dispositivos vinculados** bajo su lista, y **Vincular a mi teléfono**. En el teléfono, abre el mismo lugar con su
  PIN, toca **Dispositivos vinculados** bajo su lista y escanea el código del ordenador con la cámara mientras el lugar
  sigue abierto, o pégalo allí; luego como arriba. Un código mostrado en un lugar solo vincula un lugar, y el de un
  espacio solo un espacio: si lo lee el otro, simplemente se pierde, y **Vincular a mi teléfono** empieza de nuevo en el ordenador. El lugar tiene
  entonces un vínculo propio, con claves propias y su propia lista de dispositivos, firmada por su propia cuenta, así
  que sus contactos con esta versión escriben directamente al lugar del ordenador. Sus mensajes, contactos, grupos,
  llamadas, fotos y archivos y su Chat conmigo van entre los dos lugares como los del espacio entre dispositivos
  vinculados{+, y también sus propias cuentas de Matrix, XMPP y Nostr, siempre, y de nuevo cuando cambian}. Nada de esto se ve en el espacio, en sus pantallas ni en sus dispositivos vinculados, y el
  vínculo del espacio nunca lleva nada de un lugar: lo que un lugar guarda de su vínculo va cifrado con su propia clave,
  entre valores hechos para nada para los demás lugares, en un archivo del mismo tamaño se vincule algún lugar o
  ninguno. El vínculo funciona mientras el lugar está abierto, y también cerrado si **Recibir estando cerrados** está
  activado; cerrado sin eso, nada de él se sincroniza, y lo que llega espera en el relay (14 días) hasta que se abre, en
  los dos lados. En el ordenador, los grupos nuevos y las llamadas de grupo se quedan en el teléfono, un chat no puede
  moverse al lugar ni sacarse de él (muévelo en el teléfono), y una llamada respondida allí hace callar al teléfono solo
  mientras el lugar está abierto en el teléfono. Los chats ocultos escriben a los dispositivos de un contacto con esta
  versión como tus otros chats, así que estos los reciben con el teléfono del contacto apagado, y para el contacto
  parecen los chats de un teléfono que nunca vinculó un dispositivo. Un chat movido a los chats ocultos en el teléfono
  sale del ordenador. Movido a los chats ocultos, o sacado de ellos a tus chats, un chat escribe solo al teléfono del
  contacto, como hace un {=Erevos} más antiguo, hasta que vuelve a donde se creó: a su {=Erevos} se le dice antes, para que
  sus dispositivos dejen de escribir a los tuyos, y por ello puede saber que el chat dejó de conocer los dispositivos
  vinculados: si le había dado la lista de tus dispositivos, que pasó a los chats ocultos. Un espacio que abre una
  segunda contraseña solo se vincula desde dentro, a dispositivos propios.
- **Volver a traer los mensajes**, en el teléfono, vuelve a enviar un periodo del historial, con sus reacciones,
  mensajes fijados, votos y estrellas; lo que el ordenador ya tiene no se guarda dos veces.
- [+] **Matrix, XMPP y Nostr**: todos los dispositivos vinculados las reciben, y siguen los cambios del teléfono: una cuenta cerrada allí, u otra en su lugar, se va también de los dispositivos. El ordenador
  inicia sesión en las cuentas de Matrix y XMPP de este espacio y toma la clave de sus chats de Nostr, cada una como
  un dispositivo nuevo propio: el teléfono conserva el suyo. Para un ordenador ya vinculado, toca **Enviar las
  cuentas** bajo él en el teléfono. XMPP y Nostr llegan solos. Un servidor de Matrix rara vez deja que el teléfono
  abra sesión para un dispositivo nuevo: entonces lo dice **Dispositivos vinculados** en el ordenador, y **Iniciar
  sesión en Matrix** abre allí Matrix con el ID ya escrito, para su contraseña, una sola vez. Las claves de la cuenta
  vienen del teléfono, así que no hace falta clave de seguridad ni comprobar con emojis, y los mensajes de antes se
  abren desde su copia de claves. Un ordenador que ya tiene una cuenta propia en una de ellas la conserva, y lo que no
  pudo llegar aún (por falta de conexión, por ejemplo) se vuelve a intentar cada vez que se abre. Al desvincularlo, el
  ordenador cierra sesión en las cuentas que trajo. Un lugar de chats ocultos vinculado por su cuenta pasa sus propias
  cuentas del mismo modo, desde sus propios **Dispositivos vinculados**, al mismo lugar del ordenador: nunca las del
  espacio, y las del espacio nunca van a él. Cada dispositivo inicia sesión como él mismo, nunca con una copia de las
  claves del teléfono, que se usarían dos veces y romperían el cifrado; así cualquiera de los dos puede cerrarse solo,
  desde los dispositivos de la cuenta.
- [~] **SMS**: los SMS del teléfono pueden aparecer también en los dispositivos, y responderse allí a través del teléfono,
  cuando lo activas en **Ajustes** → **Teléfono y SMS** → **SMS** → **También en mis dispositivos vinculados**, ver
  [SMS](#sms).
- **Desvincular**, en el teléfono, corta un dispositivo al instante: no le llega nada más, y no se acepta nada de lo
  que envíe. A los contactos con esta versión se les dice la próxima vez que el teléfono contacta con el relay: dejan de
  escribirle, y no aceptan nada más de él. Así se corta un ordenador perdido. Si está encendido, se le dice, y los chats
  de la cuenta salen de él. En el ordenador, **Desvincular este dispositivo** hace lo mismo desde ahí.
- **Hasta cuatro** dispositivos se vinculan a un teléfono. Una copia de seguridad no lleva los vínculos, pero después
  de restaurar una en otro teléfono, ese teléfono pide a cada dispositivo que siga siendo tuyo que se vincule de
  nuevo, con un toque en cada uno, ver [Copias de seguridad](#backup).

## En un iPhone, desde el navegador {#iphone}

Erevos no tiene app en la App Store. En un iPhone funciona como app web, añadida a la pantalla de inicio desde Safari,
sin cuenta de Apple. Chatea a través de un relay, cifrado de extremo a extremo como en el teléfono, y guarda sus
contactos, mensajes y ajustes sellados de la misma manera, en el almacenamiento de Safari para la app.

1. Abre en **Safari** la dirección del servidor de Erevos que te dieron. Erevos muestra cómo añadirlo: toca
   **Compartir** (en iOS 26, dentro de **•••**), luego **Añadir a pantalla de inicio**, y después abre Erevos desde la
   pantalla de inicio. Necesita iOS 17 o posterior.
2. En Erevos, abre **Ajustes** → **Privacidad y seguridad** → **Esta app web** y compara la huella de la clave de
   versión con la que te dieron con la dirección, carácter a carácter. Si es distinta, elimina la app y avisa a quien
   te dio la dirección.
3. Pon un bloqueo con contraseña (en Erevos, **Ajustes** → **Privacidad y seguridad** → **Bloqueo y segunda
   contraseña**). En la web es lo más importante: ver más abajo.
4. Configura el relay y añade contactos como en el teléfono, ver [Chatear a través de un relay](#relay).

**Cómo se comprueba a sí mismo.** Una app web es código que envía el servidor, así que un servidor que sea atacado, o
al que se le ordene, podría enviar código modificado. Erevos no se fía de ese código sin más:

- La primera vez que se abre, descarga su código con una lista de cada archivo y su huella, firmada con la clave de
  versión, que solo tiene la persona que hace las versiones; el servidor no la tiene. Comprueba la firma y cada
  archivo, los guarda en el iPhone, y a partir de entonces solo ejecuta esos. El servidor no puede cambiarlos.
- Una actualización solo se acepta si está firmada con la misma clave y es más nueva que la que está en uso; empieza la
  próxima vez que se abre Erevos. Una sin firmar o más antigua se rechaza, y Erevos lo dice.
- Quien quiera puede comprobar el servidor: \`node pwa/release.mjs verify https://<dirección>\` comprueba la firma y
  cada archivo que da el servidor, y \`scripts/reproduce-web.sh <versión> https://<dirección>\` vuelve a compilar esa
  versión a partir de su código fuente y comprueba que cada archivo sale igual.

**Lo que queda.** Son límites reales; conócelos:

- **La primera vez** que lo abres, confías en el servidor: es el que envía la parte que comprueba. El paso 2 es cómo
  descubres uno falso.
- **La propia parte que comprueba** (el service worker) la vuelve a descargar Safari al menos una vez al día, y Safari
  puede sustituirla sin preguntar a Erevos. Erevos comprueba entonces la nueva con la versión firmada y te avisa
  (**Erevos ha sido manipulado**), pero un servidor que sepa cómo podría saltarse esa comprobación. Si ves el aviso, no
  vuelvas a abrir Erevos desde ese servidor hasta que se explique. Con un bloqueo con contraseña tus chats siguen
  sellados.
- **Sin Bluetooth ni enlace de cerca**{~, y sin SMS}: Safari no los permite.
- **Solo mientras está abierto:** iOS detiene las apps web en segundo plano, así que los mensajes llegan cuando abres
  Erevos; hasta entonces esperan en el relay.
- **Las llamadas** suenan mientras Erevos está abierto, con un timbre propio: dos toques cortos cada 3 segundos. Safari
  lo deja sonar solo después de que hayas tocado Erevos desde que se abrió, y no con el iPhone en silencio. Con Erevos
  cerrado, una llamada no suena: solo aparece la notificación «Llamada», si las notificaciones están activadas. Apple no
  permite nada más a una app web; para sonar como un teléfono haría falta una app de la App Store.
- **Las notificaciones** con Erevos cerrado están desactivadas salvo que las actives: en Erevos, **Ajustes** →
  **Notificaciones** → **Notificaciones con la app cerrada** → **Activar** (iOS 16.4 o posterior, desde la pantalla de
  inicio). Cuando llegan mensajes, o entra una llamada, tu relay envía un push a través de Apple, y Erevos muestra
  cuántos mensajes han llegado desde la última vez que lo abriste (**3 mensajes nuevos**), o **Llamada** si solo entró
  una llamada, en el idioma de la app, nada más. El número va cifrado para tu iPhone: Apple ve cuándo llega algo para tu
  iPhone, y que usa {=Erevos}, nunca qué ni de quién. Con un relay o un {=Erevos} del remitente anterior a 2.0.0, o un mensaje
  que otros teléfonos llevaron al relay, no hay número: Erevos muestra **Mensaje nuevo**, o **Mensajes nuevos** en
  cuanto llegan más, hasta que lo abras. Son por espacio, nunca para los chats ocultos, y tu relay debe estar
  configurado para enviarlas. También llegan para la cola propia de cada contacto: tu relay tiene entonces una dirección
  push para las colas de todos tus contactos, y Apple recibe un push por cada contacto que escribió, con 15 segundos de
  diferencia, así que por una serie así puede suponer cuántos escribieron a la vez, nunca quiénes. El icono de Erevos en
  la pantalla de inicio muestra entonces también un número: los mensajes no leídos del espacio que tenías abierto, que
  se quedan una vez cerrado Erevos, y los que llegaron después (lo que llegó sin número cuenta como uno), nunca los de
  un chat oculto. **Ajustes** → **Notificaciones** → **Número en el icono** lo desactiva. Las notificaciones funcionan a
  través del servicio push de Apple, el de Google (Chrome, y Edge en Android, Brave y Opera), el de Mozilla (Firefox) y
  el de Microsoft (Edge en Windows): un navegador que use otro no puede activarlas, salvo que quien gestione tu relay
  permita el servicio push de ese navegador. Cada espacio que las activa tiene su propia dirección push, así que ningún
  relay recibe nunca la de otro espacio, y la dirección no une tus espacios. Para ello cada uno de esos espacios tiene
  su propio service worker en el navegador: quien pueda ver los ajustes del navegador puede contarlos, y así cuántos
  espacios tienen las notificaciones activadas. Una solicitud de mensaje de alguien nuevo, a través de tu enlace de
  contacto, puede que solo aparezca cuando se abra Erevos. El número del icono se muestra también en un Mac con «Añadir
  al Dock» de Safari, y en la app web instalada desde Chrome o Edge en Windows, macOS o ChromeOS. No sale ningún aviso
  **Mensaje nuevo** sobre Erevos mientras está abierto en la pantalla. La pantalla **Notificaciones con la app cerrada**
  dice cuándo el navegador o el teléfono no las permiten y, después de que las desactives, cuándo tu relay aún no pudo
  saberlo y puede que envíe alguna más: Erevos se lo dice en cuanto puede llegar a él. Cuando el navegador cambia su
  dirección de push, o el servicio push la descarta, Erevos da a tu relay la nueva por sí solo cuando vuelve a la
  pantalla.
- **Permisos:** en Erevos, **Ajustes** → **General** → **Permisos** muestra lo que el navegador deja hacer a Erevos: si
  funciona desde la pantalla de inicio, las notificaciones con la app cerrada (necesarias en cuanto este espacio las
  activó), el micrófono para las llamadas, la cámara para las videollamadas, y si el navegador conserva los datos de
  Erevos para siempre. Sin eso, Safari puede borrar los datos cuando al iPhone le queda poco espacio, así que una copia
  de seguridad es la red de seguridad. Cada uno tiene su porqué, y un botón con la pregunta propia del navegador; donde
  el navegador ya no pregunta, dice dónde está el ajuste (**Ajustes → Notificaciones → Erevos**, o **Ajustes → Apps →
  Safari → Micrófono**). Solo lee lo que dice el navegador. Un navegador no deja a Erevos leer el ahorro de batería ni
  el modo de bajo consumo, así que no están ahí. Tras cada nueva versión firmada se abre solo cuando falta algo que
  necesitan los mensajes, las llamadas o los datos. En otro navegador (Chrome, Firefox) es igual, con los ajustes de ese
  navegador.
- **Las copias de seguridad** se hacen a mano: **Hacer una copia de seguridad** guarda la copia y sus archivos a través de la hoja
  de compartir (Archivos, iCloud Drive u otra app). Un navegador solo entrega un archivo tras un toque, así que no hay
  copias automáticas.
- **Los mensajes de voz** grabados en un iPhone son AAC; se reproducen en todas partes.
- **Apple** hace Safari y podría cambiarlo, como con cualquier app en un iPhone.

## En Sailfish OS {#sailfish}

En un teléfono con Sailfish OS, Erevos es una app propia: la misma app que en el navegador, mostrada por el motor de
navegador propio de Sailfish dentro de una ventana de Sailfish, con su código instalado con la app y no descargado de un
servidor. Chatea a través de un relay, cifrado de extremo a extremo como en el teléfono, y guarda sus contactos,
mensajes y ajustes sellados de la misma manera.

1. Permite las apps de fuera de la Jolla Store: **Ajustes → Software no fiable → Permitir software no fiable**.
2. Copia \`erevos-sailfish-aarch64.rpm\` al teléfono (Descargas) y tócalo en **Archivos**, luego **Instalar**. Desde
   un terminal (modo de desarrollador) es \`pkcon install-local erevos-sailfish-aarch64.rpm\`. Necesita Sailfish OS 5
   en su versión de 64 bits (aarch64).
3. Pon un bloqueo con contraseña (en Erevos, **Ajustes** → **Privacidad y seguridad** → **Bloqueo y segunda
   contraseña**). Más abajo se explica por qué aquí importa.
4. Configura el relay y añade contactos como en el teléfono, ver [Chatear a través de un relay](#relay).

- **Lo que solo hace Android:** Bluetooth, Wi-Fi Aware, Wi-Fi Direct{~, LoRa y los SMS| y LoRa}. La misma Wi-Fi funciona aquí
  también, como en un ordenador: ver [Chatear con un teléfono cercano](#nearby). El cortafuegos de Sailfish OS ya deja
  entrar su puerto, el 47905: solo un cortafuegos que hayas hecho más estricto tú necesita una regla para él. El resto
  es igual: espacios y la segunda contraseña, chats ocultos, mensajes de voz, chats importados y copias de seguridad.
- **Dónde guarda las cosas:** en \`~/.local/share/erevos\` en el teléfono, sellado como en el teléfono. Sailfish no
  tiene llavero para las apps, así que el almacén de claves se guarda ahí tal cual, legible por tu usuario, y por tanto
  por cualquier app que se ejecute como tú: el bloqueo con contraseña es lo que lo sella.
- **Las copias de seguridad** van a \`Documents/Erevos\` en el teléfono, a mano o cada día; cópialas de ahí a una
  tarjeta de memoria u otro dispositivo. **Guardar** pone una foto o un archivo en Descargas.
- **Las llamadas** suenan mientras Erevos se ve, con un timbre propio: dos toques cortos cada 3 segundos, y el
  teléfono vibra donde puede, hasta que se contesta la llamada o termina. Una llamada que entra antes de que hayas
  tocado Erevos desde que se abrió puede mostrarse sin sonido.
- **Mientras está cerrado:** con un espacio abierto, un pequeño ayudante de Erevos espera en el relay mientras Erevos
  no se ve o está cerrado, y no toma nada. Un aviso dice solo cuántos mensajes llegaron, nunca de quién ni qué, y una
  llamada suena con el tono del teléfono, como lo pone su perfil, 45 segundos como mucho; un toque en cualquiera de
  los dos abre Erevos. Los chats ocultos no dicen nada entonces. Bloquear el espacio lo detiene, y tras reiniciar el
  teléfono vuelve a esperar solo cuando Erevos abre el espacio. Como el resto de Erevos aquí, va directo, sin Tor.
  Cada espera despierta el teléfono más o menos una vez por minuto, como en Android.
- **Probado hasta ahora** en el motor de navegador de Sailfish (Gecko 91) en un ordenador, chateando con un navegador a
  través de un relay. La misma Wi-Fi se probó contra la del ordenador, en un ordenador. Todavía no en un teléfono con
  Sailfish.

## Actualizaciones {#updates}

Erevos pregunta a GitHub por actualizaciones solo cuando tocas el botón, como en Fasouli: una comprobación periódica
le diría a GitHub, cada día, que este teléfono u ordenador tiene {=Erevos}. En Android también te avisa cuando sale una
versión nueva, sin preguntar a GitHub, como explica **Aviso cuando sale una versión nueva** más abajo. Para actualizar:

1. Abre **Ajustes** → **General** → **Actualizaciones** (o **Buscar actualizaciones** al final de la primera pantalla de
   esta guía).
   Muestra la versión que tienes, como **Erevos 2.0.0**.
2. Toca **Buscar actualizaciones**. GitHub ve entonces la dirección de internet de este dispositivo, nada más; en
   Android también la ve el servidor de la app web, que guarda la firma de la actualización hecha por el ordenador de
   versiones. Mientras todo lo del espacio va por Tor (**Todo** en Tor), Erevos no comprueba, ya que eso rodearía Tor.
   Con **Por Tor** activado, en esta pantalla (desactivado salvo que lo actives), pregunta solo al servidor de la app
   web, por Tor, y no a GitHub: a GitHub no se le pregunta y nada ve la dirección. Es más lento y espera mientras Tor
   arranca; y funciona también mientras todo lo del espacio va por Tor.
3. Cuando hay una versión nueva: en Android toca **Instalar**. Se descarga, se comprueba con la versión publicada (su
   tamaño y su SHA-256), y se abre el instalador de Android: toca **Instalar** ahí. Erevos solo la ofrece una vez que
   el ordenador de versiones, que guarda su clave sin conexión, ha firmado esa compilación y su SHA-256: quien se
   hiciera solo con la cuenta de GitHub no podría hacer instalar un APK propio. Hasta entonces dice que la versión ha
   salido pero aún no está firmada. Cuando no se puede contactar con el servidor de la app web lo dice, con el motivo,
   y cuando la firma de ahí no coincide lo dice: en ambos casos no se instala nada. Una descarga cuya conexión no trae
   nada durante un rato vuelve a empezar sola, desde el principio, tres veces en total; después Erevos lo dice y no se
   instala nada. La primera vez, Android pide permitir que Erevos instale apps. En un ordenador y en Sailfish OS,
   **Abrir la página de descargas** abre la página de versiones: toma el archivo que nombra Erevos, el del paquete que
   tienes, y actualiza como en la tabla de abajo.
   Por Tor se avisa de una versión nueva, pero no se descarga aquí, porque su paquete es más grande de lo que admite
   el Tor de Erevos: desactiva **Por Tor** un momento para instalarla, o descárgala de la página de versiones en el
   Tor Browser.

Una versión como **4.0.0-rc.1** es una versión de prueba anterior a la 4.0.0 (una versión candidata): se instala y se
actualiza como cualquier otra, y la 4.0.0 llega después.

### Erevos, Erevos+ o Erevos Lite, y betas {#update-channel}

En Android, **Actualizaciones** dice también qué versiones se ofrecen a este teléfono:

- **Próxima actualización**: **Erevos Lite** (los chats y llamadas propios de Erevos, nada más; versiones 3.2.x),
  **Erevos** (sus propios chats, el Teléfono, los SMS y la Colección; versiones 3.0.x) o **Erevos+** (todo eso, con
  Telegram, Messenger, Signal, Session, Matrix, XMPP y Nostr; versiones 3.1.x). Al principio está elegida la que
  tienes. Cada una es una app aparte, con sus propios datos, así que elegir otra es un traslado, no una actualización:
  **Buscar actualizaciones** la encuentra y pregunta **Pasar a …**. Este Erevos hace entonces una copia de todo,
  cifrada, aquí en el teléfono (cada espacio, con sus contactos, mensajes y ajustes), y Android instala la otra app
  junto a esta, si no está ya. Ábrela en el plazo de un día: pregunta si traer tus chats y los toma; nada sale del
  teléfono. Los espacios se abren luego con sus contraseñas, como tras cualquier restauración. Los SMS y las llamadas
  del teléfono se quedan en el teléfono: haz de la nueva app la app de SMS y de teléfono, si los usas. Desde que se
  hace el traslado, la app antigua no recibe ni envía nada y solo muestra el traslado, para que no quede allí ningún
  mensaje que la nueva no tenga; **Cancelar el traslado** la abre como antes. Cuando la nueva lo toma, la antigua
  ofrece **Borrar todo aquí** y **Desinstalar**; un traslado no tomado en un día se borra, y la app antigua se abre
  como antes. Una app nueva ya configurada también pregunta, y lo que trae ocupa el lugar de todo lo que tiene. El
  traslado necesita espacio libre en el teléfono para una copia de todo: Erevos lo dice antes si no alcanza. La
  versión de F-Droid, firmada con otra clave, no puede trasladarse así: usa las [Copias de seguridad](#backup).
- **Versiones beta**: desactivado, solo se ofrecen las versiones normales. Activado, también las betas (como
  **7.0.1-beta.1**): salen antes, para probar, y pueden tener problemas. Una beta lo tiene activado al principio.
  Desactívalo para salir de las betas: la próxima versión normal con un número de compilación mayor que la beta que
  tienes se instala sobre ella y lo conserva todo, sin desinstalar.

Desde Erevos+ vienen también las redes: Telegram, Signal, Session, Messenger y Matrix siguen con la sesión iniciada en
la nueva app, como estaban (las fotos y archivos de Telegram se descargan de nuevo al abrirlos, y la página de
Messenger pide su PIN una vez más). Erevos y Erevos Lite no tienen Telegram, Messenger, Signal ni Session: mudarse a
ellos deja esas cuentas en el antiguo Erevos+, que luego no abre nada, así que si usas Session, anota primero sus 13
palabras de recuperación.

Erevos+ necesita Android 8.0 o posterior: en un teléfono más antiguo no se puede elegir, y el teléfono se queda en
Erevos.

El aviso de una versión nueva sigue la misma elección. El ordenador de las versiones firma cada edición y sus betas
por separado, así que una nunca se instala como otra.

### Novedades {#whats-new}

**Ajustes** → **General** → **Novedades** (también **Novedades** en **Actualizaciones**) dice en breve qué cambió cada
versión, la más nueva primero, solo por su número; la versión que tienes dice **Esta versión**. Cada versión añade lo
suyo. El CHANGELOG del código fuente cuenta cada cambio en detalle.
Cada versión, allí como aquí, dice primero qué cambia **Para ti**, lo que ves y usas, y luego qué cambió
**Bajo el capó**: arreglos, velocidad, batería y seguridad por dentro.

### Aviso cuando sale una versión nueva {#release-notice}

En Android, una vez al día, Erevos pregunta al servidor de LPHL, que también gestiona el relay, si ha salido una versión
nueva. Cuando la hay, **Erevos** aparece arriba de los chats, fijado, con su icono: **Salió Erevos 3.3.0. Toca para ver
qué hay de nuevo y actualizar.**, marcado hasta que lo abras, y un aviso dice también **Erevos 3.3.0 is out**. Toca
cualquiera de los dos para ir a **Actualizaciones**, y luego **Buscar actualizaciones**. Desaparece en cuanto tienes esa
versión.

- **Solo cuando está firmada:** solo cuenta una vez que el ordenador de versiones ha firmado tanto la compilación como
  su nombre, la misma firma que permite a **Actualizaciones** instalarla. Así que llega en cuanto esa versión se puede
  instalar, y el servidor por sí solo no puede inventarse una.
- **Solo en el relay de LPHL:** un espacio solo pregunta mientras usa el relay de LPHL y no envía todo por Tor
  (**Todo** en Tor): el servidor no ve entonces nada que no vea ya. Un espacio en otro relay, o sin relay, no pregunta
  nada; ahí te lo dice **Buscar actualizaciones**.
  El interruptor **Por Tor** de **Actualizaciones**, uno para este aviso y para **Buscar actualizaciones**, solo en
  este teléfono, hace que pregunte por Tor: el servidor entonces no ve la dirección del teléfono, y un espacio que
  envía todo por Tor también pregunta. Se avisa de una versión nueva, pero solo se instala con el interruptor
  desactivado.
- **Para desactivarlo:** **Ajustes** → **General** → **Actualizaciones** → **Avísame cuando salga una versión nueva**.
- Funciona a partir de la versión que lo tiene: la anterior no dice nada. No en la compilación de F-Droid, que actualiza
  F-Droid.

**Por qué:** para que nadie tenga que mirar en GitHub, una por una, cada versión nueva, y GitHub nunca sepa qué
teléfonos tienen Erevos: el servidor al que se pregunta es aquel con el que el teléfono ya habla, y lo que dice solo
cuenta con la firma del ordenador de versiones, guardada sin conexión.

El resto de esta sección es para actualizar a mano.

**Dónde están las versiones nuevas:** en la página de versiones de Erevos,
\`https://github.com/azzinder/erevos-releases/releases\`. La más nueva está arriba, como **Erevos 2.0.0**, con un
archivo para cada sistema. Las cinco más nuevas se quedan ahí.

**Comprueba el archivo** si puedes, en un ordenador: cada versión tiene \`SHA256SUMS\`, y en la carpeta con los archivos
descargados \`sha256sum -c --ignore-missing SHA256SUMS\` debe decir **OK** para cada uno.

**Haz antes una copia de seguridad** (**Ajustes** → **Datos y dispositivos** → **Copias de seguridad** → **Hacer una
copia de seguridad**), ver [Copias de seguridad](#backup). Una actualización lo conserva todo, pero una copia cuesta un
minuto y cubre cualquier sorpresa.

| En | Cómo actualizar |
| --- | --- |
| **Android** | **Ajustes** → **General** → **Actualizaciones** → **Buscar actualizaciones** → **Instalar**, o a mano: abre la página de versiones en el teléfono, toca \`erevos-android.apk\`, y luego **Instalar**. Se instala encima del que tienes y lo conserva todo. Permite instalar desde el navegador una vez, cuando Android lo pida. |
| **Linux, basado en Arch** | \`sudo pacman -U erevos-linux-x86_64.pacman\` |
| **Linux, AppImage** | Sustituye el antiguo \`erevos-linux-x86_64.AppImage\` por el nuevo y hazlo ejecutable. |
| **macOS** | Abre \`erevos-macos.dmg\` y arrastra Erevos a Aplicaciones, **Reemplazar**. Luego vuelve a permitirlo en **Ajustes del Sistema → Privacidad y seguridad → Abrir igualmente**. |
| **Windows, instalado** | Cierra Erevos y ejecuta el nuevo \`erevos-windows-x64-setup.exe\`: se instala encima del que tienes. Windows puede volver a avisar: **Más información**, y luego **Ejecutar de todas formas**. |
| **Windows, portátil** | Cierra Erevos y pon el nuevo \`erevos-windows-x64-portable.exe\` en lugar del antiguo. |
| **Sailfish OS** | Toca \`erevos-sailfish-aarch64.rpm\` en **Archivos**, luego **Instalar**, o \`pkcon install-local erevos-sailfish-aarch64.rpm\`. |
| **iPhone, navegador** | Nada que hacer: la app web toma sola una versión nueva firmada al abrirse, ver [En un iPhone](#iphone). |

- **Los contactos, los chats y los ajustes se quedan** en todos los sistemas: viven en la carpeta propia de Erevos, no
  en la app.
- **Android, la primera vez desde la página de versiones:** un Erevos compilado en un ordenador para pruebas está
  firmado con otra clave, y Android se niega a instalar encima de él (**Aplicación no instalada**). Haz una copia de
  seguridad, desinstala {=Erevos}, instala el de la página de versiones y restaura la copia. Después de eso, cada
  actualización se instala encima.
- **{=Erevos} de F-Droid**, cuando esté ahí, lo actualiza F-Droid: sus **Actualizaciones** muestran la versión y lo dicen,
  sin **Buscar actualizaciones**. F-Droid lo firma con una clave propia, así que Android no instala ni ese encima del
  Erevos de la página de versiones ni este encima de aquel. Para cambiar: haz una copia de seguridad, desinstala {=Erevos},
  instala el otro y restaura la copia.
- **Nunca uno más antiguo:** no instales una versión más antigua encima de una más nueva. Sus datos pueden estar en un
  formato que la más antigua no puede leer. Restaura en su lugar una copia hecha con esa versión más antigua.
- **Una versión a la que le falta tu sistema** lo dice en sus notas: esa compilación falló, así que usa la versión
  anterior.

## Erevos a un teléfono cercano {#give-app}

Sin internet, un teléfono Android con {=Erevos} puede dárselo a un teléfono a su lado, en **Ajustes** → **General** →
**Dar Erevos a un teléfono cercano** (también en **Actualizaciones**). Ambos teléfonos deben estar en la misma Wi-Fi,
o el otro en el punto de acceso de este: activa antes el punto de acceso en los ajustes de Android.

1. **En el teléfono que lo da:** toca **Iniciar**. Aparece un código QR, con el tamaño del paquete, y debajo las
   direcciones para escribir en un navegador en su lugar.
2. **En un teléfono sin {=Erevos}:** escanea el código con su cámara. Su navegador abre una página, del teléfono que lo
   da, con **Descargar {=Erevos}**: descárgalo y abre el archivo, y Android lo instala. La primera vez, Android pide
   permitir instalar apps desde ese navegador. La página muestra el SHA-256 del paquete y el de su certificado: deben
   ser los que muestra el teléfono que lo da en **Para comparar**.
3. **En un teléfono con un {=Erevos} más antiguo:** abre mejor **Ajustes** → **General** → **Actualizaciones** →
   **Desde un teléfono cercano** y fotografía el código. Erevos descarga el paquete y abre el instalador de Android
   solo si su SHA-256 es el del código, es Erevos, firmado con el mismo certificado que el Erevos de allí, y más
   nuevo.

- **Cuánto tiempo:** el teléfono que lo da lo sirve mientras se ve su pantalla, diez minutos como mucho, y para antes
  con **Detener**. Lo sirve solo en una dirección aleatoria que nadie adivina, solo a teléfonos de su propia red, y
  nada más que el paquete y su página: ningún chat, contacto ni ajuste va con él.
- **Lo que no puede comprobar por ti:** el navegador solo descarga. Un teléfono con un Erevos alterado mostraría su
  propio certificado, así que cuando tengas internet compara el certificado con el de la web o la página de versiones
  de Erevos. El propio Erevos, en **Actualizaciones**, rechaza un paquete firmado de otro modo.
- **No desde una tienda:** un {=Erevos} instalado en partes, como instalan algunas tiendas, no puede darse entero y lo
  dice. El {=Erevos} de F-Droid lo firma F-Droid: puede ir a un teléfono sin {=Erevos}, o sobre el Erevos de F-Droid por el
  navegador, pero un Erevos de la página de versiones lo rechaza en **Actualizaciones**, como haría Android. El Erevos
  de F-Droid no toma nada en **Actualizaciones**: lo actualiza F-Droid.
- Solo en Android. Cualquiera en la misma red que vea el código puede descargar Erevos también; no hay nada más que
  tomar.

**Por qué:** donde internet está cortado, o vigilado, o un teléfono ni siquiera llega a la web, Erevos puede seguir
pasando de mano en mano, y el teléfono que lo recibe puede comprobar que es el verdadero.

## Las pantallas de prueba {#tests}

Dos pantallas en **Ajustes** → **Para pruebas** sirven para probar las conexiones, paso a paso.

- **Prueba de radio (Android):** **Permisos** pide a Android lo que necesita la radio, **Iniciar** y **Detener**
  encienden y apagan Bluetooth y Wi-Fi Aware, **Enviar hola** envía un mensaje de prueba simple a la Prueba de radio
  del teléfono cercano (un chat no lo muestra), y el **Registro** muestra lo que pasó.
- **Prueba del relay (Wi-Fi):** **Crear cola** crea una cola en un relay y muestra dos ids. Da el **sender id** al
  teléfono que te escribe, y guarda en privado el **recipient id**. **Enviar** y **Recibir** mueven mensajes a mano.

> Con un solo teléfono igualmente puedes probar un chat por el relay: tus chats y tus **Chats ocultos** tienen cada uno
> su propia cola en el relay y sus propias claves. Crea las dos colas en el mismo relay, toca **Compartir mi enlace de
> contacto** en uno y cópialo, luego añádelo en el otro, y escribe en los dos sentidos. El propio enlace de un chat se
> rechaza como contacto.

## Qué está protegido hoy {#privacy}

Erevos dice claramente lo que protege y lo que todavía no.

| Qué | Hoy | Por venir |
| --- | --- | --- |
| **Cuenta, número de teléfono, email** | No hace falta ninguno. Los contactos son pares de colas de un solo sentido en el relay. | |
| **Los contactos y sus nombres, claves, ajustes del relay, aspecto** | Sellados en el teléfono con la clave de cada espacio. | |
| **Mensajes a través de un relay** | Cifrados de extremo a extremo: PQXDH con ML-KEM-768 para empezar, luego el doble ratchet. El relay no puede leerlos, y en cuanto los dos teléfonos han recibido un mensaje el uno del otro tampoco puede distinguirlos por conversación: cada uno se sella una vez más para el teléfono al que va. Ve cuáles son mensajes que alguien lee, cuáles son avisos entre teléfonos, y cuáles son llamadas que suenan, ya que cada uno lo dice. Aún sin auditar. | Una auditoría externa. |
| **Mensajes a un teléfono cercano** | Cifrados de extremo a extremo, igual que por el relay. Quien escuche cerca puede saber que hay teléfonos con {=Erevos} cerca unos de otros, y cuándo y cuánto envían; en la misma Wi-Fi, también cualquiera que esté en ella, y por Wi-Fi Direct cualquiera que se una a la Wi-Fi propia de los teléfonos. Hasta que se conoce el teléfono de tu contacto, los otros teléfonos con {=Erevos} conectados cerca reciben tus mensajes cortos, sellados. | |
| **Mensajes llevados por otros teléfonos** | Sellados dos veces: de extremo a extremo para tu contacto, y para su relay. Un teléfono que lleva uno ve a qué relay va, cuándo, y de qué tamaño; no de quién es ni para quién. Su relay ve a qué relay va, y ese relay ve el relay del portador, no su teléfono. Guardados sellados en el teléfono, tres días como mucho: los de otros en un archivo del teléfono, cuyo tamaño muestra más o menos cuántos hay; los tuyos en tu espacio, sellados con su clave. Los chats ocultos nunca se llevan. | |
| **Mensajes por LoRa** | Cifrados de extremo a extremo, igual que por el relay. Cualquiera con una radio, a kilómetros, puede saber que la tuya transmite, cuándo y cuánto, y su señal se puede rastrear hasta donde está. Erevos impide que tu radio anuncie su nombre y dónde está (rol Client hidden, GPS apagado, sin posición fija) salvo que lo permitas; aun así responde a una radio que le pregunte su nombre. Todos los Erevos de la malla reciben tus mensajes LoRa, sellados. | Poner el nombre de la radio desde Erevos. |
[~] | **Mensajes por SMS, cuando nada más funciona** | Cifrados de extremo a extremo, igual que por el relay, en SMS de datos ocultos. Desactivado salvo que lo actives. La compañía telefónica ve qué número escribió a cuál, cuándo y cuántos SMS; nunca lo que se escribió. Cada uno cuesta lo que un SMS. | |
| **Quién habla con quién** | El relay ve direcciones IP, ids de colas, y cuándo y cuánto. Con un segundo relay, tu relay nunca ve tu dirección. Desde un sitio prestado en el relay de un contacto, cada relay al que envías la ve. [A través de Tor](#tor), una vez que lo activas, con **Mensajes** ningún relay la ve para lo que escribes, y con **Todo** tampoco para las imágenes y los archivos; con puentes, para donde Tor está bloqueado, la red solo ve un puente. El broker de Snowflake y los servidores STUN ven tu dirección. | Tor en un ordenador. |
| **La conexión con el relay** | TLS, y dentro, en cuanto se conoce la clave del relay, un canal hacia esa clave: el relay demuestra que la tiene en cada conexión, y el token y cada petición van cifrados con ella, así que alguien entre medias con un certificado para el nombre del relay no puede hacerse pasar por él. A un relay que demostró su clave una vez nunca se vuelve a llegar sin ella. Un relay más antiguo que esta app funciona como antes, y **Cómo te conectas ahora** lo dice. La primera clave viene del relay la primera vez que se le pregunta, o de un enlace de contacto: quien esté entre medias justo esa primera vez podría dar una propia. [La clave propia del relay](#relay). Sin auditar. | La clave de nuestro relay incluida en la app, y en las invitaciones. |
| **Textos por Nostr** | Cifrados de extremo a extremo como por un relay, luego envueltos una vez más para una clave que tu contacto dio solo para ese chat, firmados por una clave hecha solo para ese texto. Los relays de Nostr ven cuándo y de qué tamaño, y que una clave que no nombra a nadie recibe un texto; tu teléfono lee todas sus claves en una sola conexión, a través de Tor si Tor está activado, así que un relay puede saber que se leen juntas, y desde dónde solo con Tor desactivado. Tu relay solo los ve como respaldo, y una campanita para los chats ocultos. [A través de Nostr](#nostr). | |
[~] | **SMS** | Un SMS normal lo lee la compañía telefónica, como cualquier SMS. A un número vinculado a un contacto de Erevos va en su lugar por Erevos. Una invitación oculta es un SMS corto más que ve la compañía telefónica. | |
| **Los contactos del teléfono** | En los contactos propios de Android, sin sellar por Erevos, como con cualquier app de contactos: cualquier app con permiso para leerlos los ve, y una cuenta (Google) puede sincronizarlos. Erevos no los envía a ninguna parte. Un archivo .vcf guardado a partir de ellos está fuera de Erevos, sin sellar.{~ Las llamadas y los SMS de un contacto se leen del propio registro de llamadas y de los SMS del teléfono solo para mostrar su historial, y no se guardan en ninguna parte.} | |
| **Contactos guardados solo en Erevos** | Sellados con la clave del espacio, o con la de los chats ocultos para los suyos, en un archivo para todos los espacios cuyo tamaño muestra más o menos cuántos hay en total, no de quién son; sus fotos, cada una en un archivo propio. Nunca en los contactos de Android. Un archivo .vcf guardado a partir de ellos, también de los chats ocultos, está fuera de Erevos, sin cifrar. Las llamadas{~ y los SMS} a ellos van por el teléfono, y aparecen en su registro de llamadas{~ y en sus SMS}. | |
[~] | **Llamadas telefónicas** | Llamadas telefónicas normales: las lleva la compañía telefónica, que puede escucharlas, como con cualquier app de teléfono. Android guarda el historial de llamadas, sin sellar por Erevos, como para cualquier app de teléfono; Erevos lo lee, y los favoritos, para mostrarlos, elimina de él solo las llamadas que eliminas, y no guarda ninguna copia. La SIM elegida para cada número se sella en el espacio; las respuestas rápidas, y lo que se bloquea (solo prefijos, ids de grupos y horas, lo mismo para todos los espacios), se guardan en el teléfono, sin sellar. | |
| **Chats importados** | Sellados en el espacio al que se trajeron, también sus fotos y archivos, cada uno en sus trozos como el archivo de un chat. El tamaño del archivo, y cuántos trozos hay, dicen más o menos cuánto se importó, no dónde. | Las fotos y los archivos de Viber, y archivos de más de 4 GB. |
| **Historial de mensajes** | Guardado en el teléfono, sellado en su espacio, sin límite, en páginas del mismo tamaño mezcladas para todos los espacios. Solo se ve cuánto ocupa todo, no a qué espacio pertenece. Eliminar en los dos teléfonos, y los mensajes temporales, dependen del Erevos del otro teléfono. | |
| **Mensajes de cerca** | Solo se abren en el espacio que tiene el contacto. Uno para otro espacio espera en memoria, seis horas como mucho, hasta que ese espacio se abra. Uno para chats ocultos solo se abre mientras están abiertos, o reciben cerrados, y el espacio nunca sabe que uno de sus contactos está cerca. | |
| **Mensajes de voz** | Cifrados de extremo a extremo por el relay o de cerca, en trozos: el relay, o quien escuche cerca, puede saber más o menos cuánto dura cada uno. Cada sonido se sella en un archivo propio; cuántos archivos hay, y sus tamaños, muestran más o menos cuántos se guardan, no en qué espacio. Sin sellar en la caché solo mientras se reproduce. | Archivos de sonido todos del mismo tamaño. |
| **Fotos y archivos** | Cifrados de extremo a extremo, a través del almacén de archivos del relay, en trozos del mismo tamaño: el relay ve cuántos y cuándo, así que más o menos lo grandes que son. Tu relay ve tu dirección, como para los mensajes; el contacto los recoge a través de su propio relay. Las fotos pierden su lugar, su teléfono y su hora, salvo que se envíen como archivo; un archivo conserva lo que dice dentro. Sellados en el teléfono en sus trozos, mostrados desde la memoria. Las copias guardadas están fuera de Erevos. Las copias de seguridad los contienen, sellados con la contraseña de la copia, en archivos propios. | |
| **En un ordenador** | Sellado como en el teléfono, en la carpeta propia de la app. Su almacén de claves está sellado con el llavero del sistema (en Windows, la clave de tu cuenta); en un sistema Linux sin llavero, Erevos no guarda nada salvo que se inicie con \`--plain-secrets\`, y entonces lo guarda tal cual. | |
| **Copias de seguridad** | Selladas con su propia contraseña, contienen cada espacio tal como está sellado en el teléfono, con sus fotos, archivos y mensajes de voz en archivos propios junto a la copia. Sus nombres dicen que son una copia de seguridad de Erevos, y su número y tamaño muestran más o menos cuánto se guarda. Las copias automáticas guardan su contraseña en el teléfono. Van a un servidor solo si añades uno: bytes aleatorios con nombres aleatorios, de tamaños redondeados; el servidor ve tu cuenta y cuándo, y tu dirección salvo que vayan por Tor. | |
| **Marcas ✓✓ y ✓✓✓** | El teléfono del contacto sabe cuándo el tuyo recibió y leyó sus mensajes, cifrado. En un grupo que no es público, también lo sabe el teléfono de quien envió el mensaje. El relay, o quien escuche cerca, ve un mensaje pequeño más. | Un interruptor para dejar de decir cuándo lees. |
| **Huella o cara (Android)** | Desactivado salvo que se active. Solo abre el espacio de la primera contraseña: su clave sellada en el Android Keystore, utilizable solo justo después de una comprobación fuerte de huella o cara, y descartada cuando estas cambian. Alguien que te retenga puede usar tu dedo. | |
| **Avisos (Android)** | En segundo plano: «Erevos – Ready for calls and messages» (no en la pantalla de bloqueo), «Incoming call» o «Incoming video call» – «Open Erevos to answer», y «New message» o cuántos llegaron; cuando Android o la contraseña lo detienen, «Closed by Android» o «Locked» – «Open it to receive calls and messages again»; un recordatorio, «Reminder» o cuántos; una versión nueva, «Erevos X is out». Nunca quién ni qué. En un teléfono bloqueado, el de los mensajes solo dice «Erevos». Los chats ocultos que pueden decirlo muestran el mismo aviso, contado con el resto: quien lo vea y no encuentre nada nuevo puede suponer que hay más. Como app de teléfono, el aviso de una llamada telefónica nombra a quien llama, también sobre la pantalla de bloqueo, como el de cualquier app de teléfono, pero nunca con un nombre que solo conozcan los chats ocultos: una llamada de uno de sus contactos muestra el número. | |
| **Widget{~ y Teléfono} (Android)** | El widget, una vez añadido, muestra {~cuántas llamadas perdidas, SMS sin leer y mensajes nuevos hay|cuántos mensajes nuevos hay}, nunca de quién ni qué.{~ El Teléfono se abre sin la contraseña solo si lo permites: entonces cualquiera que tenga el teléfono desbloqueado ve las llamadas y los favoritos que guarda Android, solo con los nombres de los contactos del teléfono.} | |
| **Llamadas** | Cifradas de extremo a extremo (DTLS-SRTP, con su clave enviada en el chat cifrado). A través del relay de llamadas, ningún teléfono ve la dirección IP del otro; el servidor que lo ejecuta ve las dos, cuándo y cuánto tiempo, y cuánto pasa. Sin relay de llamadas, solo en la misma Wi-Fi, cada teléfono ve la dirección del otro. Los relays ven cuándo empieza a sonar una llamada. | Que suene en la app web estando cerrada. Llamadas por Bluetooth (ahí funciona el walkie-talkie). |
| **Chats de grupo** | Cifrados de extremo a extremo con MLS (RFC 9420); los miembros sacados no leen nada después. La copia de cada miembro se sella aparte, así que los relays no pueden saber quién está en un grupo; cada relay sigue viendo que un mensaje llega a una cola. Los miembros ven las claves y las direcciones de relay de los demás. Las fotos, los archivos y los mensajes de voz van por el almacén de archivos del relay de quien los envía, como a un contacto, y se quedan ahí 14 días. Sin auditar. | |
| **Llamadas de grupo** | Voz y vídeo, cifrados de extremo a extremo entre cada dos teléfonos de la llamada (DTLS-SRTP, con sus claves enviadas en el cifrado del grupo). A través del relay de llamadas, ningún teléfono ve la dirección IP de otro; el servidor que lo ejecuta ve la de cada teléfono, cuándo y cuánto tiempo, y cuánto pasa. Cada miembro, esté en la llamada o no, sabe quién está en ella. Los relays ven cuándo empieza una. | Vídeo con más de cuatro personas, a través de un servidor; más de ocho personas. |
| **Grupos públicos** | Como los chats de grupo, y cualquiera con el enlace puede pedir unirse y leer desde que se le deja entrar. Las peticiones llegan al relay del propietario selladas para el teléfono del propietario: el relay ve cuántas y cuándo, no de quién. Los miembros ven los nombres elegidos de los demás, claves hechas solo para ese grupo, direcciones de relay y sender ids de las colas. Sin auditar. | |
| **Vistas previas de enlaces** | Desactivadas salvo que se activen. Entonces, al enviar un enlace, tu teléfono descarga su página directamente del sitio, que ve tu dirección IP y cuándo, no para quién es el mensaje. La vista previa va dentro del mensaje cifrado; el teléfono que lo recibe no descarga nada. Con **Por Tor** activado, la página se descarga solo por Tor y el sitio no ve tu dirección IP. Ninguna mientras el espacio envía todo por Tor, salvo que **Por Tor** esté activado; en los chats ocultos solo con el interruptor propio de su lugar. | |

## Transparencia {#transparency}

Lo que guarda el servidor que hay detrás de Erevos (lphl.nekten.eu), y lo que se le ha pedido. Esta página va dentro de
cada versión, así que está firmada con la versión, como la app.

**Peticiones de autoridades.** A fecha de esta versión: ninguna. Ninguna autoridad, tribunal ni empresa ha pedido datos
sobre nadie que use {=Erevos}, y a nadie se le ha pedido guardar silencio sobre una petición así. Si este párrafo
desaparece algún día, o deja de decir «ninguna», tómalo como una señal. **Por qué:** una petición que llega con la orden
de guardar silencio no se puede contar, pero una frase que deja de escribirse se puede notar. Eso solo funciona mientras
se renueve: cada versión lo vuelve a decir.

Lo que guarda el relay, y durante cuánto tiempo:

| Qué | Durante cuánto tiempo |
| --- | --- |
| **Mensajes en espera**, cifrados de extremo a extremo | Hasta que se recogen, 14 días como mucho. |
| **Fotos y archivos**, cifrados, en trozos | Como los mensajes: hasta que se recogen, 14 días como mucho. |
| **Mensajes enviados para más tarde**, cifrados | Hasta que llega su hora. |
| **Colas**, ids aleatorios sin nombre | Hasta que su teléfono lleva 180 días sin usarlas. |
| **Líneas de acceso**: para cada teléfono, el SHA-256 de su token y un nombre: letras y cifras al azar para uno invitado desde Erevos 6.0.0 (antes, el que escribió quien lo invitó), o el nombre de usuario de LPHL para quienes iniciaron sesión con LPHL | Hasta que se quita la línea. |
| **Direcciones push de la app web**, para los avisos mientras la app web está cerrada | Hasta que se desactivan en la app web. |

Lo que no guarda:

- **Ninguna lista de conexiones.** El relay no escribe ningún registro de quién se conectó ni cuándo, y el servidor web
  que está delante del relay y de la app web no guarda ningún registro de accesos desde el 24 de octubre de 2026. Los
  errores se registran, y un error puede nombrar una dirección.
- **Ningún contacto, nombre ni número de teléfono.** No tiene ninguno que guardar.

Lo que sigue viendo mientras funciona: las direcciones IP que se conectan, cuándo llegan y salen los mensajes, y de qué
tamaño son, como dice [Qué está protegido hoy](#privacy). Durante una llamada por el relay de llamadas, las direcciones
IP de los teléfonos que están en ella.

**Copias.** De la carpeta del relay se hace una copia cada día, con los mensajes en espera todavía cifrados de extremo a
extremo. Las copias contienen lo que lista la tabla de arriba, mientras se conserven.

**Otros que ven algo:** la empresa de alojamiento (Hetzner), que gestiona la máquina y su red; el inicio de sesión de
LPHL (Authentik), que ve cada inicio de sesión con LPHL; y para la app web con avisos con la app cerrada, el servicio
push del navegador (Apple, Google o Mozilla), que ve que llegó un aviso, nunca qué.

## Licencia {#licence}

**Erevos, by azzinder.** Copyright © 2026 azzinder.

Erevos es software libre, con la GNU Affero General Public License, versión 3 o cualquier versión posterior
(AGPL-3.0-or-later): cualquiera puede usarlo, estudiarlo, compartirlo y cambiarlo. Quien comparta Erevos, cambiado o no,
o ejecute un Erevos cambiado para otros a través de una red, debe cumplir esa licencia y compartir el código fuente de
su versión con quienes la reciban.

### Condiciones adicionales

Según la sección 7 de la licencia, estas condiciones se aplican también a Erevos:

- **El nombre del autor.** Las copias y las versiones cambiadas conservan el aviso «Erevos, by azzinder» en el apartado
  Acerca de Erevos de la app, [Qué es Erevos](#about).
- **Una versión cambiada lo dice.** Dice claramente que está cambiada y no se presenta como el Erevos original.
- **El nombre y el logo.** La licencia no da derecho al nombre «Erevos» ni a su logo: una versión cambiada que se da a
  otros toma otro nombre.

### Sin garantía

Erevos se da con la esperanza de que sea útil, pero **sin ninguna garantía**: ni siquiera de que se pueda vender ni de
que sirva para un fin determinado. La licencia dice más.

### Quién lo hizo

Erevos se hace con **ingeniería agéntica dirigida por personas (human-directed agentic engineering)**: azzinder fija el
diseño, los límites, lo que debe hacer cada cambio y cuándo está terminado; las herramientas de IA escriben, ejecutan
las comprobaciones y corrigen.

Erevos lo diseña, dirige y mantiene azzinder, quien eligió sus funciones y cómo funcionan, su modelo de seguridad y su
estructura, lo prueba en dispositivos reales y decide qué entra en cada versión. Se usaron ampliamente herramientas de
IA para escribir el código y los textos, siempre por indicación y según el diseño de azzinder.

Las partes hechas por otros conservan a sus propios autores y licencias, ver
[Hecho con el código abierto de otros](#about). Los textos completos vienen con el código fuente de {=Erevos}:
\`AUTHORS.md\`, \`CREDITS.md\` y la carpeta \`LICENSES\`. Cada copia de Erevos lleva además el archivo \`NOTICES.txt\`, con la licencia de Erevos, \`AUTHORS.md\` y cada paquete con el que está hecho Erevos, cada uno con el texto de su licencia: dentro de la app de Android, en la carpeta de las apps de ordenador y Sailfish, y en la app web en \`/NOTICES.txt\`. La licencia en sí está en
[gnu.org](https://www.gnu.org/licenses/agpl-3.0.html).

**Por qué:** una licencia libre te protege solo si puedes leerla. Dice qué puedes hacer con Erevos, y qué te debe
quien lo cambie.

Esta parte también se abre desde **Ajustes** → **General** → **Licencia**.

## Lo que viene {#coming}

El cifrado de extremo a extremo ya está aquí, por el relay y por el enlace de cerca, y la mayor parte de lo que sigue se
construye sobre él.

- **Más formas de seguir en contacto:** los puentes de Tor para donde Tor está bloqueado ya están aquí, ver
  [A través de Tor](#tor). Lo siguiente: Tor en un ordenador.
  - **Radios LoRa (Meshtastic):** ya están aquí, ver [Con una radio LoRa](#lora). Lo siguiente: poner el nombre de la
    radio desde Erevos.
  - [~] **SMS:** Erevos como app de SMS ya está aquí, con fotos por MMS, MMS de grupo y dos SIM, ver [SMS](#sms).
  - [~] **Teléfono:** Erevos como app de teléfono ya está aquí, con su propia pantalla de llamada, ver [Teléfono](#phone).
  - **Email, códigos QR, USB, NFC:** para cuando nada más consigue pasar.
- **Llamadas:** las llamadas de voz y vídeo ya están aquí, y en Android suenan en segundo plano, ver
  [Chatear a través de un relay](#relay), y también un walkie-talkie que funciona incluso por Bluetooth.
- **Grupos:** los chats de grupo, con fotos, archivos y mensajes de voz, y las llamadas de grupo de voz y vídeo ya están
  aquí, ver [Chats de grupo](#groups). Lo siguiente: vídeo con más de cuatro personas, a través de un servidor al que la
  llamada pasa sola, todavía cifrada de extremo a extremo.
- **Traer tus chats:** Telegram y WhatsApp ya entran, con sus fotos y archivos, y Viber con sus palabras, ver
  [Chats importados](#import). Lo siguiente: las fotos y los archivos de Viber.
- **Más sistemas:** grupos públicos y llamadas de grupo también en los dispositivos vinculados; la cuenta, sus llamadas
  y sus grupos ya están en un ordenador, ver [Dispositivos vinculados](#devices). Linux, macOS y Windows ya están aquí,
  ver [En un ordenador](#desktop), el iPhone desde el navegador, ver [En un iPhone](#iphone), y Sailfish OS, ver
  [En Sailfish OS](#sailfish); y también las copias de seguridad, ver [Copias de seguridad](#backup).

## Preguntas {#faq}

### Olvidé mi contraseña.

No hay forma de recuperarla. Erevos no guarda nada que pudiera abrir tus datos sin ella. Solo si el desbloqueo con
[huella o cara](#lock) está activado sigue abriendo el primer espacio: pon ahí una contraseña nueva con
**Cambiar contraseña**.

### Un contacto que está cerca nunca aparece como «Cerca».

- Escríbele: los teléfonos saben cuál es cuál por el primer mensaje que
  llega de cerca. Solo se encuentran contactos, así que añadíos primero.
- Mantén un espacio abierto en los dos teléfonos: Erevos en la pantalla, o en segundo plano con **En segundo plano** en
  **Recibir y sonar**.
- Comprueba que Bluetooth está activado (y, en Android 12 y anteriores, la ubicación), y que Erevos puede encontrar
  dispositivos cercanos (ajustes de Android → Aplicaciones → Erevos → Permisos).
- Acerca los teléfonos. Si uno de ellos no tiene Wi-Fi Aware, se encuentran por Bluetooth, que tarda más en empezar.
- O conecta los dos a una misma Wi-Fi, o al punto de acceso de un teléfono, con **Buscar Erevos en la misma Wi-Fi**
  activado. Algunas Wi-Fi públicas mantienen separados los dispositivos conectados: ahí no puede funcionar. Sin ninguna
  Wi-Fi en común, **Crear una Wi-Fi con teléfonos cercanos** les deja crear una (Android 10 y posteriores); dale hasta
  un minuto o dos.

### No llega nada por LoRa.

- Las dos radios necesitan la misma región y el mismo primer canal (su nombre y su clave) en la app Meshtastic, y estar
  al alcance la una de la otra, o de radios intermedias.
- **Radio LoRa**, en **Ajustes** → **Relay y redes**, debe decir **Conectado**. Si no lo dice, cierra la app
  Meshtastic: una radio se conecta a una sola app a la vez.
- Solo van textos, y solo cuando el relay no está disponible y no hay ningún teléfono cerca.
- En la UE una radio solo puede transmitir cierta cantidad cada hora: tras muchos mensajes, espera.

### No se añadió un código de contacto.

Un contacto de otro relay necesita un enlace con la clave de ese relay, que tienen los enlaces de un {=Erevos} actualizado:
la línea bajo el chat nombra ese relay. Un código de un {=Erevos} más antiguo no tiene claves y se rechaza: pide uno nuevo.

### ¿Puede el relay leer mis mensajes?

No. Los mensajes a través de un relay están cifrados de extremo a extremo, y solo los dos teléfonos tienen las claves.
El relay sigue viendo qué colas se usan, y cuándo y cuánto llega ([Tener tu propio relay](#own-relay)). Comparad el
número de seguridad, como en [Chatear a través de un relay](#relay), para estar seguros de que no hay nadie en medio.
Todavía no se ha auditado nada.

### ¿Por qué Erevos no pide mi número de teléfono?

Porque nada lo necesita. Cada contacto es un par de colas de un solo sentido en el relay, así que ningún servidor tiene
una lista de quién conoce a quién.

### ¿Funciona en un iPhone o en un ordenador?

En un ordenador, sí: Linux, macOS y Windows, ver [En un ordenador](#desktop).
En un iPhone, sí, desde el navegador, como app web, ver [En un iPhone](#iphone).
`;
