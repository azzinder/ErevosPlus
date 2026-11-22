// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
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
 * Hidden chats, as in Erevos and ErevosGram: four hidden places, each with its own PIN. A hidden
 * chat never shows in the list; typing a place's PIN in the search field and pressing Enter shows
 * that place. Its notifications say only "new message". Which chats are hidden, and where, is kept
 * only on this phone, sealed with a key held by the Android Keystore. Meta is told nothing.
 */
object Hidden {
    const val PLACES = 4
    private const val PREFS = "erevos.messenger.hidden"
    private const val IDS = "places"
    private const val ROUNDS = 150_000

    private lateinit var app: Context
    private val _places = MutableStateFlow<Map<Long, Int>>(emptyMap())
    /** Chat key to its hidden place, 1 to [PLACES]. */
    val places: StateFlow<Map<Long, Int>> = _places.asStateFlow()

    /** The place now open, if any; leaving the app or going back closes it. */
    private val _open = MutableStateFlow<Int?>(null)
    val open: StateFlow<Int?> = _open.asStateFlow()

    fun init(context: Context) {
        app = context.applicationContext
        _places.value = runCatching {
            prefs().getString(IDS, null)?.let { stored ->
                String(KeyWrap.unwrap(Base64.decode(stored, Base64.NO_WRAP)))
                    .split(',').mapNotNull { pair ->
                        val (id, place) = pair.split(':').takeIf { it.size == 2 } ?: return@mapNotNull null
                        (id.toLongOrNull() ?: return@mapNotNull null) to (place.toIntOrNull()?.coerceIn(1, PLACES) ?: 1)
                    }.toMap()
            }
        }.getOrNull() ?: emptyMap()
    }

    fun placeOf(chatId: Long): Int? = _places.value[chatId]
    fun isHidden(chatId: Long) = chatId in _places.value
    /** True when the chat may be shown now: not hidden, or its place is open. */
    fun isOpen(chatId: Long) = placeOf(chatId)?.let { it == _open.value } ?: true

    fun hasPin(place: Int): Boolean = prefs().contains("hash$place")

    /** Checks [pin] against one place. Slow on purpose, so guessing takes long. */
    suspend fun check(place: Int, pin: String): Boolean = withContext(Dispatchers.Default) {
        val p = prefs()
        val salt = p.getString("salt$place", null)?.let { Base64.decode(it, Base64.NO_WRAP) } ?: return@withContext false
        val want = p.getString("hash$place", null)?.let { Base64.decode(it, Base64.NO_WRAP) } ?: return@withContext false
        MessageDigest.isEqual(derive(pin, salt), want)
    }

    /** The place this PIN opens, if any. */
    suspend fun placeFor(pin: String): Int? {
        if (pin.length < 4) return null
        for (place in 1..PLACES) if (hasPin(place) && check(place, pin)) return place
        return null
    }

    /** Sets a new place's PIN. False if another place already uses it (each PIN opens one place). */
    suspend fun setPin(place: Int, pin: String): Boolean {
        if (placeFor(pin) != null) return false
        withContext(Dispatchers.Default) {
            val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
            prefs().edit()
                .putString("salt$place", Base64.encodeToString(salt, Base64.NO_WRAP))
                .putString("hash$place", Base64.encodeToString(derive(pin, salt), Base64.NO_WRAP))
                .apply()
        }
        return true
    }

    /** Typed in the search field: opens the place the PIN belongs to. */
    suspend fun tryOpen(pin: String): Boolean {
        val place = placeFor(pin) ?: return false
        _open.value = place
        return true
    }

    fun close() { _open.value = null }

    fun hide(chatId: Long, place: Int) = save(_places.value + (chatId to place.coerceIn(1, PLACES)))
    fun unhide(chatId: Long) = save(_places.value - chatId)

    private fun save(map: Map<Long, Int>) {
        _places.value = map
        val text = map.entries.joinToString(",") { "${it.key}:${it.value}" }
        prefs().edit().putString(IDS, Base64.encodeToString(KeyWrap.wrap(text.toByteArray()), Base64.NO_WRAP)).apply()
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
