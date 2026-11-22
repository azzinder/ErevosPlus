// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui.theme

import android.graphics.BlurMaskFilter
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.ClipOp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Outline
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.layout.findRootCoordinates
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.toSize
import eu.erevos.messenger.GlassKind
import eu.erevos.messenger.PaletteChoice
import eu.erevos.messenger.ThemeStyle
import kotlin.math.hypot

/*
 * The Glass look, ported from Erevos' theme/glass.ts and components/backdrop.tsx: the glass's two
 * sides (frosted at noon, smoked at dusk), the tokens of glass.css value for value, the wallpaper
 * drawn as gradients, the haze over it under panes, the one frosted pane, and the inks stepped
 * until they read on it (withLook). Nothing here blurs the screen: the wallpaper is drawn the same
 * everywhere, and the one pane's frosting is drawn ahead (frostedWall), as Erevos does where the
 * engine cannot blur.
 */

/** The glass's two sides: frosted at noon (dark ink), smoked at dusk (light ink). */
internal enum class GlassSide { NOON, DUSK }

/** The glass's side: by the ink, which is light exactly when the scheme is dark. */
internal fun glassSide(dark: Boolean): GlassSide = if (dark) GlassSide.DUSK else GlassSide.NOON

/** A see-through colour, kept as numbers so that mixing and layering give the original's results. */
private class Rgba(val r: Int, val g: Int, val b: Int, val a: Double) {
    fun color(): Color = Color(r, g, b).copy(alpha = a.toFloat())
}

/** glass.css section 1, value for value. */
private class GlassTokens(
    /** The cards: the panel's widgets on its Home. */
    val glass: Rgba,
    /** One pane under the screens' text: the site's sheet, denser than the panel's widgets. */
    val pane: Rgba,
    val strong: Rgba,
    val well: Rgba,
    val wellStrong: Rgba,
    val edge: Rgba,
    val hi: Rgba,
    val shadow: Rgba,
    val shadowDy: Int,
    val shadowBlur: Int,
    /** The bars' glass over the wallpaper's top, where an opaque colour is needed. */
    val bar: Int,
    /** Pop-overs where nothing blurs what lies under them: nearly opaque (the site's --glass-solid). */
    val solid: Rgba,
    /** The app's own haze over the whole wallpaper, as the glass the site blurs would show it. */
    val haze: Rgba,
)

private val Noon = GlassTokens(
    glass = Rgba(255, 255, 255, 0.66),
    pane = Rgba(255, 255, 255, 0.82),
    strong = Rgba(255, 255, 255, 0.86),
    well = Rgba(255, 255, 255, 0.55),
    wellStrong = Rgba(255, 255, 255, 0.82),
    edge = Rgba(22, 33, 26, 0.12),
    hi = Rgba(255, 255, 255, 0.75),
    shadow = Rgba(22, 33, 26, 0.12),
    shadowDy = 12,
    shadowBlur = 30,
    bar = 0xFBFCFD,
    solid = Rgba(255, 255, 255, 0.97),
    haze = Rgba(255, 255, 255, 0.4),
)

private val Dusk = GlassTokens(
    glass = Rgba(10, 16, 18, 0.74),
    pane = Rgba(10, 16, 18, 0.8),
    strong = Rgba(10, 16, 18, 0.84),
    well = Rgba(255, 255, 255, 0.07),
    wellStrong = Rgba(255, 255, 255, 0.13),
    edge = Rgba(255, 255, 255, 0.16),
    hi = Rgba(255, 255, 255, 0.1),
    shadow = Rgba(0, 0, 0, 0.3),
    shadowDy = 14,
    shadowBlur = 36,
    bar = 0x0A1013,
    solid = Rgba(12, 18, 21, 0.97),
    haze = Rgba(10, 16, 18, 0.45),
)

private fun tokens(side: GlassSide) = if (side == GlassSide.NOON) Noon else Dusk

private const val BLACK = 0x000000
private const val WHITE = 0xFFFFFF

// ---------------------------------------------------------------------------------------------
// Colour layering (glass.ts: mixOver, over, legible)

private typealias Rgb = DoubleArray

private fun rgbOf(hex: Int): Rgb = doubleArrayOf(((hex shr 16) and 255).toDouble(), ((hex shr 8) and 255).toDouble(), (hex and 255).toDouble())

private fun hexOf(c: Rgb): Int {
    fun ch(v: Double) = Math.round(v).toInt().coerceIn(0, 255)
    return (ch(c[0]) shl 16) or (ch(c[1]) shl 8) or ch(c[2])
}

private fun rgbOf(c: Rgba): Rgb = doubleArrayOf(c.r.toDouble(), c.g.toDouble(), c.b.toDouble())

private fun over(top: Rgb, alpha: Double, under: Rgb): Rgb = DoubleArray(3) { alpha * top[it] + (1 - alpha) * under[it] }

private fun lay(top: Rgba, under: Rgb): Rgb = over(rgbOf(top), top.a, under)

/** A see-through colour mixed into another see-through one, as CSS color-mix in sRGB does. */
private fun mixOver(ink: Int, share: Double, rgba: Rgba): Rgba {
    val ic = intArrayOf((ink shr 16) and 255, (ink shr 8) and 255, ink and 255)
    val alpha = share + (1 - share) * rgba.a
    fun ch(i: Int, c: Int) = Math.round((share * ic[i] + (1 - share) * rgba.a * c) / alpha).toInt()
    return Rgba(ch(0, rgba.r), ch(1, rgba.g), ch(2, rgba.b), Math.round(alpha * 1000) / 1000.0)
}

/** A tint an ink is also drawn on: a colour (the ink's own unless given) at an alpha over the ground. */
private class Tint(val color: Int? = null, val alpha: Double)

/**
 * A colour mixed toward another, 2% at a time, until it reads at `ratio` on `ground`, and on its
 * tint over the ground when it has one.
 */
private fun legible(color: Int, toward: Int, ground: Int, ratio: Double, tint: Tint? = null): Int {
    fun reads(c: Int): Boolean =
        contrast(c, ground) >= ratio &&
            (tint == null || contrast(c, hexOf(over(rgbOf(tint.color ?: c), tint.alpha, rgbOf(ground)))) >= ratio)
    var c = color
    var i = 1
    while (i <= 50 && !reads(c)) {
        c = mixHex(color, toward, i * 0.02)
        i++
    }
    return c
}

/** What each kind of glass makes of the cards, the fields (and tracks) and a pressed card; `ink` tints them where a well alone would not show. */
private class Material(val card: Rgba, val field: Rgba, val pressed: Rgba)

private fun material(kind: GlassKind, side: GlassSide, ink: Int): Material {
    val g = tokens(side)
    val noon = side == GlassSide.NOON
    if (kind == GlassKind.ONE_PANE) {
        // Cards are wells in the pane. Fields: at noon a brighter well would vanish on the white pane,
        // so the ink tints the well (5%); at dusk the brighter well shows. Pressed: the ink into the
        // cards' well, 9% at noon, 4% at dusk.
        return Material(g.well, if (noon) mixOver(ink, 0.05, g.well) else g.wellStrong, mixOver(ink, if (noon) 0.09 else 0.04, g.well))
    }
    // Cards are panes of glass. Fields: at noon the ink tints the well (8%); at dusk the well shows.
    // Pressed: the ink into the cards' glass, 12% at noon, 10% at dusk.
    return Material(g.glass, if (noon) mixOver(ink, 0.08, g.well) else g.well, mixOver(ink, if (noon) 0.12 else 0.1, g.glass))
}

// ---------------------------------------------------------------------------------------------
// The wallpaper (glass.css --wall)

/** A glow of the wallpaper: an ellipse rx% by ry% of the screen at (x%, y%), from `alpha` to clear at `fade`% of the way out. */
private class Glow(val rx: Double, val ry: Double, val x: Double, val y: Double, val rgb: Rgb, val alpha: Double, val fade: Double)

/** The sky's stops top to bottom (colour, percent), its glows, the water lines. */
private class Wall(val sky: List<Pair<Int, Double>>, val glows: List<Glow>, val lines: Rgb, val linesAlpha: Double)

/** The site's backdrop filter on its glass, blur(30px) saturate(160%): its saturation. */
private const val FROST_SATURATE = 1.6

/** CSS saturate() (the Filter Effects matrix, in sRGB), clamped. */
private fun saturate(c: Rgb, s: Double): Rgb {
    val (r, g, b) = Triple(c[0], c[1], c[2])
    fun ch(x: Double) = Math.round(x).coerceIn(0L, 255L).toDouble()
    return doubleArrayOf(
        ch((0.213 + 0.787 * s) * r + (0.715 - 0.715 * s) * g + (0.072 - 0.072 * s) * b),
        ch((0.213 - 0.213 * s) * r + (0.715 + 0.285 * s) * g + (0.072 - 0.072 * s) * b),
        ch((0.213 - 0.213 * s) * r + (0.715 - 0.715 * s) * g + (0.072 + 0.928 * s) * b),
    )
}

/** The wallpaper, plain or frosted as the one pane shows it. */
private fun wall(side: GlassSide, accent: Int, frost: Boolean = false): Wall {
    fun f(c: Rgb): Rgb = if (frost) saturate(c, FROST_SATURATE) else c
    fun hex(color: Int): Int = if (frost) hexOf(f(rgbOf(color))) else color
    if (side == GlassSide.NOON) {
        // Frosted, the blur spreads the horizon's edge over about 9% of a screen's height.
        val shore = if (frost) 56.0 else 59.0
        val sea = if (frost) 65.0 else 62.0
        return Wall(
            sky = listOf(
                hex(0xDFE8EE) to 0.0,
                hex(0xE9EEF0) to 40.0,
                hex(mixHex(0xEEF0EA, accent, 0.18)) to shore,
                hex(0xB9CFD6) to sea,
                hex(0xA7C0C8) to 82.0,
                hex(0x96B2BB) to 100.0,
            ),
            glows = listOf(
                Glow(34.0, 28.0, 16.0, 12.0, f(rgbOf(WHITE)), 0.75, 70.0),
                Glow(60.0, 18.0, 50.0, 61.0, f(rgbOf(accent)), 0.28, 72.0),
            ),
            lines = rgbOf(0x163C50),
            linesAlpha = 0.06,
        )
    }
    val shore = if (frost) 55.0 else 58.0
    val sea = if (frost) 65.0 else 62.0
    return Wall(
        sky = listOf(
            hex(0x0A0E18) to 0.0,
            hex(0x151B2B) to 34.0,
            hex(mixHex(0x1D2130, accent, 0.18)) to shore,
            hex(0x0E1B20) to sea,
            hex(0x081114) to 80.0,
            hex(0x050A0C) to 100.0,
        ),
        glows = listOf(
            Glow(30.0, 26.0, 84.0, 14.0, f(doubleArrayOf(120.0, 150.0, 210.0)), 0.22, 70.0),
            Glow(62.0, 16.0, 50.0, 61.0, f(rgbOf(accent)), 0.45, 72.0),
        ),
        lines = rgbOf(WHITE),
        linesAlpha = 0.045,
    )
}

/** The water lines cover the lowest 38% of the wallpaper. */
private const val WATER_FROM = 62.0

private fun colorOf(c: Rgb, alpha: Float = 1f): Color = Color(Math.round(c[0]).toInt(), Math.round(c[1]).toInt(), Math.round(c[2]).toInt()).copy(alpha = alpha)

/** The wallpaper's layers back to front over a w by h area: the sky, then its glows. */
private fun DrawScope.drawSkyAndGlows(w: Float, h: Float, wall: Wall) {
    val stops = wall.sky.map { (hex, at) -> (at / 100.0).toFloat() to hexColor(hex) }.toTypedArray()
    drawRect(Brush.verticalGradient(*stops, startY = 0f, endY = h), size = Size(w, h))
    for (o in wall.glows) {
        val cx = (o.x / 100.0 * w).toFloat()
        val cy = (o.y / 100.0 * h).toFloat()
        val rx = (o.rx / 100.0 * w).toFloat()
        val ry = (o.ry / 100.0 * h).toFloat()
        if (rx <= 0f || ry <= 0f) continue
        val brush = Brush.radialGradient(
            0f to colorOf(o.rgb, o.alpha.toFloat()),
            (o.fade / 100.0).toFloat() to colorOf(o.rgb, 0f),
            center = Offset(cx, cy),
            radius = rx,
        )
        // The ellipse is a circle of rx squeezed to ry in height.
        withTransform({ scale(1f, ry / rx, Offset(cx, cy)) }) {
            drawCircle(brush, radius = rx, center = Offset(cx, cy))
        }
    }
}

/** The water lines: 1 px every 12 px over the lowest 38% of the wallpaper. */
private fun DrawScope.drawWaterLines(w: Float, h: Float, wall: Wall) {
    val color = colorOf(wall.lines, wall.linesAlpha.toFloat())
    val step = 12.dp.toPx()
    val thick = 1.dp.toPx().coerceAtLeast(1f)
    var y = (h * WATER_FROM / 100.0).toFloat()
    while (y < h) {
        drawRect(color, topLeft = Offset(0f, y), size = Size(w, thick))
        y += step
    }
}

// ---------------------------------------------------------------------------------------------
// Where text is hardest to read (glass.ts: hardest)

/** The sky's colour at y% (its stops are opaque: a plain mix between the two around it). */
private fun skyAt(sky: List<Pair<Int, Double>>, y: Double): Rgb {
    for (i in 1 until sky.size) {
        val (top, from) = sky[i - 1]
        val (bottom, to) = sky[i]
        if (y <= to) {
            val t = if (to == from) 1.0 else ((y - from) / (to - from)).coerceIn(0.0, 1.0)
            val a = rgbOf(top)
            val b = rgbOf(bottom)
            return DoubleArray(3) { a[it] + (b[it] - a[it]) * t }
        }
    }
    return rgbOf(sky.last().first)
}

private enum class Spot { TEXT, FIELD, CARD }

private val grounds = HashMap<String, Int>()

/**
 * Where small text is hardest to read under glass: the darkest point at noon (dark ink), the
 * brightest at dusk (light ink), among what may lie under it: the screen's ground (the wallpaper
 * under its haze, for panes; the one pane over the frosted wallpaper), a card on it, a pressed row
 * on either, and the chosen segment ('text'); those and a field ('field'); or a card at rest
 * ('card'). Sampled every half percent down the columns through the glows' centres and the edges.
 */
private fun hardest(side: GlassSide, accent: Int, kind: GlassKind, on: Spot): Int {
    val key = "$side$accent$kind$on"
    grounds[key]?.let { return it }
    val sheet = kind == GlassKind.ONE_PANE
    val noon = side == GlassSide.NOON
    val w = wall(side, accent, sheet)
    val veil = if (sheet) tokens(side).pane else tokens(side).haze
    val m = material(kind, side, if (noon) BLACK else WHITE)
    var pick = 0
    var best = if (noon) Double.POSITIVE_INFINITY else Double.NEGATIVE_INFINITY
    for (x in intArrayOf(0, 16, 50, 84, 100)) {
        var y = 0.0
        while (y <= 100.0) {
            var c = skyAt(w.sky, y)
            for (o in w.glows) {
                val t = hypot((x - o.x) / o.rx, (y - o.y) / o.ry) / (o.fade / 100)
                if (t < 1) c = over(o.rgb, o.alpha * (1 - t), c)
            }
            if (!sheet && y >= WATER_FROM) c = over(w.lines, w.linesAlpha, c)
            val ground = lay(veil, c)
            val onCard = lay(m.card, ground)
            val candidates = ArrayList<Rgb>(8)
            if (on == Spot.CARD) {
                candidates.add(onCard)
            } else {
                candidates.add(ground)
                candidates.add(onCard)
                // Pressed: a row on the ground, or in a card.
                candidates.add(lay(m.pressed, ground))
                candidates.add(lay(m.pressed, onCard))
                // The chosen segment: a card in a field, whose label takes the coloured inks.
                candidates.add(lay(m.card, lay(m.field, ground)))
                if (on == Spot.FIELD) {
                    candidates.add(lay(m.field, ground))
                    candidates.add(lay(m.field, onCard))
                }
            }
            for (candidate in candidates) {
                val hex = hexOf(candidate)
                val lum = contrast(hex, BLACK)
                if (if (noon) lum < best else lum > best) {
                    best = lum
                    pick = hex
                }
            }
            y += 0.5
        }
    }
    grounds[key] = pick
    return pick
}

// ---------------------------------------------------------------------------------------------
// The glass applied to the colours (glass.ts: withLook)

/** Whether glass applies to a style: not those with a scene of their own, nor Material You, whose colours are the phone's. */
fun styleTakesGlass(style: ThemeStyle): Boolean = when (style) {
    ThemeStyle.NEON, ThemeStyle.MATRIX, ThemeStyle.PAPER, ThemeStyle.AURORA, ThemeStyle.MATERIAL_YOU -> false
    else -> true
}

/** Where a pane is used: the one pane makes rows plain and everything else a well in it. */
enum class GlassRole { ROW, CARD, FIELD, BAR }

/** What the glass draws with (Erevos' glass tokens for one side and kind); `on` false gives the inert one. */
@Immutable
data class GlassStyle(
    /** Glass is on: the look is Glass and the style takes glass. Off, every helper does nothing. */
    val on: Boolean,
    val kind: GlassKind,
    val dark: Boolean,
    /** The palette's own accent, which tints the wallpaper. */
    val accent: Color,
    /** What a card, a field (or track) and a pressed row are made of, over the wallpaper or in the one pane. */
    val card: Color,
    val field: Color,
    val pressed: Color,
    /** Bars: denser glass. */
    val strong: Color,
    /** The one pane the screens lie on. */
    val pane: Color,
    /** The thin border, the highlight along a pane's top, and the soft shadow under a pane. */
    val edge: Color,
    val highlight: Color,
    val shadow: Color,
    val shadowDy: Dp,
    val shadowBlur: Dp,
    /** The haze over the wallpaper under panes. */
    val haze: Color,
) {
    companion object {
        val Off = GlassStyle(
            false, GlassKind.PANES, false, Color.Transparent,
            Color.Transparent, Color.Transparent, Color.Transparent, Color.Transparent, Color.Transparent,
            Color.Transparent, Color.Transparent, Color.Transparent, 0.dp, 0.dp, Color.Transparent,
        )
    }
}

val LocalGlass = compositionLocalOf { GlassStyle.Off }

/** The colours with the look applied, and what the glass draws with. */
internal class GlassLook(val colors: Colors, val style: GlassStyle)

/**
 * The colours with glass applied. It makes the screens' ground clear, the cards panes of glass
 * (panes) or wells in the one pane, fields and tracks wells, bars denser glass, and gives small
 * accent text the step the site uses on its glass (deeper on the frosted side, the palette's own
 * bright accent on the smoked one). The screens' text lies on the hazed wallpaper or on the pane
 * straight, so each ink that would read under 4.5:1 (3:1 the faint one) on its hardest point moves
 * toward the text, 2% at a time, until it reads: the muted and the coloured inks get deeper at
 * noon, lighter at dusk. Where nothing blurs what lies under sheets and dialogs they are nearly opaque.
 */
internal fun applyGlass(
    c: Colors,
    style: ThemeStyle,
    dark: Boolean,
    palette: PaletteChoice,
    customAccent: Int,
    kind: GlassKind,
    tones: SystemTones? = null,
): GlassLook {
    val side = glassSide(dark)
    val g = tokens(side)
    val accent = rawAccent(style, dark, palette, customAccent, tones)
    val wallGround = hardest(side, accent, kind, Spot.TEXT)
    val fieldGround = hardest(side, accent, kind, Spot.FIELD)
    val text = legible(c.text.rgb(), if (side == GlassSide.NOON) BLACK else WHITE, fieldGround, TEXT_CONTRAST)
    fun ink(color: Color, ratio: Double = TEXT_CONTRAST, ground: Int = wallGround, tint: Tint? = null): Int =
        legible(color.rgb(), text, ground, ratio, tint)
    val m = material(kind, side, text)
    val accentText = ink(
        hexColor(if (side == GlassSide.NOON) deepAccent(style, palette, customAccent, tones) else rawAccent(style, true, palette, customAccent, tones)),
        TEXT_CONTRAST,
        wallGround,
        // Also the chosen chip's label, on the accent's 14% tint.
        Tint(c.primary.rgb(), 0.14),
    )
    val colors = c.copy(
        ground = Color.Transparent,
        background = hexColor(g.bar),
        surface = m.card.color(),
        surfaceAlt = m.field.color(),
        surfacePressed = m.pressed.color(),
        border = g.edge.color(),
        sheet = g.strong.color(),
        // Sheets and dialogs lie over the screen's text: nearly opaque, as the site's menus.
        popover = g.solid.color(),
        text = hexColor(text),
        textMuted = hexColor(ink(c.textMuted, TEXT_CONTRAST, fieldGround)),
        textFaint = hexColor(ink(c.textFaint, MIN_CONTRAST, fieldGround)),
        success = hexColor(ink(c.success)),
        warning = hexColor(ink(c.warning)),
        // Errors, and a danger button's label on its own tint (0.12 at rest).
        danger = hexColor(ink(c.danger, TEXT_CONTRAST, wallGround, Tint(null, 0.12))),
        accentText = hexColor(accentText),
    )
    val glass = GlassStyle(
        on = true,
        kind = kind,
        dark = dark,
        accent = hexColor(accent),
        card = m.card.color(),
        field = m.field.color(),
        pressed = m.pressed.color(),
        strong = g.strong.color(),
        pane = g.pane.color(),
        edge = g.edge.color(),
        highlight = g.hi.color(),
        shadow = g.shadow.color(),
        shadowDy = g.shadowDy.dp,
        shadowBlur = g.shadowBlur.dp,
        haze = g.haze.color(),
    )
    return GlassLook(colors, glass)
}

// ---------------------------------------------------------------------------------------------
// Drawing

/** The backdrop: the glass's wallpaper with its water lines and, under panes, the haze over it. */
internal fun DrawScope.drawGlassBackdrop(g: GlassStyle) {
    val w = size.width
    val h = size.height
    if (w <= 0f || h <= 0f) return
    val side = glassSide(g.dark)
    val scene = wall(side, g.accent.rgb())
    drawSkyAndGlows(w, h, scene)
    drawWaterLines(w, h, scene)
    // Under panes the cards are the glass over the wallpaper, under a haze; the one pane lies over it on each screen.
    if (g.kind == GlassKind.PANES) drawRect(g.haze)
}

/** The soft coloured backdrop behind glass; fills what it is given, draws nothing when glass is off. */
@Composable
fun GlassBackdrop(modifier: Modifier = Modifier) {
    val g = LocalGlass.current
    if (!g.on) return
    Canvas(modifier.fillMaxSize()) { drawGlassBackdrop(g) }
}

/** The same backdrop as a modifier (drawn behind the content); unchanged when glass is off. */
@Composable
fun Modifier.glassBackdrop(): Modifier {
    val g = LocalGlass.current
    if (!g.on) return this
    return this.drawBehind { drawGlassBackdrop(g) }
}

private fun Outline.asPath(): Path = when (this) {
    is Outline.Rectangle -> Path().apply { addRect(rect) }
    is Outline.Rounded -> Path().apply { addRoundRect(roundRect) }
    is Outline.Generic -> path
}

/** A pane's lift, outside it: the panel's soft shadow (glassLift's second part). */
private fun DrawScope.drawLiftShadow(shape: Shape, g: GlassStyle) {
    val path = shape.createOutline(size, layoutDirection, this).asPath()
    clipPath(path, ClipOp.Difference) {
        drawIntoCanvas { canvas ->
            val paint = Paint()
            paint.color = g.shadow
            paint.asFrameworkPaint().setMaskFilter(BlurMaskFilter(g.shadowBlur.toPx() * 0.8f, BlurMaskFilter.Blur.NORMAL))
            canvas.save()
            canvas.translate(0f, g.shadowDy.toPx())
            canvas.drawPath(path, paint)
            canvas.restore()
        }
    }
}

/** A pane's lift, inside it: the panel's inner highlight, a 1 px line along the top (glassLift's first part). */
private fun DrawScope.drawLiftHighlight(shape: Shape, g: GlassStyle) {
    val path = shape.createOutline(size, layoutDirection, this).asPath()
    val shifted = Path().apply { addPath(path, Offset(0f, 1.dp.toPx())) }
    clipPath(path) {
        clipPath(shifted, ClipOp.Difference) {
            drawRect(g.highlight)
        }
    }
}

/**
 * A pane: its fill (a card, a field or a bar's denser glass), a thin edge, and under panes the
 * panel's lift: an inner highlight and a soft shadow. With the one pane (see glassSheet) a row is
 * left plain and the rest are wells in it. Unchanged when glass is off.
 */
@Composable
fun Modifier.glassPane(shape: Shape, role: GlassRole = GlassRole.CARD): Modifier {
    val g = LocalGlass.current
    if (!g.on) return this
    val panes = g.kind == GlassKind.PANES
    if (!panes && role == GlassRole.ROW) return this
    val fill = when (role) {
        GlassRole.BAR -> g.strong
        GlassRole.FIELD -> g.field
        else -> g.card
    }
    val lift = panes && role != GlassRole.FIELD
    var m = this
    // The blurred shadow only under bars: under every row and bubble it would slow scrolling.
    if (lift && role == GlassRole.BAR) m = m.drawBehind { drawLiftShadow(shape, g) }
    m = m.background(fill, shape)
    if (lift) m = m.drawBehind { drawLiftHighlight(shape, g) }
    return m.border(1.dp, g.edge, shape)
}

/**
 * The one big pane behind a screen's content (ONE_PANE only; unchanged for panes or flat): the
 * frosted wallpaper behind its glass, inset 8 dp, with its edge, highlight and shadow.
 */
@Composable
fun Modifier.glassSheet(): Modifier {
    val g = LocalGlass.current
    if (!g.on || g.kind != GlassKind.ONE_PANE) return this
    val shape = RoundedCornerShape(22.dp)
    var origin by remember { mutableStateOf(Offset.Zero) }
    var root by remember { mutableStateOf(Size.Zero) }
    return this
        .padding(horizontal = 8.dp, vertical = 4.dp)
        .onGloballyPositioned {
            origin = it.positionInRoot()
            root = it.findRootCoordinates().size.toSize()
        }
        .drawBehind { drawLiftShadow(shape, g) }
        .clip(shape)
        .drawBehind {
            // Each point of the pane lies over the same point of the (frosted) wallpaper.
            if (root.width > 0f && root.height > 0f) {
                translate(-origin.x, -origin.y) {
                    drawSkyAndGlows(root.width, root.height, wall(glassSide(g.dark), g.accent.rgb(), frost = true))
                }
            }
        }
        .background(g.pane)
        .drawBehind { drawLiftHighlight(shape, g) }
        .border(1.dp, g.edge, shape)
}
