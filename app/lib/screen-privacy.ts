// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { device } from '../modules/erevos-device';
import { secureGet, secureSet } from './secure';
import { webPagesSecure } from './web-pages';

// Keeping Erevos's screen out of screenshots, screen recordings and the recent apps preview
// (Android's FLAG_SECURE, modules/erevos-device). Without it, the last screen shown stays as a
// picture among the recent apps until Erevos opens again, so whoever holds the unlocked phone a
// moment sees a hidden chat without its PIN. Hidden chats keep out of it while they are open and
// the setting is on (app/chat.tsx), and the Collection does while it is shown (app/collection.tsx), and a chat
// either phone set to block screenshots (`shots`, Contact.shots) while it shows. A space with a password lock does too, unless the owner turns it off in
// Lock: the setting is the phone's, the same in every space, so it tells nothing of which opened.
// Other platforms have no such switch, and nothing happens there.

const KEY = 'erevos.screen-private';

/** Whether this phone can keep Erevos out of screenshots. */
export const CAN_KEEP_PRIVATE = typeof device?.setSecure === 'function';

// How many ask for each reason: screens lie over one another (a locked chat under a locked group it
// forwards to), and the one under stays private while the one over goes. The lock is a setting,
// on or off, not a screen.
const reasons = new Map<string, number>();

/** Keeps the screen private while any reason asks for it: `why` asks, or no longer. Said again on
 *  every change, so a screen made anew (Erevos swiped away and opened) gets it too. */
export function keepPrivate(why: 'lock' | 'hidden' | 'chat' | 'collection' | 'shots' | 'once', on: boolean): void {
  const was = reasons.get(why) ?? 0;
  const now = why === 'lock' ? (on ? 1 : 0) : Math.max(0, was + (on ? 1 : -1));
  if (now) reasons.set(why, now);
  else reasons.delete(why);
  device?.setSecure?.(reasons.size > 0);
  // Messenger in its case and Facebook, on screens of their own, are kept out with it.
  webPagesSecure(reasons.size > 0);
}

/** Whether a space with a password lock keeps the screen private: on unless turned off. */
export async function loadScreenPrivacy(): Promise<boolean> {
  return (await secureGet(KEY)) !== 'off';
}

export async function saveScreenPrivacy(on: boolean): Promise<void> {
  await secureSet(KEY, on ? 'on' : 'off');
}
