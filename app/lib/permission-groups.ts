// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { NEEDED, type Check, type CheckId, type CheckState } from './permission-checks';

// Every permission at once, as the first start's fourth step shows them (app/first-steps.tsx): what
// the permissions check reads (lib/permission-checks.ts, lib/web-permission-checks.ts) for the
// modules chosen, and Erevos as the phone app and as the SMS app where the Phone and the SMS are
// on, in five groups, by what each is for, so a long list stays plain. Allow all first asks every
// question Android asks in Erevos itself (askedInApp), then opens, one at a time, each screen of
// Android's settings that what calls and messages need is changed on (nextSettingsScreen), as the
// person comes back from the one before. Self-contained, so the checks run it under Node.

/** A row: a check, or Erevos as the phone's phone app or SMS app. */
export type RowId = CheckId | 'phoneApp' | 'smsApp';

export type PermissionRow = { id: RowId; state: CheckState; needed: boolean };

/** The groups, by what they are for. */
export type GroupId = 'notices' | 'calls' | 'messages' | 'background' | 'reminders';

export type PermissionGroup = { id: GroupId; rows: PermissionRow[] };

// Each row's group, in the order they show; the web app's too (notices: push; the rest: the
// home screen and storage that stays).
const ORDER: readonly (readonly [GroupId, readonly RowId[]])[] = [
  ['notices', ['notices', 'push', 'calls', 'messages', 'fullScreen', 'lockScreen', 'messageSound', 'dnd']],
  ['calls', ['microphone', 'camera', 'ringer', 'phoneApp', 'contacts']],
  ['messages', ['smsApp', 'nearby']],
  ['background', ['battery', 'data', 'unused', 'restricted', 'maker', 'saver', 'home', 'storage']],
  ['reminders', ['alarms', 'reminders']],
];

/** Whether Erevos is the phone app (`phoneApp`) and the SMS app (`smsApp`): null where it does not
 *  apply, as with the module off, on a computer, or on a device given the phone's SMS. */
export type Roles = { phoneApp: boolean | null; smsApp: boolean | null };

/**
 * The groups of `checks` and `roles`, each with its rows in order; a group with none is left out.
 * A browser that cannot do one (state none) leaves it out too: nothing could change it.
 */
export function permissionGroups(checks: readonly Check[], roles: Roles): PermissionGroup[] {
  const rows = new Map<RowId, PermissionRow>();
  for (const check of checks) if (check.state !== 'none') rows.set(check.id, { id: check.id, state: check.state, needed: check.needed });
  if (roles.phoneApp !== null) rows.set('phoneApp', { id: 'phoneApp', state: roles.phoneApp ? 'ok' : 'missing', needed: false });
  if (roles.smsApp !== null) rows.set('smsApp', { id: 'smsApp', state: roles.smsApp ? 'ok' : 'missing', needed: false });
  return ORDER.map(([id, ids]) => ({ id, rows: ids.flatMap((row) => rows.get(row) ?? []) })).filter((group) => group.rows.length > 0);
}

/** How many rows are allowed (state ok), and how many there are. */
export function countAllowed(groups: readonly PermissionGroup[]): { ok: number; all: number } {
  const rows = groups.flatMap((group) => group.rows);
  return { ok: rows.filter((row) => row.state === 'ok').length, all: rows.length };
}

/** Whether every row is allowed. */
export function allAllowed(groups: readonly PermissionGroup[]): boolean {
  const { ok, all } = countAllowed(groups);
  return ok === all;
}

// The checks whose question Android asks in Erevos itself (lib/permissions.ts ASKS_ALL), the
// browser's for the web app's push notices and storage.
const IN_APP: ReadonlySet<RowId> = new Set<RowId>(['notices', 'microphone', 'camera', 'nearby', 'contacts', 'battery', 'push', 'storage']);

/** What Allow all asks first, in Erevos itself: the checks not allowed yet that have such a
 *  question, and whether to ask to be the phone app and the SMS app. */
export function askedInApp(groups: readonly PermissionGroup[]): { checks: CheckId[]; phoneApp: boolean; smsApp: boolean } {
  const missing = groups.flatMap((group) => group.rows).filter((row) => row.state !== 'ok');
  return {
    checks: missing.flatMap((row) => (row.id !== 'phoneApp' && row.id !== 'smsApp' && IN_APP.has(row.id) ? [row.id] : [])),
    phoneApp: missing.some((row) => row.id === 'phoneApp'),
    smsApp: missing.some((row) => row.id === 'smsApp'),
  };
}

/**
 * The next screen of Android's settings Allow all opens: the first row not allowed yet that calls
 * and messages need, that only such a screen changes, and that was not opened yet in this round
 * (`opened`). Null when none is left.
 */
export function nextSettingsScreen(groups: readonly PermissionGroup[], opened: ReadonlySet<RowId>): CheckId | null {
  for (const row of groups.flatMap((group) => group.rows)) {
    if (row.id === 'phoneApp' || row.id === 'smsApp') continue;
    if (row.state === 'ok' || IN_APP.has(row.id) || !NEEDED.has(row.id) || opened.has(row.id)) continue;
    return row.id;
  }
  return null;
}
