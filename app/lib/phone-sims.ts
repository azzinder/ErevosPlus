// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The SIM each number is called on, for one space: chosen at a call, and kept for the number,
// sealed in the space (lock/phone-data.ts), so the next call to it goes on the same SIM. With one
// SIM there is nothing to choose.

import { loadPhoneData, MAX_SIMS, savePhoneData, type PhoneData, type SpeedDial } from '../lock/phone-data';
import type { PhoneAccount } from '../modules/erevos-phone';
import { randomBytes, toHex } from './crypto';
import { lockedSpeedIs, setLockedSpeedDials } from './phone-open';
import { plainNumber, sameNumber } from './sms-invite';

export class PhoneSims {
  private readonly space: number;
  private readonly key: Uint8Array;
  private data: PhoneData;

  private constructor(space: number, key: Uint8Array, data: PhoneData) {
    this.space = space;
    this.key = key;
    this.data = data;
  }

  static async open(space: number, key: Uint8Array): Promise<PhoneSims> {
    return new PhoneSims(space, key, await loadPhoneData('space', space, key));
  }

  /** The account id chosen for `number`, or ''. */
  accountFor(number: string): string {
    return this.data.sims.find((s) => sameNumber(s.number, number))?.account ?? '';
  }

  /** Calls to `number` go on `account` from now on; '' forgets the choice. */
  async remember(number: string, account: string): Promise<void> {
    const plain = plainNumber(number);
    if (!plain || this.accountFor(plain) === account) return;
    const others = this.data.sims.filter((s) => !sameNumber(s.number, plain));
    const data = { ...this.data, sims: [...others, ...(account ? [{ number: plain, account }] : [])].slice(-MAX_SIMS) };
    await savePhoneData('space', this.space, this.key, data);
    this.data = data;
  }

  /** The number on speed dial for `key` (2 to 9), if one is. */
  speed(key: string): SpeedDial | undefined {
    return this.data.speed.find((s) => s.key === key);
  }

  /** Every number on speed dial, by key. */
  speeds(): SpeedDial[] {
    return [...this.data.speed].sort((a, b) => a.key.localeCompare(b.key));
  }

  /** Puts `number` on speed dial for `key`, or takes the key's number off with ''. */
  async setSpeed(key: string, number: string, name: string): Promise<void> {
    const plain = plainNumber(number);
    const others = this.data.speed.filter((s) => s.key !== key);
    const data = { ...this.data, speed: plain ? [...others, { key, number: plain, name: name.slice(0, 200) }] : others };
    await savePhoneData('space', this.space, this.key, data);
    this.data = data;
    if (await this.feedsLocked()) await setLockedSpeedDials({ feed: data.lockedFeed, keys: data.speed });
  }

  /** Whether speed dial works with Erevos locked with this space's numbers (lib/phone-open.ts). */
  feedsLocked(): Promise<boolean> {
    return lockedSpeedIs(this.data.lockedFeed);
  }

  /** Lets this space's speed dial work with Erevos locked, with a copy of its numbers outside the
   *  space, in place of another space's; or takes that copy away again. */
  async setFeedsLocked(on: boolean): Promise<void> {
    if (!on) {
      if (await this.feedsLocked()) await setLockedSpeedDials(null);
      if (this.data.lockedFeed) {
        const data = { ...this.data, lockedFeed: '' };
        await savePhoneData('space', this.space, this.key, data);
        this.data = data;
      }
      return;
    }
    const data = { ...this.data, lockedFeed: toHex(randomBytes(16)) };
    await savePhoneData('space', this.space, this.key, data);
    this.data = data;
    await setLockedSpeedDials({ feed: data.lockedFeed, keys: data.speed });
  }
}

/** The SIM a call to a number goes on: the one kept for it, if the phone still has it; '' for
 *  the phone's default, with one SIM or none known; null when the owner should choose. */
export function callAccount(accounts: PhoneAccount[], kept: string): string | null {
  if (accounts.length < 2) return '';
  return accounts.some((a) => a.id === kept) ? kept : null;
}

/** "SIM 1 · Cosmote": the SIM, and its network's name when it has one. */
export function accountLabel(account: PhoneAccount): string {
  return account.label && account.label !== account.name ? `${account.name} · ${account.label}` : account.name;
}
