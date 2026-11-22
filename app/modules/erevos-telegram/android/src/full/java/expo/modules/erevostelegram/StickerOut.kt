// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import java.io.File
import java.io.FileOutputStream

/**
 * An Erevos sticker as Telegram takes one: a WebP with see-through parts, 512 on its longer side.
 * The app draws the sticker into a PNG (lib/sticker-image.ts); here it is made a WebP and written
 * to the cache folder "tg-stickers" to be sent. What is a day old there goes with the next one.
 */
object StickerOut {
  private const val SIDE = 512
  private const val KEEP_MS = 24L * 60 * 60 * 1000

  /** The path of the WebP made from `png`; throws when it is no picture. */
  fun fromPng(context: Context, png: ByteArray): String {
    val drawn = BitmapFactory.decodeByteArray(png, 0, png.size) ?: throw IllegalArgumentException("not a picture")
    val scale = SIDE.toFloat() / maxOf(drawn.width, drawn.height)
    val out = if (scale == 1f) drawn else Bitmap.createScaledBitmap(drawn, maxOf(1, Math.round(drawn.width * scale)), maxOf(1, Math.round(drawn.height * scale)), true)
    if (out !== drawn) drawn.recycle()
    val dir = File(context.cacheDir, "tg-stickers").apply { mkdirs() }
    val now = System.currentTimeMillis()
    dir.listFiles()?.forEach { if (now - it.lastModified() > KEEP_MS) it.delete() }
    val file = File(dir, "sticker-${System.nanoTime()}.webp")
    FileOutputStream(file).use { stream ->
      val format = if (Build.VERSION.SDK_INT >= 30) Bitmap.CompressFormat.WEBP_LOSSLESS else @Suppress("DEPRECATION") Bitmap.CompressFormat.WEBP
      out.compress(format, 100, stream)
    }
    out.recycle()
    return file.path
  }
}
