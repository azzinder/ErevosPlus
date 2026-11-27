// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Telegram in the ErevosGram build (android/build.gradle): TDLib's JSON interface (Tdlib.kt), one
// client for each space with a Telegram account. lib/telegram.ts speaks TDLib's own requests.
class ErevosTelegramModule : Module() {
  private fun context(): Context = appContext.reactContext ?: throw IllegalStateException("no context")

  override fun definition() = ModuleDefinition {
    Name("ErevosTelegram")

    // Where a video call's pictures are drawn (CallVideo.kt).
    View(TelegramVideoView::class) {
      Prop("side") { view: TelegramVideoView, side: String -> view.setSide(side) }
    }
    // A sticker that moves (StickerView.kt).
    View(TelegramStickerView::class) {
      Prop("path") { view: TelegramStickerView, path: String -> view.setPath(path) }
    }
    // A video or GIF of a message (MediaView.kt).
    View(TelegramMediaView::class) {
      Prop("path") { view: TelegramMediaView, path: String -> view.setPath(path) }
      Prop("controls") { view: TelegramMediaView, controls: Boolean -> view.setControls(controls) }
    }
    Events("onUpdates", "onCall")

    OnCreate {
      appContext.reactContext?.let { Tdlib.start(it) }
      Tdlib.onUpdates = { slot, updates -> runCatching { sendEvent("onUpdates", mapOf("slot" to slot, "updates" to updates)) } }
      Calls.onEvent = { kind, data -> runCatching { sendEvent("onCall", mapOf("kind" to kind, "data" to data)) } }
    }

    OnDestroy {
      Calls.stop()
      Voice.cancel()
    }

    Function("available") { Tdlib.available() }
    Function("slots") { Tdlib.slots() }
    AsyncFunction("open") { slot: String, key: ByteArray, lang: String, proxy: String? -> Tdlib.open(slot, key, lang, proxy ?: "") }
    AsyncFunction("send") { slot: String, request: String, promise: Promise -> Tdlib.send(slot, request) { promise.resolve(it) } }
    AsyncFunction("close") { slot: String -> Tdlib.close(slot) }
    AsyncFunction("wipe") { slot: String -> Tdlib.wipe(slot) }
    AsyncFunction("signIn") { slot: String -> Tdlib.signIn(slot) }
    AsyncFunction("putSignIn") { slot: String, sealed: String -> Tdlib.putSignIn(slot, sealed) }

    // The sound of a call (Calls.kt); TDLib does the calling itself.
    AsyncFunction("callProtocol") { Calls.protocol(context()) }
    AsyncFunction("callStart") { userId: Long, outgoing: Boolean, ready: String, camera: Boolean -> Calls.start(context(), userId, outgoing, ready, camera) }
    AsyncFunction("callCamera") { on: Boolean -> Calls.camera(context(), on) }
    AsyncFunction("callSwitchCamera") { Calls.switchCamera() }
    AsyncFunction("callSignal") { userId: Long, data: String -> Calls.signal(context(), userId, data) }
    AsyncFunction("callMute") { on: Boolean -> Calls.mute(context(), on) }
    AsyncFunction("callStop") { Calls.stop() }

    // An Erevos sticker's picture (PNG) made a WebP for Telegram (StickerOut.kt).
    AsyncFunction("stickerWebp") { png: ByteArray -> StickerOut.fromPng(context(), png) }

    // A voice message in Telegram's own Ogg/Opus (Voice.kt).
    AsyncFunction("voiceStart") { Voice.start(context()) }
    AsyncFunction("voiceStop") { Voice.stop() }
    AsyncFunction("voiceCancel") { Voice.cancel() }
  }
}
