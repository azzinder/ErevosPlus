// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of settings that stand apart: Tor bridges, unlocking with a fingerprint, colors, languages (i18n/fr/index.ts).
export const more: Record<string, string> = {
  // Tor bridges (the Tor screen).
  Bridges: 'Ponts',
  'Automatic': 'Automatique',
  'straight': 'en direct',
  'your own bridges': 'tes propres ponts',
  'Tor is off for this space: messages go straight to the server.': 'Tor est désactivé pour cet espace : les messages vont directement au serveur.',
  'Tor is connected, {how}.': 'Tor est connecté, {how}.',
  'Tor is connected.': 'Tor est connecté.',
  'Tor cannot connect from this network. Try Automatic, or bridges of your own.': 'Tor ne peut pas se connecter depuis ce réseau. Essaie Automatique, ou tes propres ponts.',
  'Erevos tries the ways in turn until Tor connects: straight, then the obfs4 bridges, then Snowflake, then your own bridges, if you have any. It remembers the one that worked on Wi-Fi and on mobile data for 30 days, and tries it first.': 'Erevos essaie les moyens tour à tour jusqu’à ce que Tor se connecte : en direct, puis les ponts obfs4, puis Snowflake, puis tes propres ponts, si tu en as. Il retient pendant 30 jours celui qui a marché en Wi-Fi et en données mobiles, et l’essaie en premier.',
  'My network is watched': 'Mon réseau est surveillé',
  'On, Tor never goes straight: whoever watches the network sees only a bridge, never that Tor is used.': 'Activé, Tor ne va jamais en direct : qui surveille le réseau ne voit qu’un pont, jamais que Tor est utilisé.',
  'Trying: {how}…': 'Essai : {how}…',
  'Connected: {how}.': 'Connecté : {how}.',
  'No way worked from this network. Add bridges of your own, from bridges.torproject.org.': 'Aucun moyen n’a marché depuis ce réseau. Ajoute tes propres ponts, depuis bridges.torproject.org.',
  'Check my connection': 'Vérifier ma connexion',
  'No bridges': 'Aucun pont',
  'My own': 'Les miens',
  'None of these is a bridge Erevos can use, so Tor stays off and messages wait.':
    'Aucune de ces lignes n’est un pont utilisable par Erevos : Tor reste donc désactivé et les messages attendent.',
  'None of these is a bridge Erevos can use, so Tor stays off and messages go straight.':
    'Aucune de ces lignes n’est un pont utilisable par Erevos : Tor reste donc désactivé et les messages vont directement.',
  'Tor goes straight to its relays. Where Tor is blocked, choose bridges: Tor then reaches its network only through them.':
    'Tor va directement à ses relais. Là où Tor est bloqué, choisis des ponts : Tor ne joint alors son réseau qu’à travers eux.',
  'The obfs4 bridges Tor Browser comes with: to whoever watches the network, Tor looks like random bytes. Where a censor blocks these too, choose Snowflake or bridges of your own.':
    'Les ponts obfs4 fournis avec Tor Browser : pour qui surveille le réseau, Tor ressemble à des octets aléatoires. Là où un censeur les bloque aussi, choisis Snowflake ou tes propres ponts.',
  "Snowflake goes through volunteers' browsers, over WebRTC, the way a video call does. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block.":
    'Snowflake passe par les navigateurs de bénévoles, via WebRTC, comme un appel vidéo. Pour en trouver un, Erevos interroge le broker de Snowflake à travers un CDN, derrière le nom d’un autre site, et des serveurs STUN indiquent au téléphone sa propre adresse : ils voient cette adresse, jamais tes messages. Plus lent, et difficile à bloquer.',
  'Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, one per line. obfs4, Snowflake, WebTunnel, meek and plain bridges work.':
    'Des lignes de pont de bridges.torproject.org, de bridges@torproject.org par e-mail, ou de @GetBridgesBot sur Telegram, une par ligne. Les ponts obfs4, Snowflake, WebTunnel, meek et les ponts simples fonctionnent.',
  'Bridge lines': 'Lignes de pont',
  'Not a bridge line Erevos can use: {line}': 'Pas une ligne de pont utilisable par Erevos : {line}',
  '{n} bridge': '{n} pont',
  '{n} bridges': '{n} ponts',
  'Use these bridges': 'Utiliser ces ponts',
  'Not in use until you tap Use these bridges.': 'Pas utilisés tant que tu n’appuies pas sur « Utiliser ces ponts ».',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages wait. Bridges count only while Tor is on.':
    'Avec des ponts, Tor ne va jamais directement à ses relais : quand aucun pont ne répond, les messages attendent. Les ponts ne comptent que tant que Tor est activé.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages go to the server without Tor until one does.':
    'Avec des ponts, Tor ne va jamais directement à ses relais : quand aucun pont ne répond, les messages vont au serveur sans Tor jusqu’à ce qu’un pont réponde.',

  // Updates on Windows, and on every computer: the file to take.
  'The download page opens: take {file}, see User guide → Updates.': 'La page de téléchargement s’ouvre : prends {file}, voir « Guide d’utilisation → Mises à jour ».',

  // Material You: the phone's own colors (Appearance).
  "Material You takes no glass: its colors are the phone's own.": 'Material You ne prend pas de verre : ses couleurs sont celles du téléphone.',
  "Your phone's own colors, which Android makes from its wallpaper: a new wallpaper changes them here too.":
    'Les couleurs de ton téléphone, qu’Android tire de son fond d’écran : un nouveau fond d’écran les change ici aussi.',
  "Material You takes the phone's own colors, on Android 12 and later. Here it shows in Classic's.":
    'Material You prend les couleurs du téléphone, sur Android 12 et plus récent. Ici, il s’affiche avec celles de Classic.',

  // Unlocking with a fingerprint or face (Lock, and the password screen).
  'Fingerprint or face': 'Empreinte digitale ou visage',
  'On: Erevos opens with your fingerprint or face too. The password always works.':
    'Activé : Erevos s’ouvre aussi avec ton empreinte digitale ou ton visage. Le mot de passe fonctionne toujours.',
  'Open Erevos with your fingerprint or face instead of typing the password. The password always works too.':
    'Ouvre Erevos avec ton empreinte digitale ou ton visage au lieu de saisir le mot de passe. Le mot de passe fonctionne toujours aussi.',
  'It opens only what your first password opens, never the space of a second password or hidden chats. Someone who holds you can press your finger to the phone: if that may happen, keep it off.':
    'Il n’ouvre que ce qu’ouvre ton premier mot de passe, jamais l’espace d’un second mot de passe ni les discussions masquées. Quelqu’un qui te retient peut appuyer ton doigt sur le téléphone : si cela peut arriver, laisse-le désactivé.',
  'Fingerprint or face for Erevos': 'Empreinte digitale ou visage pour Erevos',
  'Erevos opens with your fingerprint or face too.': 'Erevos s’ouvre maintenant aussi avec ton empreinte digitale ou ton visage.',
  'Unlock Erevos': 'Déverrouiller Erevos',
  'Use password': 'Utiliser le mot de passe',
  'Unlocking with a fingerprint or face stopped working, so it is off now. Type your password, and turn it on again in Lock.':
    'Le déverrouillage par empreinte digitale ou visage ne fonctionne plus, il est donc désactivé. Saisis ton mot de passe, et réactive-le dans « Verrou ».',
};
