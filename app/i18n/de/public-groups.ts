// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of public groups, joined by a link, and their moderation (i18n/de/index.ts).
export const publicGroups: Record<string, string> = {
  // What the group keeps as notes (lib/public-groups.ts, lib/public-rules.ts).
  '{who} was muted.': '{who} wurde stummgeschaltet.',
  '{who} can write again.': '{who} kann wieder schreiben.',
  '{who} was banned.': '{who} wurde gesperrt.',
  '{who} is no longer banned.': '{who} ist nicht mehr gesperrt.',
  '{who} was taken out.': '{who} wurde entfernt.',
  '{who} is an admin.': '{who} ist jetzt Admin.',
  '{who} is no longer an admin.': '{who} ist kein Admin mehr.',
  '{who} owns the group now.': 'Die Gruppe gehört jetzt {who}.',
  'A message was deleted for everyone.': 'Eine Nachricht wurde für alle gelöscht.',
  'An admin took you out of the group.': 'Ein Admin hat dich aus der Gruppe entfernt.',
  'The group is full: its owner could not let you in.': 'Die Gruppe ist voll: Ihr Inhaber konnte dich nicht hereinlassen.',
  'You joined the group.': 'Du bist der Gruppe beigetreten.',
  'Your request to join was turned down.': 'Deine Beitrittsanfrage wurde abgelehnt.',

  // What goes wrong (lib/public-groups.ts).
  'Admins moderate members, and only the owner moderates admins.': 'Admins moderieren Mitglieder, und nur der Inhaber moderiert Admins.',
  'An admin muted you in this group.': 'Ein Admin hat dich in dieser Gruppe stummgeschaltet.',
  'Choose the name the group sees.': 'Wähle den Namen, den die Gruppe sieht.',
  'Only the group’s admins do that.': 'Das machen nur die Admins der Gruppe.',
  'Only the group’s owner does that.': 'Das macht nur der Inhaber der Gruppe.',
  'Share the group’s link to have people join.': 'Teile den Link der Gruppe, damit Leute beitreten.',
  'That member is not in the group any more.': 'Dieses Mitglied ist nicht mehr in der Gruppe.',
  'That message cannot be deleted for everyone.': 'Diese Nachricht lässt sich nicht für alle löschen.',
  'This link no longer works. Ask someone in the group for the new one.': 'Dieser Link funktioniert nicht mehr. Bitte jemanden in der Gruppe um den neuen.',
  'You are in this group already.': 'Du bist schon in dieser Gruppe.',

  // The menu, and making or joining one (app/index.tsx, app/public-groups.tsx, app/join.tsx).
  'Public groups': 'Öffentliche Gruppen',
  'Make a group anyone with its link can join, or join one by a link': 'Eine Gruppe erstellen, der jeder mit ihrem Link beitreten kann, oder einer per Link beitreten',
  'This build of Erevos has no public groups yet. Update it to make or join one.':
    'Diese Version von Erevos hat noch keine öffentlichen Gruppen. Aktualisiere sie, um eine zu erstellen oder einer beizutreten.',
  'A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.':
    'Eine öffentliche Gruppe ist eine, um deren Beitritt jeder mit ihrem Link oder QR-Code bitten kann, mit einem Inhaber und Admins, die sie moderieren. Ihre Nachrichten sind wie in jeder Gruppe Ende-zu-Ende-verschlüsselt, und kein Server erfährt, wer dabei ist.',
  'Make a public group': 'Neue öffentliche Gruppe',
  'Whoever sees the link sees it too.': 'Wer den Link sieht, sieht ihn auch.',
  'Your name in it': 'Dein Name darin',
  'Members see this, not your contact name nor who you are in your chats.': 'Mitglieder sehen diesen, nicht deinen Kontaktnamen und auch nicht, wer du in deinen Chats bist.',
  'A name for this group': 'Ein Name für diese Gruppe',
  'Who comes in': 'Wer hereinkommt',
  'Anyone with the link': 'Jeder mit dem Link',
  'An admin lets them in': 'Ein Admin lässt sie herein',
  'You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.':
    'Die Gruppe gehört dir: Dein Telefon lässt Leute herein, sie treten also bei, sobald Erevos darauf offen ist. Jeder mit dem Link liest, was ab seinem Beitritt gesagt wird, nie, was vorher kam.',
  'Make the public group': 'Öffentliche Gruppe erstellen',
  'Join by a link': 'Per Link beitreten',
  'Open the link': 'Link öffnen',
  'That is not a group’s link. It starts with erevos://join': 'Das ist kein Gruppenlink. Er beginnt mit erevos://join',
  'Waiting for an answer': 'Warten auf Antwort',
  'A group': 'Eine Gruppe',
  'Stop asking': 'Anfrage zurückziehen',
  'The group shows in your chats once its owner’s phone lets you in.': 'Die Gruppe erscheint in deinen Chats, sobald das Telefon ihres Inhabers dich hereinlässt.',
  'Join a group': 'Einer Gruppe beitreten',
  'Join {name}': '{name} beitreten',
  'Not a group’s link': 'Kein Gruppenlink',
  'This link does not hold a group Erevos can ask to join.': 'Dieser Link enthält keine Gruppe, um deren Beitritt Erevos bitten kann.',
  'Your name in the group': 'Dein Name in der Gruppe',
  'Everyone in the group sees it, beside the start of a key made for this group alone.': 'Alle in der Gruppe sehen ihn, neben dem Anfang eines Schlüssels, der nur für diese Gruppe erstellt wurde.',
  'Its owner’s server': 'Der Server ihres Inhabers',
  'A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.':
    'Eine öffentliche Gruppe: Wer ihren Link hat, kann beitreten, also kann jeder darin jemand sein, den du nicht kennst, und kopieren, was gesagt wird. Mitglieder sehen den Namen, den du wählst, und wo ihre Nachrichten dich erreichen (dein Server und deine Warteschlange dort), nicht, wer du in deinen Chats bist.',
  'Ask to join': 'Beitritt anfragen',
  'Asked to join': 'Beitritt angefragt',
  'The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.':
    'Die Gruppe erscheint in deinen Chats, sobald das Telefon ihres Inhabers dich hereinlässt: wenn Erevos darauf offen ist, und wenn die Gruppe es verlangt, sobald ein Admin zustimmt.',

  // A public group's link and moderation (app/public-group.tsx, components/public-group.tsx).
  'Public group · tap for its link and members': 'Öffentliche Gruppe · tippen für Link und Mitglieder',
  'A public group you own. Your phone lets people in when Erevos is open on it.': 'Eine öffentliche Gruppe, die dir gehört. Dein Telefon lässt Leute herein, wenn Erevos darauf offen ist.',
  'A public group you are an admin of.': 'Eine öffentliche Gruppe, in der du Admin bist.',
  'A public group. Anyone with its link can ask to join.': 'Eine öffentliche Gruppe. Jeder mit ihrem Link kann um Beitritt bitten.',
  'The group’s link': 'Der Link der Gruppe',
  'Share the link': 'Link teilen',
  'The group’s link is copied.': 'Der Link der Gruppe ist kopiert.',
  'Change the link': 'Link ändern',
  'The link and QR code shared so far stop working. Requests still waiting at the old one are lost.':
    'Der bisher geteilte Link und QR-Code funktionieren dann nicht mehr. Anfragen, die noch beim alten warten, gehen verloren.',
  Change: 'Ändern',
  'The group has a new link. The old one no longer works.': 'Die Gruppe hat einen neuen Link. Der alte funktioniert nicht mehr.',
  'Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.':
    'Wer diesen Link hat, kann um Beitritt bitten und die Gruppe ab dem Moment lesen, in dem er hereingelassen wird: nie, was vorher gesagt wurde. Teile ihn nur dort, wo du es willst.',
  'The link is made once the owner’s phone has a queue for it on its server.': 'Der Link entsteht, sobald das Telefon des Inhabers eine Warteschlange dafür auf seinem Server hat.',
  'Asking to join': 'Beitrittsanfragen',
  'Let in': 'Hereinlassen',
  'Turn away': 'Abweisen',
  'The owner’s phone lets them in once it hears your answer, when Erevos is open on it.':
    'Das Telefon des Inhabers lässt sie herein, sobald es deine Antwort erhält, wenn Erevos darauf offen ist.',
  Members: 'Mitglieder',
  '{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.':
    '{n} in der Gruppe. Namen sind selbst gewählt, nicht geprüft: Daneben steht der Anfang des Schlüssels jedes Mitglieds.',
  owner: 'Inhaber',
  admin: 'Admin',
  muted: 'stummgeschaltet',
  Moderate: 'Moderieren',
  'Let them write': 'Schreiben lassen',
  '{name} reads nothing the group says from now on, and can ask to join again by the link.':
    '{name} liest ab jetzt nichts mehr von dem, was in der Gruppe geschrieben wird, und kann über den Link erneut um Beitritt bitten.',
  Ban: 'Sperren',
  '{name} is taken out, and what their phone asks after is turned away.': '{name} wird entfernt, und was das Telefon danach noch anfragt, wird abgewiesen.',
  'Make an admin': 'Zum Admin machen',
  'No longer an admin': 'Nicht mehr Admin',
  'Hand the group over': 'Gruppe übergeben',
  '{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.':
    'Ab dann gehört die Gruppe {name}: Das Telefon von {name} lässt Leute herein, und der Link wechselt zu einem auf dem eigenen Server. Du bleibst Admin.',
  'Hand over': 'Übergeben',
  Banned: 'Gesperrt',
  'Lift the ban': 'Sperre aufheben',
  'Delete for everyone': 'Für alle löschen',
  'Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.':
    'Das Telefon jedes Mitglieds löscht sie, sobald es davon erfährt. Wer sie schon gelesen hat, hat vielleicht eine Kopie behalten.',
  'It goes from every member’s phone, as from yours.': 'Sie verschwindet vom Telefon jedes Mitglieds, wie von deinem.',
  'You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.':
    'Sie gehört dir: Wenn du sie schließt, werden alle Mitglieder entfernt, und niemand kann mehr darin schreiben. Damit sie ohne dich weiterläuft, übergib sie zuerst.',
  'The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.':
    'Das Telefon des Inhabers entfernt dich, wenn Erevos das nächste Mal darauf offen ist. Danach liest du nichts mehr aus der Gruppe.',
  "Public groups stay on the phone: make and join them there.": "Öffentliche Gruppen bleiben auf dem Telefon: Erstelle sie dort und tritt ihnen dort bei.",
};
