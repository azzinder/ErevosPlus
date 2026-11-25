// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of the panic password (app/panic.tsx), the calculator in place of Erevos
// (components/launcher-icons.tsx), starting when the phone turns on (app/security.tsx), and their
// settings (lib/settings.ts) (i18n/es/index.ts).
export const guard: Record<string, string> = {
  // The panic password.
  "Panic password": "Contraseña de pánico",
  "Set the panic password": "Poner la contraseña de pánico",
  "Turn off the panic password": "Desactivar la contraseña de pánico",
  "Panic password set. Typed on the lock screen, it wipes Erevos.": "Contraseña de pánico puesta. Escrita en la pantalla de bloqueo, borra Erevos.",
  "Typed on the lock screen, it will then be only a wrong password.": "Escrita en la pantalla de bloqueo, pasará a ser solo una contraseña incorrecta.",
  "No panic password now.": "Ya no hay contraseña de pánico.",
  "A password of its own that, typed on the lock screen, wipes Erevos as the button above does. The screen then looks as after a wrong password, and checking it takes as long as any other. It must differ from every password of your spaces.":
    "Una contraseña propia que, escrita en la pantalla de bloqueo, borra Erevos como lo hace el botón de arriba. La pantalla se ve entonces como tras una contraseña incorrecta, y comprobarla tarda lo mismo que cualquier otra. Debe ser distinta de todas las contraseñas de tus espacios.",
  "Erevos keeps nothing that shows whether one is set, so this screen cannot say either. Setting it again replaces the one before.":
    "Erevos no guarda nada que muestre si hay una puesta, así que esta pantalla tampoco puede decirlo. Si la pones de nuevo, sustituye a la anterior.",
  "Typed on the lock screen, it wipes everything Erevos keeps here.": "Escrita en la pantalla de bloqueo, borra todo lo que Erevos guarda aquí.",
  // Starting when the phone turns on.
  "Start when the phone turns on": "Iniciar al encender el teléfono",
  "Wait until I open it": "Esperar a que yo lo abra",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open: the spaces set to say a message came also while another is open already say \"New message\", never which space, nor who or what. Everything else waits for a password, as Erevos keeps no key on the phone. Meanwhile a quiet notice says \"Locked\". Spaces that go through Tor say nothing until a space is open. With no such space, only a quiet notice says it is locked, and a tap on it opens Erevos.":
    "Tras encender el teléfono, o al actualizar Erevos, Erevos se inicia solo, sin ningún espacio abierto: los espacios configurados para avisar de que llegó un mensaje también mientras otro está abierto ya dicen «New message», nunca qué espacio, ni quién o qué. Todo lo demás espera una contraseña, porque Erevos no guarda ninguna clave en el teléfono. Mientras tanto, un aviso discreto dice «Locked». Los espacios que van por Tor no dicen nada hasta que se abre un espacio. Si no hay ningún espacio así, solo un aviso discreto dice que está bloqueado, y al tocarlo se abre Erevos.",
  "After the phone turns on, Erevos waits until you open it.": "Tras encender el teléfono, Erevos espera a que lo abras.",
  // The calculator in place of Erevos.
  "Calculator in place of Erevos": "Calculadora en lugar de Erevos",
  "A calculator that works shows among the phone's apps instead of Erevos's icon. Type your code in it, then =, and Erevos opens, asking for its password as always. Only the icon is hidden: Android's list of apps, the notices and the recent apps still say Erevos.":
    "Una calculadora que funciona aparece entre las apps del teléfono en lugar del icono de Erevos. Escribe en ella tu código, luego =, y Erevos se abre y pide su contraseña como siempre. Solo se oculta el icono: la lista de apps de Android, los avisos y las apps recientes siguen diciendo Erevos.",
  "On: the calculator stands in place of Erevos.": "Activado: la calculadora está en lugar de Erevos.",
  "Change the code": "Cambiar el código",
  "Show Erevos's icon again": "Mostrar de nuevo el icono de Erevos",
  "Put the calculator in its place": "Poner la calculadora en su lugar",
  "Calculator code": "Código de la calculadora",
  "Digits only, 4 to 12 of them. Type them in the calculator, then =.": "Solo dígitos, de 4 a 12. Escríbelos en la calculadora, luego =.",
  "Use digits only, 4 to 12 of them.": "Usa solo dígitos, de 4 a 12.",
  "The calculator could not be set. Try again.": "No se pudo configurar la calculadora. Inténtalo de nuevo.",
  "New code saved.": "Código nuevo guardado.",
  "Done. Within a few seconds Erevos's icon leaves the phone's apps, and the calculator takes its place: open Erevos from it from now on.":
    "Hecho. En unos segundos el icono de Erevos sale de las apps del teléfono y la calculadora ocupa su lugar: a partir de ahora abre Erevos desde ella.",
  "Erevos's icon is back among the phone's apps.": "El icono de Erevos ha vuelto a las apps del teléfono.",
  "Hide Erevos's icon behind a calculator that works": "Ocultar el icono de Erevos tras una calculadora que funciona",
  "Erevos's camera at a tap, behind Erevos's password and the Collection's, as from the Collection. Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "La cámara de Erevos con un toque, tras la contraseña de Erevos y la de la Colección, como desde la Colección. Si mantienes pulsado el icono de Erevos, también ofrece Cámara. Ninguno se muestra mientras la Colección está desactivada o la calculadora ocupa el lugar de Erevos.",
  "Put the Camera among the phone's apps":
    "Poner la Cámara entre las apps del teléfono",
  "Take the Camera off the phone's apps":
    "Quitar la Cámara de las apps del teléfono",
};
