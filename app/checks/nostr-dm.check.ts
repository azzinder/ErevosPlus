// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Chats with other Nostr apps (lib/nostr-dm.ts, lib/nostr-dm-store.ts, docs/nostr-chats.md), with
// the real core built to WebAssembly (crates/erevos-nostr chat) and relays played here
// (checks/nostr-relay.ts): keys as people write them; NIP-17's own example message opens, for its
// reader and for its sender's copy; a space and someone on another app write both ways through
// each other's inbox relays, the space's guarded one asking who reads (NIP-42) and told only by
// the connection that reads; relays keep only wraps signed by keys made for them, with times set
// back; someone who names no inbox gets nothing; the space's own other app reads both sides; a chat
// survives the space closing and opening again, without anything twice; a group of three, each
// getting a wrap of their own, with its name and reactions; a photo encrypted on the phone, put on
// a Blossom server played here under a key made for the upload, and opened by the others; what is
// taken back in a wrap (NIP-09), only by its writer, and a reaction changed or taken back; pins and
// deleting on this device; messages forwarded with their photo sent anew; a sticker sent as a photo.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';

import { setCurrentSpace } from '../lock/keys';
import { setCore, type Core } from '../lib/core';
import { fromBase64, randomBytes, sha256Bytes, toHex, utf8Decode, utf8Encode } from '../lib/crypto';
import {
  addMessage,
  BACKDATE,
  DEFAULT_INBOX,
  CHATS_MOST,
  chatCore,
  FOLLOWS_RELAYS,
  followsLook,
  GROUP_MOST,
  groupKey,
  KEEP_MESSAGES,
  markRead,
  inboxEvent,
  LOOKUP_RELAYS,
  newNostrDm,
  npubOf,
  nsecOf,
  otherInboxes,
  pinHere,
  POSTS_AT_ONCE,
  postsOf,
  profileEvent,
  readKey,
  removeHere,
  sameRelays,
  setInbox,
  shortMentions,
  shortNpub,
  signed,
  takeWrap,
  wrapMessage,
  wrapText,
  type NostrDmState,
} from '../lib/nostr-dm';
import { openFile, setNostrHttp, type NostrDmFile } from '../lib/nostr-files';
import { inboxParts, nostrInboxRows, showsIn } from '../lib/inbox';
import { lookUpNip05, NostrRelay, setNostrOpen } from '../lib/nostr-dm-net';
import { networkNotify, networkUnreadAt, onNetworkMessage, onNetworkRead } from '../lib/network-notices';
import {
  nostrDmBring,
  nostrDmDelete,
  nostrDmFile,
  nostrDmFollows,
  nostrDmForward,
  nostrDmForgetChat,
  nostrDmMake,
  nostrDmNewGroup,
  nostrDmPin,
  nostrDmPosts,
  nostrDmReact,
  nostrDmSendFile,
  nostrDmSendSticker,
  nostrDmSetFileServers,
  nostrDmSetSubject,
  nostrDmNow,
  nostrDmRead,
  nostrDmSend,
  nostrDmSetNotify,
  nostrDmSetInbox,
  nostrDmSetName,
  nostrDmStart,
  nostrDmUnread,
  nostrDmUnreact,
  runNostrDm,
  sayFeedReport,
  sayFollowsReport,
  stopNostrDm,
} from '../lib/nostr-dm-store';
import { FakeRelay } from './nostr-relay';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built) && typeof (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>).nostrChat === 'function';
if (!coreReady) console.log('Skipping the Nostr chat checks: build the core first with node checks/build-core.mjs');

const relays = new Map<string, FakeRelay>();
const relay = (url: string, options?: { guarded?: boolean; refuses?: boolean }) => {
  const made = new FakeRelay(url, options);
  relays.set(url, made);
  return made;
};
const aliceInbox = relay('wss://inbox.alice.example', { guarded: true });
const bobInbox = relay('wss://inbox.bob.example');
const carolInbox = relay('wss://inbox.carol.example');
// Where another app of Alice's key writes (her NIP-65 list), which Erevos does not read itself.
const aliceOutbox = relay('wss://outbox.alice.example');
// The relays names and lists are looked up on: one keeps them, the others are away.
const index = relay(LOOKUP_RELAYS[0]);
for (const url of LOOKUP_RELAYS.slice(1)) relay(url, { refuses: true });

before(() => {
  if (!coreReady) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => fn(...args)])) as unknown as Core);
  setNostrOpen(async (url) => {
    const found = relays.get(url);
    if (!found) throw new Error(`No relay at ${url}`);
    return found.link();
  });
});

after(() => {
  stopNostrDm();
  setNostrOpen(null);
  setCore(null);
});

async function until(done: () => boolean, what: string, ms = 5000): Promise<void> {
  const end = Date.now() + ms;
  while (!done()) {
    if (Date.now() > end) throw new Error(`Waited in vain for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

// An old private message (NIP-04) as other apps make it, with Node's own crypto: the x coordinate of
// the secp256k1 Diffie-Hellman point as the AES-256-CBC key, PKCS#7, `<base64>?iv=<base64>`.
async function oldMessage(from: NostrDmState, to: string, words: string, at: number) {
  const { createCipheriv, createECDH, randomBytes: bytes } = await import('node:crypto');
  const ecdh = createECDH('secp256k1');
  ecdh.setPrivateKey(Buffer.from(from.secret, 'hex'));
  const other = from.public === to ? from.public : to;
  const key = ecdh.computeSecret(Buffer.from(`02${other}`, 'hex'));
  const iv = bytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const content = `${Buffer.concat([cipher.update(words, 'utf8'), cipher.final()]).toString('base64')}?iv=${iv.toString('base64')}`;
  return signed(from, 4, [['p', to]], content, at);
}

const vector = (name: string) => JSON.parse(readFileSync(new URL(`../../crates/erevos-nostr/tests/${name}`, import.meta.url), 'utf8')) as unknown;

test('Nostr keys are read as people write them', { skip: !coreReady }, async () => {
  const npub = await readKey('nostr:npub10elfcs4fr0l0r8af98jlmgdh9c8tcxjvz9qkw038js35mp4dma8qzvjptg');
  assert.equal(npub.public, '7e7e9c42a91bfef19fa929e5fda1b72e0ebc1a4c1141673e2794234d86addf4e');
  const profile = await readKey('nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p');
  assert.deepEqual(profile.relays, ['wss://r.x.com', 'wss://djbas.sadkb.com']);
  await assert.rejects(readKey('npub10elfcs4fr0l0r8af98jlmgdh9c8tcxjvz9qkw038js35mp4dma8qzvjpth'), /typo/);
  await assert.rejects(readKey('hello'), /npub1/);
  assert.equal(shortNpub('npub10elfcs4fr0l0r8af98jlmgdh9c8tcxjvz9qkw038js35mp4dma8qzvjptg'), 'npub10elf…jptg');
  // Shown at once, the same as the core writes it.
  assert.equal(npubOf(npub.public), 'npub10elfcs4fr0l0r8af98jlmgdh9c8tcxjvz9qkw038js35mp4dma8qzvjptg');
  for (let i = 0; i < 20; i += 1) {
    const key = (await newNostrDm()).public;
    assert.equal(npubOf(key), (await chatCore<{ npub: string }>('npub', { public: key })).npub);
  }
});

test('a look-up of the follow list that found no one says why, whose list, and how each relay answered', () => {
  const key = '7e7e9c42a91bfef19fa929e5fda1b72e0ebc1a4c1141673e2794234d86addf4e';
  const relays = [
    { url: 'wss://a.example', how: 'all' as const },
    { url: 'wss://b.example/', how: 'late' as const },
    { url: 'wss://c.example', how: 'closed' as const, why: 'blocked: no Tor here' },
    { url: 'wss://d.example', how: 'unreached' as const, why: 'cannot reach d.example through Tor' },
    { url: 'wss://e.example', how: 'all' as const },
  ];
  assert.deepEqual(sayFollowsReport({ relays, lists: 0, checked: 0, people: 0 }, key), [
    'No list of people you follow was found on your servers.',
    'Looked for the list of npub10elf…jptg.',
    'Answered: a.example, e.example.',
    'Too slow: b.example.',
    'Closed: c.example (blocked: no Tor here).',
    'Not reached: d.example.',
  ]);
  assert.equal(sayFollowsReport({ relays, lists: 2, checked: 0, people: 0 }, key)[0], 'Lists of people you follow were found, but none passed the signature check.');
  assert.equal(sayFollowsReport({ relays, lists: 1, checked: 1, people: 0 }, key)[0], 'Your newest list of people you follow has no one in it.');
  const none = sayFollowsReport({ relays: relays.filter((r) => r.how !== 'all'), lists: 0, checked: 0, people: 0 }, key);
  assert.equal(none[0], 'No server answered. Try again in a while.');
  assert.ok(!none.some((line) => line.startsWith('Answered')));
});

test("the Public tab's newest page with no post says whether posts came, or none did, and how each relay answered", () => {
  const relays = [
    { url: 'wss://a.example', how: 'all' as const },
    { url: 'wss://d.example', how: 'unreached' as const, why: 'The Nostr server did not answer.' },
  ];
  assert.deepEqual(sayFeedReport({ follows: 40, came: 0, relays }), ['You follow 40 people, but no server sent a post of theirs.', 'Answered: a.example.', 'Not reached: d.example.']);
  assert.equal(sayFeedReport({ follows: 1, came: 0, relays })[0], 'You follow 1 person, but no server sent a post of theirs.');
  assert.equal(sayFeedReport({ follows: 40, came: 12, relays })[0], '12 posts came from the servers, but none could be shown.');
});

test("NIP-17's own example opens, for its reader and as its sender's copy", { skip: !coreReady }, async () => {
  const receiver = await newNostrDm((await readKey('nsec12ywtkplvyq5t6twdqwwygavp5lm4fhuang89c943nf2z92eez43szvn4dt')).secret);
  const sender = await newNostrDm((await readKey('nsec1w8udu59ydjvedgs3yv5qccshcj8k05fh3l60k9x57asjrqdpa00qkmr89m')).secret);
  assert.equal(await takeWrap(receiver, vector('nip17-receiver.json')), sender.public);
  assert.deepEqual(
    receiver.chats[sender.public].messages.map((m) => [m.mine, m.text]),
    [[false, 'Hola, que tal?']],
  );
  assert.equal(receiver.chats[sender.public].unread, 1);
  // Again: taken once.
  assert.equal(await takeWrap(receiver, vector('nip17-receiver.json')), null);
  assert.equal(await takeWrap(sender, vector('nip17-sender.json')), receiver.public);
  assert.deepEqual(
    sender.chats[receiver.public].messages.map((m) => [m.mine, m.text]),
    [[true, 'Hola, que tal?']],
  );
  // Not for this key: let be.
  assert.equal(await takeWrap(sender, vector('nip17-receiver.json')), null);
  assert.equal(Object.keys(sender.chats).length, 1);
});

test('a message to three people makes a group, one to too many is let be, a note to oneself is kept', { skip: !coreReady }, async () => {
  const me = await newNostrDm();
  const a = await newNostrDm();
  const b = await newNostrDm();
  const group = await chatCore<{ wraps: { to: string; event: string }[] }>('wrap', {
    secret: a.secret,
    rumor: { kind: 14, created_at: 1, tags: [['p', me.public], ['p', b.public], ['subject', ' Εμείς ']], content: 'all of us' },
    to: [me.public],
    now: 1_800_000_000,
  });
  const key = groupKey([me.public, a.public, b.public]);
  assert.equal(await takeWrap(me, JSON.parse(group.wraps[0].event)), key);
  assert.deepEqual(me.chats[key].members, [a.public, b.public].sort());
  assert.equal(me.chats[key].subject, 'Εμείς');
  assert.deepEqual(
    me.chats[key].messages.map((m) => [m.from, m.text]),
    [[a.public, 'all of us']],
  );
  // More than GROUP_MOST others: not a chat.
  const many = await Promise.all(Array.from({ length: GROUP_MOST }, async () => (await newNostrDm()).public));
  const crowd = await chatCore<{ wraps: { to: string; event: string }[] }>('wrap', {
    secret: a.secret,
    rumor: { kind: 14, created_at: 2, tags: [me.public, ...many].map((p) => ['p', p]), content: 'everyone' },
    to: [me.public],
    now: 1_800_000_000,
  });
  assert.equal(await takeWrap(me, JSON.parse(crowd.wraps[0].event)), null);
  assert.equal(Object.keys(me.chats).length, 1);
  // A time to come is shown as now.
  const later = await chatCore<{ wraps: { to: string; event: string }[] }>('wrap', {
    secret: a.secret,
    rumor: { kind: 14, created_at: 4_000_000_000, tags: [['p', me.public]], content: 'from the future' },
    to: [me.public],
    now: 1_800_000_000,
  });
  assert.equal(await takeWrap(me, JSON.parse(later.wraps[0].event), 1_800_000_000_000), a.public);
  assert.equal(me.chats[a.public].messages[0].at, 1_800_000_000_000);
  const note = await wrapText(me, me.public, 'a note');
  assert.equal(await takeWrap(me, note.theirs), me.public);
  assert.equal(me.chats[me.public].messages[0].mine, true);
});

test("taking back in a wrap (NIP-09): only its writer's goes, and stays away should it come after; pins and deleting here are this device's", { skip: !coreReady }, async () => {
  const me = await newNostrDm();
  const ann = await newNostrDm();
  const bob = await newNostrDm();
  const key = groupKey([me.public, ann.public, bob.public]);
  // A rumor of the group from one of us, wrapped for me: the same words at the same time are the same rumor, in a new wrap.
  const wrapped = async (from: NostrDmState, kind: number, tags: string[][], content: string, at: number) => {
    const others = [me, ann, bob].filter((p) => p !== from).map((p) => ['p', p.public]);
    const made = await chatCore<{ rumor: { id: string }; wraps: { to: string; event: string }[] }>('wrap', {
      secret: from.secret,
      rumor: { kind, created_at: 1_700_000_000 + at, tags: [...others, ...tags], content },
      to: [me.public],
      now: 1_700_100_000,
    });
    return { id: made.rumor.id, wrap: JSON.parse(made.wraps[0].event) as unknown };
  };
  const chat = () => me.chats[key];
  const texts = () => chat().messages.map((m) => m.text);

  const hello = await wrapped(ann, 14, [], 'hello', 1);
  const yo = await wrapped(bob, 14, [], 'yo', 2);
  const mine = await wrapped(me, 14, [], 'mine', 3);
  // Ours first: theirs that come after it are not read yet (one of ours coming last would say they were).
  for (const one of [mine, hello, yo]) assert.equal(await takeWrap(me, one.wrap), key);
  assert.equal(chat().unread, 2);

  // Ann reacts with a custom emoji (NIP-30): kept as its :shortcode:, with its id and where its picture is.
  const party = 'https://emoji.example/party.png';
  const reacted = await wrapped(ann, 7, [['e', yo.id], ['k', '14'], ['emoji', 'party', party]], ':party:', 4);
  assert.equal(await takeWrap(me, reacted.wrap), key);
  const onYo = () => chat().messages.find((m) => m.id === yo.id)!;
  assert.deepEqual([onYo().reactions, onYo().reactionIds, onYo().emoji], [{ [ann.public]: ':party:' }, { [ann.public]: reacted.id }, { ':party:': party }]);

  // Bob cannot take back what Ann wrote, nor her reaction.
  assert.equal(await takeWrap(me, (await wrapped(bob, 5, [['e', hello.id], ['e', reacted.id], ['k', '14']], '', 5)).wrap), null);
  assert.deepEqual(texts(), ['hello', 'yo', 'mine']);
  assert.deepEqual(onYo().reactions, { [ann.public]: ':party:' });
  // She can: her reaction, then her message, which was not read.
  assert.equal(await takeWrap(me, (await wrapped(ann, 5, [['e', reacted.id], ['k', '7']], '', 6)).wrap), key);
  assert.deepEqual([onYo().reactions, onYo().reactionIds], [undefined, undefined]);
  assert.equal(await takeWrap(me, (await wrapped(ann, 5, [['e', hello.id], ['k', '14']], '', 7)).wrap), key);
  assert.deepEqual(texts(), ['yo', 'mine']);
  assert.equal(chat().unread, 1);
  // Her message in a wrap of its own, come late: it stays away.
  assert.equal(await takeWrap(me, (await wrapped(ann, 14, [], 'hello', 1)).wrap), null);
  assert.deepEqual(texts(), ['yo', 'mine']);

  // Taken back before it came: a message, and a reaction.
  const late = await wrapped(ann, 14, [], 'late', 8);
  const lateLike = await wrapped(ann, 7, [['e', yo.id]], '+', 9);
  await takeWrap(me, (await wrapped(ann, 5, [['e', late.id], ['e', lateLike.id]], '', 10)).wrap);
  assert.equal(await takeWrap(me, late.wrap), null);
  assert.equal(await takeWrap(me, lateLike.wrap), null);
  assert.deepEqual([texts(), onYo().reactions], [['yo', 'mine'], undefined]);
  // A reaction come before its message, taken back before the message came.
  const later = await wrapped(bob, 14, [], 'later', 11);
  const early = await wrapped(bob, 7, [['e', later.id]], '🎉', 12);
  assert.equal(await takeWrap(me, early.wrap), null);
  assert.equal(me.early?.length, 1);
  await takeWrap(me, (await wrapped(bob, 5, [['e', early.id]], '', 13)).wrap);
  assert.equal(me.early, undefined);
  assert.equal(await takeWrap(me, later.wrap), key);
  assert.equal(chat().messages.find((m) => m.id === later.id)!.reactions, undefined);

  // Pins: on this device, the latest first, only of messages here; deleting a message takes its pin.
  pinHere(me, key, mine.id, true);
  pinHere(me, key, yo.id, true);
  pinHere(me, key, hello.id, true);
  assert.deepEqual(chat().pins, [yo.id, mine.id]);
  pinHere(me, key, mine.id, true);
  assert.deepEqual(chat().pins, [mine.id, yo.id]);
  pinHere(me, key, mine.id, false);
  assert.deepEqual(chat().pins, [yo.id]);
  // Deleted here: Bob's message and the pin with it; it stays away should it come again.
  const unread = chat().unread;
  assert.deepEqual(removeHere(me, key, [yo.id, 'f'.repeat(64)]).map((m) => m.text), ['yo']);
  assert.equal(chat().pins, undefined);
  assert.equal(chat().unread, unread - 1);
  assert.equal(await takeWrap(me, (await wrapped(bob, 14, [], 'yo', 2)).wrap), null);
  assert.deepEqual(texts(), ['mine', 'later']);
});

const spaceKey = randomBytes(32);

test('a space and someone on another app write both ways through their inbox relays', { skip: !coreReady }, async () => {
  // Bob, on another app: his inbox, his name, said where people look.
  const bob: NostrDmState = await newNostrDm();
  bob.inbox = [bobInbox.url];
  bob.name = 'Bob';
  for (const event of [await inboxEvent(bob), await profileEvent(bob)]) {
    const r = await NostrRelay.open(index.url, null);
    assert.equal((await r.publish(event)).ok, true);
    r.close();
  }

  // What it tells of the messages that come and are read (lib/network-notices.ts).
  const came: [string, number][] = [];
  const read: string[][] = [];
  const stopCame = onNetworkMessage((where, times) => came.push([where, times]));
  const stopRead = onNetworkRead((where) => read.push(where));

  setCurrentSpace(1, spaceKey);
  runNostrDm();
  await until(() => nostrDmNow().loaded, 'the account to load');
  assert.equal(nostrDmNow().state, null);
  await nostrDmMake();
  await nostrDmSetInbox([aliceInbox.url]);
  await nostrDmSetName('Alice');
  const alice = nostrDmNow().state!;
  assert.equal(alice.madeHere, true);
  // Reading her guarded inbox: she said who reads, on that connection only.
  await until(() => nostrDmNow().reading === 1, 'the inbox to be read');
  await until(() => aliceInbox.authed.length === 1, 'the inbox to ask who reads');
  assert.deepEqual(aliceInbox.authed, [alice.public]);
  // Her list of where she reads, and her name, are out.
  await until(() => index.events.some((e) => e.kind === 10050 && e.pubkey === alice.public) && index.events.some((e) => e.kind === 0 && e.pubkey === alice.public), 'her lists');
  assert.deepEqual(
    index.events.find((e) => e.kind === 10050 && e.pubkey === alice.public)!.tags,
    [['relay', aliceInbox.url]],
  );

  // She starts a chat with Bob's npub: his name comes from what he said.
  const bobNpub = npubOf(bob.public);
  const key = await nostrDmStart(bobNpub);
  assert.equal(key, bob.public);
  await until(() => nostrDmNow().state?.people[bob.public]?.name === 'Bob', "Bob's name");

  await nostrDmSend(bob.public, 'γεια σου, Bob');
  const sent = nostrDmNow().state!.chats[bob.public].messages;
  assert.deepEqual(
    sent.map((m) => [m.mine, m.text, m.state]),
    [[true, 'γεια σου, Bob', 'sent']],
  );
  // Bob's inbox has his wrap; hers, her copy; none of them signed by either, nor saying when.
  // (Her inbox has her lists too, as NIP-17 asks.)
  const wraps = (r: FakeRelay) => r.events.filter((e) => e.kind === 1059);
  await until(() => wraps(bobInbox).length === 1 && wraps(aliceInbox).length === 1, 'the wraps');
  const now = Math.floor(Date.now() / 1000);
  for (const wrap of [...wraps(bobInbox), ...wraps(aliceInbox)]) {
    assert.equal(wrap.kind, 1059);
    assert.notEqual(wrap.pubkey, alice.public);
    assert.notEqual(wrap.pubkey, bob.public);
    assert.ok(wrap.created_at <= now && wrap.created_at >= now - BACKDATE);
    // Sealed: a NIP-44 payload (version 2) in base64, so nothing in clear, the name neither. Its form
    // shows it, as random base64 can hold "Bob" by chance.
    assert.match(wrap.content, /^[A-Za-z0-9+/]+=*$/);
    assert.equal(Buffer.from(wrap.content, 'base64')[0], 2);
  }
  assert.equal(wraps(bobInbox)[0].tags[0][1], bob.public);
  assert.equal(wraps(aliceInbox)[0].tags[0][1], alice.public);
  assert.ok(!index.events.some((e) => e.kind === 1059));
  // Only the reading connection ever said who it is.
  assert.deepEqual(aliceInbox.authed, [alice.public]);
  assert.deepEqual(bobInbox.authed, []);

  // Bob reads it, and answers to where she reads.
  const r = await NostrRelay.open(bobInbox.url, null);
  for (const wrap of await r.query([{ kinds: [1059], '#p': [bob.public] }])) await takeWrap(bob, wrap);
  r.close();
  assert.deepEqual(
    bob.chats[alice.public].messages.map((m) => [m.mine, m.text]),
    [[false, 'γεια σου, Bob']],
  );
  const answer = await wrapText(bob, alice.public, 'γεια σου, Alice');
  addMessage(bob, alice.public, answer.message);
  // A guarded inbox takes wraps from anyone, never asking who sends.
  const w = await NostrRelay.open(aliceInbox.url, null);
  assert.equal((await w.publish(answer.theirs)).ok, true);
  w.close();
  await until(() => nostrDmNow().state!.chats[bob.public].messages.length === 2, 'his answer');
  assert.deepEqual(
    nostrDmNow().state!.chats[bob.public].messages.map((m) => [m.mine, m.text]),
    [
      [true, 'γεια σου, Bob'],
      [false, 'γεια σου, Alice'],
    ],
  );
  assert.equal(nostrDmUnread(), 1);
  // It told of his answer, once, as the home row knows the chat; her own message, of nothing.
  const where = `nostr:${bob.public}`;
  assert.deepEqual(came, [[where, 1]]);
  assert.deepEqual([...networkUnreadAt()], [[where, 1]]);
  // Muted, it is left out of the icon's number; then as the app has it again.
  await nostrDmSetNotify(bob.public, { until: Date.now() + 60_000 });
  assert.deepEqual([...networkUnreadAt()], []);
  assert.ok(networkNotify(where)?.until);
  await nostrDmSetNotify(bob.public, null);
  assert.equal(networkNotify(where), null);
  assert.deepEqual(read, []);
  await nostrDmRead(bob.public);
  assert.equal(nostrDmUnread(), 0);
  assert.deepEqual(read, [[where]]);

  // Her other app, with the same key, reads both sides from her inbox.
  const other = await newNostrDm(alice.secret);
  const reader = await NostrRelay.open(aliceInbox.url, (url, challenge) => import('../lib/nostr-dm').then((m) => m.authEvent(other, url, challenge)));
  const got = await new Promise<unknown[]>((resolve) => {
    const events: unknown[] = [];
    reader.subscribe([{ kinds: [1059], '#p': [other.public] }], (e) => events.push(e), () => resolve(events));
  });
  reader.close();
  for (const wrap of got) await takeWrap(other, wrap);
  assert.deepEqual(
    other.chats[bob.public].messages.map((m) => [m.mine, m.text]),
    [
      [true, 'γεια σου, Bob'],
      [false, 'γεια σου, Alice'],
    ],
  );

  // Someone who never said where they read gets nothing, and is told so.
  const carol = await newNostrDm();
  const carolNpub = npubOf(carol.public);
  await nostrDmStart(carolNpub, 'Carol');
  await assert.rejects(nostrDmSend(carol.public, 'hello?'), /does not say where/);
  assert.equal(nostrDmNow().state!.chats[carol.public].name, 'Carol');
  await nostrDmForgetChat(carol.public);

  // A note to herself goes to her own inbox, and shows once.
  await nostrDmSend(alice.public, 'a note');
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.deepEqual(
    nostrDmNow().state!.chats[alice.public].messages.map((m) => m.text),
    ['a note'],
  );

  // Closed and opened again: the same chats, nothing twice, and still reading.
  stopNostrDm();
  await new Promise((resolve) => setTimeout(resolve, 700));
  runNostrDm();
  await until(() => nostrDmNow().loaded && nostrDmNow().reading === 1, 'the account to come back');
  await new Promise((resolve) => setTimeout(resolve, 100));
  const back = nostrDmNow().state!;
  assert.equal(back.public, alice.public);
  assert.equal(back.chats[bob.public].messages.length, 2);
  assert.equal(back.chats[alice.public].messages.length, 1);
  assert.equal(nostrDmUnread(), 0);
  // Loading again told of nothing.
  assert.deepEqual(came, [[where, 1]]);
  stopCame();
  stopRead();

  // Whom she follows, for New chat: her newest follow list that is hers, with the names they gave
  // themselves; one that was changed after it was signed counts for nothing.
  const dan: NostrDmState = await newNostrDm();
  const me = nostrDmNow().state!;
  const follows = async (tags: string[][], at: number) => signed(me, 3, tags, '', at);
  const older = await follows([['p', dan.public]], Date.now() - 60_000);
  const newest = await follows([['p', bob.public], ['p', 'not a key'], ['p', dan.public], ['p', me.public], ['p', bob.public], ['e', dan.public]], Date.now());
  const forged = { ...newest, created_at: newest.created_at + 60, tags: [['p', dan.public]] };
  for (const event of [older, newest, forged]) {
    const r = await NostrRelay.open(index.url, null);
    await r.publish(event);
    r.close();
  }
  const authed = aliceInbox.authed.length + index.authed.length;
  const found = await nostrDmFollows();
  assert.deepEqual(found.people, [{ key: bob.public, name: 'Bob' }, { key: dan.public }]);
  // Asking said no one's name.
  assert.equal(aliceInbox.authed.length + index.authed.length, authed);
  // Each relay asked once, with how it answered: those that gather lists too, which the checks
  // do not have, were not reached.
  const how = Object.fromEntries(found.report.relays.map((r) => [r.url, r.how]));
  assert.equal(found.report.relays.length, new Set([...me.inbox, ...LOOKUP_RELAYS, ...FOLLOWS_RELAYS]).size);
  assert.equal(how[index.url], 'all');
  assert.equal(how[aliceInbox.url], 'all');
  for (const url of FOLLOWS_RELAYS) assert.equal(how[url], 'unreached');
  assert.deepEqual([found.report.lists, found.report.checked, found.report.people], [2, 2, 2]);
  // A changed copy that keeps the id of the newest list, come first, does not hide that list.
  const look = await followsLook(me.public, [forged, newest, older, newest]);
  assert.deepEqual([look.keys, look.lists, look.checked], [[bob.public, dan.public], 3, 2]);
  assert.deepEqual(await followsLook(me.public, [forged]), { keys: [], lists: 1, checked: 0 });

  // A newer follow list that only a relay she writes on keeps (her other app's, named in her
  // NIP-65 list; one named for reading only is not asked) is found there.
  const erin: NostrDmState = await newNostrDm();
  const writesList = await signed(me, 10002, [['r', `${aliceOutbox.url}/`, 'write'], ['r', 'wss://read-only.alice.example', 'read']], '', Date.now());
  const elsewhere = await signed(me, 3, [['p', erin.public]], '', Date.now() + 1000);
  for (const [url, event] of [[index.url, writesList], [aliceOutbox.url, elsewhere]] as const) {
    const r = await NostrRelay.open(url, null);
    await r.publish(event);
    r.close();
  }
  assert.deepEqual((await nostrDmFollows()).people, [{ key: erin.public }]);

  // Her name changes in the newest profile of her key, which keeps what her other app put there,
  // later than that one even when it says a time ahead of this phone's clock.
  const otherApp = await signed(me, 0, [], JSON.stringify({ name: 'Alice', picture: 'https://example.org/alice.png', about: 'Hello', displayName: 'Al' }), Date.now() + 5000);
  const atIndex = await NostrRelay.open(index.url, null);
  await atIndex.publish(otherApp);
  atIndex.close();
  await nostrDmSetName('Alicia');
  const said = () => JSON.parse(index.events.find((e) => e.kind === 0 && e.pubkey === me.public)!.content) as Record<string, unknown>;
  await until(() => said().name === 'Alicia', 'her new name');
  assert.deepEqual(said(), { picture: 'https://example.org/alice.png', about: 'Hello', name: 'Alicia', display_name: 'Alicia', displayName: 'Alicia' });
  assert.equal(index.events.find((e) => e.kind === 0 && e.pubkey === me.public)!.created_at, otherApp.created_at + 1);

  // A relay that goes away is read again.
  const before = aliceInbox.connections;
  aliceInbox.drop();
  await until(() => aliceInbox.connections > before && nostrDmNow().reading === 1, 'the inbox to be read again', 10_000);
  stopNostrDm();
});

test('a group of three, with its name and reactions, and a photo through a file server', { skip: !coreReady }, async () => {
  // Bob and Carol, on other apps, said where they read.
  const bob: NostrDmState = await newNostrDm();
  bob.inbox = [bobInbox.url];
  const carol: NostrDmState = await newNostrDm();
  carol.inbox = [carolInbox.url];
  for (const person of [bob, carol]) {
    const r = await NostrRelay.open(index.url, null);
    assert.equal((await r.publish(await inboxEvent(person))).ok, true);
    r.close();
  }
  // A Blossom server: what it was given, and with which permission.
  const blobs = new Map<string, Uint8Array>();
  const permits: { pubkey: string; kind: number; tags: string[][] }[] = [];
  setNostrHttp(async (method, url, headers, body) => {
    if (method === 'PUT' && url === 'https://files.example/upload' && body) {
      const token = headers.Authorization.replace(/^Nostr /, '').replace(/-/g, '+').replace(/_/g, '/');
      permits.push(JSON.parse(utf8Decode(fromBase64(token + '='.repeat((4 - (token.length % 4)) % 4)))));
      const hash = toHex(sha256Bytes(body));
      if (headers['X-SHA-256'] !== hash) return { status: 409, bytes: new Uint8Array(0) };
      blobs.set(hash, body);
      return { status: 201, bytes: utf8Encode(JSON.stringify({ url: `https://files.example/${hash}.bin`, sha256: hash, size: body.length })) };
    }
    const blob = method === 'GET' ? blobs.get(url.split('/').pop()!.replace(/\.bin$/, '')) : undefined;
    return blob ? { status: 200, bytes: blob } : { status: 404, bytes: new Uint8Array(0) };
  });
  const read = async (person: NostrDmState, inbox: FakeRelay) => {
    const r = await NostrRelay.open(inbox.url, null);
    for (const wrap of await r.query([{ kinds: [1059], '#p': [person.public] }])) await takeWrap(person, wrap);
    r.close();
  };

  setCurrentSpace(2, randomBytes(32));
  try {
    runNostrDm();
    await until(() => nostrDmNow().loaded, 'the account to load');
    await nostrDmMake();
    await nostrDmSetInbox([aliceInbox.url]);
    await nostrDmSetFileServers(['https://files.example/']);
    const alice = nostrDmNow().state!;
    await nostrDmStart(npubOf(bob.public), 'Bob');
    await nostrDmStart(npubOf(carol.public), 'Carol');
    await assert.rejects(nostrDmNewGroup([bob.public]), /two other people/);
    const group = await nostrDmNewGroup([carol.public, bob.public], 'Τρεις');
    assert.equal(group, groupKey([alice.public, bob.public, carol.public]));
    await nostrDmSend(group, 'γεια σε όλους');

    // Each has a wrap of their own, and the group as Alice made it.
    await read(bob, bobInbox);
    await read(carol, carolInbox);
    for (const [person, others] of [
      [bob, [alice.public, carol.public]],
      [carol, [alice.public, bob.public]],
    ] as const) {
      const chat = person.chats[group];
      assert.deepEqual(chat.members, [...others].sort());
      assert.equal(chat.subject, 'Τρεις');
      assert.deepEqual(
        chat.messages.map((m) => [m.from, m.text]),
        [[alice.public, 'γεια σε όλους']],
      );
    }
    const first = nostrDmNow().state!.chats[group].messages[0];
    // The name went with that message, and goes no more.
    assert.equal(nostrDmNow().state!.chats[group].subjectOwed, undefined);

    // Bob answers the group, and likes her message.
    const answer = await wrapMessage(bob, group, 14, [], 'γεια σου, Alice');
    const liked = await wrapMessage(bob, group, 7, [['e', first.id], ['k', '14']], '❤️');
    assert.deepEqual(Object.keys(answer.wraps).sort(), [alice.public, bob.public, carol.public].sort());
    const w = await NostrRelay.open(aliceInbox.url, null);
    assert.equal((await w.publish(answer.wraps[alice.public])).ok, true);
    assert.equal((await w.publish(liked.wraps[alice.public])).ok, true);
    w.close();
    await until(() => nostrDmNow().state!.chats[group].messages.length === 2 && !!nostrDmNow().state!.chats[group].messages[0].reactions, 'his answer and his reaction');
    const chat = nostrDmNow().state!.chats[group];
    assert.deepEqual(
      chat.messages.map((m) => [m.mine, m.from, m.text]),
      [
        [true, undefined, 'γεια σε όλους'],
        [false, bob.public, 'γεια σου, Alice'],
      ],
    );
    assert.deepEqual(chat.messages[0].reactions, { [bob.public]: '❤️' });
    assert.equal(chat.unread, 1);
    // She likes his: Carol sees it too.
    await nostrDmReact(group, chat.messages[1].id, '👍');
    await read(carol, carolInbox);
    assert.deepEqual(carol.chats[group].messages.find((m) => m.id === chat.messages[1].id)?.reactions, undefined);
    await takeWrap(carol, answer.wraps[carol.public]);
    await read(carol, carolInbox);
    assert.deepEqual(carol.chats[group].messages.find((m) => m.text === 'γεια σου, Alice')?.reactions, { [alice.public]: '👍' });

    // A photo: encrypted here, on the file server under a key made for it, opened by the others.
    const photo = randomBytes(5000);
    await nostrDmSendFile(group, { bytes: photo, name: 'φωτο.jpg', mime: 'image/jpeg', dim: '40x30' });
    assert.equal(permits.length, 1);
    assert.equal(permits[0].kind, 24242);
    assert.notEqual(permits[0].pubkey, alice.public);
    const [kept] = [...blobs.values()];
    assert.ok(!toHex(kept).includes(toHex(photo.subarray(0, 32))));
    assert.deepEqual(permits[0].tags.find((tag) => tag[0] === 'x'), ['x', toHex(sha256Bytes(kept))]);
    assert.deepEqual(permits[0].tags.find((tag) => tag[0] === 't'), ['t', 'upload']);
    await read(bob, bobInbox);
    const got = bob.chats[group].messages.find((m) => typeof m.file === 'object')!.file as NostrDmFile;
    assert.equal(got.type, 'image/jpeg');
    assert.equal(got.dim, '40x30');
    assert.equal(got.name, 'φωτο.jpg');
    assert.deepEqual(openFile(got, blobs.get(got.x)!), photo);
    const mine = nostrDmNow().state!.chats[group].messages.at(-1)!;
    assert.equal(mine.state, 'sent');
    assert.deepEqual(await nostrDmFile(mine.file as NostrDmFile), photo);
    // Changed on the server: refused.
    const changed = blobs.get(got.x)!.slice();
    changed[10] ^= 1;
    assert.throws(() => openFile(got, changed), /not the one/);

    // The home list names the group as its members did, and says a photo came last.
    const row = nostrInboxRows(nostrDmNow().state!).find((r) => r.identity === `nostr:${group}`)!;
    assert.equal(row.name, 'Τρεις');
    assert.equal(row.last, 'Photo');

    // A voice message says how long it lasts; the others' apps read it so.
    const voice = randomBytes(3000);
    await nostrDmSendFile(group, { bytes: voice, name: 'voice.m4a', mime: 'audio/mp4', durationMs: 3200 });
    await read(bob, bobInbox);
    const heard = bob.chats[group].messages.at(-1)!.file as NostrDmFile;
    assert.deepEqual([heard.type, heard.duration], ['audio/mp4', 3200]);
    assert.deepEqual(openFile(heard, blobs.get(heard.x)!), voice);
    assert.equal(nostrInboxRows(nostrDmNow().state!).find((r) => r.identity === `nostr:${group}`)!.last, 'Voice message, 0:03');

    // She answers his message; he answers hers from an app that marks no answer as such.
    const his = chat.messages[1].id;
    await nostrDmSend(group, 'σωστά', his);
    assert.equal(nostrDmNow().state!.chats[group].messages.at(-1)!.replyTo, his);
    await read(carol, carolInbox);
    assert.deepEqual(
      [carol.chats[group].messages.at(-1)!.text, carol.chats[group].messages.at(-1)!.replyTo],
      ['σωστά', his],
    );
    // A voice message answers one too, as a text does.
    await nostrDmSendFile(group, { bytes: randomBytes(500), name: 'voice.m4a', mime: 'audio/mp4', durationMs: 1500 }, his);
    assert.equal(nostrDmNow().state!.chats[group].messages.at(-1)!.replyTo, his);
    await read(carol, carolInbox);
    const answeredBy = carol.chats[group].messages.at(-1)!;
    assert.deepEqual([(answeredBy.file as NostrDmFile).duration, answeredBy.replyTo], [1500, his]);
    const plainAnswer = await wrapMessage(bob, group, 14, [['e', first.id]], 'κι εγώ');
    await takeWrap(carol, plainAnswer.wraps[carol.public]);
    assert.equal(carol.chats[group].messages.at(-1)!.replyTo, first.id);

    // Bob renames it; an older name Alice gave late does not undo his.
    const renamed = await wrapMessage(bob, group, 14, [['subject', 'Οι τρεις μας']], 'νέο όνομα');
    const w2 = await NostrRelay.open(aliceInbox.url, null);
    assert.equal((await w2.publish(renamed.wraps[alice.public])).ok, true);
    w2.close();
    await until(() => nostrDmNow().state!.chats[group].subject === 'Οι τρεις μας', 'his name for the group');
    await takeWrap(carol, renamed.wraps[carol.public]);
    await nostrDmSend(group, 'ωραίο');
    await read(carol, carolInbox);
    assert.equal(carol.chats[group].messages.at(-1)?.text, 'ωραίο');
    assert.equal(carol.chats[group].subject, 'Οι τρεις μας');
    // She names it herself: it goes with her next message, once.
    await nostrDmSetSubject(group, 'Εμείς');
    assert.equal(nostrDmNow().state!.chats[group].subjectOwed, true);
    await nostrDmSend(group, 'κι άλλο όνομα');
    assert.equal(nostrDmNow().state!.chats[group].subjectOwed, undefined);
    await read(carol, carolInbox);
    assert.equal(carol.chats[group].subject, 'Εμείς');
  } finally {
    setNostrHttp(null);
    stopNostrDm();
    setCurrentSpace(null);
  }
});

test('a reaction changed and taken back, a pin on this device alone, messages forwarded with their photo, and deleted for the others too', { skip: !coreReady }, async () => {
  const bob: NostrDmState = await newNostrDm();
  bob.inbox = [bobInbox.url];
  const carol: NostrDmState = await newNostrDm();
  carol.inbox = [carolInbox.url];
  for (const person of [bob, carol]) {
    const r = await NostrRelay.open(index.url, null);
    assert.equal((await r.publish(await inboxEvent(person))).ok, true);
    r.close();
  }
  const blobs = new Map<string, Uint8Array>();
  setNostrHttp(async (method, url, _headers, body) => {
    if (method === 'PUT' && body) {
      const hash = toHex(sha256Bytes(body));
      blobs.set(hash, body);
      return { status: 201, bytes: utf8Encode(JSON.stringify({ url: `https://files.example/${hash}.bin`, sha256: hash, size: body.length })) };
    }
    const blob = method === 'GET' ? blobs.get(url.split('/').pop()!.replace(/\.bin$/, '')) : undefined;
    return blob ? { status: 200, bytes: blob } : { status: 404, bytes: new Uint8Array(0) };
  });
  const read = async (person: NostrDmState, inbox: FakeRelay) => {
    const r = await NostrRelay.open(inbox.url, null);
    for (const wrap of await r.query([{ kinds: [1059], '#p': [person.public] }])) await takeWrap(person, wrap);
    r.close();
  };

  setCurrentSpace(5, randomBytes(32));
  try {
    runNostrDm();
    await until(() => nostrDmNow().loaded, 'the account to load');
    await nostrDmMake();
    await nostrDmSetInbox([aliceInbox.url]);
    await nostrDmSetFileServers(['https://files.example/']);
    const alice = nostrDmNow().state!;
    await nostrDmStart(npubOf(bob.public), 'Bob');
    await nostrDmStart(npubOf(carol.public), 'Carol');
    await nostrDmSend(bob.public, 'hi Bob');
    await read(bob, bobInbox);
    const his = await wrapMessage(bob, alice.public, 14, [], 'hi Alice');
    await takeWrap(bob, his.wraps[bob.public]);
    const w = await NostrRelay.open(aliceInbox.url, null);
    assert.equal((await w.publish(his.wraps[alice.public])).ok, true);
    w.close();
    const chat = () => nostrDmNow().state!.chats[bob.public];
    await until(() => chat().messages.some((m) => m.id === his.id), 'his answer');
    const onHis = () => chat().messages.find((m) => m.id === his.id)!;
    const bobSees = () => bob.chats[alice.public].messages.find((m) => m.id === his.id)!;

    // A like, then another reaction in its place: Bob's app sees the latest, the one before taken back.
    await nostrDmReact(bob.public, his.id, '👍');
    assert.deepEqual(onHis().reactions, { [alice.public]: '👍' });
    const liked = onHis().reactionIds![alice.public];
    await read(bob, bobInbox);
    assert.deepEqual([bobSees().reactions, bobSees().reactionIds], [{ [alice.public]: '👍' }, { [alice.public]: liked }]);
    await nostrDmReact(bob.public, his.id, '🎉');
    assert.deepEqual(onHis().reactions, { [alice.public]: '🎉' });
    assert.notEqual(onHis().reactionIds![alice.public], liked);
    await read(bob, bobInbox);
    assert.deepEqual(bobSees().reactions, { [alice.public]: '🎉' });
    // The same again sends nothing.
    const went = bobInbox.events.length;
    await nostrDmReact(bob.public, his.id, '🎉');
    assert.equal(bobInbox.events.length, went);
    // Taken back: off here at once, and off his.
    await nostrDmUnreact(bob.public, his.id);
    assert.equal(onHis().reactions, undefined);
    await read(bob, bobInbox);
    assert.equal(bobSees().reactions, undefined);

    // Pinned and unpinned here; nothing goes anywhere.
    const sent = [bobInbox.events.length, aliceInbox.events.length];
    await nostrDmPin(bob.public, his.id, true);
    assert.deepEqual(chat().pins, [his.id]);
    await nostrDmPin(bob.public, his.id, false);
    assert.equal(chat().pins, undefined);
    assert.deepEqual([bobInbox.events.length, aliceInbox.events.length], sent);

    // His words and her photo forwarded to Carol as new messages: the photo opened here and put on the server again, under a key of its own.
    const photo = randomBytes(4000);
    await nostrDmSendFile(bob.public, { bytes: photo, name: 'cat.jpg', mime: 'image/jpeg', dim: '20x10' });
    const photoId = chat().messages.at(-1)!.id;
    const original = chat().messages.at(-1)!.file as NostrDmFile;
    assert.equal(await nostrDmForward(bob.public, [photoId, his.id, 'f'.repeat(64)], carol.public), 2);
    assert.equal(blobs.size, 2);
    await read(carol, carolInbox);
    const got = carol.chats[alice.public].messages;
    assert.equal(got.length, 2);
    assert.ok(got.some((m) => m.text === 'hi Alice' && !m.file && !m.mine));
    const copy = got.find((m) => typeof m.file === 'object')!.file as NostrDmFile;
    assert.notEqual(copy.x, original.x);
    assert.deepEqual([copy.type, copy.dim, copy.name], ['image/jpeg', '20x10', 'cat.jpg']);
    assert.deepEqual(openFile(copy, blobs.get(copy.x)!), photo);

    // A sticker goes as a photo, its size and its words with it.
    const sticker = randomBytes(900);
    await nostrDmSendSticker(bob.public, { bytes: sticker, mime: 'image/png', w: 512, h: 512, label: 'a cat / waving' });
    await read(bob, bobInbox);
    const stuck = bob.chats[alice.public].messages.at(-1)!.file as NostrDmFile;
    assert.deepEqual([stuck.type, stuck.dim, stuck.name], ['image/png', '512x512', 'a cat waving.png']);
    assert.deepEqual(openFile(stuck, blobs.get(stuck.x)!), sticker);

    // Deleted: both from here; hers the others are asked to delete too, and Bob's app does.
    const hiBob = chat().messages.find((m) => m.text === 'hi Bob')!.id;
    assert.equal(await nostrDmDelete(bob.public, [hiBob, his.id]), 1);
    assert.deepEqual(chat().messages.map((m) => m.id), [photoId, chat().messages.at(-1)!.id]);
    assert.ok(chat().messages.every((m) => typeof m.file === 'object'));
    await read(bob, bobInbox);
    const bobs = bob.chats[alice.public].messages.map((m) => m.id);
    assert.ok(!bobs.includes(hiBob));
    assert.ok(bobs.includes(his.id) && bobs.includes(photoId));
  } finally {
    setNostrHttp(null);
    stopNostrDm();
    setCurrentSpace(null);
  }
});

test('a file another app sent with a 16-byte nonce opens', async () => {
  const { gcm } = await import('@noble/ciphers/aes.js');
  const bytes = randomBytes(300);
  const key = randomBytes(32);
  const nonce = randomBytes(16);
  const sealed = gcm(key, nonce).encrypt(bytes);
  const file: NostrDmFile = { url: 'https://x.example/a', type: 'application/pdf', key: toHex(key), nonce: toHex(nonce), x: toHex(sha256Bytes(sealed)) };
  assert.deepEqual(openFile(file, sealed), bytes);
});

test('a NIP-05 name gives its key and relays', { skip: !coreReady }, async () => {
  const fetched: string[] = [];
  const real = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    fetched.push(url);
    return new Response(JSON.stringify({ names: { bob: 'b'.repeat(64) }, relays: { ['b'.repeat(64)]: ['wss://inbox.bob.example'] } }), { status: 200 });
  }) as typeof fetch;
  try {
    assert.deepEqual(await lookUpNip05('Bob@Example.org'), { public: 'b'.repeat(64), relays: ['wss://inbox.bob.example'] });
    assert.deepEqual(fetched, ['https://example.org/.well-known/nostr.json?name=bob']);
    assert.equal(await lookUpNip05('carol@example.org'), null);
    assert.equal(await lookUpNip05('not a name'), null);
  } finally {
    globalThis.fetch = real;
  }
});

test("a key's inbox lists from other apps are found, newest first, and a new relay is read from its start", { skip: !coreReady }, async () => {
  const me = await newNostrDm();
  const someone = await newNostrDm();
  assert.equal(sameRelays(['wss://a.example/', 'wss://b.example'], ['wss://b.example', 'wss://a.example']), true);
  assert.equal(sameRelays(['wss://a.example'], ['wss://a.example', 'wss://b.example']), false);
  me.inbox = ['wss://old.example'];
  const older = await inboxEvent(me, Date.now() - 60_000);
  me.inbox = ['wss://amethyst.example/', 'wss://more.example'];
  const theirs = await inboxEvent(me, Date.now() - 30_000);
  me.inbox = [...DEFAULT_INBOX];
  const ours = await inboxEvent(me);
  someone.inbox = ['wss://someone.example'];
  const notMine = await inboxEvent(someone);
  // A changed copy that keeps the id of a list, come first, does not hide that list.
  const forged = { ...theirs, tags: [['relay', 'wss://evil.example']] };
  const found = await otherInboxes(me.public, [ours, notMine, forged, older, theirs, theirs], me.inbox);
  assert.deepEqual(
    found.map((f) => [f.relays, f.at]),
    [
      [['wss://amethyst.example', 'wss://more.example'], theirs.created_at],
      [['wss://old.example'], older.created_at],
    ],
  );
  // The same relays in another order are the same inbox: what was read stays read.
  me.caught = 100;
  setInbox(me, [DEFAULT_INBOX[2], DEFAULT_INBOX[0], DEFAULT_INBOX[1]]);
  assert.equal(me.caught, 100);
  setInbox(me, ['wss://amethyst.example']);
  assert.equal(me.caught, 0);
});

test('a key brought from another app reads where that app said, and gets what came before', { skip: !coreReady }, async () => {
  // Dan's other app (Amethyst, say) reads his messages on a guarded relay of its own, and said so on
  // the relays it writes on (his NIP-65 list); an even older list named another. Erevos had since
  // said, on the relays that gather lists, that he reads on its own three, over that app's list.
  const danInbox = relay('wss://inbox.dan.example', { guarded: true });
  const danOlder = relay('wss://older.dan.example');
  const danOutbox = relay('wss://outbox.dan.example');
  const danOutbox2 = relay('wss://outbox2.dan.example');
  const dan = await newNostrDm();
  const bob = await newNostrDm();
  const hour = 3600_000;
  dan.inbox = [danOlder.url];
  const oldest = await inboxEvent(dan, Date.now() - 48 * hour);
  dan.inbox = [danInbox.url];
  const theirs = await inboxEvent(dan, Date.now() - hour);
  const writes = await signed(dan, 10002, [['r', `${danOutbox.url}/`, 'write'], ['r', danOutbox2.url]], '', Date.now() - hour);
  dan.inbox = [...DEFAULT_INBOX];
  const ours = await inboxEvent(dan, Date.now() - 60_000);
  // What Bob wrote him before, days ago, kept where each of his lists named.
  const before = await wrapText(bob, dan.public, 'from before', Date.now() - 72 * hour);
  const further = await wrapText(bob, dan.public, 'from further back', Date.now() - 96 * hour);
  // Old private messages (NIP-04): Bob's to him, where his list says he reads, and his answer from
  // his other app, where it writes.
  const oldIn = await oldMessage(bob, dan.public, 'the old way, to Dan', Date.now() - 120 * hour);
  const oldOut = await oldMessage(dan, bob.public, 'and back, the old way', Date.now() - 119 * hour);
  const put = [
    [danOutbox2, oldest],
    [danOutbox, theirs],
    [index, writes],
    [index, ours],
    [danInbox, before.theirs],
    [danOlder, further.theirs],
    [danOutbox2, oldIn],
    [danOutbox, oldOut],
  ] as const;
  for (const [r, event] of put) {
    const link = await NostrRelay.open(r.url, null);
    assert.equal((await link.publish(event)).ok, true);
    link.close();
  }
  assert.ok(index.events.some((e) => e.id === ours.id) && !index.events.some((e) => e.id === theirs.id));

  const came: string[] = [];
  const stopCame = onNetworkMessage((where) => came.push(where));
  setCurrentSpace(3, randomBytes(32));
  try {
    runNostrDm();
    await until(() => nostrDmNow().loaded, 'the account to load');
    await nostrDmBring(await nsecOf(dan));
    // It reads where his other app reads, saying who reads there.
    await until(() => sameRelays(nostrDmNow().state?.inbox ?? [], [danInbox.url]), "his other app's inbox", 10_000);
    await until(() => nostrDmNow().state?.chats[bob.public]?.messages.length === 4, 'what came before', 10_000);
    assert.deepEqual(
      nostrDmNow()
        .state!.chats[bob.public].messages.map((m) => [m.mine, m.text, m.old ?? false])
        .sort(),
      [
        [false, 'from before', false],
        [false, 'from further back', false],
        [false, 'the old way, to Dan', true],
        [true, 'and back, the old way', true],
      ],
    );
    // The old ones are read where his NIP-65 list says, besides the inbox; only the inbox counts as such.
    assert.deepEqual(nostrDmNow().state!.oldRelays, [danOutbox2.url, danOutbox.url]);
    assert.equal(nostrDmNow().reading, 1);
    assert.ok(danInbox.authed.includes(dan.public));
    // His newest list names that inbox again where lists are looked up: his other app reads it too.
    await until(
      () => index.events.some((e) => e.kind === 10050 && e.pubkey === dan.public && sameRelays(e.tags.filter((t) => t[0] === 'relay').map((t) => t[1]), [danInbox.url])),
      'his list said again',
    );
    // What came before was told of as nothing new.
    assert.deepEqual(came, []);
    // What comes now comes too, and is told.
    await until(() => (nostrDmNow().state?.caught ?? 0) > 0, 'his inbox read to its end');
    const fresh = await wrapText(bob, dan.public, 'and now');
    const link = await NostrRelay.open(danInbox.url, null);
    assert.equal((await link.publish(fresh.theirs)).ok, true);
    link.close();
    await until(() => nostrDmNow().state?.chats[bob.public]?.messages.length === 5, 'a new message');
    assert.deepEqual(came, [`nostr:${bob.public}`]);
    // A new old-style one comes too, and is told, once that relay sent all it kept.
    await until(() => (nostrDmNow().state?.oldSent?.[danOutbox2.url] ?? 0) > 0, 'the old messages read to their end');
    const freshOld = await oldMessage(bob, dan.public, 'still the old way', Date.now());
    const link2 = await NostrRelay.open(danOutbox2.url, null);
    assert.equal((await link2.publish(freshOld)).ok, true);
    link2.close();
    await until(() => nostrDmNow().state?.chats[bob.public]?.messages.length === 6, 'a new old-style message');
    assert.deepEqual(came, [`nostr:${bob.public}`, `nostr:${bob.public}`]);
    // It looked once: the next time it reads, it does not look again.
    assert.ok((nostrDmNow().state?.inboxLooked ?? 0) > 0);
  } finally {
    stopCame();
    stopNostrDm();
    setCurrentSpace(null);
  }
});

test("someone's public posts are read where they write, checked, newest first, a page at a time", { skip: !coreReady }, async () => {
  // Erin posts for everyone. Her relay list (NIP-65) says where she writes, which is not where
  // look-ups go; a few of her posts are on the relay for look-ups too.
  const erinOutbox = relay('wss://outbox.erin.example');
  const erin = await newNostrDm();
  const bob = await newNostrDm();
  const minute = 60_000;
  const start = Date.now() - 10 * 24 * 3600_000;
  const at = (i: number) => start + i * minute;
  const writes = await signed(erin, 10002, [['r', erinOutbox.url, 'write'], ['r', 'wss://reads.erin.example', 'read']], '', at(0));
  const plain = await Promise.all(Array.from({ length: 31 }, (_, i) => signed(erin, 1, [], `post ${i} nostr:${npubOf(bob.public)}`, at(i + 1))));
  const warned = await signed(erin, 1, [['content-warning', 'spoilers']], 'the end of the film', at(40));
  const answer = await signed(erin, 1, [['e', 'a'.repeat(64), '', 'reply']], 'an answer', at(41));
  const mention = await signed(erin, 1, [['e', 'b'.repeat(64), '', 'mention']], 'only naming one', at(42));
  const bobs = await signed(bob, 1, [], "Bob's post", at(5));
  const share = await signed(erin, 6, [['e', bobs.id], ['p', bob.public]], JSON.stringify(bobs), at(43));
  const forgedInner = await signed(erin, 6, [], JSON.stringify({ ...bobs, content: 'not what Bob said' }), at(44));
  const forged = { ...(await signed(erin, 1, [], 'as she wrote it', at(45))), content: 'not as she wrote it' };
  const ahead = await signed(erin, 1, [], 'from the future', Date.now() + 24 * 3600_000);
  const notHers = await signed(bob, 1, [], 'Bob, not Erin', at(46));
  const put: [FakeRelay, typeof writes][] = [
    [index, writes],
    ...plain.map((event): [FakeRelay, typeof writes] => [erinOutbox, event]),
    [index, plain[30]],
    [index, warned],
    [erinOutbox, answer],
    [erinOutbox, mention],
    [index, share],
    [index, forgedInner],
    [erinOutbox, forged],
    [erinOutbox, ahead],
    [erinOutbox, notHers],
  ];
  for (const [r, event] of put) {
    const link = await NostrRelay.open(r.url, null);
    assert.equal((await link.publish(event)).ok, true);
    link.close();
  }

  // As shown: checked, each once, the share with Bob's post in it, newest first.
  const all = await postsOf(erin.public, [...erinOutbox.events, ...index.events]);
  assert.equal(all.length, POSTS_AT_ONCE);
  assert.deepEqual(
    all.slice(0, 5).map((p) => [p.text, p.answer ?? false, p.warning ?? null, p.sharedFrom ?? null]),
    [
      ["Bob's post", false, null, bob.public],
      ['only naming one', false, null, null],
      ['an answer', true, null, null],
      ['the end of the film', false, 'spoilers', null],
      [`post 30 nostr:${npubOf(bob.public)}`, false, null, null],
    ],
  );
  assert.equal(new Set(all.map((p) => p.id)).size, all.length);
  assert.ok(all.every((p) => !p.text.includes('not') && p.text !== 'from the future'));
  assert.match(shortMentions(all[4].text), /^post 30 npub1[02-9ac-hj-np-z]{5}…[02-9ac-hj-np-z]{4}$/);

  setCurrentSpace(4, randomBytes(32));
  try {
    runNostrDm();
    await until(() => nostrDmNow().loaded, 'the account to load');
    await nostrDmMake();
    // The first page asks where look-ups go and, as her list says, where she writes.
    const first = await nostrDmPosts(erin.public);
    assert.equal(first.answered, true);
    assert.equal(first.older, true);
    assert.equal(first.posts.length, POSTS_AT_ONCE);
    assert.deepEqual(first.posts.map((p) => p.id), all.map((p) => p.id));
    // The next one, before the oldest shown, has the rest.
    const second = await nostrDmPosts(erin.public, Math.floor(first.posts[first.posts.length - 1].at / 1000) - 1);
    assert.deepEqual(
      second.posts.map((p) => p.text),
      [4, 3, 2, 1, 0].map((i) => `post ${i} nostr:${npubOf(bob.public)}`),
    );
    assert.equal(second.older, false);
    // Nothing of them is kept.
    assert.ok(!JSON.stringify(nostrDmNow().state).includes('post 3'));
  } finally {
    stopNostrDm();
    setCurrentSpace(null);
  }
});

test('strangers cannot make chats without end', { skip: !coreReady }, async () => {
  const me = await newNostrDm();
  const someone = await newNostrDm();
  for (let i = 0; i < CHATS_MOST; i += 1) me.chats[i.toString(16).padStart(64, '0')] = { key: i.toString(16).padStart(64, '0'), messages: [{ id: `${i}`, mine: true, text: '', at: i }], unread: 0, lastAt: i };
  // Every chat has something of ours: the new one waits.
  const first = await wrapText(someone, me.public, 'one');
  assert.equal(await takeWrap(me, first.theirs), null);
  // Once chat 7 has only theirs, it makes room; the message comes again from the relay, and is taken.
  me.chats[(7).toString(16).padStart(64, '0')].messages[0].mine = false;
  assert.equal(await takeWrap(me, first.theirs), someone.public);
  assert.equal(Object.keys(me.chats).length, CHATS_MOST);
  assert.equal(me.chats[(7).toString(16).padStart(64, '0')], undefined);
});

test('what is read stays read: a message again, one let go, and ours from another app', () => {
  const state = { secret: '', public: 'a'.repeat(64), inbox: [], told: 0, chats: {}, people: {}, caught: 1, seen: [] } as unknown as NostrDmState;
  const them = 'b'.repeat(64);
  const theirs = (id: string, at: number) => ({ id, mine: false, at, text: id });
  assert.ok(addMessage(state, them, theirs('m1', 1000)));
  assert.ok(addMessage(state, them, theirs('m2', 2000)));
  assert.equal(state.chats[them].unread, 2);
  markRead(state, them);
  // The same message again (from another relay, or after a restart) counts nothing.
  assert.ok(!addMessage(state, them, theirs('m2', 2000)));
  assert.equal(state.chats[them].unread, 0);
  // Ours, sent from another app after theirs: what came before it was read.
  assert.ok(addMessage(state, them, theirs('m3', 3000)));
  assert.ok(addMessage(state, them, theirs('m4', 4000)));
  assert.ok(addMessage(state, them, { id: 'o1', mine: true, at: 3500, text: 'ours' }));
  assert.equal(state.chats[them].unread, 1);
  assert.ok(addMessage(state, them, { id: 'o2', mine: true, at: 5000, text: 'ours' }));
  assert.equal(state.chats[them].unread, 0);
  // A full chat: one older than all it keeps, sent again after it was let go, is not new.
  const many = 'c'.repeat(64);
  for (let i = 0; i < KEEP_MESSAGES; i++) addMessage(state, many, theirs(`k${i}`, 10_000 + i));
  markRead(state, many);
  assert.ok(!addMessage(state, many, theirs('old', 5)));
  assert.equal(state.chats[many].unread, 0);
  assert.equal(state.chats[many].messages.length, KEEP_MESSAGES);
});

test('Nostr chats are rows of the home list, a part of their own', () => {
  const ann = 'a'.repeat(64);
  const bob = 'b'.repeat(64);
  const state = {
    public: 'c'.repeat(64),
    people: { [bob]: { name: 'Bob there', at: 1 } },
    chats: {
      [ann]: { key: ann, name: 'Ann', unread: 2, lastAt: 10, messages: [{ id: '1', mine: true, text: 'hi', at: 100, state: 'sending' }] },
      [bob]: { key: bob, unread: 0, lastAt: 20, messages: [{ id: '2', mine: false, text: '', at: 50, file: true }] },
      ['d'.repeat(64)]: { key: 'd'.repeat(64), unread: 0, lastAt: 30, messages: [] },
    },
  } as unknown as NostrDmState;
  const rows = nostrInboxRows(state);
  const by = Object.fromEntries(rows.map((row) => [row.identity, row]));
  assert.deepEqual([by[`nostr:${ann}`].name, by[`nostr:${ann}`].last, by[`nostr:${ann}`].mark, by[`nostr:${ann}`].unread, by[`nostr:${ann}`].at], ['Ann', 'hi', -1, 2, 100]);
  // The name they gave themselves; a file as such; with no name, their npub's start and end.
  assert.deepEqual([by[`nostr:${bob}`].name, by[`nostr:${bob}`].last], ['Bob there', 'A file']);
  assert.equal(by[`nostr:${'d'.repeat(64)}`].name, shortNpub(npubOf('d'.repeat(64))));
  assert.equal(by[`nostr:${'d'.repeat(64)}`].at, 30);
  for (const row of rows) assert.deepEqual([showsIn(row, 'nostr'), showsIn(row, 'xmpp'), showsIn(row, 'erevos'), showsIn(row, 'all')], [true, false, false, true]);
  assert.deepEqual(inboxParts([], { nostr: true }), ['nostr']);
  assert.deepEqual(inboxParts(rows, { matrix: true }), ['matrix', 'nostr']);
});
