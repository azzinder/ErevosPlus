// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosicons

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon as ShortcutIcon
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// The colour of each of Erevos's launcher icons (Appearance → Launcher icons). Android draws an
// app's icons from its manifest only, so every colour of every icon is an activity-alias there,
// all but one turned off: Erevos's own in the app's manifest (plugins/with-launcher-icons.js), the
// others next to Phone's, SMS's and Contacts's activities in their modules. A colour is chosen by
// turning its alias on and the others off. The choice is the phone's, not a space's: the icons show
// before Erevos is unlocked. A working calculator can stand in place of Erevos's own icon
// (CalculatorActivity.kt): its alias goes on and every colour of Erevos's goes off, the colour
// kept for when Erevos's icon comes back. The Camera's icon is off at first: the owner puts it
// among the phone's apps (Camera), and it shows while the Collection is on and no calculator
// stands in place of Erevos, as it would say Erevos is there. The Camera shortcut on Erevos's icon
// (held down) follows the Collection and the calculator the same way, the owner's wish aside.
class ErevosIconsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ErevosIcons")

    // Each icon's colour as the launcher shows it now, as { erevos: "red", phone: "green", … }.
    Function("colors") {
      val context = context() ?: return@Function null
      // An icon whose part is not in this app (Erevos Lite has no Phone, no SMS) is left out.
      ICONS.filterKeys { icon -> exists(context, icon) }.mapValues { (icon, _) -> colorOf(context, icon) }
    }

    // Shows the icon in that colour: the new alias goes on before the old one goes off, so the
    // launcher always has one. False for an unknown icon or colour.
    Function("setColor") { icon: String, color: String ->
      val context = context() ?: return@Function false
      if (icon !in ICONS || color !in COLORS || !exists(context, icon)) return@Function false
      // Behind the calculator Erevos's icon stays off: its colour is kept for when it comes back.
      if (icon == "erevos" && Calculator.isOn(context)) {
        Calculator.prefs(context).edit().putString(Calculator.EREVOS_COLOR, color).apply()
        return@Function true
      }
      // An icon taken off while its part of Erevos is off, or the Camera's while it is not shown:
      // its colour is kept for when it is back.
      if (offColor(context, icon) != null || (icon == "camera" && !isShown(context, "camera"))) {
        offPrefs(context).edit().putString(icon, color).apply()
        if (icon == "camera") applyCamera(context)
        return@Function true
      }
      show(context, icon, color)
      // The Camera shortcut hangs on Erevos's icon now on, in the Camera's colour.
      applyCamera(context)
      recount(context)
      true
    }

    // Takes the Phone's or the SMS's icon off the phone's apps while that part of Erevos is off
    // (lib/modules.ts), its colour kept; or puts it back in that colour. Erevos's own icon and the
    // Contacts' always stay. False for any other icon, or with no app context.
    Function("setShown") { icon: String, shown: Boolean ->
      val context = context() ?: return@Function false
      if ((icon != "phone" && icon != "sms") || !exists(context, icon)) return@Function false
      val kept = offColor(context, icon)
      if (shown) {
        if (kept != null) {
          show(context, icon, kept)
          offPrefs(context).edit().remove(icon).apply()
          recount(context)
        }
      } else if (kept == null) {
        offPrefs(context).edit().putString(icon, colorOf(context, icon)).apply()
        val packages = context.packageManager
        for (each in COLORS) {
          packages.setComponentEnabledSetting(component(context, icon, each), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
        }
        recount(context)
      }
      true
    }

    // Whether the owner wants the Camera's icon among the phone's apps (it shows only while the
    // Collection is on and no calculator stands in place of Erevos). Null where this app has no
    // camera (Erevos Lite) or with no app context.
    Function("camera") {
      val context = context() ?: return@Function null
      if (!exists(context, "camera")) return@Function null
      Camera.prefs(context).getBoolean(Camera.WANTED, false)
    }

    // Puts the Camera's icon among the phone's apps, or takes it off. False where there is none.
    Function("setCamera") { wanted: Boolean ->
      val context = context() ?: return@Function false
      if (!exists(context, "camera")) return@Function false
      Camera.prefs(context).edit().putBoolean(Camera.WANTED, wanted).apply()
      applyCamera(context)
      true
    }

    // Whether the Collection is on, which the Camera's icon follows (lib/module-icons.ts).
    Function("setCameraAllowed") { allowed: Boolean ->
      val context = context() ?: return@Function false
      if (!exists(context, "camera")) return@Function false
      Camera.prefs(context).edit().putBoolean(Camera.ALLOWED, allowed).apply()
      applyCamera(context)
      true
    }

    // Whether the calculator stands in place of Erevos's icon. Null with no app context.
    Function("calculator") {
      val context = context() ?: return@Function null
      Calculator.isOn(context)
    }

    // The calculator in place of Erevos's icon, opening Erevos with `code` then =; or a new code
    // for it. False with no app context.
    Function("setCalculator") { code: String ->
      val context = context() ?: return@Function false
      Calculator.setCode(context, code)
      if (Calculator.isOn(context)) return@Function true
      val color = colorOf(context, "erevos")
      Calculator.prefs(context).edit().putString(Calculator.EREVOS_COLOR, color).apply()
      val packages = context.packageManager
      packages.setComponentEnabledSetting(Calculator.component(context), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
      for (each in COLORS) {
        packages.setComponentEnabledSetting(component(context, "erevos", each), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
      }
      applyCamera(context)
      recount(context)
      true
    }

    // Erevos's own icon again, in its colour, and no calculator, nor its code.
    Function("calculatorOff") {
      val context = context() ?: return@Function false
      calculatorOff(context)
      true
    }
  }

  private fun context(): Context? = appContext.reactContext ?: appContext.currentActivity
}

/** Erevos's own icon again, in its colour (the first after a wipe), and no calculator, nor its code. */
internal fun calculatorOff(context: Context) {
  val color = Calculator.prefs(context).getString(Calculator.EREVOS_COLOR, null)?.takeIf { it in COLORS } ?: ICONS.getValue("erevos").first
  show(context, "erevos", color)
  context.packageManager.setComponentEnabledSetting(Calculator.component(context), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
  Calculator.forgetCode(context)
  Calculator.prefs(context).edit().remove(Calculator.EREVOS_COLOR).apply()
  applyCamera(context)
  recount(context)
}

/** What the Camera's icon follows: the owner's wish, and the Collection being on (on at first). */
private object Camera {
  const val WANTED = "wanted"
  const val ALLOWED = "allowed"
  fun prefs(context: Context) = context.applicationContext.getSharedPreferences("erevos-icons-camera", Context.MODE_PRIVATE)
}

/** Shows the Camera's icon, in its colour, when the owner wants it, the Collection is on and no
 *  calculator stands in place of Erevos; otherwise takes it off, its colour kept. */
internal fun applyCamera(context: Context) {
  if (!exists(context, "camera")) return
  val prefs = Camera.prefs(context)
  val on = prefs.getBoolean(Camera.WANTED, false) && prefs.getBoolean(Camera.ALLOWED, true) && !Calculator.isOn(context)
  val shown = isShown(context, "camera")
  applyShortcut(context, prefs.getBoolean(Camera.ALLOWED, true) && !Calculator.isOn(context))
  if (on && !shown) {
    show(context, "camera", offColor(context, "camera") ?: ICONS.getValue("camera").first)
    offPrefs(context).edit().remove("camera").apply()
  } else if (!on && shown) {
    offPrefs(context).edit().putString("camera", colorOf(context, "camera")).apply()
    for (each in COLORS) {
      context.packageManager.setComponentEnabledSetting(component(context, "camera", each), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
    }
  }
}

// The Camera shortcut on Erevos's icon, held down (Android 7.1 and later): on Erevos's own icon now
// on, in the Camera's colour, opening CameraOpenActivity; none while the Collection is off or the
// calculator stands in place of Erevos, and one pinned to the home screen then does nothing.
private fun applyShortcut(context: Context, on: Boolean) {
  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return
  runCatching {
    val shortcuts = context.getSystemService(ShortcutManager::class.java) ?: return
    if (!on) {
      shortcuts.removeDynamicShortcuts(listOf(CAMERA_SHORTCUT))
      shortcuts.disableShortcuts(listOf(CAMERA_SHORTCUT))
      return
    }
    val resources = context.resources
    val label = resources.getIdentifier("erevos_camera_launcher", "string", context.packageName)
    val picture = resources.getIdentifier("erevos_camera_launcher_${colorOf(context, "camera")}", "mipmap", context.packageName)
    if (label == 0 || picture == 0) return
    val open = Intent(Intent.ACTION_VIEW, Uri.parse("erevos://collection?camera=1")).setClassName(context.packageName, "expo.modules.erevoscollection.CameraOpenActivity")
    val shortcut = ShortcutInfo.Builder(context, CAMERA_SHORTCUT)
      .setShortLabel(context.getString(label))
      .setIcon(ShortcutIcon.createWithResource(context, picture))
      .setActivity(component(context, "erevos", colorOf(context, "erevos")))
      .setIntent(open)
      .build()
    shortcuts.enableShortcuts(listOf(CAMERA_SHORTCUT))
    shortcuts.setDynamicShortcuts(listOf(shortcut))
  }
}

private const val CAMERA_SHORTCUT = "camera"

// Whether one of the icon's colours is turned on here (the Camera's manifest turns none on).
private fun isShown(context: Context, icon: String): Boolean =
  COLORS.any { color -> context.packageManager.getComponentEnabledSetting(component(context, icon, color)) == PackageManager.COMPONENT_ENABLED_STATE_ENABLED }

// Shows the icon in that colour: the new alias goes on before the old one goes off, so the launcher
// always has one.
private fun show(context: Context, icon: String, color: String) {
  val packages = context.packageManager
  packages.setComponentEnabledSetting(component(context, icon, color), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
  for (other in COLORS) {
    if (other == color) continue
    packages.setComponentEnabledSetting(component(context, icon, other), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
  }
}

// The icons that are on changed: on the launchers that show a number on each icon apart, the number
// moves to the one now on, and the calculator never has one (erevos-widget IconNumbers.kt, told by its
// class name, as the widget is), once the launcher has taken the change in.
private fun recount(context: Context) {
  val app = context.applicationContext
  val intent = Intent("expo.modules.erevoswidget.REFRESH").setClassName(app.packageName, "expo.modules.erevoswidget.ErevosWidget")
  Handler(Looper.getMainLooper()).postDelayed({ runCatching { app.sendBroadcast(intent) } }, 2_000)
}

/** The colours, in the order Appearance shows them; "dark" is the first look, a dark tile with a red mark. */
private val COLORS = listOf("red", "orange", "green", "blue", "violet", "dark")

/** Each icon: the colour its manifest turns on, and the alias names (the one on at first keeps the name the icon had before colours). */
private class Icon(val first: String, val name: (Context, String) -> String)

private val ICONS = mapOf(
  "erevos" to Icon("red") { context, color -> "${context.packageName}.ErevosIcon${color.replaceFirstChar(Char::uppercase)}" },
  "phone" to Icon("green") { _, color -> launcher("expo.modules.erevosphone.PhoneLauncher", color, "green") },
  "sms" to Icon("blue") { _, color -> launcher("expo.modules.erevossms.SmsLauncher", color, "blue") },
  "contacts" to Icon("violet") { _, color -> launcher("expo.modules.erevoscontacts.ContactsLauncher", color, "violet") },
  "camera" to Icon("orange") { _, color -> launcher("expo.modules.erevoscollection.CameraLauncher", color, "orange") },
)

private fun launcher(prefix: String, color: String, first: String) =
  if (color == first) "${prefix}Activity" else prefix + color.replaceFirstChar(Char::uppercase)

private fun component(context: Context, icon: String, color: String) =
  ComponentName(context.packageName, ICONS.getValue(icon).name(context, color))

// Whether the icon's part is in this app: its first alias is in the manifest, on or off.
private fun exists(context: Context, icon: String): Boolean =
  runCatching { context.packageManager.getActivityInfo(component(context, icon, ICONS.getValue(icon).first), PackageManager.MATCH_DISABLED_COMPONENTS) }.isSuccess

// The colours of the icons taken off while their part of Erevos is off, by icon.
private fun offPrefs(context: Context) = context.applicationContext.getSharedPreferences("erevos-icons-off", Context.MODE_PRIVATE)

private fun offColor(context: Context, icon: String): String? = offPrefs(context).getString(icon, null)?.takeIf { it in COLORS }

/** The colour whose alias is on: turned on here, or on by the manifest and never changed; Erevos's behind the calculator, and an icon taken off, the one kept. */
private fun colorOf(context: Context, icon: String): String {
  if (icon == "erevos" && Calculator.isOn(context)) {
    Calculator.prefs(context).getString(Calculator.EREVOS_COLOR, null)?.takeIf { it in COLORS }?.let { return it }
  }
  offColor(context, icon)?.let { return it }
  val packages = context.packageManager
  val first = ICONS.getValue(icon).first
  return COLORS.firstOrNull { color ->
    when (packages.getComponentEnabledSetting(component(context, icon, color))) {
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
      PackageManager.COMPONENT_ENABLED_STATE_DEFAULT -> color == first
      else -> false
    }
  } ?: first
}
