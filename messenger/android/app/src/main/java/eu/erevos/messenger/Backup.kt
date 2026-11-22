// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
import android.net.Uri
import android.util.Base64
import java.io.File
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec
import org.json.JSONObject

/**
 * A backup of this app's own settings, as in Erevos: chat locks and hidden places (their PINs
 * stay as slow hashes), backgrounds with their photos, appearance, and what waits to be sent
 * later. Not the accounts and not the messages: Messenger signs in again, Session comes back
 * with its 13 words, Signal is linked or registered again.
 *
 * The file is encrypted with a password the owner chooses (PBKDF2-SHA256, AES-256-GCM); without
 * it nobody can read it. On this phone some records are sealed with a Keystore key that never
 * leaves it, so they are opened here and sealed again on the phone that restores them.
 */
object Backup {
    private const val MAGIC = "EREVOS-MESSENGER-BACKUP-1"
    private const val ROUNDS = 310_000

    /** SharedPreferences files in the backup, and which of their keys hold a Keystore-sealed text. */
    private val PREFS = mapOf(
        "erevos.messenger.chatlock" to setOf("locks"),
        "erevos.messenger.hidden" to setOf("places"),
        "messenger.appearance" to emptySet(),
        "messenger.backgrounds" to emptySet(),
    )
    /** Keystore-sealed files kept whole (their content opened). */
    private val SEALED_FILES = listOf("later.bin")
    private const val PHOTOS = "backgrounds"

    fun export(context: Context, to: Uri, password: String) {
        val root = JSONObject()
        val prefs = JSONObject()
        for ((name, sealed) in PREFS) {
            val p = context.getSharedPreferences(name, Context.MODE_PRIVATE)
            val o = JSONObject()
            for ((k, v) in p.all) {
                // Wrong-PIN counters are this phone's, not the owner's settings.
                if (name == "erevos.messenger.chatlock" && (k == "tries" || k == "until")) continue
                val entry = JSONObject()
                when {
                    k in sealed && v is String -> entry.put("t", "sealed").put("v", String(KeyWrap.unwrap(Base64.decode(v, Base64.NO_WRAP))))
                    v is String -> entry.put("t", "s").put("v", v)
                    v is Boolean -> entry.put("t", "b").put("v", v)
                    v is Int -> entry.put("t", "i").put("v", v)
                    v is Long -> entry.put("t", "l").put("v", v)
                    v is Float -> entry.put("t", "f").put("v", v.toDouble())
                    else -> continue
                }
                o.put(k, entry)
            }
            prefs.put(name, o)
        }
        root.put("prefs", prefs)
        val files = JSONObject()
        for (f in SEALED_FILES) {
            val file = File(context.filesDir, f)
            if (file.exists()) files.put(f, String(KeyWrap.unwrap(file.readBytes())))
        }
        root.put("sealedFiles", files)
        val photos = JSONObject()
        File(context.filesDir, PHOTOS).listFiles()?.filter { it.name.endsWith(".jpg") }?.forEach {
            photos.put(it.name, Base64.encodeToString(it.readBytes(), Base64.NO_WRAP))
        }
        root.put("photos", photos)
        root.put("made", System.currentTimeMillis())

        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        val iv = ByteArray(12).also { SecureRandom().nextBytes(it) }
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.ENCRYPT_MODE, keyOf(password, salt), GCMParameterSpec(128, iv))
        c.updateAAD(MAGIC.toByteArray())
        val sealedBody = c.doFinal(root.toString().toByteArray())
        val out = JSONObject()
            .put("format", MAGIC)
            .put("salt", Base64.encodeToString(salt, Base64.NO_WRAP))
            .put("iv", Base64.encodeToString(iv, Base64.NO_WRAP))
            .put("data", Base64.encodeToString(sealedBody, Base64.NO_WRAP))
        context.contentResolver.openOutputStream(to, "wt")?.use { it.write(out.toString().toByteArray()) }
            ?: error("the file could not be written")
    }

    /** Puts the backup in place. Throws "wrong password" or "not a backup". The app must restart after. */
    fun restore(context: Context, from: Uri, password: String) {
        val text = context.contentResolver.openInputStream(from)?.use { String(it.readBytes()) } ?: error("the file could not be read")
        val outer = runCatching { JSONObject(text) }.getOrNull()
        if (outer == null || outer.optString("format") != MAGIC) error("not a backup")
        val salt = Base64.decode(outer.getString("salt"), Base64.NO_WRAP)
        val iv = Base64.decode(outer.getString("iv"), Base64.NO_WRAP)
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.DECRYPT_MODE, keyOf(password, salt), GCMParameterSpec(128, iv))
        c.updateAAD(MAGIC.toByteArray())
        val plain = runCatching { c.doFinal(Base64.decode(outer.getString("data"), Base64.NO_WRAP)) }.getOrNull()
            ?: error("wrong password")
        val root = JSONObject(String(plain))

        val prefs = root.optJSONObject("prefs") ?: JSONObject()
        for (name in prefs.keys()) {
            if (name !in PREFS) continue
            val o = prefs.getJSONObject(name)
            val e = context.getSharedPreferences(name, Context.MODE_PRIVATE).edit().clear()
            for (k in o.keys()) {
                val entry = o.getJSONObject(k)
                when (entry.getString("t")) {
                    "sealed" -> e.putString(k, Base64.encodeToString(KeyWrap.wrap(entry.getString("v").toByteArray()), Base64.NO_WRAP))
                    "s" -> e.putString(k, entry.getString("v"))
                    "b" -> e.putBoolean(k, entry.getBoolean("v"))
                    "i" -> e.putInt(k, entry.getInt("v"))
                    "l" -> e.putLong(k, entry.getLong("v"))
                    "f" -> e.putFloat(k, entry.getDouble("v").toFloat())
                }
            }
            e.commit()
        }
        val files = root.optJSONObject("sealedFiles") ?: JSONObject()
        for (f in files.keys()) {
            if (f !in SEALED_FILES) continue
            File(context.filesDir, f).writeBytes(KeyWrap.wrap(files.getString(f).toByteArray()))
        }
        val photos = root.optJSONObject("photos") ?: JSONObject()
        val dir = File(context.filesDir, PHOTOS).apply { mkdirs() }
        dir.listFiles()?.forEach { it.delete() }
        for (n in photos.keys()) {
            // Only plain names, never a path.
            if (!n.matches(Regex("[A-Za-z0-9_-]+\\.jpg"))) continue
            File(dir, n).writeBytes(Base64.decode(photos.getString(n), Base64.NO_WRAP))
        }
    }

    private fun keyOf(password: String, salt: ByteArray): SecretKeySpec {
        val spec = PBEKeySpec(password.toCharArray(), salt, ROUNDS, 256)
        val bytes = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
        spec.clearPassword()
        return SecretKeySpec(bytes, "AES")
    }
}
