// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.app.role.RoleManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.telecom.PhoneAccount
import android.telecom.TelecomManager
import android.telecom.VideoProfile
import android.telephony.TelephonyManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * JS API for the phone's calls: being the phone app, making a call on a SIM, and what Erevos knows
 * of numbers while a space is open. The calls themselves are shown by the native call screen
 * (CallService, CallActivity), which works with Erevos locked. Events are posted to the main
 * looper.
 */
class ErevosPhoneModule : Module() {
  private val main = Handler(Looper.getMainLooper())
  private var unwatch: (() -> Unit)? = null

  private fun context(): Context = appContext.reactContext ?: throw IllegalStateException("No app context")

  override fun definition() = ModuleDefinition {
    Name("ErevosPhone")
    Events("onCalls", "onHistory", "onVoicemail")

    OnCreate {
      Calls.onCount = { count -> main.post { sendEvent("onCalls", mapOf("count" to count)) } }
      unwatch = appContext.reactContext?.let { context -> History.watch(context) { sendEvent("onHistory", emptyMap<String, Any>()) } }
    }

    OnDestroy {
      Voicemail.stop()
      Calls.onCount = null
      unwatch?.invoke()
      unwatch = null
    }

    Function("status") {
      val context = appContext.reactContext
      mapOf(
        "sdk" to Build.VERSION.SDK_INT,
        "phone" to (context?.packageManager?.hasSystemFeature("android.hardware.telephony") == true),
        "isDefault" to (context != null && isDefault(context)),
        "calls" to Calls.live().size,
        "slots" to (context?.let { Sims.slots(it) } ?: 0),
        "screens" to (context != null && screens(context)),
        "callLog" to (context != null && History.allowed(context)),
      )
    }

    // Shows Android's question whether Erevos should screen calls, so blocked calls do not ring.
    Function("requestScreening") {
      val context = context()
      val activity = appContext.currentActivity ?: throw IllegalStateException("No activity")
      // Before Android 10 the phone app screens calls itself.
      if (Build.VERSION.SDK_INT >= 29) {
        val roles = context.getSystemService(RoleManager::class.java)
        if (roles == null || !roles.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) throw IllegalStateException("This phone has no call screening role")
        activity.startActivityForResult(roles.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING), 4244)
      }
    }

    // The blocking rules, as lib/phone-rules.ts wrote them (JSON), or "".
    Function("rules") {
      Rules.raw(context())
    }

    Function("setRules") { json: String ->
      Rules.save(context(), json)
    }

    // Shows Android's question whether Erevos should be the phone app. The answer shows in status().
    Function("requestDefault") {
      val context = context()
      val activity = appContext.currentActivity ?: throw IllegalStateException("No activity")
      val intent = if (Build.VERSION.SDK_INT >= 29) {
        val roles = context.getSystemService(RoleManager::class.java)
        if (roles == null || !roles.isRoleAvailable(RoleManager.ROLE_DIALER)) throw IllegalStateException("This phone has no phone app role")
        roles.createRequestRoleIntent(RoleManager.ROLE_DIALER)
      } else {
        Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER).putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, context.packageName)
      }
      activity.startActivityForResult(intent, 4243)
    }

    // The ways the phone can call: its SIMs, once Erevos may read the phone's state.
    AsyncFunction("accounts") {
      Sims.accounts(context()).map { mapOf("id" to it.id, "label" to it.label, "slot" to it.slot.toDouble(), "name" to Sims.label(it)) }
    }

    // Android's own emergency keypad, which calls only emergency numbers and needs no password:
    // for the password screen, with Erevos the phone app and locked. False when the phone has none.
    Function("emergencyDial") {
      val intent = Intent("com.android.phone.EmergencyDialer.DIAL").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      runCatching { context().startActivity(intent) }.isSuccess
    }

    // Whether `number` is one of the emergency numbers of the SIM's network or country (112, 911,
    // 100 and the like), as Android knows them: such a call goes at once, on whichever SIM Android
    // picks. False when Android cannot say (before 10, or no SIM service).
    Function("isEmergency") { number: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return@Function false
      runCatching { context().getSystemService(TelephonyManager::class.java)?.isEmergencyNumber(number) == true }.getOrDefault(false)
    }

    // Calls `number` on the SIM whose account id is `account`, or on the phone's default for "".
    AsyncFunction("placeCall") { number: String, account: String ->
      val context = context()
      val telecom = context.getSystemService(TelecomManager::class.java) ?: throw IllegalStateException("This phone cannot call")
      val extras = Bundle()
      if (account.isNotEmpty()) Sims.find(context, account)?.let { extras.putParcelable(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, it.handle) }
      telecom.placeCall(Uri.fromParts("tel", number, null), extras)
    }

    // Android's own screens for what the phone company keeps of the SIM's calls: "calls" for
    // forwarding, call waiting and showing the number, "voicemail" for the voicemail number.
    // False when the phone has neither (index.ts then offers the codes).
    Function("openCallSettings") { kind: String, account: String ->
      val context = context()
      val handle = if (account.isNotEmpty()) Sims.find(context, account)?.handle else null
      val tries = if (kind == "voicemail") {
        listOf(Intent(TelephonyManager.ACTION_CONFIGURE_VOICEMAIL).apply { handle?.let { putExtra(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, it) } })
      } else {
        listOf(
          Intent().setComponent(ComponentName("com.android.phone", "com.android.phone.CallFeaturesSettingActivity")).apply {
            handle?.let { putExtra(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, it) }
          },
          Intent(TelecomManager.ACTION_SHOW_CALL_SETTINGS),
        )
      }
      tries.any { intent -> runCatching { context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }.isSuccess }
    }

    // The voicemail of the SIM with this account id, or of the phone's default for "": Telecom
    // calls the number the SIM gives for it.
    AsyncFunction("callVoicemail") { account: String ->
      val context = context()
      val telecom = context.getSystemService(TelecomManager::class.java) ?: throw IllegalStateException("This phone cannot call")
      val extras = Bundle()
      if (account.isNotEmpty()) Sims.find(context, account)?.let { extras.putParcelable(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, it.handle) }
      telecom.placeCall(Uri.fromParts(PhoneAccount.SCHEME_VOICEMAIL, "", null), extras)
    }

    // Whether that SIM has a voicemail number: "yes", "no", or "" when Android does not say.
    Function("hasVoicemail") { account: String ->
      when (Voicemail.hasNumber(context(), account)) {
        true -> "yes"
        false -> "no"
        null -> ""
      }
    }

    // The voicemails Android keeps (visual voicemail, where the phone company sends it).
    AsyncFunction("voicemails") {
      Voicemail.list(context())
    }

    AsyncFunction("playVoicemail") { id: Double ->
      Voicemail.play(context(), id.toLong()) { which, on ->
        main.post { sendEvent("onVoicemail", mapOf("id" to which.toDouble(), "playing" to on)) }
      }
    }

    Function("stopVoicemail") {
      Voicemail.stop()
    }

    AsyncFunction("deleteVoicemail") { id: Double ->
      Voicemail.delete(context(), id.toLong())
    }

    // The spam list (Spam.kt): how it stands, a downloaded list kept, the switches, the owner's reports.
    Function("spamState") {
      Spam.state(context())
    }

    AsyncFunction("setSpamList") { text: String, source: String ->
      Spam.setList(context(), text, source)
    }

    Function("clearSpamList") {
      Spam.clearList(context())
    }

    Function("setSpamSwitches") { warn: Boolean, silence: Boolean ->
      Spam.setSwitches(context(), warn, silence)
    }

    Function("setSpamAuto") { auto: Boolean ->
      Spam.setAuto(context(), auto)
    }

    Function("reportSpam") { number: String, spam: Boolean ->
      Spam.report(context(), number, spam)
    }

    Function("reportedSpam") { number: String ->
      Spam.reported(context(), number)
    }

    Function("clearSpamReports") {
      Spam.clearReports(context())
    }

    // Whether a SIM can make the phone company's video calls (ViLTE).
    Function("videoCalling") {
      val context = context()
      val telecom = context.getSystemService(TelecomManager::class.java)
      telecom != null && Sims.accounts(context).any { runCatching { telecom.getPhoneAccount(it.handle)?.hasCapabilities(PhoneAccount.CAPABILITY_VIDEO_CALLING) }.getOrNull() == true }
    }

    // A video call to `number`, as placeCall, with video both ways from the start.
    AsyncFunction("placeVideoCall") { number: String, account: String ->
      val context = context()
      val telecom = context.getSystemService(TelecomManager::class.java) ?: throw IllegalStateException("This phone cannot call")
      val extras = Bundle()
      if (account.isNotEmpty()) Sims.find(context, account)?.let { extras.putParcelable(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, it.handle) }
      extras.putInt(TelecomManager.EXTRA_START_CALL_WITH_VIDEO_STATE, VideoProfile.STATE_BIDIRECTIONAL)
      telecom.placeCall(Uri.fromParts("tel", number, null), extras)
    }

    // The call history, newest first, once Erevos may read it.
    AsyncFunction("history") {
      val context = context()
      mapOf("allowed" to History.allowed(context), "calls" to History.calls(context))
    }

    // Deletes calls from the history, by id, or every call with a number up to a time.
    AsyncFunction("deleteCalls") { ids: List<Double> ->
      History.delete(context(), ids.map { it.toLong() })
    }

    AsyncFunction("deleteCallsOf") { number: String, before: Double ->
      History.deleteNumber(context(), number, before.toLong())
    }

    // The call history and the blocked numbers for a backup, as JSON, and those of a backup the
    // phone lacks put back (CallsBackup.kt).
    AsyncFunction("backupCalls") {
      CallsBackup.read(context())
    }

    AsyncFunction("restoreCalls") { json: String ->
      CallsBackup.add(context(), json)
    }

    // The phone's starred contacts, once Erevos may read the contacts.
    AsyncFunction("favourites") {
      val context = context()
      mapOf("allowed" to History.contactsAllowed(context), "favourites" to History.favourites(context))
    }

    // The missed calls were seen: Android's notice of them goes.
    Function("seenMissed") {
      History.seenMissed(context())
    }

    // The phone's contact groups, once Erevos may read the contacts.
    AsyncFunction("groups") {
      val context = context()
      mapOf("allowed" to History.contactsAllowed(context), "groups" to History.groups(context))
    }

    // The quick replies a call that rings can be declined with, and whether they are the owner's.
    Function("quickReplies") {
      val context = context()
      mapOf("replies" to Replies.list(context), "own" to (Replies.own(context) != null))
    }

    // The owner's quick replies; none goes back to the usual ones.
    Function("setQuickReplies") { replies: List<String> ->
      Replies.set(context(), replies)
    }

    // Back to the call screen, while a call is on.
    Function("showCall") {
      val context = context()
      if (Calls.live().isNotEmpty()) CallActivity.show(context)
    }

    // Names Erevos knows for numbers, while a space is open (index.ts). Memory only.
    Function("setKnownNames") { names: Map<String, String> ->
      Calls.setKnownNames(names)
    }

    Function("clearKnownNames") {
      Calls.setKnownNames(emptyMap())
    }

    Function("forgetKnownNamesAfter") { ms: Double ->
      Calls.forgetKnownNamesAfter(ms.toLong())
    }
  }

  companion object {
    /** Whether Erevos holds the phone app role. */
    fun isDefault(context: Context): Boolean {
      if (Build.VERSION.SDK_INT >= 29) {
        val roles = context.getSystemService(RoleManager::class.java)
        if (roles != null && roles.isRoleAvailable(RoleManager.ROLE_DIALER)) return roles.isRoleHeld(RoleManager.ROLE_DIALER)
      }
      return context.getSystemService(TelecomManager::class.java)?.defaultDialerPackage == context.packageName
    }

    /** Whether Telecom asks Erevos about each call that comes: it holds the call screening role,
     *  or, before Android 10, is the phone app. */
    fun screens(context: Context): Boolean {
      if (Build.VERSION.SDK_INT >= 29) {
        val roles = context.getSystemService(RoleManager::class.java)
        if (roles != null && roles.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) return roles.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)
      }
      return isDefault(context)
    }
  }
}
