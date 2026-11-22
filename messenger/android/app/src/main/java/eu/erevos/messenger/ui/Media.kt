// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

@file:OptIn(ExperimentalFoundationApi::class)

package eu.erevos.messenger.ui

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaPlayer
import android.net.Uri
import android.util.LruCache
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.Att
import eu.erevos.messenger.MediaActivity
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

/** A tiny image loader: downloads once, keeps the pictures in memory by address. */
object Pics {
    private const val MAX_BYTES = 24 * 1024 * 1024
    private const val MAX_SIDE = 1280

    private val cache = object : LruCache<String, Bitmap>(24 * 1024 * 1024) {
        override fun sizeOf(key: String, value: Bitmap): Int = value.byteCount
    }

    fun cached(url: String): Bitmap? = cache.get(url)

    /** The picture at [url], or null when it can't be fetched or drawn. */
    suspend fun load(url: String): Bitmap? {
        cache.get(url)?.let { return it }
        val bmp = withContext(Dispatchers.IO) { runCatching { fetch(url) }.getOrNull() }
        if (bmp != null) cache.put(url, bmp)
        return bmp
    }

    /** The picture at [url] at full screen size, for the viewer; not kept in memory. */
    suspend fun loadFull(url: String): Bitmap? =
        withContext(Dispatchers.IO) { runCatching { fetch(url, 2560) }.getOrNull() } ?: cache.get(url)

    private fun fetch(url: String, maxSide: Int = MAX_SIDE): Bitmap? {
        val data = bytes(url) ?: return null
        if (data.isEmpty() || data.size > MAX_BYTES) return null
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(data, 0, data.size, bounds)
        var sample = 1
        while (bounds.outWidth / sample > maxSide || bounds.outHeight / sample > maxSide) sample *= 2
        val opts = BitmapFactory.Options().apply { inSampleSize = sample }
        return BitmapFactory.decodeByteArray(data, 0, data.size, opts)
    }

    /** The bytes at [url]: Meta's link, or a file the engine saved (encrypted media, after decrypting). */
    private fun bytes(url: String): ByteArray? {
        if (url.startsWith("file://")) {
            val f = File(url.removePrefix("file://"))
            return if (f.length() in 1..MAX_BYTES.toLong()) f.readBytes() else null
        }
        val c = URL(url).openConnection() as HttpURLConnection
        try {
            c.connectTimeout = 15000
            c.readTimeout = 20000
            c.instanceFollowRedirects = true
            if (c.responseCode !in 200..299) return null
            return c.inputStream.use { it.readBytes() }
        } finally {
            c.disconnect()
        }
    }
}

/** Opens [url] in whatever app handles it. */
fun openUrl(context: Context, url: String) {
    if (url.isBlank()) return
    try {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: Exception) {
        Toast.makeText(context, "Δεν βρέθηκε εφαρμογή για άνοιγμα", Toast.LENGTH_SHORT).show()
    }
}

/** The picture at [url]; an empty tinted box while it loads or when it fails. */
@Composable
fun RemoteImage(url: String, modifier: Modifier, scale: ContentScale = ContentScale.Crop) {
    val bmp by produceState<Bitmap?>(Pics.cached(url), url) {
        if (url.isNotEmpty() && value == null) value = Pics.load(url)
    }
    val b = bmp
    if (b != null) {
        Image(b.asImageBitmap(), contentDescription = null, modifier = modifier, contentScale = scale)
    } else {
        Box(modifier.background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f)))
    }
}

/** The address a sticker or image is drawn from. */
private fun Att.picture(): String = url.ifEmpty { playUrl }

/** A sticker, drawn without a bubble. */
@Composable
fun StickerView(a: Att, onLongPress: () -> Unit = {}) {
    val context = LocalContext.current
    RemoteImage(
        a.picture(),
        Modifier.size(160.dp).combinedClickable(onLongClick = onLongPress) { MediaActivity.open(context, a.picture(), "image") },
        ContentScale.Fit,
    )
}

/** The attachments of one message, one under the other. Stickers are drawn by the caller when alone. */
@Composable
fun AttachmentViews(atts: List<Att>, imageWidth: Dp, textColor: Color, onLongPress: () -> Unit = {}) {
    val context = LocalContext.current
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        atts.forEach { a ->
            when (a.kind) {
                "sticker" -> StickerView(a, onLongPress)
                "image" -> RemoteImage(
                    a.picture(),
                    Modifier.width(imageWidth).aspectRatio(ratioOf(a)).clip(RoundedCornerShape(10.dp))
                        .combinedClickable(onLongClick = onLongPress) { MediaActivity.open(context, a.picture(), "image", a.name) },
                )
                "video" -> Box(
                    Modifier.width(imageWidth).aspectRatio(ratioOf(a)).clip(RoundedCornerShape(10.dp))
                        .combinedClickable(onLongClick = onLongPress) { MediaActivity.open(context, a.playUrl.ifEmpty { a.url }, "video", a.name) },
                    contentAlignment = Alignment.Center,
                ) {
                    RemoteImage(a.url, Modifier.fillMaxSize())
                    Box(
                        Modifier.size(52.dp).background(Color.Black.copy(alpha = 0.55f), CircleShape),
                        contentAlignment = Alignment.Center,
                    ) { Text("▶", color = Color.White, style = MaterialTheme.typography.titleLarge) }
                }
                "audio" -> VoicePlayer(a.playUrl.ifEmpty { a.url }, a.title == "voice" || a.name.isEmpty(), textColor, onLongPress)
                "location" -> Row(
                    Modifier.combinedClickable(onLongClick = onLongPress) { openUrl(context, a.link) }.padding(vertical = 6.dp),
                ) {
                    Text(
                        "📍 " + (if (a.title == "live") "Ζωντανή τοποθεσία" else a.title.ifBlank { "Τοποθεσία" }),
                        style = MaterialTheme.typography.bodyLarge,
                        color = textColor,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                "contact" -> Text(
                    "👤 " + a.title.ifBlank { "Επαφή" },
                    style = MaterialTheme.typography.bodyLarge,
                    color = textColor,
                    modifier = Modifier.padding(vertical = 6.dp),
                )
                "story" -> Text(
                    "📖 Απάντηση σε ιστορία" + if (a.title.isNotBlank()) ": " + a.title else "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = textColor.copy(alpha = 0.8f),
                    modifier = Modifier.padding(vertical = 4.dp),
                )
                "file" -> Row(
                    Modifier.combinedClickable(onLongClick = onLongPress) { openUrl(context, a.playUrl.ifEmpty { a.url }) }.padding(vertical = 6.dp),
                ) {
                    Text(
                        "📎 " + a.name.ifEmpty { "Αρχείο" },
                        style = MaterialTheme.typography.bodyLarge,
                        color = textColor,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                "link" -> Column(
                    Modifier.width(imageWidth).clip(RoundedCornerShape(10.dp))
                        .background(textColor.copy(alpha = 0.08f))
                        .combinedClickable(onLongClick = onLongPress) { openUrl(context, a.link.ifEmpty { a.playUrl }) },
                ) {
                    if (a.url.isNotEmpty()) {
                        RemoteImage(a.url, Modifier.fillMaxWidth().aspectRatio(1.91f))
                    }
                    Column(Modifier.padding(8.dp)) {
                        if (a.title.isNotEmpty()) {
                            Text(
                                a.title,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = textColor,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                        if (a.link.isNotEmpty()) {
                            Text(
                                a.link,
                                style = MaterialTheme.typography.labelMedium,
                                color = textColor.copy(alpha = 0.7f),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                    }
                }
                else -> Text("📎 Συνημμένο", style = MaterialTheme.typography.bodyLarge, color = textColor)
            }
        }
    }
}

private fun ratioOf(a: Att): Float =
    if (a.w > 0 && a.h > 0) (a.w.toFloat() / a.h).coerceIn(0.5f, 2.2f) else 4f / 3f

/** The line for the chat list or a notification when a message has no text: from its first attachment. */
fun attachmentLabel(kind: String?): String? = when (kind) {
    null -> null
    "image" -> "📷 Φωτογραφία"
    "video" -> "🎬 Βίντεο"
    "audio" -> "🎤 Φωνητικό"
    "file" -> "📎 Αρχείο"
    "sticker" -> "Αυτοκόλλητο"
    "link" -> "🔗 Σύνδεσμος"
    "location" -> "📍 Τοποθεσία"
    "contact" -> "👤 Επαφή"
    "story" -> "📖 Ιστορία"
    else -> null
}

/** A voice message or audio file, played in the bubble: ▶ / ⏸ and the time. */
@Composable
fun VoicePlayer(url: String, voice: Boolean, textColor: Color, onLongPress: () -> Unit = {}) {
    var playing by remember(url) { mutableStateOf(false) }
    var pos by remember(url) { mutableStateOf(0) }
    var length by remember(url) { mutableStateOf(0) }
    val player = remember(url) { arrayOfNulls<MediaPlayer>(1) }
    DisposableEffect(url) {
        onDispose { player[0]?.release(); player[0] = null }
    }
    LaunchedEffect(playing) {
        while (playing) {
            player[0]?.let { pos = it.currentPosition }
            delay(250)
        }
    }
    fun toggle() {
        val p = player[0]
        if (p != null && playing) {
            p.pause(); playing = false; return
        }
        if (p != null) {
            p.start(); playing = true; return
        }
        val mp = MediaPlayer()
        player[0] = mp
        runCatching {
            mp.setDataSource(if (url.startsWith("file://")) url.removePrefix("file://") else url)
            mp.setOnPreparedListener { length = it.duration; it.start(); playing = true }
            mp.setOnCompletionListener { playing = false; pos = 0; it.seekTo(0) }
            mp.prepareAsync()
        }.onFailure { mp.release(); player[0] = null }
    }
    Row(
        Modifier.combinedClickable(enabled = url.isNotEmpty(), onLongClick = onLongPress) { toggle() }.padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier.size(36.dp).background(textColor.copy(alpha = 0.15f), CircleShape),
            contentAlignment = Alignment.Center,
        ) { Text(if (playing) "⏸" else "▶", color = textColor) }
        Spacer(Modifier.width(10.dp))
        Text(
            (if (voice) "🎤 " else "🎵 ") + when {
                url.isEmpty() -> "λήψη…"
                length > 0 -> mmss(pos) + " / " + mmss(length)
                else -> if (voice) "Φωνητικό" else "Ήχος"
            },
            style = MaterialTheme.typography.bodyLarge,
            color = textColor,
        )
    }
}

private fun mmss(ms: Int): String {
    val s = ms / 1000
    return "%d:%02d".format(s / 60, s % 60)
}
