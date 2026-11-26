// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import android.app.Activity
import android.app.Application
import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import android.webkit.CookieManager
import android.webkit.WebStorage
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.webkit.ScriptHandler
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import java.io.ByteArrayInputStream
import java.io.File
import java.io.FileInputStream
import java.util.Collections
import java.util.WeakHashMap
import org.json.JSONObject

/**
 * The web pages Erevos shows on screens of their own (MessengerCaseActivity, FacebookActivity,
 * WebSignInActivity) follow Erevos's own screen:
 *
 * - they close as the space locks or closes, and on panic ([closeAll], lib/web-pages.ts), so
 *   nothing of Messenger or Facebook shows over the lock without the password;
 * - they are kept out of screenshots and of the recent apps preview while Erevos's own window is
 *   ([setSecure], lib/screen-privacy.ts);
 * - they wear Erevos's colours in a bar of their own, with a way back to Erevos and the page's
 *   name ([framed], [setLook]), so they show inside Erevos rather than as a browser would;
 * - what a page left in the web view (cookies, storage) when Android ended Erevos with it open,
 *   which its onDestroy never cleared, goes as the engines open ([wipeIfNone]).
 */
internal object WebPages {
  private val main = Handler(Looper.getMainLooper())
  private val open: MutableSet<Activity> = Collections.newSetFromMap(WeakHashMap())

  @Volatile private var secure = false

  /** Erevos's colours now (lib/web-pages.ts webPagesLook): its surface, text and accent. */
  private class Look(val bar: Int, val text: Int, val accent: Int, val dark: Boolean)

  @Volatile private var look: Look? = null

  /**
   * Erevos's look for Meta's pages themselves (lib/messenger-case-look.ts): its CSS, dark or light,
   * ground, text size, the fills of the bubbles to find, and the style's letters as files.
   */
  private class PageLook(val config: JSONObject, val ground: Int?, val textZoom: Int, val fonts: List<String>)

  @Volatile private var pageLook: PageLook? = null

  /** The web views wearing it (by [dress]), each with its script that runs first, to renew. */
  private val dressed: MutableMap<WebView, ScriptHandler?> = WeakHashMap()

  /** Where the page asks for the style's letters (lib/messenger-case-look.ts FONT_URL). */
  private const val FONT_URL = "https://www.facebook.com/__erevos/font/"

  fun setLook(json: String) {
    runCatching { JSONObject(json).optJSONObject("page") }.getOrNull()?.let { p ->
      val css = p.optString("css")
      val fonts = p.optJSONArray("fonts")?.let { a -> (0 until a.length()).map { a.optString(it) } }.orEmpty()
      val bubbles = p.optJSONObject("bubbles")
      val config = JSONObject()
        .put("css", css)
        .put("dark", p.optBoolean("dark"))
        .put("mine", bubbles?.optString("mine").orEmpty())
        .put("theirs", bubbles?.optString("theirs").orEmpty())
      pageLook = if (css.isBlank()) null else PageLook(config, runCatching { Color.parseColor(p.optString("ground")) }.getOrNull(), p.optInt("textZoom", 100).coerceIn(50, 200), fonts)
      // The pages open now take it at once.
      main.post { dressed.keys.toList().forEach { dress(it) } }
    }
    look = runCatching {
      val o = JSONObject(json)
      Look(Color.parseColor(o.getString("bar")), Color.parseColor(o.getString("text")), Color.parseColor(o.getString("accent")), o.optBoolean("dark"))
    }.getOrNull() ?: return
  }

  /**
   * The script that paints a Meta page in Erevos's look: its colours over Meta's own CSS variables,
   * Meta's dark or light set as Erevos is, kept while the page changes itself; and the page's
   * message bubbles, found by their fill, marked (erevos-mine, erevos-theirs) for the look's shape.
   * On a page that has it already, it only brings the new look. Null before Erevos told its look.
   */
  private fun pageScript(): String? {
    val p = pageLook ?: return null
    // A JSON object is a JavaScript one: the CSS goes in as a string, whatever it holds.
    return """(function(cfg){var w=window;if(w.__erevosLook){w.__erevosLook(cfg);return;}
    var cur=cfg,pend=0;
    function put(){var d=document,h=d.documentElement;if(!h)return;
    var want=cur.dark?'__fb-dark-mode':'__fb-light-mode',not=cur.dark?'__fb-light-mode':'__fb-dark-mode';
    if(h.classList.contains(not))h.classList.remove(not);if(!h.classList.contains(want))h.classList.add(want);
    var s=d.getElementById('erevos-look');if(!s){s=d.createElement('style');s.id='erevos-look';}
    if(s.textContent!==cur.css)s.textContent=cur.css;var q=d.head||h;if(s.parentNode!==q)q.appendChild(s);}
    function tag(){pend=0;if(!cur.mine&&!cur.theirs)return;var root=document.querySelector('[role=main]')||document.body;if(!root)return;
    var els=root.querySelectorAll('[dir=auto]');for(var i=0;i<els.length&&i<800;i++){var e=els[i];
    if(e.closest('.erevos-mine,.erevos-theirs'))continue;var a=e;
    for(var k=0;k<6&&a&&a!==root;k++){var bg=getComputedStyle(a).backgroundColor;
    if(bg===cur.mine){a.classList.add('erevos-mine');break;}if(bg===cur.theirs){a.classList.add('erevos-theirs');break;}a=a.parentElement;}}}
    function later(){if(!pend)pend=setTimeout(tag,300);}
    w.__erevosLook=function(c){cur=c;var old=document.querySelectorAll('.erevos-mine,.erevos-theirs');
    for(var i=0;i<old.length;i++)old[i].classList.remove('erevos-mine','erevos-theirs');put();later();};
    put();new MutationObserver(put).observe(document.documentElement,{attributes:true,attributeFilter:['class'],childList:true});
    function body(){put();later();if(document.head)new MutationObserver(function(){if(!document.getElementById('erevos-look'))put();}).observe(document.head,{childList:true});
    if(document.body)new MutationObserver(later).observe(document.body,{childList:true,subtree:true});}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',body);else body();
    })(${p.config});"""
  }

  /**
   * Has a web view of a Meta page wear Erevos's look: from the start of every page (where the web
   * view can run a script first), on the page it shows now, and in its text size. Again as the
   * look changes, for as long as the web view lives.
   */
  fun dress(web: WebView) {
    runCatching { dressNow(web) }
  }

  private fun dressNow(web: WebView) {
    val p = pageLook
    if (!dressed.containsKey(web)) dressed[web] = null
    dressed[web]?.let { old -> runCatching { old.remove() } }
    dressed[web] = null
    if (p == null) return
    web.settings.textZoom = p.textZoom
    val js = pageScript() ?: return
    if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
      dressed[web] = runCatching { WebViewCompat.addDocumentStartJavaScript(web, js, setOf("https://*.facebook.com")) }.getOrNull()
    }
    if (web.url != null) repaint(web)
  }

  /** Before a web view is destroyed: it is no longer to be dressed. */
  fun undress(web: WebView) {
    dressed.remove(web)?.let { runCatching { it.remove() } }
  }

  /** The look again on a page that has shown (a page that has it takes only what is new). */
  fun repaint(web: WebView) {
    val js = pageScript() ?: return
    web.evaluateJavascript(js, null)
  }

  /**
   * The answer to a page's ask for the style's letters ([FONT_URL] and an index): the file Erevos
   * named, only from the app's own cache or files, never from the network. Null for any other ask.
   */
  fun fontAnswer(page: Activity, url: String): WebResourceResponse? {
    if (!url.startsWith(FONT_URL)) return null
    val none = WebResourceResponse("text/plain", null, 404, "Not Found", emptyMap(), ByteArrayInputStream(ByteArray(0)))
    val i = url.removePrefix(FONT_URL).toIntOrNull() ?: return none
    val path = pageLook?.fonts?.getOrNull(i) ?: return none
    val file = runCatching { File(path).canonicalFile }.getOrNull() ?: return none
    val mine = listOf(page.cacheDir, page.filesDir).mapNotNull { runCatching { it.canonicalPath + File.separator }.getOrNull() }
    if (mine.none { file.path.startsWith(it) } || !file.isFile) return none
    return runCatching { WebResourceResponse("font/ttf", null, 200, "OK", mapOf("Cache-Control" to "max-age=86400"), FileInputStream(file)) }.getOrDefault(none)
  }

  /** What shows behind a Meta page before it paints: Erevos's ground, else white or black as the phone is. */
  fun ground(page: Activity): Int {
    pageLook?.ground?.let { return it }
    val night = (page.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    return if (night) Color.BLACK else Color.WHITE
  }

  /** Erevos's own look if it was told, else Classic, light or dark as the phone is. */
  private fun lookFor(page: Activity): Look = look ?: run {
    val night = (page.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    if (night) Look(Color.parseColor("#17140F"), Color.parseColor("#F5EFE6"), Color.parseColor("#D9A441"), true)
    else Look(Color.parseColor("#FFFFFF"), Color.parseColor("#1C1712"), Color.parseColor("#D9A441"), false)
  }

  /**
   * The page's content under Erevos's bar: «←» back to Erevos (the page closes), its name, and
   * after it any buttons of the page's own. Set as the page's whole screen. Answers the name, to
   * change as the page does.
   */
  fun framed(page: Activity, title: String, content: View, extra: List<TextView> = emptyList()): TextView {
    val l = lookFor(page)
    fun dp(v: Float) = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, page.resources.displayMetrics).toInt()
    val bar = LinearLayout(page).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      setBackgroundColor(l.bar)
      setPadding(dp(4f), 0, dp(8f), 0)
    }
    val back = TextView(page).apply {
      text = "←"
      setTextColor(l.accent)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
      gravity = Gravity.CENTER
      contentDescription = "Erevos"
      setOnClickListener { page.finish() }
    }
    bar.addView(back, LinearLayout.LayoutParams(dp(48f), dp(48f)))
    val name = TextView(page).apply {
      text = title
      setTextColor(l.text)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
      maxLines = 1
      setPadding(dp(4f), 0, 0, 0)
    }
    bar.addView(name, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
    extra.forEach { b ->
      b.setTextColor(l.accent)
      b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
      b.gravity = Gravity.CENTER
      b.setPadding(dp(12f), 0, dp(12f), 0)
      bar.addView(b, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(48f)))
    }
    val root = LinearLayout(page).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(l.bar)
      fitsSystemWindows = true
    }
    root.addView(bar, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(56f)))
    root.addView(content, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
    page.setContentView(root)
    @Suppress("DEPRECATION")
    page.window.statusBarColor = l.bar
    @Suppress("DEPRECATION")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      val flags = page.window.decorView.systemUiVisibility
      page.window.decorView.systemUiVisibility =
        if (l.dark) flags and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv() else flags or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
    }
    return name
  }

  /** How many pages are in front now (resumed), and when one last stopped being (elapsedRealtime, ms; -1 never). Main thread. */
  @Volatile private var front = 0
  @Volatile private var leftAt = -1L
  @Volatile private var following = false

  /**
   * A page in front is Erevos in front: while one shows, Erevos's own screen is out of sight, but
   * the owner is still in Erevos, and the lock's time away does not run (app/_layout.tsx,
   * lib/web-pages.ts). It counts from when the last page left.
   */
  private val follow = object : Application.ActivityLifecycleCallbacks {
    override fun onActivityResumed(activity: Activity) {
      if (synchronized(open) { activity in open }) front++
    }

    override fun onActivityPaused(activity: Activity) {
      if (!synchronized(open) { activity in open }) return
      front = maxOf(0, front - 1)
      leftAt = SystemClock.elapsedRealtime()
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
    override fun onActivityStarted(activity: Activity) {}
    override fun onActivityStopped(activity: Activity) {}
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
    override fun onActivityDestroyed(activity: Activity) {}
  }

  /** Whether a page is in front now. */
  fun inFront(): Boolean = front > 0

  /** When a page last stopped being in front, on the clock nobody can set (ms); -1 when none has. */
  fun leftAt(): Long = leftAt

  /** From a page's onCreate, before it shows anything. */
  fun shown(page: Activity) {
    synchronized(open) { open.add(page) }
    if (!following) {
      following = true
      page.application.registerActivityLifecycleCallbacks(follow)
    }
    keep(page)
  }

  /** From a page's onDestroy. */
  fun gone(page: Activity) {
    synchronized(open) { open.remove(page) }
  }

  private fun keep(page: Activity) {
    if (secure) page.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    else page.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
  }

  private fun each(what: (Activity) -> Unit) {
    main.post { synchronized(open) { open.toList() }.forEach { runCatching { what(it) } } }
  }

  fun setSecure(on: Boolean) {
    secure = on
    each { keep(it) }
  }

  /** Every page closes; each clears what it held as it goes (its onDestroy). */
  fun closeAll() = each { if (!it.isFinishing) it.finish() }

  /** With no page open, nothing of one stays in the web view. */
  fun wipeIfNone() {
    main.post {
      if (synchronized(open) { open.isNotEmpty() }) return@post
      runCatching {
        CookieManager.getInstance().removeAllCookies(null)
        CookieManager.getInstance().flush()
        WebStorage.getInstance().deleteAllData()
      }
    }
  }
}
