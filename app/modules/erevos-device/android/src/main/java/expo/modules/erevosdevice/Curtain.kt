// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosdevice

import android.app.Activity
import android.app.Application
import android.graphics.PixelFormat
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import com.facebook.react.uimanager.util.ReactFindViewUtil
import java.lang.ref.WeakReference
import java.util.WeakHashMap

// The curtain over a space that has a password lock (lib/curtain.ts, app/_layout.tsx).
//
// Such a space locks once Erevos has been out of sight for a while. The app's own code decides
// that and draws the password screen, and it runs only after Android has put the last screen back:
// for a second or two whoever held the phone saw the chats. So the phone itself covers them. While
// a space with a password lock shows (arm), a plain cover in the look's ground colour goes over its
// screens the moment they are out of sight, where nobody sees it come. As they come back Android
// draws the cover first. Back sooner than the lock's time, it goes before anything is drawn, as if
// it never was. Back later, it stays until the app says its password screen is drawn (lift). The
// lock button puts it there at once (lower).
//
// Two covers, each for what the other cannot do. A view inside the activity's own window lies over
// all its screens, and goes in the same drawing that shows what replaced them, so nothing of them
// is seen between. A window of its own lies over the activity's other windows, the ones React
// Native's Modal opens (a sheet, a photo shown whole), which a view in the first window is under.
//
// The time away is counted on the clock nobody can set (elapsedRealtime), from when Erevos stopped
// being in front, and the app takes it from here (takeBack), so both decide alike.
//
// Everything here runs on the main thread; what the app's thread reads is marked volatile.
internal object Curtain : Application.ActivityLifecycleCallbacks {
  // What the app marks a screen with that is not a space's (lib/curtain.ts CURTAIN_END): once one
  // is drawn, the cover over it may go.
  private const val END = "erevos-curtain-end"

  // How long the cover waits for that screen once the app asked for the lift, with the screens in
  // sight, before it goes anyway: an app that never draws it must not stay covered for good.
  private const val WAIT_MS = 2500L

  // How many drawings the cover stays after that screen was found laid out: the first drawing
  // after Erevos comes back may be skipped by Android.
  private const val FRAMES_AFTER = 2

  /** What happened as the screens came back: how long Erevos was away, ms, and whether the cover stayed. */
  class Back(val away: Long, val kept: Boolean)

  private class Seen {
    var pausedAt = 0L
    var stopped = false
  }

  private val main = Handler(Looper.getMainLooper())
  private var registered = false
  private val seen = WeakHashMap<Activity, Seen>()

  // The activity the app's screens show in.
  private var stage: WeakReference<Activity>? = null
  private var armed = false
  private var afterMs = 0L
  private var colour = 0xFF000000.toInt()

  private var cover: View? = null
  private var pane: View? = null

  // The app asked for the cover (lower), or the phone kept it as the screens came back: only the app lifts it.
  private var held = false

  // The app asked for the lift once the screen marked END is drawn.
  private var waiting = false
  private var poll: Choreographer.FrameCallback? = null

  @Volatile private var down = false
  @Volatile private var back: Back? = null

  fun register(app: Application?) {
    if (app == null || registered) return
    registered = true
    app.registerActivityLifecycleCallbacks(this)
  }

  /**
   * From now on the cover goes over the screens as they go out of sight, and stays when they come
   * back after more than `after` ms; with `after` under 0, no longer. A cover already there is left
   * as it is. Armed while the screens are out of sight, they are covered now.
   */
  fun arm(activity: Activity?, after: Long, ground: Int) {
    main.post {
      if (activity != null) onStage(activity)
      val here = stage?.get()
      armed = after >= 0 && here != null
      if (after >= 0) {
        afterMs = after
        colour = ground or 0xFF000000.toInt()
      }
      if (armed && here != null && stateOf(here).stopped && !down) put(here)
    }
  }

  /** Covers the screens now, until the app lifts it. */
  fun lower(activity: Activity?) {
    main.post {
      if (activity != null) onStage(activity)
      val here = stage?.get() ?: return@post
      waiting = false
      held = true
      put(here)
    }
  }

  /**
   * Takes the cover away: at once, or with `onScreen` once a screen marked END is drawn under it,
   * which waits for the screens to be in sight.
   */
  fun lift(onScreen: Boolean) {
    main.post {
      if (!down) {
        held = false
        waiting = false
        return@post
      }
      if (!onScreen) {
        take()
        return@post
      }
      held = true
      waiting = true
      val here = stage?.get()
      if (here != null && !stateOf(here).stopped) watch()
    }
  }

  /** What happened as the screens last came back, once: null when they were not out of sight since. */
  fun takeBack(): Map<String, Any>? {
    val was = back ?: return null
    back = null
    return mapOf("away" to was.away.toDouble(), "kept" to was.kept)
  }

  fun isDown(): Boolean = down

  private fun stateOf(activity: Activity): Seen = seen.getOrPut(activity) { Seen() }

  private fun onStage(activity: Activity) {
    if (stage?.get() === activity) return
    // A cover over screens that are gone goes with them.
    take()
    back = null
    stage = WeakReference(activity)
  }

  private fun put(activity: Activity) {
    if (down || activity.isFinishing || activity.isDestroyed) return
    val ground = colour
    runCatching {
      val decor = activity.window?.decorView as? ViewGroup ?: return@runCatching
      val view = plain(activity, ground)
      decor.addView(view, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
      cover = view
    }
    runCatching {
      val view = plain(activity, ground)
      val params = WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.TYPE_APPLICATION,
        // It takes touches and no keys: the keyboard and the bars stay as the activity has them.
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
          WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
          WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
        PixelFormat.OPAQUE,
      )
      params.windowAnimations = 0
      // Under the bars and around the camera too, as the activity's own window is.
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        params.fitInsetsTypes = 0
        params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
      }
      activity.windowManager.addView(view, params)
      pane = view
    }
    down = cover != null || pane != null
  }

  // A plain view in the ground colour that takes every touch, and that a screen reader passes over.
  private fun plain(activity: Activity, ground: Int): View =
    View(activity).apply {
      setBackgroundColor(ground)
      setOnTouchListener { _, _ -> true }
      importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
    }

  private fun take() {
    pane?.let { view -> runCatching { (view.context as? Activity)?.windowManager?.removeViewImmediate(view) } }
    pane = null
    cover?.let { view -> runCatching { (view.parent as? ViewGroup)?.removeView(view) } }
    cover = null
    down = false
    held = false
    waiting = false
    poll = null
  }

  // Looks at each drawing for the screen marked END, while the screens are in sight: found laid
  // out, the cover goes a drawing or two later, when that screen has been drawn under it.
  private fun watch() {
    if (poll != null) return
    val began = SystemClock.elapsedRealtime()
    var after = -1
    val callback = object : Choreographer.FrameCallback {
      override fun doFrame(frameTimeNanos: Long) {
        if (poll !== this) return
        val here = stage?.get()
        if (!down || !waiting || here == null || stateOf(here).stopped) {
          // Out of sight again, or no longer asked: it goes on when they are back (onActivityStarted).
          poll = null
          return
        }
        if (after >= 0) {
          after++
        } else {
          val end = runCatching { here.window?.decorView?.let { ReactFindViewUtil.findView(it, END) } }.getOrNull()
          if (end != null && end.isAttachedToWindow && end.isLaidOut) after = 0
        }
        if (after >= FRAMES_AFTER || SystemClock.elapsedRealtime() - began > WAIT_MS) {
          take()
          return
        }
        Choreographer.getInstance().postFrameCallback(this)
      }
    }
    poll = callback
    Choreographer.getInstance().postFrameCallback(callback)
  }

  override fun onActivityPaused(activity: Activity) {
    stateOf(activity).pausedAt = SystemClock.elapsedRealtime()
    // Another time away begins: what was said of the last one no longer counts.
    if (activity === stage?.get()) back = null
  }

  override fun onActivityStopped(activity: Activity) {
    stateOf(activity).stopped = true
    if (activity !== stage?.get()) return
    // Not held: what becomes of it is decided as the screens come back.
    if (armed && !down) put(activity)
  }

  override fun onActivityStarted(activity: Activity) {
    val was = stateOf(activity)
    val wasStopped = was.stopped
    was.stopped = false
    if (activity !== stage?.get() || !wasStopped) return
    val away = if (was.pausedAt > 0) SystemClock.elapsedRealtime() - was.pausedAt else 0L
    var kept = false
    if (down) {
      when {
        // The app asked for the lift while out of sight: once its screen is drawn.
        waiting -> {
          kept = true
          watch()
        }
        held -> kept = true
        armed && away > afterMs -> {
          held = true
          kept = true
        }
        else -> take()
      }
    }
    back = Back(away, kept)
  }

  override fun onActivityDestroyed(activity: Activity) {
    seen.remove(activity)
    if (activity !== stage?.get()) return
    take()
    back = null
    stage = null
    armed = false
  }

  override fun onActivityCreated(activity: Activity, saved: Bundle?) {}
  override fun onActivityResumed(activity: Activity) {}
  override fun onActivitySaveInstanceState(activity: Activity, state: Bundle) {}
}
