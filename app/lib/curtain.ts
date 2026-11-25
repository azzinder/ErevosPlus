// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { device } from '../modules/erevos-device';

// The curtain over a space that has a password lock (modules/erevos-device, Curtain.kt).
//
// A space with a password lock locks once Erevos has been out of sight for a while
// (app/_layout.tsx). That is decided here, in the app, and the app runs only after Android has
// put its last screen back: the chats showed for a second or two before the password screen did.
// So the phone covers them itself, with a plain cover in the look's ground colour. While such a
// space shows, the cover goes over its screens as they go out of sight (armCurtain). Back sooner
// than the lock's time, it is gone before anything is drawn; back later, it stays until the
// password screen is drawn under it (liftCurtain, CURTAIN_END). Locking by hand covers at once
// (lowerCurtain), so nothing shows while the password screen is made.
//
// The phone also counts how long Erevos was away, on the clock nobody can set, and the app takes
// its count (curtainBack, awayLong) so that both decide alike: with the phone's date and time
// moved back, the lock's time still passes.
//
// Only Android has it. Elsewhere, and in a build before it, nothing here does anything, and the
// lock is as it was.

/** The name (nativeID) of the mark on every screen that is not a space's: once it is drawn, the cover goes. */
export const CURTAIN_END = 'erevos-curtain-end';

/** How long Erevos was away as its screens last came back, ms, and whether the phone kept the cover. */
export type CurtainBack = { away: number; kept: boolean };

// A colour of the looks (#RGB, #RRGGBB, #RRGGBBAA) as Android has colours, never see-through; black for anything else.
export function curtainColour(ground: string): number {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(ground.trim())?.[1];
  if (!hex) return 0xff000000 | 0;
  const six = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex.slice(0, 6);
  return (0xff000000 | parseInt(six, 16)) | 0;
}

/** From now on the phone covers the screens as they go out of sight, in the colour `ground`, and
 *  keeps them covered when they come back after more than `afterMs`; with null, no longer. */
export function armCurtain(afterMs: number | null, ground: string): void {
  try {
    device?.curtainArm?.(afterMs === null ? -1 : afterMs, curtainColour(ground));
  } catch {
    // No screen showing.
  }
}

/** Covers the screens now, until liftCurtain. */
export function lowerCurtain(): void {
  try {
    device?.curtainLower?.();
  } catch {
    // No screen showing.
  }
}

/** Takes the cover away: at once, or with `onScreen` once a screen marked CURTAIN_END is drawn under it. */
export function liftCurtain(onScreen: boolean): void {
  try {
    device?.curtainLift?.(onScreen);
  } catch {
    // No screen showing.
  }
}

/** What the phone counted as the screens last came back, once: null where it does not, or they were not out of sight. */
export function curtainBack(): CurtainBack | null {
  try {
    const back = device?.curtainBack?.();
    return back && typeof back.away === 'number' ? { away: back.away, kept: back.kept === true } : null;
  } catch {
    return null;
  }
}

/** Whether the cover is there now. */
export function curtainDown(): boolean {
  try {
    return device?.curtainDown?.() === true;
  } catch {
    return false;
  }
}

/**
 * The clock the app's own count of the time away is kept on: the phone's own that nobody can set,
 * sleep included, where it has one (modules/erevos-device clock), else the date and time. Only
 * the difference of two readings means anything.
 */
export function awayClock(): number {
  try {
    const up = device?.clock?.().up;
    if (typeof up === 'number' && Number.isFinite(up)) return up;
  } catch {
    // A build before the clock: below.
  }
  return Date.now();
}

/**
 * Whether Erevos was away long enough to lock: by the phone's count when it kept one, which is
 * what it kept or took the cover by, else by the app's own, `own` ms (null when it kept none).
 */
export function awayLong(back: CurtainBack | null, own: number | null, afterMs: number): boolean {
  if (back) return back.away > afterMs;
  return own !== null && own > afterMs;
}
