// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import android.util.Base64
import android.util.Log
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Semaphore
import java.util.concurrent.atomic.AtomicLong
import org.drinkless.tdlib.JsonClient
import org.json.JSONObject

/**
 * TDLib through its JSON interface, one client for each space that has a Telegram account. A space
 * is named by its `slot`: hex the app makes from the space's key, so nothing on the phone says which
 * space, hidden or not, a folder belongs to. Each client keeps its database and files under
 * noBackupFilesDir/telegram/<slot>, the database encrypted by TDLib with the 32-byte key the app
 * gives when it opens the space (from the space's own key, never kept here).
 *
 * One thread takes everything TDLib says. An answer goes back to the call that asked for it (by
 * "@extra"); updates go to the app in batches, without those it has no use for, and a file's
 * progress at most twice a second (lib/telegram.ts). Both threads sleep while TDLib says nothing,
 * so a phone with no Telegram account, or with its space closed, is not woken for them.
 *
 * A client that closes holds its database until TDLib says it has closed. A space that locks and
 * opens again at once asks to open the slot while its client still closes: the new client starts
 * as soon as the old one has closed (`again`).
 */
internal object Tdlib {
  private const val TAG = "ErevosTelegram"
  private const val BATCH_MS = 50L
  private const val FILE_PROGRESS_MS = 500L

  /** Updates the app does not use: not worth crossing to JavaScript. */
  private val QUIET = setOf(
    "updateAnimationSearchParameters", "updateDiceEmojis", "updateAttachmentMenuBots", "updateWebAppMessageSent",
    "updateDefaultReactionType", "updateDefaultPaidReactionType", "updateAvailableMessageEffects", "updateStoryStealthMode",
    "updateSpeechRecognitionTrial", "updateAccentColors", "updateProfileAccentColors", "updateChatThemes",
    "updateSavedAnimations", "updateSavedNotificationSounds", "updateRecentStickers", "updateFavoriteStickers",
    "updateTrendingStickerSets", "updateInstalledStickerSets", "updateActiveEmojiReactions", "updateAnimatedEmojiMessageClicked",
    "updateSuggestedActions", "updateContactCloseBirthdays", "updateFileDownloads", "updateFileAddedToDownloads",
    "updateFileDownload", "updateFileRemovedFromDownloads", "updateStarRevenueStatus", "updateOwnedStarCount",
    "updateBusinessConnection", "updateReactionNotificationSettings", "updateTimeZones", "updateDefaultBackground",
    "updateAutosaveSettings",
  )

  class Client(val slot: String, val id: Int, val dir: File, val key: ByteArray, val lang: String, val proxy: String) {
    /** Logging out: TDLib then closes by itself, and deletes its database. */
    @Volatile var leaving = false
    /** Closing, by close, destroy or logging out: asked nothing more. */
    @Volatile var closing = false
    /** Asked to open again while it closes: the key, the language and the proxy to open it with once it has. */
    var again: Triple<ByteArray, String, String>? = null
  }

  private val bySlot = ConcurrentHashMap<String, Client>()
  private val byId = ConcurrentHashMap<Int, Client>()
  private val waiting = ConcurrentHashMap<String, (String) -> Unit>()
  private val extra = AtomicLong(1)
  private val lastFileShown = ConcurrentHashMap<String, Long>()

  /** Where updates go: the slot and a batch of JSON texts. */
  @Volatile var onUpdates: ((String, List<String>) -> Unit)? = null

  private lateinit var app: Context
  private var loop: Thread? = null
  private var flusher: Thread? = null
  private val pending = LinkedHashMap<String, MutableList<String>>()
  // Released for each update that waits to go: the thread that sends the batches sleeps on it.
  private val waits = Semaphore(0)

  @Synchronized
  fun start(context: Context) {
    app = context.applicationContext
    if (loop != null) return
    // TDLib's own log: errors only, written nowhere.
    runCatching {
      JsonClient.execute("""{"@type":"setLogVerbosityLevel","new_verbosity_level":1}""")
      JsonClient.execute("""{"@type":"setLogStream","log_stream":{"@type":"logStreamEmpty"}}""")
    }
    loop = Thread({
      while (true) {
        // Comes back as soon as TDLib says something; with nothing to hear, twice a minute.
        val text = runCatching { JsonClient.receive(30.0) }.getOrNull() ?: continue
        runCatching { take(text) }.onFailure { Log.w(TAG, "receive: ${it.message}") }
      }
    }, "erevos-telegram").apply { isDaemon = true; start() }
    flusher = Thread({
      while (true) {
        // Sleeps until an update waits, then lets those that follow it at once gather with it.
        waits.acquire()
        waits.drainPermits()
        Thread.sleep(BATCH_MS)
        flush()
      }
    }, "erevos-telegram-batches").apply { isDaemon = true; start() }
  }

  fun available(): Boolean = BuildConfig.TG_API_ID != 0 && BuildConfig.TG_API_HASH.isNotEmpty()

  /** The folder of a slot; only hex is taken, so a slot cannot point anywhere else. */
  fun dirOf(slot: String): File {
    require(Regex("[0-9a-f]{16,64}").matches(slot)) { "bad slot" }
    return File(File(app.noBackupFilesDir, "telegram"), slot)
  }

  /**
   * Opens the space's client, once; it asks for its parameters, and they are given (`parameters`).
   * `proxy`, when not empty, is an addProxy request (the way into Tor) sent right after them, before
   * TDLib first connects, so an account that must go through Tor never goes straight as it starts.
   */
  @Synchronized
  fun open(slot: String, key: ByteArray, lang: String, proxy: String) {
    require(key.size == 32) { "the key is 32 bytes" }
    // Not while this app moved out to another edition, nor while a move's databases wait to be put
    // in place (erevos-device MoveNet.kt); and once one opens, a move's wait for the next start.
    check(!File(app.filesDir, "moved-out.json").exists() && !File(app.filesDir, "move-net-in/ready").exists()) { "Erevos moved, or is taking a move" }
    System.setProperty("erevos.move.engine-open", "1")
    val old = bySlot[slot]
    if (old != null) {
      // Still closing: its database is TDLib's until it has closed, so the new client starts then (take).
      if (old.closing) {
        old.again?.first?.fill(0)
        old.again = Triple(key.copyOf(), lang, proxy)
      }
      return
    }
    create(slot, key, lang, proxy)
  }

  private fun create(slot: String, key: ByteArray, lang: String, proxy: String) {
    val client = Client(slot, JsonClient.createClientId(), dirOf(slot), key.copyOf(), lang.ifEmpty { "en" }, proxy)
    bySlot[slot] = client
    byId[client.id] = client
    // A client says nothing until it is asked something.
    JsonClient.send(client.id, """{"@type":"getOption","name":"version"}""")
  }

  /** Sends a request of the slot's client; `answer` has TDLib's answer, an error object too. */
  fun send(slot: String, request: String, answer: (String) -> Unit) {
    val client = bySlot[slot] ?: return answer("""{"@type":"error","code":400,"message":"Telegram is not open"}""")
    // One that closes answers nothing more of use; the client that follows it is asked once it is there.
    if (client.closing) return answer("""{"@type":"error","code":400,"message":"Telegram is not open"}""")
    val o = JSONObject(request)
    if (o.optString("@type") == "logOut") {
      client.leaving = true
      client.closing = true
    }
    val tag = "e" + extra.getAndIncrement()
    o.put("@extra", tag)
    waiting[tag] = answer
    JsonClient.send(client.id, o.toString())
  }

  /** Closes the slot's client: TDLib then says it is closed, and it is let go of. */
  @Synchronized
  fun close(slot: String) {
    val client = bySlot[slot] ?: return
    // Closed after it was asked to open again: it stays closed.
    client.again?.first?.fill(0)
    client.again = null
    if (client.closing) return
    client.closing = true
    JsonClient.send(client.id, """{"@type":"close"}""")
  }

  private val wiping = ConcurrentHashMap.newKeySet<String>()

  /**
   * Deletes everything of the slot from the phone: its database, files and keys. An open client is
   * destroyed first (TDLib closes it without logging out), and its folder goes once it is closed.
   */
  @Synchronized
  fun wipe(slot: String) {
    val dir = dirOf(slot)
    val client = bySlot[slot]
    if (client == null) {
      dir.deleteRecursively()
      return
    }
    wiping += slot
    client.again?.first?.fill(0)
    client.again = null
    // Logging out ends in closing by itself: a destroy now would cut the logging out short, so
    // Telegram would keep this device among its sessions. One that closes already goes as it closes.
    if (client.closing) return
    client.closing = true
    JsonClient.send(client.id, """{"@type":"destroy"}""")
  }

  /** The slots that have a folder on the phone (their names say nothing of their spaces). */
  fun slots(): List<String> =
    File(app.noBackupFilesDir, "telegram").listFiles()?.filter { it.isDirectory }?.map { it.name } ?: emptyList()

  private fun take(text: String) {
    val o = JSONObject(text)
    val id = o.optInt("@client_id", -1)
    val client = byId[id] ?: return
    val tag = o.optString("@extra", "")
    if (tag.isNotEmpty()) {
      o.remove("@extra")
      o.remove("@client_id")
      waiting.remove(tag)?.invoke(o.toString())
      return
    }
    val type = o.optString("@type")
    if (type == "updateAuthorizationState") {
      when (o.optJSONObject("authorization_state")?.optString("@type")) {
        "authorizationStateWaitTdlibParameters" -> {
          JsonClient.send(client.id, parameters(client).toString())
          // TDLib does what it is asked in order: the proxy is on before it connects at all.
          if (client.proxy.isNotEmpty()) {
            runCatching { JsonClient.send(client.id, JSONObject(client.proxy).put("@extra", "proxy").toString()) }
              .onFailure { Log.w(TAG, "proxy: ${it.message}") }
          }
        }
        "authorizationStateClosed" -> closed(client)
      }
    }
    if (type in QUIET) return
    if (type == "updateFile") {
      val file = o.optJSONObject("file")
      val done = file?.optJSONObject("local")?.optBoolean("is_downloading_completed") == true ||
        file?.optJSONObject("remote")?.optBoolean("is_uploading_completed") == true
      val fileKey = "${client.slot}:${file?.optInt("id")}"
      val now = System.currentTimeMillis()
      if (!done && now - (lastFileShown[fileKey] ?: 0L) < FILE_PROGRESS_MS) return
      lastFileShown[fileKey] = now
      if (done) lastFileShown.remove(fileKey)
    }
    o.remove("@client_id")
    synchronized(pending) { pending.getOrPut(client.slot) { ArrayList() }.add(o.toString()) }
    waits.release()
  }

  // After closing or logging out, the client is done; the app opens a new one when needed, and
  // one it asked for while this one closed starts now.
  @Synchronized
  private fun closed(client: Client) {
    bySlot.remove(client.slot, client)
    byId.remove(client.id)
    client.key.fill(0)
    if (wiping.remove(client.slot)) client.dir.deleteRecursively()
    val again = client.again ?: return
    client.again = null
    runCatching { create(client.slot, again.first, again.second, again.third) }.onFailure { Log.w(TAG, "open again: ${it.message}") }
    again.first.fill(0)
  }

  private fun flush() {
    val out = synchronized(pending) {
      if (pending.isEmpty()) return
      val copy = LinkedHashMap(pending)
      pending.clear()
      copy
    }
    val to = onUpdates ?: return
    for ((slot, list) in out) runCatching { to(slot, list) }.onFailure { Log.w(TAG, "updates: ${it.message}") }
  }

  private fun parameters(c: Client): JSONObject = JSONObject().apply {
    put("@type", "setTdlibParameters")
    put("use_test_dc", false)
    put("database_directory", File(c.dir, "db").absolutePath)
    // Media stays in the app's private storage, out of the phone's gallery.
    put("files_directory", File(c.dir, "files").absolutePath)
    put("database_encryption_key", Base64.encodeToString(c.key, Base64.NO_WRAP))
    put("use_file_database", true)
    put("use_chat_info_database", true)
    put("use_message_database", true)
    put("use_secret_chats", true)
    put("api_id", BuildConfig.TG_API_ID)
    put("api_hash", BuildConfig.TG_API_HASH)
    put("system_language_code", c.lang)
    // "Active sessions" shows only "ErevosGram": no phone model, no Android version. Not empty on
    // purpose: an empty value makes TDLib fill in the real ones.
    put("device_model", "ErevosGram")
    put("system_version", "ErevosGram")
    put("application_version", appVersion())
  }

  private fun appVersion(): String = runCatching {
    app.packageManager.getPackageInfo(app.packageName, 0).versionName
  }.getOrNull() ?: "1"
}
