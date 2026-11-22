// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.ChatLock
import eu.erevos.messenger.Hidden
import eu.erevos.messenger.ThreadRow
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** "0:30", "12:05": how long until the next try. */
private fun clock(ms: Long): String {
    val s = (ms + 999) / 1000
    return "%d:%02d".format(s / 60, s % 60)
}

/** Counts down while wrong tries make the person wait; 0 when a try is allowed. */
@Composable
private fun rememberWait(tick: Int): Long {
    var left by remember { mutableLongStateOf(ChatLock.waitMs()) }
    LaunchedEffect(tick) {
        left = ChatLock.waitMs()
        while (left > 0) {
            delay(500)
            left = ChatLock.waitMs()
        }
    }
    return left
}

/**
 * Stands in for a locked chat until its PIN is typed. Nothing of the chat is loaded or marked as
 * read behind it.
 */
@Composable
fun ChatPinGate(chat: ThreadRow, onBack: () -> Unit) {
    var pin by remember { mutableStateOf("") }
    var wrong by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var forgot by remember { mutableStateOf(false) }
    var tick by remember { mutableStateOf(0) }
    val wait = rememberWait(tick)
    val scope = rememberCoroutineScope()
    val focus = remember { FocusRequester() }
    LaunchedEffect(Unit) { runCatching { focus.requestFocus() } }

    fun submit() {
        if (busy || wait > 0 || pin.length < ChatLock.MIN_LENGTH) return
        scope.launch {
            busy = true
            val ok = ChatLock.open(chat.key, pin)
            busy = false
            if (ok != true) { wrong = ok == false; pin = ""; tick++ }
        }
    }

    if (forgot) AlertDialog(
        onDismissRequest = { forgot = false },
        title = { Text("Ξέχασες το PIN;") },
        text = { Text("Το PIN φυλάγεται μόνο σε αυτό το τηλέφωνο και κανείς δεν μπορεί να το ανακτήσει. Το Facebook δεν ξέρει τίποτα γι' αυτό. Χωρίς το PIN, η συνομιλία ανοίγει μόνο στο κανονικό Messenger.") },
        confirmButton = { TextButton(onClick = { forgot = false }) { Text("OK") } },
    )

    Column(Modifier.fillMaxSize().statusBarsPadding().imePadding()) {
        Row(Modifier.fillMaxWidth().padding(end = 16.dp, top = 6.dp, bottom = 6.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Text("←", style = MaterialTheme.typography.titleLarge) }
            Avatar(chat.key, chat.name, chat.group, 40.dp)
            Spacer(Modifier.padding(start = 12.dp))
            Text(
                chat.name.ifBlank { "Συνομιλία χωρίς όνομα" },
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Box(Modifier.weight(1f).fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
            Column(
                Modifier.widthIn(max = 360.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text("🔒", style = MaterialTheme.typography.displaySmall)
                Text("Η συνομιλία είναι κλειδωμένη", style = MaterialTheme.typography.titleLarge, textAlign = TextAlign.Center)
                Text(
                    "Γράψε το PIN της για να ανοίξει.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                )
                OutlinedTextField(
                    value = pin,
                    onValueChange = { pin = it.filter(Char::isDigit); wrong = false },
                    label = { Text("PIN") },
                    singleLine = true,
                    enabled = wait == 0L,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = { submit() }),
                    modifier = Modifier.fillMaxWidth().focusRequester(focus),
                )
                when {
                    wait > 0 -> Text("Πολλές λάθος προσπάθειες. Δοκίμασε ξανά σε " + clock(wait) + ".", color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
                    wrong -> Text("Λάθος PIN.", color = MaterialTheme.colorScheme.error)
                }
                Button(
                    onClick = { submit() },
                    enabled = !busy && wait == 0L && pin.length >= ChatLock.MIN_LENGTH,
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("Άνοιγμα") }
                Spacer(Modifier.height(4.dp))
                TextButton(onClick = { forgot = true }) { Text("Ξέχασες το PIN;") }
            }
        }
    }
}

/** What a [PinDialog] does with the PIN. */
enum class PinMode { SET, CHANGE, REMOVE, CONFIRM }

/**
 * SET puts a PIN on the chat (typed twice); CHANGE asks the current one and a new one twice;
 * REMOVE and CONFIRM (before hiding a locked chat) ask only the current one. [onDone] runs once it all went right.
 */
@Composable
fun PinDialog(chat: ThreadRow, mode: PinMode, keepOpen: Boolean, onDismiss: () -> Unit, onDone: () -> Unit) {
    val askCurrent = mode != PinMode.SET
    val askNew = mode == PinMode.SET || mode == PinMode.CHANGE
    var current by remember { mutableStateOf("") }
    var first by remember { mutableStateOf("") }
    var second by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    var tick by remember { mutableStateOf(0) }
    val wait = if (askCurrent) rememberWait(tick) else 0L
    val scope = rememberCoroutineScope()
    val digits = KeyboardOptions(keyboardType = KeyboardType.NumberPassword)
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(when (mode) {
                PinMode.SET -> "Κλείδωμα με PIN"
                PinMode.CHANGE -> "Αλλαγή PIN"
                PinMode.REMOVE -> "Αφαίρεση PIN"
                PinMode.CONFIRM -> "Απόκρυψη συνομιλίας"
            })
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    when (mode) {
                        PinMode.SET -> "Αυτή η συνομιλία θα ανοίγει μόνο με αυτό το PIN, το τελευταίο της μήνυμα δεν θα φαίνεται στη λίστα και οι ειδοποιήσεις της θα λένε μόνο «Νέο μήνυμα»."
                        PinMode.CONFIRM -> "Η συνομιλία είναι κλειδωμένη. Γράψε το PIN της για να την κρύψεις."
                        else -> "Γράψε το PIN της για να ανοίξει."
                    },
                    style = MaterialTheme.typography.bodyMedium,
                )
                if (askCurrent) OutlinedTextField(
                    value = current, onValueChange = { current = it.filter(Char::isDigit); error = null },
                    label = { Text(if (askNew) "Τωρινό PIN" else "PIN") },
                    singleLine = true, enabled = wait == 0L,
                    visualTransformation = PasswordVisualTransformation(), keyboardOptions = digits,
                )
                if (askNew) {
                    OutlinedTextField(
                        value = first, onValueChange = { first = it.filter(Char::isDigit); error = null },
                        label = { Text(if (askCurrent) "Νέο PIN (τουλάχιστον 4 ψηφία)" else "PIN (τουλάχιστον 4 ψηφία)") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(), keyboardOptions = digits,
                    )
                    OutlinedTextField(
                        value = second, onValueChange = { second = it.filter(Char::isDigit); error = null },
                        label = { Text("Ξανά το PIN") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(), keyboardOptions = digits,
                    )
                }
                when {
                    wait > 0 -> Text("Πολλές λάθος προσπάθειες. Δοκίμασε ξανά σε " + clock(wait) + ".", color = MaterialTheme.colorScheme.error)
                    else -> error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                }
            }
        },
        confirmButton = {
            TextButton(enabled = !busy && wait == 0L, onClick = {
                if (askNew && (first.length < ChatLock.MIN_LENGTH || first != second)) {
                    error = "Τα δύο PIN διαφέρουν ή είναι πολύ μικρά."
                } else scope.launch {
                    busy = true
                    val ok = if (askCurrent) ChatLock.check(chat.key, current) else true
                    if (ok == true) {
                        when (mode) {
                            PinMode.SET, PinMode.CHANGE -> ChatLock.setPin(chat.key, first, keepOpen)
                            PinMode.REMOVE -> ChatLock.remove(chat.key)
                            PinMode.CONFIRM -> Unit
                        }
                        busy = false
                        onDone()
                    } else {
                        busy = false
                        current = ""
                        error = if (ok == false) "Λάθος PIN." else null
                        tick++
                    }
                }
            }) { Text("OK") }
        },
        dismissButton = { TextButton(onClick = { onDismiss() }) { Text("Άκυρο") } },
    )
}

/**
 * The choices for one chat in a dropdown: lock it with a PIN, or change or take off its PIN
 * (not while hidden: the place has its own PIN); hide it in a hidden place, move it, or bring it
 * back. [keepOpen]: shown from inside the chat, which stays open after a PIN is set.
 */
@Composable
fun LockMenu(chat: ThreadRow, expanded: Boolean, keepOpen: Boolean, onDismiss: () -> Unit, onBackground: (() -> Unit)? = null) {
    val locked by ChatLock.locked.collectAsState()
    val places by Hidden.places.collectAsState()
    val hidden = chat.key in places
    var mode by remember { mutableStateOf<PinMode?>(null) }
    var placing by remember { mutableStateOf(false) }
    DropdownMenu(expanded = expanded, onDismissRequest = onDismiss) {
        if (onBackground != null) {
            DropdownMenuItem(text = { Text("🖼 Φόντο συνομιλίας") }, onClick = { onDismiss(); onBackground() })
        }
        if (!hidden) {
            if (chat.key in locked) {
                DropdownMenuItem(text = { Text("Αλλαγή PIN") }, onClick = { onDismiss(); mode = PinMode.CHANGE })
                DropdownMenuItem(text = { Text("Αφαίρεση PIN") }, onClick = { onDismiss(); mode = PinMode.REMOVE })
            } else {
                DropdownMenuItem(text = { Text("🔐 Κλείδωμα με PIN") }, onClick = { onDismiss(); mode = PinMode.SET })
            }
            DropdownMenuItem(text = { Text("Απόκρυψη συνομιλίας") }, onClick = {
                onDismiss()
                // Hiding takes the PIN off a locked chat while it is hidden, so it asks the PIN first.
                if (ChatLock.applies(chat.key)) mode = PinMode.CONFIRM else placing = true
            })
        } else {
            DropdownMenuItem(text = { Text("Μετακίνηση σε άλλο κρυφό χώρο") }, onClick = { onDismiss(); placing = true })
            DropdownMenuItem(text = { Text("Να μην είναι κρυφή") }, onClick = { onDismiss(); Hidden.unhide(chat.key) })
        }
    }
    mode?.let { m ->
        PinDialog(chat, m, keepOpen, onDismiss = { mode = null }, onDone = {
            mode = null
            if (m == PinMode.CONFIRM) placing = true
        })
    }
    if (placing) PlaceDialog(current = Hidden.placeOf(chat.key), onDismiss = { placing = false }) { place ->
        placing = false
        Hidden.hide(chat.key, place)
    }
}

/**
 * Picks the hidden place for a chat. A place that has a PIN asks for it; a new place sets one
 * (at least 4 digits, typed twice, not the PIN of another place).
 */
@Composable
private fun PlaceDialog(current: Int?, onDismiss: () -> Unit, onPlace: (Int) -> Unit) {
    var place by remember { mutableStateOf((1..Hidden.PLACES).firstOrNull { it != current } ?: 1) }
    var first by remember { mutableStateOf("") }
    var second by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val isNew = !Hidden.hasPin(place)
    val digits = KeyboardOptions(keyboardType = KeyboardType.NumberPassword)
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Κρυφός χώρος") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    (1..Hidden.PLACES).forEach { p ->
                        val selected = p == place
                        Surface(
                            onClick = { if (p != current) { place = p; first = ""; second = ""; error = null } },
                            enabled = p != current,
                            shape = CircleShape,
                            color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                            contentColor = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                        ) {
                            Text("$p", modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                        }
                    }
                }
                Text(
                    if (isNew) "Ο χώρος $place είναι νέος: διάλεξε το PIN του. Αν το γράψεις στην αναζήτηση και πατήσεις Enter, ανοίγει αυτός ο χώρος."
                    else "Γράψε το PIN του χώρου $place.",
                    style = MaterialTheme.typography.bodyMedium,
                )
                OutlinedTextField(
                    value = first, onValueChange = { first = it.filter(Char::isDigit); error = null },
                    label = { Text("PIN (τουλάχιστον 4 ψηφία)") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(), keyboardOptions = digits,
                )
                if (isNew) OutlinedTextField(
                    value = second, onValueChange = { second = it.filter(Char::isDigit); error = null },
                    label = { Text("Ξανά το PIN") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(), keyboardOptions = digits,
                )
                error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
            }
        },
        confirmButton = {
            TextButton(enabled = !busy, onClick = {
                scope.launch {
                    busy = true
                    error = when {
                        isNew && (first.length < 4 || first != second) -> "Τα δύο PIN διαφέρουν ή είναι πολύ μικρά."
                        isNew && !Hidden.setPin(place, first) -> "Αυτό το PIN το έχει ήδη άλλος χώρος."
                        !isNew && !Hidden.check(place, first) -> "Λάθος PIN."
                        else -> null
                    }
                    busy = false
                    if (error == null) onPlace(place)
                }
            }) { Text("OK") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Άκυρο") } },
    )
}
