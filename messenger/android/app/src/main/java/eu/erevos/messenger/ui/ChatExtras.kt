// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.Backgrounds
import eu.erevos.messenger.Hub
import eu.erevos.messenger.WallpaperKind
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.text.Normalizer

private fun patternName(w: WallpaperKind): String = when (w) {
    WallpaperKind.PLAIN -> "Απλό"
    WallpaperKind.DOTS -> "Τελείες"
    WallpaperKind.GRID -> "Πλέγμα"
    WallpaperKind.STRIPES -> "Ρίγες"
    WallpaperKind.STARS -> "Αστέρια"
    WallpaperKind.GRADIENT -> "Διαβάθμιση"
}

/** One chat's own background: the same as all chats, a pattern, or a photo of the owner's. */
@Composable
fun ChatBackgroundDialog(chat: Long, onDismiss: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val own = remember { Backgrounds.own(chat) }
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) scope.launch {
            if (Backgrounds.setOwnPhoto(chat, uri)) onDismiss()
            else Toast.makeText(context, "Η φωτογραφία δεν διαβάστηκε", Toast.LENGTH_SHORT).show()
        }
    }
    @Composable
    fun option(label: String, selected: Boolean, onClick: () -> Unit) {
        Row(
            Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            RadioButton(selected = selected, onClick = onClick)
            Text(label, style = MaterialTheme.typography.bodyLarge)
        }
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Φόντο συνομιλίας") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                option("Όπως όλες οι συνομιλίες", own == null) { Backgrounds.clearOwn(chat); onDismiss() }
                for (w in WallpaperKind.entries) {
                    option(patternName(w), (own as? Backgrounds.Choice.Pattern)?.kind == w) {
                        Backgrounds.setOwnPattern(chat, w); onDismiss()
                    }
                }
                option("🖼 Δική μου φωτογραφία…", own is Backgrounds.Choice.Photo) {
                    pick.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Κλείσιμο") } },
    )
}

private data class PersonRow(val id: Long, val name: String, val picture: String)

private fun parsePeople(r: JSONObject): List<PersonRow> {
    val list = r.optJSONArray("ok") ?: return emptyList()
    return (0 until list.length()).map {
        val o = list.getJSONObject(it)
        PersonRow(o.getLong("id"), o.optString("name"), o.optString("picture"))
    }.distinctBy { it.id }
}

/** Lower case without accents (Greek included), so "Λουίζα" is found by "λουιζα". */
private fun foldName(s: String): String =
    Normalizer.normalize(s, Normalizer.Form.NFD).replace(Regex("\\p{Mn}+"), "").lowercase()

/**
 * A new chat: the contact list by name (filtered while typing), and anyone else found on
 * Facebook by the same words. Meta makes new chats with one person encrypted.
 */
@Composable
fun NewChatDialog(network: String = "all", onDismiss: () -> Unit, onOpen: (Long) -> Unit) {
    // Inside one service, only its people.
    fun mineOnly(list: List<PersonRow>) = if (network == "all") list else list.filter { Hub.networkOf(it.id) == network }
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var query by remember { mutableStateOf("") }
    var contacts by remember { mutableStateOf<List<PersonRow>?>(null) }
    var found by remember { mutableStateOf<List<PersonRow>>(emptyList()) }
    var busy by remember { mutableStateOf(false) }
    var starting by remember { mutableStateOf(false) }
    var newGroup by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        contacts = mineOnly(parsePeople(withContext(Dispatchers.IO) { Hub.call("contacts") }))
    }
    LaunchedEffect(query) {
        val q = query.trim()
        if (q.length < 2) { found = emptyList(); return@LaunchedEffect }
        delay(400)
        busy = true
        found = mineOnly(parsePeople(withContext(Dispatchers.IO) { Hub.call("searchPeople", JSONObject().put("query", q)) }))
        busy = false
    }
    val needle = foldName(query.trim())
    val mine = remember(contacts, needle) {
        contacts.orEmpty().filter { needle.isEmpty() || foldName(it.name).contains(needle) }
    }
    val others = remember(found, mine) {
        val ids = mine.map { it.id }.toSet()
        found.filter { it.id !in ids }
    }

    fun start(p: PersonRow) {
        if (starting) return
        starting = true
        scope.launch {
            val r = withContext(Dispatchers.IO) {
                Hub.call("startChat", JSONObject().put("id", p.id).put("name", p.name))
            }
            starting = false
            val key = r.optJSONObject("ok")?.optLong("key") ?: 0L
            if (key != 0L) onOpen(key)
            else Toast.makeText(context, "Δεν άνοιξε: " + r.optString("error"), Toast.LENGTH_LONG).show()
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (network == "all") "Νέα συνομιλία" else "Νέα συνομιλία · " + nameOfService(network)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = {
                        Text(
                            when (network) {
                                "signal" -> "Όνομα, όνομα χρήστη ή αριθμός τηλεφώνου"
                                "session" -> "Όνομα, Session ID ή όνομα ONS"
                                else -> "Όνομα"
                            },
                        )
                    },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = {}),
                    modifier = Modifier.fillMaxWidth(),
                )
                // New groups: Session for now (its groups are made here, with us as admin).
                if (network == "session") {
                    TextButton(onClick = { newGroup = true }) { Text("👥 Νέα ομάδα Session") }
                }
                Text(
                    "🔒 Οι νέες συνομιλίες με ένα άτομο είναι κρυπτογραφημένες.",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Box(Modifier.fillMaxWidth().heightIn(min = 120.dp, max = 420.dp)) {
                    when {
                        contacts == null || starting -> CircularProgressIndicator(Modifier.align(Alignment.Center))
                        mine.isEmpty() && others.isEmpty() && !busy ->
                            Text(
                                when {
                                    needle.isNotEmpty() -> "Δεν βρέθηκε κανείς."
                                    network == "signal" -> "Γράψε όνομα, όνομα χρήστη (π.χ. maria.42) ή αριθμό τηλεφώνου με τον κωδικό χώρας (π.χ. +30 69…)."
                                    network == "session" -> "Γράψε το Session ID (66 χαρακτήρες, αρχίζει με 05) ή το όνομα ONS."
                                    else -> "Γράψε ένα όνομα, ή για Signal αριθμό τηλεφώνου ή όνομα χρήστη, για Session το Session ID."
                                },
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.align(Alignment.Center),
                            )
                        else -> LazyColumn {
                            if (mine.isNotEmpty()) {
                                item(key = "h-mine") { GroupLabel("Επαφές (${mine.size})") }
                                items(mine, key = { "m${it.id}" }) { p -> PersonLine(p) { start(p) } }
                            }
                            if (others.isNotEmpty() || busy) {
                                item(key = "h-others") { GroupLabel(if (busy) "Αναζήτηση…" else "Βρέθηκαν") }
                                items(others, key = { "o${it.id}" }) { p -> PersonLine(p) { start(p) } }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Άκυρο") } },
    )
    if (newGroup) NewGroupDialog(network, contacts.orEmpty(), onDismiss = { newGroup = false }, onOpen = onOpen)
}

/** A new group of one service: its name and people from that service's chats. */
@Composable
private fun NewGroupDialog(network: String, people: List<PersonRow>, onDismiss: () -> Unit, onOpen: (Long) -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var title by remember { mutableStateOf("") }
    var chosen by remember { mutableStateOf(setOf<Long>()) }
    var making by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = { if (!making) onDismiss() },
        title = { Text("Νέα ομάδα · " + nameOfService(network)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(title, { title = it }, label = { Text("Όνομα ομάδας") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                GroupLabel("Μέλη" + if (chosen.isEmpty()) "" else " (${chosen.size})")
                Box(Modifier.fillMaxWidth().heightIn(min = 80.dp, max = 360.dp)) {
                    if (making) CircularProgressIndicator(Modifier.align(Alignment.Center))
                    else if (people.isEmpty()) Text(
                        "Δεν έχεις ακόμα συνομιλίες εδώ. Ξεκίνα πρώτα μια συνομιλία με κάθε άτομο που θέλεις στην ομάδα.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    else LazyColumn {
                        items(people, key = { it.id }) { p ->
                            Row(
                                Modifier.fillMaxWidth().clickable { chosen = if (p.id in chosen) chosen - p.id else chosen + p.id }.padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Checkbox(checked = p.id in chosen, onCheckedChange = { chosen = if (it) chosen + p.id else chosen - p.id })
                                Avatar(p.id, p.name, false, 32.dp)
                                Spacer(Modifier.width(10.dp))
                                Text(p.name.ifBlank { p.id.toString() }, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                }
                Text(
                    "Όσοι διαλέξεις παίρνουν πρόσκληση και μπαίνουν όταν τη δεχτούν. Εσύ είσαι ο διαχειριστής.",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        },
        confirmButton = {
            TextButton(enabled = !making && title.isNotBlank() && chosen.isNotEmpty(), onClick = {
                making = true
                scope.launch {
                    val r = withContext(Dispatchers.IO) {
                        Hub.call(
                            "createGroup",
                            JSONObject().put("network", network).put("title", title.trim()).put("people", org.json.JSONArray(chosen.toList())),
                        )
                    }
                    making = false
                    val key = r.optJSONObject("ok")?.optLong("key") ?: 0L
                    if (key != 0L) { onDismiss(); onOpen(key) }
                    else Toast.makeText(context, "Δεν έγινε: " + r.optString("error"), Toast.LENGTH_LONG).show()
                }
            }) { Text("Δημιουργία") }
        },
        dismissButton = { TextButton(enabled = !making, onClick = onDismiss) { Text("Άκυρο") } },
    )
}

@Composable
private fun GroupLabel(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp),
    )
}

@Composable
private fun PersonLine(p: PersonRow, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (p.picture.isNotEmpty()) {
            RemoteImage(p.picture, Modifier.size(40.dp).clip(CircleShape))
        } else {
            Avatar(p.id, p.name, false, 40.dp)
        }
        Spacer(Modifier.width(12.dp))
        Text(
            p.name.ifBlank { p.id.toString() },
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.Medium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f),
        )
        when (eu.erevos.messenger.Hub.networkOf(p.id)) {
            "signal" -> NetworkMark("Signal")
            "session" -> NetworkMark("Session")
            else -> NetworkMark("Messenger")
        }
    }
}

@Composable
private fun NetworkMark(name: String) {
    Text(name, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(start = 8.dp))
}
