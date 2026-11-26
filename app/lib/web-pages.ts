// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { messengerNative } from '../modules/erevos-messenger';
import type { CaseLook } from './messenger-case-look';

// The web pages Erevos+ shows on screens of their own (Messenger in its case, Facebook, a
// service's sign-in page: WebPages.kt in modules/erevos-messenger) follow Erevos's own screen.
// Elsewhere, and in a build from before them, nothing happens.

/** Closes them: the space locked or closed, or the panic button. */
export function closeWebPages(): void {
  messengerNative?.closeWebPages?.();
}

/** Keeps them out of screenshots and the recent apps preview while Erevos's own screen is. */
export function webPagesSecure(on: boolean): void {
  messengerNative?.setWebPagesSecure?.(on);
}

/**
 * The colours of their bar, as Erevos's own screen has them, and `page`, Erevos's look for Meta's
 * pages themselves (lib/messenger-case-look.ts): set as the look changes.
 */
export function webPagesLook(look: { bar: string; text: string; accent: string; dark: boolean; page?: CaseLook }): void {
  messengerNative?.setWebPagesLook?.(JSON.stringify(look));
}

/**
 * Whether one of them is on the screen now. Erevos's own screen is then out of sight, but the
 * owner is still in Erevos: the lock's time away does not run (app/_layout.tsx).
 */
export function webPageInFront(): boolean {
  try {
    return messengerNative?.webPageInFront?.() === true;
  } catch {
    return false;
  }
}

/** When one of them last left the screen, on the clock lib/curtain.ts awayClock reads; null when none has, or elsewhere. */
export function webPagesLeftAt(): number | null {
  try {
    const at = messengerNative?.webPagesLeftAt?.();
    return typeof at === 'number' && Number.isFinite(at) && at >= 0 ? at : null;
  } catch {
    return null;
  }
}
