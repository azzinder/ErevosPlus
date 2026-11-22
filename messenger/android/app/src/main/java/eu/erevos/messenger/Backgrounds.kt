// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

/**
 * Chat backgrounds beyond the drawn patterns: one's own photo for all chats, and a background
 * of its own for any one chat (a pattern or a photo). Photos are copied into the app's own
 * files, made smaller and saved again, so nothing of the original (place, camera) is kept.
 */
object Backgrounds {
    /** What a chat shows behind its messages. */
    sealed interface Choice {
        data class Pattern(val kind: WallpaperKind) : Choice
        data class Photo(val file: File) : Choice
    }

    private const val PREFS = "messenger.backgrounds"
    private const val ALL = "all"
    private const val PHOTO = "PHOTO"
    private const val MAX_SIDE = 1920

    private lateinit var app: Context
    private val _version = MutableStateFlow(0)
    /** Grows with every change, so screens redraw. */
    val version: StateFlow<Int> = _version.asStateFlow()

    fun init(context: Context) { app = context.applicationContext }

    private fun dir() = File(app.filesDir, "backgrounds").apply { mkdirs() }
    private fun fileOf(name: String) = File(dir(), "$name.jpg")
    private fun prefs() = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private fun nameOf(chat: Long) = "c$chat"

    /** True when all chats show the owner's photo. */
    fun allPhoto(): Boolean = prefs().getString(ALL, null) == PHOTO && fileOf(ALL).exists()

    /** The chat's own choice: null = the same as all chats. */
    fun own(chat: Long): Choice? {
        val v = prefs().getString(nameOf(chat), null) ?: return null
        if (v == PHOTO) return fileOf(nameOf(chat)).takeIf { it.exists() }?.let { Choice.Photo(it) }
        return enumValues<WallpaperKind>().firstOrNull { it.name == v }?.let { Choice.Pattern(it) }
    }

    /** What [chat] shows (null: the chat list's choice for all). */
    fun choiceFor(chat: Long?): Choice {
        chat?.let { own(it) }?.let { return it }
        if (allPhoto()) return Choice.Photo(fileOf(ALL))
        return Choice.Pattern(Appearance.wallpaper.value)
    }

    /** A pattern for all chats: the photo for all goes. */
    fun clearAllPhoto() {
        prefs().edit().remove(ALL).apply()
        fileOf(ALL).delete()
        _version.value++
    }

    /** The owner's photo for all chats. False when it could not be read. */
    suspend fun setAllPhoto(uri: Uri): Boolean =
        copyPhoto(uri, ALL).also { if (it) { prefs().edit().putString(ALL, PHOTO).apply(); _version.value++ } }

    /** A pattern of its own for one chat. */
    fun setOwnPattern(chat: Long, kind: WallpaperKind) {
        fileOf(nameOf(chat)).delete()
        prefs().edit().putString(nameOf(chat), kind.name).apply()
        _version.value++
    }

    /** A photo of its own for one chat. */
    suspend fun setOwnPhoto(chat: Long, uri: Uri): Boolean =
        copyPhoto(uri, nameOf(chat)).also {
            if (it) { prefs().edit().putString(nameOf(chat), PHOTO).apply(); _version.value++ }
        }

    /** The chat goes back to the background of all chats. */
    fun clearOwn(chat: Long) {
        fileOf(nameOf(chat)).delete()
        prefs().edit().remove(nameOf(chat)).apply()
        _version.value++
    }

    /** The photo, made at most [MAX_SIDE] on its long side, or null. */
    suspend fun load(file: File, maxSide: Int = MAX_SIDE): Bitmap? = withContext(Dispatchers.IO) {
        runCatching { decode(file.readBytes(), maxSide) }.getOrNull()
    }

    private suspend fun copyPhoto(uri: Uri, name: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val data = app.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return@runCatching false
            val bmp = decode(data, MAX_SIDE) ?: return@runCatching false
            val tmp = File(dir(), "$name.tmp")
            tmp.outputStream().use { bmp.compress(Bitmap.CompressFormat.JPEG, 88, it) }
            tmp.renameTo(fileOf(name))
        }.getOrDefault(false)
    }

    private fun decode(data: ByteArray, maxSide: Int): Bitmap? {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(data, 0, data.size, bounds)
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null
        var sample = 1
        while (bounds.outWidth / (sample * 2) >= maxSide || bounds.outHeight / (sample * 2) >= maxSide) sample *= 2
        return BitmapFactory.decodeByteArray(data, 0, data.size, BitmapFactory.Options().apply { inSampleSize = sample })
    }
}
