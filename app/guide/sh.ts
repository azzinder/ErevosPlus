// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/** The user guide in Serbo-Croatian. Its format: lib/guide.ts. The same sections, in the same order and shape, as the English one. */
export const guide = `
## Šta je Erevos {#about}

Erevos je aplikacija za razmjenu poruka napravljena za privatnost. Za korištenje vam ne trebaju nalog, broj telefona
ni e-mail, i zamišljen je tako da radi gdje god da ste: preko telefona u blizini bez ikakve mreže, preko Wi-Fi mreže
ili preko interneta.

- **U blizini, bez interneta:** dva Android telefona razgovaraju direktno preko Bluetootha, Wi-Fi Aware ili Wi-Fi
  Directa, šifrirano s kraja na kraj, a isto tako i telefoni i računari na istoj Wi-Fi mreži ili na hotspotu nekog
  telefona. S LoRa radiom tekstovi idu kilometrima daleko.
- **Preko relaya:** preko Wi-Fi mreže ili interneta, kroz mali server (relay) koji možete sami pokretati.
- **Prostori:** zaključavanje lozinkom, druga lozinka koja otvara zaseban, prazan Erevos, i skriveni razgovori u
  svakom prostoru.
- **Izgled:** LPHL izgledi: Classic, Modernist i Nocturne, dvanaest paleta i staklo kao na lphl.nekten.eu.

{-**Erevos+** je ista aplikacija sa više: razgovori sa ljudima na Telegramu, Messengeru, Signalu, Sessionu, Matrixu,
XMPP-u i Nostru, na Androidu 8.0 ili novijem. Prelaziš na nju, ili nazad, u **Ažuriranja**: vidi
[Erevos, Erevos+ ili Erevos Lite, i beta verzije](#update-channel).}

> Poruke su **šifrirane s kraja na kraj**, i preko relaya i u blizini, ali još ništa nisu provjerili nezavisni
> stručnjaci. [Šta je danas zaštićeno](#privacy) kaže tačno šta jeste, a šta nije zaštićeno.

Ovaj vodič se otvara iz stavke **Korisnički vodič** u meniju početnog ekrana (tri tačke na vrhu). Pretraga na njegovom
vrhu pronalazi bilo koju riječ u njemu. Vodič je na svim jezicima aplikacije i prikazuje se na onom koji ste
izabrali, pogledajte [Jezik](#start).

### Ko ga pravi i zašto

- **Ko:** Erevos, by azzinder: ista osoba koja je napravila [Fasouli](https://github.com/azzinder/lphl-chrima-releases/releases/latest), privatnu aplikaciju za tvoje finansije.
- **Gdje:** nije važno. Važno je to što relay i aplikacija za preglednik rade na vlastitom serveru autora
  (lphl.nekten.eu).
- **Za koga:** za svakoga ko želi razgovarati sa svojim ljudima bez davanja broja telefona, e-maila ili naloga:
  prijatelje, porodice, grupe i one koji žive tamo gdje se internet prekida ili nadzire. I za one koji, iako nemaju
  šta da kriju, žele da njihov lični prostor ostane privatan, daleko od znatiželjnih očiju.
- **Zašto:** zato što poznate aplikacije traže broj telefona, znaju ko s kim razgovara i prestaju raditi kad nestane
  interneta. Zato što nas „uslovi korištenja“ nekih od njih ne zadovoljavaju, a sumnjamo u to kako štite našu
  privatnost. Zato što drugima nedostaju funkcije koje su nam potrebne. Erevos ne traži ništa i pronalazi put kroz
  ono što postoji: internet, Wi-Fi, Bluetooth, telefon u blizini.
- **Ko plaća:** niko: nema oglasa, nema investitora, nema prikupljanja podataka. Ko želi, može pomoći oko troškova
  rada, poput servera: u **Postavke** → **Općenito** → **Podržite Erevos** su načini, Liberapay, PayPal, Monero i
  Bitcoin. Davali ili ne, u aplikaciji se ništa ne mijenja.
  **Zašto:** svaki način se otvara izvan Erevosa, u pregledniku ili novčaniku, samo kada ga dodirnete, pa Erevos sam
  ništa ne šalje i nikad ne zna ko je dao. PayPal zna ko daje; Monero ne pokazuje ni ko je dao ni koliko; Bitcoin ne
  pokazuje imena, ali je javno ono što je adresa primila.
- **Kontakt:** **Postavke** → **Općenito** → **Kontakt** dodaje autora kao kontakt, a vi mu pišete u samom Erevosu,
  šifrirano s kraja na kraj, bez broja telefona i bez e-maila.

### Napravljeno uz otvoreni kod drugih

Sam Erevos je slobodan softver, pod licencom AGPL-3.0-or-later, pogledajte [Licenca](#licence), a izgrađen je na radu
drugih s otvorenim kodom. Ovo su glavni dijelovi, svaki sa svojim autorima i licencom:

- **Element Call** (Element; AGPL-3.0): Matrix pozivi.
- **Arti, lyrebird, Snowflake i WebTunnel** (The Tor Project; Arti MIT ili Apache-2.0, lyrebird BSD-2-Clause, Snowflake
  BSD-3-Clause, WebTunnel MIT): Tor u aplikaciji i Tor mostovi na Androidu.
- **vodozemac** (Matrix.org Foundation; Apache-2.0): šifrovanje Matrixa.
- **OpenMLS** (OpenMLS Authors; MIT): šifrovane grupe.
- **Biblioteke RustCrypto i dalek-cryptography** (njihovi programeri; MIT ili Apache-2.0 za RustCrypto, BSD-3-Clause za
  dalek-cryptography): samo šifrovanje.
- **React Native, Expo i react-native-webrtc** (Meta, 650 Industries i zajednica React Native WebRTC; MIT): aplikacija i
  njeni pozivi.
- **Electron** (Electron contributors; MIT): aplikacija za računar.
- **Inter fontovi** (Rasmus Andersson i Inter Project Authors; SIL Open Font License 1.1): fontovi aplikacije.

Cijeli popis, svaki paket s njegovom licencom, nalazi se u datoteci \`CREDITS.md\` koja dolazi s izvornim kodom Erevosa.

**Zašto:** zato što su njihovi autori svoj rad dali slobodno i tražili da budu imenovani, i zato što trebate moći
vidjeti od čega je Erevos napravljen.

Ovaj dio se otvara i iz **Postavke** → **Općenito** → **O Erevosu**.

## Prvi koraci {#start}

Erevos se preuzima s njegove stranice izdanja, po jedna datoteka za svaki sistem: pogledajte [Ažuriranja](#updates) za
to gdje i kako ga ažurirati. Radi na Androidu, na računaru (Linux, macOS i Windows), na Sailfish OS-u i, iz
preglednika, na iPhoneu. Ako ste novi, počnite s pozivnicom od nekoga ko ga koristi: jedan QR kod ili link, i već ste
unutra, s tom osobom kao kontaktom (pogledajte Pozivanje nekoga novog, pod [Razgovor preko relaya](#relay)).

Početni ekran je popis vaših razgovora, s onim u kojem se posljednje nešto desilo na vrhu. Svaki prikazuje sliku
kontakta, posljednju poruku s njenim oznakama, kada je stigla i koliko poruka te osobe niste pročitali. Sat pored njega
znači da njegove poruke nestaju. **Traži razgovore** pronalazi razgovor po imenu ili posljednjoj poruci, a ispod
razgovora i poruke koje sadrže ono što upišete, u svim razgovorima prostora: dodirnite jednu da se njen razgovor
otvori na njoj. U razgovoru, njegovi detalji imaju **Traži u ovom razgovoru**: ▲ i ▼ vode na ono što je pronađeno
ranije i kasnije. Obje pretrage traže samo na ovom telefonu: u onome što on čuva zapečaćeno, a **Traži u ovom
razgovoru** i u SMS porukama koje prikazuje razgovor s kontaktom; skriveni razgovori pretražuju se samo iznutra. Dug
razgovor otvara se na svojih posljednjih 100 poruka, a ranije poruke, među njima i one uvezene iz Telegrama ili
WhatsAppa, dolaze same dok listate prema gore (donosi ih i **Prikaži ranije poruke**, iznad njih); odlazak na neku
raniju poruku (iz pretrage, s poruke sa zvjezdicom ili na poruku na koju neka poruka odgovara) također je donosi.
Svaki razgovor se otvara na svojoj posljednjoj poruci, s trakom za poruke ispod nje: razgovori s kontaktima, grupe i SMS
razgovori{+, kao i razgovori preko Matrixa, XMPP-a i Nostra}. Kad malo listate prema gore, dolje desno pojavljuju se
okrugle strelice, u svakom od njih: gornja vodi na početak razgovora, a donja nazad na njegov kraj. Između njih, ako je
pri otvaranju razgovora bilo novih poruka, dvostruka kvačica vodi na prvu od njih, tamo gdje je stalo, dok ta poruka nije
na ekranu. Od početka, **Prikaži kasnije poruke**, ispod onoga što je prikazano, donosi još; pisanje poruke ili donja
strelica vraćaju na kraj.

**Zašto:** dug razgovor se otvara na posljednjim porukama da bi se otvorio odmah: iscrtavanje cijelog razgovora
odjednom bilo bi sporo, naročito na starijim telefonima. Skriveni razgovori izostavljeni su iz pretrage početnog
ekrana kako bi početni ekran izgledao isto, imao prostor skrivene razgovore ili ne: njihove poruke mogu se čitati samo
dok ih njihov PIN drži otvorenima.

**Prikvačeni i arhivirani:** na početnom ekranu zadržite bilo koji razgovor, s kontaktom ili grupom{+, na Matrixu,
XMPP-u, Nostru ili u SMS-u}{-, pa i SMS razgovor}, za **Prikvači na vrh**, **Arhiviraj** i, na Androidu, **Utišaj ovaj razgovor**. Najviše 10
razgovora ostaje prikvačeno. Arhivirani razgovor napušta popis dok iz njega ne stigne nova poruka; dodirnite
**Arhivirano** na vrhu da vidite šta ste arhivirali, i SMS, i dodirnite ponovo da se vratite. Skriveni razgovori imaju
svoje prikvačene i arhivirane razgovore.

- **Slika** se iscrtava iz ključa kontakta: isti ključ uvijek daje iste boje i isti mjesec{+ (u zelenim tonovima pod
  Matrixom)}, pa razgovor prepoznajete na prvi pogled, bez ikakve fotografije. To nije provjera ključa; to je
  [sigurnosni broj](#relay).
- **Linija ispod pretrage** kaže je li postavljen relay i je li vaš red spreman. Dodirnite je da ga postavite.
- **Razgovor sa sobom**, uvijek prvi među razgovorima, prikvačen, čuva vaše bilješke za sebe: pogledajte Razgovor sa
  sobom i podsjetnici ispod.
- [+] **Matrix razgovori**, kad se prijavite na Matrix, nalaze se na listi s ostalima, najnoviji prvi, svaki označen
  **Matrix**, a pozivnica stoji na vrhu. Dugme **Matrix** pokazuje samo njih, i tamo **Novi razgovor** počinje
  Matrix razgovor: pogledajte [Matrix](#matrix).
- [+] **XMPP razgovori**, kad se prijavite na XMPP, nalaze se na listi na isti način, svaki označen **XMPP**, a ko traži da
  vas doda ili grupa koja vas poziva stoji na vrhu. Dugme **XMPP** pokazuje samo njih, i tamo **Novi razgovor** počinje
  XMPP razgovor: pogledajte [XMPP](#xmpp).
- [+] **Nostr razgovori**, kad prostor ima Nostr ključ, na popisu su na isti način, svaki označen s **Nostr**. Dugme
  **Nostr** prikazuje samo njih, s brojem nepročitanih poruka, a tamo **Novi razgovor** otvara ekran Nostr razgovora:
  pogledajte [Razgovori s drugim Nostr aplikacijama](#nostr-chats).
- **Označi sve kao pročitano**, u meniju ⋮, odjednom čita svaki razgovor onog dijela liste u kojem se nalazite (sve
  poruke, SMS{- ili Erevos}{+, Erevos, Matrix, XMPP ili Nostr}), i utišane i zaključane PIN-om, nakon što pita. Svaki se čita kao da ste
  ga otvorili, pa oni koji su pisali saznaju kao tada; pozivnice i ljudi koji traže da vas dodaju ostaju dok im ne
  odgovorite.{+ Ekrani Matrixa, XMPP-a i Nostra imaju je pod **Razgovori** za svoje razgovore.} Skrivene razgovore nikad ne
  čita.
- [+] **Javni feed**, kad prostor ima Nostr ključ ili je u javnoj Matrix sobi, još je jedno dugme, **Javno**: jedan feed,
  kao u Amethystu, s javnim objavama ljudi koje prati vaš Nostr ključ i porukama javnih Matrix soba u kojima ste,
  najnovije prvo. Svaka pokazuje ko ju je napisao (malo N ili M kaže mrežu), kada, njene riječi, njene fotografije u
  objavi i karticu za njenu vezu. Kad su uključena oba, **Svi**, **Nostr** i **Matrix** iznad feeda biraju šta se vidi,
  a **Fotografije** biraju kako se fotografije i kartice donose. Ispod objave: odgovoriti, ponovo podijeliti, označiti
  da vam se sviđa i podijeliti; ispod Matrix poruke: odgovoriti, reagovati i podijeliti. **Nova objava**, olovka dolje,
  piše javnu objavu, s do četiri fotografije. Pogledajte [Razgovori s drugim Nostr aplikacijama](#nostr-chats).
- **Novi razgovor**, na dnu, otvara postavke relaya i dodavanje kontakta. **Podsjeti me**, narandžasto zvono pored
  njega, piše podsjetnik za vas.
- **Zelena slušalica i ljubičasta osoba** na vrhu, na Androidu, odmah otvaraju ekrane **Telefon** i **Kontakti**, u
  bojama njihovih ikona na početnom ekranu telefona. Nema ih i u meniju pod tri tačke.
- **Dugme usluga**, ispod gornje trake, gdje ostaje dok se lista pomiče, čim su u Modulima uključena dva dijela s porukama, kaže koji se dio popisa vidi
  (**Sve usluge** ili izabrani), sa znakovima usluga, nepročitanim porukama svih i, crveno, uslugom koja sada nije
  povezana. Dodirnite ga za prozor **Usluge**: kartica za svaki uključeni dio, i bez razgovora zasad, svaka sa svojim
  nepročitanim porukama (99+ iznad 99) i tačkom, zelenom dok je njena mreža povezana, crvenom uz **Van mreže** kad
  nije. Kartica prikazuje samo taj dio: **Sve poruke** sve razgovore, **SMS** samo SMS (s razgovorima čija je
  posljednja poruka bila SMS; tu piše ako Erevos još nije SMS aplikacija), **Erevos** samo Erevos razgovore, svakog
  kontakta, šta god da je stiglo posljednje{+, a **Matrix**, **XMPP**, **Javno** i **Nostr** svoje}. **Dodaj** otvara
  Module, da uključite još, a **Označi sve kao pročitano** čita prikazani dio. Držite karticu da je pomjerite naprijed
  ili nazad ili sakrijete sa **Sakrij**: skrivena usluga ostaje uključena, ali ne šalje obavještenja i ne broji se na ikoni
  (Telegram, čije se mape mogu vidjeti na početnom ekranu, i dalje da), a njeni razgovori
  nestaju i iz **Sve poruke** (pretraga ih i dalje nalazi), a čeka na dnu prozora, gdje je dodir ponovo prikazuje. Svaka
  držana kartica, i **Sve poruke**, može postati **Otvara se prvo**: tu se Erevos otvara sa svoje ikone, a na **Sve
  poruke** dok nijedna nije izabrana.
  Razgovori i grupe na **Utišano** se ne broje, kao ni u broju na ikoni Erevosa, a ono što se upiše u pretragu ne
  mijenja brojeve. Ispod dugmeta, bez pretrage, prvo dolaze razgovori s nepročitanim porukama, pod **Nepročitano**, s
  **Označi sve kao pročitano** pored, pa ostali pod **Nedavno**.
- **Widget**, na Androidu: dodajte Erevos iz widgeta svog početnog ekrana. Njegova četiri dugmeta otvaraju ekrane
  **Telefon**, **SMS**, Erevos **Poruke** i **Kontakti**, nakon lozinke kao i svaki link (Telefon i bez nje, ako to
  dozvolite). Iznad prva tri prikazuje koliko ima propuštenih poziva, nepročitanih SMS poruka i novih poruka, nikad od
  koga ni šta; s propuštenim pozivima **Telefon** se otvara na kartici **Nedavni**. Ponovo dodirnuto dugme ponovo
  prikazuje svoj ekran, i nakon što ste tamo izabrali drugu karticu. Njegove riječi prate jezik Erevosa. **Postavke**
  → **Izgled** → **Widget** određuje redoslijed njegovih dugmadi.
- **Narandžasti lokot** na vrhu odmah zaključava Erevos kad je postavljena lozinka, a kad nije, otvara postavke
  zaključavanja.
- **Tri tačke** otvaraju ostalo:

| U meniju | Šta otvara |
| --- | --- |
| **Nova grupa** | Grupni razgovor s vašim kontaktima. Pogledajte [Grupni razgovori](#groups). |
| **Javne grupe** | Grupu u koju svako ko ima njen link može zatražiti ulazak, s vlasnikom i adminima. Pogledajte [Javne grupe](#public-groups). |
| **Poruke sa zvjezdicom** | Poruke koje ste označili zvjezdicom, u svim vašim razgovorima. Pogledajte Meni poruke, pod Razgovor preko relaya. |
| **Telefoni u blizini** | Vaše kontakte preko Bluetootha i Wi-Fi Aware ili na istoj Wi-Fi mreži, bez interneta. Pogledajte [Razgovor s telefonom u blizini](#nearby). |
| **Korisnički vodič** | Ovaj vodič. |
| **Postavke · Settings** | Posljednji red, sa zupčanikom: sve što možete podesiti, u grupama, s pretragom. Pogledajte Postavke ispod. |

Unutar razgovora, njegovo ime i slika su na vrhu, s tim kako poruke putuju: **Šifrirano** (s kraja na kraj), **Na
mreži**, **U blizini** dok je telefon te osobe povezan s vašim preko radija, ili **piše…**, sa štopericom kad poruke
razgovora nestaju. Pored njih, plava pločica s kamerom pokreće videopoziv, a zelena sa slušalicom glasovni poziv.
Dodirnite ime ili **⋯** iza njih (**⋮** na Androidu) za **Detalji** razgovora: njegova slika (dodirnite je da je
promijenite), **Pozovi**, **Video**, **Preimenuj** i **Slika**, zatim **Poruke koje nestaju**, **Blokiraj snimke ekrana**, **Prikazuj me kao da
nisam na mreži**, **Izgled razgovora**, **Sigurnosni broj**, **Premjesti u skrivene razgovore**, **Premjesti u drugi prostor** i **Obriši poruke**.
**Gotovo** ih zatvara.

**Mediji, linkovi i fajlovi**, u detaljima ispod **Traži u ovom razgovoru**, prikazuje sve što razgovor sadrži, svaku
vrstu na svojoj kartici s brojem stavki: **Fotografije** (u mreži), **Video snimci**, **Glasovne poruke**, **Muzika**,
**Fajlovi** i **Linkovi**, najnovije prve, ispod svojih mjeseci, zajedno s onima uvezenim iz Telegrama ili WhatsAppa.
Dodir otvara fotografiju ili datoteku da je pogledate ili sačuvate, pušta zvuk na licu mjesta ili otvara link nakon
pitanja; kad zadržite prst na stavci, svaka nudi **Prikaži u četu**, što vodi na njenu poruku. Na stavku koja još
nije preuzeta s relaya ide se u razgovoru, gdje je dodir preuzima. Kalendar na vrhu vodi na dan: označeni su dani koji
imaju nešto te vrste. **Idi na dan**, ispod njega u detaljima, isto radi za sam razgovor: vodi na prvu poruku tog dana.

**Zašto:** popisi se prave na ovom telefonu od onoga što on već čuva, pa nijedan server ne saznaje šta razgovor
sadrži; i čitaju se samo fotografije koje su na ekranu, kao u razgovoru, pa se razgovor s hiljadama fotografija
otvara jednako brzo kao razgovor bez ijedne.

**I {+na Matrixu, XMPP-u, Nostru i }u SMS-u:** {+razgovor na Matrixu, XMPP-u ili Nostru ima na dnu **Traži u ovom
razgovoru**, **Mediji, linkovi i fajlovi**, **Idi na dan** i **Izvezi razgovor**, pored **Obavijesti**, a }SMS razgovor
{-ima **Traži u ovom razgovoru**, **Mediji, linkovi i fajlovi**, **Idi na dan** i **Izvezi razgovor** }{+ih ima }prve u svom **⋮**. Gledaju samo ono što ovaj telefon čuva od razgovora: {+poruke koje čuva razgovor na Matrixu
(ispod pretrage, **Učitaj ranije poruke** donosi starije s njegovog servera, kao vrh razgovora), poruke razgovora na
XMPP-u ili Nostru, i }svaki SMS i MMS razgovora na telefonu; odlazak na stariji SMS učitava razgovor do njega. Ništa
što upišete u pretragu ne napušta telefon. Fotografije i fajlovi su na popisu, a dodir vodi do svakog u razgovoru,
gdje ga dodir donosi s njegovog servera kao i prije, pa nijedan server ne saznaje koje ste pogledali; slike MMS-a vide
se na samom popisu. **Izvezi razgovor** ispisuje razgovor kao za kontakt, nakon istog pitanja; razgovori skrivenog
mjesta se ne izvoze.

Dobar prvi sat:

1. Otvorite **Postavke** → **Privatnost i sigurnost** → **Zaključavanje i druga lozinka** i postavite lozinku, kako
   niko ko uzme telefon ne bi mogao otvoriti Erevos.
2. Otvorite **Telefoni u blizini** iz menija na dva telefona koji su blizu jedan drugog i dozvolite ono što Android
   traži.
3. Dodajte jedno drugo pomoću **Prikaži moj QR kod**, kao u [Razgovor s telefonom u blizini](#nearby), i pošaljite
   poruku: ide u blizini, šifrirana s kraja na kraj, bez relaya i bez interneta.
4. Da biste razgovarali s veće udaljenosti, postavite relay kao u [Razgovor preko relaya](#relay).

### Razgovor sa sobom i podsjetnici

**Razgovor sa sobom** je uvijek na vrhu razgovora, prikvačen, u svakom prostoru. To je razgovor u kojem nema nikog
drugog: pišite sebi bilješke, linkove, fotografije, datoteke i glasovne poruke, kao u svakom razgovoru. Ne ide nikome
drugom: ostaje šifrirano u prostoru, a ide samo na vaše vlastite povezane uređaje, šifrirano s kraja na kraj, pa svaki
ima iste bilješke i podsjetnike (pogledajte [Povezani uređaji](#devices)). Rezervna kopija uzima sve iz njega,
bilješke, fotografije, datoteke i glasovne poruke, kao i kod razgovora.

- **Podsjetnik:** dodirnite **Podsjeti me** (narandžasto zvono pored **Novi razgovor**), napišite na šta da vas
  podsjeti, izaberite vrijeme (**Za 1 sat**, **Večeras u 20:00**, **Sutra u 09:00** ili bilo koji dan, sat i minut) i
  dodirnite **Podsjeti me**. Ide u Razgovor sa sobom, sa zvonom i svojim vremenom. U razgovoru, **+** → **Podsjeti me**,
  ili zadržavanje prsta na strelici za slanje, i bilješci koju pišete daje vrijeme.
- **U zadano vrijeme**, na Androidu, telefon prikazuje obavijest, **Reminder** (ili **3 reminders**) – „Open Chat with
  myself to read it“, nikad ono što podsjetnik kaže, i kad je Erevos zatvoren i zaključan; kad je dodirnete, otvara
  Razgovor sa sobom, nakon lozinke. Dok ne otvorite razgovor, podsjetnik se prikazuje u njegovom redu na vrhu
  razgovora, s brojem, a u razgovoru s obojenim rubom; kad ga tamo vidite, nestaje i iz obavijesti. Na računaru, u
  web-aplikaciji ili s isključenim obavijestima, tamo ga vidite. Ako **Precizno vrijeme** nije dozvoljeno
  (**Postavke** → **Općenito** → **Dozvole**), Android ga može prikazati nekoliko minuta kasnije.
- **Zadržavanje prsta na bilješci** nudi **Kopiraj**, **Otvori** (fotografiju ili datoteku), **Podsjeti me**, ili
  **Promijeni podsjetnik** i **Bez podsjetnika**, **Premjesti u folder** te **Obriši**.
- **Folderi:** dugme foldera na vrhu, pored **Izgled razgovora**, pravi jedan. Tada se iznad bilješki prikazuju
  kartice: **Sve**, i po jedna za svaki folder, koja prikazuje samo ono što je u njemu; ono što napišete, pošaljete
  ili snimite dok je folder izabran ide u njega. Bilješka je u najviše jednom folderu: **Premjesti u folder** je
  stavlja u drugi, u novi ili **Bez foldera**. Zadržavanje prsta na kartici foldera, ili ponovni dodir, nudi
  **Preimenuj folder** i **Izbriši folder**; njegove bilješke ostaju, bez foldera. Bilješka ide na vaše povezane
  uređaje sa svojim folderom, a folder preimenovan ili izbrisan na jednom takav je i na ostalima; prazan ostaje na
  uređaju na kojem je napravljen.
- Svaki prostor ima vlastiti Razgovor sa sobom, kao i svako mjesto skrivenih razgovora, na vrhu njihovog popisa
  (pogledajte [Skriveni razgovori](#hidden)). Podsjetnici skrivenog mjesta prikazuju se tamo kad ga njegov PIN otvori;
  telefon ih javlja u njihovo vrijeme samo dok je za to mjesto uključeno **Primanje dok su zatvoreni**, u istoj
  obavijesti. Novi PIN za mjesto, s kojim ono počinje prazno, ili uklonjeno mjesto, skida njegove podsjetnike s
  telefona. Bilješke skrivenog mjesta idu samo na uređaje povezane s tim mjestom zasebno, nikad na one prostora (vidi
  [Povezani uređaji](#devices)).
- **Iz druge aplikacije:** aplikacija na telefonu može tražiti da se ovdje zadrži bilješka, kao Fasouli za plaćanje
  koje dolazi, s podsjetnikom. Erevos otvara Razgovor sa sobom nakon lozinke, u prostoru koji otvoriš, i prvo pita
  **Zadržati ovu bilješku?**, s tekstom i vremenom; samo **Dodaj** je zadržava. Ništa se ne vraća aplikaciji. Za zakazano plaćanje podsetnik dolazi ponovo, svakog meseca ili kako se plaćanje ponavlja: čim ga vidiš, prelazi na sledeći put.

**Zašto:** obavijest se na zaključanom ekranu prikazuje svakome ko drži telefon, zato ono što podsjetnik kaže ostaje
šifrirano u njegovom prostoru, a Androidu se kaže samo njegovo vrijeme: obavijest nikome ne može reći šta ste htjeli
zapamtiti, niti u kojem je prostoru. A bilješke ne idu nikome osim vašim vlastitim uređajima, šifrirane s kraja na
kraj među njima kao vaši razgovori: relay ih prenosi samo šifrirane.

- **Iz drugih razgovora:** poruka iz {+razgovora na Matrixu, XMPP-u, Nostru ili SMS-a}{-SMS razgovora} može doći i ovdje, s podsjetnikom:
  **Podsjeti me** u njenom meniju.

### Kretanje prevlačenjem

- **Nazad:** prevucite udesno bilo gdje na ekranu da se vratite nazad, kao što to radi strelica nazad. Okrugla strelica
  izlazi slijeva; pustite kad bude cijela, ili brzo povucite, i vraćeni ste. Ako pustite ranije, ostajete. U razgovoru
  radi ono što radi njegova strelica nazad: nazad na popis razgovora, ili izlaz iz skrivenih razgovora, koji se
  zatvaraju. U **Detalji** razgovora ih zatvara.
- **Kartice:** prevucite ulijevo ili udesno da pređete na susjednu karticu, kao kad dodirnete njeno dugme: **Sve
  poruke**, **SMS**, **Erevos**{+, **Matrix**, **XMPP** i **Nostr**} na početnom ekranu (one uključene u Modulima),
  **Tastatura**, **Nedavni** i **Favoriti** u ekranu **Telefon**, filteri u ekranu **Kontakti** i kompleti naljepnica.
  Na početnom ekranu dijelovi se biraju u prozoru **Usluge**, dugmetom ispod gornje trake.
- Na ekranu s karticama prevlačenje samo mijenja karticu, i na redovima njenog popisa, a iza prve ili posljednje
  kartice ne radi ništa: tamo se vratite strelicom nazad. SMS razgovor se arhivira ili briše zadržavanjem prsta na
  njemu.

### Postavke

**Postavke · Settings**, posljednji red menija (tri tačke), sadrži sve što u Erevosu možete podesiti, u grupama, kao
što to rade vlastite postavke telefona. Na drugim jezicima naziv je na tom jeziku i na engleskom, kao
**Einstellungen · Settings**, kako bi se pronašao i na jeziku koji ne znate čitati.

- **Pretraži postavke,** na vrhu, pronalazi postavku po početku njenih riječi, sa ili bez dijakritičkih znakova, i
  pokazuje gdje se nalazi, kao **Telefon i SMS › SMS**. Dodirnite je da je otvorite.
- **Jezik · Language,** red ispod pretrage, otvara popis jezika, pogledajte Jezik ispod.
- **Grupa** otvara popis svojih postavki, a postavka otvara svoj ekran. Postavka s dijelovima, kao **SMS**, navodi ih,
  i svaki dio se otvara zasebno.
- **Prikazuje se samo ono što ovdje radi:** na računaru, na Sailfish OS-u i u web-aplikaciji nema **Telefon i SMS**,
  Tora, Nostra ni LoRa, a grupa u kojoj ovdje nema šta da se podesi ne prikazuje se.
- **Samo uključeni moduli:** postavke isključenog modula, kao što su {+**Matrix** ili }**Telefon i SMS**, također se
  ne prikazuju: pogledajte [Moduli](#modules).

| Grupa | Šta sadrži |
| --- | --- |
| **Općenito** | **Jezik**, **Moduli**, **Ažuriranja**, **Daj Erevos obližnjem telefonu** (Android), **Šta je novo**, **O Erevosu**, **Podržite Erevos** i **Dozvole** (Android i web-aplikacija). Pogledajte Jezik ispod, [Moduli](#modules), [Ažuriranja](#updates) i [Erevos obližnjem telefonu](#give-app). |
| **Izgled** | **Stil i boje** (površina, staklo, stil, tema, boje i tekst na obojenim površinama, s pregledom), **Pozadina**, **Poruke** (oblik oblačića), **Ikone u pokretaču** (Android), **Widget** (Android) i **Vibracija na dodir** (Android). Pogledajte [Izgled](#appearance). |
| **Obavijesti** | **U pozadini** (Android i aplikacija za računar): primanje i zvonjenje dok je Erevos zatvoren, i obavijest o porukama; na računaru, ostaje li Erevos pokrenut sa zatvorenim prozorom. **Obavijesti dok je Erevos zatvoren** (web-aplikacija): Web Push. **Broj na ikoni**: koliko poruka nije pročitano, na ikoni Erevosa. Pogledajte [Na iPhoneu](#iphone) i [Na računaru](#desktop). |
| **Privatnost i sigurnost** | **Zaključavanje i druga lozinka** (zaključavanje pri otvaranju Erevosa, lozinka, privatnost ekrana, otisak prsta ili lice, druga lozinka), **Skriveni razgovori** (PIN-ovi 4 mjesta), **Gumb za paniku** (s lozinkom za paniku), **Kalkulator umjesto Erevosa** (Android, u Izgledu), **Snimci ekrana** (Android) i **Ova web-aplikacija** (samo web-aplikacija). Pogledajte [Zaključavanje lozinkom](#lock), [Druga lozinka](#second), [Skriveni razgovori](#hidden) i [Gumb za paniku](#panic). Vidi i [Obriši me odasvud](#forget). |
| **Relay i mreže** | **Putevi**, **Relay** (otvara **Novi razgovor** s otvorenim **Za napredne korisnike**), **Kućni relay**, **Tor** (Android), **Nostr** (Android){+,}{- i} **LoRa radio** (Android){+, **Matrix**, **XMPP** i **Nostr razgovori**}. Pogledajte [Razgovor preko relaya](#relay), [Kućni relay](#home-relay), [Preko Tora](#tor), [Preko Nostra](#nostr){+,}{- i} [Preko LoRa radija](#lora){+, [Matrix](#matrix), [XMPP](#xmpp) i [Razgovori s drugim Nostr aplikacijama](#nostr-chats)}. |
| **Telefon i SMS** (Android) | **Telefon**, postavke aplikacije za telefon, iste kao **Telefon** → **Postavke**. **SMS**, u dijelovima: **Erevos kao SMS aplikacija**, **Pronađi Erevos na broju**, **SMS kad ništa drugo ne radi**, **Imena iz vaših kontakata**, **Arhiva, spam i otpad**, **Filter spama**, **Blokirani brojevi**, **Povlačenje SMS-a**, **Dvije SIM kartice** (samo s dvije SIM kartice) i **Novi SMS**. Pogledajte [Telefon](#phone) i [SMS](#sms). |
| **Podaci i uređaji** | **Rezervne kopije**, **Dijelovi rezervne kopije**, **Povezani uređaji** i **Uvezeni razgovori**. Pogledajte [Rezervne kopije](#backup), [Dijelovi rezervne kopije kod prijatelja](#backup-pieces), [Povezani uređaji](#devices) i [Uvezeni razgovori](#import). |
| **Za testiranje** | **Test relaya** i **Test radija** (Android). Pogledajte [Ekrani za testiranje](#tests). |

### Jezik

Erevos je na engleskom, grčkom, njemačkom, francuskom, španskom, italijanskom, portugalskom i srpskohrvatskom. Kad se
prvi put pokrene, prati jezik telefona ako je to jedan od ovih (telefon na srpskom, hrvatskom, bosanskom ili
crnogorskom pokreće se na srpskohrvatskom), a inače je na engleskom. Da ga promijenite, otvorite meni (tri tačke),
dodirnite **Postavke · Settings**, njegov posljednji red, a zatim prvi red tamo, **Jezik · Language**. Na drugim
jezicima oba su navedena na tom jeziku i na engleskom, kao **Einstellungen · Settings** i **Sprache · Language**.
Zatim dodirnite jezik, svaki naveden svojim riječima: **Ελληνικά**, **English**,
**Deutsch**, **Español**, **Français**, **Italiano**, **Português** ili **Srpskohrvatski**. Cijela aplikacija se
mijenja odmah.

- **Ovaj vodič** je takođe na svakom od ovih jezika i naziva dugmad onako kako ih aplikacija prikazuje na vašem. Na
  jezicima osim engleskog i grčkog, neka riječ nova u aplikaciji može se neko vrijeme prikazivati na engleskom, dok
  se ne prevede.
- **Čuva se na telefonu:** izbor se čuva na ovom telefonu, izvan svakog prostora, pa se i ekran za lozinku prikazuje
  na tom jeziku, i svaki prostor se otvara na njemu. Nije zapečaćen: ko god drži telefon može vidjeti koji ste jezik
  izabrali.
- **Androidove obavijesti** (dolazni poziv, nove poruke, Erevos koji prima u pozadini) su na grčkom kad je Erevos na
  grčkom, a na engleskom na svim ostalim jezicima.

## Moduli {#modules}

Erevos se sastoji od dijelova, svojih modula: samog **Erevosa** (njegovi vlastiti razgovori, grupe i pozivi, šifrirani
s kraja na kraj, sa skrivenim razgovorima), **Telefona**{- i}{+,} **SMS-a**{+, razgovora s **Nostr**, **Matrix** i **XMPP**
aplikacijama, te **Telegrama**, **Messengera**, **Signala** i **Sessiona**}. **Zbirka** (vaše fotografije i datoteke, šifrirane) također je modul. Telefon i SMS postoje samo na Androidu, Zbirka na Androidu, u aplikaciji za računar, u web aplikaciji i na Sailfish OS-u. Bilo koji može biti uključen, i sam Erevos, jedan ili više,
barem jedan: **Postavke** → **Općenito** → **Moduli** uključuje ili isključuje svaki u bilo koje vrijeme.

Pri sasvim prvom pokretanju Erevos se postavlja kao instalater. Prije nego se otvori njegov prvi prostor: što ne dajete
(ni broj telefona, ni e-poštu, ni korisničko ime, ni račun: ljude dodajete QR kodom ili linkom, ili vas oni pozovu), ime
za vaše kontakte ako ga želite, i jezik; zatim koje module koristiti, svaki s onim što radi. Zatim, u prostoru: ekran za
svaki izabrani modul, s onim kako početi s njim (za Erevos, kako ulazite; za Telefon i SMS, Erevos kao aplikacija za
telefon i kao aplikacija za SMS{+; za Nostr, Matrix i XMPP, vaš račun tamo}) i što Android, ili preglednik, treba dozvoliti
za njega. Svaka dozvola je na prvom ekranu koji je treba, a **Dozvoli sve, jedno po jedno** postavlja pitanja koja
Android postavlja u samom Erevosu, jedno za drugim. Zatim zaključavanje lozinkom i automatske rezervne kopije, pa što je
spremno i što nedostaje, uz **Pozovite nekoga**. **Ostalo kasnije** ostavlja ostalo za Postavke; dok ne završite ili
odgodite, koraci se opet prikazuju kad se Erevos pokrene. Otvoren s pozivom, Erevos ga prikazuje kad se koraci završe.
Nakon ažuriranja svaki modul ostaje uključen, kao prije, dok ih ne promijenite.

- **Ime:** nije korisničko ime: nitko ga ne traži i ne mora biti jedinstveno. Ide, šifrirano, samo onima koje dodate, a
  mijenja ga **Moje ime** pod Postavke → Privatnost i sigurnost.
- **Prelazak s drugog telefona:** na Androidu **Već imam {=Erevos} na drugom telefonu** preskače ime i module, koji dolaze
  s rezervnom kopijom. Prostor se otvara, **Otvori rezervne kopije** je vraća (vidi [Prelazak na novi
  telefon](#new-phone)), i slijede ekrani modula koje donosi, zatim otisak prsta i mapa automatskih rezervnih kopija,
  koji ostaju uz svaki telefon. **Još nemam rezervnu kopiju** kaže kako je napraviti.
- **Na računaru ili u pregledniku:** **Poveži s mojim telefonom** preskače korake i otvara **Povezani uređaji**.

- **Isključen:** isključen modul se ne pokreće: ništa od njega ne radi, ne čeka na serveru niti zvoni, pa je Erevos
  lakši, brže se otvara i troši manje baterije. Nigdje se ne prikazuje: ni na početnom ekranu, ni u svom meniju, ni u
  postavkama, a ikone Telefona i SMS-a nestaju među aplikacijama telefona. Veza, obavijest ili widget koji još vode do
  njega kažu da je isključen, uz **Otvori module**.
- **Ništa se ne briše:** njegovi razgovori, kontakti, računi i postavke vraćaju se kad se ponovo uključi. Kontakti,
  zaključavanje lozinkom, prostori, rezervne kopije i Postavke uvijek su tu, šta god da je uključeno.
- **Ponovo uključen:** uključeni modul se odmah pokreće, a **Dozvole** pokazuju šta Android treba dozvoliti za njega,
  kao pri prvom pokretanju.
- **Novo s ažuriranjem:** modul koji dođe s ažuriranjem, kao Zbirka sa 7, uključen je, i tamo gdje ste module izabrali
  prije nego je došao, dok ga ne isključite.
- **Telefon ili SMS isključen** dok je Erevos još aplikacija za telefon ili aplikacija za SMS: Android i dalje daje
  Erevosu pozive ili SMS-ove, sačuvane kao prije. **Otvori zadane aplikacije** bira drugu aplikaciju.
- **Samo Telefon:** bez ijednog modula koji donosi poruke, početni ekran to kaže, uz **Telefon** i **Moduli**.
- **Čuva se na telefonu:** izbor vrijedi za ovaj telefon, isti u svakom prostoru, i čuva se izvan prostora, kao ikone,
  jer se Telefon može otvoriti bez lozinke.

**Zašto:** ne žele svi sve. Ko koristi {=Erevos} samo kao telefon, ili samo za Nostr, dobija aplikaciju koja radi samo
to, i telefon koji u pozadini ne čeka poruke koje nikad ne stižu.

## Razgovor s telefonom u blizini {#nearby}

Dok je prostor otvoren, na bilo kojem ekranu, Erevos traži druge {=Erevos} telefone oko sebe, preko Bluetootha i, gdje
ga telefon ima, Wi-Fi Aware, te na Wi-Fi mreži na kojoj se nalazi, i telefone i računare. Nisu potrebni ni internet,
ni SIM kartica, ni Wi-Fi mreža. Prenosi poruke vašim kontaktima, šifrirane s kraja na kraj kao i one preko relaya.

Traži tek kad je uključeno **Traži telefone u blizini**, pod **U blizini, bez interneta**, u **Novi razgovor**:
isključeno je dok ga ne uključiš, na oba telefona, a do tada sve ide preko relaya.

1. Otvorite **Telefoni u blizini** iz menija na oba telefona. Prvi put Android traži dozvolu za pronalaženje uređaja u
   blizini (na Androidu 12 i starijem i za lokaciju); dozvolite to, inače se telefoni ne mogu pronaći.
2. Ako još niste kontakti, dodajte jedno drugo: na jednom telefonu dodirnite **Novi razgovor**, gdje se vidi **Tvoj QR
   kod**, i skenirajte ga drugim, kao u [Razgovor preko relaya](#relay). Bez relaya kod sadrži samo vaše ključeve, i
   možete se povezati samo u blizini, dok ga ne budete imali.
3. Izaberite kontakt, pišite u traci za poruku na dnu i dodirnite strelicu za slanje. Kad telefon te osobe odgovori,
   na vrhu razgovora piše **U blizini**.

- **Dok je prostor otvoren:** veze se pokreću kad se prostor otvori, bez obzira na to koji je ekran prikazan, a
  prestaju kad se otvori drugi prostor: kad se zaključa, prostor nastavlja raditi iza ekrana za lozinku. Poruka iz
  blizine prikazuje se na početnom ekranu kao i poruka preko relaya, a i poziv tamo zvoni. Na Androidu veze ostaju
  aktivne i s Erevosom u pozadini, dok je **U pozadini** postavljeno na **Primaj i zvoni**. Da bi se tada štedjela
  baterija, telefone traži rjeđe: Wi-Fi Direct svakih deset minuta, Wi-Fi Aware jedan minut od svakih pet, a na istoj
  Wi-Fi mreži druge čuje dvadeset sekundi od svake dvije minute. Telefon u blizini tako može biti pronađen nekoliko
  minuta kasnije; aktivne veze ostaju aktivne, a čim je Erevos na ekranu, traži jednako često kao i prije.
- **Domet:** nekoliko desetina metara na otvorenom, manje kroz zidove.
- **Wi-Fi Aware:** brži, ali ga nemaju svi telefoni. Bluetooth radi na svima. Da ga zaustavite, isključite **Traži
  preko Wi-Fi Aware**, iznad **Pronađi Erevos na istoj Wi-Fi mreži**.
- **Ista Wi-Fi mreža ili hotspot:** telefoni na jednoj Wi-Fi mreži, ili na hotspotu jednog telefona, pronalaze jedni
  druge i komuniciraju direktno, čak i kad ta Wi-Fi mreža nema interneta; isto važi i za desktop aplikaciju. Ako
  Android pita da li da ostane na Wi-Fi mreži bez interneta, ostanite. Svi na toj Wi-Fi mreži mogu vidjeti da je tu
  neka Erevos aplikacija, ali ne i čija. Zaštitni zid (firewall) računara mora propuštati port 47905 (UDP i TCP). Da
  to zaustavite, isključite **Pronađi Erevos na istoj Wi-Fi mreži** pod **U blizini, bez interneta**, u ekranu **Novi
  razgovor**.
- **Vlastita Wi-Fi mreža (Android 10 i noviji):** bez zajedničke Wi-Fi mreže, dva {=Erevos} telefona jedan blizu drugog
  prave vlastitu malu Wi-Fi mrežu (Wi-Fi Direct) i komuniciraju preko nje kao na istoj Wi-Fi mreži: brže nego preko
  Bluetootha, a poziv ide preko nje bez interneta. Ništa ne pita; svaki telefon, gdje može, ostaje i na svojoj Wi-Fi
  mreži. Svi u blizini mogu vidjeti da je tu {=Erevos} telefon i mogli bi se pridružiti toj maloj Wi-Fi mreži, ali bi
  dobili samo zapečaćene bajtove. Potrebno je da je **Pronađi Erevos na istoj Wi-Fi mreži** uključeno; da zaustavite
  samo ovo, isključite **Napravi Wi-Fi mrežu s telefonima u blizini** ispod toga.
- **Na Samsung telefonu** **Traži preko Wi-Fi Aware** i **Napravi Wi-Fi mrežu s telefonima u blizini** su isključeni
  dok ih ne uključite: dok ih neka aplikacija koristi, Samsung traži da se isključi njegovo vlastito dijeljenje.
  Bluetooth i ista Wi-Fi mreža rade i bez njih.
- **Drugi telefoni u blizini** dobijaju samo zapečaćene bajtove koje ne mogu otvoriti, i to samo dok telefon vašeg
  kontakta nije poznat: od tada ono što šaljete ide samo njemu. Glasovne poruke idu samo kontaktu za kojeg se zna da je
  u blizini. Za fotografije i datoteke potreban je relay.
- **Uz relay,** svaka poruka ide i preko njega, pa se ništa ne gubi ako veza pukne; kopija koja stigne druga ne
  prikazuje se ponovo. Ako relay nije dostupan, važi kopija iz blizine.
- **Prenose ih drugi telefoni:** kad relay nije dostupan, a vaš kontakt nije u blizini, {=Erevos} telefoni u blizini
  preuzimaju i vašu poruku, zapečaćenu za relay vašeg kontakta. Svaki je čuva najviše tri dana, predaje je najviše
  dvama drugim telefonima koje sretne i predaje je tom relayu preko vlastitog relaya čim može; isto radi i vaš. Ne mogu
  je čitati niti saznati od koga je i za koga: vide samo adresu relaya. Ostaje i kad se Erevos zatvori, zapečaćena na
  telefonu. Vaše ostaju u vašem prostoru i idu samo dok je on otvoren. Prenošenje za druge je uključeno dok ne
  isključite **Prenosi poruke za druge** pod **U blizini, bez interneta**, u ekranu **Novi razgovor**, i samo za
  relaye na internetu preko TLS-a (wss://): nepoznata osoba u blizini nikad ne može natjerati vaš telefon ili vaš
  relay da se obrate relayu na lokalnoj mreži ili na samom telefonu. Vaše vlastite poruke prenose telefoni u blizini
  koji to imaju uključeno.
- **Donose ih drugi telefoni:** obrnuto, kad vaš telefon nema internet, {=Erevos} telefon pored njega koji ima internet i
  prenosi za druge uzima ono što vas čeka na vašem relayu i predaje vam to u blizini. Erevos pita jednom za svaki
  takav telefon, i za telefon kontakta, jer neznanac može da prenese poruke kontakta da bi izgledao kao on, i samo dok
  je u prvom planu: **Telefon blizu vas ima internet. Da donese vaše poruke?** Taj telefon saznaje koji je red na
  vašem relayu vaš i kad ga čitate; nikad šta vaše poruke kažu, a njih otvara samo vaš telefon. Znajući red, mogao bi
  da uzme vaše poruke pre nego što stignu do vas, pa čim vaš telefon ponovo ima internet sam prelazi na novi red i
  tiho to kaže vašim kontaktima. Za skrivene razgovore pita posebno, i samo dok su na ekranu, jer bi taj telefon
  saznao da postoji drugi red, pa time da mogu postojati skriveni razgovori. Nikad za relay do kojeg se stiže samo
  preko Tora. Vaš telefon radi isto za telefone pored sebe dok je **Prenosi poruke za druge** uključeno, nikad dok ide
  preko Tora, a sa relaya koji nije njegov samo kad kažete da, upozoreni da taj relay tada vidi internet adresu vašeg
  telefona.

**Zašto:** paket ne kaže za koga je, pa niko u blizini iz njega ne može saznati čiji je. Dok telefon vašeg kontakta ne
odgovori na nekoj vezi, ni vaš telefon ne može znati koji je od telefona u blizini njegov: zato kratki paketi idu
svima, svaki ih isproba, a od prvog koji ga otvori ta veza je veza vašeg kontakta. Glasovna poruka, u većim
dijelovima, čeka na to.

> Poruka iz blizine otvara se samo u prostoru koji ima taj kontakt. Poruka za neki drugi prostor ovog telefona čeka u
> memoriji, najviše šest sati, dok se taj prostor ne otvori. Poruka za skrivene razgovore otvara
> se samo dok su otvoreni, ili primaju i zatvoreni, a do tada isto čeka.

**Zašto:** veze u blizini pripadaju telefonu, a ne prostoru, i ništa na njima ne imenuje prostor: ono što stigne
isprobava se u razgovorima prostora koji je otvoren, a za ostale se neko vrijeme čuva u memoriji, nikad se ne
upisuje na telefon. Skriveni razgovori ih koriste
i sami, ali ono što čuju je njihovo: veza na kojoj se čuo skriveni kontakt čuva se odvojeno od veze prostora, samo u
memoriji i samo dok su ti skriveni razgovori otvoreni ili primaju i zatvoreni, pa prostor nikad ne sazna da je neki
njihov kontakt u blizini; a u eteru njihove poruke izgledaju kao poruke prostora. Nikad ne nose tuđe poruke, njihove
nikad ne nose drugi, i nikad ne idu preko LoRa ni SMS-om.

**Bluetooth koji se ne može pratiti:** ono što vaš telefon šalje preko Bluetootha da bi ga drugi našli kaže samo da
je u blizini telefon s Erevosom, sa slučajnim brojem koji se mijenja svakih devet do dvanaest minuta, a na Androidu 8
i novijem s adrese koja se mijenja s njim. Tako neko ko sluša na jednom mjestu pa na drugom ne može znati da je to isti
telefon, barem ne po Erevosu. Otvorene veze ostaju otvorene. Telefoni sa starijim Erevosom nalaze vaš, a vaš njih, kao
i prije.

## Preko LoRa radija {#lora}

S Meshtastic LoRa radiom povezanim s telefonom preko Bluetootha, Erevos dopire do Erevosa s radiom na istoj mesh
mreži, kilometrima daleko, bez interneta: direktno ili preko Meshtastic radija između njih. Isključeno je dok ne
postavite radio, i samo na Androidu.

1. Prvo podesite radio u aplikaciji Meshtastic, prije svega njegovu **regiju**: bez nje ništa ne šalje. Zatim
   zatvorite aplikaciju Meshtastic ili u njoj prekinite vezu: radio se povezuje s jednom po jednom aplikacijom.
2. Otvorite **Postavke** → **Relay i mreže** → **LoRa radio**, dodirnite **Pronađi moj radio**, pročitajte šta piše i
   dodirnite svoj radio kad se pojavi. Radio koji još nije uparen traži svoj PIN: prikazuje se na ekranu radija, ili
   je 123456.
3. Vaš kontakt radi isto sa svojim, na istoj mesh mreži: ista regija i isti prvi kanal.
4. Pišite kao i uvijek. Kad relay nije dostupan i nijedan telefon nije u blizini, tekst ide preko LoRa veze, a linija
   ispod razgovora to i kaže.

- **Samo tekst, i to sporo:** poruka ide u dijelovima od oko 220 bajtova, svaki po sekundu-dvije u eteru, a zakon
  radiju dozvoljava samo ograničeno vrijeme emitiranja (u EU desetinu svakog sata). Zato LoRa prenosi samo tekstove i
  brisanja, i to samo kad to ništa drugo ne može. Glasovne poruke, fotografije i datoteke čekaju u razgovoru, označene
  s **Na čekanju**, i odlaze same čim ih relay ili telefon u blizini mogu preuzeti; i za pozive je potrebno jedno od
  toga. Prva poruka kontaktu traje duže, jer sadrži ključeve.
- **Oznake:** **✓✓** dolazi s njegovom sljedećom porukom, jer same oznake ne idu preko LoRa veze.
- **Rezervni dijelovi, i dugi tekstovi sažeti:** poruka od dva dijela ili više ide s rezervnim dijelovima iza sebe,
  jednim na svaka četiri, pa Erevos vašeg kontakta nadoknadi dijelove izgubljene usput, bez ponovnog slanja; traže
  malo više vremena u eteru. Dug tekst ide sažet, manji i bez ikakvog gubitka, kontaktu čiji Erevos čita sažete
  poruke, pa traži manje dijelova, ili uopšte stane; kratak ide kakav jeste.
- **Svakom radiju u dometu:** svaku poruku čuje svaki radio u okolini, a Meshtastic radiji je prosljeđuju dalje, kao
  što to Meshtastic radi. Svaki Erevos je isproba; otvara je samo radio vašeg kontakta. Preko LoRa veze ništa se ne
  prenosi za druge.
- **Njegovo ime i lokacija:** Meshtastic radiji povremeno javljaju svoje ime svakom radiju u dometu, a i gdje se
  nalaze ako imaju GPS ili fiksnu poziciju, nešifrirano. Erevos to sprječava kod vašeg (**Skriveno**): postavlja mu
  ulogu Client hidden, isključuje GPS i uklanja fiksnu poziciju. I dalje odgovara radiju koji pita za njegovo ime, pa
  mu u aplikaciji Meshtastic dajte ime koje ništa ne govori o vama. **Javlja se svima u dometu** vraća ulogu i GPS,
  nakon upozorenja; fiksna pozicija ponovo se postavlja u aplikaciji Meshtastic. Ako radio ne zadrži postavke, LoRa
  ekran to kaže.
- **Ostaje povezan** dok Erevos radi, i sam se ponovo povezuje kad se radio vrati u domet. **Isključi LoRa** vraća
  radiju ulogu i GPS, ako je povezan, a zatim prekida vezu s njim i zaboravlja ga. Skriveni razgovori nikad ne idu
  preko LoRa veze.

**Zašto:** ono što Meshtastic radio kaže o sebi ide nešifrirano, svakome ko sluša kilometrima daleko: njegovo ime i
lokacija mogli bi otkriti gdje ste i povezati radio s vama, pa ga Erevos drži skrivenim osim ako ne izaberete drukčije.
A kako zakon radiju dozvoljava samo ograničeno vrijeme emitiranja, LoRa se čuva za vaše vlastite tekstove, kad ih
ništa drugo ne može prenijeti, nikad za ono što bi drugi telefoni htjeli da prenosi.

> LoRa radio se čuje kilometrima daleko, a njegov signal može se pratiti do mjesta gdje se nalazi, skriven ili ne. Ono
> što Erevos šalje ostaje šifrirano s kraja na kraj, ali svako s radiom može saznati da vaš radio šalje, kada i koliko.
> S postavkom **Javlja se svima u dometu**, svako s radiom može pročitati i njegovo ime i lokaciju.

## Razgovor preko relaya {#relay}

Relay je mali server koji čuva jednosmjerne redove: svaki telefon ima vlastiti red, a ko god ima njegov **link za
kontakt** može ubacivati poruke u njega. Relay ne čuva naloge, imena ni brojeve telefona i ne može čitati poruke: one
su šifrirane s kraja na kraj, a ključeve imaju samo dva telefona. Svaki telefon može koristiti vlastiti relay: poruka
kontaktu na drugom relayu zapečaćena je za njegov relay i predaje se vašem, koji je prosljeđuje dalje, pa relay te
osobe nikad ne vidi adresu vašeg telefona. Telefon bez relaya dobija mjesto na relayu svog kontakta, pogledajte **Bez
vlastitog relaya** ispod.

**Zašto:** s redovima i bez naloga nijedan server ne čuva popis ko koga poznaje i nikome ne treba vaš broj telefona ni
e-mail da bi vas dosegao: ko god ima vaš link za kontakt može pisati u vaš red, a čitate ga samo vi.

1. Na početnom ekranu dodirnite **Novi razgovor**. Dok nešto nedostaje, na vrhu **Kako ste sada povezani** jednostavnim riječima kaže kako
   vas kontakti dosežu: preko vašeg relaya, preko Nostra bez relaya ili samo u blizini; kad sve radi, ne prikazuje se.
   S relayem, polje na samom vrhu nalazi kontakt po imenu ili dodaje link zalijepljen u njega, a ispod dolaze **Tvoj QR
   kod**, iznad njega **Već ima {=Erevos}** i **Nov u {=Erevos}u**, i redovi za **Vaš link za kontakt** i drugo; telefon koji još nema relay počinje s
   **Počni s pozivnicom**. Vlastite postavke relaya
   su pod **Za napredne korisnike**, na dnu; **Postavke** → **Relay i mreže** → **Relay** otvara Novi razgovor s tim
   postavkama otvorenim.
2. Pod **Za napredne korisnike** upišite adresu u polje **Adresa relaya**: \`ws://<adresa računara>:7879\` za relay na
   vlastitoj mreži ili \`wss://relay.example.org\` za relay na internetu. Dodajte **Token** ako ga relay traži.
3. Erevos sam pravi vaš red na njemu, nekoliko sekundi kasnije, i kaže **Red na relayu je napravljen**: sve radi, tekstovi, fotografije, glasovne poruke,
   pozivi i grupe, a **Kako ste sada povezani** nestaje, jer ništa ne nedostaje. Ako ne uspije, bilješka kaže zašto; **Napravi moj red na relayu**, ispod adrese, pokušava ponovo.
4. **Tvoj QR kod** je na samom Novom razgovoru, čim se otvori. Neka ga drugi telefon skenira kamerom, a zatim otvori
   link u Erevosu. Ekran **Dodaj kontakt** pokazuje šta sadrži: dodirnite **Dodaj u razgovore** samo ako ste ga sami
   skenirali. **Dodaj i poveži s jednim od mojih kontakata** također dodaje osobu, povezanu s kontaktom koji izaberete,
   čije ime razgovor preuzima.
   Kod je kratak, pa ga čita svaka kamera. Ko ga skenira, odgovara svojim linkom za kontakt, a zatim mu ovaj telefon prvi piše. Kod je nov svaki put kad se Novi razgovor otvori i vrijedi jednom: ko ga prvi skenira, odmah postaje kontakt; ko ga skenira poslije, ili uzme link koji podijelite, prvo piše zahtjev za poruku. **Veliki QR kod, bez interneta** umjesto toga prikazuje cijeli kod, koji radi u blizini bez interneta, a **Mali QR kod** vraća nazad. **Podijeli**, ispod njega, šalje kratak link koji svaka aplikacija dopušta dodirnuti; na Androidu otvara Erevos, koji pita prije nego ga preuzme. Da biste nekoga dodali njegovim QR kodom za kontakt, vašem telefonu prvo treba relay.
   Ovaj QR kod radi samo ako oba telefona imaju relay, kao što kartica kaže. Za nekoga ko još nema {=Erevos}, ili čiji
   telefon nema relay, izaberite umjesto toga **Nov u {=Erevos}u**, iznad: kartica prikazuje **Pozivnica za {=Erevos}**,
   pozivnicu s kojom se njegov telefon pridružuje vašem relayu, kao u Pozivanje nekoga novog, niže. Novi razgovor
   prikazuje ono što ste posljednje izabrali.
   Isto vrijedi za dodir: dok se prikazuje mali kod za kontakt, a NFC je na Androidu uključen, drugi telefon ga uzima
   ako njegovu poleđinu prislonite uz poleđinu svog. Radi samo dok je Erevos u prvom planu, ne u pozadini, i nikad s
   velikim QR kodom.
5. Ako kamera te osobe prikazuje samo tekst, ili je daleko, dodirnite **Podijeli** ispod svog QR koda, ili otvorite
   **Vaš link za kontakt** i dodirnite **Podijeli moj link za kontakt**, i pošaljite joj ga. Ona ga zalijepi u polje na
   vrhu **Novog razgovora** i dodirne **Dodaj**.
6. Ili obrnuto: dodirnite **Skeniraj njegov**, ispod svog QR koda, i snimite QR kod na njenom ekranu, ili dodirnite
   **Iz fotografije njegovog QR koda** za snimak ekrana ili fotografiju koda koju vam je poslala. Erevos ga čita i odmah
   je dodaje. Na računaru, na Sailfish OS-u i u web-aplikaciji **Skeniraj njegov** traži fotografiju koda; na iPhoneu
   nudi i kameru.
   Skriveni razgovori imaju i jedno i drugo; tamo polje na vrhu prima samo link.
7. Ili, s nekim pored vas ili na telefonu: dodirnite **Upari se kodom** u **Novi razgovor**. Jedan dodirne **Pokaži
   kod** i kaže ili pokaže 8 cifara; drugi dodirne **Ukucaj njegov kod** i ukuca ih. Tada svaki telefon ima drugi kao
   kontakt, kao da je svaki skenirao QR kod drugog. Sam kod nikad ne napušta telefone: dokazuju jedan drugom da ga znaju,
   a njihovi linkovi za kontakt idu šifrovani ključem koji daje samo isti kod. Sastaju se na javnim Nostr relejima, koji
   ne vide ni kod ni linkove, a ko pogađa ima 3 pokušaja pre nego što se kod zatvori. Kod važi 10 minuta.

Novi razgovor pojavljuje se na početnom ekranu pod imenom **kontakt** i prvim znakovima ključa te osobe, dok ne dobije
ime: **Preimenuj** u njegovim detaljima daje mu ga. Odmah nakon što je ovdje dodate, **Poveži s jednim od mojih
kontakata** ispod obavijesti da je dodana omogućava vam da umjesto toga izaberete jedan od svojih kontakata (**Ne
sada** to preskače): razgovor preuzima ime tog kontakta, ako nema vlastito, a kartica kontakta prikazuje razgovor.
Skriveni razgovori nude samo vlastite kontakte, nikad kontakte telefona. Dovoljno je da jedan telefon doda drugi:
dodavanje linka pokreće šifrirani razgovor i drugom telefonu kaže kako da odgovori, pa on prikaže razgovor sljedeći
put kad pogleda svoj red, što radi svakih nekoliko sekundi.

**Šta relay vidi od razgovora:** svi vaši kontakti pišu u vaš jedan red. Kad svaki telefon dobije poruku od drugog,
svaka poruka između njih još jednom se zapečaćuje za telefon kojem ide, ključem koji je taj telefon dao unutar
razgovora, pa je za relay svaka od njih niz nasumičnih bajtova jedne od nekoliko veličina i iz njih ne može saznati
kojem razgovoru pripadaju. Prva poruka razgovora, i sve poslane prije nego što stigne odgovor, to i dalje otkrivaju.
Relay i dalje vidi s koje adrese stiže svaka poruka, i kada. A svaka relayu, u jednom bajtu koji on čita, kaže šta
nosi: poruku koju neko čita, riječ između telefona (da je poruka stigla ili pročitana, kucanje, prisutnost na mreži,
reakcije, novi ključevi) ili poziv koji zvoni. Tako relay vidi koje su poruke, i kada počinje poziv, bez obzira na to
jesu li obavijesti uključene ili ne: tako obavijest zatvorene web-aplikacije može da ih broji, kao i obavijest
zatvorenih skrivenih razgovora.

### Načini ulaska na relay

Relay koji traži token pušta telefon na tri načina. Svaki način završava se vlastitim tokenom telefona na relayu, pa
onaj ko vodi relay može ukloniti bilo koji pojedinačni telefon.

- **Pozivnica:** QR kod ili link s telefona koji je već na relayu (pogledajte Pozivanje nekoga novog ispod). Ništa se
  ne upisuje, a odmah ste kontakti.
- **Nalog:** **Prijava preko LPHL**, kad je relay nudi (pogledajte Prijava na relay ispod). Može svaki LPHL nalog, na
  najviše 10 telefona.
- **Token relaya:** jedan zajednički token za sve, od onoga ko vodi relay, upisan pod **Token**. Erevos ga odmah, sam,
  mijenja za vlastiti token telefona, nazvan tamo onako kako sebe nazivate u pozivnicama (\`phone\` ako niste dali
  ime), to kaže i od tada koristi samo njega. Tako i ovaj telefon može pozivati. Potreban je relay koji prima
  pozivnice, noviji od Erevosa 3.1.0; sa starijim, ili s relayem koji ne prima pozivnice, telefon zadržava token
  relaya i ne može pozivati.
- **Ograničenja:** telefon može imati 5 pozivnica na čekanju istovremeno i napraviti 10 dnevno (dan po UTC-u); svaka
  je za jedan telefon i traje 7 dana. Relay putem pozivnica pušta ukupno 100 telefona, računajući i pozivnice koje još
  čekaju, osim ako je njegov operater izabrao drukčije. Telefoni koji su došli s nalogom ili s tokenom relaya ne
  računaju se u tih 100: relay daje vlastiti token za 50 telefona dnevno koji su došli s njegovim tokenom, a nalog ima
  10 telefona. Relay istovremeno opslužuje 512 veza, ma čije bile, osim ako je njegov operater izabrao drukčije.
- **Uklanjanje telefona:** onaj ko vodi relay briše njegov red u datoteci tokena relaya: telefon više ne može koristiti
  relay, dok telefoni koje je pozvao zadržavaju svoj. Ako je ikad imao token relaya, mijenja se i taj token, pa se
  telefon s njim ne može vratiti. Telefoni s vlastitim tokenima nastavljaju kao i dosad: novi token treba samo telefonu
  na kojem je još upisan stari (koji od tada nije otvaran, ili sa starijim Erevosom).
- **Skriveni razgovori** zadržavaju token relaya koji je za njih upisan: kad bi se zamijenio u istom trenutku kao i
  token prostora, relay bi vidio da pripadaju ovom telefonu. Kad se token relaya promijeni, upišite novi pod njihovim
  **Za napredne korisnike**.

**Zašto:** relay svakoj vezi daje vlastitu nit, pa istovremeno opslužuje samo ograničen broj veza; i dnevno dodaje
samo ograničen broj redova za telefone koji su došli s njegovim jednim tokenom, pa token koji je otišao gdje ne treba
ne može napuniti njegovu datoteku tokena.

### Pozivanje nekoga novog

Jedan QR kod ili link dovodi nekoga novog: njegov telefon ulazi u {=Erevos} na vašem relayu, s vlastitim pristupom, bez
ikakvog upisivanja, a vi ste odmah kontakti jedno drugom, bez zahtjeva za razgovor.

- **Da pozovete:** na početnom ekranu dodirnite **Pozovi** pored retka relaya ili, na **Novom razgovoru**, izaberite
  **Nov u {=Erevos}u** iznad QR koda. QR kod se prikaže odmah: kad {=Erevos} bude na njenom telefonu, ona ga skenira
  kamerom i otvori link u Erevosu, ili dodirnite **Podijeli pozivnicu** i pošaljite joj link. Ispod možete upisati za
  koga je (ime te osobe u vašim razgovorima) i **Vaše ime, za tu osobu**, ili oba polja ostaviti prazna. Ako je opet
  otvorite dok je niko nije uzeo i dok joj ostaje bar jedan dan, prikazuje istu pozivnicu, pa ne troši nijednu od 5 na
  čekanju ni od 10 dnevno; **Pozovite nekog drugog** pravi novu. Pozivnica je za
  jednu osobu, na 7 dana, ili kraće ako pozivnica za relay ističe ranije. Ko je prvi iskoristi, njegova je, pa je
  dajte samo toj osobi.
  Na Android telefonu s uključenim NFC-om možete je dati i dodirom: prislonite poleđinu njenog telefona uz poleđinu
  svog dok se kod prikazuje, a njen telefon sam otvori link, u Erevosu ako je instaliran, a inače na web stranici
  Erevosa, koja nudi {=Erevos}. Ako je NFC isključen, na ekranu piše da ga uključite u postavkama Androida.
- **Da se pridružite:** na telefonu koji još nema relay, **Novi razgovor** počinje s **Počni s pozivnicom**. Dodirnite
  **Skeniraj njegov QR kod** i snimite pozivnicu na njenom ekranu, ili dodirnite **Iz fotografije njegovog QR koda**, ili
  zalijepite link u tamošnje polje i dodirnite **Pridruži se**; radi i da je skenirate kamerom i otvorite link u
  Erevosu. Link otvara **… vas poziva u {=Erevos}**: dodirnite **Pridruži se** samo ako je stigao od te osobe. {=Erevos} uzima
  vlastiti pristup njenom relayu i red na njemu, dodaje je i kaže **Dobro došli u {=Erevos}**. Njegova prva poruka javlja
  to njenom telefonu, koji odmah dodaje ovaj kao kontakt, pod imenom koje je ta osoba upisala.
- **Ostali načini ulaska:** ispod toga, **Za napredne korisnike** otvara ostale, za one koji ih traže: **Prijava preko
  LPHL** prijavljuje ovaj telefon na LPHL-ov relay s LPHL nalogom, u pregledniku (pogledajte Prijava na relay ispod),
  a zatim dodajete svoje kontakte putem njihovih pozivnica ili linkova; **Počnite bez relaya**, kao u Bez ikakvog
  relaya, pod Preko Nostra; i postavke relaya, kao u koracima od 1 do 6 iznad. Pozivnica je najjednostavniji način
  ulaska, a na relayu pozvani telefon ima samo ime od nasumičnih slova i cifara.
- **Drugi relay:** ispod **Prijava preko LPHL**, **Prijava na drugi relay…** prima adresu drugog relaya, kako vam ju
  je dao onaj ko ga vodi, na primjer relay.example.org: kartica se tada prijavljuje tamo, s imenom naloga koje taj relay
  prima, ili kaže da nema prijavu, i tada vam onaj ko ga vodi može dati pozivnicu. **Nazad na** vraća LPHL-ov.
- **Šta vaš relay mora dozvoliti:** vlastiti pristup je pozivnica na vaš relay (pogledajte Pozivnice na relay ispod), pa
  dolazi samo s telefona koji ima vlastiti token na relayu koji prima pozivnice. Računa se među vaše pozivnice, pod
  imenom od nasumičnih slova i cifara, i ostaje čak i kad vaš nestane. Telefon s jednim zajedničkim tokenom relaya prvo
  ga mijenja za vlastiti (pogledajte Načini ulaska na relay iznad); tamo gdje relay to ne radi, ne pravi pozivnicu: prvo
  se prijavite na relay (ispod polja **Token**, pod **Za napredne korisnike**) ili uzmite pozivnicu za njega. Kad vaš
  relay ne prima pozivnice, pozivnica vas ipak čini kontaktima, a telefon te osobe koristi vaš relay samo onako kako to
  dozvoljava vaš link za kontakt, kao u Bez vlastitog relaya ispod.
- **Telefon koji već ima relay** zadržava svoj: pozivnica vas samo dodaje, a odmah ste kontakti svejedno.
- **Šta se čuva:** vaš telefon čuva tajnu svake pozivnice i ime za tu osobu, zapečaćene u prostoru, dok se ne
  iskoristi ili ne isteknu njenih 7 dana, najviše 20 istovremeno. Od toga na relayu nema ništa osim pozivnice za
  relay.
- **Putem SMS-a, nekome ko još nema {=Erevos}:** na Androidu, kartica kontakta koji nije u Erevosu ima **Pozovi putem
  SMS-a**. Piše SMS na njegov prvi broj s kratkim linkom, u SMS aplikaciji (Erevosovoj kad je on SMS aplikacija
  telefona), a vi odlučujete hoćete li ga poslati. Stranica linka na LPHL-ovom web serveru nudi toj osobi {=Erevos}
  (Android aplikaciju ili web-aplikaciju na iPhoneu), a zatim u njemu otvara pozivnicu; u web-aplikaciji na iPhoneu
  ona zalijepi link pod **Imam pozivnicu**. Dodirne **Pridruži se**: njen telefon ulazi na vaš relay kao iznad i
  preko njega odgovara vašem, koji je dodaje, povezanu s tim brojem i pod imenom s kartice. Njegova prva poruka, koja
  ide sama, čini vas njenim kontaktom, pod imenom kojim ste sebe nazvali u svojoj posljednjoj pozivnici. Pozivnica
  slijedi iza znaka **#** u linku, koji se ne šalje nijednom web serveru, ali telefonska kompanija vidi SMS, kao i
  svaki SMS: zato je pozivnica za jednu osobu, na dva dana, a kad ta dva dana isteknu, a nijedan telefon je nije
  iskoristio, vaš telefon povlači svoju pozivnicu za relay. Potreban je relay koji vašem telefonu dozvoljava da
  poziva, kao iznad.

### Bez vlastitog relaya

Telefon bez relaya svejedno razgovara preko interneta: kad doda link kontakta čiji relay posuđuje mjesta, uzima mjesto
na njemu, bez tokena.

- **Kako:** dodajte njegov link kao u koracima 4 i 5, bez ičega pod **Relay**. Erevos kaže da sada imate mjesto na
  relayu te osobe, posuđeno putem njenog linka, i od tada ga koristi kao vlastiti: vaš vlastiti link ga navodi, pa i
  drugi tamo dopiru do vas.
- **Ko posuđuje:** vaš link nosi kartu za mjesto na vašem relayu samo kad uključite **Podijeli mjesto na mom relayu s
  ovim linkom**, pod **Vaš link za kontakt** u ekranu **Novi razgovor**, i to samo za link koji je tada prikazan:
  sljedeći put kad se razgovor otvori, ponovo je isključeno. Relayu je potreban ključ za slanje u dva skoka, a
  posuđuje tek kad onaj ko ga vodi uključi posuđivanje; on može i povući mjesta neke karte. Karta traje 30 dana i daje
  najviše četiri mjesta. Svako ko vidi link s kartom može s njom uzeti mjesto, pa takav link dajte samo onome kome ste
  ga namijenili.
- **Šta posuđeno mjesto ne radi:** poruke kontaktima na drugim relayima idu direktno na njihov relay, koji tada vidi
  adresu vašeg telefona. Ne čuva ništa za kasnije (poruka poslana kasnije čeka na telefonu), ne daje relay za pozive
  (pozivi idu direktno između telefona) i pravi najviše još 4 reda i šalje najviše 50 MB datoteka dnevno. Vaš link ne
  posuđuje ništa dalje.
- **Umjesto toga, vlastiti relay:** upišite njegovu adresu pod **Relay**: posuđeno mjesto se oslobađa, a kontakti
  saznaju novu adresu iz vaše sljedeće poruke.
- **Link bez karte** (sa starijeg relaya ili Erevosa): relay kojem ne treba token koristi se onakav kakav je; inače
  se možete povezati samo u blizini, dok ne budete imali relay.

**Zašto:** link s kartom je ključ za vaš relay za svakoga ko ga vidi, pa vaš link nosi kartu samo kad vi to izaberete,
za link koji je tada prikazan, a relay posuđuje tek kad to dozvoli onaj ko ga vodi. Datoteke posuđenog mjesta
ograničene su na nekoliko fotografija i glasovnih poruka dnevno, pa nikad ne zauzimaju cijelu memoriju relaya.

### Pozivnice na relay

Telefon s vlastitim tokenom na relayu koji prima pozivnice može dozvoliti još jednom telefonu da koristi taj relay,
s vlastitim tokenom tog telefona, pa se nijedan token ne upisuje niti prosljeđuje.

- **Da pozovete:** pod **Za napredne korisnike** u ekranu **Novi razgovor**, ispod polja **Token**, dodirnite **Pozovi
  na relay**, upišite za koga je i dodirnite **Napravi pozivnicu**. Otvara se QR kod: neka ga telefon te osobe
  skenira kamerom i otvori link u Erevosu, ili dodirnite **Podijeli pozivnicu** i pošaljite joj je. Vrijedi za jedan
  telefon 7 dana, a ko je prvi iskoristi, njegova je, pa je pokažite samo toj osobi.
- **Da je prihvatite:** link otvara **Pozivnica za relay**, s adresom relaya: dodirnite **Koristi ovaj relay** samo ako
  je stigla od nekoga koga poznajete. U Erevosu, **Skeniraj njegov** i **Iz fotografije njegovog QR koda** na Novom
  razgovoru čitaju i pozivnicu, a njen link može se zalijepiti u polje na vrhu. Erevos pravi token za ovaj telefon,
  čuva ga s adresom relaya samo u ovom prostoru i pravi vaš red na relayu. Ako telefon koristi drugi relay, prvo pita, a
  kontakti saznaju vaš novi red iz vaše sljedeće poruke. Erevos prima pozivnicu za wss:// relay, ili za ws:// relay samo
  na kućnoj mreži (kao \`ws://192.168.1.10:7879\`). Skriveni razgovori ne primaju pozivnice.
- **Vaše pozivnice:** navedene ispod dugmeta, na čekanju ili u upotrebi. **Povuci** povlači pozivnicu koja još čeka, ili
  odmah isključuje telefon koji ju je uzeo, samo njega: telefoni koje je on zatim pozvao zadržavaju svoj.
- **Njihov ostaje:** telefon koji ste pozvali zadržava svoj red na relayu čak i kad vaš nestane, jer ga je povukao
  telefon koji vas je pozvao, nalog s kojim ste se prijavili više ne smije koristiti relay, ili vas je operater uklonio,
  a isto tako i telefoni koje je on pozvao. Samo vaše pozivnice koje još čekaju tada više nikoga ne puštaju.
- **Šta relay čuva:** za taj telefon ime od nasumičnih slova i cifara, koje ništa ne govori o tome ko je (ime koje ste
  upisali ostaje na vašem telefonu; Erevos prije 6.0.0 davao je relayu to ime, latiničnim slovima), da ste ga vi
  pozvali, i otisak njegovog tokena, a ne token. Onaj ko vodi relay to vidi i može ukloniti bilo koji telefon s njega.
  Telefon može imati 5 pozivnica na čekanju istovremeno i napraviti 10 dnevno, a relay putem pozivnica pušta samo
  ograničen broj telefona (100, osim ako je njegov operater izabrao drukčije).
- **Ko može pozivati:** telefon s vlastitim tokenom, na relayu čiji je operater uključio pozivnice (pogledajte
  [Vlastiti relay](#own-relay)). Telefon s jednim zajedničkim tokenom relaya prvo ga mijenja za vlastiti (pogledajte
  Načini ulaska na relay iznad). S posuđenim mjestom nema **Pozovi na relay**.

**Zašto:** relay čuva samo otisak svakog tokena, nikad sam token, pa njegova datoteka nikome ne govori kako da se
poveže. A pozivnica navodi wss:// relay, ili ws:// relay kod kuće, pa nikad ne može poslati zahtjeve vašeg telefona
preko interneta nešifrirano.

### Prijava na relay

Relay može dozvoliti telefonima da se prijave nalogom kojem njegov operater vjeruje, kao što je LPHL, za vlastiti
token, bez ikakvog upisivanja u Erevosu.

- **Da se prijavite:** upišite adresu relaya pod **Relay**. Kad relay to nudi, ispod polja **Token** prikazuje se
  **Prijava preko LPHL**. Dodirnite to: preglednik otvara stranicu za prijavu, gdje upisujete svoje ime i lozinku,
  koje {=Erevos} nikad ne vidi. Stranica relaya zatim prikazuje šest cifara. Na Androidu tamo dodirnite **Otvorite
  {=Erevos}** i {=Erevos} sam završava prijavu; inače ih upišite kako je opisano niže. Natrag u Erevosu, koji vas odmah
  stavlja u **Kôd sa stranice**, upišite ih tamo i dodirnite **Završi prijavu**: telefon čuva svoj token s adresom
  relaya samo u ovom prostoru i pravi vaš red na relayu. Kôd upisujte samo u {=Erevos} na vlastitom telefonu i nikome ga
  ne dajte, čak ni ako vas pitaju: ko god ga upiše, koristi relay kao vi. Nakon 5 pogrešnih kodova prijava je gotova:
  prijavite se ponovo. {=Erevos} otvara samo stranicu za prijavu na vlastitoj adresi relaya, preko https-a.
- **Ponovna prijava** na istom telefonu zamjenjuje njegov red na relayu, ako je njegov token onaj koji je dobio od tog
  relaya. Svaki telefon dobija vlastiti red, najviše 10 za jedan nalog.
- **Šta vide relay i LPHL:** relay red telefona imenuje po vašem korisničkom imenu (\`lphl:nekten\`), a svakog sata pita
  LPHL smije li ga nalog još koristiti: kad se nalog zatvori ili onemogući, ili se LPHL ne može pitati 3 dana, red
  nestaje i telefon više ne može koristiti relay; telefoni koje je pozvao zadržavaju svoj. LPHL vidi svaku prijavu i ove
  provjere, ali ništa od vaših prostora, razgovora ili kontakata. Prijava iz drugog prostora istim nalogom pokazuje
  relayu da su oba vaša.
- **Skriveni razgovori** se ne prijavljuju.

**Zašto:** stranica prikazuje kôd, a vi ga upisujete u Erevos, a ne obrnuto, pa link za prijavu koji vam neko drugi
pošalje toj osobi ne donosi ništa: kôd vidi samo onaj ko se prijavio, a pet pogrešnih završava prijavu. Erevos otvara
stranicu za prijavu samo na vlastitoj adresi relaya, preko https-a, pa ništa što odgovara umjesto relaya ne može vas
poslati na stranicu negdje drugdje. A pružalac usluge koji se neko vrijeme ne može pitati ne isključuje odmah nijedan
telefon: to čine tek 3 dana bez valjanog odgovora. A dugme **Otvorite Erevos** je jednako sigurno: link sadrži samo
šest cifara, koje bez tajne koju ima samo telefon koji je pokrenuo prijavu ne traže ništa, pa aplikacija koja bi
uhvatila link ne dobija ništa.

### Vlastiti ključ relaya

Kad Erevos zna ključ vašeg relaya (pita relay prvi put, ili ga daje link za kontakt), svaka veza s tim relayem počinje
provjerom: relay mora dokazati da ima taj ključ, a token i sve nakon njega idu šifrirani za taj ključ, unutar
vlastitog šifriranja veze (TLS). Pod **Kako ste sada povezani** Erevos tada kaže da je vaš relay dokazao svoj ključ.
Od tada ovaj prostor nikad ne pristupa tom relayu bez provjere.

- Relay stariji od ove aplikacije ništa ne dokazuje: radi kao i prije, a **Kako ste sada povezani** kaže da je
  stariji. Erevos pokušava ponovo svakog sata.
- Relay koji ne može dokazati ključ koji Erevos čuva za njega ne dobija ništa, a vaše poruke čekaju; **Kako ste sada
  povezani** to kaže crvenim slovima. Samo ako vam je njegov operater rekao da ima novi ključ, dodirnite **Ima novi
  ključ**: Erevos tada uzima ključ koji relay sljedeći put da.

**Zašto:** certifikat veze kaže samo da onaj ko odgovara ima certifikat za ime relaya, a kompanija koja izdaje
certifikate može ga dati i nekom drugom, greškom ili pod prisilom. Vlastiti ključ relaya nalazi se samo na njegovom
serveru, pa niko između ne može da se predstavi kao relay, a obnovljeni certifikat ništa ne mijenja.

### Sigurnosni broj

Otvorite razgovor, dodirnite njegovo ime, a zatim **Sigurnosni broj**. Oba telefona prikazuju istih 60 cifara za vas
dvoje. Uporedite ih uživo ili u pozivu: ako se podudaraju, niko nije između. Ako se razlikuju, ne vjerujte tom
razgovoru i ponovo dodajte link, skeniran s telefona te osobe. Kad ta osoba poveže uređaj, broj kaže i kada se popis
njenih uređaja posljednji put promijenio: vaše poruke idu i na svako mjesto s tog popisa, pa ako ona tada nije
povezala ili odvojila uređaj, pitajte je.

Jedan pored drugog, možete provjeriti i kodovima umjesto čitanja cifara: ispod broja svaki telefon prikazuje QR kod.
Dodirnite **Fotografirajte njihov kod** i fotografirajte kod na telefonu te osobe, a zatim neka ona učini isto s vašim.
Kad se podudara, red kaže **Provjereno uživo**. Svaki telefon označava drugi samo po onome što je sam vidio, i ništa
se ne šalje. Ako kaže da se ne podudara, možda je neko između: ne vjerujte tom razgovoru. **Odaberite fotografiju
njihovog koda** umjesto toga provjerava fotografiju njihovog koda koju već imate. Oznaka **Provjereno uživo**, s
datumom, ostaje dok ne dodirnete **Uklonite oznaku**. Ostaje na ovom telefonu, ide s razgovorom kad ulazi u skrivene
razgovore ili izlazi iz njih, i ne prenosi se na vaše povezane uređaje. Kod iz novijeg Erevosa to kaže: ažurirajte
{=Erevos}, pa fotografirajte ponovo.

**Zašto:** kod sadrži samo hash vaša dva ključa, redom koji razlikuje dva telefona, pa fotografija vašeg vlastitog
ekrana ne provjerava ništa, a fotografija koda ne govori ko ste nikome ko već nema oba ključa.

### Upoznavanje dva kontakta

U detaljima razgovora s kontaktom, **Upoznajte s kontaktom** vam daje da izaberete još jedan svoj kontakt i **Pitajte
oboje**. Svako se pita u vašem razgovoru s njim, porukom koja drugoga naziva imenom koje ste mu dali; oboje trebaju ime.
Svako odgovara **Recite da** ili **Recite ne** u tom razgovoru. Samo ako oboje kažu da, postaju kontakti: onaj iz čijeg
ste razgovora napravili upoznavanje piše prvi, a telefon drugoga ga odmah prihvata, s imenom koje ste mu dali. Ako jedno
kaže ne, ništa se ne događa, a drugo to ne saznaje. Upoznavanje čeka sedmicu.

**Zašto:** sve ide unutar šifriranja vaših razgovora sa svakim od njih, pa nijedan relay ne vidi ko se s kim upoznaje.
Vi prenosite samo link za kontakt koji je drugi izabrao da da, nakon što je rekao da. Pošto onaj ko upoznaje može
podmetnuti nekog drugog, uporedite sigurnosni broj s novim kontaktom kao s bilo kojim drugim.

### Poslano, stiglo i pročitano

Iznad prve poruke svakog dana, u svakom razgovoru, i u grupama i u Razgovoru sa sobom, dan se jasno vidi: **Danas**,
**Jučer**, dan u sedmici unutar zadnje sedmice, a prije toga dan i datum, npr. **Utorak, 10. novembar**.

Ispod svake vaše poruke kontaktu, **✓** kaže da ju je preuzeo relay ili telefon u blizini, **✓✓** da je stigla na
telefon te osobe, a **✓✓✓** da ju je pročitala. Njen telefon to javlja vašem, unutar šifriranja, sljedeći put kad
svaki od njih pogleda relay, ili odmah kad su u blizini. Poruka se računa kao pročitana čim se njen razgovor prikaže
na ekranu. **Označi sve kao pročitano** u meniju ⋮ računa se isto: njihovi telefoni saznaju pri sljedećem pogledu na
relay.

U grupi koja nije javna vaše poruke imaju iste oznake, za sve ostale članove zajedno: **✓** kad je poslana, **✓✓** kad
je poruka stigla na telefon svakog člana koji je bio u grupi kad ste je poslali, a **✓✓✓** kad su je svi pročitali.
Telefon svakog člana to javlja vašem, u tihoj grupnoj poruci namijenjenoj samo vama, šifriranoj s kraja na kraj kao i
ostatak grupe: da je poruka stigla, nekoliko sekundi poslije (zajedno s ostalima koje su stigle u međuvremenu, u
jednoj), i da je pročitana, čim se grupa prikaže na ekranu. Zadržite prst na svojoj poruci i izaberite **Ko je
pročitao** da vidite ko ju je pročitao i kada, na čiji je telefon stigla i kada, i ko još nije učinio ni jedno ni
drugo, pod **Još ne**. Član čiji je {=Erevos} stariji od ovih oznaka ne javlja ništa, pa ostaje pod **Još ne**, a poruka
ostaje na **✓**. Javne grupe nemaju oznake. Računar povezan s ovim telefonom prikazuje iste oznake.

- **Šalje se…:** u trenutku kad pritisnete Pošalji, telefon kratko zavibrira, polje se isprazni i poruka se prikaže,
  označena sa **Šalje se…** dok je ne preuzme relay ili telefon te osobe. Ako ne može otići i ne može čekati, njene
  riječi se vraćaju u polje. Ako napustite razgovor dok prikazuje **Šalje se…**, poruka se ne gubi: ode ili čeka
  označena s **Na čekanju**.
- **Na čekanju:** poruka koju ništa nije moglo preuzeti, jer relay nije dostupan, a telefon te osobe nije u blizini,
  ostaje u razgovoru označena s **Na čekanju** i odlazi sama, redom, čim je relay ili telefon te osobe u blizini može
  preuzeti, dok je neki prostor otvoren; tada prikazuje **✓**. Tekst odmah čeka. Glasovna poruka, fotografija ili
  datoteka prvo pita: **Neka čeka** ili **Obriši je**. Poruka na čekanju briše se samo na ovom telefonu. U skrivenim
  razgovorima i ona čeka, ali ide samo preko njihovog relaya, nikad na telefon u blizini ili preko LoRa veze: dok su
  otvoreni, ili, s uključenim **Primanje dok su zatvoreni**, dok je prostor otvoren. Kad je red kontakta na relayu
  pun, tekst, glasovna poruka, fotografija ili datoteka ipak ide na njegove povezane uređaje, ako ih ima, prikazuje se
  kao poslana i ponovo se pokušava poslati na njegov telefon dok su skriveni razgovori otvoreni: ako se zatvore prije
  nego što je otišla, njegov telefon je nikad ne dobija.
- **Pošalji kasnije:** zadržite prst na strelici za slanje i izaberite **Kasnije…**, ili dodirnite **+**, a zatim
  **Pošalji kasnije**. Izaberite vrijeme jednim dodirom (**Za 1 sat**, **Večeras u 20:00**, **Sutra u 09:00**) ili
  dan, sat i minute, do godinu dana unaprijed, pa **Pošalji kasnije**. Poruka ostaje u razgovoru označena sa
  **Zakazano** i svojim vremenom. Ide šifrirana na relay, koji je čuva i šalje u to vrijeme, čak i ako je ovaj telefon
  tada isključen ili zaključan, a telefon te osobe je prikazuje od tog vremena, ne ranije. Ako sada nijedan relay nije
  dostupan, čeka na ovom telefonu i ide na relay čim neki bude dostupan. Ako ništa niste upisali, vrijeme koje
  izaberete važi za sljedeću fotografiju, datoteku ili glasovnu poruku: fotografija ili datoteka odmah ide na vaš relay
  i ostaje tamo dok je ta osoba ne preuzme, najviše 14 dana nakon svog vremena. I skriveni razgovori to imaju, na isti
  način, preko svog relaya. Do njenog vremena obrišite je da biste je povukli s relaya, i nikad neće otići. Ako se red
  te osobe na relayu prije toga promijeni, Erevos je ponovo zadržava za novi red sljedeći put kad dođe do relaya. S
  vlastitim tokenom ovog telefona ide samo ako telefon tada još ima svoj red na tom relayu. Poruka bez zvuka ostaje bez
  zvuka. Relay od prije ovoga ne čuva ništa za kasnije: tada poruka čeka na ovom telefonu i ide u svoje vrijeme dok
  Erevos radi, i u pozadini dok je **U pozadini** postavljeno na **Primaj i zvoni** (ispod), ili kad se Erevos sljedeći
  put otvori.
- **Sigurnosna poruka:** upišite je, dodirnite **+**, a zatim **Sigurnosna poruka**, i izaberite koliko dugo: 6 ili 12
  sati, 1, 2 ili 3 dana, ili sedmicu. Odmah ide na relay, kao poruka poslana za kasnije, a relay je sam šalje u to
  vrijeme. Svaki put kad otvorite Erevos, nakon njegove lozinke, pomjera se ponovo za toliko, pa ide samo ako na vrijeme
  ne otvorite Erevos: ako je telefon izgubljen, oduzet, pokvaren ili bez interneta, ili vam se nešto dogodilo. Erevos
  koji radi u pozadini je ne pomjera, kao ni njegov ekran lozinke, niti prozor ostavljen otvoren koji niko nije dodirnuo
  ni u njemu kucao 10 minuta. U skrivenim razgovorima pomjera se dok njihovo mjesto prima, ili kad ga otvorite. U
  razgovoru je označena sa **Sigurnosna poruka** i vremenom kad bi otišla; obrišite je da biste je zaustavili. Napišite
  je tako da kaže šta jeste: vašem kontaktu stiže kao obična poruka. Ako se relay ne može dosegnuti kad otvorite Erevos,
  zadržava svoje vrijeme. Šifrira se jednom i ponovo ide na relay onakva kakva jest svaki put kad se pomjeri, pa vašem
  razgovoru ne košta ništa.
  **Zašto:** poruci koju drži relay ne treba ništa s ovog telefona da bi otišla, pa je niko ko uzme telefon ne može
  zaustaviti, osim otvaranjem Erevosa njegovom lozinkom.
- **Slanje bez zvuka:** zadržite prst na strelici za slanje i izaberite **Bez zvuka**: telefon te osobe prikazuje
  obavijest bez zvuka i vibracije. Erevos od prije ovoga to ne zna i oglašava se kao i obično, kao i Erevos kao
  web-aplikacija, čija obavijest dolazi iz preglednika. Isto tako i obavijest zatvorenog mjesta skrivenih razgovora s
  uključenim **Javi kad stigne poruka**, i zatvorenog prostora s **I dok je otvoren drugi prostor**: oni relay pitaju
  samo koliko ih je stiglo, a on ne može razlikovati poruku bez zvuka od druge, jer to kaže samo šifrirana poruka.
- **Linkovi:** web adresa u poruci je podvučena, i gola adresa poput t.me/name ili example.org/page, kako ih prikazuju
  Telegram i Signal; e-mail adresa ili ime datoteke (photo.jpg) nije. Dodirnite je i Erevos je prikazuje cijelu, da je
  otvorite u pregledniku samo ako je to mjesto na koje želite ići. Prije toga se ništa ne preuzima.
- **Dijeljenje iz druge aplikacije** (Android): u opciji **Dijeli** druge aplikacije, kao u pregledniku za stranicu,
  izaberite **Erevos**. Kad je prostor otvoren, **Pošalji u** navodi razgovore, grupe i SMS razgovore koje je početni
  ekran posljednje prikazao, zatim sve ostale razgovore i grupe{+, i razgovore vaših naloga na Matrixu, XMPP-u i
  Nostru}, s pretragom; nikad skrivene razgovore. Riječi i linkovi otvaraju se u polju za poruku onog koji izaberete,
  da ih tamo pročitate i pošaljete; fotografija ili datoteka ide čim se taj razgovor ili grupa otvori, fotografija u
  kvalitetu koji ste izabrali za fotografije, i nikad kao SMS. Datoteka može imati najviše 100 MB{+ u Erevos razgovoru,
  50 MB na Matrixu i XMPP-u i 20 MB na Nostru}. Šifrira se čim stigne, ključem samo u Erevosovoj memoriji, i tako čeka
  na telefonu, i dok unosite lozinku ako se Erevos prije zaključa; nestaje kad se pošalje, ili kad napustite
  **Pošalji u**.
- **Vide kada čitate:** vaš telefon to javlja telefonu te osobe, kao što njen javlja vašem, osim ako se u tom
  razgovoru prikazujete kao da niste na mreži (ispod).
- **Kad poruke stižu:** Erevos gleda relay svakih nekoliko sekundi dok je otvoren i otključan, na bilo kojem ekranu, a
  početni ekran sam pomjera razgovor na vrh. Na Androidu se svaka nova poruka oglašava zvukom, s obaviješću koja kaže
  samo koliko ih je stiglo, i dok je Erevos na ekranu; u razgovoru ili grupi otvorenoj na ekranu svira samo zvuk, a
  otvaranje razgovora skida s broja ono što je tamo stiglo. Kucanje, kao ni to da je poruka stigla ili pročitana, ne
  daju nijednu. Na Androidu se to nastavlja i u pozadini, dok je **U pozadini** postavljeno na **Primaj i zvoni**
  (ispod): tamo čeka na relayu dok nešto ne stigne, po minut, umjesto da pita svakih nekoliko sekundi, i ne pita više
  ništa kad ništa nije stiglo, pa baterija traje, a obavijest kaže samo koliko je poruka stiglo. Zatvoren, zaključan
  ili inače dugo u pozadini, to ne radi: poruke čekaju na relayu, do 14 dana, i stižu kad se Erevos ponovo otvori.
  Pitanje relayu bez odgovora na vrijeme (čekanje tamo svoj minut i još pola minute, sve ostalo 45 sekundi, dio
  datoteke 2 minute) računa se kao neuspjelo i postavlja ponovo, pa veza koja je usput prekinuta, kao kad mreža
  telefona zaspi ili se promijeni, ništa ne zadržava.

### Na mreži, posljednji put viđen, i prikazivanje kao da niste na mreži

Dok je razgovor s kontaktom otvoren na vašem ekranu, Erevos s vremena na vrijeme pita telefon te osobe je li razgovor
otvoren i javlja da je vaš otvoren. Ako je njen otvoren, razgovor ispod njenog imena kaže **Na mreži** sa zelenom
tačkom, a početni ekran prikazuje tačku na njenoj slici. Pisanje nekome također vas njemu prikazuje kao da ste na
mreži dvije minute. Sve to ide unutar šifriranja, samo između vas i tog kontakta: relay s vremena na vrijeme vidi
poruku, kao i kod svakog razgovora.

Kad kontakt nije na mreži, njegov razgovor kaže kad je posljednji put imao otvoren Erevos, na minut tačno:
**posljednji put viđen danas u 14:32**. Vaš telefon vaše vrijeme javlja vašim kontaktima na isti način, unutar onoga
što im ionako ide (poruka, ili da je jedna stigla), i jednom kad neko otvori vaš razgovor dok je Erevos na vašem
telefonu zatvoren, samo ako je bio otvoren otkako im je posljednji put javljeno. Isključeno je u novom prostoru dok ga
ne uključite, u **Postavke** → **Privatnost i sigurnost** → **Posljednji put viđen**, ili u detaljima bilo kojeg
razgovora; prostor napravljen prije 7.0.1 ga zadržava kakav je bio, uključeno osim ako ste ga isključili. Djeluje u
oba smjera: isključeno, niko ne vidi vaše, a ni vi ne vidite ničije; oni koji su ga vidjeli gube ga s vašom sljedećom
porukom. Postavlja se za cijeli prostor i njegove povezane uređaje, svaki prostor posebno. Svako mjesto skrivenih
razgovora ima vlastiti prekidač, u detaljima razgovora tamo, i vlastito vrijeme: dok su otvoreni, samo oni se računaju
kao otvoreni, a ne prostor.

S uključenim **Javi kad otvorim i zatvorim Erevos** (ispod **Posljednji put viđen**, uključeno dok ga ne isključiš), otvaranje Erevosa to
odmah javlja i tvojim kontaktima, bez čekanja poruke: samo onima s kojima si razgovarao u zadnjih 30 dana i koji i sami
pokazuju svoje vrijeme, svakom nakon nasumičnog čekanja do jedne minute, najviše svakih 15 minuta, nikad razgovoru koji
se prikazuje kao offline ni zahtjevu za poruku. Kad se Erevos zatvori, ili njegovi skriveni razgovori, oni kojima je javljeno dok je bio
otvoren odmah saznaju kada se zatvorio, pa njihov **Posljednji put viđen** pokazuje to vrijeme. Relay tada vidi da im
nešto ide kad otvoriš i zatvoriš Erevos, pa može znati kada to činiš: isključi ga, i tvoje vrijeme ide samo s onim što im ionako ide.

Dok pišete kontaktu koji je prikazan na mreži, njegov razgovor prikazuje **piše…** ispod vašeg imena nekoliko sekundi,
a vaš ispod njegovog kad on piše. To se javlja najviše svakih nekoliko sekundi, samo dok je prikazan na mreži, nikad
zahtjevu za razgovor, i ne u grupama.

**Zašto:** prisutnost na mreži javlja se samo između vas i kontakta čiji je razgovor otvoren, unutar šifriranja, pa
relay ne vidi ništa više od poruke s vremena na vrijeme između dvoje ljudi koji razgovaraju. Vrijeme kad ste
posljednji put viđeni putuje unutar istih poruka, šifrirano s kraja na kraj: relay ga nikad ne saznaje. Ono ipak kaže
vašim kontaktima kad spavate ili radite, a za dva kontakta viđena istog minuta može se pretpostaviti da razgovaraju:
isključite ga ako vam je to važno. Neko ko ima samo vaš link i piše kao zahtjev za razgovor ne dobija nikakav odgovor
dok ga ne prihvatite: ni da ste pročitali, ni da ste na mreži ili da pišete, ni kad ste posljednji put viđeni. Dok ne
prihvatite, vide se samo riječi: fotografije i datoteke čekaju nepreuzete, a linkovi nemaju pregled. Ako prve poruke traže kod, PIN, lozinku ili novac, obećavaju lak novac, ili ime liči na ime
nekog od vaših kontakata, **Oprez** to kaže iznad njih. Erevos to traži samo na vašem telefonu, i ništa ne blokira.

Da to sakrijete od jednog kontakta, otvorite njegov razgovor, dodirnite njegovo ime, a zatim **Prikazuj me kao da
nisam na mreži**. Kad je to uključeno:

- **Ne vidi vas na mreži**, ni da pišete, a vaš telefon mu ništa ne šalje dok čitate.
- **Njegove poruke ostaju ✓** na njegovom telefonu, a ne ✓✓ ili ✓✓✓, dok ih čitate.
- **Kad mu pišete**, prikazujete se na mreži dvije minute, a svaka njegova poruka koju ste pročitali odmah postaje
  ✓✓✓.
- **Ni vi ne vidite njega na mreži**, jer vaš telefon ne pita, ni kad je posljednji put viđen; a on ne dobija nikakvo
  vaše vrijeme.

Postavlja se za svaki razgovor posebno, samo na ovom telefonu. Isključite to ponovo i on vidi šta ste pročitali kad
sljedeći put pogledate relay.

### Imena i brisanje

Otvorite razgovor, dodirnite njegovo ime, a zatim **Preimenuj** da mu date ime. Ime ostaje na ovom telefonu,
zapečaćeno s razgovorom: drugi telefon ga ne vidi. Prazno ime vraća početak ključa te osobe, osim ako je s njom
povezan neki od vaših kontakata: tada ona ponovo preuzima njegovo ime sljedeći put kad se njegova kartica otvori, dok
veza ostaje (pogledajte [Kontakti](#contacts)).

**Moje ime:** u Postavke → Privatnost i sigurnost → **Moje ime** možeš odabrati ime koje tvoji kontakti vide umjesto koda. Kaže se šifrirano, samo kontaktima koje si prihvatio, a uče ga i tvoje privatne grupe: tamo se oni koji nisu tvoji kontakti prikazuju kao „Ime · 1a2b“, s početkom njihova ključa. Ako si kontaktu dao vlastito ime (**Preimenuj**), i dalje vidiš svoje; ono koje je on odabrao piše u njegovim **Detaljima** kao „Naziva se“ i kao natuknica u polju za preimenovanje. Svaki prostor ima svoje ime, kao i svako mjesto skrivenih razgovora (u njegovim postavkama, uz **Primanje dok su zatvoreni**): skriveno mjesto nikad ne preuzima ime prostora i počinje prazno, a isto ime u dva od njih govori svakome tko vidi oba da su tvoji. Ime ima najviše 40 znakova.

Dodirnite njegovo ime, a zatim **Slika** da toj osobi date sliku po vlastitom izboru, znak na boji, umjesto one
iscrtane iz njenog ključa. Ili dodirnite **Fotografija** (ili **Snimi fotografiju**) za fotografiju: izrezanu u
kvadrat, smanjenu i ponovo iscrtanu, pa se ne čuva ništa što je govorila osim same slike (mjesto, telefon), a zatim
zapečaćenu u vlastitoj datoteci. I ona ostaje na ovom telefonu i ulazi u rezervne kopije; **Slika iz ključa** vraća
iscrtanu.

Svaki razgovor može imati i vlastiti izgled: dodirnite njegovo ime, a zatim **Izgled razgovora** za iste izbore kao u
**Izgled** (stil, tema, boje, font, pozadina, poruke i veličina njihova teksta), samo za taj razgovor. Grupa ima
**Izgled razgovora** tamo gdje se otvara njeno ime (u javnoj grupi, pod **⋯**), Razgovor sa sobom ga ima na vrhu{+, a
razgovor na Matrixu, XMPP-u ili Nostru na samom dnu, pored **Obavijesti**}. Kao i ime, ostaje na ovom telefonu, zapečaćen
s razgovorom. **Kao u aplikaciji** mu ponovo daje izgled aplikacije.

Da biste razgovor sačuvali izvan Erevosa, dodirnite njegovo ime, a zatim **Izvezi razgovor**: njegove poruke idu u
tekstualnu datoteku, svaki dan pod svojim datumom i svaka poruka sa svojim vremenom i autorom, sačuvanu u folderu
koji izaberete (na računaru, gdje izaberete). Datoteka nije šifrirana: svako ko je ima, ili svaka aplikacija koja čita
taj folder, može je pročitati. Fotografije, datoteke i glasovne poruke samo se navode po imenu, poruke koje nestaju
se izostavljaju, a skriveni razgovori se ne izvoze, kako nijedna datoteka izvan Erevosa ne bi pokazala da postoje.

**Zašto:** poruka koja nestaje se izostavlja, kao i citat takve poruke, jer je onaj ko ju je poslao htio da nestane,
a ne da ostane u datoteci.

Da obrišete jednu poruku, zadržite prst na njoj i dodirnite **Obriši**. Da obrišete sve poruke razgovora, dodirnite
njegovo ime, a zatim **Obriši poruke**. U oba slučaja Erevos pita gdje:

- **Ovaj telefon:** samo ovdje. Drugi telefon zadržava svoje.
- **Oba telefona:** i telefon te osobe ih briše, sljedeći put kad pogleda relay. Njen Erevos to radi, ali izmijenjena
  aplikacija, snimak ekrana ili kopija ih ipak mogu zadržati.

### Brisanje i blokiranje kontakta

Dodirnite ime razgovora, a zatim **Obriši kontakt** da zaboravite tu osobu: njen razgovor nestaje s ovog telefona, a
Erevos vam odmah daje novi red na relayu. Vašim ostalim kontaktima to se tiho javlja, u poruci bez ikakvog sadržaja, i
ponovo 7, 14 i 21 dan kasnije dok ne pišu u novi red; ono što su u međuvremenu pisali u stari i dalje se prikazuje 14
dana. Obrisanoj osobi se ništa ne javlja, i ništa što tamo pošalje ne prikazuje se. Vaš link za kontakt ostaje kakav
je bio, pa vas ona i dalje može njime zamoliti da ponovo razgovarate, kao zahtjev za razgovor, kao i svako ko ga ima.

**Zašto:** svi vaši kontakti pišu u vaš jedan red, pa onaj koga obrišete i dalje zna gdje se nalazi; kad se red
premjesti, više vam tamo ne može pisati, kao ni onaj ko je slao smeće opisano ispod. Vaš link za kontakt navodi
vlastiti red, koji brisanje ne dira, pa svaki link i QR kod koji ste dali nastavlja raditi.

**Red za svaki kontakt:** na relayu ažuriranom za to, svaki kontakt piše u vlastiti red, za koji zna samo on, javljen
unutar vaših šifriranih poruka; red vašeg linka za kontakt tada služi samo za prve poruke. Tako relay iz toga kamo
poruke idu ne može saznati da dva kontakta pišu na isti telefon, a brisanje ili blokiranje nekoga briše samo njegov
red: vaš vlastiti se premješta samo ako ga je i ta osoba znala, kao što ga znaju kontakti od prije ovoga, i neko ko je
došao preko vašeg linka za kontakt prije njegovog prvog premještanja. Kontakti od ranije redom dobijaju vlastiti red,
nekoliko njih odjednom, tiho, a njihov Erevos od ranije ga također prihvata. Ovi redovi čitaju se bez tokena, pa ih
token, koji imenuje vaš telefon, ne povezuje; preko Tora, po osam odjednom, svakih osam na vlastitim krugovima. I
dalje se prave i brišu s tokenom, pa ih relay koji vodi zapisnike tada može povezati. Skriveni razgovori i povezani
računari za sada zadržavaju jedan red za sve. Web-aplikacija nema Tor, pa dok je otvorena čeka na redovima svih vaših
kontakata zajedno, s jedne adrese; s uključenim obavijestima dok je zatvorena, vaš relay ima i jednu push adresu za
redove svih vaših kontakata (pogledajte [Na iPhoneu](#iphone)).

- **Blokiraj kontakt**, ispod toga, radi isto, a uz to odbacuje i ono što ta osoba pošalje kasnije, pa i zahtjev.
  **Blokiraj**, pored **Odbij**, blokira zahtjev za razgovor: zahtjev zna samo vaš link za kontakt, pa premješta vaš
  red samo dok link još navodi upravo taj red, što je tako do vašeg prvog premještanja. Oni koje ste blokirali nalaze
  se pod **Blokirani kontakti** u ekranu **Novi razgovor**, s dugmetom **Odblokiraj**. Ponovno dodavanje iz njihovog
  linka prvo traži da ih odblokirate; do tada ih ništa ne dodaje, ni njihov odgovor na pozivnicu putem SMS-a ni
  njihov link za kontakt u grupi. Svako ko piše preko vašeg linka za kontakt može natjerati telefon da se oglasi, kao
  i svaka poruka: **Odbij** ili **Blokiraj** zaustavlja tu osobu, **Obavijesti** → **Utišano** u njenom razgovoru
  utišava je bez odbijanja, a **Novi link za kontakt** zaustavlja svakoga ko ima stari link kad prođe njegovih 14 dana.
- **Grupe:** neko iz jedne od vaših grupa i dalje vam tamo može pisati. Erevos kaže u koliko ste grupa zajedno:
  napustite ih ili zamolite njihovog admina da tu osobu ukloni.
- **Kad relay nije dostupan**, red se mijenja čim relay odgovori, a do tada se ništa što ta osoba pošalje ne
  prikazuje.
- **Zakazane poruke** koje ste imali za tu osobu povlače se s relaya, odmah ili čim on odgovori, pa nikad ne odlaze.
- **Smeće:** kad se vaš red napuni onim što nije ni za koga ovdje, Erevos vam na isti način daje novi red i to kaže,
  najviše jednom dnevno. Kad smeće napuni red koji navodi vaš link za kontakt, umjesto toga dobijate novi link.
  Poplava izmišljenih zahtjeva za razgovor također se računa kao smeće, dok skup pravih ipak stiže.
- **Novi link za kontakt**, pored **Podijeli moj link za kontakt**, daje vam novi link: linkovi i QR kodovi koje ste
  ranije dali rade još 14 dana, a zatim više ne. Vaših kontakata se to ne tiče. Ako relay izgubi red koji navodi vaš
  link, na isti način dobijate novi link, ali oni koje ste ranije dali odmah prestaju raditi.
- **Link za web stranicu**, pored njega, u razgovorima prostora, daje vam link koji možete staviti na web stranicu, npr.
  stranicu za kontakt, s imenom koje odaberete. Otvara stranicu koja nudi {=Erevos} onome ko ga još nema, na Androidu,
  iPhoneu ili računaru, a zatim vas dodaje. Svako ko ga vidi može vam pisati, pa ono što pošalje stiže kao zahtjev za
  razgovor, koji prihvatate, odbijate ili blokirate. Ne daje mjesto na vašem relayu i važi dok važi vaš link za kontakt:
  **Novi link za kontakt** ukida i njega.
- **Na povezanom računaru** to ide na telefon, koji i sam briše ili blokira tu osobu i premješta svoje redove, a i
  redove računara. Telefon čuva ko je blokiran i to javlja računaru: dodavanje osobe tamo iz njenog linka i tamo traži
  da je odblokirate, a **Odblokiraj** je odblokira i na telefonu.
- **U skrivenim razgovorima** premještaju se samo redovi tog mjesta, njegov red za zvonjenje odmah, pa obrisana osoba
  više ne može natjerati telefon da zvoni. Ništa od prostora ni ostalih mjesta se ne premješta.

**Obriši** na kartici kontakta (pogledajte [Kontakti](#contacts)) uklanja samo karticu, a ne i razgovor. Rezervna
kopija napravljena prije brisanja ili blokiranja vraća taj kontakt: nakon vraćanja kopije ponovo ga obrišite ili
blokirajte. Nakon vraćanja, vaš red kaže da je noviji od svih koje vaši kontakti znaju, i svakom se ponovo javlja, pa
svi pišu tamo gdje vi čitate.

### Meni poruke

Zadržite prst na poruci za njen meni: reakcije na vrhu, a zatim ono što s njom možete uraditi.

- **Reakcije:** dodirnite jednu, ili **+** za više. Prikazuje se ispod poruke na oba telefona, vaša istaknuta;
  dodirnite je ponovo da je povučete. Svako od vas ima jednu reakciju na poruci. Ide odmah ili nikako: kad je ne mogu
  preuzeti ni relay ni telefon te osobe u blizini, ništa se ne mijenja.
- **Odgovori:** vaša sljedeća poruka odgovara na nju i prikazuje je citiranu iznad vaših riječi, na oba telefona.
  Dodirnite citat da odete na poruku na koju odgovara; **✕** ga uklanja. Erevos od prije ovoga prikazuje odgovor bez
  citata.
- **Odgovori u niti:** odgovara na nju u niti, kao u grupi: nit se prikazuje sama, s **Nit** na vrhu, a ono što tamo
  pošaljete odgovara na nju. Ispod poruke s odgovorima, **n odgovora u niti** je otvara; Nazad opet prikazuje cijeli
  razgovor. Stariji Erevos prikazuje svaki odgovor s njegovim citatom.
- **Proslijedi:** šalje njenu kopiju u drugi razgovor: izaberite kontakt ili grupu. Njene riječi, naljepnica ili
  lokacija idu iznova, anketa kao nova, još bez odgovora, a zvuk glasovne poruke ili bajtovi fotografije ili datoteke
  šalju se ponovo, šifrirani novim ključem, pa ništa ne povezuje kopiju s porukom od koje potiče. Kopija ispod sebe
  kaže **Proslijeđeno**, ali ne i odakle; Erevos od prije ovoga je prikazuje bez toga. Poruka koja nestaje ne
  prosljeđuje se, a iz skrivenih razgovora poruka ide samo u iste skrivene razgovore.
- **Označi zvjezdicom:** označava je zvjezdicom, samo na ovom telefonu, da je ponovo pronađete: **Poruke sa
  zvjezdicom** u meniju početnog ekrana navodi ih iz svih vaših razgovora, a detalji razgovora navode njegove. Dodir
  vodi na poruku. Poruke sa zvjezdicom iz skrivenih razgovora prikazuju se samo u detaljima njihovih razgovora.
  {+Razgovori na Matrixu, XMPP-u i Nostru, i }SMS razgovori{+,} takođe imaju **Označi zvjezdicom**, šifrovano samo na ovom
  telefonu: **Poruke sa zvjezdicom** jednog razgovora navode njegove, a one s početnog ekrana navode ih sa svim
  ostalima, svaku otvarajući njen razgovor na poruci. U tim razgovorima, kad zadržite fotografiju, video, glasovnu
  poruku, datoteku ili sliku MMS-a, nudi se i **Spremi u Zbirku**, a kad zadržite naljepnicu ili fotografiju koja je
  stigla, **Dodaj u moje naljepnice**; birač naljepnica u SMS-u nudi i vaše, da ih pošaljete kao MMS.
- **Prikvači:** prikvačuje je na vrh razgovora, na oba telefona; svako od vas može je otkvačiti dugmetom **Otkvači**.
  Kad ih je prikvačeno više, prikazuje se posljednja; dodirnite je da odete na nju, i prikaže se sljedeća.
- **Kopiraj:** stavlja njene riječi u međuspremnik, da ih zalijepite u drugu aplikaciju. Na Androidu je kopija
  označena kao privatna, pa obavijest telefona o njoj ne prikazuje riječi, ali svaka aplikacija koja čita
  međuspremnik može ih pročitati.
- **Odaberi:** bira ovu poruku, a dodir na druge ih dodaje; traka tada nudi **Kopiraj**, koji stavlja sve njihove riječi
  u jedan tekst s vremenom i piscem svake, **Proslijedi**, koji ih šalje u jedan razgovor, i **Obriši**, koji pita
  jednom prije nego ih obriše. **Nazad** prestaje s biranjem.
- **Uredi:** za vašu poruku, do jednog dana nakon što ste je poslali. Njene riječi idu u polje pod **Uređivanje
  poruke**: promijenite ih i pošaljite, ili **✕** da ostane kakva je bila. Oba telefona prikazuju nove riječi, s
  **Uređeno** pored vremena. Uređuju se samo riječi, ne naljepnica, lokacija, anketa, glasovna poruka, fotografija ili
  datoteka, ni riječi koje ste proslijedili. Poruka koja još čeka da ode odlazi s novim riječima, bez oznake; poruka
  poslana za kasnije ne uređuje se. Izmjena ide odmah ili nikako, kao i reakcija, a prikazuju je i vaši povezani
  uređaji. Erevos od prije ovoga zadržava stare riječi.
  **Zašto:** dan je dovoljno vremena da se ispravi greška, a niko ne može mijenjati ono što je rekao prije više dana.
  Oznaka pokazuje da riječi nisu prve.
- **Završi anketu:** za vašu anketu: nijedan glas se više ne računa i prikazuju se konačni rezultati. Erevos od prije
  ovoga je i dalje vidi otvorenom, a glas poslan u tom trenutku može se računati samo na nekim telefonima.
- **Obriši:** na ovom telefonu ili na oba, kao iznad.

Reakcije, odgovori, prikvačene poruke i izmjene putuju unutar šifriranja, kao i poruke.

### Kako riječi izgledaju

Znakovi upisani oko riječi mijenjaju kako se prikazuju, u razgovorima i grupama, kao u WhatsAppu i Signalu:
\`*podebljano*\`, \`_kurziv_\`, \`~precrtano~\`, riječ među obrnutim apostrofima kao kôd (tri obrnuta apostrofa oko
redova za blok koda) i \`||riječi||\`, skrivene iza sive trake dok ih ne dodirnete, na ekranu, u redu početnog ekrana i
u citatu (tamo kao ▒▒▒).

- **Samo oko riječi:** znak vrijedi kad počinje riječ i kad je završava, pa \`2*3*4\`, \`snake_case\` i web adrese
  ostaju kakvi jesu. Podebljano, kurziv i precrtano ostaju u jednom redu.
- **Drugi vide znakove:** raniji Erevos i druge aplikacije prikazuju riječi s njihovim znakovima, kako su upisane.
- **Skrivena fotografija:** pod **+**, **Skrivena fotografija** šalje fotografiju koja se u razgovoru prikazuje
  zamućeno, u razgovorima s kontaktima i u grupama, dok je ne dodirnete, i tada se sama otvara. Zamućena je i u
  dijelu **Mediji, linkovi i fajlovi**. Raniji Erevos je prikazuje kao svaku fotografiju.
- **Fotografija za jedno gledanje:** pod **+**, **Fotografija za jedno gledanje** šalje fotografiju koja se nikad ne
  prikazuje u razgovoru, s kontaktima i u grupama. **Kamera, za jedno gledanje** na isti način šalje jednu koju upravo
  snimaš. Ko je primi, dodirne je i vidi jednom, samu, bez snimaka ekrana gdje telefon to dopušta; kad se zatvori,
  Erevos je briše s njegovog telefona, a razgovor kaže **Fotografija viđena jednom**. Ne može se proslijediti,
  sačuvati ni staviti u Zbirku, a tvoj telefon je briše čim stigne. Ništa ne sprječava kameru uperenu u ekran, a
  stariji Erevos je prikazuje kao skrivenu fotografiju.

**Zašto:** znak upisan u riječi putuje u njima, unutar šifriranja, bez ičega pored njih po čemu bi se razlikovao.

### Poruke koje nestaju

Otvorite razgovor, dodirnite njegovo ime, a zatim **Poruke koje nestaju** da izaberete koliko dugo njegove nove poruke
traju nakon čitanja: 5 minuta, 1 sat, 1 dan ili 1 sedmicu. Da nestane samo sljedeća poruka, dodirnite štopericu pored
polja za poruku (ili **Poruka koja nestaje** pod **+**, ili **Nestajanje** u meniju strelice za slanje): iznad polja se
prikazuje **Nestaje nakon čitanja: 1 sat**. Dodirnite vrijeme da izaberete drugo, ili **✕** da to isključite. Važi za
sljedeću poruku koju pošaljete: riječi, glasovnu poruku, fotografiju ili datoteku, naljepnicu, lokaciju ili anketu,
sada ili kasnije. SMS ne može nestati: poslan kao SMS, ostaje na oba telefona (Erevos to prvo kaže), a štoperica se
ponovo isključuje. Njeno vrijeme počinje kad je drugi telefon prikaže na ekranu, a vrijeme vaše kopije kad to telefon
te osobe javi (**✓✓✓**). Svaka poruka kaže kada nestaje. Drugi telefon saznaje postavku razgovora sljedeći put kad
pogleda relay, a oba telefona je mogu promijeniti: važi kasnija promjena. Poruke koje su već u razgovoru ostaju.

- **Dok se ne pročita**, poruka koja nestaje ostaje na oba telefona, zapečaćena kao i ostale. Ako {=Erevos} te osobe
  nikad ne javi da ju je pročitao, vaša kopija ostaje.
- **Dok je Erevos zatvoren:** poruka čije je vrijeme došlo briše se kad se razgovor sljedeći put otvori. Do tada
  ostaje na telefonu, zapečaćena kao i ostale.
- **Nije garancija:** {=Erevos} te osobe ih briše, ali izmijenjena aplikacija, snimak ekrana ili kopija ih ipak mogu
  zadržati.

### Blokiraj snimke ekrana

Otvorite razgovor, dodirnite njegovo ime, pa **Blokiraj snimke ekrana**: na Androidu nijedan od dva telefona ne može napraviti snimak ni snimanje ekrana razgovora dok se prikazuje, a nedavne aplikacije ga prikazuju prazno. Drugi telefon to saznaje s vašom sljedećom porukom, i bilo ko od vas dvoje može to ponovo isključiti: važi kasnija promjena. Razgovor to kaže kad je druga osoba promijeni.

**Zašto:** ono što pišete ostaje između vas dvoje, osim ako neko namjerno ne krene da to kopira.

- **Samo na Androidu:** {=Erevos} na iPhoneu, na računaru, u pregledniku ili na Sailfishu ne može blokirati snimke ekrana, i razgovor to tamo kaže.
- **Nije garancija:** fotografija ekrana napravljena drugom kamerom, ili izmijenjena aplikacija, i dalje ga čuva.

### Obavijesti za ovaj razgovor

Na Androidu otvorite razgovor, dodirnite njegovo ime, pa **Obavijesti**; u grupi dodirnite njeno ime (u javnoj grupi
**⋯**), pa **Obavijesti**. **Utišano** na 8 sati, 1 sedmicu ili **Uvijek**: njegove poruke ne puštaju zvuk i ne
prikazuju obavijest, pa ih ni ikona Erevosa ne broji; lista ih i dalje prikazuje, s precrtanim zvoncem, a njegovi
pozivi i dalje zvone. **Zvuk poruke** i **Melodija zvona** daju mu vlastiti zvuk za poruke i za pozive, s Androidove
vlastite liste zvukova, ili **Bez zvuka**. U detaljima razgovora red tada kaže **Utišano do** i vrijeme, ili
**Vlastiti zvukovi**.

**Zašto:** utišan razgovor se i dalje broji u listi, da se ništa od onoga što je stiglo ne izgubi: samo vas telefon
više ne zove k njemu. Njegovi zvukovi se čuvaju samo na ovom telefonu, s razgovorom u šifriranim podacima prostora,
jer svaki telefon ima svoje zvukove: povezani uređaj čuva svoje, a drugi telefon ne saznaje ništa o njima.

- **U skrivenim razgovorima** postoji samo **Utišano**: vlastiti zvuk bi svakome u blizini otkrio o kojem je razgovoru
  riječ.{+ Tako je i s razgovorima vlastitih Matrix, XMPP i Nostr računa skrivenog mjesta: utišani, ne govore ništa, čak
  ni „Nova poruka“.}
- **Zatvoren prostor, i skriveni razgovori dok su zatvoreni,** ne znaju u kojem je razgovoru stigla poruka, pa o njoj
  javljaju kako kažu postavke aplikacije.
- **Samo na Androidu** zasad: web-aplikacija javlja o svakom razgovoru kako kažu njene postavke.

### Glasovne poruke

U razgovoru s kontaktom, kad ništa nije upisano, zadržite prst na mikrofonu na kraju trake za poruku dok govorite, i
pustite da pošaljete; prevucite ulijevo prije nego što pustite da je umjesto toga odbacite. Pritisak kraći od sekunde
smatra se greškom i ništa ne šalje. Nakon jednog minuta šalje se sama. Prvi put Android pita smije li Erevos koristiti
mikrofon: snima samo dok ga držite. S TalkBackom ga dodirnite jednom da počnete, a ponovo da pošaljete. Dodirnite
glasovnu poruku da je pustite, i ponovo da je zaustavite. Glasovne poruke imaju iste oznake kao i ostale i prate
postavku nestajanja razgovora.

**Promeni moj glas:** u detaljima razgovora sa kontaktom, **Promeni moj glas** šalje vaše glasovne poruke u tom
razgovoru **Dublje** ili **Više**, iste dužine. Telefon menja zvuk pre nego što poruka ode, pa vaš glas nikad ne
napušta telefon; ako promena ne uspe, poruka se ne šalje. Samo vaš telefon zna podešavanje. Glas postaje teško
prepoznati po sluhu, ali neko sa snimkom i vremenom mogao bi deo toga da poništi. Na Androidu 10 i novijem, i u
pregledačima koji sami prave Opus (WebCodecs); walkie-talkie zadržava vaš glas.

**Riječima:** drži glasovnu poruku, u chatu s kontaktom ili u grupi, i izaberi **Riječima**: telefon zapisuje ono što
je rečeno, da to pročitaš ili kopiraš. Prvi put preuzima govorni model od 268 MB, kad ti kažeš, s Erevosova vlastitog
poslužitelja, koji vidi tvoju adresu kao kod svakog preuzimanja; nakon toga sve se radi na tvom telefonu, i ni zvuk ni
njegove riječi ga ne napuštaju. Razumije stotinjak jezika, među njima i grčki, i prepoznaje onaj koji se govori. Može
pogriješiti, a riječi se ne čuvaju. **Obriši govorni model**, ispod, oslobađa prostor. Samo na Androidu, i treba
telefon s oko 2 GB slobodne memorije, jer dok piše zauzima oko 1,5 GB; ako to ne uspije, sljedeći pokušaj ponovo
otvara model. Gdje niko ne govori, u tišini ili buci, ne piše ništa, umjesto riječi koje niko nije rekao.

**Govori da pišeš:** dodirni mikrofon pored polja za poruku, u chatu ili u grupi, i izaberi **Govori da pišeš**: od tada, kad držiš mikrofon, on sluša umjesto da snima glasovnu poruku, dok u istom meniju ne izabereš **Glasovna poruka**. Govori;
dodirni **Gotovo**, i tvoje riječi se upisuju u polje, da ih promijeniš prije slanja. Koristi isti govorni model kao
**Riječima**, preuzet jednom kad ti kažeš, i sve se radi na tvom telefonu: ni tvoj glas ni njegove riječi ga ne
napuštaju, a zvuk se ne čuva. Sluša do dvije minute i može griješiti. Samo na Androidu.

**Prevedi:** drži pritisnutu poruku, u razgovoru s kontaktom ili u grupi, i izaberi **Prevedi**: tvoj telefon je
prevodi na tvoj jezik, ili na engleski, da je pročitaš ili kopiraš, između grčkog, engleskog, njemačkog, španjolskog,
francuskog i talijanskog. Pogađa jezik poruke; dodirni drugi pod **S** ili **Na** da promijeniš bilo koji. Prvi put za
neki jezik preuzima njegove modele za prevođenje, od 60 do 95 MB svaki, kad ti kažeš, s Erevosova vlastitog servera,
koji vidi tvoju adresu kao kod svakog preuzimanja; dva jezika od kojih nijedan nije engleski idu preko engleskog, s
modelom za svaki. Zatim se sve radi na tvom telefonu, i ni poruka ni njen prijevod ga ne napuštaju. Modeli su OPUS-MT
Sveučilišta u Helsinkiju (CC-BY 4.0). Može pogriješiti, a prijevod se ne čuva. **Obriši modele za prevođenje**, ispod,
oslobađa prostor. Samo na Androidu.

**Zašto:** na Androidu 10 i novijem, u web aplikaciji i na računaru glasovna poruka je Opus sa 32 kbit/s, oko 240 KB po
minutu, kako ih šalju Telegram, Element i Conversations: govor jasniji od toga ne može biti. Na Androidu 9 i starijem, i
u Safariju prije iOS-a 18.4 i macOS-a 15.4, to je AAC sa 64 kbit/s, oko 480 KB po minutu. Više se u glasu ne bi čulo,
ali bi se sporije slalo, naročito preko Bluetootha. Svaki Erevos pušta oba: Safari prije 18.4 pušta Opus kad ga Erevos
ponovo upakuje za njega, a gdje preglednik ne može pustiti neki, Erevos to kaže.

- **Preko relaya ili u blizini,** šifrirane s kraja na kraj kao i riječi, u nekoliko dijelova. Niko između ih ne može
  čuti, ali iz dijelova relay, ili onaj ko prisluškuje u blizini, može saznati da je poslano nešto dugo, i otprilike
  koliko dugo. U blizini idu samo na telefon kontakta za koji se zna da je u blizini.
- **Na telefonu** se svaki zvuk čuva u vlastitoj datoteci, zapečaćenoj vlastitim ključem, koji ima samo zapečaćena
  historija razgovora. Kad poruka nestane, bilo da je obrisana, da je nestala ili da je najstarija, nestaje i njena
  datoteka. Broj tih datoteka i njihove veličine otprilike pokazuju koliko glasovnih poruka telefon čuva, u svim svojim
  prostorima zajedno, ali ne i u kojem.
- **Dok se pušta**, zvuk je otpečaćen u Erevosovom kešu i briše se čim se zaustavi. Ako se Erevos zatvori dok snima ili
  pušta, ono što je ostalo briše se sljedeći put kad se otvori neki razgovor.

### Fotografije i datoteke

U razgovoru s kontaktom dodirnite **+** pored polja za poruku, koje se otvara tamo gdje je bila tastatura, a zatim
**Fotografija** da izaberete jednu od fotografija telefona, **Kamera** da je snimite, ili **Datoteka** za bilo šta
drugo, do 100 MB. Ispod njih, **Kvalitet fotografije** određuje kako fotografije idu, a
Erevos to pamti:

- **Original** (zadano): fotografija tačno onakva kakva je bila, u punoj veličini, bez gubitka kvaliteta. Uklanja se
  samo ono što govori osim same slike: gdje je snimljena, telefon, vrijeme, sličice. Njeno ime je samo „photo“.
  I fotografija poslana kao **Datoteka** (JPEG, PNG, GIF ili WebP, do 64 MB) ide bez toga, pod svojim imenom; za HEIC ili
  AVIF datoteku, ili veću, Erevos prvo pita, jer to iz nje ne može ukloniti.
- **90%** i **75%:** nova, manja fotografija, brža za slanje, koja ne govori ništa osim same slike.

Fotografije i datoteke te osobe do 16 MB stižu same; dodirnite veću da je preuzmete. Dodirnite fotografiju da je
vidite preko cijelog ekrana, s njenom veličinom: dva prsta ili dvostruki dodir je uvećavaju, jedan prst je pomjera dok
je uvećana, a jedan dodir skriva ili prikazuje ono što je oko nje. Dodirnite datoteku da je sačuvate. Erevos se okreće
s telefonom dok je na telefonu uključeno **Automatsko okretanje**, a fotografija prikazana sama okreće se i kad je
isključeno. **Sačuvaj** stavlja kopiju u folder koji izaberete prvi put, a **Sačuvaj u drugi folder** ga mijenja.
Fotografije i datoteke imaju iste oznake kao i ostale i prate postavku nestajanja razgovora.

- **Otvori drugom aplikacijom:** datoteka koja nije fotografija ima i **Otvori**, na Androidu: aplikacija telefona za
  njenu vrstu, recimo čitač PDF-a, čita je iz memorije Erevosa, bez kopije na telefonu, a veza se pušta kad se otvori
  sljedeća datoteka ili se prostor zaključa. Erevos prvo pita, jer je ta aplikacija izvan Erevosa i njegovog šifriranja,
  i nikad tako ne otvara web stranice, crteže ni pakete aplikacija, koji bi mogli izaći na internet izvan Tora: njih
  radije sačuvajte.
- **Kako putuju:** svaka datoteka šifrira se na telefonu vlastitim ključem, u dijelovima iste veličine, i stavlja na
  vaš relay. Kontaktu idu samo lokacija dijelova i ključ, šifrirani s kraja na kraj. Njegov telefon preuzima dijelove
  preko vlastitog relaya, pa vaš relay nikad ne vidi adresu njegovog telefona, provjerava svaki dio, a zatim ih briše
  s relaya. Dijelovi koje niko ne preuzme brišu se nakon 14 dana.
- **Šta relay vidi:** koliko ima dijelova i njihovu veličinu, dakle otprilike koliko je datoteka velika, i kada. Ne i
  šta je ni za koga je.
- **Datoteka ide onakva kakva je,** sa svime što govori u sebi: autora dokumenta, ili lokaciju i telefon fotografije
  ako je pošaljete preko **Datoteka**. Fotografije šaljite preko **Fotografija**.
- **Na telefonu** se svaka datoteka čuva u svojim dijelovima, onako kako su putovali, zapečaćena vlastitim ključem,
  koji ima samo zapečaćena historija razgovora. Kad poruka nestane, nestaju i njeni dijelovi. Broj dijelova otprilike
  pokazuje koliko telefon čuva, u svim svojim prostorima zajedno, ali ne i u kojem. Fotografija se prikazuje iz
  memorije, nikad se ne upisuje otpečaćena. Birač fotografija telefona predaje kopiju u Erevosovom kešu, koja se briše
  čim se pročita, a fotografija snimljena ovdje ne čuva se među fotografijama telefona.
- **Sačuvane** fotografije i datoteke su izvan Erevosa, nezapečaćene: svako ko ima telefon može ih otvoriti.
- **Samo preko relaya:** za datoteke je potrebna njegova pohrana datoteka, čak i kad je kontakt u blizini. Relay
  stariji od ove verzije ne može primati datoteke: ažurirajte ga.

### Još pod +

Pod **+** ima više za slanje od fotografija i datoteka (smajli na kraju polja za poruku također otvara naljepnice):

- **Naljepnica:** jedna od 576 naljepnica ugrađenih u Erevos, u 24 kompleta po 24 (među njima **Mjeseci**, **Psi**,
  **Grčka**, **Riječi** i **Poslastice**), koje svaki telefon sam iscrtava: putuje samo njeno ime, pa se nikad ništa
  ne preuzima. Erevos od prije ovoga umjesto nje prikazuje njen emoji. Sve osim riječi i poslastica malo se pomjeraju
  nekoliko sekundi kad stignu i kad ih dodirnete, a zatim miruju; s uključenom postavkom telefona za smanjenje pokreta
  ostaju mirne. Riječi se prikazuju na jeziku aplikacije.
- **Kao slika:** u razgovoru na drugoj mreži koja prima samo slike, ugrađena naljepnica ide umjesto toga kao njena
  slika: 512 sa 512 s prozirnom pozadinom, iscrtana na vašem telefonu ili računaru iz istih oblika, mirna, s riječima na
  jeziku aplikacije. Ništa se ne preuzima da bi se napravila.
- **Moje**, među naljepnicama, sadrži one koje napravite od fotografija. **Nova naljepnica od fotografije** izrezuje
  kvadrat, smanjuje ga (512 sa 512, najviše oko 100 KB) i zadržava samo sliku, ništa o tome gdje je ili čime je
  snimljena. Čuva se zapečaćena u prostoru, ili u skrivenim razgovorima u kojima je napravljena, i prikazuje se samo
  tamo, najviše 100 njih; zadržite prst na jednoj da je obrišete. Kao i ostalo, ulazi u rezervnu kopiju, zapečaćena,
  i nikad ne ide na druge uređaje naloga. Ide kao što ide fotografija, šifrirana s kraja na kraj preko relaya,
  označena kao naljepnica, pa se prikazuje sama, bez oblačića; Erevos od prije ovoga prikazuje je kao fotografiju.
  Zadržite prst na naljepnici koju vam je neko poslao i dodirnite **Dodaj u moje naljepnice** da je zadržite.
- **Lokacija** (na Androidu): šalje gdje se nalazite, jednom, kao mjesto. Prvi put Android pita smije li Erevos
  koristiti lokaciju. Telefon traži na sve načine koje ima odjednom: preko satelita, kad ste dozvolili preciznu lokaciju,
  i preko svoje mrežne lokacije, što na mnogim telefonima znači pitati Google ili proizvođača telefona. Odmah se otvara
  list koji kaže da traži; u zatvorenom, gdje se sateliti teško vide, to može potrajati do jedne minute. Kad ništa ne
  stigne na vrijeme, nudi mjesto koje je telefon pronašao u posljednjih deset minuta i kaže prije koliko, ili kaže zašto
  nijedno nije pronađeno, s **Pokušajte ponovo** i ekranom telefona koji to mijenja. Erevos gleda samo kad dodirnete,
  prikazuje vam mjesto prije nego što ode i ne prati vas nakon toga. Poruka sadrži samo koordinate, šifrirane s kraja na
  kraj; u Erevosu se ne učitava nikakva karta. **Otvori u kartama** predaje mjesto vašoj aplikaciji za karte, koja svoju
  kartu može učitati s interneta. Erevos od prije ovoga prikazuje koordinate kao riječi.
- **Kartica kontakta:** šalje kontakt iz kontakata vašeg telefona kao karticu, s imenom, brojevima i e-mail adresama,
  šifrirano s kraja na kraj. Druga osoba vidi karticu s **Dodaj u kontakte**; Erevos od prije ovoga je prikazuje kao
  riječi. U skrivenim razgovorima birate samo među kontaktima čuvanim u skrivenom prostoru, nikad među onima iz
  telefona.
- **Anketa:** pitanje s dvije ili više opcija, najviše 12, i, s **Više od jednog odgovora**, mogućnošću izbora više
  njih. Dodirnite opciju da je izaberete, a ponovo da povučete izbor; svaka opcija pokazuje koliko ju je izabralo, i
  ko. Glasovi putuju unutar šifriranja, kao i reakcije. Erevos od prije ovoga prikazuje pitanje i njegove opcije kao
  riječi, na koje se odgovara riječima.
- **Zahtjev za plaćanje** (iz druge aplikacije, kao Fasouli): iznos i za šta, kao kartica. Onaj od koga se traži dodirne
  **Plaćeno** kad plati, i tvoj telefon to sazna; ne može se poništiti. Zatim **Označi u Fasouliju**, na Androidu, ga
  tamo označi naplaćenim. Erevos ne prenosi novac i ne zna ni za jednu banku: kartica samo kaže šta je traženo. Samo u
  razgovorima s kontaktom, nikad u skrivenim. Stariji Erevos pokazuje iznos kao tekst.

**Zašto:** paket naljepnica preuzet s interneta otkrio bi serveru da ovaj telefon ima {=Erevos}, pa su naljepnice
ugrađene i putuju samo njihova imena. Vaše vlastite navedene su u jednoj zapečaćenoj vrijednosti iste veličine za
svaki prostor i skriveno mjesto, korišteno ili ne, pa popis koji se koristi izgleda kao onaj koji se ne koristi: 100 je
koliko sadrži. Lokacija se šalje samo s Androida: na računaru ili u web-aplikaciji preglednik bi pitao vanjsku uslugu
gdje se nalazi.

### Pregledi linkova

Link u poruci je podvučen i otvara se tek kad ga dodirnete i to potvrdite. S uključenim **Pregledi linkova**, u
detaljima razgovora, link koji pošaljete ide sa svojim pregledom: dok ga šaljete, ovaj telefon preuzima stranicu i
uzima njen naslov, jedan red o njoj i malu sliku, i to ide unutar poruke, šifrirano s kraja na kraj. Telefon koji ga
primi ništa ne preuzima: prikazuje ono što je stiglo. Isključeno je dok to ne uključite, a tada je uključeno za sve
razgovore prostora; svako mjesto skrivenih razgovora ima vlastiti prekidač, u detaljima razgovora tamo.

**Zašto:** stranicu preuzima samo telefon pošiljaoca, pa telefon koji primi link ne pristupa nijednoj stranici koju je
izabrao neko drugi i toj stranici ne pokazuje ništa o sebi, čak ni svoju adresu.

- **Stranica vidi internet adresu ovog telefona**, i kada, kao što bi je vidjela iz preglednika, ali ne i za koga je
  poruka. Kad je **Preko Tora** uključeno, u **Pregledima linkova**, stranica i njena slika preuzimaju se samo preko
  Tora, bez obzira na Tor podešavanje prostora, pa stranica ne vidi adresu. To je sporije i čeka dok se Tor pokreće;
  stranica koja vas šalje drugamo, ili koja ne pušta Tor, nema pregled. Dok sve u prostoru ide preko Tora (**Sve** pod
  Torom), pregledi se prave samo s uključenim **Preko Tora**.
- {=Erevos} na računaru ih ne pravi, ali svejedno prikazuje one koji stignu.
- **Preko LoRa veze**, koja prenosi samo malo, poruka ide bez pregleda radije nego da čeka, a ovdje ga ne zadržava.
- Pregled je ono što stranica kaže o sebi, istinito ili ne. Erevos od prije ovoga prikazuje link bez njega.

### Glasovni i video pozivi

U razgovoru s kontaktom dodirnite zelenu slušalicu na vrhu za glasovni poziv, ili plavu kameru pored nje za videopoziv.
Prvi put Android pita smije li Erevos koristiti mikrofon, a za video i kameru. Telefon te osobe zvoni dok je {=Erevos}
tamo otvoren, na bilo kojem ekranu prostora: ona dodirne **Javi se** ili **Odbij**. Tokom poziva možete isključiti
mikrofon, uključiti ili isključiti zvučnik, isključiti kameru, prebacivati se između prednje i zadnje kamere, i
**Prekini**. Svaki poziv ostavlja red u razgovoru, na primjer koliko je trajao, ili propušteni poziv.

- **Javiti se s videom ili samo glasom:** poziv koji zvoni nudi **Javi se**, samo glasom, i **Javi se s videom**, u
  pozivima Erevosa{+ te u XMPP i Matrix pozivima}; u grupnom pozivu to su **Pridruži se** i **Pridruži se s videom**. Video
  poziv na koji se javite samo glasom počinje s isključenom kamerom.
- **Kamo ide zvuk** (Android): s povezanim Bluetooth slušalicama ili slušalicama na kabel, **Zvučnik** postaje **Izlaz
  zvuka**: pokazuje kamo zvuk ide sada, **Telefon**, **Zvučnik**, **Slušalice** ili **Bluetooth**, a dodir ih sve
  nabraja, Bluetooth slušalice njihovim imenom, da izabereš. Slušalice povezane na početku poziva, ili tijekom njega,
  preuzimaju zvuk, kao u telefonskom pozivu, a uključena kamera ga ostavlja tamo; kad se odspoje, zvuk se vraća na
  telefon, ili na zvučnik u video pozivu.
- **Uključiti kameru kasnije:** **Uključi kameru**, na ekranu poziva, radi kad aplikacija druge strane može promijeniti
  poziv dok traje; grupni poziv ostaje kako ste mu se pridružili.
- **Dodati video glasovnom pozivu:** u glasovnom pozivu Erevosa **Dodaj video** uključuje vašu kameru kad druga osoba
  kaže da; ako kaže ne, poziv ostaje glasovni.
- **Tvoja slika:** u video pozivu tvoja kamera ispunjava ekran dok ne stigne slika druge strane; onda prelazi u mali
  prozor u gornjem uglu, na oba telefona, pa svako vidi drugog i sebe.
- **Promijeniti kameru:** **Promijeni kameru** prelazi na sljedeću kameru. Na računaru se prikazuje samo kad postoji
  više od jedne kamere.
- **Kako se poziv povezuje:** zadrži ekran poziva pritisnutim na trenutak da vidiš koliko je zvuka druge strane
  izgubljeno ili moralo biti popunjeno, što se čuje kao prekidi, koliko puta se to desilo, vrijeme tamo i natrag, put
  poziva i koliko je trebalo da zazvoni i da se poveže. Dodir ga zatvara. Mjeri se samo na tvom telefonu i pomaže da se
  nađe zašto poziv loše zvuči.

**Poziv na telefon koji ga sporo prima:** kad njihov telefon primi vaš poziv sa zakašnjenjem, na primjer zato što čita
preko Tora, **Pozivanje…** se vidi do minut i četvrt, a čim tamo zazvoni, zvoni 45 sekundi od tog trenutka, da poziv
koji je stigao kasno ne zazvoni na njihovom telefonu samo da bi odmah stao. Njihov telefon također čita poziv prije
svega što ima da pošalje, a nakon promjene mreže (s Wi-Fi-ja na mobilne podatke) odmah ponovo čeka pozive.

**Običan poziv preko mobilne mreže:** kad kontakt ima povezan svoj broj telefona, ili je povezan s nekim od vaših
kontakata koji ima broj (**Poveži s jednim od mojih kontakata** u njegovom razgovoru, prvo broj mobilnog), narandžasta
tastatura na vrhu njegovog razgovora, ispred kamere, otvara tastaturu s već upisanim tim brojem, kao i ona na vrhu SMS
razgovora. To je Erevosov **Telefon** kad je Erevos aplikacija za telefon, a inače vlastita aplikacija telefona: tamo
dodirnite dugme za poziv. Takav poziv ide preko mreže telefonske kompanije i nije šifriran, kao što ni običan SMS nije.
Skriveni razgovori i računari to nemaju.

- **Šifrirano s kraja na kraj:** poziv se uspostavlja porukama preko relaya, šifriranim kao i ostale. One nose ključ
  koji šifrira sam poziv, pa niko između ne može prisluškivati, čak ni relay za pozive opisan ispod.
- **Preko relaya za pozive:** relay postavljen kompletom iz \`deploy/relay\` ima uz sebe relay za pozive. Poziv ide
  preko njega, pa nijedan telefon ne saznaje IP adresu drugog. Preko Wi-Fi mreže ili mobilnih podataka, bilo gdje.
- **Bez relaya za pozive** (relay na vašem vlastitom računaru, na primjer), Erevos prvo pita: poziv tada ide direktno
  između telefona, radi samo na istoj Wi-Fi mreži, a svaki telefon vidi adresu drugog na njoj.
- **Bez interneta:** na istoj Wi-Fi mreži, na hotspotu telefona ili na Wi-Fi mreži koju prave dva telefona (Wi-Fi
  Direct), s prostorom otvorenim na oba, pozivu uopće nije potreban relay: uspostavlja se preko veze u blizini i ide
  direktno između telefona (ili računara). Isto važi i za grupne poruke i grupne pozive.
- **U pozadini (Android):** dok je prostor otvoren, Erevos nastavlja raditi kad ga napustite, dugmetom za početni ekran,
  dugmetom Nazad na njegovom prvom ekranu ili prevlačenjem iz nedavnih aplikacija, s tihom obaviješću, „Erevos – Ready
  for calls and messages“, koja se ne prikazuje na zaključanom ekranu. Čeka na relayu i na vezama s telefonima u
  blizini, pa poruke stižu: obavijest kaže samo „New message“ ili koliko ih je stiglo, a na zaključanom telefonu samo
  „Erevos“. Zahtjev za razgovor, od nekoga ko ima samo vaš link za kontakt, daje istu obavijest i zvuk, i broji se na
  ikoni, kao i svaka poruka. Poziv zvoni melodijom telefona i obaviješću, „Incoming call“ (ili „Incoming video call“) –
  „Open Erevos to answer“, bez imena, i preko zaključanog ekrana i čuvara ekrana, a ekran se budi. Dodirnite je da se
  javite. S uključenim zaključavanjem lozinkom, poziv koji zvoni prikazuje se prije lozinke, a Erevos se zaključava čim
  se poziv završi. Kad je zaključan, prostor nastavlja raditi iza ekrana za lozinku, pa poruke i pozivi i dalje stižu, a
  poziv se prikazuje preko ekrana za lozinku. Tako stižu samo razgovori i grupe tog prostora, i skriveni razgovori s
  uključenim **Primanje dok su zatvoreni**; ostali skriveni razgovori samo javljaju da je stigla poruka, ili zvone bez
  imena, ako im to dozvolite (pogledajte Skriveni razgovori). To se podešava u **Postavke** → **Obavijesti** → **U
  pozadini**: **Primaj i zvoni** (zadano) ili **Samo dok je Erevos na ekranu**, te **Javi da je stigla poruka** (zadano)
  ili **Bez obavijesti**, što važi i dok je Erevos na ekranu. Tamo su i, ako ih Android traži, **Izuzmi iz uštede
  baterije** i **Prikazuj pozive preko zaključanog ekrana**. Ispod, **Samo rasipanje** (zadano), **I telefoni u
  blizini** i **I san** određuju koliko baterije štedi u pozadini: drugi isključuje i radije za telefone u blizini dok
  je Erevos u pozadini, treći dopušta i telefonu da spava, pa Erevos gleda relay otprilike jednom u minuti, a poruka ili
  poziv mogu kasniti minutu-dvije.
- **I lagani san:** četvrti izbor ondje, između **I telefoni u blizini** i **I san**. Telefon smije spavati, ali Erevos ostavlja otvorenim svoje čekanje na relayu, pa ono što stigne budi telefon i poruka ili poziv i dalje stižu odmah gdje to mreža i Android dopuštaju; Erevos uz to i sam pogleda svakih nekoliko minuta. Nov je i još nije isproban na mnogo telefona: ako s njim poruke kasne, odaberi drugi.
- **Broj na ikoni:** uz uključeno **Javi da je stigla poruka**, kad napustite Erevos s nepročitanim porukama u
  razgovorima i grupama otvorenog prostora, obavijest ostaje, bez zvuka, i kaže koliko ih je, s onima koje javi
  poslije; nestaje dok je Erevos na ekranu, i vraća se kad ga napustite, dok ih ne pročitate. Ne broji poruke utišanog
  razgovora (pogledajte Obavijesti za ovaj razgovor), ni skrivenog u trenutku kad izlazite. Pokretač (launcher)
  Androida je prikazuje na ikoni Erevosa, kao broj ili, na nekim telefonima, poput Pixela, kao tačku. **Postavke** →
  **Obavijesti** → **Broj na ikoni** to isključuje: obavijest tada javlja samo ono što je stiglo otkako ste zadnji put
  imali Erevos otvoren, i broj pokretača nestaje s njom. Poruka obrisana za sve prije nego što ste je pročitali, ili
  pročitana na povezanom računaru, više se ne broji.

  **Zašto:** na Androidu samo obavijest može staviti broj na ikonu aplikacije, pa obavijest ostaje dok poruke čekaju;
  ne kaže ništa više od toga koliko ih je, kao i uvijek.
- **Zatvoren prostor:** ne prima ništa, jer je njegov ključ u memoriji samo dok je otvoren: njegove poruke čekaju na
  njegovom relayu i stižu kad ga otvorite. Osim ako u tom prostoru ne izaberete **I dok je otvoren drugi prostor** pod
  **Postavke** → **Obavijesti** → **U pozadini** (zadano je **Ovaj prostor samo dok je otvoren**): tada, dok je otvoren
  i prima drugi prostor, kaže samo „New message“ ili koliko ih je stiglo, istom obaviješću kao i taj prostor, nikad koji
  prostor, a njegovi skriveni razgovori ne kažu ništa. Ono što su drugi telefoni prenijeli do njegovog relaya računa se
  kao poruka, i brisanja, a poruka poslana njemu bez zvuka oglašava se kao i obično (pogledajte **Slanje bez zvuka**).
  Za to telefon čuva adrese njegovih redova na njegovom relayu izvan njegove lozinke, među njima i red u koji piše
  svaki njegov kontakt, do 64 kontakta, nikad njegove ključeve, ni ko su mu kontakti, ni njegove poruke, i pita relay
  samo koliko ih je stiglo, nikad ne traži same poruke: one ostaju tamo dok se prostor ne otvori. Za prostor koji ide
  preko Tora (**Poruke** ili **Sve**, pod **Što ide preko Tora**) pita se samo preko Tora: dok otvoreni prostor ima
  isključen Tor, ili se njegov Tor pokreće ili je upravo zakazao, zatvoreni prostor ne kaže ništa, a ono što je
  stiglo javlja se kad Tor tamo bude spreman.

  **Zašto:** prostor iza druge lozinke ne smije pokazati da postoji, pa je to isključeno dok to ne uključite, a tada ne
  kaže ništa više od onoga što bi rekao otvoreni prostor. Kad bi se pitalo direktno s telefona dok je otvoren drugi
  prostor, njegov relay ili neko ko prati mrežu mogao bi povezati ta dva prostora po IP adresi telefona. Pošto svaki
  kontakt piše u svoj red, prostor mora pitati i za svaki od njih, inače njihove poruke ne bi ništa javile. Cijena je
  to što njegov relay može saznati da su ta dva prostora na jednom telefonu, a neko ko alatima pregleda telefon može
  otkriti da drugi prostor tamo čuva adrese, i koliko kontakata ima.
- **Tačka za druge prostore:** u prostoru s **I dok je otvoren drugi prostor**, **Tačka u drugim prostorima**, ispod
  toga (zadano je **Bez tačke**), pokazuje i malu tačku na lokotu iznad razgovora otvorenog prostora, čim ovom stigne
  poruka dok je bio zatvoren, dok ga ne otvorite: nikad koliko, ni koji prostor. Radi gdje radi i obavijest: na
  Androidu, dok otvoreni prostor ima uključeno **Primaj i zvoni** i **Javi da je stigla poruka**. Za to telefon čuva,
  pored adresa gore, samo je li stigla poruka. Ko vidi razgovore otvorenog prostora vidi i tačku, i može pretpostaviti
  da postoji još jedan prostor.
- **Kad se telefon uključi:** nakon pokretanja telefona Erevos ne radi dok ga ne otvorite. S **Pokreni kad se telefon
  uključi** pod **Postavke** → **Obavijesti** → **U pozadini** (zadano je **Čekaj dok ga ne otvorim**) pokreće se sam
  nakon što se telefon uključi, ili nakon ažuriranja Erevosa, bez otvorenog prostora: nijedan prostor se ne može
  otvoriti bez svoje lozinke, jer Erevos ne čuva nijedan ključ na telefonu. Tada prostori s **I dok je otvoren drugi
  prostor** već kažu „New message“, ili koliko ih je stiglo, nikad koji prostor, ni od koga ni što, a tiha obavijest
  kaže „Locked“. Pozivi ne zvone, i ništa drugo ne stiže, dok ne otvorite neki prostor; prostori koji idu preko Tora
  do tada ne kažu ništa. Ako takvog prostora nema, ili s **Bez obavijesti**, odmah se zaustavlja. Samo na Androidu.

  **Zašto:** nakon ponovnog pokretanja Erevos vam nije mogao reći da poruke čekaju dok ga slučajno ne otvorite. Bez
  vaše lozinke ih i dalje ne može pročitati, pa ne kaže ništa više od onoga što kaže zatvoren prostor.
- **Gdje ne može zvoniti:** kad ga zaustavi Android (ili ušteda baterije telefona, ili vlastita postavka proizvođača
  telefona), nakon ponovnog pokretanja telefona dok jednom ne otvorite Erevos i prostor, u drugom prostoru (samo
  javlja da je stigla poruka, ako to dozvolite, kao iznad), ili na računaru ili u web-aplikaciji dok je zatvorena.
  Poziv se tamo prikazuje kao propušteni poziv kad se Erevos otvori. Kad Android zatvori Erevos dok prima i ponovo ga
  pokrene, kao što obično radi, tiha obavijest to kaže: otvorite Erevos i prostor da biste ponovo primali. Nakon
  **Prisilno zaustavi**, s potrošnjom baterije postavljenom na Ograničeno, ili kad ga zatvori vlastita postavka
  proizvođača telefona, Android ništa ponovo ne pokreće, pa to ne kaže nijedna obavijest: obavijest „Erevos“ samo
  nestane, i ništa ne zvoni dok ne otvorite Erevos. **Dozvole** (ispod) unaprijed kaže ako je nešto od toga
  postavljeno. Isto radi i jedna, „Locked“, kad se prostor koji je primao zatvori (na primjer nakon vraćanja
  rezervne kopije) i Erevos napusti ekran tražeći lozinku. Zahtjev za razgovor ne može vas pozvati dok ga ne
  prihvatite.
- **Dozvole (Android):** **Postavke** → **Općenito** → **Dozvole** prikazuje šta Android dozvoljava Erevosu za pozive
  i poruke u pozadini (obavijesti, obavijest o pozivu i to da iskače, obavijest o porukama, s njenim obavijestima
  „Messages without sound“ i „Messages with a chat's own sound“, koje također čuvaju broj na ikoni, pozive preko
  zaključanog ekrana, rad na bateriji, rad u pozadini s potrošnjom baterije koja nije postavljena na Ograničeno, bez
  pauziranja kad se ne koristi, mobilne podatke u pozadini, mikrofon) i za druge stvari (zvuk za nove poruke,
  obavijesti na zaključanom ekranu, pozive kroz Ne ometaj, kameru, telefone u blizini, kontakte, tačna vremena za SMS
  zakazane za kasnije i podsjetnike, obavijest o podsjetniku kad podsjetnik stigne), svaku s objašnjenjem zašto i
  dugmetom koje otvara Androidovo vlastito pitanje ili postavku. Kaže i kad je telefon bez zvuka
  ili na vibraciji, kad je uključena ušteda baterije i kad je uključeno Ne ometaj, a Erevos pozivi nisu propušteni
  kroz njega. Na Huawei, Honor, Xiaomi, OPPO, realme, OnePlus, vivo, Samsung i ASUS telefonima kaže i gdje je vlastita
  postavka proizvođača, koju Erevos ne može pročitati: dodirnite **Gotovo** kad je postavljena. Nakon svake nove
  verzije, i prvi put, otvara se sama kad pozivima ili porukama nešto treba. U web-aplikaciji prikazuje ono što
  preglednik dozvoljava, pogledajte [Na iPhoneu](#iphone).
- **Jedan poziv istovremeno.** Poziv traje dok se krećete između ekrana prostora. Završava se kad se prostor zatvori,
  a poziv u skrivenim razgovorima kad se oni zatvore, što se tokom poziva ne dešava. Prevlačenje Erevosa iz nedavnih
  aplikacija također završava poziv.
- Pozivi ne idu preko telefona u blizini ni preko Bluetootha. Tamo **Walkie-talkie** pod **+** pretvara razgovor u
  walkie-talkie, a iznad polja se prikazuje **Walkie-talkie je uključen**: držite walkie-talkie na kraju trake dok
  govorite, pustite, i pušta se na telefonu te osobe čim stigne, ako je tamo otvoren razgovor s vama; ako nije, čeka
  kao glasovna poruka. To je manja glasovna poruka (oko 3 KB u sekundi), pa ide svuda kuda ide i poruka, uključujući i
  Bluetooth.

**Zašto:** ključevi koji otvaraju poruke prostora nalaze se u memoriji samo dok je on otvoren, a inače su zapečaćeni
iza njegove lozinke. Zato se nakon ponovnog pokretanja telefona ništa ne može pročitati i ništa ne zvoni dok jednom ne
otvorite Erevos i prostor; a skriveni razgovori, čiji je ključ u memoriji samo dok su otvoreni, osim ako ga
**Primanje dok su zatvoreni** ne čuva uz prostor, inače samo javljaju da je stigla poruka, ili zvone bez imena, ako im
to dozvolite.

> Postavke relaya, vaš red, vaši kontakti i njihova imena, ključevi vaših razgovora i poruke čuvaju se u ovom
> prostoru, zapečaćeni. Historija nema ograničenja: čuva se u zapečaćenim stranicama iste veličine, pomiješanim sa
> stranicama ostalih prostora i skrivenih razgovora, pa se vidi samo koliko sve one zajedno zauzimaju, a ne čije su.
> Ostalo se čuva u istoj veličini za svaki prostor i skrivene razgovore, korištene ili ne; ono što je veće ide u
> stranice poput stranica historije, među njih. Obrisane poruke mogu neko vrijeme ostati u memoriji telefona,
> zapečaćene kao i ostalo, dok se preko njih nešto ne upiše. Poruke poslane ili primljene u blizini čuvaju se na isti
> način.

## Grupni razgovori {#groups}

Iz menija početnog ekrana, **Nova grupa**: dajte joj ime, označite kontakte koje želite pozvati i dodirnite **Napravi
grupu**. Vi ste njen admin. Telefon svakog kontakta sam odgovara sljedeći put kad se na njemu otvori {=Erevos} i ulazi u
grupu: grupa se tada prikazuje na njegovom početnom ekranu, s napomenom ko ga je dodao. Telefon ulazi samo u grupu
čiji je admin kontakt koji ga je pozvao, a admin pušta kontakt samo kao njega samog, nikad kao nekog drugog. Grupe
idu preko relaya, pa on mora biti postavljen.

**Zašto:** samo telefon admina mijenja grupu (ko je u njoj, njeno ime), pa nijedan server ne mora slagati promjene po
redu: svaki telefon ih preuzima od tog jednog. Zato član izlazi tako što zamoli admina, a samo admin dodaje i uklanja
članove.

- **Ko može biti pozvan:** kontakti koje ste prihvatili, u ovom prostoru. Članovi koji nisu kontakti jedni drugima
  ipak razgovaraju u grupi i prikazuju se po početku svog ključa.
- **Dodaj u kontakte:** na popisu članova (**⋯**), **Dodaj u kontakte** ispod člana koji nije vaš kontakt traži od
  njega, porukom koju dobija samo on, njegov link za kontakt i daje mu vaš. Na njegovom telefonu zahtjev se prikazuje
  jednom, na vrhu grupe, a on dodirne **Pošalji** ili **Ne šalji**; ako dodirne **Ne šalji**, vama se to ne javlja.
  Kad ga pošalje, jedno drugom ste kontakti, s vlastitim razgovorom, a **Ime** mu daje ime, kao i ispod svakog
  kontakta koji ga još nema. Izostanak odgovora može značiti da još nije otvorio grupu, da je rekao ne, da ima stariji
  {=Erevos} ili da vas već ima kao kontakt, što mu ništa ne prikazuje; nakon sedmice možete pitati ponovo. Kad postanete
  kontakti jedno drugom, u bilo kojoj grupi ili putem linka za kontakt, ono što je traženo u vašim drugim grupama
  nestaje, a njegov zahtjev se više ne prikazuje. Član uklonjen iz grupe više ništa ne traži. Ako dva člana pokazuju
  isti ključ, jedan od njih nije onaj za koga se predstavlja, i nijednom od njih ne ide link za kontakt niti se od
  ijednog uzima. Ne u javnim grupama. Traženje je za telefon na kojem je nalog; **Ime** radi i na povezanom uređaju.
- **Šifrirano s kraja na kraj za grupu:** MLS (RFC 9420). Svaka poruka šifrira se jednom za grupu, a zatim ponovo
  zapečaćuje za svakog člana, pa ono što stiže u red svakog člana ne liči ni na šta što dobijaju ostali, i nijedan
  relay ne može saznati ko je u grupi. Ide direktno u red svakog člana, preko vašeg relaya. Svake sedmice ključevi
  svakog telefona u grupi prave se iznova, adminovi sami, a svakog člana preko admina, pa ključevi jednom uzeti s
  telefona prestaju čitati grupu.
- **Članovi:** dodirnite ime grupe na vrhu, ili **⋯** pored njega. Admin dodaje kontakte, uklanja članove i
  preimenuje grupu. Uklonjeni član od tada ne čita ništa što se u grupi kaže, a grupa ostaje na njegovom telefonu,
  samo za čitanje, dok je ne obriše.
- **Niti:** zadržite prst na poruci i izaberite **Odgovori u niti** da joj odgovorite u niti, ili dodirnite **n odgovora
  u niti** ispod poruke da je otvorite. Nit se prikazuje sama, a ono što tamo pošaljete odgovara na nju.
- **Opis:** admin grupe ga piše u listu članova, pod **Opis**, i dodirne **Sačuvaj**. Svaki član ga čita, i oni koji se
  pridruže kasnije. Promjena od bilo koga drugog se zanemaruje.
- **Napuštanje grupe:** **Napusti grupu** to traži od admina, čiji vas telefon uklanja sljedeći put kad se na njemu
  otvori {=Erevos}. Adminovo vlastito dugme je **Zatvori grupu**: uklanja sve članove.
- **Jedan admin:** privatna grupa ima jednog admina, onoga ko ju je napravio. **Zašto:** promjene grupe moraju stizati
  jednim redoslijedom, a s MLS-om nijedan server ih ne slaže u red, pa bi dva admina mogla istovremeno promijeniti grupu
  i raspoloviti je. Erevos od prije ovoga prihvata promjene samo od onoga ko je grupu napravio.
- **Grupni pozivi:** zelena slušalica na vrhu grupe pokreće glasovni poziv u njoj, a plava kamera pored nje
  videopoziv (i **Videopoziv** pod **⋯**). Dok jedan traje, prikazuje se samo njegovo dugme, da mu se pridružite.
  Zvoni na telefonima članova na kojima je Erevos otvoren, a ko se javi, u pozivu je. Poziv koji traje prikazuje se na
  vrhu grupe, da mu se pridružite kasnije. Do osam osoba: svaki telefon se povezuje sa svakim drugim, preko relaya za
  pozive, pa nijedan telefon ne vidi IP adresu drugog; bez relaya za pozive, samo na istoj Wi-Fi mreži. Šifrirano s
  kraja na kraj između svaka dva telefona, a njihovi ključevi šalju se u šifriranju grupe. U videopozivu svaki telefon
  šalje svoju sliku svakom drugom, pa se slike prikazuju za najviše četiri osobe; s više njih se pauziraju, a zvuk
  ide dalje, dok se ne postavi server za veće videopozive. Poziv koji zvoni nudi **Pridruži se** i **Pridruži se s
  videom**.
- **Fotografije, datoteke i glasovne poruke:** **+** pored polja šalje fotografiju ili datoteku, kao u razgovoru s
  kontaktom, s istim **Kvalitet fotografije**; držite mikrofon dok govorite, i pustite da pošaljete. Svaka se
  šifrira vlastitim ključem i jednom stavlja na vaš relay, a u grupu, u njenom šifriranju, idu samo njena lokacija i
  ključ. Telefon svakog člana preuzima je odatle preko vlastitog relaya: do 16 MB sam dok je grupa otvorena, veću kad
  se dodirne. Dodirnite fotografiju da je vidite cijelu, datoteku da je sačuvate, glasovnu poruku da je pustite.
  - **Relay je čuva 14 dana,** šifriranu, jer ne može znati kada su je preuzeli svi članovi.
  - **Samo preko relaya,** čak i kad su članovi u blizini.
  - **Član koji uđe kasnije** ne dobija ono što je stiglo prije, kao ni kod riječi. Član čiji je {=Erevos} od prije ove
    verzije od toga ne vidi ništa.
  - **Na telefonu** se svaka čuva u svojim dijelovima, zapečaćena, kao u razgovoru s kontaktom. Brisanje grupe ovdje
    ih briše.
- **Meni poruke,** kad zadržite prst, kao u razgovoru s kontaktom: reakcije, **Odgovori**, **Proslijedi**, **Označi
  zvjezdicom**, **Prikvači**, **Kopiraj**, **Uredi** i **Obriši**. Svaki član ima jednu reakciju na poruci, a anketa
  pokazuje ko je šta izabrao. Prikvačena poruka je za sve, i svaki član je može otkvačiti dugmetom **Otkvači**.
  **Uredi** vašim riječima daje nove za svakog člana, do jednog dana nakon što su otišle, označene s **Uređeno**.
  **Obriši** pita **Ovaj telefon** ili, za vašu vlastitu poruku, **Za sve**: Erevos članova je također briše, a vaša
  fotografija, datoteka ili glasovna poruka napušta vaš relay odmah umjesto za 14 dana. **+** i ovdje ima
  **Naljepnica**, **Lokacija** i **Anketa**. Linkovi su podvučeni i pitaju prije otvaranja, a **Pregledi linkova**, kad
  su uključeni, idu s vašim linkovima. Na popisu članova, ili na vlastitom ekranu javne grupe, **Traži u ovom
  razgovoru** pretražuje poruke grupe, a **Izvezi razgovor** ih ispisuje, a **Mediji, linkovi i fajlovi** navodi fotografije, videe, glasovne poruke, muziku, fajlove i linkove grupe, svaku vrstu posebno, kao u razgovoru s kontaktom (vidi gore), svaki s skokom na svoju poruku; **Poruke sa zvjezdicom** i pretraga
  početnog ekrana obuhvataju i grupe. Član čiji je {=Erevos} od prije ove verzije vidi riječi, emoji naljepnice,
  koordinate lokacije i pitanje ankete, a ništa od reakcija, prikvačenih poruka, izmjena i brisanja. **Odaberi** bira
  više poruka da ih zajedno kopirate, proslijedite ili obrišete, vaša anketa ima **Završi anketu**, a **+** ima i
  **Kartica kontakta**. **Za sve** se pri brisanju nudi samo ako je sve što ste izabrali vaše.
- **Imenovanje člana:** upišite **@** u polje za poruku i članovi čija imena počinju onim što slijedi prikažu se iznad
  njega: dodirnite jednog da unesete cijelo njegovo ime. Član imenovan tako dobije obavijest o poruci čak i ako je
  utišao grupu. Računaju se samo cijela imena, pa **@Ana** ne imenuje Anu Mariju. Raniji Erevos prikazuje samo riječi i
  obavještava kako kažu postavke grupe.
- **Još ne:** kucanje i poruke koje nestaju u grupama, te grupe preko telefona u blizini.

## Javne grupe {#public-groups}

Javna grupa je grupa u koju svako ko ima njen link, ili njen QR kod, može zatražiti ulazak: za klub, ulicu ili
razred, gdje vam nisu svi kontakti. Iz menija početnog ekrana, **Javne grupe**: dajte joj ime i ime pod kojim ste u
njoj, izaberite ko ulazi i dodirnite **Napravi javnu grupu**. Vi ste njen vlasnik. Njene poruke šifrirane su s kraja
na kraj pomoću MLS-a i idu svakom članu kao u svakoj grupi, a nijedan relay ne saznaje ko je u njoj.

- **Link:** dodirnite ime grupe na vrhu za njen link i QR kod, i **Podijeli link**. Ko ga otvori, ili skenira kod
  kamerom telefona, bira ime koje grupa vidi i dodirne **Zatraži pridruživanje**. Link se može i zalijepiti pod
  **Pridruži se putem linka**. Svaki član ima link i može ga proslijediti dalje.
- **Opis:** vlasnik ili admin ga piše na ekranu same grupe, pod **Opis**, i dodirne **Sačuvaj**; svi u grupi ga čitaju.
- **Ulazak dok niste tu:** zahtjev čeka na vašem relayu, zapečaćen tako da ga otvara samo vaš telefon, dok se Erevos
  ne otvori na vašem telefonu: gleda svakih nekoliko sekundi dok je Erevos na ekranu, a otprilike svakog minuta u
  pozadini. Tada ih pušta, i grupa se prikazuje na njihovom telefonu.
- **Ulazak u grupu:** **Svi koji imaju link** ili **Admin odobrava ulazak**: tada onaj ko traži čeka pod **Zahtjevi
  za pridruživanje** da vi ili neki admin dodirnete **Primi** ili **Odbij**. Vaš telefon ga ipak pušta, kad to čuje.
- **Admini:** pod **Članovi** dodirnite **Moderiraj** pored člana, a zatim **Postavi za admina**. Admini isključuju
  pisanje, uklanjaju i zabranjuju pristup članovima, puštaju one koji traže i brišu poruku za sve; samo vi moderirate
  admine, a vas ne moderira niko.
  - **Isključi mikrofon:** njegov telefon ništa ne šalje u grupu, a nijedan telefon ionako ne prikazuje ono što
    njegov pošalje. **Dozvoli pisanje** to poništava.
  - **Ukloni:** od tada ne čita ništa što se u grupi kaže i može ponovo zatražiti ulazak putem linka.
  - **Zabrani pristup:** uklonjen je, a ono što njegov telefon kasnije traži odbija se. **Ukloni zabranu**, pod **Pod
    zabranom**, to poništava. Zabrana zaustavlja isti telefon, a ne nekoga ko se vrati s novim redom na relayu: protiv
    toga izaberite **Admin odobrava ulazak** ili promijenite link.
  - **Obriši za sve:** posljednje poruke navedene su na dnu; **Obriši** uklanja jednu s telefona svakog člana. Ko ju
    je već pročitao, možda je sačuvao kopiju.
- **Promijeni link:** link i QR kod koji su dosad podijeljeni odmah prestaju raditi, a svaki član dobija novi.
  Zahtjevi koji još čekaju na starom gube se.
- **Predaj grupu:** pod **Moderiraj** nekog člana. Njegov telefon je od tada vlasnik i pušta ljude, pa se link mijenja
  u link na njegovom relayu; vi ostajete admin. Ako se vaš telefon izgubi prije nego što je predate, niko više ne može
  nikoga pustiti, iako grupa ide dalje za one koji su u njoj.
- **Zatvori grupu** uklanja sve članove. **Napusti grupu** nekog člana traži od vašeg telefona da ga ukloni.
- **Grupa za jednokratnu upotrebu,** za jednu priliku: prije nego je napraviš, pod **Ističe** izaberi **Nakon jednog
  dana**, **Nakon 3 dana** ili **Nakon 7 dana**. Kad joj istekne vrijeme, {=Erevos} svakog člana je briše, svaki po satu
  svog telefona, s porukama, fotografijama i datotekama, sljedeći put kad je otvoren, i njen link prestaje raditi. Kad
  ističe određuje se kad se grupa pravi i nikad se ne mijenja. Ekran same grupe kaže kad ističe. Član sa starijim
  Erevosom je zadržava, a do tada je svako mogao sačuvati kopiju ili snimak ekrana.
- **Najviše 100 članova,** jer cijela grupa mora stati u jednu poruku koja nekoga pušta unutra.
- **Svaki telefon u javnoj grupi treba ovu verziju Erevosa.** Grupe napravljene od kontakata rade kao i prije.

**Zašto:** samo telefon vlasnika mijenja grupu i pušta ljude, pa se promjene nikad ne sudaraju i nijedan server ne
mora slagati ih po redu. Zato grupa ide dalje i bez njega, ali niko novi ne ulazi: predajte je prije nego što
promijenite telefon.

### Šta javna grupa otkriva

> Svako ko ima link može čitati grupu od trenutka kad ga puste, nikad ono što je rečeno prije, a link se može
> proslijediti dalje: promijenite ga da to zaustavite.

- **Link** svakome ko ga vidi pokazuje ime grupe i adresu vašeg relaya.
- **Svaki član vidi svakog člana:** izabrano ime, ključ napravljen samo za ovu grupu, adresu njegovog relaya i
  identifikator pošiljaoca njegovog reda. Ključ ne govori ništa o tome ko je u svojim razgovorima, niti u kojim je
  drugim grupama. Red je onaj na kojem čitaju samo njegove javne grupe, a ne onaj iz njegovog linka za kontakt, isti u
  svakoj njegovoj javnoj grupi (Erevos prije verzije 2.0.0 navodi onaj iz svog linka za kontakt).
- **Imena su izabrana, a ne dokazana:** svako se može nazvati kako god hoće. Početak ključa svakog člana prikazuje se
  pored imena, a vlasnik i admini su označeni.
- **Sve što se kaže može kopirati** svako u grupi: šifriranje s kraja na kraj drži vani relaye, a ne članove.
- **Relayi** ništa ne čitaju i ne saznaju nikoga u grupi. Vaš vidi zahtjeve kako stižu na vrata grupe, koliko ih je i
  kada, ali ne i od koga. Članovi mogu puniti redove jedni drugima onim što se ne može pročitati, do onoliko koliko
  relay prima.

## Kako Erevos bira put {#paths}

Kad pošaljete poruku, Erevos sam bira put:

1. **Telefon te osobe je u blizini** (na vrhu razgovora piše **U blizini**): poruka ide preko veze u blizini, a i
   preko relaya kad on postoji.
2. **Inače, s relayem:** ide preko relaya, a kratka poruka ide i {=Erevos} telefonima povezanim u blizini, pa telefon te
   osobe može odgovoriti u blizini ako je jedan od njih. Ako relay nije dostupan, važi ta kopija, a ti telefoni je
   prenose i do relaya vašeg kontakta, kao u [Razgovor s telefonom u blizini](#nearby).
3. **Inače, bez relaya,** ide {=Erevos} telefonima povezanim u blizini, kao u koraku 2.
4. **I preko LoRa veze,** kad je postavljen radio, a relay nije mogao preuzeti tekst, kao u [Preko LoRa
   radija](#lora). Ako nema nikakvog puta, poruka čeka, označena s **Na čekanju**, i odlazi sama čim se put pojavi,
   kao u [Poslano, stiglo i pročitano](#relay); linija ispod razgovora kaže zašto.
5. **I SMS-om,** na samom kraju, kad ste ga uključili za taj kontakt i ništa drugo nije prenijelo tekst, kao u
   [SMS](#sms).

Svaki put je šifriran s kraja na kraj: nijedan relay ni telefon između ne može pročitati ono što šaljete.

**Putevi**, pod **Postavke** → **Relay i mreže**, pokazuju svaki put na prvi pogled: karticu za relay, Nostr, telefone u blizini, LoRa, SMS i Tor, svaku s time kakav je put sada i linijom ispod, punom kad radi, blijedom kad je uključen ali sada nikoga ne doseže, i isprekidanom kad je isključen. Iznad piše koliko vaših poruka čeka da ode, s narandžastom tačkom za svaku. Kartica otvara postavke svog puta. Prikazuje samo otvoreni prostor, nikad skrivene razgovore. Na početnom ekranu, red ispod gornje trake su takođe **Putevi**, čim je relay postavljen: tačka za svaki put, i koliko vaših poruka čeka; dodir ih otvara.

| Linija ispod razgovora | Šta uraditi |
| --- | --- |
| **Poslano u blizini, šifrirano s kraja na kraj.** | Ništa: telefon te osobe je u blizini i ima poruku. |
| **Poslano preko relaya, šifrirano s kraja na kraj.** | Ništa: poruka je na putu. |
| **Poslano {=Erevos} telefonima u blizini, šifrirano s kraja na kraj, jer relay nije dostupan.** | Stiže samo ako je jedan od njih telefon te osobe: sačekajte **✓✓** ili provjerite relay. |
| **… Ako njegov telefon nije među njima, oni poruku predaju njegovom relayu kad dođu do interneta, a isto radi i ovaj telefon.** | Ništa: stiže kad jedan od njih, ili ovaj telefon, dođe do interneta. Sačekajte **✓✓**. |
| **Poslano preko LoRa veze, šifrirano s kraja na kraj, jer relay nije dostupan.** | Stiže ako {=Erevos} te osobe ima radio na istoj mesh mreži, u dometu: sačekajte **✓✓** ili provjerite relay. |
| **Poslano SMS-om, šifrirano s kraja na kraj, jer ništa drugo nije moglo.** | Ništa: košta SMS, a mobilni operater vidi da ste pisali na njihov broj. **✓✓** stiže čim relay ili Nostr budu dostupni. |
| **Na čekanju. Relay nije dostupan (ili Nema relaya), a telefon te osobe nije u blizini.** | Ništa: odlazi sama čim je relay ili telefon te osobe u blizini može preuzeti, a tada prikazuje **✓**. Bez relaya upišite njegovu adresu, kao u [Razgovor preko relaya](#relay), ili priđite telefonu te osobe. |
| **Na čekanju. Preduga je za LoRa vezu.** | Ništa: odlazi čim je relay ili telefon te osobe u blizini može preuzeti. Ili je pošaljite u kraćim dijelovima. |
| **Na čekanju. Preduga je za SMS.** | Ništa: ide čim je relay ili njihov telefon u blizini može prenijeti. Ili je pošaljite u kraćim dijelovima. |
| **Nije poslano. Relay više nema red ovog kontakta.** | Zamolite tu osobu da vam piše ili da vam da svoj novi link za kontakt. |
| **Ova verzija ne može šifrirati, pa su razgovori preko relaya isključeni.** | Ponovo izgradite aplikaciju: ova verzija je starija od svog šifriranja. |

## Vlastiti relay {#own-relay}

Relay koji sami pokrećete je najsigurniji, jer onaj ko vodi relay vidi ko se na njega povezuje. Izvorni kôd sadrži
sve u \`deploy/relay\`.

- **Na vlastitoj mreži:** pokrenite relay na računaru, otvorite port 7879 u njegovom zaštitnom zidu (firewall) i na
  svakom telefonu upišite \`ws://<njegova adresa>:7879\`. Kad završite, ponovo zatvorite port.
- **Na internetu:** server (VPS) s Debianom 12 ili Ubuntuom 22.04 ili novijim, ime domene (ili besplatno
  \`sslip.io\` ime) i otvoreni portovi 80 i 443. Jedna naredba instalira relay iza Caddyja, s certifikatom od Let's
  Encrypta i nasumičnim tokenom. Svaki telefon tada koristi \`wss://<vaša domena>\` i taj token. Ista naredba postavlja
  i relay za pozive, kojem trebaju otvoreni i port 3478 i UDP portovi od 50000 do 50999.

Redovi i poruke na čekanju čuvaju se na disku servera, kao i šifrirani dijelovi fotografija i datoteka dok se ne
preuzmu (ukupno najviše 1024 MB), pa ponovno pokretanje ništa ne gubi, a nijedan zahtjev se ne zapisuje.
Poruke poslane za kasnije također se tamo čuvaju do svog vremena, najviše 10.000 ili 256 MB: relay vidi kada svaka
treba otići, ali ne i šta kaže.

**Zašto:** ono što relay čuva ima ograničenja, pa telefoni koji ga koriste ne mogu napuniti njegov disk ni memoriju.

**Njegov vlastiti ključ:** datoteka s ključem relaya (\`EREVOS_RELAY_KEY\`, koju postavlja ta jedna naredba) je ono što
on dokazuje pri svakoj vezi, pa ga telefoni prepoznaju po tom ključu, a ne po certifikatu (pogledajte [Vlastiti ključ
relaya](#relay)). Čuvajte tu datoteku, i u njegovim rezervnim kopijama: s novom datotekom, svaki telefon koji je znao
stari ključ odbija relay dok neko na njemu ne dodirne **Ima novi ključ**.

**Pozivnice:** relay može svakom telefonu dati vlastiti token, u datoteci tokena, a zatim tim telefonima dozvoliti da
pozivaju druge, svaka pozivnica za jedan telefon (pogledajte [Pozivnice na relay](#relay)). Uključite to s
\`EREVOS_RELAY_INVITES=on\` pored \`EREVOS_RELAY_TOKENS\`; relay tada sam upisuje redove pozvanih telefona u tu
datoteku, s tim ko ih je pozvao i kada, a uklanjanje reda isključuje taj telefon, samo njega: telefoni koje je on pozvao
zadržavaju svoje, pa da i njih isključite, obrišite svaki njihov red (svaki kaže ko ga je pozvao). Putem pozivnica pušta
najviše 100 telefona (\`EREVOS_RELAY_MAX_INVITED\`). \`erevos-relay free-line NAME\`, pokrenuto dok je relay
zaustavljen, čini red jednim od vaših: telefon koji ga je pozvao više ga ne može povući, i više se ne računa među 100.
Telefon koji dođe s tokenom relaya (\`EREVOS_RELAY_TOKEN\`) jednom traži vlastiti red, koji relay dodaje kao jedan od
vaših, uz napomenu da je došao s tokenom relaya i kada, najviše 50 dnevno: tako možete dijeliti taj token, obrisati red
bilo kojeg pojedinačnog telefona, a zatim promijeniti token bez isključivanja ostalih. \`deploy/relay/README.md\` kaže
kako.

**Prijava:** s datotekom tokena relay može dozvoliti telefonima i da se prijave preko OpenID Connect pružaoca usluge,
kao što je Authentik, za vlastiti token, a svaki nalog provjerava svakog sata, uklanjajući njegove telefone nakon 3
dana bez odgovora i još dvije neuspjele provjere svakog telefona u razmaku od sat vremena (pogledajte [Prijava na
relay](#relay)). Jedan preglednik može pokrenuti 10 prijava u minuti. S \`EREVOS_RELAY_OIDC_GROUP\` mogu samo nalozi
iz te grupe.
Potrebni su klijent kod pružaoca usluge, nekoliko postavki i \`/signin/\` proslijeđen relayu kao običan HTTP:
\`deploy/relay/README.md\` kaže kako.

> Nikad ne objavljujte token tamo gdje ga drugi mogu pročitati. Onaj ko vodi server vidi IP adrese koje se povezuju,
> identifikatore redova, te kada i koliko stiže. Ne može čitati poruke, koje su šifrirane s kraja na kraj.

## Kućni relay {#home-relay}

Pod **Postavke** → **Relay i mreže** → **Kućni relay** prostor može imati drugi relay s vlastitim redom: relay kod
kuće, na Raspberry Piju ili starom računaru, ili bilo koji drugi relay kojem vjerujete. Nije obavezan.

- **Šta radi:** vaš link za kontakt i svaka poruka navode taj red pored vašeg relaya. Dok vaš relay nije dostupan,
  kontakti pišu tamo, a Erevos pri svakom pogledu preuzima ono što tamo stigne. Ono što šaljete ide preko njega kad
  vaš vlastiti relay ne radi.
- **Kako ga postaviti:** pokrenite relay kao u [Vlastiti relay](#own-relay), upišite njegovu adresu (i token, ako ga
  ima) i izaberite **Sačuvaj**. Kontakti ga saznaju iz vaše sljedeće poruke ili iz vašeg novog linka za kontakt.
- **Šta vidi:** ono što vidi vaš relay, adresu ovog telefona kad preuzima poruke (ali ne kad mu se pristupa samo preko
  Tora), te kada i koliko stiže. Skriveni razgovori ga ne koriste.
- **Samo preko Tora:** prekidač za svaki kućni relay. Taj relay nikad ne vidi adresu ovog telefona, bez obzira na to šta
  je za ostalo postavljeno u Toru. Bez upisanog tokena daje token za kupon: vaš relay, relay samog prostora, potpisuje
  kupon naslijepo, pa nijedan relay ne može znati čiji je token. Kupon se uzima do sat vremena nakon što je potpisan, u nasumično vrijeme, pa se vremena koja su vidjela dva relaya ne poklapaju, a token stiže od kućnog relaya u roku od sat
  vremena. Token traje 90 dana, a Erevos sam uzima novi kupon nasumičnog dana između 30. i 60. dana. Ograničenje: kad na relayu ima malo telefona,
  onaj ko vodi oba mogao bi i dalje pogađati samo po vremenima. Tako dva prostora (vidi [Druga lozinka](#second)) mogu
  koristiti jedan drugome relay kao kućni relay, a nijedan relay ih ne povezuje. Oba relaya moraju imati uključene
  kupone, a treba verzija s Torom, na Androidu (vidi [Preko Tora](#tor)).
- **Automatski od vašeg relaya:** prekidač, isključen dok ga ne uključite, na Androidu, gdje Erevos ima Tor. Kad vaš
  relay navede relay s kojim je uparen (to podešava onaj ko ga vodi), prostor bez kućnog relaya sam uzima taj, samo
  preko Tora, s tokenom od kupona kao gore: ništa za upisivanje i ništa za raditi kad vaš relay navede drugi.
  Kad ga isključite, pušta kućni relay koji je uzeo, a uklanjanje kućnog relaya rukom to isključuje za taj prostor; kućni relay koji ste sami upisali ostaje kakav je.
  Skrivena mjesta nikad ne uzimaju takav.
- **Za skrivene razgovore:** svako skriveno mjesto može imati vlastiti kućni relay, pod **Za napredne korisnike** na
  svom ekranu kad nije izabran nijedan razgovor, dok je otvoreno. Čuva se samo s tim mjestom, zapečaćen njegovim
  PIN-om, pa prostor ne zna ništa o njemu, a gleda se dok je mjesto otvoreno. Koristite drugi relay, a ne relay
  prostora: jedan relay koji vidi oba reda povezao bi ih.

**Više od jednog:** **Dodajte još jedan kućni relay** daje do još dva, svaki s vlastitim redom, na primjer jedan kod
kuće i jedan kod prijatelja. Kontakti ih probaju prikazanim redom, a {=Erevos} preuzima ono što stigne na svaki. Vaš link
za kontakt navodi ostale samo dok ostaje dovoljno kratak za jedan QR kod; ostali stižu do kontakata s vašom sljedećom
porukom. Kontakt sa starijim Erevosom koristi samo prvi.

## Preko Tora {#tor}

Pod **Postavke** → **Relay i mreže** → **Tor**, **Što ide preko Tora** određuje koji zahtjevi ovog prostora prema
njegovim relayima idu preko mreže Tor. Svaki prostor ima vlastiti izbor:

| Izbor | Šta ide preko Tora |
| --- | --- |
| **Ništa** | Ako to ne promijenite. Relay i Nostr relayi vide IP adresu vašeg telefona za sve. |
| **Poruke** | Ono što pišete i ono što vašim kontaktima nešto javlja, na primjer da je poruka pročitana. Slike, datoteke i glasovne poruke idu direktno, što je brže: za njih relay vidi IP adresu vašeg telefona. |
| **Sve** | I datoteke. Ništa ne ide na relay bez Tora. |

**Zašto:** novi prostor počinje s **Ništa**, jer Tor usporava poruke; prostor napravljen prije zadržava svoj izbor. S
**Poruke**, ono što pišete skriva Tor i nikad ne čeka na njega, dok slike, datoteke i glasovne poruke, koje su velike,
idu direktno, pa time i brže.

- **Uključivanje Tora:** s **Ništa** na **Poruke** ili **Sve**, Erevos prvo pita **Uključiti Tor?** i kaže da će poruke
  biti sporije; **Otkaži** zadržava **Ništa**.

- **Jedan razgovor samo preko Tora:** u Erevos razgovoru, **Detalji** → **Preko Tora** šalje poruke i datoteke tog
  razgovora samo preko Tora, vlastitim Tor krugovima, bez obzira na izbor ovog prostora; isključeno je dok ga ne
  uključite. Relay tada za taj razgovor ne vidi IP adresu vašeg telefona, i nijedan Tor izlaz ga ne nosi zajedno s
  drugim razgovorom. Sporije je, a ono što ide čeka dok se Tor pokreće. Pozivi ne idu preko Tora. Skriveni razgovori
  ga također imaju, svaki u svojim **Detaljima**.
  Isto je na vašim povezanim uređajima: uključeno ili isključeno na jednom, uključeno je ili isključeno na svima. Na
  uređaju bez Tora, kao što je web aplikacija, taj razgovor ne šalje ništa dok je uključeno.
  Vrijedi i za Nostr tekstove tog razgovora te njegove fotografije i datoteke na Nostr serverima datoteka, čak i kad
  je izbor ovog prostora **Ništa**: Tor se za njih pokreće i ništa ne ide direktno. Dok vaš kontakt prvi put ne napiše
  u vlastiti red razgovora, njegove prve poruke dolaze u red prostora, koji se čita onako kako prostor kaže. Vidi [Ko
  vidi vašu IP adresu](#ip).

- **Šta skriva:** relay više ne vidi IP adresu vašeg telefona, samo izlaz iz Tora (ili ništa, za relay s
  \`.onion\` adresom). Vaša telefonska kompanija ili Wi-Fi mreža vide samo da koristite Tor, ali ne i koji relay.
- **Šta košta:** ono što ide preko Tora sporije stiže i odlazi, a prvo pokretanje Tora traje neko vrijeme. Ekran
  pokazuje dokle je Tor stigao. Da bi štedio bateriju, Erevos šalje smanjeno popunjavanje koje je Tor napravio za
  telefone: popuna koju Tor šalje da sakrije kada razgovarate ide svakih 9 do 14 sekundi, a ne svakih nekoliko, i
  nikakva ne stiže na telefon.
- **Šta ne pokriva:** pozive, čiji zvuk i slika idu direktno između telefona ili preko relaya za pozive; telefone u
  blizini i SMS, koji ne koriste internet.
- **Samo na Androidu:** {=Erevos} na računaru i web-aplikacija još nemaju Tor, pa tamo sve ide direktno.

> S **Poruke**, poruka nikad ne čeka na Tor: poruka koju Tor nije mogao odnijeti do relaya odmah ide direktno, kao i
> poruke dok se Tor pokreće, ili minut nakon što nije mogao doći do relaya; zatim se Tor ponovo pokušava. S **Sve**,
> ništa ne ide na relay bez Tora:
> kad Tor ne može doći do relaya, poruka čeka i ponovo se pokušava; Erevos se nikad sam ne vraća na vašu vlastitu
> vezu.

### Mostovi

Tamo gdje je sam Tor blokiran, **Mostovi** na istom ekranu omogućavaju Toru da umjesto toga do svoje mreže dođe preko
mostova. Postavljeno je na **Bez mostova** dok ne izaberete drukčije, svaki prostor ima vlastiti izbor, a važi samo
dok nešto ide preko Tora.

| Izbor | Šta je to |
| --- | --- |
| **Automatski** | Erevos redom pokušava načine dok se Tor ne poveže: direktno, obfs4 mostove, Snowflake, zatim vaše redove, ako ih imate. Pamti 30 dana onaj koji je radio na Wi-Fi mreži i na mobilnim podacima, i njega prvo pokušava; na drugoj mreži traži ponovo. Sa uključenim **Moja mreža je pod nadzorom** nikad ne pokušava direktno, pa mreža vidi samo most. |
| **obfs4** | Obfs4 mostovi s kojima dolazi Tor Browser. Onome ko prati mrežu Tor izgleda kao nasumični bajtovi. Cenzor koji ih zna može ih blokirati. |
| **Pahulja** (Snowflake) | Preko preglednika volontera, preko WebRTC-a, onako kako ide videopoziv. Da ga pronađe, Erevos pita Snowflakeov posrednik (broker) preko CDN-a, iza imena druge stranice, a STUN serveri kažu telefonu njegovu vlastitu adresu: vide tu adresu, nikad vaše poruke. Sporije, i teško ga je blokirati. |
| **Vlastiti** | Redovi mostova s bridges.torproject.org, s bridges@torproject.org putem e-maila ili od @GetBridgesBot na Telegramu, zalijepljeni jedan po redu; zatim dodirnite **Koristi ove mostove**. Rade obfs4, Snowflake, WebTunnel, meek i obični mostovi. |

- **Samo preko njih:** s mostovima Tor nikad ne ide direktno do svojih relaya. Kad nijedan most ne odgovara, s **Sve**
  poruke čekaju, kao kad Tor ne može doći do relaya; s **Poruke** idu na relay bez Tora dok neki most ne odgovori.
  Redovi koji nisu mostovi ne prihvataju se, i Tor ostaje isključen.
- **Provjeri moju vezu**, ispod, kaže da li se Tor povezuje, i kojim načinom, nikad adresu telefona. Sa
  **Automatski**, traži ponovo od početka.
- **Njihova promjena** dok Tor radi zatvara njegove veze i ponovo ih pravi na novi način.
- **Samo na Androidu:** aplikacija sadrži lyrebird, Torov vlastiti program za obfs4, Snowflake, WebTunnel i meek.
  Računar i web-aplikacija još nemaju Tor, pa nemaju ni mostove.

## Preko Nostra {#nostr}

Pod **Postavke** → **Relay i mreže** → **Nostr**, **Tekstovi preko Nostra** je **Uključeno** dok to ne promijenite.
Tada ono što pišete kontaktu čiji {=Erevos} također čita na Nostru ide prvo preko vaših relaya: vašeg relaya, pa kućnih
relaya kontakta, pa vašeg kućnog relaya; a preko javnih Nostr relaya tek kad ga nijedan nije preuzeo. Svaki prostor ima
vlastiti izbor i vlastite Nostr relaye.

- **Kako je zapečaćeno:** šifrirano s kraja na kraj kao i uvijek, zatim zapečaćeno još jednom za ključ koji je vaš
  kontakt dao samo ovom razgovoru, i potpisano ključem napravljenim samo za taj jedan tekst (NIP-59 gift wrap). Nostr
  relayi vide da je neko pisao ključu koji ne imenuje nikoga, kada i koliko veliko; ne vide ko je pisao, ni kome. Vaš
  relay ne vidi ono što je išlo tim putem.
- **Šta Nostr relayi mogu saznati:** vaš telefon traži od svakog od njih sve svoje ključeve odjednom:
  relay može saznati da se ti ključevi čitaju zajedno. Preko Tora nikad odakle: do svakog relaya dolazi se vlastitim Tor
  krugovima, pa nijedan izlaz iz Tora ne prenosi ono što ide do dva relaya, i nijedan ne može saznati da je to od
  jednog telefona. S **Ništa** ide izravno, pa vide IP adresu vašeg telefona, ali i dalje ne ko je kome pisao. Neki relayi odbijaju neke izlaze iz Tora, a neki izlazi ne mogu doći do nekog relaya: nakon takvog
  neuspjeha sljedeći pokušaj ide preko drugog izlaza.
- **Kako ide:** s **Ništa**, tekstovi idu izravno do Nostr relaya. S **Poruke**, preko Tora kad je Tor spreman, a preko
  vašeg relaya dok se Tor pokreće. Sa **Sve**, samo preko Tora. Kad se put promijeni, Nostr veze se zatvore i ponovo
  otvore novim putem.
- **Nostr preko Tora:** na ekranu **Nostr**, **Nostr preko Tora** je **Isključeno** dok ga ne uključite.
  **Uključeno**, Erevos dolazi do Nostr relaya i Nostr servera datoteka samo preko Tora i pokreće Tor za to, čak i kad
  je Tor prostora na **Ništa**; tekst koji ide tamo čeka dok se Tor pokreće. Dodaje samo Tor: kad je Tor za prostor
  uključen, Nostr ide preko Tora šta god ovo kaže, a razgovor s **Preko Tora** ide preko Tora šta god ovo kaže. Vidi
  [Ko vidi vašu IP adresu](#ip).
- **Relayi:** relay.damus.io, nos.lol i relay.primal.net, ako ih ne promijenite; možete dodati vlastite, najviše pet.
  Vašim kontaktima se javljaju relayi na kojima čitate, i oni vam tamo pišu; dovoljan je jedan koji preuzme tekst.
- **Šta ostaje na vašem relayu:** pozivi, reakcije i oznake da je poruka stigla ili pročitana; i ono što pišete kontaktima na iPhoneu ili računaru, koji ne čitaju na Nostru. Slike, datoteke i glasovne poruke idu preko vašeg relaya kad je jedan između vas; bez relaya između vas idu i preko Nostra (pogledajte Bez ikakvog relaya).
- **Kojim je putem išla:** zadržite prst na poruci: njen meni kaže **Poslano preko Nostra** ili **Stiglo preko Nostra**
  kad ju je preuzeo neki Nostr relay. Od sada kaže i **Poslano preko relaya**, **Stiglo preko relaya**, **Poslano na
  njihov obližnji telefon**, **Stiglo s obližnjeg telefona** ili **Poslano preko LoRa**; starija poruka ne kaže ništa. I
  napomena ispod poruka kaže **Poslano preko Nostra**. Dva telefona jedan pored drugog prvo predaju jedan drugom
  tekstove u blizini, zatim preko relaya; Nostr nosi tekst samo kad ga relayi nisu preuzeli.
- **Što su relayi zadnje učinili:** ekran **Nostr** za svaki relay pokazuje je li preuzeo posljednji tekst koji je dobio
  i koliko sekundi nakon toga, ili zašto nije, te čita li vaš telefon na njemu. Čuva se samo na ovom telefonu, dok se
  Erevos ne zatvori. Tekst nikad ne čeka Nostr relaye dok ga vaši relayi preuzimaju.
- **Samo na Androidu,** kao i Tor.

**Zašto:** Nostr relayi su javni, pa Erevos do njih, kad je Tor uključen za prostor, dolazi preko Tora, i oni nikad ne
saznaju gdje je vaš telefon; s **Ništa** dolazi do njih izravno. Tamo idu samo tekstovi, kao rezerva vaših relaya:
tekst koji je otišao tamo ide ponovno preko vašeg relaya, ako ne stigne, dok oznake da je poruka stigla ili pročitana ne
bi imale nikakvu, a poruci poslanoj za kasnije potreban je vaš relay da je čuva do njenog vremena. Bez relaya između
vas, tamo idu i slike, datoteke i glasovne poruke (pogledajte Bez ikakvog relaya).

> Tekst koji je išao preko Nostra ide ponovno preko vašeg relaya ako telefon vašeg kontakta u roku od pet minuta ne
> javi da je stigao, a kontakt ga vidi jednom. Kad ga ne preuzmu ni vaši relayi ni neki Nostr relay, čeka i ide ponovno,
> kao svaka poruka.

- **Skriveni razgovori:** i oni čitaju na Nostru, dok su otvoreni, a i zatvoreni dok je za njih uključeno **Primanje
  dok su zatvoreni** i dok je prostor otvoren (pogledajte [Skriveni razgovori](#hidden)). Zatvoreni i dalje
  prikazuju „New message“: sa svakim tekstom preko Nostra vaš kontakt vašem relayu šalje i zvono, poruku koja ništa
  ne kaže, koju vaš relay broji kao jednu, kao i prije. Bez relaya, njihov link za kontakt i QR kod kažu gdje čitaju
  na Nostru, s ključem samo tog mjesta, a tekstovi, reakcije i oznake da je poruka stigla idu tamo, kao s telefona
  bez relaya.

### Bez ikakvog relaya {#nostr-only}

Telefon bez relaya, bez pozivnice i bez LPHL naloga ipak može početi: njegov link za kontakt i QR kod kažu gdje čita na
Nostru, i to je dovoljno za razgovor.

- **Da počnete:** u ekranu **Novi razgovor** dodirnite **Počnite bez relaya**, zatim **Prikaži moj QR kod** ili
  **Podijeli moj link za kontakt**, i dajte ga nekome ko koristi {=Erevos}. Onaj ko ga doda piše vam preko Nostra
  i prikazuje se kao zahtjev za razgovor, koji prihvatate. I vi možete dodati njegov link ili QR kod, na isti
  način.
- **Šta ide:** tekstovi, naljepnice, reakcije, izmjene i oznake da je poruka stigla ili pročitana, sve preko Nostra; i fotografije, datoteke i glasovne poruke. Glasovna poruka ide u wrapovima kao tekst. Fotografija do 3 MB ide u komadima od 32 KB, po jedan wrap, poslanim prije poruke koja je nudi; drugi telefon ih čuva, šifrirane s ostatkom prostora ili skrivenih razgovora za koje su stigli, dok ne stignu svi, najviše četiri dana. Veća fotografija, video ili bilo koja druga datoteka, do 20 MB, ide kao jedan blob, šifriran na telefonu, na Blossom poslužitelj datoteka (blossom.primal.net, blossom.band ili nostr.download), preko Tora kako kaže izbor Tora za prostor (izravno s **Ništa**): poslužitelj čuva samo ono što ne može pročitati. Za pozive i grupe potreban je relay, ili drugi telefon u blizini. Skriveni razgovori i tako rade, samo preko Nostra (pogledajte [Skriveni razgovori](#hidden)).
- **Kad ne stigne:** Nostr relayi čuvaju tekst dva dana. Dok telefon vašeg kontakta ne javi da je stigao, Erevos mu ga
  ponovo daje jednom dnevno, dvije sedmice.
- **Relay sam od sebe:** kad vaš kontakt ima relay koji mu dozvoljava da poziva, njegov {=Erevos} sam šalje vašem
  pozivnicu za njega, jednom, u razgovoru, bilo da ste se prvi put sreli preko Nostra ili u blizini, preko Bluetootha,
  Wi-Fi mreže ili QR koda. Vaš telefon je sam prihvata, i od tada rade i fotografije, glasovne poruke i pozivi, sa
  svima. Računa se kao jedna od njegovih pozivnica. Neko čiji zahtjev za razgovor niste prihvatili ne bira relay za
  vas: njegova pozivnica čeka dok ga ne prihvatite, najviše sedmicu.
- **Stariji Erevos** ne čita Nostr dio linka: dopire do vas samo u blizini, dok ne budete imali relay.

**Zašto:** Nostr je samo način ulaska. Nikome ne treba pozivnica da počne, a kad jedno od vas ima relay, on prenosi
ono što je preveliko za Nostr.

## Ko vidi vašu IP adresu {#ip}

Internet adresa vašeg telefona, njegova IP adresa, otprilike pokazuje gdje ste i kojeg provajdera koristite. Ne
pokazuje šta pišete. Ko se spoji na vaš telefon, vidi je, osim ako veza ne ide preko Tora.

- **Vaš relay i relayi vaših kontakata:** vide je. Da je sakrijete, uključite Tor za prostor (**Postavke** → **Relay i
  mreže** → **Tor**) ili **Preko Tora** u **Detaljima** jednog razgovora. Vidi [Preko Tora](#tor).

- [+] **XMPP:** vaš XMPP server je vidi dok je Erevos povezan, osim ako račun ide preko Tora; serveri vaših kontakata i
  grupa ne, jer vaš server nosi vaše poruke do njih. Erevos upozorava prije nego što pošaljete u razgovoru dok račun
  ne ide preko Tora (s **Preko Tora** za taj razgovor kao rješenjem), prije svakog poziva, i prije preuzimanja fajla s
  drugog servera osim vašeg. Vidi [XMPP](#xmpp).

- **Javni Nostr relayi i Nostr serveri datoteka:** vide je, osim ako veza ne ide preko Tora. Uključite **Nostr preko
  Tora** pod **Postavke** → **Relay i mreže** → **Nostr**, ili **Preko Tora** za jedan razgovor. Vidi [Preko
  Nostra](#nostr).
- **Uparivanje kodom:** dva telefona se sreću na tim istim javnim Nostr relayima, pa bez Nostra preko Tora oni vide
  adresu, ali ne i kod ni kontakt linkove. Erevos to kaže prije prvog uparivanja.

- [+] **Matrix:** vidi je samo vaš vlastiti Matrix server, ne serveri vaših kontakata: fotografije i datoteke s drugih
  servera stižu vam takođe preko vašeg. Izaberite **Tor za ovaj Matrix račun** na Matrix ekranu, ili uključite **Preko
  Tora** ispod dugmadi razgovora, što cijeli račun vodi preko Tora. Pogledajte [Matrix](#matrix).
- [+] **Telegram:** Telegramovi serveri je vide, osim ako račun ide preko Tora: izaberi **Uvijek preko Tora** u
  **Tor za ovaj Telegram račun**, u Telegram podešavanjima, ili uključi **Preko Tora** u informacijama razgovora, što
  šalje cijeli račun preko Tora. Vidi [Telegram](#telegram).
- [+] **Razgovori s drugim Nostr aplikacijama i Javni feed:** njihovi relayi i serveri datoteka je vide, osim ako račun ide
  preko Tora (**Tor** na ekranu **Nostr razgovori**) ili je uključeno **Preko Tora** razgovora. Objavljivanje, lajkanje
  ili glasanje u Javnom feedu, i njegove fotografije i pregledi linkova bez Tora, također je pokazuju. Pogledajte
  [Razgovori s drugim Nostr aplikacijama](#nostr-chats).
- [+] **Messenger, Signal i Session** (Erevos+): vide je njihovi serveri (Metini, Signalovi, ili prvi Session čvor), ne
  vaši kontakti, osim ako račun ide preko Tora: izaberite **Uvijek preko Tora** pod **Tor za ovaj … račun** na
  njegovom ekranu, ili uključite **Preko Tora** u jednom razgovoru, što šalje cijeli račun preko Tora. Prijava,
  Signalov captcha, Messengerove slike i **Otvori Facebook** idu isto. Erevos upozorava prije nego pošaljete u razgovoru dok račun ne ide
  preko Tora, i prije svakog poziva. Vidi [Messenger](#messenger), [Signal](#signal) i [Session](#session).

- **Pozivi:** nikad ne idu preko Tora. Relay za pozive, vaš ili vašeg kontakta, vidi adresu, ali ne i ono što se
  govori. Poziv između obližnjih telefona na istoj mreži ostaje na toj mreži.

- **Datoteka na serveru koji je odabrao vaš kontakt:** server vidi adresu kad vaš telefon preuzima datoteku. Tor je
  sakriva.

- **Web linkovi koje otvarate:** sajt je vidi, kao i svaka web-stranica. Da je sakrijete, otvarajte linkove u Tor
  Browseru. Pregled linka također se preuzima s njegovog sajta, pa sajt vidi adresu na isti način.
  S uključenim **Preko Tora** za preglede linkova, ne vidi.

- **Relay kontakta:** dok vaš prostor nema vlastiti relay, ili samo posuđeno mjesto na jednom, kontakt vam može dati
  mjesto na svom, i ono stiže s njegovom porukom. Njegov relay tada vidi adresu, pa Erevos pita prije nego ga
  prihvati, osim ako prostor sve šalje preko Tora. Ako se ne prihvati, pozivnica se odbacuje.

- **Grupe:** poruka u Erevos grupi ide preko servera, koji vidi adresu. Tor za prostor je sakriva; grupa nema vlastiti
  prekidač.

- **Rezervne kopije, server Zbirke, liste radija i TV-a, pregledi linkova i ažuriranja:** svako ima svoj prekidač
  **Preko Tora**, na svom ekranu, isključen dok ga ne uključite. Vidi [Rezervne kopije](#backup),
  [Zbirka](#collection), [Razgovor preko relaya](#relay) i [Ažuriranja](#updates).

- **Radio stanice i TV kanali:** svaki vidi adresu dok se pušta. **Puštaj preko Tora**, u postavkama Zbirke na
  Androidu, isključeno dok ga ne uključite, pušta ih samo preko Tora. Vidi [Zbirka](#collection).

Erevos upozorava jednom prije svakog od ovih slučajeva, s naslovom **Vaša IP adresa može biti vidljiva**, dugmetom
**Vodič** koje otvara ovaj odjeljak i, gdje može, dugmetom koje to popravlja, poput **Preko Tora za ovaj razgovor**.
**Nastavi** ide dalje; za razgovor se kaže jednom i ne ponavlja se za taj razgovor.

Nakon vodiča isto pitanje se vraća, a ono što ste slali, poput glasovne poruke ili datoteke, čeka na njega. Poziv
koji ovdje zvoni to kaže ispod poziva, a javljanje ide dalje. Skriveni razgovori čuvaju ono što je rečeno kod sebe,
odvojeno od prostora.

Obližnji telefoni, LoRa i SMS ne koriste internet, pa ne pokazuju nikakvu IP adresu.

## Matrix {#matrix}

U **Postavke** → **Relay i mreže** → **Matrix**, prostor se može prijaviti na Matrix račun, za razgovor s ljudima koji
koriste Element ili drugu Matrix aplikaciju. Erevos sam razgovara s Matrix serverom, kao Element: nikakav most nije
između.

- **Prijava:** vaš Matrix ID, kao @ime:matrix.org, i njegova lozinka. Erevos postaje novi uređaj računa, nazvan
  Erevos. Prijava i ključevi uređaja čuvaju se šifrovani u ovom prostoru, i nalaze se u rezervnim kopijama: nakon
  vraćanja prostor se ponovo prijavljuje, kao novi uređaj. Njegovi skriveni razgovori mogu imati vlastiti Matrix račun,
  pogledajte [Skriveni razgovori](#hidden).
- **Jedinstvena prijava:** na Androidu, kad vaš Matrix server prijavljuje ljude negdje drugdje (kao što matrix.org
  traži za nove račune), **Prijava jedinstvenom prijavom (SSO)** otvara preglednik na toj stranici, a on se vraća u
  Erevos kad se tamo prijavite; server s više pružatelja pušta vas da odaberete jednog. Preglednik ne ide preko Tora,
  pa ta stranica vidi vašu adresu. Budući da nema lozinke za dati, Erevos pravi ključeve unakrsnog potpisivanja računa
  samo kad ih server primi bez ponovnog pitanja; inače provjerite ovaj uređaj emojijima ili QR kodom s drugog svog
  uređaja, ili unesite sigurnosni ključ.
- **Razgovori:** **Novi razgovor** počinje šifrovani razgovor s Matrix ID-om. Pozivi se prikazuju prvi, s
  **Pridruži se** i **Odbij**. Napišite ime umjesto Matrix ID-a da tražite ljude u imeniku korisnika vašeg Matrix
  servera, koji tako sazna koga ste tražili; **Pokreni** počinje razgovor s onim koga dodirnete.
- **Grupe:** **Nova grupa**, na Matrix ekranu, pravi šifrovanu grupu od imena i Matrix ID-ova koje napišete, svaki
  pozvan da uđe, kako je pravi Element; svi u njoj vide ko su ostali. **Pridruži se grupi** ulazi u grupu po njenoj adresi,
  kao #name:matrix.org. Javna grupa možda nije šifrovana, i tada to kaže njen ekran. U grupi, **Pozovi** poziva nekog
  drugog, ako vam grupa to dozvoljava.
  Kad u grupi otkucate **@**, nude se njeni članovi; poruka imenuje one napisane cijele, i njihove aplikacije im to
  jave.
- **Članovi:** u grupi **Članovi** navode njene ljude i pokazuju ko je **vlasnik**, **admin** ili **moderator**, kako
  kažu njihovi nivoi ovlaštenja. Gdje vaš nivo dopušta, preimenujete grupu, postavite njenu **Temu**, **Postavi za
  admina** ili **Ukloni kao admina**, **Ukloni** nekoga (poruke grupe mu više ne stižu) ili ga **Zabrani** (ne može se
  ponovo pridružiti dok ga admin ne pusti).
- **Šifrovanje:** poruke su šifrovane s kraja na kraj Matrixovim vlastitim šifrovanjem (Olm i Megolm, kroz
  vodozemac). Razgovor koji nije šifrovan to kaže.
- **Nije anonimno:** Matrix server vidi vaš račun, ko s kim razgovara i kada, i, bez Tora, odakle. U razgovoru s
  ljudima na drugim serverima, vide to i ti serveri.
- **Preko Tora:** na Androidu, Matrix ekran, i prije prijave, ima izbor Tora koji ima svaki račun: **Isključeno**
  (zadano) ide direktno, i Matrix server vidi vašu adresu; **Kao prostor** slijedi **Postavke** → **Relay i mreže** →
  **Tor**: s **Poruke**, preko Tora čim je spreman i direktno dok se pokreće, fotografije i datoteke direktno; sa
  **Sve**, sve samo preko Tora; **Uvijek preko Tora** šalje ovaj račun samo preko Tora, i prijavu, i ništa bez njega.
  Tor koristi mostove prostora. **Preko Tora** jednog razgovora, ispod njegovih dugmadi, čini da cijeli račun ide samo
  preko Tora dok je uključeno: Matrix ima jednu vezu za sve razgovore jednog računa. Pozivi nikad ne idu preko Tora.
- **Poruke od prije:** poruka poslana prije nego što se Erevos prijavio, ili ona čiji ključ još nije stigao, prikazuje
  se zaključana.
- **Fotografije i datoteke:** **Fotografija** i **Datoteka** ih šalju, do 50 MB, šifrovane na telefonu prije nego što
  odu na Matrix server, koji tako čuva samo ono što ne može pročitati. Primljena fotografija preuzima se tek kad
  dodirnete **Prikaži fotografiju**; **Sačuvaj** čuva bilo koju datoteku na telefonu.
  Dodirnite prikazanu fotografiju da je vidite preko cijelog ekrana, kao u razgovoru s kontaktom: dva prsta ili
  dvostruki dodir je uvećavaju, okreće se s telefonom, a **Sačuvaj** je čuva (pogledajte Fotografije i datoteke, pod
  [Razgovor preko relaya](#relay)).
- **Naljepnice:** naljepnica koju pošalju Element, FluffyChat ili Element X prikazuje se u razgovoru; **Prikaži
  naljepnicu** je preuzima preko vašeg Matrix servera. **Naljepnica** šalje vaše naljepnice napravljene od fotografija
  (**Moje**) kao slike, šifrirane gdje je i razgovor. Tu su i ugrađeni kompleti: svaka naljepnica ide kao njena slika,
  napravljena na vašem uređaju, s riječima za aplikacije koje prikazuju samo njih.
- **Reakcije, odgovori, izmjene i brisanje:** zadržite prst na poruci da otvorite njen meni: izaberite reakciju na vrhu,
  **Odgovori** da joj odgovorite, **Kopiraj** za njene riječi, a na svojoj poruci **Uredi** ili **Obriši**. Odgovor
  iznad svojih riječi prikazuje poruku na koju odgovara, a dodir na to vodi do poruke. Reakcije se vide ispod poruke;
  dodirnite jednu da reagirate isto, ili svoju da je povučete. Nisu šifrovane, kako ih šalje Element, ni u šifrovanom
  razgovoru: Matrix server vidi koja je poruka dobila koju reakciju i od koga. Samo vi možete mijenjati svoje poruke, a
  izmijenjena piše **Uređeno**. **Obriši** povlači vašu poruku za sve u razgovoru, kad potvrdite; ne može se poništiti,
  a razgovor zadržava red koji kaže da je obrisana.
- **Više poruka:** **Odaberi**, u meniju poruke, bira je, a dodir dodaje druge; zatim **Kopiraj**, **Proslijedi** ili
  **Obriši**. **Obriši** ih povlači za sve u razgovoru, nakon što potvrdite: vaše i, gdje vaš nivo dopušta, tuđe. Ne
  može se poništiti.
- **Ovaj telefon ili svi:** **Obriši**, za jednu poruku ili više, prvo pita: **Ovaj telefon** ih briše samo ovdje, i
  ostaju skrivene ako ponovo stignu; **Za sve** ih povlači kako je gore rečeno, a nudi se samo kad se svaka može
  povući.
- **Piše:** ko sada piše u razgovoru, kako kaže Matrix server, vidi se ispod s **piše…**. Erevos to kaže za vas samo
  ako uključite **Reci kad pišem** na ekranu Matrix; isprva je isključeno, jer ide preko Matrix servera nešifrirano,
  pa server saznaje svaki put kad pišete.
- **Na mreži:** u razgovoru s jednom osobom ispod njenog imena piše **Na mreži**, **Odsutan** ili **Ne ometaj**, s
  riječima koje je postavila, ili kad je posljednji put bila na mreži, kako kaže njen Matrix server, a njena slika na
  popisu razgovora ima zelenu tačku dok je na mreži. Neki serveri to ne kažu. Erevos to kaže za vas samo ako uključite
  **Reci kad sam na mreži** na ekranu Matrix; isprva je isključeno, jer ide preko Matrix servera nešifrirano.
- **Oznake:** vaše poruke prikazuju **✓** kad ih je preuzeo Matrix server, a **✓✓✓** kad su ih pročitali svi ostali
  članovi razgovora, kako to Matrix aplikacija svakog od njih javlja njegovom serveru (potvrde o čitanju). Matrix nema
  oznaku za poruku koja je stigla na telefon, pa nema ni **✓✓**. Zadržite prst na svojoj poruci i izaberite **Ko je
  pročitao** da vidite ko ju je pročitao i kada, i ko nije (prvih 100). Matrix aplikacija može biti podešena da ne
  šalje potvrde o čitanju: njen član se tada prikazuje kao da nije pročitao.
- **Profilne slike:** Matrix soba, ili osoba u razgovoru s jednom osobom, prikazuje svoju sliku na popisu razgovora, a
  tako i XMPP kontakt. **Odaberi fotografiju**, na ekranu Matrix, postavlja vašu za vaše kontakte; **Ukloni** je
  uklanja. Slike nisu šifrirane ni u jednoj Matrix ili XMPP aplikaciji: server ih vidi, a vaši kontakti vide vašu.
- **Ranije poruke:** razgovor s više historije na Matrix serveru gore prikazuje **Učitaj ranije poruke**; svaki dodir
  donosi još, a razgovor ostaje tamo gdje ste čitali. Poruka čiji ključ još nije stigao prikazuje se zaključana.
- **Glasovne poruke:** zadržite prst na mikrofonu ispod polja za poruku da snimate, i pustite da pošaljete; prevucite
  ulijevo prije nego što pustite da odbacite snimak. Minut je najviše, a pritisak kraći od sekunde ne šalje ništa. S
  TalkBackom ga dodirnite jednom da počnete, a ponovo da pošaljete. U šifrovanom razgovoru šifruje se kao fotografija, a
  Element i druge Matrix aplikacije puštaju je kao glasovnu poruku. Onu koja stigne pušta **Pusti**, a preuzima se tek
  kad je pustite. Njen talasni oblik ide s njom, kako ga Element crta, a ona koja stigne s talasnim oblikom prikazuje ga
  ispod **Pusti**, obojen dok se pušta.
- **Provjera emojijima:** u razgovoru s jednom osobom, **Provjera emojijima** vama oboma pokazuje sedam slika; ako su
  iste, istim redom, dodirnite **Podudaraju se** na oba telefona. Tada niko ne može neprimjetno biti u sredini, a
  razgovor piše **Provjereno emojijima**. **Provjerite ovaj uređaj drugim svojim**, na Matrix ekranu, radi isto s
  vašim Elementom, da vjeruje uređaju Erevosa. Element može pokrenuti i jedno i drugo.
- **Provjera QR kodom:** kad su obje strane prihvatile provjeru, a obje aplikacije to mogu, kartica pokazuje kod i
  **Fotografiši njihov kod**. Neka druga aplikacija fotografiše kod koji se vidi ovdje (u Elementu: **Skeniraj**), pa
  odgovorite **Da, kaže** kad kaže da je provjera uspjela; ili fotografišite kod koji pokazuje njihova aplikacija.
  **Uporedi emoji umjesto toga** ide drugim putem. Kod sadrži ključeve dva računa (ili uređaja) i jednokratnu tajnu,
  pa kod nekoga između ne odgovara. Ništa se ne smatra pouzdanim dok obje strane ne kažu da su gotove.
- **Sigurnosni ključ:** pod **Sigurnosni ključ** na Matrix ekranu upišite sigurnosni ključ (ili frazu) koji je
  napravio Element: ranije poruke se otvaraju iz rezervne kopije ključeva računa, novi ključevi idu u nju, a vaši
  drugi uređaji vjeruju ovom. Račun bez njega ovdje može **Napravite sigurnosni ključ**; zapišite ga, jer ga Erevos
  ne čuva.
- **Pozivi:** dvije pločice na vrhu razgovora zovu glasom ili videom, preko Element Calla, aplikacije za pozive
  Elementa i Elementa X, koju Erevos nosi u sebi i prikazuje preko aplikacije, u svom prozoru: na Androidu, u
  web-aplikaciji i na računaru (Windows, macOS i Linux). Strelica nazad u njemu, ili tipka Esc, smanjuje prozor u ugao
  preko Erevosa, pa možete dalje koristiti Erevos tokom poziva; dodir na mali prozor vraća ga na punu veličinu. Dok
  poziv nije počeo, dugme **Zatvori** ispod njega ga prekida, za slučaj da nikad ne počne. Pozivi vama ovdje zvone kao
  Erevosovi vlastiti, dok je ovaj prostor otvoren: **Javi se** otvara Element Call u pozivu, **Odbij** to javlja onome
  ko zove. Zvuk i slika su šifrovani s kraja na kraj, ključevima koje imaju samo oni u pozivu, i idu preko medijskog
  servera (LiveKit) koji navodi vaš Matrix server, a on vidi adresu ovog uređaja; Matrix server bez njega ne može
  zvati. Ono što Element Call kaže Matrix serveru ide preko Erevosa, i preko Tora kao ostatak Matrixa, ali sam poziv
  nikad ne ide preko Tora. Element Call ne dopire ni do jednog trackera. Stariji Matrix pozivi udvoje, kakve pravi FluffyChat, ovdje takođe zvone (vidi **Stariji poziv**). Dok je Matrix poziv u toku ili zvoni, drugi poziv, Erevosov vlastiti ili na XMPP-u, ne
  zvoni i prikazuje se kao propušten, i obrnuto. Na Androidu, Nazad ili napuštanje Erevosa smanjuje prozor poziva
  iznad drugih aplikacija (slika u slici). Sailfish OS nema Matrix pozive.
- **U web-aplikaciji i na računaru:** preglednik ili računar jednom pita za kameru i mikrofon; na računaru samo prozor
  poziva može koristiti kameru. Kuda ide zvuk i koji se mikrofon koristi, odlučuje računar ili preglednik. U
  web-aplikaciji Element Call dolazi s druge, vlastite adrese, erevos-call.lphl.nekten.eu, a na računaru iz odvojenog
  dijela aplikacije, pa ne može pročitati ništa od Erevosa: ni njegove ključeve, ni njegove razgovore.
  Web-aplikacija provjerava datoteke Element Calla prema istom potpisanom izdanju kao i sama aplikacija prije nego ga
  pokrene, pa prvi poziv u web-aplikaciji traje malo duže, dok preuzima i provjerava Element Call.
  **Zašto:** kod Element Calla ne piše Erevos, pa radi odvojeno od Erevosa, gdje nikad ne može doći blizu njegovih
  ključeva i razgovora.
- **Obavijesti:** poruka koja stigne prikazuje obavijest i broji se u broju na ikoni Erevosa, kao u Erevosovim vlastitim
  razgovorima, dok je ovaj prostor otvoren; na računaru, dok Erevos radi. Na Androidu, **Obavijesti** na dnu razgovora
  ga utišavaju ili mu daju vlastiti zvuk; utišani razgovor se ne broji. **Izgled razgovora** pored njih daje razgovoru
  vlastiti izgled.
- **Dok je ovaj prostor zatvoren:** na Androidu, **Javi da je stigla poruka** pod **Dok je ovaj prostor zatvoren** na
  ekranu Matrixa pušta ovaj prostor da kaže „Nova poruka“ kad nešto stigne na Matrixu dok je otvoren drugi prostor,
  kao što to rade njegovi razgovori s **I dok je otvoren drugi prostor** pod **Postavke** → **Obavijesti** → **U
  pozadini**, što je također potrebno. Nikad ne kaže šta, od koga ni u kojem razgovoru, a poziv tada ne zvoni: samo
  ključ prostora otvara ono što je stiglo. Za to Matrix server javlja relayu ovog prostora svaku poruku, bez ijedne
  njene riječi, pa Matrix server saznaje adresu relaya, a relay kad stižu poruke. Isključeno dok ga ne uključite;
  treba relay ažuriran za to, do kojeg Matrix server može doći.
- **Niti:** zadržite poruku i izaberite **Odgovori u niti** da odgovorite u niti. Nit se otvara na zasebnom ekranu, a
  poruka s odgovorima kaže koliko ih ima; dodirnite je da otvorite nit. Aplikacije bez niti prikazuju odgovore kao
  obične odgovore.
- **Ankete:** **Anketa**, ispod polja za poruku, postavlja pitanje s više opcija. Dodirnite opciju u oblačiću da je
  izaberete, a ponovo da je povučete; svi vide ko je šta izabrao. Ko je napravio anketu može je zadržati i izabrati
  **Završi anketu**: poslije toga nijedan glas ne važi.
- **Lokacije:** **Lokacija** šalje gdje ste, jednom, kao Element; ide šifrovana kao razgovor i prikazuje se s **Otvori
  u kartama** na Androidu.
- **Pregledi linkova:** kad su **Pregledi linkova** uključeni, kao za razgovore s kontaktima, prvi link u poruci ide s
  pregledom koji je napravio vaš telefon, u šifrovanom razgovoru takođe šifrovan. Preko Tora samo s uključenim **Preko Tora** u **Pregledima linkova**, i nikad na skrivenom mjestu.
- **Prikvačivanje i proslijeđivanje:** **Prikvači**, u meniju poruke, prikvači je na vrh sobe za sve, ako soba
  dozvoljava; traka iznad razgovora prikazuje posljednju prikvačenu poruku, dodir ide do nje a zatim prikazuje
  sljedeću. **Otkvači** je skida. **Proslijedi** šalje kopiju u drugi razgovor ovog računa; kopija s originalom ne
  dijeli ništa. Razgovor koji nije šifrovan to kaže pored imena, jer njegov server čita kopiju poslanu tamo.
- **Pronalaženje grupa:** **Pronađi grupu**, na Matrix ekranu, pretražuje javne sobe vašeg Matrix servera, ili drugog
  koji upišete, a on tada saznaje šta tražite. **Prostori** navode sobe u prostorima u kojima ste, da im se
  pridružite. **Pretraži poruke** traži samo među porukama sačuvanim na ovom telefonu i nikoga ne pita.
- **Omiljeni:** zadržite razgovor na listi za **Učini omiljenim** (ide prvi), **Nizak prioritet** (ide posljednji) i
  **Napusti i zaboravi**, što i Matrix server natjera da ga zaboravi, pa ga vaše druge Matrix aplikacije više ne
  prikazuju. Čuvaju se u vašem računu, pa vaše druge Matrix aplikacije sortiraju isto.
- **Novi račun:** na ekranu prijave, **Napravi novi račun** pravi ga na Matrix serveru koji to dozvoljava, iz servera,
  imena i lozinke. Ako server traži, Erevos traži da prihvatite njegove uslove, da date token za registraciju ili da
  uradite korak na stranici samog servera, poput captche, koja se otvara u pregledniku, ne preko Tora. Server koji
  traži e-mail adresu pravi račune samo na svojoj web stranici; napravite ga tamo, pa se prijavite ovdje.
- **Uređaji:** **Uređaji**, na Matrix ekranu, navode uređaje računa s vremenom kad je svaki posljednji put viđen.
  **Preimenuj** daje jednom novo ime. **Odjavi ostale uređaje** ih skida s računa: gube ključeve i više ne mogu čitati
  ono što stiže. Matrix server prvo traži vašu lozinku.
- **Stariji pozivi:** u razgovoru s jednom osobom pločice za poziv pitaju **Element Call** ili **Stariji poziv**.
  Stariji poziv radi s FluffyChatom, Nhekom i Elementom na računaru, i zvoni ovdje kad zovu. Njegovi signali idu kao
  razgovor, šifrovani u šifrovanom razgovoru, preko vašeg releja kad ga prostor ima, inače preko releja za pozive
  vašeg Matrix servera; sam poziv je šifrovan (DTLS-SRTP).

**Zašto:** Erevosovi vlastiti razgovori skrivaju ko s kim razgovara; Matrix server to ne može. Zato su Matrix
razgovori odvojeni i označeni, za ljude do kojih biste inače došli samo preko Matrixa.

- **Šta poruka nosi:** oznake za izgled riječi, kao podebljano i skrivene riječi, prikazuju se kao u Erevos razgovoru
  (pogledajte [Razgovor preko relaya](#relay)) i idu s porukom, pa ih i Element prikazuje. Od onoga što šalje druga
  aplikacija prikazuju se samo podebljano, kurziv, precrtano, kod i skrivene riječi: ništa se u tome ne pokreće,
  nijedna slika se ne preuzima, a link pokazuje kamo zaista vodi. Web adrese se mogu dodirnuti, a Erevos pita prije
  nego što otvori neku. Pored **Fotografija** i **Datoteka** su **Kamera**, **Video**, **Kartica kontakta** i
  **Kvalitet fotografije**: kartica kontakta ide kao .vcf datoteka koju otvara svaka aplikacija, a ona koja stigne
  prikazuje se kao kartica čim dodirnete **Prikaži**, s **Dodaj u kontakte**; video ide bez dijelova koji govore gdje
  je snimljen ili kojim telefonom. Poruka koju proslijedite označena je kao **Proslijeđeno** samo na vašem telefonu,
  pa drugi nikad ne saznaju odakle je došla.
- **Prikvačene, na kraju i imenovane:** prikvačivanje sobe čini je vašom omiljenom na Matrixu, pa je i vaše druge
  Matrix aplikacije prikazuju prikvačenom, a sobe niskog prioriteta dolaze na kraj. Na popisu početnog ekrana vaša
  posljednja poruka pokazuje ✓✓✓ čim je svi u sobi pročitaju. **Imenujte ih ovdje** (osoba) ili **Imenujte ga ovdje**
  (grupa), na dnu razgovora, daje sobi vaše ime, samo na ovom telefonu; nikome se ne javlja.
- **Nacrti:** ono što upišete, a ne pošaljete, ostaje kao nacrt razgovora, šifrovano samo na ovom telefonu. Vraća se
  kad ponovo otvorite razgovor, i nakon što se Erevos zatvorio, a popis početnog ekrana ga pokazuje u redu razgovora
  kao **Nacrt**. Matrix nit nema svoj nacrt.
- **Pošalji kasnije:** zadržite **Pošalji**, izaberite vrijeme (**Za 1 sat**, **Večeras u 20:00**, **Sutra u 09:00**
  ili bilo koji dan i vrijeme) i dodirnite **Pošalji kasnije**. Poruka čeka na ovom telefonu, šifrovana, isprekidano
  nakon poruka razgovora s njenim vremenom, i odlazi s ovog telefona u to vrijeme dok je Erevos otključan, na Androidu
  i u pozadini; inače čim se ponovo otključa. Samo tekst. Dodirnite je da je pošaljete odmah ili obrišete. U skrivenim
  razgovorima odlazi samo dok su otvoreni, osim ako primaju i zatvoreni. Poruka koju je vratila vraćena sigurnosna
  kopija, a čije je vrijeme bilo prije vraćanja, ne odlazi sama: telefon s kojeg je kopija došla možda ju je već
  poslao.
- **Pošalji ponovo:** vaša poruka koja pokazuje **Nije poslano** ima u svom meniju **Pošalji ponovo** i **Obriši**.
- **Podsjeti me:** meni poruke ima **Podsjeti me**. Izaberite vrijeme: poruka, s imenom svog razgovora, ide u
  **Razgovor sa sobom** i tada vas podsjeti. Potrebno je da je **Erevos** uključen u [Moduli](#modules).
- **Poruke koje nestaju:** **Poruke koje nestaju**, ispod polja za poruku, postavlja vrijeme za nove poruke, poslane
  ili primljene: 5 minuta, 1 sat, 1 dan ili 1 sedmicu nakon što je svaka poslana. Tada odlaze s ovog telefona, a vaše
  se povlače i za sve u razgovoru (njihove aplikacije ih prikazuju kao obrisane), ili čim Erevos ponovo radi. Ono što
  su drugi poslali ostaje kod njih. **Nestajanje**, pored **Anketa** i **Lokacija**, to radi samo za sljedeću poruku.
  Poruke koje su već u razgovoru ostaju.
- **Blokiranje:** **Blokiraj**, u razgovoru s jednom osobom, dodaje je na popis ignorisanih vašeg računa: ništa njeno
  ne stiže do vašeg Matrix računa, ni u jednoj od njegovih aplikacija, i ne javlja joj se. **Blokirani kontakti**, na
  Matrix ekranu, navodi ih, s **Odblokiraj**.

## XMPP {#xmpp}

U **Postavke** → **Relay i mreže** → **XMPP**, prostor se može prijaviti na XMPP račun, za razgovor s ljudima koji
koriste Conversations, Monal, Gajim, Dino ili drugu XMPP aplikaciju. Erevos sam razgovara s XMPP serverom, kao te
aplikacije: nikakav most nije između.

- **Prijava:** vaša XMPP adresa, kao name@example.org, i njena lozinka. Erevos nalazi server iz adrese; **Server**
  treba samo kad ga ne nađe (ime, ime:port ili wss:// adresa). Erevos postaje novi uređaj računa. Prijava i ključevi
  uređaja čuvaju se šifrovani u ovom prostoru, i nalaze se u rezervnim kopijama: nakon vraćanja račun nastavlja kao novi
  uređaj. Njegovi skriveni razgovori mogu imati vlastiti XMPP račun, pogledajte [Skriveni razgovori](#hidden).
- **Razgovori:** **Novi razgovor** dodaje adresu u vaše kontakte, traži od osobe da vam dopusti da vidite kada je na
  mreži, kao što rade druge XMPP aplikacije, i otvara razgovor. Ko traži da vas doda, stoji na vrhu liste i na XMPP
  ekranu, s **Prihvati** i **Odbij**. Kontakti koje račun već ima su pod **Kontakti**.
- **Šifrovanje:** poruke su šifrovane OMEMO-om, za svaki njihov uređaj i za druge uređaje vašeg računa, koji čitaju
  zajedno: s OMEMO 2 za uređaj čija aplikacija to ima, kao Kaidan, a s verzijom 0.3, koju govore Conversations, Monal,
  Gajim i Dino, za ostale. To je Erevosov vlastiti kod, nerevidiran, provjeren prema drugim OMEMO bibliotekama. Ako
  njihove aplikacije nemaju OMEMO, Erevos to kaže i piše samo kad za taj razgovor izaberete **Piši bez šifrovanja**;
  **Ponovo šifriraj** vraća nazad.
- **Njihovi ključevi:** na dnu razgovora su otisci njihovih uređaja. Uporedite ih s onim što pokazuje njihova
  aplikacija, na drugi način, a ne u razgovoru. Ključ koji se promijenio otkad je prvi put viđen to kaže. Ključ ovog
  uređaja je na XMPP ekranu, dvaput: onako kako ga pokazuju aplikacije s OMEMO 0.3 i onako kako ga pokazuje Kaidan.
  Jedan uređaj ima jedan ključ u oba, napisan na dva načina.
- **Oznake:** jedna kvačica pri slanju, dvije kad ga njihova aplikacija ima, tri kad pročitaju, kao u Erevosovim
  vlastitim razgovorima, za aplikacije koje šalju te oznake.
- **Odgovori, uredi, reaguj, obriši:** zadržite prst na poruci za njen meni: **Odgovori** odgovara na nju, **Uredi**
  mijenja riječi vaše poruke, **Obriši** povlači vašu poruku za sve u razgovoru, a emotikoni reaguju na nju; dodir na
  reakciju ispod poruke reaguje isto, ili povlači vašu. Rade s aplikacijama koje rade isto, kao što rade
  Conversations, Dino, Gajim, Monal i Kaidan; druge aplikacije prikazuju odgovor s citatom onoga na što odgovara, a
  izmjenu kao novu poruku. Riječi odgovora i izmjene šifrovane su kao razgovor, ali na koju poruku se odnosi odgovor,
  izmjena, reakcija ili brisanje, i emotikon reakcije, idu onako kako ih te aplikacije šalju, nešifrovano, pa ih XMPP
  serveri vide. U grupi se na poruku može odgovoriti, reagovati ili je obrisati kad je grupa vrati. Dodir na citat
  odgovora vodi na poruku na koju odgovara. **Proslijedi** šalje jednu ili više poruka u drugi XMPP razgovor. **Prikvači
  samo za mene** drži poruku na vrhu razgovora, samo na ovom telefonu. **Odaberi** bira više poruka za kopiranje,
  prosljeđivanje ili brisanje; **Obriši** tamo povlači samo vaše.
- **Ovaj telefon ili svi:** **Obriši**, za jednu poruku ili više, prvo pita: **Ovaj telefon** ih briše samo ovdje, i
  ostaju skrivene ako ponovo stignu; **Za sve** ih povlači kako je gore rečeno, a nudi se samo kad se svaka može
  povući.
- **Pisanje:** kad aplikacija druge osobe javi da piše, **piše…** se prikaže ispod razgovora. Erevos to javlja o vama
  samo ako uključite **Reci kad pišem** na ekranu XMPP, i samo kontaktu koji vidi vašu prisutnost, nikad u grupi;
  isprva je isključeno, jer ide preko XMPP servera nešifrirano, pa server saznaje svaki put kad pišete.
- **Na mreži:** ispod imena kontakta piše **Na mreži**, **Odsutan** ili **Ne ometaj**, s riječima koje je postavio,
  ili kad je posljednji put bio na mreži, kako kažu njegove aplikacije, a njegova slika na popisu razgovora ima zelenu
  tačku dok je na mreži; samo za kontakt koji vam dopušta da vidite njegovu prisutnost. Kao u svakoj XMPP aplikaciji,
  kontakti koji vide vašu prisutnost vide kad je Erevos povezan; ide preko XMPP servera nešifrirano.
- **Profilne slike:** Matrix soba, ili osoba u razgovoru s jednom osobom, prikazuje svoju sliku na popisu razgovora, a
  tako i XMPP kontakt. **Odaberi fotografiju**, na ekranu XMPP, postavlja vašu za vaše kontakte; **Ukloni** je
  uklanja. Slike nisu šifrirane ni u jednoj Matrix ili XMPP aplikaciji: server ih vidi, a vaši kontakti vide vašu.
- **Blokiranje:** **Blokiraj**, na dnu razgovora, sprečava da poruke, pozivi i zahtjevi te osobe stignu na vaš XMPP
  račun, u bilo kojoj njegovoj aplikaciji, kako to radi XMPP server (XEP-0191); ona za to ne saznaje. **Odblokiraj**
  je ponovo propušta. Ko je blokiran u drugoj aplikaciji računa, blokiran je i ovdje.
- **Poruke od prije:** ono što je stiglo dok je Erevos bio zatvoren preuzima se iz arhive servera pri povezivanju, ako
  je server čuva. Poruka poslana prije nego što se ovaj uređaj prijavio, ili nije bila za njega, prikazuje se
  zaključana.
- **Fotografije i datoteke:** **Fotografija** i **Datoteka**, ispod polja za poruku, šalju jednu do 50 MB, ili manje
  ako vaš XMPP server prima manje, preko slanja datoteka servera. U šifrovanom razgovoru prvo se šifruje na ovom
  telefonu, ključem napravljenim samo za nju, a ključ ide u poruci, šifrovan OMEMO-om, pa server čuva samo ono što ne
  može pročitati; Conversations, Monal, Gajim i Dino je otvaraju. U razgovoru pisanom bez šifrovanja datoteka ide
  kakva jeste. Fotografija, zvuk ili datoteka koja stigne preuzima se tek kad dodirnete **Prikaži fotografiju**,
  **Pusti** ili **Sačuvaj**. Na Androidu, datoteke idu preko Tora kao i razgovor.
  Dodirnite prikazanu fotografiju da je vidite preko cijelog ekrana, kao u razgovoru s kontaktom: dva prsta ili
  dvostruki dodir je uvećavaju, okreće se s telefonom, a **Sačuvaj** je čuva (pogledajte Fotografije i datoteke, pod
  [Razgovor preko relaya](#relay)).
- **Naljepnice:** **Naljepnica** šalje vaše naljepnice napravljene od fotografija (**Moje**) kao fotografije, šifrirane
  kao i razgovor; druge XMPP aplikacije ih prikazuju kao fotografije. Tu su i ugrađeni kompleti: svaka naljepnica ide
  kao njena slika, napravljena na vašem uređaju. Paket naljepnica koji pošalje druga aplikacija (XEP-0449) ne preuzima
  se: prikazuje svoje riječi.
- **Glasovne poruke:** zadržite prst na mikrofonu ispod polja za poruku da snimate, i pustite da pošaljete, kao u
  Matrix razgovoru. Ide kao zvučna datoteka, šifrovana kao razgovor, kako je šalje Conversations. Glasovna poruka iz
  Conversationsa ili druge XMPP aplikacije (datoteka .m4a ili .ogg) takođe se prikazuje kao glasovna poruka, s **Pusti**
  i svojim trajanjem.
- **Grupe:** **privatna grupa** je samo za svoje članove, i svaki vidi ko su ostali. Svaka poruka u njoj šifrovana je
  OMEMO-om za uređaje svakog člana, kao u privatnim grupama Conversationsa, pa je XMPP serveri ne mogu čitati; ono što je
  napisano prije vašeg ulaska prikazuje se zaključano. **Kanal** je svaka druga grupa: nije šifrovan, pa ga svi u njemu,
  i serveri, mogu čitati, a njegov ekran to kaže. Na XMPP ekranu **Nova grupa** pravi privatnu grupu na vašem XMPP
  serveru od imena i kontakata koje izaberete, a **Pridruži se grupi** ulazi u jednu preko njene adrese, kao
  ime@conference.example.org, s njenom lozinkom ako je traži. Ispod privatne grupe **Članovi** nabraja njene ljude s
  njihovim ključevima, za poređenje kao u razgovoru, i bilježi svakoga ko nema OMEMO ključeve i ne može čitati
  šifrovano; njen administrator može **Dodaj ljude**. Kontakt koji vas pozove u grupu prikazuje se pod **Pozivi u
  grupe**, s **Pridruži se** i **Odbij**; poziv bilo koga drugog se ne prikazuje. Vaše grupe prate ostale XMPP
  aplikacije vašeg računa preko njegovih zabilješki: grupa kojoj se tamo pridružite pridružena je i ovdje, a **Napusti
  grupu** je napušta i tamo. Kanal javlja samo za poruke koje vas spominju. U grupi se **vlasnik** i **admin** prikazuju
  pored članova koji to jesu, a **Opis** grupe prikazuje se ispod njene teme.
- **Upravljanje grupom:** admini grupe vide **Upravljanje grupom** na njenom ekranu. Oni postavljaju **Temu**; vlasnik
  je može i **preimenovati**. U privatnoj grupi svaki član ima **Ukloni** (poruke grupe više ne idu toj osobi, a admin
  je može ponovo dodati) i **Zabrani** (ne može ući dok admin ne dopusti); vlasnik može člana **postaviti za admina**
  ili ga **ukloniti kao admina**. U kanalu **Upravljanje grupom** navodi ko je unutra, svakoga s **Ukloni**. Admini ne
  mogu ukloniti druge admine; samo vlasnik. Vlasnik postavlja i **Opis** grupe; neki serveri ga ne dopuštaju, i Erevos
  to kaže.
- **Pozivi:** dvije pločice na vrhu razgovora zovu osobu, glasom ili videom, na istom ekranu poziva kao Erevosovi
  vlastiti pozivi, a njeni pozivi ovdje zvone isto tako, dok je ovaj prostor otvoren; poziv od nekoga ko nije u vašim
  kontaktima prikazuje se samo kao propušten. Radi s aplikacijama koje zovu kao Conversations (Jingle, sa zvonjenjem
  XEP-0353). Sam poziv je šifrovan (DTLS-SRTP), ali otisak njegovog ključa ide preko XMPP servera takav kakav je, bez
  šifrovanja s kraja na kraj, pa bi se ti serveri mogli postaviti između. Ide preko relaya za pozive ovog prostora kad
  postoji, inače preko TURN servera XMPP servera, i samo preko njega, pa druga osoba ne saznaje vašu adresu; bez ijednog
  od njih ide direktno, i saznaje je. Poziv nikad ne ide preko Tora: relay za pozive ili TURN server vidi adresu ovog
  telefona.
  U glasovnom pozivu svako od vas može uključiti video: **Dodaj video**, na ekranu poziva, uključuje vašu kameru i prvo
  pita drugu osobu, koja bira **Ne sada** ili **Uključi video**. Video počinje samo ako ona kaže da, a ne ostavlja poziv
  kakav je bio. Radi s aplikacijama koje dodaju video pozivu kao Conversations.
- **Grupni pozivi:** u privatnoj grupi u kojoj ste, dvije pločice na vrhu pokreću glasovni poziv ili videopoziv u grupi,
  a poziv pokrenut u jednoj od vaših grupa zvoni ovdje, dok je ovaj prostor otvoren. Dok u grupi traje poziv, to kažu
  pločica na vrhu i red ispod njenog imena, a dodir na bilo koje od to dvoje pridružuje vas pozivu, dok ne ode njegova
  posljednja osoba. Radi s aplikacijom Dino, koja u grupama zove na isti način (MUJI): svaki poziv ima vlastitu sobu na
  servisu za grupe, kojoj se mogu pridružiti samo članovi grupe, a svaki telefon u pozivu povezuje se direktno sa svakim
  drugim, kao u Erevosovim vlastitim grupnim pozivima, preko relaya za pozive ovog prostora ili TURN servera XMPP
  servera, najviše osam osoba. Kao u pozivu s jednom osobom, poziv je šifrovan (DTLS-SRTP), ali otisci njegovih
  ključeva, i pozivnice, idu preko XMPP servera takvi kakvi jesu, a servis za grupe vidi ko je u pozivu i kada. Vlastiti
  XMPP račun skrivenih razgovora zove u svojim grupama na isti način, dok su skriveni razgovori otvoreni; dok su
  zatvoreni, uz uključeno **Primanje dok su zatvoreni**, poziv koji stigne u jednoj od njegovih grupa prikazuje se kao
  propušten.
- **Nije anonimno:** XMPP server vidi vaš račun, vaše kontakte, ko s kim razgovara i kada, i, bez Tora, odakle. Server
  druge osobe vidi isto o svojim razgovorima s vama.
- **Preko Tora:** na Androidu, XMPP ekran, i onaj prije prijave, bira Tor računa: **Isključeno** (zadano: direktno, i
  server vidi vašu adresu), **Kao prostor** (kako kaže izbor ovog prostora pod **Postavke** → **Relay i mreže** →
  **Tor**: s **Poruke** preko Tora čim je Tor spreman, fajlovi direktno; sa **Sve** samo preko Tora, i fajlovi; s
  **Ništa** direktno) ili **Uvijek preko Tora** (samo preko Tora, šta god prostor radio, i pri prijavi, i ništa ne ide
  dok se Tor ne može povezati). Njegova veza, traženje njegovog servera i njegovi fajlovi prate izbor; Tor koristi
  mostove prostora. Pozivi nikad ne idu preko Tora, i ne pravi se pregled linkova dok račun ne smije ići direktno. Gdje
  Erevos ne može otvoriti svoju vezu (web aplikacija, računar), koristi WebSocket servera, direktno, a server bez njega
  nije dostupan.
- **Razgovor preko Tora:** **Preko Tora** ispod razgovora ili grupe, isključeno dok ga ne uključite, šalje ga samo preko
  Tora. Jedna veza sa serverom nosi sve razgovore računa, pa dok ga ijedan razgovor ima uključenog, cijeli račun ide samo
  preko Tora, šta god mu je izabrano, i XMPP ekran to kaže.
- **Obavijesti:** poruka koja stigne prikazuje obavijest i broji se u broju na ikoni Erevosa, kao u Erevosovim vlastitim
  razgovorima, dok je ovaj prostor otvoren; na računaru, dok Erevos radi. Na Androidu, **Obavijesti** na dnu razgovora
  ga utišavaju ili mu daju vlastiti zvuk; utišani razgovor se ne broji. **Izgled razgovora** pored njih daje razgovoru
  vlastiti izgled.
- **Dok je ovaj prostor zatvoren:** na Androidu, **Javi da je stigla poruka** pod **Dok je ovaj prostor zatvoren** na
  ekranu XMPP-a pušta ovaj prostor da kaže „Nova poruka“ kad nešto stigne na XMPP-u dok je otvoren drugi prostor, kao
  što to rade njegovi razgovori s **I dok je otvoren drugi prostor** pod **Postavke** → **Obavijesti** → **U
  pozadini**, što je također potrebno. Nikad ne kaže šta, od koga ni u kojem razgovoru, a poziv tada ne zvoni: samo
  ključ prostora otvara ono što je stiglo. Za to XMPP server javlja relayu ovog prostora svaku poruku dok nijedna
  aplikacija računa nije uključena, pa XMPP server saznaje ime relaya, a relay kad stižu poruke. Isključeno dok ga ne
  uključite; treba relay ažuriran za to, do kojeg XMPP serveri mogu doći (njegov vlasnik otvara port za njih), i XMPP
  server koji šalje obavijesti neaktivnim aplikacijama, kao većina.
- **Novi račun:** na ekranu prijave, **Napravi novi račun** pravi ga na XMPP serveru koji to dozvoljava (XEP-0077), iz
  adrese i lozinke. Server koji traži captchu, ili pravi račune samo na svojoj web stranici, to kaže i daje svoju
  stranicu ako je ima; napravite račun tamo, pa se prijavite ovdje.
- **Lozinka i brisanje:** **Račun**, na XMPP ekranu, ima **Promijeni lozinku** i **Obriši račun**, što briše račun sa
  servera zauvijek, poslije dva pitanja, drugo traži adresu. Erevos zaboravlja njegove ključeve; adresa se možda neće
  moći ponovo napraviti.
- **Pronalaženje grupa:** **Pronađi grupu** ima **Grupe na vašem serveru**, one koje server dozvoljava svima da nađu,
  i **Pretraži javne grupe**, što pita search.jabber.network: on saznaje riječi koje tražite i vidi ime vašeg servera,
  a vaš server ne. Javna grupa je kanal, nije šifrovana.
- **Lokacije:** **Lokacija** šalje gdje ste kao geo: link, kao Conversations, šifrovan kao razgovor; ona koja stigne
  tako prikazuje se kao lokacija, s **Otvori u kartama** na Androidu.
- **Pregledi linkova:** u razgovoru pisanom bez šifrovanja, kad su **Pregledi linkova** uključeni, prvi link ide sa
  svojim pregledom (XEP-0511), a pregled koji stigne tako prikazuje se ispod riječi. Šifrovani razgovor ne šalje
  nijedan, jer bi serverima rekao šta je link.

**Zašto:** Erevosovi vlastiti razgovori skrivaju ko s kim razgovara; XMPP server to ne može. Zato su XMPP razgovori
odvojeni i označeni, za ljude do kojih biste inače došli samo preko XMPP-a.

- **Šta poruka nosi:** oznake za izgled riječi i web adrese koje se mogu dodirnuti, kao u razgovoru na Matrixu, s
  **Kamera**, **Video**, **Kartica kontakta** i **Kvalitet fotografije** (pogledajte [Matrix](#matrix)). U grupi, kad
  upišete @, vidite njene članove, a dodir upisuje ime tog člana u grupu, kao što to radi Conversations.
- **Vaše ime za kontakt:** **Imenujte ih ovdje**, na dnu razgovora s kontaktom, čuva vaše ime za njega u vašim
  kontaktima na vašem XMPP serveru, pa ga prikazuju i vaše druge XMPP aplikacije. Kontakt to ne saznaje. Ostavite
  prazno da se ponovo prikaže njegova adresa.
- **Nacrti:** ono što upišete, a ne pošaljete, ostaje kao nacrt razgovora, šifrovano samo na ovom telefonu. Vraća se
  kad ponovo otvorite razgovor, i nakon što se Erevos zatvorio, a popis početnog ekrana ga pokazuje u redu razgovora
  kao **Nacrt**.
- **Pošalji kasnije:** zadržite **Pošalji**, izaberite vrijeme (**Za 1 sat**, **Večeras u 20:00**, **Sutra u 09:00**
  ili bilo koji dan i vrijeme) i dodirnite **Pošalji kasnije**. Poruka čeka na ovom telefonu, šifrovana, isprekidano
  nakon poruka razgovora s njenim vremenom, i odlazi s ovog telefona u to vrijeme dok je Erevos otključan, na Androidu
  i u pozadini; inače čim se ponovo otključa. Samo tekst. Dodirnite je da je pošaljete odmah ili obrišete. U skrivenim
  razgovorima odlazi samo dok su otvoreni, osim ako primaju i zatvoreni. Poruka koju je vratila vraćena sigurnosna
  kopija, a čije je vrijeme bilo prije vraćanja, ne odlazi sama: telefon s kojeg je kopija došla možda ju je već
  poslao.
- **Pošalji ponovo:** vaša poruka koja pokazuje **Nije poslano** ima u svom meniju **Pošalji ponovo** i **Obriši**.
- **Podsjeti me:** meni poruke ima **Podsjeti me**. Izaberite vrijeme: poruka, s imenom svog razgovora, ide u
  **Razgovor sa sobom** i tada vas podsjeti. Potrebno je da je **Erevos** uključen u [Moduli](#modules).
- **Poruke koje nestaju:** **Poruke koje nestaju**, ispod polja za poruku, briše nove poruke s ovog telefona toliko
  nakon slanja, a **Nestajanje** to radi samo za sljedeću poruku. Druga strana ih zadržava: XMPP nema načina da ih
  tamo obriše. Poruke koje su već ovdje ostaju.
- **Prikazuj me kao da nisam na mreži:** na dnu razgovora s jednom osobom, **Prikazuj me kao da nisam na mreži**
  pokazuje vas toj osobi kao da niste na mreži, šta god vaš račun pokazuje svima ostalima, i ne govori joj ništa o
  tome šta čitate ili pišete, niti da su njene poruke stigle. Zajednička grupa vas i dalje pokazuje. Vrijedi samo za
  vezu ovog telefona.
- **Provjera uživo:** ispod **Njihovi ključevi**, **Provjera uživo** pokazuje kod vaše adrese i ključeva, kao što to
  radi Conversations. Tamo fotografišite njihov: svaki njihov uređaj čiji se ključ poklapa označava se kao provjeren.
  Ključ koji se razlikuje ne označava ništa i kaže to: neko je možda između, ili su promijenili aplikaciju. Ništa se
  ne šalje.
- **Blokirani kontakti:** XMPP ekran navodi koga račun blokira, s **Odblokiraj**.

## Razgovori s drugim Nostr aplikacijama {#nostr-chats}

Pod **Postavke** → **Relay i mreže** → **Nostr razgovori**, prostor može imati vlastiti Nostr ključ, za razgovor u
četiri oka ili u grupama s ljudima koji koriste Damus, Amethyst, Primal, 0xchat ili drugu Nostr aplikaciju koja šalje
privatne poruke kako traži NIP-17. To nije [Preko Nostra](#nostr), koji prenosi Erevosove vlastite razgovore.

- **Ključ:** **Izradi Nostr ključ** izrađuje jedan za ovaj prostor; **Ili donesite ključ iz druge Nostr aplikacije**
  uzima nsec ključa koji već imate, i čita ono što njegovi relayi još čuvaju. Ključ i njegovi razgovori čuvaju se
  šifrirani u ovom prostoru, i nalaze se u rezervnim kopijama: nakon vraćanja ostaju onakvi kakvi su bili. Njegovi
  skriveni razgovori mogu imati vlastiti Nostr ključ, pogledajte [Skriveni razgovori](#hidden). **Prikaži tajni ključ
  (nsec)** ga prikazuje, da ga zapišete ili prenesete u drugu aplikaciju: tko ga ima čita ove razgovore i piše kao vi.
- **Vaš Nostr ključ:** dajte njegov npub ljudima koji vam trebaju pisati, s **Kopiraj** ili **Prikaži QR kod**. **Vaše
  ime**, ako ga date, javno je: druge Nostr aplikacije prikazuju ga umjesto vašeg npub-a. Tamo se mijenja samo
  ime: slika ili riječi koje je druga aplikacija vašeg ključa stavila u vaš profil ostaju.
- **Razgovori:** **Novi razgovor** uzima njihov npub (ili nprofile), s njihovog profila u njihovoj aplikaciji, ili ime
  kao ime@example.org (NIP-05). **Prikaži ljude koje pratite**, ispod toga, navodi ljude koje prati vaš Nostr ključ
  (njegov javni popis praćenih, tražen i na relayima koji prikupljaju takve popise te na relayima na kojima vaš ključ
  piše), s njihovim imenima: dodirnite jednu osobu da joj napišete. Kad nikoga ne nađe, kaže zašto, čiji je popis
  tražio i kako je svaki relay odgovorio. Ništa se ne učitava dok ne dodirnete, a profilne slike se ne učitavaju.
  Razgovori su i na popisu početnog ekrana, svaki označen s **Nostr**; dugme **Nostr** prikazuje samo njih, a tamo **Novi razgovor** otvara ovaj ekran. **Imenujte ih ovdje** daje razgovoru ime koje vidite samo vi.
- **Grupe:** **Nova grupa** pravi jednu od dvoje ili više ljudi s kojima razgovarate, najviše dvadeset, s imenom ako
  želite. Nostr grupe nemaju administratore: grupa su ljudi koje njezine poruke navode, svaka poruka ide svakome od
  njih, šifrirana za svakoga, i nikoga se kasnije ne može dodati ni ukloniti; grupa s drugim ljudima je nova grupa.
  **Dajte ime grupi** preimenuje je za sve, s vašom sljedećom porukom. Poruka koju druga aplikacija pošalje vama i
  drugima također se prikazuje kao grupa, svaka poruka s onim tko ju je napisao.
- **Fotografije i datoteke:** **Fotografija** i **Datoteka**, ispod polja za poruku u razgovoru, šalju jednu do 20 MB.
  Šifrira se na ovom telefonu ključem napravljenim samo za nju (AES-GCM, kako traži NIP-17) i stavlja na Blossom
  poslužitelj datoteka, koji čuva samo ono što ne može pročitati; njezin ključ ide u poruci, šifriran kao i poruke, a
  slanje potpisuje ključ napravljen samo za to, pa poslužitelj ne saznaje čija je. Na Androidu datoteke idu preko Tora
  kao i ovi razgovori. **Poslužitelji datoteka** kažu kamo idu, na prvi koji je primi: blossom.primal.net, blossom.band
  i nostr.download, ako ih ne promijenite. Fotografija ili datoteka koja stigne dohvaća se tek kad dodirnete **Prikaži
  fotografiju** ili **Sačuvaj**, i otvara se samo ako je ona koja je poslana.
  Dodirnite prikazanu fotografiju da je vidite preko cijelog ekrana, kao u razgovoru s kontaktom: dva prsta ili
  dvostruki dodir je uvećavaju, okreće se s telefonom, a **Sačuvaj** je čuva (pogledajte Fotografije i datoteke, pod
  [Razgovor preko relaya](#relay)).
- **Reakcije:** zadržite poruku da otvorite njen meni i reagirate s 👍, ❤️, 😂, 😮, 😢 ili 🙏, ili jednom od ostalih iza
  **+**; ispod se vide reakcije, posljednja od svake osobe, kako ih šalju druge Nostr aplikacije (NIP-25). Dodirnite
  reakciju ispod poruke da dodate istu, ili svoju da je povučete; aplikacije ostalih se mole da je uklone.
- **Odgovori:** **Odgovori**, u meniju poruke koju zadržite, odgovara na nju. Poruka se prikazuje iznad polja za poruku,
  s ✕ da je ostavite, a zatim iznad vašeg odgovora u razgovoru, gdje dodir vodi do nje. I druge Nostr aplikacije je
  prikazuju kao odgovor (NIP-17 je označava kao odgovor). I fotografija, datoteka ili glasovna poruka koju pošaljete dok
  se ona prikazuje odgovara na nju. **Kopiraj**, u istom meniju, uzima riječi poruke.
- **Glasovne poruke:** zadržite prst na mikrofonu ispod polja za poruku da snimate, i pustite da pošaljete; prevucite
  ulijevo prije nego što pustite da odbacite snimak. Minut je najviše, a pritisak kraći od sekunde ne šalje ništa. Ide
  kao datoteka: šifrovana na ovom telefonu i stavljena na poslužitelj datoteka, s trajanjem u poruci; hoće li je druga
  aplikacija puštati kao glasovnu poruku ili kao zvučnu datoteku, odlučuje ta aplikacija. Onu koja stigne s trajanjem
  pušta **Pusti**, a preuzima se tek kad je pustite.
- **Prikvači samo za mene:** drži poruku na vrhu razgovora, samo na ovom telefonu; niko drugi je ne vidi.
- **Odaberi:** bira više poruka za **Kopiraj**, za **Proslijedi** u drugi Nostr razgovor (fotografije i datoteke šalju
  se ponovo) ili za **Obriši**. Brisanje ih uklanja s ovog telefona i traži od aplikacija ostalih da obrišu i vaše:
  njihove aplikacije to mogu ali ne moraju učiniti.
- **Ovaj telefon ili svi:** **Obriši** prvo pita: **Ovaj telefon** ih briše samo ovdje, i ostaju skrivene ako ponovo
  stignu; **Za sve** takođe traži od aplikacija drugih da obrišu vaše (NIP-09), što one mogu ili ne moraju učiniti.
- **Naljepnice:** **Naljepnica** šalje vaše naljepnice napravljene od fotografija (**Moje**) kao fotografije, šifrirane:
  druge Nostr aplikacije ih prikazuju kao fotografije. Tu su i ugrađeni kompleti: svaka naljepnica ide kao njena slika,
  napravljena na vašem uređaju.
- **Šifrovanje:** svaka poruka šifrira se za drugu osobu i vi je potpisujete, a zatim je ponovo omata ključ izrađen samo
  za tu poruku, s vremenom pomaknutim unatrag do dva dana (NIP-17, s NIP-44 i NIP-59). Relayi vide kome je namijenjena,
  ne i tko ju je napisao, kada ni što piše. Kopija ide na vaše vlastite relaye, da vaše druge Nostr aplikacije s ovim
  ključem čitaju zajedno. To je Erevosov vlastiti kod, bez revizije, provjeren primjerom iz samog NIP-17 i prema
  nostr-tools.
- **Gdje stižu vaše poruke:** relayi na koje druge aplikacije šalju vaše poruke: relay.damus.io, nos.lol i
  relay.primal.net ako ih ne promijenite, najviše tri. Erevos ih javlja drugim aplikacijama (popis kind 10050) kad se
  promijene i jednom tjedno. Šalje na relaye koje navodi aplikacija druge osobe; aplikacija koja ne navodi nijedan još ne
  može primiti poruku, i Erevos to kaže. Ključ donesen iz druge aplikacije čita tamo gdje je ta aplikacija rekla da
  stižu vaše poruke (njen vlastiti popis kind 10050), osim ako ste ih ovdje promijenili, i taj popis ponovo javlja, pa
  obje aplikacije dobivaju iste poruke; te relaye čita od njihova početka, i jednom dohvaća ono što relayi navedeni u
  starijim popisima ključa još čuvaju.
- **Stare privatne poruke:** mnoge aplikacije još šalju i čuvaju privatne poruke na stariji način (NIP-04, kind 4);
  Damus i Primal su ih godinama prikazivali. Erevos ih čita i on, stare i nove, i prikazuje ih u istim razgovorima: na
  relayima na koje stižu vaše poruke i na najviše četiri druga relaya, onima koje čita druga aplikacija vašeg ključa
  (njen popis kind 10002, za ključ donesen iz druge aplikacije) te relay.damus.io, nos.lol i relay.primal.net. I te
  poruke su šifrirane, ali relayi vide tko je kome pisao i kada. Sam Erevos šalje samo na NIP-17 način.
- **Javne objave:** u razgovoru s jednom osobom, **Javne objave** prikazuju ono što ta osoba objavljuje za sve (kind 1)
  i objave drugih koje je ponovo podijelila, najnovije prvo, po trideset odjednom, a **Starije objave** donose još.
  Namijenjeno je samo čitanju: odavde se ne može odgovoriti, reagirati ni objavljivati. Traži se kad se otvori, na
  relayima koji služe za traženje i na onima na kojima, prema njenom popisu relaya (NIP-65), piše, onako kako određuje
  izbor Tora za ovaj prostor, i ništa se od toga ne čuva. Slike i linkovi se ne otvaraju: prikazuju se kao adrese, koje
  se mogu kopirati. Objava s upozorenjem o sadržaju prikazuje svoje riječi nakon dodira na **Prikaži**. Račun koji
  objavljuje samo za sve, poput računa nekog projekta, ne šalje privatne poruke: njegov razgovor ostaje prazan, a
  njegove su objave ovdje.
- **Javni feed:** na početnom ekranu dugme **Javno** prikazuje jedan feed s onim što ljudi koje prati vaš Nostr ključ
  objavljuju za sve, i onim što su ponovo podijelili, te s porukama javnih Matrix soba u kojima ste (soba kojima se može
  pridružiti bilo ko), najnovije prvo, kao u Amethystu: lice onoga ko je pisao, s malim **N** ili **M**, ime, kada,
  riječi, fotografije u objavi (jedna u punoj širini, dvije do četiri u mreži) i, za prvu vezu, kartica sa slikom,
  stranicom, naslovom i jednim redom. Kod Matrixa red ispod imena kaže sobu i njen server: dodirnite ga da se soba
  otvori. Dolaze i druge kad stignete do kraja, ili s **Starije objave**; povucite popis nadolje za najnovije (u
  pregledniku **Traži ponovo**). Praćenje ljudi i dalje se radi u drugoj Nostr aplikaciji s istim ključem. Vaš popis
  praćenih, gdje oni pišu (njihovi NIP-65 popisi) i njihove objave traže se samo dok se feed vidi, na relayima za
  traženje, na onima koji skupljaju popise i na onima na koje oni pišu, kako kaže izbor Tora ovog prostora; imena samo za
  objave koje se vide. Ništa se ne čuva.
  **Fotografije**, iznad feeda, jesu izbor koji važi za privatnost. Fotografija ili kartica veze dolazi sa servera na
  koji ju je stavio onaj ko je napisao objavu, a taj server vidi adresu s koje je donesena, preko Tora adresu izlaza
  Tora, i da ju je neko otvorio. **Uvijek** ih prikazuje odmah, preko Tora kad je Tor uključen u ovom prostoru; **Samo
  preko Tora** ih prikazuje samo kad je Tor uključen, a inače na dodir; **Na dodir** ne donosi nijednu prije nego je
  dodirnete. **Pregledi linkova** uključuju ili isključuju kartice. Ništa se ne donosi dok se feed ne vidi, fotografija
  se drži samo dok se vidi njena objava, i nijedna se ne čuva; ona koja ne stigne prikazuje **Prikaži fotografiju** za
  novi pokušaj. Donose se samo adrese na internetu, nikad adresa ovog telefona ili vaše kućne mreže.
  Ispod Nostr objave: **Odgovori** piše odgovor, **Podijeli ponovo** je pokazuje vašim pratiocima (prvo pita), srce je
  označava da vam se sviđa, a strelica dijeli vezu na nju. Njene tri tačke: **Kopiraj tekst**, **Javne objave** onoga ko
  ju je pisao, **Pošaljite poruku**, i **Povuci** za vlastitu objavu. Dodirnite objavu da se otvori s brojem onih kojima
  se svidjela i koji su je ponovo podijelili, te s odgovorima na nju. **Nova objava**, olovka, piše javnu objavu, s do
  četiri fotografije. Odgovori, ponovna dijeljenja, sviđanja i objave javni su i potpisani Nostr ključem prostora: svako
  ih može pročitati, i vidi se da su vaši; fotografija koju dodate stavlja se nešifrirana na server datoteka prostora,
  kako i treba kod javne objave. Ispod Matrix poruke: **Odgovori**, **Reaguj** (izbor od šest) i dijeljenje (veza
  matrix.to), a u njenim trima tačkama **Kopiraj tekst** i **Otvori sobu**. Uvijek je to ključ i račun ovog prostora,
  nikad vlastiti skrivenih razgovora.
- **Ankete:** u javnom feedu anketa se prikazuje sa svojim odgovorima, za **Glasajte** i, dok je otvorena, s
  **Rezultati**. **Nova objava** pa **Anketa** pravi jednu: do 10 odgovora, jedan ili više za izbor, otvorena 1, 3 ili 7
  dana. Glasovi su javni: svako može vidjeti šta ste izabrali. Vašu reakciju ispod objave povlačite ponovnim dodirom.
- **Vlastiti emoji:** u javnom feedu emoji koje prave druge aplikacije učitavaju se kao fotografije objava, kako kažu
  **Fotografije** i Tor gore. U privatnim razgovorima prikazuju se kao :ime: i nikad se ne učitavaju.
- **Oznake:** jedna ✓ čim jedan od njihovih relaya prihvati poruku. NIP-17 ništa ne vraća: ni kada je njihova aplikacija
  ima, ni kada je pročitaju. Čitanje razgovora ovdje nikome ništa ne javlja.
- **Nije anonimno:** vaš ključ isti je za sve kojima pišete, i svatko tko ima npub može mu pisati. Relayi na koje stižu
  vaše poruke vide da ih vaš ključ čita i, bez Tora, odakle. Samo veza koja čita vaše relaye kaže im tko čita, kad relay
  to zatraži (NIP-42); slanje i traženje ljudi nikada.
- **Preko Tora:** na Androidu, **Tor** na ovom ekranu bira kako ovaj Nostr račun dolazi do svojih relaya i servera
  datoteka, kao račun svake mreže: **Isključeno**, zadano za novi ključ, direktno; **Kao prostor**, kako kaže izbor
  prostora pod **Postavke** → **Relay i mreže** → **Tor** (sa **Poruke** preko Tora čim je Tor spreman, sa **Sve**
  samo preko Tora); **Uvijek preko Tora**, samo preko Tora, pokrenut za njega, nikad direktno. Ključ od prije ovog
  izbora također počinje na **Isključeno**. Ekran kaže kuda sada idu. U web aplikaciji i na računaru idu direktno.
  **Preko Tora**, na dnu razgovora, šalje samo taj razgovor isključivo preko Tora, kakav god da je način prostora, na
  vlastitim krugovima, tako da nijedan Tor izlaz ne nosi njegove poruke zajedno s porukama drugog razgovora: ono što u
  njemu šaljete, traženje gdje čitaju, i njegove fotografije i datoteke; bez Tora ništa od toga ne ide. Ono što stiže
  vama i dalje prati način prostora, jer jedna veza čita vaše poruke za sve razgovore. Čuva se samo na ovom telefonu.
- **Obavijesti:** poruka koja stigne prikazuje obavijest i broji se u broju na ikoni Erevosa, kao u Erevosovim vlastitim
  razgovorima, dok je ovaj prostor otvoren; na računaru, dok Erevos radi. Na Androidu, **Obavijesti** na dnu razgovora
  ga utišavaju ili mu daju vlastiti zvuk; utišani razgovor se ne broji. **Izgled razgovora** pored njih daje razgovoru
  vlastiti izgled.
- **Još ne:** datoteke koje druga aplikacija šifrira na drugi način (prikazuju se kao datoteka koju Erevos ne otvara).

**Zašto:** mnogi ljudi su na Nostru i tamo će ostati. Tako im pišete iz Erevosa, odvojeno i označeno, jer je Nostr ključ
isti za sve kojima pišete, dok Erevosovi vlastiti razgovori skrivaju tko s kim razgovara.

- **Šta poruka nosi:** kao u razgovoru na Matrixu (pogledajte [Matrix](#matrix)), i **Lokacija**, koja šalje gdje ste
  kao geo: adresu i link karte koji svaka Nostr aplikacija može prikazati; mjesto poslano tako prikazuje se kao
  mjesto. U grupi, kad upišete @, vidite njene članove, imenovane tako da svaka Nostr aplikacija zna na koga se misli.
  Poruka koju proslijedite označena je kao **Proslijeđeno** samo na vašem telefonu.
- **Nacrti:** ono što upišete, a ne pošaljete, ostaje kao nacrt razgovora, šifrovano samo na ovom telefonu. Vraća se
  kad ponovo otvorite razgovor, i nakon što se Erevos zatvorio, a popis početnog ekrana ga pokazuje u redu razgovora
  kao **Nacrt**.
- **Pošalji kasnije:** zadržite **Pošalji**, izaberite vrijeme (**Za 1 sat**, **Večeras u 20:00**, **Sutra u 09:00**
  ili bilo koji dan i vrijeme) i dodirnite **Pošalji kasnije**. Poruka čeka na ovom telefonu, šifrovana, isprekidano
  nakon poruka razgovora s njenim vremenom, i odlazi s ovog telefona u to vrijeme dok je Erevos otključan, na Androidu
  i u pozadini; inače čim se ponovo otključa. Samo tekst. Dodirnite je da je pošaljete odmah ili obrišete. U skrivenim
  razgovorima odlazi samo dok su otvoreni, osim ako primaju i zatvoreni. Poruka koju je vratila vraćena sigurnosna
  kopija, a čije je vrijeme bilo prije vraćanja, ne odlazi sama: telefon s kojeg je kopija došla možda ju je već
  poslao.
- **Podsjeti me:** meni poruke ima **Podsjeti me**. Izaberite vrijeme: poruka, s imenom svog razgovora, ide u
  **Razgovor sa sobom** i tada vas podsjeti. Potrebno je da je **Erevos** uključen u [Moduli](#modules).
- **Poruke koje nestaju:** **Poruke koje nestaju**, ispod polja za poruku, briše nove poruke, poslane ili primljene, s
  ovog telefona toliko nakon slanja. Vaše nose to vrijeme (NIP-40), pa ih njihova aplikacija i relayi koji ga poštuju
  tada brišu; oni koji ga ne poštuju ih zadržavaju. **Nestajanje** to radi samo za sljedeću poruku. Poruka koja stigne
  sa svojim vremenom odlazi u to vrijeme.
- **Blokiranje:** **Blokiraj**, na dnu razgovora, odbacuje na ovom telefonu ono što taj ključ šalje, nepročitano; ne
  vraća se ako ga odblokirate. Ne javlja mu se: Nostr ne može nikoga spriječiti da vam piše. **Blokirani kontakti**,
  na ekranu Nostr razgovora, navodi ih, s **Odblokiraj**.
- **Provjera uživo:** u razgovoru s jednom osobom, **Provjera uživo** pokazuje kod vašeg ključa. Fotografišite kod
  koji pokazuje njihova aplikacija (nostr:npub…): razgovor se označava kao provjeren kad je to ključ ovog razgovora.
  Ništa se ne šalje.

## Telegram {#telegram}

Samo u Erevos+, na Androidu, prostor se može prijaviti na tvoj Telegram račun i razgovarati s ljudima na Telegramu, u **Postavke** → **Relay i mreže** → **Telegram**. Erevos nije napravio Telegram i koristi Telegram API. Razgovori se pridružuju listi na početnom ekranu, označeni kao **Telegram**, s vlastitim čipom.

- **Prijava:** dodirni **Prijavi se na Telegram**, upiši svoj broj telefona s pozivnim brojem države, pa kod koji Telegram šalje: u svoju aplikaciju na tvojim drugim uređajima, SMS-om ili pozivom; **Pošalji kod ponovo** traži ga iznova. Ako tvoj račun ima lozinku u dva koraka, Erevos je traži i prikazuje tvoj podsjetnik. Ako Telegram traži da potvrdiš na drugom uređaju, Erevos prikazuje vezu koju tamo treba otvoriti. Novi Telegram račun ili prijavu e-poštom Erevos još ne može: uradi to jednom u službenoj aplikaciji Telegram. Ono što Telegram čuva na ovom telefonu ostaje šifrirano u ovom prostoru.
- **Obični razgovori:** Telegram ih može čitati. Običan Telegram razgovor šifriran je samo između tebe i Telegramovih servera, a grupe i kanali nikad nisu šifrirani od kraja do kraja. Privatni razgovor to kaže na vrhu: **Telegram može čitati ovaj razgovor**.
- **ErevosGram šifriranje:** u privatnom razgovoru **ErevosGram šifriranje** šalje drugoj osobi poziv. Ako koristi {=Erevos} ili aplikaciju ErevosGram i dodirne **Prihvati**, razgovor postaje **Šifrirano od kraja do kraja (ErevosGram)**: ono što oboje pišete zapečaćeno je Erevosovim vlastitim protokolom prije nego stigne do Telegrama, koji vidi samo tekst koji ne može čitati. Kad ti oni šalju poziv, razgovor prikazuje **Žele ErevosGram šifriranje**, s **Prihvati** i **Odbij**. To je Erevosov vlastiti kod, bez nezavisne provjere. Ono što je napisano prije ostaje čitljivo Telegramu.
- **Sigurnosni broj:** dodirni lokot na vrhu šifriranog razgovora da vidiš njegov sigurnosni broj. Uporedi ga s onim na njihovom telefonu, drugim putem, ne preko Telegrama, i dodirni **Označi kao provjereno** kad su isti. Ako se njihovi ključevi promijene, razgovor te upozorava: uporedi ponovo prije nego mu vjeruješ.
- **Pozivi:** u privatnom razgovoru gumb za poziv na vrhu pokreće Telegram glasovni poziv, a dolazni se prikazuje preko svakog zaslona s **Odgovori** i **Odbij**. Poziv obavlja sam Telegram, šifriran od kraja do kraja Telegramovim šifriranjem poziva. Usporedi četiri emojija na svom zaslonu s onima na drugom telefonu: ako su isti, nitko ne prisluškuje. **Video poziv**, pored njega, pokreće poziv s uključenom kamerom; video poziv zvoni s **Odgovori videom** pored **Odgovori**. U svakom pozivu **Kamera** uključuje ili isključuje tvoju kameru, a **Zamijeni** prebacuje između prednje i zadnje; slika druge osobe ispunjava ekran dok joj je kamera uključena.
- **Razgovori i Postavke:** Telegram zaslon prikazuje tvoje razgovore u redovima, kao početni zaslon, i donosi ih još dok ideš prema dolje. **Postavke**, pored naslova, imaju **Oglasi u kanalima**, **Telegram mape**, **ErevosGram ključevi** i **Napusti Telegram na ovom telefonu**; **Razgovori** tamo, ili Natrag, vraća na popis.
- **Donesi ključeve iz aplikacije ErevosGram:** na Telegram zaslonu, **Donesi ključeve iz aplikacije ErevosGram**. U aplikaciji ErevosGram izvezi ključeve, što piše erevosgram-keys.txt i pokazuje kod od 20 znakova; zalijepi redak iz datoteke u Erevos i upiši kod. Razgovori šifrirani tamo otvaraju se ovdje. Poslije ne koristi aplikaciju ErevosGram za te razgovore. Ako ovaj prostor već ima ErevosGram ključeve, zamjena se traži zasebno, a razgovori šifrirani ovdje do tada više se ne otvaraju.
- **Oglasi u kanalima:** isključeni dok ne uključiš **Oglasi u kanalima** na Telegram zaslonu. Telegram traži od aplikacija da prikazuju njegove oglase u velikim javnim kanalima; uključeni, kanal na vrhu može prikazati malu karticu označenu **Oglas**, koju možeš zatvoriti.
- **Mape:** mape koje si napravio u Telegramu prikazuju se kao kartice na Telegram zaslonu, između **Razgovori** i **Arhiviraj**. Pod **Telegram mape** uključi one koje želiš: svaka se prikazuje kao zasebna kartica tamo i na početnom zaslonu. Čim je neka mapa uključena, obavještavaju samo razgovori u tim mapama. U Telegramu mape ostaju kakve jesu.
- **Podaci o razgovoru:** dodirni ime razgovora da vidiš kada je osoba zadnji put bila na mreži, njeno ime, broj i biografiju, ili opis, članove i poveznice grupe. Tamo možeš utišati razgovor, prikvačiti ga, arhivirati ga, označiti kao pročitan ili nepročitan, staviti ga u svoje Telegram mape (Telegram ih mijenja na svim tvojim uređajima), pustiti da se nove poruke same brišu nakon dana, tjedna ili mjeseca, blokirati osobu, obrisati povijest te obrisati razgovor ili napustiti grupu ili kanal.
- **Slanje fotografija i datoteka:** **Priloži**, pored **Pošalji**, nudi **Fotografija**, **Kamera** i **Datoteka**. Ono što si upisao ide ispod kao njen tekst. ErevosGram šifriranje pokriva samo tekst: u šifriranom razgovoru Erevos prvo pita, jer Telegram može čitati fotografije i datoteke.
- **Uređivanje, prosljeđivanje, traženje:** drži pritisnutu svoju poruku i dodirni **Uredi** da promijeniš tekst (ne u šifriranom razgovoru), ili drži običnu poruku i dodirni **Proslijedi** da je pošalješ u drugi razgovor. **Traži**, na vrhu razgovora, pretražuje njegove poruke.
- **Glasovne poruke:** kad ništa nije napisano, mikrofon pored **Pošalji** snima dok ga držiš; pusti da pošalješ, povuci ulijevo da otkažeš. Kao datoteku, glasovnu poruku ErevosGram šifriranje ne pokriva, pa u šifriranom razgovoru Erevos prvo pita.
- **Reakcije:** drži poruku i dodirni **Reaguj** da odabereš emoji. Reakcije se vide ispod poruke; dodirni jednu da daš ili povučeš svoju.
- **Ankete i naljepnice:** u grupi ili kanalu **Priloži** → **Anketa** traži pitanje, od dvije do deset opcija te jesu li glasovi anonimni i je li dopušteno više odgovora. Dodirni opciju da glasaš (**Glasaj**, ako je dopušteno više); **Povuci glas** ga vraća, a **Zatvori anketu** u izborniku tvoje vlastite ankete je završava. **Priloži** → **Naljepnica** šalje jednu iz tvojih paketa.
- **Niti:** poruka s odgovorima pokazuje koliko ih ima; dodirni je da ih pročitaš i napišeš jedan. **Odgovori u niti** u izborniku poruke otvara ili nastavlja nit u grupi ili kanalu.
- **Prikvačena poruka:** prikvačena poruka vidi se u traci na vrhu razgovora; dodirni je da odeš do nje. **Prikvači** i **Otkvači** su u izborniku poruke; u privatnom razgovoru biraš između **Za oboje** i **Samo za mene**.
- **Više poruka:** **Odaberi** u izborniku poruke omogućuje da dodirneš još njih, pa ih zajedno **Kopiraj**, **Proslijedi** ili **Obriši**. Šifrirane poruke ne mogu se proslijediti i izostavljaju se.
- **Članovi i administratori:** u grupi ili kanalu podaci o razgovoru nabrajaju **Članovi**, označene kao **Vlasnik** ili **Administrator**; dodirni jednog da mu pišeš. Vlasnik i administratori mogu **Uredi** naslov i opis te **Ukloni** člana.
- **Više u grupama i razgovorima:** s pravom dodavanja administratora, **Postavi za admina** pored člana bira što smije, a **Prava** pored administratora to mijenja ili ga s **Ukloni administratora** vraća u člana. **Dodaj člana** dodaje nekog od tvojih kontakata ili bilo koga po @imenu; ako to njegove postavke privatnosti ne dopuštaju, pošalji mu poveznicu za poziv. **Priloži** → **Anketa** može napraviti **Kviz**: dodirni kućicu pored točnog odgovora i, ako želiš, dodaj objašnjenje; čim netko odgovori, točan odgovor se vidi s ✅. Animirane naljepnice se miču u razgovoru. **Priloži** → **Erevos naljepnica** šalje jednu od Erevosovih naljepnica; Telegram je dobiva kao nepomičnu naljepnicu. Reakcija s prilagođenim emojijem prikazuje njegovu sliku. S više prikvačenih poruka, traka na vrhu prikazuje jednu po jednu: svaki dodir ide na jednu i prelazi na prethodnu. Nit ima **Priloži**, mikrofon i izbornik poruke, kao razgovor. Na početnom ekranu, na kartici Telegram ili u nekoj njezinoj mapi, izbornik ima **Označi sve kao pročitano**. Fotografije se same prikazuju u razgovoru, a GIF-ovi se tamo vrte; video pokazuje svoju sliku sa ▶ i koliko traje, a dodir ga pušta preko cijelog ekrana, sa zvukom. Ime razgovora i njegova dugmad ostaju gore dok pomičeš. **Zaključaj PIN-om**, u podacima razgovora, zaključava ga kao Erevos razgovor: traži svoj PIN svaki put kad se otvori, a početni ekran ne pokazuje ništa od njegovih riječi. **Premjesti u skrivene razgovore**, također tamo, drži razgovor u skrivenim razgovorima koje otvara njihov PIN: napušta liste i brojanja ovog prostora i prikazuje se samo tamo; **Vrati u moje razgovore** ga vraća. Sam Telegram ga i dalje ima, na svim tvojim uređajima. Pod **+** u Telegram razgovoru, **Skrivena fotografija** šalje fotografiju koja je zamućena dok je neko ne dodirne, a takve koje primiš prikazuju se isto. **Lokacija** i **Kartica kontakta** pod **+** šalju mjesto ili jedan od tvojih kontakata u Telegram razgovor, kako ih prikazuju Telegramove aplikacije; Telegram može pročitati oboje, a kartica ide samo s brojem telefona. **Pošalji kasnije** pod **+** u Telegram razgovoru šalje napisano u vrijeme koje izabereš: Telegram ga čuva i šalje tada, čak i kad je ovaj telefon isključen, a **ide kasnije** iznad polja za poruku ih prikazuje, sa **Pošalji sada** i **Obriši**. Ne u razgovoru sa ErevosGram šifrovanjem. U Telegram razgovoru, dugme za pretragu prikazuje i njegove **Mediji, linkovi i fajlovi**: **Fotografije**, **Video snimci**, **Glasovne poruke**, **Fajlovi** ili **Linkovi**, svaka vrsta posebno, sve sa Telegrama a ne samo one na ovom telefonu; dodirni jednu da odeš do nje u razgovoru. Sa uključenim **Pregledima linkova** u Podešavanjima, prvi link poruke poslane u Telegram razgovor ide s pregledom koji naprave Telegramovi serveri, kao u Telegramovim aplikacijama; pregledi koji stignu prikazuju se ispod teksta, bez slike, i pitaju prije nego se link otvori. **Blokiraj snimke ekrana** u informacijama Telegram razgovora drži ga izvan snimaka ekrana i pregleda nedavnih aplikacija na ovom telefonu, na Androidu; Telegram ne može tražiti isto od druge strane. Telegram razgovor otvoren svojim PIN-om, ili čuvan u skrivenim razgovorima, takođe ostaje izvan njih, kao Erevos razgovor. **Obavijesti** u informacijama Telegram razgovora postavljaju mu vlastiti zvuk i melodiju poziva na ovom telefonu, ili ga ovdje utišaju na neko vrijeme, kao za Erevos razgovor; **Utišaj obavijesti** iznad ga utiša u Telegramu, na svim tvojim uređajima. U Telegram razgovoru, ono što je napisano i ostavljeno vraća se kad se razgovor ponovo otvori: Telegram to čuva kao skicu na svim tvojim uređajima, osim u razgovoru sa ErevosGram šifrovanjem, gdje to čuva samo ovaj telefon dok Erevos radi. Poruka koja nije mogla otići ima **Pošalji ponovo** i **Obriši** u svom meniju, a dugme za pretragu ima **Idi na dan**. Drži pritisnutu fotografiju, video ili fajl u Telegram razgovoru i izaberi **Spremi u Zbirku** da tamo čuvaš šifrovanu kopiju; ona iz skrivenih razgovora ide u njihovu Zbirku. **Pošalji u**, iz Dijeljenja druge aplikacije, prikazuje i Telegram razgovore prostora, osim zaključanih PIN-om, čuvanih u skrivenim razgovorima ili kanala: tekst ide u polje za poruku razgovora, a fotografija ili fajl do 100 MB odlazi odmah. U Telegram razgovoru, @ime se može dodirnuti, a t.me link (osoba, grupa ili kanal, poruka, pozivnica) otvara se u Erevosovom Telegramu, uz pitanje prije pridruživanja pozivnicom; ostali linkovi pitaju prije otvaranja u pregledniku. **Tor za ovaj Telegram račun**, u Telegram podešavanjima i prije prijave, ima **Isključeno** (na početku), **Kao prostor** i **Uvijek preko Tora**, kao svaki račun druge mreže: s Uvijek, ili dok prostor šalje Sve preko Tora, do Telegrama se ide samo preko Tora, na vlastitim krugovima, i pri prijavi, i nikad izravno, ni kad Tor ne može da se poveže; račun svakog skrivenog mjesta bira za sebe. **Preko Tora** u informacijama Telegram razgovora šalje taj razgovor samo preko Tora: Telegram ima jednu vezu za sve razgovore računa, pa cijeli račun ide preko Tora dok je uključeno. Sporije, a pozivi ne idu preko Tora.
- **Traži po @imenu:** na vrhu Telegram ekrana upiši ime u **Traži po @imenu** da otvoriš razgovor s tom osobom ili kanalom.
- **Skriveni razgovori:** svako skriveno mjesto može imati vlastiti Telegram račun, koji se nigdje ne vidi izvan njegovih skrivenih razgovora. Vidi [Skriveni razgovori](#hidden).
- **Napuštanje:** **Napusti Telegram na ovom telefonu**, pri dnu Telegram ekrana, traži da izabereš: **Odjavi se i na Telegramu** skida ovaj telefon s tvojih uređaja na Telegramu, a **Samo zaboravi ovdje** ga ostavlja na popisu tamo dok ga ne ukloniš u aplikaciji Telegram. U oba slučaja Erevos briše ono što je Telegram čuvao na ovom telefonu i ErevosGram ključeve, pa se šifrirani razgovori ne mogu ponovo čitati.
- **Fotografije i datoteke:** fotografija, glasovna poruka, video ili datoteka preuzima se s Telegrama tek kad to zatražiš, pa se prikaže ili spremi. Glasovne poruke i video zasad se prikazuju kao datoteke.

## Messenger {#messenger}

Samo u Erevos+, na Androidu, Erevos se može prijaviti na tvoj Facebook Messenger račun i razgovarati s ljudima na Messengeru, u **Postavke** → **Relay i mreže** → **Messenger**, ili s njegove kartice na početnom ekranu. Erevos sam razgovara s Metinim serverima, bez mosta između; nije ga napravila Meta. Račun pripada telefonu, a ne prostoru: njegovi razgovori se pridružuju listi na početnom ekranu prvog prostora, označeni kao **Messenger**, s vlastitom karticom. Messenger uključi ili isključi u **Postavke** → **Općenito** → **Moduli**.

- **Prijava:** **Prijavi se na Messenger** otvara Facebookovu vlastitu stranicu za prijavu. Prijavi se tamo kao na facebook.com, sa svakim kodom ili provjerom koju Facebook traži, a Erevos čuva prijavu, šifriranu, na ovom telefonu. Ako je Messenger poslije prekine, Messenger zaslon kaže **Messenger traži da se ponovo prijaviš**.
- **Što Meta može čitati:** ispod imena razgovora Erevos kaže je li šifriran od kraja do kraja. Meta ne može čitati razgovor šifriran od kraja do kraja, ali zna ko s kim razgovara i kada; svaki drugi razgovor Meta može čitati.
- **Razgovori:** Messenger zaslon nabraja tvoje razgovore, najnovije prvo. **Novi razgovor** nalazi ljude po imenu: upiši ga, dodirni **Traži**, pa dodirni osobu da počneš.
- **Pisanje:** **+** pored polja za poruku nudi **Fotografija**, **Kamera**, **Datoteka** (do 100 MB) i **Naljepnica**. Kad ništa nije napisano, drži mikrofon da snimiš glasovnu poruku. Drži poruku za njen izbornik: reakcija, **Odgovori**, **Kopiraj** i **Obriši**, s **Obriši za sve** za tvoje poruke i **Obriši za mene** za bilo koju. Odgovori, reakcije, izmjene i brisanja vide se kako stižu. Messengerovi pozivi nisu u Erevosu.
- **Otvori Facebook:** na Messenger zaslonu, **Otvori Facebook** pokazuje Facebookovu vlastitu stranicu s istom prijavom. Messenger linkovi odande vraćaju se u Erevos; ostali linkovi otvaraju se u tvom pregledniku, bez Facebookovih oznaka za praćenje i nikad preko Tora, pa taj sajt vidi tvoju internet adresu. Ako te zaslon prvo traži da se odjaviš i ponovo prijaviš, učini to jednom: Messenger se sada prijavljuje na facebook.com. Facebook ima i vlastitu karticu u prozoru **Usluge** na početnom zaslonu, pored Messengera, koja ga odmah otvara.
- **Messenger u svojoj futroli:** na Messenger zaslonu, pod **Kako se Messenger ovdje koristi**, uz **Preko Erevosa** (zadano) Erevos sam govori Messenger, a **U svojoj futroli** umjesto toga pokazuje Metinu vlastitu Messenger stranicu, kao na računalu, zatvorenu u Erevos s istom prijavom; **Otvori Messenger** je otvara. U njoj se učitavaju samo Metine stranice, poveznice prema van otvaraju se u tvom pregledniku bez Facebookovih oznaka praćenja, a ono što Metina stranica čuva ostaje samo u futroli, odvojeno od svake druge stranice, pa prepoznaje tvoj telefon i ne traži svaki put PIN tvojih šifriranih razgovora; briše se kad se odjaviš iz Messengera ili je otvori drugi račun. Pozivi u njoj rade, ali ne preko Tora: ako Messenger ide preko Tora, stranica ide samo preko Tora, bez poziva, a poveznice prema van se ne otvaraju. Erevos te i dalje obavještava o novim porukama, čak i ako futrola nikad nije otvorena: razgovor s nepročitanim porukama stoji na početnom zaslonu dok se ne pročita, a dodir ga otvara u futroli; dok je futrola otvorena, Erevos ne obavještava, jer ih stranica već pokazuje. Zaključavanja razgovora, skriveni razgovori i Zbirka ne vrijede za njene razgovore. Zatvara se čim se prostor zaključa ili zatvori, i gumbom za paniku, i ostaje izvan snimki zaslona i pregleda nedavnih aplikacija kad god i Erevosov vlastiti zaslon; isto i Facebook stranica. Prikazuje se ispod Erevosove trake, u Erevosovim bojama: **←** vraća u Erevos, a **Facebook** u traci pokazuje Facebookov feed na istoj stranici, s **Messenger** za povratak. Stranica je složena na širinu telefona, pa se čita bez povećavanja. Sama Metina stranica preuzima cijeli tvoj izgled: njegove boje, tamna ili svijetla kao Erevos, oblik tvojih oblačića, veličinu teksta, slova tvog stila i ono što stoji iza tvojih ekrana, i mijenja se s njim čak i dok je otvorena; tvoja vlastita fotografija ostaje u Erevosu, a stranica umjesto nje pokazuje blagi prelaz boja. Gdje Meta promijeni svoju stranicu, neki dijelovi mogu zadržati Metin izgled.
- **Obavijesti i čitanje:** nove poruke te obavještavaju i broje se na Erevosovoj ikoni, kao ostali razgovori. Otvaranje razgovora označava ga pročitanim, i ostaje pročitan dok netko opet ne napiše, čak i prije nego što Messenger za to sazna. Svaki razgovor ima vlastite **Obavijesti** ispod polja za poruku: utišan, ili s vlastitim zvukom.
- **Preko Tora:** **Tor za ovaj Messenger račun**, na Messenger zaslonu i prije prijave, po zadanom je **Isključeno**, i Metini serveri vide tvoju internet adresu; **Kao prostor** prati **Postavke** → **Relay i mreže** → **Tor**; **Uvijek preko Tora** šalje račun, njegovu prijavu i njegove slike samo preko Tora. **Preko Tora** ispod razgovora šalje cijeli račun preko Tora, jer Messenger ima jednu vezu za sve svoje razgovore. Meta može tražiti potvrdu, ili neko vrijeme zaključati, račun koji se prijavljuje preko Tora. Vidi [Ko vidi vašu internet adresu](#ip).
- **Odjava:** **Odjavi se sa Messenger na ovom telefonu** vadi njegove razgovore iz Erevosa; možeš se ponovo prijaviti. Sigurnosne kopije čuvaju obavijesti svakog razgovora i izbor Tora, ne prijavu: nakon vraćanja, prijavi se ponovo.

## Signal {#signal}

Samo u Erevos+, na Androidu, Erevos može držati tvoj Signal račun i razgovarati s ljudima na Signalu, u **Postavke** → **Relay i mreže** → **Signal**, ili s njegove kartice na početnom ekranu. Erevos sam govori Signalov protokol sa Signalovim serverima, i svaki razgovor je šifriran od kraja do kraja; nije ga napravio Signal. Račun pripada telefonu, a ne prostoru: njegovi razgovori se pridružuju listi na početnom ekranu prvog prostora, označeni kao **Signal**, s vlastitom karticom. Signal uključi ili isključi u **Postavke** → **Općenito** → **Moduli**.

- **Dva načina ulaska:** **Novi Signal nalog s mojim brojem** od Erevosa pravi Signal tog broja, a aplikacija Signal na drugom telefonu s istim brojem tada staje. **Poveži sa Signalom na drugom telefonu** ostavlja tvoj Signal gdje jest i dodaje Erevos kao jedan od njegovih povezanih uređaja.
- **Novi račun:** upiši svoj broj s pozivnim brojem zemlje, kao +381 6…, i izaberi stiže li kod SMS-om ili, s **Kod stiže pozivom**, pozivom. Signal te prvo traži da riješiš captcha na svojoj stranici. Zatim upiši kod koji je Signal poslao, i ime koje drugi vide na Signalu (prezime nije obavezno).
- **Povezivanje:** na drugom telefonu, u Signalu, otvori **Podešavanja** → **Povezani uređaji** → **Poveži novi uređaj** i skeniraj kod koji Erevos pokazuje. Nove poruke tada stižu na oba.
- **Razgovori i grupe:** Signal zaslon nabraja tvoje razgovore i grupe, najnovije prvo. **Novi razgovor** nalazi osobu po broju telefona ili po imenu; dodirni je da počneš. Grupe u kojima jesi rade kao razgovori; nove grupe prave se u aplikaciji Signal.
- **Pisanje:** **+** nudi **Fotografija**, **Kamera**, **Datoteka** (do 100 MB) i **Naljepnica**; kad ništa nije napisano, drži mikrofon za glasovnu poruku. Drži poruku za reakciju, **Odgovori**, **Kopiraj** i **Obriši**, s **Obriši za sve** za tvoje poruke i **Obriši za mene** za bilo koju.
- **Pozivi:** u razgovoru s jednom osobom, **Glasovni poziv** i **Videopoziv** zovu je na Signalu, šifrirano od kraja do kraja. Dolazni Signal poziv pokazuje se preko svakog ekrana, s **Javi se**, **Javi se s videom** i **Odbij**. Pozivi ne idu preko Tora, a Erevos upozorava prije svakog.
- **Obavijesti i čitanje:** kao za Messenger, nove poruke te obavještavaju i broje se na ikoni, razgovor pročitan ovdje ostaje pročitan, i svaki razgovor ima vlastite **Obavijesti**, s vlastitim zvukom zvona za pozive.
- **Preko Tora:** **Tor za ovaj Signal račun**, i prije prijave, radi kao za Messenger: po zadanom **Isključeno**, pa Signalovi serveri vide tvoju internet adresu. S **Uvijek preko Tora**, i registracija, njen captcha i povezivanje idu preko Tora. **Preko Tora** ispod razgovora šalje cijeli račun preko Tora.
- **Odjava:** **Odjavi se sa Signal na ovom telefonu** vadi njegove razgovore iz Erevosa. Sigurnosne kopije čuvaju obavijesti svakog razgovora i izbor Tora, ne račun: nakon vraćanja, registriraj se ili se ponovo poveži.

## Session {#session}

Samo u Erevos+, na Androidu, Erevos može držati Session račun i razgovarati s ljudima na Sessionu, u **Postavke** → **Relay i mreže** → **Session**, ili s njegove kartice na početnom ekranu. Session ne traži ni broj telefona ni e-mail: račun je 13 riječi za oporavak, a njegove poruke idu šifrirane od kraja do kraja kroz onion rutiranje Sessionovih čvorova. Erevos nije napravio Session. Račun pripada telefonu, a ne prostoru: njegovi razgovori se pridružuju listi na početnom ekranu prvog prostora, označeni kao **Session**, s vlastitom karticom. Session uključi ili isključi u **Postavke** → **Općenito** → **Moduli**.

- **Novi račun:** dodirni **Novi Session nalog**, upiši svoje ime na Sessionu i dodirni **Napravi račun**. Erevos pokazuje **Tvojih 13 reči za oporavak**: zapiši ih, čuvaj ih i dodirni **Zapisao sam ih**. One su jedini način da vratiš račun, a ko ih ima može čitati tvoje razgovore.
- **Račun koji već imaš:** **Vrati nalog s njegovih 13 reči** uzima riječi, s razmacima između njih, i tvoje ime; zatim dodirni **Vrati ga**.
- **Tvoj Session ID:** Session zaslon ga pokazuje, s **Kopiraj**. Drugi po njemu započinju razgovor s tobom.
- **Razgovori:** **Novi razgovor** uzima Session ID ili ONS ime, a **Otvori** započinje razgovor.
- **Grupe:** **Nova Session grupa** pravi grupu od imena i ljudi koje izabereš među svojim Session razgovorima. Dobiju poziv i pridruže se kad ga prihvate, a ti si njen admin. U grupi njeno dugme pokazuje **Članovi**; admin može **Dodaj ljude**, **Preimenuj** grupu, te **Postavi za admina** ili **Ukloni iz grupe** nekoga ko nije admin. **Napusti grupu** je napušta, a povratak traži novi poziv.
- **Pisanje:** **+** nudi **Fotografija**, **Kamera**, **Datoteka** (do 10 MB) i **Naljepnica**; kad ništa nije napisano, drži mikrofon za glasovnu poruku. Drži poruku za reakciju, **Odgovori**, **Kopiraj** i **Obriši**.
- **Pozivi:** u razgovoru s jednom osobom, **Glasovni poziv** i **Videopoziv** zovu je na Sessionu. Session sam zvoni svoje pozive, tiho za utišan razgovor. Pozivi ne idu preko Tora, a Erevos upozorava prije svakog.
- **Obavijesti i čitanje:** kao za Messenger i Signal, s vlastitim **Obavijesti** svakog razgovora i vlastitim zvukom zvona za pozive.
- **Preko Tora:** **Tor za ovaj Session račun** radi kao za Messenger i Signal, po zadanom **Isključeno**. Sessionovo onion rutiranje već krije tvoju internet adresu od ljudi kojima pišeš; prvi Session čvor je vidi, osim ako račun ide preko Tora.
- **Odjava:** **Odjavi se sa Session na ovom telefonu** prvo pita, jer bez tvojih 13 reči za oporavak račun ne može da se vrati. Sigurnosne kopije ne čuvaju račun: nakon vraćanja, vrati ga njegovim riječima.

## SMS {#sms}

Na Androidu Erevos može biti SMS aplikacija telefona: pod **Postavke** → **Telefon i SMS** → **SMS** → **Erevos kao
SMS aplikacija** dodirnite **Postavi Erevos kao SMS aplikaciju**. Početni ekran tada prikazuje SMS i Erevos razgovore
na jednom popisu.

> **Erevos ne šifrira SMS i MMS poruke.** One putuju kao i svaki SMS i ostaju u Androidovoj vlastitoj pohrani SMS
> poruka, gdje ih vidi svaka aplikacija kojoj je dozvoljeno čitanje SMS poruka i gdje ih sadrže Androidove rezervne
> kopije. Samo su Erevos razgovori šifrirani s kraja na kraj.

- **SMS poruke od ranije:** nema ničeg za uvoz. Erevos prikazuje SMS i MMS poruke koje su već na telefonu, iz
  Androidove vlastite pohrane, gdje ostaju za svaku drugu SMS aplikaciju. Android ih čuva, a Erevos ih ne zapečaćuje,
  kao i kod svake SMS aplikacije.
- **Ako Erevos ne postane SMS aplikacija:** Android 15 i noviji to može uskratiti aplikaciji instaliranoj iz
  preglednika. Pod **Postavke** → **Telefon i SMS** → **SMS** → **Erevos kao SMS aplikacija** dodirnite **Otvori
  zadane aplikacije** → **SMS aplikacija** → Erevos. Ako Android kaže da je to ograničena postavka, otvorite
  **informacije o aplikaciji Erevos**, dodirnite **⋮** gore desno → **Dozvoli ograničene postavke** i ponovo izaberite
  Erevos.
- **Kad stigne SMS:** obavijest kaže „New message“, bez toga ko ga je poslao ili šta kaže. Ako nikakva ne stiže,
  **Erevos kao SMS aplikacija** prikazuje **Dozvoli obavijesti** dok ih Android uskraćuje.
- **Jednokratni kodovi:** SMS koji kaže da sadrži kôd (banke, prijave), na bilo kojem od jezika aplikacije, dobija
  **Kopiraj kod** ispod sebe u razgovoru, a i na svojoj obavijesti, a da se kôd tamo ne prikazuje; na Androidu 12 i
  novijem dugme na obavijesti prvo traži da otključate telefon. Kopira se samo njegovih 4 do 8 cifara, nikad broj
  telefona, iznos, datum ili vrijeme, a Android ih ne prikazuje u pregledu. Svaka aplikacija koja čita međuspremnik
  može ih pročitati, pa kôd zalijepite što prije.
- **Odgovor iz obavještenja:** **Postavke** → **Telefon i SMS** → **SMS** → **Šta SMS kaže, u svom obavještenju**, u
  početku isključeno, pokazuje u obavještenju SMS-a ko je pisao i šta dok je ovaj prostor otvoren, s **Odgovori**,
  koje šalje običan SMS preko SIM-a na koji je stigao, i **Označi kao pročitano**. Ko vidi ekran vidi i to;
  zaključano, ili s drugim otvorenim prostorom, obavještenje opet kaže samo „Nova poruka“, a ono s jednokratnim
  kodom uvijek.
- **Ako se ne prikazuju SMS poruke:** Android 15 i noviji uskraćuje dozvolu za SMS aplikaciji instaliranoj iz
  preglednika. Pod **Postavke** → **Telefon i SMS** → **SMS** → **Erevos kao SMS aplikacija** dodirnite **Dozvoli
  SMS**. Ako Android kaže da je to ograničena postavka, otvorite **informacije o aplikaciji Erevos**, dodirnite **⋮**
  gore desno → **Dozvoli ograničene postavke** i dozvolite SMS pod **Dozvole**. Razgovori poslani kao RCS („chat“ u
  Google Messages) ostaju u toj aplikaciji i ne prikazuju se. **Erevos kao SMS aplikacija** kaže koliko SMS razgovora
  Erevos čita, ili zašto ih nije mogao pročitati.
- **Pisanje nekome ko ima Erevos:** ide preko Erevosa, šifrirano s kraja na kraj, čim je njegov broj povezan s
  njegovim kontaktom. Povežite ga ručno u SMS razgovoru, ili neka ga pronađe skrivena pozivnica. Od tada njegov SMS
  razgovor otvara njegov razgovor.
- **Njegove SMS poruke u razgovoru:** SMS i MMS poruke s njegovim brojem, one od ranije i one koje stižu, prikazuju se
  među porukama razgovora po vremenu, svaka uokvirena i označena sa **SMS (nije šifriran)**, sa svojim ✓ i svojim
  fotografijama. Zadržite prst na jednoj da je kopirate, proslijedite ili obrišete, kao u SMS razgovoru. Ostaju u SMS
  porukama telefona, nikad u zapečaćenoj historiji razgovora; prikazuje se samo razgovor s tim jednim brojem, ne i
  grupni MMS, i samo dok je Erevos SMS aplikacija ili smije čitati SMS poruke, nikad u skrivenim razgovorima.
  Najnovije se prikazuju prve: **Prikaži ranije SMS poruke**, iznad njih, donosi još, a i pretraga razgovora ih
  pronalazi. Otvaranje razgovora čita sve njegove, i ranije, pa nijedna ne ostaje u broju na početnom ekranu. Broj na
  kartici njegovog kontakta radi isto, a da ga ne povezuje.
- **Običan SMS toj osobi:** na primjer kad nema interneta. **Običan SMS** u **Detalji** razgovora otvara njen SMS
  razgovor da ga tamo napišete, a **+** → **Pošalji kao SMS**, ili **Kao SMS** kad zadržite prst na strelici za
  slanje, šalje ono što ste upisali kao SMS, nakon pitanja. U razgovoru se prikazuje kao SMS. Telefonska kompanija ga
  može pročitati. SMS ne može nestati niti odgovoriti na poruku: s uključenom štopericom, ili kad se odgovara na
  poruku, Erevos to kaže kad pita.
- **Skrivene pozivnice:** s prvim SMS-om na broj koji nije kontakt, Erevos šalje i kratku skrivenu pozivnicu. Nijedna
  ne ide na broj Erevos kontakta, povezan ili na kartici njegovog kontakta. Telefon bez Erevosa ne prikazuje ništa;
  telefon s Erevosom odgovara preko relaya i njih dvoje postaju kontakti. Sam odgovara samo na broj koji poznaje, u
  vašim kontaktima ili onaj kojem ste pisali SMS-om; za svaki drugi prvo pita, **Poziv putem SMS-a**, jer pošiljatelj
  SMS-a može biti lažan. Svaki broj se pita najviše jednom mjesečno, a **Isključi pozivnice**, pod **Postavke** →
  **Telefon i SMS** → **SMS** → **Pronađi Erevos na broju**, ih zaustavlja.

**Zašto:** kako bi se dva Erevos telefona pronašla samo na osnovu broja telefona, bez servera koji zna brojeve.
Pozivnica je podatkovni SMS, koji aplikacije za poruke ne prikazuju, pa telefon bez Erevosa ne prikazuje ništa.

- **Svi ostali:** običan SMS, označen kao SMS. Telefonska kompanija ga može pročitati, kao što čita svaki SMS.
- **✓ i ✓✓✓:** vaš SMS prikazuje ✓ kad ode, a ✓✓✓ kad izvještaj mreže o isporuci kaže da je stigao na telefon te
  osobe, ili „nije isporučeno“. Neke telefonske kompanije ne šalju izvještaje o isporuci; tada ostaje ✓. SMS ne može
  reći je li pročitan.
- **Fotografije, glasovne poruke i kartice kontakata (MMS):** **+** → **Fotografija** dodaje fotografiju, smanjenu da
  stane u jedan MMS (oko 280 KB), bez ičega u njoj osim slike. Držite mikrofon, kad ništa nije otkucano, da snimite
  glasovnu poruku do minute, poslanu kao MMS u AMR-u, formatu koji puštaju aplikacije za poruke na telefonima. **+** →
  **Kartica kontakta** šalje kontakt iz kontakata telefona kao vCard, bez vaših bilješki o njemu i njegovih grupa, a sa
  njegovom slikom samo ako još stane. **+** → **Naljepnica** šalje jednu od ugrađenih naljepnica kao njenu sliku, samu u
  jednom MMS-u. Fotografije, glasovne poruke i kartice kontakata koje stignu prikazuju se u razgovoru, za puštanje ili
  čuvanje (**Sačuvaj** otvara novi kontakt s podacima kartice). MMS je jednako otvoren kao SMS: operater ga može
  vidjeti.
- **Video (MMS):** **+** → **Snimi video** traži od aplikacije kamere video u MMS kvalitetu, do 30 sekundi male
  slike, što većina kamera poštuje; **Video s telefona** uzima samo onaj koji je već dovoljno mali, oko 280 KB, jer
  Erevos ne smanjuje video. Video koji stigne pokazuje ▶ u razgovoru, a dodir ga pušta u video aplikaciji telefona.
- **MMS u inostranstvu:** MMS čeka kod operatera dok ga telefon ne preuzme preko mobilnih podataka, koji u
  inostranstvu mogu koštati. **Postavke** → **Telefon i SMS** → **SMS** → **MMS** ih preuzima odmah, ali, ako to ne
  uključite, ne u romingu: tada se jedan pojavi u svom razgovoru kao **MMS** s veličinom i **Preuzmi (može
  koštati)**, i ispod **MMS**, za broj koji još nema razgovor. Potpuno isključeno, svaki MMS čeka dodir.
- **Gdje ste:** **+** → **Lokacija** šalje gdje ste kao SMS s geo: adresom i OpenStreetMap linkom, koji otvara svaki
  telefon. Geo: adresa, ili link OpenStreetMapa, Google Mapsa, Apple Mapsa ili Wazea, u SMS-u koji stigne prikazuje se
  kao mjesto, za otvaranje u aplikaciji za karte; kratak link ostaje link, jer bi se morao preuzeti da bi se znalo
  mjesto.
- **Reakcije s iPhonea ili Google Messagesa:** kad neko bez Erevosa reaguje na vaš SMS, njegov telefon to šalje kao
  riječi, Liked “Vidimo se u 8” ili Reacted 😂 to “Vidimo se u 8”: razgovor to pokazuje kao 👍 ili 😂 ispod poruke koju
  navodi, posljednje s tim riječima, a ne kao zasebnu poruku; povučena (Removed a like from …) nestaje. Za sada se
  čitaju samo one napisane na engleskom; ona čija poruka nije nađena ostaje kako je stigla.
- **Prikvačene za vas:** zadržite prst na poruci i izaberite **Prikvači samo za mene** da je prikvačite iznad razgovora.
  SMS nemaju prikvačenih poruka: čuva se samo na ovom telefonu, šifrirana SMS podacima prostora, i druga osoba nikad ne
  sazna.
- **Više poruka:** zadržite prst na poruci i izaberite **Odaberi**, pa dodirnite druge: **Kopiraj** ih stavlja u jedan
  tekst, **Proslijedi** ih šalje kao jednu u nacrt drugog razgovora, a **Obriši** ih briše s telefona, s **Poništi**
  nekoliko sekundi.
- **Novi SMS:** u dijelu **SMS** liste razgovora, dugme dolje je **Novi SMS** i otvara samo to, i kada su Erevosovi
  razgovori uključeni.
- **Biranje primaoca:** pod **Novi SMS** dodirnite **Kontakti** da biste izabrali iz kontakata, uz pretragu, ili samo
  ukucajte: kontakti čije ime ili broj odgovara onome što kucate prikazuju se ispod polja, a dodir ga popunjava. Kontakt
  s više brojeva prikazuje po jedan red za svaki. Za grupu se svaki izabrani kontakt dodaje brojevima koji već postoje.
  To su kontakti telefona i, uz otključan Erevos, oni čuvani samo u Erevosu i vaši Erevos kontakti s brojem, nikad
  imena skrivenih razgovora. Kad su otvoreni samo SMS, prikazuju se samo kontakti telefona. Android prvo pita sme li
  Erevos da ih čita.
- **Grupni MMS:** pod **Postavke** → **Telefon i SMS** → **SMS** → **Novi SMS** upišite nekoliko brojeva odvojenih
  zarezima i dodirnite **Napiši**. Svaka poruka ide svima njima kao jedan MMS, pa i sam tekst, a njihovi odgovori
  stižu u isti razgovor, svaki s autorom. Svi u njemu vide svačiji broj, a telefonska kompanija vidi sve.
- **Dvije SIM kartice:** SIM kartica za slanje prikazuje se iznad polja za poruku; jednom dodirnite **Izaberi SIM
  karticu** da Erevosu dozvolite da ih vidi. Vaš izbor se čuva za taj broj; do tada Erevos odgovara preko SIM kartice
  na koju je stigla posljednja poruka. Svaka poruka prikazuje svoju SIM karticu.
- **SMS kasnije:** zadržite prst na okruglom dugmetu **Pošalji** iza polja i izaberite vrijeme, kao u razgovoru. SMS
  se prikazuje na kraju razgovora označen sa **Zakazano**; dodirnite ga da ga otkažete. Odlazi u to vrijeme, i kad je
  Erevos zatvoren i zaključan; ako je telefon tada isključen, čim se ponovo uključi i otključa. Do tada nije u SMS
  porukama telefona, gdje bi ga druge aplikacije vidjele, a telefonska kompanija ga nema. Čeka zaključan ključem samog
  telefona (Android Keystore), a ne lozinkom vašeg prostora, jer ga Android mora poslati dok je Erevos zaključan: to
  je zaštita koju svaki SMS ima kad se pošalje, jer poslani SMS ostaju u SMS porukama telefona. Samo tekst, na jedan
  broj.
- **Linkovi:** web adresa u SMS-u je podvučena i otvara se kao u razgovoru, kad je vidite cijelu.
- **Imena iz vaših kontakata:** na početku isključeno, pa se SMS brojevi prikazuju kao brojevi. **Imena**, iznad
  popisa u dijelu **SMS**, ih otključava (kao i **Prikazuj imena iz mojih kontakata** pod **Postavke** → **Telefon i SMS** → **SMS** →
  **Imena iz vaših kontakata**): imena koja kontakti vašeg telefona daju SMS brojevima i slike koje za njih imaju, ili
  inače one vaših kontakata koji se čuvaju samo u Erevosu, na popisu i u razgovoru. Ponovo dodirnite **Imena** za samo
  brojeve. Erevos ih samo čita da bi ih prikazao i ne čuva nikakvu kopiju.
- **Pošiljaoci s imenom:** SMS od imena umjesto broja, kao od banke, otvara se za čitanje, ali se na njega ne može
  odgovoriti.
- **Podsjeti me:** zadržite poruku za **Podsjeti me**: ide u **Razgovor sa sobom** s imenom razgovora, i podsjeti vas
  u vrijeme koje izaberete.
- **Poruke koje nestaju:** s Erevosom kao SMS aplikacijom, **Poruke koje nestaju**, ispod reda **Običan SMS**
  razgovora, briše njegove nove SMS-ove s ovog telefona toliko nakon slanja, ili čim Erevos ponovo radi. Drugi telefon
  ih zadržava: SMS se tamo ne može obrisati. Poruke koje su već ovdje ostaju.

### Šifrirani SMS kad ništa drugo ne radi

Kad relay, Nostr, telefoni u blizini i LoRa svi zakažu, tekst Erevos kontaktu s povezanim brojem može ići SMS-om,
šifrirano s kraja na kraj kao svaka Erevos poruka. Isključeno je dok ga ne uključite: za sve takve kontakte pod
**Postavke** → **Telefon i SMS** → **SMS** → **SMS kad ništa drugo ne radi** (**Uključi za sve kontakte**), ili za
jedan u **Detaljima** njegovog razgovora → **SMS kad ništa drugo ne radi**.

- **Koliko košta:** svaki SMS košta koliko kaže vaša tarifa. Kratak tekst zauzima 3 SMS-a, duži do 10; u inostranstvu
  SMS može koštati mnogo više.
- **Šta vidi mobilni operater:** koji je broj pisao kojem, kada i koliko SMS-ova, kao kod svakog SMS-a; nikad šta je
  napisano, jer to ide kao ista šifrirana poruka koju bi nosio relay.
- **Šta ide:** samo tekstovi i brisanja. Ne fotografije, datoteke, glasovne poruke, pozivi, reakcije ni oznake da je
  poruka stigla ili pročitana, ni tekstovi duži od oko 800 latiničnih slova (400 grčkih), ni prva poruka novom
  kontaktu, koja nosi ključeve. Te čekaju, označene **Na čekanju**, kao u [Kako Erevos bira put](#paths). Skriveni
  razgovori nikad ne idu SMS-om.
- **Oba telefona** trebaju {=Erevos} kao SMS aplikaciju, i broj kontakta povezan s njegovim razgovorom. Ti SMS-ovi su
  skriveni podatkovni SMS-ovi za Erevos, koje nijedna SMS aplikacija ne prikazuje, i ništa od njih ne ostaje u SMS
  porukama telefona.
- **Kojim je putem išla:** držite poruku: njen meni kaže **Poslano SMS-om** ili **Stiglo SMS-om**. **✓✓** stiže čim
  relay ili Nostr ponovo budu dostupni: nijedan SMS se ne vraća sam od sebe.

**Zašto:** SMS stiže do telefona bez ikakvog interneta, gdje god postoji mobilna mreža. Ali košta i govori mobilnom
operateru ko s kim razgovara, što Erevos inače skriva; zato je SMS posljednji put, i samo kad ga vi izaberete.

> Uključite ga samo za one do kojih morate doći ovako. Mobilni operater, i svako ko vidi njegove zapise, zna iz ovih
> SMS-ova da vaša dva broja razgovaraju, i kada.

### Održavanje reda u SMS porukama

- **Zadržavanje prsta:** na popisu zadržite prst na SMS razgovoru za ono što s njim možete: **Prikvači na vrh**,
  **Arhiviraj**, **Označi kao spam**, **Blokiraj** i **Obriši**, te **Dodaj u kontakte** za broj koji nije nijedan od
  vaših kontakata. U razgovoru **⋮** na vrhu prikazuje isto, a prvo **Traži u ovom razgovoru**, **Mediji, linkovi i
  fajlovi**, **Idi na dan** i **Izvezi razgovor** (pogledajte [Prvi koraci](#start)), a takav broj ima **Dodaj u
  kontakte** i ispod svog imena: novi kontakt s tim brojem.
- **Prikvačeno:** do 10 SMS razgovora ostaje na vrhu popisa, prikvačeno. **Otkvači** vraća jedan na njegovo mjesto.
- **Arhivirani razgovori:** izvan popisa, pod **Arhivirano** na vrhu početnog ekrana. Razgovor se sam vraća na popis
  kad od te osobe stigne novi SMS, ili s **Vrati iz arhive**.
- **Imena grupnih MMS-ova:** zadržite grupni MMS i izaberite **Imenujte ga ovdje** da mu date vaše ime, samo na ovom
  telefonu.
- **Ono što je razgovora:** ispod reda **Običan SMS**, razgovor ima **Izgled razgovora**, kao razgovor, i, s jednim
  brojem, **Obavijesti**: utišajte ga na neko vrijeme ili zauvijek, ili mu dajte vlastiti zvuk, ili nijedan. To
  vrijedi dok je prostor otvoren; kad je zatvoren, svaki SMS obavještava kako kažu postavke.
- **Otpad:** obrisani razgovor čeka u **Otpad** 30 dana, a zatim ga Erevos briše iz SMS poruka telefona. Do tada ga
  **Vrati** vraća na popis; **Obriši sada** i **Isprazni otpad** brišu odmah, zauvijek. SMS koji stigne nakon što je
  razgovor otišao u otpad ponovo se prikazuje na popisu. Samo SMS aplikacija smije brisati SMS poruke.
- **Spam:** filter koji radi samo na telefonu, po pravilima, i ništa nikud ne šalje. SMS s broja koji nije kontakt i
  kojem nikad niste odgovorili ide u **Spam** kad ima link s riječima koje pokušavaju prevariti, kao zadržani paket
  ili nagrada, ili jednu od riječi koje dodate pod **Postavke** → **Telefon i SMS** → **SMS** → **Filter spama**.
  **Označi kao spam** i **Nije spam** zauvijek odlučuju za neki broj. SMS koji uhvate vlastite riječi filtera (link s riječima koje pokušavaju prevariti, s telefonskog broja koji nije ni u jednom kontaktu telefona i kojem nikad niste odgovorili) stiže bez obavijesti i bez zvuka, jer telefon zna i te riječi; svaki drugi spam, po vašim riječima, vašim pravilima ili iz inostranstva, i dalje pokazuje „New message“, jer ta obavijest dolazi prije nego što se Erevos otvori, a ostatak filtera ostaje šifriran u prostoru. Broj koji ste označili kao **Nije spam** ili ga puštate da prođe također stiže tiho kad šalje takve riječi, osim ako je u kontaktima telefona. Kad je **Filter spama** isključen, svaki SMS ima svoju obavijest: telefon čuva samo je li filter uključen, kako kaže prostor otvoren posljednji.
  Svaki razgovor u **Spam**, u folderu i na vrhu razgovora,
  kaže zašto je tamo: broj je blokiran, vi ste ga označili, vaše pravilo navodi pošiljaoca, broj iz inostranstva, vaša
  riječ, ili link i koje riječi.
- **Slova koja liče:** prevarantska SMS poruka koja zamijeni slovo drugim slovom iz drugog pisma koje izgleda isto, poput ćirilične а u latiničnoj riječi, ili u riječ sakrije znak koji se ne vidi, ne prolazi filter: čita riječi kako izgledaju. Pošiljalac se nikad ne uspoređuje tako, jer pošiljalac koji liči na dopuštenog nije taj pošiljalac.
- **Pravila o pošiljaocima:** pod **Filter spama**, **Pošiljaoci** prima ime pošiljaoca, kakva šalju trgovine i banke
  (slova, bez dijakritičkih znakova i bez razlike velikih i malih), ili broj, gdje \`*\` znači bilo šta:
  \`+4470*\` je svaki broj koji tako počinje, \`1234*\` svaki kratki broj koji tako počinje, a s poznatim pozivnim
  brojem vaše zemlje, \`69*\` je i svaki broj \`+3069...\`. **U spam** šalje njihove poruke tamo; **Propusti** na njih
  ne primjenjuje pravila filtera, kao za vašu banku ili porodicu, iako broj koji ste označili kao spam, ili blokirali,
  i dalje ide tamo. **Šalji brojeve iz inostranstva u spam** šalje tamo svaki broj napisan s drugim pozivnim brojem
  zemlje od **Pozivni broj vaše zemlje**, koji Erevos uzima iz brojeva kojima odgovarate, a vi ga možete promijeniti.
  Broj napisan bez pozivnog broja je odavde. Dodirnite pravilo da ga uklonite.
- **Blokiranje:** **Blokiraj** u meniju razgovora, ili **Postavke** → **Telefon i SMS** → **SMS** → **Blokirani
  brojevi**, stavlja broj na Androidov vlastiti popis blokiranih brojeva: Android odbija njegove SMS i MMS poruke i
  pozive, a svaki prostor i aplikacija za telefon vide isti popis. Samo SMS aplikacija ili aplikacija za telefon smiju
  ga vidjeti i mijenjati.
- **Nacrti:** ono što upišete, a ne pošaljete, ostaje uz taj razgovor, a popis to prikazuje kao **Nacrt**. SMS koji
  nije mogao otići također tamo ostaje kao nacrt.
- **Brzi tekstovi:** držite **+** pored polja, ili izaberite **Brzi tekstovi** u njemu, za kratke riječi koje često
  pišete (Na putu sam, Zovem vas kasnije): dodir stavlja jedan u polje, da ode takav ili s još nečim. **Dodaj** čuva
  vaš, a držanje jednog ga uklanja; od tada je lista vaša, šifrovana uz SMS prostora, svaki prostor svoju.
- **Povlačenje SMS-a:** SMS koji pošaljete prvo čeka 5 sekundi na kraju razgovora: tada ga dodirnite da ga vratite u
  polje za poruku. **Postavke** → **Telefon i SMS** → **SMS** → **Povlačenje SMS-a** postavlja **Isključeno**, 5 ili
  10 sekundi. Kad napustite Erevos, odlazi odmah.
- **Koliko košta slanje:** duži SMS iznad polja pokazuje red s brojem znakova i u koliko SMS-ova ide: 160 znakova u
  jednom SMS-u, ili 153 u svakom dijelu dužeg, ali 70, ili 67, čim ima grčko malo slovo, akcent ili emoji.
  **Postavke** → **Telefon i SMS** → **SMS** → **Bez akcenata (jeftinije)** šalje običan SMS bez akcenata, a grčki
  velikim slovima, kako su pisali stari telefoni (ΚΑΛΗΜΕΡΑ), pa opet prima 160; ne onaj s emojijem, ni MMS.
- **Pošalji ponovo:** vaša poruka koja nije otišla, ili nije isporučena, to kaže: dodirnite je da je ponovo pošaljete.
  Zadržite prst na bilo kojoj poruci za **Proslijedi**, **Pošalji ponovo** i **Obriši**, s njenim riječima za
  označavanje i kopiranje; obrisana poruka ima i **Poništi**.
- **Proslijedi:** zadržite prst na poruci → **Proslijedi**, zatim upišite broj i dodirnite **Napiši**, ili izaberite
  kontakt pod **U Erevos razgovor**. Otvara se u tom razgovoru, da je tamo pročitate i pošaljete. Na broj ide i njena
  slika, kao MMS; u razgovor samo njene riječi.
- **Svaki prostor svoje:** prikvačeni i arhivirani razgovori, otpad, oznake spama i nacrti pripadaju prostoru,
  zapečaćeni njegovom lozinkom. Same SMS poruke ostaju u SMS porukama telefona: drugi prostor ih vidi onakve kakve
  jesu, a razgovor koji je ovdje u otpadu tamo se prikazuje dok se ne obriše s telefona.

### Na vašim povezanim uređajima

SMS poruke telefona mogu se prikazati i na [povezanim uređajima](#devices) ovog prostora: računaru, pregledniku,
tabletu. Tamo ih čitate i odgovarate, a telefon šalje odgovor kao SMS. Isključeno je dok ne uključite, na telefonu:
**Postavke** → **Telefon i SMS** → **SMS** → **I na mojim povezanim uređajima** → **Šalji moje SMS poruke i na moje
uređaje**.

- **Šta ide:** posljednjih 50 razgovora s popisa i iz **Arhivirano**, svaki sa posljednjih 50 poruka, end-to-end
  šifrirano kao sve što uređaji dijele. Starije, one u **Otpad** i u **Spam**, te fotografije ostaju na telefonu:
  poruka s fotografijom kaže **📷 Fotografija, na telefonu**. Imena idu samo dok ih telefon prikazuje (**Imena iz
  vaših kontakata**).
- **Odgovaranje:** ono što napišete na uređaju prikazuje se kao slanje dok ga telefon ne pošalje, s SIM kartice koju
  koristi za taj broj, a zatim je među porukama samog telefona. Ona koju telefon nije mogao poslati to kaže: dodirnite
  je da je ponovo pošaljete. Telefon šalje svaku samo jednom, i najviše 60 na sat s uređaja, da izgubljen uređaj ne
  bi mogao poslati poplavu SMS poruka; ona koja je čekala više od jednog dana ne odlazi.
- **Pročitano:** razgovor pročitan na uređaju označen je kao pročitan i na telefonu.
- **Obavijesti:** nova SMS poruka daje obavijest i na uređaju, kako kažu njegove postavke obavijesti.
- **Preko telefona:** SMS poruke dolaze i odlaze samo dok je ovaj prostor otvoren na telefonu, kao sve što ide preko
  telefona. Na uređaju su ekrani telefonski, bez onoga što radi samo telefon: brisanje, blokiranje, slanje kasnije,
  fotografije i pozivnice.
- **Svaki prostor svoje:** prekidač pripada prostoru. Mjesto skrivenih razgovora nikad ne šalje SMS poruke na uređaje.
- **Isključivanje:** **Zaustavi SMS poruke na mojim uređajima**, na telefonu, skida ih sa svih uređaja.

**Zašto:** samo telefon ima SIM karticu, pa samo telefon šalje i prima SMS poruke. Uređaji ih vide preko telefona,
end-to-end šifrirano kao ostalo, a telefonski operater ne vidi ništa više nego prije.

## Telefon {#phone}

Na Androidu Erevos može biti aplikacija za telefon: pod **Telefon** u meniju dodirnite **Postavke** → **Postavi Erevos
kao aplikaciju za telefon**. Svaki poziv se tada prikazuje na Erevosovom vlastitom ekranu za pozive, a tel: linkovi i
dugme za poziv na telefonu otvaraju Erevosovu tastaturu. **Telefon** se otvara i sa slušalice na vrhu početnog
ekrana, i ima vlastitu ikonu među aplikacijama telefona, **Telefon**, zelenu sa slušalicom na Erevosovom znaku, koja
otvara tastaturu. Svaka od njih, kao i tel: link, otvara ga kad je Erevos otključan: s lozinkom, nakon što je
upišete, osim ako se Telefon otvara bez nje (pogledajte Lozinka Erevosa, ispod). Do tada kartica na vrhu kaže
**Erevos nije aplikacija za telefon**; na malom telefonu prikazuje samo taj naslov, a dodir na njega otvara
**Postavke** Telefona.

- **Hitni pozivi:** hitni broj (112 ili broj vaše zemlje) poziva se odmah, bez pitanja za SIM: bira ga Android. Kad
  je Erevos zaključan, a Telefon iza lozinke, **Hitni poziv** na ekranu lozinke otvara Androidovu tastaturu za hitne
  pozive, bez lozinke.
- **Traži kontakte:** na vrhu Telefona upišite ime, broj ili dio jednog od njih: kontakti s brojem prikazuju se
  umjesto kartica, svaki broj u svom redu. Dodirnite jedan da ga pozovete, ili zadržite prst na njemu da ga stavite
  na tastaturu. Traži u kontaktima telefona i, kad je Erevos otključan, u onima koji se čuvaju samo u Erevosu i u
  vašim Erevos kontaktima s brojem; nikad u skrivenim razgovorima.
- **Kontakti dok birate:** dok kucate na **Tastaturi**, kontakti koje pronađe prikazuju se na listi iznad broja: onaj čiji
  broj sadrži otkucane cifre, ili čije ime počinje njima na slovima tipki, kao 2 za ABC (i ΑΒΓ). Svaka tipka pokazuje
  svoja slova na jeziku aplikacije. Dodirnite kontakt da biste ga pozvali, ili ga zadržite da biste njegov broj stavili na
  tastaturu. Na malom ekranu, gde iznad broja nema mesta, prvi se pojavljuje iznad tipki, a **još**, pored njega, nabraja
  ostale.
- **Ekran za pozive:** ko zove, ili koga vi zovete, s imenom i fotografijom koje mu daju kontakti vašeg telefona; dok
  je Erevos otključan, broj povezan s jednim od vaših Erevos kontakata prikazuje ime koje ste mu dali, kao i broj
  kontakta koji se čuva samo u Erevosu; broj kontakta otvorenih skrivenih razgovora, samo dok su otvoreni. Prikazuje
  se preko zaključanog ekrana i ne treba mu lozinka, jer se na poziv mora moći odgovoriti dok je Erevos zaključan.
  Dolazni poziv prikazuje **Answer**, **Decline** i **Message**, a Android zvoni
  vlastitom melodijom kontakta; tipke za jačinu zvuka ga utišavaju. U pozivu: **Mute**, **Keypad** za tonove koje
  traži neki meni, **Speaker**, **Hold**, **Add call** i **End**. Kad je telefon na uhu, ekran se gasi.
- **Kuda ide zvuk:** s Bluetooth uređajem ili slušalicama, dugme pored **Keypad** kaže kuda ide zvuk, a dodir vam
  omogućava da izaberete: telefon, zvučnik, slušalice ili Bluetooth uređaj.
- **Drugi poziv:** poziv koji stigne tokom poziva prikazuje **Hold and answer**, **End and answer** i **Decline**. Kad
  je poziv na čekanju, red ispod imena to kaže: dodirnite ga, ili **Swap**, da razgovarate s drugim. **Merge** spaja
  ta dva u jedan poziv, kad to vaša telefonska kompanija dozvoljava.
- **Konferencijski poziv:** kad se pozivi spoje, ekran poziva umjesto fotografije prikazuje osobe u njemu. Pored
  svake, **Odvoji** vam daje da razgovarate samo s njom dok ostali čekaju na čekanju, a **Prekini** izbacuje samo
  nju; svako se prikazuje samo gdje operater to dozvoljava.
- **Video pozivi preko operatera:** gdje ih SIM kartica i mreža podržavaju (ViLTE, preko 4G ili 5G), dolazni video
  poziv prikazuje **Javi se s videom** i **Samo zvuk**; u pozivu se druga strana vidi preko cijelog ekrana, a vaša
  kamera u uglu, s **Isključi kameru** i **Promijeni kameru**. Poziv bez videa prikazuje **Video** kad obje strane
  mogu, a kad druga strana zatraži, Erevos vas pita: **Uključi video** ili **Ostani na zvuku**. Da pokrenete jedan,
  upišite broj i dodirnite **⋯** → **Video poziv**. Android jednom traži kameru. Kao svaki telefonski poziv, prenosi
  ga operater i može ga vidjeti; ništa od ovoga se ne prikazuje gdje mreža nema video pozive.
- **Odbijanje porukom:** **Message**, na pozivu koji zvoni, odbija ga brzim odgovorom, ili onim koji napišete, a vaš
  telefon ga šalje pozivaocu kao SMS; prikazuje se među vašim SMS porukama. Pod **Telefon** → **Postavke**, **Brzi
  odgovori** ih mijenja: **Dodaj odgovor**, **Ukloni**, **Sačuvaj** i **Koristi uobičajene odgovore**. Čuvaju se na
  telefonu, nezapečaćeni, jer ih ekran za pozive prikazuje dok je Erevos zaključan.
- **Tastatura:** pod **Telefon** upišite broj i dodirnite **Pozovi**; zadržite **0** za +. Kad zadržite prst na
  polju za broj, ono lijepi broj. **Add call**, tokom poziva, otvara tastaturu kad je Erevos otključan.
- **Govorna pošta:** s praznom tastaturom zadržite **1** (označeno oo) da pozovete govornu poštu, preko SIM kartice
  izabrane iznad **Pozovi**. Ako SIM kartica nema broj govorne pošte, Telefon to kaže: daje ga operater. Gdje
  operater šalje poruke kao snimke (vizuelna govorna pošta), **Govorna pošta** se pojavi pored **Favoriti**: svaka
  poruka s tim ko ju je ostavio, kada, koliko traje i njenim riječima kad su stigle. **▶** je pušta, **■** je
  zaustavlja; dodir na red nudi **Uzvrati poziv**, **Pošalji SMS** i **Obriši ovu poruku**. **Pozovi govornu poštu**
  na vrhu je poziva. Erevos ih pušta iz Androidove memorije i ne čuva kopiju; dok je Erevos zaključan, kartica se ne
  pojavljuje.
- **Brzo biranje:** s praznom tastaturom zadržite tipku od 2 do 9 da pozovete njen broj. Tipka bez broja vam da da
  izaberete: upišite ime ili broj i dodirnite kontakt, ili **Koristi** upisani broj. Pod **Telefon** → **Postavke**,
  **Brzo biranje** pokazuje osam tipki; dodirnite jednu da je promijenite ili ispraznite. Brzo biranje se čuva
  šifrovano u prostoru i radi kad je Erevos otključan.
- **Postavke poziva:** pod **Telefon** → **Postavke**, **Postavke poziva** otvaraju Androidove vlastite ekrane za
  ono što operater čuva o pozivima svake SIM kartice: **Preusmjeravanje, čekanje i vaš broj** i **Broj govorne
  pošte**; s dvije SIM kartice prvo dodirnite SIM. Pod **Pitaj operatera** svako dugme bira kod mreže (**Provjeri**
  preusmjeravanje \`*#21#\`, **Isključi sve** \`##002#\`; poziv na čekanju \`*#43#\`, **Uključeno** \`*43#\`,
  **Isključeno** \`#43#\`; prikaz vašeg broja \`*#31#\`), a odgovor se prikaže u poruci Androida. Da sakrijete broj
  samo za jedan poziv, upišite \`#31#\` ispred broja.
- **Dvije SIM kartice:** iznad **Pozovi** dodirnite SIM karticu preko koje zovete; prvi put **Izaberi SIM karticu**
  traži od Androida da Erevosu dozvoli da ih vidi. Broj koji pozovete bez izbora pita **Pozovi preko** koje. Erevos
  za svaki broj čuva SIM karticu koju ste koristili, zapečaćenu u prostoru, i sljedeći put zove preko iste. Ekran za
  pozive navodi SIM karticu svakog poziva.
- **Pozivi:** pod **Telefon**, **Nedavni** navodi Androidovu historiju poziva, najnovije prve, pod svakim danom: ko,
  kakav je bio poziv, preko koje SIM kartice i kako. **Svi**, **Propušteni**, **Dolazni**, **Odlazni** i, kad je neki
  poziv blokiran, **Blokirani** ih filtriraju; s dvije SIM kartice, **SIM 1** ili **SIM 2** zadržava pozive te SIM
  kartice. Uzastopni pozivi s istim brojem prikazuju se jednom, s brojem poziva. **☏** uzvraća poziv; dodir na red
  prikazuje njegove pozive, koliko je koji trajao, te **Pozovi** (s dvije SIM kartice, po jedno za svaku), **Pošalji
  SMS**, **Dodaj u kontakte** za broj koji nije nijedan od vaših kontakata, i **Izmijeni broj prije poziva**. Kad se
  tamo vide, propušteni pozivi nestaju iz Androidove obavijesti, a ta obavijest otvara **Nedavni**.
- **Brisanje poziva:** u pozivima reda, **Obriši ovaj poziv** (ili **Obriši ova 3 poziva**, za red od više njih)
  briše ih iz Androidove historije poziva, **Obriši** pored jednog od više njih briše samo taj, a **Obriši sve pozive
  s ovim brojem**, kad ih ima više, briše sve, i starije. Prvo se na nekoliko sekundi prikazuje **Poništi**; do tada
  su samo sakriveni.
- **Favoriti:** kontakti označeni zvjezdicom u kontaktima vašeg telefona, s njihovim fotografijama. Dodir poziva
  zadani broj kontakta, ili pita koji, kad ih ima više, a nijedan nije zadani; kad zadržite prst, prikazuje sve.
- **Više za broj:** čim se na tastaturi otkuca broj, **⋯** pored njega nudi **Dodaj u kontakte**, **Dodaj postojećem kontaktu** (otvore se tvoji kontakti: dodirni onaj kome ćeš dodati broj, ili napravi novi), **Pošalji SMS** i **Kopiraj broj**. U **Nedavnima** pozivi reda nude isto, te **Otvori kontakt** za broj koji je jedan od tvojih kontakata. U **Favoritima** drži pritisnut kontakt da vidiš njegove brojeve, svaki sa **Pošalji SMS** i **Kopiraj broj**, te **Otvori kontakt**. Dok je Erevos zaključan, Telefon samo zove i kopira broj: bez SMS-a, bez promjena u tvojim kontaktima. Svaka tipka, **Pozovi** i Enter na tastaturi kratko vibriraju; u **Postavke** → **Izgled** → **Vibracija na dodir** to isključuješ. Pogledajte [Izgled](#appearance).
- **Wi-Fi pozivanje i HD glas:** ekran za pozive to kaže ispod imena kad poziv ide preko Wi-Fi mreže ili s HD glasom,
  a **Nedavni** to kaže za svaki poziv.
- **Blokiranje:** pod **Telefon** → **Postavke**, **Blokiraj telemarketing** blokira pozive s brojeva koje neke zemlje
  drže za telemarketing: Francuska (01 62, 01 63, 02 70, 02 71, 03 77, 03 78, 04 24, 04 25, 05 68, 05 69, 09 48,
  09 49 i od 09 475 do 09 479, po odluci ARCEP-a 2022-1583), Španija (400, od 17. oktobra 2026), Čile (809), Indija
  (140) i Brazil (0303, koji pozivaoci tamo smiju izostaviti od avgusta 2025). Druge zemlje nemaju takve brojeve, ili
  Erevos nije siguran da ih imaju, pa se za njih ništa ne blokira. Pod **Brojevi koji počinju s** upišite početak
  dodatnih brojeva za blokiranje, s pozivnim brojem zemlje (+33 162) ili onako kako ga ovdje birate (0162), i
  dodirnite **Blokiraj**; **Ukloni** uklanja jedan. Ovo nikad ne blokira broj iz kontakata vašeg telefona. Blokirani
  poziv ne zvoni i ne ostavlja obavijest; prikazuje se u **Nedavni**, pod **Blokirani**. Android jednom pita smije li
  Erevos filtrirati pozive (**Dozvoli Erevosu da filtrira pozive**): bez toga blokirani poziv zazvoni na trenutak
  prije nego što ga Erevos prekine. Ono što je blokirano isto je u svakom prostoru, pa ništa ne govori o drugom, i
  čuva se na telefonu bez imena.
- **Blokirani brojevi:** pod **Telefon** → **Postavke**, **Blokirani brojevi** je Androidov vlastiti popis, isti kao
  **Postavke** → **Telefon i SMS** → **SMS** → **Blokirani brojevi**: upišite broj i dodirnite **Blokiraj**, ili
  dodirnite jedan da ga odblokirate. U **Nedavni** pozivi reda prikazuju **Blokiraj ovaj broj** ili **Odblokiraj ovaj
  broj**, s **Poništi**. Android odbija njihove pozive prije nego što zazvone, kao i njihove SMS i MMS poruke. Svaki
  prostor vidi isti popis.
- **Nepoznati brojevi i spam:** za broj koji nije među vašim kontaktima, ekran poziva ispod broja kaže odakle je
  (državu i zastavu, i grad fiksnog broja kad ga broj otkriva) i da li je mobilni, fiksni, besplatan ili skuplji
  poziv: pročitano samo iz broja, na telefonu. Pod **Telefon** → **Postavke**, **Lista spama** preuzima cijelu listu
  brojeva poznatih po spamu s https:// adrese koju upišete: jedan broj po redu s pozivnim brojem zemlje, ili početak
  brojeva i zatim \`*\`, pa kakvi su to pozivi. Erevos nema svoju; izaberite listu kojoj vjerujete. Bez Tora, server
  liste vidi internet adresu telefona, i Erevos to prvo kaže. Ekran poziva broja s liste prikazuje **Mogući spam**;
  **Spam pozivi bez zvuka** ih pušta da zvone bez zvuka (Android 10 i noviji), nikad poziv kontakta. U **Nedavnim**,
  **Prijavi kao spam** na broju koji nije među vašim kontaktima dodaje ga samo na ovom telefonu, a **Nije spam** ga
  uklanja; **Zaboravi moje prijave** ih briše. Nijedan broj se nikad nigdje ne traži. **Preuzimaj je ponovo svake
  sedmice** je ponovo donosi s iste adrese kad je stara sedmicu dana, s otključanim Erevosom, preko Tora kad je Tor
  put prostora uključen; isključeno je dok ga ne uključite.
- **Grupa kontakata na neko vrijeme:** pod **Telefon** → **Postavke**, **Blokiraj grupu kontakata** navodi grupe
  (oznake) kontakata vašeg telefona. **Blokiraj** pored jedne blokira pozive njenih kontakata **Na sat vremena**,
  **Do sutra ujutro** (7:00) ili **Dok ne ukinem blokadu**; red ispod grupe kaže do kada, a **Ukini** to završava
  ranije. Takav poziv blokira se kao i ostali: ne zvoni, a prikazuje se u **Nedavni**, pod **Blokirani**. Erevos samo
  čita grupe i čuva identifikator grupe i vrijeme, ne i njeno ime. Dok je grupa blokirana, ekran **Telefon** to kaže
  na vrhu, do kada, s **Ukini**.

**Zašto:** poziv se filtrira i dok je Erevos zaključan, pa ono što je blokirano ne može biti zapečaćeno unutar
prostora; a kad je isto za svaki prostor, ne pokazuje ništa ni o jednom od njih.

- **Lozinka Erevosa:** ekran **Telefon**, s tastaturom, pozivima i favoritima, iza nje je kao i ostatak Erevosa. Samo
  ekran za pozive nije, osim ako ne dozvolite da se Telefon otvara bez nje: pod **Telefon** → **Postavke**, **Otvaraj
  Telefon bez lozinke** (na početku isključeno, a prikazuje se samo dok Erevos ima lozinku). Dok je Erevos
  zaključan, ikona Telefona, tel: link i obavijest o propuštenom pozivu tada otvaraju tastaturu, **Nedavni** i
  **Favoriti**, koje Android čuva za svaku aplikaciju za telefon, samo s imenima iz kontakata telefona: nikad onih
  koji se čuvaju samo u Erevosu ili onih iz skrivenih razgovora, i bez SIM kartice sačuvane za neki broj. Tamo možete
  zvati, ništa više: bez brisanja, blokiranja, SMS-a ili dodavanja u kontakte. **Otvori Erevos** na vrhu prikazuje
  ekran za lozinku, kao i Erevosova vlastita ikona nakon što je Erevos bio u pozadini više od 30 sekundi, osim ako ga
  je u pozadinu poslao poziv upućen odatle. **Drži Telefon iza lozinke** to isključuje.
- **Ako Erevos ne postane aplikacija za telefon:** kao i kod SMS-a, Android 15 i noviji to može uskratiti aplikaciji
  instaliranoj iz preglednika. Pod **Postavke** dodirnite **Otvori zadane aplikacije** → **Aplikacija za telefon** →
  Erevos. Ako Android kaže da je to ograničena postavka, otvorite **informacije o aplikaciji Erevos**, dodirnite
  **⋮** gore desno → **Dozvoli ograničene postavke** i ponovo izaberite Erevos. **Dozvoli pozive i kontakte** se
  prikazuje dok Android još uskraćuje pozive, historiju poziva ili kontakte.
- **Nakon ponovnog pokretanja telefona:** dok prvi put ne otključate telefon, odgovara Androidov vlastiti ekran za
  pozive.
- **Šta je telefonski poziv:** običan telefonski poziv, kao i kod svake aplikacije za telefon: prenosi ga telefonska
  kompanija i može ga prisluškivati. Pozivi vašim Erevos kontaktima iz razgovora su nešto drugo: šifrirani s kraja na
  kraj, preko interneta.

## Kontakti {#contacts}

Na Androidu, **Kontakti** u meniju prikazuje kontakte telefona: one u Androidovim vlastitim kontaktima, koje koriste i
vaše druge aplikacije, pa nema ničeg za uvoz. Android jednom pita smije li ih Erevos čitati i mijenjati (**Dozvoli
kontakte**). Otvaraju se i s osobe na vrhu početnog ekrana, i imaju vlastitu ikonu među aplikacijama telefona,
**Kontakti**, ljubičastu s osobom na Erevosovom znaku, koja ih otvara iza Erevosove brave: s lozinkom, nakon što je
upišete.

- **Pronalaženje nekoga:** **Traži kontakte** traži u svakom polju: imenima, brojevima (kako god da su napisani, sa ili
  bez pozivnog broja zemlje), e-mail adresama, adresama, firmi, rođendanu i bilješci. **Favoriti** prikazuje samo
  kontakte sa zvjezdicom.
- **Kontakt:** dodirnite jedan da vidite sve o njemu. Dodirnite broj da ga pozovete, ili **SMS** pored njega da mu
  pišete u Erevosu; dodirnite e-mail ili adresu da je otvorite. **Dodaj u favorite** na vrhu daje mu zvjezdicu, u
  Androidovim kontaktima, pa ga i aplikacija za telefon navodi među favoritima.
- **Novi kontakt** i **Uredi:** ime i prezime, firma i radno mjesto, onoliko brojeva, e-mail adresa i adresa koliko
  vam treba, svaki sa svojom vrstom (**Mobilni**, **Kuća**, **Posao**, **Ostalo**), rođendan (dan/mjesec/godina, ili
  dan/mjesec) i bilješka. Novi kontakt čuva se **Samo na ovom telefonu** ili na nalogu s kojim telefon sinhronizuje
  kontakte (Google), kako izaberete. Ono što Erevos ne prikazuje od kontakta, kao što su posebni podaci druge
  aplikacije, ostaje kakvo je bilo.
- **Fotografija:** dodirnite sliku na vrhu kontakta za **Izaberi fotografiju** iz fotografija telefona, **Snimi
  fotografiju** kamerom ili **Ukloni fotografiju**. Izrežete je u kvadrat, a Erevos je ponovo iscrtava, pa se ne
  čuva ništa što je fotografija govorila osim same slike (mjesto, telefon). Čuva se s kontaktom u Androidovim
  kontaktima, gdje je telefon prikazuje kad ta osoba zove.
- **Melodija zvona:** na kontaktu, **Izaberi melodiju** otvara Androidov vlastiti birač, sa zvukovima telefona i
  onima koje ste dodali; telefon zvoni njome kad taj kontakt zove. **Zadana melodija zvona** tamo vraća vlastitu
  melodiju telefona.
- **.vcf datoteke:** **Uvezi iz .vcf datoteke** u meniju ekrana Kontakti čita vCard datoteku koju je sačuvao neki
  drugi telefon ili aplikacija (bilo koju njenu verziju, i one sa starih grčkih telefona) i čuva one kojih još nema na
  telefonu, s njihovim fotografijama i grupama, samo na ovom telefonu ili na nalogu. **Sačuvaj kao .vcf datoteku**
  tamo čuva prikazane kontakte (sve, favorite, grupu ili ono što je pretraga pronašla) kao jednu datoteku, u folderu
  koji izaberete; na kontaktu čuva samo taj jedan. Datoteka je izvan Erevosa i nije zapečaćena: svako ko je ima može
  pročitati kontakte.
- **QR kodovi:** **QR kod** na kontaktu prikazuje njegov vCard kao QR kod, koji kamera drugog telefona čita kao
  kontakt za dodavanje: njegovo ime, brojeve, e-mail adrese, adrese i bilješku, bez fotografije (duga bilješka ili
  mnogo adresa izostavljaju se da stane). Svako ko ga vidi može ga pročitati. **Pročitaj QR kod kontakta** u meniju
  čita kod s fotografije koju snimite ili izaberete, ovdje na telefonu, i s njim započinje novi kontakt, koji se čuva
  tek kad ga sačuvate. Nečiji Erevos QR kod započinje kontakt s njegovim {=Erevos} ID-om.
- **Duplikati:** **Pronađi duplikate** u meniju navodi kontakte koji izgledaju kao ista osoba sačuvana dvaput: isto
  ime (njegove riječi bilo kojim redom), broj ili e-mail. **Spoji** zadržava najpotpuniji od njih, sa svim brojevima,
  e-mail adresama i adresama ostalih, njihovim bilješkama, i njihovom fotografijom, melodijom, zvjezdicom i grupama
  kad on to nema, a ostale briše; **Spoji sve** to radi za svaki skup. **Nisu isti** skriva skup dok ponovo ne
  otvorite popis.
- **Rođendani:** dugme **Rođendani** ispod pretrage navodi kontakte s rođendanom, prvo sljedeći, s brojem preostalih
  dana i godinama koje osoba puni. **Podsjetnici za rođendane** u meniju (na početku isključeni) postavljaju obavijest
  ujutro na svaki od njih, od 9:00, čak i kad je Erevos zatvoren; na zaključanom ekranu kaže samo da je nečiji
  rođendan. To su samo rođendani kontakata telefona, nikad kontakata koji se čuvaju samo u Erevosu.
- **Kontakti sa SIM kartice** u meniju čita kontakte sa SIM kartica telefona i kopira one kojih još nema na telefonu
  (na početku su svi izabrani) u Androidove kontakte, samo na ovom telefonu ili na nalog. SIM kartica zadržava svoje.
- **Samo u Erevosu:** pod **Sačuvano u** novi kontakt može se umjesto toga čuvati **Samo u Erevosu**: zapečaćen u
  ovom prostoru kao i njegovi razgovori, nikad u Androidovim kontaktima, pa ga nijedna druga aplikacija ni nalog ne
  vide, a druge aplikacije prikazuju samo njegov broj; Erevosov ekran za pozive prikazuje njegovo ime dok je Erevos
  otključan. Na popisu ima lokot, a dugme **Samo u Erevosu** prikazuje samo njih.
  **Čuvaj samo u Erevosu** na kontaktu telefona premješta ga unutra, s fotografijom i zvjezdicom, i briše ga iz
  kontakata telefona; **Premjesti u kontakte telefona** ga vraća van. Njegova fotografija zapečaćena je s njim.
  Grupe, melodije zvona i podsjetnici za rođendane pripadaju Androidu, pa on ništa od toga nema. Poziv ili SMS prema
  njemu i dalje ide preko telefona i prikazuje se u zapisniku poziva i SMS porukama telefona kao i svaki drugi.
  Erevosova rezervna kopija sadrži te kontakte, zapečaćene.
- **U skrivenim razgovorima:** **Kontakti** na vrhu otvorenih skrivenih razgovora navodi njihove vlastite kontakte,
  koji se čuvaju samo tamo i zapečaćeni su s njima: ne prikazuju se nigdje drugdje, čak ni u kontaktima prostora, a
  ekran ne prikazuje ništa kad se skriveni razgovori zatvore. Novi kontakt tamo je uvijek njihov. Kontaktu se može dati
  fotografija, jer skriveni razgovori ostaju otvoreni dok je birate ili snimate. Njihov meni ima samo ono što je
  njihovo: **Uvezi iz .vcf datoteke** zadržava kontakte iz datoteke s njima, zapečaćene, nikad u kontaktima telefona;
  **Sačuvaj kao .vcf datoteku** čuva prikazane, ili jedan na njegovoj kartici, u folderu koji izaberete (izvan
  Erevosa i nešifrirano); **Pročitaj QR kod kontakta** započinje jedan od njihovih kontakata. {=Erevos} ID upisan ili
  pročitan tamo dodaje osobu u skrivene razgovore, nikad u razgovore prostora. Poziv nekom od njih preko aplikacije
  za telefon zatvara skrivene razgovore kad je {=Erevos} van ekrana više od 30 sekundi, i prikazuje se u njenom zapisniku
  poziva.
- **{=Erevos} ID:** {=Erevos} ID kontakta je link za kontakt koji prikazuje njegov {=Erevos}, pod **Kopiraj moj link za
  kontakt** ili kao njegov QR kod. Na kartici kontakta, ili pod **{=Erevos} ID** kad ga pišete, zalijepite ga ili ga
  pročitajte sa **Snimi QR kod** ili **Izaberi fotografiju QR koda**: **Dodaj u Erevos** (ili **Sačuvaj**) dodaje
  osobu u vaše Erevos razgovore, koji se otvaraju s njom, i povezuje kontakt s njom, a razgovor preuzima ime kontakta
  ako nema vlastito. Kontakt koji je Erevos kontakt prikazuje početak njegovog ključa kao **{=Erevos} ID**.
- **{=Erevos} kontakti:** kontakt koji je ista osoba kao jedan od {=Erevos} kontakata vaših razgovora prikazuje se s njim
  kao jedna kartica: preko broja povezanog s njim u Erevosu, preko njegovog {=Erevos} ID-a, ili sa **Izaberi iz mojih
  {=Erevos} razgovora** na njegovoj kartici, veza zapečaćena u prostoru, nikad u Androidovim kontaktima (**Nije ovaj
  {=Erevos} kontakt** to poništava). Kartica tada ima **Poruka**, **Pozovi** i **Video**, šifrirano s kraja na kraj
  preko Erevosa umjesto preko telefonske kompanije. Kontakt iz razgovora koji nije nijedan kontakt ima vlastitu
  karticu, sa štitom, gdje **Dodaj u kontakte** pravi kontakt, a **Poveži s jednim od mojih kontakata** ga povezuje s
  onim koji imate, čija ga kartica tada prikazuje; dugme **{=Erevos} kontakti** navodi ih sve. {=Erevos} kontakt bez
  vlastitog imena preuzima ime kontakta povezanog s njim, kad se povežu ili kad se otvori kartica tog kontakta; ime
  koje ste mu dali u Erevosu ostaje, a ono koje ste ispraznili tada se vraća iz kontakta. U skrivenim razgovorima to
  su vlastiti kontakti skrivenih razgovora, a njihov razgovor se otvara tamo.
- **Pozivi i poruke:** kartica kontakta navodi njegove posljednje pozive iz zapisnika poziva telefona, njegove SMS
  poruke i njegove poruke u Erevosu, najnovije prve; dodirnite jedno da uzvratite poziv, napišete SMS ili otvorite
  razgovor. Pozivi se prikazuju kad dozvolite Erevosu da čita zapisnik poziva (**Prikaži pozive**). Erevos ih samo
  čita da bi ih prikazao i ne čuva nikakvu kopiju.
- **Druge aplikacije:** **Dodaj u kontakte** druge aplikacije (broj u aplikaciji za telefon, e-mail u pošti) može se
  otvoriti u Erevosu: novi kontakt s onim što je ta aplikacija dala, ili popis na kojem dodirnete kontakt kojem to
  dodajete. Aplikacija koja prikazuje ili mijenja kontakt može ga i otvoriti u Erevosu, iza Erevosove brave. Android
  pita koju aplikaciju da koristi; izaberite Erevos. Aplikacija koja traži da izaberete kontakt, ili broj, e-mail ili
  adresu, dobija samo onaj koji dodirnete, iz kontakata telefona: oni koji se čuvaju samo u Erevosu tamo se nikad ne
  prikazuju.
- **Obriši** uklanja kontakt s telefona, sa svakog naloga na kojem se čuva; kontakt koji se čuva samo u Erevosu, iz
  Erevosa.
- **Grupe:** **Grupe** u meniju ekrana Kontakti (tri tačke) navodi Androidove vlastite grupe, kao što su Porodica ili
  Posao, s brojem članova u svakoj, i pravi nove. Otvorite jednu za **Dodaj kontakte**, uklonite kontakt sa **×**,
  **Preimenuj** je ili **Obriši grupu** (njeni kontakti ostaju). Na kontaktu, **Izaberi grupe** ga stavlja u grupe ili
  vadi iz njih. Dugmad ispod pretrage prikazuju kontakte jedne grupe. Grupa se čuva na nalogu, kao i njeni kontakti:
  kontakt ulazi u nju samo ako se čuva i na tom nalogu.

## Zaključavanje lozinkom {#lock}

Pod **Postavke** → **Privatnost i sigurnost** → **Zaključavanje i druga lozinka**, **Zaključavanje pri otvaranju
Erevosa** ima dva izbora: **Bez zaključavanja** i **Lozinka**.

1. Dodirnite **Lozinka**, upišite je dvaput (najmanje 4 znaka) i dodirnite **Sačuvaj**.
2. Od tada Erevos traži lozinku svaki put kad se otvori, i ponovo nakon 30 sekundi u pozadini.
3. **Promijeni lozinku** je mijenja, a **Zaključaj sada** odmah zaključava Erevos.

- **Rečenica, ne kratak PIN:** ono što proverava lozinku čuva se u skladištu ključeva telefona, pa kopija memorije
  nije dovoljna za isprobavanje lozinki. Ali ko probije bezbednost samog telefona, kao što to rade forenzički alati na
  nekim telefonima, mogao bi da pogađa na svojim računarima, a PIN od 6 cifara, milion kombinacija, pada za nekoliko
  dana. Rečenica od 4 ili 5 reči ne. Ispod kratke nove lozinke, ili PIN-a skrivenih razgovora, Erevos to kaže, i
  prihvata je tek posle **Ipak koristi**. Ko ima rezervnu kopiju i njenu lozinku može iste pokušaje da radi na njoj:
  tamo je kratak PIN najslabiji.
- **Zaključan, a i dalje prima:** kad se Erevos zaključa, ekran za lozinku dolazi ispred otvorenog prostora, koji
  nastavlja raditi iza njega: poruke i pozivi i dalje stižu, sa svojim obavijestima, a poziv se prikazuje preko
  ekrana za lozinku. Njegovi ekrani se zatvaraju, i skriveni razgovori, a ekran za pozive više ne prikazuje imena
  njegovih kontakata. Njegova lozinka ga ponovo otvara; lozinka drugog prostora ga prvo zatvara, ne zadržavajući ništa
  od njega u memoriji.
- **Samo SMS-ovi:** kad je Erevos zaključan, ikona SMS-a, dugme **SMS** na widgetu i obavijest o novom SMS-u i dalje
  traže lozinku, ali zatim otvaraju samo SMS-ove: popis SMS razgovora telefona, svaki u svom redu, same razgovore,
  **Arhivirano**, **Spam** i **Otpad**, te **Novi SMS**. Ništa drugo od prostora se ne vidi. Sve ostalo, kontakt,
  razgovor, **Postavke**, sama ikona Erevosa ili narandžasti lokot **Otključaj sve** na vrhu, ponovo traži lozinku, a
  zatim otvara cijeli prostor. Tako se kod koji je stigao SMS-om može pročitati s nekim pored vas, a ostatak Erevosa
  ostaje zatvoren.
- **Samo kontakti:** na isti način, ikona Kontakata, dugme **Kontakti** na widgetu i obavijest o rođendanu traže
  lozinku, a zatim otvaraju samo kontakte: njihov popis, karticu kontakta (bez vaših razgovora i poziva s njim),
  **Uredi**, grupe, duplikate, SIM karticu i uvoz. **Pozovi** i dalje otvara birač brojeva telefona. Razgovor, SMS,
  **Postavke** ili narandžasti lokot **Otključaj sve** na vrhu ponovo traži lozinku, a zatim otvara cijeli prostor.
  Druga ikona, widget ili obavijest, kad su otvoreni samo SMS-ovi ili samo kontakti, traži lozinku kao kad je Erevos
  zaključan, a zatim otvara ono što označava: ikona Kontakata samo kontakte, ikona SMS-a samo SMS-ove, sama ikona
  Erevosa cijeli prostor.

- **Vidjeti šta kucate:** svako polje za lozinku, PIN ili token, ovdje i svuda u Erevosu, ima oko na kraju: dodirnite
  ga da vidite šta kucate, i ponovo da se sakrije. Ponovo je skriveno svaki put kad se polje iznova pojavi, a na
  Androidu se od tastature traži da to ne pamti.
- **Pogrešne lozinke:** nakon 5 pogrešnih pokušaja, svaki sljedeći vas tjera da čekate, prvo 30 sekundi, a svaki put
  dvaput duže, do jednog sata. Broj pokušaja ostaje i nakon ponovnog pokretanja. Čekanje se mjeri vlastitim satom
  telefona od njegovog uključivanja, koji niko ne može postaviti, pa ga pomjeranje datuma i vremena unaprijed ne
  prekida; ako se telefon isključi i ponovo uključi tokom čekanja, čeka ponovo od početka, jer se vrijeme koje je već
  proteklo ne može znati. U web-aplikaciji i na računaru ide isto dok god Erevos ostaje otvoren, a počinje ponovo od
  početka kad se Erevos opet otvori.
- **Šta je zapečaćeno:** kontakti svakog prostora, ključevi njegovih razgovora, njegove poruke, postavke relaya i
  izgled čuvaju se na telefonu zapečaćeni ključem koji otvara samo njegova lozinka.
- **Popis odmah:** početni ekran čuva zapečaćenu kopiju svojih prvih redova, pa se popis prikaže čim se prostor
  otvori, a zatim se ažurira. Uvijek je iste veličine, pa nikome ne govori koliko ima razgovora ni koji se prostori
  koriste, i nikad ne sadrži ono što je rekla poruka koja nestaje.

**Zašto:** svaka isprobana lozinka namjerno košta vremena i mnogo memorije (PBKDF2, zatim Argon2id), kako onaj ko
kopira ono što telefon čuva ne bi mogao brzo isprobavati lozinke; a neko ko drži telefon čeka duže nakon svakog
pogrešnog pokušaja. Brojač je jedan za cijeli telefon, čuva se i nakon ponovnog pokretanja, jer ekran za lozinku
dolazi prije nego što se otvori bilo koji prostor, a čekanje se mjeri tamo gdje ga pomjeranje sata ne može skratiti.

> Ne postoji način da se vrati zaboravljena lozinka: ne čuva se ništa što bi moglo otvoriti podatke bez nje. Samo
> otisak prsta ili lice, dok je uključeno, i dalje otvara prvi prostor (pogledajte ispod).

### Snimci ekrana

S uključenim zaključavanjem lozinkom, Android drži Erevos izvan snimaka ekrana, snimanja ekrana i nedavnih aplikacija:
tamo je posljednji ekran Erevosa prazan, pa onaj ko na trenutak drži otključan telefon u njemu ne vidi vaše razgovore.
Pod **Postavke** → **Privatnost i sigurnost** → **Snimci ekrana**, **Isključi** ponovo omogućava snimke ekrana (da
pošaljete neki, na primjer), a **Uključi** vraća zaštitu. Dok je uključena, i skriveni
razgovori ostaju izvan njih, čak i u prostoru bez zaključavanja lozinkom; isključena, snimci ekrana rade i u njima.
Postavka pripada telefonu i ista je u
svakom prostoru. Na računaru i u web-aplikaciji ne postoji.

**Zašto:** bez nje, posljednji ekran Erevosa ostaje kao slika među nedavnim aplikacijama dok se Erevos ponovo ne
otvori, pa skriveni razgovori uvijek ostaju izvan, da se nikad tamo ne prikažu bez svog PIN-a. Postavka je ista u
svakom prostoru kako ne bi ništa govorila o tome koji se prostor otvorio.

### Otisak prsta ili lice

Na Androidu 11 i novijem, s otiskom prsta ili licem podešenim u postavkama telefona, Erevos se može otvarati i njime.
Isključeno je dok to ne uključite.

1. S uključenim zaključavanjem lozinkom, pod **Otisak prsta ili lice** dodirnite **Uključi**.
2. Upišite lozinku prostora u kojem ste, dodirnite **Uključi** i dodirnite senzor (ili pogledajte telefon).
3. Od tada ekran za lozinku ima dugme **Otisak prsta ili lice**. Lozinka uvijek radi, a
   **Isključi** to isključuje.

- **Samo prostor prve lozinke:** otisak prsta nikad ne otvara prostor druge lozinke, ni skrivene razgovore. Uključen
  u prostoru koji otvara druga lozinka, ne otvara ništa: prvi put kad se isproba, sam se isključuje, a lozinka otvara
  Erevos. Postavka izgleda isto u svakom prostoru.
- **Pod prisilom:** neko ko vas drži može vam pritisnuti prst na telefon, ili ga prinijeti vašem licu. Ako se to može
  desiti, držite ovo isključenim: tada mu treba lozinka, a vi mu možete dati drugu.
- **Kako se čuva:** ključ prvog prostora zapečaćen je ključem u sigurnom hardveru telefona (Android Keystore) koji
  radi samo odmah nakon jake provjere otiska prsta ili lica, jednom za svaku upotrebu. Dodavanje ili uklanjanje otiska
  prsta ili lica tjera Android da odbaci taj ključ: tada se ovo isključuje, i ponovo ga uključujete. Ništa ne napušta
  telefon.
- **Koje lice:** lice se računa samo tamo gdje Android ocjenjuje svoje otključavanje licem kao jako, kao na Pixelu 8 i
  novijim; drugdje je to otisak prsta.
- **Pogrešne lozinke** se broje kao i prije: otisak prsta ne mijenja broj.
- **Ne na računaru ni na webu:** nudi se samo na Androidu. Isključivanje zaključavanja isključuje i ovo.

**Zašto:** prst je lakše iznuditi nego lozinku, a svako čiji prst ili lice telefon poznaje mogao bi ga koristiti, pa
nikad ne otvara prostor druge lozinke ni skrivene razgovore. Uključen u drugom prostoru, čuva ključ koji ne otvara
ništa, istog oblika, pa ono što je sačuvano ne pokazuje u kojem je prostoru uključen.

## Druga lozinka {#second}

Ako vas neko prisili da otvorite Erevos, upišite drugu lozinku umjesto svoje. Ona otvara zaseban, prazan Erevos s
vlastitim kontaktima, relayem i izgledom. Vaši pravi razgovori ostaju skriveni, i ništa u aplikaciji ne pokazuje da
postoje.

1. S uključenim zaključavanjem lozinkom dodirnite **Postavi drugu lozinku**.
2. Upišite je dvaput i dodirnite **Sačuvaj**. Mora se razlikovati od vaše vlastite lozinke.

- **Izgled:** drugi prostor počinje s izgledom prostora u kojem je postavljen, kako se ne bi isticao.
- **Jedna po jedna:** ponovno postavljanje druge lozinke zamjenjuje prethodnu. **Ukloni drugu lozinku** je uklanja.
- **Iz pretrage:** u otvorenom prostoru upiši lozinku drugog prostora u **Traži razgovore** i pritisni Enter: otvoreni
  prostor se zatvara, ništa od njega ne ostaje, i otvara se drugi, kao sa **Zaključaj sada** i njegovom lozinkom.
  Traje jednako dugo što god upišeš, pa vrijeme ne pokazuje postoji li drugi prostor. Pogrešna lozinka, ili lozinka
  otvorenog prostora, samo je pretraga; lozinka za paniku radi samo na ekranu lozinke.
- **Premještanje razgovora tamo:** u **Detalji** razgovora dodirni **Premjesti u drugi prostor**, upiši lozinku drugog
  prostora i dodirni **Premjesti**. Razgovor ide tamo sa svojim porukama, imenom, slikom i izgledom, te razgovorima
  uvezenim u njega, šifriran ključem tog prostora, a taj prostor ostaje zatvoren. Sigurnosni broj ostaje isti, a
  telefonu te osobe odmah se javlja da od sada piše tamo. Stavka se vidi u svakom prostoru, a lozinka se provjerava kao
  u pretrazi: pogrešna, ili lozinka otvorenog prostora, ne premješta ništa. Razgovor s nekim s kim drugi prostor već ima
  svoj razgovor ostaje gdje jest. Tko pročita drugi prostor forenzičkim alatom mogao bi vidjeti da je razgovor došao
  odnekud drugdje: njegov kontakt ga i dalje zna po ključu ovog prostora.
  Ako taj prostor još nema relay, Erevos nudi relay ovog prostora: **Premjesti s relayem ovog prostora** premješta
  razgovor i daje tom prostoru ovaj relay da ga zadrži, a relay tada može znati da su oba prostora na jednom telefonu.
- **Diskrecija:** radi privatnosti, aplikacija nikad ne pokazuje je li postavljena druga lozinka. U web-aplikaciji s
  uključenim obavijestima dok je Erevos zatvoren, broj na ikoni Erevosa ostaje dok je Erevos zatvoren: ako se ne slaže
  s prostorom koji otvarate, može nagovijestiti drugi (**Broj na ikoni** to isključuje).

## Skriveni razgovori {#hidden}

Svaki prostor ima 4 mjesta za skrivene razgovore, od kojih se svako otvara samo vlastitim PIN-om, i nikad se ne
prikazuju među vašim ostalim razgovorima. Nigdje za njih nema dugmeta. Svako mjesto može sadržavati jedan razgovor ili
više njih, pa 2 prostora imaju 8 mjesta.

**Zašto:** svako mjesto već ima vlastiti PIN, pa razgovor sam na jednom mjestu ima vlastiti ključ, a mjesto može
sadržavati i više razgovora pod jednim PIN-om. Broj mjesta je fiksan iz dva razloga:

- **Da se ništa ne vidi.** Sva 4 mjesta postoje od prvog pokretanja, popunjena nasumičnim podacima dok se ne koriste.
  Onaj ko vas natjera da otvorite telefon, ili kopira ono što on čuva, ne može saznati imate li skrivene razgovore, ni
  koliko. S ključem za svaki razgovor, zapečaćene datoteke rasle bi sa svakim novim skrivenim razgovorom i odale bi
  koliko ih ima.
- **Da ostane brzo.** PIN upisan u pretragu isprobava se na svakom mjestu, a svaki pokušaj je namjerno spor
  (Argon2id, koji uzima mnogo memorije i vremena, kako se PIN-ovi ne bi mogli brzo pogađati). S 4 mjesta otvaranje
  ostaje kratko i uvijek traje jednako, pa ni vrijeme ne govori koliko se mjesta koristi.

Broj se kasnije može povećati bez ikakvog gubitka, uz cijenu malo sporijeg otvaranja; smanjenje bi obrisalo ono što
sadrže uklonjena mjesta.

1. Pokrenite mjesto na jedan od dva načina: pod **Postavke** → **Privatnost i sigurnost** → **Skriveni razgovori**
   izaberite od **Mjesto 1** do **Mjesto 4**, dodirnite **Postavi PIN skrivenih razgovora**, upišite ga dvaput i
   dodirnite **Sačuvaj**; ili otvorite **Detalji** razgovora, dodirnite **Premjesti u skrivene razgovore**, upišite
   PIN od 4 ili više znakova, dodirnite **Novi skriveni razgovori**, izaberite mjesto, a zatim **Pokreni i
   premjesti**. Zapamtite koja mjesta koristite: radi privatnosti, Erevos ne može reći koja su slobodna.
2. Da ih otvorite, upišite PIN u **Traži razgovore** na početnom ekranu i pritisnite Enter (tipku za pretragu na
   tastaturi). Ili zadržite prst na **Novi razgovor** trenutak: otvara se polje za PIN, uz kratku vibraciju na Androidu, isto u svakom prostoru;
   upišite ga i dodirnite **Otvori**. Otvara se samo mjesto s tim PIN-om. Pogrešan PIN je samo pretraga, ili samo
   zatvara polje: ništa se ne dešava.
3. Otvaraju se s naslovom **Skriveni razgovori**, s **Kontakti** i **Promijeni PIN** na vrhu, i navode svoje razgovore
   i grupe kao što početni ekran navodi vaše: najnovije prve, svaki s onim što je posljednje rečeno, kada i koliko ih
   nije pročitano. Dodirnite jedan da ga otvorite. Strelica nazad ih zatvara.
4. Da premjestite drugi razgovor na neko mjesto, otvorite njegove **Detalji**, dodirnite **Premjesti u skrivene
   razgovore**, upišite PIN tog mjesta i dodirnite **Premjesti**. Razgovor napušta vaš popis sa svojim porukama,
   imenom, slikom i izgledom, te razgovorima uvezenim u njega, a njegov sigurnosni broj ostaje isti. Telefonu te
   osobe odmah se javlja da od sada piše u skrivene razgovore; poruka koju pošalje upravo u tom trenutku možda neće
   stići.
5. Da vratite razgovor među razgovore prostora, otvorite ga u skrivenim razgovorima, zatim njegove **Detalji**,
   dodirnite **Vrati u moje razgovore** i **Premjesti**. Ide sa svojim porukama, imenom, slikom, izgledom i uvezenim
   razgovorima, a njegovom telefonu se javlja kamo da piše.

- **Relay, Nostr i telefoni u blizini:** skriveni razgovori imaju vlastiti red na relayu i vlastite ključeve. Dok su
  otvoreni, ili primaju i zatvoreni, stižu i do telefona kontakta u blizini, kao vaši ostali razgovori (pogledajte
  [Razgovor s telefonom u blizini](#nearby)), ali ih drugi telefoni nikad ne nose, i nikad ne idu preko LoRa ni SMS-om. Bez relaya, njihov link za kontakt kaže gdje čitaju na Nostru, s ključem samo tog mjesta, a
  tekstovi idu tamo, kao s telefona bez relaya; za fotografije, glasovne poruke, pozive i grupe potreban je relay. Dok
  su zatvoreni, njihove poruke čekaju na relayu, ili na Nostru dva dana, osim ako je uključeno **Primanje dok su
  zatvoreni**.
- **Primanje dok su zatvoreni:** prekidač na vrhu svakog mjesta. Kad je uključen, njegovi skriveni razgovori primaju
  kao i vaši ostali razgovori dok je prostor otvoren, bez obzira na to koji je ekran prikazan i s Erevosom u
  pozadini: njihovi kontakti odmah vide da je poruka stigla, obavijest kaže samo „New message“, na Androidu poziv zvoni
  s „Incoming call“ i bez imena (na ekranu poziva, **Javi se** ga prima bez PIN-a, na ekranu bez imena i lica, a skriveni razgovori ostaju zatvoreni; mali znak, PIN i **Poveži** ih otvaraju i tu odgovaraju), a podsjetnik iz njihovog Razgovora sa sobom prikazuje obavijest koja kaže samo **Reminder**. Ono što im
  stigne preko Nostra tada se također čita{+, a njihovi vlastiti Matrix, XMPP i Nostr računi ostaju povezani (pogledajte
  dolje)}. Poziv koji se završio prije nego što ste ih otvorili, ili je predugo zvonio, prikazuje se kao propušten. Ništa
  od njih se nigdje ne prikazuje dok ih PIN ne otvori. Novo mjesto počinje s ovim uključenim; mjesta postavljena ranije
  ostaju kakva su bila dok to ne uključite. Za to se ključ mjesta čuva šifriran s prostorom, među nasumičnim ključem za
  svako drugo mjesto, pa otvaranje prostora ne pokazuje koja mjesta primaju, ni koja su postavljena. Ali onaj ko otvori
  prostor i kopira ono što telefon čuva mogao bi otvoriti i to mjesto, bez PIN-a: PIN ih tada skriva od pogleda onoga ko
  drži telefon, ali ne i od forenzičkog alata. Kad je isključen, njihov ključ je samo iza PIN-a, a njihove poruke čekaju
  na relayu dok ih ne otvorite. Rezervne kopije zadržavaju prekidač.
- **Tačka za nepročitano:** uz uključeno **Primanje dok su zatvoreni**, prekidač ispod toga (isključen, osim ako ga
  uključite). Uključen, dok neki od razgovora ili grupa tog mjesta ima nepročitanu poruku{+, ili je neki od njegovih
  vlastitih Matrix, XMPP ili Nostr razgovora dobio poruku otkad ste ga zadnji put otvorili}, mala tačka se pojavi na
  lupi u **Traži razgovore** na početnom ekranu: nikad koliko, ni gdje. Nestaje čim ih pročitate. Ko vidi razgovore
  prostora vidi i nju, i može pretpostaviti da postoje skriveni razgovori. Mjesta koja imaju samo **Javi kad stigne
  poruka** nemaju tačku: prekidač bi se morao čuvati tamo gdje ga prostor može pročitati.
- **Zatvaraju se sami** kad je Erevos bio u pozadini više od 30 sekundi, kao što se vlastiti PIN razgovora ponovo
  zaključava, ali ne tokom poziva, ni dok za njih birate fotografiju ili datoteku ili snimate fotografiju.
- **Dok su otvoreni,** poruka koja stigne pušta zvuk za nove poruke, kao u vašim ostalim razgovorima. S Erevosom u
  pozadini prije nego što se zatvore, obavijest kaže „New message“ samo ako je za to mjesto uključeno **Primanje dok
  su zatvoreni** ili **Javi kad stigne poruka**.
- **Kao vaši ostali razgovori:** ono što sada ne može otići čeka, označeno s **Na čekanju**, samo preko njihovog
  relaya, ili preko Nostra bez relaya (pogledajte **Na čekanju** pod [Razgovor preko relaya](#relay)), **Pošalji
  kasnije** radi kao tamo, a razgovor izvezen iz druge aplikacije može se uvesti u detalje skrivenog razgovora
  (pogledajte [Uvezeni razgovori](#import)). I tamo se kontakt može dodati s fotografije njegovog QR koda, snimljene
  ili izabrane dok oni ostaju otvoreni. Svako mjesto ima vlastiti **Razgovor sa sobom**, prvi na svom popisu
  (pogledajte **Razgovor sa sobom i podsjetnici** pod [Prvi koraci](#start)).
- **Grupe:** **Nova grupa**, ispod njihovog popisa, pravi grupu s njihovim kontaktima, kao na početnom ekranu
  (pogledajte [Grupni razgovori](#groups)), a ona se prikazuje na njihovom popisu među njihovim razgovorima. Njeni
  članovi su samo kontakti tog mjesta, a onaj koga iz nje dodate kao kontakt postaje kontakt tog mjesta. Ono što se u
  njoj piše ide samo preko relaya tog mjesta, u vlastiti red tamo, nikad na telefon u blizini; dok je mjesto
  zatvoreno, čita se samo s uključenim **Primanje dok su zatvoreni**, a **Javi kad stigne poruka** ga ne broji. Njeni
  pozivi zvone samo dok su skriveni razgovori otvoreni: poziv započet dok su zatvoreni prikazuje se kao propušten.
  Grupa tamo nema vlastiti PIN, i nijedna nije javna.
- [+] **Matrix, XMPP i Nostr:** ispod njihovog popisa, **Matrix**, **XMPP** i **Nostr** otvaraju ekrane tih mreža
  (pogledajte [Matrix](#matrix), [XMPP](#xmpp) i [Razgovori s drugim Nostr aplikacijama](#nostr-chats)) za vlastite
  račune skrivenih razgovora, odvojene od računa prostora: Matrix račun i XMPP račun za prijavu, te Nostr ključ. Prijave
  i ključ čuvaju se šifrovani ključem skrivenih razgovora, i ništa od toga ne vidi se izvan skrivenih razgovora: njihovi
  razgovori su samo u popisu skrivenih razgovora i ne dodaju ništa broju na ikoni Erevosa ni popisu na početnom ekranu.
  Računi se povezuju dok su skriveni razgovori otvoreni, a i dok su zatvoreni ako je **Primanje dok su zatvoreni**
  uključeno, kao što primaju sami skriveni razgovori: tada poruka tamo prikazuje obavijest koja kaže samo „New message“,
  a na Androidu Matrix ili XMPP poziv zvoni s „Incoming call“ i bez imena i javlja se PIN-om kao i njihovi ostali
  pozivi; poziv na koji se ne odgovori na vrijeme prikazuje se kao propušten, a tako i XMPP grupni poziv koji stigne dok
  su zatvoreni. Kad je isključeno, računi se povezuju samo dok su skriveni razgovori otvoreni, a dok su zatvoreni ništa
  ne stiže. Njihovi razgovori zovu kao razgovori prostora, s vlastitog računa skrivenih razgovora; poziv na njega, dok
  su skriveni razgovori otvoreni, zvoni zvukom zvona telefona, i oni ostaju otvoreni dok ne završi. Njihov Matrix račun
  nema **Javi da je stigla poruka**.
- **Povezani uređaji:** ispod njihovog popisa, **Povezani uređaji** povezuje ove skrivene razgovore zasebno s istim
  mjestom na računaru ili u pregledniku, iznutra, odvojeno od prostora i njegovih povezanih uređaja: njihovi
  razgovori, poruke i vlastiti računi idu tamo, a ništa od toga se ne vidi u prostoru (vidi **Skriveni razgovori i
  druge lozinke** pod [Povezani uređaji](#devices)). Nepovezani, nalaze se samo na ovom telefonu.
- **Pregledi linkova** imaju vlastiti prekidač u detaljima skrivenog razgovora, za sve razgovore tog mjesta,
  isključen dok ga ne uključite (pogledajte **Pregledi linkova** pod [Razgovor preko relaya](#relay)).
- **Javi kad stigne poruka** (Android): na vrhu mjesta dok je **Primanje dok su zatvoreni** isključeno. Kad je
  uključeno, dok je mjesto zatvoreno obavijest kaže samo „New message“, ili koliko ih je stiglo, kao za ostale
  razgovore, s Erevosom u pozadini ili na ekranu, za svaku poruku jednom, i kad je Erevos bio zatvoren i ponovo
  pokrenut; ono što je stiglo dok je mjesto bilo otvoreno ne daje nijednu kad se zatvori. To što je vaša poruka
  stigla ili pročitana, kucanje i novi ključevi ne daju nijednu, kao ni poziv koji je zvonio (pogledajte **Zvonjava
  poziva kad su zatvoreni**); poziv koji nije zvonio računa se kao poruka. Poruka ili brisanje koje su drugi Erevos
  telefoni prenijeli do relaya (pogledajte **Prenose ih drugi telefoni** u [Razgovor s telefonom u blizini](#nearby))
  ne može reći šta nosi, jer telefoni koji ga prenose to ne smiju znati: računa se kao poruka, pa i brisanje
  prikazuje „New message“, a prva poruka razgovora može se računati kao dvije; a poruka poslana bez zvuka oglašava se
  kao i obično (pogledajte **Slanje bez zvuka**). Potrebni su **Primaj i zvoni** i **Javi da je stigla poruka** pod
  **U pozadini**, što prekidač kaže kad nisu uključeni, i relay koji čeka (od 18. oktobra 2026); relay od prije
  23. oktobra 2026 može samo reći da nešto čeka, pa se tada i za to prikazuje „New message“, jednom dok ne otvorite
  to mjesto. Za to prostor drži red na relayu za svako od svoja 4 mjesta, a oni koji se ne koriste prave se uzalud na
  istom relayu, pa otvaranje prostora ne pokazuje ni jesu li postavljeni skriveni razgovori ni koji, dok god koriste
  relay prostora; relay se pita samo koliko je poruka stiglo, jer ih broji po bajtu koji svaka nosi (pogledajte šta
  relay vidi, iznad), nikad se ne traže same poruke. Onaj ko vidi obavijest i ne nađe ništa novo u vašim razgovorima
  mogao bi pretpostaviti da ih ima još. Nakon što obrišete ili blokirate nekoga u mjestu, prva poruka nekoga novog,
  preko linka za kontakt ili QR koda mjesta, ne pravi nijednu: vidi se kad otvorite mjesto. Rezervne kopije ovo
  zadržavaju.
- **Zvonjava poziva kad su zatvoreni** (Android): ispod **Javi kad stigne poruka**, dok je **Primanje dok su
  zatvoreni** isključeno. Kad je uključeno, dok je mjesto zatvoreno, a Erevos u pozadini ili na bilo kojem ekranu,
  poziv od jednog od njegovih kontakata tjera telefon da zvoni i prikaže „Incoming call“ bez imena, kao što to radi
  poziv iz vaših ostalih razgovora. Na ekranu koji zvoni dodirnite **Javi se** ili mali znak, upišite PIN i dodirnite
  **Poveži** da se javite; **Odbij** zaustavlja zvonjenje. Ko dodirne **Javi se** bez PIN-a, ne stiže dalje od polja za
  PIN. Zvonjenje traje oko 45 sekundi. Potrebni su **Primaj i zvoni** pod **U pozadini**, što prekidač kaže kad nije
  uključeno, i relay koji čeka, a koristi vlastiti red na relayu za svako od 4 mjesta, pri čemu se oni koji ne zvone
  prave uzalud na istom relayu, isto kao i obavijest o porukama iznad, pa otvaranje prostora ništa ne
  odaje. Pozivalac samo zvoni na red tamo; sam poziv čeka u vlastitom redu razgovora dok ga PIN ne otvori. Kontakt
  kojeg ste obrisali i dalje može natjerati telefon da zvoni, ali poziv se nikad ne može povezati. Poziv upućen s
  povezanog računara zvoni samo dok su skriveni razgovori otvoreni. Rezervne kopije ovo
  zadržavaju.
- **Novi PIN za mjesto** (iz **Skriveni razgovori** u **Postavke**, ili **Novi skriveni razgovori**) pokreće ga
  prazno i zamjenjuje ono što je bilo u njemu. Da ih zadržite i promijenite samo PIN, otvorite ih i tamo koristite
  **Promijeni PIN**. Svaki PIN mora se razlikovati od ostalih i od lozinke koja otvara Erevos.
- **Pogrešni PIN-ovi u pretrazi** broje se odvojeno od onih na ekranu za zaključavanje: nakon pet, pretrage neko
  vrijeme prestaju pokušavati, tiho, a ekran za zaključavanje nikad ne čeka zbog njih.
- **PIN drži vani onoga ko uzme telefon,** a ne onoga ko kopira ono što on čuva: s forenzičkim alatom na otključanom
  ili rootanom telefonu PIN-ovi se mogu isprobavati bez čekanja. Svaki pokušaj košta Argon2id (mnogo memorije i
  vremena), ali PIN od 4 cifre je samo 10.000 pokušaja. Ako se toga bojite, koristite duži PIN ili nekoliko riječi.
- **Diskrecija:** svaki prostor ima sva 4 mjesta od početka, a ona koja se ne koriste popunjena su nasumičnim
  podacima koji izgledaju kao korišteni, a pretraga svaki put isprobava svako mjesto. Tako se ništa ne vidi o tome
  jesu li postavljeni ikakvi skriveni razgovori, ni koliko.

### Razgovor zaključan PIN-om {#chat-pin}

Razgovor ili grupa može imati vlastiti PIN, odvojeno od skrivenih razgovora: ostaje među vašim razgovorima, ali se
otvara samo svojim PIN-om.

1. Otvorite razgovor, dodirnite **⋮** na vrhu za njegove **Detalji**, a zatim **Zaključaj PIN-om** (u grupi: ime
   grupe na vrhu, a zatim **Zaključaj PIN-om**).
2. Upišite PIN od najmanje 4 znaka dvaput, a zatim **Zaključavanje**.

- **Otvaranje:** traži PIN. Ponovo se zaključava kad ga napustite, otvorite drugi razgovor ili je Erevos van ekrana
  više od pola minute (kao i zaključavanje lozinkom).
- **Iza PIN-a** se ništa od razgovora ne vidi: nijedna njegova poruka ne iscrtava se dok se ne upiše PIN, a sa
  staklom, pozadinom ili vlastitom scenom stila ekran za PIN leži na gustom mrazu koji ništa ne propušta.
- **Na popisu** prikazuje svoje ime s lokotom i **Zaključano PIN-om**, ništa od svojih poruka, ni u pretrazi, u
  **Poruke sa zvjezdicom** ni u **Uvezeni razgovori**. Obavijest kaže samo **New message**, kao za svaki razgovor.
- **Pogrešni PIN-ovi** broje se na telefonu, za sve razgovore odjednom i odvojeno od onih na ekranu za zaključavanje:
  nakon pet, sljedeći pokušaj čeka, svaki put duže.
- **Zaboravili ste PIN?** Ispod PIN-a, gdje prostor ima lozinku, **Zaboravili ste PIN?** ga uklanja lozinkom koja
  otvara prostor. Bez lozinke ništa ga više ne može otvoriti: brisanje kontakta je tada jedini način.
- **U skrivene razgovore:** razgovor koji premjestite u skrivene razgovore nosi svoj PIN sa sobom, koji tamo ništa ne
  traži, jer ih čuva vlastiti PIN skrivenih razgovora. Kad se vrati među razgovore, isti PIN ponovo se traži.
- **Da ga uklonite:** **Detalji** → ponovo **Zaključaj PIN-om**, i upišite njegov PIN.
- **Zna ga samo ovaj telefon,** a svaki povezani uređaj ima vlastiti. Rezervne kopije ga zadržavaju.
- **I {+na Matrixu, XMPP-u, Nostru i }u SMS-u:** {+razgovor na Matrixu, XMPP-u ili Nostru ima **Zaključaj PIN-om** na dnu,
  a }SMS razgovor {-ima **Zaključaj PIN-om** }ispod reda **Običan SMS**, i radi isto: na popisu njegovo ime s lokotom, nijedna njegova poruka u
  pretrazi, a lozinka prostora skida zaboravljeni PIN. **Blokiraj snimke ekrana** je pored, samo na ovom telefonu
  (Android): drugima se ne javlja. Razgovori skrivenog mjesta ne nude ni jedno ni drugo, jer ih čuva njihov PIN i
  izvan snimaka ekrana su dok su **Snimci ekrana** uključeni.

**Zašto:** neki razgovori trebaju ostati tamo gdje jesu, ali ne i biti otvoreni za onoga ko na trenutak drži
telefon. PIN se čuva samo kao njegov Argon2id, pa se ne može pročitati s telefona, a pogađanje je sporo. To je brava
na ekranu, a ne vlastiti ključ: poruke razgovora ostaju šifrirane s ostatkom prostora, a onaj ko kopira ono što
telefon čuva dok je prostor otvoren i dalje bi ih mogao pročitati. Za razgovor koji se ne smije ni vidjeti, koristite
skrivene razgovore.

## Zbirka {#collection}

Zbirka je šifrirano mjesto za vaše fotografije, datoteke i foldere, u svakom prostoru i u svakom skrivenom mjestu, svako sa svojom: ona prostora otvara se samo u prostoru, ona skrivenog mjesta samo u tom skrivenom mjestu, i ništa na telefonu ne govori da neko mjesto ima Zbirku. Njena ikona, dvije slike s sitnom lokotom, nalazi se na početnom ekranu lijevo od lokota i na vrhu razgovora skrivenog mjesta. To je modul, na Androidu, u aplikaciji za računar, u web aplikaciji i na Sailfish OS-u: **Postavke** → **Općenito** → **Moduli**.

- **Unutra:** kartice na vrhu: **Fotografije** u mreži po mjesecima, **Video snimci**, **Muzika** i ostali **Fajlovi** u popisima, svaka s folderima iznad koji imaju nešto njeno (**Fajlovi** i prazne). **+** snima fotografiju kamerom, koja ide direktno ovamo i nikad u galeriju, donosi datoteku iz datoteka telefona, do 4 GB, šifriranu dok se čita, bez kopije prije, ili pravi novi folder. Dugo pritisnite da odaberete više, da ih premjestite, pošaljete ili izbrišete; dugo pritisnite folder da ga preimenujete ili izbrišete, čime njegove datoteke ostaju.
- **Šifrirana:** svaka datoteka je šifrirana vlastitim ključem, u dijelovima sa slučajnim nazivima među dijelovima razgovora, pa ništa na telefonu ne razlikuje datoteku Zbirke od fotografije iz razgovora. Samo vlastiti katalog Zbirke, zapečaćen kao razgovori, kaže šta je šta. Zbirka ostaje izvan snimaka ekrana i zatvara se kad se prostor zaključa.
- **Traži ponovo:** gde prostor ima lozinku, Zbirka je traži svaki put kad se otvara, i ponovo kad je Erevos bio napušten duže od 30 sekundi, pre nego što išta pokaže; otisak prsta ili lice takođe rade gde otključavaju Erevos. Pogrešne lozinke se broje kao na ekranu zaključavanja. Zbirka skrivenog mesta ne traži ništa više, jer se skriveni razgovori zatvaraju čim napustite Erevos.
- **Iz razgovora ili druge aplikacije:** dugo pritisnite fotografiju ili datoteku u razgovoru, pa **Spremi u Zbirku**: kopira se u Zbirku mjesta tog razgovora. Iz Dijeljenja druge aplikacije, **Pošalji u** ima **Zbirku** prvu i pita u koji folder; ulazi kakva je stigla, već šifrirana, pa nikad ne leži nešifrirana na telefonu. Može imati do 4 GB; ona veća od 100 MB može ići samo u Zbirku, jer razgovor prima najviše 100 MB.
- **Iz Zbirke van:** fotografija se otvara preko cijelog ekrana, za listanje i zumiranje, s **Pošalji u razgovor**, **Spremi na telefon**, **Informacije** i **Izbriši**. Spremanje na telefon ili otvaranje datoteke drugom aplikacijom izvodi je nešifriranu, a Erevos to kaže unaprijed. Slanje u razgovor ostavlja kopiju u Zbirci. Iz Zbirke skrivenog mjesta datoteke idu samo u razgovore i grupe tog skrivenog mjesta, nikad u one prostora, a Zbirka prostora nikad u skriveno mjesto. Prevucite, ili koristite strelice, za sljedeću ili prethodnu fotografiju; **Projekcija slajdova** gore ih prikazuje jednu za drugom, svake 4 sekunde, do dodira.
- **Iz razgovora:** **+** ispod polja poruke, pa **Zbirka**, otvara Zbirku mjesta tog razgovora: dodirnite fotografije ili datoteke za slanje, pa **Pošalji**, i idu u taj razgovor.
- **Sigurnosne kopije:** sigurnosna kopija sadrži Zbirku s ostatkom telefona. **Postavke** → **Podaci i uređaji** → **Zbirka**, ili tri tačke u Zbirci, mogu ostaviti tu Zbirku izvan kopija napravljenih dok je otvorena: svaka Zbirka ima svoj izbor.
- **Na WebDAV serveru:** u podešavanjima Zbirke, **I na WebDAV serveru** kopira datoteke te Zbirke kakve jesu, i dalje šifrovane, u folder na serveru koji izabereš, Nextcloud, ownCloud ili bilo koji koji govori WebDAV: upiši adresu foldera, korisničko ime i, najbolje, lozinku za aplikaciju, pa dodirni **Poveži**; **Provjeri vezu** ih prvo provjeri. Svaki prostor i svako skriveno mjesto ima svoj izbor i svoj server; prvo se nudi server sigurnosnih kopija. Ide samo ono čega tamo još nema, dio po dio, dok je mjesto otvoreno, i nastavlja gdje je stalo kad mreža padne; datoteka obrisana ovdje briše se i tamo. Ništa drugo u folderu se ne dira. Server vidi samo dijelove sa nasumičnim imenima, u podfolderu sa nasumičnim imenom, i ne može ih otvoriti. Telefon kojem nedostaje datoteka, kao nakon sigurnosne kopije vraćene na novi telefon, uzima je odande kad je otvori, i čuva samo dijelove koji se otvaraju ključem datoteke. Erevos pokazuje koliko je od nje stiglo, s **Otkaži**: ono što je stiglo ostaje, a sljedeći put stiže samo ostatak; muzika, video snimci, PDF-ovi i **Otvori drugom aplikacijom** je takođe prvo preuzimaju. Dok je sve kopirano, sigurnosne kopije napravljene dok je mjesto otvoreno mogu izostaviti njegove dijelove, i nakon ponovnog pokretanja Erevosa, dok se ne doda ili obriše neka datoteka. Ima svoj prekidač **Preko Tora**, isključen dok ga ne uključite: uključen, kopija ide samo preko Tora, bez obzira na Tor podešavanje prostora, pa server ne vidi vašu IP adresu; sporije je i čeka dok se Tor pokreće. Gdje nema Tora, u aplikaciji za računar i u web-aplikaciji, server s uključenim prekidačem ne dobija ništa.
- **Sa Nextcloudom, kao LPHL-ovim:** u tom obrascu, i u **Dodaj server** rezervnih kopija, upiši adresu svog Nextclouda pod **Tvoj Nextcloud** i dodirni **Prijava preko Nextclouda**: prijavi se u pregledaču, kao u Fasouliju, preko Authentika ili kako se već tamo prijavljuje, i izaberi **Odobri pristup**. Erevos dobija svoju lozinku za aplikaciju i popunjava obrazac svojom fasciklom u tvojim datotekama, **Erevos/Collection** ili **Erevos/Backups**, napravljenom ako je nema, pored Fasoulijeve, koju nikad ne čita; zatim dodirni **Poveži**. Tu lozinku opozivaš u Nextcloud → Podešavanja → Bezbednost. Prijava slijedi prekidač **Preko Tora** servera za koji se prijavljuje: uključen, Erevos pita vaš Nextcloud samo preko Tora, ali sama stranica u pregledaču ide kao i uvijek.
- **Na tvojim povezanim uređajima:** u podešavanjima Zbirke, **I na mojim povezanim uređajima** šalje tu Zbirku na [povezane uređaje](#devices) njenog prostora ili skrivenog mjesta, a prekidač važi za sve. Datoteka dodana, preimenovana, premještena ili obrisana na jednom takva je na svima. Sličice stižu odmah; sama datoteka stiže odmah na istom Wi-Fi-ju, inače kad je otvoriš, sa WebDAV servera ako ga Zbirka ima, ili preko relaya do 100 MB. Svaki komad se čuva tek kad se otvori ključem datoteke, a prekinut prijenos nastavlja od komada koji je falio. Datoteka se drugdje briše samo kad se obriše na jednom od tvojih uređaja, nikad zato što tamo fali. Zbirka skrivenog mjesta ide samo na povezane uređaje tog mjesta.
- **Muzika, video i PDF:** PDF se čita stranicu po stranicu unutar Erevosa (Android 11 i noviji), dešifriran samo u memoriji. Muzika i video se reproduciraju direktno iz svojih šifriranih dijelova, nikad iz kopije: video preko cijelog ekrana, muzika sa sljedećima iz foldera, i nastavlja s ugašenim ekranom, s reprodukcijom, pauzom, sljedećim i prethodnim u obavještenju i na zaključanom ekranu telefona, i tamo samo s tim. Popis nastavlja nakon što se prostor zaključa, osim ako je u postavkama Zbirke uključeno **Zaustavi reprodukciju kad se prostor zaključa**; **Zaustavi** i dugme za paniku ga završavaju. Obavještenje pokazuje samo **Reprodukcija**, osim ako je uključeno **Prikaži naslov u obavještenju**. **Otvori drugom aplikacijom** predaje datoteku dok se dešifrira, bez kopije na telefonu, dok ne izađete iz Zbirke; druga aplikacija može zadržati svoju.
- **Originali u galeriji:** s uključenim **Izbriši original iz galerije nakon uvoza**, fotografija ili video izabran iz datoteka telefona briše se iz galerije čim je u Zbirci, nakon što Android zatraži da potvrdite. Potreban je Android 11 ili noviji. Fotografija iz kamere nikad ne ide u galeriju. Ako Android ne kaže koja je to fotografija galerije (kao iz **Nedavnih** u biraču datoteka), original ostaje i Erevos to kaže: izaberite je iz **Slika** ili iz memorije telefona.
- **Fotografije i video:** u **+**, **Kamera** je Erevosova vlastita: fotografije i video jedno za drugim, s blicem i prednjom kamerom, pravo u Zbirku, nikad u galeriju, i nijedna druga aplikacija ih ne vidi; fotografija se nikad nigdje ne zapisuje, ni na trenutak, i ne nosi ništa osim slike. Gdje ih proizvođač telefona nudi, kao na Pixelu, uz **Fotografija** stoje **Noć** i **Portret**, a gore **HDR uključen**: to su telefonovi vlastiti, rade se na njemu, i ništa ne izlazi. Dodir izoštrava i podešava svjetlo tamo; dva prsta zumiraju, a dugmad iznad okidača prelaze na široki objektiv (**0.5×**), **1×**, **2×** i **5×** gdje ih telefon ima. **Više** ima tajmer od 3 ili 10 sekundi, mrežu, okidač bez zvuka gdje zakon to dozvoljava, **Tamnije** i **Svjetlije** i, za video, HD, Full HD ili 4K, i **HDR video uključen** gdje ga telefon snima; u videu svjetlo može ostati uključeno. **Iz galerije** unosi mnogo fotografija i video snimaka odjednom; s uključenim **Izbriši original iz galerije nakon uvoza**, Android pita jednom za sve. HEIC i AVIF fotografije se vide među **Fotografijama** (Android prikazuje HEIC od 9 i AVIF od 12); ona koju uređaj ne može prikazati nudi **Otvori drugom aplikacijom**. Ispod fotografije, **Uredi** je okreće za po četvrtinu i reže okvirom koji vučete za uglove: čuva se kao nova fotografija, a ona od koje je nastala ostaje kakva je bila. **Informacije** kažu da li fotografija ili video govori gdje je snimljen. JPEG, PNG, WebP ili GIF fotografija sačuvana van ili otvorena drugom aplikacijom izlazi bez mjesta i vremena snimanja i bez telefona, osim ako je u postavkama Zbirke uključeno **Fotografije izlaze s mjestom i vremenom**; video ili HEIC fotografija izlazi kakva jeste, a Erevos prvo kaže ako navodi mjesto. Kamera, galerija i **Uredi** su na Androidu; u desktop aplikaciji i u pregledniku vide se i AVIF fotografije.
- **U aplikaciji za računar:** na Linuxu, macOS-u i Windowsu Zbirka radi i tamo, s datotekama šifriranim u Erevosovom vlastitom folderu na računaru. **+** donosi datoteku s računara, šifriranu dio po dio; kamere nema. Fotografije, tekstovi, PDF-ovi (u ugrađenom pregledniku PDF-a), muzika i video otvaraju se samo u memoriji Erevosa, nikad kao nešifrirana kopija na disku, do 1 GB svaki, a muzika i video bilo koje veličine, čitani dio po dio iz svojih šifriranih dijelova dok se puštaju; datoteka se zatvara, a muzika ili video staje, kad se prostor zaključa ili dugmetom za paniku. **Spremi na računar** prvo pita, kao na telefonu; **Otvori drugom aplikacijom** tu nema.
- **U pregledniku i na Sailfish OS-u:** web aplikacija, i na početnom ekranu iPhonea, i {=Erevos} na Sailfish OS-u takođe imaju Zbirku. **+** donosi datoteku biračem datoteka samog preglednika, čitanu i šifriranu dio po dio, pa velika nikad nije cijela u memoriji; njeni dijelovi čuvaju se u prostoru preglednika, ili na Sailfish OS-u u Erevosovom vlastitom folderu. Preglednik daje stranici samo ograničen prostor: kad ga nestane, ništa od datoteke se ne čuva, i {=Erevos} to kaže. Fotografije, tekstovi, muzika i video otvaraju se samo u memoriji, do 256 MB svaki, i zatvaraju se kad se prostor zaključa; PDF se tu ne prikazuje: spremite ga da ga čitate drugom aplikacijom. **Spremi na ovaj uređaj** (na Sailfish OS-u **Spremi na telefon**) prvo pita; u pregledniku prima do 256 MB, dok Sailfish OS u Preuzimanja upisuje datoteku bilo koje veličine dio po dio. U pregledniku WebDAV server mora pustiti web aplikaciju, kao za rezervne kopije; Sailfish OS nema kopiju na WebDAV-u.
- **Formati:** na Androidu se puštaju MP3, AAC i M4A, FLAC, Ogg i Opus, WAV, AMR, MP4, MKV, WebM i 3GP, i datoteka koja je stigla bez tipa, prepoznata po nastavku imena, kako datoteke iz drugih aplikacija često stižu. U aplikaciji za računar i u pregledniku, ono što preglednik od toga pušta: ni 3GP ni AMR.
- **Ekran plejera:** dodirni traku muzike koja svira na dnu Zbirke, ili **Sada svira** ispod muzičke datoteke, za omot, naslov, izvođača i album kako ih datoteka navodi (inače njeno ime), traku koju dodirneš ili povučeš na drugo mjesto, prethodnu, pusti ili pauziraj i sljedeću, **Nasumično**, **Ponavljaj** (listu, ili samo tu datoteku) i brzinu, od 0.5× do 2×, i listu, s označenom onom koja svira: dodirni drugu da je pustiš. Video, ili muzika od 10 minuta i duže, počinje gdje si stao: mjesto se čuva u katalogu Zbirke, šifrirano s njim, nigdje drugdje na telefonu, i samo za ovaj uređaj. Obavještenje i zaključani ekran pokazuju naslov, izvođača i omot samo kad je **Prikaži naslov u obavještenju** uključeno; inače samo **Reprodukcija**.
- **Titlovi:** datoteka .srt ili .vtt u istom folderu kao video, s njegovim imenom (film.mkv i film.srt, ili film.en.srt), prikazuje se kao njegovi titlovi, čitana iz šifriranih dijelova kao i video; **Titlovi uključeni** na vrhu ih isključuje, i ponovo uključuje.
- **Liste za reprodukciju:** na vrhu **Muzike**, **Nova lista za reprodukciju** pravi jednu; pjesme ulaze u nju iz svog menija (**Dodaj u listu za reprodukciju**) ili izabrane zajedno (zadrži jednu, pa **Lista za reprodukciju**). Otvori je da je pustiš redom ili nasumično, pomjeriš pjesmu gore ili dolje, ili je izbaciš: ostaje u Zbirci. Liste se čuvaju šifrirane sa Zbirkom, nikad nešifrirane.
- **Radio:** kartica **Radio** ima stanice internet radija, svaku po njenom linku; **+** tamo dodaje jednu. Samo https linkovi: Erevos ne otvara nešifrirani http, pa se stanica koja ima samo http link ne može dodati. Link liste (.m3u, .pls) čita se jednom, kad se dodaje, za link samog toka; HLS tok (.m3u8) svira na telefonu. Stanica svira kao muzika, s istim obavještenjem, istim **Zaustavi reprodukciju kad se prostor zaključa** i dugmetom za paniku; naslov koji šalje vidi se na ekranu reprodukcije, a u obavještenju samo kad je uključeno **Prikaži naslov u obavještenju**. Osim ako je uključeno **Puštaj preko Tora**, niže, stanica, i ko vodi njen server, vidi IP adresu tvog uređaja dok svira, kao i svaki sajt, a Erevos to kaže prije nego što zasvira prva. Erevos stanici ne šalje ništa drugo, i samo „Erevos“ kao ime. Stanice se čuvaju šifrirane sa Zbirkom.
- **Pronalaženje stanice:** **Dodaj stanicu** traži i u Radio Browseru (radio-browser.info), slobodnom imeniku stanica u koji svako može dodati: šalju mu se samo riječi koje upišeš, kad pritisneš **Traži**, i vidi IP adresu tvog uređaja, kao i stanica. Prikazuju se samo stanice za koje ima https link; dodir dodaje jednu. S uključenim **Preko Tora** u **Listama radija i TV-a**, niže, pretraga ide preko Tora i Radio Browser ne vidi vašu IP adresu.
- **Gotova lista jedne zemlje:** **Dodaj stanicu** s **Dodaj stanice ove zemlje** dodaje i najslušanije stanice Radio Browsera u zemlji koju izaberete, do 100, svaku sa https linkom. Radio Browser se pita jednom, kada ga pritisnete, i vidi IP adresu vašeg uređaja, osim ako je **Preko Tora** uključeno pod **Listama radija i TV-a**.
- **Lista s mnogo stanica:** link liste (.m3u, .pls) koji navodi mnogo stanica dodaje svaku od njih, a **Uvezi datoteku liste** dodaje stanice iz .m3u ili .pls datoteke na vašem uređaju, koja se čita tamo i ne šalje nikamo. Dodaju se samo stanice s https linkom (najviše 500 iz jedne liste), a Erevos kaže koliko ih je izostavljeno.
- **Kad tok padne:** ako server stanice, ili proxy na putu, završi tok, ili mreža na trenutak nestane, Erevos sam ponovo traži stanicu nakon 1, 2, 4… sekunde (najviše 30), dok god želite da svira, na Androidu, na računaru i u pregledniku. Nakon 12 pokušaja zaredom staje i kaže to.
- **TV:** kartica **TV** drži TV kanale, svaki po njegovom https linku, u grupama koje im daje njihova lista, s redom za prikaz jedne grupe i pretragom po imenu. Dodir pušta kanal preko cijelog ekrana, kao video, s istim **Zaustavi reprodukciju kad se prostor zaključa** i dugmetom za paniku; TV vodiča nema. Pušta se na Androidu, u aplikaciji za računar i u pregledniku; tamo se HLS tok pušta preko hls.js, i samo kad njegov server pusti web aplikaciju da ga čita.
- **Dodavanje kanala:** **+** u **TV** dodaje listu po njenom linku (.m3u), koja se čita jednom kad se dodaje, datoteku liste s tvog uređaja (**Uvezi datoteku liste (.m3u)**), koja se čita tamo i ne šalje se nikamo, ili jedan kanal po njegovom linku. Dodaju se samo kanali s https linkom, svaki link jednom, do 15.000 u svakoj Zbirci, a Erevos kaže koliko ih je izostavljeno. Drži kanal pritisnut da ga preimenuješ, obrišeš njega ili cijelu njegovu grupu, ili da s **Pošalji u razgovor** pošalješ njegovo ime i link; meni radio stanice također ima **Pošalji u razgovor**.
- **iptv-org:** **Dodaj kanale** nudi iptv-org (github.com/iptv-org/iptv), javnu listu besplatnih kanala: **iptv-org po državi**, prvo regija tvog uređaja, ili **iptv-org: svi kanali**, preko 10.000. Njegov server vidi IP adresu tvog uređaja kada se lista preuzima, a svaki kanal kada se pušta, osim ako je uključeno **Puštaj preko Tora**. S uključenim **Preko Tora** u **Listama radija i TV-a**, niže, lista se preuzima preko Tora, pa njen server ne vidi vašu IP adresu; svaki kanal je i dalje vidi kada se pušta, osim ako je uključeno i **Puštaj preko Tora**.
- **Šta kanal vidi:** osim ako je uključeno **Puštaj preko Tora**, niže, kanal, i ko god drži njegov server, vidi IP adresu tvog uređaja dok se pušta, kao i svaki sajt, a Erevos to kaže prije nego što se pusti prvi. Logotipi se prikazuju samo s uključenim **Prikaži logotipe kanala** u postavkama Zbirke, jer i server svakog logotipa vidi tvoju IP adresu; inače ikona televizora. Kanali se čuvaju šifrovani sa Zbirkom.
- **Liste radija i TV-a preko Tora:** u postavkama Zbirke, kartica **Liste radija i TV-a** ima **Preko Tora**, isključeno dok ga ne uključite. Uključeno, Erevos traži samo preko Tora, bez obzira na Tor podešavanje prostora, pretragu u Radio Browseru, listu ili TV listu preko linka, listu iptv-org i logotipe kanala, pa njihovi serveri ne vide IP adresu vašeg uređaja. Sporije je i čeka dok se Tor pokreće. Samo puštanje stanica i kanala ima svoj prekidač, odmah ispod.
- **Puštaj preko Tora:** na Androidu postavke Zbirke imaju i **Puštaj preko Tora**, isključeno dok ga ne uključiš. Uključeno, stanice i kanali se puštaju samo preko Tora, pa ni oni ni ko vodi njihove servere ne vide IP adresu tvog uređaja; ako se Tor ne pokrene, ništa se ne pušta direktno umjesto toga. Sporije je i čeka dok se Tor pokreće, a TV kanal može sporo krenuti ili na trenutak zastati. Dok prostor šalje sve preko Tora, puštaju se preko Tora i kad je isključeno. Isključeno, puštaju se direktno: prije nego što se pusti prvi, Erevos kaže da njegov server vidi tvoju IP adresu, s dugmetom **Puštaj preko Tora** koje ga uključuje i pušta preko Tora, i **Nastavi**, koje pušta direktno. Samo Android ih pušta preko Tora: drugdje, kad je uključeno, ne puštaju se, a Erevos kaže zašto; na računaru ni dok prostor šalje sve preko Tora.

**Zašto:** neke fotografije i datoteke, pasoš, ugovor, slika, ne smiju ni stajati u galeriji da ih čita svaka aplikacija ni putovati u razgovoru. Zbirka ih čuva istim šifriranjem kao razgovore, odvojeno od njih. Kad se datoteka spremi na telefon ili otvori drugom aplikacijom, ona je izvan Erevosa, nešifrirana.

## Rezervne kopije {#backup}

Rezervna kopija sadrži sve što Erevos čuva na ovom telefonu: svaki prostor, s njegovim kontaktima, ključevima
njegovih razgovora, porukama, fotografijama, datotekama, glasovnim porukama, uvezenim i skrivenim razgovorima, {+njegovim
Matrix, XMPP i Nostr računima, }njegovim Razgovorom sa sobom, zaključavanje i lozinku za paniku, i postavke koje idu s
vama na drugi telefon. Unutar nje svaki prostor ostaje zapečaćen vlastitom lozinkom, a rezervna kopija je ponovo
zapečaćena vlastitom lozinkom. Njene fotografije, datoteke i glasovne poruke idu u zasebne datoteke pored nje, do 4 MB
svaka, čija imena počinju kao njeno; automatska kopija koristi i datoteke prethodnih: držite zajedno cijeli folder. Nalazi se pod **Postavke** → **Podaci i uređaji** →
**Rezervne kopije**.

1. **Napravi rezervnu kopiju:** dodirnite **Napravi rezervnu kopiju**, izaberite folder (na telefonu, memorijskoj
   kartici ili u aplikaciji za oblak koja tamo prikazuje svoje foldere; na računaru, bilo koji folder), upišite
   lozinku za rezervnu kopiju dvaput (najmanje 12 znakova, ili četiri riječi) i dodirnite **Sačuvaj**. U pregledniku rezervna kopija i njene datoteke idu u meni za dijeljenje ili u preuzimanja: prva odmah, a svaka sljedeća nakon dodira na **Sačuvaj**.
   Dok se pravi, njena kartica kaže šta radi i dokle je stigla; kad završi, to kaže obavještenje.
2. **Automatske rezervne kopije:** izaberite **Svakih 6 sati**, **Svaki dan** ili **Svake sedmice**, zatim folder i
   lozinku. Erevos pravi kopiju dok je otvoren, čim je posljednja starija od toga: kad se otvori prostor, svakih 15
   minuta, i kad ode u pozadinu, prije nego što se zaključa; nikad bez otvorenog prostora. Svaka upisuje samo
   fotografije, datoteke i glasovne poruke koje su nove od prethodne, a za ostalo ponovo imenuje datoteke prethodnih,
   pa jedna svakih 6 sati malo košta. Folder čuva 3 najnovije, sa svakom datotekom koja im treba, i briše datoteke
   koje ne treba nijedna od njih. Ona koja nije uspjela pokušava se ponovo kad se otvori prostor, ili sat kasnije.
   Ispod njih su **Napravi kopiju
   sada**, **Promijeni folder** i **Promijeni lozinku**; **Isključeno** ih zaustavlja, a napravljene ostaju u folderu.
3. **I na server:** na Androidu i u aplikaciji za računar, s uključenim automatskim rezervnim kopijama, **Dodaj
   server** pod **I na server** šalje svaku i u folder na serveru koji izaberete i koji govori WebDAV, kao vaš
   vlastiti Nextcloud: upišite adresu foldera, korisničko ime i, najbolje, lozinku aplikacije samo za Erevos, pa
   dodirnite **Poveži**. Server čuva 3 najnovije, sa svakom datotekom koja im treba, a svaka šalje samo ono što je
   novo; **Prestani slati** to zaustavlja, a one koje su tamo ostaju. U web
   aplikaciji, koja ne pravi rezervne kopije sama, **Pošalji rezervnu kopiju sada** šalje jednu tamo, s lozinkom koju
   upisujete svaki put.
   Svaki server ima prekidač **Preko Tora**, na svojoj kartici i u obrascu koji ga dodaje, isključen dok ga ne
   uključite (vidi **Na serveru** niže).
4. **Vrati:** dodirnite **Vrati rezervnu kopiju**, izaberite datoteku i upišite njenu lozinku. Erevos pita još jednom,
   nađe datoteke rezervne kopije pored nje ili traži da ih izaberete, ili njihov folder (za automatsku kopiju
   izaberite svaku datoteku foldera, jer neke njegove datoteke mogu počinjati kao ime ranije kopije), a zatim stavlja rezervnu
   kopiju umjesto svega što je na telefonu i otvara se onakav kakav je bio kad je kopija napravljena, s lozinkama koje
   su se tada koristile. Ako neka od njenih datoteka nedostaje, oštećena je ili pripada drugoj kopiji, Erevos kaže koja, i ništa se ne mijenja, osim ako izaberete da vratite ostalo bez nje: tada fotografije, datoteke i glasovne poruke na telefonu ostaju kakve jesu, a one koje ona sadrži se ne vraćaju. **Vrati sa servera** gleda u folder u koji idu automatske rezervne kopije, ili u onaj koji navedete s
   korisničkim imenom i lozinkom, i prikazuje rezervne kopije koje su tamo, najnovije prve: izaberite jednu, upišite
   njenu lozinku, i vraća se na isti način, s njenim datotekama odande.

- **Čuvajte lozinku rezervne kopije:** bez nje ništa ne otvara rezervnu kopiju, i niko je ne može vratiti. Bez
  zaključavanja lozinkom, lozinka rezervne kopije je sve što je štiti. Ko ima datoteku može na njoj isprobavati lozinke
  onoliko brzo koliko mu računar ide, bez telefona koji bi ga usporavao, pa kratka lozinka ne izdržava: Erevos ne
  prihvata nijednu kraću od 12 znakova.
- **Automatske rezervne kopije čuvaju svoju lozinku na telefonu,** pa im lozinka ne treba svaki put. Onome ko otvori
  njihov folder i dalje trebaju lozinke prostora da bi čitao razgovore.
- **Šta zauzima prostor:** na Androidu, **Izmjeri** pod **Šta zauzima prostor** pokazuje koliko prostora Erevos zauzima na telefonu, po vrsti: Zbirka s fotografijama i datotekama iz razgovora, glasovne poruke, historija razgovora, Tor i ostaci nedovršenih upisa. Svaka automatska rezervna kopija sadrži sve to, pa se tako vidi zašto je velika. Gledaju se samo imena i veličine datoteka, na telefonu, i ništa se ne šalje.
- **Ostaci:** fotografije i datoteke koje više ne navodi nijedan razgovor, Zbirka ni uvoz, poput onih iz uvoza prekinutog na pola, ostaju na telefonu i u svakoj rezervnoj kopiji. Pod **Ostaci** upiši jedan po jedan, ili više odjednom odvojenih zarezom ili razmakom, PIN svakog svog skrivenog razgovora i lozinku svakog drugog prostora, pa dodirni **Pronađi ostatke**: Erevos čita koje datoteke navodi svako od njih i ovaj prostor, i pokazuje koliko ne navodi nijedno. **Obriši ih** ih briše, nakon još jedne potvrde. Mjesto koje tamo nisi otvorio gubi svoje fotografije i datoteke: prvo otvori sva. Datoteka upisana u posljednjem danu nikad se ne uzima, a već napravljene rezervne kopije čuvaju sve.
- **Provjera rezervnih kopija:** nakon svake automatske kopije Erevos je ponovo čita iz mape: otvara se svojom lozinkom, svaki dio koji navodi je tu, svoje veličine, a dva nasumično odabrana dijela čitaju se cijela. Na serveru tada gleda samo popis, pa se ništa ne preuzima. **Provjeri sada** uz to preuzima najnoviju kopiju sa servera i deset njenih dijelova. Dio koji nedostaje ili je oštećen prikazuje se crveno: napravi kopiju sada, pa provjeri ponovo. **Potpuna provjera mape** čita cijeli svaki dio tamo i uspoređuje ga sa SHA-256 koji je kopija za njega zapisala: nekoliko minuta za mnogo GB, i ništa ne napušta telefon.
- **Na serveru:** rezervna kopija koja ide tamo zapečaćena je svojom lozinkom kao i ostale, a ta lozinka nikad ne
  napušta telefon, pa je server ne može otvoriti. Ime joj je nasumično, a datoteka izgleda kao nasumični bajtovi,
  jedne od nekoliko veličina, pa ni jedno ni drugo ne kaže da je Erevosova niti koliko tačno sadrži. Njene
  fotografije, datoteke i glasovne poruke idu kao zasebna slanja, sva iste veličine, svako također pod nasumičnim
  imenom i zapečaćeno lozinkom rezervne kopije, vezano za tu kopiju i za svoje mjesto u njoj, pa nijedno ne može
  neprimjetno biti zamijenjeno, izostavljeno ili uzeto iz druge kopije; server čuva svaku dok je treba jedna od kopija
  koje čuva, a zatim je briše. Imena su im iste dužine kao ime kopije, ali ih veličina razlikuje od nje, pa ih server može prebrojati i tako otprilike znati koliko kopija sadrži. Ono što je tamo ostavila prekinuta kopija briše se prije nego što ode sljedeća, pa server kojem je ponestalo mjesta opet ga ima. Server ipak vidi vaš nalog, kad jedna stigne i otprilike koliko je velika. Na Androidu rezervne kopije idu tamo kako kaže izbor
  prostora pod **Postavke** → **Relay i mreže** → **Tor**{+, kao i Matrix}: sa **Sve** samo preko Tora, pa server ne vidi
  adresu telefona; s **Poruke** preko Tora čim je Tor spreman, a direktno dok se Tor pokreće ili kad ne uspije; s
  **Ništa** direktno, i server vidi adresu telefona. Kopija prvo čeka do dvije minute da se Tor pokrene, a **I na
  server** kaže kojim putem ide sada. U aplikaciji za računar šalje ih sama aplikacija, ne njena stranica, jer
  stranica ne može doći do takvog servera; u web aplikaciji šalje ih preglednik, koji dolazi samo do servera podešenog
  da pusti web aplikaciju (CORS), što Nextcloud sam po sebi nije. Nijedna nema Tor za to: dok neki prostor šalje
  **Sve** preko Tora, odatle ne ide nijedna. U web aplikaciji lozinka servera čuva se u pregledniku, zapečaćena
  ključem koji preglednik ne daje van. **Vrati sa servera** preuzima onu koju izaberete na isti način, preko Tora kako
  kaže prostor, i tamo ništa ne piše; lozinka upisana za to koristi se samo za to vraćanje i ne čuva se. Preko Tora
  ne stiže nijedna datoteka rezervne kopije veća od 64 MB, a direktno nijedna veća od 100 MB, koliko Erevos najviše
  prima pri preuzimanju: tada preuzmite kopiju i njene datoteke sa servera i dodirnite **Vrati rezervnu kopiju**. Erevos
  stariji od ove verzije ne otvara takvu kopiju. Google Drive je namjerno izostavljen: Google vezuje datoteku za vaše
  ime, a Erevos bi trebao Googleove aplikacije i prijavu na Google na telefonu.
  Prekidač **Preko Tora** svakog servera, isključen dok ga ne uključite, ima prednost nad izborom prostora za taj
  server: uključen, njegove rezervne kopije idu samo preko Tora, bez obzira na Tor podešavanje prostora, i čekaju da
  se Tor pokrene, pa server ne vidi adresu telefona. **Vrati sa servera** i obrazac koji dodaje server imaju isti
  prekidač, a prijava s Nextcloudom slijedi prekidač servera za koji se prijavljuje: sama stranica u pregledaču ide
  kao i uvijek. Aplikacija za računar i web-aplikacija nemaju Tor: server s uključenim prekidačem odatle ne dobija
  ništa. Dijelovi rezervne kopije koje dajete prijateljima ([Dijelovi rezervne kopije kod prijatelja](#backup-pieces))
  ne nose prekidač.
- **Razgovori koji su se nastavili nakon kopije:** vraćanje vraća ključeve svakog razgovora kakvi su tada bili. Poruke
  koje su stigle nakon kopije i već su pročitane nisu u njoj. Razgovor koji se nastavio nakon kopije prestao bi
  otvarati nove poruke, pa svaki vraćeni razgovor, onaj prostora i onaj svakog skrivenog mjesta kad se otvori, sam i
  tiho započinje novi razgovor sa svakim kontaktom, iz najnovijih ključeva koje mu je dao, a njegov {=Erevos} nastavlja u
  njemu. S kontaktom čiji je {=Erevos} stariji, zamolite ga ponovo za njegov link za kontakt. Prije nego što vraćeni razgovor ponovo piše, njegovi
  razgovori preskaču ključeve koje su možda koristili od kopije, pa nijedan ključ nikad ne zapečaćuje dvije poruke:
  poruka zapečaćena dvaput omogućila bi onome ko je sačuvao oba paketa da ih pročita zajedno. U grupi vraćeni član
  traži od Erevosa admina da ga ponovo unese, što uspijeva dok je grupa otišla samo malo dalje; inače tražite da vas
  ponovo dodaju.
- [+] **Matrix, XMPP i Nostr:** računi svakog prostora i njegovih skrivenih razgovora nalaze se u rezervnoj kopiji. Nostr
  ključ se vraća sa svojim razgovorima, kakvi su bili. XMPP račun se vraća sa svojom prijavom, kontaktima, razgovorima i
  ključevima koje poznaje od drugih, i nastavlja kao novi uređaj računa: zadržava svoj identitetski ključ, pa aplikacije
  vaših kontakata i dalje poznaju njegov ključ, ali dobija novi ID uređaja, novi resource i nove ključeve, svaki
  razgovor počinje ispočetka, a stari uređaj se skida s lista uređaja računa čim se poveže. Ne može pročitati poruke
  šifrovane za stari uređaj nakon kopije. Matrix račun se na ovom telefonu pušta, bez odjave na serveru, što bi ugasilo
  uređaj na telefonu s kojeg je kopija došla; prostor se ponovo prijavljuje, kao novi uređaj, a njegov sigurnosni ključ
  otvara ranije poruke. Vraćeni kakvi su bili, razgovori takvog uređaja ponovo bi koristili ključeve poruka koje drugi
  odbijaju, a telefon s kojeg je kopija došla možda još koristi uređaj.
- **Zatvoreni razgovori:** rezervna kopija čuva i ono što trebaju **Zvonjava poziva kad su zatvoreni** i **Javi kad
  stigne poruka** skrivenih razgovora, te **I dok je otvoren drugi prostor**. Tako nakon vraćanja, i na drugom
  telefonu, rade kao prije. Rezervna kopija od prije ove verzije nema ništa od toga: njeno vraćanje ostavlja ih kakve
  ih telefon ima.
- **Postavke:** rezervna kopija čuva postavke koje su vaše, a ne telefona: jezik, module, vibraciju, obavijesti u
  pozadini i broj na ikoni, uštedu baterije, privatnost ekrana, kvalitet fotografija, otvara li se Telefon bez lozinke,
  i kako Erevos dolazi do telefona u blizini (prenoseći njihove poruke, na istom Wi-Fi-ju, preko Wi-Fi Directa, Wi-Fi
  Awarea i LoRa radija, koji se ponovo uključuje samo tamo gdje ga ovaj telefon poznaje). Na Androidu čuva i brze
  odgovore Telefona i pozive koje odbija, one iz grupe kontakata samo tamo gdje ovaj telefon ima grupu tog imena na
  istom nalogu. Automatske rezervne kopije i njihov server vraćaju se sa svojom lozinkom, ali ne i sa svojim folderom,
  u koji Android pušta da piše samo telefon na kojem je izabran: na drugom telefonu **Rezervne kopije** kažu da
  izaberete jedan, a do tada idu samo na server.
- **Jedan po jedan telefon:** rezervna kopija vraćena na drugom telefonu čita iste redove na relayu kao i prvi, i
  svaki preuzima poruke koje drugi tada nikad ne dobije. Koristite je za prelazak na novi telefon, a ne za držanje
  dva.
- **Stari telefon je izgubljen:** telefon koji je izgubljen ili ukraden i još je uključen i dalje čita redove na
  relayu koje je poznavao, pa poruke poslane tamo mogu stići do njega, a nikad do novog telefona. Nakon vraćanja
  rezervne kopije na novom telefonu dodirnite **Stari telefon je izgubljen** pod **Rezervne kopije** (nakon vraćanja
  kopije s drugog telefona Erevos na to upozorava) i recite **Promijeni redove**. Svaki prostor i njegovi skriveni
  razgovori tada prelaze na nove redove na relayu, svaki sljedeći put kad se ovdje otvori, a vaši kontakti i grupe se
  obavještavaju tiho. Stari redovi se ovdje čitaju dok svaki kontakt ne počne pisati u nove, najviše 14 dana, a
  linkovi za kontakt i QR kodovi koje ste dali prije vrijede 14 dana, a zatim više ne. Ono što dolazi preko Nostra{+,
  XMPP-a ili Matrixa} i dalje stiže na stari telefon. Nakon još jednog vraćanja, dodirnite ga ponovo.
- **Diskrecija:** svaki prostor prikazuje isti ekran Rezervne kopije, a rezervna kopija sadrži svaki prostor, pa ni
  jedno ni drugo ne govori koliko ima prostora ni jesu li postavljeni skriveni razgovori. Imena datoteka kažu da je to
  Erevos rezervna kopija, a njihov broj i veličina otprilike pokazuju koliko se čuva.
- **SMS poruke telefona:** na Androidu, **Stavljaj SMS poruke u rezervne kopije** od tada dodaje SMS i MMS poruke
  telefona svakoj rezervnoj kopiji, s najviše 32 MB njihovih slika, dok je Erevos SMS aplikacija. Zapečaćene su
  lozinkom rezervne kopije kao i ostalo. Vraćanje rezervne kopije vraća u SMS poruke telefona svaku poruku koju još
  nema, i ne briše nijednu; Erevos tada također mora biti SMS aplikacija, inače se ostalo vraća bez njih. SMS poruke
  pripadaju telefonu, iste su u svakom prostoru. Stariji Erevos ne otvara rezervnu kopiju koja sadrži SMS poruke.
- **Pozivi telefona:** na Androidu, **Stavljaj pozive u rezervne kopije**, pod **Pozivi telefona**, od tada dodaje
  svakoj rezervnoj kopiji historiju poziva telefona (njegovih 10.000 najnovijih poziva, bez govorne pošte) i
  Androidovu vlastitu listu blokiranih brojeva, dok Android dopušta Erevosu da čita historiju poziva; blokirane
  brojeve samo dok je Erevos aplikacija Telefon ili SMS. Isključeno je dok ga ne uključite, a izbor ide u rezervne
  kopije. Zapečaćeni su lozinkom rezervne kopije kao i ostalo. Vraćanje rezervne kopije dodaje telefonu svaki poziv i
  svaki blokirani broj koji još nema, i ne briše nijedan; Erevos tada mora biti aplikacija Telefon (**Postavke** →
  **Telefon i SMS** → **Telefon**), inače se ostalo vraća bez njih. Android čuva otprilike 500 najnovijih poziva svake
  SIM kartice, pa stariji vraćeni mogu nestati kako stižu novi pozivi. Stariji Erevos ne otvara rezervnu kopiju koja
  sadrži pozive.
- **Red u SMS porukama:** prikvačeni i arhivirani razgovori svakog prostora, otpad, nacrti, filter spama i oznake,
  koliko SMS čeka da bi se mogao povući, SMS poruke za kasnije (**SMS kasnije**), pozivnice, imena iz vaših kontakata,
  smiju li poruke Erevos kontaktima ići SMS-om, i SIM kartica izabrana za svaki broj nalaze se u svakoj rezervnoj
  kopiji, zapečaćeni lozinkom prostora kao i ostalo. Izabrana SIM kartica vraća se samo na istom telefonu, jer svaki telefon daje svojim SIM karticama vlastite oznake: na drugom, SMS poruke i pozivi idu preko njegove podrazumijevane SIM kartice dok tamo ne izaberete jednu. SMS za kasnije čije je vrijeme došlo prije vraćanja ne odlazi sam,
  jer ga je telefon s kojeg je kopija došla možda već poslao: prikazuje se kao neposlan, a dodir na njega šalje ga ili
  briše. Onaj čije vrijeme tek dolazi odlazi u svoje vrijeme. Stariji Erevos ne otvara rezervnu kopiju koja ih sadrži;
  ona koju je napravio stariji {=Erevos} vraća se kao i uvijek, bez njih.
- **Šta se nikad ne vraća:** ono što pripada samom telefonu ne dolazi ni s jednom rezervnom kopijom, pa ga vraćanje
  na drugom telefonu ne može donijeti: otisak prsta ili lice, čiji ključ Android čuva u čipu tog telefona; folderi u
  koje Erevos smije pisati, kao onaj automatskih rezervnih kopija, u koje ga Android pušta samo na telefonu na kojem
  su izabrani; ono što Android dozvoljava Erevosu i koje aplikacije obavljaju pozive i šalju SMS, što samo vi možete
  dozvoliti na svakom telefonu, pa se nakon vraćanja na Androidu otvaraju **Dozvole** za uključene module; historija
  poziva i Androidova vlastita lista blokiranih brojeva, osim ako je **Stavljaj pozive u rezervne kopije** bilo
  uključeno, kao gore; i broj pogrešnih
  lozinki.{+ XMPP račun se vraća kao novi uređaj samog sebe, a Matrix se ponovo prijavljuje, kao gore,}{- Povezani uređaji se ponovo povezuju, kao dolje.}{+ a povezani
  uređaji se ponovo povezuju, kao dolje.}
- **Povezani uređaji:** veza ostaje s telefonom i računarom na kojima je napravljena, i nijedna rezervna kopija je ne
  čuva, ali rezervna kopija čuva ono što telefonu na kojem se vrati omogućava da zatraži od svakog od njih da se
  ponovo poveže. Nakon vraćanja rezervne kopije na drugom telefonu, tamo otvorite **Postavke** → **Podaci i uređaji**
  → **Povezani uređaji**: pod **Iz rezervne kopije** dodirnite **Zatraži ponovno povezivanje** za svaki uređaj koji je
  još vaš, ili **Zaboravi** za onaj koji nije. Uređaj, koji mora biti uključen, prikazuje zahtjev: tamo dodirnite
  **Ponovo poveži** samo ako ste kopiju vratili vi, inače **Ne sada**. Tada se povezuje s novim telefonom bez koda za
  skeniranje, zadržava svoje razgovore i dobija ono što je stiglo od tada; poruke koje su stigle na stari telefon
  nakon kopije ostaju samo na njemu. Kad se jednom ponovo poveže, ni stari telefon ni iko s istom kopijom ne dopire do
  njega. Zahtjev vrijedi 14 dana, a uređaji skrivenog mjesta traže se iznutra tog mjesta. Uređaj sa starijim Erevosom
  ne prikazuje zahtjev: na njemu dodirnite **Odvoji ovaj uređaj**, a zatim ga povežite kao prvi put, pogledajte
  [Povezani uređaji](#devices). Kontakti s ovom verzijom prestaju pisati vašim računarima dok se ne povežu ponovo: telefon im daje novi popis svojih uređaja koji ne navodi nijedan. Ako sat ovog
  telefona kasni za satom izgubljenog, taj popis nestaje čim mu oni pišu, a detalji njihovog razgovora mogu reći da se
  promijenio dan nakon što ste vratili kopiju. Vlastita rezervna kopija povezanog računara sadrži razgovore telefona
  kakvi su bili, ali
  ne i vezu za pisanje u njima: kad se vrate, mogu se tamo čitati, ali ne i pisati u njima, a {=Erevos} to jednom kaže. Da
  biste pisali u njima, ponovo povežite taj računar s telefonom: razgovori koje telefon još ima ostaju, s onim što je
  stiglo u međuvremenu, a ostali nestaju. Na telefonu odvojite uređaj koji je to bio prije. Rezervne kopije pravite na
  telefonu.
- **Verzije:** rezervna kopija se otvara samo u Erevosu jednako novom kao onaj koji ju je napravio, ili novijem. Kopija
  novijeg Erevosa se odbija, a ništa se ne mijenja: prvo ažurirajte {=Erevos} na najnoviju verziju. {=Erevos} prije 6.0.0 za
  kopiju od 6.0.0 nadalje kaže da nije rezervna kopija Erevosa: ažurirajte i njega.

## Dijelovi rezervne kopije kod prijatelja {#backup-pieces}

Lozinka vaših rezervnih kopija može otići prijateljima u dijelovima, pod **Postavke** → **Podaci i uređaji** →
**Dijelovi rezervne kopije**: odaberite **2 od 3**, **2 od 4**, **3 od 4** ili **3 od 5**, zatim isto toliko kontakata,
i dodirnite **Dajte dijelove**. S uključenim automatskim rezervnim kopijama Erevos provjerava je li lozinka koju
upisujete njihova. Sa serverom pod **I na server** dijelovi mogu sadržavati i njegovu adresu, korisničko ime i lozinku,
tako da se s njima mogu pronaći i otvoriti rezervne kopije tamo. Svaki kontakt dobiva poruku koja kaže što je to, a
njegov {=Erevos} čuva dio odvojeno od razgovora, pod **Dijelovi koje čuvate za prijatelje**.

1. **Da je vratite:** zamolite dovoljno njih za njihove dijelove. Svaki dodirne **Prikaži kod** pored vašeg, a vi
   dodirnete **Skeniraj kod** pod **Sastavite svoje dijelove**; ili oni dodirnu **Kopiraj** i pošalju vam tekst na
   drugi način, a vi ga zalijepite i dodirnete **Dodaj**; ili, dok vaš telefon još ima račun, dodirnu **Vrati ga u
   vašem razgovoru**. Zatim dodirnite **Sastavi**: Erevos pokazuje lozinku, a sa serverom u dijelovima **Vrati s tog
   servera** navodi rezervne kopije tamo.
2. **Nova lozinka:** čim vaše rezervne kopije dobiju novu lozinku, ranije dani dijelovi više ne vrijede: dajte nove.

- **Što dio pokazuje:** ništa. Manje dijelova nego što treba ne govori ništa o lozinci, koliko god računalne snage se
  uloži: s njima je svaka lozinka jednako vjerojatna kao bilo koja druga. Svaki dio ima istu veličinu, kakva god da je
  lozinka, i ništa u njemu ne imenuje vas ni ostale prijatelje.
- **Na vašem telefonu:** poruka ostaje u razgovoru, ali njen dio ne: kad ode, ništa na vašem telefonu ne čuva
  dijelove, samo kome su otišli. Tko otvori neki vaš prostor saznaje kome ste dali dijelove, ne i lozinku. Dijelovi
  idu samo kontaktima prostora, ne u skrivene razgovore.
- **Što ne može spriječiti:** dovoljno prijatelja zajedno može otvoriti vaše rezervne kopije ako dobiju i datoteku:
  odaberite ljude koji se ne poznaju svi međusobno. Netko se može predstaviti kao vi, s novog broja ili novog računa,
  da dobije dijelove: prijatelj treba vratiti dio samo vama uživo, ili u razgovoru koji već ima s vama. Prijatelj
  čiji je {=Erevos} stariji od ove verzije vidi poruku, ali ne čuva dio.

**Zašto:** rezervna kopija sigurna je koliko i njena lozinka, a jaka lozinka lako se izgubi. Podijeljena ovako
(Shamirovo dijeljenje tajne), nijedan prijatelj sam, ni nijedan relay, ne drži ništa što je otvara.

## Prelazak na novi telefon {#new-phone}

Sve što Erevos čuva prelazi na novi telefon u jednoj rezervnoj kopiji: svaki prostor sa skrivenim razgovorima,
kontaktima, porukama, fotografijama, datotekama i Zbirkom, računi i relayi, zaključavanje, lozinka za paniku i vaše
postavke. Nijedan server ne čuva kopiju za vas, pa ništa ne dolazi samo od sebe: nosi ga rezervna kopija, zapečaćena
svojom lozinkom.

1. **Na novom telefonu instalirajte {=Erevos}:** istu verziju kao na starom telefonu, ili noviju, jer stariji {=Erevos}
   odbija kopiju koju je napravio noviji. Bez interneta ga stari telefon može dati, pogledajte
   [Erevos obližnjem telefonu](#give-app).
2. **Na starom telefonu ga pripremite:** da bi i SMS poruke telefona prešle, uključite **Stavljaj SMS poruke u
   rezervne kopije** pod **Rezervne kopije**, a za njegovu historiju poziva **Stavljaj pozive u rezervne kopije**. Zbirka izostavljena iz kopija ostaje iza: vratite je unutra, ili joj dajte
   WebDAV server, pogledajte [Zbirka](#collection).{+ Imajte pri ruci svoj sigurnosni ključ za Matrix, jer se Matrix
   ponovo prijavljuje na novom telefonu.}
3. **Na starom telefonu napravite kopiju:** pod **Postavke** → **Podaci i uređaji** → **Rezervne kopije** dodirnite
   **Napravi rezervnu kopiju**, ili **Napravi kopiju sada** s automatskim kopijama. Napravite je posljednju, tik prije
   prelaska, i od tada ne otvarajte Erevos na starom telefonu: ono što stigne poslije čeka na relayima novi.
4. **Prenesite je:** kopirajte rezervnu kopiju i svaku datoteku čije ime počinje kao njeno, sve u jednom folderu, na
   novi telefon, kablom, memorijskom karticom ili aplikacijom za oblak. Kopija na vašem serveru ne treba kopiranje.
5. **Na novom telefonu vratite:** pri prvom pokretanju dodirnite **Već imam {=Erevos} na drugom telefonu** (ili prođite
   prvo pokretanje). Na Androidu, zbog SMS poruka, neka Erevos i tamo bude SMS aplikacija. Zatim pod **Postavke** →
   **Podaci i uređaji** → **Rezervne kopije** dodirnite **Vrati rezervnu kopiju** i izaberite datoteku, ili **Vrati sa
   servera** i dajte adresu servera, korisničko ime i lozinku; upišite lozinku rezervne kopije i recite da. Erevos se
   otvara kakav je bio stari telefon, s istim lozinkama.
6. **Na novom telefonu ponovo podesite ono što pripada telefonu:** **Dozvole** se otvaraju za ono što Android treba
   dozvoliti. Zatim ponovo uključite otisak prsta ili lice (pogledajte [Zaključavanje lozinkom](#lock)), ponovo
   izaberite folder automatskih kopija pod **Rezervne kopije**, i SIM za svaki broj{+, i prijavite se u Matrix njegovim
   sigurnosnim ključem}.
7. **Na starom telefonu obrišite Erevos:** kad novi telefon pokaže vaše razgovore i nove poruke stižu tamo, dodirnite
   **Obriši sve sada** pod **Postavke** → **Privatnost i sigurnost** → **Gumb za paniku**. Ne **Obriši me odasvud**: to
   briše redove na relayima koje čita novi telefon.

- **Jedan telefon odjednom:** oba telefona čitaju iste redove na relayima, a poruka ide onom koji je prvi uzme, pa je
  drugi nikad ne dobije. Držite stari zatvoren od kopije nadalje, i obrišite ga na kraju.
- **Vaši kontakti:** svaki prostor zadržava svoj relay, svoj token i svoj kućni relay, pa nema ničega za ponovno
  upisivanje ni pozivnice za traženje. Vaši kontakti vam pišu kao prije.
- **Skriveni razgovori:** svako skriveno mjesto dolazi s kopijom, svako sa svojim PIN-om, a ništa na novom telefonu ne
  govori da ih ima, pogledajte [Skriveni razgovori](#hidden).
- [+] **Matrix, XMPP i Nostr:** Nostr ključ nastavlja kakav je bio, XMPP račun kao novi uređaj samog sebe, a Matrix se
  ponovo prijavljuje kao novi uređaj, a njegov sigurnosni ključ otvara ranije poruke, pogledajte
  [Rezervne kopije](#backup).
- **Povezani uređaji:** na novom telefonu, pod **Postavke** → **Podaci i uređaji** → **Povezani uređaji**, dodirnite
  **Zatraži ponovno povezivanje** za svaki računar ili preglednik koji je još vaš, zatim **Ponovo poveži** na njemu:
  zadržava svoje razgovore, bez koda za skeniranje. Uređaje skrivenog mjesta iznutra tog mjesta. Uređaj sa starijim
  Erevosom: na njemu dodirnite **Odvoji ovaj uređaj**, zatim ga povežite s novim telefonom kao prvi put. Pogledajte
  [Rezervne kopije](#backup).
- **Zbirka:** dolazi u datotekama kopije. Ona izostavljena iz kopija dolazi samo s svog WebDAV servera, svaka datoteka
  kad se otvori; ona bez jednog i drugog ostaje na starom telefonu, a brisanje je briše.
- **Moduli i postavke:** uključeni moduli, jezik i druge postavke dolaze s kopijom. Ono što Android čuva za svaki
  telefon ostaje tamo, kao ono što dopušta Erevosu; historija poziva i njegovi blokirani brojevi dolaze također kad je
  uključeno **Stavljaj pozive u rezervne kopije**.
- **Nedostaje datoteka:** ako datoteka kopije nedostaje ili je oštećena, Erevos kaže koja i ne mijenja ništa, osim ako
  izaberete da vratite ostalo bez nje.
- **Ako je stari telefon izgubljen:** vratite najnoviju kopiju na novi telefon čim možete, i sa svog servera, zatim
  dodirnite **Stari telefon je izgubljen** pod **Rezervne kopije**, da ne čita ništa više vaše na relayima. Ako ste
  izgubili lozinku kopije, prijatelji koji drže njene dijelove mogu je vratiti, pogledajte
  [Dijelovi rezervne kopije kod prijatelja](#backup-pieces).

**Zašto:** Erevos ne čuva ništa vaše na serveru koji bi to mogao vratiti, pa nijedan račun ne nosi vaše razgovore na
novi telefon. Jedna rezervna kopija, zapečaćena svojom lozinkom, nosi sve, i samo je vi možete otvoriti.

## Gumb za paniku {#panic}

Kad ste u opasnosti, Erevos se može odmah obrisati, u **Postavke** → **Privatnost i sigurnost** → **Gumb za paniku**:
dodirnite **Obriši sve sada** i potvrdite s **Obriši**. Na Androidu, u web aplikaciji, na računalu i na Sailfish OS-u.

Da ga brzo nađete u nuždi, on je i prvi, crvenom bojom, u meniju **⋯** početnog ekrana, a dugo držanje lokota na vrhu
početnog ekrana odmah ga otvara. Dodir na lokot i dalje zaključava; samo dugo držanje otvara gumb za paniku, a tamo
**Obriši sve sada** i dalje pita još jednom.

- **Što se briše:** svaki prostor s njegovim skrivenim razgovorima, s njihovim kontaktima, porukama, fotografijama,
  datotekama i ključevima; zaključavanje i njegove lozinke; {+Matrix, XMPP i Nostr računi i }tokeni relaya; postavke i
  lozinka automatskih rezervnih kopija, i njihovog servera. Na Androidu se Erevos zatim zatvara, a sljedeći put se
  otvara kao tek instaliran. S odabranim **I automatske rezervne kopije u** prvo se brišu datoteke kopija ondje.
- **Što ostaje:** ono do čega Erevos ne može doći: rezervne kopije koje ste kopirali drugdje ili poslali na server
  (njihova ih lozinka i dalje štiti), ono što relay čuva za vas dok ne istekne, i ono što imaju vaši kontakti.

1. **Iz aplikacije za paniku:** na Androidu aplikacija za paniku poput Ripplea jednim pokretom briše aplikacije koje
   odaberete. Instalirajte jednu i u njoj odaberite Erevos: Erevos otvara ovaj zaslon, nakon svoje lozinke, i pita.
   Dodirnite **Recite da**.
2. **Samo ta aplikacija:** samo aplikacija kojoj ste rekli da može obrisati Erevos, i to samo dok je **Aplikacija za
   paniku smije obrisati Erevos** uključeno. Erevos provjerava ime aplikacije i njezin potpis: druga aplikacija, ili
   isto ime koje je netko drugi ponovno instalirao, ne može. Ažuriranje aplikacije koje prelazi na novi ključ na način
   koji Android dopušta (rotacija ključa) i dalje je pouzdano. **Prestani vjerovati** to završava.
4. **Kad je Erevos odbio:** ako je pouzdana aplikacija tražila brisanje dok je prekidač bio isključen, ili potpisana
   drugim ključem, ovaj zaslon to kaže crveno, s danom i satom. Kad je aplikacija potpisana drugim ključem, **Vjeruj
   aplikaciji … ovakvoj kakva je sada** joj ponovno vjeruje: recite da samo ako ste je sami ažurirali.
3. **Nakon brisanja:** zaboravlja se i aplikacija za paniku: recite joj ponovno da kad opet postavite Erevos.

- **Na računalu i na Sailfish OS-u:** nema aplikacije za paniku, samo **Obriši sve sada**, uz **I automatske rezervne
  kopije u** njihovu mapu ako to odaberete. Na računalu se Erevos zatim ponovno pokreće kao tek instaliran; na Sailfish
  OS-u se zatvara. Stavka privjeska za Erevos ostaje na računalu, ali ono što je zapečaćivala je nestalo, pa ne otvara
  ništa.
- **Što ne može sakriti:** na telefonu se i bez lozinke i dalje vidi da je Erevos instaliran i da ga aplikacija za
  paniku smije obrisati, ali ne i što je u njemu bilo.
- **Obavještavanje drugih aplikacija (Android):** pod **Obavijesti druge aplikacije** biraš aplikacije koje Erevos
  obavještava kad briše, kao panik aplikacija, dugmetom, panik lozinkom ili panik aplikacijom. Svaka te prvo pita smije
  li Erevos. Fasouli se tada zaključa: zatvori se i pri otvaranju ponovo traži svoje zaključavanje.

**Zašto:** na granici ili pri uhićenju možda nema vremena otvoriti svaki razgovor. Jedan dodir, ili pokret aplikacije
za paniku, ne ostavlja ništa za otvoriti.

### Lozinka za paniku

Kad je zaključavanje lozinkom uključeno, isti zaslon ima i odjeljak **Lozinka za paniku**: zasebnu lozinku koja,
upisana na zaslonu za zaključavanje, briše Erevos kao **Obriši sve sada**. Na Androidu, u web aplikaciji, na računalu
i na Sailfish OS-u.

1. Dodirnite **Postavi lozinku za paniku**, upišite je dvaput (najmanje 4 znaka) i dodirnite **Sačuvaj**. Mora se
   razlikovati od svake lozinke vaših prostora: Erevos odbija onu koja otvara prostor, a lozinka nijednog prostora ne
   može to postati kasnije.
2. Upisana na zaslonu za zaključavanje, prikazuje **Pogrešna lozinka**, kao i svaka pogrešna, a Erevos odmah briše
   sve. Na Androidu se Erevos zatim zatvara, a sljedeći put se otvara kao tek instaliran, a brišu se i automatske
   rezervne kopije u njihovoj mapi kad je uključeno **I automatske rezervne kopije u** pod **Iz aplikacije za
   paniku**; drugdje ostaju.
3. **Isključi lozinku za paniku** opet je čini samo pogrešnom lozinkom. Ponovno postavljanje zamjenjuje prethodnu.
   Isključivanje zaključavanja lozinkom isključuje i nju.

- **Ništa je ne pokazuje:** Erevos od prvog pokretanja čuva mjesto za lozinku za paniku, nasumično dok se neka ne
  postavi i istog oblika poslije, i provjerava ga svakom lozinkom upisanom na zaslonu za zaključavanje, na isti način
  i jednako dugo. Zato ni ono što telefon čuva ni trajanje provjere ne pokazuju je li neka postavljena, a ni ovaj
  zaslon vam to ne može reći: ako niste sigurni, postavite je ponovo.
- **Samo na zaslonu za zaključavanje:** upisana bilo gdje drugdje gdje Erevos traži lozinku, samo je pogrešna lozinka.
  Rezervne kopije je čuvaju onakvu kakva je bila kad su napravljene. Dok pogrešni pokušaji tjeraju zaslon za
  zaključavanje da čeka (pogledajte [Zaključavanje lozinkom](#lock)), čeka i ona.

**Zašto:** netko vas može natjerati da otvorite Erevos. S lozinkom za paniku možete izgledati kao da dajete svoju, a
ono što bi vidio nestalo je prije nego što se zaslon promijeni.

## Obriši me odasvud {#forget}

Kad želiš da nestane ono što serveri čuvaju o tebi, u **Postavke** → **Privatnost i sigurnost** → **Obriši me odasvud**:
dodirni **Obriši me odasvud** i dvaput reci da. Tvoj telefon zadržava sve što ima; ovo nije [Gumb za paniku](#panic), koja
briše telefon.

- **Što nestaje:** svaki red koji ovaj prostor ima na relejima, s porukama koje u njemu čekaju: tvoj, onaj koji imenuje tvoju
  vezu za kontakt, redovi tvojih grupa, tvojih kontakata, tvog kućnog releja, {+oni za obavijesti Matrixa i XMPP-a, }vrata tvojih
  javnih grupa i povezanih uređaja. Također poruke koje relej drži da ih pošalje kasnije, datoteke koje su stigle i čekaju na
  njemu te pozivnice koje si napravio/napravila a nitko ih nije upotrijebio. Skriveni razgovori koji primaju i dok su zatvoreni
  odlaze s prostorom, ostali kad ih otvoriš dok je prostor zaustavljen. Popisi na ekranu izostavljaju skrivene razgovore, da
  nikad ne pokažu da ih ima. Erevos traži i od svakog Nostr releja da zaboravi ključeve na kojima tvoji razgovori
  čitaju (zahtjev da nestane, NIP-62): preko Tora kad je Tor uključen, izravno kad je isključen. Kad je Tor uključen, ali
  još nije spreman, Nostr se ne pita; pričekaj da bude i obriši ponovo.
- [+] **Matrix, XMPP, Nostr:** s opcijom **Odjavi se i s Matrixa i XMPP-a te obriši Nostr račun napravljen ovdje** ti se računi
  ovdje odjavljuju. Sami računi ostaju na svojim serverima, koji su njihovi, a ne Erevosovi. Nostr račun donesen iz druge
  aplikacije ostaje kakav jest.
- **Prostor se zaustavlja:** ne prima i ne šalje ništa, pa se nijedan red ne pravi odmah ponovo (Erevos sam iznova napravi izgubljen
  red). **Pokreni ponovo** to završava: prave se novi redovi, kao kad ih je relej izgubio, a kontakti se obavještavaju tiho. Daj im
  i novu vezu za kontakt, jer stare imenuju redove kojih više nema.
- **Do čega ne dopire:** telefona tvojih kontakata, Nostr releja koji ne rade što se traži{-, te}{+,} datoteka poslanih preko servera za
  datoteke{+ te Matrix i XMPP servera}. Zaslon navodi što je obrisano, što je već nestalo i što nije dosegnuto; **Obriši ponovo**
  pokušava ostalo.

**Zašto:** relej, čak i onaj kojem vjeruješ, mjesto je koje čuva nešto od tebe. Ovo je jedan dodir koji sve uzima natrag bez
brisanja telefona, za kad napuštaš relej ili zatvaraš poglavlje života.

## Uvezeni razgovori {#import}

Vaši stari razgovori iz Telegrama i WhatsAppa mogu doći u Erevos, za čitanje, sa svojim fotografijama, videozapisima,
glasovnim porukama i datotekama, a oni iz Vibera sa svojim riječima. Ostaju na ovom telefonu, zapečaćeni u prostoru u
koji ih unesete, i ne idu nikome, osim ako jedan podijelite s osobom s kojom je vođen (niže).

Prvo izvezite razgovor iz druge aplikacije:

- **WhatsApp:** otvorite razgovor, zatim **Više**, **Izvezi chat**, **Uključi medije**, i sačuvajte .zip na telefon.
  **Bez medija** donosi samo riječi.
- **Telegram Desktop:** **Izvezi historiju razgovora**, format **JSON**, s fotografijama, videozapisima, glasovnim
  porukama i datotekama koje želite. Zatim napravite .zip od foldera koji je napravio (na Windowsu: desni klik na
  njega, **Pošalji na**, **Komprimovana (zipovana) fascikla**) i kopirajte .zip na telefon. Samo **result.json**
  donosi samo riječi.
- **Viber:** sam Viber ne izvozi razgovore. Na Androidu, aplikacija **Backup Text for Viber** čuva razgovor kao
  .html datoteku: kopirajte je na telefon. Dolaze samo riječi, s Viberovim emotikonima kao emoji. Vaše vlastite
  poruke tamo nemaju ime, pa dolaze kao **Ja**, već izabrano kao vi. Poruke s datumom prije nego što je Viber
  postojao, kao 1970, potiču s telefona s pogrešnim satom: dolaze bez vremena.

Zatim:

1. U Erevosu otvorite **Postavke** → **Podaci i uređaji** → **Uvezeni razgovori** i dodirnite **Uvezi datoteku**, a
   zatim izaberite datoteku.
2. Erevos kaže šta je pronašao, s brojem fotografija i datoteka i koliko su ukupno velike. Dodirnite svoje ime, kako
   bi se vaše poruke prikazivale desno, i dodirnite **Zadrži**. Datoteke dolaze jedna za drugom, a Erevos kaže koliko
   ih je i koji je njihov dio unesen. **Otkaži** tada to zaustavlja i ne zadržava nijednu.
3. Sami obrišite izvezenu datoteku s telefona: Erevos čuva vlastitu zapečaćenu kopiju, ali datoteka koju ste
   sačuvali nije zapečaćena.

Da biste nastavili razgovor u Erevosu, i drugoj osobi treba Erevos:

1. S **Novi razgovor** dodajte je kao kontakt preko relaya, kao u [Razgovor preko relaya](#relay).
2. Otvorite uvezeni razgovor, dodirnite **Nastavi u Erevosu** i izaberite tu osobu.
3. Njen razgovor sada prikazuje stare poruke ispred novih, kao da su oduvijek bile u Erevosu: u oblačićima, po
   danima, s vremenima, i **Nastavljeno u Erevosu** između njih i novih. **Otvori razgovor** vodi vas tamo, a kontakt
   kojem niste dali ime preuzima ime uvezenog razgovora.

**Iznutra iz razgovora:** razgovor s kontaktom ima **Uvezeni razgovori** u svojim **Detalji**, iznad **Privatnost**.
**Uvezi razgovor ovdje** unosi datoteku direktno u taj razgovor, bez prolaska kroz **Postavke**: kad datoteka sadrži
nekoliko razgovora, kao što to radi Telegramov izvoz svih razgovora, pita koji se nastavlja ovdje i nudi najduži. Svaki
uvezeni razgovor koji se tamo nastavlja naveden je s tri dugmeta:

- **Samo u razgovoru** ga vadi iz **Postavke** → **Podaci i uređaji** → **Uvezeni razgovori**: prikazuje se samo u
  tom razgovoru, kao da je oduvijek bio tamo. Razgovor unesen iz detalja razgovora čuva se tako od početka.
  **Prikaži i u „Uvezeni razgovori“** ga vraća na popis, a to radi i sam popis, kad tog kontakta više nema.
- **Odvoji** prestaje ga prikazivati u razgovoru; ostaje u **Uvezeni razgovori**, za čitanje ili nastavljanje s
  nekim drugim.
- **Obriši** ga briše s telefona, s njegovim fotografijama i datotekama, nakon pitanja.

**Zašto:** stari razgovor pripada osobi s kojom je vođen, pa se unosi, čuva i briše tamo gdje s njom razgovarate, a
popis u **Postavke** čuva samo ono što nema kamo drugo. Ništa od toga ne napušta telefon, osim ako ga podijelite.

- **Fotografije, videozapisi, glasovne poruke i datoteke** dolaze iz .zip datoteke, svaka zapečaćena u ovom prostoru
  kao datoteka u razgovoru. Fotografije se prikazuju u razgovoru kad dođete do njih, a naljepnice kao naljepnice;
  dodirnite fotografiju ili datoteku da je vidite samu i **Sačuvaj** je. Glasovne poruke i pjesme puštaju se direktno
  u razgovoru dodirom; videozapis se pušta u vlastitoj aplikaciji telefona kad se sačuva. Zadržite prst na uvezenoj
  poruci da je **Kopiraj** ili **Otvori** njenu datoteku. **Traži u ovom razgovoru** pronalazi i uvezene poruke.
  Datoteke veće od 4 GB, i one koje izvoz ne sadrži, ostaju izvan, a razgovor kaže gdje je neka bila.
- **Prostor na telefonu:** dok .zip dolazi, telefonu treba otprilike dvostruko više slobodnog prostora od njegove
  veličine, jer Erevos čita njegovu kopiju i čuva datoteke zapečaćene. I uvezene datoteke su u rezervnim kopijama,
  kao i ostale datoteke.
- **Samo za čitanje:** uvezene poruke ne šalju se kao poruke, pa ih drugi telefon ima samo ako s njim podijelite
  razgovor. Erevos ne može pokazati ko ih je zaista napisao.
- **Obavještenja i pozivi** iz druge aplikacije izostavljaju se, a razgovor kaže koliko ih je.
- **I u skrivenim razgovorima:** u **Detalji** skrivenog razgovora, **Uvezi razgovor ovdje** zadržava razgovor s tim
  mjestom, šifriran njegovim ključem, i prikazuje ga samo u tom razgovoru, nikad u **Postavke** → **Podaci i uređaji**
  → **Uvezeni razgovori**; tamo se može samo obrisati. Razgovor premješten u skrivene razgovore nosi sa sobom
  razgovore uvezene u njega, koji se tamo čuvaju samo u njemu, i vraća ih ako se vrati.
- **Obriši poruke** u razgovoru ostavlja uvezene: njih obrišite u **Detalji** razgovora, pod **Uvezeni razgovori**,
  ili u **Postavke** → **Podaci i uređaji** → **Uvezeni razgovori**.

**Podijelite ga s tom osobom:** osoba s kojom se uvezeni razgovor nastavlja može ga i sama imati. U **Detalji** njenog
razgovora, pod **Uvezeni razgovori**, dodirnite **Podijeli s kontaktom** i njeno ime; u **Postavke** → **Podaci i
uređaji** → **Uvezeni razgovori** razgovor koji se s nekim nastavlja ima isto dugme, koje otvara razgovor s tom osobom.
Erevos kaže koliko poruka i koliko MB ide, i prvo pita. Zatim svi razgovori uvezeni s njom idu zajedno, ma koliko veliki
bili, svaka poruka sa svakom sačuvanom fotografijom, videozapisom, glasovnom porukom i datotekom, samo njoj, šifrirano s
kraja na kraj preko vašeg relaya, a razgovor kaže da ste ga podijelili.

- **Na njenoj strani** ne treba ništa raditi: njen {=Erevos} odmah čuva poruke, kaže u razgovoru ko ih je podijelio, odakle
  i koliko, i prikazuje ih prije novih, samo za čitanje, kao uvezeni razgovor. Fotografije i datoteke stižu postepeno, a
  ispod tog reda piše koliko ih je stiglo, **Datoteke: 3 od 10**. Strane su zamijenjene: ono što ste vi napisali
  prikazuje se kao vaše, s njene lijeve strane, a u razgovoru dvoje ono što je ona napisala prikazuje se kao njeno,
  desno; u grupi svako zadržava svoje ime. Čuva se samo u vašem razgovoru tamo, a može ga obrisati u njegovim
  **Detalji**. Njeni povezani uređaji čuvaju samo poruke.
- **Ponovo podijeljen**, zauzima mjesto kopije koju je imala, pa nikad nije tamo dvaput. Razgovor koji je neko podijelio
  s vama ne dijeli se dalje.
- **Samo s njom:** samo s Erevos kontaktom s kojim se razgovor nastavlja, nikad s grupom, i ne može se proslijediti. U
  skrivenim razgovorima radi isto, a na njenoj strani ostaje na mjestu gdje je vaš razgovor, i u skrivenim.
- **U krugovima:** fotografije i datoteke idu poslije poruka, po nekoliko desetina MB odjednom: svaki krug čeka na vašem
  relayu dok ga njen telefon ne preuzme i ne obriše tamo, i onda ide sljedeći. Tako ide razgovor bilo koje veličine,
  svaka datoteka do 4 GB, i treba mu malo prostora na relayu, koji dijele i druge datoteke; kad je relay pun, Erevos
  čeka i pita ponovo, svaki put malo kasnije. Nastavlja se kad god Erevos radi na oba telefona, i nakon što je neki bio
  ugašen ili van mreže neko vrijeme; krug koji se ne preuzme za 12 dana ponovo se stavlja na relay prije nego istekne.
  Datoteka u međuvremenu obrisana s ovog telefona navodi se kao ona koja je ostala.
- **Dokle je stiglo** vidi se ispod vašeg reda u razgovoru, **Dijeljenje, 40%**. Dodirnite ga za **Prekini dijeljenje**:
  ono što čeka na relayu se uklanja, a njen {=Erevos} briše ono što je stiglo. Ako ona obriše razgovore, zaustavlja se na
  isti način.
- **Sa relaya s kojeg njihov Erevos ne uzima sam**, razgovori čekaju kod njih dodir na njihov red; onda piše dokle su
  stigli, **Stiže, 40%**, a vaš red kaže **Dijeljenje · njihov telefon ga preuzima**. Ako nisu mogli doći, kažu to oba
  telefona, a njihov dvaput zavibrira: dodirnu ga da pokušaju ponovo. Uzimanje odande bez Tora pokazuje tom serveru
  njihovu internet adresu, i Erevos to prvo kaže.
- **Stariji Erevos** umjesto toga dobija datoteku, **Razgovor (Telegram).json**, s porukama unutra kao tekst, i nijednu
  fotografiju ni datoteku.

> Datoteka uvezenih razgovora raste s onim što unesete, pa njena veličina otprilike govori koliko je uvezeno, ali ne
> i u koji prostor.

## Izgled {#appearance}

**Izgled** prati Fasouli i LPHL stranicu. Nalazi se pod **Postavke** → **Izgled**, u dijelovima od kojih se svaki
otvara zasebno: **Stil i boje** (površina, staklo, stil, tema, boje i tekst na obojenim površinama opisani ispod, s
**Pregled**), **Pozadina**, **Poruke**, a na Androidu i **Ikone u pokretaču** i **Widget**.

| Postavka | Izbori |
| --- | --- |
| **Površina** | **Ravno**, ili **Glass** kao na lphl.nekten.eu. Staklo dolazi u dvije vrste: **Ploče** (svaka kartica je staklena ploča iznad pozadine) i **Jedna ploča** (svaki ekran na jednoj mat staklenoj ploči). |
| **Stil** | **Classic** (Erevosova tamna i zlatna), **Modernist** (Inter Tight), **Nocturne** (uvijek tamni, s vlastitim bojama), **Neon** (cijan i magenta LED svjetla koja sijaju, iznad mreže koja se pruža do sunca na zalasku), **Matrix** (zeleno na crnom u monospace pismu, s kodom koji pada u pozadini), **Paper** (plavo nalivpera na krem podlozi, u serifnom pismu, preko linija s crvenom marginom), **Aurora** (ljubičasto na skoro bijelom, mekano i zaobljeno, iznad mrlja svjetla boje mente, jorgovana i breskve), **Material You** (vlastite boje telefona, na Androidu 12 i novijem) i **Prilagođeno** (vaša vlastita pozadina i naglasak). |
| **Tema** | **Prema uređaju**, **Svijetla** ili **Tamna**. Nocturne, Neon i Matrix su uvijek tamni, Paper i Aurora uvijek svijetli, a Prilagođeno je svijetlo ili tamno, kakva je njegova pozadina. Material You je prati. |
| **Boje** | Vlastite boje stila, jedna od dvanaest LPHL paleta, ili **Moja boja**. Izbor palete pod stilom s vlastitim bojama vraća stil izabran prije. |
| **Prilagođeno** | Kad je izabrano **Prilagođeno**: njegova **pozadina** (osam svijetlih, osam tamnih) i njegov **naglasak**. Tekst i površine prave se iz pozadine, a svaka boja se provjerava da je čitljiva na njoj. |
| **Tekst na obojenim površinama** | **Bijela**, **Kao u paleti** ili **Moja boja**. |
| **Font** | Slova svakog teksta: **Kao u stilu**, **Kao na telefonu**, **Serifni** (sitne crtice na krajevima slova, kao u knjigama) ili **Jednake širine** (svako slovo jednako široko, kao na pisaćoj mašini). |
| **Pozadina** | Ono što je iza svakog ekrana: **Zadano za stil** (vlastita scena ili sjaj stila), **Jednobojno**, ili uzorak blago iscrtan u boji naglaska: **Kružići**, **Mreža**, **Pruge**, **Zvijezde**, **Svjetla** (meki krugovi svjetla) ili **Gradijent**; ili **Fotografija**, vaša vlastita fotografija, smanjena, ponovo iscrtana i zapečaćena, ispod vela kako bi tekst bio čitljiv (**Promijeni fotografiju** bira drugu). Ekran za lozinku umjesto toga prikazuje vlastitu pozadinu stila. |
| **Poruke** | Kako razgovor iscrtava poruke: oblačići **Zaobljeno** ili **Uglato**, ili **Linija**, bez oblačića, s linijom pored teksta, kao u zapisniku. |
| **Veličina teksta** | Koliko je velik tekst poruka: **Mali**, **Normalni**, **Veliki** ili **Veći**. Ostatak ekrana ostaje kakav jest. |

Tek instaliran Erevos počinje s **Glass** (**Ploče**), **Modernist**, **Prema uređaju**, **Moja boja** u nebeskoplavoj, tekstom **Kao u paleti**, fontom **Kao na telefonu** i porukama **Uglato**. Izgled izabran ranije ostaje kakav je bio.

Neon, Matrix, Paper i Aurora iscrtavaju vlastitu scenu iza svakog ekrana, Prilagođeno zadržava pozadinu koju ste
izabrali, a Material You boje telefona, pa **Glass** čeka dok su oni izabrani. Kiša stoji
mirno kad je telefon podešen na smanjenje pokreta.

**Pregled** prikazuje nekoliko poruka i dugmadi u izgledu koji ste izabrali. Svaka kombinacija se provjerava kako bi
tekst uvijek bio dobro čitljiv, i na staklu.

- **Svaki prostor zadržava vlastiti izgled.**
- **Ekran za lozinku** prikazuje posljednji korišteni izgled. Zato se čuva izvan zapečaćenih podataka: ne govori ništa
  o vašim razgovorima, ali onaj ko otvori telefon vidi koji izgled koristite.
- **Material You** uzima boje koje Android pravi iz vaše pozadine (Android 12 i noviji), svijetle ili tamne kako kaže
  **Tema**, sa zaobljenim dugmadima i blago zaobljenim karticama, u vlastitom fontu telefona. Nova pozadina mijenja ih
  i u Erevosu, kad se ponovo prikaže. Čitaju se na telefonu i ne idu nikud. Na starijem Androidu i na računaru se ne
  nudi.
- **Ikone u pokretaču** (Android): boja svake Erevosove ikone među aplikacijama telefona, **Erevos** (crvena, otvara
  Erevos razgovore, ili razgovor koji ste ostavili otvoren), **Telefon** (zelena, otvara tastaturu), **SMS** (plava,
  otvara SMS popis) i **Kontakti** (ljubičasta): crvena, narandžasta, zelena, plava, ljubičasta ili tamna. Svaki dodir
  otvara ono što njegova ikona navodi, i kad je Erevos prikazivao neku drugu od njih. Boja pripada telefonu, a ne
  svakom prostoru, jer se ikone prikazuju prije nego što se Erevos otključa. Nakon promjene neki pokretači uklanjaju
  ikonu s početnog ekrana: ponovo je dodajte s popisa aplikacija.
- **Tačke i brojevi na ikonama** (Android): Android daje tačku ili broj obavijesti aplikaciji, a ne jednoj od njenih
  ikona, pa na većini pokretača, poput onih na Pixelu i GrapheneOS-u, Samsungovog, Xiaomijevog i Kvaesitsa, svaka
  obavijest Erevosa (poruka, SMS, poziv, rođendan) izgleda jednako na ikonama Erevos, Telefon, SMS i Kontakti; tu
  Erevos to ne može promijeniti. Da tačka ostane samo za neke obavijesti, isključite je za ostale u postavkama
  Androida za Erevosove obavijesti, gdje svaka vrsta obavijesti ima svoj prekidač. Pokretači Huaweija i Honora primaju
  broj za svaku ikonu: tamo, uz **Postavke** → **Obavijesti** → **Broj na ikoni** → **Prikaži broj**, Erevosova
  vlastita ikona pokazuje poruke koje broji njegova obavijest, ikona SMS nepročitane SMS poruke, ikona Telefon
  propuštene pozive, a ikona Kontakti današnji rođendan, svaki broj samo na svojoj ikoni.
- **Kalkulator umjesto Erevosa** (Android, pod **Ikone u pokretaču**): kalkulator koji radi prikazuje se među
  aplikacijama telefona umjesto ikone Erevosa. Dodirnite **Stavi kalkulator na njegovo mjesto**, dvaput upišite kod od
  4 do 12 cifara i dodirnite **Sačuvaj**. Od tada otvarajte kalkulator, upišite kod, pa **=**: Erevos se otvara i
  traži svoju lozinku kao uvijek. Svaki drugi račun samo je račun. **Promijeni kod** ga mijenja; **Ponovo prikaži
  ikonu Erevosa** vraća ikonu, u njenoj boji, i zaboravlja kod. Skrivena je samo ikona: Androidov popis aplikacija,
  obavijesti, nedavne aplikacije te ikone Telefon, SMS i Kontakti i dalje pokazuju Erevos. Telefon čuva samo hash
  koda: to su vrata, a ne brava. Kad se Erevos obriše, lozinkom za paniku ili Androidovim **Obriši pohranu**, nijedan
  kod ga više ne otvara: kalkulator tada otvara Erevos, kao novi, a Erevosova ikona vraća se na njegovo mjesto.

  **Zašto:** ko god baci pogled na telefon vidi kalkulator, a ne aplikaciju za poruke; lozinka i dalje čuva ono što je
  unutra.
- **Widget** (Android): redoslijed četiri dugmeta widgeta, slijeva nadesno, s widgetom iscrtanim onako kako će
  izgledati. Dodirnite ↑ ili ↓ da pomjerite dugme; **Početni redoslijed** ih vraća.
- **Vibracija na dodir** (Android): kratka vibracija kad dodirneš tipku na tastaturi, Pošalji, Enter ili prekidač, i kad se otvori meni; nikad dok skroluješ. Uključena je, osim ako je ovdje ne isključiš. Pripada telefonu, ista u svakom prostoru.

## Na računaru {#desktop}

Erevos radi i na računaru, s Linuxom, macOS-om ili Windowsom, kao zasebna aplikacija. Razgovara preko relaya,
šifrirano s kraja na kraj kao na telefonu, i čuva svoje kontakte, poruke i postavke zapečaćene na isti način.

1. Instalirajte ga. Na Linuxu: paket za sisteme zasnovane na Archu (\`erevos-linux-x86_64.pacman\`, sa
   \`sudo pacman -U\`) ili AppImage. Na Macu: otvorite sliku diska i prevucite Erevos u Applications. Nema plaćeni
   Appleov potpis, pa ga prvi put dozvolite pod **Postavke sistema → Privatnost i sigurnost → Ipak otvori**. Na
   Windowsu 10 ili 11: pokrenite \`erevos-windows-x64-setup.exe\`, koji instalira Erevos samo za vas, bez
   administratora, i stavlja ga u meni Start; ili držite \`erevos-windows-x64-portable.exe\` gdje želite i pokrenite
   ga, bez ikakve instalacije. Nijedan nema plaćeni potpis, pa prvi put Windows kaže da je zaštitio vaš računar:
   dodirnite **Više informacija**, a zatim **Ipak pokreni**.
2. Postavite relay i dodajte kontakte kao na telefonu, pogledajte [Razgovor preko relaya](#relay). **Kopiraj moj
   link za kontakt** kopira vaš link, da ga zalijepite tamo gdje treba.

- **Šta radi samo telefon:** Bluetooth, Wi-Fi Aware i LoRa, i njihovi testovi. Kontakte na istoj Wi-Fi mreži dosiže
  kao i telefon, pogledajte [Razgovor s telefonom u blizini](#nearby). Ostalo je isto: prostori i druga lozinka,
  skriveni razgovori, glasovne poruke, uvezeni razgovori i rezervne kopije.
- **Gdje čuva stvari:** u vlastitom folderu (na Linuxu \`~/.config/Erevos\`, na Macu
  \`~/Library/Application Support/Erevos\`, na Windowsu \`%APPDATA%\\Erevos\`), zapečaćene kao na telefonu.
  Njegovo spremište ključeva zapečaćeno je privjeskom za ključeve sistema (na Macu Keychain, na Windowsu ključ vašeg
  Windows naloga). Na Linux sistemu bez privjeska za ključeve (KWallet ili GNOME Keyring), ili s onim koji Erevos ne
  pronalazi, Erevos se otvara s napomenom i ne čuva ništa: pokrenite privjesak za ključeve ili Erevosu dajte
  \`--password-store=gnome-libsecret\`. Pokrenut s \`--plain-secrets\`, svoje spremište ključeva čuva tamo onakvo kakvo
  jeste, čitljivo vašem korisniku: tada postavite zaključavanje lozinkom. Prenosiva Windows aplikacija čuva svoje
  stvari u istom folderu kao i instalirana, a deinstalacija ih ostavlja tamo.

**Zašto:** bez privjeska za ključeve, spremište ključeva ležalo bi na disku onakvo kakvo jeste, čitljivo vašem
korisniku, pa Erevos tamo ne čuva ništa osim ako to ne izaberete sa \`--plain-secrets\`: nijedno mjesto za lozinku tamo
ne leži nezapečaćeno iznenada.

- **Windowsov zaštitni zid** pita, prvi put kad se Erevos otvori, smije li koristiti mrežu. Dozvolite to na privatnim
  mrežama, inače ga telefoni i računari na istoj Wi-Fi mreži ne mogu dosegnuti; relayi rade u oba slučaja.
- **Glasovne poruke** snimljene na računaru su Opus, a na telefonu AAC. Obje se puštaju na oba.
- **Fotografije** dolaze iz datoteka računara; kamere nema. **Sačuvaj** pita gdje da stavi fotografiju ili datoteku.
- **Računar i telefon mogu dijeliti nalog:** povežite računar s telefonom, i oba imaju iste razgovore i kontakte,
  pogledajte [Povezani uređaji](#devices). Ili rezervna kopija premješta sve s jednog na drugi, pogledajte
  [Rezervne kopije](#backup), a od tada koristite samo jedan.
- **U pozadini:** kad zatvorite njegov prozor, Erevos radi i dalje u sistemskoj traci (na Macu, u Docku), osim ako to
  isključite: **Postavke** → **Obavijesti** → **U pozadini** → **Izađi pri zatvaranju**. I dalje čeka na relayu: poziv
  zvoni, vlastitim zvonom, i vraća prozor, a obavijest kaže koliko poruka nije pročitano, nikad od koga ni šta, dok se
  Erevos opet ne prikaže. Otvarate ga preko njegove ikone u sistemskoj traci, ili ponovnim pokretanjem Erevosa, a
  izlazite iz njega preko menija te ikone (na Macu, preko njegovog menija). Gdje radna površina ne prikazuje sistemsku
  traku, kao GNOME bez proširenja za to, ponovno pokretanje Erevosa vraća prozor. Kad iz njega izađete, ne prima ništa:
  poruke čekaju na relayu, a poziv se prikazuje kao propušteni poziv kad se otvori.
- **Pozivi** zvone dok se Erevos vidi, vlastitim zvonom: dva kratka svake 3 sekunde, dok se poziv ne primi ili ne
  završi.
- **Dosad testirano** na Linuxu. Verzije za Mac i Windows grade se i otvaraju na GitHubovim računarima, još ne od
  strane neke osobe.

## Povezani uređaji {#devices}

Isti nalog na telefonu i na računaru, ili u pregledniku: isti razgovori, kontakti i poruke na oba. Telefon ostaje
nalog: samo on dodaje kontakte, te povezuje i odvaja uređaje. Svaki povezani uređaj ima vlastite ključeve, koje
telefon potpisuje u popis uređaja naloga i daje svojim kontaktima. Kontakti s ovom verzijom tada pišu i svakom
uređaju, šifrirano s kraja na kraj, pa on dobija njihove poruke i kad je telefon isključen; za one sa starijim
verzijama telefon prosljeđuje računaru ono što stigne i za njih zapečaćuje ono što računar napiše. Kontakti vide isti
nalog i isti sigurnosni broj, bez obzira na to koju verziju Erevosa imaju.

**Zašto:** svaki uređaj ima vlastite ključeve, nikad kopiju ključeva naloga: Erevos nema server koji bi mogao
isključiti izgubljeni uređaj, pa uređaj nikad nije ništa više od stavke na popisu koji telefon potpisuje, a odvajanje
je dovoljno. Popis uvijek ima četiri mjesta, a ona koja nijedan uređaj ne zauzima sadrže ključeve napravljene uzalud,
pa kontakti ne mogu saznati koliko uređaja imate. A s telefonom kao nalogom, kontakti s bilo kojim starijim Erevosom
dosežu vas kao i prije.

Da povežete računar:

1. Na računaru, u prostoru bez vlastitih razgovora (nova instalacija, prostor koji otvara nova lozinka ili razgovori
   povezanog računara vraćeni iz njegove rezervne kopije), otvorite **Postavke** → **Podaci i uređaji** → **Povezani
   uređaji**. Ondje se **Poveži s mojim telefonom** nalazi na prvom mjestu i odmah prikazuje mali QR kod: ništa se ne
   upisuje.
2. Na telefonu skenirajte kod kamerom: Erevos pita **Poveži … s ovim telefonom?** Izaberite koji dio historije
   ide (**Sve**, **Posljednji mjesec**, **Posljednja sedmica** ili **Ništa**), da li **I fotografije i datoteke**, pa
   dodirnite **Poveži**. To je sve: telefon daje računaru ono što mu treba preko Nostra, šifrovano od kraja do kraja,
   računar telefonu pokazuje vlastiti kod, a sigurnosni kodovi se upoređuju sami, pa vi ništa ne upisujete niti
   upoređujete.
3. Ako se Nostr ne može dosegnuti, ili računar ne može koristiti relay, javlja to. Ondje dodirnite **Poveži
   drugačije**: ako traži relay, LPHL-ov je već upisan, pa dodirnite **Prijava preko LPHL** za vlastiti token računara,
   ili upišite drugi relay i njegov token. Dajte ime uređaju i dodirnite **Poveži s mojim telefonom**: tada prikazuje
   veći QR kod. Skenirajte ga telefonom, ili kopirajte kod, zalijepite ga na telefonu pod **Kod s računara** i
   dodirnite **Dalje**. Telefon prikazuje ime računara i kod od četiri grupe po pet cifara; izaberite kao gore i
   dodirnite **Poveži**.
4. Samo tako i računar prikazuje kod: ako je isti kao na telefonu, dodirnite **Podudaraju se**. Ako nije, dodirnite
   **Razlikuju se**: neko drugi je možda pročitao njegov QR kod, a njemu ništa nije otišlo. Skriveni razgovori povezuju
   se samo tako, iznutra, s punim kodom.

Razgovori tada stižu na računar, a nakon njih i izabrane poruke.

- **Poruke** od kontakata stižu na oba, a svaki ih čuva jednom: poruka koja ponovo stigne u roku od 30 dana (do 2000
  od jednog kontakta) ne čuva se ponovo, čak ni nakon što je tamo nestala ili je obrisana. Za to svaki uređaj čuva,
  30 dana, koje su poruke stigle i kojeg dana, ali ne i šta su rekle, i nakon što su nestale ili obrisane, i u
  rezervnoj kopiji napravljenoj u međuvremenu; telefon to čuva i za kontakt koji je povezao uređaj. Ono što napišete
  na računaru ide kontaktu s ovom verzijom direktno s njega, kad je on pisao računaru, a inače preko telefona:
  telefon to prikazuje kao vaše, a kontakt to dobija od naloga. Ono što napišete na telefonu prikazuje se i na
  računaru. Oznake čitanja, reakcije, prikvačene poruke, glasovi, brisanje s oba telefona, imena, tajmeri, izgledi i
  slike razgovora, prikazivanje kao da niste na mreži i prihvatanje zahtjeva idu u oba smjera. Zvjezdica, ili brisanje
  na **Ovaj telefon**, urađeno na telefonu ide i na računar; urađeno na računaru, ostaje tamo.
- **Kad je telefon isključen**, kontakti s ovom verzijom i dalje dosežu računar, a računar njih: stiže ono što pišu,
  čitaju i na šta reaguju, a ide ono što vi pišete. Ako telefon ostane isključen toliko dugo da se njegov red na
  relayu napuni (1000 poruka), ono što pišu i čitaju i dalje stiže na računar, dugačka glasovna poruka cijela; ono na
  šta reaguju, što prikvače, za šta glasaju ili što obrišu, kao i njihovi pozivi, ne prolazi dok se telefon ponovo ne
  uključi. Za kontakte sa starijim verzijama (i njihovo dodavanje) i grupe **telefon
  mora biti uključen** i dosezati relay: ono što računar u međuvremenu napiše čeka na relayu i odlazi kad se telefon
  vrati. Nekoga novog čiji je link kontakta iz ove verzije računar dodaje i kad je telefon isključen: sam započinje
  razgovor s njim, ta osoba vidi tvoj račun kao zahtjev, a telefon je dodaje i sam čim se uključi. Dva ili više povezanih uređaja dosežu i jedni druge direktno: kad je telefon isključen, svaki i dalje
  prikazuje ono što drugi pišu, čitaju i na šta reaguju, i promjene koje prave na kontaktima; onaj koji je propustio
  prvu poruku drugog dobija novu dan ili više kasnije. Računar koji je bio isključen duže nego što relay čuva poruke
  (14 dana), ili je propustio prvu poruku kontakta njemu, ipak dobija ono što taj kontakt napiše kasnije: njegov
  {=Erevos} počinje ispočetka s njim dan ili više kasnije, zatim sve rjeđe, dok ne odgovori. Nakon što vas kontakt
  obriše i ponovo doda, računar počinje ispočetka i s njegovim uređajima.
- **Fotografije i datoteke** koje stignu ostaju na relayu dok ih ne preuzmu i telefon i računar; tada ih telefon tamo
  briše. Ona koju računar nikad ne preuzme nestaje kad se on odvoji, ili nakon 14 dana, kao i svaka nepreuzeta.
- **Razgovor sa sobom** je isti na svakom uređaju: bilješka, fotografija, datoteka ili glasovna poruka napisana na
  jednom ide na ostale, kao i podsjetnik koji ste postavili, promijenili ili vidjeli i bilješka koju ste obrisali; od
  dvije promjene iste bilješke ostaje kasnija. Ono što je napisano prije povezivanja ide jednom, u oba smjera, čim oba
  imaju ovu verziju. Podsjetnik se prikazuje na svakom uređaju u svoje vrijeme, a viđen na jednom nestaje s ostalih.
  Fotografija ili datoteka bilješke ide kao kopija na relayu, tamo obrisana čim je preuzeta, ili, za dva uređaja ili
  više, ostavljena tamo dok ne istekne (14 dana). Bilješke skrivenih razgovora idu samo unutar njihove vlastite veze,
  niže.
- **Postavke:** jezik, izgled (stil, boje, veličina teksta) i **Posljednji put viđen** isti su na svim uređajima
  prostora: promijenjeni na jednom, mijenjaju se i na drugima. Fotografija iza ekrana ostaje na uređaju na kojem je
  izabrana, kao i sve što se tiče samo jednog uređaja: lozinke, PIN-ovi i kod za paniku, vrijeme zaključavanja,
  vibracija, relej i Tor, moduli, ime uređaja. Uređaj koji treba da zadrži svoje: **Postavke** → **Podaci i uređaji**
  → **Povezani uređaji** → **Iste postavke na svim uređajima** isključeno. Ponovo uključen, odmah preuzima postavke
  drugih. Skriveni razgovori zadržavaju svoje.
- **Preko Tora za jedan razgovor:** prekidač **Preko Tora** u **Detaljima** Erevos razgovora isti je na svakom
  uređaju: uključen ili isključen na jednom, uključen je ili isključen na svima. Na uređaju bez Tora, kao što je web
  aplikacija, taj razgovor ne šalje ništa dok je uključen. Uređaj sa starijom verzijom ga nikad ne isključuje na
  ostalima. Vidi [Preko Tora](#tor).
- **Na istom Wi-Fiju:** telefon i računar na istom Wi-Fiju ili hotspotu (s uključenim **Pronađi Erevos na istoj Wi-Fi mreži**)
  daju jedno drugom ono što se mijenja direktno tamo, i bez interneta; relej ipak dobija svoju kopiju, koja tada ništa
  više ne mijenja. Samo prostora: veze skrivenih razgovora idu preko releja.
- **Pozivi** zvone na telefonu i na računaru. Javite se na bilo kojem: drugi prestaje zvoniti i kaže da je poziv
  prihvaćen na drugom uređaju. Odbijanje poziva na jednom odbija ga na oba. S kontaktom s ovom verzijom računar sam
  zove i prima pozive, i kad je telefon isključen; s kontaktom sa starijom verzijom zove preko telefona, koji mora
  ostati uključen samo da uspostavi poziv. U oba slučaja sam poziv ide direktno između računara i kontakta, šifriran
  između njih.
- **Pošalji kasnije** radi i na računaru. Kontaktu s ovom verzijom računar sam predaje poruku relayu, uz kopiju za
  svaki njegov uređaj, pa ona ode u svoje vrijeme i kad je vaš telefon isključen, a stigne na njegove uređaje i kad je
  njegov telefon isključen; kontaktu sa starijom verzijom ide preko telefona. Svaki vaš uređaj je pokazuje kao
  zakazanu, a ako je obrišete na bilo kojem prije njenog vremena, povlači se svuda.
- **Grupe** su i na računaru, s njihovim porukama, fotografijama, datotekama i glasovnim porukama. Pišite u njima,
  odgovarajte, reagujte, glasajte, prikvačujte, brišite svoje poruke za sve, dodajte i uklanjajte članove,
  preimenujte grupu ili je napustite, tamo kao i na telefonu: telefon to radi za računar, kao svoje. Fotografija ili
  datoteka koju telefon čuva ide na računar kao kopija na relayu, koja se tamo briše kad je računar preuzme. Ono što
  članovi kasnije urade s porukom (reakcija, glas, prikvačivanje, brisanje za sve) prikazuje se i na računaru, kao i
  zvjezdica ili brisanje na **Ovaj telefon** urađeno na telefonu. Poruka koju telefon nije mogao poslati u grupu (na
  primjer u grupu zatvorenu u međuvremenu) prikazuje se na računaru kao **Telefon nije poslao**. Pravljenje grupe,
  javne grupe i grupni pozivi za sada ostaju na telefonu.
- **Grupe ostaju na** uređaju po tvom izboru: na telefonu, pod **Postavke** → **Podaci i uređaji** → **Povezani
  uređaji** → **Grupe ostaju na**, izaberi **Ovaj telefon** ili povezani računar. Ključevi grupa se tada premještaju
  tamo, nikad kopirani, pa grupe tamo rade i kad je telefon isključen, i tamo se mogu praviti nove; telefon i ostali
  uređaji pišu u njima preko njega, pa mora biti uključen. Članovi ne vide ništa novo: tebe, kao i uvijek, samo što tvoje
  grupne poruke stižu u drugi red. Za premještanje oba moraju biti uključena i relay, a javne grupe ostaju na telefonu
  (prvo izađi iz njih). Da bi odvojio taj računar, prvo vrati grupe na telefon. Ako je izgubljen, ipak ga odvoji: grupe se tada na
  telefonu prikazuju kao napuštene. Računar sa starijim Erevosom ne može ih držati.
- **Skriveni razgovori i druge lozinke** nikad ne idu s vezom prostora: svaki se povezuje zasebno, iznutra. Za mjesto
  skrivenih razgovora: na računaru otvorite to mjesto njegovim PIN-om, novo i prazno kakvim ga ostavlja novi PIN, i
  dajte mu vlastiti red na relayu pod **Za napredne korisnike** tamo; zatim dodirnite **Povezani uređaji** ispod
  njegovog popisa, i **Poveži s mojim telefonom**. Na telefonu otvorite isto mjesto njegovim PIN-om, dodirnite
  **Povezani uređaji** ispod njegovog popisa i skenirajte kod računara kamerom dok mjesto ostaje otvoreno, ili ga tamo
  zalijepite; zatim kao gore. Kod prikazan na mjestu povezuje samo mjesto, a kod prostora samo prostor: ako ga pročita
  drugo, jednostavno nestane, a **Poveži s mojim telefonom** počinje ispočetka na računaru. Mjesto tada ima vlastitu vezu, s vlastitim ključevima i vlastitim
  popisom uređaja, koji potpisuje njegov vlastiti račun, pa njegovi kontakti s ovom verzijom pišu izravno na mjesto
  računara. Njegove poruke, kontakti, grupe, pozivi, fotografije i datoteke i njegov Razgovor sa sobom idu između dva
  mjesta kao oni prostora između povezanih uređaja{+, a tako i njegovi vlastiti računi Matrix, XMPP i Nostr, uvijek, i ponovo kad se promijene}. Ništa od toga se ne vidi u prostoru, na njegovim ekranima ni na
  njegovim povezanim uređajima, a veza prostora nikad ne nosi ništa od nekog mjesta: ono što mjesto čuva o svojoj vezi
  šifrirano je njegovim vlastitim ključem, među vrijednostima napravljenim ni za šta za ostala mjesta, u datoteci iste
  veličine bilo da je neko mjesto povezano ili nijedno. Veza radi dok je mjesto otvoreno, i dok je zatvoreno ako je
  **Primanje dok su zatvoreni** uključeno; zatvoreno bez toga, ništa od njega se ne usklađuje, a ono što stiže čeka na
  relayu (14 dana) dok se ne otvori, na obje strane. Na računaru nove grupe i grupni pozivi ostaju na telefonu, razgovor
  se ne može premjestiti u mjesto niti iz njega (premjestite ga na telefonu), a poziv javljen tamo zaustavlja zvonjenje
  telefona samo dok je mjesto otvoreno na telefonu. Skriveni razgovori pišu uređajima kontakta s ovom verzijom kao i
  vaši ostali razgovori, pa ih oni dobijaju i kad je telefon kontakta isključen, a kontaktu izgledaju kao razgovori
  telefona koji nikad nije povezao uređaj. Razgovor premješten u skrivene razgovore na telefonu napušta računar.
  Premješten u skrivene razgovore, ili iz njih u vaše razgovore, razgovor piše samo telefonu kontakta, kao stariji
  {=Erevos}, dok se ne vrati tamo gdje je napravljen: njegovom Erevosu se to prvo javlja, pa njegovi uređaji prestaju
  pisati vašim, a on iz toga može saznati da je razgovor prestao znati za povezane uređaje: ako mu je dao popis vaših
  uređaja, da je otišao u skrivene razgovore. Prostor koji otvara druga lozinka povezuje se samo iznutra, s vlastitim
  uređajima.
- **Ponovo prenesi poruke**, na telefonu, ponovo šalje dio historije, s njegovim reakcijama, prikvačenim porukama,
  glasovima i zvjezdicama; ono što računar već ima ne čuva se dvaput.
- [+] **Matrix, XMPP i Nostr**: dobija ih svaki povezani uređaj, i prate promjene na telefonu: račun iz kojeg se tamo odjavi, ili zamijenjen drugim, nestaje i s uređaja. Računar se prijavljuje na Matrix i
  XMPP račune ovog prostora i uzima ključ njegovih Nostr razgovora, svaki kao novi uređaj za sebe: telefon zadržava
  svoj. Za računar koji je već povezan dodirnite na telefonu **Pošalji račune** ispod njega. XMPP i Nostr stižu sami.
  Matrix server rijetko dopušta da telefon prijavi novi uređaj: tada to kaže **Povezani uređaji** na računaru, a
  **Prijavite se na Matrix** tamo otvara Matrix s upisanim ID-om, jednom, za lozinku. Ključevi računa dolaze s
  telefona, pa nisu potrebni ni sigurnosni ključ ni provjera emojijima, a ranije poruke se otvaraju iz njegove
  rezervne kopije ključeva. Računar koji već ima vlastiti račun na nekoj od tih mreža zadržava ga, a ono što još nije
  moglo stići (na primjer jer nije bilo veze) pokušava se ponovo svaki put kad se otvori. Kad se odvoji, računar se
  odjavljuje s računa koje je prenio. Mjesto skrivenih razgovora povezano zasebno daje svoje vlastite račune na isti
  način, iz svojih vlastitih **Povezani uređaji**, na isto mjesto na računaru: nikad one prostora, a oni prostora
  nikad ne idu njemu. Svaki uređaj se prijavljuje kao on sam, nikad s kopijom ključeva telefona, koja bi se tada
  koristila dvaput i pokvarila šifriranje; tako se svaki može odjaviti sam, s uređaja računa.
- **SMS**: SMS poruke telefona mogu se prikazati i na uređajima, i odgovara im se tamo preko telefona, kad se uključi
  pod **Postavke** → **Telefon i SMS** → **SMS** → **I na mojim povezanim uređajima**, vidi [SMS](#sms).
- **Odvoji**, na telefonu, odmah isključuje uređaj: ništa mu više ne ide, i ništa što pošalje ne prima se. Kontaktima
  s ovom verzijom to se javlja sljedeći put kad telefon dođe do relaya: prestaju mu pisati i više ništa od njega ne
  primaju. Tako se isključuje izgubljeni računar. Ako je uključen, to mu se javlja, a razgovori naloga ga napuštaju. Na
  računaru, **Odvoji ovaj uređaj** radi isto odande.
- **Do četiri** uređaja povezuje se s jednim telefonom. Rezervna kopija ne nosi veze, ali nakon vraćanja kopije na
  drugom telefonu, taj telefon traži od svakog uređaja koji je još vaš da se ponovo poveže, jednim dodirom na svaki,
  pogledajte [Rezervne kopije](#backup).

## Na iPhoneu, iz preglednika {#iphone}

Erevos nema aplikaciju u App Storeu. Na iPhoneu radi kao web-aplikacija, dodana na početni ekran iz Safarija, bez
Apple naloga. Razgovara preko relaya, šifrirano s kraja na kraj kao na telefonu, i čuva svoje kontakte, poruke i
postavke zapečaćene na isti način, u Safarijevoj pohrani za aplikaciju.

1. Otvorite u pregledniku **Safari** adresu Erevos servera koju ste dobili. Erevos pokazuje kako da ga dodate: dodirnite
   **Podijeli** (na iOS-u 26, pod **•••**), zatim **Dodaj na početni zaslon**, a zatim otvorite Erevos s početnog
   ekrana. Potreban je iOS 17 ili noviji.
2. U Erevosu otvorite **Postavke** → **Privatnost i sigurnost** → **Ova web-aplikacija** i uporedite otisak ključa
   izdanja s onim koji ste dobili uz adresu, znak po znak. Ako se razlikuje, obrišite aplikaciju i javite to onome ko
   vam je dao adresu.
3. Postavite zaključavanje lozinkom (u Erevosu, **Postavke** → **Privatnost i sigurnost** → **Zaključavanje i druga
   lozinka**). Na webu je to najvažnije: pogledajte ispod.
4. Postavite relay i dodajte kontakte kao na telefonu, pogledajte [Razgovor preko relaya](#relay).

**Kako sama sebe provjerava.** Web-aplikacija je kôd koji šalje server, pa bi server koji je provaljen, ili kojem je
to naređeno, mogao poslati izmijenjen kôd. Erevos tom kodu ne vjeruje na riječ:

- Prvi put kad se otvori, preuzima svoj kôd s popisom svih datoteka i njihovih otisaka, potpisanim ključem izdanja,
  koji ima samo osoba koja pravi izdanja; server ga nema. Provjerava potpis i svaku datoteku, čuva ih na iPhoneu i od
  tada pokreće samo njih. Server ih ne može promijeniti.
- Ažuriranje se prihvata samo ako je potpisano istim ključem i novije od onog koje se koristi; pokreće se sljedeći
  put kad se Erevos otvori. Nepotpisano ili starije se odbija, i Erevos to kaže.
- Ko god želi, može provjeriti server: \`node pwa/release.mjs verify https://<adresa>\` provjerava potpis i svaku
  datoteku koju server daje, a \`scripts/reproduce-web.sh <verzija> https://<adresa>\` ponovo gradi to izdanje iz
  njegovog izvornog koda i provjerava da svaka datoteka ispada ista.

**Šta preostaje.** Ovo su stvarna ograničenja; znajte ih:

- **Prvi put** kad je otvorite, vjerujete serveru: on šalje dio koji provjerava. Korak 2 je način da otkrijete
  pogrešan.
- **Sam dio koji provjerava** (service worker) Safari ponovo preuzima najmanje jednom dnevno, i Safari ga može
  zamijeniti a da ne pita Erevos. Erevos tada provjerava novi prema potpisanom izdanju i upozorava vas (**Erevos je
  izmijenjen bez dozvole**), ali server koji zna kako mogao bi zaobići tu provjeru. Ako vidite upozorenje, ne otvarajte
  ponovo Erevos s tog servera dok se to ne objasni. Sa zaključavanjem lozinkom vaši razgovori ostaju zapečaćeni.
- **Nema Bluetootha ni veze u blizini**, ni SMS-a: Safari ih ne dozvoljava.
- **Samo dok je otvorena:** iOS zaustavlja web-aplikacije u pozadini, pa poruke stižu kad otvorite Erevos; do tada
  čekaju na relayu.
- **Pozivi** zvone dok je Erevos otvoren, vlastitim zvonom: dva kratka svake 3 sekunde. Safari ga pušta da zvoni tek kad
  ste dotakli Erevos otkad se otvorio, i ne kad je iPhone na nečujnom. Dok je Erevos zatvoren, poziv ne zvoni: prikazuje
  se samo obavijest „Poziv“, ako su obavijesti uključene. Apple web-aplikaciji ne dopušta ništa više; da zvoni kao
  telefon, trebala bi aplikacija iz App Storea.
- **Obavijesti** dok je {=Erevos} zatvoren isključene su dok ih ne uključite: u Erevosu, **Postavke** → **Obavijesti** →
  **Obavijesti dok je {=Erevos} zatvoren** → **Uključi** (iOS 16.4 ili noviji, s početnog ekrana). Kad stignu poruke, ili
  zazvoni poziv, vaš relay šalje push preko Applea, a {=Erevos} prikazuje koliko je poruka stiglo otkako ste ga
  posljednji put otvorili (**3 nove poruke**), ili **Poziv** kad je samo zazvonio poziv, na jeziku aplikacije, ništa
  više. Broj je šifriran za vaš iPhone: Apple vidi kada nešto stigne za vaš iPhone i da on koristi {=Erevos}, ali nikad
  šta ni od koga. S relayem ili Erevosom pošiljaoca starijim od 2.0.0, ili s porukom koju su drugi telefoni prenijeli
  do relaya, nema broja: {=Erevos} prikazuje **Nova poruka**, ili **Nove poruke** kad ih je stiglo više, dok ga ne
  otvorite. Obavijesti su po prostoru, nikad za skrivene razgovore, a vaš relay mora biti podešen da ih šalje. Stižu i
  za vlastiti red svakog kontakta: vaš relay tada ima jednu push adresu za redove svih vaših kontakata, a Apple dobija
  po jedan push za svaki kontakt koji je pisao, u razmaku od 15 sekundi, pa iz takvog niza može pretpostaviti koliko
  ih je pisalo odjednom, ali nikad ko. Ikona Erevosa na početnom ekranu tada pokazuje i broj: nepročitane poruke u
  prostoru koji je bio otvoren, koje ostaju u broju i kad se {=Erevos} zatvori, i one koje su stigle poslije (ono što je
  stiglo bez broja broji se kao jedna), nikad iz skrivenog razgovora. **Postavke** → **Obavijesti** → **Broj na
  ikoni** to isključuje. Obavijesti rade preko push servisa Applea, Googlea (Chrome, kao i Edge na Androidu, Brave i
  Opera), Mozille (Firefox) i Microsofta (Edge na Windowsu): preglednik koji koristi neki drugi ne može ih uključiti,
  osim ako onaj ko vodi vaš relay dozvoli njegov push servis. Svaki prostor koji ih uključi ima svoju push adresu, pa
  nijedan relay nikad ne dobija adresu drugog prostora, i adresa ne povezuje vaše prostore. Za to svaki takav prostor
  ima svoj service worker u pregledniku: ko može vidjeti postavke preglednika može ih prebrojati, a time i koliko
  prostora ima uključene obavijesti. Zahtjev za razgovor od nekoga novog, preko vašeg linka za kontakt, možda će se
  prikazati tek kad se {=Erevos} otvori. Broj na ikoni prikazuje se i na Macu uz Safarijevo „Dodaj u Dock“, i u
  web-aplikaciji instaliranoj iz Chromea ili Edgea na Windowsu, macOS-u ili ChromeOS-u. Nikakav natpis **Nova poruka**
  ne prikazuje se preko Erevosa dok je otvoren na ekranu. Ekran **Obavijesti dok je {=Erevos} zatvoren** kaže kad
  preglednik ili telefon ne dopuštaju obavijesti i, nakon što ih isključite, kad vaš relay još nije mogao biti
  obaviješten i možda još šalje poneku: {=Erevos} mu to kaže čim ga može dohvatiti. Kad preglednik promijeni svoju push
  adresu, ili je push servis odbaci, {=Erevos} sam daje vašem relayu novu kad se vrati na ekran.
- **Dozvole:** u Erevosu, **Postavke** → **Općenito** → **Dozvole** prikazuje šta preglednik dozvoljava Erevosu: radi
  li s početnog ekrana, obavijesti dok je zatvoren (potrebne kad ih je ovaj prostor uključio), mikrofon za pozive,
  kameru za videopozive i čuva li preglednik Erevosove podatke trajno. Bez toga Safari može obrisati podatke kad na
  iPhoneu ponestane prostora, pa je rezervna kopija sigurnosna mreža. Svaka stavka ima objašnjenje zašto i dugme s
  vlastitim pitanjem preglednika; tamo gdje preglednik više ne pita, kaže gdje je postavka (**Postavke → Obavijesti →
  Erevos** ili **Postavke → Aplikacije → Safari → Mikrofon**). Samo čita ono što preglednik kaže. Preglednik ne
  dozvoljava Erevosu da čita uštedu baterije ili Način rada niske potrošnje, pa toga tamo nema. Nakon svakog novog
  potpisanog izdanja otvara se sama kad nedostaje nešto što trebaju poruke, pozivi ili podaci. U drugom pregledniku
  (Chrome, Firefox) isto je, s postavkama tog preglednika.
- **Rezervne kopije** se prave ručno: **Napravi rezervnu kopiju** čuva kopiju i njene datoteke preko izbornika za dijeljenje (Datoteke,
  iCloud Drive ili druga aplikacija). Preglednik daje datoteku tek nakon dodira, pa nema automatskih rezervnih kopija.
- **Glasovne poruke** snimljene na iPhoneu su AAC; puštaju se svuda.
- **Apple** pravi Safari i mogao bi ga promijeniti, kao i kod svake aplikacije na iPhoneu.

## Na Sailfish OS-u {#sailfish}

Na Sailfish OS telefonu Erevos je zasebna aplikacija: ista aplikacija kao u pregledniku, prikazana vlastitim
preglednikom Sailfisha unutar Sailfish prozora, s kodom instaliranim s aplikacijom, a ne preuzetim sa servera.
Razgovara preko relaya, šifrirano s kraja na kraj kao na telefonu, i čuva svoje kontakte, poruke i postavke
zapečaćene na isti način.

1. Dozvolite aplikacije izvan Jolla Storea: **Postavke → Nepouzdani softver → Dozvoli nepouzdani softver**.
2. Kopirajte \`erevos-sailfish-aarch64.rpm\` na telefon (Preuzimanja) i dodirnite ga u **Datoteke**, a zatim
   **Instaliraj**. Iz terminala (način rada za programere) to je \`pkcon install-local erevos-sailfish-aarch64.rpm\`.
   Potreban je Sailfish OS 5 u svojoj 64-bitnoj (aarch64) verziji.
3. Postavite zaključavanje lozinkom (u Erevosu, **Postavke** → **Privatnost i sigurnost** → **Zaključavanje i druga
   lozinka**). Pogledajte ispod zašto je ovdje važno.
4. Postavite relay i dodajte kontakte kao na telefonu, pogledajte [Razgovor preko relaya](#relay).

- **Šta radi samo Android:** Bluetooth, Wi-Fi Aware, Wi-Fi Direct, LoRa i SMS. Ista Wi-Fi mreža i ovdje radi, kao na
  računaru: pogledajte [Razgovor s telefonom u blizini](#nearby). Zaštitni zid Sailfish OS-a već propušta njegov port,
  47905: samo zaštitni zid koji ste sami pooštrili treba pravilo za njega. Ostalo je isto: prostori i druga lozinka,
  skriveni razgovori, glasovne poruke, uvezeni razgovori i rezervne kopije.
- **Gdje čuva stvari:** u \`~/.local/share/erevos\` na telefonu, zapečaćene kao na telefonu. Sailfish nema privjesak
  za ključeve za aplikacije, pa se spremište ključeva tamo čuva onakvo kakvo jeste, čitljivo vašem korisniku, a time i
  svakoj aplikaciji koja radi kao vi: zaključavanje lozinkom je ono što ga zapečaćuje.
- **Rezervne kopije** idu u \`Documents/Erevos\` na telefonu, ručno ili svaki dan; kopirajte ih odatle na memorijsku
  karticu ili drugi uređaj. **Sačuvaj** stavlja fotografiju ili datoteku u Preuzimanja.
- **Pozivi** zvone dok se Erevos vidi, vlastitim zvonom: dva kratka svake 3 sekunde, a telefon vibrira gdje može, dok
  se poziv ne primi ili ne završi. Poziv koji stigne prije nego što ste dotakli Erevos otkad se otvorio može se
  prikazati bez zvuka.
- **Dok je zatvoren:** s otvorenim prostorom, mali pomoćnik Erevosa čeka na relayu dok Erevos nije na ekranu ili je
  zatvoren, i ne uzima ništa. Obavještenje kaže samo koliko je poruka stiglo, nikad od koga ni šta, a poziv zvoni
  melodijom telefona, kako je profil postavlja, najviše 45 sekundi; dodir na bilo koje od njih otvara Erevos. Skriveni
  razgovori tada ne kažu ništa. Zaključavanje prostora ga zaustavlja, a nakon ponovnog pokretanja telefona ponovo čeka
  tek kad Erevos otvori prostor. Kao i ostatak Erevosa ovdje, ide direktno, bez Tora. Svako čekanje budi telefon
  otprilike jednom u minuti, kao na Androidu.
- **Dosad testirano** na Sailfishovom pregledniku (Gecko 91) na računaru, uz razgovor s preglednikom preko relaya. Ista Wi-Fi
  mreža provjerena je naspram one na računaru, na računaru. Još ne na Sailfish telefonu.

## Ažuriranja {#updates}

Erevos pita GitHub za ažuriranja samo kad dodirnete dugme, kao u Fasouli: redovna provjera bi GitHubu svaki dan
govorila da ovaj telefon ili računar ima {=Erevos}. Na Androidu vam javlja i kad izađe nova verzija, a da ne pita GitHub,
kao što kaže **Obavijest kad izađe nova verzija** ispod. Da ažurirate:

1. Otvorite **Postavke** → **Općenito** → **Ažuriranja** (ili **Provjeri ažuriranja** na dnu prvog ekrana ovog
   vodiča).
   Prikazuje verziju koju imate, kao **Erevos 2.0.0**.
2. Dodirnite **Provjeri ažuriranja**. GitHub tada vidi internet adresu ovog uređaja, ništa drugo; na Androidu je vidi
   i server web-aplikacije, koji sadrži potpis ažuriranja od računara za izdanja. Dok sve u
   prostoru ide preko Tora (**Sve** pod Torom), Erevos ne provjerava, jer bi to zaobišlo Tor.
   S uključenim **Preko Tora**, na ovom ekranu (isključeno dok ga ne uključite), pita samo server web-aplikacije,
   preko Tora, a ne GitHub: GitHub se ne pita i ništa ne vidi adresu. Sporije je i čeka dok se Tor pokreće; i radi i
   dok sve u prostoru ide preko Tora.
3. Kad postoji nova verzija: na Androidu dodirnite **Instaliraj**. Preuzima se, provjerava prema izdanju (njegova
   veličina i SHA-256), i otvara se Androidov instalater: tamo dodirnite **Instaliraj**. Erevos je nudi tek kad je
   računar za izdanja, koji svoj ključ čuva van mreže, potpisao tu verziju i njen SHA-256: onaj ko bi sam preuzeo
   GitHub nalog ne bi mogao instalirati vlastiti APK. Do tada kaže da je verzija izašla, ali još nije potpisana. Kad
   server web-aplikacije nije dostupan, kaže to, s razlogom, a kad se potpis tamo ne podudara, kaže i to: u oba
   slučaja ništa se ne instalira. Preuzimanje čija veza neko vrijeme ne donosi ništa samo počinje ispočetka, ukupno
   tri puta; onda Erevos to kaže i ništa se ne instalira. Prvi put Android traži da dozvolite instaliranje aplikacija
   iz Erevosa. Na računaru i Sailfish OS-u **Otvori stranicu za preuzimanje** otvara stranicu izdanja: uzmite datoteku
   koju Erevos navodi, onu za paket koji imate, i ažurirajte kao u tabeli ispod.
   Preko Tora nova verzija se javi, ali se ovdje ne preuzima, jer je njen paket veći nego što Tor u Erevosu prima: na
   trenutak isključite **Preko Tora** da je instalirate, ili je preuzmite sa stranice izdanja u Tor Browseru.

Verzija poput **4.0.0-rc.1** je probna verzija prije 4.0.0 (kandidat za izdanje): instalira se i ažurira kao svaka
druga, a 4.0.0 dolazi poslije nje.

### Erevos, Erevos+ ili Erevos Lite, i beta verzije {#update-channel}

Na Androidu, **Ažuriranja** kažu i koje se verzije nude ovom telefonu:

- **Sljedeće ažuriranje**: **Erevos Lite** (Erevosovi vlastiti razgovori i pozivi, ništa drugo; verzije 3.2.x),
  **Erevos** (njegovi vlastiti razgovori, Telefon, SMS i Kolekcija; verzije 3.0.x) ili **Erevos+** (sve to, uz
  Telegram, Messenger, Signal, Session, Matrix, XMPP i Nostr; verzije 3.1.x). Na početku je odabrano ono što imate.
  Svaki je posebna aplikacija, s vlastitim podacima, pa je odabir drugog prelazak, a ne ažuriranje: **Provjeri
  ažuriranja** ga pronalazi i pita **Pređi na …**. Ovaj Erevos tada pravi kopiju svega, šifrovanu, ovdje na telefonu
  (svaki prostor, s njegovim kontaktima, porukama i postavkama), a Android instalira drugu aplikaciju pored ove, ako
  već nije tu. Otvorite je u roku od jednog dana: pita da li da donese vaše razgovore i preuzima ih; ništa ne napušta
  telefon. Prostori se zatim otvaraju svojim lozinkama, kao nakon svakog vraćanja. SMS i pozivi telefona ostaju u
  telefonu: postavite novu aplikaciju kao aplikaciju za SMS i telefon, ako ih koristite. Od trenutka prelaska stara
  aplikacija ništa ne prima i ne šalje i prikazuje samo prelazak, da tamo ne ostane nijedna poruka koju nova nema;
  **Otkaži prelazak** je otvara kao prije. Kad ga nova preuzme, stara nudi **Obriši sve ovdje** i **Deinstaliraj**;
  prelazak koji nije preuzet u roku od jednog dana se briše, a stara aplikacija se otvara kao prije. I nova aplikacija
  koja je već podešena pita, a ono što donese zamjenjuje sve što ima. Prelazak traži slobodan prostor na telefonu za
  kopiju svega: Erevos to kaže unaprijed kad ga nema dovoljno. F-Droid verzija, potpisana drugim ključem, ne može tako
  preći: koristite [Rezervne kopije](#backup).
- **Beta verzije**: isključeno, nude se samo redovne verzije. Uključeno, i beta verzije (kao **7.0.1-beta.1**): izlaze
  prve, za isprobavanje, i mogu imati problema. Beta ga na početku ima uključenog. Isključite ga da napustite beta
  verzije: sljedeća redovna verzija s brojem builda većim od bete koju imate instalira se preko nje i sve zadržava, bez
  deinstaliranja.

Iz Erevos+ dolaze i mreže: Telegram, Signal, Session, Messenger i Matrix ostaju prijavljeni u novoj aplikaciji, kao
što su bili (fotografije i fajlovi sa Telegrama ponovo se preuzimaju kad ih otvoriš, a stranica Messengera još jednom
traži svoj PIN). Erevos i Erevos Lite nemaju Telegram, Messenger, Signal ni Session: selidba u njih ostavlja te naloge
u starom Erevos+, koji posle toga ništa ne otvara, pa ako koristiš Session, prvo zapiši njegovih 13 reči za oporavak.

Erevos+ treba Android 8.0 ili noviji: na starijem telefonu ne može se izabrati, i telefon ostaje na Erevosu.

Obavještenje o novoj verziji prati isti izbor. Računar za izdanja potpisuje svako izdanje i njegove bete posebno, pa se
jedno nikad ne instalira kao drugo.

### Šta je novo {#whats-new}

**Postavke** → **Općenito** → **Šta je novo** (i **Šta je novo** u **Ažuriranja**) ukratko kaže šta je svaka verzija
promijenila, najnovija prva, samo po svom broju; verzija koju imate kaže **Ova verzija**. Svako izdanje dodaje svoje.
CHANGELOG izvornog koda opisuje svaku promjenu u cijelosti.
Svaka verzija, tamo kao i ovdje, prvo kaže šta se mijenja **Za vas**, ono što vidite i koristite, a zatim šta se
promijenilo **Ispod haube**: ispravke, brzina, baterija i sigurnost iznutra.

### Obavijest kad izađe nova verzija {#release-notice}

Na Androidu, jednom dnevno, Erevos pita LPHL-ov server, na kojem radi i relay, je li izašla nova verzija. Kad jeste,
**Erevos** se prikazuje na vrhu razgovora, prikvačen, sa svojom ikonom: **Izašao je Erevos 3.3.0. Dodirnite da vidite
šta je novo i ažurirate.**, označen dok ga ne otvorite, a i obavijest kaže **Erevos 3.3.0 is out**. Dodirnite bilo
koje za **Ažuriranja**, a zatim **Provjeri ažuriranja**. Nestaje kad budete imali tu verziju.

- **Samo kad je potpisano:** važi tek kad je računar za izdanja potpisao i verziju i njeno ime, istim potpisom koji
  omogućava da je **Ažuriranja** instalira. Zato stiže tek kad se ta verzija može instalirati, a sam server je ne može
  izmisliti.
- **Samo na LPHL-ovom relayu:** prostor pita samo dok koristi LPHL-ov relay i ne šalje sve preko Tora (**Sve** pod
  Torom): server tada ne vidi ništa što već ne vidi. Prostor na drugom relayu, ili bez relaya, ne pita ništa; tamo vam
  to kaže **Provjeri ažuriranja**.
  Prekidač **Preko Tora** u **Ažuriranjima**, jedan za ovo obavještenje i za **Provjeri ažuriranja**, samo na ovom
  telefonu, tjera ga da pita preko Tora: server tada ne vidi adresu telefona, a pita i prostor koji šalje sve preko
  Tora. Nova verzija se javi, ali se instalira samo s isključenim prekidačem.
- **Da to isključite:** **Postavke** → **Općenito** → **Ažuriranja** → **Javi mi kad izađe nova verzija**.
- Radi od verzije koja to ima uključeno: prethodna ne kaže ništa. Nije u F-Droid verziji, koju ažurira F-Droid.

**Zašto:** kako niko ne bi morao gledati na GitHubu, jednu po jednu, svaku novu verziju, a GitHub nikad ne saznaje
koji telefoni imaju Erevos: pitani server je onaj s kojim telefon već razgovara, a ono što kaže važi samo s potpisom
računara za izdanja, koji se čuva van mreže.

Ostatak ovog dijela je za ručno ažuriranje.

**Gdje su nove verzije:** na Erevosovoj stranici izdanja, \`https://github.com/azzinder/erevos-releases/releases\`.
Najnovija je na vrhu, kao **Erevos 2.0.0**, s datotekom za svaki
sistem. Pet najnovijih ostaje tamo.

**Provjerite datoteku** ako možete, na računaru: svako izdanje ima \`SHA256SUMS\`, a u folderu s preuzetim
datotekama \`sha256sum -c --ignore-missing SHA256SUMS\` mora za svaku reći **OK**.

**Prvo napravite rezervnu kopiju** (**Postavke** → **Podaci i uređaji** → **Rezervne kopije** → **Napravi rezervnu
kopiju**), pogledajte [Rezervne kopije](#backup). Ažuriranje zadržava sve, ali rezervna kopija traje minut i štiti od
svakog iznenađenja.

| Na | Kako ažurirati |
| --- | --- |
| **Android** | **Postavke** → **Općenito** → **Ažuriranja** → **Provjeri ažuriranja** → **Instaliraj**, ili ručno: otvorite stranicu izdanja na telefonu, dodirnite \`erevos-android.apk\`, a zatim **Instaliraj**. Instalira se preko verzije koju imate i zadržava sve. Jednom dozvolite instaliranje iz preglednika, kad Android to zatraži. |
| **Linux, zasnovan na Archu** | \`sudo pacman -U erevos-linux-x86_64.pacman\` |
| **Linux, AppImage** | Zamijenite stari \`erevos-linux-x86_64.AppImage\` novim i učinite ga izvršnim. |
| **macOS** | Otvorite \`erevos-macos.dmg\` i prevucite Erevos u Applications, **Zamijeni**. Zatim ga ponovo dozvolite pod **Postavke sistema → Privatnost i sigurnost → Ipak otvori**. |
| **Windows, instaliran** | Zatvorite Erevos i pokrenite novi \`erevos-windows-x64-setup.exe\`: instalira se preko verzije koju imate. Windows može ponovo upozoriti: **Više informacija**, a zatim **Ipak pokreni**. |
| **Windows, prenosivi** | Zatvorite Erevos i stavite novi \`erevos-windows-x64-portable.exe\` na mjesto starog. |
| **Sailfish OS** | Dodirnite \`erevos-sailfish-aarch64.rpm\` u **Datoteke**, a zatim **Instaliraj**, ili \`pkcon install-local erevos-sailfish-aarch64.rpm\`. |
| **iPhone, preglednik** | Ništa ne treba raditi: web-aplikacija sama preuzima novu potpisanu verziju kad se otvori, pogledajte [Na iPhoneu](#iphone). |

- **Kontakti, razgovori i postavke ostaju** na svakom sistemu: nalaze se u Erevosovom vlastitom folderu, a ne u
  aplikaciji.
- **Android, prvi put sa stranice izdanja:** Erevos izgrađen na računaru za testiranje potpisan je drugim ključem, i
  Android odbija da instalira preko njega (**Aplikacija nije instalirana**). Napravite rezervnu kopiju,
  deinstalirajte {=Erevos}, instalirajte onaj sa stranice izdanja i vratite rezervnu kopiju. Nakon toga se svako
  ažuriranje instalira preko njega.
- **{=Erevos} iz F-Droida**, kad bude tamo, ažurira F-Droid: njegova **Ažuriranja** prikazuju verziju i to kažu, bez
  **Provjeri ažuriranja**. F-Droid ga potpisuje vlastitim ključem, pa Android ne instalira ni njega preko Erevosa sa
  stranice izdanja ni onaj preko njega. Da pređete s jednog na drugi: napravite rezervnu kopiju, deinstalirajte
  {=Erevos}, instalirajte drugi i vratite rezervnu kopiju.
- **Nikad starija:** ne instalirajte stariju verziju preko novije. Njeni podaci mogu biti u obliku koji starija ne
  može pročitati. Umjesto toga vratite rezervnu kopiju napravljenu tom starijom verzijom.
- **Izdanje kojem nedostaje vaš sistem** to kaže u svojim napomenama: ta izgradnja nije uspjela, pa uzmite prethodno
  izdanje.

## Erevos obližnjem telefonu {#give-app}

Bez interneta, Android telefon s Erevosom može ga dati telefonu pored sebe, pod **Postavke** → **Općenito** → **Daj
{=Erevos} obližnjem telefonu** (i u **Ažuriranja**). Oba telefona moraju biti na istoj Wi-Fi mreži, ili drugi na
hotspotu ovoga: prvo uključite hotspot u postavkama Androida.

1. **Na telefonu koji daje:** dodirnite **Pokreni**. Pojavljuje se QR kod, s veličinom paketa, a ispod adrese koje
   umjesto toga možete upisati u preglednik.
2. **Na telefonu bez Erevosa:** skenirajte kod njegovom kamerom. Njegov preglednik otvara stranicu, s telefona koji
   daje, s **Preuzmi {=Erevos}**: preuzmite ga i otvorite datoteku, i Android ga instalira. Prvi put Android traži da
   dopustite instaliranje aplikacija iz tog preglednika. Stranica prikazuje SHA-256 paketa i njegova certifikata:
   moraju biti oni koje telefon koji daje prikazuje pod **Za usporedbu**.
3. **Na telefonu sa starijim Erevosom:** radije otvorite **Postavke** → **Općenito** → **Ažuriranja** → **S
   obližnjeg telefona** i fotografirajte kod. {=Erevos} preuzima paket i otvara Androidov instalacijski program samo ako
   je njegov SHA-256 onaj iz koda, ako je to {=Erevos}, potpisan istim certifikatom kao {=Erevos} ondje, i noviji.

- **Koliko dugo:** telefon koji daje poslužuje ga dok se vidi njegov zaslon, najviše deset minuta, a ranije staje sa
  **Zaustavi**. Odgovara samo na nasumičnoj adresi koju nitko ne pogađa, samo telefonima na svojoj mreži, i ničim
  osim paketom i njegovom stranicom: nijedan razgovor, kontakt ni postavka ne ide s njim.
- **Što ne može provjeriti umjesto vas:** preglednik samo preuzima. Telefon s izmijenjenim Erevosom prikazao bi svoj
  certifikat, pa čim imate internet usporedite certifikat s onim na web stranici ili stranici izdanja Erevosa. Sam
  Erevos, u **Ažuriranja**, odbija paket potpisan drukčije.
- **Ne iz trgovine:** {=Erevos} instaliran u dijelovima, kako neke trgovine instaliraju, ne može se dati u cijelosti i to
  kaže. {=Erevos} iz F-Droida potpisuje F-Droid: može otići na telefon bez Erevosa, ili preko F-Droidovog Erevosa kroz
  preglednik, ali {=Erevos} sa stranice izdanja odbija ga u **Ažuriranja**, kao što bi i Android. F-Droidov {=Erevos} ne
  prima ništa u **Ažuriranja**: ažurira ga F-Droid.
- Samo na Androidu. Svatko na istoj mreži tko vidi kod može također preuzeti Erevos; ondje nema ničeg drugog za uzeti.

**Zašto:** gdje je internet prekinut, ili nadziran, ili telefon uopće ne dolazi do web stranice, Erevos i dalje može ići
iz ruke u ruku, a telefon koji ga prima može provjeriti da je pravi.

## Ekrani za testiranje {#tests}

Dva ekrana pod **Postavke** → **Za testiranje** služe za testiranje veza, korak po korak.

- **Test radija (Android):** **Dozvole** traži od Androida ono što je radiju potrebno, **Pokreni** i **Zaustavi**
  uključuju i isključuju Bluetooth i Wi-Fi Aware, **Pošalji pozdrav** šalje običnu testnu poruku na Test radija
  telefona u blizini (razgovor je ne prikazuje), a **Zapisnik** pokazuje šta se desilo.
- **Test relaya (Wi-Fi):** **Napravi red** pravi red na relayu i prikazuje dva identifikatora. **ID za slanje** dajte
  telefonu koji vam piše, a **ID za primanje** čuvajte u tajnosti. **Pošalji** i **Primi** ručno prenose poruke.

> I s jednim telefonom možete isprobati razgovor preko relaya: vaši razgovori i vaši **Skriveni razgovori** imaju
> svaki vlastiti red na relayu i vlastite ključeve. Napravite oba reda na istom relayu, u jednom dodirnite **Podijeli
> moj link za kontakt** i kopirajte ga, zatim ga dodajte u drugom i pišite u oba smjera. Vlastiti link razgovora
> odbija se kao kontakt.

## Šta je danas zaštićeno {#privacy}

Erevos jasno kaže šta štiti, a šta još ne štiti.

| Šta | Danas | Dolazi |
| --- | --- | --- |
| **Nalog, broj telefona, e-mail** | Nije potrebno ništa od toga. Kontakti su parovi jednosmjernih redova na relayu. | |
| **Kontakti i njihova imena, ključevi, postavke relaya, izgled** | Zapečaćeni na telefonu ključem svakog prostora. | |
| **Poruke preko relaya** | Šifrirane s kraja na kraj: PQXDH s ML-KEM-768 na početku, zatim double ratchet. Relay ih ne može čitati, a kad oba telefona dobiju poruku jedan od drugog, ne može ih ni razlikovati po razgovoru: svaka je još jednom zapečaćena za telefon kojem ide. Vidi koje su poruke koje neko čita, koje su riječ između telefona, a koje pozivi koji zvone, jer to svaka kaže. Još nisu nezavisno provjerene. | Nezavisna provjera. |
| **Poruke telefonu u blizini** | Šifrirane s kraja na kraj, isto kao preko relaya. Onaj ko prisluškuje u blizini može saznati da su {=Erevos} telefoni blizu jedan drugog, te kada i koliko šalju; na istoj Wi-Fi mreži to može svako na njoj, a preko Wi-Fi Directa svako ko se pridruži vlastitoj Wi-Fi mreži telefona. Dok telefon vašeg kontakta nije poznat, drugi {=Erevos} telefoni povezani u blizini dobijaju vaše kratke poruke, zapečaćene. | |
| **Poruke koje prenose drugi telefoni** | Zapečaćene dvaput: s kraja na kraj za vaš kontakt, i za njegov relay. Telefon koji prenosi poruku vidi na koji relay ide, kada i koliko je velika; ne vidi od koga je ni za koga. Njegov relay vidi na koji relay ide, a taj relay vidi relay prenosioca, ali ne i njegov telefon. Čuvaju se zapečaćene na telefonu, najviše tri dana: one za druge u datoteci telefona, čija veličina otprilike pokazuje koliko ih ima; vaše vlastite u vašem prostoru, zapečaćene njegovim ključem. Skriveni razgovori se nikad ne prenose. | |
| **Poruke preko LoRa veze** | Šifrirane s kraja na kraj, isto kao preko relaya. Svako s radiom, kilometrima daleko, može saznati da vaš radio šalje, kada i koliko, a njegov signal može se pratiti do mjesta gdje se nalazi. Erevos sprječava da vaš radio javlja svoje ime i lokaciju (uloga Client hidden, GPS isključen, bez fiksne pozicije) osim ako mu to ne dozvolite; i dalje odgovara radiju koji pita za njegovo ime. Svaki Erevos na mesh mreži dobija vaše LoRa poruke, zapečaćene. | Postavljanje imena radija iz Erevosa. |
| **Poruke SMS-om, kad ništa drugo ne radi** | Šifrirano s kraja na kraj, isto kao preko relaya, u skrivenim podatkovnim SMS-ovima. Isključeno dok ga ne uključite. Mobilni operater vidi koji je broj pisao kojem, kada i koliko SMS-ova; nikad šta je napisano. Svaki košta koliko jedan SMS. | |
| **Ko s kim razgovara** | Relay vidi IP adrese, identifikatore redova, te kada i koliko. S drugim relayem vaš relay nikad ne vidi vašu adresu. S mjesta posuđenog na relayu kontakta vidi je svaki relay kojem šaljete. [Preko Tora](#tor), kad ga uključite, s **Poruke** nijedan relay je ne vidi za ono što pišete, a sa **Sve** ni za slike i datoteke; s mostovima, tamo gdje je Tor blokiran, mreža vidi samo most. Snowflakeov posrednik i STUN serveri vide vašu adresu. | Tor na računaru. |
| **Veza s relayem** | TLS, a unutar njega, kad je ključ relaya poznat, kanal do tog ključa: relay pri svakoj vezi dokazuje da ga ima, a token i svaki zahtjev idu šifrirani za njega, pa neko između s certifikatom za ime relaya ne može da se predstavi kao relay. Relayu koji je jednom dokazao svoj ključ nikad se više ne pristupa bez njega. Relay stariji od ove aplikacije radi kao i prije, a **Kako ste sada povezani** to kaže. Prvi ključ dolazi od relaya prvi put kad ga se pita, ili iz linka za kontakt: onaj ko je između upravo tog prvog puta mogao bi dati svoj. [Vlastiti ključ relaya](#relay). Nije nezavisno provjereno. | Ključ našeg relaya ugrađen u aplikaciju i u pozivnice. |
| **Tekstovi preko Nostra** | Šifrirani s kraja na kraj kao preko relaya, zatim još jednom umotani za ključ koji je vaš kontakt dao samo tom razgovoru, potpisani ključem napravljenim samo za taj tekst. Nostr relayi vide kada i koliko je veliko, i da ključ koji ne imenuje nikoga dobija tekst; vaš telefon čita sve svoje ključeve na jednoj vezi, preko Tora kad je Tor uključen, pa relay može saznati da se čitaju zajedno, a odakle samo kad je Tor isključen. Vaš relay ih vidi samo kao rezervu, i zvono za skrivene razgovore. [Preko Nostra](#nostr). | |
| **SMS** | Običan SMS čita telefonska kompanija, kao i svaki SMS. Na broj povezan s Erevos kontaktom umjesto toga ide preko Erevosa. Skrivena pozivnica je još jedan kratki SMS koji telefonska kompanija vidi. | |
| **Kontakti telefona** | U Androidovim vlastitim kontaktima, a Erevos ih ne zapečaćuje, kao i kod svake aplikacije za kontakte: vidi ih svaka aplikacija kojoj je dozvoljeno da ih čita, a nalog (Google) ih može sinhronizovati. Erevos ih nikud ne šalje. .vcf datoteka sačuvana od njih je izvan Erevosa, nezapečaćena. Pozivi i SMS poruke kontakta čitaju se iz vlastitog zapisnika poziva i SMS poruka telefona samo da bi se prikazala njegova historija, i nigdje se ne čuvaju. | |
| **Kontakti koji se čuvaju samo u Erevosu** | Zapečaćeni ključem prostora, ili ključem skrivenih razgovora za njihove, u jednoj datoteci za svaki prostor čija veličina otprilike pokazuje koliko ih ukupno ima, ali ne i čiji su; njihove fotografije svaka u vlastitoj datoteci. Nikad u Androidovim kontaktima. .vcf datoteka sačuvana od njih, i od onih iz skrivenih razgovora, je izvan Erevosa, nešifrirana. Pozivi i SMS poruke prema njima idu preko telefona i prikazuju se u njegovom zapisniku poziva i SMS porukama. | |
| **Telefonski pozivi** | Obični telefonski pozivi: prenosi ih telefonska kompanija i može ih prisluškivati, kao i kod svake aplikacije za telefon. Android čuva historiju poziva, a Erevos je ne zapečaćuje, kao i za svaku aplikaciju za telefon; Erevos je čita, kao i favorite, da bi ih prikazao, iz nje briše samo pozive koje vi obrišete, i ne čuva nikakvu kopiju. SIM kartica izabrana za svaki broj zapečaćena je u prostoru; brzi odgovori i ono što je blokirano (samo prefiksi, identifikatori grupa i vremena, isto za svaki prostor) čuvaju se na telefonu, nezapečaćeni. | |
| **Uvezeni razgovori** | Zapečaćeni u prostoru u koji su uneseni, kao i njihove fotografije i datoteke, svaka u svojim dijelovima kao i datoteka razgovora. Veličina datoteke, i broj dijelova, otprilike govore koliko je uvezeno, ali ne i gdje. | Viberove fotografije i datoteke, i datoteke veće od 4 GB. |
| **Historija poruka** | Čuva se na telefonu, zapečaćena u svom prostoru, bez ograničenja, u stranicama iste veličine pomiješanim za sve prostore. Vidi se samo koliko sve zajedno zauzima, a ne kojem prostoru pripada. Brisanje na oba telefona i poruke koje nestaju oslanjaju se na Erevos drugog telefona. | |
| **Poruke u blizini** | Otvaraju se samo u prostoru koji ima taj kontakt. Poruka za drugi prostor čeka u memoriji, najviše šest sati, dok se taj prostor ne otvori. Poruka za skrivene razgovore otvara se samo dok su otvoreni, ili primaju i zatvoreni, a prostor nikad ne sazna da je neki njihov kontakt u blizini. | |
| **Glasovne poruke** | Šifrirane s kraja na kraj preko relaya ili u blizini, u dijelovima: relay, ili onaj ko prisluškuje u blizini, može otprilike saznati koliko je svaka duga. Svaki zvuk zapečaćen je u vlastitoj datoteci; broj datoteka i njihove veličine otprilike pokazuju koliko ih se čuva, ali ne i u kojem prostoru. Otpečaćen u kešu samo dok se pušta. | Zvučne datoteke sve iste veličine. |
| **Fotografije i datoteke** | Šifrirane s kraja na kraj, preko pohrane datoteka relaya, u dijelovima iste veličine: relay vidi koliko ih je i kada, dakle otprilike koliko su velike. Vaš relay vidi vašu adresu, kao i kod poruka; kontakt ih preuzima preko vlastitog relaya. Fotografije gube lokaciju, telefon i vrijeme, osim ako su poslane kao datoteka; datoteka zadržava ono što govori u sebi. Zapečaćene na telefonu u svojim dijelovima, prikazane iz memorije. Sačuvane kopije su izvan Erevosa. Rezervne kopije ih sadrže, zapečaćene lozinkom kopije, u zasebnim datotekama. | |
| **Na računaru** | Zapečaćeno kao na telefonu, u vlastitom folderu aplikacije. Njeno spremište ključeva zapečaćeno je privjeskom za ključeve sistema (na Windowsu ključem vašeg naloga); na Linux sistemu bez njega Erevos ne čuva ništa osim ako nije pokrenut sa \`--plain-secrets\`, a tada ga čuva onakvo kakvo jeste. | |
| **Rezervne kopije** | Zapečaćene vlastitom lozinkom, sadrže svaki prostor onako kako je zapečaćen na telefonu, s njegovim fotografijama, datotekama i glasovnim porukama u zasebnim datotekama pored kopije. Njihova imena kažu da je to Erevos rezervna kopija, a njihov broj i veličina otprilike pokazuju koliko se čuva. Automatske rezervne kopije čuvaju svoju lozinku na telefonu. Idu na server samo ako ga dodate: nasumični bajtovi pod nasumičnim imenima, zaokruženih veličina; server vidi vaš nalog i kada, i vašu adresu osim ako idu preko Tora. | |
| **Oznake ✓✓ i ✓✓✓** | Telefon kontakta saznaje, šifrirano, kada je vaš dobio i pročitao njegove poruke. U grupi koja nije javna, to saznaje i telefon onoga ko je poslao poruku. Relay, ili onaj ko prisluškuje u blizini, vidi još jednu malu poruku. | Prekidač da se ne javlja kada čitate. |
| **Otisak prsta ili lice (Android)** | Isključeno dok se ne uključi. Otvara samo prostor prve lozinke: njegov ključ zapečaćen je u Android Keystoreu, upotrebljiv samo odmah nakon jake provjere otiska prsta ili lica, i odbacuje se kad se oni promijene. Neko ko vas drži može upotrijebiti vaš prst. | |
| **Obavijesti (Android)** | U pozadini: „Erevos – Ready for calls and messages“ (ne na zaključanom ekranu), „Incoming call“ ili „Incoming video call“ – „Open Erevos to answer“, i „New message“ ili koliko ih je stiglo; kad ga zaustavi Android ili lozinka, „Closed by Android“ ili „Locked“ – „Open it to receive calls and messages again“; podsjetnik, „Reminder“ ili koliko ih je; nova verzija, „Erevos X is out“. Nikad od koga ni šta. Na zaključanom telefonu obavijest o porukama kaže samo „Erevos“. Skriveni razgovori kojima je to dozvoljeno prikazuju istu obavijest, brojanu s ostalima: onaj ko je vidi i ne nađe ništa novo mogao bi pretpostaviti da ih ima još. Kao aplikacija za telefon, obavijest o telefonskom pozivu navodi ko zove, i preko zaključanog ekrana, kao kod svake aplikacije za telefon, ali nikad imenom koje znaju samo skriveni razgovori: poziv od jednog od njihovih kontakata prikazuje broj. | |
| **Widget i Telefon (Android)** | Widget, kad se doda, prikazuje koliko ima propuštenih poziva, nepročitanih SMS poruka i novih poruka, nikad od koga ni šta. Telefon se otvara bez lozinke samo ako to dozvolite: tada svako ko drži otključan telefon vidi pozive i favorite koje Android čuva, samo s imenima iz kontakata telefona. | |
| **Pozivi** | Šifrirani s kraja na kraj (DTLS-SRTP, čiji se ključ šalje u šifriranom razgovoru). Preko relaya za pozive nijedan telefon ne vidi IP adresu drugog; server na kojem on radi vidi obje, kada i koliko dugo, i koliko prolazi. Bez relaya za pozive, samo na istoj Wi-Fi mreži, svaki telefon vidi adresu drugog. Relayi vide kada poziv počinje zvoniti. | Zvonjenje u web-aplikaciji dok je zatvorena. Pozivi preko Bluetootha (walkie-talkie tamo radi). |
| **Grupni razgovori** | Šifrirani s kraja na kraj pomoću MLS-a (RFC 9420); uklonjeni članovi nakon toga ništa ne čitaju. Kopija svakog člana zapečaćena je zasebno, pa relayi ne mogu saznati ko je u grupi; svaki relay ipak vidi da poruka stiže u red. Članovi vide ključeve i adrese relaya jedni drugih. Fotografije, datoteke i glasovne poruke idu preko pohrane datoteka relaya pošiljaoca, kao i kontaktu, i ostaju tamo 14 dana. Nije nezavisno provjereno. | |
| **Grupni pozivi** | Glasovni i video, šifrirani s kraja na kraj između svaka dva telefona u pozivu (DTLS-SRTP, čiji se ključevi šalju u šifriranju grupe). Preko relaya za pozive nijedan telefon ne vidi IP adresu drugog; server na kojem on radi vidi adresu svakog telefona, kada i koliko dugo, i koliko prolazi. Svaki član, u pozivu ili ne, saznaje ko je u njemu. Relayi vide kada poziv počinje. | Video s više od četiri osobe, preko servera; više od osam osoba. |
| **Javne grupe** | Kao grupni razgovori, a svako ko ima link može zatražiti ulazak i čitati od trenutka kad ga puste. Zahtjevi stižu na relay vlasnika zapečaćeni za telefon vlasnika: relay vidi koliko ih je i kada, ali ne i od koga. Članovi vide izabrana imena jedni drugih, ključeve napravljene samo za tu grupu, adrese relaya i identifikatore pošiljaoca redova. Nije nezavisno provjereno. | |
| **Pregledi linkova** | Isključeni dok se ne uključe. Tada, dok šaljete link, vaš telefon preuzima njegovu stranicu direktno sa sajta, koji vidi vašu IP adresu i vrijeme, ali ne i za koga je poruka. Pregled ide unutar šifrirane poruke; telefon koji je primi ništa ne preuzima. S uključenim **Preko Tora** stranica se preuzima samo preko Tora i sajt ne vidi vašu IP adresu. Nijedan dok prostor šalje sve preko Tora, osim ako je **Preko Tora** uključeno; u skrivenim razgovorima samo s vlastitim prekidačem njihovog mjesta. | |

## Transparentnost {#transparency}

Šta čuva server iza Erevosa (lphl.nekten.eu) i šta je od njega traženo. Ova stranica izlazi unutar svakog izdanja,
pa je potpisana s izdanjem, kao i aplikacija.

**Zahtjevi vlasti.** Zaključno s ovim izdanjem: nijedan. Nijedna vlast, sud ni kompanija nije tražila podatke o
bilo kome ko koristi {=Erevos}, i od nikoga nije traženo da prešuti takav zahtjev. Ako ovaj pasus ikad nestane, ili
više ne kaže „nijedan“, shvatite to kao znak. **Zašto:** zahtjev koji dolazi s naredbom da se prešuti ne može se
reći, ali rečenica koja se prestane pisati može se primijetiti. To radi samo dok se obnavlja: svako izdanje to
ponovo kaže.

Šta relay čuva, i koliko dugo:

| Šta | Koliko dugo |
| --- | --- |
| **Poruke koje čekaju**, šifrirane s kraja na kraj | Dok se ne preuzmu, najviše 14 dana. |
| **Fotografije i datoteke**, šifrirane, u dijelovima | Kao i poruke: dok se ne preuzmu, najviše 14 dana. |
| **Poruke poslane za kasnije**, šifrirane | Dok ne dođe njihovo vrijeme. |
| **Redovi**, nasumični identifikatori bez imena | Dok ih njihov telefon ne koristi 180 dana. |
| **Pristupni redovi**: za svaki telefon, SHA-256 njegovog tokena i ime: nasumična slova i cifre za onaj pozvan od Erevosa 6.0.0 (prije toga ono koje je upisao onaj ko je pozvao), ili LPHL korisničko ime za one koji su se prijavili preko LPHL-a | Dok se red ne ukloni. |
| **Push adrese web-aplikacije**, za obavijesti dok je web-aplikacija zatvorena | Dok se ne isključe u web-aplikaciji. |

Šta ne čuva:

- **Nema popisa veza.** Relay ne piše nikakav zapisnik o tome ko se povezao ni kada, a web server ispred relaya i
  web-aplikacije ne vodi zapisnik pristupa od 24. oktobra 2026. Greške se zapisuju, a greška može navesti adresu.
- **Nema kontakata, imena ni brojeva telefona.** Nema ih šta čuvati.

Šta i dalje vidi dok radi: IP adrese koje se povezuju, kada poruke stižu i odlaze, i koliko su velike, kao što kaže
[Šta je danas zaštićeno](#privacy). Tokom poziva preko relaya za pozive, IP adrese telefona u njemu.

**Kopije.** Folder relaya kopira se svaki dan, s porukama na čekanju i dalje šifriranim s kraja na kraj. Kopije sadrže
ono što navodi tabela iznad, onoliko dugo koliko se čuvaju.

**Drugi koji nešto vide:** hosting kompanija (Hetzner), koja vodi mašinu i njenu mrežu; LPHL-ova prijava (Authentik),
koja vidi svaku prijavu preko LPHL-a; a za web-aplikaciju s obavijestima dok je zatvorena, push usluga preglednika
(Apple, Google ili Mozilla), koja vidi da je obavijest stigla, nikad šta.

## Licenca {#licence}

**Erevos, by azzinder.** Copyright © 2026 azzinder.

Erevos je slobodan softver, pod licencom GNU Affero General Public License, verzija 3 ili bilo koja novija verzija
(AGPL-3.0-or-later): svako ga smije koristiti, proučavati, dijeliti i mijenjati. Ko god dijeli Erevos, izmijenjen ili
ne, ili za druge preko mreže pokreće izmijenjen Erevos, mora poštovati tu licencu i podijeliti izvorni kod svoje verzije
s onima koji je dobiju.

### Dodatni uslovi

Prema odjeljku 7 licence, ovi uslovi vrijede i za Erevos:

- **Ime autora.** Kopije i izmijenjene verzije zadržavaju napomenu „Erevos, by azzinder“ u dijelu O Erevosu u
  aplikaciji, [Šta je Erevos](#about).
- **Izmijenjena verzija to kaže.** Jasno kaže da je izmijenjena i ne predstavlja se kao izvorni Erevos.
- **Ime i logo.** Licenca ne daje pravo na ime „Erevos“ ni na njegov logo: izmijenjena verzija koja se daje drugima
  dobija drugo ime.

### Bez garancije

Erevos se daje u nadi da će biti koristan, ali **bez ikakve garancije**: čak ni da se može prodati ili da odgovara
određenoj svrsi. Licenca kaže više.

### Ko ga je napravio

Erevos nastaje **ljudski vođenim agentskim inženjerstvom (human-directed agentic engineering)**: osoba koja ga održava
određuje zamisao, ograničenja, šta svaka promjena mora da uradi i kada je gotova; alati umjetne inteligencije pišu,
pokreću provjere i ispravljaju.

Erevos osmišljava, vodi i održava azzinder: bira njegove funkcije i način na koji rade, sigurnosni model i strukturu,
testira ga na stvarnim uređajima i odlučuje šta ulazi u svako izdanje. Alati umjetne inteligencije korišteni su opširno
za pisanje koda i tekstova, uvijek prema uputama i zamisli osobe koja ga održava.

Dijelovi koje su napravili drugi zadržavaju svoje autore i licence, pogledajte
[Napravljeno uz otvoreni kod drugih](#about). Potpuni tekstovi dolaze s izvornim kodom Erevosa: \`AUTHORS.md\`,
\`CREDITS.md\` i folder \`LICENSES\`. Svaka kopija Erevosa nosi i datoteku \`NOTICES.txt\`, s licencom Erevosa, \`AUTHORS.md\` i svakim paketom od kojeg je {=Erevos} napravljen, svaki s tekstom svoje licence: unutar Android aplikacije, u folderu aplikacija za računalo i Sailfish, i u web aplikaciji na \`/NOTICES.txt\`. Sama licenca je na [gnu.org](https://www.gnu.org/licenses/agpl-3.0.html).

**Zašto:** slobodna licenca štiti vas samo ako je možete pročitati. Ona kaže šta smijete raditi s Erevosom i šta vam
duguje svako ko ga mijenja.

Ovaj dio se otvara i iz **Postavke** → **Općenito** → **Licenca**.

## Šta dolazi {#coming}

Šifriranje s kraja na kraj je tu, preko relaya i preko veze u blizini, i većina onoga što slijedi gradi se na njemu.

- **Više načina da ostanete u kontaktu:** Tor mostovi za mjesta gdje je Tor blokiran su tu, pogledajte [Preko
  Tora](#tor). Sljedeće: Tor na računaru.
  - **LoRa radiji (Meshtastic):** tu su, pogledajte [Preko LoRa radija](#lora). Sljedeće: postavljanje imena radija
    iz Erevosa.
  - **SMS:** Erevos kao SMS aplikacija je tu, s MMS fotografijama, grupnim MMS-om i dvije SIM kartice, pogledajte
    [SMS](#sms).
  - **Telefon:** Erevos kao aplikacija za telefon je tu, s vlastitim ekranom za pozive, pogledajte [Telefon](#phone).
  - **E-mail, QR kodovi, USB, NFC:** za kad ništa drugo ne prolazi.
- **Pozivi:** glasovni i video pozivi su tu, a na Androidu zvone u pozadini, pogledajte [Razgovor preko
  relaya](#relay), a tu je i walkie-talkie koji radi čak i preko Bluetootha.
- **Grupe:** grupni razgovori, s fotografijama, datotekama i glasovnim porukama, te grupni glasovni i video pozivi su
  tu, pogledajte [Grupni razgovori](#groups). Sljedeće: video s više od četiri osobe, preko servera na koji poziv sam
  prelazi, i dalje šifriran s kraja na kraj.
- **Donošenje vaših razgovora:** Telegram i WhatsApp već dolaze, sa svojim fotografijama i datotekama, a Viber sa
  svojim riječima, pogledajte [Uvezeni razgovori](#import). Sljedeće: Viberove fotografije i datoteke.
- **Više sistema:** javne grupe i grupni pozivi i na povezanim uređajima; nalog, njegovi pozivi i njegove grupe već su
  na računaru, pogledajte [Povezani uređaji](#devices). Linux, macOS i Windows su tu, pogledajte [Na
  računaru](#desktop), iPhone iz preglednika, pogledajte [Na iPhoneu](#iphone), i Sailfish OS, pogledajte [Na
  Sailfish OS-u](#sailfish); a tu su i rezervne kopije, pogledajte [Rezervne kopije](#backup).

## Pitanja {#faq}

### Ne sjećam se lozinke.

Ne postoji način da se vrati. Erevos ne čuva ništa što bi moglo otvoriti vaše podatke bez nje. Samo ako je uključeno
otključavanje [otiskom prsta ili licem](#lock), još uvijek otvara prvi prostor: tamo postavite novu lozinku pomoću
**Promijeni lozinku**.

### Kontakt koji je u blizini nikad ne prikazuje „U blizini“.

- Pišite mu: telefoni saznaju koji je koji iz prve poruke koja
  stigne u blizini. Pronalaze se samo kontakti, pa prvo dodajte jedno drugo.
- Držite prostor otvoren na oba telefona: Erevos na ekranu, ili u pozadini s **U pozadini** postavljenim na **Primaj
  i zvoni**.
- Provjerite je li Bluetooth uključen (a na Androidu 12 i starijem i lokacija), i smije li Erevos pronalaziti uređaje
  u blizini (postavke Androida → Aplikacije → Erevos → Dozvole).
- Približite telefone. Ako jedan od njih nema Wi-Fi Aware, sreću se preko Bluetootha, koji se sporije pokreće.
- Ili povežite oba na jednu Wi-Fi mrežu, ili na hotspot jednog telefona, s uključenim **Pronađi Erevos na istoj Wi-Fi
  mreži**. Neke javne Wi-Fi mreže drže uređaje na sebi razdvojenima: tamo to ne može raditi. Bez zajedničke Wi-Fi
  mreže, **Napravi Wi-Fi mrežu s telefonima u blizini** im omogućava da je naprave (Android 10 i noviji); dajte tome
  do minut-dva.

### Preko LoRa veze ništa ne stiže.

- Oba radija trebaju istu regiju i isti prvi kanal (njegovo ime i ključ) u aplikaciji Meshtastic, i moraju biti u
  dometu jedan drugog, ili radija između njih.
- **LoRa radio**, pod **Postavke** → **Relay i mreže**, mora reći **Povezano**. Ako ne kaže, zatvorite aplikaciju
  Meshtastic: radio se povezuje s jednom po jednom aplikacijom.
- Idu samo tekstovi, i to samo kad relay nije dostupan i nijedan telefon nije u blizini.
- U EU radio smije slati samo ograničeno svakog sata: nakon mnogo poruka, čeka.

### Kod kontakta nije dodan.

Kontaktu na drugom relayu potreban je link s ključem tog relaya, koji imaju linkovi iz ažurnog Erevosa: linija ispod
razgovora navodi taj relay. Kod iz starijeg Erevosa nema ključeve i odbija se: zatražite novi.

### Može li relay čitati moje poruke?

Ne. Poruke preko relaya šifrirane su s kraja na kraj, a ključeve imaju samo dva telefona. Relay ipak vidi koji se
redovi koriste, te kada i koliko stiže ([Vlastiti relay](#own-relay)). Uporedite sigurnosni broj, kao u [Razgovor
preko relaya](#relay), da biste bili sigurni da niko nije između. Još ništa nisu provjerili nezavisni stručnjaci.

### Zašto Erevos ne traži moj broj telefona?

Zato što mu ne treba. Svaki kontakt je par jednosmjernih redova na relayu, pa nijedan server ne čuva popis ko koga
poznaje.

### Radi li na iPhoneu ili računaru?

Na računaru, da: Linux, macOS i Windows, pogledajte [Na računaru](#desktop).
Na iPhoneu, da, iz preglednika, kao web-aplikacija, pogledajte [Na iPhoneu](#iphone).
`;
