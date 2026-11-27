// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of linked devices: the account on the phone and on a computer (lib/devices.ts, app/devices.tsx; i18n/fr/index.ts).
export const devices: Record<string, string> = {
  // Linking and the links (lib/devices.ts).
  Computer: 'Ordinateur',
  'Linked devices could not open.': 'Impossible d’ouvrir les appareils associés.',
  'That device is linked already.': 'Cet appareil est déjà associé.',
  'That is not a code from Linked devices.': 'Ce n’est pas un code de l’écran « Appareils associés ».',
  'The code changed. Compare it again.': 'Le code a changé. Compare-le de nouveau.',
  'This device is no longer linked to a phone.': 'Cet appareil n’est plus associé à un téléphone.',
  'This is a linked device. Link from the phone that holds the account.': 'Ceci est un appareil associé. Associe depuis le téléphone qui détient le compte.',
  'This space has chats of its own. Link from a space with none, such as one that opens with a new password.':
    'Cet espace a ses propres discussions. Associe depuis un espace qui n’en a aucune, comme un espace qui s’ouvre avec un nouveau mot de passe.',
  'This space is linked already.': 'Cet espace est déjà associé.',
  'These hidden chats are linked already.': 'Ces discussions masquées sont déjà associées.',
  'These hidden chats have chats of their own. Link from hidden chats with none, such as those a new PIN sets.':
    'Ces discussions masquées ont leurs propres discussions. Associe depuis des discussions masquées qui n’en ont aucune, comme celles qu’ouvre un nouveau PIN.',
  'Too long to go through the phone.': 'Trop long pour passer par le téléphone.',
  'Type the server address in Server first: linked devices reach this phone through it.':
    'Saisis d’abord l’adresse du serveur dans « Serveur » : les appareils associés joignent ce téléphone par lui.',
  '{n} devices are linked already, the most there can be.': '{n} appareils sont déjà associés, le maximum possible.',

  // The menu, and the chat on a linked device (app/index.tsx, app/chat.tsx).
  'Linked devices': 'Appareils associés',
  'Not sent by the phone': 'Pas envoyé par le téléphone',
  'These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.':
    'Ces discussions viennent de la sauvegarde d’un appareil associé : tu peux les lire ici, mais pas y écrire. Pour écrire, associe de nouveau cet appareil au téléphone, dans Appareils associés.',
  'This account on a computer or in a browser too': 'Ce compte aussi sur un ordinateur ou dans un navigateur',
  "This chat is the phone's: move it into hidden chats there.": 'Cette discussion appartient au téléphone : déplace-la dans les discussions masquées depuis celui-ci.',
  'These hidden chats are linked to a phone: move the chat into them there.':
    'Ces discussions masquées sont associées à un téléphone : déplace-y la discussion depuis celui-ci.',
  "This chat is the phone's: move it out of the hidden chats there.":
    'Cette discussion appartient au téléphone : sors-la des discussions masquées depuis celui-ci.',

  // A call answered on another device of the account (components/call-screen.tsx, lib/call-lines.ts).
  'Answered on another device': 'Répondu sur un autre appareil',
  'answered on another device': 'répondu sur un autre appareil',

  // Linked devices (app/devices.tsx).
  'All of it': 'Tout',
  'The last month': 'Le dernier mois',
  'The last week': 'La dernière semaine',
  None: 'Aucun',
  'Web browser': 'Navigateur web',
  'Code copied. Paste it on the phone in Settings → Data and devices → Linked devices.': 'Code copié. Colle-le sur le téléphone dans « Réglages → Données et appareils → Appareils associés ».',
  'Code copied. Paste it on the phone, in Linked devices of the same hidden chats.':
    'Code copié. Colle-le sur le téléphone, dans « Appareils associés » des mêmes discussions masquées.',
  'Linked. The chats come from the phone, and with them the messages it chose to bring over.':
    'Associé. Les discussions arrivent depuis le téléphone, avec les messages qu’il a choisi de transférer.',
  'Not linked. Someone else may have read the code. Make a new one, and link again.':
    'Non associé. Quelqu’un d’autre a peut-être lu le code. Crées-en un nouveau, et recommence l’association.',
  'Now the computer shows a code too. If it is {code}, tap They match there.': 'Maintenant, l’ordinateur affiche lui aussi un code. Si c’est {code}, appuie là-bas sur « Ils correspondent ».',
  'Unlink this device': 'Dissocier cet appareil',
  'Unlink {name}': 'Dissocier {name}',
  "The account's chats leave this device, messages and all, and so do the accounts it brought over from the phone. The phone keeps them.":
    'Les discussions du compte quittent cet appareil, avec tous leurs messages, ainsi que les comptes qu’il a reçus du téléphone. Le téléphone les garde.',
  'Nothing more goes to it, and nothing it sends is taken. What it has stays on it, behind its own lock.':
    'Plus rien ne lui est envoyé, et rien de ce qu’il envoie n’est accepté. Ce qu’il a reste sur lui, derrière son propre verrou.',
  'Unlinked.': 'Dissocié.',
  'Unlinked here. The phone was not told: unlink this device there too.': 'Dissocié ici. Le téléphone n’a pas été prévenu : dissocie aussi cet appareil depuis celui-ci.',
  'Unlinked. The device was not told, and gets nothing more.': 'Dissocié. L’appareil n’a pas été prévenu, et ne reçoit plus rien.',
  'The messages go to it now. What it has already is not kept twice.': 'Les messages lui sont envoyés maintenant. Ce qu’il a déjà n’est pas gardé en double.',
  'Messages to bring over': 'Messages à transférer',
  'Photos and files too': 'Les photos et fichiers aussi',
  'Linked to {name}': 'Associé à {name}',
  'Since {when}. Last heard from {last}.': 'Depuis le {when}. Dernier contact le {last}.',
  'This device has the chats and groups of the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server. Calls ring here too. New groups, public groups and group calls stay on the phone for now.':
    'Cet appareil a les discussions et les groupes du téléphone qui détient le compte. Ce que tu écris ici passe par le téléphone, qui doit être allumé et joindre le serveur. Les appels sonnent aussi ici. Les nouveaux groupes, les groupes publics et les appels de groupe restent sur le téléphone pour l’instant.',
  'These hidden chats have the chats and groups of the same hidden chats on the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server, with these hidden chats open or receiving while closed there. Calls ring here too. New groups and group calls stay on the phone for now.':
    'Ces discussions masquées ont les discussions et les groupes des mêmes discussions masquées du téléphone qui détient le compte. Ce que tu écris ici passe par le téléphone, qui doit être allumé et joindre le serveur, avec ces discussions masquées ouvertes là-bas ou qui reçoivent une fois fermées. Les appels sonnent aussi ici. Les nouveaux groupes et les appels de groupe restent sur le téléphone pour l’instant.',
  'Make or join groups on the phone that holds this account.': 'Crée des groupes ou rejoins-en depuis le téléphone qui détient ce compte.',
  'Group calls ring on the phone that holds this account, for now. Call from there.':
    'Pour l’instant, les appels de groupe sonnent sur le téléphone qui détient ce compte. Appelle depuis celui-ci.',
  'The same account on a computer or in a browser. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Hidden chats and what a second password opens never go with it: each links on its own, from inside it.':
    'Le même compte sur un ordinateur ou dans un navigateur. Le compte reste celui du téléphone : il transmet, chiffré de bout en bout, ce qui arrive et ce que l’ordinateur écrit, donc tes contacts ne voient rien de nouveau. Les discussions masquées et ce qu’ouvre un second mot de passe ne sont jamais transmis avec lui : chacun s’associe à part, depuis l’intérieur.',
  'These hidden chats on a computer or in a browser, linked on their own. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Nothing of it shows in the space, nor goes to its linked devices.':
    'Ces discussions masquées sur un ordinateur ou dans un navigateur, associées à part. Le compte reste celui du téléphone : il transmet, chiffré de bout en bout, ce qui arrive et ce que l’ordinateur écrit, donc tes contacts ne voient rien de nouveau. Rien de cela ne se voit dans l’espace, ni ne va à ses appareils associés.',
  'Link {name}': 'Associer {name}',
  'Once you tap Link, the computer shows this code. Link only if it shows the same:': 'Dès que tu appuies sur « Associer », l’ordinateur affiche ce code. N’associe que s’il affiche le même :',
  Link: 'Associer',
  Devices: 'Appareils',
  'Linked {when}. Last heard from {last}.': 'Associé le {when}. Dernier contact le {last}.',
  'Linked {when}.': 'Associé le {when}.',
  'Waiting for They match to be tapped on it.': 'Attend qu’on y appuie sur « Ils correspondent ».',
  'Bringing over messages: {n} so far.': 'Transfert des messages : {n} pour l’instant.',
  'Bring over': 'Transférer',
  'Bring over messages again': 'Transférer de nouveau les messages',
  'Signed in as {name}: this device has a token of its own there. Now tap Link to my phone.':
    'Connexion faite en tant que {name} : cet appareil y a un jeton propre. Touche maintenant « Associer à mon téléphone ».',
  'Link a computer to this phone': 'Associer un ordinateur à ce téléphone',
  "On the computer, open Settings → Data and devices → Linked devices → Link to my phone. Then scan its code with this phone's camera, or copy it there and paste it here.":
    'Sur l’ordinateur, ouvre « Réglages → Données et appareils → Appareils associés → Associer à mon téléphone ». Scanne ensuite son code avec l’appareil photo de ce téléphone, ou copie-le là-bas et colle-le ici.',
  "On the computer, open the same hidden chats with their PIN, then Linked devices → Link to my phone in them. Then scan its code with this phone's camera while these hidden chats are open, or copy it there and paste it here.":
    'Sur l’ordinateur, ouvre les mêmes discussions masquées avec leur PIN, puis, dans celles-ci, « Appareils associés → Associer à mon téléphone ». Ensuite scanne son code avec l’appareil photo de ce téléphone pendant que ces discussions masquées sont ouvertes, ou copie-le là-bas et colle-le ici.',
  'Code from the computer': 'Code de l’ordinateur',
  Next: 'Suivant',
  'Link to my phone': 'Associer à mon téléphone',
  'The phone read the code. Does it show this one too?': 'Le téléphone a lu le code. Affiche-t-il aussi celui-ci ?',
  'They match': 'Ils correspondent',
  'They differ': 'Ils sont différents',
  'On the phone that holds the account, scan this code with the camera, or paste it in Settings → Data and devices → Linked devices. This space must have no chats of its own.':
    'Sur le téléphone qui détient le compte, scanne ce code avec l’appareil photo, ou colle-le dans « Réglages → Données et appareils → Appareils associés ». Cet espace ne doit avoir aucune discussion à lui.',
  'On the phone that holds the account, open the same hidden chats with their PIN, then scan this code with the camera, or paste it in Linked devices in them. These hidden chats must have no chats of their own.':
    'Sur le téléphone qui détient le compte, ouvre les mêmes discussions masquées avec leur PIN, puis scanne ce code avec l’appareil photo, ou colle-le dans leurs « Appareils associés ». Ces discussions masquées ne doivent pas avoir de discussions à elles.',
  'Copy the code': 'Copier le code',
  'Share the code': 'Partager le code',
  'Waiting for the phone. The code works for half an hour.': 'En attente du téléphone. Le code est valable une demi-heure.',
  'Use this when this device is the computer: its chats become those of the phone that holds the account.':
    'À utiliser quand cet appareil est l’ordinateur : ses discussions deviennent celles du téléphone qui détient le compte.',
  'Use this when this device is the computer: these hidden chats become those of the same hidden chats on the phone that holds the account.':
    'Utilise ceci quand cet appareil est l’ordinateur : ces discussions masquées deviennent les mêmes discussions masquées du téléphone qui détient le compte.',
  'These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.':
    'Ces discussions masquées n’ont pas encore de file d’attente sur le serveur : dans celles-ci, tape l’adresse du serveur sous « Pour les utilisateurs avancés », puis crée leur file d’attente.',
  'The phone answers on a queue of this device on a server: the one the phone uses, or any other. If the server asks for a token, sign in when it offers that, or type one.':
    'Le téléphone répond sur une file d’attente de cet appareil sur un serveur : celui qu’utilise le téléphone, ou un autre. Si le serveur demande un jeton, connecte-toi quand il le propose, ou tape-en un.',
  'Name of this device': 'Nom de cet appareil',
  'Tap Link to my phone, and a QR code for the phone shows here.':
    'Touche « Associer à mon téléphone », et un code QR pour le téléphone s’affiche ici.',
  'Send the accounts to {name}': 'Envoyer les comptes à {name}',
  "This space's Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Les comptes Matrix, XMPP et Nostr de cet espace lui sont envoyés, chiffrés de bout en bout, et il se connecte à chacun comme un nouvel appareil. Une fois dissocié, il s’en déconnecte.',
  "These hidden chats' own Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, into the same hidden chats there, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Les propres comptes Matrix, XMPP et Nostr de ces discussions masquées lui sont transmis, chiffrés de bout en bout, dans les mêmes discussions masquées là-bas, et il se connecte à chacun comme nouvel appareil. Une fois dissocié, il s’en déconnecte.',
  'Sent to {name}: {accounts}.': 'Envoyé à {name} : {accounts}.',
  'Nothing went: this space has no Matrix, XMPP or Nostr account, or too much waits for that device already.':
    'Rien n’est parti : cet espace n’a aucun compte Matrix, XMPP ou Nostr, ou trop de choses attendent déjà pour cet appareil.',
  'Nothing went: these hidden chats have no Matrix, XMPP or Nostr account of their own, or too much waits for that device already.':
    'Rien n’est parti : ces discussions masquées n’ont pas de compte Matrix, XMPP ou Nostr à elles, ou trop de choses attendent déjà pour cet appareil.',
  'Accounts from the phone': 'Comptes du téléphone',
  'Matrix: {id}, signed in here as a new device.': 'Matrix : {id}, connecté ici comme un nouvel appareil.',
  'Matrix: sign in to {id} here once, with its password. Its keys come from the phone, so no Security Key or check by emoji is needed.':
    'Matrix : connecte-toi ici une fois à {id}, avec son mot de passe. Ses clés viennent du téléphone, donc ni clé de sécurité ni vérification par emoji ne sont nécessaires.',
  'Sign in to Matrix': 'Se connecter à Matrix',
  'XMPP: {id}, signed in here as a new device.': 'XMPP : {id}, connecté ici comme un nouvel appareil.',
  'Nostr: the key of the Nostr chats is here too.': 'Nostr : la clé des discussions Nostr est aussi ici.',
  'Not brought over yet: {accounts}. Tried again each time this space opens.':
    'Pas encore transféré : {accounts}. Nouvel essai à chaque ouverture de cet espace.',
  'Not brought over yet: {accounts}. Tried again each time these hidden chats open.':
    'Pas encore transféré : {accounts}. Nouvel essai à chaque ouverture de ces discussions masquées.',
  'Once this device is unlinked, it signs out of the accounts it brought over.':
    'Une fois cet appareil dissocié, il se déconnecte des comptes qu’il a reçus du téléphone.',
  'Send the accounts': 'Envoyer les comptes',
  'Same settings on every device': 'Mêmes réglages sur tous les appareils',
  'The language, the look and Last seen change on the other devices too. A photo behind the screens, passwords, PINs and what is about this device alone stay as they are on each.':
    "La langue, l'apparence et Vu pour la dernière fois changent aussi sur les autres appareils. Une photo derrière les écrans, les mots de passe, les codes PIN et ce qui ne concerne que cet appareil restent tels quels sur chacun.",
  "The groups come back to this phone once the device that holds them hears it.": "Les groupes reviennent sur ce téléphone dès que l’appareil qui les a l’apprend.",
  "The groups go to {name} once it hears it.": "Les groupes vont sur {name} dès qu’il l’apprend.",
  "Groups stay on": "Les groupes restent sur",
  "Moving: both devices have to be on.": "Déplacement en cours : les deux appareils doivent être allumés.",
  "The keys of the groups are on one device at a time, never copied. There, groups work with the phone off; the other devices write in them through it, so it has to be on. Moving them needs both on, and the server. Public groups stay on the phone.": "Les clés des groupes sont sur un seul appareil à la fois, jamais copiées. Là, les groupes fonctionnent téléphone éteint ; les autres appareils y écrivent par lui, il doit donc être allumé. Pour les déplacer, il faut les deux allumés, et le serveur. Les groupes publics restent sur le téléphone.",
  "The groups are held here": "Les groupes sont ici",
  "Groups work on this device with the phone off, and you can make new ones here. The phone and the other devices write in them through this one, so it has to be on.": "Les groupes fonctionnent sur cet appareil téléphone éteint, et tu peux en créer de nouveaux ici. Le téléphone et les autres appareils y écrivent par celui-ci, il doit donc être allumé.",
  "The groups are held on this device. On the phone, move them back to it first, under Groups stay on.": "Les groupes sont sur cet appareil. Sur le téléphone, ramène-les d’abord sur lui, sous Les groupes restent sur.",
  "The groups are held on {name}. Move them back to this phone first, under Groups stay on.": "Les groupes sont sur {name}. Ramène-les d’abord sur ce téléphone, sous Les groupes restent sur.",
  "That device is no longer linked.": "Cet appareil n’est plus associé.",
  "The groups go to the other device through the server. Type its address in Server first.": "Les groupes vont sur l’autre appareil par le serveur. Saisis d’abord son adresse dans Serveur.",
  "Unlink all the same?": "Dissocier quand même ?",
  "Unlinked now, the groups go from this device, and the phone shows each as left.": "Une fois dissocié, les groupes quittent cet appareil, et le téléphone affiche chacun comme quitté.",
  "Unlinked now, this phone shows each of the groups as left, unless they are still on their way to it: those stay here. Do it if the device is lost.": "Une fois dissocié, ce téléphone affiche chaque groupe comme quitté, sauf ceux encore en route vers lui : ceux-là restent ici. Fais-le si l’appareil est perdu.",
  "A device whose Erevos is older cannot hold them: update it there first.": "Un appareil avec un Erevos plus ancien ne peut pas les garder : mets-le d’abord à jour.",
  "{name} has an older Erevos: update it there first.": "{name} a un Erevos plus ancien : mets-le d’abord à jour.",
  "The other device could not take the groups: they stay here.": "L’autre appareil n’a pas pu prendre les groupes : ils restent ici.",

  // Linking with the short code (components/quick-link.tsx, lib/link-nostr.ts).
  'Inside hidden chats, link with the code Link to my phone shows inside the same hidden chats on the computer.':
    'Dans les discussions masquées, associe avec le code que « Associer à mon téléphone » affiche dans les mêmes discussions masquées sur l’ordinateur.',
  '{why} Link this way instead: sign in to the server below, then tap Link to my phone.':
    '{why} Associe autrement : connecte-toi au serveur ci-dessous, puis touche « Associer à mon téléphone ».',
  'Link another way':
    'Associer autrement',
  'The phone that answered is not the one that read the code. Make a new code, and link again.':
    'Le téléphone qui a répondu n’est pas celui qui a lu le code. Fais un nouveau code et associe à nouveau.',
  'The phone answered, but this computer could not use its server: {error}':
    'Le téléphone a répondu, mais cet ordinateur n’a pas pu utiliser son serveur : {error}',
  'The phone answered. Setting up this computer…':
    'Le téléphone a répondu. Configuration de cet ordinateur…',
  'Linking with the phone…':
    'Association avec le téléphone…',
  'Keep both open for a moment. Nothing has to be typed or compared.':
    'Garde les deux ouverts un instant. Il n’y a rien à saisir ni à comparer.',
  'Scan this with the phone that holds the account, then tap Link on the phone. Nothing else.':
    'Scanne ceci avec le téléphone qui a le compte, puis touche « Associer » sur le téléphone. Rien d’autre.',
  'Making the code…':
    'Création du code…',
  'The phone sends this computer what it needs through Nostr, end-to-end encrypted. The code works for half an hour.':
    'Le téléphone envoie à cet ordinateur ce dont il a besoin via Nostr, chiffré de bout en bout. Le code fonctionne une demi-heure.',
  'The computer did not answer. On it, tap Link another way and sign in to the server there, then scan its code again.':
    'L’ordinateur n’a pas répondu. Sur lui, touche « Associer autrement », connecte-toi au serveur là-bas, puis scanne à nouveau son code.',
  'Linked to {name}. The chats go to it now.':
    'Associé à {name}. Les discussions vont maintenant vers lui.',
  'Link {name} to this phone?':
    'Associer {name} à ce téléphone ?',
  'Link only a computer of yours, whose code you scanned just now. It gets the chats of this space and the messages chosen below.':
    'N’associe qu’un ordinateur à toi, dont tu viens de scanner le code. Il reçoit les discussions de cet espace et les messages choisis ci-dessous.',
  'Waiting for the computer…':
    'En attente de l’ordinateur…',
  'No Nostr server could be reached.':
    'Aucun serveur Nostr n’a pu être joint.',
  'The Nostr server did not take it.':
    'Le serveur Nostr ne l’a pas accepté.',
  'No Nostr server took it.':
    'Aucun serveur Nostr ne l’a accepté.',
  'Asked. On {name}, tap Link again: it links to this phone and keeps its chats.':
    'Demandé. Sur {name}, appuie sur « Associer de nouveau » : il s’associe à ce téléphone et garde ses discussions.',
  'Let go of {name}':
    'Oublier {name}',
  'It is asked nothing from this phone. To link it later, link it as the first time.':
    'Ce téléphone ne lui demande plus rien. Pour l’associer plus tard, associe-le comme la première fois.',
  'Let go':
    'Oublier',
  'Said yes. Once the phone hears it, this device is linked to it again.':
    'Accepté. Dès que le téléphone l’apprend, cet appareil lui est de nouveau associé.',
  '{name} asks to link again':
    '{name} demande une nouvelle association',
  'A backup of the phone was put back on {name}, which asked {when}. If you did that, link this device to it: it keeps its chats and gets what came since, and the phone before gets nothing more from it. If not, tap Not now: it stays linked as it is.':
    'Une sauvegarde du téléphone a été restaurée sur {name}, qui l’a demandé le {when}. Si c’est toi, associe cet appareil à celui-ci : il garde ses discussions et reçoit ce qui est arrivé depuis, et le téléphone d’avant ne reçoit plus rien de lui. Sinon, appuie sur « Pas maintenant » : il reste associé comme il l’est.',
  'Waiting for {name}: it has to be on.':
    'En attente de {name} : il doit être allumé.',
  'Link again':
    'Associer de nouveau',
  'From the backup':
    'De la sauvegarde',
  'These devices were linked to the phone this backup was made on. Ask only those that are still yours: each shows the ask, and links to this phone once Link again is tapped on it. It keeps its chats, and gets what came since.':
    'Ces appareils étaient associés au téléphone sur lequel cette sauvegarde a été faite. Ne demande qu’à ceux qui sont encore à toi : chacun affiche la demande et s’associe à ce téléphone dès qu’on y appuie sur « Associer de nouveau ». Il garde ses discussions et reçoit ce qui est arrivé depuis.',
  'It said yes. Linking…':
    'Il a accepté. Association…',
  'Asked {when}. Waiting for Link again to be tapped on it.':
    'Demandé le {when}. Attend qu’on y appuie sur « Associer de nouveau ».',
  'Linked there {when}.':
    'Associé là-bas le {when}.',
  'Not asked yet.':
    'Pas encore demandé.',
  'Ask to link again':
    'Demander une nouvelle association',
  'The phone no longer asks this device to link again.':
    'Le téléphone ne demande plus à cet appareil une nouvelle association.',
  '{name} asks this device to link again, as a backup of the phone was put back there. If you did that, tap Link again in Linked devices.':
    '{name} demande une nouvelle association à cet appareil, car une sauvegarde du téléphone y a été restaurée. Si c’est toi, appuie sur « Associer de nouveau » dans Appareils associés.',
  'The phone this backup was made on had linked devices. In Linked devices, ask those that are yours to link again: each keeps its chats.':
    'Le téléphone sur lequel cette sauvegarde a été faite avait des appareils associés. Dans Appareils associés, demande une nouvelle association à ceux qui sont à toi : chacun garde ses discussions.',
};
