// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of starting with a server of one's own, or none, and of a web folder of one's own for the models (components/own-server.tsx, components/models-server.tsx, app/chat.tsx, app/first-steps.tsx) (i18n/es/index.ts).
export const ownServerText: Record<string, string> = {
  "That is not a server address. Type it as you were given it, such as relay.example.org.": "Eso no es una dirección de servidor. Escríbela como te la dieron, por ejemplo relay.example.org.",
  "You are in, with the server at {server}. Now add your contacts: by their invite, or by the contact link or QR code they give you.": "Ya estás dentro, con el servidor {server}. Ahora añade a tus contactos: con su invitación, o con el enlace de contacto o el código QR que te den.",
  "Erevos could not connect to {server}: {error}. Check the address and the code, and that the server is running.": "Erevos no pudo conectarse a {server}: {error}. Revisa la dirección y el código, y que el servidor esté en marcha.",
  "I have no invite": "No tengo invitación",
  "My account is at another server…": "Mi cuenta está en otro servidor…",
  "Start without a server": "Empezar sin servidor",
  "With an account at a server such as LPHL, with a server of your own, or with no server at all. The next screen says what each one means.": "Con una cuenta en un servidor como LPHL, con un servidor propio o sin ningún servidor. La pantalla siguiente explica qué significa cada opción.",
  "That is not a web address. Type the folder as you were given it, such as cloud.example.org/erevos-models.": "Eso no es una dirección web. Escribe la carpeta como te la dieron, por ejemplo cloud.example.org/erevos-models.",
  "Download from another server…": "Descargar de otro servidor…",
  "Back to the usual server": "Volver al servidor habitual",
  "Web folder with the models": "Carpeta web con los modelos",
  "A web folder, yours or your group’s, that holds the same files under the same names. Erevos checks every file after the download and refuses one that was changed. That server, not {host}, then sees your IP address.": "Una carpeta web, tuya o de tu grupo, que tiene los mismos archivos con los mismos nombres. Erevos comprueba cada archivo tras la descarga y rechaza el que haya cambiado. Entonces tu dirección IP la ve ese servidor, no {host}.",
  "Where your messages wait": "Dónde esperan tus mensajes",
  "A server (Erevos calls it a relay) keeps your messages, encrypted, until the other phone takes them. It cannot read them. Choose how to start: you can change it any time, here.": "Un servidor (Erevos lo llama relay) guarda tus mensajes, cifrados, hasta que el otro teléfono los recoge. No puede leerlos. Elige cómo empezar: puedes cambiarlo cuando quieras, aquí.",
  "If you have neither an account nor a server, start without a server: it needs nothing, and you can add one later.": "Si no tienes ni cuenta ni servidor, empieza sin servidor: no hace falta nada, y puedes añadir uno más tarde.",
  "I have a server of my own": "Tengo un servidor propio",
  "Yours, or one of your family, group or workplace. You type its address and the code you were given.": "Tuyo, o de tu familia, tu grupo o tu trabajo. Escribes su dirección y el código que te dieron.",
  "Server address": "Dirección del servidor",
  "Code (if the server has one)": "Código (si el servidor tiene uno)",
  "Whoever set up the server gives you both; there they are called the relay address and the token. Calls, photos and files then go through that server too. To set one up yourself, see Running your own relay in the user guide.": "Las dos cosas te las da quien montó el servidor; allí se llaman dirección del relay y token. Las llamadas, las fotos y los archivos pasan entonces también por ese servidor. Para montar uno tú, mira «Tener tu propio relay» en la guía de uso.",
};
