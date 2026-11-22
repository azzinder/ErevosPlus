// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// End-to-end encryption in the app (lib/e2e.ts) with the real Rust core, built to WebAssembly by
// checks/build-core.mjs. Skipped, with a note, when that build is missing.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { contactLink, parseContact } from '../lib/contact-code';
import { accountBundle, accountIdentity, accountSign, bundleVerify, canPq, canSign, newAccount, pqOn, setCore, type Core } from '../lib/core';
import { fromBase64, randomBytes, setHardCost, toHex, utf8Encode } from '../lib/crypto';
import { qrRows } from '../lib/qr';
import { BlockedContactError, E2E, NoKeyError, ONLINE, OPEN_EVERY, OPEN_RECENT, ONLINE_AFTER_WRITE, OwnCodeError, PREKEYS_EVERY, staleFirst, toBase64Url, type Received } from '../lib/e2e';
import { onShownEnded, placeSeenKey, placeShown, shownAt, spaceSeenKey, spaceShown } from '../lib/last-seen';
import { giveLinkedName } from '../lib/linked-name';
import { tookOf } from '../lib/queue-move';
import { PART_SIZE, VoiceAssembler } from '../lib/voice';
import { checkedAvatar, FILE, loadE2EData, MAX_NAME, saveE2EData } from '../lock/e2e-data';
import { lastRestore, markRestore } from '../lock/restored';
import { DEFAULT_LOOK } from '../theme/look';
import { loadPhoto, savePhoto } from '../lock/avatar-photos';
import { History, newTag } from '../lock/history';
import { makeChatPin, opensChat } from '../lock/chat-pin';
import { ALWAYS } from '../lock/chat-notify';
import { moveChat } from '../lock/move-chat';
import { Archive, type ArchivedChat } from '../lock/archive';
import { hiddenHolder } from '../lock/sealed-file';
import { files } from './files-memory';
import { store } from './secure-memory';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const ready = existsSync(built);
if (ready) {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  // The WebAssembly calls return at once. The Android module's return promises.
  setCore(
    Object.fromEntries(
      Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)]),
    ) as unknown as Core,
  );
} else {
  console.log('Skipping the end-to-end checks: build the core first with node checks/build-core.mjs');
}

const t = (name: string, fn: () => Promise<void>) =>
  test(name, { skip: !ready }, async () => {
    files.clear();
    await fn();
  });

const sender = () => Array.from(randomBytes(24), (b) => b.toString(16).padStart(2, '0')).join('');

/** A chat with its relay sender id, and the code it shows. */
async function chat(holder: 'space' | 'hidden', space: number, key = randomBytes(32)) {
  const e2e = await E2E.open(holder, space, key);
  const from = sender();
  const code = { senderHex: from, key: toBase64Url(e2e.bundle) };
  return { e2e, from, code, key };
}

t('an account signs what its bundle checks, and nothing else passes for it', async () => {
  assert.equal(canSign(), true);
  const account = await newAccount();
  const bundle = await accountBundle(account);
  const list = utf8Encode('{"t":"erevos devices"}');
  const signature = await accountSign(account, 'devices', list);
  assert.deepEqual(await bundleVerify(bundle, 'devices', list, signature), await accountIdentity(account));
  assert.equal(await bundleVerify(bundle, 'devices', utf8Encode('{}'), signature), null);
  assert.equal(await bundleVerify(bundle, 'other', list, signature), null);
  assert.equal(await bundleVerify(await accountBundle(await newAccount()), 'devices', list, signature), null);
  assert.equal(await bundleVerify(bundle, 'devices', list, signature.slice(1)), null);
});

const message = (r: Received) => {
  assert.equal(r.kind, 'message');
  return r as Extract<Received, { kind: 'message' }>;
};

t('two chats add each other through a link and talk both ways', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('hidden', 0);
  const link = contactLink({ senderHex: bob.from, relayUrl: 'ws://relay:7879', key: bob.code.key });
  const code = parseContact(link)!;
  assert.equal(code.key, bob.code.key);
  // A link of this version says it takes a conversation one of the adder's devices starts (S5); one from before says nothing.
  assert.equal(code.d, true);
  assert.equal(parseContact(link.replace('&d=1', ''))!.d, undefined);

  const added = await alice.e2e.addContact(code, alice.from);
  assert.equal(added.added, true);
  const [pending] = alice.e2e.pending();
  assert.equal(pending.sender, bob.from);

  // Bob opens the first packet and learns who Alice is and where to answer.
  const hello = message(await bob.e2e.receive(pending.first));
  assert.equal(hello.added, true);
  assert.equal(hello.text, '');
  assert.deepEqual(bob.e2e.contacts(), [{ identity: hello.identity, sender: alice.from, name: '', ownName: '', said: '', timer: 0, shots: false, request: true, look: null, avatar: null, hide: false, locked: false }]);
  await alice.e2e.firstSent(added.identity);
  assert.deepEqual(alice.e2e.pending(), []);

  const toAlice = await bob.e2e.seal(hello.identity, 'γεια σου', bob.from);
  assert.equal(toAlice.sender, alice.from);
  assert.equal(toAlice.first, null);
  assert.equal(message(await alice.e2e.receive(toAlice.packet)).text, 'γεια σου');

  const toBob = await alice.e2e.seal(added.identity, 'hi', alice.from);
  const got = message(await bob.e2e.receive(toBob.packet));
  assert.deepEqual([got.text, got.identity], ['hi', hello.identity]);

  // Both see the same safety number.
  assert.equal(await alice.e2e.safetyNumber(added.identity), await bob.e2e.safetyNumber(hello.identity));
  assert.match(await alice.e2e.safetyNumber(added.identity), /^(\d{5} ){11}\d{5}$/);
});

t('two chats whose Erevos read post-quantum messages seal theirs with the post-quantum ratchet', async () => {
  assert.equal(canPq(), true);
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const added = await alice.e2e.addContact(parseContact(contactLink({ senderHex: bob.from, relayUrl: 'ws://relay:7879', key: bob.code.key }))!, alice.from);
  const [pending] = alice.e2e.pending();
  const hello = message(await bob.e2e.receive(pending.first));
  await alice.e2e.firstSent(added.identity);
  // Alice's first message said her Erevos reads them: Bob's answer is one, and turns hers on.
  const pq = async (who: typeof alice) => {
    const contact = (await loadE2EData('space', who === alice ? 0 : 1, who.key)).contacts[0];
    return pqOn(fromBase64(contact.conversations[0]));
  };
  assert.equal(await pq(alice), false);
  assert.equal(await pq(bob), true);
  const answer = await bob.e2e.seal(hello.identity, 'γεια', bob.from);
  assert.equal(message(await alice.e2e.receive(answer.packet)).text, 'γεια');
  assert.equal(await pq(alice), true);
  for (let i = 0; i < 25; i++) {
    const toBob = await alice.e2e.seal(added.identity, `a${i}`, alice.from);
    assert.equal(message(await bob.e2e.receive(toBob.packet)).text, `a${i}`);
    const toAlice = await bob.e2e.seal(hello.identity, `b${i}`, bob.from);
    assert.equal(message(await alice.e2e.receive(toAlice.packet)).text, `b${i}`);
  }
});

t('someone who says back an invite given here is a contact at once, named as invited, and the invite is used then', async () => {
  const inviter = await chat('space', 0);
  const maria = await chat('space', 1);
  const stranger = await chat('space', 2);
  const hi = await inviter.e2e.welcome('Maria', '  Nikos ');
  assert.match(hi, /^[0-9a-f]{32}$/);
  assert.equal(inviter.e2e.invitedAs(), 'Nikos');
  // An invite of someone else's, or none, says nothing: a message request, as from any link.
  await stranger.e2e.addContact(inviter.code, stranger.from, undefined, 'f'.repeat(32));
  const fromStranger = message(await inviter.e2e.receive(stranger.e2e.pending()[0].first));
  assert.equal(fromStranger.request, true);
  // Maria's first message says it back.
  const { identity: inviterId } = await maria.e2e.addContact(inviter.code, maria.from, undefined, hi);
  const hello = message(await inviter.e2e.receive(maria.e2e.pending()[0].first));
  assert.equal(hello.added, true);
  assert.equal(hello.request, false);
  const kept = inviter.e2e.contacts().find((c) => c.identity === hello.identity)!;
  assert.deepEqual([kept.name, kept.request, kept.sender], ['Maria', false, maria.from]);
  // They talk at once, both ways.
  const toMaria = await inviter.e2e.seal(hello.identity, 'καλώς ήρθες', inviter.from);
  assert.equal(message(await maria.e2e.receive(toMaria.packet)).text, 'καλώς ήρθες');
  assert.equal(message(await inviter.e2e.receive((await maria.e2e.seal(inviterId, 'ευχαριστώ', maria.from)).packet)).text, 'ευχαριστώ');
  // Used: someone else saying it back is a request again.
  const carol = await chat('space', 3);
  await carol.e2e.addContact(inviter.code, carol.from, undefined, hi);
  assert.equal(message(await inviter.e2e.receive(carol.e2e.pending()[0].first)).request, true);
  // Kept sealed: opened again, the invites left are as they were, and so is the name given.
  const again = await E2E.open('space', 0, inviter.key);
  assert.equal(again.invitedAs(), 'Nikos');
  const later = await again.welcome('Eleni');
  const dora = await chat('space', 4);
  await dora.e2e.addContact(inviter.code, dora.from, undefined, later);
  const fromDora = message(await again.receive(dora.e2e.pending()[0].first));
  assert.deepEqual([fromDora.request, again.contacts().find((c) => c.identity === fromDora.identity)!.name], [false, 'Eleni']);
});

t('an invite to the relay gives it random letters and digits for a name, and the name given stays here, sealed', async () => {
  const inviter = await chat('space', 0);
  const line = await inviter.e2e.lineFor('  Μαρία ');
  assert.match(line, /^[a-z0-9]{10}$/);
  // Each invite a name of its own, whoever it is for.
  const other = await inviter.e2e.lineFor('Μαρία');
  assert.notEqual(other, line);
  assert.deepEqual([inviter.e2e.lineName(line), inviter.e2e.lineName(other)], ['Μαρία', 'Μαρία']);
  // A line not named here, such as one from before, is not known.
  assert.equal(inviter.e2e.lineName('maria'), '');
  const again = await E2E.open('space', 0, inviter.key);
  assert.equal(again.lineName(line), 'Μαρία');
  // The last MAX_LINES are kept: the oldest goes first.
  for (let i = 0; i < 99; i++) await again.lineFor(`n${i}`);
  assert.equal(again.lineName(line), '');
  assert.equal(again.lineName(other), 'Μαρία');
});

t('someone new who writes first is a message request until accepted, refused or answered', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const carol = await chat('space', 2);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  assert.equal(alice.e2e.contacts()[0].request, false);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  assert.equal(hello.request, true);
  // Receipts alone do not accept.
  await bob.e2e.seal(hello.identity, '', bob.from, { got: [] });
  assert.equal(bob.e2e.contacts()[0].request, true);
  const later = message(await bob.e2e.receive((await alice.e2e.seal(bobId, 'hi', alice.from)).packet));
  assert.equal(later.request, true);
  // Answering accepts.
  await bob.e2e.seal(hello.identity, 'hello', bob.from);
  assert.equal(bob.e2e.contacts()[0].request, false);

  // Carol writes to Bob too; Bob accepts with a tap, then another request is refused.
  await carol.e2e.addContact(bob.code, carol.from);
  const fromCarol = message(await bob.e2e.receive(carol.e2e.pending()[0].first));
  assert.equal(fromCarol.request, true);
  await bob.e2e.acceptRequest(fromCarol.identity);
  assert.equal(bob.e2e.contacts().find((c) => c.identity === fromCarol.identity)!.request, false);
  await bob.e2e.removeContact(fromCarol.identity);
  assert.equal(bob.e2e.contacts().length, 1);
  const { identity: toBob } = carol.e2e.contacts()[0];
  assert.deepEqual(await bob.e2e.receive((await carol.e2e.seal(toBob, 'still there?', carol.from)).packet), {
    kind: 'refused',
    reason: 'unknown',
  });
});

t('the account makes newer prekeys every month and keeps the last three', async () => {
  const alice = await chat('space', 0);
  const made = (await loadE2EData('space', 0, alice.key)).prekeys!;
  assert.equal(made.length, 1);
  // Opened again within the month: the same.
  await E2E.open('space', 0, alice.key);
  assert.deepEqual((await loadE2EData('space', 0, alice.key)).prekeys, made);
  // A month on, each time: newer ones in front, at most three kept.
  for (let i = 0; i < 4; i++) {
    const kept = await loadE2EData('space', 0, alice.key);
    await saveE2EData('space', 0, alice.key, { ...kept, prekeys: kept.prekeys!.map((p) => ({ ...p, at: p.at - PREKEYS_EVERY })) });
    await E2E.open('space', 0, alice.key);
  }
  const now = (await loadE2EData('space', 0, alice.key)).prekeys!;
  assert.equal(now.length, 3);
  assert.ok(now[0].at > now[1].at && now[1].at > now[2].at);
  assert.ok(!now.some((p) => p.secret === made[0].secret));
});

t('a contact given newer prekeys starts a new conversation with them, and both move to it', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(bobId);
  const aliceId = hello.identity;
  // A request is given nothing, and neither is a contact of a first packet still waiting.
  assert.deepEqual(bob.e2e.keysDue(), []);
  await bob.e2e.acceptRequest(aliceId);
  assert.deepEqual(bob.e2e.keysDue(), [aliceId]);

  // Bob's prekeys, in a message of their own with nothing to show.
  const keys = await bob.e2e.seal(aliceId, '', bob.from, { keys: true });
  await bob.e2e.keysGiven(aliceId);
  assert.deepEqual(bob.e2e.keysDue(), []);
  const given = message(await alice.e2e.receive(keys.packet));
  assert.deepEqual([given.text, given.tag, given.got], ['', '', []]);
  // Alice started a new conversation with them; its first packet goes through the relay on its own.
  const [renew] = alice.e2e.pending();
  assert.equal(renew.identity, bobId);
  // Meanwhile she goes on in the conversation they have, and nothing waits for the new one.
  const before = await alice.e2e.seal(bobId, 'still the old one', alice.from);
  assert.equal(before.first, null);
  assert.equal(message(await bob.e2e.receive(before.packet)).text, 'still the old one');
  // Given again, the same prekeys start nothing more.
  const again = await bob.e2e.seal(aliceId, '', bob.from, { keys: true });
  await alice.e2e.receive(again.packet);
  assert.equal(alice.e2e.pending().length, 1);

  // The relay takes it; Bob opens it with his newer prekeys, then writes in it, and Alice moves to it.
  await alice.e2e.firstSent(bobId);
  assert.deepEqual(alice.e2e.pending(), []);
  const started = message(await bob.e2e.receive(renew.first));
  assert.deepEqual([started.identity, started.text, started.added, started.request], [aliceId, '', false, false]);
  const answer = await bob.e2e.seal(aliceId, 'in the new one', bob.from);
  assert.equal(message(await alice.e2e.receive(answer.packet)).text, 'in the new one');
  const back = await alice.e2e.seal(bobId, 'here too', alice.from);
  assert.equal(message(await bob.e2e.receive(back.packet)).text, 'here too');
  const kept = await loadE2EData('space', 0, alice.key);
  assert.equal(kept.contacts[0].conversations.length, 2);
  // The safety number stays the same.
  assert.equal(await alice.e2e.safetyNumber(bobId), await bob.e2e.safetyNumber(aliceId));
});

t('a chat keeps its own PIN and notifications when its contact starts a new conversation', async () => {
  setHardCost({ m: 64, t: 1 });
  try {
    const alice = await chat('space', 0);
    const bob = await chat('space', 1);
    const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
    const aliceId = message(await bob.e2e.receive(alice.e2e.pending()[0].first)).identity;
    await alice.e2e.firstSent(bobId);
    await bob.e2e.acceptRequest(aliceId);
    // Bob locks the chat with a PIN and mutes it for good, its calls without a ringtone.
    await bob.e2e.setPin(aliceId, await makeChatPin('2468'));
    await bob.e2e.setNotify(aliceId, { until: ALWAYS, ring: '' });
    // Given Bob's newer prekeys, Alice starts a new conversation, and Bob opens it.
    await alice.e2e.receive((await bob.e2e.seal(aliceId, '', bob.from, { keys: true })).packet);
    await bob.e2e.keysGiven(aliceId);
    const [renew] = alice.e2e.pending();
    await alice.e2e.firstSent(bobId);
    assert.equal(message(await bob.e2e.receive(renew.first)).identity, aliceId);
    for (const e2e of [bob.e2e, await E2E.open('space', 1, bob.key)]) {
      assert.equal(e2e.contacts()[0].locked, true);
      assert.equal(await opensChat('2468', e2e.pinOf(aliceId)!), true);
      assert.deepEqual(e2e.notifyOf(aliceId), { until: ALWAYS, ring: '' });
    }
  } finally {
    setHardCost(null);
  }
});

t('a first packet started with prekeys no longer kept does not open, and the link\'s always do', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const aliceId = message(await bob.e2e.receive(alice.e2e.pending()[0].first)).identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);
  await alice.e2e.receive((await bob.e2e.seal(aliceId, '', bob.from, { keys: true })).packet);
  const [renew] = alice.e2e.pending();
  // Bob's phone has thrown those prekeys away (newer ones made since).
  const kept = await loadE2EData('space', 1, bob.key);
  await saveE2EData('space', 1, bob.key, { ...kept, prekeys: [] });
  const later = await E2E.open('space', 1, bob.key);
  assert.deepEqual(await later.receive(renew.first), { kind: 'refused', reason: 'unknown' });
  // Alice, unanswered there, still writes in the old conversation, which Bob opens.
  assert.equal(message(await later.receive((await alice.e2e.seal(bobId, 'fine', alice.from)).packet)).text, 'fine');
  // Someone new with the link still starts a conversation.
  const carol = await chat('space', 2);
  await carol.e2e.addContact(bob.code, carol.from);
  assert.equal(message(await later.receive(carol.e2e.pending()[0].first)).added, true);
});

t('prekeys that are not the contact\'s own start nothing', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const mallory = await chat('space', 2);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const aliceId = message(await bob.e2e.receive(alice.e2e.pending()[0].first)).identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);
  // Bob passes on someone else's prekeys as his own: Alice's Erevos starts nothing with them.
  const stored = await loadE2EData('space', 2, mallory.key);
  await saveE2EData('space', 1, bob.key, { ...(await loadE2EData('space', 1, bob.key)), prekeys: stored.prekeys });
  const lying = await E2E.open('space', 1, bob.key);
  await alice.e2e.receive((await lying.seal(aliceId, '', bob.from, { keys: true })).packet);
  assert.deepEqual(alice.e2e.pending(), []);
});

t('a first packet the relay did not take goes again before the next message', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  // The relay was down: the first packet was never sent.
  const sealed = await alice.e2e.seal(identity, 'are you there', alice.from);
  assert.ok(sealed.first);
  assert.equal(message(await bob.e2e.receive(sealed.first)).text, '');
  assert.equal(message(await bob.e2e.receive(sealed.packet)).text, 'are you there');
  // Sent twice (it may have reached the relay the first time): the second is a replay.
  assert.deepEqual(await bob.e2e.receive(sealed.first), { kind: 'refused', reason: 'replay' });
});

t('an old first packet sent again is refused even once the space has seen many others since', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const first = alice.e2e.pending()[0].first;
  const hello = message(await bob.e2e.receive(first));
  await alice.e2e.firstSent(identity);
  // Bob answers, so Alice's chat goes on in that conversation.
  message(await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'hi', bob.from)).packet));
  // A hundred new contacts later the space's own list has forgotten it.
  const kept = await loadE2EData('space', 1, bob.key);
  await saveE2EData('space', 1, bob.key, { ...kept, seen: [] });
  const later = await E2E.open('space', 1, bob.key);
  assert.deepEqual(await later.receive(first), { kind: 'refused', reason: 'replay' });
  // Bob's next message still goes in the live conversation, which Alice reads.
  const after = await later.seal(hello.identity, 'still here', bob.from);
  assert.equal(message(await alice.e2e.receive(after.packet)).text, 'still here');
});

t('an old first packet whose id is no longer kept never becomes the conversation the chat sends in', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const first = alice.e2e.pending()[0].first;
  const hello = message(await bob.e2e.receive(first));
  await alice.e2e.firstSent(identity);
  message(await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'hi', bob.from)).packet));
  // As many first packets came since as either list keeps: both have forgotten it.
  const kept = await loadE2EData('space', 1, bob.key);
  const before = kept.contacts.find((c) => c.identity === hello.identity)!;
  assert.ok(before.firstAt && before.firstAt > 0);
  await saveE2EData('space', 1, bob.key, { ...kept, seen: [], contacts: kept.contacts.map((c) => ({ ...c, seen: [] })) });
  const later = await E2E.open('space', 1, bob.key);
  // Taken again, it shows nothing new, and the conversation sent in stays the live one.
  message(await later.receive(first));
  const after = (await loadE2EData('space', 1, bob.key)).contacts.find((c) => c.identity === hello.identity)!;
  assert.equal(after.conversations[0], before.conversations[0]);
  assert.equal(after.conversations.length, 2);
  assert.equal(after.firstAt, before.firstAt);
  assert.equal(message(await alice.e2e.receive((await later.seal(hello.identity, 'still here', bob.from)).packet)).text, 'still here');
});

t('replay lists keep many first packets: 1000 in all, 64 for each contact', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  await alice.e2e.addContact(bob.code, alice.from);
  const first = alice.e2e.pending()[0].first;
  message(await bob.e2e.receive(first));
  const id = (n: number) => n.toString(16).padStart(32, '0');
  const kept = await loadE2EData('space', 1, bob.key);
  const own = kept.seen.at(-1)!;
  // Many others since: the lists still hold it, and keep 1000 and 64 at most.
  await saveE2EData('space', 1, bob.key, {
    ...kept,
    seen: [own, ...Array.from({ length: 998 }, (_, n) => id(n))],
    contacts: kept.contacts.map((c) => ({ ...c, seen: [own, ...Array.from({ length: 63 }, (_, n) => id(n))] })),
  });
  const reloaded = await loadE2EData('space', 1, bob.key);
  assert.equal(reloaded.seen.length, 999);
  assert.equal(reloaded.contacts[0].seen.length, 64);
  const later = await E2E.open('space', 1, bob.key);
  assert.deepEqual(await later.receive(first), { kind: 'refused', reason: 'replay' });
  // One more first packet from someone new: the space's list keeps the latest 1000.
  const carol = await chat('space', 2);
  await carol.e2e.addContact(bob.code, carol.from);
  message(await later.receive(carol.e2e.pending()[0].first));
  assert.equal((await loadE2EData('space', 1, bob.key)).seen.length, 1000);
});

t('once each has said its key, packets come sealed for the relay, and a few that come unsealed are still read', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const carol = await chat('space', 2);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  await carol.e2e.addContact(alice.code, carol.from);
  message(await alice.e2e.receive(carol.e2e.pending()[0].first));
  const first = alice.e2e.pending()[0].first;
  // A first packet is never sealed: it says the key Bob seals to Alice with.
  assert.deepEqual([...first.slice(0, 2)], [1, 1]);
  const hello = message(await bob.e2e.receive(first));
  await alice.e2e.firstSent(bobId);
  const reply = (await bob.e2e.seal(hello.identity, 'hi', bob.from)).packet;
  assert.deepEqual([...reply.slice(0, 2)], [1, 4]);
  assert.equal(message(await alice.e2e.receive(reply)).text, 'hi');
  // Alice learned Bob's key from that: hers to him are sealed too.
  const back = (await alice.e2e.seal(bobId, 'hello', alice.from)).packet;
  assert.deepEqual([...back.slice(0, 2)], [1, 4]);
  assert.equal(message(await bob.e2e.receive(back)).text, 'hello');
  // Carol's chat with Alice is not Bob's: his sealed packet does not open there.
  assert.deepEqual(await carol.e2e.receive(reply), { kind: 'refused', reason: 'unknown' });
  assert.equal((await loadE2EData('space', 0, alice.key)).contacts.find((c) => c.identity === bobId)!.sealsIn, true);

  // Bob back from a backup made before he had Alice's key: his packets come unsealed again.
  const kept = await loadE2EData('space', 1, bob.key);
  await saveE2EData('space', 1, bob.key, { ...kept, contacts: kept.contacts.map((c) => ({ ...c, sealTo: '' })) });
  const restored = await E2E.open('space', 1, bob.key);
  const unsealed = (await restored.seal(hello.identity, 'back', bob.from)).packet;
  // A conversation's own packet, post-quantum as both their Erevos read it (docs/spqr.md).
  assert.deepEqual([...unsealed.slice(0, 2)], [1, 3]);
  // Packets sent only to tire Alice's phone use up the few tries an hour, and then even Bob's waits.
  const junk = () => Uint8Array.of(1, 3, ...randomBytes(300));
  for (let i = 0; i < 5; i++) assert.deepEqual(await alice.e2e.receive(junk()), { kind: 'refused', reason: 'unknown' });
  assert.deepEqual(await alice.e2e.receive(unsealed), { kind: 'refused', reason: 'unknown' });
  // Later (here, a new start) it is read, and Alice says her key again, so Bob seals once more.
  const later = await E2E.open('space', 0, alice.key);
  assert.equal(message(await later.receive(unsealed)).text, 'back');
  const again = (await later.seal(bobId, 'welcome back', alice.from)).packet;
  assert.equal(message(await restored.receive(again)).text, 'welcome back');
  assert.deepEqual([...(await restored.seal(hello.identity, 'sealed', bob.from)).packet.slice(0, 2)], [1, 4]);
});

t('both start a conversation at once and still read each other', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const a = await alice.e2e.addContact(bob.code, alice.from);
  const b = await bob.e2e.addContact(alice.code, bob.from);
  message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  message(await alice.e2e.receive(bob.e2e.pending()[0].first));
  for (let round = 0; round < 3; round++) {
    const one = await alice.e2e.seal(a.identity, `a${round}`, alice.from);
    const two = await bob.e2e.seal(b.identity, `b${round}`, bob.from);
    assert.equal(message(await bob.e2e.receive(one.packet)).text, `a${round}`);
    assert.equal(message(await alice.e2e.receive(two.packet)).text, `b${round}`);
  }
  assert.equal(alice.e2e.contacts().length, 1);
});

t('keeps the conversations between launches, sealed', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  const answer = await bob.e2e.seal(hello.identity, 'kept?', bob.from);

  const again = await E2E.open('space', 0, key);
  assert.deepEqual(again.identity, alice.e2e.identity);
  assert.equal(message(await again.receive(answer.packet)).text, 'kept?');
  assert.equal(again.contacts()[0].identity, identity);

  const raw = files.get(FILE)!;
  assert.ok(!raw.includes(identity) && !raw.includes(bob.from));
  // Another key opens nothing, and gets a new account.
  assert.equal((await loadE2EData('space', 0, randomBytes(32))).account, '');
  const other = await E2E.open('space', 0, randomBytes(32));
  assert.notDeepEqual(other.identity, alice.e2e.identity);
});

t('a chat put back from a backup never seals with a message key it used after that backup', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(hello.identity);
  const [aliceId] = alice.e2e.contacts().map((c) => c.identity);
  const backup = await loadE2EData('space', 0, key);
  // After the backup, Alice goes on writing, and Bob reads it.
  const header = (packet: Uint8Array) => toHex(packet.slice(2, 42));
  const after: string[] = [];
  for (const text of ['one', 'two', 'three']) {
    const sent = await alice.e2e.seal(aliceId, text, alice.from);
    assert.equal(message(await bob.e2e.receive(sent.packet)).text, text);
    after.push(header(sent.packet));
  }
  // Put back as it was, the conversation would seal under the first of those keys again.
  await saveE2EData('space', 0, key, backup);
  const unmarked = await E2E.open('space', 0, key);
  assert.equal(header((await unmarked.seal(aliceId, 'x', alice.from)).packet), after[0]);
  // Restoring a backup marks the phone, and the chat moves past those keys when it opens.
  await saveE2EData('space', 0, key, backup);
  await markRestore();
  const restored = await E2E.open('space', 0, key);
  const sent = await restored.seal(aliceId, 'after the restore', alice.from);
  assert.ok(!after.includes(header(sent.packet)));
  assert.equal(message(await bob.e2e.receive(sent.packet)).text, 'after the restore');
  const reply = await bob.e2e.seal(hello.identity, 'got it', bob.from);
  assert.equal(message(await restored.receive(reply.packet)).text, 'got it');
  // Once moved, opening it again moves nothing more.
  const kept = await loadE2EData('space', 0, key);
  assert.equal(kept.restore, await lastRestore());
  const again = await E2E.open('space', 0, key);
  assert.deepEqual(await loadE2EData('space', 0, key), kept);
  assert.ok(again);
  store.delete('erevos.restored');
});

// Alice and Bob, who gave her his newer prekeys and took the conversation she started with them.
async function withPrekeys(aliceKey: Uint8Array) {
  const alice = await chat('space', 0, aliceKey);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const aliceId = message(await bob.e2e.receive(alice.e2e.pending()[0].first)).identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);
  await alice.e2e.receive((await bob.e2e.seal(aliceId, '', bob.from, { keys: true })).packet);
  await bob.e2e.keysGiven(aliceId);
  const [renew] = alice.e2e.pending();
  await alice.e2e.firstSent(bobId);
  await bob.e2e.receive(renew.first);
  return { alice, bob, aliceId, bobId };
}

// Alice and Bob talk both ways after a backup, so their conversation moves on with keys the backup
// does not hold: then neither opens what the other sends in the one put back.
async function talkOn(alice: E2E, aliceFrom: string, bobId: string, bob: E2E, bobFrom: string, aliceId: string) {
  for (const text of ['one', 'two']) {
    assert.equal(message(await bob.receive((await alice.seal(bobId, `${text} from Alice`, aliceFrom)).packet)).text, `${text} from Alice`);
    assert.equal(message(await alice.receive((await bob.seal(aliceId, `${text} from Bob`, bobFrom)).packet)).text, `${text} from Bob`);
  }
}

t('a chat put back from a backup starts a new conversation with each contact, which both then talk in', async () => {
  const key = randomBytes(32);
  const { alice, bob, aliceId, bobId } = await withPrekeys(key);
  const backup = await loadE2EData('space', 0, key);
  assert.ok(backup.contacts[0].bundle && backup.contacts[0].bundleAt);
  await talkOn(alice.e2e, alice.from, bobId, bob.e2e, bob.from, aliceId);
  const lost = await bob.e2e.seal(aliceId, 'sent before the new one', bob.from);

  await saveE2EData('space', 0, key, backup);
  await markRestore();
  const restored = await E2E.open('space', 0, key);
  // What Bob sends in the conversation that moved on opens in none put back.
  assert.equal((await restored.receive(lost.packet)).kind, 'refused');
  // A first packet waits for the relay, of a conversation started with Bob's newer prekeys, and
  // what Alice writes goes in it, after it.
  const [pending] = restored.pending();
  assert.equal(pending.identity, bobId);
  const sent = await restored.seal(bobId, 'after the restore', alice.from);
  assert.deepEqual(sent.first, pending.first);
  // Bob's Erevos takes it quietly, as the one it sends in from then on.
  const started = message(await bob.e2e.receive(sent.first!));
  assert.deepEqual([started.identity, started.text, started.tag, started.added, started.request], [aliceId, '', '', false, false]);
  await restored.firstSent(bobId);
  assert.deepEqual(restored.pending(), []);
  assert.equal(message(await bob.e2e.receive(sent.packet)).text, 'after the restore');
  const reply = await bob.e2e.seal(aliceId, 'welcome back', bob.from);
  assert.equal(message(await restored.receive(reply.packet)).text, 'welcome back');
  assert.equal(message(await bob.e2e.receive((await restored.seal(bobId, 'thanks', alice.from)).packet)).text, 'thanks');
  // Opened again, it starts nothing more.
  const kept = await loadE2EData('space', 0, key);
  await E2E.open('space', 0, key);
  assert.deepEqual(await loadE2EData('space', 0, key), kept);
  store.delete('erevos.restored');
});

test('a first packet is old unless it says a later start than the newest taken, whatever the clock', () => {
  const at = 1_700_000_000_000;
  // The same time, an earlier one, or none (an Erevos before `fa`, or one stripped of it): old.
  assert.equal(staleFirst({ fa: at }, { firstAt: at }), true);
  assert.equal(staleFirst({ fa: at - 1 }, { firstAt: at }), true);
  assert.equal(staleFirst({}, { firstAt: at }), true);
  // A sender's clock gone back years: old too, until they write in it (the check below).
  assert.equal(staleFirst({ fa: 1000 }, { firstAt: at }), true);
  // A later one is new.
  assert.equal(staleFirst({ fa: at + 1 }, { firstAt: at }), false);
  // From a contact that never said a time: any that says one is new; one that says none is old
  // only when it names a queue made before the one kept (a late copy).
  assert.equal(staleFirst({ fa: 1 }, {}), false);
  assert.equal(staleFirst({}, {}), false);
  assert.equal(staleFirst({ qa: 5 }, { qa: 9 }), true);
  assert.equal(staleFirst({ qa: 9 }, { qa: 9 }), false);
});

t('after a restore, an old first packet sent again never takes the place of the new conversation', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const oldest = alice.e2e.pending()[0].first;
  const aliceId = message(await bob.e2e.receive(oldest)).identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);
  await alice.e2e.receive((await bob.e2e.seal(aliceId, '', bob.from, { keys: true })).packet);
  await bob.e2e.keysGiven(aliceId);
  const [renewed] = alice.e2e.pending();
  await alice.e2e.firstSent(bobId);
  await bob.e2e.receive(renewed.first);
  const backup = await loadE2EData('space', 0, key);
  await talkOn(alice.e2e, alice.from, bobId, bob.e2e, bob.from, aliceId);

  // Alice's phone is put back; its new conversation reaches Bob, and both talk in it.
  await saveE2EData('space', 0, key, backup);
  await markRestore();
  const restored = await E2E.open('space', 0, key);
  const sent = await restored.seal(bobId, 'after the restore', alice.from);
  message(await bob.e2e.receive(sent.first!));
  await restored.firstSent(bobId);
  assert.equal(message(await bob.e2e.receive(sent.packet)).text, 'after the restore');
  assert.equal(message(await restored.receive((await bob.e2e.seal(aliceId, 'welcome back', bob.from)).packet)).text, 'welcome back');

  // Someone who kept every packet sends the older first ones again, once Bob's lists have forgotten them.
  const kept = await loadE2EData('space', 1, bob.key);
  const live = kept.contacts.find((c) => c.identity === aliceId)!;
  await saveE2EData('space', 1, bob.key, { ...kept, seen: [], contacts: kept.contacts.map((c) => ({ ...c, seen: [] })) });
  const later = await E2E.open('space', 1, bob.key);
  for (const old of [oldest, renewed.first, sent.first!]) {
    const got = await later.receive(old);
    if (got.kind === 'message') assert.deepEqual([got.text, got.added], ['', false]);
    const now = (await loadE2EData('space', 1, bob.key)).contacts.find((c) => c.identity === aliceId)!;
    // Bob still writes to the same place, in the conversation Alice's phone has now.
    assert.deepEqual([now.sender, now.relay, now.relayKey, now.firstAt], [live.sender, live.relay, live.relayKey, live.firstAt]);
    assert.equal(message(await restored.receive((await later.seal(aliceId, 'still here', bob.from)).packet)).text, 'still here');
  }
  store.delete('erevos.restored');
});

t('a conversation a contact really starts with its clock moved back takes over once they write in it', async () => {
  const key = randomBytes(32);
  const { alice, bob, aliceId, bobId } = await withPrekeys(key);
  const backup = await loadE2EData('space', 0, key);
  await talkOn(alice.e2e, alice.from, bobId, bob.e2e, bob.from, aliceId);
  // Alice's clock was a year ahead when her last conversation started; it is right now.
  const kept = await loadE2EData('space', 1, bob.key);
  const ahead = Date.now() + 365 * 24 * 3600 * 1000;
  await saveE2EData('space', 1, bob.key, { ...kept, contacts: kept.contacts.map((c) => (c.identity === aliceId ? { ...c, firstAt: ahead } : c)) });
  const bobAgain = await E2E.open('space', 1, bob.key);
  const before = (await loadE2EData('space', 1, bob.key)).contacts.find((c) => c.identity === aliceId)!;

  await saveE2EData('space', 0, key, backup);
  await markRestore();
  const restored = await E2E.open('space', 0, key);
  const sent = await restored.seal(bobId, 'after the restore', alice.from);
  // Its first packet says an earlier time: taken behind, Bob does not send in it yet ...
  message(await bobAgain.receive(sent.first!));
  await restored.firstSent(bobId);
  const behind = (await loadE2EData('space', 1, bob.key)).contacts.find((c) => c.identity === aliceId)!;
  assert.equal(behind.conversations[0], before.conversations[0]);
  assert.equal(behind.firstAt, ahead);
  // ... until Alice writes in it: then it is the one, and they talk.
  assert.equal(message(await bobAgain.receive(sent.packet)).text, 'after the restore');
  assert.equal(message(await restored.receive((await bobAgain.seal(aliceId, 'welcome back', bob.from)).packet)).text, 'welcome back');
  store.delete('erevos.restored');
});

t('a backup put back long after its contact gave prekeys starts the new conversation without waiting on it', async () => {
  const key = randomBytes(32);
  const { alice, bob, aliceId, bobId } = await withPrekeys(key);
  const backup = await loadE2EData('space', 0, key);
  // Bob's phone may have thrown away the prekeys Alice holds: they came more than two months ago.
  const long = { ...backup, contacts: backup.contacts.map((c) => ({ ...c, bundleAt: Date.now() - 61 * 24 * 3600 * 1000 })) };
  await talkOn(alice.e2e, alice.from, bobId, bob.e2e, bob.from, aliceId);

  await saveE2EData('space', 0, key, long);
  await markRestore();
  const restored = await E2E.open('space', 0, key);
  // Its first packet goes on its own, and Alice writes in the one put back meanwhile.
  const [renew] = restored.pending();
  assert.equal(renew.identity, bobId);
  assert.equal((await restored.seal(bobId, 'in the old one', alice.from)).first, null);
  await restored.firstSent(bobId);
  // Bob, who still has them, takes it and writes in it; Alice moves to it once he does.
  assert.equal(message(await bob.e2e.receive(renew.first)).identity, aliceId);
  assert.equal(message(await restored.receive((await bob.e2e.seal(aliceId, 'in the new one', bob.from)).packet)).text, 'in the new one');
  assert.equal(message(await bob.e2e.receive((await restored.seal(bobId, 'here too', alice.from)).packet)).text, 'here too');
  store.delete('erevos.restored');
});

t('a contact keeps the name this chat gives it, sealed, through new messages and links', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  await alice.e2e.rename(identity, '  Μαρία\n\u202e Π.  ');
  assert.equal(alice.e2e.contacts()[0].name, 'Μαρία Π.');

  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'hi', bob.from)).packet);
  await alice.e2e.addContact({ ...bob.code, senderHex: sender() }, alice.from);
  const again = await E2E.open('space', 0, key);
  assert.equal(again.contacts()[0].name, 'Μαρία Π.');
  assert.ok(!files.get(FILE)!.includes('Μαρία'));

  await again.rename(identity, 'x'.repeat(MAX_NAME + 10));
  assert.equal(again.contacts()[0].name.length, MAX_NAME);
  await again.rename(identity, '   ');
  assert.equal((await E2E.open('space', 0, key)).contacts()[0].name, '');
  await assert.rejects(again.rename('00'.repeat(32), 'nobody'));
});

t('a contact added from a link takes the name of the contact linked to it, and keeps one given in Erevos', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  assert.equal(await giveLinkedName(alice.e2e, identity, { name: 'Bob Βασιλείου' }), 'Bob Βασιλείου');
  assert.equal((await E2E.open('space', 0, key)).contacts()[0].name, 'Bob Βασιλείου');

  await alice.e2e.rename(identity, 'Bobby');
  assert.equal(await giveLinkedName(alice.e2e, identity, { name: 'Robert' }), '');
  assert.equal(alice.e2e.contacts()[0].name, 'Bobby');
  // Adding their link again ("Already a contact") keeps it too.
  assert.equal((await alice.e2e.addContact(bob.code, alice.from)).added, false);
  assert.equal((await E2E.open('space', 0, key)).contacts()[0].name, 'Bobby');
  assert.equal(await giveLinkedName(alice.e2e, '00'.repeat(32), { name: 'Nobody' }), '');
});

t('a chat keeps its own look, sealed, until given the space\'s again', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  assert.equal(alice.e2e.contacts()[0].look, null);
  await alice.e2e.setLook(identity, { ...DEFAULT_LOOK, style: 'matrix', wallpaper: 'stars' });
  // A message from them keeps it, and so does opening the chat again.
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'hi', bob.from)).packet);
  const again = await E2E.open('space', 0, key);
  assert.equal(again.contacts()[0].look?.style, 'matrix');
  assert.equal(again.contacts()[0].look?.wallpaper, 'stars');
  // As the contact holds it, in quotes: a short word alone may be in the sealed text by chance.
  assert.ok(!files.get(FILE)!.includes(JSON.stringify('matrix')));
  await again.setLook(identity, null);
  assert.equal((await E2E.open('space', 0, key)).contacts()[0].look, null);
  await assert.rejects(again.setLook('00'.repeat(32), null));
});

t('a contact keeps the picture this chat gives it, sealed, and a picture of the wrong shape is none', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  assert.equal(alice.e2e.contacts()[0].avatar, null);
  await alice.e2e.setAvatar(identity, { kind: 'emoji', emoji: '🦊', color: '#f76b15' });
  const again = await E2E.open('space', 0, key);
  assert.deepEqual(again.contacts()[0].avatar, { kind: 'emoji', emoji: '🦊', color: '#F76B15' });
  await again.setAvatar(identity, null);
  assert.equal((await E2E.open('space', 0, key)).contacts()[0].avatar, null);
  assert.equal(checkedAvatar({ kind: 'emoji', emoji: 'way too long a sign', color: '#000000' }), null);
  assert.equal(checkedAvatar({ kind: 'emoji', emoji: '\u202e🦊', color: '#000000' }), null);
  assert.equal(checkedAvatar({ kind: 'photo', emoji: '🦊', color: '#000000' }), null);
  assert.equal(checkedAvatar({ kind: 'photo', id: 'ab', key: 'cd' }), null);
  assert.equal(checkedAvatar({ kind: 'emoji', emoji: '🦊', color: 'orange' }), null);
});

t('a contact\'s photo is sealed in its own file, deleted when another picture or forgetting them takes its place', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const first = await savePhoto(new Uint8Array([1, 2, 3]));
  await alice.e2e.setAvatar(identity, { kind: 'photo', ...first });
  const again = await E2E.open('space', 0, key);
  const kept = again.contacts()[0].avatar;
  assert.ok(kept?.kind === 'photo' && kept.id === first.id);
  assert.deepEqual(await loadPhoto(first), new Uint8Array([1, 2, 3]));
  assert.ok(!files.get(FILE)!.includes(first.key));

  const second = await savePhoto(new Uint8Array([4]));
  await again.setAvatar(identity, { kind: 'photo', ...second });
  assert.equal(await loadPhoto(first), null);
  await again.removeContact(identity);
  assert.equal(await loadPhoto(second), null);
});

t('a message carries its tag, and a request to delete one message or all of them', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  assert.deepEqual([hello.tag, hello.erase], ['', null]);
  await alice.e2e.firstSent(identity);

  const hi = await alice.e2e.seal(identity, 'hi', alice.from);
  assert.match(hi.tag, /^[0-9a-f]{12}$/);
  const got = message(await bob.e2e.receive(hi.packet));
  assert.deepEqual([got.text, got.tag, got.erase], ['hi', hi.tag, null]);

  const one = await alice.e2e.seal(identity, '', alice.from, { erase: { tag: hi.tag } });
  assert.equal(one.tag, '');
  assert.deepEqual(message(await bob.e2e.receive(one.packet)).erase, { tag: hi.tag });
  const all = await bob.e2e.seal(hello.identity, '', bob.from, { erase: { all: true } });
  const asked = message(await alice.e2e.receive(all.packet));
  assert.deepEqual([asked.text, asked.erase], ['', { all: true }]);
  // A message with text never asks to delete.
  const both = await alice.e2e.seal(identity, 'text', alice.from, { erase: { all: true } });
  assert.equal(message(await bob.e2e.receive(both.packet)).erase, null);
});

t('an answer says which message it answers, and a reaction travels with no words', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(identity);

  const question = await alice.e2e.seal(identity, 'coffee?', alice.from);
  assert.equal(message(await bob.e2e.receive(question.packet)).re, '');
  const answer = await bob.e2e.seal(hello.identity, 'yes', bob.from, { re: question.tag });
  const answered = message(await alice.e2e.receive(answer.packet));
  assert.deepEqual([answered.text, answered.re], ['yes', question.tag]);
  // A voice message and a file answer too.
  const voice = await bob.e2e.sealVoice(hello.identity, new Uint8Array(10), 1000, bob.from, { re: question.tag });
  assert.equal(message(await alice.e2e.receive(voice.packets[0])).re, question.tag);

  const liked = await alice.e2e.seal(identity, '', alice.from, { react: { tag: answer.tag, emoji: '👍' } });
  assert.equal(liked.tag, '');
  const reaction = message(await bob.e2e.receive(liked.packet));
  assert.deepEqual([reaction.text, reaction.tag, reaction.react], ['', '', { tag: answer.tag, emoji: '👍' }]);
  const back = await alice.e2e.seal(identity, '', alice.from, { react: { tag: answer.tag, emoji: '' } });
  assert.deepEqual(message(await bob.e2e.receive(back.packet)).react, { tag: answer.tag, emoji: '' });
  // A reaction with words is none, and words never react.
  const words = await alice.e2e.seal(identity, '', alice.from, { react: { tag: answer.tag, emoji: 'nice' } });
  assert.equal(message(await bob.e2e.receive(words.packet)).react, null);
  const both = await alice.e2e.seal(identity, 'text', alice.from, { react: { tag: answer.tag, emoji: '👍' } });
  assert.equal(message(await bob.e2e.receive(both.packet)).react, null);
});

t('a pin travels with no words, and says the phone is open as writing does', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(identity);

  const words = await alice.e2e.seal(identity, 'meet here', alice.from);
  await bob.e2e.receive(words.packet);
  const pinned = await bob.e2e.seal(hello.identity, '', bob.from, { more: { pin: { tag: words.tag, on: true } } });
  assert.equal(pinned.tag, '');
  const pin = message(await alice.e2e.receive(pinned.packet));
  assert.deepEqual([pin.text, pin.more], ['', { pin: { tag: words.tag, on: true } }]);
  assert.ok(pin.online > Date.now());
  const down = await bob.e2e.seal(hello.identity, '', bob.from, { more: { pin: { tag: words.tag, on: false } } });
  assert.deepEqual(message(await alice.e2e.receive(down.packet)).more, { pin: { tag: words.tag, on: false } });
  // Words never pin, and a pin of no tag is none.
  const both = await bob.e2e.seal(hello.identity, 'text', bob.from, { more: { pin: { tag: words.tag, on: true } } });
  assert.deepEqual(message(await alice.e2e.receive(both.packet)).more, {});
  const odd = await bob.e2e.seal(hello.identity, '', bob.from, { more: { pin: { tag: 'nope', on: true } } });
  assert.deepEqual(message(await alice.e2e.receive(odd.packet)).more, {});
});

t('an edit travels with no words, and with words is none', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  await bob.e2e.receive(alice.e2e.pending()[0].first);
  await alice.e2e.firstSent(identity);

  const words = await alice.e2e.seal(identity, 'meet at five', alice.from);
  await bob.e2e.receive(words.packet);
  const edit = { tag: words.tag, text: 'meet at six\nby the door' };
  const edited = await alice.e2e.seal(identity, '', alice.from, { more: { edit } });
  assert.equal(edited.tag, '', 'no message of its own to keep');
  const came = message(await bob.e2e.receive(edited.packet));
  assert.deepEqual([came.text, came.more], ['', { edit }]);
  const both = await alice.e2e.seal(identity, 'text', alice.from, { more: { edit } });
  assert.deepEqual(message(await bob.e2e.receive(both.packet)).more, {});
});

t('a sticker travels by its name, with its emoji as its words', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  await bob.e2e.receive(alice.e2e.pending()[0].first);
  await alice.e2e.firstSent(identity);
  const sealed = await alice.e2e.seal(identity, '🌝', alice.from, { more: { sticker: 'moon-smile' } });
  assert.notEqual(sealed.tag, '');
  const sticker = message(await bob.e2e.receive(sealed.packet));
  assert.deepEqual([sticker.text, sticker.tag, sticker.more], ['🌝', sealed.tag, { sticker: 'moon-smile' }]);
});

t('a poll travels with its words, and a vote on it with none', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(identity);
  const poll = { q: 'Tea or coffee?', o: ['Tea', 'Coffee'] };
  const asked = await alice.e2e.seal(identity, '📊 Tea or coffee?\n1. Tea\n2. Coffee', alice.from, { more: { poll } });
  const came = message(await bob.e2e.receive(asked.packet));
  assert.deepEqual([came.tag, came.more], [asked.tag, { poll }]);
  const voted = await bob.e2e.seal(hello.identity, '', bob.from, { more: { vote: { tag: asked.tag, chose: [1] } } });
  assert.equal(voted.tag, '');
  const vote = message(await alice.e2e.receive(voted.packet));
  assert.deepEqual([vote.text, vote.more], ['', { vote: { tag: asked.tag, chose: [1] } }]);
});

t('a message forwarded says so, with its words, its voice or its file, and only with them', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  await bob.e2e.receive(alice.e2e.pending()[0].first);
  await alice.e2e.firstSent(identity);
  const words = await alice.e2e.seal(identity, '🌝', alice.from, { more: { sticker: 'moon-smile', forwarded: true } });
  assert.deepEqual(message(await bob.e2e.receive(words.packet)).more, { sticker: 'moon-smile', forwarded: true });
  const voice = await alice.e2e.sealVoice(identity, new Uint8Array(10), 1000, alice.from, { forwarded: true });
  assert.deepEqual(message(await bob.e2e.receive(voice.packets[0])).more, { forwarded: true });
  const offer = { name: 'a.txt', mime: 'text/plain', kind: 'file' as const, size: 3000, relay: 'ws://127.0.0.1:7879', ids: 'ab'.repeat(24), key: 'cd'.repeat(32), chunk: 64 * 1024 };
  const file = await alice.e2e.sealFile(identity, offer, alice.from, { forwarded: true });
  const came = message(await bob.e2e.receive(file.packet));
  assert.deepEqual([came.file?.name, came.more], ['a.txt', { forwarded: true }]);
  const plain = await alice.e2e.sealFile(identity, offer, alice.from);
  assert.deepEqual(message(await bob.e2e.receive(plain.packet)).more, {});
  // Alone it is nothing to show, so it is not sent as anything.
  const alone = await alice.e2e.seal(identity, '', alice.from, { more: { forwarded: true } });
  assert.deepEqual(message(await bob.e2e.receive(alone.packet)).more, {});
});

t('typing travels with no words, and neither accepts a request nor says the phone is open', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(identity);
  const typing = await bob.e2e.seal(hello.identity, '', bob.from, { more: { typing: true } });
  assert.equal(typing.tag, '');
  const said = message(await alice.e2e.receive(typing.packet));
  assert.deepEqual([said.text, said.more, said.online], ['', { typing: true }, 0]);
  assert.equal(bob.e2e.contacts()[0].request, true);
});

t('a message sent without sound says so inside the encryption, and one sent as usual says nothing', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  assert.equal(hello.quiet, false);
  await alice.e2e.firstSent(identity);

  const hush = await alice.e2e.seal(identity, 'hush', alice.from, { quiet: true });
  const heard = message(await bob.e2e.receive(hush.packet));
  assert.deepEqual([heard.text, heard.quiet], ['hush', true]);
  const loud = await alice.e2e.seal(identity, 'loud', alice.from, { quiet: false });
  assert.equal(message(await bob.e2e.receive(loud.packet)).quiet, false);
  // Only words come quiet: what came or was read is no message to hear.
  const marks = await bob.e2e.seal(hello.identity, '', bob.from, { got: [hush.tag], quiet: true });
  assert.equal(message(await alice.e2e.receive(marks.packet)).quiet, false);
});

t('blocking screenshots travels with the messages, either phone sets it, and the later setting wins', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  assert.deepEqual([hello.noShots, hello.shotsChanged, bob.e2e.contacts()[0].shots], [false, false, false]);
  await alice.e2e.firstSent(identity);

  // Bob writes before Alice blocks them: his message does not take it back.
  const before = await bob.e2e.seal(hello.identity, 'before', bob.from);
  await alice.e2e.setShots(identity, true);
  assert.equal(alice.e2e.contacts()[0].shots, true);
  const told = await alice.e2e.seal(identity, '', alice.from);
  const stale = message(await alice.e2e.receive(before.packet));
  assert.deepEqual([stale.noShots, stale.shotsChanged, alice.e2e.contacts()[0].shots], [true, false, true]);

  const learnt = message(await bob.e2e.receive(told.packet));
  assert.deepEqual([learnt.text, learnt.noShots, learnt.shotsChanged, bob.e2e.contacts()[0].shots], ['', true, true, true]);
  // Said again with every message, it changes nothing more.
  const again = message(await bob.e2e.receive((await alice.e2e.seal(identity, 'hi', alice.from)).packet));
  assert.deepEqual([again.noShots, again.shotsChanged], [true, false]);

  // Bob allows them again: Alice's phone takes it.
  await bob.e2e.setShots(hello.identity, false);
  const off = message(await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'off', bob.from)).packet));
  assert.deepEqual([off.noShots, off.shotsChanged, alice.e2e.contacts()[0].shots], [false, true, false]);

  // Kept, sealed, between launches.
  await alice.e2e.setShots(identity, true);
  assert.equal((await E2E.open('space', 0, key)).contacts()[0].shots, true);
  await assert.rejects(alice.e2e.setShots('00'.repeat(32), true));
});

t('a chat timer travels with the messages, the later setting wins, and old messages keep theirs', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  assert.deepEqual([hello.timer, hello.timerChanged], [0, false]);
  await alice.e2e.firstSent(identity);

  // Bob sends with no timer while Alice sets one: his message does not take it back.
  const before = await bob.e2e.seal(hello.identity, 'before', bob.from);
  assert.equal(before.timer, 0);
  await alice.e2e.setTimer(identity, 3600);
  const told = await alice.e2e.seal(identity, '', alice.from);
  assert.equal(told.timer, 3600);
  const stale = message(await alice.e2e.receive(before.packet));
  assert.deepEqual([stale.text, stale.timer, stale.timerChanged], ['before', 0, false]);
  assert.equal(alice.e2e.contacts()[0].timer, 3600);

  const learnt = message(await bob.e2e.receive(told.packet));
  assert.deepEqual([learnt.text, learnt.erase, learnt.timer, learnt.timerChanged], ['', null, 3600, true]);
  assert.equal(bob.e2e.contacts()[0].timer, 3600);
  const after = await bob.e2e.seal(hello.identity, 'after', bob.from);
  assert.deepEqual([message(await alice.e2e.receive(after.packet)).timer, after.timer], [3600, 3600]);

  // Bob turns it off; the same setting again changes nothing.
  await bob.e2e.setTimer(hello.identity, 0);
  const off = message(await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'off', bob.from)).packet));
  assert.deepEqual([off.timer, off.timerChanged], [0, true]);
  const same = message(await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'again', bob.from)).packet));
  assert.deepEqual([same.timer, same.timerChanged], [0, false]);

  // One message can disappear on its own, without changing the chat's timer.
  const once = await bob.e2e.seal(hello.identity, 'once', bob.from, { lasts: 60 });
  assert.equal(once.timer, 60);
  const gotOnce = message(await alice.e2e.receive(once.packet));
  assert.deepEqual([gotOnce.text, gotOnce.timer, gotOnce.timerChanged], ['once', 60, false]);
  assert.equal(alice.e2e.contacts()[0].timer, 0);

  // What came and was read travels back by tag.
  const receipts = await alice.e2e.seal(identity, '', alice.from, { got: [once.tag, 'not a tag'], read: [once.tag] });
  const back = message(await bob.e2e.receive(receipts.packet));
  assert.deepEqual([back.text, back.got, back.read, back.timerChanged], ['', [once.tag], [once.tag], false]);

  // Kept, sealed, between launches; and only times Erevos knows.
  await alice.e2e.setTimer(identity, 300);
  assert.equal((await E2E.open('space', 0, key)).contacts()[0].timer, 300);
  await assert.rejects(alice.e2e.setTimer(identity, -1));
  await assert.rejects(alice.e2e.setTimer(identity, 1.5));
  await assert.rejects(alice.e2e.seal(identity, 'x', alice.from, { lasts: -5 }));
  await assert.rejects(alice.e2e.setTimer('00'.repeat(32), 60));
});

t('last seen goes inside messages, both ways, and is forgotten once turned off', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  const aliceId = hello.identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);

  // A chat that never set it, as hidden chats, says nothing and keeps nothing.
  const none = message(await bob.e2e.receive((await alice.e2e.seal(bobId, 'a', alice.from)).packet));
  assert.equal(none.seen, false);
  assert.equal(bob.e2e.lastSeen(aliceId), 0);

  // On, both: the time goes, and is kept, sealed, across launches.
  let aliceAt = Date.now() - 60_000;
  let bobAt = 0;
  alice.e2e.setLastSeen({ on: true, at: () => aliceAt });
  bob.e2e.setLastSeen({ on: true, at: () => bobAt });
  assert.equal(alice.e2e.seenNews(bobId), true);
  const said = message(await bob.e2e.receive((await alice.e2e.seal(bobId, 'b', alice.from)).packet));
  assert.equal(said.seen, true);
  assert.equal(bob.e2e.lastSeen(aliceId), aliceAt);
  assert.equal(alice.e2e.seenNews(bobId), false);
  const again = await E2E.open('space', 1, bob.key);
  assert.equal(again.lastSeen(aliceId), 0);
  again.setLastSeen({ on: true, at: () => 0 });
  assert.equal(again.lastSeen(aliceId), aliceAt);

  // An older time does not go back; one ahead of this clock counts as now.
  const was = aliceAt;
  aliceAt = was - 5_000;
  message(await bob.e2e.receive((await alice.e2e.seal(bobId, '', alice.from, { got: [] })).packet));
  assert.equal(bob.e2e.lastSeen(aliceId), was);
  aliceAt = Date.now() + 3_600_000;
  message(await bob.e2e.receive((await alice.e2e.seal(bobId, 'c', alice.from)).packet));
  assert.ok(bob.e2e.lastSeen(aliceId) <= Date.now());
  assert.ok(bob.e2e.lastSeen(aliceId) > was);
  // Shown again since: one who asks while the app is away is told once.
  aliceAt = Date.now() + 7_200_000;
  assert.equal(alice.e2e.seenNews(bobId), true);

  // Not known since the start: Bob's says nothing, and Alice keeps none.
  message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'd', bob.from)).packet));
  assert.equal(alice.e2e.lastSeen(bobId), 0);
  bobAt = Date.now() - 1_000;
  message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'e', bob.from)).packet));
  assert.equal(alice.e2e.lastSeen(bobId), bobAt);

  // Bob turns it off: he sees Alice's no more, and his next message makes Alice forget his.
  bob.e2e.setLastSeen({ on: false, at: () => bobAt });
  assert.equal(bob.e2e.lastSeen(aliceId), 0);
  assert.equal(bob.e2e.seenNews(aliceId), false);
  const off = message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'f', bob.from)).packet));
  assert.equal(off.seen, true);
  assert.equal(alice.e2e.lastSeen(bobId), 0);
  assert.equal(alice.e2e.contacts().length, 1);

  // A chat that appears offline tells none, and shows none.
  bob.e2e.setLastSeen({ on: true, at: () => bobAt });
  await alice.e2e.setHidden(bobId, true);
  const hid = message(await bob.e2e.receive((await alice.e2e.seal(bobId, '', alice.from, { got: [] })).packet));
  assert.equal(hid.seen, false);
  message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'g', bob.from)).packet));
  assert.equal(alice.e2e.lastSeen(bobId), 0);
  assert.equal(alice.e2e.seenNews(bobId), false);
  await alice.e2e.setHidden(bobId, false);
  assert.equal(alice.e2e.lastSeen(bobId), bobAt);
});

t('closing tells those told while it showed when it closed, once, and says it is open only while it shows', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const aliceId = message(await bob.e2e.receive(alice.e2e.pending()[0].first)).identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);
  const since = Date.now() - 3 * 60 * 60_000;
  let at = since;
  alice.e2e.setLastSeen({ on: true, at: () => at });
  assert.equal(alice.e2e.showsNow(since), true);
  // Told while it showed: Bob learns a time of Alice's.
  bob.e2e.setLastSeen({ on: true, at: () => since });
  message(await bob.e2e.receive((await alice.e2e.seal(bobId, 'hi', alice.from)).packet));
  assert.ok(bob.e2e.lastSeen(aliceId) > 0 && bob.e2e.lastSeen(aliceId) <= since);
  // Closed five minutes later: Bob is due, once; the message says the closing time.
  const closed = since + 5 * 60_000;
  at = closed;
  assert.equal(alice.e2e.showsNow(closed + 10_000), false);
  assert.deepEqual(alice.e2e.closeDue(since, closed + 1), []);
  assert.deepEqual(alice.e2e.closeDue(since, closed), [bobId]);
  assert.deepEqual(alice.e2e.closeDue(since, closed), []);
  message(await bob.e2e.receive((await alice.e2e.seal(bobId, '', alice.from, { got: [] })).packet));
  assert.equal(bob.e2e.lastSeen(aliceId), closed);
  // Told within the last minute before closing, or not told since it began to show: nothing.
  const again = closed + 30 * 60_000;
  at = again - 30_000;
  await alice.e2e.seal(bobId, 'late', alice.from);
  at = again;
  assert.deepEqual(alice.e2e.closeDue(again - 60_000, again), []);
  assert.deepEqual(alice.e2e.closeDue(again + 1, again), []);
  // Telling turned off, or "last seen" off: nothing.
  const third = again + 30 * 60_000;
  at = third - 10 * 60_000;
  await alice.e2e.seal(bobId, 'more', alice.from);
  at = third;
  alice.e2e.setLastSeen({ on: true, at: () => at, tells: false });
  assert.deepEqual(alice.e2e.closeDue(third - 20 * 60_000, third), []);
  alice.e2e.setLastSeen({ on: false, at: () => at });
  assert.deepEqual(alice.e2e.closeDue(third - 20 * 60_000, third), []);
});

t('a space or hidden place that stops showing says when it began and when it stopped', async () => {
  const ended: [string, number, number][] = [];
  const stop = onShownEnded((key, since, at) => ended.push([key, since, at]));
  try {
    spaceShown(7, 1_000);
    placeShown({ space: 7, pocket: 2 }, 2_000);
    placeShown(null, 3_000);
    spaceShown(null, 4_000);
    assert.deepEqual(ended, [
      [spaceSeenKey(7), 1_000, 2_000],
      [placeSeenKey(7, 2), 2_000, 3_000],
      [spaceSeenKey(7), 3_000, 4_000],
    ]);
    assert.equal(shownAt(placeSeenKey(7, 2), 5_000), 3_000);
  } finally {
    stop();
  }
});

t('opening tells, unasked, only recent contacts who show their time, at most every 15 minutes, and not when turned off', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const aliceId = message(await bob.e2e.receive(alice.e2e.pending()[0].first)).identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);
  const now = Date.now();
  alice.e2e.setLastSeen({ on: true, at: () => now });
  // Bob never said his time: he is not told.
  assert.deepEqual(alice.e2e.openDue(now), []);
  bob.e2e.setLastSeen({ on: true, at: () => now - 1000 });
  message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'hi', bob.from)).packet));
  // Not showing now: nothing.
  alice.e2e.setLastSeen({ on: true, at: () => now - 5 * 60_000 });
  assert.deepEqual(alice.e2e.openDue(now), []);
  // Showing: Bob, once, then again only after 15 minutes.
  alice.e2e.setLastSeen({ on: true, at: () => now });
  assert.deepEqual(alice.e2e.openDue(now), [bobId]);
  assert.deepEqual(alice.e2e.openDue(now + 60_000), []);
  alice.e2e.setLastSeen({ on: true, at: () => now + OPEN_EVERY });
  assert.deepEqual(alice.e2e.openDue(now + OPEN_EVERY), [bobId]);
  // Turned off, or "last seen" off, or his time too old: nothing.
  const later = now + 2 * OPEN_EVERY;
  alice.e2e.setLastSeen({ on: true, at: () => later, tells: false });
  assert.deepEqual(alice.e2e.openDue(later), []);
  alice.e2e.setLastSeen({ on: false, at: () => later });
  assert.deepEqual(alice.e2e.openDue(later), []);
  const old = now + OPEN_RECENT + 1;
  alice.e2e.setLastSeen({ on: true, at: () => old });
  assert.deepEqual(alice.e2e.openDue(old), []);
  // A chat that appears offline is never told.
  alice.e2e.setLastSeen({ on: true, at: () => later });
  await alice.e2e.setHidden(bobId, true);
  assert.deepEqual(alice.e2e.openDue(later), []);
});

t('a phone says it is open when it writes or answers, and a chat that appears offline holds its marks', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  const aliceId = hello.identity;
  await alice.e2e.firstSent(bobId);
  await bob.e2e.acceptRequest(aliceId);
  // Nothing said yet: not known to be open.
  assert.equal(hello.online, 0);
  assert.equal(bob.e2e.onlineUntil(aliceId), 0);

  // Asking says this phone is open too.
  const before = Date.now();
  const asked = message(await bob.e2e.receive((await alice.e2e.seal(bobId, '', alice.from, { ask: true, on: ONLINE })).packet));
  assert.equal(asked.ask, true);
  assert.ok(asked.online >= before + ONLINE * 1000 - 50 && asked.online <= Date.now() + ONLINE * 1000);
  assert.equal(bob.e2e.onlineUntil(aliceId), asked.online);
  assert.ok(alice.e2e.toldAt(bobId) >= before);
  // Gone by then.
  assert.equal(bob.e2e.onlineUntil(aliceId, asked.online + 1), 0);

  // Bob's chat with Alice appears offline: no word of being open, no asking, marks held.
  await bob.e2e.setHidden(aliceId, true);
  assert.equal(bob.e2e.contacts()[0].hide, true);
  const one = await alice.e2e.seal(bobId, 'one', alice.from);
  const two = await alice.e2e.seal(bobId, 'two', alice.from);
  message(await bob.e2e.receive(one.packet));
  message(await bob.e2e.receive(two.packet));
  await bob.e2e.hold(aliceId, 'got', [one.tag, two.tag]);
  await bob.e2e.hold(aliceId, 'read', [one.tag]);
  const quiet = message(await alice.e2e.receive((await bob.e2e.seal(aliceId, '', bob.from, { ask: true, on: ONLINE })).packet));
  assert.deepEqual([quiet.ask, quiet.online, quiet.got, quiet.read], [false, 0, [], []]);
  // Held across launches, sealed.
  const again = await E2E.open('space', 1, bob.key);
  assert.deepEqual(
    [again.contacts()[0].hide, (await loadE2EData('space', 1, bob.key)).contacts[0].heldRead],
    [true, [one.tag]],
  );

  // Bob writes: open for a while, and what was held goes with it, read beating came.
  const reply = message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'here', bob.from)).packet));
  assert.equal(reply.text, 'here');
  assert.ok(reply.online >= Date.now() + ONLINE_AFTER_WRITE * 1000 - 1000);
  assert.deepEqual([reply.got, reply.read], [[two.tag], [one.tag]]);
  // Told once only.
  const after = message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'and again', bob.from)).packet));
  assert.deepEqual([after.got, after.read], [[], []]);

  // Shown again, what is held goes with the next message, whatever it is. While the chat appears
  // offline nothing is due of itself (readDue); shown, the next look says it.
  await bob.e2e.hold(aliceId, 'read', [two.tag]);
  assert.deepEqual(bob.e2e.readDue(), []);
  await bob.e2e.setHidden(aliceId, false);
  assert.deepEqual([bob.e2e.readDue(), bob.e2e.heldRead(aliceId)], [[aliceId], [two.tag]]);
  const shown = message(await alice.e2e.receive((await bob.e2e.seal(aliceId, '', bob.from, { on: ONLINE })).packet));
  assert.deepEqual([shown.read, shown.online > 0], [[two.tag], true]);
  // Said, it is due no more; read with the app closed before it was said, it is still due at the next start.
  assert.deepEqual(bob.e2e.readDue(), []);
  await bob.e2e.hold(aliceId, 'read', [one.tag]);
  assert.deepEqual((await E2E.open('space', 1, bob.key)).readDue(), [aliceId]);
  const late = message(await alice.e2e.receive((await bob.e2e.seal(aliceId, '', bob.from)).packet));
  assert.deepEqual(late.read, [one.tag]);
});

t('a voice message travels in parts, each with its tag, and comes back whole', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(identity);

  const sound = randomBytes(PART_SIZE * 2 + 500);
  const sealed = await alice.e2e.sealVoice(identity, sound, 9000, alice.from, { lasts: 300 });
  assert.deepEqual([sealed.packets.length, sealed.timer], [3, 300]);
  assert.match(sealed.tag, /^[0-9a-f]{12}$/);
  const assembler = new VoiceAssembler();
  let whole: { audio: Uint8Array; ms: number; talk: boolean } | null = null;
  for (const packet of sealed.packets) {
    assert.ok(packet.length < 20_000);
    const got = message(await bob.e2e.receive(packet));
    assert.deepEqual([got.text, got.tag, got.timer, got.voice!.parts], ['', sealed.tag, 300, 3]);
    whole = assembler.add(hello.identity, got.voice!) ?? whole;
  }
  assert.deepEqual([whole!.audio, whole!.ms, whole!.talk], [sound, 9000, false]);
  // Said walkie-talkie style, it comes back as such.
  const talk = await alice.e2e.sealVoice(identity, sound.slice(0, 900), 1500, alice.from, { talk: true });
  const heard = assembler.add(hello.identity, message(await bob.e2e.receive(talk.packets[0])).voice!);
  assert.deepEqual([heard!.audio, heard!.talk], [sound.slice(0, 900), true]);
  // The conversation goes on after it, both ways.
  assert.equal(message(await bob.e2e.receive((await alice.e2e.seal(identity, 'after', alice.from)).packet)).text, 'after');
  assert.equal(message(await alice.e2e.receive((await bob.e2e.seal(hello.identity, 'back', bob.from)).packet)).text, 'back');
});

t('every slot has a value of the same size, used or not', async () => {
  await chat('space', 0);
  const before = JSON.parse(files.get(FILE)!) as Record<string, string[]>;
  const lengths = (values: Record<string, string[]>) => [...values.space, ...values.hidden].map((v) => v.length);
  assert.equal(before.space.length, 4);
  assert.equal(before.hidden.length, 4);
  assert.equal(new Set(lengths(before)).size, 1);
  const hidden = await chat('hidden', 2);
  await hidden.e2e.addContact((await chat('space', 3)).code, hidden.from);
  assert.equal(new Set(lengths(JSON.parse(files.get(FILE)!))).size, 1);
});

t('refuses plain messages, other accounts, its own link and links without keys', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const carol = await chat('space', 2);
  assert.deepEqual(await alice.e2e.receive(utf8Encode('{"from":"","text":"plain"}')), { kind: 'refused', reason: 'plain' });
  await carol.e2e.addContact(bob.code, carol.from);
  // A first packet for Bob, not Alice.
  assert.deepEqual(await alice.e2e.receive(carol.e2e.pending()[0].first), { kind: 'refused', reason: 'unknown' });
  await assert.rejects(alice.e2e.addContact(alice.code, alice.from), OwnCodeError);
  await assert.rejects(alice.e2e.addContact({ senderHex: bob.from, key: '' }, alice.from), NoKeyError);
  const damaged = bob.code.key.slice(0, 60) + (bob.code.key[60] === 'A' ? 'B' : 'A') + bob.code.key.slice(61);
  await assert.rejects(alice.e2e.addContact({ senderHex: bob.from, key: damaged }, alice.from));
  assert.deepEqual(alice.e2e.contacts(), []);
});

t('contacts on different relays learn where to reach each other', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const bobAt = { relay: 'wss://bob.example.org', relayKey: toBase64Url(randomBytes(32)) };
  const aliceAt = { relay: 'wss://alice.example.org', relayKey: toBase64Url(randomBytes(32)) };
  const code = parseContact(contactLink({ senderHex: bob.from, relayUrl: bobAt.relay, key: bob.code.key, relayKey: bobAt.relayKey }))!;
  assert.equal(code.relayKey, bobAt.relayKey);

  const { identity } = await alice.e2e.addContact(code, alice.from, aliceAt);
  const [pending] = alice.e2e.pending();
  assert.deepEqual([pending.relay, pending.relayKey], [bobAt.relay, bobAt.relayKey]);

  // Bob's answer goes to Alice's relay, told to him in her first packet.
  const hello = message(await bob.e2e.receive(pending.first));
  const toAlice = await bob.e2e.seal(hello.identity, 'hi', bob.from, { at: bobAt });
  assert.deepEqual([toAlice.relay, toAlice.relayKey], [aliceAt.relay, aliceAt.relayKey]);
  await alice.e2e.firstSent(identity);

  // Alice moves to another relay: her next message tells Bob.
  message(await alice.e2e.receive(toAlice.packet));
  const moved = { relay: 'wss://new.example.org', relayKey: toBase64Url(randomBytes(32)) };
  message(await bob.e2e.receive((await alice.e2e.seal(identity, 'moved', alice.from, { at: moved })).packet));
  const again = await bob.e2e.seal(hello.identity, '', bob.from);
  assert.deepEqual([again.relay, again.relayKey], [moved.relay, moved.relayKey]);

  // What her phone says while it has not had her relay's key yet names the relay with no key: the
  // key Bob knows for it stays, or nothing he says, not even that it came, would reach her there.
  const toBobNow = async (at: { relay: string; relayKey: string }, text = '') => {
    message(await bob.e2e.receive((await alice.e2e.seal(identity, text, alice.from, { at })).packet));
    const said = await bob.e2e.seal(hello.identity, '', bob.from);
    return [said.relay, said.relayKey];
  };
  assert.deepEqual(await toBobNow({ relay: moved.relay, relayKey: '' }, 'no key yet'), [moved.relay, moved.relayKey]);
  assert.deepEqual(await toBobNow({ relay: `${moved.relay}/`, relayKey: '' }), [`${moved.relay}/`, moved.relayKey], 'the same relay, however written');
  // A new key for it takes its place; another relay with none has none.
  const rekeyed = toBase64Url(randomBytes(32));
  assert.deepEqual(await toBobNow({ relay: moved.relay, relayKey: rekeyed }), [moved.relay, rekeyed]);
  assert.deepEqual(await toBobNow({ relay: 'wss://other.example.org', relayKey: '' }), ['wss://other.example.org', '']);

  // A link with a broken relay key is not a contact link.
  assert.equal(parseContact(contactLink({ ...code, relayKey: 'short' })), null);
});

t('a contact link with its key fits a QR code', async () => {
  const { code } = await chat('space', 0);
  const link = contactLink({ senderHex: code.senderHex, relayUrl: 'wss://relay.example.org/erevos', key: code.key, relayKey: toBase64Url(randomBytes(32)) });
  assert.ok(link.length < 2000, `${link.length}`);
  // Version 33 or below: 149 modules a side. The relay's key added one version.
  assert.ok(qrRows(link).length <= 149, `${qrRows(link).length}`);
});

t('a call is set up in sealed messages, and calling accepts a request', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('hidden', 0);
  const added = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(added.identity);
  assert.equal(bob.e2e.contacts()[0].request, true);

  // Bob calls Alice back, who wrote first: that accepts her request.
  const sdp = 'v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\n';
  const offer = await bob.e2e.seal(hello.identity, '', bob.from, { call: { id: '0123456789abcdef', kind: 'offer', video: true, sdp, at: 5 } });
  assert.equal(offer.tag, '');
  assert.equal(bob.e2e.contacts()[0].request, false);
  const rang = message(await alice.e2e.receive(offer.packet));
  assert.equal(rang.text, '');
  assert.deepEqual(rang.call, { id: '0123456789abcdef', kind: 'offer', video: true, sdp, at: 5 });

  const end = await alice.e2e.seal(added.identity, '', alice.from, { call: { id: '0123456789abcdef', kind: 'end', reason: 'decline' } });
  assert.deepEqual(message(await bob.e2e.receive(end.packet)).call, { id: '0123456789abcdef', kind: 'end', reason: 'decline' });

  // A text never carries a call signal, and a plain message has none.
  const text = await alice.e2e.seal(added.identity, 'hi', alice.from, { call: { id: '0123456789abcdef', kind: 'ringing' } });
  assert.equal(message(await bob.e2e.receive(text.packet)).call, null);
});

t('a chat moves into the hidden chats whole, with the same safety number, and goes on there', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('hidden', 1);
  const added = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(added.identity);
  await alice.e2e.rename(added.identity, 'Bob');
  const before = await alice.e2e.safetyNumber(added.identity);
  const peer = `contact:${added.identity}`;
  const history = await History.open('space', 0, key);
  await history.add({ peer, text: 'γεια', mine: true, at: 1, tag: newTag() });
  await history.add({ peer: 'contact:other', text: 'stays', mine: true, at: 2, tag: newTag() });

  const hiddenKey = randomBytes(32);
  // Into the third place of the space's hidden chats.
  const holder = hiddenHolder(2);
  const hidden = { e2e: await E2E.open(holder, 0, hiddenKey), history: await History.open(holder, 0, hiddenKey) };
  await moveChat(added.identity, { e2e: alice.e2e, history, archive: null }, hidden);

  // Nothing of it stays in the space, opened again from what it keeps.
  assert.deepEqual((await E2E.open('space', 0, key)).contacts(), []);
  assert.deepEqual((await History.open('space', 0, key)).messages().map((m) => m.text), ['stays']);
  // The hidden chats have it all, and the safety number is the one Bob compared.
  const reopened = await E2E.open(holder, 0, hiddenKey);
  assert.equal(reopened.contacts()[0].name, 'Bob');
  assert.equal(await reopened.safetyNumber(added.identity), before);
  assert.equal(await bob.e2e.safetyNumber(hello.identity), before);
  assert.deepEqual((await History.open(holder, 0, hiddenKey)).messages().map((m) => m.text), ['γεια']);
  // Nothing of it in the first place.
  assert.deepEqual((await E2E.open('hidden', 0, hiddenKey)).contacts(), []);

  // Told from the hidden chats' queue, Bob writes there, and the hidden chats read it.
  const queue = sender();
  const told = await reopened.seal(added.identity, '', queue);
  message(await bob.e2e.receive(told.packet));
  const answer = await bob.e2e.seal(hello.identity, 'εδώ είμαι', bob.from);
  assert.equal(answer.sender, queue);
  assert.equal(message(await reopened.receive(answer.packet)).text, 'εδώ είμαι');
});

t('a chat moves into another space whole, with the same safety number, and goes on there', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('hidden', 1);
  const added = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(added.identity);
  await alice.e2e.rename(added.identity, 'Bob');
  const before = await alice.e2e.safetyNumber(added.identity);
  const peer = `contact:${added.identity}`;
  const history = await History.open('space', 0, key);
  await history.add({ peer, text: 'γεια', mine: true, at: 1, tag: newTag() });

  // Into the space another password opens, which has an identity key of its own.
  const otherKey = randomBytes(32);
  const other = { e2e: await E2E.open('space', 2, otherKey), history: await History.open('space', 2, otherKey) };
  assert.notEqual(other.e2e.identityHex(), alice.e2e.identityHex());
  await moveChat(added.identity, { e2e: alice.e2e, history, archive: null }, other);
  assert.deepEqual((await E2E.open('space', 0, key)).contacts(), []);
  assert.deepEqual((await History.open('space', 0, key)).messages(), []);
  const reopened = await E2E.open('space', 2, otherKey);
  assert.equal(reopened.contacts()[0].name, 'Bob');
  assert.equal(await reopened.safetyNumber(added.identity), before);
  assert.deepEqual((await History.open('space', 2, otherKey)).messages().map((m) => m.text), ['γεια']);

  // Told from that space's queue, Bob writes there, and that space reads it.
  const queue = sender();
  message(await bob.e2e.receive((await reopened.seal(added.identity, '', queue)).packet));
  const answer = await bob.e2e.seal(hello.identity, 'εδώ είμαι', bob.from);
  assert.equal(answer.sender, queue);
  assert.equal(message(await reopened.receive(answer.packet)).text, 'εδώ είμαι');
});

t('a chat never moves into chats that have one of their own with the same contact, but a move cut short goes on', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('hidden', 1);
  const added = await alice.e2e.addContact(bob.code, alice.from);
  await alice.e2e.firstSent(added.identity);
  const history = await History.open('space', 0, key);
  await history.add({ peer: `contact:${added.identity}`, text: 'εδώ', mine: true, at: 1, tag: newTag() });

  // Another space knows Bob by its own identity key, in a chat of its own.
  const otherKey = randomBytes(32);
  const other = await chat('space', 2, otherKey);
  await other.e2e.addContact(bob.code, other.from);
  await other.e2e.rename(added.identity, 'Bob there');
  const otherHistory = await History.open('space', 2, otherKey);
  await otherHistory.add({ peer: `contact:${added.identity}`, text: 'εκεί', mine: true, at: 1, tag: newTag() });
  await assert.rejects(
    moveChat(added.identity, { e2e: alice.e2e, history, archive: null }, { e2e: other.e2e, history: otherHistory }),
    /a chat of their own there already/,
  );
  // Both stay as they were.
  assert.equal((await E2E.open('space', 0, key)).contacts().length, 1);
  assert.deepEqual((await History.open('space', 0, key)).messages().map((m) => m.text), ['εδώ']);
  const there = await E2E.open('space', 2, otherKey);
  assert.equal(there.contacts()[0].name, 'Bob there');
  assert.equal(there.record(added.identity)?.ownIdentity ?? '', '');
  assert.deepEqual((await History.open('space', 2, otherKey)).messages().map((m) => m.text), ['εκεί']);

  // A move cut short after putting the chat in leaves the same chat in both: moving again ends it.
  const thirdKey = randomBytes(32);
  const third = { e2e: await E2E.open('space', 3, thirdKey), history: await History.open('space', 3, thirdKey) };
  const contact = alice.e2e.record(added.identity)!;
  await third.e2e.putIn({ ...contact, ownIdentity: alice.e2e.identityHex() }, alice.e2e.saidTo(added.identity));
  await moveChat(added.identity, { e2e: alice.e2e, history, archive: null }, third);
  assert.deepEqual((await E2E.open('space', 0, key)).contacts(), []);
  assert.equal((await E2E.open('space', 3, thirdKey)).contacts().length, 1);
  assert.deepEqual((await History.open('space', 3, thirdKey)).messages().map((m) => m.text), ['εδώ']);
});

t('a chat moving into hidden chats takes its imported chats along, and brings them back', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('hidden', 1);
  const added = await alice.e2e.addContact(bob.code, alice.from);
  await alice.e2e.firstSent(added.identity);
  const history = await History.open('space', 0, key);
  const imported = (title: string): Omit<ArchivedChat, 'id'> => ({ source: 'telegram', title, me: 'Nekten', added: 1, skipped: 0, contact: '', messages: [[1, 'Nekten', title, '']] });
  const archive = await Archive.open('space', 0, key);
  const [theirs, other] = await archive.add([imported('ours'), imported('another')]);
  await archive.link(theirs, added.identity);
  // The space's imported chats as a screen opened them before the move.
  const before = await Archive.open('space', 0, key);

  const hiddenKey = randomBytes(32);
  const holder = hiddenHolder(1);
  const hidden = { e2e: await E2E.open(holder, 0, hiddenKey), history: await History.open(holder, 0, hiddenKey), archive: await Archive.open(holder, 0, hiddenKey) };
  await moveChat(added.identity, { e2e: alice.e2e, history, archive }, hidden);

  // There, kept only in its chat; gone from the space, where the other stays.
  assert.deepEqual(
    (await Archive.open(holder, 0, hiddenKey)).chats().map((c) => [c.id, c.title, c.contact, c.inChat]),
    [[theirs, 'ours', added.identity, true]],
  );
  assert.deepEqual((await Archive.open('space', 0, key)).chats().map((c) => c.id), [other]);
  // A change made from what was opened before never puts it back in the space.
  await before.link(other, '');
  assert.deepEqual((await Archive.open('space', 0, key)).chats().map((c) => c.id), [other]);
  assert.deepEqual(before.chats().map((c) => c.id), [other]);

  // Moved back, it comes back with it.
  await moveChat(added.identity, hidden, { e2e: alice.e2e, history, archive });
  assert.deepEqual((await Archive.open(holder, 0, hiddenKey)).chats(), []);
  const back = await Archive.open('space', 0, key);
  assert.deepEqual(back.linkedChats(added.identity).map((c) => c.id), [theirs]);
  assert.deepEqual(back.chats().map((c) => c.id).sort(), [theirs, other].sort());
});

t('a chat locked with a PIN keeps it when saved, in hidden chats, where it asks nothing, and back in the space', async () => {
  setHardCost({ m: 64, t: 1 });
  try {
    const key = randomBytes(32);
    const alice = await chat('space', 0, key);
    const bob = await chat('hidden', 1);
    const added = await alice.e2e.addContact(bob.code, alice.from);
    assert.equal(alice.e2e.contacts()[0].locked, false);
    await alice.e2e.setPin(added.identity, await makeChatPin('2468'));
    const space = await E2E.open('space', 0, key);
    assert.equal(space.contacts()[0].locked, true);
    assert.equal(await opensChat('2468', space.pinOf(added.identity)!), true);
    assert.equal(await opensChat('1357', space.pinOf(added.identity)!), false);

    const history = await History.open('space', 0, key);
    const hiddenKey = randomBytes(32);
    const holder = hiddenHolder(1);
    const hidden = { e2e: await E2E.open(holder, 0, hiddenKey), history: await History.open(holder, 0, hiddenKey) };
    await moveChat(added.identity, { e2e: space, history, archive: null }, hidden);
    // There the chat says it has one, which the hidden chats screen does not ask.
    const there = await E2E.open(holder, 0, hiddenKey);
    assert.equal(there.contacts()[0].locked, true);
    // Back in the space, the same PIN asks again.
    await moveChat(added.identity, { e2e: there, history: await History.open(holder, 0, hiddenKey), archive: null }, { e2e: space, history });
    const back = await E2E.open('space', 0, key);
    assert.equal(back.contacts()[0].locked, true);
    assert.equal(await opensChat('2468', back.pinOf(added.identity)!), true);
    // Taken off, it is gone.
    await back.setPin(added.identity, null);
    assert.equal((await E2E.open('space', 0, key)).contacts()[0].locked, false);
    assert.equal(back.pinOf(added.identity), null);
  } finally {
    setHardCost(null);
  }
});

const HOUR = 60 * 60_000;

t('deleting a contact has the queue move in the same save; a first packet from them is a request, from someone blocked dropped', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(bobId);
  assert.equal(alice.e2e.moveDue(), 0);
  const before = Date.now();
  await alice.e2e.deleteContact(bobId);
  const kept = await loadE2EData('space', 0, alice.key);
  assert.ok((kept.moveDue ?? 0) >= before);
  assert.equal(kept.contacts.length, 0);
  assert.deepEqual(alice.e2e.blocked(), []);
  // A move that started before it leaves it due; one after it is done.
  await alice.e2e.moveDone(before - 1);
  assert.ok(alice.e2e.moveDue() > 0);
  await alice.e2e.moveDone(Date.now());
  assert.equal(alice.e2e.moveDue(), 0);

  // Bob, with Alice's link still, asks to talk again: a request.
  const again = async () => {
    await bob.e2e.removeContact(hello.identity);
    await bob.e2e.addContact(alice.code, bob.from);
    return alice.e2e.receive(bob.e2e.pending()[0].first);
  };
  assert.equal(message(await again()).request, true);
  // Blocked: what he sends is dropped, a request too, until unblocked. A request knows only the
  // queue the link names: once that is a queue of its own, after the first move, blocking it moves
  // nothing (before it, see below).
  alice.e2e.setLinkOwn(false);
  await alice.e2e.deleteContact(bobId, { block: true });
  assert.equal(alice.e2e.moveDue(), 0);
  assert.deepEqual(
    alice.e2e.blocked().map((b) => b.identity),
    [bobId],
  );
  assert.equal(alice.e2e.isBlocked(bobId), true);
  assert.deepEqual(await again(), { kind: 'refused', reason: 'blocked' });
  assert.deepEqual(alice.e2e.contacts(), []);
  // Kept as blocked when the chat opens again.
  const reopened = await E2E.open('space', 0, alice.key);
  assert.equal(reopened.isBlocked(bobId), true);
  await reopened.unblock(bobId);
  assert.deepEqual(reopened.blocked(), []);
  await bob.e2e.removeContact(hello.identity);
  await bob.e2e.addContact(alice.code, bob.from);
  assert.equal(message(await reopened.receive(bob.e2e.pending()[0].first)).request, true);
  // Before the first move the link names the own queue, so whoever asked knew it: refused, nothing
  // moves; blocked, the own queue does.
  await reopened.removeContact(bobId);
  assert.equal(reopened.moveDue(), 0);
  await bob.e2e.removeContact(hello.identity);
  await bob.e2e.addContact(alice.code, bob.from);
  assert.equal(message(await reopened.receive(bob.e2e.pending()[0].first)).request, true);
  await reopened.deleteContact(bobId, { block: true });
  assert.ok(reopened.moveDue() > 0);
});

t('a message from a queue made earlier keeps where the contact reads; one that says no `qa` takes it, as 0.1.16', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(bobId);
  const aliceId = hello.identity;
  const write = async (text: string, from: string) => message(await alice.e2e.receive((await bob.e2e.seal(aliceId, text, from)).packet));
  // Bob's queue was made at 20h: Alice writes there.
  const newer = sender();
  bob.e2e.setQueueAge(20 * HOUR, newer);
  await write('one', newer);
  assert.equal(alice.e2e.record(bobId)!.sender, newer);
  assert.equal(alice.e2e.record(bobId)!.qa, 20 * HOUR);
  // A late copy from a queue made at 10h opens, and changes nothing of where he reads.
  const older = sender();
  bob.e2e.setQueueAge(10 * HOUR, older);
  assert.equal((await write('late', older)).text, 'late');
  assert.equal(alice.e2e.record(bobId)!.sender, newer);
  // A screen that seals with a queue it moved away from says the one it moved to.
  const newest = sender();
  bob.e2e.setQueueAge(30 * HOUR, newest);
  await write('moved', newer);
  assert.equal(alice.e2e.record(bobId)!.sender, newest);
  // An Erevos before R4 says no `qa`: it is taken, as it always was.
  bob.e2e.setQueueAge(0);
  await write('from before', older);
  assert.equal(alice.e2e.record(bobId)!.sender, older);
});

t('a packet from an old queue opens in a kept contact’s conversation, says nothing of the new queue, and tries none of those whose packets come sealed', async () => {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  let opens = 0;
  const useCore = (count: boolean) =>
    setCore(
      Object.fromEntries(
        Object.entries(wasm).map(([name, call]) => [
          name,
          async (...args: never[]) => {
            if (count && name === 'conversationOpen') opens++;
            return call(...args);
          },
        ]),
      ) as unknown as Core,
    );
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(bobId);
  alice.e2e.setQueueAge(10 * HOUR, alice.from);
  const fromBob = async (text: string) => (await bob.e2e.seal(hello.identity, text, bob.from)).packet;
  assert.equal(message(await alice.e2e.receive(await fromBob('old'), { old: true })).text, 'old');
  assert.equal(alice.e2e.record(bobId)!.onNew, undefined);
  assert.equal(message(await alice.e2e.receive(await fromBob('new'), { onOwn: alice.from })).text, 'new');
  assert.equal(alice.e2e.record(bobId)!.onNew, 10 * HOUR);
  assert.equal(alice.e2e.heardSince(), 10 * HOUR);

  // Carol writes to Dave; Alice's contact Bob sends sealed from now on.
  const carol = await chat('space', 2);
  const dave = await chat('space', 3);
  const { identity: daveId } = await carol.e2e.addContact(dave.code, carol.from);
  message(await dave.e2e.receive(carol.e2e.pending()[0].first));
  await carol.e2e.firstSent(daveId);
  const strange = (await carol.e2e.seal(daveId, 'not for Alice', carol.from)).packet;
  const data = await loadE2EData('space', 0, alice.key);
  await saveE2EData('space', 0, alice.key, { ...data, contacts: data.contacts.map((c) => ({ ...c, sealsIn: true })) });
  const sealing = await E2E.open('space', 0, alice.key);
  try {
    useCore(true);
    assert.deepEqual(await sealing.receive(strange, { old: true }), { kind: 'refused', reason: 'unknown' });
    assert.equal(opens, 0);
    assert.deepEqual(await sealing.receive(strange), { kind: 'refused', reason: 'unknown' });
    assert.equal(opens, 1);
  } finally {
    useCore(false);
  }
});

t('a chat moved between the space and its hidden chats says a later `qa` than the other did, both ways, so the contact follows, and a late copy never takes them back', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const added = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(added.identity);
  const history = await History.open('space', 0, key);
  const where = () => bob.e2e.record(hello.identity)!.sender;
  const told = async (e2e: E2E, from: string) => message(await bob.e2e.receive((await e2e.seal(added.identity, '', from)).packet));
  // The space's own queue was made at 100h: Bob writes there.
  const spaceQueue = sender();
  alice.e2e.setQueueAge(100 * HOUR, spaceQueue);
  await told(alice.e2e, spaceQueue);
  assert.equal(where(), spaceQueue);
  await alice.e2e.queueTold(added.identity, 100 * HOUR);
  // One the space holds for later, sealed before the move: it comes after.
  const late = await alice.e2e.seal(added.identity, 'late', spaceQueue);

  // Into hidden chats whose queue was made earlier, at 50h, and moves at 51h: Bob follows each.
  const hiddenKey = randomBytes(32);
  const holder = hiddenHolder(1);
  const hidden = { e2e: await E2E.open(holder, 0, hiddenKey), history: await History.open(holder, 0, hiddenKey) };
  const hiddenQueue = sender();
  hidden.e2e.setQueueAge(50 * HOUR, hiddenQueue);
  await moveChat(added.identity, { e2e: alice.e2e, history, archive: null }, hidden);
  // When the space told him its queue, and heard him on it, is nothing to the hidden chats' own.
  assert.equal(hidden.e2e.record(added.identity)!.told, undefined);
  await told(hidden.e2e, hiddenQueue);
  assert.equal(where(), hiddenQueue);
  const moved = sender();
  hidden.e2e.setQueueAge(51 * HOUR, moved);
  await told(hidden.e2e, moved);
  assert.equal(where(), moved);
  // The space's late one opens, and leaves where he writes as it is.
  assert.equal(message(await bob.e2e.receive(late.packet)).text, 'late');
  assert.equal(where(), moved);

  // The hidden chats move past the space's 100h, then the chat goes back into the space, whose
  // queue still says 100h: Bob follows it there too.
  const later = sender();
  hidden.e2e.setQueueAge(300 * HOUR, later);
  await told(hidden.e2e, later);
  assert.equal(where(), later);
  await moveChat(added.identity, { e2e: hidden.e2e, history: hidden.history, archive: null }, { e2e: alice.e2e, history });
  await told(alice.e2e, spaceQueue);
  assert.equal(where(), spaceQueue);
  // The space's own moves after reach him too.
  const next = sender();
  alice.e2e.setQueueAge(101 * HOUR, next);
  await told(alice.e2e, next);
  assert.equal(where(), next);
});

t('a chat moved into a place whose queue is older says ever later a `qa` with each move there, so a late copy from before one of them never takes the contact back', async () => {
  const key = randomBytes(32);
  const alice = await chat('space', 0, key);
  const bob = await chat('space', 1);
  const added = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(added.identity);
  const history = await History.open('space', 0, key);
  const where = () => bob.e2e.record(hello.identity)!.sender;
  const sealed = async (e2e: E2E, from: string) => (await e2e.seal(added.identity, '', from)).packet;
  const told = async (e2e: E2E, from: string) => message(await bob.e2e.receive(await sealed(e2e, from)));
  const spaceQueue = sender();
  alice.e2e.setQueueAge(100 * HOUR, spaceQueue);
  await told(alice.e2e, spaceQueue);
  // Into hidden chats whose queue was made at 50h: they say later than the space's 100h.
  const holder = hiddenHolder(1);
  const hiddenKey = randomBytes(32);
  const hidden = { e2e: await E2E.open(holder, 0, hiddenKey), history: await History.open(holder, 0, hiddenKey) };
  const first = sender();
  hidden.e2e.setQueueAge(50 * HOUR, first);
  await moveChat(added.identity, { e2e: alice.e2e, history, archive: null }, hidden);
  await told(hidden.e2e, first);
  assert.equal(where(), first);
  // Sealed there before each move, and held: each comes after the move.
  const late = [await sealed(hidden.e2e, first)];
  const second = sender();
  hidden.e2e.setQueueAge(51 * HOUR, second);
  await told(hidden.e2e, second);
  assert.equal(where(), second);
  late.push(await sealed(hidden.e2e, second));
  const third = sender();
  hidden.e2e.setQueueAge(52 * HOUR, third);
  await told(hidden.e2e, third);
  assert.equal(where(), third);
  // Each says an earlier `qa` than the move after it: they open, and leave where he writes as it is.
  for (const packet of late) {
    message(await bob.e2e.receive(packet));
    assert.equal(where(), third);
  }
  assert.equal(bob.e2e.record(hello.identity)!.qa, 100 * HOUR + 1 + 2 * HOUR);
});

t('junk that looks like a first packet is refused, never thrown, so the look counts it', async () => {
  const alice = await chat('space', 0);
  for (const bytes of [Uint8Array.of(1, 1), Uint8Array.of(1, 1, 0xff, 0xff, 0xff, 0xff), Uint8Array.from([1, 1, ...randomBytes(200)]), Uint8Array.of(1, 2, 3), Uint8Array.of(9)]) {
    const received = await alice.e2e.receive(bytes);
    assert.equal(received.kind, 'refused');
    assert.equal(tookOf(received).junk, true);
  }
});

t('the link of someone blocked adds no one until they are unblocked, and says so before anything is made for it', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity } = await alice.e2e.addContact(bob.code, alice.from);
  await alice.e2e.rename(identity, 'Bob');
  await alice.e2e.deleteContact(identity, { block: true });
  await assert.rejects(alice.e2e.addContact(bob.code, alice.from), (error) => error instanceof BlockedContactError && error.identity === identity && error.message.includes('Bob'));
  assert.deepEqual(alice.e2e.contacts(), []);
  // Said before anything is made to add them, as a queue or a place lent on their relay; anyone else's goes on.
  await assert.rejects(alice.e2e.refuseBlocked(bob.code), (error) => error instanceof BlockedContactError && error.identity === identity);
  await alice.e2e.refuseBlocked((await chat('space', 2)).code);
  await alice.e2e.unblock(identity);
  await alice.e2e.refuseBlocked(bob.code);
  assert.equal((await alice.e2e.addContact(bob.code, alice.from)).added, true);
});

t('a contact is heard on the own queue only from the one it is now, not from one a look read before a move', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(bobId);
  const fromBob = async (text: string) => (await bob.e2e.seal(hello.identity, text, bob.from)).packet;
  const first = sender();
  alice.e2e.setQueueAge(10 * HOUR, first);
  // The queue moved meanwhile: what the look read on the one before is not heard on the new one.
  alice.e2e.setQueueAge(20 * HOUR, sender());
  assert.equal(message(await alice.e2e.receive(await fromBob('before'), { onOwn: first })).text, 'before');
  assert.equal(alice.e2e.record(bobId)!.onNew, undefined);
});

t('the name a chat goes by reaches its accepted contacts once, encrypted, and shows while they gave it none', async () => {
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { identity: bobId } = await alice.e2e.addContact(bob.code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(bobId);
  const aliceId = hello.identity;
  // A request not accepted is told nothing.
  await bob.e2e.setMyName('  Bob‮ ');
  assert.equal(bob.e2e.myName(), 'Bob');
  assert.equal(bob.e2e.keysDue().includes(aliceId), false);
  // Bob accepts by writing; then his name is due, once.
  message(await alice.e2e.receive((await bob.e2e.seal(aliceId, 'hi', bob.from)).packet));
  assert.equal(bob.e2e.keysDue().includes(aliceId), true);
  const told = await bob.e2e.seal(aliceId, '', bob.from, { keys: true });
  await bob.e2e.keysGiven(aliceId);
  assert.equal(bob.e2e.keysDue().includes(aliceId), false);
  await alice.e2e.receive(told.packet);
  const kept = () => alice.e2e.contacts().find((c) => c.identity === bobId)!;
  assert.deepEqual([kept().name, kept().ownName, kept().said], ['Bob', '', 'Bob']);
  // A name Alice gives him wins, and stays when he changes his.
  await alice.e2e.rename(bobId, 'Μπάμπης');
  assert.deepEqual([kept().name, kept().said], ['Μπάμπης', 'Bob']);
  await bob.e2e.setMyName('Robert');
  const again = await bob.e2e.seal(aliceId, '', bob.from, { keys: true });
  await bob.e2e.keysGiven(aliceId);
  await alice.e2e.receive(again.packet);
  assert.deepEqual([kept().name, kept().said], ['Μπάμπης', 'Robert']);
  // Taking his name away says so too.
  await alice.e2e.rename(bobId, '');
  await bob.e2e.setMyName('');
  assert.equal(bob.e2e.keysDue().includes(aliceId), true);
  const none = await bob.e2e.seal(aliceId, '', bob.from, { keys: true });
  await bob.e2e.keysGiven(aliceId);
  await alice.e2e.receive(none.packet);
  assert.deepEqual([kept().name, kept().said], ['', '']);
  // An ordinary message says nothing of it.
  await bob.e2e.setMyName('Bob');
  const plain = await bob.e2e.seal(aliceId, 'still me', bob.from);
  await alice.e2e.receive(plain.packet);
  assert.equal(kept().said, '');
  // Kept as the chat is.
  const reopened = await E2E.open('space', 1, bob.key);
  assert.equal(reopened.myName(), 'Bob');
});
