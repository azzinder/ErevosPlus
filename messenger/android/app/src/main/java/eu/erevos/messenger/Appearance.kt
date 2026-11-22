// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import eu.erevos.messenger.ui.theme.isFixedStyle

enum class ThemeStyle { CLASSIC, MODERNIST, NOCTURNE, NEON, MATRIX, PAPER, AURORA, MATERIAL_YOU }
enum class ThemeMode { SYSTEM, LIGHT, DARK }
enum class BubbleShape { ROUND, SQUARE, LINE }
enum class WallpaperKind { PLAIN, DOTS, GRID, STRIPES, STARS, GRADIENT }
enum class Look { FLAT, GLASS }
enum class GlassKind { PANES, ONE_PANE }

/**
 * The colours of the classic and modernist styles: their own, one of the twelve LPHL palettes, or a
 * colour of your own (Erevos' PALETTE_CHOICES, in the same order). The other styles keep their own colours.
 */
enum class PaletteChoice { AUTO, HOUSE, THERMAIKOS, VARDARIS, KIPOS, KERAMIDI, LYCHNARI, VESPERI, MODERNIST, RODAKINI, FISTIKI, GALAZIO, LILA, CUSTOM }
enum class TextSizeOption(val scale: Float) { SMALL(0.9f), NORMAL(1f), LARGE(1.15f) }

/** The look of the app, chosen in the settings screen and kept in SharedPreferences. */
object Appearance {
    /** The twelve LPHL palette accents (the light variants of Erevos' lphl-palettes.ts), as ARGB. */
    val ACCENTS: List<Long> = listOf(
        0xFFFF9900, 0xFF2F7FC4, 0xFF17827F, 0xFF4A8B2C, 0xFFB4502A, 0xFFA8751A,
        0xFF6B4FA8, 0xFFEC3013, 0xFFF0A07A, 0xFF9DC489, 0xFF92B9DD, 0xFFB4A2D6,
    )

    /** The colour of "My color" until one is chosen: Erevos' gold. */
    const val DEFAULT_CUSTOM_ACCENT: Long = 0xFFD9A441

    private var prefs: SharedPreferences? = null

    /** The style (Classic or Modernist) a style with its own colours was chosen over, which a palette goes back to. */
    private var prevStyle = ThemeStyle.CLASSIC

    private val _style = MutableStateFlow(ThemeStyle.CLASSIC)
    private val _theme = MutableStateFlow(ThemeMode.SYSTEM)
    private val _accent = MutableStateFlow<Long?>(null)
    private val _palette = MutableStateFlow(PaletteChoice.AUTO)
    private val _bubbles = MutableStateFlow(BubbleShape.ROUND)
    private val _wallpaper = MutableStateFlow(WallpaperKind.PLAIN)
    private val _textSize = MutableStateFlow(TextSizeOption.NORMAL)
    private val _look = MutableStateFlow(Look.FLAT)
    private val _glassKind = MutableStateFlow(GlassKind.PANES)

    val style: StateFlow<ThemeStyle> = _style.asStateFlow()
    val theme: StateFlow<ThemeMode> = _theme.asStateFlow()
    /** The colour of the "My color" palette (null: not chosen yet). The other palettes bring their own. */
    val accent: StateFlow<Long?> = _accent.asStateFlow()
    val palette: StateFlow<PaletteChoice> = _palette.asStateFlow()
    val bubbles: StateFlow<BubbleShape> = _bubbles.asStateFlow()
    val wallpaper: StateFlow<WallpaperKind> = _wallpaper.asStateFlow()
    val textSize: StateFlow<TextSizeOption> = _textSize.asStateFlow()
    val look: StateFlow<Look> = _look.asStateFlow()
    val glassKind: StateFlow<GlassKind> = _glassKind.asStateFlow()

    /** Safe to call more than once; call it from Application.onCreate. */
    @Synchronized
    fun init(context: Context) {
        if (prefs != null) return
        val p = context.applicationContext.getSharedPreferences("messenger.appearance", Context.MODE_PRIVATE)
        prefs = p
        _style.value = p.enum("style", ThemeStyle.CLASSIC)
        _theme.value = p.enum("theme", ThemeMode.SYSTEM)
        prevStyle = p.enum("prevStyle", ThemeStyle.CLASSIC).takeUnless { isFixedStyle(it) } ?: ThemeStyle.CLASSIC
        _accent.value = if (p.contains("accent")) p.getLong("accent", 0L) else null
        // Before palettes the accent was all there was: none is the style's colours, one of the
        // twelve is that palette, any other is a colour of the owner's.
        _palette.value = if (p.contains("palette")) p.enum("palette", PaletteChoice.AUTO) else paletteOfAccent(_accent.value)
        _bubbles.value = p.enum("bubbles", BubbleShape.ROUND)
        _wallpaper.value = p.enum("wallpaper", WallpaperKind.PLAIN)
        _textSize.value = p.enum("textSize", TextSizeOption.NORMAL)
        _look.value = p.enum("look", Look.FLAT)
        _glassKind.value = p.enum("glassKind", GlassKind.PANES)
    }

    fun setStyle(v: ThemeStyle) {
        val old = _style.value
        if (isFixedStyle(v) && !isFixedStyle(old)) {
            prevStyle = old
            save { putString("prevStyle", old.name) }
        }
        _style.value = v
        save { putString("style", v.name) }
    }
    fun setTheme(v: ThemeMode) { _theme.value = v; save { putString("theme", v.name) } }
    /** A palette chosen in Appearance: from a style with its own colours (Nocturne ...) the style goes back to the one it was chosen over. */
    fun choosePalette(v: PaletteChoice) {
        if (isFixedStyle(_style.value)) setStyle(prevStyle)
        setPalette(v)
    }
    fun setPalette(v: PaletteChoice) { _palette.value = v; save { putString("palette", v.name) } }
    fun setCustomAccent(v: Long) {
        _accent.value = v
        save { putLong("accent", v) }
    }
    /** As before palettes: null takes the style's colours, one of ACCENTS its palette, any other colour is "My color". */
    fun setAccent(v: Long?) {
        if (v != null && v !in ACCENTS) setCustomAccent(v)
        setPalette(paletteOfAccent(v))
    }

    private fun paletteOfAccent(v: Long?): PaletteChoice = when {
        v == null -> PaletteChoice.AUTO
        v in ACCENTS -> PaletteChoice.entries[1 + ACCENTS.indexOf(v)]
        else -> PaletteChoice.CUSTOM
    }
    fun setBubbles(v: BubbleShape) { _bubbles.value = v; save { putString("bubbles", v.name) } }
    fun setWallpaper(v: WallpaperKind) { _wallpaper.value = v; save { putString("wallpaper", v.name) } }
    fun setTextSize(v: TextSizeOption) { _textSize.value = v; save { putString("textSize", v.name) } }

    fun setLook(v: Look) { _look.value = v; save { putString("look", v.name) } }
    fun setGlassKind(v: GlassKind) { _glassKind.value = v; save { putString("glassKind", v.name) } }

    private fun save(block: SharedPreferences.Editor.() -> Unit) {
        prefs?.edit()?.apply(block)?.apply()
    }

    private inline fun <reified E : Enum<E>> SharedPreferences.enum(key: String, default: E): E {
        val name = getString(key, null) ?: return default
        return enumValues<E>().firstOrNull { it.name == name } ?: default
    }
}
