// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of settings that stand apart: Tor bridges, unlocking with a fingerprint, colors, languages (i18n/sh/index.ts).
export const more: Record<string, string> = {
  // Tor bridges (the Tor screen).
  Bridges: 'Mostovi',
  'Automatic': 'Automatski',
  'straight': 'direktno',
  'your own bridges': 'vaši mostovi',
  'Tor is off for this space: messages go straight to the server.': 'Tor je isključen za ovaj prostor: poruke idu direktno na server.',
  'Tor is connected, {how}.': 'Tor je povezan, {how}.',
  'Tor is connected.': 'Tor je povezan.',
  'Tor cannot connect from this network. Try Automatic, or bridges of your own.': 'Tor se ne može povezati s ove mreže. Probajte Automatski, ili svoje mostove.',
  'Erevos tries the ways in turn until Tor connects: straight, then the obfs4 bridges, then Snowflake, then your own bridges, if you have any. It remembers the one that worked on Wi-Fi and on mobile data for 30 days, and tries it first.': 'Erevos redom pokušava načine dok se Tor ne poveže: direktno, zatim obfs4 mostove, zatim Snowflake, zatim vaše mostove, ako ih imate. Pamti 30 dana onaj koji je radio na Wi-Fi mreži i na mobilnim podacima, i njega prvo pokušava.',
  'My network is watched': 'Moja mreža je pod nadzorom',
  'On, Tor never goes straight: whoever watches the network sees only a bridge, never that Tor is used.': 'Uključeno, Tor nikad ne ide direktno: ko nadzire mrežu vidi samo most, nikad da se koristi Tor.',
  'Trying: {how}…': 'Pokušavam: {how}…',
  'Connected: {how}.': 'Povezano: {how}.',
  'No way worked from this network. Add bridges of your own, from bridges.torproject.org.': 'Nijedan način nije radio s ove mreže. Dodajte svoje mostove, sa bridges.torproject.org.',
  'Check my connection': 'Provjeri moju vezu',
  'No bridges': 'Bez mostova',
  'My own': 'Vlastiti',
  'None of these is a bridge Erevos can use, so Tor stays off and messages wait.':
    'Nijedan od ovih nije most koji Erevos može koristiti, pa Tor ostaje isključen, a poruke čekaju.',
  'None of these is a bridge Erevos can use, so Tor stays off and messages go straight.':
    'Nijedan od ovih nije most koji Erevos može koristiti, pa Tor ostaje isključen, a poruke idu direktno.',
  'Tor goes straight to its relays. Where Tor is blocked, choose bridges: Tor then reaches its network only through them.':
    'Tor se spaja direktno na svoje relaye. Gdje je Tor blokiran, izaberite mostove: Tor tada do svoje mreže dolazi samo preko njih.',
  'The obfs4 bridges Tor Browser comes with: to whoever watches the network, Tor looks like random bytes. Where a censor blocks these too, choose Snowflake or bridges of your own.':
    'Mostovi obfs4 koji dolaze uz Tor Browser: Tor onome koji prati mrežu izgleda kao nasumični bajtovi. Gdje cenzor blokira i njih, izaberite Snowflake ili vlastite mostove.',
  "Snowflake goes through volunteers' browsers, over WebRTC, the way a video call does. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block.":
    'Snowflake ide preko preglednika dobrovoljaca, putem WebRTC-a, kao i videopoziv. Da bi pronašao jednog, Erevos pita broker Snowflakea preko CDN-a, iza imena neke druge stranice, a STUN serveri telefonu kažu njegovu adresu: oni vide tu adresu, nikad vaše poruke. Sporije je, a teško se blokira.',
  'Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, one per line. obfs4, Snowflake, WebTunnel, meek and plain bridges work.':
    'Redovi mostova sa stranice bridges.torproject.org, e-poštom s adrese bridges@torproject.org ili od bota @GetBridgesBot na Telegramu, po jedan u svakom redu. Rade obfs4, Snowflake, WebTunnel, meek i obični mostovi.',
  'Bridge lines': 'Redovi mostova',
  'Not a bridge line Erevos can use: {line}': 'To nije red mosta koji Erevos može koristiti: {line}',
  '{n} bridge': '{n} most',
  '{n} bridges': '{n} most | {n} mosta | {n} mostova',
  'Use these bridges': 'Koristi ove mostove',
  'Not in use until you tap Use these bridges.': 'Ne koriste se dok ne dodirnete „Koristi ove mostove“.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages wait. Bridges count only while Tor is on.':
    'S mostovima Tor nikad ne ide direktno na svoje relaye: kad nijedan most ne odgovara, poruke čekaju. Mostovi vrijede samo dok je Tor uključen.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages go to the server without Tor until one does.':
    'S mostovima Tor nikad ne ide direktno na svoje relaye: kad nijedan most ne odgovara, poruke idu serveru bez Tora dok neki ne odgovori.',

  // Updates on Windows, and on every computer: the file to take.
  'The download page opens: take {file}, see User guide → Updates.': 'Otvara se stranica za preuzimanje: preuzmite {file}, pogledajte „Korisnički vodič → Updates“.',

  // Material You: the phone's own colors (Appearance).
  "Material You takes no glass: its colors are the phone's own.": 'Material You nema staklo: njegove boje su boje samog telefona.',
  "Your phone's own colors, which Android makes from its wallpaper: a new wallpaper changes them here too.":
    'Boje vašeg telefona, koje Android stvara iz pozadine: nova pozadina mijenja ih i ovdje.',
  "Material You takes the phone's own colors, on Android 12 and later. Here it shows in Classic's.":
    'Material You uzima boje samog telefona, na Androidu 12 i novijim. Ovdje se prikazuje u bojama stila Classic.',

  // Unlocking with a fingerprint or face (Lock, and the password screen).
  'Fingerprint or face': 'Otisak prsta ili lice',
  'On: Erevos opens with your fingerprint or face too. The password always works.':
    'Uključeno: Erevos se otvara i otiskom prsta ili licem. Lozinka uvijek radi.',
  'Open Erevos with your fingerprint or face instead of typing the password. The password always works too.':
    'Otvarajte Erevos otiskom prsta ili licem umjesto da upisujete lozinku. Lozinka i dalje uvijek radi.',
  'It opens only what your first password opens, never the space of a second password or hidden chats. Someone who holds you can press your finger to the phone: if that may happen, keep it off.':
    'Otvara samo ono što otvara vaša prva lozinka, nikad prostor druge lozinke ni skrivene razgovore. Osoba koja vas zadrži može vam prisloniti prst na telefon: ako se to može dogoditi, ostavite ovo isključeno.',
  'Fingerprint or face for Erevos': 'Otisak prsta ili lice za Erevos',
  'Erevos opens with your fingerprint or face too.': 'Erevos se otvara i otiskom prsta ili licem.',
  'Unlock Erevos': 'Otključaj Erevos',
  'Use password': 'Koristi lozinku',
  'Unlocking with a fingerprint or face stopped working, so it is off now. Type your password, and turn it on again in Lock.':
    'Otključavanje otiskom prsta ili licem prestalo je raditi, pa je sada isključeno. Upišite lozinku i ponovo ga uključite u „Zaključavanje“.',
};
