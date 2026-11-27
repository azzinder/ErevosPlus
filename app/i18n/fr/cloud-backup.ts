// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Le français des sauvegardes vers un serveur (lib/backup-cloud.ts, app/backup.tsx) (i18n/fr/index.ts).
export const cloudBackup: Record<string, string> = {
  'Made a backup in {folder}, but it did not go to the server. {error}': 'Sauvegarde faite dans {folder}, mais elle n’est pas partie vers le serveur. {error}',
  'Made a backup in {folder} and sent it to {server}.': 'Sauvegarde faite dans {folder} et envoyée à {server}.',
  'Stop sending to the server': 'Ne plus envoyer au serveur',
  'Automatic backups will go only to the folder from now on. Those already on the server stay there until you delete them.':
    'Les sauvegardes automatiques iront désormais seulement dans le dossier. Celles déjà sur le serveur y restent jusqu’à ce que tu les supprimes.',
  'Backups no longer go to the server.': 'Les sauvegardes ne vont plus au serveur.',
  'To a server too': 'Aussi vers un serveur',
  'To {server}': 'Vers {server}',
  'Last one sent {when}.': 'La dernière envoyée {when}.',
  'None sent yet.': 'Aucune envoyée encore.',
  'Each automatic backup goes there too, and the server keeps the {n} newest.': 'Chaque sauvegarde automatique y va aussi, et le serveur garde les {n} plus récentes.',
  'The last one did not go: {error} Erevos tries again next time it opens.': 'La dernière n’est pas partie : {error} Erevos réessaie la prochaine fois qu’il s’ouvre.',
  'Stop sending': 'Ne plus envoyer',
  'Folder address (WebDAV)': 'Adresse du dossier (WebDAV)',
  'In Nextcloud: Files → Files settings → WebDAV gives the start; add a folder you made for backups, like …/remote.php/dav/files/NAME/Backups':
    'Dans Nextcloud : Fichiers → Paramètres des fichiers → WebDAV donne le début ; ajoute un dossier que tu as créé pour les sauvegardes, comme …/remote.php/dav/files/NOM/Backups',
  'User name': 'Nom d’utilisateur',
  "Best an app password made for Erevos alone, in the server's security settings: you can take it back there without changing your own.":
    'Mieux vaut un mot de passe d’application rien que pour Erevos, pris dans les paramètres de sécurité du serveur : tu peux le retirer là-bas sans changer le tien.',
  'Add a server': 'Ajouter un serveur',
  'That is not a folder address. It starts with https://': 'Ce n’est pas une adresse de dossier. Elle commence par https://',
  'The address has to start with https://, so the password and backups go encrypted.':
    'L’adresse doit commencer par https://, pour que le mot de passe et les sauvegardes passent chiffrés.',
  'Put the user name and password in their own fields, not in the address.': 'Mets le nom d’utilisateur et le mot de passe dans leurs propres champs, pas dans l’adresse.',
  'The server did not take that user name and password.': 'Le serveur n’a pas accepté ce nom d’utilisateur et ce mot de passe.',
  'That folder is not on the server. Make it there first.': 'Ce dossier n’est pas sur le serveur. Crée-le d’abord là-bas.',
  'The server has no room left for it.': 'Le serveur n’a plus de place pour elle.',
  'The server answered {status}.': 'Le serveur a répondu {status}.',
  'Could not reach the server. {error}': 'Impossible de joindre le serveur. {error}',
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, when one comes and roughly how big it is, and your address unless the backup goes through Tor, as the space's Tor setting says. Nothing goes until you add one.":
    "Chaque sauvegarde automatique peut aussi aller dans un dossier sur un serveur de ton choix, comme ton Nextcloud, par WebDAV. Le serveur reçoit des octets aléatoires sous un nom aléatoire : il ne peut ni les ouvrir ni savoir qu’ils sont d’Erevos. Il voit quand même ton compte, quand une arrive et à peu près sa taille, et ton adresse, sauf si la sauvegarde passe par Tor, comme le dit le réglage Tor de l’espace. Rien ne part tant que tu n’en ajoutes pas un.",
  "This space sends Everything through Tor, and Tor here cannot reach a server, so nothing went to it.":
    "Cet espace envoie Tout par Tor, et ici Tor ne peut pas joindre de serveur : rien n’y est allé.",
  "There is no Erevos backup in that folder.":
    "Il n’y a aucune sauvegarde Erevos dans ce dossier.",
  "Restore from a server":
    "Restaurer depuis un serveur",
  "The folder on your server that automatic backups went to. The password is used for this restore only and not kept.":
    "Le dossier de ton serveur où allaient les sauvegardes automatiques. Le mot de passe sert seulement à cette restauration et n’est pas gardé.",
  "Look there":
    "Chercher là",
  "Backups on {server}, newest first. Choose one, then type its password.":
    "Sauvegardes sur {server}, les plus récentes d’abord. Choisis-en une, puis tape son mot de passe.",
  "In a browser the server has to let the web app in (CORS), and this one did not, or could not be reached.":
    "Dans un navigateur, le serveur doit laisser entrer l’app web (CORS), et celui-ci ne l’a pas fait ou n’a pas pu être joint.",
  "Erevos forgets the server and its password here. The backups already on it stay there until you delete them.":
    "Erevos oublie ici le serveur et son mot de passe. Les sauvegardes déjà dessus y restent jusqu’à ce que tu les supprimes.",
  "Send a backup there now and then; the server keeps the {n} newest.":
    "Envoies-y une sauvegarde de temps en temps ; le serveur garde les {n} plus récentes.",
  "The last one did not go: {error}":
    "La dernière n’est pas partie : {error}",
  "Send a backup now":
    "Envoyer une sauvegarde maintenant",
  "A backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV, each time you send one. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Une sauvegarde peut aussi aller dans un dossier sur un serveur de ton choix, comme ton Nextcloud, par WebDAV, chaque fois que tu en envoies une. Le serveur reçoit des octets aléatoires sous un nom aléatoire : il ne peut ni les ouvrir ni savoir qu’ils sont d’Erevos. Il voit quand même ton compte, ton adresse, quand une arrive et à peu près sa taille. Rien ne part tant que tu n’en ajoutes pas un.",
  "Each automatic backup can also go to a folder on a server you choose, such as your Nextcloud, over WebDAV. The server gets random bytes under a random name: it cannot open them or tell they are Erevos's. It still sees your account, your address, when one comes and roughly how big it is. Nothing goes until you add one.":
    "Chaque sauvegarde automatique peut aussi aller dans un dossier sur un serveur de ton choix, comme ton Nextcloud, par WebDAV. Le serveur reçoit des octets aléatoires sous un nom aléatoire : il ne peut ni les ouvrir ni savoir qu’ils sont d’Erevos. Il voit quand même ton compte, ton adresse, quand une arrive et à peu près sa taille. Rien ne part tant que tu n’en ajoutes pas un.",
  "In a browser this works only with a server set to let the web app in (CORS), which Nextcloud is not as it comes. The desktop app and Android need nothing of it.":
    "Dans un navigateur, cela ne marche qu’avec un serveur réglé pour laisser entrer l’app web (CORS), ce que Nextcloud n’est pas de base. L’app de bureau et Android n’en ont pas besoin.",
  "A backup larger than {size} MB does not come from a server. Download it from the server and tap Restore a backup.": "Une sauvegarde de plus de {size} Mo ne vient pas d’un serveur. Télécharge-la depuis le serveur et appuie sur Restaurer une sauvegarde.",
  "Automatic backups need a folder on {device}: choose one.":
    "Les sauvegardes automatiques ont besoin d’un dossier sur {device} : choisis-en un.",
  "Sent a backup to {server}.":
    "Sauvegarde envoyée à {server}.",
  "Making the backup: photos, files and voice messages, {percent}%…":
    "Sauvegarde en cours : photos, fichiers et messages vocaux, {percent} %…",
  "Putting back photos, files and voice messages: {percent}%…":
    "Remise en place des photos, fichiers et messages vocaux : {percent} %…",
  "Choose the files":
    "Choisir les fichiers",
  "Choose the folder":
    "Choisir le dossier",
  "No folder on {device} yet":
    "Pas encore de dossier sur {device}",
  "These automatic backups came with a backup made on another device, with their password; the folder they went to stays with that device. Choose a folder here, and they go on into it.":
    "Ces sauvegardes automatiques sont venues avec une sauvegarde faite sur un autre appareil, avec leur mot de passe ; le dossier où elles allaient reste lié à cet appareil. Choisis un dossier ici, et elles continuent dedans.",
  "Until then they go only to the server.":
    "D’ici là, elles vont seulement au serveur.",
  "Choose a folder":
    "Choisir un dossier",
  "What stays with each device and comes with no backup: the fingerprint, the folders Erevos may write in, what the phone lets it do and which apps make calls and send SMS. An XMPP account comes back as a new device of itself, and Matrix asks you to sign in again.":
    "Ce qui reste propre à chaque appareil et ne vient avec aucune sauvegarde : l’empreinte digitale, les dossiers où Erevos peut écrire, ce que le téléphone lui permet de faire et quelles apps passent les appels et envoient les SMS. Un compte XMPP revient comme un nouvel appareil de lui-même, et Matrix te demande de te reconnecter.",
  "Its photos, files and voice messages are in {n} more file beside it, with the same start: keep them together.":
    "Ses photos, fichiers et messages vocaux sont dans {n} autre fichier à côté d’elle, avec le même début de nom : garde-les ensemble.",
  "Its photos, files and voice messages are in {n} more files beside it, with the same start: keep them together.":
    "Ses photos, fichiers et messages vocaux sont dans {n} autres fichiers à côté d’elle, avec le même début de nom : garde-les ensemble.",
  "A file of this backup is not there: {name}.":
    "Un fichier de cette sauvegarde n’est pas là : {name}.",
  "{n} files of this backup are not there, {name} among them.":
    "{n} fichiers de cette sauvegarde ne sont pas là, dont {name}.",
  "This backup's photos, files and voice messages are in {n} more file beside it, whose name starts as its own or as an earlier backup's. Choose it.":
    "Les photos, fichiers et messages vocaux de cette sauvegarde sont dans {n} autre fichier à côté d’elle, dont le nom commence comme le sien ou comme celui d’une sauvegarde précédente. Choisis-le.",
  "This backup's photos, files and voice messages are in {n} more files beside it, whose names start as its own or as an earlier backup's. Choose them all.":
    "Les photos, fichiers et messages vocaux de cette sauvegarde sont dans {n} autres fichiers à côté d’elle, dont les noms commencent comme le sien ou comme celui d’une sauvegarde précédente. Choisis-les tous.",
  "This backup's photos, files and voice messages are in {n} more file beside it. Choose the folder the backup is in.":
    "Les photos, fichiers et messages vocaux de cette sauvegarde sont dans {n} autre fichier à côté d’elle. Choisis le dossier où se trouve la sauvegarde.",
  "This backup's photos, files and voice messages are in {n} more files beside it. Choose the folder the backup is in.":
    "Les photos, fichiers et messages vocaux de cette sauvegarde sont dans {n} autres fichiers à côté d’elle. Choisis le dossier où se trouve la sauvegarde.",
  "A file of this backup is missing: {name}. Nothing was changed.":
    "Il manque un fichier de cette sauvegarde : {name}. Rien n’a changé.",
  "A file of this backup is damaged, or belongs to another backup: {name}. Nothing was changed.":
    "Un fichier de cette sauvegarde est abîmé ou appartient à une autre sauvegarde : {name}. Rien n’a changé.",
  "A file of this backup is damaged, or belongs to another backup: {name}.":
    "Un fichier de cette sauvegarde est abîmé ou appartient à une autre sauvegarde : {name}.",
  "Restore everything else without it? The photos, files and voice messages on {device} stay as they are, and those it holds do not come back.":
    "Restaurer tout le reste sans lui ? Les photos, les fichiers et les messages vocaux sur {device} restent tels quels, et ceux qu’il contient ne reviennent pas.",
  "Restore everything else without them? The photos, files and voice messages on {device} stay as they are, and those they hold do not come back.":
    "Restaurer tout le reste sans eux ? Les photos, les fichiers et les messages vocaux sur {device} restent tels quels, et ceux qu’ils contiennent ne reviennent pas.",
  "Restore the rest":
    "Restaurer le reste",
  "Restored without {n} file of the backup, {name}: the photos, files and voice messages in it did not come back.":
    "Restaurée sans {n} fichier de la sauvegarde, {name} : les photos, les fichiers et les messages vocaux qu’il contenait ne sont pas revenus.",
  "Restored without {n} files of the backup, {name} among them: the photos, files and voice messages in them did not come back.":
    "Restaurée sans {n} fichiers de la sauvegarde, dont {name} : les photos, les fichiers et les messages vocaux qu’ils contenaient ne sont pas revenus.",
  "What takes room":
    "Ce qui prend de la place",
  "How much room Erevos takes on {device}, by kind: each automatic backup holds it all. Only the files’ names and sizes are looked at, here, and nothing is sent.":
    "La place qu’Erevos prend sur {device}, par type : chaque sauvegarde automatique contient tout cela. Seuls les noms et tailles des fichiers sont regardés, ici, et rien n’est envoyé.",
  "In all: {size}":
    "En tout : {size}",
  "Measure":
    "Mesurer",
  "Measure again":
    "Mesurer à nouveau",
  "The Collection, and photos and files in chats":
    "La Collection, et les photos et fichiers des discussions",
  "Contact pictures":
    "Photos des contacts",
  "Chat history":
    "Historique des discussions",
  "Backups kept inside Erevos":
    "Sauvegardes gardées dans Erevos",
  "Left over from writes that did not end":
    "Restes d’écritures inachevées",
  "Cache":
    "Cache",
  "Other: {name}":
    "Autres : {name}",
  "Some of what a place keeps could not be read, so nothing is taken for a leftover. Try again later.":
    "Une partie de ce que garde un lieu n’a pas pu être lue, donc rien n’est pris pour un reste. Réessaie plus tard.",
  "Nothing opens with that. Check it and type it again.":
    "Rien ne s’ouvre avec cela. Vérifie-le et tape-le à nouveau.",
  "Opened {opened} of {count}; they are read with the rest.":
    "{opened} sur {count} ouverts ; ils sont lus avec le reste.",
  "Opened, and it is read with the rest.":
    "Ouvert, et il est lu avec le reste.",
  "That one is read already.":
    "Celui-ci est déjà lu.",
  "Delete the leftovers?":
    "Supprimer les restes ?",
  "{size} of photos and files that none of the places read here names (places read: {n}). A place you did not open here loses its photos and files for good: open every one first. Backups already made keep them.":
    "{size} de photos et fichiers qu’aucun des lieux lus ici ne nomme (lieux lus : {n}). Un lieu que tu n’as pas ouvert ici perd ses photos et fichiers pour toujours : ouvre-les tous d’abord. Les sauvegardes déjà faites les gardent.",
  "{size} freed.":
    "{size} libérés.",
  "Photos and files that nothing on the phone names any more, as those of an import that stopped in its middle, stay on it and in every backup. Only a place opened with its key can say which are its own: so first type here, one at a time or several at once separated by commas or spaces, the PIN of each of your hidden chats and the password of any other space you have. This space is read by itself. Nothing is deleted before you see how much and say so; a file written in the last day is never taken.":
    "Les photos et fichiers que plus rien sur le téléphone ne nomme, comme ceux d’une importation interrompue en plein milieu, restent dessus et dans chaque sauvegarde. Seul un lieu ouvert avec sa clé peut dire lesquels sont à lui : tape donc d’abord ici, un à la fois ou plusieurs ensemble séparés par des virgules ou des espaces, le PIN de chacune de tes discussions cachées et le mot de passe de tout autre espace que tu as. Cet espace est lu de lui-même. Rien n’est supprimé avant que tu voies combien et que tu le dises ; un fichier écrit le dernier jour n’est jamais pris.",
  "PIN or password":
    "PIN ou mot de passe",
  "Read with this space: {n}":
    "Lus avec cet espace : {n}",
  "Leftovers: {size} in {n} chunks.":
    "Restes : {size} en {n} morceaux.",
  "No leftovers.":
    "Aucun reste.",
  "Find leftovers":
    "Chercher les restes",
  "Delete them":
    "Les supprimer",
  "Leftovers":
    "Restes",
  "The backup itself is not there.":
    "La sauvegarde elle-même n’est pas là.",
  "The backup itself is still empty there.":
    "La sauvegarde elle-même est encore vide là.",
  "It is not made with the automatic backups’ password, so it cannot be checked here.":
    "Elle n’est pas faite avec le mot de passe des sauvegardes automatiques, elle ne peut donc pas être vérifiée ici.",
  "The backup itself is damaged: {error}":
    "La sauvegarde elle-même est endommagée : {error}",
  "There is no backup there.":
    "Il n’y a pas de sauvegarde là.",
  "Check the backups":
    "Vérifier les sauvegardes",
  "After each automatic backup Erevos reads it back from the folder: it opens with its password, every part it names is there, of its size, and two of them, picked at random, are read through and open too. Of the server it then only looks at what is listed there, so nothing is downloaded. Check now also downloads the server’s newest backup and ten of its parts, and reads ten in the folder.":
    "Après chaque sauvegarde automatique, Erevos la relit depuis le dossier : elle s’ouvre avec son mot de passe, chaque partie qu’elle nomme est là, à sa taille, et deux d’entre elles, prises au hasard, sont lues en entier et s’ouvrent aussi. Du serveur, il ne regarde alors que ce qui y est listé, donc rien n’est téléchargé. Vérifier maintenant télécharge en plus la dernière sauvegarde du serveur et dix de ses parties, et en lit dix dans le dossier.",
  "Checking…":
    "Vérification…",
  "Check now":
    "Vérifier maintenant",
  "{place}: not checked yet.":
    "{place} : pas encore vérifiée.",
  "{place}, {when}: {error}":
    "{place}, {when} : {error}",
  "{place}, {when}: of its {parts} parts, {missing} are missing and {damaged} are not as made. A restore would lack their photos and files. Back up now, then check again.":
    "{place}, {when} : de ses {parts} parties, {missing} manquent et {damaged} ne sont pas comme faites. Une restauration n’aurait pas leurs photos et fichiers. Fais une sauvegarde maintenant, puis vérifie à nouveau.",
  "{place}, {when}: whole. It opens, all {parts} parts are there, and the {read} read through open too.":
    "{place}, {when} : complète. Elle s’ouvre, les {parts} parties sont là, et les {read} lues en entier s’ouvrent aussi.",
  "{place}, {when}: the backup and all {parts} parts are there, each of its size.":
    "{place}, {when} : la sauvegarde et ses {parts} parties sont là, chacune à sa taille.",
  "Stopped after {done} of {count} parts.":
    "Arrêtée après {done} parties sur {count}.",
  "Checking the parts: {done} of {count}":
    "Vérification des parties : {done} sur {count}",
  "Full check of the folder":
    "Vérification complète du dossier",
  "The full check reads every part in the folder through and compares it with the SHA-256 the backup wrote down for it. It takes a few minutes for many GB, and nothing leaves the phone.":
    "La vérification complète lit en entier chaque partie du dossier et la compare avec le SHA-256 que la sauvegarde a noté pour elle. Pour beaucoup de Go, elle prend quelques minutes, et rien ne quitte le téléphone.",
  "The check after it found a problem: {error}":
    "La vérification qui a suivi a trouvé un problème : {error}",
  "The check after it found {missing} of its {parts} parts missing and {damaged} damaged.":
    "La vérification qui a suivi a trouvé, sur ses {parts} parties, {missing} manquantes et {damaged} endommagées.",
  "Making the backup…": "Sauvegarde en cours…",
  "Gathering chats, contacts, SMS, calls and settings…": "Rassemblement des discussions, contacts, SMS, appels et réglages…",
  "Encrypting and saving…": "Chiffrement et enregistrement…",
  "Encrypting photos, files and voice messages…": "Chiffrement des photos, fichiers et messages vocaux…",
  "Keep Erevos open until it is done: a notice says when.": "Garde Erevos ouvert jusqu’à la fin : une notification te dira quand.",
  "Backup made": "Sauvegarde faite",
  "{name} ({size}) is saved in {folder}.": "{name} ({size}) est enregistré dans {folder}.",
  "Encrypting and sending…": "Chiffrement et envoi…",
  "Sent a backup to {server}: {total}.": "Sauvegarde envoyée à {server} : {total}.",
  "Or to {server}, your server: it gets the backup encrypted, under a random name.": "Ou vers {server}, ton serveur : il reçoit la sauvegarde chiffrée, sous un nom au hasard.",
  "Or to a folder on a server of yours over WebDAV, such as Nextcloud: it gets the backup encrypted, under a random name.": "Ou vers un dossier sur un serveur à toi en WebDAV, comme Nextcloud : il reçoit la sauvegarde chiffrée, sous un nom au hasard.",
  "To a server (WebDAV)": "Vers un serveur (WebDAV)",
  "Sent a backup to {server}, with {n} file beside it: {total} in all.": "Sauvegarde envoyée à {server}, avec {n} fichier à côté : {total} en tout.",
  "Sent a backup to {server}, with {n} files beside it: {total} in all.": "Sauvegarde envoyée à {server}, avec {n} fichiers à côté : {total} en tout.",
  "The backup itself is there, but not of the size it was sent with.": "La sauvegarde elle-même est là, mais pas de la taille avec laquelle elle a été envoyée.",
  "A backup of {total} in all went to {server}.": "Une sauvegarde de {total} en tout est partie vers {server}.",
  "{name} and {n} file beside it, {total} in all, are saved in {folder}.": "{name} et {n} fichier à côté, {total} en tout, sont enregistrés dans {folder}.",
  "{name} and {n} files beside it, {total} in all, are saved in {folder}.": "{name} et {n} fichiers à côté, {total} en tout, sont enregistrés dans {folder}.",
  "A backup sent by hand goes whole each time, with every photo and file: up to about {size} now.":
    "Une sauvegarde envoyée à la main part en entier à chaque fois, avec chaque photo et fichier : jusqu’à environ {size} maintenant.",
  "A backup sent by hand goes whole each time, with every photo and file.":
    "Une sauvegarde envoyée à la main part en entier à chaque fois, avec chaque photo et fichier.",
  "With automatic backups on, only what is new goes each time.":
    "Avec les sauvegardes automatiques activées, seul ce qui est nouveau part à chaque fois.",
  "The server keeps the {n} newest whole.":
    "Le serveur garde en entier les {n} plus récentes.",
  "Automatic backups to a server":
    "Sauvegardes automatiques vers un serveur",
  "Add the WebDAV folder they go to, such as one in your Nextcloud. Then choose their password: from then on Erevos sends one by itself every day, encrypted.":
    "Ajoute le dossier WebDAV où elles iront, par exemple un dossier de ton Nextcloud. Choisis ensuite leur mot de passe : dès lors, Erevos en envoie une de lui-même chaque jour, chiffrée.",
  "Only to {server}":
    "Seulement vers {server}",
  "Made while Erevos is open, and as it goes to the background, once the last one is older than that. A folder on {device} as well keeps one more copy close at hand.":
    "Créée pendant qu’Erevos est ouvert, et quand il passe en arrière-plan, dès que la dernière est plus ancienne que ça. Un dossier sur {device} en plus garde une copie de plus à portée de main.",
  "Automatic backups stop too, as they have no folder on {device}. Those already on the server stay there until you delete them.":
    "Les sauvegardes automatiques s’arrêtent aussi, car elles n’ont pas de dossier sur {device}. Celles déjà sur le serveur y restent jusqu’à ce que tu les supprimes.",
  // Google Drive (lib/google-drive.ts).
  "Not sent to Google Drive. {error}": "Non envoyé à Google Drive. {error}",
  "Sent a backup to Google Drive.": "Sauvegarde envoyée à Google Drive.",
  "Automatic backups will go only to the folder and Google Drive from now on. Those already on the server stay there until you delete them.":
    "Les sauvegardes automatiques iront désormais seulement dans le dossier et vers Google Drive. Celles déjà sur le serveur y restent jusqu’à ce que tu les supprimes.",
  "Automatic backups will go only to Google Drive from now on. Those already on the server stay there until you delete them.":
    "Les sauvegardes automatiques iront désormais seulement vers Google Drive. Celles déjà sur le serveur y restent jusqu’à ce que tu les supprimes.",
  "Automatic backups stop too, as they have no folder on {device}. Those already in your Google Drive stay there until you delete them.":
    "Les sauvegardes automatiques s’arrêtent aussi, car elles n’ont pas de dossier sur {device}. Celles déjà dans ton Google Drive y restent jusqu’à ce que tu les supprimes.",
  "Google takes back Erevos's access to your Google Drive, and Erevos forgets the sign-in here. The backups already there stay until you delete them.":
    "Google reprend à Erevos l’accès à ton Google Drive, et Erevos oublie ici la connexion. Les sauvegardes déjà là-bas y restent jusqu’à ce que tu les supprimes.",
  "Stop sending to Google Drive": "Ne plus envoyer vers Google Drive",
  "Backups no longer go to Google Drive.": "Les sauvegardes ne vont plus vers Google Drive.",
  "Backups no longer go to Google Drive, but Google could not be reached to take back Erevos's access: you can take it back in your Google account's security settings.":
    "Les sauvegardes ne vont plus vers Google Drive, mais Google n’a pas pu être joint pour reprendre à Erevos son accès : tu peux le lui reprendre toi-même dans les paramètres de sécurité de ton compte Google.",
  "There is no Erevos backup in that Google Drive.": "Il n’y a aucune sauvegarde Erevos dans ce Google Drive.",
  "Only to {server} and Google Drive": "Seulement vers {server} et Google Drive",
  "Only to Google Drive": "Seulement vers Google Drive",
  "To Google Drive too": "Aussi vers Google Drive",
  "To Google Drive": "Vers Google Drive",
  "Each automatic backup goes there too, into the folder named Erevos, which keeps the {n} newest.":
    "Chaque sauvegarde automatique y va aussi, dans le dossier nommé Erevos, qui garde les {n} plus récentes.",
  "Automatic backups are off, so none goes there. Turn them on to send one every day.":
    "Les sauvegardes automatiques sont désactivées, donc aucune n’y va. Active-les pour en envoyer une chaque jour.",
  "Turn on automatic backups": "Activer les sauvegardes automatiques",
  "Sign in with Google again": "Se reconnecter avec Google",
  "Each automatic backup can also go to your Google Drive, into a folder named Erevos that Erevos makes there. Google gets random bytes under a random name and cannot open them, but it knows your account, when one comes and how big it is. Nothing goes until you sign in with Google.":
    "Chaque sauvegarde automatique peut aussi aller dans ton Google Drive, dans un dossier nommé Erevos qu’Erevos y crée. Google reçoit des octets aléatoires sous un nom aléatoire et ne peut pas les ouvrir, mais il connaît ton compte, sait quand une arrive et quelle est sa taille. Rien ne part tant que tu ne te connectes pas avec Google.",
  "Sign in with Google": "Se connecter avec Google",
  "Google Drive is checked as a server is.": "Google Drive est vérifié comme un serveur.",
  "Restore from Google Drive": "Restaurer depuis Google Drive",
  "Backups in Google Drive, newest first. Choose one, then type its password.":
    "Sauvegardes dans Google Drive, les plus récentes d’abord. Choisis-en une, puis tape son mot de passe.",
  "Google Drive is not in this build of Erevos.": "Google Drive n’est pas dans cette version d’Erevos.",
  "Google no longer lets Erevos into your Google Drive. Sign in with Google again.":
    "Google ne laisse plus Erevos entrer dans ton Google Drive. Reconnecte-toi avec Google.",
  "Google Drive answered {status}.": "Google Drive a répondu {status}.",
  "Your Google Drive has no room left for it.": "Ton Google Drive n’a plus de place pour elle.",
  "That file is not in your Google Drive any more.": "Ce fichier n’est plus dans ton Google Drive.",
  "This sign-in is not one Erevos started here, or it is more than {minutes} minutes old. Start it again.":
    "Cette connexion n’a pas été lancée ici par Erevos, ou elle date de plus de {minutes} minutes. Recommence.",
  "You did not allow it at Google, so nothing changed.": "Tu ne l’as pas autorisé chez Google, donc rien n’a changé.",
  "Google did not take the sign-in: {error}. Start it again.": "Google n’a pas accepté la connexion : {error}. Recommence.",
  "Erevos was not allowed to keep files in your Google Drive. Sign in again and allow it.":
    "Erevos n’a pas eu le droit de garder des fichiers dans ton Google Drive. Reconnecte-toi et autorise-le.",
  "Automatic backups went only to Google Drive, and the Erevos from F-Droid sends none there, so none goes anywhere now. Choose a folder on {device}, or add a server, and they go on there.":
    "Les sauvegardes automatiques allaient seulement vers Google Drive, et l’Erevos de F-Droid n’en envoie aucune là-bas : aucune ne va donc nulle part maintenant. Choisis un dossier sur {device}, ou ajoute un serveur, et elles continuent là.",
  "No longer sent to Google Drive":
    "Plus envoyées vers Google Drive",
  "The Erevos from F-Droid keeps to services anyone may run, so it sends no backups to Google Drive. Those already there stay until you delete them. Stop sending also takes back, at Google, Erevos's access to your Google Drive.":
    "L’Erevos de F-Droid s’en tient aux services que chacun peut faire tourner, il n’envoie donc aucune sauvegarde vers Google Drive. Celles déjà là-bas y restent jusqu’à ce que tu les supprimes. « Ne plus envoyer » reprend aussi, chez Google, l’accès d’Erevos à ton Google Drive.",
};
