// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoswidget

import android.Manifest
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.CallLog
import android.provider.Telephony
import android.view.View
import android.widget.RemoteViews

/**
 * Erevos's widget on the home screen: Phone, SMS, Messages and Contacts, in the order the owner chose
 * (Appearance → Widget), each opening Erevos at that screen, behind its password like any link. Over the first three, how many are new: missed calls
 * (Android's call history), unread SMS and MMS (Android's own store) and Erevos messages (as the
 * messages notice counts them, erevos-call Notices.kt). Never who, or what they say. Counts again
 * on Android's update, and on REFRESH, which the other modules send it by class name.
 */
class ErevosWidget : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    draw(context, manager, ids)
  }

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)
    if (intent.action == REFRESH) refreshAll(context)
  }

  companion object {
    const val REFRESH = "expo.modules.erevoswidget.REFRESH"

    /** Where Erevos keeps how many messages its notice counts (erevos-call Notices.kt). */
    const val PREFS = "erevos-widget"
    const val MESSAGES = "messages"

    /** Draws every Erevos widget on the home screen again, if there is any, and has the launcher
     *  icons that show a number of their own count again (IconNumbers.kt). */
    fun refreshAll(context: Context) {
      runCatching { IconNumbers.update(context) }
      val manager = AppWidgetManager.getInstance(context) ?: return
      val ids = manager.getAppWidgetIds(ComponentName(context, ErevosWidget::class.java))
      if (ids.isNotEmpty()) draw(context, manager, ids)
    }

    /** How many are new, by button: missed calls, unread SMS and MMS, Erevos messages; none for Contacts. */
    fun counts(context: Context): Map<String, Int> = mapOf(
      "phone" to missedCalls(context),
      "sms" to unreadSms(context),
      "messages" to context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getInt(MESSAGES, 0),
      "contacts" to 0,
    )

    private fun draw(context: Context, manager: AppWidgetManager, ids: IntArray) {
      val counts = counts(context)
      val missed = counts.getValue("phone")
      val words = words(context)
      val order = order(context)
      for (id in ids) {
        val views = RemoteViews(context.packageName, R.layout.erevos_widget)
        order.forEachIndexed { place, button ->
          // A button of a part this app has not (Erevos Lite has no Phone or SMS) is not shown.
          if (!hasPart(context, button)) {
            views.setViewVisibility(SLOTS[place], View.GONE)
            return@forEachIndexed
          }
          views.setViewVisibility(SLOTS[place], View.VISIBLE)
          views.setImageViewResource(SLOT_ICONS[place], ICONS.getValue(button))
          views.setTextViewText(SLOT_LABELS[place], words[BUTTONS.indexOf(button)])
          count(views, SLOT_COUNTS[place], counts.getValue(button))
          // With missed calls, the Phone opens on them. Each button keeps its own request code
          // wherever it sits, so its link never takes another's.
          val link = when (button) {
            "phone" -> if (missed > 0) "erevos://phone?tab=recents" else "erevos://phone"
            "sms" -> "erevos://?show=sms"
            "messages" -> "erevos://?show=erevos"
            else -> "erevos://contacts"
          }
          views.setOnClickPendingIntent(SLOTS[place], opening(context, link, BUTTONS.indexOf(button) + 1))
        }
        manager.updateAppWidget(id, views)
      }
    }

    // The screens the Phone's and the SMS's buttons open with, in their own modules: an app built
    // without them (Erevos Lite, plugins/with-edition-modules.js) has neither.
    private val PARTS = mapOf(
      "phone" to "expo.modules.erevosphone.PhoneOpenActivity",
      "sms" to "expo.modules.erevossms.SmsOpenActivity",
    )

    /** Whether this app has `button`'s part: Messages and Contacts always. */
    fun hasPart(context: Context, button: String): Boolean {
      val activity = PARTS[button] ?: return true
      return runCatching {
        context.packageManager.getActivityInfo(ComponentName(context.packageName, activity), PackageManager.MATCH_DISABLED_COMPONENTS)
      }.isSuccess
    }

    /** The buttons, in the order Erevos first shows them. */
    val BUTTONS = listOf("phone", "sms", "messages", "contacts")
    /** Where the owner's order is kept (Appearance → Widget), as "phone,sms,messages,contacts". */
    private const val ORDER = "order"

    private val ICONS = mapOf(
      "phone" to R.drawable.erevos_widget_phone,
      "sms" to R.drawable.erevos_widget_sms,
      "messages" to R.drawable.erevos_widget_messages,
      "contacts" to R.drawable.erevos_widget_contacts,
    )
    private val SLOTS = listOf(R.id.erevos_widget_slot0, R.id.erevos_widget_slot1, R.id.erevos_widget_slot2, R.id.erevos_widget_slot3)
    private val SLOT_ICONS = listOf(R.id.erevos_widget_slot0_icon, R.id.erevos_widget_slot1_icon, R.id.erevos_widget_slot2_icon, R.id.erevos_widget_slot3_icon)
    private val SLOT_COUNTS = listOf(R.id.erevos_widget_slot0_count, R.id.erevos_widget_slot1_count, R.id.erevos_widget_slot2_count, R.id.erevos_widget_slot3_count)
    private val SLOT_LABELS = listOf(R.id.erevos_widget_slot0_label, R.id.erevos_widget_slot1_label, R.id.erevos_widget_slot2_label, R.id.erevos_widget_slot3_label)

    /** The owner's order, from left to right; the first one if what is kept is not all four buttons once each. */
    fun order(context: Context): List<String> {
      val kept = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(ORDER, null)?.split(',') ?: return BUTTONS
      return if (kept.size == BUTTONS.size && kept.toSet() == BUTTONS.toSet()) kept else BUTTONS
    }

    /** Keeps a new order and draws the widgets with it; false if it is not all four buttons once each. */
    fun setOrder(context: Context, order: List<String>): Boolean {
      if (order.size != BUTTONS.size || order.toSet() != BUTTONS.toSet()) return false
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(ORDER, order.joinToString(",")).apply()
      refreshAll(context)
      return true
    }

    private fun count(views: RemoteViews, id: Int, n: Int) {
      if (n <= 0) {
        views.setViewVisibility(id, View.GONE)
        return
      }
      views.setTextViewText(id, if (n > 99) "99+" else n.toString())
      views.setViewVisibility(id, View.VISIBLE)
    }

    private fun opening(context: Context, link: String, code: Int): PendingIntent {
      val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link))
        .setPackage(context.packageName)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      return PendingIntent.getActivity(context, code, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    private fun may(context: Context, permission: String) = context.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED

    /** The missed calls Android's call history marks new; 0 while Erevos may not read it. */
    private fun missedCalls(context: Context): Int {
      if (!may(context, Manifest.permission.READ_CALL_LOG)) return 0
      return rows(context, CallLog.Calls.CONTENT_URI, "${CallLog.Calls.TYPE} = ? AND ${CallLog.Calls.NEW} = 1", arrayOf(CallLog.Calls.MISSED_TYPE.toString()))
    }

    /** The SMS and MMS not read yet; 0 while Erevos may not read them. */
    private fun unreadSms(context: Context): Int {
      if (!may(context, Manifest.permission.READ_SMS)) return 0
      return rows(context, Telephony.Sms.Inbox.CONTENT_URI, "${Telephony.Sms.READ} = 0", null) +
        rows(context, Telephony.Mms.Inbox.CONTENT_URI, "${Telephony.Mms.READ} = 0", null)
    }

    private fun rows(context: Context, uri: Uri, selection: String, args: Array<String>?): Int =
      try {
        context.contentResolver.query(uri, arrayOf("_id"), selection, args, null)?.use { it.count } ?: 0
      } catch (_: Exception) {
        0
      }

    /** The buttons' words, as BUTTONS, in Erevos's language (the call module keeps it, erevos-call Notices.kt). */
    private fun words(context: Context): List<String> =
      when (context.getSharedPreferences("erevos-lang", Context.MODE_PRIVATE).getString("lang", null)) {
        "el" -> listOf("Τηλέφωνο", "SMS", "Μηνύματα", "Επαφές")
        "de" -> listOf("Telefon", "SMS", "Nachrichten", "Kontakte")
        "es" -> listOf("Teléfono", "SMS", "Mensajes", "Contactos")
        "fr" -> listOf("Téléphone", "SMS", "Messages", "Contacts")
        "it" -> listOf("Telefono", "SMS", "Messaggi", "Contatti")
        "pt" -> listOf("Telefone", "SMS", "Mensagens", "Contatos")
        "sh" -> listOf("Telefon", "SMS", "Poruke", "Kontakti")
        else -> listOf("Phone", "SMS", "Messages", "Contacts")
      }
  }
}
