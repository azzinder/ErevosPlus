// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The spam list of the Phone (modules/erevos-phone Spam.kt): downloaded whole, from an address the
// owner chooses, and matched on the phone, so no number is ever looked up anywhere. The file holds
// one number a line with its country code (+30 211 000 4455, or 0030…), or the start of numbers
// followed by * (+30 211 000*), then what kind of calls they are; # starts a note. It goes through
// Tor when the space's Tor way says so (lib/net-http.ts); without Tor, the list's server sees this
// phone's internet address, which app/phone-settings.tsx says before it downloads, and before the
// weekly download is switched on. The weekly download goes without Tor only when it was switched on
// without Tor, after that warning: switched on with Tor, it waits while Tor is off. While Direct
// connections are on in the open space (lib/direct.ts), nothing is asked and nothing is kept as
// said: the list comes without Tor for as long as they are on, and waits again once they are off.

import { utf8Decode } from './crypto';
import { directNow } from './direct';
import { t } from './i18n';
import { netHttp, netThroughTor, type Http } from './net-http';
import { secureDelete, secureGet, secureSet } from './secure';
import { setSpamAuto, setSpamList, spamState } from '../modules/erevos-phone';

/** The largest list taken. */
export const SPAM_MOST = 20 * 1024 * 1024;

/** The address typed, when it is one a list can come from: https only; else null. */
export function spamAddress(text: string): string | null {
  const address = text.trim();
  if (!/^https:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/i.test(address) || address.length > 2000) return null;
  return address;
}

/** How many lines of `text` are numbers, or starts of numbers, as Spam.kt takes them. */
export function spamLines(text: string): number {
  let count = 0;
  for (const raw of text.split(/\r?\n/)) {
    const clean = raw.split('#')[0].trim();
    const head = /^[+0-9* ().-]+/.exec(clean)?.[0].trim() ?? '';
    const start = head.endsWith('*');
    const bare = head.replace(/\*$/, '').replace(/[^\d+]/g, '');
    const digits = bare.startsWith('+') ? bare.slice(1).replace(/\D/g, '') : bare.startsWith('00') ? bare.slice(2) : '';
    if (digits.length >= (start ? 3 : 6) && digits.length <= 15) count++;
  }
  return count;
}

/** Downloads the list from `address` and keeps it in place of the one before; how many numbers it holds. */
export async function downloadSpamList(address: string, http: Http = netHttp): Promise<number> {
  const answer = await http('GET', address, { 'Cache-Control': 'no-cache' }, undefined, SPAM_MOST);
  if (answer.status !== 200) throw new Error(t('The list did not come: its server answered {status}.', { status: String(answer.status) }));
  const text = utf8Decode(answer.bytes);
  if (spamLines(text) === 0) throw new Error(t('That file holds no numbers as the list needs them, with their country code.'));
  return setSpamList(text, address);
}

/** How old a list is let to grow before it is downloaded again, when the owner switched that on. */
export const SPAM_EVERY = 7 * 24 * 60 * 60 * 1000;

// When it was last tried in this run of the app, so a server that does not answer is not asked
// again each time the Phone opens.
let tried = 0;

// Set when the weekly download was switched on without Tor, after the warning of the IP address.
const PLAIN = 'erevos.spam-plain';

/** Switches the weekly download on or off; `withoutTor` when it was switched on after the warning that the list's server sees the IP address. */
export async function setSpamWeekly(on: boolean, withoutTor: boolean): Promise<void> {
  setSpamAuto(on);
  if (on && withoutTor) await secureSet(PLAIN, '1');
  else await secureDelete(PLAIN);
}

/** Whether the weekly download may go without Tor: it was switched on without it, after the warning. */
export async function spamWithoutTor(): Promise<boolean> {
  return (await secureGet(PLAIN).catch(() => null)) === '1';
}

/** Downloads the list again from where it came, when the weekly download is on and the list is a
 * week old; with Erevos unlocked, as the space's Tor way needs it. Says nothing when it fails: the
 * list kept stays, and the date under Phone settings shows how old it is. Whether it went.
 * `direct`: whether Direct connections are on in the open space, when it comes without Tor unasked. */
export async function refreshSpamList(now = Date.now(), http: Http = netHttp, throughTor: () => boolean = netThroughTor, direct: () => boolean = directNow): Promise<boolean> {
  const state = spamState();
  if (!state?.auto || !state.source || state.at <= 0 || now - state.at < SPAM_EVERY || now - tried < SPAM_EVERY / 7) return false;
  const from = spamAddress(state.source);
  if (!from) return false;
  // Tor is off, Direct connections too, and the owner never said the list may come without Tor: it waits.
  if (!throughTor() && !direct() && !(await spamWithoutTor())) return false;
  tried = now;
  try {
    await downloadSpamList(from, http);
    return true;
  } catch {
    return false;
  }
}
