// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of a closed space that says a message came while another is open (app/security.tsx,
// lib/closed-notices.ts), and of a message that came or went through Nostr (app/chat.tsx) (i18n/it/index.ts).
export const closedSpaces: Record<string, string> = {
  'Went through Nostr.': 'Inviato tramite Nostr.',
  'Came through Nostr.': 'Arrivato tramite Nostr.',
  'Went through the server.': 'Inviato tramite il server.',
  'Came through the server.': 'Arrivato tramite il server.',
  'Went to their phone nearby.': 'Inviato al suo telefono vicino.',
  'Came from a phone nearby.': 'Arrivato da un telefono vicino.',
  'Went over LoRa.': 'Inviato tramite LoRa.',
  'Went to the phones nearby, which carry it to their server.': 'Inviato ai telefoni vicini, che lo portano al suo server.',
  'Went to the phones nearby, in case theirs is one of them.': 'Inviato ai telefoni vicini, nel caso il suo sia uno di loro.',
  '{what} through Nostr, end-to-end encrypted.': '{what} tramite Nostr, crittografato end-to-end.',
  'Took the last text {seconds} s after it was sent, at {time}.': 'Ha preso l’ultimo testo {seconds} s dopo l’invio, alle {time}.',
  'Did not take the last text, at {time}. {why}': 'Non ha preso l’ultimo testo, alle {time}. {why}',
  'No text given to it since Erevos started.': 'Nessun testo gli è stato dato da quando Erevos è partito.',
  'Read on since {time}.': 'Letto dalle {time}.',
  'Could not be read on, at {time}. {why}': 'Non è stato possibile leggerlo, alle {time}. {why}',
  'Not read on yet.': 'Non ancora letto.',
  'What the servers did last': 'Cosa hanno fatto i server per ultimo',
  'Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts\' servers show here too once a text went to them.': 'Da quando Erevos è partito, solo su questo telefono e solo finché è in funzione: se ogni server ha preso l’ultimo testo ricevuto e se viene letto. Anche i server dei tuoi contatti compaiono qui quando un testo è andato a loro.',
  'It did not say it took it within {seconds} seconds.': 'Non ha detto di averlo preso entro {seconds} secondi.',
  'It refused it: "{reason}"': 'L’ha rifiutato: «{reason}»',
  'It refused it.': 'L’ha rifiutato.',
  'Not reached: {reason}': 'Non raggiunto: {reason}',
  'This space only while open': 'Questo spazio solo quando è aperto',
  'Also while another space is open': 'Anche mentre è aperto un altro spazio',
  'While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its server outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its server may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.': 'Mentre è aperto un altro spazio, questo dice solo «New message», come quello, mai quale spazio; le sue chat nascoste allora non dicono nulla. Per questo il telefono tiene gli indirizzi delle sue code sul suo server fuori dalla sua password, tra cui quella in cui scrive ciascuno dei suoi contatti, fino a 64 contatti, mai le sue chiavi, chi sono i suoi contatti o i messaggi, e il suo server può capire che i due spazi sono sullo stesso telefono. Se questo spazio passa per Tor (Messaggi o Tutto), gli si chiede solo tramite Tor: mentre lo spazio aperto ha Tor disattivato, o il suo Tor si sta avviando o ha appena fallito, questo non dice nulla, e quello che è arrivato viene detto appena lì Tor è pronto.',
  'Closed, this space receives nothing: its messages wait at its server and come when it opens.': 'Chiuso, questo spazio non riceve nulla: i suoi messaggi aspettano sul suo server e arrivano quando si apre.',
  'This space has no queue at a server yet: it can say nothing while closed.': 'Questo spazio non ha ancora una coda su un server: chiuso non può dire nulla.',
  'Tor is not ready.': 'Tor non è pronto.',
};
