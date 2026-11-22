// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.ContactsContract
import android.telecom.Call
import android.telecom.TelecomManager
import android.telephony.PhoneNumberUtils
import android.telephony.TelephonyManager
import java.util.Locale

/** Who is on a call, as the call screen and its notices show it: a name, when one is known, and the
 *  contact's photo; for a number that is none of the contacts, what the number says of itself
 *  (NumberInfo) and, when it is on the spam list, what kind (Spam, "" for no kind). */
internal class Caller(val number: String, val name: String?, val photo: Bitmap?, val info: String? = null, val spam: String? = null)

/** A number's contact in the phone's contacts: its name, photo (and a small one) and contact id. */
internal class Contact(val id: Long, val name: String?, val photo: String?, val thumb: String?)

/**
 * Who calls, or is called: the name Erevos knows for the number while a space is open
 * (Calls.knownName), else the name and photo of the phone's contacts, else the name the network
 * gives, else the number. Looked up once per call, away from the main thread.
 */
internal object Callers {
  private val main = Handler(Looper.getMainLooper())
  private val found = HashMap<Int, Caller>()
  private val looking = HashSet<Int>()

  fun number(call: Call): String = call.details.handle?.schemeSpecificPart ?: ""

  /** What the screen shows for `call` now; the contact's name and photo follow once looked up. */
  fun of(context: Context, call: Call): Caller {
    val id = Calls.id(call)
    val number = number(call)
    val known = Calls.knownName(number)
    found[id]?.let { return if (known != null) Caller(it.number, known, it.photo) else it }
    if (looking.add(id)) {
      val app = context.applicationContext
      Thread {
        val contact = runCatching { lookup(app, number) }.getOrNull()
        val photo = contact?.photo?.let { runCatching { photo(app, it) }.getOrNull() }
        val stranger = contact == null && number.isNotBlank()
        val info = if (stranger) runCatching { NumberInfo.of(app, number) }.getOrNull() else null
        val spam = if (stranger && Spam.warns(app)) runCatching { Spam.of(app, number) }.getOrNull() else null
        main.post {
          found[id] = Caller(number, contact?.name ?: networkName(call), photo, info, spam)
          Calls.changed()
        }
      }.start()
    }
    return Caller(number, known ?: networkName(call), null)
  }

  /** Forgets what was looked up for calls that are gone. */
  fun forget(call: Call) {
    val id = Calls.id(call)
    found.remove(id)
    looking.remove(id)
  }

  // The name Telecom found in the contacts, or the one the network sends (CNAP).
  private fun networkName(call: Call): String? {
    val details = call.details
    val contact = if (Build.VERSION.SDK_INT >= 30) details.contactDisplayName else null
    return contact?.takeIf { it.isNotBlank() } ?: details.callerDisplayName?.takeIf { it.isNotBlank() }
  }

  /** The phone's contact with this number, if Erevos may read the contacts. */
  fun lookup(context: Context, number: String): Contact? {
    if (number.isBlank()) return null
    if (context.checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) return null
    val uri = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(number))
    val projection = arrayOf(
      ContactsContract.PhoneLookup._ID,
      ContactsContract.PhoneLookup.DISPLAY_NAME,
      ContactsContract.PhoneLookup.PHOTO_URI,
      ContactsContract.PhoneLookup.PHOTO_THUMBNAIL_URI,
    )
    return try {
      context.contentResolver.query(uri, projection, null, null, null)?.use { c ->
        if (c.moveToFirst()) Contact(c.getLong(0), c.getString(1), c.getString(2), c.getString(3)) else null
      }
    } catch (_: Exception) {
      null
    }
  }

  private fun photo(context: Context, uri: String): Bitmap? =
    context.contentResolver.openInputStream(Uri.parse(uri))?.use { BitmapFactory.decodeStream(it) }

  /** The number as the phone writes it in its own country, or as it is. */
  fun shown(context: Context, number: String): String = shown(number, country(context))

  /** The number as it is written in `country` ("FR"), or as it is. */
  fun shown(number: String, country: String?): String {
    if (number.isBlank()) return number
    return (if (country != null) PhoneNumberUtils.formatNumber(number, country) else null) ?: number
  }

  /** The country of the network the phone is on, else of its SIM, in capitals ("FR"); or null. */
  fun country(context: Context): String? {
    val phone = context.getSystemService(TelephonyManager::class.java) ?: return null
    val iso = phone.networkCountryIso?.takeIf { it.isNotBlank() } ?: phone.simCountryIso?.takeIf { it.isNotBlank() }
    return iso?.uppercase(Locale.ROOT)
  }

  /** What a call with no number shows, when the network hides it. */
  fun hidden(context: Context, call: Call): String? =
    when (call.details.handlePresentation) {
      TelecomManager.PRESENTATION_RESTRICTED -> Words.say(context, "Private number", "Απόκρυψη αριθμού")
      TelecomManager.PRESENTATION_PAYPHONE -> Words.say(context, "Payphone", "Τηλέφωνο κοινού")
      TelecomManager.PRESENTATION_UNKNOWN -> Words.say(context, "Unknown number", "Άγνωστος αριθμός")
      else -> null
    }
}
