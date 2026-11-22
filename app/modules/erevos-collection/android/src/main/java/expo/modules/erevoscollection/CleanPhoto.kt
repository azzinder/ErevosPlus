// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscollection

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException

/**
 * A photo the camera took (CameraPreview.kt), drawn anew as a JPEG that holds nothing but its
 * picture: no place, no time, no phone, no maker's notes. It is turned as the camera's EXIF
 * says (or as `rotation` says when it says nothing), so the new one needs no turning to show
 * upright. Its small picture for the Collection's grid is drawn here too, its shorter side
 * THUMB_SIDE pixels, as lib/collection-import.ts thumbAt draws one. All in memory: nothing is
 * written anywhere, not even for a moment in the cache.
 */
object CleanPhoto {
  /** The cleaned JPEG, with its width and height as it shows, and its small picture (a JPEG too, or null). */
  class Clean(val bytes: ByteArray, val width: Int, val height: Int, val thumb: ByteArray?)

  private const val THUMB_SIDE = 256

  fun of(jpeg: ByteArray, rotation: Int, quality: Int = 95): Clean {
    val orientation = runCatching {
      ExifInterface(ByteArrayInputStream(jpeg)).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_UNDEFINED)
    }.getOrDefault(ExifInterface.ORIENTATION_UNDEFINED)
    val decoded = BitmapFactory.decodeByteArray(jpeg, 0, jpeg.size) ?: throw IOException("The photo could not be read")
    val matrix = matrixFor(orientation, rotation)
    val upright = if (matrix == null) decoded else Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.height, matrix, true)
    if (upright !== decoded) decoded.recycle()
    try {
      val out = ByteArrayOutputStream(jpeg.size)
      if (!upright.compress(Bitmap.CompressFormat.JPEG, quality, out)) throw IOException("The photo could not be drawn")
      return Clean(out.toByteArray(), upright.width, upright.height, thumbOf(upright))
    } finally {
      upright.recycle()
    }
  }

  // The small picture: its shorter side THUMB_SIDE pixels; null if it cannot be drawn.
  private fun thumbOf(photo: Bitmap): ByteArray? = runCatching {
    val shorter = minOf(photo.width, photo.height).coerceAtLeast(1)
    val scale = minOf(1f, THUMB_SIDE.toFloat() / shorter)
    val small = Bitmap.createScaledBitmap(photo, (photo.width * scale).toInt().coerceAtLeast(1), (photo.height * scale).toInt().coerceAtLeast(1), true)
    try {
      ByteArrayOutputStream().also { small.compress(Bitmap.CompressFormat.JPEG, 70, it) }.toByteArray()
    } finally {
      if (small !== photo) small.recycle()
    }
  }.getOrNull()

  // How to turn the picture upright: by the EXIF orientation when there is one, else by `rotation`
  // (CameraX's rotationDegrees). Null when it is upright already.
  private fun matrixFor(orientation: Int, rotation: Int): Matrix? {
    val m = Matrix()
    when (orientation) {
      ExifInterface.ORIENTATION_NORMAL -> return null
      ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> m.setScale(-1f, 1f)
      ExifInterface.ORIENTATION_ROTATE_180 -> m.setRotate(180f)
      ExifInterface.ORIENTATION_FLIP_VERTICAL -> m.setScale(1f, -1f)
      ExifInterface.ORIENTATION_TRANSPOSE -> {
        m.setRotate(90f)
        m.postScale(-1f, 1f)
      }
      ExifInterface.ORIENTATION_ROTATE_90 -> m.setRotate(90f)
      ExifInterface.ORIENTATION_TRANSVERSE -> {
        m.setRotate(-90f)
        m.postScale(-1f, 1f)
      }
      ExifInterface.ORIENTATION_ROTATE_270 -> m.setRotate(270f)
      else -> {
        val degrees = ((rotation % 360) + 360) % 360
        if (degrees == 0) return null
        m.setRotate(degrees.toFloat())
      }
    }
    return m
  }
}
