// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A new Signal chat (components/msg-account.tsx): what was typed read as a phone number, and the
// phone's contacts it matches, by name or number. Only the number tapped is then asked of Signal
// (its contact discovery), never the whole address book: Signal learns no more of the owner's
// contacts than the one they write to. Pure, so the checks can run it.

/** A contact of the phone, as the new chat offers it: a name and one of its numbers. */
export type ContactNumber = { name: string; number: string };

const folded = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const digitsOf = (text: string) => text.replace(/\D/g, '');

/**
 * What was typed as a phone number, as it will be asked (spaces, dashes, brackets, dots and
 * slashes dropped; + or 00 kept as +), or null when it is not one: 6 to 15 digits. Without a
 * country code the engine adds the account's own.
 */
export function typedNumber(query: string): string | null {
  const q = query.trim().replace(/[\s\-()./]/g, '');
  const m = /^(\+|00)?(\d{6,15})$/.exec(q);
  if (!m) return null;
  return m[1] ? `+${m[2]}` : m[2];
}

/**
 * The phone's contacts' numbers that match what was typed: by name (any part, without accents or
 * case) from two letters, or by number from three digits. One row per number, by name, at most `max`.
 */
export function contactMatches(cards: readonly { name: string; phones: readonly { value: string }[] }[], query: string, max = 8): ContactNumber[] {
  const q = folded(query.trim());
  const digits = digitsOf(query);
  // Only digits (with +, spaces, dashes, brackets, dots or slashes): a number, matched from three digits.
  const byNumber = digits.length >= 3 && /^\+?[\d\s\-()./]+$/.test(query.trim());
  if (!byNumber && q.length < 2) return [];
  const out: ContactNumber[] = [];
  const seen = new Set<string>();
  for (const card of cards) {
    const nameHit = !byNumber && folded(card.name).includes(q);
    for (const phone of card.phones) {
      const d = digitsOf(phone.value);
      if (d.length < 6) continue;
      const hit = nameHit || (byNumber && (d.includes(digits) || digits.endsWith(d.slice(-10))));
      const key = d.slice(-10);
      if (!hit || seen.has(key)) continue;
      seen.add(key);
      out.push({ name: card.name, number: phone.value.trim() });
      if (out.length >= max) return out;
    }
  }
  return out;
}
