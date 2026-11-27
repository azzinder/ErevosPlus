// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// L'italiano di Erevos sul computer, che continua a funzionare con la finestra chiusa (lib/desktop.ts,
// components/desktop-background.tsx, Impostazioni → Notifiche) (i18n/it/index.ts).
export const desktop: Record<string, string> = {
  'Quit Erevos': 'Esci da Erevos',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its icon in the system tray.':
    'Erevos continua a funzionare con la finestra chiusa: i messaggi arrivano e le chiamate squillano. Per uscire, usa la sua icona nell’area di notifica.',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its menu.':
    'Erevos continua a funzionare con la finestra chiusa: i messaggi arrivano e le chiamate squillano. Per uscire, usa il suo menu.',
  '{n} new message': '{n} nuovo messaggio',
  '{n} new messages': '{n} nuovi messaggi',
  'Keep running when closed': 'Continua a finestra chiusa',
  'Quit when closed': 'Esci alla chiusura',
  'When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.':
    'Quando chiudi la sua finestra, Erevos continua a funzionare nell’area di notifica: attende sul server, una chiamata squilla e riporta la finestra, e una notifica dice quanti messaggi non sono letti, mai chi né cosa. Lo riapri dalla sua icona lì, o avviando Erevos, e ne esci dal menu di quell’icona. Dove il desktop non mostra l’area di notifica, come GNOME senza un’estensione apposita, avviare di nuovo Erevos riporta la finestra.',
  'When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.':
    'Quando chiudi la sua finestra, Erevos continua a funzionare nel Dock: attende sul server, una chiamata squilla e riporta la finestra, e una notifica dice quanti messaggi non sono letti, mai chi né cosa. Fai clic sulla sua icona nel Dock per riaprirlo, ed esci dal suo menu.',
  'Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.':
    'Chiudere la sua finestra chiude Erevos: i messaggi aspettano sul server finché non lo riapri, e una chiamata arrivata nel frattempo compare come persa.',
};
