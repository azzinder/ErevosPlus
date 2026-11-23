// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/** The user guide in Italian. Its format: lib/guide.ts. The same sections, in the same order and shape, as the English one. */
export const guide = `
## Che cos’è Erevos {#about}

Erevos è un’app di messaggistica fatta per la privacy. Per usarla non ti servono un account, un numero di telefono o
un’email, ed è pensata per continuare a funzionare ovunque tu sia: tramite un telefono vicino senza alcuna rete, via
Wi-Fi o via internet.

- **Da vicino, senza internet:** due telefoni Android si parlano direttamente via Bluetooth, Wi-Fi Aware o Wi-Fi
  Direct, con crittografia end-to-end, e lo stesso fanno telefoni e computer sulla stessa rete Wi-Fi o sull’hotspot di
  un telefono. Con una radio LoRa, i testi arrivano a chilometri di distanza.
- **Tramite un relay:** via Wi-Fi o internet, attraverso un piccolo server (un relay) che puoi far funzionare tu stesso.
- **Spazi:** un blocco con password, una seconda password che apre un Erevos separato e vuoto, e chat nascoste in ogni
  spazio.
- **Aspetto:** gli stili di LPHL: Classic, Modernist e Nocturne, dodici tavolozze e il vetro come su lphl.nekten.eu.

{-**Erevos+** è la stessa app con di più: chat con persone su Telegram, Messenger, Signal, Session, Matrix, XMPP e
Nostr, su Android 8.0 o successivo. Ci passi, o torni indietro, in **Aggiornamenti**: vedi
[Erevos, Erevos+ o Erevos Lite, e beta](#update-channel).}

> I messaggi sono **crittografati end-to-end**, sia tramite un relay sia da vicino, ma niente è stato ancora verificato
> da esperti indipendenti. [Che cosa è protetto oggi](#privacy) dice esattamente che cosa lo è e che cosa no.

Questa guida si apre da **Guida** nel menu della schermata principale (i tre puntini in alto). La ricerca in cima trova
qualsiasi parola al suo interno. La guida è in tutte le lingue dell’app, e appare in quella che hai scelto,
vedi [Lingua](#start).

### Chi lo fa, e perché

- **Chi:** Erevos, by azzinder: la stessa persona che ha fatto [Fasouli](https://github.com/azzinder/lphl-chrima-releases/releases/latest), un’app privata per le tue finanze.
- **Dove:** non importa. Quello che conta è che il relay e l’app per il browser girano sul server di chi lo fa
  (lphl.nekten.eu).
- **Per chi:** per chiunque voglia parlare con le sue persone senza dare un numero di telefono, un’email o un
  account: amici, famiglie, gruppi, e chi vive dove internet viene tagliato o sorvegliato. E per chi, pur non avendo
  niente da nascondere, vuole tenere privato il proprio spazio personale, al riparo da occhi indiscreti.
- **Perché:** perché le app più note chiedono un numero di telefono, sanno chi parla con chi, e smettono di funzionare
  quando internet cade. Perché i «termini d’uso» di alcune non ci tutelano, e abbiamo dubbi su come proteggono la
  nostra privacy. Perché ad altre mancano funzioni di cui abbiamo bisogno. Erevos non chiede nulla, e trova una strada
  attraverso qualunque cosa ci sia: internet, il Wi-Fi, il Bluetooth, un telefono vicino.
- **Chi paga:** nessuno: niente pubblicità, niente investitori, nessuna raccolta di dati. Chi vuole può aiutare con i
  costi di gestione, come il server: **Impostazioni** → **Generali** → **Sostieni Erevos** ha i modi per farlo,
  Liberapay, PayPal, Monero e Bitcoin. Donare o no non cambia nulla nell’app.
  **Perché:** ogni modo si apre fuori da Erevos, nel browser o in un wallet, solo quando lo tocchi, quindi Erevos stesso
  non invia nulla e non sa mai chi ha donato. PayPal sa chi dona; Monero non mostra né chi ha donato né quanto; Bitcoin
  non mostra nomi, ma quello che l’indirizzo ha ricevuto è pubblico.
- **Contatto:** **Impostazioni** → **Generali** → **Contatto** aggiunge l’autore come contatto, e gli scrivi nello
  stesso Erevos, con crittografia end-to-end, senza numero di telefono né email.

### Fatto con l’open source degli altri

Erevos stesso è software libero, con licenza AGPL-3.0-or-later, vedi [Licenza](#licence), ed è costruito sul lavoro
open source di altri. Queste sono le parti principali, ognuna con i suoi autori e la sua licenza:

- **Element Call** (Element; AGPL-3.0): le chiamate Matrix.
- **Arti, lyrebird, Snowflake e WebTunnel** (The Tor Project; Arti MIT o Apache-2.0, lyrebird BSD-2-Clause, Snowflake
  BSD-3-Clause, WebTunnel MIT): Tor dentro l’app, e i bridge Tor su Android.
- **vodozemac** (Matrix.org Foundation; Apache-2.0): la cifratura di Matrix.
- **OpenMLS** (OpenMLS Authors; MIT): i gruppi cifrati.
- **Le librerie RustCrypto e dalek-cryptography** (i loro sviluppatori; MIT o Apache-2.0 per RustCrypto, BSD-3-Clause per
  dalek-cryptography): la cifratura stessa.
- **React Native, Expo e react-native-webrtc** (Meta, 650 Industries e la comunità React Native WebRTC; MIT): l’app e le
  sue chiamate.
- **Electron** (Electron contributors; MIT): l’app per computer.
- **I caratteri Inter** (Rasmus Andersson e gli Inter Project Authors; SIL Open Font License 1.1): i caratteri
  dell’app.

L’elenco completo, ogni pacchetto con la sua licenza, è nel file \`CREDITS.md\` che arriva con il codice sorgente di
{=Erevos}.

**Perché:** perché chi li ha fatti ha dato il proprio lavoro liberamente e ha chiesto di essere nominato, e perché devi
poter vedere di che cosa è fatto Erevos.

Questa parte si apre anche da **Impostazioni** → **Generali** → **Informazioni su Erevos**.

## Per iniziare {#start}

Erevos si scarica dalla sua pagina delle versioni, un file per ogni sistema: vedi [Aggiornamenti](#updates) per dove, e
per come aggiornarlo. Funziona su Android, su computer (Linux, macOS e Windows), su Sailfish OS e, dal browser, su
iPhone. Se sei nuovo, comincia con un invito da qualcuno che lo usa: un codice QR o un link, e sei dentro, con quella
persona già tra i tuoi contatti (vedi Invitare qualcuno di nuovo, in [Chat tramite un relay](#relay)).

La schermata principale è l’elenco delle tue chat, con in cima quella che si è mossa per ultima. Ognuna mostra
l’immagine del contatto, l’ultimo messaggio con i suoi segni, quando è arrivato, e quanti dei suoi messaggi non hai
letto. Un orologio accanto significa che i suoi messaggi scompaiono. **Cerca nelle chat** trova una chat dal nome o
dall’ultimo messaggio e, sotto le chat, i messaggi che contengono quello che scrivi, in tutte le chat dello spazio:
toccane uno per aprire la sua chat in quel punto. In una chat, i suoi dettagli hanno **Cerca in questa chat**: ▲ e ▼
vanno a quello che ha trovato prima e dopo. Entrambe cercano solo su questo telefono: in quello che conserva sigillato{~,
e **Cerca in questa chat** anche negli SMS che mostra la chat di un contatto}; nelle chat nascoste si cerca solo dal loro
interno. Una chat lunga si apre ai suoi ultimi 100 messaggi, e quelli precedenti, tra cui quelli importati da Telegram
o WhatsApp, arrivano da soli man mano che scorri verso l’alto (li porta anche **Mostra i messaggi precedenti**, sopra
di loro); andare a uno precedente (dalla ricerca, da un messaggio importante o da quello a cui risponde un messaggio)
porta anche quello.
Ogni chat si apre sul suo ultimo messaggio, con la barra dei messaggi sotto: le chat con i contatti{~, i gruppi e le
conversazioni SMS| e i gruppi}{+, come le chat Matrix, XMPP e Nostr}. Se scorri un po’ verso l’alto, in basso a destra compaiono frecce
rotonde, in ognuna: quella in alto va all’inizio della chat, quella in basso torna alla fine. In mezzo, se all’apertura
c’erano messaggi nuovi, una doppia spunta va al primo di essi, dove avevi lasciato, finché quel messaggio non si vede.
Dall’inizio, **Mostra i messaggi successivi**, sotto quello che si vede, ne porta altri; scrivere un messaggio, o la
freccia in basso, riporta alla fine.

**Perché:** una chat lunga si apre ai suoi ultimi messaggi così si apre subito: disegnarla tutta in una volta sarebbe
lento, soprattutto sui telefoni più vecchi. Le chat nascoste restano fuori dalla ricerca della schermata principale
così che la schermata principale appaia uguale che uno spazio ne abbia o no: i loro messaggi si possono leggere solo
mentre il loro PIN le tiene aperte.

**Fissate e archiviate:** tieni premuta una chat qualsiasi nella schermata principale, di un contatto o di un gruppo{~,
|}{+su Matrix, XMPP, Nostr o SMS}{-{~o una conversazione SMS}}, per **Fissa in alto**, **Archivia** e, su Android, **Silenzia questa chat**. Al massimo
10 chat restano fissate. Una chat archiviata lascia l’elenco finché non ne arriva un nuovo messaggio; tocca
**Archiviate** in alto per vedere ciò che hai archiviato,{~ SMS compresi,} e toccalo di nuovo per tornare. Le chat
nascoste hanno le proprie chat fissate e archiviate.

- **L’immagine** è disegnata dalla chiave del contatto: la stessa chiave dà sempre gli stessi colori e la stessa luna{+
  (nei verdi con Matrix)}, così riconosci una chat a colpo d’occhio senza nessuna foto. Non è una verifica della chiave;
  il [codice di sicurezza](#relay) lo è.
- **La riga sotto la ricerca** dice se è impostato un relay e se la tua coda è pronta. Toccala per impostarne uno.
- **La ricerca e quella riga restano** sotto la barra in alto{~, con il pulsante dei servizi,|} mentre la lista scorre.
- **Chat con me stesso**, sempre prima tra le chat, con una puntina, contiene le tue note per te stesso: vedi Chat con
  me stesso e promemoria più sotto.
- [+] **Le chat Matrix**, una volta che hai fatto l’accesso a Matrix, sono nell’elenco con le altre, le più recenti
  prima, ognuna segnata **Matrix**, e un invito compare in cima. Il chip **Matrix** mostra solo loro, e lì
  **Nuova chat** avvia una chat Matrix: vedi [Matrix](#matrix).
- [+] **Le chat XMPP**, una volta che hai fatto l’accesso a XMPP, sono nell’elenco allo stesso modo, ognuna segnata
  **XMPP**, e chi chiede di aggiungerti, o un gruppo che ti invita, compare in cima. Il chip **XMPP** mostra solo loro,
  e lì **Nuova chat** avvia una chat XMPP: vedi [XMPP](#xmpp).
- [+] **Le chat Nostr**, quando lo spazio ha una chiave Nostr, sono nella lista allo stesso modo, ognuna segnata **Nostr**.
  Il pulsante **Nostr** mostra solo loro, con quanti messaggi non sono letti, e lì **Nuova chat** apre la schermata
  delle chat Nostr: vedi [Chat con altre app Nostr](#nostr-chats).
- **Segna tutto come letto**, nel menu ⋮, legge in un colpo ogni chat della parte dell’elenco in cui ti trovi (tutti i
  messaggi{~, SMS| o}{-{~ o|} Erevos}{+, Erevos, Matrix, XMPP o Nostr}), anche quelle silenziate e bloccate con PIN, dopo aver chiesto. Ognuna è
  letta come se l’aprissi, quindi chi ha scritto viene avvisato come allora; gli inviti e le persone che chiedono di
  aggiungerti restano finché non rispondi.{+ Le schermate di Matrix, XMPP e Nostr lo hanno sotto **Chat** per le proprie
  chat.} Le chat nascoste non le legge mai.
- [+] **Il feed pubblico**, quando lo spazio ha una chiave Nostr o è in una stanza Matrix pubblica, è un pulsante in più,
  **Pubblico**: un solo feed, come in Amethyst, con i post pubblici delle persone che la tua chiave Nostr segue e i
  messaggi delle stanze Matrix pubbliche in cui sei, dai più recenti. Ognuno mostra chi l’ha scritto (una piccola N o M
  dice la rete), quando, le sue parole, le sue foto dentro il post e una scheda per il suo link. Con entrambe attive,
  **Tutto**, **Nostr** e **Matrix**, sopra il feed, scelgono cosa si vede, e **Foto** sceglie come si prendono foto e
  schede. Sotto un post: rispondere, condividere di nuovo, mettere Mi piace e condividere; sotto un messaggio Matrix:
  rispondere, reagire e condividere. **Nuovo post**, la penna in basso, scrive un post pubblico, con fino a quattro
  foto. Vedi [Chat con altre app Nostr](#nostr-chats).
- **Nuova chat**, in basso, apre le impostazioni del relay e l’aggiunta di un contatto. **Ricordamelo**, la campanella
  arancione accanto, scrive un promemoria per te.
- **{~La cornetta verde e la persona viola|La persona viola}** in alto, su Android, {~aprono subito **Telefono** e **Contatti**, nei colori
  delle loro icone|apre subito **Contatti**, nel colore
  della sua icona} sulla schermata Home del telefono. {~Non sono|Non è} anche nel menu dei tre puntini.
- [~] **Il pulsante dei servizi**, sotto la barra in alto, dove resta mentre l’elenco scorre, quando in Moduli sono attive due parti con messaggi, dice quale parte
  dell’elenco si vede (**Tutti i servizi**, o quella scelta), con i segni dei servizi, i messaggi non letti di tutti
  e, in rosso, un servizio che ora non è connesso. Toccalo per la finestra **Servizi**: una scheda per ogni parte
  attiva, anche senza chat, ognuna con i suoi messaggi non letti (99+ oltre 99) e un punto, verde finché la sua rete è
  connessa, rosso con **Offline** quando non lo è. Una scheda mostra solo quella parte: **Tutti** tutte le chat,
  **SMS** solo gli SMS (con le chat il cui ultimo messaggio era un SMS; lì si dice se Erevos non è ancora l’app degli
  SMS), **Erevos** solo le chat di Erevos, quelle di ogni contatto, qualunque cosa sia arrivata per ultima{+, e
  **Matrix**, **XMPP**, **Pubblico** e **Nostr** le loro}. **Aggiungi** apre Moduli, per attivarne altri, e **Segna
  tutto come letto** legge la parte mostrata. Tieni premuta una scheda per spostarla prima o dopo o per nasconderla
  con **Nascondi**: un servizio nascosto resta attivo, ma non avvisa e non conta nel numero sull’icona
  (Telegram, le cui cartelle possono stare in home, sì), e le sue chat escono anche da **Tutti**
  (la ricerca le trova ancora), e aspetta in fondo alla finestra, dove un tocco lo mostra di nuovo. Ogni scheda tenuta premuta, anche **Tutti**, può
  diventare **Si apre per prima**: Erevos si apre lì dalla sua icona, e su **Tutti** finché non ne scegli nessuna. Le chat e i gruppi
  in **In silenzio** non contano, come nel numero sull’icona di Erevos, e ciò che scrivi nella ricerca non cambia i
  numeri. Sotto il pulsante, senza ricerca, vengono prima le chat con messaggi non letti, sotto **Non letti**, con
  **Segna tutto come letto** accanto, poi le altre sotto **Recenti**.
- **Il widget**, su Android: aggiungi Erevos dai widget della schermata Home. {~I suoi quattro pulsanti aprono
  **Telefono**, gli **SMS**, i **Messaggi** di Erevos e **Contatti**, dopo la password come qualsiasi link (il Telefono
  senza, se lo permetti). Sopra i primi tre mostra quante chiamate perse, SMS non letti e nuovi messaggi ci sono, mai
  chi o cosa; con chiamate perse, **Telefono** si apre su **Recenti**.|I suoi due pulsanti aprono i **Messaggi** di Erevos e
  **Contatti**, dopo la password come qualsiasi link. Sopra **Messaggi** mostra quanti nuovi messaggi ci sono, mai
  chi o cosa.} Un pulsante toccato di nuovo mostra di nuovo la
  sua schermata, anche dopo che lì hai scelto un’altra scheda. Le sue parole seguono la lingua di Erevos.
  **Impostazioni** → **Aspetto** → **Widget** imposta l’ordine dei suoi pulsanti.
- **Il lucchetto arancione** in alto blocca subito Erevos quando è impostata una password, o apre le impostazioni del
  blocco se non lo è.
- **I tre puntini** aprono il resto:

| Nel menu | Cosa apre |
| --- | --- |
| **Nuovo gruppo** | Una chat di gruppo con i tuoi contatti. Vedi [Chat di gruppo](#groups). |
| **Gruppi pubblici** | Un gruppo in cui chiunque abbia il suo link può chiedere di entrare, con un proprietario e degli admin. Vedi [Gruppi pubblici](#public-groups). |
| **Messaggi importanti** | I messaggi che hai segnato come importanti, in tutte le tue chat. Vedi Il menu di un messaggio, in Chat tramite un relay. |
| **Telefoni vicini** | I tuoi contatti via Bluetooth e Wi-Fi Aware, o sulla stessa rete Wi-Fi, senza internet. Vedi [Chat con un telefono vicino](#nearby). |
| **Guida** | Questa guida. |
| **Impostazioni** | L’ultima riga, con un ingranaggio: tutto quello che puoi impostare, in gruppi, con una ricerca. Vedi Impostazioni più sotto. |

Dentro una chat, in alto ci sono il suo nome e la sua immagine, con il modo in cui viaggia: **Crittografato**
(end-to-end), **Online**, **Vicino** mentre il suo telefono è collegato al tuo via radio, o **sta scrivendo…**, con un
cronometro quando i messaggi della chat scompaiono. Accanto, il riquadro blu con una videocamera avvia una
videochiamata e quello verde con una cornetta una chiamata vocale. Tocca il nome, o **⋯** dopo di loro (**⋮** su
Android), per i **Dettagli** della chat: la sua immagine (toccala per cambiarla), **Chiama**, **Video**, **Rinomina** e
**Immagine**, poi **Messaggi effimeri**, **Blocca gli screenshot**, **Mostrati offline**, **Aspetto della chat**, il **Codice di sicurezza**,
**Sposta nelle chat nascoste**, **Sposta in un altro spazio** ed **Elimina messaggi**. **Fatto** li chiude.

**Media, link e file**, nei dettagli sotto **Cerca in questa chat**, elenca quello che contiene la chat, ogni tipo
nella sua scheda con quanti ce ne sono: **Foto** (in una griglia), **Video**, **Messaggi vocali**, **Musica**, **File**
e **Link**, i più recenti per primi sotto i loro mesi, anche quelli importati da Telegram o WhatsApp. Un tocco apre una
foto o un file da guardare o salvare, riproduce un suono lì stesso, o apre un link dopo averlo chiesto; tenuto premuto,
ognuno offre **Mostra nella chat**, che va al suo messaggio. Per uno non ancora preso dal relay si va al suo punto nella
chat, dove un tocco lo prende. Il calendario in alto va a un giorno: i giorni che hanno qualcosa di quel tipo sono
segnati. **Vai a un giorno**, sotto nei dettagli, fa lo stesso per la chat stessa: va al primo messaggio di quel
giorno.

**Perché:** gli elenchi sono fatti su questo telefono da quello che conserva già, così nessun server sa che cosa
contiene una chat; e vengono lette solo le foto sullo schermo, come nella chat, così una chat con migliaia di foto si
apre veloce come una che non ne ha.

[~] **Anche {+su Matrix, XMPP, Nostr e }negli SMS:** {+una chat su Matrix, XMPP o Nostr ha in fondo **Cerca in questa chat**,
**Media, link e file**, **Vai a un giorno** ed **Esporta chat**, accanto a **Notifiche**, e }una conversazione SMS {-ha **Cerca in questa chat**, **Media, link e file**, **Vai a un giorno** ed **Esporta chat** }{+li
ha }per primi nel suo **⋮**. Guardano solo ciò che questo telefono conserva della chat: {+i messaggi che una chat Matrix
conserva (sotto la ricerca, **Carica i messaggi precedenti** ne prende di più vecchi dal suo server, come fa la cima
della chat), quelli di una chat XMPP o Nostr, e }ogni SMS e MMS della conversazione sul telefono; andare a un SMS più
vecchio carica la conversazione fino a lì. Niente di ciò che scrivi nella ricerca lascia il telefono. Foto e file sono
elencati, e un tocco porta a ciascuno nella chat, dove un tocco lo prende dal suo server come prima, così nessun
server sa quali hai guardato; le immagini di un MMS si vedono nell’elenco stesso. **Esporta chat** scrive la chat come
per un contatto, dopo la stessa domanda; le chat di un luogo nascosto non si esportano.

Una buona prima ora:

1. Apri **Impostazioni** → **Privacy e sicurezza** → **Blocco e seconda password** e imposta una password, così nessuno
   che prenda in mano il telefono può aprire Erevos.
2. Apri **Telefoni vicini** dal menu su due telefoni vicini tra loro, e consenti quello che chiede Android.
3. Aggiungetevi a vicenda con **Mostra il mio codice QR**, come in [Chat con un telefono vicino](#nearby), e invia un
   messaggio: va da vicino, crittografato end-to-end, senza relay e senza internet.
4. Per parlare da più lontano, imposta un relay come in [Chat tramite un relay](#relay).

### Chat con me stesso e promemoria

**Chat con me stesso** è sempre in cima alle chat, con una puntina, in ogni spazio. È una chat senza nessun altro
dentro: scrivi a te stesso note, link, foto, file e messaggi vocali, come in qualsiasi chat. Non va a nessun altro:
resta crittografata nello spazio, e va solo ai tuoi dispositivi collegati, crittografata end-to-end, così che ognuno
abbia le stesse note e gli stessi promemoria (vedi [Dispositivi collegati](#devices)). Un backup la prende tutta, note,
foto, file e messaggi vocali, come per le chat.

- **Un promemoria:** tocca **Ricordamelo** (la campanella arancione accanto a **Nuova chat**), scrivi di che cosa
  ricordarti, scegli un’ora (**Tra 1 ora**, **Stasera 20:00**, **Domani 09:00**, o qualsiasi giorno, ora e minuto) e
  tocca **Ricordamelo**. Va nella Chat con me stesso, con una campanella e la sua ora. Nella chat, **+** →
  **Ricordamelo**, o tenere premuta la freccia di invio, dà un’ora anche alla nota che scrivi.
- **All’ora stabilita**, su Android, il telefono mostra una notifica, **Reminder** (o **3 reminders**) – «Open Chat
  with myself to read it», mai quello che dice, anche con Erevos chiuso e bloccato; se la tocchi, apre la Chat con me
  stesso, dopo la password. Finché non apri la chat, il promemoria appare sulla sua riga in cima alle chat, con un
  conteggio, e nella chat con un bordo colorato; visto lì, se ne va anche dalla notifica. Su un computer, nella web
  app, o con le notifiche disattivate, è lì che lo vedi. Se **Orari esatti** non è consentito (**Impostazioni** →
  **Generali** → **Autorizzazioni**), Android può mostrarlo con qualche minuto di ritardo.
- **Tenendo premuta una nota** hai **Copia**, **Apri** (una foto o un file), **Ricordamelo**, oppure **Cambia il
  promemoria** e **Nessun promemoria**, **Sposta in una cartella** ed **Elimina**.
- **Cartelle:** il pulsante cartella in alto, accanto a **Aspetto della chat**, ne crea una. Sopra le note compaiono
  allora delle schede: **Tutte**, e una per ogni cartella, che mostra solo ciò che contiene; ciò che scrivi, invii o
  registri mentre una cartella è scelta ci finisce dentro. Una nota sta al massimo in una cartella: **Sposta in una
  cartella** la mette in un’altra, in una nuova o in **Senza cartella**. Tenendo premuta la scheda di una cartella, o
  toccandola di nuovo, hai **Rinomina la cartella** e **Elimina la cartella**; le sue note restano, senza cartella.
  Una nota va ai tuoi dispositivi collegati con la sua cartella, e una cartella rinominata o eliminata su uno lo è
  anche sugli altri; una vuota resta sul dispositivo dove è stata creata.
- Ogni spazio ha una sua Chat con me stesso, e così anche ogni posto di chat nascoste, in cima al loro elenco (vedi
  [Chat nascoste](#hidden)). I promemoria di un posto nascosto appaiono lì quando il suo PIN lo apre; il telefono li
  annuncia alla loro ora solo mentre **Ricevere da chiuse** è attivo per quel posto, nella stessa notifica. Un nuovo
  PIN per il posto, che lo fa ripartire vuoto, o la rimozione del posto tolgono i suoi promemoria dal telefono. Le
  note di un posto nascosto vanno solo ai dispositivi collegati a quel posto per conto suo, mai a quelli dello spazio
  (vedi [Dispositivi collegati](#devices)).
- **Da un’altra app:** un’app del telefono può chiedere di tenere qui una nota, come Fasouli per un pagamento in
  arrivo, con il suo promemoria. Erevos apre Chat con me stesso dopo la password, nello spazio che apri, e chiede prima
  **Tenere questa nota?**, con il testo e l’ora; solo **Aggiungi** la tiene. Niente torna all’app. Per un pagamento programmato il promemoria torna, ogni mese o come si ripete il pagamento: appena lo vedi, passa alla volta successiva.

**Perché:** una notifica appare sullo schermo bloccato a chiunque abbia in mano il telefono, quindi quello che dice un
promemoria resta crittografato nel suo spazio e ad Android viene detta solo la sua ora: la notifica non può dire a
nessuno che cosa volevi ricordare, né in quale spazio si trova. E le note non vanno a nessuno tranne ai tuoi
dispositivi, crittografate end-to-end tra loro come le tue chat: il relay le trasporta solo crittografate.

- [~] **Da altre chat:** un messaggio di una {+chat Matrix, XMPP, Nostr o SMS}{-conversazione SMS} può venire anche qui, con un promemoria:
  **Ricordamelo** nel suo menu.

### Spostarsi con gli scorrimenti

- **Indietro:** scorri verso destra in qualsiasi punto di una schermata per tornare indietro, come fa la freccia
  indietro. Da sinistra esce una freccia rotonda; lascia quando è completa, o fai un colpo rapido, e sei tornato
  indietro. Se lasci prima, resti dove sei. In una chat fa quello che fa la sua freccia indietro: torna all’elenco delle
  chat, o esce dalle chat nascoste, chiudendole. Nei **Dettagli** di una chat li chiude.
- **Schede:** scorri verso sinistra o verso destra per andare alla scheda accanto, come quando tocchi la sua
  etichetta:{~ **Tutti**, **SMS**}{+,}{-{~ e}}{~ **Erevos**}{+, **Matrix**, **XMPP** e **Nostr**}{~ nella schermata principale (quelli
  attivi in Moduli), **Tastierino**, **Recenti** e **Preferiti** in **Telefono**,} i filtri in **Contatti**, e le serie
  di sticker.{~ Nella schermata principale le parti si scelgono nella finestra **Servizi**, con il pulsante sotto la
  barra in alto.}
- In una schermata con schede, uno scorrimento cambia solo la scheda, anche sulle righe del suo elenco, e oltre la
  prima o l’ultima scheda non fa nulla: torna indietro con la freccia indietro.{~ Una conversazione SMS si archivia o si
  elimina tenendola premuta.}

### Impostazioni

**Impostazioni**, l’ultima riga del menu (i tre puntini), contiene tutto quello che puoi impostare in Erevos, in
gruppi, come fanno le impostazioni di un telefono. Nelle lingue diverse dall’inglese ha il nome in quella lingua e in
inglese, come **Impostazioni · Settings**, così la trovi anche in una lingua che non sai leggere.

- **Cerca nelle impostazioni,** in alto, trova un’impostazione dall’inizio delle sue parole, con o senza accenti, e
  mostra dove si trova, come {~**Telefono e SMS › SMS**|**Privacy e sicurezza › Chat nascoste**}. Toccala per aprirla.
- **Lingua · Language,** la riga sotto la ricerca, apre l’elenco delle lingue, vedi Lingua più sotto.
- **Un gruppo** apre l’elenco delle sue impostazioni, e un’impostazione apre la sua schermata. Un’impostazione con
  parti, come {~**SMS**|**Backup**}, le elenca, e ogni parte si apre da sola.
- **Si vede solo ciò che funziona qui:** su un computer, su Sailfish OS e nella web app non ci sono {~**Telefono e SMS**,
  |}Tor, Nostr o LoRa, e un gruppo senza niente da impostare qui non appare.
- [~] **Solo i moduli attivi:** anche le impostazioni di un modulo disattivato, come {+**Matrix** o }**Telefono e SMS**,
  non appaiono: vedi [Moduli](#modules).

| Gruppo | Cosa contiene |
| --- | --- |
| **Generali** | **Lingua**, {~**Moduli**, |}**Aggiornamenti**, **Dai Erevos a un telefono vicino** (Android), **Novità**, **Informazioni su Erevos**, **Sostieni Erevos** e **Autorizzazioni** (Android e la web app). Vedi Lingua più sotto, {~[Moduli](#modules), |}[Aggiornamenti](#updates) e [Erevos a un telefono vicino](#give-app). |
| **Aspetto** | **Stile e colori** (finitura, vetro, stile, tema, colori e testo sulle aree colorate, con l’anteprima), **Sfondo**, **Messaggi** (la forma delle nuvolette), **Icone del launcher** (Android), **Widget** (Android) e **Vibrazione al tocco** (Android). Vedi [Aspetto](#appearance). |
| **Notifiche** | **In background** (Android e l’app per computer): ricevere e squillare mentre Erevos è chiuso, e l’avviso dei messaggi; su un computer, se Erevos continua a funzionare con la finestra chiusa. **Notifiche ad app chiusa** (la web app): Web Push. **Numero sull’icona**: quanti messaggi non sono stati letti, sull’icona di Erevos. Vedi [Su iPhone](#iphone) e [Su un computer](#desktop). |
| **Privacy e sicurezza** | **Blocco e seconda password** (blocco all’apertura di Erevos, la password, la privacy dello schermo, impronta o volto, la seconda password), **Chat nascoste** (i PIN dei 4 posti), **Pulsante di panico** (con la password di panico), **Calcolatrice al posto di Erevos** (Android, in Aspetto), **Screenshot** (Android) e **Questa web app** (solo la web app). Vedi [Blocco con password](#lock), [Seconda password](#second), [Chat nascoste](#hidden) e [Pulsante di panico](#panic). Vedi anche [Cancellami da ovunque](#forget). |
| **Relay e reti** | **Vie**, **Relay** (apre **Nuova chat** con **Per utenti esperti** aperto), **Relay di casa**, **Tor** (Android), **Nostr** (Android){+,}{- e} **Radio LoRa** (Android){+, **Matrix**, **XMPP** e **Chat Nostr**}. Vedi [Chat tramite un relay](#relay), [Relay di casa](#home-relay), [Tramite Tor](#tor), [Tramite Nostr](#nostr){+,}{- e} [Con una radio LoRa](#lora){+, [Matrix](#matrix), [XMPP](#xmpp) e [Chat con altre app Nostr](#nostr-chats)}. |
[~] | **Telefono e SMS** (Android) | **Telefono**, le impostazioni dell’app Telefono, le stesse di **Telefono** → **Impostazioni**. **SMS**, in parti: **Erevos come app per gli SMS**, **Scopri Erevos dietro un numero**, **SMS quando nient’altro funziona**, **Nomi dai tuoi contatti**, **Archiviate, Spam e Cestino**, **Filtro antispam**, **Numeri bloccati**, **Annullare l’invio di un SMS**, **Due SIM** (solo con due SIM) e **Nuovo SMS**. Vedi [Telefono](#phone) e [SMS](#sms). |
| **Dati e dispositivi** | **Backup**, **Pezzi del backup**, **Dispositivi collegati** e **Chat importate**. Vedi [Backup](#backup), [Pezzi del backup presso amici](#backup-pieces), [Dispositivi collegati](#devices) e [Chat importate](#import). |
| **Per i test** | **Test del relay** e **Test radio** (Android). Vedi [Le schermate di test](#tests). |

### Lingua

Erevos è in inglese, greco, tedesco, francese, spagnolo, italiano, portoghese e serbo-croato. La prima volta che si
avvia, segue la lingua del telefono se è una di queste (un telefono in serbo, croato, bosniaco o montenegrino parte in
serbo-croato), altrimenti è in inglese. Per cambiarla, apri il menu (i tre puntini), tocca **Impostazioni**, la sua
ultima riga, e poi la prima riga lì, **Lingua · Language**. Nelle lingue diverse dall’inglese entrambe hanno il nome in
quella lingua e in inglese, come **Impostazioni · Settings** e **Lingua · Language**. Poi tocca la lingua, ognuna
chiamata con le sue parole: **Ελληνικά**, **English**,
**Deutsch**, **Español**, **Français**, **Italiano**, **Português** o **Srpskohrvatski**. Tutta l’app cambia
subito.

- **Questa guida** è anche lei in ciascuna di queste lingue, e chiama i pulsanti come li mostra l’app nella tua. Nelle
  lingue diverse dall’inglese e dal greco, una parola nuova nell’app può apparire in inglese per un po’, finché non
  viene tradotta.
- **Salvata sul telefono:** la scelta è salvata su questo telefono, fuori da ogni spazio, quindi anche la schermata
  della password appare in quella lingua, e ogni spazio si apre in quella lingua. Non è sigillata: chi ha in mano il
  telefono può vedere quale lingua hai scelto.
- **Gli avvisi di Android** (una chiamata in arrivo, nuovi messaggi, Erevos che riceve in background) sono in greco
  quando lo è Erevos, e in inglese in tutte le altre lingue.

## Moduli {#modules}

Erevos è fatto di parti, i suoi moduli: **Erevos** stesso (le sue chat, i suoi gruppi e le sue chiamate,
crittografati end-to-end, con le chat nascoste), il **Telefono**{- e}{+,} gli **SMS**{+, le chat con app **Nostr**, **Matrix** e
**XMPP**, e **Telegram**, **Messenger**, **Signal** e **Session**}. La **Raccolta** (le tue foto e i tuoi file, cifrati) è anch’essa un modulo. Il Telefono e gli SMS ci sono solo su Android, la Raccolta su Android, nell’app per computer, nella web app e su Sailfish OS. Uno qualsiasi può essere attivo, anche Erevos stesso, uno o
più, almeno uno: **Impostazioni** → **Generali** → **Moduli** attiva o disattiva ciascuno in qualsiasi momento.

La primissima volta che si avvia, Erevos si configura come fa un installer. Prima che si apra il suo primo spazio: ciò
che non dai (né numero di telefono, né e-mail, né nome utente, né account: aggiungi persone con un codice QR o un link,
oppure ti invitano loro), un nome per i tuoi contatti se lo vuoi, e la lingua; poi quali moduli usare, ciascuno con ciò
che fa. Poi, nello spazio: una schermata per ogni modulo scelto, con come iniziare (per Erevos, come entri; per il
Telefono e gli SMS, Erevos come app Telefono e come app SMS{+; per Nostr, Matrix e XMPP, il tuo account lì}) e ciò che
Android, o il browser, deve consentire per esso. Ogni autorizzazione è nella prima schermata che ne ha bisogno, e
**Consenti tutto, uno per uno** pone le domande che Android pone, nello stesso Erevos, una dopo l’altra. Poi il blocco
con password e i backup automatici, poi ciò che è pronto e ciò che manca, con **Invita qualcuno**. **Il resto più
tardi** lascia il resto alle Impostazioni; finché non finisci o rimandi, i passi ricompaiono all’avvio di Erevos. Aperto
con un invito, Erevos lo mostra a passi finiti. Dopo un aggiornamento ogni modulo resta attivo, come prima, finché non
lo cambi.

- **Il nome:** non è un nome utente: nessuno lo cerca, e non deve essere unico. Va, cifrato, solo a chi aggiungi, e **Il
  mio nome** sotto Impostazioni → Privacy e sicurezza lo cambia.
- **Passare da un altro telefono:** su Android, **Ho già {=Erevos} su un altro telefono** salta il nome e i moduli, che
  arrivano con il backup. Lo spazio si apre, **Apri Backup** lo ripristina (vedi [Passare a un nuovo
  telefono](#new-phone)), e seguono le schermate dei moduli che porta, poi l’impronta e la cartella dei backup
  automatici, che restano con ogni telefono. **Non ho ancora un backup** dice come farne uno.
- **Su un computer o in un browser:** **Collega al mio telefono** salta i passi e apre **Dispositivi collegati**.

- **Disattivato:** un modulo disattivato non si avvia: niente di esso funziona, aspetta su un server o squilla, quindi
  Erevos è più leggero, si apre più in fretta e consuma meno batteria. Non compare da nessuna parte: non nella schermata
  principale, nel suo menu o nelle impostazioni, e le icone del Telefono e degli SMS escono dalle app del telefono. Un
  link, una notifica o il widget che ancora portano a esso dicono che è disattivato, con **Apri Moduli**.
- **Non si cancella nulla:** le sue chat, i contatti, gli account e le impostazioni tornano quando viene riattivato. I
  contatti, il blocco con password, gli spazi, i backup e le Impostazioni ci sono sempre, qualunque cosa sia attiva.
- **Di nuovo attivo:** un modulo attivato parte subito, e **Autorizzazioni** mostra ciò che Android deve consentire per
  esso, come al primo avvio.
- **Nuovo con un aggiornamento:** un modulo che arriva con un aggiornamento, come la Raccolta con la 7, è attivo, anche
  dove hai scelto i moduli prima che arrivasse, finché non lo disattivi.
- **Il Telefono o gli SMS disattivati** mentre Erevos è ancora l’app Telefono o l’app SMS: Android continua a dare a
  Erevos le chiamate o gli SMS, conservati come prima. **Apri App predefinite** sceglie un’altra app.
- **Il Telefono da solo:** senza nessun modulo che porti messaggi, la schermata principale lo dice, con **Telefono** e
  **Moduli**.
- **Conservato sul telefono:** la scelta vale per questo telefono, uguale in ogni spazio, ed è conservata fuori dagli
  spazi, come le icone, perché il Telefono può aprirsi senza la password.

**Perché:** non tutti vogliono tutto. Chi usa {=Erevos} solo come telefono, o solo per Nostr, ottiene un’app che fa solo
quello, e un telefono che non aspetta in background messaggi che non arrivano mai.

## Chat con un telefono vicino {#nearby}

Mentre uno spazio è aperto, su qualsiasi schermata, Erevos cerca altri telefoni con {=Erevos} intorno a sé, via Bluetooth
e, dove il telefono ce l’ha, Wi-Fi Aware, e sulla rete Wi-Fi a cui è collegato, telefoni e computer allo stesso modo.
Non servono internet, SIM o una rete Wi-Fi. Porta i messaggi ai tuoi contatti, crittografati end-to-end come quelli
tramite il relay.

Cerca solo quando **Cerca telefoni vicini** è attivo, in **Vicino, senza internet**, in **Nuova chat**: è spento
finché non lo attivi, su entrambi i telefoni, e fino ad allora tutto passa dal relay.

1. Apri **Telefoni vicini** dal menu su entrambi i telefoni. La prima volta, Android chiede di trovare i dispositivi
   vicini (su Android 12 e precedenti, anche per la posizione); consentilo, o i telefoni non possono trovarsi.
2. Se non siete ancora contatti, aggiungetevi a vicenda: su un telefono tocca **Nuova chat**, dove si vede **Il tuo
   codice QR**, e scansionalo con l’altro, come in [Chat tramite un relay](#relay). Senza un relay il codice contiene
   solo le tue chiavi, e vi raggiungete solo da vicino, finché non ne avete uno.
3. Scegli il contatto, scrivi nella barra dei messaggi in basso e tocca la freccia di invio. Appena il suo telefono
   risponde, in cima alla chat c’è scritto **Vicino**.

- **Mentre uno spazio è aperto:** i collegamenti partono quando si apre uno spazio, qualunque schermata sia visibile, e
  si fermano quando si apre un altro spazio: se è bloccato, lo spazio continua dietro la schermata della password. Un
  messaggio da vicino appare nella schermata principale come uno arrivato tramite il relay, e anche una chiamata squilla
  lì. Su Android restano attivi con Erevos in background, mentre **In background** è su **Ricevi e squilla**. Per
  risparmiare la batteria, in quel caso cerca i telefoni meno spesso: Wi-Fi Direct ogni dieci minuti, Wi-Fi Aware un
  minuto ogni cinque, e sulla stessa rete Wi-Fi ascolta gli altri venti secondi ogni due minuti. Così un telefono
  vicino può essere trovato qualche minuto dopo; i collegamenti già attivi restano attivi, e appena Erevos è visibile
  cerca con la stessa frequenza di prima.
- **Portata:** qualche decina di metri all’aperto, meno attraverso i muri.
- **Wi-Fi Aware:** più veloce, ma non tutti i telefoni ce l’hanno. Il Bluetooth funziona su tutti. Per fermarlo,
  disattiva **Cerca con Wi-Fi Aware**, sopra **Trova Erevos sulla stessa rete Wi-Fi**.
- **La stessa rete Wi-Fi o un hotspot:** i telefoni su una stessa rete Wi-Fi, o sull’hotspot di un telefono, si
  trovano e si parlano direttamente, anche quando quella rete Wi-Fi non ha internet; anche l’app desktop. Se Android
  chiede se restare su una rete Wi-Fi senza internet, resta. Chiunque sia su quella rete Wi-Fi può capire che lì c’è
  un’app Erevos, non di chi. Il firewall di un computer deve lasciar entrare la porta 47905 (UDP e TCP). Per fermarlo,
  disattiva **Trova Erevos sulla stessa rete Wi-Fi** sotto **Vicino, senza internet**, in **Nuova chat**.
- **Una rete Wi-Fi tutta loro (Android 10 e successivi):** senza una rete Wi-Fi in comune, due telefoni con {=Erevos}
  vicini creano una piccola rete Wi-Fi tutta loro (Wi-Fi Direct) e si parlano attraverso di essa come sulla stessa
  rete Wi-Fi: più veloce del Bluetooth, e una chiamata ci passa senza internet. Non chiede nulla; dove può, ogni
  telefono resta anche sulla sua rete Wi-Fi. Chiunque sia vicino può capire che lì c’è un telefono con {=Erevos}, e
  potrebbe entrare in quella piccola rete Wi-Fi, ricevendo solo byte sigillati. Richiede **Trova Erevos sulla stessa
  rete Wi-Fi** attivo; per fermare solo questo, disattiva **Crea una rete Wi-Fi con i telefoni vicini** sotto.
- **Su un telefono Samsung** **Cerca con Wi-Fi Aware** e **Crea una rete Wi-Fi con i telefoni vicini** sono
  disattivati finché non li attivi: mentre un’app li usa, Samsung chiede di disattivare la sua condivisione. Il
  Bluetooth e la stessa rete Wi-Fi funzionano anche senza.
- **Gli altri telefoni vicini** ricevono solo byte sigillati che non possono aprire, e solo finché il telefono del tuo
  contatto non è noto: da quel momento quello che invii va solo a lui. I messaggi vocali vanno solo a un contatto che
  si sa essere vicino. Foto e file richiedono il relay.
- **Con anche un relay,** ogni messaggio passa anche da lì, così niente va perso se il collegamento cade; la copia che
  arriva per seconda non viene mostrata di nuovo. Se il relay non è raggiungibile, conta la copia arrivata da vicino.
- **Trasportati da altri telefoni:** quando il relay non è raggiungibile e il tuo contatto non è vicino, anche i
  telefoni con {=Erevos} vicini prendono il tuo messaggio sigillato per il relay del tuo contatto. Ognuno lo conserva, al
  massimo tre giorni, lo dà al massimo ad altri due telefoni che incontra, e lo consegna a quel relay tramite il
  proprio relay appena può; lo stesso fa il tuo. Non possono leggerlo, né capire da chi viene o per chi è: vedono solo
  l’indirizzo del relay. Resta anche quando Erevos si chiude, sigillato sul telefono. I tuoi restano nel tuo spazio, e
  partono solo mentre è aperto. Il trasporto per altri è attivo finché non disattivi **Trasporta messaggi per altri**
  sotto **Vicino, senza internet**, in **Nuova chat**, e solo per relay su internet tramite TLS (wss://):
  uno sconosciuto vicino non fa mai raggiungere al tuo telefono, o al tuo relay, uno su una rete locale o sul telefono
  stesso. I tuoi messaggi vengono trasportati dai telefoni vicini che lo hanno attivo.
- **Portati da altri telefoni:** al contrario, quando il tuo telefono non ha internet, un telefono con {=Erevos} accanto
  che ha internet, e trasporta per gli altri, prende ciò che ti aspetta sul tuo relay e te lo dà da vicino. Erevos
  chiede una volta per ogni telefono così, anche per quello di un contatto, perché uno sconosciuto può passare i
  messaggi di un contatto per sembrare lui, e solo mentre è in primo piano: **Un telefono vicino a te ha internet.
  Deve portarti i tuoi messaggi?** Quel telefono sa quale coda del tuo relay è la tua e quando la leggi; mai cosa
  dicono i tuoi messaggi, che apre solo il tuo telefono. Conoscendo la coda, potrebbe prendere i tuoi messaggi prima
  che ti arrivino, quindi appena il tuo telefono ha di nuovo internet passa da solo a una nuova coda e lo dice in
  silenzio ai tuoi contatti. Per le chat nascoste chiede a parte, e solo mentre sono sullo schermo, perché quel
  telefono saprebbe che c’è una seconda coda, e quindi che possono esserci chat nascoste. Mai per un relay raggiunto
  solo tramite Tor. Il tuo telefono fa lo stesso per i telefoni accanto finché **Trasporta messaggi per altri** è
  attivo, mai finché passa da Tor, e da un relay diverso dal suo solo dopo il tuo sì, avvisato che quel relay vede
  allora l’indirizzo internet del tuo telefono.

**Perché:** un pacchetto non dice per chi è, quindi nessuno vicino può capire da esso di chi sia. Finché il telefono
del tuo contatto non risponde su un collegamento, nemmeno il tuo telefono può capire quale dei telefoni vicini sia il
suo: così i pacchetti brevi vanno a tutti, ognuno li prova, e dal primo che si apre, quel collegamento è del tuo
contatto. Un messaggio vocale, in pezzi più grandi, aspetta questo momento.

> Un messaggio da vicino si apre solo nello spazio che ha quel contatto. Uno per un altro spazio di questo telefono
> aspetta in memoria, al massimo sei ore, finché quello spazio non si apre. Uno per le chat nascoste si apre
> solo mentre sono aperte, o ricevono da chiuse, e fino ad allora aspetta allo stesso modo.

**Perché:** i collegamenti da vicino appartengono al telefono, non a uno spazio, e niente in essi ne nomina uno: quello
che arriva viene provato nelle chat dello spazio aperto, e conservato per un po’ in memoria per gli altri, mai scritto
sul telefono. Le chat nascoste li usano
anche loro, ma quello che sentono è loro: il collegamento su cui si è sentito un contatto nascosto è tenuto a parte da
quello dello spazio, solo in memoria e solo mentre quelle chat nascoste sono aperte o ricevono da chiuse, così lo spazio
non sa mai che uno dei loro contatti è vicino; e nell’aria i loro messaggi sembrano quelli dello spazio. Non portano mai
messaggi di altri, non vengono mai portate da altri, e non passano mai via LoRa{~ né via SMS}.

**Bluetooth che non si può seguire:** ciò che il tuo telefono trasmette via Bluetooth perché altri lo trovino dice
solo che vicino c’è un telefono con {=Erevos}, con un numero casuale che cambia ogni nove-dodici minuti, e da Android 8 in
poi da un indirizzo che cambia con esso. Così chi ascolta in un posto e poi in un altro non può capire che è lo stesso
telefono, almeno da Erevos. I collegamenti aperti restano aperti. I telefoni con un {=Erevos} più vecchio trovano il tuo,
e il tuo loro, come prima.

## Con una radio LoRa {#lora}

Con una radio LoRa Meshtastic collegata al telefono via Bluetooth, Erevos raggiunge un altro Erevos con una radio sulla
stessa mesh, a chilometri di distanza, senza internet: direttamente, o attraverso le radio Meshtastic che stanno in
mezzo. È disattivato finché non imposti una radio, e solo su Android.

1. Prima configura la radio nell’app Meshtastic, soprattutto la sua **regione**: senza, non trasmette nulla. Poi
   chiudi l’app Meshtastic, o scollegala da lì: una radio si collega a un’app alla volta.
2. Apri **Impostazioni** → **Relay e reti** → **Radio LoRa**, tocca **Trova la mia radio**, leggi quello che dice, e
   tocca la tua radio quando appare. Una radio non ancora associata chiede il suo PIN: appare sullo schermo della radio,
   oppure è 123456.
3. Il tuo contatto fa lo stesso con la sua, sulla stessa mesh: la stessa regione e lo stesso primo canale.
4. Scrivi come sempre. Quando il relay non è raggiungibile e nessun telefono è vicino, un testo va via LoRa,
   e la riga sotto la chat lo dice.

- **Solo testo, e lentamente:** un messaggio va in pezzi di circa 220 byte, ognuno un secondo o due in onda, e la legge
  concede a una radio solo un certo tempo di trasmissione (nell’UE, un decimo di ogni ora). Così LoRa trasmette solo
  testi ed eliminazioni, e solo quando nient’altro lo fa. I messaggi vocali, le foto e i file aspettano nella chat,
  segnati **In attesa**, e partono da soli appena il relay o un telefono vicino può riceverli; anche le chiamate hanno
  bisogno di uno dei due. Il primo messaggio a un contatto ci mette di più, perché contiene le chiavi.
- **Segni:** **✓✓** arriva con il suo messaggio successivo, perché i segni da soli non vanno via LoRa.
- **Pezzi di scorta, e testi lunghi compressi:** un messaggio di due pezzi o più parte con pezzi di scorta dopo,
  uno ogni quattro, così l’Erevos del tuo contatto ricostruisce i pezzi persi per strada, senza rimandare nulla;
  occupano un po’ più di tempo in onda. Un testo lungo parte compresso, più piccolo e senza perdere nulla, verso un
  contatto il cui Erevos legge i messaggi compressi, così prende meno pezzi, o ci sta proprio; uno corto parte com’è.
- **A tutte le radio a portata:** ogni messaggio viene sentito da tutte le radio intorno, e ritrasmesso dalle radio
  Meshtastic, come fa Meshtastic. Ogni Erevos lo prova; solo quello del tuo contatto lo apre. Via LoRa non si trasporta
  niente per altri.
- **Il suo nome e dove si trova:** le radio Meshtastic annunciano ogni tanto il loro nome a tutte le radio a portata, e
  dove si trovano se hanno il GPS o una posizione fissa, in chiaro. Erevos impedisce alla tua di farlo (**Tenuti
  nascosti**): imposta il suo ruolo su Client hidden, spegne il suo GPS e toglie una posizione fissa. Risponde comunque
  a una radio che chiede il suo nome, quindi dalle un nome che non dica niente di te, nell’app Meshtastic.
  **Annunciati a tutti quelli a portata** rimette il suo ruolo e il GPS, dopo un avviso; una posizione fissa si
  reimposta nell’app Meshtastic. Se la radio non mantiene le impostazioni, la schermata LoRa lo dice.
- **Resta collegata** mentre Erevos è in funzione, e si ricollega da sola quando la radio torna a portata. **Disattiva
  LoRa** restituisce alla radio il suo ruolo e il GPS, se è collegata, poi la scollega e la dimentica. Le chat nascoste
  non passano mai via LoRa.

**Perché:** quello che una radio Meshtastic dice di sé va in chiaro, a chiunque ascolti a chilometri di distanza: il
suo nome e dove si trova potrebbero mostrare dove sei e collegare la radio a te, quindi Erevos la tiene in silenzio a
meno che tu non scelga altrimenti. E poiché la legge concede a una radio solo un certo tempo di trasmissione, LoRa è
riservata ai tuoi testi, quando nient’altro può trasmetterli, mai a quello che altri telefoni le farebbero trasportare.

> Una radio LoRa si sente a chilometri di distanza, e il suo segnale può essere seguito fino a dove si trova, che sia
> in silenzio o no. Quello che Erevos invia resta crittografato end-to-end, ma chiunque abbia una radio può capire che
> la tua trasmette, quando e quanto. Con **Annunciati a tutti quelli a portata**, chiunque abbia una radio può anche
> leggere il suo nome e dove si trova.

## Chat tramite un relay {#relay}

Un relay è un piccolo server che tiene code a senso unico: ogni telefono ha la sua coda, e chiunque abbia il suo **link
di contatto** può lasciarvi dei messaggi. Il relay non ha account, nomi o numeri di telefono, e non può leggere i
messaggi: sono crittografati end-to-end, e solo i due telefoni hanno le chiavi. Ogni telefono può usare un suo relay: un
messaggio a un contatto su un altro relay viene sigillato per il suo e consegnato al tuo, che lo passa oltre, così il
suo relay non vede mai l’indirizzo del tuo telefono. Un telefono senza relay riceve un posto su quello del suo
contatto, vedi **Nessun relay tuo** più sotto.

**Perché:** con le code e senza account, nessun server ha un elenco di chi conosce chi, e nessuno ha bisogno del tuo
numero di telefono o della tua email per raggiungerti: chi ha il tuo link di contatto può scrivere nella tua coda, e
solo tu la leggi.

1. Nella schermata principale, tocca **Nuova chat**. Finché manca qualcosa, in alto **Come ti colleghi ora** dice in parole semplici come ti
   raggiungono i tuoi contatti: tramite il tuo relay, tramite Nostr senza relay, o solo da vicino; quando tutto funziona,
   non viene mostrato. Con un relay, un campo in cima trova un contatto per nome o aggiunge un link incollato lì, e
   sotto vengono **Il tuo codice QR**, con **Ha già {=Erevos}** e **Nuovo su {=Erevos}** sopra, e righe per **Il tuo link di contatto** e altro; un
   telefono ancora senza relay inizia con **Inizia con un invito**. Le impostazioni del relay stesso sono in **Per
   utenti esperti**, in fondo; **Impostazioni** → **Relay e reti** → **Relay** apre Nuova chat con queste impostazioni aperte.
2. In **Per utenti esperti**, scrivi l’**Indirizzo del relay**: \`ws://<indirizzo del computer>:7879\` per un relay sulla tua
   rete, o \`wss://relay.example.org\` per uno su internet. Aggiungi il **Token** se il relay lo richiede.
3. Erevos crea da solo la tua coda sul relay, qualche secondo dopo, e dice **Coda sul relay creata**: funziona tutto, testi, foto, messaggi vocali,
   chiamate e gruppi, e **Come ti colleghi ora** scompare, perché non manca nulla. Se non ci riesce, la nota dice perché; **Crea la mia coda sul relay**, sotto l’indirizzo, riprova.
4. **Il tuo codice QR** è su Nuova chat stessa, appena si apre. Fallo scansionare all’altro telefono con la fotocamera,
   poi apri il link in Erevos. La schermata **Aggiungi un contatto** mostra cosa contiene: tocca **Aggiungi alla chat**
   solo se l’hai scansionato tu stesso. **Aggiungi e collega a uno dei miei contatti** aggiunge anche lui, collegato al
   contatto che scegli, di cui la chat prende il nome.
   Il codice è corto, così qualsiasi fotocamera lo legge. Chi lo scansiona risponde con il proprio link di contatto, e poi questo telefono gli scrive per primo. Il codice è nuovo ogni volta che si apre Nuova chat, e vale una volta: il primo che lo scansiona diventa subito un contatto; chi lo scansiona dopo, o prende il link che condividi, scrive prima una richiesta di messaggio. **Codice QR grande, senza internet** mostra invece il codice intero, che funziona vicino senza internet, e **Codice QR piccolo** torna indietro. **Condividi**, sotto, invia un link corto che qualsiasi app lascia toccare; su Android apre Erevos, che chiede prima di accettarlo. Per aggiungere qualcuno con il suo codice QR di contatto, il tuo telefono ha prima bisogno di un relay.
   Questo codice QR funziona solo se entrambi i telefoni hanno un relay, come dice la scheda. Per qualcuno che non ha
   ancora {=Erevos}, o il cui telefono non ha un relay, scegli invece **Nuovo su {=Erevos}**, sopra: la scheda mostra
   **Invito a {=Erevos}**, un invito con cui il suo telefono entra nel tuo relay, come in Invitare qualcuno di nuovo, più
   sotto. Nuova chat mostra ciò che hai scelto l’ultima volta.
   Lo stesso vale per contatto: finché è mostrato il codice di contatto piccolo e l’NFC è attivo su Android, l’altro
   telefono lo prende se appoggi il suo retro al retro del tuo. Funziona solo con Erevos in primo piano, non in
   background, e mai con il codice QR grande.
5. Se la sua fotocamera mostra solo il testo, o se è lontano, tocca **Condividi** sotto il tuo codice QR, oppure apri
   **Il tuo link di contatto** e tocca **Condividi il mio link di contatto**, e mandaglielo.
   Lo incolla nel campo in cima a **Nuova chat** e tocca **Aggiungi**.
6. Oppure al contrario: tocca **Scansiona il suo**, sotto il tuo codice QR, e fotografa il codice QR sul suo schermo,
   oppure tocca **Da una foto del suo codice QR** per uno screenshot o una sua foto che ti ha mandato. Erevos lo legge
   e lo aggiunge subito. Su un computer, su Sailfish OS e nella web app **Scansiona il suo** chiede una foto; su iPhone
   offre anche la fotocamera.
   Anche le chat nascoste li hanno entrambi; lì il campo in cima accetta solo un link.
7. Oppure, con qualcuno accanto a te o al telefono: tocca **Abbina con un codice** in **Nuova chat**. Uno tocca
   **Mostra un codice** e dice o mostra le 8 cifre; l’altro tocca **Digita il suo codice** e le digita. Allora ogni
   telefono ha l’altro come contatto, come se ciascuno avesse scansionato il codice QR dell’altro. Il codice non lascia
   mai i telefoni: si dimostrano l’un l’altro di conoscerlo, e i loro link di contatto partono cifrati con una chiave che
   solo lo stesso codice dà. Si incontrano su relay Nostr pubblici, che non vedono né il codice né i link, e chi tira a
   indovinare ha 3 tentativi prima che il codice si chiuda. Un codice dura 10 minuti.

La nuova chat appare nella schermata principale con il nome **contatto** e i primi caratteri della sua chiave, finché
non ha un nome: **Rinomina** nei suoi dettagli gliene dà uno. Subito dopo averlo aggiunto qui, **Collega a uno dei miei
contatti** sotto l’avviso che è stato aggiunto ti lascia scegliere invece uno dei tuoi contatti (**Non ora** lo lascia
così): la chat prende il nome di quel contatto, se non ne ha uno suo, e la scheda del contatto mostra la chat. Le chat
nascoste offrono solo i loro contatti, mai quelli del telefono. Basta che un telefono aggiunga l’altro: aggiungere un
link avvia una conversazione crittografata e dice all’altro telefono come rispondere, così elenca la chat la prossima
volta che controlla la sua coda, cosa che fa ogni pochi secondi.

**Che cosa vede il relay di una chat:** tutti i tuoi contatti scrivono nella tua unica coda. Appena ogni telefono ha
ricevuto un messaggio dall’altro, ogni messaggio tra loro viene sigillato un’altra volta per il telefono a cui va, con
una chiave che quel telefono ha dato dentro la chat, così per il relay ognuno è fatto di byte casuali di una tra poche
dimensioni, e non può capire da essi a quale conversazione appartengano. Il primo messaggio di una chat, e quelli
inviati prima che arrivi la risposta, lo mostrano ancora. Il relay vede comunque quale indirizzo deposita ogni
messaggio, e quando. E ognuno dice al relay, in un byte che legge, che cosa trasporta: un messaggio che qualcuno legge,
una comunicazione tra telefoni (che un messaggio è arrivato o è stato letto, la scrittura in corso, l’essere online, le
reazioni, nuove chiavi), o una chiamata che squilla. Così il relay vede quali sono messaggi, e quando inizia una
chiamata, che le notifiche siano attive o no: è così che l’avviso di una web app chiusa può contarli, e l’avviso delle
chat nascoste chiuse.

### Modi per entrare nel relay

Un relay che richiede un token fa entrare un telefono in tre modi. Ogni modo finisce con un token tutto del telefono
lì, così chi gestisce il relay può togliere un singolo telefono da solo.

- **Un invito:** un codice QR o un link da un telefono già sul relay (vedi Invitare qualcuno di nuovo più sotto). Niente
  da scrivere, e siete subito contatti.
- **Un account:** **Accedi con LPHL**, quando il relay lo offre (vedi Accedere al relay più sotto). Qualsiasi account
  LPHL può farlo, su un massimo di 10 telefoni.
- **Il token del relay:** l’unico token condiviso, da chi gestisce il relay, scritto in **Token**. Erevos lo scambia
  subito, da solo, con un token tutto del telefono, con il nome che lì dai a te stesso negli inviti (\`phone\` se non
  hai dato un nome), lo dice, e da allora usa solo quello. Così anche questo telefono può invitare. Serve un relay che
  accetti inviti, successivo a Erevos 3.1.0; con uno più vecchio, o con uno che non accetta inviti, il telefono tiene il
  token del relay e non può invitare.
- **I limiti:** un telefono può avere 5 inviti in attesa insieme e farne 10 al giorno (il giorno secondo l’UTC); ognuno
  è per un telefono e dura 7 giorni. Il relay fa entrare in tutto 100 telefoni su invito, contando anche gli inviti
  ancora in attesa, a meno che il suo gestore non abbia scelto diversamente. I telefoni entrati con un account o con il
  token del relay non contano in quei 100: il relay dà un token tutto loro a 50 telefoni al giorno entrati con il suo
  token, e un account ha 10 telefoni. Il relay serve 512 connessioni insieme, chiunque siano, a meno che il suo gestore
  non abbia scelto diversamente.
- **Togliere un telefono:** chi gestisce il relay cancella la sua riga nel file dei token del relay: non può più usare
  il relay, mentre i telefoni che ha invitato tengono il loro. Se ha mai avuto il token del relay, cambia anche quel
  token, così non può tornare con quello. I telefoni con un token tutto loro continuano come sono: solo un telefono che
  ha ancora scritto il vecchio token (non aperto da allora, o con un {=Erevos} più vecchio) ha bisogno di quello nuovo.
- **Le chat nascoste** tengono il token del relay scritto per loro: scambiarlo nello stesso momento di quello dello
  spazio mostrerebbe al relay che sono di questo telefono. Quando il token del relay cambia, scrivi quello nuovo nel loro
  **Per utenti esperti**.

**Perché:** il relay dà a ogni connessione un suo thread, quindi ne serve solo un certo numero insieme; e aggiunge solo
un certo numero di righe al giorno per i telefoni entrati con il suo unico token, così un token finito dove non doveva
non può riempire il suo file dei token.

### Invitare qualcuno di nuovo

Un codice QR o un link fa entrare qualcuno di nuovo: il suo telefono entra in {=Erevos} sul tuo relay, con un accesso
tutto suo, senza scrivere nulla, e siete subito l’uno contatto dell’altro, senza richiesta di messaggio.

- **Per invitare:** nella schermata iniziale, tocca **Invita** accanto alla riga del relay oppure, su **Nuova chat**,
  scegli **Nuovo su {=Erevos}** sopra il codice QR. Il codice QR compare subito: quando {=Erevos} è sul suo telefono, lo
  scansiona con la fotocamera e apre il link in Erevos, oppure tocca **Condividi l’invito** e mandagli il link. Sotto
  puoi scrivere per chi è (il suo nome nelle tue chat) e **Il tuo nome, per quella persona**, oppure lasciare vuoti
  entrambi. Riaperto finché nessuno l’ha preso e gli resta almeno un giorno, mostra lo stesso invito, quindi non
  consuma nessuno dei 5 in attesa né dei 10 al giorno; **Invita un’altra persona** ne crea uno nuovo. È per una
  persona, per 7 giorni, o meno se l’invito al relay finisce prima. Chi lo prende per primo lo
  ha, quindi dallo solo a quella persona.
  Su un telefono Android con l’NFC attivo puoi anche darlo per contatto: appoggia il retro del suo telefono al retro del
  tuo mentre il codice è mostrato, e il suo telefono apre il link da solo, in Erevos se è installato, altrimenti sulla
  pagina web di Erevos, che offre {=Erevos}. Se l’NFC è spento, la schermata ti dice di attivarlo nelle impostazioni di
  Android.
- **Per entrare:** su un telefono ancora senza relay, **Nuova chat** inizia con **Inizia con un invito**. Tocca
  **Scansiona il suo codice QR** e fotografa l’invito sul suo schermo, oppure tocca **Da una foto del suo codice QR**, o
  incolla il link nel campo lì e tocca **Partecipa**; funziona anche scansionarlo con la fotocamera e aprire il link in
  Erevos. Il link apre **… ti invita su {=Erevos}**: tocca **Partecipa** solo se è arrivato da quella persona. Erevos
  prende un accesso tutto suo al suo relay e una coda lì, la aggiunge e dice **Benvenuto su Erevos**. Il suo primo
  messaggio lo dice al suo telefono, che aggiunge subito questo come contatto, con il nome che ha scritto.
- **Gli altri modi per entrare:** sotto, **Per utenti esperti** apre gli altri, per chi li cerca: **Accedi con LPHL**
  fa accedere questo telefono al relay di LPHL con un account LPHL, nel browser (vedi Accedere al relay più sotto), e
  poi aggiungi i tuoi contatti con i loro inviti o link; **Inizia senza relay**, come in Senza nessun relay, in
  Tramite Nostr; e le impostazioni del relay, come in 1–6 sopra. Un invito è il modo più semplice per entrare, e sul
  relay un telefono invitato ha solo un nome di lettere e cifre a caso.
- **Un altro relay:** sotto **Accedi con LPHL**, **Accedi a un altro relay…** prende l’indirizzo di un altro relay,
  come te l’ha dato chi lo gestisce, ad esempio relay.example.org: la scheda accede allora lì, col nome degli account
  che quel relay accetta, o dice che non offre l’accesso, e allora chi lo gestisce può darti un invito. **Torna a**
  riporta quello di LPHL.
- **Cosa deve permettere il tuo relay:** l’accesso tutto suo è un invito al tuo relay (vedi Inviti al relay più sotto),
  quindi arriva solo da un telefono con un token tutto suo su un relay che accetta inviti. Conta tra i tuoi inviti, con
  un nome di lettere e cifre a caso, e resta anche quando il tuo se ne va. Un telefono con l’unico token condiviso del
  relay lo scambia prima con uno tutto suo (vedi Modi per entrare nel relay sopra); dove il relay non lo fa, non crea
  nessun invito: prima accedi al relay (sotto il **Token**, in **Per utenti esperti**), o prendi un invito per il relay.
  Quando il tuo relay non accetta inviti, l’invito vi rende comunque contatti, e il suo telefono usa il tuo relay solo
  come glielo permette il tuo link di contatto, come in Nessun relay tuo più sotto.
- **Un telefono che ha già un relay** tiene il suo: l’invito aggiunge solo te, e siete subito contatti lo stesso.
- **Che cosa viene conservato:** il tuo telefono conserva il segreto di ogni invito e il nome per quella persona,
  sigillati nello spazio, finché non viene usato o finiscono i suoi 7 giorni, al massimo 20 insieme. Sul relay non c’è
  niente di tutto questo, tranne l’invito al relay.
- [~] **Via SMS, a chi non ha ancora {=Erevos}:** su Android, la scheda di un contatto che non è in Erevos ha **Invita via
  SMS**. Scrive un SMS al suo primo numero con un link breve, nell’app per gli SMS (quella di Erevos quando è l’app per
  gli SMS del telefono), che puoi inviare o no. La pagina del link sul server web di LPHL gli offre {=Erevos} (l’app
  Android, o la web app su iPhone) e poi vi apre l’invito; nella web app su iPhone, incolla il link sotto **Ho un
  invito**. Tocca **Partecipa**: il suo telefono entra nel tuo relay come sopra e risponde al tuo attraverso di esso, il
  che lo aggiunge, collegato a quel numero e con il nome della scheda. Il suo primo messaggio, che parte da solo, fa di
  te un suo contatto, con il nome che hai dato a te stesso nel tuo ultimo invito. L’invito sta dopo il **#** nel link,
  che non viene mai inviato a nessun server web, ma l’operatore telefonico vede l’SMS, come ogni SMS: quindi è per una
  persona, per due giorni, e quando i due giorni finiscono senza che nessun telefono l’abbia usato, il tuo telefono
  ritira il suo invito al relay. Serve un relay che lasci invitare il tuo telefono, come sopra.

### Nessun relay tuo

Un telefono senza relay chatta via internet lo stesso: aggiungendo il link di un contatto il cui relay presta posti,
prende un posto lì, senza token.

- **Come:** aggiungi il suo link come in 4 e 5, senza niente in **Relay**. Erevos dice che ora hai un posto sul suo
  relay, prestato tramite il suo link, e da allora lo usa come se fosse suo: il tuo link lo nomina, così anche gli altri
  ti raggiungono lì.
- **Chi presta:** il tuo link porta un biglietto per un posto sul tuo relay solo quando attivi **Condividi un posto sul
  mio relay con questo link**, in **Il tuo link di contatto** in **Nuova chat**, e solo per il link mostrato in quel
  momento: la prossima volta che si apre la chat, è di nuovo disattivato. Il relay ha bisogno di una chiave per l’invio
  in due passaggi, e presta solo dopo che chi lo gestisce attiva il prestito; può anche ritirare i posti di un
  biglietto. Un biglietto dura 30 giorni e dà fino a quattro posti. Chiunque veda un link con un biglietto può prendere
  un posto con esso, quindi dai un link del genere solo a chi intendi darlo.
- **Che cosa non fa un posto prestato:** i messaggi ai contatti su altri relay vanno direttamente al loro relay, che
  allora vede l’indirizzo del tuo telefono. Non conserva niente per dopo (un messaggio inviato più tardi aspetta sul
  telefono), non dà un relay per le chiamate (le chiamate vanno direttamente tra i telefoni), e crea al massimo altre 4
  code e invia al massimo 50 MB di file al giorno. Il tuo link non presta niente a sua volta.
- **Invece, un relay tuo:** scrivi il suo indirizzo in **Relay**: il posto prestato viene lasciato, e i contatti
  conoscono quello nuovo dal tuo prossimo messaggio.
- **Un link senza biglietto** (da un relay o un Erevos più vecchio): un relay che non richiede token viene usato così
  com’è; altrimenti vi raggiungete solo da vicino, finché non hai un relay.

**Perché:** un link con un biglietto è una chiave del tuo relay per chiunque lo veda, quindi il tuo link ne porta uno
solo quando lo scegli, per il link mostrato in quel momento, e il relay presta solo dopo che chi lo gestisce lo
permette. I file di un posto prestato sono limitati a poche foto e messaggi vocali al giorno, così non occupa mai tutto
lo spazio del relay.

### Inviti al relay

Un telefono con un token tutto suo su un relay che accetta inviti può lasciare che un altro telefono usi quel relay,
con un token tutto di quel telefono, così nessun token viene scritto o passato ad altri.

- **Per invitare:** in **Per utenti esperti** in **Nuova chat**, sotto il **Token**, tocca **Invita sul relay**, scrivi
  per chi è e tocca **Crea l’invito**. Si apre un codice QR: fallo scansionare al suo telefono con la fotocamera e
  aprire il link in Erevos, oppure tocca **Condividi l’invito** e mandaglielo. Vale per un telefono per 7 giorni, e chi
  lo prende per primo lo ha, quindi mostralo solo a quella persona.
- **Per prenderne uno:** il link apre **Invito a un relay**, con l’indirizzo del relay: tocca **Usa questo relay** solo
  se è arrivato da qualcuno che conosci. In Erevos, anche **Scansiona il suo** e **Da una foto del suo codice QR** in
  Nuova chat leggono un invito, e il suo link si può incollare nel campo in cima. Erevos crea un token per
  questo telefono, lo conserva con l’indirizzo del relay solo in questo spazio e crea lì la tua coda. Se il telefono usa
  un altro relay, prima chiede, e i contatti conoscono la tua nuova coda dal tuo prossimo messaggio. Erevos accetta un
  invito a un relay wss://, o a uno ws:// solo su una rete di casa (come \`ws://192.168.1.10:7879\`). Le chat nascoste
  non accettano inviti.
- **I tuoi inviti:** elencati sotto il pulsante, in attesa o in uso. **Ritira** ritira uno ancora in attesa, o esclude
  subito il telefono che l’ha preso, solo quello: i telefoni che ha invitato a loro volta tengono il loro.
- **Il loro resta:** un telefono che hai invitato tiene la sua riga sul relay anche quando la tua se ne va, perché il
  telefono che ti ha invitato l’ha ritirata, l’account con cui hai fatto l’accesso non può più usare il relay, o il suo
  gestore l’ha tolta, e così anche i telefoni che ha invitato. Solo i tuoi inviti ancora in attesa non fanno più entrare
  nessuno.
- **Che cosa conserva il relay:** per quel telefono un nome di lettere e cifre a caso, che non dice nulla di chi è (il
  nome che hai scritto resta sul tuo telefono; un Erevos prima della 6.0.0 dava al relay quel nome, in lettere latine),
  che l’hai invitato tu, e un’impronta del suo token, non il token. Chi gestisce il relay vede questo, e può togliere
  qualsiasi telefono. Un telefono può avere 5 inviti in attesa insieme, e farne 10 al giorno, e il relay fa entrare solo
  un certo numero di telefoni su invito (100, a meno che il suo gestore non abbia scelto diversamente).
- **Chi può invitare:** un telefono con un token tutto suo, su un relay il cui gestore ha attivato gli inviti (vedi
  [Gestire un relay tuo](#own-relay)). Un telefono con l’unico token condiviso del relay lo scambia prima con uno tutto
  suo (vedi Modi per entrare nel relay sopra). Con un posto prestato non c’è **Invita sul relay**.

**Perché:** il relay conserva solo un’impronta di ogni token, mai il token, così il suo file non dice a nessuno come
connettersi. E un invito nomina un relay wss://, o uno ws:// a casa, così non può mai mandare le richieste del tuo
telefono attraverso internet in chiaro.

### Accedere al relay

Un relay può far accedere i telefoni con un account di cui il suo gestore si fida, come LPHL, per un token tutto loro,
senza niente da scrivere in Erevos.

- **Per accedere:** scrivi l’indirizzo del relay in **Relay**. Quando il relay lo offre, **Accedi con LPHL** appare
  sotto il **Token**. Toccalo: il browser apre la pagina di accesso, dove scrivi il tuo nome e la tua password, che
  Erevos non vede mai. La pagina del relay mostra poi sei cifre. Su Android, tocca lì **Apri {=Erevos}** e Erevos
  completa l’accesso da solo; altrimenti scrivile come descritto di seguito. Tornato in Erevos, che ti porta
  direttamente in **Codice della pagina**, scrivile lì e tocca **Completa l’accesso**: il telefono conserva il suo
  token con l’indirizzo del relay solo in questo spazio, e crea lì la tua coda. Scrivi il codice solo in Erevos sul
  tuo telefono e non darlo a nessuno, anche se te lo chiedono: chi lo scrive usa il relay come se fosse te. Dopo 5
  codici sbagliati l’accesso è finito: accedi di nuovo. Erevos apre solo una pagina di accesso sull’indirizzo del
  relay stesso, tramite https.
- **Accedere di nuovo** sullo stesso telefono prende il posto della sua riga sul relay, quando il suo token è quello
  che ha ricevuto da quel relay. Ogni telefono riceve una riga tutta sua, al massimo 10 per un account.
- **Che cosa vedono il relay e LPHL:** il relay dà alla riga del telefono il tuo nome utente (\`lphl:nekten\`), e ogni
  ora chiede a LPHL se l’account può ancora usarlo: quando l’account viene chiuso o disattivato, o LPHL non si può
  interpellare per 3 giorni, la riga se ne va, e il telefono non può più usare il relay; i telefoni che ha invitato
  tengono il loro. LPHL vede ogni accesso e questi controlli, ma niente dei tuoi spazi, chat o contatti. Accedere da un
  altro spazio con lo stesso account mostra al relay che sono entrambi tuoi.
- **Le chat nascoste** non accedono.

**Perché:** la pagina mostra il codice e tu lo scrivi in Erevos, non il contrario, così un link di accesso che qualcun
altro ti manda non gli fa ottenere nulla: solo chi ha fatto l’accesso vede il codice, e cinque codici sbagliati lo
chiudono. Erevos apre una pagina di accesso solo sull’indirizzo del relay stesso, tramite https, così niente che
risponda al posto del relay può mandarti su una pagina da un’altra parte. E un fornitore che non si può interpellare
per un po’ non esclude subito nessun telefono: lo fanno solo 3 giorni senza una risposta valida. E il pulsante **Apri
Erevos** è altrettanto sicuro: il link contiene solo le sei cifre, che non rivendicano nulla senza il segreto che ha
solo il telefono che ha avviato l’accesso, così un’app che avesse intercettato il link non ottiene nulla.

### La chiave del relay

Appena Erevos conosce la chiave del tuo relay (la chiede al relay la prima volta, o gliela dà un link di contatto),
ogni connessione a quel relay inizia con un controllo: il relay deve dimostrare di avere quella chiave, e il token e
tutto quello che segue viaggiano crittografati per quella chiave, dentro la crittografia della connessione stessa
(TLS). In **Come ti colleghi ora**, Erevos dice allora che il tuo relay ha dimostrato la sua chiave. Da quel momento,
questo spazio non raggiunge mai quel relay senza il controllo.

- Un relay più vecchio di questa app non dimostra nulla: funziona come prima, e **Come ti colleghi ora** dice che è più
  vecchio. Erevos riprova ogni ora.
- Un relay che non riesce a dimostrare la chiave che Erevos conserva per lui non riceve nulla, e i tuoi messaggi
  aspettano; **Come ti colleghi ora** lo dice in rosso. Solo se il suo gestore ti ha detto che ha una chiave nuova,
  tocca **Ha una chiave nuova**: Erevos prende allora la chiave che il relay dà subito dopo.

**Perché:** il certificato della connessione dice solo che chi risponde ha un certificato per il nome del relay, che
un’azienda che emette certificati può dare anche a qualcun altro, per errore o perché costretta. La chiave del relay è
solo sul suo server, così nessuno nel mezzo può spacciarsi per lui, e un certificato rinnovato non cambia nulla.

### Il codice di sicurezza

Apri la chat, tocca il suo nome e poi **Codice di sicurezza**. Entrambi i telefoni mostrano le stesse 60 cifre per voi
due. Confrontatele di persona o durante una chiamata: se coincidono, nessuno è nel mezzo. Se sono diverse, non fidarti
di quella chat, e aggiungi di nuovo il link, scansionato dal suo telefono. Quando ha collegato un dispositivo, dice
anche quando è cambiato l’ultima volta l’elenco dei suoi dispositivi: i tuoi messaggi vanno anche a ogni voce di
quell’elenco, quindi se in quel momento non ne ha collegato o scollegato uno, chiediglielo.

Uno accanto all’altro, potete verificare con i codici invece di leggere le cifre: sotto il numero ogni telefono
mostra un codice QR. Tocca **Fotografa il suo codice** e fotografa il codice sul suo telefono, poi lascia che faccia
lo stesso con il tuo. Quando corrisponde, la riga dice **Verificato di persona**. Ogni telefono segna l’altro solo in
base a ciò che ha visto lui stesso, e non viene inviato nulla. Se dice che non corrisponde, forse qualcuno è in mezzo:
non fidarti di quella chat. **Scegli una foto del suo codice** verifica invece una foto del suo codice che hai già. Il
segno **Verificato di persona**, con il giorno, resta finché non tocchi **Togli il segno**. Resta su questo telefono,
segue la chat quando entra nelle chat nascoste o ne esce, e non passa ai tuoi dispositivi collegati. Un codice di un
{=Erevos} più recente lo dice: aggiorna Erevos, poi rifai la foto.

**Perché:** il codice contiene solo un hash delle vostre due chiavi, in un ordine che distingue i due telefoni, quindi
una foto del tuo schermo non verifica nulla, e una foto del codice non dice chi siete a chi non ha già entrambe le
chiavi.

### Presentare due contatti

Nei dettagli della chat di un contatto, **Presenta a un contatto** ti fa scegliere un altro dei tuoi contatti e
**Chiedi a entrambi**. Ognuno viene chiesto nella tua chat con lui, con un messaggio che nomina l’altro come lo hai
nominato tu; entrambi devono avere un nome. Ognuno risponde **Di’ di sì** o **Di’ di no** in quella chat. Diventano
contatti solo se entrambi dicono di sì: quello dalla cui chat hai fatto la presentazione scrive per primo, e il telefono
dell’altro lo accetta subito, con il nome che gli hai dato tu. Se uno dice di no, non succede nulla, e all’altro non
viene detto. Una presentazione aspetta una settimana.

**Perché:** tutto passa dentro la crittografia delle tue chat con ciascuno, quindi nessun relay vede chi viene
presentato a chi. Tu passi solo il link di contatto che il secondo ha scelto di dare, dopo aver detto di sì. Poiché chi
presenta potrebbe spacciare qualcun altro, confronta il codice di sicurezza con il nuovo contatto come con ogni altro.

### Inviato, arrivato e letto

Sopra il primo messaggio di ogni giorno, in ogni chat, anche nei gruppi e in Chat con me stesso, il giorno si vede
bene: **Oggi**, **Ieri**, il giorno della settimana nell’ultima settimana, e prima il giorno con la data, come
**Martedì 10 novembre**.

Sotto ognuno dei tuoi messaggi a un contatto, **✓** dice che il relay o un telefono vicino l’ha preso, **✓✓** che è
arrivato al suo telefono, e **✓✓✓** che l’ha letto. Il suo telefono lo dice al tuo, dentro la crittografia, la
prossima volta che ognuno controlla il relay, o subito quando siete vicini. Un messaggio conta come letto appena la sua
chat appare sullo schermo. **Segna tutto come letto** nel menu ⋮ conta allo stesso modo: i loro telefoni lo sanno alla
successiva occhiata al relay.

In un gruppo che non è pubblico, i tuoi messaggi hanno gli stessi segni, per tutti gli altri membri insieme: **✓** una
volta inviati, **✓✓** quando il messaggio è arrivato al telefono di ogni membro che era nel gruppo quando l’hai
inviato, e **✓✓✓** quando tutti l’hanno letto. Il telefono di ogni membro lo dice al tuo, in un messaggio di gruppo
silenzioso destinato solo a te, cifrato end-to-end come il resto del gruppo: che il messaggio è arrivato, un paio di
secondi dopo (insieme agli altri arrivati nel frattempo, in uno solo), e che è stato letto, appena il gruppo appare
sullo schermo. Tieni premuto un tuo messaggio e scegli **Chi l’ha letto** per vedere chi l’ha letto e quando, al
telefono di chi è arrivato e quando, e chi non ha ancora fatto né l’una né l’altra cosa, sotto **Non ancora**. Un
membro il cui {=Erevos} è più vecchio di questi segni non dice nulla, quindi resta sotto **Non ancora** e il messaggio
resta a **✓**. I gruppi pubblici non hanno segni. Un computer collegato a questo telefono mostra gli stessi segni.

- **Invio…:** nel momento in cui premi Invia, il telefono fa una breve vibrazione, il campo si svuota e il messaggio
  appare, segnato **Invio…** finché il relay o il suo telefono non lo prende. Se non può partire e non può aspettare,
  le sue parole tornano nel campo. Se esci dalla chat mentre mostra **Invio…**, non va perso: parte, o aspetta segnato
  **In attesa**.
- **In attesa:** un messaggio che niente ha potuto prendere, perché il relay non è raggiungibile e il suo telefono non
  è vicino, resta nella chat segnato **In attesa**, e parte da solo, in ordine, appena il relay o il suo telefono vicino
  può prenderlo, mentre uno spazio è aperto; allora mostra **✓**. Un testo aspetta subito. Un messaggio vocale, una foto
  o un file prima chiede: **Lascia in attesa** o **Elimina**. Un messaggio in attesa si elimina solo su questo telefono.
  Anche nelle chat nascoste aspetta, ma passa solo dal loro relay, mai dal telefono vicino o via LoRa: mentre sono
  aperte, oppure, con **Ricevere da chiuse** attivo, mentre lo spazio è aperto. Quando la coda del contatto sul relay è
  piena, un testo, un messaggio vocale, una foto o un file va comunque ai suoi dispositivi collegati, se ne ha, appare
  come inviato, e viene ritentato per il suo telefono finché le chat nascoste restano aperte: se si chiudono prima che
  parta, il suo telefono non lo riceve mai.
- **Invia più tardi:** tieni premuta la freccia di invio e scegli **Più tardi…**, oppure tocca **+** e poi **Invia più
  tardi**. Scegli un’ora con un tocco (**Tra 1 ora**, **Stasera 20:00**, **Domani 09:00**) o il giorno, l’ora e i
  minuti, fino a un anno avanti, poi **Invia più tardi**. Il messaggio resta nella chat segnato **Programmato** con la
  sua ora. Va crittografato al relay, che lo conserva e lo invia a quell’ora, anche se allora questo telefono è spento o
  bloccato, e il suo telefono lo mostra da quell’ora, non prima. Se ora nessun relay è raggiungibile, aspetta su questo
  telefono e va al relay appena ce n’è uno raggiungibile. Senza niente di scritto, l’ora che scegli vale per la prossima
  foto, il prossimo file o messaggio vocale: una foto o un file va subito al tuo relay e resta lì finché non lo prende,
  al massimo 14 giorni dopo la sua ora. Ce l’hanno anche le chat nascoste, allo stesso modo, tramite il loro relay.
  Fino alla sua ora, eliminalo per ritirarlo dal relay, e non parte mai. Se prima di allora la sua coda sul relay
  cambia, Erevos lo trattiene di nuovo per quella nuova la prossima volta che raggiunge il relay.
  Con un token tutto di questo telefono, parte solo se il telefono ha ancora la sua riga su quel relay in quel momento.
  Un messaggio senza suono resta senza suono. Un relay di prima di questa funzione non conserva niente per dopo: allora
  il messaggio aspetta su questo telefono e parte alla sua ora mentre Erevos è in funzione, anche in background mentre
  **In background** è su **Ricevi e squilla** (più sotto), o alla prossima apertura di Erevos.
- **Messaggio di sicurezza:** scrivilo, tocca **+** e poi **Messaggio di sicurezza**, e scegli per quanto tempo: 6 o
  12 ore, 1, 2 o 3 giorni, o una settimana. Va subito al relay, come uno inviato per più tardi, e il relay lo invia da
  solo a quell’ora. Ogni volta che apri Erevos, dopo la sua password, slitta di nuovo di altrettanto, quindi parte solo
  se non apri Erevos in tempo: se il telefono viene perso, sottratto, si rompe o resta senza internet, o se ti è
  successo qualcosa. Erevos in background non lo sposta, e nemmeno la sua schermata della password, né una finestra
  lasciata aperta che nessuno tocca o in cui nessuno scrive da 10 minuti. Nelle chat nascoste slitta finché il loro
  posto riceve, o quando lo apri. Nella chat è segnato **Messaggio di sicurezza** con l’ora a cui partirebbe; eliminalo
  per fermarlo. Scrivilo in modo che dica cos’è: al tuo contatto arriva come un messaggio qualunque. Se il relay non è
  raggiungibile quando apri Erevos, mantiene la sua ora. È cifrato una volta sola e va di nuovo al relay così com’è ogni
  volta che slitta, quindi non costa nulla alla tua chat.
  **Perché:** un messaggio tenuto dal relay non ha bisogno di niente di questo telefono per partire, quindi chi prende
  il telefono non può fermarlo, se non aprendo Erevos con la sua password.
- **Invia senza suono:** tieni premuta la freccia di invio e scegli **Senza suono**: il suo telefono mostra la
  notifica senza suono né vibrazione. Un Erevos di prima non lo sa e suona come al solito, e così Erevos come web app,
  la cui notifica arriva dal browser. Così anche la notifica di un posto di chat nascoste chiuso, con **Avvisa quando
  arriva un messaggio** attivo, e di uno spazio chiuso con **Anche mentre è aperto un altro spazio**: questi chiedono
  al relay solo quanti ne sono arrivati, e il relay non sa distinguere uno senza suono da un altro, perché solo il
  messaggio crittografato lo dice.
- **Link:** un indirizzo web in un messaggio è sottolineato, anche uno nudo come t.me/name o example.org/page, come lo
  mostrano Telegram e Signal; un indirizzo e-mail o il nome di un file (photo.jpg) no. Toccalo ed Erevos lo mostra
  intero, da aprire nel browser solo se è dove vuoi andare. Prima di allora non viene scaricato nulla.
- **Condividi da un’altra app** (Android): nel menu **Condividi** di un’altra app, come quello del browser per una
  pagina, scegli **Erevos**. Appena uno spazio è aperto, **Invia a** elenca le chat{~, i gruppi e le conversazioni SMS| e i gruppi}
  che la schermata principale ha mostrato per ultimi, poi ogni altra chat e gruppo{+, e le chat dei tuoi account Matrix,
  XMPP e Nostr}, con una ricerca; mai le chat nascoste. Parole e link si aprono nel campo del messaggio di quella che
  scegli, da leggere e inviare lì; una foto o un file parte appena quella chat o quel gruppo si apre, una foto con la
  qualità che hai scelto per le foto{~, e mai come SMS}. Un file può essere al massimo di 100 MB{+ in una chat di Erevos, di
  50 MB su Matrix e XMPP e di 20 MB su Nostr}. Viene cifrato appena arriva, con una chiave solo nella memoria di Erevos,
  e così aspetta sul telefono, anche mentre dai la password se Erevos si blocca prima; se ne va una volta inviato, o
  quando lasci **Invia a**.
- **Vede quando leggi:** il tuo telefono lo dice al suo, come il suo lo dice al tuo, a meno che quella chat non appaia
  offline (più sotto).
- **Quando arrivano i messaggi:** Erevos controlla il relay ogni pochi secondi mentre è aperto e sbloccato, su
  qualsiasi schermata, e la schermata principale sposta da sola la chat in cima. Su Android ogni nuovo messaggio suona,
  con una notifica che dice solo quanti ne sono arrivati, anche mentre Erevos è visibile; nella chat o nel gruppo
  aperto sullo schermo suona solo il suono, e aprire una chat toglie dal conteggio quello che vi è arrivato. La
  scrittura in corso, e il fatto che un messaggio sia arrivato o sia stato letto, non ne fanno. Su
  Android continua anche in background, mentre **In
  background** è su **Ricevi e squilla** (più sotto): lì aspetta al relay finché arriva qualcosa, un minuto alla
  volta, invece di chiedere ogni pochi secondi, e non chiede altro quando non è arrivato nulla, così la batteria dura,
  e una notifica dice solo quanti messaggi sono arrivati. Chiuso, bloccato, o
  altrimenti a lungo in background, non lo fa: i messaggi aspettano sul relay, fino a 14 giorni, e arrivano quando
  Erevos si riapre. Una richiesta al relay senza risposta in tempo (un’attesa lì il suo minuto e mezzo minuto in più,
  qualsiasi altra 45 secondi, una parte di un file 2 minuti) conta come fallita e viene ripetuta, così una connessione
  morta per strada, come quando la rete del telefono va in sospensione o cambia, non blocca nulla.

### Online, ultimo accesso, e apparire offline

Mentre la chat di un contatto è aperta sul tuo schermo, Erevos chiede ogni tanto al suo telefono se è aperta, e dice
che la tua lo è. Se la sua lo è, la chat dice **Online** sotto il suo nome con un punto verde, e la schermata
principale mostra il punto sulla sua immagine. Anche scrivere a qualcuno ti mostra online per due minuti. Tutto questo
passa dentro la crittografia, solo tra te e quel contatto: il relay vede un messaggio ogni tanto, come con qualsiasi
chat.

Quando un contatto non è online, la sua chat dice quando ha avuto Erevos aperto l’ultima volta, al minuto: **ultimo
accesso oggi alle 14:32**. Il tuo telefono dice il tuo ai tuoi contatti nello stesso modo, dentro quello che va
comunque a loro (un messaggio, o che ne è arrivato uno), e una volta quando uno apre la tua chat mentre Erevos è
chiuso sul tuo telefono, solo se è stato aperto da quando gli è stato detto l’ultima volta. È disattivato in un nuovo
spazio finché non lo attivi, in **Impostazioni** → **Privacy e sicurezza** → **Ultimo accesso**, o nei dettagli di una
chat qualsiasi; uno spazio creato prima della 7.0.1 lo tiene com’era, attivo a meno che tu non l’avessi disattivato.
Vale in entrambe le direzioni: disattivato, nessuno vede il tuo, e tu non vedi quello di nessuno; chi lo vedeva lo
perde con il tuo messaggio successivo. Si imposta per tutto lo spazio e i suoi dispositivi collegati, ogni spazio per
conto suo. Ogni luogo di chat nascoste ha un interruttore proprio, nei dettagli di una chat di lì, e un’ora propria:
finché sono aperte, solo loro contano come aperte, non lo spazio.

Con **Dire quando apro e chiudo Erevos** attivo (sotto **Ultimo accesso**, attivo a meno che tu non lo spenga), aprire Erevos lo
dice subito anche ai tuoi contatti, senza aspettare un messaggio: solo quelli con cui hai parlato negli ultimi 30 giorni
che mostrano anche la propria ora, ciascuno dopo un’attesa casuale fino a un minuto, al massimo ogni 15 minuti, mai una
chat che appare offline né una richiesta di messaggio. Quando Erevos si chiude, o le sue chat nascoste, chi è stato avvisato mentre era
aperto sa subito quando si è chiuso, così il suo **Ultimo accesso** è quell’ora. Il relay vede allora qualcosa andare
verso di loro quando apri e chiudi Erevos, quindi può capire quando lo fai: spegnilo, e la tua ora va solo con ciò che va comunque a loro.

Mentre scrivi a un contatto che appare online, la sua chat mostra **sta scrivendo…** sotto il tuo nome per qualche
secondo, e la tua sotto il suo quando scrive. Viene detto al massimo ogni pochi secondi, solo mentre appare online, mai
a una richiesta di messaggio, e non nei gruppi.

**Perché:** essere online viene detto solo tra te e un contatto la cui chat è aperta, dentro la crittografia, quindi
il relay non vede più di un messaggio ogni tanto tra due persone che parlano. L’ora del tuo ultimo accesso viaggia
dentro quegli stessi messaggi, crittografata end-to-end: il relay non la conosce mai. Dice però ai tuoi contatti
quando dormi o lavori, e di due contatti visti nello stesso minuto si può supporre che parlino tra loro: disattivalo
se ti importa. Qualcuno che ha solo il tuo link, e scrive come richiesta di messaggio, non riceve nulla finché non
accetti: né che hai letto, né che sei online o stai scrivendo, né quando hai fatto l’ultimo accesso. Finché non
accetti, si vedono solo le sue parole: foto e file aspettano senza essere scaricati, e i link non mostrano anteprima. Se i primi messaggi chiedono un codice, un PIN, una password o soldi, promettono soldi
facili, o il nome somiglia a quello di un tuo contatto, **Attenzione** lo dice sopra. Erevos lo cerca solo sul tuo
telefono, e non blocca nulla.

Per nasconderlo a un contatto, apri la sua chat, tocca il suo nome e poi **Mostrati offline**. Con questo attivo:

- **Non ti vede online**, né che stai scrivendo, e il tuo telefono non gli invia nulla mentre leggi.
- **I suoi messaggi restano ✓** sul suo telefono, non ✓✓ o ✓✓✓, mentre li leggi.
- **Quando gli scrivi**, appari online per due minuti, e ogni suo messaggio che leggi diventa subito ✓✓✓.
- **Nemmeno tu lo vedi online**, perché il tuo telefono non lo chiede, né il suo ultimo accesso; e non riceve nessun
  orario da te.

Si imposta per ogni chat, solo su questo telefono. Disattivalo di nuovo e vedrà quello che hai letto al tuo prossimo
controllo del relay.

### Nomi ed eliminazione

Apri una chat, tocca il suo nome e poi **Rinomina** per darle un nome. Il nome resta su questo telefono, sigillato con
la chat: l’altro telefono non lo vede. Un nome vuoto riporta l’inizio della sua chiave, a meno che uno dei tuoi
contatti non sia collegato a lui: allora riprende il suo nome la prossima volta che si apre la sua scheda, finché il
collegamento resta (vedi [Contatti](#contacts)).

**Il mio nome:** in Impostazioni → Privacy e sicurezza → **Il mio nome** puoi scegliere il nome che i tuoi contatti vedono al posto di un codice. Viene detto cifrato, solo ai contatti che hai accettato, e lo imparano anche i tuoi gruppi privati: lì, chi non è tuo contatto appare come «Nome · 1a2b», con l’inizio della sua chiave. Se hai dato a un contatto un nome tutto tuo (**Rinomina**), continui a vedere il tuo; quello che ha scelto lui compare nei suoi **Dettagli** come «Si fa chiamare» e come suggerimento nel campo per rinominare. Ogni spazio ha il suo nome, e così ogni luogo di chat nascoste (nelle sue impostazioni, accanto a **Ricevere da chiuse**): un luogo nascosto non prende mai il nome dello spazio e parte vuoto, e lo stesso nome in due di essi dice a chi li vede entrambi che sono tuoi. Un nome può avere al massimo 40 caratteri.

Tocca il suo nome e poi **Immagine** per dargli un’immagine scelta da te, un segno su un colore, invece di quella
disegnata dalla sua chiave. Oppure tocca **Foto** (o **Scatta foto**) per una foto: tagliata quadrata, rimpicciolita e
ridisegnata, così non resta niente di quello che diceva oltre all’immagine (un luogo, un telefono), poi sigillata in un
file tutto suo. Anche questa resta su questo telefono, e va nei backup; **Immagine dalla sua chiave** riporta quella
disegnata.

Ogni chat può anche avere un aspetto tutto suo: tocca il suo nome e poi **Aspetto della chat** per le stesse scelte di
**Aspetto** (stile, tema, colori, carattere, sfondo, messaggi e la dimensione del loro testo), solo per quella chat. Un
gruppo ha **Aspetto della chat** dove si apre il suo nome (in un gruppo pubblico, sotto **⋯**), Chat con me stesso ce
l’ha in cima{+, e una chat su Matrix, XMPP o Nostr in fondo, accanto a **Notifiche**}. Come il nome, resta su questo
telefono, sigillato con la chat. **Come l’app** le ridà l’aspetto dell’app.

Per tenere una chat fuori da Erevos, tocca il suo nome e poi **Esporta chat**: i suoi messaggi vanno in un file di
testo, ogni giorno sotto la sua data e ogni messaggio con la sua ora e chi l’ha scritto, salvato nella cartella che
scegli (su un computer, dove scegli). Il file non è crittografato: chiunque lo abbia, o qualsiasi app che legge quella
cartella, può leggerlo. Foto, file e messaggi vocali sono solo nominati, i messaggi effimeri sono esclusi, e le chat
nascoste non vengono esportate, così nessun file fuori da Erevos mostra che esistono.

**Perché:** un messaggio effimero viene escluso, e così una sua citazione, perché chi l’ha inviato voleva che
scomparisse, non che restasse in un file.

Per eliminare un messaggio, tienilo premuto e tocca **Elimina**. Per eliminare tutti i messaggi di una chat, tocca il
suo nome e poi **Elimina messaggi**.
In entrambi i casi Erevos chiede dove:

- **Questo telefono:** solo qui. L’altro telefono tiene i suoi.
- **Entrambi i telefoni:** anche il suo telefono li elimina, la prossima volta che controlla il relay. Il suo Erevos lo
  fa, ma un’app modificata, uno screenshot o una copia possono comunque conservarli.

### Eliminare e bloccare un contatto

Tocca il nome di una chat e poi **Elimina contatto** per dimenticarlo: la sua chat se ne va da questo telefono, ed
Erevos ti dà subito una nuova coda sul relay. Agli altri tuoi contatti viene detto in silenzio, in un messaggio senza
niente dentro, e di nuovo 7, 14 e 21 giorni dopo finché non hanno scritto in quella nuova; quello che hanno scritto
nel frattempo in quella vecchia si vede ancora per 14 giorni. Quello che hai eliminato non viene avvisato, e niente di
quello che invia lì appare. Il tuo link di contatto resta com’era, quindi può ancora chiedere di parlare di nuovo con
esso, come richiesta di messaggio, come chiunque lo abbia.

**Perché:** tutti i tuoi contatti scrivono nella tua unica coda, quindi chi elimini sa ancora dov’è; appena si sposta,
non può più scriverti lì, e nemmeno chi ha inviato la spazzatura qui sotto. Il tuo link di contatto nomina una coda
tutta sua, che un’eliminazione lascia stare, così ogni link e codice QR che hai dato continua a funzionare.

**Una coda per ogni contatto:** su un relay aggiornato per questo, ogni contatto scrive in una coda tutta sua, che
conosce solo lui, comunicata dentro i tuoi messaggi crittografati; la coda del tuo link di contatto serve allora solo
per i primi messaggi. Così il relay non può capire da dove vanno i messaggi che due contatti scrivono allo stesso
telefono, ed eliminare o bloccare qualcuno elimina solo la sua coda: la tua si sposta solo se la conosceva anche lui,
come la conoscono i contatti di prima di questa funzione, e chi è arrivato tramite il tuo link di contatto prima del
suo primo spostamento. Anche i contatti di prima ne ricevono una tutta loro a turno, pochi alla volta, in silenzio, e
anche un loro Erevos di prima la prende. Queste code si leggono senza token, così il token, che nomina il tuo telefono,
non le collega tra loro; tramite Tor, otto alla volta, ogni gruppo di otto su circuiti tutti suoi. Vengono comunque
create ed eliminate con il token, quindi un relay che tiene dei log può collegarle in quel momento. Le chat nascoste e
i computer collegati tengono per ora una coda per tutti. La web app non ha Tor, quindi mentre è aperta aspetta su tutte
le code dei tuoi contatti insieme, da un unico indirizzo; con le notifiche ad app chiusa attive, il tuo relay ha anche
un indirizzo push per tutte le code dei tuoi contatti (vedi [Su iPhone](#iphone)).

- **Blocca contatto**, sotto, fa lo stesso, e in più scarta quello che invia dopo, anche una richiesta. **Blocca**,
  accanto a **Rifiuta**, blocca una richiesta di messaggio: una richiesta conosce solo il tuo link di contatto, quindi
  sposta la tua coda solo finché il link nomina ancora quella, come fa fino al tuo primo spostamento. Chi hai bloccato
  è in **Contatti bloccati** in **Nuova chat**, con **Sblocca**. Aggiungerlo di nuovo dal suo link ti chiede prima di
  sbloccarlo; fino ad allora niente lo aggiunge, {~né la sua risposta a un invito via SMS né il suo link di contatto|nemmeno il suo link di contatto} in
  un gruppo. Ogni persona che scrive dal tuo link di contatto può far suonare il telefono, come fa qualsiasi messaggio:
  **Rifiuta** o **Blocca** ferma quella persona, **Notifiche** → **In silenzio** nella sua chat la zittisce senza
  rifiutarla, e **Nuovo link di contatto** ferma chi ha il vecchio link una volta passati i suoi 14 giorni.
- **Gruppi:** qualcuno in uno dei tuoi gruppi può ancora scriverti lì. Erevos dice in quanti gruppi siete insieme:
  lasciali, o chiedi al loro admin di rimuoverlo.
- **Quando il relay non è raggiungibile**, la coda cambia appena risponde, e fino ad allora niente di quello che invia
  appare.
- **I messaggi programmati** che avevi per lui vengono ritirati dal relay, subito o appena risponde, così non partono
  mai.
- **Spazzatura:** quando la tua coda si riempie di cose che non sono per nessuno qui, Erevos ti dà una nuova coda allo
  stesso modo e lo dice, al massimo una volta al giorno. Quando la spazzatura riempie la coda che nomina il tuo link di
  contatto, ricevi invece un nuovo link. Anche un’ondata di richieste di messaggio inventate conta come spazzatura,
  mentre un gruppo di richieste vere arriva comunque.
- **Nuovo link di contatto**, accanto a **Condividi il mio link di contatto**, ti dà un nuovo link: i link e i codici
  QR che hai dato prima funzionano per altri 14 giorni, poi non più. I tuoi contatti non ne risentono. Se il relay
  perde la coda che nomina il tuo link, ricevi un nuovo link allo stesso modo, ma quelli che hai dato prima smettono
  subito di funzionare.
- **Link per un sito web**, accanto, nelle chat dello spazio, ti dà un link da mettere su una pagina web, come la tua
  pagina dei contatti, con il nome che scegli. Apre una pagina che offre {=Erevos} a chi non ce l’ha ancora, su Android, un
  iPhone o un computer, e poi ti aggiunge. Chiunque lo veda può scriverti, quindi ciò che invia arriva come richiesta di
  messaggio, che accetti, rifiuti o blocchi. Non dà un posto sul tuo relay e vale finché vale il tuo link di contatto:
  **Nuovo link di contatto** annulla anche lui.
- **Su un computer collegato** passa al telefono, che a sua volta lo elimina o lo blocca e sposta le sue code, anche
  quella del computer. Il telefono tiene chi è bloccato e lo dice al computer: aggiungerlo lì dal suo link ti chiede di
  sbloccarlo anche lì, e **Sblocca** lo sblocca anche sul telefono.
- **Nelle chat nascoste** si spostano solo le code di quel posto, subito la sua coda per gli squilli, così quello che
  hai eliminato non può più far squillare il telefono. Niente dello spazio o degli altri posti si sposta.

Il pulsante **Elimina** della scheda del contatto (vedi [Contatti](#contacts)) toglie solo la scheda, non la chat. Un
backup fatto prima di un’eliminazione o di un blocco riporta quel contatto: eliminalo o bloccalo di nuovo dopo averlo
ripristinato. Una volta ripristinato, la tua coda dice di essere più recente di qualsiasi altra conosciuta dai tuoi
contatti, e a ognuno viene detto di nuovo, così tutti scrivono dove leggi.

### Il menu di un messaggio

Tieni premuto un messaggio per il suo menu: le reazioni in alto, poi quello che puoi farci.

- **Reazioni:** toccane una, o **+** per altre. Appare sotto il messaggio su entrambi i telefoni, la tua illuminata;
  toccala di nuovo per ritirarla. Ognuno di voi ha una reazione per messaggio. Parte subito, o per niente: quando né il
  relay né il suo telefono vicino possono prenderla, non cambia nulla.
- **Rispondi:** il tuo prossimo messaggio gli risponde, e lo mostra citato sopra le tue parole, su entrambi i
  telefoni. Tocca la citazione per andare al messaggio a cui risponde; **✕** la toglie. Un Erevos di prima di questa
  funzione mostra la risposta senza la citazione.
- **Rispondi nel thread:** gli risponde in un thread, come in un gruppo: il thread si vede da solo, con **Thread** in
  alto, e quello che invii lì gli risponde. Sotto un messaggio con risposte, **n risposte nel thread** lo apre;
  Indietro mostra di nuovo tutta la chat. Un Erevos precedente mostra ogni risposta con la sua citazione.
- **Inoltra:** ne invia una copia a un’altra chat: scegli un contatto, o un gruppo. Le sue parole, il suo sticker o il
  suo luogo partono da capo, un sondaggio come uno nuovo ancora senza risposte, e il suono di un messaggio vocale o i
  byte di una foto o di un file vengono inviati di nuovo, crittografati con una chiave nuova, così niente collega la
  copia al messaggio da cui viene. La copia dice **Inoltrato** sotto, non da dove; un Erevos di prima di questa
  funzione la mostra senza. Un messaggio effimero
  non viene inoltrato, e dalle chat nascoste un messaggio va solo alle stesse chat nascoste.
- **Importante:** lo segna come importante, solo su questo telefono, per ritrovarlo: **Messaggi importanti** nel menu
  della schermata principale li elenca da tutte le tue chat, e i dettagli di una chat elencano i suoi. Un tocco va al
  messaggio. I messaggi importanti delle chat nascoste appaiono solo nei dettagli delle loro chat.{~ }{+Le chat su Matrix,
  XMPP e Nostr, e le}{-{~Le}}{~ conversazioni SMS}{+,}{~ hanno anch’esse **Importante**, conservato cifrato solo su questo telefono: i
  **Messaggi importanti** di una chat elencano i suoi, e quelli della schermata principale li elencano con tutti gli
  altri, ognuno aprendo la sua chat al messaggio. In quelle chat, tenendo premuti una foto, un video, un messaggio
  vocale, un file o l’immagine di un MMS trovi anche **Salva nella Raccolta**, e tenendo premuti uno sticker o una
  foto arrivati trovi **Aggiungi ai miei sticker**; la scelta degli sticker negli SMS offre anche i tuoi, da inviare
  come MMS.}
- **Fissa:** lo fissa in cima alla chat, su entrambi i telefoni; ognuno di voi può usare **Non fissare più**. Con più di
  uno fissato, si vede l’ultimo; toccalo per andarci, e appare il successivo.
- **Copia:** mette le sue parole negli appunti, da incollare in un’altra app. Su Android la copia è segnata come
  privata, così l’avviso del telefono non mostra le parole, ma qualsiasi app che legge gli appunti può leggerle.
- **Seleziona:** sceglie questo messaggio, e un tocco su altri li aggiunge; una barra offre allora **Copia**, che mette
  tutte le loro parole in un solo testo con l’ora e l’autore di ciascuno, **Inoltra**, che li invia a una chat, ed
  **Elimina**, che chiede una volta prima di eliminarli. **Indietro** smette di scegliere.
- **Modifica:** per un tuo messaggio, fino a un giorno dopo averlo inviato. Le sue parole vanno nel campo sotto
  **Modifica messaggio**: cambiale e invia, o **✕** per lasciarlo com’era. Entrambi i telefoni mostrano le nuove
  parole, con **Modificato** accanto all’ora. Si modificano solo le parole, non uno sticker, un luogo, un sondaggio, un
  messaggio vocale, una foto o un file, né parole che hai inoltrato. Uno che aspetta ancora di partire parte con le
  nuove parole, senza segno; uno inviato per dopo non si modifica. La modifica parte subito, o per niente, come una
  reazione, e la mostrano anche i tuoi dispositivi collegati. Un Erevos di prima di questa funzione tiene le vecchie
  parole.
  **Perché:** un giorno è tempo sufficiente per correggere un errore, e nessuno può cambiare quello che ha detto giorni
  fa. Il segno mostra che le parole non sono le prime.
- **Termina il sondaggio:** per un sondaggio tuo: non contano più voti e si vedono i risultati finali. Un Erevos di
  prima di questa funzione lo vede ancora aperto, e un voto inviato in quel momento può contare solo su alcuni telefoni.
- **Elimina:** su questo telefono, o su entrambi, come sopra.

Reazioni, risposte, messaggi fissati e modifiche viaggiano dentro la crittografia, come i messaggi.

### Come appaiono le parole

I segni scritti attorno alle parole cambiano come appaiono, nelle chat e nei gruppi, come in WhatsApp e Signal:
\`*grassetto*\`, \`_corsivo_\`, \`~barrato~\`, una parola tra apici inversi come codice (tre apici inversi attorno a
righe per un blocco di codice) e \`||parole||\`, nascoste dietro una barra grigia finché non le tocchi, sullo schermo,
nella riga della schermata principale e in una citazione (lì come ▒▒▒).

- **Solo attorno a parole:** un segno conta quando inizia una parola e ne finisce una, quindi \`2*3*4\`,
  \`snake_case\` e gli indirizzi web restano come sono. Grassetto, corsivo e barrato restano su una riga.
- **Gli altri vedono i segni:** un Erevos di prima e altre app mostrano le parole con i loro segni, come scritti.
- **Foto nascosta:** sotto **+**, **Foto nascosta** invia una foto che in chat appare sfocata, nelle chat con i contatti
  e nei gruppi, finché non la tocchi, e poi si apre da sola. Anche in **Media, link e file** appare sfocata. Un Erevos
  di prima la mostra come una foto qualsiasi.
- **Foto da vedere una volta:** sotto **+**, **Foto da vedere una volta** invia una foto che non appare mai in chat,
  nelle chat con i contatti e nei gruppi. **Fotocamera, da vedere una volta** ne invia allo stesso modo una che scatti
  sul momento. Chi la riceve la tocca e la vede una volta, da sola, senza screenshot dove il telefono lo consente;
  quando si chiude, Erevos la elimina dal suo telefono, e la chat dice **Foto vista una volta**. Non si può inoltrare{~,
  salvare o mettere nella Raccolta| o salvare}, e il tuo telefono la elimina appena è arrivata. Nulla ferma una fotocamera puntata
  sullo schermo, e un Erevos precedente la mostra come foto nascosta.

**Perché:** un segno scritto nelle parole viaggia in esse, dentro la crittografia, senza niente accanto che lo
distingua.

### Messaggi effimeri

Apri una chat, tocca il suo nome e poi **Messaggi effimeri** per scegliere quanto durano i suoi nuovi messaggi una
volta letti: 5 minuti, 1 ora,
1 giorno o 1 settimana. Per far scomparire solo il prossimo messaggio, tocca il cronometro accanto al campo del
messaggio (o **Messaggio effimero** sotto **+**, o **Effimero** nel menu della freccia di invio): **Scompare 1 ora dopo
la lettura** appare sopra il campo. Tocca l’ora per sceglierne un’altra, o **✕** per disattivarlo. Va con il prossimo
messaggio che invii: parole, un messaggio vocale, una foto o un file, uno sticker, un luogo o un sondaggio, ora o più
tardi.{~ Un SMS non può scomparire: inviato come SMS, resta su entrambi i telefoni (Erevos lo dice prima), e il
cronometro si disattiva di nuovo.} Il suo tempo inizia quando l’altro telefono lo mostra sullo schermo, e la tua copia
inizia quando il suo telefono lo dice
(**✓✓✓**). Ogni messaggio dice quando scompare. L’altro telefono conosce l’impostazione della chat la prossima volta
che controlla il relay, ed entrambi i telefoni possono cambiarla: vince la modifica più recente. I messaggi già nella
chat restano.

- **Finché non viene letto** un messaggio effimero resta su entrambi i telefoni, sigillato come il resto. Se il suo
  {=Erevos} non dice mai di averlo letto, la tua copia resta.
- **Mentre Erevos è chiuso:** un messaggio il cui tempo è scaduto viene eliminato alla prossima apertura della chat.
  Fino ad allora resta sul telefono, sigillato come il resto.
- **Non è una garanzia:** il suo {=Erevos} li elimina, ma un’app modificata, uno screenshot o una copia possono comunque
  conservarli.

### Blocca gli screenshot

Apri una chat, tocca il suo nome e poi **Blocca gli screenshot**: su Android, nessuno dei due telefoni può fare uno screenshot o una registrazione dello schermo della chat mentre si vede, e le app recenti la mostrano vuota. L’altro telefono lo scopre con il tuo prossimo messaggio, e ognuno dei due può disattivarlo di nuovo: vale la modifica più recente. La chat lo dice quando l’altra persona lo cambia.

**Perché:** ciò che scrivi resta tra voi due, a meno che qualcuno non voglia copiarlo apposta.

- **Solo su Android:** {=Erevos} su un iPhone, su un computer, in un browser o su Sailfish non può bloccare gli screenshot, e lì la chat lo dice.
- **Non è una garanzia:** una foto dello schermo fatta con un’altra fotocamera, o un’app modificata, la conserva comunque.

### Notifiche di questa chat

Su Android, apri una chat, tocca il suo nome e poi **Notifiche**; in un gruppo, tocca il suo nome (in un gruppo
pubblico, **⋯**) e poi **Notifiche**. **In silenzio** per 8 ore, 1 settimana o **Sempre**: i suoi messaggi non suonano e
non mostrano notifiche, quindi neanche l’icona di Erevos li conta; la lista li mostra comunque, con una campanella
barrata, e le sue chiamate suonano comunque. **Suono dei messaggi** e **Suoneria** le danno un suono proprio per i suoi
messaggi e per le sue chiamate, dall’elenco di suoni di Android stesso, o **Senza suono**. Nei dettagli di una chat la
riga dice allora **In silenzio fino a** e l’ora, o **Suoni propri**.

**Perché:** una chat in silenzio conta comunque nella lista, così niente di ciò che è arrivato va perso: solo il
telefono smette di chiamarti lì. I suoi suoni restano solo su questo telefono, con la chat nei dati cifrati dello
spazio, perché ogni telefono ha i suoi suoni: un dispositivo collegato tiene i suoi, e l’altro telefono non ne sa
niente.

- **Nelle chat nascoste** c’è solo **In silenzio**: un suono proprio direbbe a chiunque sia vicino di quale chat si
  tratta.{+ Lo stesso vale per le chat degli account Matrix, XMPP e Nostr di un posto nascosto: in silenzio, non dicono
  nulla, nemmeno «New message».}
- **Uno spazio chiuso, e le chat nascoste finché sono chiuse,** non sanno in quale chat è arrivato un messaggio, quindi
  lo segnalano come dicono le impostazioni dell’app.
- **Solo su Android** per ora: la web app segnala ogni chat come dicono le sue impostazioni.

### Messaggi vocali

Nella chat di un contatto, senza niente di scritto, tieni premuto il microfono alla fine della barra dei messaggi
mentre parli, e lascia per inviare; scorri a sinistra prima di lasciare per scartarlo invece. Una pressione di meno di
un secondo viene presa per uno sbaglio e non invia nulla. Dopo un minuto si invia da solo. La prima volta, Android
chiede se Erevos può usare il microfono: registra solo mentre lo tieni premuto. Con TalkBack, toccalo una volta per
iniziare e di nuovo per inviare. Tocca un messaggio vocale per riprodurlo, e toccalo di nuovo per fermarlo. I messaggi
vocali hanno gli stessi segni degli altri, e seguono l’impostazione dei messaggi effimeri della chat.

**Cambia la mia voce:** nei dettagli della chat con un contatto, **Cambia la mia voce** invia i tuoi messaggi vocali
in quella chat **Più grave** o **Più acuta**, della stessa durata. Il telefono cambia il suono prima che il messaggio
parta, quindi la tua voce non lo lascia mai; se il cambio non riesce, il messaggio non viene inviato. Solo il tuo
telefono conosce l’impostazione. Rende la tua voce difficile da riconoscere a orecchio, ma chi ha la registrazione e
tempo potrebbe annullarne una parte. Su Android 10 e successivi, e nei browser che creano Opus da sé (WebCodecs); il
walkie-talkie mantiene la tua voce.

**In parole:** tieni premuto un messaggio vocale, nella chat di un contatto o in un gruppo, e scegli **In parole**: il
telefono scrive ciò che è stato detto, da leggere o copiare. La prima volta scarica un modello vocale di 268 MB,
quando lo dici tu, dal server di Erevos stesso, che vede il tuo indirizzo come per ogni download; poi tutto avviene
sul tuo telefono, e né il suono né le sue parole lo lasciano. Capisce circa cento lingue, tra cui il greco, e
riconosce quella parlata. Può sbagliare, e le parole non vengono conservate. **Elimina il modello vocale**, sotto,
libera lo spazio. Solo su Android, e serve un telefono con circa 2 GB di memoria libera, perché mentre scrive ne
occupa circa 1,5 GB; se non riesce, il tentativo successivo riapre il modello. Dove nessuno parla, nel silenzio o nel
rumore, non scrive nulla, invece di parole che nessuno ha detto.

**Parla per scrivere:** tocca il microfono accanto al campo del messaggio, in una chat o in un gruppo, e scegli **Parla per scrivere**: da allora, tenendo premuto il microfono ascolta invece di registrare un messaggio vocale, finché non scegli **Messaggio vocale** nello stesso menu. Parla; tocca **Fatto**, e le tue parole vengono scritte nel campo, da cambiare prima di inviarle. Usa lo
stesso modello vocale di **In parole**, scaricato una volta quando lo dici, e tutto avviene sul tuo telefono: né la
tua voce né le sue parole lo lasciano, e il suono non viene conservato. Ascolta fino a due minuti e può sbagliare.
Solo su Android.

**Traduci:** tieni premuto un messaggio, nella chat di un contatto o in un gruppo, e scegli **Traduci**: il telefono lo
traduce nella tua lingua, da leggere o copiare, tra greco, inglese, tedesco, spagnolo, francese e italiano. Indovina
la lingua del messaggio; tocca un’altra sotto **Da** o **In** per cambiare l’una o l’altra. La prima volta per una
lingua scarica i suoi modelli di traduzione, da 60 a 95 MB ciascuno, quando lo dici, dal server di Erevos, che vede il
tuo indirizzo come per ogni download; due lingue nessuna delle quali è l’inglese passano per l’inglese, con un modello
per ciascuna. Poi tutto avviene sul telefono, e né il messaggio né la sua traduzione lo lasciano. I modelli sono
OPUS-MT, dell’Università di Helsinki (CC-BY 4.0). Può sbagliare, e la traduzione non viene conservata. **Elimina i
modelli di traduzione**, sotto, libera lo spazio. Solo su Android.

**Perché:** su Android 10 e successivi, nell’app web e su un computer, un messaggio vocale è Opus a 32 kbit/s, circa 240
KB al minuto, come li inviano Telegram, Element e Conversations: il massimo di chiarezza utile per la voce. Su Android 9
e precedenti, e in Safari prima di iOS 18.4 e macOS 15.4, è AAC a 64 kbit/s, circa 480 KB al minuto. Di più non si
sentirebbe in una voce, ma sarebbe più lento da inviare, soprattutto via Bluetooth. Ogni Erevos li riproduce entrambi:
Safari prima della 18.4 riproduce l’Opus quando Erevos lo riconfeziona per lui, e dove un browser non può riprodurne
uno, Erevos lo dice.

- **Tramite il relay, o da vicino,** crittografati end-to-end come le parole, in più pezzi. Nessuno nel mezzo può
  ascoltarli, ma dai pezzi il relay, o chi ascolta da vicino, può capire che è stato inviato qualcosa di lungo, e più o
  meno quanto. Da vicino vanno solo al telefono di un contatto che si sa essere vicino.
- **Sul telefono** ogni suono è conservato in un file tutto suo, sigillato con una sua chiave, che solo la cronologia
  sigillata della chat contiene. Quando il messaggio se ne va, eliminato, scomparso o perché il più vecchio, se ne va
  anche il suo file. Quanti di questi file ci sono, e le loro dimensioni, mostrano più o meno quanti messaggi vocali
  conserva il telefono, in tutti i suoi spazi insieme, non in quale.
- **Mentre viene riprodotto** il suono è dissigillato nella cache di Erevos, ed eliminato appena si ferma. Se Erevos
  viene chiuso mentre registra o riproduce, quello che è rimasto se ne va la prossima volta che si apre una chat.

### Foto e file

Nella chat di un contatto, tocca **+** accanto al campo del messaggio, che si apre dove c’era la tastiera, poi **Foto**
per sceglierne una dalle foto del telefono, **Fotocamera** per scattarne una, o **File** per qualsiasi altra cosa, fino
a 100 MB. Sotto di essi, **Qualità della foto** imposta come partono le foto, ed
Erevos se lo ricorda:

- **Originale** (l’impostazione predefinita): la foto esattamente com’era, a dimensione piena, senza perdita di
  qualità. Viene tolto solo quello che dice oltre all’immagine: dove è stata scattata, il telefono, l’ora, le
  miniature. Il suo nome è semplicemente «photo».
  Anche una foto inviata con **File** (JPEG, PNG, GIF o WebP, fino a 64 MB) parte senza tutto questo, con il suo nome;
  per un file HEIC o AVIF, o più grande, Erevos chiede prima, perché non può toglierli.
- **90%** e **75%:** una foto nuova, più piccola, più veloce da inviare, che non dice nient’altro che la sua immagine.

Le sue foto e i suoi file fino a 16 MB arrivano da soli; tocca uno più grande per prenderlo. Tocca una foto per
vederla a tutto schermo, con le sue dimensioni: due dita o un doppio tocco la ingrandiscono, un dito la sposta mentre
è ingrandita, e un tocco nasconde o mostra ciò che ha intorno. Tocca un file per salvarlo. Erevos ruota con il
telefono finché la sua **Rotazione automatica** è attiva, e una foto mostrata da sola ruota anche quando è
disattivata. **Salva** mette una copia in una cartella che scegli la prima volta, e **Salva in un’altra cartella** la
cambia. Foto e file hanno gli stessi segni degli altri messaggi, e seguono l’impostazione dei messaggi effimeri della
chat.

- **Apri con un’altra app:** un file che non è una foto ha anche **Apri**, su Android: l’app del telefono per il suo
  tipo, un lettore PDF per esempio, lo legge dalla memoria di Erevos, senza che resti una copia sul telefono, e il
  collegamento viene lasciato quando si apre il file successivo o lo spazio si blocca. Erevos chiede prima, perché
  quell’app è fuori da Erevos e dalla sua cifratura, e non apre mai così pagine web, disegni o pacchetti di app, che
  potrebbero andare su internet fuori da Tor: salvali invece.
- **Come viaggiano:** ogni file viene crittografato sul telefono con una chiave tutta sua, in pezzi tutti della stessa
  dimensione, e messo sul tuo relay. Al contatto vanno solo dove sono i pezzi e la chiave, crittografati end-to-end. Il
  suo telefono prende i pezzi tramite il suo relay, così il tuo relay non vede mai l’indirizzo del suo telefono,
  controlla ogni pezzo, e poi li elimina dal relay. I pezzi che nessuno prende vengono eliminati dopo 14 giorni.
- **Che cosa vede il relay:** quanti pezzi ci sono e la loro dimensione, quindi più o meno quanto è grande il file, e
  quando. Non che cosa sia o per chi.
- **Un file parte così com’è,** con qualsiasi cosa dica al suo interno: l’autore di un documento, o il luogo e il
  telefono di una foto se la invii con **File**. Invia le foto con **Foto**.
- **Sul telefono** ogni file è conservato nei suoi pezzi, come hanno viaggiato, sigillato con una sua chiave, che solo
  la cronologia sigillata della chat contiene. Quando il messaggio se ne va, se ne vanno anche i suoi pezzi. Quanti
  pezzi ci sono mostra più o meno quanto conserva il telefono, in tutti i suoi spazi insieme, non in quale. Una foto
  viene mostrata dalla memoria, mai scritta dissigillata. Il selettore di foto del telefono consegna una copia nella
  cache di Erevos, eliminata appena letta, e una foto scattata qui non viene conservata tra le foto del telefono.
- **Le foto e i file salvati** sono fuori da Erevos, non sigillati: chiunque abbia il telefono può aprirli.
- **Solo tramite il relay:** i file hanno bisogno del suo archivio di file, anche quando il contatto è vicino. Un relay
  più vecchio di questa versione non può accettare file: aggiornalo.

### Altro sotto +

Sotto **+** c’è altro da inviare oltre a foto e file (anche la faccina alla fine del campo del messaggio apre gli
sticker):

- **Sticker:** uno dei 576 sticker integrati in Erevos, in 24 serie da 24 (tra cui **Lune**, **Cani**, **Grecia**,
  **Parole** e **Golosità**), disegnati da ogni telefono da sé: viaggia solo il loro nome, così non viene mai scaricato
  niente. Un Erevos di prima di questa funzione mostra invece la sua emoji. Tutti tranne le parole e le golosità si
  muovono un po’ per qualche secondo quando arrivano e quando li tocchi, poi stanno fermi; con l’impostazione del
  telefono che riduce le animazioni attiva, restano fermi. Le parole appaiono nella lingua dell’app.
- **Come immagine:** in una chat di un’altra rete che accetta solo immagini, uno sticker integrato parte invece come la
  sua immagine: 512 per 512 con sfondo trasparente, disegnata sul tuo telefono o computer dalle stesse forme, ferma, con
  le parole nella lingua dell’app. Non viene scaricato niente per farla.
- **Miei**, tra gli sticker, contiene quelli che crei dalle foto. **Nuovo sticker da una foto** ne ritaglia uno
  quadrato, lo rimpicciolisce (512 per 512, al massimo circa 100 KB) e tiene solo la sua immagine, niente di dove o con
  che cosa è stata scattata. È conservato sigillato nello spazio, o nelle chat nascoste in cui è stato creato, e appare
  solo lì, fino a 100; tienine premuto uno per eliminarlo. Come il resto, va in un backup, sigillato, e mai agli altri
  dispositivi dell’account. Parte come parte una foto, crittografato end-to-end tramite il relay, segnato come sticker,
  così appare da solo senza nuvoletta; un Erevos di prima di questa funzione lo mostra come foto. Tieni premuto uno
  sticker che qualcuno ti ha inviato e tocca **Aggiungi ai miei sticker** per tenerlo.
- **Posizione** (su Android): invia dove ti trovi, una volta, come luogo. La prima volta, Android chiede se Erevos può
  usare la posizione. Il telefono cerca in tutti i modi che ha insieme: via satellite, quando hai consentito la posizione
  precisa, e con la sua posizione di rete, che su molti telefoni chiede a Google o al produttore del telefono. Si apre
  subito un foglio che dice che sta cercando; al chiuso, dove i satelliti si vedono male, può volerci fino a un minuto. Se
  non arriva niente in tempo, propone il luogo che il telefono ha trovato negli ultimi dieci minuti, dicendo quanto tempo
  fa, oppure dice perché non ne è stato trovato nessuno, con **Riprova** e la schermata del telefono che lo cambia. Erevos
  guarda solo quando tocchi, ti mostra il luogo prima che parta, e non ti segue dopo. Il messaggio contiene solo le
  coordinate, crittografate end-to-end; in Erevos non viene caricata nessuna mappa. **Apri nelle mappe** passa il luogo
  alla tua app di mappe, che potrebbe caricare la sua mappa da internet. Un Erevos di prima di questa funzione mostra le
  coordinate come parole.
- **Scheda contatto:** invia un contatto tra quelli del tuo telefono come scheda, con nome, numeri e indirizzi email,
  crittografati end-to-end. L’altra persona vede la scheda con **Aggiungi ai contatti**; un Erevos di prima di questa
  funzione la mostra come parole. Nelle chat nascoste scegli solo tra i contatti tenuti nel luogo nascosto, mai quelli
  del telefono.
- **Sondaggio:** una domanda con due opzioni o più, fino a 12, e, con **Più di una risposta**, più di una da scegliere.
  Tocca un’opzione per sceglierla, di nuovo per ritirarla; ogni opzione mostra quanti l’hanno scelta, e chi. I voti
  viaggiano dentro la crittografia, come le reazioni. Un Erevos di prima di questa funzione mostra la domanda e le sue
  opzioni come parole, a cui rispondere a parole.
- [~] **Richiesta di pagamento** (chiesta da un’altra app, come Fasouli): un importo e per cosa, come scheda. Chi la riceve
  tocca **Pagato** quando ha pagato, e il tuo telefono lo sa; non si può annullare. Poi **Segna in Fasouli**, su Android,
  la segna incassata lì. Erevos non sposta denaro e non conosce banche: la scheda dice solo cosa è stato chiesto. Solo
  nelle chat con un contatto, mai in quelle nascoste. Un Erevos precedente mostra l’importo come testo.

**Perché:** un pacchetto di sticker scaricato da internet direbbe a un server che questo telefono ha {=Erevos}, quindi gli
sticker sono integrati e viaggiano solo i loro nomi. I tuoi sono elencati in un unico valore sigillato della stessa
dimensione per ogni spazio e posto nascosto, usato o no, così un elenco in uso sembra uno che non lo è: 100 è quanto
contiene. Un luogo si invia solo da Android: su un computer o nella web app, il browser chiederebbe a un servizio
esterno dove si trova.

### Anteprime dei link

Un link in un messaggio è sottolineato, e si apre solo quando lo tocchi e lo confermi. Con **Anteprime dei link**
attivo, nei dettagli di una chat, un link che invii parte con la sua anteprima: mentre lo invii, questo telefono
scarica la pagina e ne prende il titolo, una riga di descrizione e una piccola immagine, che vanno dentro il messaggio,
crittografati end-to-end. Il telefono che lo riceve non scarica nulla: mostra quello che è arrivato. È disattivato
finché non lo attivi, e allora è attivo per tutte le chat dello spazio;
ogni posto di chat nascoste ha un suo interruttore, nei dettagli di una chat lì.

**Perché:** solo il telefono di chi invia scarica la pagina, così il telefono che riceve un link non raggiunge nessun
sito scelto da qualcun altro, e non mostra a quel sito niente di sé, nemmeno il suo indirizzo.

- **Il sito vede l’indirizzo internet di questo telefono**, e quando, come lo vedrebbe da un browser, ma non per chi è
  il messaggio. Con **Tramite Tor** attivo, nelle **Anteprime dei link**, la pagina e la sua immagine vengono
  scaricate solo tramite Tor, qualunque sia l’impostazione Tor dello spazio, quindi il sito non vede l’indirizzo. È
  più lento e aspetta mentre Tor si avvia; una pagina che ti manda altrove, o che non fa entrare Tor, non ha
  anteprima. Mentre tutto nello spazio passa da Tor (**Tutto** in Tor), le anteprime si creano solo con **Tramite
  Tor** attivo.
- {=Erevos} su un computer non ne crea, ma mostra lo stesso quelle che arrivano.
- **Via LoRa**, che trasmette poco, un messaggio parte senza la sua anteprima piuttosto che aspettare, e qui non ne
  tiene nessuna.
- Un’anteprima è quello che la pagina dice di sé, vero o no. Un Erevos di prima di questa funzione mostra il link senza.

### Chiamate vocali e videochiamate

Nella chat di un contatto, tocca la cornetta verde in alto per una chiamata vocale, o la videocamera blu accanto per
una videochiamata. La prima volta, Android chiede se
Erevos può usare il microfono, e la fotocamera per il video. Il suo telefono squilla mentre {=Erevos} è aperto lì, su
qualsiasi schermata dello spazio: tocca **Rispondi** o **Rifiuta**. Durante la chiamata puoi disattivare il microfono,
cambiare l’altoparlante, spegnere la tua fotocamera, passare dalla fotocamera anteriore a quella posteriore, e
**Chiudi**. Ogni chiamata lascia una riga nella chat, come quanto è durata, o
una chiamata persa.

- **Rispondere con video o solo con la voce:** una chiamata che squilla offre **Rispondi**, solo con la voce, e
  **Rispondi con video**, nelle chiamate di Erevos{+ e in quelle di XMPP e Matrix}; in una chiamata di gruppo sono
  **Partecipa** e **Partecipa con video**. Una videochiamata a cui rispondi solo con la voce inizia con la fotocamera
  spenta.
- **Dove va il suono** (Android): con cuffie Bluetooth o con filo collegate, **Altoparlante** diventa **Uscita audio**:
  mostra dove va ora il suono, **Telefono**, **Altoparlante**, **Cuffie** o **Bluetooth**, e un tocco li elenca tutti, le
  cuffie Bluetooth con il loro nome, per scegliere. Delle cuffie collegate all’inizio della chiamata, o durante, prendono
  il suono, come in una telefonata, e accendere la fotocamera lo lascia lì; quando si scollegano, il suono torna al
  telefono, o all’altoparlante in una videochiamata.
- **Attivare la fotocamera dopo:** **Attiva fotocamera**, nella schermata della chiamata, funziona quando l’app
  dell’altra parte può cambiare una chiamata mentre è in corso; una chiamata di gruppo resta come vi sei entrato.
- **Aggiungere il video a una chiamata vocale:** in una chiamata vocale di Erevos, **Aggiungi video** accende la tua
  fotocamera quando l’altra persona dice sì; se dice no, la chiamata resta vocale.
- **La tua immagine:** in una videochiamata la tua fotocamera riempie lo schermo finché non arriva l’immagine
  dell’altro; poi passa in una piccola finestra nell’angolo in alto, su entrambi i telefoni, così ognuno vede l’altro
  e sé stesso.
- **Cambiare fotocamera:** **Gira** passa alla fotocamera successiva. Su un computer compare solo se c’è più di una
  fotocamera.
- **Come si collega la chiamata:** tieni premuto per un momento lo schermo della chiamata per vedere quanto audio
  dell'altro si è perso o è stato ricostruito, che si sente come vuoti, quante volte è successo, il tempo di andata e
  ritorno, il percorso della chiamata e quanto ci ha messo a squillare e a collegarsi. Un tocco lo chiude. Si misura solo
  sul tuo telefono e aiuta a capire perché una chiamata si sente male.

**Una chiamata a un telefono che la riceve in ritardo:** quando il suo telefono riceve la tua chiamata tardi, per
esempio perché legge tramite Tor, **Chiamata in corso…** resta visibile fino a un minuto e un quarto, e appena squilla
là, squilla per 45 secondi da quel momento, così una chiamata arrivata in ritardo non squilla sul suo telefono solo
per fermarsi subito. Il suo telefono legge inoltre una chiamata prima di tutto ciò che ha da inviare, e dopo un cambio
di rete (dal Wi-Fi ai dati mobili) torna subito ad aspettare chiamate.

**Una normale chiamata sulla rete mobile:** quando un contatto ha il suo numero di telefono collegato, o è collegato a
uno dei tuoi contatti con un numero (**Collega a uno dei miei contatti** nella sua chat, prima un numero di cellulare),
il tastierino arancione in cima alla sua chat, prima della videocamera, apre un tastierino con quel numero già
scritto{~, e lo stesso fa quello in cima a una conversazione SMS}. È {~il **Telefono** di Erevos quando Erevos è l’app
Telefono, altrimenti |}quello del telefono: tocca lì il tasto di chiamata. Una chiamata del genere
passa dalla rete dell’operatore telefonico e non è crittografata{~, come non lo è un SMS normale}. Le chat nascoste e i
computer non ce l’hanno.

- **Crittografata end-to-end:** la chiamata si avvia con messaggi tramite il relay, crittografati come gli altri.
  Questi portano la chiave che crittografa la chiamata stessa, così nessuno nel mezzo può ascoltare, nemmeno il relay
  per le chiamate qui sotto.
- **Tramite il relay per le chiamate:** un relay configurato con il kit in \`deploy/relay\` ha accanto un relay per
  le chiamate. La chiamata passa da lì, così nessuno dei due telefoni conosce l’indirizzo IP dell’altro. Via Wi-Fi o
  dati mobili, ovunque.
- **Senza un relay per le chiamate** (un relay sul tuo computer, per esempio), Erevos prima chiede: la chiamata va
  allora direttamente tra i telefoni, funziona solo sulla stessa rete Wi-Fi, e ogni telefono vi vede l’indirizzo
  dell’altro.
- **Senza internet:** sulla stessa rete Wi-Fi, sull’hotspot di un telefono, o sulla rete Wi-Fi che due telefoni creano
  (Wi-Fi Direct), con uno spazio aperto su entrambi, una chiamata non ha bisogno di nessun relay: si avvia tramite il
  collegamento da vicino e va direttamente tra i telefoni (o i computer). Lo stesso vale per i messaggi di gruppo
  e le chiamate di gruppo.
- **In background (Android):** mentre uno spazio è aperto, Erevos continua a funzionare quando lo lasci, con Home, con
  Indietro nella sua prima schermata o togliendolo dalle app recenti, con una notifica silenziosa, «Erevos – Ready for
  calls and messages», che non appare sulla schermata di blocco. Resta in ascolto sul relay e sui collegamenti con i
  telefoni vicini, così i messaggi arrivano: una notifica dice solo «New message», o quanti ne sono arrivati, e a
  telefono bloccato solo «Erevos». Una richiesta di messaggio, da qualcuno che ha solo il tuo link di contatto, fa la
  stessa notifica e lo stesso suono, e conta sull’icona, come qualsiasi messaggio. Una chiamata squilla con la suoneria
  del telefono e una notifica, «Incoming call» (o «Incoming video call») – «Open Erevos to answer», senza nome, anche
  sulla schermata di blocco e sul salvaschermo, e lo schermo si accende. Toccala per rispondere. Con il blocco con
  password attivo, una chiamata che squilla appare prima della password, ed Erevos si blocca appena finisce. Da
  bloccato, lo spazio continua dietro la schermata della password, quindi messaggi e chiamate arrivano comunque, e una
  chiamata appare sopra la schermata della password. Solo le chat e i gruppi di quello spazio arrivano così, e le chat
  nascoste con **Ricevere da chiuse** attivo; le altre chat nascoste dicono solo che è arrivato un messaggio, o
  squillano senza nome, se lo permetti (vedi Chat nascoste). Impostalo in **Impostazioni** → **Notifiche** → **In
  background**: **Ricevi e squilla** (l’impostazione predefinita) o **Solo mentre Erevos è visibile**, e **Avvisa dei
  nuovi messaggi** (l’impostazione predefinita) o **Nessun avviso**, che vale anche mentre Erevos è visibile. Anche lì,
  se Android li chiede, **Continua anche col risparmio batteria** e **Mostra le chiamate sulla schermata di
  blocco**. Sotto, **Solo lo spreco** (predefinito), **E i telefoni vicini** e **E il sonno** stabiliscono quanta batteria risparmia in secondo piano: la seconda spegne anche le radio per i telefoni vicini finché Erevos è in secondo piano, la terza lascia dormire anche il telefono, così Erevos guarda il relay circa una volta al minuto e un messaggio o una chiamata può arrivare con uno o due minuti di ritardo.
- **E il sonno leggero:** una quarta scelta lì, tra **E i telefoni vicini** ed **E il sonno**. Il telefono può dormire, ma Erevos lascia aperta la sua attesa al relay, così ciò che arriva sveglia il telefono e un messaggio o una chiamata arriva ancora subito dove la rete e Android lo consentono; Erevos guarda anche da solo ogni pochi minuti. È nuova e non ancora provata su molti telefoni: se con essa i messaggi arrivano in ritardo, scegline un’altra.
- **Il numero sull’icona:** con **Avvisa dei nuovi messaggi** attivo, quando esci da Erevos con messaggi non letti
  nelle chat e nei gruppi dello spazio aperto, la notifica resta, senza suono, e dice quanti sono, con quelli che
  segnala dopo; se ne va mentre Erevos è visibile, e torna quando lo lasci, finché non li hai letti. Non conta i
  messaggi di una chat in silenzio (vedi Notifiche di questa chat), né quelli di una chat nascosta quando esci. Il
  launcher di Android la mostra sull’icona di Erevos, come numero o, su alcuni telefoni come i Pixel, come punto.
  **Impostazioni** → **Notifiche** → **Numero sull’icona** lo disattiva: allora la notifica parla solo di ciò che è
  arrivato dall’ultima volta che avevi Erevos aperto, e il numero del launcher se ne va con lei. Un messaggio eliminato
  per tutti prima che tu lo legga, o letto su un computer collegato, non conta più.

  **Perché:** su Android solo una notifica può mettere un numero sull’icona di un’app, quindi la notifica resta finché
  ci sono messaggi in attesa; non dice più di quanti sono, come ha sempre fatto.
- **Uno spazio chiuso:** non riceve nulla, perché la sua chiave è in memoria solo mentre è aperto: i suoi messaggi
  aspettano sul suo relay e arrivano quando lo apri. A meno che tu non scelga, in quello spazio, **Anche mentre è aperto
  un altro spazio** in **Impostazioni** → **Notifiche** → **In background** (l’impostazione predefinita è **Questo
  spazio solo quando è aperto**): allora, mentre un altro spazio è aperto e riceve, dice solo «New message», o quanti ne
  sono arrivati, con la stessa notifica di quello spazio, mai quale spazio, e le sue chat nascoste non dicono nulla.
  Quello che altri telefoni hanno portato al suo relay conta come messaggio, anche le eliminazioni, e un messaggio
  inviatogli senza suono suona come al solito (vedi **Invia senza suono**). Per
  questo il telefono conserva gli indirizzi delle sue code sul suo relay fuori dalla sua password, tra cui quella in cui
  scrive ciascuno dei suoi contatti, fino a 64 contatti, mai le sue chiavi, chi sono i suoi contatti o i messaggi, e
  chiede al relay solo quanti ne sono arrivati, mai i messaggi stessi: restano lì finché lo spazio non si apre. A uno
  spazio che passa da Tor (**Messaggi** o **Tutto**, in **Cosa passa da Tor**) si chiede solo
  tramite Tor: mentre lo spazio aperto ha Tor disattivato, o il suo Tor si sta avviando o ha appena fallito, lo spazio
  chiuso non dice nulla, e quello che è arrivato viene detto appena lì Tor è pronto.

  **Perché:** uno spazio dietro una seconda password non deve mostrare di esistere, quindi questo è disattivato finché
  non lo attivi, e allora non dice più di quanto direbbe lo spazio aperto. Se gli si chiedesse direttamente dal
  telefono mentre un altro spazio è aperto, il suo relay o qualcuno che osserva la rete potrebbe collegare i due spazi
  tramite l’indirizzo internet del telefono. Poiché ogni contatto scrive in una coda tutta
  sua, lo spazio deve chiedere anche di ciascuna di esse, altrimenti i loro messaggi non direbbero nulla. Il prezzo è
  che il suo relay potrebbe capire che i due spazi sono su un unico telefono, e qualcuno che esamina il telefono con
  degli strumenti potrebbe scoprire che un secondo spazio conserva lì degli indirizzi, e quanti contatti ha.
- **Un punto per gli altri spazi:** in uno spazio con **Anche mentre è aperto un altro spazio**, **Punto negli altri
  spazi**, sotto (il predefinito è **Nessun punto**), mostra anche un piccolo punto sul lucchetto sopra le chat dello
  spazio aperto, appena è arrivato un messaggio a questo mentre era chiuso, finché non lo apri: mai quanti, né quale
  spazio. Funziona dove funziona la notifica: su Android, finché lo spazio aperto ha **Ricevi e squilla** e **Avvisa
  dei nuovi messaggi** attivi. Per questo il telefono tiene, accanto agli indirizzi sopra, solo se è arrivato un
  messaggio. Chi vede le chat dello spazio aperto vede anche il punto, e può intuire che c’è un altro spazio.
- **Quando il telefono si accende:** dopo l’avvio del telefono, Erevos non funziona finché non lo apri. Con **Avvia
  all’accensione del telefono** in **Impostazioni** → **Notifiche** → **In background** (l’impostazione predefinita è
  **Aspetta che lo apra io**), si avvia da solo dopo l’accensione del telefono, o dopo un aggiornamento di Erevos,
  senza nessuno spazio aperto: nessuno spazio può aprirsi senza la sua password, perché Erevos non conserva nessuna
  chiave sul telefono. Allora gli spazi con **Anche mentre è aperto un altro spazio** dicono già «New message», o
  quanti ne sono arrivati, mai quale spazio, né chi o cosa, e una notifica silenziosa dice «Locked». Le chiamate non
  squillano, e nient’altro arriva, finché non apri uno spazio; gli spazi che passano da Tor non dicono nulla fino ad
  allora. Se non c’è nessuno spazio così, o con **Nessun avviso**, si ferma subito. Solo su Android.

  **Perché:** dopo un riavvio Erevos non poteva dirti che dei messaggi aspettano finché non ti capitava di aprirlo.
  Senza la tua password non può comunque leggerli, quindi non dice più di quanto dice uno spazio chiuso.
- **Dove non può squillare:** fermato da Android (o dal risparmio batteria del telefono, o da un’impostazione del
  produttore del telefono), dopo il riavvio del telefono finché non apri Erevos e lo spazio una volta, in un altro
  spazio (dice solo che è arrivato un messaggio, se lo permetti, come sopra), o su un computer o nella web
  app mentre è chiusa. Lì una chiamata appare come chiamata persa quando Erevos si apre. Quando Android chiude Erevos
  mentre riceve e lo riavvia, come fa di solito, una notifica silenziosa lo dice: apri Erevos e lo spazio per ricevere
  di nuovo. Dopo **Forza interruzione**, con l’utilizzo della batteria impostato su Con restrizioni, o quando lo chiude
  l’impostazione del produttore del telefono, Android non riavvia nulla, quindi nessuna notifica lo dice: la notifica
  «Erevos» semplicemente sparisce, e niente squilla finché non apri Erevos. **Autorizzazioni** (più sotto) lo dice in
  anticipo se una di queste è impostata. Lo stesso fa una,
  «Locked», quando lo spazio che riceveva si chiude (dopo il ripristino di un backup, per esempio) ed Erevos lascia lo
  schermo chiedendo la password. Una richiesta di messaggio non può chiamarti finché
  non la accetti.
- **Autorizzazioni (Android):** **Impostazioni** → **Generali** → **Autorizzazioni** mostra che cosa Android permette a
  Erevos di fare per chiamate e messaggi in background (notifiche, la notifica delle chiamate e il suo comparire in
  primo piano, la notifica dei messaggi, con le sue notifiche «Messages without sound» e «Messages with a chat's own
  sound», che tengono anche il numero sull’icona, le chiamate sulla schermata di blocco, il funzionamento col risparmio
  batteria, il funzionamento in background con l’utilizzo della batteria non impostato su Con restrizioni, la non
  sospensione quando non è usato, i dati mobili in background, il microfono) e per altre cose (il suono per i nuovi
  messaggi, le notifiche sulla schermata di blocco, le chiamate attraverso Non disturbare, la fotocamera, i telefoni
  vicini, i contatti, gli orari esatti per {~gli SMS inviati più tardi e |}i promemoria, la notifica dei promemoria una
  volta arrivato un promemoria), ognuna con il perché e un pulsante che apre la domanda o l’impostazione di Android
  stesso. Dice anche quando il telefono è in silenzioso o in vibrazione, quando è attivo il risparmio energetico, e
  quando Non disturbare è attivo e non lascia passare le chiamate di Erevos. Sui telefoni Huawei, Honor, Xiaomi, OPPO,
  realme, OnePlus, vivo, Samsung e ASUS dice anche dov’è l’impostazione del produttore, che Erevos non può leggere:
  tocca **Fatto** quando è impostata. Dopo ogni nuova versione, e la prima volta, si apre da sola quando chiamate o
  messaggi hanno bisogno di qualcosa. Nella web app mostra che cosa permette il browser, vedi [Su iPhone](#iphone).
- **Una chiamata alla volta.** Una chiamata continua mentre passi da una schermata all’altra dello spazio. Finisce
  quando lo spazio si chiude, e una chiamata nelle chat nascoste quando queste si chiudono, cosa che non fanno durante
  una chiamata. Anche togliere Erevos dalle
  app recenti chiude una chiamata.
- Le chiamate non passano da un telefono vicino o dal Bluetooth. Lì, **Talkie** sotto **+** trasforma la chat in un
  walkie-talkie, e sopra il campo appare **Talkie attivo**: tieni premuto il walkie-talkie alla fine della barra mentre
  parli, lascia, e viene riprodotto sul suo telefono man mano che arriva, se la chat con te è aperta
  lì; altrimenti, aspetta come messaggio vocale. È un messaggio vocale più piccolo (circa 3 KB al secondo), quindi va
  ovunque vada un messaggio, Bluetooth compreso.

**Perché:** le chiavi che aprono i messaggi di uno spazio sono in memoria solo mentre è aperto, e altrimenti sigillate
dietro la sua password. Così dopo il riavvio del telefono non si può leggere nulla e niente squilla finché non apri
Erevos e lo spazio una volta; e le chat nascoste, la cui chiave è in memoria solo mentre sono aperte a meno che
**Ricevere da chiuse** non la tenga con lo spazio, altrimenti dicono solo che è arrivato un messaggio, o squillano senza
nome, se lo permetti.

> Le impostazioni del relay, la tua coda, i tuoi contatti e i loro nomi, le chiavi delle tue conversazioni e i
> messaggi sono conservati in questo spazio, sigillati. La cronologia non ha limiti: è conservata in pagine sigillate
> della stessa dimensione, mescolate con le pagine degli altri spazi e delle chat nascoste, quindi si vede solo quanto
> occupano tutte insieme, non di chi sono. Il resto è conservato della stessa dimensione per ogni spazio e per le chat
> nascoste, usati o no; quello che è più grande va in pagine come quelle della cronologia, in mezzo a loro. I messaggi
> eliminati possono restare per un po’ nella memoria del telefono, sigillati come il resto, finché qualcosa non viene
> scritto sopra di loro. I messaggi inviati o ricevuti da vicino sono conservati allo stesso modo.

## Chat di gruppo {#groups}

Dal menu della schermata principale, **Nuovo gruppo**: dagli un nome, spunta i contatti da invitare, e tocca **Crea il
gruppo**. Ne sei l’admin. Il telefono di ogni contatto risponde da solo la prossima volta che vi si apre {=Erevos}, ed
entra: il gruppo appare allora nella sua schermata principale, con un avviso di chi l’ha aggiunto. Un telefono entra
solo in un gruppo il cui admin è il contatto che gliel’ha chiesto, e un admin fa entrare un contatto solo come se
stesso, mai come qualcun altro. I gruppi passano dal relay, quindi deve essere impostato.

**Perché:** solo il telefono dell’admin cambia il gruppo (chi ne fa parte, il suo nome), così nessun server deve
mettere in ordine le modifiche: ogni telefono le prende da quello. Per questo un membro esce chiedendolo all’admin, e
solo l’admin aggiunge o rimuove membri.

- **Chi si può invitare:** i contatti che hai accettato, in questo spazio. I membri che non sono contatti tra loro
  parlano comunque nel gruppo, e appaiono con l’inizio della loro chiave.
- **Aggiungi come contatto:** nell’elenco dei membri (**⋯**), **Aggiungi come contatto** sotto un membro che non è un
  tuo contatto gli chiede, in un messaggio che riceve solo lui, il suo link di contatto, e gli dà il tuo. Sul suo
  telefono la richiesta appare una volta, in cima al gruppo, e tocca **Invia** o **Non inviare**; se tocca **Non
  inviare**, non ti viene detto. Appena lo invia siete l’uno contatto dell’altro, con una chat tutta vostra, e **Nome**
  gli dà un nome, come fa sotto ogni contatto che non ne ha ancora uno. Nessuna risposta può voler dire che non ha
  ancora aperto il gruppo, ha detto di no, ha un {=Erevos} più vecchio, o ti ha ancora come contatto, cosa che non gli
  mostra nulla; dopo una settimana puoi chiedere di nuovo. Appena siete l’uno contatto dell’altro, in qualsiasi gruppo
  o con un link di contatto, quello che era stato chiesto negli altri vostri gruppi se ne va, e la sua richiesta non
  appare più. Un membro rimosso dal gruppo non chiede più nulla. Se due membri mostrano la stessa chiave, uno dei due
  non è chi dice di essere, e nessun link di contatto va a nessuno dei due o viene preso da nessuno dei due. Non nei
  gruppi pubblici. La richiesta è per il telefono che ha l’account; **Nome** funziona anche su un dispositivo
  collegato.
- **Crittografato end-to-end per il gruppo:** MLS (RFC 9420). Ogni messaggio viene crittografato una volta per il
  gruppo, poi sigillato di nuovo per ogni membro, così quello che arriva alla coda di ogni membro non somiglia a niente
  di quello che ricevono gli altri, e nessun relay può capire chi fa parte di un gruppo. Va direttamente alla coda di
  ogni membro, tramite il tuo relay. Ogni settimana le chiavi di ogni telefono nel gruppo vengono rinnovate, quelle
  dell’admin da sole e quelle di ogni membro tramite l’admin, così le chiavi prese una volta da un telefono smettono di
  leggere il gruppo.
- **Membri:** tocca il nome del gruppo in alto, o **⋯** accanto. L’admin aggiunge contatti, rimuove membri e rinomina
  il gruppo. Un
  membro rimosso non legge più niente di quello che dice il gruppo da quel momento, e il gruppo resta sul suo telefono,
  in sola lettura, finché non lo elimina.
- **Thread:** tieni premuto un messaggio e scegli **Rispondi nel thread** per rispondergli in un thread, oppure tocca
  **n risposte nel thread** sotto un messaggio per aprirlo. Il thread si vede da solo, e ciò che invii lì gli risponde.
- **Descrizione:** l’admin del gruppo la scrive nel foglio dei membri, sotto **Descrizione**, e tocca **Salva**. Ogni
  membro la legge, anche chi entra dopo. Una modifica di chiunque altro viene ignorata.
- **Uscire:** **Lascia il gruppo** lo chiede all’admin, il cui telefono ti rimuove la prossima volta che vi si apre
  {=Erevos}. Il pulsante dell’admin è **Chiudi il gruppo**: rimuove tutti i membri.
- **Un solo admin:** un gruppo privato ha un admin, chi lo ha creato. **Perché:** le modifiche del gruppo devono
  arrivare in un solo ordine, e con MLS nessun server le mette in ordine, quindi due admin potrebbero cambiare il gruppo
  insieme e dividerlo in due. Un Erevos di prima di questa funzione accetta modifiche solo da chi ha creato il gruppo.
- **Chiamate di gruppo:** la cornetta verde in cima al gruppo avvia una chiamata vocale al suo interno, e la
  videocamera blu accanto una videochiamata (anche **Videochiamata** sotto **⋯**). Mentre ne è in corso una, appare solo
  il suo pulsante, per unirsi. Squilla sui telefoni dei membri dove Erevos è aperto, e chi risponde ne fa parte. Una
  chiamata in corso appare in cima al gruppo, per unirsi più tardi. Fino a otto persone: ogni telefono si collega a
  ciascuno degli altri, tramite il relay per le chiamate, così nessun telefono vede l’indirizzo IP di un altro; senza
  un relay per le chiamate, solo sulla stessa rete Wi-Fi. Crittografata end-to-end tra ogni coppia di telefoni, con le
  loro chiavi inviate nella crittografia del gruppo. In una videochiamata ogni telefono invia la sua immagine a ciascuno
  degli altri, quindi le immagini appaiono per un massimo di quattro persone; con di più, si fermano e il suono
  continua, finché non verrà predisposto un server per videochiamate più grandi. Una chiamata che squilla offre
  **Partecipa** e **Partecipa con video**.
- **Foto, file e messaggi vocali:** **+** accanto al campo invia una foto o un file, come nella chat di un contatto,
  con la stessa **Qualità della foto**; tieni premuto il microfono mentre parli, e lascia per inviare. Ognuno viene
  crittografato con una sua chiave e messo una volta sul tuo relay, e al gruppo vanno solo dove si trova e la sua
  chiave, nella sua crittografia. Il telefono di ogni membro lo prende da lì tramite il suo relay: fino a 16 MB da solo
  mentre il gruppo è aperto, uno più grande quando lo tocca. Tocca una foto per vederla intera, un file per salvarlo, un
  messaggio vocale per riprodurlo.
  - **Il relay lo conserva 14 giorni,** crittografato, perché non può sapere quando ogni membro l’ha preso.
  - **Solo tramite il relay,** anche quando i membri sono vicini.
  - **Un membro che entra dopo** non riceve quello che è arrivato prima, come per le parole. Un membro il cui {=Erevos} è
    di prima di questa versione non ne vede nulla.
  - **Sul telefono** ognuno è conservato nei suoi pezzi, sigillato, come nella chat di un contatto. Eliminare il gruppo
    qui li elimina.
- **Il menu di un messaggio,** tenendolo premuto, come nella chat di un contatto: le reazioni, **Rispondi**,
  **Inoltra**, **Importante**, **Fissa**, **Copia**, **Modifica** ed **Elimina**. Ogni membro ha una reazione per
  messaggio, e un sondaggio mostra chi ha scelto cosa. Un messaggio fissato lo è per tutti, e qualsiasi membro può usare
  **Non fissare più**. **Modifica** dà alle tue parole parole nuove per ogni membro, fino a un giorno dopo l’invio,
  segnate **Modificato**. **Elimina** chiede **Questo telefono** o, per un tuo messaggio, **Per tutti**:
  anche l’Erevos dei membri lo elimina, e una tua foto, un tuo file o un tuo messaggio vocale lascia subito il tuo relay
  invece che dopo 14 giorni. Anche qui **+** ha **Sticker**, **Posizione** e **Sondaggio**. I link sono sottolineati e
  prima di aprirli viene chiesto, e le **Anteprime dei link**, se attive, partono con i tuoi. Nel pannello dei membri, o
  nella schermata di un gruppo pubblico, **Cerca in questa chat** cerca tra i messaggi del gruppo ed **Esporta chat**
  li scrive su file, e **Media, link e file** elenca le foto, i video, i messaggi vocali, la musica, i file e i link del gruppo, ogni tipo a parte, come nella chat di un contatto (vedi sopra), ciascuno con il salto al suo messaggio; anche **Messaggi importanti** e la ricerca della schermata principale includono i gruppi. Un
  membro il cui {=Erevos} è di prima di questa versione vede le parole, l’emoji di uno sticker, le coordinate di un luogo
  e la domanda di un sondaggio, e niente di reazioni, messaggi fissati, modifiche ed eliminazioni. **Seleziona** sceglie
  più messaggi da copiare, inoltrare o eliminare insieme, un sondaggio tuo ha **Termina il sondaggio**, e **+** ha anche
  **Scheda contatto**. **Per tutti** è offerto nell’eliminazione solo se tutto ciò che hai scelto è tuo.
- **Nominare un membro:** scrivi **@** nel campo del messaggio e i membri i cui nomi iniziano con ciò che segue
  compaiono sopra: tocca uno per inserire il suo nome intero. Un membro nominato così viene avvisato del messaggio
  anche se ha silenziato il gruppo. Contano solo i nomi interi, quindi **@Anna** non nomina Anna Maria. Un Erevos di
  prima mostra solo le parole e avvisa come dicono le impostazioni del gruppo.
- **Non ancora:** scrittura in corso e messaggi effimeri nei gruppi, e gruppi tramite un telefono vicino.

## Gruppi pubblici {#public-groups}

Un gruppo pubblico è un gruppo in cui chiunque abbia il suo link, o il suo codice QR, può chiedere di entrare: per un
club, una strada o una classe, dove non tutti sono tuoi contatti. Dal menu della schermata principale, **Gruppi
pubblici**: dagli un nome e il nome con cui ti presenti al suo interno, scegli chi può entrare, e tocca **Crea il
gruppo pubblico**. Ne sei il proprietario. I suoi messaggi sono crittografati end-to-end con MLS e vanno a ogni membro
come in qualsiasi gruppo, e nessun relay sa chi ne fa parte.

- **Il link:** tocca il nome del gruppo in alto per il suo link e il suo codice QR, e **Condividi il link**. Chi lo
  apre, o scansiona il codice con la fotocamera del telefono, sceglie il nome che vede il gruppo e tocca **Chiedi di
  entrare**. Un link si può anche incollare sotto **Entra con un link**. Ogni membro ha il link, e può passarlo ad
  altri.
- **Descrizione:** il proprietario o un admin la scrive nella schermata propria del gruppo, sotto **Descrizione**, e
  tocca **Salva**; tutti nel gruppo la leggono.
- **Entrare mentre non ci sei:** la richiesta aspetta sul tuo relay, sigillata così che solo il tuo telefono la apra,
  finché Erevos non è aperto sul tuo telefono: controlla ogni pochi secondi mentre Erevos è visibile, e circa ogni
  minuto in background. Allora lo fa entrare, e il gruppo appare sul suo telefono.
- **Chi può entrare:** **Chiunque abbia il link**, o **Li accetta un admin**: allora chi chiede aspetta sotto **Chiedono
  di entrare**, finché tu o un admin non toccate **Fai entrare** o **Rifiuta**. È comunque il tuo telefono a farlo
  entrare, appena lo sa.
- **Admin:** in **Membri**, tocca **Modera** accanto a un membro, poi **Rendi admin**. Gli admin silenziano, rimuovono
  ed escludono membri, fanno entrare chi chiede, ed eliminano un messaggio per tutti; solo tu moderi gli admin, e
  nessuno modera te.
  - **Silenzia:** il suo telefono non invia nulla nel gruppo, e nessun telefono mostra comunque quello che il suo
    invia. **Lascia scrivere** lo annulla.
  - **Rimuovi:** non legge più nulla di quello che dice il gruppo da quel momento, e può chiedere di nuovo di entrare
    con il link.
  - **Escludi:** rimosso, e quello che il suo telefono chiede dopo viene rifiutato. **Togli l’esclusione**, sotto
    **Esclusi**, lo annulla. Un’esclusione ferma lo stesso telefono, non qualcuno che torna con una nuova coda sul
    relay: contro questo, scegli **Li accetta un admin**, o cambia il link.
  - **Elimina per tutti:** gli ultimi messaggi sono elencati in fondo; **Elimina** ne toglie uno dal telefono di ogni
    membro. Chi l’ha già letto potrebbe averne tenuto una copia.
- **Cambia il link:** il link e il codice QR condivisi finora smettono subito di funzionare, e ogni membro riceve
  quello nuovo. Le richieste ancora in attesa su quello vecchio vanno perse.
- **Cedi il gruppo:** nel **Modera** di un membro. Da quel momento il gruppo è del suo telefono, che fa entrare le
  persone, quindi il link cambia in uno sul suo relay; tu resti admin. Se perdi il telefono prima di cederlo, nessuno
  potrà più far entrare nessuno, anche se il gruppo continua per chi ne fa parte.
- **Chiudi il gruppo** rimuove tutti i membri. **Lascia il gruppo** di un membro chiede al tuo telefono di rimuoverlo.
- **Un gruppo usa e getta,** per un’occasione: prima di crearlo, in **Finisce**, scegli **Dopo un giorno**, **Dopo 3
  giorni** o **Dopo 7 giorni**. Quando il suo tempo finisce, l’Erevos di ogni membro lo elimina, ciascuno secondo
  l’orologio del proprio telefono, con i suoi messaggi, foto e file, la prossima volta che è aperto, e il suo link
  smette di funzionare. Quando finisce si decide alla creazione del gruppo e non cambia mai. La schermata del gruppo
  stesso dice quando finisce. Un membro con un {=Erevos} più vecchio lo tiene, e fino ad allora chiunque può averne
  tenuto una copia o uno screenshot.
- **Fino a 100 membri,** perché l’intero gruppo deve stare nell’unico messaggio che fa entrare qualcuno.
- **Ogni telefono in un gruppo pubblico ha bisogno di questa versione di {=Erevos}.** I gruppi creati dai contatti
  funzionano come prima.

**Perché:** solo il telefono del proprietario cambia il gruppo e fa entrare le persone, così le modifiche non si
accavallano mai e nessun server deve metterle in ordine. Per questo il gruppo continua senza di lui, ma non entra
nessuno di nuovo: cedilo prima di cambiare telefono.

### Che cosa rivela un gruppo pubblico

> Chiunque abbia il link può leggere il gruppo da quando viene fatto entrare, mai quello che è stato detto prima, e il
> link può essere passato ad altri: cambialo per fermare tutto questo.

- **Il link** mostra il nome del gruppo e l’indirizzo del tuo relay a chiunque lo veda.
- **Ogni membro vede di ogni membro** il nome scelto, una chiave creata solo per questo gruppo, l’indirizzo del suo
  relay e l’ID mittente della sua coda. La chiave non dice niente di chi è nelle sue chat, né di quali altri gruppi fa
  parte. La coda è una su cui leggono solo i suoi gruppi pubblici, non quella del suo link di contatto, la stessa in
  ciascuno dei suoi gruppi pubblici (un Erevos precedente alla 2.0.0 indica quella del suo link di contatto).
- **I nomi sono scelti, non verificati:** chiunque può chiamarsi come vuole. L’inizio della chiave di ogni membro
  appare accanto al nome, e il proprietario e gli admin sono segnalati.
- **Qualsiasi cosa venga detta può essere copiata** da chiunque nel gruppo: la crittografia end-to-end tiene fuori i
  relay, non i membri.
- **I relay** non leggono nulla e non sanno chi fa parte del gruppo. Il tuo vede le richieste arrivare alla porta del
  gruppo, quante e quando, non da chi. I membri possono riempire la coda l’uno dell’altro con cose illeggibili, fino a
  quanto accetta il relay.

## Come Erevos sceglie la strada {#paths}

Quando invii un messaggio, Erevos sceglie la strada da solo:

1. **Il suo telefono è vicino** (in cima alla chat c’è scritto **Vicino**): va tramite il collegamento da vicino, e
   anche tramite il relay quando ce n’è uno.
2. **Altrimenti, con un relay:** va tramite il relay, e un messaggio breve va anche ai telefoni con {=Erevos} collegati da
   vicino, così il suo può rispondere da vicino se è uno di loro. Se il relay non è raggiungibile, conta quella copia, e
   quei telefoni la portano anche al relay del tuo contatto, come in [Chat con un telefono vicino](#nearby).
3. **Altrimenti, senza relay,** va ai telefoni con {=Erevos} collegati da vicino, come in 2.
4. **E via LoRa,** quando è impostata una radio e il relay non ha potuto prendere un testo, come in [Con una radio
   LoRa](#lora). Senza nessuna strada, il messaggio aspetta, segnato **In attesa**, e parte da solo appena ce n’è una,
   come in [Inviato, arrivato e letto](#relay); una riga sotto la chat dice perché.
5. [~] **E via SMS,** per ultimo, quando l’hai attivato per quel contatto e nient’altro ha preso un testo, come in
   [SMS](#sms).

Ogni strada è crittografata end-to-end: nessun relay e nessun telefono nel mezzo può leggere quello che invii.

**Vie**, in **Impostazioni** → **Relay e reti**, mostra ogni via a colpo d’occhio: una scheda per il relay, Nostr, i telefoni vicini, LoRa{~, gli SMS} e Tor, ognuna con com’è ora e una linea sotto, piena quando funziona, tenue quando è attiva ma ora non raggiunge nessuno, e a trattini quando è spenta. Sopra dice quanti tuoi messaggi aspettano di partire, con un punto arancione per ognuno. Una scheda apre le impostazioni della sua via. Mostra solo lo spazio aperto, mai le chat nascoste. Nella schermata principale, la riga sotto la barra in alto è anche **Vie**, una volta impostato un relay: un punto per ogni via, e quanti tuoi messaggi aspettano; un tocco la apre.

| Riga sotto la chat | Cosa fare |
| --- | --- |
| **Inviato da vicino, crittografato end-to-end.** | Niente: il suo telefono è vicino e l’ha ricevuto. |
| **Inviato tramite il relay, crittografato end-to-end.** | Niente: è in viaggio. |
| **Inviato ai telefoni con {=Erevos} vicini, crittografato end-to-end, perché il relay non era raggiungibile.** | Arriva solo se uno di loro è il suo: aspetta **✓✓**, o controlla il relay. |
| **… Se il suo non è tra loro, lo consegnano al suo relay appena raggiungono internet, e così fa anche questo telefono.** | Niente: arriva appena uno di loro, o questo telefono, raggiunge internet. Aspetta **✓✓**. |
| **Inviato via LoRa, crittografato end-to-end, perché il relay non era raggiungibile.** | Arriva se il suo {=Erevos} ha una radio sulla stessa mesh, a portata: aspetta **✓✓**, o controlla il relay. |
[~] | **Inviato via SMS, crittografato end-to-end, perché nient’altro poteva prenderlo.** | Niente: costa SMS, e l’operatore vede che hai scritto al suo numero. **✓✓** arriva appena relay o Nostr sono raggiungibili. |
| **In attesa. Il relay non è raggiungibile (o Non c’è nessun relay), e il suo telefono non è vicino.** | Niente: parte da solo appena il relay o il suo telefono vicino può prenderlo, e allora mostra **✓**. Senza un relay, inserisci il suo indirizzo, come in [Chat tramite un relay](#relay), o avvicinati al suo telefono. |
| **In attesa. È troppo lungo per LoRa.** | Niente: parte appena il relay o il suo telefono vicino può prenderlo. Oppure invialo in parti più brevi. |
[~] | **In attesa. È troppo lungo per un SMS.** | Niente: parte appena il relay o il suo telefono vicino possono prenderlo. Oppure mandalo in parti più brevi. |
| **Non inviato. Il relay non ha più la coda di questo contatto.** | Chiedigli di scriverti, o il suo nuovo link di contatto. |
| **Questa versione non può crittografare, quindi le chat tramite il relay sono disattivate.** | Ricompila l’app: questa versione è più vecchia della sua crittografia. |

## Gestire un relay tuo {#own-relay}

Un relay che gestisci tu stesso è il più sicuro, perché chi gestisce un relay vede chi vi si collega. Il codice
sorgente ha tutto in \`deploy/relay\`.

- **Sulla tua rete:** fai girare il relay su un computer, apri la porta 7879 nel suo firewall, e scrivi
  \`ws://<il suo indirizzo>:7879\` su ogni telefono. Richiudi la porta quando hai finito.
- **Su internet:** un server (VPS) con Debian 12 o Ubuntu 22.04 o successivi, un nome di dominio (o un nome gratuito
  \`sslip.io\`) e le porte 80 e 443 aperte. Un solo comando installa il relay dietro Caddy, con un certificato di
  Let's Encrypt e un token casuale. Ogni telefono usa poi \`wss://<il tuo dominio>\` e quel token. Lo stesso comando
  configura il relay per le chiamate, che richiede aperte anche la porta 3478 e le porte UDP da 50000 a 50999.

Le code e i messaggi in attesa sono conservati sul disco del server, e così i pezzi crittografati di foto e file
finché non vengono presi (al massimo 1024 MB in tutto), quindi un riavvio non fa perdere nulla, e nessuna richiesta
viene registrata.
Anche i messaggi inviati per dopo sono conservati lì fino alla loro ora, al massimo 10.000 o 256 MB: il relay vede
quando deve partire ognuno, non che cosa dice.

**Perché:** quello che il relay conserva ha dei limiti, così i telefoni che lo usano non possono riempire il suo disco
o la sua memoria.

**La sua chiave:** il file della chiave del relay (\`EREVOS_RELAY_KEY\`, che il comando unico configura) è ciò che
dimostra a ogni connessione, così i telefoni lo riconoscono da quella chiave e non dal suo certificato (vedi [La chiave
del relay](#relay)). Conserva quel file, anche nei suoi backup: con uno nuovo, ogni telefono che conosceva la vecchia
chiave rifiuta il relay finché qualcuno non tocca **Ha una chiave nuova** su di esso.

**Inviti:** il relay può dare a ogni telefono un token tutto suo, in un file di token, e poi lasciare che quei telefoni
ne invitino altri, ogni invito per un telefono (vedi [Inviti al relay](#relay)). Attivalo con
\`EREVOS_RELAY_INVITES=on\` accanto a \`EREVOS_RELAY_TOKENS\`; il relay scrive allora da solo in quel file le righe dei
telefoni invitati, con chi li ha invitati e quando, e togliere una riga esclude quel telefono, solo quello: i telefoni
che ha invitato tengono le loro, quindi per escludere anche loro cancella ciascuna delle loro righe (ognuna dice chi
l’ha invitato). Fa entrare al massimo 100 telefoni su invito (\`EREVOS_RELAY_MAX_INVITED\`). \`erevos-relay free-line
NAME\`, eseguito con il relay fermo, fa di una riga una delle tue: il telefono che l’ha invitata non può più ritirarla,
e non conta più tra i 100. Un telefono che arriva con il token del relay (\`EREVOS_RELAY_TOKEN\`) chiede una volta una
riga tutta sua, che il relay aggiunge come una delle tue, indicando che è arrivato con il token del relay e quando, al
massimo 50 al giorno: così puoi distribuire quel token, eliminare la riga di un singolo telefono, e poi cambiare il
token senza escludere gli altri. \`deploy/relay/README.md\` spiega come.

**Accesso:** con un file di token, il relay può anche far accedere i telefoni con un fornitore OpenID Connect, come
Authentik, per un token tutto loro, e controlla ogni account ogni ora, togliendo i suoi telefoni dopo 3 giorni senza
risposta e altri due controlli di ogni telefono falliti a un’ora di distanza (vedi [Accedere al relay](#relay)). Un
browser può avviare 10 accessi al minuto. Con \`EREVOS_RELAY_OIDC_GROUP\`, possono farlo solo gli account di quel
gruppo.
Servono un client presso il fornitore, alcune impostazioni, e \`/signin/\` passato al relay come HTTP semplice:
\`deploy/relay/README.md\` spiega come.

> Non pubblicare mai il token dove altri possono leggerlo. Chi gestisce il server vede gli indirizzi IP che si
> collegano, gli id delle code, e quando e quanto arriva. Non può leggere i messaggi, che sono crittografati
> end-to-end.

## Relay di casa {#home-relay}

In **Impostazioni** → **Relay e reti** → **Relay di casa**, uno spazio può avere un secondo relay con una sua coda:
uno a casa, su un Raspberry Pi o un vecchio computer, o qualsiasi altro relay di cui ti fidi. È facoltativo.

- **Che cosa fa:** il tuo link di contatto e ogni messaggio indicano quella coda accanto al tuo relay. Mentre il tuo
  relay non è raggiungibile, i contatti scrivono lì, ed Erevos prende quello che vi arriva a ogni controllo. Quello che
  invii passa da lì quando il tuo relay è fuori uso.
- **Come configurarlo:** fai girare un relay come in [Gestire un relay tuo](#own-relay), scrivi il suo indirizzo (e il
  token, se ne ha uno) e scegli **Salva**. I contatti lo conoscono dal tuo prossimo messaggio, o dal tuo nuovo link di
  contatto.
- **Che cosa vede:** quello che vede il tuo relay, l’indirizzo di questo telefono quando prende i messaggi (ma non
  quando è raggiunto solo tramite Tor), e quando e quanto arriva. Le chat nascoste non lo usano.
- **Solo tramite Tor:** un interruttore per ogni relay di casa. Quel relay non vede mai l’indirizzo di questo telefono,
  qualunque cosa sia impostata per Tor per il resto. Senza token scritto, dà un token in cambio di un coupon: il tuo
  relay, quello dello spazio stesso, firma il coupon alla cieca, così nessuno dei due relay può capire di chi è il
  token. Il coupon viene preso fino a un’ora dopo che è stato firmato, in un momento a caso, così gli orari visti dai due relay non
  coincidono, e il token arriva dal relay di casa entro un’ora. Il token dura 90 giorni, ed Erevos prende da solo un
  nuovo coupon in un giorno a caso tra il giorno 30 e il giorno 60. Un limite: con pochi telefoni su un relay, chi gestisce entrambi potrebbe ancora
  indovinare dai soli orari. Così due spazi (vedi [Seconda password](#second)) possono usare ciascuno il relay
  dell’altro come relay di casa, e nessun relay li lega tra loro. Entrambi i relay devono avere i coupon attivati, e
  serve una versione con Tor, su Android (vedi [Tramite Tor](#tor)).
- **Automaticamente dal tuo relay:** un interruttore, spento se non lo accendi, su Android, dove Erevos ha Tor. Quando
  il tuo relay nomina un relay abbinato a lui (lo imposta chi lo gestisce), uno spazio senza relay di casa prende
  quello da solo, solo tramite Tor, con il suo token da un coupon come sopra: niente da scrivere, e niente da fare
  quando il tuo relay ne nomina un altro. Spegnerlo lascia il relay di casa che ha preso, e togliere a mano il relay di casa lo disattiva per quello spazio; un relay di
  casa scritto da te resta com’è. I posti nascosti non ne prendono mai così.
- **Per le chat nascoste:** ogni posto nascosto può avere un suo relay di casa, in **Per utenti esperti** nella sua
  schermata senza nessuna chat scelta, mentre è aperto. È conservato solo con quel posto, sigillato con il suo PIN,
  così lo spazio non ne sa nulla, e viene controllato mentre il posto è aperto. Usa un relay diverso da quello dello
  spazio: un relay che vedesse entrambe le code potrebbe collegarle tra loro.

**Più di uno:** **Aggiungi un altro relay di casa** ne dà fino a due in più, ognuno con la sua coda, per esempio uno a
casa e uno da un amico. I contatti li provano nell’ordine mostrato, ed Erevos prende ciò che arriva su ciascuno. Il tuo
link di contatto nomina gli altri solo finché resta abbastanza corto per un codice QR; il resto arriva ai contatti con
il tuo prossimo messaggio. Un contatto con un {=Erevos} più vecchio usa solo il primo.

## Tramite Tor {#tor}

In **Impostazioni** → **Relay e reti** → **Tor**, **Cosa passa da Tor** sceglie quali richieste di questo spazio ai
suoi relay passano dalla rete Tor. Ogni spazio ha la sua scelta:

| Scelta | Cosa passa da Tor |
| --- | --- |
| **Niente** | A meno che tu non la cambi. Il relay e i relay Nostr vedono l’indirizzo IP del tuo telefono per tutto. |
| **Messaggi** | Quello che scrivi, e quello che dice qualcosa ai tuoi contatti, come il fatto che un messaggio è stato letto. Immagini, file e messaggi vocali vanno direttamente, il che è più veloce: per loro il relay vede l’indirizzo IP del tuo telefono. |
| **Tutto** | Anche i file. Niente va a un relay senza Tor. |

**Perché:** un nuovo spazio parte con **Niente**, perché Tor rallenta i messaggi; uno spazio fatto prima mantiene la sua
scelta. Con **Messaggi**, quello che scrivi è nascosto da Tor e non lo aspetta mai, mentre immagini, file e messaggi
vocali, che sono grandi, vanno direttamente e quindi più veloci.

- **Attivare Tor:** da **Niente** a **Messaggi** o **Tutto**, Erevos chiede prima **Attivare Tor?** e dice che i
  messaggi saranno più lenti; **Annulla** mantiene **Niente**.

- **Una sola chat tramite Tor:** in una chat di Erevos, **Dettagli** → **Tramite Tor** invia i messaggi e i file di
  quella chat solo tramite Tor, su circuiti Tor propri, qualunque sia la scelta di questo spazio; è disattivato finché
  non lo attivi. Il relay allora non vede l’indirizzo IP del tuo telefono per quella chat, e nessuna uscita Tor la
  porta insieme a un’altra chat. È più lento, e quello che parte aspetta mentre Tor si avvia. Le chiamate non passano
  tramite Tor. Anche le chat nascoste lo hanno, ciascuna nei propri **Dettagli**.
  È uguale sui tuoi dispositivi collegati: attivato o disattivato su uno, lo è su tutti. Su un dispositivo senza Tor,
  come l’app web, quella chat non invia nulla finché è attivo.
  Vale anche per i testi Nostr di quella chat e per le sue foto e i suoi file sui server di file Nostr, anche quando
  la scelta di questo spazio è **Niente**: Tor viene avviato per loro e niente parte in diretta. Finché il tuo
  contatto non scrive per la prima volta nella coda propria della chat, i suoi primi messaggi arrivano nella coda
  dello spazio, che si legge come dice lo spazio. Vedi [Chi vede il tuo indirizzo internet](#ip).

- **Che cosa nasconde:** il relay non vede più l’indirizzo IP del tuo telefono, solo un’uscita Tor (o niente, per un
  relay con un indirizzo \`.onion\`). Il tuo operatore telefonico o la rete Wi-Fi vedono solo che usi Tor, non quale
  relay.
- **Che cosa costa:** quello che passa da Tor va e viene più lentamente, e il primo avvio di Tor richiede un po’ di
  tempo. La schermata mostra a che punto è Tor. Per risparmiare la batteria, Erevos invia il riempimento ridotto che
  Tor ha creato per i telefoni: il traffico di riempimento che Tor invia per nascondere quando parli parte ogni 9–14
  secondi, non ogni pochi, e al telefono non ne arriva.
- **Che cosa non copre:** le chiamate, il cui suono e la cui immagine vanno direttamente tra i telefoni o tramite il
  relay per le chiamate; i telefoni vicini{~ e gli SMS}, che non usano internet.
- **Solo su Android:** {=Erevos} su un computer e la web app non hanno ancora Tor, quindi lì tutto va direttamente.

> Con **Messaggi**, un messaggio non aspetta mai Tor: uno che Tor non è riuscito a portare al relay va subito
> direttamente, e così i messaggi mentre Tor si avvia, o per un minuto dopo che non è riuscito a raggiungere il relay;
> poi si riprova Tor. Con **Tutto**, niente va a un relay senza Tor:
> quando Tor non riesce a raggiungere il relay, il messaggio aspetta e si riprova; Erevos non ripiega mai da solo sulla
> tua connessione.

### Bridge

Dove Tor stesso è bloccato, **Bridge** nella stessa schermata permette a Tor di raggiungere la sua rete tramite dei
bridge. È su **Nessun bridge** finché non scegli, ogni spazio ha il suo, e conta solo mentre qualcosa passa da Tor.

| Scelta | Che cos’è |
| --- | --- |
| **Automatico** | Erevos prova i modi uno alla volta finché Tor si connette: diretto, i bridge obfs4, Snowflake, poi le tue righe, se ne hai. Ricorda per 30 giorni quello che ha funzionato su Wi-Fi e su dati mobili, e lo prova per primo; su un’altra rete cerca di nuovo. Con **La mia rete è sorvegliata** attivo, non prova mai diretto, e la rete vede solo un bridge. |
| **obfs4** | I bridge obfs4 inclusi in Tor Browser. A chi osserva la rete, Tor sembra fatto di byte casuali. Un censore che li conosce può bloccarli. |
| **Fiocco di neve** | Tramite i browser di volontari, via WebRTC, come passa una videochiamata. Per trovarne uno, Erevos chiede al broker di Snowflake tramite una CDN, dietro il nome di un altro sito, e dei server STUN dicono al telefono il suo indirizzo: vedono quell’indirizzo, mai i tuoi messaggi. Più lento, e difficile da bloccare. |
| **I miei** | Righe di bridge da bridges.torproject.org, da bridges@torproject.org via email, o da @GetBridgesBot su Telegram, incollate una per riga; poi tocca **Usa questi bridge**. Funzionano i bridge obfs4, Snowflake, WebTunnel, meek e semplici. |

- **Solo tramite loro:** con i bridge, Tor non va mai direttamente ai suoi relay. Quando nessun bridge risponde, con
  **Tutto** i messaggi aspettano, come quando Tor non riesce a raggiungere il relay; con **Messaggi** vanno al relay
  senza Tor finché uno non risponde. Le righe che non sono bridge non vengono accettate, e Tor resta spento.
- **Controlla la mia connessione**, sotto, dice se Tor si connette, e in che modo, mai l’indirizzo del telefono. Con
  **Automatico**, cerca di nuovo dall’inizio.
- **Cambiarli** mentre Tor è in funzione chiude le sue connessioni e le ricrea nel nuovo modo.
- **Solo su Android:** l’app include lyrebird, il programma di Tor per obfs4, Snowflake, WebTunnel e meek. Un
  computer e la web app non hanno ancora Tor, quindi nemmeno i bridge.

## Tramite Nostr {#nostr}

In **Impostazioni** → **Relay e reti** → **Nostr**, **I testi tramite Nostr** è **Attivato** a meno che tu non lo cambi.
Allora quello che scrivi a un contatto il cui {=Erevos} legge anche su Nostr passa prima dai tuoi relay: il tuo relay, poi
i relay di casa del contatto, poi il tuo relay di casa; e da relay Nostr pubblici solo quando nessuno l’ha preso. Ogni
spazio ha la sua scelta, e i suoi relay Nostr.

- **Come è sigillato:** crittografato end-to-end come sempre, poi sigillato un’altra volta per una chiave che il tuo
  contatto ha dato solo a questa chat, e firmato da una chiave creata per quel solo testo (un gift wrap NIP-59). I relay
  Nostr vedono che qualcuno ha scritto a una chiave che non nomina nessuno, quando, e quanto è grande; non chi l’ha
  scritto, né a chi. Il tuo relay non vede ciò che è andato per quella strada.
- **Che cosa possono capire i relay Nostr:** il tuo telefono chiede a ciascuno di loro tutte le sue chiavi insieme:
  un relay può capire che quelle chiavi vengono lette insieme. Tramite Tor, mai da dove: ogni relay viene raggiunto su
  circuiti Tor tutti suoi, così nessuna uscita Tor trasporta quello che va a due di loro, e nessuna può capire che è di
  un unico telefono. Con **Niente** va direttamente, quindi vedono l’indirizzo IP del tuo telefono, ma ancora non chi ha
  scritto a chi. Alcuni relay rifiutano alcune uscite Tor, e alcune uscite non riescono a raggiungere un relay: dopo
  un fallimento del genere, il tentativo successivo passa da un’altra uscita.
- **Come va:** con **Niente**, i testi vanno direttamente ai relay Nostr. Con **Messaggi**, tramite Tor quando Tor è
  pronto, e dal tuo relay mentre Tor si avvia. Con **Tutto**, solo tramite Tor. Quando la via cambia, le connessioni
  Nostr si chiudono e si riaprono sulla via nuova.
- **Nostr tramite Tor:** nella schermata **Nostr**, **Nostr tramite Tor** è **Disattivato** a meno che tu non lo
  attivi. **Attivato**, Erevos raggiunge i relay Nostr e i server di file Nostr solo tramite Tor e avvia Tor per
  questo, anche quando il Tor dello spazio è **Niente**; un testo che va lì aspetta mentre Tor si avvia. Aggiunge solo
  Tor: con Tor attivato per lo spazio, Nostr passa da Tor qualunque cosa dica questo, e una chat impostata su
  **Tramite Tor** passa da Tor qualunque cosa dica questo. Vedi [Chi vede il tuo indirizzo internet](#ip).
- **I relay:** relay.damus.io, nos.lol e relay.primal.net a meno che tu non li cambi; puoi aggiungere i tuoi, al
  massimo cinque. Ai tuoi contatti vengono comunicati i relay su cui leggi, e ti scrivono lì; basta che uno prenda un
  testo.
- **Che cosa resta sul tuo relay:** chiamate, reazioni, e i segni che un messaggio è arrivato o è stato letto; e quello che scrivi ai contatti su iPhone o su computer, che non leggono su Nostr. Immagini, file e messaggi vocali passano dal tuo relay quando ce n’è uno tra voi; senza relay tra voi passano anche da Nostr (vedi Senza alcun relay).
- **Da che parte è passato:** tieni premuto un messaggio: il suo menu dice **Inviato tramite Nostr** o **Arrivato
  tramite Nostr** quando l’ha preso un relay Nostr. D’ora in poi dice anche **Inviato tramite il relay**, **Arrivato
  tramite il relay**, **Inviato al suo telefono vicino**, **Arrivato da un telefono vicino** o **Inviato tramite LoRa**;
  un messaggio precedente non dice nulla. Anche la nota sotto i messaggi dice **Inviato tramite Nostr**. Due telefoni
  uno accanto all’altro si danno i testi prima da vicino, poi tramite i relay; Nostr porta un testo solo quando i relay
  non l’hanno preso.
- **Cosa hanno fatto i relay per ultimo:** la schermata **Nostr** mostra, per ogni relay, se ha preso l’ultimo testo che
  gli è stato dato e quanti secondi dopo, o perché no, e se il tuo telefono legge su di esso. È conservato solo su
  questo telefono, finché Erevos non si chiude. Un testo non aspetta mai i relay Nostr finché i tuoi relay lo prendono.
- **Solo su Android,** come Tor.

**Perché:** i relay Nostr sono pubblici, quindi, quando Tor è attivo per lo spazio, Erevos li raggiunge tramite Tor, e
non sanno mai dove si trova il tuo telefono; con **Niente** li raggiunge direttamente. Lì vanno solo i testi, come
riserva dei tuoi relay: un testo che è andato lì passa di nuovo dal tuo relay, se non dovesse arrivare, mentre i segni
che un messaggio è arrivato o è stato letto non ne avrebbero nessuna, e un messaggio inviato per dopo ha bisogno del tuo
relay che lo conservi fino alla sua ora. Senza relay tra voi, vanno lì anche immagini, file e messaggi vocali (vedi
Senza alcun relay).

> Un testo passato da Nostr passa di nuovo dal tuo relay se il telefono del tuo contatto non dice entro cinque minuti
> che è arrivato, e lo vede una volta sola. Quando né i tuoi relay né un relay Nostr lo prendono, aspetta e riparte,
> come ogni messaggio.

- **Chat nascoste:** leggono anche su Nostr, mentre sono aperte, e anche da chiuse finché **Ricevere da chiuse** è
  attivo per loro e lo spazio è aperto (vedi [Chat nascoste](#hidden)). Da chiuse, mostrano comunque «New message»:
  con ogni testo tramite Nostr, il tuo contatto manda anche al tuo relay un campanello, un messaggio che non dice nulla,
  che il tuo relay conta come uno, come prima. Senza relay, il loro link di contatto e il codice QR dicono dove leggono
  su Nostr, con una chiave solo di quel posto, e testi, reazioni e i segni che un messaggio è arrivato vanno lì, come
  da un telefono senza relay.

### Senza nessun relay {#nostr-only}

Un telefono senza relay, senza invito e senza account LPHL può comunque iniziare: il suo link di contatto e il suo
codice QR dicono dove legge su Nostr, e basta questo per parlare.

- **Per iniziare:** in **Nuova chat**, tocca **Inizia senza relay**, poi **Mostra il mio codice QR** o **Condividi il
  mio link di contatto**, e dallo a qualcuno che usa {=Erevos}. Chi lo aggiunge ti scrive tramite Nostr, e appare
  come richiesta di messaggio, che accetti. Puoi anche aggiungere il suo link o codice QR, allo stesso modo.
- **Che cosa passa:** testi, sticker, reazioni, modifiche, e i segni che un messaggio è arrivato o è stato letto, tutto tramite Nostr; e foto, file e messaggi vocali. Un messaggio vocale passa in wrap come un testo. Una foto fino a 3 MB passa in pezzi da 32 KB, un wrap ciascuno, inviati prima del messaggio che la offre; l’altro telefono li tiene, cifrati con il resto dello spazio o delle chat nascoste per cui sono arrivati, finché non sono arrivati tutti, quattro giorni al massimo. Una foto più grande, un video o qualsiasi altro file, fino a 20 MB, passa come un unico blob, cifrato sul telefono, verso un server di file Blossom (blossom.primal.net, blossom.band o nostr.download), tramite Tor come dice la scelta Tor dello spazio (direttamente con **Niente**): il server tiene solo ciò che non può leggere. Chiamate e gruppi hanno bisogno di un relay, o dell’altro telefono vicino. Anche le chat nascoste funzionano così, solo tramite Nostr (vedi [Chat nascoste](#hidden)).
- **Quando non arriva:** i relay Nostr conservano un testo per due giorni. Finché il telefono del tuo contatto non dice
  che è arrivato, Erevos glielo ridà una volta al giorno, per due settimane.
- **Un relay da solo:** quando il tuo contatto ha un relay che gli permette di invitare, il suo {=Erevos} manda da solo al
  tuo un invito per quel relay, una volta, nella chat, che vi siate conosciuti prima tramite Nostr o da vicino, via
  Bluetooth, Wi-Fi o un codice QR. Il tuo telefono lo prende da solo, e da allora funzionano anche foto, messaggi vocali
  e chiamate, con tutti. Conta come uno dei suoi inviti. Qualcuno di cui non hai accettato la richiesta di messaggio non
  sceglie nessun relay per te: il suo invito aspetta finché non lo accetti, al massimo una settimana.
- **Un Erevos più vecchio** non legge la parte Nostr di un link: ti raggiunge solo da vicino, finché non hai un relay.

**Perché:** Nostr è solo la porta d’ingresso. Nessuno ha bisogno di un invito per iniziare, e appena uno di voi ha un
relay, questo trasporta quello che è troppo grande per Nostr.

## Chi vede il tuo indirizzo internet {#ip}

L’indirizzo internet del tuo telefono, il suo indirizzo IP, mostra più o meno dove sei e quale operatore usi. Non
mostra quello che scrivi. Chi si collega al tuo telefono lo vede, a meno che la connessione passi da Tor.

- **Il tuo relay e i relay dei tuoi contatti:** lo vedono. Per nasconderlo, attiva Tor per lo spazio (**Impostazioni**
  → **Relay e reti** → **Tor**) oppure **Tramite Tor** nei **Dettagli** di una chat. Vedi [Tramite Tor](#tor).

- [+] **XMPP:** il tuo server XMPP lo vede finché Erevos è connesso, a meno che l’account passi tramite Tor; i server dei
  tuoi contatti e gruppi no, perché il tuo server porta loro i tuoi messaggi. Erevos avvisa prima che tu invii in una
  chat finché l’account non passa tramite Tor (con **Tramite Tor** per quella chat come soluzione), prima di ogni
  chiamata, e prima di scaricare un file da un server diverso dal tuo. Vedi [XMPP](#xmpp).

- **I relay Nostr pubblici e i server di file Nostr:** lo vedono, a meno che la connessione passi da Tor. Attiva
  **Nostr tramite Tor** in **Impostazioni** → **Relay e reti** → **Nostr**, oppure **Tramite Tor** per una chat. Vedi
  [Tramite Nostr](#nostr).
- **Abbinarsi con un codice:** i due telefoni si incontrano su quegli stessi relay Nostr pubblici, quindi senza Nostr
  tramite Tor vedono l’indirizzo, ma non il codice né i link di contatto. Erevos lo dice prima della prima volta.

- [+] **Matrix:** la vede solo il tuo server Matrix, non i server dei tuoi contatti: foto e file da altri server ti
  arrivano anch’essi tramite il tuo. Scegli **Tor per questo account Matrix** nella schermata Matrix, o attiva
  **Tramite Tor** sotto i pulsanti di una chat, che fa passare tutto l’account tramite Tor. Vedi [Matrix](#matrix).
- [+] **Telegram:** i server di Telegram lo vedono, a meno che l'account passi da Tor: scegli **Sempre tramite Tor** in
  **Tor per questo account Telegram**, nelle impostazioni di Telegram, o accendi **Tramite Tor** nelle informazioni di
  una chat, che fa passare tutto l'account da Tor. Vedi [Telegram](#telegram).
- [+] **Chat con altre app Nostr e il feed Pubblico:** i loro relay e server di file lo vedono, a meno che l’account passi
  da Tor (**Tor** nella schermata **Chat Nostr**) o sia attivo **Tramite Tor** della chat. Pubblicare, mettere mi piace
  o votare nel feed Pubblico, e le sue foto e anteprime di link senza Tor, lo mostrano anche. Vedi [Chat con altre app
  Nostr](#nostr-chats).
- [+] **Messenger, Signal e Session** (Erevos+): lo vedono i loro server (quelli di Meta, di Signal, o il primo nodo di
  Session), non i tuoi contatti, a meno che l'account passi da Tor: scegli **Sempre tramite Tor** in **Tor per questo
  account …** nella sua schermata, o attiva **Tramite Tor** in una chat, che manda tutto l'account tramite Tor.
  L'accesso, il captcha di Signal, le foto di Messenger e **Apri Facebook** passano allo stesso modo. Erevos avvisa prima che tu invii in
  una chat finché l'account non passa da Tor, e prima di ogni chiamata. Vedi [Messenger](#messenger), [Signal](#signal) e [Session](#session).

- **Le chiamate:** non passano mai da Tor. Il relay delle chiamate, il tuo o quello del tuo contatto, vede
  l’indirizzo, ma non quello che si dice. Una chiamata tra telefoni vicini sulla stessa rete resta su quella rete.

- **Un file su un server scelto dal tuo contatto:** il server vede l’indirizzo quando il tuo telefono scarica il file.
  Tor lo nasconde.

- **I link web che apri:** il sito lo vede, come ogni pagina web. Per nasconderlo, apri i link in Tor Browser. Anche
  l’anteprima di un link viene scaricata dal suo sito, e il sito vede l’indirizzo allo stesso modo.
  Con **Tramite Tor** attivo per le anteprime dei link, non lo vede.

- **Il relay di un contatto:** finché il tuo spazio non ha un relay suo, o solo un posto prestato su uno, un contatto
  può darti un posto sul suo, e arriva con il suo messaggio. Il suo relay vede allora l’indirizzo, perciò Erevos
  chiede prima di prenderlo, a meno che lo spazio non mandi tutto tramite Tor. Se non lo prendi, l’invito viene
  lasciato cadere.

- **I gruppi:** un messaggio in un gruppo Erevos passa da un server, che vede l’indirizzo. Tor per lo spazio lo
  nasconde; un gruppo non ha un interruttore suo.

- **Backup, {~il server della Raccolta, liste radio e TV, |}anteprime dei link e aggiornamenti:** ognuno ha il proprio
  interruttore **Tramite Tor**, nella propria schermata, disattivato finché non lo attivi. Vedi [Backup](#backup),
  {~[Raccolta](#collection), |}[Chat tramite un relay](#relay) e [Aggiornamenti](#updates).

- [~] **Stazioni radio e canali TV:** ognuno vede l’indirizzo mentre va in onda. **Riproduci tramite Tor**, nelle
  impostazioni della Raccolta su Android, disattivato finché non lo attivi, li riproduce solo tramite Tor. Vedi
  [Raccolta](#collection).

Erevos avvisa una volta prima di ciascuno di questi casi, con il titolo **Il tuo indirizzo internet può essere
visto**, un pulsante **Guida** che apre questa sezione e, dove può, un pulsante che lo risolve, come **Tramite Tor per
questa chat**. **Vai avanti** prosegue; per una chat viene detto una volta e non di nuovo per quella chat.

Dopo la guida torna la stessa domanda, e quello che stavi inviando, come un messaggio vocale o un file, la aspetta.
Una chiamata che squilla qui lo dice sotto la chiamata, e rispondere va avanti. Le chat nascoste tengono ciò che è
stato detto con sé, separato dallo spazio.

I telefoni vicini{~, LoRa e gli SMS| e LoRa} non usano internet, quindi non mostrano nessun indirizzo internet.

## Matrix {#matrix}

In **Impostazioni** → **Relay e reti** → **Matrix**, uno spazio può accedere a un account Matrix, per chattare con
persone che usano Element o un’altra app Matrix. Erevos parla da sé con il server Matrix, come Element: nessun ponte
sta nel mezzo.

- **Accesso:** il tuo ID Matrix, come @nome:matrix.org, e la sua password. Erevos diventa un nuovo dispositivo
  dell’account, chiamato Erevos. L’accesso e le chiavi del dispositivo restano cifrati in questo spazio, e sono nei
  backup: dopo un ripristino, lo spazio accede di nuovo, come nuovo dispositivo. Le sue chat nascoste possono avere un
  account Matrix proprio, vedi [Chat nascoste](#hidden).
- **Accesso unico:** su Android, quando il tuo server Matrix fa accedere le persone altrove (come chiede matrix.org
  per i nuovi account), **Accedi con accesso unico (SSO)** apre il browser su quella pagina, e torna a Erevos quando
  hai fatto l’accesso lì; un server con più fornitori ti lascia sceglierne uno. Il browser non passa da Tor, quindi
  quella pagina vede il tuo indirizzo. Non essendoci una password da dare, Erevos crea le chiavi di firma incrociata
  dell’account solo quando il server le accetta senza richiederla; altrimenti verifica questo dispositivo con le emoji
  o un codice QR da un altro dei tuoi, o inserisci la chiave di sicurezza.
- **Chat:** **Nuova chat** avvia una chat cifrata con un ID Matrix. Gli inviti compaiono per primi, con **Partecipa** e
  **Rifiuta**. Scrivi un nome invece di un ID Matrix per cercare persone nella rubrica utenti del tuo server Matrix, che
  viene a sapere chi hai cercato; **Avvia** inizia la chat con chi tocchi.
- **Gruppi:** **Nuovo gruppo**, nella schermata di Matrix, crea un gruppo cifrato da un nome e dagli ID Matrix che
  scrivi, ognuno invitato a entrare, come lo crea Element; tutti vedono chi sono gli altri. **Entra in un gruppo** entra
  in uno con il suo indirizzo, come #name:matrix.org. Un gruppo pubblico potrebbe non essere cifrato, e allora la sua
  schermata lo dice. In un gruppo, **Invita** invita qualcun altro, se il gruppo te lo permette.
  Scrivendo **@** in un gruppo compaiono i suoi membri; un messaggio nomina quelli scritti per intero, e le loro app
  li avvisano.
- **Membri:** in un gruppo, **Membri** elenca le sue persone e mostra chi è **proprietario**, **admin** o
  **moderatore**, come dicono i loro livelli di potere. Dove il tuo livello lo permette, rinomini il gruppo, ne imposti
  l’**Oggetto**, **Rendi admin** o **Rimuovi come admin**, **Rimuovi** qualcuno (i messaggi del gruppo non gli arrivano
  più) o **Escludi** (non può rientrare finché un admin non lo lascia).
- **Cifratura:** i messaggi sono cifrati end-to-end con la cifratura di Matrix stesso (Olm e Megolm, tramite
  vodozemac). Una chat non cifrata lo dice.
- **Non anonimo:** il server Matrix vede il tuo account, chi parla con chi e quando, e, senza Tor, da dove. In una
  chat con persone su altri server, lo vedono anche quei server.
- **Tramite Tor:** su Android, la schermata Matrix, anche prima di accedere, ha la scelta Tor che ha ogni account:
  **Disattivato** (il predefinito) va diretto, e il server Matrix vede il tuo indirizzo; **Come lo spazio** segue
  **Impostazioni** → **Relay e reti** → **Tor**: con **Messaggi**, tramite Tor appena è pronto e diretto mentre parte,
  foto e file diretti; con **Tutto**, tutto solo tramite Tor; **Sempre tramite Tor** fa passare questo account solo
  tramite Tor, anche l’accesso, e niente senza. Tor usa i bridge dello spazio. **Tramite Tor** di una chat, sotto i
  suoi pulsanti, fa passare tutto l’account solo tramite Tor finché è attivo: Matrix ha una connessione per tutte le
  chat di un account. Le chiamate non passano mai tramite Tor.
- **Messaggi di prima:** un messaggio inviato prima che Erevos accedesse, o uno la cui chiave non è ancora arrivata,
  appare bloccato.
- **Foto e file:** **Foto** e **File** li inviano, fino a 50 MB, cifrati sul telefono prima di andare al server
  Matrix, che così tiene solo ciò che non può leggere. Una foto ricevuta si scarica solo toccando **Mostra foto**;
  **Salva** tiene qualsiasi file sul telefono.
  Tocca una foto mostrata per vederla a tutto schermo, come nella chat di un contatto: due dita o un doppio tocco la
  ingrandiscono, ruota con il telefono, e **Salva** la tiene (vedi Foto e file, in [Chat tramite un relay](#relay)).
- **Sticker:** uno sticker inviato da Element, FluffyChat o Element X si vede nella chat; **Mostra sticker** lo recupera
  tramite il tuo server Matrix. **Sticker** invia i tuoi sticker fatti da foto (**Miei**) come immagini, crittografate
  dove lo è la chat. Ci sono anche le serie integrate: ogni sticker parte come la sua immagine, fatta sul tuo
  dispositivo, con le sue parole per le app che mostrano solo quelle.
- **Reazioni, risposte, modifiche ed eliminazione:** tieni premuto un messaggio per aprire il suo menu: scegli una
  reazione in alto, **Rispondi** per rispondergli, **Copia** per le sue parole, e su un tuo messaggio **Modifica** o
  **Elimina**. Una risposta mostra il messaggio a cui risponde sopra le sue parole, e un tocco su quello porta al
  messaggio. Le reazioni si vedono sotto un messaggio; toccane una per reagire allo stesso modo, o tocca la tua per
  ritirarla. Non sono cifrate, come le invia Element, nemmeno in una chat cifrata: il server Matrix vede quale messaggio
  ha ricevuto quale reazione, e da chi. Solo tu puoi cambiare i tuoi messaggi, e uno cambiato dice **Modificato**.
  **Elimina** ritira un tuo messaggio per tutti nella chat, dopo che confermi; non si può annullare, e la chat tiene una
  riga che dice che è stato eliminato.
- **Più messaggi:** **Seleziona**, nel menu di un messaggio, lo sceglie, e un tocco ne aggiunge altri; poi **Copia**,
  **Inoltra** o **Elimina**. **Elimina** li ritira per tutti nella chat, dopo la tua conferma: i tuoi e, dove il tuo
  livello lo permette, quelli di altri. Non si può annullare.
- **Questo telefono o tutti:** **Elimina**, per un messaggio o più, chiede prima: **Questo telefono** li elimina solo
  qui, e restano nascosti se arrivano di nuovo; **Per tutti** li ritira come detto sopra, offerto solo quando ognuno
  può essere ritirato.
- **Sta scrivendo:** chi sta scrivendo ora nella chat, come dice il server Matrix, compare sotto con **sta
  scrivendo…**. Erevos lo dice di te solo se attivi **Dire quando scrivo** nella schermata Matrix; all’inizio è
  spento, perché passa dal server Matrix senza cifratura, quindi il server sa ogni volta che scrivi.
- **Online:** in una chat con una persona, sotto il suo nome compare **Online**, **Assente** o **Non disturbare**, con
  le parole che ha messo, o quando era online l’ultima volta, come dice il suo server Matrix, e la sua foto
  nell’elenco delle chat ha un punto verde finché è online. Alcuni server non lo dicono. Erevos lo dice di te solo se
  attivi **Dire quando sono online** nella schermata Matrix; all’inizio è spento, perché passa dal server Matrix senza
  cifratura.
- **Segni:** i tuoi messaggi mostrano **✓** quando il server Matrix li ha presi e **✓✓✓** quando tutti gli altri
  membri della chat li hanno letti, come l’app Matrix di ognuno lo dice al suo server (conferme di lettura). Matrix
  non ha un segno per un messaggio arrivato a un telefono, quindi non c’è **✓✓**. Tieni premuto un tuo messaggio e
  scegli **Chi l’ha letto** per vedere chi l’ha letto e quando, e chi no (i primi 100). Un’app Matrix può essere
  impostata per non inviare conferme di lettura: il suo membro risulta allora tra chi non ha letto.
- **Foto del profilo:** una stanza Matrix, o la persona in una chat con una persona, mostra la sua foto nell’elenco
  delle chat, e così un contatto XMPP. **Scegli una foto**, nella schermata Matrix, imposta la tua per i tuoi
  contatti; **Rimuovi** la toglie. Le foto non sono cifrate in nessuna app Matrix o XMPP: il server le vede, e i tuoi
  contatti vedono la tua.
- **Messaggi precedenti:** una chat con più cronologia sul server Matrix mostra in alto **Carica i messaggi
  precedenti**; ogni tocco ne porta altri, e la chat resta dove stavi leggendo. Un messaggio la cui chiave non è ancora
  arrivata appare bloccato.
- **Messaggi vocali:** tieni premuto il microfono sotto il campo del messaggio per registrare, e lascia per inviare;
  scorri a sinistra prima di lasciare per scartare la registrazione. Un minuto è il massimo, e una pressione di meno di
  un secondo non invia nulla. Con TalkBack, toccalo una volta per iniziare e di nuovo per inviare. In una chat cifrata è
  cifrato come una foto, e Element e le altre app Matrix lo riproducono come messaggio vocale. Uno che arriva si ascolta
  con **Riproduci**, e viene scaricato solo quando lo riproduci. La sua forma d’onda va con lui, come la disegna
  Element, e uno che arriva con la forma d’onda la mostra sotto **Riproduci**, colorata mentre suona.
- **Verifica con le emoji:** in una chat con una persona, **Verifica con le emoji** mostra a entrambi sette immagini;
  se sono uguali, nello stesso ordine, toccate **Coincidono** su entrambi i telefoni. Così nessuno può stare in
  mezzo senza essere visto, e la chat dice **Verificato con le emoji**. **Verifica questo dispositivo con un altro
  tuo**, nella schermata di Matrix, fa lo stesso con il tuo Element, perché si fidi del dispositivo di Erevos. Anche
  Element può avviare l’una o l’altra.
- **Verifica con codice QR:** quando entrambi hanno accettato una verifica, e le due app lo sanno fare, la scheda
  mostra un codice e **Fotografa il loro codice**. Lascia che l’altra app fotografi il codice mostrato qui (in
  Element: **Scansiona**), poi rispondi **Sì, lo dice** quando dice che la verifica è andata bene; oppure fotografa il
  codice che mostra la loro app. **Confronta le emoji invece** va per l’altra strada. Il codice contiene le chiavi dei
  due account (o dispositivi) e un segreto monouso, così un codice di qualcuno in mezzo non torna. Nulla è considerato
  fidato finché entrambi non hanno detto di aver finito.
- **Chiave di sicurezza:** in **Chiave di sicurezza**, nella schermata di Matrix, inserisci la chiave (o frase) di
  sicurezza creata da Element: i messaggi precedenti si aprono dal backup delle chiavi dell’account, le nuove chiavi
  vi entrano, e gli altri tuoi dispositivi si fidano di questo. Un account senza può **Crea una chiave di sicurezza**
  qui; scrivila, perché Erevos non la conserva.
- **Chiamate:** i due riquadri in alto nella chat chiamano a voce o in video, con Element Call, l’app di chiamata di
  Element ed Element X, che Erevos porta dentro di sé e mostra sopra l’app, in una finestra sua: su Android, nella web
  app e su un computer (Windows, macOS e Linux). La sua freccia indietro, o il tasto Esc, rimpicciolisce la finestra in
  un angolo sopra Erevos, così puoi continuare a usare Erevos durante la chiamata; un tocco sulla finestra piccola la
  riporta alla dimensione piena. Finché la chiamata non è iniziata, un pulsante **Chiudi** sotto di essa la termina,
  nel caso non inizi mai. Le chiamate per te squillano qui come quelle di Erevos, finché questo spazio è aperto:
  **Rispondi** apre Element Call nella chiamata, **Rifiuta** lo dice a chi chiama. Suono e immagine sono cifrati
  end-to-end, con chiavi che hanno solo le persone nella chiamata, e passano per il server multimediale (LiveKit)
  indicato dal tuo server Matrix, che vede l’indirizzo di questo dispositivo; un server Matrix senza uno non può
  chiamare. Ciò che Element Call dice al server Matrix passa per Erevos, e per Tor come il resto di Matrix, ma la
  chiamata in sé non passa mai per Tor. Element Call non raggiunge alcun tracker. Le chiamate Matrix più vecchie a due, come le fa FluffyChat, squillano anche qui (vedi **Chiamata più vecchia**). Mentre una chiamata Matrix è in corso o squilla, un’altra chiamata, di
  Erevos o su XMPP, non squilla e compare come persa, e viceversa. Su Android, Indietro o uscire da Erevos
  rimpicciolisce la finestra della chiamata sopra le altre app (picture in picture). Su Sailfish OS non ci sono
  chiamate Matrix.
- **Nella web app e su un computer:** il browser o il computer chiede una volta sola la fotocamera e il microfono; su un
  computer, solo la finestra della chiamata può usare la fotocamera. Dove va il suono e quale microfono si usa lo decide
  il computer o il browser. Nella web app, Element Call arriva da un secondo indirizzo tutto suo,
  erevos-call.lphl.nekten.eu, e su un computer da una parte separata dell’app, così non può leggere nulla di Erevos: né
  le sue chiavi né le sue chat. La web app controlla i file di Element Call con la stessa versione firmata dell’app
  stessa prima di eseguirlo, perciò la prima chiamata nella web app richiede un momento in più, mentre scarica e
  controlla Element Call.
  **Perché:** il codice di Element Call non lo scrive Erevos, quindi gira separato da Erevos, dove non può mai
  avvicinarsi alle sue chiavi e alle sue chat.
- **Notifiche:** un messaggio che arriva mostra un avviso e conta nel numero sull’icona di Erevos, come nelle chat di
  Erevos stesso, finché questo spazio è aperto; su un computer, finché Erevos è in funzione. Su Android, **Notifiche**,
  in fondo a una chat, la silenzia o le dà un suono suo; una chat silenziata non conta. **Aspetto della chat**, accanto,
  dà alla chat un aspetto suo.
- **Mentre questo spazio è chiuso:** su Android, **Avvisa dei nuovi messaggi**, in **Mentre questo spazio è chiuso**
  nella schermata di Matrix, lascia che questo spazio dica «New message» quando arriva qualcosa su Matrix mentre è
  aperto un altro spazio, come fanno le sue chat con **Anche mentre è aperto un altro spazio** in **Impostazioni** →
  **Notifiche** → **In background**, che serve anch’esso. Non dice mai cosa, da chi o in quale chat, e una chiamata
  allora non squilla: solo la chiave dello spazio apre ciò che è arrivato. Per questo il server Matrix avvisa il relay
  di questo spazio di ogni messaggio, senza nessuna sua parola, così il server Matrix conosce l’indirizzo del relay, e
  il relay quando arrivano messaggi. Spento finché non lo accendi; serve un relay aggiornato per questo, che il server
  Matrix possa raggiungere.
- **Thread:** tieni premuto un messaggio e scegli **Rispondi nel thread** per rispondere in un thread. Un thread si
  apre in una schermata propria, e un messaggio con risposte dice quante sono; toccalo per aprire il thread. Le app
  senza thread mostrano le risposte come semplici risposte.
- **Sondaggi:** **Sondaggio**, sotto il campo del messaggio, fa una domanda con più opzioni. Tocca un’opzione nel
  fumetto per sceglierla, e toccala ancora per ritirarla; tutti vedono chi ha scelto cosa. Chi ha fatto un sondaggio
  può tenerlo premuto e scegliere **Termina il sondaggio**: dopo non conta più nessun voto.
- **Posizioni:** **Posizione** invia dove sei, una volta, come fa Element; va cifrata come la chat e si mostra con
  **Apri nelle mappe** su Android.
- **Anteprime dei link:** con le **Anteprime dei link** attive, come per le chat con i tuoi contatti, il primo link di
  un messaggio parte con un’anteprima fatta dal tuo telefono, cifrata anch’essa in una chat cifrata. Tramite Tor solo con **Tramite Tor** attivo nelle **Anteprime dei link**, e mai in un luogo nascosto.
- **Fissare e inoltrare:** **Fissa**, nel menu di un messaggio, lo fissa in cima alla stanza per tutti, se la stanza
  te lo permette; una barra sopra la chat mostra l’ultimo messaggio fissato, e un tocco ci va e poi mostra il
  successivo. **Non fissare più** lo toglie. **Inoltra** invia una copia a un’altra chat di questo account; la copia
  non condivide nulla con l’originale. Una chat non cifrata lo dice accanto al nome, perché il suo server legge una
  copia inviata lì.
- **Trovare gruppi:** **Trova un gruppo**, nella schermata Matrix, cerca tra le stanze pubbliche del tuo server
  Matrix, o di un altro che scrivi, che allora viene a sapere cosa cerchi. **Spazi** elenca le stanze degli spazi in
  cui sei, per partecipare. **Cerca messaggi** cerca solo tra i messaggi tenuti su questo telefono, e non chiede a
  nessuno.
- **Preferiti:** tieni premuta una chat nell’elenco per **Rendi preferito** (va per prima), **Bassa priorità** (va per
  ultima) e **Esci e dimentica**, che fa dimenticare la chat anche al server Matrix, così le tue altre app Matrix non
  la mostrano più. Sono tenuti nel tuo account, quindi le tue altre app Matrix ordinano allo stesso modo.
- **Un nuovo account:** nella schermata di accesso, **Crea un nuovo account** ne crea uno su un server Matrix che lo
  permette, da un server, un nome e una password. Se il server lo chiede, Erevos ti chiede di accettare le sue
  condizioni, di dare un token di registrazione o di fare un passaggio sulla pagina del server, come un captcha, che
  si apre nel browser, non tramite Tor. Un server che chiede un indirizzo e-mail crea account solo sul suo sito;
  creane uno lì, poi accedi qui.
- **Dispositivi:** **Dispositivi**, nella schermata Matrix, elenca i dispositivi dell’account con l’ultima volta che
  ciascuno è stato visto. **Rinomina** dà un nuovo nome a uno. **Disconnetti gli altri dispositivi** li toglie
  dall’account: perdono le loro chiavi e non possono più leggere ciò che arriva. Il server Matrix chiede prima la tua
  password.
- **Chiamate più vecchie:** in una chat con una persona, i riquadri di chiamata chiedono **Element Call** o **Chiamata
  più vecchia**. La chiamata più vecchia funziona con FluffyChat, Nheko ed Element sul computer, e squilla qui quando
  chiamano. I suoi segnali vanno come la chat, cifrati in una chat cifrata, tramite il tuo relay se lo spazio ne ha
  uno, altrimenti tramite il relay delle chiamate del tuo server Matrix; la chiamata in sé è cifrata (DTLS-SRTP).

**Perché:** le chat di Erevos nascondono chi parla con chi; un server Matrix non può. Così le chat Matrix restano a
parte e segnate, per le persone che altrimenti raggiungeresti solo su Matrix.

- **Cosa porta un messaggio:** i segni per l’aspetto delle parole, come il grassetto e le parole nascoste, si vedono
  come in una chat di Erevos (vedi [Chat tramite un relay](#relay)) e partono con il messaggio, così anche Element li
  mostra. Di ciò che invia un’altra app si vedono solo grassetto, corsivo, barrato, codice e parole nascoste: niente
  al suo interno viene eseguito, nessuna immagine viene presa, e un link mostra dove porta davvero. Gli indirizzi web
  si possono toccare, ed Erevos chiede prima di aprirne uno. Accanto a **Foto** e **File** ci sono **Fotocamera**,
  **Video**, **Scheda contatto** e **Qualità della foto**: una scheda contatto parte come file .vcf che ogni app apre,
  e una che arriva si vede come scheda appena tocchi **Mostra**, con **Aggiungi ai contatti**; un video parte senza le
  parti che dicono dove è stato girato o con quale telefono. Un messaggio che inoltri è segnato **Inoltrato** solo sul
  tuo telefono, così gli altri non sanno mai da dove viene.
- **Fissate, in fondo e con un nome:** fissare una stanza la rende la tua preferita su Matrix, così anche le tue altre
  app Matrix la mostrano fissata, e le stanze a bassa priorità vengono per ultime. Nell’elenco della schermata
  principale il tuo ultimo messaggio mostra ✓✓✓ appena tutti nella stanza l’hanno letto. **Dagli un nome qui** (una
  persona) o **Dalle un nome qui** (un gruppo), in fondo alla chat, dà a una stanza un nome tuo, solo su questo
  telefono; nessuno viene avvisato.
- **Bozze:** ciò che scrivi e non invii resta come bozza della chat, cifrata solo su questo telefono. Torna quando
  riapri la chat, anche dopo che Erevos è stato chiuso, e l’elenco della schermata principale la mostra nella riga
  della chat come **Bozza**. Un thread di Matrix non tiene una bozza sua.
- **Invia più tardi:** tieni premuto **Invia**, scegli un’ora (**Tra 1 ora**, **Stasera 20:00**, **Domani 09:00** o
  qualsiasi giorno e ora) e tocca **Invia più tardi**. Il messaggio aspetta su questo telefono, cifrato, tratteggiato
  dopo i messaggi della chat con la sua ora, e parte da questo telefono a quell’ora mentre Erevos è sbloccato, su
  Android anche in background; altrimenti appena viene sbloccato di nuovo. Solo testo. Toccalo per inviarlo subito o
  eliminarlo. Nelle chat nascoste parte solo mentre sono aperte, a meno che ricevano anche chiuse. Uno che un backup
  ripristinato ha riportato, la cui ora era prima del ripristino, non parte da solo: il telefono da cui viene il
  backup potrebbe averlo già inviato.
- **Invia di nuovo:** un tuo messaggio che mostra **Non inviato** ha **Invia di nuovo** ed **Elimina** nel suo menu.
- **Ricordamelo:** il menu di un messaggio ha **Ricordamelo**. Scegli un’ora: il messaggio, con il nome della sua
  chat, va in **Chat con me stesso** e te lo ricorda allora. Serve **Erevos** attivo in [Moduli](#modules).
- **Messaggi effimeri:** **Messaggi effimeri**, sotto il campo del messaggio, fissa un tempo per i nuovi messaggi,
  inviati o ricevuti: 5 minuti, 1 ora, 1 giorno o 1 settimana dopo l’invio di ciascuno. Allora se ne vanno da questo
  telefono, e i tuoi vengono ritirati anche per tutti nella chat (le loro app li mostrano come eliminati), o appena
  Erevos torna attivo. Ciò che hanno inviato gli altri resta a loro. **Effimero**, accanto a **Sondaggio** e
  **Posizione**, lo fa solo per il prossimo messaggio. I messaggi già nella chat restano.
- **Bloccare:** **Blocca**, in una chat con una persona, la aggiunge alla lista degli ignorati del tuo account: niente
  di suo raggiunge il tuo account Matrix, in nessuna delle sue app, e non viene avvisata. **Contatti bloccati**, nella
  schermata Matrix, li elenca, con **Sblocca**.

## XMPP {#xmpp}

In **Impostazioni** → **Relay e reti** → **XMPP**, uno spazio può accedere a un account XMPP, per chattare con persone
che usano Conversations, Monal, Gajim, Dino o un’altra app XMPP. Erevos parla da sé con il server XMPP, come quelle
app: nessun ponte sta nel mezzo.

- **Accesso:** il tuo indirizzo XMPP, come name@example.org, e la sua password. Erevos trova il server dall’indirizzo;
  **Server** serve solo se non lo trova (un nome, nome:porta o un indirizzo wss://). Erevos diventa un nuovo dispositivo
  dell’account. L’accesso e le chiavi del dispositivo restano cifrati in questo spazio, e sono nei backup: dopo un
  ripristino, l’account prosegue come nuovo dispositivo. Le sue chat nascoste possono avere un account XMPP proprio,
  vedi [Chat nascoste](#hidden).
- **Chat:** **Nuova chat** aggiunge l’indirizzo ai tuoi contatti, chiede alla persona di farti vedere quando è online,
  come fanno le altre app XMPP, e apre la chat. Chi chiede di aggiungerti compare in cima all’elenco e nella schermata
  XMPP, con **Accetta** e **Rifiuta**. I contatti che l’account ha già sono in **Contatti**.
- **Cifratura:** i messaggi sono cifrati con OMEMO, per ciascuno dei loro dispositivi e per gli altri dispositivi del
  tuo account, che leggono insieme: con OMEMO 2 per un dispositivo la cui app lo ha, come Kaidan, e con la versione 0.3,
  quella che parlano Conversations, Monal, Gajim e Dino, per gli altri. È codice proprio di Erevos, non verificato da
  terzi, controllato con altre librerie OMEMO. Se le loro app non hanno OMEMO, Erevos lo dice e scrive solo quando
  scegli **Scrivi senza cifratura** per quella chat; **Cifra di nuovo** torna indietro.
- **Le loro chiavi:** in fondo alla chat ci sono le impronte dei loro dispositivi. Confrontale con ciò che mostra la
  loro app, in un altro modo rispetto alla chat. Una chiave cambiata da quando è stata vista la prima volta lo dice. La
  chiave di questo dispositivo è nella schermata XMPP, due volte: come la mostrano le app con OMEMO 0.3 e come la mostra
  Kaidan. Un dispositivo ha una sola chiave in entrambe, scritta in due modi.
- **Segni:** un segno all’invio, due quando la loro app lo ha, tre quando lo leggono, come nelle chat di Erevos, per le
  app che inviano questi segni.
- **Rispondi, modifica, reagisci, elimina:** tieni premuto un messaggio per il suo menu: **Rispondi** gli risponde,
  **Modifica** cambia le parole di uno tuo, **Elimina** ritira uno tuo per tutti nella chat, e le emoji vi reagiscono;
  toccare una reazione sotto un messaggio reagisce allo stesso modo, o ritira la tua. Funzionano con le app che fanno
  lo stesso, come Conversations, Dino, Gajim, Monal e Kaidan; le altre app mostrano una risposta con una citazione di
  ciò a cui risponde, e una modifica come un nuovo messaggio. Le parole di una risposta e di una modifica sono cifrate
  come la chat, ma a quale messaggio si riferisce una risposta, modifica, reazione o eliminazione, e l’emoji di una
  reazione, vanno come le inviano quelle app, non cifrate, quindi i server XMPP le vedono. In un gruppo, un messaggio
  può ricevere risposta, reazione o essere eliminato una volta che il gruppo lo ha rimandato indietro. Toccare la
  citazione di una risposta va al messaggio a cui risponde. **Inoltra** invia uno o più messaggi a un’altra chat XMPP.
  **Fissa solo per me** tiene un messaggio in cima alla chat, solo su questo telefono. **Seleziona** sceglie più
  messaggi da copiare, inoltrare o eliminare; **Elimina** lì ritira solo i tuoi.
- **Questo telefono o tutti:** **Elimina**, per un messaggio o più, chiede prima: **Questo telefono** li elimina solo
  qui, e restano nascosti se arrivano di nuovo; **Per tutti** li ritira come detto sopra, offerto solo quando ognuno
  può essere ritirato.
- **Scrittura:** quando l’app dell’altra persona dice che sta scrivendo, **sta scrivendo…** compare sotto la chat.
  Erevos lo dice di te solo se attivi **Dire quando scrivo** nella schermata XMPP, e solo a un contatto che vede la
  tua presenza, mai in un gruppo; all’inizio è spento, perché passa dal server XMPP senza cifratura, quindi il server
  sa ogni volta che scrivi.
- **Online:** sotto il nome di un contatto compare **Online**, **Assente** o **Non disturbare**, con le parole che ha
  messo, o quando era online l’ultima volta, come dicono le sue app, e la sua foto nell’elenco delle chat ha un punto
  verde finché è online; solo per un contatto che ti lascia vedere la sua presenza. Come in ogni app XMPP, i contatti
  che vedono la tua presenza vedono quando Erevos è connesso; passa dai server XMPP senza cifratura.
- **Foto del profilo:** una stanza Matrix, o la persona in una chat con una persona, mostra la sua foto nell’elenco
  delle chat, e così un contatto XMPP. **Scegli una foto**, nella schermata XMPP, imposta la tua per i tuoi contatti;
  **Rimuovi** la toglie. Le foto non sono cifrate in nessuna app Matrix o XMPP: il server le vede, e i tuoi contatti
  vedono la tua.
- **Bloccare:** **Blocca**, in fondo a una chat, impedisce a messaggi, chiamate e richieste di quella persona di
  raggiungere il tuo account XMPP, in tutte le sue app, come fa il server XMPP (XEP-0191); non viene avvisata.
  **Sblocca** la fa passare di nuovo. Chi è stato bloccato in un’altra app dell’account è bloccato anche qui.
- **Messaggi di prima:** ciò che è arrivato mentre Erevos era chiuso si scarica dall’archivio del server alla
  connessione, se il server ne tiene uno. Un messaggio inviato prima che questo dispositivo accedesse, o non destinato a
  lui, appare bloccato.
- **Foto e file:** **Foto** e **File**, sotto la casella del messaggio, inviano un file fino a 50 MB, o meno se il tuo
  server XMPP ne accetta meno, tramite il caricamento di file del server. In una chat cifrata viene prima cifrato su
  questo telefono, con una chiave fatta solo per lui, e la chiave va nel messaggio, cifrata con OMEMO, così il server
  tiene solo ciò che non può leggere; Conversations, Monal, Gajim e Dino lo aprono. In una chat scritta senza
  cifratura il file va così com’è. Una foto, un suono o un file che arriva si scarica solo toccando **Mostra foto**,
  **Riproduci** o **Salva**. Su Android, i file passano per Tor come la chat.
  Tocca una foto mostrata per vederla a tutto schermo, come nella chat di un contatto: due dita o un doppio tocco la
  ingrandiscono, ruota con il telefono, e **Salva** la tiene (vedi Foto e file, in [Chat tramite un relay](#relay)).
- **Sticker:** **Sticker** invia i tuoi sticker fatti da foto (**Miei**) come foto, crittografate come la chat; le altre
  app XMPP li mostrano come foto. Ci sono anche le serie integrate: ogni sticker parte come la sua immagine, fatta sul
  tuo dispositivo. Un pacchetto di sticker inviato da un’altra app (XEP-0449) non viene scaricato: mostra le sue parole.
- **Messaggi vocali:** tieni premuto il microfono sotto il campo del messaggio per registrare, e rilascia per inviare,
  come in una chat Matrix. Parte come file audio, cifrato come la chat, come lo invia Conversations. Anche un messaggio
  vocale di Conversations o di un’altra app XMPP (un file .m4a o .ogg) si vede come messaggio vocale, con **Riproduci**
  e la sua durata.
- **Gruppi:** un **gruppo privato** è solo per i suoi membri, e ognuno vede chi sono gli altri. Ogni messaggio al suo
  interno è cifrato con OMEMO per i dispositivi di ogni membro, come fanno i gruppi privati di Conversations, così i
  server XMPP non possono leggerlo; ciò che è stato scritto prima che entrassi appare bloccato. Un **canale** è ogni
  altro gruppo: non è cifrato, quindi tutti quelli che ci sono, e i server, possono leggerlo, e la sua schermata lo dice.
  Nella schermata XMPP, **Nuovo gruppo** crea un gruppo privato sul tuo server XMPP da un nome e dai contatti che scegli,
  e **Entra in un gruppo** entra in uno con il suo indirizzo, come nome@conference.example.org, con la sua password se la
  chiede. Sotto un gruppo privato, **Membri** elenca le sue persone con le loro chiavi, da confrontare come in una chat,
  e segnala chi non ha chiavi OMEMO e non può leggere ciò che è cifrato; il suo amministratore può usare **Aggiungi
  persone**. Un contatto che ti invita in un gruppo compare sotto **Inviti a gruppi**, con **Partecipa** e **Rifiuta**;
  l’invito di chiunque altro non viene mostrato. I tuoi gruppi seguono le altre app XMPP del tuo account tramite i suoi
  segnalibri: un gruppo in cui entri là lo trovi anche qui, e **Lascia il gruppo** lo lascia anche là. Un canale
  avvisa solo dei messaggi che ti nominano. In un gruppo, **proprietario** e **admin** compaiono accanto ai membri che
  lo sono, e la **Descrizione** del gruppo compare sotto il suo oggetto.
- **Gestire un gruppo:** gli admin di un gruppo vedono **Gestisci il gruppo** nella sua schermata. Impostano
  l’**Oggetto**; il proprietario può anche **rinominarlo**. In un gruppo privato, ogni membro ha **Rimuovi** (i
  messaggi del gruppo non gli arrivano più, e un admin può riaggiungerlo) ed **Escludi** (non può rientrare finché un
  admin non lo consente); il proprietario può **rendere admin** un membro o **rimuoverlo come admin**. In un canale,
  **Gestisci il gruppo** elenca chi c’è dentro, ciascuno con **Rimuovi**. Gli admin non possono rimuovere altri admin;
  solo il proprietario. Il proprietario imposta anche la **Descrizione** del gruppo; alcuni server non la consentono, e
  Erevos lo dice.
- **Chiamate:** i due riquadri in alto nella chat chiamano la persona, a voce o in video, sulla stessa schermata di
  chiamata delle chiamate di Erevos, e le sue chiamate squillano qui allo stesso modo, finché questo spazio è aperto;
  una chiamata da qualcuno che non è nei tuoi contatti appare solo come persa. Funziona con le app che chiamano come
  Conversations (Jingle, con lo squillo di XEP-0353). La chiamata in sé è cifrata (DTLS-SRTP), ma l’impronta della sua
  chiave passa per i server XMPP così com’è, senza cifratura end-to-end, quindi quei server potrebbero mettersi in
  mezzo. Passa per il relay per le chiamate di questo spazio quando c’è, altrimenti per il server TURN del server XMPP,
  e solo da lì, così l’altra persona non conosce il tuo indirizzo; senza nessuno dei due, va diretta, e lo conosce. Una
  chiamata non passa mai per Tor: il relay per le chiamate o il server TURN vede l’indirizzo di questo telefono.
  In una chiamata vocale, ognuno di voi può attivare il video: **Aggiungi video**, sulla schermata della chiamata,
  accende la tua fotocamera e chiede prima all’altra persona, che sceglie **Non ora** o **Attiva il video**. Il video
  parte solo se dice di sì, e un no lascia la chiamata com’era. Funziona con le app che aggiungono il video a una
  chiamata come Conversations.
- **Chiamate di gruppo:** in un gruppo privato in cui sei, i due riquadri in alto avviano una chiamata vocale o una
  videochiamata nel gruppo, e una chiamata avviata in uno dei tuoi gruppi squilla qui, finché questo spazio è aperto.
  Mentre in un gruppo è in corso una chiamata, un riquadro in alto e una riga sotto il suo nome lo dicono, e toccare uno
  dei due ti unisce alla chiamata, finché non ne esce l’ultima persona. Funziona con Dino, che chiama nei gruppi allo
  stesso modo (MUJI): ogni chiamata ha una stanza tutta sua sul servizio dei gruppi, a cui possono unirsi solo i membri
  del gruppo, e ogni telefono della chiamata si collega direttamente a ciascuno degli altri, come nelle chiamate di
  gruppo di Erevos, tramite il relay per le chiamate di questo spazio o il server TURN del server XMPP, otto persone al
  massimo. Come in una chiamata con una persona, la chiamata è cifrata (DTLS-SRTP), ma le impronte delle sue chiavi, e
  gli inviti, passano per i server XMPP così come sono, e il servizio dei gruppi vede chi è nella chiamata e quando.
  L’account XMPP proprio delle chat nascoste chiama nei suoi gruppi allo stesso modo, finché le chat nascoste sono
  aperte; da chiuse, con **Ricevere da chiuse** attivo, una chiamata che arriva in uno dei suoi gruppi appare come
  persa.
- **Non anonimo:** il server XMPP vede il tuo account, i tuoi contatti, chi parla con chi e quando, e, senza Tor, da
  dove. Il server dell’altra persona vede lo stesso delle sue chat con te.
- **Tramite Tor:** su Android, la schermata XMPP, e quella prima dell’accesso, sceglie il Tor dell’account:
  **Disattivato** (il predefinito: diretto, e il server vede il tuo indirizzo), **Come lo spazio** (come dice la scelta
  di questo spazio in **Impostazioni** → **Relay e reti** → **Tor**: con **Messaggi** tramite Tor appena Tor è pronto, i
  file diretti; con **Tutto** solo tramite Tor, anche i file; con **Niente** diretto) o **Sempre tramite Tor** (solo
  tramite Tor, qualunque cosa faccia lo spazio, anche all’accesso, e nulla parte finché Tor non si connette). La sua
  connessione, la ricerca del suo server e i suoi file seguono la scelta; Tor usa i ponti dello spazio. Le chiamate non
  passano mai tramite Tor, e non si fa l’anteprima dei link finché l’account non deve andare diretto. Dove Erevos non può
  aprire una connessione sua (l’app web, un computer), usa il WebSocket del server, diretto, e un server senza non si
  raggiunge.
- **Una chat tramite Tor:** **Tramite Tor** sotto una chat o un gruppo, disattivato finché non lo attivi, la manda solo
  tramite Tor. Una sola connessione al server porta tutte le chat dell’account, quindi finché una chat lo ha attivo,
  tutto l’account passa solo tramite Tor, qualunque sia la sua scelta, e la schermata XMPP lo dice.
- **Notifiche:** un messaggio che arriva mostra un avviso e conta nel numero sull’icona di Erevos, come nelle chat di
  Erevos stesso, finché questo spazio è aperto; su un computer, finché Erevos è in funzione. Su Android, **Notifiche**,
  in fondo a una chat, la silenzia o le dà un suono suo; una chat silenziata non conta. **Aspetto della chat**, accanto,
  dà alla chat un aspetto suo.
- **Mentre questo spazio è chiuso:** su Android, **Avvisa dei nuovi messaggi**, in **Mentre questo spazio è chiuso**
  nella schermata di XMPP, lascia che questo spazio dica «New message» quando arriva qualcosa su XMPP mentre è aperto un
  altro spazio, come fanno le sue chat con **Anche mentre è aperto un altro spazio** in **Impostazioni** →
  **Notifiche** → **In background**, che serve anch’esso. Non dice mai cosa, da chi o in quale chat, e una chiamata
  allora non squilla: solo la chiave dello spazio apre ciò che è arrivato. Per questo il server XMPP avvisa il relay di
  questo spazio di ogni messaggio finché nessuna app dell’account è attiva, così il server XMPP conosce il nome del
  relay, e il relay quando arrivano messaggi. Spento finché non lo accendi; serve un relay aggiornato per questo, che i
  server XMPP possano raggiungere (chi lo gestisce apre una porta per loro), e un server XMPP che mandi avvisi alle app
  inattive, come fa la maggior parte.
- **Un nuovo account:** nella schermata di accesso, **Crea un nuovo account** ne crea uno su un server XMPP che lo
  permette (XEP-0077), da un indirizzo e una password. Un server che chiede un captcha, o crea account solo sul suo
  sito, lo dice e dà la sua pagina se ce l’ha; crea l’account lì, poi accedi qui.
- **Password ed eliminazione:** **Account**, nella schermata XMPP, ha **Cambia la password** ed **Elimina l’account**,
  che elimina l’account dal server per sempre, dopo due domande, la seconda chiede l’indirizzo. Erevos dimentica le
  sue chiavi; l’indirizzo potrebbe non poter essere creato di nuovo.
- **Trovare gruppi:** **Trova un gruppo** ha **Gruppi sul tuo server**, quelli che il server lascia trovare a tutti, e
  **Cerca gruppi pubblici**, che interroga search.jabber.network: viene a sapere le parole che cerchi e vede il nome
  del tuo server, e il tuo server no. Un gruppo pubblico è un canale, non cifrato.
- **Posizioni:** **Posizione** invia dove sei come link geo:, come fa Conversations, cifrato come la chat; una che
  arriva così si mostra come posizione, con **Apri nelle mappe** su Android.
- **Anteprime dei link:** in una chat scritta senza cifratura, con le **Anteprime dei link** attive, il primo link
  parte con la sua anteprima (XEP-0511), e una che arriva così si mostra sotto le parole. Una chat cifrata non ne
  invia, perché direbbe ai server cos’è il link.

**Perché:** le chat di Erevos nascondono chi parla con chi; un server XMPP non può. Così le chat XMPP restano a parte e
segnate, per le persone che altrimenti raggiungeresti solo su XMPP.

- **Cosa porta un messaggio:** i segni per l’aspetto delle parole e indirizzi web da toccare, come in una chat Matrix,
  con **Fotocamera**, **Video**, **Scheda contatto** e **Qualità della foto** (vedi [Matrix](#matrix)). In un gruppo,
  scrivere @ mostra i suoi membri, e un tocco scrive il nome di quel membro nel gruppo, come fa Conversations.
- **Un nome tuo:** **Dagli un nome qui**, in fondo alla chat di un contatto, tiene un nome tuo per lui nei tuoi
  contatti sul tuo server XMPP, così anche le tue altre app XMPP lo mostrano. Non viene avvisato. Lascialo vuoto per
  mostrare di nuovo il suo indirizzo.
- **Bozze:** ciò che scrivi e non invii resta come bozza della chat, cifrata solo su questo telefono. Torna quando
  riapri la chat, anche dopo che Erevos è stato chiuso, e l’elenco della schermata principale la mostra nella riga
  della chat come **Bozza**.
- **Invia più tardi:** tieni premuto **Invia**, scegli un’ora (**Tra 1 ora**, **Stasera 20:00**, **Domani 09:00** o
  qualsiasi giorno e ora) e tocca **Invia più tardi**. Il messaggio aspetta su questo telefono, cifrato, tratteggiato
  dopo i messaggi della chat con la sua ora, e parte da questo telefono a quell’ora mentre Erevos è sbloccato, su
  Android anche in background; altrimenti appena viene sbloccato di nuovo. Solo testo. Toccalo per inviarlo subito o
  eliminarlo. Nelle chat nascoste parte solo mentre sono aperte, a meno che ricevano anche chiuse. Uno che un backup
  ripristinato ha riportato, la cui ora era prima del ripristino, non parte da solo: il telefono da cui viene il
  backup potrebbe averlo già inviato.
- **Invia di nuovo:** un tuo messaggio che mostra **Non inviato** ha **Invia di nuovo** ed **Elimina** nel suo menu.
- **Ricordamelo:** il menu di un messaggio ha **Ricordamelo**. Scegli un’ora: il messaggio, con il nome della sua
  chat, va in **Chat con me stesso** e te lo ricorda allora. Serve **Erevos** attivo in [Moduli](#modules).
- **Messaggi effimeri:** **Messaggi effimeri**, sotto il campo del messaggio, elimina da questo telefono i nuovi
  messaggi quel tempo dopo l’invio, ed **Effimero** lo fa solo per il prossimo messaggio. L’altra parte li tiene: XMPP
  non ha modo di eliminarli lì. I messaggi già qui restano.
- **Mostrati offline:** in fondo a una chat con una persona, **Mostrati offline** ti mostra offline a lei, qualunque
  cosa il tuo account mostri agli altri, e non le dice nulla di ciò che leggi o scrivi, né che i suoi messaggi sono
  arrivati. Un gruppo che condividete ti mostra ancora. Vale solo per la connessione di questo telefono.
- **Verifica di persona:** sotto **Le loro chiavi**, **Verifica di persona** mostra un codice del tuo indirizzo e
  delle tue chiavi, come fa Conversations. Fotografa lì il loro: ogni loro dispositivo la cui chiave corrisponde viene
  segnato come verificato. Una chiave diversa non segna nulla e lo dice: qualcuno potrebbe stare in mezzo, o hanno
  cambiato app. Non si invia nulla.
- **Contatti bloccati:** la schermata XMPP elenca chi l’account blocca, con **Sblocca**.

## Chat con altre app Nostr {#nostr-chats}

In **Impostazioni** → **Relay e reti** → **Chat Nostr**, uno spazio può avere una chiave Nostr tutta sua, per chattare a
tu per tu o in gruppo con persone che usano Damus, Amethyst, Primal, 0xchat o un’altra app Nostr che invia i messaggi
privati come chiede NIP-17. Non è [Tramite Nostr](#nostr), che porta le chat proprie di Erevos.

- **La chiave:** **Crea una chiave Nostr** ne crea una per questo spazio; **Oppure porta una chiave da un’altra app
  Nostr** prende il nsec di una chiave che hai già, e legge ciò che i suoi relay tengono ancora. La chiave e le sue chat
  sono tenute cifrate in questo spazio, e sono nei backup: dopo un ripristino tornano com’erano. Le sue chat nascoste
  possono avere una chiave Nostr propria, vedi [Chat nascoste](#hidden). **Mostra la chiave segreta (nsec)** la mostra,
  per annotarla o portarla in un’altra app: chi ce l’ha legge queste chat e scrive al posto tuo.
- **La tua chiave Nostr:** dai il suo npub alle persone che devono scriverti, con **Copia** o **Mostra il codice QR**.
  **Il tuo nome**, se ne dai uno, è pubblico: le altre app Nostr lo mostrano al posto del tuo npub. Lì cambia solo il nome: una
  foto o delle parole che un’altra app della tua chiave ha messo nel tuo profilo restano.
- **Chat:** **Nuova chat** prende il suo npub (o nprofile), dal suo profilo nella sua app, o un nome come
  nome@example.org (NIP-05). **Mostra le persone che segui**, qui sotto, elenca le persone che la tua chiave Nostr
  segue (la sua lista pubblica dei seguiti, cercata anche su relay che raccolgono tali liste e sui relay dove scrive la
  tua chiave), con i loro nomi: tocca una persona per scriverle. Quando non trova nessuno, dice perché, di chi ha
  cercato la lista e come ha risposto ogni relay. Non viene caricato nulla finché non lo tocchi, e nessuna foto del
  profilo. Le chat sono anche nella lista della home, ognuna segnata **Nostr**; il pulsante **Nostr** mostra solo loro, e lì **Nuova chat** apre questa schermata. **Dagli un nome qui** dà a una chat un nome che vedi
  solo tu.
- **Gruppi:** **Nuovo gruppo** ne crea uno con due o più delle persone con cui chatti, al massimo venti, con un nome se
  vuoi. I gruppi Nostr non hanno amministratori: un gruppo sono le persone che i suoi messaggi nominano, ogni messaggio
  va a ciascuna, cifrato per ciascuna, e nessuno può essere aggiunto o tolto in seguito; un gruppo con altre persone è
  un gruppo nuovo. **Dai un nome al gruppo** lo rinomina per tutti, con il tuo prossimo messaggio. Un messaggio che
  un’altra app manda a te e ad altri appare anch’esso come gruppo, ogni messaggio con chi l’ha scritto.
- **Foto e file:** **Foto** e **File**, sotto il campo del messaggio di una chat, ne inviano uno fino a 20 MB. È cifrato
  su questo telefono con una chiave fatta solo per lui (AES-GCM, come chiede NIP-17) e messo su un server di file
  Blossom, che tiene solo ciò che non può leggere; la sua chiave va nel messaggio, cifrata come i messaggi, e il
  caricamento è firmato da una chiave fatta solo per esso, così il server non sa di chi è. Su Android i file passano
  tramite Tor come queste chat. **Server di file** dice dove vanno, al primo che ne accetta uno: blossom.primal.net,
  blossom.band e nostr.download, se non li cambi. Una foto o un file che arriva viene scaricato solo quando tocchi
  **Mostra foto** o **Salva**, e si apre solo se è quello che è stato inviato.
  Tocca una foto mostrata per vederla a tutto schermo, come nella chat di un contatto: due dita o un doppio tocco la
  ingrandiscono, ruota con il telefono, e **Salva** la tiene (vedi Foto e file, in [Chat tramite un relay](#relay)).
- **Reazioni:** tieni premuto un messaggio per aprire il suo menu e reagire con 👍, ❤️, 😂, 😮, 😢 o 🙏, o con una delle
  altre dietro **+**; sotto compaiono le reazioni, l’ultima di ogni persona, come le mandano le altre app Nostr
  (NIP-25). Tocca una reazione sotto un messaggio per aggiungere la stessa, o tocca la tua per ritirarla; alle app degli
  altri viene chiesto di toglierla.
- **Risposte:** **Rispondi**, nel menu di un messaggio tenuto premuto, gli risponde. Il messaggio compare sopra il campo
  del messaggio, con una ✕ per lasciarlo, e poi sopra la tua risposta nella chat, dove un tocco porta a lui. Anche le
  altre app Nostr la mostrano come risposta (NIP-17 la segna come risposta). Anche una foto, un file o un messaggio
  vocale inviato mentre compare gli risponde. **Copia**, nello stesso menu, prende le parole di un messaggio.
- **Messaggi vocali:** tieni premuto il microfono sotto il campo del messaggio per registrare, e lascia per inviare;
  scorri a sinistra prima di lasciare per scartare la registrazione. Un minuto è il massimo, e una pressione di meno di
  un secondo non invia nulla. Va come un file: cifrato su questo telefono e messo su un server di file, con la sua
  durata nel messaggio; se un’altra app lo riproduce come messaggio vocale o come file audio lo decide quell’app. Uno
  che arriva con la sua durata si ascolta con **Riproduci**, e viene scaricato solo quando lo riproduci.
- **Fissa solo per me:** tiene un messaggio in cima alla chat, solo su questo telefono; nessun altro lo vede.
- **Seleziona:** sceglie più messaggi da copiare con **Copia**, da inoltrare con **Inoltra** a un’altra chat Nostr (foto
  e file vengono inviati di nuovo) o da eliminare con **Elimina**. Elimina li toglie da questo telefono e chiede alle
  app degli altri di eliminare anche i tuoi: le loro app possono farlo oppure no.
- **Questo telefono o tutti:** **Elimina** chiede prima: **Questo telefono** li elimina solo qui, e restano nascosti
  se arrivano di nuovo; **Per tutti** chiede anche alle app degli altri di eliminare i tuoi (NIP-09), cosa che possono
  fare o no.
- **Sticker:** **Sticker** invia i tuoi sticker fatti da foto (**Miei**) come foto, crittografate: le altre app Nostr li
  mostrano come foto. Ci sono anche le serie integrate: ogni sticker parte come la sua immagine, fatta sul tuo
  dispositivo.
- **Cifratura:** ogni messaggio è cifrato per l’altra persona e firmato da te, poi avvolto di nuovo da una chiave creata
  solo per quel messaggio, con l’ora spostata indietro fino a due giorni (NIP-17, con NIP-44 e NIP-59). I relay vedono a
  chi è destinato, non chi l’ha scritto, quando né cosa dice. Una copia va ai tuoi relay, così le tue altre app Nostr
  con questa chiave leggono anche loro. È codice proprio di Erevos, non verificato da terzi, controllato con l’esempio
  dello stesso NIP-17 e con nostr-tools.
- **Dove arrivano i tuoi messaggi:** i relay a cui le altre app mandano i tuoi messaggi: relay.damus.io, nos.lol e
  relay.primal.net se non li cambi, al massimo tre. Erevos li fa sapere alle altre app (una lista kind 10050) quando
  cambiano e una volta alla settimana. Invia ai relay che indica l’app dell’altra persona; un’app che non ne indica
  nessuno non può ancora ricevere un messaggio, ed Erevos lo dice. Una chiave portata da un’altra app legge dove
  quell’app ha detto che arrivano i tuoi messaggi (la sua lista kind 10050), a meno che tu non li abbia cambiati qui, e
  fa sapere di nuovo quella lista, così le due app ricevono gli stessi messaggi; legge quei relay dal loro inizio, e
  recupera una volta ciò che i relay indicati nelle liste precedenti della chiave conservano ancora.
- **Vecchi messaggi privati:** molte app mandano e tengono ancora i messaggi privati alla vecchia maniera (NIP-04, kind
  4); Damus e Primal li hanno mostrati per anni. Erevos li legge anche, passati e nuovi, e li mostra nelle stesse chat:
  sui relay dove arrivano i tuoi messaggi e su altri quattro al massimo, quelli che legge l’altra app della tua chiave
  (la sua lista kind 10002, per una chiave portata da un’altra app) e relay.damus.io, nos.lol e relay.primal.net. Anche
  questi messaggi sono cifrati, ma i relay vedono chi ha scritto a chi e quando. Erevos stesso manda solo alla maniera
  di NIP-17.
- **Post pubblici:** in una chat con una persona, **Post pubblici** mostra quello che pubblica per tutti (kind 1) e i
  post di altri che ha condiviso di nuovo, dal più recente, trenta alla volta, con **Post meno recenti** per averne
  altri. È in sola lettura: da qui non si può rispondere, reagire né pubblicare nulla. Viene cercato quando si apre, sui
  relay usati per le ricerche e su quelli dove, secondo la sua lista di relay (NIP-65), scrive, come dice la scelta Tor
  di questo spazio, e nulla viene conservato. Non vengono aperte immagini né link: appaiono come indirizzi, che si
  possono copiare. Un post con un avviso di contenuto mostra le sue parole dopo un tocco su **Mostra**. Un account che
  pubblica solo per tutti, come quello di un progetto, non manda messaggi privati: la sua chat resta vuota, e i suoi
  post sono qui.
- **Il feed pubblico:** nella schermata principale, il pulsante **Pubblico** mostra un solo feed con ciò che le persone
  che la tua chiave Nostr segue pubblicano per tutti, e ciò che hanno condiviso di nuovo, e con i messaggi delle stanze
  Matrix pubbliche in cui sei (stanze a cui può unirsi chiunque), dai più recenti, come in Amethyst: il volto di chi ha
  scritto, con una piccola **N** o **M**, il nome, quando, le parole, le foto dentro il post (una a tutta larghezza, da
  due a quattro in una griglia) e, per il primo link, una scheda con immagine, sito, titolo e una riga. Per Matrix, la
  riga sotto il nome dice la stanza e il suo server: toccala per aprire la stanza. Ne arrivano altri arrivando in fondo,
  o con **Post meno recenti**; tira la lista verso il basso per i più recenti (in un browser, **Cerca di nuovo**).
  Seguire le persone si fa ancora in un’altra app Nostr con la stessa chiave. La tua lista di seguiti, dove scrivono (le
  loro liste NIP-65) e i loro post si cercano solo finché il feed si vede, sui relay delle ricerche, su quelli che
  raccolgono liste e su quelli su cui scrivono, come dice la scelta Tor dello spazio; i nomi solo per i post che si
  vedono. Non si conserva nulla.
  **Foto**, sopra il feed, è la scelta che conta per la privacy. Una foto o una scheda di link arriva dal server dove l’ha
  messa chi ha scritto il post, e quel server vede l’indirizzo da cui è stata presa, tramite Tor quello di un’uscita Tor,
  e che qualcuno l’ha aperta. **Sempre** le mostra subito, tramite Tor quando Tor è attivo in questo spazio; **Solo
  tramite Tor** le mostra solo quando Tor è attivo, altrimenti con un tocco; **Con un tocco** non ne prende nessuna prima
  che la tocchi. **Anteprime dei link** attiva o disattiva le schede. Non si prende nulla finché il feed non si vede, una
  foto è tenuta solo finché si vede il suo post, e nessuna è salvata; quella che non arriva mostra **Mostra la foto** per
  riprovare. Si prendono solo indirizzi su internet, mai uno di questo telefono o della tua rete di casa.
  Sotto un post Nostr: **Rispondi** scrive una risposta, **Condividi di nuovo** lo mostra ai tuoi follower (chiede
  prima), il cuore gli mette Mi piace, e la freccia condivide un link ad esso. I suoi tre puntini: **Copia il testo**, i
  **Post pubblici** di chi l’ha scritto, **Invia un messaggio**, e **Ritira** per un tuo post. Tocca un post per aprirlo
  con quanti hanno messo Mi piace e l’hanno condiviso di nuovo, e le sue risposte. **Nuovo post**, la penna, scrive un
  post pubblico, con fino a quattro foto. Le risposte, le condivisioni, i Mi piace e i post sono pubblici e firmati con
  la chiave Nostr dello spazio: chiunque può leggerli, e si vede che sono tuoi; una foto che aggiungi viene messa non
  cifrata sul server dei file dello spazio, come deve essere per un post pubblico. Sotto un messaggio Matrix:
  **Rispondi**, **Reagisci** (a scelta tra sei) e condividi (un link matrix.to), e nei suoi tre puntini **Copia il testo**
  e **Apri la stanza**. È sempre la chiave e l’account di questo spazio, mai quelli propri delle chat nascoste.
- **Sondaggi:** nel feed pubblico un sondaggio si vede con le sue risposte, per votare con **Vota** e, finché è aperto,
  con **Risultati**. **Nuovo post** e poi **Sondaggio** ne crea uno: fino a 10 risposte, una o più da scegliere, aperto
  per 1, 3 o 7 giorni. I voti sono pubblici: chiunque può vedere cosa hai scelto. Una tua reazione sotto un post si
  ritira toccandola di nuovo.
- **Emoji personalizzate:** nel feed pubblico, le emoji create da altre app si caricano come le foto dei post, come
  dicono sopra **Foto** e Tor. Nelle chat private compaiono come :nome: e non vengono mai caricate.
- **Segni:** un ✓ appena uno dei suoi relay ha accettato il messaggio. NIP-17 non rimanda niente: né quando la sua app
  lo ha, né quando lo legge. Leggere una chat qui non lo dice a nessuno.
- **Non anonimo:** la tua chiave è la stessa per tutti quelli a cui scrivi, e chiunque abbia un npub può scrivergli. I
  relay dove arrivano i tuoi messaggi vedono la tua chiave leggerli e, senza Tor, da dove. Solo la connessione che legge
  i tuoi relay dice loro chi legge, quando un relay lo chiede (NIP-42); l’invio e la ricerca di persone, mai.
- **Tramite Tor:** su Android, **Tor** in questa schermata sceglie come questo account Nostr raggiunge i suoi relay e
  server di file, come l’account di ogni rete: **Disattivato**, il predefinito per una nuova chiave, diretto; **Come lo
  spazio**, come dice la scelta dello spazio in **Impostazioni** → **Relay e reti** → **Tor** (con **Messaggi** tramite
  Tor appena Tor è pronto, con **Tutto** solo tramite Tor); **Sempre tramite Tor**, solo tramite Tor, avviato per lui,
  mai diretto. Anche una chiave di prima di questa scelta parte da **Disattivato**. La schermata dice da dove passano ora.
  Nell’app web e su un computer passano dirette.
  **Tramite Tor**, in fondo a una chat, invia solo quella chat esclusivamente tramite Tor, qualunque sia la modalità
  dello spazio, su circuiti propri, così che nessuna uscita Tor porti i suoi messaggi insieme a quelli di un’altra chat:
  ciò che invii in essa, la ricerca di dove leggono, e le sue foto e i suoi file; senza Tor non parte nulla. Ciò che
  arriva a te segue sempre la modalità dello spazio, perché una sola connessione legge i tuoi messaggi per tutte le
  chat. Resta solo su questo telefono.
- **Notifiche:** un messaggio che arriva mostra un avviso e conta nel numero sull’icona di Erevos, come nelle chat di
  Erevos stesso, finché questo spazio è aperto; su un computer, finché Erevos è in funzione. Su Android, **Notifiche**,
  in fondo a una chat, la silenzia o le dà un suono suo; una chat silenziata non conta. **Aspetto della chat**, accanto,
  dà alla chat un aspetto suo.
- **Non ancora:** file che un’altra app cifra in un altro modo (appaiono come un file che Erevos non apre).

**Perché:** tante persone sono su Nostr e ci resteranno. Così scrivi loro da Erevos, a parte e segnato, perché una
chiave Nostr è la stessa per tutti quelli a cui scrivi, mentre le chat proprie di Erevos nascondono chi parla con chi.

- **Cosa porta un messaggio:** come in una chat Matrix (vedi [Matrix](#matrix)), e **Posizione**, che invia dove sei
  come indirizzo geo: e link a una mappa che ogni app Nostr può mostrare; un luogo inviato così si vede come luogo. In
  un gruppo, scrivere @ mostra i suoi membri, nominati in modo che ogni app Nostr sappia chi si intende. Un messaggio
  che inoltri è segnato **Inoltrato** solo sul tuo telefono.
- **Bozze:** ciò che scrivi e non invii resta come bozza della chat, cifrata solo su questo telefono. Torna quando
  riapri la chat, anche dopo che Erevos è stato chiuso, e l’elenco della schermata principale la mostra nella riga
  della chat come **Bozza**.
- **Invia più tardi:** tieni premuto **Invia**, scegli un’ora (**Tra 1 ora**, **Stasera 20:00**, **Domani 09:00** o
  qualsiasi giorno e ora) e tocca **Invia più tardi**. Il messaggio aspetta su questo telefono, cifrato, tratteggiato
  dopo i messaggi della chat con la sua ora, e parte da questo telefono a quell’ora mentre Erevos è sbloccato, su
  Android anche in background; altrimenti appena viene sbloccato di nuovo. Solo testo. Toccalo per inviarlo subito o
  eliminarlo. Nelle chat nascoste parte solo mentre sono aperte, a meno che ricevano anche chiuse. Uno che un backup
  ripristinato ha riportato, la cui ora era prima del ripristino, non parte da solo: il telefono da cui viene il
  backup potrebbe averlo già inviato.
- **Ricordamelo:** il menu di un messaggio ha **Ricordamelo**. Scegli un’ora: il messaggio, con il nome della sua
  chat, va in **Chat con me stesso** e te lo ricorda allora. Serve **Erevos** attivo in [Moduli](#modules).
- **Messaggi effimeri:** **Messaggi effimeri**, sotto il campo del messaggio, elimina da questo telefono i nuovi
  messaggi, inviati o ricevuti, quel tempo dopo l’invio. I tuoi portano quel tempo (NIP-40), così la loro app e i
  relay che lo rispettano li eliminano allora; gli altri li tengono. **Effimero** lo fa solo per il prossimo
  messaggio. Un messaggio che arriva con un suo tempo se ne va a quell’ora.
- **Bloccare:** **Blocca**, in fondo a una chat, scarta su questo telefono ciò che invia quella chiave, non letto; non
  torna se la sblocchi. Non viene avvisata: Nostr non può impedire a nessuno di scriverti. **Contatti bloccati**,
  nella schermata delle chat Nostr, li elenca, con **Sblocca**.
- **Verifica di persona:** in una chat con una persona, **Verifica di persona** mostra il codice della tua chiave.
  Fotografa il codice che mostra la loro app (nostr:npub…): la chat viene segnata come verificata quando è la chiave
  di questa chat. Non si invia nulla.

## Telegram {#telegram}

Solo in Erevos+, su Android, uno spazio può accedere al tuo account Telegram e chattare con persone su Telegram, in **Impostazioni** → **Relay e reti** → **Telegram**. Erevos non è fatto da Telegram e usa l’API di Telegram. Le chat si uniscono all’elenco della schermata iniziale, segnate come **Telegram**, con un chip tutto loro.

- **Accesso:** tocca **Accedi a Telegram**, scrivi il tuo numero di telefono con il prefisso del paese, poi il codice che Telegram invia: alla sua app sugli altri tuoi dispositivi, via SMS o con una chiamata; **Invia di nuovo il codice** lo chiede ancora. Se il tuo account ha una password a due passaggi, Erevos la chiede e mostra il tuo suggerimento. Se Telegram vuole che confermi su un altro dispositivo, Erevos mostra il link da aprire lì. Un nuovo account Telegram o l’accesso con e-mail, Erevos non sa ancora farli: falli una volta nell’app ufficiale di Telegram. Ciò che Telegram tiene su questo telefono resta cifrato in questo spazio.
- **Chat normali:** Telegram può leggerle. Una normale chat di Telegram è cifrata solo tra te e i server di Telegram, e i gruppi e i canali non sono mai cifrati end-to-end. Una chat privata lo dice in alto: **Telegram può leggere questa chat**.
- **Cifratura ErevosGram:** in una chat privata, **Cifratura ErevosGram** invia un invito all’altra persona. Se usa {=Erevos} o l’app ErevosGram e tocca **Accetta**, la chat diventa **Cifrata end-to-end (ErevosGram)**: ciò che scrivete entrambi è sigillato con il protocollo di Erevos prima di arrivare a Telegram, che vede solo testo che non può leggere. Quando invitano loro, la chat mostra **Vogliono la cifratura ErevosGram**, con **Accetta** e **Rifiuta**. È codice di Erevos, non sottoposto ad audit. Ciò che è stato scritto prima resta leggibile da Telegram.
- **Numero di sicurezza:** tocca il lucchetto in alto in una chat cifrata per vedere il suo numero di sicurezza. Confrontalo con quello sul loro telefono, in un modo diverso da Telegram, e tocca **Segna come verificata** quando i due sono uguali. Se le loro chiavi cambiano, la chat ti avvisa: confronta di nuovo prima di fidarti.
- **Chiamate:** in una chat privata, il pulsante di chiamata in alto avvia una chiamata vocale Telegram, e una in arrivo appare sopra qualsiasi schermata con **Rispondi** e **Rifiuta**. La chiamata la fa il sistema di Telegram stesso, cifrata end-to-end dalla cifratura delle chiamate di Telegram. Confronta le quattro emoji sul tuo schermo con quelle dell’altro telefono: se sono uguali, nessuno ascolta. **Videochiamata**, accanto, ne avvia una con la fotocamera accesa; una videochiamata squilla con **Rispondi con video** accanto a **Rispondi**. In ogni chiamata **Fotocamera** accende o spegne la tua fotocamera e **Cambia** passa da quella anteriore a quella posteriore; l'immagine dell'altra persona riempie lo schermo finché la sua fotocamera è accesa.
- **Chat e Impostazioni:** la schermata di Telegram mostra le tue chat in righe, come la schermata iniziale, e ne porta altre scorrendo in basso. **Impostazioni**, accanto al titolo, contiene **Annunci nei canali**, **Cartelle di Telegram**, le **Chiavi ErevosGram** ed **Esci da Telegram su questo telefono**; **Chat** lì, o Indietro, torna alla lista.
- **Porta le chiavi dall’app ErevosGram:** nella schermata di Telegram, **Porta le chiavi dall’app ErevosGram**. Nell’app ErevosGram esporta le chiavi, che scrive erevosgram-keys.txt e mostra un codice di 20 caratteri; incolla la riga del file in Erevos e scrivi il codice. Le chat cifrate lì si aprono qui. Poi non usare più l’app ErevosGram per quelle chat. Se questo spazio ha già chiavi ErevosGram, la sostituzione si chiede a parte e le chat cifrate qui finora non si aprono più.
- **Annunci nei canali:** disattivati finché non attivi **Annunci nei canali** nella schermata di Telegram. Telegram chiede alle app di mostrare i suoi annunci nei grandi canali pubblici; attivi, un canale può mostrare in alto una piccola scheda con l’indicazione **Annuncio**, che puoi chiudere.
- **Cartelle:** le cartelle che hai creato in Telegram compaiono come schede nella schermata di Telegram, tra **Chat** e **Archivia**. In **Cartelle di Telegram** attiva quelle che vuoi: ognuna compare come scheda a sé lì e nella schermata iniziale. Appena una cartella è attiva, notificano solo le chat in quelle cartelle. In Telegram le cartelle restano come sono.
- **Info della chat:** tocca il nome di una chat per vedere quando la persona è stata online l’ultima volta, il suo nome, numero e bio, o la descrizione, i membri e i link di un gruppo. Lì puoi silenziare la chat, fissarla, archiviarla, segnarla come letta o non letta, metterla nelle tue cartelle di Telegram (Telegram le cambia su tutti i tuoi dispositivi), far cancellare da soli i nuovi messaggi dopo un giorno, una settimana o un mese, bloccare la persona, cancellare la cronologia ed eliminare la chat o uscire dal gruppo o dal canale.
- **Inviare foto e file:** **Allega**, accanto a **Invia**, offre **Foto**, **Fotocamera** e **File**. Quello che hai scritto va sotto come suo testo. La cifratura ErevosGram copre solo il testo: in una chat cifrata Erevos chiede prima, perché Telegram può leggere foto e file.
- **Modificare, inoltrare, cercare:** tieni premuto un tuo messaggio e tocca **Modifica** per cambiarne il testo (non in una chat cifrata), oppure tieni premuto un messaggio normale e tocca **Inoltra** per mandarlo a un’altra chat. **Cerca**, in alto in una chat, scorre i suoi messaggi.
- **Messaggi vocali:** con nulla scritto, il microfono accanto a **Invia** registra finché lo tieni premuto; rilascia per inviare, scorri a sinistra per annullare. Come un file, un messaggio vocale non è coperto dalla cifratura ErevosGram, quindi in una chat cifrata Erevos chiede prima.
- **Reazioni:** tieni premuto un messaggio e tocca **Reagisci** per scegliere un emoji. Le reazioni compaiono sotto il messaggio; toccane una per dare o ritirare la tua.
- **Sondaggi e sticker:** in un gruppo o canale, **Allega** → **Sondaggio** chiede una domanda, da due a dieci opzioni e se i voti sono anonimi e se sono ammesse più risposte. Tocca un'opzione per votare (**Vota**, se ne sono ammesse più); **Ritira il voto** lo toglie e **Chiudi sondaggio**, nel menu del tuo sondaggio, lo termina. **Allega** → **Sticker** ne invia uno dai tuoi pacchetti.
- **Thread:** un messaggio con risposte mostra quante; toccalo per leggerle e scriverne una. **Rispondi nel thread**, nel menu di un messaggio, apre o continua un thread in un gruppo o canale.
- **Messaggio fissato:** un messaggio fissato compare in una barra in alto nella chat; toccala per andarci. **Fissa** e **Non fissare più** sono nel menu del messaggio; in una chat privata scegli tra **Per entrambi** e **Solo per me**.
- **Più messaggi:** **Seleziona**, nel menu di un messaggio, ti lascia toccarne altri e poi **Copia**, **Inoltra** o **Elimina** insieme. I messaggi cifrati non si possono inoltrare e vengono lasciati fuori.
- **Membri e amministratori:** in un gruppo o canale, le info della chat elencano i **Membri**, segnati come **Proprietario** o **Amministratore**; toccane uno per scrivergli. Il proprietario e gli amministratori possono cambiare titolo e descrizione con **Modifica** e togliere un membro con **Rimuovi**.
- **Altro in gruppi e chat:** con il permesso di aggiungere amministratori, **Rendi admin** accanto a un membro sceglie cosa può fare, e **Permessi** accanto a un amministratore lo cambia o, con **Rimuovi da amministratore**, lo fa tornare membro. **Aggiungi membro** aggiunge uno dei tuoi contatti, o chiunque tramite il suo @nome; se la sua privacy non lo consente, mandagli il link d'invito. **Allega** → **Sondaggio** può creare un **Quiz**: tocca la casella accanto alla risposta giusta e, se vuoi, aggiungi una spiegazione; appena qualcuno risponde, la risposta giusta appare con ✅. Gli sticker animati si muovono nella chat. **Allega** → **Sticker di Erevos** invia uno degli sticker di Erevos; Telegram lo riceve come sticker immagine fisso. Una reazione con emoji personalizzata mostra la sua immagine. Con più messaggi fissati, la barra in alto li mostra uno alla volta: ogni tocco va a uno e passa al precedente. Un thread ha **Allega**, il microfono e un menu del messaggio, come una chat. Nella schermata iniziale, nella scheda Telegram o in una sua cartella, il menu ha **Segna tutto come letto**. Le foto si vedono da sole nella chat e le GIF si animano lì; un video mostra la sua immagine con ▶ e quanto dura, e un tocco lo riproduce a schermo intero, con l’audio. Il nome e i pulsanti della chat restano in alto mentre scorri. **Blocca con un PIN**, nelle informazioni di una chat, la blocca come una chat di Erevos: chiede il suo PIN ogni volta che si apre, e la home non ne mostra le parole. **Sposta nelle chat nascoste**, sempre lì, tiene la chat nelle chat nascoste che apre il loro PIN: lascia gli elenchi e i conteggi di questo spazio e compare solo lì; **Riporta nelle mie chat** la riporta indietro. Telegram la ha ancora, su tutti i tuoi dispositivi. Sotto **+** in una chat Telegram, **Foto nascosta** invia una foto sfocata finché non viene toccata, e quelle che ricevi appaiono allo stesso modo. **Posizione** e **Scheda contatto** sotto **+** inviano un luogo o uno dei tuoi contatti in una chat Telegram, come li mostrano le app di Telegram; Telegram può leggerli, e una scheda parte solo con un numero di telefono. **Invia più tardi** sotto **+** in una chat Telegram invia ciò che è scritto all'ora scelta: Telegram lo conserva e lo invia allora, anche a telefono spento, e **partiranno più tardi** sopra la casella del messaggio li elenca, con **Invia ora** ed **Elimina**. Non in una chat con la crittografia ErevosGram. In una chat Telegram, il pulsante di ricerca mostra anche i suoi **Media, link e file**: **Foto**, **Video**, **Messaggi vocali**, **File** o **Link**, ogni tipo a parte, tutti da Telegram e non solo quelli su questo telefono; toccane uno per andarci nella chat. Con **Anteprime dei link** attive nelle Impostazioni, il primo link di un messaggio inviato in una chat Telegram parte con l'anteprima fatta dai server di Telegram, come nelle sue app; quelle che arrivano appaiono sotto il testo, senza immagine, e chiedono prima di aprire il link. **Blocca gli screenshot** nelle info di una chat Telegram la tiene fuori dagli screenshot e dall’anteprima delle app recenti su questo telefono, su Android; Telegram non può chiedere lo stesso all’altra parte. Una chat Telegram aperta con il suo PIN, o tenuta nelle chat nascoste, ne resta fuori anch’essa, come una chat Erevos. **Notifiche** nelle info di una chat Telegram le dà suono e suoneria propri su questo telefono, o la silenzia qui per un po', come per una chat Erevos; **Silenzia le notifiche** sopra la silenzia in Telegram, su tutti i tuoi dispositivi. In una chat Telegram, ciò che è stato scritto e lasciato torna quando la chat si riapre: Telegram lo conserva come bozza su tutti i tuoi dispositivi, tranne in una chat con la crittografia ErevosGram, dove lo conserva solo questo telefono finché Erevos è in funzione. Un messaggio che non è partito ha **Invia di nuovo** ed **Elimina** nel suo menu, e il pulsante di ricerca ha **Vai a un giorno**. Tieni premuto una foto, un video o un file in una chat Telegram e scegli **Salva nella Raccolta** per tenerne lì una copia crittografata; quella di una chat nascosta va nella loro Raccolta. **Invia a**, dalla Condivisione di un'altra app, elenca anche le chat Telegram dello spazio, tranne quelle bloccate con PIN, tenute nelle chat nascoste o i canali: il testo va nella casella del messaggio, e una foto o un file fino a 100 MB parte subito. In una chat Telegram, un @nome si può toccare, e un link t.me (una persona, un gruppo o canale, un messaggio, un invito) si apre nel Telegram di Erevos, chiedendo prima di unirti con un invito; gli altri link chiedono prima di aprirsi nel browser. **Tor per questo account Telegram**, nelle impostazioni di Telegram e prima di accedere, ha **Disattivato** (all'inizio), **Come lo spazio** e **Sempre tramite Tor**, come ogni account di un'altra rete: con Sempre, o finché lo spazio manda Tutto tramite Tor, Telegram si raggiunge solo tramite Tor, con circuiti propri, anche all'accesso, e mai direttamente, nemmeno quando Tor non riesce a connettersi; l'account di ogni luogo nascosto sceglie per sé. **Tramite Tor** nelle informazioni di una chat Telegram fa passare quella chat solo da Tor: Telegram ha una sola connessione per tutte le chat di un account, quindi tutto l'account passa da Tor finché è acceso. Più lento, e le chiamate non passano da Tor.
- **Cerca per @nome:** in alto nella schermata Telegram, scrivi un nome in **Cerca per @nome** per aprire la chat con quella persona o canale.
- **Chat nascoste:** ogni luogo nascosto può avere un account Telegram tutto suo, che non compare da nessuna parte fuori dalle sue chat nascoste. Vedi [Chat nascoste](#hidden).
- **Uscire:** **Esci da Telegram su questo telefono**, in fondo alla schermata di Telegram, ti chiede di scegliere: **Disconnetti anche su Telegram** toglie questo telefono dai tuoi dispositivi su Telegram, e **Dimentica solo qui** lo lascia nell’elenco di là finché non lo rimuovi dall’app di Telegram. In entrambi i casi Erevos cancella ciò che Telegram teneva su questo telefono e le chiavi di ErevosGram, quindi le chat cifrate non si possono più leggere.
- **Foto e file:** una foto, un messaggio vocale, un video o un file viene scaricato da Telegram solo quando lo chiedi, poi mostrato o salvato. I messaggi vocali e i video per ora appaiono come file.

## Messenger {#messenger}

Solo in Erevos+, su Android, Erevos può accedere al tuo account Facebook Messenger e chattare con persone su Messenger, in **Impostazioni** → **Relay e reti** → **Messenger**, o dalla sua scheda nella schermata iniziale. Erevos parla da sé con i server di Meta, senza ponti in mezzo; non è fatto da Meta. L’account appartiene al telefono, non a uno spazio: le sue chat si uniscono all’elenco della schermata iniziale del primo spazio, segnate come **Messenger**, con una scheda tutta loro. Attiva o disattiva Messenger in **Impostazioni** → **Generali** → **Moduli**.

- **Accesso:** **Accedi a Messenger** apre la pagina di accesso di Facebook stessa. Accedi lì come su facebook.com, con ogni codice o controllo che Facebook chiede, ed Erevos conserva l’accesso, cifrato, su questo telefono. Se Messenger lo termina più tardi, la schermata di Messenger dice **Messenger ti chiede di accedere di nuovo**.
- **Cosa può leggere Meta:** sotto il nome di una chat, Erevos dice se è cifrata end-to-end. Meta non può leggere una chat cifrata end-to-end, ma sa chi parla con chi e quando; ogni altra chat, Meta può leggerla.
- **Chat:** la schermata di Messenger elenca le tue chat, le più recenti per prime. **Nuova chat** trova le persone per nome: scrivilo, tocca **Cerca**, poi tocca la persona per iniziare.
- **Scrivere:** **+** accanto alla casella del messaggio offre **Foto**, **Fotocamera**, **File** (fino a 100 MB) e **Sticker**. Con nulla scritto, tieni premuto il microfono per registrare un messaggio vocale. Tieni premuto un messaggio per il suo menu: una reazione, **Rispondi**, **Copia** ed **Elimina**, con **Elimina per tutti** per i tuoi messaggi ed **Elimina per me** per ogni messaggio. Risposte, reazioni, modifiche ed eliminazioni si vedono man mano che arrivano. Le chiamate di Messenger non sono in Erevos.
- **Apri Facebook:** nella schermata di Messenger, **Apri Facebook** mostra la pagina di Facebook stessa con lo stesso accesso. I link di Messenger lì tornano a Erevos; gli altri link si aprono nel tuo browser, senza i segni di tracciamento di Facebook e mai tramite Tor, così quel sito vede il tuo indirizzo internet. Se la schermata prima ti chiede di uscire e accedere di nuovo, fallo una volta: Messenger ora accede su facebook.com. Facebook ha anche una sua scheda nella finestra **Servizi** della schermata iniziale, accanto a Messenger, che lo apre subito. Con Messenger **Nella sua custodia** non ci sono né scheda né pulsante: il feed di Facebook è nella barra della custodia, e la scheda di Messenger apre la custodia.
- **Messenger nella sua custodia:** nella schermata di Messenger, in **Come si usa Messenger qui**, con **Da Erevos** (la scelta predefinita) Erevos parla Messenger da sé, e **Nella sua custodia** mostra invece la pagina di Messenger di Meta stessa, come su un computer, chiusa dentro Erevos con lo stesso accesso; **Apri Messenger** la apre. Vi si caricano solo i siti di Meta, i link verso l’esterno si aprono nel tuo browser senza i segni di tracciamento di Facebook, e ciò che la pagina di Meta conserva resta solo nella custodia, separato da ogni altra pagina, così riconosce il tuo telefono e non chiede ogni volta il PIN delle tue chat cifrate; se ne va quando esci da Messenger o la apre un altro account. Le chiamate vi funzionano, ma non attraverso Tor: se Messenger passa per Tor, la pagina passa solo per Tor, senza chiamate, e i link verso l’esterno non si aprono. Erevos ti avvisa comunque dei nuovi messaggi, anche se la custodia non è mai stata aperta: una chat con messaggi non letti compare nella schermata iniziale finché non viene letta, e toccandola si apre nella custodia; mentre la custodia è aperta, Erevos non avvisa, perché la pagina li mostra già. I blocchi delle chat, le chat nascoste e la Raccolta non valgono per le sue chat. Si chiude appena lo spazio si blocca o si chiude, e con il pulsante di panico, e resta fuori dagli screenshot e dall’anteprima delle app recenti ogni volta che ne resta fuori la schermata di Erevos stesso; così anche la pagina di Facebook. Si mostra sotto la barra di Erevos, con i colori di Erevos: **←** torna a Erevos, e **Facebook** nella barra mostra il feed di Facebook nella stessa pagina, con **Messenger** per tornare. La pagina è disposta alla larghezza del telefono, così si legge senza ingrandire. La pagina di Meta stessa prende tutto il tuo aspetto: i suoi colori, scura o chiara come Erevos, la forma delle tue bolle, la dimensione del testo, le lettere del tuo stile e ciò che sta dietro le tue schermate, e cambia con esso anche mentre è aperta; una tua foto resta in Erevos e la pagina mostra invece una sfumatura morbida. Dove Meta cambia la sua pagina, alcune parti possono mantenere l’aspetto di Meta.
- **Notifiche e lettura:** i nuovi messaggi ti notificano e contano sull’icona di Erevos, come le altre chat. Aprire una chat la segna come letta, e resta letta finché qualcuno non scrive di nuovo, anche prima che Messenger lo sappia. Ogni chat ha le sue **Notifiche** sotto la casella del messaggio: silenziata, o con un suono suo.
- **Tramite Tor:** **Tor per questo account Messenger**, nella schermata di Messenger e anche prima dell’accesso, è **Disattivato** per impostazione predefinita, e i server di Meta vedono il tuo indirizzo internet; **Come lo spazio** segue **Impostazioni** → **Relay e reti** → **Tor**; **Sempre tramite Tor** manda l’account, il suo accesso e le sue foto solo tramite Tor. **Tramite Tor** sotto una chat manda tutto l’account tramite Tor, perché Messenger ha una sola connessione per tutte le sue chat. Meta può chiedere di confermare, o bloccare per un po’, un account che accede tramite Tor. Vedi [Chi vede il tuo indirizzo internet](#ip).
- **Uscire:** **Esci da Messenger su questo telefono** toglie le sue chat da Erevos; puoi accedere di nuovo. I backup conservano le notifiche di ogni chat e la scelta di Tor, non l’accesso: dopo un ripristino, accedi di nuovo.

## Signal {#signal}

Solo in Erevos+, su Android, Erevos può tenere il tuo account Signal e chattare con persone su Signal, in **Impostazioni** → **Relay e reti** → **Signal**, o dalla sua scheda nella schermata iniziale. Erevos parla il protocollo di Signal stesso con i server di Signal, e ogni chat è cifrata end-to-end; non è fatto da Signal. L’account appartiene al telefono, non a uno spazio: le sue chat si uniscono all’elenco della schermata iniziale del primo spazio, segnate come **Signal**, con una scheda tutta loro. Attiva o disattiva Signal in **Impostazioni** → **Generali** → **Moduli**.

- **Due modi per entrare:** **Nuovo account Signal con il mio numero** fa di Erevos il Signal di quel numero, e l’app Signal su un altro telefono con lo stesso numero si ferma. **Collega a Signal su un altro telefono** lascia il tuo Signal dov’è e aggiunge Erevos come uno dei suoi dispositivi collegati.
- **Un nuovo account:** scrivi il tuo numero con il prefisso del paese, come +39 3…, e scegli se il codice arriva via SMS o, con **Il codice arriva con una chiamata**, con una chiamata. Signal prima ti chiede di risolvere un captcha sulla sua pagina. Poi scrivi il codice che Signal ha inviato, e il nome che gli altri vedono su Signal (il cognome è facoltativo).
- **Collegamento:** sull’altro telefono, in Signal, apri **Impostazioni** → **Dispositivi collegati** → **Collega nuovo dispositivo** e inquadra il codice che Erevos mostra. I nuovi messaggi arrivano poi a entrambi.
- **Chat e gruppi:** la schermata di Signal elenca le tue chat e i tuoi gruppi, i più recenti per primi. **Nuova chat** trova una persona per numero di telefono o per nome; toccala per iniziare. I gruppi di cui fai parte funzionano come le chat; i nuovi gruppi si creano nell’app Signal.
- **Scrivere:** **+** offre **Foto**, **Fotocamera**, **File** (fino a 100 MB) e **Sticker**; con nulla scritto, tieni premuto il microfono per un messaggio vocale. Tieni premuto un messaggio per una reazione, **Rispondi**, **Copia** ed **Elimina**, con **Elimina per tutti** per i tuoi messaggi ed **Elimina per me** per ogni messaggio.
- **Chiamate:** in una chat con una persona sola, **Chiamata vocale** e **Videochiamata** la chiamano su Signal, cifrate end-to-end. Una chiamata Signal in arrivo appare sopra qualsiasi schermata, con **Rispondi**, **Rispondi con video** e **Rifiuta**. Le chiamate non passano da Tor, ed Erevos avvisa prima di ognuna.
- **Notifiche e lettura:** come per Messenger, i nuovi messaggi ti notificano e contano sull’icona, una chat letta qui resta letta, e ogni chat ha le sue **Notifiche**, con una suoneria sua per le chiamate.
- **Tramite Tor:** **Tor per questo account Signal**, anche prima dell’accesso, funziona come per Messenger: **Disattivato** per impostazione predefinita, quindi i server di Signal vedono il tuo indirizzo internet. Con **Sempre tramite Tor**, anche la registrazione, il suo captcha e il collegamento passano da Tor. **Tramite Tor** sotto una chat manda tutto l’account tramite Tor.
- **Uscire:** **Esci da Signal su questo telefono** toglie le sue chat da Erevos. I backup conservano le notifiche di ogni chat e la scelta di Tor, non l’account: dopo un ripristino, registrati o collega di nuovo.

## Session {#session}

Solo in Erevos+, su Android, Erevos può tenere un account Session e chattare con persone su Session, in **Impostazioni** → **Relay e reti** → **Session**, o dalla sua scheda nella schermata iniziale. Session non chiede né numero di telefono né e-mail: l’account è fatto di 13 parole di recupero, e i suoi messaggi passano cifrati end-to-end attraverso l’instradamento a cipolla dei nodi di Session. Erevos non è fatto da Session. L’account appartiene al telefono, non a uno spazio: le sue chat si uniscono all’elenco della schermata iniziale del primo spazio, segnate come **Session**, con una scheda tutta loro. Attiva o disattiva Session in **Impostazioni** → **Generali** → **Moduli**.

- **Un nuovo account:** tocca **Nuovo account Session**, scrivi il tuo nome su Session e tocca **Crea l’account**. Erevos mostra **Le tue 13 parole di recupero**: scrivile, conservale al sicuro e tocca **Le ho scritte**. Sono l’unico modo per recuperare l’account, e chiunque le abbia può leggere le tue chat.
- **Un account che hai già:** **Recupera un account con le sue 13 parole** prende le parole, con spazi tra loro, e il tuo nome; poi tocca **Recuperalo**.
- **Il tuo Session ID:** la schermata di Session lo mostra, con **Copia**. Gli altri iniziano una chat con te tramite esso.
- **Chat:** **Nuova chat** prende un Session ID o un nome ONS, e **Apri** avvia la chat.
- **Gruppi:** **Nuovo gruppo Session** crea un gruppo da un nome e dalle persone che scegli tra le tue chat Session. Ricevono un invito ed entrano quando lo accettano, e tu ne sei l’amministratore. In un gruppo, il suo pulsante mostra i **Membri**; un amministratore può usare **Aggiungi persone**, **Rinomina** il gruppo, e **Rendi admin** o **Rimuovi dal gruppo** qualcuno che non è amministratore. **Lascia il gruppo** lo lascia, e tornare richiede un nuovo invito.
- **Scrivere:** **+** offre **Foto**, **Fotocamera**, **File** (fino a 10 MB) e **Sticker**; con nulla scritto, tieni premuto il microfono per un messaggio vocale. Tieni premuto un messaggio per una reazione, **Rispondi**, **Copia** ed **Elimina**.
- **Chiamate:** in una chat con una persona sola, **Chiamata vocale** e **Videochiamata** la chiamano su Session. Session fa squillare da sé le sue chiamate, in silenzio per una chat silenziata. Le chiamate non passano da Tor, ed Erevos avvisa prima di ognuna.
- **Notifiche e lettura:** come per Messenger e Signal, con le **Notifiche** di ogni chat e una suoneria sua per le chiamate.
- **Tramite Tor:** **Tor per questo account Session** funziona come per Messenger e Signal, **Disattivato** per impostazione predefinita. L’instradamento a cipolla di Session già nasconde il tuo indirizzo internet a chi scrivi; il primo nodo di Session lo vede, a meno che l’account passi da Tor.
- **Uscire:** **Esci da Session su questo telefono** chiede prima, perché senza le tue 13 parole di recupero l’account non può tornare. I backup non conservano l’account: dopo un ripristino, recuperalo con le sue parole.

## SMS {#sms}

Su Android, Erevos può essere l’app per gli SMS del telefono: in **Impostazioni** → **Telefono e SMS** → **SMS** →
**Erevos come app per gli SMS**, tocca **Rendi Erevos l’app per gli SMS**. La schermata principale mostra allora SMS e
chat Erevos in un unico elenco.

> **Gli SMS e gli MMS non sono crittografati da Erevos.** Viaggiano come ogni SMS, e restano nell’archivio SMS di
> Android, dove qualsiasi app autorizzata a leggere gli SMS li vede e i backup di Android li contengono. Solo le chat
> Erevos sono crittografate end-to-end.

- **Gli SMS di prima:** niente da importare. Erevos mostra gli SMS e gli MMS già sul telefono, dall’archivio di Android
  stesso, dove restano per qualsiasi altra app per gli SMS. Li conserva Android, non sigillati da Erevos, come con ogni
  app per gli SMS.
- **Se Erevos non diventa l’app per gli SMS:** Android 15 e successivi possono impedirlo a un’app installata da un
  browser. In **Impostazioni** → **Telefono e SMS** → **SMS** → **Erevos come app per gli SMS**, tocca **Apri App
  predefinite** → **App per SMS** → Erevos. Se Android lo chiama un’impostazione con restrizioni, apri **Informazioni
  app** di Erevos, tocca **⋮** in alto a destra → **Consenti impostazioni con restrizioni**, e scegli di nuovo Erevos.
- **Quando arriva un SMS:** una notifica dice «New message», senza chi l’ha inviato né cosa dice. Se non arriva
  nessuna notifica, **Erevos come app per gli SMS** mostra **Consenti notifiche** finché Android le blocca.
- **Codici monouso:** un SMS che dice di contenere un codice (di una banca, di un accesso), in una qualsiasi delle
  lingue dell’app, riceve **Copia codice** sotto di sé nella chat, e anche nella sua notifica, senza che lì si veda il
  codice; su Android 12 e successivi il pulsante della notifica chiede prima di sbloccare il telefono. Vengono copiate
  solo le sue 4–8 cifre, mai un numero di telefono, un importo, una data o un’ora, e Android non ne mostra
  un’anteprima. Qualsiasi app che legge gli appunti può leggerle, quindi incolla presto il codice.
- **Rispondere dalla notifica:** **Impostazioni** → **Telefono e SMS** → **SMS** → **Cosa dice un SMS, nella sua
  notifica**, disattivato all’inizio, mostra nella notifica di un SMS chi ha scritto e cosa finché questo spazio è
  aperto, con **Rispondi**, che invia un SMS semplice dalla SIM su cui è arrivato, e **Segna come letto**. Chi vede
  lo schermo li vede; bloccato, o con un altro spazio aperto, la notifica dice di nuovo solo «Nuovo messaggio», e
  una con codice monouso sempre.
- **Se non appare nessun SMS:** Android 15 e successivi negano il permesso per gli SMS a un’app installata da un
  browser. In **Impostazioni** → **Telefono e SMS** → **SMS** → **Erevos come app per gli SMS**, tocca **Consenti
  SMS**. Se Android lo chiama un’impostazione con restrizioni, apri **Informazioni app** di Erevos, tocca **⋮** in
  alto a destra → **Consenti impostazioni con restrizioni**, e consenti gli SMS in **Autorizzazioni**. Le chat inviate
  come RCS («chat» in Google Messaggi) restano in quell’app e non appaiono.
  **Erevos come app per gli SMS** dice quante conversazioni SMS legge Erevos, o perché non ha potuto leggerle.
- **Scrivere a qualcuno con {=Erevos}:** passa da Erevos, crittografato end-to-end, appena il suo numero è collegato al
  suo contatto. Collegalo a mano nella conversazione SMS, o lascia che lo trovi un invito nascosto. Da allora la sua
  conversazione SMS apre la sua chat.
- **I suoi SMS nella chat:** gli SMS e gli MMS con il suo numero, quelli di prima e quelli che arrivano, appaiono tra i
  messaggi della chat in ordine di tempo, ognuno bordato e segnato **SMS (non crittografato)**, con il suo ✓ e le sue
  foto. Tienine premuto uno per copiarlo, inoltrarlo o eliminarlo, come nella conversazione SMS. Restano negli SMS del
  telefono, mai nella cronologia sigillata della chat; appare solo la conversazione con quell’unico numero, non un MMS
  di gruppo, e solo mentre Erevos è l’app per gli SMS o può leggere gli SMS, mai nelle chat nascoste. Appaiono prima
  gli ultimi: **Mostra gli SMS precedenti**, sopra di loro, ne porta altri, e anche la ricerca della chat li trova.
  Aprire la chat li segna tutti come letti, anche quelli precedenti, così nella schermata principale non ne resta
  nessuno contato. Un numero sulla sua scheda contatto fa lo stesso, senza collegarlo.
- **Un SMS normale a lui:** quando non c’è internet, per esempio. **SMS normale** nei **Dettagli** della chat apre la
  sua conversazione SMS per scriverlo lì, e **+** → **Invia come SMS**, o **Come SMS** quando tieni premuta la freccia
  di invio, invia come SMS quello che hai scritto, dopo averlo chiesto. Nella chat appare come SMS. L’operatore
  telefonico può leggerlo. Un SMS non può scomparire né rispondere a un messaggio: con il cronometro attivo, o con un
  messaggio a cui stai rispondendo, Erevos lo dice quando chiede.
- **Inviti nascosti:** con il primo SMS a un numero che non è un contatto, Erevos invia anche un breve invito
  nascosto. Non ne va nessuno al numero di un contatto Erevos, collegato o sulla sua scheda contatto. Un telefono
  senza {=Erevos} non mostra nulla; un telefono con {=Erevos} risponde tramite il relay e i due diventano contatti. Risponde
  da solo soltanto a un numero che conosce, tra i tuoi contatti o uno a cui hai scritto via SMS; per ogni altro chiede
  prima, **Un invito via SMS**, perché il mittente di un SMS può essere inventato. Ogni numero viene interpellato al
  massimo una volta al mese, e **Disattiva gli inviti**, in **Impostazioni** → **Telefono e SMS** → **SMS** → **Scopri
  Erevos dietro un numero**, li ferma.

**Perché:** così due telefoni con {=Erevos} si trovano solo da un numero di telefono, senza un server che conosca i
numeri. L’invito è un SMS di dati, che le app di messaggistica non mostrano, quindi un telefono senza {=Erevos} non mostra
nulla.

- **Tutti gli altri:** un SMS normale, segnato SMS. L’operatore telefonico può leggerlo, come legge ogni SMS.
- **✓ e ✓✓✓:** un tuo SMS mostra ✓ appena è partito, e ✓✓✓ appena il rapporto di consegna della rete dice che ha
  raggiunto il suo telefono, oppure «non consegnato». Alcuni operatori telefonici non inviano rapporti di consegna;
  allora resta ✓. Un SMS non può dire se è stato letto.
- **Foto, messaggi vocali e schede contatto (MMS):** **+** → **Foto** aggiunge una foto, rimpicciolita per stare in un
  MMS (circa 280 KB), senza nulla dentro oltre all’immagine. Tieni premuto il microfono, senza niente digitato, per
  registrare un messaggio vocale fino a un minuto, inviato come MMS in AMR, il formato che le app di messaggi dei
  telefoni riproducono. **+** → **Scheda contatto** invia un contatto tra quelli del telefono come vCard, senza le tue
  note su di esso né i suoi gruppi, e con la sua immagine solo se ci sta ancora. **+** → **Sticker** invia uno degli
  sticker integrati come la sua immagine, da solo in un MMS. Le foto, i messaggi vocali e le schede contatto che
  arrivano si vedono nella conversazione, da riprodurre o salvare (**Salva** apre un nuovo contatto con i dati della
  scheda). Un MMS è in chiaro come un SMS: l’operatore può vederlo.
- **Video (MMS):** **+** → **Registra un video** chiede all’app fotocamera del telefono un video in qualità MMS,
  fino a 30 secondi di immagine piccola, che la maggior parte delle fotocamere rispetta; **Video dal telefono** ne
  prende uno solo se è già abbastanza piccolo, circa 280 KB, perché Erevos non rimpicciolisce i video. Un video
  ricevuto mostra ▶ nella conversazione, e un tocco lo riproduce nell’app video del telefono.
- **MMS all’estero:** un MMS aspetta presso l’operatore finché il telefono non lo scarica con i dati mobili, che
  all’estero possono costare. **Impostazioni** → **Telefono e SMS** → **SMS** → **MMS** li scarica subito ma, se non
  lo attivi, non in roaming: allora uno appare nella sua conversazione come **MMS** con la sua dimensione e
  **Scarica (può costare)**, e anche sotto **MMS**, per un numero senza ancora una conversazione. Disattivato del
  tutto, ogni MMS aspetta un tocco.
- **Dove sei:** **+** → **Posizione** invia dove sei come SMS con un indirizzo geo: e un link OpenStreetMap, che ogni
  telefono apre. Un indirizzo geo:, o un link di OpenStreetMap, Google Maps, Apple Maps o Waze, in un SMS che arriva si
  vede come un luogo, da aprire nell’app delle mappe; un link breve resta un link, perché andrebbe scaricato per
  conoscere il luogo.
- **Reazioni da un iPhone o da Google Messages:** quando qualcuno senza Erevos reagisce a un tuo SMS, il suo
  telefono la invia come parole, Liked “Ci vediamo alle 8” o Reacted 😂 to “Ci vediamo alle 8”: la conversazione la
  mostra come 👍 o 😂 sotto il messaggio nominato, l’ultimo con quelle parole, e non come un messaggio a parte; una
  ritirata (Removed a like from …) scompare. Per ora si leggono solo quelle scritte in inglese; una il cui messaggio
  non si trova resta com’è arrivata.
- **Fissati per te:** tieni premuto un messaggio e scegli **Fissa solo per me** per fissarlo sopra la conversazione. Gli
  SMS non hanno messaggi fissati: resta solo su questo telefono, crittografato con i dati SMS dello spazio, e l’altra
  persona non lo sa mai.
- **Più messaggi:** tieni premuto un messaggio e scegli **Seleziona**, poi tocca gli altri: **Copia** li mette in un
  solo testo, **Inoltra** li invia come uno nella bozza di un’altra conversazione, ed **Elimina** li elimina dal
  telefono, con **Annulla** per qualche secondo.
- **Nuovo SMS:** nella parte **SMS** dell’elenco delle chat, il pulsante in basso è **Nuovo SMS** e apre solo
  quello, anche con le chat di Erevos attive.
- **Scegliere il destinatario:** sotto **Nuovo SMS**, tocca **Contatti** per scegliere tra i tuoi contatti, con una
  ricerca, oppure scrivi e basta: i contatti il cui nome o numero corrisponde a quello che scrivi compaiono sotto il
  campo, e un tocco lo compila. Un contatto con più numeri mostra una riga per ciascuno. Per un gruppo, ogni contatto
  scelto si aggiunge ai numeri già presenti. Sono i contatti del telefono e, con Erevos sbloccato, quelli tenuti solo in
  Erevos e i tuoi contatti Erevos con un numero, mai i nomi delle chat nascoste. Con solo gli SMS aperti compaiono solo
  i contatti del telefono. Android chiede prima se Erevos può leggerli.
- **MMS di gruppo:** in **Impostazioni** → **Telefono e SMS** → **SMS** → **Nuovo SMS**, scrivi più numeri separati da
  virgole e tocca **Scrivi**. Ogni messaggio va a tutti come un unico MMS, anche il solo testo, e le loro risposte
  arrivano nella stessa conversazione, ognuna con chi l’ha scritta. Tutti vedono il numero di tutti, e l’operatore
  telefonico vede tutto.
- **Due SIM:** la SIM con cui inviare appare sopra il campo del messaggio; tocca **Scegli la SIM** una volta per
  lasciare che Erevos le veda. La tua scelta viene conservata per quel numero; fino ad allora, Erevos risponde con la
  SIM su cui è arrivato l’ultimo messaggio. Ogni messaggio mostra la sua SIM.
- **SMS più tardi:** tieni premuto il pulsante rotondo **Invia** dopo il campo e scegli un’ora, come in una chat. L’SMS
  appare alla fine della conversazione
  segnato **Programmato**; toccalo per annullarlo. Parte a quell’ora, anche con Erevos chiuso e bloccato; se allora il
  telefono è spento, appena è di nuovo acceso e sbloccato. Fino ad allora non è negli SMS del telefono, dove altre app
  lo vedrebbero, e l’operatore telefonico non lo ha. Aspetta bloccato con una chiave del telefono stesso (Android
  Keystore), non con la password del tuo spazio, perché Android deve inviarlo mentre Erevos è bloccato: la protezione
  che ogni SMS ha una volta inviato, perché gli SMS inviati restano negli SMS del telefono. Solo testo, a un numero.
- **Link:** un indirizzo web in un SMS è sottolineato, e si apre come in una chat, dopo che l’hai visto intero.
- **Nomi dai tuoi contatti:** all’inizio disattivato, quindi i numeri degli SMS appaiono come numeri. **Nomi**, sopra
  l’elenco nella parte **SMS**, li sblocca (come fa **Mostra i nomi dai miei contatti** in **Impostazioni** → **Telefono e SMS** → **SMS**
  → **Nomi dai tuoi contatti**): i nomi che i contatti del tuo telefono danno ai numeri degli SMS, e le immagini che
  hanno per loro, oppure quelli dei tuoi contatti salvati solo in Erevos, nell’elenco e nella conversazione. Tocca di
  nuovo **Nomi** per vedere solo i numeri. Erevos li legge solo per mostrarli, e non ne conserva una copia.
- **Mittenti con un nome:** un SMS da un nome invece che da un numero, come quello di una banca, si apre per leggerlo,
  ma non si può rispondere.
- **Ricordamelo:** tieni premuto un messaggio per **Ricordamelo**: va in **Chat con me stesso** con il nome della
  conversazione, e te lo ricorda all’ora che scegli.
- **Messaggi effimeri:** con Erevos come app SMS, **Messaggi effimeri**, sotto la riga **SMS normale** di una
  conversazione, elimina da questo telefono i suoi nuovi SMS quel tempo dopo l’invio, o appena Erevos torna attivo.
  L’altro telefono li tiene: un SMS non può essere eliminato lì. I messaggi già qui restano.

### SMS crittografati quando nient’altro funziona

Quando relay, Nostr, i telefoni vicini e LoRa falliscono tutti, un testo a un contatto Erevos con numero collegato può
andare via SMS, crittografato end-to-end come ogni messaggio Erevos. È disattivato finché non lo attivi: per tutti
questi contatti in **Impostazioni** → **Telefono e SMS** → **SMS** → **SMS quando nient’altro funziona** (**Attiva per
tutti i contatti**), o per uno solo nei **Dettagli** della sua chat → **SMS quando nient’altro funziona**.

- **Quanto costa:** ogni SMS costa quanto dice il tuo piano. Un testo breve richiede 3 SMS, uno più lungo fino a 10;
  all’estero un SMS può costare molto di più.
- **Cosa vede l’operatore:** quale numero ha scritto a quale, quando e quanti SMS, come per ogni SMS; mai cosa è stato
  scritto, che va come lo stesso messaggio crittografato che avrebbe portato il relay.
- **Cosa va:** solo testi ed eliminazioni. Non foto, file, messaggi vocali, chiamate, reazioni né i segni che un
  messaggio è arrivato o è stato letto, né testi oltre circa 800 lettere latine (400 greche), né il primo messaggio a un
  nuovo contatto, che porta le chiavi. Quelli aspettano, segnati **In attesa**, come in
  [Come Erevos sceglie la strada](#paths). Le chat nascoste non vanno mai via SMS.
- **Entrambi i telefoni** hanno bisogno di {=Erevos} come app per gli SMS, e del numero del contatto collegato alla sua
  chat. Gli SMS sono SMS dati nascosti per Erevos, che nessuna app per gli SMS mostra, e niente di loro resta negli SMS
  del telefono.
- **Da dove è passato:** tieni premuto il messaggio: il suo menu dice **Inviato via SMS** o **Arrivato via SMS**. **✓✓**
  arriva appena relay o Nostr sono di nuovo raggiungibili: nessun SMS torna indietro da solo.

**Perché:** gli SMS raggiungono un telefono senza alcun internet, ovunque ci sia una rete mobile. Ma costano e dicono
all’operatore chi parla con chi, cosa che altrimenti Erevos nasconde; per questo l’SMS è l’ultima strada, e solo quando
la scegli tu.

> Attivalo solo per chi devi raggiungere così. L’operatore, e chiunque possa vedere i suoi registri, capisce da questi
> SMS che i vostri due numeri si parlano, e quando.

### Tenere in ordine gli SMS

- **Tieni premuto:** nell’elenco, tieni premuta una conversazione SMS per quello che puoi fare: **Fissa in alto**,
  **Archivia**, **Segna come spam**, **Blocca** ed **Elimina**, e **Aggiungi ai contatti** per un numero che non è tra
  i tuoi contatti. In una conversazione, **⋮** in alto mostra le stesse cose, e per primi **Cerca in questa chat**,
  **Media, link e file**, **Vai a un giorno** ed **Esporta chat** (vedi [Per iniziare](#start)), e un numero del
  genere ha **Aggiungi ai contatti** anche sotto il suo nome: un nuovo contatto con dentro quel numero.
- **Fissate:** fino a 10 conversazioni SMS restano in cima all’elenco, con una puntina. **Non fissare più** ne
  rimanda una al suo posto.
- **Conversazioni archiviate:** fuori dall’elenco, sotto **Archiviate** in cima alla schermata principale. Una torna
  da sola nell’elenco quando arriva un nuovo SMS da quel numero, o con **Annulla archiviazione**.
- **Nomi degli MMS di gruppo:** tieni premuto un MMS di gruppo e scegli **Dalle un nome qui** per dargli un nome tuo,
  solo su questo telefono.
- **Il proprio di una conversazione:** sotto la riga **SMS normale**, una conversazione ha **Aspetto della chat**,
  come una chat, e, con un solo numero, **Notifiche**: silenziala per un po’ o sempre, o dalle un suono suo, o
  nessuno. Valgono mentre lo spazio è aperto; chiuso, ogni SMS avvisa come dicono le impostazioni.
- **Cestino:** una conversazione eliminata aspetta nel **Cestino** 30 giorni, poi Erevos la elimina dagli SMS del
  telefono. Fino ad allora **Recupera** la rimette nell’elenco; **Elimina ora** e **Svuota il cestino** eliminano
  subito, per sempre. Un SMS che arriva dopo che è finita nel Cestino la fa riapparire nell’elenco. Solo l’app per gli
  SMS può eliminare gli SMS.
- **Spam:** un filtro che funziona solo sul telefono, con delle regole, e non invia nulla da nessuna parte. Un SMS da
  un numero che non è un contatto e a cui non hai mai risposto va in **Spam** quando ha un link con parole che cercano
  di ingannare, come un pacco in giacenza o un premio, o una delle parole che aggiungi in **Impostazioni** →
  **Telefono e SMS** → **SMS** → **Filtro antispam**. **Segna come spam** e **Non è spam** decidono per sempre per un
  numero. Un SMS che le parole proprie del filtro colgono (un link con parole che cercano di ingannare, da un numero di telefono che non è in nessun contatto del telefono e a cui non hai mai risposto) arriva senza notifica e senza suono, perché il telefono conosce anche quelle parole; ogni altro spam, per le tue parole, le tue regole o dall’estero, mostra ancora «New message», perché quella notifica arriva prima che Erevos venga aperto e il resto del filtro resta cifrato nello spazio. Un numero che hai segnato come **Non è spam** o che lasci passare arriva anch’esso in silenzio quando manda parole così, a meno che non sia nei contatti del telefono. Con il **Filtro antispam** spento, ogni SMS ha la sua notifica: il telefono tiene solo se il filtro è acceso, come dice l’ultimo spazio aperto.
  Ogni conversazione in **Spam**, nella cartella e in cima alla conversazione, dice perché è lì: il numero è
  bloccato, l’hai segnato tu, una tua regola nomina il mittente, un numero dall’estero, una tua parola, o un link e
  quali parole.
- **Lettere che si somigliano:** un SMS truffa che cambia una lettera con una di un altro alfabeto che sembra uguale, come una а cirillica in una parola latina, o nasconde in una parola un segno che non si vede, non supera il filtro: legge le parole come appaiono. Chi invia non si confronta mai così, perché un mittente che somiglia a uno consentito non è quel mittente.
- **Regole su chi invia:** in **Filtro antispam**, **Mittenti** accetta il nome di un mittente, come quelli che usano
  negozi e banche (lettere, senza accenti né maiuscole), o un numero, dove \`*\` sta per qualsiasi cosa: \`+4470*\` è
  ogni numero che inizia così, \`1234*\` ogni numero breve che inizia così, e con il prefisso del tuo paese noto,
  \`69*\` è anche ogni numero \`+3069...\`. **In «Spam»** manda lì i loro; **Lascia passare** tiene le regole del
  filtro lontane da loro, come per la tua banca o la tua famiglia, anche se un numero che hai segnato come spam, o
  bloccato, va comunque lì. **Manda in «Spam» i numeri dall’estero** manda lì ogni numero scritto con un prefisso
  diverso da **Il prefisso del tuo paese**, che Erevos prende dai numeri a cui rispondi e che puoi cambiare. Un numero
  scritto senza prefisso è di qui. Tocca una regola per rimuoverla.
- **Blocca:** **Blocca** nel menu di una conversazione, o **Impostazioni** → **Telefono e SMS** → **SMS** → **Numeri
  bloccati**, mette un numero nell’elenco dei numeri bloccati di Android stesso: Android rifiuta i suoi SMS, MMS e
  chiamate, e ogni spazio e l’app Telefono vedono lo stesso elenco. Solo l’app per gli SMS o l’app Telefono possono
  vederlo e cambiarlo.
- **Bozze:** quello che scrivi e non invii resta con quella conversazione, e l’elenco lo mostra come **Bozza**. Anche
  un SMS che non è potuto partire resta lì come bozza.
- **Testi rapidi:** tieni premuto il **+** accanto al campo, o scegli **Testi rapidi** da lì, per parole brevi che
  scrivi spesso (Sto arrivando, Ti chiamo dopo): un tocco ne mette uno nel campo, da inviare così o con altro.
  **Aggiungi** ne tiene uno tuo, e tenerne premuto uno lo toglie; da allora la lista è tua, tenuta cifrata con gli
  SMS dello spazio, ogni spazio la sua.
- **Annullare l’invio di un SMS:** un SMS che invii prima aspetta 5 secondi alla fine della conversazione: toccalo in
  quel momento per riportarlo nel campo del messaggio. **Impostazioni** → **Telefono e SMS** → **SMS** → **Annullare
  l’invio di un SMS** imposta **Disattivato**, 5 o 10 secondi. Quando lasci Erevos, parte subito.
- **Quanto costa inviare:** un SMS più lungo mostra sopra il campo una riga con quanti caratteri ha e in quanti SMS
  parte: 160 caratteri in un SMS, o 153 in ogni parte di uno più lungo, ma 70, o 67, appena ha una minuscola greca,
  un accento o un emoji. **Impostazioni** → **Telefono e SMS** → **SMS** → **Senza accenti (più economico)** invia
  un SMS semplice senza accenti e il greco in maiuscolo, come lo scrivevano i vecchi telefoni (ΚΑΛΗΜΕΡΑ), e contiene
  di nuovo 160; non uno con un emoji, né un MMS.
- **Invia di nuovo:** uno dei tuoi che non è partito, o non è stato consegnato, lo dice: toccalo per inviarlo di nuovo.
  Tieni premuto qualsiasi messaggio per **Inoltra**, **Invia di nuovo** ed **Elimina**, con le sue parole da
  selezionare e copiare; un messaggio eliminato ha anche **Annulla**.
- **Inoltra:** tieni premuto un messaggio → **Inoltra**, poi scrivi un numero e tocca **Scrivi**, o scegli un contatto
  sotto **In una chat Erevos**. Si apre in quella conversazione, da leggere e inviare lì. A un numero va anche la sua
  immagine, come MMS; in una chat solo le sue parole.
- **Ogni spazio ha i suoi:** messaggi fissati, conversazioni archiviate, il Cestino, i segni di spam e le bozze
  appartengono allo spazio, sigillati con la sua password. Gli SMS stessi restano negli SMS del telefono: un altro
  spazio li vede così come sono, e uno nel Cestino qui appare lì finché non viene eliminato dal telefono.

### Sui tuoi dispositivi collegati

Gli SMS del telefono possono apparire anche sui [dispositivi collegati](#devices) di questo spazio: un computer, un
browser, un tablet. Lì li leggi e rispondi, e il telefono invia la risposta come SMS. È disattivato finché non lo
attivi, sul telefono: **Impostazioni** → **Telefono e SMS** → **SMS** → **Anche sui miei dispositivi collegati** →
**Invia i miei SMS anche ai miei dispositivi**.

- **Cosa va:** le ultime 50 conversazioni dell’elenco e di **Archiviate**, ciascuna con i suoi ultimi 50 messaggi, con
  crittografia end-to-end come tutto ciò che i dispositivi condividono. Quelli più vecchi, quelli nel **Cestino** e in
  **Spam**, e le foto restano sul telefono: un messaggio con una foto dice **📷 Una foto, sul telefono**. I nomi vanno
  solo finché il telefono li mostra (**Nomi dai tuoi contatti**).
- **Rispondere:** quello che scrivi su un dispositivo appare come in invio finché il telefono non l’ha inviato, con la
  SIM che usa per quel numero, e poi è tra quelli del telefono. Uno che il telefono non ha potuto inviare lo dice:
  toccalo per inviarlo di nuovo. Il telefono invia ciascuno una sola volta, e al massimo 60 all’ora dai dispositivi,
  così un dispositivo perso non può mandare una valanga di SMS; uno che ha aspettato più di un giorno non parte.
- **Letto:** una conversazione letta su un dispositivo è segnata come letta anche sul telefono.
- **Avvisi:** un nuovo SMS dà un avviso anche sul dispositivo, come dicono le sue impostazioni delle notifiche.
- **Tramite il telefono:** gli SMS vanno e vengono solo mentre questo spazio è aperto sul telefono, come tutto ciò che
  passa dal telefono. Su un dispositivo le schermate sono quelle del telefono, senza ciò che fa solo il telefono:
  eliminare, bloccare, inviare più tardi, foto e inviti.
- **Ogni spazio ha il suo:** l’interruttore appartiene allo spazio. Un posto di chat nascoste non invia mai gli SMS ai
  dispositivi.
- **Disattivare:** **Ferma gli SMS sui miei dispositivi**, sul telefono, li toglie da ogni dispositivo.

**Perché:** solo il telefono ha una SIM, quindi solo il telefono invia e riceve gli SMS. I dispositivi li vedono
tramite il telefono, con crittografia end-to-end come il resto, e l’operatore telefonico non vede nulla di più di prima.

## Telefono {#phone}

Su Android, Erevos può essere l’app Telefono del telefono: in **Telefono** nel menu, tocca **Impostazioni** → **Rendi
Erevos l’app Telefono**. Ogni chiamata appare allora sulla schermata di chiamata di Erevos, e i link tel: e il
pulsante di chiamata del telefono aprono il tastierino di Erevos. **Telefono** si apre anche dalla cornetta in cima
alla schermata principale, e ha una sua icona tra le app del telefono, **Telefono**, verde con una cornetta sul
simbolo di Erevos, che apre il tastierino. Ognuno di questi, come un link tel:,
lo apre appena Erevos è sbloccato: con una password, dopo che l’hai inserita, a meno che il Telefono non si apra senza
(vedi La password di Erevos, più sotto). Fino ad allora una scheda in alto dice **Erevos non è l’app Telefono**; su un
telefono piccolo mostra solo quel titolo, e toccarlo apre le **Impostazioni** del Telefono.

- **Chiamate di emergenza:** un numero di emergenza (112, o quello del tuo paese) si chiama subito, senza chiedere
  la SIM: la sceglie Android. Con Erevos bloccato e il Telefono dietro la password, **Chiamata di emergenza** nella
  schermata della password apre il tastierino di emergenza di Android, senza password.
- **Cerca nei contatti:** in cima al Telefono, scrivi un nome, un numero o una parte di uno dei due: i contatti con un
  numero appaiono al posto delle schede, ogni numero su una riga a sé. Toccane uno per chiamarlo, o tienilo premuto per
  metterlo sul tastierino. Cerca nei contatti del telefono e, con Erevos sbloccato, in quelli salvati solo in Erevos e
  nei tuoi contatti Erevos con un numero; mai nelle chat nascoste.
- **Contatti mentre componi:** mentre digiti sul **Tastierino**, i contatti che trova compaiono in un elenco sopra il
  numero: uno il cui numero contiene le cifre digitate, o il cui nome inizia con esse sulle lettere dei tasti, come 2 per
  ABC (e ΑΒΓ). Ogni tasto mostra le sue lettere nella lingua dell’app. Tocca un contatto per chiamarlo, o tienilo premuto
  per mettere il suo numero sul tastierino. Su uno schermo piccolo, dove sopra il numero non c’è spazio, il primo compare
  sopra i tasti e **altri**, accanto, elenca gli altri.
- **La schermata di chiamata:** chi chiama, o chi chiami, con il nome e la foto che gli danno i contatti del tuo
  telefono; mentre Erevos è sbloccato, un numero collegato a uno dei tuoi contatti Erevos mostra il nome che gli hai
  dato, e così il numero di un contatto salvato solo in Erevos; quello di un contatto delle chat nascoste aperte, solo
  mentre sono aperte. Appare sulla
  schermata di blocco e non richiede password, perché a una chiamata si deve poter rispondere con Erevos bloccato. Una
  chiamata in arrivo mostra **Answer**, **Decline** e **Message**, e Android squilla con la suoneria propria del
  contatto; i tasti del volume la silenziano. Durante una chiamata: **Mute**, **Keypad** per i toni che chiede un menu,
  **Speaker**, **Hold**, **Add call** ed **End**. Quando lo avvicini all’orecchio lo schermo si spegne.
- **Dove va il suono:** con un dispositivo Bluetooth o delle cuffie, il pulsante accanto a **Keypad** dice dove va il
  suono, e un tocco ti lascia scegliere: il telefono, l’altoparlante, le cuffie o il dispositivo Bluetooth.
- **Una seconda chiamata:** una che arriva durante una chiamata mostra **Hold and answer**, **End and answer** e
  **Decline**. Con una chiamata in attesa, la riga sotto il nome lo dice: toccala, o tocca **Swap**, per parlare con
  l’altra. **Merge** mette le due in un’unica chiamata, quando il tuo operatore telefonico lo permette.
- **Una conferenza:** unite le chiamate, la schermata di chiamata elenca le persone presenti al posto della foto.
  Accanto a ognuna, **Separa** ti fa parlare solo con lei mentre le altre restano in attesa, e **Chiudi** toglie
  solo lei; ciascuno compare solo dove il tuo operatore lo permette.
- **Videochiamate tramite il tuo operatore:** dove SIM e rete le supportano (ViLTE, in 4G o 5G), una videochiamata
  in arrivo mostra **Rispondi con video** e **Solo audio**; durante la chiamata, l’altra parte appare a tutto
  schermo e la tua fotocamera in un angolo, con **Spegni fotocamera** e **Cambia fotocamera**. Una chiamata senza
  video mostra **Video** quando entrambe le parti possono, e quando l’altra lo chiede, Erevos ti chiede: **Attiva
  video** o **Resta solo audio**. Per iniziarne una, digita il numero e tocca **⋯** → **Videochiamata**. Android
  chiede una volta la fotocamera. Come ogni chiamata telefonica, la trasporta l’operatore e può vederla; niente di
  tutto questo compare dove la rete non ha videochiamate.
- **Rifiutare con un messaggio:** **Message**, su una chiamata che squilla, la rifiuta con una risposta rapida, o una
  che scrivi, che il tuo telefono invia a chi chiama come SMS; appare tra i tuoi SMS. In **Telefono** →
  **Impostazioni**, **Risposte rapide** le cambia: **Aggiungi una risposta**, **Rimuovi**, **Salva**, e **Usa le
  risposte predefinite**. Sono conservate sul telefono, non sigillate, perché la schermata di chiamata le mostra con
  Erevos bloccato.
- **Il tastierino:** in **Telefono**, scrivi un numero e tocca **Chiama**; tieni premuto **0** per +. Tenuto premuto,
  il campo del numero ne incolla uno. **Add call**, durante una chiamata, lo apre appena Erevos è sbloccato.
- **Segreteria:** a tastierino vuoto, tieni premuto **1** (segnato oo) per chiamare la segreteria, dalla SIM scelta
  sopra **Chiama**. Se la SIM non ha un numero di segreteria, il Telefono lo dice: te lo dà l’operatore. Dove il tuo
  operatore invia i messaggi come registrazioni (segreteria visiva), **Segreteria** compare accanto a **Preferiti**:
  ogni messaggio con chi l’ha lasciato, quando, quanto dura e le sue parole quando sono arrivate. **▶** lo
  riproduce, **■** lo ferma; un tocco sulla riga offre **Richiama**, **Invia un SMS** ed **Elimina questo
  messaggio**. **Chiama la segreteria** in alto la chiama. Erevos li riproduce dall’archivio di Android e non tiene
  copie; con Erevos bloccato la scheda non compare.
- **Chiamata rapida:** a tastierino vuoto, tieni premuto un tasto da 2 a 9 per chiamarne il numero. Un tasto senza
  numero ti fa sceglierne uno: scrivi un nome o un numero e tocca il contatto, oppure **Usa** il numero scritto. In
  **Telefono** → **Impostazioni**, **Chiamata rapida** mostra gli otto tasti; toccane uno per cambiarlo o svuotarlo.
  La chiamata rapida è conservata cifrata nello spazio e funziona con Erevos sbloccato.
- **Impostazioni chiamate:** in **Telefono** → **Impostazioni**, **Impostazioni chiamate** apre le schermate di
  Android stesso per ciò che il tuo operatore tiene delle chiamate di ogni SIM: **Inoltro, avviso e il tuo numero**
  e **Numero di segreteria**; con due SIM, tocca prima la SIM. In **Chiedi al tuo operatore**, ogni pulsante compone
  il codice della rete (**Verifica** l’inoltro \`*#21#\`, **Disattiva tutto** \`##002#\`; avviso di chiamata
  \`*#43#\`, **Attivato** \`*43#\`, **Disattivato** \`#43#\`; mostrare il tuo numero \`*#31#\`), e la risposta
  compare in un messaggio di Android. Per nascondere il tuo numero in una sola chiamata, digita \`#31#\` prima del
  numero.
- **Due SIM:** sopra **Chiama**, tocca la SIM con cui chiamare; la prima volta, **Scegli la SIM** chiede ad Android di
  lasciare che Erevos le veda. Un numero che chiami senza scegliere chiede **Chiama con** quale. Erevos conserva la SIM
  che hai usato per ogni numero, sigillata nello spazio, e la volta dopo lo chiama con la stessa. La schermata di
  chiamata indica la SIM di ogni chiamata.
- **Le chiamate:** in **Telefono**, **Recenti** elenca la cronologia delle chiamate di Android, dalla più recente,
  sotto ogni giorno: chi, che tipo di chiamata era, con quale SIM, e come. **Tutto**, **Perse**, **In arrivo**, **In
  uscita** e, dopo che una chiamata è stata bloccata, **Bloccate** la filtrano; con due SIM, **SIM 1** o **SIM 2**
  tiene le chiamate di quella SIM. Chiamate una dopo l’altra con lo stesso numero appaiono una volta, con quante sono.
  **☏** richiama; un tocco sulla riga mostra le sue chiamate, quanto è durata ognuna, e **Chiama** (con due SIM, una
  per ciascuna), **Invia un SMS**, **Aggiungi ai contatti** per un numero che non è tra i tuoi contatti, e **Modifica il
  numero prima di chiamare**. Viste lì, le chiamate perse lasciano la notifica di Android, e quella notifica apre
  **Recenti**.
- **Eliminare le chiamate:** nelle chiamate della riga, **Elimina questa chiamata** (o **Elimina queste 3 chiamate**,
  per una riga di più chiamate) le elimina dalla cronologia delle chiamate di Android, **Elimina** accanto a una di più
  chiamate elimina solo quella, ed **Elimina tutte le chiamate con questo numero**, quando ce ne sono altre, le elimina
  tutte, anche quelle più vecchie. Prima appare **Annulla** per qualche secondo; fino ad allora vengono solo nascoste.
- **Preferiti:** i contatti con la stella nei contatti del tuo telefono, con le loro foto. Un tocco chiama il numero
  predefinito del contatto, o chiede quale quando ce ne sono più di uno e nessuno è predefinito; tenuto premuto, li
  mostra tutti.
- **Altro per un numero:** appena un numero è digitato sulla tastiera, **⋯** accanto offre **Aggiungi ai contatti**, **Aggiungi a un contatto esistente** (si aprono i tuoi contatti: tocca quello a cui aggiungere il numero, o creane uno nuovo), **Invia un SMS** e **Copia il numero**. In **Recenti**, le chiamate della riga offrono lo stesso, e **Apri il contatto** per un numero che è uno dei tuoi contatti. In **Preferiti**, tieni premuto un contatto per vedere i suoi numeri, ciascuno con **Invia un SMS** e **Copia il numero**, e **Apri il contatto**. Con Erevos bloccato, il Telefono si limita a chiamare e a copiare un numero: niente SMS, nessuna modifica ai tuoi contatti. Ogni tasto, **Chiama** e l’Invio della tastiera danno una breve vibrazione; in **Impostazioni** → **Aspetto** → **Vibrazione al tocco** la spegni. Vedi [Aspetto](#appearance).
- **Chiamate Wi-Fi e voce HD:** la schermata di chiamata lo dice sotto il nome quando una chiamata passa via Wi-Fi o
  con la voce HD, e **Recenti** lo dice per ogni chiamata.
- **Blocco chiamate:** in **Telefono** → **Impostazioni**, **Blocca il telemarketing** blocca le chiamate dai numeri
  che alcuni paesi riservano al telemarketing: Francia (01 62, 01 63, 02 70, 02 71, 03 77, 03 78, 04 24, 04 25, 05 68,
  05 69, 09 48, 09 49 e da 09 475 a 09 479, secondo la decisione 2022-1583 dell’ARCEP), Spagna (400, dal 17 ottobre
  2026), Cile (809), India (140) e Brasile (0303, che lì chi chiama può omettere da agosto 2025). Gli altri paesi non
  riservano numeri del genere, o Erevos non ne è sicuro, quindi per loro non si blocca nulla. In **Numeri che iniziano
  con**, scrivi l’inizio di altri numeri da bloccare, con il prefisso del paese (+33 162) o come lo componi qui (0162),
  e tocca **Blocca**; **Rimuovi** ne toglie uno. Questi non bloccano mai un numero tra i contatti del tuo telefono. Una
  chiamata bloccata non squilla e non lascia notifiche; appare in **Recenti**, sotto **Bloccate**. Android chiede una
  volta se Erevos può filtrare le chiamate
  (**Lascia che Erevos filtri le chiamate**): senza, una chiamata bloccata squilla un attimo prima che Erevos la chiuda.
  Quello che è bloccato è lo stesso in ogni spazio, quindi non dice nulla di un altro, ed è conservato sul telefono
  senza nomi.
- **Numeri bloccati:** in **Telefono** → **Impostazioni**, **Numeri bloccati** è l’elenco di Android stesso, lo stesso
  di **Impostazioni** → **Telefono e SMS** → **SMS** → **Numeri bloccati**: scrivi un numero e tocca **Blocca**, o
  toccane uno per sbloccarlo. In **Recenti**, le chiamate di una riga mostrano **Blocca questo numero** o **Sblocca
  questo numero**, con **Annulla**. Android rifiuta le loro chiamate prima che squillino, e i loro SMS e MMS. Ogni
  spazio vede lo stesso elenco.
- **Numeri sconosciuti e spam:** per un numero che non è tra i tuoi contatti, la schermata di chiamata dice sotto il
  numero da dove viene (il paese e la bandiera, e la città di un fisso quando il numero la indica) e se è un
  cellulare, un fisso, gratuito o a tariffa maggiorata: letto dal solo numero, sul telefono. In **Telefono** →
  **Impostazioni**, **Lista spam** scarica intera una lista di numeri noti per lo spam dall’indirizzo https:// che
  scrivi: un numero per riga con il prefisso del paese, o l’inizio di numeri seguito da \`*\`, poi che tipo di
  chiamate sono. Erevos non ne ha una sua; scegli una lista di cui ti fidi. Senza Tor, il server della lista vede
  l’indirizzo internet del telefono, ed Erevos lo dice prima. La schermata di chiamata di un numero della lista
  mostra **Possibile spam**; **Chiamate spam in silenzio** le fa squillare senza suono (Android 10 e successivi),
  mai quelle di un contatto. In **Recenti**, **Segnala come spam** su un numero che non è tra i tuoi contatti lo
  aggiunge solo su questo telefono, e **Non è spam** lo toglie; **Dimentica le mie segnalazioni** le cancella.
  Nessun numero viene mai cercato da nessuna parte. **Scaricala di nuovo ogni settimana** la riporta dallo stesso
  indirizzo quando ha una settimana, con Erevos sbloccato, tramite Tor quando la via Tor dello spazio è attiva; è
  disattivato finché non lo attivi.
- **Un gruppo di contatti per un po’:** in **Telefono** → **Impostazioni**, **Blocca un gruppo di contatti** elenca i
  gruppi (le etichette) dei contatti del tuo telefono. **Blocca** accanto a uno blocca le chiamate dei suoi contatti
  **Per un’ora**,
  **Fino a domani mattina** (7:00) o **Finché non lo sblocco**; la riga sotto il gruppo dice fino a quando, e
  **Sblocca** lo termina prima. Una chiamata del genere viene bloccata come le altre: non squilla, e appare in
  **Recenti**, sotto **Bloccate**. Erevos legge solo i gruppi, e conserva l’id del gruppo e l’ora, non il suo nome.
  Mentre un gruppo è bloccato, la schermata **Telefono** lo dice in alto, fino a quando, con **Sblocca**.

**Perché:** una chiamata viene filtrata anche con Erevos bloccato, quindi quello che è bloccato non può essere
sigillato dentro uno spazio; e conservato uguale per ogni spazio, non mostra nulla di nessuno di essi.

- **La password di Erevos:** la schermata **Telefono**, con il tastierino, le chiamate e i preferiti, è dietro di essa
  come il resto di Erevos. Solo la schermata di chiamata non lo è, a meno che tu non lasci aprire il Telefono senza: in
  **Telefono** → **Impostazioni**, **Apri il Telefono senza password** (all’inizio disattivato, e mostrato solo mentre
  Erevos ha una password). Con Erevos bloccato, l’icona del Telefono, un link tel: e la notifica di una chiamata persa
  aprono allora il tastierino, **Recenti** e **Preferiti**, che Android conserva per ogni app Telefono, con i soli nomi
  dei contatti del telefono: mai quelli salvati solo in Erevos o delle chat nascoste, e nessuna SIM conservata per un
  numero. Lì puoi chiamare, niente di più: niente eliminazioni, blocchi, SMS o aggiunte ai contatti. **Apri Erevos** in
  alto mostra la schermata della password, come fa l’icona di Erevos stesso dopo che Erevos è stato in background per
  più di 30 secondi, a meno che una chiamata fatta da lì non l’abbia portato via. **Rimetti il Telefono dietro la
  password** lo disattiva.
- **Se Erevos non diventa l’app Telefono:** come per gli SMS, Android 15 e successivi possono impedirlo a un’app
  installata da un browser. In **Impostazioni**, tocca **Apri App predefinite** → **App Telefono** → Erevos. Se
  Android lo chiama un’impostazione con restrizioni, apri **Informazioni app** di Erevos, tocca **⋮** in alto a
  destra → **Consenti impostazioni con restrizioni**, e scegli di nuovo Erevos. **Consenti chiamate e contatti**
  appare finché Android blocca ancora le chiamate, la cronologia delle chiamate o i contatti.
- **Dopo il riavvio del telefono:** finché non sblocchi il telefono per la prima volta, risponde la schermata di
  chiamata di Android stesso.
- **Che cos’è una chiamata telefonica:** una normale chiamata telefonica, come con ogni app Telefono: la trasporta
  l’operatore telefonico, che può ascoltarla. Le chiamate ai tuoi contatti Erevos da una chat sono un’altra cosa:
  crittografate end-to-end, via internet.

## Contatti {#contacts}

Su Android, **Contatti** nel menu mostra i contatti del telefono: quelli nei contatti di Android stesso, che usano
anche le tue altre app, quindi non c’è niente da importare. Android chiede una volta se Erevos può leggerli e
modificarli (**Consenti i contatti**). Si aprono anche dalla persona in cima alla schermata principale, e hanno una
loro icona tra le app del telefono, **Contatti**, viola con una persona sul simbolo di Erevos, che li apre dietro il
blocco di Erevos: con una password, appena l’hai inserita.

- **Trovare qualcuno:** **Cerca nei contatti** cerca in ogni campo: nomi, numeri (comunque siano scritti, con o senza
  prefisso del paese), email, indirizzi, l’azienda, il compleanno e la nota. **Preferiti** mostra solo i contatti con
  una stella.
- **Un contatto:** toccane uno per vederlo tutto. Tocca un numero per chiamarlo{~, o **SMS** accanto per scrivergli in
  Erevos}; tocca un’email o un indirizzo per aprirlo. **Aggiungi ai preferiti** in alto gli dà una stella, nei contatti
  di Android, così anche l’app Telefono lo elenca tra i preferiti.
- **Nuovo contatto** e **Modifica:** nome e cognome, azienda e qualifica, tutti i numeri, le email e gli indirizzi che
  ti servono, ognuno con il suo tipo (**Cellulare**, **Casa**, **Lavoro**, **Altro**), un compleanno (giorno/mese/anno,
  o giorno/mese) e una nota. Un nuovo contatto viene salvato **Solo su questo telefono**, o in un account con cui il
  telefono sincronizza i contatti (Google), come scegli. Quello che Erevos non mostra di un contatto, come i dettagli
  propri di un’altra app, resta com’era.
- **Foto:** tocca l’immagine in cima a un contatto per **Scegli una foto** dalle foto del telefono, **Scatta foto** con
  la fotocamera, o **Rimuovi la foto**. La ritagli quadrata, ed Erevos la ridisegna, così non resta niente di quello che
  la foto diceva oltre all’immagine (un luogo, un telefono). Viene conservata con il contatto nei contatti di Android,
  dove il telefono la mostra quando chiama.
- **Suoneria:** su un contatto, **Scegli la suoneria** apre il selettore di Android stesso, con i suoni del telefono e
  quelli che hai aggiunto; il telefono squilla con quella quando chiama quel contatto. **Suoneria predefinita** lì
  ridà quella del telefono.
- **File .vcf:** **Importa da un file .vcf** nel menu di Contatti legge un file vCard salvato da un altro telefono o
  da un’altra app (qualsiasi sua versione, anche quella dei vecchi telefoni greci) e salva quelli non ancora sul
  telefono, con le loro foto e i loro gruppi, solo su questo telefono o in un account. **Salva come file .vcf** lì salva
  i contatti mostrati (tutti, i preferiti, un gruppo, o quello che ha trovato la ricerca) come un unico file, in una
  cartella che scegli; su un contatto, salva quello. Il file è fuori da Erevos e non è sigillato: chiunque lo abbia può
  leggere i contatti.
- **Codici QR:** **Codice QR** su un contatto mostra la sua vCard come codice QR, che la fotocamera di un altro
  telefono legge come contatto da aggiungere: il suo nome, i numeri, le email, gli indirizzi e la nota, senza la foto
  (una nota lunga o molti indirizzi vengono esclusi per farlo stare). Chiunque lo veda può leggerlo. **Leggi il codice
  QR di un contatto** nel menu ne legge uno da una foto che scatti o scegli, qui sul telefono, e inizia con esso un
  nuovo contatto, salvato solo quando lo salvi. Il codice QR Erevos di qualcuno ne inizia uno con il suo ID {=Erevos}.
- **Duplicati:** **Trova duplicati** nel menu elenca i contatti che sembrano la stessa persona salvata due volte: lo
  stesso nome (le sue parole in qualsiasi ordine), numero o email. **Unisci** tiene il più completo, con ogni numero,
  email e indirizzo degli altri, le loro note, e la loro foto, suoneria, stella e gruppi quando non li ha, ed elimina
  gli altri; **Unisci tutti** lo fa per ogni gruppo di duplicati. **Non sono uguali** nasconde un gruppo di duplicati
  finché non riapri l’elenco.
- **Compleanni:** l’etichetta **Compleanni** sotto la ricerca elenca i contatti con un compleanno, dal prossimo, con
  quanti giorni mancano e gli anni che compiono. **Promemoria dei compleanni** nel menu (all’inizio disattivato) mette
  una notifica la mattina di ognuno, dalle 9:00, anche con Erevos chiuso; sulla schermata di blocco dice solo che c’è
  un compleanno. Sono solo i compleanni dei contatti del telefono, mai quelli dei contatti salvati solo in Erevos.
- **Contatti della SIM** nel menu legge i contatti sulle schede SIM del telefono e copia quelli non ancora sul telefono
  (all’inizio tutti scelti) nei contatti di Android, solo su questo telefono o in un account. La SIM tiene i suoi.
- **Solo in Erevos:** in **Salvato in**, un nuovo contatto può invece essere salvato **Solo in Erevos**: sigillato in
  questo spazio come le sue chat, mai nei contatti di Android, così nessun’altra app o account lo vede, e le altre app
  mostrano solo il suo numero; la schermata di chiamata di Erevos mostra il suo nome mentre Erevos è sbloccato. Ha un
  lucchetto nell’elenco, e l’etichetta **Solo in
  Erevos** mostra solo questi.
  **Salva solo in Erevos** su un contatto del telefono lo sposta dentro, con la sua foto e la sua stella, e lo elimina
  dai contatti del telefono; **Sposta nei contatti del telefono** lo riporta fuori. La sua foto è sigillata con lui.
  Gruppi, suonerie e promemoria dei compleanni sono di Android, quindi non ne ha. Una chiamata{~ o un SMS} a lui passa
  comunque dal telefono, e appare nel registro chiamate{~ e negli SMS|} del telefono come qualsiasi altro. Un backup di
  Erevos contiene questi contatti, sigillati.
- **Nelle chat nascoste:** **Contatti** in cima alle chat nascoste aperte elenca i loro contatti, salvati solo lì e
  sigillati con loro: non appaiono da nessun’altra parte, nemmeno nei contatti dello spazio, e la schermata non mostra
  nulla appena le chat nascoste si chiudono. Un nuovo contatto lì è sempre uno dei loro. Gli si può dare una foto,
  perché le chat nascoste restano aperte mentre la scegli o la scatti. Il loro menu ha solo quello che è loro:
  **Importa da un file .vcf** tiene i contatti di un file con loro, sigillati, mai nei contatti del telefono; **Salva
  come file .vcf** salva quelli mostrati, o uno sulla sua scheda, in una cartella che scegli (fuori da Erevos e non
  crittografato); **Leggi il codice QR di un contatto** inizia uno dei loro contatti. Un ID {=Erevos} scritto o letto lì
  lo aggiunge alle chat nascoste, mai a quelle dello spazio. Chiamarne uno tramite l’app Telefono chiude le chat
  nascoste appena Erevos resta lontano per più di 30 secondi, e appare nel suo registro chiamate.
- **ID {=Erevos}:** l’ID {=Erevos} di un contatto è il link di contatto che mostra il suo {=Erevos}, sotto **Copia il mio link
  di contatto** o come suo codice QR. Sulla scheda di un contatto, o sotto **ID {=Erevos}** quando ne scrivi uno,
  incollalo, o leggilo con **Fotografa il codice QR** o **Scegli una foto del codice QR**: **Aggiungi a Erevos** (o
  **Salva**) lo aggiunge alle tue chat Erevos, che si aprono con lui, e collega il contatto a lui, e la chat prende il
  nome del contatto se non ne ha uno suo. Un contatto che è un contatto Erevos mostra l’inizio della sua chiave come
  **ID {=Erevos}**.
- **Contatti Erevos:** un contatto che è la stessa persona di uno dei contatti Erevos delle tue chat appare come
  un’unica scheda con esso: da un numero collegato a lui in Erevos, dal suo ID {=Erevos}, o con **Scegli dalle mie chat
  Erevos** sulla sua scheda, un collegamento sigillato nello spazio, mai nei contatti di Android (**Non è questo
  contatto Erevos** lo annulla). La scheda ha allora **Messaggio**, **Chiama** e **Video**, crittografati end-to-end
  tramite Erevos invece che tramite l’operatore telefonico. Un contatto delle chat che non è nessun contatto
  ha una sua scheda, con lo scudo, dove **Aggiungi ai contatti** ne crea uno e **Collega a uno dei miei contatti** lo
  collega a uno che hai, la cui scheda allora lo mostra; l’etichetta **Contatti Erevos** li elenca tutti. Un contatto
  Erevos senza un nome suo prende il nome del contatto collegato a lui, quando vengono collegati o
  quando si apre la scheda di quel contatto; un nome che gli hai dato in Erevos resta, e uno che hai svuotato torna dal
  contatto in quel momento. Nelle chat nascoste, questi sono i contatti delle chat nascoste stesse, e la loro chat si
  apre lì.
- **Cronologia:** la scheda di un contatto elenca {~le sue ultime chiamate nel registro chiamate del telefono, i suoi SMS
  e |}i suoi messaggi in Erevos, dai più recenti; toccane uno per {~richiamare, scrivere un SMS o |}aprire la chat.{~ Le
  chiamate appaiono appena lasci che Erevos legga il registro chiamate (**Mostra le chiamate**). Erevos le legge solo
  per mostrarle, e non ne conserva una copia.}
- **Altre app:** il pulsante **Aggiungi ai contatti** di un’altra app (un numero nell’app Telefono, un’email nella
  posta) può aprirsi in Erevos: un nuovo contatto con quello che ha dato quell’app, o l’elenco per toccare il contatto
  a cui aggiungerlo. Anche un’app che mostra o modifica un contatto può aprirlo in Erevos, dietro il blocco di Erevos.
  Android chiede quale app usare; scegli Erevos. Un’app che ti chiede di scegliere un contatto, o un numero, un’email o
  un indirizzo, riceve solo quello che tocchi, dai contatti del telefono: quelli salvati solo in Erevos non appaiono
  mai lì.
- **Elimina** toglie il contatto dal telefono, da ogni account in cui è salvato; uno salvato solo in Erevos, da Erevos.
- **Gruppi:** **Gruppi** nel menu di Contatti (i tre puntini) elenca i gruppi di Android stesso, come Famiglia o
  Lavoro, con quanti contatti ci sono in ognuno, e ne crea di nuovi. Aprine uno per **Aggiungi contatti**, toglierne
  uno con **×**, **Rinomina** o **Elimina gruppo** (i suoi contatti restano). Su un contatto, **Scegli i gruppi** lo
  mette nei gruppi o lo toglie. Le etichette sotto la ricerca mostrano i contatti di un gruppo. Un gruppo è salvato in
  un account, come i suoi contatti: un contatto ci entra solo se è salvato anche lui in quell’account.

## Blocco con password {#lock}

In **Impostazioni** → **Privacy e sicurezza** → **Blocco e seconda password**, **Blocca all’apertura di Erevos** ha
due scelte: **Nessun blocco** e **Password**.

1. Tocca **Password**, scrivila due volte (almeno 4 caratteri) e tocca **Salva**.
2. Da quel momento Erevos la chiede a ogni apertura, e di nuovo dopo 30 secondi in background.
3. **Cambia password** la cambia, e **Blocca ora** blocca subito Erevos.

- **Una frase, non un PIN corto:** ciò che controlla la password è custodito nell’archivio delle chiavi del telefono,
  quindi una copia della sua memoria non basta per provare password. Ma chi viola la sicurezza del telefono stesso,
  come fanno strumenti forensi su alcuni telefoni, potrebbe provare su computer propri, e un PIN di 6 cifre, un
  milione di combinazioni, cade in pochi giorni. Una frase di 4 o 5 parole no. Sotto una nuova password corta, o un
  PIN di chat nascoste, Erevos lo dice, e la accetta solo dopo **Usalo comunque**. Chi ha un backup e la sua password
  può fare gli stessi tentativi sul backup: lì un PIN corto è più debole.
- **Bloccato, ma riceve:** quando Erevos si blocca, la schermata della password si mette davanti allo spazio aperto,
  che continua dietro di essa: messaggi e chiamate arrivano comunque, con le loro notifiche, e una chiamata appare sopra
  la schermata della password. Le sue schermate si chiudono, anche le chat nascoste, e la schermata di chiamata non
  mostra più i nomi dei suoi contatti. La sua password lo riapre; la password di un altro spazio prima lo chiude, senza
  che ne resti nulla in memoria.
- [~] **Solo gli SMS:** con Erevos bloccato, l’icona SMS, il pulsante **SMS** del widget e la notifica di un nuovo SMS
  chiedono comunque la password, ma poi aprono solo gli SMS: l’elenco delle conversazioni SMS del telefono, ciascuna in
  una riga propria, le conversazioni stesse, **Archiviate**, **Spam** e **Cestino**, e **Nuovo SMS**. Nient’altro dello
  spazio si vede. Qualsiasi altra cosa, un contatto, una chat, **Impostazioni**, l’icona stessa di Erevos o il lucchetto
  arancione **Sblocca tutto** in alto, chiede di nuovo la password e poi apre tutto lo spazio. Così un codice arrivato
  per SMS si può leggere con qualcuno accanto, e il resto di Erevos resta chiuso.
- **Solo i Contatti:** allo stesso modo, l’icona Contatti, il pulsante **Contatti** del widget e la notifica di un
  compleanno chiedono la password, e poi aprono solo i contatti: il loro elenco, la scheda di un contatto (senza le tue
  chat e le chiamate con lui), **Modifica**, i gruppi, i duplicati, la SIM e l’importazione. **Chiama** apre ancora il
  tastierino del telefono. Una chat{~, un SMS|}, **Impostazioni** o il lucchetto arancione **Sblocca tutto** in alto chiede
  di nuovo la password e poi apre tutto lo spazio. Un’altra icona, il widget o una notifica, quando sono aperti {~solo gli
  SMS o |}solo i Contatti, chiede la password come quando Erevos è bloccato e poi apre ciò che indica: l’icona Contatti
  solo i contatti, {~l’icona SMS solo gli SMS, |}l’icona stessa di Erevos tutto lo spazio.

- **Vedere ciò che scrivi:** ogni campo per una password, un PIN o un token, qui e ovunque in Erevos, ha un occhio in
  fondo: toccalo per vedere ciò che scrivi, e di nuovo per nasconderlo. Torna nascosto ogni volta che il campo si
  mostra di nuovo, e su Android alla tastiera viene chiesto di non impararlo.
- **Password sbagliate:** dopo 5 tentativi sbagliati, ognuno dei successivi ti fa aspettare, all’inizio 30 secondi e
  ogni volta il doppio, fino a un’ora. Il conteggio sopravvive a un riavvio. L’attesa segue l’orologio proprio del
  telefono da quando è stato acceso, che nessuno può impostare, quindi spostare avanti la data e l’ora non la termina;
  se il telefono viene spento e riacceso durante un’attesa, la aspetta di nuovo dall’inizio, perché il tempo già
  atteso non si può conoscere. Nella web app e su un computer funziona allo stesso modo finché Erevos resta aperto, e
  ricomincia dall’inizio quando Erevos si apre di nuovo.
- **Che cosa è sigillato:** i contatti di ogni spazio, le chiavi delle sue conversazioni, i suoi messaggi, le sue
  impostazioni del relay e il suo aspetto sono conservati sul telefono sigillati con una chiave che solo la sua password
  apre.
- **L’elenco subito:** la schermata principale conserva una copia sigillata delle sue prime righe, così l’elenco appare
  appena lo spazio si apre e poi si aggiorna. Ha sempre la stessa dimensione, quindi non dice a nessuno quante chat ci
  sono o quali spazi sono usati, e non contiene mai quello che diceva un messaggio effimero.

**Perché:** ogni password provata costa di proposito tempo e molta memoria (PBKDF2, poi Argon2id), così chi copia
quello che il telefono conserva non può provare password velocemente; e chi ha in mano il telefono aspetta di più dopo
ogni tentativo sbagliato. Il conteggio è unico per tutto il telefono, mantenuto tra un riavvio e l’altro, perché la
schermata della password viene prima che si apra qualsiasi spazio, e l’attesa è misurata dove spostare l’orologio non
può accorciarla.

> Non c’è modo di recuperare una password dimenticata: non è conservato niente che possa aprire i dati senza di essa.
> Solo un’impronta o un volto, finché è attivo, apre ancora il primo spazio (vedi più sotto).

### Screenshot

Con il blocco con password attivo, Android tiene Erevos fuori dagli screenshot, dalle registrazioni dello schermo e
dalle app recenti: lì l’ultima schermata di Erevos appare vuota, così chi ha in mano per un momento il telefono
sbloccato non vi vede le tue chat. In
**Impostazioni** → **Privacy e sicurezza** → **Screenshot**, **Disattiva** fa funzionare di nuovo gli screenshot (per
inviarne uno, per esempio), e **Attiva** ripristina la protezione. Finché è attiva, anche le chat
nascoste restano fuori da essi, pure in uno spazio senza blocco con password; disattivata, gli screenshot funzionano
anche in quelle. L’impostazione è del telefono,
la stessa in ogni spazio. Su un computer e nella web app non esiste.

**Perché:** senza, l’ultima schermata di Erevos resta come immagine tra le app recenti finché Erevos non si riapre,
quindi le chat nascoste restano sempre fuori, per non apparire mai lì senza il loro PIN. L’impostazione è la stessa in
ogni spazio così che non dica nulla di quale spazio si è aperto.

### Impronta o volto

Su Android 11 e successivi, con un’impronta o un volto configurati nelle impostazioni del telefono, Erevos può aprirsi
anche così. È disattivato finché non lo attivi.

1. Con il blocco con password attivo, in **Impronta o volto**, tocca **Attiva**.
2. Scrivi la password dello spazio in cui ti trovi, tocca **Attiva**, e tocca il sensore (o guarda il telefono).
3. Da quel momento la schermata della password ha un pulsante **Impronta o volto**. Anche la password funziona sempre,
   e **Disattiva** lo disattiva.

- **Solo lo spazio della prima password:** un’impronta non apre mai lo spazio di una seconda password, né le chat
  nascoste. Attivata nello spazio che apre una seconda password, non apre nulla: la prima volta che viene provata si
  disattiva da sola, e la password apre Erevos. L’impostazione appare uguale in ogni spazio.
- **Sotto costrizione:** qualcuno che ti trattiene può premere il tuo dito sul telefono, o metterlo davanti al tuo
  viso. Se può succedere, tienila disattivata: così serve una password, e puoi dargli la seconda.
- **Come è conservata:** la chiave del primo spazio è sigillata da una chiave nell’hardware sicuro del telefono
  (l’Android Keystore) che funziona solo subito dopo un controllo forte dell’impronta o del volto, una volta per ogni
  uso. Aggiungere o rimuovere un’impronta o un volto fa scartare ad Android quella chiave: allora è disattivata, e la
  riattivi. Niente lascia il telefono.
- **Quale volto:** un volto conta solo dove Android considera forte il suo sblocco con il volto, come sul Pixel 8 e
  successivi; altrove vale l’impronta.
- **Le password sbagliate** vengono contate come prima: un’impronta non cambia il conteggio.
- **Non su computer o sul web:** è offerta solo su Android. Disattivare il blocco disattiva anche questa.

**Perché:** un dito è più facile da forzare di una password, e chiunque abbia un dito o un volto che il telefono
conosce potrebbe usarlo, quindi non apre mai lo spazio di una seconda password o le chat nascoste. Attivata in un altro
spazio, conserva una chiave che non apre nulla, della stessa forma, così quello che è salvato non mostra in quale
spazio è stata attivata.

## Seconda password {#second}

Se qualcuno ti costringe ad aprire Erevos, inserisci la seconda password invece della tua. Apre un Erevos separato e
vuoto, con contatti, relay e aspetto propri. Le tue vere chat restano nascoste, e niente nell’app mostra che
esistono.

1. Con il blocco con password attivo, tocca **Imposta la seconda password**.
2. Scrivila due volte e tocca **Salva**. Deve essere diversa dalla tua password.

- **L’aspetto:** il secondo spazio parte con l’aspetto dello spazio in cui è stato impostato, così non si nota.
- **Una alla volta:** impostare di nuovo una seconda password sostituisce quella precedente. **Rimuovi la seconda
  password** la rimuove.
- **Dalla ricerca:** in uno spazio aperto, scrivi la password di un altro spazio in **Cerca nelle chat** e premi
  Invio: lo spazio aperto si chiude, senza che ne resti nulla, e si apre l’altro, come con **Blocca ora** e la sua
  password. Ci mette lo stesso tempo qualunque cosa scrivi, quindi il tempo non mostra se c’è un altro spazio. Una
  password sbagliata, o quella dello spazio aperto, è solo una ricerca; la password di panico funziona solo nella
  schermata della password.
- **Spostarci una chat:** nei **Dettagli** di una chat, tocca **Sposta in un altro spazio**, scrivi la password
  dell’altro spazio e tocca **Sposta**. La chat ci va con i suoi messaggi, nome, immagine e aspetto, e le chat importate
  in essa, cifrata con la chiave di quello spazio, e quello spazio resta chiuso. Il codice di sicurezza resta lo stesso,
  e al suo telefono viene detto subito di scrivere lì d’ora in poi. La voce si vede in ogni spazio, e la password viene
  provata come nella ricerca: una sbagliata, o quella dello spazio aperto, non sposta nulla. Una chat con qualcuno con
  cui l’altro spazio ha già una chat sua resta dov’è. Chi legge l’altro spazio con uno strumento forense potrebbe capire
  che la chat viene da altrove: il suo contatto la conosce ancora con la chiave di questo spazio.
  Se quello spazio non ha ancora un relay, Erevos offre quello di questo spazio: **Sposta con il relay di questo
  spazio** sposta la chat e dà a quello spazio questo relay da tenere, e il relay può allora capire che entrambi gli
  spazi sono su un solo telefono.
- **Discrezione:** per privacy, l’app non mostra mai se è impostata una seconda password. Nella web app con le
  notifiche ad app chiusa attive, il numero sull’icona di Erevos resta finché Erevos è chiuso: se non corrisponde allo
  spazio che apri, può lasciarne intuire un altro (**Numero sull’icona** lo disattiva).

## Chat nascoste {#hidden}

Ogni spazio ha 4 posti per chat nascoste, ognuno aperto solo con il suo PIN, e non appaiono mai tra le tue altre
chat. Non c’è nessun pulsante per loro da nessuna parte. Ogni posto può contenere una chat o più, quindi 2 spazi hanno
8 posti.

**Perché:** ogni posto ha già un suo PIN, quindi una chat da sola in un posto ha una sua chiave, e un posto può anche
contenere più chat sotto un unico PIN. Il numero di posti è fisso per due motivi:

- **Perché non si veda niente.** Tutti e 4 i posti esistono dal primo avvio, riempiti di dati casuali finché non sono
  usati. Chi ti costringe ad aprire il telefono, o copia quello che conserva, non può capire se hai chat nascoste, né
  quante. Con una chiave per ogni chat, i file sigillati crescerebbero a ogni nuova chat nascosta, e rivelerebbero
  quante sono.
- **Perché resti veloce.** Un PIN scritto nella ricerca viene provato su ogni posto, e ogni tentativo è lento di
  proposito (Argon2id, che richiede molta memoria e tempo, così i PIN non si possono indovinare velocemente). Con 4
  posti l’apertura resta breve e richiede sempre lo stesso tempo, così nemmeno il tempo dice quanti sono usati.

Il numero si può aumentare in seguito senza perdere nulla, al prezzo di un’apertura un po’ più lenta; diminuirlo
cancellerebbe quello che contengono i posti tolti.

1. Inizia un posto in uno dei due modi: in **Impostazioni** → **Privacy e sicurezza** → **Chat nascoste**, scegli da
   **Posto 1** a **Posto 4**, tocca **Imposta il PIN delle chat nascoste**, scrivilo due volte e tocca **Salva**;
   oppure apri i **Dettagli** di una chat, tocca **Sposta nelle chat nascoste**, scrivi un PIN di 4 o più caratteri,
   tocca **Nuove chat nascoste**, scegli un posto, poi **Crea e sposta**. Ricorda quali posti usi: per privacy, Erevos
   non può dire quali sono liberi.
2. Per aprirle, scrivi il PIN in **Cerca nelle chat** nella schermata principale e premi Invio (il tasto di ricerca
   della tastiera). Oppure tieni premuto **Nuova chat** per un attimo: si apre un campo per il PIN, con una breve vibrazione su Android, uguale in ogni
   spazio; scrivilo e tocca **Apri**. Apre solo il posto con quel PIN. Un PIN sbagliato è solo una ricerca, o chiude
   solo il campo: non succede nulla.
3. Si aprono con il titolo **Chat nascoste**, con **Contatti** e **Cambia PIN** in alto, ed elencano le loro chat e i
   loro gruppi come la schermata principale elenca i tuoi: dai più recenti, ognuno con l’ultima cosa detta, quando, e
   quanti messaggi non sono letti. Toccane una per aprirla. La freccia indietro le chiude.
4. Per spostare un’altra chat in un posto, apri i suoi **Dettagli**, tocca **Sposta nelle chat nascoste**, scrivi il
   PIN di quel posto e tocca **Sposta**. La
   chat lascia il tuo elenco con i suoi messaggi, nome, immagine e aspetto, e le chat importate in essa, e il suo codice
   di sicurezza resta lo stesso. Al suo telefono
   viene detto subito di scrivere alle chat nascoste d’ora in poi; un messaggio che invia proprio in quel momento
   potrebbe non arrivare.
5. Per riportare una chat tra le chat dello spazio, aprila nelle chat nascoste, poi i suoi **Dettagli**, tocca
   **Riporta nelle mie chat** e **Sposta**. Va con i suoi messaggi, nome, immagine, aspetto e chat importate, e al suo
   telefono viene detto dove scrivere.

- **Relay, Nostr e telefoni vicini:** le chat nascoste hanno una loro coda sul relay e le loro chiavi. Mentre sono
  aperte, o ricevono da chiuse, raggiungono anche il telefono di un contatto vicino, come le tue altre chat (vedi [Chat
  con un telefono vicino](#nearby)), ma altri telefoni non le portano mai, e non passano mai via LoRa{~ né via SMS}. Senza relay, il loro link di contatto dice dove leggono su Nostr, con una chiave solo di quel
  posto, e i testi vanno lì, come da un telefono senza relay; foto, messaggi vocali, chiamate e gruppi hanno bisogno di
  un relay. Mentre sono chiuse, i loro messaggi aspettano sul relay, o su Nostr per due giorni, a meno che **Ricevere
  da chiuse** non sia attivo.
- **Ricevere da chiuse:** un interruttore in cima a ogni posto. Se è attivo, le sue chat nascoste ricevono come le tue
  altre chat mentre lo spazio è aperto, qualunque schermata sia visibile e con Erevos in background: i loro contatti
  vedono subito che un messaggio è arrivato, una notifica dice solo «New message», su Android una chiamata squilla con
  «Incoming call» e senza nome (sulla schermata della chiamata, **Rispondi** la prende senza PIN, su una schermata senza nome né volto, e le chat nascoste restano chiuse; il piccolo segno, il PIN e **Connetti** le aprono e rispondono lì), e un promemoria della loro Chat con me stesso mostra una notifica che dice solo
  **Reminder**. Allora viene letto anche quello che arriva loro tramite Nostr{+, e i loro account Matrix, XMPP e Nostr
  restano collegati (vedi sotto)}. Una chiamata che è finita prima che le aprissi, o ha squillato troppo a lungo, appare
  come persa. Niente di loro appare da nessuna parte finché il PIN non le apre. Un nuovo posto parte con questo attivo;
  i posti impostati prima restano com’erano finché non lo attivi. Per questo, la chiave del posto è conservata
  crittografata con lo spazio, tra una chiave casuale per ogni altro posto, così aprire lo spazio non mostra quali posti
  ricevono, o sono impostati. Ma chi apre lo spazio e copia quello che il telefono conserva potrebbe aprire anche quel
  posto, senza PIN: il PIN allora le tiene nascoste a chi ha in mano il telefono, non a uno strumento forense. Se è
  disattivato, la loro chiave è solo dietro il PIN, e i loro messaggi aspettano sul relay finché non le apri. I backup
  conservano l’interruttore.
- **Punto per i non letti:** con **Ricevere da chiuse** attivo, un interruttore sotto (spento a meno che non lo
  accendi). Acceso, finché una delle chat o dei gruppi del posto ha un messaggio non letto{+, o una delle sue chat
  Matrix, XMPP o Nostr ne ha avuto uno dall’ultima volta che lo hai aperto}, un piccolo punto compare sulla lente di
  **Cerca nelle chat** nella schermata principale: mai quanti, né dove. Se ne va appena li leggi. Chi vede le chat
  dello spazio lo vede anche lui, e può intuire che ci sono chat nascoste. I posti che hanno solo **Avvisa quando
  arriva un messaggio** non hanno il punto: l’interruttore dovrebbe stare dove lo spazio può leggerlo.
- **Si chiudono da sole** appena Erevos è stato in background per più di 30 secondi, come si riblocca il PIN di una
  chat, ma non durante una chiamata, né mentre scegli una foto o un file per loro o scatti una foto.
- **Mentre sono aperte,** un messaggio che arriva fa sentire il suono dei nuovi messaggi, come nelle tue altre chat.
  Con Erevos in background prima che si chiudano, una notifica dice «New message» solo se **Ricevere da chiuse** o
  **Avvisa quando arriva un messaggio** è attivo per quel posto.
- **Come le tue altre chat:** quello che non può partire ora aspetta, segnato **In attesa**, solo tramite il loro
  relay, o Nostr senza relay (vedi **In attesa** in [Chat tramite un relay](#relay)), **Invia più tardi** funziona come
  lì, e una chat esportata da un’altra app si può importare nei dettagli di una chat nascosta (vedi [Chat
  importate](#import)). Anche lì si può aggiungere un contatto da una foto del suo codice QR, scattata o scelta mentre
  restano aperte. Ogni posto ha la sua **Chat con me stesso**, prima nel suo elenco (vedi **Chat con me stesso e
  promemoria** in [Per iniziare](#start)).
- **Gruppi:** **Nuovo gruppo**, sotto il loro elenco, crea un gruppo con i loro contatti, come nella schermata
  principale (vedi [Chat di gruppo](#groups)), e appare nel loro elenco tra le loro chat. I suoi membri sono solo
  contatti di quel posto, e uno che aggiungi come contatto da lì diventa un contatto di quel posto. Quello che vi si
  scrive passa solo dal relay del posto, a una sua coda lì, mai a un telefono vicino; mentre il posto è chiuso viene
  letto solo con **Ricevere da chiuse** attivo, e **Avvisa quando arriva un messaggio** non lo conta. Le sue chiamate
  squillano solo mentre le chat nascoste sono aperte: una avviata mentre sono chiuse appare come persa. Un gruppo lì
  non ha un PIN suo, e nessuno è pubblico.
- [+] **Matrix, XMPP e Nostr:** sotto il loro elenco, **Matrix**, **XMPP** e **Nostr** aprono le schermate di quelle reti
  (vedi [Matrix](#matrix), [XMPP](#xmpp) e [Chat con altre app Nostr](#nostr-chats)) per account propri delle chat
  nascoste, a parte quelli dello spazio: un account Matrix e uno XMPP a cui accedere, e una chiave Nostr. Gli accessi e
  la chiave sono tenuti cifrati con la chiave delle chat nascoste, e niente di essi si vede fuori dalle chat nascoste:
  le loro chat stanno solo nell’elenco delle chat nascoste, e non aggiungono nulla al numero sull’icona di Erevos né
  all’elenco della schermata principale. Gli account si collegano mentre le chat nascoste sono aperte, e anche da chiuse
  se **Ricevere da chiuse** è attivo, come ricevono le chat nascoste stesse: allora un messaggio lì mostra una notifica
  che dice solo «New message», e su Android una chiamata Matrix o XMPP squilla con «Incoming call» e senza nome, e si
  risponde con il PIN come per le loro altre chiamate; una a cui non si risponde in tempo appare come persa, e così
  anche una chiamata di gruppo XMPP che arriva mentre sono chiuse. Se è disattivato, gli account si collegano solo
  mentre le chat nascoste sono aperte, e da chiuse non arriva niente. Le loro chat chiamano come quelle dello spazio,
  dall’account proprio delle chat nascoste; una chiamata a esso, mentre le chat nascoste sono aperte, squilla con la
  suoneria del telefono, e restano aperte finché non finisce. Un loro account Matrix non ha **Avvisa dei nuovi
  messaggi**.
- **Dispositivi collegati:** sotto il loro elenco, **Dispositivi collegati** collega queste chat nascoste per conto
  loro allo stesso posto su un computer o in un browser, dall’interno, a parte dallo spazio e dai suoi dispositivi
  collegati: le loro chat, i messaggi e i loro account vanno lì, e niente di questo si vede nello spazio (vedi **Le
  chat nascoste e le seconde password** in [Dispositivi collegati](#devices)). Non collegate, sono solo su questo
  telefono.
- **Le anteprime dei link** hanno un loro interruttore nei dettagli di una chat nascosta, per tutte le chat di quel
  posto, disattivato finché non lo attivi (vedi **Anteprime dei link** in [Chat tramite un relay](#relay)).
- **Avvisa quando arriva un messaggio** (Android): in cima a un posto mentre **Ricevere da chiuse** è disattivato. Se
  lo attivi, mentre il posto è chiuso una notifica dice solo «New message», o quanti ne sono arrivati, come per le
  altre chat, con Erevos in background o visibile, ogni messaggio
  una volta, anche quando Erevos è stato chiuso e riavviato; quello che è arrivato mentre il posto era aperto non ne fa
  nessuna dopo che si chiude. Che un tuo messaggio gli sia arrivato o sia stato letto, la scrittura in corso e le nuove
  chiavi non ne fanno, né una chiamata che ha squillato (vedi **Fai squillare le chiamate quando sono
  chiuse**); una che non ha squillato conta come messaggio. Un messaggio o un’eliminazione che altri telefoni {=Erevos}
  hanno portato al relay (vedi **Trasportati da altri telefoni** in [Chat con un telefono vicino](#nearby)) non può dire
  che cosa porta, perché i telefoni che lo portano non devono saperlo: conta come messaggio, quindi anche
  un’eliminazione mostra «New message», e il primo messaggio di una chat può contare per due; e uno inviato senza suono
  suona come al solito (vedi **Invia senza suono**). Richiede **Ricevi e squilla** e **Avvisa dei nuovi messaggi** in
  **In background**, cosa che l’interruttore dice quando non sono attivi, e un relay che aspetta (dal 18 ottobre 2026
  in poi); uno di prima del 23 ottobre
  2026 può solo dire che qualcosa aspetta, quindi allora appare «New message» anche per questo, una volta finché non
  apri quel posto. Per questo, lo spazio tiene una coda sul relay per ciascuno dei suoi 4 posti, quelle non in uso
  create per niente sullo stesso relay, così aprire lo spazio non mostra né se ci sono chat nascoste impostate né
  quali, purché usino il relay dello spazio; al relay si chiede solo quanti messaggi sono arrivati, perché li conta dal
  byte che ognuno porta (vedi che cosa vede il relay, sopra), mai i messaggi stessi. Chi vede la notifica e non trova
  niente di nuovo nelle tue chat può immaginare che ce ne siano altre. Dopo che hai eliminato o bloccato qualcuno nel
  posto, il primo messaggio di qualcuno di nuovo, dal link di contatto o dal codice QR del posto, non ne fa nessuna:
  si vede quando apri il posto. I backup lo conservano.
- **Fai squillare le chiamate quando sono chiuse** (Android): sotto **Avvisa quando arriva un messaggio**, mentre
  **Ricevere da chiuse** è disattivato. Se lo attivi, mentre il posto è chiuso, con Erevos in background o su qualsiasi
  schermata, una chiamata da uno dei suoi contatti fa squillare il telefono e
  mostrare «Incoming call» senza nome, come una chiamata dalle tue altre chat. Sulla schermata dello squillo, tocca
  **Rispondi** o il piccolo segno, scrivi il PIN e tocca **Connetti** per rispondere; **Rifiuta** ferma lo squillo. Chi
  tocca **Rispondi** senza il PIN non va oltre il campo del PIN. Lo squillo dura circa 45 secondi. Richiede **Ricevi e
  squilla** in **In background**, cosa che l’interruttore dice quando non è attivo, e un relay che aspetta, e usa una
  sua coda sul relay per ciascuno dei 4 posti, quelle che non squillano create per niente sullo stesso relay, come per
  la notifica dei messaggi qui sopra, così aprire lo spazio non rivela nulla. Chi chiama fa solo squillare una coda lì;
  la chiamata stessa aspetta sulla coda della chat finché il PIN non la apre. Un contatto che hai eliminato può ancora
  farlo squillare, ma la chiamata non può mai collegarsi. Una chiamata fatta da un computer collegato squilla solo
  mentre le chat nascoste sono aperte. I backup lo conservano.
- **Un nuovo PIN per un posto** (da **Chat nascoste** in **Impostazioni**, o da **Nuove chat nascoste**) lo fa
  ripartire vuoto e sostituisce quello che conteneva. Per tenere le chat e cambiare solo il PIN, aprile e usa **Cambia
  PIN** lì. Ogni PIN deve essere diverso dagli altri e dalla password che apre Erevos.
- **I PIN sbagliati nella ricerca** vengono contati a parte rispetto a quelli della schermata di blocco: dopo cinque,
  le ricerche smettono di provare per un po’, in silenzio, e la schermata di blocco non aspetta mai per causa loro.
- **Un PIN tiene fuori chi prende in mano il telefono,** non chi copia quello che conserva: con uno strumento forense
  su un telefono sbloccato o con root, i PIN si possono provare senza attesa. Ogni tentativo costa Argon2id (molta
  memoria e tempo), ma un PIN di 4 cifre è solo 10.000 tentativi. Se è questo che temi, usa un PIN più lungo, o qualche
  parola.
- **Discrezione:** ogni spazio ha tutti e 4 i posti dall’inizio, quelli non usati riempiti di dati casuali che
  sembrano usati, e la ricerca prova ogni volta ogni posto. Così niente mostra se ci sono chat nascoste impostate, né
  quante.

### Una chat bloccata con un PIN {#chat-pin}

Una chat o un gruppo può avere un suo PIN, a parte le chat nascoste: resta tra le tue chat, ma si apre solo con il suo
PIN.

1. Apri la chat, tocca **⋮** in alto per i suoi **Dettagli**, poi **Blocca con un PIN** (in un gruppo: il nome del
   gruppo in alto, poi **Blocca con un PIN**).
2. Scrivi due volte un PIN di almeno 4 caratteri, poi **Blocco**.

- **Aprirla:** chiede il PIN. Si riblocca appena la lasci, apri un’altra chat, o Erevos resta lontano per più di
  mezzo minuto (come il blocco con password).
- **Dietro il PIN** non si vede niente della chat: nessuno dei suoi messaggi viene disegnato finché il PIN non viene
  scritto, e con il vetro, uno sfondo o la scena propria di uno stile, la schermata del PIN poggia su una brina densa
  che non lascia passare nulla.
- **Nell’elenco** mostra il suo nome con un lucchetto e **Bloccata con un PIN**, niente dei suoi messaggi, nemmeno
  nella ricerca, in **Messaggi importanti** o in **Chat importate**. La notifica dice solo **New message**, come per
  ogni chat.
- **I PIN sbagliati** vengono contati sul telefono, per tutte le chat insieme e a parte rispetto a quelli della
  schermata di blocco: dopo cinque, il tentativo successivo aspetta, ogni volta di più.
- **PIN dimenticato?** Sotto il PIN, dove lo spazio ha una password, **PIN dimenticato?** lo toglie con la password
  che apre lo spazio. Senza una password, niente può riaprirla: eliminare il contatto è allora l’unico modo.
- **Nelle chat nascoste:** una chat che sposti nelle chat nascoste porta con sé il suo PIN, che lì non chiede nulla,
  perché le protegge il PIN delle chat nascoste stesse. Riportata tra le chat, lo stesso PIN chiede di nuovo.
- **Per toglierlo:** **Dettagli** → di nuovo **Blocca con un PIN**, e scrivi il suo PIN.
- **Lo conosce solo questo telefono,** e ogni dispositivo collegato ha il suo. I backup lo conservano.
- [~] **Anche {+su Matrix, XMPP, Nostr e SMS}{-negli SMS}:** {+una chat su Matrix, XMPP o Nostr ha **Blocca con un PIN** in fondo, e }una
  conversazione SMS {-ha **Blocca con un PIN** }sotto la riga **SMS normale**, e funziona allo stesso modo: nell’elenco il suo nome con un
  lucchetto, nessuno dei suoi messaggi nella ricerca, e la password dello spazio toglie un PIN dimenticato. **Blocca
  gli screenshot** è accanto, solo su questo telefono (Android): gli altri non vengono avvisati. Le chat di un luogo
  nascosto non offrono né l’uno né l’altro, perché le protegge il loro PIN e restano fuori dagli screenshot
  finché **Screenshot** è attivo.

**Perché:** alcune chat dovrebbero restare dove sono, ma non aprirsi per chi ha in mano il telefono per un momento. Il
PIN è conservato solo come suo Argon2id, quindi non si può leggere dal telefono, e i tentativi sono lenti. È un blocco
sullo schermo, non una chiave a sé: i messaggi della chat restano crittografati con il resto dello spazio, e chi copia
quello che il telefono conserva mentre lo spazio è aperto potrebbe comunque leggerli. Per una chat che non deve
nemmeno essere vista, usa le chat nascoste.

## Raccolta {#collection}

La Raccolta è un posto cifrato per le tue foto, i tuoi file e le tue cartelle, in ogni spazio e in ogni luogo nascosto, ciascuno con la sua: quella dello spazio si apre solo nello spazio, quella di un luogo nascosto solo in quel luogo nascosto, e nulla sul telefono dice che un luogo ne ha una. La sua icona, due immagini con un minuscolo lucchetto, è nella schermata iniziale a sinistra del lucchetto e in cima alle chat di un luogo nascosto. È un modulo, su Android, nell’app per computer, nell’app web e su Sailfish OS: **Impostazioni** → **Generali** → **Moduli**.

- **Dentro:** schede in alto: le **Foto** in una griglia per mesi, i **Video**, la **Musica** e gli altri **File** in elenchi, ciascuna con sopra le cartelle che ne contengono (**File** anche quelle vuote). **+** scatta una foto con la fotocamera, che va direttamente qui e mai nella galleria, porta un file dai file del telefono, fino a 4 GB, cifrato mentre viene letto, senza copia prima, o crea una nuova cartella. Tieni premuto per sceglierne più d’uno, per spostarli, inviarli o eliminarli; tieni premuta una cartella per rinominarla o eliminarla, e i suoi file restano.
- **Cifrata:** ogni file è cifrato con una chiave propria, in pezzi con nomi casuali tra i pezzi delle chat, così nulla sul telefono distingue un file della Raccolta da una foto di una chat. Solo il catalogo proprio della Raccolta, sigillato come le chat, dice qual è quale. La Raccolta resta fuori dagli screenshot e si chiude quando lo spazio si blocca.
- **Chiede di nuovo:** dove lo spazio ha una password, la Raccolta la chiede ogni volta che si apre, e di nuovo quando Erevos è rimasto lasciato per più di 30 secondi, prima di mostrare qualcosa; vanno anche impronta o volto dove sbloccano Erevos. Le password sbagliate contano come nella schermata di blocco. La Raccolta di un luogo nascosto non chiede altro, perché le chat nascoste si chiudono appena lasci Erevos.
- **Da una chat o da un’altra app:** tieni premuta una foto o un file in una chat, poi **Salva nella Raccolta**: viene copiato nella Raccolta del luogo di quella chat. Dalla Condivisione di un’altra app, **Invia a** ha per prima la **Raccolta** e chiede in quale cartella; entra così come è arrivato, già cifrato, quindi non resta mai non cifrato sul telefono. Può arrivare a 4 GB; uno più grande di 100 MB può andare solo nella Raccolta, perché una chat accetta al massimo 100 MB.
- **Fuori dalla Raccolta:** una foto si apre a schermo intero, per scorrere e ingrandire, con **Invia a una chat**, **Salva sul telefono**, **Informazioni** ed **Elimina**. Salvare sul telefono o aprire un file con un’altra app lo porta fuori non cifrato, e Erevos lo dice prima. Inviare a una chat lascia la copia della Raccolta dov’è. Dalla Raccolta di un luogo nascosto i file vanno solo alle chat e ai gruppi di quel luogo nascosto, mai a quelli dello spazio, e la Raccolta dello spazio mai a un luogo nascosto. Scorri, o usa le frecce, per la foto successiva o la precedente; **Presentazione** in alto le mostra una dopo l’altra, ogni 4 secondi, fino a un tocco.
- **Da una chat:** **+** sotto il campo del messaggio, poi **Raccolta**, apre la Raccolta del luogo di quella chat: tocca le foto o i file da inviare, poi **Invia**, e vanno in quella chat.
- **Backup:** un backup contiene la Raccolta insieme al resto del telefono. **Impostazioni** → **Dati e dispositivi** → **Raccolta**, o i tre puntini nella Raccolta, possono lasciare quella Raccolta fuori dai backup fatti mentre è aperta: ogni Raccolta ha la sua scelta.
- **Su un server WebDAV:** nelle impostazioni della Raccolta, **Anche su un server WebDAV** copia i file di questa Raccolta così come sono, sempre cifrati, in una cartella su un server che scegli tu, Nextcloud, ownCloud o qualsiasi server che parli WebDAV: indica l’indirizzo della cartella, un nome utente e, meglio, una password per app, poi tocca **Connetti**; **Prova la connessione** li verifica prima. Ogni spazio e ogni luogo nascosto ha la sua scelta e il suo server; per primo viene proposto il server dei backup. Va solo ciò che non c’è ancora, un pezzo alla volta, mentre il luogo è aperto, e dopo un calo della rete riprende da dove si era fermata; un file eliminato qui viene eliminato anche lì. Nient’altro nella cartella viene toccato. Il server vede solo pezzi con nomi casuali, in una sottocartella dal nome casuale, e non può aprirli. Un telefono a cui manca un file, come dopo un backup ripristinato su un telefono nuovo, lo prende da lì quando lo apre, e tiene solo i pezzi che si aprono con la chiave del file. Erevos mostra quanto ne è già arrivato, con **Annulla**: ciò che è arrivato resta, e la volta successiva arriva solo il resto; musica, video, PDF e **Apri con un’altra app** lo recuperano anche loro prima. Finché tutto è copiato, i backup fatti con il luogo aperto possono lasciarne fuori i pezzi, anche dopo un riavvio di Erevos, finché non si aggiunge o elimina un file. Ha un proprio interruttore **Tramite Tor**, disattivato finché non lo attivi: attivo, la copia va solo tramite Tor, qualunque sia l’impostazione Tor dello spazio, quindi il server non vede il tuo indirizzo IP; è più lento e aspetta mentre Tor si avvia. Dove non c’è Tor, nell’app per computer e nell’app web, un server con l’interruttore attivo non riceve nulla.
- **Con Nextcloud, come quello di LPHL:** in quel modulo, e in **Aggiungi un server** dei backup, scrivi l’indirizzo del tuo Nextcloud in **Il tuo Nextcloud** e tocca **Accedi con Nextcloud**: accedi nel browser, come per Fasouli, con Authentik o come vi si accede, e scegli **Concedi accesso**. Erevos riceve una password per app tutta sua e riempie il modulo con la sua cartella nei tuoi file, **Erevos/Collection** o **Erevos/Backups**, creata se manca, accanto a quella di Fasouli, che non legge mai; poi tocca **Connetti**. Quella password si revoca in Nextcloud → Impostazioni → Sicurezza. L’accesso segue l’interruttore **Tramite Tor** del server per cui si fa: attivo, Erevos interroga il tuo Nextcloud solo tramite Tor, ma la pagina nel browser va come sempre.
- **Sui tuoi dispositivi collegati:** nelle impostazioni della Raccolta, **Anche sui miei dispositivi collegati** manda quella Raccolta ai [dispositivi collegati](#devices) del suo spazio o luogo nascosto, e l’interruttore vale per tutti. Un file aggiunto, rinominato, spostato o eliminato su uno lo è su tutti. Le miniature arrivano subito; il file stesso arriva subito sulla stessa Wi-Fi, altrimenti quando lo apri, dal server WebDAV se la Raccolta ne ha uno, o tramite il relay fino a 100 MB. Ogni pezzo viene tenuto solo quando si apre con la chiave del file, e un trasferimento interrotto riprende dal pezzo che mancava. Un file viene eliminato altrove solo quando viene eliminato su uno dei tuoi dispositivi, mai perché lì manca. La Raccolta di un luogo nascosto va solo ai dispositivi collegati di quel luogo.
- **Musica, video e PDF:** un PDF si legge pagina per pagina dentro Erevos (Android 11 e successivi), decifrato solo in memoria. Musica e video si riproducono direttamente dai loro pezzi cifrati, mai da una copia: un video a schermo intero, la musica con le successive della cartella, che continua a schermo spento, con riproduci, pausa, successivo e precedente nella notifica e sulla schermata di blocco del telefono, e lì solo questi. L’elenco continua dopo che lo spazio si è bloccato, a meno che **Ferma la riproduzione quando lo spazio si blocca** sia attivo nelle impostazioni della Raccolta; **Ferma** e il pulsante antipanico lo terminano. La notifica dice solo **In riproduzione**, a meno che **Mostra il titolo nella notifica** sia attivo. **Apri con un’altra app** passa il file mentre viene decifrato, senza copie sul telefono, finché non esci dalla Raccolta; l’altra app può tenerne una sua.
- **Originali nella galleria:** con **Elimina l’originale dalla galleria dopo l’importazione** attivo, una foto o un video scelto dai file del telefono viene eliminato dalla galleria appena è nella Raccolta, dopo che Android ti chiede di confermare. Serve Android 11 o successivo. Una foto della fotocamera non finisce mai nella galleria. Se Android non dice quale foto della galleria sia (come da **Recenti** nel selettore di file), l’originale resta ed Erevos lo dice: sceglila da **Immagini** o dalla memoria del telefono.
- **Foto e video:** in **+**, **Fotocamera** è quella di Erevos: foto e video uno dopo l’altro, con flash e fotocamera frontale, direttamente nella Raccolta, mai nella galleria, e nessun’altra app li vede; una foto non viene mai scritta da nessuna parte, nemmeno per un attimo, e non contiene altro che la sua immagine. Dove il produttore del telefono li offre, come su un Pixel, **Notte** e **Ritratto** stanno accanto a **Foto**, e in alto **HDR attivo**: sono del telefono stesso, fatti sul telefono, e niente esce. Un tocco mette a fuoco e regola la luce lì; due dita fanno lo zoom, e i pulsanti sopra lo scatto passano al grandangolo (**0.5×**), a **1×**, **2×** e **5×** dove il telefono li ha. **Altro** ha un timer di 3 o 10 secondi, una griglia, uno scatto silenzioso dove la legge lo consente, **Più scuro** e **Più chiaro** e, per i video, HD, Full HD o 4K, e **Video HDR attivo** dove il telefono lo riprende; in video la luce può restare accesa. **Dalla galleria** porta dentro molte foto e video insieme; con **Elimina l’originale dalla galleria dopo l’importazione** attivo, Android chiede una sola volta per tutti. Le foto HEIC e AVIF compaiono tra le **Foto** (Android mostra HEIC da 9 e AVIF da 12); una che il dispositivo non può mostrare offre **Apri con un’altra app**. Sotto una foto, **Modifica** la ruota di un quarto alla volta e la ritaglia con una cornice che trascini dagli angoli: viene tenuta come nuova foto, e quella originale resta com’era. **Informazioni** dice se una foto o un video dice dove è stato ripreso. Una foto JPEG, PNG, WebP o GIF salvata fuori o aperta con un’altra app esce senza dove e quando è stata scattata né il telefono, a meno che **Le foto escono con luogo e ora** sia attivo nelle impostazioni della Raccolta; un video o una foto HEIC esce così com’è, ed Erevos avvisa prima se nomina un luogo. La fotocamera, la galleria e **Modifica** sono su Android; nell’app desktop e in un browser si vedono anche le foto AVIF.
- **Nell’app per computer:** su Linux, macOS e Windows la Raccolta funziona anche lì, con i suoi file cifrati nella cartella di Erevos sul computer. **+** porta un file dal computer, cifrato un pezzo alla volta; non c’è la fotocamera. Foto, testi, PDF (nel visualizzatore PDF integrato), musica e video si aprono solo nella memoria di Erevos, mai come copia in chiaro sul disco, fino a 1 GB ciascuno, e musica e video di qualsiasi dimensione, letti un pezzo alla volta dai loro pezzi cifrati mentre suonano; il file si chiude, e la musica o un video si ferma, quando lo spazio si blocca o con il pulsante antipanico. **Salva sul computer** chiede prima, come sul telefono; **Apri con un’altra app** non c’è.
- **In un browser e su Sailfish OS:** l’app web, anche nella schermata iniziale di un iPhone, ed {=Erevos} su Sailfish OS hanno anch’essi la Raccolta. **+** porta un file con il selettore del browser, letto e cifrato un pezzo alla volta, così uno grande non è mai tenuto intero; i suoi pezzi stanno nello spazio di archiviazione del browser, o su Sailfish OS nella cartella di Erevos. Un browser dà a un sito uno spazio limitato: quando finisce, del file non resta nulla, ed Erevos lo dice. Foto, testi, musica e video si aprono solo in memoria, fino a 256 MB ciascuno, e si chiudono quando lo spazio si blocca; un PDF lì non viene mostrato: salvalo per leggerlo con un’altra app. **Salva su questo dispositivo** (su Sailfish OS **Salva sul telefono**) chiede prima; in un browser prende fino a 256 MB, mentre Sailfish OS scrive in Downloads un file di qualsiasi dimensione un pezzo alla volta. In un browser il server WebDAV deve lasciar entrare l’app web, come per i backup; Sailfish OS non ha la copia su WebDAV.
- **Formati:** su Android si riproducono MP3, AAC e M4A, FLAC, Ogg e Opus, WAV, AMR, MP4, MKV, WebM e 3GP, anche un file arrivato senza tipo, riconosciuto dalla fine del suo nome, come spesso arrivano i file da altre app. Nell’app per computer e in un browser, ciò che il browser ne riproduce: né 3GP né AMR.
- **La schermata del lettore:** tocca la barra della musica in riproduzione in basso nella Raccolta, o **Ora in riproduzione** sotto un file di musica, per copertina, titolo, artista e album come li dice il file (altrimenti il suo nome), una barra da toccare o trascinare in un altro punto, precedente, riproduci o pausa e successivo, **Casuale**, **Ripeti** (l’elenco, o il singolo file) e la velocità, da 0.5× a 2×, e l’elenco, con quello in riproduzione segnato: toccane un altro per riprodurlo. Un video, o musica di 10 minuti o più, riparte da dove l’hai lasciato: il punto è conservato nel catalogo della Raccolta, cifrato con esso, da nessun’altra parte del telefono, e solo per questo dispositivo. La notifica e la schermata di blocco mostrano titolo, artista e copertina solo con **Mostra il titolo nella notifica** attivo; altrimenti solo **In riproduzione**.
- **Sottotitoli:** un file .srt o .vtt nella stessa cartella di un video, con il suo nome (film.mkv e film.srt, o film.en.srt), si mostra come i suoi sottotitoli, letto dai suoi pezzi cifrati come il video; **Sottotitoli sì** in alto li toglie, e li rimette.
- **Playlist:** in alto in **Musica**, **Nuova playlist** ne crea una; le canzoni ci entrano dal loro menu (**Aggiungi a una playlist**) o scelte insieme (tienine premuta una, poi **Playlist**). Aprila per riprodurla in ordine o in ordine casuale, spostare una canzone su o giù, o toglierla: resta nella Raccolta. Le playlist sono tenute cifrate con la Raccolta, mai in chiaro.
- **Radio:** la scheda **Radio** contiene stazioni radio via internet, ciascuna dal suo link; **+** lì ne aggiunge una. Solo link https: Erevos non apre http in chiaro, quindi una stazione che ha solo un link http non si può aggiungere. Un link di playlist (.m3u, .pls) viene letto una volta, quando si aggiunge, per il link del flusso stesso; un flusso HLS (.m3u8) suona sul telefono. Una stazione suona come la musica, con la stessa notifica, lo stesso **Ferma la riproduzione quando lo spazio si blocca** e il pulsante antipanico; il titolo che invia si vede nella schermata di riproduzione, e nella notifica solo quando **Mostra il titolo nella notifica** è attivo. Salvo che **Riproduci tramite Tor** sia attivo, più sotto, la stazione, e chi gestisce il suo server, vede l’indirizzo IP del tuo dispositivo mentre suona, come ogni sito, ed Erevos lo dice prima che suoni la prima. Erevos non invia nient’altro a una stazione, e solo «Erevos» come nome. Le stazioni sono tenute cifrate con la Raccolta.
- **Trovare una stazione:** **Aggiungi una stazione** cerca anche in Radio Browser (radio-browser.info), un elenco libero di stazioni a cui chiunque può aggiungere: gli vengono inviate solo le parole che scrivi, quando premi **Cerca**, e vede l’indirizzo IP del tuo dispositivo, come la stazione. Si vedono solo stazioni per cui ha un link https; un tocco ne aggiunge una. Con **Tramite Tor** attivo in **Liste radio e TV**, più sotto, la ricerca passa tramite Tor e Radio Browser non vede il tuo indirizzo IP.
- **Una lista pronta di un paese:** **Aggiungi una stazione** aggiunge anche, con **Aggiungi le stazioni di questo paese**, le stazioni più ascoltate di Radio Browser nel paese che scegli, fino a 100, ognuna con un link https. Radio Browser viene interpellato una volta, quando lo premi, e vede l’indirizzo IP del tuo dispositivo, a meno che **Tramite Tor** sia attivo in **Liste radio e TV**.
- **Una playlist di molte stazioni:** un link di playlist (.m3u, .pls) che nomina molte stazioni le aggiunge tutte, e **Importa un file di playlist** aggiunge le stazioni di un file .m3u o .pls del tuo dispositivo, letto lì e non inviato da nessuna parte. Vengono aggiunte solo stazioni con link https (al massimo 500 da una lista), ed Erevos dice quante ne sono rimaste fuori.
- **Quando un flusso cade:** se il server di una stazione, o un proxy lungo la strada, chiude il flusso, o la rete se ne va per un momento, Erevos richiede la stazione da solo dopo 1, 2, 4… secondi (al massimo 30), finché vuoi ascoltarla, su Android, sul computer e nel browser. Dopo 12 tentativi di fila si ferma e lo dice.
- **TV:** la scheda **TV** tiene canali TV, ognuno con il suo link https, nei gruppi che dà loro la loro lista, con una riga per mostrare un gruppo e una ricerca per nome. Un tocco riproduce un canale a tutto schermo, come un video, con lo stesso **Ferma la riproduzione quando lo spazio si blocca** e il pulsante antipanico; non c’è una guida ai programmi. Si riproduce su Android, nell’app desktop e in un browser; lì un flusso HLS si riproduce con hls.js, e solo se il suo server lascia che l’app web lo legga.
- **Aggiungere canali:** **+** in **TV** aggiunge una lista dal suo link (.m3u), letta una volta quando viene aggiunta, un file di lista del tuo dispositivo (**Importa un file di lista (.m3u)**), letto lì e non inviato da nessuna parte, oppure un canale dal suo link. Vengono aggiunti solo canali con un link https, ogni link una volta, fino a 15.000 in ogni Raccolta, ed Erevos dice quanti sono rimasti fuori. Tieni premuto un canale per rinominarlo, eliminare lui o tutto il suo gruppo, o mandare con **Invia a una chat** il suo nome e il suo link; anche il menu di una stazione radio ha **Invia a una chat**.
- **iptv-org:** **Aggiungi canali** offre iptv-org (github.com/iptv-org/iptv), una lista pubblica di canali gratuiti: **iptv-org per paese**, prima la regione del tuo dispositivo, oppure **iptv-org: tutti i canali**, più di 10.000. Il suo server vede l’indirizzo IP del tuo dispositivo quando la lista viene scaricata, e ogni canale quando va in onda, salvo che **Riproduci tramite Tor** sia attivo. Con **Tramite Tor** attivo in **Liste radio e TV**, più sotto, la lista viene scaricata tramite Tor, quindi il suo server non vede il tuo indirizzo IP; ogni canale lo vede comunque quando va in onda, salvo che sia attivo anche **Riproduci tramite Tor**.
- **Cosa vede un canale:** salvo che **Riproduci tramite Tor** sia attivo, più sotto, il canale, e chi gestisce il suo server, vede l’indirizzo IP del tuo dispositivo mentre va in onda, come qualsiasi sito, ed Erevos lo dice prima che vada in onda il primo. I loghi appaiono solo con **Mostra i loghi dei canali** attivo nelle impostazioni della Raccolta, perché anche il server di ogni logo vede il tuo indirizzo IP; altrimenti un’icona della TV. I canali sono tenuti cifrati con la Raccolta.
- **Liste radio e TV tramite Tor:** nelle impostazioni della Raccolta, la scheda **Liste radio e TV** ha **Tramite Tor**, disattivato finché non lo attivi. Attivo, Erevos chiede solo tramite Tor, qualunque sia l’impostazione Tor dello spazio, la ricerca in Radio Browser, una playlist o una lista TV scaricata dal suo link, la lista di iptv-org e i loghi dei canali, quindi i loro server non vedono l’indirizzo IP del tuo dispositivo. È più lento e aspetta mentre Tor si avvia. La riproduzione delle stazioni e dei canali stessi ha un interruttore suo, subito dopo.
- **Riproduci tramite Tor:** su Android le impostazioni della Raccolta hanno anche **Riproduci tramite Tor**, disattivato finché non lo attivi. Attivo, le stazioni e i canali si riproducono solo tramite Tor, quindi né loro né chi gestisce i loro server vedono l’indirizzo IP del tuo dispositivo; se Tor non si avvia, al suo posto non si riproduce niente in modo diretto. È più lento e aspetta mentre Tor si avvia, e un canale TV può tardare a partire o bloccarsi per un momento. Finché lo spazio invia tutto tramite Tor, si riproducono tramite Tor anche se è disattivato. Disattivato, si riproducono in modo diretto: prima che parta il primo, Erevos dice che il suo server vede il tuo indirizzo IP, con un pulsante **Riproduci tramite Tor** che lo attiva e riproduce tramite Tor, e **Vai avanti**, che riproduce in modo diretto. Solo Android li riproduce tramite Tor: altrove, se è attivo, non si riproducono, ed Erevos dice perché; su un computer nemmeno finché lo spazio invia tutto tramite Tor.

**Perché:** certe foto e certi file, un passaporto, un contratto, un’immagine, non devono stare nella galleria per essere letti da qualunque app né viaggiare in una chat. La Raccolta li tiene con la stessa cifratura delle chat, a parte. Quando un file è salvato sul telefono o aperto con un’altra app, è fuori da Erevos, non cifrato.

## Backup {#backup}

Un backup contiene tutto quello che Erevos conserva su questo telefono: ogni spazio, con i suoi contatti, le chiavi
delle sue conversazioni, i suoi messaggi, foto, file, messaggi vocali, chat importate e chat nascoste, {+i suoi account
Matrix, XMPP e Nostr, }la sua Chat con me stesso, il blocco e la password di panico, e le impostazioni che ti seguono su
un altro telefono. Al suo interno ogni spazio resta sigillato con la sua password, e il backup è sigillato di nuovo con
una sua password. Le sue foto, i file e i messaggi vocali vanno in file a parte accanto a lui, di 4 MB al massimo
ciascuno, il cui nome comincia come il suo; un backup automatico usa anche i file di quelli prima: tieni insieme tutta
la cartella. Si trova in **Impostazioni** → **Dati e dispositivi** →
**Backup**.

1. **Crea un backup:** tocca **Crea un backup**, scegli una cartella (sul telefono, su una scheda di memoria, o in
   un’app cloud che vi mostra le sue cartelle; su un computer, qualsiasi cartella), scrivi due volte una password per
   il backup (almeno 12 caratteri, o quattro parole) e tocca **Salva**. In un browser, il backup e i suoi file vanno al menu di condivisione o nei download: il primo subito, ognuno dei successivi dopo un tocco su **Salva**.
   Mentre si fa, la sua scheda dice cosa fa e a che punto è; quando ha finito, lo dice una notifica.
2. **Backup automatici:** scegli **Ogni 6 ore**, **Ogni giorno** o **Ogni settimana**, poi una cartella e una
   password. Erevos ne fa uno mentre è aperto, appena l’ultimo è più vecchio di così: quando si apre uno spazio, ogni
   15 minuti, e quando passa in secondo piano, prima di bloccarsi; mai senza uno spazio aperto. Ognuno scrive solo le
   foto, i file e i messaggi vocali che sono nuovi rispetto al precedente, e nomina di nuovo i file di quelli prima
   per il resto, così uno ogni 6 ore costa poco. La cartella conserva i 3 più recenti, con ogni file di cui hanno
   bisogno, ed elimina i file di cui nessuno ha bisogno. Uno che è fallito viene ritentato quando si apre uno spazio,
   o un’ora dopo. Sotto ci sono **Fai il
   backup ora**, **Cambia cartella** e **Cambia password**; **Disattivato** li ferma, e quelli fatti restano nella
   cartella.
3. **Anche su un server:** su Android e nell’app per computer, con i backup automatici attivi, **Aggiungi un server**
   sotto **Anche su un server** invia ognuno anche in una cartella su un server che scegli tu e che parla WebDAV, come
   il tuo Nextcloud: dai l’indirizzo della cartella, un nome utente e, meglio, una password per app solo per Erevos,
   poi tocca **Connetti**. Il server tiene i 3 più recenti, con ogni file di cui hanno bisogno, e ognuno invia solo
   ciò che è nuovo; **Smetti di inviare** lo ferma, e quelli che ci sono
   restano. Nella web app, che non fa backup da sé, **Invia un backup ora** ne invia uno lì, con una password che
   scrivi ogni volta.
   Ogni server ha un interruttore **Tramite Tor**, nella sua scheda e nel modulo che ne aggiunge uno, disattivato
   finché non lo attivi (vedi **Su un server** più sotto).
4. **Ripristina:** tocca **Ripristina un backup**, scegli il file e scrivi la sua password. Erevos chiede ancora una
   volta, trova i file del backup accanto a lui, o ti chiede di sceglierli, o la loro cartella (per un backup
   automatico, scegli ogni file della cartella, perché alcuni dei suoi file possono cominciare come il nome di un
   backup precedente), poi mette il backup al
   posto di tutto quello che c’è sul telefono, e si apre com’era quando il backup è stato fatto, con le password di
   allora. Se uno dei suoi file manca, è danneggiato o è di un altro backup, Erevos dice quale, e non cambia niente, a meno che tu non scelga di ripristinare il resto senza di esso: allora le foto, i file e i messaggi vocali del telefono restano come sono, e quelli che contiene non tornano. **Ripristina da un
   server** guarda nella cartella in cui vanno i backup automatici, o in una che indichi con nome utente e password, e
   mostra i backup che ci sono, i più recenti per primi: scegline uno, scrivi la sua password, e viene ripristinato
   allo stesso modo, con i suoi file da lì.

- **Conserva la password del backup:** niente apre un backup senza di essa, e nessuno può recuperarla. Senza un blocco
  con password, la password del backup è tutto ciò che lo protegge. Chi ha il file può provarci sopra password alla
  velocità del suo computer, senza un telefono che lo rallenti, quindi una password corta non regge: Erevos non ne
  accetta sotto i 12 caratteri.
- **I backup automatici conservano la loro password sul telefono,** così non serve una password ogni volta. Chi apre la
  loro cartella ha comunque bisogno delle password degli spazi per leggere le chat.
- **Cosa occupa spazio:** su Android, **Misura** in **Cosa occupa spazio** mostra quanto spazio occupa Erevos sul telefono, per tipo: {~la Raccolta con |}le foto e i file delle chat, i messaggi vocali, la cronologia delle chat, Tor e i resti di scritture non concluse. Ogni backup automatico contiene tutto questo, così si vede perché è grande. Si guardano solo i nomi e le dimensioni dei file, sul telefono, e non si invia nulla.
- **Avanzi:** foto e file che nessuna chat{~, Raccolta|} o importazione nomina più, come quelli di un'importazione interrotta a metà, restano sul telefono e in ogni backup. In **Avanzi**, scrivi uno alla volta, o più insieme separati da virgole o spazi, il PIN di ciascuna delle tue chat nascoste e la password di ogni altro spazio, poi tocca **Cerca avanzi**: Erevos legge quali file nomina ciascuno di essi e questo spazio, e mostra quanto non ne nomina nessuno. **Eliminali** li elimina, dopo un'altra conferma. Un luogo che non hai aperto lì perde le sue foto e i suoi file: aprili tutti prima. Un file scritto nell'ultimo giorno non viene mai preso, e i backup già fatti conservano tutto.
- **Controlla i backup:** dopo ogni backup automatico Erevos lo rilegge dalla cartella: si apre con la sua password, ogni parte che nomina c’è, della sua dimensione, e due parti scelte a caso vengono lette per intero. Di un server guarda allora solo l’elenco, quindi non si scarica nulla. **Controlla ora** scarica anche il backup più recente del server e dieci sue parti. Una parte mancante o danneggiata appare in rosso: fai un backup ora, poi controlla di nuovo. **Controllo completo della cartella** legge per intero ogni parte lì e la confronta con lo SHA-256 che il backup ha annotato per essa: qualche minuto con molti GB, e nulla lascia il telefono.
- **Su un server:** il backup che va lì è sigillato con la sua password come gli altri, e quella password non lascia
  mai il telefono, quindi il server non può aprirlo. Il suo nome è casuale e il file sembra fatto di byte casuali, di
  una tra poche dimensioni, quindi né l’uno né l’altro dice che è di Erevos né quanto contiene esattamente. Le sue
  foto, i file e i messaggi vocali vanno come caricamenti a parte, tutti della stessa dimensione, ognuno anche con un
  nome casuale e sigillato con la password del backup, legato a quel backup e al suo posto in esso, così nessuno può
  essere scambiato, tolto o preso da un altro backup senza che si veda; il server tiene ognuno finché ne ha bisogno
  uno dei backup che conserva, e poi lo elimina. I loro nomi sono lunghi quanto quello del backup, ma la loro dimensione li distingue da esso, quindi il server può contarli, e sapere così più o meno quanto contiene il backup. Quello che un backup interrotto ha lasciato lì viene eliminato prima che parta il successivo, così un server rimasto senza spazio ne ha di nuovo. Il server vede comunque il tuo account, quando ne arriva uno e più o meno quanto è grande. Su Android, i backup ci vanno come
  dice la scelta dello spazio in **Impostazioni** → **Relay e reti** → **Tor**{+, come Matrix}: con **Tutto** solo
  tramite Tor, così il server non vede l’indirizzo del telefono; con **Messaggi** tramite Tor appena Tor è pronto, e
  direttamente mentre Tor parte o quando fallisce; con **Niente** direttamente, e il server vede l’indirizzo del
  telefono. Un backup aspetta prima fino a due minuti che Tor parta, e **Anche su un server** dice da dove passa ora.
  Nell’app per computer li invia l’app stessa, non la sua pagina, perché una pagina non può raggiungere un server
  così; nella web app li invia il browser, che raggiunge solo un server impostato per far entrare la web app (CORS),
  cosa che Nextcloud di suo non fa. Nessuna delle due ha Tor per questo: finché uno spazio invia **Tutto** tramite
  Tor, da lì non ne parte nessuno. Nella web app la password del server è conservata nel browser, sigillata con una
  chiave che il browser non dà fuori. **Ripristina da un server** scarica quello che scegli allo stesso modo, tramite
  Tor come dice lo spazio, e lì non scrive nulla; una password scritta per questo serve solo a quel ripristino e non
  viene conservata. Tramite Tor nessun file di un backup di più di 64 MB arriva, e direttamente nessuno di più di 100 MB, il
  massimo che Erevos accetta in un download: allora scarica il backup e i suoi file dal server e tocca **Ripristina
  un backup**. Un Erevos precedente a questa versione non apre un backup così. Google Drive è escluso apposta: Google
  lega il file al tuo nome, ed Erevos avrebbe bisogno delle app di Google e di un accesso a Google sul telefono.
  L’interruttore **Tramite Tor** di ogni server, disattivato finché non lo attivi, ha la precedenza sulla scelta dello
  spazio per quel server: attivo, i suoi backup vanno solo tramite Tor, qualunque sia l’impostazione Tor dello spazio,
  e aspettano che Tor si avvii, quindi il server non vede l’indirizzo del telefono. **Ripristina da un server** e il
  modulo che aggiunge un server hanno lo stesso interruttore, e l’accesso con Nextcloud segue l’interruttore del
  server per cui si fa: la pagina nel browser va come sempre. L’app per computer e l’app web non hanno Tor: un server
  con l’interruttore attivo non riceve nulla da lì. I pezzi del backup che dai agli amici ([Pezzi del backup presso
  amici](#backup-pieces)) non portano l’interruttore.
- **Le chat proseguite dopo il backup:** il ripristino rimette le chiavi di ogni conversazione com’erano allora. I
  messaggi arrivati dopo il backup e già letti non ci sono. Una conversazione proseguita dopo il backup smetterebbe di
  aprire i nuovi messaggi, quindi ogni chat ripristinata, quella dello spazio e quella di ogni posto nascosto quando
  si apre, avvia da sola e in silenzio una nuova conversazione con ogni contatto, dalle chiavi più recenti che le ha
  dato, e il suo {=Erevos} prosegue in essa. Con un contatto il cui {=Erevos} è più vecchio, chiedigli di nuovo il suo link
  di contatto. Prima che una chat ripristinata scriva di nuovo,
  le sue conversazioni saltano oltre le chiavi che potrebbero aver usato dopo il backup, così nessuna chiave sigilla
  mai due messaggi: una usata due volte permetterebbe a chi ha conservato entrambi i pacchetti di leggerli insieme. In
  un gruppo, un membro ripristinato chiede all’Erevos dell’amministratore di rimetterlo dentro, cosa che funziona
  finché il gruppo è andato avanti solo di poco; altrimenti chiedi di essere aggiunto di nuovo.
- [+] **Matrix, XMPP e Nostr:** gli account di ogni spazio e delle sue chat nascoste sono nel backup. Una chiave **Nostr**
  torna con le sue chat, com’erano. Un account **XMPP** torna con il suo accesso, i contatti, le chat e le chiavi che
  conosce degli altri, e prosegue come nuovo dispositivo dell’account: tiene la sua chiave d’identità, così le app dei
  tuoi contatti ne riconoscono ancora la chiave, ma prende un nuovo ID dispositivo, una nuova risorsa e nuove chiavi,
  ogni conversazione ricomincia, e il vecchio dispositivo esce dagli elenchi dei dispositivi dell’account appena si
  connette. Non può leggere i messaggi cifrati per il vecchio dispositivo dopo il backup. Un account **Matrix** viene
  lasciato andare su questo telefono, senza essere disconnesso sul server, cosa che farebbe finire il dispositivo sul
  telefono da cui viene il backup; lo spazio accede di nuovo, come nuovo dispositivo, e la sua chiave di sicurezza apre
  i messaggi di prima. Rimesse com’erano, le conversazioni di un dispositivo così riuserebbero chiavi di messaggio che
  gli altri rifiutano, e il telefono da cui viene il backup potrebbe usare ancora il dispositivo.
- **Chat chiuse:** un backup tiene anche ciò che serve a **Fai squillare le chiamate quando sono chiuse** e **Avvisa
  quando arriva un messaggio** delle chat nascoste, e ad **Anche mentre è aperto un altro spazio**. Così, dopo un
  ripristino, anche su un altro telefono, continuano come prima. Un backup di prima di questa versione non ne ha
  nulla: ripristinarlo li lascia come li ha il telefono.
- **Impostazioni:** un backup tiene le impostazioni che sono tue e non del telefono: la lingua,{~ i moduli,} la
  vibrazione, le notifiche in background e il numero sull’icona, il risparmio batteria, la privacy dello schermo, la
  qualità delle foto, se il Telefono si apre senza la password, e come Erevos raggiunge i telefoni vicini (portando i
  loro messaggi, sullo stesso Wi-Fi, con Wi-Fi Direct, Wi-Fi Aware e una radio LoRa, che si riaccende solo dove questo
  telefono la conosce). Su Android tiene anche le risposte rapide del Telefono e le chiamate che rifiuta, quelle di un
  gruppo di contatti solo dove questo telefono ha un gruppo con quel nome nello stesso account. I backup automatici e il
  loro server tornano con la loro password, ma non con la loro cartella, in cui Android lascia scrivere solo il
  telefono su cui è stata scelta: su un altro telefono, **Backup** dice di sceglierne una, e fino ad allora vanno solo
  al server.
- **Un telefono alla volta:** un backup ripristinato su un secondo telefono legge le stesse code sul relay del primo, e
  ognuno prende messaggi che l’altro poi non riceve mai. Usalo per passare a un nuovo telefono, non per tenerne due.
- **Il vecchio telefono è perso:** un telefono perso o rubato che è ancora acceso continua a leggere le code sul relay
  che conosceva, quindi i messaggi mandati lì possono arrivare a lui e mai al telefono nuovo. Dopo aver ripristinato
  il backup sul telefono nuovo, tocca **Il vecchio telefono è perso** sotto **Backup** (dopo il ripristino di un
  backup di un altro telefono, Erevos lo indica) e dì **Cambia le code**. Ogni spazio e le sue chat nascoste passano
  allora a nuove code sul relay, ognuno la prossima volta che si apre qui, e i tuoi contatti e gruppi vengono avvisati
  in silenzio. Le vecchie code vengono lette qui finché ogni contatto non scrive in quelle nuove, 14 giorni al
  massimo, e i link di contatto e i codici QR che hai dato prima valgono 14 giorni, poi più. Quello che passa da
  Nostr{+, XMPP o Matrix} arriva ancora al vecchio telefono. Dopo un altro ripristino, toccalo di nuovo.
- **Discrezione:** ogni spazio mostra la stessa schermata Backup, e un backup contiene ogni spazio, quindi né l’una né
  l’altro dicono quanti spazi ci sono o se ci sono chat nascoste impostate. I nomi dei file dicono che sono un backup di
  Erevos, e il loro numero e la loro dimensione mostrano più o meno quanto viene conservato.
- [~] **Gli SMS del telefono:** su Android, **Includi gli SMS nei backup** aggiunge da quel momento a ogni backup gli SMS e
  gli MMS del telefono, con al massimo 32 MB delle loro immagini, mentre Erevos è l’app per gli SMS. Sono sigillati con
  la password del backup come il resto. Il ripristino del backup rimette negli SMS del telefono ogni messaggio che non
  ha ancora, e non ne elimina nessuno; anche allora Erevos deve essere l’app per gli SMS, altrimenti il resto viene
  ripristinato senza di loro. Gli SMS sono del telefono, gli stessi in ogni spazio. Un Erevos più vecchio non apre un
  backup che contiene SMS.
- [~] **Le chiamate del telefono:** su Android, **Includi le chiamate nei backup**, sotto **Le chiamate del telefono**,
  aggiunge da quel momento a ogni backup la cronologia delle chiamate del telefono (le sue 10.000 chiamate più
  recenti, senza la segreteria) e la lista di numeri bloccati di Android stessa, mentre Android lascia a Erevos
  leggere la cronologia delle chiamate; i numeri bloccati solo mentre Erevos è l’app Telefono o SMS. È disattivato
  finché non lo attivi, e la scelta va nei backup. Sono sigillati con la password del backup come il resto. Il
  ripristino del backup aggiunge al telefono ogni chiamata e ogni numero bloccato che non ha ancora, e non ne elimina
  nessuno; anche allora Erevos deve essere l’app Telefono (**Impostazioni** → **Telefono e SMS** → **Telefono**),
  altrimenti il resto viene ripristinato senza di loro. Android tiene più o meno le 500 chiamate più recenti di ogni
  SIM, quindi quelle più vecchie ripristinate possono sparire man mano che arrivano nuove chiamate. Un Erevos più
  vecchio non apre un backup che contiene chiamate.
- [~] **Gli SMS in ordine:** i messaggi fissati, le conversazioni archiviate, il Cestino, le bozze, il filtro antispam e i
  segni di ogni spazio, quanto aspetta un SMS per poter essere annullato, gli SMS da inviare più tardi (**SMS più
  tardi**), gli inviti, i nomi dai tuoi contatti, se i messaggi ai contatti Erevos possono andare via SMS, e la SIM
  scelta per ogni numero sono in ogni backup, sigillati con la password dello spazio come il resto. La SIM scelta torna solo sullo stesso telefono, perché ogni telefono dà alle sue SIM identificativi propri: su un altro, gli SMS e le chiamate passano dalla sua SIM predefinita finché non ne scegli una lì. Un SMS per più
  tardi la cui ora è arrivata prima del ripristino non parte da solo, perché il telefono da cui viene il backup potrebbe
  averlo già inviato: appare come non inviato, e un tocco lo invia o lo elimina. Uno la cui ora deve ancora venire
  parte alla sua ora. Un Erevos più vecchio non apre un backup che li contiene; uno fatto da un {=Erevos} più vecchio si
  ripristina come sempre, senza di loro.
- **Quello che non torna mai:** quello che appartiene al telefono stesso non arriva con nessun backup, quindi un
  ripristino su un altro telefono non può portarlo: l’impronta o il volto, la cui chiave Android tiene nel chip di quel
  telefono; le cartelle in cui Erevos può scrivere, come quella dei backup automatici, in cui Android lo lascia entrare
  solo sul telefono su cui sono state scelte; quello che Android consente a Erevos{~ e quali app fanno le chiamate e
  mandano gli SMS}, che solo tu puoi consentire su ogni telefono, per questo dopo un ripristino su Android si apre
  **Autorizzazioni**{~ per i moduli attivi}; {~la cronologia delle chiamate e la lista di numeri bloccati di Android
  stesso, a meno che **Includi le chiamate nei backup** fosse attivo, come sopra; |}e il conteggio delle password sbagliate. {+Un account XMPP torna come un nuovo
  dispositivo di sé stesso e Matrix accede di nuovo, come sopra, e i}{-I} dispositivi collegati si collegano di nuovo, come
  sotto.
- **Dispositivi collegati:** un collegamento resta con il telefono e il computer su cui è stato fatto, e nessun backup
  lo tiene, ma un backup tiene ciò che permette al telefono su cui viene ripristinato di chiedere a ognuno di loro di
  collegarsi di nuovo. Dopo aver ripristinato un backup su un altro telefono, apri lì **Impostazioni** → **Dati e
  dispositivi** → **Dispositivi collegati**: sotto **Dal backup**, tocca **Chiedi di collegarsi di nuovo** per ogni
  dispositivo che è ancora tuo, o **Dimentica** per uno che non lo è. Il dispositivo, che deve essere acceso, mostra
  la richiesta: tocca lì **Collega di nuovo** solo se hai ripristinato tu il backup, altrimenti **Non ora**. Si
  collega allora al telefono nuovo senza codice da scansionare, tiene le sue chat e riceve ciò che è arrivato da
  allora; i messaggi arrivati al vecchio telefono dopo il backup restano solo su di esso. Una volta collegato di
  nuovo, né il vecchio telefono né chiunque abbia lo stesso backup lo raggiunge. Una richiesta vale 14 giorni, e i
  dispositivi di un posto nascosto si chiedono da dentro quel posto. Un dispositivo con un {=Erevos} più vecchio non
  mostra nessuna richiesta: tocca su di esso **Scollega questo dispositivo**, poi collegalo come la prima volta, vedi
  [Dispositivi collegati](#devices). I contatti con questa versione smettono di scrivere ai tuoi computer finché non
  si collegano di nuovo: il telefono dà loro un
  nuovo elenco dei suoi dispositivi che non ne nomina nessuno. Se l’orologio di questo telefono è indietro rispetto a
  quello perso, quell’elenco parte appena gli scrivono, e i dettagli della loro chat potrebbero dire che è cambiato il
  giorno dopo il ripristino. Il backup di un computer collegato contiene le chat del telefono com’erano, ma
  non il collegamento per scriverci: ripristinate, si possono leggere lì ma non ci si può scrivere, ed Erevos lo dice
  una volta. Per scriverci, collega di nuovo quel computer al telefono: le chat che il telefono ha ancora restano, con
  quello che è arrivato nel frattempo, e le altre se ne vanno. Sul telefono, scollega il dispositivo che era prima. Fai
  i backup sul telefono.
- **Versioni:** un backup si apre solo in un Erevos recente quanto quello che l’ha fatto, o più. Uno fatto da un {=Erevos}
  più recente viene rifiutato, senza cambiare nulla: aggiorna prima Erevos all’ultima versione. Un Erevos precedente
  alla 6.0.0 dice di un backup dalla 6.0.0 in poi che non è un backup di Erevos: aggiorna anche quello.

## Pezzi del backup presso amici {#backup-pieces}

La password dei tuoi backup può andare agli amici in pezzi, in **Impostazioni** → **Dati e dispositivi** → **Pezzi
del backup**: scegli **2 su 3**, **2 su 4**, **3 su 4** o **3 su 5**, poi altrettanti contatti, e tocca **Dai i
pezzi**. Con i backup automatici attivi, Erevos verifica che la password che scrivi sia la loro. Con un server in
**Anche su un server**, i pezzi possono contenere anche indirizzo, nome utente e password del server, così con essi si
possono trovare e aprire i backup che sono lì. Ogni contatto riceve un messaggio che dice di cosa si tratta, e il suo
{=Erevos} conserva il pezzo a parte dalla chat, in **Pezzi che tieni per gli amici**.

1. **Per riaverla:** chiedi i loro pezzi a un numero sufficiente di amici. Ognuno tocca **Mostra il codice** accanto
   al tuo, e tu tocchi **Scansiona un codice** in **Rimetti insieme i tuoi pezzi**; oppure toccano **Copia** e ti
   mandano il testo in un altro modo, e tu lo incolli e tocchi **Aggiungi**; oppure, finché il tuo telefono ha ancora
   l’account, toccano **Restituiscilo nella vostra chat**. Poi tocca **Rimetti insieme**: Erevos mostra la password e,
   con un server nei pezzi, **Ripristina da quel server** elenca i backup che sono lì.
2. **Una nuova password:** appena i tuoi backup hanno una nuova password, i pezzi dati prima non servono più: danne
   di nuovi.

- **Cosa mostra un pezzo:** nulla. Meno pezzi di quelli necessari non dicono nulla della password, per quanta
  potenza di calcolo ci si metta: con essi, ogni password è probabile quanto un’altra. Ogni pezzo ha la stessa
  dimensione, qualunque sia la password, e niente al suo interno nomina te o gli altri amici.
- **Sul tuo telefono:** il messaggio resta nella chat, ma il suo pezzo no: una volta partito, niente sul tuo telefono
  conserva i pezzi, solo a chi sono andati. Chi apre uno dei tuoi spazi scopre a chi hai dato i pezzi, non la
  password. I pezzi vanno solo ai contatti dello spazio, non alle chat nascoste.
- **Cosa non può impedire:** abbastanza amici insieme possono aprire i tuoi backup se ottengono anche il file:
  scegli persone che non si conoscano tutte tra loro. Qualcuno può fingersi te, da un numero o un account nuovo, per
  avere i pezzi: un amico dovrebbe restituirne uno solo a te di persona, o nella chat che ha già con te. Un amico con
  un {=Erevos} più vecchio di questa versione vede il messaggio ma non conserva alcun pezzo.

**Perché:** un backup è sicuro quanto la sua password, e una password forte si perde facilmente. Divisa così (la
condivisione di segreti di Shamir), nessun amico da solo, e nessun relay, tiene qualcosa che la apra.

## Passare a un nuovo telefono {#new-phone}

Tutto ciò che Erevos conserva passa a un nuovo telefono in un solo backup: ogni spazio con le sue chat nascoste, i
contatti, i messaggi, le foto{~, i file e la Raccolta| e i file}, i suoi account e relay, il blocco, la password di panico e le tue
impostazioni. Nessun server ne tiene una copia per te, quindi niente arriva da solo: lo porta il backup, sigillato con
la sua password.

1. **Sul telefono nuovo, installa {=Erevos}:** la stessa versione del telefono vecchio, o una più recente, perché un
   {=Erevos} più vecchio rifiuta un backup fatto da uno più nuovo. Senza internet, il telefono vecchio può dartelo, vedi
   [Erevos a un telefono vicino](#give-app).
2. [~] **Sul telefono vecchio, preparalo:** perché passino anche gli SMS del telefono, attiva **Includi gli SMS nei
   backup** sotto **Backup**, e per la sua cronologia delle chiamate **Includi le chiamate nei backup**. Una Raccolta lasciata fuori dai backup resta indietro: rimettila dentro, o dalle un
   server WebDAV, vedi [Raccolta](#collection).{+ Tieni a portata di mano la tua Chiave di sicurezza di Matrix, perché
   Matrix accede di nuovo sul telefono nuovo.}
3. **Sul telefono vecchio, fai il backup:** sotto **Impostazioni** → **Dati e dispositivi** → **Backup**, tocca **Crea
   un backup**, o **Fai il backup ora** con i backup automatici. Fallo per ultimo, subito prima del passaggio, e da
   quel momento non aprire più Erevos sul telefono vecchio: ciò che arriva dopo aspetta sul relay per quello nuovo.
4. **Portalo di là:** copia il backup e ogni file il cui nome comincia come il suo, tutti in una cartella, sul telefono
   nuovo, con un cavo, una scheda di memoria o un’app cloud. Un backup sul tuo server non va copiato.
5. **Sul telefono nuovo, ripristina:** al primo avvio tocca **Ho già {=Erevos} su un altro telefono** (oppure fai il primo
   avvio).{~ Su Android, per gli SMS, fai che Erevos sia anche lì l’app SMS.} Poi sotto **Impostazioni** → **Dati e
   dispositivi** → **Backup** tocca **Ripristina un backup** e scegli il file, oppure **Ripristina da un server** e dai
   l’indirizzo, il nome utente e la password del server; scrivi la password del backup e di’ di sì. Erevos si apre
   com’era il telefono vecchio, con le stesse password.
6. **Sul telefono nuovo, reimposta ciò che è del telefono:** **Autorizzazioni** si apre per ciò che Android deve
   consentire. Poi attiva di nuovo l’impronta o il volto (vedi [Blocco con password](#lock)), scegli di nuovo la
   cartella dei backup automatici sotto **Backup**, e la SIM per ogni numero{+, e accedi a Matrix con la sua Chiave di
   sicurezza}.
7. **Sul telefono vecchio, cancella Erevos:** quando il telefono nuovo mostra le tue chat e i nuovi messaggi arrivano
   lì, tocca **Cancella tutto ora** sotto **Impostazioni** → **Privacy e sicurezza** → **Pulsante di panico**. Non
   **Cancellami da ovunque**: cancella le code del relay che legge il telefono nuovo.

- **Un telefono alla volta:** i due telefoni leggono le stesse code del relay, e un messaggio va a quello che lo
  prende per primo, così l’altro non lo riceve mai. Tieni chiuso quello vecchio dal backup in poi, e cancellalo alla
  fine.
- **I tuoi contatti:** ogni spazio conserva il suo relay, il suo token e il suo relay di casa, quindi non c’è niente da
  scrivere di nuovo né inviti da chiedere. I tuoi contatti ti scrivono come prima.
- **Chat nascoste:** ogni posto nascosto arriva con il backup, ciascuno con il suo PIN, e niente sul telefono nuovo dice
  che ce ne sono, vedi [Chat nascoste](#hidden).
- [+] **Matrix, XMPP e Nostr:** una chiave Nostr continua com’era, un account XMPP come un nuovo dispositivo di sé stesso, e
  Matrix accede di nuovo come nuovo dispositivo, con la sua Chiave di sicurezza che apre i messaggi di prima, vedi
  [Backup](#backup).
- **Dispositivi collegati:** sul telefono nuovo, sotto **Impostazioni** → **Dati e dispositivi** → **Dispositivi
  collegati**, tocca **Chiedi di collegarsi di nuovo** per ogni computer o browser che è ancora tuo, poi **Collega di
  nuovo** su di esso: tiene le sue chat, senza codice da scansionare. I dispositivi di un posto nascosto, da dentro
  quel posto. Un dispositivo con un {=Erevos} più vecchio: tocca su di esso **Scollega questo dispositivo**, poi
  collegalo al telefono nuovo come la prima volta. Vedi [Backup](#backup).
- [~] **La Raccolta:** arriva nei file del backup. Una lasciata fuori dai backup arriva solo dal suo server WebDAV, ogni
  file quando lo apri; una senza né l’uno né l’altro resta sul telefono vecchio, e la cancellazione la elimina.
- **{~Moduli e impostazioni:** i moduli attivi, la|Impostazioni:** la} lingua e le altre impostazioni arrivano con il backup. Ciò che
  Android tiene per ogni telefono resta lì, come ciò che permette a Erevos{~; la cronologia delle chiamate e i suoi
  numeri bloccati arrivano anch’essi con **Includi le chiamate nei backup** attivo}.
- **Un file mancante:** se un file del backup manca o è danneggiato, Erevos dice quale e non cambia niente, a meno che
  tu non scelga di ripristinare il resto senza di esso.
- **Se il telefono vecchio è perso:** ripristina il tuo backup più recente sul telefono nuovo appena puoi, anche dal
  tuo server, poi tocca **Il vecchio telefono è perso** sotto **Backup**, così non legge più niente di tuo sui relay.
  Se hai perso la password del backup, gli amici che ne hanno i pezzi possono restituirtela, vedi
  [Pezzi del backup presso amici](#backup-pieces).

**Perché:** Erevos non tiene niente di tuo su un server che potrebbe restituirlo, quindi nessun account porta le tue
chat su un nuovo telefono. Un solo backup, sigillato con la sua password, porta tutto, e solo tu puoi aprirlo.

## Pulsante di panico {#panic}

Quando sei in pericolo, Erevos può cancellarsi all’istante, in **Impostazioni** → **Privacy e sicurezza** → **Pulsante
di panico**: tocca **Cancella tutto ora** e conferma con **Cancella**. Su Android, nell’app web, su un computer e su
Sailfish OS.

Per trovarlo in fretta in un’emergenza, è anche il primo, in rosso, nel menu **⋯** della schermata principale, e tenere
premuto il lucchetto in alto nella schermata principale lo apre subito. Un tocco sul lucchetto blocca ancora; solo
tenerlo premuto apre il pulsante di panico, e lì **Cancella tutto ora** chiede ancora una conferma.

- **Cosa va via:** ogni spazio con le sue chat nascoste, con i loro contatti, messaggi, foto, file e chiavi; il blocco
  e le sue password; {+gli account Matrix, XMPP e Nostr e }i token del relay; le impostazioni e la password dei backup
  automatici, e del loro server. Su Android, Erevos poi si chiude e la volta dopo si apre come appena installato. Con
  **Anche i backup automatici in** scelto, prima vanno via i file di backup lì.
- **Cosa resta:** ciò che Erevos non può raggiungere: i backup copiati altrove o inviati a un server (la loro password
  li protegge ancora), ciò che il relay tiene per te finché scade, e ciò che hanno i tuoi contatti.

1. **Da un’app di panico:** su Android, un’app di panico come Ripple cancella le app che scegli con un solo gesto.
   Installane una e scegli Erevos al suo interno: Erevos apre questa schermata, dopo la sua password, e chiede. Tocca
   **Di’ di sì**.
2. **Solo quell’app:** solo l’app a cui hai detto di sì può cancellare Erevos, e solo finché **Un’app di panico può
   cancellare Erevos** è attivo. Erevos controlla il nome dell’app e la sua firma: un’altra app, o lo stesso nome
   reinstallato da qualcun altro, non può. Un aggiornamento dell’app che passa a una nuova chiave nel modo che Android
   permette (rotazione della chiave) resta fidato. **Non fidarti più** lo termina.
4. **Quando Erevos ha rifiutato:** se l’app fidata ha chiesto di cancellare con l’interruttore spento, o firmata con
   un’altra chiave, questa schermata lo dice in rosso, con il giorno e l’ora. Quando l’app è firmata con un’altra
   chiave, **Fidati di … così com'è ora** la rende di nuovo fidata: di’ di sì solo se l’hai aggiornata tu.
3. **Dopo la cancellazione:** anche l’app di panico viene dimenticata: dille di nuovo di sì quando riconfiguri Erevos.

- **Su un computer e su Sailfish OS:** non c’è un’app di panico, solo **Cancella tutto ora**, con **Anche i backup
  automatici in** la loro cartella se lo scegli. Su un computer Erevos poi riparte come appena installato; su Sailfish
  OS si chiude. La voce del portachiavi per Erevos resta su un computer, ma ciò che sigillava non c’è più, quindi non
  apre niente.
- **Cosa non può nascondere:** sul telefono, senza la password, si vede ancora che Erevos è installato e che un’app di
  panico può cancellarlo, ma non cosa conteneva.
- **Avvisare altre app (Android):** in **Avvisa altre app** scegli le app che Erevos avvisa quando cancella, come
  un’app di panico, dal pulsante, dalla password di panico o da un’app di panico. Ognuna ti chiede prima se Erevos può.
  Fasouli allora si blocca: si chiude, e chiede di nuovo il suo blocco quando si apre.

**Perché:** a una frontiera o in un arresto può non esserci il tempo di aprire ogni chat. Un tocco, o il gesto di
un’app di panico, non lascia niente da aprire.

### Password di panico

Con il blocco con password attivo, la stessa schermata offre una **Password di panico**: una password tutta sua che,
scritta sulla schermata di blocco, cancella Erevos come fa **Cancella tutto ora**. Su Android, nella web app, su un
computer e su Sailfish OS.

1. Tocca **Imposta la password di panico**, scrivila due volte (almeno 4 caratteri) e tocca **Salva**. Deve essere
   diversa da ogni password dei tuoi spazi: Erevos ne rifiuta una che apre uno spazio, e la password di nessuno spazio
   potrà diventarlo più tardi.
2. Scritta sulla schermata di blocco, mostra **Password errata**, come qualsiasi password errata, ed Erevos cancella
   tutto subito. Su Android Erevos poi si chiude e la volta dopo si apre come appena installato, e vanno via anche i
   backup automatici nella loro cartella quando è attivo **Anche i backup automatici in** sotto **Da un’app di
   panico**; altrove restano.
3. **Disattiva la password di panico** la rende di nuovo solo una password errata. Impostarla di nuovo sostituisce
   quella di prima. Disattivare il blocco con password la disattiva anche.

- **Niente la mostra:** Erevos tiene un posto per una password di panico fin dal suo primo avvio, casuale finché non
  ne viene impostata una e della stessa forma dopo, e lo controlla con ogni password scritta sulla schermata di
  blocco, allo stesso modo e per lo stesso tempo. Così né ciò che il telefono conserva né il tempo di un controllo
  mostrano se ce n’è una impostata, e nemmeno questa schermata può dirtelo: se non sei sicuro, impostala di nuovo.
- **Solo sulla schermata di blocco:** scritta in qualsiasi altro posto dove Erevos chiede una password, è solo una
  password errata. I backup la conservano com’era quando sono stati fatti. Finché i tentativi sbagliati
  fanno aspettare la schermata di blocco (vedi [Blocco con password](#lock)), aspetta anche lei.

**Perché:** qualcuno può costringerti ad aprire Erevos. Con una password di panico puoi sembrare dargli la tua, e ciò
che vedrebbe è sparito prima che la schermata cambi.

## Cancellami da ovunque {#forget}

Quando vuoi che sparisca ciò che i server conservano di te, in **Impostazioni** → **Privacy e sicurezza** → **Cancellami da
ovunque**: tocca **Cancellami da ovunque** e di' sì due volte. Il tuo telefono conserva tutto ciò che ha; questo non è il
[Pulsante di panico](#panic), che cancella il telefono.

- **Cosa sparisce:** ogni coda che questo spazio ha sui relay, con i messaggi che vi aspettano: la tua, quella che nomina il tuo
  link di contatto, quelle dei tuoi gruppi, dei tuoi contatti, del tuo relay di casa, {+quelle per le notifiche di Matrix e XMPP, }le
  porte dei tuoi gruppi pubblici e quelle dei tuoi dispositivi collegati. Anche i messaggi che un relay tiene per inviarli dopo, i
  file arrivati che vi aspettano, e gli inviti che hai fatto e nessuno ha usato. Le chat nascoste che ricevono anche da chiuse se
  ne vanno con lo spazio; le altre quando le apri mentre lo spazio è fermo. Le liste della schermata lasciano fuori le chat
  nascoste, così non mostrano mai che ce ne sono. Erevos chiede anche a ogni relay Nostr di dimenticare le chiavi su cui
  leggono le tue chat (una richiesta di sparire, NIP-62): via Tor quando Tor è attivo, direttamente quando è spento. Con
  Tor attivo ma non ancora pronto, Nostr non viene interpellato; aspetta che lo sia e cancella ancora.
- [+] **Matrix, XMPP, Nostr:** con **Esci anche da Matrix e XMPP e cancella l'account Nostr creato qui**, quegli account escono da
  qui. Gli account restano sui loro server, che sono loro, non di Erevos. Un account Nostr portato da un'altra app resta com'è.
- **Lo spazio si ferma:** non riceve né invia nulla, così nessuna coda viene rifatta subito (Erevos rifà da solo una coda
  persa). **Riavvia** lo termina: vengono create code nuove, come quando un relay le ha perse, e i tuoi contatti vengono avvisati
  in silenzio. Dai loro anche un nuovo link di contatto, perché i vecchi nominano code che non esistono più.
- **Cosa non raggiunge:** i telefoni dei tuoi contatti, i relay Nostr che non fanno ciò che si chiede,{- e} i file inviati tramite un
  file server{+ e i server Matrix e XMPP}. La schermata elenca cosa è stato cancellato, cosa era già sparito e cosa non è stato
  raggiunto; **Cancella ancora** prova il resto.

**Perché:** un relay, anche di fiducia, è un posto che conserva qualcosa di te. Questo è l'unico tocco che riprende tutto senza
cancellare il telefono, per quando lasci un relay o chiudi un capitolo della tua vita.

## Chat importate {#import}

Le tue vecchie chat da Telegram e WhatsApp possono entrare in Erevos, da leggere, con le loro foto, video, messaggi
vocali e file, e quelle da Viber con le loro parole. Restano su questo telefono, sigillate nello spazio in cui le porti,
e non vanno a nessuno, a meno che tu non ne condivida una con la persona con cui era (sotto).

Prima esporta la chat dall’altra app:

- **WhatsApp:** apri la chat, poi **Altro**, **Esporta chat**, **Includi media**, e salva lo .zip sul telefono.
  **Senza media** porta solo le parole.
- **Telegram Desktop:** **Export chat history**, formato **JSON**, con le foto, i video, i messaggi vocali e i file
  che vuoi. Poi fai uno .zip della cartella che ha creato (su Windows: clic destro, **Invia a**, **Cartella
  compressa**) e copia lo .zip sul telefono. **result.json** da solo porta solo le parole.
- **Viber:** Viber stesso non esporta chat. Su Android, l’app **Backup Text for Viber** ne salva una come file .html:
  copialo sul telefono. Entrano solo le parole, con le emoticon di Viber come emoji. I tuoi messaggi lì non hanno
  nessun nome, quindi entrano come **Io**, già scelto come te. I messaggi di un giorno precedente all’esistenza di
  Viber, come il 1970, vengono da un telefono con l’orologio sbagliato: entrano senza ora.

Poi:

1. In Erevos, apri **Impostazioni** → **Dati e dispositivi** → **Chat importate** e tocca **Importa un file**, poi
   scegli il file.
2. Erevos dice che cosa ha trovato, con quante foto e file e quanto sono grandi insieme. Tocca il tuo nome, così i
   tuoi messaggi appaiono a destra, e tocca **Salva**. I file entrano uno dopo l’altro, e dice quanti e quale parte
   ne è entrata. **Annulla** lo ferma in quel momento, e non ne tiene nessuno.
3. Elimina tu stesso il file esportato dal telefono: Erevos conserva una sua copia sigillata, ma il file che hai
   salvato non è sigillato.

Per continuare la conversazione in Erevos, anche l’altra persona ha bisogno di Erevos:

1. Con **Nuova chat**, aggiungila come contatto tramite il relay, come in [Chat tramite un relay](#relay).
2. Apri la chat importata, tocca **Continua in Erevos** e sceglila.
3. La sua chat mostra ora i vecchi messaggi prima di quelli nuovi, come se fossero sempre stati in Erevos: in
   nuvolette, per giorno, con le loro ore, e **Continua in Erevos** tra loro e quelli nuovi. **Apri la chat** ti porta
   lì, e un contatto a cui non hai dato un nome prende il nome della chat importata.

**Dall’interno della chat:** la chat di un contatto ha **Chat importate** nei suoi **Dettagli**, sopra **Privacy**.
**Importa una chat qui** porta un file direttamente in quella chat, senza passare da **Impostazioni**: quando il file
contiene più chat, come un’esportazione di Telegram di tutte le chat, chiede quale continua qui, e propone la più
lunga. Ogni chat importata che continua lì è elencata con tre pulsanti:

- **Solo nella chat** la toglie da **Impostazioni** → **Dati e dispositivi** → **Chat importate**: appare solo in
  quella chat, come se ci fosse sempre stata. Una chat portata dai dettagli della chat è conservata così fin
  dall’inizio. **Mostra anche in Chat importate** la rimette nell’elenco, e lo fa anche l’elenco stesso, quando quel
  contatto non c’è più.
- **Scollega** smette di mostrarla nella chat; resta in **Chat importate**, da leggere o da continuare con qualcun
  altro.
- **Elimina** la elimina dal telefono, con le sue foto e i suoi file, dopo averlo chiesto.

**Perché:** una vecchia chat appartiene alla persona con cui era, quindi viene portata, conservata ed eliminata dove le
parli, e l’elenco in **Impostazioni** tiene solo quello che non ha nessun altro posto dove andare. Niente lascia il
telefono, a meno che tu non la condivida.

- **Foto, video, messaggi vocali e file** entrano da uno .zip, ognuno sigillato in questo spazio come un file in una
  chat. Le foto appaiono nella chat man mano che ci arrivi scorrendo, e gli sticker come sticker; tocca una foto o un
  file per vederlo da solo e **Salva** per salvarlo. Messaggi vocali e canzoni si riproducono direttamente nella chat
  con un tocco; un video si riproduce nell’app del telefono dopo averlo salvato. Tieni premuto un messaggio importato
  per **Copia** o **Apri** il suo file. **Cerca in questa chat** trova anche i messaggi importati. I file più grandi di
  4 GB, e quelli che l’esportazione non contiene, restano fuori, e la chat dice dove ce n’era uno.
- **Spazio sul telefono:** mentre entra uno .zip, al telefono serve libero circa il doppio della sua dimensione, perché
  Erevos ne legge una copia e conserva i file sigillati. Anche i file importati sono nei backup, come
  gli altri file.
- **Solo da leggere:** i messaggi importati non vengono inviati come messaggi, quindi l’altro telefono li ha solo se
  condividi la chat con lui. Erevos non può mostrare chi li ha scritti davvero.
- **Notifiche e chiamate** dell’altra app vengono escluse, e la chat dice quante sono.
- **Anche nelle chat nascoste:** nei **Dettagli** di una chat nascosta, **Importa una chat qui** tiene la chat con
  quel posto, crittografata con la sua chiave, e la mostra solo in quella chat, mai in **Impostazioni** → **Dati e
  dispositivi** → **Chat importate**; lì si può solo eliminare. Una chat spostata nelle chat nascoste porta con sé le
  chat importate in essa, tenute solo lì, e le riporta indietro se torna indietro.
- **Elimina messaggi** in una chat lascia quelli importati: eliminali nei **Dettagli** della chat, sotto **Chat
  importate**, o in **Impostazioni** → **Dati e dispositivi** → **Chat importate**.

**Condividila con quella persona:** la persona con cui continua una chat importata può averla anche lei. Nei
**Dettagli** della sua chat, sotto **Chat importate**, tocca **Condividi con** e il suo nome; in **Impostazioni** →
**Dati e dispositivi** → **Chat importate** una chat che continua con qualcuno ha lo stesso pulsante, che apre la sua
chat. Erevos dice quanti messaggi e quanti MB partono, e chiede prima. Poi tutte le chat importate con quella persona
partono insieme, di qualunque dimensione, ogni messaggio con ogni foto, video, messaggio vocale e file conservato, solo
a lei, crittografati end-to-end tramite il tuo relay, e la chat dice che l’hai condivisa.

- **Dalla sua parte** non c’è niente da fare: il suo {=Erevos} tiene subito i messaggi, dice nella chat chi li ha
  condivisi, da dove e quanti, e li mostra prima dei nuovi, solo da leggere, come una chat importata. Le foto e i file
  si aggiungono man mano che arrivano, e sotto quella riga dice quanti ne sono arrivati, **File: 3 di 10**. I lati sono
  scambiati: quello che hai scritto tu appare come tuo, alla sua sinistra, e in una chat a due quello che ha scritto
  quella persona appare come suo, a destra; in un gruppo, ognuno tiene il suo nome. Resta solo nella vostra chat lì, e
  può eliminarla nei suoi **Dettagli**. I suoi dispositivi collegati tengono solo i messaggi.
- **Condivisa di nuovo**, prende il posto della copia che aveva, quindi non c’è mai due volte. Una chat che qualcuno ha
  condiviso con te non si condivide oltre.
- **Solo con lei:** solo con un contatto Erevos con cui la chat continua, mai con un gruppo, e non si può inoltrare.
  Nelle chat nascoste funziona allo stesso modo, e dalla sua parte resta nel posto in cui è la vostra chat, anche tra
  quelle nascoste.
- **A turni:** le foto e i file partono dopo i messaggi, qualche decina di MB alla volta: ogni turno aspetta sul tuo
  relay finché il suo telefono non lo prende e lo elimina lì, e allora parte il successivo. Così parte una chat di
  qualunque dimensione, ogni file fino a 4 GB, e serve poco dello spazio del relay, che altri file condividono; quando
  il relay è pieno, Erevos aspetta e richiede, un po’ più tardi ogni volta. Va avanti ogni volta che Erevos è attivo su
  entrambi i telefoni, anche dopo che uno è stato spento o offline per un po’; un turno non preso in 12 giorni torna sul
  relay prima che scada. Un file eliminato da questo telefono nel frattempo è nominato come rimasto indietro.
- **A che punto è** si vede sotto la tua riga nella chat, **Condivisione, 40%**. Toccala per **Interrompi la
  condivisione**: quello che aspetta sul relay viene tolto, e il suo {=Erevos} elimina quello che è arrivato. Se quella
  persona elimina le chat, si ferma allo stesso modo.
- **Da un relay da cui il loro Erevos non prende da solo**, le chat aspettano dalla loro parte un tocco sulla loro riga;
  poi dice a che punto sono, **In arrivo, 40%**, e la tua riga dice **Condivisione · il suo telefono lo sta ricevendo**. Se non è stato possibile prenderle, lo dicono entrambi i telefoni e il loro vibra due volte: lo toccano
  per riprovare. Prenderle da lì senza Tor mostra a quel server il loro indirizzo internet, ed Erevos lo dice prima.
- **Un Erevos precedente** riceve invece un file, **Chat da Telegram.json**, con dentro i messaggi come testo, e nessuna
  delle foto e dei file.

> Il file delle chat importate cresce con quello che porti dentro, quindi la sua dimensione dice più o meno quanto è
> stato importato, ma non in quale spazio.

## Aspetto {#appearance}

**Aspetto** segue Fasouli e il sito LPHL. Si trova in **Impostazioni** → **Aspetto**, in parti che si aprono
ognuna da sola: **Stile e colori** (la finitura, il vetro, lo stile, il tema, i colori e il testo sulle aree colorate
qui sotto, con l’**Anteprima**), **Sfondo**, **Messaggi**, e su Android **Icone del launcher** e **Widget**.

| Impostazione | Scelte |
| --- | --- |
| **Finitura** | **Piatto**, o **Vetro** come su lphl.nekten.eu. Il vetro è di due tipi: **Lastre** (ogni scheda una lastra di vetro sopra lo sfondo) e **Una lastra** (ogni schermata su un’unica lastra smerigliata). |
| **Stile** | **Classic** (lo scuro e oro di Erevos), **Modernist** (Inter Tight), **Nocturne** (sempre scuro, con i suoi colori), **Neon** (LED ciano e magenta che brillano, sopra una griglia che corre verso un sole al tramonto), **Matrix** (verde su nero in monospazio, con codice che piove dietro), **Paper** (blu stilografica su crema, con le grazie, sopra righe con un margine rosso), **Aurora** (viola su un quasi bianco, morbido e arrotondato, sopra pozze di luce menta, lilla e pesca), **Material You** (i colori del telefono, su Android 12 e successivi) e **Personalizzato** (il tuo fondo e il tuo colore d’accento). |
| **Tema** | **Sistema**, **Chiaro** o **Scuro**. Nocturne, Neon e Matrix sono sempre scuri, Paper e Aurora sempre chiari, e Personalizzato è chiaro o scuro a seconda del suo fondo. Material You lo segue. |
| **Colori** | Quelli dello stile, una delle dodici tavolozze di LPHL, o **Il mio colore**. Scegliere una tavolozza con uno stile che ha i suoi colori torna allo stile scelto prima. |
| **Personalizzato** | Con **Personalizzato** scelto: il suo **fondo** (otto chiari, otto scuri) e il suo **accento**. Il testo e le superfici derivano dal fondo, e ogni colore viene controllato perché si legga bene sopra. |
| **Testo sulle aree colorate** | **Bianco**, **Come la tavolozza**, o **Il mio colore**. |
| **Carattere** | Le lettere di ogni testo: **Quello dello stile**, **Quello del telefono**, **Con grazie** (piccoli tratti alle estremità delle lettere, come nei libri) o **A spaziatura fissa** (ogni lettera larga uguale, come in una macchina da scrivere). |
| **Sfondo** | Quello che c’è dietro ogni schermata: **Come lo stile** (la scena o il bagliore propri dello stile), **Tinta unita**, o un motivo disegnato tenue nel colore d’accento: **Puntini**, **Griglia**, **Righe**, **Stelle**, **Luci** (morbidi cerchi di luce) o **Sfumatura**; oppure **Foto**, una tua foto, rimpicciolita, ridisegnata e sigillata, sotto un velo perché il testo si legga (**Cambia foto** ne sceglie un’altra). La schermata della password mostra invece quello dello stile. |
| **Messaggi** | Come una chat disegna i messaggi: nuvolette **Arrotondato**, nuvolette **Squadrato**, o **Linea**, nessuna nuvoletta ma una linea accanto al testo, come un registro. |
| **Dimensione del testo** | Quanto è grande il testo dei messaggi: **Piccolo**, **Normale**, **Grande** o **Più grande**. Il resto della schermata resta com’è. |

Erevos appena installato parte con **Glass** (**Lastre**), **Modernist**, **Sistema**, **Il mio colore** in azzurro, testo **Come la tavolozza**, carattere **Quello del telefono** e messaggi **Squadrato**. Un aspetto scelto prima resta com’era.

Neon, Matrix, Paper e Aurora disegnano una loro scena dietro ogni schermata, Personalizzato tiene il fondo che hai
scelto e Material You i colori del telefono, quindi il **Vetro** aspetta finché sono scelti. La pioggia resta
ferma quando il telefono è impostato per ridurre le animazioni.

L’**Anteprima** mostra alcuni messaggi e pulsanti con l’aspetto che hai scelto. Ogni combinazione viene controllata
perché il testo si legga sempre bene, anche sul vetro.

- **Ogni spazio ha il suo aspetto.**
- **La schermata della password** mostra l’ultimo aspetto usato. Per farlo è conservato fuori dai dati sigillati: non
  dice nulla delle tue chat, ma chi apre il telefono vede quale aspetto usi.
- **Material You** prende i colori che Android ricava dal tuo sfondo (Android 12 e successivi), chiari o scuri come
  dice **Tema**, con pulsanti arrotondati e schede morbidamente arrotondate, nel carattere del telefono. Un nuovo sfondo
  li cambia anche in Erevos, appena torna visibile. Vengono letti sul telefono e non vanno da nessuna parte. Sulle
  versioni di Android più vecchie e su un computer non viene offerto.
- **Icone del launcher** (Android): il colore di ciascuna delle icone di Erevos tra le app del telefono, **Erevos**
  (rossa, apre le chat Erevos, o la chat che hai lasciato aperta){~, **Telefono** (verde, apre il tastierino), **SMS**
  (blu, apre l’elenco degli SMS)} e **Contatti** (viola): rosso, arancione, verde, blu, viola o scuro. Ogni tocco apre
  quello che la sua icona nomina, anche quando Erevos mostrava un’altra di esse. Il colore è del telefono, non di ogni
  spazio, perché le icone appaiono prima che Erevos sia sbloccato. Dopo una modifica alcuni launcher tolgono l’icona
  dalla schermata Home: aggiungila di nuovo dall’elenco delle app.
- **Punti e numeri sulle icone** (Android): Android dà il punto o il numero di una notifica all’app, non a una delle
  sue icone, quindi nella maggior parte dei launcher, come quelli dei Pixel e di GrapheneOS, quello di Samsung, quello
  di Xiaomi e Kvaesitso, ogni notifica di Erevos (un messaggio, {~un SMS, |}una chiamata, un compleanno) appare uguale
  sulle icone Erevos{~, Telefono, SMS e| e} Contatti; lì Erevos non può cambiarlo. Per lasciare il punto solo ad alcune
  notifiche, disattivalo per le altre nelle impostazioni di Android per le notifiche di Erevos, dove ogni tipo di
  notifica ha un suo interruttore. I launcher di Huawei e Honor accettano un numero per ogni icona: lì, con
  **Impostazioni** → **Notifiche** → **Numero sull’icona** → **Mostra il numero**, l’icona di Erevos stessa mostra i
  messaggi che conta la sua notifica{~, quella degli SMS gli SMS non letti, quella del Telefono le chiamate perse|} e
  quella dei Contatti un compleanno di oggi, ogni numero solo sulla sua icona.
- **Calcolatrice al posto di Erevos** (Android, sotto **Icone del launcher**): una calcolatrice che funziona compare
  tra le app del telefono al posto dell’icona di Erevos. Tocca **Metti la calcolatrice al suo posto**, scrivi due
  volte un codice da 4 a 12 cifre e tocca **Salva**. Da lì in poi apri la calcolatrice, scrivi il codice, poi **=**:
  Erevos si apre, chiedendo la sua password come sempre. Qualsiasi altro calcolo è solo un calcolo. **Cambia il
  codice** lo cambia; **Mostra di nuovo l’icona di Erevos** riporta l’icona, nel suo colore, e dimentica il codice. È
  nascosta solo l’icona: l’elenco delle app di Android, le notifiche, le app recenti e {~le icone Telefono, SMS e
  Contatti|l’icona Contatti} mostrano ancora Erevos. Il telefono conserva solo un hash del codice: è una porta, non la serratura. Una
  volta cancellato Erevos, con la password di panico o con **Cancella spazio di archiviazione** di Android, nessun
  codice lo apre più: la calcolatrice allora apre Erevos, come nuovo, e l’icona di Erevos torna al suo posto.

  **Perché:** chi dà un’occhiata al telefono vede una calcolatrice, non un messenger; la password protegge comunque
  ciò che c’è dentro.
- **Widget** (Android): l’ordine dei {~quattro|due} pulsanti del widget, da sinistra a destra, con il widget disegnato come
  apparirà. Tocca ↑ o ↓ per spostare un pulsante; **Ordine iniziale** li rimette a posto.
- **Vibrazione al tocco** (Android): una breve vibrazione quando tocchi un tasto della tastiera, Invia, Invio o un interruttore, e quando si apre un menu; mai mentre scorri. Attiva, a meno che tu non la spenga qui. È del telefono, uguale in ogni spazio.

## Su un computer {#desktop}

Erevos funziona anche su un computer, Linux, macOS o Windows, come app a sé. Chatta tramite un relay, crittografato
end-to-end come sul telefono, e conserva i suoi contatti, messaggi e impostazioni sigillati allo stesso modo.

1. Installalo. Su Linux: il pacchetto per i sistemi basati su Arch (\`erevos-linux-x86_64.pacman\`, con
   \`sudo pacman -U\`) o l’AppImage. Su un Mac: apri l’immagine disco e trascina Erevos in Applicazioni. Non ha una
   firma Apple a pagamento, quindi la prima volta consentilo in
   **Impostazioni di Sistema → Privacy e sicurezza → Apri comunque**. Su Windows 10 o 11: esegui
   \`erevos-windows-x64-setup.exe\`, che installa Erevos solo per te, senza amministratore, e lo mette nel menu
   Start; oppure tieni \`erevos-windows-x64-portable.exe\` dove vuoi ed eseguilo, senza installare nulla. Nessuno dei
   due ha una firma a pagamento, quindi la prima volta Windows dice di aver protetto il tuo PC: tocca
   **Ulteriori informazioni**, poi **Esegui comunque**.
2. Imposta il relay e aggiungi i contatti come sul telefono, vedi [Chat tramite un relay](#relay). **Copia il mio link
   di contatto** copia il tuo link, da incollare dove deve andare.

- **Quello che fa solo il telefono:** Bluetooth, Wi-Fi Aware e LoRa, e i loro test. I contatti sulla stessa rete Wi-Fi
  li raggiunge come fa un telefono, vedi [Chat con un telefono vicino](#nearby). Il resto è uguale: spazi e seconda
  password, chat nascoste, messaggi vocali, chat importate e backup.
- **Dove conserva le cose:** in una sua cartella (su Linux \`~/.config/Erevos\`, su un Mac
  \`~/Library/Application Support/Erevos\`, su Windows \`%APPDATA%\\Erevos\`), sigillate come sul telefono. Il suo
  archivio di chiavi è sigillato con il portachiavi del sistema (su un Mac il Portachiavi, su Windows la chiave del tuo
  account Windows). Su un sistema Linux senza portachiavi (KWallet o GNOME Keyring), o con uno che Erevos non trova,
  Erevos si apre con un avviso e non conserva nulla: avvia il portachiavi, o dai a Erevos
  \`--password-store=gnome-libsecret\`. Avviato con \`--plain-secrets\`, conserva lì il suo archivio di chiavi così
  com’è, leggibile dal tuo utente: allora imposta un blocco con password. L’app portatile per Windows conserva le sue
  cose nella stessa cartella di quella installata, e disinstallarla le lascia lì.

**Perché:** senza un portachiavi, l’archivio di chiavi starebbe sul disco così com’è, leggibile dal tuo utente, quindi
Erevos non conserva nulla lì a meno che tu non lo scelga con \`--plain-secrets\`: nessuno spazio per password resta lì
non sigillato a tua insaputa.

- **Il firewall di Windows** chiede, la prima volta che Erevos si apre, se può usare la rete. Consentilo sulle reti
  private, altrimenti telefoni e computer sulla stessa rete Wi-Fi non possono raggiungerlo; i relay funzionano in
  entrambi i casi.
- **I messaggi vocali** registrati su un computer sono Opus, su un telefono AAC. Entrambi si riproducono su entrambi.
- **Le foto** arrivano dai file del computer; non c’è la fotocamera. **Salva** chiede dove mettere una foto o un file.
- **Un computer e un telefono possono condividere un account:** collega il computer al telefono, ed entrambi hanno le
  stesse chat e gli stessi contatti, vedi [Dispositivi collegati](#devices). Oppure un backup sposta tutto dall’uno
  all’altro, vedi [Backup](#backup), e da quel momento usa solo uno dei due.
- **In background:** chiudendo la sua finestra, Erevos continua a funzionare nell’area di notifica (su un Mac, nel
  Dock), a meno che tu non lo disattivi: **Impostazioni** → **Notifiche** → **In background** → **Esci alla chiusura**.
  Continua ad attendere sul relay: una chiamata squilla, con una suoneria sua, e riporta la finestra, e una notifica
  dice quanti messaggi non sono letti, mai chi né cosa, finché Erevos non si vede di nuovo. Lo apri dalla sua icona
  nell’area di notifica, o avviando di nuovo Erevos, e ne esci dal menu di quell’icona (su un Mac, dal suo menu). Dove
  il desktop non mostra l’area di notifica, come GNOME senza un’estensione apposita, avviare di nuovo Erevos riporta la
  finestra. Una volta uscito non riceve nulla: i messaggi aspettano sul relay, e una chiamata appare come chiamata
  persa quando si apre.
- **Le chiamate** squillano mentre Erevos si vede, con una suoneria sua: due squilli brevi ogni 3 secondi, finché la
  chiamata non riceve risposta o finisce.
- **Provato finora** su Linux. Le versioni per Mac e Windows sono compilate e aperte sui computer di GitHub, non ancora
  da una persona.

## Dispositivi collegati {#devices}

Lo stesso account sul telefono e su un computer, o in un browser: le stesse chat, gli stessi contatti e messaggi su
entrambi. Il telefono resta l’account: solo lui aggiunge contatti, e collega e scollega dispositivi. Ogni dispositivo
collegato ha chiavi sue, che il telefono firma in un elenco dei dispositivi dell’account e dà ai suoi contatti. I
contatti con questa versione scrivono allora anche a ogni dispositivo, crittografato end-to-end, così riceve i loro
messaggi anche a telefono spento; per quelli con versioni più vecchie il telefono passa al computer quello che arriva,
e sigilla per loro quello che scrive il computer. I contatti vedono lo stesso account e lo stesso codice di sicurezza,
qualunque versione di Erevos abbiano.

**Perché:** ogni dispositivo ha chiavi sue, mai una copia di quelle dell’account: Erevos non ha un server che possa
escludere un dispositivo perso, quindi un dispositivo non è mai più di una voce in un elenco che il telefono firma, e
scollegarlo basta. L’elenco ha sempre quattro posti, e quelli che nessun dispositivo occupa contengono chiavi create per
niente, così i contatti non possono capire quanti dispositivi hai. E con il telefono come account, i contatti con
qualsiasi Erevos più vecchio ti raggiungono come prima.

Per collegare un computer:

1. Sul computer, in uno spazio senza chat sue (una nuova installazione, uno spazio aperto da una nuova password, o le
   chat di un computer collegato ripristinate dal suo backup), apri **Impostazioni** → **Dati e dispositivi** →
   **Dispositivi collegati**. Lì **Collega al mio telefono** viene per primo e mostra subito un piccolo codice QR: non
   c’è nulla da scrivere.
2. Sul telefono, scansiona il codice con la fotocamera: Erevos chiede **Collegare … a questo telefono?** Scegli
   quanta cronologia passa (**Tutti**, **L’ultimo mese**, **L’ultima settimana** o **Nessuno**), se **Anche foto e
   file**, poi tocca **Collega**. Tutto qui: il telefono dà al computer ciò che gli serve tramite Nostr, cifrato
   end-to-end, il computer mostra al telefono il suo codice e i codici di sicurezza si confrontano da soli, quindi non
   scrivi né confronti nulla.
3. Se Nostr non è raggiungibile, o il computer non può usare il relay, lo dice. Lì tocca **Collega in un altro modo**:
   se chiede un relay, quello di LPHL è già inserito, quindi tocca **Accedi con LPHL** per un token tutto del computer,
   o scrivi un altro relay e il suo token. Dai un nome al dispositivo e tocca **Collega al mio telefono**: mostra allora
   un codice QR più grande. Scansionalo con il telefono, oppure copia il codice, incollalo sul telefono sotto **Codice
   dal computer** e tocca **Avanti**. Il telefono mostra il nome del computer e un codice di quattro gruppi di cinque
   cifre; scegli come sopra e tocca **Collega**.
4. Solo così il computer mostra anche un codice: se è quello del telefono, tocca **Coincidono**. Se no, tocca **Sono
   diversi**: qualcun altro potrebbe aver letto il suo codice QR, e non gli è arrivato nulla. Le chat nascoste si
   collegano solo così, da dentro, con il codice completo.

Le chat arrivano allora sul computer, e dopo di esse i messaggi scelti.

- **I messaggi** dei contatti arrivano a entrambi, e ognuno li conserva una volta: uno che arriva di nuovo entro 30
  giorni (fino a 2000 da un contatto) non viene conservato di nuovo, anche dopo che è scomparso o è stato eliminato lì.
  Per questo ognuno conserva, per 30 giorni, quali messaggi sono arrivati e in che giorno, non che cosa dicevano, anche
  dopo che sono scomparsi o sono stati eliminati, e in un backup fatto nel frattempo; il telefono lo conserva anche per
  un contatto che ha collegato un dispositivo. Quello che scrivi sul computer va a un contatto con questa versione
  direttamente da lì, una volta che ha scritto al computer, e altrimenti tramite il telefono: il telefono lo mostra
  come tuo, e il contatto lo riceve dall’account. Quello che scrivi sul telefono appare anche sul computer. Segni di
  lettura, reazioni, messaggi fissati, voti, eliminazioni da entrambi i telefoni, nomi, timer, aspetti delle chat e
  immagini, l’apparire offline e l’accettazione delle richieste vanno in entrambe le direzioni. Un messaggio segnato
  come importante, o un’eliminazione su **Questo telefono**, fatti sul telefono vanno anche al computer; fatti sul
  computer, restano lì.
- **A telefono spento**, i contatti con questa versione raggiungono comunque il computer, e il computer loro: quello
  che scrivono, leggono e a cui reagiscono arriva, e quello che scrivi tu parte. Se il telefono resta spento così a
  lungo che la sua coda sul relay si riempie (1000 messaggi), quello che scrivono e leggono raggiunge comunque il
  computer, un lungo messaggio vocale per intero; quello a cui reagiscono, che fissano, votano o eliminano, e le loro
  chiamate, non passano finché il telefono non è di nuovo acceso. Per i contatti con versioni più vecchie (anche aggiungerli) e i gruppi, **il telefono deve essere acceso** e
  raggiungere il relay: quello che il computer scrive nel frattempo aspetta sul relay, e parte appena il telefono
  torna. Qualcuno di nuovo il cui link di contatto è di questa versione il computer lo aggiunge anche a telefono spento:
  inizia lui stesso la chat, quella persona vede il tuo account come una richiesta, e il telefono la aggiunge anche lui
  appena è acceso. Due o più dispositivi collegati si raggiungono anche direttamente: a telefono spento, ognuno mostra comunque
  quello che gli altri scrivono, leggono e a cui reagiscono, e le modifiche che fanno ai contatti; uno che ha perso il
  primo messaggio di un altro ne riceve uno nuovo un giorno o più dopo. Un computer rimasto spento più a lungo di
  quanto il relay conservi i messaggi (14 giorni), o che ha perso il primo messaggio di un contatto, riceve comunque
  quello che scrive dopo: il suo {=Erevos} ricomincia con esso un giorno o più dopo, poi sempre meno spesso, finché non
  risponde. Dopo che un contatto ti elimina e ti aggiunge di nuovo, il computer ricomincia anche con i suoi
  dispositivi.
- **Le foto e i file** che arrivano restano sul relay finché sia il telefono sia il computer non li hanno presi; poi il
  telefono li elimina da lì. Uno che il computer non prende mai se ne va quando viene scollegato, o dopo 14 giorni,
  come ogni file non preso.
- **Chat con me stesso** è uguale su ogni dispositivo: una nota, una foto, un file o un messaggio vocale scritti su
  uno vanno agli altri, e così un promemoria impostato, cambiato o visto e una nota eliminata; di due modifiche alla
  stessa nota, resta la più recente. Quello che è stato scritto prima del collegamento va una volta, nei due sensi,
  appena entrambi hanno questa versione. Un promemoria si mostra su ogni dispositivo alla sua ora, e visto su uno se
  ne va dagli altri. La foto o il file di una nota va come copia sul relay, eliminata da lì una volta presa, o, per
  due dispositivi o più, lasciata lì finché scade (14 giorni). Le note delle chat nascoste vanno solo nel loro
  collegamento, più sotto.
- **Impostazioni:** la lingua, l’aspetto (lo stile, i colori, la dimensione del testo) e **Ultimo accesso** sono gli
  stessi su ogni dispositivo dello spazio: cambiati su uno, cambiano anche sugli altri. Una foto dietro le schermate
  resta sul dispositivo dove è stata scelta, come tutto ciò che riguarda un solo dispositivo: password, PIN e codice
  di panico, il tempo del blocco, la vibrazione, il relay e Tor,{~ i moduli,} il nome del dispositivo. Un dispositivo che
  deve tenere le sue: **Impostazioni** → **Dati e dispositivi** → **Dispositivi collegati** → **Stesse impostazioni su
  tutti i dispositivi** disattivato. Riattivato, prende subito quelle degli altri. Le chat nascoste tengono le loro.
- **Tramite Tor per una chat:** l’interruttore **Tramite Tor** nei **Dettagli** di una chat di Erevos è lo stesso su
  ogni dispositivo: attivato o disattivato su uno, lo è su tutti. Su un dispositivo senza Tor, come l’app web, quella
  chat non invia nulla finché è attivo. Un dispositivo con una versione più vecchia non lo disattiva mai per gli
  altri. Vedi [Tramite Tor](#tor).
- **Sullo stesso Wi-Fi:** il telefono e un computer sullo stesso Wi-Fi o hotspot (con **Trova Erevos sulla stessa rete Wi-Fi**
  attivo) si passano ciò che cambia direttamente lì, anche senza internet; il relay riceve comunque la sua copia, che
  allora non cambia più nulla. Solo quelli dello spazio: i collegamenti delle chat nascoste passano dal relay.
- **Le chiamate** squillano sul telefono e sul computer. Rispondi su uno dei due: l’altro smette di squillare, e
  dice che si è risposto su un altro dispositivo. Rifiutare una chiamata su uno la rifiuta su entrambi. Con un
  contatto con questa versione, il computer chiama e riceve le chiamate da solo, anche a telefono spento; con uno con
  una versione più vecchia chiama tramite il telefono, che deve restare acceso solo per avviare la chiamata. In
  entrambi i casi la chiamata stessa va direttamente tra il computer e il contatto, crittografata tra loro.
- **Invia più tardi** funziona anche sul computer. A un contatto con questa versione il computer lo consegna da sé
  al relay, con una copia per ognuno dei suoi dispositivi, così parte alla sua ora a telefono spento e arriva ai suoi
  dispositivi anche con il suo telefono spento; a uno con una versione più vecchia passa dal telefono. Ogni tuo
  dispositivo lo mostra come programmato, ed eliminarlo su uno qualsiasi prima della sua ora lo annulla ovunque.
- **I gruppi** sono anche sul computer, con i loro messaggi, foto, file e messaggi vocali. Scrivici, rispondi,
  reagisci, vota, fissa, elimina i tuoi per tutti, aggiungi e rimuovi membri, rinominane uno o lascialo, lì come sul
  telefono: il telefono lo fa per il computer, come se fosse suo. Una foto o un file che il telefono conserva va al
  computer come copia sul relay, eliminata lì appena il computer l’ha presa. Quello che i membri fanno dopo a un
  messaggio (reagire, votare, fissarlo, eliminarlo per tutti) appare anche sul computer, come un messaggio segnato come
  importante o un’eliminazione su **Questo telefono** fatti sul telefono. Un
  messaggio che il telefono non ha potuto inviare al gruppo (uno chiuso nel frattempo, per esempio) appare sul computer
  come **Non inviato dal telefono**. Creare un gruppo, i gruppi pubblici e le chiamate di gruppo restano per ora sul
  telefono.
- **I gruppi restano su** un dispositivo a tua scelta: sul telefono, in **Impostazioni** → **Dati e dispositivi** →
  **Dispositivi collegati** → **I gruppi restano su**, scegli **Questo telefono** o un computer collegato. Le chiavi dei
  gruppi vanno allora lì, mai copiate, così i gruppi funzionano lì a telefono spento, e lì se ne possono creare di nuovi;
  il telefono e gli altri dispositivi ci scrivono attraverso di esso, quindi deve essere acceso. I membri non vedono
  niente di nuovo: te, come sempre, solo che i tuoi messaggi di gruppo arrivano in un’altra coda. Per spostarli servono
  tutti e due accesi e il relay, e i gruppi pubblici restano sul telefono (esci prima da quelli). Per scollegare quel
  computer, riporta prima i gruppi sul telefono. Se è perso, scollegalo comunque: i gruppi allora risultano
  abbandonati sul telefono. Un computer con un {=Erevos} più vecchio non può tenerli.
- **Le chat nascoste e le seconde password** non vanno mai con il collegamento dello spazio: ognuno si collega per conto
  suo, dall’interno. Per un posto di chat nascoste: sul computer, apri quel posto con il suo PIN, nuovo e vuoto come lo
  lascia un nuovo PIN, e dagli una sua coda sul relay in **Per utenti esperti** lì; poi tocca **Dispositivi collegati**
  sotto il suo elenco, e **Collega al mio telefono**. Sul telefono, apri lo stesso posto con il suo PIN, tocca
  **Dispositivi collegati** sotto il suo elenco e scansiona il codice del computer con la fotocamera mentre il posto
  resta aperto, oppure incollalo lì; poi come sopra. Un codice mostrato in un posto collega solo un posto, e quello di
  uno spazio solo uno spazio: letto dall’altro, semplicemente decade, e **Collega al mio telefono** ricomincia sul computer. Il posto ha
  allora un collegamento suo, con chiavi sue e un suo elenco di dispositivi, firmato dal suo account, così i suoi
  contatti con questa versione scrivono direttamente al posto del computer. I suoi messaggi, contatti, gruppi, chiamate,
  foto e file e la sua Chat con me stesso vanno tra i due posti come quelli dello spazio tra dispositivi collegati{+, e
  così i suoi account Matrix, XMPP e Nostr, sempre, e di nuovo quando cambiano}. Niente
  di tutto questo si vede nello spazio, nelle sue schermate o sui suoi dispositivi collegati, e il collegamento dello
  spazio non porta mai niente di un posto: quello che un posto tiene del suo collegamento è crittografato con la sua
  chiave, tra valori fatti per niente per gli altri posti, in un file della stessa dimensione che un posto sia collegato
  o nessuno. Il collegamento funziona mentre il posto è aperto, e anche da chiuso se **Ricevere da chiuse** è attivo;
  chiuso senza, niente di esso si sincronizza, e quello che arriva aspetta sul relay (14 giorni) finché si apre, da
  entrambe le parti. Sul computer, i nuovi gruppi e le chiamate di gruppo restano sul telefono, una chat non si può
  spostare nel posto né fuori (spostala sul telefono), e una chiamata risposta lì ferma lo squillo del telefono solo
  mentre il posto è aperto sul telefono. Le chat nascoste scrivono ai dispositivi di un contatto con questa versione
  come fanno le tue altre chat, così quelli le ricevono a telefono del contatto spento, e al contatto sembrano le chat
  di un telefono che non ha mai collegato un dispositivo. Una chat spostata nelle chat nascoste sul telefono lascia il
  computer. Spostata nelle chat nascoste, o da lì nelle tue chat, una chat scrive solo al telefono del contatto, come fa
  un {=Erevos} più vecchio, finché non torna dove è stata creata: al suo {=Erevos} viene detto prima, così i suoi dispositivi
  smettono di scrivere ai tuoi, e da questo può capire che la chat ha smesso di conoscere i dispositivi collegati: se
  gli aveva dato l’elenco dei tuoi dispositivi, che è passata nelle chat nascoste. Uno spazio aperto da una seconda
  password si collega solo dal suo interno, a dispositivi suoi.
- **Trasferisci di nuovo i messaggi**, sul telefono, invia di nuovo un periodo della cronologia, con le sue reazioni,
  i messaggi fissati, i voti e quelli segnati come importanti; quello che il computer ha già non viene conservato due
  volte.
- [+] **Matrix, XMPP e Nostr**: ogni dispositivo collegato li riceve, e seguono i cambiamenti sul telefono: un account da cui si esce lì, o sostituito da un altro, se ne va anche dai dispositivi. Il computer accede agli
  account Matrix e XMPP di questo spazio e prende la chiave delle sue chat Nostr, ciascuno come nuovo dispositivo a
  sé: il telefono tiene il suo. Per un computer già collegato, tocca **Invia gli account** sotto di esso sul telefono.
  XMPP e Nostr arrivano da soli. Un server Matrix di rado lascia che il telefono faccia accedere un nuovo dispositivo:
  allora lo dice **Dispositivi collegati** sul computer, e **Accedi a Matrix** lì apre Matrix con l’ID già inserito,
  per la sua password, una volta sola. Le chiavi dell’account arrivano dal telefono, quindi non servono né la chiave
  di sicurezza né la verifica con le emoji, e i messaggi di prima si aprono dal suo backup delle chiavi. Un computer
  che ha già un account suo su uno di essi lo tiene, e quello che non è potuto arrivare ancora (perché era offline,
  per esempio) viene ritentato ogni volta che si apre. Una volta scollegato, il computer esce dagli account che ha
  trasferito. Un posto di chat nascoste collegato per conto suo dà i suoi account allo stesso modo, dai suoi
  **Dispositivi collegati**, allo stesso posto sul computer: mai quelli dello spazio, e quelli dello spazio non vanno
  mai a lui. Ogni dispositivo accede come se stesso, mai con una copia delle chiavi del telefono, che verrebbe usata
  due volte e romperebbe la crittografia; così ciascuno può uscire da solo, dai dispositivi dell’account.
- [~] **SMS**: gli SMS del telefono possono apparire anche sui dispositivi, e ricevere risposta da lì tramite il telefono,
  una volta attivato in **Impostazioni** → **Telefono e SMS** → **SMS** → **Anche sui miei dispositivi collegati**, vedi
  [SMS](#sms).
- **Scollega**, sul telefono, esclude subito un dispositivo: non gli arriva più nulla, e niente di quello che invia
  viene preso. Ai contatti con questa versione viene detto la prossima volta che il telefono raggiunge il relay:
  smettono di scrivergli, e non prendono più nulla da lui. È così che si esclude un computer perso. Se è acceso, gli
  viene detto, e le chat dell’account lo lasciano. Sul computer, **Scollega questo dispositivo** fa lo stesso da lì.
- **Fino a quattro** dispositivi si collegano a un telefono. Un backup non porta i collegamenti, ma dopo averne
  ripristinato uno su un altro telefono, quel telefono chiede a ogni dispositivo che è ancora tuo di collegarsi di
  nuovo, con un tocco su ognuno, vedi [Backup](#backup).

## Su iPhone, dal browser {#iphone}

Erevos non ha un’app nell’App Store. Su un iPhone funziona come web app, aggiunta alla schermata Home da Safari, senza
account Apple. Chatta tramite un relay, crittografato end-to-end come sul telefono, e conserva i suoi contatti,
messaggi e impostazioni sigillati allo stesso modo, nello spazio di Safari per l’app.

1. Apri in **Safari** l’indirizzo del server Erevos che ti è stato dato. Erevos mostra come aggiungerlo: tocca
   **Condividi** (su iOS 26, sotto **•••**), poi **Aggiungi alla schermata Home**, poi apri Erevos dalla schermata
   Home. Richiede iOS 17 o successivi.
2. In Erevos, apri **Impostazioni** → **Privacy e sicurezza** → **Questa web app** e confronta l’impronta della
   chiave di rilascio con quella che ti è stata data con l’indirizzo, carattere per carattere. Se è diversa, elimina
   l’app e dillo a chi ti ha dato l’indirizzo.
3. Imposta un blocco con password (in Erevos, **Impostazioni** → **Privacy e sicurezza** → **Blocco e seconda
   password**). Sul web conta più che mai: vedi più sotto.
4. Imposta il relay e aggiungi i contatti come sul telefono, vedi [Chat tramite un relay](#relay).

**Come si controlla da sé.** Una web app è codice che invia il server, quindi un server violato, o a cui viene
ordinato, potrebbe inviare codice modificato. Erevos non prende quel codice sulla fiducia:

- La prima volta che si apre, scarica il suo codice con un elenco di ogni file e della sua impronta, firmato con la
  chiave di rilascio, che ha solo la persona che fa le versioni; il server non ce l’ha. Controlla la firma e ogni file,
  li conserva sull’iPhone, e da quel momento esegue solo quelli. Il server non può cambiarli.
- Un aggiornamento viene preso solo se è firmato con la stessa chiave ed è più recente di quello in uso; parte la
  prossima volta che Erevos si apre. Uno non firmato o più vecchio viene rifiutato, ed Erevos lo dice.
- Chi vuole può controllare il server: \`node pwa/release.mjs verify https://<indirizzo>\` controlla la firma e ogni
  file che il server distribuisce, e \`scripts/reproduce-web.sh <versione> https://<indirizzo>\` ricompila quella
  versione dal suo codice sorgente e controlla che ogni file venga uguale.

**Che cosa resta.** Questi sono limiti reali; conoscili:

- **La prima volta** che lo apri, ti fidi del server: è lui che invia la parte che controlla. Il passo 2 è il modo per
  accorgerti di uno sbagliato.
- **La parte che controlla stessa** (il service worker) viene scaricata di nuovo da Safari almeno una volta al giorno,
  e Safari può sostituirla senza chiedere a Erevos. Erevos controlla allora quella nuova rispetto alla versione firmata
  e ti avvisa (**Erevos è stato manomesso**), ma un server che sa come fare potrebbe superare quel controllo. Se vedi
  l’avviso, non aprire più Erevos da quel server finché non viene spiegato. Con un blocco con password le tue chat
  restano sigillate.
- **Niente Bluetooth né collegamento da vicino**{~ e niente SMS}: Safari non li permette.
- **Solo mentre è aperto:** iOS ferma le web app in background, quindi i messaggi arrivano quando apri Erevos; fino ad
  allora aspettano sul relay.
- **Le chiamate** squillano mentre Erevos è aperto, con una suoneria sua: due squilli brevi ogni 3 secondi. Safari la
  lascia suonare solo dopo che hai toccato Erevos da quando si è aperto, e non con l’iPhone in silenzioso. Con Erevos
  chiuso una chiamata non squilla: compare solo la notifica «Chiamata», se le notifiche sono attive. Apple non permette
  niente di più a una web app; per squillare come un telefono servirebbe un’app dell’App Store.
- **Le notifiche** mentre Erevos è chiuso sono disattivate finché non le attivi: in Erevos, **Impostazioni** →
  **Notifiche** → **Notifiche ad app chiusa** → **Attiva** (iOS 16.4 o successivi, dalla schermata Home). Quando
  arrivano messaggi, o squilla una chiamata, il tuo relay invia un push tramite Apple, ed Erevos mostra quanti messaggi
  sono arrivati dall’ultima volta che l’hai aperto (**3 nuovi messaggi**), o **Chiamata** quando ha squillato solo una
  chiamata, nella lingua dell’app, niente di più. Il conteggio è crittografato per il tuo iPhone: Apple vede quando
  arriva qualcosa per il tuo iPhone, e che usa {=Erevos}, mai che cosa o da chi. Con un relay o l’{=Erevos} di un mittente
  precedente alla 2.0.0, o un messaggio che altri telefoni hanno portato al relay, non c’è nessun numero: Erevos mostra
  **Nuovo messaggio**, o **Nuovi messaggi** se ne sono arrivati altri, finché non lo apri. Sono per ogni spazio, mai per
  le chat nascoste, e il tuo relay deve essere configurato per inviarle. Arrivano anche per la coda di ogni contatto: il
  tuo relay ha allora un unico indirizzo push per tutte le code dei tuoi contatti, e Apple riceve un push per ogni
  contatto che ha scritto, a 15 secondi di distanza, quindi da una serie del genere può immaginare quanti hanno scritto
  insieme, mai chi. L’icona di Erevos nella schermata Home mostra allora anche un numero: i messaggi non letti nello
  spazio che avevi aperto, che restano una volta chiuso Erevos, e quelli arrivati dopo (ciò che è arrivato senza numero
  conta per uno), mai quelli di una chat nascosta. **Impostazioni** → **Notifiche** → **Numero sull’icona** lo
  disattiva. Le notifiche funzionano tramite il servizio push di Apple, quello di Google (Chrome, ed Edge su Android,
  Brave e Opera), quello di Mozilla (Firefox) e quello di Microsoft (Edge su Windows): un browser che ne usa un altro
  non può attivarle, a meno che chi gestisce il tuo relay non consenta il servizio push di quel browser. Ogni spazio che
  le attiva ha un proprio indirizzo push, quindi nessun relay riceve mai quello di un altro spazio, e l’indirizzo non
  lega i tuoi spazi tra loro. Per questo ognuno di quegli spazi ha un proprio service worker nel browser: chi può vedere
  le impostazioni del browser può contarli, e quindi quanti spazi hanno le notifiche attive. Una richiesta di messaggio
  da qualcuno di nuovo, tramite il tuo link di contatto, potrebbe comparire solo quando Erevos si apre. Il numero
  sull’icona compare anche su un Mac con «Aggiungi al Dock» di Safari, e nella web app installata da Chrome o Edge su
  Windows, macOS o ChromeOS. Nessun banner **Nuovo messaggio** compare sopra Erevos mentre è aperto sullo schermo. La
  schermata **Notifiche ad app chiusa** dice quando il browser o il telefono non le consentono e, dopo che le hai
  disattivate, quando il tuo relay non ha ancora potuto essere avvisato e potrebbe ancora inviarne una: Erevos glielo
  dice appena riesce a raggiungerlo. Quando il browser cambia il suo indirizzo push, o il servizio push lo lascia
  cadere, Erevos dà da solo al tuo relay il nuovo quando torna sullo schermo.
- **Autorizzazioni:** in Erevos, **Impostazioni** → **Generali** → **Autorizzazioni** mostra che cosa il browser
  permette a Erevos di fare: se funziona dalla schermata Home, le notifiche ad app chiusa (necessarie una volta che
  questo spazio le ha attivate), il microfono per le chiamate, la fotocamera per le videochiamate, e se il browser
  conserva per sempre i dati di Erevos. Senza questo, Safari potrebbe cancellare i dati quando l’iPhone ha poco spazio,
  quindi un backup è la rete di sicurezza. Ognuna ha il suo perché, e un pulsante con la domanda del browser stesso;
  dove il browser non chiede più, dice dov’è l’impostazione (**Impostazioni
  → Notifiche → Erevos**, o **Impostazioni → App → Safari → Microfono**). Legge solo quello che dice il browser. Un
  browser non lascia leggere a Erevos il risparmio energetico o la modalità Risparmio energetico, quindi non ci sono.
  Dopo ogni nuova versione firmata si apre da sola quando manca qualcosa di cui hanno bisogno i messaggi, le chiamate o
  i dati. In un altro browser (Chrome, Firefox) è lo stesso, con le impostazioni di quel browser.
- **I backup** si fanno a mano: **Crea un backup** salva il backup e i suoi file tramite il menu di condivisione (File, iCloud Drive o
  un’altra app). Un browser consegna un file solo dopo un tocco, quindi non ci sono backup automatici.
- **I messaggi vocali** registrati su un iPhone sono AAC; si riproducono ovunque.
- **Apple** fa Safari e potrebbe cambiarlo, come con qualsiasi app su un iPhone.

## Su Sailfish OS {#sailfish}

Su un telefono Sailfish OS Erevos è un’app a sé: la stessa app del browser, mostrata dal motore del browser di Sailfish
dentro una finestra Sailfish, con il suo codice installato con l’app e non scaricato da un server. Chatta tramite un
relay, crittografato end-to-end come sul telefono, e conserva i suoi contatti, messaggi e impostazioni sigillati allo
stesso modo.

1. Consenti le app esterne al Jolla Store: **Impostazioni → Software non attendibile → Consenti software non
   attendibile**.
2. Copia \`erevos-sailfish-aarch64.rpm\` sul telefono (Downloads) e toccalo in **File**, poi **Installa**. Da un
   terminale (modalità sviluppatore) è \`pkcon install-local erevos-sailfish-aarch64.rpm\`. Richiede Sailfish OS 5
   nella sua versione a 64 bit (aarch64).
3. Imposta un blocco con password (in Erevos, **Impostazioni** → **Privacy e sicurezza** → **Blocco e seconda
   password**). Vedi più sotto perché qui conta.
4. Imposta il relay e aggiungi i contatti come sul telefono, vedi [Chat tramite un relay](#relay).

- **Quello che fa solo Android:** Bluetooth, Wi-Fi Aware, Wi-Fi Direct{~, LoRa e gli SMS| e LoRa}. La stessa rete Wi-Fi funziona
  anche qui, come su un computer: vedi [Chat con un telefono vicino](#nearby). Il firewall di Sailfish OS lascia già
  entrare la sua porta, la 47905: solo un firewall che hai reso più severo tu ha bisogno di una regola per essa. Il
  resto è uguale: spazi e seconda password, chat nascoste, messaggi vocali, chat importate e backup.
- **Dove conserva le cose:** in \`~/.local/share/erevos\` sul telefono, sigillate come sul telefono. Sailfish non ha un
  portachiavi per le app, quindi l’archivio di chiavi è conservato lì così com’è, leggibile dal tuo utente, e quindi
  da qualsiasi app che gira come te: è il blocco con password che lo sigilla.
- **I backup** vanno in \`Documents/Erevos\` sul telefono, a mano o ogni giorno; copiali da lì su una scheda di
  memoria o su un altro dispositivo. **Salva** mette una foto o un file in Downloads.
- **Le chiamate** squillano mentre Erevos si vede, con una suoneria sua: due squilli brevi ogni 3 secondi, e il
  telefono vibra dove può, finché la chiamata non riceve risposta o finisce. Una chiamata che arriva prima che tu abbia
  toccato Erevos da quando si è aperto può comparire senza suono.
- **Mentre è chiuso:** con uno spazio aperto, un piccolo aiutante di Erevos aspetta sul relay mentre Erevos non si
  vede o è chiuso, e non prende nulla. Una notifica dice solo quanti messaggi sono arrivati, mai da chi né cosa, e una
  chiamata suona con la suoneria del telefono, come la imposta il suo profilo, per 45 secondi al massimo; un tocco su
  una delle due apre Erevos. Le chat nascoste allora non dicono nulla. Bloccare lo spazio lo ferma, e dopo un riavvio
  del telefono torna ad aspettare solo quando Erevos apre lo spazio. Come il resto di Erevos qui, va diretto, senza
  Tor. Ogni attesa sveglia il telefono circa una volta al minuto, come su Android.
- **Provato finora** sul motore del browser di Sailfish (Gecko 91) su un computer, chattando con un browser tramite un
  relay. La stessa rete Wi-Fi è stata provata contro quella del computer, su un computer. Non ancora su un telefono
  Sailfish.

## Aggiornamenti {#updates}

Erevos chiede gli aggiornamenti a GitHub solo quando tocchi il pulsante, come in Fasouli: un controllo regolare
direbbe a GitHub, ogni giorno, che questo telefono o computer ha {=Erevos}. Su Android ti dice anche quando esce una nuova
versione, senza chiedere a GitHub, come spiega **Avvisato quando esce una nuova versione** più sotto. Per aggiornare:

1. Apri **Impostazioni** → **Generali** → **Aggiornamenti** (o **Cerca aggiornamenti** in fondo alla prima schermata
   di questa guida).
   Mostra la versione che hai, come **Erevos 2.0.0**.
2. Tocca **Cerca aggiornamenti**. GitHub vede allora l’indirizzo internet di questo dispositivo, nient’altro; su
   Android lo vede anche il server della web app, che contiene la firma dell’aggiornamento fatta dal computer delle
   versioni. Mentre tutto nello
   spazio passa da Tor (**Tutto** in Tor), Erevos non controlla, perché aggirerebbe Tor.
   Con **Tramite Tor** attivo, in questa schermata (disattivato finché non lo attivi), interroga solo il server
   dell’app web, tramite Tor, e non GitHub: GitHub non viene interrogato e nulla vede l’indirizzo. È più lento e
   aspetta mentre Tor si avvia; e funziona anche mentre tutto nello spazio passa da Tor.
3. Quando c’è una nuova versione: su Android tocca **Installa**. Si scarica, viene controllata rispetto alla versione
   pubblicata (la sua dimensione e lo SHA-256), e si apre il programma di installazione di Android: tocca lì
   **Installa**. Erevos la offre solo dopo che il computer delle versioni, che tiene la sua chiave offline, ha firmato
   quella build e il suo SHA-256: chi prendesse il controllo del solo account GitHub non potrebbe far installare un
   suo APK. Fino ad allora dice che la versione è uscita ma non è ancora firmata. Quando il server della web app non è
   raggiungibile lo dice, con il motivo, e quando la firma lì non corrisponde dice questo: in entrambi i casi non si
   installa nulla. Un download la cui connessione non porta nulla per un po’ riparte da solo dall’inizio, tre volte in
   tutto; poi Erevos lo dice e non si installa nulla. La prima volta, Android chiede di consentire l’installazione di
   app da Erevos. Su un computer e su Sailfish OS, **Apri la pagina di download** apre la pagina delle versioni:
   prendi il file che Erevos indica, quello del pacchetto che hai, e aggiorna come nella tabella qui sotto.
   Tramite Tor una nuova versione viene segnalata, ma non si scarica qui, perché il suo pacchetto è più grande di
   quanto accetti il Tor di Erevos: disattiva **Tramite Tor** per un momento per installarla, oppure scaricala dalla
   pagina delle versioni in Tor Browser.

Una versione come **4.0.0-rc.1** è una versione di prova prima della 4.0.0 (una release candidate): si installa e si
aggiorna come ogni altra, e la 4.0.0 arriva dopo.

### Erevos, Erevos+ o Erevos Lite, e beta {#update-channel}

Su Android, **Aggiornamenti** dice anche quali versioni sono proposte a questo telefono:

- **Prossimo aggiornamento**: **Erevos Lite** (le chat e chiamate proprie di Erevos, nient'altro; versioni 3.2.x),
  **Erevos** (le sue chat, il Telefono, gli SMS e la Collezione; versioni 3.0.x) o **Erevos+** (tutto questo, con
  Telegram, Messenger, Signal, Session, Matrix, XMPP e Nostr; versioni 3.1.x). All'inizio è scelta quella che hai.
  Ognuna è un'app a sé, con i suoi dati, quindi sceglierne un'altra è un passaggio, non un aggiornamento: **Cerca
  aggiornamenti** la trova e chiede **Passa a …**. Questo Erevos fa allora una copia di tutto, cifrata, qui sul
  telefono (ogni spazio, con i suoi contatti, messaggi e impostazioni), e Android installa l'altra app accanto a
  questa, se non c'è già. Aprila entro un giorno: chiede se portare le tue chat e le prende; niente lascia il
  telefono. Gli spazi si aprono poi con le loro password, come dopo ogni ripristino. Gli SMS e le chiamate del
  telefono restano nel telefono: rendi la nuova app l'app per SMS e telefono, se li usi. Da quando il passaggio è
  fatto, la vecchia app non riceve né invia nulla e mostra solo il passaggio, così nessun messaggio resta lì senza che
  la nuova lo abbia; **Annulla il passaggio** la riapre come prima. Quando la nuova lo prende, la vecchia offre
  **Cancella tutto qui** e **Disinstalla**; un passaggio non preso entro un giorno viene cancellato, e la vecchia app
  si apre come prima. Anche una nuova app già configurata chiede, e ciò che porta prende il posto di tutto ciò che ha.
  Il passaggio richiede spazio libero sul telefono per una copia di tutto: Erevos lo dice prima se non basta. La
  versione F-Droid, firmata con un'altra chiave, non può passare così: usa invece i [Backup](#backup).
- **Versioni beta**: disattivato, sono proposte solo le versioni normali. Attivato, anche le beta (come
  **7.0.1-beta.1**): escono prima, per provare, e possono avere problemi. Una beta lo ha attivato all’inizio.
  Disattivalo per uscire dalle beta: la prossima versione normale con un numero di build più alto della beta che hai si
  installa sopra e tiene tutto, senza disinstallare.

Da Erevos+ arrivano anche le reti: Telegram, Signal, Session, Messenger e Matrix restano collegati nella nuova app,
come prima (le foto e i file di Telegram si scaricano di nuovo quando li apri, e la pagina di Messenger chiede il suo
PIN ancora una volta). Erevos ed Erevos Lite non hanno Telegram, Messenger, Signal né Session: traslocare verso di
loro lascia quegli account nel vecchio Erevos+, che poi non apre più nulla, quindi se usi Session annota prima le sue
13 parole di recupero.

Erevos+ richiede Android 8.0 o successivo: su un telefono più vecchio non si può scegliere, e il telefono resta su
Erevos.

L’avviso di una nuova versione segue la stessa scelta. Il computer delle versioni firma ogni edizione e le sue beta a
parte, così una non si installa mai come un’altra.

### Novità {#whats-new}

**Impostazioni** → **Generali** → **Novità** (anche **Novità** in **Aggiornamenti**) dice in breve che cosa ha
cambiato ogni versione, dalla più recente, con il solo numero; la versione che hai dice **Questa versione**. Ogni
versione aggiunge la sua. Il CHANGELOG del codice sorgente racconta ogni modifica per intero.
Ogni versione, lì come qui, dice prima cosa cambia **Per te**, ciò che vedi e usi, poi cosa è cambiato **Sotto il
cofano**: correzioni, velocità, batteria e sicurezza all’interno.

### Avvisato quando esce una nuova versione {#release-notice}

Su Android, una volta al giorno, Erevos chiede al server di LPHL, che gestisce anche il relay, se è uscita una nuova
versione. Quando è uscita,
**Erevos** appare in cima alle chat, fissato, con la sua icona: **È uscito Erevos 3.3.0. Tocca per vedere le novità e
aggiornare.**, segnato finché non lo apri, e anche una notifica dice **Erevos 3.3.0 is out**. Tocca l’uno o l’altra
per **Aggiornamenti**, poi **Cerca aggiornamenti**. Se ne va appena hai quella versione.

- **Solo se firmata:** conta solo dopo che il computer delle versioni ha firmato sia la build sia il suo nome, la
  stessa firma che permette ad **Aggiornamenti** di installarla. Così arriva appena quella versione si può installare,
  e il server da solo non può inventarne una.
- **Solo sul relay di LPHL:** uno spazio chiede solo mentre usa il relay di LPHL e non manda tutto tramite Tor
  (**Tutto** in Tor): il server allora non vede nulla che non veda già. Uno spazio su un altro relay, o senza relay,
  non chiede nulla; lì te lo dice **Cerca aggiornamenti**.
  L’interruttore **Tramite Tor** in **Aggiornamenti**, uno per questa notifica e per **Cerca aggiornamenti**, solo su
  questo telefono, la fa chiedere tramite Tor: il server allora non vede l’indirizzo del telefono, e anche uno spazio
  che manda tutto tramite Tor chiede. Una nuova versione viene segnalata, ma si installa solo con l’interruttore
  disattivato.
- **Per disattivarlo:** **Impostazioni** → **Generali** → **Aggiornamenti** → **Avvisami quando esce una nuova
  versione**.
- Funziona dalla versione che ce l’ha: quella precedente non dice nulla. Non nella build di F-Droid, che aggiorna
  F-Droid.

**Perché:** così nessuno deve cercare su GitHub, una per una, ogni nuova versione, e GitHub non sa mai quali telefoni
hanno Erevos: il server interpellato è quello con cui il telefono parla già, e quello che dice conta solo con la firma
del computer delle versioni, tenuta offline.

Il resto di questa sezione riguarda l’aggiornamento a mano.

**Dove sono le nuove versioni:** nella pagina delle versioni di Erevos,
\`https://github.com/azzinder/erevos-releases/releases\`. La più recente è in cima, come **Erevos 2.0.0**, con un
file per ogni sistema. Lì restano le cinque più recenti.

**Controlla il file** se puoi, su un computer: ogni versione ha \`SHA256SUMS\`, e nella cartella con i file scaricati
\`sha256sum -c --ignore-missing SHA256SUMS\` deve dire **OK** per ognuno.

**Fai prima un backup** (**Impostazioni** → **Dati e dispositivi** → **Backup** → **Crea un backup**), vedi
[Backup](#backup). Un aggiornamento conserva tutto, ma un backup costa un minuto e copre ogni sorpresa.

| Su | Come aggiornare |
| --- | --- |
| **Android** | **Impostazioni** → **Generali** → **Aggiornamenti** → **Cerca aggiornamenti** → **Installa**, o a mano: apri la pagina delle versioni sul telefono, tocca \`erevos-android.apk\`, poi **Installa**. Si installa sopra quello che hai e conserva tutto. Consenti una volta l’installazione dal browser, quando Android lo chiede. |
| **Linux, basato su Arch** | \`sudo pacman -U erevos-linux-x86_64.pacman\` |
| **Linux, AppImage** | Sostituisci il vecchio \`erevos-linux-x86_64.AppImage\` con quello nuovo e rendilo eseguibile. |
| **macOS** | Apri \`erevos-macos.dmg\` e trascina Erevos in Applicazioni, **Sostituisci**. Poi consentilo di nuovo in **Impostazioni di Sistema → Privacy e sicurezza → Apri comunque**. |
| **Windows, installato** | Chiudi Erevos ed esegui il nuovo \`erevos-windows-x64-setup.exe\`: si installa sopra quello che hai. Windows potrebbe avvisare di nuovo: **Ulteriori informazioni**, poi **Esegui comunque**. |
| **Windows, portatile** | Chiudi Erevos e metti il nuovo \`erevos-windows-x64-portable.exe\` al posto di quello vecchio. |
| **Sailfish OS** | Tocca \`erevos-sailfish-aarch64.rpm\` in **File**, poi **Installa**, o \`pkcon install-local erevos-sailfish-aarch64.rpm\`. |
| **iPhone, browser** | Niente da fare: la web app prende da sola una nuova versione firmata quando si apre, vedi [Su iPhone](#iphone). |

- **Contatti, chat e impostazioni restano** su ogni sistema: vivono nella cartella di Erevos, non nell’app.
- **Android, la prima volta dalla pagina delle versioni:** un Erevos compilato su un computer per i test è firmato con
  un’altra chiave, e Android rifiuta di installarci sopra (**App non installata**). Fai un backup, disinstalla {=Erevos},
  installa quello della pagina delle versioni e ripristina il backup. Dopo di che, ogni aggiornamento si installa
  sopra.
- **{=Erevos} da F-Droid**, quando ci sarà, viene aggiornato da F-Droid: i suoi **Aggiornamenti** mostrano la versione e
  lo dicono, senza **Cerca aggiornamenti**. F-Droid lo firma con una sua chiave, quindi Android non installa né questo
  sopra l’Erevos della pagina delle versioni né quello sopra questo. Per passare dall’uno all’altro: fai un backup,
  disinstalla {=Erevos}, installa l’altro e ripristina il backup.
- **Mai più vecchio:** non installare una versione più vecchia sopra una più recente. I suoi dati potrebbero essere in
  una forma che quella più vecchia non sa leggere. Ripristina invece un backup fatto con quella versione più vecchia.
- **Una versione a cui manca il tuo sistema** lo dice nelle sue note: quella build non è riuscita, quindi prendi la
  versione precedente.

## Erevos a un telefono vicino {#give-app}

Senza internet, un telefono Android con {=Erevos} può darlo a un telefono accanto, in **Impostazioni** → **Generali** →
**Dai Erevos a un telefono vicino** (anche in **Aggiornamenti**). I due telefoni devono essere sulla stessa Wi-Fi, o
l’altro sull’hotspot di questo: attiva prima l’hotspot nelle impostazioni di Android.

1. **Sul telefono che lo dà:** tocca **Avvia**. Compare un codice QR, con la dimensione del pacchetto, e sotto gli
   indirizzi da scrivere invece in un browser.
2. **Su un telefono senza {=Erevos}:** inquadra il codice con la sua fotocamera. Il suo browser apre una pagina, servita
   dal telefono che lo dà, con **Scarica {=Erevos}**: scaricalo e apri il file, e Android lo installa. La prima volta,
   Android chiede di consentire l’installazione di app da quel browser. La pagina mostra lo SHA-256 del pacchetto e
   quello del suo certificato: devono essere quelli che il telefono che lo dà mostra in **Da confrontare**.
3. **Su un telefono con un {=Erevos} più vecchio:** apri invece **Impostazioni** → **Generali** → **Aggiornamenti** →
   **Da un telefono vicino** e fotografa il codice. Erevos scarica il pacchetto e apre il programma di installazione
   di Android solo se il suo SHA-256 è quello del codice, se è Erevos, firmato con lo stesso certificato dell’Erevos
   lì, e più recente.

- **Per quanto:** il telefono che lo dà lo serve finché si vede la sua schermata, dieci minuti al massimo, e si ferma
  prima con **Ferma**. Risponde solo a un indirizzo casuale che nessuno indovina, solo ai telefoni della sua rete, e
  con nient’altro che il pacchetto e la sua pagina: nessuna chat, contatto o impostazione va con esso.
- **Cosa non può controllare per te:** il browser scarica soltanto. Un telefono con un Erevos modificato mostrerebbe
  il proprio certificato, quindi appena hai internet confronta il certificato con quello del sito o della pagina delle
  versioni di Erevos. Erevos stesso, in **Aggiornamenti**, rifiuta un pacchetto firmato diversamente.
- **Non da uno store:** un {=Erevos} installato in parti, come fanno alcuni store, non può essere dato per intero e lo
  dice. L’{=Erevos} di F-Droid è firmato da F-Droid: può andare a un telefono senza {=Erevos}, o sopra l’Erevos di F-Droid
  tramite il browser, ma un Erevos dalla pagina delle versioni lo rifiuta in **Aggiornamenti**, come farebbe Android.
  L’Erevos di F-Droid non prende nulla in **Aggiornamenti**: lo aggiorna F-Droid.
- Solo su Android. Chiunque sulla stessa rete veda il codice può scaricare anche lui Erevos; non c’è altro da prendere.

**Perché:** dove internet è tagliato, o sorvegliato, o un telefono non raggiunge nemmeno il sito, Erevos può comunque
passare di mano in mano, e il telefono che lo riceve può controllare che sia quello vero.

## Le schermate di test {#tests}

Due schermate in **Impostazioni** → **Per i test** servono a provare i collegamenti, passo per passo.

- **Test radio (Android):** **Autorizzazioni** chiede ad Android quello che serve alla radio, **Avvia** e **Ferma**
  accendono e spengono Bluetooth e Wi-Fi Aware, **Invia ciao** invia un semplice messaggio di prova al Test radio del
  telefono vicino (una chat non lo mostra), e il **Registro** mostra cosa è successo.
- **Test del relay (Wi-Fi):** **Crea coda** crea una coda su un relay e mostra due id. Dai l’**ID mittente** al
  telefono che ti scrive, e tieni privato l’**ID destinatario**. **Invia** e **Ricevi** spostano i messaggi a mano.

> Con un solo telefono puoi comunque provare una chat tramite il relay: le tue chat e le tue **Chat nascoste** hanno
> ognuna la sua coda sul relay e le sue chiavi. Crea entrambe le code sullo stesso relay, tocca **Condividi il mio link
> di contatto** in una e copialo, poi aggiungilo nell’altra, e scrivi in entrambe le direzioni. Il link della chat
> stessa viene rifiutato come contatto.

## Che cosa è protetto oggi {#privacy}

Erevos dice chiaramente che cosa protegge e che cosa non protegge, ancora.

| Che cosa | Oggi | In arrivo |
| --- | --- | --- |
| **Account, numero di telefono, email** | Non servono. I contatti sono coppie di code a senso unico sul relay. | |
| **Contatti e i loro nomi, chiavi, impostazioni del relay, aspetto** | Sigillati sul telefono con la chiave di ogni spazio. | |
| **Messaggi tramite un relay** | Crittografati end-to-end: PQXDH con ML-KEM-768 all’inizio, poi il double ratchet. Il relay non può leggerli, e appena entrambi i telefoni hanno ricevuto un messaggio l’uno dall’altro non può nemmeno distinguerli per conversazione: ognuno è sigillato un’altra volta per il telefono a cui va. Vede quali sono messaggi che qualcuno legge, quali sono comunicazioni tra telefoni, e quali sono chiamate che squillano, come dice ognuno. Non ancora sottoposti ad audit. | Un audit esterno. |
| **Messaggi a un telefono vicino** | Crittografati end-to-end, come tramite il relay. Chi ascolta da vicino può capire che dei telefoni con {=Erevos} sono vicini tra loro, e quando e quanto inviano; sulla stessa rete Wi-Fi, può farlo chiunque vi sia collegato, e via Wi-Fi Direct chiunque entri nella rete Wi-Fi creata dai telefoni. Finché il telefono del tuo contatto non è noto, gli altri telefoni con {=Erevos} collegati da vicino ricevono i tuoi messaggi brevi, sigillati. | |
| **Messaggi trasportati da altri telefoni** | Sigillati due volte: end-to-end per il tuo contatto, e per il suo relay. Un telefono che ne trasporta uno vede a quale relay va, quando, e quanto è grande; non da chi viene o per chi è. Il suo relay vede a quale relay va, e quel relay vede il relay di chi lo trasporta, non il suo telefono. Conservati sigillati sul telefono, al massimo tre giorni: quelli per altri in un file del telefono, la cui dimensione mostra più o meno quanti sono; i tuoi nel tuo spazio, sigillati con la sua chiave. Le chat nascoste non vengono mai trasportate. | |
| **Messaggi via LoRa** | Crittografati end-to-end, come tramite il relay. Chiunque abbia una radio, a chilometri di distanza, può capire che la tua trasmette, quando e quanto, e il suo segnale può essere seguito fino a dove si trova. Erevos impedisce alla tua radio di annunciare il suo nome e dove si trova (ruolo Client hidden, GPS spento, nessuna posizione fissa) a meno che tu non lo permetta; risponde comunque a una radio che chiede il suo nome. Ogni Erevos sulla mesh riceve i tuoi messaggi LoRa, sigillati. | Impostare il nome della radio da Erevos. |
[~] | **Messaggi via SMS, quando nient’altro funziona** | Crittografati end-to-end, come tramite il relay, in SMS dati nascosti. Disattivato finché non lo attivi. L’operatore vede quale numero ha scritto a quale, quando e quanti SMS; mai cosa è stato scritto. Ognuno costa quanto un SMS. | |
| **Chi parla con chi** | Il relay vede gli indirizzi IP, gli id delle code, e quando e quanto. Con un secondo relay, il tuo relay non vede mai il tuo indirizzo. Da un posto prestato sul relay di un contatto, ogni relay a cui invii lo vede. [Tramite Tor](#tor), una volta che lo attivi, con **Messaggi** nessun relay lo vede per quello che scrivi, e con **Tutto** anche per immagini e file; con i bridge, per dove Tor è bloccato, la rete vede solo un bridge. Il broker di Snowflake e i server STUN vedono il tuo indirizzo. | Tor su computer. |
| **La connessione al relay** | TLS e, al suo interno, una volta nota la chiave del relay, un canale verso quella chiave: il relay dimostra di averla a ogni connessione, e il token e ogni richiesta viaggiano crittografati per essa, così qualcuno nel mezzo con un certificato per il nome del relay non può spacciarsi per lui. Un relay che ha dimostrato la sua chiave una volta non viene mai più raggiunto senza di essa. Un relay più vecchio di questa app funziona come prima, e **Come ti colleghi ora** lo dice. La prima chiave arriva dal relay la prima volta che gli viene chiesta, o da un link di contatto: chi è nel mezzo proprio quella prima volta potrebbe darne una sua. [La chiave del relay](#relay). Non sottoposta ad audit. | La chiave del nostro relay integrata nell’app, e negli inviti. |
| **Testi tramite Nostr** | Crittografati end-to-end come tramite un relay, poi avvolti un’altra volta per una chiave che il tuo contatto ha dato solo a quella chat, firmati da una chiave creata solo per quel testo. I relay Nostr vedono quando e quanto è grande, e che una chiave che non nomina nessuno riceve un testo; il tuo telefono legge tutte le sue chiavi su un’unica connessione, tramite Tor quando Tor è attivo, quindi un relay può capire che vengono lette insieme, e da dove solo con Tor spento. Il tuo relay li vede solo come riserva, e un campanello per le chat nascoste. [Tramite Nostr](#nostr). | |
[~] | **SMS** | Un SMS normale viene letto dall’operatore telefonico, come ogni SMS. A un numero collegato a un contatto Erevos passa invece da Erevos. Un invito nascosto è un SMS breve in più che l’operatore telefonico vede. | |
| **I contatti del telefono** | Nei contatti di Android stesso, non sigillati da Erevos, come con ogni app per i contatti: ogni app autorizzata a leggerli li vede, e un account (Google) può sincronizzarli. Erevos non li invia da nessuna parte. Un file .vcf salvato da questi è fuori da Erevos, non sigillato.{~ Le chiamate e gli SMS di un contatto vengono letti dal registro chiamate e dagli SMS del telefono solo per mostrare la sua cronologia, e non vengono conservati da nessuna parte.} | |
| **Contatti salvati solo in Erevos** | Sigillati con la chiave dello spazio, o con quella delle chat nascoste per i loro, in un unico file per tutti gli spazi la cui dimensione mostra più o meno quanti sono in tutto, non di chi sono; le loro foto ognuna in un file a sé. Mai nei contatti di Android. Un file .vcf salvato da questi, anche quelli delle chat nascoste, è fuori da Erevos, non crittografato. Le chiamate{~ e gli SMS} verso di loro passano dal telefono, e appaiono nel suo registro chiamate{~ e nei suoi SMS}. | |
[~] | **Chiamate telefoniche** | Normali chiamate telefoniche: le trasporta l’operatore telefonico, che può ascoltarle, come con ogni app Telefono. Android conserva la cronologia delle chiamate, non sigillata da Erevos, come per ogni app Telefono; Erevos la legge, insieme ai preferiti, per mostrarli, ne elimina solo le chiamate che elimini tu, e non ne conserva una copia. La SIM scelta per ogni numero è sigillata nello spazio; le risposte rapide, e quello che è bloccato (solo prefissi, id dei gruppi e orari, uguali per ogni spazio), sono conservati sul telefono, non sigillati. | |
| **Chat importate** | Sigillate nello spazio in cui sono state portate, anche le loro foto e i loro file, ognuno nei suoi pezzi come il file di una chat. La dimensione del file, e quanti pezzi ci sono, dicono più o meno quanto è stato importato, non dove. | Foto e file di Viber, e file oltre 4 GB. |
| **Cronologia dei messaggi** | Conservata sul telefono, sigillata nel suo spazio, senza limiti, in pagine della stessa dimensione mescolate per tutti gli spazi. Si vede solo quanto occupa tutto insieme, non a quale spazio appartiene. L’eliminazione su entrambi i telefoni, e i messaggi effimeri, dipendono dall’Erevos dell’altro telefono. | |
| **Messaggi da vicino** | Si aprono solo nello spazio che ha il contatto. Uno per un altro spazio aspetta in memoria, al massimo sei ore, finché quello spazio non si apre. Uno per le chat nascoste si apre solo mentre sono aperte, o ricevono da chiuse, e lo spazio non sa mai che uno dei loro contatti è vicino. | |
| **Messaggi vocali** | Crittografati end-to-end tramite il relay o da vicino, in pezzi: il relay, o chi ascolta da vicino, può capire più o meno quanto dura ognuno. Ogni suono è sigillato in un file a sé; quanti file ci sono, e le loro dimensioni, mostrano più o meno quanti ne sono conservati, non in quale spazio. Dissigillati nella cache solo durante la riproduzione. | File audio tutti della stessa dimensione. |
| **Foto e file** | Crittografati end-to-end, tramite l’archivio di file del relay, in pezzi della stessa dimensione: il relay vede quanti e quando, quindi più o meno quanto sono grandi. Il tuo relay vede il tuo indirizzo, come per i messaggi; il contatto li prende tramite il suo relay. Le foto perdono luogo, telefono e ora, a meno che non vengano inviate come file; un file conserva quello che dice al suo interno. Sigillati sul telefono nei loro pezzi, mostrati dalla memoria. Le copie salvate sono fuori da Erevos. I backup li contengono, sigillati con la password del backup, in file a parte. | |
| **Su un computer** | Sigillato come sul telefono, nella cartella dell’app. Il suo archivio di chiavi è sigillato con il portachiavi del sistema (su Windows, la chiave del tuo account); su un sistema Linux senza portachiavi, Erevos non conserva nulla a meno che non venga avviato con \`--plain-secrets\`, e allora lo conserva così com’è. | |
| **Backup** | Sigillati con una loro password, contengono ogni spazio così come è sigillato sul telefono, con le sue foto, i file e i messaggi vocali in file a parte accanto al backup. I loro nomi dicono che sono un backup di Erevos, e il loro numero e la loro dimensione mostrano più o meno quanto viene conservato. I backup automatici conservano la loro password sul telefono. Inviati a un server solo se ne aggiungi uno: byte casuali con nomi casuali, di dimensioni arrotondate; il server vede il tuo account e quando, e il tuo indirizzo a meno che non passino per Tor. | |
| **Segni ✓✓ e ✓✓✓** | Il telefono del contatto sa quando il tuo ha ricevuto e letto i suoi messaggi, in modo crittografato. In un gruppo non pubblico, lo sa anche il telefono di chi ha mandato il messaggio. Il relay, o chi ascolta da vicino, vede un piccolo messaggio in più. | Un interruttore per non dire più quando leggi. |
| **Impronta o volto (Android)** | Disattivato finché non lo attivi. Apre solo lo spazio della prima password: la sua chiave è sigillata nell’Android Keystore, utilizzabile solo subito dopo un controllo forte dell’impronta o del volto, e scartata quando questi cambiano. Qualcuno che ti trattiene può usare il tuo dito. | |
| **Notifiche (Android)** | In background: «Erevos – Ready for calls and messages» (non sulla schermata di blocco), «Incoming call» o «Incoming video call» – «Open Erevos to answer», e «New message» o quanti ne sono arrivati; quando Android o la password lo fermano, «Closed by Android» o «Locked» – «Open it to receive calls and messages again»; un promemoria, «Reminder» o quanti; una nuova versione, «Erevos X is out». Mai chi o cosa. A telefono bloccato quella dei messaggi dice solo «Erevos». Le chat nascoste a cui è permesso dirlo mostrano la stessa notifica, contata con il resto: chi la vede e non trova niente di nuovo può immaginare che ce ne siano altre. Come app Telefono, la notifica di una chiamata telefonica dice chi chiama, anche sulla schermata di blocco, come fa quella di ogni app Telefono, ma mai con un nome che conoscono solo le chat nascoste: una chiamata da uno dei loro contatti mostra il numero. | |
| **Widget{~ e Telefono} (Android)** | Il widget, una volta aggiunto, mostra quant{~e chiamate perse, SMS non letti e |i }nuovi messaggi ci sono, mai chi o cosa.{~ Il Telefono si apre senza password solo se lo permetti: allora chiunque abbia in mano il telefono sbloccato vede le chiamate e i preferiti che Android conserva, con i soli nomi dei contatti del telefono.} | |
| **Chiamate** | Crittografate end-to-end (DTLS-SRTP, con la chiave inviata nella chat crittografata). Tramite il relay per le chiamate, nessuno dei due telefoni vede l’indirizzo IP dell’altro; il server che lo fa funzionare li vede entrambi, quando e per quanto tempo, e quanto passa. Senza un relay per le chiamate, solo sulla stessa rete Wi-Fi, ogni telefono vede l’indirizzo dell’altro. I relay vedono quando una chiamata inizia a squillare. | Squillo nella web app da chiusa. Chiamate via Bluetooth (lì funziona il walkie-talkie). |
| **Chat di gruppo** | Crittografate end-to-end con MLS (RFC 9420); i membri rimossi non leggono più nulla dopo. La copia di ogni membro è sigillata a parte, quindi i relay non possono capire chi fa parte di un gruppo; ogni relay vede comunque un messaggio arrivare a una coda. I membri vedono le chiavi e gli indirizzi dei relay gli uni degli altri. Foto, file e messaggi vocali passano dall’archivio di file del relay di chi invia, come verso un contatto, e restano lì 14 giorni. Non sottoposte ad audit. | |
| **Chiamate di gruppo** | Voce e video, crittografati end-to-end tra ogni coppia di telefoni nella chiamata (DTLS-SRTP, con le chiavi inviate nella crittografia del gruppo). Tramite il relay per le chiamate, nessun telefono vede l’indirizzo IP di un altro; il server che lo fa funzionare vede quello di ogni telefono, quando e per quanto tempo, e quanto passa. Ogni membro, nella chiamata o no, sa chi ne fa parte. I relay vedono quando ne inizia una. | Video con più di quattro persone, tramite un server; più di otto persone. |
| **Gruppi pubblici** | Come le chat di gruppo, e chiunque abbia il link può chiedere di entrare e leggere da quando viene fatto entrare. Le richieste arrivano al relay del proprietario sigillate per il telefono del proprietario: il relay vede quante e quando, non da chi. I membri vedono gli uni degli altri i nomi scelti, le chiavi create solo per quel gruppo, gli indirizzi dei relay e gli ID mittente delle code. Non sottoposti ad audit. | |
| **Anteprime dei link** | Disattivate finché non le attivi. Allora, mentre invii un link, il tuo telefono scarica la sua pagina direttamente dal sito, che vede il tuo indirizzo IP e quando, non per chi è il messaggio. L’anteprima va dentro il messaggio crittografato; il telefono che la riceve non scarica nulla. Con **Tramite Tor** attivo, la pagina viene scaricata solo tramite Tor e il sito non vede il tuo indirizzo IP. Nessuna mentre lo spazio manda tutto tramite Tor, a meno che **Tramite Tor** sia attivo; nelle chat nascoste solo con l’interruttore del loro posto. | |

## Trasparenza {#transparency}

Che cosa conserva il server dietro Erevos (lphl.nekten.eu), e che cosa gli è stato chiesto. Questa pagina esce
dentro ogni versione, quindi è firmata con la versione, come l’app.

**Richieste delle autorità.** Alla data di questa versione: nessuna. Nessuna autorità, tribunale o azienda ha chiesto
dati su chi usa {=Erevos}, e a nessuno è stato chiesto di tacere su una richiesta del genere. Se un giorno questo
paragrafo sparisce, o non dice più «nessuna», prendilo come un segnale. **Perché:** una richiesta che arriva con
l’ordine di tacere non si può raccontare, ma una frase che smette di essere scritta si può notare. Funziona solo finché
viene rinnovata: ogni versione la ripete.

Che cosa conserva il relay, e per quanto tempo:

| Che cosa | Per quanto tempo |
| --- | --- |
| **Messaggi in attesa**, crittografati end-to-end | Finché non vengono presi, al massimo 14 giorni. |
| **Foto e file**, crittografati, in pezzi | Come i messaggi: finché non vengono presi, al massimo 14 giorni. |
| **Messaggi inviati per dopo**, crittografati | Finché non arriva la loro ora. |
| **Code**, id casuali senza nome | Finché il loro telefono non le ha usate per 180 giorni. |
| **Righe di accesso**: per ogni telefono, lo SHA-256 del suo token e un nome: lettere e cifre a caso per uno invitato da Erevos 6.0.0 in poi (prima, quello scritto da chi l’ha invitato), o il nome utente LPHL per chi ha fatto l’accesso con LPHL | Finché la riga non viene tolta. |
| **Indirizzi push della web app**, per le notifiche mentre la web app è chiusa | Finché non vengono disattivati nella web app. |

Che cosa non conserva:

- **Nessun elenco delle connessioni.** Il relay non scrive nessun log di chi si è collegato o quando, e il server web
  davanti al relay e alla web app non tiene nessun log degli accessi dal 24 ottobre 2026. Gli errori vengono
  registrati, e un errore può nominare un indirizzo.
- **Nessun contatto, nome o numero di telefono.** Non ne ha nessuno da conservare.

Che cosa vede comunque mentre è in funzione: gli indirizzi IP che si collegano, quando i messaggi arrivano e partono, e
quanto sono grandi, come dice [Che cosa è protetto oggi](#privacy). Durante una chiamata tramite il relay per le
chiamate, gli indirizzi IP dei telefoni che vi partecipano.

**Copie.** La cartella del relay viene copiata in un backup ogni giorno, con i messaggi in attesa ancora crittografati
end-to-end. Le copie contengono quello che elenca la tabella qui sopra, per tutto il tempo in cui vengono conservate.

**Altri che vedono qualcosa:** la società di hosting (Hetzner), che gestisce la macchina e la sua rete; l’accesso di
LPHL (Authentik), che vede ogni accesso con LPHL; e per la web app con le notifiche ad app chiusa, il servizio push
del browser (Apple, Google o Mozilla), che vede che è arrivata una notifica, mai che cosa.

## Licenza {#licence}

**Erevos, by azzinder.** Copyright © 2026 azzinder.

Erevos è software libero, con la GNU Affero General Public License, versione 3 o qualsiasi versione successiva
(AGPL-3.0-or-later): chiunque può usarlo, studiarlo, condividerlo e modificarlo. Chi condivide Erevos, modificato o no,
o fa funzionare per altri, attraverso una rete, un Erevos modificato, deve rispettare quella licenza e condividere il
codice sorgente della propria versione con chi la riceve.

### Condizioni aggiuntive

Ai sensi della sezione 7 della licenza, per Erevos valgono anche queste condizioni:

- **Il nome dell’autore.** Le copie e le versioni modificate mantengono l’avviso «Erevos, by azzinder» nella parte
  Informazioni su Erevos dell’app, [Che cos’è Erevos](#about).
- **Una versione modificata lo dice.** Dice chiaramente di essere modificata, e non si presenta come l’Erevos originale.
- **Il nome e il logo.** La licenza non dà alcun diritto al nome «Erevos» né al suo logo: una versione modificata che
  viene data ad altri prende un altro nome.

### Nessuna garanzia

Erevos è offerto nella speranza che sia utile, ma **senza alcuna garanzia**: nemmeno quella che si possa vendere o che
vada bene per uno scopo particolare. La licenza dice di più.

### Chi l’ha fatto

Erevos è fatto con **ingegneria agentica diretta dall’uomo (human-directed agentic engineering)**: azzinder stabilisce
il progetto, i vincoli, che cosa deve fare ogni modifica e quando è finita; gli strumenti di IA scrivono, eseguono i
controlli e correggono.

Erevos è progettato, diretto e mantenuto da azzinder, che ha scelto le sue funzioni e come funzionano, il suo modello di
sicurezza e la sua struttura, lo prova su dispositivi reali e decide che cosa entra in ogni versione. Strumenti di IA
sono stati usati ampiamente per scrivere il codice e i testi, sempre su istruzioni e secondo il progetto di azzinder.

Le parti fatte da altri mantengono i propri autori e le proprie licenze, vedi
[Fatto con l’open source degli altri](#about). I testi completi arrivano con il codice sorgente di {=Erevos}:
\`AUTHORS.md\`, \`CREDITS.md\` e la cartella \`LICENSES\`. Ogni copia di Erevos contiene anche il file \`NOTICES.txt\`, con la licenza di Erevos, \`AUTHORS.md\` e ogni pacchetto con cui è fatto Erevos, ciascuno con il testo della sua licenza: dentro l’app Android, nella cartella delle app per computer e Sailfish, e nell’app web in \`/NOTICES.txt\`. La licenza stessa è su
[gnu.org](https://www.gnu.org/licenses/agpl-3.0.html).

**Perché:** una licenza libera ti protegge solo se puoi leggerla. Dice che cosa puoi fare con Erevos, e che cosa ti deve
chi lo modifica.

Questa parte si apre anche da **Impostazioni** → **Generali** → **Licenza**.

## Cosa arriverà {#coming}

La crittografia end-to-end c’è già, tramite il relay e tramite il collegamento da vicino, e la maggior parte di quello
che segue si basa su di essa.

- **Più modi per restare in contatto:** i bridge di Tor per dove Tor è bloccato ci sono già, vedi [Tramite
  Tor](#tor). Prossimo passo: Tor su computer.
  - **Radio LoRa (Meshtastic):** ci sono già, vedi [Con una radio LoRa](#lora). Prossimo passo: impostare il nome
    della radio da Erevos.
  - [~] **SMS:** Erevos come app per gli SMS c’è già, con le foto MMS, gli MMS di gruppo e due SIM, vedi [SMS](#sms).
  - [~] **Telefono:** Erevos come app Telefono c’è già, con la sua schermata di chiamata, vedi [Telefono](#phone).
  - **Email, codici QR, USB, NFC:** per quando nient’altro riesce a passare.
- **Chiamate:** le chiamate vocali e le videochiamate ci sono già, e su Android squillano in background, vedi [Chat
  tramite un relay](#relay), e c’è anche un walkie-talkie che funziona perfino via Bluetooth.
- **Gruppi:** le chat di gruppo, con foto, file e messaggi vocali, e le chiamate vocali e video di gruppo ci sono già,
  vedi [Chat di gruppo](#groups). Prossimo passo: video con più di quattro persone, tramite un server su cui la
  chiamata si sposta da sola, sempre crittografata end-to-end.
- **Portare le tue chat:** Telegram e WhatsApp entrano già, con le loro foto e i loro file, e Viber con le sue parole,
  vedi [Chat importate](#import). Prossimo passo: le foto e i file di Viber.
- **Più sistemi:** gruppi pubblici e chiamate di gruppo anche sui dispositivi collegati; l’account, le sue chiamate e
  i suoi gruppi sono già su computer, vedi [Dispositivi collegati](#devices). Linux, macOS e Windows ci sono già, vedi
  [Su un computer](#desktop), l’iPhone dal browser, vedi [Su iPhone](#iphone), e Sailfish OS, vedi
  [Su Sailfish OS](#sailfish); e ci sono anche i backup, vedi [Backup](#backup).

## Domande {#faq}

### Ho dimenticato la mia password.

Non c’è modo di recuperarla. Erevos non conserva niente che possa aprire i tuoi dati senza di essa. Solo se lo sblocco
con [impronta o volto](#lock) è attivo apre ancora il primo spazio: imposta lì una nuova password con
**Cambia password**.

### Un contatto vicino non appare mai come «Vicino».

- Scrivigli: i telefoni capiscono chi è chi dal primo messaggio che
  arriva da vicino. Vengono trovati solo i contatti, quindi prima aggiungetevi a vicenda.
- Tieni uno spazio aperto su entrambi i telefoni: Erevos sullo schermo, o in background con **In background** su
  **Ricevi e squilla**.
- Controlla che il Bluetooth sia acceso (e, su Android 12 e precedenti, la posizione), e che Erevos possa trovare i
  dispositivi vicini (impostazioni di Android → App → Erevos → Autorizzazioni).
- Avvicina i telefoni. Se uno dei due non ha Wi-Fi Aware, si incontrano via Bluetooth, che è più lento ad avviarsi.
- Oppure collega entrambi a una stessa rete Wi-Fi, o all’hotspot di un telefono, con **Trova Erevos sulla stessa rete
  Wi-Fi** attivo. Alcune reti Wi-Fi pubbliche tengono separati i dispositivi collegati: lì non può funzionare. Senza
  una rete Wi-Fi in comune, **Crea una rete Wi-Fi con i telefoni vicini** permette loro di crearne una (Android 10 e
  successivi); dagli fino a un minuto o due.

### Via LoRa non arriva niente.

- Entrambe le radio hanno bisogno della stessa regione e dello stesso primo canale (il suo nome e la sua chiave)
  nell’app Meshtastic, e di essere a portata l’una dell’altra, o di radio che stanno in mezzo.
- **Radio LoRa**, in **Impostazioni** → **Relay e reti**, deve dire **Collegato**. Se non lo dice, chiudi l’app
  Meshtastic: una radio si collega a un’app alla volta.
- Partono solo i testi, e solo quando il relay non è raggiungibile e nessun telefono è vicino.
- Nell’UE una radio può trasmettere solo un certo tanto ogni ora: dopo molti messaggi, aspetta.

### Un codice di contatto non è stato aggiunto.

Un contatto su un altro relay ha bisogno di un link con la chiave di quel relay, che hanno i link di un {=Erevos}
aggiornato: la riga sotto la chat nomina quel relay. Un codice di un {=Erevos} più vecchio non ha chiavi e viene
rifiutato: chiedine uno nuovo.

### Il relay può leggere i miei messaggi?

No. I messaggi tramite un relay sono crittografati end-to-end, e solo i due telefoni hanno le chiavi. Il relay vede
comunque quali code vengono usate, e quando e quanto arriva ([Gestire un relay tuo](#own-relay)). Confronta il codice
di sicurezza, come in [Chat tramite un relay](#relay), per essere sicuro che nessuno sia nel mezzo. Niente è stato
ancora sottoposto ad audit.

### Perché Erevos non chiede il mio numero di telefono?

Perché niente ne ha bisogno. Ogni contatto è una coppia di code a senso unico sul relay, quindi nessun server ha un
elenco di chi conosce chi.

### Funziona su iPhone o su un computer?

Su un computer, sì: Linux, macOS e Windows, vedi [Su un computer](#desktop).
Su iPhone, sì, dal browser, come web app, vedi [Su iPhone](#iphone).
`;
