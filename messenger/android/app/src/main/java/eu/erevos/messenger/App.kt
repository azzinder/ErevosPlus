// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import eu.erevos.messenger.engine.Cell
import eu.erevos.messenger.engine.CellMaker
import eu.erevos.messenger.engine.EngineHost
import eu.erevos.messenger.engine.Engines
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

/** One chat in the list. */
data class ThreadRow(
    val key: Long,
    var name: String,
    var snippet: String,
    var lastMs: Long,
    val encrypted: Boolean,
    val group: Boolean,
    /** Something came after the owner last read it. */
    var unread: Boolean = false,
    /** The pinned message's id, or empty. */
    var pinned: String = "",
    /** Which network the chat is on: "messenger" or "signal". */
    val network: String = "messenger",
)

/** The message a reply answers. */
data class Quote(val id: String, val text: String, val sender: Long, val name: String)

/** A poll: its options, and who chose what (person → option ids). */
class PollRow(val poll: Long, var question: String) {
    var options: List<Pair<Long, String>> = emptyList()
    val votes = HashMap<Long, MutableSet<Long>>()
}

/** A photo, video, voice message, file, sticker or link preview that came with a message. */
data class Att(
    val kind: String,
    val url: String,
    val playUrl: String,
    val mime: String,
    val w: Int,
    val h: Int,
    val name: String,
    val title: String,
    val link: String,
)

/** One message on screen. */
data class MessageRow(
    val id: String,
    val sender: Long,
    val name: String,
    val text: String,
    val ms: Long,
    val mine: Boolean,
    val encrypted: Boolean,
    val attachments: List<Att> = emptyList(),
    val forwarded: Boolean = false,
    val edited: Boolean = false,
    /** A sticker seen in an open chat, which can be sent again. */
    val stickerId: Long = 0L,
    val replyTo: Quote? = null,
)

/**
 * Holds the Go engine and what it has told us so far. The list and the latest
 * messages are also kept, sealed, on the phone (ListCache) to show at once.
 */
object Hub {
    const val CHANNEL_SERVICE = "service"
    const val CHANNEL_MESSAGES = "messages"

    private val main = Handler(Looper.getMainLooper())

    val threads = LinkedHashMap<Long, ThreadRow>()
    val messages = HashMap<Long, MutableList<MessageRow>>()
    /** Reactions per message id: person → emoji. */
    val reactions = HashMap<String, LinkedHashMap<Long, String>>()
    /** Polls by the id of the message that started them, and by poll id. */
    val pollOf = HashMap<String, PollRow>()
    val polls = HashMap<Long, PollRow>()
    /** Our own id on Messenger, once started. */
    var selfId = 0L
    /** Goes up when a group's members changed, to ask for them again. */
    var membersChanged: Int by mutableIntStateOf(0)
    /** Observed by Compose: reading these in a composable makes it redraw when they change. */
    var status: String by mutableStateOf("—")
    var lastError: String? by mutableStateOf(null)

    /**
     * Goes up on every change to [threads] or [messages], which are edited in
     * place. A composable that reads [version] redraws when anything arrives.
     */
    var version: Int by mutableIntStateOf(0)
        private set

    /** Goes up each time the app comes to the front, to ask for the history again. */
    var resumes: Int by mutableIntStateOf(0)

    /** Whether the app is in front right now. */
    var resumed = false

    /** The chat the person is looking at (set by the navigation), if any. */
    var openChat: Long? by mutableStateOf(null)

    /** The chat to leave a notification out for: the one on screen, while the app is in front. */
    val openThread: Long? get() = if (resumed) openChat else null

    /** For work that must finish even if the screen that started it is gone (main thread). */
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    /** Other listeners that want a call when something arrives (main thread). */
    val watchers = mutableSetOf<() -> Unit>()
    /** Called for each new message from someone else (the service notifies). */
    var onIncoming: ((ThreadRow?, MessageRow) -> Unit)? = null

    /** Messenger's own engine (Go). */
    fun messenger(op: String, args: JSONObject = JSONObject()): JSONObject = Engines.messenger(op, args)

    /**
     * One call, sent to the engine of the chat, message or person it names: Signal's keys are
     * between -2^62 and 0 and its message ids start with "sg:"; Session's keys are below -2^62
     * and its ids start with "ss:". Calls about everything (mark all read, people) go to all
     * and their answers are joined.
     */
    fun call(op: String, args: JSONObject = JSONObject()): JSONObject {
        // Reading a chat starts the clocks of its "after read" disappearing messages.
        if (op == "markRead") args.optLong("thread").let { t -> main.post { startReadClocks(t) } }
        if (op == "markAllRead") main.post { startReadClocks(null) }
        return Engines.call(op, args)
    }

    // ---- disappearing messages (Signal, Session) ----

    private var expiryFile: java.io.File? = null
    /** Messages whose clock runs: id → when to delete (ms). */
    private val deadlines = HashMap<String, Long>()
    /** Others' messages whose clock starts when read: id → (chat, seconds). */
    private val waitingRead = HashMap<String, Pair<Long, Long>>()
    /** Failed deletes per message, so one that cannot go is not tried forever. */
    private val expireTries = HashMap<String, Int>()
    /** expiry.bin is there but did not open: never write over it (its clocks would be lost). */
    private var expiryUnreadable = false

    /** A disappearing message: its clock starts at sending, or (others' "after read") when seen here. */
    private fun expiry(id: String, chat: Long, sentMs: Long, secs: Long, fromRead: Boolean) {
        if (id in deadlines || id in waitingRead) return
        if (fromRead && openThread != chat) {
            waitingRead[id] = chat to secs
        } else {
            val at = (if (fromRead) System.currentTimeMillis() else sentMs) + secs * 1000
            deadlines[id] = at
            schedule(id, at)
        }
        saveExpiry()
    }

    /** The chat was read (or all were): the clocks of its waiting messages start now. Main thread. */
    private fun startReadClocks(chat: Long?) {
        val now = System.currentTimeMillis()
        val started = waitingRead.filter { chat == null || it.value.first == chat }
        if (started.isEmpty()) return
        for ((id, v) in started) {
            waitingRead.remove(id)
            deadlines[id] = now + v.second * 1000
            schedule(id, now + v.second * 1000)
        }
        saveExpiry()
    }

    private fun schedule(id: String, atMs: Long) {
        main.postDelayed({ expireNow(id) }, (atMs - System.currentTimeMillis()).coerceAtLeast(0L))
    }

    private fun expireNow(id: String) {
        // Gone meanwhile (its account was removed, or it was already deleted).
        if (id !in deadlines) return
        val ready = when (networkOfMessage(id)) {
            "signal" -> eu.erevos.messenger.signal.Signal.ready
            "session" -> eu.erevos.messenger.session.Session.ready
            else -> true
        }
        // Its network not started yet (just after a restart): try again a little later.
        if (!ready) { main.postDelayed({ expireNow(id) }, 15_000L); return }
        scope.launch(Dispatchers.IO) {
            val r = call("deleteForMe", JSONObject().put("id", id))
            main.post {
                val tries = (expireTries[id] ?: 0) + 1
                if (r.has("error") && tries < 5 && id in deadlines) {
                    // Not deleted: keep its clock and try again later (1, 2, 4, 8 minutes).
                    expireTries[id] = tries
                    main.postDelayed({ expireNow(id) }, 60_000L shl (tries - 1))
                } else {
                    expireTries.remove(id)
                    deadlines.remove(id)
                    saveExpiry()
                }
            }
        }
    }

    private fun saveExpiry() {
        val f = expiryFile ?: return
        if (expiryUnreadable) return
        val o = JSONObject()
        val d = JSONObject(); deadlines.forEach { (k, v) -> d.put(k, v) }
        val w = JSONObject(); waitingRead.forEach { (k, v) -> w.put(k, JSONArray().put(v.first).put(v.second)) }
        o.put("deadlines", d).put("waiting", w)
        runCatching { f.writeBytes(KeyWrap.wrap(o.toString().toByteArray())) }
    }

    /** After a restart: every kept clock runs again, and what is overdue goes at once. */
    private fun loadExpiry() {
        val f = expiryFile ?: return
        if (!f.exists()) return
        val o = runCatching { JSONObject(String(KeyWrap.unwrap(f.readBytes()))) }.getOrNull()
        if (o == null) { expiryUnreadable = true; return }
        o.optJSONObject("deadlines")?.let { d -> d.keys().forEach { deadlines[it] = d.getLong(it) } }
        o.optJSONObject("waiting")?.let { w -> w.keys().forEach { k -> w.getJSONArray(k).let { waitingRead[k] = it.getLong(0) to it.getLong(1) } } }
        deadlines.forEach { (id, at) -> schedule(id, at) }
    }

    /** Removes a network's chats from the list (its account was removed). Main thread. */
    fun forgetNetwork(network: String) {
        threads.keys.filter { networkOf(it) == network }.forEach { threads.remove(it); messages.remove(it) }
        Later.forgetNetwork(network)
        // Its disappearing-message clocks go too; their messages went with the account.
        deadlines.keys.filter { networkOfMessage(it) == network }.forEach { deadlines.remove(it); expireTries.remove(it) }
        waitingRead.keys.filter { networkOfMessage(it) == network }.forEach { waitingRead.remove(it) }
        saveExpiry()
        changed()
    }

    /** The network a chat or person key belongs to. */
    fun networkOf(key: Long): String = Engines.networkOf(key)

    /** The network a message belongs to, by its id. */
    fun networkOfMessage(id: String): String = when {
        id.startsWith("ss:") -> "session"
        id.startsWith("sg:") -> "signal"
        else -> "messenger"
    }

    /** Our own person key in a chat (each network has its own). */
    fun selfFor(chat: Long): Long = when {
        eu.erevos.messenger.session.Session.isKey(chat) -> eu.erevos.messenger.session.Session.selfId
        eu.erevos.messenger.signal.Signal.isKey(chat) -> eu.erevos.messenger.signal.Signal.selfId
        else -> selfId
    }

    /** Our own person key for a message, by its id. */
    fun selfForMessage(id: String): Long = when {
        id.startsWith("ss:") -> eu.erevos.messenger.session.Session.selfId
        id.startsWith("sg:") -> eu.erevos.messenger.signal.Signal.selfId
        else -> selfId
    }

    fun isMe(person: Long): Boolean =
        person != 0L && (person == selfId || person == eu.erevos.messenger.signal.Signal.selfId ||
            person == eu.erevos.messenger.session.Session.selfId)

    fun changed() {
        version++
        ListCache.touch()
        watchers.toList().forEach { it() }
    }

    /** Our own message, shown at once; if Meta echoes it later, the same id is skipped. */
    fun addOwn(key: Long, id: String, text: String, ms: Long, replyTo: Quote? = null, atts: List<Att> = emptyList()) {
        val list = messages.getOrPut(key) { mutableListOf() }
        if (id.isEmpty() || list.none { it.id == id }) {
            list.add(MessageRow(id, selfFor(key), "", text, ms, true, threads[key]?.encrypted == true, atts, replyTo = replyTo))
            list.sortBy { it.ms }
        }
        changed()
    }

    fun init(app: Application) {
        expiryFile = java.io.File(app.filesDir, "expiry.bin")
        loadExpiry()
        // Events of all three engines; Signal's and Session's own (sign-in, status) stay with them.
        Engines.init(app) { e ->
            main.post {
                when {
                    // Session calls go to the call screen, not to the chats.
                    e.optString("type") == "sessionCall" -> eu.erevos.messenger.calls.SessionCalls.onSignal(e)
                    eu.erevos.messenger.signal.Signal.takeOwn(e) || eu.erevos.messenger.session.Session.takeOwn(e) -> {}
                    else -> take(e)
                }
            }
        }
    }

    private fun parseAtts(a: JSONArray?): List<Att> {
        if (a == null) return emptyList()
        val out = ArrayList<Att>(a.length())
        for (i in 0 until a.length()) {
            val o = a.optJSONObject(i) ?: continue
            out.add(
                Att(
                    o.optString("kind"), o.optString("url"), o.optString("playUrl"), o.optString("mime"),
                    o.optInt("w"), o.optInt("h"), o.optString("name"), o.optString("title"), o.optString("link"),
                )
            )
        }
        return out
    }

    private fun parseOptions(a: JSONArray?): List<Pair<Long, String>>? {
        if (a == null) return null
        return (0 until a.length()).mapNotNull { i ->
            a.optJSONObject(i)?.let { it.optLong("id") to it.optString("text") }
        }
    }

    private fun take(e: JSONObject) {
        when (e.optString("type")) {
            "connected" -> status = "συνδεδεμένο"
            "e2eeConnected" -> status = "συνδεδεμένο + κρυπτογραφημένες"
            "disconnected" -> status = "επανασύνδεση…"
            "fatal" -> {
                status = "σφάλμα"
                lastError = e.optString("error")
            }
            "e2eeError" -> lastError = "Κρυπτογραφημένες: " + e.optString("error")
            "threadGone" -> threads.remove(e.optLong("key"))
            "reaction" -> {
                val id = e.optString("id")
                val actor = e.optLong("actor")
                val emoji = e.optString("emoji")
                val map = reactions.getOrPut(id) { LinkedHashMap() }
                if (emoji.isEmpty()) map.remove(actor) else map[actor] = emoji
            }
            "deleted" -> {
                val id = e.optString("id")
                val key = e.optLong("thread")
                val list = messages[key]
                if (list != null) list.removeAll { it.id == id }
                else messages.values.forEach { l -> l.removeAll { it.id == id } }
                reactions.remove(id)
            }
            "edited" -> {
                val id = e.optString("id")
                for (list in messages.values) {
                    val at = list.indexOfFirst { it.id == id }
                    if (at >= 0) list[at] = list[at].copy(text = e.optString("text"), edited = true)
                }
            }
            "pinned" -> threads[e.optLong("thread")]?.pinned = e.optString("id")
            "members" -> membersChanged++
            "poll" -> {
                val p = polls.getOrPut(e.optLong("poll")) { PollRow(e.optLong("poll"), "") }
                if (e.optString("question").isNotEmpty()) p.question = e.optString("question")
                parseOptions(e.optJSONArray("options"))?.let { p.options = it }
                pollOf[e.optString("id")] = p
            }
            "pollOptions" -> {
                val p = polls.getOrPut(e.optLong("poll")) { PollRow(e.optLong("poll"), "") }
                parseOptions(e.optJSONArray("options"))?.let { opts ->
                    p.options = (p.options + opts).distinctBy { it.first }
                }
            }
            "pollVote" -> {
                val p = polls.getOrPut(e.optLong("poll")) { PollRow(e.optLong("poll"), "") }
                val set = p.votes.getOrPut(e.optLong("actor")) { mutableSetOf() }
                if (e.optBoolean("on")) set.add(e.optLong("option")) else set.remove(e.optLong("option"))
            }
            "pollState" -> {
                val p = polls.getOrPut(e.optLong("poll")) { PollRow(e.optLong("poll"), "") }
                parseOptions(e.optJSONArray("options"))?.let { if (it.isNotEmpty()) p.options = it }
                val v = e.optJSONObject("votes")
                if (v != null) {
                    p.votes.clear()
                    for (k in v.keys()) {
                        val arr = v.optJSONArray(k) ?: continue
                        p.votes[k.toLongOrNull() ?: continue] = (0 until arr.length()).map { arr.getLong(it) }.toMutableSet()
                    }
                }
            }
            "thread" -> {
                val t = e.getJSONObject("thread")
                val key = t.getLong("key")
                val old = threads[key]
                // A kept (or newer) last message is not replaced by an older one.
                val newer = old == null || t.optLong("lastMs") >= old.lastMs
                threads[key] = ThreadRow(
                    key,
                    t.optString("name").ifEmpty { old?.name ?: key.toString() },
                    if (newer) t.optString("snippet") else old!!.snippet,
                    if (newer) t.optLong("lastMs") else old!!.lastMs,
                    t.optBoolean("encrypted"),
                    t.optBoolean("group"),
                    if (t.has("unread")) t.optBoolean("unread") else old?.unread ?: false,
                    t.optString("pinned"),
                    t.optString("network").ifEmpty { old?.network ?: "messenger" },
                )
            }
            "message" -> {
                val m = e.getJSONObject("message")
                val key = m.getLong("thread")
                val row = MessageRow(
                    m.optString("id"),
                    m.optLong("sender"),
                    m.optString("name"),
                    m.optString("text"),
                    m.optLong("ms"),
                    m.optBoolean("mine"),
                    m.optBoolean("encrypted"),
                    parseAtts(m.optJSONArray("attachments")),
                    m.optBoolean("forwarded"),
                    m.optBoolean("edited"),
                    m.optLong("stickerId"),
                    m.optJSONObject("replyTo")?.let {
                        Quote(it.optString("id"), it.optString("text"), it.optLong("sender"), it.optString("name"))
                    },
                )
                val list = messages.getOrPut(key) { mutableListOf() }
                val at = if (row.id.isEmpty()) -1 else list.indexOfFirst { it.id == row.id }
                if (at >= 0) {
                    // The same message again, now with its attachments: replace it, no new notification.
                    list[at] = row
                    list.sortBy { it.ms }
                } else {
                    list.add(row)
                    list.sortBy { it.ms }
                    threads[key]?.let {
                        if (row.ms >= it.lastMs) {
                            it.lastMs = row.ms
                            it.snippet = row.text
                            // A message from someone else in a chat not on screen is unread.
                            if (!row.mine && openThread != key) it.unread = true
                        }
                    }
                    // Our own message from another device (or the echo of one sent here, with its new id):
                    // drop the copy shown at once without an id.
                    if (row.mine) list.removeAll { it !== row && it.id.isEmpty() && it.text == row.text && it.mine }
                    if (!row.mine) onIncoming?.invoke(threads[key], row)
                }
                // Disappearing messages (Signal, Session): gone this long after they were sent.
                val secs = m.optLong("expiresIn")
                if (secs > 0 && row.id.isNotEmpty()) expiry(row.id, key, row.ms, secs, m.optString("expireFrom") == "read")
            }
        }
        changed()
    }
}

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // Before any engine starts: its values become Compose state, so the screens follow them.
        EngineHost.cells = object : CellMaker {
            override fun <T> make(initial: T): Cell<T> {
                val state = mutableStateOf(initial)
                return object : Cell<T> {
                    override var value: T
                        get() = state.value
                        set(v) { state.value = v }
                }
            }
        }
        EngineHost.appInFront = { Hub.resumed }
        Appearance.init(this)
        ChatLock.init(this)
        Hidden.init(this)
        Backgrounds.init(this)
        eu.erevos.messenger.calls.SessionCalls.init(this)
        Hub.init(this)
        Later.init(this)
        Kept.init(this)
        // What was on screen last time, at once; Meta's fresh data replaces it as it comes.
        ListCache.init(this)
        ListCache.load()
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(Hub.CHANNEL_SERVICE, "Σύνδεση", NotificationManager.IMPORTANCE_MIN)
        )
        nm.createNotificationChannel(
            NotificationChannel(Hub.CHANNEL_MESSAGES, "Μηνύματα", NotificationManager.IMPORTANCE_HIGH)
        )
    }
}
