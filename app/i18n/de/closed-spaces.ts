// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of a closed space that says a message came while another is open (app/security.tsx,
// lib/closed-notices.ts), and of a message that came or went through Nostr (app/chat.tsx) (i18n/de/index.ts).
export const closedSpaces: Record<string, string> = {
  'Went through Nostr.': 'Über Nostr gesendet.',
  'Came through Nostr.': 'Über Nostr gekommen.',
  'Went through the server.': 'Über den Server gesendet.',
  'Came through the server.': 'Über den Server gekommen.',
  'Went to their phone nearby.': 'An ihr Telefon in der Nähe gesendet.',
  'Came from a phone nearby.': 'Von einem Telefon in der Nähe gekommen.',
  'Went over LoRa.': 'Über LoRa gesendet.',
  'Went to the phones nearby, which carry it to their server.': 'An die Telefone in der Nähe gesendet, die es zu ihrem Server bringen.',
  'Went to the phones nearby, in case theirs is one of them.': 'An die Telefone in der Nähe gesendet, falls ihres eins davon ist.',
  '{what} through Nostr, end-to-end encrypted.': '{what}: über Nostr, Ende-zu-Ende-verschlüsselt.',
  'Took the last text {seconds} s after it was sent, at {time}.': 'Hat den letzten Text {seconds} s nach dem Senden angenommen, um {time}.',
  'Did not take the last text, at {time}. {why}': 'Hat den letzten Text nicht angenommen, um {time}. {why}',
  'No text given to it since Erevos started.': 'Seit dem Start von Erevos hat es keinen Text bekommen.',
  'Read on since {time}.': 'Wird seit {time} gelesen.',
  'Could not be read on, at {time}. {why}': 'Konnte nicht gelesen werden, um {time}. {why}',
  'Not read on yet.': 'Wird noch nicht gelesen.',
  'What the servers did last': 'Was die Server zuletzt taten',
  'Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts\' servers show here too once a text went to them.': 'Seit dem Start von Erevos, nur auf diesem Telefon und nur solange es läuft: ob jeder Server den letzten Text angenommen hat, den es bekam, und ob es gelesen wird. Die Server deiner Kontakte erscheinen hier auch, sobald ein Text an sie ging.',
  'It did not say it took it within {seconds} seconds.': 'Es hat nicht innerhalb von {seconds} Sekunden gesagt, dass es ihn angenommen hat.',
  'It refused it: "{reason}"': 'Es hat ihn abgelehnt: „{reason}“',
  'It refused it.': 'Es hat ihn abgelehnt.',
  'Not reached: {reason}': 'Nicht erreicht: {reason}',
  'This space only while open': 'Dieser Bereich nur, wenn offen',
  'Also while another space is open': 'Auch, wenn ein anderer Bereich offen ist',
  'While another space is open, this one says only "New message", as that one does, never which space; its hidden chats say nothing then. For it the phone keeps the addresses of its queues at its server outside its password, including the queue each contact writes to, for up to 64 contacts, never its keys, who its contacts are, or its messages, and its server may tell that the two spaces are on one phone. If this space goes through Tor (Messages or Everything), it is asked about only through Tor: while the open space has Tor off, or its Tor is starting or has just failed, this one says nothing, and what came is told once Tor is ready there.': 'Ist ein anderer Bereich offen, sagt dieser nur „Neue Nachricht“, wie jener, nie welcher Bereich; seine versteckten Chats sagen dann nichts. Dafür behält das Telefon die Adressen seiner Warteschlangen bei seinem Server außerhalb seines Passworts, darunter die, in die jeder seiner Kontakte schreibt, für bis zu 64 Kontakte, nie seine Schlüssel, wer seine Kontakte sind, oder seine Nachrichten, und sein Server kann erkennen, dass beide Bereiche auf einem Telefon sind. Geht dieser Bereich über Tor (Nachrichten oder Alles), wird er nur über Tor abgefragt: Solange der offene Bereich Tor aus hat oder sein Tor gerade startet oder eben gescheitert ist, sagt dieser nichts, und was kam, wird gemeldet, sobald Tor dort bereit ist.',
  'Closed, this space receives nothing: its messages wait at its server and come when it opens.': 'Geschlossen empfängt dieser Bereich nichts: Seine Nachrichten warten bei seinem Server und kommen, wenn er sich öffnet.',
  'This space has no queue at a server yet: it can say nothing while closed.': 'Dieser Bereich hat noch keine Warteschlange bei einem Server: Geschlossen kann er nichts sagen.',
  'Tor is not ready.': 'Tor ist nicht bereit.',
};
