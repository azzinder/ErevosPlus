// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

@file:OptIn(ExperimentalFoundationApi::class)

package eu.erevos.messenger.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.Att
import eu.erevos.messenger.Hidden
import eu.erevos.messenger.Hub
import eu.erevos.messenger.MessageRow
import eu.erevos.messenger.Quote
import java.io.File
import java.io.FileOutputStream
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/** The quick reactions, as in Messenger. */
val QuickReactions = listOf("👍", "❤️", "😂", "😮", "😢", "😡")

/** The engine's error texts (English, for the logs) as the screens say them. */
fun errorText(e: String): String = when {
    e == "message not found" -> "το μήνυμα δεν βρέθηκε (ίσως φορτώθηκε πριν ανοίξει η εφαρμογή)"
    e == "encrypted chats are not connected yet" -> "οι κρυπτογραφημένες συνομιλίες δεν έχουν συνδεθεί ακόμα"
    e == "not started" || e == "not signed in" -> "δεν υπάρχει σύνδεση με το Messenger"
    e == "nothing to forward" -> "δεν υπάρχει κάτι για προώθηση"
    e == "upload got no id" -> "το ανέβασμα δεν ολοκληρώθηκε"
    e == "Messenger offers this in open chats only" -> "το Messenger το επιτρέπει μόνο στις μη κρυπτογραφημένες συνομιλίες"
    e == "stickers can be sent in open chats only" -> "αυτό το αυτοκόλλητο στέλνεται μόνο στις μη κρυπτογραφημένες συνομιλίες"
    e.startsWith("missing cookie") -> "χρειάζεται νέα σύνδεση στο Messenger"
    e.startsWith("Meta refused the change") -> "η Meta δεν δέχτηκε την αλλαγή"
    e.contains("timeout", true) || e.contains("deadline exceeded") -> "άργησε πολύ, δοκίμασε ξανά"
    e.contains("no such file") -> "το αρχείο δεν βρέθηκε"
    else -> e
}

/** Runs an engine call off the main thread and says so if it failed. Returns the "ok" part, or null. */
suspend fun engineCall(context: Context, op: String, args: JSONObject, failText: String): Any? {
    val r = withContext(Dispatchers.IO) { Hub.call(op, args) }
    if (r.has("error")) {
        Toast.makeText(context, failText + ": " + errorText(r.optString("error")), Toast.LENGTH_LONG).show()
        return null
    }
    return r.opt("ok") ?: Unit
}

fun quoteOf(m: MessageRow): Quote =
    Quote(m.id, m.text.ifEmpty { attachmentLabel(m.attachments.firstOrNull()?.kind) ?: "" }, m.sender, m.name)

fun copyText(context: Context, text: String) {
    val cm = context.getSystemService(ClipboardManager::class.java)
    cm.setPrimaryClip(ClipData.newPlainText("message", text))
    Toast.makeText(context, "Αντιγράφηκε", Toast.LENGTH_SHORT).show()
}

/** The long-press menu of a message: quick reactions and what can be done with it. */
@Composable
fun MessageMenu(
    m: MessageRow,
    chat: Long,
    encrypted: Boolean,
    expanded: Boolean,
    onDismiss: () -> Unit,
    onReply: () -> Unit,
    onForward: () -> Unit,
    onSelect: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val me = Hub.selfForMessage(m.id)
    val mineNow = Hub.reactions[m.id]?.get(me)
    var confirmUnsend by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    var pickText by remember { mutableStateOf(false) }
    var editing by remember { mutableStateOf<String?>(null) }
    // A message still without its id (not confirmed by Meta yet) can only be copied or selected.
    val sent = m.id.isNotEmpty()
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
        if (sent) Row(Modifier.padding(horizontal = 8.dp).horizontalScroll(rememberScrollState())) {
            QuickReactions.forEach { e ->
                Box(
                    Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (mineNow == e) MaterialTheme.colorScheme.primary.copy(alpha = 0.2f) else Color.Transparent)
                        .clickable {
                            onDismiss()
                            val emoji = if (mineNow == e) "" else e
                            // Shown at once; Meta's echo confirms it.
                            val map = Hub.reactions.getOrPut(m.id) { LinkedHashMap() }
                            if (emoji.isEmpty()) map.remove(me) else map[me] = emoji
                            Hub.changed()
                            scope.launch { engineCall(context, "react", JSONObject().put("id", m.id).put("emoji", emoji), "Η αντίδραση δεν στάλθηκε") }
                        },
                    contentAlignment = Alignment.Center,
                ) { Text(e, style = MaterialTheme.typography.titleLarge) }
            }
        }
        if (sent) {
            HorizontalDivider()
            DropdownMenuItem(text = { Text("↩ Απάντηση") }, onClick = { onDismiss(); onReply() })
        }
        if (m.text.isNotEmpty()) {
            DropdownMenuItem(text = { Text("⧉ Αντιγραφή") }, onClick = { onDismiss(); copyText(context, m.text) })
        }
        if (sent) DropdownMenuItem(text = { Text("➦ Προώθηση") }, onClick = { onDismiss(); onForward() })
        if (m.text.isNotEmpty()) {
            DropdownMenuItem(text = { Text("✎ Επιλογή κειμένου") }, onClick = { onDismiss(); pickText = true })
        }
        if (sent) DropdownMenuItem(text = { Text("☑ Επιλογή") }, onClick = { onDismiss(); onSelect() })
        if (m.text.isNotEmpty() || m.attachments.isNotEmpty()) {
            DropdownMenuItem(text = { Text("⭐ Στη Συλλογή") }, onClick = {
                onDismiss()
                val chatName = Hub.threads[chat]?.name.orEmpty()
                Hub.scope.launch {
                    val r = withContext(Dispatchers.IO) { runCatching { eu.erevos.messenger.Kept.add(context, m, chatName) } }
                    val missed = r.getOrNull()
                    Toast.makeText(
                        context,
                        when {
                            missed == null -> "Δεν μπήκε στη Συλλογή: " + (r.exceptionOrNull()?.message ?: "")
                            missed > 0 -> "Μπήκε στη Συλλογή, χωρίς $missed αρχεία (πολύ μεγάλα ή μη διαθέσιμα)."
                            else -> "Μπήκε στη Συλλογή."
                        },
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            })
        }
        // Signal pins a message in any chat; Session pins stay on this phone; Messenger's pins come only from Meta's own app.
        if (sent && (m.id.startsWith("sg:") || m.id.startsWith("ss:"))) {
            val isPinned = Hub.threads[chat]?.pinned == m.id
            val here = if (m.id.startsWith("ss:")) " (μόνο εδώ)" else ""
            DropdownMenuItem(text = { Text((if (isPinned) "📌 Ξεκαρφίτσωμα" else "📌 Καρφίτσωμα") + here) }, onClick = {
                onDismiss()
                scope.launch { engineCall(context, if (isPinned) "unpin" else "pin", JSONObject().put("id", m.id), "Δεν έγινε") }
            })
        }
        if (m.stickerId != 0L && !encrypted) {
            DropdownMenuItem(text = { Text("Στείλε αυτό το αυτοκόλλητο") }, onClick = {
                onDismiss()
                scope.launch { engineCall(context, "sendSticker", JSONObject().put("thread", chat).put("sticker", m.stickerId), "Δεν στάλθηκε") }
            })
        }
        // Messenger and Signal change a sent text for everyone; Session has no edits.
        if (m.mine && sent && m.text.isNotEmpty() && Hub.networkOfMessage(m.id) != "session") {
            DropdownMenuItem(text = { Text("✏ Επεξεργασία") }, onClick = { onDismiss(); editing = m.text })
        }
        if (m.mine && m.id.isNotEmpty()) {
            DropdownMenuItem(text = { Text("Ακύρωση αποστολής (για όλους)") }, onClick = { onDismiss(); confirmUnsend = true })
        }
        if (m.id.isNotEmpty()) {
            DropdownMenuItem(text = { Text("Διαγραφή για μένα") }, onClick = { onDismiss(); confirmDelete = true })
        }
    }
    if (confirmDelete) {
        DeleteForMeDialog(1, onDismiss = { confirmDelete = false }) {
            scope.launch { engineCall(context, "deleteForMe", JSONObject().put("id", m.id), "Δεν διαγράφηκε") }
        }
    }
    editing?.let { draft ->
        AlertDialog(
            onDismissRequest = { editing = null },
            title = { Text("Επεξεργασία μηνύματος") },
            text = {
                Column {
                    androidx.compose.material3.OutlinedTextField(
                        value = draft,
                        onValueChange = { editing = it },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        maxLines = 8,
                    )
                    Text(
                        "Η αλλαγή φαίνεται σε όλους, με την ένδειξη «επεξεργάστηκε».",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                }
            },
            confirmButton = {
                TextButton(enabled = draft.isNotBlank() && draft != m.text, onClick = {
                    editing = null
                    scope.launch { engineCall(context, "edit", JSONObject().put("id", m.id).put("text", draft.trim()), "Δεν άλλαξε") }
                }) { Text("Αποθήκευση") }
            },
            dismissButton = { TextButton(onClick = { editing = null }) { Text("Άκυρο") } },
        )
    }
    if (pickText) {
        AlertDialog(
            onDismissRequest = { pickText = false },
            text = {
                Column(Modifier.heightIn(max = 420.dp).verticalScroll(rememberScrollState())) {
                    SelectionContainer { Text(m.text, style = MaterialTheme.typography.bodyLarge) }
                }
            },
            confirmButton = { TextButton(onClick = { pickText = false }) { Text("Κλείσιμο") } },
        )
    }
    if (confirmUnsend) {
        AlertDialog(
            onDismissRequest = { confirmUnsend = false },
            title = { Text("Ακύρωση αποστολής;") },
            text = { Text("Το μήνυμα θα σβηστεί για όλους στη συνομιλία.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmUnsend = false
                    scope.launch { engineCall(context, "unsend", JSONObject().put("id", m.id), "Δεν ακυρώθηκε") }
                }) { Text("Ακύρωση αποστολής") }
            },
            dismissButton = { TextButton(onClick = { confirmUnsend = false }) { Text("Όχι") } },
        )
    }
}

/** The reactions under a bubble: each emoji once, with how many chose it. Tapping ours takes it back. */
@Composable
fun ReactionsRow(id: String, mine: Boolean) {
    val map = Hub.reactions[id]
    if (map.isNullOrEmpty()) return
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val counts = map.values.groupingBy { it }.eachCount()
    val me = Hub.selfForMessage(id)
    val ours = map[me]
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 18.dp),
        horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start,
    ) {
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable(enabled = ours != null) {
                map.remove(me)
                Hub.changed()
                scope.launch { engineCall(context, "react", JSONObject().put("id", id).put("emoji", ""), "Δεν αφαιρέθηκε") }
            },
        ) {
            Text(
                counts.entries.joinToString(" ") { (e, n) -> if (n > 1) "$e$n" else e },
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                style = MaterialTheme.typography.bodyMedium,
            )
        }
    }
}

/** The quote at the top of a reply bubble, or above the composer while replying. */
@Composable
fun QuoteBox(q: Quote, color: Color, onClose: (() -> Unit)? = null, onClick: (() -> Unit)? = null) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(bottom = 4.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(color.copy(alpha = 0.10f))
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.width(3.dp).heightIn(min = 28.dp).background(color.copy(alpha = 0.6f)))
        Spacer(Modifier.width(8.dp))
        Column(Modifier.weight(1f)) {
            val who = when {
                Hub.isMe(q.sender) -> "Εσύ"
                q.name.isNotBlank() -> q.name
                else -> "Απάντηση"
            }
            Text(who, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, color = color, maxLines = 1)
            Text(
                q.text.ifBlank { "Μήνυμα" },
                style = MaterialTheme.typography.bodySmall,
                color = color.copy(alpha = 0.8f),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
        if (onClose != null) {
            Text("✕", color = color, modifier = Modifier.clickable(onClick = onClose).padding(8.dp))
        }
    }
}

/** The pinned message, under the header; tapping it goes to the message. */
@Composable
fun PinnedBar(text: String, onClick: () -> Unit) {
    Surface(color = MaterialTheme.colorScheme.surfaceVariant, modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(Modifier.padding(horizontal = 16.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("📌", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text("Καρφιτσωμένο μήνυμα", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                Text(text.ifBlank { "Μήνυμα" }, style = MaterialTheme.typography.bodyMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

/** The bar shown instead of the header while messages are selected. */
@Composable
fun SelectionBar(count: Int, onClose: () -> Unit, onCopy: () -> Unit, onForward: () -> Unit, onDelete: () -> Unit) {
    var confirm by remember { mutableStateOf(false) }
    Surface(color = MaterialTheme.colorScheme.surface, shadowElevation = 1.dp) {
        Row(
            Modifier.fillMaxWidth().statusBarsPadding().padding(start = 4.dp, end = 4.dp, top = 6.dp, bottom = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            BarIcon("✕", "Κλείσιμο επιλογής", onClose)
            Text(
                "$count",
                style = MaterialTheme.typography.titleMedium,
                maxLines = 1,
                modifier = Modifier.weight(1f).padding(start = 4.dp),
            )
            BarIcon("📋", "Αντιγραφή", onCopy)
            BarIcon("↪️", "Προώθηση", onForward)
            BarIcon("🗑️", "Διαγραφή για μένα") { confirm = true }
        }
    }
    if (confirm) DeleteForMeDialog(count, onDismiss = { confirm = false }, onDelete = onDelete)
}

/** A round button with a sign and, for screen readers and a long press, its name. */
@Composable
private fun BarIcon(sign: String, name: String, onClick: () -> Unit) {
    val context = LocalContext.current
    Box(
        Modifier
            .size(48.dp)
            .clip(CircleShape)
            .combinedClickable(
                onClickLabel = name,
                onLongClick = { Toast.makeText(context, name, Toast.LENGTH_SHORT).show() },
                onClick = onClick,
            )
            .semantics { contentDescription = name },
        contentAlignment = Alignment.Center,
    ) { Text(sign, style = MaterialTheme.typography.titleLarge) }
}

/** Asks before messages are removed from this phone (they stay for the others). */
@Composable
fun DeleteForMeDialog(count: Int, onDismiss: () -> Unit, onDelete: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (count == 1) "Διαγραφή για σένα;" else "Διαγραφή $count μηνυμάτων για σένα;") },
        text = { Text("Θα σβηστούν μόνο από τη δική σου συνομιλία. Οι άλλοι θα τα βλέπουν ακόμα.") },
        confirmButton = { TextButton(onClick = { onDismiss(); onDelete() }) { Text("Διαγραφή") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Όχι") } },
    )
}

/** Choose the chats to forward to. Hidden chats are not offered. */
@Composable
fun ForwardDialog(ids: List<String>, onDismiss: () -> Unit) {
    val context = LocalContext.current
    val places by Hidden.places.collectAsState()
    // A message goes on in its own network only (each network has its own encryption and people).
    val network = Hub.networkOfMessage(ids.firstOrNull().orEmpty())
    val chats = remember(Hub.version) {
        Hub.threads.values.filter { it.key !in places && Hub.networkOf(it.key) == network }
            .sortedByDescending { it.lastMs }.map { it.copy() }
    }
    val chosen = remember { mutableStateListOf<Long>() }
    var sending by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (ids.size == 1) "Προώθηση σε…" else "Προώθηση ${ids.size} μηνυμάτων σε…") },
        text = {
            Box(Modifier.heightIn(max = 420.dp)) {
                if (sending) CircularProgressIndicator(Modifier.align(Alignment.Center))
                LazyColumn {
                    items(chats, key = { it.key }) { t ->
                        Row(
                            Modifier.fillMaxWidth().clickable {
                                if (t.key in chosen) chosen.remove(t.key) else chosen.add(t.key)
                            }.padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Checkbox(checked = t.key in chosen, onCheckedChange = {
                                if (it) chosen.add(t.key) else chosen.remove(t.key)
                            })
                            Avatar(t.key, t.name, t.group, 32.dp)
                            Spacer(Modifier.width(10.dp))
                            Text((if (t.encrypted) "🔒 " else "") + t.name, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(enabled = chosen.isNotEmpty() && !sending, onClick = {
                sending = true
                Hub.scope.launch {
                    val to = JSONArray(chosen.toList())
                    var ok = 0
                    for (id in ids) {
                        val r = engineCall(context, "forward", JSONObject().put("id", id).put("to", to), "Η προώθηση απέτυχε")
                        if (r != null) ok++
                    }
                    if (ok > 0) Toast.makeText(context, "Προωθήθηκε", Toast.LENGTH_SHORT).show()
                    onDismiss()
                }
            }) { Text("Προώθηση") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Άκυρο") } },
    )
}

/** A poll in a bubble: the question, each option with its votes; tapping an option chooses it or takes it back. */
@Composable
fun PollView(chat: Long, messageId: String, textColor: Color) {
    val p = Hub.pollOf[messageId] ?: return
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val me = Hub.selfFor(chat)
    val mine = p.votes[me].orEmpty()
    val total = p.votes.values.sumOf { it.size }.coerceAtLeast(1)
    Column(Modifier.padding(vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("📊 " + p.question.ifBlank { "Δημοσκόπηση" }, fontWeight = FontWeight.SemiBold, color = textColor)
        if (p.options.isEmpty()) {
            Text("Οι επιλογές φορτώνουν…", style = MaterialTheme.typography.bodySmall, color = textColor.copy(alpha = 0.7f))
        }
        p.options.forEach { (id, text) ->
            val n = p.votes.values.count { id in it }
            val chosen = id in mine
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp))
                    .background(textColor.copy(alpha = if (chosen) 0.18f else 0.07f))
                    .clickable {
                        val next = mine.toMutableSet().apply { if (chosen) remove(id) else add(id) }
                        p.votes[me] = next
                        Hub.changed()
                        scope.launch {
                            engineCall(
                                context, "votePoll",
                                JSONObject().put("thread", chat).put("poll", p.poll).put("selected", JSONArray(next.toList())),
                                "Η ψήφος δεν στάλθηκε",
                            )
                        }
                    }
                    .padding(horizontal = 10.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(if (chosen) "●" else "○", color = textColor)
                Spacer(Modifier.width(8.dp))
                Text(text, color = textColor, modifier = Modifier.weight(1f))
                Text("$n", color = textColor.copy(alpha = 0.8f))
                Spacer(Modifier.width(4.dp))
                Text("(${n * 100 / total}%)", style = MaterialTheme.typography.labelSmall, color = textColor.copy(alpha = 0.6f))
            }
        }
    }
}

/** A new poll (Messenger allows them in open group chats). */
@Composable
fun PollDialog(chat: Long, onDismiss: () -> Unit) {
    val context = LocalContext.current
    var question by remember { mutableStateOf("") }
    val options = remember { mutableStateListOf("", "") }
    val ready = question.isNotBlank() && options.count { it.isNotBlank() } >= 2
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Νέα δημοσκόπηση") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                OutlinedTextField(question, { question = it.take(140) }, label = { Text("Ερώτηση") }, modifier = Modifier.fillMaxWidth())
                options.forEachIndexed { i, o ->
                    OutlinedTextField(o, { options[i] = it.take(140) }, label = { Text("Επιλογή ${i + 1}") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                }
                if (options.size < 10) {
                    TextButton(onClick = { options.add("") }) { Text("＋ Επιλογή") }
                }
            }
        },
        confirmButton = {
            TextButton(enabled = ready, onClick = {
                val opts = options.map { it.trim() }.filter { it.isNotEmpty() }.distinct()
                Hub.scope.launch {
                    engineCall(
                        context, "createPoll",
                        JSONObject().put("thread", chat).put("question", question.trim()).put("options", JSONArray(opts)),
                        "Η δημοσκόπηση δεν δημιουργήθηκε",
                    )
                }
                onDismiss()
            }) { Text("Δημιουργία") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Άκυρο") } },
    )
}

/** One of Erevos's own stickers, drawn into the app as a picture (assets/erevos-stickers/). */
data class ErevosSticker(val name: String, val set: String, val label: String, val file: File)

/** Erevos's sticker sets, unpacked once from the app into its cache folder; empty if the app has none. */
object ErevosStickers {
    private var loaded: List<Pair<String, List<ErevosSticker>>>? = null

    fun sets(context: Context): List<Pair<String, List<ErevosSticker>>> {
        loaded?.let { return it }
        val out = runCatching {
            val index = JSONObject(context.assets.open("erevos-stickers/index.json").bufferedReader().use { it.readText() })
            // One folder per drawing of the stickers, so a newer app does not keep showing the old pictures.
            val version = index.optString("version").replace(Regex("[^A-Za-z0-9_-]"), "_")
            File(context.cacheDir, ".").listFiles()?.filter { it.name.startsWith("erevos-stickers") && it.name != "erevos-stickers-$version" }
                ?.forEach { it.deleteRecursively() }
            val dir = File(context.cacheDir, "erevos-stickers-$version").apply { mkdirs() }
            val labels = LinkedHashMap<String, String>()
            index.optJSONArray("sets")?.let { a -> for (i in 0 until a.length()) a.getJSONObject(i).let { labels[it.getString("set")] = it.optString("label") } }
            val all = index.getJSONArray("stickers")
            val bySet = LinkedHashMap<String, MutableList<ErevosSticker>>()
            labels.keys.forEach { bySet[it] = mutableListOf() }
            for (i in 0 until all.length()) {
                val o = all.getJSONObject(i)
                val file = File(dir, o.getString("file"))
                if (!file.exists()) {
                    context.assets.open("erevos-stickers/" + o.getString("file")).use { input -> FileOutputStream(file).use { input.copyTo(it) } }
                }
                bySet.getOrPut(o.getString("set")) { mutableListOf() }
                    .add(ErevosSticker(o.getString("name"), o.getString("set"), o.optString("label"), file))
            }
            bySet.filterValues { it.isNotEmpty() }.map { (set, list) -> (labels[set] ?: set) to list.toList() }
        }.getOrDefault(emptyList())
        loaded = out
        return out
    }
}

/** Sends one of Erevos's stickers: a sticker in encrypted chats, a picture in open ones. */
suspend fun sendErevosSticker(chat: Long, s: ErevosSticker): String? = withContext(Dispatchers.IO) {
    val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(s.file.absolutePath, o)
    val mime = if (s.file.name.endsWith(".webp")) "image/webp" else "image/png"
    val r = Uploads.during(chat, "αυτοκόλλητο " + s.label) {
        Hub.call(
            "sendMedia",
            JSONObject().put("thread", chat).put("path", s.file.absolutePath).put("mime", mime).put("name", s.file.name)
                .put("w", o.outWidth).put("h", o.outHeight).put("asSticker", true),
        )
    }
    if (r.has("error")) errorText(r.optString("error")) else null
}

/**
 * Stickers: Erevos's own sets (sent as pictures, since Meta gives no sticker packs to other apps),
 * and the Messenger stickers seen in open chats, to send again.
 */
@Composable
fun StickerDialog(chat: Long, encrypted: Boolean, onDismiss: () -> Unit) {
    val context = LocalContext.current
    val erevos by produceState<List<Pair<String, List<ErevosSticker>>>?>(null) {
        value = withContext(Dispatchers.IO) { ErevosStickers.sets(context) }
    }
    val seen = remember(Hub.version) {
        val out = LinkedHashMap<Long, Att>()
        if (!encrypted) Hub.messages.values.flatten().sortedByDescending { it.ms }.forEach { m ->
            if (m.stickerId != 0L && !m.encrypted) m.attachments.firstOrNull { it.kind == "sticker" }?.let { out.putIfAbsent(m.stickerId, it) }
        }
        out.entries.take(60)
    }
    var tab by remember { mutableStateOf(0) }
    val sets = erevos.orEmpty()
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Αυτοκόλλητα") },
        text = {
            Column {
                // One small picture per set (its first sticker): all 24 fit in a short swipe.
                Row(Modifier.horizontalScroll(rememberScrollState()), verticalAlignment = Alignment.CenterVertically) {
                    sets.forEachIndexed { i, (label, list) ->
                        Box(
                            Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (tab == i) MaterialTheme.colorScheme.primary.copy(alpha = 0.2f) else Color.Transparent)
                                .clickable(onClickLabel = label) { tab = i }
                                .semantics { contentDescription = label }
                                .padding(4.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            list.firstOrNull()?.let { RemoteImage("file://" + it.file.absolutePath, Modifier.size(36.dp), ContentScale.Fit) }
                        }
                    }
                    if (seen.isNotEmpty()) {
                        TextButton(onClick = { tab = sets.size }) {
                            Text("Messenger", fontWeight = if (tab == sets.size) FontWeight.Bold else FontWeight.Normal)
                        }
                    }
                }
                val shown = when {
                    tab < sets.size -> sets[tab].first
                    seen.isNotEmpty() -> "Messenger"
                    else -> ""
                }
                if (shown.isNotEmpty()) Text(shown, style = MaterialTheme.typography.titleSmall, modifier = Modifier.padding(vertical = 6.dp))
                Column(Modifier.heightIn(max = 380.dp).verticalScroll(rememberScrollState())) {
                    when {
                        erevos == null -> CircularProgressIndicator()
                        tab < sets.size -> sets[tab].second.chunked(4).forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                row.forEach { st ->
                                    RemoteImage(
                                        "file://" + st.file.absolutePath,
                                        Modifier.size(64.dp).clickable {
                                            onDismiss()
                                            Hub.scope.launch {
                                                val err = sendErevosSticker(chat, st)
                                                if (err != null) Toast.makeText(context, "Δεν στάλθηκε: $err", Toast.LENGTH_LONG).show()
                                            }
                                        },
                                        ContentScale.Fit,
                                    )
                                }
                            }
                            Spacer(Modifier.size(6.dp))
                        }
                        seen.isNotEmpty() -> seen.chunked(4).forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                row.forEach { (id, a) ->
                                    RemoteImage(
                                        a.url.ifEmpty { a.playUrl },
                                        Modifier.size(64.dp).clickable {
                                            onDismiss()
                                            Hub.scope.launch {
                                                engineCall(context, "sendSticker", JSONObject().put("thread", chat).put("sticker", id), "Δεν στάλθηκε")
                                            }
                                        },
                                        ContentScale.Fit,
                                    )
                                }
                            }
                            Spacer(Modifier.size(6.dp))
                        }
                        else -> Text("Τα αυτοκόλλητα του Erevos έρχονται σε επόμενη έκδοση.")
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Κλείσιμο") } },
    )
}

private data class MemberRow(val id: Long, val name: String, val admin: Boolean, val me: Boolean)

/** A group: its name and members, with the admin changes Messenger allows. */
@Composable
fun GroupInfoDialog(chat: Long, onDismiss: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val thread = Hub.threads[chat]
    var title by remember { mutableStateOf(thread?.name.orEmpty()) }
    var members by remember { mutableStateOf<List<MemberRow>?>(null) }
    var adding by remember { mutableStateOf(false) }
    val changes = Hub.membersChanged
    LaunchedEffect(chat, changes) {
        val r = withContext(Dispatchers.IO) { Hub.call("members", JSONObject().put("thread", chat)) }
        val a = r.optJSONArray("ok") ?: JSONArray()
        members = (0 until a.length()).map {
            val o = a.getJSONObject(it)
            MemberRow(o.optLong("id"), o.optString("name"), o.optBoolean("admin"), o.optBoolean("me"))
        }
    }
    val iAmAdmin = members.orEmpty().any { it.me && it.admin }
    // Changing a group (name, members, admins) works in every service; Signal and Session add
    // people as invited (they accept in their app).
    val manage = true
    val session = Hub.networkOf(chat) == "session"
    var leaving by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Ομάδα") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (manage) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        OutlinedTextField(title, { title = it }, label = { Text("Όνομα ομάδας") }, singleLine = true, modifier = Modifier.weight(1f))
                        TextButton(enabled = title.isNotBlank() && title != thread?.name, onClick = {
                            scope.launch { engineCall(context, "renameGroup", JSONObject().put("thread", chat).put("title", title.trim()), "Δεν άλλαξε") }
                        }) { Text("Αλλαγή") }
                    }
                } else {
                    Text(thread?.name.orEmpty(), style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Αλλαγές στην ομάδα (όνομα, μέλη, διαχειριστές) γίνονται προς το παρόν από το επίσημο Session.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Text(
                    "Μέλη" + (members?.let { " (${it.size})" } ?: ""),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                )
                Box(Modifier.heightIn(min = 80.dp, max = 360.dp)) {
                    val list = members
                    if (list == null) CircularProgressIndicator(Modifier.align(Alignment.Center))
                    else LazyColumn {
                        items(list, key = { it.id }) { mem -> MemberLine(chat, mem, iAmAdmin, manage) }
                    }
                }
                if (manage) TextButton(onClick = { adding = true }) { Text("＋ Προσθήκη μέλους") }
                if (session) TextButton(onClick = { leaving = true }) { Text("🚪 Αποχώρηση από την ομάδα", color = MaterialTheme.colorScheme.error) }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Κλείσιμο") } },
    )
    if (adding) AddMemberDialog(chat) { adding = false }
    if (leaving) AlertDialog(
        onDismissRequest = { leaving = false },
        title = { Text("Αποχώρηση από την ομάδα;") },
        text = { Text("Τα μέλη θα δουν ότι έφυγες και δεν θα παίρνεις πια τα μηνύματά της. Για να ξαναμπείς χρειάζεσαι νέα πρόσκληση.") },
        confirmButton = {
            TextButton(onClick = {
                leaving = false
                onDismiss()
                Hub.scope.launch { engineCall(context, "leaveGroup", JSONObject().put("thread", chat), "Δεν έγινε") }
            }) { Text("Αποχώρηση", color = MaterialTheme.colorScheme.error) }
        },
        dismissButton = { TextButton(onClick = { leaving = false }) { Text("Άκυρο") } },
    )
}

@Composable
private fun MemberLine(chat: Long, m: MemberRow, iAmAdmin: Boolean, manage: Boolean) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var menu by remember { mutableStateOf(false) }
    Box {
        Row(
            Modifier.fillMaxWidth().clickable(enabled = !m.me && manage) { menu = true }.padding(vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Avatar(m.id, m.name, false, 36.dp)
            Spacer(Modifier.width(10.dp))
            Text(
                (if (m.me) "Εσύ" else m.name.ifBlank { m.id.toString() }),
                modifier = Modifier.weight(1f),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            if (m.admin) {
                Text("διαχειριστής", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.tertiary)
            }
        }
        DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
            if (!iAmAdmin) {
                DropdownMenuItem(text = { Text("Μόνο οι διαχειριστές αλλάζουν μέλη", color = MaterialTheme.colorScheme.onSurfaceVariant) }, onClick = { menu = false })
            }
            // Session cannot take admin rights back.
            if (!(m.admin && Hub.networkOf(chat) == "session")) DropdownMenuItem(text = { Text(if (m.admin) "Αφαίρεση διαχειριστή" else "Ορισμός ως διαχειριστή") }, onClick = {
                menu = false
                scope.launch {
                    engineCall(context, "setAdmin", JSONObject().put("thread", chat).put("person", m.id).put("admin", !m.admin), "Δεν άλλαξε")
                }
            })
            DropdownMenuItem(text = { Text("Αφαίρεση από την ομάδα") }, onClick = {
                menu = false
                scope.launch { engineCall(context, "removeMember", JSONObject().put("thread", chat).put("person", m.id), "Δεν αφαιρέθηκε") }
            })
        }
    }
}

@Composable
private fun AddMemberDialog(chat: Long, onDismiss: () -> Unit) {
    val context = LocalContext.current
    var query by remember { mutableStateOf("") }
    var found by remember { mutableStateOf<List<Pair<Long, String>>>(emptyList()) }
    LaunchedEffect(query) {
        val q = query.trim()
        if (q.length < 2) { found = emptyList(); return@LaunchedEffect }
        delay(400)
        val r = withContext(Dispatchers.IO) { Hub.call("searchPeople", JSONObject().put("query", q)) }
        val a = r.optJSONArray("ok") ?: JSONArray()
        // Only people of the group's own network can join it.
        found = (0 until a.length()).map { a.getJSONObject(it).let { o -> o.optLong("id") to o.optString("name") } }
            .filter { Hub.networkOf(it.first) == Hub.networkOf(chat) }.distinctBy { it.first }
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Προσθήκη μέλους") },
        text = {
            Column {
                OutlinedTextField(query, { query = it }, label = { Text("Όνομα") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                LazyColumn(Modifier.heightIn(max = 320.dp)) {
                    items(found, key = { it.first }) { (id, name) ->
                        Row(
                            Modifier.fillMaxWidth().clickable {
                                onDismiss()
                                Hub.scope.launch {
                                    engineCall(context, "addMembers", JSONObject().put("thread", chat).put("people", JSONArray(listOf(id))), "Δεν προστέθηκε")
                                }
                            }.padding(vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Avatar(id, name, false, 32.dp)
                            Spacer(Modifier.width(10.dp))
                            Text(name)
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Άκυρο") } },
    )
}

// ---- sending files and voice ----

/** Files on their way, per chat, shown under the messages until they are sent. */
object Uploads {
    val now = mutableStateListOf<Pair<Long, String>>()

    suspend fun <T> during(chat: Long, name: String, work: suspend () -> T): T {
        val item = chat to name
        withContext(Dispatchers.Main) { now.add(item) }
        try {
            return work()
        } finally {
            withContext(NonCancellable + Dispatchers.Main) { now.remove(item) }
        }
    }
}

/** The files of this chat still being sent. */
@Composable
fun UploadsBar(chat: Long) {
    val mine = Uploads.now.filter { it.first == chat }
    if (mine.isEmpty()) return
    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)) {
        mine.forEach { (_, name) ->
            Text(
                "Αποστολή: $name",
                style = MaterialTheme.typography.bodySmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            LinearProgressIndicator(Modifier.fillMaxWidth().padding(vertical = 2.dp))
        }
    }
}

/** Copies a picked file into the app's cache and sends it. Returns an error text, or null. */
suspend fun sendPicked(context: Context, chat: Long, uri: Uri, replyTo: String?): String? = withContext(Dispatchers.IO) {
    val cr = context.contentResolver
    val mime = cr.getType(uri) ?: "application/octet-stream"
    var name = "file"
    runCatching {
        cr.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { c ->
            if (c.moveToFirst()) name = c.getString(0) ?: name
        }
    }
    val dir = File(context.cacheDir, "send").apply { mkdirs() }
    val file = File(dir, System.nanoTime().toString() + "-" + name.replace(Regex("[^A-Za-z0-9._-]"), "_"))
    try {
        cr.openInputStream(uri)?.use { input -> FileOutputStream(file).use { input.copyTo(it) } }
            ?: return@withContext "δεν διαβάστηκε το αρχείο"
        val args = JSONObject().put("thread", chat).put("path", file.absolutePath).put("mime", mime).put("name", name)
        if (!replyTo.isNullOrEmpty()) args.put("replyTo", replyTo)
        var thumb: File? = null
        when {
            mime.startsWith("image/") -> {
                val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                BitmapFactory.decodeFile(file.absolutePath, o)
                args.put("w", o.outWidth).put("h", o.outHeight)
            }
            mime.startsWith("video/") -> {
                val mr = MediaMetadataRetriever()
                try {
                    mr.setDataSource(file.absolutePath)
                    var w = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 0
                    var h = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 0
                    val rot = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull() ?: 0
                    if (rot == 90 || rot == 270) { val t = w; w = h; h = t }
                    val ms = mr.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L
                    args.put("w", w).put("h", h).put("durationMs", ms)
                    mr.frameAtTime?.let { frame ->
                        val scale = 400f / maxOf(frame.width, frame.height, 1)
                        val small = if (scale < 1f) Bitmap.createScaledBitmap(frame, (frame.width * scale).toInt().coerceAtLeast(1), (frame.height * scale).toInt().coerceAtLeast(1), true) else frame
                        thumb = File(dir, file.name + ".jpg")
                        FileOutputStream(thumb!!).use { small.compress(Bitmap.CompressFormat.JPEG, 80, it) }
                        args.put("thumb", thumb!!.absolutePath)
                    }
                } finally {
                    runCatching { mr.release() }
                }
            }
        }
        val r = Uploads.during(chat, name) { Hub.call("sendMedia", args) }
        thumb?.delete()
        if (r.has("error")) errorText(r.optString("error")) else null
    } finally {
        file.delete()
    }
}

/** Records a voice message as AAC in .m4a, the format Messenger itself records. */
class VoiceRecorder(private val context: Context) {
    private var rec: MediaRecorder? = null
    private var file: File? = null
    private var startedAt = 0L

    val recording: Boolean get() = rec != null

    fun start(): Boolean {
        cancel()
        val f = File(File(context.cacheDir, "send").apply { mkdirs() }, "voice-${System.currentTimeMillis()}.m4a")
        val r = if (Build.VERSION.SDK_INT >= 31) MediaRecorder(context) else @Suppress("DEPRECATION") MediaRecorder()
        return try {
            r.setAudioSource(MediaRecorder.AudioSource.MIC)
            r.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            r.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            r.setAudioSamplingRate(44100)
            r.setAudioEncodingBitRate(64000)
            r.setAudioChannels(1)
            r.setOutputFile(f.absolutePath)
            r.prepare()
            r.start()
            rec = r
            file = f
            startedAt = System.currentTimeMillis()
            true
        } catch (_: Exception) {
            runCatching { r.release() }
            f.delete()
            false
        }
    }

    /** Stops; returns the file and its length in ms, or null when it was too short to keep. */
    fun stop(): Pair<File, Long>? {
        val r = rec ?: return null
        val f = file
        rec = null
        file = null
        val ms = System.currentTimeMillis() - startedAt
        val ok = runCatching { r.stop() }.isSuccess
        runCatching { r.release() }
        if (!ok || f == null || ms < 700) {
            f?.delete()
            return null
        }
        return f to ms
    }

    fun cancel() {
        stop()?.first?.delete()
    }
}

/** Sends a recorded voice message. Returns an error text, or null. */
suspend fun sendVoice(chat: Long, file: File, ms: Long, replyTo: String?): String? = withContext(Dispatchers.IO) {
    try {
        val args = JSONObject().put("thread", chat).put("path", file.absolutePath).put("mime", "audio/mp4")
            .put("name", file.name).put("voice", true).put("durationMs", ms)
        if (!replyTo.isNullOrEmpty()) args.put("replyTo", replyTo)
        val r = Uploads.during(chat, "φωνητικό μήνυμα") { Hub.call("sendMedia", args) }
        if (r.has("error")) errorText(r.optString("error")) else null
    } finally {
        file.delete()
    }
}
