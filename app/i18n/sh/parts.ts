// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Serbo-Croatian for parts (lib/i18n.ts).
export const parts: Record<string, string> = {
  // The password screen and the password sheet (lock/gate.tsx, components/PasswordSheet.tsx).
  'Enter your password': 'Upišite lozinku',
  Unlock: 'Otključaj',
  'Wrong password': 'Pogrešna lozinka',
  'Use at least {n} characters.': 'Lozinka je prekratka. Najmanji broj znakova: {n}.',
  'The passwords do not match.': 'Lozinke se ne podudaraju.',
  'Use a different password.': 'Koristite drugu lozinku.',
  'New password': 'Nova lozinka',
  'Repeat password': 'Ponovite lozinku',
  'Too many attempts. Try again in {n} minute.': 'Previše pokušaja. Pokušajte ponovo za {n} minutu.',
  'Too many attempts. Try again in {n} minutes.': 'Previše pokušaja. Pokušajte ponovo za {n} minutu. | Previše pokušaja. Pokušajte ponovo za {n} minute. | Previše pokušaja. Pokušajte ponovo za {n} minuta.',
  'Too many attempts. Try again in {n} second.': 'Previše pokušaja. Pokušajte ponovo za {n} sekundu.',
  'Too many attempts. Try again in {n} seconds.': 'Previše pokušaja. Pokušajte ponovo za {n} sekundu. | Previše pokušaja. Pokušajte ponovo za {n} sekunde. | Previše pokušaja. Pokušajte ponovo za {n} sekundi.',

  // Small parts of screens.
  'QR code': 'QR kod',
  Group: 'Grupa',

  // Calls (components/call-screen.tsx, components/group-call-screen.tsx).
  'Call ended': 'Poziv je završen',
  'They hung up': 'Druga strana je prekinula',
  'Turned down': 'Odbijeno',
  'They turned it down': 'Druga strana je odbila poziv',
  'They are in another call': 'Osoba koju zovete je u drugom pozivu',
  'Not answered': 'Nema odgovora',
  'The call could not connect': 'Poziv se nije mogao uspostaviti',
  'The call could not connect on their phone': 'Poziv se nije mogao uspostaviti na telefonu druge osobe',
  'Calling…': 'Pozivanje…',
  'Ringing…': 'Zvoni…',
  'Incoming video call': 'Dolazni videopoziv',
  'Incoming voice call': 'Dolazni glasovni poziv',
  'Connecting…': 'Povezivanje…',
  'Missed call': 'Propušteni poziv',
  Decline: 'Odbij',
  Answer: 'Javi se',
  Unmute: 'Uključi mikrofon',
  Mute: 'Isključi mikrofon',
  Speaker: 'Zvučnik',
  'Camera on': 'Uključi kameru',
  'Camera off': 'Isključi kameru',
  Flip: 'Promijeni kameru',
  End: 'Prekini',
  'You started a group video call': 'Pokrenuli ste grupni videopoziv',
  'You started a group call': 'Pokrenuli ste grupni poziv',
  '{name} started a group video call': '{name} poziva grupu na videopoziv',
  '{name} started a group call': '{name} poziva grupu',
  'Waiting for others · {time}': 'Čeka se na ostale · {time}',
  'Missed group call': 'Propušteni grupni poziv',
  'Could not open the microphone': 'Mikrofon se nije mogao uključiti',
  'Pictures pause with more than {n} in the call': 'Slika se pauzira kad broj osoba u pozivu premaši {n}',
  'Group video call · end-to-end encrypted': 'Grupni videopoziv · šifrirano s kraja na kraj',
  'Group voice call · end-to-end encrypted': 'Grupni glasovni poziv · šifrirano s kraja na kraj',
  'In the call': 'U pozivu',
  Join: 'Pridruži se',
  '{name} tried to call. Accept their message request to take calls from them.':
    '{name}: pokušaj poziva. Prihvatite zahtjev za razgovor da biste od te osobe primali pozive.',
  'The call ended.': 'Poziv je završen.',
  'The call has ended.': 'Poziv je završen.',
  'Calls are set up through the server. Type its address in Server first.': 'Pozivi se uspostavljaju preko servera. Prvo upišite njegovu adresu u „Server“.',

  // The web app's card (components/integrity-card.tsx, lib/integrity.web.ts).
  'This web app': 'Ova web-aplikacija',
  'Release {version}, checked': 'Izdanje {version}, provjereno',
  'Not checked: no service worker runs Erevos here': 'Nije provjereno: ovdje nijedan service worker ne pokreće Erevos',
  "Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is":
    'Erevos pokreće samo kod potpisan svojim ključem za izdanja, koji se čuva na ovom uređaju. Otisak ključa je',
  '. It must match the one you were given with the address of this server.': '. Mora se podudarati s onim koji ste dobili uz adresu ovog servera.',
  'Release {version} is checked and starts the next time Erevos opens.': 'Izdanje {version} je provjereno i pokreće se sljedeći put kad se Erevos otvori.',
  'Last looked for updates {when}.': 'Ažuriranja su posljednji put provjerena {when}.',
  'Refused:': 'Odbijeno:',
  'Looking…': 'Provjera…',
  'Look for an update': 'Potraži ažuriranje',
  'Notifications while closed': 'Obavijesti dok je Erevos zatvoren',
  'On in this space': 'Uključeno u ovom prostoru',
  'Off in this space': 'Isključeno u ovom prostoru',
  'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.':
    'Kad stignu poruke ili zazvoni poziv dok je Erevos zatvoren, vaš server šalje push preko push servisa ovog preglednika (Appleovog na iPhoneu), a Erevos prikazuje koliko je poruka stiglo otkad ste ga posljednji put otvorili, na primjer „3 nove poruke“, ili „Poziv“ ako je zazvonio samo poziv, ništa više. Push ne nosi ni poruku ni ime onoga koji je šalje, a broj u njemu šifriran je za ovaj preglednik, ali push servis vidi kad nešto stigne za ovaj uređaj i da on koristi Erevos. Ako je server ili Erevos onoga koji šalje poruke stariji od verzije 2.0.0, ili ako su poruku do servera prenijeli drugi telefoni, broja nema: tada Erevos prikazuje „Nova poruka“, ili „Nove poruke“ ako ih je stiglo još, dok ga ne otvorite. Skriveni razgovori nikad nemaju obavijesti. Svaki prostor koji ih uključi ima svoju push adresu, pa adresa ne povezuje dva prostora kod njihovog servera.',
  'Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.':
    'Vašem serveru još nije bilo moguće javiti, pa obavijesti mogu i dalje stizati. Erevos će mu javiti čim bude dostupan.',
  'A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.':
    'Poziv koji stigne dok je Erevos zatvoren ne zvoni: prikazuje se samo obavijest „Poziv“. Na iPhoneu se ne može više: Apple ne dopušta web-aplikaciji ni da radi dok je zatvorena ni da zvoni kao telefon; za to bi trebala aplikacija iz App Storea. Na Androidu aplikacija Erevos zvoni i kad je zatvorena.',
  "Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.":
    'Svaki prostor koji ih ima uključene ima svoj service worker u ovom pregledniku, koji njegove postavke prikazuju: ko ih može vidjeti može prebrojati prostore s obavijestima. Zahtjev za razgovor od nekoga novog, preko vašeg linka za kontakt, možda će se prikazati tek kad se Erevos otvori.',
  'Turn off': 'Isključi',
  'Turn on': 'Uključi',
  'Erevos was tampered with': 'Erevos je izmijenjen bez dozvole',
  'The server sent this device a new service worker, the part of Erevos that checks its code, and no signed release lists it. Erevos goes on with the checked code while it is open, but once it is closed the browser may start the new one, which could show a fake Erevos. Do not open Erevos from this server again, and do not type your passwords into it, until whoever runs the server knows why. Your chats stay sealed with your password.':
    'Server je ovom uređaju poslao novi service worker, dio Erevosa koji provjerava njegov kod, a nijedno potpisano izdanje ga ne navodi. Erevos nastavlja s provjerenim kodom dok je otvoren, ali kad se zatvori, preglednik može pokrenuti novi, koji bi mogao prikazati lažni Erevos. Ne otvarajte ponovo Erevos s ovog servera i ne upisujte u njega lozinke dok onaj koji vodi server ne sazna zašto se to dogodilo. Vaši razgovori ostaju zapečaćeni vašom lozinkom.',
  'I understand': 'Razumijem',
  'Update refused': 'Ažuriranje odbijeno',
  '{reason} Erevos keeps the release it has. Settings → Privacy and security → This web app shows what was refused.':
    '{reason} Erevos zadržava izdanje koje ima. „Postavke → Privatnost i sigurnost → Ova web-aplikacija“ prikazuje pojedinosti o odbijenom.',

  // Files and photos (lib/attachments.ts, lib/photo*.ts, lib/pick-*.ts, lib/save-file*.ts, lib/backup-place.web.ts).
  'Files can be 100 MB at most.': 'Datoteke mogu imati najviše 100 MB.',
  'The file was changed on the way, so it was not kept.': 'Datoteka je izmijenjena na putu, pa nije sačuvana.',
  'The file is not on the server any more. Files wait there 14 days.': 'Datoteka više nije na serveru. Datoteke tamo čekaju 14 dana.',
  'This file is not on this phone.': 'Ova datoteka nije na ovom telefonu.',
  'This file is not on this computer.': 'Ova datoteka nije na ovom računaru.',
  // Shown after "in", as „u {folder}“: in the locative.
  'the place you chose': 'mjestu koje ste izabrali',
  'the downloads folder': 'folderu za preuzimanja',
  'Not saved: the share sheet was closed.': 'Nije sačuvano: prozor za dijeljenje je zatvoren.',
  'That folder is not there any more. Choose it again.': 'Taj folder više ne postoji. Ponovo ga izaberite.',
  // A backup that a folder did not take, in plain words (lib/backup-place.ts folderTrouble).
  'The app this folder belongs to made no file in it. Choose a folder on the phone instead, or try again later.':
    'Aplikacija kojoj ovaj folder pripada nije napravila datoteku u njemu. Umjesto toga izaberite folder na telefonu ili pokušajte ponovo kasnije.',
  'Erevos may no longer write in this folder. Choose it again.': 'Erevos možda više ne može pisati u ovaj folder. Ponovo ga izaberite.',
  'There is no room left in this folder. Make room, or choose another one.': 'U ovom folderu nema više prostora. Oslobodite prostor ili izaberite drugi.',
  'The backup could not be written in this folder: {reason}': 'Rezervna kopija nije mogla biti sačuvana u ovom folderu: {reason}',
  'Ready to save.': 'Spremno za čuvanje.',
  Original: 'Original',
  'Original: the photo as it was, full size, with only its place, phone and time taken out.':
    'Original: fotografija kakva je bila, u punoj veličini, samo bez podataka o mjestu, telefonu i vremenu snimanja.',
  '{quality}%: a new, smaller photo, quicker to send. It says nothing but its picture.':
    '{quality}%: nova, manja fotografija, brža za slanje. Ne otkriva ništa osim same slike.',
  'This photo does not get small enough for an MMS.': 'Ova fotografija ne može se dovoljno smanjiti za MMS.',
  'Erevos may not use the camera. Allow it in the phone settings to take photos.': 'Erevos ne smije koristiti kameru. Dozvolite to u postavkama telefona da biste snimali fotografije.',
  'Voice message': 'Glasovna poruka',
  Sticker: 'Naljepnica',
  'File: {name}': 'Datoteka: {name}',
  'That voice message is too long.': 'Ta glasovna poruka je preduga.',

  // When a message or an SMS sent for later goes (components/later-picker.tsx, lib/later.ts).
  'In 1 hour': 'Za 1 sat',
  'Tonight 20:00': 'Večeras u 20:00',
  'Tomorrow 09:00': 'Sutra u 09:00',
  Day: 'Dan',
  Hour: 'Sat',
  Minutes: 'Minute',
  'Goes on {when}.': 'Šalje se {when}.',
  'That time has gone by. Choose one ahead.': 'To vrijeme je prošlo. Izaberite vrijeme u budućnosti.',
  'At most a year ahead.': 'Najviše godinu dana unaprijed.',
  // The home screen's list (lib/inbox.ts).
  'You: {text}': 'Vi: {text}',
  Sun: 'Ned',
  Mon: 'Pon',
  Tue: 'Uto',
  Wed: 'Sri',
  Thu: 'Čet',
  Fri: 'Pet',
  Sat: 'Sub',

  // Contacts and chats (lib/e2e.ts, lib/space-chats.ts, lock/).
  "That is this chat's own contact link.": 'To je vaš vlastiti link za kontakt.',
  'That code has no key. Ask for their contact link or QR code from this version of Erevos.':
    'Taj kod nema ključ. Zatražite link za kontakt ili QR kod iz ove verzije Erevosa.',
  'No such contact.': 'Takav kontakt ne postoji.',
  'Not a contact.': 'Nije kontakt.',
  'That is not a phone number.': 'To nije broj telefona.',
  'Not a time Erevos keeps messages for.': 'Erevos ne nudi to vrijeme za čuvanje poruka.',
  'No conversation with this contact.': 'Nema razgovora s ovim kontaktom.',
  'That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.':
    'Taj kontakt koristi server {relay}, a njegov link nema ključ za taj server. Zatražite novi link.',
  'Wrong password for this backup.': 'Pogrešna lozinka za ovu rezervnu kopiju.',

  // Groups (lib/groups.ts, lib/space-groups.ts).
  'No groups here yet.': 'Ovdje još nema grupa.',
  'Give the group a name.': 'Dajte grupi naziv.',
  'You made the group.': 'Napravili ste grupu.',
  'Only the group’s admin adds members.': 'Samo admin grupe dodaje članove.',
  'You are not in this group any more.': 'Više niste u ovoj grupi.',
  'Only the group’s admin renames it.': 'Samo admin grupe može je preimenovati.',
  'Only the group’s admin takes members out.': 'Samo admin grupe uklanja članove.',
  'You closed the group.': 'Zatvorili ste grupu.',
  'You asked to leave. The group closes here once the admin takes you out.': 'Zatražili ste izlazak. Grupa se ovdje zatvara kad vas admin ukloni.',
  'You left the group.': 'Napustili ste grupu.',
  'You are no longer in the group.': 'Više niste u grupi.',
  'member {id}': 'član {id}',
  '{who} added you to the group.': 'Admin {who} vas je dodao u grupu.',
  '{who} joined.': '{who} je sada u grupi.',
  '{who} left.': '{who} više nije u grupi.',
  'You asked {who} for their contact link.': 'Zatražili ste da vam {who} pošalje link za kontakt.',
  '{who} asked for your contact link.': '{who} traži vaš link za kontakt.',
  'You sent {who} your contact link. You are each other’s contacts now.': 'Poslali ste svoj link za kontakt. Vi i {who} sada imate jedno drugo u kontaktima.',
  '{who} sent their contact link. You are each other’s contacts now.': '{who} šalje svoj link za kontakt. Sada imate jedno drugo u kontaktima.',
  '{who} could not be added as a contact.': '{who}: dodavanje u kontakte nije uspjelo.',
  'Ask for contact links on the phone that holds this account.': 'Linkove za kontakt tražite na telefonu na kojem je ovaj račun.',
  'They are not in this group any more.': 'Taj član više nije u ovoj grupi.',
  'Not in public groups.': 'U javnim grupama to nije moguće.',
  'More than one member of this group shows this key, so one of them is not who they say. Ask for their contact link some other way.':
    'Više od jednog člana ove grupe prikazuje ovaj ključ, pa jedan od njih nije onaj za koga se izdaje. Link za kontakt zatražite na neki drugi način.',
  'Another space is open now.': 'Sada je otvoren drugi prostor.',
  'Groups go through the server. Type its address in Server first.': 'Grupe idu preko servera. Prvo upišite njegovu adresu u „Server“.',

  // The build and updates (lib/core.ts, lib/crypto.ts, lib/install-update*.ts, lib/updates.ts, lib/shell.ts).
  'This build has no Erevos core, so it cannot encrypt. Rebuild the app.': 'Ova verzija nema jezgru Erevosa, pa ne može šifrirati. Ponovo izgradite aplikaciju.',
  'The Erevos core gave back something unexpected.': 'Jezgra Erevosa vratila je nešto neočekivano.',
  'This build of Erevos has no Tor.': 'Ova verzija Erevosa nema Tor.',
  'This build of Erevos has no Nostr.': 'Ova verzija Erevosa nema Nostr.',
  'This build has no secure random source. Rebuild the app so it includes expo-crypto.':
    'Ova verzija nema siguran izvor slučajnih brojeva. Ponovo izgradite aplikaciju tako da sadrži expo-crypto.',
  'This release has no Android package.': 'Ovo izdanje nema Android paket.',
  'The download was cut short.': 'Preuzimanje je prekinuto.',
  'The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.':
    'Preuzimanje je stalo pri svakom pokušaju, jer veza neko vrijeme nije donosila ništa. Ništa nije instalirano: pokušajte ponovo kasnije ili na drugoj mreži.',
  'Show what is typed': 'Prikaži upisano',
  'Hide what is typed': 'Sakrij upisano',
  'The downloaded package is not the one the release published. Nothing was installed.':
    'Preuzeti paket nije onaj koji je izdanje objavilo. Ništa nije instalirano.',
  'This version installs from the download page.': 'Ova verzija se instalira sa stranice za preuzimanje.',
  'GitHub answered {status}.': 'GitHub je odgovorio: {status}.',
  "The web app's server answered {status}.": 'Server web-aplikacije je odgovorio: {status}.',
  'The desktop app answered {status}.': 'Aplikacija za računar je odgovorila: {status}.',
  'There is no room left on this device. Free some space and try again.': 'Na ovom uređaju više nema slobodnog prostora. Oslobodite malo i pokušajte ponovo.',
  'This computer has no keyring to seal Erevos’s keys with, so Erevos keeps none. Start a keyring (KWallet, or GNOME Keyring with --password-store=gnome-libsecret), or start Erevos with --plain-secrets to keep them unsealed, readable by your user, and set a password lock.': 'Ovaj računar nema keyring kojim bi zapečatio ključeve Erevosa, pa Erevos ne čuva nijedan. Pokrenite keyring (KWallet ili GNOME Keyring s --password-store=gnome-libsecret) ili pokrenite Erevos s --plain-secrets da ih čuva nezapečaćene, čitljive vašem korisniku, i postavite zaključavanje lozinkom.',
  'The browser did not open its storage.': 'Preglednik nije otvorio svoj prostor za podatke.',

  // LoRa and nearby phones (lib/lora.ts, lib/nearby.ts).
  'The radio restarts with its new settings, and links again.': 'Radio se ponovo pokreće s novim postavkama i ponovo povezuje.',
  'There is no server, and no Erevos phone is linked nearby. Type the server address in Server, or come near their phone.':
    'Nema servera, a u blizini nije povezan nijedan Erevos telefon. Upišite adresu servera u „Server“ ili priđite telefonu druge osobe.',
  'Too large for LoRa, which takes only text. It can go once the server can be reached, or near their phone.':
    'Preveliko za LoRa vezu, koja prenosi samo tekst. Može se poslati kad server bude dostupan ili u blizini telefona druge osobe.',

  // The relay (lib/relay.ts, lib/sms-invite.ts); {what} is the request's name.
  'An id is 48 hex characters.': 'ID ima 48 heksadecimalnih znakova.',
  'Through Tor: {reason}': 'Preko Tora: {reason}',
  'cannot reach the server at {url}, or the token is wrong': 'server {url} nije dostupan ili je token pogrešan',
  'message is not held': 'poruka se ne čuva za kasnije',
  'the server at {url} cannot keep messages for later: update it': 'server {url} ne može čuvati poruke za kasnije: ažurirajte ga',
  'The server at {url} that keeps it is no longer set here.': 'Server {url} koji je čuva više nije postavljen ovdje.',
  'the server closed the connection': 'server je zatvorio vezu',
  'the server did not answer in time': 'server nije odgovorio na vrijeme',
  'lost the connection to the server': 'veza sa serverom je izgubljena',
  '{what}: queue not found': '{what}: red nije pronađen',
  '{what}: queue is full': '{what}: red je pun',
  '{what}: your free place on this server has used all it may today. It goes on tomorrow.': '{what}: vaše besplatno mjesto na ovom serveru danas je iskoristilo sve što smije. Nastavlja se sutra.',
  '{what}: the server could not save it, try again later': '{what}: server to nije mogao sačuvati, pokušajte ponovo kasnije',
  '{what}: the second server could not reach your server, try again later': '{what}: drugi server nije mogao doći do vašeg servera, pokušajte ponovo kasnije',
  '{what}: the file is not on the server any more': '{what}: datoteka više nije na serveru',
  '{what}: the server has no room for files now, try again later': '{what}: server trenutno nema mjesta za datoteke, pokušajte ponovo kasnije',
  '{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.': '{what}: vaše besplatno mjesto na ovom serveru danas je prenijelo sve datoteke koje smije. Datoteke idu opet sutra.',
  '{what}: the server could not keep it, try again later': '{what}: server to nije mogao zadržati, pokušajte ponovo kasnije',
  '{what}: your server could not reach the server the file is on': '{what}: vaš server nije mogao doći do servera na kojem je datoteka',
  '{reason}. A server older than this app cannot take files: update it.': '{reason}. Server stariji od ove aplikacije ne može primati datoteke: ažurirajte ga.',
  'message is too large': 'poruka je prevelika',
  'your server has no key for two-hop sending, so it was not sent through the second server':
    'vaš server nema ključ za slanje u dva skoka, pa nije poslano preko drugog servera',
  'the link has given all its places on its server. Ask them for a new link': 'link više nema slobodnih mjesta na svom serveru. Zatražite novi link',
  'The server address is too long for an SMS invite.': 'Adresa servera je preduga za SMS pozivnicu.',

  // Notifications in the web app (lib/web-push*.ts).
  'Notifications through the browser are for the web app.': 'Obavijesti preko preglednika postoje samo za web-aplikaciju.',
  'Your server does not send notifications. It needs a newer version, set up with a push key.':
    'Vaš server ne šalje obavijesti. Potrebna mu je novija verzija, postavljena s push ključem.',
  'This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.':
    'Ovaj preglednik ne može prikazivati obavijesti za zatvorenu web-aplikaciju. Na iPhoneu prvo dodajte Erevos na početni ekran.',
  'Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.':
    'Obavijesti za Erevos nisu dozvoljene. Dozvolite ih u postavkama ovog preglednika ili telefona.',
  'Set up the server first, under Server.': 'Prvo postavite server, pod „Server“.',
  'Notifications could not be turned on: {reason}': 'Obavijesti se nisu mogle uključiti: {reason}',
  // Calls' lines in a chat (lib/call-lines.ts).
  'Voice call': 'Glasovni poziv',
  'Video call': 'Videopoziv',
  'Group call': 'Grupni poziv',
  'Group video call': 'Grupni videopoziv',
  'Missed voice call': 'Propušteni glasovni poziv',
  'Missed video call': 'Propušteni videopoziv',
  'Missed group video call': 'Propušteni grupni videopoziv',
  '{missed}, while in another call': '{missed}, dok je trajao drugi poziv',
  'turned down': 'odbijen',
  'could not connect': 'nije uspostavljen',
  'they were in another call': 'osoba je bila u drugom pozivu',
  'not answered': 'bez odgovora',
  'Only {given} of the {all} files went to the downloads, so they are not all saved.': 'Samo {given} od {all} datoteka otišlo je u preuzimanja, pa nisu sve sačuvane.',
  'Save the files': 'Sačuvaj datoteke',
  '{given} of the {all} files went to the downloads. Tap Save for the next one: {name}': '{given} od {all} datoteka otišlo je u preuzimanja. Dodirnite Sačuvaj za sljedeću: {name}',
  "The browser did not keep it.": "Preglednik to nije sačuvao.",
  "New device of {who}: your messages go to it too.": "Novi uređaj korisnika {who}: vaše poruke idu i na njega.",
  "A device of {who} changed its key: your messages do not go to it.": "Uređaj korisnika {who} je promijenio ključ: vaše poruke ne idu na njega.",
};
