// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevossms

import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.database.ContentObserver
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Telephony
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * JS API for the phone's SMS: being the default SMS app, its conversations, sending, and the
 * hidden SMS invites between Erevos phones. Events are posted to the main looper.
 */
class ErevosSmsModule : Module() {
  private val main = Handler(Looper.getMainLooper())
  @Volatile private var observer: ContentObserver? = null

  private fun context(): Context = appContext.reactContext ?: throw IllegalStateException("No app context")

  // While another app is the SMS app, the SMS it writes reach Erevos only from Android's SMS store:
  // each change there is told a moment after, once for several together, while it is listened to.
  @Synchronized
  private fun watch() {
    val context = appContext.reactContext ?: return
    if (observer != null || SmsStore.isDefault(context)) return
    val watching = object : ContentObserver(main) {
      private var due = false

      override fun onChange(selfChange: Boolean) {
        if (due) return
        due = true
        main.postDelayed({
          due = false
          if (observer === this) sendEvent("onSmsChanged", mapOf<String, Any?>())
        }, 500)
      }
    }
    try {
      context.contentResolver.registerContentObserver(Telephony.Sms.CONTENT_URI, true, watching)
      context.contentResolver.registerContentObserver(Telephony.Mms.CONTENT_URI, true, watching)
      observer = watching
    } catch (_: SecurityException) {
      // Not allowed to read SMS yet: watched once it is, and listened to again.
      context.contentResolver.unregisterContentObserver(watching)
    }
  }

  @Synchronized
  private fun unwatch() {
    observer?.let { appContext.reactContext?.contentResolver?.unregisterContentObserver(it) }
    observer = null
  }

  override fun definition() = ModuleDefinition {
    Name("ErevosSms")
    Events("onSms", "onSmsSent", "onSmsDelivered", "onSmsLaterSent", "onInvite", "onSmsChanged", "onSmsPacket")

    OnCreate {
      SmsStore.listener = { name, body -> main.post { sendEvent(name, body) } }
      // What is held for later and due goes now, and the alarm is set again, in case it was lost.
      appContext.reactContext?.applicationContext?.let { app -> Thread { runCatching { LaterSms.sendDue(app) } }.start() }
    }

    OnDestroy {
      SmsStore.listener = null
      unwatch()
    }

    OnStartObserving("onSmsChanged") { watch() }
    OnStopObserving("onSmsChanged") { unwatch() }

    Function("status") {
      val context = appContext.reactContext
      mapOf(
        "sdk" to Build.VERSION.SDK_INT,
        "phone" to (context?.packageManager?.hasSystemFeature("android.hardware.telephony") == true),
        "isDefault" to (context != null && SmsStore.isDefault(context)),
        "slots" to (context?.let { SmsStore.slots(it) } ?: 0),
      )
    }

    // Shows Android's question whether Erevos should be the SMS app. The answer shows in status().
    Function("requestDefault") {
      val context = context()
      val activity = appContext.currentActivity ?: throw IllegalStateException("No activity")
      val intent = if (Build.VERSION.SDK_INT >= 29) {
        val roles = context.getSystemService(RoleManager::class.java)
        if (roles == null || !roles.isRoleAvailable(RoleManager.ROLE_SMS)) throw IllegalStateException("This phone has no SMS app role")
        roles.createRequestRoleIntent(RoleManager.ROLE_SMS)
      } else {
        Intent(Telephony.Sms.Intents.ACTION_CHANGE_DEFAULT).putExtra(Telephony.Sms.Intents.EXTRA_PACKAGE_NAME, context.packageName)
      }
      activity.startActivityForResult(intent, 4242)
    }

    AsyncFunction("threads") { limit: Int -> SmsStore.threads(context(), limit) }
    AsyncFunction("messages") { address: String, limit: Int -> SmsStore.messages(context(), address, limit) }
    AsyncFunction("markRead") { address: String -> SmsStore.markRead(context(), address) }
    Function("showOnScreen") { numbers: List<String> -> SmsStore.showOnScreen(numbers) }
    // Spam's filter on or off: with it on, spam by the built-in rule comes with no notice (BuiltInSpam.kt).
    Function("setSpamFilter") { on: Boolean -> SmsStore.setSpamFilter(context(), on) }
    // The open space's conversations muted (numbers, until when) and with a sound of their own (lib/sms-notices.ts).
    Function("setOwnNotices") { numbers: List<String>, ends: List<Double>, sounds: List<String> -> SmsStore.setOwnNotices(numbers, ends, sounds) }
    // Whether the open space shows who wrote and what on an SMS's notice, with Reply (lib/sms-notices.ts).
    Function("setNoticeDetails") { on: Boolean -> SmsStore.setNoticeDetails(appContext.reactContext, on) }
    // MMS fetched at once, and while roaming; and those waiting for a tap (MmsStore.kt).
    Function("mmsSwitches") { MmsStore.switches(context()) }
    Function("setMmsSwitches") { auto: Boolean, roaming: Boolean -> MmsStore.setSwitches(context(), auto, roaming) }
    Function("waitingMms") { MmsStore.waiting(context()) }
    AsyncFunction("fetchMms") { location: String -> MmsStore.fetchWaiting(context(), location) }
    AsyncFunction("send") { address: String, text: String, sim: Int -> SmsStore.send(context(), address, text, sim).toDouble() }
    AsyncFunction("sendMms") { address: String, text: String, data: ByteArray, type: String, sim: Int ->
      MmsStore.send(context(), address, text, if (data.isEmpty()) null else data, type, sim).toDouble()
    }
    AsyncFunction("sims") { SmsStore.sims(context()) }
    AsyncFunction("contactNames") { numbers: List<String> -> SmsStore.contactNames(context(), numbers) }
    AsyncFunction("sendData") { address: String, data: ByteArray -> SmsStore.sendData(context(), address, data) }
    AsyncFunction("takeInvites") { SmsStore.takeInvites(context()) }
    // Encrypted messages by SMS when nothing else takes them (lib/sms-way.ts).
    AsyncFunction("sendPacket") { address: String, data: ByteArray, piece: Int, sim: Int, promise: Promise ->
      SmsStore.sendPacket(context(), address, data, piece, sim) { went -> promise.resolve(went) }
    }
    AsyncFunction("smsPackets") { SmsStore.smsPackets(context()) }
    AsyncFunction("forgetPackets") { ns: List<Double> -> SmsStore.forgetPackets(context(), ns) }
    // SMS sent for later, held by Android until their time (LaterSms.kt).
    AsyncFunction("scheduleLater") { id: String, to: String, text: String, sim: Int, at: Double ->
      LaterSms.schedule(context(), id, to, text, sim, at.toLong())
    }
    AsyncFunction("cancelLater") { id: String -> LaterSms.cancel(context(), id) }
    AsyncFunction("laterState") { ids: List<String> -> LaterSms.state(context(), ids) }
    // Deleting from the phone, sending again what did not go, and MMS pictures to send on.
    AsyncFunction("deleteThread") { address: String, upTo: Double -> SmsStore.deleteThread(context(), address, upTo.toLong()).toDouble() }
    AsyncFunction("deleteMessages") { ids: List<String> -> SmsStore.deleteMessages(context(), ids).toDouble() }
    AsyncFunction("resend") { kind: String, id: Double, sim: Int ->
      (if (kind == "mms") MmsStore.resend(context(), id.toLong(), sim) else SmsStore.resend(context(), id.toLong(), sim)).toDouble()
    }
    AsyncFunction("pictureBytes") { uri: String -> MmsStore.partBytes(context(), uri) }
    AsyncFunction("contactCards") { numbers: List<String> -> SmsStore.contactCards(context(), numbers) }
    // Android's own list of blocked numbers, which the default SMS app may read and change.
    AsyncFunction("canBlock") { SmsStore.canBlock(context()) }
    AsyncFunction("blocked") { SmsStore.blocked(context()) }
    AsyncFunction("block") { number: String -> SmsStore.block(context(), number) }
    AsyncFunction("unblock") { number: String -> SmsStore.unblock(context(), number) }
    // The phone's SMS and MMS for a backup, and put back from one (SmsBackup.kt).
    AsyncFunction("exportSms") { SmsBackup.export(context()) }
    AsyncFunction("importSms") { data: ByteArray -> SmsBackup.import(context(), data) }
  }
}
