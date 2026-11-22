// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.engine

import androidx.webkit.ProxyConfig
import androidx.webkit.ProxyController
import androidx.webkit.WebViewFeature
import java.util.concurrent.Executor

/**
 * Sends the app's web views through Tor's SOCKS door, for the Messenger sign-in page when the
 * account must not go straight.
 *
 * The WebView proxy is one for the whole app, so turn it on only while the sign-in page is open
 * and turn it off when that page closes ([off]). Calls never go through Tor: never hold it while
 * a call page is open.
 */
object WebTor {
    /** False on a WebView too old to take a proxy: then a Tor-only sign-in must be refused. */
    val possible: Boolean
        get() = WebViewFeature.isFeatureSupported(WebViewFeature.PROXY_OVERRIDE)

    private val now = Executor { it.run() }

    /**
     * [door] is "socks5://127.0.0.1:port" (our own Tor). [ready] runs once the web views use it;
     * load the page only then. Returns false when the WebView cannot take a proxy.
     */
    fun on(door: String, ready: Runnable): Boolean {
        require(door.startsWith("socks5://127.0.0.1:") || door.startsWith("socks5://localhost:")) {
            "Tor door must be socks5 on this phone"
        }
        if (!possible) return false
        val config = ProxyConfig.Builder()
            .addProxyRule(door)
            .build()
        ProxyController.getInstance().setProxyOverride(config, now, ready)
        return true
    }

    /** Back to straight for the app's web views. [done] may be null. */
    fun off(done: Runnable? = null) {
        if (!possible) {
            done?.run()
            return
        }
        ProxyController.getInstance().clearProxyOverride(now, done ?: Runnable {})
    }
}
