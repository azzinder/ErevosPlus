// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { PACKAGES, UPDATE_EDITIONS, type UpdateEdition } from './update-channel';

// The note one edition leaves beside its move for another (lib/edition-move.ts), read with care:
// it comes from another app, even if one signed as this one.

/** How long a move waits for the edition it is for. */
export const MOVE_WAITS = 24 * 60 * 60 * 1000;

/**
 * What move.json says: from which edition to which, when made, the backup and its parts, and their
 * password; `size`, all its files' bytes; `roles`, whether the app moved from was the phone's SMS or
 * phone app, so that the one moved to asks to be; `net`, the bytes its engines carry beside the
 * backup (Erevos+'s networks, erevos-device MoveNet.kt), when they carry any.
 */
export type MoveNote = { v: 1; from: UpdateEdition; to: UpdateEdition; made: number; backup: string; parts: string[]; password: string; size?: number; net?: number; roles?: { sms: boolean; phone: boolean } };

/** move.json, checked: null for anything else, or a move made more than MOVE_WAITS ago (or ahead of `now`). */
export function readMoveNote(text: string, now = Date.now()): MoveNote | null {
  let v: Record<string, unknown> | null;
  try {
    v = JSON.parse(text) as Record<string, unknown> | null;
  } catch {
    return null;
  }
  if (!v || v.v !== 1) return null;
  const edition = (x: unknown): x is UpdateEdition => typeof x === 'string' && (UPDATE_EDITIONS as readonly string[]).includes(x);
  const name = (x: unknown): x is string => typeof x === 'string' && /^move(-part-\d{1,6})?\.erevos$/.test(x);
  // From an edition to itself only from Erevos+'s bridge (app.erevos) to app.erevos.plus: moveFor checks the app.
  if (!edition(v.from) || !edition(v.to) || (v.from === v.to && v.from !== 'plus')) return null;
  if (typeof v.made !== 'number' || !(v.made <= now + 60_000 && now - v.made < MOVE_WAITS)) return null;
  if (!name(v.backup) || !Array.isArray(v.parts) || v.parts.length > 100_000 || !v.parts.every(name)) return null;
  if (typeof v.password !== 'string' || !/^[0-9a-f]{64}$/.test(v.password)) return null;
  if (v.size !== undefined && !(typeof v.size === 'number' && Number.isSafeInteger(v.size) && v.size >= 0)) return null;
  if (v.net !== undefined && !(typeof v.net === 'number' && Number.isSafeInteger(v.net) && v.net >= 0)) return null;
  const roles = v.roles as Record<string, unknown> | undefined;
  if (roles !== undefined && (typeof roles !== 'object' || roles === null || typeof roles.sms !== 'boolean' || typeof roles.phone !== 'boolean')) return null;
  return {
    v: 1,
    from: v.from,
    to: v.to,
    made: v.made,
    backup: v.backup,
    parts: v.parts as string[],
    password: v.password,
    ...(v.size !== undefined ? { size: v.size as number } : {}),
    ...(v.net !== undefined ? { net: v.net as number } : {}),
    ...(roles ? { roles: { sms: roles.sms as boolean, phone: roles.phone as boolean } } : {}),
  };
}

/** What moved-out.json says, in the app moved from: to which edition, when. */
export type MovedOutNote = { to: UpdateEdition; made: number };

/** moved-out.json, checked: null for anything else. */
export function readMovedOut(text: string): MovedOutNote | null {
  try {
    const v = JSON.parse(text) as Record<string, unknown> | null;
    if (!v || typeof v.to !== 'string' || !(UPDATE_EDITIONS as readonly string[]).includes(v.to) || typeof v.made !== 'number') return null;
    return { to: v.to as UpdateEdition, made: v.made };
  } catch {
    return null;
  }
}

/** The room a move needs on the phone, in bytes, for `size` bytes of data: its copy, and some to spare. */
export function moveRoom(size: number): number {
  return Math.ceil(size * 1.2) + 64 * 1024 * 1024;
}

/**
 * Whether `note`, served by the app `pkg`, is a move for this app, of `edition` with the package
 * `own`: for this edition, from the app it says it is from, never this one. Erevos+'s bridge is
 * Erevos+ as app.erevos (lib/update-channel.ts wireOf): its move is from plus to plus.
 */
export function moveFor(note: MoveNote, pkg: string, edition: UpdateEdition, own: string): boolean {
  if (note.to !== edition || pkg === own) return false;
  if (note.from === 'plus' && pkg === PACKAGES.erevos) return true;
  return note.from !== note.to && PACKAGES[note.from] === pkg;
}
