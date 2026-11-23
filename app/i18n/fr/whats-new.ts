// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of What's new, what each version changed (lib/whats-new.ts, app/whats-new.tsx) (i18n/fr/index.ts).
export const whatsNew: Record<string, string> = {
  "**Telegram notices go once read**: in Erevos+, a Telegram chat read and left at once no longer leaves its notice of new messages behind, and a chat muted or out of your folders says nothing of what came meanwhile once it is heard again. See [Telegram](#telegram).":
    "**Les notifications de Telegram partent une fois lues** : dans Erevos+, une discussion Telegram lue et quittée aussitôt ne laisse plus derrière elle sa notification de nouveaux messages, et une discussion en sourdine ou hors de tes dossiers ne dit rien de ce qui est arrivé entre-temps quand elle est de nouveau écoutée. Voir [Telegram](#telegram).",
  "**Release candidate**: Erevos+ as it is meant to come out, with everything Erevos 3.0.0-rc.1 brought.":
    "**Version candidate** : Erevos+ tel qu’il doit sortir, avec tout ce qu’Erevos 3.0.0-rc.1 a apporté.",
  "**Release candidate**: Erevos Lite as it is meant to come out, with what Erevos 3.0.0-rc.1 brought to its chats and calls.":
    "**Version candidate** : Erevos Lite tel qu’il doit sortir, avec ce qu’Erevos 3.0.0-rc.1 a apporté à ses discussions et à ses appels.",
  "**Search and Ways stay in sight**: on home, the search and the **Ways** line stay under the top bar while the list scrolls.":
    "**Recherche et Voies toujours visibles** : sur l’accueil, la recherche et la ligne **Voies** restent sous la barre du haut pendant que la liste défile.",
  "**Calls on a locked phone**: a call that rings with the phone locked or its screen off now turns the screen on by itself. See [Phone](#phone).":
    "**Appels sur téléphone verrouillé** : un appel qui sonne téléphone verrouillé ou écran éteint allume désormais l’écran tout seul. Voir [Téléphone](#phone).",
  "From a code review made with the help of AI: a restore that cannot finish leaves the phone as it was, and the relay keeps its lent places, held messages and deletions right, also after a power cut.":
    "D’une revue de code faite avec l’aide de l’IA : une restauration qui ne peut aboutir laisse le téléphone comme il était, et le relais tient bien les places prêtées, les messages pour plus tard et les suppressions, même après une coupure de courant.",
  "**Erevos Lite**: Erevos's own chats, groups and calls, end-to-end encrypted, in an app of its own that asks for fewer permissions. It moves to Erevos or Erevos+, and they to it, under **Updates**. See [Updates](#updates).":
    "**Erevos Lite** : les discussions, groupes et appels propres à Erevos, chiffrés de bout en bout, dans une application à part qui demande moins d’autorisations. Il passe à Erevos ou à Erevos+, et eux à lui, sous **Mises à jour**. Voir [Mises à jour](#updates).",
  "**Short passwords**: a new password, or PIN of hidden chats, that is short is taken only after **Use it anyway**. See [Password lock](#lock).":
    "**Mots de passe courts** : un nouveau mot de passe, ou PIN des discussions cachées, trop court n’est pris qu’après **L’utiliser quand même**. Voir [Verrou par mot de passe](#lock).",
  "Tries of a password or PIN count one at a time, also across a browser's tabs; a restore that cannot finish puts back what the phone had; a release's SHA256SUMS is signed.":
    "Les essais de mot de passe ou de PIN comptent un par un, aussi entre les onglets d’un navigateur ; une restauration qui ne peut aboutir remet ce que le téléphone avait ; le SHA256SUMS de chaque version est signé.",
  "**Erevos, Erevos+ or Erevos Lite**: each is now an app of its own. Choose another under **Updates**, and this Erevos hands it everything here on the phone, encrypted: open the new one within a day and it brings your chats. See [Updates](#updates).":
    "**Erevos, Erevos+ ou Erevos Lite** : chacune est maintenant une app à part. Choisis-en une autre dans **Mises à jour**, et cet Erevos lui passe tout ici sur le téléphone, chiffré : ouvre la nouvelle dans la journée et elle reprend tes discussions. Voir [Mises à jour](#updates).",
  "**Make a backup** shows what it does and how far it is in its card, with a bar, and a notice says when the backup is done. See [Backups](#backup).":
    "**Créer une sauvegarde** montre dans sa carte ce qu’elle fait et où elle en est, avec une barre, et une notification dit quand la sauvegarde est faite. Voir [Sauvegardes](#backup).",
  "**MMS abroad**: while roaming, an MMS waits for a tap, **Fetch (may cost)**, unless you choose otherwise under **Settings** → **Phone and SMS** → **SMS** → **MMS**. See [SMS](#sms).":
    "**MMS à l’étranger** : en itinérance, un MMS attend un appui, **Récupérer (peut coûter)**, sauf si tu choisis autrement dans **Réglages** → **Téléphone et SMS** → **SMS** → **MMS**. Voir [SMS](#sms).",
  "**Quick texts**: hold the **+** in an SMS conversation down for short words you write often, and keep your own. See [SMS](#sms).":
    "**Textes rapides** : garde le **+** appuyé dans une conversation SMS pour des mots courts que tu écris souvent, et garde les tiens. Voir [SMS](#sms).",
  "**Reactions from iPhones**: a like or another reaction an iPhone or Google Messages sends by SMS, Liked “…”, shows as 👍 on your message instead of a message of its own. See [SMS](#sms).":
    "**Réactions des iPhone** : un like ou une autre réaction qu’un iPhone ou Google Messages envoie par SMS, Liked “…”, s’affiche en 👍 sur ton message au lieu d’un message à part. Voir [SMS](#sms).",
  "**Videos by MMS**: **+** → **Record a video** in an SMS conversation records one in MMS quality with the phone's camera app, and a video that comes plays with a tap. See [SMS](#sms).":
    "**Vidéos par MMS** : **+** → **Filmer une vidéo** dans une conversation SMS en filme une en qualité MMS avec l’appareil photo du téléphone, et une vidéo reçue se lit d’un appui. Voir [SMS](#sms).",
  "**Answer an SMS from its notice**: **What an SMS says, on its notice**, under the SMS settings, off at first, shows who wrote and what on the notice while the space is open, with **Reply** and **Mark as read**. Locked, it says \"New message\" again. See [SMS](#sms).":
    "**Répondre à un SMS depuis sa notification** : **Ce que dit un SMS, sur sa notification**, dans les réglages SMS, désactivé au début, montre sur la notification qui a écrit et quoi tant que l’espace est ouvert, avec **Répondre** et **Marquer comme lu**. Verrouillé, elle redit « Nouveau message ». Voir [SMS](#sms).",
  "**What an SMS costs**: as you write a longer SMS, a line over the field says how many SMS it goes as, 70 letters each with Greek small letters, accents or an emoji, 160 without. **Without accents (cheaper)**, under the SMS settings, sends it without accents and Greek in capitals, as the old phones wrote it. See [SMS](#sms).":
    "**Ce que coûte un SMS** : quand tu écris un SMS plus long, une ligne au-dessus du champ dit en combien de SMS il part, 70 caractères chacun avec des minuscules grecques, des accents ou un emoji, 160 sans. **Sans accents (moins cher)**, dans les réglages SMS, l’envoie sans accents et le grec en majuscules, comme les anciens téléphones. Voir [SMS](#sms).",
  "**Who an unknown number is, without asking anyone**: the call screen of a number that is none of your contacts says its country, place and whether it is a mobile, from the number alone, and warns of spam from a list you download whole under **Phone** → **Settings** → **Spam list**, or numbers you reported in **Recents**. See [Phone](#phone).":
    "**Qui est un numéro inconnu, sans rien demander à personne** : l’écran d’appel d’un numéro qui n’est pas dans tes contacts dit son pays, son lieu et si c’est un mobile, à partir du numéro seul, et prévient du spam grâce à une liste que tu télécharges entière sous **Téléphone** → **Réglages** → **Liste de spam**, ou aux numéros que tu as signalés dans **Récents**. Voir [Téléphone](#phone).",
  "**Video calls through your phone company**: where your SIM and network carry them (ViLTE), a video call that comes shows **Answer with video** and **Audio only**, a call can turn video on with **Video**, and **⋯** beside a typed number offers **Video call**. See [Phone](#phone).":
    "**Appels vidéo par ton opérateur** : là où ta SIM et ton réseau les prennent en charge (ViLTE), un appel vidéo entrant affiche **Répondre en vidéo** et **Audio seul**, un appel active la vidéo avec **Vidéo**, et **⋯** à côté d’un numéro tapé propose **Appel vidéo**. Voir [Téléphone](#phone).",
  "**Who is in a conference call**: once calls are merged, the call screen lists each person, with **Separate** to talk with one alone and **End** to drop one, where your phone company allows it. See [Phone](#phone).":
    "**Qui est dans une conférence** : une fois les appels fusionnés, l’écran d’appel liste chaque personne, avec **Séparer** pour lui parler seul et **Raccrocher** pour la retirer, là où ton opérateur le permet. Voir [Téléphone](#phone).",
  "**Speed dial**: hold a key from 2 to 9 on the Phone's empty keypad to call the number you put on it; an empty key offers to choose one, and **Phone** → **Settings** → **Speed dial** shows them all. Kept sealed in the space. See [Phone](#phone).":
    "**Numérotation rapide** : maintiens une touche de 2 à 9 sur le clavier vide du Téléphone pour appeler le numéro que tu y as mis ; une touche vide te laisse en choisir un, et **Téléphone** → **Réglages** → **Numérotation rapide** les montre tous. Gardés chiffrés dans l’espace. Voir [Téléphone](#phone).",
  "**Call settings in one place**: under **Phone** → **Settings**, **Call settings** opens Android's screens for call forwarding, call waiting, showing your number and the voicemail number, for each SIM, and asks your phone company with the usual codes where a phone has no such screen. See [Phone](#phone).":
    "**Les réglages d’appel au même endroit** : sous **Téléphone** → **Réglages**, **Réglages d’appel** ouvre les écrans d’Android pour le renvoi d’appel, le double appel, l’affichage de ton numéro et le numéro de messagerie vocale, pour chaque SIM, et interroge ton opérateur avec les codes habituels là où le téléphone n’a pas cet écran. Voir [Téléphone](#phone).",
  "**Voicemail at a hold**: on the Phone's keypad, hold **1** to call your voicemail. Where your phone company sends voicemails as recordings, **Voicemail** beside **Recents** lists them, to play, call back or delete. See [Phone](#phone).":
    "**La messagerie vocale d’un appui long** : sur le clavier du Téléphone, maintiens **1** pour appeler ta messagerie vocale. Là où ton opérateur envoie les messages en enregistrements, **Messagerie vocale** à côté de **Récents** les liste, pour les écouter, rappeler ou les supprimer. Voir [Téléphone](#phone).",
  "**Emergency calls without delay**: an emergency number is called at once, never asking which SIM, and with Erevos locked, **Emergency call** on the password screen opens Android's emergency keypad. See [Phone](#phone).":
    "**Appels d’urgence sans attente** : un numéro d’urgence est appelé tout de suite, sans demander la SIM, et avec Erevos verrouillé, **Appel d’urgence** sur l’écran du mot de passe ouvre le clavier d’urgence d’Android. Voir [Téléphone](#phone).",
  "**Gallery originals, deleted as chosen**: with **Delete the original from the gallery after importing** on, a photo picked from the phone's storage is now deleted from the gallery too, and when Android does not say which photo of the gallery it is, Erevos says so instead of keeping quiet. See [Collection](#collection).":
    "**Les originaux de la galerie sont supprimés comme choisi** : avec **Supprimer l’original de la galerie après l’import** activé, une photo du stockage du téléphone est maintenant supprimée de la galerie aussi, et quand Android ne dit pas quelle photo de la galerie c’est, Erevos le dit au lieu de se taire. Voir [Collection](#collection).",
  "**The services stay in sight**: on home, the services button stays under the top bar while the list scrolls, so another part is a tap away; the search and **Ways** scroll with the list. **Names** shows only on the **SMS** part, where it belongs.":
    "**Les services restent en vue** : sur l’accueil, le bouton des services reste sous la barre du haut quand la liste défile, une autre partie est donc à une touche ; la recherche et **Voies** défilent avec la liste. **Noms** n’apparaît que dans la partie **SMS**, là où il sert.",
  "**New SMS on the SMS part**: on the **SMS** part of the chat list, the button at the bottom is **New SMS** and opens only a new SMS, also with Erevos's own chats on. See [SMS](#sms).":
    "**Nouveau SMS dans la partie SMS** : dans la partie **SMS** de la liste des discussions, le bouton du bas est **Nouveau SMS** et n’ouvre qu’un nouveau SMS, même avec les discussions d’Erevos activées. Voir [SMS](#sms).",
  "What's new": 'Nouveautés',
  'What each version changed': 'Ce que chaque version a changé',
  'What each version of Erevos changed, the newest first.': 'Ce que chaque version d’Erevos a changé, la plus récente en premier.',
  'Not out yet': 'Pas encore sortie',
  'This version': 'Cette version',
  'For you': 'Pour toi',
  'Under the hood': 'Sous le capot',
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
  "**Photos and videos, as in a gallery**: in the Collection, **Camera** is Erevos's own, so no other app sees what it takes, **From the gallery** brings in many photos and videos at once, HEIC and AVIF photos show among the photos, **Edit** turns and cuts a photo into a new one, and **Information** says whether a photo or video says where it was taken. A photo that leaves Erevos goes without where and when it was taken, unless you choose otherwise. See [Collection](#collection).": "**Photos et vidéos, comme dans une galerie** : dans la Collection, **Appareil photo** est celui d’Erevos, donc aucune autre application ne voit ce qu’il prend, **Depuis la galerie** fait entrer plusieurs photos et vidéos à la fois, les photos HEIC et AVIF apparaissent parmi les photos, **Modifier** fait pivoter et recadre une photo en une nouvelle, et **Informations** dit si une photo ou une vidéo dit où elle a été prise. Une photo qui quitte Erevos sort sans le lieu ni l’heure de la prise, sauf si tu choisis autrement. Voir [Collection](#collection).",
  "**Night photos and HDR**: Erevos's own camera now uses the night, HDR and portrait modes of the phone's maker where the phone has them, as on a Pixel, made on the phone itself. A tap focuses there, **Darker** and **Brighter** set the light, the zoom buttons go to the wide lens, 2× and 5×, and videos can be HDR. A photo is never written anywhere, not even for a moment. See [Collection](#collection).": "**Photos de nuit et HDR** : l’appareil photo d’Erevos utilise maintenant les modes nuit, HDR et portrait du fabricant du téléphone là où le téléphone les a, comme sur un Pixel, faits sur le téléphone lui-même. Un appui fait la mise au point à cet endroit, **Plus sombre** et **Plus clair** règlent la lumière, les boutons de zoom passent au grand angle, à 2× et 5×, et les vidéos peuvent être en HDR. Une photo n’est jamais écrite nulle part, pas même un instant. Voir [Collection](#collection).",
  "**Messenger in its case tells you of new messages**: in Erevos+, when you use Messenger in its case, Erevos now tells you of its new messages as it does of other chats, even if you never opened the case. A chat with messages not read shows on home until it is read, and tapping it opens it in the case; while the case is open, Erevos tells of nothing, as the page shows it. See [Messenger](#messenger).":
    "**Messenger dans son étui t’avertit des nouveaux messages** : dans Erevos+, quand tu utilises Messenger dans son étui, Erevos t’avertit maintenant de ses nouveaux messages comme des autres discussions, même si tu n’as jamais ouvert l’étui. Une discussion avec des messages non lus apparaît sur l’accueil jusqu’à sa lecture, et un appui l’ouvre dans l’étui ; tant que l’étui est ouvert, Erevos n’avertit de rien, puisque la page le montre. Voir [Messenger](#messenger).",
  "**Messenger in its case wears your whole look**: in Erevos+, Meta's own Messenger page in its case now takes your look: its colours, dark or light as Erevos is, the shape of your bubbles (round, square or a line), your text size, your style's letters, and what lies behind your screens (a wallpaper, Neon's grid, Paper's lines and the others), and it changes with your look even while it is open. A photo of your own stays in Erevos: there the page shows a soft gradient instead. Where Meta changes its page, parts of it may keep Meta's look. See [Messenger](#messenger).":
    "**Messenger dans son étui porte toute ton apparence** : dans Erevos+, la page Messenger de Meta dans son étui prend maintenant ton apparence : ses couleurs, sombre ou claire comme Erevos, la forme de tes bulles (rondes, carrées ou une ligne), ta taille de texte, les lettres de ton style et ce qui se trouve derrière tes écrans (un fond d’écran, la grille de Neon, les lignes de Paper et les autres), et elle change avec ton apparence même lorsqu’elle est ouverte. Une photo à toi reste dans Erevos : la page montre alors un dégradé doux à la place. Là où Meta change sa page, certaines parties peuvent garder l’apparence de Meta. Voir [Messenger](#messenger).",
  "**Messenger in its case asks for the PIN once**: in Erevos+, what Meta's page keeps now stays in the case between openings, apart from every other page, so Meta knows your phone again and no longer asks for the PIN of your encrypted chats each time you open it. It goes when you sign out of Messenger, or when another account opens the case. See [Messenger](#messenger).":
    "**Messenger dans son étui ne demande le code PIN qu’une fois** : dans Erevos+, ce que garde la page de Meta reste désormais dans l’étui d’une ouverture à l’autre, à part de toute autre page, si bien que Meta reconnaît ton téléphone et ne demande plus le code PIN de tes discussions chiffrées à chaque ouverture. Cela s’efface quand tu te déconnectes de Messenger ou qu’un autre compte ouvre l’étui. Voir [Messenger](#messenger).",
  "**Your networks move with Erevos+**: moving from one Erevos+ to another on the same phone (as from Erevos+ 7.x to the new Erevos+), Telegram, Signal, Session, Messenger and Matrix now go on signed in, as they were. Telegram's photos and files download again as they are opened, and Messenger's page asks for its PIN once more. Moving from Erevos+ to Erevos or Erevos Lite says first that those accounts stay behind, and to write down Session's 13 recovery words. See [Updates](#updates).":
    "**Tes réseaux déménagent avec Erevos+** : en déménageant d'un Erevos+ à un autre sur le même téléphone (comme d'Erevos+ 7.x au nouvel Erevos+), Telegram, Signal, Session, Messenger et Matrix restent désormais connectés, comme avant. Les photos et fichiers de Telegram se téléchargent à nouveau à leur ouverture, et la page de Messenger demande son PIN une fois de plus. Déménager d'Erevos+ vers Erevos ou Erevos Lite prévient d'abord que ces comptes restent derrière, et qu'il faut noter les 13 mots de récupération de Session. Voir [Mises à jour](#updates).",
};
