// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.signal

import android.app.Application
import eu.erevos.messenger.engine.cell
import eu.erevos.messenger.engine.getValue
import eu.erevos.messenger.engine.setValue
import eu.erevos.messenger.KeyWrap
import java.io.File
import java.security.SecureRandom
import org.json.JSONObject

/** Gets the Signal engine's events (any thread). */
fun interface SignalListener {
    fun onEvent(json: String)
}

/** The Signal engine (signal/, Rust, presage over libsignal), loaded from liberevos_signal.so. */
object SignalCore {
    init {
        System.loadLibrary("erevos_signal")
    }

    external fun init(dir: String, listener: SignalListener)
    external fun call(op: String, args: String): String
}

/**
 * Signal in the app. Its chats and people have negative keys (Messenger's are positive), so
 * the Hub sends each call to the right engine. Its database is SQLCipher, with a random key
 * kept sealed by the Android Keystore.
 */
object Signal {
    /** The engine library loaded and started. */
    var available = false
        private set

    private var readyState by cell(false)

    /** Signed in (registered with a number, or linked to another phone). Kept as a mark on disk too,
     *  so the app opens for Signal alone, without a Messenger sign-in. */
    var ready: Boolean
        get() = readyState
        set(v) {
            readyState = v
            if (::dir.isInitialized) runCatching {
                val mark = File(dir, "account")
                if (v) { dir.mkdirs(); mark.writeText("1") } else mark.delete()
            }
        }

    /** Our phone number, once started. */
    var phone: String by cell("")

    /** An account is on this phone (cheap: no database opened). */
    fun hasAccount(): Boolean = ::dir.isInitialized && File(dir, "account").exists()

    /** Our own person key on Signal. */
    var selfId = 0L

    /** The link address while linking to another phone (shown as a QR code). */
    var linkUrl: String? by cell(null)
    var linkError: String? by cell(null)
    var status: String by cell("")

    private lateinit var dir: File

    fun init(app: Application, onEvent: (JSONObject) -> Unit) {
        dir = File(app.filesDir, "signal")
        available = runCatching {
            SignalCore.init(dir.absolutePath) { json ->
                val e = JSONObject(json)
                onEvent(e)
            }
            true
        }.getOrDefault(false)
    }

    /** Whether a chat or person key belongs to Signal. */
    fun isKey(key: Long): Boolean = key < 0 && key >= -(1L shl 62)

    fun call(op: String, args: JSONObject = JSONObject()): JSONObject {
        if (!available) return JSONObject().put("error", "Signal is not available")
        // The engine reads "id" as text; the screens sometimes give a person's key as a number.
        val id = args.opt("id")
        val sent = if (id is Number) JSONObject(args.toString()).put("id", id.toString()) else args
        return JSONObject(SignalCore.call(op, sent.toString()))
    }

    /** The database key: made once, kept sealed. */
    private fun dbKey(): String {
        dir.mkdirs()
        val f = File(dir, "db.key")
        if (f.exists()) {
            // Never make a new key over a kept one: that would lose the whole Signal database.
            return runCatching { String(KeyWrap.unwrap(f.readBytes())) }
                .getOrElse { throw IllegalStateException("Το κλειδί του Signal δεν ανοίγει (Keystore): ${it.message}") }
        }
        val raw = ByteArray(32).also { SecureRandom().nextBytes(it) }
        val hex = raw.joinToString("") { "%02x".format(it) }
        f.writeBytes(KeyWrap.wrap(hex.toByteArray()))
        return hex
    }

    /** Opens the database; true if an account is there. Call off the main thread. */
    fun open(): Boolean {
        if (!available) return false
        val key = runCatching { dbKey() }.getOrElse { status = it.message.orEmpty(); return false }
        val r = call("open", JSONObject().put("key", key))
        ready = r.optJSONObject("ok")?.optBoolean("registered") == true
        return ready
    }

    /** Lists the chats and starts receiving. Call off the main thread. */
    fun start(): JSONObject {
        val r = call("start")
        r.optJSONObject("ok")?.optLong("self")?.let { if (it != 0L) selfId = it }
        r.optJSONObject("ok")?.optString("phone")?.let { phone = it }
        return r
    }

    /** What an event of the engine's own means for the Signal screens; false if it is not one. */
    fun takeOwn(e: JSONObject): Boolean {
        when (e.optString("type")) {
            "signalLink" -> linkUrl = e.optString("url")
            "signalLinked" -> { linkUrl = null; ready = true }
            "signalLinkFailed" -> { linkUrl = null; linkError = e.optString("error") }
            "status" -> if (e.optString("network") == "signal") status = e.optString("status") else return false
            else -> return false
        }
        return true
    }
}
