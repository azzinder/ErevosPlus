// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import java.io.BufferedInputStream
import java.io.InputStream
import java.io.OutputStream
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.Collections
import java.util.concurrent.Executors

/**
 * A web page's way into Erevos's Tor (crates/erevos-tor, socks.rs), for a page that must not be
 * shown straight (WebSignInActivity: Signal's captcha while Signal goes through Tor).
 *
 * Android's web view can be told a proxy, but not one with a user name and password, and Tor's
 * door asks both. So this listens on the phone itself (127.0.0.1, a port of its own) as an HTTP
 * proxy that takes only CONNECT to port 443, the way a web view asks for an HTTPS page, and makes
 * each such tunnel through Tor's door, with the name and password, the host name resolved by Tor.
 * Nothing goes straight: what Tor cannot reach is refused. It lives only while the page is shown.
 */
internal class TorBridge(
  private val host: String,
  private val port: Int,
  private val user: String,
  private val password: String,
) : AutoCloseable {
  private val server = ServerSocket(0, 16, InetAddress.getByName("127.0.0.1"))
  private val pool = Executors.newCachedThreadPool { Thread(it, "erevos-web-tor").apply { isDaemon = true } }
  private val open = Collections.synchronizedSet(HashSet<Socket>())
  @Volatile private var closed = false

  /** The port the web view's proxy is on. */
  val localPort: Int get() = server.localPort

  init {
    require(user.toByteArray().size in 1..255 && password.toByteArray().size in 1..255) { "no door" }
    pool.execute {
      while (!closed) {
        val s = runCatching { server.accept() }.getOrNull() ?: break
        open.add(s)
        pool.execute { serve(s) }
      }
    }
  }

  private fun serve(client: Socket) {
    try {
      client.soTimeout = 30_000
      val input = BufferedInputStream(client.getInputStream())
      val out = client.getOutputStream()
      val head = head(input) ?: return
      val first = head.substringBefore("\r\n").split(' ')
      if (first.size < 3 || first[0] != "CONNECT") return reply(out, "405 Method Not Allowed")
      val target = first[1]
      val colon = target.lastIndexOf(':')
      val name = if (colon > 0) target.substring(0, colon).removePrefix("[").removeSuffix("]") else ""
      val to = if (colon > 0) target.substring(colon + 1).toIntOrNull() else null
      if (to != 443 || name.isEmpty() || name.toByteArray().size > 255 || name.any { it.isWhitespace() }) return reply(out, "403 Forbidden")
      val tor = Socket()
      open.add(tor)
      try {
        tor.connect(InetSocketAddress(host, port), 15_000)
        tor.soTimeout = 60_000
        if (!socks(tor.getInputStream(), tor.getOutputStream(), name, to)) return reply(out, "502 Bad Gateway")
        tor.soTimeout = 0
        client.soTimeout = 0
        out.write("HTTP/1.1 200 Connection established\r\n\r\n".toByteArray())
        out.flush()
        val up = pool.submit {
          runCatching { input.copyTo(tor.getOutputStream()) }
          runCatching { tor.shutdownOutput() }
        }
        runCatching { tor.getInputStream().copyTo(out) }
        runCatching { client.shutdownOutput() }
        runCatching { up.get() }
      } finally {
        runCatching { tor.close() }
        open.remove(tor)
      }
    } catch (_: Exception) {
      // The page asks again, or shows that it cannot load.
    } finally {
      runCatching { client.close() }
      open.remove(client)
    }
  }

  /** The request's head, up to its empty line; null when there is none within 8 KB. */
  private fun head(input: InputStream): String? {
    val bytes = StringBuilder()
    while (bytes.length < 8192) {
      val b = input.read()
      if (b < 0) return null
      bytes.append(b.toChar())
      if (bytes.endsWith("\r\n\r\n")) return bytes.toString()
    }
    return null
  }

  private fun reply(out: OutputStream, status: String) {
    runCatching {
      out.write("HTTP/1.1 $status\r\nContent-Length: 0\r\nConnection: close\r\n\r\n".toByteArray())
      out.flush()
    }
  }

  /** SOCKS5 to Tor's door: the name and password (RFC 1929), then CONNECT to the host by name. */
  private fun socks(input: InputStream, out: OutputStream, name: String, to: Int): Boolean {
    out.write(byteArrayOf(5, 1, 2))
    out.flush()
    if (read(input, 2).let { it[0] != 5.toByte() || it[1] != 2.toByte() }) return false
    val u = user.toByteArray()
    val p = password.toByteArray()
    out.write(byteArrayOf(1, u.size.toByte()) + u + byteArrayOf(p.size.toByte()) + p)
    out.flush()
    if (read(input, 2)[1] != 0.toByte()) return false
    val n = name.toByteArray()
    out.write(byteArrayOf(5, 1, 0, 3, n.size.toByte()) + n + byteArrayOf((to shr 8).toByte(), to.toByte()))
    out.flush()
    val answer = read(input, 4)
    if (answer[0] != 5.toByte() || answer[1] != 0.toByte()) return false
    // The address Tor says it is bound to, which no one needs.
    when (answer[3].toInt()) {
      1 -> read(input, 4 + 2)
      4 -> read(input, 16 + 2)
      3 -> read(input, (read(input, 1)[0].toInt() and 0xff) + 2)
      else -> return false
    }
    return true
  }

  private fun read(input: InputStream, n: Int): ByteArray {
    val bytes = ByteArray(n)
    var got = 0
    while (got < n) {
      val r = input.read(bytes, got, n - got)
      if (r < 0) throw java.io.EOFException()
      got += r
    }
    return bytes
  }

  override fun close() {
    closed = true
    runCatching { server.close() }
    synchronized(open) { open.toList() }.forEach { runCatching { it.close() } }
    pool.shutdownNow()
  }
}
