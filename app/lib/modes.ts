// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { directNow, directOf } from './direct';
import { t } from './i18n';
import { throughTor, type TorWay } from './relay';

// How much of this phone's internet address (its IP address) a space shows: one of three, chosen at
// the top of Settings (components/mode-picker.tsx), each space its own.
//
// SPEED: the servers and the contacts see it. Direct connections (lib/direct.ts) are on: Erevos asks
// nothing before what shows the address, and a call goes straight between the two phones, the
// fastest way, through the call relay only where it cannot.
// ANONYMOUS: only the servers see it, never the contacts. Direct connections are off: each warning is
// said once, before (lib/ip-warning.ts), and calls go through a call relay, or between two phones on
// the same network, as before Direct connections.
// INVISIBLE: no one sees it. Everything of the space goes through Tor, files too (the Tor way 'all'),
// and there are no calls, which never go through Tor: trying one says why, and one from a contact
// does not ring (lib/calls.ts, lib/group-calls.ts).
//
// The mode is not kept by itself. It is read from what the space keeps, its Direct connections, its
// Tor way and Nostr's own Tor switch (modeOf), so the Tor and Nostr screens, which change these too,
// always leave the space in one of the three; choosing one sets them (modeChange).

export type Mode = 'speed' | 'anonymous' | 'invisible';

/** The three, as Settings lists them. */
export const MODES: readonly Mode[] = ['speed', 'anonymous', 'invisible'];

/** Their names, the same in every language. */
export const MODE_NAMES: Record<Mode, string> = { speed: 'SPEED', anonymous: 'ANONYMOUS', invisible: 'INVISIBLE' };

type Kept = { direct: boolean; tor: string; nostr: { tor?: boolean } };

/** The mode a space's data says: INVISIBLE with everything through Tor, SPEED with Direct connections on (which count only with nothing through Tor), else ANONYMOUS. */
export function modeOf(data: Kept): Mode {
  if (data.tor === 'all') return 'invisible';
  return directOf(data) ? 'speed' : 'anonymous';
}

/** The open space's mode now; ANONYMOUS while no space is open. */
export function modeNow(): Mode {
  if (throughTor()) return 'invisible';
  return directNow() ? 'speed' : 'anonymous';
}

/** Whether calls are off now: INVISIBLE, as a call never goes through Tor. */
export function callsOff(): boolean {
  return throughTor();
}

/** What a call tried while calls are off says: why there is none, and how to have them again. */
export function callsOffNote(): string {
  return t('No calls in INVISIBLE: a call would show your internet address. To call, choose ANONYMOUS or SPEED at the top of Settings.');
}

/** How the line of a call that did not ring here, as calls were off, ends (lib/call-lines.ts). */
export const CALLS_OFF_LINE = ', in INVISIBLE';

/** What a screen that changed the mode by the way says, as the Tor and Nostr screens do: the mode now, and what it means. */
export function modeSaid(mode: Mode): string {
  if (mode === 'invisible') return t('This space is now INVISIBLE: everything goes through Tor, and there are no calls.');
  if (mode === 'anonymous') return t('This space is now ANONYMOUS: only the server sees your address. SPEED comes back only when you choose it at the top of Settings.');
  return t('This space is now SPEED: the servers and your contacts see your address.');
}

/**
 * What the space keeps once `mode` is chosen. SPEED: Direct connections on, Tor off, Nostr's own Tor
 * switch off. ANONYMOUS: Direct connections off; Tor off when everything went through it, while a
 * way of messages only stays. INVISIBLE: everything through Tor, Direct connections off.
 */
export function modeChange<N extends { tor?: boolean }>(data: { direct: boolean; tor: TorWay; nostr: N }, mode: Mode): { direct: boolean; tor: TorWay; nostr: N } {
  if (mode === 'speed') return { direct: true, tor: 'off', nostr: data.nostr.tor === true ? { ...data.nostr, tor: false } : data.nostr };
  if (mode === 'anonymous') return { direct: false, tor: data.tor === 'all' ? 'off' : data.tor, nostr: data.nostr };
  return { direct: false, tor: 'all', nostr: data.nostr };
}
