// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.Hub
import eu.erevos.messenger.ThreadRow
import eu.erevos.messenger.session.Session
import eu.erevos.messenger.signal.Signal

/** One service on this phone: its key ("all", "messenger", "signal", "session"), name and state. */
data class Service(val key: String, val name: String, val status: String, val online: Boolean?)

/** The services that have an account here (Messenger only when signed in), with "All" first. */
fun servicesHere(): List<Service> = buildList {
    add(Service("all", "Όλες", "", null))
    if (Hub.messenger("loggedIn").optBoolean("ok")) {
        add(Service("messenger", "Messenger", Hub.status, Hub.status.startsWith("συνδεδεμένο")))
    }
    if (Signal.ready) {
        val s = Signal.status.ifEmpty { "σύνδεση…" }
        add(Service("signal", "Signal", s, s == "συνδέθηκε"))
    }
    if (Session.ready) {
        val s = Session.status.ifEmpty { "σύνδεση…" }
        add(Service("session", "Session", s, !s.contains("…") && !s.contains("σφάλμα")))
    }
}

fun nameOfService(key: String): String = when (key) {
    "messenger" -> "Messenger"
    "signal" -> "Signal"
    "session" -> "Session"
    else -> "Όλες οι υπηρεσίες"
}

/**
 * Above the list, as in Erevos: the chosen service (or all of them) with its unread chats.
 * A tap opens the cards of all services; choosing one shows only its chats.
 */
@Composable
fun ServicesButton(chosen: String, chats: List<ThreadRow>, onChoose: (String) -> Unit) {
    var open by remember { mutableStateOf(false) }
    val shown = if (chosen == "all") chats else chats.filter { Hub.networkOf(it.key) == chosen }
    val unread = shown.count { it.unread }
    val services = remember(Hub.version, Hub.status, Signal.ready, Signal.status, Session.ready, Session.status) { servicesHere() }
    val offline = services.filter { it.online == false }
    // The chosen service's account was removed: back to all.
    androidx.compose.runtime.LaunchedEffect(services, chosen) {
        if (services.none { it.key == chosen }) onChoose("all")
    }
    Row(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
            .clickable { open = true }
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("▦", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(nameOfService(chosen), style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            val line = buildString {
                append(shown.size).append(if (shown.size == 1) " συνομιλία" else " συνομιλίες")
                if (offline.isNotEmpty()) append(" · χωρίς σύνδεση: ").append(offline.joinToString { it.name })
            }
            Text(
                line,
                style = MaterialTheme.typography.labelMedium,
                color = if (offline.isEmpty()) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.error,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        if (unread > 0) Badge(unread)
        Text(" ▾", color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
    if (open) {
        AlertDialog(
            onDismissRequest = { open = false },
            title = { Text("Υπηρεσίες") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    services.chunked(2).forEach { pair ->
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            pair.forEach { s ->
                                val list = if (s.key == "all") chats else chats.filter { Hub.networkOf(it.key) == s.key }
                                ServiceCard(s, list.size, list.count { it.unread }, s.key == chosen, Modifier.weight(1f)) {
                                    onChoose(s.key)
                                    open = false
                                }
                            }
                            if (pair.size == 1) Spacer(Modifier.weight(1f))
                        }
                    }
                    if (services.size < 4) {
                        Text(
                            "Λογαριασμοί προστίθενται από Ρυθμίσεις → Λογαριασμοί.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            },
            confirmButton = { TextButton(onClick = { open = false }) { Text("Κλείσιμο") } },
        )
    }
}

@Composable
private fun ServiceCard(s: Service, chats: Int, unread: Int, chosen: Boolean, modifier: Modifier, onClick: () -> Unit) {
    val shape = RoundedCornerShape(16.dp)
    Surface(
        shape = shape,
        color = if (chosen) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
        modifier = modifier
            .heightIn(min = 92.dp)
            .then(if (chosen) Modifier.border(2.dp, MaterialTheme.colorScheme.primary, shape) else Modifier)
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (s.online != null) {
                    Box(
                        Modifier.size(8.dp).background(
                            if (s.online) Color(0xFF2E7D32) else MaterialTheme.colorScheme.error,
                            CircleShape,
                        ),
                    )
                    Spacer(Modifier.width(6.dp))
                }
                Text(s.name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                if (unread > 0) Badge(unread)
            }
            Text(
                if (chats == 1) "1 συνομιλία" else "$chats συνομιλίες",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (s.status.isNotEmpty()) {
                Text(
                    s.status,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun Badge(n: Int) {
    Box(
        Modifier.padding(start = 6.dp).background(MaterialTheme.colorScheme.primary, CircleShape).padding(horizontal = 7.dp, vertical = 2.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(if (n > 99) "99+" else n.toString(), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onPrimary)
    }
}
