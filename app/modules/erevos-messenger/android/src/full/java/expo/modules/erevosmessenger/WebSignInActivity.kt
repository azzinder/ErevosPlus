// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Color
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import androidx.webkit.ProxyConfig
import androidx.webkit.ProxyController
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

/**
 * A page of the service itself, which the owner fills in by themselves:
 * - "messenger": Messenger's sign-in, on facebook.com (messenger.com now leads there). Only the session cookies are read afterwards; the
 *   password never reaches Erevos. The web view's cookies are cleared then, so the engine alone
 *   holds the session (as messenger/android's LoginActivity does).
 * - "signalCaptcha": Signal's captcha page; its answer comes back as a signalcaptcha:// link.
 * One at a time: [start] gives the answer (null when the owner went back) to [done].
 *
 * With a Tor door (Messenger's sign-in or Signal's captcha while its account goes through Tor), the page goes only through
 * Tor (TorBridge), never straight: the app's web views are told that proxy while it is shown, the
 * page's own peer connections (WebRTC, which would go around a proxy) are taken away before it
 * runs, and a web view that can do neither is refused ([canTor]) rather than shown straight.
 */
class WebSignInActivity : Activity() {
  companion object {
    private const val KIND = "kind"
    private const val AGENT = "agent"
    private const val CAPTCHA_PAGE = "https://signalcaptchas.org/registration/generate.html"
    private const val DOOR = "door"

    // What a page shown through Tor has no more: what could reach out around the proxy.
    internal const val NO_PEERS =
      "['RTCPeerConnection','webkitRTCPeerConnection','RTCDataChannel','RTCIceCandidate']" +
        ".forEach(function(n){try{Object.defineProperty(window,n,{value:undefined,configurable:false})}catch(e){}});"

    /** Whether this phone's web view can show a page only through Tor. */
    fun canTor(): Boolean =
      runCatching {
        WebViewFeature.isFeatureSupported(WebViewFeature.PROXY_OVERRIDE) &&
          WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)
      }.getOrDefault(false)

    @Volatile private var done: ((String?) -> Unit)? = null

    /** `door`: Tor's SOCKS door as JSON ({host, port, user, password}), for a page only through Tor. */
    fun start(context: Context, kind: String, userAgent: String, door: String? = null, onDone: (String?) -> Unit) {
      done?.invoke(null)
      done = onDone
      context.startActivity(
        Intent(context, WebSignInActivity::class.java)
          .putExtra(KIND, kind)
          .putExtra(AGENT, userAgent)
          .apply { if (door != null) putExtra(DOOR, door) }
          .addFlags(if (context is Activity) 0 else Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }
  }

  private lateinit var web: WebView
  private var answered = false
  private var bridge: TorBridge? = null

  private fun answer(value: String?) {
    if (answered) return
    answered = true
    done?.let { done = null; it(value) }
  }

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WebPages.shown(this)
    val kind = intent.getStringExtra(KIND) ?: "messenger"
    web = WebView(this)
    web.settings.javaScriptEnabled = true
    web.settings.domStorageEnabled = true
    web.settings.setSupportZoom(true)
    web.settings.builtInZoomControls = true
    web.settings.displayZoomControls = false
    intent.getStringExtra(AGENT)?.takeIf { it.isNotEmpty() }?.let { web.settings.userAgentString = it }
    if (kind == "messenger") {
      // The same browser identity as the engine, so Meta sees one device; a clean start.
      CookieManager.getInstance().removeAllCookies(null)
      CookieManager.getInstance().setAcceptCookie(true)
    }
    web.webViewClient = object : WebViewClient() {
      override fun onPageFinished(view: WebView, url: String) {
        if (kind == "messenger") cookies()
      }

      override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val url = request.url.toString()
        if (kind == "signalCaptcha" && url.startsWith("signalcaptcha://")) {
          answer(url.removePrefix("signalcaptcha://"))
          finish()
          return true
        }
        return false
      }
    }
    val night = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    val frame = FrameLayout(this)
    frame.setBackgroundColor(if (night) Color.BLACK else Color.WHITE)
    frame.fitsSystemWindows = true
    frame.addView(web, FrameLayout.LayoutParams(-1, -1))
    setContentView(frame)
    val page = if (kind == "signalCaptcha") CAPTCHA_PAGE else "https://www.facebook.com/"
    val door = intent.getStringExtra(DOOR)
    if (door == null) {
      web.loadUrl(page)
      return
    }
    // Only through Tor: nothing loads until the proxy is in place, and without it nothing does.
    val bridge = runCatching {
      if (!canTor()) throw IllegalStateException("no Tor for web views here")
      val d = JSONObject(door)
      TorBridge(d.getString("host"), d.getInt("port"), d.getString("user"), d.getString("password"))
    }.getOrNull()
    if (bridge == null) {
      answer(null)
      finish()
      return
    }
    this.bridge = bridge
    WebViewCompat.addDocumentStartJavaScript(web, NO_PEERS, setOf("*"))
    val config = ProxyConfig.Builder().addProxyRule("127.0.0.1:${bridge.localPort}").build()
    ProxyController.getInstance().setProxyOverride(config, ContextCompat.getMainExecutor(this)) {
      if (!isFinishing && !isDestroyed) web.loadUrl(page)
    }
  }

  private fun cookies() {
    if (answered) return
    val raw = CookieManager.getInstance().getCookie("https://www.facebook.com") ?: return
    val jar = JSONObject()
    raw.split(";").forEach {
      val i = it.indexOf('=')
      if (i > 0) jar.put(it.substring(0, i).trim(), it.substring(i + 1).trim())
    }
    if (!jar.has("c_user") || !jar.has("xs") || !jar.has("datr")) return
    web.stopLoading()
    CookieManager.getInstance().removeAllCookies(null)
    CookieManager.getInstance().flush()
    answer(jar.toString())
    finish()
  }

  override fun onBackPressed() {
    if (web.canGoBack()) web.goBack() else {
      answer(null)
      super.onBackPressed()
    }
  }

  override fun onDestroy() {
    WebPages.gone(this)
    answer(null)
    web.destroy()
    bridge?.let { b ->
      bridge = null
      // The app's other web views go their own way again, then the door here closes.
      runCatching { ProxyController.getInstance().clearProxyOverride(ContextCompat.getMainExecutor(this)) { b.close() } }.onFailure { b.close() }
    }
    super.onDestroy()
  }
}
