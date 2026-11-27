// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Srpskohrvatski za Erevos na računaru, koji radi i sa zatvorenim prozorom (lib/desktop.ts,
// components/desktop-background.tsx, Postavke → Obavijesti) (i18n/sh/index.ts).
export const desktop: Record<string, string> = {
  'Quit Erevos': 'Izađi iz Erevosa',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its icon in the system tray.':
    'Erevos radi i dalje sa zatvorenim prozorom: poruke stižu i pozivi zvone. Iz njega izađite preko njegove ikone u sistemskoj traci.',
  'Erevos keeps running with its window closed: messages come and calls ring. Quit it from its menu.':
    'Erevos radi i dalje sa zatvorenim prozorom: poruke stižu i pozivi zvone. Iz njega izađite preko njegovog menija.',
  '{n} new message': '{n} nova poruka',
  '{n} new messages': '{n} nova poruka | {n} nove poruke | {n} novih poruka',
  'Keep running when closed': 'Radi i kad je zatvoren',
  'Quit when closed': 'Izađi pri zatvaranju',
  'When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.':
    'Kad zatvorite njegov prozor, Erevos radi i dalje u sistemskoj traci: čeka na serveru, poziv zvoni i vraća prozor, a obavijest kaže koliko poruka nije pročitano, nikad od koga ni šta. Ponovo ga otvarate preko njegove ikone tamo, ili pokretanjem Erevosa, a izlazite iz njega preko menija te ikone. Gdje radna površina ne prikazuje sistemsku traku, kao GNOME bez proširenja za to, ponovno pokretanje Erevosa vraća prozor.',
  'When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.':
    'Kad zatvorite njegov prozor, Erevos radi i dalje u Docku: čeka na serveru, poziv zvoni i vraća prozor, a obavijest kaže koliko poruka nije pročitano, nikad od koga ni šta. Kliknite njegovu ikonu u Docku da ga ponovo otvorite, a izađite iz njega preko njegovog menija.',
  'Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.':
    'Zatvaranje prozora zatvara Erevos: poruke čekaju na serveru dok ga ponovo ne otvorite, a poziv koji je stigao u međuvremenu prikazuje se kao propušten.',
};
