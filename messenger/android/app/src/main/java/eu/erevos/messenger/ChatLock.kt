// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
import android.os.SystemClock
import android.util.Base64
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

/**
 * A PIN on one chat, as in Erevos and ErevosGram: the chat opens only with its PIN, its last
 * message is not shown in the list, and its notifications say only "new message". While the chat
 * is hidden the PIN is not asked (the hidden place has its own PIN); the record is kept, so back
 * in the normal list the same PIN is asked again.
 *
 * Which chats are locked, and each salted, slow hash of a PIN, are kept only on this phone,
 * encrypted with a key held by the Android Keystore. Meta is told nothing. Wrong PINs are
 * counted for all chats together; after a few, each next try waits longer.
 */
object ChatLock {
    const val MIN_LENGTH = 4
    /** Away from the app longer than this locks an open chat again. */
    const val RELOCK_MS = 30_000L
    private const val PREFS = "erevos.messenger.chatlock"
    private const val LOCKS = "locks"
    private const val TRIES = "tries"
    private const val UNTIL = "until"
    private const val ROUNDS = 150_000
    private const val FREE_TRIES = 5
    private const val FIRST_WAIT_MS = 30_000L
    private const val MAX_WAIT_MS = 3_600_000L

    private class Pin(val salt: ByteArray, val hash: ByteArray)

    private lateinit var app: Context
    @Volatile private var pins: Map<Long, Pin> = emptyMap()

    private val _locked = MutableStateFlow<Set<Long>>(emptySet())
    /** Chats that have a PIN. */
    val locked: StateFlow<Set<Long>> = _locked.asStateFlow()

    private val _unlocked = MutableStateFlow<Long?>(null)
    /** The one chat opened with its PIN, until it is left or the app is away too long. */
    val unlocked: StateFlow<Long?> = _unlocked.asStateFlow()

    private var awaySince = 0L

    fun init(context: Context) {
        app = context.applicationContext
        pins = runCatching {
            prefs().getString(LOCKS, null)?.let { stored ->
                String(KeyWrap.unwrap(Base64.decode(stored, Base64.NO_WRAP)))
                    .split(',').mapNotNull { entry ->
                        val parts = entry.split(':')
                        if (parts.size != 3) return@mapNotNull null
                        val id = parts[0].toLongOrNull() ?: return@mapNotNull null
                        id to Pin(Base64.decode(parts[1], Base64.NO_WRAP), Base64.decode(parts[2], Base64.NO_WRAP))
                    }.toMap()
            }
        }.getOrNull() ?: emptyMap()
        _locked.value = pins.keys
    }

    fun hasPin(chatId: Long) = chatId in _locked.value

    /** True when the PIN is asked now: the chat has one and is not hidden. */
    fun applies(chatId: Long) = hasPin(chatId) && !Hidden.isHidden(chatId)

    /** True when the chat must stay closed behind its PIN. */
    fun gated(chatId: Long) = applies(chatId) && _unlocked.value != chatId

    /** How long until the next try is allowed, in ms; 0 = now. */
    fun waitMs(): Long {
        val left = prefs().getLong(UNTIL, 0L) - System.currentTimeMillis()
        // A clock set back must not lock the person out for longer than the longest wait.
        return if (left > MAX_WAIT_MS) MAX_WAIT_MS else left.coerceAtLeast(0L)
    }

    private suspend fun matches(chatId: Long, pin: String): Boolean = withContext(Dispatchers.Default) {
        val p = pins[chatId] ?: return@withContext false
        MessageDigest.isEqual(derive(pin, p.salt), p.hash)
    }

    /** Tries [pin] on the chat and counts a wrong one; does not open it. Null when it must wait first. */
    suspend fun check(chatId: Long, pin: String): Boolean? {
        if (waitMs() > 0) return null
        val ok = matches(chatId, pin)
        val p = prefs()
        if (ok) {
            p.edit().putInt(TRIES, 0).putLong(UNTIL, 0L).apply()
        } else {
            val tries = p.getInt(TRIES, 0) + 1
            val wait = if (tries < FREE_TRIES) 0L
            else (FIRST_WAIT_MS shl (tries - FREE_TRIES).coerceAtMost(7)).coerceAtMost(MAX_WAIT_MS)
            p.edit().putInt(TRIES, tries).putLong(UNTIL, if (wait > 0) System.currentTimeMillis() + wait else 0L).apply()
        }
        return ok
    }

    /** As [check], and the right PIN opens the chat until it is left. */
    suspend fun open(chatId: Long, pin: String): Boolean? =
        check(chatId, pin).also { if (it == true) _unlocked.value = chatId }

    /** Puts a new PIN on a chat, or replaces it after [check] said the old one. */
    suspend fun setPin(chatId: Long, pin: String, keepOpen: Boolean) {
        require(pin.length >= MIN_LENGTH)
        val record = withContext(Dispatchers.Default) {
            val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
            Pin(salt, derive(pin, salt))
        }
        // Open first, so the chat on screen never flashes its gate.
        if (keepOpen) _unlocked.value = chatId
        save(pins + (chatId to record))
    }

    /** Takes the PIN off, after [check] said it. */
    fun remove(chatId: Long) {
        if (chatId !in pins) return
        save(pins - chatId)
        if (_unlocked.value == chatId) _unlocked.value = null
    }

    /** The open chat was left: it locks again. */
    fun leave(chatId: Long) {
        if (_unlocked.value == chatId) _unlocked.value = null
    }

    /** The app went to the background. */
    fun away() { awaySince = SystemClock.elapsedRealtime() }

    /** The app came back: away for longer than [RELOCK_MS] locks the open chat again. */
    fun back() {
        if (awaySince != 0L && SystemClock.elapsedRealtime() - awaySince > RELOCK_MS) _unlocked.value = null
        awaySince = 0L
    }

    private fun save(map: Map<Long, Pin>) {
        pins = map
        _locked.value = map.keys
        val enc = { b: ByteArray -> Base64.encodeToString(b, Base64.NO_WRAP) }
        val text = map.entries.joinToString(",") { "${it.key}:${enc(it.value.salt)}:${enc(it.value.hash)}" }
        prefs().edit().putString(LOCKS, Base64.encodeToString(KeyWrap.wrap(text.toByteArray()), Base64.NO_WRAP)).apply()
    }

    private fun derive(pin: String, salt: ByteArray): ByteArray {
        val spec = PBEKeySpec(pin.toCharArray(), salt, ROUNDS, 256)
        return try {
            SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
        } finally {
            spec.clearPassword()
        }
    }

    private fun prefs() = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
