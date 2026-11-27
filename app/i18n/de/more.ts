// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of settings that stand apart: Tor bridges, unlocking with a fingerprint, colors, languages (i18n/de/index.ts).
export const more: Record<string, string> = {
  // Tor bridges (the Tor screen).
  Bridges: 'Brücken',
  'Automatic': 'Automatisch',
  'straight': 'direkt',
  'your own bridges': 'deine eigenen Brücken',
  'Tor is off for this space: messages go straight to the server.': 'Tor ist für diesen Bereich aus: Nachrichten gehen direkt zum Server.',
  'Tor is connected, {how}.': 'Tor ist verbunden, {how}.',
  'Tor is connected.': 'Tor ist verbunden.',
  'Tor cannot connect from this network. Try Automatic, or bridges of your own.': 'Tor kann sich von diesem Netz aus nicht verbinden. Versuche Automatisch oder eigene Brücken.',
  'Erevos tries the ways in turn until Tor connects: straight, then the obfs4 bridges, then Snowflake, then your own bridges, if you have any. It remembers the one that worked on Wi-Fi and on mobile data for 30 days, and tries it first.': 'Erevos versucht die Wege der Reihe nach, bis Tor verbunden ist: direkt, dann die obfs4-Brücken, dann Snowflake, dann deine eigenen Brücken, falls du welche hast. Den Weg, der im WLAN und in mobilen Daten funktioniert hat, merkt es sich 30 Tage und versucht ihn zuerst.',
  'My network is watched': 'Mein Netz wird überwacht',
  'On, Tor never goes straight: whoever watches the network sees only a bridge, never that Tor is used.': 'An, geht Tor nie direkt: Wer das Netz beobachtet, sieht nur eine Brücke, nie, dass Tor benutzt wird.',
  'Trying: {how}…': 'Versuche: {how}…',
  'Connected: {how}.': 'Verbunden: {how}.',
  'No way worked from this network. Add bridges of your own, from bridges.torproject.org.': 'Von diesem Netz aus hat kein Weg funktioniert. Füge eigene Brücken hinzu, von bridges.torproject.org.',
  'Check my connection': 'Meine Verbindung prüfen',
  'No bridges': 'Keine Brücken',
  'My own': 'Eigene',
  'None of these is a bridge Erevos can use, so Tor stays off and messages wait.':
    'Keine davon ist eine Brücke, die Erevos nutzen kann, deshalb bleibt Tor aus und Nachrichten warten.',
  'None of these is a bridge Erevos can use, so Tor stays off and messages go straight.':
    'Keine davon ist eine Brücke, die Erevos nutzen kann, deshalb bleibt Tor aus und Nachrichten gehen direkt.',
  'Tor goes straight to its relays. Where Tor is blocked, choose bridges: Tor then reaches its network only through them.':
    'Tor geht direkt zu seinen Relais. Wo Tor gesperrt ist, wähle Brücken: Dann erreicht Tor sein Netzwerk nur über sie.',
  'The obfs4 bridges Tor Browser comes with: to whoever watches the network, Tor looks like random bytes. Where a censor blocks these too, choose Snowflake or bridges of your own.':
    'Die obfs4-Brücken, die der Tor Browser mitbringt: Für jemanden, der das Netzwerk beobachtet, sieht Tor wie zufällige Bytes aus. Wo ein Zensor auch diese sperrt, wähle Snowflake oder eigene Brücken.',
  "Snowflake goes through volunteers' browsers, over WebRTC, the way a video call does. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block.":
    'Snowflake läuft über die Browser von Freiwilligen, per WebRTC, so wie ein Videoanruf. Um einen zu finden, fragt Erevos den Broker von Snowflake über ein CDN, hinter dem Namen einer anderen Website, und STUN-Server nennen dem Telefon seine eigene Adresse: Sie sehen diese Adresse, nie deine Nachrichten. Langsamer, und schwer zu sperren.',
  'Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, one per line. obfs4, Snowflake, WebTunnel, meek and plain bridges work.':
    'Brückenzeilen von bridges.torproject.org, per E-Mail von bridges@torproject.org oder von @GetBridgesBot auf Telegram, eine pro Zeile. obfs4, Snowflake, WebTunnel, meek und einfache Brücken funktionieren.',
  'Bridge lines': 'Brückenzeilen',
  'Not a bridge line Erevos can use: {line}': 'Keine Brückenzeile, die Erevos nutzen kann: {line}',
  '{n} bridge': '{n} Brücke',
  '{n} bridges': '{n} Brücken',
  'Use these bridges': 'Diese Brücken nutzen',
  'Not in use until you tap Use these bridges.': 'Nicht in Gebrauch, bis du auf „Diese Brücken nutzen“ tippst.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages wait. Bridges count only while Tor is on.':
    'Mit Brücken geht Tor nie direkt zu seinen Relais: Wenn keine Brücke antwortet, warten die Nachrichten. Brücken gelten nur, solange Tor an ist.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages go to the server without Tor until one does.':
    'Mit Brücken geht Tor nie direkt zu seinen Relais: Wenn keine Brücke antwortet, gehen die Nachrichten ohne Tor an den Server, bis eine antwortet.',

  // Updates on Windows, and on every computer: the file to take.
  'The download page opens: take {file}, see User guide → Updates.': 'Die Download-Seite öffnet sich: Nimm {file}, siehe „Anleitung → Updates“.',

  // Material You: the phone's own colors (Appearance).
  "Material You takes no glass: its colors are the phone's own.": 'Material You hat kein Glas: Seine Farben sind die des Telefons.',
  "Your phone's own colors, which Android makes from its wallpaper: a new wallpaper changes them here too.":
    'Die eigenen Farben deines Telefons, die Android aus seinem Hintergrundbild macht: Ein neues Hintergrundbild ändert sie auch hier.',
  "Material You takes the phone's own colors, on Android 12 and later. Here it shows in Classic's.":
    'Material You übernimmt die Farben des Telefons, ab Android 12. Hier erscheint es in denen von Classic.',

  // Unlocking with a fingerprint or face (Lock, and the password screen).
  'Fingerprint or face': 'Fingerabdruck oder Gesicht',
  'On: Erevos opens with your fingerprint or face too. The password always works.':
    'An: Erevos öffnet sich auch mit deinem Fingerabdruck oder Gesicht. Das Passwort funktioniert immer.',
  'Open Erevos with your fingerprint or face instead of typing the password. The password always works too.':
    'Öffne Erevos mit deinem Fingerabdruck oder Gesicht, statt das Passwort einzugeben. Das Passwort funktioniert weiterhin immer.',
  'It opens only what your first password opens, never the space of a second password or hidden chats. Someone who holds you can press your finger to the phone: if that may happen, keep it off.':
    'Es öffnet nur, was dein erstes Passwort öffnet, nie den Bereich eines zweiten Passworts oder versteckte Chats. Wer dich festhält, kann deinen Finger auf das Telefon drücken: Wenn das passieren kann, lass es aus.',
  'Fingerprint or face for Erevos': 'Fingerabdruck oder Gesicht für Erevos',
  'Erevos opens with your fingerprint or face too.': 'Erevos öffnet sich jetzt auch mit deinem Fingerabdruck oder Gesicht.',
  'Unlock Erevos': 'Erevos entsperren',
  'Use password': 'Passwort verwenden',
  'Unlocking with a fingerprint or face stopped working, so it is off now. Type your password, and turn it on again in Lock.':
    'Das Entsperren mit Fingerabdruck oder Gesicht funktioniert nicht mehr, deshalb ist es jetzt aus. Gib dein Passwort ein und schalte es unter „Sperre“ wieder ein.',
};
