// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.session

import android.content.Context
import java.security.SecureRandom
import java.util.zip.CRC32
import network.loki.messenger.libsession_util.Curve25519
import network.loki.messenger.libsession_util.ED25519
import network.loki.messenger.libsession_util.util.KeyPair

/**
 * A Session account: 16 random bytes (the seed). From it come the Ed25519 keys (signing) and
 * the X25519 keys (encryption); the Session ID is "05" and the X25519 public key in hex.
 */
class SessionAccount(val seed: ByteArray) {
    init {
        require(seed.size == 16) { "seed must be 16 bytes" }
    }

    val ed: KeyPair by lazy { ED25519.generate(seed + ByteArray(16)) }
    val x: KeyPair by lazy { Curve25519.fromED25519(ed) }

    /** 64 bytes, libsodium style. */
    val edSecret: ByteArray get() = ed.secretKey.data
    val edPublicHex: String get() = SessionNet.hexOf(ed.pubKey.data)
    val id: String get() = "05" + SessionNet.hexOf(x.pubKey.data)

    companion object {
        fun create(): SessionAccount = SessionAccount(ByteArray(16).also { SecureRandom().nextBytes(it) })
    }
}

/**
 * The recovery words: Session's 13 words from its English list of 1626 (the same codec as the
 * Session apps, so the words move an account between them and Erevos Messenger).
 */
class Mnemonic(context: Context) {
    private val words: List<String> =
        context.assets.open("session/english.txt").use { String(it.readBytes()) }.trim().split(",").map { it.trim() }
    private val prefix = 3

    fun encode(seed: ByteArray): String {
        var s = SessionNet.hexOf(seed)
        var i = 0
        while (i + 8 <= s.length) {
            s = s.substring(0, i) + swap(s.substring(i, i + 8)) + s.substring(i + 8)
            i += 8
        }
        val n = words.size.toLong()
        val out = s.windowed(8, 8).flatMap {
            val x = it.toLong(16)
            val w1 = x % n
            val w2 = ((x / n) + w1) % n
            val w3 = (((x / n) / n) + w2) % n
            listOf(words[w1.toInt()], words[w2.toInt()], words[w3.toInt()])
        }
        return (out + out[checksumIndex(out)]).joinToString(" ")
    }

    /** The seed from the words, or null if they are not right. */
    fun decode(phrase: String): ByteArray? {
        val list = phrase.lowercase().replace("[^\\p{L}]+".toRegex(), " ").trim().split(" ").filter { it.isNotEmpty() }
        if (list.size != 13) return null
        val short = words.map { it.take(prefix) }
        val idx = list.map { w -> if (w.length < prefix) return null else short.indexOf(w.take(prefix)).also { if (it < 0) return null } }
        val body = list.dropLast(1)
        if (body[checksumIndex(body)].take(prefix) != list.last().take(prefix)) return null
        val n = short.size.toLong()
        val hex = StringBuilder()
        for (t in idx.dropLast(1).chunked(3)) {
            val (w1, w2, w3) = t
            val x = w1 + n * ((n - w1 + w2) % n) + n * n * ((n - w2 + w3) % n)
            if (x % n != w1.toLong()) return null
            val s = "0000000" + x.toString(16)
            hex.append(swap(s.substring(s.length - 8)))
        }
        return SessionNet.hex(hex.toString()).takeIf { it.size == 16 }
    }

    private fun swap(x: String) = x.substring(6, 8) + x.substring(4, 6) + x.substring(2, 4) + x.substring(0, 2)

    private fun checksumIndex(x: List<String>): Int {
        val crc = CRC32().apply { update(x.joinToString("") { it.take(prefix) }.toByteArray()) }.value
        return (crc % x.size).toInt()
    }
}
