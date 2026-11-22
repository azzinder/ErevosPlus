// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevossms

import android.app.Notification
import android.app.PendingIntent
import android.app.RemoteInput
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * Reply and Mark as read on the notice of an SMS that came, when the open space shows who wrote and
 * what (SmsStore.setNoticeDetails, lib/sms-notices.ts): the reply goes as a plain SMS on the SIM it
 * came on, with Erevos locked too, as a reply from the incoming call screen does.
 */
internal object NoticeReply {
  const val REPLY = "expo.modules.erevossms.NOTICE_REPLY"
  const val READ = "expo.modules.erevossms.NOTICE_READ"
  const val TEXT = "text"
  const val ADDRESS = "address"
  const val SIM = "sim"

  /** The notice's two actions, for `address`. */
  fun actions(context: Context, address: String, sim: Int): List<Notification.Action> {
    val code = address.hashCode() and 0x7fffffff
    val replying = Intent(context, NoticeReplyReceiver::class.java).setAction(REPLY).putExtra(ADDRESS, address).putExtra(SIM, sim)
    // Android puts the typed words in the intent, so it must be mutable.
    val mutable = if (Build.VERSION.SDK_INT >= 31) PendingIntent.FLAG_MUTABLE else 0
    val reply = PendingIntent.getBroadcast(context, code, replying, mutable or PendingIntent.FLAG_UPDATE_CURRENT)
    val input = RemoteInput.Builder(TEXT).setLabel(Words.say(context, "SMS (not encrypted)", "SMS (μη κρυπτογραφημένο)")).build()
    val answer = Notification.Action.Builder(null, Words.say(context, "Reply", "Απάντηση"), reply).addRemoteInput(input)
    if (Build.VERSION.SDK_INT >= 28) answer.setSemanticAction(Notification.Action.SEMANTIC_ACTION_REPLY)
    val reading = Intent(context, NoticeReplyReceiver::class.java).setAction(READ).putExtra(ADDRESS, address)
    val read = PendingIntent.getBroadcast(context, code + 1, reading, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    val marked = Notification.Action.Builder(null, Words.say(context, "Mark as read", "Διαβάστηκε"), read)
    if (Build.VERSION.SDK_INT >= 28) marked.setSemanticAction(Notification.Action.SEMANTIC_ACTION_MARK_AS_READ)
    return listOf(answer.build(), marked.build())
  }
}

/** Reply or Mark as read, tapped on the notice of an SMS that came. */
class NoticeReplyReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val address = intent.getStringExtra(NoticeReply.ADDRESS)?.takeIf { it.isNotBlank() } ?: return
    when (intent.action) {
      NoticeReply.REPLY -> {
        val text = RemoteInput.getResultsFromIntent(intent)?.getCharSequence(NoticeReply.TEXT)?.toString()?.trim()
        if (!text.isNullOrEmpty()) {
          try {
            SmsStore.send(context, address, text, intent.getIntExtra(NoticeReply.SIM, -1))
          } catch (_: Exception) {
            // Not sent: the conversation shows it did not go, once opened.
          }
        }
        SmsStore.markRead(context, address)
        SmsStore.clearNew(context)
      }
      NoticeReply.READ -> {
        SmsStore.markRead(context, address)
        SmsStore.clearNew(context)
      }
    }
  }
}
