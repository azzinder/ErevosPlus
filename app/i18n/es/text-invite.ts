// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of invites by plain SMS: making one on a contact's card, and taking one (app/contact-card.tsx, app/text-invite.tsx, app/chat.tsx, lib/sms-relay.ts) (i18n/es/index.ts).
export const textInvite: Record<string, string> = {
  'An invite lasts only a few days. Ask whoever sent it for a new one.': 'Una invitación dura solo unos días. Pide una nueva a quien la envió.',
  'This Erevos cannot answer an invite by SMS yet: update it, then open the link again.': 'Este Erevos aún no puede responder a una invitación por SMS: actualízalo y vuelve a abrir el enlace.',
  'Joined. {name} is your contact as soon as their phone hears from yours, in a moment if it is on.': 'Te has unido. {name} será tu contacto en cuanto su teléfono sepa del tuyo, enseguida si está encendido.',
  'Joined. Whoever invited you is your contact as soon as their phone hears from yours, in a moment if it is on.': 'Te has unido. Quien te invitó será tu contacto en cuanto su teléfono sepa del tuyo, enseguida si está encendido.',
  'An invite by SMS is taken in the chats of the space, not in hidden chats.': 'Una invitación por SMS se acepta en los chats del espacio, no en los chats ocultos.',
  'Join me on Erevos, for messages and calls only we can read: {link}': 'Únete a mí en Erevos, para mensajes y llamadas que solo podemos leer nosotros: {link}',
  'Invite by SMS': 'Invitar por SMS',
  "An invite by SMS": "Una invitación por SMS",
  "{number} sent you an Erevos invite by SMS. Answer it with your contact link, so they can write to you here? Only if you know this number: the sender of an SMS can be made up.": "{number} te envió una invitación de Erevos por SMS. ¿Responder con tu enlace de contacto, para que pueda escribirte aquí? Solo si conoces este número: el remitente de un SMS puede ser falso.",
  "Answer it": "Responder",
  'No Erevos yet? An SMS with a link: it offers them Erevos, and once they join you are each other’s contacts, end-to-end encrypted. For one person, for two days.': '¿Aún no tiene Erevos? Un SMS con un enlace: le ofrece Erevos, y en cuanto se una seréis contactos el uno del otro, con cifrado de extremo a extremo. Para una persona, durante dos días.',
  'This invite is over': 'Esta invitación ha caducado',
  'Join, and whoever invited you is your contact as soon as their phone hears of it. What you write to each other is end-to-end encrypted. Erevos sets itself up to reach them, typing nothing. Take it only if it came from them.': 'Únete, y quien te invitó será tu contacto en cuanto su teléfono lo sepa. Lo que os escribáis está cifrado de extremo a extremo. Erevos se configura solo para comunicaros, sin que escribas nada. Acéptala solo si de verdad viene de esa persona.',
  'An invite by SMS needs a server: your phone has none yet.': 'Una invitación por SMS necesita un servidor: tu teléfono aún no tiene ninguno.',
  'Your server does not let this phone invite anyone, so an invite by SMS could not let them in. Invite them with a QR code instead, from New chat.': 'Tu servidor no deja que este teléfono invite a nadie, así que una invitación por SMS no podría dejarle entrar. Invítale mejor con un código QR, desde Nuevo chat.',
};
