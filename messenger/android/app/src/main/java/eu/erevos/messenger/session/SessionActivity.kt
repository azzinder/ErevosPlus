// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.session

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.ui.theme.MessengerTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Adds Session: a new account made here (its 13 recovery words shown once, to write down), or an
 * existing one brought back with its words. No phone number and no e-mail.
 */
class SessionActivity : ComponentActivity() {
    companion object {
        fun open(context: Context) {
            context.startActivity(Intent(context, SessionActivity::class.java))
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // The recovery words must not end up in screenshots or the recent apps picture.
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        enableEdgeToEdge()
        setContent { MessengerTheme { SessionSetup(onDone = { finish() }) } }
    }
}

private enum class Step { Choose, Name, Words, Restore, Done }

@Composable
private fun SessionSetup(onDone: () -> Unit) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    var step by remember { mutableStateOf(Step.Choose) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var name by remember { mutableStateOf("") }
    var words by remember { mutableStateOf("") }
    var sessionId by remember { mutableStateOf("") }
    var wroteDown by remember { mutableStateOf(false) }
    var restoring by remember { mutableStateOf(false) }
    var showWords by remember { mutableStateOf("") }
    var confirmRemove by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val r = withContext(Dispatchers.IO) { Session.call("open") }
        if (r.has("error")) error = sessionError(r.optString("error"))
        if (r.optJSONObject("ok")?.optBoolean("registered") == true) {
            sessionId = withContext(Dispatchers.IO) { Session.call("sessionId").optString("ok") }
            step = Step.Done
        }
    }

    fun run(work: () -> JSONObject, next: (JSONObject) -> Unit) {
        busy = true
        error = null
        scope.launch {
            val r = withContext(Dispatchers.IO) { work() }
            busy = false
            if (r.has("error")) error = sessionError(r.optString("error")) else next(r)
        }
    }

    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).safeDrawingPadding()
                .padding(20.dp).verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text("Session", style = MaterialTheme.typography.headlineMedium)
            if (!Session.available) {
                Text("Η βιβλιοθήκη του Session δεν φορτώθηκε σε αυτό το κινητό.", color = MaterialTheme.colorScheme.error)
                TextButton(onClick = onDone) { Text("Κλείσιμο") }
                return@Column
            }
            when (step) {
                Step.Choose -> {
                    Text("Το Session δεν θέλει αριθμό τηλεφώνου. Ο λογαριασμός είναι ένα κλειδί που φτιάχνεται εδώ, στο κινητό.")
                    Button(onClick = { restoring = false; step = Step.Name }, modifier = Modifier.fillMaxWidth()) {
                        Text("Νέος λογαριασμός")
                    }
                    OutlinedButton(onClick = { restoring = true; step = Step.Restore }, modifier = Modifier.fillMaxWidth()) {
                        Text("Έχω ήδη λογαριασμό (13 λέξεις ανάκτησης)")
                    }
                    TextButton(onClick = onDone) { Text("Άκυρο") }
                }
                Step.Restore -> {
                    Text("Γράψε τις 13 λέξεις ανάκτησης του λογαριασμού σου, με κενό ανάμεσα.")
                    OutlinedTextField(words, { words = it }, label = { Text("Λέξεις ανάκτησης") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
                    Text(
                        "Θα φαίνονται τα μηνύματα που περιμένουν ακόμα στο δίκτυο (έως 14 ημέρες). Οι ομάδες του Session δεν υποστηρίζονται ακόμα.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Button(enabled = words.trim().split(Regex("\\s+")).size == 13, onClick = { step = Step.Name }) { Text("Συνέχεια") }
                    TextButton(onClick = { step = Step.Choose }) { Text("Πίσω") }
                }
                Step.Name -> {
                    Text("Το όνομα που θα βλέπουν οι άλλοι στο Session.")
                    OutlinedTextField(name, { name = it.take(100) }, label = { Text("Όνομα") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(enabled = name.isNotBlank() && !busy, onClick = {
                        if (restoring) {
                            run({ Session.call("restore", JSONObject().put("words", words).put("name", name)) }) { r ->
                                sessionId = r.optJSONObject("ok")?.optString("id").orEmpty()
                                step = Step.Done
                            }
                        } else {
                            run({ Session.call("create", JSONObject().put("name", name)) }) { r ->
                                val ok = r.optJSONObject("ok")
                                sessionId = ok?.optString("id").orEmpty()
                                words = ok?.optString("words").orEmpty()
                                step = Step.Words
                            }
                        }
                    }) { Text("Συνέχεια") }
                    TextButton(onClick = { step = if (restoring) Step.Restore else Step.Choose }) { Text("Πίσω") }
                }
                Step.Words -> {
                    Text("Οι λέξεις ανάκτησης", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Μόνο με αυτές τις 13 λέξεις ξαναβρίσκεις τον λογαριασμό, αν χαθεί το κινητό. Γράψ' τες σε χαρτί και κράτα τες κρυφές. Όποιος τις έχει, έχει τον λογαριασμό.",
                    )
                    Surface(color = MaterialTheme.colorScheme.surfaceVariant, shape = MaterialTheme.shapes.medium) {
                        SelectionContainer {
                            Text(words, fontFamily = FontFamily.Monospace, modifier = Modifier.padding(16.dp))
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(wroteDown, { wroteDown = it })
                        Text("Τις έγραψα κάπου ασφαλές")
                    }
                    Button(enabled = wroteDown, onClick = { step = Step.Done }) { Text("Συνέχεια") }
                }
                Step.Done -> {
                    Text("Το Session μπήκε. Οι συνομιλίες του φαίνονται στην ίδια λίστα, με το σήμα «Session».")
                    Text("Το Session ID σου (το δίνεις σε όποιον θέλει να σου γράψει):", style = MaterialTheme.typography.bodySmall)
                    Surface(color = MaterialTheme.colorScheme.surfaceVariant, shape = MaterialTheme.shapes.medium) {
                        SelectionContainer {
                            Text(sessionId, fontFamily = FontFamily.Monospace, modifier = Modifier.padding(12.dp))
                        }
                    }
                    OutlinedButton(onClick = {
                        val cm = context.getSystemService(ClipboardManager::class.java)
                        cm.setPrimaryClip(ClipData.newPlainText("Session ID", sessionId))
                    }) { Text("Αντιγραφή Session ID") }
                    Text(
                        "Για νέα συνομιλία, γράψε στην αναζήτηση το Session ID ή το όνομα ONS του άλλου.",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Button(onClick = {
                        scope.launch {
                            withContext(Dispatchers.IO) { Session.call("start") }
                            onDone()
                        }
                    }) { Text("Εντάξει") }
                    if (showWords.isEmpty()) {
                        TextButton(onClick = {
                            scope.launch { showWords = withContext(Dispatchers.IO) { Session.call("words").optString("ok") } }
                        }) { Text("Δείξε τις 13 λέξεις ανάκτησης") }
                    } else {
                        Text("Κράτα τες κρυφές. Όποιος τις έχει, έχει τον λογαριασμό.", style = MaterialTheme.typography.bodySmall)
                        Surface(color = MaterialTheme.colorScheme.surfaceVariant, shape = MaterialTheme.shapes.medium) {
                            Text(showWords, fontFamily = FontFamily.Monospace, modifier = Modifier.padding(16.dp))
                        }
                    }
                    TextButton(onClick = { confirmRemove = true }) {
                        Text("Αφαίρεση λογαριασμού από αυτό το κινητό", color = MaterialTheme.colorScheme.error)
                    }
                    if (confirmRemove) {
                        androidx.compose.material3.AlertDialog(
                            onDismissRequest = { confirmRemove = false },
                            title = { Text("Αφαίρεση του Session;") },
                            text = { Text("Ο λογαριασμός και οι συνομιλίες του σβήνονται από αυτό το κινητό. Ξαναμπαίνει μόνο με τις 13 λέξεις, και τα παλιά μηνύματα δεν επιστρέφουν.") },
                            confirmButton = {
                                TextButton(onClick = {
                                    confirmRemove = false
                                    scope.launch {
                                        withContext(Dispatchers.IO) { Session.call("logout") }
                                        eu.erevos.messenger.Hub.forgetNetwork("session")
                                        onDone()
                                    }
                                }) { Text("Αφαίρεση", color = MaterialTheme.colorScheme.error) }
                            },
                            dismissButton = { TextButton(onClick = { confirmRemove = false }) { Text("Άκυρο") } },
                        )
                    }
                }
            }
            if (busy) CircularProgressIndicator()
            error?.let { Text(it, color = MaterialTheme.colorScheme.error) }
        }
    }
}

private fun sessionError(e: String): String = when {
    e.contains("wrong words") -> "Οι λέξεις δεν είναι σωστές. Έλεγξε ότι είναι 13 και γραμμένες σωστά."
    e.contains("not available") -> "Το Session δεν είναι διαθέσιμο σε αυτό το κινητό."
    e.contains("already a Session account") -> "Υπάρχει ήδη λογαριασμός Session σε αυτό το κινητό."
    e.contains("Keystore") -> e
    else -> "Κάτι πήγε στραβά: $e"
}
