// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Tor for an account of another network (Telegram, Signal, Matrix, XMPP, Nostr), one way for all:
// the same three choices on each account's screen (components/account-tor.tsx), the same meaning,
// and the same rule that a chat's «Through Tor» overrides the account's choice.
//
// - 'never' (the default: nothing goes through Tor unless turned on): straight, whatever the space.
// - 'space': as the space's Tor way says (lib/relay.ts): with Messages, words through Tor while it
//   is ready and files straight; with Everything, all of it through Tor and never straight, so it
//   waits for Tor; with Off, straight.
// - 'always': only through Tor, Tor started for it when the space's way did not, never straight,
//   not even as it starts or signs in: without Tor nothing goes.
//
// Tor itself is one for the whole phone (lib/tor.ts): every account goes through the space's
// bridges, when it has any, as Erevos's own messages do. Calls never go through Tor.
//
// A chat set «Through Tor» (where the network has one connection for the account: Telegram,
// Signal, XMPP) makes the whole account 'always' while it is on (effectiveTor): a chat's setting
// overrides the account's, and such a chat never goes straight.

import { canTor, canTorHttp } from './core';
import { throughTor, torFor } from './relay';
import { torSocks } from './tor';
import { t } from './i18n';

export type AccountTor = 'space' | 'always' | 'never';

/** What a new account has: nothing through Tor until its owner turns it on. */
export const ACCOUNT_TOR_DEFAULT: AccountTor = 'never';

/** An account's choice as kept: anything else is the default; `true`, as Telegram and Signal kept a switch, is 'always'. */
export function accountTorOf(value: unknown): AccountTor {
  if (value === true) return 'always';
  return value === 'space' || value === 'always' || value === 'never' ? value : ACCOUNT_TOR_DEFAULT;
}

/** The choice that counts: 'always' while any chat of the account goes «Through Tor», else the account's own. */
export function effectiveTor(choice: AccountTor, chatsThroughTor: boolean): AccountTor {
  return chatsThroughTor ? 'always' : choice;
}

/** Whether this build has the Tor an account can go through. */
export function canAccountTor(): boolean {
  return canTor() && canTorHttp();
}

/** Whether what the account sends goes through Tor now; `files` for files and media. */
export function accountThroughTor(choice: AccountTor, files = false): boolean {
  if (!canAccountTor()) return false;
  if (choice === 'always') return true;
  if (choice === 'never') return false;
  return torFor(files);
}

/** Whether the account must not go straight now: 'always', or the space's way Everything. */
export function accountNeverStraight(choice: AccountTor): boolean {
  return choice === 'always' || (choice === 'space' && throughTor());
}

/** The error an account gives when it must go through Tor and cannot. */
export class AccountTorError extends Error {
  constructor() {
    super(t('Tor is not ready.'));
    this.name = 'AccountTorError';
  }
}

/**
 * The SOCKS door an account's connections go through (lib/tor.ts torSocks), its circuits named
 * `name` (one per account), or null for straight. Throws, rather than answering null, whenever
 * the account must not go straight (accountNeverStraight) and Tor cannot be had: no Tor in this
 * build, Tor not starting, or no usable bridges.
 */
export async function accountTorDoor(choice: AccountTor, name: string, files = false): Promise<Awaited<ReturnType<typeof torSocks>>> {
  const never = accountNeverStraight(choice);
  if (!accountThroughTor(choice, files) && !never) return null;
  let door: Awaited<ReturnType<typeof torSocks>> = null;
  try {
    door = await torSocks(name);
  } catch {
    door = null;
  }
  if (door) return door;
  if (never) throw new AccountTorError();
  return null;
}
