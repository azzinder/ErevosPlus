// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import android.app.Activity
import android.content.Context
import android.content.Intent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import eu.erevos.messenger.ChatLock
import eu.erevos.messenger.Hidden
import eu.erevos.messenger.Hub
import eu.erevos.messenger.ListCache
import eu.erevos.messenger.LoginActivity
import eu.erevos.messenger.MessengerService
import eu.erevos.messenger.ui.settings.SettingsScreen
import eu.erevos.messenger.ui.theme.glassBackdrop
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Where the person is. The open chat lives in [Hub.openChat] (the service reads it to
 * leave out notifications for the chat on screen); settings are only a screen on top.
 */
object Nav {
    var settings by mutableStateOf(false)
    /** The Collection is open. */
    var kept by mutableStateOf(false)
}

/** Chat list, a chat, or the appearance settings. One backdrop lies behind all of them. */
@Composable
fun Root() {
    val scheme = MaterialTheme.colorScheme
    val view = LocalView.current
    val lightBars = scheme.background.luminance() > 0.5f
    // The bars are see-through (edge to edge): their icons follow the app's own theme.
    SideEffect {
        val window = (view.context as? Activity)?.window
        if (window != null) {
            val c = WindowCompat.getInsetsController(window, view)
            c.isAppearanceLightStatusBars = lightBars
            c.isAppearanceLightNavigationBars = lightBars
        }
    }

    val context = LocalContext.current
    val chat = Hub.openChat
    Box(Modifier.fillMaxSize().background(scheme.background).glassBackdrop()) {
        if (Nav.kept) {
            BackHandler { Nav.kept = false }
            KeptScreen(onBack = { Nav.kept = false })
        } else if (Nav.settings) {
            BackHandler { Nav.settings = false }
            SettingsScreen(onBack = { Nav.settings = false })
        } else if (chat == null) {
            ChatListScreen(
                onOpen = { Hub.openChat = it },
                onSettings = { Nav.settings = true },
                onLogout = { logout(context) },
            )
        } else key(chat) {
            BackHandler { Hub.openChat = null }
            LockedOrOpen(chat, onBack = { Hub.openChat = null })
        }
    }
}

/**
 * A chat locked with a PIN shows only its gate until the PIN is typed; nothing of it is loaded
 * behind the gate. It locks again when it is left, or after the app was away too long.
 */
@Composable
private fun LockedOrOpen(chat: Long, onBack: () -> Unit) {
    val locked by ChatLock.locked.collectAsState()
    val unlocked by ChatLock.unlocked.collectAsState()
    val places by Hidden.places.collectAsState()
    val openPlace by Hidden.open.collectAsState()
    DisposableEffect(chat) { onDispose { ChatLock.leave(chat) } }
    // A hidden chat closes with its place (leaving the app, or going back from the place).
    val place = places[chat]
    if (place != null && place != openPlace) {
        LaunchedEffect(chat) { Hub.openChat = null }
        return
    }
    val row = Hub.threads[chat]
    if (chat in locked && place == null && unlocked != chat && row != null) {
        ChatPinGate(row, onBack)
    } else {
        ChatScreen(chat, onBack = onBack)
    }
}

/** Stops the connection, signs out in the engine and goes to the sign-in page. */
private fun logout(context: Context) {
    context.stopService(Intent(context, MessengerService::class.java))
    Hub.scope.launch {
        withContext(Dispatchers.IO) { Hub.call("logout") }
        Hub.threads.clear()
        Hub.messages.clear()
        ListCache.clear()
        Hub.openChat = null
        Hub.changed()
        context.startActivity(Intent(context, LoginActivity::class.java))
    }
}
