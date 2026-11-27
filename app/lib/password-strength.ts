// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { mark } from './i18n';

// A word of care under a new password of a space or PIN of hidden chats that is short: what
// guards them is kept in the phone's keystore, so a copy of its storage tries nothing; but someone
// who breaks into the phone's own security (its TEE, as forensic tools do on some phones) can try
// guesses on computers of their own, many at once, and a PIN of 6 digits, a million of them,
// falls in days. A phrase of a few words does not. It only advises: any password of the least
// length is taken. Self-contained, so it runs under plain Node for checks.

/** Fewer characters than this, or only digits and fewer than DIGITS_LEAST, is short. */
export const LEAST = 10;
export const DIGITS_LEAST = 14;

/** Whether a new password or PIN is short enough to be guessed by someone who breaks into the phone. */
export function isWeakSecret(text: string): boolean {
  const chars = [...text.trim()];
  if (chars.length === 0) return false;
  if (new Set(chars).size <= 2) return true;
  return /^\p{Nd}+$/u.test(text.trim()) ? chars.length < DIGITS_LEAST : chars.length < LEAST;
}

/** What is said under it, in the app's words (t()). */
export const WEAK_SECRET = mark('Short, so someone who breaks into the phone’s own security could guess it on computers of their own. A phrase of 4 or 5 words is far safer.');

/** How strong a new password reads, for a meter: weak, fair or strong; null while nothing is typed. */
export type Strength = 'weak' | 'fair' | 'strong';

// Its words: what is between spaces, dashes, dots and the like, each of 3 letters or more.
const wordsOf = (text: string) => text.split(/[\s\-_.,;:/+]+/u).filter((word) => [...word].length >= 3);

/**
 * How strong `text` reads: weak where isWeakSecret says it is short; strong as a phrase of 4 words
 * or more, or of 16 characters or more of three kinds (small and capital letters, digits, the
 * rest); fair in between. Only a guide for the meter, as isWeakSecret is: it cannot know a password
 * someone else has, or one made from a name or a date.
 */
export function strengthOf(text: string): Strength | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (isWeakSecret(trimmed)) return 'weak';
  if (wordsOf(trimmed).length >= 4) return 'strong';
  const kinds = [/\p{Ll}/u, /\p{Lu}/u, /\p{Nd}/u, /[^\p{L}\p{Nd}]/u].filter((kind) => kind.test(trimmed)).length;
  return [...trimmed].length >= 16 && kinds >= 3 ? 'strong' : 'fair';
}
