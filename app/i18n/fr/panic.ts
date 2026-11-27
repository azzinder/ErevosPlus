// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of the panic button (app/panic.tsx, lib/panic.ts) (i18n/fr/index.ts).
export const panic: Record<string, string> = {
  "{app} can now wipe Erevos.": "{app} peut maintenant effacer Erevos.",
  "That app changed since it asked. Ask again from it.": "Cette app a changé depuis sa demande. Redemandez depuis elle.",
  "Stop trusting {app}": "Ne plus faire confiance à {app}",
  "{app} will no longer be able to wipe Erevos.": "{app} ne pourra plus effacer Erevos.",
  "The automatic backups in {folder} go too.": "Les sauvegardes automatiques de {folder} sont effacées aussi.",
  "Wipe everything": "Tout effacer",
  "Everything Erevos keeps here goes now, for good: every space and its hidden chats, contacts, messages and keys. Erevos then starts as if just installed. This cannot be undone.":
    "Tout ce qu’Erevos garde ici est effacé maintenant, pour de bon : chaque espace avec ses discussions cachées, contacts, messages et clés. Erevos démarre ensuite comme fraîchement installé. C’est irréversible.",
  "Wipe": "Effacer",
  "In danger, wipe Erevos at once: every space and its hidden chats, with their contacts, messages, photos, files and keys, the lock, the Matrix, XMPP and Nostr accounts, the server tokens, and the settings and password of automatic backups and of their server.":
    "En danger, effacez Erevos d’un coup : chaque espace avec ses discussions cachées, leurs contacts, messages, photos, fichiers et clés, le verrou, les comptes Matrix, XMPP et Nostr, les jetons du serveur, ainsi que les réglages et le mot de passe des sauvegardes automatiques et de leur serveur.",
  "What it cannot reach stays: backups you copied elsewhere or sent to a server (their password still guards them), what the server holds for you until it expires, and what your contacts have.":
    "Ce qu’il ne peut atteindre reste : les sauvegardes copiées ailleurs ou envoyées à un serveur (leur mot de passe les protège toujours), ce que le serveur garde pour vous jusqu’à expiration, et ce qu’ont vos contacts.",
  "Wipe now": "Effacer maintenant",
  "Wipe everything now": "Tout effacer maintenant",
  "Here Erevos cannot wipe itself: delete its data from the computer instead.": "Ici, Erevos ne peut pas s’effacer lui-même : supprimez plutôt ses données depuis l’ordinateur.",
  "From a panic app": "Depuis une app de panique",
  "A panic app, such as Ripple, wipes the apps you choose with one gesture. Install one, choose Erevos in it, then say yes here. Only the app you say yes to can wipe Erevos, and only while this is on.":
    "Une app de panique, comme Ripple, efface les apps que vous choisissez d’un seul geste. Installez-en une, choisissez-y Erevos, puis dites oui ici. Seule l’app à laquelle vous dites oui peut effacer Erevos, et seulement tant que ceci est activé.",
  "{app} asks to be able to wipe Erevos.": "{app} demande à pouvoir effacer Erevos.",
  "Trusted panic app: {app}": "App de panique de confiance : {app}",
  "Trusted panic app: {app}, no longer installed as it was.": "App de panique de confiance : {app}, plus installée comme avant.",
  "No panic app yet.": "Pas encore d’app de panique.",
  "A panic app may wipe Erevos": "Une app de panique peut effacer Erevos",
  "Also the automatic backups in {folder}": "Aussi les sauvegardes automatiques de {folder}",
  "This build of Erevos cannot be wiped by a panic app. Update Erevos for it.": "Cette version d’Erevos ne peut pas être effacée par une app de panique. Mettez Erevos à jour pour cela.",
  "Panic button": "Bouton de panique",
  "Wipe Erevos at once, from here, a panic app or a panic password": "Effacer Erevos d’un coup, d’ici, depuis une app de panique ou avec un mot de passe de panique",
  "Erevos cannot wipe itself here.": "Ici, Erevos ne peut pas s’effacer lui-même.",
  "Trust {app} as it is now": "Faire confiance à {app} tel qu'il est maintenant",
  "{app} is now signed with another key, so Erevos does not let it wipe. Say yes only if you updated it yourself from where you got it; another app under its name could be the one asking.": "{app} est maintenant signé avec une autre clé, donc Erevos ne le laisse pas effacer. Dis oui seulement si tu l'as mis à jour toi-même depuis l'endroit où tu l'as eu ; une autre app sous son nom pourrait être celle qui demande.",
  "Trust it": "Faire confiance",
  "{app} is not installed.": "{app} n'est pas installé.",
  "On {when} {app} asked to wipe Erevos, and Erevos refused: the app is no longer signed as when you trusted it.": "Le {when}, {app} a demandé d'effacer Erevos, et Erevos a refusé : l'app n'est plus signée comme quand tu lui as fait confiance.",
  "On {when} {app} asked to wipe Erevos, and Erevos refused: the switch below was off.": "Le {when}, {app} a demandé d'effacer Erevos, et Erevos a refusé : l'interrupteur ci-dessous était éteint.",
  "Got it": "Compris",
  "{app} is installed but signed with another key, so it cannot wipe Erevos. If you updated it yourself, trust it again as it is now.": "{app} est installé mais signé avec une autre clé, il ne peut donc pas effacer Erevos. Si tu l'as mis à jour toi-même, fais-lui de nouveau confiance tel qu'il est maintenant.",
  '{app} is no longer told when Erevos wipes.': '{app} n’est plus prévenu quand Erevos efface.',
  '{app} is told when Erevos wipes. If it asks, say yes there too.': '{app} est prévenu quand Erevos efface. S’il demande, dis oui là aussi.',
  'Tell other apps': 'Prévenir d’autres applis',
  'As Erevos wipes, from the button, the panic password or a panic app, it can tell the apps you choose here, as a panic app does: Fasouli then locks itself. Each app decides what it does, and asks you first whether Erevos may.': 'Quand Erevos efface, depuis le bouton, le mot de passe de panique ou une appli de panique, il peut prévenir les applis que tu choisis ici, comme le fait une appli de panique : Fasouli se verrouille alors. Chaque appli décide de ce qu’elle fait, et te demande d’abord si Erevos peut.',
  "No app on this phone takes a panic app's request.": 'Aucune appli de ce téléphone n’accepte la demande d’une appli de panique.',
  "Hold down for the panic button": "Maintenir appuyé pour le bouton de panique",
  "Wipe Erevos at once": "Effacer Erevos tout de suite",
};
