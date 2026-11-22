// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscollection

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.media.MediaActionSound
import android.net.Uri
import android.view.OrientationEventListener
import android.view.Surface
import android.view.ViewGroup
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.CameraState
import androidx.camera.core.DynamicRange
import androidx.camera.core.FocusMeteringAction
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.core.UseCaseGroup
import androidx.camera.core.resolutionselector.AspectRatioStrategy
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.extensions.ExtensionMode
import androidx.camera.extensions.ExtensionsManager
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.FallbackStrategy
import androidx.camera.video.FileOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.Promise
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.io.File
import java.util.UUID
import java.util.concurrent.TimeUnit

/**
 * Erevos's own camera (components/erevos-camera.tsx), with Android's CameraX: what the lens sees,
 * a photo taken into memory, a video recorded, and what the phone's maker offers through CameraX
 * Extensions where this phone has them: night, HDR, portrait (bokeh) and auto. The Extensions are
 * the phone's own: they run on the phone, from its system, and nothing of them is in Erevos.
 *
 * A photo never touches the storage: it comes as JPEG bytes into memory, is drawn anew with
 * nothing but its picture (CleanPhoto.kt), and those bytes go to JavaScript, which encrypts them
 * into the Collection. A video is recorded into the app's cache, in its folder "Camera" (an MP4
 * needs a file to be written), which JavaScript encrypts and deletes at once; a video that fails is deleted here.
 *
 * The picture is drawn on a TextureView, inside the window, so the Collection's FLAG_SECURE keeps
 * it out of screenshots too.
 */
@SuppressLint("ViewConstructor")
class CameraPreview(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  override val shouldUseAndroidLayout = true

  private val main = ContextCompat.getMainExecutor(context)
  private val owner: LifecycleOwner?
    get() = appContext.currentActivity as? LifecycleOwner

  private val preview = PreviewView(context).apply {
    implementationMode = PreviewView.ImplementationMode.COMPATIBLE
    scaleType = PreviewView.ScaleType.FIT_CENTER
  }

  private val onReady by EventDispatcher()
  private val onFail by EventDispatcher()
  private val onProcessing by EventDispatcher()

  /** "back" or "front". */
  var facing = "back"
    set(value) {
      if (field != value) dirty = true
      field = value
    }

  /** "photo" or "video". */
  var mode = "photo"
    set(value) {
      if (field != value) dirty = true
      field = value
    }

  /** A photo's Extension: "none", "night", "hdr", "bokeh" or "auto"; "none" where the phone has not that one. */
  var effect = "none"
    set(value) {
      if (field != value) dirty = true
      field = value
    }

  /** A video's quality: "720p", "1080p" or "2160p", or the nearest the phone has. */
  var quality = "1080p"
    set(value) {
      if (field != value) dirty = true
      field = value
    }

  /** A video in HDR (HLG, 10-bit), where the phone records it. */
  var hdrVideo = false
    set(value) {
      if (field != value) dirty = true
      field = value
    }

  /** A photo's flash: "off", "on" or "auto". */
  var flash = "off"
    set(value) {
      field = value
      imageCapture?.flashMode = flashMode()
    }

  /** The light, while a video is filmed. */
  var torch = false
    set(value) {
      field = value
      applyTorch()
    }

  /** The zoom, as a ratio: 1 as the main lens sees, below 1 the wide lens where there is one. */
  var zoom = 1f
    set(value) {
      field = value
      applyZoom()
    }

  private var dirty = true
  private var starting = false
  private var gone = false
  private var told = false

  private var provider: ProcessCameraProvider? = null
  private var extensions: ExtensionsManager? = null
  private var camera: Camera? = null
  private var imageCapture: ImageCapture? = null
  private var videoCapture: VideoCapture<Recorder>? = null
  private var recording: Recording? = null
  private val sound by lazy { MediaActionSound() }

  // The phone turned: a photo and a video come out as it is held.
  private val turned = object : OrientationEventListener(context) {
    override fun onOrientationChanged(orientation: Int) {
      if (orientation == ORIENTATION_UNKNOWN) return
      val rotation = when (orientation) {
        in 45 until 135 -> Surface.ROTATION_270
        in 135 until 225 -> Surface.ROTATION_180
        in 225 until 315 -> Surface.ROTATION_90
        else -> Surface.ROTATION_0
      }
      imageCapture?.targetRotation = rotation
      videoCapture?.targetRotation = rotation
    }
  }

  init {
    addView(preview, LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (turned.canDetectOrientation()) turned.enable()
  }

  override fun onDetachedFromWindow() {
    turned.disable()
    super.onDetachedFromWindow()
  }

  /** The props changed: the camera is bound again if what it is bound with changed, never while it records. */
  fun update() {
    if (gone || !dirty || recording != null) return
    val p = provider
    if (p == null) {
      start()
      return
    }
    dirty = false
    try {
      bind(p)
    } catch (e: Throwable) {
      dirty = true
      fail("open", e.message ?: "The camera could not be opened. Another app may be using it.")
    }
  }

  // CameraX, and the Extensions of this phone (none, if it has none or they fail).
  private fun start() {
    if (starting) return
    starting = true
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener({
      val p = try {
        future.get()
      } catch (e: Throwable) {
        starting = false
        fail("open", e.message ?: "The camera could not be opened")
        return@addListener
      }
      val asked = ExtensionsManager.getInstanceAsync(context, p)
      asked.addListener({
        extensions = runCatching { asked.get() }.getOrNull()
        provider = p
        update()
      }, main)
    }, main)
  }

  private fun bind(p: ProcessCameraProvider) {
    val owner = owner ?: throw IllegalStateException("No screen to show the camera on")
    val base = if (facing == "front") CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA
    val effects = effectsOf(base)
    val photo = mode == "photo"
    val wanted = if (photo) EFFECTS[effect] else null
    val ext = extensions
    val selector = if (wanted != null && ext != null && effects.contains(effect)) ext.getExtensionEnabledCameraSelector(base, wanted) else base

    val ratio = if (photo) AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY else AspectRatioStrategy.RATIO_16_9_FALLBACK_AUTO_STRATEGY
    val shown = Preview.Builder()
      .setResolutionSelector(ResolutionSelector.Builder().setAspectRatioStrategy(ratio).build())
      .build()
    shown.surfaceProvider = preview.surfaceProvider
    val cases = UseCaseGroup.Builder().addUseCase(shown)

    var hdrSupported = false
    if (photo) {
      val capture = ImageCapture.Builder()
        .setResolutionSelector(
          ResolutionSelector.Builder()
            .setAspectRatioStrategy(ratio)
            .setResolutionStrategy(ResolutionStrategy.HIGHEST_AVAILABLE_STRATEGY)
            .build(),
        )
        .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
        .setFlashMode(flashMode())
        .build()
      imageCapture = capture
      videoCapture = null
      cases.addUseCase(capture)
    } else {
      val info = selector.filter(p.availableCameraInfos).firstOrNull()
      val capabilities = info?.let { Recorder.getVideoCapabilities(it) }
      hdrSupported = capabilities?.supportedDynamicRanges?.contains(DynamicRange.HLG_10_BIT) == true
      val wantedQuality = QUALITIES[quality] ?: Quality.FHD
      val recorder = Recorder.Builder()
        .setExecutor(main)
        .setQualitySelector(QualitySelector.from(wantedQuality, FallbackStrategy.lowerQualityOrHigherThan(wantedQuality)))
        .build()
      val capture = VideoCapture.Builder(recorder).apply {
        if (hdrVideo && hdrSupported) setDynamicRange(DynamicRange.HLG_10_BIT)
        if (capabilities?.isStabilizationSupported == true) setVideoStabilizationEnabled(true)
      }.build()
      videoCapture = capture
      imageCapture = null
      cases.addUseCase(capture)
    }

    camera?.cameraInfo?.cameraState?.removeObservers(owner)
    p.unbindAll()
    val cam = p.bindToLifecycle(owner, selector, cases.build())
    camera = cam
    told = false
    applyZoom()
    applyTorch()
    val front = runCatching { p.hasCamera(CameraSelector.DEFAULT_FRONT_CAMERA) }.getOrDefault(false)
    cam.cameraInfo.cameraState.observe(owner) { state ->
      if (state.type == CameraState.Type.OPEN && !told) {
        told = true
        tellReady(cam, effects, hdrSupported, front)
      }
      state.error?.let { error ->
        if (state.type == CameraState.Type.CLOSED || error.type == CameraState.ErrorType.CRITICAL) {
          fail("stopped", "The camera stopped. Another app may be using it.")
        }
      }
    }
  }

  // What this camera can do, for the buttons JavaScript shows.
  private fun tellReady(cam: Camera, effects: List<String>, hdrSupported: Boolean, front: Boolean) {
    val zoomState = cam.cameraInfo.zoomState.value
    val exposure = cam.cameraInfo.exposureState
    val range = exposure.exposureCompensationRange
    onReady(
      mapOf(
        "effects" to effects,
        "minZoom" to (zoomState?.minZoomRatio ?: 1f).toDouble(),
        "maxZoom" to (zoomState?.maxZoomRatio ?: 1f).toDouble(),
        "exposure" to exposure.isExposureCompensationSupported,
        "exposureMin" to range.lower,
        "exposureMax" to range.upper,
        "exposureStep" to exposure.exposureCompensationStep.toDouble(),
        "hdrVideo" to hdrSupported,
        "flash" to cam.cameraInfo.hasFlashUnit(),
        "front" to front,
      ),
    )
  }

  // The Extensions this camera has, by their names.
  private fun effectsOf(base: CameraSelector): List<String> {
    val ext = extensions ?: return emptyList()
    return EFFECTS.filter { (_, value) -> runCatching { ext.isExtensionAvailable(base, value) }.getOrDefault(false) }.keys.toList()
  }

  private fun flashMode() = when (flash) {
    "on" -> ImageCapture.FLASH_MODE_ON
    "auto" -> ImageCapture.FLASH_MODE_AUTO
    else -> ImageCapture.FLASH_MODE_OFF
  }

  private fun applyZoom() {
    val cam = camera ?: return
    val state = cam.cameraInfo.zoomState.value
    val ratio = if (state == null) zoom else zoom.coerceIn(state.minZoomRatio, state.maxZoomRatio)
    cam.cameraControl.setZoomRatio(ratio)
  }

  private fun applyTorch() {
    val cam = camera ?: return
    if (!cam.cameraInfo.hasFlashUnit()) return
    cam.cameraControl.enableTorch(torch && mode == "video")
  }

  // What went wrong: `kind` ("open" or "stopped") for the words JavaScript shows in the owner's
  // language (components/erevos-camera.tsx cameraTrouble), `message` in English, for no one but a log.
  private fun fail(kind: String, message: String) {
    runCatching { onFail(mapOf("kind" to kind, "message" to message)) }
  }

  /** Focuses and meters at a point of the view, in points as JavaScript has them; false where this camera cannot. */
  fun focusAt(x: Double, y: Double): Boolean {
    val cam = camera ?: return false
    val density = resources.displayMetrics.density
    val point = preview.meteringPointFactory.createPoint((x * density).toFloat(), (y * density).toFloat())
    val action = FocusMeteringAction.Builder(point, FocusMeteringAction.FLAG_AF or FocusMeteringAction.FLAG_AE)
      .setAutoCancelDuration(5, TimeUnit.SECONDS)
      .build()
    if (!cam.cameraInfo.isFocusMeteringSupported(action)) return false
    cam.cameraControl.startFocusAndMetering(action)
    return true
  }

  /** Brighter or darker, by steps of exposure (tellReady's exposureMin to exposureMax). */
  fun setExposure(index: Int) {
    val cam = camera ?: return
    val exposure = cam.cameraInfo.exposureState
    if (!exposure.isExposureCompensationSupported) return
    val range = exposure.exposureCompensationRange
    cam.cameraControl.setExposureCompensationIndex(index.coerceIn(range.lower, range.upper))
  }

  /**
   * Takes a photo into memory and resolves with it cleaned (CleanPhoto.kt): its JPEG bytes, width
   * and height, and its small picture. A night photo takes a few seconds: how far it has come is told as onProcessing.
   */
  fun takePhoto(silent: Boolean, promise: Promise) {
    val capture = imageCapture
    if (capture == null) {
      promise.reject("ERR_CAMERA", "The camera is not ready", null)
      return
    }
    capture.takePicture(
      main,
      object : ImageCapture.OnImageCapturedCallback() {
        override fun onCaptureStarted() {
          if (!silent) sound.play(MediaActionSound.SHUTTER_CLICK)
        }

        override fun onCaptureProcessProgressed(progress: Int) {
          runCatching { onProcessing(mapOf("progress" to progress)) }
        }

        override fun onCaptureSuccess(image: ImageProxy) {
          val rotation = image.imageInfo.rotationDegrees
          val jpeg = try {
            val buffer = image.planes[0].buffer
            buffer.rewind()
            ByteArray(buffer.remaining()).also { buffer.get(it) }
          } catch (e: Throwable) {
            promise.reject("ERR_PHOTO", e.message ?: "The photo could not be read", e)
            return
          } finally {
            image.close()
          }
          Thread({
            try {
              val clean = CleanPhoto.of(jpeg, rotation)
              val photo = mutableMapOf<String, Any>("data" to clean.bytes, "width" to clean.width, "height" to clean.height)
              clean.thumb?.let { photo["thumb"] = it }
              promise.resolve(photo)
            } catch (e: Throwable) {
              promise.reject("ERR_PHOTO", e.message ?: "The photo could not be drawn", e)
            } finally {
              jpeg.fill(0)
            }
          }, "erevos-camera-photo").start()
        }

        override fun onError(exception: ImageCaptureException) {
          promise.reject("ERR_PHOTO", exception.message ?: "The photo could not be taken", exception)
        }
      },
    )
  }

  /**
   * Records a video into the app's cache until stopRecording, and resolves then with its file://
   * link; with sound unless `muted` or the microphone is not allowed. A video that fails is
   * deleted, and the promise rejects.
   */
  @SuppressLint("MissingPermission")
  fun record(muted: Boolean, silent: Boolean, promise: Promise) {
    val capture = videoCapture
    if (capture == null || recording != null) {
      promise.reject("ERR_CAMERA", "The camera is not ready", null)
      return
    }
    val folder = File(context.cacheDir, CAMERA_FOLDER).apply { mkdirs() }
    val file = File(folder, "erevos-camera-${UUID.randomUUID()}.mp4")
    val audio = !muted && ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
    val pending = capture.output.prepareRecording(context, FileOutputOptions.Builder(file).build())
    if (audio) pending.withAudioEnabled()
    if (!silent) sound.play(MediaActionSound.START_VIDEO_RECORDING)
    try {
      recording = pending.start(main) { event ->
        if (event !is VideoRecordEvent.Finalize) return@start
        recording = null
        if (!silent && !gone) sound.play(MediaActionSound.STOP_VIDEO_RECORDING)
        val kept = event.error in KEPT && file.exists() && file.length() > 0
        if (kept) {
          promise.resolve(mapOf("uri" to Uri.fromFile(file).toString()))
        } else {
          file.delete()
          promise.reject("ERR_VIDEO", event.cause?.message ?: "The video could not be recorded", event.cause)
        }
        update()
      }
    } catch (e: Throwable) {
      recording = null
      file.delete()
      promise.reject("ERR_VIDEO", e.message ?: "The video could not be recorded", e)
    }
  }

  fun stopRecording() {
    recording?.stop()
  }

  /** The view goes: the camera is let go, and a video being filmed stops (and is kept). */
  fun release() {
    gone = true
    turned.disable()
    recording?.stop()
    owner?.let { camera?.cameraInfo?.cameraState?.removeObservers(it) }
    camera = null
    imageCapture = null
    videoCapture = null
    runCatching { provider?.unbindAll() }
    runCatching { sound.release() }
  }

  companion object {
    // The cache folder of the videos being recorded: what is left there when Erevos stopped before
    // keeping one goes as Erevos starts (lib/camera-cache.ts CAMERA_FOLDER).
    private const val CAMERA_FOLDER = "Camera"

    private val EFFECTS = linkedMapOf(
      "night" to ExtensionMode.NIGHT,
      "hdr" to ExtensionMode.HDR,
      "bokeh" to ExtensionMode.BOKEH,
      "auto" to ExtensionMode.AUTO,
    )
    private val QUALITIES = mapOf("720p" to Quality.HD, "1080p" to Quality.FHD, "2160p" to Quality.UHD)

    // A video ends with one of these and is still whole: stopped, or cut short by a limit or by the camera closing.
    private val KEPT = setOf(
      VideoRecordEvent.Finalize.ERROR_NONE,
      VideoRecordEvent.Finalize.ERROR_FILE_SIZE_LIMIT_REACHED,
      VideoRecordEvent.Finalize.ERROR_DURATION_LIMIT_REACHED,
      VideoRecordEvent.Finalize.ERROR_SOURCE_INACTIVE,
    )
  }
}
