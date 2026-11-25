// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The line under the top bar of home (app/index.tsx): with a relay and a queue on it, the Ways;
// before that, what the relay still needs ("No relay yet", "Relay set · no queue yet").
//
// Home is drawn anew each time the space comes back from its password screen, and it used to say
// "No relay yet" until all the chats were read, some seconds on a phone with many, though the
// space had its relay all along and went on receiving behind the lock. So the line says nothing
// until the space's own data says what holds (`unknown`), that data is read at once and alone,
// and what it said is remembered while the space is open, so home shows it from its first drawing.
// Self-contained on purpose, so it runs under plain Node for checks.

/** What the line shows: not known yet, the Ways, a relay with no queue yet, or no relay. */
export type RelayLine = 'unknown' | 'ready' | 'no-queue' | 'none';

/** What the space's data says of its relay; null when the data could not be read, which says nothing. */
export function relayLineOf(data: { url: string; ownQueue: unknown } | null | undefined): Exclude<RelayLine, 'unknown'> | null {
  if (!data) return null;
  if (!data.url.trim()) return 'none';
  return data.ownQueue ? 'ready' : 'no-queue';
}

// What was last read, of the space open now only.
let known: { space: number; line: Exclude<RelayLine, 'unknown'> } | null = null;

/** What is known of the space's relay in this run: `unknown` until its data was read once. */
export function knownRelayLine(space: number | null): RelayLine {
  return space !== null && known?.space === space ? known.line : 'unknown';
}

export function keepRelayLine(space: number, line: Exclude<RelayLine, 'unknown'>): void {
  known = { space, line };
}

/** As the space closes: nothing of it stays. */
export function forgetRelayLine(): void {
  known = null;
}
