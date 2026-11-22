// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.webkit.UserAgentMetadata
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import org.json.JSONObject

/**
 * TEST: calls through facebook.com/messages (messenger.com for older sign-ins). Messenger's calls use Meta's own closed protocol, which no
 * open library speaks; messenger.com can call from a desktop browser, so this opens the chat
 * there, signed in with the same cookies, and lets the page use the microphone and camera.
 * The page keeps its own cookies (datr names the browser), so it stays one known browser.
 */
class CallActivity : Activity() {
    companion object {
        private const val EXTRA_THREAD = "thread"
        private const val EXTRA_ENCRYPTED = "encrypted"
        private const val EXTRA_VIDEO = "video"
        private const val ASK_MEDIA = 7
        // The desktop Chrome the engine's browser name claims (messagix useragent).
        private const val CHROME = "141"
        private const val CHROME_FULL = "141.0.7390.122"

        fun open(context: Context, thread: Long, encrypted: Boolean, video: Boolean = false) {
            context.startActivity(
                Intent(context, CallActivity::class.java).putExtra(EXTRA_THREAD, thread)
                    .putExtra(EXTRA_ENCRYPTED, encrypted)
                    .putExtra(EXTRA_VIDEO, video)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        }
    }

    private lateinit var web: WebView
    private lateinit var box: LinearLayout
    /** The call window messenger.com opens (window.open), kept inside the app. */
    private var popup: WebView? = null
    private var pending: PermissionRequest? = null

    private val allowedHosts = listOf("messenger.com", "facebook.com", "fbcdn.net", "fbsbx.com", "facebook.net")

    private fun allowed(host: String) = allowedHosts.any { host == it || host.endsWith(".$it") }

    private val pages = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
            !allowed(request.url.host.orEmpty())

        // messenger.com narrows to the chat list alone on a phone-wide page, and the chat (with
        // its call buttons) only flashes by; lay the page out at desktop width so both show.
        override fun onPageCommitVisible(view: WebView, url: String) = fit(view)
        override fun onPageFinished(view: WebView, url: String) = fit(view)
    }

    /** The chat page gets desktop width; the call window keeps the phone's own width and size. */
    private fun fit(view: WebView) {
        if (view === web) desktopWidth(view)
        if (view === web && video) startVideo(view)
        // TEST: write the call's connection states to the log screen, to see why it drops.
        view.evaluateJavascript(
            """(function(){if(window.__erevosRtc||!window.RTCPeerConnection)return;window.__erevosRtc=1;
            var P=window.RTCPeerConnection;window.RTCPeerConnection=function(a,b){var pc=new P(a,b);
            var say=function(w){console.warn('rtc '+w+' ice='+pc.iceConnectionState+' conn='+pc.connectionState+' sig='+pc.signalingState);};
            say('new');pc.addEventListener('iceconnectionstatechange',function(){say('ice');});
            pc.addEventListener('connectionstatechange',function(){say('conn');});
            pc.addEventListener('icecandidateerror',function(e){console.warn('rtc candidate error '+e.errorCode+' '+e.errorText+' '+e.url);});
            return pc;};window.RTCPeerConnection.prototype=P.prototype;
            Object.setPrototypeOf(window.RTCPeerConnection,P);})();""",
            null,
        )
    }

    /** Asked for a video call: press the chat page's own video call button once it shows. */
    private var video = false
    private var videoAsked = false

    private fun startVideo(view: WebView) {
        if (videoAsked) return
        videoAsked = true
        view.evaluateJavascript(
            """(function(){if(window.__erevosVideo)return;window.__erevosVideo=1;var n=0;
            var t=setInterval(function(){n++;
            var b=Array.prototype.find.call(document.querySelectorAll('[aria-label]'),function(e){
              var l=(e.getAttribute('aria-label')||'').toLowerCase();
              return /video call|βιντεοκλήση|βιντεοκλήσης/.test(l);});
            if(b){clearInterval(t);window.__erevosVideoDone=1;console.warn('video call button pressed');b.click();}
            else if(n>40){clearInterval(t);console.warn('video call button not found');}},500);})();""",
            null,
        )
        // Not found in time (another language, a changed page): say where the button is.
        view.postDelayed({
            view.evaluateJavascript("window.__erevosVideoDone===1") { done ->
                if (done != "true" && !isFinishing) {
                    Toast.makeText(this, "Πάτα την κάμερα πάνω δεξιά για βιντεοκλήση", Toast.LENGTH_LONG).show()
                }
            }
        }, 21_000)
    }

    private fun desktopWidth(view: WebView) {
        view.evaluateJavascript(
            """(function(){var c='width=820';var m=document.querySelector('meta[name=viewport]');
            if(!m){m=document.createElement('meta');m.name='viewport';(document.head||document.documentElement).appendChild(m);}
            if(m.content!==c)m.content=c;})();""",
            null,
        )
    }

    private val chrome: WebChromeClient = object : WebChromeClient() {
        // TEST: the page's warnings and errors go to the log screen («Αρχείο»).
        override fun onConsoleMessage(m: ConsoleMessage): Boolean {
            if (m.messageLevel() == ConsoleMessage.MessageLevel.WARNING ||
                m.messageLevel() == ConsoleMessage.MessageLevel.ERROR
            ) {
                note("call page: " + m.message().take(300))
            }
            return true
        }

        override fun onPermissionRequest(request: PermissionRequest) {
            val wanted = request.resources.filter {
                it == PermissionRequest.RESOURCE_AUDIO_CAPTURE || it == PermissionRequest.RESOURCE_VIDEO_CAPTURE
            }
            if (wanted.isEmpty()) { request.deny(); return }
            runOnUiThread {
                val missing = mediaMissing()
                if (missing.isEmpty()) request.grant(wanted.toTypedArray())
                else { pending = request; requestPermissions(missing, ASK_MEDIA) }
            }
        }

        // The call opens in a new window on messenger.com: show it here, over the chat.
        override fun onCreateWindow(view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: android.os.Message): Boolean {
            closePopup()
            val w = makeWeb()
            popup = w
            box.addView(w, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
            web.visibility = android.view.View.GONE
            (resultMsg.obj as WebView.WebViewTransport).webView = w
            resultMsg.sendToTarget()
            return true
        }

        override fun onCloseWindow(window: WebView) {
            if (window == popup) closePopup()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun makeWeb(): WebView = WebView(this).apply {
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
        // The desktop browser name: on a phone name messenger.com only offers the app.
        settings.userAgentString = Hub.call("userAgent").optString("ok")
        webViewClient = pages
        webChromeClient = chrome
        CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
        looksLikeDesktopChrome(this)
    }

    /**
     * Chrome on the same phone (desktop site) can call, this page could not: besides the name
     * it sends, a web view tells pages it is an «Android WebView» on a phone (the Sec-CH-UA
     * headers and navigator.userAgentData). Tell them the same desktop Chrome as the name.
     */
    private fun looksLikeDesktopChrome(w: WebView) {
        if (WebViewFeature.isFeatureSupported(WebViewFeature.USER_AGENT_METADATA)) {
            fun brand(name: String, major: String, full: String) =
                UserAgentMetadata.BrandVersion.Builder().setBrand(name).setMajorVersion(major).setFullVersion(full).build()
            runCatching {
                WebSettingsCompat.setUserAgentMetadata(
                    w.settings,
                    UserAgentMetadata.Builder()
                        .setBrandVersionList(
                            listOf(
                                brand("Chromium", CHROME, CHROME_FULL),
                                brand("Google Chrome", CHROME, CHROME_FULL),
                                brand("Not-A.Brand", "99", "99.0.0.0"),
                            ),
                        )
                        .setFullVersion(CHROME_FULL)
                        .setPlatform("Linux")
                        .setPlatformVersion("")
                        .setArchitecture("x86")
                        .setModel("")
                        .setMobile(false)
                        .setBitness(64)
                        .build(),
                )
            }.onFailure { note("call page: user agent metadata: $it") }
        }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            runCatching {
                WebViewCompat.addDocumentStartJavaScript(
                    w,
                    """(function(){var b=[{brand:'Chromium',version:'$CHROME'},{brand:'Google Chrome',version:'$CHROME'},{brand:'Not-A.Brand',version:'99'}];
                    var f=[{brand:'Chromium',version:'$CHROME_FULL'},{brand:'Google Chrome',version:'$CHROME_FULL'},{brand:'Not-A.Brand',version:'99.0.0.0'}];
                    var low={brands:b,mobile:false,platform:'Linux'};
                    var high={brands:b,mobile:false,platform:'Linux',architecture:'x86',bitness:'64',model:'',platformVersion:'',uaFullVersion:'$CHROME_FULL',fullVersionList:f,wow64:false,formFactors:['Desktop']};
                    var d={brands:b,mobile:false,platform:'Linux',getHighEntropyValues:function(){return Promise.resolve(high);},toJSON:function(){return low;}};
                    function put(k,v){try{Object.defineProperty(Navigator.prototype,k,{get:function(){return v;},configurable:true});}catch(e){}}
                    put('userAgentData',d);put('platform','Linux x86_64');put('maxTouchPoints',0);})();""",
                    setOf("https://*.messenger.com", "https://*.facebook.com"),
                )
            }.onFailure { note("call page: start script: $it") }
        }
    }

    private fun note(text: String) {
        runCatching { Hub.call("note", JSONObject().put("text", text)) }
    }

    private fun closePopup() {
        val p = popup ?: return
        popup = null
        box.removeView(p)
        p.loadUrl("about:blank")
        p.destroy()
        web.visibility = android.view.View.VISIBLE
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val thread = intent.getLongExtra(EXTRA_THREAD, 0L)
        video = intent.getBooleanExtra(EXTRA_VIDEO, false)

        web = makeWeb()

        val cm = CookieManager.getInstance()
        cm.setAcceptCookie(true)
        cm.setAcceptThirdPartyCookies(web, true)
        val ck = Hub.call("webCookies").optJSONObject("ok")
        if (ck == null) {
            Toast.makeText(this, "Δεν βρέθηκε σύνδεση", Toast.LENGTH_LONG).show()
            finish()
            return
        }
        // facebook.com for every sign-in since Meta moved Messenger there; an older
        // messenger.com sign-in keeps its own site until it fails.
        val host = Hub.call("webHost").optString("ok").ifEmpty { "www.messenger.com" }
        val facebook = host == "www.facebook.com"
        val site = "https://$host"
        val domain = if (facebook) ".facebook.com" else ".messenger.com"
        // The app's sign-in cookies; a browser id (datr) the page was given before stays.
        val had = cm.getCookie(site).orEmpty()
        for (name in ck.keys()) {
            if (name == "datr" && had.contains("datr=")) continue
            val v = ck.optString(name)
            cm.setCookie(site, "$name=$v; Domain=$domain; Path=/; Secure")
        }
        cm.flush()

        val encrypted = intent.getBooleanExtra(EXTRA_ENCRYPTED, false)
        val url = when {
            thread == 0L && facebook -> "$site/messages/"
            thread == 0L -> "$site/"
            facebook && encrypted -> "$site/messages/e2ee/t/$thread"
            facebook -> "$site/messages/t/$thread"
            encrypted -> "$site/e2ee/t/$thread"
            else -> "$site/t/$thread"
        }
        val close = Button(this).apply {
            text = "✕ Κλείσιμο"
            setOnClickListener { finish() }
        }
        // Chrome with «desktop site» calls fine (his test 2026-11-09): a way out if this page cannot.
        val chromeButton = Button(this).apply {
            text = "Στο Chrome"
            setOnClickListener {
                val view = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))
                runCatching { startActivity(Intent(view).setPackage("com.android.chrome")) }
                    .recoverCatching { startActivity(view) }
                    .onFailure { Toast.makeText(this@CallActivity, "Δεν βρέθηκε browser", Toast.LENGTH_LONG).show() }
            }
        }
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            addView(close, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
            addView(chromeButton, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        }
        box = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            fitsSystemWindows = true
            addView(bar, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
            addView(web, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
        }
        setContentView(box)
        if (mediaMissing().isNotEmpty()) requestPermissions(mediaMissing(), ASK_MEDIA)
        web.loadUrl(url)
        Toast.makeText(this, "Πάτα το 📞 ή το 🎥 πάνω δεξιά στη σελίδα", Toast.LENGTH_LONG).show()
    }

    private fun mediaMissing(): Array<String> =
        arrayOf(Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA)
            .filter { checkSelfPermission(it) != PackageManager.PERMISSION_GRANTED }.toTypedArray()

    override fun onRequestPermissionsResult(code: Int, permissions: Array<out String>, results: IntArray) {
        super.onRequestPermissionsResult(code, permissions, results)
        val req = pending ?: return
        pending = null
        val ok = mutableListOf<String>()
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED &&
            PermissionRequest.RESOURCE_AUDIO_CAPTURE in req.resources) ok += PermissionRequest.RESOURCE_AUDIO_CAPTURE
        if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED &&
            PermissionRequest.RESOURCE_VIDEO_CAPTURE in req.resources) ok += PermissionRequest.RESOURCE_VIDEO_CAPTURE
        if (ok.isEmpty()) req.deny() else req.grant(ok.toTypedArray())
    }

    @Deprecated("Back closes the call window")
    override fun onBackPressed() {
        val p = popup
        when {
            p != null && p.canGoBack() -> p.goBack()
            p != null -> closePopup()
            web.canGoBack() -> web.goBack()
            else -> super.onBackPressed()
        }
    }

    override fun onDestroy() {
        closePopup()
        if (::web.isInitialized) {
            web.loadUrl("about:blank")
            web.destroy()
        }
        // The page keeps its cookies (only inside this app), so Facebook sees the same
        // browser every time and asks its check at most once.
        CookieManager.getInstance().flush()
        super.onDestroy()
    }
}
