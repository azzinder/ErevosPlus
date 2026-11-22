// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// How many SMS a text costs, as the phone company counts them (3GPP TS 23.038 and 23.040): a text
// in the GSM alphabet takes 160 letters in one SMS, or 153 in each of a longer one's parts, a letter
// of its extension table ({ } [ ] ~ \ | ^ €) counting twice; any other letter, Greek small letters
// and accents included, makes the whole text UCS-2, 70 letters in one SMS or 67 in each part.
// And the text without accents: as the old phones wrote Greek, in capitals without accents, where
// the GSM alphabet has the Greek capitals that do not look Latin (Γ Δ Θ Λ Ξ Π Σ Φ Ψ Ω) and the
// Latin ones stand for the others, so a Greek SMS takes 160 letters again.

const BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\u001bÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const EXTENDED = '^{}\\[~]|€\f';
const basic = new Set(BASIC);
const extended = new Set(EXTENDED);

export type SmsCount = {
  /** Letters as the phone company counts them: septets in the GSM alphabet, UTF-16 units else. */
  used: number;
  /** How many SMS the text goes as. */
  parts: number;
  /** How many letters one part holds: 160 or 153 (GSM), 70 or 67 (UCS-2). */
  each: number;
  /** Whether the text is all in the GSM alphabet. */
  gsm: boolean;
};

/** Whether every letter of `text` is in the GSM alphabet. */
export function isGsm(text: string): boolean {
  for (const letter of text) if (!basic.has(letter) && !extended.has(letter)) return false;
  return true;
}

/** How many SMS `text` costs. */
export function smsCount(text: string): SmsCount {
  if (isGsm(text)) {
    let used = 0;
    for (const letter of text) used += extended.has(letter) ? 2 : 1;
    const parts = used <= 160 ? 1 : Math.ceil(used / 153);
    return { used, parts, each: parts === 1 ? 160 : 153, gsm: true };
  }
  const used = text.length;
  const parts = used <= 70 ? 1 : Math.ceil(used / 67);
  return { used, parts, each: parts === 1 ? 70 : 67, gsm: false };
}

// The Greek capitals the GSM alphabet lacks, by the Latin capital that looks the same.
const LOOKS: Record<string, string> = { Α: 'A', Β: 'B', Ε: 'E', Ζ: 'Z', Η: 'H', Ι: 'I', Κ: 'K', Μ: 'M', Ν: 'N', Ο: 'O', Ρ: 'P', Τ: 'T', Υ: 'Y', Χ: 'X' };
// Marks that look alike in the GSM alphabet.
const MARKS: Record<string, string> = {
  '‘': "'",
  '’': "'",
  '‚': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '«': '"',
  '»': '"',
  '–': '-',
  '—': '-',
  '…': '...',
  ' ': ' ',
  ';': ';',
  '·': ';',
  '·': '.',
};

/**
 * `text` in the GSM alphabet, as the old phones wrote it: without accents, Greek in capitals. Null
 * when it cannot be (an emoji, another alphabet), as the text then goes as UCS-2 anyway and the
 * capitals would gain nothing; and `text` itself when it already is.
 */
export function withoutAccents(text: string): string | null {
  if (isGsm(text)) return text;
  let out = '';
  for (const letter of text) {
    if (basic.has(letter) || extended.has(letter)) {
      out += letter;
      continue;
    }
    const mark = MARKS[letter];
    if (mark !== undefined) {
      out += mark;
      continue;
    }
    // The letter without its accents (ά → α, ê → e), then Greek in capitals (ς → Σ).
    const bare = letter.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const greek = /[Ͱ-Ͽ]/.test(bare);
    const upper = greek ? bare.toUpperCase() : bare;
    const plain = LOOKS[upper] ?? upper;
    if (!isGsm(plain)) return null;
    out += plain;
  }
  return out;
}
