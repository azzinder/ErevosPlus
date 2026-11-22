// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import android.graphics.SurfaceTexture
import android.media.MediaPlayer
import android.net.Uri
import android.util.Log
import android.view.Surface
import android.view.TextureView
import android.view.View
import android.widget.MediaController
import android.widget.VideoView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import java.io.File

/**
 * A Telegram video or GIF from its downloaded file (`path`), in components/telegram-media.tsx.
 * Without `controls` it plays in the bubble as Telegram's GIFs do: muted, round and round, drawn
 * on a TextureView so that it scrolls with the messages. With them it is a video on the whole
 * screen, with sound and Android's own play, pause and seek bar, started at once.
 */
class TelegramMediaView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private var path = ""
  private var controls = false
  private var child: View? = null
  private var player: MediaPlayer? = null
  private var surface: Surface? = null

  fun setPath(value: String) {
    if (value == path) return
    path = value
    show()
  }

  fun setControls(value: Boolean) {
    if (value == controls) return
    controls = value
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
    player?.let { runCatching { it.release() } }
    player = null
    surface?.let { runCatching { it.release() } }
    surface = null
    val c = child ?: return
    child = null
    if (c is VideoView) runCatching { c.stopPlayback() }
    removeView(c)
  }

  private fun show() {
    clear()
    if (path.isEmpty() || !isAttachedToWindow) return
    val file = File(path.removePrefix("file://"))
    if (!file.isFile) return
    val view = if (controls) full(file) else looping(file)
    child = view
    addView(view)
    place(view)
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

  private fun full(file: File): View {
    val view = VideoView(context)
    val bar = MediaController(context)
    bar.setAnchorView(view)
    view.setMediaController(bar)
    view.setOnPreparedListener { view.start(); bar.show(3000) }
    view.setOnErrorListener { _, what, extra ->
      Log.w("ErevosTelegram", "video: $what/$extra")
      false
    }
    view.setVideoURI(Uri.fromFile(file))
    return view
  }

  private fun looping(file: File): View {
    val view = TextureView(context)
    // Taps go to the bubble under it, which has the message's menu.
    view.isClickable = false
    view.isLongClickable = false
    view.isFocusable = false
    val shown = path
    view.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
      override fun onSurfaceTextureAvailable(texture: SurfaceTexture, width: Int, height: Int) {
        if (child !== view || path != shown) return
        val s = Surface(texture)
        surface = s
        val p = MediaPlayer()
        player = p
        runCatching {
          p.setDataSource(file.path)
          p.setSurface(s)
          p.setVolume(0f, 0f)
          p.isLooping = true
          p.setOnPreparedListener { if (player === it) it.start() }
          p.setOnErrorListener { _, what, extra ->
            Log.w("ErevosTelegram", "gif: $what/$extra")
            true
          }
          p.prepareAsync()
        }.onFailure { Log.w("ErevosTelegram", "gif: ${it.message}") }
      }

      override fun onSurfaceTextureSizeChanged(texture: SurfaceTexture, width: Int, height: Int) = Unit

      override fun onSurfaceTextureDestroyed(texture: SurfaceTexture): Boolean {
        if (child === view) {
          player?.let { runCatching { it.release() } }
          player = null
          surface?.let { runCatching { it.release() } }
          surface = null
        }
        return true
      }

      override fun onSurfaceTextureUpdated(texture: SurfaceTexture) = Unit
    }
    return view
  }
}
