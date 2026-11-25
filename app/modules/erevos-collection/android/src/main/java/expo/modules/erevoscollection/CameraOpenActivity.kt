// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevoscollection

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle

/**
 * Erevos's camera at a tap: its icon among the phone's apps, when the owner put it there
 * (Appearance → Launcher icons), and the Camera shortcut on Erevos's icon. It opens the
 * Collection's camera (erevos://collection?camera=1), behind Erevos's lock and the Collection's
 * own, and closes at once.
 */
class CameraOpenActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    try {
      startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("erevos://collection?camera=1")).setPackage(packageName).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: Exception) {
      packageManager.getLaunchIntentForPackage(packageName)?.let(::startActivity)
    }
    finish()
  }
}
