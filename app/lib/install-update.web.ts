// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { Release } from './updates';
import { t } from './i18n';

// The computer and Sailfish OS versions open the download page instead (see install-update.ts).

export const canInstall = false;

export function clearDownloads(): void {}

export async function downloadAndInstall(
  _release: Release,
  _onProgress: (received: number, total: number) => void,
  _signal: AbortSignal,
  _onlyDownload = false,
): Promise<void> {
  throw new Error(t('This version installs from the download page.'));
}
