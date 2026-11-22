// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui.theme

import android.graphics.Bitmap
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.produceState
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import eu.erevos.messenger.Backgrounds
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.isSpecified
import eu.erevos.messenger.Appearance
import eu.erevos.messenger.BubbleShape
import eu.erevos.messenger.GlassKind
import eu.erevos.messenger.Look
import eu.erevos.messenger.PaletteChoice
import eu.erevos.messenger.ThemeMode
import eu.erevos.messenger.ThemeStyle
import eu.erevos.messenger.WallpaperKind
import kotlin.random.Random

/** Erevos' colour tokens (colors.ts' Colors, with the glass look applied) for the screens that need more than Material's roles. */
internal val LocalErevosColors = staticCompositionLocalOf { buildColors(ThemeStyle.CLASSIC, true, PaletteChoice.AUTO, 0xD9A441) }

/** White or black, whichever reads better on `fill`. */
private fun onFill(fill: Color): Color {
    val rgb = fill.rgb()
    return if (contrast(rgb, 0xFFFFFF) >= contrast(rgb, 0x000000)) Color.White else Color.Black
}

/**
 * Erevos' colours as Material's roles, so that every screen picks them up: the ground and the text
 * on it, the surfaces and the muted text, the accent and the text on it, the lines. Sheets, menus
 * and dialogs (Material's containers) take the popover colour. Under glass the surfaces are the
 * glass's see-through ones and the text is the one stepped to read on it.
 */
private fun schemeOf(c: Colors, dark: Boolean, glass: Boolean): ColorScheme {
    val base = if (dark) darkColorScheme() else lightColorScheme()
    val onSoft = hexColor(readableOn(c.text.rgb(), c.primarySoft.rgb()))
    return base.copy(
        primary = c.primary,
        onPrimary = c.onPrimary,
        primaryContainer = c.primarySoft,
        onPrimaryContainer = onSoft,
        inversePrimary = c.primaryPressed,
        secondary = c.primary,
        onSecondary = c.onPrimary,
        secondaryContainer = c.surfaceAlt,
        onSecondaryContainer = c.text,
        tertiary = c.success,
        onTertiary = onFill(c.success),
        tertiaryContainer = c.primarySoft,
        onTertiaryContainer = onSoft,
        background = c.background,
        onBackground = c.text,
        surface = c.surface,
        onSurface = c.text,
        surfaceVariant = c.surfaceAlt,
        onSurfaceVariant = c.textMuted,
        surfaceTint = c.primary,
        outline = c.border,
        outlineVariant = if (glass) c.border else lerp(c.border, c.background, 0.4f),
        error = c.danger,
        onError = onFill(c.danger),
        errorContainer = lerp(c.background, c.danger, 0.25f),
        onErrorContainer = c.text,
        scrim = c.overlay,
        surfaceContainerLowest = if (glass) c.popover else c.surface,
        surfaceContainerLow = c.popover,
        surfaceContainer = c.popover,
        surfaceContainerHigh = c.popover,
        surfaceContainerHighest = if (glass) c.popover else c.surfaceAlt,
    )
}

/** Everything the theme makes of a look: Erevos' colours, Material's scheme, the glass and the corners. */
internal class ThemeParts(
    val colors: Colors,
    val scheme: ColorScheme,
    val glass: GlassStyle,
    val radius: StyleRadius,
)

/**
 * The theme for a style, scheme and palette (`customAccent` is "My color"'s ARGB, or null for
 * Erevos' gold), with glass over it where asked for and the style takes it.
 */
internal fun buildTheme(
    style: ThemeStyle,
    dark: Boolean,
    palette: PaletteChoice,
    customAccent: Long?,
    tones: SystemTones?,
    glassOn: Boolean,
    kind: GlassKind,
): ThemeParts {
    val custom = (customAccent ?: Appearance.DEFAULT_CUSTOM_ACCENT).toInt() and 0xFFFFFF
    val base = buildColors(style, dark, palette, custom, tones)
    val look = if (glassOn && styleTakesGlass(style)) applyGlass(base, style, dark, palette, custom, kind, tones) else null
    val colors = look?.colors ?: base
    return ThemeParts(colors, schemeOf(colors, dark, look != null), look?.style ?: GlassStyle.Off, styleRadius(style, look != null))
}

/** The colour scheme of a style, as the settings previews use it. */
internal fun styleScheme(style: ThemeStyle, dark: Boolean, palette: PaletteChoice, customAccent: Long?, tones: SystemTones? = null): ColorScheme =
    buildTheme(style, dark, palette, customAccent, tones, glassOn = false, kind = GlassKind.PANES).scheme

/** Whether a style is dark: Nocturne, Neon and Matrix always, Paper and Aurora never, the others as the theme setting says. */
internal fun styleIsDark(style: ThemeStyle, mode: ThemeMode, systemDark: Boolean): Boolean {
    if (!followsTheme(style)) return fixedStyleIsDark(style)
    return when (mode) {
        ThemeMode.SYSTEM -> systemDark
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
    }
}

/** How the chat draws itself: bubble shape, wallpaper and the colours of the messages. */
data class ChatLook(
    val bubbles: BubbleShape,
    val wallpaper: WallpaperKind,
    val outgoingBubble: Color,
    val outgoingText: Color,
    val incomingBubble: Color,
    val incomingText: Color,
    /** The accent, for the line of the line bubbles and the outline of the glowing styles. */
    val outgoingLine: Color,
    val incomingLine: Color,
)

val LocalChatLook = compositionLocalOf {
    ChatLook(
        BubbleShape.ROUND, WallpaperKind.PLAIN,
        Color(0xFFD9A441), Color(0xFF1C1712), Color(0xFFEFE8DC), Color(0xFF1C1712),
        Color(0xFFD9A441), Color(0xFFDDD3C3),
    )
}

internal fun chatLookFor(
    scheme: ColorScheme,
    style: ThemeStyle,
    bubbles: BubbleShape,
    wallpaper: WallpaperKind,
): ChatLook {
    val glow = styleGlows(style)
    val outgoing = if (glow) lerp(scheme.background, scheme.primary, 0.18f) else scheme.primary
    val outgoingText = if (glow) scheme.onBackground else scheme.onPrimary
    return ChatLook(
        bubbles = bubbles,
        wallpaper = wallpaper,
        outgoingBubble = outgoing,
        outgoingText = outgoingText,
        incomingBubble = scheme.surfaceVariant,
        incomingText = scheme.onSurface,
        outgoingLine = scheme.primary,
        // The line styles' kicker colour; else the muted text.
        incomingLine = styleInk(style)?.let { hexColor(it.kicker) } ?: scheme.onSurfaceVariant,
    )
}

private fun scaled(t: Typography, f: Float, family: FontFamily?): Typography {
    if (f == 1f && family == null) return t
    fun TextStyle.s() = copy(
        fontFamily = family ?: fontFamily,
        fontSize = if (fontSize.isSpecified) fontSize * f else fontSize,
        lineHeight = if (lineHeight.isSpecified) lineHeight * f else lineHeight,
    )
    return t.copy(
        displayLarge = t.displayLarge.s(), displayMedium = t.displayMedium.s(), displaySmall = t.displaySmall.s(),
        headlineLarge = t.headlineLarge.s(), headlineMedium = t.headlineMedium.s(), headlineSmall = t.headlineSmall.s(),
        titleLarge = t.titleLarge.s(), titleMedium = t.titleMedium.s(), titleSmall = t.titleSmall.s(),
        bodyLarge = t.bodyLarge.s(), bodyMedium = t.bodyMedium.s(), bodySmall = t.bodySmall.s(),
        labelLarge = t.labelLarge.s(), labelMedium = t.labelMedium.s(), labelSmall = t.labelSmall.s(),
    )
}

@Composable
fun MessengerTheme(content: @Composable () -> Unit) {
    val style by Appearance.style.collectAsState()
    val mode by Appearance.theme.collectAsState()
    val palette by Appearance.palette.collectAsState()
    val accent by Appearance.accent.collectAsState()
    val bubbles by Appearance.bubbles.collectAsState()
    val wallpaper by Appearance.wallpaper.collectAsState()
    val textSize by Appearance.textSize.collectAsState()
    val lookChoice by Appearance.look.collectAsState()
    val glassKind by Appearance.glassKind.collectAsState()
    val systemDark = isSystemInDarkTheme()
    val context = LocalContext.current

    // Material You takes the phone's own tones (Android 12 and later), as Erevos does.
    val tones = remember(context, style) { if (style == ThemeStyle.MATERIAL_YOU) readSystemTones(context) else null }
    val dark = styleIsDark(style, mode, systemDark)
    val glassOn = lookChoice == Look.GLASS && styleTakesGlass(style)
    val parts = remember(style, dark, palette, accent, tones, glassOn, glassKind) {
        buildTheme(style, dark, palette, accent, tones, glassOn, glassKind)
    }
    val scheme = parts.scheme
    val look = chatLookFor(scheme, style, bubbles, wallpaper)
    val family = when (style) {
        ThemeStyle.MATRIX -> FontFamily.Monospace
        ThemeStyle.PAPER -> FontFamily.Serif
        else -> null
    }
    val typography = remember(textSize, family) { scaled(Typography(), textSize.scale, family) }
    val shapes = remember(parts.radius) {
        val r = parts.radius
        Shapes(
            extraSmall = RoundedCornerShape(r.sm.dp),
            small = RoundedCornerShape(r.sm.dp),
            medium = RoundedCornerShape(r.md.dp),
            large = RoundedCornerShape(r.lg.dp),
            extraLarge = RoundedCornerShape(r.xl.dp),
        )
    }
    CompositionLocalProvider(
        LocalChatLook provides look,
        LocalGlass provides parts.glass,
        LocalErevosColors provides parts.colors,
    ) {
        MaterialTheme(colorScheme = scheme, typography = typography, shapes = shapes) {
            // Text on see-through glass has no surface to take its colour from: give it the theme's.
            CompositionLocalProvider(LocalContentColor provides scheme.onBackground, content = content)
        }
    }
}

/** Draws one wallpaper pattern over the area: subtle, in `ink`, with `accent` for the gradient. */
internal fun DrawScope.drawWallpaper(kind: WallpaperKind, ink: Color, accent: Color, scale: Float = 1f) {
    val w = size.width
    val h = size.height
    val step = 28.dp.toPx() * scale
    when (kind) {
        WallpaperKind.PLAIN -> Unit
        WallpaperKind.DOTS -> {
            val c = ink.copy(alpha = 0.12f)
            var y = step / 2
            while (y < h) {
                var x = step / 2
                while (x < w) {
                    drawCircle(c, radius = 1.5.dp.toPx() * scale, center = Offset(x, y))
                    x += step
                }
                y += step
            }
        }
        WallpaperKind.GRID -> {
            val c = ink.copy(alpha = 0.07f)
            val sw = 1.dp.toPx()
            var x = 0f
            while (x < w) { drawLine(c, Offset(x, 0f), Offset(x, h), sw); x += step }
            var y = 0f
            while (y < h) { drawLine(c, Offset(0f, y), Offset(w, y), sw); y += step }
        }
        WallpaperKind.STRIPES -> {
            val c = ink.copy(alpha = 0.06f)
            val sw = 1.5.dp.toPx()
            var d = -h
            while (d < w) {
                drawLine(c, Offset(d, h), Offset(d + h, 0f), sw)
                d += step * 0.8f
            }
        }
        WallpaperKind.STARS -> {
            val rnd = Random(7)
            val count = ((w * h) / (step * step * 1.6f)).toInt().coerceIn(6, 160)
            repeat(count) {
                val x = rnd.nextFloat() * w
                val y = rnd.nextFloat() * h
                val r = (0.6f + rnd.nextFloat() * 1.6f).dp.toPx() * scale
                drawCircle(ink.copy(alpha = 0.08f + rnd.nextFloat() * 0.14f), radius = r, center = Offset(x, y))
            }
        }
        WallpaperKind.GRADIENT -> {
            drawRect(
                Brush.linearGradient(
                    listOf(accent.copy(alpha = 0.16f), Color.Transparent, accent.copy(alpha = 0.08f)),
                    start = Offset(0f, 0f),
                    end = Offset(w, h),
                ),
                size = Size(w, h),
            )
        }
    }
}

/**
 * The background behind a chat: the chat's own (pattern or photo), else the one for all chats
 * (see Appearance.wallpaper and Backgrounds). Fills what it is given.
 */
@Composable
fun ChatWallpaper(modifier: Modifier = Modifier, chat: Long? = null) {
    val look = LocalChatLook.current
    val bg = MaterialTheme.colorScheme.background
    val ink = MaterialTheme.colorScheme.onBackground
    val accent = MaterialTheme.colorScheme.primary
    // Under glass the backdrop behind the screen shows through instead of a flat ground.
    val glass = LocalGlass.current.on
    val version by Backgrounds.version.collectAsState()
    val pattern by Appearance.wallpaper.collectAsState()
    val choice = remember(version, pattern, chat) { Backgrounds.choiceFor(chat) }
    when (choice) {
        is Backgrounds.Choice.Photo -> {
            val bmp by produceState<Bitmap?>(null, choice.file, version) { value = Backgrounds.load(choice.file) }
            Box(modifier.fillMaxSize()) {
                Canvas(Modifier.fillMaxSize()) { drawRect(bg) }
                bmp?.let {
                    Image(it.asImageBitmap(), contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                }
                // A veil in the theme's ground colour keeps the messages easy to read.
                Canvas(Modifier.fillMaxSize()) { drawRect(bg.copy(alpha = 0.22f)) }
            }
        }
        is Backgrounds.Choice.Pattern -> Canvas(modifier.fillMaxSize()) {
            if (!glass) drawRect(bg)
            drawWallpaper(if (chat == null) look.wallpaper else choice.kind, ink, accent)
        }
    }
}
