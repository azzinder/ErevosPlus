// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Near me (lib/near-pair.ts): the frames, and phones that find each other on links of the checks'
// own, agree on a key with the real core, show the same pictures, and swap contact links once both
// owners said yes. Also what a phone in between, a lost frame and a forgotten pairing do.

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

import { contactLink, parseContact } from '../lib/contact-code';
import { pairCore, setCore, type Core } from '../lib/core';
import { randomBytes, toHex } from '../lib/crypto';
import { Nearby } from '../lib/nearby';
import {
  NEAR_EVER,
  NEAR_GONE,
  NEAR_LINGER,
  NEAR_MOST,
  NEAR_PICTURES,
  NearPair,
  nearCommit,
  nearFrame,
  nearPictures,
  nearSession,
  readNear,
  type NearEnd,
  type NearMessage,
} from '../lib/near-pair';
import { inviteLink, parseInvite } from '../lib/relay-invite';
import { parseWelcome, welcomeLink } from '../lib/welcome';

const N1 = '01'.repeat(16);
const N2 = '02'.repeat(16);
const H32 = 'ab'.repeat(32);

test('only a frame in shape is taken, and the other frames nearby are left alone', () => {
  for (const message of [
    { t: 'hello', n: N1 },
    { t: 'bye', n: N1 },
    { t: 'commit', n: N1, to: N2, c: H32 },
    { t: 'share', n: N2, to: N1, c: H32, y: H32 },
    { t: 'open', n: N1, to: N2, c: H32, y: H32 },
    { t: 'yes', n: N1, to: N2, c: H32, b: 'beef' },
    { t: 'got', n: N2, to: N1, c: H32 },
    { t: 'no', n: N2, to: N1, c: H32 },
  ] as NearMessage[]) {
    assert.deepEqual(readNear(nearFrame(message)), message);
  }
  for (const bad of [
    { v: 2, t: 'hello', n: N1 },
    { v: 1, t: 'hello', n: 'short' },
    { v: 1, t: 'commit', n: N1, to: N2 },
    { v: 1, t: 'commit', n: N1, to: N1, c: H32 },
    { v: 1, t: 'share', n: N1, to: N2, c: H32, y: 'xx' },
    { v: 1, t: 'yes', n: N1, to: N2, c: H32, b: 'not hex' },
    { v: 1, t: 'yes', n: N1, to: N2, c: H32, b: 'ab'.repeat(20_000) },
    { v: 1, t: 'other', n: N1, to: N2, c: H32 },
  ]) {
    assert.equal(readNear(`EVP1:${JSON.stringify(bad)}`), null, JSON.stringify(bad));
  }
  assert.equal(readNear('EVP1:not json'), null);
  assert.equal(readNear(`EVN1:${JSON.stringify({ v: 1, t: 'hello', n: N1 })}`), null);
  // What carries messages nearby (lib/nearby.ts) takes none of these for its own, nor a link from it.
  const nearby = new Nearby();
  assert.equal(nearby.frameIn('link', nearFrame({ t: 'hello', n: N1 })), null);
  assert.equal(nearby.count(), 0);
});

test('the pictures are six numbers under 64, the same for the same key', () => {
  const key = Uint8Array.from({ length: 64 }, (_, n) => n);
  const pictures = nearPictures(key);
  assert.equal(pictures.length, NEAR_PICTURES);
  for (const picture of pictures) assert.ok(Number.isInteger(picture) && picture >= 0 && picture < 64, String(pictures));
  assert.deepEqual(nearPictures(key), pictures);
  // Every one of the 64 comes up, in every place, over many keys.
  const seen = Array.from({ length: NEAR_PICTURES }, () => new Set<number>());
  for (let i = 0; i < 2000; i++) nearPictures(randomBytes(64)).forEach((picture, place) => seen[place].add(picture));
  for (const place of seen) assert.equal(place.size, 64);
  // The pairing's id hangs on both phones, in their order.
  assert.deepEqual(nearSession(N1, N2), nearSession(N1, N2));
  assert.notDeepEqual(nearSession(N1, N2), nearSession(N2, N1));
});

test('a phone in between has under one chance in ten million that both owners are shown the same pictures', () => {
  // Whoever goes first sees a key before it opens its share and may begin again unseen, so what
  // counts is how many keys a phone gives while its screen stays open, and how many pairings it
  // keeps at once: each new key on one side against those kept on the other (lib/near-pair.ts).
  const pairs = 2 * NEAR_EVER * NEAR_MOST;
  const sets = 64 ** NEAR_PICTURES;
  assert.ok(pairs / sets < 1e-7, `${pairs} pairs of keys for ${sets} sets of pictures`);
});

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built) && typeof (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>).pairStart === 'function';
if (!coreReady) console.log('Skipping Near me between phones: build the core first with node checks/build-core.mjs');

before(() => {
  if (!coreReady) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => fn(...args)])) as unknown as Core);
});

after(() => {
  setCore(null);
});

type Sent = { from: string; link: string; text: string; message: NearMessage | null };

/** The air between the checks' phones: links in pairs, and frames that come only once `settle` hands them over. */
class Air {
  readonly phones = new Map<string, NearPair>();
  readonly clocks = new Map<string, number>();
  readonly ends = new Map<string, NearEnd[]>();
  readonly sent: Sent[] = [];
  /** A frame this says true for is lost on its way. */
  lose: (sent: Sent) => boolean = () => false;
  private readonly wires = new Map<string, { to: string; as: string }>();
  private waiting: (() => void)[] = [];

  /** A phone named `name`, whose `n` is `nonce`, or a random one. */
  phone(name: string, nonce?: string): NearPair {
    this.clocks.set(name, 1_000_000);
    this.ends.set(name, []);
    const pair = new NearPair({
      send: (link, text) => this.send(name, link, text),
      own: () => ({ link: `erevos://contact?link=of-${name}`, name: `Owner of ${name}` }),
      onDone: (end) => this.ends.get(name)!.push(end),
      now: () => this.clocks.get(name)!,
      nonce,
    });
    this.phones.set(name, pair);
    return pair;
  }

  /** A link between two phones, up on both: `tag` tells a second one between the same two apart. One of the two may be no phone of the checks: what goes to it is only kept in `sent`. */
  link(a: string, b: string, tag = ''): void {
    this.wires.set(`${a}|to-${b}${tag}`, { to: b, as: `to-${a}${tag}` });
    this.wires.set(`${b}|to-${a}${tag}`, { to: a, as: `to-${b}${tag}` });
    this.phones.get(a)?.linkUp(`to-${b}${tag}`);
    this.phones.get(b)?.linkUp(`to-${a}${tag}`);
  }

  /** The link between two phones goes down. */
  cut(a: string, b: string, tag = ''): void {
    this.wires.delete(`${a}|to-${b}${tag}`);
    this.wires.delete(`${b}|to-${a}${tag}`);
  }

  /** A frame from one that is no phone of the checks, as if it came on `link` at `to`. */
  inject(to: string, link: string, message: NearMessage): void {
    this.waiting.push(() => void this.phones.get(to)!.frameIn(link, nearFrame(message)));
  }

  private send(from: string, link: string, text: string): boolean {
    const wire = this.wires.get(`${from}|${link}`);
    if (!wire) return false;
    const sent = { from, link, text, message: readNear(text) };
    this.sent.push(sent);
    if (!this.lose(sent)) this.waiting.push(() => void this.phones.get(wire.to)?.frameIn(wire.as, text));
    return true;
  }

  /** Hands over all that is on its way, and what that makes the phones say, until nothing moves. */
  async settle(): Promise<void> {
    for (let round = 0; round < 200; round++) {
      const now = this.waiting;
      this.waiting = [];
      for (const hand of now) hand();
      for (const phone of this.phones.values()) await phone.idle();
      // Twice: a phone may have been given work while another's was awaited.
      for (const phone of this.phones.values()) await phone.idle();
      if (this.waiting.length === 0) return;
    }
    throw new Error('The phones never stop talking');
  }

  /** Time goes by on the phones named (all of them when none is): `ms` more, and then what time does. */
  async pass(ms: number, ...names: string[]): Promise<void> {
    for (const name of names.length ? names : [...this.phones.keys()]) {
      this.clocks.set(name, this.clocks.get(name)! + ms);
      this.phones.get(name)!.tick();
    }
    await this.settle();
  }

  said(from: string, t: NearMessage['t']): Sent[] {
    return this.sent.filter((sent) => sent.from === from && sent.message?.t === t);
  }
}

test('two phones beside each other show the same pictures, and both yeses give each the other’s link and name', { skip: !coreReady }, async () => {
  const air = new Air();
  const [a, b] = [air.phone('a', N1), air.phone('b', N2)];
  air.link('a', 'b');
  await air.settle();
  assert.equal(a.linked(), 1);
  const [foundA, foundB] = [a.found(), b.found()];
  assert.equal(foundA.length, 1);
  assert.equal(foundB.length, 1);
  assert.deepEqual(foundA[0].pictures, foundB[0].pictures);
  assert.equal(foundA[0].id, foundB[0].id);
  assert.equal(foundA[0].pictures.length, NEAR_PICTURES);
  assert.deepEqual([foundA[0].waiting, foundA[0].refused, foundA[0].aside], [false, false, false]);
  // Nothing that names an owner went yet.
  for (const sent of air.sent) assert.ok(['hello', 'commit', 'share', 'open'].includes(sent.message?.t ?? ''), sent.text);
  a.yes(foundA[0].id);
  await air.settle();
  assert.equal(a.found()[0].waiting, true);
  assert.equal(b.found()[0].waiting, false);
  assert.deepEqual(air.ends.get('a'), []);
  assert.deepEqual(air.ends.get('b'), []);
  b.yes(foundB[0].id);
  await air.settle();
  assert.deepEqual(air.ends.get('a'), [{ link: 'erevos://contact?link=of-b', name: 'Owner of b' }]);
  assert.deepEqual(air.ends.get('b'), [{ link: 'erevos://contact?link=of-a', name: 'Owner of a' }]);
  assert.deepEqual(a.found(), []);
  assert.deepEqual(b.found(), []);
  // No link and no name in the clear, ever.
  for (const sent of air.sent) assert.ok(!sent.text.includes('of-') && !sent.text.includes('Owner'), sent.text);
  await Promise.all([a.stop(), b.stop()]);
});

test('a yes alone gives nothing away to the owner beside, and taken back it counts no more', { skip: !coreReady }, async () => {
  const air = new Air();
  const [a, b] = [air.phone('a', N1), air.phone('b', N2)];
  air.link('a', 'b');
  await air.settle();
  const id = a.found()[0].id;
  a.yes(id);
  await air.settle();
  // Taken back: b's yes then ends nothing, on either phone.
  a.no(id, false);
  await air.settle();
  assert.deepEqual([a.found()[0].waiting, a.found()[0].aside], [false, false]);
  b.yes(id);
  await air.settle();
  assert.deepEqual(air.ends.get('a'), []);
  assert.deepEqual(air.ends.get('b'), []);
  assert.equal(b.found()[0].waiting, true);
  // And said again, both end.
  a.yes(id);
  await air.settle();
  assert.equal(air.ends.get('a')!.length, 1);
  assert.equal(air.ends.get('b')!.length, 1);
  await Promise.all([a.stop(), b.stop()]);
});

test('No, others sets a phone aside, tells the one that waits, and it shows again when asked', { skip: !coreReady }, async () => {
  const air = new Air();
  const [a, b, c] = [air.phone('a', N1), air.phone('b', N2), air.phone('c')];
  air.link('a', 'b');
  air.link('a', 'c');
  await air.settle();
  assert.equal(a.found().length, 2);
  const [first, second] = a.found();
  assert.notDeepEqual(first.pictures, second.pictures);
  const other = b.found()[0].id === first.id ? b : c;
  other.yes(first.id);
  await air.settle();
  a.no(first.id);
  await air.settle();
  // Set aside, it comes last; and the phone that said yes waits no more.
  assert.deepEqual(a.found().map((found) => [found.id, found.aside]), [[second.id, false], [first.id, true]]);
  assert.deepEqual([other.found()[0].waiting, other.found()[0].refused], [false, true]);
  a.again();
  assert.deepEqual(a.found().map((found) => found.aside), [false, false]);
  // Compared again, and yes on both: done, and the refusal is forgotten.
  other.yes(first.id);
  a.yes(first.id);
  await air.settle();
  assert.equal(air.ends.get('a')!.length, 1);
  assert.deepEqual(a.found().map((found) => found.id), [second.id]);
  await Promise.all([a.stop(), b.stop(), c.stop()]);
});

test('a phone in between shows each side other pictures', { skip: !coreReady }, async () => {
  const air = new Air();
  const [a, b, between] = [air.phone('a', N1), air.phone('b', N2), air.phone('between')];
  // No link from a to b: each reaches only the one in between, which pairs with both.
  air.link('a', 'between');
  air.link('between', 'b');
  await air.settle();
  assert.equal(between.found().length, 2);
  assert.notDeepEqual(a.found()[0].pictures, b.found()[0].pictures);
  assert.notEqual(a.found()[0].id, b.found()[0].id);
  await Promise.all([a.stop(), b.stop(), between.stop()]);
});

test('one that opens another share than it promised is not taken', { skip: !coreReady }, async () => {
  const air = new Air();
  // The phone goes second: the cheat has the lower n, and goes first.
  const phone = air.phone('phone', N2);
  const session = nearSession(N1, N2);
  const share = async () => toHex((await pairCore().pairStart(new TextEncoder().encode('erevos near v1'), new TextEncoder().encode('erevos near v1 channel'), session)).slice(32));
  const [promised, chosen] = [await share(), await share()];
  const c = nearCommit(session, promised);
  air.link('phone', 'cheat');
  air.inject('phone', 'to-cheat', { t: 'hello', n: N1 });
  air.inject('phone', 'to-cheat', { t: 'commit', n: N1, to: N2, c });
  await air.settle();
  assert.equal(air.said('phone', 'share').length, 1);
  // Having seen the phone's share, it opens another than the one it gave the hash of.
  air.inject('phone', 'to-cheat', { t: 'open', n: N1, to: N2, c, y: chosen });
  await air.settle();
  assert.deepEqual(phone.found(), []);
  // The one promised still goes.
  air.inject('phone', 'to-cheat', { t: 'open', n: N1, to: N2, c, y: promised });
  await air.settle();
  assert.equal(phone.found().length, 1);
  // What is no share at all ends it, and that one is not paired with again.
  const other = air.phone('other', N2);
  air.link('other', 'cheat');
  const junk = 'ff'.repeat(32);
  air.inject('other', 'to-cheat', { t: 'commit', n: N1, to: N2, c: nearCommit(session, junk) });
  air.inject('other', 'to-cheat', { t: 'open', n: N1, to: N2, c: nearCommit(session, junk), y: junk });
  air.inject('other', 'to-cheat', { t: 'hello', n: N1 });
  await air.settle();
  assert.deepEqual(other.found(), []);
  assert.equal(air.said('other', 'share').length, 1);
  await Promise.all([phone.stop(), other.stop()]);
});

test('a share is used for one pairing only: one that begins again gets another', { skip: !coreReady }, async () => {
  const air = new Air();
  // The phone goes first here: the cheat, with the higher n, answers with a share, then with another.
  const phone = air.phone('phone', N1);
  const session = nearSession(N1, N2);
  const share = async () => toHex((await pairCore().pairStart(new TextEncoder().encode('erevos near v1'), new TextEncoder().encode('erevos near v1 channel'), session)).slice(32));
  air.link('phone', 'cheat');
  air.inject('phone', 'to-cheat', { t: 'hello', n: N2 });
  await air.settle();
  const c1 = (air.said('phone', 'commit')[0].message as { c: string }).c;
  air.inject('phone', 'to-cheat', { t: 'share', n: N2, to: N1, c: c1, y: await share() });
  await air.settle();
  const opened = air.said('phone', 'open').map((sent) => (sent.message as { y: string }).y);
  assert.equal(opened.length, 1);
  const before = phone.found();
  assert.equal(before.length, 1);
  // Now that it has seen the phone's share, another of its own for the same hash: the phone does
  // not go on with the share it showed, it begins again with a new one, and new pictures.
  air.inject('phone', 'to-cheat', { t: 'share', n: N2, to: N1, c: c1, y: await share() });
  await air.settle();
  assert.deepEqual(phone.found(), []);
  const c2 = (air.said('phone', 'commit').at(-1)!.message as { c: string }).c;
  assert.notEqual(c2, c1);
  air.inject('phone', 'to-cheat', { t: 'share', n: N2, to: N1, c: c2, y: await share() });
  await air.settle();
  const again = air.said('phone', 'open').map((sent) => (sent.message as { y: string }).y);
  assert.equal(again.length, 2);
  assert.notEqual(again[1], again[0]);
  assert.equal(phone.found().length, 1);
  assert.notEqual(phone.found()[0].id, before[0].id);
  // A yes for the pictures of before finds nothing to say yes to.
  phone.yes(before[0].id);
  await air.settle();
  assert.equal(air.said('phone', 'yes').length, 0);
  // And the same from the other side: another hash from the one that goes first, and the phone's share is new.
  const second = air.phone('second', N2);
  air.link('second', 'cheat');
  air.inject('second', 'to-cheat', { t: 'commit', n: N1, to: N2, c: 'aa'.repeat(32) });
  air.inject('second', 'to-cheat', { t: 'commit', n: N1, to: N2, c: 'bb'.repeat(32) });
  await air.settle();
  const shares = air.said('second', 'share').map((sent) => (sent.message as { y: string }).y);
  assert.equal(shares.length, 2);
  assert.notEqual(shares[0], shares[1]);
  await Promise.all([phone.stop(), second.stop()]);
});

for (const forgets of ['a', 'b']) {
  test(`when the phone that goes ${forgets === 'a' ? 'first' : 'second'} forgets a pairing, both begin again and show the same new pictures`, { skip: !coreReady }, async () => {
    const air = new Air();
    const [a, b] = [air.phone('a', N1), air.phone('b', N2)];
    air.link('a', 'b');
    await air.settle();
    const was = a.found()[0];
    const keeps = forgets === 'a' ? 'b' : 'a';
    // The one that keeps it had even said yes.
    air.phones.get(keeps)!.yes(was.id);
    await air.settle();
    // The link is down for a while, and only one of the two gives the other up.
    air.cut('a', 'b');
    await air.pass(NEAR_GONE + 1, forgets);
    assert.deepEqual(air.phones.get(forgets)!.found(), []);
    assert.equal(air.phones.get(keeps)!.found().length, 1);
    air.link('a', 'b');
    await air.settle();
    for (let i = 0; i < 3; i++) await air.pass(3000);
    const [foundA, foundB] = [a.found(), b.found()];
    assert.equal(foundA.length, 1);
    assert.equal(foundB.length, 1);
    assert.deepEqual(foundA[0].pictures, foundB[0].pictures);
    assert.equal(foundA[0].id, foundB[0].id);
    assert.notEqual(foundA[0].id, was.id);
    // The yes was for the pictures of before: it counts no more.
    assert.deepEqual([foundA[0].waiting, foundB[0].waiting], [false, false]);
    a.yes(foundA[0].id);
    b.yes(foundB[0].id);
    await air.settle();
    assert.equal(air.ends.get('a')!.length, 1);
    assert.equal(air.ends.get('b')!.length, 1);
    await Promise.all([a.stop(), b.stop()]);
  });
}

test('a frame lost on its way goes again with the next hello', { skip: !coreReady }, async () => {
  for (const lost of ['commit', 'share', 'open', 'yes', 'got'] as const) {
    const air = new Air();
    const [a, b] = [air.phone('a', N1), air.phone('b', N2)];
    let dropped = 0;
    air.lose = (sent) => sent.message?.t === lost && dropped++ === 0;
    air.link('a', 'b');
    await air.settle();
    for (let i = 0; i < 2 && a.found().length + b.found().length < 2; i++) await air.pass(3000);
    assert.equal(a.found().length, 1, lost);
    assert.equal(b.found().length, 1, lost);
    a.yes(a.found()[0].id);
    b.yes(b.found()[0].id);
    await air.settle();
    for (let i = 0; i < 2; i++) await air.pass(3000);
    assert.equal(air.ends.get('a')!.length, 1, lost);
    assert.equal(air.ends.get('b')!.length, 1, lost);
    assert.equal(dropped > 0, true, lost);
    await Promise.all([a.stop(), b.stop()]);
  }
});

test('two links between the same two phones make one pairing', { skip: !coreReady }, async () => {
  const air = new Air();
  const [a, b] = [air.phone('a', N1), air.phone('b', N2)];
  air.link('a', 'b');
  air.link('a', 'b', '-wifi');
  await air.settle();
  assert.equal(a.linked(), 2);
  assert.equal(a.found().length, 1);
  assert.equal(b.found().length, 1);
  assert.deepEqual(a.found()[0].pictures, b.found()[0].pictures);
  // One of them goes down: what follows goes on the other.
  air.cut('a', 'b');
  a.yes(a.found()[0].id);
  b.yes(b.found()[0].id);
  await air.settle();
  await air.pass(3000);
  assert.equal(air.ends.get('a')!.length, 1);
  assert.equal(air.ends.get('b')!.length, 1);
  await Promise.all([a.stop(), b.stop()]);
});

test('a screen pairs with a few phones at once, and makes only so many shares while it stays open', { skip: !coreReady }, async () => {
  const air = new Air();
  const phone = air.phone('phone', N1);
  for (let i = 0; i < NEAR_MOST + 3; i++) {
    air.phone(`p${i}`);
    air.link('phone', `p${i}`);
  }
  await air.settle();
  assert.equal(phone.found().length, NEAR_MOST);
  await phone.stop();
  // One link that says it is many phones gets a few pairings, no more.
  const one = air.phone('one', N1);
  air.link('one', 'crowd');
  for (let i = 0; i < 10; i++) air.inject('one', 'to-crowd', { t: 'hello', n: toHex(Uint8Array.from({ length: 16 }, () => 0x80 + i)) });
  await air.settle();
  assert.equal(air.said('one', 'commit').length, 3);
  await one.stop();
  // Phones that come and go: each is a share, until the screen made all it may.
  const many = air.phone('many', N1);
  air.link('many', 'crowd');
  for (let i = 0; i < NEAR_EVER + 10; i++) {
    const n = toHex(Uint8Array.from({ length: 16 }, (_, at) => (at === 0 ? 0x80 : i + 1)));
    air.inject('many', 'to-crowd', { t: 'hello', n });
    air.inject('many', 'to-crowd', { t: 'bye', n });
  }
  await air.settle();
  assert.equal(many.spent(), true);
  assert.equal(new Set(air.said('many', 'commit').map((sent) => (sent.message as { c: string }).c)).size, NEAR_EVER);
  await many.stop();
});

test('closing the screen tells the phones nearby, and a yes still on its way arrives first', { skip: !coreReady }, async () => {
  const air = new Air();
  const [a, b] = [air.phone('a', N1), air.phone('b', N2)];
  air.link('a', 'b');
  await air.settle();
  // Closed with nothing said: the other no longer shows it.
  await a.stop();
  await air.settle();
  assert.equal(air.said('a', 'bye').length, 1);
  assert.deepEqual(b.found(), []);
  // Opened again, it is another phone to those nearby, with other pictures.
  const again = air.phone('a', N1.replace(/^01/, '03'));
  air.link('a', 'b');
  await air.settle();
  await air.pass(3000);
  const id = again.found()[0].id;
  assert.equal(b.found()[0].id, id);
  b.yes(id);
  await air.settle();
  // Its yes is lost, and the screen closes as it ends: it still answers until the yes came.
  air.lose = (sent) => sent.from === 'a' && sent.message?.t === 'yes';
  again.yes(id);
  await air.settle();
  assert.equal(air.ends.get('a')!.length, 1);
  assert.deepEqual(air.ends.get('b'), []);
  let closed = false;
  const closing = again.stop().then(() => (closed = true));
  await air.settle();
  assert.equal(closed, false);
  air.lose = () => false;
  await air.pass(3000);
  assert.equal(air.ends.get('b')!.length, 1);
  await closing;
  assert.equal(closed, true);
  // And with no one to hear it, it closes all the same after a while.
  const [c, d] = [air.phone('c', N1), air.phone('d', N2)];
  air.link('c', 'd');
  await air.settle();
  d.yes(d.found()[0].id);
  await air.settle();
  air.cut('c', 'd');
  c.yes(c.found()[0].id);
  await air.settle();
  assert.equal(air.ends.get('c')!.length, 1);
  let over = false;
  const ending = c.stop().then(() => (over = true));
  await air.settle();
  assert.equal(over, false);
  await air.pass(NEAR_LINGER + 1, 'c');
  await ending;
  assert.equal(over, true);
  await Promise.all([b.stop(), d.stop()]);
});

// The owners said yes to a contact. A link pasted by hand may also be an invite to a relay or a
// welcome, which a phone with no relay takes at once (app/chat.tsx addContact): not from a pairing.
test('what a pairing hands over is taken as a contact link only, never as an invite to a relay or a welcome', () => {
  const contact = contactLink({ senderHex: 'ab'.repeat(24), relayUrl: 'wss://relay.example', key: 'k'.repeat(43) });
  const invite = inviteLink({ relayUrl: 'wss://relay.example', code: 'cd'.repeat(32) });
  const welcome = welcomeLink(contact, { code: 'cd'.repeat(32), hi: 'ef'.repeat(16), name: 'Anna' });
  assert.ok(parseContact(contact) && parseInvite(invite) && parseWelcome(welcome));
  // The reader the pairings use reads neither, however they are wrapped.
  for (const other of [invite, welcome, ` ${invite}\n`, `${welcome} `]) assert.equal(parseContact(other), null);

  // The screens: the pictures' link and both ends of the code of 8 digits go the contact's way.
  const chat = readFileSync(join(import.meta.dirname, '..', 'app', 'chat.tsx'), 'utf8');
  for (const taken of [
    'onJoined={(end) => void addPaired(end.link, end.name)}',
    'onCodeLink={(link) => void addPaired(link)}',
    'onLink={(link) => void addPaired(link)}',
  ]) {
    assert.ok(chat.includes(taken), taken);
  }
  const [contactAt, pairedAt] = [chat.indexOf('  function addContactLink('), chat.indexOf('  function addPaired(')];
  assert.ok(contactAt > 0 && pairedAt > contactAt);
  const paired = chat.slice(pairedAt, chat.indexOf('\n  }\n', pairedAt));
  assert.ok(paired.includes('return addContactLink(link.trim(), said);'));
  // And that way reads a contact link, and takes nothing else.
  const way = chat.slice(contactAt, pairedAt);
  assert.ok(way.includes('const code = parseContact(text);'));
  assert.ok(!/parseInvite|parseWelcome|parseTextInvite|joinRelay|takeWelcome|takeTextInvite|pastedLink/.test(way));
});
