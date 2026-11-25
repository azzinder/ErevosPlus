// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// What a backup holds of Erevos+'s other networks (lib/backup-networks.ts), as it is read back:
// apart, so checks/backup-networks.check.ts reads it without the engines.

/** Session's account as its engine keeps it, in the clear, inside the sealed backup. */
export type Networks = { session?: string };

/** The other networks' accounts a backup holds, checked: what is not as Erevos+ makes it is left out. */
export function checkedNetworks(value: unknown): Networks | null {
  const v = (value ?? {}) as { session?: unknown };
  if (typeof v.session !== 'string' || !v.session) return null;
  try {
    const state = JSON.parse(v.session) as { seed?: unknown };
    if (typeof state?.seed !== 'string' || !/^[0-9a-f]{32}$/i.test(state.seed)) return null;
  } catch {
    return null;
  }
  return { session: v.session };
}

