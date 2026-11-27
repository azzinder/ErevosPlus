// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Italian for parts (lib/i18n.ts).
export const parts: Record<string, string> = {
  // The password screen and the password sheet (lock/gate.tsx, components/PasswordSheet.tsx).
  'Enter your password': 'Inserisci la password',
  Unlock: 'Sblocca',
  'Wrong password': 'Password errata',
  'Use at least {n} characters.': 'Usa almeno {n} caratteri.',
  'The passwords do not match.': 'Le password non coincidono.',
  'Use a different password.': 'Usa una password diversa.',
  'New password': 'Nuova password',
  'Repeat password': 'Ripeti la password',
  'Too many attempts. Try again in {n} minute.': 'Troppi tentativi. Riprova tra {n} minuto.',
  'Too many attempts. Try again in {n} minutes.': 'Troppi tentativi. Riprova tra {n} minuti.',
  'Too many attempts. Try again in {n} second.': 'Troppi tentativi. Riprova tra {n} secondo.',
  'Too many attempts. Try again in {n} seconds.': 'Troppi tentativi. Riprova tra {n} secondi.',

  // Small parts of screens.
  'QR code': 'Codice QR',
  Group: 'Gruppo',

  // Calls (components/call-screen.tsx, components/group-call-screen.tsx).
  'Call ended': 'Chiamata terminata',
  'They hung up': 'Ha riattaccato',
  'Turned down': 'Rifiutata',
  'They turned it down': 'Ha rifiutato',
  'They are in another call': 'È in un’altra chiamata',
  'Not answered': 'Senza risposta',
  'The call could not connect': 'Impossibile collegare la chiamata',
  'The call could not connect on their phone': 'Impossibile collegare la chiamata sull’altro telefono',
  'Calling…': 'Chiamata in corso…',
  'Ringing…': 'Squilla…',
  'Incoming video call': 'Videochiamata in arrivo',
  'Incoming voice call': 'Chiamata vocale in arrivo',
  'Connecting…': 'Connessione…',
  'Missed call': 'Chiamata persa',
  Decline: 'Rifiuta',
  Answer: 'Rispondi',
  Unmute: 'Attiva microfono',
  Mute: 'Silenzia',
  Speaker: 'Altoparlante',
  'Camera on': 'Attiva fotocamera',
  'Camera off': 'Spegni fotocamera',
  Flip: 'Gira',
  End: 'Chiudi',
  'You started a group video call': 'Hai avviato una videochiamata di gruppo',
  'You started a group call': 'Hai avviato una chiamata di gruppo',
  '{name} started a group video call': '{name} ha avviato una videochiamata di gruppo',
  '{name} started a group call': '{name} ha avviato una chiamata di gruppo',
  'Waiting for others · {time}': 'In attesa degli altri · {time}',
  'Missed group call': 'Chiamata di gruppo persa',
  'Could not open the microphone': 'Impossibile aprire il microfono',
  'Pictures pause with more than {n} in the call': 'Le immagini si mettono in pausa con più di {n} persone nella chiamata',
  'Group video call · end-to-end encrypted': 'Videochiamata di gruppo · crittografata end-to-end',
  'Group voice call · end-to-end encrypted': 'Chiamata vocale di gruppo · crittografata end-to-end',
  'In the call': 'Nella chiamata',
  Join: 'Partecipa',
  '{name} tried to call. Accept their message request to take calls from them.':
    '{name} ha provato a chiamarti. Accetta la sua richiesta di messaggio per ricevere le sue chiamate.',
  'The call ended.': 'La chiamata è finita.',
  'The call has ended.': 'La chiamata è terminata.',
  'Calls are set up through the server. Type its address in Server first.': 'Le chiamate si avviano tramite il server. Scrivi prima il suo indirizzo in «Server».',

  // The web app's card (components/integrity-card.tsx, lib/integrity.web.ts).
  'This web app': 'Questa web app',
  'Release {version}, checked': 'Versione {version}, verificata',
  'Not checked: no service worker runs Erevos here': 'Non verificata: qui nessun service worker esegue Erevos',
  "Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is":
    'Erevos esegue solo codice firmato con la sua chiave di rilascio, conservata su questo dispositivo. L’impronta della chiave è',
  '. It must match the one you were given with the address of this server.': '. Deve coincidere con quella che ti è stata data insieme all’indirizzo di questo server.',
  'Release {version} is checked and starts the next time Erevos opens.': 'La versione {version} è verificata e partirà alla prossima apertura di Erevos.',
  'Last looked for updates {when}.': 'Ultima ricerca di aggiornamenti: {when}.',
  'Refused:': 'Rifiutato:',
  'Looking…': 'Ricerca…',
  'Look for an update': 'Cerca un aggiornamento',
  'Notifications while closed': 'Notifiche ad app chiusa',
  'On in this space': 'Attive in questo spazio',
  'Off in this space': 'Disattivate in questo spazio',
  'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.':
    'Quando arrivano messaggi, o una chiamata, mentre Erevos è chiuso, il tuo server invia un push tramite il servizio push di questo browser (quello di Apple su un iPhone), ed Erevos mostra quanti messaggi sono arrivati dall’ultima volta che l’hai aperto, per esempio «3 nuovi messaggi», o «Chiamata» se è arrivata solo una chiamata, niente di più. Il push non contiene né il messaggio né il mittente, e il suo conteggio è crittografato per questo browser, ma il servizio push vede quando arriva qualcosa per questo dispositivo, e che usa Erevos. Con un server o l’Erevos di un mittente con una versione precedente alla 2.0.0, o con un messaggio che altri telefoni hanno portato fino al server, non c’è alcun numero: Erevos mostra «Nuovo messaggio», o «Nuovi messaggi» se ne sono arrivati altri, finché non lo apri. Le chat nascoste non ricevono mai notifiche. Ogni spazio che le attiva ha un proprio indirizzo push, quindi l’indirizzo non lega due spazi tra loro presso il loro server.',
  'Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.':
    'Non è stato ancora possibile dirlo al tuo server, quindi le notifiche potrebbero ancora arrivare. Erevos glielo dirà appena riuscirà a raggiungerlo.',
  'A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.':
    'Una chiamata che arriva mentre Erevos è chiuso non squilla: compare solo la notifica «Chiamata». Su un iPhone non si può fare di più: Apple non lascia che una web app funzioni mentre è chiusa né che squilli come un telefono; servirebbe un’app dell’App Store. Su Android, l’app di Erevos squilla anche da chiusa.',
  "Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.":
    "Ogni spazio che le ha attive ha un proprio service worker in questo browser, che le sue impostazioni elencano: chi può vederle può contare gli spazi con le notifiche. Una richiesta di messaggio da qualcuno di nuovo, tramite il tuo link di contatto, potrebbe comparire solo quando Erevos si apre.",
  'Turn off': 'Disattiva',
  'Turn on': 'Attiva',
  'Erevos was tampered with': 'Erevos è stato manomesso',
  'The server sent this device a new service worker, the part of Erevos that checks its code, and no signed release lists it. Erevos goes on with the checked code while it is open, but once it is closed the browser may start the new one, which could show a fake Erevos. Do not open Erevos from this server again, and do not type your passwords into it, until whoever runs the server knows why. Your chats stay sealed with your password.':
    'Il server ha inviato a questo dispositivo un nuovo service worker, la parte di Erevos che verifica il suo codice, e nessuna versione firmata lo elenca. Erevos continua con il codice verificato finché resta aperto, ma una volta chiuso il browser potrebbe avviare quello nuovo, che potrebbe mostrare un Erevos falso. Non aprire più Erevos da questo server, e non inserirci le tue password, finché chi gestisce il server non sa perché. Le tue chat restano sigillate con la tua password.',
  'I understand': 'Ho capito',
  'Update refused': 'Aggiornamento rifiutato',
  '{reason} Erevos keeps the release it has. Settings → Privacy and security → This web app shows what was refused.':
    '{reason} Erevos mantiene la versione che ha. In «Impostazioni → Privacy e sicurezza → Questa web app» trovi cosa è stato rifiutato.',

  // Files and photos (lib/attachments.ts, lib/photo*.ts, lib/pick-*.ts, lib/save-file*.ts, lib/backup-place.web.ts).
  'Files can be 100 MB at most.': 'I file possono essere al massimo di 100 MB.',
  'The file was changed on the way, so it was not kept.': 'Il file è stato modificato lungo il percorso, quindi non è stato salvato.',
  'The file is not on the server any more. Files wait there 14 days.': 'Il file non è più sul server. I file vi restano 14 giorni.',
  'This file is not on this phone.': 'Questo file non è su questo telefono.',
  'This file is not on this computer.': 'Questo file non è su questo computer.',
  // Shown after "in", as «in {folder}»: with no article.
  'the place you chose': 'una posizione scelta da te',
  'the downloads folder': 'Download',
  'Not saved: the share sheet was closed.': 'Non salvato: il menu di condivisione è stato chiuso.',
  'That folder is not there any more. Choose it again.': 'Quella cartella non esiste più. Sceglila di nuovo.',
  // A backup that a folder did not take, in plain words (lib/backup-place.ts folderTrouble).
  'The app this folder belongs to made no file in it. Choose a folder on the phone instead, or try again later.':
    'L’app a cui appartiene questa cartella non ha creato nessun file al suo interno. Scegli invece una cartella sul telefono, oppure riprova più tardi.',
  'Erevos may no longer write in this folder. Choose it again.': 'Erevos potrebbe non poter più scrivere in questa cartella. Sceglila di nuovo.',
  'There is no room left in this folder. Make room, or choose another one.': 'In questa cartella non c’è più spazio. Fai spazio, oppure scegline un’altra.',
  'The backup could not be written in this folder: {reason}': 'Non è stato possibile salvare il backup in questa cartella: {reason}',
  'Ready to save.': 'Pronto per il salvataggio.',
  Original: 'Originale',
  'Original: the photo as it was, full size, with only its place, phone and time taken out.':
    'Originale: la foto com’era, a grandezza piena, tolti soltanto il luogo, il telefono e l’ora dello scatto.',
  '{quality}%: a new, smaller photo, quicker to send. It says nothing but its picture.':
    '{quality}%: una foto nuova, più piccola, più veloce da inviare. Non dice nulla oltre alla sua immagine.',
  'This photo does not get small enough for an MMS.': 'Questa foto non diventa abbastanza piccola per un MMS.',
  'Erevos may not use the camera. Allow it in the phone settings to take photos.': 'Erevos non ha il permesso di usare la fotocamera. Consentilo nelle impostazioni del telefono per scattare foto.',
  'Voice message': 'Messaggio vocale',
  Sticker: 'Sticker',
  'File: {name}': 'File: {name}',
  'That voice message is too long.': 'Quel messaggio vocale è troppo lungo.',

  // When a message or an SMS sent for later goes (components/later-picker.tsx, lib/later.ts).
  'In 1 hour': 'Tra 1 ora',
  'Tonight 20:00': 'Stasera 20:00',
  'Tomorrow 09:00': 'Domani 09:00',
  Day: 'Giorno',
  Hour: 'Ora',
  Minutes: 'Minuti',
  'Goes on {when}.': 'Invio previsto per {when}.',
  'That time has gone by. Choose one ahead.': 'Quell’ora è passata. Scegline una successiva.',
  'At most a year ahead.': 'Al massimo un anno in anticipo.',
  // The home screen's list (lib/inbox.ts).
  'You: {text}': 'Tu: {text}',
  Sun: 'Dom',
  Mon: 'Lun',
  Tue: 'Mar',
  Wed: 'Mer',
  Thu: 'Gio',
  Fri: 'Ven',
  Sat: 'Sab',

  // Contacts and chats (lib/e2e.ts, lib/space-chats.ts, lock/).
  "That is this chat's own contact link.": 'È il tuo stesso link di contatto.',
  'That code has no key. Ask for their contact link or QR code from this version of Erevos.':
    'Quel codice non ha una chiave. Chiedi un link di contatto o un codice QR da questa versione di Erevos.',
  'No such contact.': 'Questo contatto non esiste.',
  'Not a contact.': 'Non è un contatto.',
  'That is not a phone number.': 'Questo non è un numero di telefono.',
  'Not a time Erevos keeps messages for.': 'Erevos non conserva i messaggi per questo tempo.',
  'No conversation with this contact.': 'Nessuna conversazione con questo contatto.',
  'That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.':
    'Quel contatto usa il server {relay}, e il suo link non ha una chiave per esso. Chiedigli un nuovo link.',
  'Wrong password for this backup.': 'Password errata per questo backup.',

  // Groups (lib/groups.ts, lib/space-groups.ts).
  'No groups here yet.': 'Ancora nessun gruppo qui.',
  'Give the group a name.': 'Dai un nome al gruppo.',
  'You made the group.': 'Hai creato il gruppo.',
  'Only the group’s admin adds members.': 'Solo l’admin del gruppo aggiunge membri.',
  'You are not in this group any more.': 'Non fai più parte di questo gruppo.',
  'Only the group’s admin renames it.': 'Solo l’admin del gruppo può rinominarlo.',
  'Only the group’s admin takes members out.': 'Solo l’admin del gruppo rimuove membri.',
  'You closed the group.': 'Hai chiuso il gruppo.',
  'You asked to leave. The group closes here once the admin takes you out.': 'Hai chiesto di uscire. Il gruppo si chiuderà qui appena l’admin ti rimuove.',
  'You left the group.': 'Hai lasciato il gruppo.',
  'You are no longer in the group.': 'Non fai più parte del gruppo.',
  'member {id}': 'membro {id}',
  '{who} added you to the group.': '{who} ti ha aggiunto al gruppo.',
  '{who} joined.': '{who} ora fa parte del gruppo.',
  '{who} left.': '{who} ha lasciato il gruppo.',
  'You asked {who} for their contact link.': 'Hai chiesto a {who} il suo link di contatto.',
  '{who} asked for your contact link.': '{who} ha chiesto il tuo link di contatto.',
  'You sent {who} your contact link. You are each other’s contacts now.':
    'Hai inviato il tuo link di contatto a {who}. Ora siete l’uno nei contatti dell’altro.',
  '{who} sent their contact link. You are each other’s contacts now.': '{who} ha inviato il suo link di contatto. Ora siete l’uno nei contatti dell’altro.',
  '{who} could not be added as a contact.': 'Non è stato possibile aggiungere {who} ai contatti.',
  'Ask for contact links on the phone that holds this account.': 'Chiedi i link di contatto dal telefono che ha questo account.',
  'They are not in this group any more.': 'Non fa più parte di questo gruppo.',
  'Not in public groups.': 'Non nei gruppi pubblici.',
  'More than one member of this group shows this key, so one of them is not who they say. Ask for their contact link some other way.':
    'Più di un membro di questo gruppo mostra questa chiave, quindi uno di loro non è chi dice di essere. Chiedi il suo link di contatto in un altro modo.',
  'Another space is open now.': 'Ora è aperto un altro spazio.',
  'Groups go through the server. Type its address in Server first.': 'I gruppi passano dal server. Scrivi prima il suo indirizzo in «Server».',

  // The build and updates (lib/core.ts, lib/crypto.ts, lib/install-update*.ts, lib/updates.ts, lib/shell.ts).
  'This build has no Erevos core, so it cannot encrypt. Rebuild the app.': 'Questa versione non ha il nucleo di Erevos, quindi non può crittografare. Ricompila l’app.',
  'The Erevos core gave back something unexpected.': 'Il nucleo di Erevos ha restituito qualcosa di inatteso.',
  'This build of Erevos has no Tor.': 'Questa versione di Erevos non ha Tor.',
  'This build of Erevos has no Nostr.': 'Questa versione di Erevos non ha Nostr.',
  'This build has no secure random source. Rebuild the app so it includes expo-crypto.':
    'Questa versione non ha una fonte casuale sicura. Ricompila l’app in modo che includa expo-crypto.',
  'This release has no Android package.': 'Questa versione non ha un pacchetto Android.',
  'The download was cut short.': 'Il download si è interrotto.',
  'The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.':
    'Il download si è fermato a ogni tentativo, perché la connessione non portava nulla per un po’. Non è stato installato nulla: riprova più tardi o su un’altra rete.',
  'Show what is typed': 'Mostra ciò che scrivi',
  'Hide what is typed': 'Nascondi ciò che scrivi',
  'The downloaded package is not the one the release published. Nothing was installed.':
    'Il pacchetto scaricato non è quello pubblicato con la versione. Non è stato installato nulla.',
  'This version installs from the download page.': 'Questa versione si installa dalla pagina di download.',
  'GitHub answered {status}.': 'GitHub ha risposto {status}.',
  "The web app's server answered {status}.": "Il server dell'app web ha risposto {status}.",
  'The desktop app answered {status}.': 'L’app desktop ha risposto {status}.',
  'There is no room left on this device. Free some space and try again.': 'Non c’è più spazio su questo dispositivo. Libera un po’ di spazio e riprova.',
  'This computer has no keyring to seal Erevos’s keys with, so Erevos keeps none. Start a keyring (KWallet, or GNOME Keyring with --password-store=gnome-libsecret), or start Erevos with --plain-secrets to keep them unsealed, readable by your user, and set a password lock.': 'Questo computer non ha un portachiavi per sigillare le chiavi di Erevos, quindi Erevos non ne tiene nessuna. Avvia un portachiavi (KWallet, o GNOME Keyring con --password-store=gnome-libsecret), oppure avvia Erevos con --plain-secrets per tenerle non sigillate, leggibili dal tuo utente, e imposta un blocco con password.',
  'The browser did not open its storage.': 'Il browser non ha aperto il suo spazio di archiviazione.',

  // LoRa and nearby phones (lib/lora.ts, lib/nearby.ts).
  'The radio restarts with its new settings, and links again.': 'La radio si riavvia con le nuove impostazioni e si ricollega.',
  'There is no server, and no Erevos phone is linked nearby. Type the server address in Server, or come near their phone.':
    'Non c’è nessun server, e nessun telefono con Erevos è collegato qui vicino. Scrivi l’indirizzo del server in «Server», o avvicinati al suo telefono.',
  'Too large for LoRa, which takes only text. It can go once the server can be reached, or near their phone.':
    'Troppo grande per LoRa, che trasmette solo testo. Potrà partire quando il server sarà raggiungibile, o vicino al suo telefono.',

  // The relay (lib/relay.ts, lib/sms-invite.ts); {what} is the request's name.
  'An id is 48 hex characters.': 'Un ID è di 48 caratteri esadecimali.',
  'Through Tor: {reason}': 'Tramite Tor: {reason}',
  'cannot reach the server at {url}, or the token is wrong': 'impossibile raggiungere il server {url}, o il token è errato',
  'message is not held': 'il messaggio non è conservato',
  'the server at {url} cannot keep messages for later: update it': 'il server {url} non può conservare messaggi per dopo: aggiornalo',
  'The server at {url} that keeps it is no longer set here.': 'Il server {url} che lo conserva non è più impostato qui.',
  'the server closed the connection': 'il server ha chiuso la connessione',
  'the server did not answer in time': 'il server non ha risposto in tempo',
  'lost the connection to the server': 'connessione al server persa',
  '{what}: queue not found': '{what}: coda non trovata',
  '{what}: queue is full': '{what}: la coda è piena',
  '{what}: your free place on this server has used all it may today. It goes on tomorrow.': '{what}: il tuo posto gratuito su questo server ha già usato oggi tutto quello che può. Riprende domani.',
  '{what}: the server could not save it, try again later': '{what}: il server non è riuscito a salvarlo, riprova più tardi',
  '{what}: the second server could not reach your server, try again later': '{what}: il secondo server non ha raggiunto il tuo server, riprova più tardi',
  '{what}: the file is not on the server any more': '{what}: il file non è più sul server',
  '{what}: the server has no room for files now, try again later': '{what}: il server ora non ha spazio per i file, riprova più tardi',
  '{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.': '{what}: il tuo posto gratuito su questo server ha già fatto passare oggi tutti i file che può. I file riprendono domani.',
  '{what}: the server could not keep it, try again later': '{what}: il server non è riuscito a conservarlo, riprova più tardi',
  '{what}: your server could not reach the server the file is on': '{what}: il tuo server non ha raggiunto il server su cui si trova il file',
  '{reason}. A server older than this app cannot take files: update it.': '{reason}. Un server più vecchio di questa app non accetta file: aggiornalo.',
  'message is too large': 'il messaggio è troppo grande',
  'your server has no key for two-hop sending, so it was not sent through the second server':
    'il tuo server non ha una chiave per l’invio in due passaggi, quindi non è passato dal secondo server',
  'the link has given all its places on its server. Ask them for a new link': 'il link ha già dato tutti i suoi posti sul suo server. Chiedigli un nuovo link',
  'The server address is too long for an SMS invite.': 'L’indirizzo del server è troppo lungo per un invito via SMS.',

  // Notifications in the web app (lib/web-push*.ts).
  'Notifications through the browser are for the web app.': 'Le notifiche tramite il browser sono per la web app.',
  'Your server does not send notifications. It needs a newer version, set up with a push key.':
    'Il tuo server non invia notifiche. Serve una versione più recente, configurata con una chiave push.',
  'This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.':
    'Questo browser non può mostrare notifiche per una web app chiusa. Su un iPhone, aggiungi prima Erevos alla schermata Home.',
  'Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.':
    'Le notifiche non sono consentite per Erevos. Consentile nelle impostazioni di questo browser o telefono.',
  'Set up the server first, under Server.': 'Configura prima il server, in «Server».',
  'Notifications could not be turned on: {reason}': 'Impossibile attivare le notifiche: {reason}',
  // Calls' lines in a chat (lib/call-lines.ts).
  'Voice call': 'Chiamata vocale',
  'Video call': 'Videochiamata',
  'Group call': 'Chiamata di gruppo',
  'Group video call': 'Videochiamata di gruppo',
  'Missed voice call': 'Chiamata vocale persa',
  'Missed video call': 'Videochiamata persa',
  'Missed group video call': 'Videochiamata di gruppo persa',
  '{missed}, while in another call': '{missed}, durante un’altra chiamata',
  'turned down': 'rifiutata',
  'could not connect': 'non collegata',
  'they were in another call': 'era in un’altra chiamata',
  'not answered': 'senza risposta',
  'Only {given} of the {all} files went to the downloads, so they are not all saved.': 'Solo {given} dei {all} file sono andati nei download, quindi non sono tutti salvati.',
  'Save the files': 'Salva i file',
  '{given} of the {all} files went to the downloads. Tap Save for the next one: {name}': '{given} dei {all} file sono andati nei download. Tocca Salva per il prossimo: {name}',
  "The browser did not keep it.": "Il browser non l’ha conservato.",
  "New device of {who}: your messages go to it too.": "Nuovo dispositivo di {who}: i tuoi messaggi vanno anche lì.",
  "A device of {who} changed its key: your messages do not go to it.": "Un dispositivo di {who} ha cambiato chiave: i tuoi messaggi non ci vanno.",
};
