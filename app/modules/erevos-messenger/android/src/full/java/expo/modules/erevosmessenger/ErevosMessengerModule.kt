// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import android.app.Application
import android.content.Intent
import android.os.Handler
import android.os.Looper
import eu.erevos.messenger.calls.SessionCallActivity
import eu.erevos.messenger.calls.SessionCalls
import eu.erevos.messenger.engine.EngineHost
import eu.erevos.messenger.engine.Engines
import eu.erevos.messenger.session.Session
import eu.erevos.messenger.signal.Signal
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executors
import org.json.JSONObject

// Erevos+ (android/build.gradle): Messenger, Signal and Session through the engines of messenger/
// (eu.erevos.messenger.engine), with no screens of theirs; Erevos's own screens show them.
class ErevosMessengerModule : Module() {
  // The engines block on the network: their calls go one after another on a thread of their own.
  private val worker = Executors.newSingleThreadExecutor { Thread(it, "erevos-messenger") }
  @Volatile private var started = false
  @Volatile private var inFront = false
  private val main = Handler(Looper.getMainLooper())

  override fun definition() = ModuleDefinition {
    Name("ErevosMessenger")
    Events("onEvent")

    Function("available") { true }

    View(SignalVideoView::class) {
      Prop("side") { view: SignalVideoView, side: String -> view.setSide(side) }
    }

    // Whether Erevos is in front (lib/messenger.ts follows AppState): Session then reads new messages more often.
    Function("setInFront") { front: Boolean -> inFront = front }

    AsyncFunction("open") {
      synchronized(this@ErevosMessengerModule) {
        if (started) return@AsyncFunction null
        val app = appContext.reactContext?.applicationContext as? Application
          ?: throw CodedException("NO_APP", "The app is not ready", null)
        // Not while this app moved out to another edition, nor while a move's folders wait to be
        // put in place (erevos-device MoveNet.kt); and once open, a move's wait for the next start.
        if (java.io.File(app.filesDir, "moved-out.json").exists() || java.io.File(app.filesDir, "move-net-in/ready").exists()) {
          throw CodedException("MOVED", "Erevos moved, or is taking a move", null)
        }
        System.setProperty("erevos.move.engine-open", "1")
        EngineHost.appInFront = { inFront }
        SessionCalls.init(app)
        SignalCalls.onEvent = { event -> sendEvent("onEvent", mapOf("service" to "signal", "json" to event.toString())) }
        Engines.init(app) { event -> emit(event) }
        started = true
        WebPages.wipeIfNone()
      }
      null
    }

    AsyncFunction("call") { service: String, op: String, args: String ->
      if (!started) throw CodedException("NOT_OPEN", "The engines are not open", null)
      val a = numbers(JSONObject(args))
      // The service is named, so a call needs no key to find its engine.
      val run: () -> JSONObject = when (service) {
        // Signal's database key is the Keystore's to open, and its start keeps who we are.
        "signal" -> when (op) {
          "open" -> { -> JSONObject().put("ok", JSONObject().put("registered", Signal.open()).put("error", Signal.status)) }
          "start" -> { -> Signal.start() }
          // Signed out: a call going on ends, and RingRTC forgets who we were.
          "logout" -> { -> SignalCalls.stop(); Signal.call(op, a) }
          else -> { -> Signal.call(op, a) }
        }
        "session" -> { -> Session.call(op, a) }
        // Messenger's startChat takes the person's id as a number; it comes as text, whole.
        // Signed out: nothing the Messenger case's page kept stays either.
        "messenger" -> when (op) {
          "logout" -> { -> main.post { MessengerCaseActivity.forget() }; Engines.messenger(op, a) }
          else -> { -> Engines.messenger(op, if (op == "startChat") personId(a) else a) }
        }
        else -> throw CodedException("NO_SERVICE", "No such service: $service", null)
      }
      worker.submit<String> { run().toString() }.get()
    }

    // A page of the service the owner fills in by themselves (WebSignInActivity): Messenger's
    // sign-in (its cookies, as JSON) or Signal's captcha (its answer); null when they went back.
    AsyncFunction("webSignIn") { kind: String, promise: Promise ->
      val context = appContext.currentActivity ?: appContext.reactContext
        ?: throw CodedException("NO_APP", "The app is not ready", null)
      val agent = if (kind == "messenger" && started) runCatching { Engines.messenger("userAgent").optString("ok") }.getOrDefault("") else ""
      WebSignInActivity.start(context, kind, agent) { promise.resolve(it) }
    }

    // The same page only through Tor (lib/messenger-store.ts webPage): `door` is Tor's SOCKS
    // door as JSON. Refused where this phone's web view cannot, never shown straight.
    AsyncFunction("webSignInTor") { kind: String, door: String, promise: Promise ->
      if (kind != "signalCaptcha" && kind != "messenger") throw CodedException("NO_KIND", "Not a page for Tor: $kind", null)
      if (!WebSignInActivity.canTor()) throw CodedException("NO_TOR_WEB", "This phone's web view cannot go through Tor", null)
      val context = appContext.currentActivity ?: appContext.reactContext
        ?: throw CodedException("NO_APP", "The app is not ready", null)
      val agent = if (kind == "messenger" && started) runCatching { Engines.messenger("userAgent").optString("ok") }.getOrDefault("") else ""
      WebSignInActivity.start(context, kind, agent, door) { promise.resolve(it) }
    }

    // Facebook itself with the Messenger account's sign-in (FacebookActivity), the account's way:
    // `door` is Tor's SOCKS door as JSON when it goes through Tor, or empty. Answers "messages" or
    // "thread:<id>" when the owner followed a Messenger link there, else null.
    AsyncFunction("facebook") { door: String, promise: Promise ->
      if (!started) throw CodedException("NOT_OPEN", "The engines are not open", null)
      if (door.isNotEmpty() && !WebSignInActivity.canTor()) throw CodedException("NO_TOR_WEB", "This phone's web view cannot go through Tor", null)
      val context = appContext.currentActivity ?: appContext.reactContext
        ?: throw CodedException("NO_APP", "The app is not ready", null)
      val cookies = worker.submit<JSONObject> { Engines.messenger("webCookies", JSONObject()) }.get().optJSONObject("ok")
        ?: throw CodedException("NOT_SIGNED_IN", "Messenger is not signed in", null)
      main.post { FacebookActivity.start(context, cookies.toString(), door.ifEmpty { null }) { promise.resolve(it) } }
    }

    // Messenger in its case (MessengerCaseActivity): facebook.com/messages itself, with the engine's
    // sign-in, the account's way. `thread` a chat to open, or "". Answers "cookies:<json>" with the
    // sign-in the page ended with, "signedOut", or null.
    AsyncFunction("messengerCase") { door: String, thread: String, promise: Promise ->
      if (!started) throw CodedException("NOT_OPEN", "The engines are not open", null)
      if (door.isNotEmpty() && !WebSignInActivity.canTor()) throw CodedException("NO_TOR_WEB", "This phone's web view cannot go through Tor", null)
      val context = appContext.currentActivity ?: appContext.reactContext
        ?: throw CodedException("NO_APP", "The app is not ready", null)
      val (cookies, agent) = worker.submit<Pair<JSONObject?, String>> {
        Engines.messenger("webCookies", JSONObject()).optJSONObject("ok") to Engines.messenger("userAgent").optString("ok")
      }.get()
      if (cookies == null) throw CodedException("NOT_SIGNED_IN", "Messenger is not signed in", null)
      main.post { MessengerCaseActivity.start(context, cookies.toString(), agent, door.ifEmpty { null }, thread) { promise.resolve(it) } }
    }

    // The web pages on screens of their own (WebPages): closed as the space locks or closes and on
    // panic, and kept out of screenshots while Erevos's own window is (lib/web-pages.ts).
    Function("closeWebPages") { WebPages.closeAll() }
    Function("setWebPagesSecure") { on: Boolean -> WebPages.setSecure(on) }
    Function("setWebPagesLook") { look: String -> WebPages.setLook(look) }
    // Whether Messenger's case is on the screen now (lib/messenger-store.ts counts nothing then).
    Function("caseInFront") { MessengerCaseActivity.inFront }
    Function("webPageInFront") { WebPages.inFront() }
    Function("webPagesLeftAt") { WebPages.leftAt().toDouble() }

    // The words of Session's call screen and notifications, in the app's language (lib/messenger-store.ts).
    Function("setCallTexts") { words: String -> SessionCalls.setTexts(JSONObject(words)) }

    // Each Session chat's notification choice (muted until, own ringtone), which its calls follow.
    Function("setSessionMuted") { choices: String -> SessionCalls.setChoices(JSONObject(choices)) }

    // A Session call to the person of a one-to-one chat (its screen asks for the microphone, and
    // the camera for video). False when another Session call is on.
    Function("sessionCall") { thread: String, name: String, video: Boolean ->
      val key = thread.toLongOrNull() ?: throw CodedException("NO_CHAT", "Not a chat: $thread", null)
      if (!started) throw CodedException("NOT_OPEN", "The engines are not open", null)
      if (SessionCalls.state != SessionCalls.State.IDLE) return@Function false
      val activity = appContext.currentActivity
      if (activity != null) SessionCallActivity.start(activity, key, name, video)
      else {
        val context = appContext.reactContext ?: throw CodedException("NO_APP", "The app is not ready", null)
        context.startActivity(
          Intent(context, SessionCallActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            .putExtra("thread", key).putExtra("name", name).putExtra("video", video),
        )
      }
      true
    }
    // Signal's 1:1 calls (SignalCalls, RingRTC): how they stand comes as signalCallState events.
    AsyncFunction("signalCall") { person: String, video: Boolean ->
      if (!started) throw CodedException("NOT_OPEN", "The engines are not open", null)
      val key = person.toLongOrNull() ?: throw CodedException("NO_PERSON", "No such person", null)
      worker.submit { SignalCalls.start(context(), key, video) }.get()
      null
    }
    AsyncFunction("signalAnswer") { camera: Boolean -> SignalCalls.answer(context(), camera); null }
    AsyncFunction("signalHangUp") { SignalCalls.hangUp(context()); null }
    AsyncFunction("signalMute") { on: Boolean -> SignalCalls.mute(context(), on); null }
    AsyncFunction("signalCamera") { on: Boolean -> SignalCalls.camera(context(), on); null }
    AsyncFunction("signalFlip") { SignalCalls.flip(context()); null }

    AsyncFunction("close") {
      if (started) worker.submit { runCatching { Engines.messenger("stop") } }.get()
      null
    }
  }

  // The app keeps 64-bit keys as text (JavaScript's numbers do not hold them); the engines read
  // these fields as numbers (Go's and Rust's JSON do not take text there).
  private val numberFields = setOf("thread", "person", "poll", "option")
  private val numberLists = setOf("to", "people", "selected")

  private fun numbers(a: JSONObject): JSONObject {
    for (name in a.keys().asSequence().toList()) {
      val v = a.opt(name)
      if (name in numberFields && v is String) v.toLongOrNull()?.let { a.put(name, it) }
      if (name in numberLists && v is org.json.JSONArray) {
        for (i in 0 until v.length()) (v.opt(i) as? String)?.toLongOrNull()?.let { v.put(i, it) }
      }
    }
    return a
  }

  private fun personId(a: JSONObject): JSONObject {
    (a.opt("id") as? String)?.toLongOrNull()?.let { a.put("id", it) }
    return a
  }

  private fun context(): android.content.Context =
    appContext.reactContext?.applicationContext ?: throw CodedException("NO_APP", "The app is not ready", null)

  // Signal's and Session's own events (sign-in, status) update their state first; every event
  // then goes to the app, named by its service.
  private fun emit(event: JSONObject) {
    // Session's call messages go to the call, on the main thread, not to the chats.
    if (event.optString("type") == "sessionCall") {
      main.post { SessionCalls.onSignal(event) }
      return
    }
    // A Signal call's message is RingRTC's to take, never the screens'.
    if (event.optString("type") == "signalCall") {
      appContext.reactContext?.applicationContext?.let { SignalCalls.take(it, event) }
      return
    }
    Signal.takeOwn(event)
    Session.takeOwn(event)
    val service = when (event.optString("network")) {
      "signal" -> "signal"
      "session" -> "session"
      else -> event.optJSONObject("thread")?.optLong("key")?.let(Engines::networkOf)
        ?: event.optJSONObject("message")?.optLong("thread")?.let(Engines::networkOf)
        ?: if (event.has("thread") && event.opt("thread") is Number) Engines.networkOf(event.optLong("thread")) else "messenger"
    }
    sendEvent("onEvent", mapOf("service" to service, "json" to event.toString()))
  }
}
