// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevossms

import android.content.Context

/** The words of the new message notice in the app's language, as the call module keeps it (erevos-call Notices.kt): English,
 *  Greek, German, Spanish, French, Italian, Portuguese or Serbo-Croatian, English for any other. */
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
    "SMS with a sound of their own" to t("SMS mit eigenem Ton", "SMS con sonido propio", "SMS avec leur propre son", "SMS con suono proprio", "SMS com som próprio", "SMS sa vlastitim zvukom"),
    "New message" to t("Neue Nachricht", "Mensaje nuevo", "Nouveau message", "Nuovo messaggio", "Nova mensagem", "Nova poruka"),
    "Copy code" to t("Code kopieren", "Copiar código", "Copier le code", "Copia codice", "Copiar código", "Kopiraj kod"),
    "The code is copied" to t("Der Code wurde kopiert", "El código se ha copiado", "Le code est copié", "Il codice è stato copiato", "O código foi copiado", "Kod je kopiran"),
    "Reply" to t("Antworten", "Responder", "Répondre", "Rispondi", "Responder", "Odgovori"),
    "Mark as read" to t("Als gelesen markieren", "Marcar como leído", "Marquer comme lu", "Segna come letto", "Marcar como lida", "Označi kao pročitano"),
    "SMS (not encrypted)" to t("SMS (nicht verschlüsselt)", "SMS (sin cifrar)", "SMS (non chiffré)", "SMS (non crittografato)", "SMS (sem criptografia)", "SMS (nije šifriran)"),
  )
}
