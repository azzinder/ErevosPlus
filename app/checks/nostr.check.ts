// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Texts through Nostr (lib/nostr.ts, lib/nostr-chats.ts, lib/e2e.ts `ns`), with the real core
// built to WebAssembly for the keys and the wraps, and Nostr relays played here behind the core's
// Tor calls (torText*), as crates/erevos-tor would reach them: each chat tells each contact the key
// it reads their texts with in a message of keys, once, and again when its relays change or it
// reads nowhere; a text to a contact who told theirs goes to their Nostr relays, comes out on their
// phone as from the relay, once though two relays carry it, and is kept to go through the relay
// as well should they not say it came in five minutes, quiet there when a bell went with it, as to
// hidden chats; while Tor is not ready, or no Nostr relay takes it, it goes through the relay at
// once. A reader asks from somewhat over an hour before it last read, keeps until when, and asks
// again at once when the keys change. Requests to the relay that would go through Tor go straight
// to a real relay here; those parts are skipped, with a note, without one. With no relay between
// the two, a link says where it reads on Nostr (`nk`, `nr`), and all that is small goes there, the
// first packet with each until they answer, several packets in one wrap; texts are put there again
// each day until said to have come, and an invite to a relay rides in a message with nothing else.
// Hidden chats that receive while closed read their texts on Nostr too, as the space's receiver
// does, but not while their chat screen holds them.
// A build with no Tor (the web app, the computer app, Sailfish OS's) reaches the relays straight,
// with the space's way Nothing or Messages, and none with Everything, Nostr's own Tor switch on,
// or for a chat that goes only through Tor.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { afterEach, test } from 'node:test';

import { contactLink, parseContact } from '../lib/contact-code';
import { canNostr, canNostrTor, setCore, setNostrStraight, type Core } from '../lib/core';
import { guardCore, type WebCore } from '../lib/core-guard';
import { randomBytes, toHex, utf8Decode, utf8Encode } from '../lib/crypto';
import { E2E, toBase64Url, type Received } from '../lib/e2e';
import { NOSTR_AGAIN_MOST, NOSTR_AGAIN_MS, NOSTR_BACKUP_MS, nostrKeysChanged, nostrOf, nostrPacked, nostrReady, nostrRelays, nostrStates, packNostr, publishNostr, readNostr, setNostr, unpackNostr } from '../lib/nostr';
import { nostrOnlyWay, nostrReaderOf, orNostr, sendNostrAgain, sendNostrBackups } from '../lib/nostr-chats';
import { MOST_NOSTR } from '../lib/contact-code';
import { bytesSource, chunkPlan, FileDamagedError, FileTooLargeError, offerRef, PiecesMissingError, readFile, readOffer, takeFile } from '../lib/attachments';
import { sha256Bytes } from '../lib/crypto';
import { setNostrHttp } from '../lib/nostr-files';
import { setNostrOpen, type NostrOpen } from '../lib/nostr-dm-net';
import { dropPieces, heldPieces, piecesCame, type PiecePlace } from '../lib/nostr-pieces';
import { offerOnNostr } from '../lib/nostr-send-files';
import { isFileRef } from '../lock/attachment-files';
import { offerOf } from '../lib/relay-offer';
import { createQueue, NO_NEWS, receiveMessage, RelayUnreachableError, setThroughTor, setTorReady, waitForNews, type Relay } from '../lib/relay';
import { forgetPlaceChats, placeChats } from '../lib/place-chats';
import { holdPlace, receivesPocket, startPlaceReceiver } from '../lib/place-receiver';
import { handOverHidden } from '../lib/waiting';
import { History, newTag, WAITING } from '../lock/history';
import { keepReceived, setAppShown } from '../lib/receiver';
import { VoiceAssembler } from '../lib/voice';
import { sendSealed } from '../lib/space-chats';
import { keepPlace, prepareKeepEntries } from '../lock/hidden-keep';
import { setCurrentSpace } from '../lock/keys';
import { checkedNostr, EMPTY_SPACE, NOSTR_DEFAULT, NOSTR_RELAYS, saveHiddenData } from '../lock/space-data';
import { files } from './files-memory';
import { ready as relayReady, relayNote, startRelay } from './real-relay';
import './secure-memory';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built);
if (!coreReady) console.log('Skipping the Nostr checks: build the core first with node checks/build-core.mjs');
relayNote('the Nostr checks through a relay');

const ONE = 'wss://nostr-one.example.org';
const TWO = 'wss://nostr-two.example.org';

type Wrap = { id: string; kind: number; created_at: number; tags: string[][] };
type Filter = { kinds?: number[]; '#p'?: string[]; since?: number };
type Line = { url: string; frames: string[]; waiter: (() => void) | null; closed: boolean; subs: Map<string, Filter[]> };

const number = (bytes: Uint8Array) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(0) * 2 ** 32 + view.getUint32(4);
};

// Nostr relays as the core's Tor reaches them: what each keeps, what each was asked, which cannot
// be reached and which refuse what they are given.
class NostrRelays {
  readonly kept = new Map<string, Map<string, Wrap>>();
  readonly asked: { url: string; sub: string; filters: Filter[] }[] = [];
  readonly down = new Set<string>();
  readonly refusing = new Set<string>();
  /** Relays that take what they are given only this long after, ms. */
  readonly late = new Map<string, number>();
  /** Relays that pass on what they are given at once, but say they took it only this long after, ms. */
  readonly slowToSay = new Map<string, number>();
  readonly lines = new Map<number, Line>();
  // How many connections were opened through Tor (the core's torTextOpen), and how many straight
  // (lib/nostr-dm-net.ts setNostrOpen, as a WebSocket of the phone's own would be).
  throughTor = 0;
  straight = 0;
  readonly straightIds = new Set<number>();
  // Counted across the checks: a connection a check before closes late never closes one of this one's.
  private static made = 0;

  keptAt(url: string): Wrap[] {
    return [...(this.kept.get(url)?.values() ?? [])];
  }

  private say(line: Line, frame: unknown[]): void {
    line.frames.push(JSON.stringify(frame));
    line.waiter?.();
  }

  private line(id: Uint8Array): Line {
    const line = this.lines.get(number(id));
    if (!line) throw new Error('the connection through Tor is closed');
    return line;
  }

  private static matches(filter: Filter, wrap: Wrap): boolean {
    const p = wrap.tags.find((tag) => tag[0] === 'p')?.[1] ?? '';
    return (!filter.kinds || filter.kinds.includes(wrap.kind)) && (!filter['#p'] || filter['#p'].includes(p)) && wrap.created_at >= (filter.since ?? 0);
  }

  private open(url: string): Uint8Array {
    if (this.down.has(url)) throw new Error('Tor took too long to reach the relay');
    const id = ++NostrRelays.made;
    this.lines.set(id, { url, frames: [], waiter: null, closed: false, subs: new Map() });
    const out = new Uint8Array(8);
    new DataView(out.buffer).setUint32(4, id);
    return out;
  }

  /** The same relays reached straight, never through Tor. */
  opener(): NostrOpen {
    const core = this.core() as Required<Pick<Core, 'torTextSend' | 'torTextNext' | 'torTextClose'>>;
    return async (url) => {
      this.straight++;
      const id = this.open(url);
      this.straightIds.add(number(id));
      return {
        tor: false,
        send: async (frame) => void (await core.torTextSend(id, JSON.stringify(frame))),
        next: async (ms) => {
          const wait = new Uint8Array(8);
          new DataView(wait.buffer).setUint32(4, Math.max(1, ms));
          const frame = await core.torTextNext(id, wait);
          return frame === '' ? null : (JSON.parse(frame) as unknown[]);
        },
        close: () => void core.torTextClose(id).catch(() => undefined),
      };
    };
  }

  core(): Partial<Core> {
    return {
      torTextOpen: async (url) => {
        this.throughTor++;
        return this.open(url);
      },
      torTextSend: async (id, frame) => {
        const line = this.line(id);
        const said = JSON.parse(frame) as unknown[];
        if (said[0] === 'EVENT') {
          const wrap = said[1] as Wrap;
          if (this.refusing.has(line.url)) {
            this.say(line, ['OK', wrap.id, false, 'blocked: not here']);
            return new Uint8Array(0);
          }
          const take = () => {
            const kept = this.kept.get(line.url) ?? new Map<string, Wrap>();
            this.kept.set(line.url, kept);
            const twice = kept.has(wrap.id);
            kept.set(wrap.id, wrap);
            const answer = () => this.say(line, ['OK', wrap.id, !twice, twice ? 'duplicate: have it' : '']);
            const slow = this.slowToSay.get(line.url);
            if (slow) setTimeout(answer, slow);
            else answer();
            if (!twice) {
              for (const other of this.lines.values()) {
                if (other.url !== line.url) continue;
                for (const [sub, filters] of other.subs) if (filters.some((f) => NostrRelays.matches(f, wrap))) this.say(other, ['EVENT', sub, wrap]);
              }
            }
          };
          const late = this.late.get(line.url);
          if (late) setTimeout(take, late);
          else take();
        } else if (said[0] === 'REQ') {
          const [, sub, ...filters] = said as [string, string, ...Filter[]];
          line.subs.set(sub, filters);
          this.asked.push({ url: line.url, sub, filters });
          for (const wrap of this.keptAt(line.url)) if (filters.some((f) => NostrRelays.matches(f, wrap))) this.say(line, ['EVENT', sub, wrap]);
          this.say(line, ['EOSE', sub]);
        } else if (said[0] === 'CLOSE') {
          line.subs.delete(said[1] as string);
        }
        return new Uint8Array(0);
      },
      torTextNext: async (id, wait) => {
        const line = this.line(id);
        if (line.frames.length === 0 && !line.closed) {
          await new Promise<void>((resolve) => {
            const timer = setTimeout(done, number(wait));
            function done() {
              clearTimeout(timer);
              line.waiter = null;
              resolve();
            }
            line.waiter = done;
          });
        }
        const frame = line.frames.shift();
        if (frame !== undefined) return frame;
        if (line.closed) throw new Error('the relay closed the connection');
        return '';
      },
      torTextClose: async (id) => {
        const key = number(id);
        const line = this.lines.get(key);
        this.lines.delete(key);
        if (line) {
          line.closed = true;
          line.waiter?.();
        }
        return new Uint8Array(0);
      },
    };
  }
}

// The core's Tor for the relay, here straight to it: a request each on a connection of its own, or
// a connection that takes requests one after another.
function relayTor(): Partial<Core> {
  const sockets = new Map<number, { socket: WebSocket; replies: Uint8Array[]; waiting: ((reply: Uint8Array | null) => void)[] }>();
  let made = 0;
  const open = (url: string) =>
    new Promise<number>((resolve, reject) => {
      const socket = new WebSocket(url);
      socket.binaryType = 'arraybuffer';
      const id = ++made;
      const held = { socket, replies: [] as Uint8Array[], waiting: [] as ((reply: Uint8Array | null) => void)[] };
      socket.onopen = () => {
        sockets.set(id, held);
        resolve(id);
      };
      socket.onerror = () => reject(new Error('cannot reach the relay'));
      socket.onmessage = (event) => {
        const reply = new Uint8Array(event.data as ArrayBuffer);
        const waiter = held.waiting.shift();
        if (waiter) waiter(reply);
        else held.replies.push(reply);
      };
      socket.onclose = () => {
        for (const waiter of held.waiting.splice(0)) waiter(null);
      };
    });
  const call = async (id: number, bytes: Uint8Array) => {
    const held = sockets.get(id);
    if (!held) throw new Error('the connection through Tor is closed');
    const reply = new Promise<Uint8Array | null>((resolve) => (held.replies.length > 0 ? resolve(held.replies.shift()!) : held.waiting.push(resolve)));
    held.socket.send(bytes);
    const got = await reply;
    if (!got) throw new Error('the relay closed the connection');
    return got;
  };
  const close = (id: number) => {
    sockets.get(id)?.socket.close();
    sockets.delete(id);
  };
  const asId = (id: number) => Uint8Array.of(0, 0, 0, 0, id >>> 24, (id >>> 16) & 255, (id >>> 8) & 255, id & 255);
  return {
    torStart: async () => undefined,
    torStatus: async () => JSON.stringify({ text: 'done', ready: true }),
    torStop: async () => undefined,
    torRequest: async (url, _token, bytes) => {
      const id = await open(url);
      try {
        return await call(id, bytes);
      } finally {
        close(id);
      }
    },
    torOpen: async (url) => asId(await open(url)),
    torCall: async (id, bytes) => call(number(id), bytes),
    torClose: async (id) => {
      close(number(id));
      return new Uint8Array(0);
    },
  };
}

let relays = new NostrRelays();

function useCore(): void {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  const core = Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core;
  // The Android module gives an event as text, as Nostr has it; the WebAssembly one as its bytes.
  const wrap = wasm.nostrWrap as unknown as (to: Uint8Array, bytes: Uint8Array, now: Uint8Array) => Uint8Array;
  const unwrap = wasm.nostrUnwrap as unknown as (secret: Uint8Array, event: Uint8Array) => Uint8Array;
  setCore({
    ...core,
    ...relayTor(),
    ...relays.core(),
    nostrWrap: async (to, bytes, now) => utf8Decode(wrap(to, bytes, now)),
    nostrUnwrap: async (secret, event) => unwrap(secret, utf8Encode(event)),
  } as Core);
}

// The core as the web app, the computer app and Sailfish OS's have it (lib/crypto-setup.ts): the
// WebAssembly one, guarded, which gives and takes Nostr's events as their bytes, with no Tor.
function useCoreWithoutTor(): void {
  const wasm = createRequire(import.meta.url)(built.pathname) as WebCore;
  assert.ok(!Object.keys(wasm).some((name) => name.startsWith('tor')), 'the WebAssembly core has no Tor');
  setCore(guardCore(wasm));
}

afterEach(() => {
  setNostr(null);
  setThroughTor('off');
  setTorReady(false);
  setNostrOpen(null);
});

// With `needsRelay`, a relay of its own, started before Tor is ready: until it answers, the
// requests that ask whether it does would fail through Tor, and so rest Tor for a minute.
const t = (name: string, fn: (url: string) => Promise<void>, needsRelay = false) =>
  test(name, { skip: !coreReady || (needsRelay && !relayReady) }, async () => {
    files.clear();
    const url = needsRelay ? await startRelay() : '';
    relays = new NostrRelays();
    useCore();
    setThroughTor('messages');
    setTorReady(true);
    await fn(url);
  });

const until = async (done: () => boolean, ms = 5000) => {
  const end = Date.now() + ms;
  while (!done()) {
    if (Date.now() > end) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 10));
  }
};

const message = (r: Received) => {
  assert.equal(r.kind, 'message');
  return r as Extract<Received, { kind: 'message' }>;
};

/** A chat with a queue for its contacts to write to: on the relay at `url`, or a made-up one. */
// Until every piece with these ids has come.
async function allCame(place: PiecePlace | null, ids: string): Promise<void> {
  for (let n = 0; n < 100; n++) {
    if ((await piecesCame(place, ids)).every(Boolean)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail('the pieces did not come');
}

async function chat(holder: 'space' | 'hidden', space: number, url = '') {
  const key = randomBytes(32);
  const e2e = await E2E.open(holder, space, key);
  const ids = url ? await createQueue({ url }) : { recipientId: randomBytes(24), senderId: randomBytes(24) };
  return { e2e, from: toHex(ids.senderId), recipient: ids.recipientId, place: { holder, space, key } as PiecePlace };
}

type Chat = Awaited<ReturnType<typeof chat>>;

/** Alice adds Bob by his link, Bob answers: each is the other's contact, the request accepted. */
async function meet(alice: Chat, bob: Chat, url = 'ws://relay:7879') {
  const code = parseContact(contactLink({ senderHex: bob.from, relayUrl: url, key: toBase64Url(bob.e2e.bundle) }))!;
  const added = await alice.e2e.addContact(code, alice.from);
  const hello = message(await bob.e2e.receive(alice.e2e.pending()[0].first));
  await alice.e2e.firstSent(added.identity);
  const back = await bob.e2e.seal(hello.identity, 'hi', bob.from);
  message(await alice.e2e.receive(back.packet));
  return { toBob: added.identity, toAlice: hello.identity };
}

/** What `from` has still to tell `to` in a message of keys, sealed, given, and taken there. */
async function tell(from: Chat, identity: string, to: Chat) {
  assert.ok(from.e2e.keysDue().includes(identity), 'a message of keys is due');
  const keys = await from.e2e.seal(identity, '', from.from, { keys: true });
  await from.e2e.keysGiven(identity);
  assert.ok(!from.e2e.keysDue().includes(identity), 'and given');
  assert.equal(keys.nostr, null, 'a message of keys goes through the relay');
  return to.e2e.receive(keys.packet);
}

t("the Nostr setting is on unless changed, with the first three relays, whatever the Tor way, and reads nowhere in a build without Nostr", async () => {
  assert.deepEqual(NOSTR_DEFAULT, { on: true, relays: NOSTR_RELAYS }, "Nostr's own Tor switch is off unless turned on");
  assert.equal(NOSTR_RELAYS.length, 3);
  assert.deepEqual(checkedNostr({ on: true, relays: [ONE], tor: true }), { on: true, relays: [ONE], tor: true });
  assert.deepEqual(checkedNostr({ on: true, relays: [ONE], tor: 'yes' }), { on: true, relays: [ONE] });
  assert.deepEqual(checkedNostr(undefined), NOSTR_DEFAULT);
  assert.deepEqual(checkedNostr({ on: false, relays: [ONE, 'https://not.a.relay', ONE, 'ws://plain.example.org', 'ws://x.onion'] }), { on: false, relays: [ONE] });
  const onion = `ws://${'a'.repeat(56)}.onion`;
  assert.deepEqual(checkedNostr({ on: true, relays: [onion] }).relays, [onion], 'without TLS only to an onion address');
  assert.deepEqual(nostrOf(NOSTR_DEFAULT), NOSTR_RELAYS);
  assert.equal(nostrOf({ on: false, relays: NOSTR_RELAYS }), null);
  assert.equal(nostrOf({ on: true, relays: [] }), null);
  assert.equal(canNostr(), true);
  setNostr([ONE, 'http://not.a.relay', ONE, TWO]);
  assert.deepEqual(nostrRelays(), [ONE, TWO]);
  assert.equal(nostrReady(), true);
  setTorReady(false);
  assert.equal(nostrReady(), false, 'texts never wait for Tor');
  setThroughTor('off');
  assert.equal(nostrReady(), true, 'with Tor off, they go straight');
  setNostr(null);
  assert.equal(nostrRelays(), null);
  // A build without Nostr reads nowhere, whatever the space says.
  setCore(null);
  setNostr([ONE]);
  assert.equal(nostrRelays(), null);
});

t('a chat tells each contact the key it reads them with, once, again when its relays change, and that it reads nowhere; texts then say where they go', async () => {
  setNostr([ONE, TWO]);
  const alice = await chat('space', 0);
  const bob = await chat('hidden', 1);
  const { toBob, toAlice } = await meet(alice, bob);
  assert.equal((await alice.e2e.seal(toBob, 'not yet', alice.from)).nostr, null, 'Bob said nothing of Nostr yet');

  // Alice added Bob: her first message told him her key for him. Bob's texts to her then go to her
  // relays, for that key.
  const [aliceKey] = alice.e2e.nostrKeys();
  assert.equal(alice.e2e.nostrKeys().length, 1);
  assert.match(aliceKey.p, /^[0-9a-f]{64}$/);
  assert.deepEqual((await bob.e2e.seal(toAlice, 'to Alice', bob.from)).nostr, { k: aliceKey.p, r: [ONE, TWO] });
  // Her prekeys go in a message of keys of their own, which says the same key.
  message(await tell(alice, toBob, bob));
  assert.deepEqual(alice.e2e.nostrKeys(), [aliceKey]);
  assert.deepEqual((await bob.e2e.seal(toAlice, 'to Alice', bob.from)).nostr, { k: aliceKey.p, r: [ONE, TWO] });

  // Bob's chat is a hidden one: it asks for a bell with each text.
  message(await tell(bob, toAlice, alice));
  const [bobKey] = bob.e2e.nostrKeys();
  assert.notEqual(bobKey.p, aliceKey.p);
  const sealed = await alice.e2e.seal(toBob, 'to Bob', alice.from);
  assert.deepEqual(sealed.nostr, { k: bobKey.p, r: [ONE, TWO], b: true });
  // Only texts: not what is sent for later, which the relay holds, nor reactions or marks.
  assert.equal((await alice.e2e.seal(toBob, 'later', alice.from, { due: Date.now() + 60_000 })).nostr, null);
  assert.equal((await alice.e2e.seal(toBob, '', alice.from, { react: { tag: sealed.tag, emoji: '👍' } })).nostr, null);
  assert.equal((await alice.e2e.seal(toBob, '', alice.from, { got: [sealed.tag] })).nostr, null);
  assert.deepEqual(alice.e2e.keysDue(), []);

  // Other relays: told again, with the same key.
  setNostr([TWO]);
  message(await tell(alice, toBob, bob));
  assert.deepEqual(alice.e2e.nostrKeys(), [aliceKey]);
  assert.deepEqual((await bob.e2e.seal(toAlice, 'to Alice', bob.from)).nostr, { k: aliceKey.p, r: [TWO] });

  // Nostr off: told that she reads nowhere, and nothing goes there, either way.
  setNostr(null);
  message(await tell(alice, toBob, bob));
  assert.equal((await alice.e2e.seal(toBob, 'to Bob', alice.from)).nostr, null);
  setNostr([TWO]);
  message(await tell(alice, toBob, bob));
  assert.equal((await bob.e2e.seal(toAlice, 'to Alice', bob.from)).nostr?.k, aliceKey.p);
  setNostr(null);
  message(await tell(alice, toBob, bob));
  setNostr([TWO]);
  assert.equal((await bob.e2e.seal(toAlice, 'to Alice', bob.from)).nostr, null, 'Alice said she reads nowhere');
});

t('a text the relays did not take goes to the Nostr relays, comes out once on their phone, a bell goes to their relay, and it goes through the relay again only should they not say it came', async (url) => {
  const own: Relay = { url };
  setNostr([ONE, TWO]);
  const alice = await chat('space', 0, url);
  const bob = await chat('hidden', 1, url);
  const { toBob, toAlice } = await meet(alice, bob, url);
  message(await tell(alice, toBob, bob));
  message(await tell(bob, toAlice, alice));

  const came: Extract<Received, { kind: 'message' }>[] = [];
  const stop = readNostr(nostrReaderOf(() => bob.e2e, async (packet) => void came.push(message(await bob.e2e.receive(packet)))));
  try {
    let viaRelay = 0;
    let went: 'nostr' | void = undefined;
    const send = async (text: string, bellTo = own) => {
      const sealed = await alice.e2e.seal(toBob, text, alice.from);
      went = await orNostr(alice.e2e, bellTo, toBob, sealed, [sealed.packet], async () => {
        viaRelay++;
        throw new RelayUnreachableError('the relays are not reached');
      })();
      return sealed;
    };

    const first = await send('through Nostr');
    assert.equal(viaRelay, 1, 'the relays were tried first');
    assert.equal(went, 'nostr', 'it says it went through Nostr, so the note says so');
    await until(() => relays.keptAt(ONE).length === 1 && relays.keptAt(TWO).length === 1);
    const [wrap] = relays.keptAt(ONE);
    assert.equal(wrap.kind, 1059);
    const at = Date.now() / 1000;
    assert.ok(wrap.created_at <= at && wrap.created_at > at - 3700, 'set back by an hour at most');
    // Kept two days, told from the time it says, which does not say when it was made.
    assert.deepEqual(wrap.tags, [
      ['p', bob.e2e.nostrKeys()[0].p],
      ['expiration', String(wrap.created_at + 3600 + 2 * 24 * 3600)],
    ]);
    assert.ok(!JSON.stringify(wrap).includes(alice.e2e.nostrKeys()[0].p), "the wrap names not Alice's key");
    await until(() => came.length === 1);
    assert.deepEqual([came[0].text, came[0].tag, came[0].identity], ['through Nostr', first.tag, toAlice]);

    // Kept for five minutes, then through the relay, quiet as the bell counted it already.
    const now = Date.now();
    assert.deepEqual(alice.e2e.nostrBackupsDue(now), []);
    const [due] = alice.e2e.nostrBackupsDue(now + NOSTR_BACKUP_MS);
    assert.deepEqual([due.identity, due.tag, due.quiet], [toBob, first.tag, true]);
    assert.deepEqual(due.packet, first.packet);
    await sendNostrBackups(alice.e2e, own, now + NOSTR_BACKUP_MS);
    assert.deepEqual(alice.e2e.nostrBackupsDue(now + NOSTR_BACKUP_MS), []);
    const news = await waitForNews(own, bob.recipient, 0, NO_NEWS);
    assert.deepEqual([news?.messages, news?.unmarked], [1, 0], 'one message: the bell');

    // The bell opens in nothing, and the backup is seen once.
    const bell = await receiveMessage(own, bob.recipient, false);
    assert.ok(bell);
    assert.deepEqual(await bob.e2e.receive(bell), { kind: 'refused', reason: 'unknown', theirs: true });
    const backup = await receiveMessage(own, bob.recipient, false);
    assert.deepEqual(backup, first.packet);
    assert.notEqual((await bob.e2e.receive(backup!)).kind, 'message');
    await new Promise((r) => setTimeout(r, 50));
    assert.equal(came.length, 1, 'once though two relays carried it');

    // One Bob says came is kept no more.
    const second = await send('and again');
    await until(() => came.length === 2);
    assert.equal(alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS).length, 1);
    const got = await bob.e2e.seal(toAlice, '', bob.from, { got: [second.tag] });
    await alice.e2e.receive(got.packet);
    assert.deepEqual(alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS), []);

    // A bell their relay did not take counted nothing: then the backup is the message that counts.
    const third = await send('no bell went', { url: 'ws://127.0.0.1:9' });
    const due3 = alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS);
    assert.deepEqual(due3.map((due) => [due.tag, due.quiet]), [[third.tag, false]]);
    assert.equal(viaRelay, 3, 'each tried the relays first');
  } finally {
    stop();
  }
}, true);

t('a text goes through the relay first, and Nostr is asked only when the relays did not take it', async (url) => {
  const own: Relay = { url };
  setNostr([ONE, TWO]);
  const alice = await chat('space', 0, url);
  const bob = await chat('space', 1, url);
  const { toBob, toAlice } = await meet(alice, bob, url);
  message(await tell(bob, toAlice, alice));
  let viaRelay = 0;
  const send = (text: string, relayDown = false) =>
    alice.e2e.seal(toBob, text, alice.from).then((sealed) => {
      assert.deepEqual(sealed.nostr?.r, [ONE, TWO]);
      return orNostr(alice.e2e, own, toBob, sealed, [sealed.packet], async () => {
        viaRelay++;
        if (relayDown) throw new RelayUnreachableError('the relays are not reached');
        await sendSealed(own, sealed, [sealed.packet], 'message', async () => undefined);
      })();
    });
  const taken = async () => {
    const packet = await receiveMessage(own, bob.recipient, false);
    return packet ? message(await bob.e2e.receive(packet)).text : null;
  };

  // The relay takes it: Nostr is not asked, and nothing is kept to go again.
  assert.equal(await send('through the relay'), undefined, 'through the relay, it does not say Nostr');
  assert.equal(viaRelay, 1);
  assert.equal(await taken(), 'through the relay');
  await new Promise((r) => setTimeout(r, 100));
  assert.deepEqual([relays.keptAt(ONE).length, relays.keptAt(TWO).length], [0, 0], 'no Nostr relay was given it');
  assert.deepEqual(alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS), []);

  // The relays down while Tor is not ready: it waits, as the relay said.
  setTorReady(false);
  await assert.rejects(send('Tor starts', true), RelayUnreachableError);
  assert.equal(viaRelay, 2);
  setTorReady(true);

  // The relays down, and no Nostr relay takes it either: it waits too, and the Nostr screen says why each did not.
  relays.down.add(ONE);
  relays.refusing.add(TWO);
  await assert.rejects(send('no Nostr relay', true), RelayUnreachableError);
  assert.equal(viaRelay, 3);
  const [down, refusing] = [nostrStates().get(ONE)?.sent, nostrStates().get(TWO)?.sent];
  assert.equal(down?.took, false);
  assert.match(down?.why ?? '', /^Not reached: Tor took too long/);
  assert.equal(refusing?.took, false);
  assert.match(refusing?.why ?? '', /^It refused it/);
  assert.deepEqual(alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS), []);

  // One Nostr relay that takes it is enough; a space chat asks for no bell, so its backup is no quiet one.
  relays.down.delete(ONE);
  assert.equal(await send('one relay', true), 'nostr');
  assert.equal(viaRelay, 4);
  assert.equal(nostrStates().get(ONE)?.sent?.took, true, 'and that one took it');
  assert.equal(relays.keptAt(ONE).length, 1);
  assert.equal(await taken(), null, 'no bell');
  assert.equal(alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS)[0]?.quiet, false);
}, true);

t('slow Nostr relays never hold a text back: with the relay up they are not waited for', async (url) => {
  const own: Relay = { url };
  setNostr([ONE, TWO]);
  const alice = await chat('space', 0, url);
  const bob = await chat('space', 1, url);
  const { toBob, toAlice } = await meet(alice, bob, url);
  message(await tell(bob, toAlice, alice));
  relays.late.set(ONE, 400);
  relays.late.set(TWO, 400);
  let viaRelay = 0;
  const send = async (text: string, relayDown = false) => {
    const sealed = await alice.e2e.seal(toBob, text, alice.from);
    return orNostr(alice.e2e, own, toBob, sealed, [sealed.packet], async () => {
      viaRelay++;
      if (relayDown) throw new RelayUnreachableError('the relays are not reached');
      await sendSealed(own, sealed, [sealed.packet], 'message', async () => undefined);
    })();
  };

  const started = Date.now();
  assert.equal(await send('slow Nostr'), undefined);
  assert.ok(Date.now() - started < 400, 'it did not wait for the Nostr relays');
  assert.equal(viaRelay, 1);
  const packet = await receiveMessage(own, bob.recipient, false);
  assert.equal(packet ? message(await bob.e2e.receive(packet)).text : null, 'slow Nostr');
  assert.deepEqual(alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS), []);

  // The relays down: a slow Nostr relay takes it in the end, so it went, and is kept to go through the relay later.
  assert.equal(await send('relay down', true), 'nostr');
  assert.equal(viaRelay, 2);
  assert.equal(alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS).length, 1);
}, true);

t('a text their phone says came, and read, before the Nostr relay said it took it shows so once kept, not one tick', async () => {
  // As primal did: it passes the text on at once, and says it took it seconds later.
  setNostr([ONE]);
  relays.slowToSay.set(ONE, 300);
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const { toBob, toAlice } = await meet(alice, bob);
  message(await tell(bob, toAlice, alice));
  const chats = { e2e: alice.e2e, history: await History.open('space', 0, alice.place.key), voiceParts: new VoiceAssembler() };
  const peer = `contact:${toBob}`;
  // Bob's chat is open on Alice: what comes is said to have come, and read, at once.
  const said: Uint8Array[] = [];
  const stop = readNostr(
    nostrReaderOf(
      () => bob.e2e,
      async (packet) => {
        const { tag } = message(await bob.e2e.receive(packet));
        said.push((await bob.e2e.seal(toAlice, '', bob.from, { got: [tag] })).packet);
        said.push((await bob.e2e.seal(toAlice, '', bob.from, { read: [tag] })).packet);
      },
    ),
  );
  try {
    const sealed = await alice.e2e.seal(toBob, 'read before it went', alice.from);
    let viaRelay = 0;
    const going = orNostr(alice.e2e, { url: 'ws://127.0.0.1:9' }, toBob, sealed, [sealed.packet], async () => {
      viaRelay++;
      throw new RelayUnreachableError('the relays are not reached');
    })();
    // Alice's look takes what Bob said while her text is still going, as her chats do (lib/receiver.ts keep).
    await until(() => said.length === 2);
    for (const packet of said) await keepReceived(chats, await alice.e2e.receive(packet));
    assert.equal(await going, 'nostr');
    assert.equal(viaRelay, 1, 'the relays were tried first');
    // The chat keeps what it sends once it went (app/chat.tsx sendShown): read, as Bob's phone said;
    // in that chat only, and once.
    await chats.history.add({ peer: `contact:${toAlice}`, text: 'another chat', mine: true, at: Date.now() - 2, tag: sealed.tag });
    await chats.history.add({ peer, text: 'read before it went', mine: true, at: Date.now() - 1, tag: sealed.tag, lasts: 60 });
    await chats.history.add({ peer, text: 'the next', mine: true, at: Date.now(), tag: newTag() });
    assert.deepEqual(chats.history.messages().map((m) => [m.text, m.mark]), [['another chat', 0], ['read before it went', 2], ['the next', 0]], 'read, not one tick');
    const kept = chats.history.messages().find((m) => m.text === 'read before it went');
    assert.ok(kept?.until && kept.until <= Date.now() + 60_000 && !kept.lasts, 'a disappearing one starts its time');
  } finally {
    stop();
  }
});

t('a reader that waits for Tor asks as soon as Tor is ready, and one whose keys come later as soon as they come', async () => {
  setNostr([ONE]);
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  await meet(alice, bob);
  setTorReady(false);
  const stopWaiting = readNostr(nostrReaderOf(() => alice.e2e, async () => undefined));
  try {
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(relays.asked.length, 0);
    // Well before its next look, half a minute on.
    setTorReady(true);
    await until(() => relays.asked.length === 1, 3000);
  } finally {
    stopWaiting();
  }
  // No keys yet, as for a space whose chats are still opening; then they come.
  let keys: E2E | null = null;
  const stopLater = readNostr(nostrReaderOf(() => keys, async () => undefined));
  try {
    await new Promise((r) => setTimeout(r, 200));
    const before = relays.asked.length;
    keys = alice.e2e;
    nostrKeysChanged();
    await until(() => relays.asked.length > before, 3000);
  } finally {
    stopLater();
  }
});

t('a reader asks from over an hour before it last read, keeps until when, and asks again at once when the keys change', async () => {
  setNostr([ONE]);
  const alice = await chat('space', 0);
  const bob = await chat('space', 1);
  const carol = await chat('hidden', 2);
  const toBob = (await meet(alice, bob)).toBob;
  const [bobsKey] = alice.e2e.nostrKeys();

  const stopSpace = readNostr(nostrReaderOf(() => alice.e2e, async () => undefined));
  await until(() => relays.asked.length === 1);
  const now = Math.floor(Date.now() / 1000);
  const [first] = relays.asked;
  assert.deepEqual(first.filters.map((f) => [f.kinds, f['#p']]), [[[1059], [bobsKey.p]]]);
  assert.ok(Math.abs(first.filters[0].since! - (now - 2 * 24 * 3600 - 3600)) <= 2, 'never read: what a relay keeps a wrap for, and the hour it may be set back');
  await until(() => alice.e2e.nostrSince() > 0);
  assert.ok(Math.abs(alice.e2e.nostrSince() - now) <= 2);

  // A key made for another contact, as it is added: asked again at once, the subscription before closed.
  await meet(alice, carol);
  await until(() => relays.asked.length === 2);
  const second = relays.asked[1];
  assert.notEqual(second.sub, first.sub);
  assert.deepEqual(new Set(second.filters[0]['#p']), new Set(alice.e2e.nostrKeys().map((k) => k.p)));
  assert.equal(alice.e2e.nostrKeys().length, 2);
  assert.ok(Math.abs(second.filters[0].since! - (alice.e2e.nostrSince() - 3600 - 600)) <= 2, 'from over an hour before it read');
  const [line] = relays.lines.values();
  assert.deepEqual([...line.subs.keys()], [second.sub]);

  // A hidden place opened reads on the same connection, with a filter of its own.
  message(await tell(carol, carol.e2e.contacts()[0].identity, alice));
  const stopHidden = readNostr(nostrReaderOf(() => carol.e2e, async () => undefined));
  await until(() => relays.asked.length === 3);
  assert.equal(relays.asked[2].filters.length, 2);
  assert.equal(relays.lines.size, 1);
  stopHidden();
  await until(() => relays.asked.length === 4);
  assert.equal(relays.asked[3].filters.length, 1);

  // Nothing reads: the connection closes.
  stopSpace();
  await until(() => relays.lines.size === 0);
});

t('several packets go in one wrap, and one alone as it is, so an Erevos from before reads it', async () => {
  const a = Uint8Array.of(1, 4, 9, 9);
  const b = Uint8Array.of(1, 3, 7);
  assert.deepEqual(packNostr([a]), a);
  assert.equal(nostrPacked([a]), a.length);
  const both = packNostr([a, b]);
  assert.equal(both.length, nostrPacked([a, b]));
  assert.deepEqual(unpackNostr(both), [a, b]);
  assert.deepEqual(unpackNostr(a), [a]);
  assert.deepEqual(unpackNostr(both.slice(0, both.length - 1)), [], 'cut short: nothing');
  assert.deepEqual(unpackNostr(Uint8Array.of(9, 1, 0, 0, 0, 9, 1)), [], 'a length past the end: nothing');
});

t('a link says where it reads on Nostr, and a link read keeps it, checked', async () => {
  const k = 'ab'.repeat(32);
  const relays = [ONE, TWO];
  const link = contactLink({ senderHex: '', relayUrl: '', key: 'AAAA', nostr: { k, r: relays } });
  assert.match(link, /&nk=[0-9a-f]{64}&nr=/);
  assert.deepEqual(parseContact(link)?.nostr, { k, r: relays });
  const many = Array.from({ length: MOST_NOSTR + 3 }, (_, i) => `wss://n${i}.example.org`);
  assert.equal(parseContact(contactLink({ senderHex: '', relayUrl: '', key: 'AAAA', nostr: { k, r: many } }))?.nostr?.r.length, MOST_NOSTR);
  assert.equal(parseContact(`${link.replace(/&nk=[0-9a-f]+/, '&nk=xyz')}`)?.nostr, undefined, 'no key of its shape: none');
  assert.equal(parseContact(link.replace(/&nr=.*/, '&nr=http%3A%2F%2Fplain.example.org'))?.nostr, undefined, 'no relay of its shape: none');
});

t('with no relay between the two, the first message and texts go through Nostr, the first with each until they answer; texts again each day until they came', async () => {
  setNostr([ONE]);
  const bob = await chat('space', 1);
  const alice = await chat('space', 0);
  const bobsLink = (await bob.e2e.linkNostr())!;
  assert.deepEqual(bobsLink.r, [ONE]);
  assert.deepEqual(bob.e2e.nostrKeys().map((k) => k.p), [bobsLink.k], 'Bob reads on the key of his link');

  // Alice has no relay queue, nor does Bob's link name one: only Nostr is between them.
  const code = parseContact(contactLink({ senderHex: '', relayUrl: '', key: toBase64Url(bob.e2e.bundle), nostr: bobsLink }))!;
  const { identity: toBob } = await alice.e2e.addContact(code, '');
  assert.equal(alice.e2e.readsOnNostr(toBob), true);
  const came: Extract<Received, { kind: 'message' }>[] = [];
  // What opens as a message; the first packet again, with a later wrap, is refused as one seen.
  const stop = readNostr(
    nostrReaderOf(
      () => bob.e2e,
      async (packet) => {
        const received = await bob.e2e.receive(packet);
        if (received.kind === 'message') came.push(received);
      },
    ),
  );
  try {
    const hello = await alice.e2e.seal(toBob, '', '', {});
    assert.ok(hello.first, 'the first packet goes with it');
    assert.equal(hello.nostr?.k, bobsLink.k, "to the key of Bob's link");
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, hello, [hello.packet])!(), 'nostr');
    await until(() => came.length === 2);
    assert.equal(relays.keptAt(ONE).length, 1, 'both in one wrap');
    const toAlice = came[0].identity;
    assert.equal(came[0].request, true, 'from his link, as from the relay: a request');
    assert.equal(came[1].identity, toAlice);
    await bob.e2e.acceptRequest(toAlice);

    // A text, with the first still, as Bob has not answered yet; kept to go again.
    const text = await alice.e2e.seal(toBob, 'hello Bob', '', {});
    assert.ok(text.first);
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, text, [text.packet])!(), 'nostr');
    await until(() => came.length === 3);
    assert.equal(came[2].text, 'hello Bob');
    const now = Date.now();
    assert.deepEqual(alice.e2e.nostrAgainDue(now), []);
    assert.deepEqual(alice.e2e.nostrAgainDue(now + NOSTR_AGAIN_MS).map((due) => due.tag), [text.tag]);
    assert.deepEqual(alice.e2e.nostrBackupsDue(now + NOSTR_BACKUP_MS), [], 'no relay to back it up');

    // Bob answers, through Nostr too, to the key Alice's first message said; then the first goes no more.
    const back = await bob.e2e.seal(toAlice, 'hi Alice', bob.from, { got: [text.tag] });
    assert.ok(back.nostr, 'Alice said where she reads');
    message(await alice.e2e.receive(back.packet));
    assert.equal((await alice.e2e.seal(toBob, 'and again', '', {})).first, null, 'their answer means they have the first');
    assert.deepEqual(alice.e2e.nostrAgainDue(now + NOSTR_AGAIN_MS), [], 'what came goes no more');

    // One not said to have come goes again each day, until it went NOSTR_AGAIN_MOST times.
    const lost = await alice.e2e.seal(toBob, 'lost', '', {});
    await nostrOnlyWay(alice.e2e, toBob, lost, [lost.packet])!();
    let at = Date.now();
    for (let n = 1; n < NOSTR_AGAIN_MOST; n++) {
      at += NOSTR_AGAIN_MS;
      assert.equal(alice.e2e.nostrAgainDue(at).length, 1, `due again, the ${n + 1}th time`);
      await sendNostrAgain(alice.e2e, at);
    }
    assert.deepEqual(alice.e2e.nostrAgainDue(at + NOSTR_AGAIN_MS), []);

    // A relay invite rides in a message with nothing else, and is read only of its shape.
    const code64 = 'cd'.repeat(32);
    const invite = await alice.e2e.seal(toBob, '', '', { more: { ri: { r: 'wss://relay.example.org', c: code64 } } });
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, invite, [invite.packet])!(), 'nostr');
    await until(() => came.some((m) => m.more.ri));
    const offered = offerOf(came.find((m) => m.more.ri)!);
    assert.deepEqual(offered, { relayUrl: 'wss://relay.example.org', code: code64, from: toAlice, request: false });
    assert.equal(offerOf(message(await bob.e2e.receive((await alice.e2e.seal(toBob, '', '', { more: { ri: { r: 'ws://relay.example.org', c: code64 } } })).packet))), null, 'in the clear across the internet: none');
  } finally {
    stop();
  }
});

t("with Tor off, the space's texts go to the Nostr relays and are read there straight, never through Tor; as Tor goes on or off, the connections open again the new way", async () => {
  setThroughTor('off');
  setNostrOpen(relays.opener());
  setNostr([ONE]);
  const bob = await chat('space', 1);
  const alice = await chat('space', 0);
  const bobsLink = (await bob.e2e.linkNostr())!;
  const code = parseContact(contactLink({ senderHex: '', relayUrl: '', key: toBase64Url(bob.e2e.bundle), nostr: bobsLink }))!;
  const { identity: toBob } = await alice.e2e.addContact(code, '');
  const came: string[] = [];
  const stop = readNostr(
    nostrReaderOf(
      () => bob.e2e,
      async (packet) => {
        const received = await bob.e2e.receive(packet);
        if (received.kind === 'message') came.push(received.text);
      },
    ),
  );
  const open = (straight: boolean) => [...relays.lines.keys()].filter((id) => relays.straightIds.has(id) === straight).length;
  const send = async (text: string) => {
    const sealed = await alice.e2e.seal(toBob, text, '', {});
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, sealed, [sealed.packet])!(), 'nostr');
    await until(() => came.includes(text));
  };
  try {
    assert.equal(nostrReady(), true, 'with Tor off, Nostr does not wait for Tor');
    await send('straight');
    assert.equal(relays.throughTor, 0, 'nothing through Tor');
    assert.ok(relays.straight >= 2, 'one connection that reads, one that sends');

    // Tor on: the straight connections close, and those that read and send open through Tor.
    setThroughTor('messages');
    await until(() => open(true) === 0 && open(false) >= 1);
    const straight = relays.straight;
    await send('through Tor');
    assert.equal(relays.straight, straight, 'none straight any more');
    assert.ok(relays.throughTor >= 2);

    // Off again: back straight, none through Tor.
    setThroughTor('off');
    await until(() => open(false) === 0 && open(true) >= 1);
    await send('straight again');
    assert.equal(open(false), 0);
  } finally {
    stop();
  }
});

t("with Tor off, a chat that goes only through Tor sends through Tor alone, its key is read through Tor alone, the others straight; Nostr's own switch takes all of it through Tor", async () => {
  setThroughTor('off');
  setNostrOpen(relays.opener());
  setNostr([ONE]);
  const bob = await chat('space', 1);
  const alice = await chat('space', 0);
  const bobsLink = (await bob.e2e.linkNostr())!;
  const code = parseContact(contactLink({ senderHex: '', relayUrl: '', key: toBase64Url(bob.e2e.bundle), nostr: bobsLink }))!;
  const { identity: toBob } = await alice.e2e.addContact(code, '');
  const came: string[] = [];
  const stop = readNostr(
    nostrReaderOf(
      () => bob.e2e,
      async (packet) => {
        const received = await bob.e2e.receive(packet);
        if (received.kind === 'message') came.push(received.text);
      },
    ),
  );
  try {
    await until(() => relays.straight === 1);
    // Alice's chat with Bob goes only through Tor: what she sends there never goes straight.
    await alice.e2e.setTor(toBob, true);
    assert.equal(nostrReady(alice.e2e.torChat(toBob)), true);
    const sealed = await alice.e2e.seal(toBob, 'only through Tor', '', {});
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, sealed, [sealed.packet])!(), 'nostr');
    await until(() => came.includes('only through Tor'));
    assert.equal(relays.straight, 1, "only Bob's reading went straight");
    assert.ok(relays.throughTor >= 1, "Alice's text went through Tor");
  } finally {
    stop();
  }

  // What is read: the keys of chats that go only through Tor on connections through Tor, the others straight.
  const keys = [
    { s: toHex(randomBytes(32)), p: 'a'.repeat(64) },
    { s: toHex(randomBytes(32)), p: 'b'.repeat(64) },
  ];
  const tor = new Set<string>();
  const reading = readNostr({ keys: () => keys, tor: () => tor, since: () => 0, caught: () => undefined, take: async () => undefined });
  const asked = (straight: boolean) =>
    [...relays.lines.entries()]
      .filter(([id, line]) => !line.closed && relays.straightIds.has(id) === straight)
      .flatMap(([, line]) => [...line.subs.values()].flat().flatMap((filter) => filter['#p'] ?? []))
      .sort()
      .join();
  try {
    await until(() => asked(true) === `${keys[0].p},${keys[1].p}`);
    tor.add(keys[1].p);
    nostrKeysChanged();
    await until(() => asked(true) === keys[0].p && asked(false) === keys[1].p);
    // Nostr's own switch on: all through Tor, none straight, with the space's Tor way Nothing.
    setNostr([ONE], true);
    assert.equal(nostrReady(), true);
    await until(() => asked(true) === '' && asked(false) === `${keys[0].p},${keys[1].p}`);
    // Off again: the chat's key still through Tor alone.
    setNostr([ONE], false);
    await until(() => asked(true) === keys[0].p && asked(false) === keys[1].p);
  } finally {
    reading();
  }
});

test('a build with no Tor reaches the Nostr relays straight with the way Nothing or Messages, and none with Everything, its own Tor switch, or for a chat only through Tor', { skip: !coreReady }, async () => {
  files.clear();
  relays = new NostrRelays();
  useCoreWithoutTor();
  try {
    // As the checks' core, which has no Tor either: no Nostr, until the build says it goes straight.
    assert.equal(canNostrTor(), false);
    assert.equal(canNostr(), false);
    setNostr([ONE]);
    assert.equal(nostrRelays(), null, 'reads nowhere');
    setNostrStraight(true);
    assert.equal(canNostr(), true);
    assert.equal(canNostrTor(), false);

    setNostrOpen(relays.opener());
    setThroughTor('messages');
    setTorReady(false);
    setNostr([ONE]);
    assert.deepEqual(nostrRelays(), [ONE]);
    assert.equal(nostrReady(), true, 'with Messages, straight, as its requests to the servers go');
    assert.equal(nostrReady(true), false, 'never for a chat that goes only through Tor');

    const bob = await chat('space', 1);
    const alice = await chat('space', 0);
    const bobsLink = (await bob.e2e.linkNostr())!;
    assert.ok(bobsLink, 'its link says where it reads on Nostr');
    const code = parseContact(contactLink({ senderHex: '', relayUrl: '', key: toBase64Url(bob.e2e.bundle), nostr: bobsLink }))!;
    const { identity: toBob } = await alice.e2e.addContact(code, '');
    const came: string[] = [];
    const stop = readNostr(
      nostrReaderOf(
        () => bob.e2e,
        async (packet) => {
          const received = await bob.e2e.receive(packet);
          if (received.kind === 'message') came.push(received.text);
        },
      ),
    );
    const open = () => [...relays.lines.values()].filter((line) => !line.closed).length;
    const send = async (text: string) => {
      const sealed = await alice.e2e.seal(toBob, text, '', {});
      return nostrOnlyWay(alice.e2e, toBob, sealed, [sealed.packet])!();
    };
    try {
      assert.equal(await send('straight'), 'nostr');
      await until(() => came.includes('straight'));
      assert.equal(relays.throughTor, 0, 'nothing through Tor');
      assert.ok(relays.straight >= 2, 'one connection that reads, one that sends');

      // Everything through Tor, as a phone's backup may bring it: none, and what was open closes.
      setThroughTor('all');
      assert.equal(nostrReady(), false);
      await until(() => open() === 0);
      await assert.rejects(send('waits'), RelayUnreachableError, 'it waits, as with Tor not ready');
      setThroughTor('messages');
      await until(() => open() >= 1);

      // Nostr's own Tor switch on: none either.
      setNostr([ONE], true);
      assert.equal(nostrReady(), false);
      await until(() => open() === 0);
      setNostr([ONE], false);
      await until(() => open() >= 1);

      // A chat that goes only through Tor: nothing of it goes straight, nor is its key read.
      await alice.e2e.setTor(toBob, true);
      await assert.rejects(send('only through Tor'), RelayUnreachableError);
      const straight = relays.straight;
      await assert.rejects(publishNostr({ k: bobsLink.k, r: [ONE] }, utf8Encode('x'), true), /no Tor/);
      assert.equal(relays.straight, straight, 'never straight');
      await alice.e2e.setTor(toBob, false);
      assert.equal(await send('straight again'), 'nostr');
      await until(() => came.includes('straight again'));
      assert.ok(!came.includes('waits') && !came.includes('only through Tor'));
      assert.equal(relays.throughTor, 0);
    } finally {
      stop();
    }
  } finally {
    setNostrStraight(false);
    setCore(null);
  }
});

t('with no relay between the two, a voice message goes in wraps, a photo in pieces before its message, and a larger file to a file server', async () => {
  setNostr([ONE]);
  const bob = await chat('space', 1);
  const alice = await chat('space', 0);
  const bobsLink = (await bob.e2e.linkNostr())!;
  const code = parseContact(contactLink({ senderHex: '', relayUrl: '', key: toBase64Url(bob.e2e.bundle), nostr: bobsLink }))!;
  const { identity: toBob } = await alice.e2e.addContact(code, '');
  const came: Extract<Received, { kind: 'message' }>[] = [];
  const stop = readNostr(
    nostrReaderOf(
      () => bob.e2e,
      async (packet) => {
        const received = await bob.e2e.receive(packet);
        if (received.kind === 'message') came.push(received);
      },
      () => bob.place,
    ),
  );
  // A file server: what is put on it by its hash.
  const server = new Map<string, Uint8Array>();
  setNostrHttp(async (method, url, _headers, body) => {
    if (method === 'PUT') {
      const hash = toHex(sha256Bytes(body!));
      server.set(hash, body!);
      return { status: 200, bytes: utf8Encode(JSON.stringify({ url: `https://files.example.org/${hash}`, sha256: hash })) };
    }
    const kept = server.get(url.split('/').pop()!);
    return kept ? { status: 200, bytes: kept } : { status: 404, bytes: new Uint8Array() };
  });
  try {
    const hello = await alice.e2e.seal(toBob, '', '', {});
    await nostrOnlyWay(alice.e2e, toBob, hello, [hello.packet])!();
    await until(() => came.length === 2);
    await bob.e2e.acceptRequest(came[0].identity);
    const place = alice.e2e.nostrPlace(toBob)!;
    assert.ok(place);

    // A voice message: its parts, three or four to a wrap, none to the relay.
    const sound = randomBytes(34_000);
    const voice = await alice.e2e.sealVoice(toBob, sound, 8000, '', {});
    assert.ok(voice.packets.length >= 4);
    assert.ok(voice.nostr, 'voice messages go through Nostr');
    const before = came.length;
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, voice, voice.packets)!(), 'nostr');
    await until(() => came.filter((m) => m.voice).length === voice.packets.length);
    assert.ok(came.length - before === voice.packets.length);
    assert.ok(relays.keptAt(ONE).length >= 2, 'in more than one wrap, as they do not all fit');

    // A photo: pieces first, each in a wrap, then the message that offers it.
    const photo = randomBytes(100_000);
    const meta = { name: 'a.jpg', mime: 'image/jpeg', kind: 'photo' as const };
    const offer = await offerOnNostr(bytesSource(photo), meta, place);
    assert.equal(offer.via, 'nostr');
    assert.equal(offer.ids.length / 48, 4);
    assert.deepEqual(readOffer(offer), offer, 'a message carries it as it is');
    const sealed = await alice.e2e.sealFile(toBob, offer, '', {});
    assert.ok(sealed.nostr);
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, sealed, [sealed.packet])!(), 'nostr');
    await until(() => came.some((m) => m.file));
    const ref = offerRef(readOffer(came.find((m) => m.file)!.file)!);
    assert.ok(isFileRef(ref));
    await allCame(bob.place, ref.from!.ids);
    assert.equal(heldPieces(), 0, 'kept in the place it came for, none in memory');
    assert.deepEqual(await piecesCame(alice.place, ref.from!.ids), [false, false, false, false], 'none in another place');
    assert.ok(![...files.keys()].some((name) => name.startsWith('erevos-piece')), 'nothing in the files of before');
    await assert.rejects(takeFile(null, ref, undefined, undefined, alice.place), PiecesMissingError, 'another place does not take it');
    const taken = await takeFile(null, ref, undefined, undefined, bob.place);
    assert.deepEqual(await readFile(taken), photo, 'the photo, whole');
    assert.deepEqual(await piecesCame(bob.place, ref.from!.ids), [false, false, false, false], 'its pieces are dropped once taken');
    assert.ok(isFileRef(taken) && !taken.from);
    assert.equal(taken.chunk, chunkPlan(photo.length).chunk, 'kept in the usual chunks, so a linked device or a forward through a relay takes its offer');
    assert.ok(readOffer({ ...taken, relay: 'wss://relay.example.org', ids: '00'.repeat(24 * taken.count) }), 'an offer of it as it is kept reads');

    // A piece that is missing: nothing is taken, and it says how many came.
    const lacking = await offerOnNostr(bytesSource(randomBytes(70_000)), meta, place);
    const lackingRef = offerRef(lacking);
    await allCame(bob.place, lackingRef.from!.ids);
    const ids = lacking.ids;
    await dropPieces(bob.place, ids.slice(48, 96));
    await assert.rejects(takeFile(null, lackingRef, undefined, undefined, bob.place), PiecesMissingError);

    // A larger photo, and a file, go to a file server as one blob; the server holds only noise.
    const video = randomBytes(300_000);
    const filed = await offerOnNostr(bytesSource(video), { name: 'v.mp4', mime: 'video/mp4', kind: 'file' }, place);
    assert.equal(filed.via, 'blossom');
    assert.equal(server.size, 1);
    assert.ok(![...server.values()][0].some((_, at, all) => at + 8 < all.length && Buffer.from(all.slice(at, at + 8)).equals(Buffer.from(video.slice(0, 8)))), 'encrypted');
    assert.deepEqual(readOffer(filed), filed);
    const blobRef = offerRef(filed);
    assert.ok(isFileRef(blobRef));
    assert.deepEqual(await readFile(await takeFile(null, blobRef)), video);
    // A blob changed on the server is not taken.
    const [hash] = [...server.keys()];
    server.set(hash, new Uint8Array(server.get(hash)!).fill(1));
    await assert.rejects(takeFile(null, offerRef(filed)), FileDamagedError);
    // One too large for a server says so.
    await assert.rejects(offerOnNostr({ size: 21_000_000, read: async () => new Uint8Array() }, { name: 'big', mime: 'application/zip', kind: 'file' }, place), FileTooLargeError);
  } finally {
    stop();
    setNostrHttp(null);
  }
});

t('a closed place that receives reads its texts on Nostr too, tells their sender they came, and leaves them while its chat screen holds it', async (url) => {
  const own: Relay = { url };
  setNostr([ONE]);
  // Bob's space is open, its hidden chats in pocket 1 closed, their switch on.
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  setCurrentSpace(0, spaceKey);
  await prepareKeepEntries();
  const ids = await createQueue(own);
  await saveHiddenData(0, 1, placeKey, { ...EMPTY_SPACE, url, ownQueue: { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) } });
  const place = await placeChats(0, 1, placeKey);
  const bob: Chat = { e2e: place.e2e, from: toHex(ids.senderId), recipient: ids.recipientId, place: place.pieces! };
  const alice = await chat('space', 5, url);
  const { toBob, toAlice } = await meet(alice, bob, url);
  if (bob.e2e.contacts().find((c) => c.identity === toAlice)?.request) await bob.e2e.acceptRequest(toAlice);
  message(await tell(alice, toBob, bob));
  message(await tell(bob, toAlice, alice));
  await keepPlace(0, spaceKey, 1, placeKey);
  setAppShown(true);
  const stop = startPlaceReceiver(30);
  const texts = () => place.history.messages().map((m) => [m.text, !!m.nostr]);
  const send = async (text: string) => {
    const sealed = await alice.e2e.seal(toBob, text, alice.from);
    const went = await orNostr(alice.e2e, own, toBob, sealed, [sealed.packet], async () => {
      throw new Error('it went through the relay');
    })();
    assert.equal(went, 'nostr');
    return sealed;
  };
  try {
    await until(() => receivesPocket(0, 1));
    const first = await send('on Nostr');
    await until(() => texts().some(([text, nostr]) => text === 'on Nostr' && nostr));
    // Its sender is told it came, so it is kept for the relay no more.
    for (const end = Date.now() + 5000; alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS).length > 0; ) {
      if (Date.now() > end) throw new Error('timed out');
      const bytes = await receiveMessage(own, alice.recipient);
      if (bytes) await alice.e2e.receive(bytes);
      else await new Promise((r) => setTimeout(r, 20));
    }
    assert.ok(!alice.e2e.nostrBackupsDue(Date.now() + NOSTR_BACKUP_MS).some((due) => due.tag === first.tag));

    // While its chat screen holds it, the screen reads Nostr itself; let go, the place does again.
    const release = await holdPlace(0, 1);
    await send('held');
    await new Promise((r) => setTimeout(r, 300));
    assert.ok(!texts().some(([text]) => text === 'held'));
    release();
    await until(() => texts().some(([text, nostr]) => text === 'held' && nostr));
    assert.equal(texts().filter(([text]) => text === 'on Nostr').length, 1, 'kept once');
  } finally {
    stop();
    (await holdPlace(0, 1))();
    forgetPlaceChats();
    setCurrentSpace(null);
  }
}, true);

t('a hidden place with no relay goes through Nostr as the space does: closed, it reads there, says what came and sends what waited; open, it hands its texts there', async () => {
  setNostr([ONE]);
  // Bob's hidden chats in pocket 1 have no relay, their switch on; nor has Alice one.
  const spaceKey = randomBytes(32);
  const placeKey = randomBytes(32);
  setCurrentSpace(0, spaceKey);
  await prepareKeepEntries();
  await saveHiddenData(0, 1, placeKey, EMPTY_SPACE);
  const place = await placeChats(0, 1, placeKey);
  const bobsLink = (await place.e2e.linkNostr())!;
  assert.ok(bobsLink, 'hidden chats read on Nostr by their link too');
  const alice = await chat('space', 5);
  const { identity: toBob } = await alice.e2e.addContact(parseContact(contactLink({ senderHex: '', relayUrl: '', key: toBase64Url(place.e2e.bundle), nostr: bobsLink }))!, '');
  const came: Extract<Received, { kind: 'message' }>[] = [];
  const stopAlice = readNostr(
    nostrReaderOf(
      () => alice.e2e,
      async (packet) => {
        const received = await alice.e2e.receive(packet);
        if (received.kind === 'message') came.push(received);
      },
    ),
  );
  await keepPlace(0, spaceKey, 1, placeKey);
  setAppShown(true);
  const stop = startPlaceReceiver(30);
  const texts = () => place.history.messages().map((m) => [m.text, !!m.nostr]);
  try {
    await until(() => receivesPocket(0, 1));
    const hello = await alice.e2e.seal(toBob, 'hello Bob', '', {});
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, hello, [hello.packet])!(), 'nostr');
    await until(() => texts().some(([text, nostr]) => text === 'hello Bob' && nostr));
    const toAlice = place.e2e.contacts()[0].identity;
    // A message request hears nothing back until accepted; then, closed, the place says through
    // Nostr what came, and Alice's phone sends it there again no more.
    await place.e2e.acceptRequest(toAlice);
    const again = await alice.e2e.seal(toBob, 'again', '', {});
    assert.equal(await nostrOnlyWay(alice.e2e, toBob, again, [again.packet])!(), 'nostr');
    await until(() => !alice.e2e.nostrAgainDue(Date.now() + NOSTR_AGAIN_MS).some((due) => due.tag === again.tag));
    assert.ok(texts().some(([text, nostr]) => text === 'again' && nostr));

    // What waited in the hidden chat goes there too, while the place is closed.
    await place.history.add({ peer: `contact:${toAlice}`, text: 'waited', mine: true, at: Date.now(), tag: newTag(), mark: WAITING });
    await until(() => came.some((m) => m.text === 'waited'));

    // Open, the chat screen hands its texts to Nostr, with no relay to go through.
    const release = await holdPlace(0, 1);
    const sealed = await place.e2e.seal(toAlice, 'hi Alice', '', {});
    assert.equal(await handOverHidden(place.e2e, null, toAlice, { sealed: { ...sealed, spare: sealed.spare ?? null }, packets: [sealed.packet] }, 'message', false), 'nostr');
    await until(() => came.some((m) => m.text === 'hi Alice'));
    release();
  } finally {
    stop();
    stopAlice();
    (await holdPlace(0, 1))();
    forgetPlaceChats();
    setCurrentSpace(null);
  }
});
