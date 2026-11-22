// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import eu.erevos.messenger.ui.theme.GlassRole
import eu.erevos.messenger.ui.theme.LocalGlass
import eu.erevos.messenger.ui.theme.glassPane
import kotlinx.coroutines.launch

private const val RECENT_EMOJI_PREFS = "messenger.emoji"
private const val RECENT_EMOJI_KEY = "recent"
private const val RECENT_EMOJI_MAX = 32

private fun loadRecentEmoji(context: Context): List<String> =
    context.getSharedPreferences(RECENT_EMOJI_PREFS, Context.MODE_PRIVATE)
        .getString(RECENT_EMOJI_KEY, "").orEmpty()
        .split('\n').filter { it.isNotEmpty() }

private fun pushRecentEmoji(context: Context, emoji: String) {
    val now = (listOf(emoji) + loadRecentEmoji(context).filter { it != emoji }).take(RECENT_EMOJI_MAX)
    context.getSharedPreferences(RECENT_EMOJI_PREFS, Context.MODE_PRIVATE)
        .edit().putString(RECENT_EMOJI_KEY, now.joinToString("\n")).apply()
}

/** The panel under the composer, in place of the keyboard: emoji to type. It is 300 dp high. */
@Composable
fun EmojiPanel(onEmoji: (String) -> Unit, onBackspace: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val glass = LocalGlass.current.on
    val shape = RoundedCornerShape(24.dp)
    Surface(
        shape = shape,
        color = if (glass) Color.Transparent else colors.surface,
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 10.dp, end = 10.dp, bottom = 8.dp)
            .height(300.dp)
            .glassPane(shape, GlassRole.CARD),
    ) {
        Column(Modifier.fillMaxSize()) {
            Column(Modifier.fillMaxWidth()) {
                Text(
                    "Emoji",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary,
                    modifier = Modifier.align(Alignment.CenterHorizontally).padding(vertical = 10.dp),
                )
                Box(Modifier.fillMaxWidth().height(2.dp).background(colors.primary))
            }
            EmojiTab(onEmoji, onBackspace)
        }
    }
}

/** A row of the emoji grid: a heading or one emoji. */
private sealed interface EmojiEntry {
    data class Heading(val title: String) : EmojiEntry
    data class Cell(val emoji: String) : EmojiEntry
}

@Composable
private fun EmojiTab(onEmoji: (String) -> Unit, onBackspace: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    // The recent row is read when the panel opens, so the grid does not shift under your finger.
    val recent = remember { loadRecentEmoji(context) }
    val entries = remember(recent) {
        buildList<EmojiEntry> {
            if (recent.isNotEmpty()) {
                add(EmojiEntry.Heading("Πρόσφατα"))
                recent.forEach { add(EmojiEntry.Cell(it)) }
            }
            EmojiData.categories.forEach { c ->
                add(EmojiEntry.Heading(c.title))
                c.emoji.forEach { add(EmojiEntry.Cell(it)) }
            }
        }
    }
    val gridState = rememberLazyGridState()
    Column(Modifier.fillMaxSize()) {
        // Category buttons jump to their heading; the last key deletes.
        Row(Modifier.fillMaxWidth().padding(horizontal = 6.dp), verticalAlignment = Alignment.CenterVertically) {
            LazyRow(Modifier.weight(1f)) {
                items(EmojiData.categories) { c ->
                    Box(
                        Modifier.size(40.dp).clickable {
                            val at = entries.indexOfFirst { it is EmojiEntry.Heading && it.title == c.title }
                            if (at >= 0) scope.launch { gridState.scrollToItem(at) }
                        },
                        contentAlignment = Alignment.Center,
                    ) { Text(c.icon, fontSize = 20.sp) }
                }
            }
            Box(
                Modifier.size(40.dp).clickable(onClickLabel = "Διαγραφή", onClick = onBackspace),
                contentAlignment = Alignment.Center,
            ) { Text("⌫", fontSize = 22.sp, color = colors.onSurfaceVariant) }
        }
        LazyVerticalGrid(
            columns = GridCells.Adaptive(44.dp),
            state = gridState,
            modifier = Modifier.fillMaxSize().padding(horizontal = 6.dp),
        ) {
            items(
                entries,
                span = { e -> if (e is EmojiEntry.Heading) GridItemSpan(maxLineSpan) else GridItemSpan(1) },
            ) { e ->
                when (e) {
                    is EmojiEntry.Heading -> Text(
                        e.title,
                        style = MaterialTheme.typography.labelLarge,
                        color = colors.onSurfaceVariant,
                        modifier = Modifier.fillMaxWidth().padding(start = 6.dp, top = 10.dp, bottom = 4.dp),
                    )
                    is EmojiEntry.Cell -> Box(
                        Modifier.size(44.dp).clip(RoundedCornerShape(8.dp)).clickable {
                            pushRecentEmoji(context, e.emoji)
                            onEmoji(e.emoji)
                        },
                        contentAlignment = Alignment.Center,
                    ) { Text(e.emoji, fontSize = 26.sp, textAlign = TextAlign.Center) }
                }
            }
        }
    }
}
