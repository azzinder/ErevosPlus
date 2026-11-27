// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// French for parts (lib/i18n.ts).
export const parts: Record<string, string> = {
  // The password screen and the password sheet (lock/gate.tsx, components/PasswordSheet.tsx).
  'Enter your password': 'Saisis ton mot de passe',
  Unlock: 'Déverrouiller',
  'Wrong password': 'Mot de passe incorrect',
  'Use at least {n} characters.': 'Utilise au moins {n} caractères.',
  'The passwords do not match.': 'Les mots de passe ne correspondent pas.',
  'Use a different password.': 'Choisis un autre mot de passe.',
  'New password': 'Nouveau mot de passe',
  'Repeat password': 'Répète le mot de passe',
  'Too many attempts. Try again in {n} minute.': 'Trop de tentatives. Réessaie dans {n} minute.',
  'Too many attempts. Try again in {n} minutes.': 'Trop de tentatives. Réessaie dans {n} minutes.',
  'Too many attempts. Try again in {n} second.': 'Trop de tentatives. Réessaie dans {n} seconde.',
  'Too many attempts. Try again in {n} seconds.': 'Trop de tentatives. Réessaie dans {n} secondes.',

  // Small parts of screens.
  'QR code': 'Code QR',
  Group: 'Groupe',

  // Calls (components/call-screen.tsx, components/group-call-screen.tsx).
  'Call ended': 'Appel terminé',
  'They hung up': 'A raccroché',
  'Turned down': 'Refusé',
  'They turned it down': 'A refusé',
  'They are in another call': 'Est déjà en appel',
  'Not answered': 'Sans réponse',
  'The call could not connect': 'L’appel n’a pas pu aboutir',
  'The call could not connect on their phone': 'L’appel n’a pas pu aboutir sur l’autre téléphone',
  'Calling…': 'Appel…',
  'Ringing…': 'Ça sonne…',
  'Incoming video call': 'Appel vidéo entrant',
  'Incoming voice call': 'Appel vocal entrant',
  'Connecting…': 'Connexion…',
  'Missed call': 'Appel manqué',
  Decline: 'Refuser',
  Answer: 'Répondre',
  Unmute: 'Activer micro',
  Mute: 'Couper micro',
  Speaker: 'Haut-parleur',
  'Camera on': 'Activer caméra',
  'Camera off': 'Couper caméra',
  Flip: 'Retourner',
  End: 'Raccrocher',
  'You started a group video call': 'Tu as lancé un appel vidéo de groupe',
  'You started a group call': 'Tu as lancé un appel de groupe',
  '{name} started a group video call': '{name} a lancé un appel vidéo de groupe',
  '{name} started a group call': '{name} a lancé un appel de groupe',
  'Waiting for others · {time}': 'En attente des autres · {time}',
  'Missed group call': 'Appel de groupe manqué',
  'Could not open the microphone': 'Impossible d’ouvrir le micro',
  'Pictures pause with more than {n} in the call': 'Les images se mettent en pause au-delà de {n} personnes dans l’appel',
  'Group video call · end-to-end encrypted': 'Appel vidéo de groupe · chiffré de bout en bout',
  'Group voice call · end-to-end encrypted': 'Appel vocal de groupe · chiffré de bout en bout',
  'In the call': 'Dans l’appel',
  Join: 'Rejoindre',
  '{name} tried to call. Accept their message request to take calls from them.':
    '{name} a essayé de t’appeler. Accepte la demande de message pour recevoir ses appels.',
  'The call ended.': 'L’appel est fini.',
  'The call has ended.': 'L’appel a pris fin.',
  'Calls are set up through the server. Type its address in Server first.': 'Les appels s’établissent par le serveur. Saisis d’abord son adresse dans « Serveur ».',

  // The web app's card (components/integrity-card.tsx, lib/integrity.web.ts).
  'This web app': 'Cette app web',
  'Release {version}, checked': 'Version {version}, vérifiée',
  'Not checked: no service worker runs Erevos here': 'Non vérifiée : aucun service worker n’exécute Erevos ici',
  "Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is":
    'Erevos n’exécute que du code signé avec sa clé de publication, gardée sur cet appareil. L’empreinte de la clé est',
  '. It must match the one you were given with the address of this server.': '. Elle doit correspondre à celle qu’on t’a donnée avec l’adresse de ce serveur.',
  'Release {version} is checked and starts the next time Erevos opens.': 'La version {version} est vérifiée et démarrera à la prochaine ouverture d’Erevos.',
  'Last looked for updates {when}.': 'Dernière recherche de mises à jour : {when}.',
  'Refused:': 'Refusé :',
  'Looking…': 'Recherche…',
  'Look for an update': 'Chercher une mise à jour',
  'Notifications while closed': 'Notifications quand l’app est fermée',
  'On in this space': 'Activées dans cet espace',
  'Off in this space': 'Désactivées dans cet espace',
  'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.':
    'Quand des messages arrivent, ou qu’un appel sonne, alors qu’Erevos est fermé, ton serveur envoie un push par le service push de ce navigateur (celui d’Apple sur un iPhone), et Erevos affiche le nombre de messages arrivés depuis la dernière fois que tu l’as ouvert, par exemple « 3 nouveaux messages », ou « Appel » si seul un appel a sonné, rien de plus. Le push ne contient ni message ni expéditeur, et son décompte est chiffré pour ce navigateur, mais le service push voit quand quelque chose arrive pour cet appareil, et qu’il utilise Erevos. Si un serveur ou l’Erevos d’un expéditeur est antérieur à la version 2.0.0, ou si un message a été acheminé jusqu’au serveur par d’autres téléphones, il n’y a pas de nombre : Erevos affiche alors « Nouveau message », ou « Nouveaux messages » si d’autres sont arrivés, jusqu’à ce que tu l’ouvres. Les discussions masquées ne reçoivent jamais de notifications. Chaque espace qui les active a sa propre adresse push, donc l’adresse ne relie pas deux espaces entre eux auprès de leur serveur.',
  'Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.':
    'Ton serveur n’a pas encore pu être prévenu, des notifications peuvent donc encore arriver. Erevos le préviendra dès qu’il sera joignable.',
  'A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.':
    'Un appel qui arrive pendant qu’Erevos est fermé ne sonne pas : seule la notification « Appel » s’affiche. Sur un iPhone, on ne peut pas faire plus : Apple ne laisse une app web ni tourner tant qu’elle est fermée, ni sonner comme un téléphone ; il faudrait pour cela une app de l’App Store. Sur Android, l’app Erevos sonne même fermée.',
  "Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.":
    'Chaque espace qui les a activées a son propre service worker dans ce navigateur, que ses réglages listent : qui peut les voir peut compter les espaces avec notifications. Une demande de message de quelqu’un de nouveau, par ton lien de contact, peut ne s’afficher qu’à l’ouverture d’Erevos.',
  'Turn off': 'Désactiver',
  'Turn on': 'Activer',
  'Erevos was tampered with': 'Erevos a été falsifié',
  'The server sent this device a new service worker, the part of Erevos that checks its code, and no signed release lists it. Erevos goes on with the checked code while it is open, but once it is closed the browser may start the new one, which could show a fake Erevos. Do not open Erevos from this server again, and do not type your passwords into it, until whoever runs the server knows why. Your chats stay sealed with your password.':
    'Le serveur a envoyé à cet appareil un nouveau service worker, la partie d’Erevos qui vérifie son code, et aucune version signée ne le mentionne. Erevos continue avec le code vérifié tant qu’il est ouvert, mais une fois fermé, le navigateur peut démarrer le nouveau, qui pourrait afficher un faux Erevos. N’ouvre plus Erevos depuis ce serveur, et n’y saisis pas tes mots de passe, tant que la personne qui gère le serveur ne sait pas pourquoi. Tes discussions restent scellées par ton mot de passe.',
  'I understand': 'J’ai compris',
  'Update refused': 'Mise à jour refusée',
  '{reason} Erevos keeps the release it has. Settings → Privacy and security → This web app shows what was refused.':
    '{reason} Erevos garde sa version actuelle. « Réglages → Confidentialité et sécurité → Cette app web » indique ce qui a été refusé.',

  // Files and photos (lib/attachments.ts, lib/photo*.ts, lib/pick-*.ts, lib/save-file*.ts, lib/backup-place.web.ts).
  'Files can be 100 MB at most.': 'Les fichiers ne peuvent pas dépasser 100 Mo.',
  'The file was changed on the way, so it was not kept.': 'Le fichier a été modifié en route, il n’a donc pas été gardé.',
  'The file is not on the server any more. Files wait there 14 days.': 'Le fichier n’est plus sur le serveur. Les fichiers y attendent 14 jours.',
  'This file is not on this phone.': 'Ce fichier n’est pas sur ce téléphone.',
  'This file is not on this computer.': 'Ce fichier n’est pas sur cet ordinateur.',
  // Shown after "in", as « dans {folder} »: with its article.
  'the place you chose': 'l’emplacement que tu as choisi',
  'the downloads folder': 'le dossier Téléchargements',
  'Not saved: the share sheet was closed.': 'Non enregistré : le menu de partage a été fermé.',
  'That folder is not there any more. Choose it again.': 'Ce dossier n’existe plus. Choisis-le de nouveau.',
  // A backup that a folder did not take, in plain words (lib/backup-place.ts folderTrouble).
  'The app this folder belongs to made no file in it. Choose a folder on the phone instead, or try again later.':
    'L’appli à laquelle ce dossier appartient n’y a créé aucun fichier. Choisis plutôt un dossier sur le téléphone, ou réessaie plus tard.',
  'Erevos may no longer write in this folder. Choose it again.': 'Erevos n’a peut-être plus le droit d’écrire dans ce dossier. Choisis-le de nouveau.',
  'There is no room left in this folder. Make room, or choose another one.': 'Il n’y a plus de place dans ce dossier. Fais de la place, ou choisis-en un autre.',
  'The backup could not be written in this folder: {reason}': 'La sauvegarde n’a pas pu être enregistrée dans ce dossier : {reason}',
  'Ready to save.': 'Prêt à enregistrer.',
  Original: 'Original',
  'Original: the photo as it was, full size, with only its place, phone and time taken out.':
    'Original : la photo telle quelle, en taille réelle, sans le lieu, le téléphone et l’heure de la prise de vue.',
  '{quality}%: a new, smaller photo, quicker to send. It says nothing but its picture.':
    '{quality} % : une nouvelle photo, plus petite, plus rapide à envoyer. Elle ne dit rien d’autre que son image.',
  'This photo does not get small enough for an MMS.': 'Cette photo ne devient pas assez petite pour un MMS.',
  'Erevos may not use the camera. Allow it in the phone settings to take photos.': 'Erevos n’a pas accès à l’appareil photo. Autorise-le dans les paramètres du téléphone pour prendre des photos.',
  'Voice message': 'Message vocal',
  Sticker: 'Sticker',
  'File: {name}': 'Fichier : {name}',
  'That voice message is too long.': 'Ce message vocal est trop long.',

  // When a message or an SMS sent for later goes (components/later-picker.tsx, lib/later.ts).
  'In 1 hour': 'Dans 1 heure',
  'Tonight 20:00': 'Ce soir 20:00',
  'Tomorrow 09:00': 'Demain 09:00',
  Day: 'Jour',
  Hour: 'Heure',
  Minutes: 'Minutes',
  'Goes on {when}.': 'Envoi prévu pour {when}.',
  'That time has gone by. Choose one ahead.': 'Cette heure est passée. Choisis-en une plus tard.',
  'At most a year ahead.': 'Un an à l’avance au plus.',
  // The home screen's list (lib/inbox.ts).
  'You: {text}': 'Toi : {text}',
  Sun: 'Dim.',
  Mon: 'Lun.',
  Tue: 'Mar.',
  Wed: 'Mer.',
  Thu: 'Jeu.',
  Fri: 'Ven.',
  Sat: 'Sam.',

  // Contacts and chats (lib/e2e.ts, lib/space-chats.ts, lock/).
  "That is this chat's own contact link.": 'C’est ton propre lien de contact.',
  'That code has no key. Ask for their contact link or QR code from this version of Erevos.':
    'Ce code n’a pas de clé. Demande un lien de contact ou un code QR depuis cette version d’Erevos.',
  'No such contact.': 'Ce contact n’existe pas.',
  'Not a contact.': 'Pas un contact.',
  'That is not a phone number.': 'Ce n’est pas un numéro de téléphone.',
  'Not a time Erevos keeps messages for.': 'Erevos ne garde pas les messages aussi longtemps.',
  'No conversation with this contact.': 'Aucune conversation avec ce contact.',
  'That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.':
    'Ce contact utilise le serveur {relay}, et son lien n’a pas de clé pour lui. Demande-lui un nouveau lien.',
  'Wrong password for this backup.': 'Mot de passe incorrect pour cette sauvegarde.',

  // Groups (lib/groups.ts, lib/space-groups.ts).
  'No groups here yet.': 'Pas encore de groupes ici.',
  'Give the group a name.': 'Donne un nom au groupe.',
  'You made the group.': 'Tu as créé le groupe.',
  'Only the group’s admin adds members.': 'Seul l’admin du groupe ajoute des membres.',
  'You are not in this group any more.': 'Tu ne fais plus partie de ce groupe.',
  'Only the group’s admin renames it.': 'Seul l’admin du groupe peut le renommer.',
  'Only the group’s admin takes members out.': 'Seul l’admin du groupe retire des membres.',
  'You closed the group.': 'Tu as fermé le groupe.',
  'You asked to leave. The group closes here once the admin takes you out.': 'Tu as demandé à quitter le groupe. Il se ferme ici dès que l’admin t’en retire.',
  'You left the group.': 'Tu as quitté le groupe.',
  'You are no longer in the group.': 'Tu ne fais plus partie du groupe.',
  'member {id}': 'membre {id}',
  '{who} added you to the group.': '{who} t’a ajouté au groupe.',
  '{who} joined.': '{who} a rejoint le groupe.',
  '{who} left.': '{who} a quitté le groupe.',
  'You asked {who} for their contact link.': 'Tu as demandé son lien de contact à {who}.',
  '{who} asked for your contact link.': '{who} a demandé ton lien de contact.',
  'You sent {who} your contact link. You are each other’s contacts now.':
    'Tu as envoyé ton lien de contact à {who}. Vous êtes maintenant chacun dans les contacts de l’autre.',
  '{who} sent their contact link. You are each other’s contacts now.':
    '{who} a envoyé son lien de contact. Vous êtes maintenant chacun dans les contacts de l’autre.',
  '{who} could not be added as a contact.': '{who} n’a pas pu être ajouté aux contacts.',
  'Ask for contact links on the phone that holds this account.': 'Demande des liens de contact depuis le téléphone qui détient ce compte.',
  'They are not in this group any more.': 'Ce membre ne fait plus partie du groupe.',
  'Not in public groups.': 'Pas dans les groupes publics.',
  'More than one member of this group shows this key, so one of them is not who they say. Ask for their contact link some other way.':
    'Plus d’un membre de ce groupe affiche cette clé, donc l’un d’eux n’est pas celui qu’il prétend être. Demande son lien de contact autrement.',
  'Another space is open now.': 'Un autre espace est ouvert maintenant.',
  'Groups go through the server. Type its address in Server first.': 'Les groupes passent par le serveur. Saisis d’abord son adresse dans « Serveur ».',

  // The build and updates (lib/core.ts, lib/crypto.ts, lib/install-update*.ts, lib/updates.ts, lib/shell.ts).
  'This build has no Erevos core, so it cannot encrypt. Rebuild the app.': 'Cette version n’a pas le cœur d’Erevos, elle ne peut donc pas chiffrer. Recompile l’app.',
  'The Erevos core gave back something unexpected.': 'Le cœur d’Erevos a renvoyé quelque chose d’inattendu.',
  'This build of Erevos has no Tor.': 'Cette version d’Erevos n’a pas Tor.',
  'This build of Erevos has no Nostr.': 'Cette version d’Erevos n’a pas Nostr.',
  'This build has no secure random source. Rebuild the app so it includes expo-crypto.':
    'Cette version n’a pas de source aléatoire sûre. Recompile l’app pour qu’elle inclue expo-crypto.',
  'This release has no Android package.': 'Cette version n’a pas de paquet Android.',
  'The download was cut short.': 'Le téléchargement a été interrompu.',
  'The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.':
    'Le téléchargement s’est arrêté à chaque essai, car la connexion n’apportait plus rien pendant un moment. Rien n’a été installé : réessaie plus tard, ou sur un autre réseau.',
  'Show what is typed': 'Afficher ce que tu tapes',
  'Hide what is typed': 'Masquer ce que tu tapes',
  'The downloaded package is not the one the release published. Nothing was installed.':
    'Le paquet téléchargé n’est pas celui publié avec la version. Rien n’a été installé.',
  'This version installs from the download page.': 'Cette version s’installe depuis la page de téléchargement.',
  'GitHub answered {status}.': 'GitHub a répondu {status}.',
  "The web app's server answered {status}.": "Le serveur de l'appli web a répondu {status}.",
  'The desktop app answered {status}.': 'L’app de bureau a répondu {status}.',
  'There is no room left on this device. Free some space and try again.': 'Il n’y a plus de place sur cet appareil. Libère un peu d’espace et réessaie.',
  'This computer has no keyring to seal Erevos’s keys with, so Erevos keeps none. Start a keyring (KWallet, or GNOME Keyring with --password-store=gnome-libsecret), or start Erevos with --plain-secrets to keep them unsealed, readable by your user, and set a password lock.': 'Cet ordinateur n’a pas de trousseau pour sceller les clés d’Erevos, donc Erevos n’en garde aucune. Lance un trousseau (KWallet, ou GNOME Keyring avec --password-store=gnome-libsecret), ou lance Erevos avec --plain-secrets pour les garder non scellées, lisibles par ton utilisateur, et mets un verrouillage par mot de passe.',
  'The browser did not open its storage.': 'Le navigateur n’a pas ouvert son stockage.',

  // LoRa and nearby phones (lib/lora.ts, lib/nearby.ts).
  'The radio restarts with its new settings, and links again.': 'La radio redémarre avec ses nouveaux réglages, et se reconnecte.',
  'There is no server, and no Erevos phone is linked nearby. Type the server address in Server, or come near their phone.':
    'Il n’y a pas de serveur, et aucun téléphone Erevos n’est connecté à proximité. Saisis l’adresse du serveur dans « Serveur », ou approche-toi de l’autre téléphone.',
  'Too large for LoRa, which takes only text. It can go once the server can be reached, or near their phone.':
    'Trop volumineux pour LoRa, qui ne transmet que du texte. L’envoi pourra se faire dès que le serveur sera joignable, ou près de l’autre téléphone.',

  // The relay (lib/relay.ts, lib/sms-invite.ts); {what} is the request's name.
  'An id is 48 hex characters.': 'Un identifiant fait 48 caractères hexadécimaux.',
  'Through Tor: {reason}': 'Par Tor : {reason}',
  'cannot reach the server at {url}, or the token is wrong': 'impossible de joindre le serveur {url}, ou le jeton est incorrect',
  'message is not held': 'le message n’est pas gardé',
  'the server at {url} cannot keep messages for later: update it': 'le serveur {url} ne peut pas garder de messages pour plus tard : mets-le à jour',
  'The server at {url} that keeps it is no longer set here.': 'Le serveur {url} qui le garde n’est plus configuré ici.',
  'the server closed the connection': 'le serveur a fermé la connexion',
  'the server did not answer in time': 'le serveur n’a pas répondu à temps',
  'lost the connection to the server': 'connexion au serveur perdue',
  '{what}: queue not found': '{what} : file d’attente introuvable',
  '{what}: queue is full': '{what} : file d’attente pleine',
  '{what}: your free place on this server has used all it may today. It goes on tomorrow.': '{what} : ta place gratuite sur ce serveur a utilisé aujourd’hui tout ce qu’elle peut. Ça reprend demain.',
  '{what}: the server could not save it, try again later': '{what} : le serveur n’a pas pu l’enregistrer, réessaie plus tard',
  '{what}: the second server could not reach your server, try again later': '{what} : le second serveur n’a pas pu joindre ton serveur, réessaie plus tard',
  '{what}: the file is not on the server any more': '{what} : le fichier n’est plus sur le serveur',
  '{what}: the server has no room for files now, try again later': '{what} : le serveur n’a plus de place pour les fichiers pour l’instant, réessaie plus tard',
  '{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.': '{what} : ta place gratuite sur ce serveur a fait passer aujourd’hui tous les fichiers qu’elle peut. Les fichiers reprennent demain.',
  '{what}: the server could not keep it, try again later': '{what} : le serveur n’a pas pu le garder, réessaie plus tard',
  '{what}: your server could not reach the server the file is on': '{what} : ton serveur n’a pas pu joindre le serveur où se trouve le fichier',
  '{reason}. A server older than this app cannot take files: update it.': '{reason}. Un serveur plus ancien que cette app ne peut pas recevoir de fichiers : mets-le à jour.',
  'message is too large': 'le message est trop volumineux',
  'your server has no key for two-hop sending, so it was not sent through the second server':
    'ton serveur n’a pas de clé pour l’envoi en deux étapes, il n’est donc pas passé par le second serveur',
  'the link has given all its places on its server. Ask them for a new link': 'le lien a déjà donné toutes ses places sur son serveur. Demande-lui un nouveau lien',
  'The server address is too long for an SMS invite.': 'L’adresse du serveur est trop longue pour une invitation par SMS.',

  // Notifications in the web app (lib/web-push*.ts).
  'Notifications through the browser are for the web app.': 'Les notifications par le navigateur sont réservées à l’app web.',
  'Your server does not send notifications. It needs a newer version, set up with a push key.':
    'Ton serveur n’envoie pas de notifications. Il lui faut une version plus récente, configurée avec une clé push.',
  'This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.':
    'Ce navigateur ne peut pas afficher de notifications pour une app web fermée. Sur un iPhone, ajoute d’abord Erevos à l’écran d’accueil.',
  'Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.':
    'Les notifications ne sont pas autorisées pour Erevos. Autorise-les dans les paramètres de ce navigateur ou de ce téléphone.',
  'Set up the server first, under Server.': 'Configure d’abord le serveur, dans « Serveur ».',
  'Notifications could not be turned on: {reason}': 'Impossible d’activer les notifications : {reason}',
  // Calls' lines in a chat (lib/call-lines.ts).
  'Voice call': 'Appel vocal',
  'Video call': 'Appel vidéo',
  'Group call': 'Appel de groupe',
  'Group video call': 'Appel vidéo de groupe',
  'Missed voice call': 'Appel vocal manqué',
  'Missed video call': 'Appel vidéo manqué',
  'Missed group video call': 'Appel vidéo de groupe manqué',
  '{missed}, while in another call': '{missed}, pendant un autre appel',
  'turned down': 'refusé',
  'could not connect': 'n’a pas abouti',
  'they were in another call': 'déjà en appel',
  'not answered': 'sans réponse',
  'Only {given} of the {all} files went to the downloads, so they are not all saved.': 'Seuls {given} des {all} fichiers sont allés dans les téléchargements : ils ne sont donc pas tous enregistrés.',
  'Save the files': 'Enregistrer les fichiers',
  '{given} of the {all} files went to the downloads. Tap Save for the next one: {name}': '{given} des {all} fichiers sont allés dans les téléchargements. Touche Enregistrer pour le suivant : {name}',
  "The browser did not keep it.": "Le navigateur ne l’a pas gardé.",
  "New device of {who}: your messages go to it too.": "Nouvel appareil de {who} : tes messages y vont aussi.",
  "A device of {who} changed its key: your messages do not go to it.": "Un appareil de {who} a changé de clé : tes messages n’y vont pas.",
};
