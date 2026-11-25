// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosdevice

import android.Manifest
import android.app.Application
import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.ActivityInfo
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PersistableBundle
import android.os.SystemClock
import android.view.WindowInsets
import android.view.WindowManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// What a chat asks of the phone itself and React Native does not give: the clipboard, for Copy in
// a message's menu, where the phone is, once, to send as a place, keeping Erevos's screen out of
// screenshots and the recent apps preview (lib/screen-privacy.ts), turning a photo shown on its own
// with the phone, and the reminders of Chat with myself (Reminders.kt). What is copied is marked sensitive, so Android's notice of a copy
// (Android 13 and later) does not show the words. Where
// the phone is comes from its own location, on every way it has at once (satellites, network,
// and Android's own mix of them); only when asked, and never followed after. Plain Android, no
// other library.
class ErevosDeviceModule : Module() {
  private val main = Handler(Looper.getMainLooper())

  private val context: Context?
    get() = appContext.reactContext

  override fun definition() = ModuleDefinition {
    Name("ErevosDevice")

    // What a move carried for the engines (MoveNet.kt) and could not put in place while one was
    // open goes in place now, as Erevos starts, before any of them opens.
    OnCreate {
      val app = context?.applicationContext ?: return@OnCreate
      runCatching { MoveNet.place(app) }
    }

    // Where the phone was found, once findPlace started looking: lat, lon, how near, metres (-1
    // when the phone does not say) and how long ago, seconds; or `error` "timeout" when nothing
    // came in time.
    Events("onPlace")

    // Puts the text on the clipboard, on the main thread, as Android's clipboard wants. False when
    // there is no app context to reach it from.
    Function("copyText") { text: String ->
      val app = context?.applicationContext ?: return@Function false
      main.post {
        runCatching {
          val clip = ClipData.newPlainText("Erevos", text)
          clip.description.extras = PersistableBundle().apply {
            if (Build.VERSION.SDK_INT >= 33) putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true)
            else putBoolean("android.content.extra.IS_SENSITIVE", true)
          }
          app.getSystemService(ClipboardManager::class.java)?.setPrimaryClip(clip)
        }
      }
      true
    }

    // Keeps the app's window out of screenshots, screen recordings and the recent apps preview
    // while `on` (FLAG_SECURE), on the main thread. False when no activity is showing; a new one,
    // as when Erevos comes back after being swiped away, gets it when the app says again.
    Function("setSecure") { on: Boolean ->
      val activity = appContext.currentActivity ?: return@Function false
      activity.runOnUiThread {
        if (on) activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        else activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
      }
      true
    }

    // The curtain over a space with a password lock (Curtain.kt, lib/curtain.ts): the phone covers
    // the space's screens as they go out of sight, and keeps them covered when they come back after
    // the lock's time, until the app's password screen is drawn; the lock button covers them at once.
    // `after` in ms, under 0 for no longer; `ground` the look's ground colour, as Android has colours.
    OnCreate {
      Curtain.register(context?.applicationContext as? Application)
    }

    Function("curtainArm") { after: Double, ground: Double ->
      Curtain.arm(appContext.currentActivity, after.toLong(), ground.toLong().toInt())
    }

    Function("curtainLower") {
      Curtain.lower(appContext.currentActivity)
    }

    // At once, or with `onScreen` once a screen that is not a space's is drawn under it.
    Function("curtainLift") { onScreen: Boolean ->
      Curtain.lift(onScreen)
    }

    // What happened as the screens last came back, once: how long Erevos was away, ms, on the clock
    // nobody can set, and whether the cover stayed. Null when they were not out of sight since.
    Function("curtainBack") {
      Curtain.takeBack()
    }

    Function("curtainDown") {
      Curtain.isDown()
    }

    // Whether Android shows the keyboard over Erevos's window now, read from the window's own insets
    // on the main thread: what components/keyboard.tsx checks a keyboard height against, as the
    // keyboard library can keep one that went with no animation. Null when no activity is showing,
    // or on Android before 11, which cannot say.
    AsyncFunction("keyboardShown") {
      val activity = appContext.currentActivity ?: return@AsyncFunction null
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return@AsyncFunction null
      activity.window?.decorView?.rootWindowInsets?.isVisible(WindowInsets.Type.ime())
    }.runOnQueue(Queues.MAIN)

    // The folder automatic backups go to (Folders.kt), off the screen's thread: its files with
    // their names and sizes in one look (null where it cannot be read), a file written into it, and
    // files deleted.
    AsyncFunction("folderFiles") { folder: String ->
      val app = context?.applicationContext ?: return@AsyncFunction null
      Folders.files(app, folder)
    }

    AsyncFunction("folderWrite") { folder: String, name: String, bytes: ByteArray ->
      val app = context?.applicationContext ?: throw IllegalStateException("No app context.")
      Folders.write(app, folder, name, bytes)
    }

    AsyncFunction("folderDelete") { uris: List<String> ->
      val app = context?.applicationContext ?: return@AsyncFunction 0
      Folders.delete(app, uris)
    }

    // Each file's size and SHA-256, read through off the screen's thread: a backup's parts, checked (Folders.kt).
    AsyncFunction("folderSha256") { uris: List<String> ->
      val app = context?.applicationContext ?: throw IllegalStateException("No app context.")
      Folders.sha256(app, uris)
    }

    // How much room Erevos takes, by the kind of its files (AppSpace.kt).
    AsyncFunction("appSpace") {
      val app = context?.applicationContext ?: return@AsyncFunction null
      AppSpace.measure(app)
    }

    // The chunks of photos and files by file, the names of the files the sealed values may be in,
    // and deleting the files no place names (AppSpace.kt, lib/leftovers.ts).
    AsyncFunction("chunkFiles") {
      val app = context?.applicationContext ?: return@AsyncFunction null
      AppSpace.chunkFiles(app)
    }

    AsyncFunction("storeNames") {
      val app = context?.applicationContext ?: return@AsyncFunction null
      AppSpace.storeNames(app)
    }

    AsyncFunction("deleteChunkFiles") { ids: List<String> ->
      val app = context?.applicationContext ?: return@AsyncFunction 0.0
      AppSpace.deleteChunkFiles(app, ids)
    }

    // The phone's own clock that the owner cannot set (lock/tries.ts): how long since it started, in
    // ms, sleep included, and which start that is, so a wait for wrong passwords ends only when that
    // long has really passed, whatever the date and time are moved to. The start is Android's count
    // of starts; a phone that does not keep one gives the time it started, in ten-minute steps, so
    // moving the clock looks like a new start there, and the wait starts again from its beginning.
    // An invite or a contact link given by touching phones (NfcShare.kt): answered from now, until
    // nfcStop. False when it cannot be (too long, or no context).
    Function("nfcShare") { uri: String ->
      NfcShare.share(uri)
    }

    Function("nfcStop") {
      NfcShare.stop()
    }

    // Whether this phone can give a link by NFC: "on", "off" (NFC off in Android's settings) or "none".
    Function("nfcState") {
      val app = context ?: return@Function "none"
      NfcShare.state(app)
    }

    Function("clock") {
      val up = SystemClock.elapsedRealtime()
      val count = context?.applicationContext?.let {
        runCatching { android.provider.Settings.Global.getInt(it.contentResolver, android.provider.Settings.Global.BOOT_COUNT, -1) }.getOrDefault(-1)
      } ?: -1
      val boot = if (count >= 0) "count:$count" else "time:${(System.currentTimeMillis() - up) / 600_000}"
      mapOf("up" to up.toDouble(), "boot" to boot)
    }

    // While `on`, the screen turns with the phone even with its auto-rotate off, as a photo shown on
    // its own does (components/attachment.tsx); off, it follows the phone's setting again. False when
    // no activity is showing.
    Function("turnWithPhone") { on: Boolean ->
      val activity = appContext.currentActivity ?: return@Function false
      activity.runOnUiThread {
        activity.requestedOrientation =
          if (on) ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR else ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
      }
      true
    }

    // A reminder of Chat with myself for `at` (milliseconds), told by Android with Erevos closed
    // (Reminders.kt), in place of one with this id. False when too many wait or there is no app.
    Function("remind") { id: String, at: Double ->
      val app = context?.applicationContext ?: return@Function false
      Reminders.remind(app, id, at.toLong())
    }

    // Forgets a reminder that has not come.
    Function("forgetReminder") { id: String ->
      val app = context?.applicationContext ?: return@Function Unit
      Reminders.forget(app, id)
    }

    // Reminders seen in their chat: the notice no longer tells of them, and goes once it tells of none.
    Function("seenReminders") { ids: List<String> ->
      val app = context?.applicationContext ?: return@Function Unit
      Reminders.seen(app, ids)
    }

    // A new Erevos, named `name`, is out (Updates.kt): a notice says so.
    Function("tellUpdate") { name: String ->
      val app = context?.applicationContext ?: return@Function Unit
      Updates.tell(app, name)
    }

    // Moving to another edition (Move.kt): this app's package, where its move's files go, and
    // the move of another edition on the phone, signed as this one, read and taken.
    Function("packageName") {
      context?.applicationContext?.packageName ?: ""
    }

    Function("moveOutDir") {
      val app = context?.applicationContext ?: return@Function null
      Move.outDir(app).also { it.mkdirs() }.absolutePath
    }

    Function("moveClear") {
      val app = context?.applicationContext ?: return@Function false
      Move.clear(app)
    }

    Function("appInstalled") { pkg: String ->
      val app = context?.applicationContext ?: return@Function false
      Move.installed(app, pkg)
    }

    // Opens another edition (the one moved to), never any other app.
    Function("openApp") { pkg: String ->
      val app = context?.applicationContext ?: return@Function false
      Move.open(app, pkg)
    }

    AsyncFunction("moveSources") {
      val app = context?.applicationContext ?: return@AsyncFunction emptyList<Map<String, String>>()
      Move.sources(app)
    }

    AsyncFunction("moveCopy") { pkg: String, name: String, path: String ->
      val app = context?.applicationContext ?: throw IllegalStateException("No app")
      Move.copy(app, pkg, name, path).toDouble()
    }

    // What the edition moved from carries beside its backup (MoveNet.kt): its size there, taken
    // here beside this app's own, then put in place (false: at the next start), and whether it waits.
    Function("moveNetSize") {
      val app = context?.applicationContext ?: return@Function 0.0
      MoveNet.size(app).toDouble()
    }

    AsyncFunction("moveTakeNet") { pkg: String ->
      val app = context?.applicationContext ?: throw IllegalStateException("No app")
      Move.takeNet(app, pkg).toDouble()
    }

    AsyncFunction("movePlaceNet") {
      val app = context?.applicationContext ?: throw IllegalStateException("No app")
      MoveNet.place(app)
    }

    // An app moved out ends its process as its screen is left (components/moved-out.tsx): only then,
    // never with a move not made.
    Function("endProcess") {
      val app = context?.applicationContext ?: return@Function false
      if (!java.io.File(app.filesDir, "moved-out.json").exists()) return@Function false
      android.os.Process.killProcess(android.os.Process.myPid())
      true
    }

    Function("moveDropNet") {
      val app = context?.applicationContext ?: return@Function false
      MoveNet.drop(app)
    }

    Function("moveNetPending") {
      val app = context?.applicationContext ?: return@Function false
      MoveNet.pending(app)
    }

    AsyncFunction("moveDone") { pkg: String ->
      val app = context?.applicationContext ?: return@AsyncFunction false
      Move.done(app, pkg)
    }

    // A backup made by hand is done (Backups.kt): a notice says so, in the app's words.
    Function("tellBackup") { title: String, text: String, channel: String ->
      val app = context?.applicationContext ?: return@Function Unit
      Backups.tell(app, title, text, channel)
    }

    // The panic button (Panic.kt): its settings, the panic app that asked to be the one, and the
    // wipe itself, after which Android stops Erevos.
    Function("panicState") {
      val app = context?.applicationContext ?: return@Function null
      Panic.state(app)
    }

    Function("setPanic") { on: Boolean, backups: Boolean, folder: String ->
      val app = context?.applicationContext ?: return@Function Unit
      Panic.set(app, on, backups, folder)
    }

    Function("allowPanicApp") { pkg: String ->
      val app = context?.applicationContext ?: return@Function false
      Panic.allow(app, pkg)
    }

    Function("refusePanicApp") {
      val app = context?.applicationContext ?: return@Function Unit
      Panic.refuse(app)
    }

    Function("forgetPanicApp") {
      val app = context?.applicationContext ?: return@Function Unit
      Panic.forget(app)
    }

    Function("renewPanicApp") {
      val app = context?.applicationContext ?: return@Function false
      Panic.renew(app)
    }

    Function("seenPanicRefused") {
      val app = context?.applicationContext ?: return@Function Unit
      Panic.seenRefused(app)
    }

    Function("wipeNow") {
      val app = context?.applicationContext ?: return@Function false
      Panic.wipe(app, appContext.currentActivity)
      true
    }

    // The apps Erevos tells as it wipes (Panic.kt), as Fasouli: those on the phone, and choosing one.
    Function("panicResponders") {
      val app = context?.applicationContext ?: return@Function emptyList<Map<String, Any>>()
      Panic.responders(app)
    }

    Function("tellPanicApp") { pkg: String, on: Boolean ->
      val activity = appContext.currentActivity ?: return@Function false
      Panic.tell(activity, pkg, on)
    }

    // Erevos to a phone nearby with no internet (NearbyApk.kt): giving this one over the Wi-Fi or
    // hotspot, and, in Updates, taking one. Each runs on a thread of its own, as reading the
    // package and the download take long and would hold every other module's calls.
    AsyncFunction("giveAppStart") { words: Map<String, String>, promise: Promise ->
      val app = context?.applicationContext ?: return@AsyncFunction promise.resolve(mapOf("error" to "network"))
      Thread {
        try {
          promise.resolve(NearbyApk.start(app, words))
        } catch (e: Exception) {
          promise.reject("ERR_GIVE_APP", e.message ?: "", e)
        }
      }.start()
    }

    Function("giveAppStop") {
      NearbyApk.stop()
    }

    Function("giveAppState") {
      NearbyApk.state()
    }

    AsyncFunction("takeNearbyApp") { host: String, port: Int, token: String, sha256: String, promise: Promise ->
      val app = context?.applicationContext ?: return@AsyncFunction promise.resolve(mapOf("error" to "network"))
      Thread {
        try {
          promise.resolve(NearbyApk.receive(app, host, port, token, sha256))
        } catch (e: Exception) {
          promise.reject("ERR_TAKE_APP", e.message ?: "", e)
        }
      }.start()
    }

    Function("nearbyAppProgress") {
      NearbyApk.progress()
    }

    Function("cancelNearbyApp") {
      NearbyApk.cancelReceiving()
    }

    // A voice message as Ogg/Opus (Voice.kt), on Android 10 and later: starting it (the file's uri,
    // or null where it cannot, and lib/audio.ts records AAC with expo-audio instead), how loud it
    // is as it goes, and stopping it (the finished file's uri, or null).
    AsyncFunction("voiceStart") { talk: Boolean ->
      val app = context?.applicationContext ?: return@AsyncFunction null
      Voice.start(app, talk)
    }

    Function("voiceLevel") {
      Voice.level()
    }

    AsyncFunction("voiceStop") {
      Voice.stop()
    }

    // A voice message's voice changed (lib/voice-change.ts): the sound of a recording as samples,
    // and samples made a recording again.
    AsyncFunction("voiceSamples") { uri: String -> Voice.samples(uri) }

    AsyncFunction("voiceOpus") { pcm: ByteArray, rate: Int ->
      val app = context?.applicationContext ?: return@AsyncFunction null
      Voice.opus(app, pcm, rate)
    }

    // Starts looking for where the phone is, once: what it finds comes as onPlace. Says "" when it
    // started, "permission" when Erevos may not use the location, "off" when the phone's location
    // is off, "approximate" when Erevos may use only the approximate location and the phone has no
    // way on to find that (on many phones without Google, only the satellites find it).
    Function("findPlace") {
      val app = context?.applicationContext ?: return@Function "off"
      val manager = app.getSystemService(LocationManager::class.java) ?: return@Function "off"
      val fine = app.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
      val coarse = app.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
      if (!fine && !coarse) return@Function "permission"
      val on = { provider: String -> runCatching { manager.isProviderEnabled(provider) }.getOrDefault(false) }
      // Every way the phone has, at once: the satellites alone find nothing indoors, and the
      // network alone is off on many phones without Google.
      val providers = buildList {
        if (fine && on(LocationManager.GPS_PROVIDER)) add(LocationManager.GPS_PROVIDER)
        if (on(LocationManager.NETWORK_PROVIDER)) add(LocationManager.NETWORK_PROVIDER)
        if (Build.VERSION.SDK_INT >= 31 && manager.hasProvider(LocationManager.FUSED_PROVIDER) && on(LocationManager.FUSED_PROVIDER)) {
          add(LocationManager.FUSED_PROVIDER)
        }
      }
      if (providers.isEmpty()) {
        val locationOn = if (Build.VERSION.SDK_INT >= 28) manager.isLocationEnabled else on(LocationManager.GPS_PROVIDER)
        return@Function if (!fine && locationOn) "approximate" else "off"
      }
      val look = Look(manager)
      main.post {
        looking?.end(null, quiet = true)
        looking = look
        look.start(providers)
      }
      ""
    }

    // Stops looking for where the phone is, with nothing said: the owner closed the sheet.
    Function("stopPlace") {
      main.post { looking?.end(null, quiet = true) }
    }
  }

  // The look going on, if any; touched on the main thread only.
  private var looking: Look? = null

  // One look, on every way at once, on the main thread: a place found a moment ago, or the first
  // found near enough, or the nearest found in the few seconds after the first, or, with none in
  // time, the last the phone found in the minutes before, said with its age.
  private inner class Look(private val manager: LocationManager) {
    private var done = false
    private var best: Location? = null
    private val listeners = mutableListOf<LocationListener>()
    private val giveUp = Runnable { end(best ?: lastFound(STALE_NANOS)) }
    private val enough = Runnable { end(best) }

    fun start(providers: List<String>) {
      val recent = lastFound(FRESH_NANOS)
      if (recent != null && near(recent)) {
        end(recent)
        return
      }
      for (provider in providers) {
        val listener = object : LocationListener {
          override fun onLocationChanged(location: Location) = found(location)
          @Deprecated("Called on Android before 10 only.")
          override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
          override fun onProviderEnabled(provider: String) {}
          override fun onProviderDisabled(provider: String) {}
        }
        try {
          manager.requestLocationUpdates(provider, 0L, 0f, listener, Looper.getMainLooper())
          listeners += listener
        } catch (e: SecurityException) {
          // Taken away since findPlace looked: the other ways may still find it.
        } catch (e: IllegalArgumentException) {
          // Gone since findPlace looked.
        }
      }
      if (listeners.isEmpty()) {
        end(recent ?: lastFound(STALE_NANOS))
        return
      }
      main.postDelayed(giveUp, WAIT_MS)
      if (recent != null) found(recent)
    }

    // A place found: one near enough ends the look; the first rough one waits a little for a nearer.
    private fun found(location: Location) {
      if (done) return
      val first = best == null
      if (first || metres(location) < metres(best!!)) best = location
      if (near(location)) end(location)
      else if (first) main.postDelayed(enough, BETTER_MS)
    }

    // Ends the look: lets go of every way, and says what it found, unless stopped.
    fun end(location: Location?, quiet: Boolean = false) {
      if (done) return
      done = true
      main.removeCallbacks(giveUp)
      main.removeCallbacks(enough)
      listeners.forEach { runCatching { manager.removeUpdates(it) } }
      listeners.clear()
      if (looking === this) looking = null
      if (quiet) return
      val age = if (location == null) 0L else (SystemClock.elapsedRealtimeNanos() - location.elapsedRealtimeNanos) / 1_000_000_000L
      sendEvent(
        "onPlace",
        if (location == null) mapOf("error" to "timeout")
        else mapOf(
          "lat" to location.latitude,
          "lon" to location.longitude,
          "acc" to if (location.hasAccuracy()) location.accuracy.toDouble() else -1.0,
          "age" to age.coerceAtLeast(0L).toDouble(),
        ),
      )
    }

    // The nearest place any way found in the last `within` nanoseconds, or none.
    private fun lastFound(within: Long): Location? {
      val now = SystemClock.elapsedRealtimeNanos()
      return manager.allProviders
        .mapNotNull { runCatching { manager.getLastKnownLocation(it) }.getOrNull() }
        .filter { now - it.elapsedRealtimeNanos in 0 until within }
        .minByOrNull { metres(it) }
    }
  }

  private fun metres(location: Location): Float = if (location.hasAccuracy()) location.accuracy else Float.MAX_VALUE

  private fun near(location: Location): Boolean = location.hasAccuracy() && location.accuracy <= NEAR_METRES

  companion object {
    // How long one look waits for a place; how long, after a rough one, for a nearer; how old a
    // place the phone found may be to be taken at once, and, when nothing came, at all.
    private const val WAIT_MS = 60_000L
    private const val BETTER_MS = 10_000L
    private const val FRESH_NANOS = 120_000_000_000L
    private const val STALE_NANOS = 600_000_000_000L
    // A place this near (metres) ends the look.
    private const val NEAR_METRES = 50f
  }
}
