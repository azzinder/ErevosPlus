// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { setCameraAllowed, setLauncherShown } from '../modules/erevos-icons';

import { inEdition } from './edition';
import { moduleOn, onModulesChange } from './modules';

// The Phone's and the SMS's icons among the phone's apps (modules/erevos-icons) follow their
// modules (lib/modules.ts): off, the icon goes, its colour kept; on again, it is back in that
// colour. So do the Camera's icon, when the owner put it there, and the Camera shortcut on
// Erevos's icon, with the Collection. Erevos's own icon and the Contacts' always stay. Elsewhere
// there is nothing to follow.

let following = false;

/** Puts the icons as the modules are now, and again each time one is turned on or off. */
export function followModuleIcons(): void {
  // Erevos Lite has no Phone, SMS or Camera icons at all (lib/edition.ts): nothing to put. Its app
  // has no Camera to show (plugins/with-edition-modules.js); should one be there all the same, it
  // is told the Collection is off, so neither its icon nor its shortcut shows.
  if (!inEdition('phone')) {
    if (!inEdition('collection')) setCameraAllowed(false);
    return;
  }
  const apply = () => {
    setLauncherShown('phone', moduleOn('phone'));
    setLauncherShown('sms', moduleOn('sms'));
    setCameraAllowed(moduleOn('collection'));
  };
  apply();
  if (following) return;
  following = true;
  onModulesChange(apply);
}
