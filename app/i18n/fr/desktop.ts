// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Le français d’Erevos sur l’ordinateur, qui continue de tourner fenêtre fermée (lib/desktop.ts,
// components/desktop-background.tsx, Réglages → Notifications) (i18n/fr/index.ts).
export const desktop: Record<string, string> = {
  'Quit Erevos': 'Quitter Erevos',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its icon in the system tray.':
    'Erevos continue de tourner fenêtre fermée : les messages arrivent et les appels sonnent. Pour le quitter, passe par son icône dans la zone de notification.',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its menu.':
    'Erevos continue de tourner fenêtre fermée : les messages arrivent et les appels sonnent. Pour le quitter, passe par son menu.',
  '{n} new message': '{n} nouveau message',
  '{n} new messages': '{n} nouveaux messages',
  'Keep running when closed': 'Continuer fenêtre fermée',
  'Quit when closed': 'Quitter à la fermeture',
  'When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.':
    'Quand tu fermes sa fenêtre, Erevos continue de tourner dans la zone de notification : il attend au serveur, un appel sonne et fait revenir la fenêtre, et une notification dit combien de messages ne sont pas lus, jamais de qui ni quoi. Tu le rouvres depuis son icône à cet endroit, ou en lançant Erevos, et tu le quittes depuis le menu de cette icône. Là où le bureau n’affiche pas de zone de notification, comme GNOME sans extension pour cela, relancer Erevos fait revenir la fenêtre.',
  'When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.':
    'Quand tu fermes sa fenêtre, Erevos continue de tourner dans le Dock : il attend au serveur, un appel sonne et fait revenir la fenêtre, et une notification dit combien de messages ne sont pas lus, jamais de qui ni quoi. Clique sur son icône dans le Dock pour le rouvrir, et quitte-le depuis son menu.',
  'Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.':
    'Fermer sa fenêtre quitte Erevos : les messages attendent au serveur jusqu’à ce que tu le rouvres, et un appel arrivé entre-temps s’affiche comme manqué.',
};
