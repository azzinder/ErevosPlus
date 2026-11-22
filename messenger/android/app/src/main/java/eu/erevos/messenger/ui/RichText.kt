// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.LinkAnnotation
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextLinkStyles
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextDecoration
import java.text.BreakIterator

/**
 * How many emoji a message is, when it is nothing but one to three of them (no words, no links);
 * 0 for any other text.
 */
fun emojiCount(text: String): Int {
    val t = text.trim()
    if (t.isEmpty() || t.length > 48) return 0
    val breaks = BreakIterator.getCharacterInstance()
    breaks.setText(t)
    var count = 0
    var start = 0
    var end = breaks.next()
    while (end != BreakIterator.DONE) {
        if (!isEmojiCluster(t, start, end)) return 0
        count++
        if (count > 3) return 0
        start = end
        end = breaks.next()
    }
    return count
}

/** One user-perceived character that is an emoji: a pictograph, flag or keycap with its joiners and tones. */
private fun isEmojiCluster(s: String, from: Int, to: Int): Boolean {
    val part = s.substring(from, to)
    val keycap = part.contains('⃣')
    val styled = part.contains('️')
    var base = false
    var i = 0
    while (i < part.length) {
        val cp = part.codePointAt(i)
        i += Character.charCount(cp)
        when {
            cp == 0x200D || cp == 0xFE0F || cp == 0x20E3 -> {}
            cp in 0x1F3FB..0x1F3FF || cp in 0xE0020..0xE007F -> {}
            keycap && (cp in 0x30..0x39 || cp == 0x23 || cp == 0x2A) -> base = true
            cp in 0x1F1E6..0x1F1FF -> base = true
            cp in 0x1F300..0x1FAFF -> base = true
            cp in 0x2600..0x27BF || cp in 0x2B00..0x2BFF || cp in 0x2300..0x23FF -> base = true
            // Marks that are plain text unless followed by the emoji selector.
            styled && (cp == 0xA9 || cp == 0xAE || cp == 0x203C || cp == 0x2049 || cp == 0x2122 || cp == 0x2139 ||
                cp in 0x2190..0x21FF || cp in 0x2934..0x2935 || cp == 0x24C2 || cp in 0x25AA..0x25FE ||
                cp == 0x3030 || cp == 0x303D || cp == 0x3297 || cp == 0x3299) -> base = true
            else -> return false
        }
    }
    return base
}

private val bareUrl = Regex("""(?i)\b(?:https?://|www\.)[^\s<>"]+[^\s<>".,;:!?)\]'"]""")

/** The message text with its web addresses (http, https, www.) tappable; they open with ACTION_VIEW. */
fun linked(text: String, color: Color): AnnotatedString {
    val found = bareUrl.findAll(text).toList()
    if (found.isEmpty()) return AnnotatedString(text)
    val style = TextLinkStyles(SpanStyle(color = color, textDecoration = TextDecoration.Underline))
    return buildAnnotatedString {
        append(text)
        found.forEach {
            val v = it.value
            val url = if (v.startsWith("www.", ignoreCase = true)) "https://$v" else v
            addLink(LinkAnnotation.Url(url, style), it.range.first, it.range.last + 1)
        }
    }
}
