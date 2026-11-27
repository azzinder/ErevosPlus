// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The word of care under a short new password (lib/password-strength.ts).

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isWeakSecret, strengthOf } from '../lib/password-strength';

test('a short password or a PIN is told as short, a phrase is not', () => {
  for (const weak of ['1234', '123456', '12345678', '1234567890123', 'κωδικός', 'hunter2', 'aaaaaaaaaaaaaaaa', 'ababababababab', '٣٤٥٦٧٨٩٠١٢']) {
    assert.equal(isWeakSecret(weak), true, weak);
  }
  for (const fine of ['', 'correct horse battery', 'πράσινο άλογο τρέχει', 'Tr0ub4dor&3x', '12345678901234']) {
    assert.equal(isWeakSecret(fine), false, fine);
  }
});

test("the first start's meter reads a short one as weak, a phrase of four words or a long mixed one as strong", () => {
  assert.equal(strengthOf(''), null);
  assert.equal(strengthOf('   '), null);
  for (const weak of ['1234', 'hunter2', 'κωδικός', 'aaaaaaaaaaaaaaaa']) assert.equal(strengthOf(weak), 'weak', weak);
  for (const fair of ['correct horse battery', 'Tr0ub4dor&3x', '12345678901234']) assert.equal(strengthOf(fair), 'fair', fair);
  for (const strong of ['φεγγάρι-σκάλα-πορτοκάλι-7 τρένο', 'correct horse battery staple', 'φεγγάρι σκάλα πορτοκάλι θάλασσα', 'Tr0ub4dor&3x-Kq9!']) {
    assert.equal(strengthOf(strong), 'strong', strong);
  }
  // The design's own example, three words and a digit, reads strong: long, of three kinds.
  assert.equal(strengthOf('φεγγάρι-σκάλα-πορτοκάλι-7'), 'strong');
});
