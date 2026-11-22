// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.engine

import android.app.Application
import eu.erevos.messenger.session.Session
import eu.erevos.messenger.signal.Signal
import org.json.JSONArray
import org.json.JSONObject

/**
 * The three engines, without any screen: Messenger's (Go), Signal's (Rust, presage) and
 * Session's (Kotlin over libsession). The host gives one listener for all their events (called
 * on the engines' own threads) and sends each call through [call], which picks the engine.
 */
object Engines {
    lateinit var messengerEngine: core.Engine
        private set

    fun init(app: Application, listener: (JSONObject) -> Unit) {
        messengerEngine = core.Core.newEngine(
            app.filesDir.absolutePath + "/messenger",
            object : core.Listener {
                override fun onEvent(eventJSON: String) {
                    listener(JSONObject(eventJSON))
                }
            },
        )
        Signal.init(app, listener)
        Session.init(app, listener)
    }

    /** Messenger's own engine (Go). */
    fun messenger(op: String, args: JSONObject = JSONObject()): JSONObject =
        JSONObject(messengerEngine.call(op, args.toString()))

    /**
     * One call, sent to the engine of the chat, message or person it names: Signal's keys are
     * between -2^62 and 0 and its message ids start with "sg:"; Session's keys are below -2^62
     * and its ids start with "ss:"; Messenger's keys are positive. Calls about everything (mark
     * all read, people, the log) go to all and their answers are joined.
     */
    fun call(op: String, args: JSONObject = JSONObject()): JSONObject {
        val sg = Signal
        val ss = Session
        if (ss.ready && isSessionCall(args)) return ss.call(op, args)
        if (sg.ready && isSignalCall(args)) return sg.call(op, args)
        val others = listOfNotNull(
            if (sg.ready) { a: JSONObject -> sg.call(op, a) } else null,
            if (ss.ready) { a: JSONObject -> ss.call(op, a) } else null,
        )
        return when (op) {
            "markAllRead" -> {
                others.forEach { it(args) }
                messenger(op, args)
            }
            "contacts", "searchPeople" -> {
                val a = messenger(op, args)
                if (others.isEmpty()) return a
                val joined = JSONArray()
                a.optJSONArray("ok")?.let { for (i in 0 until it.length()) joined.put(it.get(i)) }
                for (o in others) {
                    o(args).optJSONArray("ok")?.let { for (i in 0 until it.length()) joined.put(it.get(i)) }
                }
                if (a.has("error") && joined.length() == 0) a else JSONObject().put("ok", joined)
            }
            "log" -> {
                val a = messenger(op, args)
                val lines = a.optJSONArray("ok") ?: JSONArray()
                if (sg.available) sg.call(op, args).optString("ok").takeIf { it.isNotEmpty() }?.let { b ->
                    lines.put("--- Signal ---")
                    b.split('\n').forEach { lines.put(it) }
                }
                if (ss.available) ss.call(op, args).optString("ok").takeIf { it.isNotEmpty() }?.let { b ->
                    lines.put("--- Session ---")
                    b.split('\n').forEach { lines.put(it) }
                }
                if (a.has("error") && lines.length() == 0) a else JSONObject().put("ok", lines)
            }
            else -> messenger(op, args)
        }
    }

    /** The service a chat, person or poll key belongs to. */
    fun networkOf(key: Long): String = when {
        Session.isKey(key) -> "session"
        Signal.isKey(key) -> "signal"
        else -> "messenger"
    }

    private fun isSignalCall(a: JSONObject): Boolean {
        val s = Signal
        if (s.isKey(a.optLong("thread", 0L)) || s.isKey(a.optLong("person", 0L)) || s.isKey(a.optLong("poll", 0L))) return true
        if (a.optString("network") == "signal") return true
        val id = a.optString("id")
        if (id.startsWith("sg:")) return true
        return id.startsWith("-") && s.isKey(id.toLongOrNull() ?: 0L)
    }

    private fun isSessionCall(a: JSONObject): Boolean {
        val s = Session
        if (s.isKey(a.optLong("thread", 0L)) || s.isKey(a.optLong("person", 0L))) return true
        if (a.optString("network") == "session") return true
        val id = a.optString("id")
        if (id.startsWith("ss:")) return true
        return id.startsWith("-") && s.isKey(id.toLongOrNull() ?: 0L)
    }
}
