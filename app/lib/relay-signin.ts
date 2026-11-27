// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Signing in to a relay with a provider, such as LPHL (crates/erevos-relay/src/signin.rs): the
// claim secret this phone makes before it opens the browser, kept in memory for its space until the
// relay hands over a token for it (lib/relay.ts, claimSignIn). Only the claim's SHA-256 goes in the
// address the browser opens, so whatever sees that address cannot claim anything with it. Once
// signed in, the relay's page shows a code of its own making, which is typed here: a sign-in
// someone else did in their browser, with a link they sent, gives this phone nothing, as only they
// see its code. On a phone the page also has a button that hands the code back here, so nothing is
// typed (offerSignInCode). Which token this phone got as its own from a relay is kept too (OwnToken), so a
// token typed in, or another relay's, is never named in a claim. Self-contained but for lib/crypto
// and lib/relay-host, so it runs under plain Node for checks.

import { randomBytes, sha256Bytes, toHex, utf8Encode } from './crypto';
import { hostOf, isLoopback } from './relay-host';

export type SignIn = {
  /** The relay signed in to. */
  url: string;
  /** The claim secret, in hex: only for the relay, over the WebSocket. */
  claim: string;
  /** Its SHA-256, in hex: in the address the browser opens. */
  hash: string;
  made: number;
};

/** The token this phone got as its own from a relay, by an invite or a sign-in: that relay, and
 *  the token's SHA-256 in hex; `open` when it is a free place the relay gave by itself (an open
 *  place, lib/open-place.ts), which has a day's limits there. Kept sealed with the space's relay
 *  settings (lock/space-data.ts). */
export type OwnToken = { relay: string; hash: string; open?: true };
export const NO_OWN_TOKEN: OwnToken = { relay: '', hash: '' };

// The relay keeps a sign-in for 10 minutes from its start.
const LASTS = 10 * 60 * 1000;

const pending = new Map<number, SignIn>();

const plain = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();

/**
 * The relay address someone typed to sign in at (New chat, Another relay…): `wss://` and the host,
 * with or without the scheme, an https:// address taken as its wss://, and ws:// or http:// only
 * for this computer (for the checks). Null for anything else.
 */
export function signInRelay(typed: string): string | null {
  let text = typed.trim();
  if (!text || /\s/.test(text)) return null;
  if (!/^[a-z]+:/i.test(text)) text = `wss://${text}`;
  text = text.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
  text = text.replace(/^(wss?:\/\/.+?)\/+$/i, '$1');
  const host = hostOf(text);
  if (!host || !/^wss?:\/\/[^\s/?#]+(\/[^\s?#]*)?$/i.test(text)) return null;
  if (/^ws:/i.test(text) && !isLoopback(host)) return null;
  return text;
}

/** A new sign-in to the relay at `url` for `space`, in place of one it had under way. */
export function startSignIn(space: number, url: string, now = Date.now()): SignIn {
  const secret = randomBytes(32);
  const hash = sha256Bytes(secret);
  const signIn = { url: url.trim(), claim: toHex(secret), hash: toHex(hash), made: now };
  pending.set(space, signIn);
  return signIn;
}

/** The sign-in under way for `space` on the relay at `url`, if there is one and it is not too old. */
export function pendingSignIn(space: number, url: string, now = Date.now()): SignIn | null {
  const signIn = pending.get(space);
  if (!signIn) return null;
  if (now - signIn.made >= LASTS) {
    pending.delete(space);
    return null;
  }
  return plain(signIn.url) === plain(url) ? signIn : null;
}

/** Ends the sign-in under way for `space`, claimed or given up. */
export function endSignIn(space: number): void {
  pending.delete(space);
}

/**
 * Whether the relay at `url` may have the browser open `start` to sign in: an https:// page on the
 * relay's own host, or an http:// one there only when that is this computer (for the checks). So
 * a relay, or whatever answers in its place, cannot send the browser to a page somewhere else.
 */
export function isSignInPage(url: string, start: string): boolean {
  const host = hostOf(start);
  if (!host || host !== hostOf(url) || !/^https?:\/\/[^\s/?#]+\/\S*$/i.test(start)) return false;
  return /^https:/i.test(start) || isLoopback(host);
}

/** The address the browser opens: the relay's page `start`, with the claim's SHA-256; `toApp` on a
 *  phone, whose code page then has a button that brings the code back here (erevos://signin). */
export function signInLink(start: string, signIn: SignIn, toApp = false): string {
  return `${start}${start.includes('?') ? '&' : '?'}claim=${signIn.hash}${toApp ? '&to=app' : ''}`;
}

// The code the relay's page handed back to Erevos with its button (app/signin.tsx), for the sign-in
// under way: it claims nothing without the claim secret, kept above. Given to whichever sign-in
// shows (components/relay-signin.tsx), or held a moment for one that shows next.
const CODE_HELD = 60 * 1000;
let heldCode: { code: string; at: number } | null = null;
const codeListeners = new Set<(code: string) => void>();

/** A code from the relay's page, six digits; anything else is let go. */
export function offerSignInCode(code: string, now = Date.now()): void {
  if (!/^\d{6}$/.test(code)) return;
  if (codeListeners.size > 0) {
    heldCode = null;
    for (const listener of [...codeListeners]) listener(code);
  } else {
    heldCode = { code, at: now };
  }
}

/** Calls `listener` with each code from the relay's page, starting with one held a moment ago. Returns how to stop. */
export function onSignInCode(listener: (code: string) => void, now = Date.now()): () => void {
  codeListeners.add(listener);
  const held = heldCode;
  heldCode = null;
  if (held && now - held.at < CODE_HELD) listener(held.code);
  return () => {
    codeListeners.delete(listener);
  };
}

/** What to keep of `token`, which this phone got as its own from the relay at `url`. */
export function ownToken(url: string, token: string): OwnToken {
  return { relay: url.trim(), hash: toHex(sha256Bytes(utf8Encode(token.trim()))) };
}

/**
 * The token to name as this phone's before, signing in again on the relay at `url` with `token`
 * set: `token` when this phone got it as its own from that same relay (`own`), so the relay puts
 * the new line in its place; empty otherwise, so a token typed in, or one for another relay, never
 * goes in a claim.
 */
export function oldToken(url: string, token: string, own: OwnToken): string {
  if (!token.trim() || !own.hash || plain(own.relay) !== plain(url)) return '';
  return ownToken(url, token).hash === own.hash ? token.trim() : '';
}
