// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import android.os.Build
import android.util.Base64
import android.util.Log
import dalvik.system.DexClassLoader
import java.io.File
import java.util.concurrent.Executors
import java.util.function.BiConsumer

/**
 * The sound of Telegram calls, in a room of its own. NTgCalls brings its own WebRTC (org.webrtc.*
 * classes and libntgcalls.so), and Erevos's own calls already have another one (react-native-webrtc
 * with org.jitsi:webrtc), with classes of the same names. Two classes of one name cannot live in
 * one class loader, so NTgCalls, its WebRTC and src/calls (Engine) are not in the app's dex: the
 * build puts them, as dex, in the asset tgcalls.jar (android/build.gradle), and they are loaded
 * here by a class loader that looks in its own jar first for those names. Their native library is
 * loaded by them, so it binds to their classes only.
 *
 * Engine speaks only plain types (Context, BiConsumer, String, byte[]), so nothing of either WebRTC
 * crosses between the two rooms. Every call to it goes through one thread, but the camera's
 * pictures (CallVideo.kt), which go straight from the camera's thread.
 */
internal object Calls {
  private const val TAG = "ErevosTelegram"
  private const val ASSET = "tgcalls.jar"
  private const val ENGINE = "expo.modules.erevostelegram.calls.Engine"

  /** Names that come from tgcalls.jar, never from the app. */
  private val OWN = listOf("org.webrtc.", "io.github.pytgcalls.", "org.jni_zero.", "expo.modules.erevostelegram.calls.")

  private val thread = Executors.newSingleThreadExecutor { Thread(it, "erevos-telegram-calls").apply { isDaemon = true } }
  private var loader: ClassLoader? = null
  private var engine: Any? = null

  /** Where what the call says goes: "signal" with base64, "state" with a word. */
  @Volatile var onEvent: ((String, String) -> Unit)? = null

  /** A class loader that takes the names above from its own jar first, all else from the app. */
  private class Own(jar: String, opt: File, libs: String, parent: ClassLoader) : DexClassLoader(jar, opt.absolutePath, libs, parent) {
    override fun loadClass(name: String, resolve: Boolean): Class<*> {
      if (name == "J" || name.startsWith("J$") || name == "N" || OWN.any { name.startsWith(it) }) {
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
    val dir = File(app.codeCacheDir, "tgcalls").apply { mkdirs() }
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
    return Own(jar.absolutePath, File(dir, "opt").apply { mkdirs() }, libs, Calls::class.java.classLoader!!).also { loader = it }
  }

  private fun <T> on(job: () -> T): T = thread.submit(job).get()

  private fun engine(context: Context): Any {
    engine?.let { return it }
    val type = loader(context).loadClass(ENGINE)
    val events = BiConsumer<String, Any?> { kind, data ->
      // The other's pictures are drawn here, never sent on to the screens' JavaScript.
      if (kind == "frame") {
        val f = data as? Array<*> ?: return@BiConsumer
        runCatching { CallVideo.showRemote(f[0] as ByteArray, f[1] as Int, f[2] as Int, f[3] as Int) }
        return@BiConsumer
      }
      val text = when (data) {
        is ByteArray -> Base64.encodeToString(data, Base64.NO_WRAP)
        else -> data?.toString() ?: ""
      }
      runCatching { onEvent?.invoke(kind, text) }.onFailure { Log.w(TAG, "call event: ${it.message}") }
    }
    return type.getConstructor(Context::class.java, BiConsumer::class.java).newInstance(context.applicationContext, events).also { engine = it }
  }

  private fun call(context: Context, name: String, vararg args: Any) = on {
    val e = engine(context)
    val types = args.map {
      when (it) {
        is Long -> Long::class.javaPrimitiveType
        is Boolean -> Boolean::class.javaPrimitiveType
        else -> it.javaClass
      }
    }.toTypedArray()
    try {
      e.javaClass.getMethod(name, *types).invoke(e, *args)
    } catch (x: java.lang.reflect.InvocationTargetException) {
      throw x.targetException ?: x
    }
  }

  /** What this phone can speak in a call, as TDLib's callProtocol in JSON. */
  fun protocol(context: Context): String = on {
    loader(context).loadClass(ENGINE).getMethod("protocol").invoke(null) as String
  }

  fun start(context: Context, userId: Long, outgoing: Boolean, ready: String, camera: Boolean) {
    call(context, "start", userId, outgoing, ready, camera)
    if (camera) startCamera(context)
  }

  // The engine's sendFrame, found once: each camera picture goes straight to it, from the camera's thread.
  @Volatile private var sendFrame: java.lang.reflect.Method? = null

  private fun startCamera(context: Context) {
    val e = on { engine(context) }
    val m = sendFrame ?: e.javaClass.getMethod("sendFrame", ByteArray::class.java, Int::class.javaPrimitiveType, Int::class.javaPrimitiveType, Int::class.javaPrimitiveType, Long::class.javaPrimitiveType).also { sendFrame = it }
    CallVideo.start(context) { data, w, h, rotation, ms ->
      runCatching { m.invoke(e, data, w, h, rotation, ms) }
    }
  }

  /** Turns this phone's camera on in the call, or off. The camera permission must be given. */
  fun camera(context: Context, on: Boolean) {
    call(context, "camera", on)
    if (on) startCamera(context) else CallVideo.stop()
  }

  fun switchCamera() = CallVideo.switchCamera()

  fun signal(context: Context, userId: Long, data: String) {
    call(context, "signal", userId, Base64.decode(data, Base64.DEFAULT))
  }

  fun mute(context: Context, on: Boolean) {
    call(context, "mute", on)
  }

  fun stop() {
    CallVideo.reset()
    on {
      val e = engine ?: return@on
      runCatching { e.javaClass.getMethod("stop").invoke(e) }
    }
  }
}
