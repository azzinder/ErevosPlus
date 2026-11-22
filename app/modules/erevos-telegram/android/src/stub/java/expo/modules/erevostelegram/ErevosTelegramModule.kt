// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

package expo.modules.erevostelegram

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Every build but ErevosGram's (android/build.gradle): Telegram is not here.
class ErevosTelegramModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ErevosTelegram")
    Function("available") { false }
  }
}
