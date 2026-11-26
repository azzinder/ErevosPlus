// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of What's new, what each version changed (lib/whats-new.ts, app/whats-new.tsx) (i18n/sh/index.ts).
export const whatsNew: Record<string, string> = {
  "**Messenger's case no longer locks you out**: in Erevos+, after half a minute in Messenger **In its case**, or on Facebook, Erevos+ no longer locks as if you had left it, nor closes the page. The lock's time now counts only from when you leave Erevos+ itself.":
    "**Messengerova futrola te više ne zaključava napolju**: u Erevos+, nakon pola minute u Messengeru **U svojoj futroli**, ili na Facebooku, Erevos+ se više ne zaključava kao da ste ga napustili niti zatvara stranicu. Vrijeme zaključavanja sada se računa tek od kada napustite sam Erevos+.",
  "**Release candidate 3**: Erevos+ with everything Erevos 3.0.0-rc.3 brought, and what is below.":
    "**Kandidat za izdanje 3**: Erevos+ sa svim što je donio Erevos 3.0.0-rc.3, i onim što slijedi.",
  "**Session and Signal in backups**: in Erevos+, a backup now holds Session's account and chats, sealed with its password, and a restore brings them back. It holds Signal's history too, but not its link to the account: register or link Signal again, and the old messages show beside the new ones, to read only. **Backups** and the message after a backup say that Telegram and Messenger are not in it, and what each needs after a restore. See [Backups](#backup).":
    "**Session i Signal u kopijama**: u Erevos+, sigurnosna kopija sada čuva nalog i razgovore Sessiona, šifrovane njenom lozinkom, a vraćanje ih donosi nazad. Čuva i istoriju Signala, ali ne i njegovu vezu s nalogom: ponovo registruj ili poveži Signal, i stare poruke se vide pored novih, samo za čitanje. **Rezervne kopije** i poruka nakon kopije kažu da Telegram i Messenger nisu u njoj, i šta svakom treba nakon vraćanja. Vidi [Rezervne kopije](#backup).",
  "**One + for every chat**: in Erevos+'s Telegram, Signal, Messenger and Session chats, **+** beside where you write opens a grid with icons, as in Erevos's own chats, in place of the grey buttons. See [Telegram](#telegram).":
    "**Jedan + za svaki razgovor**: u Telegram, Signal, Messenger i Session razgovorima Erevos+, **+** pored mjesta gdje pišeš otvara mrežu s ikonama, kao u Erevosovim razgovorima, umjesto sivih dugmadi. Vidi [Telegram](#telegram).",
  "**Where you write stays at the bottom**: in a Telegram, Signal, Messenger or Session chat with few messages, the field no longer sits under the last message in the middle of the screen.":
    "**Mjesto za pisanje ostaje dolje**: u Telegram, Signal, Messenger ili Session razgovoru s malo poruka polje više ne stoji ispod zadnje poruke na sredini ekrana.",
  "**Messenger in its case, one way in**: in Erevos+, with Messenger **In its case**, its card in **Services** opens the case as Settings does, and Facebook's feed is in the case's own bar, with no Facebook card or button beside it. If the case cannot open, Erevos says why. See [Messenger](#messenger).":
    "**Messenger u svojoj futroli, jedan put**: u Erevos+, s Messengerom **U svojoj futroli**, njegova kartica u **Usluge** otvara futrolu kao Postavke, a Facebookov feed je u traci futrole, bez Facebook kartice ili gumba pored. Ako se futrola ne može otvoriti, Erevos kaže zašto. Vidi [Messenger](#messenger).",
  "**Telegram notices go once read**: in Erevos+, a Telegram chat read and left at once no longer leaves its notice of new messages behind, and a muted chat says nothing of what came meanwhile once it is unmuted. See [Telegram](#telegram).":
    "**Obavještenja Telegrama nestaju kad pročitaš**: u Erevos+, Telegram razgovor koji pročitaš i odmah napustiš više ne ostavlja za sobom obavještenje o novim porukama, a utišan razgovor ne javlja ništa o onome što je stiglo u međuvremenu kad mu se vrati zvuk. Vidi [Telegram](#telegram).",
  "**Release candidate**: Erevos+ as it is meant to come out, with everything Erevos 3.0.0-rc.1 brought.":
    "**Kandidat za izdanje**: Erevos+ kakav treba da izađe, sa svim što je donio Erevos 3.0.0-rc.1.",
  "**Release candidate 3**: Erevos Lite with what Erevos 3.0.0-rc.3 brought to its chats: it starts by itself after the phone turns on, shows nothing of a space before its password, sends backups to your own server by hand too, and can begin with a server of your own.":
    "**Kandidat za izdanje 3**: Erevos Lite s onim što je Erevos 3.0.0-rc.3 donio njegovim razgovorima: sam se pokreće kad se telefon uključi, ne pokazuje ništa od prostora prije njegove lozinke, šalje rezervne kopije na vaš server i ručno, i može početi s vlastitim serverom.",
  "**Your own server from the first start**: on a phone with no relay yet, **I have no invite**, at the first start and on **New chat**, opens one screen that says where your messages wait and offers every way to begin: an account at a server such as LPHL, **I have a server of my own**, with its address and the code you were given, or **Start without a server**. See [Erevos on your own servers](#own-servers).":
    "**Vlastiti server od prvog pokretanja**: na telefonu koji još nema relay, **Nemam pozivnicu**, pri prvom pokretanju i u ekranu **Novi razgovor**, otvara ekran koji kaže gdje čekaju vaše poruke i nudi sve načine da počnete: račun na serveru kao što je LPHL, **Imam vlastiti server**, s njegovom adresom i kodom koji ste dobili, ili **Počnite bez servera**. Vidite [Erevos na vlastitim serverima](#own-servers).",
  "**Speech and translation models from a server of yours**: where Erevos asks to download them, **Download from another server…** takes a web folder of yours that holds the same files; Erevos checks every file and refuses one that was changed. See [Erevos on your own servers](#own-servers).":
    "**Modeli za govor i prevođenje s vašeg servera**: tamo gdje Erevos traži da ih preuzme, **Preuzmi s drugog servera…** prima vaš web folder s istim datotekama; Erevos provjerava svaku datoteku i odbija onu koja je izmijenjena. Vidite [Erevos na vlastitim serverima](#own-servers).",
  "A contact link made for a website is read when pasted or scanned whatever web server its page is on; until now, only from LPHL's.":
    "Link za kontakt za web stranicu čita se kad ga zalijepite ili skenirate, na kojem god web serveru bila njegova stranica; dosad samo s LPHL-ovog.",
  "An invite by SMS is read the same way, whatever web server its page is on.":
    "Pozivnica SMS-om čita se na isti način, na kojem god web serveru bila njena stranica.",
  "LPHL's addresses are now in one place in the code: a community that builds Erevos for itself can name its own web server and first relay instead.":
    "LPHL-ove adrese sada su na jednom mjestu u kodu: zajednica koja sama gradi Erevos može umjesto njih navesti svoj web server i svoj prvi relay.",
  "**Erevos starts by itself after the phone turns on**: where it receives in the background, it now does so unless you choose **Wait until I open it**, under **Settings** → **Notifications** → **In the background**; until now, only once you turned it on there. Before you open a space it reads no message and rings for no call: the spaces set to **Also while another space is open** say only that something came. See [Chat through a relay](#relay).":
    "**Erevos se sam pokreće kad se telefon uključi**: gdje prima u pozadini, sada to radi, osim ako izaberete **Čekaj dok ga ne otvorim**, pod **Postavke** → **Obavijesti** → **U pozadini**; dosad samo ako ste to tamo uključili. Prije nego otvorite prostor ne čita nijednu poruku i ne zvoni ni za jedan poziv: prostori s **I dok je otvoren drugi prostor** kažu samo da je nešto stiglo. Vidite [Razgovor preko relaya](#relay).",
  "**Nothing of a space shows before its password**: on Android, the phone covers Erevos's screens as it goes to the background, and back after the 30 seconds they show only after the password. **Lock now** covers them at once, and **Fingerprint or face** is there as soon as the password screen shows. See [Password lock](#lock).":
    "**Ništa od prostora se ne vidi prije njegove lozinke**: na Androidu telefon prekrije ekrane Erevosa čim ode u pozadinu, a ako se vratite nakon 30 sekundi, vide se tek nakon lozinke. **Zaključaj sada** ih odmah prekrije, a **Otisak prsta ili lice** je tu čim se pokaže ekran za lozinku. Vidite [Zaključavanje lozinkom](#lock).",
  "**Camera before the password**: on Android, with Erevos locked, the camera's icon opens the camera at once. What it takes is encrypted as it is taken and shows only after the password, in the Collection; to have the camera wait for the password, turn off **Open the camera without the password** in the Collection's settings. See [Collection](#collection).":
    "**Kamera prije lozinke**: na Androidu, sa zaključanim Erevosom, ikona kamere odmah otvara kameru. Ono što snimi šifrira se već pri snimanju i vidi se tek nakon lozinke, u Zbirci; da kamera čeka lozinku, isključite **Otvori kameru bez lozinke** u postavkama Zbirke. Vidite [Zbirka](#collection).",
  "**Backups to your own server, by hand too**: **Make a backup** offers **To a server (WebDAV)** beside **Into a folder**, also with automatic backups off; once a server is set, its button sends a backup there at once. See [Backups](#backup).":
    "**Rezervne kopije na vaš vlastiti server, i ručno**: **Napravi rezervnu kopiju** nudi **Na server (WebDAV)** pored **U folder**, i s isključenim automatskim kopijama; kad je server postavljen, njegovo dugme odmah šalje kopiju tamo. Vidite [Rezervne kopije](#backup).",
  "**Clear numbers for a backup**: once one is made, Erevos says how big it is in all, with the files beside it, when it began and when it ended, and what is not in it. See [Backups](#backup).":
    "**Jasni brojevi za rezervnu kopiju**: kad je gotova, Erevos kaže koliko je velika ukupno, s datotekama pored nje, kad je počela i kad je završila, i šta nije u njoj. Vidite [Rezervne kopije](#backup).",
  "**The Collection's server, checked and brought back**: in the Collection's settings, **Check** looks whether every piece of its files is on its WebDAV server, whole, and opens 4 picked at random; **Bring back the files not on this phone** fetches at once every file this phone lacks. See [Collection](#collection).":
    "**Server Zbirke, provjeren i vraćen**: u postavkama Zbirke, **Provjeri** gleda je li svaki dio njenih datoteka čitav na njenom WebDAV serveru i otvara 4 nasumično izabrana; **Vrati datoteke kojih nema na ovom telefonu** odjednom donosi svaku datoteku koja nedostaje ovom telefonu. Vidite [Zbirka](#collection).",
  "**New chat, as it was meant to look**: **Near me**, **Far away** and **I have their code** are three large buttons, with **My link**, **Blocked contacts** and **For advanced users** small under them; the QR code for someone beside you shows small, and large at a tap, and an invite's link shows short on the page, though what is sent is always the whole link. See [Chat through a relay](#relay).":
    "**Novi razgovor, kako je zamišljen**: **Pored mene**, **Daleko** i **Imam njegov kod** su tri velika dugmeta, s **Moj link**, **Blokirani kontakti** i **Za napredne korisnike** malim ispod njih; QR kod za nekoga pored vas pokazuje se malen, a velik na dodir, a link pozivnice pokazuje se kratak na stranici, iako se uvijek šalje cijeli link. Vidite [Razgovor preko relaya](#relay).",
  "**SMS conversations like Erevos's own chats**: **+** opens under the field as in them, with **Send later** among the rest, and in a short conversation the field stays at the bottom. See [SMS](#sms).":
    "**SMS razgovori kao Erevosovi razgovori**: **+** se otvara ispod polja kao u njima, s **Pošalji kasnije** među ostalim, a u kratkom razgovoru polje ostaje dolje. Vidite [SMS](#sms).",
  "**Nostr, Matrix and XMPP chats like Erevos's own**: **+** opens under the field as in them, with **Disappearing message** and **Send later**, and in a short chat the field stays at the bottom.":
    "**Nostr, Matrix i XMPP razgovori kao Erevosovi**: **+** se otvara ispod polja kao u njima, s **Poruka koja nestaje** i **Pošalji kasnije**, a u kratkom razgovoru polje ostaje dolje.",
  "The home screen no longer says, for a few seconds after the password on a phone with many chats, that there is no relay yet: the line waits until it knows.":
    "Početni ekran više ne kaže nekoliko sekundi nakon lozinke, na telefonu s mnogo razgovora, da još nema relaya: red čeka dok ne zna.",
  "On Android and in the desktop app, a backup made by hand is now read back from its folder, as the automatic ones are, and a backup sent to a server is checked there: it and every part it names are there, each of the size it was sent with.":
    "Na Androidu i u desktop aplikaciji, rezervna kopija napravljena ručno sada se ponovo čita iz svog foldera, kao automatske, a kopija poslana na server tamo se provjerava: ona i svaki dio koji navodi su tamo, svaki veličine s kojom je poslan.",
  "After each copy of the Collection to its WebDAV server, Erevos lists the folder again: a piece that is not there whole goes again with the next copy.":
    "Nakon svakog kopiranja Zbirke na njen WebDAV server, Erevos ponovo izlista folder: dio koji tamo nije čitav ide ponovo sa sljedećim kopiranjem.",
  "On Android, the lock's 30 seconds are counted on a clock that changing the phone's date and time does not move.":
    "Na Androidu se 30 sekundi zaključavanja broje na satu koji promjena datuma i vremena na telefonu ne pomjera.",
  "What the camera takes with Erevos locked is encrypted for the Collection of the space opened last, with a key of its own: the locked camera keeps no key that opens anything.":
    "Ono što kamera snimi dok je Erevos zaključan šifrira se za Zbirku posljednjeg otvorenog prostora, vlastitim ključem: zaključana kamera ne drži nijedan ključ koji bilo šta otvara.",
  "**QR codes and invites with SMS invites off**: a contact QR code or an invite link you take yourself now works also with the invites by SMS turned off under **Find Erevos on a number**; until now nothing happened then.":
    "**QR kodovi i pozivnice s isključenim SMS pozivnicama**: QR kod kontakta ili link pozivnice koji sami prihvatite sada radi i kad su pozivnice putem SMS-a isključene pod **Pronađi Erevos na broju**; dosad se tada ništa nije dešavalo.",
  "**Release candidate 2**: Erevos Lite with what Erevos 3.0.0-rc.2 brought to its chats: New chat that asks where the other person is, and the fixes with it.":
    "**Kandidat za izdanje 2**: Erevos Lite s onim što je Erevos 3.0.0-rc.2 donio njegovim razgovorima: Novi razgovor, koji pita gdje je druga osoba, i ispravke uz njega.",
  "**New chat asks where the other person is**: **Near me** makes two phones side by side each other's contacts with nothing typed, once both show the same six pictures; **Far away** sends an invite with any app; **I have their code** takes 8 digits, a link or a QR code. See [Chat through a relay](#relay).":
    "**Novi razgovor pita gdje je druga osoba**: **Pored mene** od dva telefona jedan pored drugog pravi kontakte bez ikakvog kucanja, čim oba pokažu istih šest slika; **Daleko** šalje pozivnicu bilo kojom aplikacijom; **Imam njegov kod** prima 8 cifara, link ili QR kod. Pogledajte [Razgovor preko relaya](#relay).",
  "**Camera at a tap**: on Android, **Appearance** → **Launcher icons** → **Camera** gives the Collection's camera an icon of its own among the phone's apps, and holding Erevos's icon down offers **Camera** too. See [Collection](#collection).":
    "**Kamera na jedan dodir**: na Androidu, **Izgled** → **Ikone u pokretaču** → **Kamera** daje kameri Zbirke vlastitu ikonu među aplikacijama telefona, a dugi pritisak na ikonu Erevosa također nudi **Kamera**. Pogledajte [Zbirka](#collection).",
  "**Chat options in SMS conversations**: a sliders button beside where you write opens **Chat options**, one tidy list in place of the rows of buttons: notifications, the chat's look, search, media and more.":
    "**Opcije razgovora u SMS razgovorima**: dugme s klizačima pored mjesta gdje pišete otvara **Opcije razgovora**, jednu urednu listu umjesto redova dugmadi: obavještenja, izgled razgovora, pretraga, mediji i drugo.",
  "**Chat options in Nostr, Matrix and XMPP chats**: the same sliders button beside where you write, with the contact's own options on Nostr; Nostr's **+** now holds what goes with a message.":
    "**Opcije razgovora u Nostr, Matrix i XMPP razgovorima**: isto dugme s klizačima pored mjesta gdje pišete, s opcijama samog kontakta na Nostru; Nostrov **+** sada sadrži ono što ide uz poruku.",
  "**The warning without Tor comes once**: that your internet address can be seen is now said once for a whole network, not in every chat; after that a quiet line above where you write says it, with **Through Tor for this chat**.":
    "**Upozorenje bez Tora dolazi jednom**: da se vaša internet adresa može vidjeti sada se kaže jednom za cijelu mrežu, ne u svakom razgovoru; nakon toga to kaže nenametljiv red iznad mjesta gdje pišete, uz **Preko Tora za ovaj razgovor**.",
  "**Start when the phone turns on**: after the phone restarts, Erevos now waits with a notice in the status bar and no longer stops without a word; a tap on the notice opens it for the password.":
    "**Pokreni kad se telefon uključi**: nakon ponovnog pokretanja telefona Erevos sada čeka s obavještenjem u statusnoj traci i više ne staje bez riječi; dodir na obavještenje otvara ga za lozinku.",
  "**Backup progress stays in sight**: **Make a backup** shows how far it is again when you leave the screen, or Erevos, and come back, and then how it ended.":
    "**Napredak rezervne kopije ostaje na vidiku**: **Napravi rezervnu kopiju** ponovo pokazuje dokle je stigla kad napustite ekran, ili Erevos, pa se vratite, a zatim i kako je završila.",
  "Unlocking with a fingerprint or face no longer turns itself off by mistake, when Erevos checked its key while the phone itself was locked or Android answered late.":
    "Otključavanje otiskom prsta ili licem više se ne isključuje samo greškom, kad je Erevos provjeravao svoj ključ dok je sam telefon bio zaključan ili je Android kasno odgovorio.",
  "**Near me** shows six pictures made from a key the two phones agree on then: a phone in between would show each of you different ones, and each phone gives its contact link only once its owner says the pictures are the same.":
    "**Pored mene** prikazuje šest slika napravljenih od ključa o kojem se dva telefona tada dogovore: telefon između njih svakome bi pokazao druge, a svaki telefon daje svoj link za kontakt tek kad njegov vlasnik kaže da su slike iste.",
  "**Speed dial with Erevos locked**: if you turn it on under **Phone** → **Settings**, holding 2 to 9 on the Phone opened without the password calls your speed dial numbers with Erevos locked too. See [Phone](#phone).":
    "**Brzo biranje kad je Erevos zaključan**: ako ga uključite pod **Telefon** → **Postavke**, držanje tipki od 2 do 9 u Telefonu otvorenom bez lozinke poziva vaše brojeve brzog biranja i kad je Erevos zaključan. Pogledajte [Telefon](#phone).",
  "**Release candidate**: Erevos Lite as it is meant to come out, with what Erevos 3.0.0-rc.1 brought to its chats and calls.":
    "**Kandidat za izdanje**: Erevos Lite kakav treba da izađe, s onim što je Erevos 3.0.0-rc.1 donio njegovim razgovorima i pozivima.",
  "**Search and Ways stay in sight**: on home, the search and the **Ways** line stay under the top bar while the list scrolls.":
    "**Pretraga i Putevi uvijek na vidiku**: na početnom ekranu pretraga i linija **Putevi** ostaju ispod gornje trake dok se lista pomiče.",
  "**Calls on a locked phone**: a call that rings with the phone locked or its screen off now turns the screen on by itself. See [Phone](#phone).":
    "**Pozivi na zaključanom telefonu**: poziv koji zvoni dok je telefon zaključan ili ekran ugašen sada sam pali ekran. Pogledajte [Telefon](#phone).",
  "From a code review made with the help of AI: a restore that cannot finish leaves the phone as it was, and the relay keeps its lent places, held messages and deletions right, also after a power cut.":
    "Iz pregleda koda uz pomoć AI: vraćanje koje se ne može završiti ostavlja telefon kakav je bio, a relay ispravno čuva posuđena mjesta, poruke za kasnije i brisanja, i nakon nestanka struje.",
  "**Erevos Lite**: Erevos's own chats, groups and calls, end-to-end encrypted, in an app of its own that asks for fewer permissions. It moves to Erevos or Erevos+, and they to it, under **Updates**. See [Updates](#updates).":
    "**Erevos Lite**: Erevosovi vlastiti razgovori, grupe i pozivi, šifrirani s kraja na kraj, u zasebnoj aplikaciji koja traži manje dozvola. Prelazi na Erevos ili Erevos+, i oni na njega, pod **Ažuriranja**. Pogledajte [Ažuriranja](#updates).",
  "**Short passwords**: a new password, or PIN of hidden chats, that is short is taken only after **Use it anyway**. See [Password lock](#lock).":
    "**Kratke lozinke**: nova lozinka, ili PIN skrivenih razgovora, koja je kratka prihvata se tek nakon **Ipak koristi**. Vidi [Zaključavanje lozinkom](#lock).",
  "Tries of a password or PIN count one at a time, also across a browser's tabs; a restore that cannot finish puts back what the phone had; a release's SHA256SUMS is signed.":
    "Pokušaji lozinke ili PIN-a broje se jedan po jedan, i između kartica preglednika; vraćanje koje se ne može završiti vraća ono što je telefon imao; SHA256SUMS svakog izdanja je potpisan.",
  "**Erevos, Erevos+ or Erevos Lite**: each is now an app of its own. Choose another under **Updates**, and this Erevos hands it everything here on the phone, encrypted: open the new one within a day and it brings your chats. See [Updates](#updates).":
    "**Erevos, Erevos+ ili Erevos Lite**: svaki je sada posebna aplikacija. Odaberite drugi u **Ažuriranjima**, i ovaj Erevos mu predaje sve ovdje na telefonu, šifrovano: otvorite novi u roku od jednog dana i donosi vaše razgovore. Pogledajte [Ažuriranja](#updates).",
  "**Make a backup** shows what it does and how far it is in its card, with a bar, and a notice says when the backup is done. See [Backups](#backup).":
    "**Napravi rezervnu kopiju** pokazuje u svojoj kartici šta radi i dokle je stigla, sa trakom, a obavještenje kaže kad je kopija napravljena. Vidite [Rezervne kopije](#backup).",
  "**MMS abroad**: while roaming, an MMS waits for a tap, **Fetch (may cost)**, unless you choose otherwise under **Settings** → **Phone and SMS** → **SMS** → **MMS**. See [SMS](#sms).":
    "**MMS u inostranstvu**: u romingu MMS čeka dodir, **Preuzmi (može koštati)**, osim ako drugačije izaberete u **Postavke** → **Telefon i SMS** → **SMS** → **MMS**. Vidite [SMS](#sms).",
  "**Quick texts**: hold the **+** in an SMS conversation down for short words you write often, and keep your own. See [SMS](#sms).":
    "**Brzi tekstovi**: držite **+** u SMS razgovoru za kratke riječi koje često pišete, i sačuvajte svoje. Vidite [SMS](#sms).",
  "**Reactions from iPhones**: a like or another reaction an iPhone or Google Messages sends by SMS, Liked “…”, shows as 👍 on your message instead of a message of its own. See [SMS](#sms).":
    "**Reakcije s iPhonea**: lajk ili druga reakcija koju iPhone ili Google Messages šalje SMS-om, Liked “…”, prikazuje se kao 👍 na vašoj poruci umjesto kao zasebna poruka. Vidite [SMS](#sms).",
  "**Videos by MMS**: **+** → **Record a video** in an SMS conversation records one in MMS quality with the phone's camera app, and a video that comes plays with a tap. See [SMS](#sms).":
    "**Video putem MMS-a**: **+** → **Snimi video** u SMS razgovoru snima video u MMS kvalitetu kamerom telefona, a video koji stigne pušta se dodirom. Vidite [SMS](#sms).",
  "**Answer an SMS from its notice**: **What an SMS says, on its notice**, under the SMS settings, off at first, shows who wrote and what on the notice while the space is open, with **Reply** and **Mark as read**. Locked, it says \"New message\" again. See [SMS](#sms).":
    "**Odgovor na SMS iz obavještenja**: **Šta SMS kaže, u svom obavještenju**, u postavkama SMS-a, u početku isključeno, pokazuje u obavještenju ko je pisao i šta dok je prostor otvoren, s **Odgovori** i **Označi kao pročitano**. Zaključano, opet kaže „Nova poruka“. Vidite [SMS](#sms).",
  "**What an SMS costs**: as you write a longer SMS, a line over the field says how many SMS it goes as, 70 letters each with Greek small letters, accents or an emoji, 160 without. **Without accents (cheaper)**, under the SMS settings, sends it without accents and Greek in capitals, as the old phones wrote it. See [SMS](#sms).":
    "**Koliko košta SMS**: kad pišete duži SMS, red iznad polja kaže u koliko SMS-ova ide, po 70 znakova s grčkim malim slovima, akcentima ili emojijem, inače 160. **Bez akcenata (jeftinije)**, u postavkama SMS-a, šalje ga bez akcenata, a grčki velikim slovima, kao stari telefoni. Vidite [SMS](#sms).",
  "**Who an unknown number is, without asking anyone**: the call screen of a number that is none of your contacts says its country, place and whether it is a mobile, from the number alone, and warns of spam from a list you download whole under **Phone** → **Settings** → **Spam list**, or numbers you reported in **Recents**. See [Phone](#phone).":
    "**Ko je nepoznat broj, bez pitanja ikoga**: ekran poziva broja koji nije među vašim kontaktima kaže državu, mjesto i da li je mobilni, samo iz broja, i upozorava na spam s liste koju preuzmete cijelu pod **Telefon** → **Postavke** → **Lista spama**, ili s brojeva koje ste prijavili u **Nedavnim**. Vidi [Telefon](#phone).",
  "**Video calls through your phone company**: where your SIM and network carry them (ViLTE), a video call that comes shows **Answer with video** and **Audio only**, a call can turn video on with **Video**, and **⋯** beside a typed number offers **Video call**. See [Phone](#phone).":
    "**Video pozivi preko operatera**: gdje ih SIM kartica i mreža podržavaju (ViLTE), dolazni video poziv prikazuje **Javi se s videom** i **Samo zvuk**, poziv uključuje video dugmetom **Video**, a **⋯** pored upisanog broja nudi **Video poziv**. Vidi [Telefon](#phone).",
  "**Who is in a conference call**: once calls are merged, the call screen lists each person, with **Separate** to talk with one alone and **End** to drop one, where your phone company allows it. See [Phone](#phone).":
    "**Ko je u konferenciji**: kad spojite pozive, ekran poziva prikazuje svaku osobu, s **Odvoji** da razgovarate samo s njom i **Prekini** da je izbacite, gdje operater to dozvoljava. Vidi [Telefon](#phone).",
  "**Speed dial**: hold a key from 2 to 9 on the Phone's empty keypad to call the number you put on it; an empty key offers to choose one, and **Phone** → **Settings** → **Speed dial** shows them all. Kept sealed in the space. See [Phone](#phone).":
    "**Brzo biranje**: zadržite tipku od 2 do 9 na praznoj tastaturi Telefona da pozovete broj koji ste joj dodijelili; prazna tipka vam da da izaberete broj, a **Telefon** → **Postavke** → **Brzo biranje** pokazuje sve. Čuvaju se šifrovano u prostoru. Vidi [Telefon](#phone).",
  "**Call settings in one place**: under **Phone** → **Settings**, **Call settings** opens Android's screens for call forwarding, call waiting, showing your number and the voicemail number, for each SIM, and asks your phone company with the usual codes where a phone has no such screen. See [Phone](#phone).":
    "**Postavke poziva na jednom mjestu**: pod **Telefon** → **Postavke**, **Postavke poziva** otvaraju Androidove ekrane za preusmjeravanje, poziv na čekanju, prikaz vašeg broja i broj govorne pošte, za svaku SIM karticu, i pitaju operatera uobičajenim kodovima gdje telefon nema takav ekran. Vidi [Telefon](#phone).",
  "**Voicemail at a hold**: on the Phone's keypad, hold **1** to call your voicemail. Where your phone company sends voicemails as recordings, **Voicemail** beside **Recents** lists them, to play, call back or delete. See [Phone](#phone).":
    "**Govorna pošta jednim držanjem**: na tastaturi Telefona drži **1** da pozoveš govornu poštu. Gdje operater šalje poruke kao snimke, **Govorna pošta** pored **Nedavni** ih prikazuje, da ih preslušaš, uzvratiš poziv ili obrišeš. Vidi [Telefon](#phone).",
  "**Emergency calls without delay**: an emergency number is called at once, never asking which SIM, and with Erevos locked, **Emergency call** on the password screen opens Android's emergency keypad. See [Phone](#phone).":
    "**Hitni pozivi bez čekanja**: hitni broj poziva se odmah, bez pitanja za SIM, a kad je Erevos zaključan, **Hitni poziv** na ekranu lozinke otvara Androidovu tastaturu za hitne pozive. Vidi [Telefon](#phone).",
  "**Gallery originals, deleted as chosen**: with **Delete the original from the gallery after importing** on, a photo picked from the phone's storage is now deleted from the gallery too, and when Android does not say which photo of the gallery it is, Erevos says so instead of keeping quiet. See [Collection](#collection).":
    "**Originali iz galerije brišu se kako ste izabrali**: s uključenim **Izbriši original iz galerije nakon uvoza**, fotografija iz memorije telefona sada se briše i iz galerije, a kad Android ne kaže koja je to fotografija galerije, Erevos to kaže umjesto da šuti. Vidi [Zbirka](#collection).",
  "**The services stay in sight**: on home, the services button stays under the top bar while the list scrolls, so another part is a tap away; the search and **Ways** scroll with the list. **Names** shows only on the **SMS** part, where it belongs.":
    "**Usluge ostaju na vidiku**: na početnom ekranu dugme usluga ostaje ispod gornje trake dok se lista pomiče, pa je drugi dio na dodir; pretraga i **Putevi** se pomiču s listom. **Imena** se vide samo u dijelu **SMS**, gdje i pripadaju.",
  "**New SMS on the SMS part**: on the **SMS** part of the chat list, the button at the bottom is **New SMS** and opens only a new SMS, also with Erevos's own chats on. See [SMS](#sms).":
    "**Novi SMS u dijelu SMS**: u dijelu **SMS** liste razgovora, dugme dolje je **Novi SMS** i otvara samo novi SMS, i kada su Erevosovi razgovori uključeni. Vidi [SMS](#sms).",
  "What's new": 'Šta je novo',
  'What each version changed': 'Šta je promijenila svaka verzija',
  'What each version of Erevos changed, the newest first.': 'Šta je promijenila svaka verzija Erevosa, najnovija prva.',
  'Not out yet': 'Još nije izašla',
  'This version': 'Ova verzija',
  'For you': 'Za vas',
  'Under the hood': 'Ispod haube',
  // Not out yet.
  // 7.0.0-rc.7
  // 7.0.0-rc.6
  // 7.0.0-rc.5
  // 7.0.0-rc.4
  // 7.0.0-rc.3
  // 7.0.0-rc.2
  // 7.0.0-rc.1
  // 6.0.0-rc.2
  // 6.0.0-rc.1
  // 4.0.0-rc.10
  // 4.0.0-rc.9
  // 4.0.0-rc.8
  // 4.0.0-rc.7
  // 4.0.0-rc.6
  // 4.0.0-rc.5
  // 4.0.0-rc.4
  // 4.0.0-rc.3
  // 4.0.0-rc.2
  // 4.0.0-rc.1
  // 3.4.2
  // 3.4.1
  // 3.4.0
  // 3.3.2
  // 3.3.1
  // 3.3.0
  // 3.2.1
  // 3.2.0
  // 3.1.2
  // 3.1.1
  // 3.1.0
  // 3.0.0
  // 2.0.3
  // 2.0.2
  // 2.0.1
  // 2.0.0
  // 0.1.16
  // 0.1.14
  // 0.1.12
  // 0.1.11
  // 0.1.10
  // 0.1.8
  // 0.1.7 to 0.1.2
  "**Photos and videos, as in a gallery**: in the Collection, **Camera** is Erevos's own, so no other app sees what it takes, **From the gallery** brings in many photos and videos at once, HEIC and AVIF photos show among the photos, **Edit** turns and cuts a photo into a new one, and **Information** says whether a photo or video says where it was taken. A photo that leaves Erevos goes without where and when it was taken, unless you choose otherwise. See [Collection](#collection).": "**Fotografije i video kao u galeriji**: u Zbirci, **Kamera** je Erevosova vlastita, pa nijedna druga aplikacija ne vidi šta snimi, **Iz galerije** unosi mnogo fotografija i video snimaka odjednom, HEIC i AVIF fotografije se vide među fotografijama, **Uredi** okreće i reže fotografiju u novu, a **Informacije** kažu da li fotografija ili video govori gdje je snimljen. Fotografija koja napušta Erevos izlazi bez mjesta i vremena snimanja, osim ako izaberete drugačije. Pogledajte [Zbirka](#collection).",
  "**Night photos and HDR**: Erevos's own camera now uses the night, HDR and portrait modes of the phone's maker where the phone has them, as on a Pixel, made on the phone itself. A tap focuses there, **Darker** and **Brighter** set the light, the zoom buttons go to the wide lens, 2× and 5×, and videos can be HDR. A photo is never written anywhere, not even for a moment. See [Collection](#collection).": "**Noćne fotografije i HDR**: Erevosova vlastita kamera sada koristi noćni, HDR i portretni način proizvođača telefona gdje ih telefon ima, kao na Pixelu, rađene na samom telefonu. Dodir izoštrava tamo, **Tamnije** i **Svjetlije** podešavaju svjetlo, dugmad za zum prelaze na široki objektiv, 2× i 5×, a video može biti HDR. Fotografija se nikad nigdje ne zapisuje, ni na trenutak. Vidi [Zbirka](#collection).",
  "**Messenger in its case tells you of new messages**: in Erevos+, when you use Messenger in its case, Erevos now tells you of its new messages as it does of other chats, even if you never opened the case. A chat with messages not read shows on home until it is read, and tapping it opens it in the case; while the case is open, Erevos tells of nothing, as the page shows it. See [Messenger](#messenger).":
    "**Messenger u svojoj futroli javlja nove poruke**: u Erevosu+, kad koristiš Messenger u njegovoj futroli, Erevos te sada obavještava o njegovim novim porukama kao i o drugim razgovorima, čak i ako futrolu nikad nisi otvorio. Razgovor s nepročitanim porukama stoji na početnom zaslonu dok se ne pročita, a dodir ga otvara u futroli; dok je futrola otvorena, Erevos ne obavještava, jer ih stranica već pokazuje. Vidi [Messenger](#messenger).",
  "**Messenger in its case wears your whole look**: in Erevos+, Meta's own Messenger page in its case now takes your look: its colours, dark or light as Erevos is, the shape of your bubbles (round, square or a line), your text size, your style's letters, and what lies behind your screens (a wallpaper, Neon's grid, Paper's lines and the others), and it changes with your look even while it is open. A photo of your own stays in Erevos: there the page shows a soft gradient instead. Where Meta changes its page, parts of it may keep Meta's look. See [Messenger](#messenger).":
    "**Messenger u svojoj futroli nosi cijeli tvoj izgled**: u Erevosu+ Metina vlastita stranica Messengera u futroli sada preuzima tvoj izgled: njegove boje, tamna ili svijetla kao Erevos, oblik tvojih oblačića (okrugli, četvrtasti ili linija), veličinu teksta, slova tvog stila i ono što stoji iza tvojih ekrana (pozadina, Neonova mreža, Paperove linije i ostalo), i mijenja se s tvojim izgledom čak i dok je otvorena. Tvoja vlastita fotografija ostaje u Erevosu: tamo stranica umjesto nje pokazuje blagi prelaz boja. Gdje Meta promijeni svoju stranicu, neki dijelovi mogu zadržati Metin izgled. Vidi [Messenger](#messenger).",
  "**Messenger in its case asks for the PIN once**: in Erevos+, what Meta's page keeps now stays in the case between openings, apart from every other page, so Meta knows your phone again and no longer asks for the PIN of your encrypted chats each time you open it. It goes when you sign out of Messenger, or when another account opens the case. See [Messenger](#messenger).":
    "**Messenger u svojoj futroli traži PIN samo jednom**: u Erevosu+ ono što Metina stranica čuva sada ostaje u futroli od otvaranja do otvaranja, odvojeno od svake druge stranice, pa Meta prepoznaje tvoj telefon i više ne traži PIN tvojih šifriranih razgovora svaki put kad je otvoriš. Briše se kad se odjaviš iz Messengera ili kad futrolu otvori drugi račun. Vidi [Messenger](#messenger).",
  "**Your networks move with Erevos+**: moving from one Erevos+ to another on the same phone (as from Erevos+ 7.x to the new Erevos+), Telegram, Signal, Session, Messenger and Matrix now go on signed in, as they were. Telegram's photos and files download again as they are opened, and Messenger's page asks for its PIN once more. Moving from Erevos+ to Erevos or Erevos Lite says first that those accounts stay behind, and to write down Session's 13 recovery words. See [Updates](#updates).":
    "**Tvoje mreže se sele sa Erevos+**: pri selidbi iz jednog Erevos+ u drugi na istom telefonu (kao iz Erevos+ 7.x u novi Erevos+), Telegram, Signal, Session, Messenger i Matrix sada ostaju prijavljeni, kao što su bili. Fotografije i fajlovi sa Telegrama ponovo se preuzimaju kad ih otvoriš, a stranica Messengera još jednom traži svoj PIN. Selidba iz Erevos+ u Erevos ili Erevos Lite prvo kaže da ti nalozi ostaju iza, i da zapišeš 13 reči za oporavak za Session. Vidi [Ažuriranja](#updates).",
  "**Messenger's chats stay read**: in Erevos+, a Messenger chat you read no longer comes back unread after a while, and Mark all as read also covers the older chats Meta sends later. Only chats in Meta's inbox count as not read, as on Meta's own page: message requests and archived chats do not. With Messenger in its case, its card opens the case and home stays as you left it. See [Messenger](#messenger).":
    "**Messenger razgovori ostaju pročitani**: u Erevos+, Messenger razgovor koji si pročitao više se ne vraća kao nepročitan nakon nekog vremena, a Označi sve kao pročitano važi i za starije razgovore koje Meta pošalje kasnije. Kao nepročitani se računaju samo razgovori iz Metinog sandučeta, kao na Metinoj stranici: zahtjevi za poruke i arhivirani razgovori ne. Sa Messengerom u njegovoj futroli, njegova kartica otvara futrolu, a početna ostaje kakvu si je ostavio. Vidi [Messenger](#messenger).",
  "**Chat options in reach**: in Erevos+'s Telegram, Signal, Messenger and Session chats too, a sliders button beside where you write opens the chat's options in one tidy list, as in Erevos's own. See [Telegram](#telegram).":
    "**Opcije razgovora pri ruci**: i u razgovorima Telegrama, Signala, Messengera i Sessiona u Erevos+, dugme s klizačima pored mjesta gdje pišete otvara opcije razgovora u jednoj urednoj listi, kao u Erevosovim. Vidi [Telegram](#telegram).",
  "**Signal finds your contacts**: in Erevos+, **New chat** on Signal offers the phone's contacts that match as you type, and a typed number as **New number**. Signal is asked only about the one you tap. See [Signal](#signal).":
    "**Signal nalazi vaše kontakte**: u Erevos+, **Novi razgovor** na Signalu nudi dok kucate kontakte s telefona koji odgovaraju, a otkucani broj kao **Novi broj**. Signal se pita samo za onaj koji dodirnete. Vidi [Signal](#signal).",
  "**Release candidate 2**: Erevos+ with everything Erevos 3.0.0-rc.2 brought, and what is below.":
    "**Kandidat za izdanje 2**: Erevos+ sa svim što je donio Erevos 3.0.0-rc.2, i onim što slijedi.",
  "**Messenger's old chats no longer come back unread**: in Erevos+, after the phone restarted, Erevos+ showed old Messenger, Signal or Session chats as not read again, each with one message, although nothing new had come. Only a message that really comes now, or one that came while Erevos+ was closed, makes a chat unread. See [Messenger](#messenger).":
    "**Stari Messenger razgovori se više ne vraćaju kao nepročitani**: u Erevos+, nakon ponovnog pokretanja telefona, Erevos+ je opet prikazivao stare razgovore iz Messengera, Signala ili Sessiona kao nepročitane, svaki s jednom porukom, iako ništa novo nije stiglo. Razgovor postaje nepročitan samo porukom koja zaista stiže sada, ili koja je stigla dok je Erevos+ bio zatvoren. Vidi [Messenger](#messenger).",
};
