// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

package eu.erevos.messenger.ui.settings

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.rememberCoroutineScope
import eu.erevos.messenger.Backgrounds
import eu.erevos.messenger.signal.Signal
import eu.erevos.messenger.signal.SignalActivity
import eu.erevos.messenger.session.Session
import eu.erevos.messenger.session.SessionActivity
import kotlinx.coroutines.launch
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.FilterChip
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.material3.TextButton
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import eu.erevos.messenger.Appearance
import eu.erevos.messenger.BubbleShape
import eu.erevos.messenger.GlassKind
import eu.erevos.messenger.Look
import eu.erevos.messenger.PaletteChoice
import eu.erevos.messenger.TextSizeOption
import eu.erevos.messenger.ThemeMode
import eu.erevos.messenger.ThemeStyle
import eu.erevos.messenger.WallpaperKind
import eu.erevos.messenger.ui.theme.ChatLook
import eu.erevos.messenger.ui.theme.GlassRole
import eu.erevos.messenger.ui.theme.LocalGlass
import eu.erevos.messenger.ui.theme.glassBackdrop
import eu.erevos.messenger.ui.theme.glassPane
import eu.erevos.messenger.ui.theme.styleTakesGlass
import androidx.compose.runtime.CompositionLocalProvider
import eu.erevos.messenger.ui.theme.chatLookFor
import eu.erevos.messenger.ui.theme.drawWallpaper
import eu.erevos.messenger.ui.theme.LocalErevosColors
import eu.erevos.messenger.ui.theme.SystemTones
import eu.erevos.messenger.ui.theme.ThemeParts
import eu.erevos.messenger.ui.theme.buildColors
import eu.erevos.messenger.ui.theme.buildTheme
import eu.erevos.messenger.ui.theme.customAccentChoices
import eu.erevos.messenger.ui.theme.isFixedStyle
import eu.erevos.messenger.ui.theme.readSystemTones
import eu.erevos.messenger.ui.theme.styleIsDark
import eu.erevos.messenger.ui.theme.styleScheme

@Composable
fun SettingsScreen(onBack: () -> Unit) {
    Surface(
        Modifier.fillMaxSize(),
        color = if (LocalGlass.current.on) Color.Transparent else MaterialTheme.colorScheme.background,
    ) {
        Column(
            Modifier
                .statusBarsPadding()
                .navigationBarsPadding()
                .verticalScroll(rememberScrollState()),
        ) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Text("←", fontSize = 24.sp, color = MaterialTheme.colorScheme.onBackground)
                }
                Text(
                    "Ρυθμίσεις",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                )
            }
            AccountsSection()
            AppearanceSection()
            BackupSection()
            Spacer(Modifier.height(24.dp))
        }
    }
}

/** The networks on this phone: their state, adding one, and removing Signal. */
@Composable
private fun AccountsSection() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var signalInfo by remember { mutableStateOf(false) }
    var confirmRemove by remember { mutableStateOf(false) }
    SectionTitle("Λογαριασμοί")
    // Read again each time Settings comes back, so a sign-in made from here shows at once.
    var messengerIn by remember { mutableStateOf(eu.erevos.messenger.Hub.messenger("loggedIn").optBoolean("ok")) }
    androidx.lifecycle.compose.LifecycleResumeEffect(Unit) {
        messengerIn = eu.erevos.messenger.Hub.messenger("loggedIn").optBoolean("ok")
        onPauseOrDispose {}
    }
    if (messengerIn) {
        AccountRow("Messenger", eu.erevos.messenger.Hub.status, null)
    } else {
        AccountRow("Messenger", "Σύνδεση") {
            context.startActivity(
                android.content.Intent(context, eu.erevos.messenger.LoginActivity::class.java)
                    .putExtra(eu.erevos.messenger.LoginActivity.ON_PURPOSE, true),
            )
        }
    }
    when {
        !Signal.available -> AccountRow("Signal", "Δεν υπάρχει σε αυτή την έκδοση", null)
        Signal.ready -> AccountRow("Signal", Signal.phone.ifEmpty { Signal.status.ifEmpty { "Συνδεδεμένο" } }) { signalInfo = true }
        else -> AccountRow("Signal", "Προσθήκη λογαριασμού") { SignalActivity.open(context) }
    }
    when {
        !Session.available -> AccountRow("Session", "Δεν υπάρχει σε αυτή την έκδοση", null)
        Session.ready -> AccountRow("Session", Session.status.ifEmpty { "Συνδεδεμένο" }) { SessionActivity.open(context) }
        else -> AccountRow("Session", "Προσθήκη λογαριασμού") { SessionActivity.open(context) }
    }
    if (signalInfo) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { signalInfo = false },
            title = { Text("Signal") },
            text = {
                Text(
                    (if (Signal.phone.isNotEmpty()) "Αριθμός: ${Signal.phone}\n" else "") +
                        "Κατάσταση: ${Signal.status.ifEmpty { "—" }}",
                )
            },
            confirmButton = { TextButton(onClick = { signalInfo = false }) { Text("Κλείσιμο") } },
            dismissButton = {
                TextButton(onClick = { signalInfo = false; confirmRemove = true }) {
                    Text("Αφαίρεση από αυτό το κινητό", color = MaterialTheme.colorScheme.error)
                }
            },
        )
    }
    if (confirmRemove) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { confirmRemove = false },
            title = { Text("Αφαίρεση του Signal;") },
            text = { Text("Το Signal βγαίνει από αυτό το κινητό και σβήνονται τα μηνύματα και τα αρχεία του εδώ. Για να ξαναμπεί, χρειάζεται νέα εγγραφή ή νέα σύνδεση με QR.\n\nΑν ήταν συνδεδεμένο με το Signal άλλου κινητού, βγάλε το και από εκεί: Signal → Ρυθμίσεις → Συνδεδεμένες συσκευές.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmRemove = false
                    scope.launch {
                        val r = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) { Signal.call("logout") }
                        if (r.has("error")) {
                            Toast.makeText(context, "Δεν αφαιρέθηκε: " + r.optString("error"), Toast.LENGTH_LONG).show()
                        } else {
                            Signal.ready = false
                            Signal.phone = ""
                            eu.erevos.messenger.Hub.forgetNetwork("signal")
                        }
                    }
                }) { Text("Αφαίρεση", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = { TextButton(onClick = { confirmRemove = false }) { Text("Άκυρο") } },
        )
    }
}

@Composable
private fun AccountRow(name: String, state: String, onClick: (() -> Unit)?) {
    Row(
        Modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(name, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Text(
            state,
            style = MaterialTheme.typography.bodyMedium,
            color = if (onClick != null) LocalErevosColors.current.accentText else MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.labelLarge,
        color = LocalErevosColors.current.accentText,
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp),
    )
}

@Composable
private fun AppearanceSection() {
    val style by Appearance.style.collectAsState()
    val mode by Appearance.theme.collectAsState()
    val accent by Appearance.accent.collectAsState()
    val palette by Appearance.palette.collectAsState()
    val bubbles by Appearance.bubbles.collectAsState()
    val wallpaper by Appearance.wallpaper.collectAsState()
    val textSize by Appearance.textSize.collectAsState()
    val lookChoice by Appearance.look.collectAsState()
    val glassKind by Appearance.glassKind.collectAsState()
    val systemDark = isSystemInDarkTheme()
    val context = LocalContext.current
    // Material You's previews take the phone's own tones.
    val tones = remember(context) { readSystemTones(context) }

    SectionTitle("Εμφάνιση")

    // Style
    Label("Στυλ")
    Row(
        Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        for (s in ThemeStyle.entries) {
            val dark = styleIsDark(s, mode, systemDark)
            StyleCard(
                style = s,
                dark = dark,
                palette = palette,
                accent = accent,
                tones = tones,
                selected = s == style,
                onClick = { Appearance.setStyle(s) },
            )
        }
    }

    // Theme
    Label("Θέμα")
    ChipRow {
        for (m in ThemeMode.entries) {
            FilterChip(
                selected = m == mode,
                onClick = { Appearance.setTheme(m) },
                label = { Text(modeName(m)) },
            )
        }
    }

    // Colours: Classic's and Modernist's palettes (Erevos' palette chooser); the other styles keep their own.
    val ownColors = isFixedStyle(style)
    val tileStyle = if (ownColors) ThemeStyle.CLASSIC else style
    val tileDark = styleIsDark(tileStyle, mode, systemDark)
    Label("Χρώματα")
    Row(
        Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        for (p in PaletteChoice.entries) {
            PaletteTile(
                label = paletteName(p),
                choice = p,
                style = tileStyle,
                dark = tileDark,
                custom = accent,
                selected = !ownColors && p == palette,
                // From a style with its own colours, a palette goes back to the style it was chosen over.
                onClick = { Appearance.choosePalette(p) },
            )
        }
    }
    if (ownColors) {
        Text(
            "Το ${styleName(style)} κρατά εδώ τα δικά του χρώματα.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 6.dp),
        )
    } else if (palette == PaletteChoice.CUSTOM) {
        // "My colour": Erevos' gold, every LPHL accent, then the swatches.
        Label("Χρώμα έμφασης")
        Row(
            Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            val current = accent ?: Appearance.DEFAULT_CUSTOM_ACCENT
            for (rgb in customAccentChoices()) {
                val argb = 0xFF000000L or rgb.toLong()
                AccentDot(argb, selected = current == argb) { Appearance.setCustomAccent(argb) }
            }
        }
    }

    // Bubbles
    val previewDark = styleIsDark(style, mode, systemDark)
    val preview = styleScheme(style, previewDark, palette, accent, tones)

    // Look: flat or glass; the scene styles take no glass.
    val takesGlass = styleTakesGlass(style)
    Label("Όψη")
    Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        for (l in Look.entries) {
            OptionCard(
                label = if (l == Look.FLAT) "Επίπεδη" else "Γυαλί",
                selected = l == lookChoice,
                enabled = takesGlass,
                onClick = { Appearance.setLook(l) },
            ) {
                LookPreview(style, previewDark, palette, accent, tones, glass = l == Look.GLASS, kind = glassKind)
            }
        }
    }
    if (!takesGlass) {
        Text(
            "Αυτό το στυλ δεν έχει γυαλί. Διάλεξε Κλασικό, Μοντερνιστικό ή Νυχτερινό για να το χρησιμοποιήσεις.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 6.dp),
        )
    } else if (lookChoice == Look.GLASS) {
        Label("Διάταξη γυαλιού")
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            for (k in GlassKind.entries) {
                OptionCard(
                    label = if (k == GlassKind.PANES) "Τζάμια" else "Ένα τζάμι",
                    selected = k == glassKind,
                    onClick = { Appearance.setGlassKind(k) },
                ) {
                    LookPreview(style, previewDark, palette, accent, tones, glass = true, kind = k)
                }
            }
        }
    }
    Label("Φούσκες μηνυμάτων")
    Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        for (b in BubbleShape.entries) {
            val look = chatLookFor(preview, style, b, wallpaper)
            OptionCard(
                label = bubbleName(b),
                selected = b == bubbles,
                onClick = { Appearance.setBubbles(b) },
            ) {
                BubblePreview(look, preview.background)
            }
        }
    }

    // Wallpaper
    Label("Φόντο συνομιλίας (για όλες· κάθε συνομιλία μπορεί να έχει δικό της από το ⋮)")
    val bgVersion by Backgrounds.version.collectAsState()
    val allPhoto = remember(bgVersion) { Backgrounds.allPhoto() }
    val scope = rememberCoroutineScope()
    val pick = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) scope.launch {
            if (!Backgrounds.setAllPhoto(uri)) Toast.makeText(context, "Η φωτογραφία δεν διαβάστηκε", Toast.LENGTH_SHORT).show()
        }
    }
    Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        for (w in WallpaperKind.entries) {
            OptionCard(
                label = wallpaperName(w),
                selected = w == wallpaper && !allPhoto,
                onClick = { Appearance.setWallpaper(w); Backgrounds.clearAllPhoto() },
            ) {
                WallpaperPreview(w, preview.background, preview.onBackground, preview.primary)
            }
        }
        OptionCard(
            label = "Δική μου φωτογραφία",
            selected = allPhoto,
            onClick = { pick.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
        ) {
            Box(Modifier.fillMaxSize().background(preview.background), contentAlignment = Alignment.Center) {
                Text("🖼", style = MaterialTheme.typography.headlineSmall)
            }
        }
    }

    // Text size
    Label("Μέγεθος κειμένου")
    ChipRow {
        for (t in TextSizeOption.entries) {
            FilterChip(
                selected = t == textSize,
                onClick = { Appearance.setTextSize(t) },
                label = { Text(textSizeName(t)) },
            )
        }
    }
}

@Composable
private fun Label(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 6.dp),
    )
}

@Composable
private fun ChipRow(content: @Composable () -> Unit) {
    Row(
        Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) { content() }
}

private fun modeName(m: ThemeMode): String = when (m) {
    ThemeMode.SYSTEM -> "Σύστημα"
    ThemeMode.LIGHT -> "Φωτεινό"
    ThemeMode.DARK -> "Σκοτεινό"
}

private fun bubbleName(b: BubbleShape): String = when (b) {
    BubbleShape.ROUND -> "Στρογγυλές"
    BubbleShape.SQUARE -> "Τετράγωνες"
    BubbleShape.LINE -> "Γραμμή"
}

private fun wallpaperName(w: WallpaperKind): String = when (w) {
    WallpaperKind.PLAIN -> "Απλό"
    WallpaperKind.DOTS -> "Τελείες"
    WallpaperKind.GRID -> "Πλέγμα"
    WallpaperKind.STRIPES -> "Ρίγες"
    WallpaperKind.STARS -> "Αστέρια"
    WallpaperKind.GRADIENT -> "Διαβάθμιση"
}

private fun textSizeName(t: TextSizeOption): String = when (t) {
    TextSizeOption.SMALL -> "Μικρό"
    TextSizeOption.NORMAL -> "Κανονικό"
    TextSizeOption.LARGE -> "Μεγάλο"
}

private fun styleName(s: ThemeStyle): String = when (s) {
    ThemeStyle.CLASSIC -> "Κλασικό"
    ThemeStyle.MODERNIST -> "Μοντερνιστικό"
    ThemeStyle.NOCTURNE -> "Νυχτερινό"
    ThemeStyle.NEON -> "Νέον"
    ThemeStyle.MATRIX -> "Matrix"
    ThemeStyle.PAPER -> "Χαρτί"
    ThemeStyle.AURORA -> "Αυγή"
    ThemeStyle.MATERIAL_YOU -> "Material You"
}

/** A small tappable card with a preview on top and a caption below; outlined when chosen. */
@Composable
private fun OptionCard(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    enabled: Boolean = true,
    preview: @Composable () -> Unit,
) {
    val primary = MaterialTheme.colorScheme.primary
    val shape = RoundedCornerShape(14.dp)
    Column(
        Modifier
            .width(96.dp)
            .alpha(if (enabled) 1f else 0.4f)
            .clip(shape)
            .border(
                BorderStroke(if (selected) 2.dp else 1.dp, if (selected) primary else MaterialTheme.colorScheme.outlineVariant),
                shape,
            )
            .clickable(enabled = enabled, role = Role.RadioButton, onClick = onClick)
            .padding(6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(Modifier.fillMaxWidth().height(64.dp).clip(RoundedCornerShape(8.dp))) { preview() }
        Spacer(Modifier.height(6.dp))
        Text(
            label,
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) LocalErevosColors.current.accentText else MaterialTheme.colorScheme.onSurface,
            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
            maxLines = 1,
        )
    }
}

@Composable
private fun StyleCard(
    style: ThemeStyle,
    dark: Boolean,
    palette: PaletteChoice,
    accent: Long?,
    tones: SystemTones?,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val scheme = remember(style, dark, palette, accent, tones) { styleScheme(style, dark, palette, accent, tones) }
    val look = chatLookFor(scheme, style, BubbleShape.ROUND, WallpaperKind.PLAIN)
    OptionCard(label = styleName(style), selected = selected, onClick = onClick) {
        BubblePreview(look, scheme.background)
    }
}

/** A mini screen: the backdrop and three rows, as panes (glass) or plain (flat). */
@Composable
private fun LookPreview(
    style: ThemeStyle,
    dark: Boolean,
    palette: PaletteChoice,
    accent: Long?,
    tones: SystemTones?,
    glass: Boolean,
    kind: GlassKind,
) {
    val parts: ThemeParts = remember(style, dark, palette, accent, tones, glass, kind) {
        buildTheme(style, dark, palette, accent, tones, glassOn = glass, kind = kind)
    }
    val scheme = parts.scheme
    val on = parts.glass.on
    CompositionLocalProvider(LocalGlass provides parts.glass) {
        Box(Modifier.fillMaxSize().background(scheme.background).glassBackdrop()) {
            val onePane = on && kind == GlassKind.ONE_PANE
            Column(
                Modifier.fillMaxSize().padding(if (onePane) 4.dp else 6.dp)
                    .then(if (onePane) Modifier.glassPane(RoundedCornerShape(8.dp), GlassRole.BAR).padding(4.dp) else Modifier),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                repeat(3) {
                    val rowShape = RoundedCornerShape(6.dp)
                    Box(
                        Modifier.fillMaxWidth().height(12.dp)
                            .then(if (on) Modifier.glassPane(rowShape, GlassRole.CARD) else Modifier.background(scheme.surfaceVariant, rowShape)),
                    )
                }
            }
        }
    }
}

/** A palette's tile: its accent, background and text side by side, in the style and scheme shown. */
@Composable
private fun PaletteTile(
    label: String,
    choice: PaletteChoice,
    style: ThemeStyle,
    dark: Boolean,
    custom: Long?,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val c = remember(choice, style, dark, custom) {
        buildColors(style, dark, choice, (custom ?: Appearance.DEFAULT_CUSTOM_ACCENT).toInt() and 0xFFFFFF)
    }
    OptionCard(label = label, selected = selected, onClick = onClick) {
        Row(Modifier.fillMaxSize()) {
            Box(Modifier.weight(2f).fillMaxHeight().background(c.hero))
            Box(Modifier.weight(1f).fillMaxHeight().background(c.background))
            Box(Modifier.weight(1f).fillMaxHeight().background(c.text))
        }
    }
}

private fun paletteName(p: PaletteChoice): String = when (p) {
    PaletteChoice.AUTO -> "Του στυλ"
    PaletteChoice.HOUSE -> "LPHL House"
    PaletteChoice.THERMAIKOS -> "Θερμαϊκός"
    PaletteChoice.VARDARIS -> "Βαρδάρης"
    PaletteChoice.KIPOS -> "Κήπος"
    PaletteChoice.KERAMIDI -> "Κεραμίδι"
    PaletteChoice.LYCHNARI -> "Λυχνάρι"
    PaletteChoice.VESPERI -> "Εσπέρα"
    PaletteChoice.MODERNIST -> "Μοντερνιστικό"
    PaletteChoice.RODAKINI -> "Ροδάκινο"
    PaletteChoice.FISTIKI -> "Φιστίκι"
    PaletteChoice.GALAZIO -> "Γαλάζιο"
    PaletteChoice.LILA -> "Λιλά"
    PaletteChoice.CUSTOM -> "Δικό μου χρώμα"
}

/** A mini chat: one bubble of theirs and one of ours. */
@Composable
private fun BubblePreview(look: ChatLook, background: Color) {
    Column(
        Modifier.fillMaxSize().background(background).padding(8.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        MiniBubble(look.bubbles, look.incomingBubble, look.incomingLine, 38.dp, Alignment.Start)
        MiniBubble(look.bubbles, look.outgoingBubble, look.outgoingLine, 30.dp, Alignment.End)
    }
}

@Composable
private fun MiniBubble(shape: BubbleShape, fill: Color, line: Color, width: Dp, side: Alignment.Horizontal) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (side == Alignment.End) Arrangement.End else Arrangement.Start) {
        when (shape) {
            BubbleShape.LINE -> {
                Row(Modifier.height(14.dp)) {
                    if (side == Alignment.Start) Box(Modifier.width(2.dp).height(14.dp).background(line))
                    Box(
                        Modifier.padding(horizontal = 4.dp).width(width).height(14.dp)
                            .background(fill.copy(alpha = 0.35f), RoundedCornerShape(2.dp)),
                    )
                    if (side == Alignment.End) Box(Modifier.width(2.dp).height(14.dp).background(line))
                }
            }
            else -> Box(
                Modifier.width(width).height(14.dp)
                    .background(fill, RoundedCornerShape(if (shape == BubbleShape.ROUND) 8.dp else 2.dp)),
            )
        }
    }
}

@Composable
private fun WallpaperPreview(kind: WallpaperKind, background: Color, ink: Color, accent: Color) {
    Canvas(Modifier.fillMaxSize()) {
        drawRect(background)
        drawWallpaper(kind, ink, accent, scale = 0.6f)
    }
}

@Composable
private fun AccentDot(color: Long, selected: Boolean, onClick: () -> Unit) {
    val c = Color(color)
    Box(
        Modifier
            .size(34.dp)
            .clip(CircleShape)
            .border(
                BorderStroke(if (selected) 3.dp else 1.dp, if (selected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.outlineVariant),
                CircleShape,
            )
            .padding(4.dp)
            .clip(CircleShape)
            .background(c)
            .clickable(role = Role.RadioButton, onClick = onClick),
    )
}

/** A password-encrypted file with this app's settings, to keep or to bring to another phone. */
@Composable
private fun BackupSection() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var askFor by remember { mutableStateOf<Pair<Boolean, android.net.Uri>?>(null) } // (export?, file)
    var restartNote by remember { mutableStateOf(false) }
    val saveTo = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.CreateDocument("application/octet-stream"),
    ) { uri -> if (uri != null) askFor = true to uri }
    val openFrom = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.OpenDocument(),
    ) { uri -> if (uri != null) askFor = false to uri }
    SectionTitle("Αντίγραφο ασφαλείας")
    Text(
        "Κλειδώματα, κρυφές συνομιλίες, φόντα, εμφάνιση και μηνύματα για αργότερα, σε ένα αρχείο με δικό σου κωδικό. " +
            "Οι λογαριασμοί και τα μηνύματα δεν μπαίνουν: Messenger και Signal συνδέονται ξανά, το Session επιστρέφει με τις 13 λέξεις.",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(horizontal = 16.dp),
    )
    AccountRow("Αποθήκευση σε αρχείο", "Αποθήκευση") {
        val day = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.ROOT).format(java.util.Date())
        saveTo.launch("erevos-messenger-$day.backup")
    }
    AccountRow("Επαναφορά από αρχείο", "Επαναφορά") { openFrom.launch(arrayOf("*/*")) }

    askFor?.let { (exporting, uri) ->
        var pass by remember { mutableStateOf("") }
        var again by remember { mutableStateOf("") }
        var busy by remember { mutableStateOf(false) }
        var problem by remember { mutableStateOf<String?>(null) }
        val ok = if (exporting) pass.length >= 8 && pass == again else pass.isNotEmpty()
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { if (!busy) askFor = null },
            title = { Text(if (exporting) "Κωδικός για το αντίγραφο" else "Κωδικός του αντιγράφου") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (exporting) {
                        Text("Τουλάχιστον 8 χαρακτήρες. Χωρίς αυτόν το αρχείο δεν ανοίγει, ούτε από εμάς.", style = MaterialTheme.typography.bodySmall)
                    } else {
                        Text("Οι τωρινές ρυθμίσεις αυτών των ειδών θα αντικατασταθούν, και η εφαρμογή θα κλείσει για να τις φορτώσει.", style = MaterialTheme.typography.bodySmall)
                    }
                    androidx.compose.material3.OutlinedTextField(
                        pass, { pass = it }, label = { Text("Κωδικός") }, singleLine = true,
                        visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                    )
                    if (exporting) {
                        androidx.compose.material3.OutlinedTextField(
                            again, { again = it }, label = { Text("Ξανά ο κωδικός") }, singleLine = true,
                            visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(),
                        )
                    }
                    problem?.let { Text(it, color = MaterialTheme.colorScheme.error) }
                    if (busy) androidx.compose.material3.CircularProgressIndicator()
                }
            },
            confirmButton = {
                TextButton(enabled = ok && !busy, onClick = {
                    busy = true
                    problem = null
                    scope.launch {
                        val err = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                            runCatching {
                                if (exporting) eu.erevos.messenger.Backup.export(context, uri, pass)
                                else eu.erevos.messenger.Backup.restore(context, uri, pass)
                            }.exceptionOrNull()
                        }
                        busy = false
                        if (err == null) {
                            askFor = null
                            if (exporting) Toast.makeText(context, "Το αντίγραφο αποθηκεύτηκε.", Toast.LENGTH_LONG).show()
                            else restartNote = true
                        } else {
                            problem = when (err.message) {
                                "wrong password" -> "Λάθος κωδικός."
                                "not a backup" -> "Αυτό το αρχείο δεν είναι αντίγραφο του Erevos Messenger."
                                else -> "Δεν έγινε: " + (err.message ?: err.javaClass.simpleName)
                            }
                        }
                    }
                }) { Text(if (exporting) "Αποθήκευση" else "Επαναφορά") }
            },
            dismissButton = { TextButton(enabled = !busy, onClick = { askFor = null }) { Text("Άκυρο") } },
        )
    }
    if (restartNote) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = {},
            title = { Text("Η επαναφορά έγινε") },
            text = { Text("Η εφαρμογή κλείνει τώρα. Άνοιξέ την ξανά για να δεις τις ρυθμίσεις σου.") },
            confirmButton = {
                TextButton(onClick = {
                    (context as? android.app.Activity)?.finishAffinity()
                    kotlin.system.exitProcess(0)
                }) { Text("Εντάξει") }
            },
        )
    }
}
