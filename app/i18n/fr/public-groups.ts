// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of public groups, joined by a link, and their moderation (i18n/fr/index.ts).
export const publicGroups: Record<string, string> = {
  // What the group keeps as notes (lib/public-groups.ts, lib/public-rules.ts).
  '{who} was muted.': '{who} est en sourdine.',
  '{who} can write again.': '{who} peut de nouveau écrire.',
  '{who} was banned.': '{who} a été banni du groupe.',
  '{who} is no longer banned.': '{who} n’est plus banni.',
  '{who} was taken out.': '{who} a été retiré du groupe.',
  '{who} is an admin.': '{who} est admin.',
  '{who} is no longer an admin.': '{who} n’est plus admin.',
  '{who} owns the group now.': '{who} est maintenant propriétaire du groupe.',
  'A message was deleted for everyone.': 'Un message a été supprimé pour tout le monde.',
  'An admin took you out of the group.': 'Un admin t’a retiré du groupe.',
  'The group is full: its owner could not let you in.': 'Le groupe est plein : son propriétaire n’a pas pu te faire entrer.',
  'You joined the group.': 'Tu as rejoint le groupe.',
  'Your request to join was turned down.': 'Ta demande pour rejoindre le groupe a été refusée.',

  // What goes wrong (lib/public-groups.ts).
  'Admins moderate members, and only the owner moderates admins.': 'Les admins modèrent les membres, et seul le propriétaire modère les admins.',
  'An admin muted you in this group.': 'Un admin t’a mis en sourdine dans ce groupe.',
  'Choose the name the group sees.': 'Choisis le nom que voit le groupe.',
  'Only the group’s admins do that.': 'Seuls les admins du groupe peuvent faire cela.',
  'Only the group’s owner does that.': 'Seul le propriétaire du groupe peut faire cela.',
  'Share the group’s link to have people join.': 'Partage le lien du groupe pour que des gens le rejoignent.',
  'That member is not in the group any more.': 'Ce membre ne fait plus partie du groupe.',
  'That message cannot be deleted for everyone.': 'Ce message ne peut pas être supprimé pour tout le monde.',
  'This link no longer works. Ask someone in the group for the new one.': 'Ce lien ne fonctionne plus. Demande le nouveau à quelqu’un du groupe.',
  'You are in this group already.': 'Tu fais déjà partie de ce groupe.',

  // The menu, and making or joining one (app/index.tsx, app/public-groups.tsx, app/join.tsx).
  'Public groups': 'Groupes publics',
  'Make a group anyone with its link can join, or join one by a link': 'Crée un groupe que quiconque a son lien peut rejoindre, ou rejoins-en un par un lien',
  'This build of Erevos has no public groups yet. Update it to make or join one.':
    'Cette version d’Erevos n’a pas encore de groupes publics. Mets-la à jour pour en créer ou en rejoindre un.',
  'A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.':
    'Un groupe public est un groupe que quiconque a son lien ou son code QR peut demander à rejoindre, avec un propriétaire et des admins qui le modèrent. Ses messages sont chiffrés de bout en bout comme dans tout groupe, et aucun serveur ne sait qui en fait partie.',
  'Make a public group': 'Créer un groupe public',
  'Whoever sees the link sees it too.': 'Quiconque voit le lien le voit aussi.',
  'Your name in it': 'Ton nom dans ce groupe',
  'Members see this, not your contact name nor who you are in your chats.': 'Les membres voient ce nom, pas ton nom de contact ni qui tu es dans tes discussions.',
  'A name for this group': 'Un nom pour ce groupe',
  'Who comes in': 'Qui peut entrer',
  'Anyone with the link': 'Quiconque a le lien',
  'An admin lets them in': 'Un admin les fait entrer',
  'You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.':
    'Le groupe t’appartient : ton téléphone fait entrer les gens, qui le rejoignent donc dès qu’Erevos y est ouvert. Quiconque a le lien lit ce qui se dit à partir du moment où il rejoint le groupe, jamais ce qui précède.',
  'Make the public group': 'Créer le groupe public',
  'Join by a link': 'Rejoindre par un lien',
  'Open the link': 'Ouvrir le lien',
  'That is not a group’s link. It starts with erevos://join': 'Ce n’est pas un lien de groupe. Il commence par erevos://join',
  'Waiting for an answer': 'En attente de réponse',
  'A group': 'Un groupe',
  'Stop asking': 'Annuler la demande',
  'The group shows in your chats once its owner’s phone lets you in.': 'Le groupe apparaît dans tes discussions dès que le téléphone de son propriétaire te fait entrer.',
  'Join a group': 'Rejoindre un groupe',
  'Join {name}': 'Rejoindre {name}',
  'Not a group’s link': 'Pas un lien de groupe',
  'This link does not hold a group Erevos can ask to join.': 'Ce lien ne contient pas de groupe qu’Erevos peut demander à rejoindre.',
  'Your name in the group': 'Ton nom dans le groupe',
  'Everyone in the group sees it, beside the start of a key made for this group alone.': 'Tout le monde dans le groupe le voit, à côté du début d’une clé créée pour ce groupe seulement.',
  'Its owner’s server': 'Le serveur de son propriétaire',
  'A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.':
    'Un groupe public : quiconque a son lien peut le rejoindre, donc n’importe qui dedans peut être quelqu’un que tu ne connais pas, et peut copier ce qui s’y dit. Les membres voient le nom que tu choisis, et où leurs messages te parviennent (ton serveur et ta file d’attente dessus), pas qui tu es dans tes discussions.',
  'Ask to join': 'Demander à rejoindre',
  'Asked to join': 'Demande envoyée',
  'The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.':
    'Le groupe apparaît dans tes discussions dès que le téléphone de son propriétaire te fait entrer : quand Erevos y est ouvert et, si le groupe le demande, dès qu’un admin a dit oui.',

  // A public group's link and moderation (app/public-group.tsx, components/public-group.tsx).
  'Public group · tap for its link and members': 'Groupe public · appuie pour voir son lien et ses membres',
  'A public group you own. Your phone lets people in when Erevos is open on it.': 'Un groupe public qui t’appartient. Ton téléphone fait entrer les gens quand Erevos y est ouvert.',
  'A public group you are an admin of.': 'Un groupe public dont tu es admin.',
  'A public group. Anyone with its link can ask to join.': 'Un groupe public. Quiconque a son lien peut demander à le rejoindre.',
  'The group’s link': 'Le lien du groupe',
  'Share the link': 'Partager le lien',
  'The group’s link is copied.': 'Le lien du groupe est copié.',
  'Change the link': 'Changer le lien',
  'The link and QR code shared so far stop working. Requests still waiting at the old one are lost.':
    'Le lien et le code QR partagés jusqu’ici ne fonctionnent plus. Les demandes encore en attente sur l’ancien sont perdues.',
  Change: 'Changer',
  'The group has a new link. The old one no longer works.': 'Le groupe a un nouveau lien. L’ancien ne fonctionne plus.',
  'Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.':
    'Quiconque a ce lien peut demander à rejoindre le groupe, et le lire à partir du moment où on le fait entrer : jamais ce qui s’est dit avant. Ne le partage que là où tu le veux vraiment.',
  'The link is made once the owner’s phone has a queue for it on its server.': 'Le lien est créé dès que le téléphone du propriétaire a une file d’attente pour lui sur son serveur.',
  'Asking to join': 'Demandes pour rejoindre',
  'Let in': 'Faire entrer',
  'Turn away': 'Refuser',
  'The owner’s phone lets them in once it hears your answer, when Erevos is open on it.':
    'Le téléphone du propriétaire les fait entrer dès qu’il reçoit ta réponse, quand Erevos y est ouvert.',
  Members: 'Membres',
  '{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.':
    '{n} dans le groupe. Les noms sont choisis, pas prouvés : le début de la clé de chaque membre s’affiche à côté.',
  owner: 'propriétaire',
  admin: 'admin',
  muted: 'en sourdine',
  Moderate: 'Modérer',
  'Let them write': 'Laisser écrire',
  '{name} reads nothing the group says from now on, and can ask to join again by the link.':
    '{name} ne lira plus rien de ce qui se dit dans le groupe, et pourra redemander à le rejoindre par le lien.',
  Ban: 'Bannir',
  '{name} is taken out, and what their phone asks after is turned away.': '{name} sort du groupe, et ce que son téléphone demandera ensuite sera refusé.',
  'Make an admin': 'Nommer admin',
  'No longer an admin': 'Retirer le rôle d’admin',
  'Hand the group over': 'Céder le groupe',
  '{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.':
    '{name} devient propriétaire du groupe : son téléphone fait entrer les gens, et le lien devient un lien sur son serveur. Tu restes admin.',
  'Hand over': 'Céder',
  Banned: 'Bannis',
  'Lift the ban': 'Lever le bannissement',
  'Delete for everyone': 'Supprimer pour tout le monde',
  'Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.':
    'Le téléphone de chaque membre le supprime dès qu’il l’apprend. Qui l’a déjà lu peut en avoir gardé une copie.',
  'It goes from every member’s phone, as from yours.': 'Il disparaît du téléphone de chaque membre, comme du tien.',
  'You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.':
    'Il t’appartient : le fermer en retire tous les membres, et plus personne ne pourra y écrire. Pour qu’il continue sans toi, cède-le d’abord.',
  'The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.':
    'Le téléphone du propriétaire te retirera la prochaine fois qu’Erevos y sera ouvert. Ensuite, tu ne liras plus rien du groupe.',
  "Public groups stay on the phone: make and join them there.": "Les groupes publics restent sur le téléphone : crée-les et rejoins-les depuis là.",
};
