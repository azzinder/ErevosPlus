// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.input.pointer.pointerInput
import androidx.core.content.ContextCompat
import eu.erevos.messenger.Quote
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import eu.erevos.messenger.BubbleShape
import eu.erevos.messenger.Hub
import eu.erevos.messenger.MessageRow
import eu.erevos.messenger.ui.theme.ChatWallpaper
import eu.erevos.messenger.ui.theme.GlassRole
import eu.erevos.messenger.ui.theme.LocalChatLook
import eu.erevos.messenger.ui.theme.LocalGlass
import eu.erevos.messenger.ui.theme.glassPane
import eu.erevos.messenger.ui.theme.glassSheet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.BreakIterator
import org.json.JSONObject

/** One chat: the messages that arrived since the app started, and a send box. */
@Composable
fun ChatScreen(key: Long, onBack: () -> Unit) {
    val context = LocalContext.current
    // The lists are edited in place; reading the version redraws the chat when anything arrives.
    val version = Hub.version
    val thread = remember(version, key) { Hub.threads[key]?.copy() }
    // Newest first: the list is drawn bottom-up.
    val msgs = remember(version, key) { Hub.messages[key].orEmpty().toList().asReversed() }
    val group = thread?.group == true
    val encrypted = thread?.encrypted == true
    var replyTo by remember(key) { mutableStateOf<Quote?>(null) }
    val selected = remember(key) { mutableStateListOf<String>() }
    var forwardIds by remember { mutableStateOf<List<String>?>(null) }
    var menuFor by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    if (selected.isNotEmpty()) BackHandler { selected.clear() }

    // Opening the chat (and each new message while it is open) marks it read, on Messenger too.
    LaunchedEffect(key, msgs.size) {
        val t = Hub.threads[key] ?: return@LaunchedEffect
        if (t.unread) {
            t.unread = false
            withContext(Dispatchers.IO) { Hub.call("markRead", JSONObject().put("thread", key)) }
        }
    }

    // Ask Meta for the latest messages of this chat each time the app comes back; they arrive as events.
    val resumes = Hub.resumes
    LaunchedEffect(key, resumes) {
        val r = withContext(Dispatchers.IO) { Hub.call("messages", JSONObject().put("thread", key)) }
        if (r.has("error")) {
            Toast.makeText(context, "Ιστορικό: " + errorText(r.getString("error")), Toast.LENGTH_LONG).show()
        }
    }

    val listState = rememberLazyListState()
    // A new message shows at once, unless the person has scrolled up to read.
    LaunchedEffect(msgs.firstOrNull()?.id, msgs.size) {
        if (listState.firstVisibleItemIndex <= 1) listState.scrollToItem(0)
    }

    Column(Modifier.fillMaxSize()) {
        if (selected.isNotEmpty()) {
            val chosen = msgs.filter { it.id in selected }.asReversed()
            SelectionBar(
                selected.size,
                onClose = { selected.clear() },
                onCopy = {
                    copyText(context, chosen.filter { it.text.isNotEmpty() }.joinToString("\n") { it.text })
                    selected.clear()
                },
                onForward = { forwardIds = chosen.map { it.id }; selected.clear() },
                onDelete = {
                    val ids = chosen.map { it.id }
                    selected.clear()
                    scope.launch {
                        for (id in ids) engineCall(context, "deleteForMe", JSONObject().put("id", id), "Δεν διαγράφηκε")
                    }
                },
            )
        } else {
            ChatHeader(key, thread?.name ?: key.toString(), group, encrypted, thread, onBack)
        }
        val pinnedId = thread?.pinned.orEmpty()
        if (pinnedId.isNotEmpty()) {
            val pinned = msgs.firstOrNull { it.id == pinnedId }
            PinnedBar(pinned?.let { quoteOf(it).text } ?: "") {
                val at = msgs.indexOfFirst { it.id == pinnedId }
                if (at >= 0) scope.launch { listState.animateScrollToItem(at) }
            }
        }
        Box(Modifier.weight(1f).fillMaxWidth().glassSheet()) {
            ChatWallpaper(chat = key)
            if (msgs.isEmpty()) {
                Text(
                    "Δεν υπάρχουν μηνύματα ακόμα.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.align(Alignment.Center),
                )
            }
            LazyColumn(
                state = listState,
                reverseLayout = true,
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                itemsIndexed(msgs, key = { i, m -> if (m.id.isEmpty()) "#$i" else m.id }) { i, m ->
                    // The list is drawn bottom-up: the next item (i + 1) is the older message above.
                    val older = msgs.getOrNull(i + 1)
                    val newDay = older == null || dayOf(older.ms) != dayOf(m.ms)
                    Column {
                        if (newDay) DaySeparator(m.ms)
                        Box {
                            Bubble(
                                m,
                                showName = group && !m.mine && m.name.isNotBlank() &&
                                    (newDay || older == null || older.sender != m.sender || older.mine),
                                chat = key,
                                selected = m.id in selected,
                                onTap = {
                                    if (selected.isNotEmpty() && m.id.isNotEmpty()) {
                                        if (m.id in selected) selected.remove(m.id) else selected.add(m.id)
                                    }
                                },
                                onLongPress = {
                                    if (selected.isNotEmpty()) {
                                        if (m.id.isNotEmpty() && m.id !in selected) selected.add(m.id)
                                    } else menuFor = m.id.ifEmpty { "#$i" }
                                },
                                onQuote = { q ->
                                    val at = msgs.indexOfFirst { it.id == q.id }
                                    if (at >= 0) scope.launch { listState.animateScrollToItem(at) }
                                },
                            )
                            MessageMenu(
                                m, key, encrypted,
                                expanded = menuFor == m.id.ifEmpty { "#$i" },
                                onDismiss = { menuFor = null },
                                onReply = { replyTo = quoteOf(m) },
                                onForward = { forwardIds = listOf(m.id) },
                                onSelect = { if (m.id.isNotEmpty()) selected.add(m.id) },
                            )
                        }
                        ReactionsRow(m.id, m.mine)
                    }
                }
            }
        }
        UploadsBar(key)
        Composer(key, group, encrypted, replyTo, onClearReply = { replyTo = null })
    }
    forwardIds?.let { ids -> ForwardDialog(ids.filter { it.isNotEmpty() }) { forwardIds = null } }
}

/** The header: back arrow, round avatar, name (with a lock if encrypted) and a short line under it. */
@Composable
private fun ChatHeader(key: Long, name: String, group: Boolean, encrypted: Boolean, thread: eu.erevos.messenger.ThreadRow?, onBack: () -> Unit) {
    val glass = LocalGlass.current.on
    val context = LocalContext.current
    var groupInfo by remember { mutableStateOf(false) }
    if (groupInfo) GroupInfoDialog(key) { groupInfo = false }
    val sub = when {
        group && encrypted -> "Ομάδα · κρυπτογραφημένη"
        group -> "Ομάδα"
        encrypted -> "Κρυπτογραφημένη συνομιλία"
        else -> null
    }
    Surface(
        color = if (glass) Color.Transparent else MaterialTheme.colorScheme.surface,
        shadowElevation = if (glass) 0.dp else 1.dp,
        modifier = if (glass) Modifier.statusBarsPadding().padding(horizontal = 8.dp, vertical = 4.dp)
            .glassPane(RoundedCornerShape(22.dp), GlassRole.BAR) else Modifier,
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .then(if (glass) Modifier else Modifier.statusBarsPadding())
                .padding(end = 4.dp, top = 6.dp, bottom = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) { Text("←", style = MaterialTheme.typography.titleLarge) }
            Avatar(key, name, group, 40.dp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f).clickable(enabled = group) { groupInfo = true }) {
                Text(
                    (if (encrypted) "🔒 " else "") + name.ifBlank { "Συνομιλία χωρίς όνομα" },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (sub != null) {
                    Text(
                        sub,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (encrypted) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
            if (thread != null) {
                var menu by remember { mutableStateOf(false) }
                var background by remember { mutableStateOf(false) }
                // Session calls (one-to-one) are made here, as the official Session apps make them.
                if (Hub.networkOf(key) == "session" && !thread.group) {
                    IconButton(onClick = { eu.erevos.messenger.calls.SessionCallActivity.start(context, key, thread.name, video = false) }) {
                        Text("📞", style = MaterialTheme.typography.titleMedium)
                    }
                    IconButton(onClick = { eu.erevos.messenger.calls.SessionCallActivity.start(context, key, thread.name, video = true) }) {
                        Text("🎥", style = MaterialTheme.typography.titleMedium)
                    }
                }
                // Messenger calls go through facebook.com/messages.
                if (Hub.networkOf(key) == "messenger") {
                    IconButton(onClick = { eu.erevos.messenger.CallActivity.open(context, key, encrypted) }) {
                        Text("📞", style = MaterialTheme.typography.titleMedium)
                    }
                    IconButton(onClick = {
                        // The same call page; the app presses its video call button.
                        eu.erevos.messenger.CallActivity.open(context, key, encrypted, video = true)
                    }) {
                        Text("🎥", style = MaterialTheme.typography.titleMedium)
                    }
                }
                Box {
                    IconButton(onClick = { menu = true }) { Text("⋮", style = MaterialTheme.typography.titleLarge) }
                    LockMenu(thread, menu, keepOpen = true, onDismiss = { menu = false }, onBackground = { background = true })
                }
                if (background) ChatBackgroundDialog(key) { background = false }
            }
        }
    }
}

@Composable
private fun DaySeparator(ms: Long) {
    Box(Modifier.fillMaxWidth().padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
        val glass = LocalGlass.current.on
        Surface(
            shape = CircleShape,
            color = if (glass) Color.Transparent else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.glassPane(CircleShape, GlassRole.CARD),
        ) {
            Text(
                dayLabel(ms),
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
            )
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun Bubble(
    m: MessageRow,
    showName: Boolean,
    chat: Long,
    selected: Boolean,
    onTap: () -> Unit,
    onLongPress: () -> Unit,
    onQuote: (Quote) -> Unit,
) {
    val colors = MaterialTheme.colorScheme
    val look = LocalChatLook.current

    val big = 18.dp
    val small = 4.dp
    val shape = when (look.bubbles) {
        BubbleShape.SQUARE -> RoundedCornerShape(4.dp)
        BubbleShape.LINE -> RoundedCornerShape(0.dp)
        BubbleShape.ROUND -> RoundedCornerShape(
            topStart = big, topEnd = big,
            bottomStart = if (m.mine) big else small,
            bottomEnd = if (m.mine) small else big,
        )
    }
    val atts = m.attachments
    // A message of only a few emoji, or of only a sticker, is drawn large and without a bubble.
    val bigEmoji = if (atts.isEmpty()) emojiCount(m.text) else 0
    val stickerOnly = m.text.isEmpty() && atts.isNotEmpty() && atts.all { it.kind == "sticker" }
    val bare = bigEmoji > 0 || stickerOnly
    // Line bubbles have no fill.
    val line = look.bubbles == BubbleShape.LINE && !bare
    val glass = LocalGlass.current.on
    val glassIncoming = glass && !line && !m.mine && !bare
    val fill = when {
        bare -> Color.Transparent
        line -> Color.Transparent
        // Under glass ours keep the accent, a little see-through, and theirs are panes.
        m.mine -> if (glass) look.outgoingBubble.copy(alpha = 0.88f) else look.outgoingBubble
        glassIncoming -> Color.Transparent
        else -> look.incomingBubble
    }
    val textColor = when {
        bare || line -> colors.onBackground
        m.mine -> look.outgoingText
        else -> look.incomingText
    }
    val lineColor = if (m.mine) look.outgoingLine else look.incomingLine

    BoxWithConstraints(
        Modifier
            .fillMaxWidth()
            .background(if (selected) colors.primary.copy(alpha = 0.18f) else Color.Transparent)
            .combinedClickable(onClick = onTap, onLongClick = onLongPress)
            .padding(horizontal = 12.dp),
    ) {
        val limit = maxWidth * 0.8f
        val imageWidth = minOf(260.dp, limit - 24.dp)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = if (m.mine) Arrangement.End else Arrangement.Start) {
            Surface(
                shape = shape,
                color = fill,
                contentColor = textColor,
                modifier = Modifier
                    .widthIn(max = limit)
                    .then(if (glassIncoming) Modifier.glassPane(shape, GlassRole.CARD) else Modifier)
                    .then(
                        if (line) Modifier.drawBehind {
                            val x = if (m.mine) size.width - 1.5.dp.toPx() else 1.5.dp.toPx()
                            drawLine(lineColor, Offset(x, 0f), Offset(x, size.height), strokeWidth = 3.dp.toPx())
                        } else Modifier,
                    ),
            ) {
                Column(Modifier.padding(start = 12.dp, end = 12.dp, top = 8.dp, bottom = 6.dp)) {
                    if (showName) {
                        Text(
                            m.name,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = avatarColor(m.sender),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                    if (m.forwarded) {
                        Text(
                            "➦ Προωθημένο",
                            style = MaterialTheme.typography.labelSmall,
                            fontStyle = FontStyle.Italic,
                            color = textColor.copy(alpha = 0.7f),
                        )
                    }
                    m.replyTo?.let { q -> QuoteBox(q, textColor, onClick = { onQuote(q) }) }
                    PollView(chat, m.id, textColor)
                    if (atts.isNotEmpty()) {
                        AttachmentViews(atts, imageWidth, textColor, onLongPress)
                    }
                    if (bigEmoji > 0) {
                        val size = if (bigEmoji == 1) 48 else 40
                        Text(
                            m.text.trim(),
                            style = MaterialTheme.typography.bodyLarge.copy(fontSize = size.sp, lineHeight = (size * 1.25f).sp),
                            color = textColor,
                        )
                    } else if (m.text.isEmpty()) {
                        if (atts.isEmpty()) {
                            Text(
                                "📎 Συνημμένο",
                                style = MaterialTheme.typography.bodyLarge,
                                fontStyle = FontStyle.Italic,
                                color = textColor,
                            )
                        }
                    } else {
                        Text(
                            linked(m.text, textColor),
                            style = MaterialTheme.typography.bodyLarge,
                            color = textColor,
                            modifier = if (atts.isNotEmpty()) Modifier.padding(top = 6.dp) else Modifier,
                        )
                    }
                    Text(
                        (if (m.edited) "επεξεργάστηκε · " else "") + clockTime(m.ms),
                        style = MaterialTheme.typography.labelSmall,
                        color = textColor.copy(alpha = 0.65f),
                        modifier = Modifier.align(Alignment.End),
                    )
                }
            }
        }
    }
}

/** The input bar; sits above the keyboard and the navigation bar. */
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun Composer(key: Long, group: Boolean, encrypted: Boolean, replyTo: Quote?, onClearReply: () -> Unit) {
    val context = LocalContext.current
    var attachMenu by remember { mutableStateOf(false) }
    var pollDialog by remember { mutableStateOf(false) }
    var stickers by remember { mutableStateOf(false) }
    val recorder = remember { VoiceRecorder(context) }
    // Leaving the chat while recording closes the microphone and drops the recording.
    DisposableEffect(recorder) { onDispose { recorder.cancel() } }
    var recording by remember { mutableStateOf(false) }
    var recordStart by remember { mutableStateOf(0L) }
    var recordNow by remember { mutableStateOf(0L) }
    var slide by remember { mutableStateOf(0f) }
    val replyNow by rememberUpdatedState(replyTo)

    fun sendFile(uri: android.net.Uri?) {
        if (uri == null) return
        val reply = replyNow?.id
        onClearReply()
        Hub.scope.launch {
            val err = sendPicked(context, key, uri, reply)
            if (err != null) Toast.makeText(context, "Δεν στάλθηκε: $err", Toast.LENGTH_LONG).show()
        }
    }
    val pickMedia = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { sendFile(it) }
    val pickFile = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { sendFile(it) }
    val askMic = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        if (ok) Toast.makeText(context, "Κράτα πατημένο το μικρόφωνο για ηχογράφηση", Toast.LENGTH_SHORT).show()
    }
    LaunchedEffect(recording) {
        while (recording) {
            recordNow = System.currentTimeMillis()
            kotlinx.coroutines.delay(200)
        }
    }
    fun startRecording(): Boolean {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            askMic.launch(Manifest.permission.RECORD_AUDIO)
            return false
        }
        if (!recorder.start()) {
            Toast.makeText(context, "Το μικρόφωνο δεν ξεκίνησε", Toast.LENGTH_SHORT).show()
            return false
        }
        recording = true
        recordStart = System.currentTimeMillis()
        recordNow = recordStart
        slide = 0f
        return true
    }
    fun finishRecording(cancel: Boolean) {
        if (!recording) return
        recording = false
        if (cancel) {
            recorder.cancel()
            return
        }
        val got = recorder.stop()
        if (got == null) {
            Toast.makeText(context, "Κράτα πατημένο για να ηχογραφήσεις", Toast.LENGTH_SHORT).show()
            return
        }
        val reply = replyNow?.id
        onClearReply()
        Hub.scope.launch {
            val err = sendVoice(key, got.first, got.second, reply)
            if (err != null) Toast.makeText(context, "Το φωνητικό δεν στάλθηκε: $err", Toast.LENGTH_LONG).show()
        }
    }
    if (pollDialog) PollDialog(key) { pollDialog = false }
    if (stickers) StickerDialog(key, encrypted) { stickers = false }
    var text by rememberSaveable(key, stateSaver = TextFieldValue.Saver) { mutableStateOf(TextFieldValue("")) }
    var panel by remember { mutableStateOf(false) }
    var laterPick by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current
    val colors = MaterialTheme.colorScheme
    val canSend = text.text.isNotBlank()
    val glass = LocalGlass.current.on

    fun send() {
        val toSend = text.text.trim()
        if (toSend.isEmpty()) return
        text = TextFieldValue("")
        val quote = replyTo
        onClearReply()
        Hub.scope.launch {
            val r = withContext(Dispatchers.IO) {
                val args = JSONObject().put("thread", key).put("text", toSend)
                if (quote != null) args.put("replyTo", quote.id)
                Hub.call("sendText", args)
            }
            if (r.has("error")) {
                Toast.makeText(context, "Δεν στάλθηκε: " + errorText(r.getString("error")), Toast.LENGTH_LONG).show()
                if (text.text.isEmpty()) text = TextFieldValue(toSend)
            } else {
                // Show ours now; if Meta echoes it later, the same id is skipped.
                val ok = r.getJSONObject("ok")
                Hub.addOwn(key, ok.optString("id"), toSend, ok.optLong("ms"), quote)
            }
        }
    }

    // Back closes the emoji panel first.
    if (panel) BackHandler { panel = false }
    fun insert(emoji: String) {
        val len = text.text.length
        val from = text.selection.min.coerceIn(0, len)
        val to = text.selection.max.coerceIn(from, len)
        text = TextFieldValue(text.text.replaceRange(from, to, emoji), TextRange(from + emoji.length))
    }
    // Deletes the selection, or the one character (emoji with its joiners and tone) before the cursor.
    fun backspace() {
        val len = text.text.length
        val end = text.selection.max.coerceIn(0, len)
        var from = text.selection.min.coerceIn(0, end)
        if (from == end) {
            if (end == 0) return
            val breaks = BreakIterator.getCharacterInstance()
            breaks.setText(text.text)
            from = breaks.preceding(end).let { if (it == BreakIterator.DONE) 0 else it }
        }
        text = TextFieldValue(text.text.removeRange(from, end), TextRange(from))
    }

    if (laterPick) {
        LaterPicker(onDismiss = { laterPick = false }) { at ->
            laterPick = false
            val toSend = text.text.trim()
            if (toSend.isNotEmpty()) {
                eu.erevos.messenger.Later.add(key, toSend, at)
                text = TextFieldValue("")
                Toast.makeText(context, "Θα σταλεί " + laterTime(at), Toast.LENGTH_SHORT).show()
            }
        }
    }

    Column(Modifier.navigationBarsPadding().imePadding()) {
    LaterBanner(key)
    if (replyTo != null) {
        Box(Modifier.padding(horizontal = 14.dp)) {
            QuoteBox(replyTo, colors.onSurface, onClose = onClearReply)
        }
    }
    Surface(
        shape = RoundedCornerShape(28.dp),
        color = if (glass) Color.Transparent else colors.surface,
        shadowElevation = if (glass) 0.dp else 2.dp,
        border = if (glass) null else BorderStroke(1.dp, colors.outline),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 10.dp, vertical = 8.dp)
            .glassPane(RoundedCornerShape(28.dp), GlassRole.BAR),
    ) {
        Row(
            Modifier.padding(start = 6.dp, end = 5.dp, top = 5.dp, bottom = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .clickable(onClickLabel = "Emoji") {
                        panel = !panel
                        if (panel) focusManager.clearFocus()
                    },
                contentAlignment = Alignment.Center,
            ) { Text("\uD83D\uDE0A", style = MaterialTheme.typography.titleLarge) }
            Box {
                Box(
                    Modifier.size(40.dp).clip(CircleShape).clickable(onClickLabel = "Συνημμένο") { attachMenu = true },
                    contentAlignment = Alignment.Center,
                ) { Text("📎", style = MaterialTheme.typography.titleMedium) }
                DropdownMenu(expanded = attachMenu, onDismissRequest = { attachMenu = false }) {
                    DropdownMenuItem(text = { Text("🖼 Φωτογραφία ή βίντεο") }, onClick = {
                        attachMenu = false
                        pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageAndVideo))
                    })
                    DropdownMenuItem(text = { Text("📄 Αρχείο") }, onClick = {
                        attachMenu = false
                        pickFile.launch(arrayOf("*/*"))
                    })
                    DropdownMenuItem(text = { Text("🙂 Αυτοκόλλητα") }, onClick = { attachMenu = false; stickers = true })
                    DropdownMenuItem(
                        text = { Text(if (text.text.isBlank()) "⏰ Αποστολή αργότερα (γράψε πρώτα το μήνυμα)" else "⏰ Αποστολή αργότερα") },
                        enabled = text.text.isNotBlank(),
                        onClick = { attachMenu = false; laterPick = true },
                    )
                    // Session polls are text with numbered options, voted with reactions: any Session chat.
                    if ((group && (!encrypted || Hub.threads[key]?.network == "signal")) || Hub.threads[key]?.network == "session") {
                        DropdownMenuItem(text = { Text("📊 Δημοσκόπηση") }, onClick = { attachMenu = false; pollDialog = true })
                    }
                }
            }
            Box(Modifier.weight(1f).heightIn(min = 40.dp), contentAlignment = Alignment.CenterStart) {
                if (recording) {
                    val secs = ((recordNow - recordStart) / 1000).coerceAtLeast(0)
                    Text(
                        "🔴 %d:%02d   ◀ σύρε αριστερά για ακύρωση".format(secs / 60, secs % 60),
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (slide < -60f) colors.error else colors.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                } else if (text.text.isEmpty()) {
                    Text("Μήνυμα", style = MaterialTheme.typography.bodyLarge, color = colors.onSurfaceVariant)
                }
                if (!recording) BasicTextField(
                    value = text,
                    onValueChange = { text = it },
                    maxLines = 6,
                    textStyle = MaterialTheme.typography.bodyLarge.copy(color = colors.onSurface),
                    cursorBrush = SolidColor(colors.primary),
                    modifier = Modifier.fillMaxWidth().onFocusChanged { if (it.isFocused) panel = false },
                )
            }
            Spacer(Modifier.width(8.dp))
            if (canSend) {
                Box(
                    Modifier
                        .size(42.dp)
                        .background(colors.primary, CircleShape)
                        // Hold for "send later".
                        .combinedClickable(
                            onClickLabel = "Αποστολή",
                            onLongClickLabel = "Αποστολή αργότερα",
                            onClick = { send() },
                            onLongClick = { laterPick = true },
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("➤", color = colors.onPrimary, style = MaterialTheme.typography.titleMedium)
                }
            } else {
                // Hold to record, release to send, slide left to cancel.
                val start by rememberUpdatedState(::startRecording)
                val finish by rememberUpdatedState(::finishRecording)
                Box(
                    Modifier
                        .size(if (recording) 52.dp else 42.dp)
                        .background(if (recording) colors.error else colors.primary, CircleShape)
                        .pointerInput(key) {
                            val cancelAt = 110.dp.toPx()
                            awaitEachGesture {
                                val down = awaitFirstDown()
                                if (!start()) return@awaitEachGesture
                                down.consume()
                                var cancelled = false
                                var ended = false
                                try {
                                    while (true) {
                                        val ev = awaitPointerEvent()
                                        val ch = ev.changes.firstOrNull { it.id == down.id } ?: break
                                        slide = ch.position.x - down.position.x
                                        if (slide < -cancelAt) cancelled = true
                                        ch.consume()
                                        if (!ch.pressed) break
                                    }
                                    ended = true
                                    finish(cancelled)
                                } finally {
                                    // The gesture was taken away (the screen changed, the touch was cancelled): drop it.
                                    if (!ended) finish(true)
                                }
                            }
                        },
                    contentAlignment = Alignment.Center,
                ) {
                    Text("🎤", color = colors.onPrimary, style = MaterialTheme.typography.titleMedium)
                }
            }
        }
    }
    if (panel) EmojiPanel(onEmoji = ::insert, onBackspace = ::backspace)
    }
}
