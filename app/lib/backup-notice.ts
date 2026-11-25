// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A backup made by hand (app/backup.tsx) can take minutes: when it is done, a notice says so, as
// the owner may have left the screen (modules/erevos-device Backups.kt), with its size in all, the
// files beside it with it, as the screen says it too. On a locked phone it says only that Erevos
// has a notice. Nothing on a computer, or in a build before it.

import { plural, t } from './i18n';
import { device } from '../modules/erevos-device';

/** Says that the backup `name`, with `parts` files beside it, `total` with them, was saved in `folder`. */
export function tellBackupMade(name: string, total: string, folder: string, parts = 0): void {
  tell(
    parts > 0
      ? plural(parts, '{name} and {n} file beside it, {total} in all, are saved in {folder}.', '{name} and {n} files beside it, {total} in all, are saved in {folder}.', { name, total, folder })
      : t('{name} ({size}) is saved in {folder}.', { name, size: total, folder }),
  );
}

/** Says that a backup of `total` in all went to `server`. */
export function tellBackupSent(server: string, total: string): void {
  tell(t('A backup of {total} in all went to {server}.', { total, server }));
}

function tell(text: string): void {
  try {
    device?.tellBackup?.(t('Backup made'), text, t('Backups'));
  } catch {
    // A notice is a courtesy: the backup screen says it too.
  }
}
