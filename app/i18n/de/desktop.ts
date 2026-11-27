// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Das Deutsche für Erevos auf dem Computer, das mit geschlossenem Fenster weiterläuft (lib/desktop.ts,
// components/desktop-background.tsx, Einstellungen → Benachrichtigungen) (i18n/de/index.ts).
export const desktop: Record<string, string> = {
  'Quit Erevos': 'Erevos beenden',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its icon in the system tray.':
    'Erevos läuft mit geschlossenem Fenster weiter: Nachrichten kommen an und Anrufe klingeln. Beenden kannst du es über sein Symbol im Infobereich.',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its menu.':
    'Erevos läuft mit geschlossenem Fenster weiter: Nachrichten kommen an und Anrufe klingeln. Beenden kannst du es über sein Menü.',
  '{n} new message': '{n} neue Nachricht',
  '{n} new messages': '{n} neue Nachrichten',
  'Keep running when closed': 'Geschlossen weiterlaufen',
  'Quit when closed': 'Beim Schließen beenden',
  'When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.':
    'Wenn du sein Fenster schließt, läuft Erevos im Infobereich weiter: Es wartet am Server, ein Anruf klingelt und holt das Fenster zurück, und eine Benachrichtigung sagt, wie viele Nachrichten ungelesen sind, nie von wem oder was. Du öffnest es wieder über sein Symbol dort oder indem du Erevos startest, und beendest es über das Menü dieses Symbols. Wo der Desktop keinen Infobereich zeigt, etwa GNOME ohne eine Erweiterung dafür, holt ein erneuter Start von Erevos das Fenster zurück.',
  'When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.':
    'Wenn du sein Fenster schließt, läuft Erevos im Dock weiter: Es wartet am Server, ein Anruf klingelt und holt das Fenster zurück, und eine Benachrichtigung sagt, wie viele Nachrichten ungelesen sind, nie von wem oder was. Klicke sein Symbol im Dock an, um es wieder zu öffnen, und beende es über sein Menü.',
  'Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.':
    'Das Schließen des Fensters beendet Erevos: Nachrichten warten am Server, bis du es wieder öffnest, und ein Anruf in der Zwischenzeit erscheint als verpasst.',
};
