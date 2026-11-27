// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosdevice

import android.content.Context
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import java.io.File
import java.net.Inet4Address
import java.net.InetAddress
import java.net.NetworkInterface
import java.security.MessageDigest
import java.security.SecureRandom

/**
 * Erevos from phone to phone with no internet (lib/give-app.ts): the APK installed here, served to
 * a phone on the same Wi-Fi or hotspot (ApkServer.kt), and on the other side, in Updates, taken,
 * checked and handed to Android's installer.
 *
 * The receiving Erevos keeps a package only when its SHA-256 is the one in the QR code, it is
 * Erevos, it is signed with the very certificates this Erevos is, and it is not older. A phone
 * without Erevos opens the page in its browser, which shows the SHA-256 and the certificate to
 * compare by eye.
 */
internal object NearbyApk {
  @Volatile private var server: ApkServer? = null
  @Volatile private var fetch: ApkFetch? = null
  private const val MINUTES = 10
  private const val INSTALL_PACKAGES = "android.permission.REQUEST_INSTALL_PACKAGES"

  /** The address of a network nearby on this phone, and its prefix. */
  private data class Lan(val name: String, val address: InetAddress, val prefix: Int)

  // Mobile data and VPNs, where no phone nearby is.
  private val NOT_NEARBY = Regex("^(rmnet|ccmni|v4-|clat|pdp|ppp|tun|ims|dummy|lo|bond|sit|ip6|r_rmnet)")
  private val WIFI = Regex("^(wlan|swlan|ap|softap|wifi|p2p|eth|rndis|usb|ncm|bt-pan)")

  private fun lans(): List<Lan> {
    val interfaces = runCatching { NetworkInterface.getNetworkInterfaces()?.toList() }.getOrNull() ?: emptyList()
    return interfaces
      .filter { runCatching { it.isUp && !it.isLoopback && !it.isVirtual }.getOrDefault(false) && !NOT_NEARBY.containsMatchIn(it.name) }
      .flatMap { link ->
        link.interfaceAddresses.mapNotNull { a ->
          val address = a.address as? Inet4Address ?: return@mapNotNull null
          if (!ApkServer.isNearbyHost(address.hostAddress ?: "") || address.isLoopbackAddress) return@mapNotNull null
          Lan(link.name, address, a.networkPrefixLength.toInt().coerceIn(8, 32))
        }
      }
      .sortedBy { if (WIFI.containsMatchIn(it.name)) 0 else 1 }
  }

  private fun signers(info: PackageInfo?): String? {
    info ?: return null
    val signatures = if (Build.VERSION.SDK_INT >= 28 && info.signingInfo != null) {
      info.signingInfo?.apkContentsSigners
    } else {
      @Suppress("DEPRECATION")
      info.signatures
    }
    return signatures?.takeIf { it.isNotEmpty() }?.map { ApkServer.hex(MessageDigest.getInstance("SHA-256").digest(it.toByteArray())) }?.sorted()?.joinToString(",")
  }

  @Suppress("DEPRECATION")
  private val SIGNED = (if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else 0) or PackageManager.GET_SIGNATURES

  private fun own(context: Context): PackageInfo = context.packageManager.getPackageInfo(context.packageName, SIGNED)

  private fun build(info: PackageInfo): Long =
    if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else @Suppress("DEPRECATION") info.versionCode.toLong()

  private fun escape(text: String): String = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

  private fun grouped(hex: String): String = hex.chunked(4).joinToString(" ")

  private fun page(words: Map<String, String>, version: String, sha256: String, cert: String, size: Long): ByteArray {
    fun w(key: String) = escape(words[key] ?: "")
    val certs = cert.split(',').joinToString("<br>") { grouped(it) }
    return """<!doctype html>
<html lang="${w("lang")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Erevos ${escape(version)}</title>
<style>body{font:17px/1.5 system-ui,sans-serif;max-width:36em;margin:0 auto;padding:16px;color:#16181d;background:#fff}
code{font-size:15px;word-break:break-all}a.get{display:inline-block;margin:8px 0;padding:12px 20px;border-radius:10px;background:#2b5f8e;color:#fff;text-decoration:none;font-weight:600}
@media (prefers-color-scheme:dark){body{color:#e9eaee;background:#121418}a.get{background:#4f8cc4}}</style></head>
<body><h1>Erevos ${escape(version)}</h1><p>${w("lead")}</p>
${if (words["note"].isNullOrEmpty()) "" else "<p><strong>${w("note")}</strong></p>\n"}<p><a class="get" href="${ApkServer.APK}" download>${w("button")}</a><br>${Math.round(size / 1_000_000.0)} MB</p>
<p>${w("hash")}<br><code>${grouped(sha256)}</code></p>
<p>${w("cert")}<br><code>$certs</code></p>
<p>${w("after")}</p></body></html>
""".toByteArray(Charsets.UTF_8)
  }

  /**
   * Starts giving this Erevos: the addresses of the networks nearby, the port and the path's
   * token, the package's SHA-256, size and version, and its certificates. "error" says why not:
   * "split" when Android installed it in parts (from a store), "network" with no Wi-Fi or hotspot.
   */
  fun start(context: Context, words: Map<String, String>): Map<String, Any?> {
    stop()
    val info = context.applicationInfo
    if (!info.splitSourceDirs.isNullOrEmpty()) return mapOf("error" to "split")
    val nearby = lans()
    if (nearby.isEmpty()) return mapOf("error" to "network")
    val file = File(info.sourceDir)
    val sha256 = ApkServer.sha256(file)
    val mine = own(context)
    val cert = signers(mine) ?: return mapOf("error" to "unsigned")
    val version = mine.versionName ?: ""
    val token = ApkServer.hex(ByteArray(16).also { SecureRandom().nextBytes(it) })
    val until = System.currentTimeMillis() + MINUTES * 60_000L
    val given = ApkServer(file, token, page(words, version, sha256, cert, file.length()), "erevos-$version.apk", until, accepts = { peer ->
      nearby.any { ApkServer.within(peer, it.address, it.prefix) }
    })
    given.start()
    server = given
    return mapOf(
      "addresses" to nearby.map { it.address.hostAddress },
      "port" to given.port,
      "token" to token,
      "sha256" to sha256,
      "size" to file.length().toDouble(),
      "version" to version,
      "cert" to cert,
      "until" to until.toDouble(),
    )
  }

  fun stop() {
    server?.stop()
    server = null
  }

  /** Whether it is still given (ten minutes, or 30 refusals, end it), and how many took it whole. */
  fun state(): Map<String, Any> {
    val given = server
    return mapOf("on" to (given?.running == true), "given" to (given?.given ?: 0))
  }

  /**
   * Takes the package a phone nearby gives into the cache (cache/updates/nearby.apk, where
   * lib/give-app.ts hands it to the installer) and checks it. "error" says why not: "link",
   * "network", "gone", "size", "short", "hash", "cancelled", "not-apk", "other-app",
   * "other-signer", "older", "same"; else "version", "build" and "fdroid", whether it is F-Droid's
   * build.
   */
  fun receive(context: Context, host: String, port: Int, token: String, sha256: String): Map<String, Any?> {
    fetch?.cancel()
    val taking = ApkFetch(host, port, token, sha256)
    fetch = taking
    val dest = File(File(context.cacheDir, "updates"), "nearby.apk")
    val error = try {
      taking.fetch(dest) ?: check(context, dest)
    } finally {
      if (fetch === taking) fetch = null
    }
    if (error != null) {
      dest.delete()
      return mapOf("error" to error)
    }
    val archive = context.packageManager.getPackageArchiveInfo(dest.path, PackageManager.GET_PERMISSIONS)
    return mapOf(
      "version" to (archive?.versionName ?: ""),
      "build" to (archive?.let { build(it).toDouble() } ?: 0.0),
      // F-Droid's build may not install packages (app.config.js), as F-Droid updates it: signed with
      // the same key, it is asked about before Android's installer opens (lib/give-app.ts).
      "fdroid" to (archive?.requestedPermissions?.contains(INSTALL_PACKAGES) != true),
    )
  }

  private fun check(context: Context, apk: File): String? {
    val archive = context.packageManager.getPackageArchiveInfo(apk.path, SIGNED) ?: return "not-apk"
    if (archive.packageName != context.packageName) return "other-app"
    val mine = own(context)
    val theirs = signers(archive) ?: return "other-signer"
    if (theirs != signers(mine)) return "other-signer"
    val build = build(archive)
    val current = build(mine)
    return if (build < current) "older" else if (build == current) "same" else null
  }

  fun progress(): Map<String, Double> {
    val taking = fetch
    return mapOf("received" to (taking?.received ?: 0L).toDouble(), "total" to (taking?.total ?: 0L).toDouble())
  }

  fun cancelReceiving() {
    fetch?.cancel()
  }
}
