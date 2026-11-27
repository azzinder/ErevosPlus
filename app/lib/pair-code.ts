// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { canNostrChat, nostrKeys, pairCore, type Core } from './core';
import { decryptBytes, encryptBytes, fromHex, randomBytes, sha256Bytes, toHex, utf8Decode, utf8Encode } from './crypto';
import { t } from './i18n';
import { QUICK_RELAYS } from './link-quick';
import { authEvent, type NostrDmState } from './nostr-dm';
import { NostrRelay, type NostrEvent } from './nostr-dm-net';

// Adding a contact by a code of 8 digits said aloud or typed (app/chat.tsx, Pair with a code): one
// phone shows the code, the other types it, and each then has the other's contact link, as if
// each had scanned the other's QR code. Nothing of the code goes anywhere: the two phones agree on
// a key with it (crates/erevos-core/src/cpace.rs), and the links go encrypted with that key.
//
// The code: the first 3 digits say where the two meet (the channel), all 8 are the secret both
// prove they know. Where they meet is a Nostr key made from the channel (`boxKey`), whose wraps
// both read on QUICK_RELAYS, as linking a computer with the short code does (lib/link-nostr.ts);
// whoever knows the 3 digits can read and write there, and learns nothing by it but that someone
// pairs. In the wraps, JSON:
//   shower → box   {v:1, t:'hello', s: session (16 bytes), y: the shower's share, at}
//   typer → box    {v:1, t:'answer', s, y: the typer's share, to: the shower's share, k: proof, b: link}
//   shower → box   {v:1, t:'done', s, to: the typer's share, k: proof, b: link}, or
//                  {v:1, t:'wrong', s, to} when the typer's proof is not for the same code
// `k` is each side's tag (cpace confirm), `b` its contact link encrypted with a key from the
// shared key and its side, so only a phone that typed the same code opens it. A wrong code is
// found by the tags; each side takes PAIR_TRIES of them and then stops, so whoever guesses gets
// that many tries at 1 in 100,000, never a guess at home.
//
// Whoever watches the box (the 3 digits are no secret to one who watches all thousand) can write
// there too. A 'wrong' or a 'done' whose tag does not hold can be theirs, so it ends nothing at
// once on the phone that typed: it waits a while more (pairGrace) for the shower's 'done', and only then
// says the code is wrong. Their own hellos and answers do use up tries, as they must: each one is
// a guess at the code, so a watcher can only stop a pairing, which a new code then starts again.
//
// Shares, tags and links in hex. Self-contained but for the core, so it runs under plain Node for checks.

type Keys = Required<Pick<Core, 'nostrSecret' | 'nostrPublic' | 'nostrWrap' | 'nostrUnwrap'>>;

let keysOf: (() => Keys | null) | null = null;
let relaysOf: string[] | null = null;

/** For the checks: the core's Nostr calls, and the relays. */
export function setPairNet(keys: (() => Keys | null) | null, relays: string[] | null = null): void {
  keysOf = keys;
  relaysOf = relays;
}

function keys(): Keys {
  const got = keysOf ? keysOf() : nostrKeys();
  if (!got) throw new Error(t('This build of Erevos has no Nostr.'));
  return got;
}

const relays = (): string[] => relaysOf ?? QUICK_RELAYS;

/** The digits of a code. */
export const PAIR_DIGITS = 8;
/** The digits of it that say where the phones meet. */
const CHANNEL_DIGITS = 3;
/** How long a code shown lasts. */
export const PAIR_LASTS = 10 * 60_000;
/** How long the phone that typed a code waits to hear from the phone that shows it. */
export const PAIR_WAIT = 90_000;
/** How many wrong codes a side takes before it stops (crates/erevos-core cpace TRIES). */
export const PAIR_TRIES = 3;
/** How long the phone that typed a code still waits for a 'done' after a 'wrong' (see above). */
let pairGrace = 10_000;
/** For the checks: another wait than pairGrace's. */
export function setPairGrace(ms: number): void {
  pairGrace = ms;
}
/** The longest contact link that goes. */
const LINK_MOST = 16 * 1024;

const VERSION = 1;
const BOX = utf8Encode('erevos pair box v1');
const CHANNEL = utf8Encode('erevos pair v1 ');

/** A new code: 8 digits, each at random. */
export function newPairCode(): string {
  let code = '';
  while (code.length < PAIR_DIGITS) {
    for (const byte of randomBytes(16)) {
      // 250 is the largest multiple of 10 under 256: each digit as likely as the others.
      if (byte < 250 && code.length < PAIR_DIGITS) code += String(byte % 10);
    }
  }
  return code;
}

/** The code as typed, digits only, or null when it is not 8 digits: spaces and dashes are left out. */
export function readPairCode(text: string): string | null {
  const digits = text.replace(/[\s\-–.]/g, '');
  return new RegExp(`^[0-9]{${PAIR_DIGITS}}$`).test(digits) ? digits : null;
}

/** The code as shown: two groups of four. */
export function showPairCode(code: string): string {
  return `${code.slice(0, 4)} ${code.slice(4)}`;
}

/** The secret of the Nostr key the phones meet at for `code`: the same for the same first digits. */
export function boxKey(code: string): Uint8Array {
  return sha256Bytes(new Uint8Array([...BOX, ...utf8Encode(code.slice(0, CHANNEL_DIGITS))]));
}

const channelOf = (code: string) => new Uint8Array([...CHANNEL, ...utf8Encode(code.slice(0, CHANNEL_DIGITS))]);

/** The key a side's link is encrypted with, from the shared key. */
function linkKey(key: Uint8Array, started: boolean): Uint8Array {
  return sha256Bytes(new Uint8Array([...utf8Encode(started ? 'erevos pair link shower' : 'erevos pair link typer'), ...key]));
}

const flag = (on: boolean) => Uint8Array.of(on ? 1 : 0);
const HEX32 = /^[0-9a-f]{64}$/;
const HEX16 = /^[0-9a-f]{32}$/;
const HEX = /^(?:[0-9a-f]{2})+$/;

export type PairHello = { t: 'hello'; s: string; y: string; at: number };
export type PairAnswer = { t: 'answer'; s: string; y: string; to: string; k: string; b: string };
export type PairDone = { t: 'done'; s: string; to: string; k: string; b: string };
export type PairWrong = { t: 'wrong'; s: string; to: string };
export type PairMessage = PairHello | PairAnswer | PairDone | PairWrong;

/** What a wrap carries, as text. */
export function pairText(message: PairMessage): string {
  return JSON.stringify({ v: VERSION, ...message });
}

/** A message in shape, or null. */
export function readPair(text: string): PairMessage | null {
  if (text.length > 4 * LINK_MOST) return null;
  let v: Record<string, unknown>;
  try {
    v = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!v || typeof v !== 'object' || v.v !== VERSION || typeof v.s !== 'string' || !HEX16.test(v.s)) return null;
  const hex32 = (x: unknown): x is string => typeof x === 'string' && HEX32.test(x);
  const box = (x: unknown): x is string => typeof x === 'string' && HEX.test(x) && x.length <= 2 * (LINK_MOST + 28);
  const s = v.s;
  if (v.t === 'hello' && hex32(v.y) && typeof v.at === 'number' && Number.isFinite(v.at)) return { t: 'hello', s, y: v.y, at: v.at };
  if (v.t === 'answer' && hex32(v.y) && hex32(v.to) && hex32(v.k) && box(v.b)) return { t: 'answer', s, y: v.y, to: v.to, k: v.k, b: v.b };
  if (v.t === 'done' && hex32(v.to) && hex32(v.k) && box(v.b)) return { t: 'done', s, to: v.to, k: v.k, b: v.b };
  if (v.t === 'wrong' && hex32(v.to)) return { t: 'wrong', s, to: v.to };
  return null;
}

// The web core takes and gives the event as bytes, Android's as text. React Native is asked only
// when it is there, so the checks, in plain Node with the web core, can load this file.
const BYTES = (() => {
  try {
    return (require('react-native') as typeof import('react-native')).Platform.OS === 'web';
  } catch {
    return true;
  }
})();

function be8(n: number): Uint8Array {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigUint64(0, BigInt(Math.max(0, Math.round(n))));
  return out;
}

// What is asked of a relay starts this long before now: a wrap's time is set back by up to an hour.
const SINCE = 3600 + 600;
const RETRY = 5000;

/** The Nostr key both phones read and write at, for the first digits of a code. Exported for the checks, as a watcher. */
export class PairBox {
  private readonly secretKey: Uint8Array;
  private readonly key: string;
  private readonly take: (message: PairMessage) => void;
  private readonly relays = new Map<string, NostrRelay>();
  private readonly seen = new Set<string>();
  private readonly failed = new Set<string>();
  private readonly since = Math.floor(Date.now() / 1000) - SINCE;
  private stopped = false;
  private onDown: ((why: string) => void) | null = null;

  private constructor(secretKey: Uint8Array, key: string, take: (message: PairMessage) => void) {
    this.secretKey = secretKey;
    this.key = key;
    this.take = take;
  }

  static async open(code: string, take: (message: PairMessage) => void): Promise<PairBox> {
    const secretKey = boxKey(code);
    const box = new PairBox(secretKey, toHex(await keys().nostrPublic(secretKey)), take);
    for (const url of relays()) void box.read(url);
    return box;
  }

  whenDown(listener: (why: string) => void): void {
    this.onDown = listener;
    if (this.failed.size >= relays().length) listener(t('No Nostr server could be reached.'));
  }

  private async read(url: string): Promise<void> {
    while (!this.stopped) {
      try {
        const auth = canNostrChat() ? (relay: string, challenge: string) => authEvent({ secret: toHex(this.secretKey) } as NostrDmState, relay, challenge) : null;
        const relay = await NostrRelay.open(url, auth);
        if (this.stopped) return relay.close();
        this.relays.set(url, relay);
        this.failed.delete(url);
        relay.subscribe([{ kinds: [1059], '#p': [this.key], since: this.since }], (event) => void this.came(event));
        await relay.whenEnded();
        this.relays.delete(url);
      } catch {
        this.failed.add(url);
        if (this.failed.size >= relays().length) this.onDown?.(t('No Nostr server could be reached.'));
      }
      if (!this.stopped) await new Promise((resolve) => setTimeout(resolve, RETRY));
    }
  }

  private async came(event: NostrEvent): Promise<void> {
    if (this.stopped || this.seen.has(event.id)) return;
    this.seen.add(event.id);
    try {
      const json = JSON.stringify(event);
      const opened = await keys().nostrUnwrap(this.secretKey, (BYTES ? utf8Encode(json) : json) as string);
      // Its id (32 bytes) and time (8) first.
      const message = readPair(utf8Decode(opened.slice(40)));
      if (message && !this.stopped) this.take(message);
    } catch {
      // Not a wrap for this key, or not in shape.
    }
  }

  /** Sends `message` to the box: done once one relay took it. Throws when none did. */
  async send(message: PairMessage): Promise<void> {
    const wrapped = await keys().nostrWrap(fromHex(this.key), utf8Encode(pairText(message)), be8(Date.now() / 1000));
    const text = typeof wrapped === 'string' ? wrapped : utf8Decode(wrapped as unknown as Uint8Array);
    const event = JSON.parse(text) as NostrEvent;
    const tries = relays().map(async (url) => {
      const open = this.relays.get(url);
      const relay = open?.open ? open : await NostrRelay.open(url, null);
      try {
        const said = await relay.publish(event);
        if (!said.ok) throw new Error(said.why || t('The Nostr server did not take it.'));
      } finally {
        if (relay !== open) relay.close();
      }
    });
    await new Promise<void>((resolve, reject) => {
      let left = tries.length;
      for (const tried of tries) {
        tried.then(resolve, () => {
          left -= 1;
          if (left === 0) reject(new Error(t('No Nostr server took it.')));
        });
      }
    });
  }

  close(): void {
    this.stopped = true;
    for (const relay of this.relays.values()) relay.close();
    this.relays.clear();
  }
}

/** How a pairing ends: the other phone's contact link, or why not. */
export type PairEnd = { link: string } | { error: string };

/** A pairing under way: `done` once it ends, `stop` to end it first. */
export type Pairing = { done: Promise<PairEnd>; stop(): void };

async function sealLink(key: Uint8Array, started: boolean, link: string): Promise<string> {
  return toHex(encryptBytes(linkKey(key, started), utf8Encode(link)));
}

function openLink(key: Uint8Array, started: boolean, box: string): string | null {
  try {
    const link = utf8Decode(decryptBytes(linkKey(key, started), fromHex(box)));
    return link.length > 0 && link.length <= LINK_MOST ? link : null;
  } catch {
    return null;
  }
}

async function proofHolds(key: Uint8Array, started: boolean, tag: string): Promise<boolean> {
  try {
    await pairCore().pairConfirmed(key, flag(started), fromHex(tag));
    return true;
  } catch {
    return false;
  }
}

function ending(): { done: Promise<PairEnd>; end: (how: PairEnd) => void; ended: () => boolean } {
  let end: (how: PairEnd) => void = () => undefined;
  let over = false;
  const done = new Promise<PairEnd>((resolve) => {
    end = (how) => {
      if (over) return;
      over = true;
      resolve(how);
    };
  });
  return { done, end, ended: () => over };
}

const tooMany = () => ({ error: t('Too many wrong codes: this one is closed. Make a new one.') });

/**
 * Shows `code` (newPairCode) and waits, up to PAIR_LASTS, for the phone that types it: gives it
 * `ownLink` once it proved it typed the same code, and ends with its link.
 */
export async function showCode(code: string, ownLink: string): Promise<Pairing> {
  const core = pairCore();
  const session = randomBytes(16);
  const s = toHex(session);
  const both = await core.pairStart(utf8Encode(code), channelOf(code), session);
  const secret = both.slice(0, 32);
  const y = toHex(both.slice(32));
  const { done, end, ended } = ending();
  const answered = new Set<string>();
  let wrong = 0;
  let box: PairBox | null = null;
  const take = async (message: PairMessage) => {
    if (message.t !== 'answer' || message.s !== s || message.to !== y || answered.has(message.y) || ended() || !box) return;
    answered.add(message.y);
    let key: Uint8Array | null = null;
    try {
      key = await core.pairFinish(secret, session, fromHex(y), fromHex(message.y), flag(true));
    } catch {
      // Not a share.
    }
    const link = key && (await proofHolds(key, false, message.k)) ? openLink(key, false, message.b) : null;
    if (!key || !link) {
      wrong += 1;
      await box.send({ t: 'wrong', s, to: message.y }).catch(() => undefined);
      if (wrong >= PAIR_TRIES) end(tooMany());
      return;
    }
    try {
      await box.send({ t: 'done', s, to: message.y, k: toHex(await core.pairConfirm(key, flag(true))), b: await sealLink(key, true, ownLink) });
      end({ link });
    } catch (error) {
      end({ error: error instanceof Error ? error.message : String(error) });
    }
  };
  box = await PairBox.open(code, (message) => void take(message));
  box.whenDown((why) => end({ error: why }));
  const timer = setTimeout(() => end({ error: t('The code was not typed in time. Make a new one.') }), PAIR_LASTS);
  box.send({ t: 'hello', s, y, at: Date.now() }).catch((error: unknown) => end({ error: error instanceof Error ? error.message : String(error) }));
  void done.then(() => {
    clearTimeout(timer);
    box?.close();
  });
  return { done, stop: () => end({ error: '' }) };
}

/**
 * Types `code`, shown by the other phone: answers it with `ownLink`, sealed so only a phone that
 * shows the same code opens it, and ends with its link. Waits up to PAIR_WAIT.
 */
export async function typeCode(code: string, ownLink: string): Promise<Pairing> {
  const core = pairCore();
  const { done, end, ended } = ending();
  const started = Date.now();
  // The hellos answered, by session: this side's secret and share, and the shared key.
  const runs = new Map<string, { y: string; key: Uint8Array }>();
  let heardWrong = false;
  let tried = 0;
  let box: PairBox | null = null;
  const take = async (message: PairMessage) => {
    if (ended() || !box) return;
    if (message.t === 'hello') {
      // One shown while this side waits: an older one is a code that was shown before.
      if (runs.has(message.s) || message.at < started - PAIR_LASTS || tried >= PAIR_TRIES) return;
      tried += 1;
      const session = fromHex(message.s);
      const both = await core.pairStart(utf8Encode(code), channelOf(code), session);
      const y = toHex(both.slice(32));
      let key: Uint8Array;
      try {
        key = await core.pairFinish(both.slice(0, 32), session, fromHex(message.y), fromHex(y), flag(false));
      } catch {
        return;
      }
      runs.set(message.s, { y, key });
      await box
        .send({ t: 'answer', s: message.s, y, to: message.y, k: toHex(await core.pairConfirm(key, flag(false))), b: await sealLink(key, false, ownLink) })
        .catch((error: unknown) => end({ error: error instanceof Error ? error.message : String(error) }));
      return;
    }
    if (message.t !== 'done' && message.t !== 'wrong') return;
    const run = runs.get(message.s);
    if (!run || message.to !== run.y) return;
    const link = message.t === 'done' && (await proofHolds(run.key, true, message.k)) ? openLink(run.key, true, message.b) : null;
    if (link) return end({ link });
    // Maybe a watcher's: the run stays, for a 'done' that holds, and the code is said to be wrong
    // only once none came in pairGrace.
    if (heardWrong || ended()) return;
    heardWrong = true;
    const graceTimer = setTimeout(() => end({ error: t('The code is not the one the other phone shows.') }), pairGrace);
    void done.then(() => clearTimeout(graceTimer));
  };
  box = await PairBox.open(code, (message) => void take(message));
  box.whenDown((why) => end({ error: why }));
  const timer = setTimeout(() => end({ error: t('No phone answered that code. Check it, and that the other phone still shows it.') }), PAIR_WAIT);
  void done.then(() => {
    clearTimeout(timer);
    box?.close();
  });
  return { done, stop: () => end({ error: '' }) };
}
