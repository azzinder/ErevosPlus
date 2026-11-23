// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.telecom.Call
import android.telecom.CallAudioState
import android.telecom.CallEndpoint
import android.telecom.InCallService
import java.util.IdentityHashMap

/**
 * What Telecom binds while Erevos is the phone app and a call is on: it hands every call here, and
 * Erevos shows it (CallActivity, CallNotices). Telecom plays the ringtone itself, each contact's
 * own, and keeps Erevos's process running for as long as the service is bound. A call made shows
 * its screen at once; one that comes shows its notice, which Android turns into the screen over
 * the lock screen or while the screen is off, and its screen comes up from here too whenever the
 * notice may not (CallNotices.needsScreen).
 */
class CallService : InCallService() {
  private val callbacks = IdentityHashMap<Call, Call.Callback>()
  private val main = Handler(Looper.getMainLooper())
  // The screen kept on, bright, while a call rings with the phone locked or its screen off (wake).
  private var ringWake: PowerManager.WakeLock? = null
  private var stopListening: (() -> Unit)? = null

  override fun onCreate() {
    super.onCreate()
    Calls.service = this
    stopListening = Calls.listen { if (Calls.ringing() == null) sleep() }
  }

  override fun onDestroy() {
    stopListening?.invoke()
    stopListening = null
    sleep()
    if (Calls.service === this) Calls.service = null
    CallNotices.update(this)
    super.onDestroy()
  }

  override fun onCallAdded(call: Call) {
    val callback = object : Call.Callback() {
      override fun onStateChanged(call: Call, state: Int) = Calls.changed()
      override fun onDetailsChanged(call: Call, details: Call.Details) = Calls.changed()
      override fun onParentChanged(call: Call, parent: Call?) = Calls.changed()
      override fun onChildrenChanged(call: Call, children: List<Call>) = Calls.changed()
      override fun onConferenceableCallsChanged(call: Call, conferenceableCalls: List<Call>) = Calls.changed()
      override fun onCannedTextResponsesLoaded(call: Call, cannedTextResponses: List<String>) = Calls.changed()
      override fun onVideoCallChanged(call: Call, videoCall: InCallService.VideoCall?) = Calls.changed()

      // A number with a pause in it ("123,4"): the rest of its tones go on without asking.
      override fun onPostDialWait(call: Call, remainingPostDialSequence: String) {
        call.postDialContinue(true)
      }
    }
    callbacks[call] = callback
    call.registerCallback(callback)
    Calls.add(call)
    if (!Calls.isRinging(call) && call.parent == null) CallActivity.show(this)
    else if (Calls.isRinging(call)) ring(call)
  }

  // A call that rings. One the screening service did not see (another app screens calls, or
  // Android did not ask) is looked at by the rules here, and a blocked call ends after it began to
  // ring. One they let through shows its screen at once whenever its notice may not
  // (CallNotices.needsScreen), so that the phone does not ring with its screen black. Away from the
  // main thread: the rules and Do Not Disturb may look in the contacts.
  private fun ring(call: Call) {
    val number = Callers.number(call)
    val rules = !Calls.wasScreened(number) && Rules.any(this)
    val app = applicationContext
    Thread {
      val blocked = rules && runCatching { Rules.blocks(app, number) }.getOrDefault(false)
      val show = !blocked && runCatching { CallNotices.needsScreen(app, call, number) }.getOrDefault(true)
      main.post {
        if (!Calls.isRinging(call)) return@post
        if (blocked) call.reject(false, null)
        else if (show) {
          wake()
          CallActivity.show(this)
        }
      }
    }.start()
  }

  // The call screen asks Android to turn the screen on over the lock screen, but on some phones
  // that is not always enough: the phone rang with its screen black. So, as Erevos's own calls do
  // (erevos-call wakeForRing), the screen is also woken and kept on, bright, while the call rings,
  // for at most RING_WAKE_MS, and let go as soon as no call rings.
  private fun wake() {
    val power = getSystemService(PowerManager::class.java) ?: return
    runCatching {
      ringWake?.let { if (it.isHeld) it.release() }
      @Suppress("DEPRECATION")
      ringWake = power.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP, "erevos:phone-ring").also {
        it.setReferenceCounted(false)
        it.acquire(RING_WAKE_MS)
      }
    }
  }

  private fun sleep() {
    ringWake?.let { lock -> runCatching { if (lock.isHeld) lock.release() } }
    ringWake = null
  }

  override fun onCallRemoved(call: Call) {
    callbacks.remove(call)?.let { call.unregisterCallback(it) }
    Callers.forget(call)
    Calls.remove(call)
    // A call missed shows on the widget, once Telecom has written it in the call history.
    Widget.refresh(this, 3_000)
  }

  // Android 14 and later tell where the sound goes with call endpoints too (below); the phones
  // before only with this.
  @Suppress("OVERRIDE_DEPRECATION")
  override fun onCallAudioStateChanged(audioState: CallAudioState) {
    Calls.audioState(audioState)
  }

  override fun onAvailableCallEndpointsChanged(availableEndpoints: List<CallEndpoint>) {
    Calls.endpoints(availableEndpoints)
  }

  override fun onCallEndpointChanged(callEndpoint: CallEndpoint) {
    Calls.endpoint(callEndpoint)
  }

  override fun onMuteStateChanged(isMuted: Boolean) {
    Calls.muteChanged(isMuted)
  }

  override fun onCanAddCallChanged(canAddCall: Boolean) {
    Calls.canAdd = canAddCall
    Calls.changed()
  }

  // The phone asks for the call screen again: the status bar's call chip, or a second press of
  // the phone's call button.
  override fun onBringToForeground(showDialpad: Boolean) {
    CallActivity.show(this)
  }

  private companion object {
    // How long the screen is kept on for a call that rings, at most: about as long as a call rings.
    const val RING_WAKE_MS = 60_000L
  }
}
