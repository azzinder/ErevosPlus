// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import android.util.Log
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import java.nio.ByteBuffer
import org.webrtc.Camera1Enumerator
import org.webrtc.Camera2Enumerator
import org.webrtc.CameraEnumerator
import org.webrtc.CameraVideoCapturer
import org.webrtc.CapturerObserver
import org.webrtc.EglBase
import org.webrtc.JavaI420Buffer
import org.webrtc.PeerConnectionFactory
import org.webrtc.RendererCommon
import org.webrtc.SurfaceTextureHelper
import org.webrtc.SurfaceViewRenderer
import org.webrtc.VideoFrame
import org.webrtc.VideoSink

/**
 * The pictures of a Telegram video call, on the app's side of the two rooms (Calls.kt). The camera
 * and the drawing use the app's own WebRTC (org.jitsi:webrtc, which react-native-webrtc brings), not
 * NTgCalls's: what crosses to the call is only plain I420 bytes with their size and turn, each way.
 * This phone's camera is shown small and handed to the call; the other phone's pictures come back
 * from the call and are drawn in TelegramVideoView. The camera permission must be given.
 */
internal object CallVideo {
  private const val TAG = "ErevosTelegram"
  // 480p: each picture is copied to cross to the call, and a phone kept cooler sends it smoothly.
  private const val WIDTH = 640
  private const val HEIGHT = 480
  private const val FPS = 30

  /** One GL context for the camera and both pictures. */
  val egl: EglBase by lazy { EglBase.create() }

  @Volatile var local: VideoSink? = null
  @Volatile var remote: VideoSink? = null

  private var capturer: CameraVideoCapturer? = null
  private var helper: SurfaceTextureHelper? = null
  @Volatile var front = true
    private set

  @Volatile private var loaded = false

  /** The app's WebRTC native library, loaded once (react-native-webrtc may not have yet): its frames and drawing need it. */
  fun load(context: Context) {
    if (loaded) return
    synchronized(this) {
      if (loaded) return
      PeerConnectionFactory.initialize(PeerConnectionFactory.InitializationOptions.builder(context.applicationContext).createInitializationOptions())
      loaded = true
    }
  }

  private fun enumerator(context: Context): CameraEnumerator =
    if (Camera2Enumerator.isSupported(context)) Camera2Enumerator(context) else Camera1Enumerator()

  private fun pick(e: CameraEnumerator, front: Boolean): String? =
    e.deviceNames.firstOrNull { if (front) e.isFrontFacing(it) else e.isBackFacing(it) } ?: e.deviceNames.firstOrNull()

  /** Starts the camera; `send` gets every picture as I420 bytes, width, height, turn (degrees) and time (ms). */
  @Synchronized
  fun start(context: Context, send: (ByteArray, Int, Int, Int, Long) -> Unit) {
    if (capturer != null) return
    val app = context.applicationContext
    runCatching {
      load(app)
      val e = enumerator(app)
      val name = pick(e, front) ?: return
      val c = e.createCapturer(name, null) ?: return
      val h = SurfaceTextureHelper.create("TelegramCamera", egl.eglBaseContext)
      c.initialize(h, app, object : CapturerObserver {
        override fun onCapturerStarted(success: Boolean) {}
        override fun onCapturerStopped() {}
        override fun onFrameCaptured(frame: VideoFrame) {
          local?.onFrame(frame)
          val i420 = frame.buffer.toI420() ?: return
          try {
            send(pack(i420), i420.width, i420.height, frame.rotation, frame.timestampNs / 1_000_000)
          } finally {
            i420.release()
          }
        }
      })
      c.startCapture(WIDTH, HEIGHT, FPS)
      capturer = c
      helper = h
    }.onFailure { Log.e(TAG, "camera", it) }
  }

  @Synchronized
  fun switchCamera() {
    val c = capturer ?: return
    front = !front
    runCatching { c.switchCamera(null) }
    // The own picture is mirrored for the front camera only, as a mirror would show it.
    (local as? SurfaceViewRenderer)?.setMirror(front)
  }

  @Synchronized
  fun stop() {
    val c = capturer
    capturer = null
    runCatching { c?.stopCapture() }
    runCatching { c?.dispose() }
    runCatching { helper?.dispose() }
    helper = null
  }

  /** At the end of a call: the camera off, and the front one for the next. */
  fun reset() {
    stop()
    front = true
    (local as? SurfaceViewRenderer)?.setMirror(true)
  }

  /** A picture of the other phone, I420 planes one after another, to draw. */
  fun showRemote(data: ByteArray, w: Int, h: Int, rotation: Int) {
    val sink = remote ?: return
    if (w <= 0 || h <= 0) return
    val cw = (w + 1) / 2
    val ch = (h + 1) / 2
    val ySize = w * h
    val uvSize = cw * ch
    if (data.size < ySize + 2 * uvSize) return
    val y = ByteBuffer.allocateDirect(ySize).put(data, 0, ySize).also { it.flip() }
    val u = ByteBuffer.allocateDirect(uvSize).put(data, ySize, uvSize).also { it.flip() }
    val v = ByteBuffer.allocateDirect(uvSize).put(data, ySize + uvSize, uvSize).also { it.flip() }
    val frame = VideoFrame(JavaI420Buffer.wrap(w, h, y, w, u, cw, v, cw, null), rotation, System.nanoTime())
    try {
      sink.onFrame(frame)
    } finally {
      frame.release()
    }
  }

  /** I420 planes without their row padding, one after another. */
  private fun pack(b: VideoFrame.I420Buffer): ByteArray {
    val w = b.width
    val h = b.height
    val cw = (w + 1) / 2
    val ch = (h + 1) / 2
    val out = ByteArray(w * h + 2 * cw * ch)
    var at = 0
    at = copyPlane(b.dataY, b.strideY, w, h, out, at)
    at = copyPlane(b.dataU, b.strideU, cw, ch, out, at)
    copyPlane(b.dataV, b.strideV, cw, ch, out, at)
    return out
  }

  private fun copyPlane(src: ByteBuffer, stride: Int, width: Int, height: Int, out: ByteArray, start: Int): Int {
    val plane = src.duplicate()
    var at = start
    for (row in 0 until height) {
      plane.position(row * stride)
      plane.get(out, at, width)
      at += width
    }
    return at
  }
}

/**
 * Where a Telegram video call is drawn (components/telegram-call.tsx): `side` "remote" is the other
 * phone's picture, "local" this phone's camera, mirrored for the front one.
 */
class TelegramVideoView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val renderer = SurfaceViewRenderer(context)
  private var side = ""
  private var ready = false

  init {
    addView(renderer)
  }

  fun setSide(value: String) {
    if (value == side) return
    detach()
    side = value
    attach()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    renderer.layout(0, 0, r - l, b - t)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    attach()
  }

  override fun onDetachedFromWindow() {
    detach()
    super.onDetachedFromWindow()
  }

  private fun attach() {
    if (side.isEmpty() || !isAttachedToWindow) return
    if (!ready) {
      runCatching {
        CallVideo.load(context)
        renderer.init(CallVideo.egl.eglBaseContext, null)
        renderer.setScalingType(if (side == "local") RendererCommon.ScalingType.SCALE_ASPECT_FILL else RendererCommon.ScalingType.SCALE_ASPECT_FIT)
        renderer.setEnableHardwareScaler(true)
        ready = true
      }.onFailure { Log.w("ErevosTelegram", "video view: ${it.message}") }
    }
    if (!ready) return
    if (side == "local") {
      renderer.setMirror(CallVideo.front)
      renderer.setZOrderMediaOverlay(true)
      CallVideo.local = renderer
    } else {
      CallVideo.remote = renderer
    }
  }

  private fun detach() {
    if (CallVideo.local === renderer) CallVideo.local = null
    if (CallVideo.remote === renderer) CallVideo.remote = null
    if (ready) {
      runCatching { renderer.release() }
      ready = false
    }
  }
}
