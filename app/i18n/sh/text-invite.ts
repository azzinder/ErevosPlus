// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of invites by plain SMS: making one on a contact's card, and taking one (app/contact-card.tsx, app/text-invite.tsx, app/chat.tsx, lib/sms-relay.ts) (i18n/sh/index.ts).
export const textInvite: Record<string, string> = {
  'An invite lasts only a few days. Ask whoever sent it for a new one.': 'Pozivnica traje samo nekoliko dana. Zatražite novu od onoga ko ju je poslao.',
  'This Erevos cannot answer an invite by SMS yet: update it, then open the link again.': 'Ovaj Erevos još ne može odgovoriti na pozivnicu putem SMS-a: ažurirajte ga, pa ponovo otvorite vezu.',
  'Joined. {name} is your contact as soon as their phone hears from yours, in a moment if it is on.': 'Pridruženi ste. {name} je vaš kontakt čim njegov ili njen telefon čuje vaš, za trenutak ako je uključen.',
  'Joined. Whoever invited you is your contact as soon as their phone hears from yours, in a moment if it is on.': 'Pridruženi ste. Onaj ko vas je pozvao je vaš kontakt čim njegov telefon čuje vaš, za trenutak ako je uključen.',
  'An invite by SMS is taken in the chats of the space, not in hidden chats.': 'Pozivnica putem SMS-a prihvata se u razgovorima prostora, ne u skrivenim razgovorima.',
  'Join me on Erevos, for messages and calls only we can read: {link}': 'Pridružite mi se na Erevosu, za poruke i pozive koje samo mi možemo čitati: {link}',
  'Invite by SMS': 'Pozovi putem SMS-a',
  "An invite by SMS": "Poziv putem SMS-a",
  "{number} sent you an Erevos invite by SMS. Answer it with your contact link, so they can write to you here? Only if you know this number: the sender of an SMS can be made up.": "{number} vam je poslao poziv za Erevos putem SMS-a. Odgovoriti vašim kontakt linkom, da vam može pisati ovdje? Samo ako poznajete ovaj broj: pošiljatelj SMS-a može biti lažan.",
  "Answer it": "Odgovori",
  'No Erevos yet? An SMS with a link: it offers them Erevos, and once they join you are each other’s contacts, end-to-end encrypted. For one person, for two days.': 'Još nema Erevos? SMS s vezom: nudi mu Erevos, i čim se pridruži, jedno ste drugom kontakt, šifrirano s kraja na kraj. Za jednu osobu, na dva dana.',
  'This invite is over': 'Ova pozivnica je istekla',
  'Join, and whoever invited you is your contact as soon as their phone hears of it. What you write to each other is end-to-end encrypted. Erevos sets itself up to reach them, typing nothing. Take it only if it came from them.': 'Pridružite se, i onaj ko vas je pozvao postaje vaš kontakt čim njegov telefon to sazna. Ono što jedno drugom pišete šifrirano je s kraja na kraj. Erevos se sam podešava da ih dosegne, bez kucanja. Prihvatite je samo ako je zaista došla od te osobe.',
  'An invite by SMS needs a server: your phone has none yet.': 'Pozivnica putem SMS-a treba server: vaš telefon ga još nema.',
  'Your server does not let this phone invite anyone, so an invite by SMS could not let them in. Invite them with a QR code instead, from New chat.': 'Vaš server ne dozvoljava ovom telefonu da ikoga pozove, pa ih pozivnica putem SMS-a ne bi mogla pustiti unutra. Umesto toga pozovite ih QR kodom, iz Novog razgovora.',
};
