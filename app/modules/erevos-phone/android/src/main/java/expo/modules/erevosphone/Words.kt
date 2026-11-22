// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.content.Context

/** The call screen's and notices' words in the app's language, as the app last set it for the
 *  call module (erevos-call Notices.kt): English, Greek, German, Spanish, French, Italian,
 *  Portuguese or Serbo-Croatian, English for any other. They show while Erevos is closed or
 *  locked, so they cannot come from the app's own words. */
internal object Words {
  /** The app's language code ("en", "el", "de", "es", "fr", "it", "pt", "sh"); "en" until it is set. */
  fun lang(context: Context): String =
    context.getSharedPreferences("erevos-lang", Context.MODE_PRIVATE).getString("lang", null) ?: "en"

  /** The words in the app's language: `en` and `el` are given at the call; the others come from
   *  the table below, keyed by the English. `{0}`, `{1}` in a text are put in place by `args`. */
  fun say(context: Context, en: String, el: String, vararg args: String): String {
    val lang = lang(context)
    var text = when (lang) {
      "en" -> en
      "el" -> el
      else -> OTHERS[en]?.get(lang) ?: en
    }
    args.forEachIndexed { i, arg -> text = text.replace("{$i}", arg) }
    return text
  }

  private fun t(de: String, es: String, fr: String, it: String, pt: String, sh: String) =
    mapOf("de" to de, "es" to es, "fr" to fr, "it" to it, "pt" to pt, "sh" to sh)

  // German, Spanish, French, Italian, Portuguese and Serbo-Croatian (Latin script, ijekavian), by the English.
  private val OTHERS: Map<String, Map<String, String>> = mapOf(
    "{0} people" to t("{0} Personen", "{0} personas", "{0} personnes", "{0} persone", "{0} pessoas", "Osobe: {0}"),
    "Add call" to t("Anruf hinzufügen", "Añadir llamada", "Ajouter un appel", "Aggiungi chiamata", "Adicionar chamada", "Dodaj poziv"),
    "Free to call" to t("Gebührenfrei", "Gratuito", "Gratuit", "Gratuito", "Gratuito", "Besplatan"),
    "Landline" to t("Festnetz", "Fijo", "Fixe", "Fisso", "Fixo", "Fiksni"),
    "Mobile" to t("Mobil", "Móvil", "Mobile", "Cellulare", "Celular", "Mobilni"),
    "Possible spam: on your spam list" to t("Möglicher Spam: auf deiner Spam-Liste", "Posible spam: en tu lista de spam", "Spam possible : sur ta liste de spam", "Possibile spam: nella tua lista spam", "Possível spam: na sua lista de spam", "Mogući spam: na vašoj listi spama"),
    "Possible spam: {0}" to t("Möglicher Spam: {0}", "Posible spam: {0}", "Spam possible : {0}", "Possibile spam: {0}", "Possível spam: {0}", "Mogući spam: {0}"),
    "Premium rate" to t("Mehrwertnummer", "Tarificación adicional", "Numéro surtaxé", "Numero a tariffa maggiorata", "Tarifa premium", "Skuplji poziv"),
    "Shared cost" to t("Geteilte Kosten", "Coste compartido", "Coût partagé", "Costo condiviso", "Custo compartilhado", "Podijeljeni trošak"),
    "Answer with video" to t("Mit Video annehmen", "Responder con vídeo", "Répondre en vidéo", "Rispondi con video", "Atender com vídeo", "Javi se s videom"),
    "Audio only" to t("Nur Ton", "Solo audio", "Audio seul", "Solo audio", "Só áudio", "Samo zvuk"),
    "Camera off" to t("Kamera aus", "Apagar cámara", "Couper la caméra", "Spegni fotocamera", "Desligar câmera", "Isključi kameru"),
    "Incoming video call" to t("Eingehender Videoanruf", "Videollamada entrante", "Appel vidéo entrant", "Videochiamata in arrivo", "Videochamada recebida", "Dolazni video poziv"),
    "Keep to sound" to t("Nur Ton behalten", "Seguir solo con audio", "Rester en audio", "Resta solo audio", "Continuar só com áudio", "Ostani na zvuku"),
    "Switch camera" to t("Kamera wechseln", "Cambiar de cámara", "Changer de caméra", "Cambia fotocamera", "Trocar câmera", "Promijeni kameru"),
    "Turn video on" to t("Video einschalten", "Activar vídeo", "Activer la vidéo", "Attiva video", "Ligar vídeo", "Uključi video"),
    "Video" to t("Video", "Vídeo", "Vidéo", "Video", "Vídeo", "Video"),
    "Video call" to t("Videoanruf", "Videollamada", "Appel vidéo", "Videochiamata", "Videochamada", "Video poziv"),
    "{0} wants to turn video on" to t("{0} möchte Video einschalten", "{0} quiere activar el vídeo", "{0} veut activer la vidéo", "{0} vuole attivare il video", "{0} quer ligar o vídeo", "{0} želi uključiti video"),
    "Answer" to t("Annehmen", "Responder", "Répondre", "Rispondi", "Atender", "Javi se"),
    "Call ended" to t("Anruf beendet", "Llamada finalizada", "Appel terminé", "Chiamata terminata", "Chamada encerrada", "Poziv je završen"),
    "Call on" to t("Anrufen über", "Llamar con", "Appeler avec", "Chiama con", "Ligar com", "Pozovi preko"),
    "Calling…" to t("Ruft an…", "Llamando…", "Appel…", "Chiamata in corso…", "Chamando…", "Pozivanje…"),
    "Cancel" to t("Abbrechen", "Cancelar", "Annuler", "Annulla", "Cancelar", "Otkaži"),
    "Choose the SIM" to t("SIM wählen", "Elegir la SIM", "Choisir la SIM", "Scegli la SIM", "Escolher o chip", "Izaberi SIM karticu"),
    "Conference call" to t("Konferenzgespräch", "Llamada en conferencia", "Appel en conférence", "Chiamata in conferenza", "Chamada em conferência", "Konferencijski poziv"),
    "Decline" to t("Ablehnen", "Rechazar", "Refuser", "Rifiuta", "Recusar", "Odbij"),
    "Decline with a message" to t("Mit Nachricht ablehnen", "Rechazar con un mensaje", "Refuser avec un message", "Rifiuta con un messaggio", "Recusar com uma mensagem", "Odbij porukom"),
    "Elsewhere" to t("Anderswo", "En otro sitio", "Ailleurs", "Altrove", "Em outro lugar", "Drugdje"),
    "End" to t("Auflegen", "Colgar", "Raccrocher", "Chiudi", "Encerrar", "Prekini"),
    "End and answer" to t("Auflegen und annehmen", "Colgar y responder", "Raccrocher et répondre", "Chiudi e rispondi", "Encerrar e atender", "Prekini i javi se"),
    "Hanging up…" to t("Legt auf…", "Colgando…", "Raccrochage…", "Chiusura…", "Encerrando…", "Prekidanje…"),
    "HD voice" to t("HD Voice", "Voz HD", "Voix HD", "Voce HD", "Voz HD", "HD glas"),
    "Headset" to t("Headset", "Auriculares", "Casque", "Cuffie", "Fones de ouvido", "Slušalice"),
    "Hide" to t("Ausblenden", "Ocultar", "Masquer", "Nascondi", "Ocultar", "Sakrij"),
    "Hold" to t("Halten", "Retener", "Attente", "Attesa", "Espera", "Zadrži"),
    "Hold and answer" to t("Halten und annehmen", "Retener y responder", "Mettre en attente et répondre", "Metti in attesa e rispondi", "Colocar em espera e atender", "Zadrži i javi se"),
    "In a call with {0}" to t("Im Gespräch mit {0}", "En llamada con {0}", "En appel avec {0}", "In chiamata con {0}", "Em chamada com {0}", "U pozivu s: {0}"),
    "Incoming call" to t("Eingehender Anruf", "Llamada entrante", "Appel entrant", "Chiamata in arrivo", "Chamada recebida", "Dolazni poziv"),
    "Incoming calls" to t("Eingehende Anrufe", "Llamadas entrantes", "Appels entrants", "Chiamate in arrivo", "Chamadas recebidas", "Dolazni pozivi"),
    "Keypad" to t("Wähltasten", "Teclado", "Clavier", "Tastierino", "Teclado", "Tastatura"),
    "Merge" to t("Zusammenführen", "Combinar", "Fusionner", "Unisci", "Mesclar", "Spoji"),
    "Message" to t("Nachricht", "Mensaje", "Message", "Messaggio", "Mensagem", "Poruka"),
    "Mute" to t("Stumm", "Silenciar", "Couper micro", "Silenzia", "Silenciar", "Isključi mikrofon"),
    "Ongoing calls" to t("Laufende Anrufe", "Llamadas en curso", "Appels en cours", "Chiamate in corso", "Chamadas em andamento", "Pozivi u toku"),
    "On hold" to t("In Warteschleife", "En espera", "En attente", "In attesa", "Em espera", "Na čekanju"),
    "On hold: {0}. Tap to talk." to t("In Warteschleife: {0}. Tippe, um zu sprechen.", "En espera: {0}. Toca para hablar.", "En attente : {0}. Touche pour parler.", "In attesa: {0}. Tocca per parlare.", "Em espera: {0}. Toque para falar.", "Na čekanju: {0}. Dodirni za razgovor."),
    "Payphone" to t("Münztelefon", "Teléfono público", "Cabine téléphonique", "Telefono pubblico", "Telefone público", "Javna govornica"),
    "Phone" to t("Telefon", "Teléfono", "Téléphone", "Telefono", "Telefone", "Telefon"),
    "Private number" to t("Unterdrückte Nummer", "Número privado", "Numéro masqué", "Numero privato", "Número privado", "Skriveni broj"),
    "Resume" to t("Fortsetzen", "Reanudar", "Reprendre", "Riprendi", "Retomar", "Nastavi"),
    "Separate" to t("Einzeln", "Separar", "Séparer", "Separa", "Separar", "Odvoji"),
    "Send" to t("Senden", "Enviar", "Envoyer", "Invia", "Enviar", "Pošalji"),
    "Sound" to t("Ton", "Sonido", "Son", "Audio", "Som", "Zvuk"),
    "Speaker" to t("Lautsprecher", "Altavoz", "Haut-parleur", "Altoparlante", "Alto-falante", "Zvučnik"),
    "Swap" to t("Wechseln", "Cambiar", "Alterner", "Scambia", "Alternar", "Zamijeni"),
    "Unknown number" to t("Unbekannte Nummer", "Número desconocido", "Numéro inconnu", "Numero sconosciuto", "Número desconhecido", "Nepoznat broj"),
    "Unmute" to t("Mikro an", "Activar micro", "Activer micro", "Attiva microfono", "Ativar microfone", "Uključi mikrofon"),
    "Wi-Fi calling" to t("WLAN-Telefonie", "Llamada por Wi-Fi", "Appel Wi-Fi", "Chiamata Wi-Fi", "Chamada por Wi-Fi", "Wi-Fi pozivanje"),
    "Write your own…" to t("Eigene schreiben…", "Escribe la tuya…", "Écris la tienne…", "Scrivi la tua…", "Escreva a sua…", "Napiši svoju…"),
    // The usual replies a call that rings can be declined with (Replies.kt).
    "Can't talk now. What's up?" to t("Kann gerade nicht reden. Was gibt's?", "No puedo hablar ahora. ¿Qué pasa?", "Je ne peux pas parler maintenant. Qu'est-ce qu'il y a ?", "Non posso parlare ora. Che succede?", "Não posso falar agora. O que houve?", "Ne mogu sada razgovarati. Šta ima?"),
    "I'll call you right back." to t("Ich rufe dich gleich zurück.", "Te llamo enseguida.", "Je te rappelle tout de suite.", "Ti richiamo subito.", "Já ligo de volta para você.", "Odmah ću te nazvati."),
    "I'll call you later." to t("Ich rufe dich später an.", "Te llamo más tarde.", "Je te rappelle plus tard.", "Ti chiamo più tardi.", "Ligo para você mais tarde.", "Nazvat ću te kasnije."),
    "Can't talk now. Call me later?" to t("Kann gerade nicht reden. Rufst du mich später an?", "No puedo hablar ahora. ¿Me llamas más tarde?", "Je ne peux pas parler maintenant. Tu peux me rappeler plus tard ?", "Non posso parlare ora. Mi chiami più tardi?", "Não posso falar agora. Pode me ligar mais tarde?", "Ne mogu sada razgovarati. Možeš li me nazvati kasnije?"),
  )
}
