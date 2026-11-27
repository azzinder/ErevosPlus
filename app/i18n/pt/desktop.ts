// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// O português do Erevos no computador, que continua rodando com a janela fechada (lib/desktop.ts,
// components/desktop-background.tsx, Configurações → Notificações) (i18n/pt/index.ts).
export const desktop: Record<string, string> = {
  'Quit Erevos': 'Sair do Erevos',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its icon in the system tray.':
    'O Erevos continua rodando com a janela fechada: as mensagens chegam e as chamadas tocam. Para sair, use o ícone dele na bandeja do sistema.',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its menu.':
    'O Erevos continua rodando com a janela fechada: as mensagens chegam e as chamadas tocam. Para sair, use o menu dele.',
  '{n} new message': '{n} nova mensagem',
  '{n} new messages': '{n} novas mensagens',
  'Keep running when closed': 'Continuar com a janela fechada',
  'Quit when closed': 'Sair ao fechar',
  'When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.':
    'Quando você fecha a janela dele, o Erevos continua rodando na bandeja do sistema: espera no servidor, uma chamada toca e traz a janela de volta, e uma notificação diz quantas mensagens não foram lidas, nunca de quem nem o quê. Você o abre de novo pelo ícone dele ali, ou iniciando o Erevos, e sai pelo menu desse ícone. Onde a área de trabalho não mostra bandeja, como o GNOME sem uma extensão para isso, iniciar o Erevos de novo traz a janela de volta.',
  'When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.':
    'Quando você fecha a janela dele, o Erevos continua rodando no Dock: espera no servidor, uma chamada toca e traz a janela de volta, e uma notificação diz quantas mensagens não foram lidas, nunca de quem nem o quê. Clique no ícone dele no Dock para abri-lo de novo, e saia pelo menu dele.',
  'Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.':
    'Fechar a janela dele encerra o Erevos: as mensagens esperam no servidor até você abri-lo de novo, e uma chamada que chegou nesse meio-tempo aparece como perdida.',
};
