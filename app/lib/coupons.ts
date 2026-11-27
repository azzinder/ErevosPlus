// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { PendingCoupon, SpareRelay } from '../lock/space-data';
import { canCoupons, couponBlind, couponFinalize } from './core';
import { randomBytes, sha256Bytes } from './crypto';
import { t } from './i18n';
import { couponIssuers, couponKey, newPhoneToken, redeemCoupon, RelayError, signCoupon, toHex, type Relay } from './relay';

// The token of a home relay reached only through Tor (lib/spare.ts, SpareRelay.tor), taken with a
// coupon (crates/erevos-core/src/coupon.rs): the space's own relay, where this phone is a member,
// signs a coupon blind, and the home relay gives a token for it, through Tor and with no token,
// once for each coupon. The space's relay sees a blinded message only, the home relay a coupon the
// first never saw and no address: neither can tell whose the token is, so a second space whose
// relay is this one's home relay, and the other way round, are not tied together by either.
//
// Each step that one relay sees comes some time after the one before, at random, so that the times
// the two relays saw do not match: the home relay is asked which issuers it takes (once a day at
// most), the space's relay signs a few minutes later (ASK_LEAST to ASK_MOST), and the coupon is
// taken later again (WAIT_LEAST to WAIT_MOST; hours for a renewal, while the token before still
// works). Still, with few phones on a relay, whoever runs both could guess by the times alone. The
// token lasts COUPON_DAYS on the home relay (crates/erevos-relay); a new coupon is taken from a day
// picked at random between RENEW_LEAST and RENEW_MOST, so the turn of a renewal tells nothing, and
// the token before is used until the new one comes.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
/** How long a token from a coupon lasts on the home relay (crates/erevos-relay coupons::COUPON_DAYS). */
export const COUPON_DAYS = 90;
/** From when, at random, a token from a coupon is renewed. */
export const RENEW_LEAST = 30 * DAY;
export const RENEW_MOST = 60 * DAY;
/** How long after the home relay said its issuers the space's relay is asked to sign, at the least and the most. */
export const ASK_LEAST = 2 * MINUTE;
export const ASK_MOST = 15 * MINUTE;
/** How long after it was signed a coupon is taken at the least and the most: for a first token, and for a renewal. */
export const WAIT_LEAST = 5 * MINUTE;
export const WAIT_MOST = 45 * MINUTE;
export const RENEW_WAIT_LEAST = HOUR;
export const RENEW_WAIT_MOST = 24 * HOUR;
/** How long the issuers a home relay said are trusted before it is asked again. */
const ISSUERS_FOR = DAY;
/** After a failed renewal, how long until the next try; the token before still works. */
const RETRY = 60 * MINUTE;

// Bytes from hex kept by this phone (lock/space-data.ts checked it is hex).
const bytesOf = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (pair) => parseInt(pair, 16));

/** The coupon is signed and is taken on the home relay later; until then the home relay has no token. */
export class CouponWaitError extends RelayError {
  constructor() {
    super(t('The home server’s token comes with a coupon from your server within the hour: the wait keeps the two servers from telling by the time that it is yours.'));
  }
}

/** Whether a home relay takes its token with a coupon now: one through Tor with none yet, or one near its end. */
export function wantsCoupon(spare: SpareRelay, now = Date.now()): boolean {
  if (spare.tor !== true || !spare.url.trim()) return false;
  return !spare.token.trim() || (spare.coupon !== undefined && now >= (spare.renew ?? spare.coupon + RENEW_LEAST));
}

/** Whether a token from a coupon is surely gone from the home relay: past its days. */
export function couponEnded(spare: SpareRelay, now = Date.now()): boolean {
  return spare.coupon !== undefined && now - spare.coupon >= COUPON_DAYS * DAY;
}

/** What a coupon step gives: the home relay's settings to keep from now on, if they changed, and
 *  whether it waits for a coupon to be taken later. */
export type CouponStep = { next: SpareRelay | null; waits: boolean };

// The last failed try at each home relay, while Erevos runs, so a renewal is not asked at each look.
const failed = new Map<string, number>();
// What each home relay last said of the issuers it takes (hex), when, and from when the space's
// relay may be asked to sign, while Erevos runs.
const asked = new Map<string, { ids: string[]; at: number; signFrom: number }>();

const between = (least: number, most: number, random: () => number) => least + Math.floor(random() * (most - least));

function without(spare: SpareRelay): SpareRelay {
  const { pending: _pending, ...rest } = spare;
  return rest;
}

/**
 * One step towards the token of the home relay `spare` with a coupon of `primary`, the space's own
 * relay with this phone's token: takes a coupon whose time came, or has a new one signed. Throws
 * when that cannot be done, unless the home relay has a token still to go on with.
 */
export async function couponStep(spare: SpareRelay, primary: Relay | null, now = Date.now(), random: () => number = Math.random): Promise<CouponStep> {
  const url = spare.url.trim();
  const going = !!spare.token.trim() && !couponEnded(spare, now);
  if (going && now - (failed.get(url) ?? 0) < RETRY) return { next: null, waits: false };
  try {
    return await step(spare, primary, now, random);
  } catch (error) {
    if (!going) throw error;
    failed.set(url, now);
    return { next: null, waits: false };
  }
}

async function step(spare: SpareRelay, primary: Relay | null, now: number, random: () => number): Promise<CouponStep> {
  const url = spare.url.trim();
  // Through Tor, as the home relay is reached (wantsCoupon asks only for one that is).
  const tor = spare.tor === true;
  const pending = spare.pending;
  if (pending) {
    if (now < pending.after) return { next: null, waits: true };
    const coupon = { issuer: bytesOf(pending.issuer), nonce: bytesOf(pending.nonce), randomizer: bytesOf(pending.randomizer), signature: bytesOf(pending.signature) };
    try {
      await redeemCoupon(url, tor, coupon, pending.token);
    } catch (error) {
      // One the home relay will never take (NOT_FOUND, 1: not its issuer's; WRONG, 5: taken with
      // another token) is let go of, and the next look has a new one signed.
      if (error instanceof RelayError && (error.status === 1 || error.status === 5)) {
        // Its issuers are asked again first, some minutes before the next is signed.
        asked.delete(url);
        return { next: without(spare), waits: false };
      }
      throw error;
    }
    failed.delete(url);
    return { next: { ...without(spare), token: pending.token, coupon: now, renew: now + between(RENEW_LEAST, RENEW_MOST, random) }, waits: false };
  }
  // The home relay is asked which issuers it takes on a look of its own, some minutes before the
  // space's relay signs: the two relays do not see this phone's steps one right after the other.
  const seen = asked.get(url);
  if (!seen || now < seen.at || now - seen.at >= ISSUERS_FOR) {
    const ids = (await couponIssuers(url, tor)).map(toHex);
    asked.set(url, { ids, at: now, signFrom: now + between(ASK_LEAST, ASK_MOST, random) });
    // A home relay that takes no coupons: as it is, with no token, or the one typed.
    return { next: null, waits: ids.length > 0 };
  }
  if (seen.ids.length === 0) return { next: null, waits: false };
  if (now < seen.signFrom) return { next: null, waits: true };
  if (!primary?.url.trim()) throw new RelayError(t('This home server gives its token for a coupon from your server: set your server first.'));
  if (!canCoupons()) throw new RelayError(t('This version of Erevos cannot make coupons. Update it, or type a token for the home server.'));
  const key = await couponKey(primary);
  if (!key) throw new RelayError(t('Your server signs no coupons for this phone. Type a token for the home server instead.'));
  const id = sha256Bytes(key);
  if (!seen.ids.includes(toHex(id))) throw new RelayError(t('The home server does not take coupons from your server.'));
  const nonce = randomBytes(32);
  const blinded = await couponBlind(key, nonce);
  const signature = await couponFinalize(key, await signCoupon(primary, blinded.message), blinded, nonce);
  const next: PendingCoupon = {
    issuer: toHex(id),
    nonce: toHex(nonce),
    randomizer: toHex(blinded.randomizer),
    signature: toHex(signature),
    token: newPhoneToken(),
    // Hours later for a renewal, as the token before still works.
    after: now + (spare.token.trim() ? between(RENEW_WAIT_LEAST, RENEW_WAIT_MOST, random) : between(WAIT_LEAST, WAIT_MOST, random)),
  };
  return { next: { ...spare, pending: next }, waits: true };
}
