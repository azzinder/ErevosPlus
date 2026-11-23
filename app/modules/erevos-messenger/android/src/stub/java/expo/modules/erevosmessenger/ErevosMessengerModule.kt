// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevosmessenger

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// The plain Erevos and Erevos Lite (EREVOS_EDITION=erevos or lite, android/build.gradle): Messenger, Signal and Session are not here.
class ErevosMessengerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ErevosMessenger")
    Function("available") { false }
  }
}
