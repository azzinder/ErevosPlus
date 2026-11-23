// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { setLauncherShown } from '../modules/erevos-icons';

import { inEdition } from './edition';
import { moduleOn, onModulesChange } from './modules';

// The Phone's and the SMS's icons among the phone's apps (modules/erevos-icons) follow their
// modules (lib/modules.ts): off, the icon goes, its colour kept; on again, it is back in that
// colour. Erevos's own icon and the Contacts' always stay. Elsewhere there is nothing to follow.

let following = false;

/** Puts the icons as the modules are now, and again each time one is turned on or off. */
export function followModuleIcons(): void {
  // Erevos Lite has no Phone or SMS icons at all (lib/edition.ts): nothing to put.
  if (!inEdition('phone')) return;
  const apply = () => {
    setLauncherShown('phone', moduleOn('phone'));
    setLauncherShown('sms', moduleOn('sms'));
  };
  apply();
  if (following) return;
  following = true;
  onModulesChange(apply);
}
