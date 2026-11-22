// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import android.graphics.Color
import android.util.Log
import android.view.View
import android.webkit.WebView
import com.airbnb.lottie.LottieAnimationView
import com.airbnb.lottie.LottieCompositionFactory
import com.airbnb.lottie.LottieDrawable
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import java.io.File
import java.io.FileInputStream
import java.util.zip.GZIPInputStream

/**
 * A Telegram sticker that moves (components/telegram-bubble.tsx), from its file once Telegram has
 * downloaded it: `path`. A .tgs sticker is a Lottie animation, gzipped, played by Lottie; a .webm
 * one is a VP9 video with see-through parts, which only Chromium's player draws as it is meant, so
 * it plays muted in a WebView of its own, with no JavaScript and nothing but that file to read.
 * Which one it is is told by the file's first bytes. Both go round and round while they show.
 */
class TelegramStickerView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private var path = ""
  private var child: View? = null

  fun setPath(value: String) {
    if (value == path) return
    path = value
    show()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    val c = child ?: return
    val w = r - l
    val h = b - t
    c.measure(MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY), MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY))
    c.layout(0, 0, w, h)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (child == null) show()
  }

  override fun onDetachedFromWindow() {
    clear()
    super.onDetachedFromWindow()
  }

  private fun clear() {
    val c = child ?: return
    child = null
    removeView(c)
    when (c) {
      is LottieAnimationView -> runCatching { c.cancelAnimation() }
      is WebView -> runCatching { c.destroy() }
    }
  }

  private fun show() {
    clear()
    if (path.isEmpty() || !isAttachedToWindow) return
    val file = File(path.removePrefix("file://"))
    val head = runCatching { FileInputStream(file).use { s -> ByteArray(2).also { if (s.read(it) != 2) return } } }.getOrNull() ?: return
    val gzip = head[0] == 0x1f.toByte() && head[1] == 0x8b.toByte()
    val view = if (gzip) LottieAnimationView(context) else video(file)
    child = view
    addView(view)
    place(view)
    // Only now that it is the child: a sticker already read once comes back at once, before this returns.
    if (view is LottieAnimationView) lottie(view, file)
  }

  /**
   * React Native lays this view out, not Android: a child added after that (once the file has
   * come) gets no size of its own and stays unseen, so it is given this view's size here.
   */
  private fun place(c: View) {
    val w = width
    val h = height
    if (w <= 0 || h <= 0) return
    c.measure(MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY), MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY))
    c.layout(0, 0, w, h)
  }

  private fun lottie(view: LottieAnimationView, file: File) {
    view.repeatCount = LottieDrawable.INFINITE
    val shown = path
    LottieCompositionFactory.fromJsonInputStream(GZIPInputStream(FileInputStream(file)), "tgs:$shown")
      .addListener { composition ->
        if (child !== view || path != shown) return@addListener
        view.setComposition(composition)
        view.playAnimation()
      }
      .addFailureListener { Log.w("ErevosTelegram", "sticker: ${it.message}") }
  }

  private fun video(file: File): View {
    val view = WebView(context)
    view.setBackgroundColor(Color.TRANSPARENT)
    view.isVerticalScrollBarEnabled = false
    view.isHorizontalScrollBarEnabled = false
    // Taps go to the bubble under it, which has the message's menu.
    view.isClickable = false
    view.isLongClickable = false
    view.isFocusable = false
    view.settings.apply {
      javaScriptEnabled = false
      allowFileAccess = true
      allowContentAccess = false
      mediaPlaybackRequiresUserGesture = false
      blockNetworkLoads = true
    }
    val src = android.net.Uri.fromFile(file).toString().replace("\"", "%22")
    val html = "<!doctype html><html><body style=\"margin:0;background:transparent;overflow:hidden\">" +
      "<video src=\"$src\" autoplay loop muted playsinline style=\"width:100vw;height:100vh;object-fit:contain\"></video></body></html>"
    view.loadDataWithBaseURL("file:///", html, "text/html", "utf-8", null)
    return view
  }
}
