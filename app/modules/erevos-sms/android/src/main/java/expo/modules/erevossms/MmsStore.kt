// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevossms

import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.provider.Telephony
import android.telephony.TelephonyManager
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/**
 * MMS, as the default SMS app must handle them: a notice comes by WAP push, the message is fetched
 * from the carrier into a file (SmsManager.downloadMultimediaMessage), read (MmsPdu) and kept in
 * Android's MMS store with its parts, and the carrier is told it came. Sending writes the message
 * to a file the phone's MMS service reads. Files go through MmsFiles, a provider of this app only,
 * which Android lets the MMS service open for the one call. Not run on a phone yet.
 */
internal object MmsStore {
  const val SENT_ACTION = "expo.modules.erevossms.MMS_SENT"
  const val DOWNLOADED_ACTION = "expo.modules.erevossms.MMS_DOWNLOADED"
  private const val PREFS = "erevos-mms"
  private const val FETCHED = "fetched"
  private const val MAX_FETCHED = 100
  // Whether an MMS is fetched as soon as the carrier announces it, and when roaming too; and the
  // notices waiting for a tap to fetch them, kept as JSON (location, from, size, sim, transaction, at).
  private const val AUTO = "auto"
  private const val ROAMING = "roaming"
  private const val WAITING = "waiting"
  private const val MAX_WAITING = 50
  // How long a waiting MMS is listed: carriers keep one some days, then it can no longer be fetched.
  private const val WAITING_DAYS = 7L
  private const val OWN = "own"
  private val MMS: Uri = Uri.parse("content://mms")
  private val PARTS: Uri = Uri.parse("content://mms/part")
  private const val FROM = 137
  private const val TO = 151
  private const val M_SEND_REQ = 128
  private const val M_RETRIEVE_CONF = 132
  const val MAX_PART_BYTES = 2 * 1024 * 1024

  fun folder(context: Context): File = File(context.cacheDir, "mms").apply { mkdirs() }

  private fun fileUri(context: Context, name: String): Uri =
    Uri.Builder().scheme("content").authority(MmsFiles.authority(context)).path(name).build()

  // --- Receiving -------------------------------------------------------------------------------

  /** Whether an MMS is fetched as soon as it is announced (on unless turned off), and when roaming (off unless turned on). */
  fun switches(context: Context): Map<String, Boolean> {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    return mapOf("auto" to prefs.getBoolean(AUTO, true), "roaming" to prefs.getBoolean(ROAMING, false))
  }

  fun setSwitches(context: Context, auto: Boolean, roaming: Boolean) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(AUTO, auto).putBoolean(ROAMING, roaming).apply()
  }

  // Whether the SIM `sim` (or the phone's, -1) is roaming now; a phone that does not say is not.
  private fun roaming(context: Context, sim: Int): Boolean = try {
    val phone = context.getSystemService(TelephonyManager::class.java)
    (if (sim >= 0) phone?.createForSubscriptionId(sim) else phone)?.isNetworkRoaming == true
  } catch (_: Exception) {
    false
  }

  /** A notice that an MMS waits at the carrier: fetch it, unless it was fetched already, or keep it
   *  to fetch on a tap when the owner fetches none at once, or none while roaming and roaming now. */
  fun notified(context: Context, pdu: ByteArray, sim: Int) {
    val notice = try {
      MmsPdu.notification(pdu)
    } catch (_: Exception) {
      return
    }
    val on = switches(context)
    if (on["auto"] == false || (on["roaming"] == false && roaming(context, sim))) {
      wait(context, notice, sim)
      return
    }
    fetch(context, notice.location, notice.transactionId, sim)
  }

  // Fetches the MMS at `location` from the carrier.
  private fun fetch(context: Context, location: String, transaction: String, sim: Int) {
    if (!remember(context, location)) {
      // Fetched already: a waiting one leaves the list.
      fetched(context, location, true)
      return
    }
    val name = "in-${System.currentTimeMillis()}.pdu"
    val done = Intent(context, MmsDownloadedReceiver::class.java).setAction(DOWNLOADED_ACTION)
      .putExtra("file", name).putExtra("sim", sim).putExtra("transaction", transaction).putExtra("location", location)
    val pending = PendingIntent.getBroadcast(context, name.hashCode(), done, PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    try {
      SmsStore.manager(context, sim).downloadMultimediaMessage(context, location, fileUri(context, name), null, pending)
    } catch (_: Exception) {
      forget(context, location)
      SmsStore.notifyNew(context)
      fetched(context, location, false)
    }
  }

  // Keeps a notice to fetch on a tap, and says something came, from whom when the open space shows that.
  private fun wait(context: Context, notice: MmsPdu.Notification, sim: Int) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val list = waitingJson(prefs).filter { it.optString("location") != notice.location }
      val one = JSONObject().put("location", notice.location).put("from", notice.from).put("size", notice.size)
        .put("sim", sim).put("transaction", notice.transactionId).put("at", System.currentTimeMillis())
      prefs.edit().putString(WAITING, JSONArray(list.takeLast(MAX_WAITING - 1) + one).toString()).apply()
    }
    SmsStore.came(context, mapOf("address" to notice.from, "waiting" to true))
  }

  // The waiting list, without those announced more than WAITING_DAYS ago, which the carrier no longer keeps.
  private fun waitingJson(prefs: android.content.SharedPreferences): List<JSONObject> = try {
    val since = System.currentTimeMillis() - WAITING_DAYS * 24 * 60 * 60 * 1000
    JSONArray(prefs.getString(WAITING, "[]")).let { a -> (0 until a.length()).map { a.getJSONObject(it) } }.filter { it.optLong("at") >= since }
  } catch (_: Exception) {
    emptyList()
  }

  /** The MMS waiting at the carrier for a tap: from, size (bytes), when announced, where, and whether
   *  it is being fetched, or the last try failed. */
  fun waiting(context: Context): List<Map<String, Any?>> =
    waitingJson(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)).map {
      mapOf(
        "location" to it.optString("location"), "from" to it.optString("from"), "size" to it.optLong("size").toDouble(),
        "at" to it.optLong("at").toDouble(), "sim" to it.optInt("sim", -1).toDouble(),
        "fetching" to it.optBoolean("fetching", false), "failed" to it.optBoolean("failed", false),
      )
    }

  // Changes the waiting MMS at `location`, or takes it off the list (`change` null).
  private fun changeWaiting(context: Context, location: String, change: ((JSONObject) -> Unit)?): JSONObject? {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val list = waitingJson(prefs)
      val one = list.firstOrNull { it.optString("location") == location } ?: return null
      val kept = if (change == null) list.filter { it !== one } else list.also { change(one) }
      prefs.edit().putString(WAITING, JSONArray(kept).toString()).apply()
      return one
    }
  }

  /** Fetches a waiting MMS now, as the owner tapped it. It stays listed until it came: if it does not
   *  come, it is marked so, to be tried again. */
  fun fetchWaiting(context: Context, location: String) {
    val one = changeWaiting(context, location) { it.put("fetching", true).put("failed", false) } ?: return
    fetch(context, location, one.optString("transaction"), one.optInt("sim", -1))
  }

  // A fetch ended: a waiting MMS that came leaves the list; one that did not is marked, and the
  // screens that show it are told, with no notice.
  private fun fetched(context: Context, location: String, ok: Boolean) {
    if (ok) {
      changeWaiting(context, location, null)
      return
    }
    val one = changeWaiting(context, location) { it.put("fetching", false).put("failed", true) } ?: return
    SmsStore.listener?.invoke("onSms", mapOf("address" to one.optString("from"), "waiting" to true, "failed" to true, "shown" to false))
  }

  /** The fetched message is in its file: keep it, and tell the carrier it came. */
  fun downloaded(context: Context, intent: Intent, ok: Boolean) {
    val name = intent.getStringExtra("file") ?: return
    val sim = intent.getIntExtra("sim", -1)
    val file = File(folder(context), name)
    try {
      val location = intent.getStringExtra("location")
      if (!ok || !file.exists()) {
        // Fetched again with the next notice the carrier sends, or a tap on a waiting one.
        location?.let {
          forget(context, it)
          fetched(context, it, false)
        }
        return
      }
      val message = MmsPdu.message(file.readBytes())
      val id = keep(context, message, sim)
      location?.let { fetched(context, it, true) }
      val transaction = intent.getStringExtra("transaction") ?: message.transactionId
      if (transaction.isNotEmpty()) acknowledge(context, transaction, sim)
      SmsStore.came(context, mapOf("address" to message.from, "mms" to id.toDouble()))
    } catch (_: Exception) {
      SmsStore.notifyNew(context)
      intent.getStringExtra("location")?.let { fetched(context, it, false) }
    } finally {
      file.delete()
    }
  }

  private fun acknowledge(context: Context, transaction: String, sim: Int) {
    val name = "ack-${System.currentTimeMillis()}.pdu"
    try {
      File(folder(context), name).writeBytes(MmsPdu.notifyResp(transaction))
      val done = Intent(context, MmsSentReceiver::class.java).setAction(SENT_ACTION).putExtra("file", name).putExtra("id", -1L)
      val pending = PendingIntent.getBroadcast(context, name.hashCode(), done, PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
      SmsStore.manager(context, sim).sendMultimediaMessage(context, fileUri(context, name), null, null, pending)
    } catch (_: Exception) {
      // The carrier may announce it again; it is fetched once (remember()).
    }
  }

  // Locations already fetched, so a notice sent twice gives one message.
  private fun remember(context: Context, location: String): Boolean {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val list = (prefs.getString(FETCHED, "") ?: "").split('\n').filter { it.isNotEmpty() }
      if (location in list) return false
      prefs.edit().putString(FETCHED, (list.takeLast(MAX_FETCHED - 1) + location).joinToString("\n")).apply()
      return true
    }
  }

  private fun forget(context: Context, location: String) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val list = (prefs.getString(FETCHED, "") ?: "").split('\n').filter { it.isNotEmpty() && it != location }
      prefs.edit().putString(FETCHED, list.joinToString("\n")).apply()
    }
  }

  /** Writes a message that came into Android's MMS store. Returns its row. */
  private fun keep(context: Context, message: MmsPdu.Message, sim: Int): Long {
    // A message to this phone alone says its number: kept, to tell this phone from the others in a group's.
    if (message.to.size == 1) learnOwn(context, message.to[0])
    val own = ownNumbers(context)
    val others = (listOf(message.from) + message.to).filter { it.isNotEmpty() }
      .filter { n -> own.none { SmsStore.sameNumber(it, n) } }
      .fold(ArrayList<String>()) { kept, n -> if (kept.none { SmsStore.sameNumber(it, n) }) kept.add(n); kept }
    val thread = if (others.size > 1) Telephony.Threads.getOrCreateThreadId(context, others.toSet())
      else Telephony.Threads.getOrCreateThreadId(context, message.from.ifEmpty { "Unknown" })
    val now = System.currentTimeMillis() / 1000
    val values = ContentValues().apply {
      put(Telephony.Mms.THREAD_ID, thread)
      put(Telephony.Mms.DATE, now)
      put(Telephony.Mms.DATE_SENT, if (message.date > 0) message.date else now)
      put(Telephony.Mms.MESSAGE_BOX, Telephony.Mms.MESSAGE_BOX_INBOX)
      put(Telephony.Mms.READ, 0)
      put(Telephony.Mms.SEEN, 0)
      put(Telephony.Mms.MESSAGE_TYPE, M_RETRIEVE_CONF)
      put(Telephony.Mms.MMS_VERSION, 0x12)
      put(Telephony.Mms.CONTENT_TYPE, "application/vnd.wap.multipart.related")
      put(Telephony.Mms.TRANSACTION_ID, message.transactionId)
      put(Telephony.Mms.MESSAGE_ID, message.messageId)
      if (message.subject.isNotEmpty()) put(Telephony.Mms.SUBJECT, message.subject)
      if (sim >= 0) put(Telephony.Mms.SUBSCRIPTION_ID, sim)
    }
    val row = context.contentResolver.insert(MMS, values) ?: throw IllegalStateException("The MMS was not kept")
    val id = row.lastPathSegment?.toLongOrNull() ?: throw IllegalStateException("The MMS was not kept")
    address(context, id, message.from, FROM)
    for (to in message.to) address(context, id, to, TO)
    message.parts.forEach { part(context, id, it) }
    return id
  }

  private fun address(context: Context, id: Long, address: String, type: Int) {
    if (address.isEmpty()) return
    val values = ContentValues().apply {
      put(Telephony.Mms.Addr.ADDRESS, address)
      put(Telephony.Mms.Addr.TYPE, type)
      put(Telephony.Mms.Addr.CHARSET, 106)
    }
    context.contentResolver.insert(Uri.parse("content://mms/$id/addr"), values)
  }

  private fun part(context: Context, id: Long, part: MmsPdu.Part) {
    val values = ContentValues().apply {
      put(Telephony.Mms.Part.CONTENT_TYPE, part.type)
      if (part.name.isNotEmpty()) {
        put(Telephony.Mms.Part.CONTENT_LOCATION, part.name)
        put(Telephony.Mms.Part.NAME, part.name)
      }
      if (part.isText) {
        put(Telephony.Mms.Part.CHARSET, 106)
        put(Telephony.Mms.Part.TEXT, part.text())
      } else if (part.charset > 0) {
        // A contact card's own character set, for the app that reads it.
        put(Telephony.Mms.Part.CHARSET, part.charset)
      }
    }
    val row = context.contentResolver.insert(Uri.parse("content://mms/$id/part"), values) ?: return
    if (!part.isText) context.contentResolver.openOutputStream(row)?.use { it.write(part.data) }
  }

  // --- Sending ---------------------------------------------------------------------------------

  /** A part's type as kept and compared: lower case, without its parameters. */
  private fun plainType(type: String): String = type.substringBefore(';').trim().lowercase()

  /** Whether a part is a sound: a voice message, as phones send them (AMR, 3GP, AAC, MP3, Ogg). */
  fun isVoice(type: String): Boolean = plainType(type).let { it.startsWith("audio/") || it == "application/ogg" }

  /** Whether a part is a contact card. */
  fun isCard(type: String): Boolean = plainType(type) in setOf("text/x-vcard", "text/vcard", "text/directory")

  /** A part's type, or, for one some phone sent as mere bytes, what the ending of its name says. */
  private fun typeOf(type: String, name: String): String =
    if (type != "application/octet-stream") type
    else when (name.substringAfterLast('.', "").lowercase()) {
      "amr" -> "audio/amr"
      "m4a" -> "audio/mp4"
      "vcf" -> "text/x-vcard"
      "mp4" -> "video/mp4"
      "3gp" -> "video/3gpp"
      else -> type
    }

  /** The name a part to send goes by, from its type, as messaging apps name theirs. */
  private fun partName(type: String): String =
    when (plainType(type)) {
      "image/png" -> "image.png"
      "image/gif" -> "image.gif"
      "audio/amr" -> "voice.amr"
      "audio/amr-wb" -> "voice.awb"
      "audio/3gpp" -> "voice.3gp"
      "audio/mp4", "audio/aac", "audio/x-m4a" -> "voice.m4a"
      "audio/mpeg" -> "voice.mp3"
      "audio/ogg", "application/ogg" -> "voice.ogg"
      "video/3gpp" -> "video.3gp"
      "video/3gpp2" -> "video.3g2"
      "video/webm" -> "video.webm"
      else -> when {
        plainType(type).startsWith("video/") -> "video.mp4"
        isCard(type) -> "contact.vcf"
        isVoice(type) -> "voice"
        else -> "image.jpg"
      }
    }

  /** Sends a part (a picture, a voice message or a contact card) and text with it, or text alone,
   *  to one number, or to a group's numbers given comma-separated. Returns the MMS row, or -1. */
  fun send(context: Context, address: String, text: String, data: ByteArray?, type: String, sim: Int): Long {
    val to = SmsStore.numbers(address)
    if (to.isEmpty()) throw IllegalArgumentException("No number")
    val parts = ArrayList<MmsPdu.Part>()
    if (data != null && data.isNotEmpty()) {
      // A contact card is text: it says it is UTF-8, as writeVCard (lib/vcard.ts) writes it.
      parts.add(MmsPdu.Part(type, data, partName(type), if (isCard(type)) 106 else 0))
    }
    if (text.isNotEmpty()) parts.add(MmsPdu.Part("text/plain", text.toByteArray(Charsets.UTF_8), "text.txt", 106))
    if (parts.isEmpty()) throw IllegalArgumentException("Nothing to send")
    val transaction = "T" + java.lang.Long.toHexString(System.currentTimeMillis())
    val name = "out-${System.currentTimeMillis()}.pdu"
    File(folder(context), name).writeBytes(MmsPdu.sendReq(transaction, to, parts))
    var id = -1L
    if (SmsStore.isDefault(context)) {
      val values = ContentValues().apply {
        put(Telephony.Mms.THREAD_ID, SmsStore.threadId(context, address) ?: Telephony.Threads.getOrCreateThreadId(context, to[0]))
        put(Telephony.Mms.DATE, System.currentTimeMillis() / 1000)
        put(Telephony.Mms.MESSAGE_BOX, Telephony.Mms.MESSAGE_BOX_OUTBOX)
        put(Telephony.Mms.READ, 1)
        put(Telephony.Mms.SEEN, 1)
        put(Telephony.Mms.MESSAGE_TYPE, M_SEND_REQ)
        put(Telephony.Mms.MMS_VERSION, 0x12)
        put(Telephony.Mms.CONTENT_TYPE, "application/vnd.wap.multipart.mixed")
        put(Telephony.Mms.TRANSACTION_ID, transaction)
        if (sim >= 0) put(Telephony.Mms.SUBSCRIPTION_ID, sim)
      }
      id = context.contentResolver.insert(MMS, values)?.lastPathSegment?.toLongOrNull() ?: -1L
      if (id >= 0) {
        to.forEach { address(context, id, it, TO) }
        parts.forEach { part(context, id, it) }
      }
    }
    val done = Intent(context, MmsSentReceiver::class.java).setAction(SENT_ACTION).putExtra("file", name).putExtra("id", id)
    val pending = PendingIntent.getBroadcast(context, name.hashCode(), done, PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    try {
      SmsStore.manager(context, sim).sendMultimediaMessage(context, fileUri(context, name), null, null, pending)
    } catch (e: Exception) {
      File(folder(context), name).delete()
      sent(context, id, false)
      throw e
    }
    return id
  }

  fun sentResult(context: Context, intent: Intent, ok: Boolean) {
    intent.getStringExtra("file")?.let { File(folder(context), it).delete() }
    // The answer that a message was fetched needs nothing more.
    if (intent.getStringExtra("file")?.startsWith("out-") == true) sent(context, intent.getLongExtra("id", -1L), ok)
  }

  private fun sent(context: Context, id: Long, ok: Boolean) {
    if (id >= 0 && SmsStore.isDefault(context)) {
      val values = ContentValues().apply {
        put(Telephony.Mms.MESSAGE_BOX, if (ok) Telephony.Mms.MESSAGE_BOX_SENT else Telephony.Mms.MESSAGE_BOX_FAILED)
      }
      context.contentResolver.update(Uri.withAppendedPath(MMS, id.toString()), values, null, null)
    }
    SmsStore.listener?.invoke("onSmsSent", mapOf("id" to id.toDouble(), "ok" to ok, "mms" to true))
  }

  // --- Reading ---------------------------------------------------------------------------------

  /** The MMS of a conversation, newest first, at most `limit`, as SmsStore.messages gives them. */
  fun messages(context: Context, thread: Long, limit: Int): List<Map<String, Any?>> {
    val out = ArrayList<Map<String, Any?>>()
    val projection = arrayOf(Telephony.Mms._ID, Telephony.Mms.DATE, Telephony.Mms.MESSAGE_BOX, Telephony.Mms.READ, Telephony.Mms.SUBSCRIPTION_ID, Telephony.Mms.MESSAGE_TYPE, Telephony.Mms.SUBJECT)
    context.contentResolver.query(MMS, projection, "${Telephony.Mms.THREAD_ID}=?", arrayOf(thread.toString()), "${Telephony.Mms.DATE} DESC")?.use { c ->
      while (c.moveToNext() && out.size < limit) {
        // A notice another app kept, never fetched: there is nothing to show.
        if (c.getInt(5) == 130) continue
        val id = c.getLong(0)
        val box = c.getInt(2)
        val found = parts(context, id)
        val text = found.text
        val subject = c.getString(6) ?: ""
        out.add(
          mapOf(
            "id" to id.toDouble(),
            "kind" to "mms",
            "text" to listOf(subject, text).filter { it.isNotEmpty() }.joinToString("\n"),
            "at" to c.getLong(1) * 1000.0,
            "mine" to (box != Telephony.Mms.MESSAGE_BOX_INBOX),
            "state" to when (box) {
              Telephony.Mms.MESSAGE_BOX_FAILED -> "failed"
              Telephony.Mms.MESSAGE_BOX_OUTBOX -> "sending"
              Telephony.Mms.MESSAGE_BOX_SENT -> "sent"
              else -> "done"
            },
            "read" to (c.getInt(3) != 0),
            "sim" to c.getInt(4).toDouble(),
            // Who wrote it, for a group's conversation.
            "from" to (if (box == Telephony.Mms.MESSAGE_BOX_INBOX) addressOf(context, id, false) else ""),
            "pictures" to found.pictures,
            "voices" to found.voices,
            "cards" to found.cards,
            "videos" to found.videos,
          ),
        )
      }
    }
    return out
  }

  /** A message's text, and its pictures, sounds and contact cards as content addresses the app may
   *  read (partBytes). Destructured, the first two are its text and its pictures. */
  data class Parts(val text: String, val pictures: List<Map<String, Any?>>, val voices: List<Map<String, Any?>>, val cards: List<Map<String, Any?>>, val videos: List<Map<String, Any?>> = emptyList()) {
    /** What the list says of one without text, in English: the app says it in the owner's language (lib/sms-rows.ts). */
    fun word(): String = when {
      pictures.isNotEmpty() -> "Picture"
      videos.isNotEmpty() -> "Video"
      voices.isNotEmpty() -> "Voice message"
      cards.isNotEmpty() -> "Contact card"
      else -> "MMS"
    }
  }

  fun parts(context: Context, id: Long): Parts {
    val texts = ArrayList<String>()
    val pictures = ArrayList<Map<String, Any?>>()
    val voices = ArrayList<Map<String, Any?>>()
    val cards = ArrayList<Map<String, Any?>>()
    val videos = ArrayList<Map<String, Any?>>()
    val projection = arrayOf(Telephony.Mms.Part._ID, Telephony.Mms.Part.CONTENT_TYPE, Telephony.Mms.Part.TEXT, Telephony.Mms.Part.NAME, Telephony.Mms.Part.CONTENT_LOCATION)
    context.contentResolver.query(PARTS, projection, "${Telephony.Mms.Part.MSG_ID}=?", arrayOf(id.toString()), null)?.use { c ->
      while (c.moveToNext()) {
        val name = listOf(c.getString(3), c.getString(4)).firstOrNull { !it.isNullOrBlank() } ?: ""
        val type = typeOf(plainType(c.getString(1) ?: continue), name)
        val part = mapOf("uri" to "content://mms/part/${c.getLong(0)}", "type" to type)
        when {
          type == "text/plain" -> c.getString(2)?.let { if (it.isNotEmpty()) texts.add(it) }
          type.startsWith("image/") -> pictures.add(part)
          type.startsWith("video/") -> videos.add(part)
          isVoice(type) -> voices.add(part)
          isCard(type) -> cards.add(part)
        }
      }
    }
    return Parts(texts.joinToString("\n"), pictures, voices, cards, videos)
  }

  /** The numbers of a conversation, as Android keeps them for its thread. */
  fun recipients(context: Context, thread: Long): List<String> {
    try {
      val ids = context.contentResolver.query(Uri.parse("content://mms-sms/conversations?simple=true"), arrayOf("_id", "recipient_ids"), "_id=?", arrayOf(thread.toString()), null)?.use { c ->
        if (c.moveToFirst()) (c.getString(1) ?: "").split(' ').mapNotNull { it.trim().toLongOrNull() } else emptyList()
      } ?: return emptyList()
      if (ids.isEmpty()) return emptyList()
      val found = HashMap<Long, String>()
      context.contentResolver.query(Uri.parse("content://mms-sms/canonical-addresses"), arrayOf("_id", "address"), "_id IN (${ids.joinToString(",")})", null, null)?.use { c ->
        while (c.moveToNext()) found[c.getLong(0)] = c.getString(1) ?: ""
      }
      return ids.mapNotNull { found[it]?.takeIf { a -> a.isNotEmpty() } }
    } catch (_: Exception) {
      return emptyList()
    }
  }

  // This phone's own numbers: what Android says, and what messages to it alone said.
  private fun ownNumbers(context: Context): List<String> {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val own = (prefs.getString(OWN, "") ?: "").split('\n').filter { it.isNotEmpty() }.toMutableList()
    try {
      val phone = context.getSystemService(android.telephony.TelephonyManager::class.java)
      @Suppress("DEPRECATION", "HardwareIds") phone?.line1Number?.let { if (it.isNotBlank()) own.add(it) }
      for (sim in SmsStore.sims(context)) {
        val id = (sim["id"] as Double).toInt()
        @Suppress("DEPRECATION", "HardwareIds") phone?.createForSubscriptionId(id)?.line1Number?.let { if (it.isNotBlank()) own.add(it) }
      }
    } catch (_: Exception) {
      // Android would not say: the numbers learnt from messages are enough.
    }
    return own
  }

  private fun learnOwn(context: Context, number: String) {
    if (number.isBlank()) return
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    synchronized(this) {
      val own = (prefs.getString(OWN, "") ?: "").split('\n').filter { it.isNotEmpty() }
      if (own.any { SmsStore.sameNumber(it, number) }) return
      prefs.edit().putString(OWN, (own.takeLast(3) + number).joinToString("\n")).apply()
    }
  }

  /** The other side of an MMS: who sent it, or whom it went to. */
  fun addressOf(context: Context, id: Long, mine: Boolean): String {
    val type = if (mine) TO else FROM
    context.contentResolver.query(Uri.parse("content://mms/$id/addr"), arrayOf(Telephony.Mms.Addr.ADDRESS), "${Telephony.Mms.Addr.TYPE}=?", arrayOf(type.toString()), null)?.use { c ->
      if (c.moveToFirst()) return c.getString(0) ?: ""
    }
    return ""
  }

  /** The newest MMS of each conversation, newest first: thread, row, time (ms), whether mine, how
   *  many are not read, and whether any is ours. */
  fun latest(context: Context, rows: Int): List<LongArray> {
    val out = LinkedHashMap<Long, LongArray>()
    val projection = arrayOf(Telephony.Mms.THREAD_ID, Telephony.Mms._ID, Telephony.Mms.DATE, Telephony.Mms.MESSAGE_BOX, Telephony.Mms.READ, Telephony.Mms.MESSAGE_TYPE)
    try {
      context.contentResolver.query(MMS, projection, null, null, "${Telephony.Mms.DATE} DESC")?.use { c: Cursor ->
        var n = 0
        while (c.moveToNext() && n++ < rows) {
          if (c.getInt(5) == 130) continue
          val thread = c.getLong(0)
          val inbox = c.getInt(3) == Telephony.Mms.MESSAGE_BOX_INBOX
          val unread = if (inbox && c.getInt(4) == 0) 1L else 0L
          val seen = out[thread]
          if (seen == null) out[thread] = longArrayOf(thread, c.getLong(1), c.getLong(2) * 1000, if (inbox) 0 else 1, unread, if (inbox) 0 else 1)
          else {
            seen[4] += unread
            if (!inbox) seen[5] = 1
          }
        }
      }
    } catch (_: Exception) {
      // No MMS store on this device.
    }
    return out.values.toList()
  }

  /** Deletes a conversation's MMS up to `upTo` (milliseconds; the store keeps seconds). */
  fun deleteThread(context: Context, thread: Long, upTo: Long): Int =
    try {
      context.contentResolver.delete(MMS, "${Telephony.Mms.THREAD_ID}=? AND ${Telephony.Mms.DATE}<=?", arrayOf(thread.toString(), (upTo / 1000).toString()))
    } catch (_: Exception) {
      // No MMS store on this device.
      0
    }

  /** Sends again one of ours that did not go: its text and first picture, sound or contact card, to
   *  the numbers it was for, as a new MMS in place of the old one. Returns the new row. */
  fun resend(context: Context, id: Long, sim: Int): Long {
    val to = ArrayList<String>()
    context.contentResolver.query(Uri.parse("content://mms/$id/addr"), arrayOf(Telephony.Mms.Addr.ADDRESS), "${Telephony.Mms.Addr.TYPE}=?", arrayOf(TO.toString()), null)?.use { c ->
      while (c.moveToNext()) c.getString(0)?.takeIf { it.isNotBlank() && it != "insert-address-token" }?.let { to.add(it) }
    }
    var was = -1
    context.contentResolver.query(Uri.withAppendedPath(MMS, id.toString()), arrayOf(Telephony.Mms.SUBSCRIPTION_ID), null, null, null)?.use { c ->
      if (c.moveToFirst() && !c.isNull(0)) was = c.getInt(0)
    }
    val found = parts(context, id)
    val text = found.text
    val picture = (found.pictures + found.videos + found.voices + found.cards).firstOrNull()
    val data = picture?.let { partBytes(context, it["uri"] as String) }
    require(to.isNotEmpty() && (text.isNotEmpty() || data != null)) { "That MMS is no longer on the phone" }
    val sent = send(context, to.joinToString(","), text, data, (picture?.get("type") as String?) ?: "", if (sim >= 0) sim else was)
    if (SmsStore.isDefault(context)) context.contentResolver.delete(Uri.withAppendedPath(MMS, id.toString()), null, null)
    return sent
  }

  /** The bytes of an MMS's part (a picture, a sound, a contact card), by the address parts() gives
   *  it; at most MAX_PART_BYTES. */
  fun partBytes(context: Context, uri: String): ByteArray {
    val id = uri.removePrefix("content://mms/part/").toLongOrNull()
    require(uri.startsWith("content://mms/part/") && id != null) { "Not a part of an MMS" }
    val bytes = context.contentResolver.openInputStream(Uri.withAppendedPath(PARTS, id.toString()))?.use { input ->
      val out = java.io.ByteArrayOutputStream()
      val chunk = ByteArray(64 * 1024)
      while (true) {
        val n = input.read(chunk)
        if (n < 0) break
        out.write(chunk, 0, n)
        require(out.size() <= MAX_PART_BYTES) { "That part of the MMS is too large" }
      }
      out.toByteArray()
    }
    return bytes ?: throw IllegalStateException("That part of the MMS is no longer on the phone")
  }

  fun markRead(context: Context, thread: Long) {
    val values = ContentValues().apply {
      put(Telephony.Mms.READ, 1)
      put(Telephony.Mms.SEEN, 1)
    }
    try {
      context.contentResolver.update(MMS, values, "${Telephony.Mms.THREAD_ID}=? AND ${Telephony.Mms.READ}=0", arrayOf(thread.toString()))
    } catch (_: Exception) {
      // No MMS store on this device.
    }
  }
}

/** A notice that an MMS waits. Only the default SMS app gets WAP_PUSH_DELIVER. */
class MmsDeliverReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.WAP_PUSH_DELIVER_ACTION) return
    val pdu = intent.getByteArrayExtra("data") ?: return
    if (MmsPdu.typeOf(pdu) != MmsPdu.NOTIFICATION_IND) return
    MmsStore.notified(context, pdu, simOf(intent))
  }
}

/** The phone's MMS service fetched a message into its file. */
class MmsDownloadedReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val pending = goAsync()
    val ok = resultCode == Activity.RESULT_OK
    Thread {
      try {
        MmsStore.downloaded(context, intent, ok)
      } finally {
        pending.finish()
      }
    }.start()
  }
}

/** Whether an MMS, or the answer that one was fetched, went. */
class MmsSentReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    MmsStore.sentResult(context, intent, resultCode == Activity.RESULT_OK)
  }
}

/** The files the phone's MMS service reads a message to send from, and writes one fetched into. */
class MmsFiles : ContentProvider() {
  companion object {
    fun authority(context: Context) = "${context.packageName}.erevossms.mms"
    private val NAME = Regex("^(in|out|ack)-\\d+\\.pdu$")
  }

  override fun onCreate() = true

  override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor? {
    val context = context ?: return null
    val name = uri.lastPathSegment ?: return null
    if (!NAME.matches(name)) return null
    return ParcelFileDescriptor.open(File(MmsStore.folder(context), name), ParcelFileDescriptor.parseMode(mode))
  }

  override fun query(uri: Uri, projection: Array<out String>?, selection: String?, selectionArgs: Array<out String>?, sortOrder: String?): Cursor? = null
  override fun getType(uri: Uri): String = "application/vnd.wap.mms-message"
  override fun insert(uri: Uri, values: ContentValues?): Uri? = null
  override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?) = 0
  override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?) = 0
}

/** The SIM a message came in on, as Android names it in the broadcast, or -1. */
internal fun simOf(intent: Intent): Int {
  val index = intent.getIntExtra("android.telephony.extra.SUBSCRIPTION_INDEX", -1)
  return if (index >= 0) index else intent.getIntExtra("subscription", -1)
}
