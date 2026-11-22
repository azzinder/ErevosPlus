// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.session

import android.content.Context
import android.util.Base64
import java.io.ByteArrayOutputStream
import java.net.URL
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.security.KeyStore
import java.security.SecureRandom
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import javax.crypto.Cipher
import javax.crypto.Mac
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManagerFactory
import javax.net.ssl.X509TrustManager
import network.loki.messenger.libsession_util.Curve25519
import network.loki.messenger.libsession_util.SessionEncrypt
import org.json.JSONArray
import org.json.JSONObject

/** One Session service node. */
data class Snode(val ip: String, val port: Int, val ed: String, val x: String)

/**
 * Session's network: the service nodes, onion paths of three of them, and the calls made
 * through those paths (to a service node, or to the file server). Nothing leaves the phone
 * except as an onion request, so no node sees both who asks and what is asked.
 */
class SessionNet(private val context: Context, private val note: (String) -> Unit) {
    private val random = SecureRandom()
    private var pool: List<Snode> = emptyList()
    private var path: List<Snode> = emptyList()
    private var poolAt = 0L

    /** Network time minus phone time, from the nodes. */
    @Volatile var clockOffset = 0L
    fun now(): Long = System.currentTimeMillis() + clockOffset

    // ---- TLS ----

    /** Service nodes use certificates made by themselves; the onion layers carry the safety. */
    private val nodeTls: SSLContext by lazy {
        val trustAll = object : X509TrustManager {
            override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
            override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
            override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
        }
        SSLContext.getInstance("TLS").apply { init(null, arrayOf(trustAll), random) }
    }

    /** The seed nodes are trusted only with their own pinned certificates. */
    private val seedTls: SSLContext by lazy {
        val cf = CertificateFactory.getInstance("X.509")
        val ks = KeyStore.getInstance(KeyStore.getDefaultType()).apply { load(null, null) }
        SEED_PEMS.forEachIndexed { i, name ->
            context.assets.open("session/$name").use { ks.setCertificateEntry("seed$i", cf.generateCertificate(it)) }
        }
        val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()).apply { init(ks) }
        SSLContext.getInstance("TLS").apply { init(null, tmf.trustManagers, random) }
    }

    /** A SOCKS5 door with a user name and password (Tor's: its circuits are named by the user). */
    class Socks(val host: String, val port: Int, val user: String, val password: String)

    private fun post(url: String, body: ByteArray, tls: SSLContext, trustAnyName: Boolean): ByteArray {
        val door = socks
        if (door != null) return postThrough(door, url, body, tls, trustAnyName)
        if (mustHide) throw IllegalStateException("Tor is not ready: Session waits rather than go straight")
        val c = URL(url).openConnection() as HttpsURLConnection
        c.sslSocketFactory = tls.socketFactory
        if (trustAnyName) c.setHostnameVerifier { _, _ -> true }
        c.connectTimeout = 20_000
        c.readTimeout = 60_000
        c.requestMethod = "POST"
        c.doOutput = true
        c.setRequestProperty("Content-Type", "application/octet-stream")
        try {
            c.outputStream.use { it.write(body) }
            val code = c.responseCode
            val bytes = (if (code in 200..299) c.inputStream else c.errorStream)?.use { it.readBytes() } ?: ByteArray(0)
            if (code !in 200..299) throw NetError(code, String(bytes).take(200))
            return bytes
        } finally {
            c.disconnect()
        }
    }

    class NetError(val code: Int, msg: String) : Exception("HTTP $code: $msg")

    // ---- through a SOCKS5 door (Tor) ----

    /** The same POST as [post], over TLS on a connection the door makes (the name is resolved at its far side). */
    private fun postThrough(door: Socks, url: String, body: ByteArray, tls: SSLContext, trustAnyName: Boolean): ByteArray {
        val u = URL(url)
        val host = u.host
        val port = if (u.port > 0) u.port else 443
        val raw = java.net.Socket()
        try {
            raw.connect(java.net.InetSocketAddress(door.host, door.port), 20_000)
            raw.soTimeout = 60_000
            socksConnect(raw, door, host, port)
            val ssl = tls.socketFactory.createSocket(raw, host, port, true) as javax.net.ssl.SSLSocket
            if (!isIp(host)) ssl.sslParameters = ssl.sslParameters.apply { serverNames = listOf(javax.net.ssl.SNIHostName(host)) }
            ssl.startHandshake()
            if (!trustAnyName && !HttpsURLConnection.getDefaultHostnameVerifier().verify(host, ssl.session)) {
                throw javax.net.ssl.SSLPeerUnverifiedException("not $host")
            }
            val path = u.file.ifEmpty { "/" }
            val head = "POST $path HTTP/1.1\r\nHost: $host${if (u.port > 0) ":$port" else ""}\r\n" +
                "Content-Type: application/octet-stream\r\nContent-Length: ${body.size}\r\nConnection: close\r\n\r\n"
            val out = ssl.outputStream
            out.write(head.toByteArray(Charsets.US_ASCII))
            out.write(body)
            out.flush()
            val input = java.io.BufferedInputStream(ssl.inputStream)
            val status = line(input)
            val code = status.split(' ').getOrNull(1)?.toIntOrNull() ?: throw java.io.IOException("no HTTP answer")
            var length = -1
            var chunked = false
            while (true) {
                val h = line(input)
                if (h.isEmpty()) break
                val colon = h.indexOf(':')
                if (colon <= 0) continue
                val name = h.substring(0, colon).trim().lowercase()
                val value = h.substring(colon + 1).trim()
                if (name == "content-length") length = value.toIntOrNull() ?: -1
                if (name == "transfer-encoding" && value.lowercase().contains("chunked")) chunked = true
            }
            val bytes = when {
                chunked -> chunks(input)
                length >= 0 -> exactly(input, length)
                else -> input.readBytes()
            }
            if (code !in 200..299) throw NetError(code, String(bytes).take(200))
            return bytes
        } finally {
            runCatching { raw.close() }
        }
    }

    /** SOCKS5 (RFC 1928) with a user name and password (RFC 1929), the name given to the door to resolve. */
    private fun socksConnect(s: java.net.Socket, door: Socks, host: String, port: Int) {
        val out = s.getOutputStream()
        val input = s.getInputStream()
        out.write(byteArrayOf(5, 1, 2))
        out.flush()
        val chosen = exactly(input, 2)
        if (chosen[0].toInt() != 5 || chosen[1].toInt() != 2) throw java.io.IOException("the SOCKS door does not take a password")
        val user = door.user.toByteArray()
        val pass = door.password.toByteArray()
        require(user.size in 1..255 && pass.size <= 255) { "SOCKS name or password too long" }
        out.write(byteArrayOf(1, user.size.toByte()) + user + byteArrayOf(pass.size.toByte()) + pass)
        out.flush()
        if (exactly(input, 2)[1].toInt() != 0) throw java.io.IOException("the SOCKS door refused the password")
        val v4 = ipv4(host)
        val address = if (v4 != null) byteArrayOf(1) + v4 else {
            val name = host.toByteArray()
            require(name.size in 1..255) { "name too long" }
            byteArrayOf(3, name.size.toByte()) + name
        }
        out.write(byteArrayOf(5, 1, 0) + address + byteArrayOf((port shr 8).toByte(), port.toByte()))
        out.flush()
        val reply = exactly(input, 4)
        if (reply[1].toInt() != 0) throw java.io.IOException("the SOCKS door could not reach $host:$port (${reply[1].toInt()})")
        when (reply[3].toInt()) {
            1 -> exactly(input, 4 + 2)
            4 -> exactly(input, 16 + 2)
            3 -> exactly(input, (input.read() and 0xff) + 2)
            else -> throw java.io.IOException("a SOCKS answer that does not read")
        }
    }

    private fun ipv4(host: String): ByteArray? {
        val parts = host.split('.')
        if (parts.size != 4) return null
        val n = parts.map { it.toIntOrNull()?.takeIf { v -> v in 0..255 } ?: return null }
        return ByteArray(4) { n[it].toByte() }
    }

    private fun isIp(host: String) = ipv4(host) != null || host.contains(':')

    private fun exactly(input: java.io.InputStream, n: Int): ByteArray {
        val b = ByteArray(n)
        var at = 0
        while (at < n) {
            val r = input.read(b, at, n - at)
            if (r < 0) throw java.io.EOFException()
            at += r
        }
        return b
    }

    /** One line of an HTTP head, without its CRLF. */
    private fun line(input: java.io.InputStream): String {
        val b = java.io.ByteArrayOutputStream()
        while (true) {
            val c = input.read()
            if (c < 0 || c == '\n'.code) break
            if (c != '\r'.code) b.write(c)
            if (b.size() > 16 * 1024) throw java.io.IOException("an HTTP line too long")
        }
        return b.toString("US-ASCII")
    }

    private fun chunks(input: java.io.InputStream): ByteArray {
        val all = java.io.ByteArrayOutputStream()
        while (true) {
            val size = line(input).substringBefore(';').trim().toInt(16)
            if (size == 0) { while (line(input).isNotEmpty()) {}; break }
            all.write(exactly(input, size))
            line(input)
        }
        return all.toByteArray()
    }

    // ---- service nodes ----

    @Synchronized
    fun nodes(): List<Snode> {
        if (pool.size >= 12 && System.currentTimeMillis() - poolAt < 2 * 60 * 60 * 1000L) return pool
        var last: Exception? = null
        for (seed in SEEDS.shuffled(random)) {
            try {
                val req = JSONObject().put("method", "get_n_service_nodes").put(
                    "params",
                    JSONObject().put("active_only", true)
                        .put("fields", JSONArray(listOf("public_ip", "storage_port", "pubkey_x25519", "pubkey_ed25519"))),
                )
                val r = JSONObject(String(post("$seed/json_rpc", req.toString().toByteArray(), seedTls, false)))
                val list = parseNodes(r.getJSONObject("result").getJSONArray("service_node_states"), "public_ip", "storage_port")
                if (list.size >= 12) {
                    pool = list
                    poolAt = System.currentTimeMillis()
                    return pool
                }
            } catch (e: Exception) {
                last = e
                note("seed $seed: ${e.message}")
            }
        }
        if (pool.isNotEmpty()) return pool
        throw last ?: IllegalStateException("no service nodes")
    }

    private fun parseNodes(a: JSONArray, ipKey: String, portKey: String): List<Snode> {
        val out = ArrayList<Snode>()
        for (i in 0 until a.length()) {
            val o = a.optJSONObject(i) ?: continue
            val ip = o.optString(ipKey)
            val port = o.optString(portKey).toIntOrNull() ?: continue
            val ed = o.optString("pubkey_ed25519")
            val x = o.optString("pubkey_x25519")
            if (ip.isEmpty() || ip == "0.0.0.0" || ed.length != 64 || x.length != 64 || port == 0) continue
            out.add(Snode(ip, port, ed, x))
        }
        return out
    }

    @Synchronized
    private fun pathAvoiding(target: Snode?): List<Snode> {
        if (path.size == 3 && (target == null || target !in path)) return path
        val all = nodes().filter { it != target }.shuffled(random)
        // Three nodes from three different networks where possible.
        val chosen = ArrayList<Snode>()
        for (n in all) {
            if (chosen.none { it.ip.substringBeforeLast('.') == n.ip.substringBeforeLast('.') }) chosen.add(n)
            if (chosen.size == 3) break
        }
        path = chosen
        return chosen
    }

    @Synchronized
    private fun dropPath() { path = emptyList() }

    @Synchronized
    fun forget(node: Snode) {
        pool = pool.filter { it != node }
        if (node in path) path = emptyList()
    }

    // ---- onion requests ----

    private class Layer(val ciphertext: ByteArray, val key: ByteArray, val ephemeral: ByteArray)

    private fun encrypt(plain: ByteArray, xHex: String): Layer {
        val eph = Curve25519.generateKeyPair()
        val shared = SessionEncrypt.calculateECHDAgreement(x25519PubKey = hex(xHex), x25519PrivKey = eph.secretKey.data)
        val key = Mac.getInstance("HmacSHA256").run { init(SecretKeySpec("LOKI".toByteArray(), "HmacSHA256")); doFinal(shared) }
        return Layer(gcm(plain, key), key, eph.pubKey.data)
    }

    private fun gcm(plain: ByteArray, key: ByteArray): ByteArray {
        val iv = ByteArray(12).also { random.nextBytes(it) }
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, iv))
        return iv + c.doFinal(plain)
    }

    private fun ungcm(data: ByteArray, key: ByteArray): ByteArray {
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "AES"), GCMParameterSpec(128, data, 0, 12))
        return c.doFinal(data, 12, data.size - 12)
    }

    /** | 4 bytes little-endian length | ciphertext | json | */
    private fun frame(ciphertext: ByteArray, json: JSONObject): ByteArray {
        val j = json.toString().toByteArray()
        return ByteBuffer.allocate(4 + ciphertext.size + j.size).order(ByteOrder.LITTLE_ENDIAN)
            .putInt(ciphertext.size).put(ciphertext).put(j).array()
    }

    /** Where an onion request ends. */
    private sealed class Dest {
        class Node(val node: Snode) : Dest()
        class Server(val host: String, val xHex: String) : Dest()
    }

    private fun onion(dest: Dest, payload: ByteArray, hops: List<Snode>): Pair<ByteArray, ByteArray> {
        val inner = when (dest) {
            is Dest.Node -> encrypt(frame(payload, JSONObject().put("headers", "")), dest.node.x)
            is Dest.Server -> encrypt(payload, dest.xHex)
        }
        var layer = inner
        var next: Dest = dest
        for (hop in hops.asReversed()) {
            val info = when (val n = next) {
                is Dest.Node -> JSONObject().put("destination", n.node.ed)
                is Dest.Server -> JSONObject().put("host", n.host).put("target", "/oxen/v4/lsrpc")
                    .put("method", "POST").put("protocol", "http").put("port", 80)
            }
            info.put("ephemeral_key", hexOf(layer.ephemeral))
            layer = encrypt(frame(layer.ciphertext, info), hop.x)
            next = Dest.Node(hop)
        }
        val guard = hops.first()
        val body = frame(layer.ciphertext, JSONObject().put("ephemeral_key", hexOf(layer.ephemeral)))
        val raw = post("https://${guard.ip}:${guard.port}/onion_req/v2", body, nodeTls, true)
        return raw to inner.key
    }

    /** A JSON-RPC call to one service node, through a path. Returns the node's answer body. */
    fun rpc(node: Snode, method: String, params: JSONObject): JSONObject {
        var last: Exception? = null
        repeat(3) {
            val hops = pathAvoiding(node)
            if (hops.size < 3) throw IllegalStateException("not enough service nodes")
            try {
                val req = JSONObject().put("method", method).put("params", params).toString().toByteArray()
                val (raw, key) = onion(Dest.Node(node), req, hops)
                val plain = ungcm(Base64.decode(raw, Base64.DEFAULT), key)
                val r = JSONObject(String(plain))
                val status = r.optInt("status", 200)
                val bodyText = r.optString("body")
                if (status == 406) {
                    // Our clock is off: the node's time is in the answer.
                    runCatching { JSONObject(bodyText).optLong("t") }.getOrNull()?.takeIf { it > 0 }
                        ?.let { clockOffset = it - System.currentTimeMillis() }
                }
                if (status == 421) throw WrongSwarm()
                if (status !in 200..299) throw NetError(status, bodyText)
                val body = runCatching { JSONObject(bodyText) }.getOrElse { JSONObject() }
                body.optLong("t").takeIf { it > 0 }?.let { clockOffset = it - System.currentTimeMillis() }
                return body
            } catch (e: WrongSwarm) {
                throw e
            } catch (e: NetError) {
                last = e
                if (e.code == 502 || e.code == 503 || e.code == 504) dropPath() else if (e.code in 400..499 && e.code != 406) throw e
            } catch (e: Exception) {
                last = e
                dropPath()
            }
        }
        throw last ?: IllegalStateException("onion request failed")
    }

    class WrongSwarm : Exception("wrong swarm")

    /** An HTTP request to a server (the file server), through a path; returns (status, body). */
    fun server(host: String, edHex: String, method: String, endpoint: String, body: ByteArray?, headers: JSONObject = JSONObject()): Pair<Int, ByteArray> {
        val xHex = hexOf(Curve25519.pubKeyFromED25519(hex(edHex)))
        val meta = JSONObject().put("endpoint", endpoint).put("method", method).put("headers", headers).toString().toByteArray()
        val out = ByteArrayOutputStream()
        out.write("l${meta.size}:".toByteArray())
        out.write(meta)
        if (body != null) {
            out.write("${body.size}:".toByteArray())
            out.write(body)
        }
        out.write('e'.code)
        var last: Exception? = null
        repeat(3) {
            val hops = pathAvoiding(null)
            if (hops.size < 3) throw IllegalStateException("not enough service nodes")
            try {
                val (raw, key) = onion(Dest.Server(host, xHex), out.toByteArray(), hops)
                return bencodedReply(ungcm(raw, key))
            } catch (e: Exception) {
                last = e
                dropPath()
            }
        }
        throw last ?: IllegalStateException("onion request failed")
    }

    /** l<n>:<info json><m>:<body>e */
    private fun bencodedReply(d: ByteArray): Pair<Int, ByteArray> {
        var i = 1
        fun readLen(): Int {
            val start = i
            while (d[i] != ':'.code.toByte()) i++
            val n = String(d, start, i - start).toInt()
            i++
            return n
        }
        val infoLen = readLen()
        val info = JSONObject(String(d, i, infoLen))
        i += infoLen
        var body = ByteArray(0)
        if (i < d.size && d[i] != 'e'.code.toByte()) {
            val n = readLen()
            body = d.copyOfRange(i, i + n)
        }
        return info.optInt("code", 200) to body
    }

    // ---- swarms ----

    private val swarms = HashMap<String, List<Snode>>()

    fun swarm(pubkey: String): List<Snode> {
        synchronized(swarms) { swarms[pubkey]?.takeIf { it.isNotEmpty() }?.let { return it } }
        val all = nodes()
        val r = rpc(all[random.nextInt(all.size)], "get_snodes_for_pubkey", JSONObject().put("pubkey", pubkey))
        val list = parseNodes(r.optJSONArray("snodes") ?: JSONArray(), "ip", "port")
        synchronized(swarms) { swarms[pubkey] = list }
        return list
    }

    fun forgetSwarm(pubkey: String) { synchronized(swarms) { swarms.remove(pubkey) } }

    /** A call to some node of a swarm, trying others when one fails. */
    fun toSwarm(pubkey: String, method: String, params: JSONObject): JSONObject {
        var last: Exception? = null
        repeat(3) {
            val nodes = swarm(pubkey)
            if (nodes.isEmpty()) { forgetSwarm(pubkey); return@repeat }
            val n = nodes[random.nextInt(nodes.size)]
            try {
                return rpc(n, method, params)
            } catch (e: WrongSwarm) {
                last = e
                forgetSwarm(pubkey)
            } catch (e: Exception) {
                last = e
                synchronized(swarms) { swarms[pubkey] = nodes - n }
            }
        }
        throw last ?: IllegalStateException("swarm unreachable")
    }

    companion object {
        /** Where everything Session sends goes: through this door, or straight when null. */
        @Volatile var socks: Socks? = null
            private set
        /** Nothing may go straight: with no door, every request fails rather than leave unhidden. */
        @Volatile var mustHide = false
            private set

        /**
         * Session's way out: `url` as socks5h://user:password@127.0.0.1:port, or "" for straight;
         * `required` keeps anything from going straight (a missing door then stops Session).
         */
        fun setProxy(url: String, required: Boolean) {
            mustHide = required
            socks = if (url.isBlank()) null else {
                val u = java.net.URI(url)
                require(u.scheme == "socks5h" || u.scheme == "socks5") { "not a SOCKS5 door" }
                val (user, password) = (u.rawUserInfo ?: ":").split(":", limit = 2).map { java.net.URLDecoder.decode(it, "UTF-8") }.let { it[0] to it.getOrElse(1) { "" } }
                Socks(u.host ?: throw IllegalArgumentException("no host"), u.port, user, password)
            }
        }

        val SEEDS = listOf(
            "https://seed1.getsession.org:4443",
            "https://seed2.getsession.org:4443",
            "https://seed3.getsession.org:4443",
        )
        val SEED_PEMS = listOf("seed1.pem", "seed2.pem", "seed3.pem")

        const val FILE_HOST = "filev2.getsession.org"
        const val FILE_ED = "b8eef9821445ae16e2e97ef8aa6fe782fd11ad5253cd6723b281341dba22e371"

        fun hex(s: String): ByteArray = ByteArray(s.length / 2) { s.substring(it * 2, it * 2 + 2).toInt(16).toByte() }
        fun hexOf(b: ByteArray): String = b.joinToString("") { "%02x".format(it) }
    }
}
