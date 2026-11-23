// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { requireOptionalNativeModule } from 'expo-modules-core';

// The colour of each launcher icon (modules/erevos-icons, Appearance → Launcher icons). Android
// only; null on other platforms and in a build made before this module was added, where the choice
// is not offered.
export type LauncherIcon = 'erevos' | 'phone' | 'sms' | 'contacts';
export type LauncherColor = 'red' | 'orange' | 'green' | 'blue' | 'violet' | 'dark';

export const LAUNCHER_ICONS: LauncherIcon[] = ['erevos', 'phone', 'sms', 'contacts'];
export const LAUNCHER_COLORS: LauncherColor[] = ['red', 'orange', 'green', 'blue', 'violet', 'dark'];

const native = requireOptionalNativeModule<{
  colors(): Record<string, string> | null;
  setColor(icon: string, color: string): boolean;
  // Missing in a build before the calculator.
  calculator?(): boolean | null;
  setCalculator?(code: string): boolean;
  calculatorOff?(): boolean;
  // Missing in a build before the modules.
  setShown?(icon: string, shown: boolean): boolean;
}>('ErevosIcons');

/** Each icon's colour as the launcher shows it now (an icon this app has not, missing), or null where there is no choice. */
export function launcherColors(): Partial<Record<LauncherIcon, LauncherColor>> | null {
  try {
    const colors = native?.colors();
    if (!colors) return null;
    const known = (color: string | undefined): color is LauncherColor => LAUNCHER_COLORS.includes(color as LauncherColor);
    // Erevos Lite has no Phone and no SMS, so no icons of theirs: the others are enough.
    if (!LAUNCHER_ICONS.filter((icon) => icon !== 'phone' && icon !== 'sms').every((icon) => known(colors[icon]))) return null;
    if (!LAUNCHER_ICONS.every((icon) => colors[icon] === undefined || known(colors[icon]))) return null;
    return colors as Record<LauncherIcon, LauncherColor>;
  } catch {
    return null;
  }
}

/** Shows the icon in that colour in the launcher; false if it could not be changed. */
export function setLauncherColor(icon: LauncherIcon, color: LauncherColor): boolean {
  try {
    return native?.setColor(icon, color) ?? false;
  } catch {
    return false;
  }
}

/** Whether a calculator stands in place of Erevos's icon (CalculatorActivity.kt); null where it cannot. */
export function calculatorOn(): boolean | null {
  try {
    return native?.calculator?.() ?? null;
  } catch {
    return null;
  }
}

/** A calculator in place of Erevos's icon, opening Erevos with `code` then =; or a new code for it. */
export function setCalculator(code: string): boolean {
  try {
    return native?.setCalculator?.(code) ?? false;
  } catch {
    return false;
  }
}

/** Erevos's own icon again, and no calculator. */
export function calculatorOff(): boolean {
  try {
    return native?.calculatorOff?.() ?? false;
  } catch {
    return false;
  }
}

/** Takes the Phone's or the SMS's icon off the phone's apps, or puts it back (lib/modules.ts); false where it cannot. */
export function setLauncherShown(icon: 'phone' | 'sms', shown: boolean): boolean {
  try {
    return native?.setShown?.(icon, shown) ?? false;
  } catch {
    return false;
  }
}
