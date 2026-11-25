// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The warnings that this phone's internet address may be seen (lib/ip-warning.ts): each kept by
// its network, what is about to happen and what of, said once in a space, kept as said only once
// gone on from, each space its own; their words name the network and say who sees the address.
// Run with: npm run check
/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { randomBytes } from '../lib/crypto';
import { afterGuide, guideShown } from '../lib/guide-shown';
import { IP_GUIDE, ipGoneOn, ipKey, ipSaid, ipWarningText, IpStop, type IpAct } from '../lib/ip-warning';
import { setCurrentSpace } from '../lock/keys';
import { IP_SEEN_MOST, loadCurrentSpaceData, loadHiddenData, updateCurrentSpaceData } from '../lock/space-data';
import './secure-memory';

test('a warning is kept by its network, what happens and what of; its words name the network, and each act has its own', () => {
  assert.equal(ipKey({ network: ' Erevos ', act: 'call', of: 'abc' }), 'erevos|call|abc');
  assert.equal(ipKey({ network: 'Erevos', act: 'send', of: 'abc' }), 'erevos|send|*', 'what is sent, once for the network');
  assert.notEqual(ipKey({ network: 'Erevos', act: 'send', of: 'abc' }), ipKey({ network: 'Erevos', act: 'call', of: 'abc' }));
  assert.notEqual(ipKey({ network: 'Erevos', act: 'send', of: 'abc' }), ipKey({ network: 'Matrix', act: 'send', of: 'abc' }));
  assert.ok(ipKey({ network: 'Erevos', act: 'send', of: 'x'.repeat(500) }).length <= 200);
  assert.equal(IP_GUIDE, '#ip');
  const acts: IpAct[] = ['send', 'call', 'file', 'link', 'preview', 'join'];
  const messages = acts.map((act) => ipWarningText({ network: 'Matrix', act, of: '' }));
  assert.equal(new Set(messages.map((m) => m.message)).size, acts.length, 'each act says its own');
  for (const { title, message } of messages) {
    assert.ok(title.length > 0);
    assert.match(message, /IP address/);
  }
  assert.match(ipWarningText({ network: 'Matrix', act: 'send', of: '' }).message, /^On Matrix,/);
  assert.match(ipWarningText({ network: 'XMPP', act: 'join', of: '' }).message, /^On XMPP,/);
  // On a network where only one's own server sees it, the words say so, and not the contact's.
  const own = ipWarningText({ network: 'Signal', act: 'send', of: '', own: true }).message;
  assert.match(own, /Your Signal server/);
  assert.doesNotMatch(own, /contact/);
  assert.match(ipWarningText({ network: 'Erevos', act: 'send', of: '' }).message, /your contact's/);
  assert.equal(ipKey({ network: 'Signal', act: 'send', of: 'a', own: true }), ipKey({ network: 'Signal', act: 'send', of: 'a' }));
  // Cancel is no failure: nothing to say of it.
  assert.equal(new IpStop().message, '');
});

test('a warning is said once in a space: kept as said once gone on from, the latest ones kept, each space its own', async () => {
  const one = { network: 'Erevos', act: 'send' as const, of: 'chat-one' };
  const two = { network: 'Erevos', act: 'call' as const, of: 'chat-one' };
  setCurrentSpace(21, randomBytes(32));
  assert.equal(await ipSaid(one), false, 'none said at first');
  assert.equal((await loadCurrentSpaceData()).ipSeen, undefined, 'and none kept');
  await ipGoneOn(one);
  await ipGoneOn(one);
  assert.equal(await ipSaid(one), true);
  assert.equal(await ipSaid(two), false, 'a call is said apart from what is sent');
  assert.equal(await ipSaid({ ...one, of: 'chat-two' }), true, 'what is sent is said once for all chats');
  assert.equal(await ipSaid({ ...one, of: 'group g', keep: 'memory' }), false, 'not for what is kept elsewhere');
  assert.equal(await ipSaid({ ...one, network: 'Matrix' }), false, 'each network its own');
  assert.equal(await ipSaid({ ...two, of: 'chat-two' }), false, 'calls still each their own');
  assert.deepEqual((await loadCurrentSpaceData()).ipSeen, [ipKey(one)], 'kept once');

  // Another space has its own.
  setCurrentSpace(22, randomBytes(32));
  assert.equal(await ipSaid(one), false);

  // The latest IP_SEEN_MOST are kept, and what is stored of the wrong shape is left out.
  setCurrentSpace(21, randomBytes(32));
  await updateCurrentSpaceData({ ipSeen: Array.from({ length: IP_SEEN_MOST }, (_, i) => `erevos|call|${i}`) });
  await ipGoneOn(two);
  const seen = (await loadCurrentSpaceData()).ipSeen!;
  assert.equal(seen.length, IP_SEEN_MOST);
  assert.equal(seen.at(-1), ipKey(two));
  assert.equal(seen.includes('erevos|call|0'), false, 'the oldest went');
  await updateCurrentSpaceData({ ipSeen: ['', 7, 'erevos|link|', 'erevos|link|'] as unknown as string[] });
  assert.deepEqual((await loadCurrentSpaceData()).ipSeen, ['erevos|link|']);
  setCurrentSpace(null);
});

test("a hidden place's warnings are kept in its own data, never the space's; one whose place is not known only in memory", async () => {
  const space = randomBytes(32);
  setCurrentSpace(23, space);
  const place = { space: 23, pocket: 2, key: randomBytes(32) };
  const hidden = { network: 'Erevos', act: 'send' as const, of: 'hidden-contact', keep: place };
  assert.equal(await ipSaid(hidden), false);
  await ipGoneOn(hidden);
  assert.equal(await ipSaid(hidden), true, 'said once in the hidden place');
  assert.deepEqual((await loadHiddenData(23, 2, place.key)).ipSeen, [ipKey(hidden)], 'kept with it');
  assert.equal((await loadCurrentSpaceData()).ipSeen, undefined, "nothing of it in the space's data, which the space's password opens");
  const { keep: _keep, ...inSpace } = hidden;
  assert.equal(await ipSaid(inSpace), false, 'the space has not gone on from it');
  // Another hidden place, or the same with another key, knows nothing of it.
  assert.equal(await ipSaid({ ...hidden, keep: { ...place, pocket: 3 } }), false);
  const memory = { network: 'Erevos', act: 'send' as const, of: 'group somewhere', keep: 'memory' as const };
  assert.equal(await ipSaid(memory), false);
  await ipGoneOn(memory);
  assert.equal(await ipSaid(memory), true);
  assert.equal((await loadCurrentSpaceData()).ipSeen, undefined, 'nor of what is kept in memory');
  setCurrentSpace(null);
});

test('what waits for the guide goes on once it has opened and closed again, or should it never open', async () => {
  let done = false;
  const waited = afterGuide().then(() => {
    done = true;
  });
  const gone = guideShown();
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(done, false, 'not while it shows');
  // One section replaces another: still the guide.
  const next = guideShown();
  gone();
  await new Promise((resolve) => setTimeout(resolve, 600));
  assert.equal(done, false, 'not while another section shows');
  next();
  await waited;
  assert.equal(done, true);
  // A guide that never opened is not waited for long.
  const began = Date.now();
  await afterGuide();
  assert.ok(Date.now() - began < 4500);
});
