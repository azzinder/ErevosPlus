// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui.theme

import android.content.Context
import android.content.res.Resources
import android.os.Build
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import eu.erevos.messenger.PaletteChoice
import eu.erevos.messenger.ThemeStyle
import kotlin.math.pow

/*
 * The colours of the app, ported value for value from Erevos' theme/colors.ts: the palettes of each
 * style for light and dark, the twelve LPHL palettes or a colour of your own, the fixed styles
 * (Nocturne, Neon, Matrix, Paper, Aurora) and Material You, which takes the phone's own tones.
 * Colours are 0xRRGGBB integers here, as the #RRGGBB strings of the original, so that mixing and
 * contrast give the same numbers; Colors (below) is what the screens use.
 */

/** A style's colours for one scheme (Erevos' classic.light, classic.dark ...). */
internal class BaseColors(
    val background: Int,
    val surface: Int,
    val surfaceAlt: Int,
    val surfacePressed: Int,
    val border: Int,
    val text: Int,
    val textMuted: Int,
    val textFaint: Int,
    val primary: Int,
    val primaryPressed: Int,
    val onPrimary: Int,
    val primarySoft: Int,
    val hero: Int,
    val heroText: Int,
    val heroMuted: Int,
    val success: Int,
    val warning: Int,
    val danger: Int,
    val overlay: Color,
)

private fun scrim(alpha: Float) = Color(0, 0, 0).copy(alpha = alpha)
private fun scrim(r: Int, g: Int, b: Int, alpha: Float) = Color(r, g, b).copy(alpha = alpha)

private val ClassicLight = BaseColors(
    background = 0xF7F3EC, surface = 0xFFFFFF, surfaceAlt = 0xEFE8DC, surfacePressed = 0xE5DCCD, border = 0xDDD3C3,
    text = 0x1C1712, textMuted = 0x6B5F52, textFaint = 0x8E8274,
    primary = 0xD9A441, primaryPressed = 0xC4902F, onPrimary = 0x1C1712, primarySoft = 0xF6E7C6,
    hero = 0xD9A441, heroText = 0x1C1712, heroMuted = 0x6B5323,
    success = 0x2F7D6E, warning = 0xA86F12, danger = 0xB8431F, overlay = scrim(28, 23, 18, 0.45f),
)
private val ClassicDark = BaseColors(
    background = 0x0D0B09, surface = 0x17140F, surfaceAlt = 0x2A2520, surfacePressed = 0x352F28, border = 0x4A4036,
    text = 0xF5EFE6, textMuted = 0xBFB6AA, textFaint = 0xA39A8D,
    primary = 0xD9A441, primaryPressed = 0xC4902F, onPrimary = 0x0D0B09, primarySoft = 0x3A2E17,
    hero = 0xD9A441, heroText = 0x0D0B09, heroMuted = 0x5A4520,
    success = 0x7FB2A8, warning = 0xD9A441, danger = 0xE08F6E, overlay = scrim(0.6f),
)

private val ModernistLight = BaseColors(
    background = 0xF3F2F2, surface = 0xF3F2F2, surfaceAlt = 0xEAE9E9, surfacePressed = 0xD7D3D3, border = 0x9F9D9D,
    text = 0x201E1D, textMuted = 0x605D5D, textFaint = 0x9B9797,
    primary = 0xEC3013, primaryPressed = 0xDD2B0F, onPrimary = 0xF3F2F2, primarySoft = 0xFFE0D9,
    hero = 0xEC3013, heroText = 0xF3F2F2, heroMuted = 0xFFE0D9,
    success = 0xAE1800, warning = 0xDD2B0F, danger = 0xEC3013, overlay = scrim(32, 30, 29, 0.5f),
)
private val ModernistDark = BaseColors(
    background = 0x1C1A19, surface = 0x1C1A19, surfaceAlt = 0x2D2B2B, surfacePressed = 0x444141, border = 0x676665,
    text = 0xF3F2F2, textMuted = 0xBAB6B6, textFaint = 0x7D7979,
    primary = 0xFF563C, primaryPressed = 0xFF9783, onPrimary = 0x1C1A19, primarySoft = 0x4D170E,
    hero = 0xEC3013, heroText = 0xF3F2F2, heroMuted = 0xFFC4B8,
    success = 0xFF9783, warning = 0xFF9783, danger = 0xFF563C, overlay = scrim(0.6f),
)

/** Nocturne, the LPHL site's night style: ink on a deep blue-black, one blurple accent. Always dark. */
private val Night = BaseColors(
    background = 0x161826, surface = 0x232532, surfaceAlt = 0x1D1F2E, surfacePressed = 0x282841, border = 0x383946,
    text = 0xE9E9ED, textMuted = 0xB2B6CB, textFaint = 0x9094A8,
    primary = 0x9184D9, primaryPressed = 0xD2CAFF, onPrimary = 0x161826, primarySoft = 0x302A4E,
    hero = 0x262A60, heroText = 0xE9E9ED, heroMuted = 0xE6E2FF,
    success = 0x4DBF94, warning = 0xD9A441, danger = 0xE0697A, overlay = scrim(0.6f),
)

/** Neon: cyan light on a violet-black ground, magenta for what stands out. Always dark. */
private val Neon = BaseColors(
    background = 0x07060F, surface = 0x100E1F, surfaceAlt = 0x17142B, surfacePressed = 0x231E40, border = 0x2E2A55,
    text = 0xEAF6FF, textMuted = 0xA9B4DA, textFaint = 0x7F89B5,
    primary = 0x00E5FF, primaryPressed = 0x7DF3FF, onPrimary = 0x05040C, primarySoft = 0x062F3A,
    hero = 0xFF2BD6, heroText = 0x05040C, heroMuted = 0x5C0F4E,
    success = 0x39FF88, warning = 0xFFD23F, danger = 0xFF4D6D, overlay = scrim(0.7f),
)

/** Matrix: green phosphor on black. Always dark. */
private val Matrix = BaseColors(
    background = 0x000000, surface = 0x020D04, surfaceAlt = 0x05180A, surfacePressed = 0x0A2A12, border = 0x0F5A22,
    text = 0xB6FFC6, textMuted = 0x4CE077, textFaint = 0x2E9E50,
    primary = 0x00FF41, primaryPressed = 0x7DFF9C, onPrimary = 0x000000, primarySoft = 0x003B10,
    hero = 0x00FF41, heroText = 0x000000, heroMuted = 0x00591A,
    success = 0x00FF41, warning = 0xE5FF00, danger = 0xFF4545, overlay = scrim(0.75f),
)

/** Paper: fountain-pen blue on cream, a red margin. Always light. */
private val Paper = BaseColors(
    background = 0xF5EFE3, surface = 0xFBF7EE, surfaceAlt = 0xEDE5D4, surfacePressed = 0xE2D8C3, border = 0xCDBFA4,
    text = 0x221D16, textMuted = 0x5A5042, textFaint = 0x7A6F5E,
    primary = 0x1F4FA3, primaryPressed = 0x173D80, onPrimary = 0xFFFFFF, primarySoft = 0xDCE5F5,
    hero = 0xB3261E, heroText = 0xFFFFFF, heroMuted = 0xF3D6D3,
    success = 0x2D6A4F, warning = 0x8F5F00, danger = 0xB3261E, overlay = scrim(34, 29, 22, 0.45f),
)

/** Aurora: violet on near-white, soft and round. Always light. */
private val Aurora = BaseColors(
    background = 0xF6F7FB, surface = 0xFFFFFF, surfaceAlt = 0xECEEF7, surfacePressed = 0xDFE2F1, border = 0xD3D7EA,
    text = 0x171A2B, textMuted = 0x4D5371, textFaint = 0x767C9C,
    primary = 0x6D4AFF, primaryPressed = 0x5533E8, onPrimary = 0xFFFFFF, primarySoft = 0xE7E1FF,
    hero = 0x6D4AFF, heroText = 0xFFFFFF, heroMuted = 0xE7E1FF,
    success = 0x0F7F62, warning = 0x9A5B00, danger = 0xC8323F, overlay = scrim(23, 26, 43, 0.4f),
)

/** Nocturne's few colours beyond the tokens, for its lines and kickers. */
internal object NocturneInk {
    const val ACCENT_PALE = 0xD2CAFF
    const val ACCENT_PALER = 0xE6E2FF
    const val WASH = 0x282841
    const val FIELD_LINE = 0x424450
}

private const val BLACK = 0x000000
private const val WHITE = 0xFFFFFF

/** Light or dark scheme of a style's own palette (the fixed ones are the same in both). */
private fun stylePalette(style: ThemeStyle, dark: Boolean): BaseColors = when (style) {
    ThemeStyle.MODERNIST -> if (dark) ModernistDark else ModernistLight
    ThemeStyle.NOCTURNE -> Night
    ThemeStyle.NEON -> Neon
    ThemeStyle.MATRIX -> Matrix
    ThemeStyle.PAPER -> Paper
    ThemeStyle.AURORA -> Aurora
    // Classic, and Material You where the phone gives no colours.
    else -> if (dark) ClassicDark else ClassicLight
}

/** Styles with their own colours whatever the palette: Nocturne, Neon, Matrix, Paper, Aurora and Material You. */
internal fun isFixedStyle(style: ThemeStyle): Boolean = when (style) {
    ThemeStyle.CLASSIC, ThemeStyle.MODERNIST -> false
    else -> true
}

/** Whether the Theme setting (system, light, dark) decides a style's scheme (Erevos' followsTheme). */
internal fun followsTheme(style: ThemeStyle): Boolean = !isFixedStyle(style) || style == ThemeStyle.MATERIAL_YOU

/** Fixed styles are always dark (Nocturne, Neon, Matrix) or always light (Paper, Aurora). */
internal fun fixedStyleIsDark(style: ThemeStyle): Boolean = when (style) {
    ThemeStyle.NOCTURNE, ThemeStyle.NEON, ThemeStyle.MATRIX -> true
    else -> false
}

// ---------------------------------------------------------------------------------------------
// Colour arithmetic (colors.ts: mixHex, contrast, readableOn)

internal fun hexColor(rgb: Int): Color = Color(rgb or (0xFF shl 24))

internal fun Color.rgb(): Int = toArgb() and 0xFFFFFF

/** Mixes two colours; `t` is the share of `b`. */
internal fun mixHex(a: Int, b: Int, t: Double): Int {
    fun ch(shift: Int): Int = Math.round(((a shr shift) and 255) * (1 - t) + ((b shr shift) and 255) * t).toInt()
    return (ch(16) shl 16) or (ch(8) shl 8) or ch(0)
}

private fun luminance(hex: Int): Double {
    fun lin(shift: Int): Double {
        val v = ((hex shr shift) and 255) / 255.0
        return if (v <= 0.03928) v / 12.92 else ((v + 0.055) / 1.055).pow(2.4)
    }
    return 0.2126 * lin(16) + 0.7152 * lin(8) + 0.0722 * lin(0)
}

/** WCAG contrast ratio of two colours. */
internal fun contrast(a: Int, b: Int): Double {
    val la = luminance(a)
    val lb = luminance(b)
    return (maxOf(la, lb) + 0.05) / (minOf(la, lb) + 0.05)
}

/** Text on a coloured area must reach this contrast (large, bold text). */
internal const val MIN_CONTRAST = 3.0

/** Small text (links, notes) must reach this on the background. */
internal const val TEXT_CONTRAST = 4.5

/** An ink stepped toward black on a light ground, or white on a dark one, until it reads there as small text. */
internal fun readableOn(ink: Int, ground: Int, min: Double = TEXT_CONTRAST): Int {
    val toward = if (contrast(ground, BLACK) > contrast(ground, WHITE)) BLACK else WHITE
    var c = ink
    var i = 1
    while (i <= 20 && contrast(c, ground) < min) {
        c = mixHex(ink, toward, i * 0.05)
        i++
    }
    return c
}

// ---------------------------------------------------------------------------------------------
// Material You: the phone's tones

/** Android's numbers for the 13 tones of each palette, lightest first. */
private val ToneSteps = listOf(0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)

/**
 * The phone's own colours (Android 12 and later): five palettes made from the wallpaper, three of
 * accents and two of neutrals, each 13 tones from system_*_0 (white) through _10, _50, _100 ... _900
 * to _1000 (black), as 0xRRGGBB.
 */
internal class SystemTones(
    val accent1: IntArray,
    val accent3: IntArray,
    val neutral1: IntArray,
    val neutral2: IntArray,
)

private fun IntArray.tone(step: Int): Int = this[ToneSteps.indexOf(step)]

/** The phone's tones, or null before Android 12 or where it gives none. */
internal fun readSystemTones(context: Context): SystemTones? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return null
    return try {
        val res = context.resources
        val theme = context.theme
        fun read(ids: IntArray) = IntArray(ids.size) { res.getColor(ids[it], theme) and 0xFFFFFF }
        SystemTones(
            accent1 = read(
                intArrayOf(
                    android.R.color.system_accent1_0, android.R.color.system_accent1_10, android.R.color.system_accent1_50,
                    android.R.color.system_accent1_100, android.R.color.system_accent1_200, android.R.color.system_accent1_300,
                    android.R.color.system_accent1_400, android.R.color.system_accent1_500, android.R.color.system_accent1_600,
                    android.R.color.system_accent1_700, android.R.color.system_accent1_800, android.R.color.system_accent1_900,
                    android.R.color.system_accent1_1000,
                ),
            ),
            accent3 = read(
                intArrayOf(
                    android.R.color.system_accent3_0, android.R.color.system_accent3_10, android.R.color.system_accent3_50,
                    android.R.color.system_accent3_100, android.R.color.system_accent3_200, android.R.color.system_accent3_300,
                    android.R.color.system_accent3_400, android.R.color.system_accent3_500, android.R.color.system_accent3_600,
                    android.R.color.system_accent3_700, android.R.color.system_accent3_800, android.R.color.system_accent3_900,
                    android.R.color.system_accent3_1000,
                ),
            ),
            neutral1 = read(
                intArrayOf(
                    android.R.color.system_neutral1_0, android.R.color.system_neutral1_10, android.R.color.system_neutral1_50,
                    android.R.color.system_neutral1_100, android.R.color.system_neutral1_200, android.R.color.system_neutral1_300,
                    android.R.color.system_neutral1_400, android.R.color.system_neutral1_500, android.R.color.system_neutral1_600,
                    android.R.color.system_neutral1_700, android.R.color.system_neutral1_800, android.R.color.system_neutral1_900,
                    android.R.color.system_neutral1_1000,
                ),
            ),
            neutral2 = read(
                intArrayOf(
                    android.R.color.system_neutral2_0, android.R.color.system_neutral2_10, android.R.color.system_neutral2_50,
                    android.R.color.system_neutral2_100, android.R.color.system_neutral2_200, android.R.color.system_neutral2_300,
                    android.R.color.system_neutral2_400, android.R.color.system_neutral2_500, android.R.color.system_neutral2_600,
                    android.R.color.system_neutral2_700, android.R.color.system_neutral2_800, android.R.color.system_neutral2_900,
                    android.R.color.system_neutral2_1000,
                ),
            ),
        )
    } catch (e: Resources.NotFoundException) {
        null
    }
}

/**
 * Material You's colours, taken from the phone's palettes as Android's own apps take them: the
 * neutrals for the ground, the cards and the text, the first accent for what is lit, the third for
 * notes that something worked.
 */
private fun materialColors(tones: SystemTones, dark: Boolean): BaseColors {
    val accent = tones.accent1
    val third = tones.accent3
    val neutral = tones.neutral1
    val variant = tones.neutral2
    if (!dark) {
        val background = neutral.tone(50)
        return BaseColors(
            background = background,
            surface = neutral.tone(10),
            surfaceAlt = variant.tone(100),
            surfacePressed = mixHex(variant.tone(100), variant.tone(200), 0.4),
            border = variant.tone(200),
            text = neutral.tone(900),
            textMuted = readableOn(variant.tone(700), background),
            textFaint = readableOn(variant.tone(500), background, MIN_CONTRAST),
            primary = accent.tone(600),
            primaryPressed = accent.tone(700),
            onPrimary = accent.tone(0),
            primarySoft = accent.tone(100),
            hero = accent.tone(600),
            heroText = accent.tone(0),
            heroMuted = accent.tone(100),
            success = third.tone(600),
            warning = readableOn(0xA86F12, background),
            danger = readableOn(0xB3261E, background),
            overlay = scrim(0.4f),
        )
    }
    val background = neutral.tone(900)
    return BaseColors(
        background = background,
        surface = mixHex(neutral.tone(900), neutral.tone(800), 0.5),
        surfaceAlt = neutral.tone(800),
        surfacePressed = neutral.tone(700),
        border = variant.tone(700),
        text = neutral.tone(100),
        textMuted = readableOn(variant.tone(200), background),
        textFaint = readableOn(variant.tone(400), background, MIN_CONTRAST),
        primary = accent.tone(200),
        primaryPressed = accent.tone(100),
        onPrimary = accent.tone(800),
        primarySoft = accent.tone(700),
        hero = accent.tone(200),
        heroText = accent.tone(800),
        heroMuted = accent.tone(700),
        success = third.tone(200),
        warning = readableOn(0xE7B95A, background),
        danger = readableOn(0xF2B8B5, background),
        overlay = scrim(0.6f),
    )
}

// ---------------------------------------------------------------------------------------------
// LPHL palettes and the owner's own colour

/** Colours offered beside the LPHL accents for "My color". */
private val Swatches = intArrayOf(
    0x0F766E, 0x138A57, 0x65A30D, 0xCA8A04, 0xF59E0B, 0xF97316, 0xEF4444, 0xE11D48,
    0xEC4899, 0xD946EF, 0x8B5CF6, 0x6366F1, 0x3867D6, 0x0EA5E9, 0x14B8A6, 0x64748B,
    0xA16207, 0x7C3AED, 0x0D9488, 0x94A3B8,
)

/** Colours offered for "My color": Erevos' gold, every LPHL accent, then the swatches. */
internal fun customAccentChoices(): List<Int> {
    val lphl = LPHL_PALETTES.values.map { it.light.accent }
    return (listOf(0xD9A441) + lphl + Swatches.toList()).distinct()
}

/** A palette built around one accent, on the LPHL House background and text. */
private fun customPalette(accent: Int, dark: Boolean): LphlMode {
    val house = LPHL_PALETTES.getValue(PaletteChoice.HOUSE)
    val base = if (dark) house.dark else house.light
    fun up(t: Double) = mixHex(accent, WHITE, t)
    fun down(t: Double) = mixHex(accent, BLACK, t)
    val ramp = listOf(up(0.85), up(0.7), up(0.5), up(0.25), accent, down(0.15), down(0.3), down(0.45), down(0.6))
    val ordered = if (dark) ramp.reversed() else ramp
    // White or the House's dark ink on it, whichever reads better.
    val ink = house.light.text
    val onAccent = if (contrast(accent, WHITE) >= contrast(accent, ink)) WHITE else ink
    return LphlMode(base.bg, base.text, accent, accent, onAccent, base.danger, base.neutral, ordered.toIntArray())
}

private fun lphlMode(palette: PaletteChoice, dark: Boolean, customAccent: Int): LphlMode =
    if (palette == PaletteChoice.CUSTOM) {
        customPalette(customAccent, dark)
    } else {
        LPHL_PALETTES.getValue(palette).let { if (dark) it.dark else it.light }
    }

/** Colours for a style and palette (Erevos' paletteColors; the palette sets background, text and accent). */
private fun paletteColors(style: ThemeStyle, dark: Boolean, palette: PaletteChoice, customAccent: Int): BaseColors {
    val base = stylePalette(style, dark)
    if (palette == PaletteChoice.AUTO) return base
    val p = lphlMode(palette, dark, customAccent)
    val flat = style == ThemeStyle.MODERNIST
    return BaseColors(
        background = p.bg,
        surface = if (flat) p.bg else if (dark) mixHex(p.bg, p.neutral(100), 0.6) else mixHex(p.bg, WHITE, 0.7),
        surfaceAlt = if (dark) p.neutral(100) else p.neutral(200),
        surfacePressed = if (dark) p.neutral(200) else p.neutral(300),
        border = if (flat) p.neutral(500) else if (dark) p.neutral(200) else p.neutral(300),
        text = p.text,
        textMuted = if (dark) p.neutral(600) else p.neutral(700),
        textFaint = if (dark) p.neutral(400) else p.neutral(500),
        primary = p.accentField,
        primaryPressed = if (dark) p.ramp(500) else p.ramp(700),
        onPrimary = p.onAccent,
        primarySoft = p.ramp(100),
        hero = p.accentField,
        heroText = p.onAccent,
        heroMuted = mixHex(p.onAccent, p.accentField, 0.3),
        success = p.ramp(700),
        warning = p.ramp(600),
        danger = p.danger,
        overlay = base.overlay,
    )
}

// ---------------------------------------------------------------------------------------------
// What the screens use

/**
 * The app's colours: `ground` (what every screen is painted with; the background unless the glass
 * look draws behind the screens), `sheet` (bars), `popover` (sheets and dialogs) and the surfaces.
 * `accentText` is the accent as small text, deepened where the accent itself would not read. Under
 * glass some of these are see-through (Glass.kt).
 */
internal data class Colors(
    val ground: Color,
    val background: Color,
    val surface: Color,
    val surfaceAlt: Color,
    val surfacePressed: Color,
    val border: Color,
    val sheet: Color,
    val popover: Color,
    val text: Color,
    val textMuted: Color,
    val textFaint: Color,
    val primary: Color,
    val primaryPressed: Color,
    val onPrimary: Color,
    val primarySoft: Color,
    val hero: Color,
    val heroText: Color,
    val heroMuted: Color,
    val success: Color,
    val warning: Color,
    val danger: Color,
    val overlay: Color,
    val accentText: Color,
)

private fun done(c: BaseColors): Colors = Colors(
    ground = hexColor(c.background),
    background = hexColor(c.background),
    surface = hexColor(c.surface),
    surfaceAlt = hexColor(c.surfaceAlt),
    surfacePressed = hexColor(c.surfacePressed),
    border = hexColor(c.border),
    sheet = hexColor(c.surface),
    popover = hexColor(c.surface),
    text = hexColor(c.text),
    textMuted = hexColor(c.textMuted),
    textFaint = hexColor(c.textFaint),
    primary = hexColor(c.primary),
    primaryPressed = hexColor(c.primaryPressed),
    onPrimary = hexColor(c.onPrimary),
    primarySoft = hexColor(c.primarySoft),
    hero = hexColor(c.hero),
    heroText = hexColor(c.heroText),
    heroMuted = hexColor(c.heroMuted),
    success = hexColor(readableOn(c.success, c.background)),
    warning = hexColor(c.warning),
    danger = hexColor(c.danger),
    overlay = c.overlay,
    accentText = hexColor(readableOn(c.primary, c.background)),
)

/**
 * The colours the app uses for a style, scheme and palette (Erevos' buildColors, with the text on
 * coloured areas "as in the palette"). A palette sets the background, text and accent of Classic and
 * Modernist; the other styles have their own colours whatever the palette. Material You takes the
 * phone's `tones`, or Classic's colours where it gives none.
 */
internal fun buildColors(
    style: ThemeStyle,
    dark: Boolean,
    palette: PaletteChoice,
    customAccent: Int,
    tones: SystemTones? = null,
): Colors {
    if (style == ThemeStyle.MATERIAL_YOU) return done(if (tones != null) materialColors(tones, dark) else stylePalette(ThemeStyle.CLASSIC, dark))
    if (isFixedStyle(style)) return done(stylePalette(style, fixedStyleIsDark(style)))
    return done(paletteColors(style, dark, palette, customAccent))
}

/**
 * The accent as the palette defines it for a scheme (not deepened): what the glass's wallpaper is
 * tinted with, and its small text on the smoked side.
 */
internal fun rawAccent(style: ThemeStyle, dark: Boolean, palette: PaletteChoice, customAccent: Int, tones: SystemTones? = null): Int {
    if (style == ThemeStyle.MATERIAL_YOU) return buildColors(style, dark, palette, customAccent, tones).primary.rgb()
    if (isFixedStyle(style)) return stylePalette(style, fixedStyleIsDark(style)).primary
    return when (palette) {
        PaletteChoice.AUTO -> stylePalette(style, dark).primary
        PaletteChoice.CUSTOM -> customAccent
        else -> LPHL_PALETTES.getValue(palette).let { if (dark) it.dark else it.light }.accent
    }
}

/**
 * The accent as small text on a light ground (the site's accent-700, which it uses on its frosted
 * glass): the palette's 700 step; for a style's own colours, its pressed accent.
 */
internal fun deepAccent(style: ThemeStyle, palette: PaletteChoice, customAccent: Int, tones: SystemTones? = null): Int {
    if (style == ThemeStyle.MATERIAL_YOU) return buildColors(style, false, palette, customAccent, tones).primaryPressed.rgb()
    if (isFixedStyle(style)) return stylePalette(style, fixedStyleIsDark(style)).primary
    if (palette == PaletteChoice.AUTO) return stylePalette(style, false).primaryPressed
    return lphlMode(palette, false, customAccent).ramp(700)
}

/** The line styles' own inks: the line of fields and outlined boxes, kickers (Erevos' shape.ink). Null: the colours'. */
internal class StyleInk(val fieldLine: Int, val kicker: Int)

internal fun styleInk(style: ThemeStyle): StyleInk? = when (style) {
    ThemeStyle.NOCTURNE -> StyleInk(NocturneInk.FIELD_LINE, NocturneInk.ACCENT_PALE)
    ThemeStyle.NEON -> StyleInk(0x3B3670, 0xFF7BE6)
    ThemeStyle.MATRIX -> StyleInk(0x13702B, 0x4CE077)
    ThemeStyle.PAPER -> StyleInk(0xB9AA8C, 0xB3261E)
    else -> null
}

/** Neon's and Matrix's light: what is lit glows in its colour. */
internal fun styleGlows(style: ThemeStyle): Boolean = style == ThemeStyle.NEON || style == ThemeStyle.MATRIX

/** Corner radii of a style in dp (Erevos' SHAPES, radius). */
internal class StyleRadius(val sm: Int, val md: Int, val lg: Int, val xl: Int)

internal fun styleRadius(style: ThemeStyle, glass: Boolean): StyleRadius {
    // Glass's corners (the panel's) win over the style's, as on the site.
    if (glass) return StyleRadius(8, 10, 20, 24)
    return when (style) {
        ThemeStyle.MODERNIST, ThemeStyle.MATRIX -> StyleRadius(0, 0, 0, 0)
        ThemeStyle.NOCTURNE -> StyleRadius(6, 8, 8, 8)
        ThemeStyle.NEON -> StyleRadius(4, 6, 10, 14)
        ThemeStyle.PAPER -> StyleRadius(2, 4, 6, 10)
        ThemeStyle.AURORA -> StyleRadius(12, 16, 24, 32)
        ThemeStyle.MATERIAL_YOU -> StyleRadius(8, 12, 16, 28)
        else -> StyleRadius(10, 14, 20, 28)
    }
}
