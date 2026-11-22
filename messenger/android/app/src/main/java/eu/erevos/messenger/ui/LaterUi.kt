// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.Later
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/** "σήμερα 20:00", "αύριο 09:00" or "Πέμ 14/11 09:00". */
fun laterTime(ms: Long): String {
    val c = Calendar.getInstance().apply { timeInMillis = ms }
    val now = Calendar.getInstance()
    val clock = SimpleDateFormat("HH:mm", Locale("el")).format(c.time)
    val days = run {
        val a = (c.clone() as Calendar).apply { set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0) }
        val b = (now.clone() as Calendar).apply { set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0) }
        ((a.timeInMillis - b.timeInMillis) / 86_400_000L).toInt()
    }
    return when (days) {
        0 -> "σήμερα $clock"
        1 -> "αύριο $clock"
        else -> SimpleDateFormat("EEE d/M HH:mm", Locale("el")).format(c.time)
    }
}

/** When to send: a few quick choices, or a day and time picked. */
@Composable
fun LaterPicker(onDismiss: () -> Unit, onPick: (Long) -> Unit) {
    val context = LocalContext.current
    fun at(daysAhead: Int, hour: Int): Long = Calendar.getInstance().apply {
        add(Calendar.DAY_OF_YEAR, daysAhead)
        set(Calendar.HOUR_OF_DAY, hour); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
    }.timeInMillis
    val now = System.currentTimeMillis()
    val choices = buildList {
        add("Σε 1 ώρα" to now + 3_600_000L)
        add("Σε 3 ώρες" to now + 3 * 3_600_000L)
        if (at(0, 20) > now + 15 * 60_000L) add("Απόψε στις 20:00" to at(0, 20))
        add("Αύριο στις 09:00" to at(1, 9))
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Αποστολή αργότερα") },
        text = {
            Column {
                choices.forEach { (label, ms) ->
                    Text(
                        "$label  ·  ${laterTime(ms)}",
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.fillMaxWidth().clickable { onPick(ms) }.padding(vertical = 12.dp),
                    )
                }
                Text(
                    "Ημερομηνία και ώρα…",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.fillMaxWidth().clickable {
                        val c = Calendar.getInstance()
                        DatePickerDialog(context, { _, y, mo, d ->
                            TimePickerDialog(context, { _, h, mi ->
                                val t = Calendar.getInstance().apply { set(y, mo, d, h, mi, 0); set(Calendar.MILLISECOND, 0) }.timeInMillis
                                if (t > System.currentTimeMillis()) onPick(t)
                                else android.widget.Toast.makeText(context, "Η ώρα αυτή πέρασε ήδη.", android.widget.Toast.LENGTH_SHORT).show()
                            }, c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE), true).show()
                        }, c.get(Calendar.YEAR), c.get(Calendar.MONTH), c.get(Calendar.DAY_OF_MONTH)).apply {
                            datePicker.minDate = System.currentTimeMillis() - 1000
                        }.show()
                    }.padding(vertical = 12.dp),
                )
                Text(
                    "Το μήνυμα μένει σε αυτό το κινητό και στέλνεται την ώρα που διάλεξες, αν το κινητό είναι ανοιχτό και συνδεδεμένο.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 6.dp),
                )
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("Άκυρο") } },
    )
}

/** Above the input: what waits to be sent in this chat; a tap lists it, to send now or cancel. */
@Composable
fun LaterBanner(chat: Long) {
    val waiting = Later.items.filter { it.chat == chat }.sortedBy { it.at }
    if (waiting.isEmpty()) return
    var open by remember { mutableStateOf(false) }
    val failed = waiting.count { it.failed.isNotEmpty() }
    Text(
        buildString {
            append("⏰ ")
            append(if (waiting.size == 1) "1 μήνυμα για αργότερα" else "${waiting.size} μηνύματα για αργότερα")
            append(" · ").append(laterTime(waiting.first().at))
            if (failed > 0) append(" · δεν στάλθηκαν: ").append(failed)
        },
        style = MaterialTheme.typography.labelLarge,
        color = if (failed > 0) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
        modifier = Modifier.fillMaxWidth().clickable { open = true }.padding(horizontal = 20.dp, vertical = 6.dp),
    )
    if (open) {
        AlertDialog(
            onDismissRequest = { open = false },
            title = { Text("Για αργότερα") },
            text = {
                Column(Modifier.heightIn(max = 420.dp).verticalScroll(rememberScrollState())) {
                    waiting.forEachIndexed { i, it ->
                        if (i > 0) HorizontalDivider()
                        Column(Modifier.padding(vertical = 8.dp)) {
                            Text(laterTime(it.at), style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                            Text(it.text, maxLines = 4, overflow = TextOverflow.Ellipsis)
                            if (it.failed.isNotEmpty()) {
                                Text("Δεν στάλθηκε: " + errorText(it.failed), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                TextButton(onClick = { Later.sendNow(it.id) }) { Text("Αποστολή τώρα") }
                                TextButton(onClick = { Later.cancel(it.id) }) { Text("Ακύρωση", color = MaterialTheme.colorScheme.error) }
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { open = false }) { Text("Κλείσιμο") } },
        )
    }
}
