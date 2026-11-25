// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The German of the panic password (app/panic.tsx), the calculator in place of Erevos
// (components/launcher-icons.tsx), starting when the phone turns on (app/security.tsx), and their
// settings (lib/settings.ts) (i18n/de/index.ts).
export const guard: Record<string, string> = {
  // The panic password.
  "Panic password": "Panik-Passwort",
  "Set the panic password": "Panik-Passwort festlegen",
  "Turn off the panic password": "Panik-Passwort ausschalten",
  "Panic password set. Typed on the lock screen, it wipes Erevos.": "Panik-Passwort festgelegt. Auf dem Sperrbildschirm eingegeben, löscht es Erevos.",
  "Typed on the lock screen, it will then be only a wrong password.": "Auf dem Sperrbildschirm eingegeben, ist es dann nur noch ein falsches Passwort.",
  "No panic password now.": "Jetzt gibt es kein Panik-Passwort mehr.",
  "A password of its own that, typed on the lock screen, wipes Erevos as the button above does. The screen then looks as after a wrong password, and checking it takes as long as any other. It must differ from every password of your spaces.":
    "Ein eigenes Passwort, das, auf dem Sperrbildschirm eingegeben, Erevos löscht wie der Knopf oben. Der Bildschirm sieht dann aus wie nach einem falschen Passwort, und die Prüfung dauert so lange wie jede andere. Es muss sich von jedem Passwort deiner Bereiche unterscheiden.",
  "Erevos keeps nothing that shows whether one is set, so this screen cannot say either. Setting it again replaces the one before.":
    "Erevos bewahrt nichts auf, was zeigt, ob eines festgelegt ist, also kann es auch dieser Bildschirm nicht sagen. Legst du es erneut fest, ersetzt es das vorherige.",
  "Typed on the lock screen, it wipes everything Erevos keeps here.": "Auf dem Sperrbildschirm eingegeben, löscht es alles, was Erevos hier aufbewahrt.",
  // Starting when the phone turns on.
  "Start when the phone turns on": "Starten, wenn das Telefon eingeschaltet wird",
  "Wait until I open it": "Warten, bis ich es öffne",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open: the spaces set to say a message came also while another is open already say \"New message\", never which space, nor who or what. Everything else waits for a password, as Erevos keeps no key on the phone. Meanwhile a quiet notice says \"Locked\". Spaces that go through Tor say nothing until a space is open. With no such space, only a quiet notice says it is locked, and a tap on it opens Erevos.":
    "Nachdem das Telefon eingeschaltet oder Erevos aktualisiert wurde, startet Erevos von selbst, ohne dass ein Bereich offen ist: Die Bereiche, die auch bei offenem anderem Bereich melden sollen, dass eine Nachricht kam, sagen schon „New message“, nie welcher Bereich, auch nicht von wem oder was. Alles andere wartet auf ein Passwort, da Erevos keinen Schlüssel auf dem Telefon aufbewahrt. Währenddessen sagt eine stille Benachrichtigung „Locked“. Bereiche, die über Tor gehen, sagen nichts, bis ein Bereich offen ist. Gibt es keinen solchen Bereich, sagt nur eine stille Benachrichtigung, dass es gesperrt ist, und ein Tippen darauf öffnet Erevos.",
  "After the phone turns on, Erevos waits until you open it.": "Nachdem das Telefon eingeschaltet wurde, wartet Erevos, bis du es öffnest.",
  // The calculator in place of Erevos.
  "Calculator in place of Erevos": "Taschenrechner anstelle von Erevos",
  "A calculator that works shows among the phone's apps instead of Erevos's icon. Type your code in it, then =, and Erevos opens, asking for its password as always. Only the icon is hidden: Android's list of apps, the notices and the recent apps still say Erevos.":
    "Ein Taschenrechner, der funktioniert, erscheint unter den Apps des Telefons statt des Symbols von Erevos. Gib darin deinen Code ein, dann =, und Erevos öffnet sich und fragt wie immer nach seinem Passwort. Nur das Symbol ist versteckt: Die App-Liste von Android, die Benachrichtigungen und die letzten Apps sagen weiterhin Erevos.",
  "On: the calculator stands in place of Erevos.": "An: Der Taschenrechner steht anstelle von Erevos.",
  "Change the code": "Code ändern",
  "Show Erevos's icon again": "Symbol von Erevos wieder zeigen",
  "Put the calculator in its place": "Taschenrechner an seine Stelle setzen",
  "Calculator code": "Taschenrechner-Code",
  "Digits only, 4 to 12 of them. Type them in the calculator, then =.": "Nur Ziffern, 4 bis 12. Gib sie im Taschenrechner ein, dann =.",
  "Use digits only, 4 to 12 of them.": "Nur Ziffern verwenden, 4 bis 12.",
  "The calculator could not be set. Try again.": "Der Taschenrechner konnte nicht eingerichtet werden. Versuche es erneut.",
  "New code saved.": "Neuer Code gespeichert.",
  "Done. Within a few seconds Erevos's icon leaves the phone's apps, and the calculator takes its place: open Erevos from it from now on.":
    "Fertig. In wenigen Sekunden verschwindet das Symbol von Erevos aus den Apps des Telefons, und der Taschenrechner nimmt seinen Platz ein: Öffne Erevos von nun an darüber.",
  "Erevos's icon is back among the phone's apps.": "Das Symbol von Erevos ist wieder unter den Apps des Telefons.",
  "Hide Erevos's icon behind a calculator that works": "Das Symbol von Erevos hinter einem Taschenrechner verstecken, der funktioniert",
  "Erevos's camera at a tap, behind Erevos's password and the Collection's, as from the Collection. Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "Die Kamera von Erevos mit einem Tippen, hinter dem Passwort von Erevos und dem der Sammlung, wie aus der Sammlung. Hältst du das Symbol von Erevos gedrückt, bietet es auch Kamera an. Beides zeigt sich nicht, solange die Sammlung aus ist oder der Rechner an der Stelle von Erevos steht.",
  "Put the Camera among the phone's apps":
    "Kamera unter die Apps des Telefons legen",
  "Take the Camera off the phone's apps":
    "Kamera aus den Apps des Telefons nehmen",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open, and a quiet notice says it is locked: a tap on it opens Erevos. Nothing comes until a space is open.": "Nachdem das Telefon eingeschaltet oder Erevos aktualisiert wurde, startet Erevos von selbst, ohne dass ein Bereich offen ist, und eine stille Benachrichtigung sagt, dass es gesperrt ist: Ein Tippen darauf öffnet Erevos. Nichts kommt an, bis ein Bereich offen ist.",
  "Erevos's camera at a tap, even while Erevos and the Collection are locked: what it takes shows only after the password, in the Collection (Open the camera without the password, in its settings). Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "Die Kamera von Erevos mit einem Tippen, auch wenn Erevos und die Sammlung gesperrt sind: Was sie aufnimmt, zeigt sich erst nach dem Passwort, in der Sammlung („Kamera ohne Passwort öffnen“, in ihren Einstellungen). Hältst du das Symbol von Erevos gedrückt, bietet es auch Kamera an. Beides zeigt sich nicht, solange die Sammlung aus ist oder der Rechner an der Stelle von Erevos steht.",
};
