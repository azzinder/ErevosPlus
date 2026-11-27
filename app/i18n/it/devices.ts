// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of linked devices: the account on the phone and on a computer (lib/devices.ts, app/devices.tsx; i18n/it/index.ts).
export const devices: Record<string, string> = {
  // Linking and the links (lib/devices.ts).
  Computer: 'Computer',
  'Linked devices could not open.': 'Impossibile aprire i dispositivi collegati.',
  'That device is linked already.': 'Quel dispositivo è già collegato.',
  'That is not a code from Linked devices.': 'Questo non è un codice di «Dispositivi collegati».',
  'The code changed. Compare it again.': 'Il codice è cambiato. Confrontalo di nuovo.',
  'This device is no longer linked to a phone.': 'Questo dispositivo non è più collegato a un telefono.',
  'This is a linked device. Link from the phone that holds the account.': 'Questo è un dispositivo collegato. Collega dal telefono che ha l’account.',
  'This space has chats of its own. Link from a space with none, such as one that opens with a new password.':
    'Questo spazio ha già delle chat sue. Collega da uno spazio senza chat, come uno che si apre con una nuova password.',
  'This space is linked already.': 'Questo spazio è già collegato.',
  'These hidden chats are linked already.': 'Queste chat nascoste sono già collegate.',
  'These hidden chats have chats of their own. Link from hidden chats with none, such as those a new PIN sets.':
    'Queste chat nascoste hanno chat proprie. Collega da chat nascoste senza chat, come quelle che apre un nuovo PIN.',
  'Too long to go through the phone.': 'Troppo lungo per passare dal telefono.',
  'Type the server address in Server first: linked devices reach this phone through it.':
    'Scrivi prima l’indirizzo del server in «Server»: i dispositivi collegati raggiungono questo telefono tramite il server.',
  '{n} devices are linked already, the most there can be.': 'Sono già collegati {n} dispositivi, il massimo possibile.',

  // The menu, and the chat on a linked device (app/index.tsx, app/chat.tsx).
  'Linked devices': 'Dispositivi collegati',
  'Not sent by the phone': 'Non inviato dal telefono',
  'These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.':
    'Queste chat vengono dal backup di un dispositivo collegato: puoi leggerle qui, ma non scriverci. Per scrivere, collega di nuovo questo dispositivo al telefono, in Dispositivi collegati.',
  'This account on a computer or in a browser too': 'Questo account anche su un computer o in un browser',
  "This chat is the phone's: move it into hidden chats there.": 'Questa chat è del telefono: spostala nelle chat nascoste da lì.',
  'These hidden chats are linked to a phone: move the chat into them there.':
    'Queste chat nascoste sono collegate a un telefono: sposta la chat in esse da lì.',
  "This chat is the phone's: move it out of the hidden chats there.": 'Questa chat è del telefono: toglila dalle chat nascoste da lì.',

  // A call answered on another device of the account (components/call-screen.tsx, lib/call-lines.ts).
  'Answered on another device': 'Risposto su un altro dispositivo',
  'answered on another device': 'risposto su un altro dispositivo',

  // Linked devices (app/devices.tsx).
  'All of it': 'Tutti',
  'The last month': 'L’ultimo mese',
  'The last week': 'L’ultima settimana',
  None: 'Nessuno',
  'Web browser': 'Browser',
  'Code copied. Paste it on the phone in Settings → Data and devices → Linked devices.': 'Codice copiato. Incollalo sul telefono in «Impostazioni → Dati e dispositivi → Dispositivi collegati».',
  'Code copied. Paste it on the phone, in Linked devices of the same hidden chats.':
    'Codice copiato. Incollalo sul telefono, in «Dispositivi collegati» delle stesse chat nascoste.',
  'Linked. The chats come from the phone, and with them the messages it chose to bring over.':
    'Collegato. Le chat arrivano dal telefono, e con loro i messaggi che ha scelto di trasferire.',
  'Not linked. Someone else may have read the code. Make a new one, and link again.':
    'Non collegato. Qualcun altro potrebbe aver letto il codice. Creane uno nuovo e collega di nuovo.',
  'Now the computer shows a code too. If it is {code}, tap They match there.': 'Ora anche il computer mostra un codice. Se è {code}, tocca lì «Coincidono».',
  'Unlink this device': 'Scollega questo dispositivo',
  'Unlink {name}': 'Scollega {name}',
  "The account's chats leave this device, messages and all, and so do the accounts it brought over from the phone. The phone keeps them.":
    'Le chat dell’account vengono tolte da questo dispositivo, messaggi compresi, come pure gli account che ha trasferito dal telefono. Il telefono li conserva.',
  'Nothing more goes to it, and nothing it sends is taken. What it has stays on it, behind its own lock.':
    'Non gli arriva più nulla, e niente di quello che invia viene accettato. Quello che ha resta lì, dietro il suo blocco.',
  'Unlinked.': 'Scollegato.',
  'Unlinked here. The phone was not told: unlink this device there too.': 'Scollegato qui. Il telefono non è stato avvisato: scollega questo dispositivo anche da lì.',
  'Unlinked. The device was not told, and gets nothing more.': 'Scollegato. Il dispositivo non è stato avvisato, e non riceve più nulla.',
  'The messages go to it now. What it has already is not kept twice.': 'Ora i messaggi vengono trasferiti. Quelli che ha già non vengono salvati due volte.',
  'Messages to bring over': 'Messaggi da trasferire',
  'Photos and files too': 'Anche foto e file',
  'Linked to {name}': 'Collegato a {name}',
  'Since {when}. Last heard from {last}.': 'Dal {when}. Ultimo contatto: {last}.',
  'This device has the chats and groups of the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server. Calls ring here too. New groups, public groups and group calls stay on the phone for now.':
    'Questo dispositivo ha le chat e i gruppi del telefono che ha l’account. Quello che scrivi qui passa dal telefono, che deve essere acceso e raggiungere il server. Le chiamate squillano anche qui. Per ora i nuovi gruppi, i gruppi pubblici e le chiamate di gruppo restano sul telefono.',
  'These hidden chats have the chats and groups of the same hidden chats on the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server, with these hidden chats open or receiving while closed there. Calls ring here too. New groups and group calls stay on the phone for now.':
    'Queste chat nascoste hanno le chat e i gruppi delle stesse chat nascoste del telefono che ha l’account. Quello che scrivi qui passa dal telefono, che deve essere acceso e raggiungere il server, con queste chat nascoste aperte lì o che ricevono da chiuse. Le chiamate squillano anche qui. Per ora i nuovi gruppi e le chiamate di gruppo restano sul telefono.',
  'Make or join groups on the phone that holds this account.': 'Crea gruppi o entra nei gruppi dal telefono che ha questo account.',
  'Group calls ring on the phone that holds this account, for now. Call from there.':
    'Per ora le chiamate di gruppo squillano sul telefono che ha questo account. Chiama da lì.',
  'The same account on a computer or in a browser. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Hidden chats and what a second password opens never go with it: each links on its own, from inside it.':
    'Lo stesso account su un computer o in un browser. L’account resta sul telefono: inoltra, crittografato end-to-end, quello che arriva e quello che scrive il computer, così i contatti non vedono niente di nuovo. Le chat nascoste e quello che apre una seconda password non vengono mai trasferiti con esso: ognuno si collega per conto suo, dall’interno.',
  'These hidden chats on a computer or in a browser, linked on their own. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Nothing of it shows in the space, nor goes to its linked devices.':
    'Queste chat nascoste su un computer o in un browser, collegate per conto loro. L’account resta sul telefono: inoltra, crittografato end-to-end, quello che arriva e quello che scrive il computer, così i contatti non vedono niente di nuovo. Niente di tutto questo si vede nello spazio, né va ai suoi dispositivi collegati.',
  'Link {name}': 'Collega {name}',
  'Once you tap Link, the computer shows this code. Link only if it shows the same:': 'Appena tocchi «Collega», il computer mostra questo codice. Collega solo se mostra lo stesso:',
  Link: 'Collega',
  Devices: 'Dispositivi',
  'Linked {when}. Last heard from {last}.': 'Collegato il {when}. Ultimo contatto: {last}.',
  'Linked {when}.': 'Collegato il {when}.',
  'Waiting for They match to be tapped on it.': 'In attesa che lì venga toccato «Coincidono».',
  'Bringing over messages: {n} so far.': 'Trasferimento dei messaggi: {n} finora.',
  'Bring over': 'Trasferisci',
  'Bring over messages again': 'Trasferisci di nuovo i messaggi',
  'Signed in as {name}: this device has a token of its own there. Now tap Link to my phone.':
    'Accesso eseguito come {name}: questo dispositivo ha lì un token tutto suo. Ora tocca «Collega al mio telefono».',
  'Link a computer to this phone': 'Collega un computer a questo telefono',
  "On the computer, open Settings → Data and devices → Linked devices → Link to my phone. Then scan its code with this phone's camera, or copy it there and paste it here.":
    'Sul computer, apri «Impostazioni → Dati e dispositivi → Dispositivi collegati → Collega al mio telefono». Poi inquadra il suo codice con la fotocamera di questo telefono, o copialo lì e incollalo qui.',
  "On the computer, open the same hidden chats with their PIN, then Linked devices → Link to my phone in them. Then scan its code with this phone's camera while these hidden chats are open, or copy it there and paste it here.":
    'Sul computer, apri le stesse chat nascoste con il loro PIN, poi al loro interno «Dispositivi collegati → Collega al mio telefono». Poi scansiona il suo codice con la fotocamera di questo telefono mentre queste chat nascoste sono aperte, oppure copialo lì e incollalo qui.',
  'Code from the computer': 'Codice dal computer',
  Next: 'Avanti',
  'Link to my phone': 'Collega al mio telefono',
  'The phone read the code. Does it show this one too?': 'Il telefono ha letto il codice. Mostra anche lui questo?',
  'They match': 'Coincidono',
  'They differ': 'Sono diversi',
  'On the phone that holds the account, scan this code with the camera, or paste it in Settings → Data and devices → Linked devices. This space must have no chats of its own.':
    'Sul telefono che ha l’account, inquadra questo codice con la fotocamera, o incollalo in «Impostazioni → Dati e dispositivi → Dispositivi collegati». Questo spazio non deve avere chat sue.',
  'On the phone that holds the account, open the same hidden chats with their PIN, then scan this code with the camera, or paste it in Linked devices in them. These hidden chats must have no chats of their own.':
    'Sul telefono che ha l’account, apri le stesse chat nascoste con il loro PIN, poi scansiona questo codice con la fotocamera, oppure incollalo nei loro «Dispositivi collegati». Queste chat nascoste non devono avere chat proprie.',
  'Copy the code': 'Copia il codice',
  'Share the code': 'Condividi il codice',
  'Waiting for the phone. The code works for half an hour.': 'In attesa del telefono. Il codice vale per mezz’ora.',
  'Use this when this device is the computer: its chats become those of the phone that holds the account.':
    'Usalo quando questo dispositivo è il computer: le sue chat diventano quelle del telefono che ha l’account.',
  'Use this when this device is the computer: these hidden chats become those of the same hidden chats on the phone that holds the account.':
    'Usalo quando questo dispositivo è il computer: queste chat nascoste diventano le stesse chat nascoste del telefono che ha l’account.',
  'These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.':
    'Queste chat nascoste non hanno ancora una coda sul server: al loro interno, scrivi l’indirizzo del server in «Per utenti esperti», poi crea la loro coda.',
  'The phone answers on a queue of this device on a server: the one the phone uses, or any other. If the server asks for a token, sign in when it offers that, or type one.':
    'Il telefono risponde su una coda di questo dispositivo su un server: quello che usa il telefono, o un altro qualsiasi. Se il server chiede un token, accedi quando lo offre, oppure scrivine uno.',
  'Name of this device': 'Nome di questo dispositivo',
  'Tap Link to my phone, and a QR code for the phone shows here.': 'Tocca «Collega al mio telefono» e qui compare un codice QR per il telefono.',
  'Send the accounts to {name}': 'Invia gli account a {name}',
  "This space's Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Gli account Matrix, XMPP e Nostr di questo spazio gli vengono inviati, crittografati end-to-end, e accede a ciascuno come nuovo dispositivo. Una volta scollegato, esce da tutti.',
  "These hidden chats' own Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, into the same hidden chats there, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Gli account Matrix, XMPP e Nostr propri di queste chat nascoste vanno a lui, crittografati end-to-end, nelle stesse chat nascoste di lì, e lui accede a ciascuno come nuovo dispositivo. Una volta scollegato, esce da essi.',
  'Sent to {name}: {accounts}.': 'Inviato a {name}: {accounts}.',
  'Nothing went: this space has no Matrix, XMPP or Nostr account, or too much waits for that device already.':
    'Non è partito nulla: questo spazio non ha nessun account Matrix, XMPP o Nostr, oppure c’è già troppo in attesa per quel dispositivo.',
  'Nothing went: these hidden chats have no Matrix, XMPP or Nostr account of their own, or too much waits for that device already.':
    'Non è partito niente: queste chat nascoste non hanno un account Matrix, XMPP o Nostr proprio, oppure per quel dispositivo aspetta già troppo.',
  'Accounts from the phone': 'Account dal telefono',
  'Matrix: {id}, signed in here as a new device.': 'Matrix: {id}, accesso eseguito qui come nuovo dispositivo.',
  'Matrix: sign in to {id} here once, with its password. Its keys come from the phone, so no Security Key or check by emoji is needed.':
    'Matrix: accedi qui una volta a {id}, con la sua password. Le sue chiavi arrivano dal telefono, quindi non servono né la chiave di sicurezza né la verifica con le emoji.',
  'Sign in to Matrix': 'Accedi a Matrix',
  'XMPP: {id}, signed in here as a new device.': 'XMPP: {id}, accesso eseguito qui come nuovo dispositivo.',
  'Nostr: the key of the Nostr chats is here too.': 'Nostr: anche la chiave delle chat Nostr è qui.',
  'Not brought over yet: {accounts}. Tried again each time this space opens.':
    'Non ancora trasferito: {accounts}. Si riprova ogni volta che questo spazio si apre.',
  'Not brought over yet: {accounts}. Tried again each time these hidden chats open.':
    'Non ancora trasferito: {accounts}. Si riprova ogni volta che queste chat nascoste si aprono.',
  'Once this device is unlinked, it signs out of the accounts it brought over.':
    'Una volta scollegato questo dispositivo, esce dagli account che ha trasferito dal telefono.',
  'Send the accounts': 'Invia gli account',
  'Same settings on every device': 'Stesse impostazioni su tutti i dispositivi',
  'The language, the look and Last seen change on the other devices too. A photo behind the screens, passwords, PINs and what is about this device alone stay as they are on each.':
    "La lingua, l'aspetto e Ultimo accesso cambiano anche sugli altri dispositivi. Una foto dietro le schermate, le password, i PIN e ciò che riguarda solo questo dispositivo restano come sono su ciascuno.",
  "The groups come back to this phone once the device that holds them hears it.": "I gruppi tornano su questo telefono appena lo sa il dispositivo che li ha.",
  "The groups go to {name} once it hears it.": "I gruppi vanno su {name} appena lo sa.",
  "Groups stay on": "I gruppi restano su",
  "Moving: both devices have to be on.": "Spostamento in corso: tutti e due i dispositivi devono essere accesi.",
  "The keys of the groups are on one device at a time, never copied. There, groups work with the phone off; the other devices write in them through it, so it has to be on. Moving them needs both on, and the server. Public groups stay on the phone.": "Le chiavi dei gruppi sono su un solo dispositivo alla volta, mai copiate. Lì i gruppi funzionano a telefono spento; gli altri dispositivi ci scrivono attraverso di esso, quindi deve essere acceso. Per spostarli servono tutti e due accesi, e il server. I gruppi pubblici restano sul telefono.",
  "The groups are held here": "I gruppi sono qui",
  "Groups work on this device with the phone off, and you can make new ones here. The phone and the other devices write in them through this one, so it has to be on.": "I gruppi funzionano su questo dispositivo a telefono spento, e qui puoi crearne di nuovi. Il telefono e gli altri dispositivi ci scrivono attraverso questo, quindi deve essere acceso.",
  "The groups are held on this device. On the phone, move them back to it first, under Groups stay on.": "I gruppi sono su questo dispositivo. Sul telefono, riportali prima lì, in I gruppi restano su.",
  "The groups are held on {name}. Move them back to this phone first, under Groups stay on.": "I gruppi sono su {name}. Riportali prima su questo telefono, in I gruppi restano su.",
  "That device is no longer linked.": "Quel dispositivo non è più collegato.",
  "The groups go to the other device through the server. Type its address in Server first.": "I gruppi vanno sull’altro dispositivo attraverso il server. Scrivi prima il suo indirizzo in Server.",
  "Unlink all the same?": "Scollegare comunque?",
  "Unlinked now, the groups go from this device, and the phone shows each as left.": "Scollegando, i gruppi lasciano questo dispositivo e il telefono mostra ciascuno come abbandonato.",
  "Unlinked now, this phone shows each of the groups as left, unless they are still on their way to it: those stay here. Do it if the device is lost.": "Scollegando, questo telefono mostra ogni gruppo come abbandonato, tranne quelli ancora in viaggio verso di lui: quelli restano qui. Fallo se il dispositivo è perso.",
  "A device whose Erevos is older cannot hold them: update it there first.": "Un dispositivo con un Erevos più vecchio non può tenerli: aggiornalo prima lì.",
  "{name} has an older Erevos: update it there first.": "{name} ha un Erevos più vecchio: aggiornalo prima lì.",
  "The other device could not take the groups: they stay here.": "L’altro dispositivo non ha potuto prendere i gruppi: restano qui.",

  // Linking with the short code (components/quick-link.tsx, lib/link-nostr.ts).
  'Inside hidden chats, link with the code Link to my phone shows inside the same hidden chats on the computer.':
    'Dentro le chat nascoste, collega con il codice che «Collega al mio telefono» mostra dentro le stesse chat nascoste sul computer.',
  '{why} Link this way instead: sign in to the server below, then tap Link to my phone.':
    '{why} Collega in un altro modo: accedi al server qui sotto, poi tocca «Collega al mio telefono».',
  'Link another way':
    'Collega in un altro modo',
  'The phone that answered is not the one that read the code. Make a new code, and link again.':
    'Il telefono che ha risposto non è quello che ha letto il codice. Crea un nuovo codice e collega di nuovo.',
  'The phone answered, but this computer could not use its server: {error}':
    'Il telefono ha risposto, ma questo computer non ha potuto usare il suo server: {error}',
  'The phone answered. Setting up this computer…':
    'Il telefono ha risposto. Preparazione di questo computer…',
  'Linking with the phone…':
    'Collegamento con il telefono…',
  'Keep both open for a moment. Nothing has to be typed or compared.':
    'Tieni aperti entrambi ancora un momento. Non c’è nulla da scrivere o confrontare.',
  'Scan this with the phone that holds the account, then tap Link on the phone. Nothing else.':
    'Inquadralo con il telefono che ha l’account, poi tocca «Collega» sul telefono. Nient’altro.',
  'Making the code…':
    'Creazione del codice…',
  'The phone sends this computer what it needs through Nostr, end-to-end encrypted. The code works for half an hour.':
    'Il telefono invia a questo computer ciò che serve tramite Nostr, cifrato end-to-end. Il codice vale mezz’ora.',
  'The computer did not answer. On it, tap Link another way and sign in to the server there, then scan its code again.':
    'Il computer non ha risposto. Su di esso, tocca «Collega in un altro modo», accedi lì al server e inquadra di nuovo il suo codice.',
  'Linked to {name}. The chats go to it now.':
    'Collegato a {name}. Le chat vanno ora a lui.',
  'Link {name} to this phone?':
    'Collegare {name} a questo telefono?',
  'Link only a computer of yours, whose code you scanned just now. It gets the chats of this space and the messages chosen below.':
    'Collega solo un tuo computer, di cui hai appena inquadrato il codice. Riceve le chat di questo spazio e i messaggi scelti qui sotto.',
  'Waiting for the computer…':
    'In attesa del computer…',
  'No Nostr server could be reached.':
    'Nessun server Nostr raggiungibile.',
  'The Nostr server did not take it.':
    'Il server Nostr non l’ha accettato.',
  'No Nostr server took it.':
    'Nessun server Nostr l’ha accettato.',
  'Asked. On {name}, tap Link again: it links to this phone and keeps its chats.':
    'Richiesto. Su {name}, tocca «Collega di nuovo»: si collega a questo telefono e tiene le sue chat.',
  'Let go of {name}':
    'Dimentica {name}',
  'It is asked nothing from this phone. To link it later, link it as the first time.':
    'Questo telefono non gli chiede più nulla. Per collegarlo più tardi, collegalo come la prima volta.',
  'Let go':
    'Dimentica',
  'Said yes. Once the phone hears it, this device is linked to it again.':
    'Hai detto sì. Appena il telefono lo sa, questo dispositivo è di nuovo collegato a lui.',
  '{name} asks to link again':
    '{name} chiede di collegarsi di nuovo',
  'A backup of the phone was put back on {name}, which asked {when}. If you did that, link this device to it: it keeps its chats and gets what came since, and the phone before gets nothing more from it. If not, tap Not now: it stays linked as it is.':
    'Un backup del telefono è stato ripristinato su {name}, che l’ha chiesto il {when}. Se sei stato tu, collega questo dispositivo a esso: tiene le sue chat e riceve ciò che è arrivato da allora, e il telefono di prima non riceve più nulla da lui. Se no, tocca «Non ora»: resta collegato com’è.',
  'Waiting for {name}: it has to be on.':
    'In attesa di {name}: deve essere acceso.',
  'Link again':
    'Collega di nuovo',
  'From the backup':
    'Dal backup',
  'These devices were linked to the phone this backup was made on. Ask only those that are still yours: each shows the ask, and links to this phone once Link again is tapped on it. It keeps its chats, and gets what came since.':
    'Questi dispositivi erano collegati al telefono su cui è stato fatto questo backup. Chiedi solo a quelli che sono ancora tuoi: ognuno mostra la richiesta e si collega a questo telefono appena lì viene toccato «Collega di nuovo». Tiene le sue chat e riceve ciò che è arrivato da allora.',
  'It said yes. Linking…':
    'Ha detto sì. Collegamento…',
  'Asked {when}. Waiting for Link again to be tapped on it.':
    'Richiesto il {when}. In attesa che lì venga toccato «Collega di nuovo».',
  'Linked there {when}.':
    'Collegato lì il {when}.',
  'Not asked yet.':
    'Non ancora richiesto.',
  'Ask to link again':
    'Chiedi di collegarsi di nuovo',
  'The phone no longer asks this device to link again.':
    'Il telefono non chiede più a questo dispositivo di collegarsi di nuovo.',
  '{name} asks this device to link again, as a backup of the phone was put back there. If you did that, tap Link again in Linked devices.':
    '{name} chiede a questo dispositivo di collegarsi di nuovo, perché lì è stato ripristinato un backup del telefono. Se sei stato tu, tocca «Collega di nuovo» in Dispositivi collegati.',
  'The phone this backup was made on had linked devices. In Linked devices, ask those that are yours to link again: each keeps its chats.':
    'Il telefono su cui è stato fatto questo backup aveva dispositivi collegati. In Dispositivi collegati, chiedi a quelli tuoi di collegarsi di nuovo: ognuno tiene le sue chat.',
};
