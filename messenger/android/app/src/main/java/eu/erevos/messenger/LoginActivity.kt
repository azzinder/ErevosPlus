// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.annotation.SuppressLint
import android.app.Activity
import android.content.res.Configuration
import android.graphics.Color
import android.os.Bundle
import android.widget.FrameLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import android.webkit.CookieManager
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import org.json.JSONObject

/**
 * The user signs in to facebook.com here, by themselves. We only read the
 * session cookies afterwards; the password never reaches our code.
 */
class LoginActivity : Activity() {
    companion object {
        /** Opened from Settings to add Messenger: stays open even with Signal or Session on the phone. */
        const val ON_PURPOSE = "onPurpose"
    }

    private lateinit var web: WebView
    private var done = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        // The page is facebook.com's desktop one (same identity as the engine);
        // Meta sends messenger.com to facebook.com/messages now.
        // Lay it out at phone width instead of shrinking a desktop page, and
        // let the user pinch to zoom.
        web.settings.useWideViewPort = false
        web.settings.loadWithOverviewMode = false
        web.settings.setSupportZoom(true)
        web.settings.builtInZoomControls = true
        web.settings.displayZoomControls = false
        web.settings.textZoom = 115
        // Same browser identity as the engine, so Meta sees one device.
        web.settings.userAgentString = Hub.call("userAgent").optString("ok")
        CookieManager.getInstance().setAcceptCookie(true)
        web.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                check()
            }
        }
        // Edge to edge is forced on Android 15: keep the page clear of the bars and the keyboard.
        val night = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
            Configuration.UI_MODE_NIGHT_YES
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = !night
            isAppearanceLightNavigationBars = !night
        }
        val frame = FrameLayout(this)
        frame.setBackgroundColor(if (night) Color.BLACK else Color.WHITE)
        frame.addView(web, FrameLayout.LayoutParams(-1, -1))
        // Signal or Session alone, without a Messenger account.
        val other = android.widget.Button(this).apply {
            text = "Χωρίς Messenger: Signal ή Session"
            isAllCaps = false
            setOnClickListener {
                android.app.AlertDialog.Builder(this@LoginActivity)
                    .setTitle("Άλλο δίκτυο")
                    .setItems(arrayOf("Signal", "Session")) { _, which ->
                        if (which == 0) eu.erevos.messenger.signal.SignalActivity.open(this@LoginActivity)
                        else eu.erevos.messenger.session.SessionActivity.open(this@LoginActivity)
                    }
                    .setNegativeButton("Άκυρο", null)
                    .show()
            }
        }
        if (intent.getBooleanExtra(ON_PURPOSE, false)) other.visibility = android.view.View.GONE
        frame.addView(other, FrameLayout.LayoutParams(-2, -2, android.view.Gravity.BOTTOM or android.view.Gravity.CENTER_HORIZONTAL).apply { bottomMargin = 24 })
        ViewCompat.setOnApplyWindowInsetsListener(frame) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }
        setContentView(frame)
        web.loadUrl("https://www.facebook.com/")
    }

    private fun check() {
        if (done) return
        val raw = CookieManager.getInstance().getCookie("https://www.facebook.com") ?: return
        val jar = JSONObject()
        raw.split(";").forEach {
            val i = it.indexOf('=')
            if (i > 0) jar.put(it.substring(0, i).trim(), it.substring(i + 1).trim())
        }
        if (!jar.has("c_user") || !jar.has("xs") || !jar.has("datr")) return
        done = true
        val r = Hub.call("login", JSONObject().put("cookies", jar))
        if (r.has("error")) {
            done = false
            Toast.makeText(this, r.getString("error"), Toast.LENGTH_LONG).show()
            return
        }
        // The engine owns the session now; the web view must not keep a copy.
        web.stopLoading()
        CookieManager.getInstance().removeAllCookies(null)
        CookieManager.getInstance().flush()
        finish()
    }

    override fun onResume() {
        super.onResume()
        // Back from adding Signal or Session: the app can open with that account.
        if (intent.getBooleanExtra(ON_PURPOSE, false)) return
        if (eu.erevos.messenger.signal.Signal.hasAccount() || eu.erevos.messenger.session.Session.hasAccount()) finish()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }
}
