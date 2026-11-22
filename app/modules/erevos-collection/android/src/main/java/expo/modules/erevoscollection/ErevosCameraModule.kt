// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscollection

import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Erevos's own camera, for the Collection (CameraPreview.kt, components/erevos-camera.tsx): its
// view, with what it is set to as props, and what it is asked to do as the view's functions.
class ErevosCameraModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ErevosCamera")

    View(CameraPreview::class) {
      Events("onReady", "onFail", "onProcessing")

      Prop("facing") { view: CameraPreview, value: String -> view.facing = value }
      Prop("mode") { view: CameraPreview, value: String -> view.mode = value }
      Prop("effect") { view: CameraPreview, value: String -> view.effect = value }
      Prop("quality") { view: CameraPreview, value: String -> view.quality = value }
      Prop("hdrVideo") { view: CameraPreview, value: Boolean -> view.hdrVideo = value }
      Prop("flash") { view: CameraPreview, value: String -> view.flash = value }
      Prop("torch") { view: CameraPreview, value: Boolean -> view.torch = value }
      Prop("zoom") { view: CameraPreview, value: Double -> view.zoom = value.toFloat() }

      OnViewDidUpdateProps { view: CameraPreview -> view.update() }
      OnViewDestroys { view: CameraPreview -> view.release() }

      AsyncFunction("takePhoto") { view: CameraPreview, silent: Boolean, promise: Promise ->
        view.takePhoto(silent, promise)
      }.runOnQueue(Queues.MAIN)

      AsyncFunction("record") { view: CameraPreview, muted: Boolean, silent: Boolean, promise: Promise ->
        view.record(muted, silent, promise)
      }.runOnQueue(Queues.MAIN)

      AsyncFunction("stopRecording") { view: CameraPreview ->
        view.stopRecording()
      }.runOnQueue(Queues.MAIN)

      AsyncFunction("focusAt") { view: CameraPreview, x: Double, y: Double ->
        view.focusAt(x, y)
      }.runOnQueue(Queues.MAIN)

      AsyncFunction("setExposure") { view: CameraPreview, index: Int ->
        view.setExposure(index)
      }.runOnQueue(Queues.MAIN)
    }
  }
}
