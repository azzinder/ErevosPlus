// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Message
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebStorage
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.webkit.ProxyConfig
import androidx.webkit.Profile
import androidx.webkit.ProfileStore
import androidx.webkit.ProxyController
import androidx.webkit.UserAgentMetadata
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

/**
 * Messenger in its case: Meta's own page (facebook.com/messages) in a web view closed in by Erevos,
 * for the owner who chose it over Erevos's engine (lib/messenger-store.ts messengerWay 'case').
 *
 * - The engine keeps the sign-in. It is given to the page as it opens; as it closes, the cookies
 *   the page ended with go back to the engine ([answer] "cookies:<json>", or "signedOut").
 * - What the page keeps (its storage, its cookies) stays between openings in a web view profile of
 *   its own ([kept]), apart from every other page of Erevos's, so Meta's page knows this phone
 *   again and does not ask for the PIN of the encrypted chats each time (the owner's choice,
 *   2026-11-21). It goes when Messenger signs out, here or on the page, and when another account
 *   opens ([forget]). Where the web view has no profiles, nothing stays, as before.
 * - Only Meta's own hosts load here. A link out opens in the phone's browser, out of Facebook's
 *   l.facebook.com wrapper and without its tracking marks (FacebookActivity.outside); never under Tor.
 * - It is the desktop page (the engine's own browser name, and the same «desktop Chrome» to the
 *   page's scripts), laid out at the phone's width: on a phone's name Meta offers only its app.
 * - It shows under Erevos's own bar (WebPages.framed): «←» back to Erevos, its name, and a button
 *   to Facebook's feed and back, in this same page with the same sign-in.
 * - Meta's page itself wears Erevos's look (WebPages.dress, lib/messenger-case-look.ts): its
 *   colours over Meta's own, dark or light as Erevos is, and its serif or monospace if it has one.
 * - Calls work as on a computer: the microphone and the camera are asked for when the page wants
 *   them. With a Tor door (the account goes through Tor) the page goes only through Tor, never
 *   straight, and calls cannot (they would go straight): the page is told there are none.
 */
class MessengerCaseActivity : Activity() {
  companion object {
    private const val COOKIES = "cookies"
    private const val AGENT = "agent"
    private const val DOOR = "door"
    private const val THREAD = "thread"
    private const val PICK = 7
    private const val ASK_MEDIA = 8
    private const val SITE = "https://www.facebook.com"

    private val metaHosts = listOf("facebook.com", "fbcdn.net", "fbsbx.com", "facebook.net")
    private fun meta(host: String) = metaHosts.any { host == it || host.endsWith(".$it") }

    private const val PROFILE = "messenger-case"

    @Volatile private var done: ((String?) -> Unit)? = null

    /**
     * Whether the case is on the screen now: its page then shows what comes, and Erevos tells of
     * none of it. Left behind (Home, the screen off, the lock), Erevos tells again (lib/messenger-store.ts).
     */
    @Volatile var inFront = false
      private set

    /** The case's own web view profile, kept between openings; null where the web view has none. Main thread. */
    internal fun kept(): Profile? =
      if (!WebViewFeature.isFeatureSupported(WebViewFeature.MULTI_PROFILE)) null
      else runCatching { ProfileStore.getInstance().getOrCreateProfile(PROFILE) }.getOrNull()

    /** Nothing the page kept stays: Messenger signed out, or another account comes. Main thread. */
    internal fun forget() {
      val p = kept() ?: return
      runCatching {
        p.cookieManager.removeAllCookies(null)
        p.cookieManager.flush()
        p.webStorage.deleteAllData()
      }
    }

    /** One cookie's value out of a Cookie header, or null. */
    private fun cookieIn(raw: String?, name: String): String? =
      raw?.split(";")?.map { it.trim() }?.firstOrNull { it.startsWith("$name=") }?.substring(name.length + 1)

    /**
     * `cookies`: the engine's facebook.com cookies (JSON); `agent`: its browser name; `door`: Tor's
     * SOCKS door as JSON, or null; `thread`: a chat to open, or "".
     */
    fun start(context: Context, cookies: String, agent: String, door: String?, thread: String, onDone: (String?) -> Unit) {
      done?.invoke(null)
      done = onDone
      context.startActivity(
        Intent(context, MessengerCaseActivity::class.java)
          .putExtra(COOKIES, cookies)
          .putExtra(AGENT, agent)
          .putExtra(THREAD, thread)
          .apply { if (door != null) putExtra(DOOR, door) }
          .addFlags(if (context is Activity) 0 else Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    }

    /** The page of one chat (its key: digits; an encrypted one as "e2ee:<digits>"), or the list. */
    internal fun pageOf(thread: String): String {
      val e2ee = thread.startsWith("e2ee:")
      val id = thread.removePrefix("e2ee:")
      if (id.isEmpty() || !id.all { it.isDigit() }) return "$SITE/messages/"
      return if (e2ee) "$SITE/messages/e2ee/t/$id" else "$SITE/messages/t/$id"
    }
  }

  private lateinit var frame: FrameLayout
  private lateinit var web: WebView
  private var popup: WebView? = null
  private var answered = false
  private var throughTor = false
  private var bridge: TorBridge? = null
  private var picking: ValueCallback<Array<Uri>>? = null
  private var pending: PermissionRequest? = null
  private lateinit var title: TextView
  private lateinit var swap: TextView
  private var feed = false
  private var profile: Profile? = null

  /** The cookies of the case's own profile, or the web view's only ones where it has no profiles. */
  private val cookies: CookieManager get() = profile?.cookieManager ?: CookieManager.getInstance()

  private fun answer(value: String?) {
    if (answered) return
    answered = true
    done?.let { done = null; it(value) }
  }

  private val pages = object : WebViewClient() {
    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
      val uri = request.url
      val scheme = uri.scheme.orEmpty().lowercase()
      val host = uri.host.orEmpty().lowercase()
      val web = scheme == "https" || scheme == "http"
      if (web && meta(host) && host != "l.facebook.com" && host != "lm.facebook.com") return false
      // messenger.com and m.me now lead to facebook.com/messages: keep them inside, there.
      if (web && (host == "messenger.com" || host.endsWith(".messenger.com") || host == "m.me")) {
        view.loadUrl(pageOf(FacebookActivity.messengerLink(uri)?.removePrefix("thread:").orEmpty()))
        return true
      }
      // Out of Facebook: the phone's browser (which goes straight), never while under Tor.
      if (web && !throughTor) {
        FacebookActivity.outside(uri)?.let { out -> runCatching { startActivity(Intent(Intent.ACTION_VIEW, out)) } }
      }
      return true
    }

    // The bar says where the page is, however it got there (its own links, Back), not only after its button.
    override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
      if (view === web && url != null) barFor(url)
    }

    // The style's letters, asked for by the look's CSS: from the phone, never the network.
    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
      WebPages.fontAnswer(this@MessengerCaseActivity, request.url.toString())

    override fun onPageCommitVisible(view: WebView, url: String) {
      phoneWidth(view)
      WebPages.repaint(view)
    }
    override fun onPageFinished(view: WebView, url: String) {
      phoneWidth(view)
      WebPages.repaint(view)
    }
  }

  private val chrome: WebChromeClient = object : WebChromeClient() {
    override fun onPermissionRequest(request: PermissionRequest) {
      val wanted = request.resources.filter {
        it == PermissionRequest.RESOURCE_AUDIO_CAPTURE || it == PermissionRequest.RESOURCE_VIDEO_CAPTURE
      }
      // Under Tor a call would go straight: none. And only Meta's own pages may have them.
      val from = request.origin?.let { o -> o.scheme.orEmpty().lowercase() == "https" && meta(o.host.orEmpty().lowercase()) } == true
      if (wanted.isEmpty() || throughTor || !from) {
        request.deny()
        return
      }
      runOnUiThread {
        val missing = mediaMissing()
        if (missing.isEmpty()) request.grant(wanted.toTypedArray())
        else {
          pending?.deny()
          pending = request
          requestPermissions(missing, ASK_MEDIA)
        }
      }
    }

    // A call opens in a window of its own: shown here, over the chats.
    override fun onCreateWindow(view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message): Boolean {
      closePopup()
      val w = makeWeb()
      popup = w
      frame.addView(w, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
      web.visibility = View.GONE
      (resultMsg.obj as WebView.WebViewTransport).webView = w
      resultMsg.sendToTarget()
      return true
    }

    override fun onCloseWindow(window: WebView) {
      if (window == popup) closePopup()
    }

    // A photo, video or file to send: the phone's own picker.
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

  @SuppressLint("SetJavaScriptEnabled")
  private fun makeWeb(): WebView = WebView(this).apply {
    // Its profile before anything else (a call's window too: it must share the page's).
    profile?.let { WebViewCompat.setProfile(this, it.name) }
    settings.javaScriptEnabled = true
    settings.domStorageEnabled = true
    settings.mediaPlaybackRequiresUserGesture = false
    settings.useWideViewPort = true
    settings.loadWithOverviewMode = true
    settings.setSupportZoom(true)
    settings.builtInZoomControls = true
    settings.displayZoomControls = false
    settings.javaScriptCanOpenWindowsAutomatically = true
    settings.setSupportMultipleWindows(true)
    // No file:// or content:// pages, ever.
    settings.allowFileAccess = false
    settings.allowContentAccess = false
    intent.getStringExtra(AGENT)?.takeIf { it.isNotBlank() }?.let { settings.userAgentString = it }
    webViewClient = pages
    webChromeClient = chrome
    cookies.setAcceptThirdPartyCookies(this, true)
    // A file the page offers to save: through the browser, never while under Tor (it would go straight).
    setDownloadListener { url, _, _, _, _ ->
      val uri = Uri.parse(url)
      if (!throughTor && uri.scheme == "https" && meta(uri.host.orEmpty().lowercase())) {
        runCatching { startActivity(Intent(Intent.ACTION_VIEW, uri)) }
      }
    }
    looksLikeDesktopChrome(this)
    // Meta's page in Erevos's colours, dark or light as Erevos is (lib/messenger-case-look.ts).
    WebPages.dress(this)
    if (throughTor) WebViewCompat.addDocumentStartJavaScript(this, WebSignInActivity.NO_PEERS, setOf("*"))
  }

  /**
   * The desktop page laid out at the phone's own width, not a computer's: squeezed from 900 points
   * into a phone's 400 or so, everything was too small to read. Narrow, Meta's page shows the chat
   * list or one chat at a time.
   */
  private fun phoneWidth(view: WebView) {
    if (view !== web) return
    view.evaluateJavascript(
      """(function(){var c='width=device-width, initial-scale=1';var m=document.querySelector('meta[name=viewport]');
      if(!m){m=document.createElement('meta');m.name='viewport';(document.head||document.documentElement).appendChild(m);}
      if(m.content!==c)m.content=c;})();""",
      null,
    )
  }

  /**
   * Besides its name, a web view tells pages it is an «Android WebView» on a phone (Sec-CH-UA,
   * navigator.userAgentData): tell them the same desktop Chrome as the engine's name, whose version
   * it carries.
   */
  private fun looksLikeDesktopChrome(w: WebView) {
    val agent = intent.getStringExtra(AGENT).orEmpty()
    val full = Regex("Chrome/(\\d+(?:\\.\\d+){3})").find(agent)?.groupValues?.get(1) ?: return
    val major = full.substringBefore('.')
    if (WebViewFeature.isFeatureSupported(WebViewFeature.USER_AGENT_METADATA)) {
      fun brand(name: String, m: String, f: String) =
        UserAgentMetadata.BrandVersion.Builder().setBrand(name).setMajorVersion(m).setFullVersion(f).build()
      runCatching {
        WebSettingsCompat.setUserAgentMetadata(
          w.settings,
          UserAgentMetadata.Builder()
            .setBrandVersionList(listOf(brand("Chromium", major, full), brand("Google Chrome", major, full), brand("Not-A.Brand", "99", "99.0.0.0")))
            .setFullVersion(full)
            .setPlatform("Linux")
            .setPlatformVersion("")
            .setArchitecture("x86")
            .setModel("")
            .setMobile(false)
            .setBitness(64)
            .build(),
        )
      }
    }
    if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
      runCatching {
        WebViewCompat.addDocumentStartJavaScript(
          w,
          """(function(){var b=[{brand:'Chromium',version:'$major'},{brand:'Google Chrome',version:'$major'},{brand:'Not-A.Brand',version:'99'}];
          var f=[{brand:'Chromium',version:'$full'},{brand:'Google Chrome',version:'$full'},{brand:'Not-A.Brand',version:'99.0.0.0'}];
          var low={brands:b,mobile:false,platform:'Linux'};
          var high={brands:b,mobile:false,platform:'Linux',architecture:'x86',bitness:'64',model:'',platformVersion:'',uaFullVersion:'$full',fullVersionList:f,wow64:false,formFactors:['Desktop']};
          var d={brands:b,mobile:false,platform:'Linux',getHighEntropyValues:function(){return Promise.resolve(high);},toJSON:function(){return low;}};
          function put(k,v){try{Object.defineProperty(Navigator.prototype,k,{get:function(){return v;},configurable:true});}catch(e){}}
          put('userAgentData',d);put('platform','Linux x86_64');put('maxTouchPoints',0);})();""",
          setOf("https://*.facebook.com"),
        )
      }
    }
  }

  private fun closePopup() {
    val p = popup ?: return
    popup = null
    frame.removeView(p)
    WebPages.undress(p)
    p.loadUrl("about:blank")
    p.destroy()
    web.visibility = View.VISIBLE
  }

  private fun mediaMissing(): Array<String> =
    arrayOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA)
      .filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
      .toTypedArray()

  override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (requestCode != ASK_MEDIA) return
    val request = pending ?: return
    pending = null
    val have = request.resources.filter {
      (it == PermissionRequest.RESOURCE_AUDIO_CAPTURE && ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) ||
        (it == PermissionRequest.RESOURCE_VIDEO_CAPTURE && ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED)
    }
    if (have.isEmpty()) request.deny() else request.grant(have.toTypedArray())
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WebPages.shown(this)
    throughTor = intent.getStringExtra(DOOR) != null
    profile = kept()
    web = makeWeb()
    val cm = cookies
    cm.setAcceptCookie(true)

    frame = FrameLayout(this)
    frame.setBackgroundColor(WebPages.ground(this))
    frame.addView(web, FrameLayout.LayoutParams(-1, -1))
    // The bar's own button goes between Messenger and Facebook's feed, in this same page and sign-in.
    swap = TextView(this).apply {
      text = "Facebook"
      setOnClickListener { showFeed(!feed) }
    }
    title = WebPages.framed(this, "Messenger", frame, listOf(swap))

    // The engine's session is given to this page. What the page kept from before stays for the same
    // account (so no PIN again); another account's, or any without a profile of its own, goes first.
    val jar = runCatching { JSONObject(intent.getStringExtra(COOKIES) ?: "{}") }.getOrDefault(JSONObject())
    val give = {
      for (name in jar.keys()) {
        val v = jar.optString(name)
        if (v.isNotEmpty()) cm.setCookie(SITE, "$name=$v; Domain=.facebook.com; Path=/; Secure")
      }
      cm.flush()
      load()
    }
    val same = profile != null && cookieIn(cm.getCookie(SITE), "c_user").let { it != null && it == jar.optString("c_user") }
    if (same) {
      give()
      return
    }
    (profile?.webStorage ?: WebStorage.getInstance()).deleteAllData()
    cm.removeAllCookies {
      if (isFinishing || isDestroyed) return@removeAllCookies
      give()
    }
  }

  /** The bar's name and button for the page at [url]: Messenger under /messages, Facebook elsewhere. */
  private fun barFor(url: String) {
    val uri = Uri.parse(url)
    if (!meta(uri.host.orEmpty().lowercase())) return
    feed = !uri.path.orEmpty().startsWith("/messages")
    title.text = if (feed) "Facebook" else "Messenger"
    swap.text = if (feed) "Messenger" else "Facebook"
  }

  /** Facebook's feed (its home page), or back to the chats. */
  private fun showFeed(on: Boolean) {
    if (web.url == null) return
    closePopup()
    web.loadUrl(if (on) "$SITE/" else pageOf(""))
  }

  private fun load() {
    val page = pageOf(intent.getStringExtra(THREAD).orEmpty())
    val door = intent.getStringExtra(DOOR)
    if (door == null) {
      web.loadUrl(page)
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
    val config = ProxyConfig.Builder().addProxyRule("127.0.0.1:${bridge.localPort}").build()
    ProxyController.getInstance().setProxyOverride(config, ContextCompat.getMainExecutor(this)) {
      if (!isFinishing && !isDestroyed) web.loadUrl(page)
    }
  }

  /** The sign-in the page ends with, for the engine: renewed cookies, or signed out there. */
  private fun signInNow(): String? {
    val raw = cookies.getCookie(SITE) ?: return null
    val jar = JSONObject()
    raw.split(";").forEach {
      val i = it.indexOf('=')
      if (i > 0) jar.put(it.substring(0, i).trim(), it.substring(i + 1).trim())
    }
    if (!jar.has("c_user") || !jar.has("xs")) return "signedOut"
    if (!jar.has("datr")) return null
    return "cookies:$jar"
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
    val p = popup
    when {
      p != null && p.canGoBack() -> p.goBack()
      p != null -> closePopup()
      web.canGoBack() -> web.goBack()
      else -> super.onBackPressed()
    }
  }

  override fun onResume() {
    super.onResume()
    inFront = true
  }

  override fun onPause() {
    inFront = false
    super.onPause()
  }

  override fun onDestroy() {
    inFront = false
    WebPages.gone(this)
    // Only a page that loaded may say how the sign-in ended (a Tor page that never came says nothing).
    val ended = if (web.url != null) signInNow() else null
    answer(ended)
    picking?.onReceiveValue(null)
    picking = null
    pending?.deny()
    pending = null
    closePopup()
    web.stopLoading()
    WebPages.undress(web)
    web.destroy()
    if (profile == null) {
      // No profile of its own: the session goes back to the engine alone, nothing stays in the web view.
      CookieManager.getInstance().removeAllCookies(null)
      CookieManager.getInstance().flush()
      WebStorage.getInstance().deleteAllData()
    } else if (ended == "signedOut") {
      forget()
    } else {
      cookies.flush()
    }
    bridge?.let { b ->
      bridge = null
      runCatching { ProxyController.getInstance().clearProxyOverride(ContextCompat.getMainExecutor(this)) { b.close() } }.onFailure { b.close() }
    }
    super.onDestroy()
  }
}
