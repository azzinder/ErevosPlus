// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.provider.VoicemailContract
import android.telecom.PhoneAccount
import android.telecom.TelecomManager
import android.telephony.TelephonyManager

/**
 * The phone's voicemail: calling it, on a SIM, and the voicemails Android keeps (VoicemailContract),
 * which only some phone companies send as recordings ("visual voicemail"), through an app of theirs
 * or the phone's own; the phone app may read, play and delete them. Erevos keeps no copy: a
 * voicemail plays straight from Android's store, one at a time.
 */
internal object Voicemail {
  private var player: MediaPlayer? = null
  private var playing = -1L
  private var told: ((Long, Boolean) -> Unit)? = null

  /** Whether the SIM with this account id (the default one for "") has a voicemail number; null
   *  when Android does not say, as without the phone's state. */
  fun hasNumber(context: Context, account: String): Boolean? {
    val telecom = context.getSystemService(TelecomManager::class.java) ?: return null
    return try {
      val handle = if (account.isNotEmpty()) Sims.find(context, account)?.handle else telecom.getDefaultOutgoingPhoneAccount(PhoneAccount.SCHEME_TEL)
      val phone = context.getSystemService(TelephonyManager::class.java) ?: return null
      // The SIM's own TelephonyManager (API 26) reads that SIM's voicemail number.
      val sim = if (handle != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) phone.createForPhoneAccountHandle(handle) ?: phone else phone
      sim.voiceMailNumber?.isNotBlank()
    } catch (_: SecurityException) {
      null
    } catch (_: RuntimeException) {
      null
    }
  }

  /** The voicemails Android keeps, newest first (at most 200), and whether Erevos may read them:
   *  only the phone app may. */
  fun list(context: Context): Map<String, Any> {
    val columns = arrayOf(
      VoicemailContract.Voicemails._ID,
      VoicemailContract.Voicemails.NUMBER,
      VoicemailContract.Voicemails.DATE,
      VoicemailContract.Voicemails.DURATION,
      VoicemailContract.Voicemails.IS_READ,
      VoicemailContract.Voicemails.TRANSCRIPTION,
      VoicemailContract.Voicemails.HAS_CONTENT,
      VoicemailContract.Voicemails.PHONE_ACCOUNT_ID,
    )
    val found = ArrayList<Map<String, Any>>()
    try {
      context.contentResolver.query(
        VoicemailContract.Voicemails.CONTENT_URI,
        columns,
        "${VoicemailContract.Voicemails.DELETED} = 0",
        null,
        "${VoicemailContract.Voicemails.DATE} DESC",
      )?.use { c ->
        val country = Callers.country(context)
        while (c.moveToNext() && found.size < 200) {
          val number = c.getString(1) ?: ""
          val name = if (number.isNotBlank()) runCatching { Callers.lookup(context, number)?.name }.getOrNull() else null
          found.add(
            mapOf(
              "id" to c.getLong(0).toDouble(),
              "number" to number,
              "shown" to Callers.shown(number, country),
              "name" to (name ?: ""),
              "at" to c.getLong(2).toDouble(),
              "duration" to c.getLong(3).toDouble(),
              "isNew" to (c.getInt(4) == 0),
              "transcript" to (c.getString(5) ?: ""),
              "playable" to (c.getInt(6) != 0),
              "account" to (c.getString(7) ?: ""),
            ),
          )
        }
      }
    } catch (_: SecurityException) {
      return mapOf("allowed" to false, "voicemails" to emptyList<Map<String, Any>>())
    } catch (_: RuntimeException) {
      // A phone with no voicemail store at all.
      return mapOf("allowed" to true, "voicemails" to emptyList<Map<String, Any>>())
    }
    return mapOf("allowed" to true, "voicemails" to found)
  }

  /** Plays the voicemail with this id from the start, stopping any other, and marks it heard.
   *  `changed` hears when one starts and stops, alone or at its end. */
  fun play(context: Context, id: Long, changed: (Long, Boolean) -> Unit) {
    stop()
    told = changed
    val uri = ContentUris.withAppendedId(VoicemailContract.Voicemails.CONTENT_URI, id)
    val next = MediaPlayer()
    try {
      next.setAudioAttributes(
        AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build(),
      )
      next.setDataSource(context.applicationContext, uri)
      next.setOnCompletionListener { stop() }
      next.setOnErrorListener { _, _, _ ->
        stop()
        true
      }
      next.prepare()
      next.start()
    } catch (error: Exception) {
      next.release()
      told = null
      throw error
    }
    player = next
    playing = id
    changed(id, true)
    runCatching {
      context.contentResolver.update(uri, ContentValues().apply { put(VoicemailContract.Voicemails.IS_READ, 1) }, null, null)
    }
  }

  /** Stops the voicemail that plays, if one does. */
  fun stop() {
    val was = playing
    player?.let { runCatching { it.stop() }; it.release() }
    player = null
    playing = -1L
    if (was >= 0) told?.invoke(was, false)
  }

  /** Deletes a voicemail: Android marks it deleted, so the phone company's app deletes it too. */
  fun delete(context: Context, id: Long): Boolean {
    if (playing == id) stop()
    val uri = ContentUris.withAppendedId(VoicemailContract.Voicemails.CONTENT_URI, id)
    return runCatching {
      context.contentResolver.update(uri, ContentValues().apply { put(VoicemailContract.Voicemails.DELETED, 1) }, null, null) > 0
    }.getOrDefault(false)
  }
}
