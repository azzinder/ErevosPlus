// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import kotlin.concurrent.thread

/**
 * Keeps the Messenger connection open without Google: Meta only pushes
 * through Google (FCM), so a phone without it needs a live socket.
 */
class MessengerService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE
        )
        val n = Notification.Builder(this, Hub.CHANNEL_SERVICE)
            .setSmallIcon(R.drawable.ic_notify)
            .setContentTitle("Messenger: ανοιχτή σύνδεση")
            .setContentIntent(open)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_REMOTE_MESSAGING)
        } else {
            startForeground(1, n)
        }
        Hub.onIncoming = { t, m -> notify(t, m) }
        thread {
            // Messenger only when signed in there: the app also runs with Signal or Session alone.
            if (!Hub.messenger("loggedIn").optBoolean("ok")) return@thread
            val r = Hub.call("start")
            if (r.has("error")) {
                android.os.Handler(mainLooper).post {
                    Hub.lastError = r.getString("error")
                    Hub.status = "σφάλμα"
                    Hub.changed()
                }
            } else {
                r.optJSONObject("ok")?.optLong("self")?.let { if (it != 0L) Hub.selfId = it }
            }
        }
        // Signal, when this phone has it: its own connection, beside Messenger's.
        thread {
            if (eu.erevos.messenger.signal.Signal.open()) eu.erevos.messenger.signal.Signal.start()
        }
        // Session, when this phone has it.
        thread {
            val s = eu.erevos.messenger.session.Session
            if (s.call("open").optJSONObject("ok")?.optBoolean("registered") == true) s.call("start")
        }
        return START_STICKY
    }

    /**
     * Only messages newer than the newest one already notified, and not older
     * than this start of the service, so a reinstall or a history load never
     * notifies old messages again.
     */
    private val startedMs = System.currentTimeMillis()

    private fun notify(t: ThreadRow?, m: MessageRow) {
        val prefs = getSharedPreferences("notify", MODE_PRIVATE)
        val upTo = prefs.getLong("upTo", 0L)
        if (m.ms <= upTo || m.ms < startedMs - 60_000L) return
        prefs.edit().putLong("upTo", m.ms).apply()
        val shown = Hub.openThread
        if (shown != null && shown == t?.key) return
        // A hidden chat, or one locked with a PIN: nothing about who or what, and the
        // notification opens only the app, not the chat.
        val hidden = t != null && Hidden.isHidden(t.key)
        val locked = t != null && (hidden || ChatLock.hasPin(t.key))
        val i = Intent(this, MainActivity::class.java)
            .putExtra(MainActivity.EXTRA_THREAD, if (hidden) 0L else t?.key ?: 0L)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val pi = PendingIntent.getActivity(
            this, (t?.key ?: 0L).toInt(), i,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        val title = if (locked) "Messenger" else t?.name ?: m.name
        val text = when {
            locked -> "Νέο μήνυμα"
            t?.group == true && m.name.isNotEmpty() -> m.name + ": " + m.text
            else -> m.text
        }
        val n = Notification.Builder(this, Hub.CHANNEL_MESSAGES)
            .setSmallIcon(R.drawable.ic_notify)
            .setContentTitle(title)
            .setContentText(text)
            .setVisibility(if (locked) Notification.VISIBILITY_SECRET else Notification.VISIBILITY_PRIVATE)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .build()
        getSystemService(NotificationManager::class.java).notify((t?.key ?: 0L).toInt() or 0x10000, n)
    }

    override fun onDestroy() {
        Hub.onIncoming = null
        thread { Hub.call("stop") }
        super.onDestroy()
    }
}
