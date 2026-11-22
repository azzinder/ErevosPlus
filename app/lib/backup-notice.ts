// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A backup made by hand (app/backup.tsx) can take minutes: when it is done, a notice says so, as
// the owner may have left the screen (modules/erevos-device Backups.kt). On a locked phone it says
// only that Erevos has a notice. Nothing on a computer, or in a build before it.

import { t } from './i18n';
import { device } from '../modules/erevos-device';

/** Says that the backup `name`, of `size`, was saved in `folder`. */
export function tellBackupMade(name: string, size: string, folder: string): void {
  try {
    device?.tellBackup?.(t('Backup made'), t('{name} ({size}) is saved in {folder}.', { name, size, folder }), t('Backups'));
  } catch {
    // A notice is a courtesy: the backup screen says it too.
  }
}
