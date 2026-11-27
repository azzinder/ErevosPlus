// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of public groups, joined by a link, and their moderation (i18n/es/index.ts).
export const publicGroups: Record<string, string> = {
  // What the group keeps as notes (lib/public-groups.ts, lib/public-rules.ts).
  '{who} was muted.': 'Se ha silenciado a {who}.',
  '{who} can write again.': '{who} puede volver a escribir.',
  '{who} was banned.': 'Se ha vetado a {who}.',
  '{who} is no longer banned.': 'Se ha levantado el veto a {who}.',
  '{who} was taken out.': 'Se ha expulsado a {who}.',
  '{who} is an admin.': '{who} es admin.',
  '{who} is no longer an admin.': '{who} ya no es admin.',
  '{who} owns the group now.': 'Ahora el grupo es de {who}.',
  'A message was deleted for everyone.': 'Se ha eliminado un mensaje para todos.',
  'An admin took you out of the group.': 'Un admin te ha expulsado del grupo.',
  'The group is full: its owner could not let you in.': 'El grupo está lleno: su propietario no ha podido dejarte entrar.',
  'You joined the group.': 'Te has unido al grupo.',
  'Your request to join was turned down.': 'Se ha rechazado tu solicitud para unirte.',

  // What goes wrong (lib/public-groups.ts).
  'Admins moderate members, and only the owner moderates admins.': 'Los admins moderan a los miembros, y solo el propietario modera a los admins.',
  'An admin muted you in this group.': 'Un admin te ha silenciado en este grupo.',
  'Choose the name the group sees.': 'Elige el nombre que ve el grupo.',
  'Only the group’s admins do that.': 'Eso solo lo hacen los admins del grupo.',
  'Only the group’s owner does that.': 'Eso solo lo hace el propietario del grupo.',
  'Share the group’s link to have people join.': 'Comparte el enlace del grupo para que se una gente.',
  'That member is not in the group any more.': 'Ese miembro ya no está en el grupo.',
  'That message cannot be deleted for everyone.': 'Ese mensaje no se puede eliminar para todos.',
  'This link no longer works. Ask someone in the group for the new one.': 'Este enlace ya no funciona. Pide el nuevo a alguien del grupo.',
  'You are in this group already.': 'Ya estás en este grupo.',

  // The menu, and making or joining one (app/index.tsx, app/public-groups.tsx, app/join.tsx).
  'Public groups': 'Grupos públicos',
  'Make a group anyone with its link can join, or join one by a link': 'Crea un grupo al que pueda unirse cualquiera con su enlace, o únete a uno con un enlace',
  'This build of Erevos has no public groups yet. Update it to make or join one.':
    'Esta versión de Erevos aún no tiene grupos públicos. Actualízala para crear uno o unirte a uno.',
  'A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.':
    'Un grupo público es uno al que cualquiera con su enlace o su código QR puede pedir unirse, con un propietario y unos admins que lo moderan. Sus mensajes están cifrados de extremo a extremo como en cualquier grupo, y ningún servidor sabe quién está en él.',
  'Make a public group': 'Crear un grupo público',
  'Whoever sees the link sees it too.': 'También lo ve quien vea el enlace.',
  'Your name in it': 'Tu nombre en él',
  'Members see this, not your contact name nor who you are in your chats.': 'Los miembros ven esto, no tu nombre de contacto ni quién eres en tus chats.',
  'A name for this group': 'Un nombre para este grupo',
  'Who comes in': 'Quién entra',
  'Anyone with the link': 'Cualquiera con el enlace',
  'An admin lets them in': 'Un admin les deja entrar',
  'You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.':
    'El grupo es tuyo: tu teléfono deja entrar a la gente, así que se unen en cuanto Erevos esté abierto en él. Quien tenga el enlace lee lo que se dice desde que se une, nunca lo anterior.',
  'Make the public group': 'Crear el grupo público',
  'Join by a link': 'Unirse con un enlace',
  'Open the link': 'Abrir el enlace',
  'That is not a group’s link. It starts with erevos://join': 'Eso no es el enlace de un grupo. Empieza por erevos://join',
  'Waiting for an answer': 'Esperando respuesta',
  'A group': 'Un grupo',
  'Stop asking': 'Cancelar la solicitud',
  'The group shows in your chats once its owner’s phone lets you in.': 'El grupo aparecerá en tus chats en cuanto el teléfono de su propietario te deje entrar.',
  'Join a group': 'Unirse a un grupo',
  'Join {name}': 'Unirse a {name}',
  'Not a group’s link': 'No es el enlace de un grupo',
  'This link does not hold a group Erevos can ask to join.': 'Este enlace no contiene un grupo al que Erevos pueda pedir unirse.',
  'Your name in the group': 'Tu nombre en el grupo',
  'Everyone in the group sees it, beside the start of a key made for this group alone.': 'Lo ven todos en el grupo, junto al principio de una clave creada solo para este grupo.',
  'Its owner’s server': 'El servidor de su propietario',
  'A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.':
    'Un grupo público: cualquiera que tenga su enlace puede unirse, así que cualquiera de dentro puede ser alguien que no conoces, y puede copiar lo que se dice. Los miembros ven el nombre que elijas, y dónde te llegan sus mensajes (tu servidor y tu cola en él), no quién eres en tus chats.',
  'Ask to join': 'Pedir unirse',
  'Asked to join': 'Solicitud enviada',
  'The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.':
    'El grupo aparecerá en tus chats en cuanto el teléfono de su propietario te deje entrar: cuando Erevos esté abierto en él y, si el grupo lo pide, en cuanto un admin diga que sí.',

  // A public group's link and moderation (app/public-group.tsx, components/public-group.tsx).
  'Public group · tap for its link and members': 'Grupo público · toca para ver su enlace y sus miembros',
  'A public group you own. Your phone lets people in when Erevos is open on it.': 'Un grupo público que es tuyo. Tu teléfono deja entrar a la gente cuando Erevos está abierto en él.',
  'A public group you are an admin of.': 'Un grupo público del que eres admin.',
  'A public group. Anyone with its link can ask to join.': 'Un grupo público. Cualquiera con su enlace puede pedir unirse.',
  'The group’s link': 'El enlace del grupo',
  'Share the link': 'Compartir el enlace',
  'The group’s link is copied.': 'Enlace del grupo copiado.',
  'Change the link': 'Cambiar el enlace',
  'The link and QR code shared so far stop working. Requests still waiting at the old one are lost.':
    'El enlace y el código QR compartidos hasta ahora dejan de funcionar. Las solicitudes que aún esperan en el antiguo se pierden.',
  Change: 'Cambiar',
  'The group has a new link. The old one no longer works.': 'El grupo tiene un enlace nuevo. El antiguo ya no funciona.',
  'Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.':
    'Quien tenga este enlace puede pedir unirse y leer el grupo desde que entre: nunca lo que se dijo antes. Compártelo solo donde quieras.',
  'The link is made once the owner’s phone has a queue for it on its server.': 'El enlace se crea en cuanto el teléfono del propietario tenga una cola para él en su servidor.',
  'Asking to join': 'Quieren unirse',
  'Let in': 'Dejar entrar',
  'Turn away': 'Rechazar',
  'The owner’s phone lets them in once it hears your answer, when Erevos is open on it.':
    'El teléfono del propietario les deja entrar en cuanto recibe tu respuesta, cuando Erevos está abierto en él.',
  Members: 'Miembros',
  '{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.':
    '{n} en el grupo. Los nombres los elige cada uno y no están verificados: al lado aparece el principio de la clave de cada miembro.',
  owner: 'propietario',
  admin: 'admin',
  muted: 'silenciado',
  Moderate: 'Moderar',
  'Let them write': 'Dejar que escriba',
  '{name} reads nothing the group says from now on, and can ask to join again by the link.':
    '{name} ya no leerá nada de lo que se diga en el grupo, y puede volver a pedir unirse con el enlace.',
  Ban: 'Vetar',
  '{name} is taken out, and what their phone asks after is turned away.': 'Se expulsa a {name}, y lo que pida su teléfono después se rechaza.',
  'Make an admin': 'Hacer admin',
  'No longer an admin': 'Quitar de admin',
  'Hand the group over': 'Ceder el grupo',
  '{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.':
    'A partir de entonces el grupo es de {name}: su teléfono deja entrar a la gente, y el enlace cambia a uno en su servidor. Tú sigues siendo admin.',
  'Hand over': 'Ceder',
  Banned: 'Vetados',
  'Lift the ban': 'Levantar el veto',
  'Delete for everyone': 'Eliminar para todos',
  'Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.':
    'El teléfono de cada miembro lo elimina en cuanto se entera. Quien ya lo haya leído puede haber guardado una copia.',
  'It goes from every member’s phone, as from yours.': 'Se elimina del teléfono de cada miembro, igual que del tuyo.',
  'You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.':
    'Es tuyo: al cerrarlo se expulsa a todos los miembros, y nadie podrá volver a escribir en él. Para que siga sin ti, cédelo primero.',
  'The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.':
    'El teléfono del propietario te sacará la próxima vez que Erevos esté abierto en él. Después no leerás nada del grupo.',
  "Public groups stay on the phone: make and join them there.": "Los grupos públicos se quedan en el teléfono: créalos y únete a ellos allí.",
};
