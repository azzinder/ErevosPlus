// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.sp
import java.text.BreakIterator
import java.text.DateFormat
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.Calendar
import java.util.Date

private val AvatarColors = listOf(
    Color(0xFFE0745C),
    Color(0xFFD9964A),
    Color(0xFF5FAE6E),
    Color(0xFF3FA8A0),
    Color(0xFF4F9BD9),
    Color(0xFF7C6FDB),
    Color(0xFFB36BC9),
    Color(0xFFD96A9A),
)

/** The colour picked for a person or chat from a fixed set. */
fun avatarColor(id: Long): Color = AvatarColors[Math.floorMod(id, AvatarColors.size.toLong()).toInt()]

/** A round avatar: a colour picked by [id], with the first letter of [title], or a group sign for groups. */
@Composable
fun Avatar(id: Long, title: String, group: Boolean, size: Dp) {
    Box(
        Modifier.size(size).clip(CircleShape).background(avatarColor(id)),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            if (group) "👥" else firstLetter(title),
            color = Color.White,
            fontWeight = FontWeight.SemiBold,
            fontSize = (size.value * 0.42f).sp,
        )
    }
}

/** The first visible character, whole even when it is an emoji made of several chars. */
fun firstLetter(title: String): String {
    val t = title.trim()
    if (t.isEmpty()) return ""
    val b = BreakIterator.getCharacterInstance()
    b.setText(t)
    return t.substring(0, b.next()).uppercase()
}

/** Time for today's messages, date for older ones. */
fun shortTime(ms: Long): String {
    if (ms <= 0L) return ""
    val date = Date(ms)
    val now = Calendar.getInstance()
    val then = Calendar.getInstance().apply { time = date }
    val sameDay = now.get(Calendar.YEAR) == then.get(Calendar.YEAR) &&
        now.get(Calendar.DAY_OF_YEAR) == then.get(Calendar.DAY_OF_YEAR)
    return if (sameDay) DateFormat.getTimeInstance(DateFormat.SHORT).format(date)
    else DateFormat.getDateInstance(DateFormat.SHORT).format(date)
}

/** The clock time of a message. */
fun clockTime(ms: Long): String = DateFormat.getTimeInstance(DateFormat.SHORT).format(Date(ms))

fun dayOf(ms: Long): LocalDate = Instant.ofEpochMilli(ms).atZone(ZoneId.systemDefault()).toLocalDate()

/** "Σήμερα", "Χθες" or the date, for the separator between days. */
fun dayLabel(ms: Long): String {
    val day = dayOf(ms)
    val today = LocalDate.now()
    return when (day) {
        today -> "Σήμερα"
        today.minusDays(1) -> "Χθες"
        else -> DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(ms))
    }
}
