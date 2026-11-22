// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import eu.erevos.messenger.Kept
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/** The Collection: what the owner kept from any chat, newest first, encrypted on this phone. */
@Composable
fun KeptScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    DisposableEffect(Unit) { onDispose { Kept.closeAll(context) } }
    var removing by remember { mutableStateOf<Kept.Item?>(null) }
    var exporting by remember { mutableStateOf<Kept.Saved?>(null) }
    val saveTo = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("*/*")) { uri ->
        val s = exporting
        exporting = null
        if (uri != null && s != null) scope.launch {
            val err = withContext(Dispatchers.IO) { runCatching { Kept.export(context, s, uri) }.exceptionOrNull() }
            Toast.makeText(context, if (err == null) "Αποθηκεύτηκε." else "Δεν αποθηκεύτηκε: ${err.message}", Toast.LENGTH_LONG).show()
        }
    }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(4.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Text("←", fontSize = 24.sp) }
            Text("⭐ Συλλογή", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
        }
        val list = Kept.items
        if (list.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(32.dp), contentAlignment = Alignment.Center) {
                Text(
                    "Η Συλλογή είναι άδεια. Κράτα πατημένο ένα μήνυμα σε οποιαδήποτε συνομιλία και διάλεξε «⭐ Στη Συλλογή».",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            return@Column
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = WindowInsets.navigationBars.asPaddingValues()) {
            items(list, key = { it.id }) { item ->
                Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            buildString {
                                append(item.chat.ifBlank { "—" })
                                append(" · ").append(nameOfService(item.network))
                                append(" · ").append(SimpleDateFormat("d/M/yy HH:mm", Locale("el")).format(Date(item.ms)))
                            },
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.weight(1f),
                        )
                        TextButton(onClick = { removing = item }) { Text("Αφαίρεση", color = MaterialTheme.colorScheme.error) }
                    }
                    if (item.from.isNotBlank()) Text(item.from, style = MaterialTheme.typography.labelLarge)
                    if (item.text.isNotEmpty()) SelectionContainer { Text(item.text, style = MaterialTheme.typography.bodyLarge) }
                    item.files.forEach { f -> KeptFile(f) { exporting = f; saveTo.launch(f.name.ifBlank { "erevos-file" }) } }
                }
                HorizontalDivider()
            }
        }
    }
    removing?.let { item ->
        AlertDialog(
            onDismissRequest = { removing = null },
            title = { Text("Αφαίρεση από τη Συλλογή;") },
            text = { Text("Σβήνεται από αυτό το κινητό μαζί με τα αρχεία του. Η συνομιλία δεν αλλάζει.") },
            confirmButton = {
                TextButton(onClick = {
                    removing = null
                    scope.launch(Dispatchers.IO) { Kept.remove(item.id) }
                }) { Text("Αφαίρεση", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { removing = null }) { Text("Άκυρο") } },
        )
    }
}

@Composable
private fun KeptFile(f: Kept.Saved, onSave: () -> Unit) {
    val context = LocalContext.current
    val isPicture = f.mime.startsWith("image/") || f.kind == "image" || f.kind == "sticker"
    if (isPicture) {
        val file by produceState<java.io.File?>(null, f.file) {
            value = withContext(Dispatchers.IO) { runCatching { Kept.open(context, f) }.getOrNull() }
        }
        file?.let {
            RemoteImage(
                "file://" + it.absolutePath,
                Modifier.fillMaxWidth().heightIn(max = 320.dp).clip(RoundedCornerShape(12.dp)).clickable(onClick = onSave),
                ContentScale.Fit,
            )
        }
    } else {
        Text(
            "📄 " + f.name.ifBlank { f.mime.ifBlank { "αρχείο" } } + " · αποθήκευση",
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.clickable(onClick = onSave).padding(vertical = 4.dp),
        )
    }
}
