// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.SurfaceTexture
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Handler
import android.telecom.Call
import android.telecom.InCallService
import android.telecom.VideoProfile
import android.view.Gravity
import android.view.Surface
import android.view.TextureView
import android.view.View
import android.widget.FrameLayout

/**
 * The picture of a phone company's video call (ViLTE), when the SIM and the network carry one:
 * the other side full screen, this phone's camera small in a corner, through Telecom's VideoCall,
 * which draws them itself. Built in code, under the call screen's words and buttons. `asked` hears
 * the other side asking to turn video on during a call, to answer it.
 */
internal class CallVideo(
  private val context: Context,
  private val main: Handler,
  private val dp: (Int) -> Int,
  private val asked: (Call, VideoProfile) -> Unit,
) {
  val layer = FrameLayout(context).apply { visibility = View.GONE }
  private val remote = TextureView(context)
  private val preview = TextureView(context)
  private var remoteSurface: Surface? = null
  private var previewSurface: Surface? = null
  // The call whose VideoCall is watched, and whether its picture shows.
  private var watched: Call? = null
  private var watchedVideo: InCallService.VideoCall? = null
  private var callback: InCallService.VideoCall.Callback? = null
  private var showing = false
  private var front = true

  init {
    layer.addView(remote, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
    layer.addView(
      preview,
      FrameLayout.LayoutParams(dp(96), dp(128), Gravity.TOP or Gravity.END).apply {
        topMargin = dp(48)
        marginEnd = dp(16)
      },
    )
    remote.surfaceTextureListener = listener({ remoteSurface = it; if (showing) watchedVideo?.setDisplaySurface(it) }, {
      if (showing) runCatching { watchedVideo?.setDisplaySurface(null) }
      remoteSurface = null
    })
    preview.surfaceTextureListener = listener({ previewSurface = it; if (showing) watchedVideo?.setPreviewSurface(it) }, {
      if (showing) runCatching { watchedVideo?.setPreviewSurface(null) }
      previewSurface = null
    })
  }

  private fun listener(made: (Surface) -> Unit, gone: () -> Unit) =
    object : TextureView.SurfaceTextureListener {
      override fun onSurfaceTextureAvailable(texture: SurfaceTexture, width: Int, height: Int) = made(Surface(texture))
      override fun onSurfaceTextureSizeChanged(texture: SurfaceTexture, width: Int, height: Int) {}
      override fun onSurfaceTextureUpdated(texture: SurfaceTexture) {}
      override fun onSurfaceTextureDestroyed(texture: SurfaceTexture): Boolean {
        gone()
        return true
      }
    }

  /** Whether `call` goes with video now, both ways or one. */
  fun isVideo(call: Call): Boolean = VideoProfile.isVideo(call.details.videoState)

  /** Whether the call can turn video on: this phone and the other side's network can. */
  fun canVideo(call: Call): Boolean =
    call.videoCall != null &&
      call.details.can(Call.Details.CAPABILITY_SUPPORTS_VT_LOCAL_BIDIRECTIONAL) &&
      call.details.can(Call.Details.CAPABILITY_SUPPORTS_VT_REMOTE_BIDIRECTIONAL)

  fun mayUseCamera(): Boolean = context.checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED

  /** Watches the call that shows (null for none), and shows its picture when it goes with video. */
  fun follow(call: Call?, show: Boolean) {
    val video = call?.videoCall
    if (call !== watched || video !== watchedVideo) {
      stop()
      if (call != null && video != null) {
        val heard = object : InCallService.VideoCall.Callback() {
          override fun onSessionModifyRequestReceived(videoProfile: VideoProfile) {
            main.post { asked(call, videoProfile) }
          }
          override fun onSessionModifyResponseReceived(status: Int, requestedProfile: VideoProfile?, responseProfile: VideoProfile?) {
            main.post { Calls.changed() }
          }
          override fun onCallSessionEvent(event: Int) {}
          override fun onPeerDimensionsChanged(width: Int, height: Int) {}
          override fun onVideoQualityChanged(videoQuality: Int) {}
          override fun onCallDataUsageChanged(dataUsage: Long) {}
          override fun onCameraCapabilitiesChanged(cameraCapabilities: VideoProfile.CameraCapabilities) {}
        }
        runCatching { video.registerCallback(heard, main) }
        callback = heard
        watched = call
        watchedVideo = video
      }
    }
    val on = show && watchedVideo != null
    if (on == showing) return
    showing = on
    layer.visibility = if (on) View.VISIBLE else View.GONE
    val v = watchedVideo ?: return
    if (on) {
      runCatching { v.setCamera(if (mayUseCamera()) camera(front) else null) }
      remoteSurface?.let { runCatching { v.setDisplaySurface(it) } }
      previewSurface?.let { runCatching { v.setPreviewSurface(it) } }
    } else {
      release(v)
    }
  }

  /** The front camera, or the back one. */
  fun switchCamera() {
    front = !front
    if (showing && mayUseCamera()) runCatching { watchedVideo?.setCamera(camera(front)) }
  }

  /** Asks the network to turn video on, or off, in the call. */
  fun ask(call: Call, on: Boolean) {
    val state = if (on) VideoProfile.STATE_BIDIRECTIONAL else VideoProfile.STATE_AUDIO_ONLY
    runCatching { call.videoCall?.sendSessionModifyRequest(VideoProfile(state)) }
  }

  /** Answers the other side's asking to turn video on: with it, or keeping the call to sound. */
  fun answer(call: Call, asked: VideoProfile, yes: Boolean) {
    val state = if (yes && mayUseCamera()) asked.videoState else VideoProfile.STATE_AUDIO_ONLY
    runCatching { call.videoCall?.sendSessionModifyResponse(VideoProfile(state)) }
  }

  private fun release(v: InCallService.VideoCall) {
    runCatching { v.setCamera(null) }
    runCatching { v.setPreviewSurface(null) }
    runCatching { v.setDisplaySurface(null) }
  }

  /** Lets go of the call's picture and stops watching it: the call ended, or the screen closes. */
  fun stop() {
    watchedVideo?.let { v ->
      if (showing) release(v)
      callback?.let { runCatching { v.unregisterCallback(it) } }
    }
    callback = null
    watched = null
    watchedVideo = null
    showing = false
    layer.visibility = View.GONE
  }

  private fun camera(front: Boolean): String? {
    val cameras = context.getSystemService(CameraManager::class.java) ?: return null
    val want = if (front) CameraCharacteristics.LENS_FACING_FRONT else CameraCharacteristics.LENS_FACING_BACK
    return runCatching {
      cameras.cameraIdList.firstOrNull { cameras.getCameraCharacteristics(it).get(CameraCharacteristics.LENS_FACING) == want } ?: cameras.cameraIdList.firstOrNull()
    }.getOrNull()
  }
}
