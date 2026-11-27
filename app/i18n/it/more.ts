// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of settings that stand apart: Tor bridges, unlocking with a fingerprint, colors, languages (i18n/it/index.ts).
export const more: Record<string, string> = {
  // Tor bridges (the Tor screen).
  Bridges: 'Bridge',
  'Automatic': 'Automatico',
  'straight': 'diretto',
  'your own bridges': 'i tuoi bridge',
  'Tor is off for this space: messages go straight to the server.': 'Tor è spento per questo spazio: i messaggi vanno diretti al server.',
  'Tor is connected, {how}.': 'Tor è connesso, {how}.',
  'Tor is connected.': 'Tor è connesso.',
  'Tor cannot connect from this network. Try Automatic, or bridges of your own.': 'Tor non riesce a connettersi da questa rete. Prova Automatico, o bridge tuoi.',
  'Erevos tries the ways in turn until Tor connects: straight, then the obfs4 bridges, then Snowflake, then your own bridges, if you have any. It remembers the one that worked on Wi-Fi and on mobile data for 30 days, and tries it first.': 'Erevos prova i modi uno alla volta finché Tor si connette: diretto, poi i bridge obfs4, poi Snowflake, poi i tuoi bridge, se ne hai. Ricorda per 30 giorni quello che ha funzionato su Wi-Fi e su dati mobili, e lo prova per primo.',
  'My network is watched': 'La mia rete è sorvegliata',
  'On, Tor never goes straight: whoever watches the network sees only a bridge, never that Tor is used.': 'Attivo, Tor non va mai diretto: chi sorveglia la rete vede solo un bridge, mai che si usa Tor.',
  'Trying: {how}…': 'Provo: {how}…',
  'Connected: {how}.': 'Connesso: {how}.',
  'No way worked from this network. Add bridges of your own, from bridges.torproject.org.': 'Nessun modo ha funzionato da questa rete. Aggiungi bridge tuoi, da bridges.torproject.org.',
  'Check my connection': 'Controlla la mia connessione',
  'No bridges': 'Nessun bridge',
  'My own': 'I miei',
  'None of these is a bridge Erevos can use, so Tor stays off and messages wait.':
    'Nessuna di queste righe è un bridge utilizzabile da Erevos, quindi Tor resta disattivato e i messaggi aspettano.',
  'None of these is a bridge Erevos can use, so Tor stays off and messages go straight.':
    'Nessuna di queste righe è un bridge utilizzabile da Erevos, quindi Tor resta disattivato e i messaggi vanno direttamente.',
  'Tor goes straight to its relays. Where Tor is blocked, choose bridges: Tor then reaches its network only through them.':
    'Tor si collega direttamente ai suoi nodi. Dove Tor è bloccato, scegli dei bridge: Tor raggiungerà allora la sua rete solo attraverso di loro.',
  'The obfs4 bridges Tor Browser comes with: to whoever watches the network, Tor looks like random bytes. Where a censor blocks these too, choose Snowflake or bridges of your own.':
    'I bridge obfs4 inclusi in Tor Browser: per chi osserva la rete, Tor sembra una sequenza di byte casuali. Dove la censura blocca anche questi, scegli Snowflake o dei bridge tuoi.',
  "Snowflake goes through volunteers' browsers, over WebRTC, the way a video call does. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block.":
    'Snowflake passa dai browser di volontari, tramite WebRTC, come una videochiamata. Per trovarne uno, Erevos interpella il broker di Snowflake attraverso una CDN, dietro il nome di un altro sito, e dei server STUN comunicano al telefono il suo indirizzo: vedono quell’indirizzo, mai i tuoi messaggi. Più lento, e difficile da bloccare.',
  'Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, one per line. obfs4, Snowflake, WebTunnel, meek and plain bridges work.':
    'Righe di bridge da bridges.torproject.org, da bridges@torproject.org via email, o da @GetBridgesBot su Telegram, una per riga. Funzionano obfs4, Snowflake, WebTunnel, meek e i bridge semplici.',
  'Bridge lines': 'Righe dei bridge',
  'Not a bridge line Erevos can use: {line}': 'Non è una riga di bridge utilizzabile da Erevos: {line}',
  '{n} bridge': '{n} bridge',
  '{n} bridges': '{n} bridge',
  'Use these bridges': 'Usa questi bridge',
  'Not in use until you tap Use these bridges.': 'Non vengono usati finché non tocchi «Usa questi bridge».',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages wait. Bridges count only while Tor is on.':
    'Con i bridge, Tor non si collega mai direttamente ai suoi nodi: quando nessun bridge risponde, i messaggi aspettano. I bridge valgono solo mentre Tor è attivo.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages go to the server without Tor until one does.':
    'Con i bridge, Tor non si collega mai direttamente ai suoi nodi: quando nessun bridge risponde, i messaggi vanno al server senza Tor finché uno non risponde.',

  // Updates on Windows, and on every computer: the file to take.
  'The download page opens: take {file}, see User guide → Updates.': 'Si apre la pagina di download: prendi {file}, vedi «Guida → Aggiornamenti».',

  // Material You: the phone's own colors (Appearance).
  "Material You takes no glass: its colors are the phone's own.": 'Material You non usa il vetro: i suoi colori sono quelli del telefono.',
  "Your phone's own colors, which Android makes from its wallpaper: a new wallpaper changes them here too.":
    'I colori del tuo telefono, che Android ricava dal suo sfondo: un nuovo sfondo li cambia anche qui.',
  "Material You takes the phone's own colors, on Android 12 and later. Here it shows in Classic's.":
    'Material You prende i colori del telefono, su Android 12 e versioni successive. Qui appare con quelli di Classic.',

  // Unlocking with a fingerprint or face (Lock, and the password screen).
  'Fingerprint or face': 'Impronta o volto',
  'On: Erevos opens with your fingerprint or face too. The password always works.':
    'Attivo: Erevos si apre anche con la tua impronta o il tuo volto. La password funziona sempre.',
  'Open Erevos with your fingerprint or face instead of typing the password. The password always works too.':
    'Apri Erevos con la tua impronta o il tuo volto invece di inserire la password. Anche la password funziona sempre.',
  'It opens only what your first password opens, never the space of a second password or hidden chats. Someone who holds you can press your finger to the phone: if that may happen, keep it off.':
    'Apre solo quello che apre la tua prima password, mai lo spazio di una seconda password o le chat nascoste. Chi ti trattiene può premere il tuo dito sul telefono: se può succedere, lascialo disattivato.',
  'Fingerprint or face for Erevos': 'Impronta o volto per Erevos',
  'Erevos opens with your fingerprint or face too.': 'Ora Erevos si apre anche con la tua impronta o il tuo volto.',
  'Unlock Erevos': 'Sblocca Erevos',
  'Use password': 'Usa la password',
  'Unlocking with a fingerprint or face stopped working, so it is off now. Type your password, and turn it on again in Lock.':
    'Lo sblocco con impronta o volto ha smesso di funzionare, quindi ora è disattivato. Inserisci la password, e riattivalo in «Blocco».',
};
