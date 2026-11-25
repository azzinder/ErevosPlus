// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A new Signal chat (lib/signal-new-chat.ts): a typed number, and the phone's contacts it matches.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { contactMatches, typedNumber } from '../lib/signal-new-chat';

test('a typed number, with or without its country code', () => {
  assert.equal(typedNumber('+30 694 123 4567'), '+306941234567');
  assert.equal(typedNumber('0030-694-1234567'), '+306941234567');
  assert.equal(typedNumber('(694) 123.45.67'), '6941234567');
  assert.equal(typedNumber('Ada'), null);
  assert.equal(typedNumber('12345'), null);
  assert.equal(typedNumber('nekten.01'), null);
});

const cards = [
  { name: 'Ελένη Παπαδοπούλου', phones: [{ value: '+30 694 111 2222' }, { value: '210 555 6666' }] },
  { name: 'Ada Lovelace', phones: [{ value: '6943334444' }] },
  { name: 'Short', phones: [{ value: '1234' }] },
];

test('by name, without accents or case, one row per number', () => {
  assert.deepEqual(contactMatches(cards, 'ελενη'), [
    { name: 'Ελένη Παπαδοπούλου', number: '+30 694 111 2222' },
    { name: 'Ελένη Παπαδοπούλου', number: '210 555 6666' },
  ]);
  assert.deepEqual(contactMatches(cards, 'a'), []);
});

test('by number, written any way', () => {
  assert.deepEqual(contactMatches(cards, '6943334444'), [{ name: 'Ada Lovelace', number: '6943334444' }]);
  assert.deepEqual(contactMatches(cards, '+30 694 111 2222'), [{ name: 'Ελένη Παπαδοπούλου', number: '+30 694 111 2222' }]);
  // From three digits, as they are typed.
  assert.deepEqual(contactMatches(cards, '694'), [
    { name: 'Ελένη Παπαδοπούλου', number: '+30 694 111 2222' },
    { name: 'Ada Lovelace', number: '6943334444' },
  ]);
  assert.deepEqual(contactMatches(cards, '694 333'), [{ name: 'Ada Lovelace', number: '6943334444' }]);
  assert.deepEqual(contactMatches(cards, '69'), []);
  // Numbers too short to call are not offered.
  assert.deepEqual(contactMatches(cards, 'Short'), []);
});
