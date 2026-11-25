// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { phoneId, simsHere } from './restored';
import { sealedFile, type Holder } from './sealed-file';

// What each space keeps for the phone's calls (app/phone.tsx), sealed like its contacts
// (sealed-file.ts): the SIM chosen for each number called, and the numbers on speed dial. The calls
// themselves stay in the phone's call history, where Android keeps them for every phone app, and
// backups hold them only when the
// owner wants (lib/backup-calls.ts); the rules that turn calls away stay
// with Android too (lib/phone-rules.ts), as it applies them while Erevos is locked, and backups
// hold them with the quick replies (lib/backup-native.ts). The SIMs are known by the ids this
// phone gave them, which on another phone may name another SIM: they count only on the phone they
// were chosen on (`simsOn`, lock/restored.ts), as the SMS's do (lock/sms-data.ts).

export type { Holder };

/** The SIM chosen for calls to a number: its account id (modules/erevos-phone PhoneAccount). */
export type NumberAccount = { number: string; account: string };

/** A number on speed dial: held, `key` (2 to 9) on the keypad calls it; `name` as it was chosen. */
export type SpeedDial = { key: string; number: string; name: string };

export const SPEED_KEYS = ['2', '3', '4', '5', '6', '7', '8', '9'] as const;

export type PhoneData = {
  sims: NumberAccount[];
  /** Speed dial, one number for each key at most; numbers count on every phone, unlike `sims`. */
  speed: SpeedDial[];
  /** The phone `sims` were chosen on (lock/restored.ts phoneId), '' for those kept before it was said. */
  simsOn: string;
  /** While this space keeps speed dial working with Erevos locked, the `feed` of that copy
   *  (lib/phone-open.ts); '' otherwise. */
  lockedFeed: string;
};

export const EMPTY_PHONE: PhoneData = { sims: [], speed: [], simsOn: '', lockedFeed: '' };

export const FILE = 'erevos-phone';
const BLOCK = 4 * 1024;
export const MAX_SIMS = 300;

const isText = (v: unknown): v is string => typeof v === 'string';

function checked(value: unknown): PhoneData {
  const v = (value ?? {}) as Partial<Record<keyof PhoneData, unknown>>;
  return {
    sims: (Array.isArray(v.sims) ? v.sims : [])
      .map((item) => (item ?? {}) as Record<string, unknown>)
      .filter((n) => isText(n.number) && n.number.length > 0 && n.number.length <= 32 && isText(n.account) && n.account.length > 0 && n.account.length <= 200)
      .map((n) => ({ number: n.number as string, account: n.account as string }))
      .slice(-MAX_SIMS),
    speed: (Array.isArray(v.speed) ? v.speed : [])
      .map((item) => (item ?? {}) as Record<string, unknown>)
      .filter(
        (n, i, all) =>
          isText(n.key) &&
          (SPEED_KEYS as readonly string[]).includes(n.key) &&
          all.findIndex((m) => m.key === n.key) === i &&
          isText(n.number) &&
          n.number.length > 0 &&
          n.number.length <= 32 &&
          isText(n.name) &&
          n.name.length <= 200,
      )
      .map((n) => ({ key: n.key as string, number: n.number as string, name: n.name as string })),
    simsOn: isText(v.simsOn) && v.simsOn.length <= 64 ? v.simsOn : '',
    lockedFeed: isText(v.lockedFeed) && v.lockedFeed.length <= 64 ? v.lockedFeed : '',
  };
}

const store = sealedFile({ name: FILE, empty: EMPTY_PHONE, checked, block: BLOCK });

/** The space's data; SIMs chosen on another phone are none of this one's, and left out. */
export async function loadPhoneData(holder: Holder, space: number, key: Uint8Array): Promise<PhoneData> {
  const data = await store.load(holder, space, key);
  return (await simsHere(data.simsOn)) ? data : { ...data, sims: [] };
}

/** Saves the space's data: its SIMs are this phone's from then on. */
export async function savePhoneData(holder: Holder, space: number, key: Uint8Array, data: PhoneData): Promise<void> {
  await store.save(holder, space, key, { ...data, simsOn: await phoneId() });
}
