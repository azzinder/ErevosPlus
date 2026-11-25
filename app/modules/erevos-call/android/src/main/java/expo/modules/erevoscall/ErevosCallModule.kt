// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscall

import android.app.Activity
import android.app.ActivityManager
import android.app.Application
import android.app.AlarmManager
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import android.view.WindowManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Android's sound picker (pickSound), apart from erevos-contacts' 7301.
private const val SOUND = 7311

// The reminders' notice channel, made by modules/erevos-device (Reminders.kt).
private const val REMINDERS_CHANNEL = "erevos-reminders"

// The notice channels openSettings opens by name.
private val CHANNELS = mapOf(
  "calls" to Notices.CALLS_CHANNEL,
  "messages" to Notices.MESSAGES_CHANNEL,
  "quiet" to Notices.QUIET_CHANNEL,
  "own" to Notices.OWN_CHANNEL,
  "reminders" to REMINDERS_CHANNEL,
)

// The phone's side of a call that WebRTC leaves to the app: the sound set up for talking, through
// the earpiece, the loudspeaker or a headset, wired or Bluetooth, as chosen (CallOutputs), the
// screen off while the phone is at the ear, and on while a
// call shows. Everything goes back as it was when the call ends. Also what lets a call ring while
// Erevos is in the background: the service that keeps it running (ReceiveService), the ringtone,
// the call notice over the lock screen and the notice that messages came (Notices), and the
// settings Android asks the user for.
class ErevosCallModule : Module() {
  private var modeBefore: Int? = null
  private var proximity: PowerManager.WakeLock? = null
  private var ringtone: Ringtone? = null
  private var keepTask: Int? = null
  // The screen kept on a while for a call that rings (wakeForRing).
  private var ringWake: PowerManager.WakeLock? = null
  // Before Android 9 a ringtone cannot loop: it is played again each time it ends, until it stops.
  private val ringLoop = Handler(Looper.getMainLooper())
  private var keepRinging: Runnable? = null
  // The answer to pickSound, while Android's picker shows.
  private var picking: Promise? = null

  // Whether the phone shows its screen saver (Android's "dream", as while charging): Erevos's
  // screen, under it, cannot be seen, and Android shows no notice over it, so a call that rings
  // then shows its notice, and wakes the screen, which ends the screen saver.
  private var dreaming = false
  private val dreams = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      dreaming = intent.action == Intent.ACTION_DREAMING_STARTED
    }
  }

  // The phone's default network as last seen, null once lost: a new one tells the app, whose
  // waits at the relay on the old one may hang with no error (lib/network-change.ts).
  @Volatile private var network: Network? = null
  private val networks = object : ConnectivityManager.NetworkCallback() {
    override fun onAvailable(found: Network) {
      if (found == network) return
      network = found
      runCatching { sendEvent("onNetwork", mapOf()) }
    }
    override fun onLost(gone: Network) {
      if (gone == network) network = null
    }
  }

  // Whether a call shows over the lock screen. Erevos swiped away from the recent apps has no
  // screen when a call rings: the one the call notice brings up then shows over it too.
  private var overLock = false
  private val created = object : Application.ActivityLifecycleCallbacks {
    override fun onActivityCreated(activity: Activity, saved: Bundle?) {
      if (overLock) setOverLock(activity, true)
    }
    override fun onActivityStarted(activity: Activity) {}
    override fun onActivityResumed(activity: Activity) {}
    override fun onActivityPaused(activity: Activity) {}
    override fun onActivityStopped(activity: Activity) {}
    override fun onActivitySaveInstanceState(activity: Activity, state: Bundle) {}
    override fun onActivityDestroyed(activity: Activity) {}
  }

  private val context: Context?
    get() = appContext.reactContext

  // Where a call's sound goes, and its changes told to the screen.
  private val outputs = CallOutputs({ runCatching { sendEvent("onOutputs", mapOf()) } }, { atEar(it) })

  private val audio: AudioManager?
    get() = context?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager

  override fun definition() = ModuleDefinition {
    Name("ErevosCall")

    Events("onNetwork", "onSleepLook", "onOutputs")

    OnCreate {
      (context?.applicationContext as? Application)?.registerActivityLifecycleCallbacks(created)
      // Nothing rings yet in a new start: an "Incoming call" notice still there is from an Erevos
      // Android closed while it rang.
      context?.let { runCatching { Notices.stopRinging(it) } }
      runCatching {
        val filter = IntentFilter().apply {
          addAction(Intent.ACTION_DREAMING_STARTED)
          addAction(Intent.ACTION_DREAMING_STOPPED)
        }
        val app = context?.applicationContext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) app?.registerReceiver(dreams, filter, Context.RECEIVER_NOT_EXPORTED)
        else app?.registerReceiver(dreams, filter)
      }
      // The network as it is now tells nothing; only a change does.
      runCatching {
        val connectivity = context?.applicationContext?.getSystemService(ConnectivityManager::class.java)
        if (connectivity != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
          network = connectivity.activeNetwork
          connectivity.registerDefaultNetworkCallback(networks)
        }
      }
    }

    OnDestroy {
      (context?.applicationContext as? Application)?.unregisterActivityLifecycleCallbacks(created)
      runCatching { context?.applicationContext?.unregisterReceiver(dreams) }
      runCatching { context?.applicationContext?.getSystemService(ConnectivityManager::class.java)?.unregisterNetworkCallback(networks) }
      keepRinging?.let(ringLoop::removeCallbacks)
      keepRinging = null
    }

    // The sound picked in Android's picker: its address, '' for the picker's Default, or null if
    // the owner went back.
    OnActivityResult { _, payload ->
      if (payload.requestCode != SOUND) return@OnActivityResult
      val promise = picking ?: return@OnActivityResult
      picking = null
      if (payload.resultCode != Activity.RESULT_OK) {
        promise.resolve(null)
        return@OnActivityResult
      }
      val uri = payload.data?.let { pickedUri(it) }
      promise.resolve(if (uri == null || RingtoneManager.isDefault(uri)) "" else uri.toString())
    }

    Function("start") { speaker: Boolean ->
      val manager = audio ?: return@Function
      if (modeBefore == null) modeBefore = manager.mode
      manager.mode = AudioManager.MODE_IN_COMMUNICATION
      outputs.start(manager, speaker)
      keepScreenOn(true)
    }

    // The loudspeaker, or not: then a headset when one is connected, else the earpiece.
    Function("setSpeaker") { speaker: Boolean ->
      audio?.let { outputs.setSpeaker(it, speaker) }
    }

    // Where the call's sound can go now (CallOutputs.kt), each by an id that setOutput takes.
    Function("outputs") {
      val manager = audio ?: return@Function listOf<Map<String, String>>()
      outputs.list(manager).map { mapOf("id" to it.id, "kind" to it.kind, "name" to it.name) }
    }

    // The one the sound goes to now, by its id; null when not known.
    Function("output") {
      val manager = audio ?: return@Function null
      outputs.current(manager)?.id
    }

    Function("setOutput") { id: String ->
      audio?.let { outputs.choose(it, id) }
    }

    Function("stop") {
      audio?.let { manager ->
        outputs.stop(manager)
        modeBefore?.let { manager.mode = it }
      }
      modeBefore = null
      atEar(false)
      keepScreenOn(false)
    }

    // Before the first connection to the relay: no cookies, and so no WebView in Erevos (NoCookies).
    Function("noCookies") {
      NoCookies.apply(appContext.reactContext)
    }

    Function("startReceiving") {
      context?.let {
        try {
          ReceiveService.start(it)
        } catch (e: Exception) {
          // Refused, as Erevos already left the screen (Android 12 and later): a quiet notice says
          // it receives nothing, until it shows and starts again (lib/background.ts).
          Notices.stopped(it)
          throw e
        }
      }
      keepTimers(true)
      null
    }

    // Battery mode Sleep: the service lets the phone sleep, and an alarm wakes it to look.
    Function("lookDone") {
      SleepWake.lookDone()
    }

    // Battery mode Light sleep: an answer from the relay woke the phone, which stays awake to take
    // what came, until lookDone or the hold's own time; and how often the alarm goes, seconds.
    Function("holdAwake") {
      context?.let { SleepWake.hold(it) }
      null
    }

    Function("setLookEvery") { seconds: Int ->
      SleepWake.everyMs = seconds.coerceIn(60, 900) * 1000L
      null
    }

    Function("setSleepy") { on: Boolean ->
      // The alarm of the battery mode Sleep tells the app each time it wakes the phone.
      SleepWake.tell = if (on) ({ runCatching { sendEvent("onSleepLook", mapOf()) } }) else null
      context?.let { ReceiveService.setSleepy(it, on) }
      null
    }

    // Whether Erevos starts by itself as the phone turns on (BootStart): what the setting shows,
    // the owner's own choice (null while they made none), the choice made, and whether Erevos
    // receives in the background at all, which starting by itself is for.
    Function("bootStart") {
      context?.let { BootStart.shown(it) } ?: false
    }

    Function("bootChosen") {
      context?.let { BootStart.chosen(it) }
    }

    Function("setBootStart") { on: Boolean ->
      context?.let { BootStart.set(it, on) }
      null
    }

    Function("wantBootStart") { wanted: Boolean ->
      context?.let { BootStart.want(it, wanted) }
      null
    }

    Function("stopReceiving") {
      keepTimers(false)
      context?.let { ReceiveService.stop(it) }
      null
    }

    // The space that received closed and Erevos left the screen locked: a quiet notice says it
    // receives nothing until it is open again; gone when it shows again or receives.
    Function("setLocked") { on: Boolean ->
      context?.let { if (on) Notices.stopped(it, locked = true) else Notices.clearStopped(it) }
      null
    }

    // A call rings here: the phone's ringtone, or the chat's own (`tone`, its address; '' for
    // none), as the phone's ring volume and silent mode allow, and with `notice` the call notice
    // too, shown over the lock screen; also while the screen saver shows, over Erevos too. A screen
    // that is off, or shows the screen saver, wakes. Do not disturb keeps it quiet, and the screen
    // dark, as it keeps back the call notice (Notices.callsThrough).
    Function("ring") { video: Boolean, notice: Boolean, tone: String? ->
      val context = context ?: return@Function
      val through = Notices.callsThrough(context)
      // A ringtone that fails to play still leaves the notice, the screen over the lock and its wake.
      if (tone != "" && through && ringtone?.isPlaying != true) runCatching {
        val uri: Uri? = RingtoneManager.getActualDefaultRingtoneUri(context, RingtoneManager.TYPE_RINGTONE)
          ?: Settings.System.DEFAULT_RINGTONE_URI
        // A chat's own message sound that still plays stops for the ring.
        Notices.stopChime()
        // A chat's own ringtone that is gone from the phone rings as the phone's.
        val own = tone?.let { Uri.parse(it) }?.takeIf { Notices.opens(context, it) }
          ?.let { runCatching { RingtoneManager.getRingtone(context, it) }.getOrNull() }
        ringtone = (own ?: uri?.let { RingtoneManager.getRingtone(context, it) })?.also {
          it.audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) it.isLooping = true
          it.play()
          if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            keepRinging?.let(ringLoop::removeCallbacks)
            val playing = it
            keepRinging = object : Runnable {
              override fun run() {
                if (ringtone !== playing) return
                if (!playing.isPlaying) runCatching { playing.play() }
                ringLoop.postDelayed(this, 1000)
              }
            }.also { again -> ringLoop.postDelayed(again, 1000) }
          }
        }
      }
      if (notice || dreaming) Notices.ring(context, video)
      showOverLock(true)
      if (through) wakeForRing(context)
    }

    Function("stopRinging") {
      keepRinging?.let(ringLoop::removeCallbacks)
      keepRinging = null
      ringtone?.stop()
      ringtone = null
      ringWake?.let { if (it.isHeld) it.release() }
      ringWake = null
      context?.let { Notices.stopRinging(it) }
      null
    }

    // Messages came: a notice that says how many, no more, without sound when the last came
    // without (`quiet`), or with the sound of the chat it came in (`sound`, its address).
    Function("tellMessages") { count: Int, quiet: Boolean?, sound: String? ->
      context?.let { Notices.messages(it, count, quiet == true, sound) }
      null
    }

    // Some were read in Erevos: the notice, if it shows, says how many are left, without sound.
    Function("recountMessages") { count: Int ->
      context?.let { Notices.recountMessages(it, count) }
      null
    }

    // A message came where Erevos shows it on the screen: the messages sound, or the chat's own
    // (`sound`, its address), and no notice.
    Function("chime") { sound: String? ->
      context?.let { Notices.chime(it, sound) }
      null
    }

    // Android's own picker of sounds, for a chat's messages ("message") or its calls ("ring"),
    // with the one the chat has now (`current`) chosen in it.
    AsyncFunction("pickSound") { kind: String, current: String?, promise: Promise ->
      val activity = appContext.currentActivity ?: throw IllegalStateException("No activity")
      if (picking != null) throw IllegalStateException("A sound is being picked already")
      val ring = kind == "ring"
      val default = if (ring) Settings.System.DEFAULT_RINGTONE_URI else Settings.System.DEFAULT_NOTIFICATION_URI
      val intent = Intent(RingtoneManager.ACTION_RINGTONE_PICKER)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, if (ring) RingtoneManager.TYPE_RINGTONE else RingtoneManager.TYPE_NOTIFICATION)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_DEFAULT_URI, default)
        .putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, current?.takeIf { it.isNotEmpty() }?.let(Uri::parse) ?: default)
      picking = promise
      try {
        activity.startActivityForResult(intent, SOUND)
      } catch (e: Exception) {
        picking = null
        promise.reject("ERR_SOUND", e.message, e)
      }
    }

    // The name a sound has on this phone; '' if it has none here, or is gone from it (Android then
    // names it by the end of its address).
    AsyncFunction("soundName") { uri: String ->
      val context = context ?: return@AsyncFunction ""
      try {
        val sound = Uri.parse(uri)
        if (!Notices.opens(context, sound)) return@AsyncFunction ""
        // Read, then let go: a Ringtone readies a player for the sound.
        val title = RingtoneManager.getRingtone(context, sound)?.let { ringtone ->
          try {
            ringtone.getTitle(context)
          } finally {
            ringtone.stop()
          }
        } ?: ""
        if (title == sound.lastPathSegment) "" else title
      } catch (_: Exception) {
        ""
      }
    }

    // The app's language (app/lib/i18n.ts), kept for the notices, which show while the app is closed.
    Function("setLanguage") { lang: String ->
      context?.let { Notices.setLanguage(it, lang) }
      null
    }

    Function("clearMessages") {
      context?.let { Notices.clearMessages(it) }
      null
    }

    // While a call shows, Erevos may show over the lock screen and wake the screen; only then.
    Function("showOverLock") { on: Boolean ->
      showOverLock(on)
    }

    // What Android lets Erevos do for ringing in the background: show notices, the call notice
    // among them, show a call over the lock screen, keep running when the battery saver would stop
    // it, and use mobile data while in the background (Data Saver). Also exact alarms, and who made
    // the phone, whose own settings may stop apps in the background too (lib/permissions.ts).
    // Then how the call and message notices are set (off, silent, hidden on the lock screen, through
    // Do Not Disturb), battery use set to Restricted, "Pause app activity if unused", and battery
    // saver, Do Not Disturb and the ringer as they are now. What this Android cannot tell is left out.
    // The kind of network the phone is on now, for Tor's Automatic bridges (lib/tor.ts), which
    // learns the way that works on each: nothing of the network itself, only its kind.
    Function("networkKind") {
      val connectivity = context?.applicationContext?.getSystemService(ConnectivityManager::class.java)
      val caps = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) connectivity?.let { it.getNetworkCapabilities(it.activeNetwork) } else null
      when {
        caps == null -> "other"
        caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "wifi"
        caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "cellular"
        caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "ethernet"
        else -> "other"
      }
    }

    // Whether Android says the phone has internet now (a network it checked reaches it): the bridge
    // asks a phone nearby only when it does not (lib/bridge.ts).
    Function("hasInternet") {
      val connectivity = context?.applicationContext?.getSystemService(ConnectivityManager::class.java) ?: return@Function true
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return@Function connectivity.activeNetworkInfo?.isConnected == true
      val caps = connectivity.getNetworkCapabilities(connectivity.activeNetwork) ?: return@Function false
      caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }

    Function("backgroundState") {
      val context = context ?: return@Function mapOf("notices" to false, "fullScreen" to false, "battery" to false)
      val notices = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      val power = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      val network = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
      val alarms = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val sdk = Build.VERSION.SDK_INT
      val state = mutableMapOf<String, Any>(
        "notices" to (sdk < Build.VERSION_CODES.N || notices.areNotificationsEnabled()),
        "calls" to Notices.callsShown(context),
        "fullScreen" to (sdk < Build.VERSION_CODES.UPSIDE_DOWN_CAKE || notices.canUseFullScreenIntent()),
        "battery" to (sdk < Build.VERSION_CODES.M || power.isIgnoringBatteryOptimizations(context.packageName)),
        "data" to (sdk < Build.VERSION_CODES.N || network.restrictBackgroundStatus != ConnectivityManager.RESTRICT_BACKGROUND_STATUS_ENABLED),
        "alarms" to (sdk < Build.VERSION_CODES.S || alarms.canScheduleExactAlarms()),
        "maker" to Build.MANUFACTURER.lowercase(),
        "saver" to power.isPowerSaveMode,
      )
      Notices.channelState(context, Notices.CALLS_CHANNEL)?.let { state["callChannel"] = it }
      Notices.channelState(context, Notices.MESSAGES_CHANNEL)?.let { state["messageChannel"] = it }
      // The message notice's other two channels, without sound and with a chat's own sound, which
      // keep the number on the icon too; and the reminders' (modules/erevos-device Reminders.kt),
      // once its first reminder made it.
      Notices.channelState(context, Notices.QUIET_CHANNEL)?.let { state["quietChannel"] = it }
      Notices.channelState(context, Notices.OWN_CHANNEL)?.let { state["ownChannel"] = it }
      Notices.channelState(context, REMINDERS_CHANNEL)?.let { state["reminderChannel"] = it }
      lockScreenShown(context)?.let { state["lockScreen"] = it }
      if (sdk >= Build.VERSION_CODES.M) state["dnd"] = notices.currentInterruptionFilter > NotificationManager.INTERRUPTION_FILTER_ALL
      if (sdk >= Build.VERSION_CODES.P) {
        (context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager)?.let { state["restricted"] = it.isBackgroundRestricted }
      }
      if (sdk >= Build.VERSION_CODES.R) {
        state["unusedExempt"] = context.packageManager.isAutoRevokeWhitelisted
      }
      audio?.let {
        state["ringer"] = it.ringerMode
        state["ringVolume"] = it.getStreamVolume(AudioManager.STREAM_RING)
      }
      state
    }

    // Asks Android to leave Erevos out of battery saving, or opens the setting to show calls over
    // the lock screen. Android shows its own question or screen; nothing changes without the user.
    Function("askBattery") {
      val context = context
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || context == null) return@Function null
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:${context.packageName}"))
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      null
    }

    Function("askFullScreen") {
      val context = context
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE || context == null) return@Function null
      val intent = Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:${context.packageName}"))
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      null
    }

    // Android's screen for one of the settings backgroundState reads: Erevos's notices, its call
    // or message notice (or that notice without sound or with a chat's own), its reminder notice, its mobile data in the background, its exact alarms, "Remove permissions
    // if app isn't used" (on Android 11; later it is on Erevos's page), battery saver, the sound
    // settings; anything else, or a phone without that screen, opens Erevos's page in Android's
    // settings ("app"), where Restricted battery use is too. False if none opened.
    Function("openSettings") { which: String ->
      val context = context ?: return@Function false
      val app = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${context.packageName}"))
      val sdk = Build.VERSION.SDK_INT
      val intent = when {
        which == "notices" && sdk >= Build.VERSION_CODES.O ->
          Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
        which in CHANNELS && sdk >= Build.VERSION_CODES.O ->
          Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
            .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
            .putExtra(Settings.EXTRA_CHANNEL_ID, CHANNELS[which])
        which == "unused" && sdk == Build.VERSION_CODES.R ->
          Intent(Intent.ACTION_AUTO_REVOKE_PERMISSIONS, Uri.parse("package:${context.packageName}"))
        which == "saver" -> Intent(Settings.ACTION_BATTERY_SAVER_SETTINGS)
        which == "sound" -> Intent(Settings.ACTION_SOUND_SETTINGS)
        which == "data" && sdk >= Build.VERSION_CODES.N ->
          Intent(Settings.ACTION_IGNORE_BACKGROUND_DATA_RESTRICTIONS_SETTINGS, Uri.parse("package:${context.packageName}"))
        which == "alarms" && sdk >= Build.VERSION_CODES.S ->
          Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:${context.packageName}"))
        else -> app
      }
      open(context, intent) || open(context, app)
    }

    // The phone maker's own screen for apps that may run in the background, where it has one that
    // is known (dontkillmyapp.com): Huawei's App launch, Xiaomi's Autostart and the like. False
    // when none opened; lib/permissions.ts then opens Erevos's page in Android's settings.
    Function("openMaker") {
      val context = context ?: return@Function false
      makerScreens(Build.MANUFACTURER.lowercase()).any { open(context, Intent().setComponent(it)) }
    }
  }

  @Suppress("DEPRECATION")
  private fun pickedUri(data: Intent): Uri? =
    if (Build.VERSION.SDK_INT >= 33) data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI, Uri::class.java) else data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)

  // Whether the phone shows notices on its lock screen at all, a setting of the whole phone that
  // not every Android lets an app read: then null, and the check goes by the channels alone.
  private fun lockScreenShown(context: Context): Boolean? =
    try {
      Settings.Secure.getInt(context.contentResolver, "lock_screen_show_notifications", 1) != 0
    } catch (e: Exception) {
      null
    }

  private fun open(context: Context, intent: Intent): Boolean =
    try {
      context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      true
    } catch (e: Exception) {
      // Not on this phone, or not open to other apps.
      false
    }

  // Each maker's screens, newest first; a phone has at most one of them.
  private fun makerScreens(maker: String): List<ComponentName> = when (maker) {
    "huawei", "honor" -> listOf(
      ComponentName("com.hihonor.systemmanager", "com.hihonor.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
      ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
      ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.appcontrol.activity.StartupAppControlActivity"),
      ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"),
    )
    "xiaomi", "redmi", "poco" -> listOf(
      ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"),
    )
    "oppo", "realme", "oneplus" -> listOf(
      ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"),
      ComponentName("com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"),
      ComponentName("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity"),
      ComponentName("com.oneplus.security", "com.oneplus.security.chainlaunch.view.ChainLaunchAppListActivity"),
    )
    "vivo", "iqoo" -> listOf(
      ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"),
      ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager"),
      ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"),
    )
    "samsung" -> listOf(
      ComponentName("com.samsung.android.lool", "com.samsung.android.sm.battery.ui.BatteryActivity"),
      ComponentName("com.samsung.android.sm", "com.samsung.android.sm.battery.ui.BatteryActivity"),
    )
    "asus" -> listOf(
      ComponentName("com.asus.mobilemanager", "com.asus.mobilemanager.autostart.AutoStartActivity"),
      ComponentName("com.asus.mobilemanager", "com.asus.mobilemanager.entry.FunctionActivity"),
    )
    else -> emptyList()
  }

  // React Native stops the app's timers while it is in the background, unless a background task
  // runs: this one runs (lib/background.ts) while Erevos receives in the background, so it goes on
  // looking at the relay.
  private fun keepTimers(on: Boolean) {
    val react = appContext.reactContext as? ReactContext ?: return
    UiThreadUtil.runOnUiThread {
      val tasks = HeadlessJsTaskContext.getInstance(react)
      keepTask?.let { tasks.finishTask(it) }
      keepTask = null
      if (on) {
        keepTask = runCatching { tasks.startTask(HeadlessJsTaskConfig(KEEP_TASK, Arguments.createMap(), 0, true)) }.getOrNull()
      }
    }
  }

  // Turns the screen on, if it is off or shows the screen saver, for as long as a call rings at
  // most: Android ends the screen saver as the screen wakes, and shows the call notice, or
  // Erevos's own call screen when it was in front.
  @Suppress("DEPRECATION")
  private fun wakeForRing(context: Context) {
    val power = context.getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return
    if (power.isInteractive && !dreaming) return
    runCatching {
      ringWake?.let { if (it.isHeld) it.release() }
      ringWake = power.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP, "erevos:ring").also {
        it.setReferenceCounted(false)
        it.acquire(RING_WAKE_MS)
      }
    }
  }

  private fun showOverLock(on: Boolean) {
    overLock = on
    val activity = appContext.currentActivity ?: return
    activity.runOnUiThread { setOverLock(activity, on) }
  }

  private fun setOverLock(activity: Activity, on: Boolean) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity.setShowWhenLocked(on)
      activity.setTurnScreenOn(on)
    } else {
      @Suppress("DEPRECATION")
      val flags = WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      if (on) activity.window.addFlags(flags) else activity.window.clearFlags(flags)
    }
  }

  private fun atEar(on: Boolean) {
    if (on) {
      if (proximity?.isHeld == true) return
      val power = context?.getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return
      if (!power.isWakeLockLevelSupported(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK)) return
      proximity = power.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "erevos:call").also {
        it.setReferenceCounted(false)
        it.acquire(4 * 60 * 60 * 1000L)
      }
    } else {
      proximity?.let { if (it.isHeld) it.release() }
      proximity = null
    }
  }

  private fun keepScreenOn(on: Boolean) {
    val activity = appContext.currentActivity ?: return
    activity.runOnUiThread {
      if (on) {
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      } else {
        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }
    }
  }

  companion object {
    const val KEEP_TASK = "ErevosReceive"
    // As long as a call rings (lib/call.ts RING_MS).
    const val RING_WAKE_MS = 45_000L
  }
}
