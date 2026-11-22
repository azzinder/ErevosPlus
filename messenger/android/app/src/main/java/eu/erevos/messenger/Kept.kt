// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import java.io.File
import java.net.URL
import java.util.UUID
import org.json.JSONArray
import org.json.JSONObject

/**
 * The Collection, as in Erevos: messages the owner keeps, from any service, with their photos
 * and files copied here. Everything is encrypted on this phone with a Keystore key (KeyWrap), so
 * it stays even when the message is deleted in the chat or the account is removed.
 */
object Kept {
    data class Saved(val kind: String, val name: String, val mime: String, val file: String)
    data class Item(
        val id: String,
        val chat: String,
        val network: String,
        val from: String,
        val ms: Long,
        val savedAt: Long,
        val text: String,
        val files: List<Saved>,
    )

    /** One file at most this big is kept (it is encrypted in memory). */
    const val MAX_FILE = 64L * 1024 * 1024

    var items: List<Item> by mutableStateOf(emptyList())
        private set

    private lateinit var dir: File
    private var readable = true

    fun init(context: Context) {
        dir = File(context.filesDir, "collection").apply { mkdirs() }
        val f = File(dir, "index.bin")
        if (!f.exists()) return
        val a = runCatching { JSONArray(String(KeyWrap.unwrap(f.readBytes()))) }.getOrNull()
        if (a == null) { readable = false; return } // never written over
        items = (0 until a.length()).map { i -> itemOf(a.getJSONObject(i)) }
    }

    /** Keeps a message. Files that cannot be fetched or are too big are left out and counted. Not on the main thread. */
    fun add(context: Context, m: MessageRow, chatName: String): Int {
        check(readable) { "the Collection could not be opened on this phone" }
        var missed = 0
        val files = m.attachments.mapNotNull { a ->
            val src = a.url.ifEmpty { a.playUrl }
            val bytes = runCatching { fetch(context, src) }.getOrNull()
            if (bytes == null) { missed++; return@mapNotNull null }
            val name = UUID.randomUUID().toString() + ".bin"
            File(dir, name).writeBytes(KeyWrap.wrap(bytes))
            Saved(a.kind, a.name.ifEmpty { a.title }, a.mime, name)
        }
        val item = Item(
            UUID.randomUUID().toString(), chatName, Hub.networkOfMessage(m.id), m.name, m.ms, System.currentTimeMillis(), m.text, files,
        )
        synchronized(this) {
            items = listOf(item) + items
            save()
        }
        return missed
    }

    fun remove(id: String) {
        val it = items.firstOrNull { x -> x.id == id } ?: return
        it.files.forEach { f -> File(dir, f.file).delete() }
        synchronized(this) {
            items = items.filterNot { x -> x.id == id }
            save()
        }
    }

    /** A kept file, opened into the app's cache to show it (the cache is cleared with [closeAll]). */
    fun open(context: Context, s: Saved): File {
        val out = File(File(context.cacheDir, "collection").apply { mkdirs() }, s.file.removeSuffix(".bin") + ext(s))
        if (!out.exists()) out.writeBytes(KeyWrap.unwrap(File(dir, s.file).readBytes()))
        return out
    }

    /** Writes a kept file, opened, where the owner chose. */
    fun export(context: Context, s: Saved, to: Uri) {
        context.contentResolver.openOutputStream(to, "wt")?.use { it.write(KeyWrap.unwrap(File(dir, s.file).readBytes())) }
            ?: error("the file could not be written")
    }

    fun closeAll(context: Context) {
        File(context.cacheDir, "collection").deleteRecursively()
    }

    private fun ext(s: Saved) = when {
        s.mime.contains("jpeg") -> ".jpg"
        s.mime.contains("png") -> ".png"
        s.mime.contains("webp") -> ".webp"
        s.mime.contains("gif") -> ".gif"
        s.mime.startsWith("video/") -> ".mp4"
        else -> ""
    }

    private fun fetch(context: Context, src: String): ByteArray? {
        if (src.isEmpty()) return null
        val bytes = when {
            src.startsWith("file://") -> File(Uri.parse(src).path ?: return null).takeIf { it.length() <= MAX_FILE }?.readBytes()
            src.startsWith("content://") -> context.contentResolver.openInputStream(Uri.parse(src))?.use { it.readNBytesCompat() }
            src.startsWith("https://") -> {
                val c = URL(src).openConnection()
                c.connectTimeout = 20_000
                c.readTimeout = 60_000
                if (c.contentLengthLong > MAX_FILE) return null
                c.getInputStream().use { it.readNBytesCompat() }
            }
            else -> null
        }
        return bytes?.takeIf { it.size <= MAX_FILE }
    }

    private fun java.io.InputStream.readNBytesCompat(): ByteArray? {
        val out = java.io.ByteArrayOutputStream()
        val buf = ByteArray(64 * 1024)
        while (true) {
            val n = read(buf)
            if (n < 0) break
            out.write(buf, 0, n)
            if (out.size() > MAX_FILE) return null
        }
        return out.toByteArray()
    }

    private fun save() {
        if (!readable) return
        val a = JSONArray()
        items.forEach { a.put(jsonOf(it)) }
        val tmp = File(dir, "index.tmp")
        tmp.writeBytes(KeyWrap.wrap(a.toString().toByteArray()))
        tmp.renameTo(File(dir, "index.bin"))
    }

    private fun jsonOf(it: Item) = JSONObject()
        .put("id", it.id).put("chat", it.chat).put("network", it.network).put("from", it.from)
        .put("ms", it.ms).put("savedAt", it.savedAt).put("text", it.text)
        .put("files", JSONArray().apply { it.files.forEach { f -> put(JSONObject().put("kind", f.kind).put("name", f.name).put("mime", f.mime).put("file", f.file)) } })

    private fun itemOf(o: JSONObject): Item {
        val fa = o.optJSONArray("files") ?: JSONArray()
        return Item(
            o.getString("id"), o.optString("chat"), o.optString("network"), o.optString("from"), o.optLong("ms"),
            o.optLong("savedAt"), o.optString("text"),
            (0 until fa.length()).map { i -> fa.getJSONObject(i).let { Saved(it.optString("kind"), it.optString("name"), it.optString("mime"), it.getString("file")) } },
        )
    }
}
