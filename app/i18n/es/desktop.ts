// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// El español de Erevos en el ordenador, que sigue funcionando con la ventana cerrada (lib/desktop.ts,
// components/desktop-background.tsx, Ajustes → Notificaciones) (i18n/es/index.ts).
export const desktop: Record<string, string> = {
  'Quit Erevos': 'Salir de Erevos',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its icon in the system tray.':
    'Erevos sigue funcionando con su ventana cerrada: llegan los mensajes y suenan las llamadas. Para salir, usa su icono en la bandeja del sistema.',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its menu.':
    'Erevos sigue funcionando con su ventana cerrada: llegan los mensajes y suenan las llamadas. Para salir, usa su menú.',
  '{n} new message': '{n} mensaje nuevo',
  '{n} new messages': '{n} mensajes nuevos',
  'Keep running when closed': 'Seguir con la ventana cerrada',
  'Quit when closed': 'Salir al cerrar',
  'When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.':
    'Cuando cierras su ventana, Erevos sigue funcionando en la bandeja del sistema: espera en el servidor, una llamada suena y trae de vuelta la ventana, y una notificación dice cuántos mensajes no se han leído, nunca de quién ni qué. Lo vuelves a abrir desde su icono allí, o iniciando Erevos, y sales desde el menú de ese icono. Donde el escritorio no muestra bandeja, como GNOME sin una extensión para ello, iniciar Erevos de nuevo trae de vuelta la ventana.',
  'When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.':
    'Cuando cierras su ventana, Erevos sigue funcionando en el Dock: espera en el servidor, una llamada suena y trae de vuelta la ventana, y una notificación dice cuántos mensajes no se han leído, nunca de quién ni qué. Haz clic en su icono del Dock para volver a abrirlo, y sal desde su menú.',
  'Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.':
    'Cerrar su ventana cierra Erevos: los mensajes esperan en el servidor hasta que lo vuelvas a abrir, y una llamada que entró mientras tanto aparece como perdida.',
};
