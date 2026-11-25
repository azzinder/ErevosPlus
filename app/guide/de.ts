// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/** The user guide in German. Its format: lib/guide.ts. The same sections, in the same order and shape, as the English one. */
export const guide = `
## Was Erevos ist {#about}

Erevos ist ein Messenger, der für die Privatsphäre gemacht ist. Du brauchst kein Konto, keine Telefonnummer und keine
E-Mail-Adresse, um ihn zu nutzen, und er soll überall funktionieren, wo du bist: über ein Telefon in der Nähe ganz
ohne Netz, über WLAN oder über das Internet.

- **In der Nähe, ohne Internet:** Zwei Android-Telefone sprechen direkt über Bluetooth, Wi-Fi Aware oder Wi-Fi Direct
  miteinander, Ende-zu-Ende-verschlüsselt, und Telefone und Computer im selben WLAN oder im Hotspot eines Telefons
  ebenso. Mit einem LoRa-Funkgerät gehen Texte kilometerweit.
- **Über ein Relay:** über WLAN oder das Internet, über einen kleinen Server (ein Relay), den du selbst betreiben kannst.
- **Bereiche:** eine Passwortsperre, ein zweites Passwort, das ein separates, leeres Erevos öffnet, und versteckte Chats
  in jedem Bereich.
- **Darstellung:** die Looks von LPHL: Classic, Modernist und Nocturne, zwölf Paletten und Glas wie auf lphl.nekten.eu.

{-**Erevos+** ist dieselbe App mit mehr: Chats mit Menschen auf Telegram, Messenger, Signal, Session, Matrix, XMPP
und Nostr, auf Android 8.0 oder neuer. Wechseln, hin oder zurück, unter **Updates**: siehe
[Erevos, Erevos+ oder Erevos Lite, und Betas](#update-channel).}

> Nachrichten sind **Ende-zu-Ende-verschlüsselt**, über ein Relay und in der Nähe gleichermaßen, aber nichts davon
> wurde bisher von unabhängigen Fachleuten geprüft. [Was heute geschützt ist](#privacy) sagt genau, was geschützt ist
> und was nicht.

Diese Anleitung öffnet sich über **Anleitung** im Menü des Startbildschirms (die drei Punkte oben). Die Suche oben
darin findet jedes Wort in ihr. Die Anleitung gibt es in jeder Sprache der App, und sie erscheint in der, die du
gewählt hast, siehe [Sprache](#start).

### Wer es macht, und warum

- **Wer:** Erevos, by azzinder: dieselbe Person, die [Fasouli](https://github.com/azzinder/lphl-chrima-releases/releases/latest) gemacht hat, eine private App für deine Finanzen.
- **Wo:** Das spielt keine Rolle. Was zählt, ist, dass das Relay und die App für den Browser auf dem eigenen Server
  dieser Person laufen (lphl.nekten.eu).
- **Für wen:** für alle, die mit ihren Leuten reden wollen, ohne eine Telefonnummer, eine E-Mail-Adresse oder ein Konto
  anzugeben: Freunde, Familien, Gruppen und Menschen, die dort leben, wo das Internet abgeschaltet oder überwacht wird.
  Und für alle, die nichts zu verbergen haben und trotzdem ihren persönlichen Raum privat halten wollen, fern von
  neugierigen Blicken.
- **Warum:** weil die bekannten Apps nach einer Telefonnummer fragen, wissen, wer mit wem redet, und aufhören, wenn das
  Internet ausfällt. Weil uns die „Nutzungsbedingungen“ einiger von ihnen nicht schützen und wir Zweifel haben, wie sie
  unsere Privatsphäre schützen. Weil anderen Funktionen fehlen, die wir brauchen. Erevos verlangt nichts und findet
  einen Weg über das, was gerade da ist: das Internet, WLAN, Bluetooth, ein Telefon in der Nähe.
- **Wer zahlt:** niemand: keine Werbung, keine Investoren, keine Datensammlung. Wer möchte, kann bei den laufenden
  Kosten helfen, etwa für den Server: **Einstellungen** → **Allgemein** → **Erevos unterstützen** zeigt die Wege,
  Liberapay, PayPal, Monero und Bitcoin. Ob du gibst oder nicht, ändert nichts an der App.
  **Warum:** Jeder Weg öffnet sich außerhalb von Erevos, im Browser oder in einer Wallet, und nur, wenn du darauf
  tippst, also sendet Erevos selbst nichts und erfährt nie, wer gegeben hat. PayPal weiß, wer gibt; Monero zeigt weder,
  wer gegeben hat, noch wie viel; Bitcoin zeigt keine Namen, aber was die Adresse erhalten hat, ist öffentlich.
- **Kontakt:** **Einstellungen** → **Allgemein** → **Kontakt** fügt die Person hinter Erevos als Kontakt hinzu, und du
  schreibst in Erevos selbst, Ende-zu-Ende-verschlüsselt, ohne Telefonnummer und ohne E-Mail.

### Mit der Open-Source-Arbeit anderer gebaut

Erevos selbst ist freie Software unter der Lizenz AGPL-3.0-or-later, siehe [Lizenz](#licence), und baut auf der
Open-Source-Arbeit anderer auf. Das sind die wichtigsten Teile, jeweils mit ihren Machern und ihrer Lizenz:

- **Element Call** (Element; AGPL-3.0): Matrix-Anrufe.
- **Arti, lyrebird, Snowflake und WebTunnel** (The Tor Project; Arti MIT oder Apache-2.0, lyrebird BSD-2-Clause,
  Snowflake BSD-3-Clause, WebTunnel MIT): Tor in der App und Tor-Brücken auf Android.
- **vodozemac** (Matrix.org Foundation; Apache-2.0): die Verschlüsselung von Matrix.
- **OpenMLS** (OpenMLS Authors; MIT): verschlüsselte Gruppen.
- **RustCrypto- und dalek-cryptography-Bibliotheken** (ihre Entwickler; MIT oder Apache-2.0 bei RustCrypto,
  BSD-3-Clause bei dalek-cryptography): die Verschlüsselung selbst.
- **React Native, Expo und react-native-webrtc** (Meta, 650 Industries und die React Native WebRTC Community; MIT): die
  App und ihre Anrufe.
- **Electron** (Electron contributors; MIT): die Computer-App.
- **Inter-Schriften** (Rasmus Andersson und die Inter Project Authors; SIL Open Font License 1.1): die Schriften der App.

Die vollständige Liste, jedes Paket mit seiner Lizenz, steht in der Datei \`CREDITS.md\`, die mit dem Quellcode von
{=Erevos} kommt.

**Warum:** weil ihre Macher ihre Arbeit frei gegeben und darum gebeten haben, genannt zu werden, und weil du sehen
können sollst, woraus Erevos gemacht ist.

Dieser Teil öffnet sich auch über **Einstellungen** → **Allgemein** → **Über Erevos**.

## Erste Schritte {#start}

Erevos lädst du von seiner Release-Seite herunter, eine Datei für jedes System: Wo, und wie du es aktualisierst, steht
unter [Updates](#updates). Es läuft auf Android, auf einem Computer (Linux, macOS und Windows), unter Sailfish OS und,
im Browser, auf einem iPhone. Wenn du neu bist, beginne mit einer Einladung von jemandem, der es nutzt: ein QR-Code
oder Link, und du bist drin, mit dieser Person als Kontakt (siehe „Jemand Neues einladen“ unter
[Chat über ein Relay](#relay)).

Der Startbildschirm ist die Liste deiner Chats, der zuletzt bewegte oben. Jeder zeigt das Bild des Kontakts, die
letzte Nachricht mit ihren Zeichen, wann sie kam und wie viele seiner Nachrichten du noch nicht gelesen hast. Eine
Uhr daneben bedeutet, dass seine Nachrichten verschwinden. **Chats durchsuchen** findet einen Chat über seinen Namen
oder seine letzte Nachricht und, unter den Chats, die Nachrichten, die das Eingegebene enthalten, in allen Chats des
Bereichs: Tippe auf eine, um ihren Chat an dieser Stelle zu öffnen. In einem Chat haben seine Details
**In diesem Chat suchen**: ▲ und ▼ gehen zu früheren und späteren Treffern. Beide suchen nur auf diesem Telefon: in
dem, was es versiegelt aufbewahrt{~, und **In diesem Chat suchen** auch in den SMS, die der Chat eines Kontakts zeigt};
versteckte Chats werden nur von innen durchsucht. Ein langer Chat öffnet sich bei seinen neuesten 100 Nachrichten, und
frühere, darunter die aus Telegram oder WhatsApp importierten, kommen von selbst, während du nach oben scrollst
(**Frühere Nachrichten zeigen**, über ihnen, holt sie auch); wenn du zu einer früheren springst (aus der Suche, einer
markierten Nachricht oder der, auf die eine Nachricht antwortet), wird sie ebenfalls geholt.
Jeder Chat öffnet sich bei seiner letzten Nachricht, mit der Nachrichtenleiste darunter: Chats mit Kontakten{~, Gruppen und
SMS-Unterhaltungen| und Gruppen}{+ ebenso wie die Chats mit Matrix, XMPP und Nostr}. Ein wenig nach oben gescrollt, erscheinen unten rechts
runde Pfeile, in jedem von ihnen: Der obere geht zum Anfang des Chats, der untere zurück zu seinem Ende. Dazwischen geht,
wenn beim Öffnen des Chats einige Nachrichten neu waren, ein Doppelhaken zur ersten davon, dorthin, wo du aufgehört hast,
solange diese Nachricht nicht im Bild ist. Vom Anfang aus holt **Spätere Nachrichten zeigen**, unter dem Angezeigten,
weitere; eine Nachricht schreiben oder der untere Pfeil führt zurück zum Ende.

**Warum:** Ein langer Chat öffnet sich bei seinen neuesten Nachrichten, damit er sofort aufgeht: Alles auf einmal zu
zeichnen wäre langsam, vor allem auf älteren Telefonen. Versteckte Chats sind von der Suche des Startbildschirms
ausgenommen, damit der Startbildschirm gleich aussieht, ob ein Bereich welche hat oder nicht: Ihre Nachrichten lassen
sich nur lesen, solange ihre PIN sie geöffnet hat.

**Angeheftet und archiviert:** Halte auf dem Startbildschirm einen beliebigen Chat gedrückt, den eines Kontakts oder
einer Gruppe{~, |}{+bei Matrix, XMPP, Nostr oder SMS}{-{~auch eine SMS-Unterhaltung}}, für **Oben anheften**, **Archivieren** und, auf Android, **Diesen Chat
stummschalten**. Höchstens 10 Chats bleiben angeheftet. Ein archivierter Chat verlässt die Liste, bis eine neue
Nachricht von dort kommt; tippe oben auf **Archiviert**, um zu sehen, was du archiviert hast,{~ auch SMS,} und tippe noch
einmal, um zurückzugehen. Versteckte Chats haben ihre eigenen angehefteten und archivierten Chats.

- **Das Bild** wird aus dem Schlüssel des Kontakts gezeichnet: Derselbe Schlüssel ergibt immer dieselben Farben und
  denselben Mond{+ (in Grüntönen unter Matrix)}, sodass du einen Chat auf einen Blick erkennst, ohne Foto. Es ist keine
  Prüfung des Schlüssels; das ist die [Sicherheitsnummer](#relay).
- **Die Zeile unter der Suche** sagt, ob ein Relay eingestellt und deine Warteschlange bereit ist. Tippe darauf, um
  eines einzurichten.
- **Die Suche und diese Zeile bleiben** unter der oberen Leiste,{~ mit der Dienste-Schaltfläche,|} während die Liste scrollt.
- **Chat mit mir selbst**, immer als erster in den Chats, mit einer Nadel, enthält deine Notizen an dich selbst: siehe
  „Chat mit mir selbst und Erinnerungen“ weiter unten.
- [+] **Matrix-Chats** stehen, sobald du dich bei Matrix anmeldest, mit den anderen in der Liste, die neuesten zuerst,
  jeder mit **Matrix** markiert, und eine Einladung steht oben. Der Chip **Matrix** zeigt nur sie, und dort beginnt
  **Neuer Chat** einen Matrix-Chat: siehe [Matrix](#matrix).
- [+] **XMPP-Chats** stehen, sobald du dich bei XMPP anmeldest, auf dieselbe Weise in der Liste, jeder mit **XMPP**
  markiert, und wer dich hinzufügen möchte oder dich in eine Gruppe einlädt, steht oben. Der Chip **XMPP** zeigt nur
  sie, und dort beginnt **Neuer Chat** einen XMPP-Chat: siehe [XMPP](#xmpp).
- [+] **Nostr-Chats** stehen, sobald der Bereich einen Nostr-Schlüssel hat, genauso in der Liste, jeder mit **Nostr**
  markiert. Der Chip **Nostr** zeigt nur sie, mit der Zahl der ungelesenen Nachrichten, und dort öffnet **Neuer Chat**
  den Bildschirm der Nostr-Chats: siehe [Chats mit anderen Nostr-Apps](#nostr-chats).
- **Alle als gelesen markieren**, im ⋮-Menü, liest auf einmal jeden Chat des Teils der Liste, in dem du bist (alle
  Nachrichten{~, SMS| oder}{-{~ oder|} Erevos}{+, Erevos, Matrix, XMPP oder Nostr}), auch stummgeschaltete und mit PIN gesperrte, nachdem es gefragt
  hat. Jeder wird gelesen, als hättest du ihn geöffnet, also erfahren die, die geschrieben haben, davon wie dann;
  Einladungen und Leute, die dich hinzufügen wollen, bleiben, bis du ihnen antwortest.{+ Die Matrix-, XMPP- und
  Nostr-Bildschirme haben es unter **Chats** für ihre eigenen Chats.} Versteckte Chats liest es nie.
- [+] **Der öffentliche Feed** ist, sobald der Bereich einen Nostr-Schlüssel hat oder in einem öffentlichen Matrix-Raum
  ist, ein weiterer Chip, **Öffentlich**: ein Feed wie in Amethyst, mit den öffentlichen Beiträgen der Menschen, denen
  dein Nostr-Schlüssel folgt, und den Nachrichten der öffentlichen Matrix-Räume, in denen du bist, das Neueste zuerst.
  Jeder zeigt, wer ihn geschrieben hat (ein kleines N oder M nennt das Netz), wann, seinen Text, seine Fotos im Beitrag
  und eine Karte für seinen Link. Sind beide an, wählen **Alle**, **Nostr** und **Matrix** über dem Feed, was zu sehen
  ist, und **Fotos** wählt, wie Fotos und Karten geholt werden. Unter einem Beitrag: antworten, erneut teilen, liken
  und teilen; unter einer Matrix-Nachricht: antworten, reagieren und teilen. **Neuer Beitrag**, der Stift unten,
  schreibt einen öffentlichen Beitrag mit bis zu vier Fotos. Siehe [Chats mit anderen Nostr-Apps](#nostr-chats).
- **Neuer Chat**, unten, fragt, wo die andere Person ist, **Neben mir**, **Weit weg** oder **Ich habe ihren Code**,
  und fügt sie hinzu; die Zeilen darunter öffnen deinen eigenen Link, die blockierten Kontakte und die
  Relay-Einstellungen. **Erinnern**, die orange Glocke daneben, schreibt eine Erinnerung für dich.
- **{~Der grüne Hörer und die violette Person|Die violette Person}** oben, auf Android, {~öffnen direkt **Telefon** und **Kontakte**, in den
  Farben ihrer Symbole|öffnet direkt **Kontakte**, in der
  Farbe ihres Symbols} auf dem Startbildschirm des Telefons. Im Menü unter den drei Punkten {~sind sie|ist sie} nicht noch einmal.
- [~] **Die Dienste-Schaltfläche**, unter der oberen Leiste, wo sie beim Scrollen der Liste bleibt, sobald in den Modulen zwei Teile mit Nachrichten an sind, sagt,
  welcher Teil der Liste zu sehen ist (**Alle Dienste** oder der gewählte), mit den Zeichen der Dienste, den
  ungelesenen Nachrichten aller und in Rot einem Dienst, der gerade nicht verbunden ist. Tippe darauf für das Fenster
  **Dienste**: eine Karte für jeden Teil, der an ist, auch ohne Chat, jede mit ihren ungelesenen Nachrichten (99+ über
  99) und einem Punkt, grün, solange ihr Netz verbunden ist, rot mit **Offline**, wenn nicht. Eine Karte zeigt nur
  diesen Teil: **Alle** alle Chats, **SMS** nur die SMS (mit den Chats, deren letzte Nachricht eine SMS war; dort
  steht, wenn Erevos noch nicht die SMS-App ist), **Erevos** nur die Erevos-Chats, die jedes Kontakts, was auch
  zuletzt kam{+, und **Matrix**, **XMPP**, **Öffentlich** und **Nostr** ihre eigenen}. **Hinzufügen** öffnet die Module,
  um mehr einzuschalten, und **Alle als gelesen markieren** liest den gezeigten Teil. Halte eine Karte gedrückt, um
  sie nach vorn oder hinten zu verschieben oder mit **Ausblenden** auszublenden: Ein ausgeblendeter Dienst bleibt an,
  benachrichtigt aber nicht mehr und zählt nicht im Symbol (Telegram, dessen Ordner auf der Startseite
  stehen können, schon), und seine Chats verschwinden auch aus **Alle** (die Suche findet sie noch), und er
  wartet unten im Fenster, wo ein Tippen ihn wieder zeigt. Jede gehaltene Karte, auch **Alle**, kann **Öffnet
  zuerst** werden: Dort öffnet Erevos von seinem Symbol aus, und bei **Alle**, solange keine gewählt ist. Chats und Gruppen auf **Stumm** zählen nicht mit, wie bei
  der Zahl auf dem Erevos-Symbol, und was in die Suche getippt ist, ändert die Zahlen nicht. Unter der Schaltfläche
  kommen ohne Suche zuerst die Chats mit ungelesenen Nachrichten, unter **Ungelesen**, mit **Alle als gelesen
  markieren** daneben, dann die übrigen unter **Zuletzt**.
- **Das Widget**, auf Android: Füge Erevos aus den Widgets deines Startbildschirms hinzu. {~Seine vier Tasten öffnen
  **Telefon**, die **SMS**, die Erevos-**Nachrichten** und **Kontakte**, nach dem Passwort wie jeder Link (das Telefon
  ohne, wenn du es erlaubst). Über den ersten drei zeigt es, wie viele verpasste Anrufe, ungelesene SMS und neue
  Nachrichten es gibt, nie wer oder was; bei verpassten Anrufen öffnet sich **Telefon** in der **Anrufliste**.|Seine zwei Tasten öffnen die Erevos-**Nachrichten** und
  **Kontakte**, nach dem Passwort wie jeder Link. Über **Nachrichten** zeigt es, wie viele neue Nachrichten es gibt,
  nie wer oder was.} Eine
  erneut angetippte Taste zeigt ihren Bildschirm wieder, auch nachdem du dort einen anderen Tab gewählt hast. Seine
  Wörter folgen der Sprache von Erevos. **Einstellungen** → **Darstellung** → **Widget** legt die Reihenfolge seiner
  Tasten fest.
- **Das orange Schloss** oben sperrt Erevos sofort, wenn ein Passwort festgelegt ist, oder öffnet sonst die
  Sperreinstellungen.
- **Die drei Punkte** öffnen den Rest:

| Im Menü | Was es öffnet |
| --- | --- |
| **Neue Gruppe** | Einen Gruppenchat mit deinen Kontakten. Siehe [Gruppenchats](#groups). |
| **Öffentliche Gruppen** | Eine Gruppe, um deren Beitritt jeder mit ihrem Link bitten kann, mit einem Inhaber und Admins. Siehe [Öffentliche Gruppen](#public-groups). |
| **Markierte Nachrichten** | Die Nachrichten, die du mit einem Stern markiert hast, in all deinen Chats. Siehe „Das Menü einer Nachricht“ unter „Chat über ein Relay“. |
| **Telefone in der Nähe** | Deine Kontakte über Bluetooth und Wi-Fi Aware oder im selben WLAN, ohne Internet. Siehe [Chat mit einem Telefon in der Nähe](#nearby). |
| **Anleitung** | Diese Anleitung. |
| **Einstellungen · Settings** | Die letzte Zeile, mit einem Zahnrad: alles, was du einstellen kannst, in Gruppen, mit einer Suche. Siehe „Einstellungen“ weiter unten. |

In einem Chat stehen oben sein Name und sein Bild, zusammen mit dem Weg, den er nimmt: **Verschlüsselt** (Ende zu
Ende), **Online**, **In der Nähe**, solange das Telefon des Kontakts per Funk mit deinem verbunden ist, oder
**schreibt…**, mit einer Stoppuhr, wenn die Nachrichten des Chats verschwinden. Daneben startet die blaue Kachel mit
einer Kamera einen Videoanruf und die grüne mit einem Hörer einen Sprachanruf. Tippe auf den Namen oder auf **⋯**
dahinter (**⋮** auf Android), um die **Details** des Chats zu öffnen: sein Bild (tippe darauf, um es zu ändern),
**Anrufen**, **Video**, **Umbenennen** und **Bild**, dann **Verschwindende Nachrichten**, **Bildschirmfotos blockieren**, **Offline erscheinen**,
**Chat-Aussehen**, die **Sicherheitsnummer**, **In versteckte Chats verschieben**, **In einen anderen Bereich verschieben** und **Nachrichten löschen**.
**Fertig** schließt sie.

**Medien, Links und Dateien**, in den Details unter **In diesem Chat suchen**, listet auf, was der Chat enthält, jede
Art unter einem eigenen Tab mit ihrer Anzahl: **Fotos** (in einem Raster), **Videos**, **Sprachnachrichten**,
**Musik**, **Dateien** und **Links**, die neuesten zuerst unter ihren Monaten, auch die aus Telegram oder WhatsApp
importierten. Ein Tippen öffnet ein Foto oder eine Datei zum Ansehen oder Speichern, spielt einen Ton direkt dort ab
oder öffnet einen Link nach einer Rückfrage; gedrückt gehalten bietet jedes **Im Chat zeigen**, was zu seiner
Nachricht führt. Eines, das noch nicht vom Relay geholt wurde, wird im Chat angesteuert, wo ein Tippen es holt. Der
Kalender oben springt zu einem Tag: Die Tage, an denen es etwas von dieser Art gibt, sind markiert. **Zu einem Tag**,
darunter in den Details, macht dasselbe für den Chat selbst: Es springt zur ersten Nachricht dieses Tages.

**Warum:** Die Listen entstehen auf diesem Telefon aus dem, was es ohnehin aufbewahrt, also erfährt kein Server, was
ein Chat enthält; und nur die Fotos auf dem Bildschirm werden gelesen, wie im Chat, sodass ein Chat mit Tausenden davon
so schnell aufgeht wie einer ohne.

[~] **Auch bei {+Matrix, XMPP, Nostr und }SMS:** {+Ein Chat bei Matrix, XMPP oder Nostr hat unten **In diesem Chat suchen**,
**Medien, Links und Dateien**, **Zu einem Tag** und **Chat exportieren**, neben **Benachrichtigungen**, und eine}{-Eine}
SMS-Unterhaltung hat {-**In diesem Chat suchen**, **Medien, Links und Dateien**, **Zu einem Tag** und **Chat exportieren** }{+sie }als Erstes unter ihrem **⋮**. Sie sehen nur, was dieses Telefon von dem Chat behält: {+die
Nachrichten, die ein Matrix-Chat behält (unter der Suche holt **Frühere Nachrichten laden** ältere von seinem Server,
wie oben im Chat), die eines XMPP- oder Nostr-Chats und }jede SMS und MMS der Unterhaltung auf dem Telefon; der Sprung
zu einer älteren SMS lädt die Unterhaltung bis dorthin. Nichts, was du in die Suche tippst, verlässt das Telefon.
Fotos und Dateien werden aufgelistet, und ein Tippen führt zu jeder im Chat, wo ein Tippen sie wie bisher von ihrem
Server holt, sodass kein Server erfährt, welche du dir angesehen hast; die Bilder einer MMS zeigen sich direkt in der
Liste. **Chat exportieren** schreibt den Chat wie bei einem Kontakt heraus, nach derselben Frage; die Chats eines
versteckten Ortes werden nicht exportiert.

Eine gute erste Stunde:

1. Öffne **Einstellungen** → **Datenschutz und Sicherheit** → **Sperre und zweites Passwort** und lege ein Passwort
   fest, damit niemand, der das Telefon in die Hand nimmt, Erevos öffnen kann.
2. Öffne **Telefone in der Nähe** im Menü auf zwei Telefonen, die nah beieinander sind, und erlaube, worum Android
   bittet.
3. Fügt euch gegenseitig mit **Neuer Chat** → **Neben mir** hinzu, auf beiden Telefonen, wie in [Chat mit einem
   Telefon in der Nähe](#nearby), und sende eine Nachricht: Sie geht in der Nähe, Ende-zu-Ende-verschlüsselt, ohne
   Relay und ohne Internet.
4. Um aus größerer Entfernung zu reden, richte ein Relay ein, wie in [Chat über ein Relay](#relay).

### Chat mit mir selbst und Erinnerungen

**Chat mit mir selbst** steht immer oben in den Chats, mit einer Nadel, in jedem Bereich. Es ist ein Chat, in dem
sonst niemand ist: Schreib dir Notizen, Links, Fotos, Dateien und Sprachnachrichten, wie in jedem Chat. Er geht an
niemanden sonst: Er bleibt verschlüsselt im Bereich und geht nur an deine eigenen verknüpften Geräte,
Ende-zu-Ende-verschlüsselt, sodass jedes dieselben Notizen und Erinnerungen hat (siehe [Verknüpfte Geräte](#devices)).
Ein Backup nimmt alles davon mit, Notizen, Fotos, Dateien und Sprachnachrichten, wie bei Chats.

- **Eine Erinnerung:** Tippe auf **Erinnern** (die orange Glocke neben **Neuer Chat**), schreib, woran du erinnert
  werden willst, wähle eine Zeit (**In 1 Stunde**, **Heute Abend 20:00**, **Morgen 09:00** oder einen beliebigen Tag,
  eine Stunde und Minute) und tippe auf **Erinnern**. Sie landet in „Chat mit mir selbst“, mit einer Glocke und ihrer
  Zeit. Im Chat gibt **+** → **Erinnern**, oder das Gedrückthalten des Sendepfeils, auch der Notiz, die du schreibst,
  eine Zeit.
- **Zu ihrer Zeit** zeigt das Telefon auf Android eine Benachrichtigung, **Reminder** (oder **3 reminders**) –
  „Open Chat with myself to read it“, nie den Text der Erinnerung, auch wenn Erevos geschlossen und gesperrt ist;
  angetippt öffnet sie „Chat mit mir selbst“, nach dem Passwort. Bis du den Chat öffnest, erscheint die Erinnerung in
  seiner Zeile oben in den Chats, mit einer Zahl, und im Chat mit einem farbigen Rand; dort gesehen, verschwindet sie
  auch aus der Benachrichtigung. Auf einem Computer, in der Web-App oder mit ausgeschalteten Benachrichtigungen siehst
  du sie dort. Sind **Genaue Uhrzeiten** nicht erlaubt (**Einstellungen** → **Allgemein** → **Berechtigungen**), zeigt
  Android sie vielleicht ein paar Minuten zu spät.
- **Eine Notiz gedrückt halten** bietet **Kopieren**, **Öffnen** (ein Foto oder eine Datei), **Erinnern** oder
  **Erinnerung ändern** und **Keine Erinnerung**, **In einen Ordner verschieben** sowie **Löschen**.
- **Ordner:** Die Ordner-Taste oben, neben **Chat-Aussehen**, legt einen an. Dann erscheinen über den Notizen Tabs:
  **Alle**, und einer für jeden Ordner, der nur zeigt, was darin liegt; was du schreibst, sendest oder aufnimmst,
  während ein Ordner gewählt ist, kommt hinein. Eine Notiz liegt in höchstens einem Ordner: **In einen Ordner
  verschieben** legt sie in einen anderen, in einen neuen oder in **Ohne Ordner**. Wer den Tab eines Ordners gedrückt
  hält oder ihn noch einmal antippt, bekommt **Ordner umbenennen** und **Ordner löschen**; seine Notizen bleiben, ohne
  Ordner. Eine Notiz geht mit ihrem Ordner an deine verknüpften Geräte, und ein Ordner, der auf einem umbenannt oder
  gelöscht wird, wird es auch auf den anderen; ein leerer bleibt auf dem Gerät, auf dem er angelegt wurde.
- Jeder Bereich hat seinen eigenen „Chat mit mir selbst“, und ebenso jeder Platz versteckter Chats, oben in ihrer
  Liste (siehe [Versteckte Chats](#hidden)). Die Erinnerungen eines versteckten Platzes erscheinen dort, sobald seine
  PIN ihn öffnet; das Telefon meldet sie zu ihrer Zeit nur, solange **Empfangen, wenn geschlossen** für diesen Platz
  an ist, in derselben Benachrichtigung. Eine neue PIN für den Platz, die ihn leer beginnt, oder das Entfernen des
  Platzes nimmt seine Erinnerungen vom Telefon. Die Notizen eines versteckten Platzes gehen nur an die Geräte, die mit
  diesem Platz für sich verknüpft sind, nie an die des Bereichs (siehe [Verknüpfte Geräte](#devices)).
- **Aus einer anderen App:** Eine App auf dem Telefon kann darum bitten, hier eine Notiz zu behalten, wie Fasouli für
  eine anstehende Zahlung, mit ihrer Erinnerung. Erevos öffnet den Chat mit mir selbst nach dem Passwort, in dem Bereich,
  den du öffnest, und fragt zuerst **Diese Notiz behalten?**, mit Text und Zeit; nur **Hinzufügen** behält sie. Nichts
  geht an die App zurück. Bei einer geplanten Zahlung kommt die Erinnerung wieder, jeden Monat oder wie sich die Zahlung wiederholt: Sobald du sie gesehen hast, rückt sie zum nächsten Termin vor.

**Warum:** Eine Benachrichtigung erscheint auf dem Sperrbildschirm für jeden, der das Telefon in der Hand hat, also
bleibt der Text einer Erinnerung verschlüsselt in ihrem Bereich, und Android erfährt nur ihre Zeit: Die
Benachrichtigung kann niemandem sagen, woran du dich erinnern wolltest, noch in welchem Bereich sie ist. Und die
Notizen gehen an niemanden außer an deine eigenen Geräte, Ende-zu-Ende-verschlüsselt zwischen ihnen wie deine Chats:
Das Relay trägt sie nur verschlüsselt.

- [~] **Aus anderen Chats:** Eine Nachricht aus {+einem Matrix-, XMPP-, Nostr- oder }{-einer }SMS-{+Chat}{-Unterhaltung} kann auch hierher kommen, mit
  einer Erinnerung: **Erinnern** in ihrem Menü.

### Mit Wischgesten navigieren

- **Zurück:** Wische irgendwo auf einem Bildschirm nach rechts, um zurückzugehen, wie es der Zurück-Pfeil tut. Links
  kommt ein runder Pfeil heraus; lass los, sobald er ganz ist, oder wische schnell, und du bist zurück. Lässt du früher
  los, bleibst du. In einem Chat macht es, was sein Zurück-Pfeil macht: zurück zur Liste der Chats, oder aus den
  versteckten Chats heraus, wobei sie geschlossen werden. In den **Details** eines Chats schließt es sie.
- **Tabs:** Wische nach links oder rechts, um zum benachbarten Tab zu gehen, wie ein Tippen auf seinen Chip:{~ **Alle**,
  **SMS**}{+,}{-{~ und}}{~ **Erevos**}{+, **Matrix**, **XMPP** und **Nostr**}{~ auf dem Startbildschirm (die, die in den Modulen an sind),
  **Wähltasten**, **Anrufliste** und **Favoriten** in **Telefon**,} die Filter in **Kontakte** und die Sticker-Sätze.{~
  Auf dem Startbildschirm wählst du die Teile im Fenster **Dienste**, über die Schaltfläche unter der oberen Leiste.}
- Auf einem Bildschirm mit Tabs wechselt ein Wischen nur den Tab, auch auf den Zeilen seiner Liste, und über den
  ersten oder letzten Tab hinaus tut es nichts: Geh dorthin mit dem Zurück-Pfeil zurück.{~ Eine SMS-Unterhaltung wird
  archiviert oder gelöscht, indem du sie gedrückt hältst.}

### Einstellungen

**Einstellungen · Settings**, die letzte Zeile des Menüs (die drei Punkte), enthält alles, was du in Erevos
einstellen kannst, in Gruppen, so wie die eigenen Einstellungen eines Telefons. In den anderen Sprachen heißt sie in
dieser Sprache und auf Englisch, etwa **Einstellungen · Settings**, damit du sie auch in einer Sprache findest, die du
nicht lesen kannst.

- **Einstellungen durchsuchen,** oben, findet eine Einstellung über den Anfang ihrer Wörter, mit oder ohne Akzente,
  und zeigt, wo sie ist, etwa {~**Telefon und SMS › SMS**|**Datenschutz und Sicherheit › Versteckte Chats**}. Tippe darauf, um sie zu öffnen.
- **Sprache · Language,** die Zeile unter der Suche, öffnet die Liste der Sprachen, siehe „Sprache“ weiter unten.
- **Eine Gruppe** öffnet die Liste ihrer Einstellungen, und eine Einstellung öffnet ihren Bildschirm. Eine
  Einstellung mit Teilen, etwa {~**SMS**|**Backups**}, listet sie auf, und jeder Teil öffnet sich einzeln.
- **Nur was hier funktioniert, wird gezeigt:** Auf einem Computer, unter Sailfish OS und in der Web-App gibt es kein{~
  **Telefon und SMS**, kein|} Tor, Nostr oder LoRa, und eine Gruppe, in der es hier nichts einzustellen gibt, erscheint
  nicht.
- [~] **Nur die Module, die an sind:** Auch die Einstellungen eines Moduls, das aus ist, etwa {+**Matrix** oder
  }**Telefon und SMS**, werden nicht gezeigt: siehe [Module](#modules).

| Gruppe | Was darin ist |
| --- | --- |
| **Allgemein** | **Sprache**, {~**Module**, |}**Updates**, **Erevos an ein Telefon in der Nähe geben** (Android), **Was ist neu**, **Über Erevos**, **Erevos unterstützen** und **Berechtigungen** (Android und die Web-App). Siehe „Sprache“ weiter unten, {~[Module](#modules), |}[Updates](#updates) und [Erevos an ein Telefon in der Nähe](#give-app). |
| **Darstellung** | **Stil und Farben** (Look, Glas, Stil, Thema, Farben und Text auf farbigen Flächen, mit der Vorschau), **Hintergrund**, **Nachrichten** (die Form der Blasen), **Startbildschirm-Symbole** (Android), **Widget** (Android) und **Vibration bei Berührung** (Android). Siehe [Darstellung](#appearance). |
| **Benachrichtigungen** | **Im Hintergrund** (Android und die Computer-App): Empfangen und Klingeln, während Erevos geschlossen ist, und die Benachrichtigung für Nachrichten; auf einem Computer, ob Erevos mit geschlossenem Fenster weiterläuft. **Benachrichtigungen, wenn geschlossen** (die Web-App): Web Push. **Zahl auf dem Symbol**: wie viele Nachrichten ungelesen sind, auf dem Symbol von Erevos. Siehe [Auf einem iPhone](#iphone) und [Auf einem Computer](#desktop). |
| **Datenschutz und Sicherheit** | **Sperre und zweites Passwort** (Sperren, wenn Erevos öffnet, das Passwort, Bildschirmschutz, Fingerabdruck oder Gesicht, das zweite Passwort), **Versteckte Chats** (die PINs der 4 Plätze), **Panikknopf** (mit dem Panik-Passwort), **Taschenrechner anstelle von Erevos** (Android, unter Darstellung), **Bildschirmfotos** (Android) und **Diese Web-App** (nur die Web-App). Siehe [Passwortsperre](#lock), [Zweites Passwort](#second), [Versteckte Chats](#hidden) und [Panikknopf](#panic). Siehe auch [Von überall löschen](#forget). |
| **Relay und Netze** | **Wege**, **Relay** (es öffnet **Neuer Chat** mit geöffnetem **Für Fortgeschrittene**), **Heim-Relay**, **Tor** (Android), **Nostr** (Android){+,}{- und} **LoRa-Funk** (Android){+, **Matrix**, **XMPP** und **Nostr-Chats**}. Siehe [Chat über ein Relay](#relay), [Heim-Relay](#home-relay), [Über Tor](#tor), [Über Nostr](#nostr){+,}{- und} [Über LoRa-Funk](#lora){+, [Matrix](#matrix), [XMPP](#xmpp) und [Chats mit anderen Nostr-Apps](#nostr-chats)}. |
[~] | **Telefon und SMS** (Android) | **Telefon**, die Einstellungen der Telefon-App, dieselben wie **Telefon** → **Einstellungen**. **SMS**, in Teilen: **Erevos als SMS-App**, **Erevos hinter einer Nummer finden**, **SMS, wenn sonst nichts geht**, **Namen aus deinen Kontakten**, **Archiv, Spam und Papierkorb**, **Spamfilter**, **Blockierte Nummern**, **SMS zurückholen**, **Zwei SIMs** (nur mit zwei SIMs) und **Neue SMS**. Siehe [Telefon](#phone) und [SMS](#sms). |
| **Daten und Geräte** | **Backups**, **Backup-Teile**, **Verknüpfte Geräte** und **Importierte Chats**. Siehe [Backups](#backup), [Backup-Teile bei Freunden](#backup-pieces), [Verknüpfte Geräte](#devices) und [Importierte Chats](#import). |
| **Zum Testen** | **Relay-Test** und **Funktest** (Android). Siehe [Die Testbildschirme](#tests). |

### Sprache

Erevos gibt es auf Englisch, Griechisch, Deutsch, Französisch, Spanisch, Italienisch, Portugiesisch und
Serbokroatisch. Beim ersten Start folgt es der Sprache des Telefons, wenn sie eine davon ist (ein Telefon auf
Serbisch, Kroatisch, Bosnisch oder Montenegrinisch startet auf Serbokroatisch), und ist sonst auf Englisch. Um sie zu
ändern, öffne das Menü (die drei Punkte), tippe auf **Einstellungen · Settings**, seine letzte Zeile, und dann auf die
erste Zeile dort, **Sprache · Language**. In den anderen Sprachen heißen beide in dieser Sprache und auf Englisch, etwa
**Einstellungen · Settings** und **Sprache · Language**. Tippe dann auf die Sprache, jede in ihren eigenen Worten
benannt: **Ελληνικά**, **English**,
**Deutsch**, **Español**, **Français**, **Italiano**, **Português** oder **Srpskohrvatski**. Die ganze App ändert
sich sofort.

- **Diese Anleitung** gibt es ebenfalls in jeder dieser Sprachen, und sie nennt die Tasten so, wie die App sie in
  deiner zeigt. In den Sprachen außer Englisch und Griechisch kann ein Wort, das neu in der App ist, eine Weile auf
  Englisch erscheinen, bis es übersetzt ist.
- **Auf dem Telefon gespeichert:** Die Wahl wird auf diesem Telefon gespeichert, außerhalb jedes Bereichs, sodass auch
  der Passwortbildschirm in ihr erscheint und sich jeder Bereich in ihr öffnet. Sie ist nicht versiegelt: Wer das
  Telefon in der Hand hat, kann sehen, welche Sprache du gewählt hast.
- **Die Benachrichtigungen von Android** (ein eingehender Anruf, neue Nachrichten, Erevos beim Empfangen im
  Hintergrund) sind auf Griechisch, wenn Erevos es ist, und in jeder anderen Sprache auf Englisch.

## Module {#modules}

Erevos besteht aus Teilen, seinen Modulen: **Erevos** selbst (seine eigenen Chats, Gruppen und Anrufe,
Ende-zu-Ende-verschlüsselt, mit den versteckten Chats), das **Telefon**{- und}{+,} die **SMS**{+ und die Chats mit **Nostr**-,
**Matrix**- und **XMPP**-Apps sowie **Telegram**, **Messenger**, **Signal** und **Session**}. Die **Sammlung** (deine Fotos und Dateien, verschlüsselt) ist auch ein Modul. Das Telefon und die SMS gibt es nur auf Android, die Sammlung auf Android, in der Desktop-App, in der Web-App und auf Sailfish OS. Jedes davon kann an sein, auch Erevos
selbst, eines oder mehrere, mindestens eines: **Einstellungen** → **Allgemein** → **Module** schaltet jedes jederzeit
ein oder aus.

Beim allerersten Start richtet Erevos sich wie ein Installer selbst ein. Bevor sein erster Bereich öffnet: was du nicht
hergibst (keine Telefonnummer, E-Mail, kein Benutzername und kein Konto: du fügst Leute per QR-Code oder Link hinzu,
oder sie laden dich ein), ein Name für deine Kontakte, wenn du einen möchtest, und die Sprache; dann welche Module du
nutzen willst, jedes mit dem, was es tut. Dann, im Bereich: ein Bildschirm für jedes gewählte Modul, mit dem, wie du
damit anfängst (für Erevos, wie du dazukommst; für das Telefon und die SMS Erevos als Telefon-App und als SMS-App{+; für
Nostr, Matrix und XMPP dein Konto dort}) und was Android oder der Browser dafür erlauben soll. Jede Berechtigung steht
auf dem ersten Bildschirm, der sie braucht, und **Alle erlauben, nacheinander** stellt die Fragen, die Android stellt,
in Erevos selbst, eine nach der anderen. Dann die Passwortsperre und die automatischen Backups, dann was fertig ist und
was fehlt, mit **Jemanden einladen**. **Den Rest später** überlässt den Rest den Einstellungen; bis du fertig bist oder
es aufschiebst, erscheinen die Schritte beim Start von Erevos wieder. Wird Erevos mit einer Einladung geöffnet, zeigt es
sie, sobald die Schritte durch sind. Nach einem Update bleibt jedes Modul an, wie bisher, bis du sie änderst.

- **Der Name:** er ist kein Benutzername: niemand sucht danach, und er muss nicht eindeutig sein. Er geht verschlüsselt
  nur an die, die du hinzufügst, und **Mein Name** unter Einstellungen → Datenschutz und Sicherheit ändert ihn.
- **Von einem anderen Telefon umziehen:** auf Android überspringt **Ich habe {=Erevos} schon auf einem anderen Telefon**
  den Namen und die Module, die mit dem Backup kommen. Der Bereich öffnet sich, **Backups öffnen** stellt es wieder her
  (siehe [Auf ein neues Telefon umziehen](#new-phone)), und es folgen die Bildschirme der Module, die es mitbringt, dann
  Fingerabdruck und der Ordner der automatischen Backups, die bei jedem Telefon bleiben. **Ich habe noch kein Backup**
  sagt, wie man eines macht.
- **Auf einem Computer oder in einem Browser:** **Mit meinem Telefon verknüpfen** überspringt die Schritte und öffnet
  **Verknüpfte Geräte**.

- **Aus:** Ein Modul, das aus ist, startet nicht: Nichts davon läuft, wartet an einem Server oder klingelt, darum ist
  Erevos leichter, öffnet schneller und braucht weniger Akku. Es erscheint nirgends: nicht auf dem Startbildschirm, in
  seinem Menü oder in den Einstellungen, und die Symbole von Telefon und SMS verschwinden aus den Apps des Telefons.
  Ein Link, eine Benachrichtigung oder das Widget, das noch dorthin führt, sagt, dass es aus ist, mit **Module
  öffnen**.
- **Nichts wird gelöscht:** Seine Chats, Kontakte, Konten und Einstellungen sind wieder da, wenn es wieder an ist.
  Kontakte, die Passwortsperre, die Bereiche, die Backups und die Einstellungen sind immer da, was auch an ist.
- **Wieder an:** Ein eingeschaltetes Modul startet sofort, und **Berechtigungen** zeigt, was Android dafür erlauben
  soll, wie beim ersten Start.
- **Neu mit einem Update:** Ein Modul, das mit einem Update kommt, wie die Sammlung mit 7, ist an, auch wo du die
  Module gewählt hast, bevor es kam, bis du es ausschaltest.
- **Das Telefon oder die SMS aus,** während Erevos noch die Telefon-App oder die SMS-App ist: Android gibt Erevos
  weiterhin die Anrufe oder die SMS, wie bisher gespeichert. **Standard-Apps öffnen** wählt eine andere App.
- **Das Telefon allein:** Ohne ein Modul, das Nachrichten bringt, sagt der Startbildschirm es, mit **Telefon** und
  **Module**.
- **Auf dem Telefon gespeichert:** Die Wahl gilt für dieses Telefon, in jedem Bereich gleich, und wird außerhalb der
  Bereiche gespeichert, wie die Symbole, da das Telefon ohne das Passwort öffnen kann.

**Warum:** Nicht jeder will alles. Wer {=Erevos} nur als Telefon nutzt oder nur für Nostr, bekommt eine App, die nur das
tut, und ein Telefon, das nicht im Hintergrund auf Nachrichten wartet, die nie kommen.

## Chat mit einem Telefon in der Nähe {#nearby}

Solange ein Bereich offen ist, auf jedem Bildschirm, sucht {=Erevos} nach anderen Erevos-Telefonen in seiner Umgebung,
über Bluetooth und, wo das Telefon es hat, über Wi-Fi Aware, und im WLAN, in dem es ist, nach Telefonen und Computern
gleichermaßen. Internet, SIM-Karte oder WLAN-Netz sind nicht nötig. Es überbringt Nachrichten an deine Kontakte,
Ende-zu-Ende-verschlüsselt wie die über das Relay.

Es sucht erst, wenn **Nach Telefonen in der Nähe suchen** an ist, unter **Für Fortgeschrittene** → **In der Nähe, ohne
Internet**, in **Neuer Chat**: Es ist aus, bis du es auf beiden Telefonen einschaltest, und bis dahin geht alles über
das Relay. Nur **Neben mir**, in Neuer Chat, sucht auch ohne es, solange seine Seite offen ist, um einen Kontakt
hinzuzufügen.

1. Öffne **Telefone in der Nähe** im Menü auf beiden Telefonen. Beim ersten Mal bittet Android darum, Geräte in der
   Nähe finden zu dürfen (auf Android 12 und älter auch um den Standort); erlaube es, sonst finden sich die Telefone
   nicht.
2. Wenn ihr noch keine Kontakte seid, fügt euch gegenseitig hinzu: Tippe auf beiden Telefonen auf **Neuer Chat** und
   dann auf **Neben mir**, und tippe auf **Ja, dieselben**, sobald beide dieselben Bilder zeigen, wie in [Chat über
   ein Relay](#relay). Ohne Relay gibt jedes Telefon nur seine Schlüssel, und ihr erreicht euch nur in der Nähe, bis
   ihr eines habt.
3. Wähle den Kontakt, tippe in die Nachrichtenleiste unten und tippe auf den Sendepfeil. Sobald das andere Telefon
   antwortet, steht oben im Chat **In der Nähe**.

- **Solange ein Bereich offen ist:** Die Verbindungen starten, wenn ein Bereich sich öffnet, egal welcher Bildschirm
  zu sehen ist, und enden, wenn sich ein anderer Bereich öffnet: Gesperrt läuft der Bereich hinter dem
  Passwortbildschirm weiter. Eine Nachricht aus der Nähe erscheint auf dem Startbildschirm wie eine über das Relay,
  und ein Anruf klingelt auch dort. Auf Android bleiben sie mit Erevos im Hintergrund bestehen, solange
  **Im Hintergrund** auf **Empfangen und klingeln** steht. Um dort den Akku zu schonen, sucht es seltener nach
  Telefonen: Wi-Fi Direct alle zehn Minuten, Wi-Fi Aware eine Minute von jeweils fünf, und im selben WLAN hört es die
  anderen zwanzig Sekunden von jeweils zwei Minuten. Ein Telefon in der Nähe wird daher womöglich ein paar Minuten
  später gefunden; bestehende Verbindungen bleiben bestehen, und sobald Erevos sichtbar ist, sucht es so oft wie zuvor.
- **Reichweite:** ein paar Dutzend Meter im Freien, weniger durch Wände.
- **Wi-Fi Aware:** schneller, aber nicht jedes Telefon hat es. Bluetooth funktioniert auf allen. Um es abzuschalten,
  schalte **Mit Wi-Fi Aware suchen** aus, über **Erevos im selben WLAN finden**.
- **Dasselbe WLAN oder ein Hotspot:** Telefone in einem WLAN oder im Hotspot eines Telefons finden sich und sprechen
  direkt miteinander, auch wenn dieses WLAN kein Internet hat; die Desktop-App ebenso. Wenn Android fragt, ob es in
  einem WLAN ohne Internet bleiben soll, bleib. Jeder in diesem WLAN kann erkennen, dass dort eine Erevos-App ist,
  nicht wessen. Die Firewall eines Computers muss Port 47905 hereinlassen (UDP und TCP). Um es abzuschalten, schalte
  **Erevos im selben WLAN finden** unter **Für Fortgeschrittene** → **In der Nähe, ohne Internet** in **Neuer Chat**
  aus.
- **Ein eigenes WLAN (Android 10 und neuer):** Ohne gemeinsames WLAN bauen zwei Erevos-Telefone in der Nähe ein
  kleines eigenes WLAN auf (Wi-Fi Direct) und sprechen darüber wie im selben WLAN: schneller als Bluetooth, und ein
  Anruf geht darüber ohne Internet. Es fragt nichts; jedes Telefon bleibt, wo es kann, auch in seinem eigenen WLAN.
  Jeder in der Nähe kann erkennen, dass dort ein Erevos-Telefon ist, und könnte diesem kleinen WLAN beitreten, bekäme
  aber nur versiegelte Bytes. Es braucht **{=Erevos} im selben WLAN finden** eingeschaltet; um nur es abzuschalten,
  schalte **WLAN mit Telefonen in der Nähe aufbauen** darunter aus.
- **Auf einem Samsung-Telefon** sind **Mit Wi-Fi Aware suchen** und **WLAN mit Telefonen in der Nähe aufbauen** aus,
  bis du sie einschaltest: Solange eine App sie nutzt, bittet Samsung darum, sein eigenes Teilen auszuschalten.
  Bluetooth und dasselbe WLAN funktionieren ohne sie.
- **Andere Telefone in der Nähe** bekommen nur versiegelte Bytes, die sie nicht öffnen können, und nur, bis das
  Telefon deines Kontakts bekannt ist: Ab dann geht, was du sendest, nur noch an dieses. Sprachnachrichten gehen nur an
  einen Kontakt, von dem bekannt ist, dass er in der Nähe ist. Fotos und Dateien brauchen das Relay.
- **Mit zusätzlichem Relay** geht jede Nachricht auch darüber, sodass nichts verloren geht, wenn die Verbindung
  abbricht; die Kopie, die als zweite ankommt, wird nicht noch einmal gezeigt. Ist das Relay nicht erreichbar, zählt
  die Kopie aus der Nähe.
- **Von anderen Telefonen mitgenommen:** Wenn das Relay nicht erreichbar und dein Kontakt nicht in der Nähe ist,
  nehmen die Erevos-Telefone in der Nähe deine Nachricht auch mit, versiegelt für das Relay deines Kontakts. Jedes
  bewahrt sie auf, höchstens drei Tage, gibt sie an höchstens zwei weitere Telefone weiter, denen es begegnet, und
  übergibt sie über sein eigenes Relay an jenes Relay, sobald es kann; deines ebenso. Sie können sie nicht lesen und
  auch nicht erkennen, von wem oder für wen sie ist: Sie sehen nur die Adresse des Relays. Sie bleibt, wenn {=Erevos}
  sich schließt, versiegelt auf dem Telefon. Deine bleiben in deinem Bereich und gehen nur, solange er offen ist. Das
  Mitnehmen für andere ist an, solange du nicht **Nachrichten für andere mitnehmen** unter **Für
  Fortgeschrittene** → **In der Nähe, ohne Internet** in **Neuer Chat** ausschaltest, und nur für Relays im Internet
  über TLS (wss://): Ein Fremder in der Nähe bringt dein Telefon oder dein Relay nie dazu, eines in einem lokalen Netz
  oder auf dem Telefon selbst anzusprechen. Deine eigenen Nachrichten werden von den Telefonen in der Nähe
  mitgenommen, bei denen es eingeschaltet ist.
- **Von anderen Telefonen geholt:** Andersherum: Hat dein Telefon kein Internet, holt ein Erevos-Telefon daneben, das
  Internet hat und für andere mitnimmt, was auf deinem Relay für dich wartet, und gibt es dir in der Nähe. Erevos
  fragt einmal für jedes solche Telefon, auch das eines Kontakts, da ein Fremder die Nachrichten eines Kontakts
  weitergeben kann, um wie dieser zu wirken, und nur, solange es vorne ist: **Ein Telefon in deiner Nähe hat Internet.
  Soll es deine Nachrichten holen?** Dieses Telefon erfährt, welche Warteschlange auf deinem Relay deine ist und wann
  du sie liest; nie, was deine Nachrichten sagen, die nur dein Telefon öffnet. Mit der Warteschlange könnte es deine
  Nachrichten nehmen, bevor sie dich erreichen, darum wechselt dein Telefon von selbst zu einer neuen, sobald es
  wieder Internet hat, und sagt es deinen Kontakten still. Für versteckte Chats wird getrennt gefragt, und nur,
  solange sie auf dem Bildschirm sind, da jenes Telefon von einer zweiten Warteschlange erführe und damit, dass es
  versteckte Chats geben kann. Nie für ein Relay, das nur über Tor erreicht wird. Dein Telefon tut dasselbe für die
  Telefone daneben, solange **Nachrichten für andere mitnehmen** an ist, nie, solange es über Tor geht, und von einem
  anderen Relay als seinem eigenen nur, wenn du Ja sagst, gewarnt, dass dieses Relay dann die Internetadresse deines
  Telefons sieht.

**Warum:** Ein Paket sagt nicht, für wen es ist, also kann niemand in der Nähe daraus erkennen, wem es gehört. Bis das
Telefon deines Kontakts über eine Verbindung antwortet, kann auch dein Telefon nicht wissen, welches der Telefone in
der Nähe seines ist: Also gehen die kurzen Pakete an alle, jedes probiert sie, und vom ersten, das sie öffnet, ist
diese Verbindung die deines Kontakts. Eine Sprachnachricht, in größeren Stücken, wartet darauf.

> Eine Nachricht aus der Nähe öffnet sich nur in dem Bereich, der diesen Kontakt hat. Eine für einen anderen Bereich
> dieses Telefons wartet im Arbeitsspeicher, höchstens sechs Stunden, bis sich dieser Bereich öffnet. Eine für versteckte
> Chats öffnet sich nur, solange sie offen sind oder geschlossen empfangen, und wartet bis dahin ebenso.

**Warum:** Die Verbindungen in der Nähe gehören dem Telefon, nicht einem Bereich, und nichts darauf nennt einen: Was
ankommt, wird in den Chats des offenen Bereichs probiert und für die anderen eine Weile im Arbeitsspeicher gehalten,
nie auf das Telefon geschrieben. Versteckte Chats nutzen sie
auch, aber was sie hören, gehört ihnen: Die Verbindung, auf der ein versteckter Kontakt gehört wurde, wird getrennt von
der des Bereichs gehalten, nur im Arbeitsspeicher und nur, solange diese versteckten Chats offen sind oder geschlossen
empfangen, sodass der Bereich nie erfährt, dass einer ihrer Kontakte in der Nähe ist; und in der Luft sehen ihre
Nachrichten aus wie die des Bereichs. Sie tragen nie Nachrichten anderer, werden nie von anderen getragen und gehen nie
über LoRa{~ oder per SMS}.

**Bluetooth, dem man nicht folgen kann:** Was dein Telefon über Bluetooth aussendet, damit andere es finden, sagt nur,
dass ein Telefon mit {=Erevos} in der Nähe ist, mit einer Zufallszahl, die sich alle neun bis zwölf Minuten ändert, und
ab Android 8 von einer Adresse, die sich mit ihr ändert. Wer erst an einem Ort und dann an einem anderen mithört, kann
so nicht erkennen, dass es dasselbe Telefon ist, zumindest nicht an Erevos. Bestehende Verbindungen bleiben bestehen.
Telefone mit einem älteren {=Erevos} finden deins, und deins sie, wie bisher.

## Über LoRa-Funk {#lora}

Mit einem Meshtastic-LoRa-Funkgerät, das per Bluetooth mit dem Telefon verbunden ist, erreicht Erevos ein Erevos mit
einem Funkgerät im selben Mesh, kilometerweit entfernt, ohne Internet: direkt oder über die Meshtastic-Funkgeräte
dazwischen. Es ist aus, solange du kein Funkgerät einstellst, und nur auf Android.

1. Richte das Funkgerät zuerst in der Meshtastic-App ein, vor allem seine **Region**: Ohne sie sendet es nichts.
   Schließe dann die Meshtastic-App oder trenne sie dort: Ein Funkgerät verbindet sich immer nur mit einer App.
2. Öffne **Einstellungen** → **Relay und Netze** → **LoRa-Funk**, tippe auf **Mein Funkgerät finden**, lies, was dort
   steht, und tippe auf dein Funkgerät, wenn es erscheint. Ein noch nicht gekoppeltes Funkgerät fragt nach seiner PIN:
   Sie steht auf dem Bildschirm des Funkgeräts, oder sie ist 123456.
3. Dein Kontakt macht dasselbe mit seinem, im selben Mesh: dieselbe Region und derselbe erste Kanal.
4. Schreib wie immer. Wenn das Relay nicht erreichbar und kein Telefon in der Nähe ist, geht ein Text über LoRa, und
   die Zeile unter dem Chat sagt es.

- **Nur Text, und langsam:** Eine Nachricht geht in Stücken von etwa 220 Bytes, jedes eine oder zwei Sekunden in der
  Luft, und das Gesetz erlaubt einem Funkgerät nur begrenzt Sendezeit (in der EU ein Zehntel jeder Stunde). Deshalb
  nimmt LoRa nur Texte und Löschungen, und nur, wenn nichts anderes es tut. Sprachnachrichten, Fotos und Dateien warten
  im Chat, als **Wartet** markiert, und gehen von selbst, sobald das Relay oder ein Telefon in der Nähe sie annehmen
  kann; auch Anrufe brauchen eines davon. Die erste Nachricht an einen Kontakt dauert länger, weil sie die Schlüssel
  enthält.
- **Zeichen:** **✓✓** kommt mit der nächsten Nachricht des Kontakts, da Zeichen allein nicht über LoRa gehen.
- **Ersatzstücke, und lange Texte gepackt:** Eine Nachricht aus zwei Stücken oder mehr geht mit Ersatzstücken
  danach, eines für je vier, damit das Erevos deines Kontakts unterwegs verlorene Stücke ersetzt, ohne dass etwas
  erneut gesendet wird; sie brauchen etwas mehr Sendezeit. Ein langer Text geht gepackt, kleiner und ohne Verlust,
  an einen Kontakt, dessen Erevos gepackte Nachrichten liest, und braucht so weniger Stücke oder passt überhaupt erst;
  ein kurzer geht, wie er ist.
- **An jedes Funkgerät in Reichweite:** Jede Nachricht wird von jedem Funkgerät in der Umgebung gehört und von den
  Meshtastic-Funkgeräten weitergegeben, wie Meshtastic es tut. Jedes Erevos probiert sie; nur das deines Kontakts
  öffnet sie. Über LoRa wird nichts für andere mitgenommen.
- **Sein Name und wo es ist:** Meshtastic-Funkgeräte nennen ab und zu jedem Funkgerät in Reichweite ihren Namen, und
  wo sie sind, wenn sie GPS oder eine feste Position haben, im Klartext. Erevos hält deines davon ab
  (**Verschwiegen**): Es setzt seine Rolle auf Client hidden, schaltet sein GPS aus und entfernt eine feste Position.
  Einem Funkgerät, das nach seinem Namen fragt, antwortet es trotzdem, also gib ihm in der Meshtastic-App einen Namen,
  der nichts über dich sagt. **Allen in Reichweite gesagt** stellt seine Rolle und sein GPS nach einer Warnung wieder
  her; eine feste Position wird in der Meshtastic-App neu gesetzt. Wenn das Funkgerät die Einstellungen nicht behält,
  sagt der LoRa-Bildschirm es.
- **Es bleibt verbunden**, solange Erevos läuft, und verbindet sich von selbst wieder, wenn das Funkgerät wieder in
  Reichweite kommt. **LoRa ausschalten** gibt dem Funkgerät seine Rolle und sein GPS zurück, wenn es verbunden ist,
  trennt es dann und vergisst es. Versteckte Chats gehen nie über LoRa.

**Warum:** Was ein Meshtastic-Funkgerät über sich selbst sagt, geht im Klartext an jeden, der kilometerweit entfernt
zuhört: Sein Name und wo es ist könnten zeigen, wo du bist, und das Funkgerät mit dir in Verbindung bringen, also hält
Erevos es still, solange du nichts anderes wählst. Und da das Gesetz einem Funkgerät nur begrenzt Sendezeit erlaubt,
bleibt LoRa deinen eigenen Texten vorbehalten, wenn nichts anderes sie nehmen kann, nie dem, was andere Telefone es
mitnehmen lassen würden.

> Ein LoRa-Funkgerät ist kilometerweit zu hören, und sein Signal lässt sich bis zu seinem Standort zurückverfolgen,
> ob still oder nicht. Was Erevos sendet, bleibt Ende-zu-Ende-verschlüsselt, aber jeder mit einem Funkgerät kann
> erkennen, dass deines sendet, wann und wie viel. Mit **Allen in Reichweite gesagt** kann außerdem jeder mit einem
> Funkgerät seinen Namen lesen und wo es ist.

## Chat über ein Relay {#relay}

Ein Relay ist ein kleiner Server, der Einweg-Warteschlangen führt: Jedes Telefon hat seine eigene Warteschlange, und
wer seinen **Kontaktlink** hat, kann Nachrichten hineinlegen. Das Relay führt keine Konten, Namen oder
Telefonnummern und kann die Nachrichten nicht lesen: Sie sind Ende-zu-Ende-verschlüsselt, und nur die beiden Telefone
haben die Schlüssel. Jedes Telefon kann ein eigenes Relay nutzen: Eine Nachricht an einen Kontakt auf einem anderen
Relay wird für dessen Relay versiegelt und deinem übergeben, das sie weiterreicht, sodass sein Relay nie die Adresse
deines Telefons sieht. Ein Telefon ohne Relay bekommt einen Platz auf dem seines Kontakts, siehe
**Kein eigenes Relay** weiter unten.

**Warum:** Mit Warteschlangen und ohne Konten führt kein Server eine Liste, wer wen kennt, und niemand braucht deine
Telefonnummer oder E-Mail-Adresse, um dich zu erreichen: Wer deinen Kontaktlink hat, kann in deine Warteschlange
schreiben, und nur du liest sie.

1. Tippe auf dem Startbildschirm auf **Neuer Chat**. Solange etwas fehlt, sagt oben **So bist du jetzt verbunden** in
   einfachen Worten, wie deine Kontakte dich erreichen: über dein Relay, über Nostr ohne Relay oder nur in der Nähe;
   wenn alles funktioniert, wird es nicht angezeigt. Mit Relay findet ein Feld ganz oben einen Kontakt nach Namen oder
   fügt einen dort eingefügten Link hinzu. Dann kommt eine Frage, **Wo ist die andere Person?**, und jede Antwort
   öffnet eine eigene Seite: **Neben mir**, **Weit weg** und **Ich habe ihren Code**, wie in 4 bis 6 unten. Drei
   Zeilen darunter öffnen den Rest: **Mein Link**, **Blockierte Kontakte** und **Für Fortgeschrittene**, wo die
   eigenen Einstellungen des Relays sind; **Einstellungen** → **Relay und Netze** → **Relay** öffnet „Neuer Chat“ mit
   ihnen geöffnet.
2. Gib unter **Für Fortgeschrittene** die **Relay-Adresse** ein: \`ws://<Adresse des Computers>:7879\` für ein Relay in
   deinem eigenen Netz oder \`wss://relay.example.org\` für eines im Internet. Füge das **Token** hinzu, wenn das Relay
   eines braucht.
3. Erevos legt deine Warteschlange darauf von selbst an, ein paar Sekunden später, und sagt **Relay-Warteschlange angelegt**: Alles funktioniert, Texte, Fotos, Sprachnachrichten,
   Anrufe und Gruppen, und **So bist du jetzt verbunden** verschwindet, weil nichts fehlt. Wenn es nicht klappt, sagt der Hinweis, warum; **Meine Relay-Warteschlange anlegen** unter der Adresse versucht es erneut.
4. **Neben mir**, für jemanden neben dir: Tippt auf beiden Telefonen auf **Neuer Chat** und dann auf **Neben mir**.
   Die beiden Telefone finden sich von selbst, über Bluetooth oder das WLAN, das sie teilen, und jedes zeigt **Ein
   Telefon wurde gefunden** mit sechs Bildern. Schaut auf beide Bildschirme: Sind die Bilder dieselben, in derselben
   Reihenfolge, tippt jeder von euch auf **Ja, dieselben**, und ihr seid Kontakte, ohne Relay, ohne Internet und ohne
   etwas einzutippen. **Nein, andere** lässt dieses Telefon beiseite. Die Bilder kommen aus einem Schlüssel, den die
   beiden Telefone miteinander bilden, sodass ein Telefon, das zwischen ihnen säße, jedem von euch andere zeigen
   würde; jedes Telefon gibt seinen Kontaktlink erst, wenn sein Besitzer Ja sagt, verschlüsselt mit diesem Schlüssel.
   Die Seite sucht nur nach Telefonen, solange sie offen ist, auch wenn **Nach Telefonen in der Nähe suchen** aus ist,
   das aus bleibt; in versteckten Chats und in der Web-App sucht nichts. Unter **Wenn es nicht gefunden wird** hat die
   Seite die anderen Wege für jemanden neben dir: einen QR-Code für seine Kamera, der eine Einladung ist, wo dein
   Relay dieses Telefon einladen lässt, und sonst dein Kontaktlink; **Einen Code mit 8 Ziffern zeigen**, den die
   andere Person wie in 6 eintippt; **Ihren scannen** und **Ihren Code eintippen**, für ihren; und, auf Android,
   **Kein Erevos auf ihrem Telefon?**, das ihr die App selbst gibt.
5. **Weit weg**, für jemanden, der nicht bei dir ist: Die Seite macht eine Einladung, einen Link für eine Person, in
   einer Nachricht, die fertig zum Senden ist. Tippe auf **Senden mit…** und wähle die App, mit der sie geht (im
   Browser und auf einem Computer **Einladung kopieren**), oder auf **QR-Code der Einladung**, um sie als Code zu
   zeigen. Die Person tippt auf den Link: Mit Erevos auf ihrem Telefon öffnet er sich dort, und ohne zeigt der Link
   zuerst, woher sie es bekommt. Ihr Telefon tritt dann deinem Relay mit einem eigenen Zugang bei, ohne etwas
   einzutippen, und ihr seid Kontakte. Die Seite sagt, wie weit es ist, **Die Einladung ist fertig**, **Warte, bis sie
   geöffnet wird**, **Ihr seid verbunden**, und du kannst sie inzwischen verlassen: Sobald ihr Telefon beigetreten
   ist, erscheint die Person in deinen Chats. Mehr zu Einladungen steht unten in „Jemand Neues einladen“. Wo dieses
   Telefon keine Einladung machen kann, noch ohne Relay, in versteckten Chats oder auf einem verknüpften Computer,
   gibt die Seite stattdessen deinen Kontaktlink zum Senden: Die Person öffnet ihn in Erevos oder fügt ihn unter **Ich
   habe ihren Code** ein.
6. **Ich habe ihren Code**, für das, was die andere Person dir gegeben hat. Tippe die 8 Ziffern ein, die ihr Telefon
   unter **Neben mir** → **Einen Code mit 8 Ziffern zeigen** zeigt, neben dir oder am Telefon angesagt: Dann hat jedes
   Telefon das andere als Kontakt. Der Code selbst verlässt die Telefone nie: Sie beweisen einander, dass sie ihn
   kennen, und ihre Kontaktlinks gehen verschlüsselt mit einem Schlüssel, den nur derselbe Code ergibt. Sie treffen
   sich auf öffentlichen Nostr-Relays, die weder den Code noch die Links sehen, und wer rät, hat 3 Versuche, bevor der
   Code schließt. Ein Code gilt 10 Minuten. Unter den Ziffern fügst du ihren Kontaktlink oder ihre Einladung in das
   Feld ein und tippst auf **Hinzufügen**, oder du tippst auf **Ihren QR-Code scannen** und fotografierst den Code auf
   ihrem Bildschirm, oder auf **Aus einem Foto ihres QR-Codes** für einen Screenshot oder ein Foto davon, das dir
   geschickt wurde. Erevos liest ihn und fügt den Kontakt sofort hinzu. Auf einem Computer, unter Sailfish OS und in
   der Web-App bittet **Ihren QR-Code scannen** um ein Foto davon; auf einem iPhone bietet es auch die Kamera an.
   Versteckte Chats haben diese Seite auch.
7. **Mein Link**, in den Zeilen unter den dreien, ist der eigene QR-Code und Kontaktlink dieses Telefons. Lass das
   andere Telefon den Code mit seiner Kamera scannen und dann den Link in Erevos öffnen. Der Bildschirm **Kontakt
   hinzufügen** zeigt, was er enthält: Tippe nur auf **Zum Chat hinzufügen**, wenn du ihn selbst gescannt hast.
   **Hinzufügen und mit einem meiner Kontakte verknüpfen** fügt ihn ebenfalls hinzu, verknüpft mit dem Kontakt, den du
   wählst, dessen Namen der Chat übernimmt. Der Code ist kurz, sodass jede Kamera ihn liest. Wer ihn scannt, antwortet
   mit dem eigenen Kontaktlink, und dann schreibt dieses Telefon ihm zuerst. Der Code ist jedes Mal neu, wenn sich die
   Seite öffnet, und gilt einmal: Wer ihn zuerst scannt, ist sofort ein Kontakt; wer ihn danach scannt oder den Link
   nimmt, den du teilst, schreibt zuerst eine Nachrichtenanfrage. **Großer QR-Code, ohne Internet** zeigt stattdessen
   den ganzen Code, der in der Nähe ohne Internet funktioniert, und **Kleiner QR-Code** geht zurück. **Teilen**,
   darunter, sendet einen kurzen Link, den jede App antippbar macht; auf Android öffnet er Erevos, das fragt, bevor es
   ihn übernimmt. Um jemanden mit seinem Kontakt-QR-Code hinzuzufügen, braucht dein Telefon zuerst ein Relay. Dieser
   QR-Code klappt nur, wenn beide Telefone ein Relay haben, wie die Seite sagt: Nutze sonst **Neben mir** oder eine
   Einladung aus **Weit weg**. **Ihren scannen** und **Aus einem Foto ihres QR-Codes**, darunter, lesen von hier den
   Code des anderen Telefons. Dasselbe geht per Berührung: Solange der kleine Kontaktcode zu sehen ist und NFC auf
   Android eingeschaltet ist, nimmt das andere Telefon ihn, wenn du seine Rückseite an die Rückseite deines hältst.
   Das geht nur, solange Erevos im Vordergrund ist, nicht im Hintergrund, und nie mit dem großen QR-Code.

Welchen Weg du auch nimmst, er endet auf **Ihr seid verbunden**: das Bild der Person, **Ihr Name in deinen Chats**,
den ihr Telefon genannt haben kann und den du ändern kannst, und **Nachricht schreiben** oder **Noch jemanden
hinzufügen**. Der neue Chat erscheint auf dem Startbildschirm mit dem Namen **Kontakt** und den ersten Zeichen des
Schlüssels, bis er einen Namen hat: **Umbenennen** in seinen Details gibt ihm einen. Direkt nachdem du jemanden hier
hinzugefügt hast, lässt dich **Mit einem meiner Kontakte verknüpfen** unter dem Hinweis, dass er hinzugefügt wurde,
stattdessen einen deiner Kontakte wählen (**Nicht jetzt** lässt es): Der Chat übernimmt den Namen dieses Kontakts,
wenn er keinen eigenen hat, und die Karte des Kontakts zeigt den Chat. Versteckte Chats bieten nur ihre eigenen
Kontakte an, nie die des Telefons. Es genügt, dass ein Telefon das andere hinzufügt: Einen Link hinzuzufügen beginnt
eine verschlüsselte Unterhaltung und sagt dem anderen Telefon, wie es antworten kann, sodass es den Chat anzeigt, wenn
es das nächste Mal in seine Warteschlange schaut, was es alle paar Sekunden tut.

**Was das Relay von einem Chat sieht:** Alle deine Kontakte schreiben in deine eine Warteschlange. Sobald jedes
Telefon eine Nachricht vom anderen bekommen hat, wird jede Nachricht zwischen ihnen noch einmal für das Telefon
versiegelt, an das sie geht, mit einem Schlüssel, den dieses Telefon innerhalb des Chats gegeben hat, sodass jede für
das Relay aus zufälligen Bytes in einer von wenigen Größen besteht und es daraus nicht erkennen kann, zu welcher
Unterhaltung sie gehören. Die erste Nachricht eines Chats und alle, die gesendet werden, bevor die Antwort kommt,
zeigen es noch. Das Relay sieht weiterhin, welche Adresse jede Nachricht hineinlegt, und wann. Und jede sagt dem Relay,
in einem Byte, das es liest, was sie trägt: eine Nachricht, die jemand liest, Mitteilungen zwischen Telefonen (dass
eine Nachricht ankam oder gelesen wurde, Tippen, Online-Sein, Reaktionen, neue Schlüssel) oder einen Anruf, der
klingelt. Das Relay sieht also, was Nachrichten sind und wann ein Anruf beginnt, ob Benachrichtigungen an sind oder
nicht: So kann die Benachrichtigung einer geschlossenen Web-App sie zählen, und die Benachrichtigung geschlossener
versteckter Chats.

### Wege zum Relay

Ein Relay, das ein Token braucht, lässt ein Telefon auf drei Wegen herein. Jeder Weg endet mit einem eigenen Token des
Telefons dort, sodass, wer das Relay betreibt, jedes einzelne Telefon für sich allein herausnehmen kann.

- **Eine Einladung:** ein QR-Code oder Link von einem Telefon, das schon auf dem Relay ist (siehe „Jemand Neues
  einladen“ weiter unten). Nichts einzutippen, und ihr seid sofort Kontakte.
- **Ein Konto:** **Mit LPHL anmelden**, wenn das Relay es anbietet (siehe „Beim Relay anmelden“ weiter unten). Jedes
  LPHL-Konto kann das, auf bis zu 10 Telefonen.
- **Das Token des Relays:** das eine Token für alle, von dem, der das Relay betreibt, eingegeben unter **Token**.
  Erevos tauscht es sofort und von selbst gegen ein eigenes Token des Telefons, dort so benannt, wie du dich in
  Einladungen nennst (\`phone\`, wenn du keinen Namen angegeben hast), sagt das und nutzt von da an nur noch dieses. So
  kann dieses Telefon auch einladen. Es braucht ein Relay, das Einladungen annimmt, ab nach Erevos 3.1.0; mit einem
  älteren oder einem, das keine Einladungen annimmt, behält das Telefon das Token des Relays und kann nicht einladen.
- **Die Grenzen:** Ein Telefon kann 5 Einladungen gleichzeitig offen haben und 10 am Tag machen (der Tag nach UTC);
  jede ist für ein Telefon und hält 7 Tage. Das Relay lässt insgesamt 100 Telefone per Einladung herein, die noch
  offenen Einladungen mitgezählt, sofern sein Betreiber nichts anderes gewählt hat. Telefone, die mit einem Konto oder
  mit dem Token des Relays kamen, zählen nicht zu diesen 100: Das Relay gibt am Tag 50 Telefonen, die mit seinem Token
  kamen, ein eigenes Token, und ein Konto hat 10 Telefone. Das Relay bedient 512 Verbindungen gleichzeitig, egal von
  wem, sofern sein Betreiber nichts anderes gewählt hat.
- **Ein Telefon herausnehmen:** Wer das Relay betreibt, löscht dessen Zeile in der Token-Datei des Relays: Es kann das
  Relay nicht mehr nutzen, während die Telefone, die es eingeladen hat, ihren behalten. Hatte es jemals das Token des
  Relays, ändert der Betreiber auch dieses Token, damit es damit nicht zurückkommen kann. Telefone mit eigenen Tokens
  machen weiter wie bisher: Nur ein Telefon, in dem noch das alte Token eingegeben ist (seitdem nicht geöffnet, oder mit
  einem älteren {=Erevos}), braucht das neue.
- **Versteckte Chats** behalten das Token des Relays, das für sie eingegeben ist: Es im selben Moment wie das des
  Bereichs einzutauschen, würde dem Relay zeigen, dass sie zu diesem Telefon gehören. Wenn sich das Token des Relays
  ändert, gib das neue unter ihrem **Für Fortgeschrittene** ein.

**Warum:** Das Relay gibt jeder Verbindung einen eigenen Thread, also bedient es nur begrenzt viele gleichzeitig; und
es fügt am Tag nur begrenzt viele Zeilen für Telefone hinzu, die mit seinem einen Token kamen, sodass ein Token, das
dorthin gelangt ist, wo es nicht hingehört, seine Token-Datei nicht füllen kann.

### Jemand Neues einladen

Ein QR-Code oder Link holt jemand Neues herein: Das Telefon dieser Person tritt {=Erevos} auf deinem Relay bei, mit
eigenem Zugang, ohne etwas einzutippen, und ihr seid sofort gegenseitig Kontakte, ohne Nachrichtenanfrage.

- **Einladen:** Tippe auf dem Startbildschirm auf **Einladen** neben der Zeile des Relays oder tippe in **Neuer Chat**
  auf **Weit weg**. Die Einladung wird sofort gemacht und steht in einer Nachricht, die fertig zum Senden ist: Tippe
  auf **Senden mit…** und wähle die App, oder tippe auf **QR-Code der Einladung** und lass die Person ihn mit der
  Kamera ihres Telefons scannen. Darunter kannst du eingeben, für wen sie ist (der Name der Person in deinen Chats),
  und **Dein Name, für die Person**, oder beides leer lassen. Erneut geöffnet, solange niemand sie genommen hat und
  sie noch mindestens einen Tag gilt, zeigt sie dieselbe Einladung, verbraucht also keine der 5 wartenden und 10 am
  Tag; **Jemand anderen einladen** macht eine neue, und **Diese Einladung zurücknehmen** schließt ihren Link, solange
  kein Telefon sie genommen hat. Sie gilt für eine Person, 7 Tage lang, oder kürzer, wenn die Einladung des Relays
  früher endet. Wer sie zuerst nimmt, hat sie, also gib sie nur dieser Person. Für jemanden neben dir zeigt auch
  **Neben mir** eine solche Einladung als QR-Code. Auf einem Android-Telefon mit eingeschaltetem NFC kannst du sie
  auch per Berührung weitergeben: Halte die Rückseite seines Telefons an die Rückseite deines, solange der Code zu
  sehen ist, und sein Telefon öffnet den Link von selbst, in Erevos, wenn es installiert ist, sonst auf der Webseite
  von Erevos, die {=Erevos} anbietet. Ist NFC aus, sagt die Seite, dass du es in den Android-Einstellungen einschalten
  sollst.
- **Beitreten:** Tippe auf den Link, den die Person geschickt hat, oder scanne die Einladung mit der Kamera und öffne
  den Link in Erevos: Er öffnet **… lädt dich zu Erevos ein**, und du tippst nur auf **Beitreten**, wenn er von dieser
  Person kam. In Erevos nimmt auch **Ich habe ihren Code** in **Neuer Chat** eine Einladung: Tippe auf **Ihren QR-Code
  scannen** und fotografiere die Einladung auf dem Bildschirm der Person, oder auf **Aus einem Foto ihres QR-Codes**,
  oder füge den Link in das Feld dort ein und tippe auf **Hinzufügen**. Erevos nimmt einen eigenen Zugang zu ihrem
  Relay und eine Warteschlange dort, fügt die Person hinzu und sagt **Willkommen bei {=Erevos}**. Seine erste Nachricht
  sagt es dem Telefon der Person, das dieses sofort als Kontakt hinzufügt, so benannt, wie sie es eingegeben hat.
- **Die anderen Wege hinein:** In **Neuer Chat** öffnet **Für Fortgeschrittene** die übrigen, für wen sie sucht: **Mit
  LPHL anmelden** meldet dieses Telefon mit einem LPHL-Konto im Browser beim Relay von LPHL an (siehe „Beim Relay
  anmelden“ weiter unten), dann fügst du deine Kontakte über ihre Einladungen oder Links hinzu; **Ohne Relay
  anfangen**, wie in „Ganz ohne Relay“ unter „Über Nostr“; und die Relay-Einstellungen, wie in 1 bis 3 oben. Eine
  Einladung ist der einfachste Weg hinein, und auf dem Relay hat ein eingeladenes Telefon nur einen Namen aus
  zufälligen Buchstaben und Ziffern.
- **Ein anderes Relay:** Unter **Mit LPHL anmelden** nimmt **Bei einem anderen Relay anmelden…** die Adresse eines
  anderen Relays, so wie der Betreiber sie dir gegeben hat, etwa relay.example.org: Die Karte meldet dich dann dort an,
  benannt nach den Konten, die dieses Relay annimmt, oder sagt, dass es keine Anmeldung anbietet; dann kann dir der
  Betreiber eine Einladung geben. **Zurück zu** holt LPHL zurück.
- **Was dein Relay erlauben muss:** Der eigene Zugang ist eine Einladung zu deinem Relay (siehe „Einladungen zum
  Relay“ weiter unten), also kommt er nur von einem Telefon mit eigenem Token auf einem Relay, das Einladungen
  annimmt. Er zählt zu deinen Einladungen, unter einem Namen aus zufälligen Buchstaben und Ziffern, und bleibt, auch
  wenn deiner geht. Ein Telefon mit dem einen Token des Relays für alle tauscht es zuerst gegen ein eigenes (siehe
  „Wege zum Relay“ oben); wo das Relay das nicht tut, macht es keine Einladung: Melde dich zuerst beim Relay an (unter
  dem **Token**, unter **Für Fortgeschrittene**) oder nimm eine Einladung dazu an. Wenn dein Relay keine Einladungen
  annimmt, macht euch die Einladung trotzdem zu Kontakten, und das andere Telefon nutzt dein Relay nur so, wie es dein
  Kontaktlink zulässt, wie in „Kein eigenes Relay“ weiter unten. Eine solche Einladung öffnet sich nur auf einem
  Telefon, das Erevos schon hat.
- **Ein Telefon, das schon ein Relay hat,** behält sein eigenes: Die Einladung fügt nur dich hinzu, und ihr seid
  trotzdem sofort Kontakte.
- **Was gespeichert wird:** Dein Telefon bewahrt das Geheimnis jeder Einladung und den Namen für die Person auf,
  versiegelt im Bereich, bis sie genutzt wird oder ihre 7 Tage enden, höchstens 20 gleichzeitig. Auf dem Relay ist
  davon nichts außer der Einladung zum Relay.
- [~] **Per SMS, an jemanden, der noch kein {=Erevos} hat:** Auf Android hat die Karte eines Kontakts, der nicht in Erevos
  ist, **Per SMS einladen**. Es schreibt eine SMS an seine erste Nummer mit einem kurzen Link, in der SMS-App (der von
  Erevos, wenn sie die SMS-App des Telefons ist), damit du sie sendest oder nicht. Die Seite des Links auf dem
  Webserver von LPHL bietet der Person {=Erevos} an (die Android-App oder auf einem iPhone die Web-App) und öffnet dann
  die Einladung darin; in der Web-App auf einem iPhone fügt sie den Link unter **Ich habe eine Einladung** ein. Sie
  tippt auf **Beitreten**: Ihr Telefon tritt deinem Relay bei wie oben und antwortet deinem darüber, das sie dann
  hinzufügt, verknüpft mit dieser Nummer und so benannt wie auf der Karte. Seine erste Nachricht, die von selbst geht,
  macht dich zu ihrem Kontakt, so benannt, wie du dich in deiner letzten Einladung genannt hast. Die Einladung steht
  hinter dem **#** im Link, das an keinen Webserver geschickt wird, aber die Telefongesellschaft sieht die SMS, wie
  jede SMS: Deshalb gilt sie für eine Person, zwei Tage lang, und wenn die zwei Tage enden, ohne dass ein Telefon sie
  genutzt hat, nimmt dein Telefon seine Einladung zum Relay zurück. Es braucht ein Relay, das dein Telefon einladen
  lässt, wie oben.

### Kein eigenes Relay

Ein Telefon ohne Relay chattet trotzdem über das Internet: Wenn es den Link eines Kontakts hinzufügt, dessen Relay
Plätze verleiht, nimmt es dort einen Platz, ohne Token.

- **Wie:** Füge den Link hinzu wie in 6, ohne etwas unter **Relay**. Erevos sagt, dass du jetzt einen Platz auf dem
  Relay des Kontakts hast, über seinen Link geliehen, und nutzt ihn von da an als seinen eigenen: Dein eigener Link
  nennt ihn, sodass andere dich auch dort erreichen.
- **Wer verleiht:** Dein Link trägt nur dann ein Ticket für einen Platz auf deinem Relay, wenn du **Mit diesem Link
  einen Platz auf meinem Relay teilen** unter **Mein Link** in **Neuer Chat** einschaltest, und nur für den Link, der
  dann gezeigt wird: Das nächste Mal, wenn sich der Chat öffnet, ist es wieder aus. Das Relay braucht einen Schlüssel
  für das Senden über zwei Stationen und verleiht erst, wenn sein Betreiber das Verleihen einschaltet; der kann auch
  die Plätze eines Tickets zurücknehmen. Ein Ticket hält 30 Tage und gibt bis zu vier Plätze. Jeder, der einen Link
  mit Ticket sieht, kann damit einen Platz nehmen, also gib einen solchen Link nur denen, für die er gedacht ist.
- **Was ein geliehener Platz nicht tut:** Nachrichten an Kontakte auf anderen Relays gehen direkt an deren Relay, das
  dann die Adresse deines Telefons sieht. Er hebt nichts für später auf (eine später gesendete Nachricht wartet auf dem
  Telefon), gibt kein Anruf-Relay (Anrufe gehen direkt zwischen den Telefonen) und macht höchstens 4 weitere
  Warteschlangen und sendet höchstens 50 MB Dateien am Tag. Dein Link verleiht nichts weiter.
- **Stattdessen dein eigenes Relay:** Gib seine Adresse unter **Relay** ein: Der geliehene Platz wird aufgegeben, und
  Kontakte erfahren den neuen mit deiner nächsten Nachricht.
- **Ein Link ohne Ticket** (von einem älteren Relay oder Erevos): Ein Relay, das kein Token braucht, wird so genutzt,
  wie es ist; sonst erreicht ihr euch nur in der Nähe, bis du ein Relay hast.

**Warum:** Ein Link mit Ticket ist für jeden, der ihn sieht, ein Schlüssel zu deinem Relay, also trägt dein Link nur
dann eines, wenn du es wählst, für den dann gezeigten Link, und das Relay verleiht erst, wenn sein Betreiber es
erlaubt. Die Dateien eines geliehenen Platzes sind auf ein paar Fotos und Sprachnachrichten am Tag beschränkt, sodass
er nie den ganzen Speicher des Relays belegt.

### Einladungen zum Relay

Ein Telefon mit eigenem Token auf einem Relay, das Einladungen annimmt, kann ein weiteres Telefon dieses Relay nutzen
lassen, mit einem eigenen Token dieses Telefons, sodass kein Token eingetippt oder weitergegeben wird.

- **Einladen:** Tippe unter **Für Fortgeschrittene** in **Neuer Chat**, unter dem **Token**, auf
  **Zum Relay einladen**, gib ein, für wen sie ist, und tippe auf **Einladung machen**. Ein QR-Code öffnet sich: Lass
  das andere Telefon ihn mit seiner Kamera scannen und den Link in Erevos öffnen, oder tippe auf **Einladung teilen**
  und schick sie. Sie gilt für ein Telefon 7 Tage lang, und wer sie zuerst nimmt, hat sie, also zeig sie nur der
  richtigen Person.
- **Eine annehmen:** Der Link öffnet **Einladung zu einem Relay**, mit der Adresse des Relays: Tippe nur auf **Dieses
  Relay nutzen**, wenn sie von jemandem kam, den du kennst. In Erevos nimmt auch **Ich habe ihren Code** in **Neuer
  Chat** eine Einladung: mit **Ihren QR-Code scannen**, **Aus einem Foto ihres QR-Codes** oder ihrem Link, in das Feld
  dort eingefügt. Erevos macht ein Token für dieses Telefon, bewahrt es mit der Adresse des Relays nur in diesem
  Bereich auf und legt dort deine Warteschlange an. Nutzt das Telefon ein anderes Relay, fragt es zuerst, und Kontakte
  erfahren deine neue Warteschlange mit deiner nächsten Nachricht. Erevos nimmt eine Einladung zu einem wss://-Relay
  an, oder zu einem ws://-Relay nur in einem Heimnetz (etwa \`ws://192.168.1.10:7879\`). Versteckte Chats nehmen keine
  Einladungen an.
- **Deine Einladungen:** unter der Taste aufgelistet, offen oder in Gebrauch. **Zurücknehmen** nimmt eine noch offene
  zurück oder sperrt das Telefon, das sie genommen hat, sofort aus, nur dieses: Die Telefone, die es wiederum eingeladen
  hat, behalten ihren Zugang.
- **Ihrer bleibt:** Ein Telefon, das du eingeladen hast, behält seine Zeile auf dem Relay, auch wenn deine verschwindet,
  weil das Telefon, das dich eingeladen hat, sie zurückgenommen hat, das Konto, mit dem du dich angemeldet hast, das
  Relay nicht mehr nutzen darf oder sein Betreiber sie herausgenommen hat, und ebenso die Telefone, die es eingeladen
  hat. Nur deine noch offenen Einladungen lassen dann niemanden mehr herein.
- **Was das Relay aufbewahrt:** für dieses Telefon einen Namen aus zufälligen Buchstaben und Ziffern, der nichts darüber
  sagt, wer es ist (der Name, den du eingegeben hast, bleibt auf deinem Telefon; ein Erevos vor 6.0.0 gab dem Relay
  diesen Namen, in lateinischen Buchstaben), dass du es eingeladen hast, und einen Fingerabdruck seines Tokens, nicht
  das Token. Wer das Relay betreibt, sieht das und kann jedes Telefon davon entfernen. Ein Telefon kann 5 Einladungen
  gleichzeitig offen haben und 10 am Tag machen, und das Relay lässt nur begrenzt viele Telefone per Einladung herein
  (100, sofern sein Betreiber nichts anderes gewählt hat).
- **Wer einladen kann:** ein Telefon mit eigenem Token, auf einem Relay, dessen Betreiber Einladungen eingeschaltet hat
  (siehe [Ein eigenes Relay betreiben](#own-relay)). Ein Telefon mit dem einen Token des Relays für alle tauscht es
  zuerst gegen ein eigenes (siehe „Wege zum Relay“ oben). Mit einem geliehenen Platz gibt es kein
  **Zum Relay einladen**.

**Warum:** Das Relay bewahrt von jedem Token nur einen Fingerabdruck auf, nie das Token, also verrät seine Datei
niemandem, wie man sich verbindet. Und eine Einladung nennt ein wss://-Relay oder ein ws://-Relay zu Hause, sodass sie
die Anfragen deines Telefons nie im Klartext durch das Internet schicken kann.

### Beim Relay anmelden

Ein Relay kann Telefone sich mit einem Konto anmelden lassen, dem sein Betreiber vertraut, etwa LPHL, für ein eigenes
Token, ohne dass in Erevos etwas einzutippen ist.

- **Anmelden:** Gib die Adresse des Relays unter **Relay** ein. Wenn das Relay es anbietet, erscheint **Mit LPHL
  anmelden** unter dem **Token**. Tippe darauf: Der Browser öffnet die Anmeldeseite, auf der du deinen Namen und dein
  Passwort eingibst, die Erevos nie sieht. Die Seite des Relays zeigt dann sechs Ziffern. Auf Android tippst du dort
  auf **{=Erevos} öffnen**, und Erevos schließt die Anmeldung selbst ab; sonst gib sie ein, wie unten beschrieben. Zurück
  in Erevos, das dich direkt in **Code von der Seite** setzt, gib sie dort ein und tippe auf **Anmeldung
  abschließen**: Das Telefon bewahrt sein Token mit der Adresse des Relays nur in diesem Bereich auf und legt dort
  deine Warteschlange an. Gib den Code nur in Erevos auf deinem eigenen Telefon ein und gib ihn niemandem, auch nicht
  auf Nachfrage: Wer ihn eingibt, nutzt das Relay als du. Nach 5 falschen Codes ist die Anmeldung vorbei: Melde dich
  noch mal an. Erevos öffnet nur eine Anmeldeseite auf der eigenen Adresse des Relays, über https.
- **Eine erneute Anmeldung** auf demselben Telefon ersetzt seine Zeile auf dem Relay, wenn sein Token das ist, das es
  von diesem Relay bekommen hat. Jedes Telefon bekommt eine eigene Zeile, höchstens 10 für ein Konto.
- **Was das Relay und LPHL sehen:** Das Relay benennt die Zeile des Telefons nach deinem Benutzernamen
  (\`lphl:nekten\`), und jede Stunde fragt es LPHL, ob das Konto es noch nutzen darf: Sobald das Konto geschlossen oder
  deaktiviert ist oder LPHL 3 Tage lang nicht gefragt werden kann, verschwindet die Zeile, und das Telefon kann das
  Relay nicht mehr nutzen; die Telefone, die es eingeladen hat, behalten ihren Zugang. LPHL sieht jede Anmeldung und
  diese Prüfungen, aber nichts von deinen Bereichen, Chats oder Kontakten. Wenn du dich aus einem anderen Bereich mit
  demselben Konto anmeldest, zeigt das dem Relay, dass beide dir gehören.
- **Versteckte Chats** melden sich nicht an.

**Warum:** Die Seite zeigt den Code, und du gibst ihn in Erevos ein, nicht andersherum, also bringt ein Anmeldelink,
den dir jemand anderes schickt, diesem nichts: Nur wer sich angemeldet hat, sieht den Code, und fünf falsche beenden
die Anmeldung. Erevos öffnet eine Anmeldeseite nur auf der eigenen Adresse des Relays, über https, also kann nichts,
das an Stelle des Relays antwortet, dich auf eine Seite anderswo schicken. Und ein Anbieter, der eine Weile nicht
gefragt werden kann, sperrt kein Telefon sofort aus: Das tun erst 3 Tage ohne gültige Antwort. Und die Schaltfläche
**Erevos öffnen** ist genauso sicher: Der Link enthält nur die sechs Ziffern, die ohne das Geheimnis, das nur das
Telefon hat, das die Anmeldung begonnen hat, nichts beanspruchen, also bekommt eine App, die den Link abgefangen hat,
nichts.

### Der eigene Schlüssel des Relays

Sobald Erevos den Schlüssel deines Relays kennt (es fragt das Relay beim ersten Mal, oder ein Kontaktlink gibt ihn),
beginnt jede Verbindung zu diesem Relay mit einer Prüfung: Das Relay muss beweisen, dass es diesen Schlüssel hat, und
das Token und alles danach gehen verschlüsselt mit diesem Schlüssel, innerhalb der eigenen Verschlüsselung der
Verbindung (TLS). Unter **So bist du jetzt verbunden** sagt Erevos dann, dass dein Relay seinen eigenen Schlüssel
bewiesen hat. Ab dann erreicht dieser Bereich dieses Relay nie ohne die Prüfung.

- Ein Relay, das älter ist als diese App, beweist nichts: Es funktioniert wie bisher, und **So bist du jetzt
  verbunden** sagt, dass es älter ist. Erevos versucht es jede Stunde wieder.
- Ein Relay, das den Schlüssel nicht beweisen kann, den Erevos für es aufbewahrt, bekommt nichts, und deine Nachrichten
  warten; **So bist du jetzt verbunden** sagt es in Rot. Nur wenn sein Betreiber dir gesagt hat, dass es einen neuen
  Schlüssel hat, tippe auf **Es hat einen neuen Schlüssel**: Erevos übernimmt dann den Schlüssel, den das Relay als
  nächsten gibt.

**Warum:** Das Zertifikat der Verbindung sagt nur, dass wer antwortet ein Zertifikat für den Namen des Relays hat, das
eine Firma, die Zertifikate ausstellt, auch jemand anderem geben kann, aus Versehen oder unter Zwang. Der eigene
Schlüssel des Relays liegt nur auf seinem Server, also kann sich niemand dazwischen als es ausgeben, und ein erneuertes
Zertifikat ändert nichts.

### Die Sicherheitsnummer

Öffne den Chat, tippe auf seinen Namen und dann auf **Sicherheitsnummer**. Beide Telefone zeigen dieselben 60 Ziffern
für euch beide. Vergleicht sie persönlich oder bei einem Anruf: Wenn sie übereinstimmen, ist niemand dazwischen. Wenn
sie sich unterscheiden, vertrau diesem Chat nicht und füge den Link erneut hinzu, direkt vom Telefon des Kontakts
gescannt. Sobald der Kontakt ein Gerät verknüpft hat, sagt sie auch, wann sich die Liste seiner Geräte zuletzt
geändert hat: Deine Nachrichten gehen auch an jede Stelle darin, also frag nach, wenn er da keines verknüpft oder
getrennt hat.

Nebeneinander könnt ihr auch mit Codes prüfen, statt die Ziffern zu lesen: Unter der Nummer zeigt jedes Telefon einen
QR-Code. Tippe auf **Code des Kontakts fotografieren** und fotografiere den Code auf dem Telefon deines Kontakts, dann
macht er dasselbe mit deinem. Passt er, steht in der Zeile **Persönlich geprüft**. Jedes Telefon markiert das andere
nur nach dem, was es selbst gesehen hat, und nichts wird gesendet. Passt er nicht, ist vielleicht jemand dazwischen:
Vertraue diesem Chat nicht. **Foto des Codes auswählen** prüft stattdessen ein Foto seines Codes, das du schon hast.
Die Markierung **Persönlich geprüft** mit dem Tag bleibt, bis du **Markierung entfernen** antippst. Sie bleibt auf
diesem Telefon, wandert mit dem Chat in versteckte Chats hinein oder aus ihnen heraus und wird nicht an deine
verknüpften Geräte weitergegeben. Ein Code von einem neueren {=Erevos} sagt das: Aktualisiere Erevos und mach das Foto
dann noch einmal.

**Warum:** Der Code enthält nur einen Hash eurer beiden Schlüssel, in einer Reihenfolge, die die beiden Telefone
unterscheidet. Ein Foto deines eigenen Bildschirms prüft also nichts, und ein Foto des Codes verrät niemandem ohne
beide Schlüssel, wer ihr seid.

### Zwei Kontakte einander vorstellen

In den Chatdetails eines Kontakts kannst du mit **Einem Kontakt vorstellen** einen anderen deiner Kontakte wählen und
**Beide fragen**. Jeder wird in deinem Chat mit ihm gefragt, mit einer Nachricht, die den anderen so nennt, wie du ihn
genannt hast; beide brauchen einen Namen. Jeder antwortet in diesem Chat mit **Zustimmen** oder **Ablehnen**. Nur wenn
beide zustimmen, werden sie Kontakte: Der, aus dessen Chat du sie vorgestellt hast, schreibt zuerst, und das Telefon
des anderen nimmt ihn sofort an, so benannt, wie du ihn benannt hast. Lehnt einer ab, passiert nichts, und der andere
erfährt es nicht. Eine Vorstellung wartet eine Woche.

**Warum:** Alles davon geht innerhalb der Verschlüsselung deiner Chats mit beiden, sodass kein Relay sieht, wer wem
vorgestellt wird. Du gibst nur den Kontaktlink weiter, den der Zweite nach seiner Zustimmung geben wollte. Da, wer
vorstellt, jemand anderen unterschieben könnte, vergleiche mit dem neuen Kontakt die Sicherheitsnummer wie bei jedem.

### Gesendet, angekommen und gelesen

Über der ersten Nachricht jedes Tages steht in jedem Chat, auch in Gruppen und im Chat mit mir selbst, deutlich der
Tag: **Heute**, **Gestern**, in der letzten Woche der Wochentag und davor Wochentag und Datum, etwa **Dienstag, 10.
November**.

Unter jeder deiner Nachrichten an einen Kontakt sagt **✓**, dass das Relay oder ein Telefon in der Nähe sie angenommen
hat, **✓✓**, dass sie auf seinem Telefon angekommen ist, und **✓✓✓**, dass er sie gelesen hat. Sein Telefon sagt es
deinem, innerhalb der Verschlüsselung, wenn jedes das nächste Mal beim Relay nachsieht, oder sofort, wenn ihr in der
Nähe seid. Eine Nachricht gilt als gelesen, sobald ihr Chat auf dem Bildschirm erscheint. **Alle als gelesen markieren**
im ⋮-Menü zählt genauso: Ihre Telefone erfahren es beim nächsten Blick ins Relay.

In einer Gruppe, die nicht öffentlich ist, haben deine Nachrichten dieselben Markierungen, für alle anderen Mitglieder
zusammen: **✓**, sobald sie gesendet sind, **✓✓**, sobald die Nachricht auf dem Telefon jedes Mitglieds angekommen
ist, das in der Gruppe war, als du sie gesendet hast, und **✓✓✓**, sobald alle sie gelesen haben. Das Telefon jedes
Mitglieds sagt es deinem, in einer stillen Gruppennachricht, die nur für dich bestimmt ist, Ende-zu-Ende-verschlüsselt wie der
Rest der Gruppe: dass die Nachricht angekommen ist, ein paar Sekunden danach (zusammen mit den anderen, die inzwischen
angekommen sind, in einer), und dass sie gelesen wurde, sobald die Gruppe auf dem Bildschirm erscheint. Halte eine
deiner Nachrichten gedrückt und wähle **Wer hat es gelesen**, um zu sehen, wer sie gelesen hat und wann, auf wessen
Telefon sie angekommen ist und wann, und wer beides noch nicht getan hat, unter **Noch nicht**. Ein Mitglied, dessen
{=Erevos} älter ist als diese Markierungen, sagt nichts, bleibt also unter **Noch nicht**, und die Nachricht bleibt bei
**✓**. Öffentliche Gruppen haben keine Markierungen. Ein mit diesem Telefon verknüpfter Computer zeigt dieselben
Markierungen.

- **Wird gesendet…:** In dem Moment, in dem du auf Senden drückst, vibriert das Telefon kurz, das Feld leert sich, und
  die Nachricht erscheint, als **Wird gesendet…** markiert, bis das Relay oder das andere Telefon sie annimmt. Wenn sie
  weder gehen noch warten kann, kommen ihre Worte zurück ins Feld. Verlässt du den Chat, während sie
  **Wird gesendet…** zeigt, geht sie nicht verloren: Sie geht, oder sie wartet, als **Wartet** markiert.
- **Wartet:** Eine Nachricht, die nichts annehmen konnte, weil das Relay nicht erreichbar und das andere Telefon nicht
  in der Nähe ist, bleibt im Chat als **Wartet** markiert und geht von selbst, der Reihe nach, sobald das Relay oder
  das andere Telefon in der Nähe sie annehmen kann, solange ein Bereich offen ist; dann zeigt sie **✓**. Ein Text
  wartet sofort. Eine Sprachnachricht, ein Foto oder eine Datei fragt zuerst: **Warten lassen** oder **Löschen**. Eine
  wartende Nachricht wird nur auf diesem Telefon gelöscht. In versteckten Chats wartet sie auch, geht aber nur über
  deren Relay, nie an das Telefon in der Nähe oder über LoRa: solange sie offen sind, oder, mit eingeschaltetem
  **Empfangen, wenn geschlossen**, solange der Bereich offen ist. Wenn die Warteschlange des Kontakts auf dem Relay
  voll ist, geht ein Text, eine Sprachnachricht, ein Foto oder eine Datei trotzdem an seine verknüpften Geräte, falls er
  welche hat, erscheint als gesendet und wird für sein Telefon erneut versucht, solange die versteckten Chats offen
  bleiben: Werden sie geschlossen, bevor sie gegangen ist, bekommt sein Telefon sie nie.
- **Später senden:** Halte den Sendepfeil gedrückt und wähle **Später…**, oder tippe auf **+** und dann auf
  **Später senden**. Wähle eine Zeit mit einem Tippen (**In 1 Stunde**, **Heute Abend 20:00**, **Morgen 09:00**) oder
  den Tag, die Stunde und Minuten, bis zu einem Jahr im Voraus, dann **Später senden**. Die Nachricht bleibt im Chat
  als **Geplant** markiert, mit ihrer Zeit. Sie geht verschlüsselt an das Relay, das sie aufbewahrt und zu dieser Zeit
  sendet, auch wenn dieses Telefon dann aus oder gesperrt ist, und das andere Telefon zeigt sie ab dieser Zeit, nicht
  früher. Ist gerade kein Relay erreichbar, wartet sie auf diesem Telefon und geht an das Relay, sobald eines
  erreichbar ist. Ohne eingegebenen Text gilt die gewählte Zeit für das nächste Foto, die nächste Datei oder
  Sprachnachricht: Ein Foto oder eine Datei geht sofort an dein Relay und bleibt dort, bis der Kontakt sie holt,
  höchstens 14 Tage nach ihrer Zeit. Versteckte Chats haben es auch, auf dieselbe Weise, über ihr Relay. Bis zu ihrer
  Zeit nimmst du sie durch Löschen vom Relay zurück, und sie geht nie. Sollte sich die Relay-Warteschlange des
  Kontakts vorher ändern, hinterlegt Erevos sie erneut für die neue, wenn es das nächste Mal das Relay erreicht.
  Mit einem eigenen Token dieses Telefons geht sie nur, wenn das Telefon dann noch seine Zeile auf diesem Relay hat.
  Eine Nachricht ohne Ton bleibt ohne Ton. Ein Relay von vor dieser Funktion hebt nichts für später auf: Dann wartet
  die Nachricht auf diesem Telefon und geht zu ihrer Zeit, solange Erevos läuft, auch im Hintergrund, solange
  **Im Hintergrund** auf **Empfangen und klingeln** steht (siehe unten), oder wenn Erevos das nächste Mal öffnet.
- **Sicherheitsnachricht:** tippe sie, tippe auf **+** und dann auf **Sicherheitsnachricht**, und wähle, wie lange: 6
  oder 12 Stunden, 1, 2 oder 3 Tage oder eine Woche. Sie geht sofort an das Relay, wie eine auf später gesendete, und
  das Relay sendet sie zu dieser Zeit von selbst. Jedes Mal, wenn du Erevos öffnest, nach dem Passwort, wird sie wieder
  um diese Zeit verschoben, sie geht also nur, wenn du Erevos nicht rechtzeitig öffnest: wenn das Telefon verloren,
  weggenommen, kaputt oder vom Internet abgeschnitten ist oder dir etwas zugestoßen ist. Erevos im Hintergrund
  verschiebt sie nicht, ebenso wenig sein Passwortbildschirm, noch ein offen gelassenes Fenster, das 10 Minuten lang
  niemand berührt oder in dem niemand getippt hat. In versteckten Chats wird sie verschoben, solange ihr Ort empfängt,
  oder wenn du ihn öffnest. Im Chat ist sie als **Sicherheitsnachricht** mit der Zeit markiert, zu der sie gehen würde;
  lösche sie, um sie zu stoppen. Schreibe sie so, dass sie sagt, was sie ist: Bei deinem Kontakt kommt sie als
  gewöhnliche Nachricht an. Ist das Relay beim Öffnen von Erevos nicht erreichbar, behält sie ihre Zeit. Sie wird einmal
  verschlüsselt und geht jedes Mal, wenn sie verschoben wird, unverändert erneut an das Relay, das kostet deinen Chat
  also nichts.
  **Warum:** Eine Nachricht, die das Relay hält, braucht nichts von diesem Telefon, um zu gehen; wer das Telefon an
  sich nimmt, kann sie also nicht stoppen, außer indem er Erevos mit dem Passwort öffnet.
- **Ohne Ton senden:** Halte den Sendepfeil gedrückt und wähle **Ohne Ton**: Das andere Telefon zeigt die
  Benachrichtigung ohne Ton oder Vibration. Ein Erevos von vor dieser Funktion kennt das nicht und meldet sich wie
  gewohnt, und ebenso Erevos als Web-App, dessen Benachrichtigung vom Browser kommt. Ebenso die Benachrichtigung eines
  geschlossenen Platzes versteckter Chats mit eingeschaltetem **Melden, wenn eine Nachricht kommt** und eines
  geschlossenen Bereichs mit **Auch, wenn ein anderer Bereich offen ist**: Diese fragen das Relay nur, wie viele kamen,
  und es kann eine ohne Ton nicht von einer anderen unterscheiden, da nur die verschlüsselte Nachricht das sagt.
- **Links:** Eine Webadresse in einer Nachricht ist unterstrichen, auch eine bloße wie t.me/name oder
  example.org/page, so wie Telegram und Signal sie zeigen; eine E-Mail-Adresse oder der Name einer Datei (photo.jpg)
  nicht. Tippe darauf, und Erevos zeigt sie vollständig, um sie im Browser zu öffnen, nur wenn sie dorthin führt, wo
  du hinwillst. Vorher wird nichts abgerufen.
- **Aus einer anderen App teilen** (Android): Wähle im **Teilen** einer anderen App, etwa dem des Browsers für eine
  Seite, **Erevos**. Sobald ein Bereich offen ist, listet **Senden an** die Chats{~, Gruppen und SMS-Unterhaltungen| und Gruppen}, die
  der Startbildschirm zuletzt zeigte, dann jeden anderen Chat und jede Gruppe{+ und die Chats deiner Konten bei Matrix,
  XMPP und Nostr}, mit einer Suche; nie versteckte Chats. Wörter und Links öffnen sich im Nachrichtenfeld des gewählten
  Chats, um sie dort zu lesen und zu senden; ein Foto oder eine Datei geht, sobald sich dieser Chat oder diese Gruppe
  öffnet, ein Foto in der Qualität, die du für Fotos gewählt hast{~, und nie als SMS}. Eine Datei darf in einem
  Erevos-Chat höchstens 100 MB groß sein{+, bei Matrix und XMPP 50 MB und bei Nostr 20 MB}. Es wird beim Ankommen
  verschlüsselt, mit einem Schlüssel nur im Speicher von Erevos, und wartet so auf dem Telefon, auch während du das
  Passwort eingibst, falls Erevos vorher sperrt; es verschwindet, sobald es gesendet ist oder wenn du **Senden an**
  verlässt.
- **Der Kontakt sieht, wann du liest:** Dein Telefon sagt es seinem, wie seines es deinem sagt, außer dieser Chat
  erscheint offline (siehe unten).
- **Wann Nachrichten kommen:** Erevos schaut alle paar Sekunden beim Relay nach, solange es offen und entsperrt ist, auf
  jedem Bildschirm, und der Startbildschirm schiebt den Chat von selbst nach oben. Auf Android klingt jede neue
  Nachricht, mit einer Benachrichtigung, die nur sagt, wie viele kamen, auch während Erevos sichtbar ist; im Chat oder
  in der Gruppe, die auf dem Bildschirm offen ist, spielt nur der Ton, und das Öffnen eines Chats nimmt, was dort kam,
  aus der Zählung. Tippen und dass eine Nachricht ankam oder gelesen wurde, machen keinen. Auf Android geht es auch
  im Hintergrund weiter, solange **Im
  Hintergrund** auf **Empfangen und klingeln** steht (siehe unten): Dort wartet es beim Relay, bis etwas kommt, jeweils
  eine Minute, statt alle paar Sekunden zu fragen, und fragt nichts weiter, wenn nichts kam, damit der Akku hält, und
  eine Benachrichtigung sagt nur, wie viele Nachrichten kamen. Geschlossen, gesperrt oder sonst lange im Hintergrund
  tut es das nicht: Nachrichten warten auf dem Relay, bis zu 14 Tage, und kommen, sobald Erevos wieder öffnet. Eine
  Frage an das Relay ohne rechtzeitige Antwort (ein Warten dort seine Minute und eine halbe Minute mehr, alles andere
  45 Sekunden, ein Teil einer Datei 2 Minuten) gilt als fehlgeschlagen und wird erneut gestellt, sodass eine
  Verbindung, die unterwegs abgerissen ist, etwa wenn das Netz des Telefons schläft oder wechselt, nichts aufhält.

### Online, zuletzt online und offline erscheinen

Solange der Chat eines Kontakts auf deinem Bildschirm offen ist, fragt Erevos sein Telefon ab und zu, ob es offen ist,
und sagt, dass deines es ist. Wenn seines es ist, sagt der Chat **Online** unter seinem Namen, mit einem grünen Punkt,
und der Startbildschirm zeigt den Punkt auf seinem Bild. Jemandem zu schreiben zeigt dich ihm auch für zwei Minuten
als online. All das geht innerhalb der Verschlüsselung, nur zwischen dir und diesem Kontakt: Das Relay sieht ab und zu
eine Nachricht, wie bei jedem Chat.

Wenn ein Kontakt nicht online ist, sagt sein Chat, wann er Erevos zuletzt offen hatte, auf die Minute genau: **zuletzt
online heute um 14:32**. Dein Telefon sagt deinen Kontakten deine Zeit auf dieselbe Weise, innerhalb dessen, was
ohnehin an sie geht (eine Nachricht oder dass eine angekommen ist), und einmal, wenn einer deinen Chat öffnet, während
Erevos auf deinem Telefon geschlossen ist, nur wenn es offen war, seit ihm zuletzt Bescheid gegeben wurde. Es ist in
einem neuen Bereich aus, bis du es einschaltest, unter **Einstellungen** → **Datenschutz und Sicherheit** → **Zuletzt
online** oder in den Details eines beliebigen Chats; ein Bereich, der vor 7.0.1 angelegt wurde, behält es, wie es war:
an, solange du es nicht ausgeschaltet hast. Es gilt in beide Richtungen: Ist es aus, sieht niemand deine, und du
siehst auch niemandes; wer sie sah, verliert sie mit deiner nächsten Nachricht. Es wird für den ganzen Bereich und
seine verknüpften Geräte eingestellt, jeder Bereich für sich. Jeder Ort mit versteckten Chats hat seinen eigenen
Schalter, in den Details eines Chats dort, und seine eigene Zeit: Solange sie offen sind, zählen nur sie als offen,
nicht der Bereich.

Mit **Sagen, wenn ich Erevos öffne und schließe** an (unter **Zuletzt online**, an, solange du es nicht ausschaltest) erfahren deine
Kontakte beim Öffnen von Erevos sofort davon, ohne auf eine Nachricht zu warten: nur die, mit denen du in den letzten 30
Tagen geschrieben hast und die ihre eigene Zeit auch zeigen, jeder nach einer zufälligen Wartezeit von bis zu einer
Minute, höchstens alle 15 Minuten, nie ein Chat, der offline erscheint, oder eine Nachrichtenanfrage. Schließt Erevos, oder
schließen seine verborgenen Chats, erfahren die, denen es gesagt wurde, solange es offen war, sofort, wann es schloss, so
dass ihr **Zuletzt online** diese Zeit zeigt. Das Relay sieht dann etwas an sie gehen, wenn du Erevos öffnest und
schließt, und kann so erkennen, wann du es tust: schalte es aus, und deine Zeit
geht nur mit dem, was ohnehin an sie geht.

Während du einem Kontakt schreibst, der online erscheint, zeigt sein Chat **schreibt…** unter deinem Namen für ein
paar Sekunden, und deiner unter seinem, wenn er schreibt. Das wird höchstens alle paar Sekunden gesagt, nur solange er
online erscheint, nie an eine Nachrichtenanfrage und nicht in Gruppen.

**Warum:** Online-Sein wird nur zwischen dir und einem Kontakt gesagt, dessen Chat offen ist, innerhalb der
Verschlüsselung, also sieht das Relay nicht mehr als ab und zu eine Nachricht zwischen zwei Leuten, die reden. Die
Zeit, zu der du zuletzt online warst, reist in denselben Nachrichten mit, Ende-zu-Ende-verschlüsselt: Das Relay
erfährt sie nie. Sie verrät deinen Kontakten aber, wann du schläfst oder arbeitest, und bei zwei Kontakten, die in
derselben Minute gesehen wurden, kann man vermuten, dass sie miteinander reden: Schalte sie aus, wenn dir das wichtig
ist. Jemand, der nur deinen Link hat und als Nachrichtenanfrage schreibt, hört nichts zurück, bis du annimmst: weder
dass du liest noch dass du online bist, schreibst oder zuletzt online warst. Bis du annimmst, zeigen sich nur ihre
Worte: Fotos und Dateien warten, ungeladen, und Links zeigen keine Vorschau. Fragen die ersten Nachrichten nach einem Code, einer PIN, einem Passwort oder Geld,
versprechen sie leichtes Geld, oder ähnelt der Name dem eines deiner Kontakte, sagt **Vorsicht** es darüber. Erevos
sucht das nur auf deinem Telefon und blockiert nichts.

Um es vor einem Kontakt zu verbergen, öffne seinen Chat, tippe auf seinen Namen und dann auf **Offline erscheinen**.
Wenn es an ist:

- **Er sieht dich nicht online** und auch nicht, dass du schreibst, und dein Telefon sendet ihm nichts, während du
  liest.
- **Seine Nachrichten bleiben ✓** auf seinem Telefon, nicht ✓✓ oder ✓✓✓, während du sie liest.
- **Wenn du ihm schreibst**, erscheinst du zwei Minuten lang online, und jede seiner Nachrichten, die du gelesen hast,
  wird sofort ✓✓✓.
- **Du siehst ihn auch nicht online**, da dein Telefon nicht fragt, und nicht, wann er zuletzt online war; und er
  bekommt keine Zeit von dir.

Es wird für jeden Chat eingestellt, nur auf diesem Telefon. Schalte es wieder aus, und er sieht, was du gelesen hast,
wenn du das nächste Mal beim Relay nachsiehst.

### Namen und Löschen

Öffne einen Chat, tippe auf seinen Namen und dann auf **Umbenennen**, um ihm einen Namen zu geben. Der Name bleibt auf
diesem Telefon, versiegelt mit dem Chat: Das andere Telefon sieht ihn nicht. Ein leerer Name bringt den Anfang des
Schlüssels zurück, außer einer deiner Kontakte ist mit dem Chat verknüpft: Dann übernimmt er dessen Namen wieder, wenn
sich seine Karte das nächste Mal öffnet, während die Verknüpfung bleibt (siehe [Kontakte](#contacts)).

**Mein Name:** Unter Einstellungen → Datenschutz und Sicherheit → **Mein Name** wählst du den Namen, den deine Kontakte statt eines Codes sehen. Er wird verschlüsselt gesagt, nur den Kontakten, die du angenommen hast, und deine privaten Gruppen erfahren ihn auch: Dort erscheinen alle, die nicht deine Kontakte sind, als „Name · 1a2b“, mit dem Anfang ihres Schlüssels. Hast du einem Kontakt einen eigenen Namen gegeben (**Umbenennen**), siehst du weiter deinen; der, den er gewählt hat, steht in seinen **Details** als „Nennt sich selbst“ und als Hinweis im Feld zum Umbenennen. Jeder Space hat seinen eigenen Namen, ebenso jeder Ort versteckter Chats (in seinen Einstellungen, neben **Empfangen, wenn geschlossen**): Ein versteckter Ort übernimmt nie den Namen des Spaces und beginnt leer, und derselbe Name in zweien davon zeigt jedem, der beide sieht, dass sie dir gehören. Ein Name hat höchstens 40 Zeichen.

Tippe auf seinen Namen und dann auf **Bild**, um ihm ein Bild deiner eigenen Wahl zu geben, ein Zeichen auf einer
Farbe, statt des aus seinem Schlüssel gezeichneten. Oder tippe auf **Foto** (oder **Foto aufnehmen**) für ein Foto:
quadratisch zugeschnitten, verkleinert und neu gezeichnet, sodass nichts, was es außer seinem Bild sagte (ein Ort, ein
Telefon), aufbewahrt wird, dann in einer eigenen Datei versiegelt. Auch es bleibt auf diesem Telefon und kommt mit in
Backups; **Bild aus dem Schlüssel** bringt das gezeichnete zurück.

Jeder Chat kann auch sein eigenes Aussehen haben: Tippe auf seinen Namen und dann auf **Chat-Aussehen** für dieselbe
Auswahl wie unter **Darstellung** (Stil, Thema, Farben, Schrift, Hintergrund, Nachrichten und ihre Textgröße), nur für
diesen Chat. Eine Gruppe hat **Chat-Aussehen**, wo sich ihr Name öffnet (in einer öffentlichen Gruppe unter **⋯**), Chat
mit mir selbst hat es oben{+, und ein Chat auf Matrix, XMPP oder Nostr ganz unten, neben **Benachrichtigungen**}. Wie der
Name bleibt es auf diesem Telefon, versiegelt mit dem Chat. **Wie die App** gibt ihm wieder das Aussehen der App.

Um einen Chat außerhalb von Erevos aufzubewahren, tippe auf seinen Namen und dann auf **Chat exportieren**: Seine
Nachrichten kommen in eine Textdatei, jeder Tag unter seinem Datum und jede Nachricht mit ihrer Zeit und wer sie
geschrieben hat, gespeichert in dem Ordner, den du wählst (auf einem Computer, wo du willst). Die Datei ist nicht
verschlüsselt: Jeder, der sie hat, oder jede App, die diesen Ordner liest, kann sie lesen. Fotos, Dateien und
Sprachnachrichten werden nur genannt, verschwindende Nachrichten werden weggelassen, und versteckte Chats werden nicht
exportiert, damit keine Datei außerhalb von Erevos zeigt, dass es sie gibt.

**Warum:** Eine verschwindende Nachricht wird weggelassen, und ebenso ein Zitat daraus, da wer sie gesendet hat
wollte, dass sie verschwindet, nicht dass sie in einer Datei bleibt.

Um eine Nachricht zu löschen, halte sie gedrückt und tippe auf **Löschen**. Um alle Nachrichten eines Chats zu
löschen, tippe auf seinen Namen und dann auf **Nachrichten löschen**.
In beiden Fällen fragt Erevos, wo:

- **Dieses Telefon:** nur hier. Das andere Telefon behält seine eigenen.
- **Beide Telefone:** Das andere Telefon löscht sie auch, wenn es das nächste Mal beim Relay nachsieht. Sein Erevos
  tut das, aber eine veränderte App, ein Screenshot oder eine Kopie kann sie trotzdem behalten.

### Einen Kontakt löschen und blockieren

Tippe auf den Namen eines Chats und dann auf **Kontakt löschen**, um ihn zu vergessen: Sein Chat verschwindet von
diesem Telefon, und Erevos gibt dir sofort eine neue Relay-Warteschlange. Deine anderen Kontakte erfahren sie still, in
einer Nachricht ohne Inhalt, und erneut 7, 14 und 21 Tage später, solange sie nicht in die neue geschrieben haben; was
sie inzwischen in die alte geschrieben haben, erscheint noch 14 Tage lang. Der gelöschte Kontakt erfährt nichts, und
nichts, was er dorthin schickt, erscheint. Dein Kontaktlink bleibt, wie er war, also kann er damit weiterhin bitten,
wieder zu reden, als Nachrichtenanfrage, wie jeder, der ihn hat.

**Warum:** Alle deine Kontakte schreiben in deine eine Warteschlange, also weiß jeder, den du löschst, noch, wo sie
ist; sobald sie umzieht, kann er dir dort nicht mehr schreiben, und wer den Müll unten geschickt hat, auch nicht. Dein
Kontaktlink nennt eine eigene Warteschlange, die eine Löschung in Ruhe lässt, also funktioniert jeder Link und QR-Code,
den du gegeben hast, weiter.

**Eine Warteschlange für jeden Kontakt:** Auf einem dafür aktualisierten Relay schreibt jeder Kontakt in eine eigene
Warteschlange, die nur er kennt und die innerhalb deiner verschlüsselten Nachrichten mitgeteilt wird; die Warteschlange
deines Kontaktlinks ist dann nur für erste Nachrichten da. So kann das Relay nicht daran erkennen, wohin Nachrichten
gehen, dass zwei Kontakte an dasselbe Telefon schreiben, und jemanden zu löschen oder zu blockieren löscht nur seine
Warteschlange: Deine eigene zieht nur um, wenn er sie auch kannte, wie Kontakte von vorher sie kennen, und jemand, der
vor ihrem ersten Umzug über deinen Kontaktlink kam. Kontakte von vorher bekommen nach und nach ebenfalls eine eigene,
ein paar auf einmal, still, und auch ein älteres Erevos von ihnen übernimmt sie. Diese Warteschlangen werden ohne
Token gelesen, also verbindet das Token, das dein Telefon nennt, sie nicht miteinander; über Tor acht auf einmal, je
acht über eigene Circuits. Sie werden aber mit dem Token angelegt und gelöscht, also kann ein Relay, das Logs führt,
sie dann miteinander verbinden. Versteckte Chats und verknüpfte Computer behalten vorerst eine Warteschlange für alle.
Die Web-App hat kein Tor, also wartet sie, solange sie offen ist, an allen Warteschlangen deiner Kontakte zusammen, von
einer Adresse aus; mit eingeschalteten Benachrichtigungen, wenn geschlossen, hat dein Relay außerdem eine Push-Adresse
für alle Warteschlangen deiner Kontakte (siehe [Auf einem iPhone](#iphone)).

- **Kontakt blockieren**, darunter, macht dasselbe und verwirft außerdem, was er später schickt, auch eine Anfrage.
  **Blockieren**, neben **Ablehnen**, blockiert eine Nachrichtenanfrage: Eine Anfrage kennt nur deinen Kontaktlink,
  also zieht sie deine Warteschlange nur um, solange der Link noch diese nennt, wie bis zu deinem ersten Umzug. Wen du
  blockiert hast, steht unter **Blockierte Kontakte** in **Neuer Chat**, mit **Blockierung aufheben**. Wenn du ihn
  über seinen Link wieder hinzufügst, wirst du gebeten, zuerst die Blockierung aufzuheben; bis dahin fügt ihn nichts
  hinzu, {~weder seine Antwort auf eine Einladung per SMS noch sein Kontaktlink|nicht einmal sein Kontaktlink} in einer Gruppe. Jeder, der dir über
  deinen Kontaktlink schreibt, kann das Telefon einen Ton machen lassen, wie jede Nachricht: **Ablehnen** oder
  **Blockieren** beendet das für diesen einen, **Benachrichtigungen** → **Stumm** in seinem Chat bringt ihn zum
  Schweigen, ohne abzulehnen, und **Neuer Kontaktlink** beendet es für jeden mit dem alten Link, sobald dessen 14 Tage
  vorbei sind.
- **Gruppen:** Jemand in einer deiner Gruppen kann dir dort weiterhin schreiben. Erevos sagt, in wie vielen ihr
  zusammen seid: Verlass sie oder bitte ihren Admin, ihn hinauszunehmen.
- **Wenn das Relay nicht erreichbar ist**, ändert sich die Warteschlange, sobald es antwortet, und bis dahin erscheint
  nichts, was er schickt.
- **Geplante Nachrichten**, die du für ihn hattest, werden vom Relay zurückgenommen, sofort oder sobald es antwortet,
  sodass sie nie gehen.
- **Müll:** Wenn sich deine Warteschlange mit etwas füllt, das für niemanden hier ist, gibt dir Erevos auf dieselbe
  Weise eine neue und sagt es, höchstens einmal am Tag. Wenn Müll die Warteschlange füllt, die dein Kontaktlink nennt,
  bekommst du stattdessen einen neuen Link. Eine Flut erfundener Nachrichtenanfragen zählt auch als Müll, während ein
  Schwung echter trotzdem ankommt.
- **Neuer Kontaktlink**, unter **Mein Link** in **Neuer Chat**, gibt dir einen neuen Link: Die Links und QR-Codes, die
  du vorher gegeben hast, funktionieren noch 14 Tage, dann nicht mehr. Deine Kontakte sind nicht betroffen. Sollte das
  Relay die Warteschlange verlieren, die dein Link nennt, bekommst du auf dieselbe Weise einen neuen Link, aber die
  vorher gegebenen funktionieren sofort nicht mehr.
- **Link für eine Website**, daneben, in den Chats des Bereichs, gibt dir einen Link für eine Webseite, etwa deine
  Kontaktseite, mit dem Namen, den du dafür wählst. Er öffnet eine Seite, die {=Erevos} jedem anbietet, der es noch nicht
  hat, auf Android, einem iPhone oder einem Computer, und fügt dich dann hinzu. Wer ihn sieht, kann dir schreiben,
  deshalb kommt, was jemand schickt, als Nachrichtenanfrage, die du annimmst, ablehnst oder blockierst. Er gibt keinen
  Platz auf deinem Relay und gilt, solange dein Kontaktlink gilt: **Neuer Kontaktlink** beendet auch ihn.
- **Auf einem verknüpften Computer** geht es an das Telefon, das ihn ebenfalls löscht oder blockiert und seine
  Warteschlangen umziehen lässt, auch die des Computers. Das Telefon merkt sich, wer blockiert ist, und sagt es dem
  Computer: Wenn du ihn dort über seinen Link hinzufügst, wirst du auch gebeten, die Blockierung aufzuheben, und
  **Blockierung aufheben** hebt sie auch auf dem Telefon auf.
- **In versteckten Chats** ziehen nur die Warteschlangen dieses Platzes um, seine Klingel-Warteschlange sofort, damit
  der gelöschte Kontakt das Telefon nicht mehr klingeln lassen kann. Nichts vom Bereich oder den anderen Plätzen zieht
  um.

**Löschen** auf der Kontaktkarte (siehe [Kontakte](#contacts)) nimmt nur die Karte weg, nicht den Chat. Ein Backup,
das vor einer Löschung oder Blockierung gemacht wurde, bringt diesen Kontakt zurück: Lösche oder blockiere ihn nach
dem Wiederherstellen erneut. Nach dem Wiederherstellen sagt deine Warteschlange, dass sie neuer ist als jede, die deine
Kontakte kennen, und jeder erfährt sie erneut, damit alle dorthin schreiben, wo du liest.

### Das Menü einer Nachricht

Halte eine Nachricht gedrückt, um ihr Menü zu öffnen: die Reaktionen oben, dann was du mit ihr tun kannst.

- **Reaktionen:** Tippe auf eine, oder auf **+** für mehr. Sie erscheint unter der Nachricht auf beiden Telefonen,
  deine hervorgehoben; tippe erneut darauf, um sie zurückzunehmen. Jeder von euch hat eine Reaktion pro Nachricht. Sie
  geht sofort oder gar nicht: Wenn weder das Relay noch das andere Telefon in der Nähe sie annehmen kann, ändert sich
  nichts.
- **Antworten:** Deine nächste Nachricht antwortet darauf und zeigt sie zitiert über deinen Worten, auf beiden
  Telefonen. Tippe auf das Zitat, um zu der Nachricht zu gehen, auf die sie antwortet; **✕** verwirft es. Ein Erevos
  von vor dieser Funktion zeigt die Antwort ohne das Zitat.
- **Im Thread antworten:** antwortet darauf in einem Thread, wie in einer Gruppe: Der Thread erscheint allein, oben mit
  **Thread**, und was du dort sendest, antwortet darauf. Unter einer beantworteten Nachricht öffnet **n Antworten im
  Thread** ihn; Zurück zeigt wieder den ganzen Chat. Ein älteres Erevos zeigt jede Antwort mit ihrem Zitat.
- **Weiterleiten:** sendet eine Kopie davon in einen anderen Chat: Wähle einen Kontakt oder eine Gruppe. Ihre Worte,
  ihr Sticker oder Ort gehen neu, eine Umfrage als neue ohne Antworten, und der Ton einer Sprachnachricht oder die
  Bytes eines Fotos oder einer Datei werden neu gesendet, mit einem neuen Schlüssel verschlüsselt, sodass nichts die
  Kopie mit der Nachricht verbindet, von der sie stammt. Unter der Kopie steht **Weitergeleitet**, nicht woher; ein
  Erevos von vor dieser Funktion zeigt sie ohne das. Eine verschwindende Nachricht
  wird nicht weitergeleitet, und aus versteckten Chats geht eine Nachricht nur in dieselben versteckten Chats.
- **Mit Stern markieren:** markiert sie, nur auf diesem Telefon, um sie wiederzufinden: **Markierte Nachrichten** im
  Menü des Startbildschirms listet sie aus all deinen Chats, und die Details eines Chats listen seine eigenen. Ein
  Tippen geht zur Nachricht. Die markierten Nachrichten versteckter Chats erscheinen nur in den Details ihrer Chats.{~
  }{+Chats bei Matrix, XMPP und Nostr und }{~SMS-Unterhaltungen haben **Mit Stern markieren** auch, verschlüsselt nur auf
  diesem Telefon: Die eigenen **Markierte Nachrichten** eines Chats listen seine Sterne, und die des Startbildschirms
  listen sie mit allen anderen, jede öffnet ihren Chat bei der Nachricht. In diesen Chats bietet ein gehaltenes Foto,
  Video, eine Sprachnachricht, Datei oder das Bild einer MMS außerdem **In der Sammlung speichern**, und ein
  gehaltener Sticker oder ein Foto, das kam, bietet **Zu meinen Stickern hinzufügen**; die Stickerauswahl bei SMS
  bietet auch deine eigenen Sticker, um sie als MMS zu senden.}
- **Anheften:** heftet sie oben im Chat an, auf beiden Telefonen; jeder von euch kann sie mit **Loslösen** lösen. Sind mehrere
  angeheftet, erscheint die neueste; tippe darauf, um zu ihr zu gehen, und die nächste erscheint.
- **Kopieren:** legt ihre Worte in die Zwischenablage, um sie in einer anderen App einzufügen. Auf Android ist die
  Kopie als privat markiert, damit die Benachrichtigung des Telefons darüber die Worte nicht zeigt, aber jede App, die
  die Zwischenablage liest, kann sie lesen.
- **Auswählen:** wählt diese Nachricht aus, und ein Tippen auf andere fügt sie hinzu; eine Leiste bietet dann
  **Kopieren**, das alle Worte in einen Text mit Zeit und Verfasser jeder Nachricht legt, **Weiterleiten**, das sie in
  einen Chat sendet, und **Löschen**, das einmal fragt, bevor es sie löscht. **Zurück** beendet das Auswählen.
- **Bearbeiten:** für eine deiner Nachrichten, bis zu einem Tag nach dem Senden. Ihre Worte kommen ins Feld unter
  **Nachricht bearbeiten**: Ändere sie und sende, oder **✕**, um sie zu lassen, wie sie war. Beide Telefone zeigen die
  neuen Worte, mit **Bearbeitet** neben der Uhrzeit. Nur Worte werden bearbeitet, kein Sticker, kein Ort, keine
  Umfrage, keine Sprachnachricht, kein Foto und keine Datei, auch keine Worte, die du weitergeleitet hast. Eine, die
  noch darauf wartet zu gehen, geht mit den neuen Worten, ohne Markierung; eine für später gesendete wird nicht
  bearbeitet. Die Bearbeitung geht sofort oder gar nicht, wie eine Reaktion, und deine verknüpften Geräte zeigen sie
  auch. Ein Erevos von vor dieser Funktion behält die alten Worte.
  **Warum:** Ein Tag ist Zeit genug, um einen Fehler zu berichtigen, und niemand kann ändern, was er vor Tagen gesagt
  hat. Die Markierung zeigt, dass die Worte nicht die ersten sind.
- **Umfrage beenden:** für eine Umfrage von dir: Keine Stimmen zählen mehr, und die Endergebnisse erscheinen. Ein Erevos
  von vor dieser Funktion sieht sie weiter offen, und eine Stimme, die in diesem Moment gesendet wurde, zählt vielleicht
  nur auf manchen Telefonen.
- **Löschen:** auf diesem Telefon oder auf beiden, wie oben.

Reaktionen, Antworten, Anheftungen und Bearbeitungen reisen innerhalb der Verschlüsselung, wie die Nachrichten.

### Wie Worte aussehen

Zeichen, die um Worte getippt werden, ändern, wie sie erscheinen, in Chats und Gruppen, wie bei WhatsApp und Signal:
\`*fett*\`, \`_kursiv_\`, \`~durchgestrichen~\`, ein Wort zwischen Backticks als Code (drei Backticks um Zeilen für einen
Codeblock) und \`||Worte||\`, versteckt hinter einem grauen Balken, bis du tippst, auf dem Bildschirm, in der Zeile des
Startbildschirms und in einem Zitat (dort als ▒▒▒).

- **Nur um Worte:** Ein Zeichen zählt, wenn es ein Wort beginnt und eines beendet, daher bleiben \`2*3*4\`,
  \`snake_case\` und Webadressen, wie sie sind. Fett, kursiv und durchgestrichen bleiben in einer Zeile.
- **Andere sehen die Zeichen:** Ein Erevos von vorher und andere Apps zeigen die Worte mit ihren Zeichen, wie
  getippt.
- **Verstecktes Foto:** unter **+** sendet **Verstecktes Foto** ein Foto, das im Chat verschwommen erscheint, in den
  Chats mit Kontakten und in Gruppen, bis du es antippst; dann öffnet es sich von selbst. Auch in **Medien, Links und
  Dateien** erscheint es verschwommen. Ein Erevos von vorher zeigt es wie jedes Foto.
- **Foto zum einmaligen Ansehen:** unter **+** sendet **Foto zum einmaligen Ansehen** ein Foto, das nie im Chat
  erscheint, in den Chats mit Kontakten und in Gruppen. **Kamera, zum einmaligen Ansehen** sendet ebenso eines, das du
  gerade aufnimmst. Wer es bekommt, tippt darauf und sieht es einmal für sich, wo das Telefon es erlaubt ohne
  Bildschirmfotos; beim Schließen löscht Erevos es von seinem Telefon, und der Chat sagt **Foto einmal angesehen**. Es
  lässt sich nicht weiterleiten{~, speichern oder in die Sammlung legen| oder speichern}, und dein eigenes Telefon löscht es, sobald es
  angekommen ist. Nichts hält eine auf den Bildschirm gerichtete Kamera ab, und ein älteres Erevos zeigt es als
  verstecktes Foto.

**Warum:** Ein in die Worte getipptes Zeichen reist in ihnen, innerhalb der Verschlüsselung, ohne dass daneben etwas
mitgeschickt wird, das sich unterscheiden ließe.

### Verschwindende Nachrichten

Öffne einen Chat, tippe auf seinen Namen und dann auf **Verschwindende Nachrichten**, um zu wählen, wie lange seine
neuen Nachrichten nach dem Lesen bleiben: 5 Minuten, 1 Stunde, 1 Tag oder 1 Woche. Um nur die nächste Nachricht
verschwinden zu lassen, tippe auf die Stoppuhr neben dem Nachrichtenfeld (oder auf **Verschwindende Nachricht** unter
**+**, oder auf **Verschwinden** im Menü des Sendepfeils): **Verschwindet 1 Stunde nach dem Lesen** erscheint über dem
Feld. Tippe auf die Zeit, um eine andere zu wählen, oder auf **✕**, um es auszuschalten. Es gilt für die nächste
Nachricht, die du sendest: Worte, eine Sprachnachricht, ein Foto oder eine Datei, einen Sticker, einen Ort oder eine
Umfrage, jetzt oder später.{~ Eine SMS kann nicht verschwinden: Als SMS gesendet, bleibt sie auf beiden Telefonen
(Erevos sagt das vorher), und die Stoppuhr ist wieder aus.} Ihre Zeit beginnt, wenn das andere Telefon sie auf dem
Bildschirm zeigt, und die deiner Kopie, wenn sein Telefon das meldet
(**✓✓✓**). Jede Nachricht sagt, wann sie verschwindet. Das andere Telefon erfährt die Einstellung des Chats, wenn es
das nächste Mal beim Relay nachsieht, und jedes Telefon kann sie ändern: Die spätere Änderung gewinnt. Nachrichten, die
schon im Chat sind, bleiben.

- **Bis sie gelesen ist,** bleibt eine verschwindende Nachricht auf beiden Telefonen, versiegelt wie der Rest. Wenn
  das {=Erevos} des Kontakts nie meldet, dass es sie gelesen hat, bleibt deine Kopie.
- **Solange Erevos geschlossen ist:** Eine Nachricht, deren Zeit gekommen ist, wird gelöscht, wenn sich der Chat das
  nächste Mal öffnet. Bis dahin bleibt sie auf dem Telefon, versiegelt wie der Rest.
- **Keine Garantie:** Das {=Erevos} des Kontakts löscht sie, aber eine veränderte App, ein Screenshot oder eine Kopie kann
  sie trotzdem behalten.

### Bildschirmfotos blockieren

Öffne einen Chat, tippe auf seinen Namen und dann auf **Bildschirmfotos blockieren**: Unter Android kann keines der beiden Telefone ein Bildschirmfoto oder eine Bildschirmaufnahme des Chats machen, solange er angezeigt wird, und die letzten Apps zeigen ihn leer. Das andere Telefon erfährt es mit deiner nächsten Nachricht, und jeder von euch kann es wieder ausschalten: Die spätere Änderung gilt. Der Chat sagt es, wenn die andere Person es ändert.

**Warum:** Was du schreibst, bleibt zwischen euch beiden, außer jemand will es gezielt kopieren.

- **Nur unter Android:** {=Erevos} auf einem iPhone, auf einem Computer, im Browser oder unter Sailfish kann Bildschirmfotos nicht blockieren, und der Chat sagt es dort.
- **Keine Garantie:** Ein Foto des Bildschirms mit einer anderen Kamera oder eine veränderte App hält ihn trotzdem fest.

### Benachrichtigungen für diesen Chat

Öffne auf Android einen Chat, tippe auf seinen Namen und dann auf **Benachrichtigungen**; in einer Gruppe tippe auf
ihren Namen (in einer öffentlichen Gruppe auf **⋯**) und dann auf **Benachrichtigungen**. **Stumm** für 8 Stunden,
1 Woche oder **Immer**: Seine Nachrichten machen keinen Ton und zeigen keine Benachrichtigung, also zählt sie auch das
Symbol von Erevos nicht; die Liste zeigt sie weiter, mit einer durchgestrichenen Glocke, und seine Anrufe klingeln
weiter. **Nachrichtenton** und **Klingelton** geben ihm einen eigenen Ton für seine Nachrichten und für seine Anrufe,
aus Androids eigener Liste von Tönen, oder **Ohne Ton**. In den Details eines Chats sagt die Zeile dann **Stumm bis**
und die Uhrzeit, oder **Eigene Töne**.

**Warum:** Ein stummer Chat zählt in der Liste weiter, damit nichts verloren geht, was kam: Nur das Telefon ruft dich
nicht mehr zu ihm. Seine Töne bleiben nur auf diesem Telefon, mit dem Chat in den verschlüsselten Daten des Bereichs,
weil jedes Telefon seine eigenen Töne hat: Ein verknüpftes Gerät behält seine eigenen, und das andere Telefon erfährt
nichts davon.

- **In versteckten Chats** gibt es nur **Stumm**: Ein eigener Ton würde jedem in der Nähe verraten, welcher Chat es ist.{+
  So ist es bei den Chats der eigenen Matrix-, XMPP- und Nostr-Konten eines versteckten Platzes: stumm sagen sie nichts,
  nicht einmal „Neue Nachricht“.}
- **Ein geschlossener Bereich, und versteckte Chats, solange sie geschlossen sind,** wissen nicht, in welchem Chat eine
  Nachricht kam, und melden sie so, wie es die Einstellungen der App sagen.
- **Nur auf Android**, vorerst: Die Web-App meldet jeden Chat so, wie es ihre Einstellungen sagen.

### Sprachnachrichten

Halte im Chat eines Kontakts, ohne eingegebenen Text, das Mikrofon am Ende der Nachrichtenleiste gedrückt, während du
sprichst, und lass los, um zu senden; wische vor dem Loslassen nach links, um sie stattdessen zu verwerfen. Ein Druck
von unter einer Sekunde gilt als Versehen und sendet nichts. Nach einer Minute sendet sie sich von selbst. Beim ersten
Mal fragt Android, ob Erevos das Mikrofon nutzen darf: Es nimmt nur auf, solange du es gedrückt hältst. Mit TalkBack
tippst du einmal, um zu beginnen, und noch einmal, um zu senden. Tippe auf eine Sprachnachricht, um sie abzuspielen,
und noch einmal, um sie anzuhalten. Sprachnachrichten haben dieselben Zeichen wie der Rest und folgen der
Verschwinden-Einstellung des Chats.

**Meine Stimme ändern:** In den Details des Chats mit einem Kontakt schickt **Meine Stimme ändern** deine
Sprachnachrichten in diesem Chat **Tiefer** oder **Höher**, so lang, wie du gesprochen hast. Dein Telefon ändert den
Ton, bevor die Nachricht geht, deine eigene Stimme verlässt es also nie; schlägt die Änderung fehl, wird die Nachricht
nicht gesendet. Nur dein Telefon kennt die Einstellung. Deine Stimme ist so schwer am Klang zu erkennen, aber wer die
Aufnahme und Zeit hat, könnte einiges davon rückgängig machen. Auf Android 10 und neuer und in Browsern, die selbst
Opus erzeugen (WebCodecs); das Walkie-Talkie behält deine Stimme.

**In Worten:** Halte eine Sprachnachricht gedrückt, im Chat mit einem Kontakt oder in einer Gruppe, und wähle **In
Worten**: Dein Telefon schreibt auf, was gesagt wurde, zum Lesen oder Kopieren. Beim ersten Mal lädt es, wenn du es
sagst, ein Sprachmodell von 268 MB vom eigenen Server von Erevos, der deine Adresse sieht wie bei jedem Download;
danach geschieht alles auf deinem Telefon, und weder der Ton noch seine Worte verlassen es. Es versteht etwa hundert
Sprachen, Griechisch darunter, und erkennt die gesprochene. Es kann Fehler machen, und die Worte werden nicht
gespeichert. **Sprachmodell löschen**, darunter, gibt den Platz frei. Nur auf Android, und das Telefon braucht etwa 2
GB freien Arbeitsspeicher, da es beim Schreiben etwa 1,5 GB belegt; schlägt das fehl, öffnet der nächste Versuch das
Modell neu. Wo niemand spricht, bei Stille oder Rauschen, schreibt es nichts, statt Wörter, die niemand gesagt hat.

**Sprechen statt tippen:** Tippe auf das Mikrofon neben dem Nachrichtenfeld, in einem Chat oder einer Gruppe, und wähle **Sprechen statt tippen**: Von da an hört das gedrückt gehaltene Mikrofon zu, statt eine Sprachnachricht aufzunehmen, bis du im selben Menü **Sprachnachricht** wählst. Sprich; tippe auf **Fertig**, und deine Worte werden ins Feld geschrieben, damit du sie
vor dem Senden ändern kannst. Es nutzt dasselbe Sprachmodell wie **In Worten**, einmal geladen, wenn du es sagst, und
alles geschieht auf deinem Telefon: Weder deine Stimme noch ihre Worte verlassen es, und der Ton wird nicht behalten.
Es hört bis zu zwei Minuten zu und kann Fehler machen. Nur auf Android.

**Übersetzen:** Halte eine Nachricht gedrückt, im Chat mit einem Kontakt oder in einer Gruppe, und wähle **Übersetzen**:
Dein Telefon übersetzt sie in deine Sprache, zum Lesen oder Kopieren, zwischen Griechisch, Englisch, Deutsch, Spanisch,
Französisch und Italienisch. Es errät die Sprache der Nachricht; tippe unter **Von** oder **Nach** eine andere an, um
eine davon zu ändern. Beim ersten Mal für eine Sprache lädt es, wenn du es sagst, ihre Übersetzungsmodelle von je 60
bis 95 MB vom eigenen Server von Erevos, der deine Adresse sieht wie bei jedem Download; zwei Sprachen, von denen keine
Englisch ist, gehen über Englisch, mit einem Modell für jede. Danach geschieht alles auf deinem Telefon, und weder die
Nachricht noch ihre Übersetzung verlassen es. Die Modelle sind OPUS-MT der Universität Helsinki (CC-BY 4.0). Es kann
Fehler machen, und die Übersetzung wird nicht gespeichert. **Übersetzungsmodelle löschen**, darunter, gibt den Platz
frei. Nur auf Android.

**Warum:** Auf Android 10 und neuer, in der Web-App und auf einem Computer ist eine Sprachnachricht Opus mit 32 kbit/s,
etwa 240 KB pro Minute, wie Telegram, Element und Conversations sie senden: so klar, wie Sprache nur sein kann. Auf
Android 9 und älter und in Safari vor iOS 18.4 und macOS 15.4 ist sie AAC mit 64 kbit/s, etwa 480 KB pro Minute. Mehr
wäre in einer Stimme nicht zu hören, würde aber langsamer gesendet, vor allem über Bluetooth. Jedes Erevos spielt beide
ab: Safari vor 18.4 spielt Opus ab, sobald Erevos es für ihn neu verpackt, und wo ein Browser eines nicht abspielen
kann, sagt Erevos das.

- **Über das Relay oder in der Nähe,** Ende-zu-Ende-verschlüsselt wie die Worte, in mehreren Stücken. Niemand
  dazwischen kann sie hören, aber an den Stücken kann das Relay, oder wer in der Nähe mithört, erkennen, dass etwas
  Langes gesendet wurde, und ungefähr wie lang. In der Nähe gehen sie nur an das Telefon eines Kontakts, von dem
  bekannt ist, dass es in der Nähe ist.
- **Auf dem Telefon** wird jeder Ton in einer eigenen Datei aufbewahrt, versiegelt mit einem eigenen Schlüssel, den
  nur der versiegelte Verlauf des Chats enthält. Wenn die Nachricht verschwindet, ob gelöscht, verschwunden oder als
  älteste entfernt, verschwindet auch ihre Datei. Wie viele dieser Dateien es gibt und wie groß sie sind, zeigt
  ungefähr, wie viele Sprachnachrichten das Telefon aufbewahrt, in all seinen Bereichen zusammen, nicht in welchem.
- **Während sie abgespielt wird,** liegt der Ton entsiegelt im Cache von Erevos und wird gelöscht, sobald er endet.
  Wenn Erevos geschlossen wird, während es aufnimmt oder abspielt, verschwindet, was übrig blieb, wenn sich das nächste
  Mal ein Chat öffnet.

### Fotos und Dateien

Tippe im Chat eines Kontakts auf **+** neben dem Nachrichtenfeld, das sich dort öffnet, wo die Tastatur war, dann auf
**Foto**, um eines aus den Fotos des Telefons zu wählen, auf **Kamera**, um eines aufzunehmen, oder auf **Datei** für
alles andere, bis zu 100 MB. Darunter legt **Fotoqualität** fest, wie Fotos gehen, und
Erevos merkt es sich:

- **Original** (die Voreinstellung): das Foto genau so, wie es war, in voller Größe, ohne Qualitätsverlust. Nur, was es
  außer seinem Bild sagt, wird entfernt: wo es aufgenommen wurde, das Telefon, die Zeit, Vorschaubilder. Sein Name ist
  einfach „photo“.
  Ein Foto, das du mit **Datei** sendest (JPEG, PNG, GIF oder WebP, bis 64 MB), geht ebenfalls ohne das, unter seinem
  eigenen Namen; bei einer HEIC- oder AVIF-Datei, oder einer größeren, fragt Erevos erst, da es das dort nicht entfernen kann.
- **90%** und **75%:** ein neues, kleineres Foto, schneller zu senden, das nichts außer seinem Bild sagt.

Fotos und Dateien des Kontakts bis 16 MB kommen von selbst; tippe auf ein größeres, um es zu holen. Tippe auf ein
Foto, um es auf dem ganzen Bildschirm zu sehen, mit seiner Größe: Zwei Finger oder zweimal Tippen zoomen hinein, ein
Finger verschiebt es, solange es gezoomt ist, und einmal Tippen blendet aus oder ein, was darum ist. Tippe auf eine
Datei, um sie zu speichern. Erevos dreht sich mit dem Telefon, solange dort **Automatisch drehen** an ist, und ein
allein gezeigtes Foto dreht sich auch, wenn es aus ist. **Speichern** legt eine Kopie in einen Ordner, den du beim
ersten Mal wählst, und **In anderem Ordner speichern** ändert ihn. Fotos und Dateien haben dieselben Zeichen wie der
Rest und folgen der Verschwinden-Einstellung des Chats.

- **Mit einer anderen App öffnen:** Eine Datei, die kein Foto ist, hat unter Android auch **Öffnen**: Die App des
  Telefons für ihre Art, etwa ein PDF-Leser, liest sie aus dem Speicher von Erevos, ohne dass eine Kopie auf dem Telefon
  bleibt, und der Link wird gelöst, wenn die nächste Datei geöffnet oder der Bereich gesperrt wird. Erevos fragt zuerst,
  da diese App außerhalb von Erevos und seiner Verschlüsselung ist, und öffnet Webseiten, Zeichnungen und App-Pakete nie
  so, da sie außerhalb von Tor ins Internet gehen könnten: Speichere diese stattdessen.
- **Wie sie reisen:** Jede Datei wird auf dem Telefon mit einem eigenen Schlüssel verschlüsselt, in Stücken gleicher
  Größe, und auf dein Relay gelegt. Nur wo die Stücke sind und der Schlüssel gehen an den Kontakt,
  Ende-zu-Ende-verschlüsselt. Sein Telefon holt die Stücke über sein eigenes Relay, sodass dein Relay nie die Adresse
  seines Telefons sieht, prüft jedes Stück und löscht sie dann vom Relay. Stücke, die niemand holt, werden nach 14
  Tagen gelöscht.
- **Was das Relay sieht:** wie viele Stücke es gibt und wie groß sie sind, also ungefähr wie groß die Datei ist, und
  wann. Nicht, was sie ist oder für wen.
- **Eine Datei geht so, wie sie ist,** mit allem, was sie in sich sagt: der Autor eines Dokuments, oder Ort und Telefon
  eines Fotos, wenn du es mit **Datei** sendest. Sende Fotos mit **Foto**.
- **Auf dem Telefon** wird jede Datei in ihren Stücken aufbewahrt, so wie sie gereist sind, versiegelt mit einem
  eigenen Schlüssel, den nur der versiegelte Verlauf des Chats enthält. Wenn die Nachricht verschwindet, verschwinden
  auch ihre Stücke. Wie viele Stücke es gibt, zeigt ungefähr, wie viel das Telefon aufbewahrt, in all seinen Bereichen
  zusammen, nicht in welchem. Ein Foto wird aus dem Arbeitsspeicher gezeigt, nie entsiegelt herausgeschrieben. Die
  Fotoauswahl des Telefons übergibt eine Kopie im Cache von Erevos, die nach dem Lesen gelöscht wird, und ein hier
  aufgenommenes Foto wird nicht in den Fotos des Telefons aufbewahrt.
- **Gespeicherte** Fotos und Dateien sind außerhalb von Erevos, nicht versiegelt: Jeder mit dem Telefon kann sie
  öffnen.
- **Nur über das Relay:** Dateien brauchen seinen Dateispeicher, auch wenn der Kontakt in der Nähe ist. Ein Relay, das
  älter ist als diese Version, kann keine Dateien annehmen: Aktualisiere es.

### Mehr unter +

Unter **+** gibt es mehr zu senden als Fotos und Dateien (der Smiley am Ende des Nachrichtenfelds öffnet auch die
Sticker):

- **Sticker:** einer der 576 in Erevos eingebauten Sticker, in 24 Sätzen zu 24 (darunter **Monde**, **Hunde**,
  **Griechenland**, **Worte** und **Leckereien**), von jedem Telefon selbst gezeichnet: Nur sein Name reist, also wird
  nie etwas heruntergeladen. Ein Erevos von vor dieser Funktion zeigt stattdessen sein Emoji. Alle außer den Worten und
  den Leckereien bewegen sich ein paar Sekunden lang ein wenig, wenn sie ankommen und wenn man auf sie tippt, dann
  ruhen sie; mit eingeschalteter Bewegungsreduzierung des Telefons bleiben sie still. Die Worte erscheinen in der
  Sprache der App.
- **Als Bild:** In einem Chat eines anderen Netzes, der nur Bilder nimmt, geht ein eingebauter Sticker stattdessen als
  sein Bild: 512 mal 512 mit durchsichtigem Hintergrund, auf deinem Telefon oder Computer aus denselben Formen
  gezeichnet, in Ruhe, seine Worte in der Sprache der App. Dafür wird nichts heruntergeladen.
- **Meine**, unter den Stickern, enthält die, die du aus Fotos machst. **Neuer Sticker aus einem Foto** schneidet einen
  quadratisch zu, verkleinert ihn (512 mal 512, höchstens etwa 100 KB) und behält nur sein Bild, nichts davon, wo oder
  womit es aufgenommen wurde. Er wird versiegelt im Bereich aufbewahrt, oder in den versteckten Chats, in denen er
  gemacht wurde, und erscheint nur dort, bis zu 100 davon; halte einen gedrückt, um ihn zu löschen. Wie der Rest kommt
  er versiegelt in ein Backup und nie auf die anderen Geräte des Kontos. Er geht, wie ein Foto geht,
  Ende-zu-Ende-verschlüsselt über das Relay, als Sticker markiert, sodass er für sich ohne Blase erscheint; ein Erevos
  von vor dieser Funktion zeigt ihn als Foto. Halte einen Sticker, den dir jemand geschickt hat, gedrückt und tippe auf
  **Zu meinen Stickern hinzufügen**, um ihn zu behalten.
- **Standort** (auf Android): sendet, wo du bist, einmal, als Ort. Beim ersten Mal fragt Android, ob Erevos den Standort
  nutzen darf. Das Telefon sucht auf allen Wegen, die es hat, zugleich: per Satellit, wenn du den genauen Standort erlaubt
  hast, und über seinen Netzwerkstandort, der auf vielen Telefonen Google oder den Hersteller des Telefons fragt. Sofort
  öffnet sich ein Blatt, das sagt, dass es sucht; in Gebäuden, wo die Satelliten schwer zu sehen sind, kann das bis zu
  einer Minute dauern. Kommt nichts rechtzeitig, bietet es den Ort an, den das Telefon in den letzten zehn Minuten
  gefunden hat, und sagt, wie lange das her ist, oder es sagt, warum keiner gefunden wurde, mit **Erneut versuchen** und
  dem Bildschirm des Telefons, der das ändert. Erevos sucht nur, wenn du tippst, zeigt dir den Ort, bevor er geht, und
  folgt dir danach nicht. Die Nachricht enthält nur die Koordinaten, Ende-zu-Ende-verschlüsselt; in Erevos wird keine
  Karte geladen. **In Karten öffnen** übergibt den Ort an deine Karten-App, die ihre Karte aus dem Internet laden kann.
  Ein Erevos von vor dieser Funktion zeigt die Koordinaten als Worte.
- **Kontaktkarte:** sendet einen Kontakt aus den Kontakten deines Telefons als Karte, mit Name, Nummern und
  E-Mail-Adressen, Ende-zu-Ende-verschlüsselt. Die andere Person sieht die Karte mit **Zu Kontakten hinzufügen**; ein
  Erevos von vor dieser Funktion zeigt sie als Worte. In versteckten Chats wählst du nur unter den Kontakten, die im
  versteckten Bereich gespeichert sind, nie unter denen des Telefons.
- **Umfrage:** eine Frage mit zwei oder mehr Optionen, bis zu 12, und, mit **Mehrere Antworten**, mehr als einer zur
  Wahl. Tippe auf eine Option, um sie zu wählen, noch einmal, um sie zurückzunehmen; jede Option zeigt, wie viele sie
  gewählt haben, und wer. Stimmen reisen innerhalb der Verschlüsselung, wie Reaktionen. Ein Erevos von vor dieser
  Funktion zeigt die Frage und ihre Optionen als Worte, um in Worten zu antworten.
- [~] **Zahlungsanfrage** (aus einer anderen App, wie Fasouli): ein Betrag und wofür, als Karte. Wer gefragt wird, tippt
  **Bezahlt**, sobald bezahlt ist; dein Telefon erfährt es, und es lässt sich nicht zurücknehmen. Dann vermerkt **In
  Fasouli vermerken** auf Android sie dort als eingenommen. Erevos bewegt kein Geld und kennt keine Bank: Die Karte sagt
  nur, was erbeten wurde. Nur in Chats mit einem Kontakt, nie in versteckten. Ein älteres Erevos zeigt den Betrag als Text.

**Warum:** Ein aus dem Internet geholtes Sticker-Paket würde einem Server sagen, dass dieses Telefon {=Erevos} hat, also
sind die Sticker eingebaut und nur ihre Namen reisen. Deine eigenen sind in einem versiegelten Wert gleicher Größe für
jeden Bereich und jeden versteckten Platz aufgelistet, ob genutzt oder nicht, sodass eine Liste in Gebrauch aussieht
wie eine, die es nicht ist: 100 ist, was er fasst. Ein Ort wird nur von Android gesendet: Auf einem Computer oder in
der Web-App würde der Browser einen Dienst von außen fragen, wo er ist.

### Linkvorschauen

Ein Link in einer Nachricht ist unterstrichen und öffnet sich erst, wenn du darauf tippst und es bestätigst. Mit
eingeschalteten **Linkvorschauen**, in den Details eines Chats, geht ein Link, den du sendest, mit seiner Vorschau: Beim
Senden ruft dieses Telefon die Seite ab und nimmt ihren Titel, eine Zeile darüber und ein kleines Bild, und sie gehen
in der Nachricht mit, Ende-zu-Ende-verschlüsselt. Das empfangende Telefon ruft nichts ab: Es zeigt, was ankam. Es ist
aus, solange du es nicht einschaltest, und dann ist es für alle Chats des Bereichs an; jeder Platz versteckter Chats
hat einen eigenen Schalter, in den Details eines Chats dort.

**Warum:** Nur das Telefon des Absenders ruft die Seite ab, sodass das Telefon, das einen Link bekommt, keine Seite
aufruft, die jemand anderes gewählt hat, und dieser Seite nichts von sich zeigt, nicht einmal seine Adresse.

- **Die Seite sieht die Internetadresse dieses Telefons**, und wann, wie sie es von einem Browser sähe, aber nicht,
  für wen die Nachricht ist. Mit **Über Tor** an, bei den **Linkvorschauen**, werden die Seite und ihr Bild nur über
  Tor geholt, was auch die Tor-Einstellung des Bereichs sagt, die Seite sieht die Adresse also nicht. Das ist
  langsamer und wartet, während Tor startet; eine Seite, die dich woandershin weiterleitet oder Tor nicht hereinlässt,
  bekommt keine Vorschau. Solange alles im Bereich über Tor geht (**Alles** unter Tor), werden Vorschauen nur mit
  **Über Tor** an gemacht.
- {=Erevos} auf einem Computer macht keine, zeigt aber die, die ankommen, trotzdem.
- **Über LoRa**, das nur wenig nimmt, geht eine Nachricht lieber ohne ihre Vorschau, als zu warten, und behält hier
  keine.
- Eine Vorschau ist das, was die Seite über sich selbst sagt, ob wahr oder nicht. Ein Erevos von vor dieser Funktion
  zeigt den Link ohne sie.

### Sprach- und Videoanrufe

Tippe im Chat eines Kontakts oben auf den grünen Hörer für einen Sprachanruf oder auf die blaue Kamera daneben für
einen Videoanruf. Beim ersten Mal fragt Android, ob
Erevos das Mikrofon nutzen darf, und für Video die Kamera. Das andere Telefon klingelt, solange Erevos dort offen ist,
auf jedem Bildschirm des Bereichs: Dort tippt man auf **Annehmen** oder **Ablehnen**. Während des Anrufs kannst du das
Mikrofon stummschalten, den Lautsprecher umschalten, deine Kamera ausschalten, zwischen Front- und Rückkamera wechseln
und **Auflegen**. Jeder Anruf hinterlässt eine Zeile im Chat, etwa wie lange er dauerte, oder einen verpassten Anruf.

- **Mit Video oder nur mit Stimme annehmen:** Ein Anruf, der klingelt, bietet **Annehmen**, nur mit Stimme, und **Mit
  Video annehmen**, bei Erevos-Anrufen{+ und bei XMPP- und Matrix-Anrufen}; in einem Gruppenanruf heißen sie **Beitreten**
  und **Mit Video beitreten**. Ein Videoanruf, den du nur mit Stimme annimmst, beginnt mit ausgeschalteter Kamera.
- **Wohin der Ton geht** (Android): Ist ein Bluetooth- oder Kabel-Headset verbunden, wird **Lautsprecher** zu
  **Audioausgabe**: Es zeigt, wohin der Ton gerade geht, **Telefon**, **Lautsprecher**, **Kopfhörer** oder **Bluetooth**,
  und ein Tippen listet alle auf, ein Bluetooth-Headset mit seinem eigenen Namen, zum Auswählen. Ein Headset, das beim
  Start des Anrufs oder währenddessen verbunden wird, übernimmt den Ton, wie bei einem Telefonanruf, und das Einschalten
  der Kamera lässt ihn dort; wird es getrennt, geht der Ton zurück ans Telefon, bei einem Videoanruf an den Lautsprecher.
- **Die Kamera später einschalten:** **Kamera an** auf dem Anrufbildschirm geht, wenn die App der anderen Seite einen
  Anruf während des Gesprächs ändern kann; ein Gruppenanruf bleibt, wie du beigetreten bist.
- **Video zu einem Sprachanruf hinzufügen:** In einem Erevos-Sprachanruf schaltet **Video dazu** deine Kamera ein,
  sobald die andere Person Ja sagt; sagt sie Nein, bleibt der Anruf ein Sprachanruf.
- **Dein eigenes Bild:** In einem Videoanruf füllt deine Kamera den Bildschirm, bis das Bild der anderen Seite kommt;
  dann wandert es in ein kleines Fenster in der oberen Ecke, auf beiden Telefonen, sodass ihr jeweils die andere
  Person und euch selbst seht.
- **Kamera wechseln:** **Wechseln** geht zur nächsten Kamera. Auf einem Computer erscheint es nur, wenn es mehr als eine
  Kamera gibt.
- **Wie der Anruf verbunden ist:** Halte den Anrufbildschirm kurz gedrückt, um zu sehen, wie viel vom Ton der anderen
  Seite verloren ging oder ergänzt werden musste, was als Lücken zu hören ist, wie oft das geschah, die Zeit hin und
  zurück, den Weg des Anrufs und wie lange es bis zum Klingeln und zur Verbindung dauerte. Ein Tippen schließt es. Es wird
  nur auf deinem Telefon gemessen und hilft herauszufinden, warum ein Anruf schlecht klingt.

**Ein Anruf bei einem Telefon, das ihn langsam annimmt:** Nimmt ihr Telefon deinen Anruf spät entgegen, zum Beispiel
weil es über Tor liest, steht **Ruft an…** bis zu eineinviertel Minuten da, und sobald es dort klingelt, klingelt es
von da an 45 Sekunden lang, damit ein spät angekommener Anruf nicht auf ihrem Telefon klingelt und sofort wieder
aufhört. Ihr Telefon liest einen Anruf außerdem vor allem, was es zu senden hat, und wartet nach einem Netzwechsel
(WLAN zu mobilen Daten) sofort wieder auf Anrufe.

**Ein normaler Anruf im Mobilfunknetz:** Wenn mit einem Kontakt seine Telefonnummer verknüpft ist oder er mit einem
deiner Kontakte mit Nummer verbunden ist (**Mit einem meiner Kontakte verknüpfen** in seinem Chat, eine Mobilnummer
zuerst), öffnet das orange Tastenfeld oben in seinem Chat, vor der Kamera, ein Tastenfeld mit dieser Nummer
eingegeben{~, und ebenso das oben in einer SMS-Unterhaltung}. Es ist {~das **Telefon** von Erevos, wenn Erevos die
Telefon-App ist, sonst }das eigene des Telefons: Tippe dort auf die Anruftaste. Ein solcher
Anruf geht über das Netz der Telefongesellschaft und ist nicht verschlüsselt{~, wie eine normale SMS es nicht ist}.
Versteckte Chats und Computer haben das nicht.

- **Ende-zu-Ende-verschlüsselt:** Der Anruf wird mit Nachrichten über das Relay aufgebaut, verschlüsselt wie der Rest.
  Diese tragen den Schlüssel, der den Anruf selbst verschlüsselt, sodass niemand dazwischen mithören kann, nicht einmal
  das Anruf-Relay unten.
- **Über das Anruf-Relay:** Ein mit dem Bausatz in \`deploy/relay\` eingerichtetes Relay hat ein Anruf-Relay daneben.
  Der Anruf geht darüber, sodass keines der Telefone die IP-Adresse des anderen erfährt. Über WLAN oder mobile Daten,
  überall.
- **Ohne Anruf-Relay** (zum Beispiel ein Relay auf deinem eigenen Computer) fragt Erevos zuerst: Der Anruf geht dann
  direkt zwischen den Telefonen, funktioniert nur im selben WLAN, und jedes Telefon sieht dort die Adresse des
  anderen.
- **Ohne Internet:** Im selben WLAN, im Hotspot eines Telefons oder in dem WLAN, das zwei Telefone aufbauen (Wi-Fi
  Direct), mit einem offenen Bereich auf beiden, braucht ein Anruf überhaupt kein Relay: Er wird über die Verbindung in
  der Nähe aufgebaut und geht direkt zwischen den Telefonen (oder Computern). Dasselbe gilt für Gruppennachrichten und
  Gruppenanrufe.
- **Im Hintergrund (Android):** Solange ein Bereich offen ist, läuft Erevos weiter, wenn du es verlässt, mit der
  Home-Taste, mit „Zurück“ auf seinem ersten Bildschirm oder indem du es aus den letzten Apps wegwischst, mit einer
  stillen Benachrichtigung, „Erevos – Ready for calls and messages“, die nicht auf dem Sperrbildschirm erscheint. Es
  wartet beim Relay und an den Verbindungen zu Telefonen in der Nähe, damit Nachrichten ankommen: Eine Benachrichtigung
  sagt nur „New message“ oder wie viele kamen, und auf einem gesperrten Telefon nur „Erevos“. Eine Nachrichtenanfrage,
  von jemandem, der nur deinen Kontaktlink hat, macht dieselbe Benachrichtigung und denselben Ton und zählt auf dem
  Symbol, wie jede Nachricht. Ein Anruf klingelt mit dem Klingelton des Telefons und einer Benachrichtigung, „Incoming
  call“ (oder „Incoming video call“) – „Open Erevos to answer“, ohne Namen, auch über dem Sperrbildschirm und dem
  Bildschirmschoner, und der Bildschirm wacht auf. Tippe darauf, um anzunehmen. Mit eingeschalteter Passwortsperre
  erscheint ein klingelnder Anruf vor dem Passwort, und Erevos sperrt sich, sobald er endet. Gesperrt läuft der Bereich
  hinter dem Passwortbildschirm weiter, also kommen Nachrichten und Anrufe trotzdem, und ein Anruf erscheint über dem
  Passwortbildschirm. Nur die Chats und Gruppen dieses Bereichs kommen so an, und versteckte Chats mit eingeschaltetem
  **Empfangen, wenn geschlossen**; andere versteckte Chats sagen nur, dass eine Nachricht kam, oder klingeln ohne Namen,
  wenn du es erlaubst (siehe „Versteckte Chats“). Stell es unter **Einstellungen** → **Benachrichtigungen** → **Im
  Hintergrund** ein: **Empfangen und klingeln** (die Voreinstellung) oder **Nur, solange Erevos sichtbar ist**, und
  **Neue Nachrichten melden** (die Voreinstellung) oder **Keine Benachrichtigung**, was auch gilt, solange Erevos
  sichtbar ist. Dort auch, wenn Android danach fragt, **Trotz Akku-Sparen weiterlaufen** und **Anrufe über dem
  Sperrbildschirm zeigen**. Darunter legen **Nur die Verschwendung** (Standard), **Und Telefone in der Nähe** und **Und
  Schlaf** fest, wie viel Akku es im Hintergrund spart: Die zweite schaltet auch die Funkverbindungen zu Telefonen in
  der Nähe aus, solange Erevos im Hintergrund ist, die dritte lässt auch das Telefon schlafen, sodass Erevos etwa einmal
  pro Minute am Relay nachschaut und eine Nachricht oder ein Anruf ein bis zwei Minuten zu spät kommen kann.
- **Und leichter Schlaf:** eine vierte Stufe dort, zwischen **Und Telefone in der Nähe** und **Und Schlaf**. Das Telefon darf schlafen, aber Erevos lässt sein Warten am Relay offen, sodass das, was ankommt, das Telefon weckt und eine Nachricht oder ein Anruf weiterhin sofort kommt, wo Netz und Android es zulassen; Erevos schaut außerdem alle paar Minuten von selbst nach. Sie ist neu und noch nicht auf vielen Telefonen erprobt: Kommen Nachrichten damit verspätet, wähle eine andere.
- **Die Zahl auf dem Symbol:** Mit **Neue Nachrichten melden** bleibt die Meldung, wenn du Erevos mit ungelesenen
  Nachrichten in den Chats und Gruppen des offenen Bereichs verlässt, ohne Ton stehen und sagt, wie viele es sind, mit
  denen, die sie danach meldet; sie geht, solange Erevos sichtbar ist, und kommt wieder, wenn du es verlässt, bis du
  sie gelesen hast. Nachrichten eines stummen Chats zählen nicht (siehe „Benachrichtigungen für diesen Chat“), die
  eines versteckten Chats beim Verlassen auch nicht. Der Launcher von Android zeigt sie am Symbol von Erevos, als Zahl
  oder auf manchen Telefonen, etwa Pixels, als Punkt. **Einstellungen** → **Benachrichtigungen** → **Zahl auf dem
  Symbol** schaltet das aus: Dann meldet die Meldung nur, was gekommen ist, seit du Erevos zuletzt offen hattest, und
  die Zahl des Launchers geht mit ihr. Eine Nachricht, die für alle gelöscht wurde, bevor du sie gelesen hast, oder
  die auf einem verknüpften Computer gelesen wurde, zählt nicht mehr.

  **Warum:** Auf Android kann nur eine Meldung eine Zahl auf das Symbol einer App setzen, also bleibt die Meldung,
  solange Nachrichten warten; sie sagt nicht mehr als wie viele, wie immer schon.
- **Ein Bereich, der geschlossen ist:** Er empfängt nichts, da sein Schlüssel nur im Arbeitsspeicher ist, solange er
  offen ist: Seine Nachrichten warten bei seinem Relay und kommen, wenn du ihn öffnest. Außer du wählst in diesem
  Bereich **Auch, wenn ein anderer Bereich offen ist** unter **Einstellungen** → **Benachrichtigungen** → **Im
  Hintergrund** (die Voreinstellung ist **Dieser Bereich nur, wenn offen**): Dann sagt er, solange ein anderer Bereich
  offen ist und empfängt, nur „New message“ oder wie viele kamen, mit derselben Benachrichtigung wie jener Bereich, nie
  welcher Bereich, und seine versteckten Chats sagen nichts. Was andere Telefone zu seinem Relay mitgenommen haben,
  zählt als Nachricht, auch Löschungen, und eine Nachricht, die ohne Ton an ihn gesendet wurde, meldet sich wie
  gewohnt (siehe **Ohne Ton senden**). Dafür bewahrt das Telefon die Adressen seiner
  Warteschlangen bei seinem Relay außerhalb seines Passworts auf, darunter die, in die jeder seiner Kontakte schreibt,
  für bis zu 64 Kontakte, nie seine Schlüssel, wer seine Kontakte sind, oder seine Nachrichten, und fragt das Relay nur,
  wie viele kamen, nie nach ihnen selbst: Sie bleiben dort, bis sich der Bereich öffnet. Ein Bereich, der über Tor geht
  (**Nachrichten** oder **Alles**, unter **Was über Tor geht**), wird nur über Tor abgefragt: Solange der
  offene Bereich Tor aus hat oder sein Tor gerade startet oder eben gescheitert ist, sagt der geschlossene Bereich
  nichts, und was kam, wird gemeldet, sobald Tor dort bereit ist.

  **Warum:** Ein Bereich hinter einem zweiten Passwort darf nicht zeigen, dass es ihn gibt, also ist das aus, solange du
  es nicht einschaltest, und dann sagt er nicht mehr, als der offene Bereich sagen würde. Direkt vom Telefon aus
  abgefragt, während ein anderer Bereich offen ist, könnten sein Relay oder jemand, der das Netz beobachtet, die beiden
  Bereiche über die Internetadresse des Telefons miteinander verbinden. Da jeder Kontakt in eine
  eigene Warteschlange schreibt, muss der Bereich auch nach jeder davon fragen, sonst würden ihre Nachrichten nichts
  sagen. Der Preis ist, dass sein Relay erkennen kann, dass die beiden Bereiche auf einem Telefon sind, und jemand, der
  das Telefon mit Werkzeugen untersucht, finden kann, dass ein zweiter Bereich dort Adressen aufbewahrt, und wie viele
  Kontakte er hat.
- **Ein Punkt für die anderen Bereiche:** In einem Bereich mit **Auch, wenn ein anderer Bereich offen ist** zeigt
  **Punkt in den anderen Bereichen**, darunter (Standard ist **Kein Punkt**), auch einen kleinen Punkt auf dem Schloss
  über den Chats des offenen Bereichs, sobald eine Nachricht zu diesem kam, während er geschlossen war, bis du ihn
  öffnest: nie wie viele, noch welcher Bereich. Es wirkt, wo die Mitteilung wirkt: auf Android, solange der offene
  Bereich **Empfangen und klingeln** und **Neue Nachrichten melden** an hat. Dafür behält das Telefon, neben den
  Adressen oben, nur, ob eine Nachricht kam. Wer die Chats des offenen Bereichs sieht, sieht auch den Punkt und kann
  vermuten, dass es einen weiteren Bereich gibt.
- **Wenn das Telefon eingeschaltet wird:** Nachdem das Telefon gestartet ist, läuft Erevos nicht, bis du es öffnest.
  Mit **Starten, wenn das Telefon eingeschaltet wird** unter **Einstellungen** → **Benachrichtigungen** → **Im
  Hintergrund** (die Voreinstellung ist **Warten, bis ich es öffne**) startet es von selbst, nachdem das Telefon
  eingeschaltet oder Erevos aktualisiert wurde, ohne dass ein Bereich offen ist: Kein Bereich kann sich ohne sein
  Passwort öffnen, da Erevos keinen Schlüssel auf dem Telefon aufbewahrt. Dann sagen die Bereiche mit **Auch, wenn ein
  anderer Bereich offen ist** schon „New message“ oder wie viele kamen, nie welcher Bereich, auch nicht von wem oder
  was, und eine stille Benachrichtigung sagt „Locked“. Anrufe klingeln nicht, und nichts anderes kommt, bis du einen
  Bereich öffnest; Bereiche, die über Tor gehen, sagen bis dahin nichts. Gibt es keinen solchen Bereich, oder mit
  **Keine Benachrichtigung**, sagt nur eine stille Benachrichtigung,
  dass es gesperrt ist, und ein Tippen darauf öffnet Erevos. Nur auf Android.

  **Warum:** Nach einem Neustart konnte Erevos dir nicht sagen, dass Nachrichten warten, bis du es zufällig öffnetest.
  Ohne dein Passwort kann es sie trotzdem nicht lesen, also sagt es nicht mehr, als ein geschlossener Bereich sagt.
- **Wo es nicht klingeln kann:** von Android beendet (oder vom Energiesparen des Telefons oder von der eigenen
  Einstellung des Herstellers), nach einem Neustart des Telefons, bis du Erevos und den Bereich einmal öffnest, in
  einem anderen Bereich (er sagt nur, dass eine Nachricht kam, wenn du es erlaubst, wie oben), oder auf einem Computer
  oder in der Web-App,
  solange sie geschlossen sind. Ein Anruf erscheint dort als verpasster Anruf, sobald Erevos öffnet. Wenn Android
  Erevos beim Empfangen schließt und wieder startet, wie es das meist tut, sagt es eine stille Benachrichtigung: Öffne
  Erevos und den Bereich, um wieder zu empfangen. Nach **Beenden erzwingen**, mit einer Akkunutzung, die auf
  Eingeschränkt steht, oder wenn die eigene Einstellung des Herstellers es schließt, startet Android nichts wieder,
  also sagt es keine Benachrichtigung: Die Benachrichtigung „Erevos“ verschwindet einfach, und nichts klingelt, bis du
  Erevos öffnest. **Berechtigungen** (unten) sagt vorher, ob eines davon eingestellt ist. Ebenso sagt es eine
  Benachrichtigung, „Locked“, wenn sich der Bereich, der empfangen hat, schließt (etwa nach dem Wiederherstellen
  eines Backups) und Erevos den Bildschirm mit der Passwortabfrage verlässt. Eine Nachrichtenanfrage kann dich erst
  anrufen, wenn du sie annimmst.
- **Berechtigungen (Android):** **Einstellungen** → **Allgemein** → **Berechtigungen** zeigt, was Android Erevos für
  Anrufe und Nachrichten im Hintergrund erlaubt (Benachrichtigungen, die Anruf-Benachrichtigung und dass sie aufpoppt,
  die Nachrichten-Benachrichtigung, mit ihren Benachrichtigungen „Messages without sound“ und „Messages with a chat's
  own sound“, die auch die Zahl auf dem Symbol halten, Anrufe über dem Sperrbildschirm, Laufen im Akku-Sparmodus,
  Laufen im Hintergrund mit einer Akkunutzung, die nicht auf Eingeschränkt steht, kein Pausieren bei Nichtnutzung,
  mobile Daten im Hintergrund, das Mikrofon) und für anderes (der Ton für neue Nachrichten, Benachrichtigungen auf dem
  Sperrbildschirm, Anrufe trotz Nicht stören, Kamera, Telefone in der Nähe, Kontakte, genaue Zeiten für{~ später
  gesendete SMS und} Erinnerungen, die Benachrichtigung, wenn eine Erinnerung kam), jeweils mit dem Grund und einer
  Taste, die Androids eigene Frage oder Einstellung öffnet. Es sagt auch, wenn das Telefon auf lautlos oder Vibration
  steht, wenn der Energiesparmodus an ist und wenn Nicht stören an ist, während Erevos-Anrufe nicht
  durchgelassen werden. Auf Telefonen von Huawei, Honor, Xiaomi, OPPO, realme, OnePlus, vivo, Samsung und ASUS sagt es
  auch, wo die eigene Einstellung des Herstellers ist, die Erevos nicht lesen kann: Tippe auf **Erledigt**, sobald sie
  gesetzt ist. Nach jeder neuen Version, und beim ersten Mal, öffnet es sich von selbst, wenn Anrufe oder Nachrichten
  etwas brauchen. In der Web-App zeigt es, was der Browser erlaubt, siehe [Auf einem iPhone](#iphone).
- **Ein Anruf nach dem anderen.** Ein Anruf geht weiter, während du zwischen Bildschirmen des Bereichs wechselst. Er
  endet, wenn sich der Bereich schließt, und ein Anruf in versteckten Chats, wenn diese sich schließen, was sie während
  eines Anrufs nicht tun. Erevos aus den letzten Apps wegzuwischen beendet einen Anruf ebenfalls.
- Anrufe gehen nicht über ein Telefon in der Nähe oder Bluetooth. Dort macht **Talkie** unter **+** den Chat zu einem
  Walkie-Talkie, und **Talkie ist an** erscheint über dem Feld: Halte das Walkie-Talkie am Ende der Leiste gedrückt,
  während du sprichst, lass los, und es spielt auf dem anderen Telefon ab, während es ankommt, wenn der Chat mit dir
  dort offen ist; wenn nicht, wartet es als Sprachnachricht. Es ist eine kleinere Sprachnachricht (etwa 3 KB pro
  Sekunde), also geht es überall dorthin, wohin eine Nachricht geht, Bluetooth eingeschlossen.

**Warum:** Die Schlüssel, die die Nachrichten eines Bereichs öffnen, sind nur im Arbeitsspeicher, solange er offen ist,
und sonst hinter seinem Passwort versiegelt. Nach einem Neustart des Telefons lässt sich also nichts lesen und nichts
klingelt, bis du Erevos und den Bereich einmal öffnest; und versteckte Chats, deren Schlüssel nur im Arbeitsspeicher
ist, solange sie offen sind, außer **Empfangen, wenn geschlossen** behält ihn beim Bereich, sagen sonst nur, dass eine
Nachricht kam, oder klingeln ohne Namen, wenn du es erlaubst.

> Die Relay-Einstellungen, deine Warteschlange, deine Kontakte und ihre Namen, die Schlüssel deiner Unterhaltungen und
> die Nachrichten werden in diesem Bereich aufbewahrt, versiegelt. Der Verlauf hat keine Grenze: Er wird in
> versiegelten Seiten gleicher Größe aufbewahrt, vermischt mit den Seiten der anderen Bereiche und versteckten Chats,
> sodass nur sichtbar ist, wie viel sie alle zusammen belegen, nicht wem sie gehören. Der Rest wird für jeden Bereich
> und jede Gruppe versteckter Chats in gleicher Größe aufbewahrt, ob genutzt oder nicht; was größer ist, kommt in
> Seiten wie die des Verlaufs, zwischen sie. Gelöschte Nachrichten können eine Weile im Speicher des Telefons bleiben,
> versiegelt wie der Rest, bis etwas darüber geschrieben wird. In der Nähe gesendete oder empfangene Nachrichten werden
> genauso aufbewahrt.

## Gruppenchats {#groups}

Im Menü des Startbildschirms **Neue Gruppe**: Gib ihr einen Namen, hake die Kontakte an, die gefragt werden sollen, und
tippe auf **Gruppe erstellen**. Du bist ihr Admin. Das Telefon jedes Kontakts antwortet von selbst, wenn {=Erevos} dort
das nächste Mal offen ist, und tritt bei: Die Gruppe erscheint dann auf seinem Startbildschirm, mit einem Hinweis, wer
ihn hinzugefügt hat. Ein Telefon tritt nur einer Gruppe bei, deren Admin der Kontakt ist, der es gefragt hat, und ein
Admin lässt einen Kontakt nur als sich selbst herein, nie als jemand anderen. Gruppen gehen über das Relay, also muss
es eingestellt sein.

**Warum:** Nur das Telefon des Admins ändert die Gruppe (wer darin ist, ihren Namen), sodass kein Server die Änderungen
ordnen muss: Jedes Telefon übernimmt sie von diesem einen. Deshalb verlässt ein Mitglied die Gruppe, indem es den Admin
bittet, und nur der Admin fügt Mitglieder hinzu oder nimmt sie heraus.

- **Wer gefragt werden kann:** Kontakte, die du angenommen hast, in diesem Bereich. Mitglieder, die nicht gegenseitig
  Kontakte sind, reden trotzdem in der Gruppe und erscheinen mit dem Anfang ihres Schlüssels.
- **Als Kontakt hinzufügen:** In der Mitgliederliste (**⋯**) fragt **Als Kontakt hinzufügen** unter einem Mitglied,
  das nicht dein Kontakt ist, in einer Nachricht, die nur es bekommt, nach seinem Kontaktlink und gibt ihm deinen. Auf
  seinem Telefon erscheint die Frage einmal, oben in der Gruppe, und es tippt auf **Senden** oder **Nicht senden**;
  tippt es auf **Nicht senden**, erfährst du nichts. Sobald es ihn sendet, seid ihr gegenseitig Kontakte, mit einem
  eigenen Chat, und **Name** gibt ihm einen Namen, wie unter jedem Kontakt, der noch keinen hat. Keine Antwort kann
  bedeuten, dass es die Gruppe noch nicht geöffnet hat, abgelehnt hat, ein älteres {=Erevos} hat oder dich noch als
  Kontakt hat, was ihm nichts zeigt; nach einer Woche kannst du erneut fragen. Sobald ihr gegenseitig Kontakte seid, in
  irgendeiner Gruppe oder über einen Kontaktlink, verschwindet, was in deinen anderen Gruppen gefragt wurde, und seine
  Frage erscheint nicht mehr. Ein aus der Gruppe genommenes Mitglied fragt nichts mehr. Wenn zwei Mitglieder denselben
  Schlüssel zeigen, ist eines davon nicht, wer es vorgibt zu sein, und kein Kontaktlink geht an eines davon oder wird
  von einem davon angenommen. Nicht in öffentlichen Gruppen. Fragen ist Sache des Telefons, das das Konto hat;
  **Name** funktioniert auch auf einem verknüpften Gerät.
- **Ende-zu-Ende-verschlüsselt für die Gruppe:** MLS (RFC 9420). Jede Nachricht wird einmal für die Gruppe
  verschlüsselt und dann für jedes Mitglied noch einmal versiegelt, sodass, was in der Warteschlange jedes Mitglieds
  ankommt, nichts gleicht, was die anderen bekommen, und kein Relay erkennen kann, wer in einer Gruppe ist. Sie geht
  direkt in die Warteschlange jedes Mitglieds, über dein Relay. Jede Woche werden die Schlüssel jedes Telefons in der
  Gruppe erneuert, die des Admins von selbst und die jedes Mitglieds über den Admin, sodass einmal von einem Telefon
  genommene Schlüssel die Gruppe nicht mehr lesen.
- **Mitglieder:** Tippe oben auf den Namen der Gruppe oder auf **⋯** daneben. Der Admin fügt Kontakte hinzu, nimmt
  Mitglieder heraus und benennt die Gruppe um. Ein herausgenommenes Mitglied liest ab dann nichts mehr, was die Gruppe
  sagt, und die Gruppe bleibt auf seinem Telefon, nur lesbar, bis es sie löscht.
- **Threads:** Halte eine Nachricht gedrückt und wähle **Im Thread antworten**, um ihr in einem Thread zu antworten,
  oder tippe unter einer Nachricht auf **n Antworten im Thread**, um ihn zu öffnen. Der Thread erscheint allein, und was
  du dort sendest, antwortet darauf.
- **Beschreibung:** Der Admin der Gruppe schreibt sie im Mitgliederblatt unter **Beschreibung** und tippt auf
  **Speichern**. Jedes Mitglied liest sie, auch wer später beitritt. Eine Änderung von jemand anderem wird ignoriert.
- **Verlassen:** **Gruppe verlassen** bittet den Admin, dessen Telefon dich herausnimmt, wenn {=Erevos} dort das nächste
  Mal offen ist. Die eigene Taste des Admins ist **Gruppe schließen**: Sie nimmt jedes Mitglied heraus.
- **Ein Admin:** Eine private Gruppe hat einen Admin, den, der sie gemacht hat. **Warum:** Die Änderungen der Gruppe
  müssen in einer Reihenfolge kommen, und bei MLS bringt kein Server sie in eine Reihenfolge, sodass zwei Admins die
  Gruppe gleichzeitig ändern und in zwei teilen könnten. Ein Erevos von vor dieser Funktion nimmt Änderungen nur von dem
  an, der die Gruppe gemacht hat.
- **Gruppenanrufe:** Der grüne Hörer oben in der Gruppe startet darin einen Sprachanruf und die blaue Kamera daneben
  einen Videoanruf (auch **Videoanruf** unter **⋯**). Während einer läuft, erscheint nur seine eigene Taste, um
  beizutreten. Er klingelt auf den Telefonen der Mitglieder, auf denen Erevos offen ist, und wer annimmt, ist dabei.
  Ein laufender Anruf erscheint oben in der Gruppe, um später beizutreten. Bis zu acht Personen: Jedes Telefon
  verbindet sich mit jedem anderen, über das Anruf-Relay, sodass kein Telefon die IP-Adresse eines anderen sieht; ohne
  Anruf-Relay nur im selben WLAN. Ende-zu-Ende-verschlüsselt zwischen je zwei Telefonen, ihre Schlüssel in der
  Verschlüsselung der Gruppe gesendet. In einem Videoanruf sendet jedes Telefon sein Bild an jedes andere, sodass Bilder
  für bis zu vier Personen erscheinen; bei mehr pausieren sie und der Ton läuft weiter, bis ein Server für größere
  Videoanrufe eingerichtet ist. Ein Anruf, der klingelt, bietet **Beitreten** und **Mit Video beitreten**.
- **Fotos, Dateien und Sprachnachrichten:** **+** neben dem Feld sendet ein Foto oder eine Datei, wie im Chat eines
  Kontakts, mit derselben **Fotoqualität**; halte das Mikrofon gedrückt, während du sprichst, und lass los, um zu
  senden. Jedes wird mit einem eigenen Schlüssel verschlüsselt und einmal auf dein Relay gelegt, und nur wo es liegt und
  sein Schlüssel gehen an die Gruppe, in ihrer Verschlüsselung. Das Telefon jedes Mitglieds holt es von dort über sein
  eigenes Relay: bis 16 MB von selbst, solange die Gruppe offen ist, ein größeres nach einem Tippen. Tippe auf ein
  Foto, um es ganz zu sehen, auf eine Datei, um sie zu speichern, auf eine Sprachnachricht, um sie abzuspielen.
  - **Das Relay bewahrt es 14 Tage auf,** verschlüsselt, da es nicht wissen kann, wann jedes Mitglied es geholt hat.
  - **Nur über das Relay,** auch wenn Mitglieder in der Nähe sind.
  - **Ein Mitglied, das später beitritt,** bekommt nicht, was vorher kam, wie bei den Worten. Ein Mitglied, dessen
    {=Erevos} von vor dieser Version ist, sieht nichts davon.
  - **Auf dem Telefon** wird jedes in seinen Stücken aufbewahrt, versiegelt, wie im Chat eines Kontakts. Die Gruppe
    hier zu löschen, löscht sie.
- **Das Menü einer Nachricht,** gedrückt gehalten, wie im Chat eines Kontakts: die Reaktionen, **Antworten**,
  **Weiterleiten**, **Mit Stern markieren**, **Anheften**, **Kopieren**, **Bearbeiten** und **Löschen**. Jedes
  Mitglied hat eine Reaktion pro Nachricht, und eine Umfrage zeigt, wer was gewählt hat. Eine Anheftung gilt für alle,
  und jedes Mitglied kann sie mit **Loslösen** lösen. **Bearbeiten** gibt deinen eigenen Worten neue für jedes
  Mitglied, bis zu einem Tag nach dem Senden, markiert mit **Bearbeitet**. **Löschen** fragt **Dieses Telefon** oder,
  für deine eigene Nachricht, **Für alle**: Das Erevos der Mitglieder löscht sie auch, und ein Foto, eine Datei oder
  eine Sprachnachricht von dir verlässt dein Relay sofort statt nach 14 Tagen. **+** hat auch hier **Sticker**,
  **Standort** und **Umfrage**. Links sind unterstrichen und werden vor dem Öffnen bestätigt, und **Linkvorschauen**
  gehen, wenn eingeschaltet, mit deinen mit. In der Mitgliederliste, oder auf dem eigenen Bildschirm einer
  öffentlichen Gruppe, durchsucht **In diesem Chat suchen** die Nachrichten der Gruppe, und **Chat exportieren**
  schreibt sie heraus, und **Medien, Links und Dateien** listet die Fotos, Videos, Sprachnachrichten, Musik, Dateien und Links der Gruppe auf, jede Art für sich, wie im Chat eines Kontakts (siehe oben), jedes mit Sprung zu seiner Nachricht; **Markierte Nachrichten** und die Suche des Startbildschirms schließen die Gruppen mit ein. Ein
  Mitglied, dessen {=Erevos} von vor dieser Version ist, sieht die Worte, das Emoji eines Stickers, die Koordinaten eines
  Orts und die Frage einer Umfrage, und nichts von Reaktionen, Anheftungen, Bearbeitungen und Löschen. **Auswählen**
  wählt mehrere Nachrichten, um sie zusammen zu kopieren, weiterzuleiten oder zu löschen, eine Umfrage von dir hat
  **Umfrage beenden**, und **+** hat auch **Kontaktkarte**. **Für alle** wird beim Löschen nur angeboten, wenn alles,
  was du gewählt hast, von dir ist.
- **Ein Mitglied nennen:** Tippe **@** ins Nachrichtenfeld, und die Mitglieder, deren Namen mit dem Folgenden beginnen,
  erscheinen darüber: Tippe auf eines, um den ganzen Namen einzusetzen. Ein so genanntes Mitglied erfährt von der
  Nachricht, auch wenn es die Gruppe stummgeschaltet hat. Nur ganze Namen zählen, daher nennt **@Anna** nicht Anna
  Maria. Ein Erevos von vorher zeigt nur die Worte und meldet, wie es die Einstellungen der Gruppe sagen.
- **Noch nicht:** Tippen und verschwindende Nachrichten in Gruppen, und Gruppen über ein Telefon in der Nähe.

## Öffentliche Gruppen {#public-groups}

Eine öffentliche Gruppe ist eine, um deren Beitritt jeder mit ihrem Link oder ihrem QR-Code bitten kann: für einen
Verein, eine Straße oder eine Klasse, wo nicht jeder dein Kontakt ist. Im Menü des Startbildschirms
**Öffentliche Gruppen**: Gib ihr einen Namen und den Namen, unter dem du darin auftrittst, wähle, wer hereinkommt, und
tippe auf **Öffentliche Gruppe erstellen**. Sie gehört dir. Ihre Nachrichten sind mit MLS Ende-zu-Ende-verschlüsselt
und gehen an jedes Mitglied wie in jeder Gruppe, und kein Relay erfährt, wer darin ist.

- **Der Link:** Tippe oben auf den Namen der Gruppe für ihren Link und QR-Code, und auf **Link teilen**. Wer ihn
  öffnet oder den Code mit der Kamera des Telefons scannt, wählt den Namen, den die Gruppe sieht, und tippt auf
  **Beitritt anfragen**. Ein Link lässt sich auch unter **Per Link beitreten** einfügen. Jedes Mitglied hat den Link
  und kann ihn weitergeben.
- **Beschreibung:** Der Inhaber oder ein Admin schreibt sie auf dem eigenen Bildschirm der Gruppe unter **Beschreibung**
  und tippt auf **Speichern**; alle in der Gruppe lesen sie.
- **Beitreten, während du weg bist:** Die Anfrage wartet auf deinem Relay, so versiegelt, dass nur dein Telefon sie
  öffnet, bis Erevos auf deinem Telefon offen ist: Es schaut alle paar Sekunden nach, solange Erevos sichtbar ist, und
  etwa jede Minute im Hintergrund. Dann lässt es die Person herein, und die Gruppe erscheint auf ihrem Telefon.
- **Wer hereinkommt:** **Jeder mit dem Link** oder **Ein Admin lässt sie herein**: Dann wartet, wer fragt, unter
  **Beitrittsanfragen**, bis du oder ein Admin auf **Hereinlassen** oder **Abweisen** tippt. Dein Telefon lässt die
  Person trotzdem herein, sobald es davon hört.
- **Admins:** Tippe unter **Mitglieder** neben einem Mitglied auf **Moderieren**, dann auf **Zum Admin machen**.
  Admins schalten Mitglieder stumm, nehmen sie heraus und sperren sie, lassen herein, wer fragt, und löschen eine
  Nachricht für alle; nur du moderierst Admins, und niemand moderiert dich.
  - **Stumm:** Das Telefon des Mitglieds sendet nichts in die Gruppe, und kein Telefon zeigt, was seines trotzdem
    sendet. **Schreiben lassen** macht es rückgängig.
  - **Entfernen:** Es liest ab dann nichts mehr, was die Gruppe sagt, und kann über den Link erneut um Beitritt
    bitten.
  - **Sperren:** herausgenommen, und was sein Telefon danach fragt, wird abgewiesen. **Sperre aufheben**, unter
    **Gesperrt**, macht es rückgängig. Eine Sperre hält dasselbe Telefon auf, nicht jemanden, der mit einer neuen
    Relay-Warteschlange zurückkommt: Wähle dagegen **Ein Admin lässt sie herein** oder ändere den Link.
  - **Für alle löschen:** Die neuesten Nachrichten sind unten aufgelistet; **Löschen** entfernt eine vom Telefon jedes
    Mitglieds. Wer sie schon gelesen hat, kann eine Kopie behalten haben.
- **Link ändern:** Der bisher geteilte Link und QR-Code funktionieren sofort nicht mehr, und jedes Mitglied bekommt
  den neuen. Anfragen, die noch am alten warten, gehen verloren.
- **Gruppe übergeben:** unter **Moderieren** eines Mitglieds. Sein Telefon besitzt sie ab dann und lässt Leute herein,
  also ändert sich der Link zu einem auf seinem Relay; du bleibst Admin. Geht dein Telefon verloren, bevor du sie
  übergibst, kann niemand mehr jemanden hereinlassen, auch wenn die Gruppe für die Mitglieder weiterläuft.
- **Gruppe schließen** nimmt jedes Mitglied heraus. **Gruppe verlassen** eines Mitglieds bittet dein Telefon, es
  herauszunehmen.
- **Eine Wegwerfgruppe,** für einen Anlass: Wähle, bevor du sie erstellst, unter **Endet** **Nach einem Tag**, **Nach
  3 Tagen** oder **Nach 7 Tagen**. Ist ihre Zeit um, löscht das Erevos jedes Mitglieds sie, jedes nach der Uhr seines
  eigenen Telefons, mit ihren Nachrichten, Fotos und Dateien, sobald es das nächste Mal offen ist, und ihr Link
  funktioniert nicht mehr. Wann sie endet, wird beim Erstellen der Gruppe festgelegt und ändert sich nie. Der eigene
  Bildschirm der Gruppe sagt, wann sie endet. Ein Mitglied mit einem älteren {=Erevos} behält sie, und bis dahin kann
  jeder eine Kopie oder ein Bildschirmfoto behalten haben.
- **Bis zu 100 Mitglieder,** da die ganze Gruppe in die eine Nachricht passen muss, die jemanden hereinlässt.
- **Jedes Telefon in einer öffentlichen Gruppe braucht diese Version von {=Erevos}.** Aus Kontakten gemachte Gruppen
  funktionieren wie bisher.

**Warum:** Nur das Telefon des Inhabers ändert die Gruppe und lässt Leute herein, sodass Änderungen nie miteinander
konkurrieren und kein Server sie ordnen muss. Deshalb läuft die Gruppe ohne es weiter, aber niemand Neues kommt
herein: Übergib sie, bevor du das Telefon wechselst.

### Was eine öffentliche Gruppe preisgibt

> Jeder mit dem Link kann die Gruppe ab dem Moment lesen, in dem er hereingelassen wird, nie, was vorher gesagt wurde,
> und der Link kann weitergegeben werden: Ändere ihn, um das zu beenden.

- **Der Link** zeigt jedem, der ihn sieht, den Namen der Gruppe und die Adresse deines Relays.
- **Jedes Mitglied sieht von jedem Mitglied** den gewählten Namen, einen nur für diese Gruppe gemachten Schlüssel, die
  Adresse seines Relays und die Absender-ID seiner Warteschlange. Der Schlüssel sagt nichts darüber, wer es in seinen
  Chats ist, noch in welchen anderen Gruppen es ist. Die Warteschlange ist eine, an der nur seine öffentlichen Gruppen
  lesen, nicht die aus seinem Kontaktlink, dieselbe in jeder seiner öffentlichen Gruppen (ein Erevos vor 2.0.0 nennt
  die aus seinem Kontaktlink).
- **Namen sind gewählt, nicht bewiesen:** Jeder kann sich beliebig nennen. Der Anfang des Schlüssels jedes Mitglieds
  erscheint neben dem Namen, und der Inhaber und die Admins sind markiert.
- **Was gesagt wird, kann kopiert werden,** von jedem in der Gruppe: Ende-zu-Ende-Verschlüsselung hält die Relays
  draußen, nicht die Mitglieder.
- **Die Relays** lesen nichts und erfahren niemanden in der Gruppe. Deines sieht Anfragen an die Tür der Gruppe
  kommen, wie viele und wann, nicht von wem. Mitglieder können die Warteschlange der anderen mit Unlesbarem füllen,
  bis zu dem, was das Relay annimmt.

## Wie Erevos den Weg wählt {#paths}

Wenn du eine Nachricht sendest, wählt Erevos den Weg von selbst:

1. **Das andere Telefon ist in der Nähe** (oben im Chat steht **In der Nähe**): Sie geht über die Verbindung in der
   Nähe, und auch über das Relay, wenn es eines gibt.
2. **Sonst, mit Relay:** Sie geht über das Relay, und eine kurze Nachricht geht auch an die in der Nähe verbundenen
   Erevos-Telefone, damit das des Kontakts in der Nähe antworten kann, wenn es eines davon ist. Ist das Relay nicht
   erreichbar, zählt diese Kopie, und diese Telefone nehmen sie auch zum Relay deines Kontakts mit, wie in
   [Chat mit einem Telefon in der Nähe](#nearby).
3. **Sonst, ohne Relay,** geht sie an die in der Nähe verbundenen Erevos-Telefone, wie in 2.
4. **Und über LoRa,** wenn ein Funkgerät eingestellt ist und das Relay einen Text nicht annehmen konnte, wie in
   [Über LoRa-Funk](#lora). Gibt es gar keinen Weg, wartet die Nachricht, als **Wartet** markiert, und geht von selbst,
   sobald es einen gibt, wie in [Gesendet, angekommen und gelesen](#relay); eine Zeile unter dem Chat sagt, warum.
5. [~] **Und per SMS,** als Letztes, wenn du es für diesen Kontakt eingeschaltet hast und sonst nichts einen Text
   genommen hat, wie in [SMS](#sms).

Jeder Weg ist Ende-zu-Ende-verschlüsselt: Kein Relay und kein Telefon dazwischen kann lesen, was du sendest.

**Wege**, unter **Einstellungen** → **Relay und Netze**, zeigt jeden Weg auf einen Blick: eine Karte für das Relay, Nostr, die Telefone in der Nähe, LoRa{~, SMS} und Tor, jede mit ihrem Zustand und einer Linie darunter, voll, wenn der Weg funktioniert, blass, wenn er an ist, aber gerade niemanden erreicht, und gestrichelt, wenn er aus ist. Darüber steht, wie viele deiner Nachrichten darauf warten, zu gehen, mit einem orangen Punkt für jede. Eine Karte öffnet die Einstellungen ihres Wegs. Es zeigt nur den offenen Bereich, nie versteckte Chats. Auf der Startseite ist die Zeile unter der oberen Leiste ebenfalls **Wege**, sobald ein Relay gesetzt ist: ein Punkt für jeden Weg, und wie viele deiner Nachrichten warten; ein Tippen öffnet sie.

| Zeile unter dem Chat | Was zu tun ist |
| --- | --- |
| **Gesendet: in der Nähe, Ende-zu-Ende-verschlüsselt.** | Nichts: Das andere Telefon ist in der Nähe und hat sie. |
| **Gesendet: über das Relay, Ende-zu-Ende-verschlüsselt.** | Nichts: Sie ist unterwegs. |
| **Gesendet: an die Erevos-Telefone in der Nähe, Ende-zu-Ende-verschlüsselt, weil das Relay nicht erreichbar war.** | Sie kommt nur an, wenn eines davon das des Kontakts ist: Warte auf **✓✓** oder prüfe das Relay. |
| **… Ist das Telefon des Kontakts nicht dabei, geben sie sie an sein Relay weiter, sobald sie ins Internet kommen, und dieses Telefon ebenso.** | Nichts: Sie kommt an, sobald eines davon, oder dieses Telefon, ins Internet kommt. Warte auf **✓✓**. |
| **Gesendet: über LoRa, Ende-zu-Ende-verschlüsselt, weil das Relay nicht erreichbar war.** | Sie kommt an, wenn das {=Erevos} des Kontakts ein Funkgerät im selben Mesh in Reichweite hat: Warte auf **✓✓** oder prüfe das Relay. |
[~] | **Per SMS gesendet, Ende-zu-Ende-verschlüsselt, weil sonst nichts sie nehmen konnte.** | Nichts: Das kostet SMS, und der Mobilfunkanbieter sieht, dass du ihrer Nummer geschrieben hast. **✓✓** kommt, sobald Relay oder Nostr erreichbar sind. |
| **Wartet. Das Relay ist nicht erreichbar (oder Es gibt kein Relay), und das Telefon des Kontakts ist nicht in der Nähe.** | Nichts: Sie geht von selbst, sobald das Relay oder das andere Telefon in der Nähe sie annehmen kann, und zeigt dann **✓**. Ohne Relay trage seine Adresse ein, wie in [Chat über ein Relay](#relay), oder geh in die Nähe des anderen Telefons. |
| **Wartet. Sie ist zu lang für LoRa.** | Nichts: Sie geht, sobald das Relay oder das andere Telefon in der Nähe sie annehmen kann. Oder sende sie in kürzeren Teilen. |
[~] | **Wartet. Sie ist zu lang für SMS.** | Nichts: Sie geht, sobald das Relay oder das Telefon in der Nähe sie nehmen kann. Oder schicke sie in kürzeren Teilen. |
| **Nicht gesendet. Das Relay hat die Warteschlange dieses Kontakts nicht mehr.** | Bitte den Kontakt, dir zu schreiben, oder um seinen neuen Kontaktlink. |
| **Diese Version kann nicht verschlüsseln, deshalb sind Chats über das Relay aus.** | Baue die App neu: Diese Version ist älter als ihre Verschlüsselung. |

## Ein eigenes Relay betreiben {#own-relay}

Ein Relay, das du selbst betreibst, ist das sicherste, denn wer ein Relay betreibt, sieht, wer sich damit verbindet.
Der Quellcode hat alles in \`deploy/relay\`.

- **In deinem eigenen Netz:** Lass das Relay auf einem Computer laufen, öffne Port 7879 in seiner Firewall und gib
  \`ws://<seine Adresse>:7879\` auf jedem Telefon ein. Schließe den Port wieder, wenn du fertig bist.
- **Im Internet:** ein Server (VPS) mit Debian 12 oder Ubuntu 22.04 oder neuer, ein Domainname (oder ein kostenloser
  \`sslip.io\`-Name) und offene Ports 80 und 443. Ein einziger Befehl installiert das Relay hinter Caddy, mit einem
  Zertifikat von Let's Encrypt und einem zufälligen Token. Jedes Telefon nutzt dann \`wss://<deine Domain>\` und dieses
  Token. Derselbe Befehl richtet das Anruf-Relay für Anrufe ein, das außerdem Port 3478 und die UDP-Ports 50000 bis
  50999 offen braucht.

Warteschlangen und wartende Nachrichten werden auf der Festplatte des Servers aufbewahrt, ebenso die verschlüsselten
Stücke von Fotos und Dateien, bis sie geholt werden (zusammen höchstens 1024 MB), sodass ein Neustart nichts verliert,
und keine Anfrage wird protokolliert.
Auch Nachrichten, die für später gesendet wurden, werden dort bis zu ihrer Zeit aufbewahrt, höchstens 10.000 oder
256 MB: Das Relay sieht, wann jede gehen soll, nicht, was sie sagt.

**Warum:** Was das Relay aufbewahrt, hat Grenzen, sodass die Telefone, die es nutzen, seine Festplatte oder seinen
Arbeitsspeicher nicht füllen können.

**Sein eigener Schlüssel:** Die Schlüsseldatei des Relays (\`EREVOS_RELAY_KEY\`, die der eine Befehl einrichtet) ist
das, was es bei jeder Verbindung beweist, sodass Telefone es an diesem Schlüssel erkennen statt an seinem Zertifikat
(siehe [Der eigene Schlüssel des Relays](#relay)). Bewahre diese Datei auf, auch in seinen Backups: Mit einer neuen
lehnt jedes Telefon, das den alten Schlüssel kannte, das Relay ab, bis jemand dort auf **Es hat einen neuen
Schlüssel** tippt.

**Einladungen:** Das Relay kann jedem Telefon ein eigenes Token geben, in einer Token-Datei, und diese Telefone dann
weitere einladen lassen, jede Einladung für ein Telefon (siehe [Einladungen zum Relay](#relay)). Schalte es mit
\`EREVOS_RELAY_INVITES=on\` neben \`EREVOS_RELAY_TOKENS\` ein; das Relay schreibt dann die Zeilen eingeladener Telefone
selbst in diese Datei, mit wer sie eingeladen hat und wann, und eine Zeile herauszunehmen sperrt dieses Telefon aus, nur
dieses: Die Telefone, die es eingeladen hat, behalten ihre; um auch sie auszusperren, lösche jede ihrer Zeilen (jede
sagt, wer es eingeladen hat). Es lässt höchstens 100 Telefone per Einladung herein (\`EREVOS_RELAY_MAX_INVITED\`).
\`erevos-relay free-line NAME\`, bei angehaltenem Relay ausgeführt, macht eine Zeile zu einer von deinen: Das Telefon,
das sie eingeladen hat, kann sie nicht mehr zurücknehmen, und sie zählt nicht mehr zu den 100. Ein Telefon, das mit dem
Token des Relays kommt (\`EREVOS_RELAY_TOKEN\`), bittet einmal um eine eigene Zeile, die das Relay als eine von deinen
hinzufügt, mit dem Vermerk, dass es mit dem Token des Relays kam, und wann, höchstens 50 am Tag: So kannst du dieses
Token verteilen, die Zeile jedes einzelnen Telefons löschen und dann das Token ändern, ohne die anderen auszusperren.
\`deploy/relay/README.md\` sagt, wie.

**Anmelden:** Mit einer Token-Datei kann das Relay Telefone sich auch bei einem OpenID-Connect-Anbieter wie Authentik
anmelden lassen, für ein eigenes Token, und prüft jedes Konto jede Stunde, wobei es seine Telefone nach 3 Tagen ohne
Antwort und zwei weiteren fehlgeschlagenen Prüfungen jedes Telefons im Abstand einer Stunde entfernt (siehe
[Beim Relay anmelden](#relay)). Ein Browser darf 10 Anmeldungen pro Minute starten. Mit \`EREVOS_RELAY_OIDC_GROUP\`
dürfen es nur die Konten in dieser Gruppe.
Es braucht einen Client beim Anbieter, ein paar Einstellungen und \`/signin/\`, als einfaches HTTP an das Relay
weitergereicht: \`deploy/relay/README.md\` sagt, wie.

> Veröffentliche das Token nie dort, wo andere es lesen können. Wer den Server betreibt, sieht die IP-Adressen, die
> sich verbinden, die Warteschlangen-IDs und wann und wie viel ankommt. Die Nachrichten kann er nicht lesen, sie sind
> Ende-zu-Ende-verschlüsselt.

## Heim-Relay {#home-relay}

Unter **Einstellungen** → **Relay und Netze** → **Heim-Relay** kann ein Bereich ein zweites Relay mit einer eigenen
Warteschlange haben: eines zu Hause, auf einem Raspberry Pi oder einem alten Computer, oder ein anderes Relay, dem du
vertraust. Es ist optional.

- **Was es tut:** Dein Kontaktlink und jede Nachricht nennen diese Warteschlange neben deinem Relay. Solange dein
  Relay nicht erreichbar ist, schreiben Kontakte dorthin, und Erevos holt bei jedem Nachsehen, was dort ankommt. Was
  du sendest, geht darüber, wenn dein eigenes Relay ausgefallen ist.
- **Wie du es einrichtest:** Betreibe ein Relay wie in [Ein eigenes Relay betreiben](#own-relay), gib seine Adresse
  ein (und sein Token, falls es eines hat) und wähle **Speichern**. Kontakte erfahren es mit deiner nächsten Nachricht
  an sie oder über deinen neuen Kontaktlink.
- **Was es sieht:** was dein Relay sieht, die Adresse dieses Telefons, wenn es Nachrichten holt (nicht aber, wenn es nur
  über Tor erreicht wird), und wann und wie viel ankommt. Versteckte Chats nutzen es nicht.
- **Nur über Tor:** ein Schalter für jedes Heim-Relay. Dieses Relay sieht nie die Adresse dieses Telefons, egal was für
  den Rest bei Tor eingestellt ist. Ohne eingegebenes Token gibt es ein Token für einen Gutschein: Dein Relay, das des
  Bereichs selbst, signiert den Gutschein blind, sodass keines der beiden Relays erkennen kann, wem das Token gehört.
  Der Gutschein wird bis zu einer Stunde nach dem Signieren eingelöst, zu einem zufälligen Zeitpunkt, sodass die Zeiten, die die beiden Relays
  gesehen haben, nicht zusammenpassen, und das Token kommt innerhalb einer Stunde vom Heim-Relay. Das Token gilt 90
  Tage, und Erevos holt an einem zufälligen Tag zwischen Tag 30 und Tag 60 von selbst einen neuen Gutschein. Eine Grenze: Hat ein Relay nur wenige Telefone,
  könnte, wer beide betreibt, allein an den Zeiten noch raten. So können zwei Bereiche (siehe
  [Zweites Passwort](#second)) jeweils das Relay des anderen als Heim-Relay nutzen, und kein Relay verbindet sie
  miteinander. Beide Relays müssen Gutscheine eingeschaltet haben, und es braucht einen Build mit Tor, auf Android
  (siehe [Über Tor](#tor)).
- **Automatisch von deinem Relay:** ein Schalter, aus, solange du ihn nicht einschaltest, auf Android, wo Erevos Tor
  hat. Nennt dein Relay ein Relay, mit dem es gepaart ist (das richtet sein Betreiber ein), nimmt ein Bereich ohne
  Heim-Relay dieses von selbst, nur über Tor, mit seinem Token aus einem Gutschein wie oben: nichts zu tippen, und
  nichts zu tun, wenn dein Relay ein anderes nennt. Schaltest du ihn aus, lässt er das Heim-Relay los, das er genommen hat, und entfernst du das Heim-Relay von Hand, schaltet sich das für diesen
  Bereich aus; ein Heim-Relay, das du selbst eingetippt hast, bleibt, wie es ist. Versteckte Plätze nehmen nie so eins.
- **Für versteckte Chats:** Jeder versteckte Platz kann ein eigenes Heim-Relay haben, unter **Für Fortgeschrittene**
  auf seinem Bildschirm ohne gewählten Chat, solange er offen ist. Es wird nur bei diesem Platz aufbewahrt, versiegelt
  mit seiner PIN, sodass der Bereich nichts davon weiß, und es wird abgefragt, solange der Platz offen ist. Nutze ein
  anderes Relay als das des Bereichs: Ein Relay, das beide Warteschlangen sieht, würde sie miteinander verbinden.

**Mehr als eines:** **Weiteres Heim-Relay hinzufügen** gibt bis zu zwei weitere, jedes mit einer eigenen Warteschlange,
zum Beispiel eines zu Hause und eines bei einem Freund. Kontakte probieren sie in der gezeigten Reihenfolge, und Erevos
holt ab, was bei jedem ankommt. Dein Kontaktlink nennt die weiteren nur, solange er kurz genug für einen QR-Code bleibt;
der Rest erreicht deine Kontakte mit deiner nächsten Nachricht. Ein Kontakt mit einem älteren {=Erevos} nutzt nur das erste.

## Über Tor {#tor}

Unter **Einstellungen** → **Relay und Netze** → **Tor** wählt **Was über Tor geht**, welche Anfragen dieses Bereichs
an seine Relays über das Tor-Netz gehen. Jeder Bereich hat seine eigene Wahl:

| Wahl | Was über Tor geht |
| --- | --- |
| **Nichts** | Sofern du es nicht änderst. Das Relay und die Nostr-Relays sehen bei allem die IP-Adresse deines Telefons. |
| **Nachrichten** | Was du schreibst, und was deinen Kontakten etwas mitteilt, etwa dass eine Nachricht gelesen wurde. Bilder, Dateien und Sprachnachrichten gehen direkt, was schneller ist: Für sie sieht das Relay die IP-Adresse deines Telefons. |
| **Alles** | Auch Dateien. Nichts geht ohne Tor an ein Relay. |

**Warum:** Ein neuer Bereich beginnt mit **Nichts**, da Tor Nachrichten langsamer macht; ein Bereich von früher behält
seine Wahl. Mit **Nachrichten** wird, was du schreibst, von Tor verborgen und wartet nie darauf, während Bilder, Dateien
und Sprachnachrichten, die groß sind, direkt und damit schneller gehen.

- **Tor einschalten:** Von **Nichts** auf **Nachrichten** oder **Alles** fragt Erevos zuerst **Tor einschalten?** und
  sagt, dass Nachrichten langsamer werden; **Abbrechen** behält **Nichts**.

- **Ein Chat nur über Tor:** In einem Erevos-Chat schickt **Details** → **Über Tor** die Nachrichten und Dateien
  dieses Chats nur über Tor, auf eigenen Tor-Verbindungen, egal was dieser Bereich gewählt hat; es ist aus, solange du
  es nicht einschaltest. Das Relay sieht dann für diesen Chat nicht die IP-Adresse deines Telefons, und kein
  Tor-Ausgang trägt ihn zusammen mit einem anderen Chat. Es ist langsamer, und was gesendet wird, wartet, während Tor
  startet. Anrufe gehen nicht über Tor. Versteckte Chats haben es auch, jeder in seinen eigenen **Details**.
  Es ist auf deinen verknüpften Geräten gleich: Auf einem ein- oder ausgeschaltet, ist es überall ein- oder
  ausgeschaltet. Auf einem Gerät ohne Tor, etwa der Web-App, sendet dieser Chat nichts, solange es eingeschaltet ist.
  Es gilt auch für die Nostr-Texte dieses Chats und für seine Fotos und Dateien auf Nostr-Dateiservern, selbst wenn
  die Wahl dieses Bereichs **Nichts** ist: Tor wird dafür gestartet, und nichts geht direkt. Bis dein Kontakt zum
  ersten Mal in die eigene Warteschlange des Chats schreibt, kommen seine ersten Nachrichten in die Warteschlange des
  Bereichs, die so gelesen wird, wie der Bereich es sagt. Siehe [Wer deine Internetadresse sieht](#ip).

- **Was es verbirgt:** Das Relay sieht nicht mehr die IP-Adresse deines Telefons, nur einen Tor-Ausgang (oder nichts,
  bei einem Relay mit \`.onion\`-Adresse). Deine Telefongesellschaft oder das WLAN sieht nur, dass du Tor nutzt, nicht
  welches Relay.
- **Was es kostet:** Was über Tor geht, kommt und geht langsamer, und der erste Start von Tor dauert eine Weile. Der
  Bildschirm zeigt, wie weit Tor ist. Um den Akku zu schonen, sendet Erevos das reduzierte Padding, das Tor für
  Telefone gemacht hat: Das Füllmaterial, das Tor sendet, um zu verbergen, wann du redest, geht alle 9 bis 14
  Sekunden, nicht alle paar, und zum Telefon kommt keines.
- **Was es nicht abdeckt:** Anrufe, deren Ton und Bild direkt zwischen den Telefonen oder über das Anruf-Relay gehen;
  Telefone in der Nähe{~ und SMS}, die das Internet nicht nutzen.
- **Nur auf Android:** {=Erevos} auf einem Computer und die Web-App haben noch kein Tor, also geht dort alles direkt.

> Mit **Nachrichten** wartet eine Nachricht nie auf Tor: Eine, die Tor nicht zum Relay bringen konnte, geht sofort
> direkt, und ebenso Nachrichten, während Tor startet, oder eine Minute lang, nachdem es das Relay nicht erreichen
> konnte; dann wird Tor erneut versucht. Mit **Alles** geht nichts ohne Tor an ein Relay:
> Wenn Tor das Relay nicht erreichen kann, wartet die Nachricht und wird erneut versucht; Erevos weicht nie von selbst
> auf deine eigene Verbindung aus.

### Brücken

Wo Tor selbst blockiert ist, lässt **Brücken** auf demselben Bildschirm Tor sein Netz stattdessen über Brücken
erreichen. Es steht auf **Keine Brücken**, solange du nichts wählst, jeder Bereich hat seine eigene Wahl, und es zählt
nur, solange etwas über Tor geht.

| Wahl | Was es ist |
| --- | --- |
| **Automatisch** | Erevos versucht die Wege der Reihe nach, bis Tor verbunden ist: direkt, die obfs4-Brücken, Snowflake, dann deine eigenen Zeilen, falls vorhanden. Den Weg, der im WLAN und in mobilen Daten funktioniert hat, merkt es sich 30 Tage und versucht ihn zuerst; in einem anderen Netz sucht es neu. Mit **Mein Netz wird überwacht** versucht es nie direkt, das Netz sieht also nur eine Brücke. |
| **obfs4** | Die obfs4-Brücken, die der Tor Browser mitbringt. Für jeden, der das Netz beobachtet, sieht Tor wie zufällige Bytes aus. Ein Zensor, der sie kennt, kann sie blockieren. |
| **Snowflake** | Über die Browser von Freiwilligen, über WebRTC, so wie ein Videoanruf geht. Um einen zu finden, fragt Erevos den Broker von Snowflake über ein CDN, hinter dem Namen einer anderen Seite, und STUN-Server sagen dem Telefon seine eigene Adresse: Sie sehen diese Adresse, nie deine Nachrichten. Langsamer und schwer zu blockieren. |
| **Eigene** | Brückenzeilen von bridges.torproject.org, von bridges@torproject.org per E-Mail oder von @GetBridgesBot auf Telegram, eingefügt, eine pro Zeile; tippe dann auf **Diese Brücken nutzen**. obfs4, Snowflake, WebTunnel, meek und einfache Brücken funktionieren. |

- **Nur über sie:** Mit Brücken geht Tor nie direkt zu seinen Relays. Wenn keine Brücke antwortet, warten Nachrichten
  mit **Alles**, wie wenn Tor das Relay nicht erreichen kann; mit **Nachrichten** gehen sie ohne Tor an das Relay, bis
  eine antwortet. Zeilen, die keine Brücken sind, werden nicht angenommen, und Tor bleibt aus.
- **Meine Verbindung prüfen**, darunter, sagt, ob Tor sich verbindet und auf welchem Weg, nie die Adresse des
  Telefons. Mit **Automatisch** sucht es von vorn.
- **Sie zu ändern**, während Tor läuft, schließt seine Verbindungen und baut sie auf die neue Art wieder auf.
- **Nur auf Android:** Die App bringt lyrebird mit, das eigene Programm von Tor für obfs4, Snowflake, WebTunnel und
  meek. Ein Computer und die Web-App haben noch kein Tor, also auch keine Brücken.

## Über Nostr {#nostr}

Unter **Einstellungen** → **Relay und Netze** → **Nostr** steht **Texte über Nostr** auf **An**, sofern du es nicht
änderst. Dann geht, was du einem Kontakt schreibst, dessen {=Erevos} auch auf Nostr liest, zuerst über deine Relays: dein
Relay, dann seine Heim-Relays, dann dein Heim-Relay; über öffentliche Nostr-Relays nur, wenn keins davon es angenommen
hat. Jeder Bereich hat seine eigene Wahl und seine eigenen Nostr-Relays.

- **Wie es versiegelt wird:** Ende-zu-Ende-verschlüsselt wie immer, dann noch einmal versiegelt für einen Schlüssel, den
  dein Kontakt nur diesem Chat gegeben hat, und signiert mit einem Schlüssel, der nur für diesen einen Text gemacht
  wurde (ein NIP-59 Gift Wrap). Die Nostr-Relays sehen, dass jemand an einen Schlüssel geschrieben hat, der niemanden
  nennt, wann und wie groß; nicht, wer es geschrieben hat, noch an wen. Dein Relay sieht nicht, was diesen Weg ging.
- **Was die Nostr-Relays erkennen können:** Dein Telefon fragt jedes von ihnen auf einmal nach all seinen Schlüsseln:
  Ein Relay kann erkennen, dass diese Schlüssel zusammen gelesen werden. Über Tor nie von wo: Jedes Relay wird über
  eigene Tor-Circuits erreicht, sodass kein Tor-Ausgang trägt, was an zwei von ihnen geht, und keines erkennen kann,
  dass es von einem Telefon ist. Mit **Nichts** geht es direkt, also sehen sie die IP-Adresse deines Telefons, noch
  immer nicht, wer wem geschrieben hat. Manche Relays lehnen manche Tor-Ausgänge ab, und manche Ausgänge können ein Relay
  nicht erreichen: Nach einem solchen Fehlschlag geht der nächste Versuch über einen anderen Ausgang.
- **Wie es geht:** Mit **Nichts** gehen Texte direkt an die Nostr-Relays. Mit **Nachrichten** über Tor, sobald Tor
  bereit ist, und über dein Relay, solange Tor startet. Mit **Alles** nur über Tor. Ändert sich der Weg, schließen sich
  die Nostr-Verbindungen und öffnen sich auf dem neuen Weg wieder.
- **Nostr über Tor:** Auf dem Bildschirm **Nostr** ist **Nostr über Tor** **Aus**, sofern du es nicht einschaltest.
  **An** erreicht Erevos die Nostr-Relays und die Nostr-Dateiserver nur über Tor und startet Tor dafür, auch wenn Tor
  für den Bereich **Nichts** ist; ein Text, der dorthin geht, wartet, während Tor startet. Es fügt nur Tor hinzu: Ist
  Tor für den Bereich an, geht Nostr über Tor, was es auch sagt, und ein Chat mit **Über Tor** geht über Tor, was es
  auch sagt. Siehe [Wer deine Internetadresse sieht](#ip).
- **Die Relays:** relay.damus.io, nos.lol und relay.primal.net, sofern du sie nicht änderst; du kannst eigene
  hinzufügen, höchstens fünf. Deine Kontakte erfahren die Relays, auf denen du liest, und schreiben dir dort; eines,
  das einen Text annimmt, genügt.
- **Was auf deinem Relay bleibt:** Anrufe, Reaktionen und die Zeichen, dass eine Nachricht ankam oder gelesen wurde; und was du Kontakten auf einem iPhone oder einem Computer schreibst, die nicht auf Nostr lesen. Bilder, Dateien und Sprachnachrichten gehen über dein Relay, wenn eines zwischen euch ist; ohne Relay zwischen euch gehen sie auch über Nostr (siehe Ganz ohne Relay).
- **Welchen Weg sie ging:** Halte eine Nachricht gedrückt: Ihr Menü sagt **Über Nostr gesendet** oder **Über Nostr
  gekommen**, wenn ein Nostr-Relay sie angenommen hat. Von jetzt an sagt es auch **Über das Relay gesendet**, **Über das
  Relay gekommen**, **An ihr Telefon in der Nähe gesendet**, **Von einem Telefon in der Nähe gekommen** oder **Über LoRa
  gesendet**; eine ältere Nachricht sagt nichts. Der Hinweis unter den Nachrichten sagt auch **Gesendet: über Nostr**.
  Zwei Telefone nebeneinander geben sich Texte zuerst in der Nähe, dann über die Relays; Nostr trägt einen Text nur,
  wenn die Relays ihn nicht angenommen haben.
- **Was die Relays zuletzt taten:** Der Bildschirm **Nostr** zeigt für jedes Relay, ob es den letzten Text, den es
  bekam, angenommen hat und wie viele Sekunden danach, oder warum nicht, und ob dein Telefon darauf liest. Das wird nur
  auf diesem Telefon aufbewahrt, bis Erevos sich schließt. Ein Text wartet nie auf die Nostr-Relays, solange deine
  Relays ihn annehmen.
- **Nur auf Android,** wie Tor.

**Warum:** Die Nostr-Relays sind öffentlich, also erreicht Erevos sie, wenn Tor für den Bereich an ist, über Tor, und
sie erfahren nie, wo dein Telefon ist; mit **Nichts** erreicht es sie direkt. Nur Texte gehen dorthin, als Reserve
deiner Relays: Ein Text, der dorthin ging, geht noch einmal über dein Relay, falls er nicht ankommt, während die
Zeichen, dass eine Nachricht ankam oder gelesen wurde, keine hätten, und eine für später gesendete Nachricht dein Relay
braucht, das sie bis zu ihrer Zeit aufbewahrt. Ohne Relay zwischen euch gehen auch Bilder, Dateien und Sprachnachrichten
dorthin (siehe Ganz ohne Relay).

> Ein Text, der über Nostr ging, geht noch einmal über dein Relay, sollte das Telefon deines Kontakts nicht innerhalb
> von fünf Minuten sagen, dass er ankam, und dein Kontakt sieht ihn einmal. Wenn weder deine Relays noch ein Nostr-Relay
> ihn annehmen, wartet er und geht später noch einmal, wie jede Nachricht.

- **Versteckte Chats:** Sie lesen auch auf Nostr, solange sie offen sind, und auch geschlossen, solange
  **Empfangen, wenn geschlossen** für sie an und der Bereich offen ist (siehe [Versteckte Chats](#hidden)).
  Geschlossen zeigen sie trotzdem „New message“: Mit jedem Text über Nostr sendet dein Kontakt deinem Relay auch eine
  Klingel, eine Nachricht, die nichts sagt, die dein Relay wie bisher als eine zählt. Ohne Relay sagen ihr Kontaktlink
  und QR-Code, wo sie auf Nostr lesen, mit einem Schlüssel nur dieses Platzes, und Texte, Reaktionen und die Zeichen,
  dass eine Nachricht ankam, gehen dorthin, wie von einem Telefon ohne Relay.

### Ganz ohne Relay {#nostr-only}

Ein Telefon ohne Relay, ohne Einladung und ohne LPHL-Konto kann trotzdem anfangen: Sein Kontaktlink und QR-Code sagen,
wo es auf Nostr liest, und das genügt, um zu reden.

- **Anfangen:** Tippe in **Neuer Chat** unter **Für Fortgeschrittene** auf **Ohne Relay anfangen**, dann auf **Meinen
  QR-Code zeigen** oder **Meinen Kontaktlink teilen**, und gib ihn jemandem, der {=Erevos} nutzt. Wer ihn hinzufügt,
  schreibt dir über Nostr und erscheint als Nachrichtenanfrage, die du annimmst. Du kannst auch seinen Link oder
  QR-Code hinzufügen, auf dieselbe Weise.
- **Was geht:** Texte, Sticker, Reaktionen, Bearbeitungen und die Zeichen, dass eine Nachricht ankam oder gelesen wurde, alles über Nostr; und Fotos, Dateien und Sprachnachrichten. Eine Sprachnachricht geht in Wraps wie ein Text. Ein Foto bis 3 MB geht in Stücken von 32 KB, je ein Wrap, die vor der Nachricht gesendet werden, die es anbietet; das andere Telefon behält sie, verschlüsselt mit dem Rest des Bereichs oder der versteckten Chats, für die sie kamen, bis alle da sind, höchstens vier Tage. Ein größeres Foto, ein Video oder jede andere Datei, bis 20 MB, geht als ein Blob, auf dem Telefon verschlüsselt, an einen Blossom-Dateiserver (blossom.primal.net, blossom.band oder nostr.download), über Tor, wie die Tor-Wahl des Bereichs sagt (direkt mit **Nichts**): Der Server behält nur, was er nicht lesen kann. Anrufe und Gruppen brauchen ein Relay oder das andere Telefon in der Nähe. Versteckte Chats funktionieren auch so, nur über Nostr (siehe [Versteckte Chats](#hidden)).
- **Wenn er nicht ankommt:** Die Nostr-Relays bewahren einen Text zwei Tage auf. Bis das Telefon deines Kontakts sagt,
  dass er ankam, gibt Erevos ihn ihm einmal am Tag erneut, zwei Wochen lang.
- **Ein Relay von selbst:** Wenn dein Kontakt ein Relay hat, das ihn einladen lässt, sendet sein {=Erevos} deinem von
  selbst einmal eine Einladung dazu, im Chat, ob ihr euch zuerst über Nostr oder in der Nähe getroffen habt, über
  Bluetooth, WLAN oder einen QR-Code. Dein Telefon nimmt sie von selbst an, und ab dann funktionieren auch Fotos,
  Sprachnachrichten und Anrufe, mit allen. Sie zählt als eine seiner Einladungen. Jemand, dessen Nachrichtenanfrage du
  nicht angenommen hast, wählt kein Relay für dich: Seine Einladung wartet, bis du ihn annimmst, höchstens eine Woche.
- **Ein älteres Erevos** liest den Nostr-Teil eines Links nicht: Es erreicht dich nur in der Nähe, bis du ein Relay
  hast.

**Warum:** Nostr ist nur der Weg hinein. Niemand braucht eine Einladung, um anzufangen, und sobald einer von euch ein
Relay hat, trägt es, was für Nostr zu groß ist.

## Wer deine Internetadresse sieht {#ip}

Die Internetadresse deines Telefons, seine IP-Adresse, zeigt ungefähr, wo du bist und bei welchem Anbieter du bist.
Sie zeigt nicht, was du schreibst. Wer sich mit deinem Telefon verbindet, sieht sie, außer die Verbindung geht über
Tor.

- **Dein Relay und die Relays deiner Kontakte:** Sie sehen sie. Um sie zu verbergen, schalte Tor für den Bereich ein
  (**Einstellungen** → **Relay und Netze** → **Tor**) oder **Über Tor** in den **Details** eines Chats. Siehe [Über
  Tor](#tor).

- [+] **XMPP:** Dein XMPP-Server sieht sie, solange Erevos verbunden ist, außer das Konto geht über Tor; die Server deiner
  Kontakte und Gruppen nicht, da dein Server deine Nachrichten zu ihnen trägt. Erevos warnt, bevor du in einem Chat
  sendest, solange das Konto nicht über Tor geht (mit **Über Tor** für diesen Chat als Lösung), vor jedem Anruf und
  bevor es eine Datei von einem anderen Server als deinem lädt. Siehe [XMPP](#xmpp).

- **Die öffentlichen Nostr-Relays und die Nostr-Dateiserver:** Sie sehen sie, außer die Verbindung geht über Tor.
  Schalte **Nostr über Tor** unter **Einstellungen** → **Relay und Netze** → **Nostr** ein, oder **Über Tor** für
  einen Chat. Siehe [Über Nostr](#nostr).
- **Ein Code mit 8 Ziffern**, unter **Neben mir** und **Ich habe ihren Code**: Die beiden Telefone treffen sich auf
  denselben öffentlichen Nostr-Relays, ohne Nostr über Tor sehen diese also die Adresse, nicht aber den Code oder die
  Kontaktlinks. Erevos sagt es vor dem ersten Mal.

- [+] **Matrix:** Nur dein eigener Matrix-Server sieht sie, nicht die Server deiner Kontakte: Fotos und Dateien von
  anderen Servern kommen auch über deinen. Wähle **Tor für dieses Matrix-Konto** auf dem Matrix-Bildschirm, oder
  schalte **Über Tor** unter den Knöpfen eines Chats ein, was das ganze Konto über Tor schickt. Siehe [Matrix](#matrix).
- [+] **Telegram:** die Server von Telegram sehen sie, außer das Konto geht über Tor: wähle **Immer über Tor** unter
  **Tor für dieses Telegram-Konto** in den Telegram-Einstellungen, oder schalte **Über Tor** in den Infos eines Chats
  ein, was das ganze Konto über Tor schickt. Siehe [Telegram](#telegram).
- [+] **Chats mit anderen Nostr-Apps und der öffentliche Feed:** Ihre Relays und Dateiserver sehen sie, außer das Konto
  geht über Tor (**Tor** auf dem Bildschirm **Nostr-Chats**) oder **Über Tor** des Chats ist an. Posten, Liken oder
  Abstimmen im öffentlichen Feed und seine Fotos und Linkvorschauen ohne Tor zeigen sie auch. Siehe [Chats mit anderen
  Nostr-Apps](#nostr-chats).
- [+] **Messenger, Signal und Session** (Erevos+): ihre eigenen Server sehen sie (die von Meta, von Signal oder der erste
  Session-Knoten), nicht deine Kontakte, außer das Konto geht über Tor: wähle **Immer über Tor** unter **Tor für
  dieses …-Konto** auf seinem Bildschirm, oder schalte **Über Tor** in einem Chat ein, was das ganze Konto über Tor
  schickt. Anmelden, das Captcha von Signal, die Bilder von Messenger und **Facebook öffnen** gehen genauso. Erevos warnt, bevor du in
  einem Chat sendest, solange das Konto nicht über Tor geht, und vor jedem Anruf. Siehe [Messenger](#messenger), [Signal](#signal) und [Session](#session).

- **Anrufe:** Sie gehen nie über Tor. Das Anruf-Relay, deines oder das deines Kontakts, sieht die Adresse, aber nicht,
  was gesagt wird. Ein Anruf zwischen Telefonen in der Nähe im selben Netz bleibt in diesem Netz.

- **Eine Datei auf einem Server, den dein Kontakt gewählt hat:** Der Server sieht die Adresse, wenn dein Telefon die
  Datei holt. Tor verbirgt sie.

- **Web-Links, die du öffnest:** Die Seite sieht sie, wie jede Webseite. Um sie zu verbergen, öffne Links im Tor
  Browser. Die Vorschau eines Links wird auch von seiner Seite geholt, und die Seite sieht die Adresse genauso.
  Mit **Über Tor** für Linkvorschauen sieht sie die Seite nicht.

- **Das Relay eines Kontakts:** Solange dein Bereich kein eigenes Relay hat, oder nur einen geliehenen Platz auf
  einem, kann dir ein Kontakt einen Platz auf seinem geben, und er kommt mit seiner Nachricht. Sein Relay sieht dann
  die Adresse, darum fragt Erevos, bevor es ihn nimmt, außer der Bereich schickt alles über Tor. Nicht genommen, wird
  die Einladung fallen gelassen.

- **Gruppen:** Eine Nachricht in einer Erevos-Gruppe geht über einen Server, der die Adresse sieht. Tor für den
  Bereich verbirgt sie; eine Gruppe hat keinen eigenen Schalter.

- **Backups, {~der Server der Sammlung, Radio- und TV-Listen, |}Linkvorschauen und Updates:** Jedes hat in seinem eigenen
  Bildschirm einen eigenen Schalter **Über Tor**, aus, solange du ihn nicht einschaltest. Siehe [Backups](#backup),
  {~[Sammlung](#collection), |}[Chat über ein Relay](#relay) und [Updates](#updates).

- [~] **Radio- und TV-Sender:** Jeder sieht die Adresse, solange er läuft. **Über Tor abspielen** in den Einstellungen der
  Sammlung auf Android, aus, solange du es nicht einschaltest, spielt sie nur über Tor ab. Siehe
  [Sammlung](#collection).

Erevos warnt vor jedem davon einmal, mit dem Titel **Deine Internetadresse kann gesehen werden**, einem Knopf
**Anleitung**, der diesen Abschnitt öffnet, und, wo es geht, einem Knopf, der es behebt, etwa **Über Tor für diesen
Chat**. Mit **Weiter** geht es weiter. Für das, was du sendest, wird es einmal für das ganze Netz gesagt, nicht in
jedem Chat: danach zeigt ein Chat oder eine Gruppe ohne Tor nur eine leise Zeile über dem Schreibfeld, **Ohne Tor: Die
Relays sehen deine Internetadresse.**, mit **Über Tor für diesen Chat** und **Anleitung** daneben.

Nach der Anleitung kommt dieselbe Frage wieder, und was du gerade sendest, etwa eine Sprachnachricht oder eine Datei,
wartet darauf. Ein Anruf, der hier klingelt, sagt es unter dem Anruf, und Annehmen geht weiter. Versteckte Chats
bewahren das Gesagte bei sich auf, getrennt vom Bereich.

Telefone in der Nähe{~, LoRa und SMS| und LoRa} nutzen das Internet nicht, also zeigen sie keine Internetadresse.

## Matrix {#matrix}

Unter **Einstellungen** → **Relay und Netze** → **Matrix** kann sich ein Bereich bei einem Matrix-Konto anmelden, um mit
Menschen zu chatten, die Element oder eine andere Matrix-App nutzen. Erevos spricht selbst mit dem Matrix-Server, wie
Element: Keine Brücke sitzt dazwischen.

- **Anmelden:** deine Matrix-ID, etwa @name:matrix.org, und ihr Passwort. Erevos wird ein neues Gerät des Kontos,
  namens Erevos. Anmeldung und Schlüssel des Geräts bleiben verschlüsselt in diesem Bereich, und sind in den Backups:
  Nach einer Wiederherstellung meldet sich der Bereich neu an, als neues Gerät. Seine versteckten Chats können ein
  eigenes Matrix-Konto haben, siehe [Versteckte Chats](#hidden).
- **Single Sign-On:** Unter Android, wenn dein Matrix-Server Leute woanders anmeldet (wie matrix.org es bei neuen
  Konten verlangt), öffnet **Mit Single Sign-On anmelden** den Browser auf dieser Seite, und er kommt zu Erevos
  zurück, sobald du dich dort angemeldet hast; ein Server mit mehreren Anbietern lässt dich einen wählen. Der Browser
  geht nicht über Tor, diese Seite sieht also deine Adresse. Da es kein Passwort zu geben gibt, erstellt Erevos die
  Cross-Signing-Schlüssel des Kontos nur, wenn der Server sie ohne erneute Frage annimmt; sonst prüfe dieses Gerät per
  Emoji oder QR-Code von einem anderen deiner Geräte, oder gib den Sicherheitsschlüssel ein.
- **Chats:** **Neuer Chat** beginnt einen verschlüsselten Chat mit einer Matrix-ID. Einladungen stehen oben, mit
  **Beitreten** und **Ablehnen**. Schreibe einen Namen statt einer Matrix-ID, um im Benutzerverzeichnis deines
  Matrix-Servers nach Leuten zu suchen; der Server erfährt, nach wem du gesucht hast; **Starten** beginnt den Chat mit
  dem, auf den du tippst.
- **Gruppen:** **Neue Gruppe**, auf dem Matrix-Bildschirm, erstellt eine verschlüsselte Gruppe aus einem Namen und den
  Matrix-IDs, die du schreibst, jede eingeladen, wie Element eine erstellt; alle darin sehen, wer die anderen sind.
  **Einer Gruppe beitreten** tritt einer Gruppe über ihre Adresse bei, etwa #name:matrix.org. Eine öffentliche Gruppe
  ist vielleicht nicht verschlüsselt, und ihr Bildschirm sagt es dann. In einer Gruppe lädt **Einladen** jemand anderen
  ein, wenn die Gruppe es dir erlaubt.
  Wer in einer Gruppe **@** tippt, bekommt ihre Mitglieder angeboten; eine Nachricht nennt die ganz Geschriebenen, und
  deren Apps sagen es ihnen.
- **Mitglieder:** In einer Gruppe listet **Mitglieder** ihre Leute auf und zeigt, wer **Inhaber**, **Admin** oder
  **Moderator** ist, wie ihre Rechtestufen es sagen. Wo deine Stufe es erlaubt, benennst du die Gruppe um, setzt ihren
  **Betreff**, machst jemanden mit **Zum Admin machen** zum Admin oder nimmst es mit **Als Admin entfernen** zurück,
  **Entfernen** jemanden (die Nachrichten der Gruppe erreichen ihn nicht mehr) oder **Sperren** ihn (er kann nicht
  wieder beitreten, bis ein Admin ihn lässt).
- **Verschlüsselung:** Nachrichten sind Ende-zu-Ende-verschlüsselt, mit Matrix' eigener Verschlüsselung (Olm und
  Megolm, über vodozemac). Ein nicht verschlüsselter Chat sagt es.
- **Nicht anonym:** Der Matrix-Server sieht dein Konto, wer mit wem spricht und wann, und ohne Tor auch, von wo. In
  einem Chat mit Menschen auf anderen Servern sehen es auch diese.
- **Über Tor:** Auf Android hat der Matrix-Bildschirm, auch vor der Anmeldung, die Tor-Wahl, die jedes Konto hat:
  **Aus** (die Vorgabe) geht direkt, und der Matrix-Server sieht deine Adresse; **Wie der Bereich** folgt
  **Einstellungen** → **Relay und Netze** → **Tor**: mit **Nachrichten** über Tor, sobald es bereit ist, und direkt,
  solange es startet, Fotos und Dateien direkt; mit **Alles** alles nur über Tor; **Immer über Tor** schickt dieses
  Konto nur über Tor, auch die Anmeldung, und nichts ohne es. Tor nutzt die Brücken des Bereichs. **Über Tor** eines
  Chats, unter seinen Knöpfen, lässt das ganze Konto nur über Tor gehen, solange es an ist: Matrix hat eine Verbindung
  für alle Chats eines Kontos. Anrufe gehen nie über Tor.
- **Nachrichten von vorher:** Eine Nachricht von bevor Erevos sich anmeldete, oder eine, deren Schlüssel noch nicht
  kam, erscheint gesperrt.
- **Fotos und Dateien:** **Foto** und **Datei** senden sie, bis 50 MB, auf dem Telefon verschlüsselt, bevor sie zum
  Matrix-Server gehen, der so nur behält, was er nicht lesen kann. Ein erhaltenes Foto wird erst geladen, wenn du
  **Foto anzeigen** tippst; **Speichern** legt jede Datei auf dem Telefon ab.
  Tippe auf ein gezeigtes Foto, um es wie im Chat eines Kontakts auf dem ganzen Bildschirm zu sehen: Zwei Finger oder
  zweimal Tippen zoomen hinein, es dreht sich mit dem Telefon, und **Speichern** behält es (siehe Fotos und Dateien
  unter [Chat über ein Relay](#relay)).
- **Sticker:** Ein Sticker, den Element, FluffyChat oder Element X senden, erscheint im Chat; **Sticker anzeigen** holt
  ihn über deinen Matrix-Server. **Sticker** sendet deine eigenen aus Fotos gemachten Sticker (**Meine**) als Bilder,
  verschlüsselt, wo der Chat es ist. Die eingebauten Sätze sind auch da: Jeder Sticker geht als sein Bild, auf deinem
  Gerät gemacht, mit seinen Worten für Apps, die nur diese zeigen.
- **Reaktionen, Antworten, Änderungen und Löschen:** Halte eine Nachricht gedrückt, um ihr Menü zu öffnen: Wähle oben
  eine Reaktion, **Antworten**, um ihr zu antworten, **Kopieren** für ihren Text, und bei einer Nachricht von dir
  **Bearbeiten** oder **Löschen**. Eine Antwort zeigt über ihrem Text die Nachricht, auf die sie antwortet, und ein
  Tippen darauf springt zu dieser Nachricht. Reaktionen stehen unter einer Nachricht; tippe auf eine, um genauso zu
  reagieren, oder auf deine, um sie zurückzunehmen. Sie sind nicht verschlüsselt, wie Element sie sendet, auch in einem
  verschlüsselten Chat: Der Matrix-Server sieht, welche Nachricht welche Reaktion bekam und von wem. Nur du kannst deine
  eigenen Nachrichten ändern, und eine geänderte trägt **Bearbeitet**. **Löschen** nimmt eine Nachricht von dir für alle
  im Chat zurück, wenn du es bestätigst; es lässt sich nicht rückgängig machen, und der Chat behält eine Zeile, die
  sagt, dass sie gelöscht wurde.
- **Mehrere Nachrichten:** **Auswählen** im Menü einer Nachricht wählt sie aus, und ein Tippen fügt weitere hinzu; dann
  **Kopieren**, **Weiterleiten** oder **Löschen**. **Löschen** nimmt sie nach deiner Bestätigung für alle im Chat
  zurück: deine und, wo deine Stufe es erlaubt, die anderer. Es lässt sich nicht rückgängig machen.
- **Dieses Telefon oder alle:** **Löschen**, für eine Nachricht oder mehrere, fragt zuerst: **Dieses Telefon** löscht
  sie nur hier, und sie bleiben verborgen, wenn sie wieder kommen; **Für alle** nimmt sie zurück, wie oben gesagt, und
  wird nur angeboten, wenn jede davon zurückgenommen werden kann.
- **Schreiben:** Wer gerade im Chat schreibt, wie der Matrix-Server es sagt, steht darunter mit **schreibt…**. Erevos
  sagt es von dir nur, wenn du **Sagen, wenn ich schreibe** auf dem Matrix-Bildschirm einschaltest; anfangs ist es
  aus, da es unverschlüsselt über den Matrix-Server geht und der Server so jedes Mal erfährt, wenn du schreibst.
- **Online:** In einem Chat mit einer Person steht unter ihrem Namen **Online**, **Abwesend** oder **Nicht stören**,
  mit den Worten, die sie gesetzt hat, oder wann sie zuletzt online war, wie ihr Matrix-Server es sagt, und ihr Bild
  in der Chatliste hat einen grünen Punkt, solange sie online ist. Manche Server sagen es nicht. Erevos sagt es von
  dir nur, wenn du **Sagen, wenn ich online bin** auf dem Matrix-Bildschirm einschaltest; anfangs ist es aus, da es
  unverschlüsselt über den Matrix-Server geht.
- **Markierungen:** deine Nachrichten zeigen **✓**, sobald der Matrix-Server sie angenommen hat, und **✓✓✓**, sobald
  alle anderen Mitglieder des Chats sie gelesen haben, so wie die Matrix-App jedes Mitglieds es ihrem Server meldet
  (Lesebestätigungen). Matrix kennt keine Markierung für eine Nachricht, die auf einem Telefon angekommen ist, also
  gibt es kein **✓✓**. Halte eine deiner Nachrichten gedrückt und wähle **Wer hat es gelesen**, um zu sehen, wer sie
  gelesen hat und wann und wer nicht (die ersten 100). Eine Matrix-App lässt sich so einstellen, dass sie keine
  Lesebestätigungen sendet: ihr Mitglied steht dann unter denen, die nicht gelesen haben.
- **Profilbilder:** Ein Matrix-Raum, oder die Person in einem Chat mit einer Person, zeigt sein Bild in der Chatliste,
  ebenso ein XMPP-Kontakt. **Foto wählen** auf dem Matrix-Bildschirm setzt deins für deine Kontakte; **Entfernen**
  nimmt es weg. Bilder sind in keiner Matrix- oder XMPP-App verschlüsselt: der Server sieht sie, und deine Kontakte
  sehen deins.
- **Frühere Nachrichten:** Ein Chat mit mehr Verlauf auf dem Matrix-Server zeigt oben **Frühere Nachrichten laden**;
  jedes Tippen holt weitere, und der Chat bleibt dort, wo du gelesen hast. Eine Nachricht, deren Schlüssel noch nicht
  kam, erscheint gesperrt.
- **Sprachnachrichten:** Halte das Mikrofon unter dem Nachrichtenfeld gedrückt, um aufzunehmen, und lass los, um zu
  senden; wische vor dem Loslassen nach links, um die Aufnahme zu verwerfen. Eine Minute ist das Höchste, und ein Druck
  von unter einer Sekunde sendet nichts. Mit TalkBack tippst du einmal, um zu beginnen, und noch einmal, um zu senden.
  In einem verschlüsselten Chat wird sie wie ein Foto verschlüsselt, und Element und andere Matrix-Apps spielen sie als
  Sprachnachricht ab. Eine, die ankommt, spielst du mit **Abspielen** ab; sie wird erst geholt, wenn du sie abspielst.
  Ihre Wellenform geht mit, wie Element sie zeichnet, und eine, die mit Wellenform ankommt, zeigt sie unter
  **Abspielen**, eingefärbt, während sie läuft.
- **Per Emoji prüfen:** In einem Chat mit einer Person zeigt **Per Emoji prüfen** euch beiden sieben Bilder; sind sie
  gleich und in derselben Reihenfolge, tippt auf beiden Telefonen **Stimmen überein**. Dann kann niemand unbemerkt
  dazwischensitzen, und der Chat zeigt **Per Emoji geprüft**. **Dieses Gerät mit einem anderen von dir prüfen**, auf
  dem Matrix-Bildschirm, macht dasselbe mit deinem eigenen Element, damit es dem Gerät von Erevos vertraut. Element
  kann beides auch beginnen.
- **Mit QR-Code prüfen:** Sobald beide Seiten eine Prüfung angenommen haben und beide Apps es können, zeigt die Karte
  einen Code und **Ihren Code fotografieren**. Lass die andere App den hier gezeigten Code fotografieren (in Element:
  **Scannen**) und antworte **Ja, sagt sie**, wenn sie sagt, dass die Prüfung geklappt hat; oder fotografiere den
  Code, den ihre App zeigt. **Stattdessen Emoji vergleichen** geht den anderen Weg. Der Code enthält die Schlüssel der
  beiden Konten (oder Geräte) und ein Einmal-Geheimnis, sodass ein Code von jemandem dazwischen nicht passt. Nichts
  gilt als vertraut, bis beide Seiten fertig gemeldet haben.
- **Sicherheitsschlüssel:** Unter **Sicherheitsschlüssel** auf dem Matrix-Bildschirm gibst du den Sicherheitsschlüssel
  (oder die Sicherheitsphrase) ein, den Element erstellt hat: Frühere Nachrichten öffnen sich aus der Schlüsselsicherung
  des Kontos, neue Schlüssel kommen hinein, und deine anderen Geräte vertrauen diesem. Ein Konto ohne kann hier
  **Sicherheitsschlüssel einrichten**; schreib ihn auf, denn Erevos behält ihn nicht.
- **Anrufe:** Die zwei Kacheln oben im Chat rufen mit Sprache oder mit Video an, mit Element Call, der Anruf-App von
  Element und Element X, die Erevos in sich trägt und in einem eigenen Fenster über der App zeigt: auf Android, in der
  Web-App und auf einem Computer (Windows, macOS und Linux). Der Zurück-Pfeil darin, oder die Esc-Taste, verkleinert das
  Fenster in eine Ecke über Erevos, sodass du Erevos während des Anrufs weiter benutzen kannst; ein Tippen auf das kleine
  Fenster holt es wieder auf volle Größe. Solange der Anruf noch nicht begonnen hat, beendet ihn die Taste
  **Schließen** darunter, falls er nie beginnt. Anrufe an dich klingeln hier wie Erevos' eigene, solange dieser Bereich
  offen ist: **Annehmen** öffnet Element Call im Anruf, **Ablehnen** sagt es der anrufenden Person. Ton und Bild sind
  Ende-zu-Ende-verschlüsselt, mit Schlüsseln, die nur die Leute im Anruf haben, und gehen über den Medienserver
  (LiveKit), den dein Matrix-Server nennt; der sieht die Adresse dieses Geräts. Ein Matrix-Server ohne einen solchen
  kann nicht anrufen. Was Element Call dem Matrix-Server sagt, geht über Erevos, und über Tor wie der Rest von Matrix,
  aber der Anruf selbst geht nie über Tor. Element Call erreicht keinen Tracker. Ältere Matrix-Anrufe zu zweit, wie FluffyChat sie macht, klingeln hier auch (siehe **Älterer Anruf**). Solange ein Matrix-Anruf läuft oder klingelt, klingelt ein anderer Anruf,
  ob von Erevos selbst oder über XMPP, nicht und erscheint als verpasst, und umgekehrt. Auf Android macht „Zurück“
  oder das Verlassen von Erevos das Anrufbild klein, über anderen Apps (Bild im Bild). Auf Sailfish OS gibt es keine
  Matrix-Anrufe.
- **In der Web-App und auf einem Computer:** Der Browser oder der Computer fragt einmal nach Kamera und Mikrofon; auf
  einem Computer darf nur das Anruffenster die Kamera benutzen. Wohin der Ton geht und welches Mikrofon gilt, bestimmen
  der Computer oder der Browser selbst. In der Web-App kommt Element Call von einer zweiten, eigenen Adresse,
  erevos-call.lphl.nekten.eu, auf einem Computer aus einem getrennten Teil der App, und kann so nichts von Erevos lesen:
  weder seine Schlüssel noch seine Chats. Die Web-App prüft die Dateien von Element Call gegen dasselbe signierte
  Release wie die App selbst, bevor sie sie ausführt; darum dauert der erste Anruf in der Web-App einen Moment länger,
  während sie Element Call holt und prüft.
  **Warum:** Den Code von Element Call schreibt nicht Erevos, darum läuft er getrennt von Erevos und kommt dessen
  Schlüsseln und Chats nie nahe.
- **Benachrichtigungen:** Eine Nachricht, die ankommt, zeigt eine Mitteilung und zählt zur Zahl auf dem Symbol von
  Erevos, wie in Erevos’ eigenen Chats, solange dieser Bereich offen ist; auf einem Computer, solange Erevos läuft. Auf
  Android schaltet **Benachrichtigungen** unten in einem Chat ihn stumm oder gibt ihm einen eigenen Ton; ein stummer
  Chat zählt nicht. **Chat-Aussehen** daneben gibt dem Chat ein eigenes Aussehen.
- **Chat-Optionen:** Die Regler-Taste neben dem Schreibfeld, oder **⋯** oben, öffnet sie alle in einer aufgeräumten
  Liste, erreichbar, wie lang der Chat auch ist: **Benachrichtigungen**, **Chat-Aussehen**, die PIN, Bildschirmfotos
  und verschwindende Nachrichten unter **Dieser Chat**, dann Suche, Medien, ein Tag und Export unter **Finden**.
- **Solange dieser Bereich geschlossen ist:** Auf Android lässt **Neue Nachrichten melden** unter **Solange dieser
  Bereich geschlossen ist** auf dem Matrix-Bildschirm diesen Bereich „Neue Nachricht“ sagen, wenn auf Matrix etwas
  kommt, während ein anderer Bereich offen ist, wie seine eigenen Chats mit **Auch, wenn ein anderer Bereich offen
  ist** unter **Einstellungen** → **Benachrichtigungen** → **Im Hintergrund**, was es ebenfalls braucht. Er sagt nie,
  was, von wem oder in welchem Chat, und ein Anruf klingelt dann nicht: Nur der Schlüssel des Bereichs öffnet, was
  kam. Dafür meldet der Matrix-Server dem Relay dieses Bereichs jede Nachricht, ohne ein Wort von ihr, so erfährt der
  Matrix-Server die Adresse des Relays, und das Relay, wann Nachrichten kommen. Aus, bis du es einschaltest; es
  braucht ein dafür aktualisiertes Relay, das der Matrix-Server erreicht.
- **Threads:** Halte eine Nachricht gedrückt und wähle **Im Thread antworten**, um in einem Thread zu antworten. Ein
  Thread öffnet sich auf einem eigenen Bildschirm, und eine Nachricht mit Antworten sagt, wie viele es sind; tippe
  darauf, um den Thread zu öffnen. Apps ohne Threads zeigen die Antworten als einfache Antworten.
- **Umfragen:** **Umfrage** unter dem Nachrichtenfeld stellt eine Frage mit mehreren Optionen. Tippe in der Blase auf
  eine Option, um sie zu wählen, und noch einmal, um sie zurückzunehmen; alle sehen, wer was gewählt hat. Wer eine
  Umfrage erstellt hat, kann sie gedrückt halten und **Umfrage beenden** wählen: danach zählt keine Stimme mehr.
- **Standorte:** **Standort** sendet einmal, wo du bist, wie Element es tut; er geht verschlüsselt wie der Chat und
  zeigt sich auf Android mit **In Karten öffnen**.
- **Linkvorschauen:** Bei eingeschalteten **Linkvorschauen**, wie bei den Chats mit deinen Kontakten, geht der erste
  Link einer Nachricht mit einer Vorschau, die dein Telefon gemacht hat, in einem verschlüsselten Chat ebenfalls
  verschlüsselt. Über Tor nur mit **Über Tor** an bei den **Linkvorschauen**, und nie an einem versteckten Ort.
- **Anheften und Weiterleiten:** **Anheften** im Menü einer Nachricht heftet sie für alle oben im Raum an, wenn der
  Raum es dir erlaubt; eine Leiste über dem Chat zeigt die neueste angeheftete Nachricht, ein Tippen springt dorthin
  und zeigt dann die nächste. **Loslösen** nimmt sie ab. **Weiterleiten** sendet eine Kopie an einen anderen Chat
  dieses Kontos; die Kopie teilt nichts mit dem Original. Ein Chat, der nicht verschlüsselt ist, sagt es neben
  seinem Namen, denn sein Server liest eine Kopie, die dorthin geht.
- **Gruppen finden:** **Eine Gruppe finden** auf dem Matrix-Bildschirm durchsucht die öffentlichen Räume deines
  Matrix-Servers oder eines anderen, den du schreibst, der dann erfährt, wonach du suchst. **Spaces** listet die Räume
  der Spaces auf, in denen du bist, zum Beitreten. **Nachrichten durchsuchen** sucht nur in den Nachrichten auf diesem
  Telefon und fragt niemanden.
- **Favoriten:** Halte einen Chat in der Liste gedrückt für **Zum Favoriten machen** (er steht zuerst), **Niedrige
  Priorität** (er steht zuletzt) und **Verlassen und vergessen**, wodurch auch der Matrix-Server ihn vergisst, sodass
  deine anderen Matrix-Apps ihn nicht mehr zeigen. Sie werden in deinem Konto gespeichert, deine anderen Matrix-Apps
  sortieren also gleich.
- **Ein neues Konto:** Auf dem Anmeldebildschirm erstellt **Neues Konto erstellen** eines auf einem Matrix-Server, der
  das erlaubt, aus Server, Name und Passwort. Wenn der Server es verlangt, bittet Erevos dich, seinen Bedingungen
  zuzustimmen, ein Registrierungs-Token anzugeben oder einen Schritt auf der eigenen Seite des Servers zu tun, etwa
  ein Captcha, das sich im Browser öffnet, nicht über Tor. Ein Server, der eine E-Mail-Adresse verlangt, erstellt
  Konten nur auf seiner Website; erstelle dort eines und melde dich dann hier an.
- **Geräte:** **Geräte** auf dem Matrix-Bildschirm listet die Geräte des Kontos mit dem Zeitpunkt, zu dem jedes
  zuletzt gesehen wurde. **Umbenennen** gibt einem einen neuen Namen. **Die anderen Geräte abmelden** nimmt sie vom
  Konto: Sie verlieren ihre Schlüssel und können Neues nicht mehr lesen. Der Matrix-Server fragt zuerst nach deinem
  Passwort.
- **Ältere Anrufe:** In einem Chat mit einer Person fragen die Anruf-Kacheln nach **Element Call** oder **Älterer
  Anruf**. Der ältere Anruf funktioniert mit FluffyChat, Nheko und Element auf dem Computer und klingelt hier, wenn
  sie anrufen. Seine Signale gehen wie der Chat, in einem verschlüsselten Chat verschlüsselt, über dein Relay, wenn
  der Space eines hat, sonst über das Anruf-Relay deines Matrix-Servers; der Anruf selbst ist verschlüsselt
  (DTLS-SRTP).

**Warum:** Erevos' eigene Chats verbergen, wer mit wem spricht; ein Matrix-Server kann das nicht. Darum bleiben
Matrix-Chats getrennt und markiert, für die Menschen, die du sonst nur über Matrix erreichst.

- **Was eine Nachricht trägt:** Die Zeichen dafür, wie Wörter aussehen, etwa fett und versteckte Wörter, zeigen sich
  wie in einem Erevos-Chat (siehe [Chat über ein Relay](#relay)) und gehen mit der Nachricht, sodass Element sie auch
  zeigt. Von dem, was eine andere App sendet, zeigen sich nur fett, kursiv, durchgestrichen, Code und versteckte
  Wörter: Nichts darin läuft, kein Bild wird geholt, und ein Link zeigt, wohin er wirklich führt. Webadressen lassen
  sich antippen, und Erevos fragt, bevor es eine öffnet. Neben **Foto** und **Datei** gibt es **Kamera**, **Video**,
  **Kontaktkarte** und **Fotoqualität**: Eine Kontaktkarte geht als .vcf-Datei, die jede App öffnet, und eine, die
  kommt, zeigt sich als Karte, sobald du **Zeigen** tippst, mit **Zu Kontakten hinzufügen**; ein Video geht ohne die
  Teile, die sagen, wo es gefilmt wurde oder mit welchem Telefon. Eine Nachricht, die du weiterleitest, ist nur auf
  deinem Telefon als **Weitergeleitet** markiert, sodass die anderen nie erfahren, woher sie kam.
- **Angeheftet, zuletzt und benannt:** Einen Raum anzuheften macht ihn zu deinem Favoriten bei Matrix, sodass deine
  anderen Matrix-Apps ihn auch angeheftet zeigen, und Räume mit niedriger Priorität kommen zuletzt. In der Liste des
  Startbildschirms zeigt deine letzte Nachricht ✓✓✓, sobald alle im Raum sie gelesen haben. **Hier benennen** (eine
  Person) oder **Hier einen Namen geben** (eine Gruppe), unten im Chat, gibt einem Raum einen eigenen Namen, nur auf
  diesem Telefon; niemand erfährt es.
- **Entwürfe:** Was du tippst und nicht sendest, bleibt als Entwurf des Chats, verschlüsselt nur auf diesem Telefon.
  Er kommt zurück, wenn du den Chat wieder öffnest, auch nachdem Erevos geschlossen war, und die Liste des
  Startbildschirms zeigt ihn in der Zeile des Chats als **Entwurf**. Ein Matrix-Thread hat keinen eigenen Entwurf.
- **Später senden:** Halte **Senden** gedrückt, wähle eine Zeit (**In 1 Stunde**, **Heute Abend 20:00**, **Morgen
  09:00** oder einen beliebigen Tag und eine Uhrzeit) und tippe auf **Später senden**. Die Nachricht wartet
  verschlüsselt auf diesem Telefon, gestrichelt nach den Nachrichten des Chats mit ihrer Zeit, und geht zu dieser Zeit
  von diesem Telefon, während Erevos entsperrt ist, auf Android auch im Hintergrund; sonst sobald es wieder entsperrt
  ist. Nur Text. Tippe sie an, um sie jetzt zu senden oder zu löschen. In versteckten Chats geht eine nur, während sie
  offen sind, außer sie empfangen auch geschlossen. Eine, die ein wiederhergestelltes Backup zurückgebracht hat und
  deren Zeit vor der Wiederherstellung lag, geht nicht von selbst: Das Telefon, von dem das Backup kam, hat sie
  vielleicht schon gesendet.
- **Erneut senden:** Eine Nachricht von dir, die **Nicht gesendet** zeigt, hat in ihrem Menü **Erneut senden** und
  **Löschen**.
- **Erinnern:** Das Menü einer Nachricht hat **Erinnern**. Wähle eine Zeit: Die Nachricht geht mit dem Namen ihres
  Chats in **Chat mit mir selbst** und erinnert dich dann. Dafür muss **Erevos** unter [Module](#modules) an sein.
- **Verschwindende Nachrichten:** **Verschwindende Nachrichten**, unter dem Nachrichtenfeld, legt eine Zeit für neue
  Nachrichten fest, gesendete und empfangene: 5 Minuten, 1 Stunde, 1 Tag oder 1 Woche, nachdem jede gesendet wurde.
  Dann gehen sie von diesem Telefon, und deine werden auch für alle im Chat zurückgenommen (ihre Apps zeigen sie als
  gelöscht), oder sobald Erevos wieder läuft. Was die anderen gesendet haben, bleibt bei ihnen. **Verschwinden**,
  neben **Umfrage** und **Standort**, macht es nur für die nächste Nachricht. Nachrichten, die schon im Chat sind,
  bleiben.
- **Blockieren:** **Blockieren**, in einem Chat mit einer Person, setzt sie auf die Ignorierliste deines Kontos:
  Nichts von ihr erreicht dein Matrix-Konto, in keiner seiner Apps, und sie erfährt es nicht. **Blockierte Kontakte**,
  auf dem Matrix-Bildschirm, listet sie auf, mit **Blockierung aufheben**.

## XMPP {#xmpp}

Unter **Einstellungen** → **Relay und Netze** → **XMPP** kann sich ein Bereich bei einem XMPP-Konto anmelden, um mit
Menschen zu chatten, die Conversations, Monal, Gajim, Dino oder eine andere XMPP-App nutzen. Erevos spricht selbst mit
dem XMPP-Server, wie diese Apps: Keine Brücke sitzt dazwischen.

- **Anmelden:** deine XMPP-Adresse, etwa name@example.org, und ihr Passwort. Erevos findet den Server über die
  Adresse; **Server** brauchst du nur, wenn es ihn nicht findet (ein Name, Name:Port oder eine wss://-Adresse). Erevos
  wird ein neues Gerät des Kontos. Anmeldung und Schlüssel des Geräts bleiben verschlüsselt in diesem Bereich, und sind
  in den Backups: Nach einer Wiederherstellung geht das Konto als neues Gerät weiter. Seine versteckten Chats können ein
  eigenes XMPP-Konto haben, siehe [Versteckte Chats](#hidden).
- **Chats:** **Neuer Chat** nimmt die Adresse in deine Kontakte auf, bittet die Person, dich sehen zu lassen, wann sie
  online ist, wie andere XMPP-Apps es tun, und öffnet den Chat. Wer dich hinzufügen möchte, steht oben in der Liste und
  auf dem XMPP-Bildschirm, mit **Annehmen** und **Ablehnen**. Die Kontakte, die das Konto schon hat, stehen unter
  **Kontakte**.
- **Verschlüsselung:** Nachrichten werden mit OMEMO verschlüsselt, für jedes ihrer Geräte und für die anderen Geräte
  deines Kontos, die mitlesen: mit OMEMO 2 für ein Gerät, dessen App es hat, wie Kaidan, und mit Version 0.3, die
  Conversations, Monal, Gajim und Dino sprechen, für die anderen. Es ist Erevos' eigener Code, nicht geprüft, gegen
  andere OMEMO-Bibliotheken getestet. Haben ihre Apps kein OMEMO, sagt Erevos es und schreibt nur, wenn du für diesen
  Chat **Ohne Verschlüsselung schreiben** wählst; **Wieder verschlüsseln** geht zurück.
- **Ihre Schlüssel:** unten im Chat stehen die Fingerabdrücke ihrer Geräte. Vergleiche sie auf einem anderen Weg als dem
  Chat mit dem, was ihre App zeigt. Ein Schlüssel, der sich seit dem ersten Sehen geändert hat, sagt es. Der Schlüssel
  dieses Geräts steht auf dem XMPP-Bildschirm, zweimal: so, wie Apps mit OMEMO 0.3 ihn zeigen, und so, wie Kaidan ihn
  zeigt. Ein Gerät hat in beiden einen Schlüssel, auf zwei Arten geschrieben.
- **Markierungen:** ein Haken beim Senden, zwei, wenn ihre App sie hat, drei, wenn sie gelesen wurde, wie in Erevos'
  eigenen Chats, bei Apps, die diese Markierungen senden.
- **Antworten, ändern, reagieren, löschen:** halte eine Nachricht gedrückt für ihr Menü: **Antworten** beantwortet
  sie, **Bearbeiten** ändert den Text einer von dir, **Löschen** nimmt eine von dir für alle im Chat zurück, und die
  Emoji reagieren darauf; ein Tippen auf eine Reaktion unter einer Nachricht reagiert genauso oder nimmt deine zurück.
  Das klappt mit Apps, die dasselbe können, wie Conversations, Dino, Gajim, Monal und Kaidan es tun; andere Apps
  zeigen eine Antwort mit einem Zitat dessen, worauf sie antwortet, und eine Änderung als neue Nachricht. Der Text
  einer Antwort und einer Änderung ist verschlüsselt wie der Chat, aber welche Nachricht eine Antwort, Änderung,
  Reaktion oder Löschung betrifft, und das Emoji einer Reaktion, gehen so, wie diese Apps sie senden, unverschlüsselt,
  sodass die XMPP-Server sie sehen. In einer Gruppe kann eine Nachricht beantwortet, mit einer Reaktion versehen oder
  gelöscht werden, sobald die Gruppe sie zurückgegeben hat. Ein Tippen auf das Zitat einer Antwort geht zur Nachricht,
  auf die sie antwortet. **Weiterleiten** sendet eine oder mehrere Nachrichten in einen anderen XMPP-Chat. **Für mich
  anheften** hält eine Nachricht oben im Chat, nur auf diesem Telefon. **Auswählen** wählt mehrere Nachrichten zum
  Kopieren, Weiterleiten oder Löschen; **Löschen** nimmt dort nur deine eigenen zurück.
- **Dieses Telefon oder alle:** **Löschen**, für eine Nachricht oder mehrere, fragt zuerst: **Dieses Telefon** löscht
  sie nur hier, und sie bleiben verborgen, wenn sie wieder kommen; **Für alle** nimmt sie zurück, wie oben gesagt, und
  wird nur angeboten, wenn jede davon zurückgenommen werden kann.
- **Schreiben:** wenn die App der anderen Person meldet, dass sie schreibt, erscheint **schreibt…** unter dem Chat.
  Erevos meldet es von dir nur, wenn du **Sagen, wenn ich schreibe** auf dem XMPP-Bildschirm einschaltest, und nur
  einem Kontakt, der deine Anwesenheit sieht, nie in einer Gruppe; anfangs ist es aus, da es unverschlüsselt über den
  XMPP-Server geht und der Server so jedes Mal erfährt, wenn du schreibst.
- **Online:** Unter dem Namen eines Kontakts steht **Online**, **Abwesend** oder **Nicht stören**, mit den Worten, die
  er gesetzt hat, oder wann er zuletzt online war, wie seine Apps es melden, und sein Bild in der Chatliste hat einen
  grünen Punkt, solange er online ist; nur bei einem Kontakt, der dich seine Anwesenheit sehen lässt. Wie in jeder
  XMPP-App sehen die Kontakte, die deine Anwesenheit sehen, wann Erevos verbunden ist; es geht unverschlüsselt über
  die XMPP-Server.
- **Profilbilder:** Ein Matrix-Raum, oder die Person in einem Chat mit einer Person, zeigt sein Bild in der Chatliste,
  ebenso ein XMPP-Kontakt. **Foto wählen** auf dem XMPP-Bildschirm setzt deins für deine Kontakte; **Entfernen** nimmt
  es weg. Bilder sind in keiner Matrix- oder XMPP-App verschlüsselt: der Server sieht sie, und deine Kontakte sehen
  deins.
- **Blockieren:** **Blockieren**, unten in einem Chat, hält Nachrichten, Anrufe und Anfragen dieser Person von deinem
  XMPP-Konto fern, in jeder seiner Apps, wie es der XMPP-Server tut (XEP-0191); sie erfährt es nicht. **Blockierung
  aufheben** lässt sie wieder durch. Wer in einer anderen App des Kontos blockiert wurde, ist auch hier blockiert.
- **Nachrichten von vorher:** Was kam, während Erevos geschlossen war, wird beim Verbinden aus dem Archiv des Servers
  geholt, wenn er eines führt. Eine Nachricht von vor der Anmeldung dieses Geräts oder nicht für es bestimmt erscheint
  gesperrt.
- **Fotos und Dateien:** **Foto** und **Datei** unter dem Nachrichtenfeld senden eine Datei bis 50 MB, oder weniger,
  wenn dein XMPP-Server weniger annimmt, über den Datei-Upload des Servers. In einem verschlüsselten Chat wird sie
  zuerst auf diesem Telefon verschlüsselt, mit einem Schlüssel nur für sie, und der Schlüssel geht in der Nachricht
  mit, mit OMEMO verschlüsselt, sodass der Server nur behält, was er nicht lesen kann; Conversations, Monal, Gajim und
  Dino öffnen sie. In einem Chat ohne Verschlüsselung geht die Datei, wie sie ist. Ein Foto, ein Ton oder eine Datei,
  die ankommt, wird erst geladen, wenn du **Foto anzeigen**, **Abspielen** oder **Speichern** tippst. Auf Android
  gehen Dateien über Tor, wie der Chat.
  Tippe auf ein gezeigtes Foto, um es wie im Chat eines Kontakts auf dem ganzen Bildschirm zu sehen: Zwei Finger oder
  zweimal Tippen zoomen hinein, es dreht sich mit dem Telefon, und **Speichern** behält es (siehe Fotos und Dateien
  unter [Chat über ein Relay](#relay)).
- **Sticker:** **Sticker** sendet deine eigenen aus Fotos gemachten Sticker (**Meine**) als Fotos, verschlüsselt wie der
  Chat; andere XMPP-Apps zeigen sie als Fotos. Die eingebauten Sätze sind auch da: Jeder Sticker geht als sein Bild,
  auf deinem Gerät gemacht. Ein Sticker-Paket, das eine andere App sendet (XEP-0449), wird nicht geholt: Es zeigt seine
  Worte.
- **Sprachnachrichten:** Halte das Mikrofon unter dem Nachrichtenfeld gedrückt, um aufzunehmen, und lass los, um zu
  senden, wie in einem Matrix-Chat. Sie geht als Tondatei, verschlüsselt wie der Chat, so wie Conversations sie sendet.
  Eine Sprachnachricht von Conversations oder einer anderen XMPP-App (eine .m4a- oder .ogg-Datei) erscheint ebenfalls
  als Sprachnachricht, mit **Abspielen** und ihrer Dauer.
- **Gruppen:** Eine **private Gruppe** ist nur für ihre Mitglieder, und jedes sieht, wer die anderen sind. Jede Nachricht
  darin wird mit OMEMO für die Geräte jedes Mitglieds verschlüsselt, wie bei den privaten Gruppen von Conversations,
  sodass die XMPP-Server sie nicht lesen können; was vor deinem Beitritt geschrieben wurde, erscheint gesperrt. Ein
  **Kanal** ist jede andere Gruppe: Er ist nicht verschlüsselt, alle darin und die Server können ihn lesen, und sein
  Bildschirm sagt das. Auf dem XMPP-Bildschirm erstellt **Neue Gruppe** eine private Gruppe auf deinem XMPP-Server aus
  einem Namen und den Kontakten, die du wählst, und **Einer Gruppe beitreten** tritt einer über ihre Adresse bei, etwa
  name@conference.example.org, mit ihrem Passwort, falls sie eines verlangt. Unter einer privaten Gruppe listet
  **Mitglieder** ihre Leute mit ihren Schlüsseln auf, die du wie in einem Chat vergleichen kannst, und vermerkt jeden
  ohne OMEMO-Schlüssel, der Verschlüsseltes nicht lesen kann; ihr Admin kann **Personen hinzufügen**. Ein Kontakt, der
  dich in eine Gruppe einlädt, steht unter **Einladungen in Gruppen**, mit **Beitreten** und **Ablehnen**; die Einladung
  von jemand anderem wird nicht gezeigt. Deine Gruppen folgen den anderen XMPP-Apps deines Kontos über seine
  Lesezeichen: Eine Gruppe, der du dort beitrittst, erscheint auch hier, und **Gruppe verlassen** verlässt sie dort
  ebenfalls. Ein Kanal meldet nur Nachrichten, die deinen Namen nennen. In einer Gruppe stehen **Inhaber** und **Admin**
  bei den Mitgliedern, die es sind, und die **Beschreibung** der Gruppe steht unter ihrem Betreff.
- **Eine Gruppe leiten:** Die Admins einer Gruppe sehen auf ihrem Bildschirm **Die Gruppe leiten**. Sie setzen den
  **Betreff**; der Besitzer kann sie auch **umbenennen**. In einer privaten Gruppe hat jedes Mitglied **Entfernen**
  (die Nachrichten der Gruppe gehen nicht mehr an die Person, ein Admin kann sie wieder hinzufügen) und **Sperren**
  (sie kann nicht wieder beitreten, bis ein Admin es erlaubt); der Besitzer kann ein Mitglied **zum Admin machen**
  oder **als Admin entfernen**. In einem Kanal listet **Die Gruppe leiten** auf, wer drin ist, jeweils mit
  **Entfernen**. Admins können keine anderen Admins entfernen; nur der Besitzer. Der Inhaber setzt auch die
  **Beschreibung** der Gruppe; manche Server erlauben keine, und Erevos sagt das.
- **Anrufe:** Die zwei Kacheln oben im Chat rufen die Person an, mit Sprache oder mit Video, auf demselben
  Anrufbildschirm wie Erevos' eigene Anrufe, und ihre Anrufe klingeln hier genauso, solange dieser Bereich offen ist;
  ein Anruf von jemandem, der nicht in deinen Kontakten ist, zeigt sich nur als verpasst. Es klappt mit Apps, die so
  anrufen wie Conversations (Jingle, geklingelt mit XEP-0353). Der Anruf selbst ist verschlüsselt (DTLS-SRTP), aber der
  Fingerabdruck seines Schlüssels geht so, wie er ist, über die XMPP-Server, nicht Ende-zu-Ende-verschlüsselt, sodass
  sich diese Server dazwischenschalten könnten. Er geht über das Anruf-Relay dieses Bereichs, wenn es eines gibt, sonst
  über den TURN-Server des XMPP-Servers, und nur darüber, sodass die andere Person deine Adresse nicht erfährt; ohne
  beides geht er direkt, und sie erfährt sie. Ein Anruf geht nie über Tor: Das Anruf-Relay oder der TURN-Server sieht
  die Adresse dieses Telefons.
  In einem Sprachanruf kann jeder von euch Video einschalten: **Video dazu** auf dem Anrufbildschirm schaltet deine
  Kamera ein und fragt zuerst die andere Person, die **Nicht jetzt** oder **Video einschalten** wählt. Das Video beginnt
  nur, wenn sie Ja sagt, und ein Nein lässt den Anruf, wie er war. Es funktioniert mit Apps, die Video zu einem Anruf
  hinzufügen wie Conversations.
- **Gruppenanrufe:** In einer privaten Gruppe, in der du bist, starten die zwei Kacheln oben einen Sprach- oder
  Videoanruf in der Gruppe, und ein Anruf, der in einer deiner Gruppen beginnt, klingelt hier, solange dieser Bereich
  offen ist. Während in einer Gruppe ein Anruf läuft, sagen das eine Kachel oben und eine Zeile unter ihrem Namen, und
  ein Tipp auf eines von beiden tritt dem Anruf bei, bis seine letzte Person geht. Es klappt mit Dino, das in Gruppen
  genauso anruft (MUJI): Jeder Anruf hat einen eigenen Raum auf dem Gruppendienst, dem nur die Mitglieder der Gruppe
  beitreten dürfen, und jedes Telefon im Anruf verbindet sich direkt mit jedem anderen, wie in Erevos' eigenen
  Gruppenanrufen, über das Anruf-Relay dieses Bereichs oder den TURN-Server des XMPP-Servers, höchstens acht Personen.
  Wie in einem Anruf mit einer Person ist der Anruf verschlüsselt (DTLS-SRTP), aber die Fingerabdrücke seiner Schlüssel
  und die Einladungen gehen so, wie sie sind, über die XMPP-Server, und der Gruppendienst sieht, wer im Anruf ist und
  wann. Das eigene XMPP-Konto der versteckten Chats ruft in seinen Gruppen genauso an, solange die versteckten Chats
  offen sind; solange sie geschlossen sind, erscheint bei eingeschaltetem **Empfangen, wenn geschlossen** ein Anruf, der
  in einer seiner Gruppen kommt, als verpasst.
- **Nicht anonym:** Der XMPP-Server sieht dein Konto, deine Kontakte, wer mit wem spricht und wann, und ohne Tor auch,
  von wo. Der Server der anderen Person sieht dasselbe von seinen Chats mit dir.
- **Über Tor:** Auf Android wählt der XMPP-Bildschirm, und der vor der Anmeldung, das Tor des Kontos: **Aus** (die
  Voreinstellung: direkt, und der Server sieht deine Adresse), **Wie der Bereich** (wie die Wahl dieses Bereichs unter
  **Einstellungen** → **Relay und Netze** → **Tor** sagt: mit **Nachrichten** über Tor, sobald Tor bereit ist, Dateien
  direkt; mit **Alles** nur über Tor, Dateien auch; mit **Nichts** direkt) oder **Immer über Tor** (nur über Tor, egal
  was der Bereich tut, auch bei der Anmeldung, und nichts geht, solange Tor sich nicht verbinden kann). Seine
  Verbindung, die Suche nach seinem Server und seine Dateien folgen der Wahl; Tor nutzt die Brücken des Bereichs.
  Anrufe gehen nie über Tor, und keine Linkvorschau wird gemacht, solange das Konto nicht direkt gehen darf. Wo Erevos
  keine eigene Verbindung öffnen kann (die Web-App, ein Computer), nutzt es das WebSocket des Servers, direkt, und ein
  Server ohne eines ist nicht erreichbar.
- **Ein Chat über Tor:** **Über Tor** unter einem Chat oder einer Gruppe, aus, bis du es einschaltest, schickt ihn nur
  über Tor. Eine Verbindung zum Server trägt alle Chats des Kontos, also geht, solange ein Chat es an hat, das ganze
  Konto nur über Tor, egal was für das Konto gewählt ist, und der XMPP-Bildschirm sagt es.
- **Benachrichtigungen:** Eine Nachricht, die ankommt, zeigt eine Mitteilung und zählt zur Zahl auf dem Symbol von
  Erevos, wie in Erevos’ eigenen Chats, solange dieser Bereich offen ist; auf einem Computer, solange Erevos läuft. Auf
  Android schaltet **Benachrichtigungen** unten in einem Chat ihn stumm oder gibt ihm einen eigenen Ton; ein stummer
  Chat zählt nicht. **Chat-Aussehen** daneben gibt dem Chat ein eigenes Aussehen.
- **Chat-Optionen:** Die Regler-Taste neben dem Schreibfeld, oder **⋯** oben, öffnet sie alle in einer aufgeräumten
  Liste, erreichbar, wie lang der Chat auch ist: **Benachrichtigungen**, **Chat-Aussehen**, die PIN, Bildschirmfotos
  und verschwindende Nachrichten unter **Dieser Chat**, dann Suche, Medien, ein Tag und Export unter **Finden**.
- **Solange dieser Bereich geschlossen ist:** Auf Android lässt **Neue Nachrichten melden** unter **Solange dieser
  Bereich geschlossen ist** auf dem XMPP-Bildschirm diesen Bereich „Neue Nachricht“ sagen, wenn auf XMPP etwas kommt,
  während ein anderer Bereich offen ist, wie seine eigenen Chats mit **Auch, wenn ein anderer Bereich offen ist** unter
  **Einstellungen** → **Benachrichtigungen** → **Im Hintergrund**, was es ebenfalls braucht. Er sagt nie, was, von wem
  oder in welchem Chat, und ein Anruf klingelt dann nicht: Nur der Schlüssel des Bereichs öffnet, was kam. Dafür meldet
  der XMPP-Server dem Relay dieses Bereichs jede Nachricht, solange keine App des Kontos an ist, so erfährt der
  XMPP-Server den Namen des Relays, und das Relay, wann Nachrichten kommen. Aus, bis du es einschaltest; es braucht ein
  dafür aktualisiertes Relay, das XMPP-Server erreichen (sein Betreiber öffnet dafür einen Port), und einen
  XMPP-Server, der Meldungen an Apps schickt, die nicht laufen, wie die meisten.
- **Ein neues Konto:** Auf dem Anmeldebildschirm erstellt **Neues Konto erstellen** eines auf einem XMPP-Server, der
  das erlaubt (XEP-0077), aus Adresse und Passwort. Ein Server, der ein Captcha verlangt oder Konten nur auf seiner
  Website erstellt, sagt es und nennt seine Seite, wenn er eine hat; erstelle das Konto dort und melde dich dann hier
  an.
- **Passwort und Löschen:** **Konto** auf dem XMPP-Bildschirm hat **Passwort ändern** und **Konto löschen**, das das
  Konto nach zwei Fragen, die zweite nach der Adresse, endgültig vom Server löscht. Erevos vergisst seine Schlüssel;
  die Adresse lässt sich vielleicht nicht neu erstellen.
- **Gruppen finden:** **Eine Gruppe finden** hat **Gruppen auf deinem Server**, die der Server jedem zu finden
  erlaubt, und **Öffentliche Gruppen suchen**, das search.jabber.network fragt: Es erfährt die gesuchten Wörter und
  sieht den Namen deines Servers, dein Server nicht. Eine öffentliche Gruppe ist ein Kanal, nicht verschlüsselt.
- **Standorte:** **Standort** sendet, wo du bist, als geo:-Link, wie Conversations es tut, verschlüsselt wie der Chat;
  einer, der so ankommt, zeigt sich als Standort, auf Android mit **In Karten öffnen**.
- **Linkvorschauen:** In einem Chat ohne Verschlüsselung geht bei eingeschalteten **Linkvorschauen** der erste Link
  mit seiner Vorschau (XEP-0511), und eine, die so ankommt, zeigt sich unter den Worten. Ein verschlüsselter Chat
  sendet keine, da sie den Servern verriete, was der Link ist.

**Warum:** Erevos' eigene Chats verbergen, wer mit wem spricht; ein XMPP-Server kann das nicht. Darum bleiben XMPP-Chats
getrennt und markiert, für die Menschen, die du sonst nur über XMPP erreichst.

- **Was eine Nachricht trägt:** die Zeichen dafür, wie Wörter aussehen, und antippbare Webadressen, wie in einem
  Matrix-Chat, mit **Kamera**, **Video**, **Kontaktkarte** und **Fotoqualität** (siehe [Matrix](#matrix)). In einer
  Gruppe zeigt @ ihre Mitglieder, und ein Tippen schreibt den Namen des Mitglieds in die Gruppe, wie Conversations es
  tut.
- **Ein eigener Name:** **Hier benennen**, unten im Chat eines Kontakts, behält einen eigenen Namen für ihn in deinen
  Kontakten auf deinem XMPP-Server, sodass deine anderen XMPP-Apps ihn auch zeigen. Er erfährt es nicht. Lass es leer,
  um wieder seine Adresse zu zeigen.
- **Entwürfe:** Was du tippst und nicht sendest, bleibt als Entwurf des Chats, verschlüsselt nur auf diesem Telefon.
  Er kommt zurück, wenn du den Chat wieder öffnest, auch nachdem Erevos geschlossen war, und die Liste des
  Startbildschirms zeigt ihn in der Zeile des Chats als **Entwurf**.
- **Später senden:** Halte **Senden** gedrückt, wähle eine Zeit (**In 1 Stunde**, **Heute Abend 20:00**, **Morgen
  09:00** oder einen beliebigen Tag und eine Uhrzeit) und tippe auf **Später senden**. Die Nachricht wartet
  verschlüsselt auf diesem Telefon, gestrichelt nach den Nachrichten des Chats mit ihrer Zeit, und geht zu dieser Zeit
  von diesem Telefon, während Erevos entsperrt ist, auf Android auch im Hintergrund; sonst sobald es wieder entsperrt
  ist. Nur Text. Tippe sie an, um sie jetzt zu senden oder zu löschen. In versteckten Chats geht eine nur, während sie
  offen sind, außer sie empfangen auch geschlossen. Eine, die ein wiederhergestelltes Backup zurückgebracht hat und
  deren Zeit vor der Wiederherstellung lag, geht nicht von selbst: Das Telefon, von dem das Backup kam, hat sie
  vielleicht schon gesendet.
- **Erneut senden:** Eine Nachricht von dir, die **Nicht gesendet** zeigt, hat in ihrem Menü **Erneut senden** und
  **Löschen**.
- **Erinnern:** Das Menü einer Nachricht hat **Erinnern**. Wähle eine Zeit: Die Nachricht geht mit dem Namen ihres
  Chats in **Chat mit mir selbst** und erinnert dich dann. Dafür muss **Erevos** unter [Module](#modules) an sein.
- **Verschwindende Nachrichten:** **Verschwindende Nachrichten**, unter dem Nachrichtenfeld, löscht neue Nachrichten
  so lange nach ihrem Senden von diesem Telefon, und **Verschwinden** macht es nur für die nächste Nachricht. Die
  andere Seite behält sie: XMPP hat keinen Weg, sie dort zu löschen. Nachrichten, die schon hier sind, bleiben.
- **Offline erscheinen:** Unten in einem Chat mit einer Person zeigt dich **Offline erscheinen** ihr als offline, was
  auch immer dein Konto allen anderen zeigt, und sagt ihr nichts davon, was du liest oder tippst, noch dass ihre
  Nachrichten ankamen. Eine gemeinsame Gruppe zeigt dich weiterhin. Es gilt nur für die Verbindung dieses Telefons.
- **Persönlich prüfen:** Unter **Ihre Schlüssel** zeigt **Persönlich prüfen** einen Code deiner Adresse und Schlüssel,
  wie Conversations es tut. Fotografiere dort ihren: Jedes ihrer Geräte, dessen Schlüssel passt, wird als geprüft
  markiert. Ein abweichender Schlüssel markiert nichts und sagt es: Jemand könnte dazwischen sein, oder sie haben ihre
  App gewechselt. Nichts wird gesendet.
- **Blockierte Kontakte:** Der XMPP-Bildschirm listet auf, wen das Konto blockiert, mit **Blockierung aufheben**.

## Chats mit anderen Nostr-Apps {#nostr-chats}

Unter **Einstellungen** → **Relay und Netze** → **Nostr-Chats** kann ein Bereich einen eigenen Nostr-Schlüssel haben, um
zu zweit oder in Gruppen mit Menschen zu chatten, die Damus, Amethyst, Primal, 0xchat oder eine andere Nostr-App nutzen,
die private Nachrichten nach NIP-17 sendet. Das ist nicht [Über Nostr](#nostr), das Erevos' eigene Chats trägt.

- **Der Schlüssel:** **Nostr-Schlüssel erstellen** erstellt einen für diesen Bereich; **Oder einen Schlüssel aus einer
  anderen Nostr-App mitbringen** nimmt das nsec eines Schlüssels, den du schon hast, und liest, was seine Relays noch
  haben. Der Schlüssel und seine Chats werden verschlüsselt in diesem Bereich aufbewahrt, und sind in den Backups: Nach
  einer Wiederherstellung sind sie wieder so, wie sie waren. Seine versteckten Chats können einen eigenen
  Nostr-Schlüssel haben, siehe [Versteckte Chats](#hidden). **Geheimen Schlüssel (nsec) zeigen** zeigt ihn, zum
  Aufschreiben oder für eine andere App: Wer ihn hat, liest diese Chats und schreibt als du.
- **Dein Nostr-Schlüssel:** Gib sein npub den Menschen, die dir schreiben sollen, mit **Kopieren** oder **QR-Code
  zeigen**. **Dein Name** ist, wenn du einen angibst, öffentlich: Andere Nostr-Apps zeigen ihn statt deines npub. Nur der Name ändert sich
  dort: Ein Bild oder Worte, die eine andere App deines Schlüssels in dein Profil gesetzt hat, bleiben.
- **Chats:** **Neuer Chat** nimmt ihr npub (oder nprofile), aus ihrem Profil in ihrer App, oder einen Namen wie
  name@example.org (NIP-05). **Menschen zeigen, denen du folgst**, darunter, listet die Menschen auf, denen dein
  Nostr-Schlüssel folgt (seine öffentliche Folgeliste, auch auf Relays gesucht, die solche Listen sammeln, und auf den
  Relays, auf denen dein Schlüssel schreibt), mit ihren Namen: Tippe eine Person an, um ihr zu schreiben. Findet es
  niemanden, sagt es, warum, wessen Liste es gesucht hat und wie jedes Relay geantwortet hat. Nichts wird geladen,
  bevor du darauf tippst, und es werden keine Profilbilder geladen. Die Chats stehen auch in der Liste auf dem
  Startbildschirm, jeder mit **Nostr** markiert; zeigt der Chip **Nostr** nur sie, und dort öffnet
  **Neuer Chat** diesen Bildschirm. **Hier benennen** gibt einem Chat einen Namen, den nur du siehst.
- **Gruppen:** **Neue Gruppe** erstellt eine aus zwei oder mehr der Menschen, mit denen du chattest, höchstens zwanzig,
  mit einem Namen, wenn du willst. Nostr-Gruppen haben keine Admins: Eine Gruppe sind die Menschen, die ihre Nachrichten
  nennen, jede Nachricht geht an jeden von ihnen, für jeden verschlüsselt, und niemand kann später hinzugefügt oder
  entfernt werden; eine Gruppe mit anderen Menschen ist eine neue Gruppe. **Gruppe benennen** benennt sie für alle um,
  mit deiner nächsten Nachricht. Eine Nachricht, die eine andere App an dich und andere sendet, erscheint ebenfalls als
  Gruppe, jede Nachricht mit ihrem Absender.
- **Fotos und Dateien:** **Foto** und **Datei**, unter dem Nachrichtenfeld eines Chats, senden eine bis 20 MB. Sie wird
  auf diesem Telefon mit einem nur für sie erstellten Schlüssel verschlüsselt (AES-GCM, wie NIP-17 es verlangt) und auf
  einen Blossom-Dateiserver gelegt, der nur behält, was er nicht lesen kann; ihr Schlüssel steht in der Nachricht,
  verschlüsselt wie Nachrichten, und das Hochladen wird von einem nur dafür erstellten Schlüssel signiert, sodass der
  Server nicht erfährt, wem sie gehört. Auf Android gehen Dateien über Tor, wie diese Chats. **Dateiserver** sagt, wohin
  sie gehen, zum ersten, der eine annimmt: blossom.primal.net, blossom.band und nostr.download, wenn du sie nicht
  änderst. Ein Foto oder eine Datei, die ankommt, wird erst geholt, wenn du **Foto anzeigen** oder **Speichern** tippst,
  und öffnet sich nur, wenn sie die gesendete ist.
  Tippe auf ein gezeigtes Foto, um es wie im Chat eines Kontakts auf dem ganzen Bildschirm zu sehen: Zwei Finger oder
  zweimal Tippen zoomen hinein, es dreht sich mit dem Telefon, und **Speichern** behält es (siehe Fotos und Dateien
  unter [Chat über ein Relay](#relay)).
- **Reaktionen:** Halte eine Nachricht gedrückt, um ihr Menü zu öffnen und mit 👍, ❤️, 😂, 😮, 😢 oder 🙏 zu reagieren, oder
  mit einer der weiteren hinter **+**; darunter stehen die Reaktionen, die letzte jeder Person, wie andere Nostr-Apps
  sie senden (NIP-25). Tippe unter einer Nachricht auf eine Reaktion, um dieselbe hinzuzufügen, oder auf deine, um sie
  zurückzunehmen; die Apps der anderen werden gebeten, sie zu entfernen.
- **Antworten:** Wähle im Menü einer gehaltenen Nachricht **Antworten**, um sie zu beantworten. Die Nachricht steht über
  dem Nachrichtenfeld, mit einem ✕, um sie loszulassen, und danach im Chat über deiner Antwort, wo ein Tippen zu ihr
  springt. Auch andere Nostr-Apps zeigen sie als Antwort (NIP-17 kennzeichnet sie als Antwort). Auch ein Foto, eine
  Datei oder eine Sprachnachricht, die du sendest, solange sie dort steht, beantwortet sie. **Kopieren**, im selben
  Menü, übernimmt den Text einer Nachricht.
- **Sprachnachrichten:** Halte das Mikrofon unter dem Nachrichtenfeld gedrückt, um aufzunehmen, und lass los, um zu
  senden; wische vor dem Loslassen nach links, um die Aufnahme zu verwerfen. Eine Minute ist das Höchste, und ein Druck
  von unter einer Sekunde sendet nichts. Sie geht wie eine Datei: auf diesem Telefon verschlüsselt und auf einen
  Dateiserver gelegt, mit ihrer Dauer in der Nachricht; ob eine andere App sie als Sprachnachricht oder als Tondatei
  abspielt, entscheidet diese App. Eine, die mit ihrer Dauer ankommt, spielst du mit **Abspielen** ab; sie wird erst
  geholt, wenn du sie abspielst.
- **Für mich anheften:** hält eine Nachricht oben im Chat, nur auf diesem Telefon; niemand sonst sieht es.
- **Auswählen:** wählt mehrere Nachrichten zum **Kopieren**, zum **Weiterleiten** in einen anderen Nostr-Chat (Fotos und
  Dateien werden neu gesendet) oder zum **Löschen**. Löschen nimmt sie von diesem Telefon und bittet die Apps der
  anderen, auch deine eigenen zu löschen: Ihre Apps tun das vielleicht oder nicht.
- **Dieses Telefon oder alle:** **Löschen** fragt zuerst: **Dieses Telefon** löscht sie nur hier, und sie bleiben
  verborgen, wenn sie wieder kommen; **Für alle** bittet außerdem die Apps der anderen, deine eigenen zu löschen
  (NIP-09), was sie tun können oder nicht.
- **Sticker:** **Sticker** sendet deine eigenen aus Fotos gemachten Sticker (**Meine**) als Fotos, verschlüsselt: Andere
  Nostr-Apps zeigen sie als Fotos. Die eingebauten Sätze sind auch da: Jeder Sticker geht als sein Bild, auf deinem
  Gerät gemacht.
- **Verschlüsselung:** Jede Nachricht wird für sie verschlüsselt und von dir signiert, dann von einem Schlüssel, der nur
  für diese Nachricht erstellt wird, noch einmal verpackt, ihre Zeit um bis zu zwei Tage zurückgesetzt (NIP-17, mit
  NIP-44 und NIP-59). Die Relays sehen, für wen sie ist, nicht wer sie schrieb, wann oder was darin steht. Eine Kopie
  geht an deine eigenen Relays, damit deine anderen Nostr-Apps mit diesem Schlüssel mitlesen. Es ist Erevos' eigener
  Code, nicht geprüft, getestet mit dem Beispiel aus NIP-17 selbst und gegen nostr-tools.
- **Wo deine Nachrichten ankommen:** die Relays, an die andere Apps deine Nachrichten senden: relay.damus.io, nos.lol
  und relay.primal.net, wenn du sie nicht änderst, höchstens drei. Erevos teilt sie anderen Apps mit (eine Liste vom
  kind 10050), wenn sie sich ändern, und einmal pro Woche. Es sendet an die Relays, die die App der anderen Person
  nennt; eine App, die keine nennt, kann noch keine Nachricht bekommen, und Erevos sagt das. Ein aus einer anderen App
  mitgebrachter Schlüssel liest dort, wo diese App angegeben hat, dass deine Nachrichten ankommen (ihre eigene Liste vom
  kind 10050), es sei denn, du hast sie hier geändert, und teilt diese Liste erneut mit, sodass beide Apps dieselben
  Nachrichten bekommen; er liest diese Relays von ihrem Anfang an und holt einmal ab, was die in älteren Listen des
  Schlüssels genannten Relays noch aufbewahren.
- **Alte private Nachrichten:** Viele Apps senden und behalten private Nachrichten noch auf die ältere Art (NIP-04,
  kind 4); Damus und Primal haben sie jahrelang angezeigt. Erevos liest sie auch, alte und neue, und zeigt sie in
  denselben Chats: auf den Relays, wo deine Nachrichten ankommen, und auf bis zu vier weiteren, nämlich denen, die die
  andere App deines Schlüssels liest (ihre Liste vom kind 10002, bei einem aus einer anderen App mitgebrachten
  Schlüssel), sowie relay.damus.io, nos.lol und relay.primal.net. Auch diese Nachrichten sind verschlüsselt, aber die
  Relays sehen, wer wem wann geschrieben hat. Erevos selbst sendet nur auf die Art von NIP-17.
- **Öffentliche Beiträge:** In einem Chat mit einer Person zeigt **Öffentliche Beiträge**, was sie für alle
  veröffentlicht (kind 1), und die Beiträge anderer, die sie weitergeteilt hat, das Neueste zuerst, je dreißig, mit
  **Ältere Beiträge** für mehr. Es ist nur zum Lesen: Von hier aus lässt sich nichts beantworten, mit einer Reaktion
  versehen oder veröffentlichen. Es wird beim Öffnen abgefragt, auf den Relays, die für Abfragen dienen, und auf denen,
  auf die sie laut ihrer Relay-Liste (NIP-65) schreibt, so, wie es die Tor-Wahl dieses Bereichs sagt, und nichts davon
  wird gespeichert. Bilder oder Links werden nicht geöffnet, sondern als Adressen angezeigt, die sich kopieren lassen.
  Ein Beitrag mit Inhaltswarnung zeigt seinen Text nach einem Tipp auf **Zeigen**. Ein Konto, das nur für alle
  veröffentlicht, etwa das eines Projekts, sendet keine privaten Nachrichten: Sein Chat bleibt leer, und seine Beiträge
  sind hier.
- **Der öffentliche Feed:** Auf dem Startbildschirm zeigt der Chip **Öffentlich** einen Feed mit dem, was die Menschen,
  denen dein Nostr-Schlüssel folgt, für alle veröffentlichen, und was sie weitergeteilt haben, und mit den Nachrichten
  der öffentlichen Matrix-Räume, in denen du bist (Räume, denen jeder beitreten darf), das Neueste zuerst, wie in
  Amethyst: das Gesicht dessen, der schrieb, mit einem kleinen **N** oder **M**, der Name, wann, der Text, die Fotos im
  Beitrag (eines in voller Breite, zwei bis vier als Raster) und für den ersten Link eine Karte mit Bild, Seite, Titel
  und einer Zeile. Bei Matrix nennt die Zeile unter dem Namen den Raum und seinen Server; tippe darauf, um den Raum zu
  öffnen. Weitere kommen, wenn du bis zum Ende scrollst, oder mit **Ältere Beiträge**; zieh die Liste nach unten für
  das Neueste (im Browser **Erneut suchen**). Menschen zu folgen geschieht weiter in einer anderen Nostr-App mit
  demselben Schlüssel. Deine Folgeliste, wo die Menschen darin schreiben (ihre NIP-65-Listen) und ihre Beiträge werden
  nur abgefragt, solange der Feed zu sehen ist, auf den Relays, die für Abfragen dienen, auf denen, die Listen
  sammeln, und auf denen, auf die sie schreiben, so, wie es die Tor-Wahl dieses Bereichs sagt; Namen nur für die
  Beiträge, die zu sehen sind. Nichts wird gespeichert.
  **Fotos** über dem Feed ist die Wahl, auf die es für die Privatsphäre ankommt. Ein Foto oder eine Linkkarte kommt von
  dem Server, auf den es der Verfasser des Beitrags gelegt hat, und dieser Server sieht die Adresse, von der es geholt
  wurde, über Tor die eines Tor-Ausgangs, und dass jemand es geöffnet hat. **Immer** zeigt sie sofort, über Tor, wenn
  Tor in diesem Bereich an ist; **Nur über Tor** zeigt sie nur, wenn Tor an ist, sonst beim Antippen; **Beim Antippen**
  holt keines, bevor du es antippst. **Linkvorschau** schaltet die Karten. Solange der Feed nicht zu sehen ist, wird
  nichts geholt, ein Foto wird nur gehalten, solange sein Beitrag zu sehen ist, und keines wird gespeichert; ein Foto,
  das nicht kommt, zeigt **Das Foto zeigen** zum erneuten Versuch. Geholt werden nur Adressen im Internet, nie eine
  dieses Telefons oder deines Heimnetzes.
  Unter einem Nostr-Beitrag: **Antworten** schreibt eine Antwort, **Erneut teilen** zeigt den Beitrag deinen Followern
  (es fragt vorher), das Herz liket ihn, und der Pfeil teilt einen Link dazu. Seine drei Punkte: **Text kopieren**, die
  **Öffentlichen Beiträge** des Verfassers, **Nachricht schreiben** und **Zurückziehen** bei einem eigenen Beitrag.
  Tippe einen Beitrag an, um ihn mit der Zahl der Likes und Weiterteilungen und seinen Antworten zu öffnen. **Neuer
  Beitrag**, der Stift, schreibt einen öffentlichen Beitrag mit bis zu vier Fotos. Antworten, erneutes Teilen, Likes und
  Beiträge sind öffentlich und mit dem Nostr-Schlüssel dieses Bereichs signiert: Jeder kann sie lesen, und sie zeigen,
  dass sie von dir sind; ein Foto, das du hinzufügst, kommt unverschlüsselt auf den Dateiserver des Bereichs, wie es bei
  einem öffentlichen Beitrag sein muss. Unter einer Matrix-Nachricht: **Antworten**, **Reagieren** (eine Auswahl von
  sechs) und Teilen (ein matrix.to-Link), und in ihren drei Punkten **Text kopieren** und **Den Raum öffnen**. Es ist
  immer der Schlüssel und das Konto dieses Bereichs, nie die eigenen der versteckten Chats.
- **Umfragen:** Im öffentlichen Feed erscheint eine Umfrage mit ihren Antworten, zum **Abstimmen** und, solange sie
  offen ist, mit **Ergebnisse**. **Neuer Beitrag** und dann **Umfrage** macht eine: bis zu 10 Antworten, eine oder
  mehrere zur Wahl, offen für 1, 3 oder 7 Tage. Stimmen sind öffentlich: Jeder kann sehen, was du gewählt hast. Eine
  Reaktion von dir unter einem Beitrag nimmst du zurück, indem du erneut darauf tippst.
- **Eigene Emoji:** Im öffentlichen Feed werden die Emoji, die andere Apps machen, geladen wie die Fotos der Beiträge,
  wie **Fotos** und Tor oben sagen. In privaten Chats erscheinen sie als :name: und werden nie geladen.
- **Markierungen:** ein Häkchen, sobald eines ihrer Relays die Nachricht angenommen hat. NIP-17 meldet nichts zurück:
  weder wann ihre App sie hat, noch wann sie sie lesen. Liest du hier einen Chat, erfährt es niemand.
- **Nicht anonym:** Dein Schlüssel ist für alle gleich, denen du schreibst, und wer ein npub hat, kann ihm schreiben.
  Die Relays, bei denen deine Nachrichten ankommen, sehen deinen Schlüssel sie lesen und, ohne Tor, von wo. Nur die
  Verbindung, die deine Relays liest, sagt ihnen, wer liest, wenn ein Relay fragt (NIP-42); Senden und das Nachschlagen
  von Menschen nie.
- **Über Tor:** Auf Android wählt **Tor** auf diesem Bildschirm, wie dieses Nostr-Konto seine Relays und Dateiserver
  erreicht, wie das Konto jedes Netzes: **Aus**, der Standard für einen neuen Schlüssel, direkt; **Wie der Bereich**,
  wie die Wahl des Bereichs unter **Einstellungen** → **Relay und Netze** → **Tor** sagt (mit **Nachrichten** über Tor,
  sobald Tor bereit ist, mit **Alles** nur über Tor); **Immer über Tor**, nur über Tor, dafür gestartet, nie direkt.
  Ein Schlüssel von vor dieser Wahl beginnt auch auf **Aus**. Der Bildschirm sagt, welchen Weg sie gerade nehmen. In
  der Web-App und auf einem Computer gehen sie direkt.
  **Über Tor**, unten in einem Chat, schickt nur diesen Chat ausschließlich über Tor, egal wie der Weg des Bereichs
  ist, auf eigenen Verbindungen, sodass kein Tor-Ausgang seine Nachrichten zusammen mit denen eines anderen Chats
  trägt: was du darin sendest, die Suche, wo sie lesen, und seine Fotos und Dateien; ohne Tor geht nichts davon. Was zu
  dir kommt, folgt weiter dem Weg des Bereichs, da eine Verbindung deine Nachrichten für alle Chats liest. Es bleibt
  nur auf diesem Telefon.
- **Benachrichtigungen:** Eine Nachricht, die ankommt, zeigt eine Mitteilung und zählt zur Zahl auf dem Symbol von
  Erevos, wie in Erevos’ eigenen Chats, solange dieser Bereich offen ist; auf einem Computer, solange Erevos läuft. Auf
  Android schaltet **Benachrichtigungen** unten in einem Chat ihn stumm oder gibt ihm einen eigenen Ton; ein stummer
  Chat zählt nicht. **Chat-Aussehen** daneben gibt dem Chat ein eigenes Aussehen.
- **Chat-Optionen:** Die Regler-Taste neben dem Schreibfeld, oder **⋯** oben, öffnet sie alle in einer aufgeräumten
  Liste, erreichbar, wie lang der Chat auch ist: **Benachrichtigungen**, **Chat-Aussehen**, die PIN, Bildschirmfotos
  und verschwindende Nachrichten unter **Dieser Chat**, dann Suche, Medien, ein Tag und Export unter **Finden**.
- **Noch nicht:** Dateien, die eine andere App anders verschlüsselt (sie erscheinen als Datei, die Erevos nicht öffnen
  kann).

**Warum:** Viele Menschen sind auf Nostr und werden dort bleiben. So schreibst du ihnen aus Erevos, getrennt und
markiert, denn ein Nostr-Schlüssel ist für alle gleich, denen du schreibst, während Erevos' eigene Chats verbergen, wer
mit wem spricht.

- **Was eine Nachricht trägt:** wie in einem Matrix-Chat (siehe [Matrix](#matrix)), und **Standort**, der als
  geo:-Adresse und Kartenlink sendet, wo du bist, was jede Nostr-App zeigen kann; ein so gesendeter Ort zeigt sich als
  Ort. In einer Gruppe zeigt @ ihre Mitglieder, so genannt, dass jede Nostr-App weiß, wer gemeint ist. Eine Nachricht,
  die du weiterleitest, ist nur auf deinem Telefon als **Weitergeleitet** markiert.
- **Entwürfe:** Was du tippst und nicht sendest, bleibt als Entwurf des Chats, verschlüsselt nur auf diesem Telefon.
  Er kommt zurück, wenn du den Chat wieder öffnest, auch nachdem Erevos geschlossen war, und die Liste des
  Startbildschirms zeigt ihn in der Zeile des Chats als **Entwurf**.
- **Später senden:** Halte **Senden** gedrückt, wähle eine Zeit (**In 1 Stunde**, **Heute Abend 20:00**, **Morgen
  09:00** oder einen beliebigen Tag und eine Uhrzeit) und tippe auf **Später senden**. Die Nachricht wartet
  verschlüsselt auf diesem Telefon, gestrichelt nach den Nachrichten des Chats mit ihrer Zeit, und geht zu dieser Zeit
  von diesem Telefon, während Erevos entsperrt ist, auf Android auch im Hintergrund; sonst sobald es wieder entsperrt
  ist. Nur Text. Tippe sie an, um sie jetzt zu senden oder zu löschen. In versteckten Chats geht eine nur, während sie
  offen sind, außer sie empfangen auch geschlossen. Eine, die ein wiederhergestelltes Backup zurückgebracht hat und
  deren Zeit vor der Wiederherstellung lag, geht nicht von selbst: Das Telefon, von dem das Backup kam, hat sie
  vielleicht schon gesendet.
- **Erinnern:** Das Menü einer Nachricht hat **Erinnern**. Wähle eine Zeit: Die Nachricht geht mit dem Namen ihres
  Chats in **Chat mit mir selbst** und erinnert dich dann. Dafür muss **Erevos** unter [Module](#modules) an sein.
- **Verschwindende Nachrichten:** **Verschwindende Nachrichten**, unter dem Nachrichtenfeld, löscht neue Nachrichten,
  gesendete und empfangene, so lange nach ihrem Senden von diesem Telefon. Deine tragen diese Zeit (NIP-40), sodass
  ihre App und die Relays, die sie beachten, sie dann löschen; die anderen behalten sie. **Verschwinden** macht es nur
  für die nächste Nachricht. Eine Nachricht, die mit ihrer eigenen Zeit kommt, geht zu dieser Zeit.
- **Blockieren:** **Blockieren**, unten in einem Chat, verwirft auf diesem Telefon, was dieser Schlüssel sendet,
  ungelesen; es kommt nicht zurück, wenn du die Blockierung aufhebst. Sie erfahren es nicht: Nostr kann niemanden
  daran hindern, dir zu schreiben. **Blockierte Kontakte**, auf dem Bildschirm der Nostr-Chats, listet sie auf, mit
  **Blockierung aufheben**.
- **Persönlich prüfen:** In einem Chat mit einer Person zeigt **Persönlich prüfen** den Code deines Schlüssels.
  Fotografiere den Code, den ihre App zeigt (nostr:npub…): Der Chat wird als geprüft markiert, wenn es der Schlüssel
  dieses Chats ist. Nichts wird gesendet.

## Telegram {#telegram}

Nur in Erevos+, auf Android, kann sich ein Bereich bei deinem Telegram-Konto anmelden und mit Menschen auf Telegram chatten, unter **Einstellungen** → **Relay und Netze** → **Telegram**. Erevos stammt nicht von Telegram und nutzt die Telegram-API. Die Chats kommen in die Liste auf dem Startbildschirm, mit der Markierung **Telegram** und einem eigenen Chip.

- **Anmelden:** tippe auf **Bei Telegram anmelden**, gib deine Telefonnummer mit Landesvorwahl ein und dann den Code, den Telegram sendet: an seine App auf deinen anderen Geräten, per SMS oder per Anruf; **Code erneut senden** fordert ihn neu an. Hat dein Konto ein Passwort für die Bestätigung in zwei Schritten, fragt Erevos danach und zeigt deinen Hinweis. Will Telegram, dass du auf einem anderen Gerät bestätigst, zeigt Erevos den Link, der dort zu öffnen ist. Ein neues Telegram-Konto oder die Anmeldung per E-Mail kann Erevos noch nicht: mach das einmal in der offiziellen Telegram-App. Was Telegram auf diesem Telefon speichert, bleibt in diesem Bereich verschlüsselt.
- **Normale Chats:** Telegram kann sie lesen. Ein gewöhnlicher Telegram-Chat ist nur zwischen dir und den Servern von Telegram verschlüsselt, und Gruppen und Kanäle sind nie Ende-zu-Ende-verschlüsselt. Ein privater Chat sagt es oben: **Telegram kann diesen Chat lesen**.
- **ErevosGram-Verschlüsselung:** in einem privaten Chat sendet die **ErevosGram-Verschlüsselung** der anderen Person eine Einladung. Benutzt sie {=Erevos} oder die ErevosGram-App und tippt auf **Annehmen**, wird der Chat **Ende-zu-Ende-verschlüsselt (ErevosGram)**: was ihr beide schreibt, wird mit Erevos' eigenem Protokoll versiegelt, bevor es zu Telegram kommt, das nur Text sieht, den es nicht lesen kann. Lädt die andere Person dich ein, zeigt der Chat **Sie möchten die ErevosGram-Verschlüsselung**, mit **Annehmen** und **Ablehnen**. Es ist Erevos' eigener Code, nicht geprüft. Was vorher geschrieben wurde, kann Telegram weiter lesen.
- **Sicherheitsnummer:** tippe oben in einem verschlüsselten Chat auf das Schloss, um seine Sicherheitsnummer zu sehen. Vergleiche sie mit der auf ihrem Telefon, auf einem anderen Weg als Telegram, und tippe auf **Als überprüft markieren**, wenn beide gleich sind. Ändern sich ihre Schlüssel, warnt dich der Chat: vergleiche erneut, bevor du ihm vertraust.
- **Anrufe:** In einem privaten Chat startet die Anruftaste oben einen Telegram-Sprachanruf, ein eingehender erscheint über jedem Bildschirm mit **Annehmen** und **Ablehnen**. Den Anruf führt Telegrams eigene Anruftechnik aus, Ende-zu-Ende-verschlüsselt mit Telegrams eigener Anrufverschlüsselung. Vergleiche die vier Emoji auf deinem Bildschirm mit denen auf dem anderen Telefon: Sind sie gleich, hört niemand mit. **Videoanruf** daneben startet einen mit eingeschalteter Kamera; ein Videoanruf klingelt mit **Mit Video annehmen** neben **Annehmen**. In jedem Anruf schaltet **Kamera** deine Kamera ein oder aus, und **Wechseln** wechselt zwischen vorderer und hinterer; das Bild der anderen Person füllt den Bildschirm, solange ihre Kamera an ist.
- **Chats und Einstellungen:** der Telegram-Bildschirm zeigt deine Chats als Zeilen, wie der Startbildschirm, und holt weitere, wenn du nach unten scrollst. **Einstellungen**, neben dem Titel, enthält **Werbung in Kanälen**, **Telegram-Ordner**, die **ErevosGram-Schlüssel** und **Telegram auf diesem Telefon verlassen**; **Chats** dort, oder Zurück, führt zur Liste zurück.
- **Schlüssel aus der ErevosGram-App holen:** auf dem Telegram-Bildschirm **Schlüssel aus der ErevosGram-App holen**. Exportiere in der ErevosGram-App die Schlüssel; das schreibt erevosgram-keys.txt und zeigt einen 20-stelligen Code. Füge die Zeile der Datei in Erevos ein und gib den Code ein. Dort verschlüsselte Chats öffnen sich hier. Nutze die ErevosGram-App danach nicht mehr für diese Chats. Hat dieser Bereich schon ErevosGram-Schlüssel, wird das Ersetzen eigens bestätigt, und bisher hier verschlüsselte Chats lassen sich nicht mehr öffnen.
- **Werbung in Kanälen:** aus, bis du auf dem Telegram-Bildschirm **Werbung in Kanälen** einschaltest. Telegram bittet Apps, seine Werbung in großen öffentlichen Kanälen zu zeigen; eingeschaltet kann ein Kanal oben eine kleine Karte mit **Werbung** zeigen, die du schließen kannst.
- **Ordner:** die Ordner, die du in Telegram erstellt hast, erscheinen auf dem Telegram-Bildschirm als Chips zwischen **Chats** und **Archivieren**. Schalte unter **Telegram-Ordner** die ein, die du willst: jeder erscheint dort und auf dem Startbildschirm als eigener Tab. Sobald ein Ordner an ist, melden nur die Chats in diesen Ordnern Benachrichtigungen. In Telegram bleiben die Ordner, wie sie sind.
- **Chat-Infos:** tippe auf den Namen eines Chats, um zu sehen, wann die Person zuletzt online war, ihren Namen, ihre Nummer und ihre Bio, oder bei einer Gruppe Beschreibung, Mitglieder und Links. Dort kannst du den Chat stummschalten, anheften, archivieren, als gelesen oder ungelesen markieren, in deine Telegram-Ordner legen (Telegram ändert sie auf allen deinen Geräten), neue Nachrichten nach einem Tag, einer Woche oder einem Monat von selbst löschen lassen, die Person blockieren, den Verlauf löschen und den Chat löschen oder die Gruppe bzw. den Kanal verlassen.
- **Fotos und Dateien senden:** **Anhängen** neben **Senden** bietet **Foto**, **Kamera** und **Datei**. Was du getippt hast, geht als Text darunter mit. Die ErevosGram-Verschlüsselung gilt nur für Text: in einem verschlüsselten Chat fragt Erevos vorher nach, weil Telegram Fotos und Dateien lesen kann.
- **Bearbeiten, weiterleiten, suchen:** halte eine eigene Nachricht gedrückt und tippe auf **Bearbeiten**, um ihren Text zu ändern (nicht in einem verschlüsselten Chat), oder halte eine gewöhnliche Nachricht gedrückt und tippe auf **Weiterleiten**, um sie an einen anderen Chat zu schicken. **Suchen** oben in einem Chat durchsucht seine Nachrichten.
- **Sprachnachrichten:** Ist nichts getippt, nimmt das Mikrofon neben **Senden** auf, solange du es hältst; loslassen sendet, nach links wischen bricht ab. Wie eine Datei deckt die ErevosGram-Verschlüsselung sie nicht ab, deshalb fragt Erevos in einem verschlüsselten Chat vorher.
- **Reaktionen:** Halte eine Nachricht gedrückt und tippe auf **Reagieren**, um ein Emoji zu wählen. Die Reaktionen stehen unter der Nachricht; tippe eine an, um deine zu geben oder zurückzunehmen.
- **Umfragen und Sticker:** In einer Gruppe oder einem Kanal fragt **Anhängen** → **Umfrage** nach einer Frage, zwei bis zehn Optionen und ob die Stimmen anonym sind und mehrere Antworten erlaubt sind. Tippe eine Option an, um abzustimmen (**Abstimmen**, wenn mehrere erlaubt sind); **Stimme zurückziehen** nimmt sie zurück, und **Umfrage beenden** im Menü deiner eigenen Umfrage beendet sie. **Anhängen** → **Sticker** sendet einen aus deinen Sticker-Paketen.
- **Threads:** Eine Nachricht mit Antworten zeigt, wie viele; tippe darauf, um sie zu lesen und selbst zu antworten. **Im Thread antworten** im Menü einer Nachricht beginnt oder betritt einen Thread in einer Gruppe oder einem Kanal.
- **Angeheftete Nachricht:** Eine angeheftete Nachricht steht in einer Leiste oben im Chat; tippe darauf, um zu ihr zu springen. **Anheften** und **Loslösen** stehen im Menü der Nachricht; in einem privaten Chat wählst du zwischen **Für beide** und **Nur für mich**.
- **Mehrere Nachrichten:** **Auswählen** im Menü einer Nachricht lässt dich weitere antippen und dann gemeinsam **Kopieren**, **Weiterleiten** oder **Löschen**. Verschlüsselte Nachrichten lassen sich nicht weiterleiten und werden ausgelassen.
- **Mitglieder und Admins:** In einer Gruppe oder einem Kanal listet die Chat-Info die **Mitglieder** auf, mit **Besitzer** oder **Admin** gekennzeichnet; tippe eines an, um ihm zu schreiben. Besitzer und Admins können Titel und Beschreibung **Bearbeiten** und ein Mitglied **Entfernen**.
- **Mehr in Gruppen und Chats:** mit dem Recht, Admins hinzuzufügen, legt **Zum Admin machen** neben einem Mitglied fest, was es darf, und **Rechte** neben einem Admin ändert das oder macht ihn mit **Als Admin entfernen** wieder zum Mitglied. **Mitglied hinzufügen** fügt einen deiner Kontakte hinzu oder jemanden über seinen @Namen; erlauben es seine Privatsphäre-Einstellungen nicht, schick ihm den Einladungslink. **Anhängen** → **Umfrage** kann ein **Quiz** erstellen: tippe auf das Kästchen neben der richtigen Antwort und füge, wenn du magst, eine Erklärung hinzu; sobald jemand antwortet, erscheint die richtige Antwort mit ✅. Bewegte Sticker laufen im Chat. **Anhängen** → **Erevos-Sticker** sendet einen von Erevos' eigenen Stickern; Telegram bekommt ihn als unbewegten Bildsticker. Eine Reaktion mit eigenem Emoji zeigt dessen Bild. Bei mehreren angehefteten Nachrichten zeigt die Leiste oben eine nach der anderen: jedes Tippen springt zu einer und wechselt zur vorherigen. Ein Thread hat **Anhängen**, das Mikrofon und ein Nachrichtenmenü wie ein Chat. Auf dem Startbildschirm, im Telegram-Tab oder einem seiner Ordner, hat das Menü **Alle als gelesen markieren**. Fotos erscheinen von selbst im Chat und GIFs laufen dort; ein Video zeigt sein Bild mit ▶ und seiner Länge, und ein Tippen spielt es bildschirmfüllend ab, mit Ton. Name und Tasten des Chats bleiben oben, während du scrollst. **Mit PIN sperren** in den Infos eines Chats sperrt ihn wie einen Erevos-Chat: Er fragt bei jedem Öffnen nach seiner PIN, und der Startbildschirm zeigt nichts von seinen Worten. **In versteckte Chats verschieben**, ebenfalls dort, behält den Chat in den versteckten Chats, die ihre PIN öffnet: Er verlässt die Listen und Zähler dieses Bereichs und erscheint nur dort; **Zurück in meine Chats verschieben** holt ihn zurück. Telegram selbst hat ihn weiterhin, auf all deinen Geräten. Unter **+** in einem Telegram-Chat sendet **Verstecktes Foto** ein Foto, das unscharf bleibt, bis man darauf tippt; solche Fotos, die du bekommst, erscheinen genauso. **Standort** und **Kontaktkarte** unter **+** senden einen Ort oder einen deiner Kontakte in einen Telegram-Chat, so wie Telegrams eigene Apps sie zeigen; Telegram kann beides lesen, und eine Karte geht nur mit Telefonnummer. **Später senden** unter **+** in einem Telegram-Chat sendet das Getippte zur gewählten Zeit: Telegram behält es und sendet es dann, auch wenn dieses Telefon aus ist, und **gehen später** über dem Nachrichtenfeld listet sie auf, mit **Jetzt senden** und **Löschen**. Nicht in einem Chat mit ErevosGram-Verschlüsselung. In einem Telegram-Chat zeigt die Suchtaste auch seine **Medien, Links und Dateien**: **Fotos**, **Videos**, **Sprachnachrichten**, **Dateien** oder **Links**, jede Art für sich, alle von Telegram und nicht nur die auf diesem Telefon; tippe auf eins, um im Chat dorthin zu gehen. Mit **Linkvorschauen** an in den Einstellungen geht der erste Link einer Nachricht in einem Telegram-Chat mit der Vorschau, die Telegrams Server davon machen, wie in Telegrams eigenen Apps; ankommende Vorschauen erscheinen unter dem Text, ohne ihr Bild, und fragen, bevor sich der Link öffnet. **Bildschirmfotos blockieren** in den Infos eines Telegram-Chats hält ihn auf diesem Telefon, unter Android, aus Bildschirmfotos und der Vorschau der letzten Apps heraus; Telegram kann die andere Seite nicht bitten, dasselbe zu tun. Ein Telegram-Chat, der mit seiner PIN geöffnet oder in versteckten Chats aufbewahrt wird, bleibt ebenfalls draußen, wie ein Erevos-Chat. **Benachrichtigungen** in den Infos eines Telegram-Chats legt auf diesem Telefon einen eigenen Ton und Klingelton fest oder schaltet ihn hier eine Weile stumm, wie bei einem Erevos-Chat; **Benachrichtigungen stummschalten** darüber schaltet ihn in Telegram stumm, auf all deinen Geräten. In einem Telegram-Chat kommt Getipptes, das stehen blieb, beim nächsten Öffnen zurück: Telegram behält es als Entwurf des Chats auf all deinen Geräten, außer in einem Chat mit ErevosGram-Verschlüsselung, wo es nur dieses Telefon behält, solange Erevos läuft. Eine Nachricht, die nicht gesendet werden konnte, hat **Erneut senden** und **Löschen** in ihrem Menü, und die Suchtaste hat **Zu einem Tag**. Halte ein Foto, Video oder eine Datei in einem Telegram-Chat gedrückt und wähle **In der Sammlung speichern**, um dort eine verschlüsselte Kopie zu behalten; eine aus versteckten Chats kommt in deren Sammlung. **Senden an**, aus dem Teilen einer anderen App, listet auch die Telegram-Chats des Bereichs, außer mit PIN gesperrten, in versteckten Chats aufbewahrten oder Kanälen: der Text kommt ins Nachrichtenfeld des Chats, und ein Foto oder eine Datei bis 100 MB geht sofort. In einem Telegram-Chat ist ein @Name antippbar, und ein t.me-Link (eine Person, eine Gruppe oder ein Kanal, eine Nachricht, eine Einladung) öffnet sich in Erevos' Telegram, mit Rückfrage vor dem Beitritt per Einladung; andere Links fragen, bevor sie sich im Browser öffnen. **Tor für dieses Telegram-Konto**, in den Telegram-Einstellungen und schon vor der Anmeldung, hat **Aus** (so ist es zuerst), **Wie der Bereich** und **Immer über Tor**, wie jedes Konto eines anderen Netzes: mit Immer, oder solange der Bereich Alles über Tor schickt, erreicht es Telegram nur über Tor, auf eigenen Kreisen, auch bei der Anmeldung, und nie direkt, auch nicht, wenn Tor keine Verbindung bekommt; das Konto jedes versteckten Ortes wählt für sich. **Über Tor** in den Infos eines Telegram-Chats schickt diesen Chat nur über Tor: Telegram hat eine Verbindung für alle Chats eines Kontos, also geht das ganze Konto über Tor, solange es an ist. Langsamer, und Anrufe gehen nicht über Tor.
- **Nach @Name suchen:** Oben auf dem Telegram-Bildschirm öffnet ein Name im Feld **Nach @Name suchen** den Chat mit dieser Person oder diesem Kanal.
- **Versteckte Chats:** jeder versteckte Ort kann ein eigenes Telegram-Konto haben, das nirgends außerhalb seiner versteckten Chats erscheint. Siehe [Versteckte Chats](#hidden).
- **Verlassen:** **Telegram auf diesem Telefon verlassen**, unten auf dem Telegram-Bildschirm, lässt dich wählen: **Auch bei Telegram abmelden** nimmt dieses Telefon aus deinen Geräten bei Telegram, und **Nur hier vergessen** lässt es dort aufgelistet, bis du es in der Telegram-App entfernst. In beiden Fällen löscht Erevos, was Telegram auf diesem Telefon gespeichert hat, und die ErevosGram-Schlüssel, sodass verschlüsselte Chats nicht mehr lesbar sind.
- **Fotos und Dateien:** ein Foto, eine Sprachnachricht, ein Video oder eine Datei wird nur bei Telegram abgeholt, wenn du es verlangst, und dann gezeigt oder gespeichert. Sprachnachrichten und Videos erscheinen vorerst als Dateien.

## Messenger {#messenger}

Nur in Erevos+, auf Android, kann Erevos sich bei deinem Facebook-Messenger-Konto anmelden und mit Menschen auf Messenger chatten, unter **Einstellungen** → **Relay und Netze** → **Messenger**, oder über seine Karte auf dem Startbildschirm. Erevos spricht selbst mit den Servern von Meta, ohne Brücke dazwischen; es stammt nicht von Meta. Das Konto gehört zum Telefon, nicht zu einem Bereich: seine Chats kommen in die Liste auf dem Startbildschirm des ersten Bereichs, mit der Markierung **Messenger** und einer eigenen Karte. Schalte Messenger unter **Einstellungen** → **Allgemein** → **Module** ein oder aus.

- **Anmelden:** **Bei Messenger anmelden** öffnet die eigene Anmeldeseite von Facebook. Melde dich dort an wie auf facebook.com, mit jedem Code oder jeder Prüfung, die Facebook verlangt, und Erevos behält die Anmeldung verschlüsselt auf diesem Telefon. Beendet Messenger sie später, steht auf dem Messenger-Bildschirm **Messenger bittet dich, dich erneut anzumelden.**
- **Was Meta lesen kann:** unter dem Namen eines Chats sagt Erevos, ob er Ende-zu-Ende-verschlüsselt ist. Meta kann einen Ende-zu-Ende-verschlüsselten Chat nicht lesen, weiß aber, wer mit wem wann spricht; jeden anderen Chat kann Meta lesen.
- **Chats:** der Messenger-Bildschirm zeigt deine Chats, die neuesten zuerst. **Neuer Chat** findet Menschen nach dem Namen: schreibe ihn, tippe auf **Suchen**, dann auf die Person, um zu beginnen.
- **Schreiben:** **+** neben dem Nachrichtenfeld bietet **Foto**, **Kamera**, **Datei** (bis 100 MB) und **Sticker**. Ist nichts geschrieben, nimmt das Mikrofon beim Halten eine Sprachnachricht auf. Halte eine Nachricht für ihr Menü: eine Reaktion, **Antworten**, **Kopieren** und **Löschen**, mit **Für alle löschen** bei deinen eigenen Nachrichten und **Für mich löschen** bei jeder. Antworten, Reaktionen, Änderungen und Löschungen erscheinen, sobald sie kommen. Die Anrufe von Messenger sind nicht in Erevos.
- **Facebook öffnen:** auf dem Messenger-Bildschirm zeigt **Facebook öffnen** die eigene Seite von Facebook mit derselben Anmeldung. Messenger-Links dort führen zurück zu Erevos; andere Links öffnen sich in deinem Browser, ohne die Tracking-Marken von Facebook und nie über Tor, sodass diese Website deine Internetadresse sieht. Bittet der Bildschirm zuerst, dich ab- und wieder anzumelden, tu das einmal: Messenger meldet sich jetzt auf facebook.com an. Facebook hat auch eine eigene Karte im Fenster **Dienste** auf dem Startbildschirm, neben Messenger, die es sofort öffnet. Mit Messenger **In seiner Hülle** gibt es weder Karte noch Knopf: Facebooks Feed ist in der eigenen Leiste der Hülle, und die Karte von Messenger öffnet die Hülle.
- **Messenger in seiner Hülle:** auf dem Messenger-Bildschirm, unter **Wie Messenger hier genutzt wird**, spricht Erevos mit **Durch Erevos** (die Voreinstellung) Messenger selbst, und **In seiner Hülle** zeigt stattdessen Metas eigene Messenger-Seite, wie am Computer, von Erevos eingeschlossen, mit derselben Anmeldung; **Messenger öffnen** öffnet sie. Nur Metas Seiten laden darin, Links nach außen öffnen sich in deinem Browser ohne Facebooks Verfolgungsmarken, und was Metas Seite speichert, bleibt allein in der Hülle, getrennt von jeder anderen Seite, sodass sie dein Telefon wiedererkennt und nicht jedes Mal nach der PIN deiner verschlüsselten Chats fragt; es verschwindet, wenn du dich von Messenger abmeldest oder ein anderes Konto sie öffnet. Anrufe gehen darin, aber nicht über Tor: geht Messenger über Tor, geht die Seite nur über Tor, ohne Anrufe, und Links nach außen öffnen sich nicht. Erevos benachrichtigt dich trotzdem über neue Nachrichten, auch wenn die Hülle nie geöffnet wurde: Ein Chat mit ungelesenen Nachrichten steht auf der Startseite, bis er gelesen ist, und ein Tippen öffnet ihn in der Hülle; solange die Hülle offen ist, benachrichtigt Erevos nicht, da die Seite es zeigt. Chat-Sperren, versteckte Chats und die Sammlung gelten für ihre Chats nicht. Sie schließt sich, sobald der Bereich sich sperrt oder schließt, und mit dem Panikknopf, und sie bleibt aus Bildschirmfotos und der Vorschau der letzten Apps heraus, wann immer Erevos' eigener Bildschirm es tut; ebenso die Facebook-Seite. Sie zeigt sich unter der eigenen Leiste von Erevos, in den Farben von Erevos: **←** führt zurück zu Erevos, und **Facebook** in der Leiste zeigt den Feed von Facebook in derselben Seite, mit **Messenger** zum Zurückkehren. Die Seite ist auf die Breite des Telefons gelegt, sodass sie ohne Vergrößern lesbar ist. Metas Seite selbst nimmt dein ganzes Aussehen an: seine Farben, dunkel oder hell wie Erevos, die Form deiner Blasen, deine Textgröße, die Schrift deines Stils und was hinter deinen Bildschirmen liegt, und ändert sich mit ihm, auch während sie offen ist; ein eigenes Foto bleibt in Erevos, und die Seite zeigt stattdessen einen sanften Verlauf. Wo Meta seine Seite ändert, können Teile davon Metas Aussehen behalten.
- **Benachrichtigungen und Lesen:** neue Nachrichten benachrichtigen dich und zählen am Symbol von Erevos, wie die anderen Chats. Öffnest du einen Chat, gilt er als gelesen und bleibt es, bis jemand wieder schreibt, auch bevor Messenger davon weiß. Jeder Chat hat unter seinem Nachrichtenfeld seine eigenen **Benachrichtigungen**: stumm oder mit einem eigenen Ton.
- **Über Tor:** **Tor für dieses Messenger-Konto**, auf dem Messenger-Bildschirm und auch vor dem Anmelden, ist standardmäßig **Aus**, und die Server von Meta sehen deine Internetadresse; **Wie der Bereich** folgt **Einstellungen** → **Relay und Netze** → **Tor**; **Immer über Tor** schickt das Konto, seine Anmeldung und seine Bilder nur über Tor. **Über Tor** unter einem Chat schickt das ganze Konto über Tor, da Messenger eine Verbindung für alle seine Chats hat. Meta kann ein Konto, das sich über Tor anmeldet, zur Bestätigung auffordern oder eine Weile sperren. Siehe [Wer deine Internetadresse sieht](#ip).
- **Abmelden:** **Auf diesem Telefon von Messenger abmelden** nimmt seine Chats aus Erevos; du kannst dich wieder anmelden. Sicherungen behalten die Benachrichtigungen jedes Chats und die Tor-Wahl, nicht die Anmeldung: melde dich nach einer Wiederherstellung neu an.

## Signal {#signal}

Nur in Erevos+, auf Android, kann Erevos dein Signal-Konto halten und mit Menschen auf Signal chatten, unter **Einstellungen** → **Relay und Netze** → **Signal**, oder über seine Karte auf dem Startbildschirm. Erevos spricht das eigene Protokoll von Signal mit den Servern von Signal, und jeder Chat ist Ende-zu-Ende-verschlüsselt; es stammt nicht von Signal. Das Konto gehört zum Telefon, nicht zu einem Bereich: seine Chats kommen in die Liste auf dem Startbildschirm des ersten Bereichs, mit der Markierung **Signal** und einer eigenen Karte. Schalte Signal unter **Einstellungen** → **Allgemein** → **Module** ein oder aus.

- **Zwei Wege hinein:** **Neues Signal-Konto mit meiner Telefonnummer** macht Erevos zum Signal dieser Nummer, und die Signal-App auf einem anderen Telefon mit derselben Nummer hört dann auf. **Mit Signal auf einem anderen Telefon verknüpfen** lässt dein Signal, wo es ist, und fügt Erevos als eines seiner verknüpften Geräte hinzu.
- **Ein neues Konto:** schreibe deine Nummer mit Landesvorwahl, etwa +49 151…, und wähle, ob der Code per SMS kommt oder, mit **Der Code kommt per Anruf**, per Anruf. Signal bittet dich zuerst, ein Captcha auf seiner eigenen Seite zu lösen. Dann schreibe den Code, den Signal geschickt hat, und den Namen, den andere auf Signal sehen (der Nachname ist optional).
- **Verknüpfen:** auf dem anderen Telefon, in Signal: Einstellungen → Verknüpfte Geräte → Neues Gerät verknüpfen, und den Code scannen, den Erevos zeigt. Neue Nachrichten kommen dann auf beiden an.
- **Chats und Gruppen:** der Signal-Bildschirm zeigt deine Chats und Gruppen, die neuesten zuerst. **Neuer Chat** findet eine Person nach Telefonnummer oder Namen; tippe sie an, um zu beginnen. Die Gruppen, in denen du bist, funktionieren wie Chats; neue Gruppen werden in der Signal-App erstellt.
- **Schreiben:** **+** bietet **Foto**, **Kamera**, **Datei** (bis 100 MB) und **Sticker**; ist nichts geschrieben, halte das Mikrofon für eine Sprachnachricht. Halte eine Nachricht für eine Reaktion, **Antworten**, **Kopieren** und **Löschen**, mit **Für alle löschen** bei deinen eigenen Nachrichten und **Für mich löschen** bei jeder.
- **Anrufe:** in einem Chat mit einer Person rufen **Sprachanruf** und **Videoanruf** sie auf Signal an, Ende-zu-Ende-verschlüsselt. Ein eingehender Signal-Anruf erscheint über jedem Bildschirm, mit **Annehmen**, **Mit Video annehmen** und **Ablehnen**. Anrufe gehen nicht über Tor, und Erevos warnt dich vor jedem.
- **Benachrichtigungen und Lesen:** wie bei Messenger benachrichtigen neue Nachrichten dich und zählen am Symbol, ein hier gelesener Chat bleibt gelesen, und jeder Chat hat seine eigenen **Benachrichtigungen**, mit einem eigenen Klingelton für Anrufe.
- **Über Tor:** **Tor für dieses Signal-Konto**, auch vor dem Anmelden, funktioniert wie bei Messenger: standardmäßig **Aus**, sodass die Server von Signal deine Internetadresse sehen. Mit **Immer über Tor** gehen auch das Registrieren, sein Captcha und das Verknüpfen über Tor. **Über Tor** unter einem Chat schickt das ganze Konto über Tor.
- **Abmelden:** **Auf diesem Telefon von Signal abmelden** nimmt seine Chats aus Erevos. Sicherungen behalten die Benachrichtigungen jedes Chats und die Tor-Wahl, nicht das Konto: registriere oder verknüpfe dich nach einer Wiederherstellung neu.

## Session {#session}

Nur in Erevos+, auf Android, kann Erevos ein Session-Konto halten und mit Menschen auf Session chatten, unter **Einstellungen** → **Relay und Netze** → **Session**, oder über seine Karte auf dem Startbildschirm. Session verlangt weder Telefonnummer noch E-Mail: das Konto sind 13 Wiederherstellungswörter, und seine Nachrichten gehen Ende-zu-Ende-verschlüsselt über das Onion-Routing der Session-Knoten. Erevos stammt nicht von Session. Das Konto gehört zum Telefon, nicht zu einem Bereich: seine Chats kommen in die Liste auf dem Startbildschirm des ersten Bereichs, mit der Markierung **Session** und einer eigenen Karte. Schalte Session unter **Einstellungen** → **Allgemein** → **Module** ein oder aus.

- **Ein neues Konto:** tippe auf **Neues Session-Konto**, schreibe deinen Namen auf Session und tippe auf **Konto erstellen**. Erevos zeigt **Deine 13 Wiederherstellungswörter**: schreib sie auf, bewahre sie sicher auf und tippe auf **Ich habe sie aufgeschrieben**. Sie sind der einzige Weg, das Konto zurückzuholen, und wer sie hat, kann deine Chats lesen.
- **Ein Konto, das du schon hast:** **Ein Konto mit seinen 13 Wörtern zurückholen** nimmt die Wörter, mit Leerzeichen dazwischen, und deinen Namen; tippe dann auf **Zurückholen**.
- **Deine Session-ID:** der Session-Bildschirm zeigt sie, mit **Kopieren**. Andere beginnen damit einen Chat mit dir.
- **Chats:** **Neuer Chat** nimmt eine Session-ID oder einen ONS-Namen, und **Öffnen** beginnt den Chat.
- **Gruppen:** **Neue Session-Gruppe** erstellt eine Gruppe aus einem Namen und den Menschen, die du unter deinen Session-Chats auswählst. Sie bekommen eine Einladung und treten bei, wenn sie sie annehmen, und du bist ihr Admin. In einer Gruppe zeigt ihr Knopf die **Mitglieder**; ein Admin kann **Personen hinzufügen**, die Gruppe **Umbenennen** und jemanden, der kein Admin ist, **Zum Admin machen** oder **Aus der Gruppe entfernen**. **Gruppe verlassen** verlässt sie, und zurückzukommen braucht eine neue Einladung.
- **Schreiben:** **+** bietet **Foto**, **Kamera**, **Datei** (bis 10 MB) und **Sticker**; ist nichts geschrieben, halte das Mikrofon für eine Sprachnachricht. Halte eine Nachricht für eine Reaktion, **Antworten**, **Kopieren** und **Löschen**.
- **Anrufe:** in einem Chat mit einer Person rufen **Sprachanruf** und **Videoanruf** sie auf Session an. Session lässt seine Anrufe selbst klingeln, leise bei einem stummen Chat. Anrufe gehen nicht über Tor, und Erevos warnt dich vor jedem.
- **Benachrichtigungen und Lesen:** wie bei Messenger und Signal, mit den eigenen **Benachrichtigungen** jedes Chats und einem eigenen Klingelton für Anrufe.
- **Über Tor:** **Tor für dieses Session-Konto** funktioniert wie bei Messenger und Signal, standardmäßig **Aus**. Das Onion-Routing von Session hält deine Internetadresse schon vor den Menschen fern, denen du schreibst; der erste Session-Knoten sieht sie, außer das Konto geht über Tor.
- **Abmelden:** **Auf diesem Telefon von Session abmelden** fragt zuerst, denn ohne deine 13 Wiederherstellungswörter kann das Konto nicht zurückkommen. Sicherungen behalten das Konto nicht: hole es nach einer Wiederherstellung mit seinen Wörtern zurück.

## SMS {#sms}

Auf Android kann Erevos die SMS-App des Telefons sein: Tippe unter **Einstellungen** → **Telefon und SMS** → **SMS** →
**Erevos als SMS-App** auf **Erevos zur SMS-App machen**. Der Startbildschirm zeigt dann SMS und Erevos-Chats in einer
Liste.

> **SMS und MMS werden von Erevos nicht verschlüsselt.** Sie reisen wie jede SMS und bleiben im eigenen SMS-Speicher
> von Android, wo jede App, die SMS lesen darf, sie sieht und die Backups von Android sie enthalten. Nur Erevos-Chats
> sind Ende-zu-Ende-verschlüsselt.

- **SMS von vorher:** Nichts zu importieren. Erevos zeigt die SMS und MMS, die schon auf dem Telefon sind, aus dem
  eigenen Speicher von Android, wo sie für jede andere SMS-App bleiben. Android bewahrt sie auf, nicht von Erevos
  versiegelt, wie bei jeder SMS-App.
- **Wenn Erevos nicht zur SMS-App wird:** Android 15 und neuer können das bei einer aus einem Browser installierten App
  zurückhalten. Tippe unter **Einstellungen** → **Telefon und SMS** → **SMS** → **Erevos als SMS-App** auf
  **Standard-Apps öffnen** → **SMS-App** → Erevos. Wenn Android es eine eingeschränkte Einstellung nennt, öffne die
  **App-Info von Erevos**, tippe oben rechts auf **⋮** → **Eingeschränkte Einstellungen zulassen** und wähle Erevos
  erneut.
- **Wenn eine SMS kommt:** Eine Benachrichtigung sagt „New message“, ohne wer sie geschickt hat oder was sie sagt.
  Wenn keine kommt, zeigt **Erevos als SMS-App** **Benachrichtigungen erlauben**, solange Android sie zurückhält.
- **Einmalcodes:** Eine SMS, die sagt, dass sie einen Code enthält (von einer Bank, von einer Anmeldung), in irgendeiner
  der Sprachen der App, bekommt **Code kopieren** darunter im Chat und auch in ihrer Benachrichtigung, ohne dass der
  Code dort erscheint; auf Android 12 und neuer bittet die Taste der Benachrichtigung zuerst darum, das Telefon zu
  entsperren. Nur seine 4 bis 8 Ziffern werden kopiert, nie eine Telefonnummer, ein Betrag, ein Datum oder eine
  Uhrzeit, und Android zeigt keine Vorschau davon. Jede App, die die Zwischenablage liest, kann sie lesen, also füge den
  Code bald ein.
- **Aus der Mitteilung antworten:** **Einstellungen** → **Telefon und SMS** → **SMS** → **Was eine SMS sagt, in
  ihrer Mitteilung**, zuerst aus, zeigt in der Mitteilung einer SMS, wer was geschrieben hat, solange dieser Bereich
  offen ist, mit **Antworten**, das eine einfache SMS über die SIM sendet, auf der sie kam, und **Als gelesen
  markieren**. Wer den Bildschirm sieht, sieht es; gesperrt oder mit einem anderen offenen Bereich sagt die
  Mitteilung wieder nur „Neue Nachricht“, und eine mit Einmalcode immer.
- **Wenn keine SMS erscheinen:** Android 15 und neuer halten die SMS-Berechtigung bei einer aus einem Browser
  installierten App zurück. Tippe unter **Einstellungen** → **Telefon und SMS** → **SMS** → **Erevos als SMS-App** auf
  **SMS erlauben**. Wenn Android es eine eingeschränkte Einstellung nennt, öffne die **App-Info von Erevos**, tippe
  oben rechts auf **⋮** → **Eingeschränkte Einstellungen zulassen** und erlaube SMS unter **Berechtigungen**. Als RCS
  gesendete Chats („Chat“ in Google Messages) bleiben in dieser App und erscheinen nicht.
  **Erevos als SMS-App** sagt, wie viele SMS-Unterhaltungen Erevos liest, oder warum es sie nicht lesen konnte.
- **Jemandem mit {=Erevos} schreiben:** Das geht über Erevos, Ende-zu-Ende-verschlüsselt, sobald seine Nummer mit seinem
  Kontakt verknüpft ist. Verknüpfe sie von Hand in der SMS-Unterhaltung, oder lass eine versteckte Einladung sie
  finden. Ab dann öffnet seine SMS-Unterhaltung seinen Chat.
- **Seine SMS im Chat:** Die SMS und MMS mit seiner Nummer, die von vorher und die, die kommen, erscheinen zwischen den
  Nachrichten des Chats nach Zeit, jede umrandet und als **SMS (nicht verschlüsselt)** markiert, mit ihrem ✓ und ihren
  Fotos. Halte eine gedrückt, um sie zu kopieren, weiterzuleiten oder zu löschen, wie in der SMS-Unterhaltung. Sie
  bleiben in den SMS des Telefons, nie im versiegelten Verlauf des Chats; nur die Unterhaltung mit dieser einen Nummer
  erscheint, keine Gruppen-MMS, und nur, solange Erevos die SMS-App ist oder SMS lesen darf, nie in versteckten Chats.
  Die neuesten erscheinen zuerst: **Frühere SMS zeigen**, über ihnen, holt weitere, und auch die Suche des Chats findet
  sie. Den Chat zu öffnen liest alle seine, auch die früheren, sodass auf dem Startbildschirm keine als ungelesen
  gezählt bleibt. Eine Nummer auf seiner Kontaktkarte macht dasselbe, ohne sie zu verknüpfen.
- **Eine normale SMS an ihn:** zum Beispiel, wenn es kein Internet gibt. **Normale SMS** in den **Details** des Chats
  öffnet seine SMS-Unterhaltung, um sie dort zu schreiben, und **+** → **Als SMS senden**, oder **Als SMS**, wenn du
  den Sendepfeil gedrückt hältst, sendet das Eingegebene als eine, nach einer Rückfrage. Sie erscheint im Chat als SMS.
  Die Telefongesellschaft kann sie lesen. Eine SMS kann weder verschwinden noch auf eine Nachricht antworten: Mit
  eingeschalteter Stoppuhr oder einer Nachricht, auf die geantwortet wird, sagt Erevos das, wenn es fragt.
- **Versteckte Einladungen:** Mit der ersten SMS an eine Nummer, die kein Kontakt ist, sendet {=Erevos} auch eine kurze
  versteckte Einladung. An die Nummer eines Erevos-Kontakts, verknüpft oder auf seiner Kontaktkarte, geht keine. Ein
  Telefon ohne {=Erevos} zeigt nichts; ein Telefon mit {=Erevos} antwortet über das Relay, und die beiden werden Kontakte.
  Von selbst antwortet es nur auf eine Nummer, die es kennt, aus deinen Kontakten oder eine, der du per SMS
  geschrieben hast; bei jeder anderen fragt es zuerst, **Eine Einladung per SMS**, denn der Absender einer SMS kann
  gefälscht sein. Jede Nummer wird höchstens einmal im Monat gefragt, und **Einladungen ausschalten**, unter
  **Einstellungen** → **Telefon und SMS** → **SMS** → **{=Erevos} hinter einer Nummer finden**, beendet sie.

**Warum:** Damit sich zwei Erevos-Telefone allein über eine Telefonnummer finden, ohne einen Server, der Nummern kennt.
Die Einladung ist eine Daten-SMS, die Messaging-Apps nicht anzeigen, also zeigt ein Telefon ohne {=Erevos} nichts.

- **Alle anderen:** eine normale SMS, als SMS markiert. Die Telefongesellschaft kann sie lesen, wie sie jede SMS liest.
- **✓ und ✓✓✓:** Eine SMS von dir zeigt ✓, sobald sie gegangen ist, und ✓✓✓, sobald der Zustellbericht des Netzes
  sagt, dass sie auf dem anderen Telefon angekommen ist, oder „nicht zugestellt“. Manche Telefongesellschaften senden
  keine Zustellberichte; dann bleibt sie bei ✓. SMS können nicht sagen, ob sie gelesen wurden.
- **Fotos, Sprachnachrichten und Kontaktkarten (MMS):** **+** → **Foto** fügt ein Foto hinzu, verkleinert, damit es in
  eine MMS passt (etwa 280 KB), mit nichts darin außer dem Bild. Halte das Mikrofon, wenn nichts getippt ist, um eine
  Sprachnachricht von bis zu einer Minute aufzunehmen, gesendet als MMS in AMR, dem Format, das die Nachrichten-Apps der
  Telefone abspielen. **+** → **Kontaktkarte** sendet einen Kontakt aus den Kontakten des Telefons als vCard, ohne deine
  Notizen dazu oder seine Gruppen, und mit seinem Bild nur, wenn es noch passt. **+** → **Sticker** sendet einen der
  eingebauten Sticker als sein Bild, allein in einer MMS. Fotos, Sprachnachrichten und Kontaktkarten, die ankommen,
  erscheinen in der Unterhaltung, zum Abspielen oder Speichern (**Speichern** öffnet einen neuen Kontakt mit den Angaben
  der Karte). Eine MMS ist so unverschlüsselt wie eine SMS: Der Mobilfunkanbieter kann sie sehen.
- **Videos (MMS):** **+** → **Video aufnehmen** bittet die Kamera-App des Telefons um ein Video in MMS-Qualität, bis
  zu 30 Sekunden kleines Bild, was die meisten Kamera-Apps einhalten; **Video vom Telefon** nimmt nur eines, das
  schon klein genug ist, etwa 280 KB, da Erevos Videos nicht verkleinert. Ein ankommendes Video zeigt ▶ in der
  Unterhaltung, und ein Tippen spielt es in der Video-App des Telefons ab.
- **MMS im Ausland:** Eine MMS wartet beim Anbieter, bis das Telefon sie über mobile Daten abruft, was im Ausland
  kosten kann. **Einstellungen** → **Telefon und SMS** → **SMS** → **MMS** ruft sie sofort ab, aber, solange du es
  nicht einschaltest, nicht beim Roaming: dann zeigt sich eine in ihrer Unterhaltung als **MMS** mit ihrer Größe und
  **Abrufen (kann kosten)**, und auch unter **MMS**, für eine Nummer ohne Unterhaltung. Ganz ausgeschaltet wartet
  jede MMS auf ein Tippen.
- **Wo du bist:** **+** → **Standort** sendet, wo du bist, als SMS mit einer geo:-Adresse und einem OpenStreetMap-Link,
  den jedes Telefon öffnet. Eine geo:-Adresse oder ein Link von OpenStreetMap, Google Maps, Apple Maps oder Waze in
  einer SMS, die ankommt, erscheint als Ort, zum Öffnen in der Karten-App; ein Kurzlink bleibt ein Link, da er geholt
  werden müsste, um den Ort zu kennen.
- **Reaktionen von einem iPhone oder Google Messages:** reagiert jemand ohne Erevos auf eine SMS von dir, schickt
  sein Telefon das als Worte, Liked “Bis um 8” oder Reacted 😂 to “Bis um 8”: Die Unterhaltung zeigt es als 👍 oder 😂
  unter der genannten Nachricht, der letzten mit diesen Worten, und nicht als eigene Nachricht; eine zurückgenommene
  (Removed a like from …) verschwindet. Bisher werden nur englisch geschriebene gelesen; eine, deren Nachricht nicht
  gefunden wird, bleibt, wie sie kam.
- **Für dich angeheftet:** Halte eine Nachricht gedrückt und wähle **Für mich anheften**, um sie über der Unterhaltung
  anzuheften. SMS haben keine Anheftungen: Sie wird nur auf diesem Telefon gespeichert, verschlüsselt mit den SMS-Daten
  des Bereichs, und die andere Person erfährt nie davon.
- **Mehrere Nachrichten:** Halte eine Nachricht gedrückt und wähle **Auswählen**, dann tippe auf weitere: **Kopieren**
  legt sie in einen Text, **Weiterleiten** sendet sie als eine in den Entwurf einer anderen Unterhaltung, und
  **Löschen** löscht sie vom Telefon, mit **Rückgängig** für einige Sekunden.
- **Neue SMS:** Im Bereich **SMS** der Chatliste heißt der Knopf unten **Neue SMS** und öffnet nur das, auch wenn
  Erevos’ eigene Chats an sind.
- **Empfänger wählen:** Tippe unter **Neue SMS** auf **Kontakte**, um aus deinen Kontakten zu wählen, mit Suche, oder
  tippe einfach: Kontakte, die zu Name oder Nummer passen, erscheinen unter dem Feld, und ein Tippen füllt es aus. Ein
  Kontakt mit mehreren Nummern zeigt für jede eine Zeile. Bei einer Gruppe wird jede Wahl zu den vorhandenen Nummern
  hinzugefügt. Es sind die Kontakte des Telefons und, bei entsperrtem Erevos, die nur in Erevos gehaltenen und deine
  Erevos-Kontakte mit Nummer, nie die Namen versteckter Chats. Ist nur die SMS-Ansicht offen, erscheinen nur die
  Kontakte des Telefons. Android fragt vorher, ob Erevos sie lesen darf.
- **Gruppen-MMS:** Gib unter **Einstellungen** → **Telefon und SMS** → **SMS** → **Neue SMS** mehrere Nummern durch
  Kommas getrennt ein und tippe auf **Schreiben**. Jede Nachricht geht an alle als eine MMS, auch reiner Text, und ihre
  Antworten kommen in dieselbe Unterhaltung, jede mit dem, der sie geschrieben hat. Alle darin sehen die Nummern aller,
  und die Telefongesellschaft sieht alles davon.
- **Zwei SIMs:** Die SIM zum Senden erscheint über dem Nachrichtenfeld; tippe einmal auf **SIM wählen**, damit Erevos
  sie sehen kann. Deine Wahl wird für diese Nummer gespeichert; bis dahin antwortet Erevos über die SIM, auf der die
  letzte Nachricht kam. Jede Nachricht zeigt ihre SIM.
- **SMS später:** Halte das runde **Senden** hinter dem Feld gedrückt und wähle eine Zeit, wie in einem Chat. Die SMS
  erscheint am Ende der Unterhaltung als **Geplant** markiert; tippe darauf, um sie abzubrechen. Sie geht zu dieser
  Zeit, auch wenn Erevos geschlossen und gesperrt ist; ist das Telefon dann aus, sobald es wieder an und entsperrt ist.
  Bis dahin ist sie nicht in den SMS des Telefons, wo andere Apps sie sähen, und die Telefongesellschaft hat sie nicht.
  Sie wartet verschlossen mit einem Schlüssel des Telefons selbst (Android Keystore), nicht mit dem Passwort deines
  Bereichs, da Android sie senden muss, während Erevos gesperrt ist: der Schutz, den jede SMS nach dem Senden hat, da
  gesendete SMS in den SMS des Telefons bleiben. Nur Text, an eine Nummer.
- **Links:** Eine Webadresse in einer SMS ist unterstrichen und öffnet sich wie in einem Chat, sobald du sie
  vollständig gesehen hast.
- **Namen aus deinen Kontakten:** Anfangs aus, sodass SMS-Nummern als Nummern erscheinen. **Namen**, über der Liste im Bereich **SMS**,
  schaltet sie frei (wie **Namen aus meinen Kontakten zeigen** unter **Einstellungen** → **Telefon und SMS** → **SMS**
  → **Namen aus deinen Kontakten**): die Namen, die die Kontakte deines Telefons SMS-Nummern geben, und die Bilder, die
  sie für sie haben, oder sonst die deiner nur in Erevos gespeicherten Kontakte, in der Liste und in der Unterhaltung.
  Tippe erneut auf **Namen**, um nur Nummern zu sehen. Erevos liest sie nur, um sie zu zeigen, und behält keine Kopie.
- **Absender mit Namen:** Eine SMS von einem Namen statt einer Nummer, etwa von einer Bank, lässt sich zum Lesen
  öffnen, aber nicht beantworten.
- **Erinnern:** Halte eine Nachricht gedrückt für **Erinnern**: Sie geht mit dem Namen der Unterhaltung in **Chat mit
  mir selbst** und erinnert dich zu der Zeit, die du wählst.
- **Verschwindende Nachrichten:** Mit Erevos als SMS-App löscht **Verschwindende Nachrichten**, unter der Zeile
  **Normale SMS** einer Unterhaltung, ihre neuen SMS so lange nach dem Senden von diesem Telefon, oder sobald Erevos
  wieder läuft. Das andere Telefon behält sie: Eine SMS kann dort nicht gelöscht werden. Nachrichten, die schon hier
  sind, bleiben.

### Verschlüsselte SMS, wenn sonst nichts geht

Wenn Relay, Nostr, die Telefone in der Nähe und LoRa alle versagen, kann ein Text an einen Erevos-Kontakt mit
verknüpfter Nummer stattdessen per SMS gehen, Ende-zu-Ende-verschlüsselt wie jede Erevos-Nachricht. Es ist aus, bis du
es einschaltest: für alle solchen Kontakte unter **Einstellungen** → **Telefon und SMS** → **SMS** → **SMS, wenn sonst
nichts geht** (**Für alle Kontakte einschalten**), oder für einen in den **Details** seines Chats → **SMS, wenn sonst
nichts geht**.

- **Was es kostet:** Jede SMS kostet, was dein Tarif sagt. Ein kurzer Text braucht 3 SMS, ein längerer bis zu 10; im
  Ausland kann eine SMS viel mehr kosten.
- **Was der Mobilfunkanbieter sieht:** welche Nummer welcher geschrieben hat, wann und wie viele SMS, wie bei jeder
  SMS; nie, was geschrieben wurde, denn es geht als dieselbe verschlüsselte Nachricht, die das Relay getragen hätte.
- **Was geht:** nur Texte und Löschungen. Keine Fotos, Dateien, Sprachnachrichten, Anrufe, Reaktionen oder die
  Markierungen, dass eine Nachricht ankam oder gelesen wurde, keine Texte über etwa 800 lateinische Buchstaben (400
  griechische) und nicht die allererste Nachricht an einen neuen Kontakt, die die Schlüssel trägt. Diese warten,
  markiert mit **Wartet**, wie in [Wie Erevos den Weg wählt](#paths). Versteckte Chats gehen nie per SMS.
- **Beide Telefone** brauchen {=Erevos} als SMS-App und die Nummer des Kontakts mit seinem Chat verknüpft. Die SMS sind
  versteckte Daten-SMS für Erevos, die keine SMS-App zeigt, und nichts davon bleibt in den SMS des Telefons.
- **Welchen Weg sie nahm:** Halte die Nachricht gedrückt: Ihr Menü sagt **Per SMS gesendet** oder **Per SMS gekommen**.
  **✓✓** kommt, sobald Relay oder Nostr wieder erreichbar sind: Keine SMS geht von selbst zurück.

**Warum:** SMS erreichen ein Telefon ganz ohne Internet, wo immer es ein Mobilfunknetz gibt. Aber sie kosten Geld und
verraten dem Mobilfunkanbieter, wer mit wem spricht, was Erevos sonst verbirgt; darum ist SMS der letzte Weg, und nur,
wenn du ihn wählst.

> Schalte es nur für die ein, die du so erreichen musst. Der Mobilfunkanbieter und jeder, der seine Aufzeichnungen
> sehen kann, erkennt an diesen SMS, dass eure beiden Nummern miteinander sprechen, und wann.

### Die SMS in Ordnung halten

- **Gedrückt halten:** Halte in der Liste eine SMS-Unterhaltung gedrückt, um zu sehen, was sie kann: **Oben
  anheften**, **Archivieren**, **Als Spam markieren**, **Blockieren** und **Löschen**, und **Zu Kontakten hinzufügen**
  für eine Nummer, die keiner deiner Kontakte ist. In einer Unterhaltung zeigt **⋮** oben dasselbe, dazu als Erstes
  **In diesem Chat suchen**, **Medien, Links und Dateien**, **Zu einem Tag** und **Chat exportieren** (siehe [Erste
  Schritte](#start)), und eine solche Nummer hat **Zu Kontakten hinzufügen** auch unter ihrem Namen: ein neuer Kontakt
  mit der Nummer darin.
- **Angeheftet:** Bis zu 10 SMS-Unterhaltungen bleiben oben in der Liste, mit einer Nadel. **Loslösen** lässt eine an
  ihren Platz zurück.
- **Archivierte Unterhaltungen:** aus der Liste heraus, unter **Archiviert** oben auf dem Startbildschirm. Eine kommt
  von selbst in die Liste zurück, wenn eine neue SMS von dort kommt, oder mit **Aus dem Archiv holen**.
- **Namen für Gruppen-MMS:** Halte eine Gruppen-MMS gedrückt und wähle **Hier einen Namen geben**, um ihr einen
  eigenen Namen zu geben, nur auf diesem Telefon.
- **Eigenes einer Unterhaltung:** Unter ihrer Zeile **Normale SMS** hat eine Unterhaltung **Chat-Aussehen**, wie ein
  Chat, und, mit einer Nummer, **Benachrichtigungen**: Schalte sie für eine Weile oder immer stumm oder gib ihr einen
  eigenen Ton oder keinen. Das gilt, während der Bereich offen ist; ist er geschlossen, benachrichtigt jede SMS so,
  wie es die Einstellungen sagen.
- **Chat-Optionen:** Die Regler-Taste neben dem Schreibfeld, oder **⋯** oben, öffnet sie alle in einer aufgeräumten
  Liste, erreichbar, wie lang der Chat auch ist: **Benachrichtigungen**, **Chat-Aussehen**, die PIN, Bildschirmfotos
  und verschwindende Nachrichten unter **Dieser Chat**, dann Suche, Medien, ein Tag und Export unter **Finden**.
- **Papierkorb:** Eine gelöschte Unterhaltung wartet 30 Tage im **Papierkorb**, dann löscht Erevos sie aus den SMS des
  Telefons. Bis dahin legt **Zurückholen** sie zurück in die Liste; **Jetzt löschen** und **Papierkorb leeren** löschen
  sofort, endgültig. Eine SMS, die kommt, nachdem die Unterhaltung im Papierkorb gelandet ist, erscheint wieder in der
  Liste. Nur die SMS-App darf SMS löschen.
- **Spam:** ein Filter, der nur auf dem Telefon arbeitet, nach Regeln, und nichts irgendwohin sendet. Eine SMS von einer
  Nummer, die kein Kontakt ist und der du nie geantwortet hast, kommt in **Spam**, wenn sie einen Link mit Worten hat,
  die täuschen wollen, etwa ein zurückgehaltenes Paket oder ein Gewinn, oder eines der Worte, die du unter
  **Einstellungen** → **Telefon und SMS** → **SMS** → **Spamfilter** hinzufügst. **Als Spam markieren** und
  **Kein Spam** entscheiden endgültig für eine Nummer. Eine SMS, die die eigenen Worte des Filters fangen (ein Link mit Worten, die täuschen wollen, von einer Telefonnummer, die in keinem Kontakt des Telefons steht und der du nie geantwortet hast), kommt ohne Benachrichtigung und ohne Ton, da das Telefon diese Worte auch kennt; jeder andere Spam, durch deine Wörter, deine Regeln oder aus dem Ausland, zeigt weiter „New message“, da diese Benachrichtigung kommt, bevor Erevos geöffnet wird, und der Rest des Filters verschlüsselt im Bereich bleibt. Eine Nummer, die du als **Kein Spam** markiert hast oder durchlässt, kommt bei solchen Worten auch still, außer sie steht in den Kontakten des Telefons. Mit ausgeschaltetem **Spamfilter** hat jede SMS ihre Benachrichtigung: Das Telefon behält nur, ob der Filter an ist, wie es der zuletzt geöffnete Bereich sagt.
  Jede Unterhaltung in **Spam**, im Ordner und oben in der
  Unterhaltung, sagt, warum sie dort ist: Die Nummer ist blockiert, du hast sie markiert, deine Regel nennt den
  Absender, eine Nummer aus dem Ausland, dein Wort oder ein Link und welche Worte.
- **Ähnlich aussehende Buchstaben:** Eine Betrugs-SMS, die einen Buchstaben gegen einen gleich aussehenden eines anderen Alphabets tauscht, etwa ein kyrillisches а in einem lateinischen Wort, oder ein unsichtbares Zeichen in ein Wort steckt, kommt nicht am Filter vorbei: Er liest die Wörter, wie sie aussehen. Wer sendet, wird nie so verglichen, denn ein Absender, der einem erlaubten ähnlich sieht, ist nicht dieser Absender.
- **Regeln zu Absendern:** Unter **Spamfilter** nimmt **Absender** den Namen eines Absenders, wie Läden und Banken ihn
  senden (Buchstaben, ohne Akzente oder Groß- und Kleinschreibung), oder eine Nummer, wobei \`*\` für alles steht:
  \`+4470*\` ist jede Nummer, die so beginnt, \`1234*\` jede Kurzwahl, die so beginnt, und mit bekannter Landesvorwahl
  ist \`69*\` auch jede Nummer \`+3069...\`. **In den Spam** schickt ihre dorthin; **Durchlassen** hält die Regeln des
  Filters von ihnen fern, etwa von denen deiner Bank oder deiner Familie, wobei eine Nummer, die du als Spam markiert
  oder blockiert hast, trotzdem dorthin kommt. **Nummern aus dem Ausland in den Spam** schickt jede Nummer dorthin, die
  mit einer anderen Landesvorwahl als **Deine Landesvorwahl** geschrieben ist, die Erevos aus den Nummern übernimmt,
  denen du antwortest, und die du ändern kannst. Eine ohne Vorwahl geschriebene Nummer ist von hier. Tippe auf eine
  Regel, um sie zu entfernen.
- **Blockieren:** **Blockieren** im Menü einer Unterhaltung, oder **Einstellungen** → **Telefon und SMS** → **SMS** →
  **Blockierte Nummern**, setzt eine Nummer auf die eigene Liste blockierter Nummern von Android: Android weist ihre
  SMS, MMS und Anrufe ab, und jeder Bereich und die Telefon-App sehen dieselbe Liste. Nur die SMS-App oder die
  Telefon-App darf sie sehen und ändern.
- **Entwürfe:** Was du eingibst und nicht sendest, bleibt bei dieser Unterhaltung, und die Liste zeigt es als
  **Entwurf**. Eine SMS, die nicht gehen konnte, bleibt dort auch als Entwurf.
- **Schnelltexte:** halte das **+** neben dem Feld gedrückt oder wähle darunter **Schnelltexte**, für kurze Worte,
  die du oft schreibst (Ich bin unterwegs, Ich rufe dich später an): Ein Tippen setzt einen ins Feld, um ihn so oder
  mit mehr zu senden. **Hinzufügen** behält einen eigenen, und gedrückt halten entfernt einen; von da an ist die
  Liste deine, verschlüsselt bei den SMS des Bereichs, jeder Bereich seine eigene.
- **SMS zurückholen:** Eine SMS, die du sendest, wartet zuerst 5 Sekunden am Ende der Unterhaltung: Tippe dann darauf,
  um sie zurück ins Nachrichtenfeld zu holen. **Einstellungen** → **Telefon und SMS** → **SMS** → **SMS zurückholen**
  stellt **Aus**, 5 oder 10 Sekunden ein. Wenn du Erevos verlässt, geht sie sofort.
- **Was das Senden kostet:** eine längere SMS zeigt über dem Feld eine Zeile, wie viele Zeichen sie hat und als wie
  viele SMS sie geht: 160 Zeichen in einer SMS oder 153 in jedem Teil einer längeren, aber 70 oder 67, sobald sie
  einen griechischen Kleinbuchstaben, einen Akzent oder ein Emoji hat. **Einstellungen** → **Telefon und SMS** →
  **SMS** → **Ohne Akzente (günstiger)** sendet eine einfache SMS ohne Akzente und Griechisch in Großbuchstaben, wie
  alte Telefone es schrieben (ΚΑΛΗΜΕΡΑ), sodass sie wieder 160 fasst; keine mit Emoji und keine MMS.
- **Erneut senden:** Eine von dir, die nicht gegangen ist oder nicht zugestellt wurde, sagt das: Tippe darauf, um sie
  erneut zu senden. Halte eine beliebige Nachricht gedrückt für **Weiterleiten**, **Erneut senden** und **Löschen**,
  mit ihren Worten zum Auswählen und Kopieren; eine gelöschte Nachricht hat auch **Rückgängig**.
- **Weiterleiten:** Halte eine Nachricht gedrückt → **Weiterleiten**, gib dann eine Nummer ein und tippe auf
  **Schreiben**, oder wähle einen Kontakt unter **In einen Erevos-Chat**. Sie öffnet sich in dieser Unterhaltung, um
  sie dort zu lesen und zu senden. An eine Nummer geht auch ihr Bild mit, als MMS; in einen Chat nur ihre Worte.
- **Jeder Bereich für sich:** Anheftungen, archivierte Unterhaltungen, der Papierkorb, Spam-Markierungen und Entwürfe
  gehören zum Bereich, versiegelt mit seinem Passwort. Die SMS selbst bleiben in den SMS des Telefons: Ein anderer
  Bereich sieht sie, wie sie sind, und eine, die hier im Papierkorb ist, erscheint dort, bis sie vom Telefon gelöscht
  wird.

### Auf deinen verknüpften Geräten

Die SMS des Telefons können auch auf den [verknüpften Geräten](#devices) dieses Bereichs erscheinen: einem Computer,
einem Browser, einem Tablet. Dort liest du sie und antwortest, und das Telefon sendet die Antwort als SMS. Es ist aus,
bis du es einschaltest, auf dem Telefon: **Einstellungen** → **Telefon und SMS** → **SMS** → **Auch auf meinen
verknüpften Geräten** → **Meine SMS auch an meine Geräte senden**.

- **Was geht:** die letzten 50 Unterhaltungen der Liste und von **Archiviert**, jede mit ihren letzten 50 Nachrichten,
  Ende-zu-Ende-verschlüsselt wie alles, was die Geräte teilen. Ältere, die im **Papierkorb** und im **Spam** sowie die
  Fotos bleiben auf dem Telefon: Eine Nachricht mit Foto sagt **📷 Ein Foto, auf dem Telefon**. Namen gehen nur, solange
  das Telefon sie zeigt (**Namen aus deinen Kontakten**).
- **Antworten:** Was du auf einem Gerät schreibst, erscheint als „wird gesendet“, bis das Telefon es gesendet hat, mit
  der SIM, die es für diese Nummer nutzt, und gehört dann zu den eigenen des Telefons. Eine, die das Telefon nicht
  senden konnte, sagt das: Tippe darauf, um sie erneut zu senden. Das Telefon sendet jede nur einmal und höchstens 60
  pro Stunde von den Geräten, damit ein verlorenes Gerät keine Flut an SMS senden kann; eine, die länger als einen Tag
  gewartet hat, geht nicht.
- **Gelesen:** Eine Unterhaltung, die auf einem Gerät gelesen wurde, ist auch auf dem Telefon als gelesen markiert.
- **Hinweise:** Eine neue SMS gibt auch auf dem Gerät einen Hinweis, wie dessen Benachrichtigungseinstellungen es
  sagen.
- **Über das Telefon:** Die SMS kommen und gehen nur, solange dieser Bereich auf dem Telefon geöffnet ist, wie alles,
  was über das Telefon geht. Auf einem Gerät sind die Bildschirme die des Telefons, ohne das, was nur das Telefon kann:
  Löschen, Blockieren, später Senden, Fotos und Einladungen.
- **Jeder Bereich für sich:** Der Schalter gehört zum Bereich. Ein Bereich versteckter Chats sendet die SMS nie an
  Geräte.
- **Aus:** **SMS auf meinen Geräten beenden** nimmt sie auf dem Telefon von jedem Gerät.

**Warum:** Nur das Telefon hat eine SIM, also sendet und empfängt nur das Telefon SMS. Die Geräte sehen sie über das
Telefon, Ende-zu-Ende-verschlüsselt wie der Rest, und der Mobilfunkanbieter sieht nicht mehr als zuvor.

## Telefon {#phone}

Auf Android kann Erevos die Telefon-App des Telefons sein: Tippe unter **Telefon** im Menü auf **Einstellungen** →
**Erevos zur Telefon-App machen**. Jeder Anruf erscheint dann auf dem eigenen Anrufbildschirm von Erevos, und tel:-Links
und die Anruftaste des Telefons öffnen die Wähltasten von Erevos. **Telefon** öffnet sich auch über den Hörer oben auf
dem Startbildschirm und hat ein eigenes Symbol in den Apps des Telefons, **Telefon**, grün mit einem Hörer auf dem
Zeichen von Erevos, das die Wähltasten öffnet. Jedes davon, wie ein tel:-Link,
öffnet es, sobald Erevos entsperrt ist: mit Passwort, nachdem du es eingegeben hast, außer das Telefon öffnet sich ohne
(siehe „Das Passwort von Erevos“ weiter unten). Bis dahin sagt eine Karte oben **Erevos ist nicht die Telefon-App**;
auf einem kleinen Telefon zeigt sie nur diesen Titel, und ein Tippen darauf öffnet die **Einstellungen** des Telefons.

- **Notrufe:** Eine Notrufnummer (112 oder die deines Landes) wird sofort gewählt, ohne nach der SIM zu fragen:
  Android wählt sie. Ist Erevos gesperrt und das Telefon hinter dem Passwort, öffnet **Notruf** auf dem
  Passwortbildschirm die Notruftastatur von Android, ohne Passwort.
- **Kontakte durchsuchen:** Gib oben im Telefon einen Namen, eine Nummer oder einen Teil davon ein: Die Kontakte mit
  einer Nummer erscheinen statt der Tabs, jede Nummer in einer eigenen Zeile. Tippe auf eine, um sie anzurufen, oder
  halte sie gedrückt, um sie auf die Wähltasten zu legen. Es sucht in den Kontakten des Telefons und, bei entsperrtem
  Erevos, in den nur in Erevos gespeicherten und deinen Erevos-Kontakten mit Nummer; nie in versteckten Chats.
- **Kontakte beim Wählen:** Während du auf den **Wähltasten** tippst, stehen die Kontakte, die sie finden, in einer Liste
  über der Nummer: einer, dessen Nummer die getippten Ziffern enthält, oder dessen Name mit ihnen auf den Buchstaben der
  Tasten beginnt, wie 2 für ABC (und ΑΒΓ). Jede Taste zeigt ihre Buchstaben in der Sprache der App. Tippe einen Kontakt
  an, um ihn anzurufen, oder halte ihn, um seine Nummer auf die Tasten zu legen. Auf einem kleinen Bildschirm, wo über der
  Nummer kein Platz ist, zeigt sich der erste über den Tasten, und **weitere** daneben listet die anderen.
- **Der Anrufbildschirm:** wer anruft oder wen du anrufst, mit dem Namen und Foto, das die Kontakte deines Telefons
  ihm geben; solange Erevos entsperrt ist, zeigt eine mit einem deiner Erevos-Kontakte verknüpfte Nummer den Namen,
  den du ihm gegeben hast, und ebenso die Nummer eines nur in Erevos gespeicherten Kontakts; die eines Kontakts offener
  versteckter Chats nur, solange sie offen sind. Er erscheint über dem
  Sperrbildschirm und braucht kein Passwort, da ein Anruf bei gesperrtem Erevos angenommen werden muss. Ein
  eingehender Anruf zeigt **Answer**, **Decline** und **Message**, und Android klingelt mit dem eigenen Klingelton des
  Kontakts; die Lautstärketasten machen ihn leise. Im Anruf: **Mute**, **Keypad** für die Töne, nach denen ein Menü
  fragt, **Speaker**, **Hold**, **Add call** und **End**. Am Ohr geht der Bildschirm aus.
- **Wohin der Ton geht:** Mit einem Bluetooth-Gerät oder einem Headset nennt die Taste neben **Keypad**, wohin der Ton
  geht, und ein Tippen lässt dich wählen: das Telefon, der Lautsprecher, das Headset oder das Bluetooth-Gerät.
- **Ein zweiter Anruf:** Einer, der während eines Anrufs kommt, zeigt **Hold and answer**, **End and answer** und
  **Decline**. Mit einem gehaltenen Anruf sagt es die Zeile unter dem Namen: Tippe darauf, oder auf **Swap**, um mit
  dem anderen zu sprechen. **Merge** legt die beiden zu einem Anruf zusammen, wenn deine Telefongesellschaft es
  erlaubt.
- **Eine Konferenz:** Sind Anrufe zusammengeführt, listet der Anrufbildschirm statt des Fotos die Personen darin.
  Neben jeder spricht **Einzeln** allein mit ihr, während die anderen in der Warteschleife warten, und **Auflegen**
  nimmt nur sie heraus; beides erscheint nur, wo dein Anbieter es erlaubt.
- **Videoanrufe über deinen Anbieter:** Wo deine SIM und dein Netz sie unterstützen (ViLTE, über 4G oder 5G), zeigt
  ein ankommender Videoanruf **Mit Video annehmen** und **Nur Ton**; im Anruf erscheint die andere Seite
  bildschirmfüllend und deine Kamera in einer Ecke, mit **Kamera aus** und **Kamera wechseln**. Ein Anruf ohne Video
  zeigt **Video**, wenn beide Seiten es können, und fragt die andere Seite danach, fragt Erevos dich: **Video
  einschalten** oder **Nur Ton behalten**. Um einen zu beginnen, tippe die Nummer und dann **⋯** → **Videoanruf**.
  Android fragt einmal nach der Kamera. Wie jeden Telefonanruf trägt ihn der Anbieter und kann ihn sehen; nichts
  davon erscheint, wo das Netz keine Videoanrufe hat.
- **Mit einer Nachricht ablehnen:** **Message**, bei einem klingelnden Anruf, lehnt ihn mit einer Schnellantwort ab,
  oder mit einer, die du schreibst, die dein Telefon dem Anrufer als SMS schickt; sie erscheint zwischen deinen SMS.
  Unter **Telefon** → **Einstellungen** ändert **Schnellantworten** sie: **Antwort hinzufügen**, **Entfernen**,
  **Speichern** und **Die üblichen Antworten nutzen**. Sie werden auf dem Telefon aufbewahrt, nicht versiegelt, da der
  Anrufbildschirm sie bei gesperrtem Erevos zeigt.
- **Die Wähltasten:** Gib unter **Telefon** eine Nummer ein und tippe auf **Anrufen**; halte **0** für +. Gedrückt
  gehalten, fügt das Nummernfeld eine ein. **Add call**, während eines Anrufs, öffnet sie, sobald Erevos entsperrt ist.
- **Mailbox:** Halte bei leerer Wähltastatur die **1** (mit oo markiert), um deine Mailbox anzurufen, über die SIM,
  die über **Anrufen** gewählt ist. Hat die SIM keine Mailbox-Nummer, sagt es das Telefon: Dein Anbieter gibt sie
  dir. Wo dein Anbieter Sprachnachrichten als Aufnahmen schickt (visuelle Mailbox), steht **Mailbox** neben
  **Favoriten**: jede Nachricht mit dem, der sie hinterließ, wann, wie lang, und ihren Worten, wenn sie kamen. **▶**
  spielt sie ab, **■** hält sie an; ein Tippen auf die Zeile bietet **Zurückrufen**, **SMS senden** und
  **Sprachnachricht löschen**. **Mailbox anrufen** oben ruft sie an. Erevos spielt sie aus dem Speicher von Android
  ab und behält keine Kopie; bei gesperrtem Erevos erscheint der Tab nicht.
- **Kurzwahl:** Halte bei leerer Wähltastatur eine Taste von 2 bis 9, um ihre Nummer anzurufen. Eine Taste ohne Nummer
  lässt dich eine wählen: Gib einen Namen oder eine Nummer ein und tippe auf den Kontakt, oder nimm die getippte
  Nummer mit **verwenden**. Unter **Telefon** → **Einstellungen** zeigt **Kurzwahl** die acht Tasten; tippe auf eine,
  um sie zu ändern oder zu leeren. Die Kurzwahl wird verschlüsselt im Bereich aufbewahrt und funktioniert bei
  entsperrtem Erevos. Solange das Telefon ohne Passwort öffnet, lässt **Kurzwahl auch bei gesperrtem Erevos** (anfangs
  aus) sie auch dort funktionieren: Eine Kopie der Nummern, ohne Namen, liegt dann auf dem Handy außerhalb des
  Bereichs, und wer das entsperrte Handy hält, kann sie anrufen. Immer nur ein Bereich. Sie kann zeigen, dass es den
  Bereich gibt: Wer einen anderen Bereich von dir sieht, findet, dass die Tasten Nummern anrufen, die nicht zu jenem
  Bereich gehören. Die Kopie wird gelöscht, wenn das Telefon wieder hinter das Passwort kommt, wenn ein Backup
  wiederhergestellt wird, wenn die Sperre ausgeschaltet wird und wenn ein zweites Passwort entfernt oder neu
  festgelegt wird, während ein anderer Bereich offen ist; schalte sie dann wieder ein.
- **Anrufeinstellungen:** Unter **Telefon** → **Einstellungen** öffnen die **Anrufeinstellungen** die eigenen
  Bildschirme von Android für das, was dein Anbieter von den Anrufen jeder SIM verwaltet: **Umleitung, Anklopfen und
  deine Nummer** und **Mailbox-Nummer**; bei zwei SIMs tippe zuerst die SIM an. Unter **Deinen Anbieter fragen**
  wählt jede Taste den Code des Netzes (**Prüfen** der Rufumleitung \`*#21#\`, **Alles ausschalten** \`##002#\`;
  Anklopfen \`*#43#\`, **An** \`*43#\`, **Aus** \`#43#\`; Anzeigen deiner Nummer \`*#31#\`), und die Antwort
  erscheint in einer Meldung von Android. Um deine Nummer nur für einen Anruf zu verbergen, tippe \`#31#\` vor die
  Nummer.
- **Zwei SIMs:** Tippe über **Anrufen** auf die SIM, über die du anrufen willst; beim ersten Mal bittet **SIM wählen**
  Android, Erevos sie sehen zu lassen. Eine Nummer, die du ohne Wahl anrufst, fragt mit **Anrufen über**, welche.
  Erevos merkt sich die SIM, die du für jede Nummer genutzt hast, versiegelt im Bereich, und ruft beim nächsten Mal
  über dieselbe an. Der Anrufbildschirm nennt die SIM jedes Anrufs.
- **Die Anrufe:** Unter **Telefon** listet **Anrufliste** die Anrufliste von Android, die neuesten zuerst, unter jedem
  Tag: wer, was für ein Anruf es war, über welche SIM und wie. **Alle**, **Verpasst**, **Eingehend**, **Ausgehend**
  und, sobald ein Anruf blockiert wurde, **Blockiert** filtern sie; mit zwei SIMs behält **SIM 1** oder **SIM 2** die
  Anrufe dieser SIM. Aufeinanderfolgende Anrufe mit derselben Nummer erscheinen einmal, mit ihrer Anzahl. **☏** ruft
  zurück; ein Tippen auf die Zeile zeigt ihre Anrufe, wie lange jeder dauerte, und **Anrufen** (mit zwei SIMs einmal
  für jede), **SMS senden**, **Zu Kontakten hinzufügen** für eine Nummer, die keiner deiner Kontakte ist, und
  **Nummer vor dem Anrufen ändern**. Dort angesehen, verschwinden verpasste Anrufe aus der Benachrichtigung von Android,
  und diese Benachrichtigung öffnet die **Anrufliste**.
- **Anrufe löschen:** In den Anrufen der Zeile löscht **Diesen Anruf löschen** (oder **Diese 3 Anrufe löschen**, bei
  einer Zeile mit mehreren) sie aus der Anrufliste von Android, **Löschen** neben einem von mehreren löscht nur diesen,
  und **Alle Anrufe mit dieser Nummer löschen**, wenn es mehr gibt, löscht sie alle, auch die älteren. **Rückgängig**
  erscheint vorher für ein paar Sekunden; bis dahin sind sie nur verborgen.
- **Favoriten:** die in den Kontakten deines Telefons mit Stern markierten Kontakte, mit ihren Fotos. Ein Tippen ruft
  die Standardnummer des Kontakts an, oder fragt, welche, wenn es mehrere gibt und keine Standard ist; gedrückt
  gehalten, zeigt es alle.
- **Mehr zu einer Nummer:** Sobald auf der Wähltastatur eine Nummer getippt ist, bietet **⋯** daneben **Zu Kontakten hinzufügen**, **Zu bestehendem Kontakt hinzufügen** (deine Kontakte öffnen sich: tippe den, dem die Nummer hinzugefügt wird, oder lege einen neuen an), **SMS senden** und **Nummer kopieren**. In der **Anrufliste** bieten die Anrufe der Zeile dasselbe, dazu **Kontakt öffnen** für eine Nummer, die einer deiner Kontakte ist. Bei den **Favoriten** zeigt ein langes Drücken auf einen Kontakt seine Nummern, jede mit **SMS senden** und **Nummer kopieren**, dazu **Kontakt öffnen**. Bei gesperrtem Erevos ruft das Telefon nur an und kopiert eine Nummer: keine SMS, keine Änderungen an deinen Kontakten. Jede Taste, **Anrufen** und die Enter-Taste der Tastatur vibrieren kurz; unter **Einstellungen** → **Darstellung** → **Vibration bei Berührung** schaltest du das aus. Siehe [Darstellung](#appearance).
- **WLAN-Telefonie und HD Voice:** Der Anrufbildschirm sagt es unter dem Namen, wenn ein Anruf über WLAN oder mit HD
  Voice geht, und die **Anrufliste** sagt es für jeden Anruf.
- **Anrufe blockieren:** Unter **Telefon** → **Einstellungen** blockiert **Telemarketing blockieren** Anrufe von den
  Nummern, die manche Länder für Telemarketing vorsehen: Frankreich (01 62, 01 63, 02 70, 02 71, 03 77, 03 78, 04 24,
  04 25, 05 68, 05 69, 09 48, 09 49 und 09 475 bis 09 479, nach der Entscheidung 2022-1583 der ARCEP), Spanien (400,
  seit dem 17. Oktober 2026), Chile (809), Indien (140) und Brasilien (0303, das Anrufer dort seit August 2025
  weglassen dürfen). Andere Länder sehen keine solchen Nummern vor, oder Erevos ist sich nicht sicher, also wird für
  sie nichts blockiert. Gib unter **Nummern, die beginnen mit** den Anfang weiterer zu blockierender Nummern ein, mit
  der Landesvorwahl (+33 162) oder so, wie du sie hier wählst (0162), und tippe auf **Blockieren**; **Entfernen** nimmt
  einen weg. Diese blockieren nie eine Nummer aus den Kontakten deines Telefons. Ein blockierter Anruf klingelt nicht
  und hinterlässt keine Benachrichtigung; er erscheint in der **Anrufliste** unter **Blockiert**. Android fragt
  einmal, ob Erevos Anrufe prüfen darf (**Erevos Anrufe prüfen lassen**): Ohne das klingelt ein blockierter Anruf
  einen Moment, bevor Erevos ihn beendet. Was blockiert ist, ist in jedem Bereich gleich, verrät also nichts über einen
  anderen, und wird auf dem Telefon ohne Namen aufbewahrt.
- **Blockierte Nummern:** Unter **Telefon** → **Einstellungen** ist **Blockierte Nummern** die eigene Liste von
  Android, dieselbe wie unter **Einstellungen** → **Telefon und SMS** → **SMS** → **Blockierte Nummern**: Gib eine
  Nummer ein und tippe auf **Blockieren**, oder tippe auf eine, um die Blockierung aufzuheben. In der **Anrufliste**
  zeigen die Anrufe einer Zeile **Diese Nummer blockieren** oder **Blockierung dieser Nummer aufheben**, mit
  **Rückgängig**. Android weist ihre Anrufe ab, bevor sie klingeln, und ihre SMS und MMS. Jeder Bereich sieht dieselbe
  Liste.
- **Unbekannte Nummern und Spam:** Bei einer Nummer, die keiner deiner Kontakte ist, sagt der Anrufbildschirm unter
  der Nummer, woher sie kommt (Land und Flagge, und den Ort eines Festnetzanschlusses, wo die Nummer ihn verrät) und
  ob sie mobil, Festnetz, gebührenfrei oder eine Mehrwertnummer ist: allein aus der Nummer gelesen, auf dem Telefon.
  Unter **Telefon** → **Einstellungen** lädt **Spam-Liste** eine Liste von Nummern, die für Spam bekannt sind, ganz
  von der https://-Adresse herunter, die du eingibst: eine Nummer pro Zeile mit Ländervorwahl, oder der Anfang von
  Nummern gefolgt von \`*\`, dann welche Art von Anrufen es sind. Erevos hat keine eigene; wähle eine Liste, der du
  vertraust. Ohne Tor sieht der Server der Liste die Internetadresse des Telefons, und Erevos sagt es vorher. Der
  Anrufbildschirm einer Nummer darauf zeigt **Möglicher Spam**; **Spam-Anrufe lautlos klingeln lassen** lässt sie
  ohne Ton klingeln (ab Android 10), nie die eines Kontakts. In der **Anrufliste** fügt **Als Spam melden** bei
  einer Nummer, die keiner deiner Kontakte ist, sie nur auf diesem Telefon hinzu, und **Kein Spam** nimmt es zurück;
  **Meine Meldungen vergessen** löscht sie. Keine Nummer wird je irgendwo nachgeschlagen. **Jede Woche neu laden**
  holt sie von derselben Adresse neu, sobald sie eine Woche alt ist, mit entsperrtem Erevos, über Tor, wenn der
  Tor-Weg des Bereichs an ist; es ist aus, bis du es einschaltest.
- **Eine Kontaktgruppe für eine Weile:** Unter **Telefon** → **Einstellungen** listet **Eine Kontaktgruppe
  blockieren** die Gruppen (die Labels) der Kontakte deines Telefons auf. **Blockieren** neben einer blockiert die
  Anrufe ihrer Kontakte **Eine Stunde lang**, **Bis morgen früh** (7:00) oder **Bis ich es aufhebe**; die Zeile unter
  der Gruppe sagt, bis wann, und **Aufheben** beendet es früher. Ein solcher Anruf wird wie die anderen blockiert: Er
  klingelt nicht und erscheint in der **Anrufliste** unter **Blockiert**. Erevos liest die Gruppen nur und bewahrt die
  ID der Gruppe und die Zeit auf, nicht ihren Namen. Solange eine Gruppe blockiert ist, sagt es der Bildschirm
  **Telefon** oben, bis wann, mit **Aufheben**.

**Warum:** Ein Anruf wird auch bei gesperrtem Erevos geprüft, also kann, was blockiert ist, nicht in einem Bereich
versiegelt sein; und für jeden Bereich gleich aufbewahrt, verrät es nichts über einen von ihnen.

- **Das Passwort von Erevos:** Der Bildschirm **Telefon**, mit den Wähltasten, den Anrufen und den Favoriten, liegt
  wie der Rest von Erevos dahinter. Nur der Anrufbildschirm nicht, außer du lässt das Telefon ohne Passwort öffnen:
  unter **Telefon** → **Einstellungen**, **Telefon ohne Passwort öffnen** (anfangs aus, und nur gezeigt, solange
  Erevos ein Passwort hat). Bei gesperrtem Erevos öffnen das Symbol des Telefons, ein tel:-Link und die
  Benachrichtigung eines verpassten Anrufs dann die Wähltasten, die **Anrufliste** und die **Favoriten**, die Android
  für jede Telefon-App führt, nur mit den Namen aus den Kontakten des Telefons: nie die nur in Erevos gespeicherten
  oder die versteckter Chats, und keine für eine Nummer gemerkte SIM. Dort kannst du anrufen, mehr nicht: kein Löschen,
  Blockieren, keine SMS und kein Hinzufügen zu Kontakten. **Erevos öffnen** oben zeigt den Passwortbildschirm, ebenso
  das eigene Symbol von Erevos, nachdem Erevos mehr als 30 Sekunden im Hintergrund war, außer ein dort geführter Anruf
  hat es weggebracht. **Telefon wieder hinter das Passwort** schaltet es aus.
- **Wenn Erevos nicht zur Telefon-App wird:** Wie bei SMS können Android 15 und neuer das bei einer aus einem Browser
  installierten App zurückhalten. Tippe unter **Einstellungen** auf **Standard-Apps öffnen** → **Telefon-App** →
  Erevos. Wenn Android es eine eingeschränkte Einstellung nennt, öffne die **App-Info von Erevos**, tippe oben rechts
  auf **⋮** → **Eingeschränkte Einstellungen zulassen** und wähle Erevos erneut. **Anrufe und Kontakte erlauben**
  erscheint, solange Android noch Anrufe, die Anrufliste oder die Kontakte zurückhält.
- **Nach einem Neustart des Telefons:** Bis du das Telefon zum ersten Mal entsperrst, nimmt der eigene
  Anrufbildschirm von Android an.
- **Was ein Telefonanruf ist:** ein normaler Telefonanruf, wie bei jeder Telefon-App: Die Telefongesellschaft
  überträgt ihn und kann mithören. Anrufe an deine Erevos-Kontakte aus einem Chat sind etwas anderes:
  Ende-zu-Ende-verschlüsselt, über das Internet.

## Kontakte {#contacts}

Auf Android zeigt **Kontakte** im Menü die Kontakte des Telefons: die in den eigenen Kontakten von Android, die auch
deine anderen Apps nutzen, also gibt es nichts zu importieren. Android fragt einmal, ob Erevos sie lesen und ändern
darf (**Kontakte erlauben**). Sie öffnen sich auch über die Person oben auf dem Startbildschirm und haben ein eigenes
Symbol in den Apps des Telefons, **Kontakte**, violett mit einer Person auf dem Zeichen von Erevos, das sie hinter der
Sperre von Erevos öffnet: mit Passwort, sobald du es eingibst.

- **Jemanden finden:** **Kontakte durchsuchen** sucht in jedem Feld: Namen, Nummern (wie auch immer geschrieben, mit
  oder ohne Landesvorwahl), E-Mail-Adressen, Adressen, die Firma, der Geburtstag und die Notiz. **Favoriten** zeigt
  nur die Kontakte mit Stern.
- **Ein Kontakt:** Tippe auf einen, um alles davon zu sehen. Tippe auf eine Nummer, um sie anzurufen{~, oder auf
  **SMS** daneben, um ihr in Erevos zu schreiben}; tippe auf eine E-Mail-Adresse oder eine Adresse, um sie zu öffnen.
  **Zu Favoriten hinzufügen** oben gibt ihm einen Stern, in den Kontakten von Android, sodass auch die Telefon-App ihn
  unter den Favoriten aufführt.
- **Neuer Kontakt** und **Bearbeiten:** Vor- und Nachname, Firma und Position, so viele Nummern, E-Mail-Adressen und
  Adressen, wie du brauchst, jede mit ihrer Art (**Mobil**, **Privat**, **Geschäftlich**, **Andere**), ein Geburtstag
  (Tag/Monat/Jahr oder Tag/Monat) und eine Notiz. Ein neuer Kontakt wird **Nur auf diesem Telefon** gespeichert oder in
  einem Konto, mit dem das Telefon Kontakte synchronisiert (Google), wie du wählst. Was Erevos von einem Kontakt nicht
  zeigt, etwa die eigenen Angaben einer anderen App, bleibt, wie es war.
- **Foto:** Tippe auf das Bild oben bei einem Kontakt, um mit **Foto auswählen** eines aus den Fotos des Telefons zu
  wählen, mit **Foto aufnehmen** eines mit der Kamera aufzunehmen oder es mit **Foto entfernen** zu entfernen. Du
  schneidest es quadratisch zu, und Erevos zeichnet es neu, sodass nichts, was das Foto außer seinem Bild sagte (ein Ort, ein
  Telefon), aufbewahrt wird. Es wird mit dem Kontakt in den Kontakten von Android gespeichert, wo das Telefon es zeigt,
  wenn er anruft.
- **Klingelton:** Bei einem Kontakt öffnet **Klingelton wählen** die eigene Auswahl von Android, mit den Tönen des
  Telefons und denen, die du hinzugefügt hast; das Telefon klingelt damit, wenn dieser Kontakt anruft.
  **Standard-Klingelton** dort gibt den des Telefons zurück.
- **.vcf-Dateien:** **Aus einer .vcf-Datei importieren** im Menü der Kontakte liest eine vCard-Datei, die ein anderes
  Telefon oder eine andere App gespeichert hat (jede ihrer Versionen, auch die alter griechischer Telefone), und
  speichert die, die noch nicht auf dem Telefon sind, mit ihren Fotos und Gruppen, nur auf diesem Telefon oder in einem
  Konto. **Als .vcf-Datei speichern** dort speichert die angezeigten Kontakte (alle, die Favoriten, eine Gruppe oder
  was die Suche fand) als eine Datei, in einem Ordner, den du wählst; bei einem Kontakt speichert es diesen einen. Die
  Datei ist außerhalb von Erevos und nicht versiegelt: Jeder, der sie hat, kann die Kontakte lesen.
- **QR-Codes:** **QR-Code** bei einem Kontakt zeigt seine vCard als QR-Code, den die Kamera eines anderen Telefons als
  hinzuzufügenden Kontakt liest: seinen Namen, Nummern, E-Mail-Adressen, Adressen und Notiz, ohne sein Foto (eine lange
  Notiz oder viele Adressen werden weggelassen, damit er passt). Wer ihn sieht, kann ihn lesen.
  **QR-Code eines Kontakts lesen** im Menü liest einen aus einem Foto, das du aufnimmst oder wählst, hier auf dem
  Telefon, und beginnt damit einen neuen Kontakt, der erst gespeichert wird, wenn du ihn speicherst. Der Erevos-QR-Code
  von jemandem beginnt einen mit seiner Erevos-ID.
- **Duplikate:** **Duplikate finden** im Menü listet die Kontakte auf, die aussehen wie dieselbe Person, zweimal
  gespeichert: derselbe Name (seine Wörter in beliebiger Reihenfolge), dieselbe Nummer oder E-Mail-Adresse.
  **Zusammenführen** behält den vollständigsten davon, mit jeder Nummer, E-Mail-Adresse und Adresse der anderen, ihren
  Notizen, und ihrem Foto, Klingelton, Stern und ihren Gruppen, wenn er keine hat, und löscht die anderen;
  **Alle zusammenführen** macht das für jede Gruppe von Duplikaten. **Nicht dieselben** blendet eine Gruppe aus, bis du
  die Liste wieder öffnest.
- **Geburtstage:** Der Chip **Geburtstage** unter der Suche listet die Kontakte mit Geburtstag auf, den nächsten
  zuerst, mit der Anzahl verbleibender Tage und dem Alter, das sie erreichen. **Geburtstagserinnerungen** im Menü
  (anfangs aus) setzt am Morgen jedes Geburtstags eine Benachrichtigung, ab 9:00, auch bei geschlossenem Erevos; auf
  dem Sperrbildschirm sagt sie nur, dass es einen Geburtstag gibt. Es sind nur die Geburtstage der Kontakte des
  Telefons, nie die von nur in Erevos gespeicherten Kontakten.
- **SIM-Kontakte** im Menü liest die Kontakte auf den SIM-Karten des Telefons und kopiert die, die noch nicht auf dem
  Telefon sind (anfangs alle gewählt), in die Kontakte von Android, nur auf diesem Telefon oder in ein Konto. Die SIM
  behält ihre eigenen.
- **Nur in Erevos:** Unter **Gespeichert in** kann ein neuer Kontakt stattdessen **Nur in Erevos** gespeichert werden:
  versiegelt in diesem Bereich wie seine Chats, nie in den Kontakten von Android, sodass keine andere App und kein
  Konto ihn sieht und andere Apps nur seine Nummer zeigen; der Anrufbildschirm von Erevos zeigt seinen Namen, solange
  Erevos entsperrt ist. Er hat ein Schloss in der Liste, und der Chip **Nur in Erevos** zeigt nur diese.
  **Nur in Erevos speichern** bei einem Telefonkontakt holt ihn herein, mit seinem Foto und Stern, und löscht ihn aus
  den Kontakten des Telefons; **In die Kontakte des Telefons verschieben** bringt ihn wieder hinaus. Sein Foto wird mit
  ihm versiegelt. Gruppen, Klingeltöne und Geburtstagserinnerungen gehören zu Android, also hat er keine. Ein Anruf{~
  oder eine SMS} an ihn geht trotzdem über das Telefon und erscheint in der Anrufliste{~ und den SMS} des Telefons wie jede
  andere. Ein Erevos-Backup enthält diese Kontakte, versiegelt.
- **In versteckten Chats:** **Kontakte** oben in offenen versteckten Chats listet ihre eigenen Kontakte, nur dort
  gespeichert und mit ihnen versiegelt: Sie erscheinen nirgendwo sonst, nicht einmal in den Kontakten des Bereichs,
  und der Bildschirm zeigt nichts mehr, sobald sich die versteckten Chats schließen. Ein neuer Kontakt dort ist immer
  einer von ihren. Man kann einem ein Foto geben, da versteckte Chats offen bleiben, während du es wählst oder
  aufnimmst. Ihr Menü hat nur, was ihnen gehört: **Aus einer .vcf-Datei importieren** bewahrt die Kontakte einer Datei
  bei ihnen auf, versiegelt, nie in den Kontakten des Telefons; **Als .vcf-Datei speichern** speichert die angezeigten,
  oder einen auf seiner Karte, in einem Ordner, den du wählst (außerhalb von {=Erevos} und nicht verschlüsselt);
  **QR-Code eines Kontakts lesen** beginnt einen ihrer Kontakte. Eine dort eingegebene oder gelesene Erevos-ID fügt ihn
  den versteckten Chats hinzu, nie denen des Bereichs. Einen davon über die Telefon-App anzurufen, schließt die
  versteckten Chats, sobald {=Erevos} mehr als 30 Sekunden weg ist, und der Anruf erscheint in der Anrufliste der
  Telefon-App.
- **Erevos-ID:** Die Erevos-ID eines Kontakts ist der Kontaktlink, den sein {=Erevos} zeigt, unter
  **Meinen Kontaktlink kopieren** oder als sein QR-Code. Füge sie auf der Karte eines Kontakts, oder unter
  **Erevos-ID**, wenn du einen schreibst, ein, oder lies sie mit **Foto des QR-Codes aufnehmen** oder
  **Foto des QR-Codes auswählen**: **Zu {=Erevos} hinzufügen** (oder **Speichern**) fügt ihn deinen Erevos-Chats hinzu,
  die sich mit ihm öffnen, und verknüpft den Kontakt mit ihm, und der Chat übernimmt den Namen des Kontakts, wenn er
  keinen eigenen hat. Ein Kontakt, der ein Erevos-Kontakt ist, zeigt den Anfang seines Schlüssels als **Erevos-ID**.
- **Erevos-Kontakte:** Ein Kontakt, der dieselbe Person ist wie einer der Erevos-Kontakte deiner Chats, erscheint mit
  ihm als eine Karte: über eine in {=Erevos} mit ihm verknüpfte Nummer, über seine Erevos-ID oder mit
  **Aus meinen Erevos-Chats wählen** auf seiner Karte, eine im Bereich versiegelte Verknüpfung, nie in den Kontakten
  von Android (**Nicht dieser Erevos-Kontakt** macht sie rückgängig). Die Karte hat dann **Nachricht**, **Anrufen** und
  **Video**, Ende-zu-Ende-verschlüsselt über {=Erevos} statt über die Telefongesellschaft. Ein Kontakt der Chats, der
  kein Kontakt ist, hat eine eigene Karte, mit dem Schild, wo **Zu Kontakten hinzufügen** einen macht und
  **Mit einem meiner Kontakte verknüpfen** ihn mit einem verknüpft, den du hast, dessen Karte ihn dann zeigt; der Chip
  **Erevos-Kontakte** listet sie alle. Ein Erevos-Kontakt ohne eigenen Namen übernimmt den Namen des mit ihm
  verknüpften Kontakts, wenn sie verknüpft werden oder wenn sich die Karte dieses Kontakts öffnet; ein Name, den du ihm
  in {=Erevos} gegeben hast, bleibt, und einer, den du geleert hast, kommt dann vom Kontakt zurück. In versteckten Chats
  sind das die eigenen Kontakte der versteckten Chats, und ihr Chat öffnet sich dort.
- **Verlauf:** Die Karte eines Kontakts listet {~seine letzten Anrufe aus der Anrufliste des Telefons, seine SMS und|}
  seine Nachrichten in Erevos auf, die neuesten zuerst; tippe auf einen Eintrag, um {~zurückzurufen, eine SMS zu
  schreiben oder |}den Chat zu öffnen.{~ Die Anrufe erscheinen, sobald du Erevos die Anrufliste lesen lässt
  (**Anrufe zeigen**). Erevos liest sie nur, um sie zu zeigen, und behält keine Kopie.}
- **Andere Apps:** **Zu Kontakten hinzufügen** einer anderen App (eine Nummer in der Telefon-App, eine E-Mail-Adresse
  in der Mail-App) kann sich in Erevos öffnen: ein neuer Kontakt mit dem, was diese App übergeben hat, oder die Liste,
  um auf den Kontakt zu tippen, dem es hinzugefügt werden soll. Eine App, die einen Kontakt zeigt oder ändert, kann ihn
  auch in Erevos öffnen, hinter der Sperre von Erevos. Android fragt, welche App es nutzen soll; wähle Erevos. Eine App,
  die dich einen Kontakt oder eine Nummer, E-Mail-Adresse oder Adresse wählen lässt, bekommt nur den Eintrag, auf den
  du tippst, aus den Kontakten des Telefons: Die nur in Erevos gespeicherten erscheinen dort nie.
- **Löschen** nimmt den Kontakt vom Telefon, aus jedem Konto, in dem er gespeichert ist; einen nur in Erevos
  gespeicherten aus Erevos.
- **Gruppen:** **Gruppen** im Menü der Kontakte (die drei Punkte) listet die eigenen Gruppen von Android auf, etwa
  Familie oder Arbeit, mit der Anzahl darin, und macht neue. Öffne eine, um mit **Kontakte hinzufügen** Kontakte
  hinzuzufügen, mit **×** einen herauszunehmen, sie mit **Umbenennen** umzubenennen oder mit **Gruppe löschen** zu
  löschen (ihre Kontakte bleiben). Bei einem Kontakt legt
  **Gruppen wählen** ihn in Gruppen oder nimmt ihn heraus. Die Chips unter der Suche zeigen die Kontakte einer Gruppe.
  Eine Gruppe wird in einem Konto aufbewahrt, wie ihre Kontakte: Ein Kontakt tritt ihr nur bei, wenn er auch in diesem
  Konto gespeichert ist.

## Passwortsperre {#lock}

Unter **Einstellungen** → **Datenschutz und Sicherheit** → **Sperre und zweites Passwort** hat
**Sperren, wenn Erevos öffnet** zwei Möglichkeiten: **Keine Sperre** und **Passwort**.

1. Tippe auf **Passwort**, gib es zweimal ein (mindestens 4 Zeichen) und tippe auf **Speichern**.
2. Ab dann fragt Erevos bei jedem Öffnen danach, und erneut nach 30 Sekunden im Hintergrund.
3. **Passwort ändern** ändert es, und **Jetzt sperren** sperrt Erevos sofort.

- **Ein Satz, keine kurze PIN:** Was das Passwort prüft, liegt im Schlüsselspeicher des Telefons, eine Kopie des
  Speichers reicht also nicht, um Passwörter zu probieren. Wer aber die Sicherheit des Telefons selbst knackt, wie es
  Forensik-Werkzeuge bei manchen Telefonen tun, könnte auf eigenen Computern raten, und eine PIN aus 6 Ziffern, eine
  Million Möglichkeiten, fällt in Tagen. Ein Satz aus 4 oder 5 Wörtern nicht. Unter einem kurzen neuen Passwort oder
  einer PIN versteckter Chats sagt Erevos das und nimmt es erst nach **Trotzdem verwenden**. Dieselben Versuche kann,
  wer eine Sicherung und ihr Passwort hat, an der Sicherung machen: dort ist eine kurze PIN am schwächsten.
- **Gesperrt, und es empfängt weiter:** Wenn Erevos sich sperrt, legt sich der Passwortbildschirm vor den offenen
  Bereich, der dahinter weiterläuft: Nachrichten und Anrufe kommen weiterhin, mit ihren Benachrichtigungen, und ein
  Anruf erscheint über dem Passwortbildschirm. Seine Bildschirme schließen sich, versteckte Chats auch, und der
  Anrufbildschirm zeigt die Namen seiner Kontakte nicht mehr. Sein Passwort öffnet ihn wieder; das Passwort eines
  anderen Bereichs schließt ihn zuerst, ohne dass etwas von ihm im Arbeitsspeicher bleibt.
- [~] **Nur die SMS:** Bei gesperrtem Erevos fragen das SMS-Symbol, die Taste **SMS** des Widgets und die Benachrichtigung
  über eine neue SMS weiterhin nach dem Passwort, öffnen dann aber nur die SMS: die Liste der SMS-Unterhaltungen des
  Telefons, jede in einer eigenen Zeile, die Unterhaltungen selbst, **Archiviert**, **Spam** und **Papierkorb** sowie
  **Neue SMS**. Vom Bereich ist sonst nichts zu sehen. Alles andere, ein Kontakt, ein Chat, **Einstellungen**, das
  Symbol von Erevos selbst oder das orange Schloss **Alles entsperren** oben, fragt erneut nach dem Passwort und öffnet
  dann den ganzen Bereich. So lässt sich ein Code, der per SMS kam, lesen, auch wenn jemand neben dir sitzt, und das
  übrige Erevos bleibt geschlossen.
- **Nur die Kontakte:** Ebenso fragen das Kontakte-Symbol, die Taste **Kontakte** des Widgets und die Benachrichtigung
  über einen Geburtstag nach dem Passwort und öffnen dann nur die Kontakte: ihre Liste, die Karte eines Kontakts (ohne
  deine Chats und Anrufe mit ihm), **Bearbeiten**, Gruppen, Duplikate, die SIM und das Importieren. **Anrufen** öffnet
  weiterhin die Telefon-App des Telefons. Ein Chat{~, eine SMS|}, **Einstellungen** oder das orange Schloss **Alles
  entsperren** oben fragt erneut nach dem Passwort und öffnet dann den ganzen Bereich. Ein anderes Symbol, das Widget
  oder eine Benachrichtigung fragt, wenn {~nur die SMS oder |}nur die Kontakte offen sind, nach dem Passwort wie bei
  gesperrtem Erevos und öffnet dann das, wofür es steht: das Kontakte-Symbol nur die Kontakte, {~das SMS-Symbol nur die
  SMS, |}das Symbol von Erevos selbst den ganzen Bereich.

- **Sehen, was du tippst:** Jedes Feld für ein Passwort, eine PIN oder ein Token, hier und überall in Erevos, hat am
  Ende ein Auge: Tippe darauf, um zu sehen, was du eingibst, und noch einmal, um es zu verbergen. Es ist jedes Mal
  wieder verborgen, wenn das Feld neu erscheint, und auf Android wird die Tastatur gebeten, es sich nicht zu merken.
- **Falsche Passwörter:** Nach 5 falschen Versuchen lässt dich jeder weitere warten, anfangs 30 Sekunden und jedes Mal
  doppelt so lange, bis zu einer Stunde. Die Zählung übersteht einen Neustart. Das Warten richtet sich nach der
  eigenen Uhr des Telefons seit dem Einschalten, die niemand einstellen kann, also beendet es das Warten nicht, wenn
  du Datum und Uhrzeit vorstellst; wird das Telefon während des Wartens aus- und wieder eingeschaltet, wartet es
  erneut von vorn, da sich die schon gewartete Zeit nicht wissen lässt. In der Web-App und auf einem Computer läuft es
  genauso, solange Erevos offen bleibt, und beginnt von vorn, wenn Erevos neu geöffnet wird.
- **Was versiegelt ist:** Die Kontakte jedes Bereichs, die Schlüssel seiner Unterhaltungen, seine Nachrichten, seine
  Relay-Einstellungen und sein Aussehen werden auf dem Telefon versiegelt aufbewahrt, mit einem Schlüssel, den nur sein
  Passwort öffnet.
- **Die Liste sofort:** Der Startbildschirm bewahrt eine versiegelte Kopie seiner ersten Zeilen auf, sodass die Liste
  erscheint, sobald sich der Bereich öffnet, und sich dann aktualisiert. Sie ist immer gleich groß, verrät also
  niemandem, wie viele Chats es gibt oder welche Bereiche genutzt werden, und sie enthält nie, was eine verschwindende
  Nachricht sagte.

**Warum:** Jedes ausprobierte Passwort kostet absichtlich Zeit und viel Arbeitsspeicher (PBKDF2, dann Argon2id), damit,
wer kopiert, was das Telefon aufbewahrt, nicht schnell Passwörter ausprobieren kann; und wer das Telefon in der Hand
hat, wartet nach jedem falschen Versuch länger. Die Zählung gilt für das ganze Telefon, über Neustarts hinweg, da der
Passwortbildschirm kommt, bevor sich irgendein Bereich öffnet, und das Warten dort gemessen wird, wo das Verstellen
der Uhr es nicht verkürzen kann.

> Ein vergessenes Passwort lässt sich nicht wiederherstellen: Es ist nichts gespeichert, was die Daten ohne es öffnen
> könnte. Nur ein Fingerabdruck oder Gesicht, solange eingeschaltet, öffnet den ersten Bereich noch (siehe unten).

### Bildschirmfotos

Mit eingeschalteter Passwortsperre hält Android Erevos aus Screenshots, Bildschirmaufnahmen und den letzten Apps
heraus: Dort erscheint der letzte Bildschirm von Erevos leer, sodass, wer das entsperrte Telefon einen Moment in der
Hand hat, deine Chats darin nicht sieht. Unter **Einstellungen** → **Datenschutz und Sicherheit** →
**Bildschirmfotos** lässt **Ausschalten** Screenshots wieder funktionieren (etwa um einen zu verschicken), und
**Einschalten** stellt den Schutz wieder her. Solange sie eingeschaltet ist, bleiben auch versteckte
Chats draußen, selbst in einem Bereich ohne Passwortsperre; ausgeschaltet funktionieren Screenshots auch in ihnen. Die
Einstellung gehört dem Telefon und ist in jedem Bereich gleich. Auf einem Computer und in der Web-App gibt es sie nicht.

**Warum:** Ohne sie bleibt der letzte Bildschirm von Erevos als Bild unter den letzten Apps, bis Erevos wieder öffnet,
deshalb bleiben versteckte Chats immer draußen, damit sie dort nie ohne ihre PIN erscheinen. Die Einstellung ist in
jedem Bereich gleich, damit sie nichts darüber verrät, welcher Bereich sich geöffnet hat.

### Fingerabdruck oder Gesicht

Auf Android 11 und neuer, mit einem in den Einstellungen des Telefons eingerichteten Fingerabdruck oder Gesicht, kann
sich Erevos auch damit öffnen. Es ist aus, solange du es nicht einschaltest.

1. Tippe bei eingeschalteter Passwortsperre unter **Fingerabdruck oder Gesicht** auf **Einschalten**.
2. Gib das Passwort des Bereichs ein, in dem du bist, tippe auf **Einschalten** und berühre den Sensor (oder schau auf
   das Telefon).
3. Ab dann hat der Passwortbildschirm eine Taste **Fingerabdruck oder Gesicht**. Das Passwort funktioniert auch immer,
   und **Ausschalten** schaltet es aus.

- **Nur der Bereich des ersten Passworts:** Ein Fingerabdruck öffnet nie den Bereich eines zweiten Passworts, und
  auch keine versteckten Chats. In dem Bereich eingeschaltet, den ein zweites Passwort öffnet, öffnet er nichts: Beim
  ersten Versuch schaltet er sich selbst aus, und das Passwort öffnet Erevos. Die Einstellung sieht in jedem Bereich
  gleich aus.
- **Unter Druck:** Jemand, der dich festhält, kann deinen Finger auf das Telefon drücken oder es dir vors Gesicht
  halten. Wenn das passieren kann, lass es aus: Dann braucht er ein Passwort, und du kannst ihm das zweite geben.
- **Wie es aufbewahrt wird:** Der Schlüssel des ersten Bereichs ist mit einem Schlüssel in der sicheren Hardware des
  Telefons (dem Android Keystore) versiegelt, der nur direkt nach einer starken Fingerabdruck- oder Gesichtsprüfung
  funktioniert, einmal für jede Nutzung. Einen Fingerabdruck oder ein Gesicht hinzuzufügen oder zu entfernen, lässt
  Android diesen Schlüssel verwerfen: Es ist dann aus, und du schaltest es wieder ein. Ein Schlüssel, der auf andere
  Weise nicht mehr funktioniert, schaltet es ebenfalls aus, nach drei Versuchen in Folge, bei denen er sich nicht
  benutzen ließ. Nichts verlässt das Telefon.
- **Welches Gesicht:** Ein Gesicht zählt nur, wo Android seine Gesichtsentsperrung als stark einstuft, etwa auf dem
  Pixel 8 und neuer; anderswo ist es der Fingerabdruck.
- **Falsche Passwörter** werden wie bisher gezählt: Ein Fingerabdruck ändert die Zählung nicht.
- **Nicht auf einem Computer oder im Web:** Es wird nur auf Android angeboten. Die Sperre auszuschalten, schaltet es
  auch aus.

**Warum:** Ein Finger lässt sich leichter erzwingen als ein Passwort, und jeder, dessen Finger oder Gesicht das Telefon
kennt, könnte es nutzen, also öffnet es nie den Bereich eines zweiten Passworts oder versteckte Chats. In einem anderen
Bereich eingeschaltet, bewahrt es einen Schlüssel auf, der nichts öffnet, in derselben Form, sodass das Gespeicherte
nicht zeigt, in welchem Bereich es eingeschaltet wurde.

## Zweites Passwort {#second}

Wenn dich jemand zwingt, Erevos zu öffnen, gib statt deines eigenen das zweite Passwort ein. Es öffnet ein separates,
leeres Erevos mit eigenen Kontakten, eigenem Relay und eigenem Aussehen. Deine echten Chats bleiben verborgen, und
nichts in der App zeigt, dass es sie gibt.

1. Tippe bei eingeschalteter Passwortsperre auf **Zweites Passwort festlegen**.
2. Gib es zweimal ein und tippe auf **Speichern**. Es muss sich von deinem eigenen Passwort unterscheiden.

- **Das Aussehen:** Der zweite Bereich beginnt mit dem Aussehen des Bereichs, in dem es festgelegt wurde, damit er
  nicht auffällt.
- **Eines nach dem anderen:** Ein erneut festgelegtes zweites Passwort ersetzt das vorherige.
  **Zweites Passwort entfernen** entfernt es.
- **Aus der Suche:** Tippe in einem offenen Bereich das Passwort eines anderen Bereichs in **Chats durchsuchen** und
  drücke Enter: Der offene Bereich schließt sich, nichts von ihm bleibt, und der andere öffnet sich, wie mit **Jetzt
  sperren** und seinem Passwort. Es dauert gleich lang, was auch immer du tippst, sodass die Zeit nicht zeigt, ob es
  einen anderen Bereich gibt. Ein falsches Passwort oder das des offenen Bereichs ist nur eine Suche; das
  Panik-Passwort wirkt nur auf dem Passwortbildschirm.
- **Einen Chat dorthin verschieben:** Tippe in den **Details** eines Chats auf **In einen anderen Bereich verschieben**,
  gib das Passwort des anderen Bereichs ein und tippe auf **Verschieben**. Der Chat kommt dorthin mit seinen
  Nachrichten, seinem Namen, Bild und Aussehen und den darin importierten Chats, verschlüsselt mit dem Schlüssel jenes
  Bereichs, und jener Bereich bleibt geschlossen. Die Sicherheitsnummer bleibt gleich, und das Telefon des Kontakts
  erfährt sofort, dass es von nun an dorthin schreiben soll. Die Zeile zeigt sich in jedem Bereich, und das Passwort
  wird so geprüft wie in der Suche: Ein falsches oder das des offenen Bereichs verschiebt nichts. Ein Chat mit jemandem,
  mit dem der andere Bereich schon einen eigenen Chat hat, bleibt, wo er ist. Wer den anderen Bereich mit einem
  forensischen Werkzeug liest, könnte erkennen, dass der Chat von woanders kam: Sein Kontakt kennt ihn weiter unter dem
  Schlüssel dieses Bereichs.
  Hat jener Bereich noch kein Relay, bietet Erevos das dieses Bereichs an: **Mit dem Relay dieses Bereichs
  verschieben** verschiebt den Chat und gibt jenem Bereich dieses Relay zum Behalten, und das Relay kann dann
  erkennen, dass beide Bereiche auf einem Telefon sind.
- **Diskretion:** Zum Schutz deiner Privatsphäre zeigt die App nie, ob ein zweites Passwort festgelegt ist. In der
  Web-App mit eingeschalteten Benachrichtigungen, wenn geschlossen, bleibt die Zahl auf dem Symbol von Erevos, solange
  Erevos geschlossen ist: Passt sie nicht zu dem Bereich, den du öffnest, kann sie auf einen anderen hindeuten
  (**Zahl auf dem Symbol** schaltet sie aus).

## Versteckte Chats {#hidden}

Jeder Bereich hat 4 Plätze für versteckte Chats, jeder nur mit seiner eigenen PIN zu öffnen, und sie erscheinen nie
zwischen deinen anderen Chats. Es gibt nirgendwo eine Taste für sie. Jeder Platz kann einen Chat oder mehrere
enthalten, also haben 2 Bereiche 8 Plätze.

**Warum:** Jeder Platz hat schon eine eigene PIN, also hat ein Chat allein auf einem Platz einen eigenen Schlüssel, und
ein Platz kann auch mehrere Chats unter einer PIN enthalten. Die Zahl der Plätze ist aus zwei Gründen fest:

- **Damit nichts sichtbar wird.** Alle 4 Plätze gibt es ab dem ersten Start, ungenutzt mit Zufallsdaten gefüllt. Wer
  dich zwingt, das Telefon zu öffnen, oder kopiert, was es aufbewahrt, kann nicht erkennen, ob du versteckte Chats
  hast, oder wie viele. Mit einem Schlüssel für jeden Chat würden die versiegelten Dateien mit jedem neuen versteckten
  Chat wachsen und verraten, wie viele es gibt.
- **Damit es schnell bleibt.** Eine in die Suche eingegebene PIN wird an jedem Platz ausprobiert, und jeder Versuch ist
  absichtlich langsam (Argon2id, das viel Arbeitsspeicher und Zeit braucht, damit PINs nicht schnell erraten werden
  können). Mit 4 Plätzen bleibt das Öffnen kurz und dauert immer gleich lange, sodass auch die Zeit nicht verrät, wie
  viele genutzt werden.

Die Zahl kann später ohne Verlust erhöht werden, um den Preis eines etwas langsameren Öffnens; sie zu senken, würde
löschen, was die weggenommenen Plätze enthalten.

1. Lege einen Platz auf eine von zwei Arten an: Wähle unter **Einstellungen** → **Datenschutz und Sicherheit** →
   **Versteckte Chats** einen von **Platz 1** bis **Platz 4**, tippe auf **PIN für versteckte Chats festlegen**, gib sie zweimal
   ein und tippe auf **Speichern**; oder öffne die **Details** eines Chats, tippe auf
   **In versteckte Chats verschieben**, gib eine PIN mit 4 oder mehr Zeichen ein, tippe auf **Neue versteckte Chats**,
   wähle einen Platz, dann **Anlegen und verschieben**. Merke dir, welche Plätze du nutzt: Zum Schutz deiner
   Privatsphäre kann Erevos nicht sagen, welche frei sind.
2. Um sie zu öffnen, gib die PIN in **Chats durchsuchen** auf dem Startbildschirm ein und drücke Enter (die Suchtaste
   der Tastatur). Oder halte **Neuer Chat** einen Moment gedrückt: Ein Feld für die PIN öffnet sich, auf Android mit einem kurzen Vibrieren, in jedem Bereich
   gleich; gib sie ein und tippe auf **Öffnen**. Es öffnet nur den Platz mit dieser PIN. Eine falsche PIN ist nur eine
   Suche oder schließt nur das Feld: Es passiert nichts.
3. Sie öffnen sich mit dem Titel **Versteckte Chats**, mit **Kontakte** und **PIN ändern** oben, und listen ihre Chats
   und Gruppen so auf, wie der Startbildschirm deine auflistet: die neuesten zuerst, jeder mit dem, was zuletzt gesagt
   wurde, wann und wie viele ungelesen sind. Tippe auf einen, um ihn zu öffnen. Der Zurück-Pfeil schließt sie.
4. Um einen weiteren Chat auf einen Platz zu verschieben, öffne seine **Details**, tippe auf
   **In versteckte Chats verschieben**, gib die PIN dieses Platzes ein und tippe auf **Verschieben**. Der
   Chat verlässt deine Liste mit seinen Nachrichten, seinem Namen, Bild und Aussehen und den darin importierten Chats,
   und seine Sicherheitsnummer bleibt gleich. Das Telefon des Kontakts
   erfährt sofort, dass es ab jetzt an die versteckten Chats schreiben soll; eine Nachricht, die es genau in diesem
   Moment sendet, kommt womöglich nicht an.
5. Um einen Chat zurück zu den Chats des Bereichs zu verschieben, öffne ihn in den versteckten Chats, dann seine
   **Details**, tippe auf **Zurück in meine Chats verschieben** und **Verschieben**. Er geht mit seinen Nachrichten,
   seinem Namen, Bild, Aussehen und den importierten Chats, und seinem Telefon wird gesagt, wohin es schreiben soll.

- **Relay, Nostr und Telefone in der Nähe:** Versteckte Chats haben ihre eigene Relay-Warteschlange und ihre eigenen
  Schlüssel. Solange sie offen sind oder geschlossen empfangen, erreichen sie auch das Telefon eines Kontakts in der
  Nähe, wie deine anderen Chats (siehe [Chat mit einem Telefon in der Nähe](#nearby)), aber andere Telefone tragen sie
  nie, und sie gehen nie über LoRa{~ oder per SMS}. Ohne Relay sagt ihr Kontaktlink, wo sie auf Nostr lesen, mit einem Schlüssel
  nur dieses Platzes, und Texte gehen dorthin, wie von einem Telefon ohne Relay; Fotos, Sprachnachrichten, Anrufe und
  Gruppen brauchen ein Relay. Solange sie geschlossen sind, warten ihre Nachrichten auf dem Relay, oder zwei Tage lang
  auf Nostr, außer **Empfangen, wenn geschlossen** ist an.
- **Empfangen, wenn geschlossen:** ein Schalter oben auf jedem Platz. Eingeschaltet empfangen seine versteckten Chats
  wie deine anderen Chats, solange der Bereich offen ist, egal welcher Bildschirm zu sehen ist und mit Erevos im
  Hintergrund: Ihre Kontakte sehen sofort, dass eine Nachricht ankam, eine Benachrichtigung sagt nur „New message“,
  auf Android klingelt ein Anruf mit „Incoming call“ und ohne Namen (auf dem Klingelbildschirm nimmt **Annehmen** ihn ohne PIN an, auf einem Anrufbildschirm ohne Namen und ohne Gesicht, und die versteckten Chats bleiben geschlossen; das kleine Zeichen, die PIN und **Verbinden** öffnen sie und nehmen ihn dort an), und eine Erinnerung aus ihrem „Chat mit mir
  selbst“ zeigt eine Benachrichtigung, die nur **Reminder** sagt. Was über Nostr zu ihnen kommt, wird dann auch gelesen{+,
  und ihre eigenen Matrix-, XMPP- und Nostr-Konten bleiben verbunden (siehe unten)}. Ein Anruf, der endete, bevor du sie
  geöffnet hast, oder zu lange klingelte, erscheint als verpasst. Nichts von ihnen erscheint irgendwo, bis die PIN sie
  öffnet. Ein neuer Platz beginnt mit eingeschaltetem Schalter; vorher angelegte Plätze bleiben, wie sie waren, bis du
  ihn einschaltest. Dafür wird der Schlüssel des Platzes verschlüsselt mit dem Bereich aufbewahrt, zwischen einem
  Zufallsschlüssel für jeden anderen Platz, sodass das Öffnen des Bereichs nicht zeigt, welche Plätze empfangen oder
  angelegt sind. Aber wer den Bereich öffnet und kopiert, was das Telefon aufbewahrt, könnte auch diesen Platz öffnen,
  ohne PIN: Die PIN hält sie dann vor den Blicken dessen verborgen, der das Telefon in der Hand hat, nicht vor einem
  forensischen Werkzeug. Ausgeschaltet ist ihr Schlüssel nur hinter der PIN, und ihre Nachrichten warten auf dem Relay,
  bis du sie öffnest. Backups behalten den Schalter.
- **Punkt für Ungelesenes:** mit **Empfangen, wenn geschlossen** an, ein Schalter darunter (aus, außer du schaltest
  ihn ein). An zeigt sich, solange einer der Chats oder eine der Gruppen des Ortes eine ungelesene Nachricht hat{+, oder
  einer seiner eigenen Matrix-, XMPP- oder Nostr-Chats seit dem letzten Öffnen eine bekam}, ein kleiner Punkt auf der
  Lupe von **Chats durchsuchen** auf dem Startbildschirm: nie wie viele, noch wo. Er geht, sobald du sie liest. Wer
  die Chats des Bereichs sieht, sieht ihn auch und kann vermuten, dass es versteckte Chats gibt. Orte, die nur
  **Melden, wenn eine Nachricht kommt** haben, bekommen keinen Punkt: Der Schalter müsste dort liegen, wo der Bereich
  ihn lesen kann.
- **Sie schließen sich von selbst,** sobald Erevos mehr als 30 Sekunden im Hintergrund war, so wie sich die eigene PIN
  eines Chats wieder sperrt, aber nicht während eines Anrufs und nicht, während du ein Foto oder eine Datei für sie
  wählst oder ein Foto aufnimmst.
- **Solange sie offen sind,** spielt eine ankommende Nachricht den Ton für neue Nachrichten, wie in deinen anderen
  Chats. Mit Erevos im Hintergrund, bevor sie sich schließen, sagt eine Benachrichtigung „New message“ nur, wenn
  **Empfangen, wenn geschlossen** oder **Melden, wenn eine Nachricht kommt** für diesen Platz an ist.
- **Wie deine anderen Chats:** Was jetzt nicht gehen kann, wartet, als **Wartet** markiert, nur über ihr Relay, oder
  über Nostr ohne Relay (siehe **Wartet** unter [Chat über ein Relay](#relay)), **Später senden** funktioniert wie
  dort, und ein aus einer anderen App exportierter Chat kann in den Details eines versteckten Chats importiert werden
  (siehe [Importierte Chats](#import)). Ein Kontakt lässt sich auch dort über ein Foto seines QR-Codes hinzufügen,
  aufgenommen oder ausgewählt, während sie offen bleiben. Jeder Platz hat seinen eigenen **Chat mit mir selbst**, als
  ersten in seiner Liste (siehe **Chat mit mir selbst und Erinnerungen** unter [Erste Schritte](#start)).
- **Gruppen:** **Neue Gruppe**, unter ihrer Liste, macht eine Gruppe mit ihren Kontakten, wie auf dem Startbildschirm
  (siehe [Gruppenchats](#groups)), und sie erscheint in ihrer Liste zwischen ihren Chats. Ihre Mitglieder sind nur
  Kontakte dieses Platzes, und einer, den du daraus als Kontakt hinzufügst, wird ein Kontakt dieses Platzes. Was darin
  geschrieben wird, geht nur über das Relay des Platzes, in eine eigene Warteschlange dort, nie an ein Telefon in der
  Nähe; solange der Platz geschlossen ist, wird sie nur mit eingeschaltetem **Empfangen, wenn geschlossen** gelesen,
  und **Melden, wenn eine Nachricht kommt** zählt sie nicht. Ihre Anrufe klingeln nur, solange die versteckten Chats
  offen sind: Einer, der gestartet wird, während sie geschlossen sind, erscheint als verpasst. Eine Gruppe dort hat
  keine eigene PIN, und keine ist öffentlich.
- [+] **Matrix, XMPP und Nostr:** unter ihrer Liste öffnen **Matrix**, **XMPP** und **Nostr** die Bildschirme dieser Netze
  (siehe [Matrix](#matrix), [XMPP](#xmpp) und [Chats mit anderen Nostr-Apps](#nostr-chats)) für Konten, die den
  versteckten Chats allein gehören, getrennt von denen des Bereichs: ein Matrix-Konto und ein XMPP-Konto zum Anmelden
  und ein Nostr-Schlüssel. Die Anmeldungen und der Schlüssel werden mit dem Schlüssel der versteckten Chats
  verschlüsselt aufbewahrt, und nichts davon zeigt sich außerhalb der versteckten Chats: Ihre Chats stehen nur in der
  Liste der versteckten Chats und zählen weder in der Zahl auf dem Symbol von Erevos noch in der Startliste mit. Die
  Konten verbinden sich, solange die versteckten Chats offen sind, und auch, solange sie geschlossen sind, wenn
  **Empfangen, wenn geschlossen** eingeschaltet ist, wie die versteckten Chats selbst empfangen: Dann zeigt eine
  Nachricht dort eine Benachrichtigung, die nur „New message“ sagt, und auf Android klingelt ein Matrix- oder XMPP-Anruf
  mit „Incoming call“ und ohne Namen und wird mit der PIN angenommen wie ihre anderen Anrufe; einer, der nicht
  rechtzeitig angenommen wird, erscheint als verpasst, ebenso ein XMPP-Gruppenanruf, der kommt, während sie geschlossen
  sind. Ausgeschaltet verbinden sich die Konten nur, solange die versteckten Chats offen sind, und solange sie
  geschlossen sind, kommt nichts an. Ihre Chats rufen an wie die des Bereichs, vom eigenen Konto der versteckten Chats;
  ein Anruf an dieses, während die versteckten Chats offen sind, klingelt mit dem Klingelton des Telefons, und sie
  bleiben offen, bis er endet. Ein Matrix-Konto von ihnen hat kein **Neue Nachrichten melden**.
- **Verknüpfte Geräte:** Unter ihrer Liste verknüpft **Verknüpfte Geräte** diese versteckten Chats für sich mit
  demselben Platz auf einem Computer oder im Browser, von innen, getrennt vom Bereich und seinen verknüpften Geräten:
  Ihre Chats, Nachrichten und eigenen Konten gehen dorthin, und nichts davon zeigt sich im Bereich (siehe **Versteckte
  Chats und zweite Passwörter** unter [Verknüpfte Geräte](#devices)). Nicht verknüpft, sind sie nur auf diesem
  Telefon.
- **Linkvorschauen** haben einen eigenen Schalter in den Details eines versteckten Chats, für alle Chats dieses
  Platzes, aus, solange du ihn nicht einschaltest (siehe **Linkvorschauen** unter [Chat über ein Relay](#relay)).
- **Melden, wenn eine Nachricht kommt** (Android): oben auf einem Platz, solange **Empfangen, wenn geschlossen** aus
  ist. Eingeschaltet sagt eine Benachrichtigung, solange der Platz geschlossen ist, nur „New message“ oder wie viele
  kamen, wie bei den anderen Chats, mit {=Erevos} im Hintergrund oder sichtbar, jede Nachricht
  einmal, auch wenn {=Erevos} geschlossen war und neu gestartet wurde; was kam, während der Platz offen war, macht keine,
  sobald er sich schließt. Dass eine Nachricht von dir bei ihnen ankam oder gelesen wurde, Tippen und neue Schlüssel
  machen keine, ebenso wenig ein Anruf, der geklingelt hat (siehe **Klingeln bei Anrufen, wenn geschlossen**); einer,
  der nicht geklingelt hat, zählt als Nachricht. Eine Nachricht oder eine Löschung, die andere Erevos-Telefone zum
  Relay mitgenommen haben (siehe **Von anderen Telefonen mitgenommen** in
  [Chat mit einem Telefon in der Nähe](#nearby)), kann nicht sagen, was sie trägt, da die Telefone, die sie tragen, es
  nicht wissen dürfen: Sie zählt als Nachricht, also zeigt auch eine Löschung „New message“, und die erste Nachricht
  eines Chats kann als zwei zählen; und eine ohne Ton gesendete meldet sich wie gewohnt (siehe **Ohne Ton senden**).
  Es braucht **Empfangen und klingeln** und **Neue Nachrichten melden** unter **Im Hintergrund**, was der Schalter
  sagt, wenn sie nicht an sind, und ein Relay, das wartet (ab dem 18. Oktober 2026); eines von vor dem 23. Oktober 2026
  kann nur sagen, dass etwas wartet, also erscheint dann auch dafür „New message“, einmal, bis du diesen Platz öffnest.
  Dafür führt der Bereich eine Relay-Warteschlange für jeden seiner 4 Plätze, die nicht genutzten zum Schein auf
  demselben Relay angelegt, sodass das Öffnen des Bereichs weder zeigt, ob versteckte Chats angelegt sind, noch welche,
  solange sie das Relay des Bereichs nutzen; das Relay wird nur gefragt, wie viele Nachrichten kamen, da es sie an dem
  Byte zählt, das jede trägt (siehe, was das Relay sieht, oben), nie nach ihnen selbst. Wer die Benachrichtigung sieht
  und in deinen Chats nichts Neues findet, kann ahnen, dass es mehr gibt. Nachdem du im Platz jemanden gelöscht oder
  blockiert hast, macht die erste Nachricht von jemand Neuem, über den Kontaktlink oder QR-Code des Platzes, keine:
  Sie zeigt sich, wenn du den Platz öffnest. Backups behalten es.
- **Klingeln bei Anrufen, wenn geschlossen** (Android): unter **Melden, wenn eine Nachricht kommt**, solange
  **Empfangen, wenn geschlossen** aus ist. Eingeschaltet lässt ein Anruf von einem seiner Kontakte, solange der Platz
  geschlossen ist, mit Erevos im Hintergrund oder auf irgendeinem Bildschirm, das Telefon klingeln und
  „Incoming call“ ohne Namen zeigen, wie ein Anruf aus deinen anderen Chats. Tippe auf dem Klingelbildschirm auf
  **Annehmen** oder das kleine Zeichen, gib die PIN ein und tippe auf **Verbinden**, um anzunehmen; **Ablehnen** beendet
  das Klingeln. Wer **Annehmen** ohne die PIN tippt, kommt nicht weiter als bis zum PIN-Feld. Das Klingeln dauert etwa
  45 Sekunden. Es braucht **Empfangen und klingeln** unter **Im Hintergrund**, was der Schalter sagt, wenn es nicht an
  ist, und ein Relay, das wartet, und nutzt für jeden der 4 Plätze eine
  eigene Relay-Warteschlange, die der nicht klingelnden zum Schein auf demselben Relay angelegt, wie bei der
  Nachrichten-Benachrichtigung oben, sodass das Öffnen des Bereichs nichts verrät. Der Anrufer lässt dort nur eine
  Warteschlange klingeln; der Anruf selbst wartet in der eigenen Warteschlange des Chats, bis die PIN ihn öffnet. Ein
  Kontakt, den du gelöscht hast, kann es trotzdem klingeln lassen, aber der Anruf kann sich nie verbinden. Ein von einem
  verknüpften Computer aus geführter Anruf klingelt nur, solange die versteckten Chats offen sind.
  Backups behalten es.
- **Eine neue PIN für einen Platz** (über **Versteckte Chats** in **Einstellungen** oder **Neue versteckte Chats**)
  beginnt ihn leer und ersetzt, was darin war. Um die Chats zu behalten und nur die PIN zu ändern, öffne sie und nutze
  dort **PIN ändern**. Jede PIN muss sich von den anderen und von dem Passwort unterscheiden, das Erevos öffnet.
- **Falsche PINs in der Suche** werden getrennt von denen des Sperrbildschirms gezählt: Nach fünf hören Suchen eine
  Weile auf, es zu versuchen, ohne es zu zeigen, und der Sperrbildschirm wartet nie ihretwegen.
- **Eine PIN hält fern, wer das Telefon in die Hand nimmt,** nicht, wer kopiert, was es aufbewahrt: Mit einem
  forensischen Werkzeug auf einem entsperrten oder gerooteten Telefon lassen sich PINs ohne Wartezeit ausprobieren.
  Jeder Versuch kostet Argon2id (viel Arbeitsspeicher und Zeit), aber eine PIN aus 4 Ziffern sind nur 10.000
  Versuche. Wenn du das fürchtest, nimm eine längere PIN oder ein paar Wörter.
- **Diskretion:** Jeder Bereich hat von Anfang an alle 4 Plätze, die ungenutzten mit Zufallsdaten gefüllt, die wie
  genutzte aussehen, und die Suche probiert jedes Mal jeden Platz. So zeigt nichts, ob versteckte Chats angelegt sind,
  oder wie viele.

### Ein mit PIN gesperrter Chat {#chat-pin}

Ein Chat oder eine Gruppe kann eine eigene PIN haben, unabhängig von versteckten Chats: Er bleibt zwischen deinen
Chats, öffnet sich aber nur mit seiner PIN.

1. Öffne den Chat, tippe oben auf **⋮** für seine **Details**, dann auf **Mit PIN sperren** (in einer Gruppe: oben auf
   den Namen der Gruppe, dann auf **Mit PIN sperren**).
2. Gib zweimal eine PIN mit mindestens 4 Zeichen ein, dann **Sperre**.

- **Ihn öffnen:** Er fragt nach der PIN. Er sperrt sich wieder, sobald du ihn verlässt, einen anderen Chat öffnest
  oder Erevos länger als eine halbe Minute weg ist (wie die Passwortsperre).
- **Hinter der PIN** erscheint nichts vom Chat: Keine seiner Nachrichten wird gezeichnet, bis die PIN eingegeben ist,
  und mit Glas, einem Hintergrund oder der eigenen Szene eines Stils liegt der PIN-Bildschirm auf dichtem Frost, der
  nichts durchlässt.
- **In der Liste** zeigt er seinen Namen mit einem Schloss und **Mit PIN gesperrt**, nichts von seinen Nachrichten,
  auch nicht in der Suche, in **Markierte Nachrichten** oder in **Importierte Chats**. Die Benachrichtigung sagt nur
  **New message**, wie bei jedem Chat.
- **Falsche PINs** werden auf dem Telefon gezählt, für alle Chats zusammen und getrennt von denen des
  Sperrbildschirms: Nach fünf wartet der nächste Versuch, jedes Mal länger.
- **PIN vergessen?** Unter der PIN, wo der Bereich ein Passwort hat, entfernt **PIN vergessen?** sie mit dem Passwort,
  das den Bereich öffnet. Ohne Passwort kann ihn nichts wieder öffnen: Den Kontakt zu löschen ist dann der einzige
  Weg.
- **In versteckte Chats:** Ein Chat, den du in versteckte Chats verschiebst, nimmt seine PIN mit, die dort nichts
  fragt, da die eigene PIN der versteckten Chats sie schützt. Zurück in die Chats verschoben, fragt dieselbe PIN
  wieder.
- **Sie entfernen:** **Details** → erneut **Mit PIN sperren**, und gib seine PIN ein.
- **Nur dieses Telefon kennt sie,** und jedes verknüpfte Gerät hat seine eigene. Backups behalten sie.
- [~] **Auch bei {+Matrix, XMPP, Nostr und }SMS:** {+Ein Chat bei Matrix, XMPP oder Nostr hat unten **Mit PIN sperren**, eine}{-Eine}
  SMS-Unterhaltung {-hat **Mit PIN sperren** }unter ihrer Zeile **Normale SMS**, und es wirkt genauso: in der Liste ihr Name mit einem Schloss,
  keine ihrer Nachrichten in der Suche, und das Passwort des Bereichs nimmt eine vergessene PIN ab. **Bildschirmfotos
  blockieren** steht daneben, nur auf diesem Telefon (Android): Die anderen erfahren es nicht. Die Chats eines
  versteckten Ortes bieten beides nicht, da ihre eigene PIN sie schützt und sie aus Screenshots
  herausbleiben, solange **Bildschirmfotos** eingeschaltet ist.

**Warum:** Manche Chats sollen bleiben, wo sie sind, aber nicht offen für jeden, der das Telefon einen Moment in der
Hand hat. Die PIN wird nur als ihr Argon2id aufbewahrt, sodass sie sich nicht vom Telefon lesen lässt und Raten
langsam ist. Sie ist eine Sperre auf dem Bildschirm, kein eigener Schlüssel: Die Nachrichten des Chats bleiben mit dem
Rest des Bereichs verschlüsselt, und wer kopiert, was das Telefon aufbewahrt, während der Bereich offen ist, könnte sie
trotzdem lesen. Für einen Chat, der nicht einmal gesehen werden darf, nutze versteckte Chats.

## Sammlung {#collection}

Die Sammlung ist ein verschlüsselter Ort für deine Fotos, Dateien und Ordner, in jedem Bereich und jedem versteckten Ort, jeweils mit einer eigenen: die des Bereichs öffnet sich nur im Bereich, die eines versteckten Ortes nur in diesem versteckten Ort, und nichts auf dem Telefon verrät, dass ein Ort eine hat. Ihr Symbol, zwei Bilder mit einem winzigen Vorhängeschloss, steht auf dem Startbildschirm links vom Schloss und oben in den Chats eines versteckten Ortes. Sie ist ein Modul, auf Android, in der Desktop-App, in der Web-App und auf Sailfish OS: **Einstellungen** → **Allgemein** → **Module**.

- **Darin:** oben die Reiter: **Fotos** als Raster nach Monaten, **Videos**, **Musik** und die übrigen **Dateien** als Listen, jeder mit den Ordnern darüber, die etwas von ihm enthalten (**Dateien** auch die leeren). **+** nimmt ein Foto mit der Kamera auf, das direkt hierher geht und nie in die Galerie, holt eine Datei aus den Dateien des Telefons, bis zu 4 GB, verschlüsselt, während sie gelesen wird, ohne Kopie vorher, oder legt einen neuen Ordner an. Gedrückt halten wählt mehrere aus, zum Verschieben, Senden oder Löschen; einen Ordner gedrückt halten, um ihn umzubenennen oder zu löschen, wobei seine Dateien bleiben.
- **Verschlüsselt:** jede Datei ist mit einem eigenen Schlüssel verschlüsselt, in zufällig benannten Stücken zwischen den Stücken der Chats, sodass nichts auf dem Telefon eine Datei der Sammlung von einem Foto eines Chats unterscheidet. Nur der eigene Katalog der Sammlung, versiegelt wie die Chats, sagt, was was ist. Die Sammlung bleibt aus Screenshots heraus und schließt sich, wenn der Bereich sperrt.
- **Fragt erneut:** Hat der Bereich ein Passwort, fragt die Sammlung jedes Mal danach, wenn sie sich öffnet, und wieder, wenn Erevos länger als 30 Sekunden weg war, bevor etwas von ihr zu sehen ist; Fingerabdruck oder Gesicht gehen auch, wo sie Erevos entsperren. Falsche Passwörter zählen wie auf dem Sperrbildschirm. Die Sammlung eines versteckten Orts fragt nicht zusätzlich, da versteckte Chats schließen, sobald Erevos verlassen wird.
- **Aus einem Chat oder einer anderen App:** ein Foto oder eine Datei in einem Chat gedrückt halten, dann **In der Sammlung speichern**: sie wird in die Sammlung des Ortes dieses Chats kopiert. Beim Teilen aus einer anderen App hat **Senden an** die **Sammlung** zuerst und fragt nach dem Ordner; sie kommt so hinein, wie sie ankam, schon verschlüsselt, und liegt so nie unverschlüsselt auf dem Telefon. Sie darf bis 4 GB groß sein; eine über 100 MB kann nur in die Sammlung, da ein Chat höchstens 100 MB nimmt.
- **Aus der Sammlung heraus:** ein Foto öffnet sich auf dem ganzen Bildschirm, zum Wischen und Zoomen, mit **An einen Chat senden**, **Auf dem Telefon speichern**, **Informationen** und **Löschen**. Auf dem Telefon speichern oder eine Datei mit einer anderen App öffnen bringt sie unverschlüsselt heraus, und Erevos sagt das vorher. Beim Senden an einen Chat bleibt die Kopie in der Sammlung. Aus der Sammlung eines versteckten Ortes gehen Dateien nur an die Chats und Gruppen dieses versteckten Ortes, nie an die des Bereichs, und die Sammlung des Bereichs nie an einen versteckten Ort. Wische oder nutze die Pfeile für das nächste oder vorige Foto; **Diashow** oben zeigt sie nacheinander, alle 4 Sekunden, bis zu einem Tippen.
- **Aus einem Chat:** **+** unter dem Nachrichtenfeld, dann **Sammlung**, öffnet die Sammlung des Ortes dieses Chats: die zu sendenden Fotos oder Dateien antippen, dann **Senden**, und sie gehen in diesen Chat.
- **Sicherungen:** eine Sicherung enthält die Sammlung mit dem Rest des Telefons. **Einstellungen** → **Daten und Geräte** → **Sammlung**, oder die drei Punkte in der Sammlung, können diese Sammlung aus den Sicherungen lassen, die gemacht werden, während sie geöffnet ist: jede Sammlung hat ihre eigene Wahl.
- **Auf einem WebDAV-Server:** in den Einstellungen der Sammlung kopiert **Auch auf einem WebDAV-Server** die Dateien dieser Sammlung so, wie sie sind, weiterhin verschlüsselt, in einen Ordner auf einem Server deiner Wahl, Nextcloud, ownCloud oder jeder, der WebDAV spricht: gib die Adresse des Ordners, einen Benutzernamen und am besten ein App-Passwort an und tippe auf **Verbinden**; **Verbindung testen** prüft sie vorher. Jeder Bereich und jeder versteckte Ort hat seine eigene Wahl und seinen eigenen Server; zuerst wird der Server der Sicherungen vorgeschlagen. Es geht nur, was noch nicht dort ist, ein Stück nach dem anderen, solange der Ort geöffnet ist, und nach einem Netzausfall geht es dort weiter, wo es aufhörte; eine hier gelöschte Datei wird auch dort gelöscht. Sonst wird im Ordner nichts angerührt. Der Server sieht nur Stücke mit zufälligen Namen in einem Unterordner mit zufälligem Namen und kann sie nicht öffnen. Ein Telefon, dem eine Datei fehlt, etwa nach einer Sicherung, die auf einem neuen Telefon wiederhergestellt wurde, holt sie beim Öffnen von dort und behält nur Stücke, die sich mit dem Schlüssel der Datei öffnen lassen. Erevos zeigt, wie viel davon schon gekommen ist, mit **Abbrechen**: Was da ist, bleibt, und beim nächsten Mal kommt nur der Rest; Musik, Videos, PDFs und **Mit einer anderen App öffnen** holen sie auch zuerst. Solange alles kopiert ist, dürfen Sicherungen, die bei geöffnetem Ort gemacht werden, seine Stücke auslassen, auch nach einem Neustart von Erevos, bis eine Datei hinzugefügt oder gelöscht wird. Er hat einen eigenen Schalter **Über Tor**, aus, solange du ihn nicht einschaltest: Eingeschaltet geht die Kopie nur über Tor, was auch die Tor-Einstellung des Bereichs sagt, der Server sieht deine IP-Adresse also nicht; es ist langsamer und wartet, während Tor startet. Wo es kein Tor gibt, in der Desktop-App und in der Web-App, bekommt ein Server mit eingeschaltetem Schalter nichts.
- **Mit Nextcloud, etwa der von LPHL:** in diesem Formular und bei **Server hinzufügen** der Sicherungen gib unter **Deine Nextcloud** ihre Adresse ein und tippe auf **Mit Nextcloud anmelden**: Melde dich im Browser an, wie bei Fasouli, über Authentik oder wie sie sonst anmeldet, und wähle **Zugriff gewähren**. Erevos bekommt ein eigenes App-Passwort und füllt das Formular mit seinem eigenen Ordner in deinen Dateien, **Erevos/Collection** oder **Erevos/Backups**, angelegt, falls er fehlt, neben dem von Fasouli, den es nie liest; dann tippe auf **Verbinden**. Das App-Passwort nimmst du unter Nextcloud → Einstellungen → Sicherheit zurück. Die Anmeldung folgt dem Schalter **Über Tor** des Servers, für den sie anmeldet: Eingeschaltet fragt Erevos deine Nextcloud nur über Tor, aber die Seite im Browser selbst geht wie immer.
- **Auf deinen verknüpften Geräten:** in den Einstellungen der Sammlung schickt **Auch auf meinen verknüpften Geräten** diese Sammlung auf die [verknüpften Geräte](#devices) ihres Bereichs oder versteckten Ortes, und der Schalter gilt für alle. Eine Datei, die auf einem hinzugefügt, umbenannt, verschoben oder gelöscht wird, ist es auf allen. Kleine Bilder kommen sofort; die Datei selbst kommt im selben WLAN sofort, sonst wenn du sie öffnest, vom WebDAV-Server, falls die Sammlung einen hat, oder über das Relay bis 100 MB. Jedes Stück wird nur behalten, wenn es sich mit dem Schlüssel der Datei öffnet, und eine abgebrochene Übertragung geht beim fehlenden Stück weiter. Eine Datei wird anderswo nur gelöscht, wenn sie auf einem deiner Geräte gelöscht wird, nie, weil sie dort fehlt. Die Sammlung eines versteckten Ortes geht nur auf dessen eigene verknüpfte Geräte.
- **Musik, Videos und PDFs:** ein PDF liest sich Seite für Seite in Erevos (Android 11 und neuer), nur im Speicher entschlüsselt. Musik und Videos spielen direkt aus ihren verschlüsselten Stücken, nie aus einer Kopie: ein Video auf dem ganzen Bildschirm, Musik mit den nächsten Stücken des Ordners, weiter bei ausgeschaltetem Bildschirm, mit Abspielen, Pause, Weiter und Zurück in der Benachrichtigung und auf dem Sperrbildschirm des Telefons, und dort nur damit. Die Liste läuft weiter, nachdem der Bereich gesperrt ist, außer **Wiedergabe stoppen, wenn der Bereich sperrt** ist in den Einstellungen der Sammlung an; **Stoppen** und die Panik-Taste beenden sie. Die Benachrichtigung zeigt nur **Wiedergabe**, außer **Titel in der Benachrichtigung zeigen** ist an. **Mit einer anderen App öffnen** gibt die Datei weiter, während sie entschlüsselt wird, ohne Kopie auf dem Telefon, bis du die Sammlung verlässt; die andere App kann eine eigene behalten.
- **Originale in der Galerie:** mit **Das Original nach dem Import aus der Galerie löschen** an wird ein aus den Dateien des Telefons ausgewähltes Foto oder Video aus der Galerie gelöscht, sobald es in der Sammlung ist, nachdem Android dich um Bestätigung gebeten hat. Dafür ist Android 11 oder neuer nötig. Ein Foto der Kamera kommt nie in die Galerie. Sagt Android nicht, welches Foto der Galerie es ist (etwa aus **Zuletzt** in der Dateiauswahl), bleibt das Original und Erevos sagt es: Wähle es unter **Bilder** oder im Speicher des Telefons.
- **Fotos und Videos:** unter **+** ist **Kamera** Erevos’ eigene: Fotos und Videos nacheinander, mit Blitz und Frontkamera, direkt in die Sammlung, nie in die Galerie, und keine andere App sieht sie; ein Foto wird nirgends geschrieben, nicht einmal für einen Augenblick, und enthält nichts als sein Bild. Wo der Hersteller des Telefons sie anbietet, wie bei einem Pixel, stehen **Nacht** und **Porträt** neben **Foto**, und oben **HDR an**: Sie gehören dem Telefon selbst, entstehen auf ihm, und nichts geht hinaus. Ein Tippen stellt dort scharf und richtet das Licht danach; zwei Finger zoomen, und die Tasten über dem Auslöser wechseln zum Weitwinkel (**0.5×**), zu **1×**, **2×** und **5×**, wo das Telefon sie hat. **Mehr** hat einen Timer von 3 oder 10 Sekunden, ein Raster, einen lautlosen Auslöser, wo das Gesetz es erlaubt, **Dunkler** und **Heller** und für Videos HD, Full HD oder 4K sowie **HDR-Video an**, wo das Telefon es filmt; beim Video kann das Licht an bleiben. **Aus der Galerie** holt viele Fotos und Videos auf einmal herein; mit **Das Original nach dem Import aus der Galerie löschen** fragt Android dann einmal für alle. HEIC- und AVIF-Fotos erscheinen unter **Fotos** (Android zeigt HEIC ab 9 und AVIF ab 12); eines, das das Gerät nicht zeigen kann, bietet **Mit einer anderen App öffnen** an. Unter einem Foto dreht **Bearbeiten** es um je eine Vierteldrehung und schneidet es mit einem Rahmen zu, den du an den Ecken ziehst: Es wird als neues Foto behalten, und das Original bleibt, wie es war. **Informationen** sagt, ob ein Foto oder Video verrät, wo es aufgenommen wurde. Ein JPEG-, PNG-, WebP- oder GIF-Foto, das hinaus gespeichert oder mit einer anderen App geöffnet wird, geht ohne Aufnahmeort, Aufnahmezeit und Telefon, außer **Fotos gehen mit Ort und Zeit hinaus** ist in den Einstellungen der Sammlung an; ein Video oder ein HEIC-Foto geht so, wie es ist, und Erevos sagt vorher, wenn es einen Ort nennt. Die Kamera, die Galerie und **Bearbeiten** gibt es unter Android; in der Desktop-App und im Browser erscheinen auch AVIF-Fotos.
- **In der Desktop-App:** unter Linux, macOS und Windows gibt es die Sammlung auch, ihre Dateien verschlüsselt in Erevos’ eigenem Ordner auf dem Computer. **+** holt eine Datei vom Computer, Stück für Stück verschlüsselt; eine Kamera gibt es nicht. Fotos, Texte, PDFs (im eingebauten PDF-Betrachter), Musik und Videos öffnen sich nur im Speicher von Erevos, nie als unverschlüsselte Kopie auf der Festplatte, bis zu 1 GB je Datei, Musik und Videos in jeder Größe, Stück für Stück aus ihren verschlüsselten Teilen gelesen, während sie laufen; die Datei schließt sich, und Musik oder ein Video hält an, wenn der Bereich sperrt oder mit dem Panikknopf. **Auf dem Computer speichern** fragt vorher, wie auf dem Telefon; **Mit einer anderen App öffnen** gibt es dort nicht.
- **Im Browser und auf Sailfish OS:** Die Web-App, auch auf dem Startbildschirm eines iPhones, und {=Erevos} auf Sailfish OS haben die Sammlung ebenfalls. **+** holt eine Datei mit der Dateiauswahl des Browsers, Stück für Stück gelesen und verschlüsselt, sodass eine große nie ganz im Speicher liegt; ihre Stücke liegen im Speicher des Browsers oder auf Sailfish OS in Erevos’ eigenem Ordner. Ein Browser gibt einer Website nur begrenzt Platz: Ist er voll, wird nichts von der Datei behalten, und Erevos sagt es. Fotos, Texte, Musik und Videos öffnen sich nur im Speicher, bis zu 256 MB je Datei, und schließen sich, wenn der Bereich sperrt; ein PDF wird dort nicht angezeigt: Speichere es, um es mit einer anderen App zu lesen. **Auf diesem Gerät speichern** (auf Sailfish OS **Auf dem Telefon speichern**) fragt vorher; im Browser nimmt es bis zu 256 MB, Sailfish OS dagegen schreibt eine Datei jeder Größe Stück für Stück in Downloads. Im Browser muss der WebDAV-Server die Web-App hereinlassen, wie für Backups; auf Sailfish OS gibt es keine Kopie auf WebDAV.
- **Formate:** Auf Android spielen MP3, AAC und M4A, FLAC, Ogg und Opus, WAV, AMR, MP4, MKV, WebM und 3GP, auch eine Datei ohne Typ, erkannt an der Endung ihres Namens, wie Dateien aus anderen Apps oft kommen. In der Desktop-App und im Browser, was der Browser davon spielt: nicht 3GP und nicht AMR.
- **Der Player-Bildschirm:** Tippe auf die Leiste der laufenden Musik unten in der Sammlung oder auf **Läuft gerade** unter einer Musikdatei für Cover, Titel, Interpret und Album, wie die Datei sie nennt (sonst ihr Name), eine Leiste zum Antippen oder Ziehen an eine andere Stelle, zurück, Wiedergabe oder Pause und weiter, **Zufällig**, **Wiederholen** (die Liste oder die eine Datei) und das Tempo von 0.5× bis 2× sowie die Liste, die laufende markiert: Tippe auf eine andere, um sie zu spielen. Ein Video oder Musik ab 10 Minuten beginnt dort, wo du aufgehört hast: Die Stelle bleibt im eigenen Katalog der Sammlung, mit ihm verschlüsselt, nirgends sonst auf dem Telefon, und nur für dieses Gerät. Benachrichtigung und Sperrbildschirm zeigen Titel, Interpret und Cover nur, wenn **Titel in der Benachrichtigung zeigen** an ist; sonst nur **Wiedergabe**.
- **Untertitel:** Eine .srt- oder .vtt-Datei im selben Ordner wie ein Video, mit seinem Namen (film.mkv und film.srt oder film.en.srt), läuft als seine Untertitel, aus ihren verschlüsselten Teilen gelesen wie das Video; **Untertitel an** oben schaltet sie aus und wieder an.
- **Playlists:** Oben unter **Musik** legt **Neue Playlist** eine an; Lieder kommen über ihr Menü hinein (**Zu einer Playlist hinzufügen**) oder zusammen ausgewählt (eins gedrückt halten, dann **Playlist**). Öffne sie, um sie der Reihe nach oder zufällig zu spielen, ein Lied nach oben oder unten zu schieben oder es herauszunehmen: Es bleibt in der Sammlung. Playlists werden verschlüsselt mit der Sammlung aufbewahrt, nie unverschlüsselt.
- **Radio:** Der Tab **Radio** enthält Internetradiosender, jeden über seinen Link; **+** fügt dort einen hinzu. Nur https-Links: Erevos öffnet kein unverschlüsseltes http, also lässt sich ein Sender, der nur einen http-Link hat, nicht hinzufügen. Ein Playlist-Link (.m3u, .pls) wird einmal gelesen, beim Hinzufügen, für den eigenen Link des Streams; ein HLS-Stream (.m3u8) läuft auf dem Telefon. Ein Sender läuft wie die Musik, mit derselben Mitteilung, demselben **Wiedergabe stoppen, wenn der Bereich sperrt** und dem Panikknopf; der Titel, den er sendet, zeigt sich auf dem Bildschirm der Wiedergabe und in der Mitteilung nur, wenn **Titel in der Benachrichtigung zeigen** an ist. Außer wenn **Über Tor abspielen**, weiter unten, an ist, sehen der Sender und wer seinen Server betreibt die IP-Adresse deines Geräts, solange er läuft, wie jede Website, und Erevos sagt das, bevor der erste läuft. Erevos schickt einem Sender sonst nichts und als Namen nur „Erevos“. Sender werden verschlüsselt mit der Sammlung aufbewahrt.
- **Einen Sender finden:** **Sender hinzufügen** sucht auch in Radio Browser (radio-browser.info), einem freien Verzeichnis von Sendern, zu dem jeder beitragen kann: Es bekommt nur die Wörter, die du tippst, wenn du **Suchen** drückst, und sieht die IP-Adresse deines Geräts, wie der Sender. Nur Sender, für die es einen https-Link hat, werden gezeigt; ein Tippen fügt einen hinzu. Mit **Über Tor** an unter **Radio- und TV-Listen**, weiter unten, geht die Suche über Tor, und Radio Browser sieht deine IP-Adresse nicht.
- **Eine fertige Liste eines Landes:** **Sender hinzufügen** fügt mit **Sender dieses Landes hinzufügen** auch die meistgehörten Sender eines gewählten Landes aus Radio Browser hinzu, bis zu 100, jeder mit einem https-Link. Radio Browser wird einmal gefragt, wenn du darauf drückst, und sieht die IP-Adresse deines Geräts, außer **Über Tor** ist unter **Radio- und TV-Listen** an.
- **Eine Playlist mit vielen Sendern:** Ein Playlist-Link (.m3u, .pls) mit vielen Sendern fügt jeden davon hinzu, und **Playlist-Datei importieren** fügt die Sender einer .m3u- oder .pls-Datei auf deinem Gerät hinzu, die dort gelesen und nirgendwohin gesendet wird. Nur Sender mit https-Link werden hinzugefügt (höchstens 500 aus einer Liste), und Erevos sagt, wie viele ausgelassen wurden.
- **Wenn ein Stream abbricht:** Beendet der Server eines Senders oder ein Proxy dazwischen den Stream, oder ist das Netz kurz weg, fragt Erevos den Sender nach 1, 2, 4… Sekunden (höchstens 30) von selbst neu an, solange du ihn hören willst, auf Android, am Computer und im Browser. Nach 12 Versuchen in Folge hört es auf und sagt es.
- **TV:** der Tab **TV** hält TV-Sender, jeden über seinen https-Link, in den Gruppen, die ihre Liste ihnen gibt, mit einer Reihe, um eine Gruppe zu zeigen, und einer Suche nach Namen. Ein Tippen spielt einen Sender auf dem ganzen Bildschirm, wie ein Video, mit demselben **Wiedergabe stoppen, wenn der Bereich sperrt** und dem Panikknopf; einen Programmführer gibt es nicht. Er spielt unter Android, in der Desktop-App und im Browser; dort spielt ein HLS-Stream über hls.js, und nur, wenn sein Server die Web-App ihn lesen lässt.
- **Sender hinzufügen:** **+** unter **TV** fügt eine Liste über ihren Link (.m3u) hinzu, die einmal gelesen wird, wenn sie hinzukommt, eine Listendatei von deinem Gerät (**Listendatei importieren (.m3u)**), die dort gelesen und nirgendwohin gesendet wird, oder einen Sender über seinen Link. Nur Sender mit einem https-Link kommen hinzu, jeder Link einmal, bis zu 15.000 in jeder Sammlung, und Erevos sagt, wie viele ausgelassen wurden. Halte einen Sender gedrückt, um ihn umzubenennen, ihn oder seine ganze Gruppe zu löschen oder mit **An einen Chat senden** seinen Namen und Link zu schicken; das Menü eines Radiosenders hat **An einen Chat senden** auch.
- **iptv-org:** **Sender hinzufügen** bietet iptv-org (github.com/iptv-org/iptv), eine öffentliche Liste freier Sender: **iptv-org nach Land**, die Region deines Geräts zuerst, oder **iptv-org: alle Sender**, über 10.000. Sein Server sieht die IP-Adresse deines Geräts, wenn die Liste geholt wird, und jeder Sender, wenn er läuft, außer wenn **Über Tor abspielen** an ist. Mit **Über Tor** an unter **Radio- und TV-Listen**, weiter unten, wird die Liste über Tor geholt, ihr Server sieht deine IP-Adresse also nicht; jeder Sender sieht sie weiterhin, wenn er läuft, außer wenn auch **Über Tor abspielen** an ist.
- **Was ein Sender sieht:** Außer wenn **Über Tor abspielen**, weiter unten, an ist, sieht der Sender, und wer seinen Server betreibt, die IP-Adresse deines Geräts, solange er läuft, wie jede Website, und Erevos sagt das, bevor der erste läuft. Logos erscheinen nur mit **Senderlogos zeigen** in den Einstellungen der Sammlung, da auch der Server jedes Logos deine IP-Adresse sieht; sonst ein TV-Symbol. Die Sender werden mit der Sammlung verschlüsselt aufbewahrt.
- **Radio- und TV-Listen über Tor:** In den Einstellungen der Sammlung hat die Karte **Radio- und TV-Listen** den Schalter **Über Tor**, aus, solange du ihn nicht einschaltest. Eingeschaltet fragt Erevos nur über Tor, was auch die Tor-Einstellung des Bereichs sagt, für die Suche in Radio Browser, eine Playlist oder TV-Liste über ihren Link, die Liste von iptv-org und die Logos der Sender, ihre Server sehen die IP-Adresse deines Geräts also nicht. Es ist langsamer und wartet, während Tor startet. Das Abspielen der Sender selbst hat einen eigenen Schalter, gleich danach.
- **Über Tor abspielen:** Auf Android haben die Einstellungen der Sammlung auch **Über Tor abspielen**, aus, solange du es nicht einschaltest. Eingeschaltet laufen Radio- und TV-Sender nur über Tor, weder sie noch wer ihre Server betreibt sehen also die IP-Adresse deines Geräts; startet Tor nicht, läuft stattdessen nichts direkt. Es ist langsamer und wartet, während Tor startet, und ein TV-Sender kann langsam starten oder kurz hängen. Solange der Bereich alles über Tor schickt, laufen sie auch ausgeschaltet über Tor. Ausgeschaltet laufen sie direkt: Bevor der erste läuft, sagt Erevos, dass sein Server deine IP-Adresse sieht, mit einem Knopf **Über Tor abspielen**, der es einschaltet und über Tor abspielt, und **Weiter**, das direkt abspielt. Nur Android spielt sie über Tor ab: Anderswo laufen sie eingeschaltet nicht, und Erevos sagt, warum; auf einem Computer auch nicht, solange der Bereich alles über Tor schickt.

**Warum:** manche Fotos und Dateien, ein Pass, ein Vertrag, ein Bild, sollen weder in der Galerie für jede App lesbar liegen noch in einem Chat reisen. Die Sammlung hält sie mit derselben Verschlüsselung wie die Chats, getrennt von ihnen. Sobald eine Datei auf dem Telefon gespeichert oder mit einer anderen App geöffnet ist, liegt sie außerhalb von Erevos, unverschlüsselt.

## Backups {#backup}

Ein Backup enthält alles, was Erevos auf diesem Telefon aufbewahrt: jeden Bereich, mit seinen Kontakten, den
Schlüsseln seiner Unterhaltungen, seinen Nachrichten, Fotos, Dateien, Sprachnachrichten, importierten Chats und
versteckten Chats, {+seinen Konten bei Matrix, XMPP und Nostr, }seinem „Chat mit mir selbst“, die Sperre und das
Panik-Passwort, und die Einstellungen, die mit dir auf ein anderes Telefon gehen. Darin bleibt jeder Bereich mit seinem
eigenen Passwort versiegelt, und das Backup wird noch einmal mit einem eigenen Passwort versiegelt. Seine Fotos, Dateien
und Sprachnachrichten kommen in eigene Dateien daneben, bis zu 4 MB jede, deren Namen wie der des Backups anfangen;
ein automatisches Backup nutzt auch die Dateien der früheren: Halte den ganzen Ordner zusammen. Backups findest du unter **Einstellungen** → **Daten und Geräte** → **Backups**.

1. **Backup erstellen:** Tippe auf **Backup erstellen**, wähle einen Ordner (auf dem Telefon, einer Speicherkarte oder
   einer Cloud-App, die dort ihre Ordner zeigt; auf einem Computer jeden Ordner), gib zweimal ein Passwort für das
   Backup ein (mindestens 12 Zeichen oder vier Wörter) und tippe auf **Speichern**. In einem Browser gehen das Backup und seine Dateien ins Teilen-Menü oder in die Downloads: die erste sofort, jede nächste nach einem Tippen auf **Speichern**.
   Während es entsteht, zeigt seine Karte, was es tut und wie weit es ist; ist es fertig, sagt es eine Mitteilung.
2. **Automatische Backups:** Wähle **Alle 6 Stunden**, **Jeden Tag** oder **Jede Woche**, dann einen Ordner und ein
   Passwort. Erevos macht eines, solange es offen ist, sobald das letzte älter ist: wenn ein Bereich sich öffnet, alle
   15 Minuten und wenn es in den Hintergrund geht, bevor es sich sperrt; nie ohne einen offenen Bereich. Jedes
   schreibt nur die Fotos, Dateien und Sprachnachrichten, die seit dem vorigen neu sind, und nennt für den Rest die
   Dateien der früheren wieder, sodass eines alle 6 Stunden wenig kostet. Der Ordner behält die 3 neuesten, mit jeder
   Datei, die sie brauchen, und löscht die Dateien, die keines von ihnen braucht. Eines, das scheiterte, wird erneut
   versucht, wenn ein Bereich sich öffnet, oder eine Stunde später. Darunter sind
   **Jetzt sichern**, **Ordner ändern** und **Passwort ändern**; **Aus** beendet sie, und die gemachten bleiben im
   Ordner.
3. **Auch auf einen Server:** Auf Android und in der Desktop-App schickt **Server hinzufügen** unter **Auch auf einen
   Server**, bei eingeschalteten automatischen Backups, jedes davon auch in einen Ordner auf einem Server deiner Wahl,
   der WebDAV spricht, etwa deiner eigenen Nextcloud: Gib die Adresse des Ordners, einen Benutzernamen und am besten
   ein App-Passwort nur für Erevos ein, dann tippe auf **Verbinden**. Der Server behält die 3 neuesten, mit jeder
   Datei, die sie brauchen, und jedes schickt nur, was neu ist; **Nicht mehr senden** beendet es, und die dort bleiben. In der Web-App, die keine Backups von selbst macht, schickt **Jetzt ein
   Backup senden** eines dorthin, mit einem Passwort, das du jedes Mal eingibst.
   Jeder Server hat einen Schalter **Über Tor**, in seiner Karte und im Formular, das einen hinzufügt, aus, solange du
   ihn nicht einschaltest (siehe **Auf einem Server** unten).
4. **Wiederherstellen:** Tippe auf **Backup wiederherstellen**, wähle die Datei und gib ihr Passwort ein. Erevos fragt
   noch einmal, findet die Dateien des Backups daneben oder bittet dich, sie oder ihren Ordner zu wählen (bei einem
   automatischen Backup wähle jede Datei des Ordners, da manche seiner Dateien wie der Name eines früheren Backups
   anfangen können), setzt dann das
   Backup an die Stelle von allem auf dem Telefon und öffnet sich so, wie es war, als das Backup gemacht wurde, mit den
   damals genutzten Passwörtern. Fehlt eine seiner Dateien, ist sie beschädigt oder gehört sie zu einem anderen Backup, sagt Erevos, welche, und es wird nichts geändert, außer du wählst, den Rest ohne sie wiederherzustellen: Dann bleiben die Fotos, Dateien und Sprachnachrichten auf dem Telefon, wie sie sind, und die in ihr kommen nicht zurück. **Von einem Server wiederherstellen** sieht im Ordner nach, in den automatische Backups gehen,
   oder in einem, den du mit Benutzername und Passwort angibst, und zeigt die Backups dort, die neuesten zuerst: Wähle
   eines, gib sein Passwort ein, und es wird genauso wiederhergestellt, mit seinen Dateien von dort.

- **Bewahre das Passwort des Backups auf:** Nichts öffnet ein Backup ohne es, und niemand kann es wiederherstellen.
  Ohne Passwortsperre ist das Passwort des Backups alles, was es schützt. Wer die Datei hat, kann Passwörter daran so
  schnell ausprobieren, wie sein Computer es schafft, ohne Telefon, das ihn bremst, also hält ein kurzes nicht: Erevos
  nimmt keines unter 12 Zeichen.
- **Automatische Backups bewahren ihr Passwort auf dem Telefon auf,** sodass sie nicht jedes Mal ein Passwort
  brauchen. Wer ihren Ordner öffnet, braucht trotzdem die Passwörter der Bereiche, um die Chats zu lesen.
- **Was Platz belegt:** Unter Android zeigt **Messen** bei **Was Platz belegt**, wie viel Platz Erevos auf dem Telefon belegt, nach Art: {~die Sammlung mit den|die} Fotos und Dateien der Chats, Sprachnachrichten, Chatverlauf, Tor und Reste unvollendeter Schreibvorgänge. Jedes automatische Backup enthält all das, so sieht man, warum eines groß ist. Nur Namen und Größen der Dateien werden angesehen, auf dem Telefon, und nichts wird gesendet.
- **Reste:** Fotos und Dateien, die kein Chat{~, keine Sammlung} und kein Import mehr nennt, etwa die eines mittendrin abgebrochenen Imports, bleiben auf dem Telefon und in jedem Backup. Gib unter **Reste** einzeln, oder mehrere auf einmal durch Komma oder Leerzeichen getrennt, die PIN jedes deiner versteckten Chats und das Passwort jedes anderen Bereichs ein und tippe auf **Reste suchen**: Erevos liest, welche Dateien jeder davon und dieser Bereich nennen, und zeigt, wie viel keiner nennt. **Sie löschen** löscht diese, nachdem du es noch einmal bestätigt hast. Ein Ort, den du dort nicht geöffnet hast, verliert seine Fotos und Dateien: Öffne zuerst alle. Eine am letzten Tag geschriebene Datei wird nie erfasst, und bereits erstellte Backups behalten alles.
- **Backups prüfen:** Nach jedem automatischen Backup liest Erevos es aus dem Ordner zurück: Es öffnet sich mit seinem Passwort, jeder Teil, den es nennt, ist da, in seiner Größe, und zwei zufällig gewählte Teile werden ganz gelesen. Von einem Server sieht es dann nur die Liste an, also wird nichts heruntergeladen. **Jetzt prüfen** lädt außerdem das neueste Backup des Servers und zehn seiner Teile herunter. Ein fehlender oder beschädigter Teil erscheint rot: Mach jetzt ein Backup und prüfe dann erneut. **Ordner vollständig prüfen** liest jeden Teil dort ganz und vergleicht ihn mit dem SHA-256, den das Backup für ihn festgehalten hat: einige Minuten bei vielen GB, und nichts verlässt das Telefon.
- **Auf einem Server:** Das Backup, das dorthin geht, ist wie die anderen mit seinem Passwort versiegelt, und dieses
  Passwort verlässt nie das Telefon, also kann der Server es nicht öffnen. Sein Name ist zufällig und die Datei sieht
  aus wie zufällige Bytes, in einer von wenigen Größen, also sagt keines von beiden, dass es von Erevos ist, oder
  genau, wie viel es enthält. Seine Fotos, Dateien und Sprachnachrichten gehen als eigene Uploads, alle gleich groß,
  jeder ebenfalls unter einem zufälligen Namen und mit dem Passwort des Backups versiegelt, an dieses Backup und ihren
  Platz darin gebunden, sodass keiner unbemerkt vertauscht, weggelassen oder aus einem anderen Backup genommen werden
  kann; der Server behält jede, solange eines der Backups, die er behält, sie braucht, und löscht sie dann. Ihre Namen sind so lang wie der des Backups, aber ihre Größe unterscheidet sie von ihm, also kann der Server sie zählen und so ungefähr sagen, wie viel das Backup enthält. Was ein abgebrochenes Backup dort ließ, wird gelöscht, bevor das nächste geht, sodass ein Server ohne Platz wieder welchen hat. Der Server sieht aber dein Konto, wann eines
  kommt und ungefähr wie groß es ist. Auf
  Android gehen Backups dorthin, wie die Wahl des Bereichs unter **Einstellungen** → **Relay und Netze** → **Tor**
  sagt{+, wie bei Matrix}: mit **Alles** nur über Tor, sodass der Server die Adresse des Telefons nicht sieht; mit
  **Nachrichten** über Tor, sobald Tor bereit ist, und direkt, solange Tor startet oder wenn es scheitert; mit
  **Nichts** direkt, und der Server sieht die Adresse des Telefons. Ein Backup wartet zuerst bis zu zwei Minuten, bis
  Tor gestartet ist, und **Auch auf einen Server** sagt, welchen Weg es gerade nimmt. In der Desktop-App schickt sie
  die App selbst, nicht ihre Seite, da eine Seite einen solchen Server nicht erreichen darf; in der Web-App schickt
  sie der Browser, und der erreicht nur einen Server, der so eingestellt ist, dass er die Web-App hereinlässt (CORS),
  was Nextcloud von Haus aus nicht ist. Keine von beiden hat Tor dafür: Solange ein Bereich **Alles** über Tor sendet,
  geht von dort keines. In der Web-App wird das Passwort des Servers im Browser aufbewahrt, versiegelt mit einem
  Schlüssel, den der Browser nicht herausgibt. **Von einem Server wiederherstellen** lädt das gewählte auf demselben
  Weg herunter, über Tor, wie der Bereich sagt, und schreibt dort nichts; ein dafür eingegebenes Passwort dient nur
  dieser Wiederherstellung und wird nicht aufbewahrt. Über Tor kommt keine Datei eines Backups über 64 MB, und direkt keine über 100 MB, das Höchste, das
  Erevos bei einem Download annimmt: Dann lade das Backup und seine Dateien vom
  Server herunter und tippe auf **Backup wiederherstellen**. Ein Erevos vor dieser Version öffnet ein solches Backup
  nicht. Google Drive fehlt mit Absicht: Google verbindet die Datei mit deinem Namen, und Erevos bräuchte die Apps von
  Google und eine Google-Anmeldung auf dem Telefon.
  Der Schalter **Über Tor** jedes Servers, aus, solange du ihn nicht einschaltest, geht der Wahl des Bereichs für
  diesen Server vor: Eingeschaltet gehen seine Backups nur über Tor, was auch die Tor-Einstellung des Bereichs sagt,
  und warten, bis Tor startet, der Server sieht die Adresse des Telefons also nicht. **Von einem Server
  wiederherstellen** und das Formular, das einen Server hinzufügt, haben denselben Schalter, und die
  Nextcloud-Anmeldung folgt dem Schalter des Servers, für den sie anmeldet: Die Seite im Browser selbst geht wie
  immer. Die Desktop-App und die Web-App haben kein Tor: Ein Server mit eingeschaltetem Schalter bekommt von dort
  nichts. Backup-Teile, die du Freunden gibst ([Backup-Teile bei Freunden](#backup-pieces)), tragen den Schalter
  nicht.
- **Chats, die nach dem Backup weitergingen:** Das Wiederherstellen setzt die Schlüssel jeder Unterhaltung so zurück,
  wie sie damals waren. Nachrichten, die nach dem Backup kamen und schon gelesen waren, sind nicht darin. Eine
  Unterhaltung, die nach dem Backup weiterging, würde keine neuen Nachrichten mehr öffnen, also beginnt jeder
  wiederhergestellte Chat, der des Bereichs und der jedes versteckten Ortes beim Öffnen, von selbst und leise eine
  neue Unterhaltung mit jedem Kontakt, aus den neuesten Schlüsseln, die er ihm gab, und ihr {=Erevos} geht darin weiter.
  Bei einem Kontakt, dessen {=Erevos} älter ist, bitte ihn erneut um seinen Kontaktlink. Bevor
  ein wiederhergestellter Chat wieder schreibt, springen seine Unterhaltungen über die Schlüssel hinaus, die sie seit
  dem Backup genutzt haben könnten, sodass nie ein Schlüssel zwei Nachrichten versiegelt: Einer, der zweimal
  versiegelt, würde jedem, der beide Pakete aufbewahrt hat, erlauben, die beiden zusammen zu lesen. In einer Gruppe
  bittet ein wiederhergestelltes Mitglied das Erevos des Admins, es wieder aufzunehmen, was klappt, solange die Gruppe
  nur wenig weitergezogen ist; sonst bitte darum, wieder hinzugefügt zu werden.
- [+] **Matrix, XMPP und Nostr:** Die Konten jedes Bereichs und seiner versteckten Chats sind im Backup. Ein
  **Nostr**-Schlüssel kommt mit seinen Chats zurück, so wie er war. Ein **XMPP**-Konto kommt mit seiner Anmeldung,
  seinen Kontakten, Chats und den Schlüsseln, die es von anderen kennt, und geht als neues Gerät des Kontos weiter: Es
  behält seinen Identitätsschlüssel, sodass die Apps deiner Kontakte seinen Schlüssel weiter kennen, bekommt aber eine
  neue Geräte-ID, eine neue Resource und neue Schlüssel, jede Unterhaltung beginnt von vorn, und das alte Gerät wird aus
  den Gerätelisten des Kontos genommen, sobald es sich verbindet. Nachrichten, die nach dem Backup für das alte Gerät
  verschlüsselt wurden, kann es nicht lesen. Ein **Matrix**-Konto wird auf diesem Telefon aufgegeben, aber nicht auf dem
  Server abgemeldet, denn das würde das Gerät auf dem Telefon beenden, von dem das Backup kam; der Bereich meldet sich
  neu an, als neues Gerät, und sein Sicherheitsschlüssel öffnet die Nachrichten von früher. So, wie sie waren, würden
  die Unterhaltungen eines solchen Geräts Nachrichtenschlüssel wieder benutzen, die die anderen ablehnen, und das
  Telefon, von dem das Backup kam, benutzt das Gerät vielleicht noch.
- **Geschlossene Chats:** Ein Backup enthält auch, was **Klingeln bei Anrufen, wenn geschlossen** und **Melden, wenn
  eine Nachricht kommt** der versteckten Chats sowie **Auch, wenn ein anderer Bereich offen ist** brauchen. So laufen
  sie nach einer Wiederherstellung, auch auf einem anderen Telefon, weiter wie zuvor. Ein Backup von vor dieser
  Version enthält nichts davon: Seine Wiederherstellung lässt sie so, wie das Telefon sie hat.
- **Einstellungen:** Ein Backup enthält die Einstellungen, die zu dir gehören und nicht zum Telefon: die Sprache,{~ die
  Module,} die Vibration, die Benachrichtigungen im Hintergrund und die Zahl auf dem Symbol, die Akkunutzung, den
  Bildschirmschutz, die Fotoqualität, ob sich das Telefon ohne Passwort öffnet, und wie Erevos Telefone in der Nähe
  erreicht (ihre Nachrichten mitnehmen, dasselbe WLAN, Wi-Fi Direct, Wi-Fi Aware und ein LoRa-Funkgerät, das nur dort
  wieder angeht, wo dieses Telefon es kennt). Auf Android enthält es auch die Schnellantworten des Telefons und die
  Anrufe, die es abweist, die einer Kontaktgruppe nur dort, wo dieses Telefon eine Gruppe mit diesem Namen im selben
  Konto hat. Automatische Backups und ihr Server kommen mit ihrem Passwort zurück, aber ohne ihren Ordner, in den
  Android nur das Telefon schreiben lässt, auf dem er gewählt wurde: Auf einem anderen Telefon sagt **Backups**, dass
  einer zu wählen ist, und bis dahin gehen sie nur an den Server.
- **Ein Telefon nach dem anderen:** Ein auf einem zweiten Telefon wiederhergestelltes Backup liest dieselben
  Relay-Warteschlangen wie das erste, und jedes holt Nachrichten, die das andere dann nie bekommt. Nutze es, um auf ein
  neues Telefon umzuziehen, nicht um zwei zu führen.
- **Das alte Telefon ist verloren:** Ein Telefon, das verloren ging oder gestohlen wurde und noch an ist, liest
  weiter die Relay-Warteschlangen, die es kannte, also können Nachrichten dorthin kommen und nie zum neuen Telefon.
  Tippe nach dem Wiederherstellen des Backups auf dem neuen Telefon unter **Backups** auf **Das alte Telefon ist
  verloren** (nach dem Wiederherstellen eines Backups von einem anderen Telefon weist Erevos darauf hin) und sag
  **Warteschlangen wechseln**. Jeder Bereich und seine versteckten Chats ziehen dann auf neue Relay-Warteschlangen um,
  jeder beim nächsten Öffnen hier, und deine Kontakte und Gruppen werden leise benachrichtigt. Die alten
  Warteschlangen werden hier gelesen, bis jeder Kontakt in die neuen schreibt, höchstens 14 Tage, und die Kontaktlinks
  und QR-Codes, die du vorher gabst, gelten 14 Tage, dann nicht mehr. Was über Nostr{+, XMPP oder Matrix} kommt, erreicht
  weiter das alte Telefon. Tippe nach einer weiteren Wiederherstellung erneut darauf.
- **Diskretion:** Jeder Bereich zeigt denselben Backup-Bildschirm, und ein Backup enthält jeden Bereich, also verrät
  keines von beiden, wie viele Bereiche es gibt oder ob versteckte Chats angelegt sind. Die Namen der Dateien sagen, dass
  sie ein Erevos-Backup sind, und ihre Zahl und Größe zeigen ungefähr, wie viel aufbewahrt wird.
- [~] **Die SMS des Telefons:** Auf Android fügt **SMS in Backups aufnehmen** ab dann jedem Backup die SMS und MMS des
  Telefons hinzu, mit bis zu 32 MB ihrer Bilder, solange Erevos die SMS-App ist. Sie werden wie der Rest mit dem
  Passwort des Backups versiegelt. Das Wiederherstellen des Backups legt jede Nachricht, die die SMS des Telefons noch
  nicht haben, dorthin zurück und löscht keine; Erevos muss dann auch die SMS-App sein, sonst wird der Rest ohne sie
  wiederhergestellt. Die SMS gehören dem Telefon und sind in jedem Bereich gleich. Ein älteres Erevos öffnet kein
  Backup, das SMS enthält.
- [~] **Die Anrufe des Telefons:** Auf Android fügt **Anrufe in Backups aufnehmen** unter **Die Anrufe des Telefons** ab
  dann jedem Backup den Anrufverlauf des Telefons (seine neuesten 10.000 Anrufe, ohne Mailbox) und Androids eigene
  Liste blockierter Nummern hinzu, solange Android Erevos den Anrufverlauf lesen lässt; die blockierten Nummern nur,
  solange Erevos die Telefon- oder SMS-App ist. Es ist aus, bis du es einschaltest, und die Wahl geht in die Backups.
  Sie werden wie der Rest mit dem Passwort des Backups versiegelt. Das Wiederherstellen des Backups fügt dem Telefon
  jeden Anruf und jede blockierte Nummer hinzu, die es noch nicht hat, und löscht keine; Erevos muss dann die
  Telefon-App sein (**Einstellungen** → **Telefon und SMS** → **Telefon**), sonst wird der Rest ohne sie
  wiederhergestellt. Android behält etwa die neuesten 500 Anrufe jeder SIM, also können ältere wiederhergestellte
  verschwinden, wenn neue Anrufe kommen. Ein älteres Erevos öffnet kein Backup, das Anrufe enthält.
- [~] **Die SMS in Ordnung:** Die Anheftungen, archivierten Unterhaltungen, der Papierkorb, die Entwürfe, der Spamfilter
  und die Markierungen jedes Bereichs, wie lange eine SMS wartet, bevor sie nicht mehr zurückgeholt werden kann, die
  später zu sendenden SMS (**SMS später**), Einladungen, Namen aus deinen Kontakten, ob Nachrichten an Erevos-Kontakte
  per SMS gehen dürfen, und die für jede Nummer gewählte SIM sind in jedem Backup, wie der Rest mit dem Passwort des
  Bereichs versiegelt. Die gewählte SIM kommt nur auf demselben Telefon zurück, da jedes Telefon seinen SIMs eigene Kennungen gibt: Auf einem anderen gehen SMS und Anrufe über seine Standard-SIM, bis du dort eine wählst. Eine SMS für später, deren Zeit vor der Wiederherstellung kam, geht nicht von selbst, da das
  Telefon, von dem das Backup kam, sie schon gesendet haben kann: Sie erscheint als nicht gesendet, und ein Tippen
  darauf sendet oder löscht sie. Eine, deren Zeit noch kommt, geht zu ihrer Zeit. Ein älteres {=Erevos} öffnet kein
  Backup, das sie enthält; eines, das ein älteres {=Erevos} gemacht hat, wird wie immer wiederhergestellt, ohne sie.
- **Was nie zurückkommt:** Was zum Telefon selbst gehört, kommt mit keinem Backup, also kann eine Wiederherstellung
  auf einem anderen Telefon es nicht bringen: Fingerabdruck oder Gesicht, deren Schlüssel Android im Chip jenes
  Telefons aufbewahrt; die Ordner, in die Erevos schreiben darf, wie der automatischer Backups, in die Android es nur
  auf dem Telefon lässt, auf dem sie gewählt wurden; was Android Erevos erlaubt{~ und welche Apps Anrufe und SMS
  übernehmen}, was nur du auf jedem Telefon erlauben kannst, weshalb sich nach einer Wiederherstellung auf Android
  **Berechtigungen**{~ für die eingeschalteten Module} öffnet;{~ die Anrufliste und Androids eigene Liste blockierter
  Nummern, außer **Anrufe in Backups aufnehmen** war an, wie oben;} und die Zählung falscher Passwörter.{+ Ein XMPP-Konto kommt als neues Gerät
  seiner selbst zurück und Matrix meldet sich neu an, wie oben,}{- Verknüpfte Geräte verknüpfen sich erneut, wie unten.}{+ und verknüpfte Geräte verknüpfen sich erneut, wie
  unten.}
- **Verknüpfte Geräte:** Eine Verknüpfung bleibt bei dem Telefon und dem Computer, auf denen sie gemacht wurde, und
  kein Backup enthält sie, aber ein Backup enthält, was dem Telefon, auf dem es wiederhergestellt wird, erlaubt, jedes
  von ihnen zu bitten, sich erneut zu verknüpfen. Nachdem du ein Backup auf einem anderen Telefon wiederhergestellt
  hast, öffne dort **Einstellungen** → **Daten und Geräte** → **Verknüpfte Geräte**: Tippe unter **Aus der Sicherung**
  auf **Um erneute Verknüpfung bitten** für jedes Gerät, das noch dir gehört, oder auf **Entfernen** für eines, das es
  nicht mehr ist. Das Gerät, das an sein muss, zeigt die Bitte: Tippe dort nur auf **Erneut verknüpfen**, wenn du das
  Backup selbst wiederhergestellt hast, sonst auf **Nicht jetzt**. Es verknüpft sich dann ohne Code zum Scannen mit
  dem neuen Telefon, behält seine Chats und bekommt, was seitdem kam; Nachrichten, die nach dem Backup das alte
  Telefon erreichten, bleiben nur dort. Sobald es erneut verknüpft ist, erreicht weder das alte Telefon noch jemand
  mit demselben Backup es. Eine Bitte gilt 14 Tage, und die Geräte eines versteckten Ortes werden von innerhalb dieses
  Ortes gebeten. Ein Gerät mit einem älteren {=Erevos} zeigt keine Bitte: Tippe darauf auf **Dieses Gerät trennen**, dann
  verknüpfe es wie beim ersten Mal, siehe [Verknüpfte Geräte](#devices). Kontakte mit dieser Version schreiben deinen
  Computern nicht mehr, bis sie sich erneut verknüpfen: Das Telefon gibt ihnen eine neue Liste seiner Geräte, die keines nennt. Geht die Uhr dieses Telefons hinter
  der des verlorenen her, verschwindet diese Liste, sobald sie ihm schreiben, und ihre Chatdetails können sagen, dass
  sie sich am Tag nach deinem Wiederherstellen geändert hat. Das eigene Backup eines verknüpften Computers enthält die
  Chats des Telefons so, wie sie waren, aber
  nicht die Verknüpfung, um darin zu schreiben: Wiederhergestellt lassen sie sich dort lesen, aber nicht darin
  schreiben, und Erevos sagt das einmal. Um darin zu schreiben, verknüpfe diesen Computer erneut mit dem Telefon: Die
  Chats, die das Telefon noch hat, bleiben, mit dem, was seitdem kam, und die anderen verschwinden. Trenne auf dem
  Telefon das Gerät, das er vorher war. Mache die Backups auf dem Telefon.
- **Versionen:** Ein Backup öffnet sich nur in einem {=Erevos}, das so neu ist wie das, das es gemacht hat, oder neuer.
  Eines von einem neueren {=Erevos} wird abgelehnt, und nichts ändert sich: Aktualisiere {=Erevos} zuerst auf die neueste
  Version. Ein {=Erevos} vor 6.0.0 sagt über ein Backup ab 6.0.0, es sei kein Erevos-Backup: Aktualisiere auch dieses.

## Backup-Teile bei Freunden {#backup-pieces}

Das Passwort deiner Backups kann in Teilen an Freunde gehen, unter **Einstellungen** → **Daten und Geräte** →
**Backup-Teile**: Wähle **2 von 3**, **2 von 4**, **3 von 4** oder **3 von 5**, dann ebenso viele Kontakte, und tippe
auf **Teile geben**. Mit automatischen Backups prüft Erevos, dass das Passwort, das du tippst, ihres ist. Mit einem
Server unter **Auch auf einen Server** können die Teile auch dessen Adresse, Benutzernamen und Passwort enthalten,
sodass sich die Backups dort mit ihnen finden und öffnen lassen. Jeder Kontakt bekommt eine Nachricht, die sagt, was
es ist, und sein {=Erevos} bewahrt das Teil getrennt vom Chat auf, unter **Teile, die du für Freunde aufbewahrst**.

1. **Um es zurückzubekommen:** Bitte genug von ihnen um ihre Teile. Jeder tippt neben deinem auf **Code zeigen**, und
   du tippst unter **Deine Teile zusammensetzen** auf **Code scannen**; oder sie tippen auf **Kopieren** und schicken
   dir den Text auf anderem Weg, und du fügst ihn ein und tippst auf **Hinzufügen**; oder, solange dein Telefon das
   Konto noch hat, tippen sie auf **Im Chat zurückgeben**. Dann tippe auf **Zusammensetzen**: Erevos zeigt das
   Passwort, und mit einem Server in den Teilen listet **Von diesem Server wiederherstellen** die Backups dort auf.
2. **Ein neues Passwort:** Sobald deine Backups ein neues Passwort haben, sind die früher gegebenen Teile nutzlos: Gib
   neue.

- **Was ein Teil zeigt:** nichts. Weniger Teile als nötig sagen nichts über das Passwort, wie viel Rechenkraft man
  auch einsetzt: Mit ihnen ist jedes Passwort so wahrscheinlich wie jedes andere. Jedes Teil hat dieselbe Größe,
  welches Passwort es auch ist, und nichts darin nennt dich oder die anderen Freunde.
- **Auf deinem Telefon:** Die Nachricht bleibt im Chat, ihr Teil aber nicht: Sobald es weg ist, bewahrt nichts auf
  deinem Telefon die Teile auf, nur an wen sie gingen. Wer einen deiner Räume öffnet, erfährt, wem du Teile gegeben
  hast, nicht das Passwort. Teile gehen nur an Kontakte des Raums, nicht an versteckte Chats.
- **Was es nicht verhindern kann:** Genug Freunde zusammen können deine Backups öffnen, wenn sie auch die Datei
  bekommen: Wähle Menschen, die sich nicht alle kennen. Jemand kann sich als du ausgeben, mit einer neuen Nummer oder
  einem neuen Konto, um an die Teile zu kommen: Ein Freund sollte ein Teil nur dir persönlich zurückgeben, oder in dem
  Chat, den er schon mit dir hat. Ein Freund, dessen {=Erevos} älter als diese Version ist, sieht die Nachricht, bewahrt
  aber kein Teil auf.

**Warum:** Ein Backup ist nur so sicher wie sein Passwort, und ein starkes Passwort geht leicht verloren. So geteilt
(Shamirs Geheimnisteilung) hält kein einzelner Freund und kein Relay etwas, das es öffnet.

## Auf ein neues Telefon umziehen {#new-phone}

Alles, was Erevos aufbewahrt, kommt in einem Backup auf ein neues Telefon: jeder Bereich mit seinen versteckten Chats,
Kontakten, Nachrichten, Fotos{~, Dateien und seiner Sammlung| und Dateien}, seine Konten und Relays, die Sperre, das Panik-Passwort und
deine Einstellungen. Kein Server hält eine Kopie davon für dich, also kommt nichts von allein hinüber: Das Backup
trägt es, versiegelt mit seinem Passwort.

1. **Auf dem neuen Telefon {=Erevos} installieren:** dieselbe Version wie auf dem alten Telefon oder eine neuere, denn ein
   älteres {=Erevos} weigert sich, ein Backup zu öffnen, das ein neueres gemacht hat. Ohne Internet kann das alte Telefon
   es weitergeben, siehe [Erevos an ein Telefon in der Nähe](#give-app).
2. [~] **Auf dem alten Telefon alles vorbereiten:** Damit auch die SMS des Telefons mitkommen, schalte **SMS in Backups
   aufnehmen** unter **Backups** ein, und für seinen Anrufverlauf **Anrufe in Backups aufnehmen**. Eine Sammlung, die nicht in den Backups ist, bleibt zurück: Nimm sie wieder auf
   oder gib ihr einen WebDAV-Server, siehe [Sammlung](#collection).{+ Halte deinen Matrix-Sicherheitsschlüssel bereit,
   denn Matrix meldet sich auf dem neuen Telefon neu an.}
3. **Auf dem alten Telefon das Backup machen:** Tippe unter **Einstellungen** → **Daten und Geräte** → **Backups** auf
   **Backup erstellen**, oder bei automatischen Backups auf **Jetzt sichern**. Mach es als Letztes, kurz vor dem Umzug,
   und öffne Erevos auf dem alten Telefon danach nicht mehr: Was danach kommt, wartet auf den Relays auf das neue.
4. **Hinüberbringen:** Kopiere das Backup und jede Datei, deren Name wie seiner beginnt, alle in einem Ordner, per
   Kabel, Speicherkarte oder Cloud-App auf das neue Telefon. Ein Backup auf deinem Server muss nicht kopiert werden.
5. **Auf dem neuen Telefon wiederherstellen:** Tippe beim ersten Start auf **Ich habe {=Erevos} schon auf einem anderen
   Telefon** (oder geh durch den ersten Start).{~ Auf Android lass Erevos auch dort die SMS-App sein, wenn du die SMS
   willst.} Tippe dann unter **Einstellungen** → **Daten und Geräte** → **Backups** auf **Backup wiederherstellen** und
   wähle die Datei, oder auf **Von einem Server wiederherstellen** und gib Adresse, Benutzernamen und Passwort des
   Servers ein; tippe das Passwort des Backups ein und sag Ja. Erevos öffnet sich, wie das alte Telefon war, mit
   denselben Passwörtern.
6. **Auf dem neuen Telefon neu einstellen, was zum Telefon gehört:** **Berechtigungen** öffnet sich für das, was
   Android erlauben soll. Schalte dann Fingerabdruck oder Gesicht wieder ein (siehe [Passwortsperre](#lock)), wähle den
   Ordner der automatischen Backups unter **Backups** neu, dazu die SIM für jede Nummer{+, und melde dich mit seinem
   Sicherheitsschlüssel bei Matrix an}.
7. **Auf dem alten Telefon Erevos löschen:** Sobald das neue Telefon deine Chats zeigt und neue Nachrichten dort
   ankommen, tippe unter **Einstellungen** → **Datenschutz und Sicherheit** → **Panikknopf** auf **Jetzt alles
   löschen**. Nicht auf **Von überall löschen**: Das löscht die Relay-Warteschlangen, die das neue Telefon liest.

- **Ein Telefon auf einmal:** Beide Telefone lesen dieselben Relay-Warteschlangen, und eine Nachricht geht an das, das
  sie zuerst abholt, das andere bekommt sie nie. Lass das alte ab dem Backup geschlossen und lösche es am Ende.
- **Deine Kontakte:** Jeder Bereich behält sein Relay, sein Token und sein Heim-Relay, also musst du nichts neu
  eintippen und keine Einladung erbitten. Deine Kontakte schreiben dir wie zuvor.
- **Versteckte Chats:** Jeder versteckte Ort kommt mit dem Backup, jeder mit seiner PIN, und nichts auf dem neuen
  Telefon verrät, dass es welche gibt, siehe [Versteckte Chats](#hidden).
- [+] **Matrix, XMPP und Nostr:** Ein Nostr-Schlüssel geht weiter wie zuvor, ein XMPP-Konto als neues Gerät seiner selbst,
  und Matrix meldet sich als neues Gerät neu an, sein Sicherheitsschlüssel öffnet die Nachrichten von früher, siehe
  [Backups](#backup).
- **Verknüpfte Geräte:** Tippe auf dem neuen Telefon unter **Einstellungen** → **Daten und Geräte** → **Verknüpfte
  Geräte** auf **Um erneute Verknüpfung bitten** für jeden Computer oder Browser, der noch dir gehört, dann auf ihm
  auf **Erneut verknüpfen**: Er behält seine Chats, ohne Code zum Scannen. Die Geräte eines versteckten Ortes von
  innerhalb dieses Ortes. Bei einem Gerät mit einem älteren {=Erevos}: Tippe darauf auf **Dieses Gerät trennen**, dann
  verknüpfe es mit dem neuen Telefon wie beim ersten Mal. Siehe [Backups](#backup).
- [~] **Die Sammlung:** Sie kommt in den Dateien des Backups. Eine, die nicht in den Backups ist, kommt nur von ihrem
  WebDAV-Server, jede Datei beim Öffnen; eine mit keinem von beidem bleibt auf dem alten Telefon, und das Löschen
  löscht sie.
- **{~Module und Einstellungen:** Die eingeschalteten Module, die|Einstellungen:** Die} Sprache und deine anderen Einstellungen kommen mit dem
  Backup. Was Android für jedes Telefon einzeln aufbewahrt, bleibt dort, wie das, was es Erevos erlaubt{~; der
  Anrufverlauf und seine gesperrten Nummern kommen auch mit, wenn **Anrufe in Backups aufnehmen** an ist}.
- **Eine Datei fehlt:** Fehlt eine Datei des Backups oder ist sie beschädigt, sagt Erevos, welche, und ändert nichts,
  außer du wählst, den Rest ohne sie wiederherzustellen.
- **Wenn das alte Telefon verloren ist:** Stelle dein neuestes Backup so bald wie möglich auf dem neuen Telefon wieder
  her, auch von deinem Server, tippe dann unter **Backups** auf **Das alte Telefon ist verloren**, damit es nichts
  mehr von dir auf den Relays liest. Hast du das Passwort des Backups verloren, können Freunde, die seine Teile halten, es
  zurückgeben, siehe [Backup-Teile bei Freunden](#backup-pieces).

**Warum:** Erevos hält nichts von dir auf einem Server, der es herausgeben könnte, also bringt kein Konto deine Chats
auf ein neues Telefon. Ein Backup, versiegelt mit seinem Passwort, trägt alles, und nur du kannst es öffnen.

## Panikknopf {#panic}

Wenn du in Gefahr bist, kann Erevos sich sofort löschen, unter **Einstellungen** → **Datenschutz und Sicherheit** →
**Panikknopf**: Tippe auf **Jetzt alles löschen** und bestätige mit **Löschen**. Auf Android, in der Web-App, auf einem
Computer und auf Sailfish OS.

Um ihn im Notfall schnell zu finden, steht er auch ganz oben, in Rot, im Menü **⋯** des Startbildschirms, und wer das
Schloss oben auf dem Startbildschirm gedrückt hält, öffnet ihn sofort. Ein Tippen auf das Schloss sperrt weiterhin;
nur Gedrückthalten öffnet den Panikknopf, und dort fragt **Jetzt alles löschen** noch einmal nach.

- **Was gelöscht wird:** jeder Raum mit seinen versteckten Chats, mit ihren Kontakten, Nachrichten, Fotos, Dateien und
  Schlüsseln; die Sperre und ihre Passwörter; {+die Matrix-, XMPP- und Nostr-Konten und }die Relay-Tokens; Einstellungen
  und Passwort der automatischen Backups und ihres Servers. Auf Android schließt Erevos sich danach und startet beim
  nächsten Mal wie frisch installiert. Mit **Auch die automatischen Backups in** ausgewählt werden zuerst die
  Backup-Dateien dort gelöscht.
- **Was bleibt:** was Erevos nicht erreicht: Backups, die du anderswohin kopiert oder an einen Server geschickt hast
  (ihr Passwort schützt sie weiter), was das Relay für dich bereithält, bis es abläuft, und was deine Kontakte haben.

1. **Aus einer Panik-App:** Auf Android löscht eine Panik-App wie Ripple die Apps, die du wählst, mit einer Geste.
   Installiere eine und wähle darin Erevos: Erevos öffnet diese Seite, nach seinem Passwort, und fragt. Tippe auf
   **Zustimmen**.
2. **Nur diese App:** Nur die App, der du zugestimmt hast, kann Erevos löschen, und nur solange **Eine Panik-App darf
   Erevos löschen** eingeschaltet ist. Erevos prüft den Namen der App und ihre Signatur: Eine andere App, oder derselbe
   Name von jemand anderem neu installiert, kann es nicht. Ein Update der App, das auf einen neuen Schlüssel wechselt,
   wie Android es erlaubt (Schlüsselrotation), bleibt vertrauenswürdig. **Nicht mehr vertrauen** beendet es.
4. **Wenn Erevos abgelehnt hat:** Wenn die vertrauenswürdige App das Löschen verlangt hat, während der Schalter aus war
   oder sie mit einem anderen Schlüssel signiert war, sagt diese Seite es in Rot, mit Tag und Uhrzeit. Ist die App mit
   einem anderen Schlüssel signiert, vertraut **… so vertrauen, wie es jetzt ist** ihr erneut: Stimme nur zu, wenn du
   sie selbst aktualisiert hast.
3. **Nach dem Löschen:** Auch die Panik-App ist vergessen: Stimme ihr erneut zu, wenn du Erevos wieder einrichtest.

- **Auf einem Computer und auf Sailfish OS:** Es gibt keine Panik-App, nur **Jetzt alles löschen**, mit **Auch die
  automatischen Backups in** ihrem Ordner, wenn du es wählst. Auf einem Computer startet Erevos danach wie frisch
  installiert; auf Sailfish OS schließt es sich. Der Eintrag für Erevos im Schlüsselbund bleibt auf einem Computer, aber
  was er versiegelt hat, ist weg, er öffnet also nichts.
- **Was es nicht verbergen kann:** Auf dem Telefon sieht man auch ohne Passwort, dass Erevos installiert ist und dass
  eine Panik-App es löschen darf, aber nicht, was darin war.
- **Andere Apps benachrichtigen (Android):** Unter **Andere Apps benachrichtigen** wählst du die Apps, die Erevos beim
  Löschen benachrichtigt, wie eine Panik-App, über die Taste, das Panik-Passwort oder eine Panik-App. Jede fragt dich
  zuerst, ob Erevos darf. Fasouli sperrt sich dann: Es schließt sich und fragt beim Öffnen wieder nach seiner Sperre.

**Warum:** An einer Grenze oder bei einer Festnahme bleibt vielleicht keine Zeit, jeden Chat zu öffnen. Ein Tippen,
oder die Geste einer Panik-App, lässt nichts zum Öffnen zurück.

### Panik-Passwort

Bei eingeschalteter Passwortsperre bietet derselbe Bildschirm ein **Panik-Passwort**: ein eigenes Passwort, das, auf
dem Sperrbildschirm eingegeben, Erevos löscht wie **Jetzt alles löschen**. Auf Android, in der Web-App, auf einem
Computer und auf Sailfish OS.

1. Tippe auf **Panik-Passwort festlegen**, gib es zweimal ein (mindestens 4 Zeichen) und tippe auf **Speichern**. Es
   muss sich von jedem Passwort deiner Bereiche unterscheiden: Erevos lehnt eines ab, das einen Bereich öffnet, und
   kein Passwort eines Bereichs kann später dazu werden.
2. Auf dem Sperrbildschirm eingegeben, zeigt es **Falsches Passwort**, wie jedes falsche, und Erevos löscht sofort
   alles. Auf Android schließt Erevos sich danach und öffnet beim nächsten Mal wie frisch installiert, und die
   automatischen Backups in ihrem Ordner werden ebenfalls gelöscht, wenn **Auch die automatischen Backups in** unter
   **Aus einer Panik-App** eingeschaltet ist; anderswo bleiben sie.
3. **Panik-Passwort ausschalten** macht es wieder nur zu einem falschen Passwort. Legst du es erneut fest, ersetzt es
   das vorherige. Schaltest du die Passwortsperre aus, wird es ebenfalls ausgeschaltet.

- **Nichts verrät es:** Erevos hält vom ersten Start an einen Platz für ein Panik-Passwort bereit, zufällig, bis eines
  festgelegt ist, und danach gleich geformt, und prüft ihn bei jedem auf dem Sperrbildschirm eingegebenen Passwort,
  auf dieselbe Weise und gleich lange. Weder was das Telefon aufbewahrt noch wie lange eine Prüfung dauert, verrät
  also, ob eines festgelegt ist, und dieser Bildschirm kann es dir auch nicht sagen: Wenn du unsicher bist, lege es
  erneut fest.
- **Nur auf dem Sperrbildschirm:** Überall sonst, wo Erevos nach einem Passwort fragt, ist es nur ein falsches. Backups
  behalten es so, wie es war, als sie gemacht wurden. Solange falsche Versuche den
  Sperrbildschirm warten lassen (siehe [Passwortsperre](#lock)), wartet es auch.

**Warum:** Jemand kann dich zwingen, Erevos zu öffnen. Mit einem Panik-Passwort kannst du ihm scheinbar deines geben,
und was er sehen würde, ist weg, bevor sich der Bildschirm ändert.

## Von überall löschen {#forget}

Wenn du willst, dass weg ist, was die Server für dich speichern, unter **Einstellungen** → **Datenschutz und Sicherheit** →
**Von überall löschen**: tippe auf **Von überall löschen** und sage zweimal ja. Dein Telefon behält alles, was es hat; das ist
nicht der [Panikknopf](#panic), der das Telefon löscht.

- **Was verschwindet:** jede Warteschlange, die dieser Bereich auf den Relays hat, mit den wartenden Nachrichten: deine eigene,
  die, die dein Kontaktlink nennt, die deiner Gruppen, deiner Kontakte, deines Heim-Relays, {+die für Matrix- und XMPP-Hinweise,
  }die Türen deiner öffentlichen Gruppen und die deiner verknüpften Geräte. Dazu die Nachrichten, die ein Relay für dich zum
  späteren Senden hält, die Dateien, die angekommen sind und dort warten, und die Einladungen, die du gemacht hast und die
  niemand benutzt hat. Versteckte Chats, die auch geschlossen empfangen, gehen mit dem Bereich; die anderen, wenn du sie
  öffnest, während der Bereich angehalten ist. Die Listen auf dem Bildschirm lassen versteckte Chats aus, damit sie nie zeigen,
  dass es welche gibt. Erevos bittet außerdem jedes Nostr-Relay, die Schlüssel zu vergessen, auf denen deine Chats
  lesen (eine Bitte zu verschwinden, NIP-62): über Tor, wenn Tor an ist, direkt, wenn es aus ist. Ist Tor an, aber noch
  nicht bereit, wird Nostr nicht gefragt; warte, bis es so weit ist, und lösche noch einmal.
- [+] **Matrix, XMPP, Nostr:** mit **Auch von Matrix und XMPP abmelden und das hier erstellte Nostr-Konto löschen** werden diese
  Konten hier abgemeldet. Die Konten selbst bleiben auf ihren Servern, die ihnen gehören, nicht Erevos. Ein Nostr-Konto aus
  einer anderen App bleibt unberührt.
- **Der Bereich ist angehalten:** Er empfängt und sendet nichts, damit nicht sofort wieder eine Warteschlange entsteht (Erevos
  legt eine verlorene Warteschlange von selbst neu an). **Wieder starten** beendet das: Neue Warteschlangen werden angelegt,
  wie nachdem ein Relay sie verloren hat, und deine Kontakte werden leise informiert. Gib ihnen auch einen neuen Kontaktlink,
  denn die alten nennen Warteschlangen, die es nicht mehr gibt.
- **Was es nicht erreicht:** die Telefone deiner Kontakte, Nostr-Relays, die der Bitte nicht folgen, {-und }Dateien, die du über einen
  Dateiserver gesendet hast{+, und die Matrix- und XMPP-Server}. Der Bildschirm listet, was gelöscht wurde, was schon weg war und
  was nicht erreicht wurde; **Noch einmal löschen** versucht den Rest.

**Warum:** Ein Relay, auch ein vertrauenswürdiges, ist ein Ort, der etwas von dir aufbewahrt. Das ist der eine Tipp, der alles
zurücknimmt, ohne das Telefon zu löschen, für den Fall, dass du ein Relay verlässt oder ein Kapitel deines Lebens schließt.

## Importierte Chats {#import}

Deine alten Chats aus Telegram und WhatsApp können in Erevos kommen, zum Lesen, mit ihren Fotos, Videos,
Sprachnachrichten und Dateien, und die aus Viber mit ihren Worten. Sie bleiben auf diesem Telefon, versiegelt in dem
Bereich, in den du sie holst, und gehen an niemanden, außer du teilst einen mit der Person, mit der er war (unten).

Exportiere den Chat zuerst aus der anderen App:

- **WhatsApp:** Öffne den Chat, dann **Mehr**, **Chat exportieren**, **Medien einbeziehen**, und speichere die .zip
  auf dem Telefon. **Ohne Medien** bringt nur die Worte.
- **Telegram Desktop:** **Chatverlauf exportieren**, Format **JSON**, mit den Fotos, Videos, Sprachnachrichten und
  Dateien, die du willst. Mache dann eine .zip aus dem Ordner, den es angelegt hat (unter Windows: Rechtsklick darauf,
  **Senden an**, **ZIP-komprimierter Ordner**), und kopiere die .zip auf das Telefon. **result.json** allein bringt
  nur die Worte.
- **Viber:** Viber selbst exportiert keine Chats. Auf Android speichert die App **Backup Text for Viber** einen als
  .html-Datei: Kopiere diese auf das Telefon. Nur die Worte kommen herein, mit den Emoticons von Viber als Emoji. Deine
  eigenen Nachrichten tragen dort keinen Namen, also kommen sie als **Ich** herein, schon als du ausgewählt.
  Nachrichten von einem Tag, bevor es Viber gab, etwa 1970, stammen von einem Telefon, dessen Uhr falsch ging: Sie
  kommen ohne Zeit herein.

Dann:

1. Öffne in Erevos **Einstellungen** → **Daten und Geräte** → **Importierte Chats**, tippe auf **Datei importieren**
   und wähle dann die Datei.
2. Erevos sagt, was es gefunden hat, mit wie vielen Fotos und Dateien und wie groß sie zusammen sind. Tippe auf deinen
   eigenen Namen, damit deine Nachrichten rechts erscheinen, und tippe auf **Behalten**. Die Dateien kommen eine nach
   der anderen herein, und es sagt, wie viele und welcher Anteil davon drin ist. **Abbrechen** beendet es dann und
   behält keine davon.
3. Lösche die Exportdatei selbst vom Telefon: Erevos behält eine eigene versiegelte Kopie, aber die Datei, die du
   gespeichert hast, ist nicht versiegelt.

Um die Unterhaltung in Erevos fortzusetzen, braucht die andere Person auch Erevos:

1. Füge sie mit **Neuer Chat** als Kontakt über das Relay hinzu, wie in [Chat über ein Relay](#relay).
2. Öffne den importierten Chat, tippe auf **In Erevos weiterführen** und wähle sie.
3. Ihr Chat zeigt jetzt die alten Nachrichten vor den neuen, als wären sie immer in Erevos gewesen: in Blasen, nach
   Tag, mit ihren Zeiten, und **Weiter in Erevos** zwischen ihnen und den neuen. **Chat öffnen** bringt dich dorthin,
   und ein Kontakt, dem du keinen Namen gegeben hast, übernimmt den Namen des importierten Chats.

**Aus dem Chat heraus:** Der Chat eines Kontakts hat **Importierte Chats** in seinen **Details**, über
**Privatsphäre**. **Chat hierher importieren** holt eine Datei direkt in diesen Chat, ohne den Weg über
**Einstellungen**: Wenn die Datei mehrere Chats enthält, wie ein Telegram-Export aller Chats, fragt es, welcher hier
weitergeht, und bietet den längsten an. Jeder importierte Chat, der dort weitergeht, wird mit drei Tasten aufgeführt:

- **Nur im Chat behalten** nimmt ihn aus **Einstellungen** → **Daten und Geräte** → **Importierte Chats** heraus: Er
  erscheint nur in diesem Chat, als wäre er immer dort gewesen. Ein aus den Details des Chats geholter Chat wird von
  Anfang an so behalten. **Auch in Importierte Chats zeigen** legt ihn zurück in die Liste, und das tut auch die Liste
  selbst, wenn dieser Kontakt nicht mehr da ist.
- **Trennen** sorgt dafür, dass er nicht mehr im Chat erscheint; er bleibt in **Importierte Chats**, zum Lesen oder um
  ihn mit jemand anderem fortzusetzen.
- **Löschen** löscht ihn vom Telefon, mit seinen Fotos und Dateien, nach einer Rückfrage.

**Warum:** Ein alter Chat gehört zu der Person, mit der er war, also wird er dort hereingeholt, aufbewahrt und gelöscht,
wo du mit ihr redest, und die Liste in **Einstellungen** behält nur, was sonst nirgendwohin gehört. Nichts davon
verlässt das Telefon, außer du teilst ihn.

- **Fotos, Videos, Sprachnachrichten und Dateien** kommen aus einer .zip herein, jedes in diesem Bereich versiegelt,
  wie eine Datei in einem Chat. Fotos erscheinen im Chat, wenn du zu ihnen scrollst, und Sticker als Sticker; tippe
  auf ein Foto oder eine Datei, um es für sich zu sehen und mit **Speichern** zu speichern. Sprachnachrichten und Lieder
  spielen mit einem Tippen direkt im Chat; ein Video spielt in der eigenen App des Telefons, sobald es gespeichert ist.
  Halte eine importierte Nachricht gedrückt, um sie mit **Kopieren** zu kopieren oder ihre Datei mit **Öffnen** zu
  öffnen. **In diesem Chat suchen** findet auch die importierten Nachrichten. Dateien über 4 GB, und die, die der
  Export nicht enthält, bleiben zurück, und der Chat sagt, wo eine war.
- **Platz auf dem Telefon:** Während eine .zip hereinkommt, braucht das Telefon etwa ihre doppelte Größe frei, da
  Erevos eine Kopie davon liest und die Dateien versiegelt aufbewahrt. Backups enthalten auch importierte Dateien,
  wie andere Dateien.
- **Nur zum Lesen:** Importierte Nachrichten werden nicht als Nachrichten gesendet, also hat das andere Telefon sie nur,
  wenn du den Chat mit ihm teilst. Erevos kann nicht zeigen, wer sie wirklich geschrieben hat.
- **Hinweise und Anrufe** aus der anderen App werden weggelassen, und der Chat sagt, wie viele.
- **Auch in versteckten Chats:** In den **Details** eines versteckten Chats bewahrt **Chat hierher importieren** den
  Chat bei diesem Platz auf, mit seinem Schlüssel verschlüsselt, und zeigt ihn nur in diesem Chat, nie in
  **Einstellungen** → **Daten und Geräte** → **Importierte Chats**; dort kann er nur gelöscht werden. Ein in versteckte
  Chats verschobener Chat nimmt die in ihn importierten Chats mit, dort nur in ihm aufbewahrt, und bringt sie zurück,
  wenn er zurückzieht.
- **Nachrichten löschen** in einem Chat lässt die importierten stehen: Lösche diese in den **Details** des Chats, unter
  **Importierte Chats**, oder in **Einstellungen** → **Daten und Geräte** → **Importierte Chats**.

**Teile ihn mit ihr:** Die Person, mit der ein importierter Chat weitergeht, kann ihn auch bekommen. In den **Details**
ihres Chats, unter **Importierte Chats**, tippe auf **Mit … teilen** mit ihrem Namen; unter **Einstellungen** → **Daten
und Geräte** → **Importierte Chats** hat ein Chat, der mit jemandem weitergeht, denselben Knopf, der den Chat mit ihr
öffnet. Erevos sagt, wie viele Nachrichten und wie viele MB gehen, und fragt zuerst. Dann gehen alle mit ihr
importierten Chats zusammen, ganz gleich, wie groß, jede Nachricht mit jedem behaltenen Foto, Video, jeder
Sprachnachricht und Datei, nur an sie, Ende-zu-Ende-verschlüsselt über dein Relay, und der Chat sagt, dass du ihn
geteilt hast.

- **Auf ihrer Seite** ist nichts zu tun: Ihr {=Erevos} behält die Nachrichten sofort, sagt im Chat, wer sie geteilt hat,
  woher und wie viele, und zeigt sie vor den neuen, nur zum Lesen, wie einen importierten Chat. Die Fotos und Dateien
  kommen nach und nach dazu, und unter dieser Zeile steht, wie viele schon da sind, **Dateien: 3 von 10**. Die Seiten
  sind vertauscht: Was du geschrieben hast, steht als von dir da, links, und in einem Chat zu zweit steht, was sie
  geschrieben hat, als ihr eigenes rechts; in einer Gruppe behält jeder seinen Namen. Er bleibt dort nur in eurem Chat,
  und sie kann ihn in seinen **Details** löschen. Ihre verknüpften Geräte behalten nur die Nachrichten.
- **Erneut geteilt** tritt er an die Stelle der Kopie, die sie hatte, also ist er nie zweimal da. Ein Chat, den jemand
  mit dir geteilt hat, wird nicht weitergeteilt.
- **Nur mit ihr:** nur mit einem Erevos-Kontakt, mit dem der Chat weitergeht, nie mit einer Gruppe, und er lässt sich
  nicht weiterleiten. In versteckten Chats geht es genauso, und auf ihrer Seite bleibt er an dem Ort, an dem euer Chat
  ist, auch in versteckten Chats.
- **In Runden:** Die Fotos und Dateien gehen nach den Nachrichten, ein paar Dutzend MB auf einmal: Jede Runde wartet auf
  deinem Relay, bis ihr Telefon sie abholt und dort löscht, dann geht die nächste. So geht ein Chat jeder Größe, jede
  Datei bis zu 4 GB, und braucht wenig vom Platz des Relays, den sich andere Dateien teilen; ist das Relay voll, wartet
  Erevos und fragt wieder, jedes Mal etwas später. Es geht weiter, wann immer Erevos auf beiden Telefonen läuft, auch
  nachdem eines eine Weile aus oder offline war; eine Runde, die 12 Tage nicht abgeholt wurde, kommt wieder aufs Relay,
  bevor sie abläuft. Eine seither vom Telefon gelöschte Datei wird als zurückgeblieben genannt.
- **Wie weit es ist**, steht unter deiner Zeile im Chat, **Wird geteilt, 40 %**. Tippe darauf für **Teilen beenden**:
  Was auf dem Relay wartet, wird entfernt, und ihr {=Erevos} löscht, was davon angekommen ist. Löscht sie die Chats, endet
  es genauso.
- **Von einem Relay, von dem ihr Erevos nicht von selbst holt**, warten die Chats bei ihnen auf ein Tippen auf ihre
  Zeile; dann steht dort, wie weit sie sind, **Kommt an, 40%**, und deine Zeile sagt **Teilen · ihr Telefon holt es gerade**. Konnten sie nicht geholt werden, sagen es beide Telefone, und ihres vibriert zweimal: Sie tippen erneut, um es
  noch einmal zu versuchen. Sie ohne Tor von dort zu holen, zeigt diesem Server ihre Internetadresse, und Erevos sagt
  das zuerst.
- **Ein älteres Erevos** bekommt stattdessen eine Datei, **Chat aus Telegram.json**, mit den Nachrichten darin als Text,
  und keines der Fotos und keine der Dateien.

> Die Datei der importierten Chats wächst mit dem, was du hereinholst, also verrät ihre Größe ungefähr, wie viel
> importiert wurde, aber nicht in welchen Bereich.

## Darstellung {#appearance}

**Darstellung** folgt Fasouli und der LPHL-Website. Sie ist unter **Einstellungen** → **Darstellung**, in Teilen,
die sich jeweils einzeln öffnen: **Stil und Farben** (das Aussehen, Glas, Stil, Design, Farben und Text auf farbigen
Flächen unten, mit der **Vorschau**), **Hintergrund**, **Nachrichten** und auf Android **Startbildschirm-Symbole** und
**Widget**.

| Einstellung | Auswahl |
| --- | --- |
| **Aussehen** | **Flach** oder **Glass** wie auf lphl.nekten.eu. Glas gibt es in zwei Arten: **Scheiben** (jede Karte eine Glasscheibe über dem Hintergrund) und **Eine Scheibe** (jeder Bildschirm auf einer mattierten Scheibe). |
| **Stil** | **Classic** (das Dunkel und Gold von Erevos), **Modernist** (Inter Tight), **Nocturne** (immer dunkel, mit eigenen Farben), **Neon** (Cyan- und Magenta-LEDs, die leuchten, über einem Raster, das zu einer untergehenden Sonne läuft), **Matrix** (Grün auf Schwarz in Monospace, mit Code, der dahinter herabregnet), **Paper** (Füllerblau auf Creme, in einer Serifenschrift, über linierten Zeilen mit rotem Rand), **Aurora** (Violett auf Fast-Weiß, sanft und rund, über Lichtflecken in Minze, Flieder und Pfirsich), **Material You** (die eigenen Farben des Telefons, auf Android 12 und neuer) und **Eigener** (deine eigene Grundfarbe und Akzentfarbe). |
| **Design** | **System**, **Hell** oder **Dunkel**. Nocturne, Neon und Matrix sind immer dunkel, Paper und Aurora immer hell, und „Eigener“ ist hell oder dunkel, je nach seiner Grundfarbe. Material You folgt ihm. |
| **Farben** | Die eigenen des Stils, eine der zwölf LPHL-Paletten oder **Meine Farbe**. Eine Palette unter einem Stil mit eigenen Farben zu wählen, kehrt zum vorher gewählten Stil zurück. |
| **Eigener** | Mit gewähltem **Eigener**: seine **Grundfarbe** (acht helle, acht dunkle) und seine **Akzentfarbe**. Der Text und die Flächen werden aus der Grundfarbe gemacht, und jede Farbe wird geprüft, ob sie darauf lesbar ist. |
| **Text auf farbigen Flächen** | **Weiß**, **Wie die Palette** oder **Meine Farbe**. |
| **Schrift** | Die Schrift jedes Textes: **Die des Stils**, **Die des Telefons**, **Serifen** (kleine Striche an den Enden der Buchstaben, wie in Büchern) oder **Feste Breite** (jeder Buchstabe gleich breit, wie auf einer Schreibmaschine). |
| **Hintergrund** | Was hinter jedem Bildschirm liegt: **Wie der Stil** (die eigene Szene oder das Leuchten des Stils), **Schlicht** oder ein Muster, blass in der Akzentfarbe gezeichnet: **Punkte**, **Raster**, **Streifen**, **Sterne**, **Lichter** (weiche Lichtkreise) oder **Verlauf**; oder **Foto**, ein eigenes Foto, verkleinert, neu gezeichnet und versiegelt, unter einem Schleier, damit der Text lesbar bleibt (**Foto ändern** wählt ein anderes). Der Passwortbildschirm zeigt stattdessen den des Stils. |
| **Nachrichten** | Wie ein Chat Nachrichten zeichnet: **Rund** (runde Blasen), **Eckig** (eckige) oder **Linie**, keine Blase, sondern eine Linie neben dem Text, wie in einem Protokoll. |
| **Textgröße** | Wie groß der Text der Nachrichten ist: **Klein**, **Normal**, **Groß** oder **Größer**. Der Rest des Bildschirms bleibt, wie er ist. |

Ein neu installiertes Erevos beginnt mit **Glass** (**Scheiben**), **Modernist**, **System**, **Meine Farbe** in Himmelblau, Text **Wie die Palette**, Schrift **Die des Telefons** und **Eckig** gezeichneten Nachrichten. Ein vorher gewähltes Aussehen bleibt, wie es war.

Neon, Matrix, Paper und Aurora zeichnen ihre eigene Szene hinter jeden Bildschirm, „Eigener“ behält die gewählte
Grundfarbe und Material You die Farben des Telefons, also wartet **Glass**, solange sie gewählt sind. Der Regen steht
still, wenn das Telefon auf reduzierte Bewegung eingestellt ist.

Die **Vorschau** zeigt ein paar Nachrichten und Tasten im gewählten Aussehen. Jede Kombination wird geprüft, damit der
Text immer gut lesbar ist, auch auf Glas.

- **Jeder Bereich behält sein eigenes Aussehen.**
- **Der Passwortbildschirm** zeigt das zuletzt genutzte Aussehen. Dafür wird es außerhalb der versiegelten Daten
  aufbewahrt: Es sagt nichts über deine Chats, aber wer das Telefon öffnet, sieht, welches Aussehen du nutzt.
- **Material You** übernimmt die Farben, die Android aus deinem Hintergrundbild macht (Android 12 und neuer), hell
  oder dunkel, wie **Design** es sagt, mit runden Tasten und sanft abgerundeten Karten, in der eigenen Schrift des
  Telefons. Ein neues Hintergrundbild ändert sie auch in Erevos, sobald es wieder sichtbar ist. Sie werden auf dem
  Telefon gelesen und gehen nirgendwohin. Auf älterem Android und auf einem Computer wird es nicht angeboten.
- **Startbildschirm-Symbole** (Android): die Farbe jedes Symbols von Erevos unter den Apps des Telefons, **Erevos**
  (rot, es öffnet die Erevos-Chats oder den Chat, den du offen gelassen hast){~, **Telefon** (grün, es öffnet die
  Wähltasten), **SMS** (blau, es öffnet die SMS-Liste)} und **Kontakte** (violett): rot, orange, grün, blau, violett
  oder dunkel. Jedes Tippen öffnet, was sein Symbol nennt, auch wenn Erevos gerade ein anderes davon zeigte. Die Farbe
  gehört dem Telefon, nicht jedem Bereich, da die Symbole erscheinen, bevor Erevos entsperrt ist. Nach einer Änderung
  nehmen manche Launcher das Symbol vom Startbildschirm: Füge es aus der App-Liste wieder hinzu.
- [~] **Kamera** (Android, unter **Startbildschirm-Symbole**): die Kamera von Erevos mit einem Tippen. **Kamera unter die
  Apps des Telefons legen** fügt ein eigenes Symbol hinzu (zuerst orange, in jeder Farbe), und hältst du das Symbol von
  Erevos gedrückt, bietet es auch **Kamera** an, das sich auch auf den Startbildschirm ziehen lässt. Beides öffnet die
  Kamera der Sammlung, hinter dem Passwort von Erevos und dem der Sammlung, und was sie aufnimmt, kommt direkt in die
  Sammlung. Beides zeigt sich nicht, solange die Sammlung in **Module** aus ist oder der Rechner an der Stelle von Erevos
  steht.
- **Punkte und Zahlen auf den Symbolen** (Android): Android gibt den Punkt oder die Zahl einer Meldung der App, nicht
  einem ihrer Symbole. Auf den meisten Launchern, etwa denen von Pixel und GrapheneOS, dem von Samsung, dem von Xiaomi
  und Kvaesitso, zeigt sich daher jede Meldung von Erevos (eine Nachricht, {~eine SMS, |}ein Anruf, ein Geburtstag) gleich
  auf den Symbolen Erevos{~, Telefon, SMS und| und} Kontakte; dort kann Erevos das nicht ändern. Soll der Punkt nur für manche
  Meldungen bleiben, schalte ihn für die anderen in den Android-Einstellungen für die Benachrichtigungen von Erevos
  aus, wo jede Art von Meldung einen eigenen Schalter hat. Die Launcher von Huawei und Honor nehmen eine Zahl für
  jedes Symbol: Dort zeigt, mit **Einstellungen** → **Benachrichtigungen** → **Zahl auf dem Symbol** → **Zahl
  zeigen**, das Symbol von Erevos selbst die Nachrichten, die seine Meldung zählt, {~das SMS-Symbol die ungelesenen SMS,
  das Telefon-Symbol die verpassten Anrufe |}und das Kontakte-Symbol einen Geburtstag heute, jede Zahl nur auf ihrem
  eigenen Symbol.
- **Taschenrechner anstelle von Erevos** (Android, unter **Startbildschirm-Symbole**): Ein Taschenrechner, der
  funktioniert, erscheint unter den Apps des Telefons statt des Symbols von Erevos. Tippe auf **Taschenrechner an
  seine Stelle setzen**, gib einen Code aus 4 bis 12 Ziffern zweimal ein und tippe auf **Speichern**. Öffne von da an
  den Taschenrechner, gib den Code ein, dann **=**: Erevos öffnet sich und fragt wie immer nach seinem Passwort. Jede
  andere Rechnung ist nur eine Rechnung. **Code ändern** ändert ihn; **Symbol von Erevos wieder zeigen** bringt das
  Symbol in seiner Farbe zurück und vergisst den Code. Nur das Symbol ist versteckt: Die App-Liste von Android, die
  Benachrichtigungen, die letzten Apps und {~die Symbole Telefon, SMS und Kontakte zeigen|das Symbol Kontakte zeigt} weiterhin Erevos. Das Telefon
  behält nur einen Hash des Codes: Er ist eine Tür, nicht das Schloss. Ist Erevos gelöscht, durch das Panik-Passwort
  oder Androids **Speicher löschen**, öffnet kein Code es mehr: Der Taschenrechner öffnet dann Erevos, als neu, und
  das eigene Symbol von Erevos kommt an seine Stelle zurück.

  **Warum:** Wer einen Blick auf das Telefon wirft, sieht einen Taschenrechner, keinen Messenger; das Passwort schützt
  weiterhin, was darin ist.
- **Widget** (Android): die Reihenfolge der {~vier|zwei} Tasten des Widgets, von links nach rechts, mit dem Widget so
  gezeichnet, wie es aussehen wird. Tippe auf ↑ oder ↓, um eine Taste zu verschieben; **Ursprüngliche Reihenfolge**
  stellt sie zurück.
- **Vibration bei Berührung** (Android): ein kurzes Vibrieren, wenn du eine Taste des Wähltastenfelds, Senden, Enter oder einen Schalter antippst und wenn sich ein Menü öffnet; nie beim Scrollen. Eingeschaltet, solange du es hier nicht ausschaltest. Sie gilt für das Telefon, in jedem Bereich gleich.

## Auf einem Computer {#desktop}

Erevos läuft auch auf einem Computer, unter Linux, macOS oder Windows, als eigene App. Es chattet über ein Relay,
Ende-zu-Ende-verschlüsselt wie auf dem Telefon, und bewahrt seine Kontakte, Nachrichten und Einstellungen auf dieselbe
Weise versiegelt auf.

1. Installiere es. Unter Linux: das Paket für Arch-basierte Systeme (\`erevos-linux-x86_64.pacman\`, mit
   \`sudo pacman -U\`) oder das AppImage. Auf einem Mac: Öffne das Disk-Image und zieh Erevos in „Programme“. Es hat
   keine bezahlte Apple-Signatur, also erlaube es beim ersten Mal unter
   **Systemeinstellungen → Datenschutz & Sicherheit → Dennoch öffnen**. Unter Windows 10 oder 11: Führe
   \`erevos-windows-x64-setup.exe\` aus, das Erevos nur für dich installiert, ohne Administrator, und es ins Startmenü
   legt; oder lege \`erevos-windows-x64-portable.exe\` ab, wo du willst, und führe es aus, ohne dass etwas installiert
   wird. Keines von beiden hat eine bezahlte Signatur, also sagt Windows beim ersten Mal, dass es deinen PC geschützt
   hat: Tippe auf **Weitere Informationen**, dann auf **Trotzdem ausführen**.
2. Stelle das Relay ein und füge Kontakte hinzu wie auf dem Telefon, siehe [Chat über ein Relay](#relay).
   **Meinen Kontaktlink kopieren** kopiert deinen Link, um ihn dort einzufügen, wo er hin soll.

- **Was nur das Telefon kann:** Bluetooth, Wi-Fi Aware und LoRa, und ihre Tests. Kontakte im selben WLAN erreicht es
  wie ein Telefon, siehe [Chat mit einem Telefon in der Nähe](#nearby). Der Rest ist gleich: Bereiche und das zweite
  Passwort, versteckte Chats, Sprachnachrichten, importierte Chats und Backups.
- **Wo es Dinge aufbewahrt:** in seinem eigenen Ordner (unter Linux \`~/.config/Erevos\`, auf einem Mac
  \`~/Library/Application Support/Erevos\`, unter Windows \`%APPDATA%\\Erevos\`), versiegelt wie auf dem Telefon. Sein
  Schlüsselspeicher ist mit dem Schlüsselbund des Systems versiegelt (auf einem Mac der Schlüsselbund, unter Windows der
  Schlüssel deines Windows-Kontos). Auf einem Linux-System ohne Schlüsselbund (KWallet oder GNOME Keyring), oder mit
  einem, den Erevos nicht findet, öffnet sich Erevos mit einem Hinweis und bewahrt nichts auf: Starte den Schlüsselbund
  oder gib Erevos \`--password-store=gnome-libsecret\` mit. Mit \`--plain-secrets\` gestartet, bewahrt es seinen
  Schlüsselspeicher dort auf, wie er ist, lesbar für deinen Benutzer: Lege dann eine Passwortsperre fest. Die portable
  Windows-App bewahrt ihre Dinge im selben Ordner auf wie die installierte, und eine Deinstallation lässt sie dort.

**Warum:** Ohne Schlüsselbund läge der Schlüsselspeicher so, wie er ist, auf der Festplatte, lesbar für deinen
Benutzer, also bewahrt Erevos dort nichts auf, außer du wählst es mit \`--plain-secrets\`: Kein Passwortplatz liegt
dort überraschend unversiegelt.

- **Die Firewall von Windows** fragt beim ersten Öffnen von Erevos, ob es das Netz nutzen darf. Erlaube es in privaten
  Netzen, sonst können Telefone und Computer im selben WLAN es nicht erreichen; Relays funktionieren so oder so.
- **Sprachnachrichten**, die auf einem Computer aufgenommen werden, sind Opus, auf einem Telefon AAC. Beide spielen auf
  beiden.
- **Fotos** kommen aus den Dateien des Computers; es gibt keine Kamera. **Speichern** fragt, wohin ein Foto oder eine
  Datei soll.
- **Ein Computer und ein Telefon können ein Konto teilen:** Verknüpfe den Computer mit dem Telefon, und beide haben
  dieselben Chats und Kontakte, siehe [Verknüpfte Geräte](#devices). Oder ein Backup bringt alles vom einen zum anderen,
  siehe [Backups](#backup), und nutze ab dann nur noch das eine.
- **Im Hintergrund:** Schließt du sein Fenster, läuft Erevos im Infobereich weiter (auf einem Mac im Dock), außer du
  schaltest es ab: **Einstellungen** → **Benachrichtigungen** → **Im Hintergrund** → **Beim Schließen beenden**. Es
  wartet weiter am Relay: Ein Anruf klingelt, mit einem eigenen Klingeln, und holt das Fenster zurück, und eine
  Benachrichtigung sagt, wie viele Nachrichten ungelesen sind, nie von wem oder was, bis Erevos wieder zu sehen ist. Du
  öffnest es über sein Symbol im Infobereich oder indem du Erevos erneut startest, und beendest es über das Menü dieses
  Symbols (auf einem Mac über sein Menü). Wo der Desktop keinen Infobereich zeigt, etwa GNOME ohne eine Erweiterung
  dafür, holt ein erneuter Start von Erevos das Fenster zurück. Beendet empfängt es nichts: Nachrichten warten am Relay,
  und ein Anruf erscheint als verpasster Anruf, sobald es sich öffnet.
- **Anrufe** klingeln, solange Erevos zu sehen ist, mit einem eigenen Klingeln: zwei kurze alle 3 Sekunden, bis der
  Anruf angenommen wird oder endet.
- **Bisher getestet** unter Linux. Die Mac- und Windows-Versionen werden auf den Computern von GitHub gebaut und
  geöffnet, noch nicht von einer Person.

## Verknüpfte Geräte {#devices}

Dasselbe Konto auf dem Telefon und auf einem Computer oder in einem Browser: dieselben Chats, Kontakte und Nachrichten
auf beiden. Das Telefon bleibt das Konto: Nur es fügt Kontakte hinzu und verknüpft und trennt Geräte. Jedes
verknüpfte Gerät hat eigene Schlüssel, die das Telefon in eine Liste der Geräte des Kontos signiert und seinen
Kontakten gibt. Kontakte mit dieser Version schreiben dann auch an jedes Gerät, Ende-zu-Ende-verschlüsselt, sodass es
ihre Nachrichten bei ausgeschaltetem Telefon bekommt; für die mit älteren Versionen reicht das Telefon an den Computer
weiter, was ankommt, und versiegelt für sie, was der Computer schreibt. Kontakte sehen dasselbe Konto und dieselbe
Sicherheitsnummer, egal welche Version von Erevos sie haben.

**Warum:** Jedes Gerät hat eigene Schlüssel, nie eine Kopie der Schlüssel des Kontos: Erevos hat keinen Server, der
ein verlorenes Gerät aussperren könnte, also ist ein Gerät nie mehr als ein Eintrag in einer Liste, die das Telefon
signiert, und es zu trennen genügt. Die Liste hat immer vier Plätze, und die, die kein Gerät belegt, enthalten zum
Schein gemachte Schlüssel, sodass Kontakte nicht erkennen können, wie viele Geräte du hast. Und mit dem Telefon als
Konto erreichen dich Kontakte mit jedem älteren Erevos wie bisher.

So verknüpfst du einen Computer:

1. Öffne auf dem Computer, in einem Bereich ohne eigene Chats (eine neue Installation, ein Bereich, den ein neues
   Passwort öffnet, oder die aus seinem Backup wiederhergestellten Chats eines verknüpften Computers),
   **Einstellungen** → **Daten und Geräte** → **Verknüpfte Geräte**. Dort steht **Mit meinem Telefon verknüpfen** an
   erster Stelle und zeigt sofort einen kleinen QR-Code: Es ist nichts einzutippen.
2. Scanne den Code auf dem Telefon mit der Kamera: Erevos fragt **… mit diesem Telefon verknüpfen?** Wähle, was
   vom Verlauf übertragen wird (**Alle**, **Den letzten Monat**, **Die letzte Woche** oder **Keine**), ob **Auch Fotos
   und Dateien**, und tippe dann auf **Verknüpfen**. Das ist alles: Das Telefon gibt dem Computer über Nostr,
   Ende-zu-Ende-verschlüsselt, was er braucht, der Computer zeigt dem Telefon seinen eigenen Code, und die
   Sicherheitscodes werden von selbst verglichen. Du tippst und vergleichst also nichts.
3. Ist Nostr nicht erreichbar oder kann der Computer das Relay nicht nutzen, sagt er es. Tippe dort auf **Anders
   verknüpfen**: Wenn nach einem Relay gefragt wird, ist das von LPHL schon eingetragen. Tippe auf **Mit LPHL
   anmelden** für ein eigenes Token des Computers, oder trage ein anderes Relay und sein Token ein. Benenne das Gerät
   und tippe auf **Mit meinem Telefon verknüpfen**: Dann zeigt es einen größeren QR-Code. Scanne ihn mit dem Telefon,
   oder kopiere den Code, füge ihn auf dem Telefon unter **Code vom Computer** ein und tippe auf **Weiter**. Das
   Telefon zeigt den Namen des Computers und einen Code aus vier Gruppen von fünf Ziffern; wähle wie oben und tippe auf
   **Verknüpfen**.
4. Nur so zeigt auch der Computer einen Code: Wenn es der des Telefons ist, tippe auf **Stimmen überein**. Wenn nicht,
   tippe auf **Stimmen nicht überein**: Jemand anderes hat vielleicht seinen QR-Code gelesen, und nichts ist an ihn
   gegangen. Versteckte Chats werden nur so verknüpft, von innen, mit dem vollständigen Code.

Die Chats kommen dann auf den Computer, und nach ihnen die gewählten Nachrichten.

- **Nachrichten** von Kontakten kommen auf beide, und jedes bewahrt sie einmal auf: Eine, die innerhalb von 30 Tagen
  erneut kommt (bis zu 2000 von einem Kontakt), wird nicht noch einmal aufbewahrt, auch nachdem sie dort verschwunden
  ist oder gelöscht wurde. Dafür merkt sich jedes 30 Tage lang, welche Nachrichten an welchem Tag kamen, nicht was sie
  sagten, auch wenn sie verschwunden sind oder gelöscht wurden, und in einem inzwischen gemachten Backup; das Telefon
  merkt es sich auch für einen Kontakt, der ein Gerät verknüpft hat. Was du auf dem Computer schreibst, geht an einen
  Kontakt mit dieser Version direkt von dort, sobald er an den Computer geschrieben hat, und sonst über das Telefon:
  Das Telefon zeigt es als deines, und der Kontakt bekommt es vom Konto. Was du auf dem Telefon schreibst, erscheint
  auch auf dem Computer. Lesebestätigungen, Reaktionen, Anheftungen, Stimmen, Löschen auf beiden Telefonen, Namen,
  Timer, Chat-Aussehen und Bilder, Offline-Erscheinen und das Annehmen von Anfragen gehen in beide Richtungen. Ein
  Stern oder Löschen auf **Dieses Telefon**, auf dem Telefon gemacht, geht auch an den Computer; auf dem Computer
  gemacht, bleibt es dort.
- **Bei ausgeschaltetem Telefon** erreichen Kontakte mit dieser Version trotzdem den Computer, und der Computer sie:
  Was sie schreiben, lesen und worauf sie reagieren, kommt an, und was du schreibst, geht. Bleibt das Telefon so lange
  aus, dass seine Warteschlange auf dem Relay voll wird (1000 Nachrichten), erreicht, was sie schreiben und lesen,
  trotzdem den Computer, eine lange Sprachnachricht vollständig; worauf sie reagieren, was sie anheften, worüber sie
  abstimmen oder was sie löschen, und ihre Anrufe, kommen erst durch, wenn das Telefon wieder an ist. Für Kontakte mit
  älteren Versionen (auch sie hinzuzufügen) und Gruppen **muss das
  Telefon an sein** und das Relay erreichen: Was der Computer inzwischen schreibt, wartet auf dem Relay und geht,
  sobald das Telefon zurück ist. Jemanden Neuen, dessen Kontaktlink von dieser Version ist, fügt der Computer auch bei
  ausgeschaltetem Telefon hinzu: Er beginnt den Chat selbst, die Person sieht dein Konto als Anfrage, und das Telefon
  fügt sie ebenfalls hinzu, sobald es an ist. Zwei oder mehr verknüpfte Geräte erreichen sich auch direkt: Bei ausgeschaltetem
  Telefon zeigt jedes trotzdem, was die anderen schreiben, lesen und worauf sie reagieren, und die Änderungen, die sie
  an Kontakten machen; eines, das die erste Nachricht eines anderen verpasst hat, bekommt einen Tag oder später eine
  neue. Ein Computer, der länger aus war, als das Relay Nachrichten aufbewahrt (14 Tage), oder die erste Nachricht
  eines Kontakts an ihn verpasst hat, bekommt trotzdem, was dieser danach schreibt: Dessen {=Erevos} beginnt einen Tag
  oder später neu damit, dann immer seltener, bis er antwortet. Nachdem ein Kontakt dich gelöscht und wieder
  hinzugefügt hat, beginnt der Computer auch mit dessen Geräten neu.
- **Fotos und Dateien**, die ankommen, bleiben auf dem Relay, bis das Telefon und der Computer sie beide geholt haben;
  dann löscht das Telefon sie dort. Eines, das der Computer nie holt, verschwindet, wenn er getrennt wird, oder nach 14
  Tagen, wie jedes nicht geholte.
- **Chat mit mir selbst** ist auf jedem Gerät gleich: Eine Notiz, ein Foto, eine Datei oder eine Sprachnachricht, auf
  einem geschrieben, geht an die anderen, ebenso eine gesetzte, geänderte oder gesehene Erinnerung und eine gelöschte
  Notiz; von zwei Änderungen an einer Notiz bleibt die spätere. Was vor dem Verknüpfen geschrieben wurde, geht einmal,
  in beide Richtungen, sobald beide diese Version haben. Eine Erinnerung erscheint auf jedem Gerät zu ihrer Zeit, und
  auf einem gesehen, verschwindet sie von den anderen. Das Foto oder die Datei einer Notiz geht als Kopie über das
  Relay und wird dort gelöscht, sobald sie geholt wurde, oder bleibt, bei zwei Geräten oder mehr, dort, bis sie
  abläuft (14 Tage). Die Notizen versteckter Chats gehen nur innerhalb ihrer eigenen Verknüpfung, siehe unten.
- **Einstellungen:** Sprache, Aussehen (der Stil, die Farben, die Textgröße) und **Zuletzt online** sind auf allen
  Geräten des Bereichs gleich: auf einem geändert, ändern sie sich auch auf den anderen. Ein Foto hinter den
  Bildschirmen bleibt auf dem Gerät, auf dem es gewählt wurde, ebenso alles, was nur ein Gerät betrifft: Passwörter,
  PINs und der Paniccode, die Sperrzeit, die Vibration, das Relay und Tor,{~ die Module,} der Gerätename. Ein Gerät, das
  seine eigenen behalten soll: **Einstellungen** → **Daten und Geräte** → **Verknüpfte Geräte** → **Gleiche
  Einstellungen auf allen Geräten** aus. Wieder eingeschaltet, übernimmt es sofort die der anderen. Versteckte Chats
  behalten ihre eigenen.
- **Über Tor für einen Chat:** Der Schalter **Über Tor** in den **Details** eines Erevos-Chats ist auf jedem Gerät
  gleich: Auf einem ein- oder ausgeschaltet, ist er auf allen ein- oder ausgeschaltet. Auf einem Gerät ohne Tor, etwa
  der Web-App, sendet dieser Chat nichts, solange er eingeschaltet ist. Ein Gerät mit älterer Version schaltet ihn für
  die anderen nie aus. Siehe [Über Tor](#tor).
- **Im selben WLAN:** Telefon und Computer im selben WLAN oder Hotspot (mit **Erevos im selben WLAN finden** an) geben
  einander, was sich ändert, direkt dort, auch ohne Internet; das Relay bekommt trotzdem seine Kopie, die dann nichts
  mehr ändert. Nur die des Bereichs: die Verknüpfungen versteckter Chats gehen über das Relay.
- **Anrufe** klingeln auf dem Telefon und auf dem Computer. Nimm auf einem von beiden an: Das andere hört auf zu
  klingeln und sagt, dass auf einem anderen Gerät angenommen wurde. Einen Anruf auf einem abzulehnen, lehnt ihn auf
  beiden ab. Mit einem Kontakt mit dieser Version ruft der Computer selbst an und wird selbst angerufen, auch bei
  ausgeschaltetem Telefon; mit einem Kontakt mit einer älteren Version ruft er über das Telefon an, das nur an bleiben
  muss, um den Anruf aufzubauen. So oder so geht der Anruf selbst direkt zwischen dem Computer und dem Kontakt,
  verschlüsselt zwischen ihnen.
- **Später senden** geht auch auf dem Computer. An einen Kontakt mit dieser Version gibt der Computer die Nachricht
  selbst dem Relay, dazu eine Kopie für jedes seiner Geräte, so geht sie zu ihrer Zeit bei ausgeschaltetem Telefon und
  erreicht seine Geräte auch, wenn sein Telefon aus ist; an einen mit einer älteren Version geht sie über das Telefon.
  Jedes deiner Geräte zeigt sie als geplant, und vor ihrer Zeit auf einem davon gelöscht, wird sie überall
  zurückgenommen.
- **Gruppen** sind auch auf dem Computer, mit ihren Nachrichten, Fotos, Dateien und Sprachnachrichten. Schreibe darin,
  antworte, reagiere, stimme ab, hefte an, lösche deine eigenen für alle, füge Mitglieder hinzu und nimm sie heraus,
  benenne eine um oder verlasse sie, dort wie auf dem Telefon: Das Telefon macht es für den Computer, als seines. Ein
  Foto oder eine Datei, die das Telefon aufbewahrt, geht als Kopie auf dem Relay an den Computer und wird dort
  gelöscht, sobald der Computer sie geholt hat. Was die Mitglieder später mit einer Nachricht machen (reagieren,
  abstimmen, anheften, für alle löschen), erscheint auch auf dem Computer, ebenso ein Stern oder Löschen auf
  **Dieses Telefon**, auf dem Telefon gemacht. Eine Nachricht, die das Telefon nicht an die Gruppe senden konnte
  (etwa weil sie inzwischen geschlossen wurde), erscheint auf dem Computer als **Nicht vom Telefon gesendet**. Eine
  Gruppe zu machen, öffentliche Gruppen und Gruppenanrufe bleiben vorerst auf dem Telefon.
- **Gruppen bleiben auf** einem Gerät deiner Wahl: Wähle auf dem Telefon unter **Einstellungen** → **Daten und Geräte**
  → **Verknüpfte Geräte** → **Gruppen bleiben auf** **Dieses Telefon** oder einen verknüpften Computer. Die Schlüssel der
  Gruppen ziehen dann dorthin um, nie kopiert, sodass die Gruppen dort auch bei ausgeschaltetem Telefon funktionieren und
  dort neue angelegt werden können; das Telefon und die anderen Geräte schreiben über ihn darin, also muss er an sein.
  Die Mitglieder sehen nichts Neues: dich wie bisher, nur kommen deine Gruppennachrichten in eine andere Warteschlange.
  Zum Umziehen müssen beide an sein und das Relay erreichbar, und öffentliche Gruppen bleiben auf dem Telefon (verlass
  sie zuerst). Um diesen Computer zu trennen, hol die Gruppen zuerst auf das Telefon zurück. Ist er verloren, trenne ihn trotzdem: Die
  Gruppen erscheinen dann auf dem Telefon als verlassen. Ein Computer mit älterem {=Erevos} kann sie nicht halten.
- **Versteckte Chats und zweite Passwörter** gehen nie mit der Verknüpfung des Bereichs mit: Jedes wird für sich
  verknüpft, von innen. Für einen Platz versteckter Chats: Öffne auf dem Computer diesen Platz mit seiner PIN, neu und
  leer, wie eine neue PIN ihn anlegt, und gib ihm dort unter **Für Fortgeschrittene** eine eigene Warteschlange auf dem
  Relay; tippe dann unter seiner Liste auf **Verknüpfte Geräte** und auf **Mit meinem Telefon verknüpfen**. Öffne auf
  dem Telefon denselben Platz mit seiner PIN, tippe unter seiner Liste auf **Verknüpfte Geräte** und scanne den Code des
  Computers mit der Kamera, solange der Platz offen bleibt, oder füge ihn dort ein; dann wie oben. Ein Code, der in
  einem Platz gezeigt wird, verbindet nur einen Platz, und der eines Bereichs nur einen Bereich: Liest ihn das andere,
  verfällt er einfach, und **Mit meinem Telefon verknüpfen** beginnt auf dem Computer von vorn. Der Platz hat dann eine eigene Verknüpfung, mit eigenen
  Schlüsseln und einer eigenen Liste seiner Geräte, von seinem eigenen Konto signiert, sodass seine Kontakte mit dieser
  Version direkt an den Platz des Computers schreiben. Seine Nachrichten, Kontakte, Gruppen, Anrufe, Fotos und Dateien
  und sein Chat mit mir selbst gehen zwischen den beiden Plätzen, wie die des Bereichs zwischen verknüpften Geräten{+, und
  ebenso seine eigenen Matrix-, XMPP- und Nostr-Konten, immer, und erneut, wenn sie sich ändern}. Nichts davon zeigt sich im Bereich, auf seinen Bildschirmen oder auf seinen verknüpften Geräten, und die
  Verknüpfung des Bereichs trägt nie etwas von einem Platz: Was ein Platz von seiner Verknüpfung bewahrt, ist mit seinem
  eigenen Schlüssel verschlüsselt, zwischen Werten, die für die anderen Plätze für nichts angelegt sind, in einer Datei
  derselben Größe, ob ein Platz verknüpft ist oder keiner. Die Verknüpfung läuft, solange der Platz offen ist, und auch
  geschlossen, wenn **Empfangen, wenn geschlossen** an ist; geschlossen ohne das wird nichts von ihm abgeglichen, und
  was ankommt, wartet auf dem Relay (14 Tage), bis er sich öffnet, auf beiden Seiten. Auf dem Computer bleiben neue
  Gruppen und Gruppenanrufe auf dem Telefon, ein Chat lässt sich nicht in den Platz oder aus ihm heraus verschieben
  (verschiebe ihn auf dem Telefon), und ein dort angenommener Anruf beendet das Klingeln des Telefons nur, solange der
  Platz auf dem Telefon offen ist. Versteckte Chats schreiben an die Geräte eines Kontakts mit dieser Version wie deine
  anderen Chats, sodass diese sie bei ausgeschaltetem Telefon des Kontakts bekommen, und für den Kontakt sehen sie aus
  wie die Chats eines Telefons, das nie ein Gerät verknüpft hat. Ein auf dem Telefon in versteckte Chats verschobener
  Chat verschwindet vom Computer. In versteckte Chats verschoben, oder aus ihnen in deine Chats, schreibt ein Chat nur
  an das Telefon des Kontakts, wie ein älteres {=Erevos}, bis er dorthin zurückkehrt, wo er angelegt wurde: Das {=Erevos} des
  Kontakts erfährt es zuerst, damit seine Geräte aufhören, an deine zu schreiben, und er kann daraus erkennen, dass der
  Chat aufgehört hat, von verknüpften Geräten zu wissen: wenn er ihm die Liste deiner Geräte gegeben hat, dass er in
  versteckte Chats ging. Ein Bereich, den ein zweites Passwort öffnet, verknüpft nur von innen, mit eigenen Geräten.
- **Nachrichten erneut übertragen**, auf dem Telefon, sendet einen Zeitraum des Verlaufs erneut, mit seinen Reaktionen,
  Anheftungen, Stimmen und Sternen; was der Computer schon hat, wird nicht doppelt aufbewahrt.
- [+] **Matrix, XMPP und Nostr**: Jedes verknüpfte Gerät bekommt sie, und sie folgen den Änderungen auf dem Telefon: ein Konto, von dem es sich dort abmeldet oder das durch ein anderes ersetzt wird, geht auch von den Geräten. Der Computer meldet sich bei
  den Matrix- und XMPP-Konten dieses Bereichs an und übernimmt den Schlüssel seiner Nostr-Chats, jeweils als neues
  Gerät mit eigenen Schlüsseln: Das Telefon behält seine. Bei einem Computer, der schon verknüpft ist, tippe auf dem
  Telefon unter ihm auf **Konten senden**. XMPP und Nostr kommen von selbst. Ein Matrix-Server lässt das Telefon nur
  selten ein neues Gerät anmelden: Dann sagt es **Verknüpfte Geräte** auf dem Computer, und **Bei Matrix anmelden**
  öffnet dort Matrix mit eingetragener ID, für das Passwort, einmal. Die Schlüssel des Kontos kommen vom Telefon, also
  ist weder ein Sicherheitsschlüssel noch eine Prüfung per Emoji nötig, und die Nachrichten von früher öffnen sich aus
  seiner Schlüsselsicherung. Ein Computer, der auf einem davon schon ein eigenes Konto hat, behält es, und was noch
  nicht kommen konnte (etwa weil er offline war), wird bei jedem Öffnen erneut versucht. Getrennt, meldet sich der
  Computer von den Konten ab, die er übernommen hat. Ein für sich verknüpfter Platz versteckter Chats gibt seine
  eigenen Konten auf dieselbe Weise, aus seinen eigenen **Verknüpfte Geräte**, an denselben Platz auf dem Computer:
  nie die des Bereichs, und die des Bereichs gehen nie an ihn. Jedes Gerät meldet sich als es selbst an, nie mit einer
  Kopie der Schlüssel des Telefons, die dann doppelt benutzt würde und die Verschlüsselung kaputtmachen würde; so
  lässt sich jedes allein abmelden, bei den Geräten des Kontos.
- [~] **SMS**: Die SMS des Telefons können auch auf den Geräten erscheinen und dort über das Telefon beantwortet werden,
  sobald du es einschaltest unter **Einstellungen** → **Telefon und SMS** → **SMS** → **Auch auf meinen verknüpften
  Geräten**, siehe [SMS](#sms).
- **Trennen**, auf dem Telefon, sperrt ein Gerät sofort aus: Nichts geht mehr an es, und nichts, was es sendet, wird
  angenommen. Kontakte mit dieser Version erfahren es, wenn das Telefon das nächste Mal das Relay erreicht: Sie hören
  auf, an es zu schreiben, und nehmen nichts mehr von ihm an. So sperrst du einen verlorenen Computer aus. Ist er an,
  erfährt er es, und die Chats des Kontos verschwinden von ihm. Auf dem Computer macht **Dieses Gerät trennen**
  dasselbe von dort aus.
- **Bis zu vier** Geräte lassen sich mit einem Telefon verknüpfen. Ein Backup nimmt die Verknüpfungen nicht mit, aber
  nachdem du eines auf einem anderen Telefon wiederhergestellt hast, bittet dieses Telefon jedes Gerät, das noch dir
  gehört, sich erneut zu verknüpfen, mit einem Tippen auf jedes, siehe [Backups](#backup).

## Auf einem iPhone, im Browser {#iphone}

Erevos hat keine App im App Store. Auf einem iPhone läuft es als Web-App, aus Safari zum Home-Bildschirm hinzugefügt,
ohne Apple-Konto. Es chattet über ein Relay, Ende-zu-Ende-verschlüsselt wie auf dem Telefon, und bewahrt seine
Kontakte, Nachrichten und Einstellungen auf dieselbe Weise versiegelt auf, im Speicher von Safari für die App.

1. Öffne die Adresse des Erevos-Servers, die du bekommen hast, in **Safari**. Erevos zeigt, wie du es hinzufügst:
   Tippe auf **Teilen** (unter iOS 26 unter **•••**), dann auf **Zum Home-Bildschirm**, und öffne Erevos dann vom
   Home-Bildschirm aus. Braucht iOS 17 oder neuer.
2. Öffne in Erevos **Einstellungen** → **Datenschutz und Sicherheit** → **Diese Web-App** und vergleiche den
   Fingerabdruck des Release-Schlüssels Zeichen für Zeichen mit dem, den du mit der Adresse bekommen hast. Wenn er sich
   unterscheidet, lösche die App und sag es dem, der dir die Adresse gegeben hat.
3. Lege eine Passwortsperre fest (in Erevos **Einstellungen** → **Datenschutz und Sicherheit** →
   **Sperre und zweites Passwort**). Im Web ist sie am wichtigsten: siehe unten.
4. Stelle das Relay ein und füge Kontakte hinzu wie auf dem Telefon, siehe [Chat über ein Relay](#relay).

**Wie es sich selbst prüft.** Eine Web-App ist Code, den der Server schickt, also könnte ein Server, in den
eingebrochen wird oder dem es befohlen wird, veränderten Code schicken. Erevos nimmt diesen Code nicht auf Treu und
Glauben:

- Beim ersten Öffnen holt es seinen Code mit einer Liste jeder Datei und ihres Fingerabdrucks, signiert mit dem
  Release-Schlüssel, den nur die Person hat, die die Releases macht; der Server hat ihn nicht. Es prüft die Signatur
  und jede Datei, bewahrt sie auf dem iPhone auf und führt ab dann nur diese aus. Der Server kann sie nicht ändern.
- Ein Update wird nur angenommen, wenn es mit demselben Schlüssel signiert und neuer als das genutzte ist; es startet
  beim nächsten Öffnen von Erevos. Ein unsigniertes oder älteres wird abgelehnt, und Erevos sagt es.
- Wer will, kann den Server prüfen: \`node pwa/release.mjs verify https://<Adresse>\` prüft die Signatur und jede
  Datei, die der Server ausgibt, und \`scripts/reproduce-web.sh <Version> https://<Adresse>\` baut dieses Release aus
  seinem Quellcode erneut und prüft, dass jede Datei gleich herauskommt.

**Was bleibt.** Das sind echte Grenzen; kenne sie:

- **Beim ersten Mal**, wenn du es öffnest, vertraust du dem Server: Er ist es, der den prüfenden Teil schickt.
  Schritt 2 ist, wie du einen falschen erkennst.
- **Den prüfenden Teil selbst** (den Service Worker) holt Safari mindestens einmal am Tag neu, und Safari kann ihn
  ersetzen, ohne Erevos zu fragen. Erevos prüft den neuen dann gegen das signierte Release und warnt dich
  (**Erevos wurde manipuliert**), aber ein Server, der weiß wie, könnte an dieser Prüfung vorbeikommen. Wenn du die
  Warnung siehst, öffne Erevos nicht wieder von diesem Server, bis es geklärt ist. Mit einer Passwortsperre bleiben
  deine Chats versiegelt.
- **Kein Bluetooth und keine Verbindung in der Nähe**{~ und keine SMS}: Safari erlaubt sie nicht.
- **Nur solange es offen ist:** iOS hält Web-Apps im Hintergrund an, also kommen Nachrichten, wenn du Erevos öffnest;
  bis dahin warten sie auf dem Relay.
- **Anrufe** klingeln, solange Erevos offen ist, mit einem eigenen Klingeln: zwei kurze alle 3 Sekunden. Safari lässt es
  erst klingen, wenn du Erevos seit dem Öffnen berührt hast, und nicht, wenn das iPhone stumm geschaltet ist. Ist Erevos
  geschlossen, klingelt ein Anruf nicht: Es erscheint nur die Benachrichtigung „Anruf“, wenn Benachrichtigungen an sind.
  Mehr erlaubt Apple einer Web-App nicht; um wie ein Telefon zu klingeln, bräuchte es eine App aus dem App Store.
- **Benachrichtigungen**, während Erevos geschlossen ist, sind aus, solange du sie nicht einschaltest: in Erevos
  **Einstellungen** → **Benachrichtigungen** → **Benachrichtigungen, wenn geschlossen** → **Einschalten** (iOS 16.4
  oder neuer, vom Home-Bildschirm aus). Wenn Nachrichten kommen oder ein Anruf klingelt, schickt dein Relay einen Push
  über Apple, und Erevos zeigt, wie viele Nachrichten seit deinem letzten Öffnen kamen (**3 neue Nachrichten**), oder
  **Anruf**, wenn nur ein Anruf klingelte, in der Sprache der App, mehr nicht. Die Zahl ist für dein iPhone
  verschlüsselt: Apple sieht, wann etwas für dein iPhone kommt und dass es {=Erevos} nutzt, nie was oder von wem. Mit
  einem Relay oder einem {=Erevos} des Absenders älter als 2.0.0, oder einer Nachricht, die andere Telefone zum Relay
  gebracht haben, gibt es keine Zahl: Erevos zeigt **Neue Nachricht**, oder **Neue Nachrichten**, sobald mehr kamen,
  bis du es öffnest. Sie gelten pro Bereich, nie für versteckte Chats, und dein Relay muss eingerichtet sein, sie zu
  senden. Sie kommen auch für die eigene Warteschlange jedes Kontakts: Dein Relay hat dann eine Push-Adresse für alle
  Warteschlangen deiner Kontakte, und Apple bekommt einen Push für jeden Kontakt, der geschrieben hat, im Abstand von
  15 Sekunden, kann also aus einer solchen Folge erraten, wie viele gleichzeitig geschrieben haben, nie wer. Das Symbol
  von Erevos auf dem Home-Bildschirm zeigt dann auch eine Zahl: die ungelesenen Nachrichten des Bereichs, den du offen
  hattest, deren Zahl nach dem Schließen von Erevos bleibt, und die seitdem gekommenen (was ohne Zahl kam, zählt als
  eine), nie die eines versteckten Chats. **Einstellungen** → **Benachrichtigungen** → **Zahl auf dem Symbol** schaltet
  sie aus. Benachrichtigungen laufen über den Push-Dienst von Apple, den von Google (Chrome sowie Edge auf Android,
  Brave und Opera), den von Mozilla (Firefox) und den von Microsoft (Edge auf Windows): Ein Browser, der einen anderen
  nutzt, kann sie nicht einschalten, es sei denn, wer dein Relay betreibt, lässt den Push-Dienst dieses Browsers zu.
  Jeder Bereich, der sie einschaltet, hat eine eigene Push-Adresse, sodass kein Relay je die eines anderen Bereichs
  bekommt und die Adresse deine Bereiche nicht miteinander verbindet. Dafür hat jeder solche Bereich einen eigenen
  Service Worker im Browser: Wer in die Einstellungen des Browsers sehen kann, kann sie zählen und so, wie viele
  Bereiche Benachrichtigungen eingeschaltet haben. Eine Nachrichtenanfrage von jemand Neuem über deinen Kontaktlink
  erscheint vielleicht erst, wenn Erevos geöffnet wird. Die Zahl auf dem Symbol erscheint auch auf einem Mac mit „Zum
  Dock hinzufügen“ von Safari und in der Web-App, die aus Chrome oder Edge auf Windows, macOS oder ChromeOS installiert
  wurde. Über Erevos erscheint kein Banner **Neue Nachricht**, solange es auf dem Bildschirm offen ist. Der Bildschirm
  **Benachrichtigungen, wenn geschlossen** zeigt an, wenn der Browser oder das Telefon sie nicht erlaubt und, nachdem
  du sie ausgeschaltet hast, wenn dein Relay noch nicht davon erfahren konnte und vielleicht noch eine schickt: Erevos
  sagt es ihm, sobald es dein Relay erreicht. Wechselt der Browser seine Push-Adresse oder verwirft sein Push-Dienst
  sie, gibt Erevos deinem Relay die neue von selbst, sobald es wieder auf dem Bildschirm ist.
- **Berechtigungen:** In Erevos zeigt **Einstellungen** → **Allgemein** → **Berechtigungen**, was der Browser Erevos
  erlaubt: ob es vom Home-Bildschirm aus läuft, Benachrichtigungen, wenn geschlossen (nötig, sobald dieser Bereich sie
  eingeschaltet hat), das Mikrofon für Anrufe, die Kamera für Videoanrufe und ob der Browser die Daten von Erevos
  dauerhaft behält. Ohne das kann Safari die Daten löschen, wenn auf dem iPhone der Platz knapp wird, also ist ein
  Backup das Sicherheitsnetz. Jedes hat den Grund und eine Taste mit der eigenen Frage des Browsers; wo der Browser
  nicht mehr fragt, sagt es, wo die Einstellung ist (**Einstellungen → Mitteilungen → Erevos** oder
  **Einstellungen → Apps → Safari → Mikrofon**). Es liest nur, was der Browser sagt. Ein Browser lässt Erevos das
  Energiesparen oder den Stromsparmodus nicht lesen, also sind diese nicht dabei. Nach jedem neuen signierten Release
  öffnet es sich von selbst, wenn etwas fehlt, das Nachrichten, Anrufe oder die Daten brauchen. In einem anderen
  Browser (Chrome, Firefox) ist es genauso, mit den Einstellungen dieses Browsers.
- **Backups** werden von Hand gemacht: **Backup erstellen** speichert das Backup und seine Dateien über das Teilen-Menü (Dateien, iCloud
  Drive oder eine andere App). Ein Browser gibt eine Datei nur nach einem Tippen heraus, also gibt es keine
  automatischen Backups.
- **Sprachnachrichten**, die auf einem iPhone aufgenommen werden, sind AAC; sie spielen überall.
- **Apple** macht Safari und könnte es ändern, wie bei jeder App auf einem iPhone.

## Unter Sailfish OS {#sailfish}

Auf einem Sailfish-OS-Telefon ist Erevos eine eigene App: dieselbe App wie im Browser, angezeigt von der eigenen
Browser-Engine von Sailfish in einem Sailfish-Fenster, mit ihrem Code mit der App installiert und nicht von einem
Server geholt. Es chattet über ein Relay, Ende-zu-Ende-verschlüsselt wie auf dem Telefon, und bewahrt seine Kontakte,
Nachrichten und Einstellungen auf dieselbe Weise versiegelt auf.

1. Erlaube Apps von außerhalb des Jolla Store:
   **Einstellungen → Nicht vertrauenswürdige Software → Nicht vertrauenswürdige Software zulassen**.
2. Kopiere \`erevos-sailfish-aarch64.rpm\` auf das Telefon (Downloads) und tippe in **Dateien** darauf, dann auf
   **Installieren**. Von einem Terminal aus (Entwicklermodus) ist es
   \`pkcon install-local erevos-sailfish-aarch64.rpm\`. Braucht Sailfish OS 5 in seiner 64-Bit-Version (aarch64).
3. Lege eine Passwortsperre fest (in Erevos **Einstellungen** → **Datenschutz und Sicherheit** →
   **Sperre und zweites Passwort**). Warum sie hier wichtig ist, steht unten.
4. Stelle das Relay ein und füge Kontakte hinzu wie auf dem Telefon, siehe [Chat über ein Relay](#relay).

- **Was nur Android kann:** Bluetooth, Wi-Fi Aware, Wi-Fi Direct{~, LoRa und SMS| und LoRa}. Im selben WLAN geht es auch hier, wie
  auf einem Computer: siehe [Chat mit einem Telefon in der Nähe](#nearby). Die Firewall von Sailfish OS lässt ihren Port
  47905 schon herein: Nur eine Firewall, die du selbst strenger gemacht hast, braucht eine Regel dafür. Der Rest ist
  gleich: Bereiche und das zweite Passwort, versteckte Chats, Sprachnachrichten, importierte Chats und Backups.
- **Wo es Dinge aufbewahrt:** in \`~/.local/share/erevos\` auf dem Telefon, versiegelt wie auf dem Telefon. Sailfish
  hat keinen Schlüsselbund für Apps, also wird der Schlüsselspeicher dort so aufbewahrt, wie er ist, lesbar für deinen
  Benutzer und damit für jede App, die als du läuft: Die Passwortsperre ist es, die ihn versiegelt.
- **Backups** kommen nach \`Documents/Erevos\` auf dem Telefon, von Hand oder jeden Tag; kopiere sie von dort auf eine
  Speicherkarte oder ein anderes Gerät. **Speichern** legt ein Foto oder eine Datei in Downloads.
- **Anrufe** klingeln, solange Erevos zu sehen ist, mit einem eigenen Klingeln: zwei kurze alle 3 Sekunden, und das
  Telefon vibriert, wo es kann, bis der Anruf angenommen wird oder endet. Ein Anruf, der kommt, bevor du Erevos seit dem
  Öffnen berührt hast, erscheint vielleicht ohne Ton.
- **Während es geschlossen ist:** Mit einem offenen Raum wartet ein kleiner Helfer von Erevos auf dem Relay, solange
  Erevos nicht zu sehen oder geschlossen ist, und nimmt nichts. Eine Mitteilung sagt nur, wie viele Nachrichten kamen,
  nie von wem oder was, und ein Anruf klingelt mit dem Klingelton des Telefons, wie sein Profil ihn einstellt,
  höchstens 45 Sekunden; ein Tippen auf eine der beiden öffnet Erevos. Versteckte Chats sagen dann nichts. Das Sperren
  des Raums beendet es, und nach einem Neustart des Telefons wartet er erst wieder, wenn Erevos den Raum öffnet. Wie
  der Rest von Erevos hier geht er direkt, ohne Tor. Jedes Warten weckt das Telefon etwa einmal pro Minute, wie unter
  Android.
- **Bisher getestet** auf der Browser-Engine von Sailfish (Gecko 91) auf einem Computer, im Chat mit einem Browser über
  ein Relay. Das selbe WLAN wurde auf einem Computer gegen das des Computers geprüft. Noch nicht auf einem
  Sailfish-Telefon.

## Updates {#updates}

Erevos fragt GitHub nur dann nach Updates, wenn du auf die Taste tippst, wie in Fasouli: Eine regelmäßige Prüfung
würde GitHub jeden Tag sagen, dass dieses Telefon oder dieser Computer {=Erevos} hat. Auf Android sagt es dir außerdem,
wenn eine neue Version da ist, ohne GitHub zu fragen, wie **Benachrichtigt, wenn eine neue Version da ist** weiter
unten sagt. Zum Aktualisieren:

1. Öffne **Einstellungen** → **Allgemein** → **Updates** (oder **Nach Updates suchen** unten auf dem ersten
   Bildschirm dieser Anleitung).
   Es zeigt die Version, die du hast, etwa **Erevos 2.0.0**.
2. Tippe auf **Nach Updates suchen**. GitHub sieht dann die Internetadresse dieses Geräts, sonst nichts; auf Android
   ebenso der Server der Web-App, der die Signatur des Release-Computers für das Update bereithält. Solange alles im
   Bereich über Tor geht (**Alles** unter Tor), prüft Erevos nicht, da das an Tor vorbeiginge.
   Mit **Über Tor** an, auf diesem Bildschirm (aus, solange du es nicht einschaltest), fragt es nur den Server der
   Web-App, über Tor, und nicht GitHub: GitHub wird nicht gefragt, und nichts sieht die Adresse. Das ist langsamer und
   wartet, während Tor startet; und es geht auch, solange alles im Bereich über Tor geht.
3. Wenn es eine neue Version gibt: Tippe auf Android auf **Installieren**. Sie wird heruntergeladen, gegen das Release
   geprüft (ihre Größe und SHA-256), und das Installationsprogramm von Android öffnet sich: Tippe dort auf
   **Installieren**. Erevos bietet sie erst an, wenn der Release-Computer, der seinen Schlüssel offline aufbewahrt,
   diesen Build und seinen SHA-256 signiert hat: Wer allein das GitHub-Konto übernommen hätte, könnte kein eigenes APK
   installieren lassen. Bis dahin sagt es, dass die Version da, aber noch nicht signiert ist. Wenn der Server der
   Web-App nicht erreichbar ist, sagt es das, mit dem Grund, und wenn die Signatur dort nicht passt, sagt es das: So
   oder so wird nichts installiert. Ein Download, bei dem die Verbindung eine Weile nichts bringt, wird von selbst neu
   begonnen, insgesamt dreimal; danach sagt Erevos es, und nichts wird installiert. Beim ersten Mal bittet Android
   darum, das Installieren von Apps aus Erevos zu erlauben. Auf einem Computer und unter Sailfish OS öffnet
   **Download-Seite öffnen** die Release-Seite: Nimm die Datei, die Erevos nennt, die des Pakets, das du hast, und
   aktualisiere wie in der Tabelle unten.
   Über Tor wird eine neue Version gemeldet, aber sie lädt hier nicht herunter, da ihr Paket größer ist, als das Tor
   von Erevos schafft: Schalte **Über Tor** zum Installieren kurz aus, oder lade sie von der Release-Seite im Tor
   Browser herunter.

Eine Version wie **4.0.0-rc.1** ist eine Testversion vor 4.0.0 (ein Release Candidate): Sie wird wie jede andere
installiert und aktualisiert, und 4.0.0 kommt nach ihr.

### Erevos, Erevos+ oder Erevos Lite, und Betas {#update-channel}

Unter Android sagt **Updates** auch, welche Versionen diesem Telefon angeboten werden:

- **Nächstes Update**: **Erevos Lite** (die eigenen Chats und Anrufe von Erevos, sonst nichts; Versionen 3.2.x),
  **Erevos** (seine eigenen Chats, das Telefon, SMS und die Sammlung; Versionen 3.0.x) oder **Erevos+** (all das, mit
  Telegram, Messenger, Signal, Session, Matrix, XMPP und Nostr; Versionen 3.1.x). Anfangs ist die gewählt, die du
  hast. Jede ist eine eigene App mit eigenen Daten, also ist die Wahl einer anderen ein Umzug, kein Update: **Nach
  Updates suchen** findet sie und fragt **Umzug zu …**. Dieses Erevos macht dann eine Kopie von allem, verschlüsselt,
  hier auf dem Telefon (jeder Bereich, mit seinen Kontakten, Nachrichten und Einstellungen), und Android installiert
  die andere App neben dieser, falls sie nicht schon da ist. Öffne sie innerhalb eines Tages: Sie fragt, ob sie deine
  Chats holen soll, und übernimmt sie; nichts verlässt das Telefon. Die Bereiche öffnen sich dann mit ihren
  Passwörtern, wie nach jeder Wiederherstellung. SMS und Anrufe des Telefons bleiben im Telefon: Mach die neue App zur
  SMS- und Telefon-App, wenn du sie nutzt. Ab dem Umzug empfängt und sendet die alte App nichts und zeigt nur den
  Umzug, damit dort keine Nachricht bleibt, die die neue nicht hat; **Umzug absagen** öffnet sie wie vorher. Sobald
  die neue ihn übernommen hat, bietet die alte **Alles hier löschen** und **Deinstallieren**; ein Umzug, der nicht
  innerhalb eines Tages übernommen wird, wird gelöscht, und die alte App öffnet sich wie vorher. Auch eine neue App,
  die schon eingerichtet ist, fragt, und was sie holt, ersetzt alles, was sie hat. Der Umzug braucht freien Platz auf
  dem Telefon für eine Kopie von allem: Erevos sagt es vorher, wenn er nicht reicht. Der F-Droid-Build, mit einem
  anderen Schlüssel signiert, kann so nicht umziehen: Nutze stattdessen [Backups](#backup).
- **Beta-Versionen**: aus, nur reguläre Versionen werden angeboten. An, auch Betas (wie **7.0.1-beta.1**): Sie
  erscheinen zuerst, zum Ausprobieren, und können Probleme haben. Eine Beta hat es anfangs an. Schalte es aus, um die
  Betas zu verlassen: Die nächste reguläre Version mit einer höheren Build-Nummer als deine Beta installiert sich
  darüber und behält alles, ohne Deinstallieren.

Aus Erevos+ kommen auch die Netzwerke mit: Telegram, Signal, Session, Messenger und Matrix bleiben in der neuen App
angemeldet, wie sie waren (die Fotos und Dateien von Telegram werden beim Öffnen erneut heruntergeladen, und die Seite
von Messenger fragt noch einmal nach ihrer PIN). Erevos und Erevos Lite haben kein Telegram, Messenger, Signal oder
Session: Ein Umzug dorthin lässt diese Konten im alten Erevos+, das danach nichts mehr öffnet. Wenn du Session nutzt,
schreib dir also zuerst die 13 Wiederherstellungswörter auf.

Erevos+ braucht Android 8.0 oder neuer: Auf einem älteren Telefon lässt es sich nicht wählen, und das Telefon bleibt
bei Erevos.

Die Meldung einer neuen Version folgt derselben Wahl. Jede Ausgabe und ihre Betas signiert der Release-Computer
getrennt, sodass sich nie eine als andere installiert.

### Was ist neu {#whats-new}

**Einstellungen** → **Allgemein** → **Was ist neu** (auch **Was ist neu** in **Updates**) sagt kurz, was jede Version
geändert hat, die neueste zuerst, nur nach ihrer Nummer; die Version, die du hast, sagt **Diese Version**. Jedes
Release fügt seines hinzu. Das CHANGELOG des Quellcodes nennt jede Änderung vollständig.
Jede Version sagt, dort wie hier, zuerst, was sich **Für dich** ändert, was du siehst und nutzt, dann, was sich
**Unter der Haube** geändert hat: Korrekturen, Tempo, Akku und Sicherheit im Inneren.

### Benachrichtigt, wenn eine neue Version da ist {#release-notice}

Auf Android fragt Erevos einmal am Tag den Server von LPHL, auf dem auch das Relay läuft, ob eine neue Version da ist.
Wenn ja, erscheint **Erevos** oben in den Chats, angeheftet, mit seinem Symbol:
**Erevos 3.3.0 ist da. Tippe, um zu sehen, was neu ist, und zu aktualisieren.**, markiert, bis du es öffnest, und eine
Benachrichtigung sagt ebenfalls **Erevos 3.3.0 is out**. Tippe auf eines von beiden für **Updates**, dann auf
**Nach Updates suchen**. Es verschwindet, sobald du diese Version hast.

- **Nur wenn signiert:** Es zählt erst, wenn der Release-Computer sowohl den Build als auch seinen Namen signiert hat,
  dieselbe Signatur, mit der **Updates** ihn installiert. Es kommt also erst, wenn diese Version installiert werden
  kann, und der Server allein kann keine erfinden.
- **Nur auf dem Relay von LPHL:** Ein Bereich fragt nur, solange er das Relay von LPHL nutzt und nicht alles über Tor
  sendet (**Alles** unter Tor): Der Server sieht dann nichts, was er nicht ohnehin sieht. Ein Bereich auf einem
  anderen Relay oder ohne Relay fragt nichts; dort sagt es dir **Nach Updates suchen**.
  Der Schalter **Über Tor** unter **Updates**, einer für diese Mitteilung und für **Nach Updates suchen**, nur auf
  diesem Telefon, lässt sie über Tor fragen: Der Server sieht die Adresse des Telefons dann nicht, und ein Bereich,
  der alles über Tor schickt, fragt auch. Eine neue Version wird gemeldet, installiert wird sie aber nur bei
  ausgeschaltetem Schalter.
- **Ausschalten:** **Einstellungen** → **Allgemein** → **Updates** →
  **Sag mir, wenn eine neue Version da ist**.
- Es funktioniert ab der Version, die es hat: Die davor sagt nichts. Nicht im F-Droid-Build, den F-Droid
  aktualisiert.

**Warum:** Damit niemand auf GitHub einzeln nach jeder neuen Version schauen muss und GitHub nie erfährt, welche
Telefone Erevos haben: Der gefragte Server ist der, mit dem das Telefon ohnehin redet, und was er sagt, zählt nur mit
der Signatur des Release-Computers, die offline aufbewahrt wird.

Der Rest dieses Abschnitts ist für das Aktualisieren von Hand.

**Wo neue Versionen sind:** auf der Release-Seite von Erevos,
\`https://github.com/azzinder/erevos-releases/releases\`. Die neueste steht oben, etwa **Erevos 2.0.0**, mit einer
Datei für jedes System. Die fünf neuesten bleiben dort.

**Prüfe die Datei**, wenn du kannst, auf einem Computer: Jedes Release hat \`SHA256SUMS\`, und im Ordner mit den
heruntergeladenen Dateien muss \`sha256sum -c --ignore-missing SHA256SUMS\` für jede **OK** sagen.

**Mache zuerst ein Backup** (**Einstellungen** → **Daten und Geräte** → **Backups** → **Backup erstellen**), siehe
[Backups](#backup). Ein Update behält alles, aber ein Backup kostet eine Minute und deckt jede Überraschung ab.

| Auf | So aktualisierst du |
| --- | --- |
| **Android** | **Einstellungen** → **Allgemein** → **Updates** → **Nach Updates suchen** → **Installieren**, oder von Hand: Öffne die Release-Seite auf dem Telefon, tippe auf \`erevos-android.apk\`, dann auf **Installieren**. Es installiert sich über das vorhandene und behält alles. Erlaube das Installieren aus dem Browser einmal, wenn Android fragt. |
| **Linux, Arch-basiert** | \`sudo pacman -U erevos-linux-x86_64.pacman\` |
| **Linux, AppImage** | Ersetze das alte \`erevos-linux-x86_64.AppImage\` durch das neue und mache es ausführbar. |
| **macOS** | Öffne \`erevos-macos.dmg\` und zieh Erevos in „Programme“, **Ersetzen**. Erlaube es dann erneut unter **Systemeinstellungen → Datenschutz & Sicherheit → Dennoch öffnen**. |
| **Windows, installiert** | Schließe Erevos und führe das neue \`erevos-windows-x64-setup.exe\` aus: Es installiert sich über das vorhandene. Windows warnt vielleicht erneut: **Weitere Informationen**, dann **Trotzdem ausführen**. |
| **Windows, portabel** | Schließe Erevos und lege das neue \`erevos-windows-x64-portable.exe\` an die Stelle des alten. |
| **Sailfish OS** | Tippe in **Dateien** auf \`erevos-sailfish-aarch64.rpm\`, dann auf **Installieren**, oder \`pkcon install-local erevos-sailfish-aarch64.rpm\`. |
| **iPhone, Browser** | Nichts zu tun: Die Web-App übernimmt eine neue signierte Version von selbst, wenn sie öffnet, siehe [Auf einem iPhone](#iphone). |

- **Kontakte, Chats und Einstellungen bleiben** auf jedem System: Sie liegen im eigenen Ordner von Erevos, nicht in
  der App.
- **Android, das erste Mal von der Release-Seite:** Ein auf einem Computer zum Testen gebautes Erevos ist mit einem
  anderen Schlüssel signiert, und Android weigert sich, darüber zu installieren (**App nicht installiert**). Mache ein
  Backup, deinstalliere {=Erevos}, installiere das von der Release-Seite und stelle das Backup wieder her. Danach
  installiert sich jedes Update darüber.
- **{=Erevos} aus F-Droid**, sobald es dort ist, wird von F-Droid aktualisiert: Seine **Updates** zeigen die Version und
  sagen das, ohne **Nach Updates suchen**. F-Droid signiert es mit einem eigenen Schlüssel, also installiert Android
  weder es über das Erevos von der Release-Seite noch jenes darüber. Zum Wechseln: Mache ein Backup, deinstalliere
  {=Erevos}, installiere das andere und stelle das Backup wieder her.
- **Nie älter:** Installiere keine ältere Version über eine neuere. Ihre Daten können in einer Form sein, die die
  ältere nicht lesen kann. Stelle stattdessen ein Backup wieder her, das mit dieser älteren Version gemacht wurde.
- **Ein Release, dem dein System fehlt,** sagt das in seinen Hinweisen: Dieser Build ist fehlgeschlagen, also nimm
  das Release davor.

## Erevos an ein Telefon in der Nähe {#give-app}

Ohne Internet kann ein Android-Telefon mit {=Erevos} es an ein Telefon daneben geben, unter **Einstellungen** →
**Allgemein** → **Erevos an ein Telefon in der Nähe geben** (auch in **Updates**). Beide Telefone müssen im selben
WLAN sein, oder das andere im Hotspot dieses Telefons: Schalte den Hotspot zuerst in den Android-Einstellungen ein.

1. **Auf dem gebenden Telefon:** Tippe auf **Starten**. Ein QR-Code erscheint, mit der Größe des Pakets, und darunter
   die Adressen, um sie stattdessen in einen Browser zu tippen.
2. **Auf einem Telefon ohne {=Erevos}:** Scanne den Code mit seiner Kamera. Sein Browser öffnet eine Seite vom gebenden
   Telefon mit **{=Erevos} herunterladen**: Lade es herunter und öffne die Datei, und Android installiert es. Beim ersten
   Mal fragt Android, ob dieser Browser Apps installieren darf. Die Seite zeigt den SHA-256 des Pakets und den seines
   Zertifikats: Sie müssen die sein, die das gebende Telefon unter **Zum Vergleichen** zeigt.
3. **Auf einem Telefon mit älterem {=Erevos}:** Öffne stattdessen **Einstellungen** → **Allgemein** → **Updates** →
   **Von einem Telefon in der Nähe** und fotografiere den Code. Erevos lädt das Paket und öffnet Androids Installer
   nur, wenn sein SHA-256 der im Code ist, es Erevos ist, mit demselben Zertifikat signiert wie das Erevos dort, und
   neuer.

- **Wie lange:** Das gebende Telefon bietet es an, solange seine Seite zu sehen ist, höchstens zehn Minuten, und hört
  mit **Stoppen** früher auf. Es antwortet nur unter einer zufälligen Adresse, die niemand errät, nur Telefonen im
  eigenen Netz, und mit nichts als dem Paket und seiner Seite: Kein Chat, kein Kontakt und keine Einstellung geht mit.
- **Was es dir nicht abnehmen kann:** Der Browser lädt nur herunter. Ein Telefon mit verändertem Erevos würde sein
  eigenes Zertifikat zeigen; vergleiche das Zertifikat daher, sobald du Internet hast, mit dem auf der Website oder
  der Release-Seite von Erevos. Erevos selbst lehnt in **Updates** ein anders signiertes Paket ab.
- **Nicht aus einem Store:** Ein in Teilen installiertes {=Erevos}, wie manche Stores Apps installieren, kann nicht als
  Ganzes gegeben werden und sagt das. {=Erevos} aus F-Droid ist von F-Droid signiert: Es kann an ein Telefon ohne {=Erevos}
  gehen oder über den Browser über das Erevos aus F-Droid, aber ein Erevos von der Release-Seite lehnt es in
  **Updates** ab, wie Android es auch täte. Das Erevos aus F-Droid nimmt in **Updates** nichts an: F-Droid
  aktualisiert es.
- Nur auf Android. Wer im selben Netz den Code sieht, kann Erevos ebenfalls herunterladen; sonst gibt es dort nichts.

**Warum:** Wo das Internet abgeschaltet oder überwacht ist oder ein Telefon die Website gar nicht erreicht, kann Erevos
trotzdem von Hand zu Hand gehen, und das Telefon, das es bekommt, kann prüfen, dass es das echte ist.

## Die Testbildschirme {#tests}

Zwei Bildschirme unter **Einstellungen** → **Zum Testen** sind dazu da, die Verbindungen Schritt für Schritt zu
testen.

- **Funktest (Android):** **Berechtigungen** bittet Android um das, was der Funk braucht, **Starten** und **Stoppen**
  schalten Bluetooth und Wi-Fi Aware ein und aus, **Hallo senden** sendet eine einfache Testnachricht an den Funktest
  des Telefons in der Nähe (ein Chat zeigt sie nicht), und das **Protokoll** zeigt, was passiert ist.
- **Relay-Test (WLAN):** **Warteschlange anlegen** legt eine Warteschlange auf einem Relay an und zeigt zwei IDs. Gib
  die **Absender-ID** dem Telefon, das dir schreibt, und behalte die **Empfänger-ID** für dich. **Senden** und
  **Empfangen** bewegen Nachrichten von Hand.

> Mit einem Telefon kannst du trotzdem einen Chat über das Relay ausprobieren: Deine Chats und
> **Versteckte Chats** haben jeweils ihre eigene Relay-Warteschlange und ihre eigenen Schlüssel. Lege beide
> Warteschlangen auf demselben Relay an, tippe in einem auf **Meinen Kontaktlink teilen** und kopiere ihn, füge ihn
> dann im anderen hinzu, und schreibe in beide Richtungen. Der eigene Link eines Chats wird als Kontakt abgelehnt.

## Was heute geschützt ist {#privacy}

Erevos sagt offen, was es schützt und was es noch nicht schützt.

| Was | Heute | Kommt |
| --- | --- | --- |
| **Konto, Telefonnummer, E-Mail-Adresse** | Nicht nötig. Kontakte sind Paare von Einweg-Warteschlangen auf Relays. | |
| **Kontakte und ihre Namen, Schlüssel, Relay-Einstellungen, Aussehen** | Auf dem Telefon mit dem Schlüssel jedes Bereichs versiegelt. | |
| **Nachrichten über ein Relay** | Ende-zu-Ende-verschlüsselt: PQXDH mit ML-KEM-768 zu Beginn, dann der Double Ratchet. Das Relay kann sie nicht lesen, und sobald beide Telefone eine Nachricht voneinander bekommen haben, kann es sie auch nicht nach Unterhaltung unterscheiden: Jede wird noch einmal für das Telefon versiegelt, an das sie geht. Es sieht, welche Nachrichten sind, die jemand liest, welche Mitteilungen zwischen Telefonen und welche Anrufe, die klingeln, wie jede es sagt. Noch nicht geprüft. | Eine Prüfung von außen. |
| **Nachrichten an ein Telefon in der Nähe** | Ende-zu-Ende-verschlüsselt, genauso wie über das Relay. Wer in der Nähe mithört, kann erkennen, dass Erevos-Telefone nah beieinander sind und wann und wie viel sie senden; im selben WLAN kann das jeder darin, und über Wi-Fi Direct jeder, der dem eigenen WLAN der Telefone beitritt. Bis das Telefon deines Kontakts bekannt ist, bekommen die anderen in der Nähe verbundenen Erevos-Telefone deine kurzen Nachrichten, versiegelt. | |
| **Von anderen Telefonen mitgenommene Nachrichten** | Zweimal versiegelt: Ende zu Ende für deinen Kontakt und für sein Relay. Ein Telefon, das eine mitnimmt, sieht, an welches Relay sie geht, wann und wie groß sie ist; nicht, von wem oder für wen sie ist. Sein Relay sieht, an welches Relay sie geht, und jenes Relay sieht das Relay des Überbringers, nicht sein Telefon. Versiegelt auf dem Telefon aufbewahrt, höchstens drei Tage: die für andere in einer Datei des Telefons, deren Größe ungefähr zeigt, wie viele es sind; deine eigenen in deinem Bereich, mit seinem Schlüssel versiegelt. Versteckte Chats werden nie mitgenommen. | |
| **Nachrichten über LoRa** | Ende-zu-Ende-verschlüsselt, genauso wie über das Relay. Jeder mit einem Funkgerät, kilometerweit entfernt, kann erkennen, dass deines sendet, wann und wie viel, und sein Signal lässt sich bis zu seinem Standort zurückverfolgen. Erevos hält dein Funkgerät davon ab, seinen Namen und seinen Standort zu nennen (Rolle Client hidden, GPS aus, keine feste Position), außer du erlaubst es; einem Funkgerät, das nach seinem Namen fragt, antwortet es trotzdem. Jedes Erevos im Mesh bekommt deine LoRa-Nachrichten, versiegelt. | Den Namen des Funkgeräts aus Erevos festlegen. |
[~] | **Nachrichten per SMS, wenn sonst nichts geht** | Ende-zu-Ende-verschlüsselt wie über das Relay, in versteckten Daten-SMS. Aus, bis du es einschaltest. Der Mobilfunkanbieter sieht, welche Nummer welcher geschrieben hat, wann und wie viele SMS; nie, was geschrieben wurde. Jede kostet, was eine SMS kostet. | |
| **Wer mit wem redet** | Das Relay sieht IP-Adressen, Warteschlangen-IDs und wann und wie viel. Mit einem zweiten Relay sieht dein Relay nie deine Adresse. Von einem auf dem Relay eines Kontakts geliehenen Platz aus sieht sie jedes Relay, an das du sendest. [Über Tor](#tor), sobald du es einschaltest, sieht mit **Nachrichten** kein Relay sie für das, was du schreibst, und mit **Alles** auch für Bilder und Dateien; mit Brücken, für Orte, an denen Tor blockiert ist, sieht das Netz nur eine Brücke. Der Broker von Snowflake und STUN-Server sehen deine Adresse. | Tor auf einem Computer. |
| **Die Verbindung zum Relay** | TLS, und darin, sobald der Schlüssel des Relays bekannt ist, ein Kanal zu diesem Schlüssel: Das Relay beweist bei jeder Verbindung, dass es ihn hat, und das Token und jede Anfrage gehen verschlüsselt an ihn, sodass sich jemand dazwischen mit einem Zertifikat für den Namen des Relays nicht als es ausgeben kann. Ein Relay, das seinen Schlüssel einmal bewiesen hat, wird nie wieder ohne ihn erreicht. Ein Relay, das älter ist als diese App, geht wie bisher, und **So bist du jetzt verbunden** sagt es. Der erste Schlüssel kommt beim ersten Fragen vom Relay oder aus einem Kontaktlink: Wer genau bei diesem allerersten Mal dazwischen ist, könnte einen eigenen geben. [Der eigene Schlüssel des Relays](#relay). Nicht geprüft. | Der Schlüssel unseres Relays fest in der App und in Einladungen. |
| **Texte über Nostr** | Ende-zu-Ende-verschlüsselt wie über ein Relay, dann noch einmal verpackt für einen Schlüssel, den dein Kontakt nur diesem Chat gegeben hat, signiert mit einem nur für diesen Text gemachten Schlüssel. Die Nostr-Relays sehen wann und wie groß, und dass ein Schlüssel, der niemanden nennt, einen Text bekommt; dein Telefon liest all seine Schlüssel über eine Verbindung, über Tor, wenn Tor an ist, sodass ein Relay erkennen kann, dass sie zusammen gelesen werden, und von wo nur mit Tor aus. Dein Relay sieht sie nur als Reserve, und eine Klingel für versteckte Chats. [Über Nostr](#nostr). | |
[~] | **SMS** | Eine normale SMS liest die Telefongesellschaft, wie jede SMS. An eine mit einem Erevos-Kontakt verknüpfte Nummer geht sie stattdessen über Erevos. Eine versteckte Einladung ist eine weitere kurze SMS, die die Telefongesellschaft sieht. | |
| **Die Kontakte des Telefons** | In den eigenen Kontakten von Android, nicht von Erevos versiegelt, wie bei jeder Kontakte-App: Jede App, die sie lesen darf, sieht sie, und ein Konto (Google) kann sie synchronisieren. Erevos sendet sie nirgendwohin. Eine daraus gespeicherte .vcf-Datei ist außerhalb von Erevos, nicht versiegelt.{~ Die Anrufe und SMS eines Kontakts werden nur aus der eigenen Anrufliste und den SMS des Telefons gelesen, um seinen Verlauf zu zeigen, und nirgends aufbewahrt.} | |
| **Nur in Erevos gespeicherte Kontakte** | Mit dem Schlüssel des Bereichs versiegelt, oder mit dem der versteckten Chats für deren Kontakte, in einer Datei für jeden Bereich, deren Größe ungefähr zeigt, wie viele es insgesamt sind, nicht wem sie gehören; ihre Fotos jeweils in einer eigenen Datei. Nie in den Kontakten von Android. Eine daraus gespeicherte .vcf-Datei, auch aus versteckten Chats, ist außerhalb von Erevos, nicht verschlüsselt. Anrufe{~ und SMS} an sie gehen über das Telefon und erscheinen in seiner Anrufliste{~ und seinen SMS}. | |
[~] | **Telefonanrufe** | Normale Telefonanrufe: Die Telefongesellschaft überträgt sie und kann mithören, wie bei jeder Telefon-App. Android führt die Anrufliste, nicht von Erevos versiegelt, wie für jede Telefon-App; Erevos liest sie, und die Favoriten, um sie zu zeigen, löscht daraus nur die Anrufe, die du löschst, und behält keine Kopie. Die für jede Nummer gewählte SIM ist im Bereich versiegelt; die Schnellantworten und was blockiert ist (nur Präfixe, Gruppen-IDs und Zeiten, für jeden Bereich gleich) werden auf dem Telefon aufbewahrt, nicht versiegelt. | |
| **Importierte Chats** | Versiegelt in dem Bereich, in den sie geholt wurden, auch ihre Fotos und Dateien, jedes in seinen Stücken wie die Datei eines Chats. Die Größe der Datei, und wie viele Stücke es gibt, verraten ungefähr, wie viel importiert wurde, nicht wohin. | Fotos und Dateien aus Viber, und Dateien über 4 GB. |
| **Nachrichtenverlauf** | Auf dem Telefon aufbewahrt, versiegelt in seinem Bereich, ohne Grenze, in Seiten gleicher Größe, gemischt für alle Bereiche. Nur wie viel alles zusammen belegt, ist sichtbar, nicht zu welchem Bereich es gehört. Löschen auf beiden Telefonen und verschwindende Nachrichten verlassen sich auf das Erevos des anderen Telefons. | |
| **Nachrichten in der Nähe** | Öffnen sich nur in dem Bereich, der den Kontakt hat. Eine für einen anderen Bereich wartet im Arbeitsspeicher, höchstens sechs Stunden, bis sich dieser Bereich öffnet. Eine für versteckte Chats öffnet sich nur, solange sie offen sind oder geschlossen empfangen, und der Bereich erfährt nie, dass einer ihrer Kontakte in der Nähe ist. | |
| **Sprachnachrichten** | Ende-zu-Ende-verschlüsselt über das Relay oder in der Nähe, in Stücken: Das Relay, oder wer in der Nähe mithört, kann ungefähr erkennen, wie lang jede ist. Jeder Ton ist in einer eigenen Datei versiegelt; wie viele Dateien es gibt und wie groß sie sind, zeigt ungefähr, wie viele aufbewahrt werden, nicht in welchem Bereich. Nur während des Abspielens entsiegelt im Cache. | Tondateien alle gleich groß. |
| **Fotos und Dateien** | Ende-zu-Ende-verschlüsselt, über den Dateispeicher des Relays, in Stücken gleicher Größe: Das Relay sieht wie viele und wann, also ungefähr wie groß. Dein Relay sieht deine Adresse, wie bei Nachrichten; der Kontakt holt sie über sein eigenes Relay. Fotos verlieren ihren Ort, ihr Telefon und ihre Zeit, außer sie werden als Datei gesendet; eine Datei behält, was sie in sich sagt. Auf dem Telefon in ihren Stücken versiegelt, aus dem Arbeitsspeicher gezeigt. Gespeicherte Kopien sind außerhalb von Erevos. Backups enthalten sie, mit dem Passwort des Backups versiegelt, in eigenen Dateien. | |
| **Auf einem Computer** | Versiegelt wie auf dem Telefon, im eigenen Ordner der App. Sein Schlüsselspeicher ist mit dem Schlüsselbund des Systems versiegelt (unter Windows mit dem Schlüssel deines Kontos); auf einem Linux-System ohne Schlüsselbund bewahrt Erevos nichts auf, außer es wurde mit \`--plain-secrets\` gestartet, und bewahrt ihn dann so auf, wie er ist. | |
| **Backups** | Mit eigenem Passwort versiegelt, enthalten sie jeden Bereich so, wie er auf dem Telefon versiegelt ist, seine Fotos, Dateien und Sprachnachrichten in eigenen Dateien neben dem Backup. Ihre Namen sagen, dass sie ein Erevos-Backup sind, und ihre Zahl und Größe zeigen ungefähr, wie viel aufbewahrt wird. Automatische Backups bewahren ihr Passwort auf dem Telefon auf. Gehen nur an einen Server, wenn du einen hinzufügst: zufällige Bytes unter zufälligen Namen, in aufgerundeten Größen; der Server sieht dein Konto und wann, und deine Adresse, außer sie gehen über Tor. | |
| **Zeichen ✓✓ und ✓✓✓** | Das Telefon des Kontakts erfährt, verschlüsselt, wann deines seine Nachrichten bekommen und gelesen hat. In einer Gruppe, die nicht öffentlich ist, erfährt es auch das Telefon dessen, der die Nachricht geschickt hat. Das Relay, oder wer in der Nähe mithört, sieht eine weitere kleine Nachricht. | Ein Schalter, um nicht mehr mitzuteilen, wann du liest. |
| **Fingerabdruck oder Gesicht (Android)** | Aus, solange nicht eingeschaltet. Öffnet nur den Bereich des ersten Passworts: sein Schlüssel im Android Keystore versiegelt, nur direkt nach einer starken Fingerabdruck- oder Gesichtsprüfung nutzbar und verworfen, wenn diese sich ändern. Jemand, der dich festhält, kann deinen Finger benutzen. | |
| **Benachrichtigungen (Android)** | Im Hintergrund: „Erevos – Ready for calls and messages“ (nicht auf dem Sperrbildschirm), „Incoming call“ oder „Incoming video call“ – „Open Erevos to answer“, und „New message“ oder wie viele kamen; wenn Android oder das Passwort es beendet, „Closed by Android“ oder „Locked“ – „Open it to receive calls and messages again“; eine Erinnerung, „Reminder“ oder wie viele; eine neue Version, „Erevos X is out“. Nie wer oder was. Auf einem gesperrten Telefon sagt die für Nachrichten nur „Erevos“. Versteckte Chats, die es dürfen, zeigen dieselbe Benachrichtigung, mit dem Rest gezählt: Wer sie sieht und nichts Neues findet, kann ahnen, dass es mehr gibt. Als Telefon-App nennt die Benachrichtigung eines Telefonanrufs, wer anruft, auch über dem Sperrbildschirm, wie die jeder Telefon-App, aber nie mit einem Namen, den nur versteckte Chats kennen: Ein Anruf von einem ihrer Kontakte zeigt die Nummer. | |
| **Widget{~ und Telefon} (Android)** | Das Widget zeigt, sobald es hinzugefügt ist, wie viele {~verpasste Anrufe, ungelesene SMS und |}neue Nachrichten es gibt, nie wer oder was.{~ Das Telefon öffnet sich nur ohne Passwort, wenn du es erlaubst: Dann sieht jeder, der das entsperrte Telefon in der Hand hat, die Anrufe und Favoriten, die Android führt, nur mit den Namen aus den Kontakten des Telefons.} | |
| **Anrufe** | Ende-zu-Ende-verschlüsselt (DTLS-SRTP, sein Schlüssel im verschlüsselten Chat gesendet). Über das Anruf-Relay sieht keines der Telefone die IP-Adresse des anderen; der Server, auf dem es läuft, sieht beide, wann und wie lange, und wie viel durchgeht. Ohne Anruf-Relay, nur im selben WLAN, sieht jedes Telefon die Adresse des anderen. Die Relays sehen, wann ein Anruf zu klingeln beginnt. | Klingeln in der Web-App, wenn geschlossen. Anrufe über Bluetooth (das Walkie-Talkie funktioniert dort). |
| **Gruppenchats** | Ende-zu-Ende-verschlüsselt mit MLS (RFC 9420); herausgenommene Mitglieder lesen danach nichts mehr. Die Kopie jedes Mitglieds wird für sich versiegelt, sodass Relays nicht erkennen können, wer in einer Gruppe ist; jedes Relay sieht trotzdem eine Nachricht in einer Warteschlange ankommen. Mitglieder sehen die Schlüssel und Relay-Adressen der anderen. Fotos, Dateien und Sprachnachrichten gehen über den Dateispeicher des Relays des Absenders, wie an einen Kontakt, und bleiben dort 14 Tage. Nicht geprüft. | |
| **Gruppenanrufe** | Sprache und Video, Ende-zu-Ende-verschlüsselt zwischen je zwei Telefonen im Anruf (DTLS-SRTP, seine Schlüssel in der Verschlüsselung der Gruppe gesendet). Über das Anruf-Relay sieht kein Telefon die IP-Adresse eines anderen; der Server, auf dem es läuft, sieht die jedes Telefons, wann und wie lange, und wie viel durchgeht. Jedes Mitglied, im Anruf oder nicht, erfährt, wer darin ist. Die Relays sehen, wann einer beginnt. | Video mit mehr als vier Personen, über einen Server; mehr als acht Personen. |
| **Öffentliche Gruppen** | Wie Gruppenchats, und jeder mit dem Link kann um Beitritt bitten und ab dem Hereinlassen lesen. Anfragen kommen beim Relay des Inhabers an, versiegelt für das Telefon des Inhabers: Das Relay sieht wie viele und wann, nicht von wem. Mitglieder sehen die gewählten Namen der anderen, nur für diese Gruppe gemachte Schlüssel, Relay-Adressen und Absender-IDs der Warteschlangen. Nicht geprüft. | |
| **Linkvorschauen** | Aus, solange nicht eingeschaltet. Dann ruft dein Telefon beim Senden eines Links dessen Seite direkt von der Website ab, die deine IP-Adresse sieht und wann, nicht für wen die Nachricht ist. Die Vorschau geht in der verschlüsselten Nachricht mit; das empfangende Telefon ruft nichts ab. Mit **Über Tor** an wird die Seite nur über Tor geholt, und die Seite sieht deine IP-Adresse nicht. Keine, solange der Bereich alles über Tor schickt, außer **Über Tor** ist an; in versteckten Chats nur mit dem eigenen Schalter ihres Platzes. | |

## Transparenz {#transparency}

Was der Server hinter Erevos (lphl.nekten.eu) aufbewahrt, und was von ihm verlangt wurde. Diese Seite geht in jedem
Release mit hinaus, ist also mit dem Release signiert, wie die App.

**Anfragen von Behörden.** Stand dieses Releases: keine. Keine Behörde, kein Gericht und kein Unternehmen hat Daten
über jemanden verlangt, der {=Erevos} nutzt, und niemand wurde aufgefordert, über eine solche Anfrage zu schweigen. Wenn
dieser Absatz jemals fehlt oder nicht mehr „keine“ sagt, nimm das als Zeichen. **Warum:** Eine Anfrage, die mit der
Anordnung kommt, zu schweigen, kann nicht erzählt werden, aber ein Satz, der nicht mehr geschrieben wird, kann
auffallen. Das funktioniert nur, solange er erneuert wird: Jedes Release sagt ihn erneut.

Was das Relay aufbewahrt, und wie lange:

| Was | Wie lange |
| --- | --- |
| **Wartende Nachrichten**, Ende zu Ende verschlüsselt | Bis sie geholt werden, höchstens 14 Tage. |
| **Fotos und Dateien**, verschlüsselt, in Stücken | Wie Nachrichten: bis sie geholt werden, höchstens 14 Tage. |
| **Für später gesendete Nachrichten**, verschlüsselt | Bis ihre Zeit kommt. |
| **Warteschlangen**, zufällige IDs ohne Namen | Bis ihr Telefon sie 180 Tage lang nicht genutzt hat. |
| **Zugangszeilen**: für jedes Telefon der SHA-256 seines Tokens und ein Name: zufällige Buchstaben und Ziffern für eines, das ab Erevos 6.0.0 eingeladen wurde (davor der, den der Einladende eingegeben hat), oder der LPHL-Benutzername für die, die sich mit LPHL angemeldet haben | Bis die Zeile herausgenommen wird. |
| **Push-Adressen der Web-App**, für Benachrichtigungen, während die Web-App geschlossen ist | Bis sie in der Web-App ausgeschaltet werden. |

Was es nicht aufbewahrt:

- **Keine Liste von Verbindungen.** Das Relay schreibt kein Protokoll darüber, wer sich wann verbunden hat, und der
  Webserver vor dem Relay und der Web-App führt seit dem 24. Oktober 2026 kein Zugriffsprotokoll. Fehler werden
  protokolliert, und ein Fehler kann eine Adresse nennen.
- **Keine Kontakte, Namen oder Telefonnummern.** Es hat keine, die es aufbewahren könnte.

Was es trotzdem sieht, während es läuft: die IP-Adressen, die sich verbinden, wann Nachrichten kommen und gehen, und
wie groß sie sind, wie [Was heute geschützt ist](#privacy) sagt. Während eines Anrufs über das Anruf-Relay die
IP-Adressen der Telefone darin.

**Kopien.** Der Ordner des Relays wird jeden Tag gesichert, mit den wartenden Nachrichten weiterhin Ende zu Ende
verschlüsselt. Die Kopien enthalten, was die Tabelle oben aufführt, so lange sie aufbewahrt werden.

**Andere, die etwas sehen:** die Hosting-Firma (Hetzner), die die Maschine und ihr Netz betreibt; die Anmeldung von
LPHL (Authentik), die jede Anmeldung mit LPHL sieht; und für die Web-App mit Benachrichtigungen, wenn geschlossen, der
Push-Dienst des Browsers (Apple, Google oder Mozilla), der sieht, dass eine Benachrichtigung kam, nie was.

## Lizenz {#licence}

**Erevos, by azzinder.** Copyright © 2026 azzinder.

Erevos ist freie Software, unter der GNU Affero General Public License, Version 3 oder jeder späteren Version
(AGPL-3.0-or-later): Jeder darf sie nutzen, untersuchen, weitergeben und ändern. Wer Erevos weitergibt, geändert oder
nicht, oder ein geändertes Erevos für andere über ein Netzwerk betreibt, muss diese Lizenz einhalten und den Quellcode
seiner Version an alle weitergeben, die sie bekommen.

### Zusätzliche Bedingungen

Nach Abschnitt 7 der Lizenz gelten für Erevos außerdem diese Bedingungen:

- **Der Name des Urhebers.** Kopien und geänderte Fassungen behalten den Hinweis „Erevos, by azzinder“ im Bereich
  „Über Erevos“ der App, [Was Erevos ist](#about).
- **Eine geänderte Fassung sagt es.** Sie sagt klar, dass sie geändert ist, und gibt sich nicht als das ursprüngliche
  Erevos aus.
- **Der Name und das Logo.** Die Lizenz gibt kein Recht am Namen „Erevos“ oder an seinem Logo: Eine geänderte Fassung,
  die an andere weitergegeben wird, bekommt einen anderen Namen.

### Keine Garantie

Erevos wird in der Hoffnung weitergegeben, dass es nützlich ist, aber **ohne jede Garantie**: nicht einmal, dass es
verkäuflich ist oder für einen bestimmten Zweck taugt. Die Lizenz sagt mehr dazu.

### Wer es gemacht hat

Erevos entsteht durch **menschlich gesteuerte agentische Entwicklung (human-directed agentic engineering)**: azzinder
legt den Entwurf fest, die Grenzen, was jede Änderung tun muss und wann sie fertig ist; KI-Werkzeuge schreiben, führen
die Prüfungen aus und überarbeiten.

Erevos wird von azzinder entworfen, geleitet und betreut: azzinder hat seine Funktionen und ihre Arbeitsweise, sein
Sicherheitsmodell und seinen Aufbau bestimmt, testet es auf echten Geräten und entscheidet, was in jede Version kommt.
KI-Werkzeuge wurden ausgiebig genutzt, um den Code und die Texte zu schreiben, immer nach den Anweisungen und dem
Entwurf von azzinder.

Teile, die andere gemacht haben, behalten ihre eigenen Macher und Lizenzen, siehe
[Mit der Open-Source-Arbeit anderer gebaut](#about). Die vollständigen Texte kommen mit dem Quellcode von {=Erevos}:
\`AUTHORS.md\`, \`CREDITS.md\` und der Ordner \`LICENSES\`. Jede Kopie von Erevos enthält außerdem die Datei \`NOTICES.txt\` mit der Lizenz von Erevos, \`AUTHORS.md\` und jedem Paket, aus dem Erevos gebaut ist, jeweils mit seinem Lizenztext: in der Android-App, im Ordner der Computer- und Sailfish-Apps und in der Web-App unter \`/NOTICES.txt\`. Die Lizenz selbst steht auf
[gnu.org](https://www.gnu.org/licenses/agpl-3.0.html).

**Warum:** Eine freie Lizenz schützt dich nur, wenn du sie lesen kannst. Sie sagt, was du mit Erevos tun darfst und was
jeder dir schuldet, der es ändert.

Dieser Teil öffnet sich auch über **Einstellungen** → **Allgemein** → **Lizenz**.

## Was kommt {#coming}

Ende-zu-Ende-Verschlüsselung ist da, über das Relay und über die Verbindung in der Nähe, und das meiste, was folgt,
baut darauf auf.

- **Mehr Wege, in Kontakt zu bleiben:** Tor-Brücken für Orte, an denen Tor blockiert ist, sind da, siehe
  [Über Tor](#tor). Als Nächstes: Tor auf einem Computer.
  - **LoRa-Funkgeräte (Meshtastic):** da, siehe [Über LoRa-Funk](#lora). Als Nächstes: den Namen des Funkgeräts aus
    Erevos festlegen.
  - [~] **SMS:** Erevos als SMS-App ist da, mit MMS-Fotos, Gruppen-MMS und zwei SIMs, siehe [SMS](#sms).
  - [~] **Telefon:** Erevos als Telefon-App ist da, mit eigenem Anrufbildschirm, siehe [Telefon](#phone).
  - **E-Mail, QR-Codes, USB, NFC:** für den Fall, dass nichts anderes durchkommt.
- **Anrufe:** Sprach- und Videoanrufe sind da, und auf Android klingeln sie im Hintergrund, siehe
  [Chat über ein Relay](#relay), und ebenso ein Walkie-Talkie, das sogar über Bluetooth funktioniert.
- **Gruppen:** Gruppenchats, mit Fotos, Dateien und Sprachnachrichten, und Sprach- und Videoanrufe in Gruppen sind da,
  siehe [Gruppenchats](#groups). Als Nächstes: Video mit mehr als vier Personen, über einen Server, zu dem der Anruf
  von selbst wechselt, weiterhin Ende zu Ende verschlüsselt.
- **Deine Chats mitbringen:** Telegram und WhatsApp kommen schon herein, mit ihren Fotos und Dateien, und Viber mit
  seinen Worten, siehe [Importierte Chats](#import). Als Nächstes: Fotos und Dateien aus Viber.
- **Mehr Systeme:** öffentliche Gruppen und Gruppenanrufe auch auf verknüpften Geräten; das Konto, seine Anrufe und
  seine Gruppen sind schon auf einem Computer, siehe [Verknüpfte Geräte](#devices). Linux, macOS und Windows sind da,
  siehe [Auf einem Computer](#desktop), das iPhone im Browser, siehe [Auf einem iPhone](#iphone), und Sailfish OS,
  siehe [Unter Sailfish OS](#sailfish); und ebenso Backups, siehe [Backups](#backup).

## Fragen {#faq}

### Ich habe mein Passwort vergessen.

Es lässt sich nicht wiederherstellen. Erevos bewahrt nichts auf, was deine Daten ohne es öffnen könnte. Nur wenn das
Entsperren mit [Fingerabdruck oder Gesicht](#lock) an ist, öffnet es noch den ersten Bereich: Lege dort mit
**Passwort ändern** ein neues Passwort fest.

### Ein Kontakt in der Nähe zeigt nie „In der Nähe“.

- Schreib ihm: Die Telefone erfahren, welches welches ist, aus der ersten Nachricht, die
  in der Nähe ankommt. Nur Kontakte werden gefunden, also fügt euch zuerst gegenseitig hinzu.
- Halte auf beiden Telefonen einen Bereich offen: Erevos auf dem Bildschirm, oder im Hintergrund mit
  **Im Hintergrund** auf **Empfangen und klingeln**.
- Prüfe, dass Bluetooth an ist (und, auf Android 12 und älter, der Standort) und dass Erevos Geräte in der Nähe finden
  darf (Android-Einstellungen → Apps → Erevos → Berechtigungen).
- Bring die Telefone näher zusammen. Wenn eines von ihnen kein Wi-Fi Aware hat, finden sie sich über Bluetooth, was
  langsamer startet.
- Oder verbinde beide mit einem WLAN oder dem Hotspot eines Telefons, mit eingeschaltetem
  **Erevos im selben WLAN finden**. Manche öffentlichen WLANs halten die Geräte darin voneinander getrennt: Dort kann
  es nicht funktionieren. Ohne gemeinsames WLAN lässt **WLAN mit Telefonen in der Nähe aufbauen** sie eines aufbauen
  (Android 10 und neuer); gib ihm bis zu ein, zwei Minuten.

### Über LoRa kommt nichts an.

- Beide Funkgeräte brauchen in der Meshtastic-App dieselbe Region und denselben ersten Kanal (seinen Namen und
  Schlüssel), und sie müssen in Reichweite voneinander sein, oder von Funkgeräten dazwischen.
- **LoRa-Funk**, unter **Einstellungen** → **Relay und Netze**, muss **Verbunden** sagen. Wenn nicht, schließe die
  Meshtastic-App: Ein Funkgerät verbindet sich immer nur mit einer App.
- Nur Texte gehen, und nur wenn das Relay nicht erreichbar und kein Telefon in der Nähe ist.
- In der EU darf ein Funkgerät pro Stunde nur begrenzt senden: Nach vielen Nachrichten wartet es.

### Ein Kontaktcode wurde nicht hinzugefügt.

Ein Kontakt auf einem anderen Relay braucht einen Link mit dem Schlüssel dieses Relays, den Links aus einem aktuellen
{=Erevos} haben: Die Zeile unter dem Chat nennt dieses Relay. Ein Code aus einem älteren {=Erevos} hat keine Schlüssel und
wird abgelehnt: Bitte um einen neuen.

### Kann das Relay meine Nachrichten lesen?

Nein. Nachrichten über ein Relay sind Ende-zu-Ende-verschlüsselt, und nur die beiden Telefone haben die Schlüssel. Das
Relay sieht trotzdem, welche Warteschlangen genutzt werden, und wann und wie viel ankommt
([Ein eigenes Relay betreiben](#own-relay)). Vergleiche die Sicherheitsnummer, wie in [Chat über ein Relay](#relay),
um sicher zu sein, dass niemand dazwischen ist. Nichts davon wurde bisher geprüft.

### Warum fragt Erevos nicht nach meiner Telefonnummer?

Weil nichts sie braucht. Jeder Kontakt ist ein Paar von Einweg-Warteschlangen auf Relays, sodass kein Server eine
Liste führt, wer wen kennt.

### Funktioniert es auf einem iPhone oder einem Computer?

Auf einem Computer ja: Linux, macOS und Windows, siehe [Auf einem Computer](#desktop).
Auf einem iPhone ja, im Browser, als Web-App, siehe [Auf einem iPhone](#iphone).
`;
