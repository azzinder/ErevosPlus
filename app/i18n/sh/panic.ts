// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of the panic button (app/panic.tsx, lib/panic.ts) (i18n/sh/index.ts).
export const panic: Record<string, string> = {
  "{app} can now wipe Erevos.": "{app} sada može obrisati Erevos.",
  "That app changed since it asked. Ask again from it.": "Ta aplikacija se promijenila otkako je pitala. Pitajte ponovno iz nje.",
  "Stop trusting {app}": "Prestani vjerovati aplikaciji {app}",
  "{app} will no longer be able to wipe Erevos.": "{app} više neće moći obrisati Erevos.",
  "The automatic backups in {folder} go too.": "Brišu se i automatske rezervne kopije u {folder}.",
  "Wipe everything": "Obriši sve",
  "Everything Erevos keeps here goes now, for good: every space and its hidden chats, contacts, messages and keys. Erevos then starts as if just installed. This cannot be undone.":
    "Sve što Erevos ovdje čuva briše se sada, zauvijek: svaki prostor s njegovim skrivenim razgovorima, kontaktima, porukama i ključevima. Erevos se zatim pokreće kao tek instaliran. To se ne može poništiti.",
  "Wipe": "Obriši",
  "In danger, wipe Erevos at once: every space and its hidden chats, with their contacts, messages, photos, files and keys, the lock, the Matrix, XMPP and Nostr accounts, the server tokens, and the settings and password of automatic backups and of their server.":
    "U opasnosti odmah obrišite Erevos: svaki prostor s njegovim skrivenim razgovorima, s njihovim kontaktima, porukama, fotografijama, datotekama i ključevima, zaključavanje, Matrix, XMPP i Nostr račune, tokene servera te postavke i lozinku automatskih rezervnih kopija i njihovog servera.",
  "What it cannot reach stays: backups you copied elsewhere or sent to a server (their password still guards them), what the server holds for you until it expires, and what your contacts have.":
    "Ono do čega ne može doći ostaje: rezervne kopije koje ste kopirali drugdje ili poslali na server (njihova ih lozinka i dalje štiti), ono što server čuva za vas dok ne istekne, i ono što imaju vaši kontakti.",
  "Wipe now": "Obriši sada",
  "Wipe everything now": "Obriši sve sada",
  "Here Erevos cannot wipe itself: delete its data from the computer instead.": "Ovdje se Erevos ne može sam obrisati: umjesto toga obrišite njegove podatke s računala.",
  "From a panic app": "Iz aplikacije za paniku",
  "A panic app, such as Ripple, wipes the apps you choose with one gesture. Install one, choose Erevos in it, then say yes here. Only the app you say yes to can wipe Erevos, and only while this is on.":
    "Aplikacija za paniku, poput Ripplea, jednim pokretom briše aplikacije koje odaberete. Instalirajte jednu, u njoj odaberite Erevos, a zatim ovdje recite da. Samo aplikacija kojoj kažete da može obrisati Erevos, i to samo dok je ovo uključeno.",
  "{app} asks to be able to wipe Erevos.": "{app} traži da može obrisati Erevos.",
  "Trusted panic app: {app}": "Pouzdana aplikacija za paniku: {app}",
  "Trusted panic app: {app}, no longer installed as it was.": "Pouzdana aplikacija za paniku: {app}, više nije instalirana kao prije.",
  "No panic app yet.": "Još nema aplikacije za paniku.",
  "A panic app may wipe Erevos": "Aplikacija za paniku smije obrisati Erevos",
  "Also the automatic backups in {folder}": "I automatske rezervne kopije u {folder}",
  "This build of Erevos cannot be wiped by a panic app. Update Erevos for it.": "Ovu verziju Erevosa ne može obrisati aplikacija za paniku. Ažurirajte Erevos za to.",
  "Panic button": "Gumb za paniku",
  "Wipe Erevos at once, from here, a panic app or a panic password": "Odmah obrišite Erevos, odavde, iz aplikacije za paniku ili lozinkom za paniku",
  "Erevos cannot wipe itself here.": "Ovdje se Erevos ne može sam obrisati.",
  "Trust {app} as it is now": "Vjeruj aplikaciji {app} ovakvoj kakva je sada",
  "{app} is now signed with another key, so Erevos does not let it wipe. Say yes only if you updated it yourself from where you got it; another app under its name could be the one asking.": "{app} je sada potpisana drugim ključem, pa je Erevos ne pušta da briše. Reci da samo ako si je sam ažurirao odande odakle si je dobio; možda pita neka druga aplikacija pod njenim imenom.",
  "Trust it": "Vjeruj",
  "{app} is not installed.": "{app} nije instalirana.",
  "On {when} {app} asked to wipe Erevos, and Erevos refused: the app is no longer signed as when you trusted it.": "{when} je {app} tražila da obriše Erevos, a Erevos je odbio: aplikacija više nije potpisana kao kad si joj povjerovao.",
  "On {when} {app} asked to wipe Erevos, and Erevos refused: the switch below was off.": "{when} je {app} tražila da obriše Erevos, a Erevos je odbio: prekidač ispod je bio isključen.",
  "Got it": "U redu",
  "{app} is installed but signed with another key, so it cannot wipe Erevos. If you updated it yourself, trust it again as it is now.": "{app} je instalirana, ali potpisana drugim ključem, pa ne može obrisati Erevos. Ako si je sam ažurirao, ponovo joj vjeruj ovakvoj kakva je sada.",
  '{app} is no longer told when Erevos wipes.': '{app} više ne dobija obavijest kad Erevos briše.',
  '{app} is told when Erevos wipes. If it asks, say yes there too.': '{app} dobija obavijest kad Erevos briše. Ako pita, reci da i tamo.',
  'Tell other apps': 'Obavijesti druge aplikacije',
  'As Erevos wipes, from the button, the panic password or a panic app, it can tell the apps you choose here, as a panic app does: Fasouli then locks itself. Each app decides what it does, and asks you first whether Erevos may.': 'Kad Erevos briše, dugmetom, panik lozinkom ili panik aplikacijom, može obavijestiti aplikacije koje ovdje izabereš, kao što to radi panik aplikacija: Fasouli se tada zaključa. Svaka aplikacija sama odlučuje šta radi, i prvo te pita smije li Erevos.',
  "No app on this phone takes a panic app's request.": 'Nijedna aplikacija na ovom telefonu ne prima zahtjev panik aplikacije.',
  "Hold down for the panic button": "Drži pritisnuto za gumb za paniku",
  "Wipe Erevos at once": "Odmah obriši Erevos",
};
