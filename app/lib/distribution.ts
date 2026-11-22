// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import Constants from 'expo-constants';

// Where this build came from. The F-Droid build (EREVOS_DISTRIBUTION=fdroid, see app.config.js) is
// updated by F-Droid: Updates shows its version and says so, and never asks GitHub or downloads a
// package.
export const FDROID = Constants.expoConfig?.extra?.distribution === 'fdroid';

// The ErevosGram build (EREVOS_TELEGRAM=1, docs/erevosgram.md): the same app with Telegram. Check
// for updates takes the release's ErevosGram APK, never the plain one, which would take Telegram away.
export const EREVOSGRAM = Constants.expoConfig?.extra?.edition === 'erevosgram';
