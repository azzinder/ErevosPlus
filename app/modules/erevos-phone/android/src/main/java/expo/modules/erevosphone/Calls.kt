// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.bluetooth.BluetoothDevice
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.OutcomeReceiver
import android.os.SystemClock
import android.telecom.Call
import android.telecom.CallAudioState
import android.telecom.CallEndpoint
import android.telecom.CallEndpointException
import android.telecom.InCallService
import android.telecom.VideoProfile
import java.util.IdentityHashMap

/** A place the sound of a call can go: `kind` is one of Calls' EARPIECE to STREAMING (CallEndpoint's
 *  types), `name` a Bluetooth device's, `target` what Telecom takes to move the sound there. */
internal class Route(val kind: Int, val name: String?, val target: Any?)

/**
 * The phone's calls while Erevos is the phone app, as Android's Telecom gives them to CallService,
 * each with an id of ours; where their sound goes, and whether the microphone is off. In memory
 * only, in Erevos's process, which Telecom keeps running while a call lasts. Used on the main
 * thread, except `knownNames` and the marks of the screening service.
 */
internal object Calls {
  const val EARPIECE = 1
  const val BLUETOOTH = 2
  const val WIRED = 3
  const val SPEAKER = 4
  const val STREAMING = 5

  private val main = Handler(Looper.getMainLooper())
  private val ids = IdentityHashMap<Call, Int>()
  private var next = 1
  private val listeners = LinkedHashSet<() -> Unit>()

  /** Every call Telecom gave, in the order they came, until it takes it back. */
  val all = ArrayList<Call>()

  /** The service Telecom is bound to while there are calls; it moves the sound and the microphone. */
  var service: InCallService? = null

  var routes: List<Route> = emptyList()
  var route: Route? = null
  var muted = false

  /** Whether Telecom lets another call be made now. */
  var canAdd = false

  /** The last call that ended, kept a moment to show why. */
  var ended: Call? = null

  /** Tells the JS side (ErevosPhoneModule) how many calls there are now. */
  @Volatile var onCount: ((Int) -> Unit)? = null

  // Names Erevos knows for numbers (setKnownNames), by their last ten digits: only while a space is
  // open, in memory only. Read by the call screen and the screening service.
  @Volatile private var known: Map<String, String> = emptyMap()

  // When the names are forgotten (SystemClock.elapsedRealtime), with Erevos in the background:
  // when its space would lock.
  @Volatile private var knownUntil = Long.MAX_VALUE

  fun setKnownNames(names: Map<String, String>) {
    known = names.entries.mapNotNull { (number, name) -> key(number)?.let { it to name } }.toMap()
    knownUntil = Long.MAX_VALUE
  }

  /** Forgets the names after `ms`, unless the app keeps them again first (`ms` < 0). */
  fun forgetKnownNamesAfter(ms: Long) {
    knownUntil = if (ms < 0) Long.MAX_VALUE else SystemClock.elapsedRealtime() + ms
  }

  fun knownName(number: String?): String? {
    if (SystemClock.elapsedRealtime() >= knownUntil) known = emptyMap()
    return number?.let(::key)?.let { known[it] }
  }

  /** How numbers are matched: their last ten digits, or all of them when shorter. */
  fun key(number: String): String? {
    val digits = number.filter { it.isDigit() }
    return if (digits.isEmpty()) null else digits.takeLast(10)
  }

  // The numbers whose calls the screening service saw, and when (ScreeningService.kt): a call it
  // did not see, as when another app screens calls, is looked at again when it comes.
  private val screened = HashMap<String, Long>()

  fun markScreened(number: String) {
    val at = System.currentTimeMillis()
    synchronized(screened) {
      screened.entries.removeAll { at - it.value > 60_000 }
      key(number)?.let { screened[it] = at }
    }
  }

  fun wasScreened(number: String): Boolean =
    synchronized(screened) { key(number)?.let { screened[it] }?.let { System.currentTimeMillis() - it < 60_000 } ?: false }

  fun id(call: Call): Int = ids.getOrPut(call) { next++ }

  fun find(id: Int): Call? = all.firstOrNull { ids[it] == id }

  fun add(call: Call) {
    id(call)
    if (all.none { it === call }) all.add(call)
    changed()
  }

  fun remove(call: Call) {
    all.removeAll { it === call }
    if (call.parent == null && live().isEmpty()) ended = call
    changed()
  }

  /** Calls `listener` whenever a call or its sound changes; returns what stops it. */
  fun listen(listener: () -> Unit): () -> Unit {
    listeners.add(listener)
    return { listeners.remove(listener) }
  }

  fun changed() {
    if (Looper.myLooper() != Looper.getMainLooper()) {
      main.post { changed() }
      return
    }
    service?.let { CallNotices.update(it) }
    for (listener in listeners.toList()) listener()
    onCount?.invoke(live().size)
  }

  @Suppress("DEPRECATION")
  fun state(call: Call): Int = if (Build.VERSION.SDK_INT >= 31) call.details.state else call.state

  private fun ringingState(state: Int) = state == Call.STATE_RINGING || state == Call.STATE_SIMULATED_RINGING

  /** The calls that are on, a conference's own calls only as part of it. */
  fun live(): List<Call> = all.filter { it.parent == null && state(it) != Call.STATE_DISCONNECTED }

  fun isRinging(call: Call) = ringingState(state(call))

  /** The call that rings and is not answered yet. */
  fun ringing(): Call? = live().firstOrNull { isRinging(it) }

  /** The call the screen shows big: the one being talked in or made, else one on hold. */
  fun front(): Call? {
    val calls = live().filter { !isRinging(it) }
    return calls.firstOrNull { state(it) != Call.STATE_HOLDING } ?: calls.firstOrNull()
  }

  /** The other call besides `call`, on hold or waiting. */
  fun other(call: Call): Call? = live().firstOrNull { it !== call }

  fun answer(call: Call) {
    call.answer(VideoProfile.STATE_AUDIO_ONLY)
  }

  /** Answers a video call with video both ways (ViLTE). */
  fun answerVideo(call: Call) {
    call.answer(VideoProfile.STATE_BIDIRECTIONAL)
  }

  /** Ends the calls that are on, then answers `call`, as a phone can have only so many. */
  fun endAndAnswer(call: Call) {
    val others = live().filter { it !== call }
    if (others.isEmpty()) {
      answer(call)
      return
    }
    var answered = false
    val answerOnce = {
      if (!answered && isRinging(call)) {
        answered = true
        answer(call)
      }
    }
    for (other in others) {
      other.registerCallback(object : Call.Callback() {
        override fun onStateChanged(changed: Call, state: Int) {
          if (state != Call.STATE_DISCONNECTED) return
          changed.unregisterCallback(this)
          if (live().none { it !== call }) answerOnce()
        }
      })
      other.disconnect()
    }
    // Answered anyway if the network is slow to end the other.
    main.postDelayed(answerOnce, 2000)
  }

  /** Puts the two calls together, as Telecom offers it for the call or its conference. */
  fun merge(call: Call) {
    val with = call.conferenceableCalls.firstOrNull()
    if (with != null) call.conference(with)
    else if (call.details.can(Call.Details.CAPABILITY_MERGE_CONFERENCE)) call.mergeConference()
  }

  fun canMerge(call: Call) = call.conferenceableCalls.isNotEmpty() || call.details.can(Call.Details.CAPABILITY_MERGE_CONFERENCE)

  /** Talks with the call on hold, and puts the other on hold. */
  fun swap(front: Call) {
    if (front.details.can(Call.Details.CAPABILITY_SWAP_CONFERENCE)) {
      front.swapConference()
      return
    }
    live().firstOrNull { it !== front && state(it) == Call.STATE_HOLDING }?.unhold()
  }

  fun canHold(call: Call) = call.details.can(Call.Details.CAPABILITY_HOLD) || call.details.can(Call.Details.CAPABILITY_SUPPORT_HOLD)

  fun mute(on: Boolean) {
    service?.setMuted(on)
  }

  /** Below Android 14, where the sound goes comes as a CallAudioState. */
  @Suppress("DEPRECATION")
  fun audioState(state: CallAudioState) {
    muted = state.isMuted
    if (Build.VERSION.SDK_INT < 34) {
      val list = ArrayList<Route>()
      val mask = state.supportedRouteMask
      if (mask and CallAudioState.ROUTE_EARPIECE != 0) list.add(Route(EARPIECE, null, CallAudioState.ROUTE_EARPIECE))
      if (mask and CallAudioState.ROUTE_WIRED_HEADSET != 0) list.add(Route(WIRED, null, CallAudioState.ROUTE_WIRED_HEADSET))
      if (mask and CallAudioState.ROUTE_BLUETOOTH != 0) {
        val devices = if (Build.VERSION.SDK_INT >= 28) state.supportedBluetoothDevices.toList() else emptyList()
        if (devices.isEmpty()) list.add(Route(BLUETOOTH, null, CallAudioState.ROUTE_BLUETOOTH))
        // Its name needs the nearby devices permission from Android 12; without it, "Bluetooth".
        for (device in devices) list.add(Route(BLUETOOTH, runCatching { device.name }.getOrNull(), device))
      }
      if (mask and CallAudioState.ROUTE_SPEAKER != 0) list.add(Route(SPEAKER, null, CallAudioState.ROUTE_SPEAKER))
      routes = list
      route = when (state.route) {
        CallAudioState.ROUTE_BLUETOOTH -> {
          val active = if (Build.VERSION.SDK_INT >= 28) state.activeBluetoothDevice else null
          list.firstOrNull { it.kind == BLUETOOTH && (active == null || it.target == active) }
        }
        CallAudioState.ROUTE_WIRED_HEADSET -> list.firstOrNull { it.kind == WIRED }
        CallAudioState.ROUTE_SPEAKER -> list.firstOrNull { it.kind == SPEAKER }
        else -> list.firstOrNull { it.kind == EARPIECE }
      }
    }
    changed()
  }

  /** From Android 14, the places the sound can go come as CallEndpoints. */
  fun endpoints(available: List<CallEndpoint>) {
    val current = (route?.target as? CallEndpoint)?.identifier
    routes = available.map { Route(it.endpointType, it.endpointName?.toString(), it) }
    route = routes.firstOrNull { (it.target as CallEndpoint).identifier == current } ?: route
    changed()
  }

  fun endpoint(endpoint: CallEndpoint) {
    route = routes.firstOrNull { (it.target as? CallEndpoint)?.identifier == endpoint.identifier }
      ?: Route(endpoint.endpointType, endpoint.endpointName?.toString(), endpoint)
    changed()
  }

  fun muteChanged(on: Boolean) {
    muted = on
    changed()
  }

  /** Moves the sound to `to`. */
  @Suppress("DEPRECATION")
  fun moveSound(to: Route) {
    val service = service ?: return
    val target = to.target
    if (Build.VERSION.SDK_INT >= 34 && target is CallEndpoint) {
      service.requestCallEndpointChange(
        target,
        service.mainExecutor,
        object : OutcomeReceiver<Void, CallEndpointException> {
          override fun onResult(result: Void?) {}
          override fun onError(error: CallEndpointException) {}
        },
      )
    } else if (Build.VERSION.SDK_INT >= 28 && target is BluetoothDevice) {
      service.requestBluetoothAudio(target)
    } else if (target is Int) {
      service.setAudioRoute(target)
    }
  }
}
