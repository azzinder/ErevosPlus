// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevossms

import android.Manifest
import android.app.ActivityManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.role.RoleManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.provider.BlockedNumberContract
import android.provider.ContactsContract
import android.provider.Telephony
import android.telecom.TelecomManager
import android.telephony.PhoneNumberUtils
import android.telephony.SmsManager
import android.telephony.SmsMessage
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import android.util.Base64
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject

/**
 * The phone's SMS, as the default SMS app keeps them: in Android's SMS provider, which the
 * default app must write itself. Reading needs READ_SMS, writing needs the default SMS role.
 */
internal object SmsStore {
  private const val TAG = "ErevosSms"

  const val INVITE_PORT: Short = 16180
  const val SENT_ACTION = "expo.modules.erevossms.SENT"
  const val DELIVERED_ACTION = "expo.modules.erevossms.DELIVERED"
  private const val CHANNEL = "sms"
  // The same notice for a conversation with a sound of its own, or none: it never sounds, and the
  // app plays the conversation's (lib/background.ts). A channel's sound is fixed once it is made.
  private const val OWN_CHANNEL = "sms-own"
  // The notice of what came: one, replaced by the next.
  private const val NEW_ID = 1
  private const val PREFS = "erevos-sms"
  private const val INVITES = "invites"
  private const val MAX_INVITES = 50
  // Pieces of encrypted messages that came by SMS (lib/sms-packets.ts), until the app has put them
  // together: the first byte that says one, how many are kept at most, from one number at most, and
  // how long. Only these bytes are kept (each sealed, end-to-end encrypted), the number they came
  // from and when, in the app's own storage; nothing is written to the phone's SMS or its log.
  const val PACKET_MAGIC: Byte = 0x50
  private const val PACKETS = "packets"
  private const val PACKET_COUNT = "packet-count"
  private const val MAX_PACKET_PIECES = 96
  private const val MAX_PACKET_PIECES_FROM = 32
  private const val PACKET_KEEP_MS = 2L * 3600 * 1000
  private const val PACKET_PIECE = 140
  // The longest wait for the phone to say all pieces went, seconds.
  private const val PACKET_SENT_WITHIN = 60L

  /** Set while the JS side runs: tells it what changed, as an event name and its body. */
  @Volatile var listener: ((String, Map<String, Any?>) -> Unit)? = null

  /** Whether Erevos holds the SMS role. Android's own answer (getDefaultSmsPackage) is null
   *  whenever one of the SMS app's app ops is missing, so the role is asked first. */
  fun isDefault(context: Context): Boolean {
    if (Build.VERSION.SDK_INT >= 29) {
      val roles = context.getSystemService(RoleManager::class.java)
      if (roles != null && roles.isRoleAvailable(RoleManager.ROLE_SMS)) return roles.isRoleHeld(RoleManager.ROLE_SMS)
    }
    return Telephony.Sms.getDefaultSmsPackage(context) == context.packageName
  }

  /** The SMS manager of one SIM (its subscription id), or of the phone's default one for -1. */
  fun manager(context: Context, sim: Int = -1): SmsManager =
    if (Build.VERSION.SDK_INT >= 31) {
      val base = context.getSystemService(SmsManager::class.java) ?: throw IllegalStateException("This phone cannot send SMS")
      if (sim >= 0) base.createForSubscriptionId(sim) else base
    } else if (sim >= 0) {
      @Suppress("DEPRECATION") SmsManager.getSmsManagerForSubscriptionId(sim)
    } else {
      @Suppress("DEPRECATION") SmsManager.getDefault()
    }

  /** How many SIMs the phone can hold, without asking for any permission. */
  fun slots(context: Context): Int {
    val phone = context.getSystemService(TelephonyManager::class.java) ?: return 0
    return if (Build.VERSION.SDK_INT >= 30) phone.activeModemCount else @Suppress("DEPRECATION") phone.phoneCount
  }

  /** The SIMs in the phone now: their subscription id, slot and name. Empty without READ_PHONE_STATE. */
  fun sims(context: Context): List<Map<String, Any?>> {
    if (context.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) return emptyList()
    val subscriptions = context.getSystemService(SubscriptionManager::class.java) ?: return emptyList()
    return try {
      (subscriptions.activeSubscriptionInfoList ?: emptyList()).sortedBy { it.simSlotIndex }.map {
        mapOf("id" to it.subscriptionId.toDouble(), "slot" to it.simSlotIndex.toDouble(), "name" to (it.displayName?.toString() ?: ""))
      }
    } catch (_: SecurityException) {
      emptyList()
    }
  }

  /** Names the phone's contacts give these numbers. Empty without READ_CONTACTS. Nothing is kept. */
  fun contactNames(context: Context, numbers: List<String>): Map<String, String> = contacts(context, numbers).mapValues { it.value.first }

  /** The name and picture (an address the app may show, or "") the phone's contacts give these
   *  numbers. Empty without READ_CONTACTS. Nothing is kept. */
  fun contactCards(context: Context, numbers: List<String>): Map<String, Map<String, Any?>> =
    contacts(context, numbers).mapValues { (_, card) -> mapOf("name" to card.first, "photo" to (card.second ?: "")) }

  /** The contacts' numbers are read once, not looked up one by one: a hundred numbers took long. */
  private fun contacts(context: Context, numbers: List<String>): Map<String, Pair<String, String?>> {
    if (context.checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) return emptyMap()
    // By the last ten digits, and, for numbers written with another prefix, by the last seven.
    val byTen = HashMap<String, Pair<String, String?>>()
    val bySeven = HashMap<String, MutableList<Pair<String, Pair<String, String?>>>>()
    try {
      val projection = arrayOf(
        ContactsContract.CommonDataKinds.Phone.NUMBER,
        ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
        ContactsContract.CommonDataKinds.Phone.PHOTO_THUMBNAIL_URI,
      )
      context.contentResolver.query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI, projection, null, null, null)?.use { c ->
        while (c.moveToNext()) {
          val digits = c.getString(0)?.filter { it.isDigit() }?.ifEmpty { null } ?: continue
          val name = c.getString(1)?.takeIf { it.isNotBlank() } ?: continue
          val card = name to c.getString(2)?.takeIf { it.isNotBlank() }
          byTen.putIfAbsent(digits.takeLast(10), card)
          if (digits.length >= 7) bySeven.getOrPut(digits.takeLast(7)) { ArrayList() }.add(digits to card)
        }
      }
    } catch (_: Exception) {
      return emptyMap()
    }
    val cards = HashMap<String, Pair<String, String?>>()
    for (number in numbers.distinct().take(500)) {
      val digits = number.filter { it.isDigit() }
      if (digits.isEmpty()) continue
      // The same last ten digits; else one number ends the other, as Android's own lookup matches.
      val card = byTen[digits.takeLast(10)]
        ?: if (digits.length >= 7) bySeven[digits.takeLast(7)]?.firstOrNull { (other, _) -> digits.endsWith(other) || other.endsWith(digits) }?.second else null
      if (card != null) cards[number] = card
    }
    return cards
  }

  /** The latest message of each conversation, newest first, with how many are not read, and
   *  whether any in it is ours (`replied`). */
  fun threads(context: Context, limit: Int): List<Map<String, Any?>> {
    val seen = LinkedHashMap<Long, MutableMap<String, Any?>>()
    val projection = arrayOf(Telephony.Sms.THREAD_ID, Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE, Telephony.Sms.TYPE, Telephony.Sms.READ)
    context.contentResolver.query(Telephony.Sms.CONTENT_URI, projection, null, null, "${Telephony.Sms.DATE} DESC")?.use { c ->
      var rows = 0
      while (c.moveToNext() && rows++ < 5000) {
        val thread = c.getLong(0)
        val mine = c.getInt(4) != Telephony.Sms.MESSAGE_TYPE_INBOX
        val unread = !mine && c.getInt(5) == 0
        val row = seen[thread]
        if (row == null) {
          if (seen.size >= limit) continue
          seen[thread] = mutableMapOf(
            "thread" to thread.toDouble(),
            "address" to (c.getString(1) ?: ""),
            "text" to (c.getString(2) ?: ""),
            "at" to c.getLong(3).toDouble(),
            "mine" to mine,
            "unread" to (if (unread) 1 else 0),
            "replied" to mine,
          )
        } else {
          if (unread) row["unread"] = (row["unread"] as Int) + 1
          if (mine) row["replied"] = true
        }
      }
    }
    // MMS: a conversation whose newest message is one shows it, and its unread ones count. One that
    // cannot be read is left out, never the SMS with it.
    for (latest in MmsStore.latest(context, 2000)) {
      try {
        mmsInto(context, seen, latest, limit)
      } catch (e: Exception) {
        Log.w(TAG, "An MMS left out of the list", e)
      }
    }
    return seen.values.sortedByDescending { it["at"] as Double }
  }

  /** Puts a conversation's newest MMS in the list, when it is newer than its SMS. */
  private fun mmsInto(context: Context, seen: LinkedHashMap<Long, MutableMap<String, Any?>>, latest: LongArray, limit: Int) {
    val (thread, id, at, mine, unread) = latest.toList()
    val row = seen[thread]
    // Whether any message in it is ours: one of its SMS, or of its MMS.
    val replied = (row?.get("replied") as Boolean? ?: false) || latest.getOrElse(5) { mine } == 1L
    if (row == null || (row["at"] as Double) < at.toDouble()) {
      if (row == null && seen.size >= limit) return
      val parts = MmsStore.parts(context, id)
      // A group's conversation is named by all its numbers, comma-separated.
      val address = MmsStore.recipients(context, thread).joinToString(",").ifEmpty {
        (row?.get("address") as String?) ?: MmsStore.addressOf(context, id, mine == 1L)
      }
      if (address.isEmpty()) return
      seen[thread] = mutableMapOf(
        "thread" to thread.toDouble(),
        "address" to address,
        "text" to parts.text.ifEmpty { parts.word() },
        "at" to at.toDouble(),
        "mine" to (mine == 1L),
        "unread" to ((row?.get("unread") as Int?) ?: 0) + unread.toInt(),
        "replied" to replied,
      )
    } else {
      row["unread"] = (row["unread"] as Int) + unread.toInt()
      row["replied"] = replied
    }
  }

  /** A conversation's messages with one number, oldest first, the latest `limit` of them. */
  fun messages(context: Context, address: String, limit: Int): List<Map<String, Any?>> {
    val thread = threadId(context, address)
    val (selection, args) = if (thread != null) "${Telephony.Sms.THREAD_ID}=?" to arrayOf(thread.toString())
      else "${Telephony.Sms.ADDRESS}=?" to arrayOf(address)
    val out = ArrayList<Map<String, Any?>>()
    val projection = arrayOf(Telephony.Sms._ID, Telephony.Sms.BODY, Telephony.Sms.DATE, Telephony.Sms.TYPE, Telephony.Sms.READ, Telephony.Sms.SUBSCRIPTION_ID, Telephony.Sms.STATUS)
    context.contentResolver.query(Telephony.Sms.CONTENT_URI, projection, selection, args, "${Telephony.Sms.DATE} DESC")?.use { c ->
      while (c.moveToNext() && out.size < limit) {
        val type = c.getInt(3)
        out.add(
          mapOf(
            "id" to c.getLong(0).toDouble(),
            "kind" to "sms",
            "text" to (c.getString(1) ?: ""),
            "at" to c.getLong(2).toDouble(),
            "mine" to (type != Telephony.Sms.MESSAGE_TYPE_INBOX),
            "state" to when (type) {
              Telephony.Sms.MESSAGE_TYPE_FAILED -> "failed"
              Telephony.Sms.MESSAGE_TYPE_OUTBOX, Telephony.Sms.MESSAGE_TYPE_QUEUED -> "sending"
              // Whether it reached their phone, as far as the network's delivery report says.
              Telephony.Sms.MESSAGE_TYPE_SENT -> when (if (c.isNull(6)) Telephony.Sms.STATUS_NONE else c.getInt(6)) {
                Telephony.Sms.STATUS_COMPLETE -> "delivered"
                Telephony.Sms.STATUS_FAILED -> "undelivered"
                else -> "sent"
              }
              else -> "done"
            },
            "read" to (c.getInt(4) != 0),
            "sim" to c.getInt(5).toDouble(),
            "pictures" to emptyList<Any>(),
          ),
        )
      }
    }
    if (thread != null) out.addAll(MmsStore.messages(context, thread, limit))
    return out.sortedByDescending { it["at"] as Double }.take(limit).reversed()
  }

  /** The conversation with one number, or with a group's numbers given comma-separated. */
  fun threadId(context: Context, address: String): Long? =
    try {
      val numbers = numbers(address)
      if (numbers.size > 1) Telephony.Threads.getOrCreateThreadId(context, numbers.toSet())
      else Telephony.Threads.getOrCreateThreadId(context, address)
    } catch (_: Exception) {
      null
    }

  /** The numbers of an address: one, or a group's, comma-separated. */
  fun numbers(address: String): List<String> = address.split(',', ';').map { it.trim() }.filter { it.isNotEmpty() }

  /** Whether two numbers are the same phone: the same last ten digits, or the same digits when shorter. */
  fun sameNumber(a: String, b: String): Boolean {
    val da = a.filter { it.isDigit() }
    val db = b.filter { it.isDigit() }
    if (da.isEmpty() || db.isEmpty()) return false
    return if (da.length >= 10 && db.length >= 10) da.takeLast(10) == db.takeLast(10) else da == db
  }

  fun markRead(context: Context, address: String) {
    if (!isDefault(context)) return
    val thread = threadId(context, address) ?: return
    val values = ContentValues().apply {
      put(Telephony.Sms.READ, 1)
      put(Telephony.Sms.SEEN, 1)
    }
    context.contentResolver.update(Telephony.Sms.CONTENT_URI, values, "${Telephony.Sms.THREAD_ID}=? AND ${Telephony.Sms.READ}=0", arrayOf(thread.toString()))
    MmsStore.markRead(context, thread)
    Widget.refresh(context)
    // The notice that something came is one for every conversation: it goes once none is left unread.
    if (onScreen() && !unreadLeft(context)) clearNew(context)
  }

  /** Whether any SMS or MMS in the inbox is not read; a query that fails counts as one, so nothing goes by mistake. */
  private fun unreadLeft(context: Context): Boolean =
    listOf(Telephony.Sms.Inbox.CONTENT_URI to Telephony.Sms.READ, Telephony.Mms.Inbox.CONTENT_URI to Telephony.Mms.READ).any { (uri, read) ->
      try {
        context.contentResolver.query(uri, arrayOf("_id"), "$read=0", null, null)?.use { it.count > 0 } ?: true
      } catch (e: Exception) {
        true
      }
    }

  /**
   * Sends a text. As the default app, the message is written to the provider first and its row
   * says later whether it went, and whether it reached their phone when the network sends a
   * delivery report; otherwise Android writes it. Returns the row's id, or -1.
   */
  fun send(context: Context, address: String, text: String, sim: Int = -1): Long {
    var id = -1L
    if (isDefault(context)) {
      val values = ContentValues().apply {
        put(Telephony.Sms.ADDRESS, address)
        put(Telephony.Sms.BODY, text)
        put(Telephony.Sms.DATE, System.currentTimeMillis())
        put(Telephony.Sms.READ, 1)
        put(Telephony.Sms.SEEN, 1)
        put(Telephony.Sms.TYPE, Telephony.Sms.MESSAGE_TYPE_OUTBOX)
        put(Telephony.Sms.STATUS, Telephony.Sms.STATUS_PENDING)
        if (sim >= 0) put(Telephony.Sms.SUBSCRIPTION_ID, sim)
      }
      id = context.contentResolver.insert(Telephony.Sms.CONTENT_URI, values)?.lastPathSegment?.toLongOrNull() ?: -1L
    }
    val sms = manager(context, sim)
    val parts = sms.divideMessage(text)
    val sent = Intent(context, SentReceiver::class.java).setAction(SENT_ACTION).putExtra("id", id)
    val last = PendingIntent.getBroadcast(context, (id and 0x7fffffff).toInt(), sent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    val intents = ArrayList<PendingIntent?>(parts.size).apply {
      repeat(parts.size - 1) { add(null) }
      add(last)
    }
    // The delivery report of the last part. Android puts the report in the intent, so it must be mutable.
    val reports = if (id < 0) null else {
      val delivered = Intent(context, DeliveredReceiver::class.java).setAction(DELIVERED_ACTION).putExtra("id", id)
      val mutable = if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0
      val report = PendingIntent.getBroadcast(context, (id and 0x7fffffff).toInt(), delivered, mutable or PendingIntent.FLAG_UPDATE_CURRENT)
      ArrayList<PendingIntent?>(parts.size).apply {
        repeat(parts.size - 1) { add(null) }
        add(report)
      }
    }
    sms.sendMultipartTextMessage(address, null, parts, intents, reports)
    return id
  }

  fun sent(context: Context, id: Long, ok: Boolean) {
    if (id >= 0 && isDefault(context)) {
      val values = ContentValues().apply {
        put(Telephony.Sms.TYPE, if (ok) Telephony.Sms.MESSAGE_TYPE_SENT else Telephony.Sms.MESSAGE_TYPE_FAILED)
      }
      context.contentResolver.update(Uri.withAppendedPath(Telephony.Sms.CONTENT_URI, id.toString()), values, null, null)
    }
    listener?.invoke("onSmsSent", mapOf("id" to id.toDouble(), "ok" to ok))
  }

  /** The network's delivery report of a text that went: it reached their phone, is still on its
   *  way, or will not. Kept in the text's row. */
  fun delivered(context: Context, id: Long, pdu: ByteArray?, format: String?) {
    if (id < 0 || pdu == null) return
    val report = try {
      if (Build.VERSION.SDK_INT >= 23) SmsMessage.createFromPdu(pdu, format) else @Suppress("DEPRECATION") SmsMessage.createFromPdu(pdu)
    } catch (_: Exception) {
      null
    } ?: return
    val status = deliveryStatus(report.status, format)
    if (isDefault(context)) {
      val values = ContentValues().apply { put(Telephony.Sms.STATUS, status) }
      context.contentResolver.update(Uri.withAppendedPath(Telephony.Sms.CONTENT_URI, id.toString()), values, null, null)
    }
    listener?.invoke("onSmsDelivered", mapOf("id" to id.toDouble(), "ok" to (status == Telephony.Sms.STATUS_COMPLETE)))
  }

  /** A report's status as the SMS provider keeps it. GSM gives TP-Status (below 0x20 delivered,
   *  below 0x40 still trying, else failed); CDMA an error class and a message status. */
  private fun deliveryStatus(status: Int, format: String?): Int {
    if (format == "3gpp2") {
      val errorClass = (status shr 24) and 0x03
      val code = (status shr 16) and 0x3f
      return when (errorClass) {
        0 -> if (code == 2) Telephony.Sms.STATUS_COMPLETE else Telephony.Sms.STATUS_PENDING
        3 -> Telephony.Sms.STATUS_FAILED
        else -> Telephony.Sms.STATUS_PENDING
      }
    }
    return when {
      status < 0x20 -> Telephony.Sms.STATUS_COMPLETE
      status < 0x40 -> Telephony.Sms.STATUS_PENDING
      else -> Telephony.Sms.STATUS_FAILED
    }
  }

  /** Keeps a text that came, as the default app must, and says so. */
  fun received(context: Context, address: String, text: String, sentAt: Long, sim: Int) {
    if (!isDefault(context)) return
    val values = ContentValues().apply {
      put(Telephony.Sms.ADDRESS, address)
      put(Telephony.Sms.BODY, text)
      put(Telephony.Sms.DATE, System.currentTimeMillis())
      put(Telephony.Sms.DATE_SENT, sentAt)
      put(Telephony.Sms.READ, 0)
      put(Telephony.Sms.SEEN, 0)
      put(Telephony.Sms.TYPE, Telephony.Sms.MESSAGE_TYPE_INBOX)
      if (sim >= 0) put(Telephony.Sms.SUBSCRIPTION_ID, sim)
    }
    val row = context.contentResolver.insert(Telephony.Sms.Inbox.CONTENT_URI, values)
    // Spam by the built-in rule comes quietly: kept as any other and told to the app, but with no
    // notice and no sound. A contact's, an answered number's and a short code's never is.
    val spam = try {
      spamFilter(context) && BuiltInSpam.byWords(address, text) && !isContact(context, address) && !answered(context, row, address)
    } catch (e: Exception) {
      false
    }
    came(context, mapOf("address" to address), OneTimeCode.find(text), spam, text, sim)
  }

  // Spam's filter on or off, as the space opened last on this phone says (lib/sms-link.ts): the
  // only thing of it kept outside the encrypted space, so that with the filter off spam still comes
  // with a notice. Nothing else of the filter is ever here.
  private const val SPAM_FILTER = "spam-filter"

  fun setSpamFilter(context: Context, on: Boolean) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    if (prefs.getBoolean(SPAM_FILTER, true) != on) prefs.edit().putBoolean(SPAM_FILTER, on).apply()
  }

  private fun spamFilter(context: Context): Boolean = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(SPAM_FILTER, true)

  /** Whether `address` is one of the phone's contacts. Without READ_CONTACTS nobody can tell, so it
   *  counts as one, and its SMS comes with a notice. */
  private fun isContact(context: Context, address: String): Boolean {
    if (context.checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) return true
    return contacts(context, listOf(address)).isNotEmpty()
  }

  /** Whether an SMS or MMS of ours is in the conversation of the SMS just kept (`row`): the owner
   *  answered that number. A question that fails counts as answered, so no notice is lost by mistake. */
  private fun answered(context: Context, row: Uri?, address: String): Boolean {
    val thread = row?.let { uri ->
      context.contentResolver.query(uri, arrayOf(Telephony.Sms.THREAD_ID), null, null, null)?.use { c -> if (c.moveToFirst()) c.getLong(0) else null }
    } ?: threadId(context, address) ?: return true
    val sms = context.contentResolver.query(
      Telephony.Sms.CONTENT_URI,
      arrayOf("_id"),
      "${Telephony.Sms.THREAD_ID}=? AND ${Telephony.Sms.TYPE}!=?",
      arrayOf(thread.toString(), Telephony.Sms.MESSAGE_TYPE_INBOX.toString()),
      null,
    )?.use { it.count > 0 } ?: return true
    if (sms) return true
    return try {
      context.contentResolver.query(
        Telephony.Mms.CONTENT_URI,
        arrayOf("_id"),
        "${Telephony.Mms.THREAD_ID}=? AND ${Telephony.Mms.MESSAGE_BOX}!=?",
        arrayOf(thread.toString(), Telephony.Mms.MESSAGE_BOX_INBOX.toString()),
        null,
      )?.use { it.count > 0 } ?: false
    } catch (_: Exception) {
      // No MMS store on this device.
      false
    }
  }

  // The numbers of the SMS conversation that shows in Erevos now, in its own screen or a contact's
  // chat, while Erevos shows and is open (lib/background.ts showSmsOnScreen); else none.
  @Volatile private var shown: List<String> = emptyList()

  // Whether the open space shows on an SMS's notice who wrote and what, with Reply and Mark as read
  // (lib/sms-notices.ts, NoticeReply.kt). In memory only, told while the space is open: locked, or
  // with Erevos stopped, every notice says only "New message" again.
  @Volatile private var details = false
  // Whether the notice showing now says who wrote and what.
  @Volatile private var detailed = false

  /** Turned off as the space locks: a notice that says who wrote and what says only "New message" again. */
  fun setNoticeDetails(context: Context?, on: Boolean) {
    details = on
    if (on || !detailed || context == null) return
    detailed = false
    val notifications = context.getSystemService(NotificationManager::class.java) ?: return
    val showing = try {
      Build.VERSION.SDK_INT < 23 || notifications.activeNotifications.any { it.id == NEW_ID }
    } catch (_: Exception) {
      true
    }
    if (showing) notifyNew(context, again = true)
  }

  fun showOnScreen(numbers: List<String>) {
    shown = numbers
  }

  // The open space's SMS conversations with notifications of their own (lib/sms-notices.ts), by the
  // one number of each: muted ones until then (milliseconds), whose SMS come with no notice, and
  // those with a sound of their own, or none, whose notice makes none. In memory only, told by the
  // app while a space is open: once it closes, or Erevos is stopped, each SMS tells as ever, as a
  // closed space says nothing of which chat a message came in.
  @Volatile private var muted: List<Pair<String, Double>> = emptyList()
  @Volatile private var ownSound: List<String> = emptyList()

  fun setOwnNotices(numbers: List<String>, ends: List<Double>, sounds: List<String>) {
    muted = numbers.zip(ends)
    ownSound = sounds
  }

  private fun mutedNow(context: Context, address: String?): Boolean {
    if (address == null) return false
    val now = System.currentTimeMillis().toDouble()
    return muted.any { (number, end) -> end > now && PhoneNumberUtils.compare(context, number, address) }
  }

  // Only while the app listens: it plays the sound.
  private fun soundOfItsOwn(context: Context, address: String?): Boolean =
    address != null && listener != null && ownSound.any { PhoneNumberUtils.compare(context, it, address) }

  /** Tells the open app that something came, and shows a notice unless its conversation is on the
   *  screen, where it only sounds (`shown`, played by the app): in the background its JS side still
   *  runs, but nobody looks at it, and on another screen, the password's too, the owner does not see
   *  it. A one-time code in what came gives the notice Copy code (OneTimeCode.kt). Spam by the
   *  built-in rule (`spam`, BuiltInSpam.kt) gets neither: the app is told so, and plays nothing.
   *  From a number muted in the open space, no notice either; from one with a sound of its own, a
   *  notice without sound (setOwnNotices). */
  fun came(context: Context, body: Map<String, Any?>, code: String? = null, spam: Boolean = false, text: String? = null, sim: Int = -1) {
    val address = body["address"] as? String
    val here = address != null && onScreen() && shown.any { PhoneNumberUtils.compare(context, it, address) }
    listener?.invoke("onSms", body + ("shown" to here) + (if (spam) mapOf("spam" to true) else emptyMap()))
    if (!here && !spam && !mutedNow(context, address)) notifyNew(context, code, soundOfItsOwn(context, address), address?.takeIf { text != null }, text, sim)
    Widget.refresh(context)
  }

  private fun onScreen(): Boolean {
    val state = ActivityManager.RunningAppProcessInfo()
    ActivityManager.getMyMemoryState(state)
    return state.importance <= ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND
  }

  /** A notice that something came, without who sent it or what it says; with both, and Reply and
   *  Mark as read, for an SMS from `address` saying `text` while the open space shows them
   *  (setNoticeDetails), never a code's words. With a one-time code
   *  (`code`), it has Copy code, which works only on an unlocked phone (Android 12 and later ask to
   *  unlock first); the code itself never shows on it. `quiet`: for a conversation with a sound of
   *  its own, or none, which the app plays: the notice makes none. */
  fun notifyNew(context: Context, code: String? = null, quiet: Boolean = false, address: String? = null, text: String? = null, sim: Int = -1, again: Boolean = false) {
    val notifications = context.getSystemService(NotificationManager::class.java) ?: return
    // In the app's language, as the call module keeps it (erevos-call Notices.kt).
    if (Build.VERSION.SDK_INT >= 26) {
      // "SMS", apart from Erevos's own "Messages" in Android's notice settings; made again, an older one takes the name.
      notifications.createNotificationChannel(NotificationChannel(CHANNEL, "SMS", NotificationManager.IMPORTANCE_HIGH))
      if (quiet) {
        notifications.createNotificationChannel(
          NotificationChannel(OWN_CHANNEL, Words.say(context, "SMS with a sound of their own", "SMS με δικό τους ήχο"), NotificationManager.IMPORTANCE_HIGH).apply {
            setSound(null, null as AudioAttributes?)
            enableVibration(false)
          },
        )
      }
    }
    // It opens the SMS (erevos://?show=sms), as their icon does: with the password lock, the
    // password given then opens only them (app/_layout.tsx).
    val sms = Intent(Intent.ACTION_VIEW, Uri.parse("erevos://?show=sms")).setPackage(context.packageName)
    val launch = if (sms.resolveActivity(context.packageManager) != null) sms else context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return
    val open = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    val builder = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(context, if (quiet) OWN_CHANNEL else CHANNEL) else @Suppress("DEPRECATION") Notification.Builder(context)
    builder
      .setSmallIcon(android.R.drawable.stat_notify_chat)
      .setContentTitle(Words.say(context, "New message", "Νέο μήνυμα"))
      .setContentIntent(open)
      .setAutoCancel(true)
      // In place of the one showing, without a sound again.
      .setOnlyAlertOnce(again)
    detailed = details && address != null && text != null && code == null
    val from = address
    val words = text
    if (detailed && from != null && words != null) {
      val name = try {
        contactNames(context, listOf(from))[from]
      } catch (_: Exception) {
        null
      }
      builder.setContentTitle(name?.takeIf { it.isNotBlank() } ?: from).setContentText(words.take(500)).setStyle(Notification.BigTextStyle().bigText(words.take(500)))
      for (action in NoticeReply.actions(context, from, sim)) builder.addAction(action)
    }
    if (code != null) {
      val copy = Intent(context, CopyCodeReceiver::class.java).putExtra(CopyCodeReceiver.EXTRA_CODE, code)
      val copying = PendingIntent.getBroadcast(context, NEW_ID, copy, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
      val action = Notification.Action.Builder(null, Words.say(context, "Copy code", "Αντιγραφή κωδικού"), copying)
      if (Build.VERSION.SDK_INT >= 31) action.setAuthenticationRequired(true)
      builder.addAction(action.build())
    }
    val notice = builder.build()
    try {
      notifications.notify(NEW_ID, notice)
    } catch (_: SecurityException) {
      // Notifications are not allowed: the message waits in the list.
    }
  }

  /** Takes the notice of what came away (its code was copied). */
  fun clearNew(context: Context) {
    context.getSystemService(NotificationManager::class.java)?.cancel(NEW_ID)
  }

  // --- Deleting, sending again ---------------------------------------------------------------

  /** Deletes from the phone a conversation's SMS and MMS up to `upTo` (milliseconds), as only the
   *  default SMS app may. Android drops the conversation once nothing is left in it. Returns how
   *  many went. */
  fun deleteThread(context: Context, address: String, upTo: Long): Int {
    check(isDefault(context)) { "Only the SMS app may delete SMS" }
    val thread = threadId(context, address) ?: return 0
    val gone = context.contentResolver.delete(Telephony.Sms.CONTENT_URI, "${Telephony.Sms.THREAD_ID}=? AND ${Telephony.Sms.DATE}<=?", arrayOf(thread.toString(), upTo.toString()))
    return gone + MmsStore.deleteThread(context, thread, upTo)
  }

  /** Deletes messages from the phone, each named by its kind and row: "sms:12", "mms:3". */
  fun deleteMessages(context: Context, ids: List<String>): Int {
    check(isDefault(context)) { "Only the SMS app may delete SMS" }
    var gone = 0
    for (name in ids) {
      val id = name.substringAfter(':').toLongOrNull() ?: continue
      val uri = when (name.substringBefore(':')) {
        "sms" -> Telephony.Sms.CONTENT_URI
        "mms" -> Uri.parse("content://mms")
        else -> continue
      }
      gone += context.contentResolver.delete(Uri.withAppendedPath(uri, id.toString()), null, null)
    }
    return gone
  }

  /** Sends again one of ours that did not go: the same text to the same number, on `sim` (or the
   *  SIM it was to go on, for -1), as a new message in place of the old one. Returns the new row. */
  fun resend(context: Context, id: Long, sim: Int): Long {
    var address = ""
    var body = ""
    var was = -1
    val row = Uri.withAppendedPath(Telephony.Sms.CONTENT_URI, id.toString())
    context.contentResolver.query(row, arrayOf(Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.SUBSCRIPTION_ID), null, null, null)?.use { c ->
      if (c.moveToFirst()) {
        address = c.getString(0) ?: ""
        body = c.getString(1) ?: ""
        was = if (c.isNull(2)) -1 else c.getInt(2)
      }
    }
    require(address.isNotEmpty() && body.isNotEmpty()) { "That SMS is no longer on the phone" }
    val sent = send(context, address, body, if (sim >= 0) sim else was)
    if (isDefault(context)) context.contentResolver.delete(row, null, null)
    return sent
  }

  // --- Blocked numbers -------------------------------------------------------------------------

  /** Whether Erevos may read and change Android's own list of blocked numbers: as the default SMS
   *  app or the default phone app (erevos-phone), for the phone's owner. Android then rejects
   *  their SMS, MMS and calls itself. */
  fun canBlock(context: Context): Boolean =
    Build.VERSION.SDK_INT >= 24 && (isDefault(context) || isDialer(context)) && try {
      BlockedNumberContract.canCurrentUserBlockNumbers(context)
    } catch (_: Exception) {
      false
    }

  private fun isDialer(context: Context): Boolean =
    runCatching { context.getSystemService(TelecomManager::class.java)?.defaultDialerPackage == context.packageName }.getOrDefault(false)

  /** The numbers in Android's list, as they were written there. */
  fun blocked(context: Context): List<String> {
    if (!canBlock(context)) return emptyList()
    val numbers = ArrayList<String>()
    try {
      val projection = arrayOf(BlockedNumberContract.BlockedNumbers.COLUMN_ORIGINAL_NUMBER)
      context.contentResolver.query(BlockedNumberContract.BlockedNumbers.CONTENT_URI, projection, null, null, null)?.use { c ->
        while (c.moveToNext()) c.getString(0)?.takeIf { it.isNotBlank() }?.let { numbers.add(it) }
      }
    } catch (_: Exception) {
      return emptyList()
    }
    return numbers
  }

  fun block(context: Context, number: String): Boolean {
    check(canBlock(context)) { "Only the SMS app or the phone app may block numbers" }
    if (BlockedNumberContract.isBlocked(context, number)) return true
    val values = ContentValues().apply { put(BlockedNumberContract.BlockedNumbers.COLUMN_ORIGINAL_NUMBER, number) }
    return context.contentResolver.insert(BlockedNumberContract.BlockedNumbers.CONTENT_URI, values) != null
  }

  fun unblock(context: Context, number: String): Boolean {
    check(canBlock(context)) { "Only the SMS app or the phone app may block numbers" }
    return BlockedNumberContract.unblock(context, number) > 0
  }

  fun sendData(context: Context, address: String, data: ByteArray) {
    manager(context).sendDataMessage(address, null, INVITE_PORT, data, null, null)
  }

  /**
   * Sends the pieces of one encrypted message (lib/sms-packets.ts), `data` holding them one after
   * the other, each `piece` bytes but the last, as data SMS to Erevos's SMS port on `sim` (-1: the
   * phone's default). Tells `done`, once, whether the phone said each went, within PACKET_SENT_WITHIN.
   */
  fun sendPacket(context: Context, address: String, data: ByteArray, piece: Int, sim: Int, done: (Boolean) -> Unit) {
    require(piece in 9..PACKET_PIECE && data.isNotEmpty()) { "Not pieces of a message" }
    val pieces = (data.indices step piece).map { data.copyOfRange(it, minOf(it + piece, data.size)) }
    val app = context.applicationContext
    val action = "${app.packageName}.erevossms.PACKET_SENT.${System.nanoTime()}"
    val main = android.os.Handler(android.os.Looper.getMainLooper())
    val told = java.util.concurrent.atomic.AtomicBoolean(false)
    var left = pieces.size
    var ok = true
    lateinit var receiver: android.content.BroadcastReceiver
    val finish = { went: Boolean ->
      if (told.compareAndSet(false, true)) {
        runCatching { app.unregisterReceiver(receiver) }
        done(went)
      }
    }
    // Told on the main thread, as the timeout below.
    receiver = object : android.content.BroadcastReceiver() {
      override fun onReceive(c: Context, intent: Intent) {
        if (resultCode != android.app.Activity.RESULT_OK) ok = false
        left--
        if (left <= 0 || !ok) finish(ok)
      }
    }
    val filter = android.content.IntentFilter(action)
    if (Build.VERSION.SDK_INT >= 33) app.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
    else @Suppress("UnspecifiedRegisterReceiverFlag") app.registerReceiver(receiver, filter)
    main.postDelayed({ finish(false) }, PACKET_SENT_WITHIN * 1000)
    try {
      val manager = manager(app, sim)
      pieces.forEachIndexed { index, bytes ->
        val sent = PendingIntent.getBroadcast(app, index, Intent(action).setPackage(app.packageName), PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_ONE_SHOT)
        manager.sendDataMessage(address, null, INVITE_PORT, bytes, sent, null)
      }
    } catch (_: Exception) {
      // Told once, as not sent: thrown as well, the app's promise would be settled twice, once
      // rejected here and once more by `finish`.
      main.post { finish(false) }
    }
  }

  /** Keeps a piece of an encrypted message that came by SMS until the JS side has put it together
   *  with the rest (smsPackets, forgetPackets). Too many kept, the oldest go; from one number, its
   *  oldest; and any older than PACKET_KEEP_MS. */
  fun packetPiece(context: Context, address: String, data: ByteArray) {
    if (data.size > PACKET_PIECE) return
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val now = System.currentTimeMillis()
      val kept = keptPackets(prefs, now).toMutableList()
      val same = kept.filter { it.getString("from") == address }
      if (same.size >= MAX_PACKET_PIECES_FROM) kept.remove(same.first())
      while (kept.size >= MAX_PACKET_PIECES) kept.removeAt(0)
      val n = prefs.getLong(PACKET_COUNT, 0L) + 1
      kept.add(
        JSONObject()
          .put("n", n.toDouble())
          .put("from", address)
          .put("data", Base64.encodeToString(data, Base64.NO_WRAP))
          .put("at", now.toDouble()),
      )
      prefs.edit().putString(PACKETS, JSONArray(kept).toString()).putLong(PACKET_COUNT, n).apply()
    }
    listener?.invoke("onSmsPacket", mapOf<String, Any?>())
  }

  private fun keptPackets(prefs: android.content.SharedPreferences, now: Long): List<JSONObject> {
    val list = try {
      JSONArray(prefs.getString(PACKETS, "[]"))
    } catch (_: Exception) {
      JSONArray()
    }
    return (0 until list.length()).mapNotNull { list.optJSONObject(it) }.filter { now - it.optDouble("at", 0.0).toLong() < PACKET_KEEP_MS }
  }

  /** The pieces of encrypted messages kept, oldest first. They stay until forgotten (forgetPackets). */
  fun smsPackets(context: Context): List<Map<String, Any?>> {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      return keptPackets(prefs, System.currentTimeMillis()).map {
        mapOf("n" to it.getDouble("n"), "from" to it.getString("from"), "data" to it.getString("data"), "at" to it.getDouble("at"))
      }
    }
  }

  /** Forgets the pieces kept under these numbers: put together, or never to be. */
  fun forgetPackets(context: Context, ns: List<Double>) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val gone = ns.map { it.toLong() }.toSet()
      val kept = keptPackets(prefs, System.currentTimeMillis()).filter { it.optDouble("n", 0.0).toLong() !in gone }
      prefs.edit().putString(PACKETS, JSONArray(kept).toString()).apply()
    }
  }

  /** Keeps a piece of an SMS invite until the JS side takes it. */
  fun invite(context: Context, address: String, data: ByteArray) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val list = JSONArray(prefs.getString(INVITES, "[]"))
      val kept = JSONArray()
      for (i in maxOf(0, list.length() - MAX_INVITES + 1) until list.length()) kept.put(list.get(i))
      kept.put(
        JSONObject()
          .put("from", address)
          .put("data", Base64.encodeToString(data, Base64.NO_WRAP))
          .put("at", System.currentTimeMillis().toDouble()),
      )
      prefs.edit().putString(INVITES, kept.toString()).apply()
    }
    listener?.invoke("onInvite", mapOf("from" to address))
  }

  fun takeInvites(context: Context): List<Map<String, Any?>> {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val list = JSONArray(prefs.getString(INVITES, "[]"))
      prefs.edit().remove(INVITES).apply()
      return (0 until list.length()).map { i ->
        val item = list.getJSONObject(i)
        mapOf("from" to item.getString("from"), "data" to item.getString("data"), "at" to item.getDouble("at"))
      }
    }
  }
}
