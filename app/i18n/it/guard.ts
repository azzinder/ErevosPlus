// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Italian of the panic password (app/panic.tsx), the calculator in place of Erevos
// (components/launcher-icons.tsx), starting when the phone turns on (app/security.tsx), and their
// settings (lib/settings.ts) (i18n/it/index.ts).
export const guard: Record<string, string> = {
  // The panic password.
  "Panic password": "Password di panico",
  "Set the panic password": "Imposta la password di panico",
  "Turn off the panic password": "Disattiva la password di panico",
  "Panic password set. Typed on the lock screen, it wipes Erevos.": "Password di panico impostata. Scritta sulla schermata di blocco, cancella Erevos.",
  "Typed on the lock screen, it will then be only a wrong password.": "Scritta sulla schermata di blocco, sarà allora soltanto una password errata.",
  "No panic password now.": "Ora non c’è nessuna password di panico.",
  "A password of its own that, typed on the lock screen, wipes Erevos as the button above does. The screen then looks as after a wrong password, and checking it takes as long as any other. It must differ from every password of your spaces.":
    "Una password tutta sua che, scritta sulla schermata di blocco, cancella Erevos come fa il pulsante qui sopra. La schermata appare allora come dopo una password errata, e il controllo dura quanto quello di ogni altra. Deve essere diversa da ogni password dei tuoi spazi.",
  "Erevos keeps nothing that shows whether one is set, so this screen cannot say either. Setting it again replaces the one before.":
    "Erevos non conserva nulla che mostri se ce n’è una impostata, quindi nemmeno questa schermata può dirlo. Impostarla di nuovo sostituisce quella di prima.",
  "Typed on the lock screen, it wipes everything Erevos keeps here.": "Scritta sulla schermata di blocco, cancella tutto ciò che Erevos conserva qui.",
  // Starting when the phone turns on.
  "Start when the phone turns on": "Avvia all’accensione del telefono",
  "Wait until I open it": "Aspetta che lo apra io",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open: the spaces set to say a message came also while another is open already say \"New message\", never which space, nor who or what. Everything else waits for a password, as Erevos keeps no key on the phone. Meanwhile a quiet notice says \"Locked\". Spaces that go through Tor say nothing until a space is open. With no such space, only a quiet notice says it is locked, and a tap on it opens Erevos.":
    "Dopo l’accensione del telefono, o dopo un aggiornamento di Erevos, Erevos si avvia da solo, senza nessuno spazio aperto: gli spazi impostati per dire che è arrivato un messaggio anche mentre ne è aperto un altro dicono già «New message», mai quale spazio, né chi o cosa. Tutto il resto aspetta una password, perché Erevos non conserva nessuna chiave sul telefono. Intanto una notifica silenziosa dice «Locked». Gli spazi che passano da Tor non dicono nulla finché non si apre uno spazio. Se non c’è nessuno spazio così, solo una notifica silenziosa dice che è bloccato, e toccarla apre Erevos.",
  "After the phone turns on, Erevos waits until you open it.": "Dopo l’accensione del telefono, Erevos aspetta che sia tu ad aprirlo.",
  // The calculator in place of Erevos.
  "Calculator in place of Erevos": "Calcolatrice al posto di Erevos",
  "A calculator that works shows among the phone's apps instead of Erevos's icon. Type your code in it, then =, and Erevos opens, asking for its password as always. Only the icon is hidden: Android's list of apps, the notices and the recent apps still say Erevos.":
    "Una calcolatrice che funziona compare tra le app del telefono al posto dell’icona di Erevos. Scrivi lì il tuo codice, poi =, ed Erevos si apre, chiedendo la sua password come sempre. È nascosta solo l’icona: l’elenco delle app di Android, le notifiche e le app recenti dicono ancora Erevos.",
  "On: the calculator stands in place of Erevos.": "Attivato: la calcolatrice è al posto di Erevos.",
  "Change the code": "Cambia il codice",
  "Show Erevos's icon again": "Mostra di nuovo l’icona di Erevos",
  "Put the calculator in its place": "Metti la calcolatrice al suo posto",
  "Calculator code": "Codice della calcolatrice",
  "Digits only, 4 to 12 of them. Type them in the calculator, then =.": "Solo cifre, da 4 a 12. Scrivile nella calcolatrice, poi =.",
  "Use digits only, 4 to 12 of them.": "Usa solo cifre, da 4 a 12.",
  "The calculator could not be set. Try again.": "Non è stato possibile impostare la calcolatrice. Riprova.",
  "New code saved.": "Nuovo codice salvato.",
  "Done. Within a few seconds Erevos's icon leaves the phone's apps, and the calculator takes its place: open Erevos from it from now on.":
    "Fatto. Entro pochi secondi l’icona di Erevos lascia le app del telefono e la calcolatrice prende il suo posto: da ora apri Erevos da lì.",
  "Erevos's icon is back among the phone's apps.": "L’icona di Erevos è di nuovo tra le app del telefono.",
  "Hide Erevos's icon behind a calculator that works": "Nascondi l’icona di Erevos dietro una calcolatrice che funziona",
  "Erevos's camera at a tap, behind Erevos's password and the Collection's, as from the Collection. Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "La fotocamera di Erevos con un tocco, dietro la password di Erevos e quella della Raccolta, come dalla Raccolta. Tenendo premuta l’icona di Erevos compare anche Fotocamera. Nessuno dei due si vede finché la Raccolta è spenta o la calcolatrice sta al posto di Erevos.",
  "Put the Camera among the phone's apps":
    "Metti la Fotocamera tra le app del telefono",
  "Take the Camera off the phone's apps":
    "Togli la Fotocamera dalle app del telefono",
};
