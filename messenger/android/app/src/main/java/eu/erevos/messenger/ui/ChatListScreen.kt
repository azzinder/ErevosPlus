// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import android.content.ClipData
import android.content.ClipboardManager
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Surface
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import eu.erevos.messenger.Hidden
import java.text.Normalizer
import kotlinx.coroutines.launch
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import eu.erevos.messenger.ChatLock
import eu.erevos.messenger.GlassKind
import eu.erevos.messenger.Hub
import eu.erevos.messenger.ThreadRow
import eu.erevos.messenger.ui.theme.GlassRole
import eu.erevos.messenger.ui.theme.LocalGlass
import eu.erevos.messenger.ui.theme.glassPane
import eu.erevos.messenger.ui.theme.glassSheet

/** Chat list: the phase 0 stand-in for Erevos's unified home. */
@Composable
fun ChatListScreen(onOpen: (Long) -> Unit, onSettings: () -> Unit, onLogout: () -> Unit) {
    // The threads are edited in place; reading the version redraws the list when anything arrives.
    val version = Hub.version
    val all = remember(version) { Hub.threads.values.map { it.copy() }.sortedByDescending { it.lastMs } }
    var logShown by remember { mutableStateOf(false) }
    val places by Hidden.places.collectAsState()
    val openPlace by Hidden.open.collectAsState()
    val locks by ChatLock.locked.collectAsState()
    var query by rememberSaveable { mutableStateOf("") }
    var newChat by remember { mutableStateOf(false) }
    // Which service's chats are shown: "all", or one of them (as the Services window in Erevos).
    var service by rememberSaveable { mutableStateOf("all") }
    val scope = rememberCoroutineScope()
    BackHandler(enabled = openPlace != null) { Hidden.close() }
    // Hidden chats show only in their open place; as in Erevos, a chat locked with a PIN is
    // not found by searching.
    val rows = remember(all, places, openPlace, locks, query, service) {
        val shown = all.filter { places[it.key] == openPlace && (openPlace != null || service == "all" || Hub.networkOf(it.key) == service) }
        val needle = fold(query.trim())
        if (needle.isEmpty()) shown
        else shown.filter { (it.key !in locks || openPlace != null) && fold(it.name).contains(needle) }
    }

    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Row(
            Modifier.fillMaxWidth().padding(start = 20.dp, end = 8.dp, top = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "Messenger",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f),
            )
            IconButton(onClick = { newChat = true }) { Text("✎", style = MaterialTheme.typography.titleLarge) }
            MainMenu(onLog = { logShown = true }, onSettings = onSettings, onLogout = onLogout)
        }
        // The PIN typed here and confirmed with Enter opens a hidden place; nothing says so.
        SearchField(query, { query = it }, onEnter = {
            val typed = query
            scope.launch { if (Hidden.tryOpen(typed)) query = "" }
        })
        val place = openPlace
        if (place != null) {
            Row(
                Modifier.fillMaxWidth().clickable { Hidden.close() }.padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("←", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(8.dp))
                Text("Κρυφός χώρος $place", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
        } else {
            ServicesButton(service, all.filter { it.key !in places }) { service = it }
            Hub.lastError?.let {
                Text(
                    "Σφάλμα: $it",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(horizontal = 20.dp),
                )
            }
        }
        if (rows.isEmpty()) {
            Box(Modifier.weight(1f).fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                Text(
                    when {
                        place != null && query.isBlank() -> "Καμία κρυφή συνομιλία."
                        query.isNotBlank() -> "Δεν βρέθηκαν συνομιλίες."
                        else -> "Δεν υπάρχουν συνομιλίες ακόμα."
                    },
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth().glassSheet(),
                contentPadding = WindowInsets.navigationBars.asPaddingValues(),
            ) {
                items(rows, key = { it.key }) { t -> ChatRow(t) { onOpen(t.key) } }
            }
        }
    }
    if (logShown) LogDialog { logShown = false }
    if (newChat) NewChatDialog(network = service, onDismiss = { newChat = false }) { key -> newChat = false; onOpen(key) }
}

@Composable
private fun SearchField(query: String, onChange: (String) -> Unit, onEnter: () -> Unit) {
    Surface(
        shape = CircleShape,
        color = if (LocalGlass.current.on) Color.Transparent else MaterialTheme.colorScheme.surfaceVariant,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .glassPane(CircleShape, GlassRole.FIELD)
            .heightIn(min = 44.dp),
    ) {
        Row(Modifier.padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("🔍", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.width(10.dp))
            Box(Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                if (query.isEmpty()) {
                    Text("Αναζήτηση", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                BasicTextField(
                    value = query,
                    onValueChange = onChange,
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = { onEnter() }, onDone = { onEnter() }),
                    textStyle = MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface),
                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            if (query.isNotEmpty()) {
                Text(
                    "✕",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.clickable { onChange("") }.padding(start = 8.dp, top = 8.dp, bottom = 8.dp),
                )
            }
        }
    }
}

/** Lower case without accents (Greek included), so "Λουίζα" is found by "λουιζα". */
private fun fold(s: String): String =
    Normalizer.normalize(s, Normalizer.Form.NFD).replace(Regex("\\p{Mn}+"), "").lowercase()

@Composable
private fun MainMenu(onLog: () -> Unit, onSettings: () -> Unit, onLogout: () -> Unit) {
    val context = LocalContext.current
    var open by remember { mutableStateOf(false) }
    Box {
        IconButton(onClick = { open = true }) { Text("⋮", style = MaterialTheme.typography.titleLarge) }
        DropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            DropdownMenuItem(text = { Text("✓ Όλα ως διαβασμένα") }, onClick = {
                open = false
                Hub.threads.values.forEach { it.unread = false }
                Hub.changed()
                Hub.scope.launch {
                    val r = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) { Hub.call("markAllRead") }
                    if (r.has("error")) android.widget.Toast.makeText(context, "Δεν σημειώθηκαν: " + r.optString("error"), android.widget.Toast.LENGTH_LONG).show()
                }
            })
            DropdownMenuItem(text = { Text("⭐ Συλλογή") }, onClick = { open = false; Nav.kept = true })
            DropdownMenuItem(text = { Text("Αρχείο (για έλεγχο)") }, onClick = { open = false; onLog() })
            DropdownMenuItem(text = { Text("Εμφάνιση") }, onClick = { open = false; onSettings() })
            DropdownMenuItem(text = { Text("Αποσύνδεση") }, onClick = { open = false; onLogout() })
        }
    }
}

/** What the engine noted (no message text, no cookies), to copy and send for checking. */
@Composable
private fun LogDialog(onClose: () -> Unit) {
    val context = LocalContext.current
    val raw = remember {
        val lines = Hub.call("log").optJSONArray("ok")
        val sb = StringBuilder()
        if (lines != null) for (i in 0 until lines.length()) sb.append(lines.getString(i)).append('\n')
        sb.toString()
    }
    AlertDialog(
        onDismissRequest = onClose,
        title = { Text("Αρχείο") },
        text = {
            SelectionContainer {
                Text(
                    raw.ifEmpty { "—" },
                    fontSize = 11.sp,
                    lineHeight = 15.sp,
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val cm = context.getSystemService(ClipboardManager::class.java)
                cm.setPrimaryClip(ClipData.newPlainText("erevos-messenger", raw))
            }) { Text("Αντιγραφή") }
        },
        dismissButton = { TextButton(onClick = onClose) { Text("Κλείσιμο") } },
    )
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ChatRow(t: ThreadRow, onClick: () -> Unit) {
    // Glass panes: each row is its own pane, inset a little; the one pane and flat leave rows as they are.
    val panes = LocalGlass.current.let { it.on && it.kind == GlassKind.PANES }
    val locks by ChatLock.locked.collectAsState()
    val hiddenPlaces by Hidden.places.collectAsState()
    val locked = t.key in locks && t.key !in hiddenPlaces
    var menu by remember { mutableStateOf(false) }
    Box {
    LockMenu(t, menu, keepOpen = false, onDismiss = { menu = false })
    Row(
        Modifier
            .fillMaxWidth()
            .then(if (panes) Modifier.padding(horizontal = 12.dp, vertical = 3.dp) else Modifier)
            .glassPane(RoundedCornerShape(18.dp), GlassRole.ROW)
            .combinedClickable(onClick = onClick, onLongClick = { menu = true })
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Avatar(t.key, t.name, t.group, 52.dp)
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (t.encrypted) Text("🔒 ", style = MaterialTheme.typography.bodyMedium)
                Text(
                    t.name.ifBlank { "Συνομιλία χωρίς όνομα" },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = if (t.unread && !locked) FontWeight.ExtraBold else FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                if (t.network == "signal" || t.network == "session") {
                    Text(
                        if (t.network == "signal") "Signal" else "Session",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(end = 6.dp),
                    )
                }
                Text(
                    shortTime(t.lastMs),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (t.unread && !locked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                )
                if (t.unread && !locked) {
                    Spacer(Modifier.width(6.dp))
                    Box(Modifier.size(10.dp).background(MaterialTheme.colorScheme.primary, CircleShape))
                }
            }
            if (locked) {
                // A chat locked with a PIN shows nothing of what it holds.
                Text(
                    "🔐 Κλειδωμένη με PIN",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                )
            } else if (t.snippet.isEmpty() && t.lastMs > 0L) {
                Text(
                    emptySnippet(t),
                    style = MaterialTheme.typography.bodyMedium,
                    fontStyle = FontStyle.Italic,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                )
            } else {
                Text(
                    t.snippet,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (t.unread) FontWeight.SemiBold else FontWeight.Normal,
                    color = if (t.unread) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
    }
}

/**
 * What a chat with no snippet from Facebook shows: the last loaded message (text, or what it
 * carried). An encrypted chat whose messages are not loaded yet says so rather than guessing
 * «attachment», since Facebook gives no snippet for encrypted chats at all.
 */
private fun emptySnippet(t: ThreadRow): String {
    val last = Hub.messages[t.key]?.lastOrNull()
    if (last != null) {
        if (last.text.isNotBlank()) return last.text.lineSequence().first()
        attachmentLabel(last.attachments.firstOrNull()?.kind)?.let { return it }
    }
    return if (t.encrypted) "Κρυπτογραφημένη συνομιλία" else "📎 Συνημμένο"
}
