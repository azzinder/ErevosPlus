// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import android.content.Context
import android.os.Build
import android.util.Log
import android.view.View
import dalvik.system.DexClassLoader
import eu.erevos.messenger.signal.Signal
import java.io.File
import java.util.concurrent.Executors
import java.util.function.BiConsumer
import org.json.JSONObject

/**
 * Signal's 1:1 voice and video calls, with RingRTC, Signal's own calling library, so they ring
 * and talk with the official Signal apps.
 *
 * RingRTC brings its own WebRTC, with classes of the same names as the app's (org.jitsi:webrtc,
 * for Erevos's own calls), and two classes of one name cannot live in one class loader. So RingRTC,
 * its WebRTC and src/ringrtc (Engine.java) are not in the app's dex: the build puts them, as dex,
 * in the asset ringrtc.jar (android/build.gradle), and they are loaded here by a class loader that
 * looks in its own jar first for those names, as the Telegram calls are (modules/erevos-telegram,
 * Calls.kt). Their native library is loaded by them, so it binds to their classes only.
 *
 * Between RingRTC and the Signal engine (messenger/signal, src/calls.rs) go the call's messages:
 * what the engine receives (its signalCall events) goes in here, never to the screens; what RingRTC
 * asks to send goes to the engine's callSend. The screens get only how the call stands
 * (signalCallState events) and ask with call, answer, hangUp, mute, camera and flip.
 */
internal object SignalCalls {
  private const val TAG = "ErevosSignalCalls"
  private const val ASSET = "ringrtc.jar"
  private const val ENGINE = "expo.modules.erevosmessenger.ringrtc.Engine"

  /** Names that come from ringrtc.jar, never from the app. */
  private val OWN = listOf("org.webrtc.", "org.signal.ringrtc.", "org.jni_zero.", "expo.modules.erevosmessenger.ringrtc.")

  // RingRTC is asked on one thread; the engine's network calls go on another, so a slow send never
  // holds RingRTC up.
  private val thread = Executors.newSingleThreadExecutor { Thread(it, "erevos-signal-calls").apply { isDaemon = true } }
  private val network = Executors.newSingleThreadExecutor { Thread(it, "erevos-signal-call-net").apply { isDaemon = true } }
  private var loader: ClassLoader? = null
  private var engine: Any? = null
  private var app: Context? = null
  private var selfSet = ""

  /** Where how the call stands goes (the module sends it to the screens as an event). */
  @Volatile var onEvent: ((JSONObject) -> Unit)? = null

  // Who each call is with, by their ACI: their chat key and name, for the screens.
  private val people = HashMap<String, Pair<String, String>>()

  /** Our own device id on Signal, for RingRTC. */
  @Volatile private var myDevice = 1

  private class Own(jar: String, opt: File, libs: String, parent: ClassLoader) : DexClassLoader(jar, opt.absolutePath, libs, parent) {
    override fun loadClass(name: String, resolve: Boolean): Class<*> {
      if (OWN.any { name.startsWith(it) }) {
        synchronized(this) {
          return findLoadedClass(name) ?: findClass(name)
        }
      }
      return super.loadClass(name, resolve)
    }
  }

  private fun loader(context: Context): ClassLoader {
    loader?.let { return it }
    val app = context.applicationContext
    // A copy of the asset, read-only: Android 14 refuses to load code from a file anyone may write.
    val dir = File(app.codeCacheDir, "ringrtc").apply { mkdirs() }
    val jar = File(dir, ASSET)
    val version = runCatching { app.packageManager.getPackageInfo(app.packageName, 0).lastUpdateTime }.getOrDefault(0L)
    val stamp = File(dir, "stamp")
    if (!jar.exists() || stamp.takeIf { it.exists() }?.readText() != version.toString()) {
      jar.setWritable(true)
      app.assets.open(ASSET).use { input -> jar.outputStream().use { input.copyTo(it) } }
      jar.setReadOnly()
      stamp.writeText(version.toString())
    }
    // Native libraries: extracted, or kept inside the APK (lib/<abi>), as the app's own are.
    val info = app.applicationInfo
    val abi = Build.SUPPORTED_ABIS.firstOrNull() ?: "arm64-v8a"
    val libs = listOfNotNull(info.nativeLibraryDir, info.sourceDir?.let { "$it!/lib/$abi" }).joinToString(File.pathSeparator)
    return Own(jar.absolutePath, File(dir, "opt").apply { mkdirs() }, libs, SignalCalls::class.java.classLoader!!).also { loader = it }
  }

  private fun <T> on(job: () -> T): T = thread.submit(job).get()

  @Synchronized
  private fun engine(context: Context): Any {
    engine?.let { return it }
    app = context.applicationContext
    val type = loader(context).loadClass(ENGINE)
    val events = BiConsumer<String, Any?> { kind, data -> fromEngine(kind, data?.toString() ?: "") }
    return type.getConstructor(Context::class.java, BiConsumer::class.java).newInstance(context.applicationContext, events).also { engine = it }
  }

  private fun invoke(e: Any, name: String, vararg args: Any): Any? {
    val types = args.map {
      when (it) {
        is Boolean -> Boolean::class.javaPrimitiveType
        is Int -> Int::class.javaPrimitiveType
        is Context -> Context::class.java
        is View -> View::class.java
        else -> it.javaClass
      }
    }.toTypedArray()
    return try {
      e.javaClass.getMethod(name, *types).invoke(e, *args)
    } catch (x: java.lang.reflect.InvocationTargetException) {
      throw x.targetException ?: x
    }
  }

  private fun call(context: Context, name: String, vararg args: Any): Any? = on { invoke(engine(context), name, *args) }

  /** Same, later, for what comes from RingRTC's or the engine's threads. */
  private fun later(name: String, vararg args: Any) {
    thread.execute {
      val e = engine ?: return@execute
      runCatching { invoke(e, name, *args) }.onFailure { Log.w(TAG, "$name: ${it.message}") }
    }
  }

  private fun ok(r: JSONObject): JSONObject {
    r.optString("error").takeIf { it.isNotEmpty() }?.let { throw IllegalStateException(it) }
    return r.optJSONObject("ok") ?: JSONObject()
  }

  /** Tells RingRTC who we are, once per account. */
  private fun self(context: Context, me: String, device: Int) {
    myDevice = device
    if (me.isNotEmpty() && me != selfSet) {
      call(context, "setSelf", me)
      selfSet = me
    }
  }

  // ---- from the Signal engine ----

  /** A signalCall event of the Signal engine: a call message for RingRTC. Any thread. */
  fun take(context: Context, event: JSONObject) {
    val uuid = event.optString("uuid")
    if (uuid.isEmpty()) return
    synchronized(people) { people[uuid] = event.optString("person") to event.optString("name") }
    network.execute {
      runCatching {
        // RingRTC must know who we are before an offer reaches it.
        if (selfSet.isEmpty()) {
          val peer = ok(Signal.call("callPeer", JSONObject().put("person", event.optString("person").toLongOrNull() ?: 0L)))
          self(context, peer.optString("me"), peer.optInt("myDevice", 1))
        }
        call(context, "receive", event.toString())
      }.onFailure { Log.w(TAG, "receive: ${it.message}") }
    }
  }

  // ---- what RingRTC says ----

  private fun fromEngine(kind: String, data: String) {
    when (kind) {
      // A call message to send: through the Signal engine, then RingRTC is told it went.
      "send" -> network.execute {
        val m = runCatching { JSONObject(data) }.getOrNull() ?: return@execute
        val sent = runCatching { ok(Signal.call("callSend", m)) }.onFailure { Log.w(TAG, "send ${m.optString("kind")}: ${it.message}") }.isSuccess
        val id = m.optString("callId")
        // Opaque messages (group calls) have no call id to answer to.
        if (id.isNotEmpty()) later("sent", id, sent)
      }
      // RingRTC begins a call: with Signal's TURN servers, it goes on. Our address stays hidden
      // behind them, as Signal's "Always relay calls" does: the other side never learns our IP.
      "start" -> network.execute {
        val s = runCatching { JSONObject(data) }.getOrNull() ?: return@execute
        val relays = runCatching { Signal.call("callRelays").optJSONArray("ok")?.toString() }.getOrNull() ?: "[]"
        later("proceed", s.optString("callId"), relays, true)
      }
      "state" -> {
        val s = runCatching { JSONObject(data) }.getOrNull() ?: return
        val who = synchronized(people) { people[s.optString("uuid")] }
        s.put("type", "signalCallState").put("network", "signal")
          .put("person", who?.first ?: "").put("name", who?.second ?: "")
        runCatching { onEvent?.invoke(s) }
      }
      "missed" -> {
        val who = synchronized(people) { people[data] }
        runCatching {
          onEvent?.invoke(JSONObject().put("type", "signalCallMissed").put("network", "signal").put("uuid", data).put("person", who?.first ?: "").put("name", who?.second ?: ""))
        }
      }
    }
  }

  // ---- what the screens ask ----

  /** Calls the person whose chat key is `person`, with this phone's camera on when `video`. */
  fun start(context: Context, person: Long, video: Boolean) {
    val peer = ok(Signal.call("callPeer", JSONObject().put("person", person)))
    val uuid = peer.optString("uuid")
    if (uuid.isEmpty()) throw IllegalStateException("no such person")
    synchronized(people) { people[uuid] = peer.optString("person") to peer.optString("name") }
    self(context, peer.optString("me"), peer.optInt("myDevice", 1))
    call(context, "call", uuid, video, myDevice)
  }

  fun answer(context: Context, camera: Boolean) {
    call(context, "accept", camera)
  }

  fun hangUp(context: Context) {
    call(context, "hangup")
  }

  fun mute(context: Context, on: Boolean) {
    call(context, "mute", on)
  }

  fun camera(context: Context, on: Boolean) {
    call(context, "camera", on)
  }

  fun flip(context: Context) {
    call(context, "flip")
  }

  /** A view with the other side's picture ("remote") or ours ("local"). On the main thread. */
  fun view(context: Context, side: String): View? =
    runCatching { invoke(engine(context.applicationContext), "view", context, side) as? View }
      .onFailure { Log.w(TAG, "view: ${it.message}") }
      .getOrNull()

  fun forget(view: View) {
    val e = engine ?: return
    runCatching { invoke(e, "forget", view) }
  }

  /** Signal signed out or stopped: the call ends and RingRTC lets go. */
  fun stop() {
    thread.execute {
      val e = engine ?: return@execute
      runCatching { invoke(e, "close") }
      selfSet = ""
    }
  }
}
