// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
import android.os.Handler
import android.os.Looper
import java.io.File
import org.json.JSONArray
import org.json.JSONObject

/**
 * The chat list and the latest messages of each chat, kept on the phone so the app shows them
 * at once after an update or restart, while Meta sends the fresh ones. Sealed with the
 * Keystore key (see KeyWrap); only this app on this phone can read it.
 */
object ListCache {
    private const val FILE = "list.cache"
    private const val PER_CHAT = 40
    private const val SAVE_DELAY_MS = 4_000L

    private lateinit var file: File
    private val main = Handler(Looper.getMainLooper())
    private val saveSoon = Runnable { saveNow() }
    @Volatile private var writing = false

    fun init(context: Context) {
        file = File(context.filesDir, "messenger/$FILE")
    }

    /** Puts what was kept into [Hub] (main thread, before the engine starts). */
    fun load() {
        val raw = runCatching { String(KeyWrap.unwrap(file.readBytes())) }.getOrNull() ?: return
        runCatching {
            val o = JSONObject(raw)
            val ts = o.optJSONArray("threads") ?: JSONArray()
            for (i in 0 until ts.length()) {
                val t = ts.getJSONObject(i)
                val key = t.getLong("key")
                if (Hub.threads[key] != null) continue
                Hub.threads[key] = ThreadRow(
                    key, t.optString("name"), t.optString("snippet"), t.optLong("lastMs"),
                    t.optBoolean("encrypted"), t.optBoolean("group"),
                    network = t.optString("network").ifEmpty { "messenger" },
                )
            }
            val ms = o.optJSONObject("messages") ?: JSONObject()
            for (k in ms.keys()) {
                val key = k.toLongOrNull() ?: continue
                if (Hub.messages[key] != null) continue
                val arr = ms.getJSONArray(k)
                val list = ArrayList<MessageRow>(arr.length())
                for (i in 0 until arr.length()) {
                    val m = arr.getJSONObject(i)
                    list.add(
                        MessageRow(
                            m.optString("id"), m.optLong("sender"), m.optString("name"), m.optString("text"),
                            m.optLong("ms"), m.optBoolean("mine"), m.optBoolean("encrypted"),
                            atts(m.optJSONArray("atts")),
                        ),
                    )
                }
                Hub.messages[key] = list
            }
        }
        Hub.changed()
    }

    /** Something changed: save a few seconds later, once. */
    fun touch() {
        if (!::file.isInitialized) return
        main.removeCallbacks(saveSoon)
        main.postDelayed(saveSoon, SAVE_DELAY_MS)
    }

    /** Forget everything kept (sign-out). */
    fun clear() {
        main.removeCallbacks(saveSoon)
        if (::file.isInitialized) file.delete()
    }

    private fun saveNow() {
        if (writing) { touch(); return }
        // Copy on the main thread, where Hub is edited; write elsewhere.
        val o = JSONObject()
        val ts = JSONArray()
        Hub.threads.values.forEach { t ->
            ts.put(
                JSONObject().put("key", t.key).put("name", t.name).put("snippet", t.snippet)
                    .put("lastMs", t.lastMs).put("encrypted", t.encrypted).put("group", t.group).put("network", t.network),
            )
        }
        o.put("threads", ts)
        val ms = JSONObject()
        Hub.messages.forEach { (key, list) ->
            val arr = JSONArray()
            list.takeLast(PER_CHAT).forEach { m ->
                arr.put(
                    JSONObject().put("id", m.id).put("sender", m.sender).put("name", m.name).put("text", m.text)
                        .put("ms", m.ms).put("mine", m.mine).put("encrypted", m.encrypted)
                        .put("atts", JSONArray().apply { m.attachments.forEach { put(att(it)) } }),
                )
            }
            ms.put(key.toString(), arr)
        }
        o.put("messages", ms)
        val text = o.toString()
        writing = true
        Thread {
            try {
                file.parentFile?.mkdirs()
                val tmp = File(file.parentFile, "$FILE.tmp")
                tmp.writeBytes(KeyWrap.wrap(text.toByteArray()))
                tmp.renameTo(file)
            } catch (_: Exception) {
            } finally {
                writing = false
            }
        }.start()
    }

    private fun att(a: Att) = JSONObject().put("kind", a.kind).put("url", a.url).put("playUrl", a.playUrl)
        .put("mime", a.mime).put("w", a.w).put("h", a.h).put("name", a.name).put("title", a.title).put("link", a.link)

    private fun atts(a: JSONArray?): List<Att> {
        if (a == null) return emptyList()
        return (0 until a.length()).mapNotNull { i ->
            val o = a.optJSONObject(i) ?: return@mapNotNull null
            Att(
                o.optString("kind"), o.optString("url"), o.optString("playUrl"), o.optString("mime"),
                o.optInt("w"), o.optInt("h"), o.optString("name"), o.optString("title"), o.optString("link"),
            )
        }
    }
}
