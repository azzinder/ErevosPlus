// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService

/**
 * What Telecom asks about each call that comes, before it rings, while Erevos is the phone app and
 * screens calls (Android's call screening role): a call the rules block (Rules) is turned away
 * without ringing or a notice, and shows as blocked in the call history; one on the spam list
 * (Spam) rings silently, when the owner chose so. With Erevos the phone
 * app too, Telecom gives this service the calls from the contacts as well. Calls made pass. A
 * call this service did not see, as when another app holds the role, is ended by CallService.
 */
class ScreeningService : CallScreeningService() {
  override fun onScreenCall(details: Call.Details) {
    if (Build.VERSION.SDK_INT >= 29 && details.callDirection != Call.Details.DIRECTION_INCOMING) {
      respondToCall(details, CallResponse.Builder().build())
      return
    }
    val number = details.handle?.schemeSpecificPart ?: ""
    Calls.markScreened(number)
    val app = applicationContext
    // The contacts are looked in away from the main thread; Telecom waits a few seconds.
    Thread {
      val blocked = runCatching { Rules.blocks(app, number) }.getOrDefault(false)
      // A number on the spam list rings silently, when the owner chose so (Android 10 and later),
      // unless it is one of the contacts or Erevos knows it.
      val quiet = !blocked && Build.VERSION.SDK_INT >= 29 && Spam.silences(app) &&
        runCatching { Spam.of(app, number) != null && Callers.lookup(app, number) == null && Calls.knownName(number) == null }.getOrDefault(false)
      val response = when {
        blocked -> CallResponse.Builder().setDisallowCall(true).setRejectCall(true).setSkipNotification(true).setSkipCallLog(false).build()
        quiet -> CallResponse.Builder().setSilenceCall(true).build()
        else -> CallResponse.Builder().build()
      }
      respondToCall(details, response)
    }.start()
  }
}
