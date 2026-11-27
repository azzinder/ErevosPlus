// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of linked devices: the account on the phone and on a computer (lib/devices.ts, app/devices.tsx; i18n/de/index.ts).
export const devices: Record<string, string> = {
  // Linking and the links (lib/devices.ts).
  Computer: 'Computer',
  'Linked devices could not open.': 'Verknüpfte Geräte ließen sich nicht öffnen.',
  'That device is linked already.': 'Dieses Gerät ist schon verknüpft.',
  'That is not a code from Linked devices.': 'Das ist kein Code aus „Verknüpfte Geräte“.',
  'The code changed. Compare it again.': 'Der Code hat sich geändert. Vergleiche ihn erneut.',
  'This device is no longer linked to a phone.': 'Dieses Gerät ist nicht mehr mit einem Telefon verknüpft.',
  'This is a linked device. Link from the phone that holds the account.': 'Das ist ein verknüpftes Gerät. Verknüpfe von dem Telefon aus, das das Konto hat.',
  'This space has chats of its own. Link from a space with none, such as one that opens with a new password.':
    'Dieser Bereich hat eigene Chats. Verknüpfe aus einem Bereich ohne Chats, etwa einem, der sich mit einem neuen Passwort öffnet.',
  'This space is linked already.': 'Dieser Bereich ist schon verknüpft.',
  'These hidden chats are linked already.': 'Diese versteckten Chats sind schon verknüpft.',
  'These hidden chats have chats of their own. Link from hidden chats with none, such as those a new PIN sets.':
    'Diese versteckten Chats haben eigene Chats. Verknüpfe von versteckten Chats ohne welche aus, etwa denen, die eine neue PIN anlegt.',
  'Too long to go through the phone.': 'Zu lang, um über das Telefon zu gehen.',
  'Type the server address in Server first: linked devices reach this phone through it.':
    'Gib zuerst die Serveradresse unter „Server“ ein: Verknüpfte Geräte erreichen dieses Telefon darüber.',
  '{n} devices are linked already, the most there can be.': 'Es sind schon {n} Geräte verknüpft, mehr geht nicht.',

  // The menu, and the chat on a linked device (app/index.tsx, app/chat.tsx).
  'Linked devices': 'Verknüpfte Geräte',
  'Not sent by the phone': 'Nicht vom Telefon gesendet',
  'These chats came from a linked device’s backup: you can read them here, but not write in them. To write, link this device to the phone again, in Linked devices.':
    'Diese Chats stammen aus der Sicherung eines verknüpften Geräts: Du kannst sie hier lesen, aber nicht darin schreiben. Um zu schreiben, verknüpfe dieses Gerät unter „Verknüpfte Geräte“ wieder mit dem Telefon.',
  'This account on a computer or in a browser too': 'Dieses Konto auch auf einem Computer oder im Browser',
  "This chat is the phone's: move it into hidden chats there.": 'Dieser Chat gehört dem Telefon: Verschiebe ihn dort in die versteckten Chats.',
  'These hidden chats are linked to a phone: move the chat into them there.':
    'Diese versteckten Chats sind mit einem Telefon verknüpft: Verschiebe den Chat dort in sie.',
  "This chat is the phone's: move it out of the hidden chats there.": 'Dieser Chat gehört dem Telefon: Verschiebe ihn dort aus den versteckten Chats.',

  // A call answered on another device of the account (components/call-screen.tsx, lib/call-lines.ts).
  'Answered on another device': 'Auf einem anderen Gerät angenommen',
  'answered on another device': 'auf einem anderen Gerät angenommen',

  // Linked devices (app/devices.tsx).
  'All of it': 'Alle',
  'The last month': 'Den letzten Monat',
  'The last week': 'Die letzte Woche',
  None: 'Keine',
  'Web browser': 'Webbrowser',
  'Code copied. Paste it on the phone in Settings → Data and devices → Linked devices.': 'Code kopiert. Füge ihn auf dem Telefon unter „Einstellungen → Daten und Geräte → Verknüpfte Geräte“ ein.',
  'Code copied. Paste it on the phone, in Linked devices of the same hidden chats.':
    'Code kopiert. Füge ihn auf dem Telefon unter „Verknüpfte Geräte“ derselben versteckten Chats ein.',
  'Linked. The chats come from the phone, and with them the messages it chose to bring over.':
    'Verknüpft. Die Chats kommen vom Telefon, und mit ihnen die Nachrichten, die dort zum Übertragen gewählt wurden.',
  'Not linked. Someone else may have read the code. Make a new one, and link again.':
    'Nicht verknüpft. Vielleicht hat jemand anderes den Code gelesen. Erstelle einen neuen und verknüpfe erneut.',
  'Now the computer shows a code too. If it is {code}, tap They match there.': 'Jetzt zeigt auch der Computer einen Code. Wenn es {code} ist, tippe dort auf „Stimmen überein“.',
  'Unlink this device': 'Dieses Gerät trennen',
  'Unlink {name}': '{name} trennen',
  "The account's chats leave this device, messages and all, and so do the accounts it brought over from the phone. The phone keeps them.":
    'Die Chats des Kontos verschwinden von diesem Gerät, samt Nachrichten, und ebenso die Konten, die es vom Telefon übernommen hat. Das Telefon behält sie.',
  'Nothing more goes to it, and nothing it sends is taken. What it has stays on it, behind its own lock.':
    'Es geht nichts mehr dorthin, und nichts, was es sendet, wird angenommen. Was es hat, bleibt darauf, hinter seiner eigenen Sperre.',
  'Unlinked.': 'Getrennt.',
  'Unlinked here. The phone was not told: unlink this device there too.': 'Hier getrennt. Das Telefon hat es nicht erfahren: Trenne dieses Gerät auch dort.',
  'Unlinked. The device was not told, and gets nothing more.': 'Getrennt. Das Gerät hat es nicht erfahren und bekommt nichts mehr.',
  'The messages go to it now. What it has already is not kept twice.': 'Die Nachrichten gehen jetzt dorthin. Was es schon hat, wird nicht doppelt gespeichert.',
  'Messages to bring over': 'Nachrichten zum Übertragen',
  'Photos and files too': 'Auch Fotos und Dateien',
  'Linked to {name}': 'Verknüpft mit {name}',
  'Since {when}. Last heard from {last}.': 'Seit {when}. Zuletzt gemeldet: {last}.',
  'This device has the chats and groups of the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server. Calls ring here too. New groups, public groups and group calls stay on the phone for now.':
    'Dieses Gerät hat die Chats und Gruppen des Telefons, das das Konto hat. Was du hier schreibst, geht über das Telefon, das an sein und der Server erreichen muss. Anrufe klingeln auch hier. Neue Gruppen, öffentliche Gruppen und Gruppenanrufe bleiben vorerst auf dem Telefon.',
  'These hidden chats have the chats and groups of the same hidden chats on the phone that holds the account. What you write here goes through the phone, which has to be on and reach the server, with these hidden chats open or receiving while closed there. Calls ring here too. New groups and group calls stay on the phone for now.':
    'Diese versteckten Chats haben die Chats und Gruppen derselben versteckten Chats auf dem Telefon, das das Konto hat. Was du hier schreibst, geht über das Telefon, das an sein und der Server erreichen muss, mit diesen versteckten Chats dort offen oder auf Empfang, wenn geschlossen. Anrufe klingeln auch hier. Neue Gruppen und Gruppenanrufe bleiben vorerst auf dem Telefon.',
  'Make or join groups on the phone that holds this account.': 'Erstelle Gruppen oder tritt ihnen auf dem Telefon bei, das dieses Konto hat.',
  'Group calls ring on the phone that holds this account, for now. Call from there.':
    'Gruppenanrufe klingeln vorerst auf dem Telefon, das dieses Konto hat. Ruf von dort an.',
  'The same account on a computer or in a browser. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Hidden chats and what a second password opens never go with it: each links on its own, from inside it.':
    'Dasselbe Konto auf einem Computer oder im Browser. Das Konto bleibt das Telefon: Es gibt Ende-zu-Ende-verschlüsselt weiter, was ankommt und was der Computer schreibt, Kontakte sehen also nichts Neues. Versteckte Chats und was ein zweites Passwort öffnet, gehen nie mit: Jedes wird für sich verknüpft, von innen.',
  'These hidden chats on a computer or in a browser, linked on their own. The phone stays the account: it passes on, end-to-end encrypted, what comes and what the computer writes, so contacts see nothing new. Nothing of it shows in the space, nor goes to its linked devices.':
    'Diese versteckten Chats auf einem Computer oder im Browser, für sich verknüpft. Das Konto bleibt das Telefon: Es gibt Ende-zu-Ende-verschlüsselt weiter, was ankommt und was der Computer schreibt, Kontakte sehen also nichts Neues. Nichts davon zeigt sich im Bereich oder geht an seine verknüpften Geräte.',
  'Link {name}': '{name} verknüpfen',
  'Once you tap Link, the computer shows this code. Link only if it shows the same:': 'Sobald du auf „Verknüpfen“ tippst, zeigt der Computer diesen Code. Verknüpfe nur, wenn er denselben zeigt:',
  Link: 'Verknüpfen',
  Devices: 'Geräte',
  'Linked {when}. Last heard from {last}.': 'Verknüpft am {when}. Zuletzt gemeldet: {last}.',
  'Linked {when}.': 'Verknüpft am {when}.',
  'Waiting for They match to be tapped on it.': 'Wartet darauf, dass dort „Stimmen überein“ angetippt wird.',
  'Bringing over messages: {n} so far.': 'Nachrichten werden übertragen: bisher {n}.',
  'Bring over': 'Übertragen',
  'Bring over messages again': 'Nachrichten erneut übertragen',
  'Signed in as {name}: this device has a token of its own there. Now tap Link to my phone.':
    'Angemeldet als {name}: Dieses Gerät hat dort ein eigenes Token. Tippe jetzt auf „Mit meinem Telefon verknüpfen“.',
  'Link a computer to this phone': 'Einen Computer mit diesem Telefon verknüpfen',
  "On the computer, open Settings → Data and devices → Linked devices → Link to my phone. Then scan its code with this phone's camera, or copy it there and paste it here.":
    'Öffne auf dem Computer „Einstellungen → Daten und Geräte → Verknüpfte Geräte → Mit meinem Telefon verknüpfen“. Scanne dann seinen Code mit der Kamera dieses Telefons, oder kopiere ihn dort und füge ihn hier ein.',
  "On the computer, open the same hidden chats with their PIN, then Linked devices → Link to my phone in them. Then scan its code with this phone's camera while these hidden chats are open, or copy it there and paste it here.":
    'Öffne auf dem Computer dieselben versteckten Chats mit ihrer PIN, dann darin „Verknüpfte Geräte → Mit meinem Telefon verknüpfen“. Scanne dann seinen Code mit der Kamera dieses Telefons, während diese versteckten Chats offen sind, oder kopiere ihn dort und füge ihn hier ein.',
  'Code from the computer': 'Code vom Computer',
  Next: 'Weiter',
  'Link to my phone': 'Mit meinem Telefon verknüpfen',
  'The phone read the code. Does it show this one too?': 'Das Telefon hat den Code gelesen. Zeigt es auch diesen?',
  'They match': 'Stimmen überein',
  'They differ': 'Stimmen nicht überein',
  'On the phone that holds the account, scan this code with the camera, or paste it in Settings → Data and devices → Linked devices. This space must have no chats of its own.':
    'Scanne diesen Code auf dem Telefon, das das Konto hat, mit der Kamera, oder füge ihn dort unter „Einstellungen → Daten und Geräte → Verknüpfte Geräte“ ein. Dieser Bereich darf keine eigenen Chats haben.',
  'On the phone that holds the account, open the same hidden chats with their PIN, then scan this code with the camera, or paste it in Linked devices in them. These hidden chats must have no chats of their own.':
    'Öffne auf dem Telefon, das das Konto hat, dieselben versteckten Chats mit ihrer PIN, scanne dann diesen Code mit der Kamera oder füge ihn dort unter „Verknüpfte Geräte“ ein. Diese versteckten Chats dürfen keine eigenen Chats haben.',
  'Copy the code': 'Code kopieren',
  'Share the code': 'Code teilen',
  'Waiting for the phone. The code works for half an hour.': 'Wartet auf das Telefon. Der Code gilt eine halbe Stunde.',
  'Use this when this device is the computer: its chats become those of the phone that holds the account.':
    'Nutze das, wenn dieses Gerät der Computer ist: Seine Chats werden die des Telefons, das das Konto hat.',
  'Use this when this device is the computer: these hidden chats become those of the same hidden chats on the phone that holds the account.':
    'Nutze das, wenn dieses Gerät der Computer ist: Diese versteckten Chats werden zu denselben versteckten Chats des Telefons, das das Konto hat.',
  'These hidden chats have no server queue yet: in them, type the server address under For advanced users, then create their queue.':
    'Diese versteckten Chats haben noch keine Warteschlange auf dem Server: Gib in ihnen die Adresse des Servers unter „Für Fortgeschrittene“ ein und lege dann ihre Warteschlange an.',
  'The phone answers on a queue of this device on a server: the one the phone uses, or any other. If the server asks for a token, sign in when it offers that, or type one.':
    'Das Telefon antwortet in einer Warteschlange dieses Geräts auf einem Server: dem, den das Telefon nutzt, oder einem anderen. Wenn der Server ein Token braucht, melde dich an, sobald er das anbietet, oder gib eines ein.',
  'Name of this device': 'Name dieses Geräts',
  'Tap Link to my phone, and a QR code for the phone shows here.':
    'Tippe auf „Mit meinem Telefon verknüpfen“, und ein QR-Code für das Telefon erscheint hier.',
  'Send the accounts to {name}': 'Konten an {name} senden',
  "This space's Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Die Matrix-, XMPP- und Nostr-Konten dieses Bereichs gehen Ende-zu-Ende-verschlüsselt dorthin, und es meldet sich bei jedem als neues Gerät an. Sobald es getrennt wird, meldet es sich von ihnen ab.',
  "These hidden chats' own Matrix, XMPP and Nostr accounts go to it, end-to-end encrypted, into the same hidden chats there, and it signs in to each as a new device. Once unlinked, it signs out of them.":
    'Die eigenen Matrix-, XMPP- und Nostr-Konten dieser versteckten Chats gehen Ende-zu-Ende-verschlüsselt an es, in dieselben versteckten Chats dort, und es meldet sich bei jedem als neues Gerät an. Sobald es nicht mehr verknüpft ist, meldet es sich von ihnen ab.',
  'Sent to {name}: {accounts}.': 'An {name} gesendet: {accounts}.',
  'Nothing went: this space has no Matrix, XMPP or Nostr account, or too much waits for that device already.':
    'Es wurde nichts gesendet: Dieser Bereich hat kein Matrix-, XMPP- oder Nostr-Konto, oder für dieses Gerät wartet schon zu viel.',
  'Nothing went: these hidden chats have no Matrix, XMPP or Nostr account of their own, or too much waits for that device already.':
    'Nichts gesendet: Diese versteckten Chats haben kein eigenes Matrix-, XMPP- oder Nostr-Konto, oder für dieses Gerät wartet schon zu viel.',
  'Accounts from the phone': 'Konten vom Telefon',
  'Matrix: {id}, signed in here as a new device.': 'Matrix: {id}, hier als neues Gerät angemeldet.',
  'Matrix: sign in to {id} here once, with its password. Its keys come from the phone, so no Security Key or check by emoji is needed.':
    'Matrix: Melde dich hier einmal mit dem Passwort bei {id} an. Die Schlüssel kommen vom Telefon, also ist weder ein Sicherheitsschlüssel noch eine Prüfung per Emoji nötig.',
  'Sign in to Matrix': 'Bei Matrix anmelden',
  'XMPP: {id}, signed in here as a new device.': 'XMPP: {id}, hier als neues Gerät angemeldet.',
  'Nostr: the key of the Nostr chats is here too.': 'Nostr: Der Schlüssel der Nostr-Chats ist auch hier.',
  'Not brought over yet: {accounts}. Tried again each time this space opens.':
    'Noch nicht übertragen: {accounts}. Wird bei jedem Öffnen dieses Bereichs erneut versucht.',
  'Not brought over yet: {accounts}. Tried again each time these hidden chats open.':
    'Noch nicht übertragen: {accounts}. Wird bei jedem Öffnen dieser versteckten Chats erneut versucht.',
  'Once this device is unlinked, it signs out of the accounts it brought over.':
    'Sobald dieses Gerät getrennt wird, meldet es sich von den Konten ab, die es vom Telefon übernommen hat.',
  'Send the accounts': 'Konten senden',
  'Same settings on every device': 'Gleiche Einstellungen auf allen Geräten',
  'The language, the look and Last seen change on the other devices too. A photo behind the screens, passwords, PINs and what is about this device alone stay as they are on each.':
    'Sprache, Aussehen und Zuletzt online ändern sich auch auf den anderen Geräten. Ein Foto hinter den Bildschirmen, Passwörter, PINs und was nur dieses Gerät betrifft, bleiben auf jedem, wie sie sind.',
  "The groups come back to this phone once the device that holds them hears it.": "Die Gruppen kommen auf dieses Telefon zurück, sobald das Gerät, das sie hat, es erfährt.",
  "The groups go to {name} once it hears it.": "Die Gruppen gehen auf {name}, sobald es das erfährt.",
  "Groups stay on": "Gruppen bleiben auf",
  "Moving: both devices have to be on.": "Sie ziehen um: Beide Geräte müssen an sein.",
  "The keys of the groups are on one device at a time, never copied. There, groups work with the phone off; the other devices write in them through it, so it has to be on. Moving them needs both on, and the server. Public groups stay on the phone.": "Die Schlüssel der Gruppen sind immer nur auf einem Gerät, nie kopiert. Dort funktionieren Gruppen auch bei ausgeschaltetem Telefon; die anderen Geräte schreiben über dieses darin, also muss es an sein. Zum Umziehen müssen beide an sein, und der Server erreichbar. Öffentliche Gruppen bleiben auf dem Telefon.",
  "The groups are held here": "Die Gruppen sind auf diesem Gerät",
  "Groups work on this device with the phone off, and you can make new ones here. The phone and the other devices write in them through this one, so it has to be on.": "Gruppen funktionieren auf diesem Gerät auch bei ausgeschaltetem Telefon, und du kannst hier neue anlegen. Das Telefon und die anderen Geräte schreiben über dieses darin, also muss es an sein.",
  "The groups are held on this device. On the phone, move them back to it first, under Groups stay on.": "Die Gruppen sind auf diesem Gerät. Hol sie zuerst auf dem Telefon unter Gruppen bleiben auf dorthin zurück.",
  "The groups are held on {name}. Move them back to this phone first, under Groups stay on.": "Die Gruppen sind auf {name}. Hol sie zuerst unter Gruppen bleiben auf auf dieses Telefon zurück.",
  "That device is no longer linked.": "Dieses Gerät ist nicht mehr verknüpft.",
  "The groups go to the other device through the server. Type its address in Server first.": "Die Gruppen gehen über den Server auf das andere Gerät. Gib zuerst seine Adresse unter Server ein.",
  "Unlink all the same?": "Trotzdem trennen?",
  "Unlinked now, the groups go from this device, and the phone shows each as left.": "Danach verschwinden die Gruppen von diesem Gerät, und das Telefon zeigt jede als verlassen.",
  "Unlinked now, this phone shows each of the groups as left, unless they are still on their way to it: those stay here. Do it if the device is lost.": "Danach zeigt dieses Telefon jede Gruppe als verlassen, außer denen, die noch auf dem Weg hierher sind: Die bleiben hier. Tu das, wenn das Gerät verloren ist.",
  "A device whose Erevos is older cannot hold them: update it there first.": "Ein Gerät mit älterem Erevos kann sie nicht halten: Aktualisiere es dort zuerst.",
  "{name} has an older Erevos: update it there first.": "{name} hat ein älteres Erevos: Aktualisiere es dort zuerst.",
  "The other device could not take the groups: they stay here.": "Das andere Gerät konnte die Gruppen nicht übernehmen: Sie bleiben hier.",

  // Linking with the short code (components/quick-link.tsx, lib/link-nostr.ts).
  'Inside hidden chats, link with the code Link to my phone shows inside the same hidden chats on the computer.':
    'In versteckten Chats verknüpfst du mit dem Code, den „Mit meinem Telefon verknüpfen“ in denselben versteckten Chats auf dem Computer zeigt.',
  '{why} Link this way instead: sign in to the server below, then tap Link to my phone.':
    '{why} Verknüpfe stattdessen so: Melde dich unten am Server an und tippe dann auf „Mit meinem Telefon verknüpfen“.',
  'Link another way':
    'Anders verknüpfen',
  'The phone that answered is not the one that read the code. Make a new code, and link again.':
    'Das Telefon, das geantwortet hat, ist nicht das, das den Code gelesen hat. Erzeuge einen neuen Code und verknüpfe erneut.',
  'The phone answered, but this computer could not use its server: {error}':
    'Das Telefon hat geantwortet, aber dieser Computer konnte seinen Server nicht nutzen: {error}',
  'The phone answered. Setting up this computer…':
    'Das Telefon hat geantwortet. Dieser Computer wird eingerichtet…',
  'Linking with the phone…':
    'Verknüpfen mit dem Telefon…',
  'Keep both open for a moment. Nothing has to be typed or compared.':
    'Lass beide noch einen Moment geöffnet. Es muss nichts eingetippt oder verglichen werden.',
  'Scan this with the phone that holds the account, then tap Link on the phone. Nothing else.':
    'Scanne das mit dem Telefon, das das Konto hat, und tippe dann am Telefon auf „Verknüpfen“. Sonst nichts.',
  'Making the code…':
    'Code wird erzeugt…',
  'The phone sends this computer what it needs through Nostr, end-to-end encrypted. The code works for half an hour.':
    'Das Telefon schickt diesem Computer über Nostr, Ende-zu-Ende-verschlüsselt, was er braucht. Der Code gilt eine halbe Stunde.',
  'The computer did not answer. On it, tap Link another way and sign in to the server there, then scan its code again.':
    'Der Computer hat nicht geantwortet. Tippe dort auf „Anders verknüpfen“, melde dich dort am Server an und scanne dann seinen Code erneut.',
  'Linked to {name}. The chats go to it now.':
    'Mit {name} verknüpft. Die Chats gehen jetzt dorthin.',
  'Link {name} to this phone?':
    '{name} mit diesem Telefon verknüpfen?',
  'Link only a computer of yours, whose code you scanned just now. It gets the chats of this space and the messages chosen below.':
    'Verknüpfe nur einen eigenen Computer, dessen Code du gerade eben gescannt hast. Er bekommt die Chats dieses Bereichs und die unten gewählten Nachrichten.',
  'Waiting for the computer…':
    'Warte auf den Computer…',
  'No Nostr server could be reached.':
    'Es war kein Nostr-Server erreichbar.',
  'The Nostr server did not take it.':
    'Der Nostr-Server hat es nicht angenommen.',
  'No Nostr server took it.':
    'Kein Nostr-Server hat es angenommen.',
  'Asked. On {name}, tap Link again: it links to this phone and keeps its chats.':
    'Angefragt. Tippe auf {name} auf „Erneut verknüpfen“: Es verknüpft sich mit diesem Telefon und behält seine Chats.',
  'Let go of {name}':
    '{name} entfernen',
  'It is asked nothing from this phone. To link it later, link it as the first time.':
    'Dieses Telefon fragt es nichts mehr. Um es später zu verknüpfen, verknüpfe es wie beim ersten Mal.',
  'Let go':
    'Entfernen',
  'Said yes. Once the phone hears it, this device is linked to it again.':
    'Zugestimmt. Sobald das Telefon es erfährt, ist dieses Gerät wieder mit ihm verknüpft.',
  '{name} asks to link again':
    '{name} bittet um erneute Verknüpfung',
  'A backup of the phone was put back on {name}, which asked {when}. If you did that, link this device to it: it keeps its chats and gets what came since, and the phone before gets nothing more from it. If not, tap Not now: it stays linked as it is.':
    'Eine Sicherung des Telefons wurde auf {name} wiederhergestellt, das {when} angefragt hat. Wenn du das warst, verknüpfe dieses Gerät damit: Es behält seine Chats und bekommt, was seitdem kam, und das bisherige Telefon bekommt nichts mehr von ihm. Wenn nicht, tippe auf „Nicht jetzt“: Es bleibt verknüpft, wie es ist.',
  'Waiting for {name}: it has to be on.':
    'Warte auf {name}: Es muss eingeschaltet sein.',
  'Link again':
    'Erneut verknüpfen',
  'From the backup':
    'Aus der Sicherung',
  'These devices were linked to the phone this backup was made on. Ask only those that are still yours: each shows the ask, and links to this phone once Link again is tapped on it. It keeps its chats, and gets what came since.':
    'Diese Geräte waren mit dem Telefon verknüpft, auf dem diese Sicherung erstellt wurde. Frage nur die an, die noch dir gehören: Jedes zeigt die Anfrage und verknüpft sich mit diesem Telefon, sobald dort „Erneut verknüpfen“ angetippt wird. Es behält seine Chats und bekommt, was seitdem kam.',
  'It said yes. Linking…':
    'Es hat zugestimmt. Wird verknüpft…',
  'Asked {when}. Waiting for Link again to be tapped on it.':
    'Angefragt am {when}. Wartet darauf, dass dort „Erneut verknüpfen“ angetippt wird.',
  'Linked there {when}.':
    'Dort verknüpft am {when}.',
  'Not asked yet.':
    'Noch nicht angefragt.',
  'Ask to link again':
    'Um erneute Verknüpfung bitten',
  'The phone no longer asks this device to link again.':
    'Das Telefon bittet dieses Gerät nicht mehr um erneute Verknüpfung.',
  '{name} asks this device to link again, as a backup of the phone was put back there. If you did that, tap Link again in Linked devices.':
    '{name} bittet dieses Gerät um erneute Verknüpfung, weil dort eine Sicherung des Telefons wiederhergestellt wurde. Wenn du das warst, tippe unter „Verknüpfte Geräte“ auf „Erneut verknüpfen“.',
  'The phone this backup was made on had linked devices. In Linked devices, ask those that are yours to link again: each keeps its chats.':
    'Das Telefon, auf dem diese Sicherung erstellt wurde, hatte verknüpfte Geräte. Bitte unter „Verknüpfte Geräte“ die, die dir gehören, um erneute Verknüpfung: Jedes behält seine Chats.',
};
