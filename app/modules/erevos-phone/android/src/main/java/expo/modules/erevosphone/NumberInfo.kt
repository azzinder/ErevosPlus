// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.content.Context
import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.geocoding.PhoneNumberOfflineGeocoder
import java.util.Locale

/**
 * What a number itself says of who calls, read on the phone with nothing asked of anyone: its
 * country, with its flag, the place for a landline where the number's range tells it, and its kind
 * (mobile, landline, free, premium rate), from Google's libphonenumber and its geocoder, which
 * carry their data inside. For the call screen of a number that is none of the contacts.
 */
internal object NumberInfo {
  private val numbers by lazy { PhoneNumberUtil.getInstance() }
  private val places by lazy { PhoneNumberOfflineGeocoder.getInstance() }

  /** "🇬🇷 Greece · Athens · Landline" in the app's language, or null when the number is not one. */
  fun of(context: Context, number: String): String? {
    if (number.count { it.isDigit() } < 5) return null
    val here = Callers.country(context) ?: "ZZ"
    val parsed = runCatching { numbers.parse(number, here) }.getOrNull() ?: return null
    if (!runCatching { numbers.isValidNumber(parsed) }.getOrDefault(false)) return null
    val lang = Words.lang(context)
    // Serbo-Croatian's names, in Latin letters, are Croatian's in Java's tables.
    val locale = Locale(if (lang == "sh") "hr" else lang)
    val iso = runCatching { numbers.getRegionCodeForNumber(parsed) }.getOrNull()?.takeIf { it.length == 2 }
    val country = iso?.let { Locale("", it).getDisplayCountry(locale) }?.takeIf { it.isNotBlank() }
    val place = runCatching { places.getDescriptionForNumber(parsed, locale) }.getOrNull()
      ?.takeIf { it.isNotBlank() && it != country && it != iso?.let { code -> Locale("", code).getDisplayCountry(Locale.ENGLISH) } }
    val kind = when (runCatching { numbers.getNumberType(parsed) }.getOrNull()) {
      PhoneNumberUtil.PhoneNumberType.MOBILE -> Words.say(context, "Mobile", "Κινητό")
      PhoneNumberUtil.PhoneNumberType.FIXED_LINE -> Words.say(context, "Landline", "Σταθερό")
      PhoneNumberUtil.PhoneNumberType.TOLL_FREE -> Words.say(context, "Free to call", "Χωρίς χρέωση")
      PhoneNumberUtil.PhoneNumberType.PREMIUM_RATE -> Words.say(context, "Premium rate", "Υψηλή χρέωση")
      PhoneNumberUtil.PhoneNumberType.SHARED_COST -> Words.say(context, "Shared cost", "Κοινή χρέωση")
      PhoneNumberUtil.PhoneNumberType.VOIP -> "VoIP"
      else -> null
    }
    val first = listOfNotNull(iso?.let(::flag), country).joinToString(" ").takeIf { it.isNotBlank() }
    return listOfNotNull(first, place, kind).joinToString(" · ").takeIf { it.isNotBlank() }
  }

  /** The flag of a country, from its two letters. */
  private fun flag(iso: String): String {
    val upper = iso.uppercase(Locale.ROOT)
    if (upper.length != 2 || !upper.all { it in 'A'..'Z' }) return ""
    return upper.map { String(Character.toChars(0x1F1E6 + (it - 'A'))) }.joinToString("")
  }
}
