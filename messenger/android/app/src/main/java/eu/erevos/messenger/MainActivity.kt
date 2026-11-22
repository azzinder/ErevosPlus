// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import eu.erevos.messenger.ui.Nav
import eu.erevos.messenger.ui.Root
import eu.erevos.messenger.ui.theme.MessengerTheme

/** The one screen host: chat list, chats and settings are Compose screens (see ui/Root.kt). */
class MainActivity : ComponentActivity() {
    companion object {
        const val EXTRA_THREAD = "thread"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        if (Build.VERSION.SDK_INT >= 33) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
        }
        setContent { MessengerTheme { Root() } }
        openFrom(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        openFrom(intent)
    }

    /** A tapped notification names the chat to open. */
    private fun openFrom(intent: Intent?) {
        val key = intent?.getLongExtra(EXTRA_THREAD, 0L) ?: 0L
        if (key != 0L) {
            Nav.settings = false
            Hub.openChat = key
        }
        intent?.removeExtra(EXTRA_THREAD)
    }

    override fun onStart() {
        super.onStart()
        // Back after more than 30 s away: a chat opened with its PIN asks for it again.
        ChatLock.back()
    }

    override fun onStop() {
        super.onStop()
        // Leaving the app (or locking the phone) hides the hidden chats again.
        Hidden.close()
        ChatLock.away()
    }

    override fun onResume() {
        super.onResume()
        val signedIn = Hub.call("loggedIn").optBoolean("ok") ||
            eu.erevos.messenger.signal.Signal.hasAccount() || eu.erevos.messenger.session.Session.hasAccount()
        if (!signedIn) {
            startActivity(Intent(this, LoginActivity::class.java))
            return
        }
        Hub.resumed = true
        Hub.resumes++
        startForegroundService(Intent(this, MessengerService::class.java))
    }

    override fun onPause() {
        Hub.resumed = false
        super.onPause()
    }
}
