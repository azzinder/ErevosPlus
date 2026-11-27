// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of starting with a server of one's own, or none, and of a web folder of one's own for the models (components/own-server.tsx, components/models-server.tsx, app/chat.tsx, app/first-steps.tsx) (i18n/fr/index.ts).
export const ownServerText: Record<string, string> = {
  "That is not a server address. Type it as you were given it, such as relay.example.org.": "Ce n’est pas une adresse de serveur. Écris-la comme on te l’a donnée, par exemple relay.example.org.",
  "You are in, with the server at {server}. Now add your contacts: by their invite, or by the contact link or QR code they give you.": "Tu es entré, avec le serveur {server}. Ajoute maintenant tes contacts : avec leur invitation, ou avec le lien de contact ou le code QR qu’ils te donnent.",
  "Erevos could not connect to {server}: {error}. Check the address and the code, and that the server is running.": "Erevos n’a pas pu se connecter à {server} : {error}. Vérifie l’adresse et le code, et que le serveur fonctionne.",
  "I have no invite": "Je n’ai pas d’invitation",
  "My account is at another server…": "Mon compte est sur un autre serveur…",
  "Start without a server": "Commencer sans serveur",
  "That is not a web address. Type the folder as you were given it, such as cloud.example.org/erevos-models.": "Ce n’est pas une adresse web. Écris le dossier comme on te l’a donné, par exemple cloud.example.org/erevos-models.",
  "Download from another server…": "Télécharger depuis un autre serveur…",
  "Back to the usual server": "Revenir au serveur habituel",
  "Web folder with the models": "Dossier web avec les modèles",
  "A web folder, yours or your group’s, that holds the same files under the same names. Erevos checks every file after the download and refuses one that was changed. That server, not {host}, then sees your IP address.": "Un dossier web, le tien ou celui de ton groupe, qui contient les mêmes fichiers sous les mêmes noms. Erevos vérifie chaque fichier après le téléchargement et refuse celui qui a été modifié. C’est alors ce serveur, et non {host}, qui voit ton adresse IP.",
  "Where your messages wait": "Où tes messages attendent",
  "A server keeps your messages, encrypted, until the other phone takes them. It cannot read them. Choose how to start: you can change it any time, here.": "Un serveur garde tes messages, chiffrés, jusqu’à ce que l’autre téléphone les prenne. Il ne peut pas les lire. Choisis comment commencer : tu peux le changer quand tu veux, ici.",
  "If you have neither an account nor a server, start without a server: it needs nothing, and you can add one later.": "Si tu n’as ni compte ni serveur, commence sans serveur : il ne faut rien, et tu pourras en ajouter un plus tard.",
  "I have a server of my own": "J’ai mon propre serveur",
  "Yours, or one of your family, group or workplace. You type its address and the code you were given.": "Le tien, ou celui de ta famille, de ton groupe ou de ton travail. Tu écris son adresse et le code qu’on t’a donné.",
  "Server address": "Adresse du serveur",
  "Code (if the server has one)": "Code (si le serveur en a un)",
  "Whoever set up the server gives you both; there they are called the server address and the token. Calls, photos and files then go through that server too. To set one up yourself, see Running your own server in the user guide.": "La personne qui a installé le serveur te donne les deux ; là-bas ils s’appellent l’adresse du serveur et le jeton. Les appels, les photos et les fichiers passent alors aussi par ce serveur. Pour en installer un toi-même, vois « Faire tourner ton propre serveur » dans le guide d’utilisation.",
};
