// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosphone

import android.graphics.Canvas
import android.graphics.ColorFilter
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PixelFormat
import android.graphics.drawable.Drawable

/**
 * The call screen's small pictures, drawn from the outlines of Material's icons (24 by 24), so the
 * module needs no image files. `turn` rotates one, as the handset that hangs up.
 */
internal class Glyph(data: String, color: Int, private val turn: Float = 0f) : Drawable() {
  private val path = outline(data)
  private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    this.color = color
    style = Paint.Style.FILL
  }

  override fun draw(canvas: Canvas) {
    val box = bounds
    canvas.save()
    canvas.translate(box.left.toFloat(), box.top.toFloat())
    canvas.scale(box.width() / 24f, box.height() / 24f)
    if (turn != 0f) canvas.rotate(turn, 12f, 12f)
    canvas.drawPath(path, paint)
    canvas.restore()
  }

  override fun setAlpha(alpha: Int) {
    paint.alpha = alpha
  }

  override fun setColorFilter(colorFilter: ColorFilter?) {
    paint.colorFilter = colorFilter
  }

  @Suppress("OVERRIDE_DEPRECATION")
  override fun getOpacity() = PixelFormat.TRANSLUCENT

  companion object {
    const val CALL = "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
    const val MIC = "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
    const val SPEAKER = "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
    const val BLUETOOTH = "M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"
    const val PAUSE = "M6 19h4V5H6v14zm8-14v14h4V5h-4z"
    const val ADD = "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
    const val MERGE = "M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"
    const val SWAP = "M18 4l-4 4h3v7c0 1.1-.9 2-2 2s-2-.9-2-2V8c0-2.21-1.79-4-4-4S5 5.79 5 8v7H2l4 4 4-4H7V8c0-1.1.9-2 2-2s2 .9 2 2v7c0 2.21 1.79 4 4 4s4-1.79 4-4V8h3l-4-4z"
    const val VIDEO = "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
    const val FLIP = "M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"
    const val MESSAGE = "M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"
    // The keypad: twelve dots, as the keys lie.
    val KEYPAD = (0 until 12).joinToString("") { i ->
      val x = 6 + (i % 3) * 6
      val y = 3 + (i / 3) * 6
      if (i == 9 || i == 11) "" else "M$x ${y - 2}c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
    }

    // The outline in SVG's path words (M, L, H, V, C, S, Q, Z, each also relative), which is all
    // these icons use.
    private val WORD = Regex("[MmLlHhVvCcSsQqZz]|-?(?:\\d+\\.?\\d*|\\.\\d+)")

    fun outline(data: String): Path {
      val path = Path()
      val words = WORD.findAll(data).map { it.value }.toList()
      var i = 0
      var command = 'M'
      var x = 0f
      var y = 0f
      var startX = 0f
      var startY = 0f
      // The last curve's second control point, for S, which mirrors it.
      var controlX = 0f
      var controlY = 0f
      var curved = false
      fun number() = words[i++].toFloat()
      while (i < words.size) {
        val word = words[i]
        if (word[0].isLetter()) {
          command = word[0]
          i++
          if (command == 'Z' || command == 'z') {
            path.close()
            x = startX
            y = startY
            curved = false
            continue
          }
          if (i >= words.size) break
        }
        val relative = command.isLowerCase()
        val baseX = if (relative) x else 0f
        val baseY = if (relative) y else 0f
        var curve = false
        when (command.uppercaseChar()) {
          'M' -> {
            x = baseX + number()
            y = baseY + number()
            path.moveTo(x, y)
            startX = x
            startY = y
            // Numbers after a move are lines.
            command = if (relative) 'l' else 'L'
          }
          'L' -> {
            x = baseX + number()
            y = baseY + number()
            path.lineTo(x, y)
          }
          'H' -> {
            x = baseX + number()
            path.lineTo(x, y)
          }
          'V' -> {
            y = baseY + number()
            path.lineTo(x, y)
          }
          'C' -> {
            val x1 = baseX + number()
            val y1 = baseY + number()
            controlX = baseX + number()
            controlY = baseY + number()
            x = baseX + number()
            y = baseY + number()
            path.cubicTo(x1, y1, controlX, controlY, x, y)
            curve = true
          }
          'S' -> {
            val x1 = if (curved) 2 * x - controlX else x
            val y1 = if (curved) 2 * y - controlY else y
            controlX = baseX + number()
            controlY = baseY + number()
            x = baseX + number()
            y = baseY + number()
            path.cubicTo(x1, y1, controlX, controlY, x, y)
            curve = true
          }
          'Q' -> {
            val x1 = baseX + number()
            val y1 = baseY + number()
            x = baseX + number()
            y = baseY + number()
            path.quadTo(x1, y1, x, y)
          }
          else -> i++
        }
        curved = curve
      }
      return path
    }
  }
}
