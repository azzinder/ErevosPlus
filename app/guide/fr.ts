// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/** The user guide in French. Its format: lib/guide.ts. The same sections, in the same order and shape, as the English one. */
export const guide = `
## Ce qu’est Erevos {#about}

Erevos est une messagerie faite pour la confidentialité. Tu n’as besoin ni de compte, ni de numéro de téléphone, ni
d’e-mail pour l’utiliser, et elle est faite pour continuer à fonctionner où que tu sois : par un téléphone à proximité
sans aucun réseau, par Wi-Fi, ou par internet.

- **À proximité, sans internet :** deux téléphones Android se parlent directement par Bluetooth, Wi-Fi Aware ou Wi-Fi
  Direct, chiffré de bout en bout, et les téléphones et ordinateurs sur le même Wi-Fi ou sur le point d’accès d’un
  téléphone aussi. Avec une radio LoRa, les textes vont à des kilomètres.
- **Par un relais :** par Wi-Fi ou par internet, via un petit serveur (un relais) que tu peux faire tourner toi-même.
- **Espaces :** un verrou par mot de passe, un second mot de passe qui ouvre un Erevos séparé et vide, et des
  discussions masquées dans chaque espace.
- **Apparence :** les rendus LPHL : Classic, Modernist et Nocturne, douze palettes, et le verre comme sur
  lphl.nekten.eu.

{-**Erevos+** est la même app, avec plus : des discussions avec des gens sur Telegram, Messenger, Signal, Session,
Matrix, XMPP et Nostr, sur Android 8.0 ou plus récent. On y passe, ou on en revient, dans **Mises à jour** : voir
[Erevos, Erevos+ ou Erevos Lite, et bêtas](#update-channel).}

> Les messages sont **chiffrés de bout en bout**, par un relais comme à proximité, mais rien n’a encore été audité par
> des experts indépendants. [Ce qui est protégé aujourd’hui](#privacy) dit exactement ce qui l’est et ce qui ne l’est
> pas.

Ce guide s’ouvre depuis **Guide d’utilisation** dans le menu de l’écran d’accueil (les trois points en haut). La
recherche en haut du guide y trouve n’importe quel mot. Le guide est dans toutes les langues de l’app, et s’affiche dans celle
que tu as choisie, voir [Langue](#start).

### Qui le fait, et pourquoi

- **Qui :** Erevos, by azzinder : la même personne qui a fait [Fasouli](https://github.com/azzinder/lphl-chrima-releases/releases/latest), une appli privée pour tes finances.
- **Où :** cela n’a pas d’importance. Ce qui compte, c’est que le relais et l’app pour le navigateur tournent sur le
  propre serveur de son auteur (lphl.nekten.eu).
- **Pour qui :** pour quiconque veut parler avec ses proches sans donner de numéro de téléphone, d’e-mail ni de compte :
  amis, familles, groupes, et ceux qui vivent là où internet est coupé ou surveillé. Et pour ceux qui, sans rien à
  cacher, veulent garder leur espace personnel privé, à l’abri des regards indiscrets.
- **Pourquoi :** parce que les applis connues demandent un numéro de téléphone, savent qui parle à qui, et s’arrêtent
  quand internet tombe. Parce que les « conditions d’utilisation » de certaines d’entre elles ne nous protègent pas, et
  que nous avons des doutes sur la façon dont elles protègent notre vie privée. Parce que d’autres n’ont pas des
  fonctions dont nous avons besoin. Erevos ne demande rien, et trouve un chemin par ce qui est là : internet, le Wi-Fi,
  le Bluetooth, un téléphone à proximité.
- **Qui paie :** personne : pas de publicité, pas d’investisseurs, pas de collecte de données. Qui le veut peut aider
  pour les frais de fonctionnement, comme le serveur : **Réglages** → **Général** → **Soutenir Erevos** donne les
  moyens, Liberapay, PayPal, Monero et Bitcoin. Donner ou non ne change rien dans l’app. **Pourquoi :** chaque moyen
  s’ouvre hors d’Erevos, dans le navigateur ou un portefeuille, seulement quand tu appuies dessus, si bien qu’Erevos
  lui-même n’envoie rien et ne sait jamais qui a donné. PayPal sait qui donne ; Monero ne montre ni qui a donné ni
  combien ; Bitcoin ne montre aucun nom, mais ce que l’adresse a reçu est public.
- **Contact :** **Réglages** → **Général** → **Contact** ajoute l’auteur d’Erevos comme contact, et tu lui écris dans
  Erevos même, avec chiffrement de bout en bout, sans numéro de téléphone ni e-mail.

### Fait avec l’open source des autres

Erevos lui-même est un logiciel libre, sous la licence AGPL-3.0-or-later, voir [Licence](#licence), et il est construit
sur le travail open source d’autres personnes. Voici les principales parties, chacune avec ses auteurs et sa licence :

- **Element Call** (Element ; AGPL-3.0) : les appels Matrix.
- **Arti, lyrebird, Snowflake et WebTunnel** (The Tor Project ; Arti MIT ou Apache-2.0, lyrebird BSD-2-Clause, Snowflake
  BSD-3-Clause, WebTunnel MIT) : Tor dans l’app, et les ponts Tor sur Android.
- **vodozemac** (Matrix.org Foundation ; Apache-2.0) : le chiffrement de Matrix.
- **OpenMLS** (OpenMLS Authors ; MIT) : les groupes chiffrés.
- **Les bibliothèques de RustCrypto et de dalek-cryptography** (leurs développeurs ; MIT ou Apache-2.0 pour RustCrypto,
  BSD-3-Clause pour dalek-cryptography) : le chiffrement lui-même.
- **React Native, Expo et react-native-webrtc** (Meta, 650 Industries et la communauté React Native WebRTC ; MIT) :
  l’app et ses appels.
- **Electron** (Electron contributors ; MIT) : l’app pour ordinateur.
- **Les polices Inter** (Rasmus Andersson et les Inter Project Authors ; SIL Open Font License 1.1) : les polices de
  l’app.

La liste complète, chaque paquet avec sa licence, est dans le fichier \`CREDITS.md\` qui vient avec le code source
d’{=Erevos}.

**Pourquoi :** parce que leurs auteurs ont donné leur travail librement et ont demandé à être nommés, et parce que tu
dois pouvoir voir de quoi Erevos est fait.

Cette partie s’ouvre aussi depuis **Réglages** → **Général** → **À propos d’Erevos**.

## Premiers pas {#start}

Erevos se télécharge depuis sa page des versions, un fichier pour chaque système : voir [Mises à jour](#updates) pour
savoir où, et comment le mettre à jour. Il fonctionne sur Android, sur un ordinateur (Linux, macOS et Windows), sur
Sailfish OS et, depuis le navigateur, sur un iPhone. Si tu es nouveau, commence par une invitation de quelqu’un qui
l’utilise : un code QR ou un lien, et tu y es, avec cette personne comme contact (voir Inviter quelqu’un de nouveau,
sous [Discuter par un relais](#relay)).

L’écran d’accueil est la liste de tes discussions, celle qui a bougé en dernier en haut. Chacune montre l’image du
contact, le dernier message avec ses marques, quand il est arrivé, et combien de ses messages tu n’as pas lus. Une
horloge à côté signifie que ses messages disparaissent. **Rechercher dans les discussions** trouve une discussion par
son nom ou son dernier message, et, sous les discussions, les messages qui contiennent ce que tu tapes, dans toutes les
discussions de l’espace : appuie sur l’un d’eux pour ouvrir sa discussion à cet endroit. Dans une discussion, ses
détails ont **Rechercher dans cette discussion** : ▲ et ▼ vont à ce qu’elle a trouvé plus tôt et plus tard. L’une comme
l’autre ne cherche que sur ce téléphone : dans ce qu’il garde scellé{~, et **Rechercher dans cette discussion** aussi dans
les SMS que montre la discussion d’un contact} ; les discussions masquées ne se cherchent que de l’intérieur. Une longue
discussion s’ouvre sur ses 100 derniers messages, et les plus anciens, dont ceux importés de Telegram ou WhatsApp,
arrivent tout seuls quand tu remontes (**Afficher les messages plus anciens**, au-dessus d’eux, les amène aussi) ; aller
à un message plus ancien (depuis la recherche, un message avec étoile ou celui auquel un message répond) l’amène aussi.
Chaque discussion s’ouvre sur son dernier message, avec la barre de message en dessous : les discussions avec des
contacts{~, les groupes et les conversations SMS| et les groupes}{+, comme les discussions Matrix, XMPP et Nostr}. Quand tu as un peu remonté,
des flèches rondes apparaissent en bas à droite, dans chacune : celle du haut va au début de la discussion, celle du bas
revient à sa fin. Entre les deux, si des messages étaient nouveaux à l’ouverture, une double coche va au premier d’entre
eux, là où tu en étais, tant que ce message n’est pas à l’écran. Depuis le début, **Afficher les messages suivants**, sous
ce qui s’affiche, en amène d’autres ; écrire un message, ou la flèche du bas, ramène à la fin.

**Pourquoi :** une longue discussion s’ouvre sur ses derniers messages pour s’ouvrir tout de suite : tout afficher d’un
coup serait lent, surtout sur les téléphones anciens. Les discussions masquées sont exclues de la recherche de l’écran
d’accueil pour que l’écran d’accueil ait le même aspect, qu’un espace en ait ou non : leurs messages ne peuvent être lus
que tant que leur code PIN les tient ouvertes.

**Épinglées et archivées :** garde le doigt sur n’importe quelle discussion de l’écran d’accueil, d’un contact ou d’un
groupe{~, |}{+sur Matrix, XMPP, Nostr ou en SMS}{-{~ou d’une conversation SMS}}, pour **Épingler en haut**, **Archiver** et, sur Android, **Mettre cette
discussion en sourdine**. Au plus 10 discussions restent épinglées. Une discussion archivée quitte la liste jusqu’à ce
qu’un nouveau message en vienne ; touche **Archivées** en haut pour voir ce que tu as archivé,{~ SMS compris,} et
touche-le encore pour revenir. Les discussions masquées ont leurs propres discussions épinglées et archivées.

- **L’image** est dessinée à partir de la clé du contact : la même clé donne toujours les mêmes couleurs et la même lune{+
  (en verts sous Matrix)}, si bien que tu reconnais une discussion d’un coup d’œil sans aucune photo. Ce n’est pas une
  vérification de la clé ; le [numéro de sécurité](#relay) en est une.
- **La ligne sous la recherche** dit si un relais est configuré et si ta file d’attente est prête. Appuie dessus pour en
  configurer un.
- **La recherche et cette ligne restent** sous la barre du haut{~, avec le bouton des services,|} pendant que la liste défile.
- **Discussion avec moi-même**, toujours la première des discussions, avec une épingle, contient tes notes pour
  toi-même : voir Discussion avec moi-même et rappels ci-dessous.
- [+] **Les discussions Matrix**, une fois que tu t’es connecté à Matrix, sont dans la liste avec les autres, les plus
  récentes d’abord, chacune marquée **Matrix**, et une invitation s’affiche en haut. La puce **Matrix** ne montre
  qu’elles, et là **Nouvelle discussion** commence une discussion Matrix : voir [Matrix](#matrix).
- [+] **Les discussions XMPP**, une fois que tu t’es connecté à XMPP, sont dans la liste de la même façon, chacune marquée
  **XMPP**, et une personne qui demande à t’ajouter, ou un groupe qui t’invite, s’affiche en haut. La puce **XMPP** ne
  montre qu’elles, et là **Nouvelle discussion** commence une discussion XMPP : voir [XMPP](#xmpp).
- [+] **Les discussions Nostr**, une fois que l’espace a une clé Nostr, sont dans la liste de la même façon, chacune
  marquée **Nostr**. Le bouton **Nostr** n’affiche qu’elles, avec le nombre de messages non lus, et là **Nouvelle
  discussion** ouvre l’écran des discussions Nostr : voir [Discussions avec d’autres applis Nostr](#nostr-chats).
- **Tout marquer comme lu**, dans le menu ⋮, lit d’un coup toutes les discussions de la partie de la liste où tu es
  (tous les messages{~, SMS| ou}{-{~ ou|} Erevos}{+, Erevos, Matrix, XMPP ou Nostr}), celles en sourdine et celles verrouillées par PIN aussi,
  après avoir demandé. Chacune est lue comme si tu l’ouvrais, donc ceux qui ont écrit en sont informés comme alors ; les
  invitations et les personnes qui demandent à t’ajouter restent jusqu’à ce que tu leur répondes.{+ Les écrans Matrix,
  XMPP et Nostr l’ont sous **Discussions** pour leurs propres discussions.} Les discussions masquées ne sont jamais lues
  par lui.
- [+] **Le fil public**, une fois que l’espace a une clé Nostr ou est dans un salon Matrix public, est un bouton de plus,
  **Public** : un seul fil, comme dans Amethyst, avec les publications publiques des personnes que suit ta clé Nostr et
  les messages des salons Matrix publics où tu es, les plus récents d’abord. Chacune montre qui l’a écrite (un petit N
  ou M dit le réseau), quand, ses mots, ses photos dans la publication et une carte pour son lien. Quand les deux sont
  activés, **Tous**, **Nostr** et **Matrix**, au-dessus du fil, choisissent ce qui s’affiche, et **Photos** choisit
  comment les photos et les cartes sont récupérées. Sous une publication : répondre, partager à nouveau, aimer et
  partager ; sous un message Matrix : répondre, réagir et partager. **Nouvelle publication**, le stylo en bas, écrit une
  publication publique, avec jusqu’à quatre photos. Voir [Discussions avec d’autres applis Nostr](#nostr-chats).
- **Nouvelle discussion**, en bas, ouvre les réglages du relais et l’ajout d’un contact. **Me rappeler**, la cloche
  orange à côté, t’écrit un rappel.
- **{~Le combiné vert et la personne violette|La personne violette}** en haut, sur Android, {~ouvrent directement **Téléphone** et **Contacts**,
  aux couleurs de leurs icônes|ouvre directement **Contacts**, à la couleur de son icône} sur l’écran d’accueil du téléphone. {~Ils ne sont pas aussi|Elle n’est pas aussi} dans le menu sous les trois
  points.
- [~] **Le bouton des services**, sous la barre du haut, où il reste quand la liste défile, dès que deux parties avec des messages sont activées dans Modules, dit
  quelle partie de la liste s’affiche (**Tous les services**, ou celle choisie), avec les signes des services, les
  messages non lus de tous et, en rouge, un service qui n’est pas connecté en ce moment. Appuie dessus pour la fenêtre
  **Services** : une carte par partie activée, même sans conversation encore, chacune avec ses messages non lus (99+
  au-delà de 99) et un point, vert tant que son réseau est connecté, rouge avec **Hors ligne** sinon. Une carte
  n’affiche que cette partie : **Tous** toutes les conversations, **SMS** seulement les SMS (avec les conversations
  dont le dernier message était un SMS ; elle indique si Erevos n’est pas encore l’app SMS), **Erevos** seulement les
  conversations Erevos, celles de chaque contact, quoi qu’il soit arrivé en dernier{+, et **Matrix**, **XMPP**,
  **Public** et **Nostr** les leurs}. **Ajouter** ouvre Modules, pour en activer d’autres, et **Tout marquer comme lu**
  lit la partie affichée. Maintiens une carte appuyée pour l’avancer, la reculer ou la masquer avec **Masquer** : un
  service masqué reste activé, mais ne notifie plus et ne compte plus sur l’icône (Telegram, dont les dossiers
  peuvent s’afficher à l’accueil, si), et ses conversations quittent aussi **Tous** (la recherche les
  trouve encore), et il attend au pied de la fenêtre, où un appui le réaffiche. Toute carte maintenue, **Tous** aussi, peut devenir
  **S’ouvre en premier** : Erevos s’ouvre dessus depuis son icône, et sur **Tous** tant qu’aucune n’est choisie. Les conversations et groupes en **En
  sourdine** ne comptent pas, comme pour le nombre sur l’icône d’Erevos, et ce qui est tapé dans la recherche ne
  change pas les nombres. Sous le bouton, sans recherche, viennent d’abord les conversations avec des messages non
  lus, sous **Non lus**, avec **Tout marquer comme lu** à côté, puis les autres sous **Récents**.
- **Le widget**, sur Android : ajoute Erevos depuis les widgets de ton écran d’accueil. {~Ses quatre boutons ouvrent
  **Téléphone**, les **SMS**, les **Messages** d’Erevos et **Contacts**, après le mot de passe comme tout lien (le
  Téléphone sans lui, si tu le permets). Au-dessus des trois premiers, il montre combien il y a d’appels manqués, de SMS
  non lus et de nouveaux messages, jamais de qui ni quoi ; avec des appels manqués, **Téléphone** s’ouvre sur
  **Récents**.|Ses deux boutons ouvrent les **Messages** d’Erevos et
  **Contacts**, après le mot de passe comme tout lien. Au-dessus de **Messages**, il montre combien il y a de nouveaux
  messages, jamais de qui ni quoi.} Un bouton touché de nouveau montre de nouveau son écran, même après que tu as choisi un autre onglet
  là-bas. Ses mots suivent la langue d’Erevos. **Réglages** → **Apparence** → **Widget** définit l’ordre de ses boutons.
- **Le cadenas orange** en haut verrouille Erevos aussitôt quand un mot de passe est défini, ou ouvre les réglages du
  verrou sinon.
- **Les trois points** ouvrent le reste :

| Dans le menu | Ce que ça ouvre |
| --- | --- |
| **Nouveau groupe** | Une discussion de groupe avec tes contacts. Voir [Discussions de groupe](#groups). |
| **Groupes publics** | Un groupe que quiconque a son lien peut demander à rejoindre, avec un propriétaire et des admins. Voir [Groupes publics](#public-groups). |
| **Messages avec étoile** | Les messages auxquels tu as ajouté une étoile, dans toutes tes discussions. Voir Le menu d’un message, sous Discuter par un relais. |
| **Téléphones à proximité** | Tes contacts par Bluetooth et Wi-Fi Aware, ou sur le même Wi-Fi, sans internet. Voir [Discuter avec un téléphone à proximité](#nearby). |
| **Guide d’utilisation** | Ce guide. |
| **Réglages · Settings** | La dernière ligne, avec un engrenage : tout ce que tu peux régler, par groupes, avec une recherche. Voir Réglages ci-dessous. |

Dans une discussion, son nom et son image sont en haut avec la façon dont elle passe : **Chiffré** (de bout en bout),
**En ligne**, **À proximité** tant que son téléphone est relié au tien par radio, ou **écrit…**, avec un chronomètre
quand les messages de la discussion disparaissent. À côté, la tuile bleue avec une caméra lance un appel vidéo et la
verte avec un combiné un appel vocal. Appuie sur le nom, ou sur **⋯** après eux (**⋮** sur Android), pour les
**Détails** de la discussion : son image (appuie dessus pour la changer), **Appeler**, **Vidéo**, **Renommer** et
**Image**, puis **Messages éphémères**, **Bloquer les captures d’écran**, **Apparaître hors ligne**, **Apparence de la discussion**, le **Numéro de
sécurité**, **Déplacer dans les discussions masquées**, **Déplacer dans un autre espace** et **Supprimer les messages**. **Terminé** les ferme.

**Médias, liens et fichiers**, dans les détails sous **Rechercher dans cette discussion**, liste ce que contient la
discussion, chaque type sous son propre onglet avec leur nombre : **Photos** (en grille), **Vidéos**, **Messages
vocaux**, **Musique**, **Fichiers** et **Liens**, les plus récents en premier sous leurs mois, ceux importés de Telegram
ou WhatsApp aussi. Un appui ouvre une photo ou un fichier pour le regarder ou l’enregistrer, joue un son sur place, ou
ouvre un lien après avoir demandé ; en appui long, chacun propose **Voir dans la discussion**, qui va à son message.
Pour un élément pas encore récupéré du relais, on va à lui dans la discussion, où un appui le récupère. Le calendrier en
haut va à un jour : les jours qui ont quelque chose de ce type sont marqués. **Aller à un jour**, en dessous dans les
détails, fait de même pour la discussion elle-même : il va au premier message de ce jour-là.

**Pourquoi :** les listes sont faites sur ce téléphone à partir de ce qu’il garde déjà, si bien qu’aucun serveur
n’apprend ce que contient une discussion ; et seules les photos à l’écran sont lues, comme dans la discussion, si bien
qu’une discussion qui en a des milliers s’ouvre aussi vite qu’une qui n’en a aucune.

[~] **Aussi {+sur Matrix, XMPP, Nostr et }en SMS :** {+une discussion Matrix, XMPP ou Nostr a en bas **Rechercher dans cette
discussion**, **Médias, liens et fichiers**, **Aller à un jour** et **Exporter la discussion**, à côté de
**Notifications**, et }une conversation SMS {+les }a{- **Rechercher dans cette discussion**, **Médias, liens et fichiers**, **Aller à un jour** et **Exporter la discussion**} en premier sous son **⋮**. Ils ne regardent que ce que ce téléphone
garde de la discussion : {+les messages qu’une discussion Matrix garde (sous la recherche, **Charger les messages
précédents** en récupère de plus anciens sur son serveur, comme le haut de la discussion), ceux d’une discussion XMPP
ou Nostr, et }chaque SMS et MMS de la conversation sur le téléphone ; aller à un SMS plus ancien charge la conversation
jusqu’à lui. Rien de ce que tu tapes dans la recherche ne quitte le téléphone. Les photos et les fichiers sont listés,
et un appui mène à chacun dans la discussion, où un appui le récupère sur son serveur comme avant, donc aucun serveur
n’apprend lesquels tu as regardés ; les images d’un MMS s’affichent dans la liste même. **Exporter la discussion**
l’écrit comme pour un contact, après la même question ; les discussions d’un emplacement masqué ne sont pas exportées.

Une bonne première heure :

1. Ouvre **Réglages** → **Confidentialité et sécurité** → **Verrou et second mot de passe** et définis un mot de passe,
   pour que personne qui prend le téléphone ne puisse ouvrir Erevos.
2. Ouvre **Téléphones à proximité** depuis le menu sur deux téléphones proches l’un de l’autre, et autorise ce
   qu’Android demande.
3. Ajoutez-vous l’un l’autre avec **Afficher mon code QR**, comme dans [Discuter avec un téléphone à
   proximité](#nearby), et envoie un message : il part à proximité, chiffré de bout en bout, sans relais et sans
   internet.
4. Pour parler de plus loin, configure un relais comme dans [Discuter par un relais](#relay).

### Discussion avec moi-même et rappels

**Discussion avec moi-même** est toujours en haut des discussions, avec une épingle, dans chaque espace. C’est une
discussion où il n’y a personne d’autre : écris-toi des notes, des liens, des photos, des fichiers et des messages
vocaux, comme dans n’importe quelle discussion. Elle ne va à personne d’autre : elle reste chiffrée dans l’espace, et
ne va qu’à tes propres appareils associés, chiffrée de bout en bout, pour que chacun ait les mêmes notes et les mêmes
rappels (voir [Appareils associés](#devices)). Une sauvegarde la prend tout entière, notes, photos,
fichiers et messages vocaux, comme pour les discussions.

- **Un rappel :** appuie sur **Me rappeler** (la cloche orange à côté de **Nouvelle discussion**), écris de quoi te
  rappeler, choisis une heure (**Dans 1 heure**, **Ce soir 20:00**, **Demain 09:00**, ou n’importe quel jour, heure et
  minute) et appuie sur **Me rappeler**. Il va dans Discussion avec moi-même, avec une cloche et son heure. Dans la
  discussion, **+** → **Me rappeler**, ou maintenir la flèche d’envoi, donne aussi une heure à la note que tu écris.
- **À son heure**, sur Android, le téléphone montre une notification, **Reminder** (ou **3 reminders**) – « Open Chat
  with myself to read it », jamais ce que dit le rappel, même avec Erevos fermé et verrouillé ; quand tu appuies
  dessus, elle ouvre Discussion avec moi-même, après le mot de passe. Tant que tu n’as pas ouvert la discussion, le
  rappel s’affiche sur sa ligne en haut des discussions, avec un compteur, et dans la discussion avec un bord coloré ;
  vu là, il quitte aussi la notification. Sur un ordinateur, dans l’app web, ou avec les notifications désactivées,
  c’est là que tu le vois. Si **Heures exactes** n’est pas autorisé (**Réglages** → **Général** → **Autorisations**),
  Android peut l’afficher avec quelques minutes de retard.
- **Un appui long sur une note** propose **Copier**, **Ouvrir** (une photo ou un fichier), **Me rappeler**, ou
  **Changer le rappel** et **Sans rappel**, **Déplacer dans un dossier**, et **Supprimer**.
- **Dossiers :** le bouton de dossier en haut, à côté de **Apparence de la discussion**, en crée un. Des onglets
  s’affichent alors au-dessus des notes : **Toutes**, et un par dossier, qui n’affiche que ce qu’il contient ; ce que
  tu écris, envoies ou enregistres pendant qu’un dossier est choisi y va. Une note est dans un dossier au plus :
  **Déplacer dans un dossier** la met dans un autre, dans un nouveau, ou **Sans dossier**. Un appui long sur l’onglet
  d’un dossier, ou un nouvel appui dessus, propose **Renommer le dossier** et **Supprimer le dossier** ; ses notes
  restent, sans dossier. Une note va sur tes appareils associés avec son dossier, et un dossier renommé ou supprimé
  sur l’un l’est aussi sur les autres ; un dossier vide reste sur l’appareil où il a été créé.
- Chaque espace a sa propre Discussion avec moi-même, et chaque emplacement de discussions masquées aussi, en haut de
  leur liste (voir [Discussions masquées](#hidden)). Les rappels d’un emplacement masqué s’y affichent une fois que
  son code PIN l’ouvre ; le téléphone les signale à leur heure seulement tant que **Recevoir une fois fermées** est
  activé pour cet emplacement, dans la même notification. Un nouveau code PIN pour l’emplacement, qui le recommence
  vide, ou l’emplacement retiré, enlève ses rappels du téléphone. Les notes d’un emplacement masqué ne vont qu’aux
  appareils associés à cet emplacement à part, jamais à ceux de l’espace (voir [Appareils associés](#devices)).
- **Depuis une autre appli :** une appli du téléphone peut demander de garder ici une note, comme Fasouli pour un
  paiement à venir, avec son rappel. Erevos ouvre Discussion avec moi-même après le mot de passe, dans l’espace que tu
  ouvres, et demande d’abord **Garder cette note ?**, avec le texte et l’heure ; seul **Ajouter** la garde. Rien ne
  retourne à l’appli. Pour un paiement planifié, le rappel revient, chaque mois ou selon la répétition du paiement : dès que tu l’as vu, il passe à sa prochaine fois.

**Pourquoi :** une notification s’affiche sur l’écran verrouillé pour quiconque tient le téléphone, donc ce que dit un
rappel reste chiffré dans son espace et Android n’apprend que son heure : la notification ne peut dire à personne ce que
tu voulais te rappeler, ni dans quel espace il se trouve. Et les notes ne vont à personne d’autre qu’à tes propres
appareils, chiffrées de bout en bout entre eux comme tes discussions : le relais ne les transporte que chiffrées.

- [~] **Depuis d’autres discussions :** un message d’une {+discussion Matrix, XMPP, Nostr ou }{-conversation }SMS peut aussi venir ici, avec
  un rappel : **Me rappeler** dans son menu.

### Se déplacer par balayage

- **Retour :** balaie vers la droite n’importe où sur un écran pour revenir en arrière, comme le fait la flèche de
  retour. Une flèche ronde sort à gauche ; lâche une fois qu’elle est entière, ou donne un petit coup rapide, et tu es
  revenu. Lâche plus tôt et tu restes. Dans une discussion, le balayage fait ce que fait sa flèche de retour : retour à
  la liste des discussions, ou sortie des discussions masquées, en les fermant. Dans les **Détails** d’une discussion,
  il les ferme.
- **Onglets :** balaie vers la gauche ou la droite pour aller à l’onglet d’à côté, comme en appuyant sur sa puce :{~
  **Tous**, **SMS**}{+,}{-{~ et}}{~ **Erevos**}{+, **Matrix**, **XMPP** et **Nostr**}{~ sur l’écran d’accueil (ceux activés dans Modules),
  **Clavier**, **Récents** et **Favoris** dans **Téléphone**,} les filtres dans **Contacts**, et les séries de
  stickers.{~ Sur l’écran d’accueil, les parties se choisissent dans la fenêtre **Services**, avec le bouton sous la
  barre du haut.}
- Sur un écran avec des onglets, un balayage ne fait que changer d’onglet, sur les lignes de sa liste aussi, et au-delà
  du premier ou du dernier onglet il ne fait rien : reviens-y avec la flèche de retour.{~ Une conversation SMS s’archive
  ou se supprime par un appui long.}

### Réglages

**Réglages · Settings**, la dernière ligne du menu (les trois points), contient tout ce que tu peux régler dans Erevos,
par groupes, comme le font les réglages du téléphone lui-même. Dans les autres langues, ils portent le nom dans cette
langue et en anglais, comme **Einstellungen · Settings**, pour qu’on les trouve dans une langue qu’on ne sait pas lire.

- **Rechercher dans les réglages,** en haut, trouve un réglage par le début de ses mots, avec ou sans accents, et montre
  où il se trouve, comme {~**Téléphone et SMS › SMS**|**Confidentialité et sécurité › Discussions masquées**}. Appuie dessus pour l’ouvrir.
- **Langue · Language,** la ligne sous la recherche, ouvre la liste des langues, voir Langue ci-dessous.
- **Un groupe** ouvre la liste de ses réglages, et un réglage ouvre son écran. Un réglage avec des parties, comme
  {~**SMS**|**Sauvegardes**}, les liste, et chaque partie s’ouvre seule.
- **Seul ce qui marche ici s’affiche :** sur un ordinateur, sur Sailfish OS et dans l’app web, il n’y a ni {~**Téléphone
  et SMS**, ni |}Tor, ni Nostr, ni LoRa, et un groupe sans rien à régler ici ne s’affiche pas.
- [~] **Seuls les modules activés s’affichent :** les réglages d’un module désactivé, comme {+**Matrix** ou
  }**Téléphone et SMS**, ne s’affichent pas non plus : voir [Modules](#modules).

| Groupe | Ce qu’il contient |
| --- | --- |
| **Général** | **Langue**, {~**Modules**, |}**Mises à jour**, **Donner Erevos à un téléphone proche** (Android), **Nouveautés**, **À propos d’Erevos**, **Soutenir Erevos** et **Autorisations** (Android et l’app web). Voir Langue ci-dessous, {~[Modules](#modules), |}[Mises à jour](#updates) et [Erevos vers un téléphone proche](#give-app). |
| **Apparence** | **Style et couleurs** (rendu, verre, style, thème, couleurs et texte sur les zones colorées, avec l’aperçu), **Fond d’écran**, **Messages** (la forme des bulles), **Icônes du lanceur** (Android), **Widget** (Android) et **Vibrer au toucher** (Android). Voir [Apparence](#appearance). |
| **Notifications** | **En arrière-plan** (Android et l’app pour ordinateur) : recevoir et sonner quand Erevos est fermé, et la notification des messages ; sur un ordinateur, si Erevos continue de tourner fenêtre fermée. **Notifications quand l’app est fermée** (l’app web) : Web Push. **Nombre sur l’icône** : combien de messages ne sont pas lus, sur l’icône d’Erevos. Voir [Sur un iPhone](#iphone) et [Sur un ordinateur](#desktop). |
| **Confidentialité et sécurité** | **Verrou et second mot de passe** (verrouiller à l’ouverture d’Erevos, le mot de passe, la confidentialité de l’écran, l’empreinte digitale ou le visage, le second mot de passe), **Discussions masquées** (les codes PIN des 4 emplacements), **Bouton de panique** (avec le mot de passe de panique), **Calculatrice à la place d’Erevos** (Android, dans Apparence), **Captures d’écran** (Android) et **Cette app web** (l’app web seulement). Voir [Verrou par mot de passe](#lock), [Second mot de passe](#second), [Discussions masquées](#hidden) et [Bouton de panique](#panic). Voir aussi [Me supprimer partout](#forget). |
| **Relais et réseaux** | **Voies**, **Relais** (il ouvre **Nouvelle discussion** avec **Pour les utilisateurs avancés** ouvert), **Relais d’attache**, **Tor** (Android), **Nostr** (Android){+,}{- et} **Radio LoRa** (Android){+, **Matrix**, **XMPP** et **Discussions Nostr**}. Voir [Discuter par un relais](#relay), [Relais d’attache](#home-relay), [Par Tor](#tor), [Par Nostr](#nostr){+,}{- et} [Par une radio LoRa](#lora){+, [Matrix](#matrix), [XMPP](#xmpp) et [Discussions avec d’autres applis Nostr](#nostr-chats)}. |
[~] | **Téléphone et SMS** (Android) | **Téléphone**, les réglages de l’app Téléphone, les mêmes que **Téléphone** → **Réglages**. **SMS**, en parties : **Erevos comme app SMS**, **Trouver Erevos derrière un numéro**, **SMS quand rien d’autre ne marche**, **Noms de tes contacts**, **Archivées, spam et corbeille**, **Filtre anti-spam**, **Numéros bloqués**, **Annuler l’envoi d’un SMS**, **Deux SIM** (seulement avec deux SIM) et **Nouveau SMS**. Voir [Téléphone](#phone) et [SMS](#sms). |
| **Données et appareils** | **Sauvegardes**, **Morceaux de sauvegarde**, **Appareils associés** et **Discussions importées**. Voir [Sauvegardes](#backup), [Morceaux de sauvegarde chez des amis](#backup-pieces), [Appareils associés](#devices) et [Discussions importées](#import). |
| **Pour les tests** | **Test du relais** et **Test radio** (Android). Voir [Les écrans de test](#tests). |

### Langue

Erevos est en anglais, en grec, en allemand, en français, en espagnol, en italien, en portugais et en serbo-croate. La
première fois qu’il démarre, il suit la langue du téléphone si c’est l’une de celles-ci (un téléphone en serbe, croate,
bosnien ou monténégrin démarre en serbo-croate), et il est en anglais sinon. Pour la changer, ouvre le menu (les trois
points), appuie sur **Réglages · Settings**, sa dernière ligne, puis sur la première ligne là, **Langue · Language**.
Dans les autres langues, les deux portent le nom dans cette langue et en anglais, comme **Einstellungen · Settings** et
**Sprache · Language**. Appuie ensuite sur la langue, chacune nommée dans ses propres mots : **Ελληνικά**, **English**,
**Deutsch**, **Español**, **Français**, **Italiano**, **Português** ou **Srpskohrvatski**. Toute l’app change aussitôt.

- **Ce guide** est lui aussi dans chacune de ces langues, et nomme les boutons comme l’app les affiche dans la tienne.
  Dans les langues autres que l’anglais et le grec, un mot nouveau dans l’app peut s’afficher en anglais pendant un
  temps, jusqu’à ce qu’il soit traduit.
- **Gardé sur le téléphone :** le choix est gardé sur ce téléphone, hors de tout espace, si bien que l’écran du mot de
  passe s’affiche aussi dans cette langue, et que chaque espace s’ouvre dans cette langue. Il n’est pas scellé :
  quiconque tient le téléphone peut voir quelle langue tu as choisie.
- **Les notifications d’Android** (un appel entrant, de nouveaux messages, Erevos qui reçoit en arrière-plan) sont en
  grec quand Erevos l’est, et en anglais dans toutes les autres langues.

## Modules {#modules}

Erevos est fait de parties, ses modules : **Erevos** lui-même (ses propres discussions, groupes et appels, chiffrés de
bout en bout, avec les discussions masquées), le **Téléphone**{- et}{+,} les **SMS**{+, et les discussions avec des apps **Nostr**,
**Matrix** et **XMPP**, et **Telegram**, **Messenger**, **Signal** et **Session**}. La **Collection** (tes photos et tes fichiers, chiffrés) est aussi un module. Le Téléphone et les SMS n’existent que sur Android, la Collection sur Android, dans l’application de bureau, dans l’app web et sur Sailfish OS. N’importe lesquels peuvent être activés,
Erevos lui-même aussi, un ou plusieurs, au moins un : **Réglages** → **Général** → **Modules** active ou désactive
chacun à tout moment.

Au tout premier démarrage, Erevos se configure comme le fait un installateur. Avant l’ouverture de son premier espace :
ce que tu ne donnes pas (ni numéro de téléphone, ni e-mail, ni nom d’utilisateur, ni compte : tu ajoutes des gens avec
un code QR ou un lien, ou ce sont eux qui t’invitent), un nom pour tes contacts si tu en veux un, et la langue ; puis
quels modules utiliser, chacun avec ce qu’il fait. Ensuite, dans l’espace : un écran pour chaque module choisi, avec la
façon de commencer (pour Erevos, comment tu entres ; pour le Téléphone et les SMS, Erevos comme app Téléphone et comme
app SMS{+ ; pour Nostr, Matrix et XMPP, ton compte là-bas}) et ce qu’Android, ou le navigateur, doit autoriser pour lui.
Chaque autorisation est sur le premier écran qui en a besoin, et **Tout autoriser, un par un** pose les questions
qu’Android pose, dans Erevos même, l’une après l’autre. Puis le verrouillage par mot de passe et les sauvegardes
automatiques, puis ce qui est prêt et ce qui manque, avec **Inviter quelqu’un**. **Le reste plus tard** laisse le reste
aux Réglages ; tant que tu n’as pas fini ou remis à plus tard, les étapes réapparaissent au démarrage d’Erevos. Ouvert
avec une invitation, Erevos la montre une fois les étapes terminées. Après une mise à jour, chaque module reste activé,
comme avant, jusqu’à ce que tu les changes.

- **Le nom :** ce n’est pas un nom d’utilisateur : personne ne le cherche, et il n’a pas besoin d’être unique. Il part,
  chiffré, seulement vers ceux que tu ajoutes, et **Mon nom**, sous Réglages → Confidentialité et sécurité, le change.
- **Venir d’un autre téléphone :** sur Android, **J’ai déjà {=Erevos} sur un autre téléphone** saute le nom et les modules,
  qui viennent avec la sauvegarde. L’espace s’ouvre, **Ouvrir les sauvegardes** la restaure (voir [Passer à un nouveau
  téléphone](#new-phone)), puis suivent les écrans des modules qu’elle apporte, puis l’empreinte et le dossier des
  sauvegardes automatiques, qui restent propres à chaque téléphone. **Je n’ai pas encore de sauvegarde** dit comment en
  faire une.
- **Sur un ordinateur ou dans un navigateur :** **Associer à mon téléphone** saute les étapes et ouvre **Appareils
  associés**.

- **Désactivé :** un module désactivé ne démarre pas : rien de lui ne tourne, n’attend sur un serveur ni ne sonne, donc
  Erevos est plus léger, s’ouvre plus vite et consomme moins de batterie. Il n’apparaît nulle part : ni sur l’écran
  d’accueil, ni dans son menu, ni dans les réglages, et les icônes du Téléphone et des SMS quittent les apps du
  téléphone. Un lien, une notification ou le widget qui y mènent encore disent qu’il est désactivé, avec **Ouvrir les
  modules**.
- **Rien n’est supprimé :** ses discussions, contacts, comptes et réglages sont de retour quand il est réactivé. Les
  contacts, le verrouillage par mot de passe, les espaces, les sauvegardes et les réglages sont toujours là, quoi qu’il
  y ait d’activé.
- **De nouveau activé :** un module activé démarre aussitôt, et **Autorisations** montre ce qu’Android doit autoriser
  pour lui, comme au premier démarrage.
- **Nouveau avec une mise à jour :** un module qui arrive avec une mise à jour, comme la Collection avec la 7, est
  activé, même là où tu as choisi les modules avant son arrivée, jusqu’à ce que tu le désactives.
- **Le Téléphone ou les SMS désactivés** alors qu’Erevos est encore l’app Téléphone ou l’app SMS : Android continue de
  donner à Erevos les appels ou les SMS, conservés comme avant. **Ouvrir les applis par défaut** choisit une autre app.
- **Le Téléphone seul :** sans aucun module qui apporte des messages, l’écran d’accueil le dit, avec **Téléphone** et
  **Modules**.
- **Gardé sur le téléphone :** le choix vaut pour ce téléphone, le même dans chaque espace, et il est gardé en dehors
  des espaces, comme les icônes, puisque le Téléphone peut s’ouvrir sans le mot de passe.

**Pourquoi :** tout le monde ne veut pas tout. Quelqu’un qui utilise {=Erevos} seulement comme téléphone, ou seulement pour
Nostr, obtient une app qui ne fait que cela, et un téléphone qui n’attend pas en arrière-plan des messages qui ne
viennent jamais.

## Discuter avec un téléphone à proximité {#nearby}

Tant qu’un espace est ouvert, sur n’importe quel écran, Erevos cherche d’autres téléphones {=Erevos} autour de lui, par
Bluetooth et, là où le téléphone l’a, par Wi-Fi Aware, et sur le Wi-Fi où il se trouve, téléphones comme ordinateurs. Ni
internet, ni SIM, ni réseau Wi-Fi ne sont nécessaires. Il porte les messages à tes contacts, chiffrés de bout en bout
comme ceux qui passent par le relais.

Il ne cherche que lorsque **Chercher les téléphones à proximité** est activé, sous **À proximité, sans internet**,
dans **Nouvelle discussion** : c’est désactivé jusqu’à ce que tu l’actives, sur les deux téléphones, et d’ici là tout
passe par le relais.

1. Ouvre **Téléphones à proximité** depuis le menu sur les deux téléphones. La première fois, Android demande
   l’autorisation de trouver les appareils à proximité (sur Android 12 et plus ancien, aussi pour la position) ;
   autorise-la, sinon les téléphones ne peuvent pas se trouver.
2. Si vous n’êtes pas encore contacts, ajoutez-vous l’un l’autre : sur un téléphone, appuie sur **Nouvelle discussion**,
   où s’affiche **Ton code QR**, et scanne-le avec l’autre, comme dans [Discuter par un relais](#relay). Sans relais, le
   code ne contient que tes clés, et vous ne vous joignez qu’à proximité, jusqu’à ce que tu en aies un.
3. Choisis le contact, tape dans la barre de message en bas et appuie sur la flèche d’envoi. Dès que son téléphone
   répond, le haut de la discussion indique **À proximité**.

- **Tant qu’un espace est ouvert :** les liaisons démarrent quand un espace s’ouvre, quel que soit l’écran affiché, et
  s’arrêtent quand un autre espace s’ouvre : verrouillé, l’espace continue derrière l’écran du mot de passe. Un message
  venu d’à proximité s’affiche sur l’écran d’accueil comme un message passé par le relais, et un appel y sonne aussi.
  Sur Android, elles restent actives avec Erevos en arrière-plan, tant que **En arrière-plan** est sur **Recevoir et
  sonner**. Pour y ménager la batterie, il cherche les téléphones moins souvent : Wi-Fi Direct toutes les dix minutes,
  Wi-Fi Aware une minute sur cinq, et sur le même Wi-Fi il écoute les autres vingt secondes toutes les deux minutes. Un
  téléphone à proximité peut donc être trouvé quelques minutes plus tard ; les liaisons établies le restent, et dès
  qu’Erevos s’affiche, il cherche aussi souvent qu’avant.
- **Portée :** quelques dizaines de mètres en plein air, moins à travers les murs.
- **Wi-Fi Aware :** plus rapide, mais tous les téléphones ne l’ont pas. Le Bluetooth fonctionne sur tous. Pour
  l’arrêter, désactive **Chercher avec Wi-Fi Aware**, au-dessus de **Trouver Erevos sur le même Wi-Fi**.
- **Le même Wi-Fi ou un point d’accès :** les téléphones sur un même Wi-Fi, ou sur le point d’accès d’un téléphone, se
  trouvent et se parlent directement, même quand ce Wi-Fi n’a pas internet ; l’app pour ordinateur aussi. Si Android
  demande s’il faut rester sur un Wi-Fi sans internet, reste. Toute personne sur ce Wi-Fi peut savoir qu’une app Erevos
  est là, pas à qui elle est. Le pare-feu d’un ordinateur doit laisser entrer le port 47905 (UDP et TCP). Pour
  l’arrêter, désactive **Trouver Erevos sur le même Wi-Fi** sous **À proximité, sans internet**, dans **Nouvelle
  discussion**.
- **Un Wi-Fi à eux (Android 10 et plus récent) :** sans Wi-Fi commun, deux téléphones {=Erevos} proches l’un de l’autre
  créent un petit Wi-Fi à eux (Wi-Fi Direct) et se parlent par lui comme sur le même Wi-Fi : plus rapide que le
  Bluetooth, et un appel passe par lui sans internet. Il ne demande rien ; chaque téléphone reste aussi sur son propre
  Wi-Fi là où il le peut. Toute personne à proximité peut savoir qu’un téléphone {=Erevos} est là, et pourrait rejoindre ce
  petit Wi-Fi, n’y obtenant que des octets scellés. Il faut que **Trouver Erevos sur le même Wi-Fi** soit activé ; pour
  arrêter celui-ci seul, désactive **Créer un Wi-Fi avec les téléphones à proximité** en dessous.
- **Sur un téléphone Samsung,** **Chercher avec Wi-Fi Aware** et **Créer un Wi-Fi avec les téléphones à proximité** sont
  désactivés tant que tu ne les actives pas : tant qu’une app les utilise, Samsung demande de désactiver son propre
  partage. Le Bluetooth et le même Wi-Fi fonctionnent sans eux.
- **Les autres téléphones à proximité** ne reçoivent que des octets scellés qu’ils ne peuvent pas ouvrir, et seulement
  jusqu’à ce que le téléphone de ton contact soit connu : à partir de là, ce que tu envoies va à lui seul. Les messages
  vocaux ne vont qu’à un contact qu’on sait proche. Les photos et les fichiers ont besoin du relais.
- **Avec un relais en plus,** chaque message passe aussi par lui, si bien que rien n’est perdu si la liaison tombe ; la
  copie qui arrive en second n’est pas affichée de nouveau. Si le relais est injoignable, c’est la copie à proximité qui
  compte.
- **Transportés par d’autres téléphones :** quand le relais est injoignable et que ton contact n’est pas proche, les
  téléphones {=Erevos} à proximité prennent aussi ton message, scellé pour le relais de ton contact. Chacun le garde, trois
  jours au plus, le donne à deux autres téléphones au plus qu’il croise, et le remet à ce relais par son propre relais
  dès qu’il le peut ; le tien fait de même. Ils ne peuvent pas le lire, ni savoir de qui il vient ni à qui il va : ils
  ne voient que l’adresse du relais. Il reste quand Erevos se ferme, scellé sur le téléphone. Les tiens restent dans ton
  espace, et ne partent que tant qu’il est ouvert. Transporter pour d’autres est activé tant que tu ne désactives pas
  **Transporter des messages pour d’autres** sous **À proximité, sans internet**, dans **Nouvelle discussion**, et
  seulement pour des relais sur internet en TLS (wss://) : un inconnu à proximité ne fait jamais joindre à ton
  téléphone, ni à ton relais, un relais sur un réseau local ou sur le téléphone lui-même. Tes propres messages sont
  transportés par les téléphones à proximité qui l’ont activé.
- **Apportés par d’autres téléphones :** dans l’autre sens, quand ton téléphone n’a pas internet, un téléphone Erevos
  à côté qui a internet, et transporte pour les autres, prend ce qui t’attend sur ton relais et te le donne à
  proximité. Erevos demande une fois pour chaque téléphone de ce genre, même celui d’un contact, car un inconnu peut
  faire passer les messages d’un contact pour sembler être lui, et seulement tant qu’il est au premier plan : **Un
  téléphone près de toi a internet. Doit-il apporter tes messages ?** Ce téléphone apprend quelle file d’attente de
  ton relais est la tienne et quand tu la lis ; jamais ce que disent tes messages, que seul ton téléphone ouvre.
  Connaissant la file, il pourrait prendre tes messages avant qu’ils t’arrivent, alors dès que ton téléphone a de
  nouveau internet il passe de lui-même à une nouvelle file et le dit discrètement à tes contacts. Pour les
  discussions masquées, il demande à part, et seulement quand elles sont à l’écran, car ce téléphone apprendrait qu’il
  y a une deuxième file, et donc qu’il peut y avoir des discussions masquées. Jamais pour un relais joint seulement
  par Tor. Ton téléphone fait de même pour les téléphones à côté tant que **Transporter des messages pour d’autres**
  est activé, jamais tant qu’il passe par Tor, et depuis un autre relais que le sien seulement une fois que tu dis
  oui, averti que ce relais voit alors l’adresse internet de ton téléphone.

**Pourquoi :** un paquet ne dit pas à qui il est destiné, si bien que personne à proximité ne peut savoir d’après lui à
qui il est. Tant que le téléphone de ton contact n’a pas répondu sur une liaison, ton téléphone ne peut pas non plus
savoir lequel des téléphones à proximité est le sien : les paquets courts vont donc à tous, chacun les essaie, et à
partir du premier qui s’ouvre, cette liaison est celle de ton contact. Un message vocal, en morceaux plus grands, attend
cela.

> Un message venu d’à proximité ne s’ouvre que dans l’espace qui a ce contact. Un message pour un autre espace de ce
> téléphone attend en mémoire, six heures au plus, que cet espace s’ouvre. Un message pour des discussions
> masquées ne s’ouvre que tant qu’elles sont ouvertes, ou reçoivent fermées, et attend de même jusque-là.

**Pourquoi :** les liaisons à proximité appartiennent au téléphone, pas à un espace, et rien sur elles n’en nomme un :
ce qui arrive est essayé dans les discussions de l’espace ouvert, et gardé un moment en mémoire pour les autres, jamais
écrit sur le téléphone. Les discussions masquées les
utilisent aussi, mais ce qu’elles entendent leur est propre : la liaison où un contact masqué a été entendu est gardée à
part de celle de l’espace, en mémoire seulement et seulement tant que ces discussions masquées sont ouvertes ou
reçoivent fermées, si bien que l’espace n’apprend jamais qu’un de leurs contacts est à proximité ; et dans l’air leurs
messages ressemblent à ceux de l’espace. Elles ne portent jamais les messages des autres, ne sont jamais portées, et ne
passent jamais par LoRa{~ ni par SMS}.

**Un Bluetooth qu’on ne peut pas suivre :** ce que votre téléphone émet en Bluetooth pour que d’autres le trouvent dit
seulement qu’un téléphone avec {=Erevos} est proche, avec un nombre aléatoire qui change toutes les neuf à douze minutes,
et sous Android 8 et plus depuis une adresse qui change avec lui. Quelqu’un qui écoute à un endroit puis à un autre ne
peut donc pas savoir que c’est le même téléphone, du moins par Erevos. Les liaisons établies le restent. Les téléphones
avec un {=Erevos} plus ancien trouvent le vôtre, et le vôtre les trouve, comme avant.

## Par une radio LoRa {#lora}

Avec une radio LoRa Meshtastic connectée au téléphone par Bluetooth, Erevos joint un autre Erevos qui a une radio sur le
même mesh, à des kilomètres, sans internet : directement, ou par les radios Meshtastic entre les deux. C’est désactivé
tant que tu ne configures pas de radio, et sur Android seulement.

1. Configure d’abord la radio dans l’app Meshtastic, sa **région** avant tout : sans région, elle n’émet rien. Puis
   ferme l’app Meshtastic, ou déconnecte-la là-bas : une radio ne se connecte qu’à une app à la fois.
2. Ouvre **Réglages** → **Relais et réseaux** → **Radio LoRa**, appuie sur **Trouver ma radio**, lis ce qui est dit, et
   appuie sur ta radio quand elle apparaît. Une radio pas encore appairée demande son code PIN : il s’affiche sur
   l’écran de la radio, ou c’est 123456.
3. Ton contact fait de même avec la sienne, sur le même mesh : la même région et le même premier canal.
4. Écris comme d’habitude. Quand le relais est injoignable et qu’aucun téléphone n’est proche, un texte part par LoRa,
   et la ligne sous la discussion le dit.

- **Du texte seulement, et lentement :** un message part en morceaux d’environ 220 octets, chacun une seconde ou deux
  sur les ondes, et la loi limite le temps d’émission d’une radio (dans l’UE, un dixième de chaque heure). LoRa ne prend
  donc que des textes et des suppressions, et seulement quand rien d’autre ne le fait. Les messages vocaux, photos et
  fichiers attendent dans la discussion, marqués **En attente**, et partent tout seuls dès que le relais ou un téléphone
  à proximité peut les recevoir ; les appels ont aussi besoin de l’un des deux. Le premier message à un contact prend
  plus de temps, car il contient les clés.
- **Marques :** **✓✓** arrive avec son prochain message, car les marques seules ne passent pas par LoRa.
- **Pièces de secours, et textes longs compressés :** un message de deux pièces ou plus part avec des pièces de
  secours après lui, une pour quatre, pour que l’Erevos de ton contact refasse les pièces perdues en route, sans rien
  renvoyer ; elles prennent un peu plus de temps d’antenne. Un texte long part compressé, plus petit et sans rien
  perdre, vers un contact dont l’Erevos lit les messages compressés, il prend ainsi moins de pièces, ou tient tout
  court ; un texte court part tel quel.
- **À toutes les radios à portée :** chaque message est entendu par toutes les radios alentour, et retransmis par les
  radios Meshtastic, comme le fait Meshtastic. Chaque Erevos l’essaie ; seul celui de ton contact l’ouvre. Rien n’est
  transporté pour d’autres par LoRa.
- **Son nom et sa position :** les radios Meshtastic annoncent de temps en temps leur nom à toutes les radios à portée,
  et leur position si elles ont un GPS ou une position fixe, en clair. Erevos empêche la tienne de le faire (**Gardés
  secrets**) : il règle son rôle sur Client hidden, coupe son GPS et supprime une position fixe. Elle répond encore à
  une radio qui demande son nom, alors donne-lui un nom qui ne dit rien de toi, dans l’app Meshtastic. **Annoncés à tous
  à portée** remet son rôle et son GPS, après un avertissement ; une position fixe se redéfinit dans l’app Meshtastic.
  Si la radio ne garde pas les réglages, l’écran LoRa le dit.
- **Elle reste connectée** tant qu’Erevos tourne, et se reconnecte toute seule quand la radio revient à portée.
  **Désactiver LoRa** rend à la radio son rôle et son GPS, si elle est connectée, puis la déconnecte et l’oublie. Les
  discussions masquées ne passent jamais par LoRa.

**Pourquoi :** ce qu’une radio Meshtastic dit d’elle-même part en clair, vers quiconque écoute à des kilomètres : son
nom et sa position pourraient montrer où tu es et relier la radio à toi, donc Erevos la fait taire sauf si tu choisis
autrement. Et comme la loi limite le temps d’émission d’une radio, LoRa est réservé à tes propres textes, quand rien
d’autre ne peut les prendre, jamais à ce que d’autres téléphones voudraient lui faire transporter.

> Une radio LoRa s’entend à des kilomètres, et son signal peut être localisé, qu’elle se taise ou non. Ce qu’Erevos
> envoie reste chiffré de bout en bout, mais quiconque a une radio peut savoir que la tienne émet, quand et combien.
> Avec **Annoncés à tous à portée**, quiconque a une radio peut aussi lire son nom et sa position.

## Discuter par un relais {#relay}

Un relais est un petit serveur qui garde des files d’attente à sens unique : chaque téléphone a sa propre file, et
quiconque a son **lien de contact** peut y déposer des messages. Le relais ne contient ni comptes, ni noms, ni numéros
de téléphone, et ne peut pas lire les messages : ils sont chiffrés de bout en bout, et seuls les deux téléphones ont les
clés. Chaque téléphone peut utiliser son propre relais : un message à un contact sur un autre relais est scellé pour le
sien et remis au tien, qui le transmet, si bien que son relais ne voit jamais l’adresse de ton téléphone. Un téléphone
sans relais obtient une place sur celui de son contact, voir **Pas de relais à toi** ci-dessous.

**Pourquoi :** avec des files d’attente et sans comptes, aucun serveur ne détient une liste de qui connaît qui, et
personne n’a besoin de ton numéro de téléphone ou de ton e-mail pour te joindre : quiconque a ton lien de contact peut
écrire dans ta file, et toi seul la lis.

1. Sur l’écran d’accueil, appuie sur **Nouvelle discussion**. Tant qu’il manque quelque chose, **Comment tu te connectes maintenant** dit en haut en
   mots simples comment tes contacts te joignent : par ton relais, par Nostr sans relais, ou seulement à proximité ; quand
   tout fonctionne, il n’est pas affiché. Avec un relais, un champ tout en haut trouve un contact par son nom ou ajoute
   un lien collé dedans, et en dessous viennent **Ton code QR**, avec **A déjà {=Erevos}** et **Nouveau sur {=Erevos}** au-dessus, et des lignes pour **Ton lien
   de contact** et d’autres ; un téléphone qui n’a pas encore de relais commence par **Commence par une invitation**.
   Les réglages propres du relais sont sous **Pour les utilisateurs avancés**,
   en bas ; **Réglages** → **Relais et réseaux** → **Relais** ouvre Nouvelle discussion avec ceux-ci ouverts.
2. Sous **Pour les utilisateurs avancés**, tape l’**Adresse du relais** : \`ws://<adresse de l’ordinateur>:7879\` pour
   un relais sur ton propre réseau, ou \`wss://relay.example.org\` pour un relais sur internet. Ajoute le **Jeton** si
   le relais en demande un.
3. Erevos crée ta file dessus tout seul, quelques secondes plus tard, et dit **File d’attente créée sur le relais** : tout fonctionne, textes, photos, messages vocaux, appels et
   groupes, et **Comment tu te connectes maintenant** disparaît, car il ne manque rien. S’il n’y arrive pas, la note dit pourquoi ; **Créer ma file d’attente sur le relais**, sous l’adresse, réessaie.
4. **Ton code QR** est sur Nouvelle discussion même, dès qu’elle s’ouvre. Laisse l’autre téléphone le scanner avec son
   appareil photo, puis ouvrir le lien dans Erevos. L’écran **Ajouter un contact** montre ce qu’il contient : appuie
   sur **Ajouter à la discussion** seulement si tu l’as scanné toi-même. **Ajouter et associer à un de mes contacts**
   l’ajoute aussi, relié au contact que tu choisis, dont la discussion prend le nom.
   Le code est court, donc n’importe quel appareil photo le lit. Qui le scanne répond avec son propre lien de contact, puis ce téléphone lui écrit en premier. Le code est nouveau à chaque ouverture de Nouvelle discussion, et vaut une fois : le premier qui le scanne devient un contact aussitôt ; qui le scanne ensuite, ou prend le lien que tu partages, écrit d’abord une demande de message. **Grand code QR, sans internet** montre à la place le code entier, qui marche à proximité sans internet, et **Petit code QR** revient en arrière. **Partager**, en dessous, envoie un lien court que toute application laisse toucher ; sur Android, il ouvre Erevos, qui demande avant de le prendre. Pour ajouter quelqu’un avec son code QR de contact, ton téléphone a d’abord besoin d’un relais.
   Ce code QR ne marche que si les deux téléphones ont un relais, comme le dit la carte. Pour quelqu’un qui n’a pas
   encore {=Erevos}, ou dont le téléphone n’a pas de relais, choisis plutôt **Nouveau sur {=Erevos}**, au-dessus : la carte
   montre **Invitation à {=Erevos}**, une invitation avec laquelle son téléphone rejoint ton relais, comme dans Inviter
   quelqu’un de nouveau, plus bas. Nouvelle discussion montre ce que tu as choisi la dernière fois.
   Il en va de même par contact : tant que le petit code de contact s’affiche et que le NFC est activé sur Android,
   l’autre téléphone le prend si tu poses son dos contre le dos du tien. Cela ne marche que lorsqu’Erevos est au premier
   plan, pas en arrière-plan, et jamais avec le grand code QR.
5. Si son appareil photo ne montre que le texte, ou si la personne est loin, appuie sur **Partager** sous ton code QR,
   ou ouvre **Ton lien de contact** et appuie sur **Partager mon lien de contact**, et envoie-le-lui. Elle le colle dans
   le champ en haut de **Nouvelle discussion** et appuie sur **Ajouter**.
6. Ou dans l’autre sens : appuie sur **Scanner le sien**, sous ton code QR, et photographie le code sur son écran, ou
   appuie sur **Depuis une photo de son code QR** pour une capture d’écran ou une photo du code qu’elle t’a envoyée.
   Erevos le lit et l’ajoute aussitôt. Sur un ordinateur, sur Sailfish OS et dans l’app web, **Scanner le sien**
   demande une photo de ce code ; sur un iPhone, il propose aussi l’appareil photo.
   Les discussions masquées ont aussi les deux ; là, le champ du haut ne prend qu’un lien.
7. Ou, avec quelqu’un à côté de toi ou au téléphone : appuie sur **Associer avec un code** dans **Nouvelle
   discussion**. L’un appuie sur **Montrer un code** et dit ou montre les 8 chiffres ; l’autre appuie sur **Taper son
   code** et les tape. Chaque téléphone a alors l’autre pour contact, comme si chacun avait scanné le code QR de l’autre.
   Le code lui-même ne quitte jamais les téléphones : ils se prouvent l’un à l’autre qu’ils le connaissent, et leurs
   liens de contact partent chiffrés avec une clé que seul le même code donne. Ils se retrouvent sur des relais Nostr
   publics, qui ne voient ni le code ni les liens, et qui devine a 3 essais avant que le code ne se ferme. Un code dure
   10 minutes.

La nouvelle discussion apparaît sur l’écran d’accueil nommée **contact** suivi des premiers caractères de sa clé,
jusqu’à ce qu’elle ait un nom : **Renommer** dans ses détails lui en donne un. Juste après que tu l’as ajouté ici,
**Associer à un de mes contacts** sous la note qui dit qu’il a été ajouté te permet de choisir plutôt un de tes contacts
(**Pas maintenant** laisse comme c’est) : la discussion prend le nom de ce contact, si elle n’en a pas à elle, et la
fiche du contact montre la discussion. Les discussions masquées ne proposent que leurs propres contacts, jamais ceux du
téléphone. Il suffit qu’un téléphone ajoute l’autre : ajouter un lien démarre une conversation chiffrée et dit à l’autre
téléphone comment répondre, si bien qu’il affiche la discussion la prochaine fois qu’il regarde sa file d’attente, ce
qu’il fait toutes les quelques secondes.

**Ce que le relais voit d’une discussion :** tous tes contacts écrivent dans ton unique file d’attente. Dès que chaque
téléphone a reçu un message de l’autre, chaque message entre eux est scellé une fois de plus pour le téléphone auquel il
va, avec une clé que ce téléphone a donnée dans la discussion, si bien que pour le relais chacun est une suite d’octets
aléatoires de l’une de quelques tailles, et il ne peut pas savoir d’après eux à quelle conversation ils appartiennent.
Le premier message d’une discussion, et tout message envoyé avant que la réponse arrive, le montrent encore. Le relais
voit toujours quelle adresse dépose chaque message, et quand. Et chacun dit au relais, dans un octet qu’il lit, ce qu’il
transporte : un message que quelqu’un lit, des échanges entre téléphones (qu’un message est arrivé ou a été lu, la
saisie, la présence en ligne, les réactions, de nouvelles clés), ou un appel qui sonne. Le relais voit donc lesquels
sont des messages, et quand un appel commence, que les notifications soient activées ou non : c’est ainsi que la
notification d’une app web fermée peut les compter, de même que la notification des discussions masquées fermées.

### Les façons d’entrer sur le relais

Un relais qui demande un jeton laisse entrer un téléphone de trois façons. Chaque façon aboutit à un jeton propre au
téléphone sur ce relais, si bien que celui qui fait tourner le relais peut retirer n’importe quel téléphone à lui seul.

- **Une invitation :** un code QR ou un lien d’un téléphone déjà sur le relais (voir Inviter quelqu’un de nouveau
  ci-dessous). Rien à taper, et vous êtes contacts aussitôt.
- **Un compte :** **Se connecter avec LPHL**, quand le relais le propose (voir Se connecter au relais ci-dessous).
  N’importe quel compte LPHL le peut, sur 10 téléphones au plus.
- **Le jeton du relais :** le jeton unique pour tous, donné par celui qui fait tourner le relais, tapé sous **Jeton**.
  Erevos l’échange aussitôt, tout seul, contre un jeton propre au téléphone, nommé là-bas comme tu te nommes dans les
  invitations (\`phone\` quand tu n’as donné aucun nom), le dit, et n’utilise plus que celui-ci à partir de là. Ce
  téléphone peut donc aussi inviter. Il faut un relais qui accepte les invitations, postérieur à Erevos 3.1.0 ; avec un
  plus ancien, ou un qui n’accepte pas d’invitations, le téléphone garde le jeton du relais et ne peut pas inviter.
- **Les limites :** un téléphone peut avoir 5 invitations en attente à la fois et en créer 10 par jour (le jour selon
  UTC) ; chacune est pour un téléphone et dure 7 jours. Le relais laisse entrer 100 téléphones par invitation en tout,
  les invitations encore en attente comptant aussi, sauf si son opérateur en a décidé autrement. Les téléphones venus
  avec un compte ou avec le jeton du relais ne comptent pas dans ces 100 : le relais donne un jeton propre à 50
  téléphones par jour venus avec son jeton, et un compte a 10 téléphones. Le relais sert 512 connexions à la fois,
  quelles qu’elles soient, sauf si son opérateur en a décidé autrement.
- **Retirer un téléphone :** celui qui fait tourner le relais supprime sa ligne dans le fichier des jetons du relais :
  le téléphone ne peut plus utiliser le relais, tandis que les téléphones qu’il a invités gardent le leur. S’il a jamais
  eu le jeton du relais, il faut aussi changer ce jeton, pour qu’il ne puisse pas revenir avec. Les téléphones qui ont
  leur propre jeton continuent comme avant : seul un téléphone où l’ancien jeton est encore tapé (pas ouvert depuis, ou
  avec un {=Erevos} plus ancien) a besoin du nouveau.
- **Les discussions masquées** gardent le jeton du relais tapé pour elles : l’échanger au même moment que celui de
  l’espace montrerait au relais qu’elles sont celles de ce téléphone. Quand le jeton du relais change, tape le nouveau
  sous leur **Pour les utilisateurs avancés**.

**Pourquoi :** le relais donne à chaque connexion son propre fil d’exécution, il n’en sert donc qu’un nombre limité à la
fois ; et il n’ajoute qu’un nombre limité de lignes par jour pour les téléphones venus avec son jeton unique, si bien
qu’un jeton parti là où il ne devait pas ne peut pas remplir son fichier de jetons.

### Inviter quelqu’un de nouveau

Un code QR ou un lien fait entrer quelqu’un de nouveau : son téléphone rejoint {=Erevos} sur ton relais, avec un accès à
lui, sans rien taper, et vous êtes aussitôt contacts l’un de l’autre, sans demande de message.

- **Pour inviter :** sur l’écran d’accueil, appuie sur **Inviter** à côté de la ligne du relais ou, sur **Nouvelle
  discussion**, choisis **Nouveau sur {=Erevos}** au-dessus du code QR. Le code QR s’affiche tout de suite : quand {=Erevos}
  est sur son téléphone, la personne le scanne avec l’appareil photo et ouvre le lien dans Erevos, ou appuie sur
  **Partager l’invitation** et envoie-lui le lien. En dessous, tu peux taper pour qui c’est (son nom dans tes
  discussions) et **Ton nom, pour cette personne**, ou laisser les deux vides. Rouverte tant que personne ne l’a prise
  et qu’il lui reste au moins un jour, elle montre la même invitation, et n’use donc aucune des 5 en attente ni des 10
  par jour ; **Inviter quelqu’un d’autre** en crée une nouvelle. Elle est pour une personne, pour 7 jours, ou moins si
  l’invitation du relais finit plus tôt. Celui qui la prend en premier l’a, donc donne-la à cette personne seulement.
  Sur un téléphone Android dont le NFC est activé, tu peux aussi la lui donner par contact : pose le dos de son
  téléphone contre le dos du tien pendant que le code s’affiche, et son téléphone ouvre le lien tout seul, dans Erevos
  s’il est installé, sinon sur la page web d’Erevos, qui propose {=Erevos}. Si le NFC est désactivé, la fenêtre te dit de
  l’activer dans les réglages d’Android.
- **Pour rejoindre :** sur un téléphone qui n’a pas encore de relais, **Nouvelle discussion** commence par **Commence
  par une invitation**. Appuie sur **Scanner son code QR** et photographie l’invitation sur son écran, ou appuie sur
  **Depuis une photo de son code QR**, ou colle le lien dans le champ là et appuie sur **Rejoindre** ; la scanner avec
  l’appareil photo et ouvrir le lien dans Erevos marche aussi. Le lien ouvre **… t’invite sur {=Erevos}** : appuie sur
  **Rejoindre** seulement s’il vient de cette personne. Erevos prend un accès à lui sur son relais et une file
  d’attente là-bas, l’ajoute et dit **Bienvenue sur Erevos**. Son premier message prévient le téléphone de la personne,
  qui ajoute aussitôt celui-ci comme contact, nommé comme elle l’a tapé.
- **Les autres façons d’entrer :** en dessous, **Pour les utilisateurs avancés** ouvre les autres, pour qui les
  cherche : **Se connecter avec LPHL** connecte ce téléphone au relais de LPHL avec un compte LPHL, dans le navigateur
  (voir Se connecter au relais ci-dessous), puis tu ajoutes tes contacts par leurs invitations ou leurs liens ;
  **Commencer sans relais**, comme dans Sans aucun relais, sous Par Nostr ; et les réglages du relais, comme aux
  étapes 1 à 6 ci-dessus. Une invitation est la façon la plus simple d’entrer, et sur le relais un téléphone invité
  n’a qu’un nom de lettres et de chiffres au hasard.
- **Un autre relais :** sous **Se connecter avec LPHL**, **Se connecter à un autre relais…** prend l’adresse d’un autre
  relais, telle que son responsable te l’a donnée, par exemple relay.example.org : la carte s’y connecte alors, au nom
  des comptes que ce relais accepte, ou dit qu’il ne propose pas de connexion, et son responsable peut alors te donner
  une invitation. **Revenir à** ramène celui de LPHL.
- **Ce que ton relais doit permettre :** l’accès à lui est une invitation à ton relais (voir Invitations au relais
  ci-dessous), donc il ne vient que d’un téléphone qui a son propre jeton sur un relais qui accepte les invitations. Il
  compte parmi tes invitations, sous un nom de lettres et de chiffres au hasard, et reste même quand le tien disparaît.
  Un téléphone qui a le jeton unique du relais pour tous l’échange d’abord contre un jeton à lui (voir Les façons
  d’entrer sur le relais ci-dessus) ; là où le relais ne le fait pas, il ne crée pas d’invitation : connecte-toi d’abord
  au relais (sous le **Jeton**, dans **Pour les utilisateurs avancés**), ou prends une invitation à celui-ci. Quand ton
  relais n’accepte pas d’invitations, l’invitation fait quand même de vous des contacts, et son téléphone n’utilise ton
  relais que dans la mesure où ton lien de contact le permet, comme dans Pas de relais à toi ci-dessous.
- **Un téléphone qui a déjà un relais** garde le sien : l’invitation ne fait que t’ajouter, et vous êtes aussitôt
  contacts tout de même.
- **Ce qui est gardé :** ton téléphone garde le secret de chaque invitation et le nom de la personne, scellés dans
  l’espace, jusqu’à ce qu’elle soit utilisée ou que ses 7 jours se terminent, 20 au plus à la fois. Rien de tout cela
  n’est sur le relais, sauf l’invitation au relais.
- [~] **Par SMS, à quelqu’un qui n’a pas encore {=Erevos} :** sur Android, la fiche d’un contact qui n’est pas dans Erevos a
  **Inviter par SMS**. Ce bouton écrit un SMS à son premier numéro avec un lien court, dans l’app SMS (celle d’Erevos
  quand c’est l’app SMS du téléphone), que tu envoies ou non. La page du lien sur le serveur web de LPHL propose {=Erevos}
  à la personne (l’app Android, ou l’app web sur un iPhone) puis y ouvre l’invitation ; dans l’app web sur un iPhone,
  elle colle le lien sous **J’ai une invitation**. Elle appuie sur **Rejoindre** : son téléphone rejoint ton relais
  comme ci-dessus et répond au tien par lui, ce qui l’ajoute, reliée à ce numéro et nommée comme sur la fiche. Son
  premier message, qui part tout seul, fait de toi son contact, nommé comme tu t’es nommé dans ta dernière invitation.
  L’invitation suit le **#** dans le lien, qui n’est envoyé à aucun serveur web, mais l’opérateur téléphonique voit le
  SMS, comme tout SMS : elle est donc pour une personne, pour deux jours, et quand les deux jours se terminent sans
  qu’aucun téléphone l’ait utilisée, ton téléphone reprend son invitation au relais. Il faut un relais qui permet à ton
  téléphone d’inviter, comme ci-dessus.

### Pas de relais à toi

Un téléphone sans relais discute tout de même par internet : en ajoutant le lien d’un contact dont le relais prête des
places, il prend une place là-bas, sans jeton.

- **Comment :** ajoute son lien comme aux étapes 4 et 5, sans rien sous **Relais**. Erevos dit que tu as maintenant une
  place sur son relais, prêtée par son lien, et l’utilise désormais comme la tienne : ton propre lien la nomme, si bien
  que d’autres te joignent là aussi.
- **Qui prête :** ton lien porte un ticket pour une place sur ton relais seulement quand tu actives **Partager une place
  sur mon relais avec ce lien**, sous **Ton lien de contact** dans **Nouvelle discussion**, et seulement pour le lien
  affiché à ce moment-là : la prochaine fois que la discussion s’ouvre, c’est de nouveau désactivé. Le relais a besoin
  d’une clé pour l’envoi en deux sauts, et ne prête qu’une fois que celui qui le fait tourner active le prêt ; il peut
  aussi reprendre les places d’un ticket. Un ticket dure 30 jours et donne jusqu’à quatre places. Quiconque voit un lien
  avec un ticket peut prendre une place avec, alors ne donne un tel lien qu’à qui tu le destines.
- **Ce qu’une place prêtée ne fait pas :** les messages à des contacts sur d’autres relais vont directement à leur
  relais, qui voit alors l’adresse de ton téléphone. Elle ne garde rien pour plus tard (un message envoyé plus tard
  attend sur le téléphone), ne donne pas de relais d’appel (les appels passent directement entre les téléphones), et
  crée 4 files d’attente de plus et envoie 50 Mo de fichiers par jour au plus. Ton lien ne prête rien plus loin.
- **Ton propre relais à la place :** tape son adresse sous **Relais** : la place prêtée est rendue, et tes contacts
  apprennent la nouvelle par ton prochain message.
- **Un lien sans ticket** (d’un relais ou d’un Erevos plus ancien) : un relais qui ne demande pas de jeton est utilisé
  tel quel ; sinon vous ne vous joignez qu’à proximité, jusqu’à ce que tu aies un relais.

**Pourquoi :** un lien avec un ticket est une clé de ton relais pour quiconque le voit, donc ton lien n’en porte un que
quand tu le choisis, pour le lien affiché à ce moment-là, et le relais ne prête qu’une fois que celui qui le fait
tourner le permet. Les fichiers d’une place prêtée sont limités à quelques photos et messages vocaux par jour, si bien
qu’elle ne prend jamais tout le stockage du relais.

### Invitations au relais

Un téléphone qui a son propre jeton sur un relais qui accepte les invitations peut laisser un téléphone de plus utiliser
ce relais, avec un jeton propre à ce téléphone, si bien qu’aucun jeton n’est tapé ni transmis.

- **Pour inviter :** sous **Pour les utilisateurs avancés** dans **Nouvelle discussion**, sous le **Jeton**, appuie sur
  **Inviter sur le relais**, tape pour qui c’est et appuie sur **Créer l’invitation**. Un code QR s’ouvre : laisse son
  téléphone le scanner avec son appareil photo et ouvrir le lien dans Erevos, ou appuie sur **Partager l’invitation** et
  envoie-la-lui. Elle vaut pour un téléphone pendant 7 jours, et qui la prend en premier l’a, alors ne la montre qu’à
  cette personne.
- **Pour en prendre une :** le lien ouvre **Invitation à un relais**, avec l’adresse du relais : appuie sur **Utiliser
  ce relais** seulement si elle vient de quelqu’un que tu connais. Dans Erevos, **Scanner le sien** et **Depuis une
  photo de son code QR** sur Nouvelle discussion lisent aussi une invitation, et son lien peut être collé dans le champ
  du haut. Erevos crée un jeton pour ce téléphone, le garde avec l’adresse du relais dans cet espace seulement
  et y crée ta file d’attente. Si le téléphone utilise un autre relais, il demande d’abord, et tes contacts apprennent
  ta nouvelle file d’attente par ton prochain message. Erevos accepte une invitation à un relais wss://, ou à un relais
  ws:// sur un réseau domestique seulement (comme \`ws://192.168.1.10:7879\`). Les discussions masquées n’acceptent pas
  d’invitations.
- **Tes invitations :** listées sous le bouton, en attente ou utilisées. **Reprendre** reprend une invitation encore en
  attente, ou coupe aussitôt le téléphone qui l’a prise, lui seul : les téléphones qu’il a invités à son tour gardent le
  leur.
- **Le leur reste :** un téléphone que tu as invité garde sa ligne sur le relais même quand la tienne disparaît, parce
  que le téléphone qui t’a invité l’a reprise, que le compte avec lequel tu t’es connecté ne peut plus utiliser le
  relais, ou que son opérateur l’a retirée, et de même les téléphones qu’il a invités. Seules tes invitations encore en
  attente ne laissent alors plus entrer personne.
- **Ce que le relais garde :** pour ce téléphone un nom de lettres et de chiffres au hasard, qui ne dit rien de qui il
  est (le nom que tu as tapé reste sur ton téléphone ; un Erevos d’avant la 6.0.0 donnait ce nom au relais, en lettres
  latines), le fait que tu l’as invité, et une empreinte de son jeton, pas le jeton. Celui qui fait tourner le relais
  voit cela, et peut en retirer n’importe quel téléphone. Un téléphone peut avoir 5 invitations en attente à la fois, et
  en créer 10 par jour, et le relais ne laisse entrer qu’un nombre limité de téléphones par invitation (100, sauf si son
  opérateur en a décidé autrement).
- **Qui peut inviter :** un téléphone qui a son propre jeton, sur un relais dont l’opérateur a activé les invitations
  (voir [Faire tourner ton propre relais](#own-relay)). Un téléphone qui a le jeton unique du relais pour tous l’échange
  d’abord contre un jeton à lui (voir Les façons d’entrer sur le relais ci-dessus). Avec une place prêtée, il n’y a pas
  d’**Inviter sur le relais**.

**Pourquoi :** le relais ne garde qu’une empreinte de chaque jeton, jamais le jeton, si bien que son fichier n’apprend à
personne comment se connecter. Et une invitation nomme un relais wss://, ou un relais ws:// à la maison, si bien qu’elle
ne peut jamais faire partir en clair les requêtes de ton téléphone à travers internet.

### Se connecter au relais

Un relais peut laisser des téléphones se connecter avec un compte auquel son opérateur fait confiance, comme LPHL, pour
obtenir un jeton à eux, sans rien à taper dans Erevos.

- **Pour te connecter :** tape l’adresse du relais sous **Relais**. Quand le relais le propose, **Se connecter avec
  LPHL** apparaît sous le **Jeton**. Appuie dessus : le navigateur ouvre la page de connexion, où tu tapes ton nom et
  ton mot de passe, qu’Erevos ne voit jamais. La page du relais montre alors six chiffres. Sur Android, appuie là sur
  **Ouvrir {=Erevos}** et Erevos termine la connexion tout seul ; sinon, tape-les comme décrit ensuite. De retour dans
  Erevos, qui te place directement dans **Code de la page**, tape-les là et appuie sur **Terminer la connexion** : le
  téléphone garde son jeton avec l’adresse du relais dans cet espace seulement, et y crée ta file d’attente. Ne tape
  le code que dans Erevos sur ton propre téléphone et ne le donne à personne, même si on te le demande : qui le tape
  utilise le relais en ton nom. Après 5 codes erronés, la connexion est terminée : reconnecte-toi. Erevos n’ouvre
  qu’une page de connexion à l’adresse propre du relais, en https.
- **Se reconnecter** sur le même téléphone prend la place de sa ligne sur le relais, quand son jeton est celui qu’il a
  obtenu de ce relais. Chaque téléphone obtient sa propre ligne, 10 au plus pour un compte.
- **Ce que voient le relais et LPHL :** le relais nomme la ligne du téléphone d’après ton nom d’utilisateur
  (\`lphl:nekten\`), et chaque heure il demande à LPHL si le compte peut encore l’utiliser : dès que le compte est fermé
  ou désactivé, ou que LPHL ne peut pas être interrogé pendant 3 jours, la ligne disparaît, et le téléphone ne peut plus
  utiliser le relais ; les téléphones qu’il a invités gardent le leur. LPHL voit chaque connexion et ces vérifications,
  mais rien de tes espaces, discussions ou contacts. Se connecter depuis un autre espace avec le même compte montre au
  relais que les deux sont à toi.
- **Les discussions masquées** ne se connectent pas.

**Pourquoi :** la page montre le code et tu le tapes dans Erevos, pas l’inverse, si bien qu’un lien de connexion que
quelqu’un d’autre t’envoie ne lui apporte rien : seul celui qui s’est connecté voit le code, et cinq codes erronés y
mettent fin. Erevos n’ouvre une page de connexion qu’à l’adresse propre du relais, en https, si bien que rien qui
répond à la place du relais ne peut t’envoyer vers une page ailleurs. Et un fournisseur qu’on ne peut pas interroger
pendant un moment ne coupe aucun téléphone aussitôt : seuls 3 jours sans bonne réponse le font. Et le bouton **Ouvrir
Erevos** est tout aussi sûr : le lien ne contient que les six chiffres, qui ne revendiquent rien sans le secret que
seul détient le téléphone qui a commencé la connexion, si bien qu’une application qui aurait intercepté le lien
n’obtient rien.

### La clé propre du relais

Dès qu’Erevos connaît la clé de ton relais (il la demande au relais la première fois, ou un lien de contact la donne),
chaque connexion à ce relais commence par une vérification : le relais doit prouver qu’il détient cette clé, et le jeton
et tout ce qui suit partent chiffrés pour cette clé, à l’intérieur du chiffrement propre de la connexion (TLS). Sous
**Comment tu te connectes maintenant**, Erevos dit alors que ton relais a prouvé sa propre clé. À partir de là, cet
espace ne joint jamais ce relais sans la vérification.

- Un relais plus ancien que cette app ne prouve rien : il fonctionne comme avant, et **Comment tu te connectes
  maintenant** dit qu’il est plus ancien. Erevos réessaie toutes les heures.
- Un relais qui ne peut pas prouver la clé qu’Erevos garde pour lui n’obtient rien, et tes messages attendent ;
  **Comment tu te connectes maintenant** le dit en rouge. Seulement si son opérateur t’a dit qu’il a une nouvelle clé,
  appuie sur **Il a une nouvelle clé** : Erevos prend alors la clé que le relais donne ensuite.

**Pourquoi :** le certificat de la connexion dit seulement que celui qui répond détient un certificat pour le nom du
relais, ce qu’une entreprise qui délivre des certificats peut aussi donner à quelqu’un d’autre, par erreur ou sous la
contrainte. La clé propre du relais n’est que sur son serveur, si bien que personne entre les deux ne peut se faire
passer pour lui, et un certificat renouvelé ne change rien.

### Le numéro de sécurité

Ouvre la discussion, appuie sur son nom puis sur **Numéro de sécurité**. Les deux téléphones montrent les mêmes 60
chiffres pour vous deux. Compare-les en personne ou lors d’un appel : s’ils correspondent, personne n’est entre vous.
S’ils diffèrent, ne fais pas confiance à cette discussion, et ajoute de nouveau le lien, scanné depuis son propre
téléphone. Dès que ton contact a associé un appareil, il dit aussi quand la liste de ses appareils a changé pour la
dernière fois : tes messages vont aussi à chaque élément de cette liste, donc s’il n’a pas associé ou dissocié
d’appareil à ce moment-là, demande-lui.

Côte à côte, vous pouvez vérifier avec des codes au lieu de lire les chiffres : sous le numéro, chaque téléphone
montre un code QR. Touchez **Photographier son code** et photographiez le code de son téléphone, puis laissez-le faire
de même avec le vôtre. Quand ça correspond, la ligne indique **Vérifié en personne**. Chaque téléphone marque l’autre
seulement d’après ce qu’il a vu lui-même, et rien n’est envoyé. S’il dit que ça ne correspond pas, quelqu’un est
peut-être entre vous : ne faites pas confiance à cette discussion. **Choisir une photo de son code** vérifie à la
place une photo de son code que vous avez déjà. La marque **Vérifié en personne**, avec le jour, reste jusqu’à ce que
vous touchiez **Retirer la marque**. Elle reste sur ce téléphone, suit la discussion quand elle entre dans les
discussions masquées ou en sort, et n’est pas transmise à vos appareils associés. Un code d’un {=Erevos} plus récent le
dit : mettez Erevos à jour, puis refaites la photo.

**Pourquoi :** le code ne contient qu’un hash de vos deux clés, dans un ordre qui distingue les deux téléphones : une
photo de votre propre écran ne vérifie donc rien, et une photo du code ne dit pas qui vous êtes à quelqu’un qui n’a
pas déjà les deux clés.

### Présenter deux contacts

Dans les détails de la discussion d’un contact, **Présenter à un contact** vous laisse choisir un autre de vos contacts
et **Demander aux deux**. Chacun est sollicité dans votre discussion avec lui, par un message qui nomme l’autre comme
vous l’avez nommé ; les deux doivent avoir un nom. Chacun répond **Dire oui** ou **Dire non** dans cette discussion. Ils
ne deviennent contacts que si les deux disent oui : celui depuis la discussion duquel vous avez fait la présentation
écrit en premier, et le téléphone de l’autre l’accepte aussitôt, nommé comme vous l’avez nommé. Si l’un dit non, rien ne
se passe, et l’autre n’en est pas informé. Une présentation attend une semaine.

**Pourquoi :** tout passe dans le chiffrement de vos discussions avec chacun, si bien qu’aucun relais ne voit qui est
présenté à qui. Vous ne transmettez que le lien de contact que le second a choisi de donner, après avoir dit oui. Comme
celui qui présente pourrait faire passer quelqu’un d’autre, comparez le numéro de sécurité avec le nouveau contact comme
avec tout autre.

### Envoyé, arrivé et lu

Au-dessus du premier message de chaque jour, dans chaque discussion, groupes et Discussion avec moi-même compris, le
jour se voit nettement : **Aujourd’hui**, **Hier**, le jour de la semaine dans la dernière semaine, et avant le jour
avec sa date, comme **Mardi 10 novembre**.

Sous chacun de tes messages à un contact, **✓** dit que le relais ou un téléphone à proximité l’a pris, **✓✓** qu’il est
arrivé sur son téléphone, et **✓✓✓** qu’il l’a lu. Son téléphone le dit au tien, à l’intérieur du chiffrement, la
prochaine fois que chacun regarde le relais, ou aussitôt quand vous êtes proches. Un message compte comme lu dès que sa
discussion s’affiche à l’écran. **Tout marquer comme lu** dans le menu ⋮ compte de même : leurs téléphones en sont
informés au prochain coup d’œil au relais.

Dans un groupe qui n’est pas public, tes messages ont les mêmes marques, pour tous les autres membres à la fois :
**✓** une fois envoyé, **✓✓** quand le message est arrivé sur le téléphone de chaque membre qui était dans le groupe
quand tu l’as envoyé, et **✓✓✓** quand tous l’ont lu. Le téléphone de chaque membre le dit au tien, dans un message de
groupe discret destiné à toi seul, chiffré de bout en bout comme le reste du groupe : que le message est arrivé,
quelques secondes après (avec les autres arrivés entre-temps, en un seul), et qu’il a été lu, dès que le groupe
s’affiche à l’écran. Maintiens un de tes messages et choisis **Qui l’a lu** pour voir qui l’a lu et quand, sur le
téléphone de qui il est arrivé et quand, et qui n’a encore fait ni l’un ni l’autre, sous **Pas encore**. Un membre
dont l’{=Erevos} est plus ancien que ces marques ne dit rien, donc il reste sous **Pas encore** et le message reste à
**✓**. Les groupes publics n’ont pas de marques. Un ordinateur associé à ce téléphone montre les mêmes marques.

- **Envoi… :** au moment où tu appuies sur Envoyer, le téléphone vibre brièvement, le champ se vide et le message
  s’affiche, marqué **Envoi…** jusqu’à ce que le relais ou son téléphone le prenne. S’il ne peut ni partir ni attendre,
  ses mots retournent dans le champ. Quitter la discussion pendant qu’il affiche **Envoi…** ne le perd pas : il part,
  ou attend, marqué **En attente**.
- **En attente :** un message que rien n’a pu prendre, parce que le relais est injoignable et que son téléphone n’est
  pas proche, reste dans la discussion marqué **En attente**, et part tout seul, dans l’ordre, dès que le relais ou son
  téléphone à proximité peut le prendre, tant qu’un espace est ouvert ; il affiche alors **✓**. Un texte attend
  aussitôt. Un message vocal, une photo ou un fichier demande d’abord : **Laisser en attente** ou **Supprimer**. Un
  message en attente n’est supprimé que sur ce téléphone. Dans les discussions masquées, il attend aussi, mais ne passe
  que par leur relais, jamais vers le téléphone à proximité ni par LoRa : tant qu’elles sont ouvertes, ou, avec
  **Recevoir une fois fermées** activé, tant que l’espace est ouvert. Quand la file d’attente du contact sur le relais
  est pleine, un texte, un message vocal, une photo ou un fichier va tout de même à ses appareils associés, s’il en a,
  s’affiche comme envoyé, et est retenté pour son téléphone tant que les discussions masquées restent ouvertes : si
  elles sont fermées avant qu’il soit parti, son téléphone ne le reçoit jamais.
- **Envoyer plus tard :** maintiens la flèche d’envoi et choisis **Plus tard…**, ou appuie sur **+** puis sur **Envoyer
  plus tard**. Choisis une heure d’un appui (**Dans 1 heure**, **Ce soir 20:00**, **Demain 09:00**) ou le jour, l’heure
  et les minutes, jusqu’à un an à l’avance, puis **Envoyer plus tard**. Le message reste dans la discussion marqué
  **Programmé** avec son heure. Il part chiffré vers le relais, qui le garde et l’envoie à cette heure, même si ce
  téléphone est alors éteint ou verrouillé, et son téléphone l’affiche à partir de cette heure, pas avant. Sans relais
  joignable maintenant, il attend sur ce téléphone et part vers le relais dès qu’on peut en joindre un. Sans rien de
  tapé, l’heure que tu choisis vaut pour la prochaine photo, le prochain fichier ou message vocal : une photo ou un
  fichier part aussitôt vers ton relais et y reste jusqu’à ce que la personne le prenne, 14 jours après son heure au
  plus. Les discussions masquées l’ont aussi, de la même façon, par leur relais. Jusqu’à son heure, supprime-le pour le
  reprendre au relais, et il ne part jamais. Si sa file d’attente sur le relais change d’ici là, Erevos le retient de
  nouveau pour la nouvelle la prochaine fois qu’il joint le relais. Avec un jeton propre à ce téléphone, il ne part que
  si le téléphone a encore sa ligne sur ce relais à ce moment-là. Un message sans son reste sans son. Un relais d’avant
  cela ne garde rien pour plus tard : le message attend alors sur ce téléphone et part à son heure tant qu’Erevos
  tourne, en arrière-plan aussi tant que **En arrière-plan** est sur **Recevoir et sonner** (ci-dessous), ou à la
  prochaine ouverture d’Erevos.
- **Message de sécurité :** écris-le, appuie sur **+** puis sur **Message de sécurité**, et choisis combien de temps :
  6 ou 12 heures, 1, 2 ou 3 jours, ou une semaine. Il part aussitôt vers le relais, comme un message envoyé pour plus
  tard, et le relais l’envoie tout seul à cette heure. Chaque fois que tu ouvres Erevos, après son mot de passe, il est
  repoussé d’autant, donc il ne part que si tu n’ouvres pas Erevos à temps : si le téléphone est perdu, pris, cassé ou
  coupé d’internet, ou s’il t’est arrivé quelque chose. Erevos qui tourne en arrière-plan ne le repousse pas, ni son
  écran de mot de passe, ni une fenêtre laissée ouverte que personne n’a touchée ni dans laquelle personne n’a écrit
  depuis 10 minutes. Dans les discussions masquées, il est repoussé tant que leur place reçoit, ou quand tu l’ouvres.
  Dans la discussion, il est marqué **Message de sécurité** avec l’heure à laquelle il partirait ; supprime-le pour
  l’arrêter. Écris-le de façon qu’il dise ce qu’il est : chez ton contact, il arrive comme un message ordinaire. Si le
  relais est injoignable quand tu ouvres Erevos, il garde son heure. Il est chiffré une seule fois et repart vers le
  relais tel quel à chaque fois qu’il est repoussé, donc il ne coûte rien à ta discussion.
  **Pourquoi :** un message gardé par le relais n’a besoin de rien de ce téléphone pour partir, donc personne qui
  prend le téléphone ne peut l’arrêter, sauf en ouvrant Erevos avec son mot de passe.
- **Envoyer sans son :** maintiens la flèche d’envoi et choisis **Sans son** : son téléphone affiche la notification
  sans son ni vibration. Un Erevos d’avant cela ne le sait pas et sonne comme d’habitude, tout comme Erevos en app web,
  dont la notification vient du navigateur. De même pour la notification d’un emplacement de discussions masquées fermé,
  avec **Prévenir quand un message arrive** activé, et d’un espace fermé avec **Aussi quand un autre espace est
  ouvert** : celles-ci demandent seulement au relais combien sont arrivés, et il ne peut pas distinguer un message sans
  son d’un autre, car seul le message chiffré le dit.
- **Liens :** une adresse web dans un message est soulignée, même une adresse nue comme t.me/name ou example.org/page,
  comme Telegram et Signal les montrent ; une adresse e-mail ou le nom d’un fichier (photo.jpg) ne l’est pas. Appuie
  dessus et Erevos la montre en entier, pour l’ouvrir dans le navigateur seulement si c’est là que tu veux aller. Rien
  n’est chargé avant cela.
- **Partager depuis une autre app** (Android) : dans **Partager** d’une autre app, comme celui du navigateur pour une
  page, choisis **Erevos**. Dès qu’un espace est ouvert, **Envoyer à** liste les discussions{~, groupes et conversations
  SMS| et groupes} que l’écran d’accueil a montrés en dernier, puis toutes les autres discussions et tous les autres groupes{+, et les
  discussions de tes comptes Matrix, XMPP et Nostr}, avec une recherche ; jamais les discussions masquées. Les mots et
  les liens s’ouvrent dans le champ de message de celui que tu choisis, à relire et envoyer là ; une photo ou un
  fichier part dès que cette discussion ou ce groupe s’ouvre, une photo à la qualité que tu as choisie pour les photos{~,
  et jamais en SMS}. Un fichier peut faire 100 Mo au plus{+ dans une discussion Erevos, 50 Mo sur Matrix et XMPP et 20 Mo
  sur Nostr}. Il est chiffré dès son arrivée, avec une clé seulement dans la mémoire d’Erevos, et attend ainsi sur le
  téléphone, aussi pendant que tu donnes le mot de passe si Erevos se verrouille d’abord ; il disparaît une fois
  envoyé, ou quand tu quittes **Envoyer à**.
- **Ton contact voit quand tu lis :** ton téléphone le dit au sien, comme le sien le dit au tien, sauf si cette
  discussion apparaît hors ligne (ci-dessous).
- **Quand les messages arrivent :** Erevos regarde le relais toutes les quelques secondes tant qu’il est ouvert et
  déverrouillé, sur n’importe quel écran, et l’écran d’accueil remonte la discussion en haut tout seul. Sur Android,
  chaque nouveau message sonne, avec une notification qui dit seulement combien sont arrivés, même quand Erevos est
  affiché ; dans la discussion ou le groupe ouvert à l’écran, seul le son joue, et ouvrir une discussion retire du
  compte ce qui y est arrivé. La saisie, et le fait qu’un message est arrivé ou a été lu, n’en déclenchent aucune. Sur
  Android, cela continue aussi en arrière-plan, tant que **En arrière-plan** est sur **Recevoir et sonner**
  (ci-dessous) : là, il attend au relais que quelque chose arrive, une minute à la fois, au lieu de demander toutes les
  quelques secondes, et ne demande rien de plus quand rien n’est arrivé, si bien que la batterie tient, et une
  notification dit seulement combien de messages sont arrivés. Fermé, verrouillé, ou longtemps en arrière-plan
  autrement, il ne le fait pas : les messages attendent sur le relais, jusqu’à 14 jours, et arrivent dès qu’Erevos
  s’ouvre de nouveau. Une question au relais sans réponse à temps (une attente là-bas, sa minute plus une demi-minute ;
  toute autre chose, 45 secondes ; une partie de fichier, 2 minutes) compte comme échouée et est reposée, si bien qu’une
  connexion morte en route, comme quand le réseau du téléphone s’endort ou change, ne retient rien.

### En ligne, vu pour la dernière fois, et apparaître hors ligne

Tant que la discussion d’un contact est ouverte sur ton écran, Erevos demande de temps en temps à son téléphone s’il est
ouvert, et dit que le tien l’est. Si le sien l’est, la discussion indique **En ligne** sous son nom avec un point vert,
et l’écran d’accueil montre le point sur son image. Écrire à quelqu’un te montre aussi en ligne pour cette personne
pendant deux minutes. Tout cela passe à l’intérieur du chiffrement, seulement entre toi et ce contact : le relais voit
un message de temps en temps, comme pour n’importe quelle discussion.

Quand un contact n’est pas en ligne, sa discussion indique quand il a eu Erevos ouvert pour la dernière fois, à la
minute près : **vu pour la dernière fois aujourd’hui à 14:32**. Ton téléphone dit la tienne à tes contacts de la même
façon, à l’intérieur de ce qui leur part de toute façon (un message, ou l’arrivée d’un message), et une fois quand
l’un d’eux ouvre ta discussion alors qu’Erevos est fermé sur ton téléphone, seulement s’il a été ouvert depuis la
dernière fois qu’on le lui a dit. C’est désactivé dans un nouvel espace jusqu’à ce que tu l’actives, dans **Réglages**
→ **Confidentialité et sécurité** → **Vu pour la dernière fois**, ou dans les détails d’une discussion quelconque ; un
espace créé avant la 7.0.1 le garde comme il était, activé sauf si tu l’avais désactivé. C’est réciproque : désactivé,
personne ne voit la tienne, et tu ne vois celle de personne ; ceux qui la voyaient la perdent avec ton message
suivant. C’est réglé pour tout l’espace et ses appareils associés, chaque espace séparément. Chaque lieu de
discussions masquées a son propre interrupteur, dans les détails d’une discussion de là-bas, et sa propre heure : tant
qu’elles sont ouvertes, elles seules comptent comme ouvertes, pas l’espace.

Avec **Dire quand j’ouvre et ferme Erevos** activé (sous **Vu pour la dernière fois**, activé sauf si tu l’éteins), ouvrir Erevos le dit
aussitôt à tes contacts, sans attendre un message : seulement ceux avec qui tu as parlé ces 30 derniers jours et qui
montrent aussi leur propre heure, chacun après une attente aléatoire d’au plus une minute, au plus toutes les 15
minutes, jamais une discussion qui apparaît hors ligne ni une demande de message. Quand Erevos se ferme, ou ses
discussions cachées, ceux qui ont été prévenus pendant qu’il était ouvert apprennent aussitôt quand il s’est fermé, donc
leur **Vu pour la dernière fois** est cette heure-là. Le relais voit alors quelque chose partir vers eux quand tu ouvres et
fermes Erevos, il peut donc savoir quand tu le fais : éteins-le, et ton heure ne part qu’avec
ce qui leur part de toute façon.

Pendant que tu écris à un contact qui apparaît en ligne, sa discussion montre **écrit…** sous ton nom pendant quelques
secondes, et la tienne sous le sien quand il écrit. C’est dit toutes les quelques secondes au plus, seulement tant qu’il
apparaît en ligne, jamais à une demande de message, et pas dans les groupes.

**Pourquoi :** être en ligne n’est dit qu’entre toi et un contact dont la discussion est ouverte, à l’intérieur du
chiffrement, si bien que le relais ne voit pas plus qu’un message de temps en temps entre deux personnes qui se
parlent. L’heure à laquelle tu as été vu pour la dernière fois voyage dans ces mêmes messages, chiffrée de bout en
bout : le relais ne l’apprend jamais. Elle dit en revanche à tes contacts quand tu dors ou travailles, et on peut
supposer que deux contacts vus à la même minute se parlent : désactive-la si cela compte pour toi. Quelqu’un qui n’a
que ton lien, et qui écrit en tant que demande de message, n’apprend rien en retour tant que tu n’acceptes pas : ni
que tu as lu, ni que tu es en ligne ou que tu écris, ni quand tu as été vu pour la dernière fois. Tant que tu n’acceptes
pas, seuls ses mots s’affichent : ses photos et fichiers attendent sans être téléchargés, et ses liens n’ont pas d’aperçu. Si ses premiers messages demandent un code, un PIN, un mot de passe ou de l’argent,
promettent de l’argent facile, ou si son nom ressemble à celui d’un de tes contacts, **Attention** le dit au-dessus.
Erevos le cherche sur ton téléphone seulement, et ne bloque rien.

Pour le cacher à un contact, ouvre sa discussion, appuie sur son nom puis sur **Apparaître hors ligne**. Quand c’est
activé :

- **Il ne te voit pas en ligne**, ni que tu écris, et ton téléphone ne lui envoie rien pendant que tu lis.
- **Ses messages restent à ✓** sur son téléphone, pas ✓✓ ni ✓✓✓, pendant que tu les lis.
- **Quand tu lui écris**, tu apparais en ligne pendant deux minutes, et chacun de ses messages que tu as lus passe
  aussitôt à ✓✓✓.
- **Tu ne le vois pas en ligne non plus**, puisque ton téléphone ne demande pas, ni quand il a été vu pour la dernière
  fois ; et il ne reçoit aucune heure de toi.

C’est réglé pour chaque discussion, sur ce téléphone seulement. Désactive-le de nouveau et il voit ce que tu as lu à ton
prochain passage sur le relais.

### Noms et suppression

Ouvre une discussion, appuie sur son nom puis sur **Renommer** pour lui donner un nom. Le nom reste sur ce téléphone,
scellé avec la discussion : l’autre téléphone ne le voit pas. Un nom vide ramène le début de sa clé, sauf si l’un de tes
contacts lui est associé : la discussion reprend alors son nom la prochaine fois que sa fiche s’ouvre, tant que
l’association reste (voir [Contacts](#contacts)).

**Mon nom :** dans Réglages → Confidentialité et sécurité → **Mon nom**, vous choisissez le nom que vos contacts voient à la place d’un code. Il est dit chiffré, seulement aux contacts que vous avez acceptés, et vos groupes privés l’apprennent aussi : là, ceux qui ne sont pas vos contacts apparaissent comme « Nom · 1a2b », avec le début de leur clé. Si vous avez donné à un contact un nom bien à vous (**Renommer**), vous continuez à voir le vôtre ; celui qu’il a choisi figure dans ses **Détails** sous « Se fait appeler » et en indice dans le champ de renommage. Chaque espace a son propre nom, et chaque lieu de discussions masquées aussi (dans ses réglages, près de **Recevoir une fois fermées**) : un lieu masqué ne prend jamais le nom de l’espace et commence vide, et le même nom dans deux d’entre eux indique à qui voit les deux qu’ils sont à vous. Un nom compte 40 caractères au plus.

Appuie sur son nom puis sur **Image** pour lui donner une image de ton choix, un signe sur une couleur, au lieu de celle
dessinée à partir de sa clé. Ou appuie sur **Photo** (ou **Prendre une photo**) pour une photo : recadrée en carré,
réduite et redessinée, si bien que rien de ce qu’elle disait en plus de son image (un lieu, un téléphone) n’est gardé,
puis scellée dans un fichier à elle. Elle aussi reste sur ce téléphone, et va dans les sauvegardes ; **Image tirée de sa
clé** ramène celle qui est dessinée.

Chaque discussion peut aussi avoir son propre aspect : appuie sur son nom puis sur **Apparence de la discussion** pour
les mêmes choix que dans **Apparence** (style, thème, couleurs, police, fond d’écran, messages et la taille de leur
texte), pour cette discussion seulement. Un groupe a **Apparence de la discussion** là où son nom s’ouvre (dans un
groupe public, sous **⋯**), la Discussion avec moi-même l’a en haut{+, et une discussion sur Matrix, XMPP ou Nostr tout en
bas, à côté de **Notifications**}. Comme le nom, cet aspect reste sur ce téléphone, scellé avec la discussion. **Comme
l’app** lui redonne l’aspect de l’app.

Pour garder une discussion hors d’Erevos, appuie sur son nom puis sur **Exporter la discussion** : ses messages vont
dans un fichier texte, chaque jour sous sa date et chaque message avec son heure et son auteur, enregistré dans le
dossier que tu choisis (sur un ordinateur, là où tu choisis). Le fichier n’est pas chiffré : quiconque l’a, ou toute app
qui lit ce dossier, peut le lire. Les photos, fichiers et messages vocaux sont seulement nommés, les messages qui
disparaissent sont exclus, et les discussions masquées ne sont pas exportées, pour qu’aucun fichier hors d’Erevos ne
montre qu’elles sont là.

**Pourquoi :** un message qui disparaît est exclu, de même qu’une citation de celui-ci, car son expéditeur voulait qu’il
disparaisse, pas qu’il reste dans un fichier.

Pour supprimer un message, appuie longuement dessus et appuie sur **Supprimer**. Pour supprimer tous les messages d’une
discussion, appuie sur son nom puis sur **Supprimer les messages**. Dans les deux cas, Erevos demande où :

- **Ce téléphone :** seulement ici. L’autre téléphone garde les siens.
- **Les deux téléphones :** son téléphone les supprime aussi, la prochaine fois qu’il regarde le relais. Son Erevos le
  fait, mais une app modifiée, une capture d’écran ou une copie peut encore les garder.

### Supprimer et bloquer un contact

Appuie sur le nom d’une discussion puis sur **Supprimer le contact** pour l’oublier : sa discussion disparaît de ce
téléphone, et Erevos te donne aussitôt une nouvelle file d’attente sur le relais. Tes autres contacts en sont informés
discrètement, dans un message vide, et de nouveau 7, 14 et 21 jours plus tard tant qu’ils n’ont pas écrit dans la
nouvelle ; ce qu’ils ont écrit dans l’ancienne entre-temps s’affiche encore pendant 14 jours. Celui que tu as supprimé
n’est pas informé, et rien de ce qu’il y envoie ne s’affiche. Ton lien de contact reste tel quel, si bien qu’il peut
encore demander à reparler avec, en demande de message, comme quiconque l’a.

**Pourquoi :** tous tes contacts écrivent dans ton unique file d’attente, donc celui que tu supprimes sait encore où
elle est ; une fois qu’elle a bougé, il ne peut plus t’y écrire, pas plus que celui qui a envoyé les indésirables
ci-dessous. Ton lien de contact nomme une file à lui, qu’une suppression ne touche pas, si bien que chaque lien et code
QR que tu as donné continue de fonctionner.

**Une file pour chaque contact :** sur un relais mis à jour pour cela, chaque contact écrit dans sa propre file, que lui
seul connaît, indiquée à l’intérieur de tes messages chiffrés ; la file de ton lien de contact ne sert alors qu’aux
premiers messages. Le relais ne peut donc pas savoir, d’après la destination des messages, que deux contacts écrivent au
même téléphone, et supprimer ou bloquer quelqu’un ne supprime que sa file : la tienne ne bouge que s’il la connaissait
aussi, comme c’est le cas des contacts d’avant cela, et de quelqu’un venu par ton lien de contact avant son premier
déplacement. Les contacts d’avant reçoivent à leur tour une file à eux, quelques-uns à la fois, discrètement, et un
Erevos d’avant chez eux la prend aussi. Ces files se lisent sans jeton, si bien que le jeton, qui nomme ton téléphone,
ne les relie pas entre elles ; par Tor, huit à la fois, chaque groupe de huit sur ses propres circuits. Elles sont tout
de même créées et supprimées avec le jeton, si bien qu’un relais qui garde des journaux peut alors les relier. Les
discussions masquées et les ordinateurs associés gardent une file pour tout le monde, pour l’instant. L’app web n’a pas
Tor, donc tant qu’elle est ouverte, elle attend sur les files de tous tes contacts ensemble, depuis une seule adresse ;
avec les notifications quand l’app est fermée activées, ton relais a aussi une adresse push pour les files de tous tes
contacts (voir [Sur un iPhone](#iphone)).

- **Bloquer le contact**, en dessous, fait de même, et rejette aussi ce qu’il envoie ensuite, une demande aussi.
  **Bloquer**, à côté de **Refuser**, bloque une demande de message : une demande ne connaît que ton lien de contact,
  donc elle ne déplace ta file que tant que le lien nomme encore celle-ci, comme c’est le cas jusqu’à ton premier
  déplacement. Ceux que tu as bloqués sont sous **Contacts bloqués** dans **Nouvelle discussion**, avec **Débloquer**.
  Les ajouter de nouveau depuis leur lien te demande d’abord de les débloquer ; d’ici là, rien ne les ajoute, {~ni leur
  réponse à une invitation par SMS ni leur lien de contact|pas même leur lien de contact} dans un groupe. Chaque personne qui écrit depuis ton lien de
  contact peut faire sonner le téléphone, comme tout message : **Refuser** ou **Bloquer** arrête celle-là,
  **Notifications** → **En sourdine** dans sa discussion la fait taire sans la refuser, et **Nouveau lien de contact**
  arrête quiconque a l’ancien lien une fois ses 14 jours passés.
- **Groupes :** quelqu’un dans l’un de tes groupes peut encore t’y écrire. Erevos dit dans combien de groupes vous êtes
  ensemble : quitte-les, ou demande à leur admin de le retirer.
- **Quand le relais est injoignable**, la file change dès qu’il répond, et d’ici là rien de ce qu’il envoie ne
  s’affiche.
- **Les messages programmés** que tu avais pour lui sont repris au relais, aussitôt ou dès qu’il répond, si bien qu’ils
  ne partent jamais.
- **Indésirables :** quand ta file se remplit de ce qui n’est pour personne ici, Erevos t’en donne une nouvelle de la
  même façon et le dit, au plus une fois par jour. Quand des indésirables remplissent la file que nomme ton lien de
  contact, tu obtiens plutôt un nouveau lien. Un déluge de demandes de message inventées compte aussi comme indésirable,
  tandis qu’un lot de vraies demandes arrive quand même.
- **Nouveau lien de contact**, à côté de **Partager mon lien de contact**, te donne un nouveau lien : les liens et codes
  QR que tu as donnés avant fonctionnent encore 14 jours, puis plus du tout. Tes contacts ne sont pas touchés. Si le
  relais perdait la file que nomme ton lien, tu obtiendrais un nouveau lien de la même façon, mais ceux que tu as donnés
  avant cesseraient aussitôt de fonctionner.
- **Lien pour un site web**, à côté, dans les discussions de l’espace, te donne un lien à mettre sur une page web, comme
  ta page de contact, avec le nom que tu choisis. Il ouvre une page qui propose {=Erevos} à qui ne l’a pas encore, sur
  Android, un iPhone ou un ordinateur, puis t’ajoute. Quiconque le voit peut t’écrire, donc ce qu’on envoie arrive comme
  demande de message, que tu acceptes, refuses ou bloques. Il ne donne aucune place sur ton relais et vaut tant que ton
  lien de contact vaut : **Nouveau lien de contact** l’annule aussi.
- **Sur un ordinateur associé**, cela passe par le téléphone, qui le supprime ou le bloque aussi et déplace ses files,
  celle de l’ordinateur aussi. Le téléphone garde qui est bloqué et le dit à l’ordinateur : l’y ajouter depuis son lien
  te demande aussi de le débloquer, et **Débloquer** le débloque aussi sur le téléphone.
- **Dans les discussions masquées**, seules les files de cet emplacement bougent, sa file de sonnerie aussitôt, si bien
  que celui que tu as supprimé ne peut plus faire sonner le téléphone. Rien de l’espace ni des autres emplacements ne
  bouge.

Le **Supprimer** de la fiche du contact (voir [Contacts](#contacts)) n’enlève que la fiche, pas la discussion. Une
sauvegarde faite avant une suppression ou un blocage ramène ce contact : supprime-le ou bloque-le de nouveau après
l’avoir restaurée. Une fois restaurée, ta file dit qu’elle est plus récente que toutes celles que tes contacts
connaissent, et chacun en est de nouveau informé, si bien qu’ils écrivent tous là où tu lis.

### Le menu d’un message

Appuie longuement sur un message pour ouvrir son menu : les réactions en haut, puis ce que tu peux en faire.

- **Réactions :** appuie sur l’une, ou sur **+** pour en avoir plus. Elle s’affiche sous le message sur les deux
  téléphones, la tienne en surbrillance ; appuie de nouveau dessus pour la retirer. Chacun de vous a une réaction sur un
  message. Elle part aussitôt, ou pas du tout : quand ni le relais ni son téléphone à proximité ne peuvent la prendre,
  rien ne change.
- **Répondre :** ton prochain message y répond, et l’affiche cité au-dessus de tes mots, sur les deux téléphones. Appuie
  sur la citation pour aller au message auquel elle répond ; **✕** la retire. Un Erevos d’avant cela affiche la réponse
  sans la citation.
- **Répondre dans le fil :** y répond dans un fil, comme dans un groupe : le fil s’affiche seul, avec **Fil** en haut, et
  ce que tu y envoies y répond. Sous un message qui a des réponses, **n réponses dans le fil** l’ouvre ; Retour
  affiche de nouveau toute la discussion. Un Erevos plus ancien montre chaque réponse avec sa citation.
- **Transférer :** en envoie une copie dans une autre discussion : choisis un contact, ou un groupe. Ses mots, son
  sticker ou son lieu repartent de zéro, un sondage comme un nouveau sondage sans réponses encore, et le son d’un
  message vocal ou les octets d’une photo ou d’un fichier sont envoyés de nouveau, chiffrés avec une nouvelle clé, si
  bien que rien ne relie la copie au message d’origine. La copie indique **Transféré** en dessous, pas d’où ; un Erevos
  d’avant cela l’affiche sans cette mention. Un message qui disparaît n’est pas transféré, et depuis les discussions
  masquées un message ne va que vers les mêmes discussions masquées.
- **Ajouter une étoile :** lui ajoute une étoile, sur ce téléphone seulement, pour le retrouver : **Messages avec
  étoile** dans le menu de l’écran d’accueil les liste depuis toutes tes discussions, et les détails d’une discussion
  listent les siens. Un appui va au message. Les messages avec étoile des discussions masquées ne s’affichent que dans
  les détails de leurs discussions.{~ }{+Les discussions Matrix, XMPP et Nostr, et les }{-{~Les }}{~conversations SMS}{+,}{~ ont aussi
  **Ajouter une étoile**, gardé chiffré sur ce téléphone seulement : les **Messages avec étoile** d’une discussion
  listent les siens, et ceux de l’écran d’accueil les listent avec tous les autres, chacun ouvrant sa discussion au
  message. Dans ces discussions, garder le doigt sur une photo, une vidéo, un message vocal, un fichier ou l’image
  d’un MMS propose aussi **Enregistrer dans la Collection**, et sur un sticker ou une photo reçus, **Ajouter à mes
  stickers** ; le choix de stickers des SMS propose aussi les tiens, à envoyer en MMS.}
- **Épingler :** l’épingle en haut de la discussion, sur les deux téléphones ; chacun de vous peut le **Désépingler**.
  Avec plus d’un message épinglé, le dernier s’affiche ; appuie dessus pour y aller, et le suivant s’affiche.
- **Copier :** met ses mots dans le presse-papiers, pour les coller dans une autre app. Sur Android, la copie est
  marquée privée, si bien que la notification du téléphone à son sujet ne montre pas les mots, mais toute app qui lit le
  presse-papiers peut les lire.
- **Sélectionner :** choisit ce message, et un appui sur d’autres les ajoute ; une barre propose alors **Copier**, qui
  met tous leurs mots dans un seul texte avec l’heure et l’auteur de chacun, **Transférer**, qui les envoie dans une
  discussion, et **Supprimer**, qui demande une fois avant de les supprimer. **Retour** arrête le choix.
- **Modifier :** pour un message à toi, jusqu’à un jour après l’avoir envoyé. Ses mots vont dans le champ sous
  **Modifier le message** : change-les et envoie, ou **✕** pour le laisser tel qu’il était. Les deux téléphones montrent
  les nouveaux mots, avec **Modifié** à côté de l’heure. Seuls les mots se modifient, pas un sticker, un lieu, un
  sondage, un message vocal, une photo ou un fichier, ni des mots que tu as transférés. Un message qui attend encore de
  partir part avec les nouveaux mots, sans marque ; un message programmé pour plus tard ne se modifie pas. La
  modification part aussitôt, ou pas du tout, comme une réaction, et tes appareils associés la montrent aussi. Un Erevos
  d’avant cela garde les anciens mots. **Pourquoi :** un jour suffit pour corriger une erreur, et personne ne peut
  changer ce qu’il a dit il y a des jours. La marque montre que les mots ne sont pas les premiers.
- **Terminer le sondage :** pour un sondage à toi : plus aucun vote ne compte, et les résultats finaux s’affichent. Un
  Erevos d’avant cela le voit encore ouvert, et un vote envoyé à ce moment peut ne compter que sur certains téléphones.
- **Supprimer :** sur ce téléphone, ou sur les deux, comme ci-dessus.

Les réactions, réponses, épingles et modifications voyagent à l’intérieur du chiffrement, comme les messages.

### Comment les mots s’affichent

Les marques tapées autour des mots changent leur aspect, dans les discussions et les groupes, comme dans WhatsApp et
Signal : \`*gras*\`, \`_italique_\`, \`~barré~\`, un mot entre accents graves comme code (trois accents graves autour de
lignes pour un bloc de code) et \`||mots||\`, cachés derrière une barre grise jusqu’à ce que vous touchiez, sur l’écran,
dans la ligne de l’écran d’accueil et dans une citation (là sous la forme ▒▒▒).

- **Seulement autour de mots :** une marque compte quand elle commence un mot et en termine un, donc \`2*3*4\`,
  \`snake_case\` et les adresses web restent tels quels. Le gras, l’italique et le barré restent sur une ligne.
- **Les autres voient les marques :** un Erevos d’avant et d’autres apps montrent les mots avec leurs marques, tels
  que tapés.
- **Photo cachée :** sous **+**, **Photo cachée** envoie une photo qui apparaît floue dans la discussion, dans les
  discussions avec les contacts et dans les groupes, jusqu’à ce qu’on la touche, et elle s’ouvre alors toute seule.
  Dans **Médias, liens et fichiers**, elle apparaît floue aussi. Un Erevos d’avant la montre comme n’importe quelle
  photo.
- **Photo à voir une fois :** sous **+**, **Photo à voir une fois** envoie une photo qui n’apparaît jamais dans la
  discussion, avec un contact ou dans un groupe. **Appareil photo, à voir une fois** en envoie de la même façon une
  que tu prends sur le moment. Qui la reçoit la touche et la voit une fois, seule, sans captures d’écran là où le
  téléphone le permet ; à la fermeture, Erevos la supprime de son téléphone, et la discussion indique **Photo vue une
  fois**. Elle ne peut être ni transférée{~, ni enregistrée, ni mise dans la Collection| ni enregistrée}, et votre propre téléphone la
  supprime dès qu’elle leur est parvenue. Rien n’empêche un appareil photo pointé sur l’écran, et un Erevos plus
  ancien la montre comme une photo cachée.

**Pourquoi :** une marque tapée dans les mots voyage avec eux, à l’intérieur du chiffrement, sans rien à côté qui la
distingue.

### Messages éphémères

Ouvre une discussion, appuie sur son nom puis sur **Messages éphémères** pour choisir combien de temps ses nouveaux
messages durent une fois lus : 5 minutes, 1 heure, 1 jour ou 1 semaine. Pour ne faire disparaître que le prochain
message, appuie sur le chronomètre à côté du champ de message (ou sur **Message éphémère** sous **+**, ou sur
**Éphémère** dans le menu de la flèche d’envoi) : **Disparaît 1 heure après lecture** s’affiche au-dessus du champ.
Appuie sur la durée pour en choisir une autre, ou sur **✕** pour le désactiver. Il part avec le prochain message que tu
envoies : des mots, un message vocal, une photo ou un fichier, un sticker, un lieu ou un sondage, maintenant ou plus
tard.{~ Un SMS ne peut pas disparaître : envoyé en SMS, il reste sur les deux téléphones (Erevos le dit d’abord), et le
chronomètre se désactive.} Son délai commence quand l’autre téléphone l’affiche à l’écran, et celui de ta copie quand son
téléphone le dit (**✓✓✓**). Chaque message dit quand il disparaît. L’autre téléphone apprend le réglage de la discussion
la prochaine fois qu’il regarde le relais, et l’un ou l’autre téléphone peut le changer : le dernier changement
l’emporte. Les messages déjà dans la discussion restent.

- **Jusqu’à ce qu’il soit lu**, un message éphémère reste sur les deux téléphones, scellé comme le reste. Si son {=Erevos}
  ne dit jamais l’avoir lu, ta copie reste.
- **Tant qu’Erevos est fermé :** un message dont l’heure est venue est supprimé à la prochaine ouverture de la
  discussion. D’ici là, il reste sur le téléphone, scellé comme le reste.
- **Pas une garantie :** son {=Erevos} les supprime, mais une app modifiée, une capture d’écran ou une copie peut encore
  les garder.

### Bloquer les captures d’écran

Ouvre une discussion, touche son nom puis **Bloquer les captures d’écran** : sous Android, aucun des deux téléphones ne peut faire de capture ni d’enregistrement d’écran de la discussion tant qu’elle s’affiche, et les applis récentes la montrent vide. L’autre téléphone l’apprend avec ton prochain message, et l’un ou l’autre de vous peut le désactiver : le changement le plus récent l’emporte. La discussion le dit quand l’autre le change.

**Pourquoi :** ce que tu écris reste entre vous deux, sauf si quelqu’un cherche exprès à le copier.

- **Seulement sous Android :** {=Erevos} sur un iPhone, sur un ordinateur, dans un navigateur ou sous Sailfish ne peut pas bloquer les captures d’écran, et la discussion le dit là.
- **Pas une garantie :** une photo de l’écran prise avec un autre appareil, ou une appli modifiée, la garde quand même.

### Notifications de cette discussion

Sur Android, ouvre une discussion, touche son nom puis **Notifications** ; dans un groupe, touche son nom (dans un
groupe public, **⋯**) puis **Notifications**. **En sourdine** pendant 8 heures, 1 semaine ou **Toujours** : ses
messages ne sonnent pas et n’affichent aucune notification, donc l’icône d’Erevos ne les compte pas non plus ; la liste
les montre toujours, avec une cloche barrée, et ses appels sonnent toujours. **Son des messages** et **Sonnerie** lui
donnent un son à elle pour ses messages et pour ses appels, pris dans la liste de sons d’Android, ou **Sans son**. Dans
les détails d’une discussion, la ligne dit alors **En sourdine jusqu’à** et l’heure, ou **Sons propres**.

**Pourquoi :** une discussion en sourdine compte toujours dans la liste, pour que rien de ce qui est arrivé ne se perde :
seul le téléphone cesse de t’y appeler. Ses sons sont gardés sur ce téléphone seulement, avec la discussion dans les
données chiffrées de l’espace, car chaque téléphone a ses propres sons : un appareil associé garde les siens, et l’autre
téléphone n’en sait rien.

- **Dans les discussions masquées** il n’y a que **En sourdine** : un son à elle dirait à quiconque est près de quelle
  discussion il s’agit.{+ Il en va de même pour les discussions des comptes Matrix, XMPP et Nostr propres à un emplacement
  masqué : en sourdine, elles ne disent rien, pas même « New message ».}
- **Un espace fermé, et les discussions masquées tant qu’elles sont fermées,** ne savent pas dans quelle discussion un
  message est arrivé, et le signalent donc comme le disent les réglages de l’app.
- **Seulement sur Android** pour l’instant : l’app web signale chaque discussion comme le disent ses réglages.

### Messages vocaux

Dans la discussion d’un contact, sans rien de tapé, maintiens le micro au bout de la barre de message pendant que tu
parles, et relâche pour envoyer ; glisse vers la gauche avant de relâcher pour l’abandonner. Un appui de moins d’une
seconde est pris pour une erreur et n’envoie rien. Au bout d’une minute, il s’envoie tout seul. La première fois,
Android demande si Erevos peut utiliser le micro : il n’enregistre que tant que tu le maintiens. Avec TalkBack, appuie
une fois pour commencer et une autre pour envoyer. Appuie sur un message vocal pour l’écouter, et de nouveau pour
l’arrêter. Les messages vocaux ont les mêmes marques que le reste, et suivent le réglage éphémère de la discussion.

**Changer ma voix :** dans les détails de la discussion avec un contact, **Changer ma voix** envoie tes messages
vocaux de cette discussion **Plus grave** ou **Plus aiguë**, de la même durée. Ton téléphone change le son avant que
le message parte, ta propre voix ne le quitte donc jamais ; si le changement échoue, le message n’est pas envoyé. Seul
ton téléphone connaît ce réglage. Ta voix devient difficile à reconnaître à l’oreille, mais quelqu’un avec
l’enregistrement et du temps pourrait en défaire une partie. Sur Android 10 et plus récent, et dans les navigateurs
qui font eux-mêmes de l’Opus (WebCodecs) ; le talkie-walkie garde ta voix.

**En mots :** maintiens un message vocal, dans le chat d’un contact ou dans un groupe, et choisis **En mots** : ton
téléphone écrit ce qui a été dit, pour le lire ou le copier. La première fois, il télécharge un modèle vocal de 268
Mo, quand tu le dis, depuis le serveur d’Erevos lui-même, qui voit ton adresse comme pour tout téléchargement ;
ensuite tout se fait sur ton téléphone, et ni le son ni ses mots ne le quittent. Il comprend une centaine de langues,
dont le grec, et reconnaît celle qui est parlée. Il peut se tromper, et les mots ne sont pas gardés. **Supprimer le
modèle vocal**, en dessous, libère la place. Seulement sur Android, et il faut un téléphone avec environ 2 Go de
mémoire libre, car il en prend environ 1,5 Go pendant qu’il écrit ; si cela échoue, l’essai suivant rouvre le modèle.
Là où personne ne parle, dans le silence ou le bruit, il n’écrit rien, plutôt que des mots que personne n’a dits.

**Parler pour écrire :** touche le micro à côté du champ du message, dans une discussion ou un groupe, et choisis **Parler pour écrire** : dès lors, le micro maintenu écoute au lieu d’enregistrer un message vocal, jusqu’à ce que tu choisisses **Message vocal** dans le même menu. Parle ; touche **Terminé**, et tes mots s’écrivent dans le champ, pour les modifier avant de les envoyer.
Il utilise le même modèle vocal que **En mots**, téléchargé une fois quand tu le dis, et tout se fait sur ton
téléphone : ni ta voix ni ses mots ne le quittent, et le son n’est pas gardé. Il écoute jusqu’à deux minutes et peut
se tromper. Seulement sur Android.

**Traduire :** reste appuyé sur un message, dans le chat d’un contact ou dans un groupe, et choisis **Traduire** : ton
téléphone le traduit dans ta langue, pour le lire ou le copier, entre le grec, l’anglais, l’allemand, l’espagnol, le
français et l’italien. Il devine la langue du message ; touche-en une autre sous **De** ou **Vers** pour changer l’une
ou l’autre. La première fois pour une langue, il télécharge ses modèles de traduction, de 60 à 95 Mo chacun, quand tu
le dis, depuis le propre serveur d’Erevos, qui voit ton adresse comme pour tout téléchargement ; deux langues dont
aucune n’est l’anglais passent par l’anglais, avec un modèle pour chacune. Ensuite tout se fait sur ton téléphone, et
ni le message ni sa traduction ne le quittent. Les modèles sont OPUS-MT, de l’Université d’Helsinki (CC-BY 4.0). Il
peut se tromper, et la traduction n’est pas conservée. **Supprimer les modèles de traduction**, en dessous, libère la
place. Seulement sur Android.

**Pourquoi :** sur Android 10 et plus récent, dans l’appli web et sur un ordinateur, un message vocal est en Opus à 32
kbit/s, environ 240 Ko par minute, comme l’envoient Telegram, Element et Conversations : aussi clair que la parole peut
l’être. Sur Android 9 et plus ancien, et dans Safari avant iOS 18.4 et macOS 15.4, il est en AAC à 64 kbit/s, environ
480 Ko par minute. Plus ne s’entendrait pas dans une voix, mais serait plus lent à envoyer, surtout par Bluetooth. Tout
Erevos lit les deux : Safari avant 18.4 lit l’Opus une fois qu’Erevos l’a reconditionné pour lui, et là où un navigateur
ne peut pas en lire un, Erevos le dit.

- **Par le relais, ou à proximité,** chiffrés de bout en bout comme les mots, en plusieurs morceaux. Personne entre les
  deux ne peut les entendre, mais d’après les morceaux, le relais, ou qui écoute à proximité, peut savoir que quelque
  chose de long a été envoyé, et à peu près de quelle durée. À proximité, ils ne vont qu’au téléphone d’un contact qu’on
  sait proche.
- **Sur le téléphone**, chaque son est gardé dans un fichier à lui, scellé avec sa propre clé, que seul l’historique
  scellé de la discussion contient. Quand le message s’en va, supprimé, disparu ou parce qu’il est le plus ancien, son
  fichier s’en va aussi. Le nombre de ces fichiers, et leurs tailles, montrent à peu près combien de messages vocaux le
  téléphone garde, dans tous ses espaces ensemble, pas dans lequel.
- **Pendant la lecture**, le son est descellé dans le cache d’Erevos, et supprimé dès qu’il s’arrête. Si Erevos est
  fermé pendant qu’il enregistre ou joue, ce qui restait s’en va à la prochaine ouverture d’une discussion.

### Photos et fichiers

Dans la discussion d’un contact, appuie sur **+** à côté du champ de message, qui s’ouvre là où était le clavier, puis
sur **Photo** pour en choisir une parmi les photos du téléphone, **Appareil photo** pour en prendre une, ou **Fichier**
pour tout le reste, jusqu’à 100 Mo. En dessous, **Qualité de la photo** règle comment partent les photos, et Erevos s’en
souvient :

- **Original** (par défaut) : la photo exactement telle qu’elle était, en pleine taille, sans perte de qualité. Seul ce
  qu’elle dit en plus de son image est retiré : où elle a été prise, le téléphone, l’heure, les miniatures. Son nom est
  simplement « photo ».
  Une photo envoyée avec **Fichier** (JPEG, PNG, GIF ou WebP, jusqu’à 64 Mo) part aussi sans cela, sous son propre nom ;
  pour un fichier HEIC ou AVIF, ou plus grand, Erevos demande d’abord, car il ne peut pas les en retirer.
- **90%** et **75% :** une nouvelle photo, plus petite, plus rapide à envoyer, qui ne dit rien d’autre que son image.

Leurs photos et fichiers jusqu’à 16 Mo arrivent tout seuls ; appuie sur un plus gros pour le récupérer. Appuie sur une
photo pour la voir sur tout l’écran, avec sa taille : deux doigts ou un double appui zooment, un doigt la déplace tant
qu’elle est zoomée, et un appui cache ou montre ce qu’il y a autour. Appuie sur un fichier pour l’enregistrer. Erevos
tourne avec le téléphone tant que sa **Rotation automatique** est activée, et une photo montrée seule tourne même
quand elle est désactivée. **Enregistrer** en met une copie dans un dossier que tu choisis la première fois, et
**Enregistrer dans un autre dossier** le change. Les photos et fichiers ont les mêmes marques que le reste, et suivent
le réglage éphémère de la discussion.

- **Ouvrir avec une autre app :** un fichier qui n’est pas une photo a aussi **Ouvrir**, sur Android : l’app du
  téléphone pour son type, un lecteur PDF par exemple, le lit dans la mémoire d’Erevos, sans copie laissée sur le
  téléphone, et le lien est lâché à l’ouverture du fichier suivant ou au verrouillage de l’espace. Erevos demande
  d’abord, car cette app est hors d’Erevos et de son chiffrement, et n’ouvre jamais ainsi les pages web, les dessins ni
  les paquets d’app, qui pourraient aller sur internet hors de Tor : enregistre-les plutôt.
- **Comment ils voyagent :** chaque fichier est chiffré sur le téléphone avec sa propre clé, en morceaux tous de même
  taille, et déposé sur ton relais. Seuls l’emplacement des morceaux et la clé vont au contact, chiffrés de bout en
  bout. Son téléphone prend les morceaux par son propre relais, si bien que ton relais ne voit jamais l’adresse de son
  téléphone, vérifie chaque morceau, puis les supprime du relais. Les morceaux que personne ne prend sont supprimés au
  bout de 14 jours.
- **Ce que le relais voit :** combien il y a de morceaux et leur taille, donc à peu près la taille du fichier, et quand.
  Pas ce que c’est ni à qui c’est destiné.
- **Un fichier part tel quel,** avec tout ce qu’il dit à l’intérieur : l’auteur d’un document, ou le lieu et le
  téléphone d’une photo si tu l’envoies avec **Fichier**. Envoie les photos avec **Photo**.
- **Sur le téléphone**, chaque fichier est gardé en morceaux, tels qu’ils ont voyagé, scellé avec sa propre clé, que
  seul l’historique scellé de la discussion contient. Quand le message s’en va, ses morceaux s’en vont aussi. Le nombre
  de morceaux montre à peu près combien le téléphone garde, dans tous ses espaces ensemble, pas dans lequel. Une photo
  est affichée depuis la mémoire, jamais écrite descellée. Le sélecteur de photos du téléphone remet une copie dans le
  cache d’Erevos, supprimée une fois lue, et une photo prise ici n’est pas gardée dans les photos du téléphone.
- **Enregistrés**, les photos et fichiers sont hors d’Erevos, non scellés : quiconque a le téléphone peut les ouvrir.
- **Par le relais seulement :** les fichiers ont besoin de son stockage de fichiers, même quand le contact est proche.
  Un relais plus ancien que cette version ne peut pas prendre de fichiers : mets-le à jour.

### Plus sous +

Sous **+**, il y a plus à envoyer que des photos et des fichiers (le smiley au bout du champ de message ouvre aussi les
stickers) :

- **Sticker :** l’un des 576 stickers intégrés à Erevos, en 24 séries de 24 (parmi elles **Lunes**, **Chiens**,
  **Grèce**, **Mots** et **Gourmandises**), dessinés par chaque téléphone lui-même : seul son nom voyage, si bien que
  rien n’est jamais téléchargé. Un Erevos d’avant cela affiche son emoji à la place. Tous sauf les mots et les
  gourmandises bougent un peu pendant quelques secondes quand ils arrivent et quand on appuie dessus, puis se reposent ;
  avec le réglage de réduction des animations du téléphone activé, ils restent immobiles. Les mots s’affichent dans la
  langue de l’app.
- **En image :** dans une discussion d’un autre réseau qui ne prend que des images, un sticker intégré part à la place
  comme son image : 512 sur 512 sur fond transparent, dessinée sur ton téléphone ou ton ordinateur à partir des mêmes
  formes, au repos, ses mots dans la langue de l’app. Rien n’est téléchargé pour la faire.
- **Les miens**, parmi les stickers, contient ceux que tu fais à partir de photos. **Nouveau sticker à partir d’une
  photo** en découpe un carré, le réduit (512 sur 512, environ 100 Ko au plus) et ne garde que son image, rien de
  l’endroit ni de l’appareil avec lequel elle a été prise. Il est gardé scellé dans l’espace, ou dans les discussions
  masquées où il a été fait, et ne s’affiche que là, jusqu’à 100 ; appuie longuement sur l’un d’eux pour le supprimer.
  Comme le reste, il va dans une sauvegarde, scellé, et jamais vers les autres appareils du compte. Il part comme part
  une photo, chiffré de bout en bout par le relais, marqué comme sticker, si bien qu’il s’affiche seul sans bulle ; un
  Erevos d’avant cela l’affiche comme une photo. Appuie longuement sur un sticker qu’on t’a envoyé et appuie sur
  **Ajouter à mes stickers** pour le garder.
- **Position** (sur Android) : envoie où tu es, une fois, comme un lieu. La première fois, Android demande si Erevos
  peut utiliser la position. Le téléphone cherche par tous ses moyens à la fois : par satellite, quand tu as autorisé la
  position précise, et par sa position réseau, ce qui sur beaucoup de téléphones interroge Google ou le fabricant du
  téléphone. Une feuille s’ouvre tout de suite et dit qu’il cherche ; à l’intérieur, où les satellites se voient mal, cela
  peut prendre jusqu’à une minute. Si rien n’arrive à temps, il propose le lieu que le téléphone a trouvé dans les dix
  dernières minutes, en disant il y a combien de temps, ou il dit pourquoi aucun n’a été trouvé, avec **Réessayer** et
  l’écran du téléphone qui change cela. Erevos ne regarde que quand tu appuies, te montre le lieu avant qu’il parte, et ne
  te suit pas ensuite. Le message ne contient que les coordonnées, chiffrées de bout en bout ; aucune carte n’est chargée
  dans Erevos. **Ouvrir la carte** passe le lieu à ton app de cartes, qui peut charger sa carte depuis internet. Un Erevos
  d’avant cela affiche les coordonnées en mots.
- **Carte de contact :** envoie un contact de ceux de ton téléphone sous forme de carte, avec son nom, ses numéros et
  ses adresses e-mail, chiffrés de bout en bout. L’autre personne voit la carte avec **Ajouter aux contacts** ; un
  Erevos d’avant cela l’affiche en mots. Dans les discussions masquées, tu ne choisis que parmi les contacts gardés dans
  le lieu masqué, jamais ceux du téléphone.
- **Sondage :** une question avec deux options ou plus, jusqu’à 12, et, avec **Plusieurs réponses possibles**, plus
  d’une à choisir. Appuie sur une option pour la choisir, de nouveau pour la retirer ; chaque option montre combien
  l’ont choisie, et qui. Les votes voyagent à l’intérieur du chiffrement, comme les réactions. Un Erevos d’avant cela
  affiche la question et ses options en mots, pour répondre en mots.
- [~] **Demande de paiement** (demandée depuis une autre appli, comme Fasouli) : un montant et pour quoi, en carte. Celui
  qui la reçoit touche **Payé** une fois payé, et ton téléphone le sait ; impossible de revenir en arrière. Puis **Noter
  dans Fasouli**, sur Android, la marque encaissée là-bas. Erevos ne déplace pas d’argent et ne connaît aucune banque :
  la carte dit seulement ce qui a été demandé. Seulement avec un contact, jamais en caché. Un Erevos plus ancien montre le
  montant en texte.

**Pourquoi :** un pack de stickers chargé depuis internet dirait à un serveur que ce téléphone a {=Erevos}, donc les
stickers sont intégrés et seuls leurs noms voyagent. Les tiens sont listés dans une seule valeur scellée de même taille
pour chaque espace et emplacement masqué, utilisé ou non, si bien qu’une liste utilisée ressemble à une liste qui ne
l’est pas : elle en contient 100. Un lieu n’est envoyé que depuis Android : sur un ordinateur ou dans l’app web, le
navigateur demanderait à un service extérieur où il est.

### Aperçus des liens

Un lien dans un message est souligné, et ne s’ouvre qu’une fois que tu appuies dessus et le confirmes. Avec **Aperçus
des liens** activé, dans les détails d’une discussion, un lien que tu envoies part avec son aperçu : au moment où tu
l’envoies, ce téléphone charge la page et en prend le titre, une ligne de description et une petite image, et ils
partent dans le message, chiffrés de bout en bout. Le téléphone qui le reçoit ne charge rien : il affiche ce qui est
arrivé. C’est désactivé tant que tu ne l’actives pas, et alors c’est activé pour toutes les discussions de l’espace ;
chaque emplacement de discussions masquées a son propre interrupteur, dans les détails d’une discussion là-bas.

**Pourquoi :** seul le téléphone de l’expéditeur charge la page, si bien que le téléphone qui reçoit un lien ne joint
aucun site choisi par quelqu’un d’autre, et ne montre rien de lui-même à ce site, pas même son adresse.

- **Le site voit l’adresse internet de ce téléphone**, et quand, comme il le verrait depuis un navigateur, mais pas à
  qui le message est destiné. Avec **Par Tor** activé, dans les **Aperçus des liens**, la page et son image sont
  récupérées uniquement par Tor, quel que soit le réglage Tor de l’espace, donc le site ne voit pas l’adresse. C’est
  plus lent, et cela attend pendant le démarrage de Tor ; une page qui te renvoie ailleurs, ou qui n’accepte pas Tor,
  n’a pas d’aperçu. Tant que tout dans l’espace passe par Tor (**Tout** sous Tor), les aperçus ne sont faits qu’avec
  **Par Tor** activé.
- {=Erevos} sur un ordinateur n’en fait aucun, mais affiche quand même ceux qui arrivent.
- **Par LoRa**, qui ne prend que peu, un message part sans son aperçu plutôt que d’attendre, et n’en garde aucun ici.
- Un aperçu est ce que la page dit d’elle-même, vrai ou non. Un Erevos d’avant cela affiche le lien sans aperçu.

### Appels vocaux et vidéo

Dans la discussion d’un contact, appuie sur le combiné vert en haut pour un appel vocal, ou sur la caméra bleue à côté
pour un appel vidéo. La première fois, Android demande si Erevos peut utiliser le micro, et la caméra pour la vidéo. Son
téléphone sonne tant qu’{=Erevos} y est ouvert, sur n’importe quel écran de l’espace : il appuie sur **Répondre** ou
**Refuser**. Pendant l’appel, tu peux couper le micro, passer au haut-parleur, désactiver ta caméra, basculer entre la
caméra avant et arrière, et **Raccrocher**. Chaque appel laisse une ligne dans la discussion, comme sa durée, ou un
appel manqué.

- **Répondre en vidéo ou en voix seulement :** un appel qui sonne propose **Répondre**, en voix seulement, et **Répondre
  en vidéo**, dans les appels d’Erevos{+ et dans ceux de XMPP et de Matrix} ; dans un appel de groupe, ce sont
  **Rejoindre** et **Rejoindre en vidéo**. Un appel vidéo auquel tu réponds en voix seulement commence avec ta caméra
  éteinte.
- **Où va le son** (Android) : avec un casque Bluetooth ou filaire connecté, **Haut-parleur** devient **Sortie audio** :
  il montre où va le son maintenant, **Téléphone**, **Haut-parleur**, **Casque** ou **Bluetooth**, et un appui les liste
  tous, un casque Bluetooth sous son propre nom, pour choisir. Un casque connecté au début de l’appel, ou pendant, prend
  le son, comme pour un appel téléphonique, et allumer ta caméra le laisse là ; quand il se déconnecte, le son revient au
  téléphone, ou au haut-parleur dans un appel vidéo.
- **Activer la caméra plus tard :** **Activer caméra**, sur l’écran d’appel, marche quand l’appli de l’autre côté peut
  modifier un appel en cours ; un appel de groupe reste comme tu l’as rejoint.
- **Ajouter la vidéo à un appel vocal :** dans un appel vocal d’Erevos, **Ajouter la vidéo** allume ta caméra quand
  l’autre personne dit oui ; si elle dit non, l’appel reste vocal.
- **Ta propre image :** dans un appel vidéo, ta caméra remplit l’écran jusqu’à ce que l’image de l’autre arrive ; elle
  passe alors dans une petite fenêtre dans le coin du haut, sur les deux téléphones, pour que chacun voie l’autre et
  soi-même.
- **Changer de caméra :** **Retourner** passe à la caméra suivante. Sur un ordinateur, il ne s’affiche que s’il y a plus
  d’une caméra.
- **Comment l'appel est relié :** maintenez un instant l'écran de l'appel pour voir quelle part du son de l'autre a été
  perdue ou a dû être comblée, ce qui s'entend comme des coupures, combien de fois, le temps d'aller-retour, le chemin de
  l'appel et le temps qu'il a fallu pour sonner et se connecter. Un toucher le ferme. C'est mesuré sur votre téléphone
  seulement, et aide à trouver pourquoi un appel sonne mal.

**Un appel vers un téléphone qui tarde à le recevoir :** quand son téléphone reçoit ton appel en retard, par exemple
parce qu'il lit par Tor, **Appel…** reste affiché jusqu'à une minute et quart, et dès qu'il sonne là-bas, il sonne 45
secondes à partir de ce moment, pour qu'un appel arrivé en retard ne sonne pas sur son téléphone pour s'arrêter
aussitôt. Son téléphone lit aussi un appel avant tout ce qu'il a à envoyer, et après un changement de réseau (du Wi-Fi
aux données mobiles) il attend de nouveau les appels tout de suite.

**Un appel ordinaire sur le réseau mobile :** quand un contact a son numéro de téléphone associé, ou est associé à l’un
de tes contacts qui a un numéro (**Associer à un de mes contacts** dans sa discussion, un numéro mobile d’abord), le
clavier orange en haut de sa discussion, avant la caméra, ouvre un clavier avec ce numéro déjà tapé{~, de même que celui
en haut d’une conversation SMS}. C’est {~le **Téléphone** d’Erevos quand Erevos est l’app de téléphone, sinon }celui du
téléphone : appuie là sur la touche d’appel. Un tel appel passe par le réseau de l’opérateur téléphonique et n’est pas
chiffré{~, pas plus qu’un SMS ordinaire}. Les discussions masquées et les ordinateurs ne l’ont pas.

- **Chiffré de bout en bout :** l’appel est établi par des messages via le relais, chiffrés comme le reste. Ceux-ci
  portent la clé qui chiffre l’appel lui-même, si bien que personne entre les deux ne peut écouter, pas même le relais
  d’appel ci-dessous.
- **Par le relais d’appel :** un relais installé avec le kit dans \`deploy/relay\` a un relais d’appel à côté. L’appel
  passe par lui, si bien qu’aucun téléphone n’apprend l’adresse IP de l’autre. Par Wi-Fi ou données mobiles, n’importe
  où.
- **Sans relais d’appel** (un relais sur ton propre ordinateur, par exemple), Erevos demande d’abord : l’appel passe
  alors directement entre les téléphones, ne marche que sur le même Wi-Fi, et chaque téléphone y voit l’adresse de
  l’autre.
- **Sans internet :** sur le même Wi-Fi, le point d’accès d’un téléphone, ou le Wi-Fi que deux téléphones créent (Wi-Fi
  Direct), avec un espace ouvert sur les deux, un appel n’a besoin d’aucun relais : il est établi par la liaison à
  proximité et passe directement entre les téléphones (ou ordinateurs). Il en va de même pour les messages de groupe et
  les appels de groupe.
- **En arrière-plan (Android) :** tant qu’un espace est ouvert, Erevos continue de tourner quand tu le quittes, avec
  Accueil, avec Retour sur son premier écran ou en le balayant hors des applis récentes, avec une notification discrète,
  « Erevos – Ready for calls and messages », qui ne s’affiche pas sur l’écran de verrouillage. Il attend au relais et
  sur les liaisons avec les téléphones à proximité, si bien que les messages arrivent : une notification dit seulement
  « New message », ou combien sont arrivés, et sur un téléphone verrouillé seulement « Erevos ». Une demande de message,
  de quelqu’un qui n’a que ton lien de contact, donne la même notification et le même son, et compte sur l’icône, comme
  tout message. Un appel sonne avec la sonnerie du téléphone et une notification, « Incoming call » (ou « Incoming video
  call ») – « Open Erevos to answer », sans nom, par-dessus l’écran de verrouillage et l’économiseur d’écran aussi, et
  l’écran se réveille. Appuie dessus pour répondre. Avec le verrou par mot de passe activé, un appel qui sonne s’affiche
  avant le mot de passe, et Erevos se verrouille dès qu’il se termine. Verrouillé, l’espace continue derrière l’écran du
  mot de passe, si bien que messages et appels arrivent encore, et un appel s’affiche par-dessus l’écran du mot de
  passe. Seuls les discussions et groupes de cet espace arrivent ainsi, et les discussions masquées avec **Recevoir une
  fois fermées** activé ; les autres discussions masquées disent seulement qu’un message est arrivé, ou sonnent sans
  nom, si tu le leur permets (voir Discussions masquées). Règle-le dans **Réglages** → **Notifications** → **En
  arrière-plan** : **Recevoir et sonner** (par défaut) ou **Seulement quand Erevos est affiché**, et **Signaler les
  nouveaux messages** (par défaut) ou **Pas de notification**, qui vaut aussi pendant qu’Erevos est affiché. Là aussi,
  si Android les demande, **Continuer malgré l’économie de batterie** et **Afficher les appels sur l’écran de
  verrouillage**. En dessous, **Seulement le gaspillage** (par défaut), **Et les téléphones proches** et **Et le
  sommeil** règlent combien de batterie il économise en arrière-plan : le deuxième éteint aussi les radios pour
  téléphones proches tant qu’Erevos est en arrière-plan, le troisième laisse aussi dormir le téléphone, si bien
  qu’Erevos regarde le relais environ une fois par minute et qu’un message ou un appel peut avoir une ou deux minutes de
  retard.
- **Et le sommeil léger :** un quatrième choix à cet endroit, entre **Et les téléphones proches** et **Et le sommeil**. Le téléphone peut dormir, mais Erevos laisse ouverte son attente au relais, si bien que ce qui arrive réveille le téléphone et qu’un message ou un appel arrive toujours aussitôt là où le réseau et Android le permettent ; Erevos regarde aussi de lui-même toutes les quelques minutes. Il est nouveau et pas encore essayé sur beaucoup de téléphones : si les messages arrivent en retard avec lui, choisis-en un autre.
- **Le nombre sur l’icône :** avec **Signaler les nouveaux messages** activé, quand tu quittes Erevos avec des messages
  non lus dans les discussions et groupes de l’espace ouvert, la notification reste, sans son, et dit combien, avec ceux
  qu’elle signale ensuite ; elle part tant qu’Erevos est affiché, et revient quand tu le quittes, jusqu’à ce que tu les
  aies lus. Elle ne compte pas les messages d’une discussion en sourdine (voir Notifications de cette discussion), ni
  ceux d’une discussion masquée au moment où tu quittes. Le launcher d’Android l’affiche sur l’icône d’Erevos, comme un
  nombre ou, sur certains téléphones comme les Pixel, comme un point. **Réglages** → **Notifications** → **Nombre sur
  l’icône** le désactive : la notification ne parle alors que de ce qui est arrivé depuis la dernière fois qu’Erevos
  était ouvert, et le nombre du launcher part avec elle. Un message supprimé pour tout le monde avant que tu l’aies lu,
  ou lu sur un ordinateur associé, ne compte plus.

  **Pourquoi :** sur Android, seule une notification peut mettre un nombre sur l’icône d’une app, donc la notification
  reste tant que des messages attendent ; elle ne dit rien de plus que combien, comme toujours.
- **Un espace fermé :** il ne reçoit rien, car sa clé n’est en mémoire que tant qu’il est ouvert : ses messages
  attendent sur son relais et arrivent quand tu l’ouvres. Sauf si tu choisis, dans cet espace, **Aussi quand un autre
  espace est ouvert** sous **Réglages** → **Notifications** → **En arrière-plan** (par défaut, c’est **Cet espace
  seulement quand il est ouvert**) : alors, tant qu’un autre espace est ouvert et reçoit, il dit seulement « New
  message », ou combien sont arrivés, avec la même notification que cet espace, jamais quel espace, et ses discussions
  masquées ne disent rien. Ce que d’autres téléphones ont transporté jusqu’à son relais compte comme un message, les
  suppressions aussi, et un message qui lui est envoyé sans son sonne comme d’habitude (voir **Envoyer sans son**). Pour
  cela, le téléphone garde les adresses de ses files d’attente sur son relais hors de son mot de passe, dont celle où
  écrit chacun de ses contacts, jusqu’à 64 contacts, jamais ses clés, ni qui sont ses contacts, ni ses messages, et ne
  demande au relais que combien sont arrivés, jamais les messages eux-mêmes : ils restent là-bas jusqu’à ce que l’espace
  s’ouvre. Un espace qui passe par Tor (**Messages** ou **Tout**, sous **Ce qui passe par Tor**) n’est
  interrogé que par Tor : tant que l’espace ouvert a Tor désactivé, ou que son Tor démarre ou vient d’échouer, l’espace
  fermé ne dit rien, et ce qui est arrivé est signalé dès que Tor y est prêt.

  **Pourquoi :** un espace derrière un second mot de passe ne doit pas montrer qu’il est là, donc c’est désactivé tant
  que tu ne l’actives pas, et alors il n’en dit pas plus que ne le dirait l’espace ouvert. Si on l’interrogeait
  directement depuis le téléphone pendant qu’un autre espace est ouvert, son relais ou quelqu’un qui observe le réseau
  pourrait relier les deux espaces par l’adresse internet du téléphone. Comme chaque contact écrit dans sa propre file
  d’attente, l’espace doit aussi interroger le relais sur chacune d’elles, sinon leurs messages ne diraient rien. Le
  prix à payer : son relais peut savoir que les deux espaces sont sur un même téléphone, et quelqu’un qui examine le
  téléphone avec des outils peut trouver qu’un second espace y garde des adresses, et combien de contacts il a.
- **Un point pour les autres espaces :** dans un espace réglé sur **Aussi quand un autre espace est ouvert**, **Point
  dans les autres espaces**, en dessous (par défaut **Pas de point**), affiche aussi un petit point sur le cadenas
  au-dessus des discussions de l’espace ouvert, dès qu’un message est arrivé à celui-ci pendant qu’il était fermé,
  jusqu’à ce que tu l’ouvres : jamais combien, ni quel espace. Cela marche là où la notification marche : sur Android,
  tant que l’espace ouvert a **Recevoir et sonner** et **Signaler les nouveaux messages** activés. Pour cela le
  téléphone garde, à côté des adresses ci-dessus, seulement si un message est arrivé. Qui voit les discussions de
  l’espace ouvert voit aussi le point, et peut deviner qu’il existe un autre espace.
- **Quand le téléphone s’allume :** après le démarrage du téléphone, Erevos ne tourne pas tant que tu ne l’ouvres pas.
  Avec **Démarrer à l’allumage du téléphone** sous **Réglages** → **Notifications** → **En arrière-plan** (par défaut,
  c’est **Attendre que je l’ouvre**), il démarre tout seul une fois le téléphone allumé, ou Erevos mis à jour, sans
  espace ouvert : aucun espace ne peut s’ouvrir sans son mot de passe, car Erevos ne garde aucune clé sur le
  téléphone. Alors les espaces réglés sur **Aussi quand un autre espace est ouvert** disent déjà « New message », ou
  combien sont arrivés, jamais quel espace, ni qui ou quoi, et une notification discrète dit « Locked ». Les appels ne
  sonnent pas, et rien d’autre n’arrive, tant que tu n’ouvres pas un espace ; les espaces qui passent par Tor ne
  disent rien jusque-là. S’il n’y a aucun espace de ce genre, ou avec **Pas de notification**, il s’arrête aussitôt.
  Android seulement.

  **Pourquoi :** après un redémarrage, Erevos ne pouvait pas te dire que des messages attendent avant que tu ne
  l’ouvres par hasard. Sans ton mot de passe, il ne peut toujours pas les lire, donc il n’en dit pas plus qu’un espace
  fermé.
- **Là où ça ne peut pas sonner :** arrêté par Android (ou par l’économie de batterie du téléphone, ou par le réglage
  propre du fabricant), après un redémarrage du téléphone jusqu’à ce que tu ouvres Erevos et l’espace une fois, dans un
  autre espace (il dit seulement qu’un message est arrivé, si tu le permets, comme ci-dessus), ou sur un ordinateur ou
  dans l’app web quand ils sont fermés. Un appel là-bas s’affiche comme appel manqué dès qu’Erevos s’ouvre. Quand
  Android ferme Erevos pendant qu’il reçoit et le relance, comme il le fait d’habitude, une notification discrète le
  dit : ouvre Erevos et l’espace pour recevoir de nouveau. Après **Forcer l’arrêt**, avec une utilisation de la batterie
  réglée sur Restreinte, ou quand le réglage propre du fabricant le ferme, Android ne relance rien, donc aucune
  notification ne le dit : la notification « Erevos » disparaît simplement, et rien ne sonne tant que tu n’as pas ouvert
  Erevos. **Autorisations** (ci-dessous) prévient à l’avance si l’un de ces réglages est en place. Une autre
  notification, « Locked », le dit aussi quand l’espace qui recevait se ferme (après la restauration d’une sauvegarde,
  par exemple) et qu’Erevos quitte l’écran en demandant le mot de passe. Une demande de message ne peut pas t’appeler
  tant que tu ne l’as pas acceptée.
- **Autorisations (Android) :** **Réglages** → **Général** → **Autorisations** montre ce qu’Android permet à Erevos pour
  les appels et les messages en arrière-plan (les notifications, la notification d’appel et son affichage par-dessus
  l’écran, la notification des messages, avec ses notifications « Messages without sound » et « Messages with a chat's
  own sound », qui gardent aussi le nombre sur l’icône, les appels sur l’écran de verrouillage, le fonctionnement sur
  batterie, le fonctionnement en arrière-plan avec une utilisation de la batterie non réglée sur Restreinte, pas de mise
  en pause quand l’app n’est pas utilisée, les données mobiles en arrière-plan, le micro) et pour d’autres choses (le
  son des nouveaux messages, les notifications sur l’écran de verrouillage, les appels malgré Ne pas déranger,
  l’appareil photo, les téléphones à proximité, les contacts, les heures exactes pour {~les SMS envoyés plus tard et }les
  rappels, la notification des rappels une fois qu’un rappel est arrivé), chacun avec sa raison et un bouton qui ouvre
  la question ou le réglage d’Android lui-même. Il dit aussi quand le téléphone est en silencieux ou en vibreur, quand
  l’économiseur de batterie est activé, et quand Ne pas déranger est activé sans laisser passer les appels d’Erevos. Sur
  les téléphones Huawei, Honor, Xiaomi, OPPO, realme, OnePlus, vivo, Samsung et ASUS, il dit aussi où se trouve le
  réglage propre du fabricant, qu’Erevos ne peut pas lire : appuie sur **C’est fait** une fois qu’il est réglé. Après
  chaque nouvelle version, et la première fois, il s’ouvre tout seul quand les appels ou les messages ont besoin de
  quelque chose. Dans l’app web, il montre ce que le navigateur permet, voir [Sur un iPhone](#iphone).
- **Un appel à la fois.** Un appel continue pendant que tu passes d’un écran de l’espace à l’autre. Il se termine quand
  l’espace se ferme, et un appel dans les discussions masquées quand elles se ferment, ce qu’elles ne font pas pendant
  un appel. Balayer Erevos hors des applis récentes termine aussi un appel.
- Les appels ne passent ni par un téléphone à proximité ni par Bluetooth. Là, **Talkie** sous **+** transforme la
  discussion en talkie-walkie, et **Talkie activé** s’affiche au-dessus du champ : maintiens le talkie-walkie au bout de
  la barre pendant que tu parles, relâche, et ta voix est lue sur son téléphone dès qu’elle arrive, si la discussion
  avec toi y est ouverte ; sinon, elle attend comme message vocal. C’est un message vocal plus petit (environ 3 Ko par
  seconde), si bien qu’il passe partout où passe un message, Bluetooth compris.

**Pourquoi :** les clés qui ouvrent les messages d’un espace ne sont en mémoire que tant qu’il est ouvert, et scellées
derrière son mot de passe sinon. Donc après un redémarrage du téléphone, rien ne peut être lu et rien ne sonne tant que
tu n’as pas ouvert Erevos et l’espace une fois ; et les discussions masquées, dont la clé n’est en mémoire que tant
qu’elles sont ouvertes, sauf si **Recevoir une fois fermées** la garde avec l’espace, disent sinon seulement qu’un
message est arrivé, ou sonnent sans nom, si tu le leur permets.

> Les réglages du relais, ta file d’attente, tes contacts et leurs noms, les clés de tes conversations et les messages
> sont gardés dans cet espace, scellés. L’historique n’a pas de limite : il est gardé dans des pages scellées de même
> taille, mêlées aux pages des autres espaces et des discussions masquées, si bien que seule la place qu’elles prennent
> toutes ensemble se voit, pas à qui elles sont. Le reste est gardé à la même taille pour chaque espace et les
> discussions masquées, utilisés ou non ; ce qui est plus grand va dans des pages comme celles de l’historique, parmi
> elles. Les messages supprimés peuvent rester un moment dans le stockage du téléphone, scellés comme le reste, jusqu’à
> ce que quelque chose soit écrit par-dessus. Les messages envoyés ou reçus à proximité sont gardés de la même façon.

## Discussions de groupe {#groups}

Depuis le menu de l’écran d’accueil, **Nouveau groupe** : donne-lui un nom, coche les contacts à inviter, et appuie sur
**Créer le groupe**. Tu en es l’admin. Le téléphone de chaque contact répond tout seul la prochaine fois qu’{=Erevos} y est
ouvert, et rejoint le groupe : celui-ci s’affiche alors sur son écran d’accueil, avec une note disant qui l’a ajouté. Un
téléphone ne rejoint qu’un groupe dont l’admin est le contact qui le lui a demandé, et un admin ne fait entrer un
contact qu’en tant que lui-même, jamais en tant que quelqu’un d’autre. Les groupes passent par le relais, il doit donc
être configuré.

**Pourquoi :** seul le téléphone de l’admin change le groupe (qui en fait partie, son nom), si bien qu’aucun serveur n’a
à mettre les changements en ordre : chaque téléphone les prend de celui-là. Un membre part donc en le demandant à
l’admin, et seul l’admin ajoute ou retire des membres.

- **Qui peut être invité :** les contacts que tu as acceptés, dans cet espace. Les membres qui ne sont pas contacts
  entre eux se parlent quand même dans le groupe, et apparaissent par le début de leur clé.
- **Ajouter comme contact :** dans la liste des membres (**⋯**), **Ajouter comme contact** sous un membre qui n’est pas
  ton contact lui demande, dans un message que lui seul reçoit, son lien de contact, et lui donne le tien. Sur son
  téléphone, la demande s’affiche une fois, en haut du groupe, et il appuie sur **Envoyer** ou **Ne pas envoyer** ; s’il
  appuie sur **Ne pas envoyer**, tu n’en es pas informé. Une fois qu’il l’a envoyé, vous êtes contacts l’un de l’autre,
  avec votre propre discussion, et **Nom** lui donne un nom, comme sous tout contact qui n’en a pas encore. L’absence de
  réponse peut signifier qu’il n’a pas encore ouvert le groupe, a dit non, a un {=Erevos} plus ancien, ou t’a toujours
  comme contact, ce qui ne lui montre rien ; au bout d’une semaine, tu peux redemander. Une fois que vous êtes contacts
  l’un de l’autre, dans n’importe quel groupe ou par un lien de contact, ce qui a été demandé dans vos autres groupes
  disparaît, et sa demande ne s’affiche plus. Un membre retiré du groupe ne demande plus rien. Si deux membres montrent
  la même clé, l’un d’eux n’est pas qui il prétend être, et aucun lien de contact ne va à l’un ou à l’autre ni n’est
  pris de l’un ou de l’autre. Pas dans les groupes publics. Demander est réservé au téléphone qui détient le compte ;
  **Nom** fonctionne aussi sur un appareil associé.
- **Chiffré de bout en bout pour le groupe :** MLS (RFC 9420). Chaque message est chiffré une fois pour le groupe, puis
  scellé de nouveau pour chaque membre, si bien que ce qui arrive dans la file de chaque membre ne ressemble à rien de
  ce que reçoivent les autres, et aucun relais ne peut savoir qui est dans un groupe. Il va directement dans la file de
  chaque membre, par ton relais. Chaque semaine, les clés de chaque téléphone dans le groupe sont renouvelées, celles de
  l’admin par lui-même et celles de chaque membre par l’admin, si bien que des clés prises une fois sur un téléphone
  cessent de lire le groupe.
- **Membres :** appuie sur le nom du groupe en haut, ou sur **⋯** à côté. L’admin ajoute des contacts, retire des
  membres et renomme le groupe. Un membre retiré ne lit plus rien de ce que dit le groupe à partir de là, et le groupe
  reste sur son téléphone, en lecture seule, jusqu’à ce qu’il le supprime.
- **Fils :** appuie longuement sur un message et choisis **Répondre dans le fil** pour lui répondre dans un fil, ou
  appuie sur **n réponses dans le fil** sous un message pour l’ouvrir. Le fil s’affiche seul, et ce que tu y envoies y
  répond.
- **Description :** l’admin du groupe l’écrit dans la liste des membres, sous **Description**, et appuie sur
  **Enregistrer**. Chaque membre la lit, y compris ceux qui rejoignent plus tard. Un changement venu de quelqu’un
  d’autre est ignoré.
- **Partir :** **Quitter le groupe** le demande à l’admin, dont le téléphone te retire la prochaine fois qu’{=Erevos} y est
  ouvert. Le bouton propre de l’admin est **Fermer le groupe** : il retire tous les membres.
- **Un seul admin :** un groupe privé a un admin, celui qui l’a créé. **Pourquoi :** les changements du groupe doivent
  venir dans un seul ordre, et avec MLS aucun serveur ne les met en ordre, si bien que deux admins pourraient changer le
  groupe en même temps et le couper en deux. Un Erevos d’avant cela n’accepte les changements que de celui qui a créé le
  groupe.
- **Appels de groupe :** le combiné vert en haut du groupe y lance un appel vocal, et la caméra bleue à côté un appel
  vidéo (aussi **Appel vidéo** sous **⋯**). Tant qu’un appel est en cours, seul son propre bouton s’affiche, pour le
  rejoindre. Il sonne sur les téléphones des membres où Erevos est ouvert, et qui répond y participe. Un appel en cours
  s’affiche en haut du groupe, pour le rejoindre plus tard. Jusqu’à huit personnes : chaque téléphone se connecte à
  chacun des autres, par le relais d’appel, si bien qu’aucun téléphone ne voit l’adresse IP d’un autre ; sans relais
  d’appel, seulement sur le même Wi-Fi. Chiffré de bout en bout entre chaque paire de téléphones, leurs clés étant
  envoyées dans le chiffrement du groupe. Dans un appel vidéo, chaque téléphone envoie son image à chacun des autres, si
  bien que les images s’affichent pour quatre personnes au plus ; au-delà, elles se mettent en pause et le son continue,
  jusqu’à ce qu’un serveur pour les appels vidéo plus grands soit mis en place. Un appel qui sonne propose **Rejoindre**
  et **Rejoindre en vidéo**.
- **Photos, fichiers et messages vocaux :** **+** à côté du champ envoie une photo ou un fichier, comme dans la
  discussion d’un contact, avec la même **Qualité de la photo** ; maintiens le micro pendant que tu parles, et relâche
  pour envoyer. Chacun est chiffré avec sa propre clé et déposé une fois sur ton relais, et seuls son emplacement et sa
  clé vont au groupe, dans son chiffrement. Le téléphone de chaque membre le prend là par son propre relais : jusqu’à 16
  Mo tout seul tant que le groupe est ouvert, un plus gros quand on appuie dessus. Appuie sur une photo pour la voir en
  entier, sur un fichier pour l’enregistrer, sur un message vocal pour l’écouter.
  - **Le relais le garde 14 jours,** chiffré, car il ne peut pas savoir quand chaque membre l’a pris.
  - **Par le relais seulement,** même quand les membres sont proches.
  - **Un membre qui rejoint plus tard** ne reçoit pas ce qui est venu avant, comme pour les mots. Un membre dont
    l’{=Erevos} est d’avant cette version n’en voit rien.
  - **Sur le téléphone**, chacun est gardé en morceaux, scellé, comme dans la discussion d’un contact. Supprimer le
    groupe ici les supprime.
- **Le menu d’un message,** par appui long, comme dans la discussion d’un contact : les réactions, **Répondre**,
  **Transférer**, **Ajouter une étoile**, **Épingler**, **Copier**, **Modifier** et **Supprimer**. Chaque membre a une
  réaction sur un message, et un sondage montre qui a choisi quoi. Une épingle vaut pour tout le monde, et n’importe
  quel membre peut la **Désépingler**. **Modifier** remplace tes propres mots par de nouveaux pour chaque membre,
  jusqu’à un jour après leur envoi, marqués **Modifié**. **Supprimer** demande **Ce téléphone** ou, pour ton propre
  message, **Pour tout le monde** : les Erevos des membres le suppriment aussi, et une photo, un fichier ou un message
  vocal à toi quitte ton relais aussitôt au lieu de 14 jours plus tard. **+** a aussi **Sticker**, **Position** et
  **Sondage** ici. Les liens sont soulignés et demandent confirmation avant de s’ouvrir, et les **Aperçus des liens**,
  quand ils sont activés, partent avec les tiens. Dans la feuille des membres, ou l’écran propre d’un groupe public,
  **Rechercher dans cette discussion** parcourt les messages du groupe et **Exporter la discussion** les écrit dans un
  fichier, et **Médias, liens et fichiers** liste les photos, vidéos, messages vocaux, musiques, fichiers et liens du groupe, chaque sorte à part, comme dans la discussion d’un contact (voir plus haut), chacun menant à son message ; **Messages avec étoile** et la recherche de l’écran d’accueil incluent aussi les groupes. Un membre dont
  l’{=Erevos} est d’avant cette version voit les mots, l’emoji d’un sticker, les coordonnées d’un lieu et la question d’un
  sondage, et rien des réactions, épingles, modifications et suppressions. **Sélectionner** choisit plusieurs messages à
  copier, transférer ou supprimer ensemble, un sondage à toi a **Terminer le sondage**, et **+** a aussi **Carte de
  contact**. **Pour tout le monde** n’est proposé à la suppression que si tout ce que tu as choisi est à toi.
- **Nommer un membre :** tapez **@** dans le champ du message, et les membres dont le nom commence par ce qui suit
  s’affichent au-dessus : touchez-en un pour mettre son nom entier. Un membre nommé ainsi est averti du message même
  s’il a mis le groupe en sourdine. Seuls les noms entiers comptent, donc **@Anna** ne nomme pas Anna Maria. Un Erevos
  d’avant montre seulement les mots, et avertit comme le disent les réglages du groupe.
- **Pas encore :** la saisie et les messages éphémères dans les groupes, et les groupes par un téléphone à
  proximité.

## Groupes publics {#public-groups}

Un groupe public est un groupe que quiconque a son lien, ou son code QR, peut demander à rejoindre : pour un club, une
rue ou une classe, où tout le monde n’est pas ton contact. Depuis le menu de l’écran d’accueil, **Groupes publics** :
donne-lui un nom et le nom sous lequel tu y apparais, choisis qui entre, et appuie sur **Créer le groupe public**. Tu en
es le propriétaire. Ses messages sont chiffrés de bout en bout avec MLS et vont à chaque membre comme dans tout groupe,
et aucun relais n’apprend qui en fait partie.

- **Le lien :** appuie sur le nom du groupe en haut pour son lien et son code QR, et sur **Partager le lien**. Quiconque
  l’ouvre, ou scanne le code avec l’appareil photo du téléphone, choisit le nom que voit le groupe et appuie sur
  **Demander à rejoindre**. Un lien peut aussi être collé sous **Rejoindre par un lien**. Chaque membre a le lien, et
  peut le transmettre.
- **Description :** le propriétaire ou un admin l’écrit dans l’écran propre du groupe, sous **Description**, et appuie
  sur **Enregistrer** ; tous les membres du groupe la lisent.
- **Rejoindre en ton absence :** la demande attend sur ton relais, scellée pour que seul ton téléphone l’ouvre, jusqu’à
  ce qu’Erevos soit ouvert sur ton téléphone : il regarde toutes les quelques secondes tant qu’Erevos est affiché, et
  environ chaque minute en arrière-plan. Il fait alors entrer la personne, et le groupe s’affiche sur son téléphone.
- **Qui peut entrer :** **Quiconque a le lien**, ou **Un admin les fait entrer** : alors celui qui demande attend sous
  **Demandes pour rejoindre**, que toi ou un admin appuyiez sur **Faire entrer** ou **Refuser**. Ton téléphone le fait
  quand même entrer, dès qu’il l’apprend.
- **Admins :** sous **Membres**, appuie sur **Modérer** à côté d’un membre, puis sur **Nommer admin**. Les admins
  mettent en sourdine, retirent et bannissent des membres, font entrer qui demande, et suppriment un message pour tout
  le monde ; toi seul modères les admins, et personne ne te modère.
  - **Couper micro :** son téléphone n’envoie rien dans le groupe, et aucun téléphone n’affiche de toute façon ce que le
    sien envoie. **Laisser écrire** l’annule.
  - **Retirer :** il ne lit plus rien de ce que dit le groupe à partir de là, et peut redemander à rejoindre par le
    lien.
  - **Bannir :** retiré, et ce que son téléphone demande ensuite est refusé. **Lever le bannissement**, sous **Bannis**,
    l’annule. Un bannissement arrête le même téléphone, pas quelqu’un qui revient avec une nouvelle file d’attente sur
    un relais : contre cela, choisis **Un admin les fait entrer**, ou change le lien.
  - **Supprimer pour tout le monde :** les derniers messages sont listés en bas ; **Supprimer** en retire un du
    téléphone de chaque membre. Qui l’a déjà lu peut en avoir gardé une copie.
- **Changer le lien :** le lien et le code QR partagés jusque-là cessent aussitôt de fonctionner, et chaque membre
  reçoit le nouveau. Les demandes encore en attente sur l’ancien sont perdues.
- **Céder le groupe :** sous **Modérer** d’un membre. Son téléphone en est propriétaire à partir de là et fait entrer
  les gens, donc le lien change pour un lien sur son relais ; tu restes admin. Si ton téléphone est perdu avant que tu
  le cèdes, personne ne peut plus faire entrer qui que ce soit, même si le groupe continue pour ceux qui en font partie.
- **Fermer le groupe** retire tous les membres. **Quitter le groupe** d’un membre demande à ton téléphone de le retirer.
- **Un groupe jetable,** pour une occasion : avant de le créer, sous **Fin**, choisissez **Après un jour**, **Après 3
  jours** ou **Après 7 jours**. Quand son temps est écoulé, l’Erevos de chaque membre le supprime, chacun selon
  l’horloge de son propre téléphone, avec ses messages, photos et fichiers, la prochaine fois qu’il est ouvert, et son
  lien ne fonctionne plus. Sa fin est fixée à la création du groupe et ne change jamais. L’écran du groupe lui-même
  indique quand il prend fin. Un membre sur un {=Erevos} plus ancien le garde, et d’ici là chacun a pu en garder une
  copie ou une capture d’écran.
- **Jusqu’à 100 membres,** car tout le groupe doit tenir dans l’unique message qui fait entrer quelqu’un.
- **Chaque téléphone d’un groupe public a besoin de cette version d’{=Erevos}.** Les groupes faits à partir de contacts
  fonctionnent comme avant.

**Pourquoi :** seul le téléphone du propriétaire change le groupe et fait entrer les gens, si bien que les changements
ne se font jamais concurrence et qu’aucun serveur n’a à les mettre en ordre. C’est pourquoi le groupe continue sans lui,
mais personne de nouveau n’entre : cède-le avant de changer de téléphone.

### Ce qu’un groupe public révèle

> Quiconque a le lien peut lire le groupe à partir du moment où il est admis, jamais ce qui a été dit avant, et le lien
> peut être transmis : change-le pour arrêter cela.

- **Le lien** montre le nom du groupe et l’adresse de ton relais à quiconque le voit.
- **Chaque membre voit, de chaque membre,** le nom choisi, une clé faite pour ce groupe seul, l’adresse de son relais et
  l’identifiant d’expéditeur de sa file. La clé ne dit rien de qui il est dans ses discussions, ni des autres groupes
  dont il fait partie. La file est une file sur laquelle seuls ses groupes publics lisent, pas celle de son lien de
  contact, la même dans chacun de ses groupes publics (un Erevos d’avant 2.0.0 donne celle de son lien de contact).
- **Les noms sont choisis, pas prouvés :** n’importe qui peut s’appeler n’importe comment. Le début de la clé de chaque
  membre s’affiche à côté du nom, et le propriétaire et les admins sont marqués.
- **Tout ce qui est dit peut être copié** par n’importe qui dans le groupe : le chiffrement de bout en bout tient les
  relais à l’écart, pas les membres.
- **Les relais** ne lisent rien et n’apprennent rien de qui est dans le groupe. Le tien voit des demandes arriver à la
  porte du groupe, combien et quand, pas de qui. Les membres peuvent remplir la file des uns des autres de ce qui ne
  peut pas être lu, jusqu’à ce que le relais accepte.

## Comment Erevos choisit le chemin {#paths}

Quand tu envoies un message, Erevos choisit le chemin tout seul :

1. **Son téléphone est proche** (le haut de la discussion indique **À proximité**) : il part par la liaison à proximité,
   et aussi par le relais quand il y en a un.
2. **Sinon, avec un relais :** il passe par le relais, et un message court part aussi vers les téléphones {=Erevos} reliés
   à proximité, si bien que le sien peut répondre à proximité s’il est l’un d’eux. Si le relais est injoignable, c’est
   cette copie qui compte, et ces téléphones la portent aussi au relais de ton contact, comme dans [Discuter avec un
   téléphone à proximité](#nearby).
3. **Sinon, sans relais,** il va vers les téléphones {=Erevos} reliés à proximité, comme à l’étape 2.
4. **Et par LoRa,** quand une radio est configurée et que le relais n’a pas pu prendre un texte, comme dans [Par une
   radio LoRa](#lora). Sans aucun moyen, le message attend, marqué **En attente**, et part tout seul dès qu’il y en a
   un, comme dans [Envoyé, arrivé et lu](#relay) ; une ligne sous la discussion dit pourquoi.
5. [~] **Et par SMS,** en tout dernier, quand tu l’as activé pour ce contact et que rien d’autre n’a pris un texte,
   comme dans [SMS](#sms).

Tous les chemins sont chiffrés de bout en bout : aucun relais ni aucun téléphone entre les deux ne peut lire ce que tu
envoies.

**Voies**, dans **Réglages** → **Relais et réseaux**, montre chaque voie d’un coup d’œil : une carte pour le relais, Nostr, les téléphones à proximité, LoRa{~, les SMS} et Tor, chacune avec son état et une ligne dessous, pleine quand la voie fonctionne, pâle quand elle est activée mais n’atteint personne pour l’instant, et en tirets quand elle est désactivée. Au-dessus, il dit combien de tes messages attendent de partir, avec un point orange pour chacun. Une carte ouvre les réglages de sa voie. Seul l’espace ouvert s’y affiche, jamais les discussions cachées. Sur l’accueil, la ligne sous la barre du haut est aussi **Voies**, dès qu’un relais est réglé : un point pour chaque voie, et combien de tes messages attendent ; un toucher l’ouvre.

| Ligne sous la discussion | Que faire |
| --- | --- |
| **Envoyé à proximité, chiffré de bout en bout.** | Rien : son téléphone est proche et l’a reçu. |
| **Envoyé par le relais, chiffré de bout en bout.** | Rien : il est en route. |
| **Envoyé aux téléphones {=Erevos} à proximité, chiffré de bout en bout, car le relais était injoignable.** | Il n’arrive que si l’un d’eux est le sien : attends **✓✓**, ou vérifie le relais. |
| **… Si le sien n’en fait pas partie, ils le remettent à son relais dès qu’ils ont internet, et ce téléphone aussi.** | Rien : il arrive dès que l’un d’eux, ou ce téléphone, atteint internet. Attends **✓✓**. |
| **Envoyé par LoRa, chiffré de bout en bout, car le relais était injoignable.** | Il arrive si son {=Erevos} a une radio sur le même mesh, à portée : attends **✓✓**, ou vérifie le relais. |
[~] | **Envoyé par SMS, chiffré de bout en bout, car rien d’autre ne pouvait le prendre.** | Rien : ça coûte des SMS, et l’opérateur voit que tu as écrit à son numéro. **✓✓** arrive dès que le relais ou Nostr sont joignables. |
| **En attente. Le relais est injoignable (ou Il n’y a pas de relais), et son téléphone n’est pas à proximité.** | Rien : il part tout seul dès que le relais ou son téléphone à proximité peut le recevoir, puis affiche **✓**. Sans relais, remplis son adresse, comme dans [Discuter par un relais](#relay), ou approche-toi de son téléphone. |
| **En attente. Il est trop long pour LoRa.** | Rien : il part dès que le relais ou son téléphone à proximité peut le recevoir. Ou envoie-le en parties plus courtes. |
[~] | **En attente. Il est trop long pour un SMS.** | Rien : il part dès que le relais ou son téléphone à proximité peut le prendre. Ou envoie-le en parties plus courtes. |
| **Non envoyé. Le relais n’a plus la file d’attente de ce contact.** | Demande-lui de t’écrire, ou son nouveau lien de contact. |
| **Cette version ne peut pas chiffrer, donc les discussions par le relais sont désactivées.** | Recompile l’app : cette version est plus ancienne que son chiffrement. |

## Faire tourner ton propre relais {#own-relay}

Un relais que tu fais tourner toi-même est le plus sûr, car celui qui fait tourner un relais voit qui s’y connecte. Le
code source contient tout dans \`deploy/relay\`.

- **Sur ton propre réseau :** fais tourner le relais sur un ordinateur, ouvre le port 7879 dans son pare-feu, et tape
  \`ws://<son adresse>:7879\` sur chaque téléphone. Referme le port quand tu as fini.
- **Sur internet :** un serveur (VPS) sous Debian 12 ou Ubuntu 22.04 ou plus récent, un nom de domaine (ou un nom
  \`sslip.io\` gratuit) et les ports 80 et 443 ouverts. Une seule commande installe le relais derrière Caddy, avec un
  certificat de Let's Encrypt et un jeton aléatoire. Chaque téléphone utilise alors \`wss://<ton domaine>\` et ce jeton.
  La même commande installe le relais d’appel pour les appels, qui a aussi besoin du port 3478 et des ports UDP 50000 à
  50999 ouverts.

Les files d’attente et les messages en attente sont gardés sur le disque du serveur, de même que les morceaux chiffrés
des photos et des fichiers jusqu’à ce qu’ils soient pris (1024 Mo ensemble au plus), si bien qu’un redémarrage ne perd
rien, et aucune requête n’est journalisée. Les messages envoyés pour plus tard y sont aussi gardés jusqu’à leur heure,
10 000 ou 256 Mo au plus : le relais voit quand chacun doit partir, pas ce qu’il dit.

**Pourquoi :** ce que le relais garde a des limites, si bien que les téléphones qui l’utilisent ne peuvent pas remplir
son disque ni sa mémoire.

**Sa propre clé :** le fichier de clé du relais (\`EREVOS_RELAY_KEY\`, que la commande unique met en place) est ce qu’il
prouve à chaque connexion, si bien que les téléphones le reconnaissent à cette clé plutôt qu’à son certificat (voir [La
clé propre du relais](#relay)). Garde ce fichier, dans ses sauvegardes aussi : avec un nouveau, chaque téléphone qui
connaissait l’ancienne clé refuse le relais jusqu’à ce que quelqu’un y appuie sur **Il a une nouvelle clé**.

**Invitations :** le relais peut laisser chaque téléphone avoir son propre jeton, dans un fichier de jetons, puis
laisser ces téléphones en inviter d’autres, chaque invitation pour un téléphone (voir [Invitations au relais](#relay)).
Active-le avec \`EREVOS_RELAY_INVITES=on\` à côté de \`EREVOS_RELAY_TOKENS\` ; le relais écrit alors lui-même les lignes
des téléphones invités dans ce fichier, avec qui les a invités et quand, et retirer une ligne coupe ce téléphone, lui
seul : les téléphones qu’il a invités gardent les leurs, donc pour les couper aussi, supprime chacune de leurs lignes
(chacune dit qui l’a invité). Il laisse entrer 100 téléphones par invitation au plus (\`EREVOS_RELAY_MAX_INVITED\`).
\`erevos-relay free-line NAME\`, lancé avec le relais arrêté, fait d’une ligne l’une des tiennes : le téléphone qui l’a
invitée ne peut plus la reprendre, et elle ne compte plus parmi les 100. Un téléphone qui vient avec le jeton du relais
(\`EREVOS_RELAY_TOKEN\`) demande une fois une ligne à lui, que le relais ajoute comme l’une des tiennes, en notant qu’il
est venu avec le jeton du relais et quand, 50 par jour au plus : tu peux ainsi distribuer ce jeton, supprimer la ligne
de n’importe quel téléphone, puis changer le jeton sans couper les autres. \`deploy/relay/README.md\` explique comment.

**Connexion :** avec un fichier de jetons, le relais peut aussi laisser des téléphones se connecter avec un fournisseur
OpenID Connect, comme Authentik, pour obtenir un jeton à eux, et vérifie chaque compte toutes les heures, retirant ses
téléphones après 3 jours sans réponse et deux vérifications de plus de chaque téléphone qui échouent à une heure
d’intervalle (voir [Se connecter au relais](#relay)). Un navigateur peut lancer 10 connexions par minute. Avec
\`EREVOS_RELAY_OIDC_GROUP\`, seuls les comptes de ce groupe le peuvent. Il faut un client chez le fournisseur, quelques
réglages, et \`/signin/\` transmis au relais en HTTP simple : \`deploy/relay/README.md\` explique comment.

> Ne publie jamais le jeton là où d’autres peuvent le lire. Celui qui fait tourner le serveur voit les adresses IP qui
> se connectent, les identifiants des files d’attente, et quand et combien arrive. Il ne peut pas lire les messages, qui
> sont chiffrés de bout en bout.

## Relais d’attache {#home-relay}

Sous **Réglages** → **Relais et réseaux** → **Relais d’attache**, un espace peut avoir un second relais avec sa propre
file d’attente : un relais à la maison, sur un Raspberry Pi ou un vieil ordinateur, ou tout autre relais en qui tu as
confiance. C’est facultatif.

- **Ce qu’il fait :** ton lien de contact et chaque message indiquent cette file à côté de ton relais. Tant que ton
  relais est injoignable, tes contacts écrivent là, et Erevos prend ce qui y arrive à chaque passage. Ce que tu envoies
  passe par lui quand ton propre relais est en panne.
- **Comment le configurer :** fais tourner un relais comme dans [Faire tourner ton propre relais](#own-relay), tape son
  adresse (et son jeton, s’il en a un) et choisis **Enregistrer**. Tes contacts l’apprennent par ton prochain message,
  ou par ton nouveau lien de contact.
- **Ce qu’il voit :** ce que voit ton relais, l’adresse de ce téléphone quand il prend des messages (mais pas quand il
  est joint seulement par Tor), et quand et combien arrive. Les discussions masquées ne l’utilisent pas.
- **Seulement par Tor :** un interrupteur pour chaque relais d’attache. Ce relais ne voit jamais l’adresse de ce
  téléphone, quel que soit le réglage de Tor pour le reste. Sans jeton tapé, il donne un jeton contre un coupon : ton
  relais, celui de l’espace, signe le coupon en aveugle, si bien qu’aucun des deux relais ne peut savoir à qui est le
  jeton. Le coupon est pris jusqu’à une heure après sa signature, à un moment au hasard, si bien que les heures vues par les deux
  relais ne correspondent pas, et le jeton vient du relais d’attache dans l’heure. Le jeton dure 90 jours, et Erevos
  prend de lui-même un nouveau coupon un jour au hasard entre le jour 30 et le jour 60. Une limite : avec peu de téléphones sur un relais, qui gère les
  deux pourrait encore deviner par les heures seules. Ainsi, deux espaces (voir [Second mot de passe](#second)) peuvent
  chacun utiliser le relais de l’autre comme relais d’attache, et aucun relais ne les relie. Les deux relais doivent
  avoir les coupons activés, et il faut une version avec Tor, sur Android (voir [Par Tor](#tor)).
- **Automatiquement depuis ton relais :** un interrupteur, éteint sauf si tu l’actives, sur Android, où Erevos a Tor.
  Quand ton relais nomme un relais apparié avec lui (son opérateur le règle), un espace sans relais d’attache prend
  celui-là de lui-même, seulement par Tor, avec son jeton venu d’un coupon comme plus haut : rien à taper, et rien à
  faire quand ton relais en nomme un autre. L’éteindre lâche le relais d’attache qu’il a pris, et retirer le relais d’attache à la main le désactive pour cet espace ; un
  relais d’attache que tu as tapé toi-même reste tel quel. Les emplacements masqués n’en prennent jamais ainsi.
- **Pour les discussions masquées :** chaque emplacement masqué peut avoir son propre relais d’attache, sous **Pour les
  utilisateurs avancés** sur son écran sans discussion choisie, tant qu’il est ouvert. Il est gardé avec cet emplacement
  seul, scellé avec son code PIN, si bien que l’espace n’en sait rien, et il est consulté tant que l’emplacement est
  ouvert. Utilise un autre relais que celui de l’espace : un même relais qui verrait les deux files les relierait.

**Plus d’un :** **Ajouter un autre relais d’attache** en donne jusqu’à deux de plus, chacun avec sa propre file, par
exemple un à la maison et un chez un ami. Vos contacts les essaient dans l’ordre affiché, et Erevos prend ce qui arrive
sur chacun. Votre lien de contact ne nomme les autres que tant qu’il reste assez court pour un code QR ; le reste
parvient à vos contacts avec votre prochain message. Un contact avec un {=Erevos} plus ancien n’utilise que le premier.

## Par Tor {#tor}

Sous **Réglages** → **Relais et réseaux** → **Tor**, **Ce qui passe par Tor** choisit lesquelles des requêtes de cet
espace vers ses relais passent par le réseau Tor. Chaque espace a son propre choix :

| Choix | Ce qui passe par Tor |
| --- | --- |
| **Rien** | Tant que tu ne changes rien. Le relais et les relais Nostr voient l’adresse IP de ton téléphone pour tout. |
| **Messages** | Ce que tu écris, et ce qui dit quelque chose à tes contacts, comme le fait qu’un message a été lu. Les images, fichiers et messages vocaux passent en direct, ce qui est plus rapide : pour eux, le relais voit l’adresse IP de ton téléphone. |
| **Tout** | Les fichiers aussi. Rien ne va à un relais sans Tor. |

**Pourquoi :** un nouvel espace commence sur **Rien**, car Tor ralentit les messages ; un espace fait avant garde son
choix. Avec **Messages**, ce que tu écris est caché par Tor et ne l’attend jamais, tandis que les images, fichiers et
messages vocaux, qui sont gros, passent en direct et donc plus vite.

- **Activer Tor :** de **Rien** à **Messages** ou **Tout**, Erevos demande d’abord **Activer Tor ?** et dit que les
  messages seront plus lents ; **Annuler** garde **Rien**.

- **Une seule discussion par Tor :** dans une discussion Erevos, **Détails** → **Par Tor** envoie les messages et
  fichiers de cette discussion uniquement par Tor, sur des circuits Tor à elle, quel que soit le choix de cet espace ;
  c’est désactivé tant que tu ne l’actives pas. Le relais ne voit alors pas l’adresse IP de ton téléphone pour cette
  discussion, et aucune sortie Tor ne la porte avec une autre discussion. C’est plus lent, et ce qui part attend
  pendant le démarrage de Tor. Les appels ne passent pas par Tor. Les discussions cachées l’ont aussi, chacune dans
  ses propres **Détails**.
  C’est pareil sur tes appareils associés : activé ou désactivé sur l’un, c’est activé ou désactivé partout. Sur un
  appareil sans Tor, comme l’application web, cette discussion n’envoie rien tant que c’est activé.
  Cela couvre aussi les textes Nostr de cette discussion et ses photos et fichiers sur des serveurs de fichiers Nostr,
  même quand le choix de cet espace est **Rien** : Tor est démarré pour eux, et rien ne part en direct. Tant que ton
  contact n’a pas écrit une première fois dans la file propre à la discussion, ses premiers messages arrivent dans la
  file de l’espace, qui est lue comme l’espace le dit. Voir [Qui voit ton adresse internet](#ip).

- **Ce qu’il cache :** le relais ne voit plus l’adresse IP de ton téléphone, seulement une sortie Tor (ou rien, pour un
  relais avec une adresse \`.onion\`). Ton opérateur téléphonique ou le Wi-Fi voit seulement que tu utilises Tor, pas
  quel relais.
- **Ce qu’il coûte :** ce qui passe par Tor arrive et part plus lentement, et le premier démarrage de Tor prend un
  moment. L’écran montre où en est Tor. Pour ménager la batterie, Erevos envoie le remplissage réduit que Tor a conçu
  pour les téléphones : le remplissage que Tor envoie pour cacher quand tu parles part toutes les 9 à 14 secondes, pas
  toutes les quelques secondes, et rien n’arrive au téléphone.
- **Ce qu’il ne couvre pas :** les appels, dont le son et l’image passent directement entre les téléphones ou par le
  relais d’appel ; les téléphones à proximité{~ et les SMS}, qui n’utilisent pas internet.
- **Sur Android seulement :** {=Erevos} sur un ordinateur et l’app web n’ont pas encore Tor, donc là, tout passe en direct.

> Avec **Messages**, un message n’attend jamais Tor : un message que Tor n’a pas pu porter au relais part aussitôt en
> direct, de même que les messages pendant que Tor démarre, ou pendant une minute après qu’il n’a pas pu joindre le
> relais ; puis Tor est réessayé. Avec **Tout**, rien ne va à un relais sans Tor : quand Tor ne peut pas joindre le
> relais, le message attend et est réessayé ; Erevos ne se rabat jamais tout seul sur ta propre connexion.

### Ponts

Là où Tor lui-même est bloqué, **Ponts** sur le même écran permet à Tor de joindre son réseau par des ponts. C’est
**Aucun pont** tant que tu ne choisis pas, chaque espace a le sien, et cela ne compte que tant que quelque chose passe
par Tor.

| Choix | Ce que c’est |
| --- | --- |
| **Automatique** | Erevos essaie les moyens tour à tour jusqu’à ce que Tor se connecte : en direct, les ponts obfs4, Snowflake, puis tes propres lignes, si tu en as. Il retient pendant 30 jours celui qui a marché en Wi-Fi et en données mobiles, et l’essaie en premier ; sur un autre réseau, il cherche à nouveau. Avec **Mon réseau est surveillé** activé, il n’essaie jamais en direct, et le réseau ne voit qu’un pont. |
| **obfs4** | Les ponts obfs4 fournis avec Tor Browser. Pour qui surveille le réseau, Tor ressemble à des octets aléatoires. Un censeur qui les connaît peut les bloquer. |
| **Snowflake** | Par les navigateurs de bénévoles, via WebRTC, comme un appel vidéo. Pour en trouver un, Erevos interroge le broker de Snowflake à travers un CDN, derrière le nom d’un autre site, et des serveurs STUN indiquent au téléphone sa propre adresse : ils voient cette adresse, jamais tes messages. Plus lent, et difficile à bloquer. |
| **Les miens** | Des lignes de pont de bridges.torproject.org, de bridges@torproject.org par e-mail, ou de @GetBridgesBot sur Telegram, collées une par ligne ; puis appuie sur **Utiliser ces ponts**. Les ponts obfs4, Snowflake, WebTunnel, meek et les ponts simples fonctionnent. |

- **Seulement par eux :** avec des ponts, Tor ne va jamais directement à ses relais. Quand aucun pont ne répond, avec
  **Tout**, les messages attendent, comme quand Tor ne peut pas joindre le relais ; avec **Messages**, ils vont au
  relais sans Tor jusqu’à ce qu’un pont réponde. Les lignes qui ne sont pas des ponts ne sont pas prises, et Tor reste
  désactivé.
- **Vérifier ma connexion**, en dessous, dit si Tor se connecte, et par quel moyen, jamais l’adresse du téléphone.
  Avec **Automatique**, il cherche à nouveau depuis le début.
- **Les changer** pendant que Tor tourne ferme ses connexions et les refait de la nouvelle façon.
- **Sur Android seulement :** l’app embarque lyrebird, le programme de Tor lui-même pour obfs4, Snowflake, WebTunnel et
  meek. Un ordinateur et l’app web n’ont pas encore Tor, donc pas de ponts non plus.

## Par Nostr {#nostr}

Sous **Réglages** → **Relais et réseaux** → **Nostr**, **Les textes par Nostr** est sur **Activé** tant que tu ne le
changes pas. Alors ce que tu écris à un contact dont l’{=Erevos} lit aussi sur Nostr passe d’abord par tes relais : ton
relais, puis les relais d’attache de ton contact, puis ton relais d’attache ; et par des relais Nostr publics seulement
quand aucun ne l’a pris. Chaque espace a son propre choix, et ses propres relais Nostr.

- **Comment c’est scellé :** chiffré de bout en bout comme toujours, puis scellé une fois de plus pour une clé que ton
  contact a donnée à cette discussion seule, et signé par une clé faite pour ce seul texte (un gift wrap NIP-59). Les
  relais Nostr voient que quelqu’un a écrit à une clé qui ne nomme personne, quand, et quelle taille ; pas qui l’a
  écrit, ni à qui. Ton relais ne voit pas ce qui est passé par là.
- **Ce que les relais Nostr peuvent savoir :** ton téléphone demande à chacun d’eux toutes ses clés à la fois :
  un relais peut savoir que ces clés sont lues ensemble. Via Tor, jamais d’où : chaque relais est joint par ses propres
  circuits Tor, si bien qu’aucune sortie Tor ne porte ce qui va à deux d’entre eux, et aucune ne peut savoir que c’est le
  même téléphone. Avec **Rien**, cela va en direct, donc ils voient l’adresse IP de ton téléphone, mais toujours pas qui
  écrit à qui. Certains relais refusent certaines sorties Tor, et certaines sorties ne peuvent pas joindre un relais :
  après un tel échec, l’essai suivant passe par une autre sortie.
- **Comment cela passe :** avec **Rien**, les textes vont en direct aux relais Nostr. Avec **Messages**, via Tor une
  fois Tor prêt, et par ton relais pendant que Tor démarre. Avec **Tout**, seulement via Tor. Quand la voie change, les
  connexions Nostr se ferment et se rouvrent par la nouvelle voie.
- **Nostr par Tor :** sur l’écran **Nostr**, **Nostr par Tor** est sur **Désactivé** tant que tu ne l’actives pas.
  **Activé**, Erevos joint les relais Nostr et les serveurs de fichiers Nostr uniquement par Tor et démarre Tor pour
  cela, même quand le Tor de l’espace est sur **Rien** ; un texte qui part là-bas attend pendant le démarrage de Tor.
  Cela ajoute seulement Tor : avec Tor activé pour l’espace, Nostr passe par Tor quoi que dise ce réglage, et une
  discussion réglée sur **Par Tor** passe par Tor quoi que dise ce réglage. Voir [Qui voit ton adresse internet](#ip).
- **Les relais :** relay.damus.io, nos.lol et relay.primal.net tant que tu ne les changes pas ; tu peux ajouter les
  tiens, cinq au plus. Tes contacts apprennent les relais sur lesquels tu lis, et t’y écrivent ; un relais qui prend un
  texte suffit.
- **Ce qui reste sur ton relais :** les appels, réactions, et les marques qu’un message est arrivé ou a été lu ; et ce que tu écris à des contacts sur un iPhone ou un ordinateur, qui ne lisent pas sur Nostr. Les images, fichiers et messages vocaux passent par ton relais quand il y en a un entre vous ; sans relais entre vous, ils passent aussi par Nostr (voir Sans aucun relais).
- **Par où il est passé :** appuie longuement sur un message : son menu dit **Envoyé par Nostr** ou **Arrivé par Nostr**
  quand un relais Nostr l’a pris. Désormais il dit aussi **Envoyé par le relais**, **Arrivé par le relais**, **Envoyé à
  son téléphone proche**, **Arrivé d’un téléphone proche** ou **Envoyé par LoRa** ; un message plus ancien ne dit rien.
  La note sous les messages dit aussi **Envoyé par Nostr**. Deux téléphones côte à côte se donnent d’abord les textes à
  proximité, puis par les relais ; Nostr ne porte un texte que quand les relais ne l’ont pas pris.
- **Ce que les relais ont fait en dernier :** l’écran **Nostr** montre, pour chaque relais, s’il a pris le dernier texte
  qu’on lui a donné et combien de secondes après, ou pourquoi pas, et si ton téléphone y lit. C’est gardé sur ce
  téléphone seulement, jusqu’à la fermeture d’Erevos. Un texte n’attend jamais les relais Nostr tant que tes relais le
  prennent.
- **Sur Android seulement,** comme Tor.

**Pourquoi :** les relais Nostr sont publics, donc, quand Tor est activé pour l’espace, Erevos les joint via Tor, et ils
n’apprennent jamais où est ton téléphone ; avec **Rien**, il les joint en direct. Seuls les textes y vont, comme
secours de tes relais : un texte qui y est allé repasse par ton relais s’il n’arrivait pas, alors que les marques qu’un
message est arrivé ou a été lu n’en auraient aucun, et un message envoyé pour plus tard a besoin de ton relais pour le
garder jusqu’à son heure. Sans relais entre vous, les images, fichiers et messages vocaux y vont aussi (voir Sans aucun
relais).

> Un texte passé par Nostr repasse par ton relais si le téléphone de ton contact ne dit pas dans les cinq minutes qu’il
> est arrivé, et ton contact le voit une fois. Quand ni tes relais ni aucun relais Nostr ne le prennent, il attend et
> repart, comme tout message.

- **Discussions masquées :** elles lisent aussi sur Nostr, tant qu’elles sont ouvertes, et fermées aussi tant que
  **Recevoir une fois fermées** est activé pour elles et que l’espace est ouvert (voir [Discussions masquées](#hidden)).
  Fermées, elles affichent quand même « Nouveau message » : avec chaque texte par Nostr, ton contact envoie aussi à ton
  relais une sonnette, un message qui ne dit rien, que ton relais compte comme un message, comme avant. Sans relais,
  leur lien de contact et leur code QR disent où elles lisent sur Nostr, avec une clé de cet emplacement seul, et les
  textes, les réactions et les marques qu’un message est arrivé y vont, comme depuis un téléphone sans relais.

### Sans aucun relais {#nostr-only}

Un téléphone sans relais, sans invitation et sans compte LPHL peut quand même commencer : son lien de contact et son
code QR disent où il lit sur Nostr, et cela suffit pour parler.

- **Pour commencer :** dans **Nouvelle discussion**, appuie sur **Commencer sans relais**, puis sur **Afficher mon code
  QR** ou **Partager mon lien de contact**, et donne-le à quelqu’un qui utilise {=Erevos}. Celui qui l’ajoute t’écrit par
  Nostr, et apparaît comme une demande de message, que tu acceptes. Tu peux aussi ajouter son lien ou son code
  QR, de la même façon.
- **Ce qui passe :** les textes, stickers, réactions, modifications, et les marques qu’un message est arrivé ou a été lu, tout par Nostr ; et les photos, fichiers et messages vocaux. Un message vocal passe en wraps comme un texte. Une photo jusqu’à 3 Mo passe en morceaux de 32 Ko, un wrap chacun, envoyés avant le message qui la propose ; l’autre téléphone les garde, chiffrés avec le reste de l’espace ou des discussions masquées pour lesquels ils sont venus, jusqu’à ce que tous soient arrivés, quatre jours au plus. Une photo plus grande, une vidéo ou tout autre fichier, jusqu’à 20 Mo, passe en un seul blob, chiffré sur le téléphone, vers un serveur de fichiers Blossom (blossom.primal.net, blossom.band ou nostr.download), via Tor comme le dit le choix Tor de l’espace (en direct avec **Rien**) : le serveur ne garde que ce qu’il ne peut pas lire. Les appels et les groupes ont besoin d’un relais, ou de l’autre téléphone à proximité. Les discussions masquées fonctionnent ainsi aussi, par Nostr seulement (voir [Discussions masquées](#hidden)).
- **Quand il n’arrive pas :** les relais Nostr gardent un texte deux jours. Tant que le téléphone de ton contact n’a pas
  dit qu’il est arrivé, Erevos le lui redonne une fois par jour, pendant deux semaines.
- **Un relais tout seul :** quand ton contact a un relais qui lui permet d’inviter, son {=Erevos} envoie tout seul au tien
  une invitation à celui-ci, une fois, dans la discussion, que vous vous soyez rencontrés par Nostr ou à proximité, par
  Bluetooth, Wi-Fi ou un code QR. Ton téléphone la prend tout seul, et à partir de là les photos, messages vocaux et
  appels fonctionnent aussi, avec tout le monde. Elle compte comme l’une de ses invitations. Quelqu’un dont tu n’as pas
  accepté la demande de message ne choisit aucun relais pour toi : son invitation attend que tu l’acceptes, une semaine
  au plus.
- **Un Erevos plus ancien** ne lit pas la partie Nostr d’un lien : il te joint à proximité seulement, jusqu’à ce que tu
  aies un relais.

**Pourquoi :** Nostr n’est que la porte d’entrée. Personne n’a besoin d’une invitation pour commencer, et dès que l’un
de vous a un relais, celui-ci porte ce qui est trop gros pour Nostr.

## Qui voit ton adresse internet {#ip}

L’adresse internet de ton téléphone, son adresse IP, montre à peu près où tu es et quel fournisseur tu utilises. Elle
ne montre pas ce que tu écris. Qui se connecte à ton téléphone la voit, sauf si la connexion passe par Tor.

- **Ton relais et les relais de tes contacts :** ils la voient. Pour la cacher, active Tor pour l’espace (**Réglages**
  → **Relais et réseaux** → **Tor**) ou **Par Tor** dans les **Détails** d’une discussion. Voir [Par Tor](#tor).

- [+] **XMPP :** ton serveur XMPP la voit tant qu’Erevos est connecté, sauf si le compte passe par Tor ; les serveurs de tes
  contacts et de tes groupes non, car ton serveur leur porte tes messages. Erevos prévient avant que tu envoies dans une
  discussion tant que le compte ne passe pas par Tor (avec **Par Tor** pour cette discussion comme solution), avant
  chaque appel, et avant de récupérer un fichier sur un autre serveur que le tien. Voir [XMPP](#xmpp).

- **Les relais Nostr publics et les serveurs de fichiers Nostr :** ils la voient, sauf si la connexion passe par Tor.
  Active **Nostr par Tor** sous **Réglages** → **Relais et réseaux** → **Nostr**, ou **Par Tor** pour une discussion.
  Voir [Par Nostr](#nostr).
- **S’associer par un code :** les deux téléphones se retrouvent sur ces mêmes relais Nostr publics, donc sans Nostr via
  Tor ils voient l’adresse, mais pas le code ni les liens de contact. Erevos le dit avant la première fois.

- [+] **Matrix :** seul ton propre serveur Matrix la voit, pas les serveurs de tes contacts : les photos et fichiers
  d’autres serveurs te parviennent aussi par le tien. Choisis **Tor pour ce compte Matrix** sur l’écran Matrix, ou
  active **Par Tor** sous les boutons d’une discussion, qui fait passer tout le compte par Tor. Voir [Matrix](#matrix).
- [+] **Telegram :** les serveurs de Telegram la voient, sauf si le compte passe par Tor : choisis **Toujours par Tor**
  dans **Tor pour ce compte Telegram**, dans les réglages Telegram, ou active **Par Tor** dans les infos d'une
  discussion, ce qui fait passer tout le compte par Tor. Voir [Telegram](#telegram).
- [+] **Les discussions avec d’autres applis Nostr et le fil Public :** leurs relais et serveurs de fichiers la voient,
  sauf si le compte passe par Tor (**Tor** sur l’écran **Discussions Nostr**) ou si **Via Tor** de la discussion est
  activé. Publier, aimer ou voter dans le fil Public, et ses photos et aperçus de liens sans Tor, la montrent aussi.
  Voir [Discussions avec d’autres applis Nostr](#nostr-chats).
- [+] **Messenger, Signal et Session** (Erevos+) : leurs propres serveurs la voient (ceux de Meta, de Signal, ou le
  premier nœud Session), pas tes contacts, sauf si le compte passe par Tor : choisis **Toujours par Tor** sous **Tor
  pour ce compte …** sur son écran, ou active **Par Tor** dans une discussion, ce qui fait passer tout le compte par
  Tor. La connexion, le captcha de Signal, les images de Messenger et **Ouvrir Facebook** passent de la même façon. Erevos prévient avant
  que tu envoies dans une discussion tant que le compte ne passe pas par Tor, et avant chaque appel. Voir [Messenger](#messenger), [Signal](#signal) et [Session](#session).

- **Les appels :** ils ne passent jamais par Tor. Le relais d’appel, le tien ou celui de ton contact, voit l’adresse,
  mais pas ce qui se dit. Un appel entre téléphones proches sur le même réseau reste sur ce réseau.

- **Un fichier sur un serveur que ton contact a choisi :** le serveur voit l’adresse quand ton téléphone récupère le
  fichier. Tor la cache.

- **Les liens web que tu ouvres :** le site la voit, comme toute page web. Pour la cacher, ouvre les liens dans Tor
  Browser. L’aperçu d’un lien est aussi récupéré sur son site, et le site voit l’adresse de la même façon.
  Avec **Par Tor** activé pour les aperçus des liens, il ne la voit pas.

- **Le relais d’un contact :** tant que ton espace n’a pas de relais à lui, ou seulement une place prêtée sur un, un
  contact peut te donner une place sur le sien, et elle arrive avec son message. Son relais voit alors l’adresse, donc
  Erevos demande avant de la prendre, sauf si l’espace envoie tout par Tor. Si elle n’est pas prise, l’invitation est
  abandonnée.

- **Les groupes :** un message dans un groupe Erevos passe par un serveur, qui voit l’adresse. Tor pour l’espace la
  cache ; un groupe n’a pas de réglage à lui.

- **Sauvegardes, {~serveur de la Collection, listes radio et TV, |}aperçus des liens et mises à jour :** chacun a son
  propre interrupteur **Par Tor**, dans son propre écran, désactivé tant que tu ne l’actives pas. Voir
  [Sauvegardes](#backup), {~[Collection](#collection), |}[Discuter par un relais](#relay) et [Mises à jour](#updates).

- [~] **Stations de radio et chaînes de télé :** chacune voit l’adresse pendant sa lecture. **Lire par Tor**, dans les
  réglages de la Collection sur Android, désactivé tant que tu ne l’actives pas, les lit uniquement par Tor. Voir
  [Collection](#collection).

Erevos prévient une fois avant chacun de ces cas, avec le titre **Ton adresse internet peut être vue**, un bouton
**Guide** qui ouvre cette section et, quand c’est possible, un bouton qui y remédie, comme **Par Tor pour cette
discussion**. **Continuer** poursuit ; pour une discussion, c’est dit une fois, et pas de nouveau pour cette
discussion.

Après le guide, la même question revient, et ce que tu envoyais, comme un message vocal ou un fichier, l’attend. Un
appel qui sonne ici le dit sous l’appel, et répondre continue. Les discussions masquées gardent ce qui a été dit avec
elles, à part de l’espace.

Les téléphones proches{~, LoRa et les SMS| et LoRa} n’utilisent pas internet, donc ils ne montrent aucune adresse internet.

## Matrix {#matrix}

Dans **Réglages** → **Relais et réseaux** → **Matrix**, un espace peut se connecter à un compte Matrix, pour discuter
avec des personnes qui utilisent Element ou une autre app Matrix. Erevos parle lui-même au serveur Matrix, comme
Element : aucun pont ne se met entre les deux.

- **Se connecter :** ton identifiant Matrix, comme @nom:matrix.org, et son mot de passe. Erevos devient un nouvel
  appareil du compte, nommé Erevos. La connexion et les clés de l’appareil sont gardées chiffrées dans cet espace, et
  sont dans les sauvegardes : après une restauration, l’espace se reconnecte, comme un nouvel appareil. Ses discussions
  masquées peuvent avoir un compte Matrix à elles, voir [Discussions masquées](#hidden).
- **Authentification unique :** sur Android, quand ton serveur Matrix fait se connecter les gens ailleurs (comme
  matrix.org le demande pour les nouveaux comptes), **Se connecter par authentification unique (SSO)** ouvre le
  navigateur sur cette page, et revient à Erevos une fois connecté là-bas ; un serveur avec plusieurs fournisseurs te
  laisse en choisir un. Le navigateur ne passe pas par Tor, donc cette page voit ton adresse. Comme il n’y a pas de
  mot de passe à donner, Erevos ne crée les clés de signature croisée du compte que si le serveur les prend sans
  redemander ; sinon vérifie cet appareil par emoji ou QR code depuis un autre des tiens, ou entre la clé de sécurité.
- **Discussions :** **Nouvelle discussion** lance une discussion chiffrée avec un identifiant Matrix. Les invitations
  s’affichent en premier, avec **Rejoindre** et **Refuser**. Écris un nom au lieu d’un identifiant Matrix pour chercher
  des gens dans l’annuaire d’utilisateurs de ton serveur Matrix, qui apprend qui tu as cherché ; **Démarrer** commence
  la discussion avec celui sur qui tu appuies.
- **Groupes :** **Nouveau groupe**, sur l’écran Matrix, crée un groupe chiffré à partir d’un nom et des ID Matrix que tu
  écris, chacun invité à le rejoindre, comme Element en crée un ; chacun y voit qui sont les autres. **Rejoindre un
  groupe** en rejoint un par son adresse, comme #name:matrix.org. Un groupe public peut ne pas être chiffré, et son
  écran le dit alors. Dans un groupe, **Inviter** invite quelqu’un d’autre, si le groupe te le permet.
  Taper **@** dans un groupe propose ses membres ; un message nomme ceux écrits en entier, et leurs applis les
  préviennent.
- **Membres :** dans un groupe, **Membres** liste ses gens et montre qui est **propriétaire**, **admin** ou
  **modérateur**, comme le disent leurs niveaux de pouvoir. Là où ton niveau le permet, tu renommes le groupe, fixes son
  **Sujet**, **Nommer admin** ou **Retirer comme admin**, **Retirer** quelqu’un (les messages du groupe ne lui
  parviennent plus) ou le **Bannir** (il ne peut pas rejoindre à nouveau tant qu’un admin ne le laisse pas).
- **Chiffrement :** les messages sont chiffrés de bout en bout avec le chiffrement propre à Matrix (Olm et Megolm, par
  vodozemac). Une discussion non chiffrée le dit.
- **Pas anonyme :** le serveur Matrix voit ton compte, qui parle avec qui et quand, et, sans Tor, d’où. Dans une
  discussion avec des personnes sur d’autres serveurs, ces serveurs le voient aussi.
- **Par Tor :** sur Android, l’écran Matrix, avant la connexion aussi, a le choix Tor qu’a chaque compte :
  **Désactivé** (par défaut) passe en direct, et le serveur Matrix voit ton adresse ; **Comme l’espace** suit
  **Réglages** → **Relais et réseaux** → **Tor** : avec **Messages**, par Tor dès qu’il est prêt et en direct pendant
  qu’il démarre, photos et fichiers en direct ; avec **Tout**, tout uniquement par Tor ; **Toujours par Tor** fait
  passer ce compte uniquement par Tor, la connexion aussi, et rien sans lui. Tor utilise les ponts de l’espace.
  **Par Tor** d’une discussion, sous ses boutons, fait passer tout le compte uniquement par Tor tant qu’il est activé :
  Matrix a une connexion pour toutes les discussions d’un compte. Les appels ne passent jamais par Tor.
- **Messages d’avant :** un message envoyé avant qu’Erevos se connecte, ou dont la clé n’est pas encore arrivée,
  s’affiche verrouillé.
- **Photos et fichiers :** **Photo** et **Fichier** les envoient, jusqu’à 50 Mo, chiffrés sur le téléphone avant
  d’aller au serveur Matrix, qui ne garde ainsi que ce qu’il ne peut pas lire. Une photo reçue n’est téléchargée que si
  vous touchez **Afficher la photo** ; **Enregistrer** garde n’importe quel fichier sur le téléphone.
  Touchez une photo affichée pour la voir sur tout l’écran, comme dans la discussion d’un contact : deux doigts ou un
  double appui zooment, elle tourne avec le téléphone, et **Enregistrer** la garde (voir Photos et fichiers, sous
  [Discuter par un relais](#relay)).
- **Stickers :** un sticker qu’envoient Element, FluffyChat ou Element X s’affiche dans la discussion ; **Afficher le
  sticker** le récupère par ton serveur Matrix. **Sticker** envoie tes propres stickers faits à partir de photos (**Les
  miens**) comme des images, chiffrées là où la discussion l’est. Les séries intégrées y sont aussi : chaque sticker
  part comme son image, faite sur ton appareil, avec ses mots pour les applis qui n’affichent que ceux-ci.
- **Réactions, réponses, modifications et suppression :** appuie longuement sur un message pour ouvrir son menu :
  choisis une réaction en haut, **Répondre** pour lui répondre, **Copier** pour ses mots, et sur un message de toi
  **Modifier** ou **Supprimer**. Une réponse montre le message auquel elle répond au-dessus de ses mots, et un appui
  dessus mène au message. Les réactions s’affichent sous un message ; appuie sur l’une pour réagir pareil, ou sur la
  tienne pour la retirer. Elles ne sont pas chiffrées, comme Element les envoie, même dans une discussion chiffrée : le
  serveur Matrix voit quel message a reçu quelle réaction, et de qui. Tu es le seul à pouvoir modifier tes propres
  messages, et un message modifié affiche **Modifié**. **Supprimer** retire un message de toi pour tout le monde dans la
  discussion, une fois que tu confirmes ; on ne peut pas l’annuler, et la discussion garde une ligne disant qu’il a été
  supprimé.
- **Plusieurs messages :** **Sélectionner**, dans le menu d’un message, le choisit, et un appui en ajoute d’autres ;
  puis **Copier**, **Transférer** ou **Supprimer**. **Supprimer** les retire pour tous dans la discussion, après
  confirmation : les tiens et, là où ton niveau le permet, ceux des autres. Cela ne peut pas être annulé.
- **Ce téléphone ou tout le monde :** **Supprimer**, pour un message ou plusieurs, demande d’abord : **Ce téléphone**
  les supprime ici seulement, et ils restent cachés s’ils reviennent ; **Pour tout le monde** les retire comme dit
  plus haut, proposé seulement quand chacun peut être retiré.
- **Écrit :** qui écrit en ce moment dans la discussion, comme le dit le serveur Matrix, s’affiche dessous avec
  **écrit…**. Erevos ne le dit de toi que si tu actives **Dire quand j’écris** sur l’écran Matrix ; c’est désactivé au
  départ, car cela passe par le serveur Matrix sans chiffrement, donc le serveur sait chaque fois que tu écris.
- **En ligne :** dans une discussion avec une personne, sous son nom s’affiche **En ligne**, **Absent** ou **Ne pas
  déranger**, avec les mots qu’elle a mis, ou quand elle était en ligne pour la dernière fois, comme le dit son
  serveur Matrix, et sa photo dans la liste des discussions a un point vert tant qu’elle est en ligne. Certains
  serveurs ne le disent pas. Erevos ne le dit de toi que si tu actives **Dire quand je suis en ligne** sur l’écran
  Matrix ; c’est désactivé au départ, car cela passe par le serveur Matrix sans chiffrement.
- **Marques :** tes messages montrent **✓** quand le serveur Matrix les a pris et **✓✓✓** quand tous les autres
  membres de la discussion les ont lus, comme l’appli Matrix de chacun le dit à son serveur (accusés de lecture).
  Matrix n’a pas de marque pour un message arrivé sur un téléphone, donc il n’y a pas de **✓✓**. Maintiens un de tes
  messages et choisis **Qui l’a lu** pour voir qui l’a lu et quand, et qui ne l’a pas lu (les 100 premiers). Une appli
  Matrix peut être réglée pour n’envoyer aucun accusé de lecture : son membre apparaît alors comme n’ayant pas lu.
- **Photos de profil :** un salon Matrix, ou la personne dans une discussion avec une personne, montre sa photo dans
  la liste des discussions, de même qu’un contact XMPP. **Choisir une photo**, sur l’écran Matrix, met la tienne pour
  tes contacts ; **Retirer** l’enlève. Les photos ne sont chiffrées dans aucune appli Matrix ou XMPP : le serveur les
  voit, et tes contacts voient la tienne.
- **Messages précédents :** une discussion qui a plus d’historique sur le serveur Matrix affiche **Charger les messages
  précédents** en haut ; chaque appui en rapporte d’autres, et la discussion reste là où tu lisais. Un message dont la
  clé n’est pas encore arrivée s’affiche verrouillé.
- **Messages vocaux :** maintiens le micro sous le champ du message pour enregistrer, et relâche pour envoyer ; glisse
  vers la gauche avant de relâcher pour abandonner l’enregistrement. Une minute au maximum, et un appui de moins d’une
  seconde n’envoie rien. Avec TalkBack, appuie une fois pour commencer et une autre pour envoyer. Dans une discussion
  chiffrée, il est chiffré comme une photo, et Element et les autres applis Matrix le lisent comme un message vocal. Un
  message vocal qui arrive se lit avec **Lire**, et n’est récupéré que quand tu le lis. Sa forme d’onde part avec lui,
  comme Element la dessine, et un message vocal qui arrive avec une forme d’onde la montre sous **Lire**, colorée
  pendant la lecture.
- **Vérifier par emoji :** dans une discussion avec une personne, **Vérifier par emoji** vous montre à tous les deux
  sept images ; si elles sont identiques, dans le même ordre, touchez **Ils correspondent** sur les deux téléphones.
  Personne ne peut alors être au milieu sans qu’on le voie, et la discussion indique **Vérifié par emoji**.
  **Vérifier cet appareil avec un autre des vôtres**, sur l’écran Matrix, fait de même avec votre propre Element, pour
  qu’il fasse confiance à l’appareil d’Erevos. Element peut aussi lancer l’une ou l’autre.
- **Vérifier par QR code :** une fois qu’une vérification est acceptée des deux côtés, et que les deux applis le
  peuvent, la carte montre un code et **Photographier leur code**. Laisse l’autre appli photographier le code montré
  ici (dans Element : **Scanner**), puis réponds **Oui, elle le dit** quand elle dit que la vérification a réussi ; ou
  photographie le code que leur appli montre. **Comparer des emoji à la place** passe par l’autre chemin. Le code
  contient les clés des deux comptes (ou appareils) et un secret à usage unique, donc un code de quelqu’un au milieu
  ne correspond pas. Rien n’est considéré comme sûr tant que les deux côtés n’ont pas dit terminé.
- **Clé de sécurité :** sous **Clé de sécurité**, sur l’écran Matrix, saisissez la clé (ou phrase) de sécurité créée
  par Element : les messages précédents s’ouvrent depuis la sauvegarde des clés du compte, les nouvelles clés y vont,
  et vos autres appareils font confiance à celui-ci. Un compte sans clé peut **Créer une clé de sécurité** ici ;
  notez-la, car Erevos ne la garde pas.
- **Appels :** les deux tuiles en haut de la discussion appellent en voix ou en vidéo, avec Element Call, l’app d’appel
  d’Element et d’Element X, qu’Erevos porte en lui et montre par-dessus l’app, dans une fenêtre à elle : sur Android,
  dans l’app web et sur un ordinateur (Windows, macOS et Linux). La flèche de retour qui s’y trouve, ou la touche Échap,
  rend la fenêtre petite, dans un coin par-dessus Erevos, pour que tu puisses continuer à utiliser Erevos pendant
  l’appel ; un appui sur la petite fenêtre la ramène à sa pleine taille. Tant que l’appel n’a pas commencé, un bouton
  **Fermer** en dessous y met fin, au cas où il ne commencerait jamais. Les appels pour toi sonnent ici comme ceux
  d’Erevos, tant que cet espace est ouvert : **Répondre** ouvre Element Call dans l’appel, **Refuser** le dit à la
  personne qui appelle. Le son et l’image sont chiffrés de bout en bout, avec des clés que seules les personnes dans
  l’appel ont, et passent par le serveur média (LiveKit) que ton serveur Matrix indique, qui voit l’adresse de cet
  appareil ; un serveur Matrix sans serveur média ne peut pas appeler. Ce qu’Element Call dit au serveur Matrix passe
  par Erevos, et par Tor comme le reste de Matrix, mais l’appel lui-même ne passe jamais par Tor. Element Call
  n’atteint aucun traceur. Les anciens appels Matrix à deux, comme les fait FluffyChat, sonnent aussi ici (voir **Ancien appel**). Tant qu’un
  appel Matrix est en cours ou sonne, un autre appel, d’Erevos ou sur XMPP, ne sonne pas et s’affiche comme manqué, et
  inversement. Sur Android, Retour ou quitter Erevos rend la fenêtre de l’appel petite, par-dessus d’autres apps
  (image dans l’image). Sailfish OS n’a pas d’appels Matrix.
- **Dans l’app web et sur un ordinateur :** le navigateur ou l’ordinateur demande une seule fois la caméra et le
  microphone ; sur un ordinateur, seule la fenêtre de l’appel peut utiliser la caméra. Où va le son, et quel microphone
  sert, c’est l’ordinateur ou le navigateur qui le décide. Dans l’app web, Element Call vient d’une seconde adresse à
  lui, erevos-call.lphl.nekten.eu, et sur un ordinateur d’une partie à part de l’app, si bien qu’il ne peut rien lire
  d’Erevos : ni ses clés, ni ses discussions. L’app web vérifie les fichiers d’Element Call avec la même version signée
  que l’app elle-même avant de le lancer ; le premier appel dans l’app web prend donc un moment de plus, le temps de
  récupérer et de vérifier Element Call.
  **Pourquoi :** le code d’Element Call n’est pas écrit par Erevos, alors il tourne à part d’Erevos, où il ne peut
  jamais approcher ses clés ni ses discussions.
- **Notifications :** un message qui arrive affiche une notification et compte dans le nombre sur l’icône d’Erevos,
  comme dans les discussions d’Erevos lui-même, tant que cet espace est ouvert ; sur un ordinateur, tant qu’Erevos
  tourne. Sur Android, **Notifications**, en bas d’une discussion, la met en sourdine ou lui donne un son à elle ; une
  discussion en sourdine ne compte pas. **Apparence de la discussion**, à côté, donne à la discussion un aspect à elle.
- **Tant que cet espace est fermé :** sur Android, **Signaler les nouveaux messages**, sous **Tant que cet espace est
  fermé** sur l’écran Matrix, laisse cet espace dire « New message » quand quelque chose arrive sur Matrix pendant
  qu’un autre espace est ouvert, comme le font ses propres discussions avec **Aussi quand un autre espace est ouvert**
  dans **Réglages** → **Notifications** → **En arrière-plan**, qu’il faut aussi. Il ne dit jamais quoi, de qui ni dans
  quelle discussion, et un appel ne sonne pas alors : seule la clé de l’espace ouvre ce qui est arrivé. Pour cela, le
  serveur Matrix signale chaque message au relais de cet espace, sans aucun de ses mots : le serveur Matrix apprend
  l’adresse du relais, et le relais quand des messages arrivent. Désactivé tant que vous ne l’activez pas ; il faut un
  relais mis à jour pour cela, que le serveur Matrix puisse joindre.
- **Fils :** maintiens un message et choisis **Répondre dans le fil** pour répondre dans un fil. Un fil s’ouvre sur un
  écran à part, et un message qui a des réponses dit combien ; touche-le pour ouvrir le fil. Les applis sans fils
  montrent les réponses comme de simples réponses.
- **Sondages :** **Sondage**, sous le champ de message, pose une question avec plusieurs options. Touche une option
  dans la bulle pour la choisir, et touche encore pour la reprendre ; tout le monde voit qui a choisi quoi. Celui qui
  a fait un sondage peut le maintenir et choisir **Terminer le sondage** : plus aucun vote ne compte ensuite.
- **Positions :** **Position** envoie où tu es, une fois, comme le fait Element ; elle part chiffrée comme le chat, et
  s’affiche avec **Ouvrir la carte** sur Android.
- **Aperçus des liens :** avec les **Aperçus des liens** activés, comme pour les chats avec tes contacts, le premier
  lien d’un message part avec un aperçu fait par ton téléphone, chiffré aussi dans un chat chiffré. Par Tor seulement avec **Par Tor** activé dans les **Aperçus des liens**, et jamais dans un lieu caché.
- **Épingler et transférer :** **Épingler**, dans le menu d’un message, l’épingle en haut du salon pour tout le monde,
  si le salon te le permet ; une barre au-dessus du chat montre le dernier message épinglé, et un toucher y va puis
  montre le suivant. **Désépingler** l’enlève. **Transférer** envoie une copie à un autre chat de ce compte ; la copie
  ne partage rien avec l’original. Un chat non chiffré le dit à côté de son nom, car son serveur lit une copie envoyée
  là.
- **Trouver des groupes :** **Trouver un groupe**, sur l’écran Matrix, cherche parmi les salons publics de ton serveur
  Matrix, ou d’un autre que tu écris, qui apprend alors ce que tu cherches. **Espaces** liste les salons des espaces
  où tu es, pour les rejoindre. **Chercher des messages** cherche seulement dans les messages gardés sur ce téléphone,
  et ne demande à personne.
- **Favoris :** maintiens un chat dans la liste pour **Mettre en favori** (il passe en premier), **Basse priorité**
  (il passe en dernier) et **Quitter et oublier**, qui fait aussi oublier le chat au serveur Matrix, de sorte que tes
  autres applis Matrix ne le montrent plus. Ils sont gardés dans ton compte, donc tes autres applis Matrix trient
  pareil.
- **Un nouveau compte :** sur l’écran de connexion, **Créer un nouveau compte** en crée un sur un serveur Matrix qui
  le permet, à partir d’un serveur, d’un nom et d’un mot de passe. Si le serveur le demande, Erevos te demande
  d’accepter ses conditions, de donner un jeton d’inscription ou de faire une étape sur la page propre du serveur,
  comme un captcha, qui s’ouvre dans le navigateur, pas par Tor. Un serveur qui demande une adresse e-mail ne crée de
  comptes que sur son site ; crées-en un là-bas, puis connecte-toi ici.
- **Appareils :** **Appareils**, sur l’écran Matrix, liste les appareils du compte avec la dernière fois que chacun a
  été vu. **Renommer** donne un nouveau nom à l’un. **Déconnecter les autres appareils** les retire du compte : ils
  perdent leurs clés et ne peuvent plus lire ce qui arrive. Le serveur Matrix demande d’abord ton mot de passe.
- **Anciens appels :** dans un chat avec une personne, les tuiles d’appel demandent **Element Call** ou **Ancien
  appel**. L’ancien appel fonctionne avec FluffyChat, Nheko et Element sur ordinateur, et sonne ici quand ils
  appellent. Ses signaux passent comme le chat, chiffrés dans un chat chiffré, par ton relais quand l’espace en a un,
  sinon par le relais d’appels de ton serveur Matrix ; l’appel lui-même est chiffré (DTLS-SRTP).

**Pourquoi :** les discussions propres à Erevos cachent qui parle avec qui ; un serveur Matrix ne le peut pas. Les
discussions Matrix restent donc à part et marquées, pour les personnes que tu ne joindrais autrement que sur Matrix.

- **Ce qu’un message porte :** les marques de l’aspect des mots, comme le gras et les mots cachés, s’affichent comme
  dans une discussion Erevos (voir [Discuter par un relais](#relay)) et partent avec le message, donc Element les
  montre aussi. De ce qu’envoie une autre app, seuls le gras, l’italique, le barré, le code et les mots cachés
  s’affichent : rien dedans ne s’exécute, aucune image n’est récupérée, et un lien montre où il mène vraiment. Les
  adresses web peuvent être touchées, et Erevos demande avant d’en ouvrir une. À côté de **Photo** et **Fichier** se
  trouvent **Appareil photo**, **Vidéo**, **Carte de contact** et **Qualité de la photo** : une carte de contact part
  comme un fichier .vcf que toute app ouvre, et une qui arrive s’affiche comme une carte dès que tu touches
  **Afficher**, avec **Ajouter aux contacts** ; une vidéo part sans les parties qui disent où elle a été filmée ou
  avec quel téléphone. Un message que tu transfères est marqué **Transféré** sur ton téléphone seulement, donc les
  autres n’apprennent jamais d’où il vient.
- **Épinglés, en dernier et nommés :** épingler un salon en fait ton favori sur Matrix, donc tes autres apps Matrix le
  montrent épinglé aussi, et les salons de faible priorité viennent en dernier. Dans la liste de l’écran d’accueil,
  ton dernier message montre ✓✓✓ dès que tout le monde dans le salon l’a lu. **Lui donner un nom ici** (une personne)
  ou **Donner un nom ici** (un groupe), au pied de la discussion, donne à un salon un nom à toi, sur ce téléphone
  seulement ; personne n’est prévenu.
- **Brouillons :** ce que tu tapes et n’envoies pas reste comme brouillon de la discussion, chiffré sur ce téléphone
  seulement. Il revient quand tu rouvres la discussion, même après la fermeture d’Erevos, et la liste de l’écran
  d’accueil le montre sur la ligne de la discussion comme **Brouillon**. Un fil Matrix ne garde pas de brouillon à
  lui.
- **Envoyer plus tard :** garde le doigt sur **Envoyer**, choisis une heure (**Dans 1 heure**, **Ce soir 20:00**,
  **Demain 09:00**, ou n’importe quel jour et heure) et touche **Envoyer plus tard**. Le message attend sur ce
  téléphone, chiffré, en pointillés après les messages de la discussion avec son heure, et part de ce téléphone à
  cette heure tant qu’Erevos est déverrouillé, sur Android en arrière-plan aussi ; sinon dès qu’il est de nouveau
  déverrouillé. Texte seulement. Touche-le pour l’envoyer tout de suite ou le supprimer. Dans les discussions
  masquées, il part seulement tant qu’elles sont ouvertes, sauf si elles reçoivent aussi fermées. Un message qu’une
  sauvegarde restaurée a ramené, dont l’heure était passée avant la restauration, ne part pas tout seul : le téléphone
  d’où vient la sauvegarde l’a peut-être déjà envoyé.
- **Renvoyer :** un message à toi qui affiche **Non envoyé** a **Renvoyer** et **Supprimer** dans son menu.
- **Me rappeler :** le menu d’un message a **Me rappeler**. Choisis une heure : le message, avec le nom de sa
  discussion, va dans **Discussion avec moi-même** et te le rappelle alors. Il faut **Erevos** activé dans
  [Modules](#modules).
- **Messages éphémères :** **Messages éphémères**, sous le champ de message, fixe un délai pour les nouveaux messages,
  envoyés ou reçus : 5 minutes, 1 heure, 1 jour ou 1 semaine après l’envoi de chacun. Alors ils partent de ce
  téléphone, et les tiens sont aussi retirés pour tout le monde dans la discussion (leurs applis les montrent
  supprimés), ou dès qu’Erevos tourne de nouveau. Ce que les autres ont envoyé reste chez eux. **Éphémère**, à côté de
  **Sondage** et **Position**, le fait pour le prochain message seulement. Les messages déjà dans la discussion
  restent.
- **Bloquer :** **Bloquer**, dans une discussion avec une personne, l’ajoute à la liste d’ignorés de ton compte : rien
  d’elle n’atteint ton compte Matrix, dans aucune de ses applis, et elle n’est pas prévenue. **Contacts bloqués**, sur
  l’écran Matrix, les liste, avec **Débloquer**.

## XMPP {#xmpp}

Dans **Réglages** → **Relais et réseaux** → **XMPP**, un espace peut se connecter à un compte XMPP, pour discuter avec
des personnes qui utilisent Conversations, Monal, Gajim, Dino ou une autre app XMPP. Erevos parle lui-même au serveur
XMPP, comme ces apps : aucun pont ne se met entre les deux.

- **Se connecter :** ton adresse XMPP, comme name@example.org, et son mot de passe. Erevos trouve le serveur à partir
  de l’adresse ; **Serveur** ne sert que s’il ne le trouve pas (un nom, nom:port ou une adresse wss://). Erevos devient
  un nouvel appareil du compte. La connexion et les clés de l’appareil sont gardées chiffrées dans cet espace, et sont
  dans les sauvegardes : après une restauration, le compte continue comme un nouvel appareil. Ses discussions masquées
  peuvent avoir un compte XMPP à elles, voir [Discussions masquées](#hidden).
- **Discussions :** **Nouvelle discussion** ajoute l’adresse à tes contacts, demande à la personne de te laisser voir
  quand elle est en ligne, comme le font les autres apps XMPP, et ouvre la discussion. Qui demande à t’ajouter s’affiche
  en haut de la liste et sur l’écran XMPP, avec **Accepter** et **Refuser**. Les contacts que le compte a déjà sont sous
  **Contacts**.
- **Chiffrement :** les messages sont chiffrés avec OMEMO, pour chacun de ses appareils et pour les autres appareils de
  ton compte, qui lisent en même temps : avec OMEMO 2 pour un appareil dont l’app l’a, comme Kaidan, et avec la version
  0.3, que parlent Conversations, Monal, Gajim et Dino, pour les autres. C’est le code propre d’Erevos, non audité,
  vérifié contre d’autres bibliothèques OMEMO. Si ses apps n’ont pas OMEMO, Erevos le dit et n’écrit que si tu choisis
  **Écrire sans chiffrement** pour cette discussion ; **Chiffrer de nouveau** revient en arrière.
- **Ses clés :** en bas de la discussion sont les empreintes de ses appareils. Compare-les avec ce que montre son app,
  par un autre moyen que la discussion. Une clé qui a changé depuis qu’elle a été vue pour la première fois le dit. La
  clé de cet appareil est sur l’écran XMPP, deux fois : comme les apps avec OMEMO 0.3 la montrent, et comme Kaidan la
  montre. Un appareil a une seule clé dans les deux, écrite de deux façons.
- **Marques :** un trait à l’envoi, deux quand son app l’a, trois quand il est lu, comme dans les discussions propres
  d’Erevos, pour les apps qui envoient ces marques.
- **Répondre, modifier, réagir, supprimer :** un appui long sur un message ouvre son menu : **Répondre** y répond,
  **Modifier** change les mots d’un des tiens, **Supprimer** retire un des tiens pour tout le monde dans la
  discussion, et les emoji y réagissent ; toucher une réaction sous un message réagit de même, ou retire la tienne.
  Cela marche avec les apps qui font pareil, comme Conversations, Dino, Gajim, Monal et Kaidan ; les autres apps
  montrent une réponse avec une citation de ce qu’elle répond, et une modification comme un nouveau message. Les mots
  d’une réponse et d’une modification sont chiffrés comme la discussion, mais le message que concerne une réponse, une
  modification, une réaction ou une suppression, et l’emoji d’une réaction, partent comme ces apps les envoient, non
  chiffrés, si bien que les serveurs XMPP les voient. Dans un groupe, un message peut être répondu, recevoir une
  réaction ou être supprimé une fois que le groupe l’a renvoyé. Appuyer sur la citation d’une réponse va au message
  auquel elle répond. **Transférer** envoie un ou plusieurs messages dans une autre discussion XMPP. **Épingler pour
  moi** garde un message en haut de la discussion, sur ce téléphone seulement. **Sélectionner** choisit plusieurs
  messages à copier, transférer ou supprimer ; **Supprimer** n’y retire que les tiens.
- **Ce téléphone ou tout le monde :** **Supprimer**, pour un message ou plusieurs, demande d’abord : **Ce téléphone**
  les supprime ici seulement, et ils restent cachés s’ils reviennent ; **Pour tout le monde** les retire comme dit
  plus haut, proposé seulement quand chacun peut être retiré.
- **Écriture :** quand l’app de l’autre personne dit qu’elle écrit, **écrit…** s’affiche sous la discussion. Erevos ne
  le dit de toi que si tu actives **Dire quand j’écris** sur l’écran XMPP, et seulement à un contact qui voit ta
  présence, jamais dans un groupe ; c’est désactivé au départ, car cela passe par le serveur XMPP sans chiffrement,
  donc le serveur sait chaque fois que tu écris.
- **En ligne :** sous le nom d’un contact s’affiche **En ligne**, **Absent** ou **Ne pas déranger**, avec les mots
  qu’il a mis, ou quand il était en ligne pour la dernière fois, comme le disent ses apps, et sa photo dans la liste
  des discussions a un point vert tant qu’il est en ligne ; seulement pour un contact qui te laisse voir sa présence.
  Comme dans toute app XMPP, les contacts qui voient ta présence voient quand Erevos est connecté ; cela passe par les
  serveurs XMPP sans chiffrement.
- **Photos de profil :** un salon Matrix, ou la personne dans une discussion avec une personne, montre sa photo dans
  la liste des discussions, de même qu’un contact XMPP. **Choisir une photo**, sur l’écran XMPP, met la tienne pour
  tes contacts ; **Retirer** l’enlève. Les photos ne sont chiffrées dans aucune appli Matrix ou XMPP : le serveur les
  voit, et tes contacts voient la tienne.
- **Bloquer :** **Bloquer**, en bas d’une discussion, empêche les messages, appels et demandes de cette personne
  d’atteindre ton compte XMPP, dans toutes ses applis, comme le fait le serveur XMPP (XEP-0191) ; elle n’est pas
  prévenue. **Débloquer** la laisse passer à nouveau. Quelqu’un bloqué dans une autre appli du compte l’est ici aussi.
- **Messages d’avant :** ce qui est arrivé pendant qu’Erevos était fermé est récupéré dans l’archive du serveur à la
  connexion, si le serveur en tient une. Un message envoyé avant la connexion de cet appareil, ou qui ne lui était pas
  destiné, s’affiche verrouillé.
- **Photos et fichiers :** **Photo** et **Fichier**, sous la zone du message, envoient un fichier jusqu’à 50 Mo, ou
  moins si ton serveur XMPP accepte moins, par l’envoi de fichiers du serveur. Dans une discussion chiffrée, il est
  d’abord chiffré sur ce téléphone, avec une clé faite pour lui seul, et la clé part dans le message, chiffrée avec
  OMEMO : le serveur ne garde ainsi que ce qu’il ne peut pas lire ; Conversations, Monal, Gajim et Dino l’ouvrent. Dans
  une discussion écrite sans chiffrement, le fichier part tel quel. Une photo, un son ou un fichier qui arrive n’est
  téléchargé que si tu touches **Afficher la photo**, **Lire** ou **Enregistrer**. Sur Android, les fichiers passent
  par Tor comme la discussion.
  Touche une photo affichée pour la voir sur tout l’écran, comme dans la discussion d’un contact : deux doigts ou un
  double appui zooment, elle tourne avec le téléphone, et **Enregistrer** la garde (voir Photos et fichiers, sous
  [Discuter par un relais](#relay)).
- **Stickers :** **Sticker** envoie tes propres stickers faits à partir de photos (**Les miens**) comme des photos,
  chiffrées comme la discussion ; les autres applis XMPP les affichent comme des photos. Les séries intégrées y sont
  aussi : chaque sticker part comme son image, faite sur ton appareil. Un lot de stickers qu’envoie une autre appli
  (XEP-0449) n’est pas récupéré : il affiche ses mots.
- **Messages vocaux :** appuie longuement sur le micro sous la zone de message pour enregistrer, et relâche pour
  envoyer, comme dans une discussion Matrix. Il part comme fichier son, chiffré comme la discussion, comme Conversations
  l’envoie. Un message vocal de Conversations ou d’une autre appli XMPP (un fichier .m4a ou .ogg) s’affiche aussi comme
  message vocal, avec **Lire** et sa durée.
- **Groupes :** un **groupe privé** est réservé à ses membres, et chacun voit qui sont les autres. Chaque message y est
  chiffré avec OMEMO pour les appareils de chaque membre, comme dans les groupes privés de Conversations, si bien que les
  serveurs XMPP ne peuvent pas le lire ; ce qui a été écrit avant ton arrivée s’affiche verrouillé. Un **canal** est tout
  autre groupe : il n’est pas chiffré, donc tous ceux qui y sont, et les serveurs, peuvent le lire, et son écran le dit.
  Sur l’écran XMPP, **Nouveau groupe** crée un groupe privé sur ton serveur XMPP à partir d’un nom et des contacts que tu
  choisis, et **Rejoindre un groupe** en rejoint un par son adresse, comme nom@conference.example.org, avec son mot de
  passe s’il en demande un. Sous un groupe privé, **Membres** liste ses personnes avec leurs clés, à comparer comme dans
  une discussion, et signale celles qui n’ont aucune clé OMEMO et ne peuvent pas lire ce qui est chiffré ; son
  administrateur peut **Ajouter des personnes**. Un contact qui t’invite dans un groupe s’affiche sous **Invitations à
  des groupes**, avec **Rejoindre** et **Refuser** ; l’invitation de toute autre personne n’est pas montrée. Tes groupes
  suivent les autres apps XMPP de ton compte par ses marque-pages : un groupe rejoint là-bas l’est ici aussi, et
  **Quitter le groupe** le quitte là-bas aussi. Un canal ne signale que les messages qui te nomment. Dans un groupe,
  **propriétaire** et **admin** s’affichent à côté des membres qui le sont, et la **Description** du groupe s’affiche
  sous son sujet.
- **Gérer un groupe :** les admins d’un groupe voient **Gérer le groupe** sur son écran. Ils mettent le **Sujet** ; le
  propriétaire peut aussi le **renommer**. Dans un groupe privé, chaque membre a **Retirer** (les messages du groupe
  ne lui arrivent plus, et un admin peut le rajouter) et **Bannir** (il ne peut plus revenir tant qu’un admin ne
  l’autorise pas) ; le propriétaire peut **Nommer admin** un membre ou le **Retirer comme admin**. Dans un canal,
  **Gérer le groupe** liste qui s’y trouve, chacun avec **Retirer**. Les admins ne peuvent pas retirer d’autres admins
  ; seul le propriétaire le peut. Le propriétaire fixe aussi la **Description** du groupe ; certains serveurs n’en
  autorisent pas, et Erevos le dit.
- **Appels :** les deux tuiles en haut de la discussion appellent la personne, en voix ou en vidéo, sur le même écran
  d’appel que les appels propres d’Erevos, et ses appels sonnent ici de la même façon, tant que cet espace est ouvert ;
  un appel de quelqu’un qui n’est pas dans tes contacts s’affiche seulement comme manqué. Cela marche avec les apps qui
  appellent comme Conversations (Jingle, avec la sonnerie de XEP-0353). L’appel lui-même est chiffré (DTLS-SRTP), mais
  l’empreinte de sa clé passe par les serveurs XMPP telle quelle, sans chiffrement de bout en bout, donc ces serveurs
  pourraient se mettre entre les deux. Il passe par le relais d’appel de cet espace s’il y en a un, sinon par le serveur
  TURN du serveur XMPP, et seulement par lui, donc l’autre personne n’apprend pas ton adresse ; sans aucun des deux, il
  passe directement, et elle l’apprend. Un appel ne passe jamais par Tor : le relais d’appel ou le serveur TURN voit
  l’adresse de ce téléphone.
  Dans un appel vocal, chacun de vous peut activer la vidéo : **Ajouter la vidéo**, sur l’écran de l’appel, allume ta
  caméra et demande d’abord à l’autre personne, qui choisit **Pas maintenant** ou **Activer la vidéo**. La vidéo ne
  démarre que si elle dit oui, et un non laisse l’appel comme il était. Cela marche avec les applis qui ajoutent la
  vidéo à un appel comme Conversations.
- **Appels de groupe :** dans un groupe privé où tu es, les deux tuiles en haut lancent un appel vocal ou un appel vidéo
  dans le groupe, et un appel lancé dans l’un de tes groupes sonne ici, tant que cet espace est ouvert. Tant qu’un appel
  est en cours dans un groupe, une tuile en haut et une ligne sous son nom le disent, et toucher l’une ou l’autre
  rejoint l’appel, jusqu’à ce que sa dernière personne parte. Cela marche avec Dino, qui appelle dans les groupes de la
  même façon (MUJI) : chaque appel a un salon à lui sur le service de groupes, que seuls les membres du groupe peuvent
  rejoindre, et chaque téléphone de l’appel se connecte directement à chacun des autres, comme dans les appels de groupe
  propres d’Erevos, par le relais d’appel de cet espace ou par le serveur TURN du serveur XMPP, huit personnes au plus.
  Comme dans un appel avec une personne, l’appel est chiffré (DTLS-SRTP), mais les empreintes de ses clés, et les
  invitations, passent par les serveurs XMPP telles quelles, et le service de groupes voit qui est dans l’appel et
  quand. Le compte XMPP propre aux discussions masquées appelle dans ses groupes de la même façon, tant que les
  discussions masquées sont ouvertes ; fermées, avec **Recevoir une fois fermées** activé, un appel qui arrive dans l’un
  de ses groupes s’affiche comme manqué.
- **Pas anonyme :** le serveur XMPP voit ton compte, tes contacts, qui parle avec qui et quand, et, sans Tor, d’où. Le
  serveur de l’autre personne voit la même chose de ses discussions avec toi.
- **Par Tor :** sur Android, l’écran XMPP, et celui d’avant la connexion, choisit le Tor du compte : **Désactivé** (par
  défaut : en direct, et le serveur voit ton adresse), **Comme l’espace** (comme le dit le choix de cet espace sous
  **Réglages** → **Relais et réseaux** → **Tor** : avec **Messages** par Tor dès que Tor est prêt, les fichiers en
  direct ; avec **Tout** seulement par Tor, fichiers compris ; avec **Rien** en direct) ou **Toujours par Tor**
  (seulement par Tor, quoi que fasse l’espace, à la connexion aussi, et rien ne part tant que Tor ne peut pas se
  connecter). Sa connexion, la recherche de son serveur et ses fichiers suivent ce choix ; Tor utilise les ponts de
  l’espace. Les appels ne passent jamais par Tor, et aucun aperçu de lien n’est fait tant que le compte ne doit pas
  passer en direct. Là où Erevos ne peut pas ouvrir de connexion à lui (l’app web, un ordinateur), il utilise le
  WebSocket du serveur, en direct, et un serveur qui n’en a pas ne peut être atteint.
- **Une discussion par Tor :** **Par Tor** sous une discussion ou un groupe, désactivé tant que tu ne l’actives pas,
  l’envoie seulement par Tor. Une seule connexion au serveur porte toutes les discussions du compte, donc tant qu’une
  discussion l’a activé, tout le compte passe seulement par Tor, quel que soit son choix, et l’écran XMPP le dit.
- **Notifications :** un message qui arrive affiche une notification et compte dans le nombre sur l’icône d’Erevos,
  comme dans les discussions d’Erevos lui-même, tant que cet espace est ouvert ; sur un ordinateur, tant qu’Erevos
  tourne. Sur Android, **Notifications**, en bas d’une discussion, la met en sourdine ou lui donne un son à elle ; une
  discussion en sourdine ne compte pas. **Apparence de la discussion**, à côté, donne à la discussion un aspect à elle.
- **Tant que cet espace est fermé :** sur Android, **Signaler les nouveaux messages**, sous **Tant que cet espace est
  fermé** sur l’écran XMPP, laisse cet espace dire « New message » quand quelque chose arrive sur XMPP pendant qu’un
  autre espace est ouvert, comme le font ses propres discussions avec **Aussi quand un autre espace est ouvert** dans
  **Réglages** → **Notifications** → **En arrière-plan**, qu’il faut aussi. Il ne dit jamais quoi, de qui ni dans quelle
  discussion, et un appel ne sonne pas alors : seule la clé de l’espace ouvre ce qui est arrivé. Pour cela, le serveur
  XMPP signale chaque message au relais de cet espace tant qu’aucune appli du compte n’est active : le serveur XMPP
  apprend le nom du relais, et le relais quand des messages arrivent. Désactivé tant que vous ne l’activez pas ; il faut
  un relais mis à jour pour cela, que les serveurs XMPP puissent joindre (son propriétaire ouvre un port pour eux), et un
  serveur XMPP qui envoie des notifications aux applis inactives, comme la plupart.
- **Un nouveau compte :** sur l’écran de connexion, **Créer un nouveau compte** en crée un sur un serveur XMPP qui le
  permet (XEP-0077), à partir d’une adresse et d’un mot de passe. Un serveur qui demande un captcha, ou ne crée de
  comptes que sur son site, le dit et donne sa page s’il en a une ; crée le compte là-bas, puis connecte-toi ici.
- **Mot de passe et suppression :** **Compte**, sur l’écran XMPP, a **Changer le mot de passe** et **Supprimer le
  compte**, qui supprime le compte du serveur pour de bon, après deux questions, la seconde demandant l’adresse.
  Erevos oublie ses clés ; l’adresse ne pourra peut-être pas être recréée.
- **Trouver des groupes :** **Trouver un groupe** a **Groupes sur ton serveur**, ceux que le serveur laisse trouver à
  tous, et **Chercher des groupes publics**, qui interroge search.jabber.network : il apprend les mots que tu cherches
  et voit le nom de ton serveur, et ton serveur non. Un groupe public est un canal, non chiffré.
- **Positions :** **Position** envoie où tu es comme un lien geo:, comme le fait Conversations, chiffré comme le chat
  ; une position qui arrive ainsi s’affiche comme position, avec **Ouvrir la carte** sur Android.
- **Aperçus des liens :** dans un chat écrit sans chiffrement, avec les **Aperçus des liens** activés, le premier lien
  part avec son aperçu (XEP-0511), et un aperçu qui arrive ainsi s’affiche sous les mots. Un chat chiffré n’en envoie
  aucun, car il dirait aux serveurs ce qu’est le lien.

**Pourquoi :** les discussions propres à Erevos cachent qui parle avec qui ; un serveur XMPP ne le peut pas. Les
discussions XMPP restent donc à part et marquées, pour les personnes que tu ne joindrais autrement que sur XMPP.

- **Ce qu’un message porte :** les marques de l’aspect des mots et des adresses web à toucher, comme dans une
  discussion Matrix, avec **Appareil photo**, **Vidéo**, **Carte de contact** et **Qualité de la photo** (voir
  [Matrix](#matrix)). Dans un groupe, taper @ propose ses membres, et un appui écrit le nom de celui-ci dans le
  groupe, comme le fait Conversations.
- **Un nom à toi :** **Lui donner un nom ici**, au pied de la discussion d’un contact, garde un nom à toi pour lui
  dans tes contacts sur ton serveur XMPP, donc tes autres apps XMPP le montrent aussi. Il n’est pas prévenu. Laisse-le
  vide pour montrer de nouveau son adresse.
- **Brouillons :** ce que tu tapes et n’envoies pas reste comme brouillon de la discussion, chiffré sur ce téléphone
  seulement. Il revient quand tu rouvres la discussion, même après la fermeture d’Erevos, et la liste de l’écran
  d’accueil le montre sur la ligne de la discussion comme **Brouillon**.
- **Envoyer plus tard :** garde le doigt sur **Envoyer**, choisis une heure (**Dans 1 heure**, **Ce soir 20:00**,
  **Demain 09:00**, ou n’importe quel jour et heure) et touche **Envoyer plus tard**. Le message attend sur ce
  téléphone, chiffré, en pointillés après les messages de la discussion avec son heure, et part de ce téléphone à
  cette heure tant qu’Erevos est déverrouillé, sur Android en arrière-plan aussi ; sinon dès qu’il est de nouveau
  déverrouillé. Texte seulement. Touche-le pour l’envoyer tout de suite ou le supprimer. Dans les discussions
  masquées, il part seulement tant qu’elles sont ouvertes, sauf si elles reçoivent aussi fermées. Un message qu’une
  sauvegarde restaurée a ramené, dont l’heure était passée avant la restauration, ne part pas tout seul : le téléphone
  d’où vient la sauvegarde l’a peut-être déjà envoyé.
- **Renvoyer :** un message à toi qui affiche **Non envoyé** a **Renvoyer** et **Supprimer** dans son menu.
- **Me rappeler :** le menu d’un message a **Me rappeler**. Choisis une heure : le message, avec le nom de sa
  discussion, va dans **Discussion avec moi-même** et te le rappelle alors. Il faut **Erevos** activé dans
  [Modules](#modules).
- **Messages éphémères :** **Messages éphémères**, sous le champ de message, supprime de ce téléphone les nouveaux
  messages ce délai après leur envoi, et **Éphémère** le fait pour le prochain message seulement. L’autre côté les
  garde : XMPP n’a aucun moyen de les supprimer là-bas. Les messages déjà ici restent.
- **Apparaître hors ligne :** en bas d’une discussion avec une personne, **Apparaître hors ligne** te montre hors
  ligne pour elle, quoi que ton compte montre aux autres, et ne lui dit rien de ce que tu lis ou tapes, ni que ses
  messages sont arrivés. Un groupe que vous partagez te montre toujours. Cela vaut pour la connexion de ce téléphone
  seulement.
- **Vérifier en personne :** sous **Leurs clés**, **Vérifier en personne** montre un code de ton adresse et de tes
  clés, comme le fait Conversations. Photographie le leur là : chacun de leurs appareils dont la clé correspond est
  marqué vérifié. Une clé qui diffère ne marque rien et le dit : quelqu’un est peut-être entre vous, ou ils ont changé
  d’appli. Rien n’est envoyé.
- **Contacts bloqués :** l’écran XMPP liste qui le compte bloque, avec **Débloquer**.

## Discussions avec d’autres applis Nostr {#nostr-chats}

Dans **Réglages** → **Relais et réseaux** → **Discussions Nostr**, un espace peut avoir sa propre clé Nostr, pour
discuter en tête-à-tête ou en groupe avec des personnes qui utilisent Damus, Amethyst, Primal, 0xchat ou une autre appli
Nostr qui envoie les messages privés comme le demande NIP-17. Ce n’est pas [Par Nostr](#nostr), qui porte les
discussions propres à Erevos.

- **La clé :** **Créer une clé Nostr** en crée une pour cet espace ; **Ou apporter une clé d’une autre appli Nostr**
  prend le nsec d’une clé que tu as déjà, et lit ce que ses relais gardent encore. La clé et ses discussions sont
  gardées chiffrées dans cet espace, et sont dans les sauvegardes : après une restauration, elles reviennent telles
  qu’elles étaient. Ses discussions masquées peuvent avoir une clé Nostr à elles, voir [Discussions masquées](#hidden).
  **Afficher la clé secrète (nsec)** l’affiche, pour la noter ou l’emporter dans une autre appli : qui l’a lit ces
  discussions et écrit en ton nom.
- **Ta clé Nostr :** donne son npub aux personnes qui doivent t’écrire, avec **Copier** ou **Afficher le code QR**.
  **Ton nom**, si tu en donnes un, est public : les autres applis Nostr l’affichent à la place de ton npub. Seul le nom y change :
  une photo ou des mots qu’une autre appli de ta clé a mis dans ton profil restent.
- **Discussions :** **Nouvelle discussion** prend son npub (ou nprofile), depuis son profil dans son appli, ou un nom
  comme nom@example.org (NIP-05). **Afficher les personnes que tu suis**, juste dessous, liste les personnes que suit
  ta clé Nostr (sa liste publique de personnes suivies, cherchée aussi sur des relais qui rassemblent de telles listes
  et sur les relais où écrit ta clé), avec leurs noms : touches-en une pour lui écrire. Quand il ne trouve personne, il
  dit pourquoi, de qui il a cherché la liste et comment chaque relais a répondu. Rien n’est chargé avant que tu appuies
  dessus, et aucune photo de profil. Les discussions sont aussi dans la liste de l’accueil, chacune marquée **Nostr** ;
  le bouton **Nostr** n’affiche qu’elles, et là **Nouvelle discussion** ouvre cet écran.
  **Lui donner un nom ici** donne à une discussion un nom que toi seul vois.
- **Groupes :** **Nouveau groupe** en crée un avec deux personnes ou plus parmi celles avec qui tu discutes, vingt au
  plus, avec un nom si tu veux. Les groupes Nostr n’ont pas d’administrateurs : un groupe, ce sont les personnes que
  nomment ses messages, chaque message va à chacune, chiffré pour chacune, et personne ne peut y être ajouté ou retiré
  ensuite ; un groupe avec d’autres personnes est un nouveau groupe. **Nommer ce groupe** le renomme pour tous, avec ton
  prochain message. Un message qu’une autre appli t’envoie, à toi et à d’autres, s’affiche aussi comme un groupe, chaque
  message avec qui l’a écrit.
- **Photos et fichiers :** **Photo** et **Fichier**, sous le champ du message d’une discussion, en envoient un de 20 Mo
  au plus. Il est chiffré sur ce téléphone avec une clé faite pour lui seul (AES-GCM, comme le demande NIP-17) et déposé
  sur un serveur de fichiers Blossom, qui ne garde que ce qu’il ne peut pas lire ; sa clé va dans le message, chiffrée
  comme les messages, et l’envoi est signé par une clé faite pour lui seul, si bien que le serveur n’apprend pas à qui
  il est. Sur Android, les fichiers passent par Tor comme ces discussions. **Serveurs de fichiers** dit où ils vont, au
  premier qui en accepte un : blossom.primal.net, blossom.band et nostr.download, sauf si tu les changes. Une photo ou
  un fichier qui arrive n’est récupéré que quand tu touches **Afficher la photo** ou **Enregistrer**, et ne s’ouvre que
  s’il est celui qui a été envoyé.
  Touche une photo affichée pour la voir sur tout l’écran, comme dans la discussion d’un contact : deux doigts ou un
  double appui zooment, elle tourne avec le téléphone, et **Enregistrer** la garde (voir Photos et fichiers, sous
  [Discuter par un relais](#relay)).
- **Réactions :** appuie longuement sur un message pour ouvrir son menu et réagir avec 👍, ❤️, 😂, 😮, 😢 ou 🙏, ou avec
  l’une de celles derrière **+** ; dessous s’affichent les réactions, la dernière de chaque personne, comme les autres
  applis Nostr les envoient (NIP-25). Appuie sur une réaction sous un message pour ajouter la même, ou sur la tienne
  pour la retirer ; les applis des autres sont priées de la retirer.
- **Réponses :** **Répondre**, dans le menu d’un message maintenu, lui répond. Le message s’affiche au-dessus du champ
  du message, avec une ✕ pour l’abandonner, puis au-dessus de ta réponse dans la discussion, où un appui mène à lui. Les
  autres applis Nostr l’affichent aussi comme une réponse (NIP-17 la marque comme réponse). Une photo, un fichier ou un
  message vocal envoyé pendant qu’il s’affiche lui répond aussi. **Copier**, dans le même menu, prend les mots d’un
  message.
- **Messages vocaux :** maintiens le micro sous le champ du message pour enregistrer, et relâche pour envoyer ; glisse
  vers la gauche avant de relâcher pour abandonner l’enregistrement. Une minute au maximum, et un appui de moins d’une
  seconde n’envoie rien. Il part comme un fichier : chiffré sur ce téléphone et déposé sur un serveur de fichiers, avec
  sa durée dans le message ; qu’une autre appli le lise comme un message vocal ou comme un fichier son, c’est à elle
  d’en décider. Un message qui arrive avec sa durée se lit avec **Lire**, et n’est récupéré que quand tu le lis.
- **Épingler pour moi :** garde un message en haut de la discussion, sur ce téléphone seulement ; personne d’autre ne le
  voit.
- **Sélectionner :** choisit plusieurs messages à **Copier**, à **Transférer** dans une autre discussion Nostr (les
  photos et les fichiers sont renvoyés) ou à **Supprimer**. Supprimer les retire de ce téléphone et demande aux applis
  des autres de supprimer aussi les tiens : leurs applis peuvent le faire ou non.
- **Ce téléphone ou tout le monde :** **Supprimer** demande d’abord : **Ce téléphone** les supprime ici seulement, et
  ils restent cachés s’ils reviennent ; **Pour tout le monde** demande aussi aux applis des autres de supprimer les
  tiens (NIP-09), ce qu’elles feront ou non.
- **Stickers :** **Sticker** envoie tes propres stickers faits à partir de photos (**Les miens**) comme des photos,
  chiffrées : les autres applis Nostr les affichent comme des photos. Les séries intégrées y sont aussi : chaque sticker
  part comme son image, faite sur ton appareil.
- **Chiffrement :** chaque message est chiffré pour l’autre personne et signé par toi, puis enveloppé de nouveau par une
  clé créée pour ce seul message, son heure reculée jusqu’à deux jours (NIP-17, avec NIP-44 et NIP-59). Les relais
  voient à qui il est destiné, pas qui l’a écrit, quand, ni ce qu’il dit. Une copie va à tes propres relais, pour que
  tes autres applis Nostr avec cette clé lisent aussi. C’est le code propre d’Erevos, non audité, vérifié avec l’exemple
  de NIP-17 lui-même et face à nostr-tools.
- **Où arrivent tes messages :** les relais auxquels les autres applis envoient tes messages : relay.damus.io, nos.lol
  et relay.primal.net si tu ne les changes pas, trois au plus. Erevos les fait connaître aux autres applis (une liste
  kind 10050) quand ils changent et une fois par semaine. Il envoie aux relais que nomme l’appli de l’autre personne ;
  une appli qui n’en nomme aucun ne peut pas encore recevoir de message, et Erevos le dit. Une clé venue d’une autre
  appli lit là où cette appli a dit que tes messages arrivent (sa propre liste kind 10050), sauf si tu les as changés
  ici, et redit cette liste, si bien que les deux applis reçoivent les mêmes messages ; elle lit ces relais depuis leur
  début, et récupère une fois ce que les relais nommés dans d’anciennes listes de la clé gardent encore.
- **Anciens messages privés :** beaucoup d’applis envoient et gardent encore des messages privés à l’ancienne manière
  (NIP-04, kind 4) ; Damus et Primal les ont montrés pendant des années. Erevos les lit aussi, passés et nouveaux, et
  les montre dans les mêmes discussions : sur les relais où arrivent tes messages et sur quatre autres au plus, ceux
  que lit l’autre appli de ta clé (sa liste kind 10002, pour une clé venue d’une autre appli) et relay.damus.io,
  nos.lol et relay.primal.net. Ces messages sont chiffrés eux aussi, mais les relais voient qui a écrit à qui, et
  quand. Erevos lui-même n’envoie qu’à la manière de NIP-17.
- **Publications publiques :** dans une discussion avec une personne, **Publications publiques** montre ce que la
  personne publie pour tous (kind 1) et les publications d’autres personnes qu’elle a repartagées, les plus récentes
  d’abord, trente à la fois, avec **Publications plus anciennes** pour en voir plus. C’est en lecture seule : d’ici, on
  ne peut ni répondre, ni réagir, ni publier. C’est cherché à l’ouverture, sur les relais utilisés pour les recherches
  et sur ceux où, selon sa liste de relais (NIP-65), elle écrit, comme le dit le choix de Tor de cet espace, et rien
  n’en est gardé. Aucune image ni aucun lien n’est ouvert : ils s’affichent sous forme d’adresses, qui peuvent être
  copiées. Une publication avec un avertissement de contenu montre ses mots après un appui sur **Afficher**. Un compte
  qui ne publie que pour tous, comme celui d’un projet, n’envoie pas de messages privés : sa discussion reste vide, et
  ses publications sont ici.
- **Le fil public :** sur l’écran d’accueil, le bouton **Public** montre un seul fil avec ce que les personnes que suit
  ta clé Nostr publient pour tout le monde, et ce qu’elles ont partagé à nouveau, et avec les messages des salons Matrix
  publics où tu es (des salons que n’importe qui peut rejoindre), les plus récents d’abord, comme dans Amethyst : le
  visage de qui a écrit, avec un petit **N** ou **M**, son nom, quand, les mots, les photos dans la publication (une en
  pleine largeur, de deux à quatre en grille) et, pour le premier lien, une carte avec son image, son site, son titre et
  une ligne. Pour Matrix, la ligne sous le nom dit le salon et son serveur : touche-la pour ouvrir le salon. D’autres
  viennent quand tu arrives au bout, ou avec **Publications plus anciennes** ; tire la liste vers le bas pour les plus
  récentes (dans un navigateur, **Chercher de nouveau**). Suivre des gens se fait toujours dans une autre appli Nostr
  avec la même clé. Ta liste de suivis, où ils écrivent (leurs listes NIP-65) et leurs publications ne sont cherchés que
  tant que le fil s’affiche, sur les relais des recherches, sur ceux qui rassemblent des listes et sur ceux où ils
  écrivent, comme le dit le choix Tor de l’espace ; les noms seulement pour les publications affichées. Rien n’est gardé.
  **Photos**, au-dessus du fil, est le choix qui compte pour la vie privée. Une photo ou une carte de lien vient du
  serveur où la personne qui a écrit la publication l’a mise, et ce serveur voit l’adresse d’où elle a été récupérée, par
  Tor celle d’une sortie de Tor, et que quelqu’un l’a ouverte. **Toujours** les affiche tout de suite, par Tor quand Tor
  est activé dans cet espace ; **Seulement par Tor** les affiche seulement quand Tor est activé, et sinon sur appui ;
  **Sur appui** n’en récupère aucune avant que tu l’appuies. **Aperçus des liens** active ou coupe les cartes. Rien n’est
  récupéré tant que le fil ne s’affiche pas, une photo n’est gardée que tant que sa publication s’affiche, et aucune
  n’est enregistrée ; celle qui ne vient pas montre **Afficher la photo** pour réessayer. Seules sont récupérées des
  adresses sur internet, jamais une de ce téléphone ni de ton réseau domestique.
  Sous une publication Nostr : **Répondre** écrit une réponse, **Partager à nouveau** la montre à tes abonnés (il demande
  d’abord), le cœur l’aime, et la flèche partage un lien vers elle. Ses trois points : **Copier le texte**, les
  **Publications publiques** de qui l’a écrite, **Lui écrire**, et **Reprendre** pour une publication de toi. Touche une
  publication pour l’ouvrir avec le nombre de personnes qui l’ont aimée et partagée, et ses réponses. **Nouvelle
  publication**, le stylo, écrit une publication publique, avec jusqu’à quatre photos. Les réponses, les partages, les
  « J’aime » et les publications sont publics et signés avec la clé Nostr de l’espace : n’importe qui peut les lire, et
  ils montrent qu’ils sont de toi ; une photo que tu ajoutes est mise non chiffrée sur le serveur de fichiers de
  l’espace, comme doit l’être celle d’une publication publique. Sous un message Matrix : **Répondre**, **Réagir** (un
  choix de six) et partager (un lien matrix.to), et dans ses trois points **Copier le texte** et **Ouvrir le salon**.
  C’est toujours la clé et le compte de cet espace, jamais ceux des discussions masquées.
- **Sondages :** dans le fil public, un sondage s’affiche avec ses réponses, pour **Voter** et, tant qu’il est ouvert,
  avec **Résultats**. **Nouvelle publication** puis **Sondage** en crée un : jusqu’à 10 réponses, une ou plusieurs au
  choix, ouvert 1, 3 ou 7 jours. Les votes sont publics : tout le monde peut voir ce que tu as choisi. Une réaction à
  toi sous une publication se retire en appuyant de nouveau dessus.
- **Émojis personnalisés :** dans le fil public, les émojis que font d’autres applis se chargent comme les photos des
  publications, comme le disent plus haut **Photos** et Tor. Dans les discussions privées, ils s’affichent comme :nom:
  et ne sont jamais chargés.
- **Marques :** un ✓ dès qu’un de ses relais a accepté le message. NIP-17 ne renvoie rien : ni quand son appli l’a, ni
  quand la personne le lit. Lire une discussion ici ne le dit à personne.
- **Pas anonyme :** ta clé est la même pour tous ceux à qui tu écris, et quiconque a un npub peut lui écrire. Les relais
  où arrivent tes messages voient ta clé les lire et, sans Tor, d’où. Seule la connexion qui lit tes relais leur dit qui
  lit, quand un relais le demande (NIP-42) ; l’envoi et la recherche de personnes, jamais.
- **Par Tor :** sur Android, **Tor** sur cet écran choisit comment ce compte Nostr joint ses relais et ses serveurs de
  fichiers, comme le compte de chaque réseau : **Désactivé**, par défaut pour une nouvelle clé, en direct ; **Comme
  l’espace**, comme le dit le choix de l’espace sous **Réglages** → **Relais et réseaux** → **Tor** (avec **Messages**
  via Tor dès que Tor est prêt, avec **Tout** uniquement via Tor) ; **Toujours par Tor**, uniquement via Tor, démarré
  pour lui, jamais en direct. Une clé d’avant ce choix commence aussi sur **Désactivé**. L’écran dit par où elles passent. Dans
  l’appli web et sur un ordinateur, elles passent en direct.
  **Via Tor**, au bas d’une discussion, envoie cette seule discussion uniquement par Tor, quel que soit le mode de
  l’espace, sur des circuits à elle, pour qu’aucune sortie Tor ne porte ses messages avec ceux d’une autre : ce que tu y
  envoies, la recherche de l’endroit où ils lisent, et ses photos et fichiers ; sans Tor, rien n’en part. Ce qui
  t’arrive suit toujours le mode de l’espace, car une seule connexion lit tes messages pour toutes les discussions.
  C’est gardé sur ce téléphone seulement.
- **Notifications :** un message qui arrive affiche une notification et compte dans le nombre sur l’icône d’Erevos,
  comme dans les discussions d’Erevos lui-même, tant que cet espace est ouvert ; sur un ordinateur, tant qu’Erevos
  tourne. Sur Android, **Notifications**, en bas d’une discussion, la met en sourdine ou lui donne un son à elle ; une
  discussion en sourdine ne compte pas. **Apparence de la discussion**, à côté, donne à la discussion un aspect à elle.
- **Pas encore :** les fichiers qu’une autre appli chiffre autrement (ils s’affichent comme un fichier qu’Erevos ne sait
  pas ouvrir).

**Pourquoi :** beaucoup de gens sont sur Nostr et y resteront. Ainsi tu leur écris depuis Erevos, à part et marqué, car
une clé Nostr est la même pour tous ceux à qui tu écris, alors que les discussions propres à Erevos cachent qui parle
avec qui.

- **Ce qu’un message porte :** comme dans une discussion Matrix (voir [Matrix](#matrix)), et **Position**, qui envoie
  où tu es comme une adresse geo: et un lien de carte que toute app Nostr peut afficher ; un lieu envoyé ainsi
  s’affiche comme un lieu. Dans un groupe, taper @ propose ses membres, nommés pour que toute app Nostr sache de qui
  il s’agit. Un message que tu transfères est marqué **Transféré** sur ton téléphone seulement.
- **Brouillons :** ce que tu tapes et n’envoies pas reste comme brouillon de la discussion, chiffré sur ce téléphone
  seulement. Il revient quand tu rouvres la discussion, même après la fermeture d’Erevos, et la liste de l’écran
  d’accueil le montre sur la ligne de la discussion comme **Brouillon**.
- **Envoyer plus tard :** garde le doigt sur **Envoyer**, choisis une heure (**Dans 1 heure**, **Ce soir 20:00**,
  **Demain 09:00**, ou n’importe quel jour et heure) et touche **Envoyer plus tard**. Le message attend sur ce
  téléphone, chiffré, en pointillés après les messages de la discussion avec son heure, et part de ce téléphone à
  cette heure tant qu’Erevos est déverrouillé, sur Android en arrière-plan aussi ; sinon dès qu’il est de nouveau
  déverrouillé. Texte seulement. Touche-le pour l’envoyer tout de suite ou le supprimer. Dans les discussions
  masquées, il part seulement tant qu’elles sont ouvertes, sauf si elles reçoivent aussi fermées. Un message qu’une
  sauvegarde restaurée a ramené, dont l’heure était passée avant la restauration, ne part pas tout seul : le téléphone
  d’où vient la sauvegarde l’a peut-être déjà envoyé.
- **Me rappeler :** le menu d’un message a **Me rappeler**. Choisis une heure : le message, avec le nom de sa
  discussion, va dans **Discussion avec moi-même** et te le rappelle alors. Il faut **Erevos** activé dans
  [Modules](#modules).
- **Messages éphémères :** **Messages éphémères**, sous le champ de message, supprime de ce téléphone les nouveaux
  messages, envoyés ou reçus, ce délai après leur envoi. Les tiens portent ce délai (NIP-40), donc leur appli et les
  relais qui le respectent les suppriment alors ; les autres les gardent. **Éphémère** le fait pour le prochain
  message seulement. Un message qui arrive avec son propre délai part à ce moment-là.
- **Bloquer :** **Bloquer**, en bas d’une discussion, jette sur ce téléphone ce qu’envoie cette clé, sans le lire ;
  cela ne revient pas si tu la débloques. Elle n’est pas prévenue : Nostr ne peut empêcher personne de t’écrire.
  **Contacts bloqués**, sur l’écran des discussions Nostr, les liste, avec **Débloquer**.
- **Vérifier en personne :** dans une discussion avec une personne, **Vérifier en personne** montre le code de ta clé.
  Photographie le code que montre leur appli (nostr:npub…) : la discussion est marquée vérifiée quand c’est la clé de
  cette discussion. Rien n’est envoyé.

## Telegram {#telegram}

Uniquement dans Erevos+, sur Android, un espace peut se connecter à votre compte Telegram et discuter avec des personnes sur Telegram, dans **Réglages** → **Relais et réseaux** → **Telegram**. Erevos n’est pas fait par Telegram et utilise l’API de Telegram. Les conversations rejoignent la liste de l’écran d’accueil, marquées **Telegram**, avec leur propre pastille.

- **Connexion :** touchez **Se connecter à Telegram**, indiquez votre numéro de téléphone avec l’indicatif du pays, puis le code que Telegram envoie : à son application sur vos autres appareils, par SMS ou par appel ; **Renvoyer le code** le redemande. Si votre compte a un mot de passe en deux étapes, Erevos le demande et affiche votre indice. Si Telegram veut que vous confirmiez sur un autre appareil, Erevos affiche le lien à y ouvrir. Un nouveau compte Telegram ou la connexion par e-mail, Erevos ne sait pas encore : faites-le une fois dans l’application Telegram officielle. Ce que Telegram garde sur ce téléphone reste chiffré dans cet espace.
- **Conversations normales :** Telegram peut les lire. Une conversation Telegram ordinaire n’est chiffrée qu’entre vous et les serveurs de Telegram, et les groupes et canaux ne sont jamais chiffrés de bout en bout. Une conversation privée le dit en haut : **Telegram peut lire cette conversation**.
- **Chiffrement ErevosGram :** dans une conversation privée, **Chiffrement ErevosGram** envoie une invitation à l’autre personne. Si elle utilise {=Erevos} ou l’application ErevosGram et touche **Accepter**, la conversation devient **Chiffrée de bout en bout (ErevosGram)** : ce que vous écrivez tous les deux est scellé avec le protocole propre d’Erevos avant d’arriver chez Telegram, qui ne voit qu’un texte qu’il ne peut pas lire. Quand c’est elle qui vous invite, la conversation affiche **Ils veulent le chiffrement ErevosGram**, avec **Accepter** et **Refuser**. C’est le code propre d’Erevos, non audité. Ce qui a été écrit avant reste lisible par Telegram.
- **Numéro de sécurité :** touchez le cadenas en haut d’une conversation chiffrée pour voir son numéro de sécurité. Comparez-le avec celui de leur téléphone, par un autre moyen que Telegram, et touchez **Marquer comme vérifiée** quand les deux sont identiques. Si leurs clés changent, la conversation vous avertit : comparez de nouveau avant de lui faire confiance.
- **Appels :** dans une conversation privée, le bouton d’appel en haut lance un appel vocal Telegram, et un appel entrant s’affiche sur n’importe quel écran avec **Répondre** et **Refuser**. L’appel est assuré par Telegram lui-même, chiffré de bout en bout par le chiffrement d’appel propre à Telegram. Comparez les quatre émojis de votre écran avec ceux de l’autre téléphone : s’ils sont identiques, personne n’écoute. **Appel vidéo**, à côté, en lance un avec ta caméra allumée ; un appel vidéo sonne avec **Répondre en vidéo** à côté de **Répondre**. Pendant tout appel, **Caméra** allume ou éteint ta caméra et **Changer** passe de l'avant à l'arrière ; l'image de l'autre remplit l'écran tant que sa caméra est allumée.
- **Discussions et Réglages :** l’écran Telegram montre tes discussions en lignes, comme l’écran d’accueil, et en apporte d’autres quand tu descends. **Réglages**, à côté du titre, contient **Publicités dans les canaux**, **Dossiers Telegram**, les **Clés ErevosGram** et **Quitter Telegram sur ce téléphone** ; **Discussions** là, ou Retour, revient à la liste.
- **Apporter les clés de l’appli ErevosGram :** sur l’écran Telegram, **Apporter les clés de l’appli ErevosGram**. Dans l’appli ErevosGram, exportez les clés, ce qui écrit erevosgram-keys.txt et affiche un code de 20 caractères ; collez la ligne du fichier dans Erevos et saisissez le code. Les conversations chiffrées là-bas s’ouvrent ici. N’utilisez plus ensuite l’appli ErevosGram pour ces conversations. Si cet espace a déjà des clés ErevosGram, leur remplacement est demandé à part et les conversations chiffrées ici jusque-là ne s’ouvrent plus.
- **Publicités dans les canaux :** désactivées tant que vous n’activez pas **Publicités dans les canaux** sur l’écran Telegram. Telegram demande aux applis d’afficher ses publicités dans les grands canaux publics ; activé, un canal peut afficher en haut une petite carte marquée **Publicité**, que vous pouvez fermer.
- **Dossiers :** les dossiers que vous avez créés dans Telegram s’affichent comme des pastilles sur l’écran Telegram, entre **Discussions** et **Archiver**. Sous **Dossiers Telegram**, activez ceux que vous voulez : chacun s’affiche comme son propre onglet là et sur l’écran d’accueil. Dès qu’un dossier est activé, seules les discussions de ces dossiers notifient. Dans Telegram, les dossiers restent tels quels.
- **Infos de la discussion :** touchez le nom d’une discussion pour voir quand la personne était en ligne pour la dernière fois, son nom, son numéro et sa bio, ou la description, les membres et les liens d’un groupe. Vous pouvez y mettre la discussion en sourdine, l’épingler, l’archiver, la marquer comme lue ou non lue, la placer dans vos dossiers Telegram (Telegram les change sur tous vos appareils), faire effacer les nouveaux messages d’eux-mêmes après un jour, une semaine ou un mois, bloquer la personne, effacer l’historique, et supprimer la discussion ou quitter le groupe ou le canal.
- **Envoyer des photos et des fichiers :** **Joindre**, à côté de **Envoyer**, propose **Photo**, **Appareil photo** et **Fichier**. Ce que vous avez tapé part dessous comme son texte. Le chiffrement ErevosGram ne couvre que le texte : dans une discussion chiffrée, Erevos demande d’abord, car Telegram peut lire les photos et les fichiers.
- **Modifier, transférer, chercher :** maintenez un de vos messages et touchez **Modifier** pour changer son texte (pas dans une discussion chiffrée), ou maintenez un message ordinaire et touchez **Transférer** pour l’envoyer à une autre discussion. **Rechercher**, en haut d’une discussion, parcourt ses messages.
- **Messages vocaux :** quand rien n'est écrit, le micro à côté d'**Envoyer** enregistre tant que vous le tenez ; relâchez pour envoyer, glissez vers la gauche pour annuler. Comme un fichier, un message vocal n'est pas couvert par le chiffrement ErevosGram : dans une discussion chiffrée, Erevos demande d'abord.
- **Réactions :** maintenez un message et touchez **Réagir** pour choisir un emoji. Les réactions s'affichent sous le message ; touchez-en une pour donner ou retirer la vôtre.
- **Sondages et stickers :** dans un groupe ou un canal, **Joindre** → **Sondage** demande une question, de deux à dix options, et si les votes sont anonymes et si plusieurs réponses sont permises. Touchez une option pour voter (**Voter**, si plusieurs sont permises) ; **Retirer le vote** le reprend, et **Clore le sondage**, dans le menu de votre propre sondage, y met fin. **Joindre** → **Sticker** en envoie un de vos paquets.
- **Fils :** un message qui a des réponses affiche leur nombre ; touchez-le pour les lire et en écrire une. **Répondre dans le fil**, dans le menu d'un message, ouvre ou rejoint un fil dans un groupe ou un canal.
- **Message épinglé :** un message épinglé s'affiche dans une barre en haut de la discussion ; touchez-la pour y aller. **Épingler** et **Désépingler** sont dans le menu du message ; dans une discussion privée, vous choisissez entre **Pour les deux** et **Seulement pour moi**.
- **Plusieurs messages :** **Sélectionner**, dans le menu d'un message, permet d'en toucher d'autres, puis de les **Copier**, **Transférer** ou **Supprimer** ensemble. Les messages chiffrés ne peuvent pas être transférés et sont laissés de côté.
- **Membres et administrateurs :** dans un groupe ou un canal, les infos de la discussion listent les **Membres**, marqués **Propriétaire** ou **Administrateur** ; touchez-en un pour lui écrire. Le propriétaire et les administrateurs peuvent **Modifier** le titre et la description et **Retirer** un membre.
- **Plus dans les groupes et les discussions :** avec le droit d'ajouter des admins, **Nommer admin** à côté d'un membre choisit ce qu'il peut faire, et **Droits** à côté d'un admin le change ou, avec **Retirer l'admin**, le rend simple membre. **Ajouter un membre** ajoute un de tes contacts, ou n'importe qui par son @nom ; si ses paramètres de confidentialité refusent, envoie-lui le lien d'invitation. **Joindre** → **Sondage** peut créer un **Quiz** : touche la case à côté de la bonne réponse et ajoute une explication si tu veux ; dès que quelqu'un répond, la bonne réponse s'affiche avec ✅. Les stickers animés bougent dans la discussion. **Joindre** → **Sticker Erevos** envoie un des stickers d'Erevos ; Telegram le reçoit comme un sticker image fixe. Une réaction avec un emoji personnalisé montre son image. Avec plusieurs messages épinglés, la barre du haut les montre un par un : chaque toucher va à l'un et passe au précédent. Un fil a **Joindre**, le micro et un menu de message, comme une discussion. Sur l'écran d'accueil, dans l'onglet Telegram ou l'un de ses dossiers, le menu propose **Tout marquer comme lu**. Les photos s’affichent d’elles-mêmes dans la discussion et les GIF y tournent ; une vidéo montre son image avec ▶ et sa durée, et un appui la lit en plein écran, avec le son. Le nom et les boutons de la discussion restent en haut pendant que vous faites défiler. **Verrouiller par un code PIN**, dans les infos d’une discussion, la verrouille comme une discussion Erevos : elle demande son code à chaque ouverture, et l’accueil n’en montre aucun mot. **Déplacer dans les discussions masquées**, au même endroit, garde la discussion dans les discussions cachées qu’ouvre leur code PIN : elle quitte les listes et les compteurs de cet espace et n’apparaît plus que là ; **Remettre dans mes discussions** la ramène. Telegram l’a toujours, sur tous vos appareils. Sous **+** dans une discussion Telegram, **Photo cachée** envoie une photo floutée jusqu'à ce qu'on la touche, et celles que vous recevez s'affichent de la même façon. **Position** et **Carte de contact** sous **+** envoient un lieu ou l'un de vos contacts dans une discussion Telegram, comme les applis de Telegram les affichent ; Telegram peut lire les deux, et une carte ne part qu'avec un numéro de téléphone. **Envoyer plus tard** sous **+** dans une discussion Telegram envoie ce qui est tapé à l'heure choisie : Telegram le garde et l'envoie alors, même téléphone éteint, et **partiront plus tard** au-dessus du champ de message les liste, avec **Envoyer maintenant** et **Supprimer**. Pas dans une discussion avec le chiffrement ErevosGram. Dans une discussion Telegram, le bouton de recherche montre aussi ses **Médias, liens et fichiers** : **Photos**, **Vidéos**, **Messages vocaux**, **Fichiers** ou **Liens**, chaque type à part, tous depuis Telegram et pas seulement ceux de ce téléphone ; touchez-en un pour y aller dans la discussion. Avec **Aperçus des liens** activés dans les Réglages, le premier lien d'un message envoyé dans une discussion Telegram part avec l'aperçu qu'en font les serveurs de Telegram, comme dans les applis de Telegram ; les aperçus reçus s'affichent sous le texte, sans leur image, et demandent avant d'ouvrir le lien. **Bloquer les captures d’écran** dans les infos d’une discussion Telegram la garde hors des captures et de l’aperçu des applis récentes sur ce téléphone, sous Android ; Telegram ne peut pas demander la même chose à l’autre côté. Une discussion Telegram ouverte avec son PIN, ou gardée dans les discussions cachées, en reste aussi à l’écart, comme une discussion Erevos. **Notifications** dans les infos d'une discussion Telegram lui donne son propre son et sa sonnerie sur ce téléphone, ou la rend muette ici un moment, comme pour une discussion Erevos ; **Mettre les notifications en sourdine** au-dessus la rend muette dans Telegram, sur tous vos appareils. Dans une discussion Telegram, ce qui a été tapé et laissé revient quand elle s’ouvre à nouveau : Telegram le garde comme brouillon sur tous vos appareils, sauf dans une discussion avec le chiffrement ErevosGram, où seul ce téléphone le garde tant qu’Erevos tourne. Un message qui n’a pas pu partir a **Renvoyer** et **Supprimer** dans son menu, et le bouton de recherche a **Aller à un jour**. Maintenez une photo, une vidéo ou un fichier dans une discussion Telegram et choisissez **Enregistrer dans la Collection** pour y garder une copie chiffrée ; celle d'une discussion cachée va dans leur Collection. **Envoyer à**, depuis le Partage d'une autre appli, liste aussi les discussions Telegram de l'espace, sauf celles verrouillées par un PIN, gardées dans les discussions cachées, ou les canaux : le texte va dans le champ de message, et une photo ou un fichier jusqu'à 100 Mo part aussitôt. Dans une discussion Telegram, un @nom se touche, et un lien t.me (une personne, un groupe ou canal, un message, une invitation) s'ouvre dans le Telegram d'Erevos, en demandant avant de rejoindre une discussion par invitation ; les autres liens demandent avant de s'ouvrir dans le navigateur. **Tor pour ce compte Telegram**, dans les réglages Telegram et avant la connexion, propose **Désactivé** (au départ), **Comme l’espace** et **Toujours par Tor**, comme tout compte d'un autre réseau : avec Toujours, ou tant que l'espace fait tout passer par Tor, Telegram n'est joint que par Tor, sur ses propres circuits, à la connexion aussi, et jamais en direct, même quand Tor ne peut pas se connecter ; le compte de chaque lieu caché choisit pour lui-même. **Par Tor** dans les infos d'une discussion Telegram fait passer cette discussion uniquement par Tor : Telegram a une seule connexion pour toutes les discussions d'un compte, donc tout le compte passe par Tor tant qu'il est activé. Plus lent, et les appels ne passent pas par Tor.
- **Chercher par @nom :** en haut de l'écran Telegram, écrivez un nom dans **Chercher par @nom** pour ouvrir la discussion avec cette personne ou ce canal.
- **Discussions masquées :** chaque lieu masqué peut avoir un compte Telegram à lui, qui n’apparaît nulle part en dehors de ses discussions masquées. Voir [Discussions masquées](#hidden).
- **Quitter :** **Quitter Telegram sur ce téléphone**, en bas de l’écran Telegram, vous demande de choisir : **Se déconnecter aussi chez Telegram** retire ce téléphone de vos appareils chez Telegram, et **Seulement l’oublier ici** le laisse listé là-bas jusqu’à ce que vous le retiriez dans l’application Telegram. Dans les deux cas, Erevos supprime ce que Telegram gardait sur ce téléphone et les clés ErevosGram : les conversations chiffrées ne peuvent plus être lues.
- **Photos et fichiers :** une photo, un message vocal, une vidéo ou un fichier n’est récupéré chez Telegram que lorsque vous le demandez, puis affiché ou enregistré. Les messages vocaux et les vidéos s’affichent pour l’instant comme des fichiers.

## Messenger {#messenger}

Uniquement dans Erevos+, sur Android, Erevos peut se connecter à ton compte Facebook Messenger et discuter avec des personnes sur Messenger, dans **Réglages** → **Relais et réseaux** → **Messenger**, ou depuis sa carte sur l’écran d’accueil. Erevos parle lui-même avec les serveurs de Meta, sans pont entre les deux ; il n’est pas fait par Meta. Le compte appartient au téléphone, pas à un espace : ses discussions rejoignent la liste d’accueil du premier espace, marquées **Messenger**, avec une carte à part. Active ou désactive Messenger dans **Réglages** → **Général** → **Modules**.

- **Connexion :** **Se connecter à Messenger** ouvre la page de connexion de Facebook elle-même. Connecte-toi comme sur facebook.com, avec le code ou la vérification que Facebook demande, et Erevos garde la connexion, chiffrée, sur ce téléphone. Si Messenger y met fin plus tard, l’écran Messenger affiche **Messenger te demande de te reconnecter.**
- **Ce que Meta peut lire :** sous le nom d’une discussion, Erevos dit si elle est chiffrée de bout en bout. Meta ne peut pas lire une discussion chiffrée de bout en bout, mais sait qui parle avec qui et quand ; toute autre discussion, Meta peut la lire.
- **Discussions :** l’écran Messenger liste tes discussions, les plus récentes d’abord. **Nouvelle discussion** trouve des personnes par leur nom : écris-le, touche **Rechercher**, puis touche la personne pour commencer.
- **Écrire :** **+** à côté de la zone de message propose **Photo**, **Appareil photo**, **Fichier** (jusqu’à 100 Mo) et **Sticker**. Quand rien n’est écrit, maintiens le micro pour enregistrer un message vocal. Maintiens un message pour son menu : une réaction, **Répondre**, **Copier** et **Supprimer**, avec **Supprimer pour tout le monde** pour tes propres messages et **Supprimer pour moi** pour n’importe lequel. Les réponses, réactions, modifications et suppressions s’affichent dès qu’elles arrivent. Les appels de Messenger ne sont pas dans Erevos.
- **Ouvrir Facebook :** sur l’écran Messenger, **Ouvrir Facebook** montre la page de Facebook elle-même avec la même connexion. Les liens Messenger qui s’y trouvent reviennent dans Erevos ; les autres liens s’ouvrent dans ton navigateur, sans les marques de suivi de Facebook et jamais par Tor, si bien que ce site voit ton adresse internet. Si l’écran te demande d’abord de te déconnecter puis de te reconnecter, fais-le une fois : Messenger se connecte maintenant sur facebook.com. Facebook a aussi sa propre carte dans la fenêtre **Services** de l’écran d’accueil, à côté de Messenger, qui l’ouvre tout de suite.
- **Messenger dans son étui :** sur l’écran Messenger, sous **Comment Messenger est utilisé ici**, avec **Par Erevos** (le choix par défaut) Erevos parle Messenger lui-même, et **Dans son étui** montre à la place la page Messenger de Meta elle-même, comme sur un ordinateur, enfermée par Erevos avec la même connexion ; **Ouvrir Messenger** l’ouvre. Seuls les sites de Meta s’y chargent, les liens vers l’extérieur s’ouvrent dans ton navigateur sans les marques de suivi de Facebook, et ce que garde la page de Meta reste dans l’étui seul, à part de toute autre page, pour qu’elle reconnaisse ton téléphone et ne demande pas à chaque fois le code PIN de tes discussions chiffrées ; cela s’efface quand tu te déconnectes de Messenger ou qu’un autre compte l’ouvre. Les appels y marchent, mais pas par Tor : si Messenger passe par Tor, la page passe seulement par Tor, sans appels, et les liens vers l’extérieur ne s’ouvrent pas. Erevos t’avertit quand même des nouveaux messages, même si l’étui n’a jamais été ouvert : une discussion avec des messages non lus apparaît sur l’accueil jusqu’à sa lecture, et un appui l’ouvre dans l’étui ; tant que l’étui est ouvert, Erevos n’avertit de rien, puisque la page le montre. Les verrous de discussion, les discussions masquées et la Collection ne s’appliquent pas à ses discussions. Elle se ferme dès que l’espace se verrouille ou se ferme, et avec le bouton de panique, et elle reste hors des captures d’écran et de l’aperçu des applis récentes chaque fois que l’écran d’Erevos lui-même l’est ; la page Facebook aussi. Elle s’affiche sous la barre d’Erevos, aux couleurs d’Erevos : **←** revient à Erevos, et **Facebook** dans la barre montre le fil de Facebook dans la même page, avec **Messenger** pour revenir. La page est mise à la largeur du téléphone, pour se lire sans zoomer. La page de Meta elle-même prend toute ton apparence : ses couleurs, sombre ou claire comme Erevos, la forme de tes bulles, ta taille de texte, les lettres de ton style et ce qui se trouve derrière tes écrans, et elle change avec elle même ouverte ; une photo à toi reste dans Erevos, et la page montre un dégradé doux à la place. Là où Meta change sa page, certaines parties peuvent garder l’apparence de Meta.
- **Notifications et lecture :** les nouveaux messages te notifient et comptent sur l’icône d’Erevos, comme ceux des autres discussions. Ouvrir une discussion la marque lue, et elle le reste jusqu’à ce que quelqu’un écrive de nouveau, même avant que Messenger ne le sache. Chaque discussion a ses propres **Notifications** sous sa zone de message : en sourdine, ou avec un son à elle.
- **Par Tor :** **Tor pour ce compte Messenger**, sur l’écran Messenger et aussi avant la connexion, est **Désactivé** par défaut, et les serveurs de Meta voient ton adresse internet ; **Comme l’espace** suit **Réglages** → **Relais et réseaux** → **Tor** ; **Toujours par Tor** envoie le compte, sa connexion et ses images uniquement par Tor. **Par Tor** sous une discussion envoie tout le compte par Tor, car Messenger n’a qu’une connexion pour toutes ses discussions. Meta peut demander une confirmation, ou verrouiller un temps, un compte qui se connecte par Tor. Voir [Qui voit ton adresse internet](#ip).
- **Déconnexion :** **Se déconnecter de Messenger sur ce téléphone** retire ses discussions d’Erevos ; tu peux te reconnecter. Les sauvegardes gardent les notifications de chaque discussion et le choix de Tor, pas la connexion : après une restauration, reconnecte-toi.

## Signal {#signal}

Uniquement dans Erevos+, sur Android, Erevos peut tenir ton compte Signal et discuter avec des personnes sur Signal, dans **Réglages** → **Relais et réseaux** → **Signal**, ou depuis sa carte sur l’écran d’accueil. Erevos parle le protocole propre de Signal avec les serveurs de Signal, et chaque discussion est chiffrée de bout en bout ; il n’est pas fait par Signal. Le compte appartient au téléphone, pas à un espace : ses discussions rejoignent la liste d’accueil du premier espace, marquées **Signal**, avec une carte à part. Active ou désactive Signal dans **Réglages** → **Général** → **Modules**.

- **Deux façons d’entrer :** **Nouveau compte Signal avec mon numéro** fait d’Erevos le Signal de ce numéro, et l’application Signal d’un autre téléphone avec le même numéro s’arrête alors. **Lier au Signal d'un autre téléphone** laisse ton Signal où il est et ajoute Erevos comme un de ses appareils liés.
- **Un nouveau compte :** écris ton numéro avec l’indicatif du pays, comme +33 6…, et choisis si le code arrive par SMS ou, avec **Le code arrive par appel**, par un appel. Signal te demande d’abord de résoudre un captcha sur sa propre page. Écris ensuite le code que Signal a envoyé, et le nom que les autres voient sur Signal (le nom de famille est facultatif).
- **Lier :** sur l’autre téléphone, dans Signal : Paramètres → Appareils liés → Lier un nouvel appareil, et scanne le code qu’Erevos affiche. Les nouveaux messages arrivent alors sur les deux.
- **Discussions et groupes :** l’écran Signal liste tes discussions et groupes, les plus récents d’abord. **Nouvelle discussion** trouve une personne par numéro de téléphone ou par nom ; touche-la pour commencer. Les groupes où tu es fonctionnent comme des discussions ; les nouveaux groupes se créent dans l’application Signal.
- **Écrire :** **+** propose **Photo**, **Appareil photo**, **Fichier** (jusqu’à 100 Mo) et **Sticker** ; quand rien n’est écrit, maintiens le micro pour un message vocal. Maintiens un message pour une réaction, **Répondre**, **Copier** et **Supprimer**, avec **Supprimer pour tout le monde** pour tes propres messages et **Supprimer pour moi** pour n’importe lequel.
- **Appels :** dans une discussion avec une personne, **Appel vocal** et **Appel vidéo** l’appellent sur Signal, chiffrés de bout en bout. Un appel Signal entrant s’affiche par-dessus n’importe quel écran, avec **Répondre**, **Répondre en vidéo** et **Refuser**. Les appels ne passent pas par Tor, et Erevos te prévient avant chacun.
- **Notifications et lecture :** comme pour Messenger, les nouveaux messages te notifient et comptent sur l’icône, une discussion lue ici reste lue, et chaque discussion a ses propres **Notifications**, avec une sonnerie à elle pour les appels.
- **Par Tor :** **Tor pour ce compte Signal**, aussi avant la connexion, fonctionne comme pour Messenger : **Désactivé** par défaut, donc les serveurs de Signal voient ton adresse internet. Avec **Toujours par Tor**, l’inscription, son captcha et la liaison passent aussi par Tor. **Par Tor** sous une discussion envoie tout le compte par Tor.
- **Déconnexion :** **Se déconnecter de Signal sur ce téléphone** retire ses discussions d’Erevos. Les sauvegardes gardent les notifications de chaque discussion et le choix de Tor, pas le compte : après une restauration, inscris-toi ou lie de nouveau.

## Session {#session}

Uniquement dans Erevos+, sur Android, Erevos peut tenir un compte Session et discuter avec des personnes sur Session, dans **Réglages** → **Relais et réseaux** → **Session**, ou depuis sa carte sur l’écran d’accueil. Session ne demande ni numéro de téléphone ni e-mail : le compte, ce sont 13 mots de récupération, et ses messages passent chiffrés de bout en bout par le routage en oignon des nœuds de Session. Erevos n’est pas fait par Session. Le compte appartient au téléphone, pas à un espace : ses discussions rejoignent la liste d’accueil du premier espace, marquées **Session**, avec une carte à part. Active ou désactive Session dans **Réglages** → **Général** → **Modules**.

- **Un nouveau compte :** touche **Nouveau compte Session**, écris ton nom sur Session et touche **Créer le compte**. Erevos affiche **Tes 13 mots de récupération** : note-les, garde-les en lieu sûr et touche **Je les ai notés**. Ce sont le seul moyen de récupérer le compte, et quiconque les a peut lire tes discussions.
- **Un compte que tu as déjà :** **Récupérer un compte avec ses 13 mots** prend les mots, séparés par des espaces, et ton nom ; touche ensuite **Le récupérer**.
- **Ton identifiant Session :** l’écran Session l’affiche, avec **Copier**. Les autres commencent une discussion avec toi grâce à lui.
- **Discussions :** **Nouvelle discussion** prend un identifiant Session ou un nom ONS, et **Ouvrir** commence la discussion.
- **Groupes :** **Nouveau groupe Session** crée un groupe à partir d’un nom et des personnes que tu choisis parmi tes discussions Session. Elles reçoivent une invitation et rejoignent le groupe en l’acceptant, et tu en es l’admin. Dans un groupe, son bouton montre les **Membres** ; un admin peut **Ajouter des personnes**, **Renommer** le groupe, et **Nommer admin** ou **Retirer du groupe** quelqu’un qui n’est pas admin. **Quitter le groupe** le quitte, et y revenir demande une nouvelle invitation.
- **Écrire :** **+** propose **Photo**, **Appareil photo**, **Fichier** (jusqu’à 10 Mo) et **Sticker** ; quand rien n’est écrit, maintiens le micro pour un message vocal. Maintiens un message pour une réaction, **Répondre**, **Copier** et **Supprimer**.
- **Appels :** dans une discussion avec une personne, **Appel vocal** et **Appel vidéo** l’appellent sur Session. Session fait sonner ses appels lui-même, sans bruit pour une discussion en sourdine. Les appels ne passent pas par Tor, et Erevos te prévient avant chacun.
- **Notifications et lecture :** comme pour Messenger et Signal, avec les **Notifications** propres à chaque discussion et une sonnerie à elle pour les appels.
- **Par Tor :** **Tor pour ce compte Session** fonctionne comme pour Messenger et Signal, **Désactivé** par défaut. Le routage en oignon de Session cache déjà ton adresse internet aux personnes à qui tu écris ; le premier nœud Session la voit, sauf si le compte passe par Tor.
- **Déconnexion :** **Se déconnecter de Session sur ce téléphone** demande d’abord, car sans tes 13 mots de récupération le compte ne peut pas revenir. Les sauvegardes ne gardent pas le compte : après une restauration, récupère-le avec ses mots.

## SMS {#sms}

Sur Android, Erevos peut être l’app SMS du téléphone : sous **Réglages** → **Téléphone et SMS** → **SMS** → **Erevos
comme app SMS**, appuie sur **Faire d’Erevos l’app SMS**. L’écran d’accueil montre alors les SMS et les discussions
Erevos dans une seule liste.

> **Les SMS et MMS ne sont pas chiffrés par Erevos.** Ils voyagent comme tout SMS, et restent dans le stockage SMS
> d’Android lui-même, où toute app autorisée à lire les SMS les voit et où les sauvegardes d’Android les contiennent.
> Seules les discussions Erevos sont chiffrées de bout en bout.

- **Les SMS d’avant :** rien à importer. Erevos montre les SMS et MMS déjà sur le téléphone, depuis le stockage propre
  d’Android, où ils restent pour toute autre app SMS. Android les garde, non scellés par Erevos, comme avec toute app
  SMS.
- **Si Erevos ne devient pas l’app SMS :** Android 15 et plus récent peut l’empêcher pour une app installée depuis un
  navigateur. Sous **Réglages** → **Téléphone et SMS** → **SMS** → **Erevos comme app SMS**, appuie sur **Ouvrir les
  applis par défaut** → **Appli SMS** → Erevos. Si Android parle d’un paramètre restreint, ouvre les **infos sur l’appli
  Erevos**, appuie sur **⋮** en haut à droite → **Autoriser les paramètres restreints**, et choisis de nouveau Erevos.
- **Quand un SMS arrive :** une notification dit « Nouveau message », sans qui l’a envoyé ni ce qu’il dit. Si aucune
  n’arrive, **Erevos comme app SMS** affiche **Autoriser les notifications** tant qu’Android les bloque.
- **Codes à usage unique :** un SMS qui dit contenir un code (d’une banque, d’une connexion), dans n’importe laquelle
  des langues de l’app, reçoit **Copier le code** en dessous dans la discussion, et sur sa notification aussi, sans que
  le code s’y affiche ; sur Android 12 et plus récent, le bouton de la notification demande d’abord de déverrouiller le
  téléphone. Seuls ses 4 à 8 chiffres sont copiés, jamais un numéro de téléphone, un montant, une date ou une heure, et
  Android n’en montre aucun aperçu. Toute app qui lit le presse-papiers peut les lire, alors colle le code rapidement.
- **Répondre depuis la notification :** **Réglages** → **Téléphone et SMS** → **SMS** → **Ce que dit un SMS, sur sa
  notification**, désactivé au début, montre sur la notification d’un SMS qui a écrit et quoi tant que cet espace
  est ouvert, avec **Répondre**, qui envoie un SMS simple par la SIM d’arrivée, et **Marquer comme lu**. Quiconque
  voit l’écran le voit ; verrouillé, ou avec un autre espace ouvert, la notification redit seulement « Nouveau
  message », et celle avec un code à usage unique toujours.
- **Si aucun SMS ne s’affiche :** Android 15 et plus récent bloque l’autorisation SMS pour une app installée depuis un
  navigateur. Sous **Réglages** → **Téléphone et SMS** → **SMS** → **Erevos comme app SMS**, appuie sur **Autoriser les
  SMS**. Si Android parle d’un paramètre restreint, ouvre les **infos sur l’appli Erevos**, appuie sur **⋮** en haut à
  droite → **Autoriser les paramètres restreints**, et autorise les SMS sous **Autorisations**. Les discussions envoyées
  en RCS (« chat » dans Google Messages) restent dans cette app et ne s’affichent pas. **Erevos comme app SMS** dit
  combien de conversations SMS Erevos lit, ou pourquoi il n’a pas pu les lire.
- **Écrire à quelqu’un qui a {=Erevos} :** cela passe par Erevos, chiffré de bout en bout, dès que son numéro est associé à
  son contact. Associe-le à la main dans la conversation SMS, ou laisse une invitation cachée le trouver. À partir de
  là, sa conversation SMS ouvre sa discussion.
- **Ses SMS dans la discussion :** les SMS et MMS avec son numéro, ceux d’avant et ceux qui arrivent, s’affichent parmi
  les messages de la discussion selon l’heure, chacun bordé et marqué **SMS (non chiffré)**, avec son ✓ et ses photos.
  Appuie longuement sur l’un d’eux pour le copier, le transférer ou le supprimer, comme dans la conversation SMS. Ils
  restent dans les SMS du téléphone, jamais dans l’historique scellé de la discussion ; seule la conversation avec ce
  numéro-là s’affiche, pas un MMS de groupe, et seulement tant qu’Erevos est l’app SMS ou peut lire les SMS, jamais dans
  les discussions masquées. Les plus récents s’affichent d’abord : **Afficher les SMS plus anciens**, au-dessus d’eux,
  en amène d’autres, et la recherche de la discussion les trouve aussi. Ouvrir la discussion les lit tous, les plus
  anciens aussi, si bien qu’aucun ne reste compté sur l’écran d’accueil. Un numéro sur sa fiche de contact fait de même,
  sans l’associer.
- **Un SMS ordinaire à ton contact :** quand il n’y a pas internet, par exemple. **SMS ordinaire** dans les **Détails**
  de la discussion ouvre sa conversation SMS pour l’y écrire, et **+** → **Envoyer par SMS**, ou **Par SMS** quand tu
  maintiens la flèche d’envoi, envoie ce que tu as tapé en SMS, après avoir demandé. Il s’affiche dans la discussion
  comme un SMS. L’opérateur téléphonique peut le lire. Un SMS ne peut ni disparaître ni répondre à un message : avec le
  chronomètre activé, ou un message auquel tu réponds, Erevos le dit quand il demande.
- **Invitations cachées :** avec le premier SMS à un numéro qui n’est pas un contact, Erevos envoie aussi une courte
  invitation cachée. Aucune ne part vers le numéro d’un contact Erevos, associé ou sur sa fiche de contact. Un
  téléphone sans {=Erevos} n’affiche rien ; un téléphone avec {=Erevos} répond par le relais et les deux deviennent
  contacts. Il ne répond de lui-même qu’à un numéro qu’il connaît, dans tes contacts ou un numéro auquel tu as écrit
  par SMS ; pour tout autre, il demande d’abord, **Une invitation par SMS**, car l’expéditeur d’un SMS peut être
  inventé. Chaque numéro est sollicité une fois par mois au plus, et **Désactiver les invitations**, sous **Réglages**
  → **Téléphone et SMS** → **SMS** → **Trouver Erevos derrière un numéro**, les arrête.

**Pourquoi :** pour que deux téléphones {=Erevos} se trouvent à partir d’un simple numéro de téléphone, sans serveur qui
connaît les numéros. L’invitation est un SMS de données, que les apps de messagerie n’affichent pas, si bien qu’un
téléphone sans {=Erevos} n’affiche rien.

- **Tous les autres :** un SMS ordinaire, marqué SMS. L’opérateur téléphonique peut le lire, comme il lit tout SMS.
- **✓ et ✓✓✓ :** un SMS à toi affiche ✓ dès qu’il est parti, et ✓✓✓ dès que l’accusé de réception du réseau dit qu’il
  est arrivé sur son téléphone, ou « non distribué ». Certains opérateurs n’envoient pas d’accusés de réception ; il
  reste alors à ✓. Un SMS ne peut pas dire s’il a été lu.
- **Photos, messages vocaux et cartes de contact (MMS) :** **+** → **Photo** ajoute une photo, réduite pour tenir dans
  un MMS (environ 280 Ko), sans rien dedans que l’image. Maintiens le micro, sans rien de tapé, pour enregistrer un
  message vocal d’une minute au plus, envoyé en MMS en AMR, le format que lisent les applis de messages des téléphones.
  **+** → **Carte de contact** envoie un contact de ceux du téléphone en vCard, sans tes notes dessus ni ses groupes, et
  avec son image seulement si elle tient encore. **+** → **Sticker** envoie l’un des stickers intégrés comme son image,
  seul dans un MMS. Les photos, messages vocaux et cartes de contact qui arrivent s’affichent dans la conversation, à
  lire ou à enregistrer (**Enregistrer** ouvre un nouveau contact avec les détails de la carte). Un MMS est aussi en
  clair qu’un SMS : l’opérateur peut le voir.
- **Vidéos (MMS) :** **+** → **Filmer une vidéo** demande à l’app appareil photo du téléphone une vidéo en qualité
  MMS, jusqu’à 30 secondes en petite image, ce que la plupart respectent ; **Vidéo du téléphone** n’en prend une que
  si elle est déjà assez petite, environ 280 Ko, car Erevos ne réduit pas les vidéos. Une vidéo reçue montre ▶ dans
  la conversation, et un appui la lit dans l’app vidéo du téléphone.
- **MMS à l’étranger :** un MMS attend chez l’opérateur jusqu’à ce que le téléphone le récupère par les données
  mobiles, qui à l’étranger peuvent coûter. **Réglages** → **Téléphone et SMS** → **SMS** → **MMS** les récupère
  tout de suite mais, sauf si tu l’actives, pas en itinérance : alors un MMS apparaît dans sa conversation comme
  **MMS** avec sa taille et **Récupérer (peut coûter)**, et aussi sous **MMS**, pour un numéro sans conversation
  encore. Désactivé complètement, chaque MMS attend un appui.
- **Où tu es :** **+** → **Position** envoie où tu es en SMS avec une adresse geo: et un lien OpenStreetMap, que
  n’importe quel téléphone ouvre. Une adresse geo:, ou un lien d’OpenStreetMap, de Google Maps, d’Apple Maps ou de Waze,
  dans un SMS qui arrive s’affiche comme un lieu, à ouvrir dans l’appli de cartes ; un lien court reste un lien, car il
  faudrait le récupérer pour connaître le lieu.
- **Réactions d’un iPhone ou de Google Messages :** quand quelqu’un sans Erevos réagit à un de tes SMS, son
  téléphone l’envoie en mots, Liked “À 8 h” ou Reacted 😂 to “À 8 h” : la conversation la montre en 👍 ou 😂 sous le
  message nommé, le dernier avec ces mots, et non comme un message à part ; une retirée (Removed a like from …)
  disparaît. Pour l’instant, seules celles écrites en anglais sont lues ; une dont le message n’est pas trouvé reste
  comme elle est arrivée.
- **Épinglés pour toi :** maintiens un message et choisis **Épingler pour moi** pour l’épingler au-dessus de la
  conversation. Les SMS n’ont pas d’épingles : il n’est gardé que sur ce téléphone, chiffré avec les données SMS de
  l’espace, et l’autre personne ne le sait jamais.
- **Plusieurs messages :** maintiens un message et choisis **Sélectionner**, puis appuie sur d’autres : **Copier** les
  met dans un seul texte, **Transférer** les envoie comme un seul dans le brouillon d’une autre conversation, et
  **Supprimer** les supprime du téléphone, avec **Annuler** pendant quelques secondes.
- **Nouveau SMS :** dans la partie **SMS** de la liste des discussions, le bouton du bas est **Nouveau SMS** et
  n’ouvre que cela, même avec les discussions d’Erevos activées.
- **Choisir le destinataire :** sous **Nouveau SMS**, touche **Contacts** pour choisir parmi tes contacts, avec une
  recherche, ou tape simplement : les contacts dont le nom ou le numéro correspond à ce que tu tapes s'affichent sous le
  champ, et un toucher le remplit. Un contact avec plusieurs numéros montre une ligne pour chacun. Pour un groupe,
  chaque contact choisi s'ajoute aux numéros déjà là. Ce sont les contacts du téléphone et, avec Erevos déverrouillé,
  ceux gardés seulement dans Erevos et tes contacts Erevos avec un numéro, jamais les noms des chats cachés. Avec
  seulement les SMS ouverts, seuls les contacts du téléphone s'affichent. Android demande d'abord si Erevos peut les
  lire.
- **MMS de groupe :** sous **Réglages** → **Téléphone et SMS** → **SMS** → **Nouveau SMS**, tape plusieurs numéros
  séparés par des virgules et appuie sur **Écrire**. Chaque message part à tous en un seul MMS, même un texte seul, et
  leurs réponses arrivent dans la même conversation, chacune avec son auteur. Tout le monde y voit le numéro de chacun,
  et l’opérateur téléphonique voit tout.
- **Deux SIM :** la SIM d’envoi s’affiche au-dessus du champ de message ; appuie une fois sur **Choisir la SIM** pour
  laisser Erevos les voir. Ton choix est gardé pour ce numéro ; d’ici là, Erevos répond sur la SIM où est arrivé le
  dernier message. Chaque message montre sa SIM.
- **SMS plus tard :** maintiens le bouton rond **Envoyer** après le champ et choisis une heure, comme dans une
  discussion. Le SMS s’affiche à la fin de la conversation marqué **Programmé** ; appuie dessus pour l’annuler. Il part
  à cette heure, même avec Erevos fermé et verrouillé ; si le téléphone est alors éteint, dès qu’il est rallumé et
  déverrouillé. D’ici là, il n’est pas dans les SMS du téléphone, où d’autres apps le verraient, et l’opérateur
  téléphonique ne l’a pas. Il attend verrouillé avec une clé du téléphone lui-même (Android Keystore), pas avec le mot
  de passe de ton espace, car Android doit l’envoyer pendant qu’Erevos est verrouillé : la protection qu’a tout SMS une
  fois envoyé, puisque les SMS envoyés restent dans les SMS du téléphone. Texte seulement, vers un seul numéro.
- **Liens :** une adresse web dans un SMS est soulignée, et s’ouvre comme dans une discussion, une fois que tu l’as vue
  en entier.
- **Noms de tes contacts :** désactivé au début, si bien que les numéros des SMS s’affichent comme numéros. **Noms**,
  au-dessus de la liste dans la partie **SMS**, les débloque (comme **Afficher les noms de mes contacts** sous **Réglages** → **Téléphone et
  SMS** → **SMS** → **Noms de tes contacts**) : les noms que les contacts de ton téléphone donnent aux numéros des SMS,
  et les photos qu’ils ont pour eux, ou sinon ceux de tes contacts gardés seulement dans Erevos, dans la liste et dans
  la conversation. Appuie de nouveau sur **Noms** pour n’avoir que les numéros. Erevos ne les lit que pour les afficher,
  et n’en garde aucune copie.
- **Expéditeurs avec un nom :** un SMS venant d’un nom au lieu d’un numéro, comme celui d’une banque, s’ouvre pour être
  lu, mais on ne peut pas y répondre.
- **Me rappeler :** garde le doigt sur un message pour **Me rappeler** : il va dans **Discussion avec moi-même** avec
  le nom de la conversation, et te le rappelle à l’heure que tu choisis.
- **Messages éphémères :** avec Erevos comme appli SMS, **Messages éphémères**, sous la ligne **SMS ordinaire** d’une
  conversation, supprime de ce téléphone ses nouveaux SMS ce délai après leur envoi, ou dès qu’Erevos tourne de
  nouveau. L’autre téléphone les garde : un SMS ne peut pas y être supprimé. Les messages déjà ici restent.

### SMS chiffrés quand rien d’autre ne marche

Quand le relais, Nostr, les téléphones à proximité et LoRa échouent tous, un texte à un contact Erevos dont le numéro
est lié peut partir par SMS, chiffré de bout en bout comme tout message Erevos. C’est désactivé sauf si tu l’actives :
pour tous ces contacts dans **Réglages** → **Téléphone et SMS** → **SMS** → **SMS quand rien d’autre ne marche**
(**Activer pour tous les contacts**), ou pour un seul dans les **Détails** de sa discussion → **SMS quand rien d’autre
ne marche**.

- **Ce que ça coûte :** chaque SMS coûte ce que dit ton forfait. Un texte court prend 3 SMS, un plus long jusqu’à 10 ; à
  l’étranger un SMS peut coûter bien plus.
- **Ce que voit l’opérateur :** quel numéro a écrit à quel autre, quand, et combien de SMS, comme pour tout SMS ; jamais
  ce qui a été écrit, qui part comme le même message chiffré que le relais aurait porté.
- **Ce qui part :** seulement les textes et les suppressions. Pas les photos, fichiers, messages vocaux, appels,
  réactions ni les marques qu’un message est arrivé ou a été lu, ni les textes de plus d’environ 800 lettres latines
  (400 grecques), ni le tout premier message à un nouveau contact, qui porte les clés. Ceux-là attendent, marqués
  **En attente**, comme dans [Comment Erevos choisit le chemin](#paths). Les discussions cachées ne passent jamais
  par SMS.
- **Les deux téléphones** ont besoin d’{=Erevos} comme app SMS, et du numéro du contact lié à sa discussion. Ces SMS sont
  des SMS de données cachés pour Erevos, qu’aucune app SMS n’affiche, et rien n’en reste dans les SMS du téléphone.
- **Par où il est passé :** reste appuyé sur le message : son menu dit **Envoyé par SMS** ou **Arrivé par SMS**.
  **✓✓** arrive dès que le relais ou Nostr sont de nouveau joignables : aucun SMS ne repart tout seul.

**Pourquoi :** les SMS atteignent un téléphone sans aucun internet, partout où il y a un réseau mobile. Mais ils
coûtent de l’argent et disent à l’opérateur qui parle à qui, ce qu’Erevos cache sinon ; c’est pourquoi le SMS est le
dernier chemin, et seulement quand tu le choisis.

> Active-le seulement pour ceux que tu dois joindre ainsi. L’opérateur, et quiconque peut voir ses registres, sait
> grâce à ces SMS que vos deux numéros se parlent, et quand.

### Garder les SMS en ordre

- **Appui long :** dans la liste, appuie longuement sur une conversation SMS pour ce qu’elle peut faire : **Épingler
  en haut**, **Archiver**, **Marquer comme spam**, **Bloquer** et **Supprimer**, et **Ajouter aux contacts** pour un
  numéro qui n’est aucun de tes contacts. Dans une conversation, **⋮** en haut montre la même chose, et d’abord
  **Rechercher dans cette discussion**, **Médias, liens et fichiers**, **Aller à un jour** et **Exporter la
  discussion** (voir [Premiers pas](#start)), et un tel numéro a aussi **Ajouter aux contacts** sous son nom : un
  nouveau contact avec le numéro dedans.
- **Épinglées :** jusqu’à 10 conversations SMS restent en haut de la liste, avec une épingle. **Désépingler** en laisse
  une retourner à sa place.
- **Conversations archivées :** hors de la liste, sous **Archivées** en haut de l’écran d’accueil. Une conversation
  revient toute seule dans la liste quand un nouveau SMS en arrive, ou avec **Désarchiver**.
- **Noms des MMS de groupe :** garde le doigt sur un MMS de groupe et choisis **Donner un nom ici** pour lui donner un
  nom à toi, sur ce téléphone seulement.
- **Le propre d’une conversation :** sous sa ligne **SMS ordinaire**, une conversation a **Apparence de la
  discussion**, comme une discussion, et, avec un seul numéro, **Notifications** : la mettre en sourdine un moment ou
  toujours, ou lui donner un son à elle, ou aucun. Cela vaut tant que l’espace est ouvert ; fermé, chaque SMS notifie
  comme le disent les réglages.
- **Corbeille :** une conversation supprimée attend 30 jours dans la **Corbeille**, puis Erevos la supprime des SMS du
  téléphone. D’ici là, **Récupérer** la remet dans la liste ; **Supprimer maintenant** et **Vider la corbeille**
  suppriment aussitôt, pour de bon. Un SMS qui arrive après qu’elle est partie dans la corbeille s’affiche de nouveau
  dans la liste. Seule l’app SMS peut supprimer des SMS.
- **Spam :** un filtre qui fonctionne sur le téléphone seul, par des règles, et n’envoie rien nulle part. Un SMS d’un
  numéro qui n’est pas un contact et auquel tu n’as jamais répondu va dans **Spam** quand il contient un lien avec des
  mots qui cherchent à tromper, comme un colis retenu ou un prix gagné, ou l’un des mots que tu ajoutes sous
  **Réglages** → **Téléphone et SMS** → **SMS** → **Filtre anti-spam**. **Marquer comme spam** et **Pas du spam**
  décident pour un numéro pour de bon. Un SMS que les mots propres du filtre attrapent (un lien avec des mots qui cherchent à tromper, d’un numéro de téléphone qui n’est dans aucun contact du téléphone et auquel tu n’as jamais répondu) arrive sans notification ni son, car le téléphone connaît aussi ces mots ; tout autre spam, par tes mots, tes règles ou de l’étranger, affiche encore « Nouveau message », car cette notification arrive avant qu’Erevos soit ouvert et le reste du filtre reste chiffré dans l’espace. Un numéro que tu as marqué **Pas du spam** ou que tu laisses passer arrive aussi en silence quand il envoie de tels mots, sauf s’il est dans les contacts du téléphone. Avec le **Filtre anti-spam** désactivé, chaque SMS a sa notification : le téléphone garde seulement si le filtre est activé, comme le dit le dernier espace ouvert.
  Chaque conversation dans **Spam**, dans le dossier et en haut de la
  conversation, dit pourquoi elle est là : le numéro est bloqué, tu l’as marqué, ta règle nomme l’expéditeur, un numéro
  de l’étranger, ton mot, ou un lien et quels mots.
- **Lettres qui se ressemblent :** un SMS d’arnaque qui remplace une lettre par une autre d’un autre alphabet qui lui ressemble, comme un а cyrillique dans un mot latin, ou cache dans un mot une marque qu’on ne voit pas, ne passe pas le filtre : il lit les mots comme ils se voient. L’expéditeur n’est jamais comparé ainsi, car un expéditeur qui ressemble à un expéditeur autorisé n’est pas celui-ci.
- **Règles sur qui envoie :** sous **Filtre anti-spam**, **Expéditeurs** accepte un nom d’expéditeur, comme en envoient
  les magasins et les banques (des lettres, sans accents ni majuscules), ou un numéro, où \`*\` remplace n’importe
  quoi : \`+4470*\` désigne tout numéro qui commence ainsi, \`1234*\` tout numéro court qui commence ainsi, et, une fois
  ton indicatif de pays connu, \`69*\` désigne aussi tout numéro \`+3069...\`. **Dans « Spam »** y envoie les siens ;
  **Laisser passer** les soustrait aux règles du filtre, comme ceux de ta banque ou de ta famille, même si un numéro que
  tu as marqué comme spam, ou bloqué, y va quand même. **Envoyer dans « Spam » les numéros de l’étranger** y envoie tout
  numéro écrit avec un autre indicatif de pays que **Ton indicatif de pays**, qu’Erevos tire des numéros auxquels tu
  réponds et que tu peux changer. Un numéro écrit sans indicatif est d’ici. Appuie sur une règle pour la retirer.
- **Bloquer :** **Bloquer** dans le menu d’une conversation, ou **Réglages** → **Téléphone et SMS** → **SMS** →
  **Numéros bloqués**, met un numéro dans la liste des numéros bloqués d’Android lui-même : Android rejette ses SMS, MMS
  et appels, et chaque espace et l’app de téléphone voient la même liste. Seules l’app SMS ou l’app de téléphone peuvent
  la voir et la changer.
- **Brouillons :** ce que tu tapes sans l’envoyer reste avec cette conversation, et la liste l’affiche comme
  **Brouillon**. Un SMS qui n’a pas pu partir reste là aussi comme brouillon.
- **Textes rapides :** garde le **+** à côté du champ appuyé, ou choisis **Textes rapides** dedans, pour des mots
  courts que tu écris souvent (Je suis en route, Je t’appelle plus tard) : un appui en met un dans le champ, à
  envoyer tel quel ou avec plus. **Ajouter** en garde un à toi, et en garder un appuyé le retire ; dès lors la liste
  est la tienne, gardée chiffrée avec les SMS de l’espace, chaque espace la sienne.
- **Annuler l’envoi d’un SMS :** un SMS que tu envoies attend d’abord 5 secondes à la fin de la conversation : appuie
  alors dessus pour le reprendre dans le champ de message. **Réglages** → **Téléphone et SMS** → **SMS** → **Annuler
  l’envoi d’un SMS** règle **Désactivé**, 5 ou 10 secondes. Quand tu quittes Erevos, il part aussitôt.
- **Ce que coûte l’envoi :** un SMS plus long montre au-dessus du champ une ligne avec son nombre de caractères et
  en combien de SMS il part : 160 caractères dans un SMS, ou 153 dans chaque partie d’un plus long, mais 70, ou 67,
  dès qu’il a une minuscule grecque, un accent ou un emoji. **Réglages** → **Téléphone et SMS** → **SMS** → **Sans
  accents (moins cher)** envoie un SMS simple sans accents et le grec en majuscules, comme l’écrivaient les anciens
  téléphones (ΚΑΛΗΜΕΡΑ), et il contient de nouveau 160 ; pas un avec un emoji, ni un MMS.
- **Renvoyer :** un de tes SMS qui n’est pas parti, ou n’a pas été distribué, le dit : appuie dessus pour le renvoyer.
  Appuie longuement sur n’importe quel message pour **Transférer**, **Renvoyer** et **Supprimer**, avec ses mots à
  sélectionner et copier ; un message supprimé a aussi **Annuler**.
- **Transférer :** appui long sur un message → **Transférer**, puis tape un numéro et appuie sur **Écrire**, ou choisis
  un contact sous **Dans une discussion Erevos**. Il s’ouvre dans cette conversation, pour être relu et envoyé là. Vers
  un numéro, son image part aussi, en MMS ; dans une discussion, seulement ses mots.
- **Chaque espace a les siens :** les épingles, les conversations archivées, la corbeille, les marques de spam et les
  brouillons appartiennent à l’espace, scellés avec son mot de passe. Les SMS eux-mêmes restent dans les SMS du
  téléphone : un autre espace les voit tels qu’ils sont, et une conversation dans la corbeille ici s’affiche là-bas
  jusqu’à ce qu’elle soit supprimée du téléphone.

### Sur tes appareils associés

Les SMS du téléphone peuvent aussi s’afficher sur les [appareils associés](#devices) de cet espace : un ordinateur, un
navigateur, une tablette. Tu les y lis et tu y réponds, et le téléphone envoie la réponse en SMS. C’est désactivé tant
que tu ne l’actives pas, sur le téléphone : **Réglages** → **Téléphone et SMS** → **SMS** → **Aussi sur mes appareils
associés** → **Envoyer aussi mes SMS à mes appareils**.

- **Ce qui part :** les 50 dernières conversations de la liste et d’**Archivées**, chacune avec ses 50 derniers
  messages, chiffrés de bout en bout comme tout ce que les appareils partagent. Les plus anciennes, celles de la
  **Corbeille** et de **Spam**, et les photos restent sur le téléphone : un message avec photo dit **📷 Une photo, sur
  le téléphone**. Les noms ne partent que tant que le téléphone les affiche (**Noms de tes contacts**).
- **Répondre :** ce que tu écris sur un appareil s’affiche comme en cours d’envoi jusqu’à ce que le téléphone l’ait
  envoyé, par la SIM qu’il utilise pour ce numéro, puis il fait partie de ceux du téléphone. Un message que le
  téléphone n’a pas pu envoyer le dit : appuie dessus pour l’envoyer de nouveau. Le téléphone n’envoie chacun qu’une
  fois, et au plus 60 par heure depuis les appareils, pour qu’un appareil perdu ne puisse pas envoyer un déluge de SMS ;
  un message qui a attendu plus d’un jour ne part pas.
- **Lu :** une conversation lue sur un appareil est aussi marquée comme lue sur le téléphone.
- **Notifications :** un nouveau SMS donne aussi une notification sur l’appareil, selon ses réglages de notifications.
- **Par le téléphone :** les SMS vont et viennent seulement tant que cet espace est ouvert sur le téléphone, comme tout
  ce qui passe par le téléphone. Sur un appareil, les écrans sont ceux du téléphone, sans ce que seul le téléphone
  fait : supprimer, bloquer, envoyer plus tard, photos et invitations.
- **Chaque espace a le sien :** l’interrupteur appartient à l’espace. Un emplacement de discussions masquées n’envoie
  jamais les SMS aux appareils.
- **Désactiver :** **Arrêter les SMS sur mes appareils**, sur le téléphone, les retire de tous les appareils.

**Pourquoi :** seul le téléphone a une SIM, donc seul le téléphone envoie et reçoit des SMS. Les appareils les voient
par le téléphone, chiffrés de bout en bout comme le reste, et l’opérateur ne voit rien de plus qu’avant.

## Téléphone {#phone}

Sur Android, Erevos peut être l’app de téléphone du téléphone : sous **Téléphone** dans le menu, appuie sur **Réglages**
→ **Faire d’Erevos l’app Téléphone**. Chaque appel s’affiche alors sur l’écran d’appel propre d’Erevos, et les liens
tel: et le bouton d’appel du téléphone ouvrent le clavier d’Erevos. **Téléphone** s’ouvre aussi depuis le combiné en
haut de l’écran d’accueil, et a sa propre icône dans les apps du téléphone, **Téléphone**, verte avec un combiné sur la
marque d’Erevos, qui ouvre le clavier. Chacun de ceux-ci, comme un lien tel:, l’ouvre une fois Erevos déverrouillé :
avec un mot de passe, après que tu l’as tapé, sauf si le Téléphone s’ouvre sans lui (voir Le mot de passe d’Erevos,
ci-dessous). D’ici là, une carte en haut dit **Erevos n’est pas l’app Téléphone** ; sur un petit téléphone, elle ne
montre que ce titre, et appuyer dessus ouvre les **Réglages** du Téléphone.

- **Appels d’urgence :** un numéro d’urgence (112, ou celui de ton pays) est appelé tout de suite, sans demander la
  SIM : Android la choisit. Avec Erevos verrouillé et le Téléphone derrière le mot de passe, **Appel d’urgence** sur
  l’écran du mot de passe ouvre le clavier d’urgence d’Android, sans mot de passe.
- **Rechercher des contacts :** en haut du Téléphone, tape un nom, un numéro ou une partie de l’un ou de l’autre : les
  contacts avec un numéro s’affichent à la place des onglets, chaque numéro sur sa propre ligne. Appuie sur l’un pour
  l’appeler, ou appuie longuement pour le mettre sur le clavier. La recherche regarde dans les contacts du téléphone et,
  avec Erevos déverrouillé, dans ceux gardés seulement dans Erevos et tes contacts Erevos qui ont un numéro ; jamais
  dans les discussions masquées.
- **Des contacts en composant :** pendant que tu tapes sur le **Clavier**, les contacts qu’il trouve s’affichent en liste
  au-dessus du numéro : un dont le numéro contient les chiffres tapés, ou dont le nom commence par eux sur les lettres des
  touches, comme 2 pour ABC (et ΑΒΓ). Chaque touche montre ses lettres dans la langue de l’app. Touche un contact pour
  l’appeler, ou maintiens-le pour mettre son numéro sur le clavier. Sur un petit écran, où il n’y a pas de place
  au-dessus du numéro, le premier s’affiche au-dessus des touches et **de plus**, à côté, liste les autres.
- **L’écran d’appel :** qui appelle, ou qui tu appelles, avec le nom et la photo que les contacts de ton téléphone lui
  donnent ; tant qu’Erevos est déverrouillé, un numéro associé à l’un de tes contacts Erevos montre le nom que tu lui as
  donné, de même que le numéro d’un contact gardé seulement dans Erevos ; celui d’un contact des discussions masquées
  ouvertes, seulement tant qu’elles sont ouvertes. Il s’affiche par-dessus l’écran de verrouillage et n’a pas besoin du
  mot de passe, car il faut pouvoir répondre à un appel avec Erevos verrouillé. Un appel entrant affiche **Answer**,
  **Decline** et **Message**, et Android sonne avec la sonnerie propre du contact ; les touches de volume la font taire.
  Pendant un appel : **Mute**, **Keypad** pour les tonalités qu’un menu demande, **Speaker**, **Hold**,
  **Add call** et **End**. À ton oreille, l’écran s’éteint.
- **Où va le son :** avec un appareil Bluetooth ou un casque, le bouton à côté de **Keypad** nomme où va le son, et un
  appui te laisse choisir : le téléphone, le haut-parleur, le casque ou l’appareil Bluetooth.
- **Un second appel :** un appel qui arrive pendant un appel affiche **Hold and answer**, **End and
  answer** et **Decline**. Avec un appel en attente, la ligne sous le nom le dit : appuie dessus, ou sur **Swap**,
  pour parler avec l’autre. **Merge** réunit les deux en un seul appel, quand ton opérateur téléphonique le permet.
- **Une conférence :** une fois les appels fusionnés, l’écran d’appel liste les personnes présentes à la place de la
  photo. À côté de chacune, **Séparer** te fait lui parler seul pendant que les autres attendent en attente, et
  **Raccrocher** ne retire qu’elle ; chacun ne s’affiche que là où ton opérateur le permet.
- **Appels vidéo par ton opérateur :** là où ta SIM et ton réseau les prennent en charge (ViLTE, en 4G ou 5G), un
  appel vidéo entrant affiche **Répondre en vidéo** et **Audio seul** ; pendant l’appel, l’autre côté s’affiche en
  plein écran et ta caméra dans un coin, avec **Couper la caméra** et **Changer de caméra**. Un appel sans vidéo
  affiche **Vidéo** quand les deux côtés le peuvent, et quand l’autre le demande, Erevos te demande : **Activer la
  vidéo** ou **Rester en audio**. Pour en lancer un, tape le numéro puis **⋯** → **Appel vidéo**. Android demande
  une fois la caméra. Comme tout appel téléphonique, ton opérateur le transporte et peut le voir ; rien de cela ne
  s’affiche là où le réseau n’a pas d’appels vidéo.
- **Refuser avec un message :** **Message**, sur un appel qui sonne, le refuse avec une réponse rapide, ou une que tu
  écris, que ton téléphone envoie à l’appelant en SMS ; elle s’affiche parmi tes SMS. Sous **Téléphone** → **Réglages**,
  **Réponses rapides** les change : **Ajouter une réponse**, **Retirer**, **Enregistrer**, et **Utiliser les réponses
  habituelles**. Elles sont gardées sur le téléphone, non scellées, car l’écran d’appel les montre avec Erevos
  verrouillé.
- **Le clavier :** sous **Téléphone**, tape un numéro et appuie sur **Appeler** ; maintiens **0** pour +. En appui long,
  le champ du numéro en colle un. **Add call**, pendant un appel, l’ouvre une fois Erevos déverrouillé.
- **Messagerie vocale :** clavier vide, maintiens **1** (marqué oo) pour appeler ta messagerie vocale, avec la SIM
  choisie au-dessus d’**Appeler**. Si la SIM n’a pas de numéro de messagerie, le Téléphone le dit : ton opérateur le
  donne. Là où ton opérateur envoie les messages en enregistrements (messagerie vocale visuelle), **Messagerie
  vocale** s’affiche à côté de **Favoris** : chaque message avec qui l’a laissé, quand, sa durée, et ses mots quand
  ils sont venus. **▶** le lit, **■** l’arrête ; un appui sur la ligne propose **Rappeler**, **Envoyer un SMS** et
  **Supprimer ce message vocal**. **Appeler la messagerie vocale** en haut l’appelle. Erevos les lit depuis le
  stockage d’Android et n’en garde aucune copie ; Erevos verrouillé, l’onglet ne s’affiche pas.
- **Numérotation rapide :** clavier vide, maintiens une touche de 2 à 9 pour appeler son numéro. Une touche sans
  numéro te laisse en choisir un : tape un nom ou un numéro et appuie sur le contact, ou **Utiliser** le numéro
  tapé. Sous **Téléphone** → **Réglages**, **Numérotation rapide** montre les huit touches ; appuie sur une pour la
  changer ou la vider. La numérotation rapide est gardée chiffrée dans l’espace, et marche avec Erevos déverrouillé.
- **Réglages d’appel :** sous **Téléphone** → **Réglages**, **Réglages d’appel** ouvre les écrans d’Android lui-même
  pour ce que ton opérateur garde des appels de chaque SIM : **Renvoi, double appel et ton numéro** et **Numéro de
  messagerie vocale** ; avec deux SIM, appuie d’abord sur la SIM. Sous **Demander à ton opérateur**, chaque bouton
  compose le code du réseau (**Vérifier** le renvoi \`*#21#\`, **Tout désactiver** \`##002#\` ; double appel
  \`*#43#\`, **Activé** \`*43#\`, **Désactivé** \`#43#\` ; affichage de ton numéro \`*#31#\`), et la réponse
  s’affiche dans un message d’Android. Pour masquer ton numéro pour un seul appel, tape \`#31#\` avant le numéro.
- **Deux SIM :** au-dessus d’**Appeler**, appuie sur la SIM avec laquelle appeler ; la première fois, **Choisir la SIM**
  demande à Android de laisser Erevos les voir. Un numéro que tu appelles sans choisir demande **Appeler avec**
  laquelle. Erevos garde la SIM que tu as utilisée pour chaque numéro, scellée dans l’espace, et l’appelle avec la même
  la fois suivante. L’écran d’appel nomme la SIM de chaque appel.
- **Les appels :** sous **Téléphone**, **Récents** liste l’historique des appels d’Android, les plus récents en premier,
  sous chaque jour : qui, quel type d’appel, sur quelle SIM, et comment. **Tous**, **Manqués**, **Entrants**,
  **Sortants** et, dès qu’un appel a été bloqué, **Bloqués** le filtrent ; avec deux SIM, **SIM 1** ou **SIM 2** garde
  les appels de cette SIM. Les appels successifs avec le même numéro s’affichent une fois, avec leur nombre. **☏**
  rappelle ; un appui sur la ligne montre ses appels, la durée de chacun, et **Appeler** (avec deux SIM, un pour
  chacune), **Envoyer un SMS**, **Ajouter aux contacts** pour un numéro qui n’est aucun de tes contacts, et **Modifier
  le numéro avant d’appeler**. Une fois vus là, les appels manqués quittent la notification d’Android, et cette
  notification ouvre **Récents**.
- **Supprimer des appels :** dans les appels de la ligne, **Supprimer cet appel** (ou **Supprimer ces 3 appels**, pour
  une ligne qui en a plusieurs) les supprime de l’historique des appels d’Android, **Supprimer** à côté de l’un de
  plusieurs supprime seulement celui-là, et **Supprimer tous les appels avec ce numéro**, quand il y en a d’autres, les
  supprime tous, les plus anciens aussi. **Annuler** s’affiche d’abord quelques secondes ; d’ici là, ils sont seulement
  masqués.
- **Favoris :** les contacts avec une étoile dans les contacts de ton téléphone, avec leurs photos. Un appui appelle le
  numéro par défaut du contact, ou demande lequel quand il y en a plusieurs et qu’aucun n’est par défaut ; en appui
  long, il les montre tous.
- **Plus pour un numéro :** dès qu’un numéro est tapé sur le clavier, **⋯** à côté propose **Ajouter aux contacts**, **Ajouter à un contact existant** (tes contacts s’ouvrent : touche celui auquel ajouter le numéro, ou crées-en un nouveau), **Envoyer un SMS** et **Copier le numéro**. Dans **Récents**, les appels de la ligne proposent la même chose, et **Ouvrir le contact** pour un numéro qui est l’un de tes contacts. Dans **Favoris**, un appui long sur un contact montre ses numéros, chacun avec **Envoyer un SMS** et **Copier le numéro**, et **Ouvrir le contact**. Avec Erevos verrouillé, le Téléphone ne fait qu’appeler et copier un numéro : pas de SMS, pas de changement dans tes contacts. Chaque touche, **Appeler** et la touche Entrée du clavier font vibrer brièvement ; **Réglages** → **Apparence** → **Vibrer au toucher** l’éteint. Voir [Apparence](#appearance).
- **Appels Wi-Fi et voix HD :** l’écran d’appel le dit sous le nom quand un appel passe par le Wi-Fi ou en voix HD, et
  **Récents** le dit pour chaque appel.
- **Blocage :** sous **Téléphone** → **Réglages**, **Bloquer le démarchage** bloque les appels des numéros que certains
  pays réservent au démarchage : la France (01 62, 01 63, 02 70, 02 71, 03 77, 03 78, 04 24, 04 25, 05 68, 05 69, 09 48,
  09 49 et 09 475 à 09 479, selon la décision 2022-1583 de l’ARCEP), l’Espagne (400, depuis le 17 octobre 2026), le
  Chili (809), l’Inde (140) et le Brésil (0303, que les appelants là-bas peuvent omettre depuis août 2025). Les autres
  pays ne réservent pas de tels numéros, ou Erevos n’en est pas sûr, donc rien n’est bloqué pour eux. Sous **Numéros
  commençant par**, tape le début d’autres numéros à bloquer, avec l’indicatif de pays (+33 162) ou comme tu le composes
  ici (0162), et appuie sur **Bloquer** ; **Retirer** en enlève un. Ceux-ci ne bloquent jamais un numéro des contacts de
  ton téléphone. Un appel bloqué ne sonne pas et ne laisse aucune notification ; il s’affiche dans **Récents**, sous
  **Bloqués**. Android demande une fois si Erevos peut filtrer les appels (**Laisser Erevos filtrer les appels**) : sans
  cela, un appel bloqué sonne un instant avant qu’Erevos y mette fin. Ce qui est bloqué est le même dans chaque espace,
  si bien que cela ne dit rien d’un autre, et c’est gardé sur le téléphone sans aucun nom.
- **Numéros bloqués :** sous **Téléphone** → **Réglages**, **Numéros bloqués** est la liste d’Android lui-même, la même
  que **Réglages** → **Téléphone et SMS** → **SMS** → **Numéros bloqués** : tape un numéro et appuie sur **Bloquer**, ou
  appuie sur l’un pour le débloquer. Dans **Récents**, les appels d’une ligne affichent **Bloquer ce numéro** ou
  **Débloquer ce numéro**, avec **Annuler**. Android rejette leurs appels avant qu’ils sonnent, et leurs SMS et MMS.
  Chaque espace voit la même liste.
- **Numéros inconnus et spam :** pour un numéro qui n’est pas dans tes contacts, l’écran d’appel dit sous le numéro
  d’où il vient (son pays et son drapeau, et la ville d’un fixe quand le numéro l’indique) et si c’est un mobile, un
  fixe, un numéro gratuit ou surtaxé : lu à partir du numéro seul, sur le téléphone. Sous **Téléphone** →
  **Réglages**, **Liste de spam** télécharge entière une liste de numéros connus pour le spam depuis l’adresse
  https:// que tu tapes : un numéro par ligne avec son indicatif de pays, ou le début de numéros suivi de \`*\`,
  puis le genre d’appels. Erevos n’en a pas à lui ; choisis une liste de confiance. Sans Tor, le serveur de la liste
  voit l’adresse internet du téléphone, et Erevos le dit d’abord. L’écran d’appel d’un numéro de la liste affiche
  **Spam possible** ; **Appels de spam en silencieux** les fait sonner sans bruit (Android 10 et plus), jamais ceux
  d’un contact. Dans **Récents**, **Signaler comme spam** sur un numéro qui n’est pas dans tes contacts l’ajoute sur
  ce téléphone seulement, et **Pas du spam** l’enlève ; **Oublier mes signalements** les efface. Aucun numéro n’est
  jamais recherché nulle part. **La télécharger à nouveau chaque semaine** la fait revenir de la même adresse quand
  elle a une semaine, avec Erevos déverrouillé, par Tor quand la voie Tor de l’espace est activée ; c’est désactivé
  tant que tu ne l’actives pas.
- **Un groupe de contacts pour un temps :** sous **Téléphone** → **Réglages**, **Bloquer un groupe de contacts** liste
  les groupes (les libellés) des contacts de ton téléphone. **Bloquer** à côté de l’un bloque les appels de ses contacts
  **Pendant une heure**, **Jusqu’à demain matin** (7:00) ou **Jusqu’à ce que je lève le blocage** ; la ligne sous le
  groupe dit jusqu’à quand, et **Lever** y met fin plus tôt. Un tel appel est bloqué comme les autres : il ne sonne pas,
  et s’affiche dans **Récents**, sous **Bloqués**. Erevos ne fait que lire les groupes, et garde l’identifiant du groupe
  et l’heure, pas son nom. Tant qu’un groupe est bloqué, l’écran **Téléphone** le dit en haut, jusqu’à quand, avec
  **Lever**.

**Pourquoi :** un appel est filtré même avec Erevos verrouillé, donc ce qui est bloqué ne peut pas être scellé dans un
espace ; et, gardé de la même façon pour chaque espace, cela ne montre rien d’aucun d’eux.

- **Le mot de passe d’Erevos :** l’écran **Téléphone**, avec le clavier, les appels et les favoris, est derrière lui
  comme le reste d’Erevos. Seul l’écran d’appel ne l’est pas, sauf si tu laisses le Téléphone s’ouvrir sans lui : sous
  **Téléphone** → **Réglages**, **Ouvrir le Téléphone sans le mot de passe** (désactivé au début, et affiché seulement
  tant qu’Erevos a un mot de passe). Avec Erevos verrouillé, l’icône du Téléphone, un lien tel: et la notification d’un
  appel manqué ouvrent alors le clavier, **Récents** et **Favoris**, qu’Android garde pour toute app de téléphone, avec
  les noms des contacts du téléphone seulement : jamais ceux gardés seulement dans Erevos ni ceux des discussions
  masquées, et aucune SIM gardée pour un numéro. Là, tu peux appeler, rien de plus : pas de suppression, de blocage, de
  SMS ni d’ajout aux contacts. **Ouvrir Erevos** en haut affiche l’écran du mot de passe, tout comme l’icône propre
  d’Erevos après qu’Erevos a été en arrière-plan plus de 30 secondes, sauf si c’est un appel passé de là qui l’a mis en
  arrière-plan. **Remettre le Téléphone derrière le mot de passe** le désactive.
- **Si Erevos ne devient pas l’app Téléphone :** comme pour les SMS, Android 15 et plus récent peut l’empêcher pour une
  app installée depuis un navigateur. Sous **Réglages**, appuie sur **Ouvrir les applis par défaut** → **Appli de
  téléphone** → Erevos. Si Android parle d’un paramètre restreint, ouvre les **infos sur l’appli Erevos**, appuie sur
  **⋮** en haut à droite → **Autoriser les paramètres restreints**, et choisis de nouveau Erevos. **Autoriser les appels
  et les contacts** s’affiche tant qu’Android bloque encore les appels, l’historique des appels ou les contacts.
- **Après un redémarrage du téléphone :** tant que tu n’as pas déverrouillé le téléphone pour la première fois, c’est
  l’écran d’appel d’Android lui-même qui répond.
- **Ce qu’est un appel téléphonique :** un appel téléphonique ordinaire, comme avec toute app de téléphone : l’opérateur
  téléphonique le transporte et peut écouter. Les appels à tes contacts Erevos depuis une discussion sont autre chose :
  chiffrés de bout en bout, par internet.

## Contacts {#contacts}

Sur Android, **Contacts** dans le menu montre les contacts du téléphone : ceux des contacts d’Android lui-même, que tes
autres apps utilisent aussi, donc il n’y a rien à importer. Android demande une fois si Erevos peut les lire et les
modifier (**Autoriser les contacts**). Ils s’ouvrent aussi depuis la personne en haut de l’écran d’accueil, et ont leur
propre icône dans les apps du téléphone, **Contacts**, violette avec une personne sur la marque d’Erevos, qui les ouvre
derrière le verrou d’Erevos : avec un mot de passe, une fois que tu l’as tapé.

- **Trouver quelqu’un :** **Rechercher des contacts** cherche dans tous les champs : noms, numéros (quelle que soit leur
  écriture, avec ou sans l’indicatif de pays), e-mails, adresses, l’entreprise, l’anniversaire et la note. **Favoris**
  ne montre que les contacts avec une étoile.
- **Un contact :** appuie sur l’un pour tout voir. Appuie sur un numéro pour l’appeler{~, ou sur **SMS** à côté pour lui
  écrire dans Erevos} ; appuie sur un e-mail ou une adresse pour l’ouvrir. **Ajouter aux favoris** en haut lui donne une
  étoile, dans les contacts d’Android, si bien que l’app de téléphone le liste aussi parmi les favoris.
- **Nouveau contact** et **Modifier** : prénom et nom, entreprise et poste, autant de numéros, d’e-mails et d’adresses
  qu’il te faut, chacun avec son type (**Mobile**, **Domicile**, **Travail**, **Autre**), un anniversaire
  (jour/mois/année, ou jour/mois) et une note. Un nouveau contact est gardé **Seulement sur ce téléphone**, ou dans un
  compte avec lequel le téléphone synchronise les contacts (Google), comme tu le choisis. Ce qu’Erevos ne montre pas
  d’un contact, comme les détails propres d’une autre app, reste tel quel.
- **Photo :** appuie sur l’image en haut d’un contact pour **Choisir une photo** parmi les photos du téléphone,
  **Prendre une photo** avec l’appareil photo, ou **Retirer la photo**. Tu la recadres en carré, et Erevos la redessine,
  si bien que rien de ce que disait la photo en plus de son image (un lieu, un téléphone) n’est gardé. Elle est gardée
  avec le contact dans les contacts d’Android, où le téléphone l’affiche quand il appelle.
- **Sonnerie :** sur un contact, **Choisir la sonnerie** ouvre le sélecteur propre d’Android, avec les sons du téléphone
  et ceux que tu as ajoutés ; le téléphone sonne avec elle quand ce contact appelle. **Sonnerie par défaut**, là,
  redonne celle du téléphone.
- **Fichiers .vcf :** **Importer depuis un fichier .vcf** dans le menu de Contacts lit un fichier vCard qu’un autre
  téléphone ou une autre app a enregistré (dans n’importe laquelle de ses versions, même celle des vieux téléphones
  grecs) et enregistre ceux qui ne sont pas encore sur le téléphone, avec leurs photos et leurs groupes, sur ce
  téléphone seulement ou dans un compte. **Enregistrer en fichier .vcf**, là, enregistre les contacts affichés (tous,
  les favoris, un groupe, ou ce que la recherche a trouvé) en un seul fichier, dans un dossier que tu choisis ; sur un
  contact, il enregistre celui-là. Le fichier est hors d’Erevos et non scellé : quiconque l’a peut lire les contacts.
- **Codes QR :** **Code QR** sur un contact montre sa vCard sous forme de code QR, que l’appareil photo d’un autre
  téléphone lit comme un contact à ajouter : son nom, ses numéros, e-mails, adresses et sa note, sans sa photo (une
  longue note ou beaucoup d’adresses sont laissées de côté pour tenir). Quiconque le voit peut le lire. **Lire le code
  QR d’un contact** dans le menu en lit un sur une photo que tu prends ou choisis, ici sur le téléphone, et commence
  avec lui un nouveau contact, enregistré seulement quand tu l’enregistres. Le code QR Erevos de quelqu’un en commence
  un avec son ID {=Erevos}.
- **Doublons :** **Trouver les doublons** dans le menu liste les contacts qui semblent être la même personne gardée deux
  fois : le même nom (ses mots dans n’importe quel ordre), numéro ou e-mail. **Fusionner** garde le plus complet d’entre
  eux, avec chaque numéro, e-mail et adresse des autres, leurs notes, et leur photo, sonnerie, étoile et groupes quand
  il n’en a pas, et supprime les autres ; **Tout fusionner** le fait pour chaque série. **Pas la même personne** masque
  une série jusqu’à ce que tu rouvres la liste.
- **Anniversaires :** la puce **Anniversaires** sous la recherche liste les contacts qui ont un anniversaire, le
  prochain en premier, avec le nombre de jours restants et l’âge qu’ils vont avoir. **Rappels d’anniversaire** dans le
  menu (désactivé au début) met une notification le matin de chacun, à partir de 9:00, même avec Erevos fermé ; sur
  l’écran de verrouillage, elle dit seulement qu’il y a un anniversaire. Ce sont seulement les anniversaires des
  contacts du téléphone, jamais ceux des contacts gardés seulement dans Erevos.
- **Contacts de la SIM** dans le menu lit les contacts des cartes SIM du téléphone et copie ceux qui ne sont pas encore
  sur le téléphone (tous choisis au début) dans les contacts d’Android, sur ce téléphone seulement ou dans un compte. La
  SIM garde les siens.
- **Seulement dans Erevos :** sous **Enregistré dans**, un nouveau contact peut plutôt être gardé **Seulement dans
  Erevos** : scellé dans cet espace comme ses discussions, jamais dans les contacts d’Android, si bien qu’aucune autre
  app ni aucun compte ne le voit, et les autres apps ne montrent que son numéro ; l’écran d’appel d’Erevos montre son
  nom tant qu’Erevos est déverrouillé. Il a un cadenas dans la liste, et la puce **Seulement dans Erevos** ne montre que
  ceux-là. **Garder seulement dans Erevos** sur un contact du téléphone l’y déplace, avec sa photo et son étoile, et le
  supprime des contacts du téléphone ; **Déplacer dans les contacts du téléphone** l’en ressort. Sa photo est scellée
  avec lui. Les groupes, sonneries et rappels d’anniversaire sont ceux d’Android, il n’en a donc aucun. Un appel{~ ou un
  SMS} vers lui passe quand même par le téléphone, et s’affiche dans l’historique des appels{~ et les SMS} du téléphone
  comme n’importe quel autre. Une sauvegarde Erevos contient ces contacts, scellés.
- **Dans les discussions masquées :** **Contacts** en haut des discussions masquées ouvertes liste leurs propres
  contacts, gardés seulement là et scellés avec elles : ils ne s’affichent nulle part ailleurs, pas même dans les
  contacts de l’espace, et l’écran ne montre plus rien une fois les discussions masquées fermées. Un nouveau contact là
  est toujours l’un des leurs. On peut donner une photo à l’un d’eux, car les discussions masquées restent ouvertes
  pendant que tu la choisis ou la prends. Leur menu n’a que ce qui est à elles : **Importer depuis un fichier .vcf**
  garde les contacts d’un fichier avec elles, scellés, jamais dans les contacts du téléphone ; **Enregistrer en fichier
  .vcf** enregistre ceux qui sont affichés, ou un seul depuis sa fiche, dans un dossier que tu choisis (hors d’Erevos et
  non chiffré) ; **Lire le code QR d’un contact** commence un de leurs contacts. Un ID {=Erevos} tapé ou lu là ajoute la
  personne aux discussions masquées, jamais à celles de l’espace. En appeler un par l’app de téléphone ferme les
  discussions masquées dès qu’Erevos est absent plus de 30 secondes, et s’affiche dans son historique des appels.
- **ID {=Erevos} :** l’ID {=Erevos} d’un contact est le lien de contact que montre son {=Erevos}, sous **Copier mon lien de
  contact** ou en tant que son code QR. Sur la fiche d’un contact, ou sous **ID {=Erevos}** quand tu en écris un, colle-le,
  ou lis-le avec **Photographier le code QR** ou **Choisir une photo du code QR** : **Ajouter à Erevos** (ou
  **Enregistrer**) ajoute la personne à tes discussions Erevos, qui s’ouvrent avec elle, et y associe le contact, et la
  discussion prend le nom du contact si elle n’en a pas à elle. Un contact qui est un contact Erevos montre le début de
  sa clé comme **ID {=Erevos}**.
- **Contacts Erevos :** un contact qui est la même personne que l’un des contacts Erevos de tes discussions s’affiche
  comme une seule fiche avec lui : par un numéro associé à lui dans Erevos, par son ID {=Erevos}, ou avec **Choisir dans
  mes discussions Erevos** sur sa fiche, une association scellée dans l’espace, jamais dans les contacts d’Android
  (**Pas ce contact Erevos** l’annule). La fiche a alors **Message**, **Appeler** et **Vidéo**, chiffrés de bout en bout
  par Erevos au lieu de passer par l’opérateur téléphonique. Un contact des discussions qui n’est aucun contact a sa
  propre fiche, avec le bouclier, où **Ajouter aux contacts** en crée un et **Associer à un de mes contacts** l’associe
  à l’un de ceux que tu as, dont la fiche le montre alors ; la puce **Contacts Erevos** les liste tous. Un contact
  Erevos sans nom à lui prend le nom du contact qui lui est associé, au moment de l’association ou quand la fiche de ce
  contact s’ouvre ; un nom que tu lui as donné dans Erevos reste, et un nom que tu as vidé revient alors depuis le
  contact. Dans les discussions masquées, ce sont les propres contacts des discussions masquées, et leur discussion
  s’ouvre là.
- **Historique :** la fiche d’un contact liste {~ses derniers appels dans l’historique des appels du téléphone, ses SMS et|}
  ses messages dans Erevos, les plus récents en premier ; appuie sur l’un pour {~rappeler, écrire un SMS ou |}ouvrir la
  discussion.{~ Les appels s’affichent une fois que tu laisses Erevos lire l’historique des appels (**Afficher les
  appels**). Erevos ne les lit que pour les afficher, et n’en garde aucune copie.}
- **Autres apps :** l’**Ajouter aux contacts** d’une autre app (un numéro dans l’app de téléphone, un e-mail dans la
  messagerie) peut s’ouvrir dans Erevos : un nouveau contact avec ce que cette app a donné, ou la liste pour appuyer sur
  le contact auquel l’ajouter. Une app qui montre ou modifie un contact peut aussi l’ouvrir dans Erevos, derrière le
  verrou d’Erevos. Android demande quelle app utiliser ; choisis Erevos. Une app qui te demande de choisir un contact,
  ou un numéro, un e-mail ou une adresse, n’obtient que celui sur lequel tu appuies, parmi les contacts du téléphone :
  ceux gardés seulement dans Erevos n’y apparaissent jamais.
- **Supprimer** retire le contact du téléphone, de chaque compte où il est gardé ; un contact gardé seulement dans
  Erevos, d’Erevos.
- **Groupes :** **Groupes** dans le menu de Contacts (les trois points) liste les groupes d’Android lui-même, comme
  Famille ou Travail, avec combien de contacts dans chacun, et en crée de nouveaux. Ouvres-en un pour **Ajouter des
  contacts**, en retirer un avec **×**, le **Renommer** ou **Supprimer le groupe** (ses contacts restent). Sur un
  contact, **Choisir les groupes** le met dans des groupes ou l’en retire. Les puces sous la recherche montrent les
  contacts d’un groupe. Un groupe est gardé dans un compte, comme ses contacts : un contact ne le rejoint que s’il est
  gardé dans ce compte aussi.

## Verrou par mot de passe {#lock}

Sous **Réglages** → **Confidentialité et sécurité** → **Verrou et second mot de passe**, **Verrouiller à l’ouverture
d’Erevos** a deux choix : **Pas de verrou** et **Mot de passe**.

1. Appuie sur **Mot de passe**, tape-le deux fois (au moins 4 caractères) et appuie sur **Enregistrer**.
2. À partir de là, Erevos le demande à chaque ouverture, et de nouveau après 30 secondes en arrière-plan.
3. **Changer le mot de passe** le change, et **Verrouiller maintenant** verrouille Erevos tout de suite.

- **Une phrase, pas un code court :** ce qui vérifie le mot de passe est gardé dans le magasin de clés du téléphone,
  une copie de son stockage ne suffit donc pas pour essayer des mots de passe. Mais quelqu’un qui casse la sécurité du
  téléphone lui-même, comme le font des outils d’investigation sur certains téléphones, pourrait essayer sur ses
  propres ordinateurs, et un code de 6 chiffres, un million de combinaisons, tombe en quelques jours. Une phrase de 4
  ou 5 mots, non. Sous un nouveau mot de passe court, ou un code de discussions masquées, Erevos le dit, et ne
  l’accepte qu’après **L’utiliser quand même**. Qui a une sauvegarde et son mot de passe peut faire les mêmes essais
  sur elle : c’est là qu’un code court est le plus faible.
- **Verrouillé, il reçoit encore :** quand Erevos se verrouille, l’écran du mot de passe passe devant l’espace ouvert,
  qui continue derrière lui : messages et appels arrivent encore, avec leurs notifications, et un appel s’affiche
  par-dessus l’écran du mot de passe. Ses écrans se ferment, les discussions masquées aussi, et l’écran d’appel ne
  montre plus les noms de ses contacts. Son mot de passe le rouvre ; le mot de passe d’un autre espace le ferme d’abord,
  sans rien en garder en mémoire.
- [~] **Seulement les SMS :** quand Erevos est verrouillé, l’icône SMS, le bouton **SMS** du widget et la notification d’un
  nouveau SMS demandent encore le mot de passe, mais n’ouvrent ensuite que les SMS : la liste des conversations SMS du
  téléphone, chacune sur sa propre ligne, les conversations elles-mêmes, **Archivées**, **Spam** et **Corbeille**, et
  **Nouveau SMS**. Rien d’autre de l’espace ne s’affiche. Tout le reste, un contact, une discussion, **Réglages**,
  l’icône d’Erevos elle-même ou le cadenas orange **Tout déverrouiller** en haut, redemande le mot de passe, puis ouvre
  tout l’espace. Ainsi un code arrivé par SMS peut se lire avec quelqu’un à côté de toi, et le reste d’Erevos reste
  fermé.
- **Seulement les contacts :** de la même façon, l’icône Contacts, le bouton **Contacts** du widget et la notification
  d’un anniversaire demandent le mot de passe, puis n’ouvrent que les contacts : leur liste, la fiche d’un contact
  (sans tes discussions ni tes appels avec lui), **Modifier**, les groupes, les doublons, la SIM et l’importation.
  **Appeler** ouvre toujours le numéroteur du téléphone. Une discussion{~, un SMS|}, **Réglages** ou le cadenas orange
  **Tout déverrouiller** en haut redemande le mot de passe, puis ouvre tout l’espace. Une autre icône, le widget ou une
  notification, quand {~seuls les SMS ou |}seuls les contacts sont ouverts, demande le mot de passe comme quand Erevos est
  verrouillé, puis ouvre ce qu’elle désigne : l’icône Contacts seulement les contacts, {~l’icône SMS seulement les SMS,
  |}l’icône d’Erevos elle-même tout l’espace.

- **Voir ce que tu tapes :** chaque champ pour un mot de passe, un PIN ou un jeton, ici et partout dans Erevos, a un
  œil au bout : touche-le pour voir ce que tu tapes, et encore pour le masquer. Il est masqué de nouveau chaque fois
  que le champ réapparaît, et sur Android le clavier est prié de ne pas l’apprendre.
- **Mots de passe erronés :** après 5 essais erronés, chaque essai suivant te fait attendre, 30 secondes au début et
  deux fois plus longtemps à chaque fois, jusqu’à une heure. Le compte survit à un redémarrage. L’attente suit
  l’horloge propre du téléphone depuis son allumage, que personne ne peut régler, si bien qu’avancer la date et
  l’heure n’y met pas fin ; si le téléphone est éteint puis rallumé pendant une attente, il la refait depuis son
  début, car le temps déjà attendu ne peut pas être connu. Dans l’app web et sur un ordinateur, c’est pareil tant
  qu’Erevos reste ouvert, et cela repart de son début quand Erevos s’ouvre de nouveau.
- **Ce qui est scellé :** les contacts de chaque espace, les clés de ses conversations, ses messages, ses réglages de
  relais et son apparence sont gardés sur le téléphone scellés avec une clé que seul son mot de passe ouvre.
- **La liste tout de suite :** l’écran d’accueil garde une copie scellée de ses premières lignes, si bien que la liste
  s’affiche dès que l’espace s’ouvre, puis se met à jour. Elle a toujours la même taille, si bien qu’elle ne dit à
  personne combien il y a de discussions ni quels espaces sont utilisés, et elle ne contient jamais ce qu’a dit un
  message éphémère.

**Pourquoi :** chaque mot de passe essayé coûte exprès du temps et beaucoup de mémoire (PBKDF2, puis Argon2id), pour que
celui qui copie ce que garde le téléphone ne puisse pas essayer des mots de passe rapidement ; et quelqu’un qui tient le
téléphone attend plus longtemps après chaque essai erroné. Le compte est unique pour tout le téléphone, gardé d’un
redémarrage à l’autre, car l’écran du mot de passe vient avant l’ouverture de tout espace, et l’attente est mesurée là
où changer l’horloge ne peut pas la raccourcir.

> Il n’y a aucun moyen de récupérer un mot de passe oublié : rien n’est stocké qui pourrait ouvrir les données sans lui.
> Seule une empreinte digitale ou le visage, tant que c’est activé, ouvre encore le premier espace (voir ci-dessous).

### Captures d’écran

Avec le verrou par mot de passe activé, Android tient Erevos à l’écart des captures d’écran, des enregistrements d’écran
et des applis récentes : là, le dernier écran d’Erevos apparaît vide, si bien que celui qui tient un moment le téléphone
déverrouillé n’y voit pas tes discussions. Sous **Réglages** → **Confidentialité et sécurité** → **Captures d’écran**,
**Désactiver** permet de nouveau les captures d’écran (pour en envoyer une, par exemple), et **Activer** rétablit la
protection. Tant qu’il est activé, les discussions masquées en restent aussi à l’écart, même dans un espace sans verrou par mot de
passe ; désactivé, les captures fonctionnent aussi dans ces discussions. Le réglage est celui du téléphone, le même dans chaque espace. Sur un ordinateur et dans l’app web, il n’existe
pas.

**Pourquoi :** sans cela, le dernier écran d’Erevos reste comme une image parmi les applis récentes jusqu’à ce qu’Erevos
s’ouvre de nouveau, donc les discussions masquées en restent toujours à l’écart, pour ne jamais s’y montrer sans leur
code PIN. Le réglage est le même dans chaque espace pour qu’il ne dise rien de l’espace qui s’est ouvert.

### Empreinte digitale ou visage

Sur Android 11 et plus récent, avec une empreinte digitale ou un visage configuré dans les réglages du téléphone, Erevos
peut aussi s’ouvrir avec. C’est désactivé tant que tu ne l’actives pas.

1. Avec le verrou par mot de passe activé, sous **Empreinte digitale ou visage**, appuie sur **Activer**.
2. Tape le mot de passe de l’espace où tu te trouves, appuie sur **Activer**, et touche le capteur (ou regarde le
   téléphone).
3. À partir de là, l’écran du mot de passe a un bouton **Empreinte digitale ou visage**. Le mot de passe fonctionne
   toujours aussi, et **Désactiver** le désactive.

- **Seulement l’espace du premier mot de passe :** une empreinte n’ouvre jamais l’espace d’un second mot de passe, ni
  les discussions masquées. Activée dans l’espace qu’ouvre un second mot de passe, elle n’ouvre rien : la première fois
  qu’on l’essaie, elle se désactive d’elle-même, et le mot de passe ouvre Erevos. Le réglage a le même aspect dans
  chaque espace.
- **Sous la contrainte :** quelqu’un qui te retient peut appuyer ton doigt sur le téléphone, ou le tenir devant ton
  visage. Si cela peut arriver, laisse-la désactivée : il lui faut alors un mot de passe, et tu peux lui donner le
  second.
- **Comment c’est gardé :** la clé du premier espace est scellée par une clé dans le matériel sécurisé du téléphone
  (l’Android Keystore) qui ne fonctionne que juste après une vérification forte de l’empreinte ou du visage, une fois
  pour chaque utilisation. Ajouter ou retirer une empreinte ou un visage fait abandonner cette clé par Android : c’est
  alors désactivé, et tu l’actives de nouveau. Rien ne quitte le téléphone.
- **Quel visage :** un visage ne compte que là où Android classe son déverrouillage par le visage comme fort, comme sur
  le Pixel 8 et plus récent ; ailleurs, c’est l’empreinte.
- **Les mots de passe erronés** sont comptés comme avant : une empreinte ne change pas le compte.
- **Pas sur un ordinateur ni sur le web :** ce n’est proposé que sur Android. Désactiver le verrou le désactive aussi.

**Pourquoi :** un doigt est plus facile à forcer qu’un mot de passe, et quiconque dont le téléphone connaît le doigt ou
le visage pourrait l’utiliser, donc cela n’ouvre jamais l’espace d’un second mot de passe ni les discussions masquées.
Activé dans un autre espace, il garde une clé qui n’ouvre rien, de la même forme, si bien que ce qui est stocké ne
montre pas dans quel espace il a été activé.

## Second mot de passe {#second}

Si quelqu’un te force à ouvrir Erevos, tape le second mot de passe au lieu du tien. Il ouvre un Erevos séparé et vide,
avec ses propres contacts, son propre relais et sa propre apparence. Tes vraies discussions restent cachées, et rien
dans l’app ne montre qu’elles existent.

1. Avec le verrou par mot de passe activé, appuie sur **Définir le second mot de passe**.
2. Tape-le deux fois et appuie sur **Enregistrer**. Il doit être différent de ton propre mot de passe.

- **L’apparence :** le second espace commence avec l’apparence de l’espace où il a été défini, pour ne pas se faire
  remarquer.
- **Un seul à la fois :** définir de nouveau un second mot de passe remplace le précédent. **Supprimer le second mot de
  passe** le supprime.
- **Depuis la recherche :** dans un espace ouvert, tape le mot de passe d’un autre espace dans **Rechercher dans les
  discussions** et appuie sur Entrée : l’espace ouvert se ferme, sans que rien n’en reste, et l’autre s’ouvre, comme
  avec **Verrouiller maintenant** et son mot de passe. Cela prend le même temps quoi que tu tapes, donc ce temps ne
  montre pas s’il existe un autre espace. Un mauvais mot de passe, ou celui de l’espace ouvert, n’est qu’une recherche
  ; le mot de passe de panique ne marche que sur l’écran du mot de passe.
- **Y déplacer une discussion :** dans les **Détails** d’une discussion, appuie sur **Déplacer dans un autre espace**,
  tape le mot de passe de l’autre espace et appuie sur **Déplacer**. La discussion y va avec ses messages, son nom, son
  image et son apparence, et les discussions importées dedans, chiffrée avec la clé de cet espace, et cet espace reste
  fermé. Le numéro de sécurité reste le même, et le téléphone du contact est aussitôt informé qu’il doit désormais y
  écrire. La ligne s’affiche dans chaque espace, et le mot de passe est essayé comme dans la recherche : un mauvais, ou
  celui de l’espace ouvert, ne déplace rien. Une discussion avec quelqu’un avec qui l’autre espace a déjà sa propre
  discussion reste où elle est. Qui lit l’autre espace avec un outil d’analyse forensique pourrait voir que la
  discussion vient d’ailleurs : son contact la connaît toujours par la clé de cet espace.
  Si cet espace n’a pas encore de relais, Erevos propose celui de cet espace-ci : **Déplacer avec le relais de cet
  espace** déplace la discussion et donne ce relais à l’autre espace, qui le garde, et le relais peut alors savoir que
  les deux espaces sont sur un même téléphone.
- **Discrétion :** pour ta confidentialité, l’app ne montre jamais si un second mot de passe est défini. Dans l’app web
  avec les notifications quand l’app est fermée activées, le nombre sur l’icône d’Erevos reste tant qu’Erevos est
  fermé : s’il ne correspond pas à l’espace que tu ouvres, il peut en trahir un autre (**Nombre sur l’icône** le
  désactive).

## Discussions masquées {#hidden}

Chaque espace a 4 emplacements pour des discussions masquées, chacun ouvert seulement avec son propre code PIN, et elles
n’apparaissent jamais parmi tes autres discussions. Il n’y a aucun bouton pour elles nulle part. Chaque emplacement peut
contenir une discussion ou plusieurs, donc 2 espaces ont 8 emplacements.

**Pourquoi :** chaque emplacement a déjà son propre code PIN, donc une discussion seule dans un emplacement a sa propre
clé, et un emplacement peut aussi contenir plusieurs discussions sous un même code PIN. Le nombre d’emplacements est
fixe pour deux raisons :

- **Pour que rien ne se voie.** Les 4 emplacements existent dès le premier démarrage, remplis de données aléatoires tant
  qu’ils ne sont pas utilisés. Celui qui te force à ouvrir le téléphone, ou copie ce qu’il garde, ne peut pas savoir si
  tu as des discussions masquées, ni combien. Avec une clé pour chaque discussion, les fichiers scellés grossiraient à
  chaque nouvelle discussion masquée, et trahiraient leur nombre.
- **Pour que ça reste rapide.** Un code PIN tapé dans la recherche est essayé sur chaque emplacement, et chaque essai
  est lent exprès (Argon2id, qui prend beaucoup de mémoire et de temps, pour que les codes PIN ne puissent pas être
  devinés rapidement). Avec 4 emplacements, l’ouverture reste courte et prend toujours le même temps, si bien que le
  temps ne dit pas non plus combien sont utilisés.

Le nombre pourra être augmenté plus tard sans rien perdre, au prix d’une ouverture un peu plus lente ; le diminuer
supprimerait ce que contiennent les emplacements retirés.

1. Commence un emplacement de l’une de deux façons : sous **Réglages** → **Confidentialité et sécurité** → **Discussions
   masquées**, choisis **Emplacement 1** à **Emplacement 4**, appuie sur **Définir le code PIN des discussions
   masquées**, tape-le deux fois et appuie sur **Enregistrer** ; ou ouvre les **Détails** d’une discussion, appuie sur
   **Déplacer dans les discussions masquées**, tape un code PIN de 4 caractères ou plus, appuie sur **Nouvelles
   discussions masquées**, choisis un emplacement, puis **Créer et déplacer**. Retiens les emplacements que tu
   utilises : par discrétion, Erevos ne peut pas dire lesquels sont libres.
2. Pour les ouvrir, tape le code PIN dans **Rechercher dans les discussions** sur l’écran d’accueil et appuie sur Entrée
   (la touche de recherche du clavier). Ou maintiens **Nouvelle discussion** un instant : un champ pour le code PIN
   s’ouvre, avec une courte vibration sur Android, le même dans chaque espace ; tape-le et appuie sur **Ouvrir**. Il n’ouvre que l’emplacement qui a ce code
   PIN. Un code PIN erroné n’est qu’une recherche, ou ne fait que fermer le champ : rien ne se passe.
3. Elles s’ouvrent avec le titre **Discussions masquées**, avec **Contacts** et **Changer le code PIN** en haut, et
   listent leurs discussions et groupes comme l’écran d’accueil liste les tiens : les plus récents en premier, chacun
   avec ce qui a été dit en dernier, quand, et combien de messages ne sont pas lus. Appuie sur l’un pour l’ouvrir. La
   flèche de retour les ferme.
4. Pour déplacer une autre discussion dans un emplacement, ouvre ses **Détails**, appuie sur **Déplacer dans les
   discussions masquées**, tape le code PIN de cet emplacement et appuie sur **Déplacer**. La discussion quitte ta liste
   avec ses messages, son nom, son image et son apparence, et les discussions importées dedans, et son numéro de
   sécurité reste le même. Le téléphone du contact est aussitôt informé qu’il doit désormais écrire aux discussions
   masquées ; un message qu’il envoie à ce moment précis peut ne pas arriver.
5. Pour remettre une discussion parmi celles de l’espace, ouvre-la dans les discussions masquées, puis ses **Détails**,
   appuie sur **Remettre dans mes discussions** et **Déplacer**. Elle part avec ses messages, son nom, son image, son
   apparence et ses discussions importées, et son téléphone est informé d’où écrire.

- **Relais, Nostr et téléphones à proximité :** les discussions masquées ont leur propre file d’attente sur le relais et
  leurs propres clés. Tant qu’elles sont ouvertes, ou reçoivent fermées, elles atteignent aussi le téléphone d’un contact
  à proximité, comme tes autres discussions (voir [Discuter avec un téléphone à proximité](#nearby)), mais d’autres
  téléphones ne les portent jamais, et elles ne passent jamais par LoRa{~ ni par SMS}. Sans relais, leur lien de contact dit où elles lisent sur Nostr,
  avec une clé de cet emplacement seul, et les textes y vont, comme depuis un téléphone sans relais ; les photos,
  messages vocaux, appels et groupes ont besoin d’un relais. Tant qu’elles sont fermées, leurs messages attendent sur le
  relais, ou sur Nostr pendant deux jours, sauf si **Recevoir une fois fermées** est activé.
- **Recevoir une fois fermées :** un interrupteur en haut de chaque emplacement. Activé, ses discussions masquées
  reçoivent comme tes autres discussions tant que l’espace est ouvert, quel que soit l’écran affiché et avec Erevos en
  arrière-plan : leurs contacts voient aussitôt qu’un message est arrivé, une notification dit seulement « Nouveau
  message », sur Android un appel sonne avec « Appel entrant » et sans nom (sur l’écran de l’appel, **Répondre** le prend sans code PIN, sur un écran sans nom ni visage, et les discussions masquées restent fermées ; le petit signe, le code PIN et **Connecter** les ouvrent et y répondent), et un rappel de leur Discussion
  avec moi-même affiche une notification qui dit seulement **Rappel**. Ce qui leur arrive par Nostr est alors lu aussi{+,
  et leurs comptes Matrix, XMPP et Nostr à elles restent connectés (voir plus bas)}. Un appel terminé avant que tu les
  ouvres, ou qui a sonné trop longtemps, s’affiche comme manqué. Rien d’elles ne s’affiche nulle part tant que le code
  PIN ne les ouvre pas. Un nouvel emplacement commence avec cet interrupteur activé ; les emplacements définis avant
  restent comme ils étaient jusqu’à ce que tu l’actives. Pour cela, la clé de l’emplacement est gardée chiffrée avec
  l’espace, parmi une clé aléatoire pour chaque autre emplacement, si bien qu’ouvrir l’espace ne montre pas quels
  emplacements reçoivent, ni lesquels sont définis. Mais celui qui ouvre l’espace et copie ce que garde le téléphone
  pourrait aussi ouvrir cet emplacement, sans code PIN : le code PIN les cache alors aux yeux de qui tient le téléphone,
  pas d’un outil d’analyse forensique. Désactivé, leur clé n’est que derrière le code PIN, et leurs messages attendent
  sur le relais jusqu’à ce que tu les ouvres. Les sauvegardes gardent l’interrupteur.
- **Point pour les non-lus :** avec **Recevoir une fois fermées** activé, un interrupteur en dessous (éteint sauf si
  tu l’allumes). Allumé, tant qu’une des discussions ou un des groupes du lieu a un message non lu{+, ou qu’une de ses
  propres discussions Matrix, XMPP ou Nostr en a eu un depuis la dernière fois que tu l’as ouvert}, un petit point
  s’affiche sur la loupe de **Rechercher dans les discussions** sur l’écran d’accueil : jamais combien, ni où. Il part
  dès que tu les lis. Qui voit les discussions de l’espace le voit aussi, et peut deviner qu’il y a des discussions
  masquées. Les lieux qui ont seulement **Prévenir quand un message arrive** n’ont pas de point : l’interrupteur
  devrait être gardé là où l’espace peut le lire.
- **Elles se ferment toutes seules** dès qu’Erevos a été en arrière-plan plus de 30 secondes, comme se reverrouille le
  code PIN propre d’une discussion, mais pas pendant un appel, ni pendant que tu choisis une photo ou un fichier pour
  elles ou que tu prends une photo.
- **Tant qu’elles sont ouvertes,** un message qui arrive joue le son des nouveaux messages, comme dans tes autres
  discussions. Avec Erevos en arrière-plan avant qu’elles se ferment, une notification dit « Nouveau message » seulement
  si **Recevoir une fois fermées** ou **Prévenir quand un message arrive** est activé pour cet emplacement.
- **Comme tes autres discussions :** ce qui ne peut pas partir maintenant attend, marqué **En attente**, par leur relais
  seulement, ou par Nostr sans relais (voir **En attente** sous [Discuter par un relais](#relay)), **Envoyer plus tard**
  fonctionne comme là-bas, et une discussion exportée d’une autre app peut être importée dans les détails d’une
  discussion masquée (voir [Discussions importées](#import)). Un contact peut aussi y être ajouté depuis une photo de
  son code QR, prise ou choisie pendant qu’elles restent ouvertes. Chaque emplacement a sa propre **Discussion avec
  moi-même**, la première de sa liste (voir **Discussion avec moi-même et rappels** sous [Premiers pas](#start)).
- **Groupes :** **Nouveau groupe**, sous leur liste, crée un groupe avec leurs contacts, comme sur l’écran d’accueil
  (voir [Discussions de groupe](#groups)), et il s’affiche dans leur liste parmi leurs discussions. Ses membres ne sont
  que des contacts de cet emplacement, et quelqu’un que tu y ajoutes comme contact devient un contact de cet
  emplacement. Ce qui y est écrit passe seulement par le relais de l’emplacement, vers sa propre file d’attente là-bas,
  jamais vers un téléphone à proximité ; tant que l’emplacement est fermé, il n’est lu qu’avec **Recevoir une fois
  fermées** activé, et **Prévenir quand un message arrive** ne le compte pas. Ses appels ne sonnent que tant que les
  discussions masquées sont ouvertes : un appel lancé pendant qu’elles sont fermées s’affiche comme manqué. Un groupe
  là-bas n’a pas de code PIN à lui, et aucun n’est public.
- [+] **Matrix, XMPP et Nostr :** sous leur liste, **Matrix**, **XMPP** et **Nostr** ouvrent les écrans de ces réseaux (voir
  [Matrix](#matrix), [XMPP](#xmpp) et [Discussions avec d’autres applis Nostr](#nostr-chats)) pour des comptes à elles,
  à part de ceux de l’espace : un compte Matrix et un compte XMPP où se connecter, et une clé Nostr. Les connexions et
  la clé sont gardées chiffrées avec la clé des discussions masquées, et rien d’elles ne se voit en dehors des
  discussions masquées : leurs discussions ne sont que dans la liste des discussions masquées, et n’ajoutent rien au
  numéro sur l’icône d’Erevos ni à la liste de l’accueil. Les comptes se connectent tant que les discussions masquées
  sont ouvertes, et aussi fermées si **Recevoir une fois fermées** est activé, comme les discussions masquées
  elles-mêmes reçoivent : alors un message y affiche une notification qui dit seulement « Nouveau message », et sur
  Android un appel Matrix ou XMPP sonne avec « Appel entrant » et sans nom, et se prend avec le code PIN comme leurs
  autres appels ; un appel non pris à temps s’affiche comme manqué, et de même un appel de groupe XMPP qui arrive
  pendant qu’elles sont fermées. Désactivé, les comptes ne se connectent que tant que les discussions masquées sont
  ouvertes, et fermées, rien n’arrive. Leurs discussions appellent comme celles de l’espace, depuis le compte propre aux
  discussions masquées ; un appel vers lui, tant que les discussions masquées sont ouvertes, sonne avec la sonnerie du
  téléphone, et elles restent ouvertes jusqu’à sa fin. Un compte Matrix à elles n’a pas **Signaler les nouveaux
  messages**.
- **Appareils associés :** sous leur liste, **Appareils associés** associe ces discussions masquées à part au même
  emplacement sur un ordinateur ou dans un navigateur, depuis l’intérieur, à l’écart de l’espace et de ses appareils
  associés : leurs discussions, messages et propres comptes y vont, et rien de cela ne se voit dans l’espace (voir
  **Les discussions masquées et les seconds mots de passe** dans [Appareils associés](#devices)). Non associées, elles
  ne sont que sur ce téléphone.
- **Aperçus des liens** a son propre interrupteur dans les détails d’une discussion masquée, pour toutes les discussions
  de cet emplacement, désactivé tant que tu ne l’actives pas (voir **Aperçus des liens** sous [Discuter par un
  relais](#relay)).
- **Prévenir quand un message arrive** (Android) : en haut d’un emplacement tant que **Recevoir une fois fermées** est
  désactivé. Activé, tant que l’emplacement est fermé, une notification dit seulement « New message », ou combien sont
  arrivés, comme pour les autres discussions, avec Erevos en arrière-plan ou affiché, une fois pour chaque message, même
  quand Erevos a été fermé puis redémarré ; ce qui est arrivé pendant que l’emplacement était ouvert n’en déclenche
  aucune une fois qu’il se ferme. Qu’un de tes messages leur soit arrivé ou ait été lu, la saisie et les nouvelles clés
  n’en déclenchent aucune, pas plus qu’un appel qui a sonné (voir **Faire sonner les appels quand elles sont
  fermées**) ; un appel qui n’a pas sonné compte comme un message. Un message ou une suppression que d’autres téléphones
  {=Erevos} ont transporté jusqu’au relais (voir **Transportés par d’autres téléphones** dans [Discuter avec un téléphone à
  proximité](#nearby)) ne peut pas dire ce qu’il transporte, car les téléphones qui le transportent ne doivent pas le
  savoir : il compte comme un message, si bien qu’une suppression affiche aussi « New message », et le premier message
  d’une discussion peut compter pour deux ; et un message envoyé sans son sonne comme d’habitude (voir **Envoyer sans
  son**). Il faut **Recevoir et sonner** et **Signaler les nouveaux messages** sous **En arrière-plan**, ce que
  l’interrupteur dit quand ils ne sont pas activés, et un relais qui attend (à partir du 18 octobre 2026) ; un relais
  d’avant le 23 octobre 2026 ne peut que dire que quelque chose attend, donc « New message » s’affiche aussi pour cela,
  une fois jusqu’à ce que tu ouvres cet emplacement. Pour cela, l’espace garde une file d’attente sur le relais pour
  chacun de ses 4 emplacements, celles qui ne servent pas étant créées pour rien sur le même relais, si bien qu’ouvrir
  l’espace ne montre ni si des discussions masquées sont définies ni lesquelles, tant qu’elles utilisent le relais de
  l’espace ; on ne demande au relais que combien de messages sont arrivés, car il les compte grâce à l’octet que chacun
  porte (voir ce que voit le relais, plus haut), jamais les messages eux-mêmes. Celui qui voit la notification et ne
  trouve rien de nouveau dans tes discussions peut deviner qu’il y en a d’autres. Après que tu as supprimé ou bloqué
  quelqu’un dans l’emplacement, le premier message d’une nouvelle personne, par le lien de contact ou le code QR de
  l’emplacement, n’en fait aucune : il se voit quand tu ouvres l’emplacement. Les sauvegardes le gardent.
- **Faire sonner les appels quand elles sont fermées** (Android) : sous **Prévenir quand un message arrive**, tant que
  **Recevoir une fois fermées** est désactivé. Activé, tant que l’emplacement est fermé, avec Erevos en arrière-plan ou
  sur n’importe quel écran, un appel d’un de ses contacts fait sonner le téléphone et affiche « Incoming call » sans
  nom, comme un appel de tes autres discussions. Sur l’écran de sonnerie, appuie sur **Répondre** ou sur le petit signe,
  tape le code PIN et appuie sur **Connecter** pour répondre ; **Refuser** arrête la sonnerie. Qui appuie sur
  **Répondre** sans le code PIN ne va pas plus loin que le champ du code PIN. La sonnerie dure environ 45 secondes. Il
  faut **Recevoir et sonner** sous **En arrière-plan**, ce que l’interrupteur dit quand ce n’est pas activé, et un
  relais qui attend, et cela utilise une file d’attente sur le relais pour chacun des 4 emplacements, celles qui ne
  sonnent pas étant créées pour rien sur le même relais, comme pour la notification des messages ci-dessus, si bien
  qu’ouvrir l’espace ne trahit rien. L’appelant ne fait que sonner une file là-bas ; l’appel lui-même attend sur la file
  propre de la discussion jusqu’à ce que le code PIN l’ouvre. Un contact que tu as supprimé peut encore le faire sonner,
  mais l’appel ne peut jamais se connecter. Un appel passé depuis un ordinateur associé ne sonne que tant que les
  discussions masquées sont ouvertes. Les sauvegardes le gardent.
- **Un nouveau code PIN pour un emplacement** (depuis **Discussions masquées** dans **Réglages**, ou **Nouvelles
  discussions masquées**) le recommence vide et remplace ce qui s’y trouvait. Pour garder les discussions et changer
  seulement le code PIN, ouvre-les et utilise **Changer le code PIN** là. Chaque code PIN doit être différent des autres
  et du mot de passe qui ouvre Erevos.
- **Les codes PIN erronés dans la recherche** sont comptés à part de ceux de l’écran de verrouillage : après cinq, les
  recherches cessent d’essayer pendant un moment, en silence, et l’écran de verrouillage n’attend jamais à cause d’eux.
- **Un code PIN tient à l’écart celui qui prend le téléphone,** pas celui qui copie ce qu’il garde : avec un outil
  d’analyse forensique sur un téléphone déverrouillé ou rooté, les codes PIN peuvent être essayés sans attente. Chaque
  essai coûte un Argon2id (beaucoup de mémoire et de temps), mais un code PIN de 4 chiffres ne représente que 10 000
  essais. Si c’est ce que tu crains, utilise un code PIN plus long, ou quelques mots.
- **Discrétion :** chaque espace a ses 4 emplacements dès le départ, ceux qui ne servent pas étant remplis de données
  aléatoires qui ressemblent à des emplacements utilisés, et la recherche essaie chaque emplacement à chaque fois. Ainsi
  rien ne montre si des discussions masquées sont définies, ni combien.

### Une discussion verrouillée par un code PIN {#chat-pin}

Une discussion ou un groupe peut avoir son propre code PIN, à part des discussions masquées : il reste parmi tes
discussions, mais ne s’ouvre qu’avec son code PIN.

1. Ouvre la discussion, appuie sur **⋮** en haut pour ses **Détails**, puis sur **Verrouiller par un code PIN** (dans un
   groupe : le nom du groupe en haut, puis **Verrouiller par un code PIN**).
2. Tape deux fois un code PIN d’au moins 4 caractères, puis **Verrou**.

- **L’ouvrir :** il demande le code PIN. Il se reverrouille dès que tu le quittes, que tu ouvres une autre discussion,
  ou qu’Erevos est absent plus d’une demi-minute (comme le verrou par mot de passe).
- **Derrière le code PIN**, rien de la discussion ne se voit : aucun de ses messages n’est affiché avant que le code PIN
  soit tapé, et avec le verre, un fond d’écran ou un style qui dessine sa propre scène, l’écran du code PIN repose sur
  un givre dense qui ne laisse rien voir.
- **Dans la liste**, elle montre son nom avec un cadenas et **Verrouillée par un code PIN**, rien de ses messages, ni
  dans la recherche, ni dans **Messages avec étoile**, ni dans **Discussions importées**. La notification dit seulement
  **Nouveau message**, comme pour toute discussion.
- **Les codes PIN erronés** sont comptés sur le téléphone, pour toutes les discussions à la fois et à part de ceux de
  l’écran de verrouillage : après cinq, l’essai suivant attend, plus longtemps à chaque fois.
- **Code PIN oublié ?** Sous le code PIN, là où l’espace a un mot de passe, **Code PIN oublié ?** le retire avec le mot
  de passe qui ouvre l’espace. Sans mot de passe, rien ne peut la rouvrir : supprimer le contact est alors le seul
  moyen.
- **Dans les discussions masquées :** une discussion que tu déplaces dans les discussions masquées emporte son code PIN,
  qui ne demande rien là-bas, car le code PIN propre des discussions masquées les protège. Remise parmi les discussions,
  le même code PIN est de nouveau demandé.
- **Pour le retirer :** **Détails** → **Verrouiller par un code PIN** de nouveau, et tape son code PIN.
- **Seul ce téléphone le connaît,** et chaque appareil associé a le sien. Les sauvegardes le gardent.
- [~] **Aussi {+sur Matrix, XMPP, Nostr et }en SMS :** {+une discussion Matrix, XMPP ou Nostr a **Verrouiller par un code PIN**
  en bas, et }une conversation SMS {-a **Verrouiller par un code PIN** }sous sa ligne **SMS ordinaire**, et cela marche de la même façon : dans la liste son
  nom avec un cadenas, aucun de ses messages dans la recherche, et le mot de passe de l’espace retire un code PIN
  oublié. **Bloquer les captures d’écran** est à côté, sur ce téléphone seulement (Android) : les autres ne sont pas
  prévenus. Les discussions d’un lieu caché n’offrent ni l’un ni l’autre, car leur propre code PIN les garde et elles
  restent hors des captures tant que **Captures d’écran** est activé.

**Pourquoi :** certaines discussions doivent rester où elles sont, mais sans s’ouvrir pour quiconque tient un moment le
téléphone. Le code PIN n’est gardé que sous forme d’Argon2id, si bien qu’il ne peut pas être lu sur le téléphone, et les
essais sont lents. C’est un verrou sur l’écran, pas une clé à part : les messages de la discussion restent chiffrés avec
le reste de l’espace, et celui qui copie ce que garde le téléphone pendant que l’espace est ouvert pourrait quand même
les lire. Pour une discussion qui ne doit même pas être vue, utilise les discussions masquées.

## Collection {#collection}

La Collection est un endroit chiffré pour tes photos, tes fichiers et tes dossiers, dans chaque espace et chaque lieu caché, chacun avec la sienne : celle de l’espace ne s’ouvre que dans l’espace, celle d’un lieu caché que dans ce lieu caché, et rien sur le téléphone ne dit qu’un lieu en a une. Son icône, deux images avec un minuscule cadenas, est sur l’écran d’accueil à gauche du cadenas, et en haut des discussions d’un lieu caché. C’est un module, sur Android, dans l’application de bureau, dans l’app web et sur Sailfish OS : **Réglages** → **Général** → **Modules**.

- **Dedans :** des onglets en haut : les **Photos** en grille par mois, les **Vidéos**, la **Musique** et les autres **Fichiers** en listes, chacun avec au-dessus les dossiers qui en contiennent (**Fichiers** aussi les vides). **+** prend une photo avec l’appareil photo, qui va directement ici et jamais dans la galerie, apporte un fichier depuis les fichiers du téléphone, jusqu’à 4 Go, chiffré à mesure qu’il est lu, sans copie préalable, ou crée un nouveau dossier. Un appui long permet d’en choisir plusieurs, pour les déplacer, les envoyer ou les supprimer ; un appui long sur un dossier pour le renommer ou le supprimer, ce qui garde ses fichiers.
- **Chiffrée :** chaque fichier est chiffré avec une clé à lui, en morceaux nommés au hasard parmi les morceaux des discussions, si bien que rien sur le téléphone ne distingue un fichier de la Collection d’une photo d’une discussion. Seul le catalogue propre à la Collection, scellé comme les discussions, dit lequel est lequel. La Collection reste hors des captures d’écran et se ferme quand l’espace se verrouille.
- **Redemande :** là où l’espace a un mot de passe, la Collection le demande chaque fois qu’elle s’ouvre, et de nouveau quand Erevos a été quitté plus de 30 secondes, avant de rien montrer ; l’empreinte ou le visage marchent aussi là où ils déverrouillent Erevos. Les mauvais mots de passe comptent comme sur l’écran de verrouillage. La Collection d’un lieu masqué ne demande rien de plus, car les discussions masquées se ferment dès qu’on quitte Erevos.
- **Depuis une discussion ou une autre app :** appuie longuement sur une photo ou un fichier d’une discussion, puis **Enregistrer dans la Collection** : il est copié dans la Collection du lieu de cette discussion. Depuis Partager d’une autre app, **Envoyer à** a la **Collection** en premier et demande dans quel dossier ; il y entre tel qu’il est arrivé, déjà chiffré, et ne se trouve donc jamais non chiffré sur le téléphone. Il peut faire jusqu’à 4 Go ; un fichier de plus de 100 Mo ne peut aller que dans la Collection, car une discussion prend 100 Mo au plus.
- **Hors de la Collection :** une photo s’ouvre en plein écran, pour balayer et zoomer, avec **Envoyer à une discussion**, **Enregistrer sur le téléphone**, **Informations** et **Supprimer**. Enregistrer sur le téléphone ou ouvrir un fichier avec une autre app le sort non chiffré, et Erevos le dit d’abord. Envoyer à une discussion laisse la copie de la Collection où elle est. Depuis la Collection d’un lieu caché, les fichiers vont seulement aux discussions et aux groupes de ce lieu caché, jamais à ceux de l’espace, et la Collection de l’espace jamais à un lieu caché. Glisse, ou utilise les flèches, pour la photo suivante ou la précédente ; **Diaporama** en haut les montre l’une après l’autre, toutes les 4 secondes, jusqu’à un toucher.
- **Depuis une discussion :** **+** sous le champ du message, puis **Collection**, ouvre la Collection du lieu de cette discussion : touche les photos ou fichiers à envoyer, puis **Envoyer**, et ils partent dans cette discussion.
- **Sauvegardes :** une sauvegarde contient la Collection avec le reste du téléphone. **Réglages** → **Données et appareils** → **Collection**, ou les trois points dans la Collection, peuvent laisser cette Collection hors des sauvegardes faites pendant qu’elle est ouverte : chaque Collection a son propre choix.
- **Sur un serveur WebDAV :** dans les réglages de la Collection, **Aussi sur un serveur WebDAV** copie les fichiers de cette Collection tels quels, toujours chiffrés, dans un dossier sur un serveur de ton choix, Nextcloud, ownCloud ou tout serveur qui parle WebDAV : donne l’adresse du dossier, un nom d’utilisateur et, de préférence, un mot de passe d’application, puis touche **Connecter** ; **Tester la connexion** les vérifie d’abord. Chaque espace et chaque lieu caché a son propre choix et son propre serveur ; le serveur des sauvegardes est proposé en premier. Seul ce qui n’y est pas encore part, un morceau à la fois, tant que le lieu est ouvert, et la copie reprend là où elle s’est arrêtée après une coupure du réseau ; un fichier supprimé ici l’est aussi là-bas. Rien d’autre dans le dossier n’est touché. Le serveur ne voit que des morceaux aux noms aléatoires, dans un sous-dossier au nom aléatoire, et ne peut pas les ouvrir. Un téléphone à qui il manque un fichier, comme après une sauvegarde restaurée sur un nouveau téléphone, va le chercher là-bas à l’ouverture, et ne garde que les morceaux qui s’ouvrent avec la clé du fichier. Erevos montre combien en est déjà arrivé, avec **Annuler** : ce qui est arrivé reste, et la fois suivante seul le reste vient ; la musique, les vidéos, les PDF et **Ouvrir avec une autre application** le récupèrent aussi d’abord. Tant que tout est copié, les sauvegardes faites pendant que le lieu est ouvert peuvent laisser ses morceaux de côté, même après un redémarrage d’Erevos, jusqu’à ce qu’un fichier soit ajouté ou supprimé. Elle a son propre interrupteur **Par Tor**, désactivé tant que tu ne l’actives pas : activé, la copie passe uniquement par Tor, quel que soit le réglage Tor de l’espace, donc le serveur ne voit pas ton adresse IP ; c’est plus lent, et cela attend pendant le démarrage de Tor. Là où il n’y a pas de Tor, dans l’appli de bureau et dans l’appli web, un serveur dont l’interrupteur est activé ne reçoit rien.
- **Avec Nextcloud, comme celui de LPHL :** dans ce formulaire, et dans **Ajouter un serveur** des sauvegardes, tape l’adresse de ton Nextcloud sous **Ton Nextcloud** et touche **Se connecter avec Nextcloud** : connecte-toi dans le navigateur, comme pour Fasouli, par Authentik ou comme il se connecte, et choisis **Accorder l’accès**. Erevos reçoit son propre mot de passe d’application et remplit le formulaire avec son propre dossier dans tes fichiers, **Erevos/Collection** ou **Erevos/Backups**, créé s’il manque, à côté de celui de Fasouli, qu’il ne lit jamais ; puis touche **Connecter**. Ce mot de passe se retire dans Nextcloud → Paramètres → Sécurité. La connexion suit l’interrupteur **Par Tor** du serveur pour lequel elle se fait : activé, Erevos interroge ton Nextcloud uniquement par Tor, mais la page du navigateur elle-même passe comme d’habitude.
- **Sur tes appareils associés :** dans les réglages de la Collection, **Aussi sur mes appareils associés** envoie cette Collection aux [appareils associés](#devices) de son espace ou lieu caché, et l’interrupteur vaut pour tous. Un fichier ajouté, renommé, déplacé ou supprimé sur l’un l’est sur tous. Les miniatures arrivent tout de suite ; le fichier lui-même arrive tout de suite sur le même Wi-Fi, sinon quand tu l’ouvres, depuis le serveur WebDAV si la Collection en a un, ou par le relais jusqu’à 100 Mo. Chaque morceau n’est gardé qu’une fois ouvert avec la clé du fichier, et un transfert coupé reprend au morceau qui manquait. Un fichier n’est supprimé ailleurs que s’il est supprimé sur l’un de tes appareils, jamais parce qu’il y manque. La Collection d’un lieu caché ne va qu’aux appareils associés de ce lieu.
- **Musique, vidéos et PDF :** un PDF se lit page par page dans Erevos (Android 11 et plus récent), déchiffré en mémoire seulement. La musique et les vidéos se lisent directement depuis leurs morceaux chiffrés, jamais depuis une copie : une vidéo en plein écran, la musique avec les suivantes du dossier, qui continue écran éteint, avec lecture, pause, suivant et précédent dans la notification et sur l’écran de verrouillage du téléphone, et seulement cela là. La liste continue une fois l’espace verrouillé, sauf si **Arrêter la lecture quand l’espace se verrouille** est activé dans les réglages de la Collection ; **Arrêter** et le bouton de panique y mettent fin. La notification indique seulement **Lecture en cours**, sauf si **Afficher le titre dans la notification** est activé. **Ouvrir avec une autre application** transmet le fichier à mesure qu’il est déchiffré, sans copie sur le téléphone, jusqu’à ce que tu quittes la Collection ; l’autre application peut en garder une à elle.
- **Originaux de la galerie :** avec **Supprimer l’original de la galerie après l’importation** activé, une photo ou une vidéo choisie dans les fichiers du téléphone est supprimée de la galerie dès qu’elle est dans la Collection, après qu’Android t’a demandé de confirmer. Il faut Android 11 ou plus récent. Une photo de l’appareil photo ne va jamais dans la galerie. Si Android ne dit pas quelle photo de la galerie c’est (comme depuis **Récents** dans le sélecteur de fichiers), l’original reste et Erevos le dit : choisis-la dans **Images** ou dans le stockage du téléphone.
- **Photos et vidéos :** dans **+**, **Appareil photo** est celui d’Erevos : photos et vidéos l’une après l’autre, avec flash et caméra avant, directement dans la Collection, jamais dans la galerie, et aucune autre application ne les voit ; une photo n’est jamais écrite nulle part, pas même un instant, et ne contient que son image. Là où le fabricant du téléphone les propose, comme sur un Pixel, **Nuit** et **Portrait** sont à côté de **Photo**, et en haut **HDR activé** : ils sont ceux du téléphone, faits sur lui, et rien ne sort. Un appui fait la mise au point et règle la lumière à cet endroit ; deux doigts zooment, et les boutons au-dessus du déclencheur passent au grand angle (**0.5×**), à **1×**, **2×** et **5×** là où le téléphone les a. **Plus** a un retardateur de 3 ou 10 secondes, une grille, un déclencheur silencieux là où la loi le permet, **Plus sombre** et **Plus clair** et, pour les vidéos, HD, Full HD ou 4K, et **Vidéo HDR activée** là où le téléphone la filme ; en vidéo, la lumière peut rester allumée. **Depuis la galerie** fait entrer plusieurs photos et vidéos à la fois ; avec **Supprimer l’original de la galerie après l’importation** activé, Android demande une seule fois pour toutes. Les photos HEIC et AVIF apparaissent dans **Photos** (Android affiche HEIC dès 9 et AVIF dès 12) ; une que l’appareil ne peut pas afficher propose **Ouvrir avec une autre application**. Sous une photo, **Modifier** la fait pivoter d’un quart à la fois et la recadre avec un cadre que tu tires par ses coins : elle est gardée comme nouvelle photo, et l’originale reste telle quelle. **Informations** dit si une photo ou une vidéo dit où elle a été prise. Une photo JPEG, PNG, WebP ou GIF enregistrée dehors ou ouverte avec une autre application sort sans le lieu ni l’heure de la prise ni le téléphone, sauf si **Les photos sortent avec lieu et heure** est activé dans les réglages de la Collection ; une vidéo ou une photo HEIC sort telle quelle, et Erevos prévient avant si elle nomme un lieu. L’appareil photo, la galerie et **Modifier** sont sur Android ; dans l’app de bureau et dans un navigateur, les photos AVIF s’affichent aussi.
- **Dans l’application de bureau :** sous Linux, macOS et Windows la Collection marche aussi, ses fichiers chiffrés dans le dossier propre d’Erevos sur l’ordinateur. **+** apporte un fichier de l’ordinateur, chiffré morceau par morceau ; il n’y a pas d’appareil photo. Photos, textes, PDF (dans la visionneuse PDF intégrée), musique et vidéos s’ouvrent seulement dans la mémoire d’Erevos, jamais en copie non chiffrée sur le disque, jusqu’à 1 Go chacun, et musique et vidéos de toute taille, lues morceau par morceau depuis leurs morceaux chiffrés pendant la lecture ; le fichier se ferme, et la musique ou une vidéo s’arrête, quand l’espace se verrouille ou avec le bouton de panique. **Enregistrer sur l’ordinateur** demande d’abord, comme sur le téléphone ; **Ouvrir avec une autre application** n’y est pas.
- **Dans un navigateur et sur Sailfish OS :** l’app web, sur l’écran d’accueil d’un iPhone aussi, et {=Erevos} sur Sailfish OS ont aussi la Collection. **+** apporte un fichier avec le sélecteur du navigateur, lu et chiffré morceau par morceau, si bien qu’un gros fichier n’est jamais tenu en entier ; ses morceaux sont gardés dans le stockage du navigateur, ou sur Sailfish OS dans le dossier propre d’Erevos. Un navigateur ne donne à un site qu’une place limitée : quand elle manque, rien du fichier n’est gardé, et Erevos le dit. Photos, textes, musique et vidéos s’ouvrent seulement en mémoire, jusqu’à 256 Mo chacun, et se ferment quand l’espace se verrouille ; un PDF n’y est pas affiché : enregistre-le pour le lire avec une autre application. **Enregistrer sur cet appareil** (sur Sailfish OS **Enregistrer sur le téléphone**) demande d’abord ; dans un navigateur il prend jusqu’à 256 Mo, tandis que Sailfish OS écrit dans Téléchargements un fichier de toute taille morceau par morceau. Dans un navigateur, le serveur WebDAV doit laisser entrer l’app web, comme pour les sauvegardes ; Sailfish OS n’a pas de copie sur WebDAV.
- **Formats :** sur Android, MP3, AAC et M4A, FLAC, Ogg et Opus, WAV, AMR, MP4, MKV, WebM et 3GP se lisent, même un fichier arrivé sans type, reconnu à la fin de son nom, comme arrivent souvent les fichiers d’autres applis. Dans l’appli de bureau et dans un navigateur, ce que le navigateur en lit : ni 3GP ni AMR.
- **L’écran de lecture :** touchez la barre de la musique en cours en bas de la Collection, ou **En cours de lecture** sous un fichier de musique, pour sa pochette, son titre, son artiste et son album tels que le fichier les donne (sinon son nom), une barre à toucher ou faire glisser vers un autre point, précédent, lecture ou pause et suivant, **Aléatoire**, **Répéter** (la liste, ou le seul fichier) et la vitesse, de 0.5× à 2×, et la liste, celui en cours marqué : touchez-en un autre pour le lire. Une vidéo, ou une musique de 10 minutes ou plus, reprend là où vous l’avez laissée : le point est gardé dans le catalogue de la Collection, chiffré avec lui, nulle part ailleurs sur le téléphone, et pour cet appareil seulement. La notification et l’écran de verrouillage montrent le titre, l’artiste et la pochette seulement avec **Afficher le titre dans la notification** activé ; sinon seulement **Lecture en cours**.
- **Sous-titres :** un fichier .srt ou .vtt dans le même dossier qu’une vidéo, à son nom (film.mkv et film.srt, ou film.en.srt), s’affiche comme ses sous-titres, lu depuis ses morceaux chiffrés comme la vidéo ; **Sous-titres activés** en haut les masque, puis les réaffiche.
- **Playlists :** en haut de **Musique**, **Nouvelle playlist** en crée une ; les chansons y entrent depuis leur menu (**Ajouter à une playlist**) ou choisies ensemble (maintenez-en une appuyée, puis **Playlist**). Ouvrez-la pour la lire dans l’ordre ou en aléatoire, monter ou descendre une chanson, ou la retirer : elle reste dans la Collection. Les playlists sont gardées chiffrées avec la Collection, jamais en clair.
- **Radio :** l’onglet **Radio** contient des stations de radio par internet, chacune par son lien ; **+** y en ajoute une. Liens https uniquement : Erevos n’ouvre pas de http en clair, donc une station qui n’a qu’un lien http ne peut pas être ajoutée. Un lien de playlist (.m3u, .pls) est lu une fois, à l’ajout, pour le lien du flux lui-même ; un flux HLS (.m3u8) se lit sur le téléphone. Une station se lit comme la musique, avec la même notification, le même **Arrêter la lecture quand l’espace se verrouille** et le bouton de panique ; le titre qu’elle envoie s’affiche sur l’écran de lecture, et dans la notification seulement quand **Afficher le titre dans la notification** est activé. Sauf si **Lire par Tor** est activé, plus bas, la station, et qui gère son serveur, voit l’adresse IP de votre appareil pendant la lecture, comme tout site, et Erevos le dit avant que la première soit lue. Erevos n’envoie rien d’autre à une station, et seulement « Erevos » comme nom. Les stations sont gardées chiffrées avec la Collection.
- **Trouver une station :** **Ajouter une station** cherche aussi dans Radio Browser (radio-browser.info), un annuaire libre de stations auquel chacun peut ajouter : il ne reçoit que les mots que vous tapez, quand vous appuyez sur **Rechercher**, et voit l’adresse IP de votre appareil, comme la station. Seules les stations pour lesquelles il a un lien https sont affichées ; une touche en ajoute une. Avec **Par Tor** activé sous **Listes radio et TV**, plus bas, la recherche passe par Tor et Radio Browser ne voit pas ton adresse IP.
- **Une liste toute prête d’un pays :** **Ajouter une station** ajoute aussi, avec **Ajouter les stations de ce pays**, les stations les plus écoutées de Radio Browser dans le pays choisi, jusqu’à 100, chacune avec un lien https. Radio Browser est interrogé une fois, quand tu appuies, et voit l’adresse IP de ton appareil, sauf si **Par Tor** est activé dans **Listes radio et TV**.
- **Une playlist de plusieurs stations :** un lien de playlist (.m3u, .pls) qui nomme plusieurs stations les ajoute toutes, et **Importer un fichier de playlist** ajoute les stations d’un fichier .m3u ou .pls de ton appareil, lu là et envoyé nulle part. Seules les stations avec un lien https sont ajoutées (500 au plus d’une liste), et Erevos dit combien ont été laissées de côté.
- **Quand un flux coupe :** si le serveur d’une station, ou un proxy sur le chemin, termine le flux, ou que le réseau disparaît un instant, Erevos redemande la station tout seul après 1, 2, 4… secondes (30 au plus), tant que tu veux l’écouter, sur Android, sur un ordinateur et dans un navigateur. Après 12 essais de suite, il s’arrête et le dit.
- **TV :** l’onglet **TV** garde des chaînes de télé, chacune par son lien https, dans les groupes que leur donne leur liste, avec une rangée pour afficher un groupe et une recherche par nom. Un appui lit une chaîne en plein écran, comme une vidéo, avec le même **Arrêter la lecture quand l’espace se verrouille** et le bouton de panique ; il n’y a pas de guide des programmes. Elle se lit sur Android, dans l’application de bureau et dans un navigateur ; là, un flux HLS se lit avec hls.js, et seulement si son serveur laisse l’application web le lire.
- **Ajouter des chaînes :** **+** dans **TV** ajoute une liste par son lien (.m3u), lue une fois à l’ajout, un fichier de liste de votre appareil (**Importer un fichier de liste (.m3u)**), lu là et envoyé nulle part, ou une chaîne par son lien. Seules les chaînes avec un lien https sont ajoutées, chaque lien une fois, jusqu’à 15 000 dans chaque Collection, et Erevos dit combien ont été laissées de côté. Appuyez longuement sur une chaîne pour la renommer, la supprimer ou supprimer tout son groupe, ou envoyer son nom et son lien avec **Envoyer à une discussion** ; le menu d’une station de radio a aussi **Envoyer à une discussion**.
- **iptv-org :** **Ajouter des chaînes** propose iptv-org (github.com/iptv-org/iptv), une liste publique de chaînes gratuites : **iptv-org par pays**, la région de votre appareil d’abord, ou **iptv-org : toutes les chaînes**, plus de 10 000. Son serveur voit l’adresse IP de votre appareil quand la liste est récupérée, et chaque chaîne pendant sa lecture, sauf si **Lire par Tor** est activé. Avec **Par Tor** activé sous **Listes radio et TV**, plus bas, la liste est récupérée par Tor, donc son serveur ne voit pas ton adresse IP ; chaque chaîne la voit toujours pendant sa lecture, sauf si **Lire par Tor** est activé aussi.
- **Ce que voit une chaîne :** sauf si **Lire par Tor** est activé, plus bas, la chaîne, et qui fait tourner son serveur, voit l’adresse IP de votre appareil pendant la lecture, comme tout site, et Erevos le dit avant que la première soit lue. Les logos ne s’affichent qu’avec **Afficher les logos des chaînes** activé dans les réglages de la Collection, car le serveur de chaque logo voit aussi votre adresse IP ; sinon, une icône de télé. Les chaînes sont gardées chiffrées avec la Collection.
- **Listes radio et TV par Tor :** dans les réglages de la Collection, la carte **Listes radio et TV** a **Par Tor**, désactivé tant que tu ne l’actives pas. Activé, Erevos demande uniquement par Tor, quel que soit le réglage Tor de l’espace, la recherche dans Radio Browser, une playlist ou une liste TV récupérée par son lien, la liste d’iptv-org et les logos des chaînes, donc leurs serveurs ne voient pas l’adresse IP de ton appareil. C’est plus lent, et cela attend pendant le démarrage de Tor. La lecture des stations et des chaînes elles-mêmes a son propre interrupteur, juste après.
- **Lire par Tor :** sur Android, les réglages de la Collection ont aussi **Lire par Tor**, désactivé tant que vous ne l’activez pas. Activé, les stations et les chaînes sont lues uniquement par Tor, donc ni elles ni qui gère leurs serveurs ne voient l’adresse IP de votre appareil ; si Tor ne démarre pas, rien n’est lu en direct à la place. C’est plus lent, cela attend pendant le démarrage de Tor, et une chaîne de télé peut tarder à démarrer ou se figer un instant. Tant que l’espace envoie tout par Tor, elles sont lues par Tor même s’il est désactivé. Désactivé, elles sont lues en direct : avant que la première soit lue, Erevos dit que son serveur voit votre adresse IP, avec un bouton **Lire par Tor** qui l’active et lit par Tor, et **Continuer**, qui lit en direct. Seul Android les lit par Tor : ailleurs, s’il est activé, elles ne sont pas lues, et Erevos dit pourquoi ; sur un ordinateur non plus tant que l’espace envoie tout par Tor.

**Pourquoi :** certaines photos et certains fichiers, un passeport, un contrat, une image, ne doivent ni rester dans la galerie pour que n’importe quelle app les lise, ni voyager dans une discussion. La Collection les garde avec le même chiffrement que les discussions, à part d’elles. Dès qu’un fichier est enregistré sur le téléphone ou ouvert avec une autre app, il est hors d’Erevos, non chiffré.

## Sauvegardes {#backup}

Une sauvegarde contient tout ce qu’Erevos garde sur ce téléphone : chaque espace, avec ses contacts, les clés de ses
conversations, ses messages, photos, fichiers, messages vocaux, discussions importées et discussions masquées, {+ses
comptes Matrix, XMPP et Nostr, }sa Discussion avec moi-même, le verrou et le mot de passe de panique, et les réglages qui
te suivent sur un autre téléphone. À l’intérieur, chaque espace reste scellé avec son propre mot de passe, et la
sauvegarde est scellée de nouveau avec un mot de passe à elle. Ses photos, fichiers et messages vocaux vont dans des
fichiers à part, à côté d’elle, de 4 Mo au plus chacun, dont le nom commence comme le sien ; une sauvegarde
automatique utilise aussi les fichiers de celles d’avant : garde tout le dossier ensemble. C’est
sous **Réglages** → **Données et appareils** → **Sauvegardes**.

1. **Créer une sauvegarde :** appuie sur **Créer une sauvegarde**, choisis un dossier (sur le téléphone, une carte
   mémoire, ou une app cloud qui y montre ses dossiers ; sur un ordinateur, n’importe quel dossier), tape deux fois un
   mot de passe pour la sauvegarde (au moins 12 caractères, ou quatre mots) et appuie sur **Enregistrer**. Dans un navigateur, la sauvegarde et ses fichiers vont au menu de partage ou dans les téléchargements : le premier tout de suite, chacun des suivants après un appui sur **Enregistrer**.
   Pendant qu’elle se fait, sa carte dit ce qu’elle fait et où elle en est ; une fois finie, une notification le dit.
2. **Sauvegardes automatiques :** choisis **Toutes les 6 heures**, **Chaque jour** ou **Chaque semaine**, puis un
   dossier et un mot de passe. Erevos en crée une tant qu’il est ouvert, dès que la dernière est plus ancienne que
   cela : quand un espace s’ouvre, toutes les 15 minutes, et quand il passe en arrière-plan, avant de se verrouiller ;
   jamais sans espace ouvert. Chacune n’écrit que les photos, fichiers et messages vocaux qui sont nouveaux depuis la
   précédente, et nomme de nouveau les fichiers de celles d’avant pour le reste, si bien qu’une toutes les 6 heures
   coûte peu. Le dossier garde les 3 plus récentes, avec tous les fichiers dont elles ont besoin, et supprime les
   fichiers dont aucune n’a besoin. Une qui a échoué est retentée quand un espace s’ouvre, ou une heure plus tard. En
   dessous se trouvent **Sauvegarder maintenant**, **Changer de dossier** et **Changer le mot de passe** ;
   **Désactivé** les arrête, et celles déjà faites restent dans le dossier.
3. **Aussi vers un serveur :** sur Android et dans l’app de bureau, avec les sauvegardes automatiques activées,
   **Ajouter un serveur** sous **Aussi vers un serveur** envoie chacune aussi dans un dossier sur un serveur de ton
   choix qui parle WebDAV, comme ton propre Nextcloud : donne l’adresse du dossier, un nom d’utilisateur et, mieux, un
   mot de passe d’application rien que pour Erevos, puis appuie sur **Connecter**. Le serveur garde les 3 plus
   récentes, avec tous les fichiers dont elles ont besoin, et chacune n’envoie que ce qui est nouveau ; **Ne plus
   envoyer** l’arrête, et celles qui y sont restent. Dans l’app web, qui ne fait pas de
   sauvegardes d’elle-même, **Envoyer une sauvegarde maintenant** en envoie une là-bas, avec un mot de passe que tu
   tapes à chaque fois.
   Chaque serveur a un interrupteur **Par Tor**, dans sa carte et dans le formulaire qui en ajoute un, désactivé tant
   que tu ne l’actives pas (voir **Sur un serveur** plus bas).
4. **Restaurer :** appuie sur **Restaurer une sauvegarde**, choisis le fichier et tape son mot de passe. Erevos
   demande encore une fois, trouve les fichiers de la sauvegarde à côté d’elle, ou te demande de les choisir, ou leur
   dossier (pour une sauvegarde automatique, choisis tous les fichiers du dossier, car certains de ses fichiers
   peuvent commencer par le nom d’une sauvegarde plus ancienne), puis met la sauvegarde à la place de tout ce qui est sur le téléphone, et s’ouvre tel qu’il était quand la
   sauvegarde a été faite, avec les mots de passe utilisés alors. Si l’un de ses fichiers manque, est abîmé ou appartient à une autre sauvegarde, Erevos dit lequel, et rien n’est changé, sauf si tu choisis de restaurer le reste sans lui : alors les photos, les fichiers et les messages vocaux du téléphone restent tels quels, et ceux qu’il contient ne reviennent pas. **Restaurer depuis un serveur** regarde dans le dossier où
   vont les sauvegardes automatiques, ou dans un dossier que tu donnes avec son nom d’utilisateur et son mot de passe,
   et montre les sauvegardes qui s’y trouvent, les plus récentes d’abord : choisis-en une, tape son mot de passe, et
   elle est restaurée de la même façon, avec ses fichiers venus de là-bas.

- **Garde le mot de passe de la sauvegarde :** rien n’ouvre une sauvegarde sans lui, et personne ne peut le récupérer.
  Sans verrou par mot de passe, le mot de passe de la sauvegarde est tout ce qui la protège. Celui qui a le fichier peut
  y essayer des mots de passe aussi vite que va son ordinateur, sans téléphone pour le ralentir, donc un mot de passe
  court ne tient pas : Erevos n’en accepte aucun de moins de 12 caractères.
- **Les sauvegardes automatiques gardent leur mot de passe sur le téléphone,** pour ne pas demander de mot de passe à
  chaque fois. Celui qui ouvre leur dossier a quand même besoin des mots de passe des espaces pour lire les discussions.
- **Ce qui prend de la place :** sur Android, **Mesurer** sous **Ce qui prend de la place** montre la place qu’Erevos prend sur le téléphone, par type : {~la Collection avec |}les photos et fichiers des discussions, les messages vocaux, l’historique des discussions, Tor et les restes d’écritures inachevées. Chaque sauvegarde automatique contient tout cela, on voit ainsi pourquoi elle est grosse. Seuls les noms et tailles des fichiers sont regardés, sur le téléphone, et rien n’est envoyé.
- **Restes :** les photos et fichiers qu’aucune discussion{~, Collection|} ou importation ne nomme plus, comme ceux d’une importation interrompue, restent sur le téléphone et dans chaque sauvegarde. Sous **Restes**, tape un à un, ou plusieurs ensemble séparés par des virgules ou des espaces, le PIN de chacune de tes discussions cachées et le mot de passe de tout autre espace, puis touche **Chercher les restes** : Erevos lit quels fichiers chacun d’eux et cet espace nomment, et montre combien aucun ne nomme. **Les supprimer** les supprime, après une confirmation de plus. Un lieu que tu n’as pas ouvert là perd ses photos et fichiers : ouvre-les tous d’abord. Un fichier écrit le dernier jour n’est jamais pris, et les sauvegardes déjà faites gardent tout.
- **Vérifier les sauvegardes :** après chaque sauvegarde automatique, Erevos la relit depuis le dossier : elle s’ouvre avec son mot de passe, chaque partie qu’elle nomme est là, à sa taille, et deux parties prises au hasard sont lues en entier. D’un serveur, il ne regarde alors que la liste, donc rien n’est téléchargé. **Vérifier maintenant** télécharge en plus la dernière sauvegarde du serveur et dix de ses parties. Une partie manquante ou endommagée s’affiche en rouge : fais une sauvegarde maintenant, puis vérifie à nouveau. **Vérification complète du dossier** lit en entier chaque partie qui s’y trouve et la compare avec le SHA-256 que la sauvegarde a noté pour elle : quelques minutes pour beaucoup de Go, et rien ne quitte le téléphone.
- **Sur un serveur :** la sauvegarde envoyée là-bas est scellée avec son mot de passe comme les autres, et ce mot de
  passe ne quitte jamais le téléphone, donc le serveur ne peut pas l’ouvrir. Son nom est aléatoire et le fichier
  ressemble à des octets aléatoires, d’une taille parmi quelques-unes, donc ni l’un ni l’autre ne dit qu’il est
  d’Erevos ni combien il contient exactement. Ses photos, fichiers et messages vocaux partent en envois à part, tous
  de la même taille, chacun aussi sous un nom aléatoire et scellé avec le mot de passe de la sauvegarde, lié à cette
  sauvegarde et à sa place en elle, si bien qu’aucun ne peut être échangé, retiré ou pris d’une autre sauvegarde sans
  que cela se voie ; le serveur garde chacun tant qu’une des sauvegardes qu’il garde en a besoin, puis le supprime. Leurs noms sont aussi longs que celui de la sauvegarde, mais leur taille les distingue d’elle : le serveur peut donc les compter, et savoir ainsi à peu près ce que la sauvegarde contient. Ce qu’une sauvegarde coupée en route a laissé là-bas est supprimé avant que la suivante parte, si bien qu’un serveur qui n’avait plus de place en a de nouveau. Le serveur voit quand même ton
  compte, quand une arrive et à peu près sa taille. Sur Android, les sauvegardes y vont comme le dit le choix de l’espace sous **Réglages** → **Relais et
  réseaux** → **Tor**{+, comme Matrix} : avec **Tout** seulement par Tor, donc le serveur ne voit pas l’adresse du
  téléphone ; avec **Messages** par Tor dès que Tor est prêt, et en direct tant que Tor démarre ou quand il échoue ;
  avec **Rien** en direct, et le serveur voit l’adresse du téléphone. Une sauvegarde attend d’abord jusqu’à deux
  minutes que Tor démarre, et **Aussi vers un serveur** dit par où elle passe en ce moment. Dans l’app de bureau,
  c’est l’app elle-même qui les envoie, pas sa page, car une page ne peut pas joindre un tel serveur ; dans l’app web,
  c’est le navigateur, qui ne joint qu’un serveur réglé pour laisser entrer l’app web (CORS), ce que Nextcloud n’est
  pas de base. Aucune des deux n’a Tor pour cela : tant qu’un espace envoie **Tout** par Tor, aucune ne part de là.
  Dans l’app web, le mot de passe du serveur est gardé dans le navigateur, scellé avec une clé que le navigateur ne
  donne pas. **Restaurer depuis un serveur** télécharge celle que tu choisis de la même façon, par Tor comme le dit
  l’espace, et n’écrit rien là-bas ; un mot de passe tapé pour cela ne sert qu’à cette restauration et n’est pas
  gardé. Par Tor, aucun fichier d’une sauvegarde de plus de 64 Mo ne vient, et en direct aucun de plus de
  100 Mo, le maximum qu’Erevos accepte pour un téléchargement : télécharge alors la sauvegarde et ses fichiers depuis
  le serveur et appuie sur **Restaurer une sauvegarde**. Un Erevos d’avant cette version n’ouvre pas une telle sauvegarde. Google Drive est
  laissé de côté exprès : Google lie le fichier à ton nom, et Erevos aurait besoin des apps de Google et d’une
  connexion Google sur le téléphone.
  L’interrupteur **Par Tor** de chaque serveur, désactivé tant que tu ne l’actives pas, passe avant le choix de
  l’espace pour ce serveur : activé, ses sauvegardes passent uniquement par Tor, quel que soit le réglage Tor de
  l’espace, et attendent le démarrage de Tor, donc le serveur ne voit pas l’adresse du téléphone. **Restaurer depuis
  un serveur** et le formulaire qui ajoute un serveur ont le même interrupteur, et la connexion avec Nextcloud suit
  l’interrupteur du serveur pour lequel elle se fait : la page du navigateur elle-même passe comme d’habitude. L’appli
  de bureau et l’appli web n’ont pas Tor : un serveur dont l’interrupteur est activé ne reçoit rien de là. Les
  morceaux de sauvegarde que tu donnes à des amis ([Morceaux de sauvegarde chez des amis](#backup-pieces)) ne portent
  pas l’interrupteur.
- **Les discussions qui ont continué après la sauvegarde :** restaurer remet les clés de chaque conversation telles
  qu’elles étaient alors. Les messages arrivés après la sauvegarde et déjà lus n’y sont pas. Une conversation qui a
  continué après la sauvegarde n’ouvrirait plus les nouveaux messages, si bien que chaque discussion restaurée, celle
  de l’espace et celle de chaque lieu caché à son ouverture, ouvre d’elle-même et sans bruit une nouvelle conversation
  avec chaque contact, à partir des clés les plus récentes qu’il lui a données, et son {=Erevos} continue dedans. Avec un
  contact dont l’{=Erevos} est plus ancien, demande-lui de nouveau son lien de contact. Avant
  qu’une discussion restaurée écrive de nouveau, ses conversations sautent au-delà des clés qu’elles ont pu utiliser
  depuis la sauvegarde, si bien qu’aucune clé ne scelle jamais deux messages : une clé qui en scellerait deux
  permettrait à celui qui a gardé les deux paquets de les lire ensemble. Dans un groupe, un membre restauré demande à
  l’Erevos de l’admin de le remettre dedans, ce qui marche tant que le groupe n’a avancé que de peu ; sinon demande à
  être ajouté de nouveau.
- [+] **Matrix, XMPP et Nostr :** les comptes de chaque espace et de ses discussions masquées sont dans la sauvegarde. Une
  clé **Nostr** revient avec ses discussions, telles qu’elles étaient. Un compte **XMPP** revient avec sa connexion, ses
  contacts, ses discussions et les clés qu’il connaît des autres, et continue comme un nouvel appareil du compte : il
  garde sa clé d’identité, si bien que les applis de tes contacts connaissent toujours sa clé, mais il prend un nouvel
  identifiant d’appareil, une nouvelle ressource et de nouvelles clés, chaque conversation recommence, et l’ancien
  appareil est retiré des listes d’appareils du compte dès qu’il se connecte. Il ne peut pas lire les messages chiffrés
  pour l’ancien appareil après la sauvegarde. Un compte **Matrix** est lâché sur ce téléphone, sans être déconnecté sur
  le serveur, ce qui mettrait fin à l’appareil du téléphone d’où vient la sauvegarde ; l’espace se reconnecte, comme un
  nouvel appareil, et sa clé de sécurité ouvre les messages d’avant. Remises telles qu’elles étaient, les conversations
  d’un tel appareil réutiliseraient des clés de message que les autres refusent, et le téléphone d’où vient la
  sauvegarde peut encore se servir de l’appareil.
- **Discussions fermées :** une sauvegarde garde aussi ce dont ont besoin **Faire sonner les appels quand elles sont
  fermées** et **Prévenir quand un message arrive** des discussions masquées, et **Aussi quand un autre espace est
  ouvert**. Ainsi, après une restauration, sur un autre téléphone aussi, ils continuent comme avant. Une sauvegarde
  d’avant cette version n’en a rien : la restaurer les laisse tels que le téléphone les a.
- **Réglages :** une sauvegarde garde les réglages qui sont les tiens et non ceux du téléphone : la langue,{~ les
  modules,} la vibration, les notifications en arrière-plan et le nombre sur l’icône, l’économie de batterie, la
  confidentialité de l’écran, la qualité des photos, si le Téléphone s’ouvre sans le mot de passe, et la façon dont
  Erevos joint les téléphones à proximité (en transportant leurs messages, sur le même Wi-Fi, par Wi-Fi Direct, Wi-Fi
  Aware et une radio LoRa, qui ne se rallume que là où ce téléphone la connaît). Sur Android, elle garde aussi les
  réponses rapides du Téléphone et les appels qu’il refuse, ceux d’un groupe de contacts seulement là où ce téléphone a
  un groupe de ce nom dans le même compte. Les sauvegardes automatiques et leur serveur reviennent avec leur mot de
  passe, mais pas avec leur dossier, où Android ne laisse écrire que le téléphone sur lequel il a été choisi : sur un
  autre téléphone, **Sauvegardes** dit d’en choisir un, et d’ici là elles vont seulement au serveur.
- **Un téléphone à la fois :** une sauvegarde restaurée sur un second téléphone lit les mêmes files d’attente sur le
  relais que le premier, et chacun prend des messages que l’autre ne reçoit alors jamais. Utilise-la pour passer à un
  nouveau téléphone, pas pour en garder deux.
- **L’ancien téléphone est perdu :** un téléphone perdu ou volé qui est encore allumé continue de lire les files
  d’attente sur le relais qu’il connaissait, donc des messages envoyés là peuvent lui arriver et jamais au nouveau
  téléphone. Après avoir restauré la sauvegarde sur le nouveau téléphone, appuie sur **L’ancien téléphone est perdu**
  sous **Sauvegardes** (après la restauration d’une sauvegarde venue d’un autre téléphone, Erevos le signale) et dis
  **Changer les files**. Chaque espace et ses discussions masquées passent alors à de nouvelles files d’attente sur le
  relais, chacun la prochaine fois qu’il s’ouvre ici, et tes contacts et groupes sont prévenus sans bruit. Les
  anciennes files sont lues ici jusqu’à ce que chaque contact écrive dans les nouvelles, 14 jours au plus, et les
  liens de contact et codes QR que tu as donnés avant marchent 14 jours, puis plus. Ce qui passe par Nostr{+, XMPP ou
  Matrix} arrive toujours sur l’ancien téléphone. Après une autre restauration, appuie dessus de nouveau.
- **Discrétion :** chaque espace montre le même écran Sauvegardes, et une sauvegarde contient chaque espace, si bien que
  ni l’un ni l’autre ne dit combien il y a d’espaces ni si des discussions masquées sont définies. Le nom des fichiers dit
  que c’est une sauvegarde Erevos, et leur nombre et leur taille montrent à peu près combien est gardé.
- [~] **Les SMS du téléphone :** sur Android, **Inclure les SMS dans les sauvegardes** ajoute les SMS et MMS du téléphone à
  chaque sauvegarde à partir de là, avec jusqu’à 32 Mo de leurs images, tant qu’Erevos est l’app SMS. Ils sont scellés
  avec le mot de passe de la sauvegarde comme le reste. Restaurer la sauvegarde remet dans les SMS du téléphone chaque
  message qu’il n’a pas encore, et n’en supprime aucun ; Erevos doit alors aussi être l’app SMS, sinon le reste est
  restauré sans eux. Les SMS sont ceux du téléphone, les mêmes dans chaque espace. Un Erevos plus ancien n’ouvre pas une
  sauvegarde qui contient des SMS.
- [~] **Les appels du téléphone :** sur Android, **Inclure les appels dans les sauvegardes**, sous **Les appels du
  téléphone**, ajoute à chaque sauvegarde à partir de là l’historique des appels du téléphone (ses 10 000 appels les
  plus récents, sans la messagerie vocale) et la liste de numéros bloqués d’Android elle-même, tant qu’Android laisse
  Erevos lire l’historique des appels ; les numéros bloqués seulement tant qu’Erevos est l’app Téléphone ou SMS. C’est
  désactivé jusqu’à ce que tu l’actives, et le choix va dans les sauvegardes. Ils sont scellés avec le mot de passe de
  la sauvegarde comme le reste. Restaurer la sauvegarde ajoute au téléphone chaque appel et chaque numéro bloqué qu’il
  n’a pas encore, et n’en supprime aucun ; Erevos doit alors être l’app Téléphone (**Réglages** → **Téléphone et SMS**
  → **Téléphone**), sinon le reste est restauré sans eux. Android garde à peu près les 500 appels les plus récents de
  chaque SIM, donc les plus anciens restaurés peuvent partir à mesure que de nouveaux arrivent. Un Erevos plus ancien
  n’ouvre pas une sauvegarde qui contient des appels.
- [~] **Les SMS en ordre :** les épingles, conversations archivées, corbeille, brouillons, filtre anti-spam et marques de
  chaque espace, le délai pendant lequel un SMS peut encore être annulé, les SMS à envoyer plus tard (**SMS plus
  tard**), les invitations, les noms de tes contacts, si les messages aux contacts Erevos peuvent passer par SMS, et la
  SIM choisie pour chaque numéro sont dans chaque sauvegarde, scellés avec le mot de passe de l’espace comme le reste. La SIM choisie ne revient que sur le même téléphone, car chaque téléphone donne à ses SIM des identifiants à lui : sur un autre, les SMS et les appels passent par sa SIM par défaut jusqu’à ce que tu en choisisses une là-bas.
  Un SMS pour plus tard dont l’heure est venue avant la restauration ne part pas tout seul, car le téléphone d’où vient
  la sauvegarde l’a peut-être envoyé : il s’affiche comme non envoyé, et un appui dessus l’envoie ou le supprime. Celui
  dont l’heure est encore à venir part à son heure. Un Erevos plus ancien n’ouvre pas une sauvegarde qui les contient ;
  une sauvegarde faite par un {=Erevos} plus ancien se restaure comme toujours, sans eux.
- **Ce qui ne revient jamais :** ce qui appartient au téléphone lui-même ne vient avec aucune sauvegarde, donc une
  restauration sur un autre téléphone ne peut pas l’apporter : l’empreinte ou le visage, dont Android garde la clé dans
  la puce de ce téléphone ; les dossiers où Erevos peut écrire, comme celui des sauvegardes automatiques, où Android ne
  le laisse entrer que sur le téléphone où ils ont été choisis ; ce qu’Android permet à Erevos{~ et quelles apps passent
  les appels et envoient les SMS}, que toi seul peux autoriser sur chaque téléphone, c’est pourquoi après une
  restauration sur Android **Autorisations** s’ouvre{~ pour les modules activés} ; {~l’historique des appels et la liste de
  numéros bloqués d’Android elle-même, sauf si **Inclure les appels dans les sauvegardes** était activé, comme plus
  haut ; |}et le compte des mots de passe erronés.{+
  Un compte XMPP revient comme un nouvel appareil de lui-même et Matrix se reconnecte, comme plus haut, et les}{- Les}
  appareils associés s’associent de nouveau, comme plus bas.
- **Appareils associés :** une association reste avec le téléphone et l’ordinateur où elle a été faite, et aucune
  sauvegarde ne la garde, mais une sauvegarde garde de quoi laisser le téléphone où elle est restaurée demander à
  chacun de s’associer de nouveau. Après la restauration d’une sauvegarde sur un autre téléphone, ouvre là
  **Réglages** → **Données et appareils** → **Appareils associés** : sous **De la sauvegarde**, appuie sur **Demander
  une nouvelle association** pour chaque appareil qui est encore à toi, ou sur **Oublier** pour un qui ne l’est plus.
  L’appareil, qui doit être allumé, montre la demande : appuie là sur **Associer de nouveau** seulement si c’est toi
  qui as restauré la sauvegarde, sinon sur **Pas maintenant**. Il s’associe alors au nouveau téléphone sans code à
  scanner, garde ses discussions et reçoit ce qui est venu depuis ; les messages arrivés sur l’ancien téléphone après
  la sauvegarde restent sur lui seul. Une fois associé de nouveau, ni l’ancien téléphone ni quiconque a la même
  sauvegarde ne l’atteint. Une demande vaut 14 jours, et les appareils d’un lieu caché sont demandés depuis
  l’intérieur de ce lieu. Un appareil avec un {=Erevos} plus ancien ne montre aucune demande : appuie dessus sur
  **Dissocier cet appareil**, puis associe-le comme la première fois, voir [Appareils associés](#devices). Les
  contacts qui ont cette version cessent d’écrire à tes ordinateurs jusqu’à ce qu’ils soient associés de nouveau : le téléphone leur donne une nouvelle liste de ses appareils qui n’en nomme aucun. Si l’horloge de ce
  téléphone retarde sur celle du téléphone perdu, cette liste disparaît dès qu’ils lui écrivent, et les détails de leur
  discussion peuvent dire qu’elle a changé le lendemain de ta restauration. La propre sauvegarde d’un ordinateur associé
  contient les discussions du téléphone telles qu’elles étaient, mais pas l’association permettant d’y écrire :
  restaurées, elles peuvent y être lues mais pas écrites, et Erevos le dit une fois. Pour y écrire, associe de nouveau
  cet ordinateur au téléphone : les discussions que le téléphone a encore restent, avec ce qui est arrivé depuis, et les
  autres disparaissent. Sur le téléphone, dissocie l’appareil qu’il était avant. Fais les sauvegardes sur le téléphone.
- **Versions :** une sauvegarde ne s’ouvre que dans un Erevos aussi récent que celui qui l’a faite, ou plus. Une
  sauvegarde faite par un {=Erevos} plus récent est refusée, sans rien changer : mets d’abord Erevos à jour vers la
  dernière version. Un Erevos d’avant la 6.0.0 dit d’une sauvegarde de la 6.0.0 ou plus récente que ce n’est pas une
  sauvegarde Erevos : mets-le à jour aussi.

## Morceaux de sauvegarde chez des amis {#backup-pieces}

Le mot de passe de vos sauvegardes peut aller à des amis en morceaux, dans **Réglages** → **Données et appareils** →
**Morceaux de sauvegarde** : choisissez **2 sur 3**, **2 sur 4**, **3 sur 4** ou **3 sur 5**, puis autant de contacts,
et touchez **Donner les morceaux**. Avec les sauvegardes automatiques activées, Erevos vérifie que le mot de passe que
vous tapez est bien le leur. Avec un serveur dans **Aussi vers un serveur**, les morceaux peuvent contenir aussi son
adresse, son nom d’utilisateur et son mot de passe, pour qu’on puisse y trouver et ouvrir les sauvegardes avec eux.
Chaque contact reçoit un message qui dit ce que c’est, et son {=Erevos} garde le morceau à part de la conversation, dans
**Morceaux que vous gardez pour des amis**.

1. **Pour le récupérer :** demandez leurs morceaux à assez d’entre eux. Chacun touche **Afficher le code** à côté du
   vôtre, et vous touchez **Scanner un code** dans **Rassembler vos morceaux** ; ou ils touchent **Copier** et vous
   envoient le texte autrement, et vous le collez puis touchez **Ajouter** ; ou, tant que votre téléphone a encore le
   compte, ils touchent **Le rendre dans votre conversation**. Touchez ensuite **Rassembler** : Erevos affiche le mot
   de passe et, avec un serveur dans les morceaux, **Restaurer depuis ce serveur** liste les sauvegardes qui s’y
   trouvent.
2. **Un nouveau mot de passe :** dès que vos sauvegardes ont un nouveau mot de passe, les morceaux donnés avant ne
   servent plus : donnez-en de nouveaux.

- **Ce que montre un morceau :** rien. Moins de morceaux que nécessaire ne disent rien du mot de passe, quelle que
  soit la puissance de calcul employée : avec eux, chaque mot de passe est aussi probable qu’un autre. Chaque morceau
  a la même taille, quel que soit le mot de passe, et rien dedans ne vous nomme, ni les autres amis.
- **Sur votre téléphone :** le message reste dans la conversation, mais pas son morceau : une fois parti, rien sur
  votre téléphone ne garde les morceaux, seulement à qui ils sont allés. Qui ouvre l’un de vos espaces apprend à qui
  vous avez donné des morceaux, pas le mot de passe. Les morceaux ne vont qu’aux contacts de l’espace, pas aux
  discussions cachées.
- **Ce que cela ne peut empêcher :** assez d’amis ensemble peuvent ouvrir vos sauvegardes s’ils obtiennent aussi le
  fichier : choisissez des personnes qui ne se connaissent pas toutes. Quelqu’un peut se faire passer pour vous, depuis
  un nouveau numéro ou un nouveau compte, pour obtenir les morceaux : un ami ne devrait rendre le sien qu’à vous en
  personne, ou dans la conversation qu’il a déjà avec vous. Un ami dont l’{=Erevos} est plus ancien que cette version voit
  le message mais ne garde aucun morceau.

**Pourquoi :** une sauvegarde n’est pas plus sûre que son mot de passe, et un mot de passe fort se perd facilement.
Partagé ainsi (le partage de secret de Shamir), aucun ami seul, ni aucun relay, ne détient de quoi l’ouvrir.

## Passer à un nouveau téléphone {#new-phone}

Tout ce qu’Erevos garde passe sur un nouveau téléphone dans une seule sauvegarde : chaque espace avec ses discussions
masquées, contacts, messages, photos{~, fichiers et Collection| et fichiers}, ses comptes et relais, le verrou, le mot de passe de
panique et tes réglages. Aucun serveur n’en garde une copie pour toi, donc rien ne passe tout seul : la sauvegarde le
porte, scellée avec son mot de passe.

1. **Sur le nouveau téléphone, installe {=Erevos} :** la même version que sur l’ancien, ou une plus récente, car un {=Erevos}
   plus ancien refuse une sauvegarde faite par un plus récent. Sans internet, l’ancien téléphone peut te le donner,
   voir [Erevos vers un téléphone proche](#give-app).
2. [~] **Sur l’ancien téléphone, prépare-le :** pour que les SMS du téléphone passent aussi, active **Inclure les SMS dans
   les sauvegardes** sous **Sauvegardes**, et pour son historique des appels **Inclure les appels dans les
   sauvegardes**. Une Collection laissée hors des sauvegardes reste derrière : remets-la, ou
   donne-lui un serveur WebDAV, voir [Collection](#collection).{+ Aie ta clé de sécurité Matrix sous la main, car Matrix
   se reconnecte sur le nouveau téléphone.}
3. **Sur l’ancien téléphone, fais la sauvegarde :** sous **Réglages** → **Données et appareils** → **Sauvegardes**,
   appuie sur **Créer une sauvegarde**, ou sur **Sauvegarder maintenant** avec les sauvegardes automatiques. Fais-la en
   dernier, juste avant de changer, et ensuite n’ouvre plus Erevos sur l’ancien téléphone : ce qui arrive après attend
   sur les relais pour le nouveau.
4. **Apporte-la :** copie la sauvegarde et chaque fichier dont le nom commence comme le sien, tous dans un dossier, sur
   le nouveau téléphone, par câble, carte mémoire ou app cloud. Une sauvegarde sur ton serveur n’a pas besoin d’être
   copiée.
5. **Sur le nouveau téléphone, restaure :** au premier démarrage, appuie sur **J’ai déjà {=Erevos} sur un autre téléphone**
   (ou passe le premier démarrage).{~ Sur Android, pour les SMS, laisse Erevos être aussi l’app SMS là-bas.} Puis, sous
   **Réglages** → **Données et appareils** → **Sauvegardes**, appuie sur **Restaurer une sauvegarde** et choisis le
   fichier, ou sur **Restaurer depuis un serveur** et donne l’adresse, le nom d’utilisateur et le mot de passe du
   serveur ; tape le mot de passe de la sauvegarde et dis oui. Erevos s’ouvre comme l’ancien téléphone était, avec les
   mêmes mots de passe.
6. **Sur le nouveau téléphone, remets ce qui est propre au téléphone :** **Autorisations** s’ouvre pour ce qu’Android
   doit permettre. Puis réactive l’empreinte ou le visage (voir [Verrou par mot de passe](#lock)), choisis de nouveau le
   dossier des sauvegardes automatiques sous **Sauvegardes**, et la SIM de chaque numéro{+, et connecte-toi à Matrix avec
   sa clé de sécurité}.
7. **Sur l’ancien téléphone, efface Erevos :** quand le nouveau téléphone montre tes discussions et que les nouveaux
   messages y arrivent, appuie sur **Tout effacer maintenant** sous **Réglages** → **Confidentialité et sécurité** →
   **Bouton de panique**. Pas sur **Me supprimer partout** : cela supprime les files d’attente des relais que lit le
   nouveau téléphone.

- **Un téléphone à la fois :** les deux téléphones lisent les mêmes files d’attente des relais, et un message va à celui
  qui le prend le premier, donc l’autre ne le reçoit jamais. Garde l’ancien fermé dès la sauvegarde et efface-le à la
  fin.
- **Tes contacts :** chaque espace garde son relais, son jeton et son relais d’attache, donc rien à retaper et aucune
  invitation à demander. Tes contacts t’écrivent comme avant.
- **Discussions masquées :** chaque lieu caché vient avec la sauvegarde, chacun avec son code PIN, et rien sur le
  nouveau téléphone ne dit qu’il y en a, voir [Discussions masquées](#hidden).
- [+] **Matrix, XMPP et Nostr :** une clé Nostr continue comme avant, un compte XMPP comme un nouvel appareil de lui-même,
  et Matrix se reconnecte comme un nouvel appareil, sa clé de sécurité ouvrant les messages d’avant, voir
  [Sauvegardes](#backup).
- **Appareils associés :** sur le nouveau téléphone, sous **Réglages** → **Données et appareils** → **Appareils
  associés**, appuie sur **Demander une nouvelle association** pour chaque ordinateur ou navigateur qui est encore à
  toi, puis sur **Associer de nouveau** dessus : il garde ses discussions, sans code à scanner. Les appareils d’un
  lieu caché depuis l’intérieur de ce lieu. Un appareil avec un {=Erevos} plus ancien : appuie dessus sur **Dissocier cet
  appareil**, puis associe-le au nouveau téléphone comme la première fois. Voir [Sauvegardes](#backup).
- [~] **La Collection :** elle vient dans les fichiers de la sauvegarde. Une laissée hors des sauvegardes vient seulement de
  son serveur WebDAV, chaque fichier à son ouverture ; une sans l’un ni l’autre reste sur l’ancien téléphone, et
  l’effacement la supprime.
- **{~Modules et réglages :** les modules activés, la|Réglages :** la} langue et tes autres réglages viennent avec la sauvegarde. Ce
  qu’Android garde pour chaque téléphone y reste, comme ce qu’il permet à Erevos{~ ; l’historique des appels et ses
  numéros bloqués viennent aussi avec **Inclure les appels dans les sauvegardes** activé}.
- **Un fichier manque :** si un fichier de la sauvegarde manque ou est abîmé, Erevos dit lequel et ne change rien, sauf
  si tu choisis de restaurer le reste sans lui.
- **Si l’ancien téléphone est perdu :** restaure ta sauvegarde la plus récente sur le nouveau téléphone dès que tu
  peux, depuis ton serveur aussi, puis appuie sur **L’ancien téléphone est perdu** sous **Sauvegardes**, pour qu’il ne
  lise plus rien de toi sur les relais. Si tu as perdu le mot de passe de la sauvegarde, les amis qui en gardent les morceaux
  peuvent te le rendre, voir [Morceaux de sauvegarde chez des amis](#backup-pieces).

**Pourquoi :** Erevos ne garde rien de toi sur un serveur qui pourrait le rendre, donc aucun compte ne porte tes
discussions sur un nouveau téléphone. Une sauvegarde, scellée avec son mot de passe, porte tout, et toi seul peux
l’ouvrir.

## Bouton de panique {#panic}

Quand vous êtes en danger, Erevos peut s’effacer d’un coup, dans **Réglages** → **Confidentialité et sécurité** →
**Bouton de panique** : touchez **Tout effacer maintenant** et dites **Effacer**. Sur Android, dans l’app web, sur un
ordinateur et sur Sailfish OS.

Pour le trouver vite en cas d’urgence, il est aussi en premier, en rouge, dans le menu **⋯** de l’écran d’accueil, et
maintenir appuyé le verrou en haut de l’écran d’accueil l’ouvre aussitôt. Un simple toucher sur le verrou verrouille
toujours ; seul le maintien ouvre le bouton de panique, et là **Tout effacer maintenant** demande encore une fois.

- **Ce qui part :** chaque espace avec ses discussions cachées, leurs contacts, messages, photos, fichiers et clés ; le
  verrou et ses mots de passe ; {+les comptes Matrix, XMPP et Nostr et }les jetons du relay ; les réglages et le mot de
  passe des sauvegardes automatiques, et de leur serveur. Sur Android, Erevos se ferme ensuite et s’ouvre la fois
  suivante comme fraîchement installé. Avec **Aussi les sauvegardes automatiques de** choisi, les fichiers de
  sauvegarde qui s’y trouvent partent d’abord.
- **Ce qui reste :** ce qu’Erevos ne peut atteindre : les sauvegardes copiées ailleurs ou envoyées à un serveur (leur
  mot de passe les protège toujours), ce que le relay garde pour vous jusqu’à expiration, et ce qu’ont vos contacts.

1. **Depuis une app de panique :** sur Android, une app de panique comme Ripple efface les apps que vous choisissez
   d’un seul geste. Installez-en une et choisissez-y Erevos : Erevos ouvre cet écran, après son mot de passe, et
   demande. Touchez **Dire oui**.
2. **Seulement cette app :** seule l’app à laquelle vous avez dit oui peut effacer Erevos, et seulement tant que **Une
   app de panique peut effacer Erevos** est activé. Erevos vérifie le nom de l’app et sa signature : une autre app, ou
   le même nom réinstallé par quelqu’un d’autre, ne le peut pas. Une mise à jour de l’app qui passe à une nouvelle clé
   comme Android le permet (rotation de clé) reste de confiance. **Ne plus faire confiance** y met fin.
4. **Quand Erevos a refusé :** si l’app de confiance a demandé d’effacer alors que l’interrupteur était coupé, ou signée
   d’une autre clé, cet écran le dit en rouge, avec le jour et l’heure. Quand l’app est signée d’une autre clé, **Faire
   confiance à … tel qu’il est maintenant** lui fait de nouveau confiance : dites oui seulement si vous l’avez mise à
   jour vous-même.
3. **Après l’effacement :** l’app de panique est oubliée aussi : redites-lui oui quand vous configurez Erevos à
   nouveau.

- **Sur un ordinateur et sur Sailfish OS :** il n’y a pas d’app de panique, seulement **Tout effacer maintenant**, avec
  **Aussi les sauvegardes automatiques de** leur dossier si vous le choisissez. Sur un ordinateur, Erevos redémarre
  ensuite comme fraîchement installé ; sur Sailfish OS, il se ferme. L’élément du trousseau pour Erevos reste sur un
  ordinateur, mais ce qu’il scellait a disparu, il n’ouvre donc plus rien.
- **Ce qu’il ne peut cacher :** sur le téléphone, sans le mot de passe, on voit encore qu’Erevos est installé et
  qu’une app de panique peut l’effacer, mais pas ce qu’il contenait.
- **Prévenir d’autres applis (Android) :** sous **Prévenir d’autres applis**, choisis les applis qu’Erevos prévient
  quand il efface, comme une appli de panique, depuis le bouton, le mot de passe de panique ou une appli de panique.
  Chacune te demande d’abord si Erevos peut. Fasouli se verrouille alors : il se ferme, et redemande son verrou à
  l’ouverture.

**Pourquoi :** à une frontière ou lors d’une arrestation, il n’y a peut-être pas le temps d’ouvrir chaque discussion.
Un toucher, ou le geste d’une app de panique, ne laisse rien à ouvrir.

### Mot de passe de panique

Avec le verrou par mot de passe activé, le même écran propose un **Mot de passe de panique** : un mot de passe à part
qui, saisi sur l’écran de verrouillage, efface Erevos comme **Tout effacer maintenant**. Sur Android, dans l’app web,
sur un ordinateur et sur Sailfish OS.

1. Touchez **Définir le mot de passe de panique**, saisissez-le deux fois (au moins 4 caractères) et touchez
   **Enregistrer**. Il doit différer de chaque mot de passe de vos espaces : Erevos en refuse un qui ouvre un espace,
   et le mot de passe d’aucun espace ne peut le devenir plus tard.
2. Saisi sur l’écran de verrouillage, il affiche **Mot de passe incorrect**, comme tout mot de passe incorrect, et
   Erevos efface tout aussitôt. Sur Android, Erevos se ferme ensuite et s’ouvre la fois suivante comme fraîchement
   installé, et les sauvegardes automatiques de leur dossier partent aussi quand **Aussi les sauvegardes automatiques
   de** est activé sous **Depuis une app de panique** ; ailleurs, elles restent.
3. **Désactiver le mot de passe de panique** en refait seulement un mot de passe incorrect. Le définir de nouveau
   remplace le précédent. Désactiver le verrou par mot de passe le désactive aussi.

- **Rien ne le montre :** Erevos garde une place pour un mot de passe de panique dès son premier démarrage, au hasard
  tant qu’aucun n’est défini et de même forme ensuite, et la vérifie avec chaque mot de passe saisi sur l’écran de
  verrouillage, de la même façon et pendant la même durée. Ni ce que garde le téléphone ni le temps d’une vérification
  ne montrent donc s’il y en a un de défini, et cet écran ne peut pas vous le dire non plus : si vous n’êtes pas sûr,
  définissez-le de nouveau.
- **Seulement sur l’écran de verrouillage :** saisi partout ailleurs où Erevos demande un mot de passe, ce n’est qu’un
  mot de passe incorrect. Les sauvegardes le gardent tel qu’il était quand elles ont été faites.
  Tant que des essais incorrects font attendre l’écran de verrouillage (voir [Verrou par mot de passe](#lock)), il
  attend aussi.

**Pourquoi :** quelqu’un peut vous forcer à ouvrir Erevos. Avec un mot de passe de panique, vous pouvez sembler lui
donner le vôtre, et ce qu’il verrait a disparu avant que l’écran ne change.

## Me supprimer partout {#forget}

Quand vous voulez que disparaisse ce que les serveurs gardent de vous, dans **Réglages** → **Confidentialité et sécurité** →
**Me supprimer partout** : touchez **Me supprimer partout** et dites oui deux fois. Votre téléphone garde tout ce qu'il a ; ce
n'est pas le [Bouton de panique](#panic), qui efface le téléphone.

- **Ce qui part :** chaque file que cet espace a sur les relais, avec les messages qui y attendent : la vôtre, celle que nomme
  votre lien de contact, celles de vos groupes, de vos contacts, de votre relais maison, {+celles des notifications Matrix et XMPP,
  }les portes de vos groupes publics et celles de vos appareils liés. Aussi les messages qu'un relais garde pour les envoyer plus
  tard, les fichiers arrivés qui y attendent, et les invitations que vous avez faites et que personne n'a utilisées. Les
  conversations cachées qui reçoivent même fermées partent avec l'espace ; les autres, quand vous les ouvrez alors que l'espace
  est arrêté. Les listes de l'écran laissent de côté les conversations cachées, pour ne jamais montrer qu'il y en a. Erevos
  demande aussi à chaque relais Nostr d'oublier les clés sur lesquelles vos conversations lisent (une demande de
  disparition, NIP-62) : via Tor quand Tor est activé, en direct quand il est désactivé. Avec Tor activé mais pas encore
  prêt, Nostr n'est pas sollicité ; attendez qu'il le soit, puis supprimez à nouveau.
- [+] **Matrix, XMPP, Nostr :** avec **Aussi me déconnecter de Matrix et XMPP, et supprimer le compte Nostr créé ici**, ces comptes
  sont déconnectés ici. Les comptes restent sur leurs serveurs, qui sont les leurs, pas ceux d'Erevos. Un compte Nostr apporté
  d'une autre appli est laissé tel quel.
- **L'espace est arrêté :** il ne reçoit et n'envoie rien, pour qu'aucune file ne soit aussitôt refaite (Erevos refait seul une
  file perdue). **Relancer** y met fin : de nouvelles files sont créées, comme lorsqu'un relais les a perdues, et vos contacts
  sont prévenus discrètement. Donnez-leur aussi un nouveau lien de contact, car les anciens nomment des files qui n'existent plus.
- **Ce que cela n'atteint pas :** les téléphones de vos contacts, les relais Nostr qui ne font pas ce qu'on leur demande,{- et} les
  fichiers envoyés via un serveur de fichiers{+, et les serveurs Matrix et XMPP}. L'écran liste ce qui a été supprimé, ce qui avait
  déjà disparu et ce qui n'a pas pu être atteint ; **Supprimer à nouveau** essaie le reste.

**Pourquoi :** un relais, même de confiance, est un endroit qui garde quelque chose de vous. C'est le seul geste qui reprend tout
sans effacer le téléphone, pour quand vous quittez un relais ou fermez un chapitre de votre vie.

## Discussions importées {#import}

Tes anciennes discussions de Telegram et de WhatsApp peuvent entrer dans Erevos, pour être lues, avec leurs photos,
vidéos, messages vocaux et fichiers, et celles de Viber avec leurs mots. Elles restent sur ce téléphone, scellées dans
l’espace où tu les fais entrer, et ne vont à personne, sauf si tu en partages une avec la personne avec qui elle a eu
lieu (plus bas).

Exporte d’abord la discussion depuis l’autre appli :

- **WhatsApp :** ouvre la discussion, puis **Plus**, **Exporter la discussion**, **Inclure les médias**, et enregistre
  le .zip sur le téléphone. **Sans médias** n’apporte que les mots.
- **Telegram Desktop :** **Exporter l’historique de la discussion**, format **JSON**, avec les photos, vidéos, messages
  vocaux et fichiers que tu veux. Ensuite, fais un .zip du dossier qu’il a créé (sous Windows : clic droit dessus,
  **Envoyer vers**, **Dossier compressé**) et copie le .zip sur le téléphone. **result.json** seul n’apporte que les
  mots.
- **Viber :** Viber lui-même n’exporte aucune discussion. Sur Android, l’appli **Backup Text for Viber** en enregistre
  une sous forme de fichier .html : copie-le sur le téléphone. Seuls les mots entrent, avec les émoticônes de Viber en
  emoji. Tes propres messages là-bas ne portent aucun nom, alors ils entrent comme **Moi**, déjà choisi comme étant toi.
  Les messages datés d’un jour d’avant l’existence de Viber, comme 1970, viennent d’un téléphone dont l’horloge était
  fausse : ils entrent sans heure.

Ensuite :

1. Dans Erevos, ouvre **Réglages** → **Données et appareils** → **Discussions importées** et appuie sur **Importer un
   fichier**, puis choisis le fichier.
2. Erevos dit ce qu’il a trouvé, avec combien de photos et de fichiers et quelle taille ils font ensemble. Appuie sur
   ton propre nom, pour que tes messages s’affichent à droite, et appuie sur **Garder**. Les fichiers entrent l’un après
   l’autre, et il dit combien et quelle part d’entre eux est entrée. **Annuler** l’arrête alors, et n’en garde aucun.
3. Supprime toi-même le fichier exporté du téléphone : Erevos garde sa propre copie scellée, mais le fichier que tu as
   enregistré n’est pas scellé.

Pour continuer la conversation dans Erevos, l’autre personne a aussi besoin d’Erevos :

1. Avec **Nouvelle discussion**, ajoute-la comme contact par le relais, comme dans [Discuter par un relais](#relay).
2. Ouvre la discussion importée, appuie sur **Continuer dans Erevos** et choisis-la.
3. Sa discussion montre maintenant les anciens messages avant les nouveaux, comme s’ils avaient toujours été dans
   Erevos : en bulles, par jour, avec leurs heures, et **Suite dans Erevos** entre eux et les nouveaux. **Ouvrir la
   discussion** t’y emmène, et un contact que tu n’as pas nommé prend le nom de la discussion importée.

**Depuis la discussion :** la discussion d’un contact a **Discussions importées** dans ses **Détails**, au-dessus de
**Confidentialité**. **Importer une discussion ici** fait entrer un fichier directement dans cette discussion, sans
passer par **Réglages** : quand le fichier contient plusieurs discussions, comme un export Telegram de toutes les
discussions, il demande laquelle continue ici, et propose la plus longue. Chaque discussion importée qui continue là est
listée avec trois boutons :

- **Seulement dans la discussion** la retire de **Réglages** → **Données et appareils** → **Discussions importées** :
  elle ne s’affiche que dans cette discussion, comme si elle y avait toujours été. Une discussion amenée depuis les
  détails de la discussion est gardée ainsi dès le départ. **Afficher aussi dans Discussions importées** la remet dans
  la liste, et la liste elle-même le fait aussi, quand ce contact n’est plus là.
- **Dissocier** cesse de l’afficher dans la discussion ; elle reste dans **Discussions importées**, pour la lire ou pour
  continuer avec quelqu’un d’autre.
- **Supprimer** la supprime du téléphone, avec ses photos et ses fichiers, après avoir demandé.

**Pourquoi :** une ancienne discussion va avec la personne avec qui elle a eu lieu, alors elle est amenée, gardée et
supprimée là où tu lui parles, et la liste dans **Réglages** ne garde que ce qui n’a nulle part ailleurs où aller. Rien
n’en quitte le téléphone, sauf si tu la partages.

- Les **photos, vidéos, messages vocaux et fichiers** entrent depuis un .zip, chacun scellé dans cet espace comme l’est
  un fichier dans une discussion. Les photos s’affichent dans la discussion à mesure que tu fais défiler jusqu’à elles,
  et les stickers comme des stickers ; appuie sur une photo ou un fichier pour le voir seul et l’**Enregistrer**. Les
  messages vocaux et les chansons se lisent directement dans la discussion d’un appui ; une vidéo se lit dans l’appli du
  téléphone une fois enregistrée. Maintiens un message importé pour le **Copier** ou **Ouvrir** son fichier.
  **Rechercher dans cette discussion** trouve aussi les messages importés. Les fichiers de plus de 4 Go, et ceux que
  l’export ne contient pas, restent en arrière, et la discussion dit où il y en avait un.
- **De la place sur le téléphone :** pendant qu’un .zip entre, le téléphone a besoin d’environ deux fois sa taille
  d’espace libre, car Erevos en lit une copie et garde les fichiers scellés. Les fichiers importés sont aussi
  dans les sauvegardes, comme les autres fichiers.
- **Seulement pour les lire :** les messages importés ne sont pas envoyés comme messages, donc l’autre téléphone ne les
  a que si tu partages la discussion avec lui. Erevos ne peut pas montrer qui les a vraiment écrits.
- Les **notifications et appels** de l’autre appli sont laissés de côté, et la discussion dit combien.
- **Dans les discussions masquées** aussi : dans les **Détails** d’une discussion masquée, **Importer une discussion
  ici** garde la discussion avec cet emplacement, chiffrée avec sa clé, et ne l’affiche que dans cette discussion,
  jamais dans **Réglages** → **Données et appareils** → **Discussions importées** ; là, elle ne peut qu’être supprimée.
  Une discussion déplacée dans les discussions masquées emporte avec elle les discussions qui y ont été importées,
  gardées là-bas seulement en elle, et les ramène si elle revient.
- **Supprimer les messages** dans une discussion laisse les messages importés : supprime-les dans les **Détails** de la
  discussion, sous **Discussions importées**, ou dans **Réglages** → **Données et appareils** → **Discussions
  importées**.

**Partage-la avec cette personne :** la personne avec qui continue une discussion importée peut l’avoir aussi. Dans les
**Détails** de sa discussion, sous **Discussions importées**, touche **Partager avec** et son nom ; dans **Réglages** →
**Données et appareils** → **Discussions importées**, une discussion qui continue avec quelqu’un a le même bouton, qui
ouvre sa discussion. Erevos dit combien de messages partent et quelle taille, et demande d’abord. Ensuite toutes les
discussions importées avec cette personne partent ensemble, quelle que soit leur taille, chaque message avec chaque
photo, vidéo, message vocal et fichier gardé, à elle seule, chiffrés de bout en bout par ton relais, et la discussion
dit que tu l’as partagée.

- **De son côté**, il n’y a rien à faire : son {=Erevos} garde aussitôt les messages, dit dans la discussion qui les a
  partagés, d’où et combien, et les montre avant les nouveaux, en lecture seule, comme une discussion importée. Les
  photos et fichiers arrivent ensuite à mesure, et sous cette ligne s’affiche combien sont arrivés, **Fichiers : 3 sur
  10**. Les côtés sont inversés : ce que tu as écrit apparaît comme venant de toi, à sa gauche, et dans une discussion à
  deux ce que cette personne a écrit apparaît comme le sien, à droite ; dans un groupe, chacun garde son nom. Elle n’est
  gardée que dans votre discussion là-bas, et peut être supprimée dans ses **Détails**. Ses appareils associés ne
  gardent que les messages.
- **Partagée à nouveau**, elle prend la place de la copie qu’il y avait, donc elle n’y est jamais deux fois. Une
  discussion que quelqu’un a partagée avec toi n’est pas partagée plus loin.
- **Seulement avec elle :** seulement avec un contact Erevos avec qui la discussion continue, jamais avec un groupe, et
  elle ne peut pas être transférée. Dans les discussions masquées, c’est pareil, et de son côté elle reste là où est
  votre discussion, masquée aussi.
- **Par tours :** les photos et fichiers partent après les messages, quelques dizaines de Mo à la fois : chaque tour
  attend sur ton relais que son téléphone le prenne et l’y supprime, puis le suivant part. Ainsi une discussion de
  n’importe quelle taille part, chaque fichier jusqu’à 4 Go, et prend peu de la place du relais, que d’autres fichiers
  partagent ; quand le relais est plein, Erevos attend et redemande, un peu plus tard à chaque fois. Ça continue dès
  qu’Erevos tourne sur les deux téléphones, aussi après que l’un a été éteint ou hors ligne un moment ; un tour pas pris
  en 12 jours est remis sur le relais avant d’expirer. Un fichier supprimé de ce téléphone depuis est nommé comme resté
  en arrière.
- **Où il en est** s’affiche sous ta ligne dans la discussion, **Partage, 40 %**. Touche-la pour **Arrêter le partage**
  : ce qui attend sur le relais en est retiré, et son {=Erevos} supprime ce qui est arrivé. Si cette personne supprime les
  discussions, ça s’arrête de la même façon.
- **Depuis un relais où leur Erevos ne prend pas de lui-même**, les discussions attendent de leur côté un appui sur leur
  ligne ; elle dit alors où elles en sont, **Réception, 40%**, et ta ligne dit **Partage · son téléphone le récupère**.
  Si elles n’ont pas pu être prises, les deux téléphones le disent et le leur vibre deux fois : ils appuient pour
  réessayer. Les prendre là-bas sans Tor montre à ce serveur leur adresse internet, et Erevos le dit d’abord.
- **Un Erevos plus ancien** reçoit à la place un fichier, **Discussion depuis Telegram.json**, avec les messages dedans
  en texte, et aucune des photos ni aucun des fichiers.

> Le fichier des discussions importées grandit avec ce que tu y fais entrer, donc sa taille dit à peu près combien a été
> importé, mais pas dans quel espace.

## Apparence {#appearance}

L’**Apparence** suit Fasouli et le site LPHL. Elle se trouve sous **Réglages** → **Apparence**, en parties qui
s’ouvrent chacune seule : **Style et couleurs** (le rendu, le verre, le style, le thème, les couleurs et le texte sur
les zones colorées ci-dessous, avec l’**Aperçu**), **Fond d’écran**, **Messages**, et sur Android **Icônes du lanceur**
et **Widget**.

| Réglage | Choix |
| --- | --- |
| **Rendu** | **Plat**, ou **Glass** comme sur lphl.nekten.eu. Le verre se décline en deux sortes : **Vitres** (chaque carte est une vitre sur le fond d’écran) et **Une vitre** (chaque écran sur une seule vitre dépolie). |
| **Style** | **Classic** (le sombre et l’or d’Erevos), **Modernist** (Inter Tight), **Nocturne** (toujours sombre, avec ses propres couleurs), **Neon** (des LED cyan et magenta qui brillent, sur une grille qui file vers un soleil couchant), **Matrix** (vert sur noir en chasse fixe, avec du code qui pleut derrière), **Paper** (bleu de stylo-plume sur crème, avec empattements, sur des lignes réglées et une marge rouge), **Aurora** (violet sur un blanc presque pur, doux et arrondi, sur des flaques de lumière menthe, lilas et pêche), **Material You** (les couleurs du téléphone, sur Android 12 et plus récent) et **Personnalisé** (ton propre fond et ton propre accent). |
| **Thème** | **Système**, **Clair** ou **Sombre**. Nocturne, Neon et Matrix sont toujours sombres, Paper et Aurora toujours clairs, et Personnalisé est clair ou sombre selon son fond. Material You le suit. |
| **Couleurs** | Celles du style, l’une des douze palettes LPHL, ou **Ma couleur**. Choisir une palette sous un style qui a ses propres couleurs revient au style choisi avant. |
| **Personnalisé** | Avec **Personnalisé** choisi : son **fond** (huit clairs, huit sombres) et son **accent**. Le texte et les surfaces sont tirés du fond, et chaque couleur est vérifiée pour rester lisible dessus. |
| **Texte sur les zones colorées** | **Blanc**, **Comme la palette**, ou **Ma couleur**. |
| **Police** | Les lettres de chaque texte : **Celle du style**, **Celle du téléphone**, **Avec empattements** (petits traits au bout des lettres, comme dans les livres) ou **Chasse fixe** (chaque lettre aussi large, comme à la machine à écrire). |
| **Fond d’écran** | Ce qui se trouve derrière chaque écran : **Selon le style** (la scène ou la lueur propre au style), **Uni**, ou un motif tracé légèrement dans l’accent : **Points**, **Grille**, **Rayures**, **Étoiles**, **Lumières** (de doux cercles de lumière) ou **Dégradé** ; ou **Photo**, une photo à toi, réduite, redessinée et scellée, sous un voile pour que le texte se lise (**Changer de photo** en choisit une autre). L’écran du mot de passe montre celui du style à la place. |
| **Messages** | Comment une discussion dessine les messages : en bulles rondes (**Arrondi**) ou carrées (**Carré**), ou en **Ligne**, sans bulle mais avec un trait à côté du texte, comme un journal. |
| **Taille du texte** | La taille du texte des messages : **Petit**, **Normal**, **Grand** ou **Plus grand**. Le reste de l’écran ne change pas. |

Erevos, tout juste installé, commence en **Glass** (**Vitres**), **Modernist**, **Système**, **Ma couleur** en bleu ciel, texte **Comme la palette**, police **Celle du téléphone** et messages **Carré**. Un aspect choisi avant reste tel qu’il était.

Neon, Matrix, Paper et Aurora dessinent leur propre scène derrière chaque écran, Personnalisé garde le fond que tu as
choisi et Material You les couleurs du téléphone, alors **Glass** attend tant qu’ils sont choisis. La pluie reste
immobile quand le téléphone est réglé pour réduire les animations.

L’**Aperçu** montre quelques messages et boutons dans l’apparence que tu as choisie. Chaque combinaison est vérifiée
pour que le texte se lise toujours bien, sur le verre aussi.

- **Chaque espace garde sa propre apparence.**
- **L’écran du mot de passe** montre la dernière apparence utilisée. Pour cela, elle est gardée en dehors des données
  scellées : elle ne dit rien de tes discussions, mais quiconque ouvre le téléphone voit quelle apparence tu utilises.
- **Material You** prend les couleurs qu’Android tire de ton fond d’écran (Android 12 et plus récent), clair ou sombre
  selon ce que dit **Thème**, avec des boutons ronds et des cartes doucement arrondies, dans la police du téléphone. Un
  nouveau fond d’écran les change aussi dans Erevos, dès qu’il s’affiche de nouveau. Elles sont lues sur le téléphone et
  ne vont nulle part. Sur un Android plus ancien et sur un ordinateur, il n’est pas proposé.
- **Icônes du lanceur** (Android) : la couleur de chacune des icônes d’Erevos parmi les applis du téléphone, **Erevos**
  (rouge, elle ouvre les discussions d’Erevos, ou la discussion que tu as laissée ouverte){~, **Téléphone** (verte, elle
  ouvre le clavier), **SMS** (bleue, elle ouvre la liste des SMS)} et **Contacts** (violette) : rouge, orange, vert,
  bleu, violet ou sombre. Chaque appui ouvre ce que son icône nomme, même quand Erevos montrait une autre d’entre elles.
  La couleur est celle du téléphone, pas de chaque espace, car les icônes s’affichent avant qu’Erevos soit déverrouillé.
  Après un changement, certains lanceurs retirent l’icône de l’écran d’accueil : ajoute-la de nouveau depuis la liste
  des applis.
- **Points et nombres sur les icônes** (Android) : Android donne le point ou le nombre d’une notification à l’appli,
  pas à l’une de ses icônes ; sur la plupart des lanceurs, comme ceux des Pixel et de GrapheneOS, celui de Samsung,
  celui de Xiaomi et Kvaesitso, chaque notification d’Erevos (un message, {~un SMS, |}un appel, un anniversaire) s’affiche
  donc à l’identique sur les icônes Erevos{~, Téléphone, SMS et| et} Contacts, et Erevos n’y peut rien changer. Pour garder
  le point pour certaines notifications seulement, désactive-le pour les autres dans les réglages d’Android pour les
  notifications d’Erevos, où chaque type de notification a son propre interrupteur. Les lanceurs de Huawei et d’Honor
  acceptent un nombre pour chaque icône : là, avec **Réglages** → **Notifications** → **Nombre sur l’icône** →
  **Afficher le nombre**, l’icône d’Erevos elle-même montre les messages que compte sa notification, {~celle des SMS les
  SMS non lus, celle du Téléphone les appels manqués |}et celle des Contacts un anniversaire du jour, chaque nombre sur
  sa propre icône seulement.
- **Calculatrice à la place d’Erevos** (Android, sous **Icônes du lanceur**) : une calculatrice qui fonctionne
  apparaît parmi les applis du téléphone à la place de l’icône d’Erevos. Appuie sur **Mettre la calculatrice à sa
  place**, saisis deux fois un code de 4 à 12 chiffres et appuie sur **Enregistrer**. Ensuite, ouvre la calculatrice,
  tape le code, puis **=** : Erevos s’ouvre en demandant son mot de passe comme toujours. Tout autre calcul n’est
  qu’un calcul. **Changer le code** le change ; **Réafficher l’icône d’Erevos** ramène l’icône, dans sa couleur, et
  oublie le code. Seule l’icône est cachée : la liste des applis d’Android, les notifications, les applis récentes et
  {~les icônes Téléphone, SMS et Contacts montrent|l’icône Contacts montre} toujours Erevos. Le téléphone ne garde qu’un hash du code : c’est une
  porte, pas la serrure. Une fois Erevos effacé, par le mot de passe de panique ou par **Vider le stockage**
  d’Android, plus aucun code ne l’ouvre : la calculatrice ouvre alors Erevos, comme neuf, et l’icône d’Erevos reprend
  sa place.

  **Pourquoi :** celui qui jette un œil au téléphone voit une calculatrice, pas une messagerie ; le mot de passe garde
  toujours ce qu’il y a dedans.
- **Widget** (Android) : l’ordre des {~quatre|deux} boutons du widget, de gauche à droite, avec le widget dessiné tel qu’il
  sera. Appuie sur ↑ ou ↓ pour déplacer un bouton ; **Ordre initial** les remet en place.
- **Vibrer au toucher** (Android) : une brève vibration quand tu touches une touche du clavier, Envoyer, Entrée ou un interrupteur, et quand un menu s’ouvre ; jamais pendant le défilement. Activée, sauf si tu l’éteins ici. Elle est celle du téléphone, la même dans chaque espace.

## Sur un ordinateur {#desktop}

Erevos fonctionne aussi sur un ordinateur, sous Linux, macOS ou Windows, comme une appli à part entière. Il discute par
un relais, chiffré de bout en bout comme sur le téléphone, et garde ses contacts, ses messages et ses réglages scellés
de la même façon.

1. Installe-le. Sous Linux : le paquet pour les systèmes basés sur Arch (\`erevos-linux-x86_64.pacman\`, avec \`sudo
   pacman -U\`) ou l’AppImage. Sur un Mac : ouvre l’image disque et fais glisser Erevos dans Applications. Il n’a pas de
   signature Apple payante, alors la première fois, autorise-le sous **Réglages Système → Confidentialité et sécurité →
   Ouvrir quand même**. Sous Windows 10 ou 11 : lance \`erevos-windows-x64-setup.exe\`, qui installe Erevos pour toi
   seul, sans administrateur, et le met dans le menu Démarrer ; ou garde \`erevos-windows-x64-portable.exe\` où tu veux
   et lance-le, sans rien installer. Aucun des deux n’a de signature payante, alors la première fois Windows dit qu’il a
   protégé ton ordinateur : clique sur **Informations complémentaires**, puis sur **Exécuter quand même**.
2. Configure le relais et ajoute des contacts comme sur le téléphone, voir [Discuter par un relais](#relay). **Copier
   mon lien de contact** copie ton lien, à coller là où il doit aller.

- **Ce que seul le téléphone fait :** Bluetooth, Wi-Fi Aware et LoRa, et leurs tests. Les contacts sur le même Wi-Fi, il
  les joint comme le fait un téléphone, voir [Discuter avec un téléphone à proximité](#nearby). Le reste est pareil :
  les espaces et le second mot de passe, les discussions masquées, les messages vocaux, les discussions importées et les
  sauvegardes.
- **Où il garde les choses :** dans son propre dossier (sous Linux \`~/.config/Erevos\`, sur un Mac
  \`~/Library/Application Support/Erevos\`, sous Windows \`%APPDATA%\\Erevos\`), scellé comme sur le téléphone. Son
  magasin de clés est scellé avec le trousseau du système (sur un Mac le Trousseau, sous Windows la clé de ton compte
  Windows). Sur un système Linux sans trousseau (KWallet ou GNOME Keyring), ou avec un trousseau qu’Erevos ne trouve
  pas, Erevos s’ouvre avec une note et ne garde rien : démarre le trousseau, ou donne à Erevos
  \`--password-store=gnome-libsecret\`. Lancé avec \`--plain-secrets\`, il y garde son magasin de clés tel quel, lisible
  par ton utilisateur : configure alors un verrou par mot de passe. L’appli Windows portable garde ses choses dans le
  même dossier que l’appli installée, et la désinstaller les y laisse.

**Pourquoi :** sans trousseau, le magasin de clés resterait sur le disque tel quel, lisible par ton utilisateur, alors
Erevos n’y garde rien à moins que tu ne le choisisses avec \`--plain-secrets\` : aucun emplacement de mot de passe n’y
reste non scellé par surprise.

- **Le pare-feu de Windows** demande, la première fois qu’Erevos s’ouvre, s’il peut utiliser le réseau. Autorise-le sur
  les réseaux privés, sinon les téléphones et les ordinateurs sur le même Wi-Fi ne peuvent pas le joindre ; les relais
  fonctionnent dans les deux cas.
- Les **messages vocaux** enregistrés sur un ordinateur sont en Opus, sur un téléphone en AAC. Les deux se lisent sur
  les deux.
- Les **photos** viennent des fichiers de l’ordinateur ; il n’y a pas d’appareil photo. **Enregistrer** demande où
  mettre une photo ou un fichier.
- **Un ordinateur et un téléphone peuvent partager un compte :** associe l’ordinateur au téléphone, et les deux ont les
  mêmes discussions et les mêmes contacts, voir [Appareils associés](#devices). Ou bien une sauvegarde déplace tout de
  l’un à l’autre, voir [Sauvegardes](#backup), et à partir de là n’utilise que l’un des deux.
- **En arrière-plan :** fermer sa fenêtre laisse Erevos tourner dans la zone de notification (sur un Mac, dans le Dock),
  sauf si tu le désactives : **Réglages** → **Notifications** → **En arrière-plan** → **Quitter à la fermeture**. Il
  continue d’attendre sur le relais : un appel sonne, avec une sonnerie à lui, et fait revenir la fenêtre, et une
  notification dit combien de messages ne sont pas lus, jamais de qui ni quoi, jusqu’à ce qu’Erevos s’affiche de
  nouveau. Tu l’ouvres depuis son icône dans la zone de notification, ou en relançant Erevos, et tu le quittes depuis le
  menu de cette icône (sur un Mac, depuis son menu). Là où le bureau n’affiche pas de zone de notification, comme GNOME
  sans extension pour cela, relancer Erevos fait revenir la fenêtre. Une fois quitté, il ne reçoit rien : les messages
  attendent sur le relais, et un appel s’affiche comme appel manqué dès qu’il s’ouvre.
- Les **appels** sonnent tant qu’Erevos est à l’écran, avec une sonnerie à lui : deux courtes toutes les 3 secondes,
  jusqu’à ce que l’appel soit décroché ou se termine.
- **Testé jusqu’ici** sous Linux. Les versions Mac et Windows sont compilées et ouvertes sur les ordinateurs de GitHub,
  pas encore par une personne.

## Appareils associés {#devices}

Le même compte sur le téléphone et sur un ordinateur, ou dans un navigateur : les mêmes discussions, contacts et
messages sur les deux. Le téléphone reste le compte : lui seul ajoute des contacts, et associe et dissocie des
appareils. Chaque appareil associé a ses propres clés, que le téléphone signe dans une liste des appareils du compte et
donne à ses contacts. Les contacts sur cette version écrivent alors aussi à chaque appareil, chiffré de bout en bout, si
bien qu’il reçoit leurs messages même téléphone éteint ; pour ceux sur des versions plus anciennes, le téléphone
transmet à l’ordinateur ce qui arrive, et scelle pour eux ce que l’ordinateur écrit. Les contacts voient le même compte
et le même numéro de sécurité, quelle que soit la version d’Erevos qu’ils ont.

**Pourquoi :** chaque appareil a ses propres clés, jamais une copie de celles du compte : Erevos n’a pas de serveur qui
pourrait couper un appareil perdu, donc un appareil n’est jamais plus qu’une entrée dans une liste que le téléphone
signe, et le dissocier suffit. La liste a toujours quatre places, celles qu’aucun appareil n’occupe contenant des clés
faites pour rien, pour que les contacts ne puissent pas savoir combien d’appareils tu as. Et avec le téléphone comme
compte, les contacts sur n’importe quel Erevos plus ancien te joignent comme avant.

Pour associer un ordinateur :

1. Sur l’ordinateur, dans un espace sans discussions à lui (une nouvelle installation, un espace qu’ouvre un nouveau mot
   de passe, ou les discussions d’un ordinateur associé restaurées depuis sa sauvegarde), ouvre **Réglages** → **Données
   et appareils** → **Appareils associés**. Là, **Associer à mon téléphone** vient en premier et affiche aussitôt un
   petit code QR : rien à saisir.
2. Sur le téléphone, scanne le code avec l’appareil photo : Erevos demande **Associer … à ce téléphone ?** Choisis
   ce qui part de l’historique (**Tout**, **Le dernier mois**, **La dernière semaine** ou **Aucun**), si **Les photos et
   fichiers aussi**, puis appuie sur **Associer**. C’est tout : le téléphone donne à l’ordinateur ce qu’il lui faut via
   Nostr, chiffré de bout en bout, l’ordinateur montre au téléphone son propre code et les codes de sécurité se
   comparent d’eux-mêmes, donc tu ne saisis ni ne compares rien.
3. Si Nostr est injoignable, ou si l’ordinateur ne peut pas utiliser le relais, il le dit. Appuie là-bas sur **Associer
   autrement** : s’il demande un relais, celui de LPHL est déjà rempli, appuie donc sur **Se connecter avec LPHL** pour
   un jeton propre à l’ordinateur, ou tape un autre relais et son jeton. Nomme l’appareil et appuie sur **Associer à mon
   téléphone** : il affiche alors un code QR plus grand. Scanne-le avec le téléphone, ou copie le code, colle-le sur le
   téléphone sous **Code de l’ordinateur** et appuie sur **Suivant**. Le téléphone affiche le nom de l’ordinateur et un
   code de quatre groupes de cinq chiffres ; choisis comme ci-dessus et appuie sur **Associer**.
4. Seulement ainsi, l’ordinateur affiche aussi un code : si c’est celui du téléphone, appuie sur **Ils correspondent**.
   Sinon, appuie sur **Ils sont différents** : quelqu’un d’autre a peut-être lu son code QR, et rien ne lui est
   parvenu. Les discussions masquées ne s’associent que de cette façon, de l’intérieur, avec le code complet.

Les discussions arrivent alors sur l’ordinateur, et après elles les messages choisis.

- Les **messages** des contacts arrivent sur les deux, et chacun ne les garde qu’une fois : un message qui arrive de
  nouveau dans les 30 jours (jusqu’à 2000 d’un même contact) n’est pas gardé de nouveau, même après avoir disparu ou
  avoir été supprimé là. Pour cela, chacun garde, pendant 30 jours, quels messages sont arrivés et quel jour, pas ce
  qu’ils disaient, y compris une fois qu’ils ont disparu ou ont été supprimés, et dans une sauvegarde faite
  entre-temps ; le téléphone le garde aussi pour un contact qui a associé un appareil. Ce que tu écris sur l’ordinateur
  va directement de lui à un contact sur cette version, une fois que celui-ci a écrit à l’ordinateur, et par le
  téléphone sinon : le téléphone l’affiche comme venant de toi, et le contact le reçoit du compte. Ce que tu écris sur
  le téléphone s’affiche aussi sur l’ordinateur. Les marques de lecture, les réactions, les épingles, les votes, la
  suppression sur les deux téléphones, les noms, les minuteurs, les apparences et les images des discussions, le fait
  d’apparaître hors ligne et l’acceptation des demandes vont dans les deux sens. Une étoile, ou une suppression sur **Ce
  téléphone**, faite sur le téléphone va aussi sur l’ordinateur ; faite sur l’ordinateur, elle reste là.
- **Téléphone éteint**, les contacts sur cette version joignent toujours l’ordinateur, et l’ordinateur les joint : ce
  qu’ils écrivent, ce qu’ils lisent et ce à quoi ils réagissent arrive, et ce que tu écris part. Si le téléphone reste
  éteint si longtemps que sa file d’attente sur le relais se remplit (1000 messages), ce qu’ils écrivent et lisent
  atteint toujours l’ordinateur, un long message vocal en entier ; ce à quoi ils réagissent, ce qu’ils épinglent, ce
  pour quoi ils votent ou ce qu’ils suppriment, et leurs appels, ne passent pas avant que le téléphone soit de nouveau
  allumé. Pour les contacts sur des versions plus anciennes (leur ajout aussi) et les groupes, **le téléphone doit être allumé** et joindre le relais : ce que l’ordinateur écrit
  entre-temps attend sur le relais, et part une fois le téléphone revenu. Quelqu’un de nouveau dont le lien de contact vient de cette version, l’ordinateur
  l’ajoute aussi téléphone éteint : il commence lui-même la discussion, la personne voit ton compte comme une demande, et
  le téléphone l’ajoute aussi une fois allumé. Deux appareils associés ou plus se joignent
  aussi directement : téléphone éteint, chacun montre toujours ce que les autres écrivent, lisent et ce à quoi ils
  réagissent, et les changements qu’ils font aux contacts ; celui qui a manqué le premier message d’un autre en reçoit
  un nouveau un jour ou plus après. Un ordinateur resté éteint plus longtemps que le relais ne garde les messages (14
  jours), ou qui a manqué le premier message d’un contact pour lui, reçoit quand même ce que ce contact écrit ensuite :
  son {=Erevos} recommence avec lui un jour ou plus après, puis de moins en moins souvent, jusqu’à ce qu’il réponde. Après
  qu’un contact t’a supprimé et ajouté de nouveau, l’ordinateur recommence aussi avec ses appareils.
- Les **photos et fichiers** qui arrivent restent sur le relais jusqu’à ce que le téléphone et l’ordinateur les aient
  pris tous les deux ; ensuite le téléphone les y supprime. Ceux que l’ordinateur ne prend jamais partent quand il est
  dissocié, ou après 14 jours, comme tout ce qui n’est pas pris.
- **Discussion avec moi-même** est la même sur chaque appareil : une note, une photo, un fichier ou un message vocal
  écrit sur l’un va aux autres, de même qu’un rappel défini, changé ou vu et une note supprimée ; de deux changements
  d’une même note, c’est le plus récent qui reste. Ce qui a été écrit avant l’association part une fois, dans les deux
  sens, dès que les deux ont cette version. Un rappel s’affiche sur chaque appareil à son heure, et vu sur l’un il
  disparaît des autres. La photo ou le fichier d’une note part en copie sur le relais, supprimée de là une fois prise,
  ou, pour deux appareils ou plus, laissée là jusqu’à son expiration (14 jours). Les notes des discussions masquées ne
  partent que dans leur propre association, plus bas.
- **Réglages :** la langue, l’apparence (le style, les couleurs, la taille du texte) et **Vu pour la dernière fois**
  sont les mêmes sur chaque appareil de l’espace : changées sur l’un, elles changent aussi sur les autres. Une photo
  derrière les écrans reste sur l’appareil où elle a été choisie, comme tout ce qui ne concerne qu’un appareil : mots
  de passe, codes PIN et code de panique, le délai du verrouillage, la vibration, le relais et Tor,{~ les modules,} le
  nom de l’appareil. Un appareil qui doit garder les siens : **Réglages** → **Données et appareils** → **Appareils
  associés** → **Mêmes réglages sur tous les appareils** désactivé. Réactivé, il prend aussitôt ceux des autres. Les
  discussions cachées gardent les leurs.
- **Par Tor pour une discussion :** le réglage **Par Tor** dans les **Détails** d’une discussion Erevos est le même sur
  chaque appareil : activé ou désactivé sur l’un, il l’est sur tous. Sur un appareil sans Tor, comme l’application web,
  cette discussion n’envoie rien tant qu’il est activé. Un appareil sur une version plus ancienne ne le désactive
  jamais pour les autres. Voir [Par Tor](#tor).
- **Sur le même Wi-Fi :** le téléphone et un ordinateur sur le même Wi-Fi ou point d’accès (avec **Trouver Erevos sur le même Wi-Fi** activé) se donnent ce qui change directement là, sans internet aussi ; le relais reçoit quand même sa copie,
  qui ne change alors plus rien. Seulement ceux de l’espace : les associations des discussions cachées passent par le
  relais.
- Les **appels** sonnent sur le téléphone et sur l’ordinateur. Réponds sur l’un ou l’autre : l’autre cesse de
  sonner, et dit qu’on a répondu sur un autre appareil. Refuser un appel sur l’un le refuse sur les deux. Avec un
  contact sur cette version, l’ordinateur appelle et reçoit les appels lui-même, téléphone éteint aussi ; avec un
  contact sur une version plus ancienne, il appelle par le téléphone, qui ne doit rester allumé que pour établir
  l’appel. Dans les deux cas, l’appel lui-même passe directement entre l’ordinateur et le contact, chiffré entre eux.
- L’**envoi pour plus tard** marche aussi sur l’ordinateur. À un contact sur cette version, l’ordinateur le remet
  lui-même au relais, avec une copie pour chacun de ses appareils : il part à son heure ton téléphone éteint, et
  arrive sur les siens son téléphone éteint ; à un contact sur une version plus ancienne, il passe par le téléphone.
  Chacun de tes appareils le montre comme programmé, et le supprimer sur l’un d’eux avant son heure l’annule partout.
- Les **groupes** sont aussi sur l’ordinateur, avec leurs messages, photos, fichiers et messages vocaux. Écris-y,
  réponds, réagis, vote, épingle, supprime tes propres messages pour tout le monde, ajoute et retire des membres,
  renomme un groupe ou quitte-le, là comme sur le téléphone : le téléphone le fait pour l’ordinateur, comme si c’était
  lui. Une photo ou un fichier que le téléphone garde va à l’ordinateur en copie sur le relais, supprimée là une fois
  que l’ordinateur l’a prise. Ce que les membres font ensuite à un message (y réagir, voter, l’épingler, le supprimer
  pour tout le monde) s’affiche aussi sur l’ordinateur, comme une étoile ou une suppression sur **Ce téléphone** faite
  sur le téléphone. Un message que le téléphone n’a pas pu envoyer au groupe (un groupe fermé entre-temps, par exemple)
  s’affiche sur l’ordinateur comme **Pas envoyé par le téléphone**. Créer un groupe, les groupes publics et les appels
  de groupe restent sur le téléphone pour l’instant.
- **Les groupes restent sur** l’appareil de ton choix : sur le téléphone, sous **Réglages** → **Données et appareils** →
  **Appareils associés** → **Les groupes restent sur**, choisis **Ce téléphone** ou un ordinateur associé. Les clés des
  groupes vont alors là, jamais copiées, si bien que les groupes y fonctionnent téléphone éteint, et qu’on peut y en
  créer de nouveaux ; le téléphone et les autres appareils y écrivent par lui, il doit donc être allumé. Les membres ne
  voient rien de nouveau : toi, comme avant, dont les messages de groupe arrivent dans une autre file d’attente. Le
  déplacement demande les deux allumés et le relais, et les groupes publics restent sur le téléphone (quitte-les
  d’abord). Pour dissocier cet ordinateur, ramène d’abord les groupes sur le téléphone. S’il est perdu, dissocie-le quand même : les
  groupes apparaissent alors comme quittés sur le téléphone. Un ordinateur avec un {=Erevos} plus ancien ne peut pas les garder.
- **Les discussions masquées et les seconds mots de passe** ne partent jamais avec l’association de l’espace : chacun
  s’associe à part, depuis l’intérieur. Pour un emplacement de discussions masquées : sur l’ordinateur, ouvre cet
  emplacement avec son PIN, neuf et vide comme le laisse un nouveau PIN, et donne-lui sa propre file d’attente sur le
  relais sous **Pour les utilisateurs avancés** ; puis appuie sur **Appareils associés** sous sa liste, et sur
  **Associer à mon téléphone**. Sur le téléphone, ouvre le même emplacement avec son PIN, appuie sur **Appareils
  associés** sous sa liste, et scanne le code de l’ordinateur avec l’appareil photo tant que l’emplacement reste ouvert,
  ou colle-le là ; puis comme plus haut. Un code affiché dans un emplacement n’associe qu’un emplacement, et celui d’un
  espace qu’un espace : lu par l’autre, il disparaît simplement, et **Associer à mon téléphone** recommence sur l’ordinateur. L’emplacement a
  alors sa propre association, avec ses propres clés et sa propre liste d’appareils, signée par son propre compte, si
  bien que ses contacts sur cette version écrivent directement à l’emplacement de l’ordinateur. Ses messages, contacts,
  groupes, appels, photos et fichiers et sa Discussion avec moi-même vont entre les deux emplacements comme ceux de
  l’espace entre appareils associés{+, et de même ses propres comptes Matrix, XMPP et Nostr, toujours, et à nouveau quand ils changent}. Rien de cela ne se voit dans l’espace, sur ses écrans ou sur ses
  appareils associés, et l’association de l’espace n’emporte jamais rien d’un emplacement : ce qu’un emplacement garde
  de son association est chiffré avec sa propre clé, parmi des valeurs faites pour rien pour les autres emplacements,
  dans un fichier de même taille qu’un emplacement soit associé ou aucun. L’association fonctionne tant que
  l’emplacement est ouvert, et fermé aussi si **Recevoir une fois fermées** est activé ; fermé sans cela, rien de lui ne
  se synchronise, et ce qui arrive attend sur le relais (14 jours) jusqu’à ce qu’il s’ouvre, des deux côtés. Sur
  l’ordinateur, les nouveaux groupes et les appels de groupe restent sur le téléphone, une discussion ne peut pas être
  déplacée dans l’emplacement ni en sortir (déplace-la sur le téléphone), et un appel pris là-bas n’arrête la sonnerie
  du téléphone que tant que l’emplacement est ouvert sur le téléphone. Les discussions masquées écrivent aux appareils
  d’un contact sur cette version comme le font tes autres discussions, si bien que ceux-ci les reçoivent même avec le
  téléphone du contact éteint, et pour le contact elles ressemblent aux discussions d’un téléphone qui n’a jamais
  associé d’appareil. Une discussion déplacée dans les discussions masquées sur le téléphone quitte l’ordinateur.
  Déplacée dans les discussions masquées, ou hors d’elles vers tes discussions, une discussion n’écrit qu’au téléphone
  du contact, comme le fait un {=Erevos} plus ancien, jusqu’à ce qu’elle retourne là où elle a été créée : son {=Erevos} est
  prévenu d’abord, pour que ses appareils cessent d’écrire aux tiens, et il peut en déduire que la discussion a cessé de
  connaître les appareils associés : si elle lui avait donné la liste de tes appareils, qu’elle est partie dans les
  discussions masquées. Un espace qu’ouvre un second mot de passe ne s’associe que de l’intérieur, à des appareils à
  lui.
- **Transférer de nouveau les messages**, sur le téléphone, renvoie une période de l’historique, avec ses réactions,
  épingles, votes et étoiles ; ce que l’ordinateur a déjà n’est pas gardé deux fois.
- [+] **Matrix, XMPP et Nostr** : chaque appareil associé les reçoit, et ils suivent les changements du téléphone : un compte déconnecté là-bas, ou remplacé par un autre, part aussi des appareils. L’ordinateur se
  connecte aux comptes Matrix et XMPP de cet espace et prend la clé de ses discussions Nostr, chacun comme un nouvel
  appareil à lui : le téléphone garde le sien. Pour un ordinateur déjà associé, appuie sur **Envoyer les comptes**
  sous lui, sur le téléphone. XMPP et Nostr arrivent d’eux-mêmes. Un serveur Matrix laisse rarement le téléphone
  connecter un nouvel appareil : l’écran **Appareils associés** de l’ordinateur le dit alors, et **Se connecter à
  Matrix** y ouvre Matrix avec l’identifiant déjà rempli, pour son mot de passe, une seule fois. Les clés du compte
  viennent du téléphone, donc ni clé de sécurité ni vérification par emoji ne sont nécessaires, et les messages
  d’avant s’ouvrent depuis sa sauvegarde des clés. Un ordinateur qui a déjà un compte à lui sur l’un d’eux le garde,
  et ce qui n’a pas pu arriver (faute de connexion, par exemple) est réessayé à chaque ouverture. Une fois dissocié,
  l’ordinateur se déconnecte des comptes qu’il a reçus. Un emplacement de discussions masquées associé à part donne
  ses propres comptes de la même façon, depuis ses propres **Appareils associés**, au même emplacement sur
  l’ordinateur : jamais ceux de l’espace, et ceux de l’espace ne vont jamais à lui. Chaque appareil se connecte en son
  propre nom, jamais avec une copie des clés du téléphone, qui serviraient alors deux fois et casseraient le
  chiffrement ; ainsi chacun peut être déconnecté seul, depuis les appareils du compte.
- [~] **SMS** : les SMS du téléphone peuvent aussi s’afficher sur les appareils, et y recevoir une réponse par le
  téléphone, une fois que tu l’actives sous **Réglages** → **Téléphone et SMS** → **SMS** → **Aussi sur mes appareils
  associés**, voir [SMS](#sms).
- **Dissocier**, sur le téléphone, coupe un appareil sur-le-champ : plus rien ne lui est envoyé, et rien de ce qu’il
  envoie n’est pris. Les contacts sur cette version sont prévenus la prochaine fois que le téléphone joint le relais :
  ils cessent de lui écrire, et ne prennent plus rien de lui. C’est ainsi qu’on coupe un ordinateur perdu. S’il est
  allumé, il est prévenu, et les discussions du compte le quittent. Sur l’ordinateur, **Dissocier cet appareil** fait la
  même chose de là-bas.
- **Jusqu’à quatre** appareils s’associent à un téléphone. Une sauvegarde n’emporte pas les associations, mais après
  en avoir restauré une sur un autre téléphone, ce téléphone demande à chaque appareil qui est encore à toi de
  s’associer de nouveau, d’un appui sur chacun, voir [Sauvegardes](#backup).

## Sur un iPhone, depuis le navigateur {#iphone}

Erevos n’a pas d’appli dans l’App Store. Sur un iPhone, il fonctionne comme une app web, ajoutée à l’écran d’accueil
depuis Safari, sans compte Apple. Il discute par un relais, chiffré de bout en bout comme sur le téléphone, et garde ses
contacts, ses messages et ses réglages scellés de la même façon, dans le stockage de Safari pour l’app.

1. Ouvre dans **Safari** l’adresse du serveur Erevos qu’on t’a donnée. Erevos montre comment l’ajouter : appuie sur
   **Partager** (sur iOS 26, sous **•••**), puis sur **Sur l’écran d’accueil**, puis ouvre Erevos depuis l’écran
   d’accueil. Il faut iOS 17 ou plus récent.
2. Dans Erevos, ouvre **Réglages** → **Confidentialité et sécurité** → **Cette app web** et compare l’empreinte de la
   clé de publication avec celle qu’on t’a donnée avec l’adresse, caractère par caractère. Si elle diffère, supprime
   l’app et préviens celui qui t’a donné l’adresse.
3. Configure un verrou par mot de passe (dans Erevos, **Réglages** → **Confidentialité et sécurité** → **Verrou et
   second mot de passe**). Sur le web, c’est ce qui compte le plus : voir plus bas.
4. Configure le relais et ajoute des contacts comme sur le téléphone, voir [Discuter par un relais](#relay).

**Comment il se vérifie lui-même.** Une app web est du code qu’envoie le serveur, donc un serveur piraté, ou qui en
reçoit l’ordre, pourrait envoyer du code modifié. Erevos ne prend pas ce code sur parole :

- La première fois qu’il s’ouvre, il récupère son code avec une liste de chaque fichier et de son empreinte, signée avec
  la clé de publication, que seule la personne qui fait les versions détient ; le serveur ne l’a pas. Il vérifie la
  signature et chaque fichier, les garde sur l’iPhone, et à partir de là n’exécute que ceux-là. Le serveur ne peut pas
  les changer.
- Une mise à jour n’est prise que si elle est signée avec la même clé et plus récente que celle en usage ; elle démarre
  à la prochaine ouverture d’Erevos. Une mise à jour non signée ou plus ancienne est refusée, et Erevos le dit.
- Qui le veut peut vérifier le serveur : \`node pwa/release.mjs verify https://<address>\` vérifie la signature et
  chaque fichier que le serveur distribue, et \`scripts/reproduce-web.sh <version> https://<address>\` reconstruit cette
  version depuis son code source et vérifie que chaque fichier en ressort identique.

**Ce qui reste.** Ce sont de vraies limites ; connais-les :

- **La première fois** que tu l’ouvres, tu fais confiance au serveur : c’est lui qui envoie la partie de vérification.
  L’étape 2 est la façon d’en repérer une mauvaise.
- **La partie de vérification elle-même** (le service worker) est récupérée de nouveau par Safari au moins une fois par
  jour, et Safari peut la remplacer sans demander à Erevos. Erevos vérifie alors la nouvelle par rapport à la version
  signée et te prévient (**Erevos a été falsifié**), mais un serveur qui sait s’y prendre pourrait contourner cette
  vérification. Si tu vois l’avertissement, n’ouvre plus Erevos depuis ce serveur tant que ce n’est pas expliqué. Avec
  un verrou par mot de passe, tes discussions restent scellées.
- **Pas de Bluetooth ni de liaison à proximité**{~, et pas de SMS} : Safari ne les permet pas.
- **Seulement quand il est ouvert :** iOS arrête les apps web en arrière-plan, donc les messages arrivent quand tu
  ouvres Erevos ; ils attendent sur le relais jusque-là.
- **Les appels** sonnent tant qu’Erevos est ouvert, avec une sonnerie à lui : deux courtes toutes les 3 secondes. Safari
  ne la laisse sonner qu’une fois que tu as touché Erevos depuis son ouverture, et pas avec l’iPhone en mode silencieux.
  Erevos fermé, un appel ne sonne pas : seule la notification « Appel » s’affiche, si les notifications sont activées.
  Apple ne permet rien de plus à une app web ; pour sonner comme un téléphone, il faudrait une app de l’App Store.
- Les **notifications** quand Erevos est fermé sont désactivées tant que tu ne les actives pas : dans Erevos,
  **Réglages** → **Notifications** → **Notifications quand l’app est fermée** → **Activer** (iOS 16.4 ou plus récent,
  depuis l’écran d’accueil). Quand des messages arrivent, ou qu’un appel sonne, ton relais envoie un push par Apple, et
  Erevos affiche combien de messages sont arrivés depuis la dernière fois que tu l’as ouvert (**3 nouveaux messages**),
  ou **Appel** quand seul un appel a sonné, dans la langue de l’app, rien de plus. Le nombre est chiffré pour ton
  iPhone : Apple voit quand quelque chose arrive pour ton iPhone, et qu’il utilise {=Erevos}, jamais quoi ni de qui. Avec
  un relais ou l’{=Erevos} d’un expéditeur antérieur à la version 2.0.0, ou un message que d’autres téléphones ont porté
  jusqu’au relais, il n’y a pas de nombre : Erevos affiche **Nouveau message**, ou **Nouveaux messages** une fois que
  d’autres sont arrivés, jusqu’à ce que tu l’ouvres. Elles sont propres à chaque espace, jamais pour les discussions
  masquées, et ton relais doit être configuré pour les envoyer. Elles arrivent aussi pour la file d’attente propre à
  chaque contact : ton relais a alors une seule adresse de push pour toutes les files d’attente de tes contacts, et
  Apple reçoit un push pour chaque contact qui a écrit, à 15 secondes d’intervalle, donc d’une telle série il peut
  deviner combien ont écrit en même temps, jamais qui. L’icône d’Erevos sur l’écran d’accueil affiche alors aussi un
  nombre : les messages non lus de l’espace que tu avais ouvert, dont le nombre reste une fois Erevos fermé, et ceux
  arrivés depuis (ce qui est arrivé sans nombre compte pour un), jamais ceux d’une discussion masquée. **Réglages** →
  **Notifications** → **Nombre sur l’icône** le désactive. Les notifications passent par le service push d’Apple, celui
  de Google (Chrome, ainsi qu’Edge sur Android, Brave et Opera), celui de Mozilla (Firefox) et celui de Microsoft (Edge
  sur Windows) : un navigateur qui en utilise un autre ne peut pas les activer, sauf si la personne qui gère ton relais
  autorise son service push. Chaque espace qui les active a sa propre adresse push, donc aucun relais ne reçoit jamais
  celle d’un autre espace, et l’adresse ne relie pas tes espaces entre eux. Pour cela, chacun de ces espaces a son
  propre service worker dans le navigateur : qui peut voir les réglages du navigateur peut les compter, et donc combien
  d’espaces ont les notifications activées. Une demande de message de quelqu’un de nouveau, par ton lien de contact,
  peut ne s’afficher qu’à l’ouverture d’Erevos. Le nombre sur l’icône s’affiche aussi sur un Mac avec « Ajouter au Dock
  » de Safari, et dans l’app web installée depuis Chrome ou Edge sous Windows, macOS ou ChromeOS. Aucune bannière
  **Nouveau message** ne s’affiche par-dessus Erevos tant qu’il est ouvert à l’écran. L’écran **Notifications quand
  l’app est fermée** dit quand le navigateur ou le téléphone ne les autorise pas et, après que tu les as désactivées,
  quand ton relais n’a pas encore pu être prévenu et peut encore en envoyer : Erevos le lui dit dès qu’il peut
  l’atteindre. Quand le navigateur change d’adresse push, ou que son service push la laisse tomber, Erevos donne tout
  seul la nouvelle à ton relais quand il revient à l’écran.
- **Autorisations :** dans Erevos, **Réglages** → **Général** → **Autorisations** montre ce que le navigateur permet à
  Erevos : s’il fonctionne depuis l’écran d’accueil, les notifications quand l’app est fermée (nécessaires une fois que
  cet espace les a activées), le micro pour les appels, l’appareil photo pour les appels vidéo, et si le navigateur
  garde les données d’Erevos pour de bon. Sans cela, Safari peut effacer les données quand l’iPhone manque de place,
  donc une sauvegarde est le filet de sécurité. Chacune dit pourquoi, avec un bouton qui pose la question propre au
  navigateur ; là où le navigateur ne demande plus, il dit où se trouve le réglage (**Réglages → Notifications →
  Erevos**, ou **Réglages → Apps → Safari → Micro**). Il ne fait que lire ce que dit le navigateur. Un navigateur ne
  laisse pas Erevos lire l’économie de batterie ni le mode Économie d’énergie, donc ils n’y sont pas. Après chaque
  nouvelle version signée, il s’ouvre de lui-même quand il manque quelque chose dont les messages, les appels ou les
  données ont besoin. Dans un autre navigateur (Chrome, Firefox), c’est pareil, avec les réglages de ce navigateur.
- Les **sauvegardes** se font à la main : **Créer une sauvegarde** enregistre la sauvegarde et ses fichiers par la feuille de partage
  (Fichiers, iCloud Drive ou une autre app). Un navigateur ne livre un fichier qu’après un appui, donc il n’y a pas de
  sauvegardes automatiques.
- Les **messages vocaux** enregistrés sur un iPhone sont en AAC ; ils se lisent partout.
- **Apple** fait Safari et pourrait le changer, comme pour n’importe quelle app sur un iPhone.

## Sur Sailfish OS {#sailfish}

Sur un téléphone Sailfish OS, Erevos est une appli à part entière : la même app que dans le navigateur, affichée par le
moteur de navigateur propre à Sailfish dans une fenêtre Sailfish, avec son code installé avec l’appli et non récupéré
depuis un serveur. Il discute par un relais, chiffré de bout en bout comme sur le téléphone, et garde ses contacts, ses
messages et ses réglages scellés de la même façon.

1. Autorise les applis venant d’ailleurs que du Jolla Store : **Paramètres → Logiciels non fiables → Autoriser les
   logiciels non fiables**.
2. Copie \`erevos-sailfish-aarch64.rpm\` sur le téléphone (Téléchargements) et appuie dessus dans **Fichiers**, puis sur
   **Installer**. Depuis un terminal (mode développeur), c’est \`pkcon install-local erevos-sailfish-aarch64.rpm\`. Il
   faut Sailfish OS 5 dans sa version 64 bits (aarch64).
3. Configure un verrou par mot de passe (dans Erevos, **Réglages** → **Confidentialité et sécurité** → **Verrou et
   second mot de passe**). Voir plus bas pourquoi c’est important ici.
4. Configure le relais et ajoute des contacts comme sur le téléphone, voir [Discuter par un relais](#relay).

- **Ce que seul Android fait :** Bluetooth, Wi-Fi Aware, Wi-Fi Direct{~, LoRa et les SMS| et LoRa}. Le même Wi-Fi marche ici aussi,
  comme sur un ordinateur : voir [Discuter avec un téléphone à proximité](#nearby). Le pare-feu de Sailfish OS laisse
  déjà entrer son port, le 47905 : seul un pare-feu que vous avez durci vous-même demande une règle pour lui. Le reste
  est pareil : les espaces et le second mot de passe, les discussions masquées, les messages vocaux, les discussions
  importées et les sauvegardes.
- **Où il garde les choses :** dans \`~/.local/share/erevos\` sur le téléphone, scellé comme sur le téléphone. Sailfish
  n’a pas de trousseau pour les applis, donc le magasin de clés y est gardé tel quel, lisible par ton utilisateur, et
  donc par toute appli qui tourne en ton nom : c’est le verrou par mot de passe qui le scelle.
- Les **sauvegardes** vont dans \`Documents/Erevos\` sur le téléphone, à la main ou chaque jour ; copie-les de là sur
  une carte mémoire ou un autre appareil. **Enregistrer** met une photo ou un fichier dans Téléchargements.
- Les **appels** sonnent tant qu’Erevos est à l’écran, avec une sonnerie à lui : deux courtes toutes les 3 secondes,
  et le téléphone vibre là où il le peut, jusqu’à ce que l’appel soit décroché ou se termine. Un appel qui arrive avant
  que tu aies touché Erevos depuis son ouverture peut s’afficher sans son.
- **Pendant qu’il est fermé :** avec un espace ouvert, un petit assistant d’Erevos attend sur le relais tant qu’Erevos
  n’est pas à l’écran ou est fermé, et ne prend rien. Une notification dit seulement combien de messages sont arrivés,
  jamais de qui ni quoi, et un appel sonne avec la sonnerie du téléphone, comme son profil la règle, 45 secondes au
  plus ; un appui sur l’une ou l’autre ouvre Erevos. Les discussions cachées ne disent rien alors. Verrouiller
  l’espace l’arrête, et après un redémarrage du téléphone il n’attend de nouveau qu’une fois qu’Erevos a ouvert
  l’espace. Comme le reste d’Erevos ici, il passe en direct, sans Tor. Chaque attente réveille le téléphone environ
  une fois par minute, comme sur Android.
- **Testé jusqu’ici** sur le moteur de navigateur de Sailfish (Gecko 91) sur un ordinateur, en discutant avec un
  navigateur par un relais. Le même Wi-Fi a été vérifié face à celui de l’ordinateur, sur un ordinateur. Pas encore sur
  un téléphone Sailfish.

## Mises à jour {#updates}

Erevos ne demande les mises à jour à GitHub que quand tu appuies sur le bouton, comme dans Fasouli : une
vérification régulière dirait à GitHub, chaque jour, que ce téléphone ou cet ordinateur a {=Erevos}. Sur Android, il te
prévient aussi quand une nouvelle version sort, sans demander à GitHub, comme le dit **Prévenu quand une nouvelle
version sort** plus bas. Pour mettre à jour :

1. Ouvre **Réglages** → **Général** → **Mises à jour** (ou **Rechercher des mises à jour** en bas du premier écran de ce
   guide). Il montre la version que tu as, par exemple **Erevos 2.0.0**.
2. Appuie sur **Rechercher des mises à jour**. GitHub voit alors l’adresse internet de cet appareil, rien d’autre ; sur
   Android, le serveur de l’app web aussi, qui garde la signature de la mise à jour par l’ordinateur des versions. Tant
   que tout dans l’espace passe par Tor (**Tout** sous Tor), Erevos ne vérifie pas, puisque cela contournerait Tor.
   Avec **Par Tor** activé, sur cet écran (désactivé tant que tu ne l’actives pas), il interroge uniquement le serveur
   de l’appli web, par Tor, et non GitHub : GitHub n’est pas interrogé et rien ne voit l’adresse. C’est plus lent, et
   cela attend pendant le démarrage de Tor ; et cela marche aussi tant que tout dans l’espace passe par Tor.
3. Quand il y a une nouvelle version : sur Android, appuie sur **Installer**. Elle se télécharge, est vérifiée par
   rapport à la version publiée (sa taille et son SHA-256), et l’installateur d’Android s’ouvre : appuie sur
   **Installer** là aussi. Erevos ne la propose qu’une fois que l’ordinateur des versions, qui garde sa clé hors
   ligne, a signé cette compilation et son SHA-256 : quelqu’un qui aurait pris le contrôle du compte GitHub ne
   pourrait pas, à lui seul, faire installer un APK à lui. D’ici là, il dit que la version est sortie mais pas encore
   signée. Quand le serveur de l’app web est injoignable, il le dit, avec la raison, et quand la signature là-bas ne
   correspond pas, il le dit : dans les deux cas, rien ne s’installe. Un téléchargement dont la connexion n’apporte
   plus rien pendant un moment reprend de lui-même depuis le début, trois fois en tout ; ensuite Erevos le dit, et
   rien ne s’installe. La première fois, Android demande d’autoriser l’installation d’applis depuis Erevos. Sur un
   ordinateur et sur Sailfish OS, **Ouvrir la page de téléchargement** ouvre la page des versions : prends le fichier
   qu’Erevos nomme, celui du paquet que tu as, et mets à jour comme dans le tableau ci-dessous.
   Par Tor, une nouvelle version est signalée, mais elle ne se télécharge pas ici, car son paquet est plus gros que ce
   que le Tor d’Erevos accepte : désactive **Par Tor** un instant pour l’installer, ou télécharge-la depuis la page
   des versions dans Tor Browser.

Une version comme **4.0.0-rc.1** est une version de test avant la 4.0.0 (une version candidate) : elle s’installe et
se met à jour comme les autres, et la 4.0.0 vient après elle.

### Erevos, Erevos+ ou Erevos Lite, et bêtas {#update-channel}

Sur Android, **Mises à jour** indique aussi quelles versions sont proposées à ce téléphone :

- **Prochaine mise à jour**: **Erevos Lite** (les discussions et appels propres à Erevos, rien d'autre ; versions
  3.2.x), **Erevos** (ses propres discussions, le Téléphone, les SMS et la Collection ; versions 3.0.x) ou **Erevos+**
  (tout cela, avec Telegram, Messenger, Signal, Session, Matrix, XMPP et Nostr ; versions 3.1.x). Au début, celle que
  tu as est choisie. Chacune est une app à part, avec ses propres données, donc en choisir une autre est un passage,
  pas une mise à jour : **Rechercher des mises à jour** la trouve et demande **Passer à …**. Cet Erevos fait alors une
  copie de tout, chiffrée, ici sur le téléphone (chaque espace, avec ses contacts, messages et réglages), et Android
  installe l'autre app à côté de celle-ci, si elle n'y est pas déjà. Ouvre-la dans la journée : elle demande s'il faut
  reprendre tes discussions, et les prend ; rien ne quitte le téléphone. Les espaces s'ouvrent ensuite avec leurs mots
  de passe, comme après toute restauration. Les SMS et appels du téléphone restent dans le téléphone : fais de la
  nouvelle app l'app SMS et téléphone, si tu t'en sers. Dès que le passage est fait, l'ancienne app ne reçoit et
  n'envoie plus rien et ne montre que le passage, pour qu'aucun message n'y reste que la nouvelle n'ait pas ;
  **Annuler le passage** la rouvre comme avant. Une fois repris par la nouvelle, l'ancienne propose **Tout supprimer
  ici** et **Désinstaller** ; un passage non repris dans la journée est supprimé, et l'ancienne app s'ouvre comme
  avant. Une nouvelle app déjà configurée demande aussi, et ce qu'elle reprend prend la place de tout ce qu'elle a. Le
  passage demande de la place libre sur le téléphone pour une copie de tout : Erevos le dit avant s'il n'y en a pas
  assez. La version F-Droid, signée avec une autre clé, ne peut pas passer ainsi : utilise plutôt les
  [Sauvegardes](#backup).
- **Versions bêta** : désactivé, seules les versions normales sont proposées. Activé, les bêtas aussi (comme
  **7.0.1-beta.1**) : elles sortent d’abord, pour essayer, et peuvent avoir des problèmes. Une bêta l’a activé au
  début. Désactivez-le pour quitter les bêtas : la prochaine version normale avec un numéro de build supérieur à la
  bêta que vous avez s’installe par-dessus et garde tout, sans désinstaller.

Depuis Erevos+, les réseaux viennent aussi : Telegram, Signal, Session, Messenger et Matrix restent connectés dans la
nouvelle app, comme avant (les photos et fichiers de Telegram se téléchargent à nouveau à leur ouverture, et la page
de Messenger demande son PIN une fois de plus). Erevos et Erevos Lite n'ont ni Telegram, ni Messenger, ni Signal, ni
Session : déménager vers eux laisse ces comptes dans l'ancien Erevos+, qui n'ouvre ensuite plus rien ; si tu utilises
Session, note donc d'abord ses 13 mots de récupération.

Erevos+ nécessite Android 8.0 ou plus récent : sur un téléphone plus ancien, il ne peut pas être choisi, et le
téléphone reste sur Erevos.

L’avis d’une nouvelle version suit le même choix. L’ordinateur des versions signe chaque édition et ses bêtas à part,
si bien que l’une ne s’installe jamais comme une autre.

### Nouveautés {#whats-new}

**Réglages** → **Général** → **Nouveautés** (aussi **Nouveautés** dans **Mises à jour**) dit en bref ce que chaque
version a changé, la plus récente d’abord, sous son seul numéro ; la version que tu as indique **Cette version**. Chaque
version ajoute la sienne. Le CHANGELOG du code source raconte chaque changement en entier.
Chaque version, là-bas comme ici, dit d’abord ce qui change **Pour toi**, ce que tu vois et utilises, puis ce qui a
changé **Sous le capot** : corrections, vitesse, batterie et sécurité à l’intérieur.

### Prévenu quand une nouvelle version sort {#release-notice}

Sur Android, une fois par jour, Erevos demande au serveur de LPHL, qui fait aussi tourner le relais, si une nouvelle
version est sortie. Quand c’est le cas, **Erevos** s’affiche en haut des discussions, épinglé, avec son icône : **Erevos
3.3.0 est sorti. Touche pour voir les nouveautés et mettre à jour.**, marqué jusqu’à ce que tu l’ouvres, et une
notification dit aussi **Erevos 3.3.0 is out**. Appuie sur l’un ou l’autre pour **Mises à jour**, puis sur
**Rechercher des mises à jour**. Il disparaît une fois que tu as cette version.

- **Seulement une fois signée :** elle ne compte qu’une fois que l’ordinateur des versions a signé à la fois la
  compilation et son nom, la même signature qui permet à **Mises à jour** de l’installer. Elle arrive donc une fois que
  cette version peut être installée, et le serveur seul ne peut pas en inventer une.
- **Seulement sur le relais de LPHL :** un espace ne demande que tant qu’il utilise le relais de LPHL et n’envoie pas
  tout par Tor (**Tout** sous Tor) : le serveur ne voit alors rien qu’il ne voie déjà. Un espace sur un autre relais, ou
  sans relais, ne demande rien ; là, **Rechercher des mises à jour** te le dit.
  L’interrupteur **Par Tor** de **Mises à jour**, un pour cette notification et pour **Rechercher des mises à jour**,
  sur ce téléphone seulement, la fait demander par Tor : le serveur ne voit alors pas l’adresse du téléphone, et un
  espace qui envoie tout par Tor demande aussi. Une nouvelle version est signalée, mais ne s’installe qu’avec
  l’interrupteur désactivé.
- **Pour la désactiver :** **Réglages** → **Général** → **Mises à jour** → **Me prévenir quand une nouvelle version
  sort**.
- Elle fonctionne à partir de la version qui l’a : celle d’avant ne dit rien. Pas dans la compilation F-Droid, que
  F-Droid met à jour.

**Pourquoi :** pour que personne n’ait à regarder sur GitHub, une par une, chaque nouvelle version, et que GitHub
n’apprenne jamais quels téléphones ont Erevos : le serveur interrogé est celui auquel le téléphone parle déjà, et ce
qu’il dit ne compte qu’avec la signature de l’ordinateur des versions, gardée hors ligne.

La suite de cette section sert à mettre à jour à la main.

**Où sont les nouvelles versions :** sur la page des versions d’Erevos,
\`https://github.com/azzinder/erevos-releases/releases\`. La plus récente est en haut, par exemple **Erevos 2.0.0**,
avec un fichier pour chaque système. Les cinq plus récentes y restent.

**Vérifie le fichier** si tu peux, sur un ordinateur : chaque version a \`SHA256SUMS\`, et dans le dossier des fichiers
téléchargés, \`sha256sum -c --ignore-missing SHA256SUMS\` doit dire **OK** pour chacun.

**Fais d’abord une sauvegarde** (**Réglages** → **Données et appareils** → **Sauvegardes** → **Créer une sauvegarde**),
voir [Sauvegardes](#backup). Une mise à jour garde tout, mais une sauvegarde coûte une minute et couvre toute surprise.

| Sur | Comment mettre à jour |
| --- | --- |
| **Android** | **Réglages** → **Général** → **Mises à jour** → **Rechercher des mises à jour** → **Installer**, ou à la main : ouvre la page des versions sur le téléphone, appuie sur \`erevos-android.apk\`, puis sur **Installer**. Il s’installe par-dessus celui que tu as et garde tout. Autorise une fois l’installation depuis le navigateur, quand Android le demande. |
| **Linux, basé sur Arch** | \`sudo pacman -U erevos-linux-x86_64.pacman\` |
| **Linux, AppImage** | Remplace l’ancien \`erevos-linux-x86_64.AppImage\` par le nouveau et rends-le exécutable. |
| **macOS** | Ouvre \`erevos-macos.dmg\` et fais glisser Erevos dans Applications, **Remplacer**. Ensuite, autorise-le de nouveau sous **Réglages Système → Confidentialité et sécurité → Ouvrir quand même**. |
| **Windows, installé** | Ferme Erevos et lance le nouveau \`erevos-windows-x64-setup.exe\` : il s’installe par-dessus celui que tu as. Windows peut de nouveau avertir : **Informations complémentaires**, puis **Exécuter quand même**. |
| **Windows, portable** | Ferme Erevos et mets le nouveau \`erevos-windows-x64-portable.exe\` à la place de l’ancien. |
| **Sailfish OS** | Appuie sur \`erevos-sailfish-aarch64.rpm\` dans **Fichiers**, puis sur **Installer**, ou \`pkcon install-local erevos-sailfish-aarch64.rpm\`. |
| **iPhone, navigateur** | Rien à faire : l’app web prend d’elle-même une nouvelle version signée quand elle s’ouvre, voir [Sur un iPhone](#iphone). |

- **Les contacts, discussions et réglages restent** sur chaque système : ils vivent dans le dossier propre d’Erevos, pas
  dans l’appli.
- **Android, la première fois depuis la page des versions :** un Erevos compilé sur un ordinateur pour des tests est
  signé avec une autre clé, et Android refuse de s’installer par-dessus (**Application non installée**). Fais une
  sauvegarde, désinstalle {=Erevos}, installe celui de la page des versions et restaure la sauvegarde. Après cela, chaque
  mise à jour s’installe par-dessus.
- **{=Erevos} depuis F-Droid**, une fois qu’il y sera, est mis à jour par F-Droid : ses **Mises à jour** montrent la
  version et le disent, sans **Rechercher des mises à jour**. F-Droid le signe avec une clé à lui, donc Android
  n’installe ni celui-ci par-dessus l’Erevos de la page des versions, ni celui-là par-dessus lui. Pour passer de l’un à
  l’autre : fais une sauvegarde, désinstalle {=Erevos}, installe l’autre et restaure la sauvegarde.
- **Jamais plus ancien :** n’installe pas une version plus ancienne par-dessus une plus récente. Ses données peuvent
  être sous une forme que l’ancienne ne sait pas lire. Restaure plutôt une sauvegarde faite avec cette version plus
  ancienne.
- **Une version à laquelle manque ton système** le dit dans ses notes : cette compilation a échoué, alors prends la
  version d’avant.

## Erevos vers un téléphone proche {#give-app}

Sans internet, un téléphone Android avec {=Erevos} peut le donner à un téléphone à côté, dans **Réglages** → **Général**
→ **Donner Erevos à un téléphone proche** (aussi dans **Mises à jour**). Les deux téléphones doivent être sur le même
Wi-Fi, ou l’autre sur le point d’accès de celui-ci : activez d’abord le point d’accès dans les réglages d’Android.

1. **Sur le téléphone qui donne :** touchez **Démarrer**. Un code QR s’affiche, avec la taille du paquet, et dessous
   les adresses à taper plutôt dans un navigateur.
2. **Sur un téléphone sans {=Erevos} :** scannez le code avec son appareil photo. Son navigateur ouvre une page, servie
   par le téléphone qui donne, avec **Télécharger {=Erevos}** : téléchargez-le et ouvrez le fichier, et Android
   l’installe. La première fois, Android demande d’autoriser l’installation d’apps depuis ce navigateur. La page
   montre le SHA-256 du paquet et celui de son certificat : ils doivent être ceux que montre le téléphone qui donne
   sous **À comparer**.
3. **Sur un téléphone avec un {=Erevos} plus ancien :** ouvrez plutôt **Réglages** → **Général** → **Mises à jour** →
   **Depuis un téléphone proche** et photographiez le code. Erevos télécharge le paquet et n’ouvre l’installateur
   d’Android que si son SHA-256 est celui du code, que c’est Erevos, signé du même certificat que l’Erevos qui s’y
   trouve, et plus récent.

- **Combien de temps :** le téléphone qui donne le sert tant que son écran s’affiche, dix minutes au plus, et s’arrête
  plus tôt avec **Arrêter**. Il ne répond qu’à une adresse aléatoire que personne ne devine, qu’aux téléphones de son
  propre réseau, et rien d’autre que le paquet et sa page : aucune conversation, aucun contact ni réglage ne part avec.
- **Ce qu’il ne peut vérifier pour vous :** le navigateur ne fait que télécharger. Un téléphone avec un Erevos modifié
  montrerait son propre certificat ; dès que vous avez internet, comparez donc le certificat avec celui du site ou de
  la page des versions d’Erevos. Erevos lui-même, dans **Mises à jour**, refuse un paquet signé autrement.
- **Pas depuis un magasin :** un {=Erevos} installé en plusieurs parties, comme le font certains magasins, ne peut pas
  être donné en entier et le dit. L’{=Erevos} de F-Droid est signé par F-Droid : il peut aller vers un téléphone sans
  {=Erevos}, ou par-dessus l’Erevos de F-Droid via le navigateur, mais un Erevos de la page des versions le refuse dans
  **Mises à jour**, comme le ferait Android. L’Erevos de F-Droid ne prend rien dans **Mises à jour** : F-Droid le met à
  jour.
- Android seulement. Quiconque sur le même réseau voit le code peut aussi télécharger Erevos ; il n’y a rien d’autre à
  prendre.

**Pourquoi :** là où internet est coupé, ou surveillé, ou qu’un téléphone n’atteint même pas le site, Erevos peut
encore passer de main en main, et le téléphone qui le reçoit peut vérifier que c’est le vrai.

## Les écrans de test {#tests}

Deux écrans sous **Réglages** → **Pour les tests** servent à tester les connexions, étape par étape.

- **Test radio (Android) :** **Autorisations** demande à Android ce dont la radio a besoin, **Démarrer** et **Arrêter**
  activent et désactivent le Bluetooth et le Wi-Fi Aware, **Envoyer bonjour** envoie un simple message de test au Test
  radio du téléphone à proximité (une discussion ne l’affiche pas), et le **Journal** montre ce qui s’est passé.
- **Test du relais (Wi-Fi) :** **Créer une file d’attente** crée une file d’attente sur un relais et affiche deux
  identifiants. Donne l’**identifiant d’expéditeur** au téléphone qui t’écrit, et garde l’**identifiant de
  destinataire** pour toi. **Envoyer** et **Recevoir** déplacent des messages à la main.

> Avec un seul téléphone, tu peux quand même essayer une discussion par le relais : tes discussions et tes **Discussions
> masquées** ont chacune leur propre file d’attente sur un relais et leurs propres clés. Crée les deux files d’attente
> sur le même relais, appuie sur **Partager mon lien de contact** dans l’une et copie-le, puis ajoute-le dans l’autre,
> et écris dans les deux sens. Le propre lien d’une discussion est refusé comme contact.

## Ce qui est protégé aujourd’hui {#privacy}

Erevos dit clairement ce qu’il protège et ce qu’il ne protège pas, pour l’instant.

| Quoi | Aujourd’hui | À venir |
| --- | --- | --- |
| **Compte, numéro de téléphone, e-mail** | Aucun n’est nécessaire. Les contacts sont des paires de files d’attente à sens unique sur un relais. | |
| **Les contacts et leurs noms, clés, réglages de relais, apparence** | Scellés sur le téléphone avec la clé de chaque espace. | |
| **Messages par un relais** | Chiffrés de bout en bout : PQXDH avec ML-KEM-768 pour commencer, puis le double ratchet. Le relais ne peut pas les lire, et une fois que les deux téléphones ont reçu un message l’un de l’autre, il ne peut pas non plus les distinguer par conversation : chacun est scellé une fois de plus pour le téléphone auquel il va. Il voit lesquels sont des messages que quelqu’un lit, lesquels sont des échanges entre téléphones, et lesquels sont des appels qui sonnent, comme chacun le dit. Pas encore audité. | Un audit externe. |
| **Messages vers un téléphone à proximité** | Chiffrés de bout en bout, comme par le relais. Qui écoute à proximité peut savoir que des téléphones {=Erevos} sont proches l’un de l’autre, et quand et combien ils envoient ; sur le même Wi-Fi, quiconque s’y trouve le peut aussi, et par Wi-Fi Direct, quiconque rejoint le Wi-Fi propre aux téléphones. Tant que le téléphone de ton contact n’est pas connu, les autres téléphones {=Erevos} reliés à proximité reçoivent tes messages courts, scellés. | |
| **Messages portés par d’autres téléphones** | Scellés deux fois : de bout en bout pour ton contact, et pour son relais. Un téléphone qui en porte un voit vers quel relais il va, quand, et sa taille ; pas de qui il vient ni pour qui il est. Son relais voit vers quel relais il va, et ce relais voit le relais du porteur, pas son téléphone. Gardés scellés sur le téléphone, trois jours au plus : ceux des autres dans un fichier du téléphone, dont la taille montre à peu près combien il y en a ; les tiens dans ton espace, scellés avec sa clé. Les discussions masquées ne sont jamais portées. | |
| **Messages par LoRa** | Chiffrés de bout en bout, comme par le relais. Quiconque a une radio, à des kilomètres, peut savoir que la tienne émet, quand et combien, et son signal peut être suivi jusqu’à l’endroit où elle se trouve. Erevos empêche ta radio de dire son nom et où elle est (rôle Client hidden, GPS coupé, pas de position fixe) sauf si tu le permets ; elle répond quand même à une radio qui demande son nom. Chaque Erevos sur le mesh reçoit tes messages LoRa, scellés. | Régler le nom de la radio depuis Erevos. |
[~] | **Messages par SMS, quand rien d’autre ne marche** | Chiffrés de bout en bout, comme par le relais, dans des SMS de données cachés. Désactivé sauf si tu l’actives. L’opérateur voit quel numéro a écrit à quel autre, quand, et combien de SMS ; jamais ce qui a été écrit. Chacun coûte ce que coûte un SMS. | |
| **Qui parle à qui** | Le relais voit les adresses IP, les identifiants de file d’attente, et quand et combien. Avec un second relais, ton relais ne voit jamais ton adresse. Depuis une place prêtée sur le relais d’un contact, chaque relais auquel tu envoies la voit. [Par Tor](#tor), dès que tu l’actives, avec **Messages** aucun relais ne la voit pour ce que tu écris, et avec **Tout** pour les images et les fichiers aussi ; avec des ponts, pour là où Tor est bloqué, le réseau ne voit qu’un pont. Le broker de Snowflake et les serveurs STUN voient ton adresse. | Tor sur un ordinateur. |
| **La connexion au relais** | TLS, et à l’intérieur, une fois la clé du relais connue, un canal vers cette clé : le relais prouve qu’il la détient à chaque connexion, et le jeton et chaque requête lui parviennent chiffrés, si bien que quelqu’un entre les deux avec un certificat pour le nom du relais ne peut pas se faire passer pour lui. Un relais qui a prouvé sa clé une fois n’est plus jamais joint sans elle. Un relais plus ancien que cette appli fonctionne comme avant, et **Comment tu te connectes maintenant** le dit. La première clé vient du relais la première fois qu’on la lui demande, ou d’un lien de contact : quiconque est entre les deux cette toute première fois pourrait en donner une à lui. [La clé propre du relais](#relay). Pas audité. | La clé de notre relais intégrée à l’appli, et dans les invitations. |
| **Les textes par Nostr** | Chiffrés de bout en bout comme par un relais, puis enveloppés une fois de plus pour une clé que ton contact a donnée à cette seule discussion, signés par une clé faite pour ce seul texte. Les relais Nostr voient quand et quelle taille, et qu’une clé qui ne nomme personne reçoit un texte ; ton téléphone lit toutes ses clés sur une seule connexion, par Tor quand Tor est activé, donc un relais peut savoir qu’elles sont lues ensemble, et d’où seulement avec Tor désactivé. Ton relais ne les voit que comme la sauvegarde, et une sonnette pour les discussions masquées. [Par Nostr](#nostr). | |
[~] | **SMS** | Un SMS ordinaire est lu par l’opérateur téléphonique, comme tout SMS. Vers un numéro lié à un contact Erevos, il passe plutôt par Erevos. Une invitation cachée est un SMS court de plus que l’opérateur téléphonique voit. | |
| **Les contacts du téléphone** | Dans les contacts propres d’Android, non scellés par Erevos, comme avec toute appli de contacts : chaque appli autorisée à les lire les voit, et un compte (Google) peut les synchroniser. Erevos ne les envoie nulle part. Un fichier .vcf enregistré à partir d’eux est hors d’Erevos, non scellé.{~ Les appels et SMS d’un contact sont lus dans l’historique des appels et les SMS propres du téléphone seulement pour afficher son historique, et ne sont gardés nulle part.} | |
| **Contacts gardés seulement dans Erevos** | Scellés avec la clé de l’espace, ou avec celle des discussions masquées pour les leurs, dans un seul fichier pour tous les espaces dont la taille montre à peu près combien il y en a en tout, pas à qui ils sont ; leurs photos chacune dans un fichier à elle. Jamais dans les contacts d’Android. Un fichier .vcf enregistré à partir d’eux, ceux des discussions masquées aussi, est hors d’Erevos, non chiffré. Les appels{~ et SMS} vers eux passent par le téléphone, et s’affichent dans son historique des appels{~ et ses SMS}. | |
[~] | **Appels téléphoniques** | Des appels téléphoniques ordinaires : l’opérateur téléphonique les achemine et peut écouter, comme avec toute appli de téléphone. Android garde l’historique des appels, non scellé par Erevos, comme pour toute appli de téléphone ; Erevos le lit, ainsi que les favoris, pour les afficher, n’en supprime que les appels que tu supprimes, et n’en garde aucune copie. La SIM choisie pour chaque numéro est scellée dans l’espace ; les réponses rapides, et ce qui est bloqué (préfixes, identifiants de groupe et horaires seulement, les mêmes pour tous les espaces), sont gardés sur le téléphone, non scellés. | |
| **Discussions importées** | Scellées dans l’espace où elles ont été amenées, leurs photos et fichiers aussi, chacun en morceaux comme l’est le fichier d’une discussion. La taille du fichier, et le nombre de morceaux, disent à peu près combien a été importé, pas où. | Les photos et fichiers de Viber, et les fichiers de plus de 4 Go. |
| **Historique des messages** | Gardé sur le téléphone, scellé dans son espace, sans limite, dans des pages de même taille mêlées pour tous les espaces. Seule la place que tout cela prend se voit, pas l’espace auquel il appartient. La suppression sur les deux téléphones, et les messages éphémères, reposent sur l’Erevos de l’autre téléphone. | |
| **Messages à proximité** | Ouverts seulement dans l’espace qui a le contact. Un message pour un autre espace attend en mémoire, six heures au plus, jusqu’à ce que cet espace s’ouvre. Un message pour des discussions masquées ne s’ouvre que tant qu’elles sont ouvertes, ou reçoivent fermées, et l’espace n’apprend jamais qu’un de leurs contacts est à proximité. | |
| **Messages vocaux** | Chiffrés de bout en bout par le relais ou à proximité, en morceaux : le relais, ou qui écoute à proximité, peut savoir à peu près la durée de chacun. Chaque son est scellé dans un fichier à lui ; le nombre de fichiers, et leurs tailles, montrent à peu près combien il y en a de gardés, pas dans quel espace. Déscellé dans le cache seulement pendant sa lecture. | Des fichiers sonores tous de la même taille. |
| **Photos et fichiers** | Chiffrés de bout en bout, par le stockage de fichiers du relais, en morceaux d’une même taille : le relais voit combien et quand, donc à peu près quelle taille. Ton relais voit ton adresse, comme pour les messages ; le contact les prend par son propre relais. Les photos perdent leur lieu, leur téléphone et leur heure, sauf si elles sont envoyées comme fichier ; un fichier garde ce qu’il dit à l’intérieur. Scellés sur le téléphone dans leurs morceaux, affichés depuis la mémoire. Les copies enregistrées sont hors d’Erevos. Les sauvegardes les contiennent, scellés avec le mot de passe de la sauvegarde, dans des fichiers à part. | |
| **Sur un ordinateur** | Scellé comme sur le téléphone, dans le dossier propre de l’appli. Son magasin de clés est scellé avec le trousseau du système (sous Windows, la clé de ton compte) ; sur un système Linux sans trousseau, Erevos ne garde rien à moins d’être lancé avec \`--plain-secrets\`, et le garde alors tel quel. | |
| **Sauvegardes** | Scellées avec leur propre mot de passe, elles contiennent chaque espace tel qu’il est scellé sur le téléphone, avec ses photos, fichiers et messages vocaux dans des fichiers à part à côté de la sauvegarde. Leurs noms disent que c’est une sauvegarde Erevos, et leur nombre et leur taille montrent à peu près combien est gardé. Les sauvegardes automatiques gardent leur mot de passe sur le téléphone. Envoyées à un serveur seulement si tu en ajoutes un : des octets aléatoires sous des noms aléatoires, de tailles arrondies ; le serveur voit ton compte et quand, et ton adresse sauf si elles passent par Tor. | |
| **Marques ✓✓ et ✓✓✓** | Le téléphone du contact apprend quand le tien a reçu et lu ses messages, chiffré. Dans un groupe qui n’est pas public, le téléphone de qui a envoyé le message l’apprend aussi. Le relais, ou qui écoute à proximité, voit un petit message de plus. | Un interrupteur pour cesser de dire quand tu lis. |
| **Empreinte digitale ou visage (Android)** | Désactivé sauf si tu l’actives. N’ouvre que l’espace du premier mot de passe : sa clé est scellée dans l’Android Keystore, utilisable seulement juste après une vérification forte de l’empreinte ou du visage, et abandonnée quand ils changent. Quelqu’un qui te retient peut utiliser ton doigt. | |
| **Notifications (Android)** | En arrière-plan : « Erevos – Ready for calls and messages » (pas sur l’écran de verrouillage), « Incoming call » ou « Incoming video call » – « Open Erevos to answer », et « New message » ou combien sont arrivés ; quand Android ou le mot de passe l’arrête, « Closed by Android » ou « Locked » – « Open it to receive calls and messages again » ; un rappel, « Reminder » ou combien ; une nouvelle version, « Erevos X is out ». Jamais qui ni quoi. Sur un téléphone verrouillé, celle des messages dit seulement « Erevos ». Les discussions masquées qui ont le droit de le dire affichent la même notification, comptées avec le reste : qui la voit et ne trouve rien de nouveau peut deviner qu’il y en a d’autres. En tant qu’appli de téléphone, la notification d’un appel téléphonique nomme qui appelle, sur l’écran de verrouillage aussi, comme celle de toute appli de téléphone, mais jamais par un nom que seules les discussions masquées connaissent : un appel de l’un de leurs contacts affiche le numéro. | |
| **Widget{~ et Téléphone} (Android)** | Le widget, une fois ajouté, montre combien il y a {~d’appels manqués, de SMS non lus et |}de nouveaux messages, jamais qui ni quoi.{~ Le Téléphone s’ouvre sans le mot de passe seulement si tu le permets : alors quiconque tient le téléphone déverrouillé voit les appels et les favoris qu’Android garde, avec les noms des contacts du téléphone seulement.} | |
| **Appels** | Chiffrés de bout en bout (DTLS-SRTP, sa clé envoyée dans la discussion chiffrée). Par le relais d’appel, aucun des deux téléphones ne voit l’adresse IP de l’autre ; le serveur qui le fait tourner voit les deux, quand et combien de temps, et combien passe. Sans relais d’appel, sur le même Wi-Fi seulement, chaque téléphone voit l’adresse de l’autre. Les relais voient quand un appel commence à sonner. | La sonnerie dans l’app web fermée. Les appels par Bluetooth (le talkie-walkie y fonctionne). |
| **Discussions de groupe** | Chiffrées de bout en bout avec MLS (RFC 9420) ; les membres retirés ne lisent plus rien ensuite. La copie de chaque membre est scellée à part, donc les relais ne peuvent pas savoir qui est dans un groupe ; chaque relais voit quand même un message atteindre une file d’attente. Les membres voient les clés et les adresses de relais les uns des autres. Les photos, fichiers et messages vocaux passent par le stockage de fichiers du relais de l’expéditeur, comme vers un contact, et y restent 14 jours. Pas audité. | |
| **Appels de groupe** | Voix et vidéo, chiffrées de bout en bout entre chaque paire de téléphones de l’appel (DTLS-SRTP, ses clés envoyées dans le chiffrement du groupe). Par le relais d’appel, aucun téléphone ne voit l’adresse IP d’un autre ; le serveur qui le fait tourner voit celle de chaque téléphone, quand et combien de temps, et combien passe. Chaque membre, dans l’appel ou non, apprend qui y est. Les relais voient quand un appel commence. | La vidéo à plus de quatre personnes, par un serveur ; plus de huit personnes. |
| **Groupes publics** | Comme les discussions de groupe, et quiconque a le lien peut demander à rejoindre et lire à partir du moment où il est admis. Les demandes arrivent au relais du propriétaire scellées pour le téléphone du propriétaire : le relais voit combien et quand, pas de qui. Les membres voient les noms choisis, les clés faites pour ce seul groupe, les adresses de relais et les identifiants d’expéditeur de file d’attente les uns des autres. Pas audité. | |
| **Aperçus des liens** | Désactivés sauf si tu les actives. Alors, quand tu envoies un lien, ton téléphone récupère sa page directement depuis le site, qui voit ton adresse IP et quand, pas à qui le message est destiné. L’aperçu va dans le message chiffré ; le téléphone qui le reçoit ne récupère rien. Avec **Par Tor** activé, la page est récupérée uniquement par Tor, et le site ne voit pas ton adresse IP. Aucun tant que l’espace envoie tout par Tor, sauf si **Par Tor** est activé ; dans les discussions masquées, seulement avec l’interrupteur propre à leur emplacement. | |

## Transparence {#transparency}

Ce que garde le serveur derrière Erevos (lphl.nekten.eu), et ce qui lui a été demandé. Cette page est livrée dans chaque
version, donc elle est signée avec la version, comme l’appli.

**Demandes des autorités.** À la date de cette version : aucune. Aucune autorité, aucun tribunal ni aucune entreprise
n’a demandé de données sur quiconque utilise {=Erevos}, et personne n’a été prié de garder le silence sur une telle
demande. Si ce paragraphe disparaît un jour, ou ne dit plus « aucune », prends-le comme un signe. **Pourquoi :** une
demande accompagnée d’un ordre de garder le silence ne peut pas être dite, mais une phrase qui cesse d’être écrite peut
se remarquer. Cela ne fonctionne que tant qu’elle est renouvelée : chaque version la redit.

Ce que le relais garde, et pendant combien de temps :

| Quoi | Pendant combien de temps |
| --- | --- |
| **Les messages qui attendent**, chiffrés de bout en bout | Jusqu’à ce qu’ils soient pris, 14 jours au plus. |
| **Photos et fichiers**, chiffrés, en morceaux | Comme les messages : jusqu’à ce qu’ils soient pris, 14 jours au plus. |
| **Messages envoyés pour plus tard**, chiffrés | Jusqu’à ce que leur heure vienne. |
| **Files d’attente**, des identifiants aléatoires sans nom | Jusqu’à ce que leur téléphone ne les ait pas utilisées pendant 180 jours. |
| **Lignes d’accès** : pour chaque téléphone, le SHA-256 de son jeton et un nom : des lettres et des chiffres au hasard pour un téléphone invité depuis Erevos 6.0.0 (avant, celui qu’a tapé la personne qui l’a invité), ou le nom d’utilisateur LPHL pour ceux qui se sont connectés avec LPHL | Jusqu’à ce que la ligne soit retirée. |
| **Adresses de push de l’app web**, pour les notifications quand l’app web est fermée | Jusqu’à leur désactivation dans l’app web. |

Ce qu’il ne garde pas :

- **Aucune liste des connexions.** Le relais n’écrit aucun journal de qui s’est connecté ni quand, et le serveur web
  devant le relais et l’app web ne garde aucun journal d’accès depuis le 24 octobre 2026. Les erreurs sont journalisées,
  et une erreur peut nommer une adresse.
- **Aucun contact, nom ou numéro de téléphone.** Il n’en a aucun à garder.

Ce qu’il voit quand même pendant qu’il fonctionne : les adresses IP qui se connectent, quand les messages arrivent et
partent, et leur taille, comme le dit [Ce qui est protégé aujourd’hui](#privacy). Pendant un appel par le relais
d’appel, les adresses IP des téléphones qui y sont.

**Copies.** Le dossier du relais est sauvegardé chaque jour, avec les messages en attente toujours chiffrés de bout en
bout. Les copies contiennent ce que liste le tableau ci-dessus, aussi longtemps qu’elles sont gardées.

**D’autres qui voient quelque chose :** l’hébergeur (Hetzner), qui fait tourner la machine et son réseau ; le service de
connexion de LPHL (Authentik), qui voit chaque connexion avec LPHL ; et pour l’app web avec les notifications quand elle
est fermée, le service push du navigateur (Apple, Google ou Mozilla), qui voit qu’une notification est arrivée, jamais
quoi.

## Licence {#licence}

**Erevos, by azzinder.** Copyright © 2026 azzinder.

Erevos est un logiciel libre, sous la GNU Affero General Public License, version 3 ou toute version ultérieure
(AGPL-3.0-or-later) : chacun peut l’utiliser, l’étudier, le partager et le modifier. Quiconque partage Erevos, modifié
ou non, ou fait tourner un Erevos modifié pour d’autres à travers un réseau, doit respecter cette licence et partager
le code source de sa version avec ceux qui la reçoivent.

### Conditions supplémentaires

Selon la section 7 de la licence, ces conditions s’appliquent aussi à Erevos :

- **Le nom de l’auteur.** Les copies et les versions modifiées gardent la mention « Erevos, by azzinder » dans la partie
  À propos d’Erevos de l’app, [Ce qu’est Erevos](#about).
- **Une version modifiée le dit.** Elle dit clairement qu’elle est modifiée, et ne se présente pas comme l’Erevos
  d’origine.
- **Le nom et le logo.** La licence ne donne aucun droit sur le nom « Erevos » ni sur son logo : une version modifiée
  qui est donnée à d’autres prend un autre nom.

### Aucune garantie

Erevos est donné dans l’espoir qu’il sera utile, mais **sans aucune garantie** : pas même celle qu’il puisse être vendu
ou qu’il convienne à un usage particulier. La licence en dit plus.

### Qui l’a fait

Erevos est fait par **ingénierie agentique dirigée par l’humain (human-directed agentic engineering)** : azzinder fixe
la conception, les contraintes, ce que chaque changement doit faire et quand il est terminé ; les outils d’IA écrivent,
lancent les vérifications et corrigent.

Erevos est conçu, dirigé et maintenu par azzinder, qui a choisi ses fonctions et leur façon de marcher, son modèle de
sécurité et sa structure, le teste sur de vrais appareils et décide de ce qui entre dans chaque version. Des outils d’IA
ont été largement utilisés pour écrire le code et les textes, toujours sur les instructions et d’après la conception
d’azzinder.

Les parties faites par d’autres gardent leurs propres auteurs et leurs propres licences, voir
[Fait avec l’open source des autres](#about). Les textes complets viennent avec le code source d’{=Erevos} :
\`AUTHORS.md\`, \`CREDITS.md\` et le dossier \`LICENSES\`. Chaque copie d’Erevos contient aussi le fichier \`NOTICES.txt\`, avec la licence d’Erevos, \`AUTHORS.md\` et chaque paquet dont Erevos est fait, chacun avec le texte de sa licence : dans l’app Android, dans le dossier des apps pour ordinateur et Sailfish, et dans l’app web à l’adresse \`/NOTICES.txt\`. La licence elle-même est sur
[gnu.org](https://www.gnu.org/licenses/agpl-3.0.html).

**Pourquoi :** une licence libre ne te protège que si tu peux la lire. Elle dit ce que tu peux faire avec Erevos, et ce
que te doit quiconque le modifie.

Cette partie s’ouvre aussi depuis **Réglages** → **Général** → **Licence**.

## Ce qui arrive {#coming}

Le chiffrement de bout en bout est là, par le relais et par la liaison à proximité, et la plupart de ce qui suit repose
dessus.

- **Plus de façons de rester en contact :** les ponts Tor, pour là où Tor est bloqué, sont là, voir [Par Tor](#tor).
  Ensuite : Tor sur un ordinateur.
  - **Radios LoRa (Meshtastic) :** c’est là, voir [Par une radio LoRa](#lora). Ensuite : régler le nom de la radio
    depuis Erevos.
  - [~] **SMS :** Erevos comme appli SMS est là, avec les photos MMS, les MMS de groupe et deux SIM, voir [SMS](#sms).
  - [~] **Téléphone :** Erevos comme appli de téléphone est là, avec son propre écran d’appel, voir [Téléphone](#phone).
  - **E-mail, codes QR, USB, NFC :** pour quand rien d’autre ne passe.
- **Appels :** les appels vocaux et vidéo sont là, et sur Android ils sonnent en arrière-plan, voir [Discuter par un
  relais](#relay), et il y a aussi un talkie-walkie qui fonctionne même par Bluetooth.
- **Groupes :** les discussions de groupe, avec photos, fichiers et messages vocaux, et les appels vocaux et vidéo de
  groupe sont là, voir [Discussions de groupe](#groups). Ensuite : la vidéo à plus de quatre personnes, par un serveur
  vers lequel l’appel passe de lui-même, toujours chiffrée de bout en bout.
- **Amener tes discussions :** Telegram et WhatsApp entrent déjà, avec leurs photos et fichiers, et Viber avec ses mots,
  voir [Discussions importées](#import). Ensuite : les photos et fichiers de Viber.
- **Plus de systèmes :** les groupes publics et les appels de groupe sur les appareils associés aussi ; le compte, ses
  appels et ses groupes sont déjà sur un ordinateur, voir [Appareils associés](#devices). Linux, macOS et Windows sont
  là, voir [Sur un ordinateur](#desktop), l’iPhone depuis le navigateur, voir [Sur un iPhone](#iphone), et Sailfish OS,
  voir [Sur Sailfish OS](#sailfish) ; et les sauvegardes aussi, voir [Sauvegardes](#backup).

## Questions {#faq}

### J’ai oublié mon mot de passe.

Il n’y a aucun moyen de le récupérer. Erevos ne garde rien qui pourrait ouvrir tes données sans lui. Seulement si le
déverrouillage par [empreinte digitale ou visage](#lock) est activé, il ouvre encore le premier espace : définis-y un
nouveau mot de passe avec **Changer le mot de passe**.

### Un contact qui est à proximité n’affiche jamais « À proximité ».

- Écris-lui : les téléphones apprennent qui est qui grâce au premier message qui arrive à proximité. Seuls les contacts
  sont trouvés, alors ajoutez-vous d’abord l’un l’autre.
- Garde un espace ouvert sur les deux téléphones : Erevos à l’écran, ou en arrière-plan avec **En arrière-plan** sur
  **Recevoir et sonner**.
- Vérifie que le Bluetooth est activé (et, sur Android 12 et plus ancien, la localisation), et qu’Erevos a le droit de
  trouver les appareils à proximité (paramètres d’Android → Applications → Erevos → Autorisations).
- Rapproche les téléphones. Si l’un d’eux n’a pas de Wi-Fi Aware, ils se rencontrent par Bluetooth, qui est plus lent à
  démarrer.
- Ou connecte les deux au même Wi-Fi, ou au point d’accès d’un des téléphones, avec **Trouver Erevos sur le même Wi-Fi**
  activé. Certains Wi-Fi publics tiennent les appareils connectés à l’écart les uns des autres : là, cela ne peut pas
  fonctionner. Sans Wi-Fi en commun, **Créer un Wi-Fi avec les téléphones à proximité** les laisse en créer un (Android
  10 et plus récent) ; laisse-lui jusqu’à une minute ou deux.

### Rien n’arrive par LoRa.

- Les deux radios ont besoin de la même région et du même premier canal (son nom et sa clé) dans l’appli Meshtastic, et
  d’être à portée l’une de l’autre, ou de radios entre elles.
- **Radio LoRa**, sous **Réglages** → **Relais et réseaux**, doit indiquer **Connecté**. Sinon, ferme l’appli
  Meshtastic : une radio ne se relie qu’à une appli à la fois.
- Seuls les textes passent, et seulement quand le relais est injoignable et qu’aucun téléphone n’est proche.
- Dans l’UE, une radio ne peut émettre qu’une quantité limitée chaque heure : après beaucoup de messages, elle attend.

### Un code de contact n’a pas été ajouté.

Un contact sur un autre relais a besoin d’un lien avec la clé de ce relais, ce qu’ont les liens d’un {=Erevos} à jour : la
ligne sous la discussion nomme ce relais. Un code d’un {=Erevos} plus ancien n’a pas de clés et est refusé : demandes-en un
nouveau.

### Le relais peut-il lire mes messages ?

Non. Les messages par un relais sont chiffrés de bout en bout, et seuls les deux téléphones ont les clés. Le relais voit
quand même quelles files d’attente sont utilisées, et quand et combien arrive ([Faire tourner ton propre
relais](#own-relay)). Compare le numéro de sécurité, comme dans [Discuter par un relais](#relay), pour être sûr que
personne n’est entre les deux. Rien n’a encore été audité.

### Pourquoi Erevos ne demande-t-il pas mon numéro de téléphone ?

Parce que rien n’en a besoin. Chaque contact est une paire de files d’attente à sens unique sur un relais, donc aucun
serveur ne détient une liste de qui connaît qui.

### Est-ce que ça marche sur un iPhone ou un ordinateur ?

Sur un ordinateur, oui : Linux, macOS et Windows, voir [Sur un ordinateur](#desktop). Sur un iPhone, oui, depuis le
navigateur, comme app web, voir [Sur un iPhone](#iphone).
`;
