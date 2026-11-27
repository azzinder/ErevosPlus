// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Serbo-Croatian of a closed space that says a message came while another is open (app/security.tsx,
// lib/closed-notices.ts), and of a message that came or went through Nostr (app/chat.tsx) (i18n/sh/index.ts).
export const closedSpaces: Record<string, string> = {
  'Went through Nostr.': 'Poslano preko Nostra.',
  'Came through Nostr.': 'Stiglo preko Nostra.',
  'Went through the server.': 'Poslano preko servera.',
  'Came through the server.': 'Stiglo preko servera.',
  'Went to their phone nearby.': 'Poslano na njihov obližnji telefon.',
  'Came from a phone nearby.': 'Stiglo s obližnjeg telefona.',
  'Went over LoRa.': 'Poslano preko LoRa.',
  'Went to the phones nearby, which carry it to their server.': 'Poslano na obližnje telefone, koji ga nose do njihovog servera.',
  'Went to the phones nearby, in case theirs is one of them.': 'Poslano na obližnje telefone, za slučaj da je njihov jedan od njih.',
  '{what} through Nostr, end-to-end encrypted.': '{what} preko Nostra, šifrirano s kraja na kraj.',
  'Took the last text {seconds} s after it was sent, at {time}.': 'Primio je zadnji tekst {seconds} s nakon slanja, u {time}.',
  'Did not take the last text, at {time}. {why}': 'Nije primio zadnji tekst, u {time}. {why}',
  'No text given to it since Erevos started.': 'Nije mu dan nijedan tekst otkako je Erevos pokrenut.',
  'Read on since {time}.': 'Čita se od {time}.',
  'Could not be read on, at {time}. {why}': 'Nije se moglo čitati, u {time}. {why}',
  'Not read on yet.': 'Još se ne čita.',
  'What the servers did last': 'Što su serveri zadnje učinili',
  'Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts\' servers show here too once a text went to them.': 'Otkako je Erevos pokrenut, samo na ovom telefonu i samo dok radi: je li svaki server primio zadnji tekst koji je dobio i čita li se. Serveri tvojih kontakata pojavljuju se ovdje kad im ode tekst.',
  'It did not say it took it within {seconds} seconds.': 'Nije rekao da ga je primio unutar {seconds} sekundi.',
  'It refused it: "{reason}"': 'Odbio ga je: „{reason}“',
  'It refused it.': 'Odbio ga je.',
  'Not reached: {reason}': 'Nije dosegnut: {reason}',
  'This space only while open': 'Ovaj prostor samo dok je otvoren',
  'Also while another space is open': 'I dok je otvoren drugi prostor',
  'While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its server outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its server may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.': 'Dok je otvoren drugi prostor, ovaj kaže samo „Nova poruka“, kao i onaj, nikad koji prostor; njegovi skriveni razgovori tada ne kažu ništa. Zato telefon čuva adrese njegovih redova na njegovom serveru izvan njegove lozinke, među njima i red u koji piše svaki njegov kontakt, do 64 kontakta, nikad njegove ključeve, ni ko su mu kontakti, ni poruke, a njegov server može zaključiti da su oba prostora na istom telefonu. Ako ovaj prostor ide preko Tora (Poruke ili Sve), za njega se pita samo preko Tora: dok otvoreni prostor ima isključen Tor, ili se njegov Tor pokreće ili je upravo zakazao, ovaj ne kaže ništa, a ono što je stiglo javlja se kad Tor tamo bude spreman.',
  'Closed, this space receives nothing: its messages wait at its server and come when it opens.': 'Zatvoren, ovaj prostor ne prima ništa: njegove poruke čekaju na njegovom serveru i stižu kad se otvori.',
  'This space has no queue at a server yet: it can say nothing while closed.': 'Ovaj prostor još nema red na serveru: zatvoren ne može ništa reći.',
  'Tor is not ready.': 'Tor nije spreman.',
};
