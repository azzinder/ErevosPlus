// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { mutedNow, type ChatNotify } from '../lock/chat-notify';
import { currentSpace } from '../lock/keys';
import { loadSmsData, type SmsData } from '../lock/sms-data';
import type { SmsOwn } from '../lock/sms-own';
import { canSmsOwnNotices, smsNoticeDetails, smsOwnNotices } from '../modules/erevos-sms';

import { smsNumbers } from './sms-group';
import { sameNumber } from './sms-invite';

// An SMS conversation's own notifications (Notifications in it, lock/chat-notify.ts), kept with the
// space's SMS data (lock/sms-own.ts), as a Matrix, XMPP or Nostr chat keeps its own: muted, its SMS
// come with no notice and no sound; with a sound of its own, or none, with a notice that makes none,
// and its sound plays from Erevos (lib/background.ts), as a space's chat with a sound of its own
// does. Android shows an SMS's notice before the app hears of it, so the phone is told the numbers,
// in memory only, while the space is open (SmsStore.kt): once it closes, or Erevos is stopped, each
// SMS tells as the app's settings say, as a closed space says nothing of which chat a message came
// in. By the number an SMS or MMS comes from, so only a conversation with one number has them: a
// group's MMS come from each of its numbers.

/** A conversation with one number and notifications of its own. */
type Told = { number: string; notify: ChatNotify };

// The space whose conversations the phone was told of, while it is open, and what it was told.
let open: number | null = null;
let told: Told[] = [];
// Whether the phone took them: a build without them shows every SMS's notice as ever.
let taken = false;
let timer: ReturnType<typeof setTimeout> | null = null;

/** What the phone is told of these conversations at `now`: the numbers muted, until when, and
 *  those with a sound of their own, or none; and when a mute ends, to tell it again then (0: none). */
export function noticeLists(list: readonly SmsOwn[], now = Date.now()): { muted: { number: string; until: number }[]; sounds: string[]; next: number } {
  const muted: { number: string; until: number }[] = [];
  const sounds: string[] = [];
  let next = 0;
  for (const own of list) {
    const numbers = smsNumbers(own.address);
    if (numbers.length !== 1 || !own.notify) continue;
    if (mutedNow(own.notify, now)) {
      muted.push({ number: numbers[0], until: own.notify.until! });
      next = next ? Math.min(next, own.notify.until!) : own.notify.until!;
    } else if (own.notify.sound !== undefined) sounds.push(numbers[0]);
  }
  return { muted, sounds, next };
}

function tell(list: readonly SmsOwn[]): void {
  if (timer) clearTimeout(timer);
  timer = null;
  const now = Date.now();
  const { muted, sounds, next } = noticeLists(list, now);
  told = list.flatMap((own) => {
    const numbers = smsNumbers(own.address);
    return numbers.length === 1 && own.notify ? [{ number: numbers[0], notify: own.notify }] : [];
  });
  taken = smsOwnNotices(muted, sounds);
  // Once a mute ends its number sounds again: the phone keeps when, and Erevos tells it anew then,
  // for the sound of its own it may have. Timers longer than about 24 days go off at once.
  if (taken && next > now && open !== null) timer = setTimeout(() => tell(list), Math.min(next - now, 2 ** 31 - 1));
}

/** The space's SMS data was read or changed (lib/sms-link.ts): while it is the one open, the phone
 *  learns what its conversations have of their own now, and whether a notice shows who wrote and
 *  what (SmsStore.setNoticeDetails); once it closes, a notice says only "New message" again. */
export function smsNoticesRead(space: number, data: Pick<SmsData, 'own' | 'notices'>): void {
  if (space !== open) return;
  tell(data.own);
  smsNoticeDetails(data.notices);
}

/** How an SMS from `address` sounds as it comes, by its conversation's own notifications in the
 *  open space: null when muted, its own sound ('' for none), or undefined as the app has it. */
export function smsSoundOf(address: string, now = Date.now()): string | null | undefined {
  if (!taken) return undefined;
  const one = told.find((t) => sameNumber(t.number, address));
  if (!one) return undefined;
  return mutedNow(one.notify, now) ? null : one.notify.sound;
}

/** Tells the phone the open space's conversations with notifications of their own, as it opens
 *  and as they change, until the function it gives is called: then none. */
export function startSmsNotices(): () => void {
  if (!canSmsOwnNotices()) return () => undefined;
  const { space, key } = currentSpace();
  open = space;
  void loadSmsData('space', space, key)
    .then((data) => smsNoticesRead(space, data))
    .catch(() => undefined);
  return () => {
    if (open !== space) return;
    open = null;
    tell([]);
    smsNoticeDetails(false);
    taken = false;
  };
}
