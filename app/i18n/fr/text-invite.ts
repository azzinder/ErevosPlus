// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of invites by plain SMS: making one on a contact's card, and taking one (app/contact-card.tsx, app/text-invite.tsx, app/chat.tsx, lib/sms-relay.ts) (i18n/fr/index.ts).
export const textInvite: Record<string, string> = {
  'An invite lasts only a few days. Ask whoever sent it for a new one.': 'Une invitation ne dure que quelques jours. Demandes-en une nouvelle à qui l’a envoyée.',
  'This Erevos cannot answer an invite by SMS yet: update it, then open the link again.': 'Cet Erevos ne peut pas encore répondre à une invitation par SMS : mets-le à jour, puis rouvre le lien.',
  'Joined. {name} is your contact as soon as their phone hears from yours, in a moment if it is on.': 'C’est fait. {name} sera ton contact dès que son téléphone aura des nouvelles du tien, dans un instant s’il est allumé.',
  'Joined. Whoever invited you is your contact as soon as their phone hears from yours, in a moment if it is on.': 'C’est fait. La personne qui t’a invité sera ton contact dès que son téléphone aura des nouvelles du tien, dans un instant s’il est allumé.',
  'An invite by SMS is taken in the chats of the space, not in hidden chats.': 'Une invitation par SMS s’accepte dans les discussions de l’espace, pas dans les discussions cachées.',
  'Join me on Erevos, for messages and calls only we can read: {link}': 'Rejoins-moi sur Erevos, pour des messages et des appels que nous seuls pouvons lire : {link}',
  'Invite by SMS': 'Inviter par SMS',
  "An invite by SMS": "Une invitation par SMS",
  "{number} sent you an Erevos invite by SMS. Answer it with your contact link, so they can write to you here? Only if you know this number: the sender of an SMS can be made up.": "{number} vous a envoyé une invitation Erevos par SMS. Y répondre avec votre lien de contact, pour qu’on puisse vous écrire ici ? Seulement si vous connaissez ce numéro : l’expéditeur d’un SMS peut être falsifié.",
  "Answer it": "Répondre",
  'No Erevos yet? An SMS with a link: it offers them Erevos, and once they join you are each other’s contacts, end-to-end encrypted. For one person, for two days.': 'Pas encore d’Erevos ? Un SMS avec un lien : il lui propose Erevos, et dès qu’il ou elle le rejoint, vous êtes contacts l’un de l’autre, chiffré de bout en bout. Pour une personne, pendant deux jours.',
  'This invite is over': 'Cette invitation a expiré',
  'Join, and whoever invited you is your contact as soon as their phone hears of it. What you write to each other is end-to-end encrypted. Erevos sets itself up to reach them, typing nothing. Take it only if it came from them.': 'Rejoins Erevos, et la personne qui t’a invité sera ton contact dès que son téléphone l’apprendra. Ce que vous vous écrivez est chiffré de bout en bout. Erevos se configure tout seul pour vous joindre, sans que tu tapes quoi que ce soit. Accepte-la seulement si elle vient vraiment de cette personne.',
  'An invite by SMS needs a server: your phone has none yet.': 'Une invitation par SMS a besoin d’un serveur : ton téléphone n’en a pas encore.',
  'Your server does not let this phone invite anyone, so an invite by SMS could not let them in. Invite them with a QR code instead, from New chat.': 'Ton serveur ne laisse ce téléphone inviter personne, donc une invitation par SMS ne pourrait pas faire entrer cette personne. Invite-la plutôt avec un code QR, depuis Nouvelle discussion.',
};
