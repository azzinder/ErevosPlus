// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of public groups, joined by a link, and their moderation (i18n/it/index.ts).
export const publicGroups: Record<string, string> = {
  // What the group keeps as notes (lib/public-groups.ts, lib/public-rules.ts).
  '{who} was muted.': '{who} non può più scrivere.',
  '{who} can write again.': '{who} può di nuovo scrivere.',
  '{who} was banned.': '{who} è fuori dal gruppo e non può più rientrare.',
  '{who} is no longer banned.': '{who} può di nuovo chiedere di entrare.',
  '{who} was taken out.': '{who} non fa più parte del gruppo.',
  '{who} is an admin.': '{who} ora è admin.',
  '{who} is no longer an admin.': '{who} non è più admin.',
  '{who} owns the group now.': 'Il gruppo ora appartiene a {who}.',
  'A message was deleted for everyone.': 'Un messaggio è stato eliminato per tutti.',
  'An admin took you out of the group.': 'Un admin ti ha rimosso dal gruppo.',
  'The group is full: its owner could not let you in.': 'Il gruppo è pieno: il proprietario non ha potuto farti entrare.',
  'You joined the group.': 'Ora fai parte del gruppo.',
  'Your request to join was turned down.': 'La tua richiesta di entrare è stata rifiutata.',

  // What goes wrong (lib/public-groups.ts).
  'Admins moderate members, and only the owner moderates admins.': 'Gli admin moderano i membri, e solo il proprietario modera gli admin.',
  'An admin muted you in this group.': 'Un admin ti ha silenziato in questo gruppo.',
  'Choose the name the group sees.': 'Scegli il nome che vede il gruppo.',
  'Only the group’s admins do that.': 'Solo gli admin del gruppo possono farlo.',
  'Only the group’s owner does that.': 'Solo il proprietario del gruppo può farlo.',
  'Share the group’s link to have people join.': 'Condividi il link del gruppo per far entrare le persone.',
  'That member is not in the group any more.': 'Quel membro non fa più parte del gruppo.',
  'That message cannot be deleted for everyone.': 'Quel messaggio non può essere eliminato per tutti.',
  'This link no longer works. Ask someone in the group for the new one.': 'Questo link non funziona più. Chiedi quello nuovo a qualcuno del gruppo.',
  'You are in this group already.': 'Fai già parte di questo gruppo.',

  // The menu, and making or joining one (app/index.tsx, app/public-groups.tsx, app/join.tsx).
  'Public groups': 'Gruppi pubblici',
  'Make a group anyone with its link can join, or join one by a link': 'Crea un gruppo in cui può entrare chiunque abbia il link, o entra in uno con un link',
  'This build of Erevos has no public groups yet. Update it to make or join one.':
    'Questa versione di Erevos non ha ancora i gruppi pubblici. Aggiornala per crearne uno o entrarci.',
  'A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.':
    'Un gruppo pubblico è un gruppo in cui chiunque abbia il suo link o codice QR può chiedere di entrare, con un proprietario e degli admin che lo moderano. I suoi messaggi sono crittografati end-to-end come in ogni gruppo, e nessun server sa chi ne fa parte.',
  'Make a public group': 'Crea un gruppo pubblico',
  'Whoever sees the link sees it too.': 'Lo vede anche chi vede il link.',
  'Your name in it': 'Il tuo nome nel gruppo',
  'Members see this, not your contact name nor who you are in your chats.': 'I membri vedono questo, non il tuo nome nei contatti né chi sei nelle tue chat.',
  'A name for this group': 'Un nome per questo gruppo',
  'Who comes in': 'Chi può entrare',
  'Anyone with the link': 'Chiunque abbia il link',
  'An admin lets them in': 'Li accetta un admin',
  'You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.':
    'Il gruppo è tuo: il tuo telefono fa entrare le persone, quindi entrano appena Erevos vi è aperto. Chi ha il link legge quello che si scrive da quando entra, mai quello che c’era prima.',
  'Make the public group': 'Crea il gruppo pubblico',
  'Join by a link': 'Entra con un link',
  'Open the link': 'Apri il link',
  'That is not a group’s link. It starts with erevos://join': 'Questo non è il link di un gruppo. Inizia con erevos://join',
  'Waiting for an answer': 'In attesa di risposta',
  'A group': 'Un gruppo',
  'Stop asking': 'Ritira la richiesta',
  'The group shows in your chats once its owner’s phone lets you in.': 'Il gruppo appare nelle tue chat appena il telefono del proprietario ti fa entrare.',
  'Join a group': 'Entra in un gruppo',
  'Join {name}': 'Entra in «{name}»',
  'Not a group’s link': 'Non è il link di un gruppo',
  'This link does not hold a group Erevos can ask to join.': 'Questo link non contiene un gruppo in cui Erevos possa chiedere di entrare.',
  'Your name in the group': 'Il tuo nome nel gruppo',
  'Everyone in the group sees it, beside the start of a key made for this group alone.': 'Lo vedono tutti nel gruppo, accanto all’inizio di una chiave creata solo per questo gruppo.',
  'Its owner’s server': 'Il server del proprietario',
  'A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.':
    'Un gruppo pubblico: chi ha il link può entrarci, quindi chiunque ne faccia parte può essere qualcuno che non conosci, e può copiare quello che si scrive. I membri vedono il nome che scegli, e dove i loro messaggi ti raggiungono (il tuo server e la tua coda lì), non chi sei nelle tue chat.',
  'Ask to join': 'Chiedi di entrare',
  'Asked to join': 'Richiesta inviata',
  'The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.':
    'Il gruppo appare nelle tue chat appena il telefono del proprietario ti fa entrare: quando vi è aperto Erevos e, se il gruppo lo richiede, appena un admin dice di sì.',

  // A public group's link and moderation (app/public-group.tsx, components/public-group.tsx).
  'Public group · tap for its link and members': 'Gruppo pubblico · tocca per il link e i membri',
  'A public group you own. Your phone lets people in when Erevos is open on it.': 'Un gruppo pubblico tuo. Il tuo telefono fa entrare le persone quando vi è aperto Erevos.',
  'A public group you are an admin of.': 'Un gruppo pubblico di cui sei admin.',
  'A public group. Anyone with its link can ask to join.': 'Un gruppo pubblico. Chiunque abbia il suo link può chiedere di entrare.',
  'The group’s link': 'Il link del gruppo',
  'Share the link': 'Condividi il link',
  'The group’s link is copied.': 'Link del gruppo copiato.',
  'Change the link': 'Cambia il link',
  'The link and QR code shared so far stop working. Requests still waiting at the old one are lost.':
    'Il link e il codice QR condivisi finora smettono di funzionare. Le richieste ancora in attesa su quello vecchio vanno perse.',
  Change: 'Cambia',
  'The group has a new link. The old one no longer works.': 'Il gruppo ha un nuovo link. Quello vecchio non funziona più.',
  'Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.':
    'Chi ha questo link può chiedere di entrare, e leggere il gruppo da quando viene fatto entrare: mai quello che si è scritto prima. Condividilo solo dove vuoi davvero.',
  'The link is made once the owner’s phone has a queue for it on its server.': 'Il link viene creato appena il telefono del proprietario ha una coda apposita sul suo server.',
  'Asking to join': 'Chiedono di entrare',
  'Let in': 'Fai entrare',
  'Turn away': 'Rifiuta',
  'The owner’s phone lets them in once it hears your answer, when Erevos is open on it.':
    'Il telefono del proprietario li fa entrare appena riceve la tua risposta, quando vi è aperto Erevos.',
  Members: 'Membri',
  '{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.':
    '{n} nel gruppo. I nomi sono scelti, non verificati: accanto a ognuno appare l’inizio della chiave del membro.',
  owner: 'proprietario',
  admin: 'admin',
  muted: 'silenziato',
  Moderate: 'Modera',
  'Let them write': 'Lascia scrivere',
  '{name} reads nothing the group says from now on, and can ask to join again by the link.':
    '{name} da ora non legge più nulla del gruppo, e può chiedere di nuovo di entrare con il link.',
  Ban: 'Escludi',
  '{name} is taken out, and what their phone asks after is turned away.': 'Rimuove {name} dal gruppo, e rifiuta ogni richiesta successiva del suo telefono.',
  'Make an admin': 'Rendi admin',
  'No longer an admin': 'Togli da admin',
  'Hand the group over': 'Cedi il gruppo',
  '{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.':
    'Da quel momento il gruppo appartiene a {name}: il suo telefono fa entrare le persone, e il link passa a uno sul suo server. Tu resti admin.',
  'Hand over': 'Cedi',
  Banned: 'Esclusi',
  'Lift the ban': 'Togli l’esclusione',
  'Delete for everyone': 'Elimina per tutti',
  'Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.':
    'Il telefono di ogni membro lo elimina appena lo viene a sapere. Chi l’ha già letto potrebbe averne conservato una copia.',
  'It goes from every member’s phone, as from yours.': 'Sparisce dal telefono di ogni membro, come dal tuo.',
  'You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.':
    'È tuo: chiuderlo rimuove tutti i membri, e nessuno potrà più scriverci. Per farlo continuare senza di te, prima cedilo.',
  'The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.':
    'Il telefono del proprietario ti rimuoverà la prossima volta che vi sarà aperto Erevos. Dopo non leggerai più nulla del gruppo.',
  "Public groups stay on the phone: make and join them there.": "I gruppi pubblici restano sul telefono: creali e unisciti a loro da lì.",
};
