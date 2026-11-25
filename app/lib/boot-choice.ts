// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Starting by itself as the phone turns on (lib/background.ts, modules/erevos-call BootStart.kt):
// whose word counts as Erevos starts.
//
// Where Erevos receives in the background it starts by itself, unless the owner turned that off.
// Their choice is the phone's, which keeps one only once they made it (BootStart.kt), and it is
// kept with the phone's other settings that go with a copy of Erevos (BOOT_CHOICE_KEY), so a
// restore, or a move to another edition, keeps it.
//
// Before 3.0.0-rc.3 it was off until turned on, and the app kept 'off' (BOOT_BEFORE_KEY) on every
// phone that never touched the setting: an 'off' there is nobody's choice, and such a phone starts
// by itself now. An 'on' there was always the owner's, and so was whatever the phone itself kept.

/** The owner's choice, kept with the settings that go with a copy: 'on' or 'off', nothing while they made none. */
export const BOOT_CHOICE_KEY = 'erevos.boot-choice';

/** What a build before the choice kept: 'on' once the owner turned it on, 'off' otherwise. */
export const BOOT_BEFORE_KEY = 'erevos.boot-start';

/**
 * What is done as Erevos starts. `kept`: the choice kept with the settings; `phone`: the phone's
 * own, null while none was made on it; `before`: what a build before the choice kept.
 * `set`: what the phone's choice is made, null to leave it; `keep`: what is kept as the owner's
 * choice from now on, null for nothing new.
 */
export function bootChoiceAtStart(kept: string | null, phone: boolean | null, before: string | null): { set: boolean | null; keep: 'on' | 'off' | null } {
  // Kept with the settings: the phone follows, after a restore or a move to another edition.
  if (kept === 'on' || kept === 'off') return { set: phone === (kept === 'on') ? null : kept === 'on', keep: null };
  // Made on this phone before the choice was kept apart: kept now.
  if (phone !== null) return { set: null, keep: phone ? 'on' : 'off' };
  // Turned on in a copy from before, restored or moved here.
  if (before === 'on') return { set: true, keep: 'on' };
  // Nobody chose: it starts.
  return { set: null, keep: null };
}
