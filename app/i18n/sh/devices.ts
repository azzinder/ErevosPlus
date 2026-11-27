// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of linked devices: the account on the phone and on a computer (lib/devices.ts, app/devices.tsx; i18n/sh/index.ts).
export const devices: Record<string, string> = {
  // Linking and the links (lib/devices.ts).
  Computer: 'Računar',
  'Linked devices could not open.': 'Povezani uređaji nisu se mogli otvoriti.',
  'That device is linked already.': 'Taj uređaj je već povezan.',
  'That is not a code from Linked devices.': 'To nije kod iz „Povezani uređaji“.',
  'The code changed. Compare it again.': 'Kod se promijenio. Ponovo provjerite da je isti.',
  'This device is no longer linked to a phone.': 'Ovaj uređaj više nije povezan s telefonom.',
  'This is a linked device. Link from the phone that holds the account.':
    'Ovo je povezani uređaj. Povezivanje pokrenite s telefona na kojem je račun.',
  'This space has chats of its own. Link from a space with none, such as one that opens with a new password.':
    'Ovaj prostor ima vlastite razgovore. Povezivanje pokrenite iz prostora bez njih, na primjer onog koji se otvara novom lozinkom.',
  'This space is linked already.': 'Ovaj prostor je već povezan.',
  'These hidden chats are linked already.': 'Ovi skriveni razgovori su već povezani.',
  'These hidden chats have chats of their own. Link from hidden chats with none, such as those a new PIN sets.':
    'Ovi skriveni razgovori imaju vlastite razgovore. Povežite iz skrivenih razgovora bez ijednog, poput onih koje otvara novi PIN.',
  'Too long to go through the phone.': 'Predugo za slanje preko telefona.',
  'Type the server address in Server first: linked devices reach this phone through it.':
    'Prvo upišite adresu servera u „Server“: povezani uređaji dolaze do ovog telefona preko njega.',
  '{n} devices are linked already, the most there can be.': 'Već je povezan najveći mogući broj uređaja: {n}.',

  // The menu, and the chat on a linked device (app/index.tsx, app/chat.tsx).
  'Linked devices': 'Povezani uređaji',
  'Not sent by the phone': 'Telefon nije poslao',
  'These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.':
    'Ovi razgovori su došli iz rezervne kopije povezanog uređaja: ovdje ih možete čitati, ali ne i pisati u njima. Da biste pisali, ponovo povežite ovaj uređaj s telefonom, u „Povezani uređaji“.',
  'This account on a computer or in a browser too': 'Ovaj račun i na računaru ili u pregledniku',
  "This chat is the phone's: move it into hidden chats there.": 'Ovaj razgovor pripada telefonu: tamo ga premjestite u skrivene razgovore.',
  'These hidden chats are linked to a phone: move the chat into them there.':
    'Ovi skriveni razgovori su povezani s telefonom: tamo premjestite razgovor u njih.',
  "This chat is the phone's: move it out of the hidden chats there.": 'Ovaj razgovor pripada telefonu: tamo ga izvadite iz skrivenih razgovora.',

  // A call answered on another device of the account (components/call-screen.tsx, lib/call-lines.ts).
  'Answered on another device': 'Javljeno na drugom uređaju',
  'answered on another device': 'javljeno na drugom uređaju',

  // Linked devices (app/devices.tsx).
  'All of it': 'Sve',
  'The last month': 'Posljednji mjesec',
  'The last week': 'Posljednja sedmica',
  None: 'Ništa',
  'Web browser': 'Web-preglednik',
  'Code copied. Paste it on the phone in Settings → Data and devices → Linked devices.': 'Kod je kopiran. Zalijepite ga na telefonu u „Postavke → Podaci i uređaji → Povezani uređaji“.',
  'Code copied. Paste it on the phone, in Linked devices of the same hidden chats.':
    'Kod je kopiran. Zalijepite ga na telefonu, u „Povezani uređaji“ istih skrivenih razgovora.',
  'Linked. The chats come from the phone, and with them the messages it chose to bring over.':
    'Povezano. Razgovori dolaze s telefona, a s njima i poruke koje je izabrao da prenese.',
  'Not linked. Someone else may have read the code. Make a new one, and link again.':
    'Nije povezano. Možda je kod pročitala i druga osoba. Napravite novi i ponovo povežite.',
  'Now the computer shows a code too. If it is {code}, tap They match there.':
    'Sada i računar prikazuje kod. Ako je {code}, tamo dodirnite „Podudaraju se“.',
  'Unlink this device': 'Odvoji ovaj uređaj',
  'Unlink {name}': 'Odvoji uređaj {name}',
  "The account's chats leave this device, messages and all, and so do the accounts it brought over from the phone. The phone keeps them.":
    'Razgovori računa uklanjaju se s ovog uređaja, zajedno s porukama, a isto i računi koje je prenio s telefona. Telefon ih zadržava.',
  'Nothing more goes to it, and nothing it sends is taken. What it has stays on it, behind its own lock.':
    'Na njega više ništa ne ide, a ništa što pošalje ne prima se. Ono što ima ostaje na njemu, iza njegovog zaključavanja.',
  'Unlinked.': 'Odvojeno.',
  'Unlinked here. The phone was not told: unlink this device there too.':
    'Odvojeno ovdje. Telefon nije obaviješten: odvojite ovaj uređaj i tamo.',
  'Unlinked. The device was not told, and gets nothing more.': 'Odvojeno. Uređaj nije obaviješten i više ništa ne prima.',
  'The messages go to it now. What it has already is not kept twice.':
    'Poruke sada idu na njega. Ono što već ima ne čuva se dva puta.',
  'Messages to bring over': 'Koje poruke prenijeti',
  'Photos and files too': 'I fotografije i datoteke',
  'Linked to {name}': 'Povezano s uređajem {name}',
  'Since {when}. Last heard from {last}.': 'Od {when}. Posljednji put se javio {last}.',
  'This device has the chats and groups of the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server. Calls ring here too. New groups, public groups and group calls stay on the phone for now.':
    'Ovaj uređaj ima razgovore i grupe telefona na kojem je račun. Ono što ovdje napišete ide preko telefona, koji mora biti uključen i povezan sa serverom. Pozivi zvone i ovdje. Nove grupe, javne grupe i grupni pozivi zasad ostaju na telefonu.',
  'These hidden chats have the chats and groups of the same hidden chats on the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server, with these hidden chats open or receiving while closed there. Calls ring here too. New groups and group calls stay on the phone for now.':
    'Ovi skriveni razgovori imaju razgovore i grupe istih skrivenih razgovora telefona na kojem je račun. Ono što ovdje napišete ide preko telefona, koji mora biti uključen i povezan sa serverom, s ovim skrivenim razgovorima tamo otvorenim ili s primanjem dok su zatvoreni. Pozivi zvone i ovdje. Nove grupe i grupni pozivi zasad ostaju na telefonu.',
  'Make or join groups on the phone that holds this account.': 'Grupe pravite i pridružujete im se na telefonu na kojem je ovaj račun.',
  'Group calls ring on the phone that holds this account, for now. Call from there.':
    'Grupni pozivi zasad zvone na telefonu na kojem je ovaj račun. Pozovite odande.',
  'The same account on a computer or in a browser. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Hidden chats and what a second password opens never go with it: each links on its own, from inside it.':
    'Isti račun na računaru ili u pregledniku. Račun ostaje na telefonu: telefon prosljeđuje, šifrirano s kraja na kraj, ono što stiže i ono što računar napiše, pa kontakti ne vide ništa novo. Skriveni razgovori i ono što otvara druga lozinka nikad ne idu s njim: svaki se povezuje zasebno, iznutra.',
  'These hidden chats on a computer or in a browser, linked on their own. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Nothing of it shows in the space, nor goes to its linked devices.':
    'Ovi skriveni razgovori na računaru ili u pregledniku, povezani zasebno. Račun ostaje na telefonu: telefon prosljeđuje, šifrirano s kraja na kraj, ono što stiže i ono što računar napiše, pa kontakti ne vide ništa novo. Ništa od toga se ne vidi u prostoru, niti ide na njegove povezane uređaje.',
  'Link {name}': 'Poveži uređaj {name}',
  'Once you tap Link, the computer shows this code. Link only if it shows the same:':
    'Kad dodirnete „Poveži“, računar prikazuje ovaj kod. Povežite samo ako prikazuje isti:',
  Link: 'Poveži',
  Devices: 'Uređaji',
  'Linked {when}. Last heard from {last}.': 'Povezan {when}. Posljednji put se javio {last}.',
  'Linked {when}.': 'Povezan {when}.',
  'Waiting for They match to be tapped on it.': 'Čeka se da se na njemu dodirne „Podudaraju se“.',
  'Bringing over messages: {n} so far.': 'Prenose se poruke: dosad {n}.',
  'Bring over': 'Prenesi',
  'Bring over messages again': 'Ponovo prenesi poruke',
  'Signed in as {name}: this device has a token of its own there. Now tap Link to my phone.':
    'Prijavljeni ste kao {name}: ovaj uređaj tamo ima vlastiti token. Sada dodirnite „Poveži s mojim telefonom“.',
  'Link a computer to this phone': 'Poveži računar s ovim telefonom',
  "On the computer, open Settings → Data and devices → Linked devices → Link to my phone. Then scan its code with this phone's camera, or copy it there and paste it here.":
    'Na računaru otvorite „Postavke → Podaci i uređaji → Povezani uređaji → Poveži s mojim telefonom“. Zatim skenirajte njegov kod kamerom ovog telefona ili ga tamo kopirajte i zalijepite ovdje.',
  "On the computer, open the same hidden chats with their PIN, then Linked devices → Link to my phone in them. Then scan its code with this phone's camera while these hidden chats are open, or copy it there and paste it here.":
    'Na računaru otvorite iste skrivene razgovore njihovim PIN-om, pa u njima „Povezani uređaji → Poveži s mojim telefonom“. Zatim skenirajte njegov kod kamerom ovog telefona dok su ovi skriveni razgovori otvoreni, ili ga tamo kopirajte i zalijepite ovdje.',
  'Code from the computer': 'Kod s računara',
  Next: 'Dalje',
  'Link to my phone': 'Poveži s mojim telefonom',
  'The phone read the code. Does it show this one too?': 'Telefon je pročitao kod. Prikazuje li i on ovaj isti?',
  'They match': 'Podudaraju se',
  'They differ': 'Razlikuju se',
  'On the phone that holds the account, scan this code with the camera, or paste it in Settings → Data and devices → Linked devices. This space must have no chats of its own.':
    'Na telefonu na kojem je račun skenirajte ovaj kod kamerom ili ga zalijepite u „Postavke → Podaci i uređaji → Povezani uređaji“. Ovaj prostor ne smije imati vlastite razgovore.',
  'On the phone that holds the account, open the same hidden chats with their PIN, then scan this code with the camera, or paste it in Linked devices in them. These hidden chats must have no chats of their own.':
    'Na telefonu na kojem je račun otvorite iste skrivene razgovore njihovim PIN-om, pa skenirajte ovaj kod kamerom, ili ga zalijepite u njihove „Povezani uređaji“. Ovi skriveni razgovori ne smiju imati vlastite razgovore.',
  'Copy the code': 'Kopiraj kod',
  'Share the code': 'Podijeli kod',
  'Waiting for the phone. The code works for half an hour.': 'Čeka se telefon. Kod vrijedi pola sata.',
  'Use this when this device is the computer: its chats become those of the phone that holds the account.':
    'Koristite ovo kad je ovaj uređaj računar: njegovi razgovori postaju razgovori telefona na kojem je račun.',
  'Use this when this device is the computer: these hidden chats become those of the same hidden chats on the phone that holds the account.':
    'Koristite ovo kad je ovaj uređaj računar: ovi skriveni razgovori postaju isti skriveni razgovori telefona na kojem je račun.',
  'These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.':
    'Ovi skriveni razgovori još nemaju red na serveru: u njima upišite adresu servera pod „Za napredne korisnike“, a zatim napravite njihov red.',
  'The phone answers on a queue of this device on a server: the one the phone uses, or any other. If the server asks for a token, sign in when it offers that, or type one.':
    'Telefon odgovara na redu ovog uređaja na serveru: onom koji telefon koristi ili bilo kojem drugom. Ako server traži token, prijavite se kad to ponudi ili upišite jedan.',
  'Name of this device': 'Naziv ovog uređaja',
  'Tap Link to my phone, and a QR code for the phone shows here.': 'Dodirnite „Poveži s mojim telefonom“ i ovdje se prikazuje QR kod za telefon.',
  'Send the accounts to {name}': 'Pošalji račune uređaju {name}',
  "This space's Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Matrix, XMPP i Nostr računi ovog prostora idu na njega, šifrirano s kraja na kraj, a on se prijavljuje na svaki kao novi uređaj. Kad se odvoji, odjavljuje se s njih.',
  "These hidden chats' own Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, into the same hidden chats there, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Vlastiti Matrix, XMPP i Nostr računi ovih skrivenih razgovora idu na njega, šifrirani s kraja na kraj, u iste skrivene razgovore tamo, i on se na svaki prijavljuje kao novi uređaj. Kad se odveže, odjavljuje se s njih.',
  'Sent to {name}: {accounts}.': 'Poslano uređaju {name}: {accounts}.',
  'Nothing went: this space has no Matrix, XMPP or Nostr account, or too much waits for that device already.':
    'Ništa nije poslano: ovaj prostor nema Matrix, XMPP ni Nostr račun, ili za taj uređaj već čeka previše.',
  'Nothing went: these hidden chats have no Matrix, XMPP or Nostr account of their own, or too much waits for that device already.':
    'Ništa nije poslano: ovi skriveni razgovori nemaju vlastiti Matrix, XMPP ili Nostr račun, ili za taj uređaj već čeka previše.',
  'Accounts from the phone': 'Računi s telefona',
  'Matrix: {id}, signed in here as a new device.': 'Matrix: {id}, prijavljen ovdje kao novi uređaj.',
  'Matrix: sign in to {id} here once, with its password. Its keys come from the phone, so no Security Key or check by emoji is needed.':
    'Matrix: prijavite se ovdje jednom na {id}, njegovom lozinkom. Njegovi ključevi dolaze s telefona, pa nisu potrebni ni sigurnosni ključ ni provjera emojijima.',
  'Sign in to Matrix': 'Prijavite se na Matrix',
  'XMPP: {id}, signed in here as a new device.': 'XMPP: {id}, prijavljen ovdje kao novi uređaj.',
  'Nostr: the key of the Nostr chats is here too.': 'Nostr: ključ Nostr razgovora je i ovdje.',
  'Not brought over yet: {accounts}. Tried again each time this space opens.':
    'Još nije preneseno: {accounts}. Pokušava se ponovo svaki put kad se ovaj prostor otvori.',
  'Not brought over yet: {accounts}. Tried again each time these hidden chats open.':
    'Još nije preneseno: {accounts}. Pokušava se ponovo svaki put kad se ovi skriveni razgovori otvore.',
  'Once this device is unlinked, it signs out of the accounts it brought over.':
    'Kad se ovaj uređaj odvoji, odjavljuje se s računa koje je prenio s telefona.',
  'Send the accounts': 'Pošalji račune',
  'Same settings on every device': 'Iste postavke na svim uređajima',
  'The language, the look and Last seen change on the other devices too. A photo behind the screens, passwords, PINs and what is about this device alone stay as they are on each.':
    'Jezik, izgled i Posljednji put viđen mijenjaju se i na drugim uređajima. Fotografija iza ekrana, lozinke, PIN-ovi i ono što se tiče samo ovog uređaja ostaju kakvi jesu na svakom.',
  "The groups come back to this phone once the device that holds them hears it.": "Grupe se vraćaju na ovaj telefon čim to sazna uređaj na kojem su.",
  "The groups go to {name} once it hears it.": "Grupe idu na {name} čim to sazna.",
  "Groups stay on": "Grupe ostaju na",
  "Moving: both devices have to be on.": "Premještaju se: oba uređaja moraju biti uključena.",
  "The keys of the groups are on one device at a time, never copied. There, groups work with the phone off; the other devices write in them through it, so it has to be on. Moving them needs both on, and the server. Public groups stay on the phone.": "Ključevi grupa su na samo jednom uređaju odjednom, nikad kopirani. Tamo grupe rade i kad je telefon isključen; ostali uređaji pišu u njima preko njega, pa mora biti uključen. Za premještanje oba moraju biti uključena, i server. Javne grupe ostaju na telefonu.",
  "The groups are held here": "Grupe su ovdje",
  "Groups work on this device with the phone off, and you can make new ones here. The phone and the other devices write in them through this one, so it has to be on.": "Grupe rade na ovom uređaju i kad je telefon isključen, i ovdje možeš praviti nove. Telefon i ostali uređaji pišu u njima preko ovoga, pa mora biti uključen.",
  "The groups are held on this device. On the phone, move them back to it first, under Groups stay on.": "Grupe su na ovom uređaju. Na telefonu ih prvo vrati na njega, pod Grupe ostaju na.",
  "The groups are held on {name}. Move them back to this phone first, under Groups stay on.": "Grupe su na {name}. Prvo ih vrati na ovaj telefon, pod Grupe ostaju na.",
  "That device is no longer linked.": "Taj uređaj više nije povezan.",
  "The groups go to the other device through the server. Type its address in Server first.": "Grupe idu na drugi uređaj preko servera. Prvo upiši njegovu adresu pod Server.",
  "Unlink all the same?": "Ipak odvojiti?",
  "Unlinked now, the groups go from this device, and the phone shows each as left.": "Nakon odvajanja, grupe odlaze s ovog uređaja, a telefon svaku prikazuje kao napuštenu.",
  "Unlinked now, this phone shows each of the groups as left, unless they are still on their way to it: those stay here. Do it if the device is lost.": "Nakon odvajanja, ovaj telefon svaku grupu prikazuje kao napuštenu, osim onih koje su još na putu do njega: one ostaju ovdje. Učini to ako je uređaj izgubljen.",
  "A device whose Erevos is older cannot hold them: update it there first.": "Uređaj sa starijim Erevosom ne može ih držati: prvo ga ondje ažuriraj.",
  "{name} has an older Erevos: update it there first.": "{name} ima stariji Erevos: prvo ga ondje ažuriraj.",
  "The other device could not take the groups: they stay here.": "Drugi uređaj nije mogao preuzeti grupe: ostaju ovdje.",

  // Linking with the short code (components/quick-link.tsx, lib/link-nostr.ts).
  'Inside hidden chats, link with the code Link to my phone shows inside the same hidden chats on the computer.':
    'Unutar skrivenih razgovora poveži kodom koji „Poveži s mojim telefonom“ prikazuje unutar istih skrivenih razgovora na računaru.',
  '{why} Link this way instead: sign in to the server below, then tap Link to my phone.':
    '{why} Poveži drugačije: prijavi se na server ispod, pa dodirni „Poveži s mojim telefonom“.',
  'Link another way':
    'Poveži drugačije',
  'The phone that answered is not the one that read the code. Make a new code, and link again.':
    'Telefon koji je odgovorio nije onaj koji je pročitao kod. Napravi novi kod i poveži ponovo.',
  'The phone answered, but this computer could not use its server: {error}':
    'Telefon je odgovorio, ali ovaj računar nije mogao koristiti njegov server: {error}',
  'The phone answered. Setting up this computer…':
    'Telefon je odgovorio. Podešava se ovaj računar…',
  'Linking with the phone…':
    'Povezivanje s telefonom…',
  'Keep both open for a moment. Nothing has to be typed or compared.':
    'Ostavi oba otvorena još malo. Ništa se ne mora ukucavati ni upoređivati.',
  'Scan this with the phone that holds the account, then tap Link on the phone. Nothing else.':
    'Skeniraj ovo telefonom koji ima nalog, pa dodirni „Poveži“ na telefonu. Ništa više.',
  'Making the code…':
    'Pravi se kod…',
  'The phone sends this computer what it needs through Nostr, end-to-end encrypted. The code works for half an hour.':
    'Telefon šalje ovom računaru ono što mu treba preko Nostra, šifrovano od kraja do kraja. Kod važi pola sata.',
  'The computer did not answer. On it, tap Link another way and sign in to the server there, then scan its code again.':
    'Računar nije odgovorio. Na njemu dodirni „Poveži drugačije“, tamo se prijavi na server i ponovo skeniraj njegov kod.',
  'Linked to {name}. The chats go to it now.':
    'Povezano s uređajem {name}. Razgovori sada idu tamo.',
  'Link {name} to this phone?':
    'Poveži {name} s ovim telefonom?',
  'Link only a computer of yours, whose code you scanned just now. It gets the chats of this space and the messages chosen below.':
    'Povezuj samo svoj računar, čiji si kod upravo skenirao. Dobija razgovore ovog prostora i poruke izabrane ispod.',
  'Waiting for the computer…':
    'Čeka se računar…',
  'No Nostr server could be reached.':
    'Nijedan Nostr server nije bio dostupan.',
  'The Nostr server did not take it.':
    'Nostr server ga nije prihvatio.',
  'No Nostr server took it.':
    'Nijedan Nostr server ga nije prihvatio.',
  'Asked. On {name}, tap Link again: it links to this phone and keeps its chats.':
    'Zatraženo. Na uređaju {name} dodirnite „Ponovo poveži“: povezuje se s ovim telefonom i zadržava svoje razgovore.',
  'Let go of {name}':
    'Zaboravi {name}',
  'It is asked nothing from this phone. To link it later, link it as the first time.':
    'Ovaj telefon od njega više ništa ne traži. Da biste ga kasnije povezali, povežite ga kao prvi put.',
  'Let go':
    'Zaboravi',
  'Said yes. Once the phone hears it, this device is linked to it again.':
    'Pristali ste. Čim telefon to sazna, ovaj uređaj je ponovo povezan s njim.',
  '{name} asks to link again':
    '{name} traži ponovno povezivanje',
  'A backup of the phone was put back on {name}, which asked {when}. If you did that, link this device to it: it keeps its chats and gets what came since, and the phone before gets nothing more from it. If not, tap Not now: it stays linked as it is.':
    'Rezervna kopija telefona vraćena je na {name}, koji je to zatražio {when}. Ako ste to vi uradili, povežite ovaj uređaj s njim: zadržava svoje razgovore i dobija ono što je stiglo u međuvremenu, a prethodni telefon od njega više ništa ne dobija. Ako niste, dodirnite „Ne sada“: ostaje povezan kao što jeste.',
  'Waiting for {name}: it has to be on.':
    'Čeka se {name}: mora biti uključen.',
  'Link again':
    'Ponovo poveži',
  'From the backup':
    'Iz rezervne kopije',
  'These devices were linked to the phone this backup was made on. Ask only those that are still yours: each shows the ask, and links to this phone once Link again is tapped on it. It keeps its chats, and gets what came since.':
    'Ovi uređaji su bili povezani s telefonom na kojem je napravljena ova rezervna kopija. Zatražite samo od onih koji su još vaši: svaki prikazuje zahtjev i povezuje se s ovim telefonom čim se na njemu dodirne „Ponovo poveži“. Zadržava svoje razgovore i dobija ono što je stiglo u međuvremenu.',
  'It said yes. Linking…':
    'Pristao je. Povezuje se…',
  'Asked {when}. Waiting for Link again to be tapped on it.':
    'Zatraženo {when}. Čeka se da se na njemu dodirne „Ponovo poveži“.',
  'Linked there {when}.':
    'Tamo povezan {when}.',
  'Not asked yet.':
    'Još nije zatraženo.',
  'Ask to link again':
    'Zatraži ponovno povezivanje',
  'The phone no longer asks this device to link again.':
    'Telefon više ne traži od ovog uređaja ponovno povezivanje.',
  '{name} asks this device to link again, as a backup of the phone was put back there. If you did that, tap Link again in Linked devices.':
    '{name} traži od ovog uređaja ponovno povezivanje, jer je tamo vraćena rezervna kopija telefona. Ako ste to vi uradili, dodirnite „Ponovo poveži“ u „Povezani uređaji“.',
  'The phone this backup was made on had linked devices. In Linked devices, ask those that are yours to link again: each keeps its chats.':
    'Telefon na kojem je napravljena ova rezervna kopija imao je povezane uređaje. U „Povezani uređaji“ zatražite ponovno povezivanje od onih koji su vaši: svaki zadržava svoje razgovore.',
};
