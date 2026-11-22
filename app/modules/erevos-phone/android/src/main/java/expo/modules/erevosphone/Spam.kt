// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.content.Context
import android.telephony.PhoneNumberUtils
import java.io.File
import org.json.JSONArray

/**
 * Numbers known for spam, matched on the phone with nothing asked of anyone: a list the owner
 * downloads whole from a source of their choosing (lib/spam-list.ts), kept in Erevos's own files,
 * and the numbers they reported themselves. A list holds one number a line, with its country code
 * (+30 211 000 4455, or 0030…), or the start of numbers followed by * (+30 211 000*), then, after
 * a space, a comma or a tab, what kind of calls they are; # starts a note. Kept outside the
 * spaces, as calls are screened with Erevos locked, and with no names.
 */
internal object Spam {
  private const val FILE = "erevos-spam-list.txt"
  private const val OWN = "spam-own"
  private const val WARN = "spam-warn"
  private const val SILENCE = "spam-silence"
  private const val SOURCE = "spam-source"
  private const val AT = "spam-at"
  private const val AUTO = "spam-auto"
  const val MOST_LINES = 500_000

  // The list in memory, read once: whole numbers by their digits, and starts of numbers.
  @Volatile private var whole: Map<String, String>? = null
  @Volatile private var starts: List<Pair<String, String>> = emptyList()

  private fun file(context: Context) = File(context.filesDir, FILE)

  /** One line of a list: the number's digits with their country code, whether it is a start, and its kind. */
  fun line(text: String): Triple<String, Boolean, String>? {
    val clean = text.substringBefore('#').trim()
    if (clean.isEmpty()) return null
    // The number is what comes first of digits, +, *, spaces, dashes and brackets; the rest is its kind.
    val end = clean.indexOfFirst { !(it.isDigit() || it in "+* -().") }.let { if (it < 0) clean.length else it }
    val number = clean.substring(0, end).trim()
    val kind = clean.substring(end).trimStart(',', ';', '\t', ' ').trim().take(60)
    val start = number.endsWith("*")
    val bare = number.removeSuffix("*").filter { it.isDigit() || it == '+' }
    val digits = when {
      bare.startsWith("+") -> bare.drop(1).filter { it.isDigit() }
      bare.startsWith("00") -> bare.drop(2)
      else -> return null
    }
    if (digits.length < (if (start) 3 else 6) || digits.length > 15) return null
    return Triple(digits, start, kind)
  }

  /** Keeps a downloaded list in place of the one before; how many numbers it holds. */
  fun setList(context: Context, text: String, source: String): Int {
    val kept = StringBuilder()
    var count = 0
    for (raw in text.lineSequence()) {
      val (digits, start, kind) = line(raw) ?: continue
      kept.append('+').append(digits).append(if (start) "*" else "").append('\t').append(kind.replace('\t', ' ')).append('\n')
      if (++count >= MOST_LINES) break
    }
    val target = file(context)
    val part = File(context.filesDir, "$FILE.part")
    part.writeText(kept.toString())
    if (!part.renameTo(target)) {
      target.delete()
      part.renameTo(target)
    }
    Replies.prefs(context).edit().putString(SOURCE, source).putLong(AT, System.currentTimeMillis()).apply()
    whole = null
    return count
  }

  fun clearList(context: Context) {
    file(context).delete()
    Replies.prefs(context).edit().remove(SOURCE).remove(AT).apply()
    whole = null
    starts = emptyList()
  }

  /** How things stand: the list's size, source and time, the owner's reports, and the switches. */
  fun state(context: Context): Map<String, Any> {
    load(context)
    val prefs = Replies.prefs(context)
    return mapOf(
      "count" to ((whole?.size ?: 0) + starts.size).toDouble(),
      "source" to (prefs.getString(SOURCE, null) ?: ""),
      "at" to prefs.getLong(AT, 0).toDouble(),
      "own" to own(context).size.toDouble(),
      "warn" to prefs.getBoolean(WARN, true),
      "silence" to prefs.getBoolean(SILENCE, false),
      "auto" to prefs.getBoolean(AUTO, false),
    )
  }

  fun setSwitches(context: Context, warn: Boolean, silence: Boolean) {
    Replies.prefs(context).edit().putBoolean(WARN, warn).putBoolean(SILENCE, silence).apply()
  }

  /** Whether the list is downloaded again each week, by lib/spam-list.ts with Erevos unlocked; off by default. */
  fun setAuto(context: Context, auto: Boolean) {
    Replies.prefs(context).edit().putBoolean(AUTO, auto).apply()
  }

  fun warns(context: Context) = Replies.prefs(context).getBoolean(WARN, true)

  fun silences(context: Context) = Replies.prefs(context).getBoolean(SILENCE, false)

  private fun own(context: Context): List<String> {
    val raw = Replies.prefs(context).getString(OWN, null) ?: return emptyList()
    return runCatching { JSONArray(raw).let { a -> (0 until a.length()).map { a.getString(it) } } }.getOrDefault(emptyList())
  }

  /** The owner reports a number as spam, or takes it back; only on this phone. */
  fun report(context: Context, number: String, spam: Boolean) {
    val digits = e164(context, number) ?: return
    val now = own(context).filter { it != digits }.let { if (spam) (it + digits).takeLast(5000) else it }
    Replies.prefs(context).edit().putString(OWN, JSONArray(now).toString()).apply()
  }

  fun clearReports(context: Context) {
    Replies.prefs(context).edit().remove(OWN).apply()
  }

  /** Whether the owner reported this number. */
  fun reported(context: Context, number: String): Boolean = e164(context, number)?.let { it in own(context) } ?: false

  /** What kind of spam a number is ("" when the list says nothing more), or null when it is none. */
  fun of(context: Context, number: String): String? {
    val digits = e164(context, number) ?: return null
    if (digits in own(context)) return ""
    load(context)
    whole?.get(digits)?.let { return it }
    return starts.firstOrNull { digits.startsWith(it.first) }?.second
  }

  private fun load(context: Context) {
    if (whole != null) return
    synchronized(this) {
      if (whole != null) return
      val map = HashMap<String, String>()
      val prefixes = ArrayList<Pair<String, String>>()
      runCatching {
        file(context).takeIf { it.exists() }?.forEachLine { raw ->
          val (digits, start, kind) = line(raw) ?: return@forEachLine
          if (start) prefixes.add(digits to kind) else map[digits] = kind
        }
      }
      starts = prefixes
      whole = map
    }
  }

  /** The number's digits with its country code, as the phone's country reads it; or null. */
  fun e164(context: Context, number: String): String? {
    val plain = number.filter { it.isDigit() || it == '+' }
    val full = when {
      plain.startsWith("+") -> plain
      plain.startsWith("00") -> "+" + plain.drop(2)
      else -> Callers.country(context)?.let { PhoneNumberUtils.formatNumberToE164(plain, it) }
    } ?: return null
    return full.drop(1).filter { it.isDigit() }.takeIf { it.length >= 6 }
  }
}
