// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of public groups, joined by a link, and their moderation (i18n/sh/index.ts).
export const publicGroups: Record<string, string> = {
  // What the group keeps as notes (lib/public-groups.ts, lib/public-rules.ts).
  '{who} was muted.': '{who} sada ne može pisati.',
  '{who} can write again.': '{who} ponovo može pisati.',
  '{who} was banned.': '{who} je pod zabranom.',
  '{who} is no longer banned.': '{who} više nije pod zabranom.',
  '{who} was taken out.': 'Član {who} je uklonjen iz grupe.',
  '{who} is an admin.': '{who} je admin.',
  '{who} is no longer an admin.': '{who} više nije admin.',
  '{who} owns the group now.': '{who} je sada vlasnik grupe.',
  'A message was deleted for everyone.': 'Poruka je obrisana za sve.',
  'An admin took you out of the group.': 'Admin vas je uklonio iz grupe.',
  'The group is full: its owner could not let you in.': 'Grupa je puna: vlasnik vas nije mogao primiti.',
  'You joined the group.': 'Pridružili ste se grupi.',
  'Your request to join was turned down.': 'Vaš zahtjev za pridruživanje je odbijen.',

  // What goes wrong (lib/public-groups.ts).
  'Admins moderate members, and only the owner moderates admins.': 'Admini moderiraju članove, a admine moderira samo vlasnik.',
  'An admin muted you in this group.': 'Admin vam je zabranio pisanje u ovoj grupi.',
  'Choose the name the group sees.': 'Izaberite ime koje grupa vidi.',
  'Only the group’s admins do that.': 'To rade samo admini grupe.',
  'Only the group’s owner does that.': 'To radi samo vlasnik grupe.',
  'Share the group’s link to have people join.': 'Podijelite link grupe da bi joj se ljudi pridružili.',
  'That member is not in the group any more.': 'Taj član više nije u grupi.',
  'That message cannot be deleted for everyone.': 'Ta poruka se ne može obrisati za sve.',
  'This link no longer works. Ask someone in the group for the new one.': 'Ovaj link više ne radi. Zatražite novi od nekoga iz grupe.',
  'You are in this group already.': 'Već ste u ovoj grupi.',

  // The menu, and making or joining one (app/index.tsx, app/public-groups.tsx, app/join.tsx).
  'Public groups': 'Javne grupe',
  'Make a group anyone with its link can join, or join one by a link':
    'Napravite grupu kojoj se mogu pridružiti svi koji imaju njen link ili se pridružite nekoj putem linka',
  'This build of Erevos has no public groups yet. Update it to make or join one.':
    'Ova verzija Erevosa još nema javne grupe. Ažurirajte je da biste napravili javnu grupu ili se pridružili nekoj.',
  'A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.':
    'Javna grupa je grupa u koju svi koji imaju njen link ili QR kod mogu zatražiti ulazak, s vlasnikom i adminima koji je moderiraju. Njene poruke su šifrirane s kraja na kraj kao u svakoj grupi, a nijedan server ne saznaje njene članove.',
  'Make a public group': 'Napravi javnu grupu',
  'Whoever sees the link sees it too.': 'Vide ga svi koji vide link.',
  'Your name in it': 'Vaše ime u njoj',
  'Members see this, not your contact name nor who you are in your chats.':
    'Članovi vide ovo, a ne vaše ime u kontaktima ni kako se predstavljate u svojim razgovorima.',
  'A name for this group': 'Naziv ove grupe',
  'Who comes in': 'Ulazak u grupu',
  'Anyone with the link': 'Svi koji imaju link',
  'An admin lets them in': 'Admin odobrava ulazak',
  'You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.':
    'Vi ste vlasnik grupe: vaš telefon pušta ljude unutra, pa se pridružuju kad je Erevos na njemu otvoren. Svi koji imaju link čitaju ono što se kaže od trenutka kad se pridruže, nikad ono što je bilo prije.',
  'Make the public group': 'Napravi javnu grupu',
  'Join by a link': 'Pridruži se putem linka',
  'Open the link': 'Otvori link',
  'That is not a group’s link. It starts with erevos://join': 'To nije link grupe. Počinje s erevos://join',
  'Waiting for an answer': 'Čeka se odgovor',
  'A group': 'Grupa',
  'Stop asking': 'Povuci zahtjev',
  'The group shows in your chats once its owner’s phone lets you in.':
    'Grupa se pojavljuje među vašim razgovorima kad vas telefon njenog vlasnika pusti unutra.',
  'Join a group': 'Pridruži se grupi',
  'Join {name}': 'Pridruži se grupi {name}',
  'Not a group’s link': 'Nije link grupe',
  'This link does not hold a group Erevos can ask to join.': 'Ovaj link ne sadrži grupu kojoj Erevos može zatražiti pridruživanje.',
  'Your name in the group': 'Vaše ime u grupi',
  'Everyone in the group sees it, beside the start of a key made for this group alone.':
    'Vide ga svi u grupi, pored početka ključa napravljenog samo za ovu grupu.',
  'Its owner’s server': 'Server njenog vlasnika',
  'A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.':
    'Javna grupa: pridružiti joj se mogu svi koji imaju njen link, pa bilo koji član može biti osoba koju ne poznajete i može kopirati ono što se kaže. Članovi vide ime koje izaberete i gdje vam njihove poruke stižu (vaš server i vaš red na njemu), a ne kako se predstavljate u svojim razgovorima.',
  'Ask to join': 'Zatraži pridruživanje',
  'Asked to join': 'Pridruživanje zatraženo',
  'The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.':
    'Grupa se pojavljuje među vašim razgovorima kad vas telefon njenog vlasnika pusti unutra: kad je Erevos na njemu otvoren i, ako grupa to traži, kad admin odobri.',

  // A public group's link and moderation (app/public-group.tsx, components/public-group.tsx).
  'Public group · tap for its link and members': 'Javna grupa · dodirnite za link i članove',
  'A public group you own. Your phone lets people in when Erevos is open on it.':
    'Javna grupa čiji ste vlasnik. Vaš telefon pušta ljude unutra kad je Erevos na njemu otvoren.',
  'A public group you are an admin of.': 'Javna grupa u kojoj ste admin.',
  'A public group. Anyone with its link can ask to join.': 'Javna grupa. Svi koji imaju njen link mogu zatražiti pridruživanje.',
  'The group’s link': 'Link grupe',
  'Share the link': 'Podijeli link',
  'The group’s link is copied.': 'Link grupe je kopiran.',
  'Change the link': 'Promijeni link',
  'The link and QR code shared so far stop working. Requests still waiting at the old one are lost.':
    'Dosad podijeljeni link i QR kod prestaju raditi. Zahtjevi koji još čekaju na starom linku gube se.',
  Change: 'Promijeni',
  'The group has a new link. The old one no longer works.': 'Grupa ima novi link. Stari više ne radi.',
  'Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.':
    'Svi koji imaju ovaj link mogu zatražiti pridruživanje i čitati grupu od trenutka kad budu primljeni: nikad ono što je rečeno prije. Dijelite ga samo tamo gdje to zaista želite.',
  'The link is made once the owner’s phone has a queue for it on its server.':
    'Link nastaje kad telefon vlasnika dobije red za njega na svom serveru.',
  'Asking to join': 'Zahtjevi za pridruživanje',
  'Let in': 'Primi',
  'Turn away': 'Odbij',
  'The owner’s phone lets them in once it hears your answer, when Erevos is open on it.':
    'Telefon vlasnika pušta ih unutra kad primi vaš odgovor, dok je Erevos na njemu otvoren.',
  Members: 'Članovi',
  '{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.':
    'U grupi: {n}. Imena su izabrana, a ne provjerena: pored svakog je početak ključa tog člana.',
  owner: 'vlasnik',
  admin: 'admin',
  muted: 'bez prava pisanja',
  Moderate: 'Moderiraj',
  'Let them write': 'Dozvoli pisanje',
  '{name} reads nothing the group says from now on, and can ask to join again by the link.':
    '{name} od sada ne čita ništa što se kaže u grupi i može ponovo zatražiti pridruživanje putem linka.',
  Ban: 'Zabrani pristup',
  '{name} is taken out, and what their phone asks after is turned away.':
    '{name} se uklanja iz grupe, a svaki kasniji zahtjev s tog telefona odbija se.',
  'Make an admin': 'Postavi za admina',
  'No longer an admin': 'Oduzmi ulogu admina',
  'Hand the group over': 'Predaj grupu',
  '{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.':
    '{name} je od tada vlasnik grupe: telefon te osobe pušta ljude unutra, a link se mijenja u link na njenom serveru. Vi ostajete admin.',
  'Hand over': 'Predaj',
  Banned: 'Pod zabranom',
  'Lift the ban': 'Ukloni zabranu',
  'Delete for everyone': 'Obriši za sve',
  'Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.':
    'Telefon svakog člana briše je kad za to sazna. Oni koji su je već pročitali možda su sačuvali kopiju.',
  'It goes from every member’s phone, as from yours.': 'Nestaje s telefona svakog člana, kao i s vašeg.',
  'You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.':
    'Vi ste vlasnik: zatvaranjem grupe uklanjaju se svi članovi i u njoj se više ne može pisati. Da bi grupa i dalje postojala bez vas, prvo je predajte.',
  'The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.':
    'Telefon vlasnika uklanja vas kad sljedeći put na njemu bude otvoren Erevos. Poslije toga ne čitate ništa što se kaže u grupi.',
  "Public groups stay on the phone: make and join them there.": "Javne grupe ostaju na telefonu: napravi ih i pridruži im se ondje.",
};
