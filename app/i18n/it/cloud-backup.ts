// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// L’italiano dei backup su un server (lib/backup-cloud.ts, app/backup.tsx) (i18n/it/index.ts).
export const cloudBackup: Record<string, string> = {
  'Made a backup in {folder}, but it did not go to the server. {error}': 'Backup fatto in {folder}, ma non è arrivato al server. {error}',
  'Made a backup in {folder} and sent it to {server}.': 'Backup fatto in {folder} e inviato a {server}.',
  'Stop sending to the server': 'Smetti di inviare al server',
  'Automatic backups will go only to the folder from now on. Those already on the server stay there until you delete them.':
    'D’ora in poi i backup automatici andranno solo nella cartella. Quelli già sul server restano lì finché non li cancelli.',
  'Backups no longer go to the server.': 'I backup non vanno più al server.',
  'To a server too': 'Anche su un server',
  'To {server}': 'A {server}',
  'Last one sent {when}.': 'L’ultimo inviato {when}.',
  'None sent yet.': 'Nessuno inviato ancora.',
  'Each automatic backup goes there too, and the server keeps the {n} newest.': 'Ogni backup automatico va anche lì, e il server tiene i {n} più recenti.',
  'The last one did not go: {error} Erevos tries again next time it opens.': 'L’ultimo non è partito: {error} Erevos riprova la prossima volta che si apre.',
  'Stop sending': 'Smetti di inviare',
  'Folder address (WebDAV)': 'Indirizzo della cartella (WebDAV)',
  'In Nextcloud: Files → Files settings → WebDAV gives the start; add a folder you made for backups, like …/remote.php/dav/files/NAME/Backups':
    'In Nextcloud: File → Impostazioni file → WebDAV dà l’inizio; aggiungi una cartella creata per i backup, come …/remote.php/dav/files/NOME/Backups',
  'User name': 'Nome utente',
  "Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.":
    'Meglio una password per app solo per Erevos, dalle impostazioni di sicurezza del server: puoi revocarla lì senza cambiare la tua.',
  'Add a server': 'Aggiungi un server',
  'That is not a folder address. It starts with https://': 'Questo non è l’indirizzo di una cartella. Inizia con https://',
  'The address has to start with https://, so the password and backups go encrypted.': 'L’indirizzo deve iniziare con https://, così password e backup viaggiano cifrati.',
  'Put the user name and password in their own fields, not in the address.': 'Metti nome utente e password nei loro campi, non nell’indirizzo.',
  'The server did not take that user name and password.': 'Il server non ha accettato questo nome utente e questa password.',
  'That folder is not on the server. Make it there first.': 'Questa cartella non è sul server. Creala prima lì.',
  'The server has no room left for it.': 'Il server non ha più spazio per esso.',
  'The server answered {status}.': 'Il server ha risposto {status}.',
  'Could not reach the server. {error}': 'Impossibile raggiungere il server. {error}',
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, when one comes and roughly how big it is, and your address unless the backup goes through Tor, as the space's Tor setting says. Nothing goes until you add one.":
    "Ogni backup automatico può andare anche in una cartella su un server che scegli tu, come il tuo Nextcloud, via WebDAV. Il server riceve byte casuali con un nome casuale: non può aprirli né capire che sono di Erevos. Vede comunque il tuo account, quando ne arriva uno e più o meno quanto è grande, e il tuo indirizzo, a meno che il backup non passi per Tor, come dice l'impostazione Tor dello spazio. Non parte nulla finché non ne aggiungi uno.",
  "This space sends Everything through Tor, and Tor here cannot reach a server, so nothing went to it.":
    "Questo spazio invia Tutto tramite Tor, e qui Tor non può raggiungere un server, quindi non gli è andato nulla.",
  "There is no Erevos backup in that folder.":
    "In quella cartella non c'è nessun backup di Erevos.",
  "Restore from a server":
    "Ripristina da un server",
  "The folder on your server that automatic backups went to. The password is used for this restore only and not kept.":
    "La cartella sul tuo server in cui andavano i backup automatici. La password serve solo per questo ripristino e non viene conservata.",
  "Look there":
    "Cerca lì",
  "Backups on {server}, newest first. Choose one, then type its password.":
    "Backup su {server}, i più recenti per primi. Scegline uno, poi scrivi la sua password.",
  "In a browser the server has to let the web app in (CORS), and this one did not, or could not be reached.":
    "In un browser il server deve far entrare la web app (CORS), e questo non l'ha fatto o non è stato raggiunto.",
  "Erevos forgets the server and its password here. The backups already on it stay there until you delete them.":
    "Erevos dimentica qui il server e la sua password. I backup che ci sono già restano lì finché non li elimini.",
  "Sent a backup to {server}. Keep its password: nothing opens the backup without it.":
    "Backup inviato a {server}. Conserva la sua password: niente apre il backup senza di essa.",
  "Send a backup there now and then; the server keeps the {n} newest.":
    "Invia lì un backup ogni tanto; il server tiene i {n} più recenti.",
  "The last one did not go: {error}":
    "L'ultimo non è partito: {error}",
  "Send a backup now":
    "Invia un backup ora",
  "A backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV, each time you send one. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Un backup può andare anche in una cartella su un server che scegli tu, come il tuo Nextcloud, via WebDAV, ogni volta che ne invii uno. Il server riceve byte casuali con un nome casuale: non può aprirli né capire che sono di Erevos. Vede comunque il tuo account, il tuo indirizzo, quando ne arriva uno e più o meno quanto è grande. Non parte nulla finché non ne aggiungi uno.",
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Ogni backup automatico può andare anche in una cartella su un server che scegli tu, come il tuo Nextcloud, via WebDAV. Il server riceve byte casuali con un nome casuale: non può aprirli né capire che sono di Erevos. Vede comunque il tuo account, il tuo indirizzo, quando ne arriva uno e più o meno quanto è grande. Non parte nulla finché non ne aggiungi uno.",
  "In a browser this works only with a server set to let the web app in (CORS), which Nextcloud is not as it comes. The desktop app and Android need nothing of it.":
    "In un browser funziona solo con un server impostato per far entrare la web app (CORS), cosa che Nextcloud di suo non fa. L'app per computer e Android non ne hanno bisogno.",
  "A backup larger than {size} MB does not come from a server. Download it from the server and tap Restore a backup.": "Un backup di più di {size} MB non arriva da un server. Scaricalo dal server e tocca Ripristina un backup.",
  "Automatic backups need a folder on {device}: choose one.":
    "I backup automatici hanno bisogno di una cartella su {device}: scegline una.",
  "Sent a backup to {server}.":
    "Backup inviato a {server}.",
  "Making the backup: photos, files and voice messages, {percent}%…":
    "Backup in corso: foto, file e messaggi vocali, {percent}%…",
  "Putting back photos, files and voice messages: {percent}%…":
    "Ripristino di foto, file e messaggi vocali: {percent}%…",
  "Choose the files":
    "Scegli i file",
  "Choose the folder":
    "Scegli la cartella",
  "No folder on {device} yet":
    "Ancora nessuna cartella su {device}",
  "These automatic backups came with a backup made on another device, with their password; the folder they went to stays with that device. Choose a folder here, and they go on into it.":
    "Questi backup automatici sono arrivati con un backup fatto su un altro dispositivo, con la loro password; la cartella in cui andavano resta legata a quel dispositivo. Scegli qui una cartella, e continuano lì.",
  "Until then they go only to the server.":
    "Fino ad allora vanno solo al server.",
  "Choose a folder":
    "Scegli una cartella",
  "What stays with each device and comes with no backup: the fingerprint, the folders Erevos may write in, what the phone lets it do and which apps make calls and send SMS. An XMPP account comes back as a new device of itself, and Matrix asks you to sign in again.":
    "Quello che resta a ogni dispositivo e non arriva con nessun backup: l’impronta digitale, le cartelle in cui Erevos può scrivere, quello che il telefono gli consente di fare e quali app fanno le chiamate e mandano gli SMS. Un account XMPP torna come un nuovo dispositivo di sé stesso, e Matrix ti chiede di accedere di nuovo.",
  "Its photos, files and voice messages are in {n} more file beside it, with the same start: keep them together.":
    "Le sue foto, i file e i messaggi vocali sono in {n} altro file accanto a lui, con lo stesso inizio del nome: tienili insieme.",
  "Its photos, files and voice messages are in {n} more files beside it, with the same start: keep them together.":
    "Le sue foto, i file e i messaggi vocali sono in altri {n} file accanto a lui, con lo stesso inizio del nome: tienili insieme.",
  "A file of this backup is not there: {name}.":
    "Un file di questo backup non c’è: {name}.",
  "{n} files of this backup are not there, {name} among them.":
    "{n} file di questo backup non ci sono, tra cui {name}.",
  "This backup's photos, files and voice messages are in {n} more file beside it, whose name starts as its own or as an earlier backup's. Choose it.":
    "Le foto, i file e i messaggi vocali di questo backup sono in {n} altro file accanto a lui, il cui nome inizia come il suo o come quello di un backup precedente. Sceglilo.",
  "This backup's photos, files and voice messages are in {n} more files beside it, whose names start as its own or as an earlier backup's. Choose them all.":
    "Le foto, i file e i messaggi vocali di questo backup sono in altri {n} file accanto a lui, i cui nomi iniziano come il suo o come quello di un backup precedente. Sceglili tutti.",
  "This backup's photos, files and voice messages are in {n} more file beside it. Choose the folder the backup is in.":
    "Le foto, i file e i messaggi vocali di questo backup sono in {n} altro file accanto a lui. Scegli la cartella in cui si trova il backup.",
  "This backup's photos, files and voice messages are in {n} more files beside it. Choose the folder the backup is in.":
    "Le foto, i file e i messaggi vocali di questo backup sono in altri {n} file accanto a lui. Scegli la cartella in cui si trova il backup.",
  "A file of this backup is missing: {name}. Nothing was changed.":
    "Manca un file di questo backup: {name}. Non è cambiato niente.",
  "A file of this backup is damaged, or belongs to another backup: {name}. Nothing was changed.":
    "Un file di questo backup è danneggiato o appartiene a un altro backup: {name}. Non è cambiato niente.",
  "A file of this backup is damaged, or belongs to another backup: {name}.":
    "Un file di questo backup è danneggiato o appartiene a un altro backup: {name}.",
  "Restore everything else without it? The photos, files and voice messages on {device} stay as they are, and those it holds do not come back.":
    "Ripristinare tutto il resto senza di esso? Le foto, i file e i messaggi vocali su {device} restano come sono, e quelli che contiene non tornano.",
  "Restore everything else without them? The photos, files and voice messages on {device} stay as they are, and those they hold do not come back.":
    "Ripristinare tutto il resto senza di essi? Le foto, i file e i messaggi vocali su {device} restano come sono, e quelli che contengono non tornano.",
  "Restore the rest":
    "Ripristina il resto",
  "Restored without {n} file of the backup, {name}: the photos, files and voice messages in it did not come back.":
    "Ripristinato senza {n} file del backup, {name}: le foto, i file e i messaggi vocali che conteneva non sono tornati.",
  "Restored without {n} files of the backup, {name} among them: the photos, files and voice messages in them did not come back.":
    "Ripristinato senza {n} file del backup, tra cui {name}: le foto, i file e i messaggi vocali che contenevano non sono tornati.",
  "What takes room":
    "Cosa occupa spazio",
  "How much room Erevos takes on {device}, by kind: each automatic backup holds it all. Only the files’ names and sizes are looked at, here, and nothing is sent.":
    "Quanto spazio occupa Erevos su {device}, per tipo: ogni backup automatico lo contiene tutto. Si guardano solo i nomi e le dimensioni dei file, qui, e non si invia nulla.",
  "In all: {size}":
    "In tutto: {size}",
  "Measure":
    "Misura",
  "Measure again":
    "Misura di nuovo",
  "The Collection, and photos and files in chats":
    "La Raccolta, e foto e file nelle chat",
  "Contact pictures":
    "Foto dei contatti",
  "Chat history":
    "Cronologia delle chat",
  "Backups kept inside Erevos":
    "Backup tenuti dentro Erevos",
  "Left over from writes that did not end":
    "Resti di scritture non concluse",
  "Cache":
    "Cache",
  "Other: {name}":
    "Altro: {name}",
  "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.":
    "Parte di ciò che un luogo conserva non si è potuta leggere, quindi nulla viene preso per un avanzo. Riprova più tardi.",
  "Nothing opens with that. Check it and type it again.":
    "Con questo non si apre nulla. Controllalo e scrivilo di nuovo.",
  "Opened {opened} of {count}; they are read with the rest.":
    "Aperti {opened} su {count}; vengono letti con il resto.",
  "Opened, and it is read with the rest.":
    "Aperto, e viene letto con il resto.",
  "That one is read already.":
    "Questo è già letto.",
  "Delete the leftovers?":
    "Eliminare gli avanzi?",
  "{size} of photos and files that none of the places read here names (places read: {n}). A place you did not open here loses its photos and files for good: open every one first. Backups already made keep them.":
    "{size} di foto e file che nessuno dei luoghi letti qui nomina (luoghi letti: {n}). Un luogo che non hai aperto qui perde le sue foto e i suoi file per sempre: aprili tutti prima. I backup già fatti li conservano.",
  "{size} freed.":
    "{size} liberati.",
  "Photos and files that nothing on the phone names any more, as those of an import that stopped in its middle, stay on it and in every backup. Only a place opened with its key can say which are its own: so first type here, one at a time or several at once separated by commas or spaces, the PIN of each of your hidden chats and the password of any other space you have. This space is read by itself. Nothing is deleted before you see how much and say so; a file written in the last day is never taken.":
    "Le foto e i file che più nulla sul telefono nomina, come quelli di un'importazione interrotta a metà, restano su di esso e in ogni backup. Solo un luogo aperto con la sua chiave può dire quali sono suoi: quindi scrivi prima qui, uno alla volta o più insieme separati da virgole o spazi, il PIN di ciascuna delle tue chat nascoste e la password di ogni altro spazio che hai. Questo spazio viene letto da sé. Nulla viene eliminato prima che tu veda quanto è e dica di sì; un file scritto nell'ultimo giorno non viene mai preso.",
  "PIN or password":
    "PIN o password",
  "Read with this space: {n}":
    "Letti con questo spazio: {n}",
  "Leftovers: {size} in {n} chunks.":
    "Avanzi: {size} in {n} pezzi.",
  "No leftovers.":
    "Nessun avanzo.",
  "Find leftovers":
    "Cerca avanzi",
  "Delete them":
    "Eliminali",
  "Leftovers":
    "Avanzi",
  "The backup itself is not there.":
    "Il backup stesso non c’è.",
  "It is not made with the automatic backups’ password, so it cannot be checked here.":
    "Non è fatto con la password dei backup automatici, quindi qui non si può controllare.",
  "The backup itself is damaged: {error}":
    "Il backup stesso è danneggiato: {error}",
  "There is no backup there.":
    "Lì non c’è nessun backup.",
  "Check the backups":
    "Controlla i backup",
  "After each automatic backup Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two of them, picked at random, are read through and open too. Of the server it then only looks at what is listed there, so nothing is downloaded. Check now also downloads the server’s newest backup and ten of its parts, and reads ten in the folder.":
    "Dopo ogni backup automatico Erevos lo rilegge dalla cartella: si apre con la sua password, ogni parte che nomina c’è, della sua dimensione, e due di esse, scelte a caso, vengono lette per intero e si aprono anche loro. Del server guarda allora solo ciò che è elencato lì, quindi non si scarica nulla. Controlla ora scarica anche il backup più recente del server e dieci sue parti, e ne legge dieci nella cartella.",
  "Checking…":
    "Controllo…",
  "Check now":
    "Controlla ora",
  "{place}: not checked yet.":
    "{place}: non ancora controllato.",
  "{place}, {when}: {error}":
    "{place}, {when}: {error}",
  "{place}, {when}: of its {parts} parts, {missing} are missing and {damaged} are not as made. A restore would lack their photos and files. Back up now, then check again.":
    "{place}, {when}: delle sue {parts} parti, {missing} mancano e {damaged} non sono come fatte. Un ripristino non avrebbe le loro foto e i loro file. Fai un backup ora, poi controlla di nuovo.",
  "{place}, {when}: whole. It opens, all {parts} parts are there, and the {read} read through open too.":
    "{place}, {when}: integro. Si apre, tutte le {parts} parti ci sono, e le {read} lette per intero si aprono anche loro.",
  "{place}, {when}: the backup and all {parts} parts are there, each of its size.":
    "{place}, {when}: il backup e tutte le {parts} parti ci sono, ciascuna della sua dimensione.",
  "Stopped after {done} of {count} parts.":
    "Fermato dopo {done} di {count} parti.",
  "Checking the parts: {done} of {count}":
    "Controllo delle parti: {done} di {count}",
  "Full check of the folder":
    "Controllo completo della cartella",
  "The full check reads every part in the folder through and compares it with the SHA-256 the backup wrote down for it. It takes a few minutes for many GB, and nothing leaves the phone.":
    "Il controllo completo legge per intero ogni parte nella cartella e la confronta con lo SHA-256 che il backup ha annotato per essa. Con molti GB richiede qualche minuto, e nulla lascia il telefono.",
  "The check after it found a problem: {error}":
    "Il controllo successivo ha trovato un problema: {error}",
  "The check after it found {missing} of its {parts} parts missing and {damaged} damaged.":
    "Il controllo successivo ha trovato che delle sue {parts} parti ne mancano {missing} e {damaged} sono danneggiate.",
  "Making the backup…": "Backup in corso…",
  "Gathering chats, contacts, SMS, calls and settings…": "Raccolta di chat, contatti, SMS, chiamate e impostazioni…",
  "Encrypting and saving…": "Cifratura e salvataggio…",
  "Encrypting photos, files and voice messages…": "Cifratura di foto, file e messaggi vocali…",
  "Keep Erevos open until it is done: a notice says when.": "Tieni Erevos aperto finché non ha finito: una notifica ti dirà quando.",
  "Backup made": "Backup fatto",
  "{name} ({size}) is saved in {folder}.": "{name} ({size}) è salvato in {folder}.",
};
