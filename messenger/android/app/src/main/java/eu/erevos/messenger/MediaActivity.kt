// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.widget.MediaController
import android.widget.Toast
import android.widget.VideoView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.gestures.transformable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.unit.dp
import eu.erevos.messenger.ui.Pics

/** Full-screen photo (pinch to zoom, double tap) or video player, inside the app. */
class MediaActivity : ComponentActivity() {
    companion object {
        const val EXTRA_URL = "url"
        const val EXTRA_KIND = "kind"
        const val EXTRA_NAME = "name"

        fun open(context: Context, url: String, kind: String, name: String = "") {
            if (url.isBlank()) return
            context.startActivity(
                Intent(context, MediaActivity::class.java)
                    .putExtra(EXTRA_URL, url).putExtra(EXTRA_KIND, kind).putExtra(EXTRA_NAME, name)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val url = intent.getStringExtra(EXTRA_URL).orEmpty()
        val kind = intent.getStringExtra(EXTRA_KIND).orEmpty()
        val name = intent.getStringExtra(EXTRA_NAME).orEmpty()
        setContent {
            Box(Modifier.fillMaxSize().background(Color.Black)) {
                if (kind == "video") VideoPlayer(url) else ZoomImage(url)
                Row(
                    Modifier.fillMaxWidth().safeDrawingPadding().padding(4.dp),
                    horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
                ) {
                    TextButton(onClick = { finish() }) { Text("✕ Κλείσιμο", color = Color.White) }
                    TextButton(onClick = { save(url, kind, name) }) { Text("⬇ Αποθήκευση", color = Color.White) }
                }
            }
        }
    }

    private fun save(url: String, kind: String, name: String) {
        val ext = if (kind == "video") "mp4" else "jpg"
        val file = name.ifBlank { "messenger-${System.currentTimeMillis()}.$ext" }
            .replace(Regex("[^A-Za-z0-9._-]"), "_")
        if (url.startsWith("file://")) {
            // Encrypted media, already decrypted into the app's folder: copy it to Downloads.
            try {
                val src = java.io.File(url.removePrefix("file://"))
                if (android.os.Build.VERSION.SDK_INT >= 29) {
                    val values = android.content.ContentValues().apply {
                        put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, file)
                        put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }
                    val uri = contentResolver.insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                        ?: throw java.io.IOException("no place")
                    contentResolver.openOutputStream(uri)?.use { out -> src.inputStream().use { it.copyTo(out) } }
                } else {
                    @Suppress("DEPRECATION")
                    val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    src.copyTo(java.io.File(dir, file), overwrite = true)
                }
                Toast.makeText(this, "Αποθηκεύτηκε στις Λήψεις", Toast.LENGTH_SHORT).show()
            } catch (_: Exception) {
                Toast.makeText(this, "Δεν αποθηκεύτηκε", Toast.LENGTH_SHORT).show()
            }
            return
        }
        try {
            val req = DownloadManager.Request(Uri.parse(url))
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, file)
            (getSystemService(DOWNLOAD_SERVICE) as DownloadManager).enqueue(req)
            Toast.makeText(this, "Αποθηκεύεται στις Λήψεις", Toast.LENGTH_SHORT).show()
        } catch (_: Exception) {
            Toast.makeText(this, "Δεν αποθηκεύτηκε", Toast.LENGTH_SHORT).show()
        }
    }
}

@Composable
private fun ZoomImage(url: String) {
    val bmp by produceState<Bitmap?>(null, url) { value = Pics.loadFull(url) }
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val state = rememberTransformableState { zoom, pan, _ ->
        scale = (scale * zoom).coerceIn(1f, 6f)
        offset = if (scale == 1f) Offset.Zero else offset + pan
    }
    val b = bmp
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        if (b == null) {
            CircularProgressIndicator(color = Color.White)
        } else {
            Image(
                b.asImageBitmap(),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize()
                    .pointerInput(Unit) {
                        detectTapGestures(onDoubleTap = {
                            if (scale > 1f) { scale = 1f; offset = Offset.Zero } else scale = 2.5f
                        })
                    }
                    .transformable(state)
                    .graphicsLayer(scaleX = scale, scaleY = scale, translationX = offset.x, translationY = offset.y),
            )
        }
    }
}

@Composable
private fun VideoPlayer(url: String) {
    var loading by remember { mutableStateOf(true) }
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        AndroidView(
            factory = { ctx ->
                VideoView(ctx).apply {
                    val controls = MediaController(ctx)
                    controls.setAnchorView(this)
                    setMediaController(controls)
                    setOnPreparedListener { loading = false; start(); controls.show(3000) }
                    setOnErrorListener { _, _, _ ->
                        loading = false
                        Toast.makeText(ctx, "Το βίντεο δεν παίζει", Toast.LENGTH_SHORT).show()
                        true
                    }
                    setVideoURI(Uri.parse(url))
                }
            },
            modifier = Modifier.fillMaxWidth(),
            onRelease = { it.stopPlayback() },
        )
        if (loading) CircularProgressIndicator(color = Color.White)
    }
}
