// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of the panic button (app/panic.tsx, lib/panic.ts) (i18n/de/index.ts).
export const panic: Record<string, string> = {
  "{app} can now wipe Erevos.": "{app} kann Erevos jetzt löschen.",
  "That app changed since it asked. Ask again from it.": "Diese App hat sich verändert, seit sie gefragt hat. Frage erneut aus ihr.",
  "Stop trusting {app}": "{app} nicht mehr vertrauen",
  "{app} will no longer be able to wipe Erevos.": "{app} wird Erevos nicht mehr löschen können.",
  "The automatic backups in {folder} go too.": "Die automatischen Backups in {folder} werden ebenfalls gelöscht.",
  "Wipe everything": "Alles löschen",
  "Everything Erevos keeps here goes now, for good: every space and its hidden chats, contacts, messages and keys. Erevos then starts as if just installed. This cannot be undone.":
    "Alles, was Erevos hier aufbewahrt, wird jetzt endgültig gelöscht: jeder Raum mit seinen versteckten Chats, Kontakten, Nachrichten und Schlüsseln. Erevos startet danach wie frisch installiert. Das lässt sich nicht rückgängig machen.",
  "Wipe": "Löschen",
  "In danger, wipe Erevos at once: every space and its hidden chats, with their contacts, messages, photos, files and keys, the lock, the Matrix, XMPP and Nostr accounts, the server tokens, and the settings and password of automatic backups and of their server.":
    "In Gefahr lösche Erevos sofort: jeden Raum mit seinen versteckten Chats, mit ihren Kontakten, Nachrichten, Fotos, Dateien und Schlüsseln, die Sperre, die Matrix-, XMPP- und Nostr-Konten, die Servertokens sowie Einstellungen und Passwort der automatischen Backups und ihres Servers.",
  "What it cannot reach stays: backups you copied elsewhere or sent to a server (their password still guards them), what the server holds for you until it expires, and what your contacts have.":
    "Was es nicht erreicht, bleibt: Backups, die du anderswohin kopiert oder an einen Server geschickt hast (ihr Passwort schützt sie weiter), was der Server für dich bereithält, bis es abläuft, und was deine Kontakte haben.",
  "Wipe now": "Jetzt löschen",
  "Wipe everything now": "Jetzt alles löschen",
  "Here Erevos cannot wipe itself: delete its data from the computer instead.": "Hier kann Erevos sich nicht selbst löschen: Lösche seine Daten stattdessen auf dem Computer.",
  "From a panic app": "Aus einer Panik-App",
  "A panic app, such as Ripple, wipes the apps you choose with one gesture. Install one, choose Erevos in it, then say yes here. Only the app you say yes to can wipe Erevos, and only while this is on.":
    "Eine Panik-App wie Ripple löscht die Apps, die du wählst, mit einer Geste. Installiere eine, wähle darin Erevos und sag dann hier Ja. Nur die App, der du zustimmst, kann Erevos löschen, und nur solange dies eingeschaltet ist.",
  "{app} asks to be able to wipe Erevos.": "{app} möchte Erevos löschen dürfen.",
  "Trusted panic app: {app}": "Vertrauenswürdige Panik-App: {app}",
  "Trusted panic app: {app}, no longer installed as it was.": "Vertrauenswürdige Panik-App: {app}, nicht mehr so installiert wie zuvor.",
  "No panic app yet.": "Noch keine Panik-App.",
  "A panic app may wipe Erevos": "Eine Panik-App darf Erevos löschen",
  "Also the automatic backups in {folder}": "Auch die automatischen Backups in {folder}",
  "This build of Erevos cannot be wiped by a panic app. Update Erevos for it.": "Diese Erevos-Version kann nicht von einer Panik-App gelöscht werden. Aktualisiere Erevos dafür.",
  "Panic button": "Panikknopf",
  "Wipe Erevos at once, from here, a panic app or a panic password": "Erevos sofort löschen, von hier, aus einer Panik-App oder mit einem Panik-Passwort",
  "Erevos cannot wipe itself here.": "Hier kann Erevos sich nicht selbst löschen.",
  "Trust {app} as it is now": "{app} so vertrauen, wie es jetzt ist",
  "{app} is now signed with another key, so Erevos does not let it wipe. Say yes only if you updated it yourself from where you got it; another app under its name could be the one asking.": "{app} ist jetzt mit einem anderen Schlüssel signiert, deshalb lässt Erevos es nicht löschen. Sag nur ja, wenn du es selbst von dort aktualisiert hast, woher du es hast; es könnte eine andere App unter seinem Namen sein, die fragt.",
  "Trust it": "Vertrauen",
  "{app} is not installed.": "{app} ist nicht installiert.",
  "On {when} {app} asked to wipe Erevos, and Erevos refused: the app is no longer signed as when you trusted it.": "Am {when} wollte {app} Erevos löschen, und Erevos hat abgelehnt: Die App ist nicht mehr so signiert wie damals, als du ihr vertraut hast.",
  "On {when} {app} asked to wipe Erevos, and Erevos refused: the switch below was off.": "Am {when} wollte {app} Erevos löschen, und Erevos hat abgelehnt: Der Schalter unten war aus.",
  "Got it": "Verstanden",
  "{app} is installed but signed with another key, so it cannot wipe Erevos. If you updated it yourself, trust it again as it is now.": "{app} ist installiert, aber mit einem anderen Schlüssel signiert, und kann Erevos daher nicht löschen. Wenn du es selbst aktualisiert hast, vertraue ihm erneut so, wie es jetzt ist.",
  '{app} is no longer told when Erevos wipes.': '{app} wird nicht mehr benachrichtigt, wenn Erevos löscht.',
  '{app} is told when Erevos wipes. If it asks, say yes there too.': '{app} wird benachrichtigt, wenn Erevos löscht. Fragt die App, sag dort auch Ja.',
  'Tell other apps': 'Andere Apps benachrichtigen',
  'As Erevos wipes, from the button, the panic password or a panic app, it can tell the apps you choose here, as a panic app does: Fasouli then locks itself. Each app decides what it does, and asks you first whether Erevos may.': 'Wenn Erevos löscht, über die Taste, das Panik-Passwort oder eine Panik-App, kann es die Apps benachrichtigen, die du hier wählst, wie eine Panik-App: Fasouli sperrt sich dann. Jede App entscheidet selbst, was sie tut, und fragt dich zuerst, ob Erevos darf.',
  "No app on this phone takes a panic app's request.": 'Keine App auf diesem Telefon nimmt die Anfrage einer Panik-App an.',
  "Hold down for the panic button": "Gedrückt halten für den Panikknopf",
  "Wipe Erevos at once": "Erevos sofort löschen",
};
