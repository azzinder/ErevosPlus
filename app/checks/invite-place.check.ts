// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The phone that sent a contact an invite to its relay by itself learns when theirs came in with
// it: who the relay is asked about, when Take back shows, the lines the chat keeps, and what is kept
// of it (lib/invite-place.ts, lib/call-lines.ts, lock/e2e-data.ts).

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { inviteLine, isInviteCame, shownLine } from '../lib/call-lines';
import { randomBytes } from '../lib/crypto';
import { setLang } from '../lib/i18n';
import { holdsPlace, invitesToSettle } from '../lib/invite-place';
import { inviteId } from '../lib/text-invite';
import { EMPTY_E2E, loadE2EData, saveE2EData, type Contact } from '../lock/e2e-data';
import { files } from './files-memory';

const relay = 'wss://relay.example.org';
const other = 'wss://other.example.org';
const contact = (more: Partial<Contact> = {}): Contact =>
  ({ identity: 'aa'.repeat(32), sender: 'bb'.repeat(24), relay, ri: 1, rid: 'cc'.repeat(16), ...more }) as Contact;

test('the relay is asked about an invite sent by itself once its contact reads there, until said', () => {
  const sent = contact();
  assert.deepEqual(invitesToSettle([sent], relay), [sent]);
  assert.deepEqual(invitesToSettle([sent], 'WSS://relay.example.org/'), [sent], 'the same relay, written otherwise');
  const none: [string, Contact][] = [
    ['sent before the id was kept, or said unused', contact({ rid: undefined })],
    ['said already', contact({ rin: 5 })],
    ['taken back', contact({ rib: 5 })],
    ['no queue of theirs yet', contact({ sender: '' })],
    ['reading on another relay', contact({ relay: other })],
  ];
  for (const [why, c] of none) assert.deepEqual(invitesToSettle([c], relay), [], why);
  assert.deepEqual(invitesToSettle([sent], ' '), [], 'no relay of its own');
});

test('Take back shows while they came in with the invite and are there still', () => {
  assert.equal(holdsPlace(contact({ rin: 5 }), relay), true);
  assert.equal(holdsPlace(contact(), relay), false, 'not said yet');
  assert.equal(holdsPlace(contact({ rin: 5, rib: 6 }), relay), false, 'taken back');
  assert.equal(holdsPlace(contact({ rin: 5, relay: other }), relay), false, 'they read elsewhere now');
  assert.equal(holdsPlace(contact({ rin: 5, sender: '' }), relay), false);
  assert.equal(holdsPlace(contact({ rin: 5, rid: undefined }), relay), false);
  assert.equal(holdsPlace(contact({ rin: 5 }), other), false, 'this phone uses another relay now');
  assert.equal(holdsPlace(undefined, relay), false);
});

test('the lines are kept in English, shown in the language of the app, and Take back goes under the first only', async () => {
  await setLang('en');
  const came = inviteLine('came', 'Maria $& Co');
  assert.equal(came, '🎫 Maria $& Co came onto your server with your invite.', 'the name as it is');
  assert.equal(shownLine(came), came);
  assert.equal(isInviteCame(came), true);
  const back = inviteLine('back', 'Maria');
  assert.equal(back, '🎫 You took back the place Maria had on your server.');
  assert.equal(shownLine(back), back);
  assert.equal(isInviteCame(back), false);
  assert.equal(isInviteCame('Maria came onto your server with your invite.'), false, 'words with no mark');
  assert.equal(isInviteCame('🎫 a ticket'), false);
  assert.equal(shownLine('🎫 a ticket'), '🎫 a ticket', 'anything else after the mark is shown as it is');
  await setLang('el');
  try {
    for (const line of [inviteLine('came', 'Μαρία'), inviteLine('back', 'Μαρία')]) {
      const shown = shownLine(line);
      assert.notEqual(shown, line, 'said in the language of the app');
      assert.ok(shown.startsWith('🎫 ') && shown.includes('Μαρία'), shown);
    }
  } finally {
    await setLang('en');
  }
});

test("what a chat keeps of it: the invite's id and the two times, and nothing of the wrong shape", async () => {
  files.clear();
  const key = randomBytes(32);
  const kept = async (more: Record<string, unknown>) => {
    await saveE2EData('space', 0, key, { ...EMPTY_E2E, contacts: [{ identity: 'aa'.repeat(32), ...more } as never] });
    return (await loadE2EData('space', 0, key)).contacts[0];
  };
  const id = inviteId('dd'.repeat(32));
  assert.match(id, /^[0-9a-f]{32}$/);
  const good = await kept({ ri: 1, rid: id, rin: 2, rib: 3 });
  assert.deepEqual([good.ri, good.rid, good.rin, good.rib], [1, id, 2, 3]);
  const bad = await kept({ ri: 1, rid: 'not an id', rin: -1, rib: 'soon' });
  assert.deepEqual([bad.ri, bad.rid, bad.rin, bad.rib], [1, undefined, undefined, undefined]);
  // Kept before ids: as it was.
  const before = await kept({ ri: 1 });
  assert.deepEqual([before.ri, before.rid, before.rin, before.rib], [1, undefined, undefined, undefined]);
});
