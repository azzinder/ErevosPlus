// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The ErevosGram app's keys carried into Erevos (lib/telegram-import.ts): opened with the code,
// against a line written by Java's own PBKDF2 and AES-GCM as the ErevosGram app writes it.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { exportCode, ExportError, openExport, writeExport } from '../lib/telegram-import';

// javax.crypto: PBKDF2WithHmacSHA256 (200000 rounds) and AES/GCM/NoPadding, salt 0…15, nonce 100…111.
const JAVA =
  'EGX1:AAECAwQFBgcICQoLDA0OD2RlZmdoaWprbG1ub_AS5Ey4EyD2gEMt53TLRnJhzOcsIsvfVZJOC4MesvvcHNQ7_MrExdNw-yfvSCI8LXFBAHupSj0WYRTaFcMI2eVA2aIdrvfWf0HZ5ZYQbX7wQX2JhhnsgFzrrwxGDviLb-jhzVvCR4_CRO39yN5X8xP0dh25TvPnwt6rdilw8hzE9EtXxUUVl_OZGXeeNMrnFXKF66Uafwygtow2hfFn83OqyxKqhe3Zo7_IrDDYI1zhIWg1C6c22pAI2v9Ygu2xz_CE2ImslTN4s-SUeC9rGALRq4rXXXBSxrQz0V-XLBzpesx6BQrUse1vjbdr6Z49YsJBBo_qofQp4SDJhxcsr_VPlqLy0Xe-w3HxHiS4fh6D4DohrA';
const CODE = '7K3QD-M9X2P-4TBWZ-H1R8C';

const why = (what: string) => (error: unknown) => error instanceof ExportError && error.why === what;

test('the code is read as typed: no dashes or spaces, small letters, O for 0, I and L for 1', () => {
  assert.equal(exportCode(CODE), '7K3QDM9X2P4TBWZH1R8C');
  assert.equal(exportCode(' 7k3qd m9x2p 4tbwz hlr8c '), '7K3QDM9X2P4TBWZH1R8C');
  assert.equal(exportCode('7K3QD-M9X2P-4TBWZ-H1R8'), '');
  assert.equal(exportCode('7K3QD-M9X2P-4TBWZ-H1R8U'), '');
});

test("what the ErevosGram app writes opens with its code, and only what the encryption knows comes in", async () => {
  const data = await openExport(`${JAVA}\n`, CODE.toLowerCase());
  assert.equal(data.account, 'QUNDT1VOVA');
  assert.deepEqual(data.seen, ['ab', 'cd']);
  assert.deepEqual(data.chats['700'], { state: 'ACTIVE', conv: 'Q09OVg', peer: 'UEVFUg', mine: true, verified: false, changed: false, invites: [3, 4], msgs: { aa: { t: 'text', s: 'γεια' } } });
  assert.deepEqual(data.chats['-100'], { state: 'INVITED', invites: [9] });
  await assert.rejects(openExport(JAVA, '7K3QD-M9X2P-4TBWZ-H1R8D'), why('wrong-code'));
  await assert.rejects(openExport(JAVA, '7K3QD'), why('code'));
  await assert.rejects(openExport('EGI1:abc', CODE), why('not-export'));
  // Changed on the way: refused.
  const changed = JAVA.slice(0, 60) + (JAVA[60] === 'A' ? 'B' : 'A') + JAVA.slice(61);
  await assert.rejects(openExport(changed, CODE), why('wrong-code'));
});

test('written here, opened here; each time a new code', async () => {
  const data = { account: 'QUNDT1VOVA', seen: ['x'], chats: { '5': { state: 'ACTIVE' as const, conv: 'Yw' } } };
  const a = await writeExport(data);
  const b = await writeExport(data);
  assert.match(a.code, /^[0-9A-Z]{5}(-[0-9A-Z]{5}){3}$/);
  assert.notEqual(a.code, b.code);
  assert.deepEqual(await openExport(a.text, a.code), data);
  await assert.rejects(openExport(a.text, b.code), why('wrong-code'));
});
