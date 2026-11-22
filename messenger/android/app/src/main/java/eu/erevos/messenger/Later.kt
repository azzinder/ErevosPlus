// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import java.io.File
import java.util.UUID
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/**
 * Send later, as in Erevos: a text kept on this phone until its time, then sent like any other.
 * Works for every service (Messenger, Signal, Session). The list is kept encrypted (KeyWrap)
 * and survives a restart; the app's background service keeps it running, and a time that
 * passed while the phone was off sends at the next start.
 */
object Later {
    data class Item(val id: String, val chat: Long, val text: String, val at: Long, val failed: String = "")

    var items: List<Item> by mutableStateOf(emptyList())
        private set

    private val main = Handler(Looper.getMainLooper())
    private var file: File? = null
    /** Tries per item that did not go (network down, refused). */
    private val tries = HashMap<String, Int>()

    fun init(context: Context) {
        file = File(context.filesDir, "later.bin")
        load()
        items.forEach { schedule(it) }
    }

    fun of(chat: Long): List<Item> = items.filter { it.chat == chat }.sortedBy { it.at }

    fun add(chat: Long, text: String, at: Long) {
        val it = Item(UUID.randomUUID().toString(), chat, text, at)
        items = items + it
        save()
        schedule(it)
    }

    fun cancel(id: String) {
        items = items.filterNot { it.id == id }
        tries.remove(id)
        save()
    }

    /** Sends it now, whatever its time. */
    fun sendNow(id: String) {
        items = items.map { if (it.id == id) it.copy(at = System.currentTimeMillis(), failed = "") else it }
        save()
        fire(id)
    }

    private fun schedule(it: Item) {
        main.postDelayed({ fire(it.id) }, (it.at - System.currentTimeMillis()).coerceAtLeast(0L))
    }

    private fun fire(id: String) {
        val it = items.firstOrNull { x -> x.id == id } ?: return
        if (it.at > System.currentTimeMillis() + 1000) { schedule(it); return } // moved later meanwhile
        val ready = when (Hub.networkOf(it.chat)) {
            "signal" -> eu.erevos.messenger.signal.Signal.ready
            "session" -> eu.erevos.messenger.session.Session.ready
            else -> true
        }
        if (!ready) { main.postDelayed({ fire(id) }, 30_000L); return }
        Hub.scope.launch {
            val r = withContext(Dispatchers.IO) { Hub.call("sendText", JSONObject().put("thread", it.chat).put("text", it.text)) }
            if (items.none { x -> x.id == id }) return@launch // cancelled while sending
            if (r.has("error")) {
                val n = (tries[id] ?: 0) + 1
                tries[id] = n
                if (n < 5) {
                    main.postDelayed({ fire(id) }, 60_000L shl (n - 1))
                } else {
                    // Kept, marked, for the owner to send again or cancel from the chat.
                    items = items.map { x -> if (x.id == id) x.copy(failed = r.optString("error")) else x }
                    save()
                }
            } else {
                tries.remove(id)
                val ok = r.optJSONObject("ok")
                Hub.addOwn(it.chat, ok?.optString("id").orEmpty(), it.text, ok?.optLong("ms") ?: System.currentTimeMillis())
                items = items.filterNot { x -> x.id == id }
                save()
            }
        }
    }

    private fun save() {
        val f = file ?: return
        val a = JSONArray()
        items.forEach {
            a.put(JSONObject().put("id", it.id).put("chat", it.chat).put("text", it.text).put("at", it.at).put("failed", it.failed))
        }
        runCatching { f.writeBytes(KeyWrap.wrap(a.toString().toByteArray())) }
    }

    private fun load() {
        val f = file ?: return
        if (!f.exists()) return
        val a = runCatching { JSONArray(String(KeyWrap.unwrap(f.readBytes()))) }.getOrNull()
        if (a == null) {
            // Not opened (Keystore trouble): keep the file as it is and start an empty list in memory.
            file = null
            return
        }
        items = (0 until a.length()).map { i ->
            val o = a.getJSONObject(i)
            Item(o.getString("id"), o.getLong("chat"), o.getString("text"), o.getLong("at"), o.optString("failed"))
        }
    }

    /** Forgets what was waiting for a removed account. */
    fun forgetNetwork(network: String) {
        val gone = items.filter { Hub.networkOf(it.chat) == network }
        if (gone.isEmpty()) return
        items = items - gone.toSet()
        save()
    }
}
