// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosdevice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.os.Build
import android.util.Log

/**
 * A backup made by hand is done (app/backup.tsx): a notice says so, in words the app gives in its
 * language, as the backup can take minutes and the owner may have left the screen. On a locked
 * phone it says only that Erevos has a notice; tapped, it opens Erevos.
 */
internal object Backups {
  private const val TAG = "ErevosDevice"
  private const val CHANNEL = "erevos-backups"
  private const val NOTICE = 7303

  fun tell(context: Context, title: String, text: String, channel: String) {
    val notifications = context.getSystemService(NotificationManager::class.java) ?: return
    if (Build.VERSION.SDK_INT >= 26) {
      notifications.createNotificationChannel(NotificationChannel(CHANNEL, channel, NotificationManager.IMPORTANCE_DEFAULT))
    }
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return
    val tap = PendingIntent.getActivity(context, NOTICE, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    val builder = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(context, CHANNEL) else @Suppress("DEPRECATION") Notification.Builder(context)
    val notice = builder
      .setSmallIcon(R.drawable.erevos_device_notice)
      .setContentTitle(title.take(200))
      .setContentText(text.take(500))
      .setStyle(Notification.BigTextStyle().bigText(text.take(500)))
      .setCategory(Notification.CATEGORY_STATUS)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .setContentIntent(tap)
      .setAutoCancel(true)
      .build()
    try {
      notifications.notify(NOTICE, notice)
    } catch (_: SecurityException) {
      // Notifications are not allowed: the backup screen says it too.
      Log.i(TAG, "A backup notice was not allowed")
    }
  }
}
