// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// German for parts (lib/i18n.ts).
export const parts: Record<string, string> = {
  // The password screen and the password sheet (lock/gate.tsx, components/PasswordSheet.tsx).
  'Enter your password': 'Gib dein Passwort ein',
  Unlock: 'Entsperren',
  'Wrong password': 'Falsches Passwort',
  'Use at least {n} characters.': 'Nimm mindestens {n} Zeichen.',
  'The passwords do not match.': 'Die Passwörter stimmen nicht überein.',
  'Use a different password.': 'Nimm ein anderes Passwort.',
  'New password': 'Neues Passwort',
  'Repeat password': 'Passwort wiederholen',
  'Too many attempts. Try again in {n} minute.': 'Zu viele Versuche. Versuche es in {n} Minute erneut.',
  'Too many attempts. Try again in {n} minutes.': 'Zu viele Versuche. Versuche es in {n} Minuten erneut.',
  'Too many attempts. Try again in {n} second.': 'Zu viele Versuche. Versuche es in {n} Sekunde erneut.',
  'Too many attempts. Try again in {n} seconds.': 'Zu viele Versuche. Versuche es in {n} Sekunden erneut.',

  // Small parts of screens.
  'QR code': 'QR-Code',
  Group: 'Gruppe',

  // Calls (components/call-screen.tsx, components/group-call-screen.tsx).
  'Call ended': 'Anruf beendet',
  'They hung up': 'Hat aufgelegt',
  'Turned down': 'Abgelehnt',
  'They turned it down': 'Hat abgelehnt',
  'They are in another call': 'Ist in einem anderen Anruf',
  'Not answered': 'Nicht angenommen',
  'The call could not connect': 'Der Anruf kam nicht zustande',
  'The call could not connect on their phone': 'Der Anruf kam auf dem anderen Telefon nicht zustande',
  'Calling…': 'Ruft an…',
  'Ringing…': 'Klingelt…',
  'Incoming video call': 'Eingehender Videoanruf',
  'Incoming voice call': 'Eingehender Sprachanruf',
  'Connecting…': 'Verbindet…',
  'Missed call': 'Verpasster Anruf',
  Decline: 'Ablehnen',
  Answer: 'Annehmen',
  Unmute: 'Mikro an',
  Mute: 'Stumm',
  Speaker: 'Lautsprecher',
  'Camera on': 'Kamera an',
  'Camera off': 'Kamera aus',
  Flip: 'Wechseln',
  End: 'Auflegen',
  'You started a group video call': 'Du hast einen Gruppen-Videoanruf gestartet',
  'You started a group call': 'Du hast einen Gruppenanruf gestartet',
  '{name} started a group video call': '{name} hat einen Gruppen-Videoanruf gestartet',
  '{name} started a group call': '{name} hat einen Gruppenanruf gestartet',
  'Waiting for others · {time}': 'Warten auf die anderen · {time}',
  'Missed group call': 'Verpasster Gruppenanruf',
  'Could not open the microphone': 'Das Mikrofon ließ sich nicht öffnen',
  'Pictures pause with more than {n} in the call': 'Bilder pausieren bei mehr als {n} im Anruf',
  'Group video call · end-to-end encrypted': 'Gruppen-Videoanruf · Ende-zu-Ende-verschlüsselt',
  'Group voice call · end-to-end encrypted': 'Gruppen-Sprachanruf · Ende-zu-Ende-verschlüsselt',
  'In the call': 'Im Anruf',
  Join: 'Beitreten',
  '{name} tried to call. Accept their message request to take calls from them.':
    '{name} hat versucht, dich anzurufen. Nimm die Nachrichtenanfrage an, um Anrufe von diesem Kontakt anzunehmen.',
  'The call ended.': 'Der Anruf ist zu Ende.',
  'The call has ended.': 'Der Anruf wurde beendet.',
  'Calls are set up through the server. Type its address in Server first.': 'Anrufe werden über den Server aufgebaut. Gib zuerst seine Adresse unter „Server“ ein.',

  // The web app's card (components/integrity-card.tsx, lib/integrity.web.ts).
  'This web app': 'Diese Web-App',
  'Release {version}, checked': 'Version {version}, geprüft',
  'Not checked: no service worker runs Erevos here': 'Nicht geprüft: Hier führt kein Service Worker Erevos aus',
  "Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is":
    'Erevos führt nur Code aus, der mit seinem Release-Schlüssel signiert ist, und dieser ist auf diesem Gerät gespeichert. Der Fingerabdruck des Schlüssels ist',
  '. It must match the one you were given with the address of this server.': '. Er muss zu dem passen, den du mit der Adresse dieses Servers bekommen hast.',
  'Release {version} is checked and starts the next time Erevos opens.': 'Version {version} ist geprüft und startet beim nächsten Öffnen von Erevos.',
  'Last looked for updates {when}.': 'Zuletzt nach Updates gesucht: {when}.',
  'Refused:': 'Abgelehnt:',
  'Looking…': 'Suche…',
  'Look for an update': 'Nach Update suchen',
  'Notifications while closed': 'Benachrichtigungen, wenn geschlossen',
  'On in this space': 'In diesem Bereich an',
  'Off in this space': 'In diesem Bereich aus',
  'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.':
    'Kommen Nachrichten oder klingelt ein Anruf, während Erevos geschlossen ist, sendet dein Server einen Push über den Push-Dienst dieses Browsers (auf einem iPhone den von Apple), und Erevos zeigt, wie viele Nachrichten seit dem letzten Öffnen gekommen sind, etwa „3 neue Nachrichten“, oder „Anruf“, wenn nur ein Anruf geklingelt hat, mehr nicht. Der Push enthält weder Nachricht noch Absender, und die Anzahl darin ist für diesen Browser verschlüsselt, aber der Push-Dienst sieht, wann etwas für dieses Gerät kommt und dass es Erevos nutzt. Ist ein Server oder das Erevos eines Absenders älter als 2.0.0 oder haben andere Telefone eine Nachricht zum Server gebracht, gibt es keine Zahl: Dann zeigt Erevos „Neue Nachricht“ oder, wenn mehr gekommen sind, „Neue Nachrichten“, bis du es öffnest. Versteckte Chats bekommen nie Benachrichtigungen. Jeder Bereich, der sie einschaltet, hat eine eigene Push-Adresse, sodass die Adresse zwei Bereiche bei ihrem Server nicht miteinander verbindet.',
  'Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.':
    'Dein Server konnte noch nicht informiert werden, also können noch Benachrichtigungen kommen. Erevos holt das nach, sobald es den Server erreicht.',
  'A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.':
    'Ein Anruf, der kommt, während Erevos geschlossen ist, klingelt nicht: Es erscheint nur die Benachrichtigung „Anruf“. Auf einem iPhone geht nicht mehr: Apple lässt eine Web-App weder laufen, solange sie geschlossen ist, noch wie ein Telefon klingeln; dafür bräuchte es eine App aus dem App Store. Unter Android klingelt die Erevos-App auch geschlossen.',
  "Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.":
    "Jeder Bereich, bei dem sie an sind, hat einen eigenen Service Worker in diesem Browser, den seine Einstellungen auflisten: Wer sie sehen kann, kann die Bereiche mit Benachrichtigungen zählen. Eine Nachrichtenanfrage von jemand Neuem über deinen Kontaktlink erscheint vielleicht erst, wenn Erevos geöffnet wird.",
  'Turn off': 'Ausschalten',
  'Turn on': 'Einschalten',
  'Erevos was tampered with': 'Erevos wurde manipuliert',
  'The server sent this device a new service worker, the part of Erevos that checks its code, and no signed release lists it. Erevos goes on with the checked code while it is open, but once it is closed the browser may start the new one, which could show a fake Erevos. Do not open Erevos from this server again, and do not type your passwords into it, until whoever runs the server knows why. Your chats stay sealed with your password.':
    'Der Server hat diesem Gerät einen neuen Service Worker geschickt, den Teil von Erevos, der seinen Code prüft, und keine signierte Version führt ihn auf. Erevos läuft mit dem geprüften Code weiter, solange es offen ist, aber sobald es geschlossen ist, kann der Browser den neuen starten, der ein gefälschtes Erevos zeigen könnte. Öffne Erevos nicht wieder von diesem Server und gib dort keine Passwörter ein, bis der Betreiber des Servers weiß, warum. Deine Chats bleiben mit deinem Passwort versiegelt.',
  'I understand': 'Verstanden',
  'Update refused': 'Update abgelehnt',
  '{reason} Erevos keeps the release it has. Settings → Privacy and security → This web app shows what was refused.':
    '{reason} Erevos behält seine bisherige Version. Unter „Einstellungen → Datenschutz und Sicherheit → Diese Web-App“ steht, was abgelehnt wurde.',

  // Files and photos (lib/attachments.ts, lib/photo*.ts, lib/pick-*.ts, lib/save-file*.ts, lib/backup-place.web.ts).
  'Files can be 100 MB at most.': 'Dateien dürfen höchstens 100 MB groß sein.',
  'The file was changed on the way, so it was not kept.': 'Die Datei wurde unterwegs verändert und deshalb nicht gespeichert.',
  'The file is not on the server any more. Files wait there 14 days.': 'Die Datei ist nicht mehr auf dem Server. Dateien warten dort 14 Tage.',
  'This file is not on this phone.': 'Diese Datei ist nicht auf diesem Telefon.',
  'This file is not on this computer.': 'Diese Datei ist nicht auf diesem Computer.',
  // Shown after "in", as „in {folder}“: in the dative, with its article.
  'the place you chose': 'dem gewählten Ort',
  'the downloads folder': 'dem Download-Ordner',
  'Not saved: the share sheet was closed.': 'Nicht gespeichert: Das Teilen-Menü wurde geschlossen.',
  'That folder is not there any more. Choose it again.': 'Diesen Ordner gibt es nicht mehr. Wähle ihn erneut.',
  // A backup that a folder did not take, in plain words (lib/backup-place.ts folderTrouble).
  'The app this folder belongs to made no file in it. Choose a folder on the phone instead, or try again later.':
    'Die App, zu der dieser Ordner gehört, hat dort keine Datei angelegt. Wähle stattdessen einen Ordner auf dem Telefon oder versuche es später noch einmal.',
  'Erevos may no longer write in this folder. Choose it again.': 'Erevos darf in diesem Ordner möglicherweise nicht mehr schreiben. Wähle ihn erneut.',
  'There is no room left in this folder. Make room, or choose another one.': 'In diesem Ordner ist kein Platz mehr. Schaffe Platz oder wähle einen anderen.',
  'The backup could not be written in this folder: {reason}': 'Das Backup konnte nicht in diesem Ordner gespeichert werden: {reason}',
  'Ready to save.': 'Bereit zum Speichern.',
  Original: 'Original',
  'Original: the photo as it was, full size, with only its place, phone and time taken out.':
    'Original: das Foto, wie es war, in voller Größe, nur ohne Ort, Telefon und Aufnahmezeit.',
  '{quality}%: a new, smaller photo, quicker to send. It says nothing but its picture.':
    '{quality} %: ein neues, kleineres Foto, schneller gesendet. Es verrät nichts außer seinem Bild.',
  'This photo does not get small enough for an MMS.': 'Dieses Foto wird nicht klein genug für eine MMS.',
  'Erevos may not use the camera. Allow it in the phone settings to take photos.': 'Erevos darf die Kamera nicht nutzen. Erlaube es in den Einstellungen des Telefons, um Fotos aufzunehmen.',
  'Voice message': 'Sprachnachricht',
  Sticker: 'Sticker',
  'File: {name}': 'Datei: {name}',
  'That voice message is too long.': 'Diese Sprachnachricht ist zu lang.',

  // When a message or an SMS sent for later goes (components/later-picker.tsx, lib/later.ts).
  'In 1 hour': 'In 1 Stunde',
  'Tonight 20:00': 'Heute Abend 20:00',
  'Tomorrow 09:00': 'Morgen 09:00',
  Day: 'Tag',
  Hour: 'Stunde',
  Minutes: 'Minuten',
  'Goes on {when}.': 'Wird am {when} gesendet.',
  'That time has gone by. Choose one ahead.': 'Diese Zeit ist vorbei. Wähle eine spätere.',
  'At most a year ahead.': 'Höchstens ein Jahr im Voraus.',
  // The home screen's list (lib/inbox.ts).
  'You: {text}': 'Du: {text}',
  Sun: 'So',
  Mon: 'Mo',
  Tue: 'Di',
  Wed: 'Mi',
  Thu: 'Do',
  Fri: 'Fr',
  Sat: 'Sa',

  // Contacts and chats (lib/e2e.ts, lib/space-chats.ts, lock/).
  "That is this chat's own contact link.": 'Das ist dein eigener Kontaktlink.',
  'That code has no key. Ask for their contact link or QR code from this version of Erevos.':
    'Dieser Code enthält keinen Schlüssel. Bitte um einen Kontaktlink oder QR-Code aus dieser Version von Erevos.',
  'No such contact.': 'Diesen Kontakt gibt es nicht.',
  'Not a contact.': 'Kein Kontakt.',
  'That is not a phone number.': 'Das ist keine Telefonnummer.',
  'Not a time Erevos keeps messages for.': 'So lange hebt Erevos keine Nachrichten auf.',
  'No conversation with this contact.': 'Keine Unterhaltung mit diesem Kontakt.',
  'That contact uses the server at {relay}, and its link has no key for it. Ask them for a new link.':
    'Dieser Kontakt nutzt den Server unter {relay}, und sein Link enthält keinen Schlüssel dafür. Bitte um einen neuen Link.',
  'Wrong password for this backup.': 'Falsches Passwort für dieses Backup.',

  // Groups (lib/groups.ts, lib/space-groups.ts).
  'No groups here yet.': 'Hier gibt es noch keine Gruppen.',
  'Give the group a name.': 'Gib der Gruppe einen Namen.',
  'You made the group.': 'Du hast die Gruppe erstellt.',
  'Only the group’s admin adds members.': 'Nur der Admin der Gruppe fügt Mitglieder hinzu.',
  'You are not in this group any more.': 'Du bist nicht mehr in dieser Gruppe.',
  'Only the group’s admin renames it.': 'Nur der Admin der Gruppe kann sie umbenennen.',
  'Only the group’s admin takes members out.': 'Nur der Admin der Gruppe entfernt Mitglieder.',
  'You closed the group.': 'Du hast die Gruppe geschlossen.',
  'You asked to leave. The group closes here once the admin takes you out.': 'Du hast gebeten, die Gruppe zu verlassen. Sie wird hier geschlossen, sobald der Admin dich entfernt.',
  'You left the group.': 'Du hast die Gruppe verlassen.',
  'You are no longer in the group.': 'Du bist nicht mehr in der Gruppe.',
  'member {id}': 'Mitglied {id}',
  '{who} added you to the group.': '{who} hat dich zur Gruppe hinzugefügt.',
  '{who} joined.': '{who} ist beigetreten.',
  '{who} left.': '{who} hat die Gruppe verlassen.',
  'You asked {who} for their contact link.': 'Du hast {who} nach dem Kontaktlink gefragt.',
  '{who} asked for your contact link.': '{who} hat nach deinem Kontaktlink gefragt.',
  'You sent {who} your contact link. You are each other’s contacts now.':
    'Du hast {who} deinen Kontaktlink geschickt. Jetzt habt ihr euch gegenseitig als Kontakte.',
  '{who} sent their contact link. You are each other’s contacts now.': '{who} hat den Kontaktlink geschickt. Jetzt habt ihr euch gegenseitig als Kontakte.',
  '{who} could not be added as a contact.': '{who} konnte nicht als Kontakt hinzugefügt werden.',
  'Ask for contact links on the phone that holds this account.': 'Frag auf dem Telefon, das dieses Konto hat, nach Kontaktlinks.',
  'They are not in this group any more.': 'Dieses Mitglied ist nicht mehr in der Gruppe.',
  'Not in public groups.': 'Nicht in öffentlichen Gruppen.',
  'More than one member of this group shows this key, so one of them is not who they say. Ask for their contact link some other way.':
    'Mehr als ein Mitglied dieser Gruppe zeigt diesen Schlüssel, also ist eines davon nicht, wer es vorgibt zu sein. Frag auf anderem Weg nach dem Kontaktlink.',
  'Another space is open now.': 'Jetzt ist ein anderer Bereich offen.',
  'Groups go through the server. Type its address in Server first.': 'Gruppen laufen über den Server. Gib zuerst seine Adresse unter „Server“ ein.',

  // The build and updates (lib/core.ts, lib/crypto.ts, lib/install-update*.ts, lib/updates.ts, lib/shell.ts).
  'This build has no Erevos core, so it cannot encrypt. Rebuild the app.': 'Diese Version hat keinen Erevos-Kern und kann deshalb nicht verschlüsseln. Baue die App neu.',
  'The Erevos core gave back something unexpected.': 'Der Erevos-Kern hat etwas Unerwartetes zurückgegeben.',
  'This build of Erevos has no Tor.': 'Diese Version von Erevos hat kein Tor.',
  'This build of Erevos has no Nostr.': 'Diese Version von Erevos hat kein Nostr.',
  'This build has no secure random source. Rebuild the app so it includes expo-crypto.':
    'Diese Version hat keine sichere Zufallsquelle. Baue die App so neu, dass sie expo-crypto enthält.',
  'This release has no Android package.': 'Diese Version hat kein Android-Paket.',
  'The download was cut short.': 'Der Download wurde abgebrochen.',
  'The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.':
    'Der Download ist bei jedem Versuch stehen geblieben, weil die Verbindung eine Weile nichts brachte. Es wurde nichts installiert: Versuche es später noch einmal oder in einem anderen Netz.',
  'Show what is typed': 'Eingabe anzeigen',
  'Hide what is typed': 'Eingabe verbergen',
  'The downloaded package is not the one the release published. Nothing was installed.':
    'Das heruntergeladene Paket ist nicht das, das mit der Version veröffentlicht wurde. Es wurde nichts installiert.',
  'This version installs from the download page.': 'Diese Version wird über die Download-Seite installiert.',
  'GitHub answered {status}.': 'GitHub hat mit {status} geantwortet.',
  "The web app's server answered {status}.": 'Der Server der Web-App antwortete {status}.',
  'The desktop app answered {status}.': 'Die Desktop-App hat mit {status} geantwortet.',
  'There is no room left on this device. Free some space and try again.': 'Auf diesem Gerät ist kein Platz mehr. Gib etwas Speicher frei und versuche es noch einmal.',
  'This computer has no keyring to seal Erevos’s keys with, so Erevos keeps none. Start a keyring (KWallet, or GNOME Keyring with --password-store=gnome-libsecret), or start Erevos with --plain-secrets to keep them unsealed, readable by your user, and set a password lock.': 'Dieser Computer hat keinen Schlüsselbund, um die Schlüssel von Erevos zu versiegeln, also bewahrt Erevos keine auf. Starte einen Schlüsselbund (KWallet, oder GNOME Keyring mit --password-store=gnome-libsecret), oder starte Erevos mit --plain-secrets, um sie unversiegelt und für deinen Benutzer lesbar aufzubewahren, und richte eine Passwortsperre ein.',
  'The browser did not open its storage.': 'Der Browser hat seinen Speicher nicht geöffnet.',

  // LoRa and nearby phones (lib/lora.ts, lib/nearby.ts).
  'The radio restarts with its new settings, and links again.': 'Das Funkgerät startet mit seinen neuen Einstellungen neu und verbindet sich wieder.',
  'There is no server, and no Erevos phone is linked nearby. Type the server address in Server, or come near their phone.':
    'Es gibt keinen Server, und kein Erevos-Telefon in der Nähe ist verbunden. Gib die Serveradresse unter „Server“ ein oder geh in die Nähe des anderen Telefons.',
  'Too large for LoRa, which takes only text. It can go once the server can be reached, or near their phone.':
    'Zu groß für LoRa, das nur Text überträgt. Es kann gesendet werden, sobald der Server erreichbar ist, oder in der Nähe des anderen Telefons.',

  // The relay (lib/relay.ts, lib/sms-invite.ts); {what} is the request's name.
  'An id is 48 hex characters.': 'Eine ID hat 48 Hex-Zeichen.',
  'Through Tor: {reason}': 'Über Tor: {reason}',
  'cannot reach the server at {url}, or the token is wrong': 'der Server unter {url} ist nicht erreichbar, oder das Token ist falsch',
  'message is not held': 'die Nachricht wird nicht aufgehoben',
  'the server at {url} cannot keep messages for later: update it': 'der Server unter {url} kann keine Nachrichten für später aufheben: Aktualisiere ihn',
  'The server at {url} that keeps it is no longer set here.': 'Der Server unter {url}, der sie aufhebt, ist hier nicht mehr eingestellt.',
  'the server closed the connection': 'der Server hat die Verbindung geschlossen',
  'the server did not answer in time': 'der Server hat nicht rechtzeitig geantwortet',
  'lost the connection to the server': 'die Verbindung zum Server ist abgerissen',
  '{what}: queue not found': '{what}: Warteschlange nicht gefunden',
  '{what}: queue is full': '{what}: Warteschlange ist voll',
  '{what}: your free place on this server has used all it may today. It goes on tomorrow.': '{what}: Dein kostenloser Platz auf diesem Server hat heute alles verbraucht, was er darf. Morgen geht es weiter.',
  '{what}: the server could not save it, try again later': '{what}: Der Server konnte sie nicht speichern, versuche es später erneut',
  '{what}: the second server could not reach your server, try again later': '{what}: Der zweite Server hat deinen Server nicht erreicht, versuche es später erneut',
  '{what}: the file is not on the server any more': '{what}: Die Datei ist nicht mehr auf dem Server',
  '{what}: the server has no room for files now, try again later': '{what}: Der Server hat gerade keinen Platz für Dateien, versuche es später erneut',
  '{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.': '{what}: Dein kostenloser Platz auf diesem Server hat heute so viele Dateien übertragen, wie er darf. Morgen gehen wieder Dateien.',
  '{what}: the server could not keep it, try again later': '{what}: Der Server konnte sie nicht aufheben, versuche es später erneut',
  '{what}: your server could not reach the server the file is on': '{what}: Dein Server hat den Server mit der Datei nicht erreicht',
  '{reason}. A server older than this app cannot take files: update it.': '{reason}. Ein Server, der älter als diese App ist, nimmt keine Dateien an: Aktualisiere ihn.',
  'message is too large': 'die Nachricht ist zu groß',
  'your server has no key for two-hop sending, so it was not sent through the second server':
    'dein Server hat keinen Schlüssel für das Senden über zwei Stationen, deshalb ging sie nicht über den zweiten Server',
  'the link has given all its places on its server. Ask them for a new link': 'der Link hat schon alle seine Plätze auf seinem Server vergeben. Bitte um einen neuen Link',
  'The server address is too long for an SMS invite.': 'Die Serveradresse ist zu lang für eine SMS-Einladung.',

  // Notifications in the web app (lib/web-push*.ts).
  'Notifications through the browser are for the web app.': 'Benachrichtigungen über den Browser gibt es nur für die Web-App.',
  'Your server does not send notifications. It needs a newer version, set up with a push key.':
    'Dein Server sendet keine Benachrichtigungen. Er braucht eine neuere Version, eingerichtet mit einem Push-Schlüssel.',
  'This browser cannot show notifications for a closed web app. On an iPhone, add Erevos to the home screen first.':
    'Dieser Browser kann für eine geschlossene Web-App keine Benachrichtigungen zeigen. Füge Erevos auf einem iPhone zuerst zum Home-Bildschirm hinzu.',
  'Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.':
    'Benachrichtigungen sind für Erevos nicht erlaubt. Erlaube sie in den Einstellungen dieses Browsers oder Telefons.',
  'Set up the server first, under Server.': 'Richte zuerst den Server ein, unter „Server“.',
  'Notifications could not be turned on: {reason}': 'Benachrichtigungen ließen sich nicht einschalten: {reason}',
  // Calls' lines in a chat (lib/call-lines.ts).
  'Voice call': 'Sprachanruf',
  'Video call': 'Videoanruf',
  'Group call': 'Gruppenanruf',
  'Group video call': 'Gruppen-Videoanruf',
  'Missed voice call': 'Verpasster Sprachanruf',
  'Missed video call': 'Verpasster Videoanruf',
  'Missed group video call': 'Verpasster Gruppen-Videoanruf',
  '{missed}, while in another call': '{missed}, während eines anderen Anrufs',
  'turned down': 'abgelehnt',
  'could not connect': 'kam nicht zustande',
  'they were in another call': 'war in einem anderen Anruf',
  'not answered': 'nicht angenommen',
  'Only {given} of the {all} files went to the downloads, so they are not all saved.': 'Nur {given} der {all} Dateien gingen in die Downloads, also sind nicht alle gespeichert.',
  'Save the files': 'Die Dateien speichern',
  '{given} of the {all} files went to the downloads. Tap Save for the next one: {name}': '{given} der {all} Dateien gingen in die Downloads. Tippe auf Speichern für die nächste: {name}',
  "The browser did not keep it.": "Der Browser hat es nicht behalten.",
  "New device of {who}: your messages go to it too.": "Neues Gerät von {who}: deine Nachrichten gehen auch dorthin.",
  "A device of {who} changed its key: your messages do not go to it.": "Ein Gerät von {who} hat seinen Schlüssel geändert: deine Nachrichten gehen nicht dorthin.",
};
