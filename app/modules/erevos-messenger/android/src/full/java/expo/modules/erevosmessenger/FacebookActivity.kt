// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebStorage
import android.webkit.WebView
import android.webkit.WebResourceResponse
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import androidx.webkit.ProxyConfig
import androidx.webkit.ProxyController
import androidx.webkit.WebViewCompat
import org.json.JSONObject

/**
 * Facebook itself (m.facebook.com), with the Messenger account's own sign-in: the engine's
 * facebook.com cookies are given to the page while it shows and taken away when it closes, so the
 * engine alone keeps the session, as with the sign-in page (WebSignInActivity).
 *
 * - Only Meta's own hosts load here. A link out of Facebook opens in the phone's browser, taken
 *   out of Facebook's l.facebook.com wrapper and without its tracking marks (fbclid and the like).
 * - Messenger's links (facebook.com/messages, messenger.com, m.me) close the page and go to
 *   Erevos's own Messenger: [start] answers "messages", or "thread:<id>" for one chat.
 * - The page wears Erevos's look (WebPages.dress), as Messenger's case does, as far as the mobile
 *   site takes it. With Messenger used in its case, there is no Facebook card nor Open Facebook:
 *   Facebook's feed is in the case's own bar.
 * - With a Tor door (the Messenger account goes through Tor), the page goes only through Tor, never
 *   straight, as the sign-in page does.
 */
class FacebookActivity : Activity() {
  companion object {
    private const val COOKIES = "cookies"
    private const val DOOR = "door"
    private const val HOME = "https://m.facebook.com/"
    private const val PICK = 7

    private val metaHosts = listOf("facebook.com", "fbcdn.net", "fbsbx.com", "facebook.net")

    // The marks Meta adds to a link to follow who opened it: on any site fbclid, mibextid and
    // utm_*; the others only on Meta's own hosts, where they are Meta's (elsewhere a site may use
    // a ref of its own).
    private val trackers = setOf("fbclid", "mibextid")
    private val metaTrackers = setOf("__cft__", "__tn__", "__xts__", "eav", "refid", "ref", "fref", "hc_ref", "_rdr")

    private fun isWeb(uri: Uri) = uri.scheme.orEmpty().lowercase().let { it == "https" || it == "http" }

    @Volatile private var done: ((String?) -> Unit)? = null

    /** `cookies`: the engine's facebook.com cookies (JSON); `door`: Tor's SOCKS door as JSON, or null. */
    fun start(context: Context, cookies: String, door: String?, onDone: (String?) -> Unit) {
      done?.invoke(null)
      done = onDone
      context.startActivity(
        Intent(context, FacebookActivity::class.java)
          .putExtra(COOKIES, cookies)
          .apply { if (door != null) putExtra(DOOR, door) }
          .addFlags(if (context is Activity) 0 else Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }

    private fun meta(host: String) = metaHosts.any { host == it || host.endsWith(".$it") }

    /** A link of Messenger's: "messages", or "thread:<id>" for one chat; null for any other. */
    internal fun messengerLink(uri: Uri): String? {
      val host = uri.host.orEmpty().lowercase()
      val parts = uri.pathSegments
      val thread = { i: Int -> parts.getOrNull(i)?.takeIf { id -> id.all { it.isDigit() } }?.let { "thread:$it" } }
      return when {
        host == "m.me" || host.endsWith(".m.me") -> "messages"
        host == "messenger.com" || host.endsWith(".messenger.com") ->
          if (parts.firstOrNull() == "t") thread(1) ?: "messages"
          else if (parts.getOrNull(0) == "e2ee" && parts.getOrNull(1) == "t") thread(2) ?: "messages"
          else "messages"
        meta(host) && parts.firstOrNull() == "messages" ->
          if (parts.getOrNull(1) == "t") thread(2) ?: "messages"
          else if (parts.getOrNull(1) == "e2ee" && parts.getOrNull(2) == "t") thread(3) ?: "messages"
          else "messages"
        else -> null
      }
    }

    /**
     * A link out of Facebook: out of its wrapper (l.facebook.com/l.php?u=…) and without its marks;
     * null when what it leads to is no web page (tel:, another app's link), which never opens.
     */
    internal fun outside(uri: Uri): Uri? {
      val host = uri.host.orEmpty().lowercase()
      val inner = if ((host == "l.facebook.com" || host == "lm.facebook.com") && uri.path == "/l.php") {
        uri.getQueryParameter("u")?.let { Uri.parse(it) } ?: return null
      } else null
      val link = inner ?: uri
      if (!isWeb(link)) return null
      if (link.isOpaque || link.query == null) return link
      val ofMeta = meta(link.host.orEmpty().lowercase())
      val kept = link.buildUpon().clearQuery()
      for (name in link.queryParameterNames) {
        val n = name.lowercase()
        if (n in trackers || n.startsWith("utm_") || (ofMeta && n in metaTrackers)) continue
        for (v in link.getQueryParameters(name)) kept.appendQueryParameter(name, v)
      }
      return kept.build()
    }
  }

  private lateinit var web: WebView
  private var answered = false
  private var bridge: TorBridge? = null
  private var picking: ValueCallback<Array<Uri>>? = null

  private fun answer(value: String?) {
    if (answered) return
    answered = true
    done?.let { done = null; it(value) }
  }

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WebPages.shown(this)
    web = WebView(this)
    web.settings.javaScriptEnabled = true
    web.settings.domStorageEnabled = true
    web.settings.setSupportZoom(true)
    web.settings.builtInZoomControls = true
    web.settings.displayZoomControls = false
    // A phone browser, not an app's web view: Meta refuses some pages to the latter.
    web.settings.userAgentString = web.settings.userAgentString.replace("; wv)", ")").replace(Regex(" Version/\\d+(\\.\\d+)*"), "")

    val cm = CookieManager.getInstance()
    cm.setAcceptCookie(true)
    cm.setAcceptThirdPartyCookies(web, true)

    web.webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val uri = request.url
        val scheme = uri.scheme.orEmpty().lowercase()
        messengerLink(uri)?.let {
          answer(it)
          finish()
          return true
        }
        val host = uri.host.orEmpty().lowercase()
        if ((scheme == "https" || scheme == "http") && meta(host) && host != "l.facebook.com" && host != "lm.facebook.com") return false
        // Out of Facebook: the phone's browser, never inside here.
        if (scheme == "https" || scheme == "http") {
          outside(uri)?.let { out -> runCatching { startActivity(Intent(Intent.ACTION_VIEW, out)) } }
        }
        return true
      }

      // The style's letters, asked for by the look's CSS: from the phone, never the network.
      override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
        WebPages.fontAnswer(this@FacebookActivity, request.url.toString())

      override fun onPageCommitVisible(view: WebView, url: String) {
        WebPages.repaint(view)
      }

      override fun onPageFinished(view: WebView, url: String) {
        WebPages.repaint(view)
      }
    }
    // Facebook's page in Erevos's look, as Messenger's case (lib/messenger-case-look.ts).
    WebPages.dress(web)
    web.webChromeClient = object : WebChromeClient() {
      // A photo or video for a post: the phone's own picker.
      override fun onShowFileChooser(view: WebView, callback: ValueCallback<Array<Uri>>, params: FileChooserParams): Boolean {
        picking?.onReceiveValue(null)
        picking = callback
        return runCatching { startActivityForResult(params.createIntent(), PICK); true }.getOrElse {
          picking = null
          callback.onReceiveValue(null)
          false
        }
      }
    }

    val frame = FrameLayout(this)
    frame.setBackgroundColor(WebPages.ground(this))
    frame.addView(web, FrameLayout.LayoutParams(-1, -1))
    WebPages.framed(this, "Facebook", frame)

    // What an earlier page left, if Erevos was closed before it could clear it (onDestroy), goes
    // first; then the engine's session is given to this page alone, and it loads.
    WebStorage.getInstance().deleteAllData()
    cm.removeAllCookies {
      if (isFinishing || isDestroyed) return@removeAllCookies
      val jar = runCatching { JSONObject(intent.getStringExtra(COOKIES) ?: "{}") }.getOrDefault(JSONObject())
      for (name in jar.keys()) {
        val v = jar.optString(name)
        if (v.isNotEmpty()) cm.setCookie("https://www.facebook.com", "$name=$v; Domain=.facebook.com; Path=/; Secure")
      }
      cm.flush()
      load()
    }
  }

  private fun load() {
    val door = intent.getStringExtra(DOOR)
    if (door == null) {
      web.loadUrl(HOME)
      return
    }
    // Only through Tor: nothing loads until the proxy is in place, and without it nothing does.
    val bridge = runCatching {
      if (!WebSignInActivity.canTor()) throw IllegalStateException("no Tor for web views here")
      val d = JSONObject(door)
      TorBridge(d.getString("host"), d.getInt("port"), d.getString("user"), d.getString("password"))
    }.getOrNull()
    if (bridge == null) {
      answer(null)
      finish()
      return
    }
    this.bridge = bridge
    WebViewCompat.addDocumentStartJavaScript(web, WebSignInActivity.NO_PEERS, setOf("*"))
    val config = ProxyConfig.Builder().addProxyRule("127.0.0.1:${bridge.localPort}").build()
    ProxyController.getInstance().setProxyOverride(config, ContextCompat.getMainExecutor(this)) {
      if (!isFinishing && !isDestroyed) web.loadUrl(HOME)
    }
  }

  @Deprecated("Deprecated in Java")
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode == PICK) {
      picking?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data))
      picking = null
      return
    }
    super.onActivityResult(requestCode, resultCode, data)
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    if (web.canGoBack()) web.goBack() else {
      answer(null)
      super.onBackPressed()
    }
  }

  override fun onDestroy() {
    WebPages.gone(this)
    answer(null)
    picking?.onReceiveValue(null)
    picking = null
    web.stopLoading()
    WebPages.undress(web)
    web.destroy()
    // The session goes back to the engine alone: nothing of it stays in the web view.
    CookieManager.getInstance().removeAllCookies(null)
    CookieManager.getInstance().flush()
    WebStorage.getInstance().deleteAllData()
    bridge?.let { b ->
      bridge = null
      runCatching { ProxyController.getInstance().clearProxyOverride(ContextCompat.getMainExecutor(this)) { b.close() } }.onFailure { b.close() }
    }
    super.onDestroy()
  }
}
