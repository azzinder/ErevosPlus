// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Srpskohrvatski za rezervne kopije na serveru (lib/backup-cloud.ts, app/backup.tsx) (i18n/sh/index.ts).
export const cloudBackup: Record<string, string> = {
  'Made a backup in {folder}, but it did not go to the server. {error}': 'Rezervna kopija napravljena u {folder}, ali nije otišla na server. {error}',
  'Made a backup in {folder} and sent it to {server}.': 'Rezervna kopija napravljena u {folder} i poslana na {server}.',
  'Stop sending to the server': 'Prestani slati na server',
  'Automatic backups will go only to the folder from now on. Those already on the server stay there until you delete them.':
    'Automatske rezervne kopije od sada idu samo u folder. One koje su već na serveru ostaju tamo dok ih ne obrišete.',
  'Backups no longer go to the server.': 'Rezervne kopije više ne idu na server.',
  'To a server too': 'I na server',
  'To {server}': 'Na {server}',
  'Last one sent {when}.': 'Zadnja poslana {when}.',
  'None sent yet.': 'Još nijedna nije poslana.',
  'Each automatic backup goes there too, and the server keeps the {n} newest.': 'Svaka automatska rezervna kopija ide i tamo, a server čuva {n} najnovije.',
  'The last one did not go: {error} Erevos tries again next time it opens.': 'Zadnja nije otišla: {error} Erevos pokušava ponovo sljedeći put kad se otvori.',
  'Stop sending': 'Prestani slati',
  'Folder address (WebDAV)': 'Adresa foldera (WebDAV)',
  'In Nextcloud: Files → Files settings → WebDAV gives the start; add a folder you made for backups, like …/remote.php/dav/files/NAME/Backups':
    'U Nextcloudu: Datoteke → Postavke datoteka → WebDAV daje početak; dodajte folder koji ste napravili za rezervne kopije, npr. …/remote.php/dav/files/IME/Backups',
  'User name': 'Korisničko ime',
  "Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.":
    'Najbolje lozinka aplikacije samo za Erevos, iz sigurnosnih postavki servera: tamo je možete povući bez mijenjanja svoje.',
  'Add a server': 'Dodaj server',
  'That is not a folder address. It starts with https://': 'To nije adresa foldera. Počinje sa https://',
  'The address has to start with https://, so the password and backups go encrypted.': 'Adresa mora počinjati sa https://, da lozinka i rezervne kopije idu šifrovane.',
  'Put the user name and password in their own fields, not in the address.': 'Upišite korisničko ime i lozinku u njihova polja, ne u adresu.',
  'The server did not take that user name and password.': 'Server nije prihvatio to korisničko ime i lozinku.',
  'That folder is not on the server. Make it there first.': 'Tog foldera nema na serveru. Prvo ga napravite tamo.',
  'The server has no room left for it.': 'Server nema više mjesta za nju.',
  'The server answered {status}.': 'Server je odgovorio {status}.',
  'Could not reach the server. {error}': 'Server nije dostupan. {error}',
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, when one comes and roughly how big it is, and your address unless the backup goes through Tor, as the space's Tor setting says. Nothing goes until you add one.":
    "Svaka automatska rezervna kopija može ići i u folder na serveru koji izaberete, kao vaš Nextcloud, preko WebDAV-a. Server dobija nasumične bajtove pod nasumičnim imenom: ne može ih otvoriti niti znati da su Erevosovi. Ipak vidi vaš nalog, kad jedna stigne i otprilike koliko je velika, i vašu adresu, osim ako kopija ide preko Tora, kako kaže Tor postavka prostora. Ništa ne ide dok ne dodate server.",
  "This space sends Everything through Tor, and Tor here cannot reach a server, so nothing went to it.":
    "Ovaj prostor šalje Sve preko Tora, a Tor ovdje ne može doći do servera, pa ništa nije otišlo.",
  "There is no Erevos backup in that folder.":
    "U tom folderu nema Erevos rezervne kopije.",
  "Restore from a server":
    "Vrati sa servera",
  "The folder on your server that automatic backups went to. The password is used for this restore only and not kept.":
    "Folder na vašem serveru u koji su išle automatske rezervne kopije. Lozinka se koristi samo za ovo vraćanje i ne čuva se.",
  "Look there":
    "Potraži tamo",
  "Backups on {server}, newest first. Choose one, then type its password.":
    "Rezervne kopije na {server}, najnovije prve. Izaberite jednu, pa upišite njenu lozinku.",
  "In a browser the server has to let the web app in (CORS), and this one did not, or could not be reached.":
    "U pregledniku server mora pustiti web aplikaciju (CORS), a ovaj nije, ili nije bio dostupan.",
  "Erevos forgets the server and its password here. The backups already on it stay there until you delete them.":
    "Erevos ovdje zaboravlja server i njegovu lozinku. Rezervne kopije koje su već na njemu ostaju tamo dok ih ne obrišete.",
  "Send a backup there now and then; the server keeps the {n} newest.":
    "Šaljite tamo rezervnu kopiju s vremena na vrijeme; server čuva {n} najnovije.",
  "The last one did not go: {error}":
    "Posljednja nije otišla: {error}",
  "Send a backup now":
    "Pošalji rezervnu kopiju sada",
  "A backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV, each time you send one. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Rezervna kopija može ići i u folder na serveru koji izaberete, kao vaš Nextcloud, preko WebDAV-a, svaki put kad je pošaljete. Server dobija nasumične bajtove pod nasumičnim imenom: ne može ih otvoriti niti znati da su Erevosovi. Ipak vidi vaš nalog, vašu adresu, kad jedna stigne i otprilike koliko je velika. Ništa ne ide dok ne dodate server.",
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Svaka automatska rezervna kopija može ići i u folder na serveru koji izaberete, kao vaš Nextcloud, preko WebDAV-a. Server dobija nasumične bajtove pod nasumičnim imenom: ne može ih otvoriti niti znati da su Erevosovi. Ipak vidi vaš nalog, vašu adresu, kad jedna stigne i otprilike koliko je velika. Ništa ne ide dok ne dodate server.",
  "In a browser this works only with a server set to let the web app in (CORS), which Nextcloud is not as it comes. The desktop app and Android need nothing of it.":
    "U pregledniku ovo radi samo sa serverom podešenim da pusti web aplikaciju (CORS), što Nextcloud sam po sebi nije. Aplikacija za računar i Android ne trebaju ništa od toga.",
  "A backup larger than {size} MB does not come from a server. Download it from the server and tap Restore a backup.": "Rezervna kopija veća od {size} MB ne stiže sa servera. Preuzmite je sa servera i dodirnite Vrati rezervnu kopiju.",
  "Automatic backups need a folder on {device}: choose one.":
    "Automatskim rezervnim kopijama treba folder na {device}: izaberite jedan.",
  "Sent a backup to {server}.":
    "Rezervna kopija poslana na {server}.",
  "Making the backup: photos, files and voice messages, {percent}%…":
    "Pravi se rezervna kopija: fotografije, datoteke i glasovne poruke, {percent}%…",
  "Putting back photos, files and voice messages: {percent}%…":
    "Vraćaju se fotografije, datoteke i glasovne poruke: {percent}%…",
  "Choose the files":
    "Izaberi datoteke",
  "Choose the folder":
    "Izaberi folder",
  "No folder on {device} yet":
    "Još nema foldera na {device}",
  "These automatic backups came with a backup made on another device, with their password; the folder they went to stays with that device. Choose a folder here, and they go on into it.":
    "Ove automatske rezervne kopije stigle su s rezervnom kopijom napravljenom na drugom uređaju, zajedno sa svojom lozinkom; folder u koji su išle ostaje uz taj uređaj. Izaberite folder ovdje i one nastavljaju u njega.",
  "Until then they go only to the server.":
    "Do tada idu samo na server.",
  "Choose a folder":
    "Izaberi folder",
  "What stays with each device and comes with no backup: the fingerprint, the folders Erevos may write in, what the phone lets it do and which apps make calls and send SMS. An XMPP account comes back as a new device of itself, and Matrix asks you to sign in again.":
    "Ono što ostaje uz svaki uređaj i ne dolazi ni s jednom rezervnom kopijom: otisak prsta, folderi u koje Erevos smije pisati, ono što mu telefon dozvoljava i koje aplikacije obavljaju pozive i šalju SMS. XMPP račun se vraća kao novi uređaj samog sebe, a Matrix traži da se ponovo prijavite.",
  "Its photos, files and voice messages are in {n} more file beside it, with the same start: keep them together.":
    "Njene fotografije, datoteke i glasovne poruke su u još {n} datoteci pored nje, s istim početkom imena: držite ih zajedno.",
  "Its photos, files and voice messages are in {n} more files beside it, with the same start: keep them together.":
    "Njene fotografije, datoteke i glasovne poruke su u još {n} datoteci pored nje, s istim početkom imena: držite ih zajedno. | Njene fotografije, datoteke i glasovne poruke su u još {n} datoteke pored nje, s istim početkom imena: držite ih zajedno. | Njene fotografije, datoteke i glasovne poruke su u još {n} datoteka pored nje, s istim početkom imena: držite ih zajedno.",
  "A file of this backup is not there: {name}.":
    "Jedna datoteka ove rezervne kopije nije tu: {name}.",
  "{n} files of this backup are not there, {name} among them.":
    "{n} datoteka ove rezervne kopije nije tu, među njima {name}. | {n} datoteke ove rezervne kopije nisu tu, među njima {name}. | {n} datoteka ove rezervne kopije nije tu, među njima {name}.",
  "This backup's photos, files and voice messages are in {n} more file beside it, whose name starts as its own or as an earlier backup's. Choose it.":
    "Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteci pored nje, čije ime počinje kao njeno ili kao ime neke ranije kopije. Izaberite je.",
  "This backup's photos, files and voice messages are in {n} more files beside it, whose names start as its own or as an earlier backup's. Choose them all.":
    "Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteci pored nje, čija imena počinju kao njeno ili kao ime neke ranije kopije. Izaberite ih sve. | Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteke pored nje, čija imena počinju kao njeno ili kao ime neke ranije kopije. Izaberite ih sve. | Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteka pored nje, čija imena počinju kao njeno ili kao ime neke ranije kopije. Izaberite ih sve.",
  "This backup's photos, files and voice messages are in {n} more file beside it. Choose the folder the backup is in.":
    "Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteci pored nje. Izaberite folder u kojem je rezervna kopija.",
  "This backup's photos, files and voice messages are in {n} more files beside it. Choose the folder the backup is in.":
    "Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteci pored nje. Izaberite folder u kojem je rezervna kopija. | Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteke pored nje. Izaberite folder u kojem je rezervna kopija. | Fotografije, datoteke i glasovne poruke ove rezervne kopije su u još {n} datoteka pored nje. Izaberite folder u kojem je rezervna kopija.",
  "A file of this backup is missing: {name}. Nothing was changed.":
    "Nedostaje datoteka ove rezervne kopije: {name}. Ništa nije promijenjeno.",
  "A file of this backup is damaged, or belongs to another backup: {name}. Nothing was changed.":
    "Datoteka ove rezervne kopije je oštećena ili pripada drugoj rezervnoj kopiji: {name}. Ništa nije promijenjeno.",
  "A file of this backup is damaged, or belongs to another backup: {name}.":
    "Datoteka ove rezervne kopije je oštećena ili pripada drugoj rezervnoj kopiji: {name}.",
  "Restore everything else without it? The photos, files and voice messages on {device} stay as they are, and those it holds do not come back.":
    "Vratiti sve ostalo bez nje? Fotografije, datoteke i glasovne poruke na {device} ostaju kakve jesu, a one koje ona sadrži se ne vraćaju.",
  "Restore everything else without them? The photos, files and voice messages on {device} stay as they are, and those they hold do not come back.":
    "Vratiti sve ostalo bez njih? Fotografije, datoteke i glasovne poruke na {device} ostaju kakve jesu, a one koje one sadrže se ne vraćaju. | Vratiti sve ostalo bez njih? Fotografije, datoteke i glasovne poruke na {device} ostaju kakve jesu, a one koje one sadrže se ne vraćaju. | Vratiti sve ostalo bez njih? Fotografije, datoteke i glasovne poruke na {device} ostaju kakve jesu, a one koje one sadrže se ne vraćaju.",
  "Restore the rest":
    "Vrati ostalo",
  "Restored without {n} file of the backup, {name}: the photos, files and voice messages in it did not come back.":
    "Vraćeno bez {n} datoteke rezervne kopije, {name}: fotografije, datoteke i glasovne poruke u njoj nisu se vratile.",
  "Restored without {n} files of the backup, {name} among them: the photos, files and voice messages in them did not come back.":
    "Vraćeno bez {n} datoteke rezervne kopije, među njima {name}: fotografije, datoteke i glasovne poruke u njima nisu se vratile. | Vraćeno bez {n} datoteke rezervne kopije, među njima {name}: fotografije, datoteke i glasovne poruke u njima nisu se vratile. | Vraćeno bez {n} datoteka rezervne kopije, među njima {name}: fotografije, datoteke i glasovne poruke u njima nisu se vratile.",
  "What takes room":
    "Šta zauzima prostor",
  "How much room Erevos takes on {device}, by kind: each automatic backup holds it all. Only the files’ names and sizes are looked at, here, and nothing is sent.":
    "Koliko prostora Erevos zauzima na {device}, po vrsti: svaka automatska rezervna kopija sadrži sve to. Gledaju se samo imena i veličine datoteka, ovdje, i ništa se ne šalje.",
  "In all: {size}":
    "Ukupno: {size}",
  "Measure":
    "Izmjeri",
  "Measure again":
    "Izmjeri ponovo",
  "The Collection, and photos and files in chats":
    "Zbirka, te fotografije i datoteke u razgovorima",
  "Contact pictures":
    "Slike kontakata",
  "Chat history":
    "Historija razgovora",
  "Backups kept inside Erevos":
    "Rezervne kopije unutar Erevosa",
  "Left over from writes that did not end":
    "Ostaci nedovršenih upisa",
  "Cache":
    "Keš",
  "Other: {name}":
    "Ostalo: {name}",
  "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.":
    "Dio onoga što neko mjesto čuva nije se mogao pročitati, pa se ništa ne smatra ostatkom. Pokušaj kasnije.",
  "Nothing opens with that. Check it and type it again.":
    "S tim se ništa ne otvara. Provjeri i upiši ponovo.",
  "Opened {opened} of {count}; they are read with the rest.":
    "Otvoreno {opened} od {count}; čitaju se s ostalima.",
  "Opened, and it is read with the rest.":
    "Otvoreno, i čita se s ostalim.",
  "That one is read already.":
    "To se već čita.",
  "Delete the leftovers?":
    "Obrisati ostatke?",
  "{size} of photos and files that none of the places read here names (places read: {n}). A place you did not open here loses its photos and files for good: open every one first. Backups already made keep them.":
    "{size} fotografija i datoteka koje ne navodi nijedno od ovdje pročitanih mjesta (pročitana mjesta: {n}). Mjesto koje ovdje nisi otvorio zauvijek gubi svoje fotografije i datoteke: prvo otvori sva. Već napravljene rezervne kopije ih čuvaju.",
  "{size} freed.":
    "Oslobođeno {size}.",
  "Photos and files that nothing on the phone names any more, as those of an import that stopped in its middle, stay on it and in every backup. Only a place opened with its key can say which are its own: so first type here, one at a time or several at once separated by commas or spaces, the PIN of each of your hidden chats and the password of any other space you have. This space is read by itself. Nothing is deleted before you see how much and say so; a file written in the last day is never taken.":
    "Fotografije i datoteke koje više ništa na telefonu ne navodi, poput onih iz uvoza prekinutog na pola, ostaju na njemu i u svakoj rezervnoj kopiji. Samo mjesto otvoreno svojim ključem može reći koje su njegove: zato ovdje prvo upiši, jedan po jedan ili više odjednom odvojenih zarezom ili razmakom, PIN svakog svog skrivenog razgovora i lozinku svakog drugog prostora koji imaš. Ovaj prostor se čita sam. Ništa se ne briše prije nego vidiš koliko je i kažeš da; datoteka upisana u posljednjem danu nikad se ne uzima.",
  "PIN or password":
    "PIN ili lozinka",
  "Read with this space: {n}":
    "Čita se s ovim prostorom: {n}",
  "Leftovers: {size} in {n} chunks.":
    "Ostaci: {size} u {n} dijelova.",
  "No leftovers.":
    "Nema ostataka.",
  "Find leftovers":
    "Pronađi ostatke",
  "Delete them":
    "Obriši ih",
  "Leftovers":
    "Ostaci",
  "The backup itself is not there.":
    "Same rezervne kopije nema.",
  "The backup itself is still empty there.":
    "Sama rezervna kopija tamo je još prazna.",
  "It is not made with the automatic backups’ password, so it cannot be checked here.":
    "Nije napravljena lozinkom automatskih kopija, pa se ovdje ne može provjeriti.",
  "The backup itself is damaged: {error}":
    "Sama rezervna kopija je oštećena: {error}",
  "There is no backup there.":
    "Tamo nema rezervne kopije.",
  "Check the backups":
    "Provjera rezervnih kopija",
  "After each automatic backup Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two of them, picked at random, are read through and open too. Of the server it then only looks at what is listed there, so nothing is downloaded. Check now also downloads the server’s newest backup and ten of its parts, and reads ten in the folder.":
    "Nakon svake automatske kopije Erevos je ponovo čita iz mape: otvara se svojom lozinkom, svaki dio koji navodi je tu, svoje veličine, a dva od njih, nasumično odabrana, čitaju se cijela i također se otvaraju. Na serveru tada gleda samo ono što je tamo na popisu, pa se ništa ne preuzima. Provjeri sada uz to preuzima najnoviju kopiju sa servera i deset njenih dijelova, i čita deset u mapi.",
  "Checking…":
    "Provjera…",
  "Check now":
    "Provjeri sada",
  "{place}: not checked yet.":
    "{place}: još nije provjereno.",
  "{place}, {when}: {error}":
    "{place}, {when}: {error}",
  "{place}, {when}: of its {parts} parts, {missing} are missing and {damaged} are not as made. A restore would lack their photos and files. Back up now, then check again.":
    "{place}, {when}: od njenih {parts} dijelova nedostaje {missing}, a {damaged} nisu kakvi su napravljeni. Vraćanju bi nedostajale njihove fotografije i datoteke. Napravi kopiju sada, pa provjeri ponovo.",
  "{place}, {when}: whole. It opens, all {parts} parts are there, and the {read} read through open too.":
    "{place}, {when}: cijela. Otvara se, svih {parts} dijelova je tu, a i {read} pročitanih u cijelosti se otvaraju.",
  "{place}, {when}: the backup and all {parts} parts are there, each of its size.":
    "{place}, {when}: kopija i svih {parts} dijelova su tu, svaki svoje veličine.",
  "Stopped after {done} of {count} parts.":
    "Zaustavljeno nakon {done} od {count} dijelova.",
  "Checking the parts: {done} of {count}":
    "Provjera dijelova: {done} od {count}",
  "Full check of the folder":
    "Potpuna provjera mape",
  "The full check reads every part in the folder through and compares it with the SHA-256 the backup wrote down for it. It takes a few minutes for many GB, and nothing leaves the phone.":
    "Potpuna provjera čita cijeli svaki dio u mapi i uspoređuje ga sa SHA-256 koji je kopija za njega zapisala. Za mnogo GB traje nekoliko minuta, i ništa ne napušta telefon.",
  "The check after it found a problem: {error}":
    "Provjera nakon nje našla je problem: {error}",
  "The check after it found {missing} of its {parts} parts missing and {damaged} damaged.":
    "Provjera nakon nje našla je da od njenih {parts} dijelova nedostaje {missing}, a {damaged} je oštećeno.",
  "Making the backup…": "Pravi se rezervna kopija…",
  "Gathering chats, contacts, SMS, calls and settings…": "Prikupljanje razgovora, kontakata, SMS-ova, poziva i podešavanja…",
  "Encrypting and saving…": "Šifrovanje i čuvanje…",
  "Encrypting photos, files and voice messages…": "Šifrovanje fotografija, fajlova i glasovnih poruka…",
  "Keep Erevos open until it is done: a notice says when.": "Držite Erevos otvoren dok ne završi: obavještenje će reći kada.",
  "Backup made": "Rezervna kopija je napravljena",
  "{name} ({size}) is saved in {folder}.": "{name} ({size}) je sačuvan u {folder}.",
  "Encrypting and sending…": "Šifriranje i slanje…",
  "Sent a backup to {server}: {total}.": "Rezervna kopija poslana na {server}: {total}.",
  "Or to {server}, your server: it gets the backup encrypted, under a random name.": "Ili na {server}, vaš server: dobiva rezervnu kopiju šifriranu, pod nasumičnim imenom.",
  "Or to a folder on a server of yours over WebDAV, such as Nextcloud: it gets the backup encrypted, under a random name.": "Ili u folder na vašem serveru preko WebDAV-a, kao što je Nextcloud: dobiva rezervnu kopiju šifriranu, pod nasumičnim imenom.",
  "To a server (WebDAV)": "Na server (WebDAV)",
  "Sent a backup to {server}, with {n} file beside it: {total} in all.": "Rezervna kopija poslana na {server}, s {n} datotekom pored nje: ukupno {total}.",
  "Sent a backup to {server}, with {n} files beside it: {total} in all.": "Rezervna kopija poslana na {server}, s {n} datotekom pored nje: ukupno {total}. | Rezervna kopija poslana na {server}, s {n} datoteke pored nje: ukupno {total}. | Rezervna kopija poslana na {server}, s {n} datoteka pored nje: ukupno {total}.",
  "The backup itself is there, but not of the size it was sent with.": "Sama rezervna kopija je tamo, ali nije veličine s kojom je poslana.",
  "A backup of {total} in all went to {server}.": "Rezervna kopija od ukupno {total} poslana je na {server}.",
  "{name} and {n} file beside it, {total} in all, are saved in {folder}.": "{name} i {n} datoteka pored nje, ukupno {total}, sačuvani su u {folder}.",
  "{name} and {n} files beside it, {total} in all, are saved in {folder}.": "{name} i {n} datoteka pored nje, ukupno {total}, sačuvani su u {folder}. | {name} i {n} datoteke pored nje, ukupno {total}, sačuvani su u {folder}. | {name} i {n} datoteka pored nje, ukupno {total}, sačuvani su u {folder}.",
  "A backup sent by hand goes whole each time, with every photo and file: up to about {size} now.":
    "Rezervna kopija poslana ručno ide cijela svaki put, sa svakom fotografijom i datotekom: sada do oko {size}.",
  "A backup sent by hand goes whole each time, with every photo and file.":
    "Rezervna kopija poslana ručno ide cijela svaki put, sa svakom fotografijom i datotekom.",
  "With automatic backups on, only what is new goes each time.":
    "S uključenim automatskim kopijama svaki put ide samo ono što je novo.",
  "The server keeps the {n} newest whole.":
    "Server čuva {n} najnovije cijele.",
  "Automatic backups to a server":
    "Automatske rezervne kopije na server",
  "Add the WebDAV folder they go to, such as one in your Nextcloud. Then choose their password: from then on Erevos sends one by itself every day, encrypted.":
    "Dodajte WebDAV folder u koji idu, recimo jedan u vašem Nextcloudu. Zatim izaberite njihovu lozinku: od tada Erevos sam šalje jednu svaki dan, šifriranu.",
  "Only to {server}":
    "Samo na {server}",
  "Made while Erevos is open, and as it goes to the background, once the last one is older than that. A folder on {device} as well keeps one more copy close at hand.":
    "Pravi se dok je Erevos otvoren, i kad ode u pozadinu, čim je posljednja starija od toga. Folder i na {device} čuva još jednu kopiju pri ruci.",
  "Automatic backups stop too, as they have no folder on {device}. Those already on the server stay there until you delete them.":
    "Zaustavljaju se i automatske rezervne kopije, jer nemaju folder na {device}. One koje su već na serveru ostaju tamo dok ih ne obrišete.",
  // Google Drive (lib/google-drive.ts).
  "Not sent to Google Drive. {error}": "Nije poslano na Google Drive. {error}",
  "Sent a backup to Google Drive.": "Rezervna kopija poslana na Google Drive.",
  "Automatic backups will go only to the folder and Google Drive from now on. Those already on the server stay there until you delete them.":
    "Automatske rezervne kopije od sada idu samo u folder i na Google Drive. One koje su već na serveru ostaju tamo dok ih ne obrišete.",
  "Automatic backups will go only to Google Drive from now on. Those already on the server stay there until you delete them.":
    "Automatske rezervne kopije od sada idu samo na Google Drive. One koje su već na serveru ostaju tamo dok ih ne obrišete.",
  "Automatic backups stop too, as they have no folder on {device}. Those already in your Google Drive stay there until you delete them.":
    "Zaustavljaju se i automatske rezervne kopije, jer nemaju folder na {device}. One koje su već na vašem Google Driveu ostaju tamo dok ih ne obrišete.",
  "Google takes back Erevos's access to your Google Drive, and Erevos forgets the sign-in here. The backups already there stay until you delete them.":
    "Google oduzima Erevosu pristup vašem Google Driveu, a Erevos ovdje zaboravlja prijavu. Rezervne kopije koje su već tamo ostaju dok ih ne obrišete.",
  "Stop sending to Google Drive": "Prestani slati na Google Drive",
  "Backups no longer go to Google Drive.": "Rezervne kopije više ne idu na Google Drive.",
  "Backups no longer go to Google Drive, but Google could not be reached to take back Erevos's access: you can take it back in your Google account's security settings.":
    "Rezervne kopije više ne idu na Google Drive, ali Google nije bio dostupan da oduzme Erevosu pristup: možete ga sami oduzeti u sigurnosnim postavkama svog Google računa.",
  "There is no Erevos backup in that Google Drive.": "Na tom Google Driveu nema Erevos rezervne kopije.",
  "Only to {server} and Google Drive": "Samo na {server} i Google Drive",
  "Only to Google Drive": "Samo na Google Drive",
  "To Google Drive too": "I na Google Drive",
  "To Google Drive": "Na Google Drive",
  "Each automatic backup goes there too, into the folder named Erevos, which keeps the {n} newest.":
    "Svaka automatska rezervna kopija ide i tamo, u folder po imenu Erevos, koji čuva {n} najnovije.",
  "Automatic backups are off, so none goes there. Turn them on to send one every day.":
    "Automatske rezervne kopije su isključene, pa tamo ne ide nijedna. Uključite ih da se šalje jedna svaki dan.",
  "Turn on automatic backups": "Uključite automatske rezervne kopije",
  "Sign in with Google again": "Ponovo se prijavite na Google",
  "Each automatic backup can also go to your Google Drive, into a folder named Erevos that Erevos makes there. Google gets random bytes under a random name and cannot open them, but it knows your account, when one comes and how big it is. Nothing goes until you sign in with Google.":
    "Svaka automatska rezervna kopija može ići i na vaš Google Drive, u folder po imenu Erevos koji Erevos tamo napravi. Google dobija nasumične bajtove pod nasumičnim imenom i ne može ih otvoriti, ali zna vaš račun, kad jedna stigne i koliko je velika. Ništa ne ide dok se ne prijavite na Google.",
  "Sign in with Google": "Prijavite se na Google",
  "Google Drive is checked as a server is.": "Google Drive se provjerava kao server.",
  "Restore from Google Drive": "Vrati s Google Drivea",
  "Backups in Google Drive, newest first. Choose one, then type its password.":
    "Rezervne kopije na Google Driveu, najnovije prve. Izaberite jednu, pa upišite njenu lozinku.",
  "Google Drive is not in this build of Erevos.": "Google Drive nije u ovoj verziji Erevosa.",
  "Google no longer lets Erevos into your Google Drive. Sign in with Google again.":
    "Google više ne pušta Erevos na vaš Google Drive. Ponovo se prijavite na Google.",
  "Google Drive answered {status}.": "Google Drive je odgovorio {status}.",
  "Your Google Drive has no room left for it.": "Vaš Google Drive nema više mjesta za nju.",
  "That file is not in your Google Drive any more.": "Te datoteke više nema na vašem Google Driveu.",
  "This sign-in is not one Erevos started here, or it is more than {minutes} minutes old. Start it again.":
    "Ovu prijavu nije ovdje pokrenuo Erevos, ili je starija od {minutes} minuta. Počnite ponovo.",
  "You did not allow it at Google, so nothing changed.": "Niste to dopustili kod Googlea, pa se ništa nije promijenilo.",
  "Google did not take the sign-in: {error}. Start it again.": "Google nije prihvatio prijavu: {error}. Počnite ponovo.",
  "Erevos was not allowed to keep files in your Google Drive. Sign in again and allow it.":
    "Erevos nije dobio dopuštenje da čuva datoteke na vašem Google Driveu. Ponovo se prijavite i dopustite to.",
  "Automatic backups went only to Google Drive, and the Erevos from F-Droid sends none there, so none goes anywhere now. Choose a folder on {device}, or add a server, and they go on there.":
    "Automatske rezervne kopije išle su samo na Google Drive, a Erevos iz F-Droida tamo ne šalje nijednu, pa sada ne idu nikamo. Izaberite folder na {device} ili dodajte server, i nastavljaju tamo.",
  "No longer sent to Google Drive":
    "Više se ne šalju na Google Drive",
  "The Erevos from F-Droid keeps to services anyone may run, so it sends no backups to Google Drive. Those already there stay until you delete them. Stop sending also takes back, at Google, Erevos's access to your Google Drive.":
    "Erevos iz F-Droida drži se usluga koje svatko može pokrenuti, pa ne šalje rezervne kopije na Google Drive. One koje su već tamo ostaju dok ih ne obrišete. „Prestani slati“ također oduzima, kod Googlea, Erevosu pristup vašem Google Driveu.",
};
